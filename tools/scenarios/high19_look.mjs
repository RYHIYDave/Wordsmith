// FLOOR 19, THE KEEP (behind HIGH_CITY, on here alone): a picture in each kind of room (the bailey, the gate passage, a hall, the
// wall walk, the armoury, the throne hall, beyond it, the bedchamber, the barracks, a store), and at a portcullis; the floor's own
// packs cleared so the place is seen.
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high19_look.mjs --out shots/high19/k   env: SEED=3
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 3);
  await page.evaluate((seed) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', seed); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 19);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
  }, seed);
  await page.waitForTimeout(2500);
  const rooms = await page.evaluate(() => window.__dbg.game().level.land.keep.rooms.map((r) => ({ role: r.role, x: (r.r[0] + r.r[2]) / 2, y: (r.r[1] + r.r[3]) / 2 })));
  const seen = new Set();
  for (const r of rooms) {
    if (seen.has(r.role)) continue;
    seen.add(r.role);
    await page.evaluate((r) => { const g = window.__dbg.game(); g.hero.x = r.x; g.hero.y = r.y; }, r);
    await page.waitForTimeout(1600);
    await snap(`${String(rooms.indexOf(r)).padStart(2, '0')}_${r.role}`);
  }
  const port = await page.evaluate(() => { const K = window.__dbg.game().level.land.keep; const p = K.portcullises[0]; return p ? { x: p.alongX ? p.x + p.n / 2 : p.x + 2.5, y: p.alongX ? p.y + 2.5 : p.y + p.n / 2 } : null; });
  if (port) {
    await page.evaluate((c) => { const g = window.__dbg.game(); g.hero.x = c.x; g.hero.y = c.y; }, port);
    await page.waitForTimeout(1600);
    await snap('zz_portcullis');
  }
}
