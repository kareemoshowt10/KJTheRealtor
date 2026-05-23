"""
Nurture — drip sequence manager for Kareem's leads.

Sequences by lead type:
  Seller: Day 1 (CMA intro) → Day 3 (market insight) → Day 7 (urgency/timing) →
          Day 14 (social proof) → Day 30 (final check-in)
  Buyer:  Day 1 (search strategy) → Day 3 (off-market alert) → Day 7 (market update) →
          Day 14 (free buyer guide) → Day 30 (rate check-in)

Sends via email or SMS based on what contact info is available.
"""

import os
import requests
from datetime import datetime, date, timedelta
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from agents.base import BaseAgent, load_state, save_state
from agents.llm import generate, FAST

CONFIG_DIR = Path(__file__).parent.parent / "config"


def _cfg():
    import json
    return json.loads((CONFIG_DIR / "settings.json").read_text())


SELLER_SEQUENCE = [
    {"day": 1,  "angle": "free_cma",          "channel_pref": ["email", "sms"]},
    {"day": 3,  "angle": "market_insight",     "channel_pref": ["email", "sms"]},
    {"day": 7,  "angle": "timing_urgency",     "channel_pref": ["email", "sms"]},
    {"day": 14, "angle": "social_proof",       "channel_pref": ["email"]},
    {"day": 30, "angle": "final_checkin",      "channel_pref": ["email", "sms"]},
]

BUYER_SEQUENCE = [
    {"day": 1,  "angle": "search_strategy",   "channel_pref": ["email", "sms"]},
    {"day": 3,  "angle": "off_market_alert",  "channel_pref": ["sms", "email"]},
    {"day": 7,  "angle": "market_update",     "channel_pref": ["email"]},
    {"day": 14, "angle": "buyer_guide",       "channel_pref": ["email"]},
    {"day": 30, "angle": "rate_checkin",      "channel_pref": ["sms", "email"]},
]


class Nurture(BaseAgent):
    name = "kareem.nurture"

    def run_due_touchpoints(self) -> list[dict]:
        """Find and send all drip messages due today."""
        nurture_state = load_state("kareem_nurture")
        pitched = load_state("kareem_pitched")
        today = date.today()
        sent = []

        for lead_id, pitch_data in pitched.items():
            if not pitch_data.get("sent"):
                continue

            lead_type = pitch_data.get("type", "seller")
            sequence = SELLER_SEQUENCE if lead_type == "seller" else BUYER_SEQUENCE
            lead_nurture = nurture_state.get(lead_id, {"sent_days": [], "first_contact": pitch_data.get("pitched_at", "")[:10]})

            first_contact = date.fromisoformat(lead_nurture["first_contact"])
            days_since = (today - first_contact).days
            sent_days = set(lead_nurture.get("sent_days", []))

            for step in sequence:
                if step["day"] <= days_since and step["day"] not in sent_days:
                    result = self._send_touchpoint(pitch_data, step)
                    if result.get("sent"):
                        sent_days.add(step["day"])
                        sent.append(result)

            nurture_state[lead_id] = {**lead_nurture, "sent_days": list(sent_days)}

        save_state("kareem_nurture", nurture_state)
        self.log.info(f"Nurture sent {len(sent)} touchpoints")
        return sent

    def _send_touchpoint(self, lead: dict, step: dict) -> dict:
        message = self._generate_message(lead, step["angle"])
        channel = self._pick_channel(lead, step["channel_pref"])

        cfg = _cfg()
        result = {"lead_id": lead.get("id"), "day": step["day"], "angle": step["angle"], "sent": False}

        if channel == "email" and lead.get("email"):
            result.update(self._send_email(cfg, lead, message, step["angle"]))
        elif channel == "sms" and lead.get("phone"):
            result.update(self._send_sms(cfg, lead, message))

        return result

    def _generate_message(self, lead: dict, angle: str) -> str:
        cfg = _cfg()
        agent = cfg["agent"]
        name_parts = lead.get("name", "").split()
        first_name = name_parts[0] if name_parts else "there"
        city = lead.get("city", "the area")
        lead_type = lead.get("type", "seller")
        est_value = lead.get("estimated_value", 0)
        cma_text = lead.get("cma_summary", "")

        angle_prompts = {
            "free_cma": f"Offer {first_name} a free home valuation. CMA summary: {cma_text or f'homes in {city} are moving well'}. Mention {agent['name']} can give them an exact number.",
            "market_insight": f"Share a brief, specific market insight about {city} — something like days on market or list-to-sale ratio. Keep it useful, not salesy.",
            "timing_urgency": f"Gently suggest that market timing matters right now in {city}. Mention spring/fall seasonality or current inventory without being pushy.",
            "social_proof": f"Reference {agent['name']}'s track record helping families in the SFV with wealth preservation through real estate. One specific detail or stat.",
            "final_checkin": f"A warm, non-pushy final check-in. Offer to be a resource whenever they're ready. Leave the door open.",
            "search_strategy": f"Offer to send {first_name} an off-market or coming-soon list for their target area. Mention Kareem has CRMLS access.",
            "off_market_alert": f"Quick text-style message: 'Saw something that might fit your criteria in {city} — want me to send details?'",
            "market_update": f"Share that inventory in {city} has shifted recently and now might be a good time to get pre-approved and move fast.",
            "buyer_guide": f"Offer to send a free first-time buyer guide for the SFV. No strings attached.",
            "rate_checkin": f"Quick rate check-in. Acknowledge rates have been moving and offer to connect them with a trusted lender.",
        }

        prompt = f"""Write a short follow-up message from Kareem Jamal, a Woodland Hills realtor.

Lead: {first_name}, a {lead.get('type', 'seller')} in {city}
Source: {lead.get('source', '').replace('_', ' ')}
Objective: {angle_prompts.get(angle, 'Check in warmly')}

Rules:
- Under 60 words
- Sounds like Kareem wrote it himself — warm, calm, knowledgeable
- No AI buzzwords, no fake urgency
- First name only, no "Dear"
- End with one soft CTA (reply, call, book a time)
- Sign: Kareem | (818) 402-7326

Output only the message."""

        try:
            return generate(prompt, model=FAST, max_tokens=150)
        except Exception as e:
            self.log.error(f"Message generation failed: {e}")
            return f"Hey {first_name}, just checking in — happy to answer any questions whenever you're ready. — Kareem | (818) 402-7326"

    def _pick_channel(self, lead: dict, prefs: list[str]) -> str:
        has_email = bool(lead.get("email"))
        has_phone = bool(lead.get("phone"))
        for pref in prefs:
            if pref == "email" and has_email:
                return "email"
            if pref == "sms" and has_phone:
                return "sms"
        return "none"

    def _send_email(self, cfg: dict, lead: dict, message: str, angle: str) -> dict:
        api_key = self._resolve_key(cfg, "sendgrid_key")
        if not api_key:
            return {"sent": False, "error": "SendGrid not configured"}

        subject_map = {
            "free_cma": f"Your {lead.get('city')} home value — quick estimate",
            "market_insight": f"What's happening in {lead.get('city')} right now",
            "timing_urgency": "Is now a good time to sell?",
            "social_proof": "Families I've helped in the Valley",
            "final_checkin": "Still here if you need anything",
            "search_strategy": f"Finding the right home in {lead.get('city')}",
            "off_market_alert": "Something caught my eye for you",
            "market_update": f"{lead.get('city')} market update",
            "buyer_guide": "Free SFV buyer guide — no catch",
            "rate_checkin": "Rates moved — thought of you",
        }

        paragraphs = "".join(f"<p style='margin:0 0 14px;font-family:sans-serif;font-size:15px;color:#222;'>{p}</p>"
                             for p in message.split("\n") if p.strip())
        html = f"""<!DOCTYPE html><html><body style="max-width:520px;margin:0 auto;padding:24px;">
{paragraphs}
<p style="margin-top:32px;color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;font-family:sans-serif;">
Kareem Jamal · Rodeo Realty Fine Estates · CA DRE #01998956<br>
Woodland Hills, CA · (818) 402-7326 · <a href="https://kareemjamaltherealtor.com" style="color:#888;">kareemjamaltherealtor.com</a>
</p></body></html>"""

        try:
            resp = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "personalizations": [{"to": [{"email": lead["email"]}]}],
                    "from": {"email": "kjamal@rodeore.com", "name": "Kareem Jamal"},
                    "subject": subject_map.get(angle, "Checking in"),
                    "content": [
                        {"type": "text/plain", "value": message},
                        {"type": "text/html", "value": html},
                    ],
                },
                timeout=15,
            )
            if resp.status_code in (200, 202):
                return {"sent": True, "channel": "email", "recipient": lead["email"]}
            return {"sent": False, "error": f"SendGrid {resp.status_code}"}
        except Exception as e:
            return {"sent": False, "error": str(e)}

    def _send_sms(self, cfg: dict, lead: dict, message: str) -> dict:
        sid = self._resolve_key(cfg, "twilio_sid")
        token = self._resolve_key(cfg, "twilio_token")
        from_num = self._resolve_key(cfg, "twilio_from")
        phone = lead.get("phone", "")

        if not all([sid, token, from_num, phone]):
            return {"sent": False, "error": "Twilio not fully configured"}

        phone = "".join(c for c in phone if c.isdigit() or c == "+")
        if not phone.startswith("+"):
            phone = "+1" + phone.lstrip("1")

        sms = message if len(message) <= 160 else message[:157] + "…"

        try:
            resp = requests.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
                auth=(sid, token),
                data={"From": from_num, "To": phone, "Body": sms},
                timeout=15,
            )
            data = resp.json()
            if data.get("sid"):
                return {"sent": True, "channel": "sms", "recipient": phone, "sms_sid": data["sid"]}
            return {"sent": False, "error": data.get("message", "Twilio error")}
        except Exception as e:
            return {"sent": False, "error": str(e)}

    def _resolve_key(self, cfg: dict, key_name: str) -> str:
        raw = cfg.get("apis", {}).get(key_name, "")
        if raw.startswith("${") and raw.endswith("}"):
            return os.environ.get(raw[2:-1], "")
        return raw
