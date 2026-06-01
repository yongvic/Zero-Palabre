/**
 * Zéro-Palabre — Service Worker
 * Phase 1 : installable, shell minimal
 * Phase 2 : mode hors ligne — cache dashboard + assets (sans precache webpack)
 */

const CACHE_SHELL = "zp-shell-v2";
const CACHE_DASHBOARD = "zp-dashboard-v2";
const CACHE_ASSETS = "zp-assets-v2";

const MAX_DASHBOARD_PAGES = 24;
const MAX_ASSET_ENTRIES = 80;

const SHELL_URLS = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/brand/logo-vert.png",
];

const DASHBOARD_PREFIXES = [
  "/accords",
  "/profil",
  "/abonnement",
  "/tableau-de-bord",
];

function isDashboardNavigation(url) {
  return DASHBOARD_PREFIXES.some(
    (p) => url.pathname === p || url.pathname.startsWith(p + "/")
  );
}

function isStaticAsset(request) {
  const path = new URL(request.url).pathname;
  return (
    ["style", "script", "font", "image"].includes(request.destination) ||
    path.startsWith("/_next/static/")
  );
}

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
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
          .filter((key) => key.startsWith("zp-") && !key.endsWith("-v2"))
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

  // API : toujours réseau (pas de cache trompeur)
  if (isApiRequest(url)) return;

  if (request.mode === "navigate" && isDashboardNavigation(url)) {
    event.respondWith(networkFirstDashboard(request));
    return;
  }

  if (isStaticAsset(request)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_ASSETS, MAX_ASSET_ENTRIES));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => offlineNavigationFallback())
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/** Phase 2 — notifications push (VAPID requis côté serveur) */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {
    title: "Zéro-Palabre",
    body: "Nouvelle activité sur vos accords.",
  };
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
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(target) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      })
  );
});

async function networkFirstDashboard(request) {
  const cache = await caches.open(CACHE_DASHBOARD);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await trimCache(CACHE_DASHBOARD, MAX_DASHBOARD_PAGES);
      notifyClients({ type: "ONLINE" });
    }
    return response;
  } catch {
    notifyClients({ type: "OFFLINE" });
    const cached = await cache.match(request);
    if (cached) return cached;
    const accordsList = await cache.match("/accords");
    if (accordsList && request.url !== accordsList.url) {
      return accordsList;
    }
    return offlineNavigationFallback();
  }
}

async function offlineNavigationFallback() {
  const offline = await caches.match("/offline");
  if (offline) return offline;
  return new Response("Hors ligne", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function staleWhileRevalidate(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => null);
  return cached || (await fetchPromise) || fetch(request);
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const excess = keys.length - maxEntries;
  await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
}

function notifyClients(message) {
  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => client.postMessage(message));
  });
}
