// THE TRAPS IN A REAL DUNGEON, FOR LOOKING AT (not in the regression): the map-maker's traps of one
// dungeon, lit, each photographed with the hero set down near it; the dungeon's monsters taken away.
//   DEPTH=2 SEED=5 node tools/playtest.mjs --file <page> --scenario tools/scenarios/traps_dungeon.mjs --out shots/trapsdungeon/pc
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 2);
  const seed = Number(process.env.SEED || 5);
  const laid = await page.evaluate(([depth, seed]) => {
    const d = window.__dbg; d.saving(false);
    d.run('warrior', seed);
    const g = d.game();
    g.depth = depth; g.enterDungeon();
    d.autoLevel = false; d.autoWords = false; d.god = true;
    g.monsters.length = 0; g.projectiles.length = 0;
    clearInterval(window.__lit);
    window.__lit = setInterval(() => { const q = window.__dbg.game(); if (!q) return; q.level.explored.fill(1); q.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
    const L = g.level; const f = L.floor;
    return {
      w: f.w,
      hazards: L.hazards.map((z) => z.spot),
      sealed: f.rooms.filter((r) => r.sealed).map((r) => ({ id: r.id, word: r.sealed })),
      doors: L.doors.filter((q) => q.spot.kind === 'worddoor').map((q) => ({ a: q.spot.a, plane: q.spot.plane, alongX: q.spot.alongX, out: q.spot.out, word: q.spot.word })),
    };
  }, [depth, seed]);
  log(`Dungeon ${depth} of seed ${seed}`, `${laid.hazards.map((z) => `${z.kind} ${z.w}x${z.h} at ${z.x},${z.y}`).join('; ')}; sealed: ${laid.sealed.map((r) => r.word).join(', ') || 'none'}`);
  const stand = async (p, look) => {
    await page.evaluate(([p, look]) => {
      const h = window.__dbg.game().hero;
      h.x = p.x; h.y = p.y;
      const dx = look.x - p.x; const dy = look.y - p.y; const n = Math.hypot(dx, dy) || 1;
      h.fx = dx / n; h.fy = dy / n;
    }, [p, look]);
    await page.waitForTimeout(900);
  };
  let k = 0;
  for (const z of laid.hazards) {
    k++;
    const mid = { x: z.x + z.w / 2, y: z.y + z.h / 2 };
    // (the hero a little toward the eye of it, so that it is in the middle of the picture)
    const spot = await page.evaluate(([mid]) => {
      const g = window.__dbg.game(); const L = g.level; const f = L.floor;
      for (const r of [2.5, 3, 2, 3.5, 1.5]) for (const [dx, dy] of [[1, 1], [1, 0], [0, 1], [-1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1]]) {
        const n = Math.hypot(dx, dy); const x = mid.x + (dx / n) * r; const y = mid.y + (dy / n) * r;
        const i = Math.floor(y) * f.w + Math.floor(x);
        if (L.walk[i] === 1) return { x, y };
      }
      return mid;
    }, [mid]);
    await stand(spot, mid);
    if (z.kind === 'spikes') await page.evaluate(([ph]) => { const g = window.__dbg.game(); g.time = 2.2 - ph + 2.5 * 4; }, [z.phase || 0]);
    await page.waitForTimeout(60);
    await snap(`${String(k).padStart(2, '0')}_${z.kind}`);
  }
  for (const q of laid.doors) {
    k++;
    const mid = q.alongX ? { x: q.a + 1.5, y: q.plane + q.out * 2.5 } : { x: q.plane + q.out * 2.5, y: q.a + 1.5 };
    const door = q.alongX ? { x: q.a + 1.5, y: q.plane } : { x: q.plane, y: q.a + 1.5 };
    await stand(mid, door);
    await snap(`${String(k).padStart(2, '0')}_sealed_${q.word}`);
  }
  await page.evaluate(() => clearInterval(window.__lit));
  log('finished clean');
}
