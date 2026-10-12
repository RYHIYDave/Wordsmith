// THE FIRST FIVE FLOORS: A FLOOR LAID WITH ITS OWN PIECES (game/first5.ts; render/pieces.ts). The floor
// made, all of it seen, its monsters taken away; pictures of a few of its rooms, and of where each of its
// three moments plays (once the painter has made their films, as each plays).
//   node tools/build_to.mjs dist/first5.html
//   DEPTH=1 node tools/playtest.mjs --file dist/first5.html --scenario tools/scenarios/first5_floor.mjs --out shots/first5/floor1
// DEPTH: which floor. ROOMS: how many rooms to photograph (4). MOMENTS=0: none of the moments.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 1);
  const rooms = Number(process.env.ROOMS || 4);
  const moments = process.env.MOMENTS !== '0';
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
  });
  await page.waitForTimeout(600);
  const info = await page.evaluate((n) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    L.explored.fill(1);
    g.monsters = [];
    const D = L.dress;
    const R = L.floor.rooms.filter((r) => r.kind !== 'boss').sort((a, b) => b.w * b.h - a.w * a.h).map((r) => [r.x + r.w / 2, r.y + r.h / 2, r.kind]);
    return { wall: D?.wall.length, tiles: D?.tiles.length, pieces: L.props.filter((p) => p.kind === 'piece').length, moments: D?.moments.map((m) => [m.n, m.x, m.y, m.i ?? null, m.side ?? null]), rooms: R };
  }, depth);
  log('floor', JSON.stringify({ depth, wall: info.wall, tiles: info.tiles, pieces: info.pieces, moments: info.moments }));
  for (let k = 0; k < Math.min(rooms, info.rooms.length); k++) {
    const [x, y] = info.rooms[k];
    await page.evaluate(([a, b]) => { const g = window.__dbg.game(); g.hero.x = a; g.hero.y = b; }, [x, y]);
    await page.waitForTimeout(700);
    await snap(`room${k}`);
  }
  if (!moments) return;
  // (the moments' films)
  for (let i = 0; i < 200; i++) {
    const got = await page.evaluate(() => Object.keys(window.__dbg.painter.stats.films));
    if (got.filter((k) => k.startsWith('moment')).length >= 1 && !(await page.evaluate(() => window.__dbg.painter.busy()))) break;
    await page.waitForTimeout(1000);
  }
  log('films', JSON.stringify(await page.evaluate(() => window.__dbg.painter.stats.films)));
  for (const [n, x, y, wi, side] of info.moments) {
    // (he comes up to it: three tiles off, looking at it)
    await page.evaluate(([a, b]) => {
      // (a tile he could stand on, two to four tiles from it, nearest the screen's eye)
      const g = window.__dbg.game(); const L = g.level; const W = L.floor.w;
      let best = null;
      for (let ty = Math.floor(b) - 4; ty <= Math.floor(b) + 4; ty++) for (let tx = Math.floor(a) - 4; tx <= Math.floor(a) + 4; tx++) {
        const d = Math.hypot(tx + 0.5 - a, ty + 0.5 - b);
        if (d < 2 || d > 4 || L.walk[ty * W + tx] !== 1) continue;
        const score = -(tx + ty) + d * 0.5;
        if (!best || score < best.score) best = { x: tx + 0.5, y: ty + 0.5, score };
      }
      if (best) { g.hero.x = best.x; g.hero.y = best.y; g.hero.fx = -0.7; g.hero.fy = -0.7; }
    }, [x, y]);
    for (const at of [0.3, 1.2, 2.2, 3.4, 6.5]) {
      await page.waitForTimeout(at === 0.3 ? 300 : (at - [0.3, 1.2, 2.2, 3.4, 6.5][[0.3, 1.2, 2.2, 3.4, 6.5].indexOf(at) - 1]) * 1000);
      await snap(`moment${n}_${String(at).replace('.', '')}`);
    }
  }
}
