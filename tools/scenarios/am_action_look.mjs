// THE OSSUARY AMALGAMATION'S MOVES DONE THE ACTION WAY in the game (AM_ACTION on in the page built for it): each of its four, and
// its bone mites, played by the game's own rules in its ossuary: it is set by the hero, awake, only that act ready, the game
// stepped on until it begins it and then to each moment of it, then pictured (as tools/scenarios/co_action_look.mjs).
//   node tools/playtest.mjs --file dist/am_action.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/am_action_look.mjs --out shots/am
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 4242); d.seasoned(3); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 4; g.cleared = 3; g.enterDungeon();
    g.level.explored.fill(1);
    g.monsters = []; g.waveT = 1e9; window.__dbg.bot(false);
    const rooms = g.level.floor.rooms.slice().sort((a, b) => b.w * b.h - a.w * a.h);
    const r = rooms[0];
    g.hero.x = r.x + r.w / 2 + 2; g.hero.y = r.y + r.h / 2 + 1;
  });
  // (the game held still between pictures: its own loop's step does nothing, and the scenario steps it with the real one; and
  // the floor's name let go from the screen first)
  await page.evaluate(() => { const g = window.__dbg.game(); window.__step = g.update.bind(g); g.update = () => undefined; });
  await page.waitForTimeout(Number(process.env.SETTLE || 7000));
  const idle = { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };
  /** The Amalgamation set (dx, dy) from the hero, awake, only his act `ready` (of `n`) free, stepped on until he begins it. */
  const begin = async (dx, dy, n, ready) => page.evaluate(([dx, dy, n, ready, idle]) => {
    const g = window.__dbg.game();
    g.monsters = []; g.perils = []; g.zones = [];
    const h = g.hero;
    const m = g.spawn('amalgam', h.x + dx, h.y + dy, -2, 0, false, g.rng, null, null);
    g.monsters = [m];
    g.wakeUp(m);
    m.life = m.maxLife = 1e9; m.cd = 0;
    m.moveCd = Array.from({ length: n }, (_, i) => (i === ready ? 0 : 99));
    for (let k = 0; k < 240 && m.state !== 'act'; k++) { h.invuln = 1; h.life = h.d.maxLife; window.__step(1 / 30, idle); }
    return m.state === 'act' ? m.act.id : null;
  }, [dx, dy, n, ready, idle]);
  /** The game stepped on `secs`, and pictured (the hero struck but never hurt). */
  const at = async (secs, name) => {
    await page.evaluate(([secs, idle]) => {
      const g = window.__dbg.game();
      for (let k = 0; k < Math.round(secs * 30); k++) { g.hero.invuln = 0; g.hero.life = g.hero.d.maxLife; window.__step(1 / 30, idle); }
    }, [secs, idle]);
    await page.waitForTimeout(30);
    await snap(name);
  };
  // (its acts: swipe, rain, floor arms, devour, and its bursting)
  console.log('swipe:', await begin(-1.8, -1.7, 5, 0));
  await at(0.5, 'swipe_a_hauled_marked');
  await at(0.27, 'swipe_b_rake');
  await at(0.93, 'swipe_c_backhand_held');
  await at(0.33, 'swipe_d_backhand');
  await at(1.2, 'swipe_e_reared_marked');
  await at(0.37, 'swipe_f_finisher');
  console.log('rain:', await begin(-2.2, -2.0, 5, 1));
  await at(1.2, 'rain_a_reared_roaring');
  await at(0.4, 'rain_b_slam');
  await at(0.6, 'rain_c_shadows_falling');
  await at(0.6, 'rain_d_bursts');
  await at(1.4, 'rain_e_mites');
  await at(1.0, 'rain_f_mites_swarm');
  console.log('arms:', await begin(-2.2, -2.0, 5, 2));
  await at(1.1, 'arms_a_reared');
  await at(0.3, 'arms_b_slam');
  await at(0.6, 'arms_c_arms');
  console.log('devour:', await begin(-2.4, -2.3, 5, 3));
  await at(0.9, 'devour_a_cone');
  await at(0.65, 'devour_b_drag');
  await at(0.7, 'devour_c_bite');
}
