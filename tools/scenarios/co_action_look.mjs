// THE CHAINED ONE'S MOVES DONE THE ACTION WAY in the game (CO_ACTION on in the page built for it): each of his four, played by
// the game's own rules in his pit: he is set by the hero, awake, only that act ready, the game stepped on until he begins it and
// then to each moment of it, then pictured (as tools/scenarios/action_f4_look.mjs).
//   node tools/playtest.mjs --file dist/co_action.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/co_action_look.mjs --out shots/co
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 4242); d.seasoned(3); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 3; g.cleared = 2; g.enterDungeon();
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
  /** The Chained One set (dx, dy) from the hero, awake, only his act `ready` (of `n`) free, stepped on until he begins it. */
  const begin = async (dx, dy, n, ready) => page.evaluate(([dx, dy, n, ready, idle]) => {
    const g = window.__dbg.game();
    g.monsters = []; g.perils = []; g.zones = [];
    const h = g.hero;
    const m = g.spawn('chained', h.x + dx, h.y + dy, -2, 0, false, g.rng, null, null);
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
  // (his acts: lash, whirl, hook, ball, and his two breakings)
  console.log('lash:', await begin(-1.8, -1.7, 6, 0));
  await at(0.75, 'lash_a_forehand_held');
  await at(0.12, 'lash_b_forehand');
  await at(1.83, 'lash_c_fists_up_lane');
  await at(0.25, 'lash_d_crack');
  await at(0.5, 'lash_e_crack_after');
  console.log('whirl:', await begin(-1.5, -1.3, 6, 1));
  await at(0.8, 'whirl_a_gathered');
  await at(0.6, 'whirl_b_spinning');
  await at(3.1, 'whirl_c_fists_up_marked');
  await at(0.4, 'whirl_d_ring');
  console.log('hook:', await begin(-3.6, -3.4, 6, 2));
  await at(1.3, 'hook_a_aimed');
  await at(0.4, 'hook_b_caught');
  await at(0.5, 'hook_c_dragged');
  await at(0.6, 'hook_d_blow_marked');
  await at(0.3, 'hook_e_blow');
  console.log('ball:', await begin(-3.3, -3.1, 6, 3));
  await at(1.75, 'ball_a_held_marked');
  await at(0.6, 'ball_b_flying');
  await at(0.2, 'ball_c_ring');
}
