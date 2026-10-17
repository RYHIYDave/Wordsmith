// WHAT IS STILL PAINTED HERE, ON THE PAGE, ONCE A PLACE HAS SETTLED: the bot plays in PLACE (town, or a floor
// number) for SECS seconds after WAIT seconds of settling, and every picture painted on the page meanwhile is
// counted by what asked for it (art/kit.ts PAINTING.trace).
//   node tools/build_to.mjs dist/perf3.html
//   PLACE=town node tools/playtest.mjs --file dist/perf3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/town_paint.mjs --out shots/tp
import { log } from './lib.mjs';

export default async function (page, snap) {
  const place = process.env.PLACE || 'town';
  const wait = Number(process.env.WAIT || 20);
  const secs = Number(process.env.SECS || 20);
  const cls = process.env.CLS || 'warrior';
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; }, cls);
  await page.waitForTimeout(1500);
  await page.evaluate((p) => {
    const d = window.__dbg; const g = d.game(); g.cleared = 5;
    if (p === 'town') g.enterTown();
    else { const n = Number(p); g.depth = n; g.cleared = n - 1; g.enterDungeon(); g.level.explored.fill(1); }
  }, place);
  await page.waitForTimeout(wait * 1000);
  // BOSS=1: set before the floor's boss (as the phone report does)
  if (process.env.BOSS === '1') {
    await page.evaluate(() => {
      const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss && !m.dead); if (!b) return;
      const st = g.level.floor.start; const sx = st.x - b.x; const sy = st.y - b.y; const k = Math.hypot(sx, sy) || 1;
      g.hero.x = b.x + (sx / k) * 3.5; g.hero.y = b.y + (sy / k) * 3.5;
    });
    await page.waitForTimeout(2500);
  }
  // how much is drawn a frame: every drawImage counted, on the screen's canvas and on any other, with the area it covers
  await page.evaluate(() => {
    const screen = document.querySelector('canvas');
    const C = (window.__draws = { frames: 0, screen: 0, screenPx: 0, other: 0, otherPx: 0, fills: 0 });
    const P = CanvasRenderingContext2D.prototype; const di = P.drawImage; const fr = P.fillRect;
    P.drawImage = function (img, ...a) {
      const t = this.getTransform(); const sc = Math.abs(t.a * t.d);
      const area = (a.length >= 8 ? a[6] * a[7] : a.length >= 4 ? a[2] * a[3] : (img.width || 0) * (img.height || 0)) * sc;
      if (this.canvas === screen) { C.screen++; C.screenPx += area; } else { C.other++; C.otherPx += area; }
      return di.call(this, img, ...a);
    };
    P.fillRect = function (...a) { if (this.canvas === screen) C.fills++; return fr.apply(this, a); };
    const tick = () => { C.frames++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
  });
  await page.evaluate(() => { window.__dbg.painting.trace = new Map(); });
  await page.evaluate(() => { window.__dbg.bot(true); const C = window.__draws; for (const k of Object.keys(C)) C[k] = 0; });
  const f0 = await page.evaluate(() => ({ frames: window.__dbg.painting.frames, ms: window.__dbg.painting.ms }));
  await page.waitForTimeout(secs * 1000);
  const out = await page.evaluate(() => {
    const d = window.__dbg; d.bot(false);
    const rows = [...d.painting.trace.entries()].sort((a, b) => b[1].ms - a[1].ms).slice(0, 25).map(([k, v]) => ({ k, n: v.n, ms: Math.round(v.ms) }));
    d.painting.trace = null;
    return { rows, frames: d.painting.frames, ms: d.painting.ms, heroFrames: d.painter.heroFrames, sideFrames: d.painter.sideFrames ?? 0, failed: d.painter.stats.failed, state: d.painter.state };
  });
  const D = await page.evaluate(() => window.__draws);
  const screenPx = await page.evaluate(() => { const c = document.querySelector('canvas'); return c.width * c.height; });
  log('drawn a frame', `${D.frames} frames: on the screen ${Math.round(D.screen / D.frames)} pictures covering ${(D.screenPx / D.frames / screenPx).toFixed(1)} screens, ${Math.round(D.fills / D.frames)} fills; elsewhere ${Math.round(D.other / D.frames)} pictures, ${(D.otherPx / D.frames / screenPx).toFixed(1)} screens`);
  log('painted here meanwhile', `${out.frames - f0.frames} pictures, ${Math.round(out.ms - f0.ms)} ms; from the worker so far: hero ${out.heroFrames}, monsters ${out.sideFrames}; painter ${out.state}${out.failed.length ? ' FAILED ' + out.failed.join('; ') : ''}`);
  for (const r of out.rows) log(`${r.n} / ${r.ms} ms`, r.k);
  await snap('end');
}
