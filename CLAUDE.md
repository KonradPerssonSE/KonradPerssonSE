# CLAUDE.md

Context and conventions for AI assistants working in this repository.

---

## What this repo is

Personal portfolio and web experiment lab for Konrad Persson, a Swedish digital consultant. It combines:

1. **Main portfolio site** (`index.html` + `/css/` + `/js/`) — professional landing page in Swedish
2. **Busy** (`/busy/`) — a PWA playground for "Looking Busy" UI/UX experiments
3. **Standalone tools** (`/vcard/`, `/kontakt/`, `/login/`, etc.) — various mini-apps and prototypes

---

## Tech stack

- **Vanilla HTML, CSS, JavaScript only** — no React, no Vue, no frameworks
- **No build tools** — no webpack, Vite, Babel, TypeScript, or npm
- **No backend** — pure static files deployed via FTP
- **External deps via CDN only** when genuinely needed (e.g. Tesseract.js in `/vcard/`)
- **Target:** Chrome latest (desktop + Android); no polyfills, no vendor prefixes
- **ES6+** — arrow functions, const/let, modules, spread, etc.

---

## Project structure

```
/
├── index.html              Main portfolio (Swedish)
├── css/styles.css          Site-wide design tokens and responsive styles
├── js/components.js        Web Components: SiteHeader, SiteNav, SiteFooter
├── js/common.js            IntersectionObserver for scroll-reveal animations
├── .github/workflows/      CI/CD (FTP deploy on push to main)
│
├── busy/                   PWA playground (see below)
├── vcard/                  Contact OCR tool (Share Target API, Tesseract.js)
├── kontakt/                Contact form + thank-you page
├── login/                  Retro terminal-style login UI
├── stickynote/             Sticky note app
├── notepad/, notepad-x/    Notepad experiments
├── boilerplate/            Starter template for new projects
└── [other mini-projects]/  chickenkiev, coin, colors, demo, dominionT,
                            fullscreen, grilla, hemskärm, holmes, julkalkon,
                            nfc, severd, skinka, slaphone, slaptop
```

---

## Design system (main site)

CSS custom properties defined in `/css/styles.css`:

- Background: `#f9f6f0` (warm beige)
- Text: `#141414` (near-black)
- Max content width: `48em`
- Fonts: IBM Plex Serif, IBM Plex Sans, Alegreya, IBM Plex Mono (all via Google Fonts)
- Mobile-first, responsive

---

## Busy project conventions

`/busy/` is a self-contained PWA with its own rules:

- **Append-only files**: `pages.json`, `busy-common.css`, `busy-common.js` — never remove or reorder existing entries
- **Self-contained pages**: each page is a single HTML file under `busy/pages/`
- **Dark theme**: background `#0b0d10`, text `#e9eef6`, muted `#9aa7b6`
- **localStorage only** — never send data anywhere
- **No ARIA labels, no polyfills, no prefixes** — "works in Chrome" is the only standard

### Adding a new Busy page

1. Copy `busy/pages/template.html` → `busy/pages/NNN-your-page.html`
2. Append to `busy/pages.json` (append-only):
   ```json
   { "id": "NNN", "title": "Your Page Title", "path": "pages/NNN-your-page.html", "tags": [] }
   ```
3. Optionally include `../busy-common.css` and/or `../busy-common.js` in the page

---

## Deployment

Automated via GitHub Actions on push to `main`:

- **Workflow:** `.github/workflows/deploy.yml`
- **Method:** FTPS (SamKirkland/FTP-Deploy-Action)
- **Secrets required:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- **Exclusions:** `.git*`, `node_modules/**`, `.ftp-deploy-sync-state.json`
- Only one deployment runs at a time (concurrency group per ref)

There is no staging environment. Pushing to `main` = live.

---

## Git conventions

- **Main branch:** `main` (deploys to production)
- **No `.gitignore`** — all files are tracked
- **No linting, no formatting tools** — consistency is maintained by convention
- Feature branches for AI/tooling work (e.g. `claude/...`)
- Commit messages are short and descriptive

---

## Code style

- Minimal comments — code should be self-documenting
- Keep `<head>` minimal; style only what you use
- Prefer small, focused files over large monoliths
- Web Components for reusable site-wide UI
- CSS custom properties for design tokens
- No TypeScript, no JSDoc, no type annotations

---

## What NOT to do

- Do not introduce npm, a package manager, or a build step
- Do not add a framework (React, Vue, Svelte, etc.)
- Do not add polyfills or vendor prefixes
- Do not send data to any external service from Busy pages
- Do not remove or reorder entries in `pages.json`, `busy-common.css`, or `busy-common.js`
- Do not create unnecessary abstraction layers or utilities for one-off use
- Do not add tests (there is no test infrastructure)
- Do not add linting config unless explicitly requested

---

## Key files quick reference

| File | Purpose |
|------|---------|
| `index.html` | Main portfolio landing page |
| `css/styles.css` | Site-wide CSS custom properties and layout |
| `js/components.js` | Web Components (SiteHeader, SiteNav, SiteFooter) |
| `js/common.js` | Scroll-reveal via IntersectionObserver |
| `busy/index.html` | Busy app shell + embedded AI base prompt |
| `busy/pages.json` | Page registry (append-only) |
| `busy/busy-common.js` | Navigation injection + clipboard helper |
| `busy/busy-common.css` | Busy dark theme design system |
| `busy/sw.js` | PWA service worker |
| `vcard/app.js` | Contact OCR app logic |
| `vcard/sw.js` | Service Worker with Share Target API |
| `.github/workflows/deploy.yml` | FTP deploy on push to main |
