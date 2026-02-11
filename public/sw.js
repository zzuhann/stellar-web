// Service Worker for STELLAR PWA
const VERSION = '20260211T12281';
const CACHE_NAME = `stellar-cache-v${VERSION}`;
const STATIC_CACHE_URLS = [
  '/',
  '/map',
  '/manifest.webmanifest',
  '/icon-192x192.png?v=2',
  '/icon-512x512.png?v=2',
];

// Push notification configuration
const NOTIFICATION_ICON = '/icon-192x192.png?v=2';
const NOTIFICATION_BADGE = '/icon-192x192.png?v=2';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip for non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip for external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            // Don't cache API responses or dynamic content
            if (event.request.url.includes('/api/')) {
              return fetchResponse;
            }

            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
            return fetchResponse;
          })
        );
      })
      .catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_BADGE,
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('https://google.com'));
});
