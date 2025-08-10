const CACHE = 'monthly-income-log-v1';
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const SHELL = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/sw.js`,
  `${BASE}/icon-192.png`,
  `${BASE}/icon-512.png`
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE ? null : caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        const copy = net.clone();
        (await caches.open(CACHE)).put(req, copy);
        return net;
      } catch (err) {
        const cached = await caches.match(req);
        return cached || caches.match(`${BASE}/index.html`);
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    const net = await fetch(req);
    (await caches.open(CACHE)).put(req, net.clone());
    return net;
  })());
});
