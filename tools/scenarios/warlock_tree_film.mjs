// THE WARLOCK'S TREE AT WORK, filmed in the game for the owner (game/talents.ts, the claw; game/game.ts "HIS TREE"; a page built
// with him on), as tools/scenarios/warlock_film.mjs: among skeletons that stand and cannot die (but those made weak), each
// talent in turn through the game's own controls, the talents set as a hero who has taken them.
//   node tools/playtest.mjs --file dist/trial.html --size 1280x720 --scenario tools/scenarios/warlock_tree_film.mjs --out shots/wtfilm/w
//   env: SECONDS=30 (how long), FROM=0 (the first second filmed), STILLS=1 (only a picture every half second)

const FPS = 30;

// (where the skeletons stand, in tiles from him: a pack ahead in a line for the wave, two more off to the side)
const PACK = [[2.2, 0.0], [3.6, 0.6], [4.0, -0.8], [5.4, 0.2], [3.0, -2.2], [6.6, -0.4]];
const MAN = ['branded', 'hexchain', 'withering', 'pyre', 'blazingarm', 'souldebt', 'hunger', 'terribleroar', 'feast', 'bloodlust', 'hellwave', 'damnedsouls', 'lastrites'];
const BOUND = ['bounddemon', 'terribleroar', 'branded', 'hunger', 'bloodlust', 'hellwave'];

//   [at, what, ...args]: as warlock_film.mjs, and
//     take ...          the talents he has
//     cursed i          the skeleton i cursed (for a long while)
//     speed i v         the skeleton i free to walk, at v tiles a second
//     spawn dx dy       another skeleton there (it takes the next index)
const PLAN = [
  [0.2, 'take', ...MAN],
  [1.0, 'tapM', 0],
  [2.4, 'hold', 3.6, 0.0],
  [3.8, 'tapM', 1],
  [5.6, 'weak', 2],
  [5.7, 'tapM', 2],
  [7.4, 'pact', 29.4],
  [7.5, 'tapM', 3],
  [8.8, 'tapM', 0],
  [10.0, 'speed', 0, 1.6],
  [10.0, 'speed', 4, 1.6],
  [10.4, 'tapHim'],
  [14.0, 'tapM', 0],
  [14.7, 'tapM', 0],
  [15.4, 'tapM', 0],
  [16.8, 'weak', 1],
  [16.9, 'tapM', 1],
  [18.8, 'pact', 0.01],
  [21.0, 'take', ...BOUND],
  [21.0, 'spawn', 2.6, 1.2],
  [21.0, 'spawn', 3.4, -0.6],
  [21.2, 'pact', 30],
  [21.6, 'tapHim'],
  [23.4, 'tapM', 3],
  [24.4, 'tapM', 5],
  [25.4, 'tapM', 3],
  [27.6, 'pact', 0.4],
];
const PARTS = [
  [0.0, 'THE WARLOCK\'S TREE', 'A first look at his talents at work.'],
  [0.9, 'BRANDED', 'Every Hellfire Bolt curses what it hits.'],
  [2.3, 'THE CURSE', 'All of them cursed, for what comes next.'],
  [3.7, 'HEX CHAIN', 'His bolt leaps on from one cursed to the next.'],
  [5.5, 'PYRE AND SOUL DEBT', 'A cursed one dies: it bursts, and fills his pact.'],
  [7.4, 'BLAZING ARM', 'His pact full: every bolt bursts, cursing all near.'],
  [10.3, 'TERRIBLE ROAR', 'The change: all it throws back cursed, running from him.'],
  [13.9, 'HELLWAVE', 'Every third rake throws a wave of hellfire on ahead.'],
  [16.7, 'DAMNED SOULS', 'A kill rises as a burning soul, into the next.'],
  [18.7, 'LAST RITES', 'As the demon burns out, Damning goes off by itself.'],
  [21.0, 'BOUND DEMON', 'He stays a man. The demon fights at his side.'],
  [27.5, 'ITS PACT RUN DRY', 'It burns out.'],
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
        else if (what === 'cursed') { const m = mon(a); if (m) m.curseT = 60; }
        else if (what === 'speed') { const m = mon(a); if (m) m.speed = b; }
        else if (what === 'spawn') { const m = g.spawn('skeleton', x0 + a, y0 + b, 1, 0, false, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9; m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; f.ids.push(m.id); }
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
