// THE HEROES BAKED (render/baked.ts), in a real browser, the page served over the web as the published game is, its bake beside it:
//   node tools/build.mjs; then the page as published in dist/ (shots/wrap's head line + dist/artifact.html, as dist/page.html)
//   CLS=warlock node tools/playtest.mjs --serve --file dist/page.html --scenario tools/scenarios/baked.mjs --out shots/baked
// A run begun with that hero, in town and then on floor 1: his group comes from the bake, whole, and the worker paints none of
// him. It says how long the group took, how many frames came, how many were not wanted (painted already), what failed, how
// many of his frames are still unpainted, and how many the worker painted. CLS: which hero (warrior). SECS: how long to wait (30).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const secs = Number(process.env.SECS || 30);
  const start = await page.evaluate(() => ({ baked: window.__dbg.baked(), mark: !!window.__dbg.painter.baked }));
  log(`bake on this page: ${start.mark ? 'yes' : 'NO'}`);
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 9); d.autoLevel = false; d.autoWords = false; d.god = true; }, cls);
  const t0 = Date.now();
  let st = null;
  while (Date.now() - t0 < secs * 1000) {
    await page.waitForTimeout(250);
    st = await page.evaluate(() => window.__dbg.baked());
    if (!st || st.failed.length || st.ms[cls] !== undefined) break;
  }
  await snap('town');
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon(); });
  await page.waitForTimeout(3000);
  await snap('floor1');
  const end = await page.evaluate((c) => {
    const d = window.__dbg;
    const heroes = d.renderer.art.heroes;
    const places = c === 'warlock' ? [{ town: true }, {}, { demon: true }, { blaze: true }] : [{ town: true }, {}];
    let left = 0;
    let shown = 0;
    const seen = new Set();
    const walk = (o) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) {
        for (let i = 0; i < o.length; i++) {
          const dsc = Object.getOwnPropertyDescriptor(o, i);
          if (dsc && typeof dsc.get === 'function') left++;
          else if (dsc && dsc.value && dsc.value.img) shown++;
          else walk(dsc && dsc.value);
        }
        return;
      }
      if (o.img && typeof o.w === 'number') return;
      for (const v of Object.values(o)) walk(v);
    };
    for (const p of places) {
      const a = heroes.of(c, { twoHanded: true, town: !!p.town, ...p, vet: c === 'brawler' });
      walk(a.front);
      walk(a.back);
    }
    return { baked: d.baked(), workerFrames: d.painter.heroFrames, left, shown };
  }, cls);
  log(`${cls}: ${JSON.stringify(end.baked)}`);
  log(`${cls}: frames in hand ${end.shown}, still unpainted ${end.left}, painted by the worker ${end.workerFrames}`);
}
