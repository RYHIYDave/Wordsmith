// TERRACES AND STAIRS IN REAL DUNGEON ROOMS, photographed: a run is begun, the dungeon is shown
// whole, and the hero is stood in each room that has raised floor (up to ROOMS of them), on the
// low floor in front of it. The monsters of the room stay where the map-maker put them, asleep.
//   SEED=5 DEPTH=1 ROOMS=4 node tools/playtest.mjs --file dist/ledges.html --size 1300x660 --scenario tools/scenarios/terraces.mjs --out shots/terr/a
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 5);
  const depth = Number(process.env.DEPTH || 1);
  const want = Number(process.env.ROOMS || 4);
  await page.evaluate(([cls, seed, depth]) => {
    const d = window.__dbg; d.saving(false); d.run(cls, seed);
    const g = d.game();
    // (straight into dungeon number `depth`, as the gate would send them)
    if (g.level.town) { g.depth = depth; g.enterDungeon(); }
  }, [cls, seed, depth]);
  await page.waitForTimeout(600);
  const rooms = await page.evaluate(() => {
    const g = window.__dbg.game(); const f = g.level.floor;
    g.level.explored.fill(1);
    const out = [];
    if (!f.height) return out;
    for (const r of f.rooms) {
      let n = 0, sx = 0, sy = 0, lowN = 0, lx = 0, ly = 0;
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
        const i = y * f.w + x;
        if (f.tiles[i] !== 1) continue;
        if (f.height[i] > 0) { n++; sx += x; sy += y; } else if (!f.stair[i] && f.height[i] === 0) { lowN++; lx += x; ly += y; }
      }
      if (n) out.push({ id: r.id, kind: r.kind, w: r.w, h: r.h, raised: n, tx: sx / n + 0.5, ty: sy / n + 0.5, lx: lx / lowN + 0.5, ly: ly / lowN + 0.5 });
    }
    return out;
  });
  log('rooms with a terrace', rooms.map((r) => `${r.id}:${r.kind} ${r.w}x${r.h} raised ${r.raised}`).join(' | ') || 'none');
  let k = 0;
  for (const r of rooms.slice(0, want)) {
    await page.evaluate((r) => {
      const g = window.__dbg.game(); const h = g.hero; const f = g.level.floor;
      // the hero on the low floor of the room, at the place nearest its middle that is free
      let best = null, bd = 1e9;
      for (let y = r.ly - 3; y <= r.ly + 3; y += 0.5) for (let x = r.lx - 3; x <= r.lx + 3; x += 0.5) {
        const i = Math.floor(y) * f.w + Math.floor(x);
        if (g.level.walk[i] !== 1 || f.height[i] !== 0 || f.stair[i]) continue;
        // (clear of the room's monsters: two and a half tiles from the nearest)
        let nearM = 1e9;
        for (const m of g.monsters) nearM = Math.min(nearM, Math.hypot(m.x - x, m.y - y));
        const d = Math.hypot(x - r.lx, y - r.ly) + (nearM < 2.5 ? 50 : 0);
        if (d < bd) { bd = d; best = [x, y]; }
      }
      if (best) { h.x = best[0]; h.y = best[1]; }
      const dx = r.tx - h.x, dy = r.ty - h.y, n = Math.hypot(dx, dy) || 1; h.fx = dx / n; h.fy = dy / n;
      clearInterval(window.__still);
      window.__still = setInterval(() => { for (const m of g.monsters) { m.state = 'sleep'; m.seen = true; } h.invuln = 1; h.flash = 0; g.level.explored.fill(1); g.level.visible.fill(1); }, 3);
    }, r);
    await page.waitForTimeout(900);
    await snap(`room${k++}`);
  }
}
