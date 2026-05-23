"""
LLM wrapper — single point of provider config.
Currently uses Google Gemini. Swap providers here.

Env: GOOGLE_API_KEY (or GEMINI_API_KEY)
Get one: https://aistudio.google.com/apikey  (free tier available)
"""

import os
from google import genai
from google.genai import types

_client = None

# Model aliases — swap providers here, not in every agent
SMART = "gemini-2.5-pro"      # Sonnet-equivalent: diagnoses, cold messages
FAST  = "gemini-2.5-flash"    # Haiku-equivalent: quality checks, classification


def _get_client():
    global _client
    if _client is None:
        key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY", "")
        if not key:
            raise RuntimeError("GOOGLE_API_KEY not set. Get one at https://aistudio.google.com/apikey")
        _client = genai.Client(api_key=key)
    return _client


def generate(prompt: str, model: str = FAST, max_tokens: int = 200, temperature: float = 0.7) -> str:
    """Run a single-turn prompt and return the text. Raises on failure."""
    client = _get_client()
    resp = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            max_output_tokens=max_tokens,
            temperature=temperature,
        ),
    )
    return (resp.text or "").strip()
