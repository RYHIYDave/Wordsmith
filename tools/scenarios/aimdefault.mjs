// On a phone the game starts out with AUTO AIM (Version 12.2.1). The owner, 4 Oct 2026, 22:26:
// "When playing on mobile, let's put auto-aim as the default setting."
// Run WITHOUT being told a way to aim (AIM=default: see tools/playtest.mjs), as a new player on a
// phone finds the game: OPTIONS says so, a tap on open floor goes for the nearest enemy, and the
// switch goes round from there.
//   AIM=default node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/aimdefault.mjs --out shots/aimdefault
export default async function (page, snap) {
  const cdp = await page.context().newCDPSession(page);
  const client = (gx, gy) => page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [gx, gy]);
  // (a tap is lifted at once: see autoaim.mjs for why)
  const tap = async (gx, gy) => {
    const p = await client(gx, gy);
    const pt = [{ x: Math.round(p.x), y: Math.round(p.y), id: 9 }];
    // (its coming down is not waited for before its going up is sent: the answer itself has taken a third of a second on a busy machine)
    const sent = cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt });
    await page.waitForTimeout(40);
    await Promise.all([sent, cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })]);
  };
  const mark = (name) => page.evaluate((n) => { const r = window.__dbg.ui.marks.get(n); return r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : null; }, name);
  const marks = () => page.evaluate(() => [...window.__dbg.ui.marks.keys()]);
  const log = (label, v) => console.log(label.padEnd(46), typeof v === 'string' ? v : JSON.stringify(v));
  const check = (what, ok, detail = '') => console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`);
  const tapMark = async (name) => {
    const m = await mark(name);
    if (!m) { check(`"${name}" is on screen`, false, (await marks()).join(', ')); return false; }
    await tap(m.x, m.y);
    await page.waitForTimeout(180);
    return true;
  };
  const meta = () => page.evaluate(() => { const m = window.__dbg.meta(); return { aim: m.aim, chosen: m.aimChosen }; });

  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(300);
  let m = await meta();
  log('as the game is first opened on a phone', m);
  check('attacks are aimed for the player: auto aim', m.aim === 'auto');
  check('and that is the game\'s way, not a choice anyone made', m.chosen === false);
  await tapMark('button:OPTIONS');
  await page.waitForTimeout(200);
  check('OPTIONS says so', !!(await mark('button:ATTACKS: AUTO AIM')), (await marks()).filter((n) => n.includes('ATTACKS')).join(', '));
  await snap('01_options');
  await tapMark('button:BACK');

  // a fight: a tap on open floor goes for the nearest enemy, and a ring marks it
  await page.evaluate(() => {
    const d = window.__dbg; d.practice('ranger', 7); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    const h = g.hero;
    for (const [dx, dy] of [[-3.5, -1.5], [-6, 2]]) {
      const k = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(k); k.speed = 0; k.cd = 1e9; k.life = k.maxLife = 1e7;
    }
  });
  await page.waitForTimeout(500);
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const live = g.monsters.filter((k) => !k.dead).map((k) => ({ id: k.id, dist: Math.hypot(k.x - h.x, k.y - h.y), hurt: k.maxLife - k.life }));
    live.sort((a, b) => a.dist - b.dist);
    return { w: d.screen.w, h: d.screen.h, ring: d.renderer.lockId, uses: h.skills.map((k) => k.uses), live, aim: d.meta().aim };
  });
  let s = await st();
  check('in a fight a ring marks the nearest enemy', s.ring === s.live[0].id, `ring on ${s.ring}; the nearest is ${s.live[0].id}`);
  // (the monsters stand to screen-left of the hero: the tap is far from them, on the right)
  await tap(Math.round(s.w * 0.8), Math.round(s.h * 0.45));
  let hit = null;
  for (let t = 0; t < 3000 && !hit; t += 60) { const q = await st(); if (q.live[0].hurt > 0) hit = q; else await page.waitForTimeout(60); }
  check('a tap on open floor, far from every monster, shoots the nearest one', !!hit, hit ? `hurt ${Math.round(hit.live[0].hurt)}` : 'nothing was hurt in three seconds');
  await snap('02_tap_anywhere');

  // the switch goes round from there, and using it is a choice
  await tapMark('button:II');
  await page.waitForTimeout(200);
  await tapMark('button:ATTACKS: AUTO AIM');
  m = await meta();
  check('the switch goes on to where the thumb lands, and that is a choice', m.aim === 'tap' && m.chosen === true, JSON.stringify(m));
  await tapMark('button:ATTACKS: WHERE YOU TAP');
  m = await meta();
  check('then to the way the hero faces', m.aim === 'face', JSON.stringify(m));
  await tapMark('button:ATTACKS: THE WAY YOU FACE');
  m = await meta();
  check('and round to auto aim', m.aim === 'auto' && m.chosen === true, JSON.stringify(m));
  await snap('03_pause');
  await tapMark('button:Resume');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log(`  !! letters the font cannot draw: ${missing.join(' ')}`);
}
