"""
Builder — generates a landing page mockup via Lovable MCP for top-5 leads/day.
Focus: mobile-first, lead forms, property grids, testimonials, local SEO.
Falls back to a static HTML template hosted via Vercel if Lovable is unavailable.
"""

import json
import time
import requests
from .base import BaseAgent, get_api_key


LOVABLE_API_BASE = "https://api.lovable.app/v1"

MOCKUP_PROMPT_TEMPLATE = """Create a high-converting real estate service landing page for:

Business: {name}
Type: {niche_label}
City: {city}, CA
Hero Angle: {hero_angle}
Tone: {tone}

Requirements:
- Mobile-first single-page design
- Hero section with headline matching the hero angle above
- Lead capture form (Name, Phone, Email, Message) with CTA: "Get More {cta_term}"
- Services section with 3 key offerings for a {niche_label}
- Social proof section: 3 testimonial cards (placeholder text in their voice)
- Local SEO: mention {city} and surrounding San Fernando Valley cities naturally
- Footer with placeholder phone, email, address
- Color palette: warm professional (navy + gold OR charcoal + warm white)
- Google Maps embed placeholder for {city}, CA

Do NOT include: stock photo placeholders, lorem ipsum, or generic template language.
Every section should feel specific to a {niche_label} in {city}."""


CTA_MAP = {
    "real_estate_agent": "Listings",
    "home_inspector": "Clients",
    "general_contractor": "Jobs",
    "moving_company": "Bookings",
    "home_stager": "Contracts",
    "mortgage_broker": "Pre-Approvals",
    "title_company": "Referrals",
    "property_manager": "Clients",
    "real_estate_photographer": "Shoots",
    "interior_designer": "Projects",
}


class Builder(BaseAgent):
    name = "builder"

    def run(self, lead: dict) -> dict:
        self.log.info(f"Builder generating mockup for: {lead['name']}")
        niche_data = self.niches.get(lead["niche"], {})

        prompt = MOCKUP_PROMPT_TEMPLATE.format(
            name=lead["name"],
            niche_label=niche_data.get("label", lead["niche"].replace("_", " ").title()),
            city=lead["city"],
            hero_angle=lead.get("hero_angle", ""),
            tone=lead.get("tone", "professional"),
            cta_term=CTA_MAP.get(lead["niche"], "Leads"),
        )

        result = self._build_via_lovable(lead, prompt)
        if not result:
            result = self._build_via_fallback(lead, prompt)

        return {
            **lead,
            "mockup_url": result.get("url", ""),
            "mockup_id": result.get("id", ""),
            "mockup_provider": result.get("provider", ""),
            "mockup_prompt": prompt,
            "built_at": self._ts(),
        }

    def _build_via_lovable(self, lead: dict, prompt: str) -> dict | None:
        api_key = get_api_key("lovable_key")
        if not api_key:
            self.log.warning("No Lovable API key configured, skipping")
            return None

        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

        # Step 1: Create project
        try:
            resp = requests.post(
                f"{LOVABLE_API_BASE}/projects",
                headers=headers,
                json={"name": f"Mockup - {lead['name']}", "description": prompt},
                timeout=30,
            )
            resp.raise_for_status()
            project = resp.json()
            project_id = project.get("id")
        except Exception as e:
            self.log.error(f"Lovable project creation failed: {e}")
            return None

        # Step 2: Generate page
        try:
            resp = requests.post(
                f"{LOVABLE_API_BASE}/projects/{project_id}/generate",
                headers=headers,
                json={"prompt": prompt, "type": "landing_page"},
                timeout=60,
            )
            resp.raise_for_status()
            gen = resp.json()
        except Exception as e:
            self.log.error(f"Lovable generate failed: {e}")
            return None

        # Step 3: Poll for completion (up to 3 min)
        deploy_url = None
        for _ in range(18):
            time.sleep(10)
            try:
                status_resp = requests.get(
                    f"{LOVABLE_API_BASE}/projects/{project_id}",
                    headers=headers,
                    timeout=15,
                )
                data = status_resp.json()
                if data.get("status") == "ready":
                    deploy_url = data.get("deploy_url") or data.get("preview_url")
                    break
            except Exception:
                pass

        if not deploy_url:
            self.log.warning(f"Lovable deploy timed out for {lead['name']}")
            return None

        return {"url": deploy_url, "id": project_id, "provider": "lovable"}

    def _build_via_fallback(self, lead: dict, prompt: str) -> dict:
        """Generate a static HTML mockup and return a data URI placeholder URL."""
        self.log.info(f"Using static HTML fallback for {lead['name']}")
        niche_data = self.niches.get(lead["niche"], {})
        label = niche_data.get("label", lead["niche"].replace("_", " ").title())
        hero = lead.get("hero_angle", f"The {lead['city']} {label} You Can Trust")
        cta = CTA_MAP.get(lead["niche"], "Leads")

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{lead['name']} | {label} in {lead['city']}, CA</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; }}
  .hero {{ background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%); color: #fff; padding: 80px 24px 60px; text-align: center; }}
  .hero h1 {{ font-size: clamp(1.8rem, 5vw, 3rem); font-weight: 700; margin-bottom: 16px; line-height: 1.2; }}
  .hero p {{ font-size: 1.1rem; opacity: 0.85; max-width: 540px; margin: 0 auto 32px; }}
  .hero-badge {{ display: inline-block; background: #e2b96f; color: #1a1a2e; font-size: 0.8rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }}
  .cta-btn {{ display: inline-block; background: #e2b96f; color: #1a1a2e; font-weight: 700; font-size: 1.1rem; padding: 16px 36px; border-radius: 6px; text-decoration: none; margin-top: 8px; }}
  .section {{ padding: 60px 24px; max-width: 900px; margin: 0 auto; }}
  .section h2 {{ font-size: 1.8rem; margin-bottom: 28px; text-align: center; color: #1a1a2e; }}
  .services {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }}
  .card {{ background: #f8f8f2; border-radius: 10px; padding: 28px 24px; border-left: 4px solid #e2b96f; }}
  .card h3 {{ font-size: 1.1rem; margin-bottom: 10px; color: #1a1a2e; }}
  .card p {{ color: #555; font-size: 0.9rem; line-height: 1.6; }}
  .testimonials {{ background: #f0ede8; padding: 60px 24px; }}
  .testimonials h2 {{ text-align: center; font-size: 1.8rem; margin-bottom: 32px; }}
  .tcard-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; max-width: 900px; margin: 0 auto; }}
  .tcard {{ background: #fff; border-radius: 10px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }}
  .tcard p {{ color: #444; font-size: 0.9rem; line-height: 1.6; margin-bottom: 16px; font-style: italic; }}
  .tcard .author {{ font-weight: 700; color: #1a1a2e; font-size: 0.85rem; }}
  .stars {{ color: #e2b96f; font-size: 1rem; margin-bottom: 10px; }}
  .lead-form {{ background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); padding: 40px 32px; max-width: 520px; margin: 0 auto; }}
  .lead-form h2 {{ font-size: 1.5rem; margin-bottom: 8px; }}
  .lead-form p {{ color: #666; font-size: 0.9rem; margin-bottom: 24px; }}
  .form-group {{ margin-bottom: 16px; }}
  .form-group label {{ display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: #333; }}
  .form-group input, .form-group textarea {{ width: 100%; border: 1.5px solid #ddd; border-radius: 6px; padding: 12px 14px; font-size: 0.95rem; outline: none; transition: border-color .2s; }}
  .form-group input:focus, .form-group textarea:focus {{ border-color: #e2b96f; }}
  .form-group textarea {{ height: 90px; resize: vertical; }}
  .submit-btn {{ width: 100%; background: #1a1a2e; color: #e2b96f; font-weight: 700; font-size: 1rem; padding: 15px; border: none; border-radius: 6px; cursor: pointer; }}
  footer {{ background: #1a1a2e; color: #aaa; text-align: center; padding: 32px 24px; font-size: 0.85rem; }}
  footer strong {{ color: #e2b96f; }}
</style>
</head>
<body>

<section class="hero">
  <div class="hero-badge">{lead['city']}, CA · {label}</div>
  <h1>{hero}</h1>
  <p>Trusted by homeowners and investors across the San Fernando Valley. Let's talk about what you need.</p>
  <a href="#contact" class="cta-btn">Get More {cta} &rarr;</a>
</section>

<section class="section">
  <h2>How We Help</h2>
  <div class="services">
    <div class="card">
      <h3>Local Market Expertise</h3>
      <p>Years of hands-on experience in {lead['city']} and surrounding communities means you get advice rooted in real local knowledge.</p>
    </div>
    <div class="card">
      <h3>Fast Response Guarantee</h3>
      <p>We return every call and message within 2 hours during business hours. You're never left wondering what comes next.</p>
    </div>
    <div class="card">
      <h3>Proven Results</h3>
      <p>Our {lead['rating']}-star rating across {lead['review_count']}+ reviews reflects what past clients say about working with us.</p>
    </div>
  </div>
</section>

<div class="testimonials">
  <h2>What Clients Say</h2>
  <div class="tcard-grid">
    <div class="tcard">
      <div class="stars">★★★★★</div>
      <p>"Worked with them on our home in {lead['city']} and couldn't be happier. Professional, responsive, and they really know this area."</p>
      <div class="author">— Sarah M., {lead['city']}</div>
    </div>
    <div class="tcard">
      <div class="stars">★★★★★</div>
      <p>"I've used a lot of services in the Valley and these folks are a cut above. No run-around, just real help."</p>
      <div class="author">— David L., Woodland Hills</div>
    </div>
    <div class="tcard">
      <div class="stars">★★★★★</div>
      <p>"Called on a Monday, had everything sorted by Wednesday. If you're in {lead['city']}, this is who you call first."</p>
      <div class="author">— Priya R., {lead['city']}</div>
    </div>
  </div>
</div>

<section class="section" id="contact">
  <div class="lead-form">
    <h2>Get in Touch</h2>
    <p>Tell us what you're working on. We'll get back to you same day.</p>
    <div class="form-group">
      <label>Your Name</label>
      <input type="text" placeholder="First and last name">
    </div>
    <div class="form-group">
      <label>Phone Number</label>
      <input type="tel" placeholder="(818) 555-0000">
    </div>
    <div class="form-group">
      <label>Email Address</label>
      <input type="email" placeholder="you@example.com">
    </div>
    <div class="form-group">
      <label>What do you need help with?</label>
      <textarea placeholder="Tell us a little about your situation..."></textarea>
    </div>
    <button class="submit-btn">Send My Info &rarr;</button>
  </div>
</section>

<footer>
  <strong>{lead['name']}</strong><br>
  {lead['city']}, CA &nbsp;|&nbsp; (818) 000-0000 &nbsp;|&nbsp; hello@example.com<br><br>
  Serving {lead['city']}, Woodland Hills, Calabasas, and the Greater San Fernando Valley.
</footer>

</body>
</html>"""

        # Save to state dir so Filmer can screenshot it
        from pathlib import Path
        out_path = Path(__file__).parent.parent / "state" / f"mockup_{lead['id']}.html"
        out_path.write_text(html)

        return {
            "url": f"file://{out_path}",
            "id": f"fallback_{lead['id']}",
            "provider": "static_html",
        }
