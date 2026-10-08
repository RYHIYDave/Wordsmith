// THE NEW WORDS AT WORK (render/words3.ts, a mock-up: not in the game), filmed in the practice
// room as the game draws them, a picture every thirtieth of a second of the game's time (the game
// is slowed so that the camera keeps up). The switch is thrown for this page only
// (window.__dbg.words3.switch.on); the hero's real attacks call up the word's look, and the demo
// does by hand what the rules will one day do (drag, stun, curse, stagger).
//   node tools/build_to.mjs dist/w3.html
//   WORD=pulling node tools/playtest.mjs --file dist/w3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/words3.mjs --out shots/w3/pulling
//   env: WORD = pulling | heavy | hexing | frenzied | splitting | precise | stilling | guarding | mystical
//        OFF=1: the same, with the switch left off (what the game shows today)
//        WAIT = milliseconds to let the room settle and the frames be painted first
// A note beside the pictures (<out>_where.json) says where on the screen the hero stands.
export default async function (page, snap) {
  const word = process.env.WORD || 'pulling';
  const off = process.env.OFF === '1';
  const cls = { pulling: 'ranger', heavy: 'warrior', hexing: 'ranger', frenzied: 'warrior', splitting: 'ranger', precise: 'ranger', stilling: 'ranger', guarding: 'warrior', mystical: 'mage' }[word] || 'warrior';
  // (Mystical is a word for spells: the mage, with the wand, whose familiars strike one enemy at a time)
  const weapon = { mystical: 'wand' }[word] || null;
  await page.evaluate(([cls, off, weapon]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero;
    if (weapon && g.weapon() !== weapon) { const i = h.bag.findIndex((it) => it && it.weapon === weapon); if (i >= 0) g.equipFromBag(i); }
    d.words3.switch.on = !off; d.words3.clear(); d.words3.listen();
  }, [cls, off, weapon]);
  await page.waitForTimeout(400);
  // Who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you).
  const layouts = {
    // a target well out in front, and three about it that the hit will haul in
    pulling: [['skeleton', 3.4, -0.6, 'target'], ['skeleton', 4.9, 0.6], ['cultist', 2.4, -2.0], ['skeleton', 4.6, -2.1], ['brute', 1.6, 1.3, 'late']],
    // one in reach of the sword, one beside it, and one that will walk into the cracks
    heavy: [['skeleton', 1.25, -0.25, 'target'], ['cultist', 2.6, 0.9, 'late'], ['skeleton', 2.3, -1.6]],
    // a target out in front, two that will stand in the circle
    hexing: [['cultist', 3.3, -0.5, 'target'], ['skeleton', 4.3, 0.5], ['skeleton', 4.2, -1.5]],
    // one in reach for the frenzy, and one to be killed by it
    frenzied: [['brute', 1.3, -0.3, 'target'], ['skeleton', 1.9, 1.3, 'victim']],
    // a target out in front; the copies fly on past it
    splitting: [['skeleton', 2.6, -0.3, 'target'], ['cultist', 5.4, 0.9]],
    // two out in front: the first is marked, then struck for a certain critical
    precise: [['cultist', 3.2, -0.4, 'target'], ['skeleton', 3.5, 1.3, 'second']],
    // one walking in, struck and slowed; one that walks through the bubble; an archer that shoots through it
    stilling: [['skeleton', 4.6, -1.2, 'target'], ['cultist', 4.2, 2.6, 'late'], ['archer', 5.4, 1.2, 'archer']],
    // a brute that will strike at the hero, and a skeleton that strikes while they stand in the ward
    guarding: [['brute', 1.25, -0.3, 'target'], ['skeleton', -1.0, 1.0, 'late']],
    // a target out in front, and two about it that the splash of a spell on it reaches
    mystical: [['cultist', 3.0, -0.4, 'target'], ['skeleton', 3.9, 0.7], ['skeleton', 3.6, -1.7]],
  }[word];
  const ids = await page.evaluate((layout) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = {};
    for (const [kind, ax, dn, role] of layout) {
      // (across and down the screen, in tiles: one tile across is half a step along x and half against y)
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7;
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      if (role) out[role] = m.id;
      (out.all = out.all || []).push(m.id);
    }
    const t = g.monsters.find((m) => m.id === out.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return out;
  }, layouts);
  console.log('stood', JSON.stringify(ids), off ? 'SWITCH OFF' : 'switch on');
  await page.waitForTimeout(Number(process.env.WAIT || 6000));
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }), scale: await page.evaluate(() => window.__dbg.screen.scale ?? null) });

  /** The hero attacks the target (or, for a held moment, does nothing). */
  const attack = (id) => page.evaluate((id) => {
    const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
    if (!m) return 'none';
    h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
    const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
    g.useBasic(m.x, m.y);
    return 'ok';
  }, id);
  const act = (fn, arg) => page.evaluate(fn, arg);
  const plan = {
    pulling: {
      frames: 84,
      at: {
        3: () => { page.evaluate(() => { window.__dbg.words3.state.front = ['pulling']; }); return attack(ids.target); },
        // the shot has struck and they have been hauled in: what it leaves, a vortex that keeps pulling
        26: () => act((ids) => { const d = window.__dbg; const g = d.game(); const t = g.monsters.find((m) => m.id === ids.target); d.words3.vortex(t.x, t.y, 1.9, 3.4); }, ids),
        // and one that strays near it is drawn in
        32: () => act((ids) => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === ids.late); const t = g.monsters.find((q) => q.id === ids.target); if (m && t) { const d = Math.hypot(m.x - t.x, m.y - t.y) || 1; m.anim = 'walk'; m.walkTo = { x: t.x + (m.x - t.x) / d * 1.3, y: t.y + (m.y - t.y) / d * 1.3 }; } }, ids),
      },
    },
    heavy: {
      frames: 92,
      at: {
        3: () => { page.evaluate(() => { window.__dbg.words3.state.front = ['heavy']; }); return attack(ids.target); },
        // what it leaves: cracked ground where the blow fell
        34: () => act((ids) => { const d = window.__dbg; const g = d.game(); const h = g.hero; const t = g.monsters.find((m) => m.id === ids.target); d.words3.crackedGround((t.x + h.x) / 2 + (t.x - h.x) * 0.25, (t.y + h.y) / 2 + (t.y - h.y) * 0.25, 1.5, 4); }, ids),
        // and one walks into it, and is staggered
        44: () => act((ids) => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === ids.late); const h = g.hero; if (m) { m.anim = 'walk'; m.walkTo = { x: h.x + (m.x - h.x) * 0.35, y: h.y + (m.y - h.y) * 0.35 }; } }, ids),
      },
    },
    hexing: {
      frames: 96,
      at: {
        3: () => { page.evaluate(() => { window.__dbg.words3.state.front = ['hexing']; }); return attack(ids.target); },
        24: () => attack(ids.target),
        40: () => attack(ids.target),
        // what it leaves: a hex circle; the two that stand in it are drained grey
        58: () => act((ids) => { const d = window.__dbg; const g = d.game(); const t = g.monsters.find((m) => m.id === ids.target); const all = g.monsters.filter((m) => ids.all.includes(m.id)); const cx = all.reduce((s, m) => s + m.x, 0) / all.length; const cy = all.reduce((s, m) => s + m.y, 0) / all.length; d.words3.hexCircle((cx + t.x) / 2, (cy + t.y) / 2, 1.7, 4.5); }, ids),
      },
    },
    frenzied: {
      frames: 104,
      at: {
        3: () => { page.evaluate(() => { const s = window.__dbg.words3.state; s.front = ['frenzied']; s.behind = ['frenzied']; }); return attack(ids.target); },
        15: () => attack(ids.target),
        27: () => attack(ids.target),
        39: () => attack(ids.target),
        51: () => attack(ids.target),
        // a kill keeps the frenzy going
        72: () => act((ids) => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === ids.victim); if (m) g.kill(m); }, ids),
      },
    },
    splitting: {
      frames: 72,
      at: {
        3: () => { page.evaluate(() => { const s = window.__dbg.words3.state; s.front = ['splitting']; s.behind = ['splitting']; }); return attack(ids.target); },
        40: () => attack(ids.target),
      },
    },
    precise: {
      frames: 92,
      at: {
        3: () => { page.evaluate(() => { const s = window.__dbg.words3.state; s.front = ['precise']; s.behind = ['precise']; }); return attack(ids.target); },
        // the marked one again: the sight snaps shut, a certain critical
        34: () => attack(ids.target),
        // and the other, marked in its turn
        62: () => attack(ids.second),
      },
    },
    stilling: {
      frames: 110,
      at: {
        0: () => act((ids) => { const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === ids.target); if (m) { m.anim = 'walk'; m.walkTo = { x: h.x + (m.x - h.x) * 0.25, y: h.y + (m.y - h.y) * 0.25 }; } }, ids),
        6: () => { page.evaluate(() => { window.__dbg.words3.state.front = ['stilling']; }); return attack(ids.target); },
        // what it leaves: a bubble, where enemies and their shots crawl
        36: () => act((ids) => { const d = window.__dbg; const g = d.game(); const h = g.hero; const a = g.monsters.find((q) => q.id === ids.archer); if (!a) return; d.words3.bubble(h.x + (a.x - h.x) * 0.5, h.y + (a.y - h.y) * 0.5, 1.5, 4); }, ids),
        40: () => act((ids) => { const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === ids.late); if (m) { m.anim = 'walk'; m.walkTo = { x: h.x + (m.x - h.x) * 0.1 + (h.y - m.y) * 0.1, y: h.y + (m.y - h.y) * 0.1 }; } }, ids),
        // the archer shoots through it
        48: () => act((ids) => { const g = window.__dbg.game(); const a = g.monsters.find((q) => q.id === ids.archer); if (a) { a.cd = 0; a.state = 'idle'; a.t = 0; } }, ids),
      },
    },
    guarding: {
      frames: 104,
      at: {
        3: () => { page.evaluate(() => { window.__dbg.words3.state.front = ['guarding']; }); return attack(ids.target); },
        // the brute strikes back at the shielded hero
        6: () => act((ids) => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === ids.target); if (m) { m.cd = 0; m.state = 'idle'; m.t = 0; } }, ids),
        // what it leaves: a ward circle where the hero stands
        52: () => act(() => { const d = window.__dbg; const h = d.game().hero; d.words3.ward(h.x, h.y, 1.3, 4); }),
        // and a blow struck while they stand in it
        60: () => act((ids) => { const g = window.__dbg.game(); for (const id of [ids.late, ids.target]) { const m = g.monsters.find((q) => q.id === id); if (m) { m.cd = 0; m.state = 'idle'; m.t = 0; } } }, ids),
      },
    },
    mystical: {
      frames: 150,
      at: {
        // the familiars' shots each strike one enemy: a bigger hit, its splash to the two beside it,
        // and (behind) a star to the moon at her shoulder for each, until it is full
        3: () => { page.evaluate(() => { const s = window.__dbg.words3.state; s.front = ['mystical']; s.behind = ['mystical']; s.single = true; }); return attack(ids.target); },
        30: () => attack(ids.target),
      },
    },
  }[word];

  const slow = 0.08;
  const step = 1000 / 30 / slow;
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < plan.frames; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (plan.at[i]) await plan.at[i]();
    // (walkers walk toward where they were sent, slowly, whatever their own minds say)
    await page.evaluate(() => {
      const g = window.__dbg.game();
      for (const m of g.monsters) {
        if (!m.walkTo || m.dead) continue;
        const dx = m.walkTo.x - m.x; const dy = m.walkTo.y - m.y; const d = Math.hypot(dx, dy);
        if (d < 0.05) { m.walkTo = null; m.anim = 'idle'; continue; }
        const s = Math.min(d, 0.035 * window.__dbg.words3.pace(m.id)); m.x += (dx / d) * s; m.y += (dy / d) * s; m.fx = dx / d; m.fy = dy / d;
      }
    });
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
}
