/**
 * Service Worker for Master Teacher Planner
 * Offline-first Cache Storage for PWA
 * Engine: ZettBOT Core v4.1 (by Zettbos)
 */

const CACHE_NAME = 'mtp-cache-v2.0.5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './views/dashboard.html',
  './views/planner.html',
  './views/timetable.html',
  './views/gradebook.html',
  './views/classroom.html',
  './views/tasks.html',
  './views/ai-export.html',
  './views/repository.html',
  './views/questions.html',
  './views/student-detail.html',
  './views/school-profile.html',
  './views/templates.js',
  './modals/modals.html',
  './modals/modals.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Menghapus cache versi lama:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-First Strategy:
  // Fetch fresh assets from server first, so code updates reflect immediately. Fallback to cache offline.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
