// THE EXITS' NAMES (game/exit_labels.ts EXIT_LABELS, off; turned on here): on each floor asked for, its boss struck down, its way
// out opened (its film painted first, the game held still meanwhile), and the hero a few tiles from it: its name over it, as the
// town's services carry theirs. Pictures, and a check that the name is there once it is open and not before. Not his yes.
//   node tools/playtest.mjs --file dist/next.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/exit_labels.mjs --out shots/labels/x
// FLOORS: which (2,4,5,6,8). SEED: the run's dice (5).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const seed = Number(process.env.SEED) || 5;
  const floors = (process.env.FLOORS || '2,4,5,6,8').split(',').map(Number);
  await page.evaluate((s) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.exitLabels.on = true;
  }, seed);
  const filmHas = (key) => page.evaluate((k) => !!window.__dbg.painter.filmOf(k), key);
  const waitFilm = async (key, secs) => {
    for (let k = 0; k < secs; k++) {
      if (await filmHas(key)) return k;
      await page.waitForTimeout(1000);
    }
    return -1;
  };
  const labels = () => page.evaluate(() => [...window.__dbg.ui.marks.keys()].length);
  for (const depth of floors) {
    const info = await page.evaluate((k) => {
      const g = window.__dbg.game();
      g.hero.ring = true; g.hero.pending = 0; g.guide = null;
      g.depth = k; g.cleared = k - 1; g.wayDepth = k; g.enterDungeon();
      g.hero.invuln = 1e9;
      g.level.explored.fill(1);
      for (const m of g.monsters) if (!m.boss) m.life = 0;
      const W = g.level.ways;
      return { a1: W.a1 ?? null, cave: !!W.cave, shaft: !!W.shaft, stairs: W.stairs.length };
    }, depth);
    log(`floor ${depth}`, JSON.stringify(info));
    // (its film painted first, the game held still)
    await page.evaluate(() => { window.__dbg.slowmo = 0; });
    if (info.a1) log('way film', await waitFilm(`onward:${depth}:${info.a1.dir}`, 240));
    else if (info.cave) log('cave film', await waitFilm(await page.evaluate(() => `cave:${window.__dbg.game().level.ways.cave.spot.alongX ? 'x' : 'y'}`), 240));
    else if (info.shaft) log('shaft film', await waitFilm('shaft:down', 120));
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    await page.evaluate(() => {
      const g = window.__dbg.game();
      for (let k = 0; k < 6; k++) {
        const b = g.boss ?? g.monsters.find((m) => m.boss && !m.dead);
        if (!b) break;
        g.bossReady();
        g.kill(g.boss ?? b);
      }
      const on = g.level.ways.onward;
      if (on && !on.awake) { on.awake = true; on.warpAt = g.time; }
    });
    await page.waitForTimeout(6500);
    const where = await page.evaluate(() => {
      const g = window.__dbg.game();
      const L = g.level;
      const W = L.ways;
      const at = W.a1 && W.onward ? W.onward : W.cave ? { x: W.cave.spot.alongX ? W.cave.spot.a + 1.5 : W.cave.spot.plane + 3, y: W.cave.spot.alongX ? W.cave.spot.plane + 3 : W.cave.spot.a + 1.5 } : W.shaft ? { x: W.shaft.x + 2.5, y: W.shaft.y + 2.5 } : W.stair ? { x: W.stair.x + 3, y: W.stair.y + 3 } : W.onward;
      return at ? { x: at.x, y: at.y } : null;
    });
    // (the hero put down 3.5 to 5 tiles from it, where he can stand, never on its way in: behind a way on, from its way)
    if (where) {
      const put = await page.evaluate(([x, y]) => {
        const g = window.__dbg.game();
        const L = g.level; const f = L.floor; const W = L.ways;
        const U = { 'x+': [1, 0], 'x-': [-1, 0], 'y+': [0, 1], 'y-': [0, -1] };
        const u = W.a1 ? U[W.a1.dir] : null;
        let best = null;
        for (let ty = Math.floor(y - 6); ty <= y + 6; ty++) for (let tx = Math.floor(x - 6); tx <= x + 6; tx++) {
          const cx = tx + 0.5; const cy = ty + 0.5;
          const d = Math.hypot(cx - x, cy - y);
          if (d < 3.5 || d > 5 || !g.free(L.walk, cx, cy, 0.4)) continue;
          if (u && (cx - x) * u[0] + (cy - y) * u[1] > -1) continue;
          if (W.stair && Math.hypot(cx - (W.stair.x + 1), cy - (W.stair.y + 1)) < 3.5) continue;
          // (nearer the bottom of the screen first: the name stands up over its foot)
          const score = cx + cy - x - y;
          if (!best || score > best.score) best = { x: cx, y: cy, score };
        }
        if (!best) return null;
        g.hero.x = best.x; g.hero.y = best.y;
        return best;
      }, [where.x, where.y]);
      log('hero at', JSON.stringify(put));
    }
    await page.waitForTimeout(800);
    await page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
    const names = await page.evaluate(() => window.__dbg.exitNames ? window.__dbg.exitNames() : null);
    log('names', JSON.stringify(names));
    await snap(`f${depth}`);
  }
}
