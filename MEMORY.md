# MEMORY — cross-session state for KJTheRealtor

What changes across sessions lives here. Standing project facts live in `CLAUDE.md`
(the site shape) — do not duplicate them here. Prune this file when an entry stops
being true; append-only memory becomes rot.

## Decisions
- 2026-07-22 — Adopted the seven-file harness (CLAUDE.md, settings.json, hook, verifier
  agent, this file, `scripts/verify.mjs`, loop registry). Static site stays framework-free.
- Site is hand-authored HTML, no build step. Every page is self-contained. Kept intentionally.

## Preferences (Kareem)
- (add as learned — e.g. tone for guide copy, how terse replies should be)

## Corrections that keep recurring
- (add here the moment you catch yourself re-explaining the same thing — then fix the
  root cause: usually a missing line in CLAUDE.md or a missing skill)

## Open threads
- market-pulse loop refreshes 3 zip pages weekly (see `loops/README.md`).
- Guides are produced by the `kjguide` skill; backlog lives inside that skill.
