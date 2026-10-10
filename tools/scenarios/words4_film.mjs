// THE WORDS STILL TO COME, THE FIRST OF THEM, AT WORK (game/defs.ts WORDS4, off in the game; switched on
// for this page only): Mystical, and Volatile's hidden bomb, set in the hero's own attacks and played by
// the game's own rules, with their looks. Filmed in the practice room, a picture every thirtieth of a
// second of the game's time (the game is slowed so that the camera keeps up). For the owner's pictures;
// not part of tools/regress.sh (tools/scenarios/words4.mjs is).
//   node tools/build_to.mjs dist/w4.html
//   WORD=mystical node tools/playtest.mjs --file dist/w4.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words4_film.mjs --out shots/w4f/mystical
//   python3 tools/words3_films.py shots/w4f previews/words4 mystical volatile
//   env: WORD = mystical (the mage's wand: the Familiar with Mystical in front and behind) | volatile
//   (the warrior: Volatile in front of Strike) | wave (the mage's staff: the Wave with Mystical in front
//   and behind, through a line of skeletons)
export default async function (page, snap) {
  const word = process.env.WORD || 'mystical';
  const cls = { mystical: 'mage', wave: 'mage', volatile: 'warrior' }[word];
  const weapon = { mystical: 'wand', wave: 'staff', volatile: null }[word];
  const sockets = {
    mystical: [[0, 'front', 'mystical'], [0, 'behind', 'mystical']],
    wave: [[0, 'front', 'mystical'], [0, 'behind', 'mystical']],
    volatile: [[0, 'front', 'volatile']],
  }[word];
  const was = await page.evaluate(() => window.__dbg.words4());
  const set = await page.evaluate(([cls, weapon, sockets]) => {
    const d = window.__dbg; d.saving(false); d.words4(true); d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.bombs.length = 0;
    d.words3.clear();
    const h = g.hero;
    if (weapon && g.weapon() !== weapon) g.equipFromBag(h.bag.findIndex((it) => it && it.weapon === weapon));
    // (what the rules say happened, kept with the game's clock for the record beside the pictures)
    const said = (window.__said = []);
    const emit = g.emit.bind(g);
    g.emit = (e) => {
      if (['mysticSplash', 'bomb', 'bombBurst'].includes(e.t) || (e.t === 'buff' && e.kind === 'arcana') || (e.t === 'hit' && !e.onHero && e.words && e.words.includes('mystical'))) said.push(`${g.time.toFixed(2)} ${e.t}${e.stacks !== undefined ? ' x' + e.stacks : ''}${e.to ? ' to ' + e.to.length : ''}`);
      emit(e);
    };
    const out = [];
    for (const [i, side, w] of sockets) {
      h.words[w] = (h.words[w] || 0) + 1;
      out.push(g.socket(i, side, w) ?? 'ok');
    }
    return out;
  }, [cls, weapon, sockets]);
  console.log('set', JSON.stringify(set));
  await page.waitForTimeout(400);
  // Who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you).
  const layouts = {
    // a cultist her familiar shoots at, and a skeleton either side of it for the splash
    mystical: [['cultist', 3.6, 0, 'target'], ['skeleton', 2.75, 0.55, 'near'], ['skeleton', 4.45, -0.55, 'beyond']],
    // three skeletons in a line before her, for the Wave to pass through
    wave: [['skeleton', 2.4, 0, 'target'], ['skeleton', 3.3, 0.3, 'second'], ['skeleton', 4.2, -0.3, 'third']],
    // one in reach of the sword, with two more close by for the burst; one further off, left alone
    volatile: [['skeleton', 1.3, -0.2, 'target'], ['skeleton', 2.2, 0.75, 'near1'], ['skeleton', 2.35, -1.05, 'near2'], ['skeleton', 4.6, 0.4, 'far']],
  }[word];
  const ids = await page.evaluate((layout) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = {};
    for (const [kind, ax, dn, role] of layout) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.shield = 0;
      // (held where they stand, facing the hero)
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      if (role) out[role] = m.id;
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
    h.swingT = 0; h.mana = h.d.maxMana;
    for (const s of h.skills) s.cd = 0;
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    g.useBasic(m.x, m.y);
    return 'ok';
  }, id);
  const plan = {
    mystical: { frames: 150, at: { 3: () => attack(ids.target), 75: () => attack(ids.target) } },
    wave: { frames: 140, at: { 3: () => attack(ids.target), 28: () => attack(ids.target), 53: () => attack(ids.target), 78: () => attack(ids.target), 103: () => attack(ids.target) } },
    volatile: { frames: 84, at: { 3: () => attack(ids.target) } },
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
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  // what the rules did, for the record beside the pictures
  const rules = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    return { arcana: h.arcana, bombs: g.bombs.length, monsters: g.monsters.map((m) => ({ id: m.id, kind: m.kind, hurt: Math.round(m.maxLife - m.life) })) };
  });
  console.log('rules', JSON.stringify(rules));
  console.log('said', JSON.stringify(await page.evaluate(() => window.__said)));
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
  await page.evaluate((was) => window.__dbg.words4(was), was);
}
