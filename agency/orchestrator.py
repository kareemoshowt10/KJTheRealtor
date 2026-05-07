"""
Orchestrator — solo real estate lead-gen agency controller.

Pipeline (daily):
  Scout → Diagnoser → Builder (top 5) → Filmer → Checker → Pitcher
  Mobile runs continuously, handles replies in real-time.

Rules enforced here:
  - Never let 2 sub-agents touch 1 lead (lead-level locking via locks.json)
  - Stop & flag human for deals >$3,000 or niche reply rate <12%
  - All state via shared JSON files only
"""

import json
import logging
import os
import sys
import time
from datetime import date, datetime
from pathlib import Path

# Allow imports from agency/
sys.path.insert(0, str(Path(__file__).parent))

from agents import Scout, Diagnoser, Builder, Filmer, Checker, Pitcher, Mobile
from agents.base import load_state, save_state

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s — %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(Path(__file__).parent / "logs" / "orchestrator.log"),
    ],
)
log = logging.getLogger("orchestrator")

STATE_DIR = Path(__file__).parent / "state"
FLAGS_FILE = STATE_DIR / "flags.json"

DEAL_APPROVAL_THRESHOLD = 3000
REPLY_RATE_THRESHOLD = 0.12
TOP_N_FOR_BUILDER = 5


# ─── Lead Locking ────────────────────────────────────────────────────────────

def _load_locks() -> dict:
    if FLAGS_FILE.parent.joinpath("locks.json").exists():
        try:
            return json.loads(FLAGS_FILE.parent.joinpath("locks.json").read_text())
        except Exception:
            pass
    return {}


def _save_locks(locks: dict) -> None:
    (STATE_DIR / "locks.json").write_text(json.dumps(locks, indent=2))


def is_locked(lead_id: str) -> bool:
    locks = _load_locks()
    lock = locks.get(lead_id)
    if not lock:
        return False
    # Expire locks older than 30 minutes (stuck agent protection)
    locked_at = datetime.fromisoformat(lock["locked_at"])
    age_seconds = (datetime.utcnow() - locked_at).total_seconds()
    if age_seconds > 1800:
        release_lock(lead_id)
        return False
    return True


def acquire_lock(lead_id: str, agent: str) -> bool:
    if is_locked(lead_id):
        return False
    locks = _load_locks()
    locks[lead_id] = {"agent": agent, "locked_at": datetime.utcnow().isoformat()}
    _save_locks(locks)
    return True


def release_lock(lead_id: str) -> None:
    locks = _load_locks()
    locks.pop(lead_id, None)
    _save_locks(locks)


# ─── Human Flagging ──────────────────────────────────────────────────────────

def flag_human(lead_id: str, reason: str, data: dict) -> None:
    flags = {}
    if FLAGS_FILE.exists():
        try:
            flags = json.loads(FLAGS_FILE.read_text())
        except Exception:
            pass
    flags[lead_id] = {
        "reason": reason,
        "data": data,
        "flagged_at": datetime.utcnow().isoformat(),
        "resolved": False,
    }
    FLAGS_FILE.write_text(json.dumps(flags, indent=2))
    log.warning(f"[HUMAN FLAG] Lead {lead_id} flagged: {reason}")
    # In production: send a push notification or Slack alert here


def load_flags() -> dict:
    if not FLAGS_FILE.exists():
        return {}
    try:
        return json.loads(FLAGS_FILE.read_text())
    except Exception:
        return {}


# ─── Metrics ─────────────────────────────────────────────────────────────────

def compute_reply_rates(pitched: dict, replies: dict, today: str) -> dict[str, float]:
    """Compute reply rate per niche for today's pitched messages."""
    niche_pitched: dict[str, int] = {}
    niche_replied: dict[str, int] = {}

    for lead_id, pitch in pitched.items():
        if pitch.get("pitched_at", "")[:10] != today:
            continue
        if not pitch.get("sent"):
            continue
        niche = pitch.get("niche", "unknown")
        niche_pitched[niche] = niche_pitched.get(niche, 0) + 1

        reply = replies.get(lead_id, {})
        if reply.get("classification") in ("positive", "question"):
            niche_replied[niche] = niche_replied.get(niche, 0) + 1

    rates = {}
    for niche, count in niche_pitched.items():
        replied = niche_replied.get(niche, 0)
        rates[niche] = replied / count if count > 0 else 0.0

    return rates


# ─── Pipeline Steps ──────────────────────────────────────────────────────────

def step_scout(scout: Scout, today: str) -> list[dict]:
    queue = load_state("queue")
    if queue.get("date") == today:
        log.info(f"Scout already ran today ({len(queue.get('leads', []))} leads in queue)")
        return queue.get("leads", [])

    log.info("Running Scout...")
    leads = scout.run()
    existing_leads = queue.get("leads", [])
    existing_ids = {l["id"] for l in existing_leads}
    new_leads = [l for l in leads if l["id"] not in existing_ids]
    all_leads = existing_leads + new_leads

    save_state("queue", {"date": today, "leads": all_leads, "updated_at": datetime.utcnow().isoformat()})
    log.info(f"Scout done: {len(new_leads)} new leads (total {len(all_leads)})")
    return all_leads


def step_diagnose(diagnoser: Diagnoser, leads: list[dict]) -> dict:
    diagnosed = load_state("diagnosed")
    new_count = 0

    for lead in leads:
        lead_id = lead["id"]
        if lead_id in diagnosed:
            continue
        if not acquire_lock(lead_id, "diagnoser"):
            log.debug(f"Lead {lead_id} locked, skipping")
            continue
        try:
            result = diagnoser.run(lead)
            diagnosed[lead_id] = result
            new_count += 1
        except Exception as e:
            log.error(f"Diagnoser error for {lead.get('name')}: {e}")
        finally:
            release_lock(lead_id)

    save_state("diagnosed", diagnosed)
    log.info(f"Diagnoser done: {new_count} new diagnoses ({len(diagnosed)} total)")
    return diagnosed


def step_build(builder: Builder, diagnosed: dict) -> dict:
    built = load_state("built")
    already_built_ids = set(built.keys())

    # Select top-N unbuilt leads by score, skipping flagged deals
    flags = load_flags()
    flagged_ids = set(flags.keys())

    eligible = [
        d for lid, d in diagnosed.items()
        if lid not in already_built_ids and lid not in flagged_ids
    ]
    eligible.sort(key=lambda x: x.get("score", 0), reverse=True)
    top5 = eligible[:TOP_N_FOR_BUILDER]

    for lead in top5:
        lead_id = lead["id"]
        if not acquire_lock(lead_id, "builder"):
            continue
        try:
            result = builder.run(lead)
            built[lead_id] = result
        except Exception as e:
            log.error(f"Builder error for {lead.get('name')}: {e}")
        finally:
            release_lock(lead_id)

    save_state("built", built)
    log.info(f"Builder done: {len(built)} total mockups")
    return built


def step_film(filmer: Filmer, built: dict) -> dict:
    filmed = load_state("filmed")

    for lead_id, lead_data in built.items():
        if lead_id in filmed:
            continue
        if not acquire_lock(lead_id, "filmer"):
            continue
        try:
            result = filmer.run(lead_data)
            filmed[lead_id] = result
        except Exception as e:
            log.error(f"Filmer error for {lead_data.get('name')}: {e}")
        finally:
            release_lock(lead_id)

    save_state("filmed", filmed)
    log.info(f"Filmer done: {len(filmed)} total videos")
    return filmed


def step_check_and_pitch(
    checker: Checker,
    pitcher: Pitcher,
    diagnosed: dict,
    built: dict,
    filmed: dict,
    today: str,
) -> dict:
    pitched = load_state("pitched")
    flags = load_flags()

    new_pitches = 0
    for lead_id, diag in diagnosed.items():
        # Only pitch leads that have been built + filmed (or just diagnosed for non-top-5)
        has_mockup = lead_id in built
        has_video = lead_id in filmed

        # Skip if already pitched today
        if lead_id in pitched and pitched[lead_id].get("pitched_at", "")[:10] == today:
            continue

        # Skip flagged leads
        if lead_id in flags and not flags[lead_id].get("resolved"):
            continue

        # Deal size gate
        est_value = diag.get("est_deal_value", 0)
        if est_value > DEAL_APPROVAL_THRESHOLD:
            flag_human(lead_id, f"deal_value_${est_value:.0f}", diag)
            continue

        # Assemble full lead data
        lead_data = {**diag}
        if has_mockup:
            lead_data.update(built[lead_id])
        if has_video:
            lead_data.update(filmed[lead_id])

        if not acquire_lock(lead_id, "checker"):
            continue

        try:
            check_result = checker.run(lead_data)
            if check_result.get("revised_message"):
                lead_data["cold_message"] = check_result["revised_message"]

            if not check_result["approved"]:
                log.warning(
                    f"Checker BLOCKED {diag.get('name')}: {'; '.join(check_result.get('issues', []))}"
                )
                release_lock(lead_id)
                continue
        except Exception as e:
            log.error(f"Checker error for {diag.get('name')}: {e}")
            release_lock(lead_id)
            continue

        # Hand off to Pitcher (same lock — only one agent touches a lead at a time)
        try:
            result = pitcher.run(lead_data)
            pitched[lead_id] = {**result, "pitched_at": datetime.utcnow().isoformat()}
            new_pitches += 1
        except Exception as e:
            log.error(f"Pitcher error for {diag.get('name')}: {e}")
        finally:
            release_lock(lead_id)

    save_state("pitched", pitched)
    log.info(f"Pitcher done: {new_pitches} new pitches sent ({len(pitched)} total)")
    return pitched


def step_handle_replies(mobile: Mobile) -> None:
    try:
        new_replies = mobile.poll_inbound_replies()
        for reply in new_replies:
            mobile.handle_reply(reply)
        if new_replies:
            log.info(f"Mobile handled {len(new_replies)} new replies")
    except Exception as e:
        log.error(f"Mobile reply handler error: {e}")


def step_check_reply_rates(pitched: dict, today: str) -> None:
    replies = load_state("replies")
    rates = compute_reply_rates(pitched, replies, today)

    metrics = load_state("metrics")
    day = metrics.setdefault(today, {})
    day["reply_rates"] = rates
    day["computed_at"] = datetime.utcnow().isoformat()
    save_state("metrics", metrics)

    for niche, rate in rates.items():
        if rate < REPLY_RATE_THRESHOLD:
            pitched_count = sum(
                1 for p in pitched.values()
                if p.get("niche") == niche and p.get("pitched_at", "")[:10] == today and p.get("sent")
            )
            if pitched_count >= 5:  # Only flag if statistically meaningful
                flag_human(
                    f"niche_rate_{niche}_{today}",
                    f"reply_rate_below_threshold",
                    {
                        "niche": niche,
                        "rate": rate,
                        "threshold": REPLY_RATE_THRESHOLD,
                        "pitched_today": pitched_count,
                    },
                )
                log.warning(f"[HUMAN FLAG] Niche '{niche}' reply rate {rate:.1%} < {REPLY_RATE_THRESHOLD:.0%}")
        else:
            log.info(f"Niche '{niche}' reply rate: {rate:.1%}")


# ─── Main Loop ────────────────────────────────────────────────────────────────

def run_pipeline_once() -> None:
    today = str(date.today())
    log.info(f"=== Pipeline run start: {today} ===")

    scout = Scout()
    diagnoser = Diagnoser()
    builder = Builder()
    filmer = Filmer()
    checker = Checker()
    pitcher = Pitcher()
    mobile = Mobile()

    # 1. Scout
    leads = step_scout(scout, today)
    if not leads:
        log.warning("No leads in queue — Scout may have failed or hit API limits")
        return

    # 2. Diagnose
    diagnosed = step_diagnose(diagnoser, leads)

    # 3. Build top-5 mockups
    built = step_build(builder, diagnosed)

    # 4. Film
    filmed = step_film(filmer, built)

    # 5. Check + Pitch
    pitched = step_check_and_pitch(checker, pitcher, diagnosed, built, filmed, today)

    # 6. Handle inbound replies
    step_handle_replies(mobile)

    # 7. Reply rate gate
    step_check_reply_rates(pitched, today)

    log.info(f"=== Pipeline run complete: {today} ===")


def run_continuous(interval_seconds: int = 3600) -> None:
    """Run the full pipeline once per hour (Scout is idempotent for the day)."""
    log.info(f"Starting continuous orchestrator loop (interval: {interval_seconds}s)")
    while True:
        try:
            run_pipeline_once()
        except KeyboardInterrupt:
            log.info("Orchestrator stopped by user")
            break
        except Exception as e:
            log.error(f"Pipeline run failed: {e}", exc_info=True)
        log.info(f"Sleeping {interval_seconds}s until next run...")
        time.sleep(interval_seconds)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="KJ Lead-Gen Orchestrator")
    parser.add_argument("--once", action="store_true", help="Run pipeline once and exit")
    parser.add_argument("--interval", type=int, default=3600, help="Loop interval in seconds (default: 3600)")
    parser.add_argument("--mobile-only", action="store_true", help="Only run Mobile reply handler")
    args = parser.parse_args()

    if args.mobile_only:
        mobile = Mobile()
        log.info("Running Mobile reply handler only...")
        step_handle_replies(mobile)
    elif args.once:
        run_pipeline_once()
    else:
        run_continuous(interval_seconds=args.interval)
