// File: sw.js | Build: V 0.06.11.24.2158
const TB_CACHE_NAME = 'taman-belajar-cache-v00611242158';
const TB_STATIC_ASSETS = [
  '/Taman-Belajar/',
  '/Taman-Belajar/index.html',
  '/Taman-Belajar/manifest.json',
  '/Taman-Belajar/css/01-base-glass.css',
  '/Taman-Belajar/css/02-components.css',
  '/Taman-Belajar/css/03-themes.css',
  '/Taman-Belajar/js/core/version.js',
  '/Taman-Belajar/js/core/firebase-sync.js',
  '/Taman-Belajar/js/core/auth.js',
  '/Taman-Belajar/js/ui/ui-icons.js',
  '/Taman-Belajar/js/ui/ui-login.js',
  '/Taman-Belajar/js/ui/ui-header-dock.js',
  '/Taman-Belajar/js/ui/ui-views.js',
  '/Taman-Belajar/js/ui/ui-modals.js',
  '/Taman-Belajar/js/modules/app-shell.js',
  '/Taman-Belajar/js/modules/murid.js',
  '/Taman-Belajar/js/modules/absensi.js',
  '/Taman-Belajar/js/modules/nilai.js',
  '/Taman-Belajar/js/modules/dokumentasi.js',
  '/Taman-Belajar/js/modules/laporan-pdf.js',
  '/Taman-Belajar/js/modules/tema.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(TB_CACHE_NAME).then(cache => cache.addAll(TB_STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== TB_CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(TB_CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
