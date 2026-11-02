// FLOOR 4, MORE ACTION in the game (ACTION_F4 on in the page built for it): the Ossuary Golem's skeleton hurl and the dagger
// cultist's frenzy, played by the game's own rules in a big room of floor 4: each set by the hero, ready to begin, the game stepped
// on until it begins and then to each moment of it, then pictured.
//   node tools/playtest.mjs --file dist/action_f4.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/action_f4_look.mjs --out shots/af4
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
  // THE SKELETON HURL, at five tiles (its hold over the mark; in flight over its shadow; the burst; the bones lying)
  console.log('hurl began:', await begin('golem', -3.6, -3.4, 2, 1));
  await at(0.5, 'hurl_a_haul');
  await at(0.7, 'hurl_b_held_marked');
  await at(0.45, 'hurl_c_flight');
  await at(0.43, 'hurl_d_burst');
  await at(0.6, 'hurl_e_bones');
  // ...and from the other side, seen from behind
  console.log('hurl began:', await begin('golem', 3.4, 3.2, 2, 1));
  await at(1.25, 'hurl_f_back_held');
  await at(0.45, 'hurl_g_back_flight');
  // THE FRENZY
  console.log('frenzy began:', await begin('dagger', -2.1, 0.6, 1, 0));
  await at(0.3, 'frenzy_a_coiled');
  await at(0.5, 'frenzy_b_stabbing');
  await at(0.45, 'frenzy_c_last_stab');
  await at(0.6, 'frenzy_d_winded');
}
