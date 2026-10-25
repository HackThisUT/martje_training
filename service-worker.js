/* service-worker.js
 * Offline cache strategy for the Home Workout Plan PWA.
 * Strategy: precache core assets on install, cache-first with
 * network fallback for navigations and same-origin GETs.
 */
const CACHE_VERSION = "hwp-v2";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-1024.png",
  "./apple-touch-icon.png",
  "./apple-touch-icon-152.png",
  "./apple-touch-icon-167.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Only handle same-origin requests; let the network handle the rest.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // For navigations, try cache first, then network, then offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then(
        (cached) =>
          cached ||
          fetch(req)
            .then((resp) => {
              const copy = resp.clone();
              caches.open(CACHE_VERSION).then((c) => c.put("./index.html", copy));
              return resp;
            })
            .catch(() => caches.match("./index.html"))
      )
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === "basic") {
            const copy = resp.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return resp;
        })
        .catch(() => cached);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
