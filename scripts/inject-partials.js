#!/usr/bin/env node
// Idempotent injector: reads live pages from sitemap.xml, injects the
// site-wide RealEstateAgent schema (once per page, before </head>) and the
// author byline component (once per page, right after the footer DRE line).
// Safe to re-run — replaces content between its own markers instead of
// re-inserting or touching any other schema/content already on the page.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function readPartial(name) {
  return fs.readFileSync(path.join(ROOT, 'partials', name), 'utf8').replace(/\n$/, '');
}

const schemaPartial = readPartial('schema-realtor-agent.html');
const bylinePartial = readPartial('author-byline.html');

const SCHEMA_START = '<!-- BEGIN:site-wide-schema (managed by scripts/inject-partials.js, do not hand-edit — edit partials/schema-realtor-agent.html) -->';
const SCHEMA_END = '<!-- END:site-wide-schema -->';
const BYLINE_START = '<!-- BEGIN:author-byline (managed by scripts/inject-partials.js, do not hand-edit — edit partials/author-byline.html) -->';
const BYLINE_END = '<!-- END:author-byline -->';

const DRE_FOOTER_ANCHORS = [
  '<span class="dre">Rodeo Realty Fine Estates · CA DRE #01998956</span>',
  '<span class="dre">Rodeo Realty Fine Estates &middot; CA DRE #01998956</span>',
  '<div class="frole">Rodeo Realty Fine Estates · CA DRE #01998956</div>',
  '<div class="frole">Rodeo Realty Fine Estates &middot; CA DRE #01998956</div>',
  '<span>© 2026 Kareem Jamal · Rodeo Realty Fine Estates · CA DRE #01998956 · Equal Housing Opportunity</span>',
  '<span>© 2026 Kareem Jamal &middot; Rodeo Realty Fine Estates &middot; CA DRE #01998956 &middot; Equal Housing Opportunity</span>',
];

function getLivePages() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  return locs.map((u) => {
    const p = new URL(u).pathname;
    return p === '/' ? 'index.html' : p.slice(1) + '.html';
  });
}

function upsertBlock(html, startMarker, endMarker, partial, insertFn) {
  const blockRe = new RegExp(
    `${startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
  );
  const block = `${startMarker}\n${partial}\n${endMarker}`;
  if (blockRe.test(html)) {
    return { html: html.replace(blockRe, block), action: 'updated' };
  }
  const result = insertFn(html, block);
  if (result === null) return { html, action: 'skipped (anchor not found)' };
  return { html: result, action: 'inserted' };
}

function main() {
  const pages = getLivePages();
  const report = [];

  for (const file of pages) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) {
      report.push({ file, schema: 'skipped (file not found)', byline: 'skipped (file not found)' });
      continue;
    }
    let html = fs.readFileSync(filePath, 'utf8');
    const original = html;

    const schemaResult = upsertBlock(html, SCHEMA_START, SCHEMA_END, schemaPartial, (h, block) =>
      h.includes('</head>') ? h.replace('</head>', `${block}\n</head>`) : null
    );
    html = schemaResult.html;

    const bylineResult = upsertBlock(html, BYLINE_START, BYLINE_END, bylinePartial, (h, block) => {
      const anchor = DRE_FOOTER_ANCHORS.find((a) => h.includes(a));
      return anchor ? h.replace(anchor, `${anchor}\n${block}`) : null;
    });
    html = bylineResult.html;

    if (html !== original) {
      fs.writeFileSync(filePath, html);
    }
    report.push({ file, schema: schemaResult.action, byline: bylineResult.action });
  }

  console.log('File'.padEnd(32), 'Schema'.padEnd(30), 'Byline');
  for (const r of report) {
    console.log(r.file.padEnd(32), r.schema.padEnd(30), r.byline);
  }
}

main();
