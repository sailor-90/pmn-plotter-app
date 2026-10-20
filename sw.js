/* Service worker PMN Plotter. VERSION diganti oleh build_v2.py dengan hash isi bundel. */
const VERSION = '71b644d87e';
const STATIC = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin) {
    // berkas aplikasi: jaringan dulu, cache bila offline
    event.respondWith(fetch(event.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(event.request, copy));
      return res;
    }).catch(() => caches.match(event.request)));
  } else if (url.hostname === 'cdnjs.cloudflare.com') {
    // pustaka berversi tetap: cache dulu
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(event.request, copy));
      return res;
    })));
  }
  // selain itu (ubin peta, server): langsung ke jaringan, tidak di-cache
});
