// TWO SMALL THINGS (Version 18.6; src/game/game.ts, the monsters' turn and `updateDrops`; `TUNE` in
// src/game/defs.ts).
//
// The owner, 7 Oct 2026, 19:13: "Some small things, I need the ranged enemies to not run away from
// you, and I need the pick up range increased slightly."
//
// What this holds, on the page itself, in the practice room (open floor; nothing in it but what is
// put there):
//   1. A RANGED MONSTER HOLDS ITS GROUND: a Bone Archer and a Cultist, awake, with the hero two
//      tiles from them (they backed away from 4.5 and 4 until Version 18.5): seven seconds and
//      more on, each stands where it stood, and has shot at him;
//   2. WITH REAL INPUT the hero walks at an archer from five tiles off: it is still where it was
//      when he reaches it;
//   3. THE PICK-UP RANGE: a piece of gear a full tile from the hero is taken where he stands (it
//      was three quarters of a tile); one a tile and a half off lies there. Gold three tiles off
//      comes to him and is his (the pull was 2.6 tiles); gold four tiles off lies there.
//   CLS=warrior node tools/playtest.mjs --file <page> [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/small.mjs --out shots/small
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = hands.touch;
  const client = hands.client;
  const cls = process.env.CLS || 'warrior';
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  // ---- hands: the stick, or the keys (as in doors.mjs) ----------------------------------------------
  const cdp = touch ? await page.context().newCDPSession(page) : null;
  const pts = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...pts].map(([id, p]) => ({ x: Math.round(p.x), y: Math.round(p.y), id })) });
  const down = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchStart'); };
  const move = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchMove'); };
  const up = async (id) => { const q = pts.get(id); pts.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: q ? [{ x: Math.round(q.x), y: Math.round(q.y), id }] : [] }); };
  const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
  const keysDown = new Set();
  const steer = async (dx, dy) => {
    const d = Math.hypot(dx, dy) || 1;
    const want = new Set();
    if (dy / d < -0.38) want.add('KeyW');
    if (dy / d > 0.38) want.add('KeyS');
    if (dx / d < -0.38) want.add('KeyA');
    if (dx / d > 0.38) want.add('KeyD');
    for (const k of KEYS) {
      if (want.has(k) && !keysDown.has(k)) { await page.keyboard.down(k); keysDown.add(k); }
      if (!want.has(k) && keysDown.has(k)) { await page.keyboard.up(k); keysDown.delete(k); }
    }
  };
  const letGo = async () => { for (const k of [...keysDown]) { await page.keyboard.up(k); keysDown.delete(k); } };
  const hero = () => page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return { x: h.x, y: h.y, w: d.screen.w, h: d.screen.h }; });
  /** Walk to a place with real input, aiming again at every look. */
  const walkTo = async (tx, ty, near, ms) => {
    let s = await hero();
    const stick = touch ? { x: Math.round(s.w * 0.17), y: Math.round(s.h * 0.62) } : null;
    const aim = async (q) => {
      const wdx = tx - q.x; const wdy = ty - q.y;
      const sdx = (wdx - wdy) * 2; const sdy = wdx + wdy; const n = Math.hypot(sdx, sdy) || 1;
      if (stick) await move(1, stick.x + (sdx / n) * 26, stick.y + (sdy / n) * 26);
      else await steer(sdx, sdy);
    };
    if (stick) await down(1, stick.x, stick.y);
    await aim(s);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      s = await hero();
      if (Math.hypot(tx - s.x, ty - s.y) < near) break;
      await aim(s);
      await page.waitForTimeout(50);
    }
    if (stick) await up(1); else await letGo();
    await page.waitForTimeout(160);
    return hero();
  };

  // ---- the practice room, with nobody in it and nobody coming ----------------------------------------
  const tune = await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false);
    d.practice(cls, 5);
    const g = d.game();
    d.god = true; d.autoLevel = false; d.autoWords = false;
    g.updatePractice = () => {};
    g.monsters.length = 0; g.projectiles.length = 0; g.drops.length = 0;
    clearInterval(window.__quiet);
    window.__quiet = setInterval(() => { window.__dbg.fx.messages.length = 0; }, 3);
    // (how many shots at the hero have been loosed: counted as they appear)
    window.__seen = new Set(); window.__shots = 0;
    clearInterval(window.__count);
    window.__count = setInterval(() => { const q = window.__dbg.game(); if (!q) return; for (const p of q.projectiles) if (!window.__seen.has(p)) { window.__seen.add(p); if (p.hostile) window.__shots++; } }, 4);
    return { at: [g.hero.x, g.hero.y] };
  }, [cls]);
  await page.waitForTimeout(600);
  const [hx, hy] = tune.at;
  const place = (x, y) => page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.move = null; }, [x, y]);
  const put = (kind, x, y) => page.evaluate(([kind, x, y]) => {
    const g = window.__dbg.game();
    const m = g.spawn(kind, x, y, 900 + g.monsters.length, 0, false, g.rng);
    g.wakeUp(m);
    (window.__put = window.__put || []).push(m);
    return window.__put.length - 1;
  }, [kind, x, y]);
  const where = (i) => page.evaluate((i) => { const m = window.__put[i]; return { x: m.x, y: m.y, dead: m.dead, state: m.state }; }, i);
  const clear = () => page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.projectiles.length = 0; window.__shots = 0; });

  // ---- 1. a ranged monster holds its ground -----------------------------------------------------------
  for (const kind of ['archer', 'cultist']) {
    await clear();
    await place(hx, hy);
    const i = await put(kind, hx + 2, hy);
    const a = await where(i);
    // (seven and a half seconds: time for two shots of the slower of the two, a cultist, with room to spare on a busy machine)
    await page.waitForTimeout(7500);
    const b = await where(i);
    const shots = await page.evaluate(() => window.__shots);
    const moved = Math.hypot(b.x - a.x, b.y - a.y);
    if (kind === 'archer') await snap('1_an_archer_two_tiles_off_stands_and_shoots');
    check(`1. ${kind === 'archer' ? 'an archer' : 'a cultist'} two tiles from the hero stands where it stood for seven seconds and more`, moved < 0.02 && !b.dead, `it moved ${moved.toFixed(3)} tiles`);
    check('   and shoots at him from there', shots >= 2, `${shots} shots`);
  }

  // ---- 2. the hero walks at an archer with real input -------------------------------------------------
  {
    await clear();
    await place(hx - 3, hy);
    const i = await put('archer', hx + 2, hy);
    const a = await where(i);
    const s = await walkTo(a.x - 0.9, a.y, 0.35, 7000);
    const b = await where(i);
    const moved = Math.hypot(b.x - a.x, b.y - a.y);
    await snap('2_the_hero_has_walked_up_to_an_archer');
    check('2. with real input the hero walks at an archer from five tiles off, and reaches it', Math.hypot(s.x - b.x, s.y - b.y) < 1.5, `he is ${Math.hypot(s.x - b.x, s.y - b.y).toFixed(2)} tiles from it`);
    check('   and it is where it was', moved < 0.02, `it moved ${moved.toFixed(3)} tiles`);
  }

  // ---- 3. the pick-up range ---------------------------------------------------------------------------
  {
    await clear();
    await place(hx, hy);
    await page.waitForTimeout(200);
    const laid = await page.evaluate(() => {
      const g = window.__dbg.game(); const h = g.hero;
      const spot = h.bag.findIndex((it) => it !== null);
      if (spot < 0) return null;
      const near = h.bag[spot]; h.bag[spot] = null;
      const spot2 = h.bag.findIndex((it) => it !== null);
      const far = spot2 >= 0 ? h.bag[spot2] : null; if (spot2 >= 0) h.bag[spot2] = null;
      const drop = (x, y, kind, item, gold) => { const q = { x, y, kind, gold, item, word: null, age: 5 }; g.drops.push(q); return q; };
      window.__near = drop(h.x + 1.0, h.y, 'item', near, 0);
      window.__far = far ? drop(h.x - 1.5, h.y, 'item', far, 0) : null;
      window.__goldNear = drop(h.x, h.y + 3.0, 'gold', null, 5);
      window.__goldFar = drop(h.x, h.y - 4.0, 'gold', null, 5);
      window.__nearItem = near;
      return { gold: h.gold, far: !!far };
    });
    check('3. the practice hero has gear in the bag to lay on the floor', !!laid && laid.far);
    if (laid) {
      await page.waitForTimeout(900);
      const got = await page.evaluate(() => {
        const g = window.__dbg.game(); const h = g.hero;
        return {
          near: !g.drops.includes(window.__near), mine: h.bag.includes(window.__nearItem) || Object.values(h.gear).includes(window.__nearItem),
          far: g.drops.includes(window.__far), farAt: window.__far ? Math.hypot(window.__far.x - h.x, window.__far.y - h.y) : 0,
          goldNear: !g.drops.includes(window.__goldNear), goldFar: g.drops.includes(window.__goldFar), goldFarAt: Math.hypot(window.__goldFar.x - h.x, window.__goldFar.y - h.y), gold: h.gold,
        };
      });
      await snap('3_what_was_out_of_reach_lies_there');
      check('   a piece of gear a full tile from the hero is taken where he stands', got.near && got.mine, got.near ? '' : 'it lies there still');
      check('   one a tile and a half off lies where it fell', got.far && Math.abs(got.farAt - 1.5) < 0.01, `${got.farAt.toFixed(2)} tiles off`);
      check('   gold three tiles off comes to him and is his', got.goldNear && got.gold > laid.gold, `gold ${laid.gold} to ${got.gold}`);
      check('   gold four tiles off lies where it is', got.goldFar && Math.abs(got.goldFarAt - 4) < 0.01, `${got.goldFarAt.toFixed(2)} tiles off`);
    }
  }

  await page.evaluate(() => { clearInterval(window.__quiet); clearInterval(window.__count); });
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `small: ${fails} thing(s) wrong` : 'small: ok');
}
