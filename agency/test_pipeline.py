#!/usr/bin/env python3
"""
KJ Lead-Gen Pipeline — End-to-End Test Runner

Uses mock SFV leads so you can test without Google Maps / ATTOM / PropStream.
Only requires: ANTHROPIC_API_KEY

Usage:
  python3 agency/test_pipeline.py                    # agency pipeline (sell websites)
  python3 agency/test_pipeline.py --kareem           # Kareem realtor pipeline
  python3 agency/test_pipeline.py --all              # both pipelines
  python3 agency/test_pipeline.py --send             # actually dispatch messages (needs SendGrid/Twilio)
  python3 agency/test_pipeline.py --leads 3          # test with first N leads only
"""

import argparse
import json
import os
import sys
import time
from datetime import date
from pathlib import Path

# ── paths ──────────────────────────────────────────────────────────────────
AGENCY_DIR = Path(__file__).parent
REPO_DIR = AGENCY_DIR.parent
sys.path.insert(0, str(AGENCY_DIR))

# ── terminal colors ────────────────────────────────────────────────────────
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
BLUE   = "\033[94m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"
CYAN   = "\033[96m"

def ok(msg):    print(f"  {GREEN}✓{RESET} {msg}")
def warn(msg):  print(f"  {YELLOW}⚠{RESET}  {msg}")
def err(msg):   print(f"  {RED}✗{RESET} {msg}")
def info(msg):  print(f"  {BLUE}→{RESET} {msg}")
def head(msg):  print(f"\n{BOLD}{CYAN}{msg}{RESET}")
def dim(msg):   print(f"  {DIM}{msg}{RESET}")


def check_env() -> bool:
    head("Environment Check")
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        err("ANTHROPIC_API_KEY not set — required for diagnoses and message quality checks")
        print(f"\n  Set it with:")
        print(f"  {DIM}export ANTHROPIC_API_KEY=sk-ant-...\n  python3 agency/test_pipeline.py{RESET}\n")
        return False
    ok(f"ANTHROPIC_API_KEY set ({api_key[:12]}...)")

    sg = os.environ.get("SENDGRID_API_KEY", "")
    if sg:
        ok(f"SENDGRID_API_KEY set — emails will send for real")
    else:
        warn("SENDGRID_API_KEY not set — messages will be shown but NOT sent")

    twilio = os.environ.get("TWILIO_SID", "")
    if twilio:
        ok("Twilio configured — SMS will send for real")
    else:
        warn("Twilio not set — SMS will be shown but NOT sent")

    return True


# ── Agency Pipeline Test ───────────────────────────────────────────────────

def run_agency_test(leads_limit: int, dry_run: bool) -> dict:
    from mock_data import AGENCY_MOCK_LEADS
    from agents.diagnoser import Diagnoser
    from agents.checker import Checker
    from agents.builder import Builder
    from agents.base import save_state

    leads = AGENCY_MOCK_LEADS[:leads_limit]

    head(f"Agency Pipeline — {len(leads)} mock leads")
    print(f"  Selling website/funnel packages to local SFV businesses\n")

    diagnoser = Diagnoser()
    checker   = Checker()
    builder   = Builder()

    results = []
    approved_count = 0
    blocked_count  = 0
    mockup_paths   = []

    for i, lead in enumerate(leads, 1):
        print(f"\n{BOLD}[{i}/{len(leads)}] {lead['name']}{RESET}  {DIM}{lead['city']} · {lead['niche'].replace('_',' ').title()}{RESET}")
        print(f"  {lead['rating']}★ · {lead['review_count']} reviews · website: {lead['website_status']}")

        # ── Diagnose ──────────────────────────────────────────────────────
        info("Diagnosing...")
        try:
            diagnosed = diagnoser.run(lead)
        except Exception as e:
            err(f"Diagnoser failed: {e}")
            continue

        score   = diagnosed.get("score", 0)
        est_val = diagnosed.get("est_deal_value", 0)
        channel = diagnosed.get("channel", "email")
        score_color = GREEN if score >= 70 else (YELLOW if score >= 50 else RED)

        print(f"  {score_color}Score: {score}/100{RESET}  ·  Est. value: ${est_val:,.0f}  ·  Channel: {channel}")
        dim(f"Diagnosis: {diagnosed.get('diagnosis', '')}")
        dim(f"Hero angle: {diagnosed.get('hero_angle', '')}")

        msg = diagnosed.get("cold_message", "")
        word_count = len(msg.split())
        print(f"\n  {BOLD}Cold message ({word_count} words):{RESET}")
        for line in msg.split("\n"):
            print(f"    {line}")

        # ── Checker ───────────────────────────────────────────────────────
        info("Running quality check...")
        try:
            check = checker.run(diagnosed)
        except Exception as e:
            err(f"Checker failed: {e}")
            continue

        if check["approved"]:
            ok("Message APPROVED")
            approved_count += 1
            if check.get("revised_message"):
                dim(f"(auto-revised by Checker)")
        else:
            issues = "; ".join(check.get("issues", []))
            warn(f"Message BLOCKED — {issues}")
            blocked_count += 1

        # ── Builder (top 5 by score) ──────────────────────────────────────
        if i <= 5 and check["approved"]:
            info("Generating HTML mockup...")
            try:
                built = builder.run(diagnosed)
                mockup_url = built.get("mockup_url", "")
                if mockup_url.startswith("file://"):
                    mockup_path = mockup_url.replace("file://", "")
                    if Path(mockup_path).exists():
                        ok(f"Mockup saved: {mockup_path}")
                        mockup_paths.append(mockup_path)
                    else:
                        warn(f"Mockup path not found: {mockup_path}")
                elif mockup_url:
                    ok(f"Mockup URL: {mockup_url}")
            except Exception as e:
                err(f"Builder failed: {e}")

        # ── Pitcher (dry run or real) ─────────────────────────────────────
        if not dry_run and check["approved"]:
            final_msg = check.get("revised_message") or msg
            lead_to_pitch = {**diagnosed, "cold_message": final_msg}
            if diagnosed.get("mockup_url"):
                pass  # already in diagnosed from builder above if run
            _pitch_lead(lead_to_pitch, channel)

        results.append(diagnosed)

    # ── Save state ────────────────────────────────────────────────────────
    diagnosed_state = {r["id"]: r for r in results}
    save_state("diagnosed", diagnosed_state)

    return {
        "total": len(leads),
        "approved": approved_count,
        "blocked": blocked_count,
        "mockups": mockup_paths,
        "results": results,
    }


# ── Kareem Pipeline Test ───────────────────────────────────────────────────

def run_kareem_test(leads_limit: int, dry_run: bool) -> dict:
    from mock_data import KAREEM_MOCK_LEADS
    from anthropic import Anthropic
    from agents.base import save_state

    leads = KAREEM_MOCK_LEADS[:leads_limit]

    head(f"Kareem Realtor Pipeline — {len(leads)} mock seller leads")
    print(f"  Motivated sellers in Woodland Hills / SFV\n")

    client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    results = []

    for i, lead in enumerate(leads, 1):
        print(f"\n{BOLD}[{i}/{len(leads)}] {lead['name']} family — {lead['address']}, {lead['city']}{RESET}")
        print(f"  Source: {lead['source'].replace('_',' ')}  ·  Motivation: {lead['motivation_score']}/100")

        if lead.get("list_price"):
            print(f"  Listed at: ${lead['list_price']:,}  ·  DOM: {lead.get('days_on_market', '—')}")
        if lead.get("avm"):
            print(f"  AVM estimate: ${lead['avm']:,}  ·  Equity: {lead.get('equity_pct', '—')}%")

        # ── CMA Summary ───────────────────────────────────────────────────
        info("Building CMA summary...")
        cma_text = _mock_cma(client, lead)
        dim(f"CMA: {cma_text}")

        # ── Cold message ──────────────────────────────────────────────────
        info("Writing outreach message...")
        channel = "sms" if not lead.get("email") else "email"
        msg = _kareem_cold_message(client, lead, cma_text, channel)
        word_count = len(msg.split())
        print(f"\n  {BOLD}Cold message ({word_count} words, via {channel}):{RESET}")
        for line in msg.split("\n"):
            print(f"    {line}")

        # ── Checker ───────────────────────────────────────────────────────
        from agents.checker import Checker
        checker = Checker()
        check_input = {**lead, "niche": "real_estate_agent", "cold_message": msg, "channel": channel}
        try:
            check = checker.run(check_input)
            if check["approved"]:
                ok("Message APPROVED by Checker")
            else:
                issues = "; ".join(check.get("issues", []))
                warn(f"Checker flagged: {issues}")
                if check.get("revised_message"):
                    msg = check["revised_message"]
                    ok("Auto-revised by Checker")
        except Exception as e:
            warn(f"Checker skipped: {e}")

        if not dry_run and lead.get("email"):
            _pitch_kareem(lead, msg, channel)

        results.append({**lead, "cma_summary": cma_text, "cold_message": msg, "channel": channel})

    # Save to kareem state
    kareem_state_dir = AGENCY_DIR / "kareem" / "state"
    enriched_path = kareem_state_dir / "enriched.json"
    existing = json.loads(enriched_path.read_text()) if enriched_path.exists() else {}
    for r in results:
        existing[r["id"]] = r
    enriched_path.write_text(json.dumps(existing, indent=2))

    return {"total": len(leads), "results": results}


def _mock_cma(client, lead: dict) -> str:
    address = lead.get("address", "")
    city = lead.get("city", "")
    avm = lead.get("avm", 0)
    list_price = lead.get("list_price", 0)

    prompt = f"""Write a 2-sentence CMA summary for a seller outreach message.
Property: {address}, {city}, CA
AVM: ${avm:,}  List price: ${list_price:,}
Write as Kareem Jamal, a knowledgeable Woodland Hills realtor.
No buzzwords. Specific, local, confident.
Output only the 2 sentences."""

    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=120,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text.strip()


def _kareem_cold_message(client, lead: dict, cma_text: str, channel: str) -> str:
    source_map = {
        "expired_listing": f"their listing expired after {lead.get('days_on_market', 30)}+ days",
        "fsbo": "they're trying to sell on their own",
        "pre_foreclosure": "their property has a Notice of Default filed",
        "absentee_owner": f"they own property here but live in {lead.get('owner_state', 'another state')}",
        "probate": "the property may be going through probate",
    }
    context = source_map.get(lead.get("source", ""), "they may be considering selling")
    name = lead.get("name", "")
    city = lead.get("city", "")
    channel_note = "This is an SMS — ultra brief, 2-3 sentences max." if channel == "sms" else "This is an email — warm, short, 3-4 sentences."

    prompt = f"""Write a cold outreach message from Kareem Jamal, a Woodland Hills realtor.

Context: {context}
Lead name: {name} family, {city}
CMA note: {cma_text}
{channel_note}

Rules:
- Under 65 words
- No buzzwords (leverage, game-changer, etc.)
- Sounds like a real person wrote it
- Mention something specific (city, situation, or number)
- Offer something free (consultation, home value, off-market options)
- Sign as: Kareem | (818) 402-7326

Output only the message."""

    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=180,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text.strip()


def _pitch_lead(lead: dict, channel: str) -> None:
    """Actually send message if credentials are configured."""
    sg_key = os.environ.get("SENDGRID_API_KEY", "")
    if channel == "email" and lead.get("email") and sg_key:
        from agents.pitcher import Pitcher
        p = Pitcher()
        result = p.run(lead)
        if result.get("sent"):
            ok(f"Email sent to {lead.get('email')}")
        else:
            warn(f"Email failed: {result.get('error')}")
    elif channel == "sms" and lead.get("phone") and os.environ.get("TWILIO_SID"):
        from agents.pitcher import Pitcher
        p = Pitcher()
        result = p.run(lead)
        if result.get("sent"):
            ok(f"SMS sent to {lead.get('phone')}")
        else:
            warn(f"SMS failed: {result.get('error')}")


def _pitch_kareem(lead: dict, msg: str, channel: str) -> None:
    sg_key = os.environ.get("SENDGRID_API_KEY", "")
    if channel == "email" and lead.get("email") and sg_key:
        import requests
        try:
            resp = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {sg_key}", "Content-Type": "application/json"},
                json={
                    "personalizations": [{"to": [{"email": lead["email"]}]}],
                    "from": {"email": "kjamal@rodeore.com", "name": "Kareem Jamal"},
                    "subject": f"Your {lead.get('city')} home — quick thought",
                    "content": [{"type": "text/plain", "value": msg}],
                },
                timeout=15,
            )
            if resp.status_code in (200, 202):
                ok(f"Email sent to {lead['email']}")
            else:
                warn(f"SendGrid {resp.status_code}")
        except Exception as e:
            warn(f"Email send failed: {e}")


# ── Summary ────────────────────────────────────────────────────────────────

def print_summary(agency_results: dict | None, kareem_results: dict | None, dry_run: bool) -> None:
    head("Test Summary")

    if agency_results:
        t = agency_results["total"]
        a = agency_results["approved"]
        b = agency_results["blocked"]
        m = len(agency_results.get("mockups", []))
        print(f"\n  {BOLD}Agency Pipeline (website sales):{RESET}")
        ok(f"{t} leads processed")
        ok(f"{a} messages approved  |  {b} blocked by Checker")
        ok(f"{m} HTML mockups generated")
        if agency_results.get("mockups"):
            print(f"\n  {BOLD}Open mockups in browser:{RESET}")
            for path in agency_results["mockups"]:
                print(f"    open \"{path}\"")

    if kareem_results:
        t = kareem_results["total"]
        print(f"\n  {BOLD}Kareem Realtor Pipeline (seller leads):{RESET}")
        ok(f"{t} leads processed with CMA + outreach message")
        ok(f"State saved to: agency/kareem/state/enriched.json")

    print(f"\n  {BOLD}State files written to:{RESET}  agency/state/")
    if dry_run:
        print(f"\n  {YELLOW}No messages were sent (dry-run mode).{RESET}")
        print(f"  Add {BOLD}--send{RESET} to actually dispatch via SendGrid / Twilio.")
    print()


# ── Entry ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="KJ Pipeline Test Runner")
    parser.add_argument("--kareem", action="store_true", help="Run Kareem realtor pipeline only")
    parser.add_argument("--all",    action="store_true", help="Run both pipelines")
    parser.add_argument("--send",   action="store_true", help="Actually send messages (SendGrid/Twilio)")
    parser.add_argument("--leads",  type=int, default=5,  help="Number of mock leads to test (default: 5)")
    args = parser.parse_args()

    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  KJ Lead-Gen Pipeline — Test Runner{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")

    if not check_env():
        sys.exit(1)

    dry_run = not args.send
    agency_results = None
    kareem_results = None

    if args.all or (not args.kareem):
        agency_results = run_agency_test(args.leads, dry_run)

    if args.all or args.kareem:
        kareem_results = run_kareem_test(min(args.leads, 5), dry_run)

    print_summary(agency_results, kareem_results, dry_run)


if __name__ == "__main__":
    main()
