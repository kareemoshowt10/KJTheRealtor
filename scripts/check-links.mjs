#!/usr/bin/env node
/**
 * Fails the build when a page references an internal path that nothing serves.
 *
 * WHY THIS EXISTS
 * Vercel's build root for this project is web/. Anything outside web/ is never
 * served, no matter how correct it looks in the repo. That single fact has
 * silently broken three shipped features:
 *
 *   1. seller-presentation.html lived at the repo root, not web/public/
 *   2. llms.txt drifted between the root copy and the served copy
 *   3. the market-pulse generator wrote to a repo-root data/ directory, so
 *      every widget fetch 404'd and the feature never rendered in production
 *
 * Each was found by accident, long after shipping. This check finds them at
 * build time instead.
 *
 * Run: node scripts/check-links.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC = path.join(ROOT, "web/public");
const APP = path.join(ROOT, "web/src/app");

const vercel = JSON.parse(readFileSync(path.join(ROOT, "web/vercel.json"), "utf8"));

/**
 * Sources that resolve a path even though no file sits at it.
 *
 * Entries carrying a `has` condition are deliberately excluded. The www-to-apex
 * redirect is `"/:path*"` with a host condition, which expands to a matcher that
 * accepts literally every path — counting it would make this whole check pass
 * unconditionally, which is precisely the bug the first version of this script
 * shipped with.
 */
const unconditional = (list) => (list || []).filter((r) => !r.has).map((r) => r.source);
const configSources = [...unconditional(vercel.rewrites), ...unconditional(vercel.redirects)];

/** Turn a vercel source pattern into a matcher (handles :param and :param*). */
function patternToRegExp(src) {
  const escaped = src
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:[a-zA-Z]+\*/g, ".*")
    .replace(/:[a-zA-Z]+/g, "[^/]+");
  return new RegExp(`^${escaped}$`);
}

const configMatchers = configSources.map(patternToRegExp).filter((re) => {
  // A matcher that accepts everything resolves nothing meaningfully. Refuse it
  // rather than let it silently disable the check.
  if (re.test("/__canary_path_that_should_never_resolve__")) {
    console.warn(`check-links: ignoring catch-all vercel source (matches every path)`);
    return false;
  }
  return true;
});

/** Walk a directory, returning every file path. */
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

/** Every Next.js route: web/src/app/foo/page.tsx -> /foo */
const nextRoutes = new Set(
  walk(APP)
    .filter((f) => /[\\/]page\.tsx?$/.test(f))
    .map((f) => {
      const rel = path.relative(APP, path.dirname(f)).split(path.sep).join("/");
      return rel === "" ? "/" : `/${rel}`;
    })
);

/** Does something serve this path? */
function resolves(p) {
  if (p === "/") return nextRoutes.has("/");
  if (nextRoutes.has(p)) return true;

  const rel = p.replace(/^\//, "");
  // cleanUrls: /listings is served by web/public/listings.html
  if (existsSync(path.join(PUBLIC, `${rel}.html`))) return true;
  // a literal file (image, json, txt, pdf)
  if (existsSync(path.join(PUBLIC, rel))) return true;
  // dynamic Next route with a parameterized segment
  for (const route of nextRoutes) {
    if (route.includes("[") ) {
      const re = new RegExp(`^${route.replace(/\[[^\]]+\]/g, "[^/]+")}$`);
      if (re.test(p)) return true;
    }
  }
  // covered by a vercel rewrite or redirect
  return configMatchers.some((re) => re.test(p));
}

const SKIP = /^(https?:|mailto:|tel:|sms:|data:|javascript:|#|\/\/)/i;

const findings = [];

/** Scan the served HTML and the app source for internal references. */
const scanTargets = [
  ...walk(PUBLIC).filter((f) => f.endsWith(".html")),
  ...walk(APP).filter((f) => /\.(tsx?|jsx?)$/.test(f)),
  ...walk(path.join(ROOT, "web/src/components")).filter((f) => /\.(tsx?|jsx?)$/.test(f)),
];

for (const file of scanTargets) {
  const text = readFileSync(file, "utf8");
  const refs = new Set();

  // href="/..." src="/..." and fetch("/...")
  for (const m of text.matchAll(/(?:href|src)=["'](\/[^"'#?]*)/g)) refs.add(m[1]);
  for (const m of text.matchAll(/fetch\(\s*["'`](\/[^"'`?]*)/g)) refs.add(m[1]);
  // template-literal fetches like `/data/market-pulse-${slug}.json` — check the directory
  for (const m of text.matchAll(/fetch\(\s*[`"'](\/[^`"'$]*)\$\{/g)) refs.add(m[1]);

  for (let ref of refs) {
    if (SKIP.test(ref) || ref === "") continue;
    ref = ref.replace(/\/$/, "") || "/";
    // a bare directory prefix from a template literal — just require the dir exists
    if (ref.endsWith("/") || /\/$/.test(ref)) continue;
    const isDirPrefix = ref.split("/").length > 2 && !path.extname(ref) && !resolves(ref);
    if (!resolves(ref)) {
      if (isDirPrefix && existsSync(path.join(PUBLIC, path.dirname(ref).replace(/^\//, "")))) continue;
      findings.push({ file: path.relative(ROOT, file), ref });
    }
  }
}

/** Also verify every sitemap entry is real — a sitemap of dead URLs is worse than none. */
const sitemapSrc = readFileSync(path.join(APP, "sitemap.ts"), "utf8");
for (const m of sitemapSrc.matchAll(/"(\/[^"]*)"/g)) {
  const p = m[1];
  if (p.includes("${") || SKIP.test(p)) continue;
  if (!resolves(p)) findings.push({ file: "web/src/app/sitemap.ts", ref: p });
}

if (findings.length === 0) {
  console.log(`check-links: OK — scanned ${scanTargets.length} files, every internal path resolves.`);
  process.exit(0);
}

console.error(`check-links: ${findings.length} unresolved internal path(s).\n`);
console.error("Nothing in this repo serves these. The usual cause is a file that");
console.error("lives outside web/ — Vercel's build root — so it is never served.\n");
const byFile = new Map();
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, new Set());
  byFile.get(f.file).add(f.ref);
}
for (const [file, refs] of [...byFile].sort()) {
  console.error(`  ${file}`);
  for (const r of [...refs].sort()) console.error(`    -> ${r}`);
}
process.exit(1);
