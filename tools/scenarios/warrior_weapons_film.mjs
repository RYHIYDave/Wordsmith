// THE WARRIOR'S THREE WEAPONS IN PLAY (game/talents.ts WARRIOR_TREE2, switched on for this page only), for his film: the practice
// room's Warrior with one weapon picked, a few skeletons before him, each of the weapon's three moves made in turn; a picture every
// thirtieth of a second of the game's time (the game slowed so the camera keeps up). The axe's and the hammer's pictures are the
// greatsword's standing in (the art chat's to come), the thrown axe a stand-in. For his pictures; not part of tools/regress.sh.
//   node tools/build_to.mjs dist/wweapons.html
//   PART=battleaxe node tools/playtest.mjs --file dist/wweapons.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/warrior_weapons_film.mjs --out shots/wweapons/axe
//   env: PART = greatsword | battleaxe | warhammer
export default async function (page, snap) {
  const part = process.env.PART || 'greatsword';
  const talents = { greatsword: ['greatsword'], battleaxe: ['battleaxe', 'rend'], warhammer: ['warhammer', 'heavyhead'] }[part];
  const set = await page.evaluate((talents) => {
    const d = window.__dbg; d.saving(false); d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.warriorTree2.on = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    d.seasoned(30);
    const said = (window.__said = []);
    for (const t of talents) said.push(`${t}: ${g.takeTalent(t) ?? 'taken'}`);
    const emit = g.emit.bind(g);
    g.emit = (e) => {
      if (['stun', 'stagger', 'axeTurn', 'burst', 'swing'].includes(e.t)) said.push(`${g.time.toFixed(2)} ${e.t}${e.id !== undefined ? ' #' + e.id : ''}`);
      emit(e);
    };
    return { skills: g.hero.skills.map((s) => s.id), said };
  }, talents);
  console.log('set', JSON.stringify(set));
  await page.waitForTimeout(400);
  // skeletons before him: two near (across the screen to his right), one a little further, one aside
  const ids = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const out = [];
    for (const [ax, dn] of [[1.3, -0.2], [1.7, 0.9], [3.6, 0.1], [2.6, -1.2]]) {
      const x = h.x + (ax + dn) / 2 * 1.4; const y = h.y + (dn - ax) / 2 * 1.4;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) continue;
      const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e6;
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      out.push(m.id);
    }
    const t = g.monsters[0];
    if (t) { const far = Math.hypot(t.x - h.x, t.y - h.y) || 1; h.fx = (t.x - h.x) / far; h.fy = (t.y - h.y) / far; }
    return out;
  });
  console.log('stood', JSON.stringify(ids));
  await page.waitForTimeout(Number(process.env.WAIT || 4000));
  const ready = () => page.evaluate(() => { const h = window.__dbg.game().hero; h.swingT = 0; for (const s of h.skills) { s.cd = 0; s.charges = s.maxCharges; } });
  const tap = (id) => page.evaluate((id) => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === id); if (m) g.useBasic(m.x, m.y); }, id);
  const hold = (id) => page.evaluate((id) => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === id); if (m) g.useSkill(1, m.x, m.y); }, id);
  const swipe = (id) => page.evaluate((id) => {
    const g = window.__dbg.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === id);
    if (!m) return;
    const dx = m.x - h.x; const dy = m.y - h.y; const far = Math.hypot(dx, dy) || 1;
    const x = h.x + dx / far * Math.max(2.5, far + 1.2); const y = h.y + dy / far * Math.max(2.5, far + 1.2);
    g.useEvasive(x, y, { mx: 0, my: 0, aimX: x, aimY: y, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: true, evadeX: x, evadeY: y, potion: false, interact: false });
  }, id);
  const back = () => page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; const m = g.monsters[0]; if (m) { h.x = m.x - 1.0; h.y = m.y + 1.0; } });
  const plan = { frames: 150, at: { 4: ready, 5: () => tap(ids[0]), 40: ready, 41: () => hold(ids[2] ?? ids[0]), 95: ready, 96: () => swipe(ids[2] ?? ids[0]), 140: back } };
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
  const where = await page.evaluate(() => { const g = window.__dbg.game(); return { hero: { x: g.hero.x, y: g.hero.y }, hit: g.monsters.map((m) => Math.round(m.maxLife - m.life)) }; });
  console.log('rules', JSON.stringify(where));
  console.log('said', JSON.stringify(await page.evaluate(() => window.__said)));
}
