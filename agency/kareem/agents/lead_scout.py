"""
LeadScout — finds motivated sellers and active buyers for Kareem in the SFV.

Sources (in priority order):
  1. Expired MLS listings (CRMLS / Redx)
  2. FSBO listings (Zillow, Craigslist, Facebook Marketplace)
  3. Pre-foreclosure / Notice of Default (ATTOM or PropStream)
  4. Absentee / out-of-state owners in target zip codes
  5. Probate filings (county public records)

Each lead is scored 0–100 for motivation urgency.
"""

import hashlib
import re
import time
import requests
from datetime import date, datetime, timedelta
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from agents.base import BaseAgent

CONFIG_DIR = Path(__file__).parent.parent / "config"


def _cfg():
    import json
    return json.loads((CONFIG_DIR / "settings.json").read_text())


MOTIVATION_SCORES = {
    "expired_listing": 85,
    "pre_foreclosure": 95,
    "probate": 80,
    "absentee_owner": 60,
    "fsbo": 70,
}


class LeadScout(BaseAgent):
    name = "kareem.lead_scout"

    def run(self) -> list[dict]:
        cfg = _cfg()
        markets = cfg["markets"]["zip_codes"]
        sources = cfg["lead_sources"]
        leads = []

        if sources.get("expired_listings"):
            leads += self._fetch_expired_listings(cfg)
            time.sleep(1)

        if sources.get("fsbo"):
            leads += self._fetch_fsbo(cfg)
            time.sleep(1)

        if sources.get("pre_foreclosure"):
            leads += self._fetch_pre_foreclosure(cfg, markets)
            time.sleep(1)

        if sources.get("absentee_owners"):
            leads += self._fetch_absentee_owners(cfg, markets)
            time.sleep(1)

        if sources.get("probate"):
            leads += self._fetch_probate(cfg)

        # Deduplicate by address hash
        seen = set()
        unique = []
        for lead in leads:
            key = hashlib.md5(lead.get("address", lead.get("owner_name", "")).encode()).hexdigest()
            if key not in seen:
                seen.add(key)
                lead["id"] = key[:12]
                lead["scouted_date"] = str(date.today())
                lead["scouted_at"] = self._ts()
                unique.append(lead)

        self.log.info(f"LeadScout found {len(unique)} unique leads")
        return unique

    def _fetch_expired_listings(self, cfg: dict) -> list[dict]:
        """Pull listings that expired in the last 14 days via Redx or CRMLS."""
        api_key = self._resolve_key(cfg, "redx_key")
        if not api_key:
            self.log.warning("Redx key not set — skipping expired listings")
            return []

        leads = []
        cutoff = (datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d")

        for city in cfg["markets"]["primary"] + cfg["markets"]["secondary"]:
            try:
                resp = requests.get(
                    "https://api.redx.com/v2/expired",
                    headers={"Authorization": f"Bearer {api_key}"},
                    params={"city": city, "state": "CA", "expired_after": cutoff, "limit": 20},
                    timeout=15,
                )
                resp.raise_for_status()
                for r in resp.json().get("results", []):
                    leads.append({
                        "source": "expired_listing",
                        "type": "seller",
                        "name": r.get("owner_name", ""),
                        "address": r.get("address", ""),
                        "city": city,
                        "phone": r.get("phone", ""),
                        "email": r.get("email", ""),
                        "list_price": r.get("list_price", 0),
                        "days_on_market": r.get("days_on_market", 0),
                        "expired_date": r.get("expired_date", ""),
                        "bedrooms": r.get("bedrooms", 0),
                        "bathrooms": r.get("bathrooms", 0),
                        "sqft": r.get("sqft", 0),
                        "motivation_score": MOTIVATION_SCORES["expired_listing"],
                    })
            except Exception as e:
                self.log.warning(f"Redx error for {city}: {e}")

        return leads

    def _fetch_fsbo(self, cfg: dict) -> list[dict]:
        """Pull active FSBO listings from Zillow (via RapidAPI) and Craigslist."""
        leads = []

        # Zillow FSBO via RapidAPI
        rapidapi_key = self._resolve_env("RAPIDAPI_KEY")
        if rapidapi_key:
            for zip_code in cfg["markets"]["zip_codes"][:5]:
                try:
                    resp = requests.get(
                        "https://zillow-com1.p.rapidapi.com/propertyExtendedSearch",
                        headers={
                            "X-RapidAPI-Key": rapidapi_key,
                            "X-RapidAPI-Host": "zillow-com1.p.rapidapi.com",
                        },
                        params={"location": zip_code, "listingType": "FOR_SALE_BY_OWNER", "home_type": "Houses"},
                        timeout=15,
                    )
                    resp.raise_for_status()
                    for prop in resp.json().get("props", []):
                        leads.append({
                            "source": "fsbo",
                            "type": "seller",
                            "name": "",
                            "address": prop.get("address", ""),
                            "city": prop.get("city", ""),
                            "phone": "",
                            "email": "",
                            "list_price": prop.get("price", 0),
                            "bedrooms": prop.get("bedrooms", 0),
                            "bathrooms": prop.get("bathrooms", 0),
                            "sqft": prop.get("livingArea", 0),
                            "zillow_url": prop.get("detailUrl", ""),
                            "motivation_score": MOTIVATION_SCORES["fsbo"],
                        })
                    time.sleep(0.5)
                except Exception as e:
                    self.log.warning(f"Zillow FSBO error for {zip_code}: {e}")

        return leads

    def _fetch_pre_foreclosure(self, cfg: dict, zip_codes: list[str]) -> list[dict]:
        """Pull NOD/pre-foreclosure data from ATTOM Data."""
        api_key = self._resolve_key(cfg, "attom_key")
        if not api_key:
            self.log.warning("ATTOM key not set — skipping pre-foreclosure")
            return []

        leads = []
        for zip_code in zip_codes[:6]:
            try:
                resp = requests.get(
                    "https://api.gateway.attomdata.com/propertyapi/v1.0.0/assessment/detail",
                    headers={"apikey": api_key, "Accept": "application/json"},
                    params={"postalcode": zip_code, "foreclosurestatus": "NOD", "pagesize": 25},
                    timeout=15,
                )
                resp.raise_for_status()
                for prop in resp.json().get("property", []):
                    address_obj = prop.get("address", {})
                    owner = prop.get("owner", {})
                    leads.append({
                        "source": "pre_foreclosure",
                        "type": "seller",
                        "name": owner.get("owner1lastname", ""),
                        "address": address_obj.get("line1", ""),
                        "city": address_obj.get("locality", ""),
                        "zip": zip_code,
                        "phone": "",
                        "email": "",
                        "avm": prop.get("avm", {}).get("amount", {}).get("value", 0),
                        "equity_pct": self._calc_equity(prop),
                        "nod_date": prop.get("lien", {}).get("recordingdate", ""),
                        "motivation_score": MOTIVATION_SCORES["pre_foreclosure"],
                    })
                time.sleep(0.3)
            except Exception as e:
                self.log.warning(f"ATTOM error for {zip_code}: {e}")

        return leads

    def _fetch_absentee_owners(self, cfg: dict, zip_codes: list[str]) -> list[dict]:
        """Pull absentee/out-of-state owners from PropStream."""
        api_key = self._resolve_key(cfg, "propstream_key")
        if not api_key:
            self.log.warning("PropStream key not set — skipping absentee owners")
            return []

        leads = []
        for zip_code in zip_codes[:4]:
            try:
                resp = requests.post(
                    "https://api.propstream.com/v2/properties/search",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "zip": zip_code,
                        "ownerOccupied": False,
                        "propertyType": ["SFR", "Condo"],
                        "equityPercent": {"min": 40},
                        "limit": 20,
                    },
                    timeout=15,
                )
                resp.raise_for_status()
                for prop in resp.json().get("properties", []):
                    leads.append({
                        "source": "absentee_owner",
                        "type": "seller",
                        "name": prop.get("ownerName", ""),
                        "address": prop.get("propertyAddress", ""),
                        "city": prop.get("city", ""),
                        "zip": zip_code,
                        "phone": prop.get("phone", ""),
                        "email": prop.get("email", ""),
                        "avm": prop.get("estimatedValue", 0),
                        "equity_pct": prop.get("equityPercent", 0),
                        "owner_state": prop.get("mailingState", ""),
                        "motivation_score": MOTIVATION_SCORES["absentee_owner"],
                    })
                time.sleep(0.5)
            except Exception as e:
                self.log.warning(f"PropStream error for {zip_code}: {e}")

        return leads

    def _fetch_probate(self, cfg: dict) -> list[dict]:
        """Pull probate filings from LA County public records."""
        # Production: use ATTOM Probate endpoint or a court records scraper
        # Currently returns empty — wire up when ATTOM probate access is enabled
        api_key = self._resolve_key(cfg, "attom_key")
        if not api_key:
            return []

        leads = []
        try:
            resp = requests.get(
                "https://api.gateway.attomdata.com/propertyapi/v1.0.0/attomavm/detail",
                headers={"apikey": api_key, "Accept": "application/json"},
                params={"county": "Los Angeles", "state": "CA", "eventtype": "PROBATE", "pagesize": 15},
                timeout=15,
            )
            resp.raise_for_status()
            for prop in resp.json().get("property", []):
                address_obj = prop.get("address", {})
                leads.append({
                    "source": "probate",
                    "type": "seller",
                    "name": prop.get("owner", {}).get("owner1lastname", ""),
                    "address": address_obj.get("line1", ""),
                    "city": address_obj.get("locality", ""),
                    "phone": "",
                    "email": "",
                    "avm": prop.get("avm", {}).get("amount", {}).get("value", 0),
                    "motivation_score": MOTIVATION_SCORES["probate"],
                })
        except Exception as e:
            self.log.warning(f"Probate fetch error: {e}")

        return leads

    def _calc_equity(self, prop: dict) -> float:
        try:
            avm = prop.get("avm", {}).get("amount", {}).get("value", 0)
            balance = prop.get("lien", {}).get("openLienAmount", avm)
            if avm > 0:
                return round((avm - balance) / avm * 100, 1)
        except Exception:
            pass
        return 0.0

    def _resolve_key(self, cfg: dict, key_name: str) -> str:
        import os
        raw = cfg.get("apis", {}).get(key_name, "")
        if raw.startswith("${") and raw.endswith("}"):
            return os.environ.get(raw[2:-1], "")
        return raw

    def _resolve_env(self, key: str) -> str:
        import os
        return os.environ.get(key, "")
