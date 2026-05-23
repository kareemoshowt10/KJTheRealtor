"""
Mobile — handles positive replies in real-time from any channel.
Lives on iPhone Claude Code (or runs as a fast polling loop).
- Classifies replies as: positive / negative / question / spam
- For positive: books a Zoom discovery call via Calendly, synced to client timezone
- For questions: generates a short, human reply using Diagnoser context
- Logs all reply data for metrics
"""

import re
import requests
from .base import BaseAgent, load_state, save_state
from .llm import generate, FAST

CALENDLY_BASE = "https://api.calendly.com"


class Mobile(BaseAgent):
    name = "mobile"

    def handle_reply(self, reply: dict) -> dict:
        """
        reply = {
          "lead_id": str,
          "channel": str,          # email | sms | instagram_dm | linkedin
          "from": str,             # email address, phone, IG handle, or LinkedIn URN
          "message": str,          # raw reply text
          "received_at": str,
          "lead_name": str,
          "lead_city": str,
          "lead_niche": str,
        }
        """
        self.log.info(f"Mobile handling reply from {reply.get('lead_name')} via {reply.get('channel')}")

        classification = self._classify_reply(reply["message"])
        result = {
            **reply,
            "classification": classification["type"],
            "handled_at": self._ts(),
        }

        if classification["type"] == "positive":
            booking = self._book_calendly(reply)
            result["booking"] = booking
            result["follow_up_sent"] = True
            result["follow_up_message"] = booking.get("confirmation_message", "")
            self._log_reply(reply["lead_id"], "positive", booking.get("booking_url", ""))

        elif classification["type"] == "question":
            answer = self._answer_question(reply, classification["question"])
            result["follow_up_sent"] = True
            result["follow_up_message"] = answer
            self._log_reply(reply["lead_id"], "question", "")

        elif classification["type"] == "negative":
            self._log_reply(reply["lead_id"], "negative", "")
            result["follow_up_sent"] = False

        else:
            result["follow_up_sent"] = False

        # Update replies state
        replies = load_state("replies")
        replies[reply["lead_id"]] = result
        save_state("replies", replies)

        return result

    def _classify_reply(self, message: str) -> dict:
        prompt = f"""Classify this reply to a cold outreach message about building a business website.

Reply: "{message}"

Classify as exactly one of:
- positive: They're interested, want to know more, ask about pricing, say yes, ask to schedule a call
- question: They have a specific question but haven't committed either way
- negative: Not interested, unsubscribe, wrong person, stop messaging
- spam: Automated response, out-of-office, or irrelevant

If question, extract the core question text.

Format:
TYPE: positive/question/negative/spam
QUESTION: [only if type=question, the core question in one sentence]"""

        try:
            text = generate(prompt, model=FAST, max_tokens=100)
            type_match = re.search(r"TYPE:\s*(\w+)", text)
            q_match = re.search(r"QUESTION:\s*(.+)", text)
            return {
                "type": type_match.group(1).lower() if type_match else "spam",
                "question": q_match.group(1).strip() if q_match else "",
            }
        except Exception as e:
            self.log.warning(f"Classification failed: {e}")
            return {"type": "question", "question": message}

    def _book_calendly(self, reply: dict) -> dict:
        token = get_api_key("calendly_token")
        event_type_uuid = get_api_key("calendly_event_type")

        if not token or not event_type_uuid:
            self.log.warning("Calendly not configured, generating manual booking message")
            return self._manual_booking_message(reply)

        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # Create a single-use scheduling link for this invitee
        try:
            resp = requests.post(
                f"{CALENDLY_BASE}/scheduling_links",
                headers=headers,
                json={
                    "max_event_count": 1,
                    "owner": f"https://api.calendly.com/event_types/{event_type_uuid}",
                    "owner_type": "EventType",
                },
                timeout=15,
            )
            resp.raise_for_status()
            booking_url = resp.json()["resource"]["booking_url"]
        except Exception as e:
            self.log.error(f"Calendly scheduling link failed: {e}")
            return self._manual_booking_message(reply)

        # Generate confirmation message tailored to channel
        confirmation = self._booking_confirmation(reply, booking_url)

        return {
            "booking_url": booking_url,
            "confirmation_message": confirmation,
            "method": "calendly",
        }

    def _booking_confirmation(self, reply: dict, booking_url: str) -> str:
        channel = reply.get("channel", "email")
        name_parts = reply.get("lead_name", "").split()
        first_name = name_parts[0] if name_parts else "there"

        if channel in ("sms", "instagram_dm"):
            return (
                f"Hey {first_name} — great to hear from you! "
                f"Here's a link to grab 15 min on my calendar: {booking_url} "
                f"I'll show you exactly what the site would look like for your business."
            )
        else:
            return (
                f"Hi {first_name},\n\n"
                f"Thanks for getting back to me — really appreciate it.\n\n"
                f"Here's a link to grab a quick 15-minute call: {booking_url}\n\n"
                f"I'll walk you through the mockup and answer any questions. No pressure at all.\n\n"
                f"Talk soon,\nKareem"
            )

    def _manual_booking_message(self, reply: dict) -> dict:
        channel = reply.get("channel", "email")
        name_parts = reply.get("lead_name", "").split()
        first_name = name_parts[0] if name_parts else "there"
        calendly_fallback = "https://kareemjamaltherealtor.com"

        msg = (
            f"Hey {first_name} — glad you reached out. "
            f"Want to hop on a quick 15-min call this week? "
            f"You can pick a time here: {calendly_fallback}"
        ) if channel in ("sms", "instagram_dm") else (
            f"Hi {first_name},\n\nThanks for your reply. "
            f"Happy to jump on a quick 15-minute call — pick a time that works for you: {calendly_fallback}\n\nBest,\nKareem"
        )

        return {
            "booking_url": calendly_fallback,
            "confirmation_message": msg,
            "method": "manual",
        }

    def _answer_question(self, reply: dict, question: str) -> str:
        niche = reply.get("lead_niche", "").replace("_", " ")

        prompt = f"""A {reply.get('city')} {niche} just replied to a cold outreach message about a free website mockup.
Their question: "{question}"

Write a SHORT reply (under 60 words) that:
- Answers their specific question directly
- Sounds like a real person, not a bot
- Ends with a soft call-to-action to hop on a quick 15-min call
- Channel: {reply.get('channel', 'email')}
- Use first name if you know it: {reply.get('lead_name', '').split()[0] if reply.get('lead_name') else ''}

Output only the reply message."""

        try:
            return generate(prompt, model=FAST, max_tokens=150)
        except Exception as e:
            self.log.error(f"Question answering failed: {e}")
            return "Thanks for reaching out — happy to answer that on a quick call. Want to grab 15 minutes this week?"

    def _log_reply(self, lead_id: str, reply_type: str, booking_url: str) -> None:
        metrics = load_state("metrics")
        today = self._ts()[:10]
        day_metrics = metrics.setdefault(today, {})
        reply_log = day_metrics.setdefault("replies", [])
        reply_log.append({
            "lead_id": lead_id,
            "type": reply_type,
            "booking_url": booking_url,
            "logged_at": self._ts(),
        })
        save_state("metrics", metrics)

    def poll_inbound_replies(self) -> list[dict]:
        """
        Poll all configured channels for new replies to pitched messages.
        Returns a list of reply dicts for handle_reply().
        In production: replace with webhooks (SendGrid Inbound Parse,
        Twilio webhook, Instagram Webhooks API, LinkedIn webhook).
        """
        pitched = load_state("pitched")
        replies = load_state("replies")
        already_handled = set(replies.keys())
        new_replies = []

        for lead_id, pitch_data in pitched.items():
            if lead_id in already_handled:
                continue
            if not pitch_data.get("sent"):
                continue

            channel = pitch_data.get("channel", "")

            if channel == "email":
                inbound = self._poll_email_inbound(pitch_data)
            elif channel == "sms":
                inbound = self._poll_sms_inbound(pitch_data)
            else:
                inbound = []

            for msg in inbound:
                new_replies.append({
                    "lead_id": lead_id,
                    "channel": channel,
                    "from": pitch_data.get("recipient", ""),
                    "message": msg["body"],
                    "received_at": msg.get("date", self._ts()),
                    "lead_name": pitch_data.get("name", ""),
                    "lead_city": pitch_data.get("city", ""),
                    "lead_niche": pitch_data.get("niche", ""),
                })

        return new_replies

    def _poll_email_inbound(self, pitch_data: dict) -> list[dict]:
        # Production: use SendGrid Inbound Parse webhook stored to state/inbound_email.json
        inbound = load_state("inbound_email")
        recipient = pitch_data.get("recipient", "")
        return [m for m in inbound.get("messages", []) if m.get("to") == recipient]

    def _poll_sms_inbound(self, pitch_data: dict) -> list[dict]:
        # Production: use Twilio webhook stored to state/inbound_sms.json
        inbound = load_state("inbound_sms")
        phone = pitch_data.get("recipient", "")
        return [m for m in inbound.get("messages", []) if m.get("from") == phone]
