# CLAUDE.md

Context and conventions for AI assistants working in this repository.

---

## What this repo is

Personal portfolio and web experiment lab for Konrad Persson, a Swedish digital consultant. It has two distinct parts:

1. **Main portfolio site** (root) — `index.html`, `/css/`, `/js/` — professional landing page in Swedish, hosted at `konradpersson.se`
2. **Demo projects** (`/demo/`) — independent mini-apps and experiments, each intended to be served as a subdomain (e.g. `busy.konradpersson.se`)

These two parts are largely independent. If asked to work on a demo project, stay inside `/demo/` and do not touch the main site, and vice versa.

---

## Tech stack

- **Vanilla HTML, CSS, JavaScript only** — no React, no Vue, no frameworks
- **No build tools** — no webpack, Vite, Babel, TypeScript, or npm
- **No backend** — pure static files served via GitHub Pages
- **External deps via CDN only** when genuinely needed
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
├── CNAME                   Custom domain for GitHub Pages (konradpersson.se)
├── .github/workflows/      CI/CD (GitHub Pages deploy on push to main)
│
└── demo/                   All demo projects (see demo/CLAUDE.md)
    ├── busy/
    ├── vcard/
    ├── kontakt/
    ├── login/
    └── [more projects...]
```

---

## Demo projects

All demo projects live under `/demo/`. Each is self-contained and intended to eventually be available as a subdomain (e.g. `busy.konradpersson.se`). They have nothing to do with each other.

See `/demo/CLAUDE.md` for conventions that apply to demo projects. Each demo project should also have its own `CLAUDE.md` explaining what it does.

---

## Main site design system

CSS custom properties defined in `/css/styles.css`:

- Background: `#f9f6f0` (warm beige)
- Text: `#141414` (near-black)
- Max content width: `48em`
- Fonts: IBM Plex Serif, IBM Plex Sans, Alegreya, IBM Plex Mono (all via Google Fonts)
- Mobile-first, responsive

---

## Deployment

Automated via GitHub Actions on push to `main`:

- **Workflow:** `.github/workflows/deploy.yml`
- **Method:** GitHub Pages (actions/deploy-pages)
- **Custom domain:** `konradpersson.se` (defined in `CNAME`)
- **DNS setup required at templ.io** (see below)

### DNS configuration (templ.io)

To point `konradpersson.se` to GitHub Pages, configure these DNS records:

**A records for apex domain (`@`):**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME for `www`:**
```
www → konradperssonse.github.io
```

**GitHub repo settings:** Enable GitHub Pages under Settings → Pages, set source to "GitHub Actions", and add `konradpersson.se` as the custom domain.

### Subdomain routing for demos

Serving demos as subdomains (e.g. `busy.konradpersson.se`) requires DNS + routing configuration beyond what GitHub Pages alone provides. This is planned for the future and will likely require a CDN or reverse proxy layer on top of GitHub Pages.

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
- Do not add tests (there is no test infrastructure)
- Do not add linting config unless explicitly requested
- Do not modify demo projects when working on the main site, and vice versa

---

## Key files quick reference

| File | Purpose |
|------|---------|
| `index.html` | Main portfolio landing page |
| `css/styles.css` | Site-wide CSS custom properties and layout |
| `js/components.js` | Web Components (SiteHeader, SiteNav, SiteFooter) |
| `js/common.js` | Scroll-reveal via IntersectionObserver |
| `CNAME` | Custom domain declaration for GitHub Pages |
| `.github/workflows/deploy.yml` | GitHub Pages deploy on push to main |
| `demo/` | All demo projects (independent of main site) |
| `demo/CLAUDE.md` | Conventions for demo projects |
