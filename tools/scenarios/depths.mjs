// SUNKEN FLOOR, PLAYED: stairs that go down, with real input.
//
// The owner, 7 Oct 2026, 08:01: "Stairs should go down as well". Read as sunken floor: a part of a
// room one level lower than the rest, with a flight of stairs down into it. He saw its picture and
// said (09:38) "Yes sounds good": IN THE GAME SINCE VERSION 18.1 (game/dungeon.ts, RELIEF.sunken).
// The hall is reached by this playtest's own door; for the dungeon it sets the switch for itself
// and puts it back as it was (so it tests sunken floor whichever way the switch stands).
//
// In the hall built for it (level.ts, makeStepHall: __dbg.practice(cls, seed, 'steps')), with the
// keyboard and the mouse on a PC, and with the stick and a swipe on a phone:
//   1. the hero walks at the rim of the sunken floor and stays on the hall's floor;
//   2. walks down a flight of stairs, begun a little out of line with it, and stands in the sunken
//      floor, drawn a ledge lower (and part-way down the flight they were drawn part-way down);
//   3. walks up the other flight to the hall's floor;
//   4. the swipe move carries them down over the rim, and up over it;
//   5. a skeleton in the sunken floor comes up by the stairs to a hero on the hall's floor;
//   and through all of it nobody walked across a ledge.
// Then in a real dungeon laid with sunken floor: rooms photographed with everything in them, how
// long a frame takes there, and the playtests' own player walking from a room's floor down to what
// waits in its sunken floor.
//   CLS=warrior node tools/playtest.mjs --scenario tools/scenarios/depths.mjs --out shots/depths/pc
import { makeHands, log } from './lib.mjs';

const LEDGE = 12; // (engine/iso.ts, LEDGE_H: how much higher raised floor is drawn, in game pixels)

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = hands.touch;
  const client = hands.client;
  const cls = process.env.CLS || 'warrior';
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  // ---- hands ---------------------------------------------------------------------------------
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

  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const f = g.level.floor;
    const i = Math.floor(h.y) * f.w + Math.floor(h.x);
    const cam = d.cam();
    return { x: h.x, y: h.y, level: f.height ? f.height[i] : 0, stair: f.stair ? f.stair[i] : 0, lift: cam.lift ? cam.lift(h.x, h.y) : 0, moving: !!h.move,
      w: d.screen.w, h: d.screen.h, panel: d.panels.open, watch: window.__watch ? { crossed: window.__watch.crossed.slice(0, 6), mid: window.__watch.mid } : null };
  });
  // (a hero set down somewhere by this playtest has not walked there: the watch below is told)
  const place = (x, y) => page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.move = null; window.__placed = true; }, [x, y]);
  /**
   * Walk in a direction of the WORLD until `done`, or for `ms`: the keys that point that way on
   * the screen, or the left thumb's stick pushed that way. (+x in the world is down and to the
   * right on the screen, +y down and to the left: a tile is twice as wide as it is tall.)
   */
  const walk = async (wdx, wdy, done, ms = 4000) => {
    const sdx = (wdx - wdy) * 2; const sdy = wdx + wdy; const n = Math.hypot(sdx, sdy) || 1;
    let s = await st();
    let stick = null;
    if (touch) { stick = { x: Math.round(s.w * 0.17), y: Math.round(s.h * 0.62) }; await down(1, stick.x, stick.y); await move(1, stick.x + (sdx / n) * 26, stick.y + (sdy / n) * 26); }
    else await steer(sdx, sdy);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { s = await st(); if (done(s)) break; await page.waitForTimeout(60); }
    if (stick) await up(1); else await letGo();
    await page.waitForTimeout(160);
    return st();
  };
  /** The swipe move toward a place in the world: Space with the pointer on it, or a swipe of a finger that way. */
  const swipeTo = async (wx, wy) => {
    await page.evaluate(() => { const h = window.__dbg.game().hero; h.mana = h.d.maxMana; for (const k of h.skills) if (k) { k.cd = 0; k.charges = k.maxCharges; } });
    const s = await st();
    if (touch) {
      const dx = ((wx - s.x) - (wy - s.y)) * 2; const dy = (wx - s.x) + (wy - s.y); const n = Math.hypot(dx, dy) || 1;
      await hands.flickAt(Math.round(s.w * 0.66), Math.round(s.h * 0.55), (dx / n) * 44, (dy / n) * 44, 9);
    } else {
      const p = await page.evaluate(([x, y]) => window.__dbg.at(x, y), [wx, wy]);
      const c = await client(p.x, p.y);
      await page.mouse.move(c.x, c.y);
      await page.waitForTimeout(80);
      await page.keyboard.press('Space');
    }
    await page.waitForTimeout(300);
    await hands.until(() => !window.__dbg.game().hero.move, 2500);
    await page.waitForTimeout(120);
    return st();
  };
  /** From now on, on this level: note anybody who steps over an edge the rules of height forbid, and a hero drawn part-way up. */
  const watch = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const L = g.level; const f = L.floor;
    const W = (window.__watch = { crossed: [], mid: false });
    const last = new Map();
    const tileOf = (b) => Math.floor(b.y) * f.w + Math.floor(b.x);
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      const r = run(dt, c);
      if (g.level !== L || !L.step) return r;
      if (window.__placed) { last.clear(); window.__placed = false; }
      const h = g.hero;
      // (in the air: in the middle of a leap or a roll, or in the step a swipe was asked for in: a warp is there at once)
      const bodies = [[0, h, !!h.move || !!c.evade, 'the hero']];
      // (a bat flies: it is not held to the ground's rules)
      for (const m of g.monsters) if (!m.dead && m.kind !== 'bat') bodies.push([m.id + 1, m, false, 'a ' + m.kind]);
      for (const [id, b, inAir, name] of bodies) {
        const now = tileOf(b); const was = last.get(id);
        last.set(id, inAir ? -1 : now);
        if (was === undefined || was < 0 || was === now || inAir) continue;
        const dx = (now % f.w) - (was % f.w); const dy = Math.floor(now / f.w) - Math.floor(was / f.w);
        const say = `${name} from ${was % f.w},${Math.floor(was / f.w)} to ${now % f.w},${Math.floor(now / f.w)}`;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) { W.crossed.push(say + ' (in one step)'); continue; }
        if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
        const bit = dx === 1 ? 1 : dx === -1 ? 2 : dy === 1 ? 4 : 8;
        if ((L.step[was] & bit) === 0) W.crossed.push(say);
      }
      const cam = d.cam();
      const lift = cam.lift ? cam.lift(h.x, h.y) : 0;
      if (!h.move && lift < -1 && lift > -11) W.mid = true;
      return r;
    };
  });

  // ---- the hall built for sunken floor ----------------------------------------------------------
  await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7, 'steps'); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, [cls]);
  await page.waitForTimeout(700);
  const hall = await page.evaluate(() => { const g = window.__dbg.game(); const f = g.level.floor; return { step: !!g.level.step, sunk: f.height ? [...f.height].filter((v) => v < 0).length : 0, stairs: f.stair ? [...f.stair].filter((v) => v).length : 0, practice: g.practice }; });
  check('in the hall built for sunken floor', hall.step && hall.sunk === 56 && hall.stairs === 8 && hall.practice, JSON.stringify(hall));
  if (!hall.step || !hall.sunk) return;
  await watch();
  // (the sunken floor is the floor of x 13..20, y 14..20; one flight goes down into it at 16..17, 14 toward +y; the other at 13, 17..18 toward +x)

  // 1. at the rim
  await place(18.6, 12.4);
  let s = await walk(0, 1, (q) => q.y > 13.9 || q.x > 20.7, 1300);
  check('1. walking at the rim: the hero stays on the hall\'s floor', s.level === 0 && s.stair === 0 && s.y <= 13.71 && s.lift === 0, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('1_at_the_rim');

  // 2. down the stairs, begun a little out of line with them (a third of the hero's width past the flight's edge)
  await place(15.9, 12.0);
  s = await walk(0, 1, (q) => q.level === -1 && q.stair === 0 && q.y > 15.4, 5000);
  check('2. walking down the stairs: the hero stands in the sunken floor', s.level === -1 && s.y > 15, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  check('   and is drawn a ledge lower', s.lift === -LEDGE, `lift ${s.lift}`);
  check('   and part-way down the flight was drawn part-way down', !!s.watch && s.watch.mid);
  await snap('2_down_the_stairs');

  // 3. up the other flight
  await place(15.5, 18.5);
  s = await walk(-1, 0, (q) => q.level === 0 && q.stair === 0 && q.x < 11.8, 5000);
  check('3. walking up the other flight: the hero stands on the hall\'s floor', s.level === 0 && s.stair === 0 && s.x < 12 && s.lift === 0, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('3_up_the_stairs');

  // 4. the swipe move, down over the rim and up over it
  await place(19.5, 13.2);
  await page.waitForTimeout(350);
  s = await swipeTo(19.5, 16.0);
  check('4. the swipe move carries the hero down into the sunken floor', s.level === -1 && s.lift === -LEDGE, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('4_swiped_down');
  await place(19.5, 14.6);
  await page.waitForTimeout(350);
  s = await swipeTo(19.5, 11.8);
  check('   and up out of it', s.level === 0 && s.stair === 0 && s.y < 14 && s.lift === 0, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);

  // 5. a monster comes up by the stairs
  await place(22.5, 17.5);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    for (const [x, y] of [[19.5, 17.5], [18.5, 16.5]]) { const m = g.spawn('skeleton', x, y, 900, 0, false, g.rng); m.xp = 0; m.seen = true; g.wakeUp(m); }
  });
  const came = await hands.until(() => {
    const g = window.__dbg.game(); const h = g.hero; const f = g.level.floor;
    return g.monsters.some((m) => !m.dead && f.height[Math.floor(m.y) * f.w + Math.floor(m.x)] === 0 && !f.stair[Math.floor(m.y) * f.w + Math.floor(m.x)] && Math.hypot(m.x - h.x, m.y - h.y) < 2.2);
  }, 14000);
  check('5. a skeleton from the sunken floor reaches the hero on the hall\'s floor', came);
  await snap('5_up_by_the_stairs');
  s = await st();
  check('nobody walked across a ledge', !!s.watch && s.watch.crossed.length === 0, s.watch ? s.watch.crossed.join('; ') : 'not watched');
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.projectiles.length = 0; });

  // ---- a real dungeon laid with sunken floor (the switch set for this, and put back) ----------------
  const found = await page.evaluate(([cls]) => {
    const d = window.__dbg;
    const was = d.relief.sunken;
    d.relief.sunken = true;
    for (let seed = 5; seed < 45; seed++) {
      d.run(cls, seed); /* (THE FIRST LEVELS, since Version 19.5: a hero this far in has the wordsmith's ring lit; with it dark the fallen wordsmith would lie in this dungeon too, and the playtests' own player would go to him first) */ d.seasoned(1);
      const g = d.game(); g.depth = 2; g.enterDungeon();
      const f = g.level.floor;
      if (!f.height || !f.height.some((v) => v < 0)) continue;
      d.relief.sunken = was;
      d.autoLevel = false; d.autoWords = false; d.god = true;
      g.level.explored.fill(1);
      const rooms = [];
      for (const r of f.rooms) {
        const highs = []; const lows = []; const stairs = [];
        for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
          const i = y * f.w + x;
          if (g.level.walk[i] !== 1) continue;
          // (sunken floor and the flights down into it; and the room's own floor)
          if (f.height[i] > 0 || (f.stair[i] && f.height[i] === 0)) continue;
          if (f.stair[i]) stairs.push([x, y]); else if (f.height[i] < 0) highs.push([x, y]); else lows.push([x, y]);
        }
        if (!highs.length) continue;
        const gap = (p, list) => Math.min(...list.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])));
        // (in the sunken floor, as far from its stairs as it goes; on the room's floor, as far from that as it goes)
        const top = highs.reduce((b, p) => (gap(p, stairs) > gap(b, stairs) ? p : b), highs[0]);
        const low = lows.reduce((b, p) => (gap(p, [top]) > gap(b, [top]) ? p : b), lows[0]);
        rooms.push({ id: r.id, kind: r.kind, w: r.w, h: r.h, raised: highs.length, stairs: stairs.length, top, low });
      }
      return { seed, rooms };
    }
    d.relief.sunken = was;
    return null;
  }, [cls]);
  check('a dungeon with sunken floor', !!found && found.rooms.length > 0, found ? `seed ${found.seed}: ${found.rooms.map((r) => `room ${r.id} (${r.kind}, ${r.w}x${r.h}): ${r.raised} sunken, ${r.stairs} stair tiles`).join(' | ')}` : 'none in forty seeds');
  if (!found || !found.rooms.length) return;
  await page.waitForTimeout(500);
  await watch();
  // the rooms, with what the map-maker put in them asleep where it stands
  const still = (on) => page.evaluate((on) => {
    clearInterval(window.__still);
    if (!on) return;
    const g = window.__dbg.game(); const h = g.hero;
    window.__still = setInterval(() => { for (const m of g.monsters) { m.state = 'sleep'; m.seen = true; } h.invuln = 1; h.flash = 0; g.level.explored.fill(1); g.level.visible.fill(1); }, 3);
  }, on);
  await still(true);
  let k = 0;
  for (const r of found.rooms.slice(0, 2)) {
    await place(r.low[0] + 0.5, r.low[1] + 0.5);
    await page.waitForTimeout(700);
    await snap(`room${k++}`);
  }
  await place(found.rooms[0].low[0] + 0.5, found.rooms[0].low[1] + 0.5);
  await page.waitForTimeout(400);
  const frames = await page.evaluate(() => new Promise((done) => {
    const times = []; let last = performance.now(); let n = 0;
    const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 90) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ median: Math.round(times[45] * 10) / 10, worst: Math.round(times[89] * 10) / 10 }); } };
    requestAnimationFrame(tick);
  }));
  log('frames (ms), a room with sunken floor in view', frames);
  check('a frame is drawn in good time with sunken floor in view', frames.median <= 25, `${frames.median} ms`);
  await still(false);

  // the playtests' own player: from the floor of a room to a skeleton asleep in its sunken floor
  const r0 = found.rooms[0];
  await page.evaluate((r) => {
    const d = window.__dbg; const g = d.game();
    g.monsters.length = 0; g.projectiles.length = 0;
    const m = g.spawn('skeleton', r.top[0] + 0.5, r.top[1] + 0.5, 900, 0, false, g.rng);
    m.seen = true;
    window.__sleeper = m;
    // (NOTHING WAKES WHILE THE PLAYER WALKS UP. Until 7 Oct 2026, 10:33, the sleeper was only put
    // back to sleep by a timer, every 3 ms: the game woke it each frame the hero was near, and a
    // frame that began before the timer had run showed the playtests' own player something awake
    // to fight. A ranger then shot it from where she stood, and on a loaded machine shot it dead
    // before she reached it, and walked off to the boss: `heights_phone` was flagged for that once
    // in Version 18.1's regression, clean every other time. Seen with the processor slowed six
    // times: the sleeper dead, the hero on the way to the boss. With this, never awake.)
    g.wakeUp = () => {};
    window.__still = setInterval(() => { m.state = 'sleep'; }, 3);
    d.bot(true);
  }, r0);
  const reached = await hands.until(() => { const g = window.__dbg.game(); const h = g.hero; const m = window.__sleeper; return Math.hypot(m.x - h.x, m.y - h.y) < 1.6; }, 20000);
  await page.evaluate(() => { window.__dbg.bot(false); clearInterval(window.__still); delete window.__dbg.game().wakeUp; });
  s = await st();
  check("the playtests' own player walks down to what waits in sunken floor", reached && s.level === -1, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}, from ${r0.low} to ${r0.top}`);
  await snap('bot_in_the_sunken_floor');
  check('nobody walked across a ledge in the dungeon', !!s.watch && s.watch.crossed.length === 0, s.watch ? s.watch.crossed.join('; ') : 'not watched');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `depths: ${fails} thing(s) wrong` : 'depths: ok');
}
