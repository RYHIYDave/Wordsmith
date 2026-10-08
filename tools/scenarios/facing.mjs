// The controls the owner asked to try (4 Oct 2026): "attacking the direction the character is
// facing, not where you tap ... lock onto enemies so you can run backwards and attack. Out of
// combat, still attack in the direction you're facing." They are built and switched OFF (an hour
// later he asked for something smaller: see melee.mjs); OPTIONS and the pause menu switch them on.
// Played here with real touches, two thumbs, in the practice room; then the switch back to the
// usual way, in the pause menu and in OPTIONS.
//   CLS=ranger node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/facing.mjs --out shots/facing
// (add --size 390x844, and --eval "window.__dbg.screen.setTurnMode('upright')", for the other ways of holding a phone)
export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const cdp = await page.context().newCDPSession(page);
  const pts = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...pts].map(([id, p]) => ({ x: Math.round(p.x), y: Math.round(p.y), id })) });
  const client = (gx, gy) => page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [gx, gy]);
  const down = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchStart'); };
  const move = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchMove'); };
  const up = async (id) => {
    const q = pts.get(id);
    pts.delete(id);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: q ? [{ x: Math.round(q.x), y: Math.round(q.y), id }] : [] });
  };
  // (A tap's coming down is sent and NOT waited for before its going up is: with four playtests
  // sharing the machine the browser has taken a third of a second to answer, and a touch that lasts
  // that long is a HOLD. Versions 13.2 and 14.0: a tap set an orb, a tap spun a whirlwind.)
  const tap = async (gx, gy, ms = 60) => { pts.set(9, await client(gx, gy)); const sent = send('touchStart'); await page.waitForTimeout(ms); await Promise.all([sent, up(9)]); };
  const mark = (name) => page.evaluate((n) => { const r = window.__dbg.ui.marks.get(n); return r ? { x: r.x + r.w / 2, y: r.y + r.h / 2, w: r.w, h: r.h, top: r.y, bottom: r.y + r.h } : null; }, name);
  const marks = () => page.evaluate(() => [...window.__dbg.ui.marks.keys()]);
  const log = (label, v) => console.log(label.padEnd(46), typeof v === 'string' ? v : JSON.stringify(v));
  let fails = 0;
  const check = (what, ok, detail = '') => { if (!ok) fails++; console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`); };
  const tapMark = async (name) => {
    const m = await mark(name);
    if (!m) { check(`"${name}" is on screen`, false, (await marks()).join(', ')); return false; }
    await tap(m.x, m.y);
    await page.waitForTimeout(160);
    return true;
  };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const s = d.screen;
    if (!g) return { title: true, w: s.w, h: s.h, aim: d.meta().aim };
    const h = g.hero; const c = d.cam();
    const scr = (x, y) => ({ x: c.ox + (x - y) * 16, y: c.oy + (x + y) * 8 });
    const live = g.monsters.filter((m) => !m.dead && m.seen);
    const one = (m) => ({ id: m.id, x: m.x, y: m.y, at: scr(m.x, m.y), dist: Math.hypot(m.x - h.x, m.y - h.y), awake: m.state !== 'sleep', life: m.life });
    const locked = g.monsters.find((m) => m.id === d.lock.id && !m.dead);
    return {
      w: s.w, h: s.h, aim: d.meta().aim, panel: d.panels.open, x: h.x, y: h.y, fx: h.fx, fy: h.fy, hero: scr(h.x, h.y),
      uses: h.skills.map((k) => k.uses), names: h.skills.map((k) => k.r.name), lockId: d.lock.id, pinned: d.lock.pinned, ring: d.renderer.lockId,
      locked: locked ? one(locked) : null, mons: live.map(one),
      shots: g.projectiles.filter((p) => !p.hostile).map((p) => ({ vx: p.vx, vy: p.vy, age: p.age })),
      traps: g.traps.map((t) => ({ x: t.x, y: t.y })), volleys: g.volleys.map((v) => ({ x: v.x, y: v.y })),
    };
  });
  /** A point on the right of the screen with no monster under it and no interface over it. */
  const openSpot = (s) => {
    const cands = [[0.72, 0.42], [0.82, 0.5], [0.66, 0.6], [0.78, 0.66], [0.88, 0.4], [0.6, 0.36]].map(([a, b]) => ({ x: Math.round(s.w * a), y: Math.round(s.h * b) }));
    let best = cands[0]; let bd = -1;
    for (const p of cands) {
      const d = Math.min(1e9, ...s.mons.map((m) => Math.hypot(m.at.x - p.x, (m.at.y - 12) - p.y)));
      if (d > bd) { bd = d; best = p; }
    }
    return best;
  };
  const until = async (pred, ms = 4000) => { for (let t = 0; t < ms; t += 80) { const s = await st(); if (pred(s)) return s; await page.waitForTimeout(80); } return null; };
  const cos = (ax, ay, bx, by) => (ax * bx + ay * by) / ((Math.hypot(ax, ay) || 1) * (Math.hypot(bx, by) || 1));

  // ---- 1. the practice room: monsters come, and the hero cannot die --------------------------------
  await page.evaluate((c) => { const d = window.__dbg; d.practice(c, 7); d.autoLevel = false; d.autoWords = false; }, cls);
  await page.waitForTimeout(400);
  let s = await st();
  log('screen', `${s.w}x${s.h}, ${cls}: ${s.names.join(', ')}`);
  // (it is an experiment, and switched off: the game plays the usual way until the player turns it on)
  check('it is off until the player switches it on', s.aim !== 'face' && s.lockId === null && s.ring === null, `aim is "${s.aim}"`);
  await page.evaluate(() => window.__dbg.setAim('face'));
  await page.waitForTimeout(150);
  s = await st();
  check('switched on: attacks go the way the hero faces', s.aim === 'face', `aim is "${s.aim}"`);

  // ---- 2. a fight: the lock ----------------------------------------------------------------------
  s = await until((q) => q.lockId !== null && q.locked && q.locked.dist < 9, 15000);
  if (!s) { check('with monsters awake and in sight, the hero locks onto one', false); log('RESULT', 'FAILED'); return; }
  const nearest = [...s.mons].filter((m) => m.awake).sort((a, b) => a.dist - b.dist)[0];
  check('with monsters awake and in sight, the hero locks onto one', true, `monster ${s.lockId}, ${s.locked.dist.toFixed(1)} tiles off; ${s.mons.filter((m) => m.awake).length} awake`);
  check('it is the nearest of them (or within a tile and a half of it: the lock is sticky)', s.locked.dist <= nearest.dist + 1.5 + 0.01, `locked ${s.locked.dist.toFixed(1)}, nearest ${nearest.dist.toFixed(1)}`);
  check('a ring is drawn under it', s.ring === s.lockId);
  check('the hero has turned toward it without being told to', cos(s.fx, s.fy, s.locked.x - s.x, s.locked.y - s.y) > 0.97, `facing (${s.fx.toFixed(2)}, ${s.fy.toFixed(2)})`);
  await snap('01_locked');

  // ---- 3. TAP anywhere: the quick attack goes at the enemy locked onto ---------------------------
  let p = openSpot(s);
  let before = s.uses[0];
  await tap(p.x, p.y);
  s = await until((q) => q.uses[0] > before, 1500);
  check('a tap on open floor, away from every monster, is an attack', !!s, s ? `${s.names[0]} used ${s.uses[0] - before} time(s)` : 'no attack in a second and a half');
  if (s && s.locked && s.shots.length) {
    const sh = [...s.shots].sort((a, b) => a.age - b.age)[0];
    check('and it flies at the enemy locked onto, not at the thumb', cos(sh.vx, sh.vy, s.locked.x - s.x, s.locked.y - s.y) > 0.9, `shot (${sh.vx.toFixed(1)}, ${sh.vy.toFixed(1)}), enemy at (${(s.locked.x - s.x).toFixed(1)}, ${(s.locked.y - s.y).toFixed(1)})`);
  } else if (s && s.locked) {
    check('and the hero is turned toward the enemy locked onto as it is made', cos(s.fx, s.fy, s.locked.x - s.x, s.locked.y - s.y) > 0.9);
  }
  await snap('02_tap_anywhere');

  // ---- 4. run backwards and attack ---------------------------------------------------------------
  s = await until((q) => q.locked, 4000);
  if (s) {
    // the left thumb pushes straight away from the enemy (on screen), the right thumb taps
    const ax = s.hero.x - s.locked.at.x; const ay = s.hero.y - s.locked.at.y; const al = Math.hypot(ax, ay) || 1;
    const stick = { x: Math.round(s.w * 0.17), y: Math.round(s.h * 0.62) };
    const from = { x: s.x, y: s.y, dist: s.locked.dist, id: s.lockId };
    before = s.uses[0];
    await down(1, stick.x, stick.y);
    await move(1, stick.x + (ax / al) * 26, stick.y + (ay / al) * 26);
    let turnedAway = 0; let n = 0;
    for (let i = 0; i < 9; i++) {
      await page.waitForTimeout(110);
      if (i % 3 === 1) { const q0 = await st(); const pp = openSpot(q0); await tap(pp.x, pp.y); }
      const q = await st();
      if (q.locked) { n++; if (cos(q.fx, q.fy, q.locked.x - q.x, q.locked.y - q.y) < 0.9) turnedAway++; }
    }
    await snap('03_backing_away');
    await up(1);
    s = await st();
    const walked = Math.hypot(s.x - from.x, s.y - from.y);
    check('the hero walks away from the enemy', walked > 0.8, `${walked.toFixed(1)} tiles`);
    check('without ever turning their back on it', n > 0 && turnedAway === 0, `${turnedAway} of ${n} looks had the hero turned away`);
    check('and goes on attacking while backing away', s.uses[0] > before, `${s.uses[0] - before} attack(s)`);
  } else check('an enemy to back away from', false, 'nothing locked');

  // ---- 5. HOLD anywhere: the slow attack, at the enemy locked onto --------------------------------
  s = await until((q) => q.locked, 5000);
  if (s) {
    p = openSpot(s);
    before = s.uses[1];
    const at = { x: s.locked.x, y: s.locked.y };
    await down(9, p.x, p.y);
    const done = await until((q) => q.uses[1] > before, 2500);
    await up(9);
    check('a hold on open floor is the slow attack', !!done, done ? `${done.names[1]}` : 'not used in two and a half seconds');
    if (done && cls === 'ranger') {
      const q = await until((z) => z.volleys.length > 0, 1500);
      const v = q ? q.volleys[q.volleys.length - 1] : null;
      // (a volley is loosed no farther than its range, so one meant for a far enemy comes down on the way to it)
      check('the volley is loosed at the enemy locked onto, not at where the thumb is', !!v && cos(v.x - done.x, v.y - done.y, at.x - done.x, at.y - done.y) > 0.8, v ? `it rains ${Math.hypot(v.x - at.x, v.y - at.y).toFixed(1)} tiles from where the enemy stood` : 'no volley');
    }
    await snap('04_hold_anywhere');
  }

  // ---- 6. a touch right on a monster is an attack, and does not aim it ---------------------------
  s = await until((q) => q.mons.filter((m) => m.awake).length >= 2 && q.locked, 8000);
  if (s) {
    const other = s.mons.filter((m) => m.awake && m.id !== s.lockId && m.dist > s.locked.dist && m.at.x > 20 && m.at.x < s.w - 20 && m.at.y > 40 && m.at.y < s.h - 40).sort((a, b) => b.dist - a.dist)[0];
    if (other) {
      before = s.uses[0];
      const was = s.lockId;
      await tap(other.at.x, other.at.y - 10);
      let q = await until((z) => z.uses[0] > before, 1500);
      if (!q) {
        // (Seen once, in Version 14.3's second regression: this touch was no attack. What is
        // suspected: with four playtests sharing the machine the page stood still for a quarter
        // of a second between the finger's coming down and its going up, and the game times a
        // touch by its own clock (`performance.now()` in engine/input.ts, not the touch's own
        // time): past 250 ms it is a HOLD, the slow attack, and past 300 ms with the finger
        // already up it is nothing. So a touch that was not an attack is made once more, on where
        // that monster stands now, and what the first one did is written down; the check fails
        // only if the second is not an attack either.)
        const again = await st();
        console.log(`  (the first touch, at ${Math.round(other.at.x)},${Math.round(other.at.y - 10)} of ${s.w}x${s.h}, was not an attack within a second and a half: quick ${s.uses[0]} -> ${again.uses[0]}, slow ${s.uses[1]} -> ${again.uses[1]}; touched once more)`);
        const there = again.mons.find((m) => m.id === other.id) ?? other;
        before = again.uses[0];
        await tap(there.at.x, there.at.y - 10);
        q = await until((z) => z.uses[0] > before, 2500);
      }
      check('a touch right on a monster is an attack', !!q);
      // (unless the one locked onto has died meanwhile, the lock is where it was: on the nearest)
      const now = await st();
      const still = now.mons.some((m) => m.id === was);
      check('but it does not pick that monster out: where the thumb lands does not matter', !still || now.lockId !== other.id || now.locked.dist <= Math.min(...now.mons.filter((m) => m.awake).map((m) => m.dist)) + 1.5 + 0.01, `locked onto ${now.lockId}, touched ${other.id}`);
      check('and nothing is pinned', !now.pinned);
      await snap('05_touching_a_monster');
    } else log('  (no second monster on screen to touch: skipped)', '');
  } else log('  (never two monsters awake at once: skipped)', '');

  // ---- 7. out of a fight: the way the hero faces --------------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; });
  await page.waitForTimeout(200);
  s = await st();
  check('with nothing awake, nothing is locked', s.lockId === null && s.ring === null);
  // walk toward screen-right for a moment, let go, tap
  {
    const stick = { x: Math.round(s.w * 0.17), y: Math.round(s.h * 0.62) };
    await down(1, stick.x, stick.y);
    await move(1, stick.x + 26, stick.y);
    await page.waitForTimeout(500);
    await up(1);
    await page.waitForTimeout(120);
    s = await st();
    const f = { x: s.fx, y: s.fy };
    before = s.uses[0];
    const beforeSlow = s.uses[1];
    p = openSpot(s);
    // (tap ABOVE the hero: with the old controls the attack would go up the screen)
    await tap(Math.round(s.w * 0.7), Math.round(s.h * 0.2));
    // (with four playtests on the machine the page can be so long in answering that the tap has
    // lasted a quarter of a second by the time it is over, and is a hold: then it is the slow
    // attack that is made. Either is an attack, and either goes the way the hero faces. Version
    // 14.1's regression.)
    const q = await until((z) => z.uses[0] > before || z.uses[1] > beforeSlow, 2500);
    check('out of a fight, a tap is still an attack', !!q);
    if (q) check('and it goes the way the hero was walking, not toward the thumb', cos(q.fx, q.fy, f.x, f.y) > 0.98, `facing (${q.fx.toFixed(2)}, ${q.fy.toFixed(2)}), was (${f.x.toFixed(2)}, ${f.y.toFixed(2)})`);
    if (q && q.shots.length) { const sh = [...q.shots].sort((a, b) => a.age - b.age)[0]; check('the shot flies that way', cos(sh.vx, sh.vy, f.x, f.y) > 0.98); }
    await snap('06_out_of_a_fight');
  }
  // a sleeping monster 25 degrees off the way the hero faces: the attack is helped onto it
  {
    s = await st();
    const placed = await page.evaluate(() => {
      const g = window.__dbg.game(); const h = g.hero; const a = Math.atan2(h.fy, h.fx);
      for (const off of [0.42, -0.42]) for (const r of [5, 4, 3]) {
        const x = h.x + Math.cos(a + off) * r; const y = h.y + Math.sin(a + off) * r;
        if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1 || !g.sees(h.x, h.y, x, y)) continue;
        const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
        m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
        return { id: m.id, x, y };
      }
      return null;
    });
    if (placed) {
      await page.waitForTimeout(150);
      s = await st();
      before = s.uses[0];
      await tap(Math.round(s.w * 0.7), Math.round(s.h * 0.2));
      const q = await until((z) => z.uses[0] > before, 1500);
      check('a monster standing roughly ahead, still asleep, is aimed at', !!q && cos(q.fx, q.fy, placed.x - q.x, placed.y - q.y) > 0.99, q ? `facing (${q.fx.toFixed(2)}, ${q.fy.toFixed(2)}), monster at (${(placed.x - q.x).toFixed(1)}, ${(placed.y - q.y).toFixed(1)})` : 'no attack');
      await snap('07_aim_help');
    } else log('  (no room to put a sleeping monster ahead: skipped)', '');
  }

  // ---- 8. the switch: the pause menu ----------------------------------------------------------------
  await tapMark('button:II');
  await page.waitForTimeout(200);
  s = await st();
  check('the pause menu opens', s.panel === 'pause', `open: ${s.panel}`);
  const sw = await mark('button:ATTACKS: THE WAY YOU FACE');
  check('it has the switch, and says which way is on', !!sw);
  for (const name of await marks()) if (name.startsWith('button:')) { const m = await mark(name); if (m.top < 0 || m.bottom > s.h) check(`"${name}" is on the screen`, false, `${m.top}..${m.bottom} of ${s.h}`); }
  await snap('08_pause');
  // (the switch goes round: auto aim, where you tap, the way you face. Auto aim is where the game starts out, since Version 12.2.1.)
  await tapMark('button:ATTACKS: THE WAY YOU FACE');
  s = await st();
  check('pressing it goes round to auto aim', s.aim === 'auto' && !!(await mark('button:ATTACKS: AUTO AIM')), `aim is "${s.aim}"`);
  await tapMark('button:ATTACKS: AUTO AIM');
  s = await st();
  check('and once more to the old way', s.aim === 'tap' && !!(await mark('button:ATTACKS: WHERE YOU TAP')), `aim is "${s.aim}"`);
  await snap('09_pause_old_way');
  await tapMark('button:Resume');
  await page.waitForTimeout(200);

  // ---- 9. the old way still works: a tap aims ------------------------------------------------------
  {
    s = await st();
    const m = s.mons[0];
    if (m) {
      before = s.uses[0];
      await tap(m.at.x, m.at.y - 10);
      const q = await until((z) => z.uses[0] > before, 3500);
      check('the old way: a tap on a monster attacks it', !!q && cos(q.fx, q.fy, m.x - q.x, m.y - q.y) > 0.95);
      check('the old way: nothing is locked, and no ring is drawn', !!q && q.ring === null);
    }
    // a tap up the screen makes the hero face up the screen (the thumb aims)
    s = await st();
    before = s.uses[0];
    await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; });
    await page.waitForTimeout(120);
    await tap(s.hero.x + 4, s.hero.y - 70);
    const q = await until((z) => z.uses[0] > before, 2000);
    const up2 = { x: -Math.SQRT1_2, y: -Math.SQRT1_2 }; // straight up the screen, in tiles
    check('the old way: with no monster about, the attack goes toward the thumb', !!q && cos(q.fx, q.fy, up2.x, up2.y) > 0.9, q ? `facing (${q.fx.toFixed(2)}, ${q.fy.toFixed(2)})` : 'no attack');
  }

  // ---- 10. the switch: OPTIONS on the starting screen ------------------------------------------------
  await page.evaluate(() => window.__dbg.toTitle());
  await page.waitForTimeout(300);
  await tapMark('button:OPTIONS');
  await page.waitForTimeout(200);
  s = await st();
  const names = (await marks()).filter((n) => n.startsWith('button:'));
  log('the options', names.map((n) => n.slice(7)).join(' | '));
  let off = 0;
  for (const name of names) { const m = await mark(name); if (m.top < 0 || m.bottom > s.h) { off++; check(`"${name}" is on the screen`, false, `${m.top}..${m.bottom} of ${s.h}`); } }
  check('every option is on the screen', off === 0, `${names.length} buttons, screen ${s.w}x${s.h}`);
  check('the choice made in the pause menu is kept', !!(await mark('button:ATTACKS: WHERE YOU TAP')));
  await snap('10_options');
  // (the switch goes round three ways: auto aim, where you tap, the way you face)
  await tapMark('button:ATTACKS: WHERE YOU TAP');
  s = await st();
  check('OPTIONS goes on to the next way: the way the hero faces', s.aim === 'face' && !!(await mark('button:ATTACKS: THE WAY YOU FACE')), `aim is "${s.aim}"`);
  await snap('11_options_new_way');
  await tapMark('button:ATTACKS: THE WAY YOU FACE');
  s = await st();
  check('and then to auto aim', s.aim === 'auto' && !!(await mark('button:ATTACKS: AUTO AIM')), `aim is "${s.aim}"`);
  await tapMark('button:ATTACKS: AUTO AIM');
  s = await st();
  check('and round to where you tap again', s.aim === 'tap', `aim is "${s.aim}"`);

  const missing = await page.evaluate(() => window.__dbg.missing());
  check('every character asked for can be drawn', missing.length === 0, missing.join(' '));
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
