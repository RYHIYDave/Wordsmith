// FLOOR 18, THE GLASS GALLERY (behind HIGH_CITY, on here alone): a picture in each kind of room (the antechamber, a gallery,
// the chapel, the glasshouse, a dressing room, the Mirror Hall), and at a skylight broken through; the floor's own packs
// cleared so the place is seen.
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high18_look.mjs --out shots/high18/g   env: SEED=3
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 3);
  await page.evaluate((seed) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', seed); d.seasoned(22); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 18);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
  }, seed);
  await page.waitForTimeout(2500);
  const rooms = await page.evaluate(() => window.__dbg.game().level.land.gallery.rooms.map((r) => ({ role: r.role, x: (r.r[0] + r.r[2]) / 2, y: (r.r[1] + r.r[3]) / 2 })));
  const seen = new Set();
  for (const r of rooms) {
    if (seen.has(r.role)) continue;
    seen.add(r.role);
    await page.evaluate((r) => { const g = window.__dbg.game(); g.hero.x = r.x; g.hero.y = r.y; }, r);
    await page.waitForTimeout(1600);
    await snap(`${String(rooms.indexOf(r)).padStart(2, '0')}_${r.role}`);
  }
  const hole = await page.evaluate(() => { const G = window.__dbg.game().level.land.gallery; const i = G.holes.indexOf(1); return i < 0 ? null : { x: (i % G.w) + 0.5, y: Math.floor(i / G.w) - 1.5 }; });
  if (hole) {
    await page.evaluate((c) => { const g = window.__dbg.game(); g.hero.x = c.x; g.hero.y = c.y; }, hole);
    await page.waitForTimeout(1600);
    await snap('zz_skylight');
  }
}
