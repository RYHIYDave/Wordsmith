// THE TINKERER'S TREE AT WORK, filmed in the game for the owner (game/talents.ts, the gear; a page built with her on), as
// tools/scenarios/tinkerer_film.mjs: her talents set as a hero who has taken them, each path in turn through the game's controls.
//   node tools/playtest.mjs --file dist/trial.html --size 1280x720 --scenario tools/scenarios/tinkerer_tree_film.mjs --out shots/ttfilm/t
//   env: SECONDS=20 (how long), FROM=0, STILLS=1

const FPS = 30;

// (a pack ahead for her vials; two further off for the Golem's cannon)
const PACK = [[3.4, 0.0], [4.1, 1.0], [4.3, -1.0], [3.6, -2.4], [7.5, 2.6], [8.0, -2.0]];
const VIALS = ['bombsaway', 'fortune', 'clustervials', 'tar', 'madmixture', 'thebigone'];
const GOLEM = ['bombsaway', 'fortune', 'lightningrod', 'shrapnel', 'teslacoil', 'markii', 'overdrive', 'growthserum'];

//   [at, what, ...args]: as tinkerer_film.mjs, and
//     take ...          the talents she has
//     free i            the skeleton i free to walk and swing
const PLAN = [
  [0.2, 'take', ...VIALS],
  [0.8, 'tapM', 0],
  [1.7, 'tapM', 1],
  [2.6, 'tapM', 2],
  [3.5, 'tapM', 3],
  [4.4, 'tapM', 0],
  [6.2, 'swipe', 2.5, 3.0],
  [8.0, 'take', ...GOLEM],
  [8.2, 'hold', 3.0, 0.0],
  [9.4, 'hold', 3.0, 0.0],
  [12.4, 'free', 0],
  [12.4, 'free', 1],
  [12.4, 'free', 2],
  [12.6, 'hold', 3.0, 0.0],
  [16.0, 'tapM', 0],
];
const PARTS = [
  [0.0, 'THE TINKERER\'S TREE', 'A first look at her talents at work.'],
  [0.7, 'VIALS: CLUSTER, TAR, MAD MIXTURE', 'Each bursts in three, leaves tar, and carries a brew.'],
  [4.3, 'THE BIG ONE', 'Every fifth vial: three times as wide, knocking all down.'],
  [6.1, 'BOMBS AWAY', 'A second bomb where she lands from her Blast Jump.'],
  [8.0, 'GOLEM: MARK II', 'Two Golems at once.'],
  [9.6, 'TESLA COIL AND SHRAPNEL', 'A coil zapping; its cannon shot bursting.'],
  [12.5, 'LIGHTNING ROD AND OVERDRIVE', 'After a pound, they go after the Golems; her whistle speeds them.'],
  [15.9, 'GROWTH SERUM', 'A vial of hers bursting by a Golem makes it grow.'],
];

export default async function (page, snap) {
  const seconds = Number(process.env.SECONDS || 20);
  const from = Number(process.env.FROM || 0);
  const stills = process.env.STILLS === '1';
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.practice('tinkerer', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
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
        const plan0 = f.plan.shift();
        const [at, what, a, b] = plan0;
        h.mana = h.d.maxMana;
        for (const s of h.skills) if (s) s.cd = 0;
        const mon = (i) => g.monsters.find((q) => q.id === ids[i] && !q.dead) || g.monsters.find((q) => !q.dead);
        if (what === 'tap') { c.fire = true; c.aimX = x0 + a; c.aimY = y0 + b; }
        else if (what === 'tapM') { const m = mon(a); if (m) { c.fire = true; c.aimX = m.x; c.aimY = m.y; } }
        else if (what === 'hold') { c.cast = true; c.castX = x0 + a; c.castY = y0 + b; }
        else if (what === 'swipe') { c.evade = true; c.evadeX = x0 + a; c.evadeY = y0 + b; }
        else if (what === 'tapHim') c.change = true;
        else if (what === 'pact') h.pact = a;
        else if (what === 'take') { h.talents = plan0.slice(2); g.refresh(); }
        else if (what === 'free') { const m = mon(a); if (m) { m.speed = 1.4; m.cd = 0.8; m.state = 'chase'; m.t = 0; } }
        else if (what === 'weak') { const m = mon(a); if (m) { m.life = 1; m.shield = 0; } f.log.push(`weak: ${m ? m.id + ' life ' + m.life + ' dead ' + m.dead : 'none'}`); }
        f.log.push(`${f.t.toFixed(2)} ${what}`);
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
    if (i % 60 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const h = window.__dbg.game().hero; const gm = window.__dbg.game().golem; return `contraptions=${window.__dbg.game().contraptions.length} golem=${gm ? gm.act : '-'} move=${h.move ? h.move.kind : '-'}`; }));
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__wfilm.log)).join('\n'));
}
