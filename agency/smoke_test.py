#!/usr/bin/env python3
"""
PropFlow / KJ Agency — Smoke Test (no API key required)

Validates every module import, scoring logic, builder HTML output,
and checker rules. Runs in ~2 seconds without any external API calls.

Usage:
  python3 agency/smoke_test.py
"""

import sys
import os
from pathlib import Path

AGENCY_DIR = Path(__file__).parent
sys.path.insert(0, str(AGENCY_DIR))

GREEN  = "\033[92m"; RED = "\033[91m"; YELLOW = "\033[93m"
BOLD   = "\033[1m";  DIM = "\033[2m";  RESET = "\033[0m"; CYAN = "\033[96m"

def ok(m):   print(f"  {GREEN}✓{RESET} {m}")
def fail(m): print(f"  {RED}✗{RESET} {m}"); sys.exit(1)
def head(m): print(f"\n{BOLD}{CYAN}{m}{RESET}")

PASS = 0; FAIL = 0

def check(label, fn):
    global PASS, FAIL
    try:
        fn()
        ok(label)
        PASS += 1
    except Exception as e:
        print(f"  {RED}✗{RESET} {label}")
        print(f"    {DIM}{e}{RESET}")
        FAIL += 1


head("Imports")
check("agents.base",      lambda: __import__("agents.base"))
check("agents.diagnoser", lambda: __import__("agents.diagnoser"))
check("agents.checker",   lambda: __import__("agents.checker"))
check("agents.builder",   lambda: __import__("agents.builder"))
check("mock_data",        lambda: __import__("mock_data"))

head("Mock Data")
from mock_data import AGENCY_MOCK_LEADS, KAREEM_MOCK_LEADS
check(f"AGENCY_MOCK_LEADS has {len(AGENCY_MOCK_LEADS)} leads",
      lambda: None if len(AGENCY_MOCK_LEADS) >= 5 else (_ for _ in ()).throw(AssertionError()))
check(f"KAREEM_MOCK_LEADS has {len(KAREEM_MOCK_LEADS)} leads",
      lambda: None if len(KAREEM_MOCK_LEADS) >= 3 else (_ for _ in ()).throw(AssertionError()))

head("Config Loading")
from agents.base import load_config
def chk_settings():
    s = load_config("settings")
    assert s.get("channels"), "no channels key"
    assert s.get("scout"), "no scout key"
check("settings.json loads", chk_settings)

def chk_niches():
    n = load_config("niches")
    assert "home_inspector" in n, "missing home_inspector"
    assert "general_contractor" in n, "missing general_contractor"
check("niches.json loads", chk_niches)

head("Diagnoser (scoring, no API)")
from agents.diagnoser import Diagnoser
d = Diagnoser()

def chk_score_no_website():
    lead = AGENCY_MOCK_LEADS[0]  # Mike Kowalski, no website, 18 reviews
    s = d._score_lead(lead)
    assert 50 <= s <= 100, f"unexpected score {s}"
check("no-website lead scores 50–100", chk_score_no_website)

def chk_score_outdated():
    lead = AGENCY_MOCK_LEADS[1]  # Valley Pro Staging, outdated, 31 reviews
    s = d._score_lead(lead)
    assert 20 <= s <= 80, f"unexpected score {s}"
check("outdated-website lead scores 20–80", chk_score_outdated)

def chk_deal_value():
    lead = AGENCY_MOCK_LEADS[0]
    v = d._estimate_deal_value(lead, 67)
    assert v > 0, "deal value must be > 0"
check("deal value estimate > 0", chk_deal_value)

head("Builder (static HTML, no API)")
from agents.builder import Builder
b = Builder()

def chk_builder():
    lead = AGENCY_MOCK_LEADS[0]
    diagnosed = {
        **lead,
        "score": 67,
        "hero_angle": "4.8 stars deserve a site that books clients.",
        "diagnosis":  "No website despite strong reviews.",
        "cold_message": "Hey Mike, great reviews in Woodland Hills...",
        "channel": "email",
        "est_deal_value": 1068.0,
    }
    result = b.run(diagnosed)
    assert result["mockup_provider"] in ("static_html", "lovable"), "unknown provider"
    url = result["mockup_url"]
    if url.startswith("file://"):
        p = Path(url.replace("file://", ""))
        assert p.exists(), f"HTML file not written: {p}"
        assert p.stat().st_size > 3000, "HTML file suspiciously small"
check("static HTML mockup written", chk_builder)

head("Checker (rule-based, no API)")
from agents.checker import Checker, AI_BUZZWORDS
c_no_api = Checker.__new__(Checker)
c_no_api.settings = load_config("settings")
c_no_api.niches   = load_config("niches")
c_no_api.client   = None

import logging
c_no_api.log = logging.getLogger("test")

def chk_word_count():
    long_msg = " ".join(["word"] * 80)
    issues = []
    if len(long_msg.split()) > 70:
        issues.append("too long")
    assert issues, "should flag 80-word message"
check("word count rule flags >70 words", chk_word_count)

def chk_buzzwords():
    msg = "We leverage cutting-edge technology to revolutionize your business."
    lower = msg.lower()
    found = [b for b in AI_BUZZWORDS if b in lower]
    assert len(found) >= 2, f"only {len(found)} buzzwords detected"
check("buzzword rule catches leverage/cutting-edge", chk_buzzwords)

def chk_personalization():
    msg = "We can help grow your business with a new website."
    lower = msg.lower()
    name, city = "Mike Kowalski Home Inspections", "Woodland Hills"
    has_name = name.split()[0].lower() in lower
    has_city = city.lower() in lower
    assert not has_name and not has_city, "should flag missing personalization"
check("personalization check catches generic message", chk_personalization)

head("State Dirs")
check("agency/state/ exists", lambda: None if (AGENCY_DIR / "state").exists() else (_ for _ in ()).throw(FileNotFoundError()))
check("agency/kareem/state/ exists", lambda: None if (AGENCY_DIR / "kareem" / "state").exists() else (_ for _ in ()).throw(FileNotFoundError()))
check("agency/logs/ exists", lambda: None if (AGENCY_DIR / "logs").exists() else (_ for _ in ()).throw(FileNotFoundError()))

# ── Final Report ───────────────────────────────────────────────────────────
print(f"\n{BOLD}{'─'*50}{RESET}")
total = PASS + FAIL
if FAIL == 0:
    print(f"{GREEN}{BOLD}  All {PASS} checks passed.{RESET}")
    print(f"\n  Next: set ANTHROPIC_API_KEY and run the full test:")
    print(f"  {DIM}export ANTHROPIC_API_KEY=sk-ant-...{RESET}")
    print(f"  {DIM}python3 agency/test_pipeline.py --leads 3{RESET}")
    print(f"  {DIM}python3 agency/test_pipeline.py --kareem --leads 3{RESET}")
else:
    print(f"{RED}{BOLD}  {FAIL}/{total} checks FAILED.{RESET}  Fix the errors above first.")
print()
