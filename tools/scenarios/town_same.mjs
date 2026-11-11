// THE TOWN DRAWN FASTER IS THE SAME PICTURE (render/still_floor.ts, still_glows.ts, still_dark.ts, 11 Nov 2026; his 7 Nov 23:11,
// “Still a ton of lag in the town”): a new game's town, the hero set at SPOTS places about the hall (anywhere on its floor, so
// that the camera falls on odd and even pixels and part of the place is off the screen), and at each the frame drawn onto a
// canvas of the screen's size and kind, in one go, at one moment, with the same random numbers: as it was (every speed switch
// off), with each switch on alone, with all on, and as it was and with all on once more.
//   - The two "as it was" must be the same as each other, and the two "all on" likewise (the drawing is steady).
//   - THE FLOOR as one picture must be THE SAME TO THE PIXEL.
//   - THE GLOWS as one picture are the same but on hairlines (still_glows.ts says why: the game's own glows differ from
//     themselves there whenever the camera moves a pixel): no colour off by more than GLOWS_MOST (6) of 255.
//   - THE DARK as one picture: no colour off by more than DARK_MOST (3) of 255 (still_dark.ts: the rounding of each hole).
//   - ALL THREE: no colour off by more than ALL_MOST (8) of 255.
// And every switch must have been used at every place (a picture left to the game proves nothing), and each picture made once.
//   node tools/build_to.mjs dist/town_new.html
//   node tools/playtest.mjs --file dist/town_new.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/town_same.mjs --out shots/town_same
import { log } from './lib.mjs';

const MOST = { stillFloor: 0, stillGlows: Number(process.env.GLOWS_MOST || 6), stillDark: Number(process.env.DARK_MOST || 3), all: Number(process.env.ALL_MOST || 8) };

export default async function (page, snap) {
  const spots = Number(process.env.SPOTS || 40);
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 9); d.autoLevel = false; d.autoWords = false; d.god = true; }, process.env.CLS || 'warrior');
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const g = window.__dbg.game(); if (!g.level.town) g.enterTown(); });
  await page.waitForTimeout(Number(process.env.SETTLE || 6000));
  const names = await page.evaluate(() => {
    const R = window.__dbg.renderer;
    return Object.keys(R).filter((k) => R[k] && typeof R[k] === 'object' && R[k].sw && typeof R[k].sw.on === 'boolean' && R[k].stats);
  });
  log('speed switches', names.join(', ') || 'NONE');
  let bad = names.length === 3 ? 0 : 1;
  const worst = { stillFloor: 0, stillGlows: 0, stillDark: 0, all: 0 };
  const values = { stillFloor: 0, stillGlows: 0, stillDark: 0, all: 0 };
  const check = async (name) => {
    const r = await page.evaluate(async (names) => {
      const d = window.__dbg; const R = d.renderer; const main = document.querySelector('canvas');
      const W = Math.round(main.width / 2); const H = Math.round(main.height / 2);
      // (each drawing given the same random numbers: some effects scatter sparks by chance as they are drawn)
      const real = Math.random;
      const draw = (on, t) => {
        for (const k of names) R[k].sw.on = on.includes(k);
        const before = Object.fromEntries(names.map((k) => [k, R[k].stats.drawn]));
        let seed = 12345;
        Math.random = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
        const c = document.createElement('canvas'); c.width = main.width; c.height = main.height;
        const g = c.getContext('2d', { alpha: false }); g.setTransform(2, 0, 0, 2, 0, 0); g.imageSmoothingEnabled = false;
        R.draw(g, W, H, d.game(), d.fx, t, 0);
        Math.random = real;
        return { data: g.getImageData(0, 0, c.width, c.height).data, used: names.filter((k) => R[k].stats.drawn > before[k]) };
      };
      // (their pictures made first)
      draw(names, performance.now() / 1000);
      const t = performance.now() / 1000;
      const none = draw([], t);
      const each = Object.fromEntries(names.map((k) => [k, draw([k], t)]));
      const all = draw(names, t);
      const none2 = draw([], t);
      const all2 = draw(names, t);
      for (const k of names) R[k].sw.on = true;
      const diff = (x, y) => { let n = 0; let most = 0; for (let i = 0; i < x.length; i++) { const v = Math.abs(x[i] - y[i]); if (v) { n++; if (v > most) most = v; } } return { n, most }; };
      const g0 = d.game();
      const out = { hero: [+g0.hero.x.toFixed(2), +g0.hero.y.toFixed(2)], cam: [R.cam.ox, R.cam.oy], values: none.data.length, steady: [diff(none.data, none2.data).n, diff(all.data, all2.data).n], all: diff(none.data, all.data), unused: [] };
      if (none.used.length) out.unused.push(`USED WHILE OFF: ${none.used.join(', ')}`);
      for (const k of names) {
        out[k] = diff(none.data, each[k].data);
        if (!each[k].used.includes(k) || !all.used.includes(k)) out.unused.push(k);
      }
      return out;
    }, names);
    const parts = [];
    let ok = r.steady[0] === 0 && r.steady[1] === 0 && r.unused.length === 0;
    for (const k of [...names, 'all']) {
      const q = r[k];
      const most = MOST[k] ?? 0;
      if (q.most > most) ok = false;
      worst[k] = Math.max(worst[k] ?? 0, q.most);
      values[k] = Math.max(values[k] ?? 0, q.n);
      parts.push(`${k.replace('still', '').toLowerCase()} ${q.n ? `${q.n} values by ${q.most} at most` : 'the same'}`);
    }
    if (!ok) bad++;
    log(`${ok ? 'ok' : '!! NOT AS IT SHOULD BE'} ${name}`, `hero ${r.hero} cam ${r.cam}: ${parts.join('; ')}; steady ${r.steady.join('/')}${r.unused.length ? `; NOT USED: ${r.unused.join(', ')}` : ''}`);
    return r.values;
  };
  // (where he may stand: every tile of the hall's floor)
  const tiles = await page.evaluate(() => {
    const g = window.__dbg.game(); const f = g.level.floor; const out = [];
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (f.tiles[y * f.w + x] === 1) out.push([x, y]);
    return out;
  });
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const n = await check('as he arrives');
  for (let k = 0; k < spots; k++) {
    const [tx, ty] = tiles[Math.floor(rnd() * tiles.length)];
    const at = [tx + 0.15 + rnd() * 0.7, ty + 0.15 + rnd() * 0.7];
    await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, at);
    await page.waitForTimeout(300);
    await check(`spot ${k + 1}`);
  }
  // (and a walk about the hall, as he plays: the pictures must not be made again)
  const made0 = await page.evaluate((names) => Object.fromEntries(names.map((k) => [k, window.__dbg.renderer[k].stats.made])), names);
  for (const key of ['KeyW', 'KeyD', 'KeyS', 'KeyA']) { await page.keyboard.down(key); await page.waitForTimeout(1500); await page.keyboard.up(key); }
  const st = await page.evaluate((names) => Object.fromEntries(names.map((k) => { const q = window.__dbg.renderer[k]; return [k, { ...q.stats, mb: +(q.bytes() / 1e6).toFixed(1) }]; })), names);
  for (const k of names) {
    if (st[k].made !== made0[k]) bad++;
    log(k, `made ${st[k].made} time(s) in all (${st[k].made - made0[k]} during a 6 s walk), drawn ${st[k].drawn} frames, left to the game ${st[k].left}; its picture ${st[k].mb} MB`);
  }
  await snap('end');
  log('of the screen’s colour values', `${n}: the most that differ at any place: floor ${values.stillFloor}, glows ${values.stillGlows}, dark ${values.stillDark}, all three ${values.all}`);
  log('the most a colour differs by, of 255', `floor ${worst.stillFloor} (may be ${MOST.stillFloor}), glows ${worst.stillGlows} (${MOST.stillGlows}), dark ${worst.stillDark} (${MOST.stillDark}), all three ${worst.all} (${MOST.all})`);
  log('town same', bad === 0 ? `ALL AS THEY SHOULD BE (${spots + 1} places)` : `!! ${bad} NOT AS THEY SHOULD BE`);
  if (bad) throw new Error(`town_same: ${bad} not as they should be`);
}
