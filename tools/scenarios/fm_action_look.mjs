// THE FLESHMANCER'S MOVES DONE THE ACTION WAY in the game (FM_ACTION on in the page built for it): each of his, in his own hall on
// floor 5, played by the game's own rules: he is woken by the hero, only that act ready, the game stepped on until he begins it and
// then to each moment of it, then pictured (as tools/scenarios/am_action_look.mjs). And the mini fleshmancer's fire.
//   node tools/playtest.mjs --file dist/fm_action.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/fm_action_look.mjs --out shots/fm
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 4242); d.seasoned(4); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 5; g.cleared = 4; g.enterDungeon();
    g.level.explored.fill(1);
    g.waveT = 1e9; window.__dbg.bot(false);
    const m = g.boss;
    for (const q of g.monsters) if (q !== m) q.dead = true;
    g.monsters = [m];
    // (the hero in the middle of his hall)
    const r = g.level.floor.rooms.find((q) => q.kind === 'boss') ?? g.level.floor.rooms.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
    g.hero.x = r.x + r.w / 2 + 0.5; g.hero.y = r.y + r.h / 2 + 0.5;
  });
  await page.evaluate(() => { const g = window.__dbg.game(); window.__step = g.update.bind(g); g.update = () => undefined; });
  await page.waitForTimeout(Number(process.env.SETTLE || 7000));
  const idle = { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };
  /** He is set (dx, dy) from the hero, awake, only his act `ready` (of `n`) free, stepped on until he begins it (`blink`: his teleport). */
  const begin = async (kind, dx, dy, n, ready, blink = false) => page.evaluate(([kind, dx, dy, n, ready, blink, idle]) => {
    const g = window.__dbg.game();
    g.perils = []; g.zones = [];
    const h = g.hero;
    let m = g.monsters.find((q) => q.kind === kind && !q.dead);
    if (!m) {
      m = g.spawn(kind, h.x + dx, h.y + dy, -2, 0, false, g.rng, null, null);
      g.monsters = [m];
    }
    // (where he can stand and see the hero: the offset asked for, or turned about)
    const tries = [[dx, dy], [-dx, dy], [dx, -dy], [-dx, -dy], [dy, dx], [-dy, -dx]];
    const ok = tries.find(([ox, oy]) => g.isOpen(h.x + ox, h.y + oy) && g.sees(h.x + ox, h.y + oy, h.x, h.y)) ?? tries[0];
    m.x = h.x + ok[0]; m.y = h.y + ok[1];
    m.state = 'chase'; m.act = undefined;
    g.wakeUp(m);
    if (m.boss && g.bossReady) g.bossReady();
    m.life = m.maxLife = 1e9; m.cd = 0; m.speed = 0;
    m.moveCd = Array.from({ length: n }, (_, i) => (i === ready ? 0 : 99));
    if (blink) m.blinkT = 0;
    for (let k = 0; k < 240 && m.state !== 'act'; k++) { h.invuln = 1; h.life = h.d.maxLife; window.__step(1 / 30, idle); }
    return m.state === 'act' ? m.act.id : `none (${m.state}, boss ${!!m.boss}, cd ${m.cd}, ${JSON.stringify(m.moveCd)}, d ${Math.hypot(h.x - m.x, h.y - m.y).toFixed(1)}, sees ${g.sees(m.x, m.y, h.x, h.y)})`;
  }, [kind, dx, dy, n, ready, blink, idle]);
  const at = async (secs, name) => {
    await page.evaluate(([secs, idle]) => {
      const g = window.__dbg.game();
      for (let k = 0; k < Math.round(secs * 30); k++) { g.hero.invuln = 0; g.hero.life = g.hero.d.maxLife; window.__step(1 / 30, idle); }
    }, [secs, idle]);
    await page.waitForTimeout(30);
    await snap(name);
  };
  // (his acts: shards, rings, fire, raise; then his teleport)
  console.log('shards:', await begin('fleshmancer', -2.6, -2.4, 6, 0));
  await at(0.6, 'shards_a_hanging');
  await at(0.4, 'shards_b_flying');
  await at(0.6, 'shards_c_second_hanging');
  await at(0.3, 'shards_d_second_flying');
  console.log('rings:', await begin('fleshmancer', -2.0, -1.6, 6, 1));
  await at(0.9, 'rings_a_cracks_lit');
  await at(0.4, 'rings_b_first_slam');
  await at(0.8, 'rings_c_second_slam');
  console.log('fire:', await begin('fleshmancer', -2.4, -2.2, 6, 2));
  await at(0.9, 'fire_a_reared');
  await at(0.5, 'fire_b_whip');
  await at(0.6, 'fire_c_whip_round');
  await at(1.2, 'fire_d_lanes');
  console.log('raise:', await begin('fleshmancer', -2.4, -2.2, 6, 3));
  await at(1.1, 'raise_a_heaps_shaking');
  await at(0.5, 'raise_b_dead_up');
  console.log('blink:', await begin('fleshmancer', -2.0, -1.8, 6, 99, true));
  await at(0.5, 'blink_a_yanked');
  await at(0.7, 'blink_b_marked');
  await at(0.6, 'blink_c_erupts');
  // (the mini fleshmancer's fire)
  console.log('mini:', await begin('minifm', -1.8, -1.4, 2, 0));
  await at(0.8, 'mini_a_cocked');
  await at(0.4, 'mini_b_whip');
  await at(0.8, 'mini_c_lanes');
}
