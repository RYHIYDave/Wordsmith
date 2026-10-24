// THE NEXT VERSION'S LOOKS FROM THE GAME, for his yes (each behind its switch; the page made with them on, the painter's
// workers too): floor 15's stacks, the rows a block high and the aisles clear (art/low_stacks.ts LOW_STACKS, game/act2/library.ts
// AISLES_CLEAR): the hero in an aisle before a row, then behind one; the rivers flowing and the wheel (art/flowing.ts FLOW):
// floor 13's race and wheel, floor 13's river, floor 9's river, each a few seconds of film, slowed, each frame's game clock
// logged ('TIMES_<part> [...]') so that a video can be put together at the game's own speed. Not a test.
//   node tools/playtest.mjs --file dist/looks.html --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/next_looks.mjs --out shots/looks/x
// PARTS: which (stacks,race,river13,river9). SEED: the run's dice (5). SECS: game seconds of each film (3). SLOW (0.25).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED) || 5;
  const secs = Number(process.env.SECS) || 3;
  const slow = Number(process.env.SLOW) || 0.25;
  const parts = (process.env.PARTS || 'stacks,race,river13,river9').split(',');
  const floor = async (k) => {
    const r = await page.evaluate(([k, s]) => {
      const d = window.__dbg;
      d.saving(false);
      d.run('warrior', s);
      d.seasoned(20);
      d.autoLevel = false; d.autoWords = false; d.god = true;
      const g = d.game();
      g.hero.ring = true; g.hero.pending = 0; g.guide = null;
      g.depth = k; g.cleared = k - 1; g.wayDepth = k; g.enterDungeon();
      g.hero.invuln = 1e9;
      g.bossMet = true;
      g.monsters.length = 0;
      g.level.explored.fill(1);
      return { lowStacks: d.lowStacks.on, aislesClear: d.aislesClear.on, flow: d.flow.on };
    }, [k, seed]);
    log(`floor ${k}`, JSON.stringify(r));
    if (!r.lowStacks || !r.aislesClear || !r.flow) log('!! a switch is off: this is not the looks page');
  };
  /** The hero put down on the open tile nearest (x, y), within `far`, facing down the screen. */
  const put = (x, y, far = 4) => page.evaluate(([x, y, far]) => {
    const g = window.__dbg.game();
    const L = g.level; const W = L.floor.w;
    let best = null;
    for (let ty = Math.floor(y - far); ty <= y + far; ty++) for (let tx = Math.floor(x - far); tx <= x + far; tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= L.floor.h || !L.walk[ty * W + tx]) continue;
      if (L.water && L.water[ty * W + tx]) continue;
      const dd = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
      if (!best || dd < best.d) best = { x: tx + 0.5, y: ty + 0.5, d: dd };
    }
    if (!best) return null;
    g.hero.x = best.x; g.hero.y = best.y; g.hero.fx = 1; g.hero.fy = 1;
    for (const m of g.monsters) m.dead = true;
    window.__dbg.fx.messages.length = 0;
    return { x: best.x, y: best.y };
  }, [x, y, far]);
  const film = async (part) => {
    await page.evaluate((k) => { window.__dbg.slowmo = k; }, slow);
    const t0 = await page.evaluate(() => window.__dbg.game().time);
    const times = [];
    let n = 0;
    for (;;) {
      const t = await page.evaluate(() => window.__dbg.game().time);
      if (t - t0 > secs) break;
      times.push(t);
      await snap(`${part}_f${String(n++).padStart(4, '0')}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    log(`TIMES_${part}`, JSON.stringify(times.map((t) => +t.toFixed(3))));
  };
  for (const part of parts) {
    if (part === 'stacks') {
      await floor(15);
      const spots = await page.evaluate(() => {
        const L = window.__dbg.game().level; const W = L.floor.w; const H = L.floor.h;
        const sh = L.land.shelves;
        if (!sh) return null;
        let n = 0; let sx = 0; let sy = 0;
        for (let i = 0; i < sh.length; i++) if (sh[i]) { n++; sx += i % W; sy += Math.floor(i / W); }
        if (!n) return null;
        const mx = sx / n; const my = sy / n;
        // (an aisle tile with a row just behind it, up the screen: the row before him as he looks in; and one with a row just
        // in front of it, down the screen: he behind the row)
        let front = null; let behind = null;
        const walk = (x, y) => x >= 0 && y >= 0 && x < W && y < H && L.walk[y * W + x] === 1;
        const row = (x, y) => x >= 0 && y >= 0 && x < W && y < H && sh[y * W + x] === 1;
        for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
          if (!walk(x, y)) continue;
          const d = Math.hypot(x - mx, y - my);
          if ((row(x - 1, y) || row(x, y - 1)) && (!front || d < front.d)) front = { x: x + 0.5, y: y + 0.5, d };
          if ((row(x + 1, y) || row(x, y + 1)) && (!behind || d < behind.d)) behind = { x: x + 0.5, y: y + 0.5, d };
        }
        return { rows: n, front, behind };
      });
      log('stacks', JSON.stringify(spots));
      if (!spots || !spots.front) { log('!! no stacks found'); continue; }
      await put(spots.front.x, spots.front.y, 0.5);
      await page.waitForTimeout(4000);
      await snap('stacks_a_aisle');
      await put(spots.behind.x, spots.behind.y, 0.5);
      await page.waitForTimeout(2000);
      await snap('stacks_b_behind');
    } else if (part === 'race') {
      await floor(13);
      const m = await page.evaluate(() => {
        const r = window.__dbg.game().level.land.race;
        const s = r[2][1] > r[1][1] ? 1 : -1;
        return { x: Math.floor(r[1][0]) - 1, y: Math.floor((r[1][1] + r[2][1]) / 2) - 3 * s + 0.5 };
      });
      log('race: at', JSON.stringify(await put(m.x, m.y)));
      await page.waitForTimeout(4000);
      await film('race');
    } else if (part === 'river13' || part === 'river9') {
      await floor(part === 'river13' ? 13 : 9);
      const m = await page.evaluate(() => {
        const rv = window.__dbg.game().level.land.river;
        if (!rv) return null;
        const p = rv[Math.floor(rv.length / 2)];
        return { x: p[0] + 2.5, y: p[1] + 2.5 };
      });
      if (!m) { log(`!! ${part}: no river`); continue; }
      log(`${part}: at`, JSON.stringify(await put(m.x, m.y, 5)));
      await page.waitForTimeout(4000);
      await film(part);
    }
  }
}
