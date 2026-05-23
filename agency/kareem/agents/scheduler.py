"""
Scheduler — books consultations and property showings for Kareem.

Positive replies → single-use Calendly link for a 30-min strategy call.
Showing requests → coordinates via CRMLS showing instructions + Calendly.
"""

import os
import requests
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from agents.base import BaseAgent

CONFIG_DIR = Path(__file__).parent.parent / "config"
CALENDLY_BASE = "https://api.calendly.com"


def _cfg():
    import json
    return json.loads((CONFIG_DIR / "settings.json").read_text())


class Scheduler(BaseAgent):
    name = "kareem.scheduler"

    def book_consultation(self, lead: dict) -> dict:
        """Generate a booking link and confirmation message for a positive reply."""
        self.log.info(f"Booking consultation for {lead.get('name')}")
        cfg = _cfg()
        booking_url = self._create_calendly_link(cfg)
        message = self._confirmation_message(lead, booking_url, cfg)

        return {
            **lead,
            "booking_url": booking_url,
            "booking_message": message,
            "booking_type": "consultation",
            "booked_at": self._ts(),
        }

    def book_showing(self, lead: dict, property_address: str) -> dict:
        """Generate a showing booking link with property context."""
        self.log.info(f"Booking showing for {lead.get('name')} at {property_address}")
        cfg = _cfg()
        booking_url = self._create_calendly_link(cfg, event_type="showing")
        message = self._showing_message(lead, booking_url, property_address, cfg)

        return {
            **lead,
            "booking_url": booking_url,
            "booking_message": message,
            "booking_type": "showing",
            "property": property_address,
            "booked_at": self._ts(),
        }

    def _create_calendly_link(self, cfg: dict, event_type: str = "consultation") -> str:
        token = self._resolve_key(cfg, "calendly_token")
        event_uuid = self._resolve_key(cfg, "calendly_event_type")

        if not token or not event_uuid:
            return cfg["agent"]["calendly_url"]

        try:
            resp = requests.post(
                f"{CALENDLY_BASE}/scheduling_links",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={
                    "max_event_count": 1,
                    "owner": f"https://api.calendly.com/event_types/{event_uuid}",
                    "owner_type": "EventType",
                },
                timeout=15,
            )
            resp.raise_for_status()
            return resp.json()["resource"]["booking_url"]
        except Exception as e:
            self.log.warning(f"Calendly link creation failed: {e}")
            return cfg["agent"]["calendly_url"]

    def _confirmation_message(self, lead: dict, booking_url: str, cfg: dict) -> str:
        name_parts = lead.get("name", "").split()
        first_name = name_parts[0] if name_parts else "there"
        lead_type = lead.get("type", "seller")
        city = lead.get("city", "the area")
        agent = cfg["agent"]

        call_focus = (
            "walk through your home's value and what the market looks like right now"
            if lead_type == "seller"
            else "map out a search strategy and talk about what's available in your price range"
        )

        return (
            f"Hey {first_name} — great to hear from you.\n\n"
            f"Here's a link to grab 30 minutes on my calendar: {booking_url}\n\n"
            f"We'll {call_focus}. No pressure, just a real conversation.\n\n"
            f"Talk soon,\nKareem\n{agent['phone']}"
        )

    def _showing_message(self, lead: dict, booking_url: str, address: str, cfg: dict) -> str:
        name_parts = lead.get("name", "").split()
        first_name = name_parts[0] if name_parts else "there"
        agent = cfg["agent"]

        return (
            f"Hey {first_name} — happy to show you {address}.\n\n"
            f"Pick a time here: {booking_url}\n\n"
            f"I'll confirm the showing and send you everything you need to know about the property beforehand.\n\n"
            f"— Kareem\n{agent['phone']}"
        )

    def _resolve_key(self, cfg: dict, key_name: str) -> str:
        raw = cfg.get("apis", {}).get(key_name, "")
        if raw.startswith("${") and raw.endswith("}"):
            return os.environ.get(raw[2:-1], "")
        return raw
