/* Busy Common JS (append-only)
   - Optional on any page
   - Provides: pages registry + nav injection + small helpers
*/

(() => {
  const script = document.currentScript;
  const root = (script && script.dataset && script.dataset.busyRoot) ? script.dataset.busyRoot : "./";

  const $ = (sel, el = document) => el.querySelector(sel);

  const normalizePath = (p) => (p || "").replace(/^\.\//, "");
  const join = (a, b) => (a.endsWith("/") ? a : a + "/") + normalizePath(b);

  const state = {
    root,
    pagesUrl: join(root, "pages.json"),
    homeUrl: join(root, "index.html"),
  };

  async function loadPages() {
    const res = await fetch(state.pagesUrl, { cache: "no-cache" });
    if (!res.ok) throw new Error("Busy: could not load pages.json");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  function currentRelPath() {
    // Best-effort: match by pathname ending
    const path = location.pathname.split("/").filter(Boolean);
    const rootParts = normalizePath(state.root).split("/").filter(Boolean);
    // Remove rootParts from end if possible
    const relParts = path.slice(rootParts.length ? -Math.max(0, path.length - rootParts.length) : 0);
    return relParts.join("/");
  }

  function injectNav(pages, current) {
    const nav = document.querySelector("[data-busy-nav]");
    if (!nav) return;

    nav.classList.add("busy-nav");
    nav.innerHTML = "";

    const home = document.createElement("a");
    home.href = state.homeUrl;
    home.className = "busy-pill";
    home.textContent = "Home";
    nav.appendChild(home);

    for (const p of pages) {
      if (!p || !p.path || !p.title) continue;
      const a = document.createElement("a");
      a.href = join(state.root, p.path);
      a.className = "busy-pill";
      a.textContent = p.id ? `${p.id} · ${p.title}` : p.title;

      const rel = normalizePath(p.path);
      const isActive = (current === rel) || (location.pathname.endsWith("/" + rel)) || location.pathname.endsWith(rel);
      if (isActive) a.classList.add("is-active");

      nav.appendChild(a);
    }
  }

  function wireStartButton(pages) {
    const btn = document.querySelector("[data-busy-start]");
    if (!btn) return;
    const first = pages[0];
    if (first && first.path) btn.href = join(state.root, first.path);
  }

  async function init() {
    try {
      const pages = await loadPages();
      injectNav(pages, normalizePath(currentRelPath()));
      wireStartButton(pages);

      const list = document.querySelector("[data-busy-list]");
      if (list) {
        list.innerHTML = "";
        for (const p of pages) {
          const item = document.createElement("a");
          item.href = join(state.root, p.path);
          item.className = "busy-pill";
          item.textContent = p.id ? `${p.id} · ${p.title}` : p.title;
          list.appendChild(item);
        }
      }
    } catch (err) {
      // Silent by default (this project is supposed to be chill)
      console.warn(err);
    }
  }

  // Small helper: copy any element's value/text
  function wireCopy() {
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-busy-copy]");
      if (!btn) return;
      const sel = btn.getAttribute("data-busy-copy");
      const el = sel ? document.querySelector(sel) : null;
      const text = el ? (el.value ?? el.textContent ?? "") : "";
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied ✓";
        setTimeout(() => (btn.textContent = "Copy"), 900);
      } catch (_) {
        // If clipboard is blocked, do nothing.
      }
    });
  }

  // Expose a tiny global (optional use)
  window.BUSY = Object.freeze({
    root: state.root,
    pagesUrl: state.pagesUrl,
    homeUrl: state.homeUrl,
    loadPages,
  });

  wireCopy();
  init();
})();
