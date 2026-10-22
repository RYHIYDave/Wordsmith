// VOLATILE'S FIVE MELDS IN PLAY (Version 23.9, behind VOLT_MELDS and VOLATILE3, both off in the game): Demolition, Powderkeg,
// Shatter, Chain Reaction and Rupture set in the hero's own attack (in front and behind) and played by the game's own rules,
// with the art chat's looks (render/volatile3.ts) called up by the rules' own events. The switches thrown for this page only
// (__dbg.voltMelds). Filmed in the practice room, a picture every thirtieth of a second of the game's time (the game slowed so
// the camera keeps up). For the owner's pictures; not part of tools/regress.sh.
//   node tools/build_to.mjs dist/v239.html
//   WORD=demolition node tools/playtest.mjs --file dist/v239.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/volt239.mjs --out shots/v239/demolition
//   env: WORD = demolition | powderkeg | shatter | chainreaction | rupture
export default async function (page, snap) {
  const word = process.env.WORD || 'demolition';
  const set = await page.evaluate((word) => {
    const d = window.__dbg; d.saving(false); d.voltMelds(true); d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    d.volatile3.clear();
    const said = (window.__said = []);
    const emit = g.emit.bind(g);
    g.emit = (e) => {
      if (e.t === 'volFx' || (e.t === 'burst' && e.meld) || (e.t === 'zone' && e.meld)) said.push(`${g.time.toFixed(2)} ${e.t} ${e.what ?? e.style ?? e.kind} ${e.meld}${e.id !== undefined ? ' #' + e.id : ''}`);
      emit(e);
    };
    const h = g.hero;
    const out = [];
    for (const side of ['front', 'behind']) {
      h.words[word] = (h.words[word] || 0) + 1;
      out.push(g.socket(0, side, word) ?? 'ok');
    }
    return { out, meld: h.skills[0].r.meld, behind: h.skills[0].r.meldBehind, volatile: h.skills[0].r.volatile };
  }, word);
  console.log('set', JSON.stringify(set));
  await page.waitForTimeout(400);
  // who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you); `rank` 1 an elite
  const layouts = {
    demolition: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 2.6, 0.9, 'a'], ['skeleton', 2.7, -1.4, 'b'], ['brute', 1.6, 1.9, 'elite', 1], ['skeleton', 3.4, -0.2, 'c']],
    powderkeg: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 2.4, 0.8, 'a'], ['skeleton', 2.5, -1.2, 'b'], ['skeleton', 0.6, 1.4, 'c'], ['skeleton', 3.2, 0.1, 'd']],
    shatter: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 2.4, 0.8, 'a'], ['skeleton', 2.5, -1.2, 'b'], ['skeleton', 0.6, 1.4, 'c'], ['skeleton', 3.2, 0.1, 'd']],
    chainreaction: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 3.0, 0.9, 'a'], ['skeleton', 2.6, -1.6, 'b'], ['skeleton', 0.4, 1.8, 'c'], ['skeleton', 4.6, 0.4, 'd'], ['skeleton', 3.4, -3.0, 'e']],
    rupture: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 2.4, 0.8, 'a'], ['skeleton', 2.5, -1.2, 'b'], ['skeleton', 0.6, 1.4, 'c'], ['skeleton', 3.2, 0.1, 'd']],
  }[word];
  const ids = await page.evaluate(([layout, word]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = {};
    for (const [kind, ax, dn, role, rank] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, rank ?? 0, false, g.rng);
      g.wakeUp(m);
      // (the chain's others die to its arcs, and go off in turn)
      m.life = m.maxLife = role === 'elite' ? 2000 : role === 'target' ? 150 : word === 'chainreaction' ? 60 : 1e6;
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      if (role) out[role] = m.id;
    }
    const t = g.monsters.find((m) => m.id === out.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return out;
  }, [layouts, word]);
  console.log('stood', JSON.stringify(ids));
  await page.waitForTimeout(Number(process.env.WAIT || 5000));

  // ready the one to be killed as its meld wants it (burning, frozen, poisoned), then strike it down
  const kill = (id) => page.evaluate(([id, word]) => {
    const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
    if (!m) return 'none';
    if (word === 'powderkeg') { m.burnT = 3; m.burnDps = 1; }
    if (word === 'shatter') m.frozenT = 2;
    if (word === 'rupture') { m.poisonT = 4; m.poisonDps = 40; m.poisonN = 1; }
    m.life = 1;
    h.swingT = 0; h.skills[0].cd = 0;
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    g.useBasic(m.x, m.y);
    return 'ok';
  }, [id, word]);
  // struck, not killed (its rune laid where the blow lands)
  const strike = (id, life) => page.evaluate(([id, life]) => {
    const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
    if (!m) return 'none';
    if (life) m.life = life;
    h.swingT = 0; h.skills[0].cd = 0;
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    g.useBasic(m.x, m.y);
    return 'ok';
  }, [id, life]);
  const plan = {
    // the kill's blast and its rune (one at a time, slow); then the elite struck past half its life
    demolition: { frames: 200, at: { 3: () => kill(ids.target), 110: () => strike(ids.elite, 1050) } },
    powderkeg: { frames: 150, at: { 3: () => kill(ids.target) } },
    shatter: { frames: 150, at: { 3: () => kill(ids.target) } },
    // the kill's arcs, and those they kill going off in turn; then a second rune laid by the first, linked
    chainreaction: { frames: 160, at: { 3: () => kill(ids.target), 20: () => strike(ids.c) } },
    rupture: { frames: 150, at: { 3: () => kill(ids.target) } },
  }[word];

  const slow = 0.08;
  const step = 1000 / 30 / slow;
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < plan.frames; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (plan.at[i]) console.log('at', i, await plan.at[i]());
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  const rules = await page.evaluate(() => {
    const g = window.__dbg.game();
    return { monsters: g.monsters.map((m) => ({ id: m.id, kind: m.kind, life: Math.round(m.life), max: m.maxLife, burn: +m.burnT.toFixed(1), frozen: +m.frozenT.toFixed(1), poison: +m.poisonT.toFixed(1), demolished: m.demolished, dead: m.dead })), zones: g.zones.map((z) => ({ kind: z.kind, meld: z.meld, r: +z.r.toFixed(2), t: +z.t.toFixed(2), dur: z.dur })) };
  });
  console.log('rules', JSON.stringify(rules));
  console.log('said', JSON.stringify(await page.evaluate(() => window.__said)));
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
}
