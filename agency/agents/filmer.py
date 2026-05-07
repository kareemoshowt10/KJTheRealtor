"""
Filmer — pulls 5 screenshots of the mockup, sends to Higgsfield for a
10-second vertical 1080×1920 video with soft zoom and text overlays.
Falls back to a static carousel if Higgsfield is unavailable.
"""

import os
import time
import requests
from pathlib import Path
from .base import BaseAgent, get_api_key

SCREENSHOTS_DIR = Path(__file__).parent.parent / "state" / "screenshots"
VIDEOS_DIR = Path(__file__).parent.parent / "state" / "videos"

HIGGSFIELD_API = "https://api.higgsfield.ai/v1"

OVERLAY_HEADLINES = {
    "real_estate_agent": "Get More Listings",
    "home_inspector": "Fill Your Calendar",
    "general_contractor": "Win More Jobs",
    "moving_company": "Book More Moves",
    "home_stager": "Win More Contracts",
    "mortgage_broker": "Capture More Buyers",
    "title_company": "Get More Referrals",
    "property_manager": "Grow Your Portfolio",
    "real_estate_photographer": "Book More Shoots",
    "interior_designer": "Land More Projects",
}


class Filmer(BaseAgent):
    name = "filmer"

    def run(self, lead: dict) -> dict:
        self.log.info(f"Filmer creating video for: {lead['name']}")
        SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
        VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

        mockup_url = lead.get("mockup_url", "")
        screenshots = self._capture_screenshots(mockup_url, lead)

        headline = OVERLAY_HEADLINES.get(lead["niche"], "Get More Leads")
        subtitle = f"{lead['name']} · {lead['city']}, CA"

        video_result = self._create_video_higgsfield(screenshots, headline, subtitle, lead)
        if not video_result:
            video_result = self._create_video_fallback(screenshots, headline, lead)

        return {
            **lead,
            "screenshots": screenshots,
            "video_url": video_result.get("url", ""),
            "video_id": video_result.get("id", ""),
            "video_headline": headline,
            "filmed_at": self._ts(),
        }

    def _capture_screenshots(self, mockup_url: str, lead: dict) -> list[str]:
        """Capture 5 viewport screenshots using a headless browser service."""
        screenshots = []
        viewports = [
            {"width": 390, "height": 844, "label": "hero"},
            {"width": 390, "height": 844, "label": "services", "scroll": 900},
            {"width": 390, "height": 844, "label": "testimonials", "scroll": 1800},
            {"width": 390, "height": 844, "label": "form", "scroll": 2600},
            {"width": 390, "height": 844, "label": "footer", "scroll": 3200},
        ]

        # Try screenshotone.com or similar headless screenshot API
        api_key = os.environ.get("SCREENSHOTONE_API_KEY", "")
        for vp in viewports:
            path = SCREENSHOTS_DIR / f"{lead['id']}_{vp['label']}.png"
            if path.exists():
                screenshots.append(str(path))
                continue

            if api_key and mockup_url.startswith("http"):
                try:
                    params = {
                        "access_key": api_key,
                        "url": mockup_url,
                        "viewport_width": vp["width"],
                        "viewport_height": vp["height"],
                        "format": "png",
                        "scroll_y": vp.get("scroll", 0),
                        "block_ads": True,
                    }
                    resp = requests.get("https://api.screenshotone.com/take", params=params, timeout=20)
                    if resp.status_code == 200:
                        path.write_bytes(resp.content)
                        screenshots.append(str(path))
                        continue
                except Exception as e:
                    self.log.warning(f"Screenshot capture failed: {e}")

            # Fallback: save a placeholder path for Higgsfield to skip
            screenshots.append(str(path) if path.exists() else mockup_url)

        return screenshots

    def _create_video_higgsfield(
        self, screenshots: list[str], headline: str, subtitle: str, lead: dict
    ) -> dict | None:
        api_key = get_api_key("higgsfield_key")
        if not api_key:
            self.log.warning("No Higgsfield API key, skipping")
            return None

        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        # Upload screenshots to Higgsfield
        image_ids = []
        for shot_path in screenshots:
            if not Path(shot_path).exists():
                continue
            try:
                with open(shot_path, "rb") as f:
                    up_resp = requests.post(
                        f"{HIGGSFIELD_API}/assets/upload",
                        headers={"Authorization": f"Bearer {api_key}"},
                        files={"file": f},
                        timeout=30,
                    )
                    up_resp.raise_for_status()
                    image_ids.append(up_resp.json()["id"])
            except Exception as e:
                self.log.warning(f"Higgsfield upload failed: {e}")

        if not image_ids:
            return None

        # Create video job
        payload = {
            "type": "slideshow",
            "images": image_ids,
            "duration": 10,
            "width": 1080,
            "height": 1920,
            "transition": "soft_zoom",
            "audio": "none",
            "overlays": [
                {
                    "type": "text",
                    "text": headline,
                    "position": "center",
                    "style": {"fontSize": 52, "fontWeight": "bold", "color": "#e2b96f", "fontFamily": "Inter"},
                    "timing": {"start": 1.0, "end": 9.0},
                },
                {
                    "type": "text",
                    "text": subtitle,
                    "position": "bottom_center",
                    "style": {"fontSize": 26, "color": "#ffffff", "fontFamily": "Inter"},
                    "timing": {"start": 2.0, "end": 9.5},
                },
                {
                    "type": "text",
                    "text": "FREE mockup available — DM or reply",
                    "position": "top_center",
                    "style": {"fontSize": 22, "color": "#ffffff", "background": "rgba(0,0,0,0.5)", "padding": "8px 16px"},
                    "timing": {"start": 6.0, "end": 10.0},
                },
            ],
        }

        try:
            resp = requests.post(f"{HIGGSFIELD_API}/videos", headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            job = resp.json()
            job_id = job["id"]
        except Exception as e:
            self.log.error(f"Higgsfield video creation failed: {e}")
            return None

        # Poll up to 5 min
        for _ in range(30):
            time.sleep(10)
            try:
                status = requests.get(f"{HIGGSFIELD_API}/videos/{job_id}", headers=headers, timeout=15)
                data = status.json()
                if data.get("status") == "completed":
                    video_url = data.get("download_url") or data.get("url")
                    local_path = VIDEOS_DIR / f"{lead['id']}.mp4"
                    vid_data = requests.get(video_url, timeout=60)
                    local_path.write_bytes(vid_data.content)
                    return {"url": str(local_path), "id": job_id}
            except Exception:
                pass

        self.log.warning(f"Higgsfield video timed out for {lead['name']}")
        return None

    def _create_video_fallback(self, screenshots: list[str], headline: str, lead: dict) -> dict:
        """Return a metadata-only result when no video API is available."""
        self.log.info(f"No video generated for {lead['name']} — using screenshot carousel fallback")
        existing = [s for s in screenshots if Path(s).exists()]
        return {
            "url": existing[0] if existing else "",
            "id": f"fallback_{lead['id']}",
            "type": "screenshot_only",
        }
