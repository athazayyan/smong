const CACHE_NAME = "mitigakids-cache-v1";
const ASSETS_TO_CACHE = [
  "/siswa",
  "/siswa/modul",
  "/siswa/peringatan-dini",
  "/assets/logo-mitigakids.png",
  "/assets/landing/story_gempa_kelas.png",
  "/assets/landing/story_gempa_meja.png",
  "/assets/landing/story_gempa_lapangan.png",
  "/globals.css"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn("Some assets failed to pre-cache", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests and skip internal calls / localhost dev chunks to prevent Next.js HMR reload loops
  if (
    event.request.method !== "GET" || 
    event.request.url.includes("/api/") || 
    event.request.url.startsWith("chrome-extension:") ||
    self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1" ||
    event.request.url.includes("/_next/") ||
    event.request.url.includes("webpack-hmr")
  ) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // Offline fallback
          return caches.match("/siswa");
        });
    })
  );
});
