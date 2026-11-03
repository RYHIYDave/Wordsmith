// HER TREE'S GUN ARM IN THE GAME, WITH THE ART CHAT'S CHARGED SHOTS (art/golem_shots_fx.ts laid by render/tinkerer_fx.ts; a page built
// with the characters on): the Tinkerer with the Gun Arm (GUN=cannon or tesla), her Golem whistled out, her hold held a second and
// a half at a pack five tiles off, then let go; pictures every few frames from the charge to its end. And her Contraption with its
// pick (AMMO=bombs or energy) firing at them.
//   node tools/playtest.mjs --file dist/x.html --size 844x390 --dpr 2 --scenario tools/scenarios/gun_arm_look.mjs --out shots/gun
const FPS = 30;
const PACK = [[4.6, -0.6], [5.2, 0.4], [5.0, 1.3], [5.8, -0.2]];
const GOLEM = ['bombsaway', 'fortune', 'lightningrod', 'shrapnel', 'gunarm'];

export default async function (page, snap) {
  const GUN = process.env.GUN || 'cannon';
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.practice('tinkerer', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(600);
  await page.evaluate(([pack, talents, gun]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    h.fx = 1; h.fy = 0;
    h.talents = talents.slice(); h.picks = { gunarm: gun }; g.refresh();
    for (const [dx, dy] of pack) {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9; m.state = 'recover'; m.t = 1e9; m.anim = 'idle';
    }
    const x0 = h.x; const y0 = h.y;
    const f = { t: 0, log: [] };
    window.__gfilm = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      h.mana = h.d.maxMana;
      for (const s of h.skills) if (s) s.cd = 0;
      // (0.2 s: the Golem whistled out; from 1.4 s her hold held at the pack, let go at 2.9 s)
      if (f.t >= 0.2 && !f.called) { f.called = true; c.cast = true; c.castX = x0 + 3; c.castY = y0; }
      if (f.t >= 1.4 && f.t < 2.9) { c.cast = true; c.hold = true; c.castX = x0 + 5.2; c.castY = y0 + 0.3; }
      const gm = g.golems[0];
      if (gm && gm.act !== f.act) { f.act = gm.act; f.log.push(`${f.t.toFixed(2)} golem ${gm.act}`); }
      return run(dt, c);
    };
  }, [PACK, GOLEM, GUN]);
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(6 * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    const t = i / FPS;
    if (t >= 1.4 && i % 4 === 0) await snap(`f${String(i).padStart(3, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__gfilm.log)).join('\n'));
}
