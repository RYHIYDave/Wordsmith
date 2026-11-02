// FLOOR 3, MORE ACTION in the game (ACTION_F3 on in the page built for it): the green troll's rampage and his bull rush, played
// by the game's own rules in a big room: each set by the hero, ready to begin, the game stepped on until it begins and then to each
// moment of it, then pictured (as tools/scenarios/action_f4_look.mjs); and the Boneward behind its shield wall, struck from before it
// (the blow glances off) and from behind (it is hurt).
//   node tools/playtest.mjs --file dist/action_f3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/action_f3_look.mjs --out shots/af3
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
  /** A `kind` set (dx, dy) from the hero, its move `ready` free (the others not), stepped on until it begins it; null if it never does. */
  const begin = async (kind, dx, dy, n, ready) => page.evaluate(([kind, dx, dy, n, ready, idle]) => {
    const g = window.__dbg.game();
    g.monsters = []; g.perils = []; g.zones = [];
    const h = g.hero;
    const m = g.spawn(kind, h.x + dx, h.y + dy, -1, 0, false, g.rng);
    g.monsters = [m];
    m.state = 'chase'; m.cd = 0; const pace = m.speed; m.speed = 0; m.moveCd = Array.from({ length: n }, (_, i) => (i === ready ? 0 : 99));
    for (let k = 0; k < 120 && m.state !== 'windup'; k++) { h.invuln = 1; h.life = h.d.maxLife; window.__step(1 / 30, idle); }
    // (still, till it begins; then at its pace again, for what runs)
    m.speed = pace;
    return m.state === 'windup' ? m.move : null;
  }, [kind, dx, dy, n, ready, idle]);
  /** The game stepped on `secs`, and pictured. */
  const at = async (secs, name) => {
    await page.evaluate(([secs, idle]) => {
      const g = window.__dbg.game();
      for (let k = 0; k < Math.round(secs * 30); k++) { g.hero.invuln = 1; g.hero.life = g.hero.d.maxLife; window.__step(1 / 30, idle); }
    }, [secs, idle]);
    await page.waitForTimeout(30);
    await snap(name);
  };
  // THE RAMPAGE, from two tiles up the screen: the swing, the step, the club up and the ring marked, the leap, the slam, the cracks
  const troll = async (dx, dy, i) => {
    return begin('brute', dx, dy, 2, i);
  };
  console.log('rampage began:', await troll(-1.5, -1.4, 0));
  await at(0.57, 'rampage_a_swing');
  await at(0.6, 'rampage_b_backhand');
  await at(0.6, 'rampage_c_raised_marked');
  await at(0.5, 'rampage_d_leap');
  await at(0.15, 'rampage_e_slam');
  await at(0.5, 'rampage_f_cracks');
  // THE BULL RUSH, from six tiles up the screen and to the left: the lane marked as he paws, his run, his stop
  console.log('rush began:', await troll(-5.2, -2.2, 1));
  await at(0.6, 'rush_a_pawing');
  await at(0.55, 'rush_b_run');
  await at(0.6, 'rush_c_stop');
  // THE BONEWARD'S SHIELD WALL: standing behind it; struck from before it, the blow glancing off; struck from behind, hurt
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.monsters = []; g.perils = []; g.zones = [];
    const h = g.hero;
    const m = g.spawn('boneward', h.x - 2.0, h.y + 0.5, -1, 0, false, g.rng);
    g.monsters = [m];
    m.state = 'chase'; m.cd = 99; m.speed = 0; m.moveCd = [99, 99, 99];
    const d = Math.hypot(h.x - m.x, h.y - m.y);
    m.fx = (h.x - m.x) / d; m.fy = (h.y - m.y) / d;
    window.__look = m;
  });
  await at(0.3, 'wall_a_behind_shield');
  await page.evaluate(() => { const g = window.__dbg.game(); g.hitMonster(window.__look, 0, 1, false); });
  await at(0.1, 'wall_b_glance');
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const m = window.__look;
    g.hero.x = m.x - m.fx * 1.4; g.hero.y = m.y - m.fy * 1.4;
    g.hitMonster(m, 0, 1, false);
  });
  await at(0.1, 'wall_c_struck_from_behind');
}
