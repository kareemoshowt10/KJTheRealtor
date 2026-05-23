#!/usr/bin/env python3
"""
KJ Agency — Setup Checker

Checks your environment, tells you exactly what's ready and what's missing.
Run this first before test_pipeline.py.

Usage:
  python3 agency/setup.py
"""

import os
import sys
import importlib
from pathlib import Path

BOLD  = "\033[1m"
GREEN = "\033[92m"
RED   = "\033[91m"
YELLOW= "\033[93m"
BLUE  = "\033[94m"
DIM   = "\033[2m"
RESET = "\033[0m"

def ok(msg):   print(f"  {GREEN}✓{RESET}  {msg}")
def err(msg):  print(f"  {RED}✗{RESET}  {msg}")
def warn(msg): print(f"  {YELLOW}!{RESET}  {msg}")
def head(msg): print(f"\n{BOLD}{msg}{RESET}")


ENV_VARS = {
    "REQUIRED — Minimum to run the test": {
        "GOOGLE_API_KEY": {
            "desc": "Powers Diagnoser, Checker, and Mobile (Gemini 2.5 Pro/Flash)",
            "get": "aistudio.google.com/apikey (free tier available)",
            "required": True,
        },
    },
    "OPTIONAL — Email outreach (free tier: 100 emails/day)": {
        "SENDGRID_API_KEY": {
            "desc": "Sends cold emails to agents, inspectors, mortgage brokers",
            "get": "app.sendgrid.com → Settings → API Keys",
            "required": False,
        },
    },
    "OPTIONAL — SMS outreach": {
        "TWILIO_SID": {
            "desc": "Twilio account SID for SMS to contractors and movers",
            "get": "console.twilio.com",
            "required": False,
        },
        "TWILIO_AUTH_TOKEN": {
            "desc": "Twilio auth token",
            "get": "console.twilio.com",
            "required": False,
        },
        "TWILIO_PHONE": {
            "desc": "Your Twilio phone number (e.g. +18185550000)",
            "get": "console.twilio.com → Phone Numbers",
            "required": False,
        },
    },
    "OPTIONAL — Lead sourcing (needed for production, not for test)": {
        "GOOGLE_MAPS_API_KEY": {
            "desc": "Scout uses this to find leads on Google Maps",
            "get": "console.cloud.google.com → Places API",
            "required": False,
        },
        "ATTOM_API_KEY": {
            "desc": "Pre-foreclosure, absentee owners, comps for Kareem pipeline",
            "get": "api.gateway.attomdata.com",
            "required": False,
        },
        "PROPSTREAM_API_KEY": {
            "desc": "Additional absentee owner and investor data",
            "get": "propstream.com/api",
            "required": False,
        },
        "REDX_API_KEY": {
            "desc": "Expired listings for Kareem pipeline",
            "get": "redx.com",
            "required": False,
        },
    },
    "OPTIONAL — Booking": {
        "CALENDLY_API_KEY": {
            "desc": "Creates single-use booking links on positive replies",
            "get": "developer.calendly.com → Personal Tokens",
            "required": False,
        },
        "CALENDLY_EVENT_TYPE_UUID": {
            "desc": "UUID of your 30-min consultation event type",
            "get": "Run: python3 agency/setup.py --calendly-uuid",
            "required": False,
        },
    },
}


def check_python():
    head("Python")
    v = sys.version_info
    if v >= (3, 11):
        ok(f"Python {v.major}.{v.minor}.{v.micro}")
    else:
        err(f"Python {v.major}.{v.minor} — need 3.11+")


def check_packages():
    head("Python Packages")
    packages = {
        "google.genai": "pip install google-genai",
        "requests":     "pip install requests",
    }
    for pkg, install in packages.items():
        try:
            mod = importlib.import_module(pkg)
            ver = getattr(mod, "__version__", "?")
            ok(f"{pkg} {ver}")
        except ImportError:
            err(f"{pkg} not installed — run: {install}")


def check_env():
    head("Environment Variables")
    all_required_set = True

    for group, vars_dict in ENV_VARS.items():
        print(f"\n  {DIM}{group}{RESET}")
        for key, meta in vars_dict.items():
            val = os.environ.get(key, "")
            if val:
                masked = val[:8] + "..." if len(val) > 8 else val
                ok(f"{key} = {masked}  {DIM}({meta['desc']}){RESET}")
            elif meta["required"]:
                err(f"{key} — NOT SET  {DIM}→ get it at: {meta['get']}{RESET}")
                all_required_set = False
            else:
                warn(f"{key} — not set  {DIM}({meta['desc']}){RESET}")

    return all_required_set


def check_state_dirs():
    head("State Directories")
    dirs = [
        Path("agency/state"),
        Path("agency/kareem/state"),
        Path("agency/logs"),
    ]
    for d in dirs:
        if d.exists():
            ok(str(d))
        else:
            d.mkdir(parents=True, exist_ok=True)
            ok(f"{d}  (created)")


def check_env_file():
    head(".env File")
    env_path = Path(".env")
    example_path = Path(".env.example")

    if env_path.exists():
        ok(".env file found — loading...")
        # Auto-load .env for the session
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and v and k not in os.environ:
                    os.environ[k] = v
        ok("Loaded .env into environment")
    else:
        warn(".env not found")
        if example_path.exists():
            print(f"\n  {DIM}Create it by running:{RESET}")
            print(f"  cp .env.example .env")
            print(f"  # then edit .env with your keys")


def print_next_steps(all_required: bool):
    head("Next Steps")
    if all_required:
        print(f"\n  {GREEN}You're ready to test!{RESET}")
        print(f"\n  {BOLD}Run the test pipeline:{RESET}")
        print(f"  python3 agency/test_pipeline.py")
        print(f"  python3 agency/test_pipeline.py --leads 3    # faster, first 3 leads")
        print(f"  python3 agency/test_pipeline.py --kareem     # Kareem seller leads")
        print(f"  python3 agency/test_pipeline.py --all        # both pipelines")
        print(f"  python3 agency/test_pipeline.py --send       # send for real")
        print()
        print(f"  {BOLD}Run the live pipeline (once):{RESET}")
        print(f"  python3 agency/orchestrator.py --once")
        print(f"  python3 agency/kareem/orchestrator.py --once")
        print()
        print(f"  {BOLD}Check status:{RESET}")
        print(f"  agency/run.sh --status")
    else:
        print(f"\n  {RED}Set GOOGLE_API_KEY first:{RESET}")
        print(f"  Get a free key at: https://aistudio.google.com/apikey")
        print(f"  export GOOGLE_API_KEY=...")
        print(f"  python3 agency/test_pipeline.py")
        print()
        print(f"  Or add it to a .env file:")
        print(f"  echo 'GOOGLE_API_KEY=...' >> .env")
        print(f"  python3 agency/setup.py  # re-run this to verify")
    print()


def fetch_calendly_event_types():
    """Helper to find your Calendly event type UUID."""
    import requests
    token = os.environ.get("CALENDLY_API_KEY", "")
    if not token:
        print("CALENDLY_API_KEY not set")
        return
    try:
        resp = requests.get(
            "https://api.calendly.com/event_types",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        resp.raise_for_status()
        events = resp.json().get("collection", [])
        print(f"\nYour Calendly event types:")
        for e in events:
            uuid = e["uri"].split("/")[-1]
            print(f"  {e['name']:40s}  UUID: {uuid}")
        print(f"\nSet your preferred UUID:")
        print(f"  export CALENDLY_EVENT_TYPE_UUID=<uuid>")
    except Exception as e:
        print(f"Calendly API error: {e}")


if __name__ == "__main__":
    print(f"\n{BOLD}{'='*55}{RESET}")
    print(f"{BOLD}  KJ Lead-Gen Agency — Setup Checker{RESET}")
    print(f"{BOLD}{'='*55}{RESET}")

    if "--calendly-uuid" in sys.argv:
        check_env_file()
        fetch_calendly_event_types()
        sys.exit(0)

    check_env_file()
    check_python()
    check_packages()
    check_state_dirs()
    all_required = check_env()
    print_next_steps(all_required)
