// THE FOREST AS A FEW PICTURES DRAWS THE SAME PICTURE (render/tops_cache.ts): on the Pinewood, at SPOTS moments of the
// bot playing (and of the hero set by trees, and before the boss), the frame is drawn four times over, in one go, onto
// a canvas of the screen's size: without the chunks, with them, without, with. The two without must be the same as
// each other (the drawing is steady), the two with likewise, and with the same as without, to the pixel.
//   node tools/build_to.mjs dist/perf6.html
//   node tools/playtest.mjs --file dist/perf6.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/tops_same.mjs --out shots/tops
import { log } from './lib.mjs';

export default async function (page, snap) {
  const spots = Number(process.env.SPOTS || 12);
  const floor = Number(process.env.FLOOR || 9);
  // CLS: the hero's class (each throws different things about: the mage's spells, the ranger's arrows)
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; }, process.env.CLS || 'warrior');
  await page.waitForTimeout(1500);
  await page.evaluate((n) => { const g = window.__dbg.game(); g.depth = n; g.cleared = n - 1; g.enterDungeon(); g.level.explored.fill(1); }, floor);
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.__dbg.bot(true));
  let bad = 0;
  const check = async (name) => {
    const r = await page.evaluate(async () => {
      const d = window.__dbg; const R = d.renderer; const main = document.querySelector('canvas');
      const W = Math.round(main.width / 2); const H = Math.round(main.height / 2);
      // (each drawing given the same random numbers: some effects scatter sparks by chance as they are drawn)
      const real = Math.random;
      const draw = (on, t) => {
        d.topsCache.on = on;
        let seed = 12345;
        Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
        const c = document.createElement('canvas'); c.width = main.width; c.height = main.height;
        const g = c.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.imageSmoothingEnabled = false;
        R.draw(g, W, H, d.game(), d.fx, t, 0);
        Math.random = real;
        return { data: g.getImageData(0, 0, c.width, c.height).data, stats: { ...R.topsCache.stats } };
      };
      // (the chunks wanted made first, so that "with" draws with pictures)
      d.topsCache.on = true;
      for (let k = 0; k < 40; k++) { const c = document.createElement('canvas'); c.width = 8; c.height = 8; const g = c.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); R.draw(g, W, H, d.game(), d.fx, performance.now() / 1000, 0); }
      const t = performance.now() / 1000;
      const A = draw(false, t); const B = draw(true, t); const C = draw(false, t); const D = draw(true, t);
      d.topsCache.on = true;
      const diff = (x, y) => { let n = 0; let first = -1; for (let i = 0; i < x.length; i += 4) { if (x[i] !== y[i] || x[i + 1] !== y[i + 1] || x[i + 2] !== y[i + 2] || x[i + 3] !== y[i + 3]) { n++; if (first < 0) first = i / 4; } } return { n, at: first < 0 ? null : [first % main.width, Math.floor(first / main.width)] }; };
      // (the first time they differ: both pictures and where, kept for looking at)
      const sm = diff(A.data, B.data);
      let pics = null;
      if (sm.n > 0 && !window.__shown) {
        window.__shown = true;
        const png = (data, mark) => { const c = document.createElement('canvas'); c.width = main.width; c.height = main.height; const g = c.getContext('2d'); const im = new ImageData(new Uint8ClampedArray(data), c.width, c.height); if (mark) { for (let i = 0; i < data.length; i += 4) { if (data[i] !== mark[i] || data[i + 1] !== mark[i + 1] || data[i + 2] !== mark[i + 2]) { im.data[i] = 255; im.data[i + 1] = 0; im.data[i + 2] = 255; im.data[i + 3] = 255; } } } g.putImageData(im, 0, 0); return c.toDataURL('image/png'); };
        pics = { off: png(A.data), on: png(B.data), marked: png(A.data, B.data) };
      }
      return { steadyOff: diff(A.data, C.data), steadyOn: diff(B.data, D.data), same: sm, stats: B.stats, pics };
    });
    if (r.pics) {
      const fs = await import('node:fs');
      const dir = process.env.OUTDIR || 'shots/tops';
      fs.mkdirSync(dir, { recursive: true });
      for (const [k, url] of Object.entries(r.pics)) fs.writeFileSync(`${dir}/diff_${k}.png`, Buffer.from(url.split(',')[1], 'base64'));
      delete r.pics;
    }
    const ok = r.steadyOff.n === 0 && r.steadyOn.n === 0 && r.same.n === 0;
    if (!ok) bad++;
    log(`${ok ? 'same' : '!! DIFFERENT'} ${name}`, JSON.stringify(r));
  };
  for (let k = 0; k < spots; k++) {
    await page.waitForTimeout(2500);
    await check(`playing ${k + 1}`);
  }
  // the hero set among the trees, each side of the trail (seen through, and things between)
  for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2], [3, 3], [-3, -3]]) {
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); window.__dbg.bot(false); g.hero.x += a; g.hero.y += b; }, [dx, dy]);
    await page.waitForTimeout(600);
    await check(`hero moved ${dx},${dy}`);
  }
  // before the boss
  await page.evaluate(() => {
    const g = window.__dbg.game(); const b = g.monsters.find((m) => m.boss && !m.dead); if (!b) return;
    const st = g.level.floor.start; const sx = st.x - b.x; const sy = st.y - b.y; const k = Math.hypot(sx, sy) || 1;
    g.hero.x = b.x + (sx / k) * 3.5; g.hero.y = b.y + (sy / k) * 3.5; window.__dbg.bot(true);
  });
  for (let k = 0; k < 4; k++) {
    await page.waitForTimeout(2500);
    await check(`boss ${k + 1}`);
  }
  await snap('end');
  log('tops same', bad === 0 ? 'ALL SAME' : `!! ${bad} DIFFERENT`);
}
