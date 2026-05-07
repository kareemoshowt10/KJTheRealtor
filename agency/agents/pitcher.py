"""
Pitcher — sends personalized cold messages via the right channel:
  - Email: agents, inspectors, mortgage brokers, title companies
  - SMS: contractors, movers
  - Instagram DM: stagers, photographers, interior designers
  - LinkedIn: property managers, realtors (professional accounts)
"""

import requests
from .base import BaseAgent, get_api_key

SENDGRID_API = "https://api.sendgrid.com/v3/mail/send"
TWILIO_BASE = "https://api.twilio.com/2010-04-01"


class Pitcher(BaseAgent):
    name = "pitcher"

    def run(self, lead: dict) -> dict:
        channel = lead.get("channel", "email")
        message = lead.get("revised_message") or lead.get("cold_message", "")
        mockup_url = lead.get("mockup_url", "")
        video_url = lead.get("video_url", "")

        self.log.info(f"Pitcher sending via {channel} to {lead['name']}")

        result = {
            "channel": channel,
            "sent": False,
            "error": None,
            "pitched_at": self._ts(),
        }

        try:
            if channel == "email":
                result.update(self._send_email(lead, message, mockup_url, video_url))
            elif channel == "sms":
                result.update(self._send_sms(lead, message, mockup_url))
            elif channel == "instagram_dm":
                result.update(self._send_instagram_dm(lead, message, mockup_url, video_url))
            elif channel == "linkedin":
                result.update(self._send_linkedin(lead, message, mockup_url))
            else:
                result["error"] = f"Unknown channel: {channel}"
        except Exception as e:
            result["error"] = str(e)
            self.log.error(f"Pitcher error ({channel}) for {lead['name']}: {e}")

        return {**lead, **result}

    def _send_email(self, lead: dict, message: str, mockup_url: str, video_url: str) -> dict:
        api_key = get_api_key("sendgrid_key")
        sender = get_api_key("sendgrid_from")
        recipient = lead.get("email", "")

        if not recipient:
            return {"sent": False, "error": "No email address found"}
        if not api_key:
            return {"sent": False, "error": "SendGrid not configured"}

        subject = self._email_subject(lead)
        html_body = self._email_html(message, mockup_url, video_url, lead)

        payload = {
            "personalizations": [{"to": [{"email": recipient, "name": lead["name"]}]}],
            "from": {"email": sender, "name": "Kareem Jamal"},
            "subject": subject,
            "content": [
                {"type": "text/plain", "value": message + f"\n\nMockup preview: {mockup_url}"},
                {"type": "text/html", "value": html_body},
            ],
        }

        resp = requests.post(
            SENDGRID_API,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload,
            timeout=15,
        )
        if resp.status_code in (200, 202):
            return {"sent": True, "recipient": recipient}
        return {"sent": False, "error": f"SendGrid {resp.status_code}: {resp.text[:100]}"}

    def _send_sms(self, lead: dict, message: str, mockup_url: str) -> dict:
        sid = get_api_key("twilio_sid")
        token = get_api_key("twilio_token")
        from_num = get_api_key("twilio_from")
        to_num = lead.get("phone", "")

        if not to_num:
            return {"sent": False, "error": "No phone number found"}
        if not sid or not token:
            return {"sent": False, "error": "Twilio not configured"}

        # Normalize phone number
        to_num = "".join(c for c in to_num if c.isdigit() or c == "+")
        if not to_num.startswith("+"):
            to_num = "+1" + to_num.lstrip("1")

        sms_body = f"{message}\n\nPreview: {mockup_url}" if mockup_url else message
        if len(sms_body) > 160:
            sms_body = message[:155] + "…"

        resp = requests.post(
            f"{TWILIO_BASE}/Accounts/{sid}/Messages.json",
            auth=(sid, token),
            data={"From": from_num, "To": to_num, "Body": sms_body},
            timeout=15,
        )
        data = resp.json()
        if data.get("sid"):
            return {"sent": True, "sms_sid": data["sid"], "recipient": to_num}
        return {"sent": False, "error": data.get("message", "Twilio error")}

    def _send_instagram_dm(self, lead: dict, message: str, mockup_url: str, video_url: str) -> dict:
        session_id = get_api_key("instagram_session")
        ig_handle = lead.get("instagram", "")

        if not ig_handle:
            return {"sent": False, "error": "No Instagram handle found"}
        if not session_id:
            return {"sent": False, "error": "Instagram session not configured"}

        # Use Instagram private API (instagrapi-style endpoint)
        # Production: replace with official Meta Business Messaging API or instagrapi library
        try:
            headers = {
                "Cookie": f"sessionid={session_id}",
                "User-Agent": "Instagram 275.0.0.27.98 Android",
                "X-IG-App-ID": "936619743392459",
            }
            # Resolve user ID from handle
            user_resp = requests.get(
                f"https://i.instagram.com/api/v1/users/web_profile_info/?username={ig_handle}",
                headers=headers,
                timeout=10,
            )
            uid = user_resp.json()["data"]["user"]["id"]

            dm_text = f"{message}\n\n👉 Your free mockup preview: {mockup_url}" if mockup_url else message

            # Send DM
            dm_resp = requests.post(
                "https://i.instagram.com/api/v1/direct_v2/threads/broadcast/text/",
                headers=headers,
                data={"recipient_users": f"[[{uid}]]", "text": dm_text},
                timeout=15,
            )
            if dm_resp.status_code == 200:
                return {"sent": True, "recipient": f"@{ig_handle}"}
            return {"sent": False, "error": f"IG DM {dm_resp.status_code}"}
        except Exception as e:
            return {"sent": False, "error": str(e)}

    def _send_linkedin(self, lead: dict, message: str, mockup_url: str) -> dict:
        token = get_api_key("linkedin_token")
        li_handle = lead.get("linkedin", "")

        if not li_handle:
            return {"sent": False, "error": "No LinkedIn profile found"}
        if not token:
            return {"sent": False, "error": "LinkedIn not configured"}

        # LinkedIn Messaging API (requires approved Marketing Developer Platform access)
        try:
            # Step 1: Get member URN from profile slug
            profile_resp = requests.get(
                f"https://api.linkedin.com/v2/people/(vanityName:{li_handle})",
                headers={"Authorization": f"Bearer {token}", "X-Restli-Protocol-Version": "2.0.0"},
                timeout=10,
            )
            member_urn = profile_resp.json().get("id")
            if not member_urn:
                return {"sent": False, "error": "Could not resolve LinkedIn URN"}

            # Step 2: Send message
            li_text = f"{message}\n\nHere's what your site could look like: {mockup_url}" if mockup_url else message
            msg_resp = requests.post(
                "https://api.linkedin.com/v2/messages",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0",
                },
                json={
                    "recipients": {"values": [{"person": {"com.linkedin.common.UrnId": member_urn}}]},
                    "subject": f"Your {lead['city']} online presence — quick idea",
                    "body": li_text,
                },
                timeout=15,
            )
            if msg_resp.status_code in (200, 201):
                return {"sent": True, "recipient": li_handle}
            return {"sent": False, "error": f"LinkedIn {msg_resp.status_code}"}
        except Exception as e:
            return {"sent": False, "error": str(e)}

    def _email_subject(self, lead: dict) -> str:
        subjects = {
            "real_estate_agent": f"Quick idea for more {lead['city']} listings",
            "home_inspector": f"One thing {lead['city']} buyers search before hiring an inspector",
            "general_contractor": f"Your {lead['city']} jobs, found online",
            "moving_company": f"More {lead['city']} bookings without Yelp fees",
            "home_stager": f"Your staging work deserves a proper home online",
            "mortgage_broker": f"Capturing {lead['city']} buyers before agents do",
            "title_company": f"A quick look at your {lead['city']} web presence",
            "property_manager": f"Landlords in {lead['city']} searching for PM help",
            "real_estate_photographer": f"Agents looking for photographers in {lead['city']}",
            "interior_designer": f"Your portfolio → your best salesperson",
        }
        return subjects.get(lead["niche"], f"Quick idea for {lead['name']}")

    def _email_html(self, message: str, mockup_url: str, video_url: str, lead: dict) -> str:
        mockup_section = ""
        if mockup_url and mockup_url.startswith("http"):
            mockup_section = f"""
            <p style="margin:24px 0 8px;">Here's a free mockup of what your site could look like:</p>
            <a href="{mockup_url}" style="display:inline-block;background:#1a1a2e;color:#e2b96f;
               font-weight:700;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:15px;">
               View Your Free Mockup →
            </a>"""

        video_section = ""
        if video_url and video_url.startswith("http"):
            video_section = f"""
            <p style="margin:16px 0 8px;color:#666;font-size:13px;">
               Or watch a 10-second preview: <a href="{video_url}" style="color:#1a1a2e;">{video_url}</a>
            </p>"""

        paragraphs = "".join(f"<p style='margin:0 0 14px;'>{p}</p>" for p in message.split("\n") if p.strip())

        return f"""<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  color:#1a1a2e;max-width:540px;margin:0 auto;padding:24px;">
  {paragraphs}
  {mockup_section}
  {video_section}
  <p style="margin-top:32px;color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">
    Kareem Jamal · Rodeo Realty Fine Estates · Woodland Hills, CA<br>
    <a href="https://kareemjamaltherealtor.com" style="color:#888;">kareemjamaltherealtor.com</a>
  </p>
</body></html>"""
