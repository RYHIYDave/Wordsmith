// ACT 1, THE DESCENT: A FLOOR OF IT IN THE GAME (game/act1_layout.ts; render/outdoor.ts). The floor made, all of
// it seen; pictures of where the hero comes in, of its open areas, its strongholds' yards and halls, and of the
// boss's ground.
//   node tools/build_to.mjs dist/act1.html
//   DEPTH=6 node tools/playtest.mjs --file dist/act1.html --size 1014x468 --scenario tools/scenarios/act1_floor.mjs --out shots/act1/floor6
// DEPTH: which floor (6 to 10). SEED: the run's (9). FOES=1: its monsters kept (else taken away). AREAS: how many areas (5).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 6);
  const seed = Number(process.env.SEED || 9);
  const areas = Number(process.env.AREAS || 5);
  const foes = process.env.FOES === '1';
  await page.evaluate((s) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', s); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, seed);
  await page.waitForTimeout(600);
  const t0 = Date.now();
  const info = await page.evaluate(([n, keep]) => {
    const g = window.__dbg.game();
    const t = performance.now();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const ms = Math.round(performance.now() - t);
    const L = g.level;
    L.explored.fill(1);
    if (!keep) g.monsters = g.monsters.filter((m) => m.boss);
    const land = L.land;
    return {
      ms,
      w: L.floor.w, h: L.floor.h,
      start: L.floor.start, boss: L.floor.boss,
      areas: land ? land.areas.map((a) => [a.blob.x, a.blob.y, a.role]) : [],
      holds: land ? land.holds.map((q) => [q.gx, q.gy + 2.5, q.inside.x + q.inside.w / 2, q.inside.y + q.inside.h / 2]) : [],
      packs: L.floor.packs.length,
      monsters: g.monsters.length,
      kinds: [...new Set(g.monsters.map((m) => m.kind))],
    };
  }, [depth, foes]);
  log('floor', JSON.stringify({ depth, ms: info.ms, size: [info.w, info.h], packs: info.packs, monsters: info.monsters, kinds: info.kinds, holds: info.holds.length }));
  const go = async (x, y, name) => {
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a; g.hero.y = b; }, [x, y]);
    await page.waitForTimeout(900);
    await snap(name);
  };
  await snap('a_start');
  const list = info.areas.filter((a) => a[2] === 'path' || a[2] === 'side' || a[2] === 'lair').slice(0, areas);
  for (let k = 0; k < list.length; k++) await go(list[k][0], list[k][1], `b_area${k}`);
  for (let k = 0; k < info.holds.length; k++) {
    await go(info.holds[k][0], info.holds[k][1], `c_yard${k}`);
    await go(info.holds[k][2], info.holds[k][3], `c_hall${k}`);
  }
  await go(info.boss.x, info.boss.y + 2, 'd_boss');
  log('took', `${Date.now() - t0} ms`);
}
