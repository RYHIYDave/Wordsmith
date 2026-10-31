// FLOOR 19, THE KEEP: the crossbowmen and the Order's armed last, seen in the game (behind HIGH_CITY, on here alone): one of each
// woken six tiles from the hero; pictures through the crossbowman's aimed shot (the lane drawn out, held, the bolt) and the
// armed last's fan of three.
//   node tools/playtest.mjs --file <page> --size 1280x720 --scenario tools/scenarios/high19_xbow.mjs --out shots/high19/x
export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run('warrior', 3); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 19);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    const g = d.game(); for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
  });
  for (const kind of ['xbow', 'order']) {
    await page.evaluate((kind) => {
      const d = window.__dbg; const g = d.game();
      g.monsters = g.monsters.filter((m) => m.boss);
      const K = g.level.land.keep; const q = K.rooms.find((r) => r.role === 'hall'); const r = q.r;
      const alongX = r[2] - r[0] >= r[3] - r[1];
      const cx = (r[0] + r[2]) / 2; const cy = (r[1] + r[3]) / 2;
      g.hero.x = alongX ? r[0] + 2.5 : cx; g.hero.y = alongX ? cy : r[1] + 2.5;
      const m = d.spawnAt ? d.spawnAt(kind, alongX ? g.hero.x + 7 : cx, alongX ? cy : g.hero.y + 7) : g.spawn(kind, alongX ? g.hero.x + 7 : cx, alongX ? cy : g.hero.y + 7, -9, 0, false, new (g.rng.constructor)(5));
      g.wakeUp ? g.wakeUp(m) : (m.state = 'chase');
      window.__m = m;
    }, kind);
    const want = kind === 'xbow' ? [0.7, 1.0, 1.3, 1.4, 1.5] : [0.5, 0.8, 0.95, 1.1, 1.3];
    const id = kind === 'xbow' ? 'xbow:shot' : 'order:knife';
    let k = 0;
    for (let i = 0; i < 400 && k < want.length; i++) {
      const t = await page.evaluate((id) => { const m = window.__m; return m.act && m.act.id === id ? m.act.t : -1; }, id);
      if (t >= want[k]) { await snap(`${kind}_${k}_${t.toFixed(2)}`); k++; }
      await page.waitForTimeout(20);
    }
  }
}
