#!/usr/bin/env bash
# KJ Lead-Gen Agency — pipeline runner
# Usage:
#   ./run.sh              # continuous loop (hourly)
#   ./run.sh --once       # single run
#   ./run.sh --mobile     # mobile reply handler only
#   ./run.sh --status     # print today's pipeline status

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$SCRIPT_DIR/.venv"
STATE="$SCRIPT_DIR/state"

# Bootstrap virtualenv
if [ ! -d "$VENV" ]; then
  echo "Creating virtualenv..."
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q -r "$SCRIPT_DIR/requirements.txt"
fi

# Load .env if present
if [ -f "$SCRIPT_DIR/../.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/../.env"
  set +a
fi

case "${1:-}" in
  --once)
    "$VENV/bin/python" "$SCRIPT_DIR/orchestrator.py" --once
    ;;
  --mobile)
    "$VENV/bin/python" "$SCRIPT_DIR/orchestrator.py" --mobile-only
    ;;
  --status)
    echo "=== Pipeline Status $(date '+%Y-%m-%d %H:%M') ==="
    for f in queue diagnosed built filmed pitched replies metrics flags; do
      path="$STATE/$f.json"
      if [ -f "$path" ]; then
        count=$(python3 -c "import json; d=json.load(open('$path')); print(len(d.get('leads', d)) if isinstance(d, dict) and 'leads' in d else len(d))" 2>/dev/null || echo "?")
        echo "  $f: $count entries"
      else
        echo "  $f: (empty)"
      fi
    done
    if [ -f "$STATE/flags.json" ]; then
      unresolved=$(python3 -c "import json; d=json.load(open('$STATE/flags.json')); print(sum(1 for v in d.values() if not v.get('resolved')))" 2>/dev/null || echo "?")
      if [ "$unresolved" -gt 0 ] 2>/dev/null; then
        echo "  ⚠ $unresolved unresolved human flags — check state/flags.json"
      fi
    fi
    ;;
  *)
    "$VENV/bin/python" "$SCRIPT_DIR/orchestrator.py" --interval "${2:-3600}"
    ;;
esac
