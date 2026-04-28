const STATIC_CACHE = 'medal-golf-static-v3';
const API_CACHE    = 'medal-golf-api-v1';

const STATIC_ASSETS = [
  './index.html',
  './launcher.html',
  './stats.html',
  './medal.html',
  './css/launcher.css',
  './css/stats.css',
  './css/base.css',
  './css/search.css',
  './css/results.css',
  './css/modal.css',
  './css/responsive.css',
  './css/components.css',
  './js/api.js',
  './js/storage.js',
  './js/calculator.js',
  './js/ui.js',
  './js/sheet.js',
  './js/stableford.js',
  './js/app.js',
  './js/stats-data.js',
  './js/stats-calc.js',
  './js/stats-charts.js',
  './js/stats-ai.js',
  './js/stats-ui.js',
  './js/stats-ui.js',
  './js/stats-app.js',
  './js/stats-search.js',
  './js/stats-input.js',
  './js/stats-history.js',
  './css/stats.css',
  './css/stats-input.css',
  './css/launcher.css',
  './stats.html',
  './launcher.html',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap'
];

// Install — cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== API_CACHE)
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Static assets: cache first
// - API calls: network first, cache fallback
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // API requests — network first, fall back to cache
  if (url.includes('api.golfcourseapi.com')) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // Cache a clone of the successful response
          const clone = response.clone();
          caches.open(API_CACHE).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Static assets — cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});