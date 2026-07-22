// verify.mjs — the loop's verification step for the static site.
//
// Checks that internal links resolve to a real page/route, and that referenced
// local assets (src/href to files in the repo) actually exist on disk.
// Exit 0 = clean, exit 1 = problems found. Prints one line per problem.
//
//   node scripts/verify.mjs            # check every *.html at repo root
//   node scripts/verify.mjs buyers.html   # check one page
//
// It is deliberately dumb and dependency-free: no network, no build. It exists
// so the loop (and the PostToolUse hook) can fail loudly instead of passing garbage.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");

function rootPages() {
  return readdirSync(ROOT).filter((f) => f.endsWith(".html") && statSync(path.join(ROOT, f)).isFile());
}

const ASSET_RE = /\.(js|css|png|jpe?g|webp|avif|gif|svg|ico|woff2?|json|xml|txt|pdf)$/i;

// Every clean URL the site can serve: root pages plus vercel.json rewrite sources.
function knownRoutes() {
  const routes = new Set(["/"]);
  for (const f of rootPages()) {
    routes.add("/" + f); // /buyers.html
    routes.add("/" + f.replace(/\.html$/, "")); // /buyers
  }
  // vercel.json rewrites/redirects define extra valid routes (e.g. /93063/home-value).
  try {
    const vercel = JSON.parse(readFileSync(path.join(ROOT, "vercel.json"), "utf8"));
    for (const r of [...(vercel.rewrites || []), ...(vercel.redirects || [])]) {
      if (!r.source) continue;
      // Ignore catch-all/regex sources; register concrete ones.
      if (/[:*()]/.test(r.source)) continue;
      routes.add(r.source.replace(/\/$/, "") || "/");
    }
  } catch {
    /* no vercel.json — fine */
  }
  return routes;
}

const ROUTES = knownRoutes();

function attrs(html, re) {
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

function isExternal(u) {
  return /^(https?:)?\/\//i.test(u) || /^(mailto:|tel:|data:|javascript:|#)/i.test(u);
}

function checkFile(file) {
  const problems = [];
  const html = readFileSync(path.join(ROOT, file), "utf8");

  const hrefs = attrs(html, /href\s*=\s*["']([^"']+)["']/gi);
  const srcs = attrs(html, /src\s*=\s*["']([^"']+)["']/gi);

  // Internal navigation links must map to a known route.
  for (const href of hrefs) {
    if (isExternal(href)) continue;
    const clean = href.split("#")[0].split("?")[0];
    if (!clean) continue;
    if (ASSET_RE.test(clean)) continue; // asset links are validated below, not as routes
    if (clean.startsWith("/")) {
      const route = clean.replace(/\/$/, "") || "/";
      if (!ROUTES.has(route)) problems.push(`${file}: dead internal link -> ${href}`);
    }
  }

  // Referenced local assets must exist on disk.
  for (const src of [...srcs, ...hrefs]) {
    if (isExternal(src)) continue;
    const clean = src.split("#")[0].split("?")[0];
    if (!clean) continue;
    if (ASSET_RE.test(clean)) {
      const rel = clean.replace(/^\//, "");
      if (!existsSync(path.join(ROOT, rel))) problems.push(`${file}: missing asset -> ${src}`);
    }
  }

  return problems;
}

const args = process.argv.slice(2).map((a) => path.basename(a));
const targets = args.length ? args : rootPages();

let problems = [];
for (const file of targets) {
  if (!existsSync(path.join(ROOT, file))) {
    problems.push(`${file}: file not found`);
    continue;
  }
  problems = problems.concat(checkFile(file));
}

if (problems.length) {
  console.error(`verify: ${problems.length} problem(s) in ${targets.length} file(s):`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`verify: OK (${targets.length} file(s), links + assets resolve)`);
