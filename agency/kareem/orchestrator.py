"""
Kareem Pipeline Orchestrator — realtor lead-gen + transaction management.

Daily flow:
  LeadScout → CMABuilder → [Checker] → Pitcher → Nurture (ongoing)
  Coordinator runs daily milestone checks on active transactions.
  Scheduler handles all positive replies → books consultation calls.
"""

import json
import logging
import os
import sys
import time
from datetime import date, datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from agents.base import load_state, save_state
from agents.checker import Checker
from agents.pitcher import Pitcher
from agents.mobile import Mobile
from kareem.agents import LeadScout, CMABuilder, Nurture, Scheduler, Coordinator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s — %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(Path(__file__).parent.parent / "logs" / "kareem.log"),
    ],
)
log = logging.getLogger("kareem.orchestrator")

STATE_DIR = Path(__file__).parent / "state"
STATE_DIR.mkdir(exist_ok=True)

FLAGS_FILE = STATE_DIR / "flags.json"

DEAL_APPROVAL_THRESHOLD = 3000
REPLY_RATE_THRESHOLD = 0.15
MAX_DAILY_PITCHES = 30


def _load_kareem_state(name: str) -> dict:
    path = STATE_DIR / f"{name}.json"
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return {}
    return {}


def _save_kareem_state(name: str, data: dict) -> None:
    (STATE_DIR / f"{name}.json").write_text(json.dumps(data, indent=2))


def _acquire_lock(lead_id: str, agent: str) -> bool:
    locks_path = STATE_DIR / "locks.json"
    locks = {}
    if locks_path.exists():
        try:
            locks = json.loads(locks_path.read_text())
        except Exception:
            pass
    if lead_id in locks:
        locked_at = datetime.fromisoformat(locks[lead_id]["locked_at"])
        if (datetime.utcnow() - locked_at).total_seconds() < 1800:
            return False
    locks[lead_id] = {"agent": agent, "locked_at": datetime.utcnow().isoformat()}
    locks_path.write_text(json.dumps(locks, indent=2))
    return True


def _release_lock(lead_id: str) -> None:
    locks_path = STATE_DIR / "locks.json"
    if locks_path.exists():
        try:
            locks = json.loads(locks_path.read_text())
            locks.pop(lead_id, None)
            locks_path.write_text(json.dumps(locks, indent=2))
        except Exception:
            pass


def _flag_human(lead_id: str, reason: str, data: dict) -> None:
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
    log.warning(f"[HUMAN FLAG] {lead_id}: {reason}")


def run_pipeline_once() -> None:
    today = str(date.today())
    log.info(f"=== Kareem pipeline start: {today} ===")

    scout = LeadScout()
    cma = CMABuilder()
    checker = Checker()
    pitcher = Pitcher()
    nurture = Nurture()
    scheduler = Scheduler()
    coordinator = Coordinator()

    # ── 1. Scout ──────────────────────────────────────────────────────────────
    queue = _load_kareem_state("queue")
    if queue.get("date") != today:
        log.info("Running LeadScout...")
        leads = scout.run()
        existing_ids = {l["id"] for l in queue.get("leads", [])}
        new_leads = [l for l in leads if l["id"] not in existing_ids]
        all_leads = queue.get("leads", []) + new_leads
        _save_kareem_state("queue", {"date": today, "leads": all_leads})
        log.info(f"Scout: {len(new_leads)} new leads ({len(all_leads)} total)")
    else:
        all_leads = queue.get("leads", [])
        log.info(f"Scout already ran today ({len(all_leads)} leads)")

    # ── 2. Build CMAs ─────────────────────────────────────────────────────────
    enriched = _load_kareem_state("enriched")
    for lead in all_leads:
        lid = lead["id"]
        if lid in enriched:
            continue
        if not _acquire_lock(lid, "cma_builder"):
            continue
        try:
            result = cma.run(lead)
            enriched[lid] = result
        except Exception as e:
            log.error(f"CMA error for {lead.get('address')}: {e}")
        finally:
            _release_lock(lid)
    _save_kareem_state("enriched", enriched)
    log.info(f"CMABuilder: {len(enriched)} leads enriched")

    # ── 3. Check + Pitch ──────────────────────────────────────────────────────
    pitched = _load_kareem_state("pitched")
    flags = {}
    if FLAGS_FILE.exists():
        try:
            flags = json.loads(FLAGS_FILE.read_text())
        except Exception:
            pass

    pitched_today = sum(1 for p in pitched.values() if p.get("pitched_at", "")[:10] == today and p.get("sent"))
    new_pitches = 0

    for lid, lead_data in enriched.items():
        if pitched_today + new_pitches >= MAX_DAILY_PITCHES:
            break
        if lid in pitched and pitched[lid].get("pitched_at", "")[:10] == today:
            continue
        if lid in flags and not flags[lid].get("resolved"):
            continue
        if not _acquire_lock(lid, "checker"):
            continue

        try:
            check_result = checker.run(lead_data)
            if check_result.get("revised_message"):
                lead_data["cold_message"] = check_result["revised_message"]
            if not check_result["approved"]:
                log.warning(f"Checker blocked {lead_data.get('name', lead_data.get('address'))}")
                continue
        except Exception as e:
            log.error(f"Checker error: {e}")
            continue
        finally:
            _release_lock(lid)

        if not _acquire_lock(lid, "pitcher"):
            continue
        try:
            result = pitcher.run(lead_data)
            pitched[lid] = {**result, "pitched_at": datetime.utcnow().isoformat()}
            if result.get("sent"):
                new_pitches += 1
        except Exception as e:
            log.error(f"Pitcher error: {e}")
        finally:
            _release_lock(lid)

    _save_kareem_state("pitched", pitched)
    log.info(f"Pitcher: {new_pitches} new pitches sent today")

    # ── 4. Nurture due touchpoints ────────────────────────────────────────────
    try:
        sent = nurture.run_due_touchpoints()
        log.info(f"Nurture: {len(sent)} touchpoints sent")
    except Exception as e:
        log.error(f"Nurture error: {e}")

    # ── 5. Transaction milestone reminders ────────────────────────────────────
    try:
        reminders = coordinator.run_daily_checks()
        log.info(f"Coordinator: {len(reminders)} milestone reminders sent")
    except Exception as e:
        log.error(f"Coordinator error: {e}")

    # ── 6. Handle inbound replies ─────────────────────────────────────────────
    try:
        mobile = Mobile()
        new_replies = mobile.poll_inbound_replies()
        for reply in new_replies:
            # Positive replies → book via Scheduler instead of generic Calendly
            classified = mobile._classify_reply(reply["message"])
            if classified["type"] == "positive":
                lead = enriched.get(reply["lead_id"], {})
                booking = scheduler.book_consultation({**lead, **reply})
                log.info(f"Booked consultation for {reply.get('lead_name')}: {booking.get('booking_url')}")
            else:
                mobile.handle_reply(reply)
        if new_replies:
            log.info(f"Mobile: handled {len(new_replies)} replies")
    except Exception as e:
        log.error(f"Reply handling error: {e}")

    # ── 7. Reply rate check ───────────────────────────────────────────────────
    replies = _load_kareem_state("replies") if (STATE_DIR / "replies.json").exists() else load_state("replies")
    total_pitched_today = sum(1 for p in pitched.values() if p.get("pitched_at", "")[:10] == today and p.get("sent"))
    total_replied_today = sum(1 for r in replies.values() if r.get("classification") in ("positive", "question") and r.get("handled_at", "")[:10] == today)

    if total_pitched_today >= 10:
        rate = total_replied_today / total_pitched_today
        if rate < REPLY_RATE_THRESHOLD:
            _flag_human(
                f"reply_rate_{today}",
                "reply_rate_below_threshold",
                {"rate": rate, "threshold": REPLY_RATE_THRESHOLD, "pitched": total_pitched_today},
            )

    log.info(f"=== Kareem pipeline complete: {today} ===")


def run_continuous(interval: int = 3600) -> None:
    log.info(f"Starting Kareem continuous loop (interval: {interval}s)")
    while True:
        try:
            run_pipeline_once()
        except KeyboardInterrupt:
            log.info("Stopped")
            break
        except Exception as e:
            log.error(f"Pipeline run failed: {e}", exc_info=True)
        log.info(f"Sleeping {interval}s...")
        time.sleep(interval)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Kareem Realtor Pipeline")
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--interval", type=int, default=3600)
    args = parser.parse_args()

    if args.once:
        run_pipeline_once()
    else:
        run_continuous(args.interval)
