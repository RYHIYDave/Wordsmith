// STRIKE'S COMBO, TODAY'S AND MENDED (art/moves3.ts, COMBO_MENDS: a mock-up behind a switch that is
// off), filmed in the practice room: the knight with the great sword, a skeleton that cannot die in
// front of him, two taps (Strike, then the slash), a picture every thirtieth of a second of the
// game's time (the game slowed so that the camera keeps up).
//   node tools/build_to.mjs dist/mends.html
//   MENDS=1 node tools/playtest.mjs --file dist/mends.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/combo_mends.mjs --out shots/mends/on
//   env: MENDS=1: the mended swings (window.__dbg.comboMends(true), which paints the heroes again); else today's
//        AWAY=1: he faces away from you (up the screen); else to the right across it
//        WAIT = milliseconds to let the room settle and the frames be painted first
// A note beside the pictures (<out>_where.json) says where on the screen the hero stands.
export default async function (page, snap) {
  const mends = process.env.MENDS === '1';
  const away = process.env.AWAY === '1';
  await page.evaluate(([mends, away]) => {
    const d = window.__dbg; d.saving(false);
    d.comboMends(mends);
    d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true; d.combo.on = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero;
    // (to the right across the screen, his feet in plain sight; or away, up the screen to the left)
    if (away) { h.fx = -Math.SQRT1_2; h.fy = -Math.SQRT1_2; } else { h.fx = Math.SQRT1_2; h.fy = -Math.SQRT1_2; }
    const m = g.spawn('skeleton', h.x + h.fx * 2.6, h.y + h.fy * 2.6, 1, 0, false, g.rng);
    g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e7; m.state = 'recover'; m.t = 1e9;
    m.fx = -h.fx; m.fy = -h.fy;
    // (the two taps, at set moments of the game's own time once the film starts: `__taps`)
    // (a tap is held down from its moment until a swing begins, as a finger that taps during a
    // swing has its tap wait its turn: so the second is the slash, the combo's own)
    window.__taps = null;
    let last = 1e9;
    let pending = false;
    const up = g.update.bind(g);
    g.update = (dt, c) => {
      const tp = window.__taps;
      if (tp) {
        tp.t += dt;
        for (const at of tp.at) if (tp.t >= at && tp.t - dt < at) pending = true;
        if (pending) { c.fire = true; c.aimX = m.x; c.aimY = m.y; }
      }
      const r = up(dt, c);
      if (h.anim === 'attack' && h.attackAge < last) { pending = false; tp && (tp.swings = (tp.swings || 0) + 1); }
      last = h.anim === 'attack' ? h.attackAge : 1e9;
      return r;
    };
  }, [mends, away]);
  await page.waitForTimeout(Number(process.env.WAIT || 7000));
  snap.note('where', { hero: await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); }), scale: await page.evaluate(() => window.__dbg.screen.scale ?? null), mends, away });
  const slow = 0.08;
  const step = 1000 / 30 / slow;
  const frames = Number(process.env.FRAMES || 66);
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; window.__taps = { t: 0, at: [0.1, 0.62] }; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  console.log('swings', await page.evaluate(() => window.__taps.swings), 'late by', Date.now() - (t0 + (frames - 1) * step), 'ms at the end');
}
