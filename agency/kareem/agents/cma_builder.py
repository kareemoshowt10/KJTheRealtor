"""
CMABuilder — pulls comps and builds a Comparative Market Analysis for a lead's property.
Used to personalize outreach ("your home is likely worth $X based on recent sales").
"""

import requests
from pathlib import Path
import sys, os

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from agents.base import BaseAgent
from agents.llm import generate, FAST

CONFIG_DIR = Path(__file__).parent.parent / "config"


def _cfg():
    import json
    return json.loads((CONFIG_DIR / "settings.json").read_text())


class CMABuilder(BaseAgent):
    name = "kareem.cma_builder"

    def run(self, lead: dict) -> dict:
        self.log.info(f"Building CMA for {lead.get('address')}")
        comps = self._fetch_comps(lead)
        summary = self._summarize_cma(lead, comps)

        return {
            **lead,
            "comps": comps,
            "cma_summary": summary["text"],
            "estimated_value": summary["estimated_value"],
            "price_per_sqft": summary["price_per_sqft"],
            "cma_built_at": self._ts(),
        }

    def _fetch_comps(self, lead: dict) -> list[dict]:
        cfg = _cfg()
        api_key = self._resolve_key(cfg, "attom_key")
        if not api_key:
            return []

        try:
            resp = requests.get(
                "https://api.gateway.attomdata.com/propertyapi/v1.0.0/sale/snapshot",
                headers={"apikey": api_key, "Accept": "application/json"},
                params={
                    "address1": lead.get("address", ""),
                    "address2": f"{lead.get('city', '')}, CA",
                    "radius": "0.5",
                    "minSaleDate": "2024-01-01",
                    "pagesize": 6,
                },
                timeout=15,
            )
            resp.raise_for_status()
            comps = []
            for prop in resp.json().get("property", []):
                sale = prop.get("sale", {})
                building = prop.get("building", {})
                comps.append({
                    "address": prop.get("address", {}).get("line1", ""),
                    "sale_price": sale.get("amount", {}).get("saleamt", 0),
                    "sale_date": sale.get("salesearchdate", ""),
                    "sqft": building.get("size", {}).get("livingsize", 0),
                    "bedrooms": building.get("rooms", {}).get("beds", 0),
                    "bathrooms": building.get("rooms", {}).get("bathstotal", 0),
                })
            return comps
        except Exception as e:
            self.log.warning(f"Comps fetch failed: {e}")
            return []

    def _summarize_cma(self, lead: dict, comps: list[dict]) -> dict:
        if not comps:
            return {
                "text": f"Based on recent sales in {lead.get('city')}, properties in this area are performing well.",
                "estimated_value": lead.get("avm", lead.get("list_price", 0)),
                "price_per_sqft": 0,
            }

        valid_comps = [c for c in comps if c.get("sale_price") and c.get("sqft")]
        avg_ppsf = (
            sum(c["sale_price"] / c["sqft"] for c in valid_comps) / len(valid_comps)
            if valid_comps else 0
        )
        avg_price = sum(c["sale_price"] for c in comps if c.get("sale_price")) / len(comps)
        sqft = lead.get("sqft", 0)
        est_value = int(avg_ppsf * sqft) if sqft and avg_ppsf else int(avg_price)

        comp_lines = "\n".join(
            f"- {c['address']}: ${c['sale_price']:,} ({c['sqft']:,} sqft, {c['sale_date']})"
            for c in comps[:4]
        )

        prompt = f"""Write a 2-sentence CMA summary for a seller lead outreach message.
Property: {lead.get('address')}, {lead.get('city')}, CA
Estimated value: ${est_value:,}
Recent comps:
{comp_lines}

Rules:
- Sound like a knowledgeable local agent, not a robot
- Mention the estimated value and one specific comp detail
- Tone: confident but conversational
- Do NOT use "leverage", "game-changer", or any AI buzzwords
Output only the 2 sentences."""

        try:
            text = generate(prompt, model=FAST, max_tokens=120)
        except Exception:
            text = f"Based on recent sales nearby, your home could be worth around ${est_value:,} in today's market."

        return {
            "text": text,
            "estimated_value": est_value,
            "price_per_sqft": round(avg_ppsf, 2),
        }

    def _resolve_key(self, cfg: dict, key_name: str) -> str:
        import os
        raw = cfg.get("apis", {}).get(key_name, "")
        if raw.startswith("${") and raw.endswith("}"):
            return os.environ.get(raw[2:-1], "")
        return raw
