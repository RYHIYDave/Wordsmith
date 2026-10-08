// SUNKEN FLOOR IN REAL DUNGEON ROOMS, photographed (the owner, 7 Oct 2026, 08:01: "Stairs should go
// down as well"). The map-maker lays none in the game yet: this switches it on for itself
// (__dbg.relief.sunken), begins a run, goes into dungeon number DEPTH, shows it whole, and stands
// the hero by each room's sunken floor (up to ROOMS of them), on the room's own floor behind it.
// The monsters of the room stay where the map-maker put them, asleep.
//   SEED=5 DEPTH=2 ROOMS=4 node tools/playtest.mjs --file dist/down.html --size 1300x660 --scenario tools/scenarios/sunken.mjs --out shots/sunk/a
// WHERE = back (behind its far corner, looking at it: the default) | in (standing in it)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 5);
  const depth = Number(process.env.DEPTH || 2);
  const want = Number(process.env.ROOMS || 4);
  const where = process.env.WHERE || 'back';
  await page.evaluate(([cls, seed, depth]) => {
    const d = window.__dbg; d.saving(false); d.relief.sunken = true; d.run(cls, seed);
    const g = d.game();
    if (g.level.town) { g.depth = depth; g.enterDungeon(); }
    d.autoLevel = false; d.autoWords = false;
    // (nothing wakes while it is photographed, and nothing is said)
    d.game().wakeUp = () => {};
  }, [cls, seed, depth]);
  await page.waitForTimeout(600);
  const rooms = await page.evaluate(() => {
    const g = window.__dbg.game(); const f = g.level.floor;
    g.level.explored.fill(1);
    const out = [];
    if (!f.height) return out;
    for (const r of f.rooms) {
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0, stairs = 0;
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
        const i = y * f.w + x;
        if (f.tiles[i] !== 1 || f.height[i] >= 0) continue;
        n++; if (f.stair[i]) stairs++;
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
      if (n) out.push({ id: r.id, kind: r.kind, w: r.w, h: r.h, sunk: n, stairs, x0, y0, x1, y1 });
    }
    return out;
  });
  log('rooms with sunken floor', rooms.map((r) => `${r.id}:${r.kind} ${r.w}x${r.h}, sunk ${r.x1 - r.x0 + 1}x${r.y1 - r.y0 + 1}, ${r.stairs} stair tiles`).join(' | ') || 'none');
  let k = 0;
  for (const r of rooms.slice(0, want)) {
    await page.evaluate(([r, where]) => {
      const g = window.__dbg.game(); const h = g.hero; const f = g.level.floor;
      // behind its far corner, on the room's own floor (or in the middle of it), at the free place nearest
      const wantX = where === 'in' ? (r.x0 + r.x1 + 1) / 2 : r.x0 - 0.5;
      const wantY = where === 'in' ? (r.y0 + r.y1 + 1) / 2 : r.y0 - 0.5;
      let best = null, bd = 1e9;
      for (let y = wantY - 3; y <= wantY + 3; y += 0.5) for (let x = wantX - 3; x <= wantX + 3; x += 0.5) {
        const i = Math.floor(y) * f.w + Math.floor(x);
        if (g.level.walk[i] !== 1 || f.stair[i]) continue;
        if ((where === 'in') !== (f.height[i] < 0)) continue;
        if (!g.free(g.level.walk, x, y, 0.45)) continue;
        let nearM = 1e9;
        for (const m of g.monsters) nearM = Math.min(nearM, Math.hypot(m.x - x, m.y - y));
        const d = Math.hypot(x - wantX, y - wantY) + (nearM < 1.6 ? 50 : 0);
        if (d < bd) { bd = d; best = [x, y]; }
      }
      if (best) { h.x = best[0]; h.y = best[1]; }
      const cx = (r.x0 + r.x1 + 1) / 2, cy = (r.y0 + r.y1 + 1) / 2;
      const dx = cx - h.x, dy = cy - h.y, n = Math.hypot(dx, dy) || 1; h.fx = dx / n; h.fy = dy / n;
      if (where === 'in') { h.fx = 0.7; h.fy = 0.7; }
      clearInterval(window.__still);
      window.__still = setInterval(() => { for (const m of g.monsters) { m.state = 'sleep'; m.seen = true; } h.invuln = 1; h.flash = 0; g.level.explored.fill(1); g.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
    }, [r, where]);
    await page.waitForTimeout(900);
    await snap(`room${k++}`);
  }
}
