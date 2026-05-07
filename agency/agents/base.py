import json
import logging
import os
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

STATE_DIR = Path(__file__).parent.parent / "state"
CONFIG_DIR = Path(__file__).parent.parent / "config"


def load_state(name: str) -> dict:
    path = STATE_DIR / f"{name}.json"
    if path.exists():
        try:
            return json.loads(path.read_text())
        except json.JSONDecodeError:
            logger.error(f"Corrupt state file: {name}.json")
            return {}
    return {}


def save_state(name: str, data: dict) -> None:
    STATE_DIR.mkdir(exist_ok=True)
    path = STATE_DIR / f"{name}.json"
    path.write_text(json.dumps(data, indent=2))


def load_config(name: str) -> dict:
    path = CONFIG_DIR / f"{name}.json"
    return json.loads(path.read_text()) if path.exists() else {}


def resolve_env(value: str) -> str:
    """Resolve ${ENV_VAR} placeholders from environment."""
    if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
        env_key = value[2:-1]
        return os.environ.get(env_key, "")
    return value


def get_api_key(key_name: str) -> str:
    settings = load_config("settings")
    raw = settings.get("apis", {}).get(key_name, "")
    return resolve_env(raw)


class BaseAgent:
    name: str = "base"

    def __init__(self):
        self.settings = load_config("settings")
        self.niches = load_config("niches")
        self.log = logging.getLogger(f"agency.{self.name}")

    def run(self, *args, **kwargs):
        raise NotImplementedError

    def _ts(self) -> str:
        return datetime.utcnow().isoformat()
