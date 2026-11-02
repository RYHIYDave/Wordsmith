export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 4242); d.seasoned(8); d.god = true; });
  await page.waitForTimeout(600);
  const out = await page.evaluate(() => {
    const D = window.__dbg;
    let g = D.game();
    g.depth = 14; g.cleared = 13; g.enterDungeon();
    g = D.game();
    g.waveT = 1e9;
    const m = g.boss;
    for (const q of g.monsters) if (q !== m) q.dead = true;
    g.monsters = [m];
    g.hero.x = m.x + 2.1; g.hero.y = m.y + 2.1;
    g.wakeUp(m); g.bossReady();
    m.life = m.maxLife = 1e9; m.cd = 0; m.speed = 0;
    m.moveCd = [99, 99, 99, 99, 0];
    const acts = g.bosses.constructor.name;
    const L = g.level;
    const T3 = 32 / Math.sqrt(2 / 3);
    const beds = L.props.filter((p) => p.kind === 'piece' && p.name === 'an iron ward bed' && Math.hypot(p.x - m.x, p.y - m.y) < 18);
    const info = beds.map((p) => {
      const headY = p.variant % 4 >= 2;
      const fx = headY ? 1 : 0, fy = headY ? 0 : 1;
      const s = { x: p.x + fx * 20 / T3, y: p.y + fy * 20 / T3 };
      const up = { x: s.x + fx * 0.36, y: s.y + fy * 0.36 };
      return [Math.hypot(s.x - m.x, s.y - m.y).toFixed(1), g.free(L.walk, s.x, s.y, 0), g.free(L.walk, up.x, up.y, 0.3)].join('/');
    });
    const idle = { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };
    for (let k = 0; k < 120 && m.state !== 'act'; k++) g.update(1 / 30, idle);
    return { acts, info, state: m.state, act: m.act && m.act.id, a1: m.a1, sees: g.sees(m.x, m.y, g.hero.x, g.hero.y), cd: m.cd, moveCd: m.moveCd };
  });
  console.log(JSON.stringify(out));
}
