/**
 * Zéro-Palabre — Service Worker léger
 * Phase 1 : installable, pas de precache massif du build Next.js
 * Phase 2 : cache ciblé dashboard (NetworkFirst) + shell offline
 */

const CACHE_SHELL = "zp-shell-v1";
const CACHE_DASHBOARD = "zp-dashboard-v1";
const CACHE_ASSETS = "zp-assets-v1";

const SHELL_URLS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const DASHBOARD_PREFIXES = ["/accords", "/profil", "/abonnement", "/tableau-de-bord"];

function isDashboardNavigation(url) {
  return DASHBOARD_PREFIXES.some(
    (p) => url.pathname === p || url.pathname.startsWith(p + "/")
  );
}

function isStaticAsset(request) {
  return ["style", "script", "font", "image"].includes(request.destination);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("zp-") &&
              key !== CACHE_SHELL &&
              key !== CACHE_DASHBOARD &&
              key !== CACHE_ASSETS
          )
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && isDashboardNavigation(url)) {
    event.respondWith(networkFirst(request, CACHE_DASHBOARD));
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_ASSETS));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline"))
    );
  }
});

/** Phase 2 — préparation notifications push (VAPID à configurer) */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = { title: "Zéro-Palabre", body: "Nouvelle activité sur vos accords." };
  try {
    payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "zero-palabre",
      data: { url: "/accords" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/accords";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.includes(target) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      })
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const offline = await caches.match("/offline");
      if (offline) return offline;
    }
    throw new Error("offline");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await fetchPromise) || fetch(request);
}
