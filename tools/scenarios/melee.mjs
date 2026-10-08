// The sword finds its enemy as the orb does (Version 11.1, the default controls on a phone).
// The owner, having played the mage: "Just give the same targeting that the mage has to the melee
// attacks as well. The ranged combat feels really good even in the current controls."
// Played with real touches in the practice room, with monsters stood where the test wants them.
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/melee.mjs --out shots/melee
export default async function (page, snap) {
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
  const log = (label, v) => console.log(label.padEnd(46), typeof v === 'string' ? v : JSON.stringify(v));
  let fails = 0;
  const check = (what, ok, detail = '') => { if (!ok) fails++; console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`); };
  const cos = (ax, ay, bx, by) => (ax * bx + ay * by) / ((Math.hypot(ax, ay) || 1) * (Math.hypot(bx, by) || 1));

  /** A fresh practice room for a class, with nothing in it; the hero in the middle. */
  const room = async (cls) => {
    await page.evaluate((c) => {
      const d = window.__dbg; d.practice(c, 7); d.autoLevel = false; d.autoWords = false;
      const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    }, cls);
    await page.waitForTimeout(350);
  };
  /**
   * Stand a monster `dist` tiles from the hero toward screen-right (+1), screen-left (-1), up the
   * screen (0, -1) or down it: it is awake, stands still, never strikes, and takes a great deal.
   * Returns its id. (If a pillar is in the way it is put a little nearer or further.)
   */
  const put = (dist, sx, sy, name = 'skeleton') => page.evaluate(([dist, sx, sy, name]) => {
    const g = window.__dbg.game(); const h = g.hero;
    // screen-right is +x -y in the world; down the screen is +x +y
    const ux = (sx + sy) * Math.SQRT1_2; const uy = (-sx + sy) * Math.SQRT1_2; const ul = Math.hypot(ux, uy) || 1;
    for (const r of [dist, dist + 0.3, dist - 0.3, dist + 0.6]) {
      const x = h.x + (ux / ul) * r; const y = h.y + (uy / ul) * r;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1 || !g.sees(h.x, h.y, x, y)) continue;
      const m = g.spawn(name, x, y, 1, 0, false, g.rng);
      g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
      return m.id;
    }
    return -1;
  }, [dist, sx, sy, name]);
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const s = d.screen; const h = g.hero; const c = d.cam();
    const scr = (x, y) => ({ x: c.ox + (x - y) * 16, y: c.oy + (x + y) * 8 });
    const mons = {};
    for (const m of g.monsters) if (!m.dead) mons[m.id] = { x: m.x, y: m.y, hurt: Math.round(m.maxLife - m.life), dist: Math.hypot(m.x - h.x, m.y - h.y), at: scr(m.x, m.y) };
    return { w: s.w, h: s.h, aim: d.meta().aim, x: h.x, y: h.y, fx: h.fx, fy: h.fy, hero: scr(h.x, h.y), uses: h.skills.map((k) => k.uses), names: h.skills.map((k) => k.r.name), mons,
      windup: !!h.windup, traps: g.traps.map((t) => ({ x: t.x, y: t.y, at: scr(t.x, t.y) })), volleys: g.volleys.map((v) => ({ x: v.x, y: v.y, at: scr(v.x, v.y) })), shots: g.projectiles.filter((p) => !p.hostile).length };
  });
  const until = async (pred, ms = 3000) => { for (let t = 0; t < ms; t += 60) { const s = await st(); if (pred(s)) return s; await page.waitForTimeout(60); } return null; };
  /** A point on the right of the screen, on open floor, well away from the hero and from every monster. */
  const rightSpot = (s) => ({ x: Math.round(s.w * 0.84), y: Math.round(s.h * 0.56) });

  // ---- 1. the warrior: an enemy within reach on the LEFT, another far off on the RIGHT ------------
  await room('warrior');
  let s = await st();
  log('screen', `${s.w}x${s.h}: ${s.names.join(', ')}`);
  check('attacks go where the thumb lands unless the player has switched', s.aim === 'tap', `aim is "${s.aim}"`);
  const A = await put(1.3, -1, 0);
  const B = await put(6, 1, 0);
  check('two monsters stood: one at the hero\'s left elbow, one far to the right', A >= 0 && B >= 0, `ids ${A}, ${B}`);
  await page.waitForTimeout(200);
  s = await st();
  let p = rightSpot(s);
  let before = s.uses[0];
  await snap('01_before');
  await tap(p.x, p.y);
  s = await until((q) => q.uses[0] > before, 2000);
  check('a tap on open floor on the right is an attack', !!s);
  await page.waitForTimeout(250);
  s = await st();
  check('and the sword goes for the enemy within reach, on the left, not the one the thumb points toward', s.mons[A].hurt > 0 && s.mons[B].hurt === 0, `left one hurt ${s.mons[A].hurt}, right one ${s.mons[B].hurt}`);
  check('the hero has turned to it', cos(s.fx, s.fy, s.mons[A].x - s.x, s.mons[A].y - s.y) > 0.95, `facing (${s.fx.toFixed(2)}, ${s.fy.toFixed(2)})`);
  check('and has not walked off toward the far one', Math.hypot(s.x - 15, s.y - 15) < 0.6 || s.mons[A].dist < 1.9, `${s.mons[A].dist.toFixed(2)} tiles from the near one`);
  await snap('02_struck_the_near_one');

  // ---- 2. it keeps to the one it is fighting, though another comes nearer ---------------------------
  const C = await put(0.9, 0, 1);
  await page.waitForTimeout(150);
  let hurtA = s.mons[A].hurt;
  for (let i = 0; i < 3; i++) { s = await st(); before = s.uses[0]; await tap(p.x, p.y); await until((q) => q.uses[0] > before, 1500); await page.waitForTimeout(200); }
  s = await st();
  check('three more taps: the same enemy takes them, though another now stands nearer', s.mons[A].hurt > hurtA && s.mons[C].hurt === 0, `first one hurt ${s.mons[A].hurt - hurtA} more, the nearer newcomer ${s.mons[C].hurt}`);

  // ---- 3. HOLD anywhere: the slam lands on the enemies beside the hero, not under the thumb -------
  hurtA = s.mons[A].hurt;
  before = s.uses[1];
  await down(9, p.x, p.y);
  let done = await until((q) => q.uses[1] > before, 2500);
  await up(9);
  await page.waitForTimeout(350);
  s = await st();
  check('a hold on open floor on the right is the slow attack', !!done, done ? done.names[1] : 'not used');
  check('and it lands on the enemies beside the hero (on the left), not under the thumb (on the right)', s.mons[A].hurt > hurtA && s.mons[B].hurt === 0, `left one hurt ${s.mons[A].hurt - hurtA} more, far right one ${s.mons[B].hurt}`);
  await snap('03_slam_on_the_near_ones');

  // ---- 4. nobody in reach: running at a far enemy, the blow waits until the hero is there ---------
  await page.evaluate(([a, c]) => { const g = window.__dbg.game(); for (const m of g.monsters) if (m.id === a || m.id === c) m.dead = true; g.monsters = g.monsters.filter((m) => !m.dead); const h = g.hero; h.x = 15; h.y = 15; }, [A, C]);
  await page.waitForTimeout(600);
  s = await st();
  const dist0 = s.mons[B].dist;
  before = s.uses[0];
  {
    const stick = { x: Math.round(s.w * 0.17), y: Math.round(s.h * 0.62) };
    await down(1, stick.x, stick.y);
    await move(1, stick.x + 26, stick.y); // toward screen-right, where the far one stands
    await page.waitForTimeout(120);
    await tap(p.x, p.y);
    // while still out of reach: no swing at the air
    let early = 0; let looks = 0; let reached = null;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(60);
      const q = await st();
      const out = q.mons[B] && q.mons[B].dist > 2.4;
      if (out) { looks++; if (q.uses[0] > before || q.windup) early++; }
      if (q.uses[0] > before) { reached = q; break; }
    }
    await up(1);
    await page.waitForTimeout(300);
    s = await st();
    check('running at an enemy out of reach, a tap does not swing at the air', looks > 3 && early === 0, `${early} of ${looks} looks while out of reach showed a swing; it began ${dist0.toFixed(1)} tiles off`);
    check('the blow lands when the hero gets there', !!reached && s.mons[B].hurt > 0, reached ? `struck from ${reached.mons[B].dist.toFixed(1)} tiles, hurt ${s.mons[B].hurt}` : 'never struck');
    await snap('04_struck_on_arrival');
  }

  // ---- 5. nobody in reach, left thumb idle: the hero walks to the enemy by himself, as ever -------
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; h.x = 15; h.y = 15; });
  await page.waitForTimeout(600);
  s = await st();
  before = s.uses[0];
  let hurtB = s.mons[B].hurt;
  const far0 = s.mons[B].dist;
  await tap(p.x, p.y);
  done = await until((q) => q.uses[0] > before, 4000);
  await page.waitForTimeout(250);
  s = await st();
  check('with the left thumb idle, the hero walks into reach and strikes, as before', !!done && s.mons[B].hurt > hurtB && s.mons[B].dist < 2.2, `from ${far0.toFixed(1)} tiles to ${s.mons[B].dist.toFixed(1)}`);

  // ---- 6. the mage is as he was: the attack goes at once, wherever the thumb lands -----------------
  // (since Version 12 the staff's quick attack is a wave, which fades after a short way: the enemy
  // stands within its reach)
  await room('mage');
  const M = await put(4, -1, 0);
  await page.waitForTimeout(200);
  s = await st();
  p = rightSpot(s);
  before = s.uses[0];
  const x0 = s.x; const y0 = s.y;
  await tap(p.x, p.y);
  done = await until((q) => q.uses[0] > before, 1200);
  await page.waitForTimeout(700);
  s = await st();
  check('the mage: a tap on the right sends a wave at the enemy on the left, from where he stands', !!done && s.mons[M].hurt > 0 && Math.hypot(s.x - x0, s.y - y0) < 0.3, done ? `hurt ${s.mons[M].hurt}` : 'no wave');
  await snap('05_mage_as_before');

  // ---- 7. the ranger is as he was: a thing that is placed goes where the thumb is (the volley, since Version 12.2) ----
  await room('ranger');
  const R = await put(3, -1, 0);
  await page.waitForTimeout(200);
  s = await st();
  p = { x: Math.round(s.hero.x + 70), y: Math.round(s.hero.y) }; // open floor to the right of the hero, away from the monster
  before = s.uses[1];
  await down(9, p.x, p.y);
  done = await until((q) => q.uses[1] > before, 2500);
  await up(9);
  const tr = await until((q) => q.volleys.length > 0, 1500);
  check('the ranger: a hold looses the volley at where the thumb is, not at the monster', !!tr && R >= 0 && Math.hypot(tr.volleys[0].at.x - p.x, tr.volleys[0].at.y - p.y) < 24, tr ? `it rains ${Math.hypot(tr.volleys[0].at.x - p.x, tr.volleys[0].at.y - p.y).toFixed(0)} px from the thumb` : 'no volley');
  await snap('06_ranger_as_before');

  const missing = await page.evaluate(() => window.__dbg.missing());
  check('every character asked for can be drawn', missing.length === 0, missing.join(' '));
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
