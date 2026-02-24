// House of Veritas Service Worker
const CACHE_NAME = "hov-cache-v1"
const OFFLINE_URL = "/offline"

// Assets to cache immediately
const PRECACHE_ASSETS = ["/", "/login", "/offline", "/manifest.json"]

// Install event - precache essential assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precaching assets")
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

const CACHEABLE_API_PATHS = ["/api/stats", "/api/auth/users", "/api/health"]
const API_CACHE_NAME = "hov-api-cache-v1"

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    if (event.request.method === "POST" && !navigator.onLine) {
      event.respondWith(queueOfflineMutation(event.request))
    }
    return
  }

  if (event.request.url.includes("/api/")) {
    const isCacheable = CACHEABLE_API_PATHS.some((p) => event.request.url.includes(p))
    if (isCacheable) {
      event.respondWith(networkFirstApi(event.request))
    }
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone()
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL)
          }
          return new Response("Offline", { status: 503 })
        })
      })
  )
})

async function networkFirstApi(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: "Offline", cached: false }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

async function queueOfflineMutation(request) {
  try {
    const body = await request.clone().text()
    const cache = await caches.open("hov-offline-data")
    const key = `offline-mutation-${Date.now()}`
    await cache.put(
      new Request(key),
      new Response(JSON.stringify({ url: request.url, method: request.method, body }))
    )
    if (self.registration.sync) {
      await self.registration.sync.register("sync-mutations")
    }
    return new Response(JSON.stringify({ queued: true }), {
      status: 202,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return new Response(JSON.stringify({ error: "Cannot queue offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Push notification event
self.addEventListener("push", (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body || "New notification from House of Veritas",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard/hans",
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: "view", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title || "House of Veritas", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "dismiss") return

  const urlToOpen = event.notification.data?.url || "/dashboard/hans"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes("houseofveritas") && "focus" in client) {
          client.navigate(urlToOpen)
          return client.focus()
        }
      }
      // Open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(syncTasks())
  } else if (event.tag === "sync-time-entries") {
    event.waitUntil(syncTimeEntries())
  }
})

async function syncTasks() {
  const cache = await caches.open("hov-offline-data")
  const requests = await cache.keys()

  for (const request of requests) {
    if (request.url.includes("offline-task")) {
      const response = await cache.match(request)
      const data = await response.json()

      try {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        await cache.delete(request)
      } catch (error) {
        console.error("[SW] Failed to sync task:", error)
      }
    }
  }
}

async function syncTimeEntries() {
  const cache = await caches.open("hov-offline-data")
  const requests = await cache.keys()

  for (const request of requests) {
    if (request.url.includes("offline-time")) {
      const response = await cache.match(request)
      const data = await response.json()

      try {
        await fetch("/api/time", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        await cache.delete(request)
      } catch (error) {
        console.error("[SW] Failed to sync time entry:", error)
      }
    }
  }
}

console.log("[SW] House of Veritas Service Worker loaded")
