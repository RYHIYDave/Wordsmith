// HER GOLEM'S ROCKET JUMP (his word, 2 Nov 2026, 21:29: “And the golem is gonna need that rocket jump for positioning, and probably
// more movespeed”): in the practice room, her Golem whistled out a little behind her, a skeleton set eight tiles off it; the game
// stepped a thirtieth of a second at a time and pictured every other frame as it blasts off and comes down.
//   node tools/playtest.mjs --file dist/x.html --size 844x390 --dpr 2 --scenario tools/scenarios/golem_jump_look.mjs --out shots/gj
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.practice('tinkerer', 5); d.autoLevel = false; d.autoWords = false; d.god = true; const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; h.fx = 1; h.fy = 0;
    const x0 = h.x; const y0 = h.y; const f = { t: 0, log: [] }; window.__gj = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt; for (const s of h.skills) if (s) s.cd = 0;
      if (f.t > 0.1 && !f.called) { f.called = true; c.cast = true; c.castX = x0 - 1; c.castY = y0 - 1; }
      if (f.t > 1.2 && !f.set && g.golem) {
        f.set = true; g.golem.x = x0 - 0.5; g.golem.y = y0 - 1.5;
        const m = g.spawn('skeleton', x0 + 4, y0 + 5, 1, 0, false, g.rng); g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e7;
      }
      const o = run(dt, c);
      if (g.golem && g.golem.act !== f.act) { f.act = g.golem.act; f.log.push(`${f.t.toFixed(2)} ${g.golem.act}`); }
      return o;
    };
  });
  const c0 = await page.evaluate(() => window.__dbg.clock());
  for (let i = 0; i < 90; i++) {
    await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / 30, { polling: 'raf', timeout: 120000 });
    if (i >= 36 && i % 2 === 0) await snap(`f${String(i).padStart(2, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__gj.log)).join('\n'));
}
