// Version 12: any weapon on any character. The weapon gives BOTH attacks, the character keeps the
// swipe. And the attacks that came with it: WAVE and ORB (the staff's), FAMILIAR and BEAM (the wand's).
// The owner, 4 Oct 2026: "I need all weapons to be able to be equipped on all characters ...
// Remember that the tap attack is dictated by the weapon"; "Let's have both skills change with the
// weapon ... the dodge being unique is enough for now"; "I want keep familiar and orb and beam but
// the original ideas for the skill's properties"; "Let's get a different skill for staff on Tap"
// ... "Let's try wave". And Version 12.1's two attacks that go on while they are held: the BEAM
// ("Fires towards your finger and stops when you release. You can move the beam around ...") and
// the two-handed sword's WHIRLWIND ("a channel that passes through like the Bull stampede").
// And Version 12.2's: the bow's hold is VOLLEY and the ranger's swipe lays the TRAP ("Let's move the
// trap on ranger to the tumble. When you tumble you lay a trap, then let's add VOLLEY as the hold.
// Target an area and the ranger fires a bunch of arrows straight up, then they rain down into the
// targeted area for a duration"; "Let's just call tumble trap from now on. You'll still tumble and
// lay a trap down, and it will still be a dodge, but we'll name it trap").
// Played in the practice room with a real mouse (or real touches), monsters stood where the test
// wants them.
//   node tools/playtest.mjs --scenario tools/scenarios/spells.mjs --out shots/spells
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/spells.mjs --out shots/spells_phone
import { makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = await page.evaluate(() => window.__dbg.screen.touch);
  const log = (label, v) => console.log(label.padEnd(46), typeof v === 'string' ? v : JSON.stringify(v));
  const check = (what, ok, detail = '') => console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`);
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const client = (gx, gy) => page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [gx, gy]);

  /** A fresh practice room for a class, with nothing in it; the hero in the middle. */
  const room = async (cls) => {
    await page.evaluate((c) => {
      const d = window.__dbg; d.practice(c, 7); d.autoLevel = false; d.autoWords = false; d.slowmo = 1;
      const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    }, cls);
    await page.waitForTimeout(350);
  };
  /** Stand a monster `dist` tiles from the hero toward screen-right (+1) or -left, up the screen or down it. It is awake, stands still, never strikes. */
  const put = (dist, sx, sy, life = 1e6, name = 'skeleton', walks = false) => page.evaluate(([dist, sx, sy, life, name, walks]) => {
    const g = window.__dbg.game(); const h = g.hero;
    const ux = (sx + sy) * Math.SQRT1_2; const uy = (-sx + sy) * Math.SQRT1_2; const ul = Math.hypot(ux, uy) || 1;
    for (const r of [dist, dist + 0.3, dist - 0.3, dist + 0.6]) {
      const x = h.x + (ux / ul) * r; const y = h.y + (uy / ul) * r;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1 || !g.sees(h.x, h.y, x, y)) continue;
      const m = g.spawn(name, x, y, 1, 0, false, g.rng);
      g.wakeUp(m); if (!walks) m.speed = 0; m.cd = 1e9; m.life = m.maxLife = life;
      return m.id;
    }
    return -1;
  }, [dist, sx, sy, life, name, walks]);
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const c = d.cam();
    const scr = (x, y) => ({ x: c.ox + (x - y) * 16, y: c.oy + (x + y) * 8 });
    const mons = {};
    for (const m of g.monsters) if (!m.dead) mons[m.id] = { x: m.x, y: m.y, hurt: Math.round(m.maxLife - m.life), at: scr(m.x, m.y) };
    return {
      w: d.screen.w, h: d.screen.h, hero: scr(h.x, h.y), x: h.x, y: h.y, fx: h.fx, fy: h.fy,
      ids: h.skills.map((k) => k.id), names: h.skills.map((k) => k.r.name), uses: h.skills.map((k) => k.uses), charges: h.skills.map((k) => k.charges),
      weapon: h.gear.mainhand ? h.gear.mainhand.weapon : null, off: h.gear.offhand ? h.gear.offhand.offhand : null,
      windup: h.windup ? { skill: h.windup.skill, t: h.windup.t } : null,
      channel: h.channel ? { skill: h.channel.skill, t: +h.channel.t.toFixed(2), bites: h.channel.bites } : null,
      orbs: g.orbs.map((o) => ({ x: o.x, y: o.y, waves: o.waves, t: +o.t.toFixed(2), at: scr(o.x, o.y) })),
      familiars: g.familiars.map((q) => ({ seat: q.seat, t: +q.t.toFixed(2), echo: q.echo })),
      volleys: g.volleys.map((v) => ({ x: v.x, y: v.y, r: v.r, n: v.n, total: v.total, t: +v.t.toFixed(2), at: scr(v.x, v.y) })),
      traps: g.traps.map((t) => ({ x: t.x, y: t.y, armed: t.arm <= 0, at: scr(t.x, t.y) })),
      rolling: !!h.move && h.move.kind === 'roll', safe: h.invuln > 0,
      shots: g.projectiles.filter((p) => !p.hostile).length, waves: g.projectiles.filter((p) => !p.hostile && p.look === 'wave').length, mons,
      bag: h.bag.map((it) => (it ? it.weapon ?? it.offhand ?? it.slot : null)),
    };
  });
  const until = async (pred, ms = 3000) => { for (let t = 0; t < ms; t += 50) { const s = await st(); if (pred(s)) return s; await page.waitForTimeout(50); } return null; };
  /** The quick attack at a point on screen: the left button held a moment, or a tap. */
  const quick = async (gx, gy) => {
    if (cdp) { await hands.pressAt(gx, gy); return; }
    const p = await client(gx, gy);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.waitForTimeout(130);
    await page.mouse.up();
    await page.waitForTimeout(60);
  };
  /** The slow attack: a right click, or a thumb held down. */
  const slow = async (gx, gy) => {
    if (!cdp) { await hands.pressAt(gx, gy, 2); return; }
    const p = await client(gx, gy);
    const pt = [{ x: Math.round(p.x), y: Math.round(p.y), id: 5 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt });
    await page.waitForTimeout(520);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(100);
  };
  /**
   * The slow attack held down: the right button, or the right thumb. Returns { move, up }: `move`
   * slides the pointer or the thumb to another place on the screen while it stays down, `up` lets go.
   */
  const holdDown = async (gx, gy) => {
    const p = await client(gx, gy);
    if (!cdp) {
      await page.mouse.move(p.x, p.y);
      await page.mouse.down({ button: 'right' });
      return {
        move: async (x, y) => { const q = await client(x, y); await page.mouse.move(q.x, q.y, { steps: 6 }); },
        up: async () => { await page.mouse.up({ button: 'right' }); await page.waitForTimeout(80); },
      };
    }
    let at = { x: Math.round(p.x), y: Math.round(p.y) };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...at, id: 5 }] });
    return {
      move: async (x, y) => {
        const q = await client(x, y);
        const to = { x: Math.round(q.x), y: Math.round(q.y) };
        for (let k = 1; k <= 6; k++) {
          const mid = { x: Math.round(at.x + ((to.x - at.x) * k) / 6), y: Math.round(at.y + ((to.y - at.y) * k) / 6) };
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...mid, id: 5 }] });
          await page.waitForTimeout(30);
        }
        at = to;
      },
      up: async () => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(100); },
    };
  };
  /** Put on the first thing in the bag of that kind (a weapon kind, or an off-hand kind). */
  const wear = (kind) => page.evaluate((kind) => {
    const g = window.__dbg.game(); const h = g.hero;
    const i = h.bag.findIndex((it) => it && (it.weapon === kind || it.offhand === kind));
    if (i < 0) return `no ${kind} in the bag`;
    return g.equipFromBag(i);
  }, kind);
  const slowmo = (n) => page.evaluate((n) => { window.__dbg.slowmo = n; }, n);
  /** The evasive move, toward screen-right (+1, 0), up the screen (0, -1) and so on: a swipe of the right thumb, or Space with the pointer that way. */
  const swipe = async (s, dx, dy) => {
    if (cdp) {
      // (every point of it is a place on the GAME's screen, turned into a place on the glass: a
      // phone held upright shows the game turned, and "screen-right" is then down the glass)
      // (and all of it is sent at once: see flickAt in lib.mjs)
      await hands.flickAt(Math.round(s.w * 0.66), Math.round(s.h * 0.55), dx * 42, dy * 42);
    } else {
      const p = await client(s.hero.x + dx * 80, s.hero.y + dy * 80);
      await page.mouse.move(p.x, p.y);
      await page.keyboard.press('Space');
    }
    await page.waitForTimeout(120);
  };

  // ---- 1. the mage: the staff gives WAVE on the tap and ORB on the hold ----------------------------
  await room('mage');
  let s = await st();
  log('screen', `${s.w}x${s.h}, ${touch ? 'fingers' : 'mouse'}`);
  log('a mage, as they begin', `${s.weapon}: ${s.names.join(', ')}`);
  check('the mage carries a staff', s.weapon === 'staff');
  check('the staff gives WAVE and ORB, the mage keeps WARP', s.ids.join() === 'wave,orb,warp', s.ids.join());
  check('every other weapon is in the practice bag', ['sword', 'greatsword', 'bow', 'wand'].every((k) => s.bag.includes(k)), s.bag.filter(Boolean).join(' '));
  const A = await put(3, 1, 0);
  const A2 = await put(4.6, 1, 0);
  const B = await put(4.4, 1, 0.5);
  const C = await put(4.5, -1, 0.3);
  await page.waitForTimeout(200);
  s = await st();
  await snap('01_mage_before');

  // WAVE (slowly, so that it can be photographed on its way)
  await slowmo(0.125);
  await quick(s.mons[A].at.x, s.mons[A].at.y - 10);
  // (the game is running at an eighth of its speed here, and slower still when four playtests
  // share the machine: four seconds were not always enough for the wave's wind-up to pass)
  s = await until((q) => q.waves === 1, 10000);
  check('a tap sends a wave', !!s);
  await page.waitForTimeout(900);
  await snap('02_wave');
  s = await until((q) => q.mons[A].hurt > 0 && q.mons[A2].hurt > 0, 8000);
  check('it goes through the first enemy and hits the one behind', !!s, s ? `hurt ${s.mons[A].hurt}, ${s.mons[A2].hurt}` : JSON.stringify((await st()).mons));
  await snap('03_wave_through');
  await slowmo(1);
  s = await until((q) => q.waves === 0, 3000);
  check('and it is gone after a short way', !!s);
  s = await st();
  check('it does not turn back for what stands behind the mage', s.mons[C].hurt === 0, `hurt ${s.mons[C].hurt}`);

  // ORB
  const hurtA = s.mons[A].hurt;
  await slow(s.mons[A].at.x, s.mons[A].at.y - 10);
  s = await until((q) => q.orbs.length === 1, 2000);
  check('a hold sets an orb down', !!s);
  if (s) {
    const o = s.orbs[0];
    check('the orb is where the enemy stands', Math.hypot(o.x - s.mons[A].x, o.y - s.mons[A].y) < 0.6, `${Math.hypot(o.x - s.mons[A].x, o.y - s.mons[A].y).toFixed(2)} tiles off`);
    check('it sends out a wave as it lands', s.mons[A].hurt > hurtA && s.mons[B].hurt > 0, `hurt ${s.mons[A].hurt}, ${s.mons[B].hurt}`);
    check('its waves do not reach across the room', s.mons[C].hurt === 0, `hurt ${s.mons[C].hurt}`);
    check('and then the orb waits to be ready again', s.charges[1] === 0, `charges ${s.charges[1]}`);
  }
  await page.waitForTimeout(120);
  await snap('04_orb_set');
  const hurt0 = s ? s.mons[A].hurt : 0;
  await page.waitForTimeout(800);
  await snap('05_orb_gathering');
  s = await until((q) => q.orbs.length === 1 && q.orbs[0].waves >= 3, 3500);
  check('it goes on sending out waves by itself', !!s && s.mons[A].hurt > hurt0, s ? `waves ${s.orbs[0].waves}, hurt ${s.mons[A].hurt}` : 'no third wave');
  await snap('06_orb_wave');
  // asked for again while it waits: nothing more is set
  s = await st();
  await slow(s.mons[C].at.x, s.mons[C].at.y - 10);
  await page.waitForTimeout(300);
  s = await st();
  check('a second hold while it waits sets nothing', s.orbs.length <= 1 && s.mons[C].hurt === 0, `${s.orbs.length} orbs`);
  s = await until((q) => q.orbs.length === 0, 7000);
  check('left alone, the orb goes when its time is up', !!s);

  // ---- 2. the wand gives FAMILIAR on the tap and BEAM on the hold -----------------------------------
  let why = await wear('wand');
  s = await st();
  check('the mage puts on a wand', why === null && s.weapon === 'wand', `${why}`);
  check('the wand gives FAMILIAR and BEAM; WARP stays', s.ids.join() === 'familiar,beam,warp', s.ids.join());
  why = await wear('focus');
  s = await st();
  check('a focus goes with it', why === null && s.off === 'focus', `${why}`);
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; for (const k of h.skills) { k.charges = k.maxCharges; k.cd = 0; } });

  // FAMILIAR
  s = await st();
  await quick(s.mons[A].at.x, s.mons[A].at.y - 10);
  s = await until((q) => q.familiars.length === 1, 1500);
  check('a tap calls a familiar', !!s);
  const before = (await st()).mons[A].hurt;
  s = await until((q) => q.shots > 0, 2000);
  check('it shoots', !!s);
  await snap('07_familiar_shoots');
  s = await until((q) => q.mons[A].hurt > before, 2500);
  check('its bolts hurt', !!s);
  s = await st();
  check('the tap waits to be ready again', s.charges[0] === 0, `charges ${s.charges[0]}`);
  // keep tapping: the cooldown is shorter than a familiar's time, so two are out together, and never more than three
  let most = 1;
  for (let k = 0; k < 9; k++) {
    s = await st();
    await quick(s.mons[A].at.x, s.mons[A].at.y - 10);
    await page.waitForTimeout(900);
    most = Math.max(most, (await st()).familiars.length);
    if (k === 3) await snap('08_familiars');
  }
  log('most familiars out at once', `${most}`);
  check('two are out together, and never more than three', most >= 2 && most <= 3, `${most}`);

  // BEAM: held, it burns through three in a row; swept, it turns to a fourth
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.familiars.length = 0; g.projectiles.length = 0; for (const k of g.hero.skills) { k.charges = k.maxCharges; k.cd = 0; } });
  const L1 = await put(2.5, 1, 0);
  const L2 = await put(4.5, 1, 0);
  const L3 = await put(6.5, 1, 0);
  const Up = await put(4, 0, -1);
  await page.waitForTimeout(200);
  s = await st();
  const usedBefore = s.uses[1];
  // (slowly, so that the beam can be photographed, and so that there is time to sweep it)
  await slowmo(0.2);
  const beam = await holdDown(s.mons[L2].at.x, s.mons[L2].at.y - 10);
  s = await until((q) => q.channel && q.channel.skill === 1 && q.channel.bites >= 2, 6000);
  check('a hold begins the beam, and it goes on while the button is held', !!s && s.uses[1] === usedBefore + 1, s ? JSON.stringify(s.channel) : 'no beam');
  await snap('09_beam');
  s = await st();
  check('it burns through everything along it', s.mons[L1].hurt > 0 && s.mons[L2].hurt > 0 && s.mons[L3].hurt > 0, `${s.mons[L1].hurt}, ${s.mons[L2].hurt}, ${s.mons[L3].hurt}`);
  check('and nothing off it', s.mons[Up].hurt === 0, `${s.mons[Up].hurt}`);
  // sweep it round to the one that stands up the screen
  await beam.move(s.mons[Up].at.x, s.mons[Up].at.y - 4);
  const wasL2 = (await st()).mons[L2].hurt;
  s = await until((q) => q.mons[Up].hurt > 0, 5000);
  check('swept round with the button still down, it burns what it now points at', !!s, s ? `hurt ${s.mons[Up].hurt}` : JSON.stringify((await st()).channel));
  await snap('10_beam_swept');
  s = await st();
  check('and it is still the one beam', s.uses[1] === usedBefore + 1 && !!s.channel, `uses ${s.uses[1]}`);
  check('what it has left behind is hurt no more', s.mons[L2].hurt <= wasL2 + 1, `${wasL2} -> ${s.mons[L2].hurt}`);
  await beam.up();
  s = await until((q) => !q.channel, 3000);
  check('let go, it stops', !!s);
  await page.waitForTimeout(300);
  await snap('11_beam_gone');
  await slowmo(1);
  await page.waitForTimeout(150);
  s = await st();
  check('and then it waits to be ready again', s.charges[1] === 0, `charges ${s.charges[1]}`);

  // ---- 2b. the two-handed sword: WHIRLWIND on the hold ------------------------------------------------
  await room('warrior');
  s = await st();
  check('the warrior carries the two-handed sword: Strike and Whirlwind', s.weapon === 'greatsword' && s.ids.join() === 'strike,whirlwind,leap', `${s.weapon}: ${s.ids.join()}`);
  const Wa = await put(1.5, 1, 0);
  const Wb = await put(1.5, -1, 0);
  const Wc = await put(4.5, 1, 0);
  await page.waitForTimeout(200);
  s = await st();
  await slowmo(0.2);
  const whirl = await holdDown(s.hero.x + 40, s.hero.y - 20);
  s = await until((q) => q.channel && q.channel.bites >= 3, 8000);
  check('a hold spins the warrior, cutting again and again', !!s, s ? JSON.stringify(s.channel) : 'no whirlwind');
  await snap('12_whirlwind');
  await page.waitForTimeout(400);
  await snap('12b_whirlwind');
  s = await st();
  check('everything round the warrior is cut, in front and behind', s.mons[Wa].hurt > 0 && s.mons[Wb].hurt > 0, `${s.mons[Wa].hurt}, ${s.mons[Wb].hurt}`);
  check('and nothing out of reach', s.mons[Wc].hurt === 0, `${s.mons[Wc].hurt}`);
  await whirl.up();
  s = await until((q) => !q.channel, 3000);
  check('let go, it stops', !!s);
  await slowmo(1);
  await page.waitForTimeout(150);
  s = await st();
  check('and then it waits to be ready again', s.charges[1] === 0 && s.uses[1] === 1, `charges ${s.charges[1]}, uses ${s.uses[1]}`);

  // ---- 2c. the bow: VOLLEY on the hold; and the ranger's swipe is TRAP --------------------------------
  await room('ranger');
  s = await st();
  check('the ranger carries a bow: Shot and Volley, and the swipe is Trap', s.weapon === 'bow' && s.ids.join() === 'shot,volley,trap', `${s.weapon}: ${s.ids.join()}`);
  check('the swipe holds two charges', s.charges[2] === 2, `charges ${s.charges[2]}`);
  const V1 = await put(5, 1, 0);
  const V2 = await put(5.9, 1, 0.25);
  const V3 = await put(4.5, -1, 0);
  await page.waitForTimeout(200);
  s = await st();
  // (slowly, so that the arrows can be photographed going up and coming down)
  await slowmo(0.25);
  await slow(s.mons[V1].at.x, s.mons[V1].at.y - 4);
  s = await until((q) => q.volleys.length === 1, 5000);
  check('a hold looses a volley at the sky', !!s && s.uses[1] === 1, s ? JSON.stringify(s.volleys[0]) : 'no volley');
  if (s) {
    const v = s.volleys[0];
    check('its patch is where the enemy stands', Math.hypot(v.x - s.mons[V1].x, v.y - s.mons[V1].y) < 0.7, `${Math.hypot(v.x - s.mons[V1].x, v.y - s.mons[V1].y).toFixed(2)} tiles off`);
    check('nothing is hurt while the arrows are still in the air', v.n > 0 || s.mons[V1].hurt === 0, `hurt ${s.mons[V1].hurt} after ${v.n} arrows`);
    check('and then the volley waits to be ready again', s.charges[1] === 0, `charges ${s.charges[1]}`);
  }
  await page.waitForTimeout(500);
  await snap('15_volley_loosed');
  s = await until((q) => q.volleys.length === 1 && q.volleys[0].n >= 2, 8000);
  check('the arrows come down one after another', !!s, s ? `${s.volleys[0].n} of ${s.volleys[0].total}` : 'none fell');
  await snap('16_volley_rain');
  s = await until((q) => q.mons[V1].hurt > 0, 12000);
  const firstHit = s ? s.mons[V1].hurt : 0;
  check('an arrow that lands on an enemy hurts it', !!s, s ? `hurt ${firstHit}` : JSON.stringify((await st()).mons));
  await snap('17_volley_hits');
  await slowmo(1);
  s = await until((q) => q.volleys.length === 0, 6000);
  check('it rains for a few seconds and then stops', !!s);
  await page.waitForTimeout(250);
  s = await st();
  check('what stood in the patch was hit more than once', s.mons[V1].hurt > firstHit, `${firstHit} -> ${s.mons[V1].hurt}`);
  check('the one beside it in the patch was hit too', s.mons[V2].hurt > 0, `hurt ${s.mons[V2].hurt}`);
  check('and nothing outside the patch', s.mons[V3].hurt === 0, `hurt ${s.mons[V3].hurt}`);
  await snap('18_volley_after');

  // TRAP: the swipe is a roll that nothing can hit, and a trap is left where the ranger stood
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.volleys.length = 0; g.traps.length = 0; g.projectiles.length = 0; for (const k of g.hero.skills) { k.charges = k.maxCharges; k.cd = 0; } });
  await page.waitForTimeout(200);
  s = await st();
  const stood = { x: s.x, y: s.y };
  // (it comes for the ranger from screen-left, and cannot strike)
  const T1 = await put(4, -1, 0, 1e6, 'skeleton', true);
  await page.waitForTimeout(100);
  s = await st();
  await swipe(s, 1, 0);
  s = await until((q) => q.traps.length === 1, 1500);
  check('a swipe lays a trap', !!s && s.uses[2] === 1, s ? JSON.stringify(s.traps) : `${(await st()).traps.length} traps`);
  if (s) {
    check('the trap is where the ranger stood', Math.hypot(s.traps[0].x - stood.x, s.traps[0].y - stood.y) < 0.3, `${Math.hypot(s.traps[0].x - stood.x, s.traps[0].y - stood.y).toFixed(2)} tiles off`);
    check('nothing can hit the ranger while they roll', s.safe || !s.rolling, `rolling ${s.rolling}, safe ${s.safe}`);
  }
  await snap('19_trap_roll');
  s = await until((q) => !q.rolling, 1500);
  s = await st();
  const rolled = Math.hypot(s.x - stood.x, s.y - stood.y);
  check('the roll carries the ranger away, toward screen-right', rolled > 2 && (s.x - s.y) - (stood.x - stood.y) > 2, `${rolled.toFixed(2)} tiles`);
  check('one charge is left', s.charges[2] === 1, `charges ${s.charges[2]}`);
  await snap('20_trap_set');
  s = await until((q) => q.traps.length === 0 && q.mons[T1] && q.mons[T1].hurt > 0, 8000);
  check('what follows steps on it, and it bursts', !!s, s ? `hurt ${s.mons[T1].hurt}` : JSON.stringify(await st().then((q) => ({ traps: q.traps, mon: q.mons[T1] }))));
  await page.waitForTimeout(120);
  await snap('21_trap_burst');
  // the second charge: another roll, another trap; and with none left, a swipe does nothing
  // (with nothing left alive to set the trap off: this is about the charges)
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.traps.length = 0; });
  await page.waitForTimeout(120);
  s = await st();
  await swipe(s, 0, -1);
  s = await until((q) => q.uses[2] === 2 && !q.rolling, 2500);
  check('the second charge is another roll and another trap', !!s && s.traps.length === 1 && s.charges[2] === 0, s ? `${s.traps.length} traps, charges ${s.charges[2]}` : 'no second roll');
  s = await st();
  const usedUp = s.uses[2];
  await swipe(s, 0, 1);
  await page.waitForTimeout(350);
  s = await st();
  check('with no charge left a swipe does nothing', s.uses[2] === usedUp && s.traps.length === 1, `uses ${s.uses[2]}, ${s.traps.length} traps`);

  // ---- 3. any weapon on any character ----------------------------------------------------------------
  const TABLE = [['sword', 'strike', 'slam'], ['greatsword', 'strike', 'whirlwind'], ['bow', 'shot', 'volley'], ['staff', 'wave', 'orb'], ['wand', 'familiar', 'beam']];
  for (const [cls, own] of [['warrior', 'strike,whirlwind,leap'], ['ranger', 'shot,volley,trap'], ['mage', 'wave,orb,warp']]) {
    await room(cls);
    s = await st();
    check(`a ${cls} begins with ${own.replace(/,/g, ', ')}`, s.ids.join() === own, `${s.weapon}: ${s.ids.join()}`);
    const swipe = own.split(',')[2];
    for (const [kind, tapId, holdId] of TABLE) {
      if (s.weapon === kind) continue;
      why = await wear(kind);
      s = await st();
      check(`a ${cls} can put on a ${kind}: tap ${tapId}, hold ${holdId}, and the swipe is still ${swipe}`, why === null && s.weapon === kind && s.ids.join() === `${tapId},${holdId},${swipe}`, `${why} ${s.weapon} ${s.ids.join()}`);
    }
  }
  // a warrior with a wand, in a fight: the familiar and the beam both work
  await room('warrior');
  why = await wear('wand');
  const W1 = await put(3, 1, 0);
  await page.waitForTimeout(200);
  s = await st();
  await quick(s.mons[W1].at.x, s.mons[W1].at.y - 10);
  s = await until((q) => q.familiars.length === 1, 2500);
  check('a warrior with a wand calls a familiar', !!s);
  await page.waitForTimeout(700);
  s = await st();
  const wHurt = s.mons[W1].hurt;
  await slow(s.mons[W1].at.x, s.mons[W1].at.y - 10);
  s = await until((q) => q.uses[1] >= 1 && q.mons[W1].hurt > wHurt, 2500);
  check('and fires a beam', !!s);
  await snap('13_warrior_wand');
  // a ranger with a staff
  await room('ranger');
  why = await wear('staff');
  const R1 = await put(4, 1, 0);
  await page.waitForTimeout(200);
  s = await st();
  await quick(s.mons[R1].at.x, s.mons[R1].at.y - 10);
  s = await until((q) => q.mons[R1].hurt > 0, 2500);
  check('a ranger with a staff sends a wave', !!s);
  await page.waitForTimeout(500);
  s = await st();
  await slow(s.mons[R1].at.x, s.mons[R1].at.y - 10);
  s = await until((q) => q.orbs.length === 1, 2500);
  check('and sets an orb', !!s);
  await page.waitForTimeout(150);
  await snap('14_ranger_staff');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log(`  !! letters the font cannot draw: ${missing.join(' ')}`);
}
