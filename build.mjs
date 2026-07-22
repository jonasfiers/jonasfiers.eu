#!/usr/bin/env node
/*
 * build.mjs — marker-region sync for the shared site chrome, plus sitemap.xml.
 *
 * The site is hand-authored static HTML. The header (nav) and the slim blog
 * footer are identical chrome repeated across 8 pages. Rather than copy-paste
 * them, each page marks the chrome region with HTML comments:
 *
 *     <!-- @@header@@ --> ...header markup... <!-- @@/header@@ -->
 *     <!-- @@footer@@ --> ...footer markup... <!-- @@/footer@@ -->
 *     <!-- @@fine@@ -->   ...fine-print line... <!-- @@/fine@@ -->
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
 * It also writes sitemap.xml from the same PAGE MANIFEST — see the SITEMAP
 * section below for why.
 *
 * Usage:  node build.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
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
  { file: 'privacy.html',                                    loc: 'root', section: 'portfolio', footer: 'none' },
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
    <p class="fine">${fineHTML(page)}</p>
  </div>
</footer>`;
}

/* The fine-print line. It appears in three different wrappers - the blog footer,
   the homepage's own contact block, and privacy.html's footer - so it lives here
   rather than being hand-copied. Only the inner content is managed; each page
   keeps its own <p> and styling.

   "only the edge is rented" is deliberate: the origin really is a homelab LXC,
   but Cloudflare terminates TLS and proxies every request, so claiming no cloud
   provider is involved would contradict the privacy notice that names Cloudflare
   as a processor. */
function fineHTML(page) {
  const prefix = page.loc === 'root' ? '' : '../';
  return `(:ThisSite)-[:RUNS_ON]-&gt;(:HomelabProxmoxLXC) &mdash; self-hosted; only the edge is rented. &middot; <a href="${prefix}privacy.html">Privacy</a>`;
}

/* Per-section favicon: portfolio pages get the lime :JF, writing pages the pink
   one. Lives in <head>, so it's a managed region like the header/footer. */
function faviconHTML(page) {
  const prefix = page.loc === 'root' ? '' : '../';
  const file = page.section === 'writing' ? 'favicon-writing.svg' : 'favicon.svg';
  return `<link rel="icon" type="image/svg+xml" href="${prefix}${file}">`;
}

/* ── SITEMAP ────────────────────────────────────────────────────────────────
 * Generated from the SAME manifest as the chrome, so it cannot drift. The
 * hand-maintained sitemap.xml had decayed to a single URL — the homepage —
 * while the blog landing and six posts were live and unlisted, telling Google
 * the site was one page.
 *
 * Origin is the www host: that is what <link rel="canonical"> and robots.txt
 * both use, and the apex 301-redirects to it. A sitemap listing URLs on a
 * different host than the one serving it is rejected.
 *
 * lastmod comes from each file's last git commit date — accurate, stable across
 * checkouts, and with no second place to remember to update. If git is not
 * available the element is omitted rather than guessed: Google ignores a
 * lastmod it does not trust, and a wrong one is worse than none.
 *
 * changefreq and priority are deliberately absent. Google documents that it
 * ignores both, and the old file's "monthly"/"1.0" were pure noise.
 */
const SITE_ORIGIN = 'https://www.jonasfiers.eu';

function xmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

/* Directory-index pages are advertised at their directory URL, not the
   index.html filename, so the sitemap matches the canonical form. */
function urlFor(page) {
  if (page.file === 'index.html') return `${SITE_ORIGIN}/`;
  if (page.file === 'blog/index.html') return `${SITE_ORIGIN}/blog/`;
  return `${SITE_ORIGIN}/${page.file}`;
}

function gitLastModified(file) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], {
      cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

function sitemapXML(pages) {
  const entries = pages.map((page) => {
    const lastmod = gitLastModified(page.file);
    return [
      '  <url>',
      `    <loc>${xmlEscape(urlFor(page))}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
      '  </url>',
    ].join('\n');
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
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

  const fav = syncRegion(html, 'favicon', faviconHTML(page));
  if (!fav.present) problems.push(`${page.file}: missing <!-- @@favicon@@ --> region`);
  html = fav.html;

  /* Pages with their own footer markup (homepage, privacy) carry a standalone
     @@fine@@ region instead; absent elsewhere, which is not a problem. */
  const fine = syncRegion(html, 'fine', fineHTML(page));
  html = fine.html;

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

/* Sitemap: written from the manifest above, so every page listed there is
   advertised to search engines whether or not anyone remembers to do it. */
const sitemapPath = join(ROOT, 'sitemap.xml');
const sitemapNext = sitemapXML(PAGES);
let sitemapPrev = '';
try {
  sitemapPrev = await readFile(sitemapPath, 'utf8');
} catch { /* first run — no existing sitemap */ }

if (sitemapNext !== sitemapPrev) {
  await writeFile(sitemapPath, sitemapNext, 'utf8');
  console.log(`updated  sitemap.xml (${PAGES.length} URLs)`);
} else {
  console.log(`in sync  sitemap.xml (${PAGES.length} URLs)`);
}

console.log(`\n${checked} page(s) checked, ${changed} updated.`);
if (problems.length) {
  console.error('\nPROBLEMS:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
