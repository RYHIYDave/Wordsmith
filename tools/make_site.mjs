// The game's own web address, with an offline copy for the phone (his "Sure", 17 Oct 06:43, and
// "K go", 06:50): https://ryhiydave.github.io/Wordsmith/, served by GitHub Pages from the branch
// gh-pages. This makes that branch's files from a release's Play.html:
//   node tools/make_site.mjs <release Play.html> <out dir>
// then copy the out dir's files over the gh-pages branch's, commit and push (DESIGN_NOTES section 8).
// index.html is Play.html with the home-screen settings and the offline helper's start added;
// sw.js keeps the page on the phone (opened with no connection, the kept copy plays; opened
// online, the kept copy plays and a fresh one is fetched behind it for the next time).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [from, out] = process.argv.slice(2);
if (!from || !out) { console.error('usage: node tools/make_site.mjs <Play.html> <out dir>'); process.exit(1); }
let src = readFileSync(from, 'utf8');
const anchor = '<meta name="mobile-web-app-capable" content="yes">\n';
const once = (s, what) => { const n = src.split(s).length - 1; if (n !== 1) throw new Error(`${what}: found ${n} times, want 1`); };
once(anchor, 'the home-screen meta');
once('</body>', '</body>');
src = src.replace(anchor, anchor + [
  '<meta name="apple-mobile-web-app-title" content="Wordsmith">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
  '<meta name="theme-color" content="#07050a">',
  '<link rel="manifest" href="manifest.webmanifest">',
  '',
].join('\n'));
src = src.replace('</body>', `<script>
// The offline copy: the phone keeps this page, so the game opens with no connection.
if ('serviceWorker' in navigator) addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
</script>
</body>`);

const manifest = {
  name: 'Wordsmith', short_name: 'Wordsmith', start_url: './', scope: './', display: 'fullscreen',
  background_color: '#07050a', theme_color: '#07050a',
};

const sw = `// Wordsmith's offline copy. The game is one page; the phone keeps it.
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
`;

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), src);
writeFileSync(join(out, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(join(out, 'sw.js'), sw);
writeFileSync(join(out, '.nojekyll'), '');
console.log(`made ${out}: index.html ${src.length} chars, sw.js, manifest.webmanifest, .nojekyll`);
