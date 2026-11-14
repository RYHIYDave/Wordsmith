// THE MUSIC'S FILES LINED UP (14 Nov 2026): every music file decoded in Chrome (as the game decodes it, decodeAudioData) beside
// another copy of it, and how far the second lies from the first, to the sample: so that a file made again in another format
// (the 12 .mp4 music files made MP3, 14 Nov 2026, so that the page passes claude.ai's check of its files before it is shared)
// keeps the sound chat's loop points (engine/audio.ts MUSIC_PLACES, TITLE) to the sample.
//   node tools/music_align.mjs <dirA> <extA> <dirB> <extB>     e.g. /tmp/old mp4 assets/sound mp3
import { load } from './lib.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const [dirA, extA, dirB, extB] = process.argv.slice(2);
const names = fs.readdirSync(dirA).filter((f) => f.endsWith('.' + extA) && /^(music_|title)/.test(f)).map((f) => f.slice(0, -extA.length - 1)).sort();
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = u.startsWith('/a/') ? path.join(dirA, u.slice(3)) : u.startsWith('/b/') ? path.join(dirB, u.slice(3)) : null;
  if (!f || !fs.existsSync(f)) {
    res.writeHead(u === '/' ? 200 : 404, { 'content-type': 'text/html' });
    return res.end('<!doctype html><title>align</title>');
  }
  res.writeHead(200);
  res.end(fs.readFileSync(f));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const { chromium } = load('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${server.address().port}/`);
let bad = 0;
for (const n of names) {
  const r = await page.evaluate(async ([n, extA, extB]) => {
    const c = new OfflineAudioContext(2, 48000, 48000);
    const get = async (f) => c.decodeAudioData(await (await fetch(f)).arrayBuffer());
    const a = await get(`/a/${n}.${extA}`);
    const b = await get(`/b/${n}.${extB}`);
    const x = a.getChannelData(0);
    const y = b.getChannelData(0);
    // the lag of the second against the first, over 0.5 s from 1 s in, to the sample; and how alike they are there
    const s0 = 48000;
    const L = 24000;
    let best = 0;
    let bv = -Infinity;
    for (let lag = -4000; lag <= 4000; lag++) {
      let v = 0;
      for (let i = 0; i < L; i += 3) v += x[s0 + i] * y[s0 + i + lag];
      if (v > bv) {
        bv = v;
        best = lag;
      }
    }
    let e = 0;
    let p = 0;
    for (let i = 0; i < L; i++) {
      const d = x[s0 + i] - y[s0 + i + best];
      e += d * d;
      p += x[s0 + i] * x[s0 + i];
    }
    return { lenA: a.length, lenB: b.length, rate: a.sampleRate, lag: best, diffDb: Math.round(10 * Math.log10(e / p + 1e-12)) };
  }, [n, extA, extB]);
  if (r.lag !== 0) bad++;
  console.log(`${n.padEnd(18)} lag ${String(r.lag).padStart(5)} samples   difference ${r.diffDb} dB   lengths ${r.lenA} / ${r.lenB} at ${r.rate}`);
}
await browser.close();
server.close();
console.log(bad ? `!! ${bad} of ${names.length} do not line up` : `all ${names.length} line up to the sample`);
