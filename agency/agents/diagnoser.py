"""
Diagnoser — for each lead produces:
  - 50-word diagnosis of their digital gap
  - Hero angle tied to local market opportunity
  - Tone-matched cold message <70 words
  - Opportunity score (0–100)
  - Estimated deal value
"""

import re
from .base import BaseAgent, load_config
from .llm import generate, SMART

SCORING_WEIGHTS = {
    "no_website": 30,
    "outdated_website": 20,
    "low_reviews": 15,
    "high_rating": 10,
    "local_market_gap": 25,
}


class Diagnoser(BaseAgent):
    name = "diagnoser"

    def run(self, lead: dict) -> dict:
        self.log.info(f"Diagnosing lead: {lead['name']} ({lead['niche']})")
        niche_data = self.niches.get(lead["niche"], {})
        score = self._score_lead(lead)
        diagnosis = self._generate_diagnosis(lead, niche_data)
        cold_message = self._generate_cold_message(lead, niche_data, diagnosis)
        channel = self.settings["channels"].get(lead["niche"], "email")

        return {
            **lead,
            "score": score,
            "diagnosis": diagnosis["text"],
            "hero_angle": diagnosis["hero_angle"],
            "tone": niche_data.get("tone", "professional"),
            "cold_message": cold_message,
            "channel": channel,
            "est_deal_value": self._estimate_deal_value(lead, score),
            "diagnosed_at": self._ts(),
        }

    def _score_lead(self, lead: dict) -> int:
        score = 0
        w = SCORING_WEIGHTS

        if lead.get("website_status") == "none":
            score += w["no_website"]
        elif lead.get("website_status") == "outdated":
            score += w["outdated_website"]

        if lead.get("review_count", 999) < 20:
            score += w["low_reviews"]
        elif lead.get("review_count", 999) < 50:
            score += int(w["low_reviews"] * 0.5)

        if lead.get("rating", 0) >= 4.5:
            score += w["high_rating"]
        elif lead.get("rating", 0) >= 4.0:
            score += int(w["high_rating"] * 0.5)

        # Local market gap bonus for SFV niches with <10 reviews
        if lead.get("city") in ["Woodland Hills", "Calabasas", "Westlake Village"]:
            score += int(w["local_market_gap"] * 0.5)
        if lead.get("review_count", 999) < 10:
            score += w["local_market_gap"]

        return min(score, 100)

    def _generate_diagnosis(self, lead: dict, niche_data: dict) -> dict:
        pain_points = "\n".join(f"- {p}" for p in niche_data.get("pain_points", []))
        hero_angles = "\n".join(f"- {a}" for a in niche_data.get("hero_angles", []))

        prompt = f"""You are a sharp digital marketing strategist analyzing a local business lead.

Business: {lead['name']}
Type: {lead['niche'].replace('_', ' ').title()}
City: {lead['city']}, CA
Rating: {lead['rating']} ({lead['review_count']} reviews)
Website status: {lead['website_status']} (none = no site, outdated = pre-2015)

Common pain points for this niche:
{pain_points}

Possible hero angles:
{hero_angles}

Write exactly:
1. DIAGNOSIS: A 50-word max diagnosis of their specific digital gap and how it costs them business in the {lead['city']} market. Be specific, not generic.
2. HERO_ANGLE: Pick the single best hero angle from the list above OR craft a sharper one specific to their situation. One sentence.

Format:
DIAGNOSIS: [text]
HERO_ANGLE: [text]"""

        text = generate(prompt, model=SMART, max_tokens=300)

        diagnosis_match = re.search(r"DIAGNOSIS:\s*(.+?)(?=HERO_ANGLE:|$)", text, re.DOTALL)
        hero_match = re.search(r"HERO_ANGLE:\s*(.+)", text, re.DOTALL)

        return {
            "text": diagnosis_match.group(1).strip() if diagnosis_match else text[:200],
            "hero_angle": hero_match.group(1).strip() if hero_match else niche_data.get("hero_angles", [""])[0],
        }

    def _generate_cold_message(self, lead: dict, niche_data: dict, diagnosis: dict) -> str:
        channel = self.settings["channels"].get(lead["niche"], "email")
        tone = niche_data.get("tone", "professional")

        channel_note = {
            "email": "This is a cold email. Subject line not needed. Start with their name.",
            "sms": "This is a cold SMS. Ultra brief. No greetings like 'Dear'. Get to the point in 2 sentences.",
            "instagram_dm": "This is an Instagram DM. Conversational, visual-focused, mention their work specifically.",
            "linkedin": "This is a LinkedIn message. Professional peer tone. Reference their business, not a pitch.",
        }.get(channel, "")

        site_context = "no website" if lead["website_status"] == "none" else "an outdated website"

        prompt = f"""Write a personalized cold outreach message for this lead. STRICT RULES:
- Under 70 words total
- Zero AI buzzwords (no: leverage, game-changer, revolutionize, cutting-edge, innovative, synergy, seamlessly)
- Sounds like a human local business owner wrote it
- Mention their specific city or business name naturally
- One clear offer: a free mockup of what their website could look like
- No fake urgency or spam triggers
- Tone: {tone}

{channel_note}

Business: {lead['name']} ({lead['city']})
They have: {site_context}
Hero angle: {diagnosis['hero_angle']}
Diagnosis: {diagnosis['text']}

Write only the message. Nothing else."""

        return generate(prompt, model=SMART, max_tokens=200)

    def _estimate_deal_value(self, lead: dict, score: int) -> float:
        base = {
            "real_estate_agent": 1200,
            "mortgage_broker": 1500,
            "title_company": 2000,
            "property_manager": 1800,
            "home_inspector": 800,
            "general_contractor": 1000,
            "moving_company": 700,
            "home_stager": 900,
            "real_estate_photographer": 600,
            "interior_designer": 1100,
        }.get(lead["niche"], 1000)

        # Higher score = more urgent = closer to top of range
        multiplier = 1.0 + (score / 100) * 0.5
        return round(base * multiplier, 2)
