// FLOOR 1, MORE ACTION in the game (ACTION_F1 on in the page built for it): the arrow rain's ring and the Lockdown's bars on the
// floor, each set down by the hero in a big room of floor 1 and shown at moments of its course (its time set, then the picture).
//   node tools/playtest.mjs --file dist/action_f1.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/action_f1_look.mjs --out shots/af1
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 4242); d.seasoned(3); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 1; g.cleared = 0; g.enterDungeon();
    g.level.explored.fill(1);
    g.monsters = []; g.waveT = 1e9; window.__dbg.bot(false);
    const r = g.level.floor.rooms.filter((q) => q.w >= 9 && q.h >= 9)[0];
    g.hero.x = r.x + r.w / 2; g.hero.y = r.y + r.h / 2 + 1.2;
  });
  await page.waitForTimeout(2500);
  const show = async (a1, t, name, dx = 0, dy = 0) => {
    await page.evaluate(([a1, t, dx, dy]) => {
      const g = window.__dbg.game();
      const h = g.hero;
      let p = g.perils.find((q) => q.a1 === a1);
      if (!p) {
        p = { kind: 'act1', a1, x: h.x + dx, y: h.y + dy, fx: 1, fy: 0, t, hit: a1 === 'archer:rain' ? 1.5 : 0, dur: 9, dmg: 0, el: 'physical', words: [], half: false, from: 'a look', done: 1, a: -1, b: h.x + dx - 5, c: h.y + dy - 1, d: 0, hand: 1 };
        g.perils.push(p);
      }
      p.t = t; p.dur = 9; p.done = 1;
      // (the Lockdown before its crash asks that its Warden be winding up still: a still one set by it, held in his wind-up)
      if (a1 === 'warden:bars' && t < -0.1) {
        let w = g.monsters.find((m) => m.kind === 'warden');
        if (!w) { w = g.spawn('warden', p.x, p.y, -1, 0, true, g.rng); }
        w.state = 'windup'; w.t = 5; w.move = 0; w.speed = 0; p.a = w.id;
      }
    }, [a1, t, dx, dy]);
    await page.waitForTimeout(60);
    await snap(name);
  };
  await show('archer:rain', 0.3, 'rain_a_ring', 0.6, -1.4);
  await show('archer:rain', 1.3, 'rain_b_filling');
  await show('archer:rain', 1.5, 'rain_c_strike');
  await show('archer:rain', 1.9, 'rain_d_stuck');
  await page.evaluate(() => { const g = window.__dbg.game(); g.perils = []; });
  await show('warden:bars', -0.6, 'bars_a_shadows', 0, -1.4);
  await show('warden:bars', -0.25, 'bars_a2_shadows_late');
  await show('warden:bars', 0, 'bars_b_crash');
  await show('warden:bars', 0.6, 'bars_c_cage');
  await show('warden:bars', 1.7, 'bars_d_rising');
}
