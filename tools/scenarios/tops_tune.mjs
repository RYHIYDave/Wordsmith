// THE FOREST AS A FEW PICTURES, CUT SEVERAL WAYS (render/tops_cache.ts): on the Pinewood with the bot playing, for each
// cut in CUTS (slab/column, and "off"), what is drawn a frame: pictures, and how many screens' worth of them.
//   CUTS="off,4/128,4/64,2/64,2/128" node tools/playtest.mjs --file dist/perf6.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/tops_tune.mjs --out shots/tune
import { log } from './lib.mjs';

export default async function (page) {
  const cuts = (process.env.CUTS || 'off,4/128,4/64,2/64,2/128,8/128').split(',');
  const secs = Number(process.env.SECS || 4);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 9; g.cleared = 8; g.enterDungeon(); g.level.explored.fill(1); });
  await page.waitForTimeout(8000);
  await page.evaluate(() => {
    window.__dbg.bot(true);
    const screen = document.querySelector('canvas');
    const C = (window.__draws = { frames: 0, n: 0, px: 0 });
    const P = CanvasRenderingContext2D.prototype; const di = P.drawImage;
    P.drawImage = function (img, ...a) {
      if (this.canvas === screen) {
        const t = this.getTransform(); const sc = Math.abs(t.a * t.d);
        C.n++; C.px += (a.length >= 8 ? a[6] * a[7] : a.length >= 4 ? a[2] * a[3] : (img.width || 0) * (img.height || 0)) * sc;
      }
      return di.call(this, img, ...a);
    };
    const tick = () => { C.frames++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  });
  for (let round = 0; round < 2; round++) {
    for (const cut of cuts) {
      await page.evaluate((cut) => {
        const T = window.__dbg.topsCache;
        if (cut === 'off') T.on = false;
        else { T.on = true; const [s, c] = cut.split('/').map(Number); T.slab = s; T.column = c; }
      }, cut);
      await page.waitForTimeout(2500);
      await page.evaluate(() => { const C = window.__draws; C.frames = 0; C.n = 0; C.px = 0; const st = window.__dbg.renderer.topsCache.stats; window.__tsum = { pictures: 0, fell: 0, trees: 0, k: 0 }; const f = () => { const s = window.__dbg.renderer.topsCache.stats; const t = window.__tsum; t.pictures += s.pictures; t.fell += s.fell; t.trees += s.trees; t.k++; if (window.__tsumOn) requestAnimationFrame(f); }; window.__tsumOn = true; requestAnimationFrame(f); void st; });
      await page.waitForTimeout(secs * 1000);
      const r = await page.evaluate(() => {
        window.__tsumOn = false;
        const C = window.__draws; const c = document.querySelector('canvas'); const t = window.__tsum;
        return { fps: +(C.frames / 4).toFixed(1), pictures: Math.round(C.n / C.frames), screens: +(C.px / C.frames / (c.width * c.height)).toFixed(1), chunks: Math.round(t.pictures / t.k), fell: +(t.fell / t.k).toFixed(1), trees: Math.round(t.trees / t.k), held: window.__dbg.renderer.topsCache.stats.held };
      });
      log(`cut ${cut}`, JSON.stringify(r));
    }
  }
}
