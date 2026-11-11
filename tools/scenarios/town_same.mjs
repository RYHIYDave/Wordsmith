// THE TOWN DRAWN FASTER IS THE SAME PICTURE (render/still_glows.ts and the other pictures made for speed, 11 Nov 2026): a new
// game's town, the hero set at SPOTS places about the hall (its middle, its corners, its walls' feet, by each of the townsfolk),
// and at each the frame drawn four times over, in one go, onto a canvas of the screen's size and kind: without, with, without,
// with. The two without must be the same as each other (the drawing is steady), the two with likewise, and with the same as
// without, to the pixel. Where they are not, how many pixels differ and by how much at most (a colour goes from 0 to 255).
//   node tools/build_to.mjs dist/town_new.html
//   node tools/playtest.mjs --file dist/town_new.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/town_same.mjs --out shots/town_same
// SWITCHES: the names of the renderer's speed switches to try (renderer.<name>.sw.on), all of them if not given.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const spots = Number(process.env.SPOTS || 40);
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 9); d.autoLevel = false; d.autoWords = false; d.god = true; }, process.env.CLS || 'warrior');
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const g = window.__dbg.game(); if (!g.level.town) g.enterTown(); });
  await page.waitForTimeout(Number(process.env.SETTLE || 6000));
  const names = await page.evaluate((want) => {
    const R = window.__dbg.renderer;
    const all = Object.keys(R).filter((k) => R[k] && typeof R[k] === 'object' && R[k].sw && typeof R[k].sw.on === 'boolean' && R[k].stats);
    return want ? all.filter((k) => want.split(',').includes(k)) : all;
  }, process.env.SWITCHES || '');
  log('speed switches tried', names.join(', ') || 'NONE');
  let bad = 0;
  let worst = 0;
  const check = async (name) => {
    const r = await page.evaluate(async (names) => {
      const d = window.__dbg; const R = d.renderer; const main = document.querySelector('canvas');
      const W = Math.round(main.width / 2); const H = Math.round(main.height / 2);
      // (each drawing given the same random numbers: some effects scatter sparks by chance as they are drawn)
      const real = Math.random;
      const draw = (on, t) => {
        for (const k of names) R[k].sw.on = on;
        let seed = 12345;
        Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
        const c = document.createElement('canvas'); c.width = main.width; c.height = main.height;
        const g = c.getContext('2d', { alpha: false }); g.setTransform(2, 0, 0, 2, 0, 0); g.imageSmoothingEnabled = false;
        R.draw(g, W, H, d.game(), d.fx, t, 0);
        Math.random = real;
        return { data: g.getImageData(0, 0, c.width, c.height).data, stats: Object.fromEntries(names.map((k) => [k, { ...R[k].stats }])) };
      };
      // (their pictures made first, so that "with" draws with them)
      for (const k of names) R[k].sw.on = true;
      for (let k = 0; k < 3; k++) { const c = document.createElement('canvas'); c.width = main.width; c.height = main.height; const g = c.getContext('2d', { alpha: false }); g.setTransform(2, 0, 0, 2, 0, 0); g.imageSmoothingEnabled = false; R.draw(g, W, H, d.game(), d.fx, performance.now() / 1000, 0); }
      const t = performance.now() / 1000;
      const A = draw(false, t); const B = draw(true, t); const C = draw(false, t); const D = draw(true, t);
      for (const k of names) R[k].sw.on = true;
      const diff = (x, y) => { let n = 0; let most = 0; let first = -1; for (let i = 0; i < x.length; i++) { const v = Math.abs(x[i] - y[i]); if (v) { if (v > most) most = v; if ((i & 3) !== 3 || true) { n++; if (first < 0) first = i >> 2; } } } return { n, most, at: first < 0 ? null : [first % main.width, Math.floor(first / main.width)] }; };
      const sm = diff(A.data, B.data);
      let pics = null;
      if (sm.n > 0 && !window.__shown) {
        window.__shown = true;
        const png = (data, mark) => { const c = document.createElement('canvas'); c.width = main.width; c.height = main.height; const g = c.getContext('2d'); const im = new ImageData(new Uint8ClampedArray(data), c.width, c.height); if (mark) { for (let i = 0; i < data.length; i += 4) { if (data[i] !== mark[i] || data[i + 1] !== mark[i + 1] || data[i + 2] !== mark[i + 2]) { im.data[i] = 255; im.data[i + 1] = 0; im.data[i + 2] = 255; } } } g.putImageData(im, 0, 0); return c.toDataURL('image/png'); };
        pics = { off: png(A.data), on: png(B.data), marked: png(A.data, B.data) };
      }
      const g0 = d.game();
      return { hero: [+g0.hero.x.toFixed(2), +g0.hero.y.toFixed(2)], cam: [R.cam.ox, R.cam.oy], steadyOff: diff(A.data, C.data), steadyOn: diff(B.data, D.data), same: sm, used: Object.fromEntries(names.map((k) => [k, D.stats[k].drawn - B.stats[k].drawn > 0])), pics };
    }, names);
    if (r.pics) {
      const fs = await import('node:fs');
      const dir = process.env.OUTDIR || 'shots/town_same';
      fs.mkdirSync(dir, { recursive: true });
      for (const [k, url] of Object.entries(r.pics)) fs.writeFileSync(`${dir}/diff_${k}.png`, Buffer.from(url.split(',')[1], 'base64'));
      delete r.pics;
    }
    const unused = names.filter((k) => !r.used[k]);
    const ok = r.steadyOff.n === 0 && r.steadyOn.n === 0 && r.same.n === 0 && unused.length === 0;
    if (!ok) bad++;
    worst = Math.max(worst, r.same.most);
    log(`${ok ? 'same' : '!! DIFFERENT'} ${name}`, `hero ${r.hero} cam ${r.cam}; with/without ${r.same.n} values differ${r.same.n ? ` (by ${r.same.most} at most, first at ${r.same.at})` : ''}; steady ${r.steadyOff.n}/${r.steadyOn.n}${unused.length ? `; NOT USED: ${unused.join(', ')}` : ''}`);
  };
  // (where he may stand: every tile of the hall's floor he can walk on; a spread of them, each a little off its middle, so that
  // the camera falls on odd and even pixels, and the hall's ends, where part of the picture is off the screen)
  const tiles = await page.evaluate(() => {
    const g = window.__dbg.game(); const f = g.level.floor; const out = [];
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (f.tiles[y * f.w + x] === 1) out.push([x, y]);
    return out;
  });
  log('floor tiles to stand on', tiles.length);
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  await check('as he arrives');
  for (let k = 0; k < spots; k++) {
    const [tx, ty] = tiles[Math.floor(rnd() * tiles.length)];
    const at = [tx + 0.15 + rnd() * 0.7, ty + 0.15 + rnd() * 0.7];
    await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, at);
    await page.waitForTimeout(350);
    await check(`spot ${k + 1}`);
  }
  await snap('end');
  log('town same', bad === 0 ? `ALL SAME (${spots + 1} places)` : `!! ${bad} DIFFERENT of ${spots + 1} (the most a colour differs by: ${worst} of 255)`);
}
