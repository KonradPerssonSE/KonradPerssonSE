# demo/ — CLAUDE.md

This directory contains all demo projects for konradpersson.se.

---

## What this directory is

A collection of independent mini-apps, tools, and experiments. Each subdirectory is its own self-contained project with no dependency on any other project in this directory.

The long-term plan is for each project to be served as a subdomain:
- `demo/busy/` → `busy.konradpersson.se`
- `demo/vcard/` → `vcard.konradpersson.se`
- `demo/kontakt/` → `kontakt.konradpersson.se`
- etc.

---

## Projects

| Directory | Description |
|-----------|-------------|
| `boilerplate/` | Starter template for new projects |
| `busy/` | PWA playground for "Looking Busy" UI/UX experiments |
| `chickenkiev/` | Mini-project |
| `coin/` | Mini-project |
| `colors/` | Mini-project |
| `demo/` | Mini-project |
| `dominionT/` | Mini-project |
| `fullscreen/` | Fullscreen PWA experiment |
| `grilla/` | Mini-project |
| `hemskärm/` | Mini-project |
| `holmes/` | Mini-project |
| `julkalkon/` | Mini-project |
| `kontakt/` | Contact form + thank-you page |
| `login/` | Retro terminal-style login UI |
| `nfc/` | NFC-related experiment |
| `notepad/` | Notepad app |
| `notepad-x/` | Notepad experiment variant |
| `severd/` | Mini-project |
| `skinka/` | Mini-project |
| `slaphone/` | Phone simulation with wallpaper assets |
| `slaptop/` | Laptop simulation with wallpaper assets |
| `stickynote/` | Sticky note app |
| `vcard/` | Contact OCR tool (Share Target API, Tesseract.js) |

---

## Conventions for all demo projects

- **Vanilla HTML, CSS, JavaScript only** — no frameworks, no build tools
- **Self-contained** — each project lives entirely in its own subdirectory
- **No shared state** between projects — localStorage is project-local
- **Never send data externally** from demo pages
- **Target:** Chrome latest (desktop + Android); no polyfills, no prefixes
- CDN libraries allowed when they genuinely help

---

## Rules for AI assistants working here

- **Stay inside this directory** — do not touch the main portfolio site (`/index.html`, `/css/`, `/js/`) when working on a demo
- **Stay inside the specific project** — do not modify other demo projects when working on one
- **Each project should have its own `CLAUDE.md`** explaining what it does, its specific conventions, and any project-local rules
- Do not create shared utilities or abstractions across demo projects — they are independent by design

---

## Adding a new demo project

1. Create a new subdirectory: `demo/your-project-name/`
2. Add a `CLAUDE.md` in that directory explaining the project
3. Start with `boilerplate/index.html` as a template if useful

No registry file to update — projects are independent.
