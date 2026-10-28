// THE BRAWLER AT WORK, filmed in the game for the owner (game/brawler.ts, behind BRAWLER: a page built with him on). In the
// practice room, among skeletons that stand and cannot die, a picture every thirtieth of a second of the GAME's time (as
// tools/scenarios/warlock_film.mjs). What he does, through the game's own controls: tap, tap, tap; hold, hold, hold (the
// haymaker firing the one in front down the line); a mix, tap, hold, tap; his slip and counter.
// Frames go to <out>_f000.png ..., and <out>_film.json says what each part of the film is (tools/warlock_film.py).
//   node tools/playtest.mjs --file dist/trial.html --size 1280x720 --scenario tools/scenarios/brawler_film.mjs --out shots/bfilm/b
//   env: SECONDS=13 (how long), FROM=0, STILLS=1

const FPS = 30;

// (where the skeletons stand, in tiles from him: one in front, a line behind it for the haymaker to bowl, two at his
// sides for the body blow, one where his slip comes up)
const PACK = [[1.3, 0.0], [2.7, 0.15], [4.0, -0.15], [5.3, 0.1], [0.4, 1.5], [0.4, -1.5], [-5.9, 0.2]];

const PLAN = [
  [0.8, 'tapM', 0],
  [1.2, 'tapM', 0],
  [1.65, 'tapM', 0],
  [3.5, 'holdM', 0],
  [4.3, 'holdM', 0],
  [5.1, 'holdM', 0],
  [7.0, 'place'],
  [7.6, 'tapM', 0],
  [8.2, 'holdM', 0],
  [9.0, 'tapM', 0],
  [10.6, 'swipe', -5.0, 0.0],
];
const PARTS = [
  [0.0, 'THE BRAWLER', 'Bare knuckles. Bad attitude.'],
  [0.7, 'TAP, TAP, TAP', 'Jab, hook, uppercut. Fast, on one. The uppercut stuns.'],
  [3.4, 'HOLD, HOLD, HOLD', 'Cross, body blow, haymaker. Every blow knocks back.'],
  [5.5, 'THE HAYMAKER', 'It fires the one in front down the line.'],
  [7.4, 'ANY MIX: TAP, HOLD, TAP', 'Jab, body blow, uppercut. Eight combos in all.'],
  [10.5, 'SWIPE: SLIP AND COUNTER', 'He weaves to a spot, untouchable, and comes up swinging.'],
];

export default async function (page, snap) {
  const seconds = Number(process.env.SECONDS || 13);
  const from = Number(process.env.FROM || 0);
  const stills = process.env.STILLS === '1';
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.practice('brawler', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
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
  await page.evaluate(([plan, ids, pack]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const x0 = h.x; const y0 = h.y;
    const f = { t: 0, plan: plan.slice(), ids, log: [], pack };
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
        else if (what === 'holdM') { const m = mon(a); if (m) { c.cast = true; c.castX = m.x; c.castY = m.y; } }
        else if (what === 'place') { f.ids.forEach((id, k) => { const m = g.monsters.find((q) => q.id === id); if (m) { m.x = x0 + f.pack[k][0]; m.y = y0 + f.pack[k][1]; m.thrown = undefined; m.stunT = 0; m.staggerT = 0; } }); g.cannonballs.length = 0; h.x = x0; h.y = y0; }
        else if (what === 'hold') { c.cast = true; c.castX = x0 + a; c.castY = y0 + b; }
        else if (what === 'swipe') { c.evade = true; c.evadeX = x0 + a; c.evadeY = y0 + b; }
        else if (what === 'tapHim') c.change = true;
        else if (what === 'pact') h.pact = a;
        else if (what === 'weak') { const m = mon(a); if (m) { m.life = 1; m.shield = 0; } f.log.push(`weak: ${m ? m.id + ' life ' + m.life + ' dead ' + m.dead : 'none'}`); }
        f.log.push(`${f.t.toFixed(2)} ${what}`);
      }
      const out = run(dt, c);
      for (const id of ids) { const m = g.monsters.find((q) => q.id === id); if ((!m || m.dead) && !f.gone?.includes(id)) { (f.gone ??= []).push(id); f.log.push(`${f.t.toFixed(2)} skeleton ${id} gone`); } }
      return out;
    };
  }, [PLAN, ids, PACK]);
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
    if (i % 60 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const h = window.__dbg.game().hero; return `punch=${h.punch ? h.punch.run + ' ' + h.punch.name : '-'} move=${h.move ? h.move.kind : '-'}`; }));
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__wfilm.log)).join('\n'));
}
