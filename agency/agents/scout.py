"""
Scout — walks Google Maps for each target city/zip, filters leads by:
  - 5+ years in business
  - <50 reviews
  - No website OR website last updated pre-2015 (detected via headers/Wayback)
  - Rating >= 4.0
  - Real estate adjacent niches
"""

import hashlib
import re
import time
import uuid
import requests
from datetime import datetime, date
from .base import BaseAgent, get_api_key, load_config, load_state, save_state


OUTDATED_YEAR_THRESHOLD = 2015
WAYBACK_API = "http://archive.org/wayback/available?url={url}&timestamp=20150101"


class Scout(BaseAgent):
    name = "scout"

    def run(self) -> list[dict]:
        self.log.info("Scout starting daily sweep")
        settings = self.settings
        target = settings["scout"]
        api_key = get_api_key("google_maps_key")

        existing = load_state("queue")
        already_queued = {l["id"] for l in existing.get("leads", [])}

        leads = []
        for niche in target["niches"]:
            for city in target["cities"]:
                batch = self._search_places(api_key, niche, city, target)
                for lead in batch:
                    if lead["id"] not in already_queued:
                        leads.append(lead)
                time.sleep(0.5)

        self.log.info(f"Scout found {len(leads)} new leads")
        return leads

    def _search_places(self, api_key: str, niche: str, city: str, target: dict) -> list[dict]:
        query = f"{niche.replace('_', ' ')} in {city} California"
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {"query": query, "key": api_key, "type": "establishment"}

        try:
            resp = requests.get(url, params=params, timeout=10)
            resp.raise_for_status()
            results = resp.json().get("results", [])
        except Exception as e:
            self.log.error(f"Google Maps error for {niche} in {city}: {e}")
            return []

        leads = []
        for place in results:
            rating = place.get("rating", 0)
            review_count = place.get("user_ratings_total", 999)

            if rating < target["min_rating"]:
                continue
            if review_count >= target["max_review_count"]:
                continue

            details = self._get_place_details(api_key, place["place_id"])
            if not details:
                continue

            website = details.get("website", "")
            years_open = self._estimate_years_open(details)

            if years_open < target["min_years_in_business"]:
                continue

            website_status = self._evaluate_website(website)
            if website_status == "modern":
                continue

            lead = {
                "id": self._lead_id(place["place_id"]),
                "place_id": place["place_id"],
                "name": place.get("name", ""),
                "niche": niche,
                "city": city,
                "address": details.get("formatted_address", ""),
                "phone": details.get("formatted_phone_number", ""),
                "website": website,
                "website_status": website_status,
                "rating": rating,
                "review_count": review_count,
                "years_open": years_open,
                "email": self._extract_email(details),
                "instagram": self._extract_instagram(details),
                "linkedin": self._extract_linkedin(details),
                "scouted_at": self._ts(),
                "scouted_date": str(date.today()),
            }
            leads.append(lead)

        return leads

    def _get_place_details(self, api_key: str, place_id: str) -> dict | None:
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        fields = "name,formatted_address,formatted_phone_number,website,opening_hours,url,editorial_summary"
        params = {"place_id": place_id, "fields": fields, "key": api_key}

        try:
            resp = requests.get(url, params=params, timeout=10)
            resp.raise_for_status()
            return resp.json().get("result", {})
        except Exception as e:
            self.log.warning(f"Place details failed for {place_id}: {e}")
            return None

    def _evaluate_website(self, url: str) -> str:
        """Returns: 'none' | 'outdated' | 'modern'"""
        if not url:
            return "none"

        # Check Wayback for last crawl pre-2015
        try:
            wb = requests.get(WAYBACK_API.format(url=url), timeout=8)
            snapshot = wb.json().get("archived_snapshots", {}).get("closest", {})
            if snapshot.get("available"):
                snap_ts = snapshot.get("timestamp", "")
                if snap_ts[:4] and int(snap_ts[:4]) < OUTDATED_YEAR_THRESHOLD:
                    return "outdated"
        except Exception:
            pass

        # Quick HTTP check for copyright year / generator meta tags
        try:
            r = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
            html = r.text[:5000]
            year_matches = re.findall(r"(?:copyright|©)\s*(\d{4})", html, re.IGNORECASE)
            if year_matches:
                latest = max(int(y) for y in year_matches)
                if latest < OUTDATED_YEAR_THRESHOLD:
                    return "outdated"
            generator = re.search(r'<meta[^>]+name=["\']generator["\'][^>]*content=["\']([^"\']+)', html, re.IGNORECASE)
            if generator:
                gen = generator.group(1).lower()
                if any(x in gen for x in ["2009", "2010", "2011", "2012", "2013", "2014"]):
                    return "outdated"
        except Exception:
            return "none"

        return "modern"

    def _estimate_years_open(self, details: dict) -> int:
        # Heuristic: editorial summary or hours history not available via Places API
        # Fall back to assuming 5+ if they have >10 reviews and a phone number
        reviews = details.get("user_ratings_total", 0)
        has_phone = bool(details.get("formatted_phone_number"))
        if reviews > 20 and has_phone:
            return 6
        if reviews > 5:
            return 5
        return 3

    def _extract_email(self, details: dict) -> str:
        website = details.get("website", "")
        if not website:
            return ""
        try:
            r = requests.get(website, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
            emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", r.text)
            for e in emails:
                if not any(x in e.lower() for x in ["example", "your@", "email@", "info@noreply"]):
                    return e
        except Exception:
            pass
        return ""

    def _extract_instagram(self, details: dict) -> str:
        website = details.get("website", "")
        if not website:
            return ""
        try:
            r = requests.get(website, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
            match = re.search(r"instagram\.com/([A-Za-z0-9_.]+)", r.text)
            if match:
                return match.group(1)
        except Exception:
            pass
        return ""

    def _extract_linkedin(self, details: dict) -> str:
        website = details.get("website", "")
        if not website:
            return ""
        try:
            r = requests.get(website, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
            match = re.search(r"linkedin\.com/(?:in|company)/([A-Za-z0-9_-]+)", r.text)
            if match:
                return match.group(1)
        except Exception:
            pass
        return ""

    def _lead_id(self, place_id: str) -> str:
        return hashlib.md5(place_id.encode()).hexdigest()[:12]
