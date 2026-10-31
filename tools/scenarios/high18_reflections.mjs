// FLOOR 18'S REFLECTIONS (behind HIGH_CITY, on here alone): the hero in a gallery by its mirrors, a pair of his reflections woken
// there; they step out of the mirrors and fight him with his class's blows. Pictures every half second.
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high18_reflections.mjs --out shots/high18/r   env: CLS=warrior SEED=3
export default async function (page, snap) {
  const seed = Number(process.env.SEED || 3);
  const cls = process.env.CLS || 'warrior';
  await page.evaluate(([seed, cls]) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run(cls, seed); d.seasoned(22); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 18);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
    // (a gallery with mirrors: the hero three tiles out from one, two reflections woken by it)
    const L = g.level;
    const mir = L.props.filter((p) => p.name === 'a tall mirror');
    const m0 = mir[Math.floor(mir.length / 2)];
    const face = m0.variant & 1;
    const wx = face === 0 ? m0.tx + 0.5 : m0.tx;
    const wy = face === 0 ? m0.ty : m0.ty + 0.5;
    g.hero.x = wx + (face === 0 ? 0 : 3.2);
    g.hero.y = wy + (face === 0 ? 3.2 : 0);
    for (const k of [-1.5, 1.5]) {
      const m = g.spawn('reflection', wx + (face === 0 ? k : 1.5), wy + (face === 0 ? 1.5 : k), 18, 0, false, g.rng);
      m.words = []; m.carries = [];
      g.wakeUp(m);
    }
  }, [seed, cls]);
  for (let i = 0; i < 16; i++) {
    await page.waitForTimeout(500);
    await snap(`${cls}_${String(i).padStart(2, '0')}`);
    if (i % 4 === 3) console.log(`  ${(i + 1) / 2} s`, await page.evaluate(() => { const g = window.__dbg.game(); return g.monsters.filter((m) => m.kind === 'reflection' && !m.dead).map((m) => `${m.form}:${m.act ? m.act.id + '@' + m.act.t.toFixed(2) : 'gait'}`).join(' ') + ` hero ${Math.round(g.hero.life)}`; }));
  }
}
