// THE FOUR NEW WORDS IN PLAY (Version 19.3): Heavy, Precise, Frenzied and Guarding, set in the
// hero's own attacks and played by the game's own rules, with their looks (render/words3.ts,
// switched on for this page only). Filmed in the practice room, a picture every thirtieth of a
// second of the game's time (the game is slowed so that the camera keeps up). For the owner's
// pictures; not part of tools/regress.sh.
//   node tools/build_to.mjs dist/w193.html
//   WORD=heavy node tools/playtest.mjs --file dist/w193.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words193.mjs --out shots/w193f/heavy
//   env: WORD = heavy | precise | frenzied | guarding;  OFF=1: the looks' switch left off
export default async function (page, snap) {
  const word = process.env.WORD || 'heavy';
  const off = process.env.OFF === '1';
  const cls = { heavy: 'warrior', precise: 'ranger', frenzied: 'warrior', guarding: 'warrior' }[word];
  // the words set, as [skill, side, word]
  const sockets = {
    heavy: [[0, 'front', 'heavy'], [0, 'behind', 'heavy']],
    precise: [[0, 'front', 'precise'], [0, 'behind', 'precise']],
    frenzied: [[0, 'front', 'frenzied'], [0, 'behind', 'frenzied']],
    guarding: [[0, 'front', 'guarding'], [0, 'behind', 'guarding']],
  }[word];
  const set = await page.evaluate(([cls, off, sockets]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    d.words3.switch.on = !off; d.words3.clear();
    // (what the rules say happened, kept with the game's clock for the record beside the pictures)
    const said = (window.__said = []);
    const emit = g.emit.bind(g);
    g.emit = (e) => {
      if (['stun', 'stagger', 'heavy', 'markOn', 'markSpent', 'frenzy', 'frenzyFed', 'shield', 'guarded', 'blocked'].includes(e.t) || (e.t === 'zone' && (e.kind === 'cracks' || e.kind === 'ward'))) said.push(`${g.time.toFixed(2)} ${e.t}${e.kind ? ' ' + e.kind : ''}${e.id !== undefined ? ' #' + e.id : ''}${e.n !== undefined ? ' n' + e.n : ''}`);
      emit(e);
    };
    const h = g.hero;
    const out = [];
    for (const [i, side, w] of sockets) {
      h.words[w] = (h.words[w] || 0) + 1;
      out.push(g.socket(i, side, w) ?? 'ok');
    }
    return out;
  }, [cls, off, sockets]);
  console.log('set', JSON.stringify(set), off ? 'SWITCH OFF' : 'switch on');
  await page.waitForTimeout(400);
  // Who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you).
  const layouts = {
    // one in reach of the sword; one behind it that walks in over the cracked ground
    heavy: [['skeleton', 1.25, -0.25, 'target'], ['skeleton', 3.7, -0.75, 'late']],
    // two out in front: the first is marked, then struck for a certain critical
    precise: [['cultist', 3.2, -0.4, 'target'], ['skeleton', 3.5, 1.3, 'second']],
    // one in reach for the frenzy, and one weak one to be killed by it
    frenzied: [['brute', 1.3, -0.3, 'target'], ['skeleton', -1.05, 0.85, 'victim']],
    // a brute that strikes at the shielded hero, and a skeleton that strikes in the ward
    guarding: [['brute', 1.25, -0.3, 'target'], ['skeleton', -1.0, 1.0, 'late']],
  }[word];
  const ids = await page.evaluate((layout) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = {};
    for (const [kind, ax, dn, role] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = role === 'victim' ? 1 : 1e7;
      // (held where they stand, facing the hero, until the film lets them go)
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      if (role) out[role] = m.id;
      (out.all = out.all || []).push(m.id);
    }
    const t = g.monsters.find((m) => m.id === out.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return out;
  }, layouts);
  console.log('stood', JSON.stringify(ids));
  await page.waitForTimeout(Number(process.env.WAIT || 6000));
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }) });

  /** The hero's quick attack at a monster, by the game's own rules. */
  const attack = (id) => page.evaluate((id) => {
    const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
    if (!m) return 'none';
    h.swingT = 0;
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    g.useBasic(m.x, m.y);
    return 'ok';
  }, id);
  /** Monster `id` is let go: it walks and strikes as its own mind says. */
  const loose = (id) => page.evaluate((id) => {
    const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === id);
    if (m) { m.speed = m.heldSpeed; m.state = 'chase'; m.t = 0; m.cd = 0; }
  }, id);
  const plan = {
    heavy: { frames: 96, at: { 3: () => attack(ids.target), 30: () => loose(ids.late) } },
    precise: { frames: 92, at: { 3: () => attack(ids.target), 34: () => attack(ids.target), 62: () => attack(ids.second) } },
    frenzied: { frames: 104, at: { 3: () => attack(ids.target), 15: () => attack(ids.target), 27: () => attack(ids.target), 39: () => attack(ids.target), 51: () => attack(ids.target), 70: () => attack(ids.victim) } },
    guarding: { frames: 104, at: { 3: () => attack(ids.target), 6: () => loose(ids.target), 40: () => attack(ids.target), 58: () => loose(ids.late) } },
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
  // what the rules did, for the record beside the pictures
  const said = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    return { frenzy: h.frenzy, shield: h.shield, life: Math.round(h.life), monsters: g.monsters.map((m) => ({ id: m.id, kind: m.kind, stunT: +m.stunT.toFixed(2), staggerT: +m.staggerT.toFixed(2), markT: +m.markT.toFixed(2), dead: m.dead })), zones: g.zones.map((z) => ({ kind: z.kind, r: z.r, t: +z.t.toFixed(2), dur: z.dur })) };
  });
  console.log('rules', JSON.stringify(said));
  console.log('said', JSON.stringify(await page.evaluate(() => window.__said)));
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
}
