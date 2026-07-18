# jonasfiers.eu

My portfolio, styled as a Cypher query. Single-page, framework-free, self-hosted.

No framework and no dependencies — the homepage is one `index.html` linking a single shared stylesheet, plus a small vanilla JS snippet for the hero's node-network animation. The whole site is meant to be readable as easily as it's served: view source and you're looking at the actual page. The one concession to DRY is a tiny zero-dependency Node script (`build.mjs`) that keeps the shared header/footer chrome in sync across the pages — see "Building the site" below. The pages it touches remain complete, hand-viewable, deployable HTML; there is no bundler and nothing gets compiled away.

## Structure

- **`index.html`** — the homepage (portfolio)
- **`blog/`** — the writing section: `index.html` (landing) + the PICASSO post series
- **`assets/site.css`** — the single stylesheet for the whole site: `@font-face` declarations, `:root` design tokens, the unified base/reset, the shared header/footer chrome, and the homepage + blog/article rules. Linked by every page
- **`build.mjs`** — the chrome-sync build (see "Building the site")
- **`favicon.svg`**, **`fonts/`** — self-hosted assets, no external font/CDN requests
- **`og-image.png`** / **`og-template.html`** — the social-share card; `og-template.html` is the editable source, see below for how to regenerate it
- **`robots.txt`**, **`sitemap.xml`** — standard SEO plumbing
- **`Jonas_Fiers_CV.pdf`** — linked from the hero's download button
- **`google*.html`** — Google Search Console site-verification file (its content is meant to be public, that's how the verification works)

## Previewing locally

Static files, so any local server works:

```bash
python3 -m http.server 8080
```

Opening `index.html` directly via `file://` also mostly works, but the font `@font-face` preloads and some relative paths behave more predictably over an actual HTTP origin.

## Building the site

The header nav and the slim blog footer are identical chrome repeated across
every page. Rather than copy-paste them, each page delimits those regions with
HTML comments:

```html
<!-- @@header@@ --> …header markup… <!-- @@/header@@ -->
<!-- @@footer@@ --> …footer markup… <!-- @@/footer@@ -->
```

`build.mjs` (Node 18+, zero dependencies) regenerates the markup **between**
those markers from single generator functions, driven by a small page manifest
at the top of the file. Run it after editing the header/footer or adding a page:

```bash
node build.mjs
```

It rewrites each page's chrome region in place and reports what changed. It is
**idempotent** — running it a second time makes no further change — so it is safe
to run any time. The rest of each page (its actual content) is never touched;
only the delimited chrome regions are managed. Styling for the chrome — and the
whole site — lives in the single stylesheet `assets/site.css`; the build only
manages the HTML regions, not the CSS.

**The built HTML is what gets served.** There is no separate output directory —
the pages in the repo are the deployed pages. Commit them after running the build.

### Adding a blog post

1. Copy an existing post in `blog/` (e.g. `blog/picasso-inside-a-copybook.html`)
   to the new filename and write the article body. Keep the
   `<!-- @@header@@ -->…<!-- @@/header@@ -->` and
   `<!-- @@footer@@ -->…<!-- @@/footer@@ -->` markers, and the
   `../assets/site.css` `<link>`, in place.
2. Add the file to the `PAGES` manifest in `build.mjs`
   (`{ file: 'blog/…​.html', loc: 'blog', section: 'writing', footer: 'post' }`).
3. Run `node build.mjs` to sync the chrome, and add a card for it on the blog
   landing page (`blog/index.html`).

## Regenerating the OG image

`og-template.html` is a standalone 1200×630 page using the site's real fonts and CSS variables. Render it with headless Chrome rather than hand-editing the PNG:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1200,630 \
  --screenshot="og-image.png" \
  "file://$(pwd)/og-template.html"
```

## Deployment

Self-hosted on a homelab Proxmox LXC, no cloud provider involved — same footer joke the site itself makes.
