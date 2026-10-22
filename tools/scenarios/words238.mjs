// THE CITY'S WORDS IN PLAY (Version 23.8): Pulling, Splitting, Hexing and Stilling, set in the hero's own attacks (in front
// and behind) and played by the game's own rules, with their looks (render/words3.ts, the art chat's of 8 Oct 2026). Filmed in
// the practice room, a picture every thirtieth of a second of the game's time (the game slowed so the camera keeps up). And
// SPLIT: a monster carrying Splitting killed, splitting in two. For the owner's pictures; not part of tools/regress.sh.
//   node tools/build_to.mjs dist/w238.html
//   WORD=pulling node tools/playtest.mjs --file dist/w238.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words238.mjs --out shots/w238/pulling
//   env: WORD = pulling | splitting | hexing | stilling | split
export default async function (page, snap) {
  const word = process.env.WORD || 'pulling';
  const cls = { pulling: 'warrior', splitting: 'ranger', hexing: 'warrior', stilling: 'warrior', split: 'ranger' }[word];
  const sockets = word === 'split' ? [] : [[0, 'front', word], [0, 'behind', word]];
  const set = await page.evaluate(([cls, sockets]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    d.words3.clear();
    const said = (window.__said = []);
    const emit = g.emit.bind(g);
    g.emit = (e) => {
      if (['pull', 'split', 'shards', 'hexOn', 'hexFlare', 'stillOn', 'heroPulled', 'heroHexed', 'heroStilled'].includes(e.t) || (e.t === 'zone' && ['vortex', 'hex', 'bubble'].includes(e.kind))) said.push(`${g.time.toFixed(2)} ${e.t}${e.kind ? ' ' + e.kind : ''}${e.id !== undefined ? ' #' + e.id : ''}${e.to ? ' to ' + e.to.length : ''}`);
      emit(e);
    };
    const h = g.hero;
    const out = [];
    for (const [i, side, w] of sockets) {
      h.words[w] = (h.words[w] || 0) + 1;
      out.push(g.socket(i, side, w) ?? 'ok');
    }
    return { out, lines: h.skills[0].r.lines };
  }, [cls, sockets]);
  console.log('set', JSON.stringify(set));
  await page.waitForTimeout(400);
  // Who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you).
  const layouts = {
    // one struck, three round it to be dragged in, and the vortex left where it struck
    pulling: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 2.9, 1.5, 'a'], ['skeleton', 3.3, -1.6, 'b'], ['skeleton', 0.6, -2.3, 'c']],
    // one shot, four round it: the copies fly on to the nearest three; the shards fly out where the shot struck
    splitting: [['skeleton', 3.4, -0.3, 'target'], ['skeleton', 4.8, 1.2, 'a'], ['skeleton', 5.1, -1.5, 'b'], ['skeleton', 2.6, 1.8, 'c'], ['skeleton', 6.6, 0.3, 'd']],
    // one cursed, and one let go that comes on over the hex circle
    hexing: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 3.6, 0.8, 'late']],
    // one slowed and let go, and one that walks through the bubble
    stilling: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 3.8, 0.6, 'late']],
    // one carrying Splitting, killed
    split: [['skeleton', 3.6, -0.3, 'target']],
  }[word];
  const ids = await page.evaluate(([layout, word]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = {};
    for (const [kind, ax, dn, role] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = word === 'split' ? 30 : 1e7;
      if (word === 'split') m.words = ['splitting'];
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      if (role) out[role] = m.id;
    }
    const t = g.monsters.find((m) => m.id === out.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return out;
  }, [layouts, word]);
  console.log('stood', JSON.stringify(ids));
  await page.waitForTimeout(Number(process.env.WAIT || 6000));

  const attack = (id) => page.evaluate((id) => {
    const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
    if (!m) return 'none';
    h.swingT = 0;
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    if (m.life <= 30) m.life = 1;
    g.useBasic(m.x, m.y);
    return 'ok';
  }, id);
  const loose = (id) => page.evaluate((id) => {
    const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === id);
    if (m) { m.speed = m.heldSpeed; m.state = 'chase'; m.t = 0; m.cd = 0; }
  }, id);
  // the two a split monster split into, let go
  const looseAll = () => page.evaluate(() => { for (const m of window.__dbg.game().monsters) if (!m.dead && m.split) { m.state = 'chase'; m.cd = 0; } });
  const plan = {
    pulling: { frames: 110, at: { 3: () => attack(ids.target) } },
    splitting: { frames: 100, at: { 3: () => attack(ids.target), 50: () => attack(ids.target) } },
    hexing: { frames: 110, at: { 3: () => attack(ids.target), 30: () => loose(ids.late), 70: () => attack(ids.target) } },
    stilling: { frames: 120, at: { 3: () => attack(ids.target), 8: () => loose(ids.target), 24: () => loose(ids.late) } },
    split: { frames: 100, at: { 3: () => attack(ids.target), 45: () => looseAll() } },
  }[word];

  const slow = 0.08;
  const step = 1000 / 30 / slow;
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < plan.frames; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (plan.at[i]) await plan.at[i]();
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  const said = await page.evaluate(() => {
    const g = window.__dbg.game();
    return { monsters: g.monsters.map((m) => ({ id: m.id, kind: m.kind, life: Math.round(m.life), max: m.maxLife, hexT: m.hexT, stillT: m.stillT, split: m.split, dead: m.dead })), zones: g.zones.map((z) => ({ kind: z.kind, r: z.r, t: +z.t.toFixed(2), dur: z.dur })) };
  });
  console.log('rules', JSON.stringify(said));
  console.log('said', JSON.stringify(await page.evaluate(() => window.__said)));
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
}
