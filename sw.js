// Wordsmith's offline copy. The game is one page; the phone keeps it.
// Opened with no connection, the kept copy plays. Opened online, the kept copy plays at once and
// a fresh one is fetched behind it, so a new version is there the next time the game is opened.
const KEEP = 'wordsmith-v1';
const PAGES = ['./', './index.html', './manifest.webmanifest'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(KEEP).then((c) => c.addAll(PAGES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== KEEP).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const page = req.mode === 'navigate';
  e.respondWith(caches.open(KEEP).then(async (c) => {
    const kept = await c.match(page ? './index.html' : req, { ignoreSearch: true });
    const fresh = fetch(req, { cache: 'no-cache' }).then((r) => {
      if (r && r.ok) c.put(page ? './index.html' : req, r.clone());
      return r;
    }).catch(() => null);
    if (kept) { e.waitUntil(fresh); return kept; }
    return (await fresh) || new Response('Offline, and this page is not kept yet.', { status: 503 });
  }));
});
