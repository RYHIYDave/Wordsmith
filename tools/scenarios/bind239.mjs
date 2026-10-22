// BINDING IN PLAY (the city's fifth word, his pick of 21 Oct 2026): set in the hero's own attack and played by the game's own
// rules (game/defs.ts BIND), with the art chat's look (render/binding3.ts, switched on for this page only). Filmed in the
// practice room, a picture every thirtieth of a second of the game's time (the game slowed so the camera keeps up). For the
// owner's pictures; not part of tools/regress.sh.
//   node tools/build_to.mjs dist/b239.html
//   PART=front node tools/playtest.mjs --file dist/b239.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/bind239.mjs --out shots/b239/front
//   env: PART = front (what it hits held; one free beside it) | snare (the snare left where it struck; the next to cross it held)
//        | root (a monster carrying Binding roots the hero)
export default async function (page, snap) {
  const part = process.env.PART || 'front';
  const sockets = { front: [[0, 'front', 'binding']], snare: [[0, 'behind', 'binding']], root: [] }[part];
  const set = await page.evaluate((sockets) => {
    const d = window.__dbg; d.saving(false); d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.binding3.switch.on = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    d.binding3.clear();
    const said = (window.__said = []);
    const emit = g.emit.bind(g);
    g.emit = (e) => {
      if (['bind', 'snareSprung', 'rooted', 'unbind'].includes(e.t) || (e.t === 'zone' && e.kind === 'snare')) said.push(`${g.time.toFixed(2)} ${e.t}${e.id !== undefined ? ' #' + e.id : ''}${e.secs ? ' ' + e.secs.toFixed(2) + ' s' : ''}`);
      emit(e);
    };
    const h = g.hero;
    const out = [];
    for (const [i, side, w] of sockets) {
      h.words[w] = (h.words[w] || 0) + 1;
      out.push(g.socket(i, side, w) ?? 'ok');
    }
    return { out, bind: h.skills[0].r.bind, snare: h.skills[0].r.snare };
  }, sockets);
  console.log('set', JSON.stringify(set));
  await page.waitForTimeout(400);
  // who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you)
  const layouts = {
    front: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 1.6, 1.6, 'free']],
    snare: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 4.2, -0.4, 'late']],
    root: [['skeleton', 1.15, -0.2, 'target']],
  }[part];
  const ids = await page.evaluate(([layout, part]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = {};
    for (const [kind, ax, dn, role] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e6;
      if (part === 'root') m.words = ['binding'];
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      if (role) out[role] = m.id;
    }
    const t = g.monsters.find((m) => m.id === out.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return out;
  }, [layouts, part]);
  console.log('stood', JSON.stringify(ids));
  await page.waitForTimeout(Number(process.env.WAIT || 5000));

  const attack = (id) => page.evaluate((id) => {
    const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
    if (!m) return 'none';
    h.swingT = 0;
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    g.useBasic(m.x, m.y);
    return 'ok';
  }, id);
  // let one go: it comes on at the hero (a held one strains where it stands); `blows` it strikes too
  const loose = (id, blows = false) => page.evaluate(([id, blows]) => {
    const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === id);
    if (m) { m.speed = m.heldSpeed; m.state = 'chase'; m.t = 0; m.cd = blows ? 0 : 1e9; }
  }, [id, blows]);
  // the hero steps back from it, so that the held one would have to walk to reach him
  const back = (tiles) => page.evaluate((tiles) => {
    const g = window.__dbg.game(); const h = g.hero; h.x -= tiles * 0.7; h.y += tiles * 0.7;
  }, tiles);
  const plan = {
    front: { frames: 110, at: { 3: () => attack(ids.target), 12: () => back(1.6), 14: () => loose(ids.target), 16: () => loose(ids.free) } },
    snare: { frames: 120, at: { 3: () => attack(ids.target), 20: () => loose(ids.late) } },
    root: { frames: 100, at: { 3: () => loose(ids.target, true) } },
  }[part];

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
  const rules = await page.evaluate(() => {
    const g = window.__dbg.game();
    return { hero: { rootT: g.hero.rootT }, monsters: g.monsters.map((m) => ({ id: m.id, x: +m.x.toFixed(2), y: +m.y.toFixed(2), bindT: m.bindT, dead: m.dead })), zones: g.zones.map((z) => ({ kind: z.kind, t: +z.t.toFixed(2), dur: z.dur })) };
  });
  console.log('rules', JSON.stringify(rules));
  console.log('said', JSON.stringify(await page.evaluate(() => window.__said)));
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
}
