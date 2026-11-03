// FLOOR 17, THE MASQUE (behind HIGH_CITY, on here alone): a picture in each of the seven rooms, a gallery, a card room, a
// passage, the black room at its clock; the floor's own packs cleared so the place is seen.
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high17_look.mjs --out shots/high17/m   env: SEED=3
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 3);
  await page.evaluate((seed) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', seed); d.seasoned(22); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 17);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
  }, seed);
  await page.waitForTimeout(2500);
  const rooms = await page.evaluate(() => window.__dbg.game().level.land.masque.rooms.map((r) => ({ role: r.role, x: (r.r[0] + r.r[2]) / 2, y: (r.r[1] + r.r[3]) / 2 })));
  const seen = new Set();
  for (const r of rooms) {
    if (seen.has(r.role) && !['blue','purple','green','orange','white','violet','black'].includes(r.role)) continue;
    seen.add(r.role);
    await page.evaluate((r) => { const g = window.__dbg.game(); g.hero.x = r.x; g.hero.y = r.y; }, r);
    await page.waitForTimeout(1600);
    await snap(`${String(rooms.indexOf(r)).padStart(2, '0')}_${r.role}`);
  }
  const clock = await page.evaluate(() => window.__dbg.game().level.land.masque.clock);
  await page.evaluate((c) => { const g = window.__dbg.game(); g.hero.x = c.x + 3; g.hero.y = c.y + 1; }, clock);
  await page.waitForTimeout(1600);
  await snap('zz_clock');
}
