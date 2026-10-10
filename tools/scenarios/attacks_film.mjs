// THE MONSTERS' ATTACKS (Version 19.8), filmed in the game for the owner: the practice room, the
// warrior standing (he cannot be killed: the god switch), and
//   WHO=trolls  three green trolls round him: their club swings, and now and then a slam;
//   WHO=red     a red troll six tiles off: he roars and scrapes, his line fills, he charges and runs the
//               warrior down; then his swing and his slam;
//   WHO=warden  the Warden beside him: his swing, his slam, and his calling of the dead, who crawl out
//               of the ground.
// The monsters cannot die, and have no words (plain, so the moves are what is seen). A picture every
// 1/FPS second of the GAME's time, the game slowed so that the camera keeps up. Frames: <out>_fNNN.png.
//   WHO=trolls|red|warden  SECONDS=8  FPS=20
//   node tools/playtest.mjs --file dist/<a build>.html --size 960x540 --scenario tools/scenarios/attacks_film.mjs --out shots/film/<who>
export default async function (page, snap) {
  const who = process.env.WHO || 'trolls';
  const seconds = Number(process.env.SECONDS || 8);
  const FPS = Number(process.env.FPS || 20);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.monsterAttacks(true);
    d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  // (the practice room's words of welcome fade first)
  await page.waitForTimeout(Number(process.env.SETTLE || 7000));
  const ids = await page.evaluate((who) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    // (a place `far` tiles off, `deg` degrees round from straight to the screen's left of him)
    const at = (far, deg) => {
      const a = (deg * Math.PI) / 180;
      // the screen's left is (-1, 1) in the floor's tiles; its up is (-1, -1)
      const lx = -Math.SQRT1_2; const ly = Math.SQRT1_2; const ux = -Math.SQRT1_2; const uy = -Math.SQRT1_2;
      return { x: h.x + far * (Math.cos(a) * lx + Math.sin(a) * ux), y: h.y + far * (Math.cos(a) * ly + Math.sin(a) * uy) };
    };
    const put = (kind, rank, boss, p) => {
      const m = g.spawn(kind, p.x, p.y, 1, rank, boss, g.rng);
      m.words = []; m.shield = 0; m.carries = [];
      m.name = kind === 'warden' ? 'Warden' : rank === 2 ? 'Guardian' : 'Brute';
      g.wakeUp(m);
      m.life = m.maxLife = 1e7;
      const far = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / far; m.fy = (h.y - m.y) / far;
      return m;
    };
    const made = [];
    if (who === 'trolls') {
      // (round him, a third of the way round from one another)
      for (const [far, deg] of [[1.4, 0], [1.5, 125], [1.5, -120]]) { const m = put('brute', 0, false, at(far, deg)); m.cd = 0; made.push(m); }
    } else if (who === 'red') {
      // (six tiles off along the floor's rows, up and to the left on the screen: clear of the room's pillars)
      const m = put('brute', 2, false, { x: h.x - 6, y: h.y }); m.cd = 0.4; made.push(m);
    } else {
      const m = put('warden', 0, true, at(2.4, 0)); m.cd = 0.3;
      // (his summon sooner than it would come, so that the film is not long: its cooldowns as the fight would have them a few seconds in)
      m.moveCd = [0, 0, 2.5, 5];
      made.push(m);
    }
    const m0 = made[0]; const far = Math.hypot(h.x - m0.x, h.y - m0.y) || 1;
    h.fx = (m0.x - h.x) / far; h.fy = (m0.y - h.y) / far;
    // (still, for the first moment, while the camera settles: the filming begins a second and a half
    // later, and the slowing of the game with it)
    made.forEach((m, k) => {
      m.state = 'recover';
      m.t = 2.1 + 0.7 * k;
    });
    return made.map((m) => m.id);
  }, who);
  console.log('stood', JSON.stringify(ids));
  await page.waitForTimeout(1500);
  const slow = 0.1;
  const step = 1000 / FPS / slow;
  const total = Math.ceil(seconds * FPS);
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  const told = [];
  for (let i = 0; i < total; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`f${String(i).padStart(3, '0')}`);
    const now = await page.evaluate(() => {
      const g = window.__dbg.game();
      return g.monsters.map((m) => `${m.kind}:${m.state}:${m.move ?? -1}`).join(' ') + ` risers ${g.risers.length} zones ${g.zones.map((z) => z.kind).join(',')}`;
    });
    if (told[told.length - 1] !== now) { told.push(now); console.log(`  ${(i / FPS).toFixed(2)}s ${now}`); }
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log('late by', Date.now() - (t0 + (total - 1) * step), 'ms at the end');
}
