// FLOOR 17'S FOOTMEN OR SILENT ORDER (behind HIGH_CITY, on here alone): WHO=footman|order, three of them laid in a gallery of the
// Masque, he standing seven tiles off (nothing can kill him); stills every third of a second for fifteen seconds.
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high17_kinds.mjs --out shots/h17k/f   env: WHO
export default async function (page, snap) {
  const who = process.env.WHO || 'footman';
  await page.evaluate((who) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 3); d.seasoned(22); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 17);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    const room = g.level.land.masque.rooms.filter((q) => q.role === 'white' || q.role === 'green')[0];
    const cx = (room.r[0] + room.r[2]) / 2; const cy = (room.r[1] + room.r[3]) / 2;
    g.hero.x = cx - 4; g.hero.y = cy + 3;
    for (let i = 0; i < 3; i++) {
      const m = g.spawn(who, cx + 2 + i * 0.9, cy - 2 + i * 1.1, 951, 0, false, g.rng);
      m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 1e6;
      m.state = 'chase'; m.cd = 0.5;
    }
  }, who);
  for (let i = 0; i < 45; i++) {
    await page.waitForTimeout(333);
    await snap(`${who}_${String(i).padStart(2, '0')}`);
    if (i % 6 === 0) console.log(`  ${(i / 3).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); return g.monsters.filter((m) => !m.boss && !m.dead).map((m) => `${m.state}:${m.act ? m.act.id.split(':')[1] + '@' + m.act.t.toFixed(2) : m.anim}`).join(' ') + ` life ${Math.round(g.hero.life)} hush ${g.hushT.toFixed(1)} perils ${g.perils.length}`; }));
  }
}
