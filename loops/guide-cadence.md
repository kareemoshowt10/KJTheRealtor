# Goal spec — guide-cadence (loop #3)

The loop re-reads THIS FILE every run. It is the contract for one tick: draft the next
conversation guide and open a PR for Kareem to approve. It never ships to production.

This is the CI-scoped wrapper around the `kjguide` skill. Where this spec and the skill
disagree, **this spec wins** — the skill assumes an interactive session with a browser and
push access to `main`; a CI tick has neither.

## Done when (one tick)
- A new `<slug>-guide.html` exists at the repo root, cloned from `repair-credit-guide.html`
  and built per the `kjguide` skill Steps 0–4 (5 panels, quality loop, wired into
  `index.html` `#library` and `sitemap.xml`).
- `node scripts/verify.mjs <slug>-guide.html index.html` exits 0.
- The change is on a new branch and an open PR, titled `Add <topic> conversation guide`,
  body naming the topic, the audience, and which backlog item it came from.

## How to pick the topic
Take the **highest-value unbuilt item** from the `kjguide` skill's Backlog section
(`.claude/skills/kjguide/SKILL.md`). Say which one and why in the PR body. One guide per tick.

## Never (CI guardrails — these override the skill)
- **Do not push to `main`.** Work on the PR branch only. The PR is the approval gate.
- **Do not run the browser / preview steps** (Step 5.1–5.3). CI has no display; `verify.mjs`
  plus reading the file is the verification here.
- **Do not deploy, and do not poll the live URL.**
- **Do not invent real dollar figures** — placeholders only (`$[amount]`, `[X] days`), per the
  skill's non-negotiable content rules.
- **Do not touch** `Archive-NonProject/`, the `*.zip` snapshots, or `data/market-pulse-*.json`.
- **Do not edit** an existing guide's numbers or reuse a `lib-num` — grep `lib-num` across the
  whole `#library` grid first (the skill warns about silent collisions).

## Stop if
- The Backlog has no unbuilt items left — open no PR; say so in the run log.
- `verify.mjs` still fails after two fix attempts — open the PR anyway as a **draft**, with the
  verify output in the body, so Kareem sees the state instead of getting silence.

## After the PR is open
The tick is done. Human review is the rest of the loop. Once merged, whoever merges deletes the
built topic from the skill Backlog and adds the homepage card date — same as the skill's Step 5.6.
