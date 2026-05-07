"""
Checker — quality gate before any message is sent.
Evaluates:
  1. Personalization (mentions business name, city, or specific detail)
  2. No AI buzzwords or markers
  3. Real estate relevance
  4. Under 70 words
  5. Channel-appropriate tone
Returns: {"approved": bool, "issues": list[str], "revised_message": str | None}
"""

import re
from anthropic import Anthropic
from .base import BaseAgent, get_api_key

AI_BUZZWORDS = [
    "leverage", "game-changer", "game changer", "revolutionize", "cutting-edge",
    "innovative", "synergy", "seamlessly", "robust", "utilize", "empower",
    "streamline", "holistic", "paradigm", "transformative", "disruptive",
    "scalable", "best-in-class", "world-class", "thought leader", "ecosystem",
    "value proposition", "low-hanging fruit", "move the needle", "circle back",
    "deep dive", "bandwidth", "actionable insights", "at the end of the day",
    "it goes without saying", "in today's fast-paced", "touch base",
    "I hope this message finds you", "I wanted to reach out",
    "I am writing to", "I came across your",
]


class Checker(BaseAgent):
    name = "checker"

    def __init__(self):
        super().__init__()
        self.client = None

    def _get_client(self):
        if not self.client:
            self.client = Anthropic(api_key=get_api_key("anthropic_key"))
        return self.client

    def run(self, lead: dict) -> dict:
        message = lead.get("cold_message", "")
        niche = lead.get("niche", "")
        channel = lead.get("channel", "email")

        issues = []

        # 1. Word count
        word_count = len(message.split())
        if word_count > 70:
            issues.append(f"Too long: {word_count} words (max 70)")

        # 2. AI buzzwords
        lower = message.lower()
        found_buzzwords = [b for b in AI_BUZZWORDS if b in lower]
        if found_buzzwords:
            issues.append(f"AI buzzwords detected: {', '.join(found_buzzwords)}")

        # 3. Personalization check
        name = lead.get("name", "")
        city = lead.get("city", "")
        has_name = name.split()[0].lower() in lower if name else False
        has_city = city.lower() in lower if city else False
        if not has_name and not has_city:
            issues.append("Missing personalization: no business name or city mentioned")

        # 4. Real estate relevance
        re_terms = [
            "listing", "home", "property", "client", "lead", "buyer", "seller",
            "market", "real estate", "agent", "website", "online", "booking",
            "inspection", "contractor", "move", "staging", "mortgage", "loan",
        ]
        if not any(t in lower for t in re_terms):
            issues.append("Low real estate relevance: no industry terms found")

        # 5. LLM-based final check for naturalness
        llm_result = self._llm_check(message, lead, channel)
        if not llm_result["sounds_human"]:
            issues.append(f"Sounds AI-generated: {llm_result['reason']}")

        approved = len(issues) == 0
        revised = None

        if not approved and len(issues) <= 2:
            # Attempt auto-revision for minor issues
            revised = self._auto_revise(message, issues, lead, channel)
            if revised:
                approved = True
                issues = []

        self.log.info(
            f"Checker {'APPROVED' if approved else 'REJECTED'} message for {lead.get('name')} "
            f"({len(issues)} issue(s))"
        )

        return {
            "approved": approved,
            "issues": issues,
            "revised_message": revised,
            "original_message": message,
            "word_count": word_count,
            "checked_at": self._ts(),
        }

    def _llm_check(self, message: str, lead: dict, channel: str) -> dict:
        client = self._get_client()
        prompt = f"""You are reviewing a cold outreach message before it's sent to a real local business owner.

Channel: {channel}
Business: {lead.get('name')} ({lead.get('niche', '').replace('_', ' ')}) in {lead.get('city')}
Message:
---
{message}
---

Answer these questions with YES or NO:
1. Does this sound like it was written by a real human (not AI)?
2. Is it under 70 words? (actual count doesn't matter, just does it feel tight?)
3. Does it mention something specific about this business or city?

Then give a one-line verdict: HUMAN or AI_SOUNDING
And a one-line reason if AI_SOUNDING.

Format:
Q1: YES/NO
Q2: YES/NO
Q3: YES/NO
VERDICT: HUMAN or AI_SOUNDING
REASON: [only if AI_SOUNDING]"""

        try:
            resp = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=150,
                messages=[{"role": "user", "content": prompt}],
            )
            text = resp.content[0].text
            sounds_human = "VERDICT: HUMAN" in text
            reason_match = re.search(r"REASON:\s*(.+)", text)
            reason = reason_match.group(1).strip() if reason_match else ""
            return {"sounds_human": sounds_human, "reason": reason}
        except Exception as e:
            self.log.warning(f"LLM check failed: {e}")
            return {"sounds_human": True, "reason": ""}

    def _auto_revise(self, message: str, issues: list[str], lead: dict, channel: str) -> str | None:
        client = self._get_client()
        issues_str = "\n".join(f"- {i}" for i in issues)

        prompt = f"""Revise this cold outreach message to fix these specific issues:
{issues_str}

Original message:
---
{message}
---

Rules:
- Fix ONLY the listed issues, change nothing else
- Keep under 70 words
- Zero AI buzzwords
- Must mention {lead.get('name')} or {lead.get('city')}
- Channel: {channel}

Output only the revised message, nothing else."""

        try:
            resp = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=150,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.content[0].text.strip()
        except Exception as e:
            self.log.warning(f"Auto-revision failed: {e}")
            return None
