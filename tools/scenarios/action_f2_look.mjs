// FLOOR 2, MORE ACTION in the game (ACTION_F2 on in the page built for it): the cultist's fire sigil and the Shade's rime on the
// floor, each set down by the hero in a big room of floor 1 and shown at moments of its course (its time set, then the picture).
//   node tools/playtest.mjs --file dist/action_f2.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/action_f2_look.mjs --out shots/af2
export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 4242); d.seasoned(3); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 2; g.cleared = 1; g.enterDungeon();
    g.level.explored.fill(1);
    g.monsters = []; g.waveT = 1e9; window.__dbg.bot(false);
    const r = g.level.floor.rooms.filter((q) => q.w >= 8 && q.h >= 8)[0];
    g.hero.x = r.x + r.w / 2; g.hero.y = r.y + r.h / 2 + 1.2;
  });
  await page.waitForTimeout(2500);
  const show = async (a1, t, name, dx = 0, dy = 0) => {
    await page.evaluate(([a1, t, dx, dy]) => {
      const g = window.__dbg.game();
      const h = g.hero;
      let p = g.perils.find((q) => q.a1 === a1);
      if (!p) {
        p = { kind: 'act1', a1, x: h.x + dx, y: h.y + dy, fx: 1, fy: 0, t, hit: 0, dur: 9, dmg: 0, el: 'physical', words: [], half: false, from: 'a look', done: 1, a: -1, b: h.x + dx - 5, c: h.y + dy - 1, d: 0, hand: 1 };
        g.perils.push(p);
      }
      p.t = t; p.dur = 9; p.done = 1;
      // (the Lockdown before its crash asks that its Warden be winding up still: a still one set by it, held in his wind-up)
      if (a1 === 'cultist:sigil' && t < -0.05) {
        let w = g.monsters.find((m) => m.kind === 'cultist');
        if (!w) { w = g.spawn('cultist', p.x + 4, p.y - 1, -1, 0, false, g.rng); }
        w.state = 'windup'; w.t = 5; w.move = 0; w.speed = 0; p.a = w.id;
      }
    }, [a1, t, dx, dy]);
    await page.waitForTimeout(60);
    await snap(name);
  };
  await show('cultist:sigil', -0.8, 'sigil_a_ring', 0.5, -1.2);
  await show('cultist:sigil', -0.2, 'sigil_b_full');
  await show('cultist:sigil', 0.05, 'sigil_c_pillar');
  await show('cultist:sigil', 1.5, 'sigil_d_burning');
  await page.evaluate(() => { const g = window.__dbg.game(); g.perils = []; g.monsters = []; });
  await show('shade:rime', 0.4, 'rime_a', 0.8, -1.0);
  await show('shade:rime', 3.5, 'rime_b_melting');
}
