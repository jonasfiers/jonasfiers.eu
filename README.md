# jonasfiers.eu

My portfolio, styled as a Cypher query. Single-page, framework-free, self-hosted.

No build step, no dependencies, no framework — one `index.html` with inline CSS and a small vanilla JS snippet for the hero's node-network animation. The whole site is meant to be readable as easily as it's served: view source and you're looking at the actual page.

## Structure

- **`index.html`** — the entire site
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
