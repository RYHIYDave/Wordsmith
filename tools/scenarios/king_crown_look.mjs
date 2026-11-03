// THE KING'S CROWN'S WEIGHT, seen in play: floor 19, the King alone with the hero (nothing can kill him), his other moves held
// off so that the crown is the one he does; the hero stands five tiles off, then walks slowly aside as the crown follows.
// Stills every quarter of the game's second (the game run at a quarter of its pace).
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/king_crown_look.mjs --out shots/crown
export default async function (page, snap) {
  const seconds = Number(process.env.SECONDS || 8);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 7); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true; d.floorNames(false);
    d.high(true, 19);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
  });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const m = g.monsters.find((q) => q.kind === 'gking');
    if (!m) return { boss: g.boss?.kind ?? null };
    for (const q of g.monsters) if (q !== m) q.dead = true;
    g.projectiles.length = 0;
    h.x = m.x + 0.5; h.y = m.y + 5;
    m.state = 'chase'; m.cd = 0.3;
    m.life = m.maxLife = 1e7; m.words = []; m.shield = 0;
    // (his acts: the charge, the Decree, the crown's weight, the Curtains, his climb: all but the crown held off)
    m.moveCd = [999, 999, 0, 999, 999];
    g.boss = m; g.bossMet = true;
    g.level.explored.fill(1);
    d.bot(false);
    window.__h0 = [h.x, h.y];
    return { boss: m.kind, at: [m.x.toFixed(1), m.y.toFixed(1)] };
  });
  console.log('  boss', JSON.stringify(info));
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const every = 0.25;
  for (let i = 0; i * every < seconds; i++) {
    const s = i * every;
    await page.evaluate((s) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const m = g.monsters.find((q) => q.kind === 'gking' && !q.dead);
      if (m) {
        m.moveCd[0] = m.moveCd[1] = m.moveCd[3] = 999;
        // (still till 2.5 s, then walking aside a tile and a half a second)
        const [x0, y0] = window.__h0;
        const k = Math.max(0, s - 2.5) * 1.5;
        if (g.isOpen(x0 + k, y0 - k * 0.2)) { h.x = x0 + k; h.y = y0 - k * 0.2; }
        const dx = m.x - h.x; const dy = m.y - h.y; const l = Math.hypot(dx, dy) || 1;
        h.fx = dx / l; h.fy = dy / l;
      }
      d.slowmo = 0.25;
    }, s);
    await page.waitForFunction((at) => window.__dbg.clock() >= at, c0 + s, { polling: 'raf', timeout: 120000 });
    await snap(`c${String(i).padStart(3, '0')}`);
    const st = await page.evaluate(() => {
      const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'gking'); const h = g.hero;
      const p = g.perils.find((q) => q.a1 === 'gking:weight');
      return `${m ? (m.act ? m.act.id : m.state) : 'gone'} hero ${h.x.toFixed(1)},${h.y.toFixed(1)}` + (p ? ` crown ${p.x.toFixed(1)},${p.y.toFixed(1)} t ${p.t.toFixed(2)}` : '');
    });
    console.log(`  ${s.toFixed(2)} s`, st);
  }
}
