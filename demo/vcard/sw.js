const CACHE = "share-to-struct-v1";
const SHARE_CACHE = "share-target-cache";
const SHARE_KEY_PREFIX = "shared/";

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([
      "./",
      "./index.html",
      "./app.css",
      "./app.js",
      "./manifest.webmanifest",
      "./icon.svg"
    ]);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Share Target receiver: POST /share-target
  if (url.pathname.endsWith("/share-target") && event.request.method === "POST") {
    event.respondWith((async () => {
      const form = await event.request.formData();
      const files = form.getAll("image").filter(Boolean);

      const shareCache = await caches.open(SHARE_CACHE);
      // Clear previous shared entries
      const keys = await shareCache.keys();
      await Promise.all(keys.map(k => shareCache.delete(k)));

      // Store all images in Cache Storage
      let i = 0;
      for (const file of files) {
        const key = `${SHARE_KEY_PREFIX}${i++}`;
        await shareCache.put(key, new Response(file, { headers: { "Content-Type": file.type || "image/*" }}));
      }

      // If shared text exists, store it too
      const sharedText = form.get("text") || "";
      if (sharedText) {
        await shareCache.put("shared/text", new Response(sharedText, { headers: { "Content-Type": "text/plain" }}));
      }

      // Redirect to app (pattern recommended in modern share-target handling)
      return Response.redirect("./?share-target=1", 303);
    })());
    return;
  }

  // Cache-first for app shell
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const fresh = await fetch(event.request);
      // Only cache GET same-origin basics
      if (event.request.method === "GET" && url.origin === location.origin) {
        cache.put(event.request, fresh.clone());
      }
      return fresh;
    } catch (e) {
      // Fallback to index for navigation
      if (event.request.mode === "navigate") return cache.match("./index.html");
      throw e;
    }
  })());
});