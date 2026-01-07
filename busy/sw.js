/* Busy Service Worker (tiny, no-build, no-fuss) */
const CACHE = "busy-v1";
const CORE = [
  "./",
  "./index.html",
  "./busy-common.css",
  "./busy-common.js",
  "./pages.json",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);

    try {
      const fresh = await fetch(req);
      // Cache same-origin-ish only (best-effort)
      if (new URL(req.url).origin === self.location.origin) cache.put(req, fresh.clone());
      return fresh;
    } catch (_) {
      return cached || new Response("Offline.", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  })());
});
