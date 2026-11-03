// THE WARLOCK AT WORK, filmed in the game for the owner (game/warlock.ts, behind WARLOCK: a page built with him on). In the
// practice room, among skeletons that stand and cannot die (one can: the one his curse spreads from), a picture every
// thirtieth of a second of the GAME's time (the game slowed so the camera keeps up, and stopped while each is taken, so a
// frame still being painted costs the film nothing). What he does, by the game's clock (each through the game's own
// controls, as a player's tap, hold, swipe and tap on him would):
//   his Hellfire Bolt twice; the Curse on the pack; one cursed one killed, its curse spreading; the Smoke Step through
//   them; bolts till his pact is full (it is set a little short of full first, to keep the film short), his arm blazing;
//   a tap on him: the change; the demon's three rakes, Damning, its smoke step; its pact run dry (set so): it burns out,
//   and he gets up a man.
// Frames go to <out>_f000.png ..., and <out>_film.json says what each part of the film is (tools/warlock_film.py).
//   node tools/playtest.mjs --file dist/warlock.html --size 1280x720 --scenario tools/scenarios/warlock_film.mjs --out shots/wfilm/w
//   env: SECONDS=26 (how long), FROM=0 (the first second filmed), STILLS=1 (only a picture every half second)

const FPS = 30;

// (where the skeletons stand, in tiles from him: a pack ahead, one to his side)
const PACK = [[3.0, 0.0], [3.7, 1.0], [3.9, -0.9], [4.7, 0.3], [3.2, -2.2]];

// What he does, by the game's clock (seconds from the start of the film), and what the film says of it.
//   [at, what, ...args]
//     tap x y         his tap at that tile (from where he stood at the start)
//     tapM i          his tap at the skeleton i, where it is now (the curse pulls them in)
//     hold x y        his tap and hold
//     swipe x y       his swipe toward that tile
//     tapHim          a tap on him (his pact full: the change)
//     pact n          his pact set to n
//     weak i          the skeleton i made easy to kill
const PLAN = [
  [1.0, 'tapM', 0],
  [2.0, 'tapM', 1],
  [3.4, 'hold', 3.6, 0.0],
  [5.4, 'weak', 0],
  [5.5, 'tapM', 0],
  [7.6, 'swipe', 6.0, 0.0],
  [9.6, 'pact', 25],
  [9.7, 'tapM', 3],
  [10.5, 'tapM', 2],
  [11.3, 'tapM', 1],
  [12.1, 'tapM', 3],
  [12.9, 'tapM', 2],
  [14.6, 'tapHim'],
  [18.6, 'tapM', 3],
  [19.2, 'tapM', 3],
  [19.8, 'tapM', 3],
  [21.2, 'hold', 4.0, 0.0],
  [23.4, 'swipe', 0.5, 0.0],
  [25.2, 'pact', 0.01],
];
// What the film says, from when (seconds), its title and the line under it.
const PARTS = [
  [0.0, 'THE WARLOCK', 'A pact with a demon. It wants out.'],
  [0.9, 'TAP: HELLFIRE BOLT', 'It sets them burning.'],
  [3.3, 'TAP AND HOLD: THE CURSE', 'Chains of smoke. The cursed burn.'],
  [5.4, 'A CURSED ONE DIES', 'Its curse spreads to the ones near it.'],
  [7.5, 'SWIPE: SMOKE STEP', 'He goes through them as smoke, cursing them.'],
  [9.6, 'THE PACT FILLS', 'Every hit fills it. Full, his arm blazes.'],
  [14.4, 'TAP HIM: THE CHANGE', 'The demon tears out of him.'],
  [18.5, 'TAP: CLAW RAKE', 'Every rake curses.'],
  [21.1, 'TAP AND HOLD: DAMNING', 'Every curse and burn paid at once.'],
  [23.3, 'SWIPE: SMOKE STEP', 'The demon’s own.'],
  [25.1, 'THE PACT RUNS DRY', 'It burns out, and he is a man again.'],
];

export default async function (page, snap) {
  const seconds = Number(process.env.SECONDS || 30);
  const from = Number(process.env.FROM || 0);
  const stills = process.env.STILLS === '1';
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.practice('warlock', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(500);
  const ids = await page.evaluate((pack) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    h.fx = 1; h.fy = 0;
    return pack.map(([dx, dy]) => {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9;
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle';
      const far = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / far; m.fy = (h.y - m.y) / far;
      return m.id;
    });
  }, PACK);
  // (the controls a player's hand would give, by the game's clock: the game's own update given them)
  await page.evaluate(([plan, ids]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const x0 = h.x; const y0 = h.y;
    const f = { t: 0, plan: plan.slice(), ids, log: [] };
    window.__wfilm = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      while (f.plan.length && f.plan[0][0] <= f.t) {
        const [at, what, a, b] = f.plan.shift();
        h.mana = h.d.maxMana;
        for (const s of h.skills) if (s) s.cd = 0;
        const mon = (i) => g.monsters.find((q) => q.id === ids[i] && !q.dead) || g.monsters.find((q) => !q.dead);
        if (what === 'tap') { c.fire = true; c.aimX = x0 + a; c.aimY = y0 + b; }
        else if (what === 'tapM') { const m = mon(a); if (m) { c.fire = true; c.aimX = m.x; c.aimY = m.y; } }
        else if (what === 'hold') { c.cast = true; c.castX = x0 + a; c.castY = y0 + b; }
        else if (what === 'swipe') { c.evade = true; c.evadeX = x0 + a; c.evadeY = y0 + b; }
        else if (what === 'tapHim') c.change = true;
        else if (what === 'pact') h.pact = a;
        else if (what === 'weak') { const m = mon(a); if (m) { m.life = 1; m.shield = 0; } f.log.push(`weak: ${m ? m.id + ' life ' + m.life + ' dead ' + m.dead : 'none'}`); }
        f.log.push(`${f.t.toFixed(2)} ${what} form=${h.form} pact=${(h.pact ?? 0).toFixed(1)}`);
      }
      const out = run(dt, c);
      for (const id of ids) { const m = g.monsters.find((q) => q.id === id); if ((!m || m.dead) && !f.gone?.includes(id)) { (f.gone ??= []).push(id); f.log.push(`${f.t.toFixed(2)} skeleton ${id} gone`); } }
      return out;
    };
  }, [PLAN, ids]);
  const where = await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; return window.__dbg.at(h.x, h.y); });
  snap.note('film', { fps: FPS, from, parts: PARTS, hero: where, size: await page.evaluate(() => [innerWidth, innerHeight]) });

  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    if (i / FPS < from) continue;
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(3, '0')}`);
    if (i % 60 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const h = window.__dbg.game().hero; return `form=${h.form} pact=${(h.pact ?? 0).toFixed(1)} move=${h.move ? h.move.kind : '-'}`; }));
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__wfilm.log)).join('\n'));
}
