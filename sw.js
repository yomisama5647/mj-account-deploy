const CACHE_NAME = 'mj-account-v3';
const INDEX_URL = new URL('index.html', self.registration.scope).toString();
const ASSETS = [
  './',
  'index.html',
  'styles/main.css',
  'scripts/storage.js',
  'scripts/auth.js',
  'scripts/records.js',
  'scripts/ui.js',
  'scripts/app.js',
  'fonts/zcool-kuaile-23-400-normal.woff2',
  'fonts/zcool-kuaile-21-400-normal.woff2',
  'fonts/caveat-latin-400-normal.woff2',
  'fonts/caveat-latin-700-normal.woff2',
  'icon-192.png',
  'icon-512.png',
  'manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(INDEX_URL))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
