// BIG AND WILD (art/moves3.ts WILD, render/wild.ts; a mock-up: not in the game): one of the heroes'
// skills filmed in the practice room as the game draws it, a picture every thirtieth of a second of
// the game's time (the game is slowed so that the camera keeps up). The hero stands before monsters
// that cannot die and (but for the trap's) cannot move, and uses the skill on them.
//   node tools/build_to.mjs dist/wild.html
//   SKILL=whirlwind|leap|volley|trap|orb|warp node tools/playtest.mjs --file dist/wild.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/wild_skill.mjs --out shots/wild/<skill>_on
//   env: OFF=1: the same with WILD off (as the game has it; the mage in her stances, as he last saw her)
//        WAIT = milliseconds to let the room settle and the frames be painted first
// A note beside the pictures (<out>_where.json) says where on the screen the hero stands.

/** Each skill: who uses it, with what, who stands where (tiles across and down the screen from the hero: +across right, +down toward you), and what is done at which frame. */
const PLANS = {
  whirlwind: {
    cls: 'warrior', weapon: 'greatsword', frames: 84,
    layout: [['skeleton', 1.5, -0.2, 'target'], ['skeleton', -1.3, 0.5], ['skeleton', 0.3, 1.4], ['cultist', -0.4, -1.5], ['skeleton', 1.0, 1.1]],
    at: { 8: ['slow', 1.2, 0, 1.55] },
  },
  leap: {
    cls: 'warrior', weapon: 'sword', frames: 84,
    layout: [['skeleton', 4.2, -0.5, 'target'], ['skeleton', 4.9, 0.6], ['skeleton', 3.6, 0.7], ['cultist', 5.2, -0.6]],
    at: { 8: ['evade', 3.9, 0.1], 50: ['evade', -3.9, -0.1] },
  },
  volley: {
    cls: 'ranger', weapon: 'bow', frames: 110,
    layout: [['skeleton', 4.6, -0.4, 'target'], ['skeleton', 5.4, 0.5], ['skeleton', 4.1, 0.6], ['cultist', 5.6, -0.7], ['skeleton', 4.8, 1.3]],
    at: { 8: ['slow', 4.8, 0.2] },
  },
  trap: {
    cls: 'ranger', weapon: 'bow', frames: 96, moving: true,
    layout: [['skeleton', 2.0, 0.2, 'target']],
    at: { 8: ['evade', -3.0, -0.1] },
  },
  orb: {
    cls: 'mage', weapon: 'staff', frames: 110, stances: true,
    layout: [['skeleton', 4.0, -0.4, 'target'], ['skeleton', 4.7, 0.5], ['skeleton', 3.5, 0.7], ['cultist', 4.9, -0.8], ['brute', 5.6, 0.2]],
    at: { 8: ['slow', 4.4, 0.1] },
  },
  warp: {
    cls: 'mage', weapon: 'staff', frames: 80, stances: true,
    layout: [['skeleton', 4.2, -0.5, 'target'], ['skeleton', 4.9, 0.6], ['skeleton', 3.6, 0.7], ['cultist', 5.2, -0.6]],
    at: { 8: ['evade', 4.2, 0.1], 46: ['evade', -4.2, -0.1] },
  },
};

export default async function (page, snap) {
  const off = process.env.OFF === '1';
  const what = process.env.SKILL || 'whirlwind';
  const plan = PLANS[what];
  if (!plan) throw new Error('no such skill to film: ' + what);
  const weapon = await page.evaluate(([cls, weapon, off, stances]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    if (stances) d.mageStances(true);
    d.wild(!off);
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero;
    if (g.weapon() !== weapon) { const i = h.bag.findIndex((it) => it && it.weapon === weapon); if (i >= 0) g.equipFromBag(i); }
    return g.weapon();
  }, [plan.cls, plan.weapon, off, !!plan.stances]);
  await page.waitForTimeout(400);
  const ids = await page.evaluate(([layout, moving]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = {};
    for (const [kind, ax, dn, role] of layout) {
      // (across and down the screen, in tiles: one tile across is half a step along x and half against y)
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7;
      if (!moving) { m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.heldSpeed = m.speed; m.speed = 0; }
      else { m.cd = 1e9; }
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      if (role) out[role] = m.id;
      (out.all = out.all || []).push(m.id);
    }
    const t = g.monsters.find((m) => m.id === out.target);
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    // (the trap's skeleton waits where it stands until the film begins)
    if (moving) for (const m of g.monsters) { m.heldSpeed = m.speed; m.speed = 0; }
    return out;
  }, [plan.layout, !!plan.moving]);
  console.log('filming', what, 'stood', JSON.stringify(ids), 'weapon', weapon, off ? 'WILD OFF' : 'wild on');
  await page.waitForTimeout(Number(process.env.WAIT || 7000));
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }), scale: await page.evaluate(() => window.__dbg.screen.scale ?? null) });

  /** Do one thing at a point `ax` tiles across and `dn` down the screen from the hero: a slow attack (held `hold` seconds, if it is held) or the evasive move. */
  const act = ([how, ax, dn, hold]) => page.evaluate(([how, ax, dn, hold]) => {
    const g = window.__dbg.game(); const h = g.hero;
    const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
    h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
    const far = Math.hypot(x - h.x, y - h.y) || 1; h.fx = (x - h.x) / far; h.fy = (y - h.y) / far;
    if (hold > 0) {
      // (a held attack goes on for as long as the button is down: hold it down)
      window.__held = { left: hold, x, y };
      if (!g.__heldWrap) {
        const run = g.update.bind(g);
        g.update = (dt, c) => { const f = window.__held; if (f && f.left > 0) { f.left -= dt; c.hold = true; c.castX = f.x; c.castY = f.y; } return run(dt, c); };
        g.__heldWrap = true;
      }
    }
    if (how === 'evade') g.useEvasive(x, y, { evade: true, hold: false, mx: 0, my: 0 });
    else g.useSkill(1, x, y);
    // (the trap's skeleton comes after the hero as soon as he has rolled away)
    for (const m of g.monsters) if (m.heldSpeed !== undefined && m.speed === 0 && m.state !== 'recover') m.speed = m.heldSpeed;
    return 'ok';
  }, [how, ax, dn, hold ?? 0]);

  const slow = 0.08;
  const step = 1000 / 30 / slow;
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < plan.frames; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (plan.at[i]) await act(plan.at[i]);
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
}
