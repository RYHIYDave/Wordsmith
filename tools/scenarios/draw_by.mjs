// WHAT IS DRAWN ON THE SCREEN, BY WHO DRAWS IT: on PLACE (a floor number, or town), after WAIT seconds of the bot playing,
// every drawImage and fillRect on the screen's canvas for FRAMES frames, summed by the function that called it: how many
// a frame, and how many screens' worth of pixels.
//   PLACE=9 node tools/playtest.mjs --file dist/perf7.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/draw_by.mjs --out shots/drawby
import { log } from './lib.mjs';

export default async function (page, snap) {
  const place = process.env.PLACE || '9';
  const wait = Number(process.env.WAIT || 12);
  const frames = Number(process.env.FRAMES || 60);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(1500);
  await page.evaluate((p) => {
    const g = window.__dbg.game(); g.cleared = 5;
    if (p === 'town') g.enterTown(); else { const n = Number(p); g.depth = n; g.cleared = n - 1; g.enterDungeon(); g.level.explored.fill(1); }
    if (p !== 'town') window.__dbg.bot(true);
  }, place);
  await page.waitForTimeout(wait * 1000);
  const r = await page.evaluate((n) => new Promise((done) => {
    const screen = document.querySelector('canvas');
    const by = new Map(); let k = 0;
    const P = CanvasRenderingContext2D.prototype; const di = P.drawImage; const fr = P.fillRect;
    const who = () => { const st = (new Error().stack || '').split('\n'); const l = st[3] || ''; return l.trim().replace(/^at /, '').replace(/ \(.*$/, '').replace(/^.*\//, ''); };
    const add = (name, area) => { const e = by.get(name) || { n: 0, px: 0 }; e.n++; e.px += area; by.set(name, e); };
    P.drawImage = function (img, ...a) {
      if (this.canvas === screen) { const t = this.getTransform(); add('img ' + who(), (a.length >= 8 ? a[6] * a[7] : a.length >= 4 ? a[2] * a[3] : (img.width || 0) * (img.height || 0)) * Math.abs(t.a * t.d)); }
      return di.call(this, img, ...a);
    };
    P.fillRect = function (...a) { if (this.canvas === screen) { const t = this.getTransform(); add('fill ' + who(), a[2] * a[3] * Math.abs(t.a * t.d)); } return fr.apply(this, a); };
    const tick = () => {
      if (++k <= n) { requestAnimationFrame(tick); return; }
      P.drawImage = di; P.fillRect = fr;
      const S = screen.width * screen.height;
      done([...by.entries()].sort((x, y) => y[1].px - x[1].px).slice(0, 25).map(([name, e]) => ({ name, perFrame: +(e.n / n).toFixed(1), screens: +(e.px / n / S).toFixed(2) })));
    };
    requestAnimationFrame(tick);
  }), frames);
  let tot = 0; for (const x of r) tot += x.screens;
  for (const x of r) log(x.name.slice(0, 60), `${x.perFrame} a frame, ${x.screens} screens`);
  log('top 25 together', `${tot.toFixed(1)} screens`);
  await snap('end');
}
