// BIG AND WILD (art/moves3.ts WILD, render/wild.ts; a mock-up: not in the game): the mage's Wave,
// filmed in the practice room as the game draws it, a picture every thirtieth of a second of the
// game's time (the game is slowed so that the camera keeps up). She stands in her guard (her
// stances, MAGE_STANCES, which he said yes to) before a group of monsters that cannot die or move,
// and sends three Waves into them.
//   node tools/build_to.mjs dist/wild.html
//   node tools/playtest.mjs --file dist/wild.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/wild_wave.mjs --out shots/wild/on
//   env: OFF=1: the same with WILD off (her Wave from her guard as he last saw it, 19:19)
//        WAIT = milliseconds to let the room settle and the frames be painted first
// A note beside the pictures (<out>_where.json) says where on the screen the hero stands.
export default async function (page, snap) {
  const off = process.env.OFF === '1';
  const weapon = await page.evaluate((off) => {
    const d = window.__dbg; d.saving(false); d.practice('mage', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.mageStances(true);
    d.wild(!off);
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero;
    if (g.weapon() !== 'staff') { const i = h.bag.findIndex((it) => it && it.weapon === 'staff'); if (i >= 0) g.equipFromBag(i); }
    return g.weapon();
  }, off);
  await page.waitForTimeout(400);
  // Who stands where, in tiles across and down the screen from the hero (+across: right; +down: toward you).
  const layout = [['skeleton', 2.7, -0.3, 'target'], ['skeleton', 3.6, 0.8], ['cultist', 3.9, -1.2], ['skeleton', 4.9, 0.1], ['brute', 5.3, -0.9]];
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
  }, layout);
  console.log('stood', JSON.stringify(ids), 'weapon', weapon, off ? 'WILD OFF' : 'wild on');
  await page.waitForTimeout(Number(process.env.WAIT || 7000));
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }), scale: await page.evaluate(() => window.__dbg.screen.scale ?? null) });

  /** She sends a Wave at a point `ax` tiles across and `dn` down the screen from her. */
  const wave = (ax, dn) => page.evaluate(([ax, dn]) => {
    const g = window.__dbg.game(); const h = g.hero;
    const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
    h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
    const far = Math.hypot(x - h.x, y - h.y) || 1; h.fx = (x - h.x) / far; h.fy = (y - h.y) / far;
    g.useBasic(x, y);
    return 'ok';
  }, [ax, dn]);
  const plan = { frames: 96, at: { 10: () => wave(4, -0.3), 36: () => wave(4, 0.4), 62: () => wave(4, -0.8) } };

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
  console.log('late by', Date.now() - (t0 + (plan.frames - 1) * step), 'ms at the end');
}
