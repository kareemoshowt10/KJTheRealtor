# Loop filing system

Every recurring, self-running job on this site is a **loop** and gets filed here.
A loop is: a goal, an action, a verification step, a state write, and a decision to
continue or stop. The harness (`../CLAUDE.md`, `../.claude/`) is the floor every loop
runs on — it does not change between runs. Loops do.

One row per loop. When you add a loop, add a row and a section. When you retire one,
move its section to the bottom under "Retired" — don't delete the record.

| # | Loop | Trigger | Action | Verify | State | Status |
|---|------|---------|--------|--------|-------|--------|
| 1 | market-pulse | GitHub Actions cron, Mon 13:00 UTC | `scripts/market-pulse/generate.mjs` refreshes 3 zip JSON files | DENYLIST filters grim headlines; commit only on change | `data/market-pulse-*.json` | live |

---

## Loop 1 — market-pulse

- **Goal:** keep the "hometown" community-news widget on the West Hills / Chatsworth /
  Simi Valley zip pages fresh and positive.
- **Trigger:** `.github/workflows/market-pulse.yml` — weekly cron + manual `workflow_dispatch`.
- **Action:** `cd scripts/market-pulse && npm run generate` (needs `FIRECRAWL_API_KEY`, a
  GitHub Actions secret — never in the repo).
- **Verify:** the generator's `DENYLIST` regex drops anxiety-inducing headlines; the
  workflow commits **only if** the JSON actually changed (`git diff --staged --quiet`).
- **State:** `data/market-pulse-91304.json`, `-91311.json`, `-93063.json`. Generated —
  never hand-edit; change the generator instead.
- **Stop condition:** none; runs indefinitely. Failing runs surface in the Actions tab.

---

## Adding a loop — the template

Before writing a runner, answer these five. If you can't, the loop isn't ready.

1. **Goal spec** — what does "done for this tick" look like? Put it in a `PROMPT.md` /
   `LOOP.md` the loop re-reads each run, not in anyone's head.
2. **Action** — the one command or agent call the tick performs.
3. **Verify** — the separate check that must pass before the change is kept. For page
   work this is `node scripts/verify.mjs <files>` plus the `verifier` agent
   (`.claude/agents/verifier.md`) in a fresh context. A loop with no real verify step
   compounds garbage.
4. **State** — where the tick records what it did / what's next, so run N+1 continues
   run N instead of repeating it. A file on disk, committed.
5. **Trigger** — cron (GitHub Actions for anything that must run without a laptop),
   `workflow_dispatch`, or the `/loop` skill for interactive/scheduled Claude runs.

Then: add the row + section above, wire the trigger, and do one manual run before
trusting the schedule.

## Candidate loops (backlog — not yet built)
- **link-audit:** weekly `node scripts/verify.mjs` across all pages; open an issue on failure.
- **guide-cadence:** periodically pick the top unbuilt topic from the `kjguide` backlog,
  draft it, run the skill's critique loop, and open a PR for Kareem to approve.
- **sitemap-sync:** regenerate `sitemap.xml` whenever a root `*.html` page is added/removed.

---

## Retired
_(none yet)_
