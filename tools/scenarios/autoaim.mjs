// AUTO AIM, the third way of aiming on a phone (Version 12.1.1). The owner, 4 Oct 2026, 21:10: "Can
// you add a third option to the attacks: option which will auto aim everything. So any ability that
// goes where you tap or hold will auto target an enemy".
// Played here with real touches in the practice room, against monsters that stand where they are
// put: a tap and a hold on open floor, far from every monster, must go for the enemy the game
// picked (the nearest one awake and in sight), whatever is in the hero's hand; then the switch in
// the pause menu.
//   CLS=ranger node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/autoaim.mjs --out shots/auto
//   CLS=mage WEAPON=wand ...   (WEAPON: put that weapon on first; otherwise the class's own)
export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const weapon = process.env.WEAPON || '';
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
  // (lifted at once: with four playtests sharing the machine, a touch meant to last 60 ms has
  // been seen to last past the quarter second that makes it a HOLD, and the slow attack was made)
  // (and its coming down is not waited for before its going up is sent: the answer itself has taken that long)
  const tap = async (gx, gy, ms = 40) => { pts.set(9, await client(gx, gy)); const sent = send('touchStart'); await page.waitForTimeout(ms); await Promise.all([sent, up(9)]); };
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
    const live = g.monsters.filter((m) => !m.dead);
    const one = (m) => ({ id: m.id, x: m.x, y: m.y, at: scr(m.x, m.y), dist: Math.hypot(m.x - h.x, m.y - h.y), awake: m.state !== 'sleep', hurt: m.maxLife - m.life });
    const ringed = g.monsters.find((m) => m.id === d.renderer.lockId && !m.dead);
    return {
      w: s.w, h: s.h, aim: d.meta().aim, panel: d.panels.open, x: h.x, y: h.y, fx: h.fx, fy: h.fy, hero: scr(h.x, h.y),
      uses: h.skills.map((k) => k.uses), names: h.skills.map((k) => k.r.name), ids: h.skills.map((k) => k.id), ring: d.renderer.lockId,
      ringed: ringed ? one(ringed) : null, mons: live.map(one),
      shots: g.projectiles.filter((p) => !p.hostile).map((p) => ({ vx: p.vx, vy: p.vy, age: p.age, look: p.look })),
      traps: g.traps.map((t) => ({ x: t.x, y: t.y })), orbs: g.orbs.map((o) => ({ x: o.x, y: o.y })), volleys: g.volleys.map((v) => ({ x: v.x, y: v.y })),
      held: h.channel ? { t: h.channel.t, bites: h.channel.bites } : null, mark: !!d.input.mark,
    };
  });
  const until = async (pred, ms = 4000) => { for (let t = 0; t < ms; t += 60) { const s = await st(); if (pred(s)) return s; await page.waitForTimeout(60); } return null; };
  const cos = (ax, ay, bx, by) => (ax * bx + ay * by) / ((Math.hypot(ax, ay) || 1) * (Math.hypot(bx, by) || 1));
  /** A point on the right of the screen with no monster near it and no interface over it. */
  const openSpot = (s) => {
    const cands = [[0.72, 0.42], [0.82, 0.5], [0.66, 0.62], [0.78, 0.66], [0.88, 0.4], [0.62, 0.34]].map(([a, b]) => ({ x: Math.round(s.w * a), y: Math.round(s.h * b) }));
    let best = cands[0]; let bd = -1;
    for (const p of cands) {
      const d = Math.min(1e9, ...s.mons.map((m) => Math.hypot(m.at.x - p.x, (m.at.y - 12) - p.y)));
      if (d > bd) { bd = d; best = p; }
    }
    return best;
  };
  /** Clear the room and stand monsters in it that never move or strike: [dx, dy] from the hero, in tiles. Returns their ids, in order. */
  const stand = (spots, asleep = []) => page.evaluate(([list, sleepers]) => {
    const g = window.__dbg.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.traps.length = 0; g.orbs.length = 0; g.familiars.length = 0; g.volleys.length = 0;
    return list.map(([dx, dy], i) => {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      if (!sleepers.includes(i)) g.wakeUp(m);
      m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e7;
      return m.id;
    });
  }, [spots, asleep]);
  const ready = () => page.evaluate(() => { const h = window.__dbg.game().hero; for (const k of h.skills) { k.cd = 0; k.charges = k.maxCharges; } h.swingT = 0; h.attackT = 0; h.channel = null; h.mana = h.d.maxMana; });

  // ---- 1. the practice room, the weapon, and the switch ------------------------------------------
  await page.evaluate((c) => { const d = window.__dbg; d.practice(c, 7); d.autoLevel = false; d.autoWords = false; }, cls);
  await page.waitForTimeout(400);
  if (weapon) {
    const ok = await page.evaluate((w) => { const g = window.__dbg.game(); const i = g.hero.bag.findIndex((it) => it && it.weapon === w); return i >= 0 && g.equipFromBag(i) === null; }, weapon);
    check(`the ${cls} puts on the ${weapon}`, ok);
  }
  await stand([]);
  let s = await st();
  log('screen', `${s.w}x${s.h}, ${cls}${weapon ? ` with a ${weapon}` : ''}: ${s.names.join(', ')}`);
  // (it is where a phone starts out, since Version 12.2.1; the playtests are started in the way
  // they were written for unless told otherwise: AIM, in tools/playtest.mjs)
  log('the way the playtest began in', s.aim);
  await page.evaluate(() => window.__dbg.setAim('auto'));
  await page.waitForTimeout(150);
  s = await st();
  check('switched on: AUTO AIM', s.aim === 'auto', `aim is "${s.aim}"`);
  const quick = s.ids[0];
  const slow = s.ids[1];

  // ---- 2. which enemy: the nearest one awake --------------------------------------------------------
  // (up the screen and to the left of the hero: nowhere near where the right thumb will land.
  // That a sleeper is left alone is in the unit tests: here one this near would wake at once.)
  let ids = await stand([[-3.2, -1.2], [-5.5, 2.5]]);
  await page.waitForTimeout(250);
  // (the ring is put on when the game next looks for whom to aim at: a quarter of a second is
  // long enough for that unless the machine is busy. Version 14.1's regression: no ring yet.)
  s = (await until((z) => z.ring !== null, 2500)) || (await st());
  check('a ring marks the nearest enemy that is awake', s.ring === ids[0], `ring on ${s.ring}; the near one is ${ids[0]}, the far one ${ids[1]}`);
  await snap('01_ring');

  // ---- 3. TAP on open floor: the quick attack goes for it ---------------------------------------------
  let p = openSpot(s);
  let before = s.uses[0];
  const near = s.mons.find((m) => m.id === ids[0]);
  await tap(p.x, p.y);
  let q = await until((z) => z.uses[0] > before, 3500);
  check('a tap on open floor, away from every monster, is the quick attack', !!q, q ? `${q.names[0]}` : 'not made in three and a half seconds');
  if (q) {
    const toThumb = { x: p.x - s.hero.x, y: p.y - s.hero.y };
    log('  the thumb landed', `${Math.round(toThumb.x)}, ${Math.round(toThumb.y)} px from the hero; the enemy is at ${Math.round(near.at.x - s.hero.x)}, ${Math.round(near.at.y - s.hero.y)}`);
    if (quick === 'shot' || quick === 'wave') {
      const sh = [...q.shots].sort((a, b) => a.age - b.age)[0];
      // (the enemy stands three steps off, a fifth of a second's flight: with four playtests on the
      // machine the look at the game can come after the arrow has landed. Then nothing is in flight,
      // and what shows where it went is the enemy it hurt: the thumb was on the other side of the hero.
      // Version 14.1's regression.)
      const struck = sh ? null : await until((z) => (z.mons.find((m) => m.id === ids[0]) || { hurt: 0 }).hurt > 0, 1200);
      check('and it flies at the enemy, not at the thumb', sh ? cos(sh.vx, sh.vy, near.x - q.x, near.y - q.y) > 0.95 : !!struck, sh ? `it flies (${sh.vx.toFixed(1)}, ${sh.vy.toFixed(1)}); the enemy is at (${(near.x - q.x).toFixed(1)}, ${(near.y - q.y).toFixed(1)})` : struck ? 'it had landed on the enemy before it could be seen in flight' : 'nothing in flight, and the enemy unhurt');
    } else if (quick === 'strike') {
      const hit = await until((z) => (z.mons.find((m) => m.id === ids[0]) || { hurt: 0 }).hurt > 0, 3500);
      check('the hero walks to the enemy and the blade lands on it', !!hit, hit ? `the hero is ${hit.mons.find((m) => m.id === ids[0]).dist.toFixed(1)} tiles from it` : 'it was not hurt');
    } else {
      check('the hero is turned toward the enemy as it is made', cos(q.fx, q.fy, near.x - q.x, near.y - q.y) > 0.9, `facing (${q.fx.toFixed(2)}, ${q.fy.toFixed(2)})`);
    }
  }
  await snap('02_tap_anywhere');

  // ---- 4. HOLD on open floor: the slow attack goes for it -----------------------------------------------
  await ready();
  ids = await stand([[-3.2, -1.2], [-5.5, 2.5]]);
  await page.waitForTimeout(250);
  s = await st();
  p = openSpot(s);
  before = s.uses[1];
  const tgt = s.mons.find((m) => m.id === ids[0]);
  await down(9, p.x, p.y);
  q = await until((z) => z.uses[1] > before, 2500);
  check('a hold on open floor is the slow attack', !!q, q ? `${q.names[1]}` : 'not made in two and a half seconds');
  if (q && slow === 'beam') {
    // it burns toward the enemy for as long as the thumb is down, wherever the thumb goes
    await page.waitForTimeout(350);
    let z = await st();
    check('the beam is held', !!z.held && z.held.bites >= 2, z.held ? `${z.held.bites} bites` : 'not held');
    check('and it burns toward the enemy, not toward the thumb', cos(z.fx, z.fy, tgt.x - z.x, tgt.y - z.y) > 0.98, `the hero faces (${z.fx.toFixed(2)}, ${z.fy.toFixed(2)}); the enemy is at (${(tgt.x - z.x).toFixed(1)}, ${(tgt.y - z.y).toFixed(1)})`);
    await move(9, p.x - 10, p.y + 60);
    await move(9, p.x - 30, p.y + 90);
    await page.waitForTimeout(250);
    z = await st();
    check('sliding the thumb does not pull it off the enemy', !!z.held && cos(z.fx, z.fy, tgt.x - z.x, tgt.y - z.y) > 0.98, `the hero faces (${z.fx.toFixed(2)}, ${z.fy.toFixed(2)})`);
    await snap('03_hold_beam');
    // the enemy falls: the beam goes on to the next
    await page.evaluate((id) => { const g = window.__dbg.game(); const m = g.monsters.find((k) => k.id === id); if (m) m.dead = true; }, ids[0]);
    await page.waitForTimeout(300);
    z = await st();
    const next = z.mons.find((m) => m.id === ids[1]);
    check('when that enemy falls, the beam goes on to the next', !!z.held && !!next && cos(z.fx, z.fy, next.x - z.x, next.y - z.y) > 0.97, z.held ? `the hero faces (${z.fx.toFixed(2)}, ${z.fy.toFixed(2)}); the next is at (${(next.x - z.x).toFixed(1)}, ${(next.y - z.y).toFixed(1)})` : 'the beam ended');
    await up(9);
    z = await until((k) => !k.held, 1500);
    check('and letting go ends it', !!z);
  } else if (q && slow === 'whirlwind') {
    await page.waitForTimeout(500);
    const z = await st();
    check('the whirlwind goes on for as long as the thumb is down', !!z.held && z.held.bites >= 2, z.held ? `${z.held.bites} cuts` : 'not held');
    await snap('03_hold_whirlwind');
    await up(9);
    check('and letting go ends it', !!(await until((k) => !k.held, 1500)));
  } else if (q) {
    await up(9);
    if (slow === 'orb') {
      const z = await until((k) => k.orbs.length > 0, 1500);
      const o = z ? z.orbs[z.orbs.length - 1] : null;
      check('the orb is set on the enemy, not under the thumb', !!o && Math.hypot(o.x - tgt.x, o.y - tgt.y) < 0.6, o ? `${Math.hypot(o.x - tgt.x, o.y - tgt.y).toFixed(2)} tiles from it` : 'no orb');
    } else if (slow === 'volley') {
      const z = await until((k) => k.volleys.length > 0, 1500);
      const v = z ? z.volleys[z.volleys.length - 1] : null;
      check('the volley rains on the enemy, not on where the thumb is', !!v && Math.hypot(v.x - tgt.x, v.y - tgt.y) < 0.6, v ? `${Math.hypot(v.x - tgt.x, v.y - tgt.y).toFixed(2)} tiles from it` : 'no volley');
      const hit = await until((k) => (k.mons.find((m) => m.id === ids[0]) || { hurt: 0 }).hurt > 0, 4000);
      check('and its arrows land on it', !!hit);
    } else if (slow === 'slam') {
      check('the hero is turned toward the enemy as it lands', cos(q.fx, q.fy, tgt.x - q.x, tgt.y - q.y) > 0.9, `facing (${q.fx.toFixed(2)}, ${q.fy.toFixed(2)})`);
    }
    await snap('03_hold_anywhere');
  } else await up(9);

  // ---- 5. the hero is not turned for the player: they walk and face as the left thumb says ----------------
  await ready();
  ids = await stand([[-4, -1.5], [-6, 2]]);
  await page.waitForTimeout(250);
  s = await st();
  {
    const e = s.mons.find((m) => m.id === ids[0]);
    const ax = s.hero.x - e.at.x; const ay = s.hero.y - e.at.y; const al = Math.hypot(ax, ay) || 1;
    const stick = { x: Math.round(s.w * 0.17), y: Math.round(s.h * 0.62) };
    await down(1, stick.x, stick.y);
    await move(1, stick.x + (ax / al) * 26, stick.y + (ay / al) * 26);
    await page.waitForTimeout(450);
    let z = await st();
    check('walking away from the enemy, the hero faces the way they walk', cos(z.fx, z.fy, e.x - z.x, e.y - z.y) < -0.5, `facing (${z.fx.toFixed(2)}, ${z.fy.toFixed(2)}); the enemy is at (${(e.x - z.x).toFixed(1)}, ${(e.y - z.y).toFixed(1)})`);
    check('and the ring stays on the enemy', z.ring === ids[0]);
    // a tap while walking away: the attack still goes for it
    before = z.uses[0];
    p = openSpot(z);
    await tap(p.x, p.y);
    z = await until((k) => k.uses[0] > before, 2500);
    if (quick !== 'strike') check('a tap while walking away still goes for the enemy', !!z, z ? '' : 'no attack');
    await up(1);
    await snap('04_walking_away');
  }

  // ---- 6. a touch right on another monster is an attack, and does not change the aim ---------------------
  await ready();
  ids = await stand([[-3, -1], [3.5, -2.5]]);
  await page.waitForTimeout(250);
  s = await st();
  {
    const other = s.mons.find((m) => m.id === ids[1]);
    before = s.uses[0];
    await tap(other.at.x, other.at.y - 10);
    const z = await until((k) => k.uses[0] > before, 3000);
    check('a touch right on a monster is an attack', !!z);
    const now = await st();
    check('and the aim stays on the nearest enemy: where the thumb lands does not matter', now.ring === ids[0], `ring on ${now.ring}; the nearest is ${ids[0]}, the one touched ${ids[1]}`);
  }

  // ---- 7. nothing to aim at: the way the hero faces --------------------------------------------------------
  await ready();
  await stand([]);
  await page.waitForTimeout(200);
  s = await st();
  check('with nothing awake, there is no ring', s.ring === null);
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
    await tap(Math.round(s.w * 0.7), Math.round(s.h * 0.2));
    const z = await until((k) => k.uses[0] > before, 1500);
    check('with nothing to aim at, a tap is still an attack', !!z);
    if (z) check('and it goes the way the hero was facing, not toward the thumb', cos(z.fx, z.fy, f.x, f.y) > 0.98, `facing (${z.fx.toFixed(2)}, ${z.fy.toFixed(2)}), was (${f.x.toFixed(2)}, ${f.y.toFixed(2)})`);
  }

  // ---- 8. the switch: the pause menu, round all three ---------------------------------------------------------
  await tapMark('button:II');
  await page.waitForTimeout(200);
  s = await st();
  check('the pause menu opens', s.panel === 'pause', `open: ${s.panel}`);
  check('it has the switch, and says AUTO AIM is on', !!(await mark('button:ATTACKS: AUTO AIM')));
  for (const name of await marks()) if (name.startsWith('button:')) { const m = await mark(name); if (m.top < 0 || m.bottom > s.h) check(`"${name}" is on the screen`, false, `${m.top}..${m.bottom} of ${s.h}`); }
  await snap('05_pause');
  await tapMark('button:ATTACKS: AUTO AIM');
  s = await st();
  check('pressing it goes on to where the thumb lands', s.aim === 'tap' && !!(await mark('button:ATTACKS: WHERE YOU TAP')), `aim is "${s.aim}"`);
  await tapMark('button:ATTACKS: WHERE YOU TAP');
  s = await st();
  check('then to the way the hero faces', s.aim === 'face' && !!(await mark('button:ATTACKS: THE WAY YOU FACE')), `aim is "${s.aim}"`);
  await tapMark('button:ATTACKS: THE WAY YOU FACE');
  s = await st();
  check('and round to AUTO AIM again', s.aim === 'auto' && !!(await mark('button:ATTACKS: AUTO AIM')), `aim is "${s.aim}"`);
  await tapMark('button:Resume');
  await page.waitForTimeout(200);
  // (the choice is the device's: put it back, so that whatever runs after this starts the usual way)
  await page.evaluate(() => window.__dbg.setAim('tap'));

  const missing = await page.evaluate(() => window.__dbg.missing());
  check('every character asked for can be drawn', missing.length === 0, missing.join(' '));
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
