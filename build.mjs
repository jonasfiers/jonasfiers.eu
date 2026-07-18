#!/usr/bin/env node
/*
 * build.mjs — marker-region sync for the shared site chrome.
 *
 * The site is hand-authored static HTML. The header (nav) and the slim blog
 * footer are identical chrome repeated across 8 pages. Rather than copy-paste
 * them, each page marks the chrome region with HTML comments:
 *
 *     <!-- @@header@@ --> ...header markup... <!-- @@/header@@ -->
 *     <!-- @@footer@@ --> ...footer markup... <!-- @@/footer@@ -->
 *
 * This script regenerates the markup BETWEEN those markers from the single
 * generator functions below, per the PAGE MANIFEST, and writes the file back.
 * The pages stay complete, viewable, deployable HTML — only the delimited
 * chrome regions are managed. Running it re-syncs every page from one source.
 *
 * It is idempotent: running it twice makes no further change.
 *
 * Styling for the chrome (and the whole site) lives in the single stylesheet
 * assets/site.css. This script only manages the HTML regions, not the CSS.
 *
 * Usage:  node build.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));

/* ── PAGE MANIFEST ──────────────────────────────────────────────────────────
 * loc:     'root'  → page sits at repo root (index.html)
 *          'blog'  → page sits in /blog/
 * section: which nav section the page belongs to (portfolio | writing)
 * footer:  'none'    → no managed footer region (homepage keeps its own contact block)
 *          'landing' → blog landing footer (back-to-portfolio, lime)
 *          'post'    → blog post footer (all-writing, pink)
 */
const PAGES = [
  { file: 'index.html',                                      loc: 'root', section: 'portfolio', footer: 'none' },
  { file: 'blog/index.html',                                 loc: 'blog', section: 'writing',   footer: 'landing' },
  { file: 'blog/picasso-the-thing-that-should-exist.html',   loc: 'blog', section: 'writing',   footer: 'post' },
  { file: 'blog/picasso-inside-a-copybook.html',             loc: 'blog', section: 'writing',   footer: 'post' },
  { file: 'blog/picasso-let-the-real-files-find-the-bugs.html', loc: 'blog', section: 'writing', footer: 'post' },
  { file: 'blog/picasso-trust-but-verify.html',              loc: 'blog', section: 'writing',   footer: 'post' },
  { file: 'blog/picasso-i-didnt-write-the-csharp.html',      loc: 'blog', section: 'writing',   footer: 'post' },
  { file: 'blog/picasso-the-last-mile-is-a-windows-gui.html', loc: 'blog', section: 'writing',  footer: 'post' },
];

/* ── GENERATORS ─────────────────────────────────────────────────────────────
 * Exact markup, parameterized by the manifest. aria-current="page" is placed
 * on the nav link that points at the page itself:
 *   - root page      → Portfolio is current
 *   - blog landing   → Writing is current
 *   - blog posts     → neither (they are not the landing/portfolio pages)
 */
function headerHTML(page) {
  const root = page.loc === 'root';
  const brand = root ? 'index.html' : '../index.html';
  const port  = root ? 'index.html' : '../index.html';
  const writ  = root ? 'blog/index.html' : 'index.html';
  const portCur = root ? ' aria-current="page"' : '';
  const writCur = (page.loc === 'blog' && page.footer === 'landing') ? ' aria-current="page"' : '';
  return `<header class="site-header section-${page.section}">
  <div class="wrap">
    <a class="brand" href="${brand}"><span>(:</span>Jonas Fiers<span>)</span></a>
    <nav class="nav-links" aria-label="Primary">
      <a class="to-portfolio" href="${port}"${portCur}>Portfolio</a>
      <a class="to-writing" href="${writ}"${writCur}>Writing</a>
    </nav>
  </div>
</header>`;
}

function footerHTML(page) {
  const back = page.footer === 'landing'
    ? '<a class="back to-portfolio" href="../index.html">&larr; Back to the portfolio</a>'
    : '<a class="back to-writing" href="index.html">&larr; All writing</a>';
  return `<footer class="site-footer">
  <div class="wrap">
    ${back}
    <div class="contact-links">
      <a href="mailto:hello@jonasfiers.eu">hello@jonasfiers.eu</a>
      <a href="https://linkedin.com/in/jonasfiers" target="_blank" rel="noopener">linkedin.com/in/jonasfiers</a>
      <a href="https://github.com/jonasfiers" target="_blank" rel="noopener">github.com/jonasfiers</a>
    </div>
    <p class="fine">(:ThisSite)-[:RUNS_ON]-&gt;(:HomelabProxmoxLXC) &mdash; self-hosted, no cloud provider involved.</p>
  </div>
</footer>`;
}

/* ── REGION SYNC ────────────────────────────────────────────────────────────*/
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function syncRegion(html, name, generated) {
  const open = `<!-- @@${name}@@ -->`;
  const close = `<!-- @@/${name}@@ -->`;
  const re = new RegExp(escapeRegExp(open) + '[\\s\\S]*?' + escapeRegExp(close));
  if (!re.test(html)) return { html, present: false };
  return { html: html.replace(re, `${open}\n${generated}\n${close}`), present: true };
}

/* ── MAIN ───────────────────────────────────────────────────────────────────*/
let changed = 0;
let checked = 0;
const problems = [];

for (const page of PAGES) {
  const path = join(ROOT, page.file);
  let html;
  try {
    html = await readFile(path, 'utf8');
  } catch (err) {
    problems.push(`${page.file}: cannot read (${err.code})`);
    continue;
  }
  checked++;
  const before = html;

  const h = syncRegion(html, 'header', headerHTML(page));
  if (!h.present) problems.push(`${page.file}: missing <!-- @@header@@ --> region`);
  html = h.html;

  if (page.footer !== 'none') {
    const f = syncRegion(html, 'footer', footerHTML(page));
    if (!f.present) problems.push(`${page.file}: missing <!-- @@footer@@ --> region`);
    html = f.html;
  }

  if (html !== before) {
    await writeFile(path, html, 'utf8');
    changed++;
    console.log(`updated  ${page.file}`);
  } else {
    console.log(`in sync  ${page.file}`);
  }
}

console.log(`\n${checked} page(s) checked, ${changed} updated.`);
if (problems.length) {
  console.error('\nPROBLEMS:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
