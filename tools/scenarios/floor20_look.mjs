// FLOOR 20, THE QUIET TOWER, looked at room by room (behind HIGH_CITY, switched on here alone): a still in each kind of room of
// the climb, at the tower's stair, up it onto the top (through the curtain), on the top before the lectern.
//   node tools/playtest.mjs --file dist/floor20.html --size 1280x720 --scenario tools/scenarios/floor20_look.mjs --out shots/f20look/l
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 4);
  await page.evaluate((seed) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run(process?.env?.CLS || 'warrior', seed); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, seed).catch(async () => {
    await page.evaluate((seed) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', seed); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true; }, seed);
  });
  await page.evaluate(() => {
    const d = window.__dbg; d.high(true, 20);
    const g = d.game(); g.level.explored.fill(1);
    for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss); g.waveT = 1e9;
    d.bot(false);
  });
  await page.waitForTimeout(2500);
  console.log(await page.evaluate(() => { const g = window.__dbg.game(); const T = g.level.land.tower; return `depth ${g.depth} land ${g.level.land.kind} rooms ${T.rooms.map((r) => r.role).join(',')} size ${g.level.floor.w}x${g.level.floor.h}`; }));
  const at = async (name, fn, wait = 1800) => {
    await page.evaluate(fn);
    await page.waitForTimeout(wait);
    await snap(name);
  };
  const rooms = ['foot', 'scriptorium', 'landing', 'fogged', 'belfry', 'cell', 'store', 'stairhead'];
  for (const role of rooms) {
    await at(role, new Function(`const g = window.__dbg.game(); const h = g.hero; const T = g.level.land.tower; const q = T.rooms.find((r) => r.role === '${role}'); if (!q) return; h.x = (q.r[0] + q.r[2]) / 2; h.y = (q.r[1] + q.r[3]) / 2 + 1; h.fx = -0.7; h.fy = -0.7;`));
  }
  // (up the stair: walk him into it)
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; const T = g.level.land.tower; h.x = T.stair.back.x; h.y = T.stair.back.y; });
  await page.waitForTimeout(600);
  await page.evaluate(() => { const g = window.__dbg.game(); const T = g.level.land.tower; window.__dbg.walkTo ? window.__dbg.walkTo(T.stair.x, T.stair.y) : (g.hero.x = T.stair.x + (T.stair.back.x - T.stair.x) * 0.55, g.hero.y = T.stair.y + (T.stair.back.y - T.stair.y) * 0.55); });
  for (let k = 0; k < 6; k++) { await page.waitForTimeout(250); await snap(`climb${k}`); }
  await page.waitForTimeout(1500);
  await snap('top_arrive');
  console.log(await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return `hero ${h.x.toFixed(1)},${h.y.toFixed(1)} on top ${h.x >= g.level.land.tower.split}`; }));
  await page.waitForTimeout(2500);
  await snap('top_slam');
  await at('top_mid', () => { const g = window.__dbg.game(); const h = g.hero; const T = g.level.land.tower; h.x = T.top.cx + 1; h.y = T.top.cy + 2.5; });
  await at('top_west', () => { const g = window.__dbg.game(); const h = g.hero; const T = g.level.land.tower; h.x = T.top.cx - 7; h.y = T.top.cy; });
  await at('top_north', () => { const g = window.__dbg.game(); const h = g.hero; const T = g.level.land.tower; h.x = T.top.cx; h.y = T.top.cy - 7; });
}
