// FLOOR 17'S MASKED DANCERS (behind HIGH_CITY, on here alone): a pack of six laid in a room of the Masque, waltzing in pairs while
// they sleep; he comes near, they notice him, break and whirl at him, spin; at 20 s the clock chimes. Stills every half second.
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high17_dancers.mjs --out shots/h17d/d
export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 3); d.seasoned(22); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 17);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    const room = g.level.land.masque.rooms.find((q) => q.role === 'violet');
    const cx = (room.r[0] + room.r[2]) / 2; const cy = (room.r[1] + room.r[3]) / 2;
    g.hero.x = room.r[0] + 1.5; g.hero.y = room.r[3] - 1.5;
    for (let i = 0; i < 6; i++) {
      const a = (i >> 1) * 2.1; const r = 2.2;
      const m = g.spawn('dancer', cx + Math.cos(a) * r, cy + Math.sin(a) * r, 950, 0, false, g.rng);
      m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 1e6;
    }
    window.__dancers = g.monsters.filter((m) => m.kind === 'dancer').map((m) => ({ id: m.id, form: m.form, x: m.x.toFixed(2), y: m.y.toFixed(2), state: m.state, partner: m.a1?.partner }));
  });
  console.log('  laid', JSON.stringify(await page.evaluate(() => window.__dancers)));
  await page.waitForTimeout(2500);
  await snap('a_waltz');
  await page.waitForTimeout(400);
  await snap('a_waltz2');
  // he comes near: they notice him
  await page.evaluate(() => { const g = window.__dbg.game(); const room = g.level.land.masque.rooms.find((q) => q.role === 'violet'); g.hero.x = (room.r[0] + room.r[2]) / 2 - 3.5; g.hero.y = (room.r[1] + room.r[3]) / 2 + 1.5; });
  for (let i = 0; i < 44; i++) {
    await page.waitForTimeout(500);
    await snap(`b_${String(i).padStart(2, '0')}`);
    if (i % 4 === 0) console.log(`  ${(i / 2).toFixed(1)} s`, await page.evaluate(() => window.__dbg.game().monsters.filter((m) => m.kind === 'dancer').map((m) => `${m.state}:${m.act ? m.act.id.split(':')[1] : m.anim}`).join(' ')));
  }
}
