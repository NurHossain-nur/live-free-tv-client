// A simple service worker to satisfy PWA install requirements
const CACHE_NAME = 'sportbc-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Pass all requests through to the network without caching live streams
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});