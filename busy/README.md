# Busy (Looking Busy App)

A portable no-backend PWA playground for weird UI/UX “busy pages”.

## Run it
Upload the folder to any static host (shared hosting is fine) and open `index.html`.

Tip: the PWA service worker caches files. If you change stuff and Chrome keeps old files, do a **hard reload** or clear site data.

## Add a new page (navigation auto-updates)
1) Copy the template:
- `pages/template.html` → `pages/NNN-your-page.html`

2) Append a new entry to `pages.json` (append-only):
```json
{ "id": "NNN", "title": "Your Page Title", "path": "pages/NNN-your-page.html", "tags": ["optional"] }
```

3) Optional: include shared files on the page
- `../busy-common.css` (append-only)
- `../busy-common.js` (append-only; generates nav + small helpers)

> If you don’t include the common JS, just hardcode a link back to `../index.html`.

## Project rules (today’s defaults)
- Vanilla HTML/CSS/JS only. No React.
- Target Chrome latest (desktop + Android). No polyfills. No prefixes. No ARIA labels.
- Keep `<head>` minimal. Style only what you use.
- Use localStorage freely; never send data anywhere.
- CDN libraries are allowed when they genuinely help.
- This is for fun / fidgets; “works in Chrome” is the only real standard.

## Files
- `index.html` – start page + base prompt + pages list
- `pages.json` – page registry used for navigation (append-only list)
- `busy-common.css` – optional shared styling (append-only)
- `busy-common.js` – optional shared navigation + tiny helpers (append-only)
- `sw.js` + `manifest.webmanifest` – PWA basics
- `pages/*` – your busy pages
