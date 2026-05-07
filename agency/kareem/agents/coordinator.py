"""
Coordinator — transaction checklist automation from accepted offer to close.

Tracks milestones, sends timed reminders to Kareem, client, lender, and title.
Integrates with DocuSign (webhooks) and calendar (Calendly/Google Cal).
"""

import os
import requests
from datetime import date, datetime, timedelta
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from agents.base import BaseAgent, load_state, save_state

CONFIG_DIR = Path(__file__).parent.parent / "config"


SELLER_MILESTONES = [
    {"name": "Listing agreement signed",        "day_offset": 0,   "notify": ["agent", "client"]},
    {"name": "Professional photos scheduled",   "day_offset": 2,   "notify": ["agent"]},
    {"name": "MLS listing live",                "day_offset": 4,   "notify": ["agent", "client"]},
    {"name": "First open house",                "day_offset": 7,   "notify": ["client"]},
    {"name": "Offer review deadline",           "day_offset": 14,  "notify": ["agent", "client"]},
    {"name": "Accepted offer — into escrow",    "day_offset": 0,   "notify": ["agent", "client", "title"]},
    {"name": "Inspection contingency deadline", "day_offset": 10,  "notify": ["agent", "client"]},
    {"name": "Appraisal contingency deadline",  "day_offset": 17,  "notify": ["agent", "client", "lender"]},
    {"name": "Loan contingency removal",        "day_offset": 21,  "notify": ["agent", "client", "lender"]},
    {"name": "Final walkthrough",               "day_offset": -1,  "notify": ["agent", "client"]},
    {"name": "Close of escrow",                 "day_offset": 30,  "notify": ["agent", "client", "title"]},
]

BUYER_MILESTONES = [
    {"name": "Pre-approval confirmed",          "day_offset": 0,   "notify": ["agent", "client", "lender"]},
    {"name": "Offer submitted",                 "day_offset": 0,   "notify": ["agent", "client"]},
    {"name": "Offer accepted — into escrow",    "day_offset": 0,   "notify": ["agent", "client", "title"]},
    {"name": "Earnest money deposited",         "day_offset": 3,   "notify": ["agent", "client", "title"]},
    {"name": "Inspection scheduled",            "day_offset": 5,   "notify": ["agent", "client"]},
    {"name": "Inspection contingency deadline", "day_offset": 10,  "notify": ["agent", "client"]},
    {"name": "Appraisal ordered",               "day_offset": 7,   "notify": ["agent", "lender"]},
    {"name": "Loan approval received",          "day_offset": 21,  "notify": ["agent", "client", "lender"]},
    {"name": "Final walkthrough",               "day_offset": -1,  "notify": ["agent", "client"]},
    {"name": "Signing appointment",             "day_offset": -2,  "notify": ["agent", "client", "title"]},
    {"name": "Keys in hand — close of escrow",  "day_offset": 30,  "notify": ["agent", "client"]},
]


def _cfg():
    import json
    return json.loads((CONFIG_DIR / "settings.json").read_text())


class Coordinator(BaseAgent):
    name = "kareem.coordinator"

    def open_transaction(self, lead: dict, transaction_type: str, close_date: str) -> dict:
        """Open a new transaction and build the milestone timeline."""
        self.log.info(f"Opening {transaction_type} transaction for {lead.get('name')}")

        close_dt = date.fromisoformat(close_date)
        milestones = SELLER_MILESTONES if transaction_type == "seller" else BUYER_MILESTONES

        timeline = []
        for m in milestones:
            if m["day_offset"] <= 0:
                due = close_dt + timedelta(days=m["day_offset"])
            else:
                # Positive offsets from today (transaction open date)
                due = date.today() + timedelta(days=m["day_offset"])
            timeline.append({
                "milestone": m["name"],
                "due_date": str(due),
                "notify": m["notify"],
                "completed": False,
                "completed_at": None,
            })

        transaction = {
            "id": f"txn_{lead.get('id', '')}_{date.today().isoformat()}",
            "lead_id": lead.get("id"),
            "client_name": lead.get("name"),
            "address": lead.get("address"),
            "city": lead.get("city"),
            "type": transaction_type,
            "close_date": close_date,
            "timeline": timeline,
            "opened_at": self._ts(),
            "status": "active",
        }

        transactions = load_state("kareem_transactions")
        transactions[transaction["id"]] = transaction
        save_state("kareem_transactions", transactions)

        return transaction

    def run_daily_checks(self) -> list[dict]:
        """Send reminders for any milestone due today or overdue."""
        cfg = _cfg()
        transactions = load_state("kareem_transactions")
        today = str(date.today())
        reminders_sent = []

        for txn_id, txn in transactions.items():
            if txn.get("status") != "active":
                continue

            for milestone in txn.get("timeline", []):
                if milestone.get("completed"):
                    continue
                due = milestone.get("due_date", "")
                if due <= today:
                    reminder = self._send_reminder(cfg, txn, milestone)
                    if reminder:
                        reminders_sent.append(reminder)

        self.log.info(f"Coordinator sent {len(reminders_sent)} reminders")
        return reminders_sent

    def mark_complete(self, transaction_id: str, milestone_name: str) -> bool:
        transactions = load_state("kareem_transactions")
        txn = transactions.get(transaction_id)
        if not txn:
            return False

        for m in txn["timeline"]:
            if m["milestone"] == milestone_name:
                m["completed"] = True
                m["completed_at"] = self._ts()

        # Check if all milestones done → close transaction
        if all(m["completed"] for m in txn["timeline"]):
            txn["status"] = "closed"
            txn["closed_at"] = self._ts()

        transactions[transaction_id] = txn
        save_state("kareem_transactions", transactions)
        return True

    def _send_reminder(self, cfg: dict, txn: dict, milestone: dict) -> dict | None:
        api_key = self._resolve_key(cfg, "sendgrid_key")
        if not api_key:
            self.log.warning(f"SendGrid not configured — skipping reminder: {milestone['milestone']}")
            return None

        agent_email = cfg["agent"]["email"]
        subject = f"[{txn['type'].title()} Txn] Due: {milestone['milestone']} — {txn['address']}"
        body = (
            f"Transaction reminder for {txn['client_name']}\n"
            f"Property: {txn['address']}, {txn['city']}\n"
            f"Milestone: {milestone['milestone']}\n"
            f"Due: {milestone['due_date']}\n"
            f"Notify: {', '.join(milestone['notify'])}\n\n"
            f"Mark complete in the coordinator dashboard or reply DONE to this email."
        )

        try:
            resp = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "personalizations": [{"to": [{"email": agent_email}]}],
                    "from": {"email": agent_email, "name": "KJ Transaction Bot"},
                    "subject": subject,
                    "content": [{"type": "text/plain", "value": body}],
                },
                timeout=15,
            )
            if resp.status_code in (200, 202):
                return {"txn_id": txn["id"], "milestone": milestone["milestone"], "sent": True}
        except Exception as e:
            self.log.error(f"Reminder send failed: {e}")

        return None

    def _resolve_key(self, cfg: dict, key_name: str) -> str:
        raw = cfg.get("apis", {}).get(key_name, "")
        if raw.startswith("${") and raw.endswith("}"):
            return os.environ.get(raw[2:-1], "")
        return raw
