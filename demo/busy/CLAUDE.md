# busy/ — CLAUDE.md

This is a self-contained PWA playground for "Looking Busy" UI/UX experiments, part of the `/demo/` collection.

Intended to be served at `busy.konradpersson.se`.

---

## What this project is

A portable no-backend PWA with a shell + dynamically loaded pages. Each page is an independent HTML file. The app shell handles navigation automatically from `pages.json`.

---

## File structure

```
busy/
├── index.html              App shell + embedded AI base prompt + page list
├── pages.json              Page registry — APPEND-ONLY, never remove or reorder
├── busy-common.css         Shared dark theme — APPEND-ONLY
├── busy-common.js          Navigation injection + clipboard helper — APPEND-ONLY
├── sw.js                   Service Worker (PWA caching)
├── manifest.webmanifest    PWA manifest
└── pages/
    ├── template.html       Starter template for new pages
    ├── 001-eternal-spinner.html
    └── 002-executive-inbox.html
```

---

## Design tokens (dark theme)

- Background: `#0b0d10`
- Foreground: `#e9eef6`
- Muted: `#9aa7b6`
- Cards: `rgba(255,255,255,.06)` with glassmorphism

---

## Project rules

- **Vanilla HTML/CSS/JS only** — no React, no frameworks
- **Target:** Chrome latest (desktop + Android) — no polyfills, no prefixes, no ARIA labels
- **localStorage only** — never send data anywhere
- **Append-only files:** `pages.json`, `busy-common.css`, `busy-common.js` — never remove or reorder existing entries
- **Self-contained pages** — each page is a single HTML file
- CDN libraries allowed when they genuinely help
- Keep `<head>` minimal; style only what you use

---

## Adding a new page

1. Copy `pages/template.html` → `pages/NNN-your-page.html`
2. Append to `pages.json`:
   ```json
   { "id": "NNN", "title": "Your Page Title", "path": "pages/NNN-your-page.html", "tags": [] }
   ```
3. Optionally include `../busy-common.css` and/or `../busy-common.js`

> If you skip the common JS, add a manual link back to `../index.html`.

---

## Service worker note

The PWA service worker caches files. During development, use Chrome's hard reload (Ctrl+Shift+R) or clear site data if old files persist.
