// HEIGHTS, PLAYED (Version 18.0): ledges and stairs, with real input.
//
// The owner, 5 Oct 2026: "I think steps are a must include"; "I need to be able to jump up and down
// ledges". 7 Oct 2026: "Then work on ledges and stairs"; "Stairs and raised areas look great."
//
// In the hall built for ledges (level.ts, makeLedgeHall: __dbg.practice(cls, seed, 'ledges')), with
// the keyboard and the mouse on a PC, and with the stick and a swipe on a phone:
//   1. the hero walks at a ledge and stays below it;
//   2. walks up a flight of stairs, begun a little out of line with it, and stands on the terrace,
//      drawn a ledge higher (and part-way up the flight they were drawn part-way up);
//   3. walks down the other flight to the floor;
//   4. the swipe move carries them up the ledge, and down it;
//   5. skeletons under the ledge come round by the stairs to a hero on the terrace;
//   and through all of it nobody walked across a ledge.
// Then in a real dungeon with terraces: rooms photographed with everything in them, how long a
// frame takes there, and the playtests' own player walking from the low floor of a room up to what
// waits on its terrace.
//   CLS=warrior node tools/playtest.mjs --scenario tools/scenarios/heights.mjs --out shots/heights/pc
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
    return { x: h.x, y: h.y, high: f.height ? f.height[i] : 0, stair: f.stair ? f.stair[i] : 0, lift: cam.lift ? cam.lift(h.x, h.y) : 0, moving: !!h.move,
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
      if (!h.move && lift > 1 && lift < 11) W.mid = true;
      return r;
    };
  });

  // ---- the hall built for ledges ---------------------------------------------------------------
  await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7, 'ledges'); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, [cls]);
  await page.waitForTimeout(700);
  const hall = await page.evaluate(() => { const g = window.__dbg.game(); const f = g.level.floor; return { step: !!g.level.step, heights: !!f.height, stairs: f.stair ? [...f.stair].filter((v) => v).length : 0, practice: g.practice }; });
  check('in the hall built for ledges', hall.step && hall.heights && hall.stairs === 4 && hall.practice, JSON.stringify(hall));
  if (!hall.step) return;
  await watch();
  // (the terrace is the floor of x 6..14, y 6..10; one flight goes up to it from 9..10, 11 toward -y; the other from 15, 8..9 toward -x)

  // 1. at a ledge
  await place(14.4, 12.6);
  let s = await walk(0, -1, (q) => q.y < 10.9 || q.x < 12.3, 1300);
  check('1. walking at a ledge: the hero stays below it', s.high === 0 && s.stair === 0 && s.y >= 11.29 && s.lift === 0, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('1_at_the_ledge');

  // 2. up the stairs, begun a little out of line with them (a third of the hero's width past the flight's edge)
  await place(11.1, 13.3);
  s = await walk(0, -1, (q) => q.high === 1 && q.stair === 0 && q.y < 10.6, 5000);
  check('2. walking up the stairs: the hero stands on the terrace', s.high === 1 && s.y < 11, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  check('   and is drawn a ledge higher', s.lift === LEDGE, `lift ${s.lift}`);
  check('   and part-way up the flight was drawn part-way up', !!s.watch && s.watch.mid);
  await snap('2_up_the_stairs');

  // 3. down the other flight
  await place(13.0, 8.5);
  s = await walk(1, 0, (q) => q.high === 0 && q.stair === 0 && q.x > 16.2, 5000);
  check('3. walking down the other flight: the hero stands on the floor', s.high === 0 && s.stair === 0 && s.x > 16 && s.lift === 0, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('3_down_the_stairs');

  // 4. the swipe move, up the ledge and down it
  await place(12.5, 11.8);
  await page.waitForTimeout(350);
  s = await swipeTo(12.5, 9.0);
  check('4. the swipe move carries the hero up the ledge', s.high === 1 && s.lift === LEDGE, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('4_swiped_up');
  await place(12.5, 10.4);
  await page.waitForTimeout(350);
  s = await swipeTo(12.5, 13.2);
  check('   and down it', s.high === 0 && s.stair === 0 && s.y > 11 && s.lift === 0, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);

  // 5. monsters come round by the stairs
  await place(12.5, 9.4);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    for (const [x, y] of [[11.6, 12.6], [13.6, 12.6]]) { const m = g.spawn('skeleton', x, y, 900, 0, false, g.rng); m.xp = 0; m.seen = true; g.wakeUp(m); }
  });
  const came = await hands.until(() => {
    const g = window.__dbg.game(); const h = g.hero; const f = g.level.floor;
    return g.monsters.some((m) => !m.dead && f.height[Math.floor(m.y) * f.w + Math.floor(m.x)] === 1 && Math.hypot(m.x - h.x, m.y - h.y) < 2.2);
  }, 10000);
  check('5. a skeleton from under the ledge reaches the hero on the terrace', came);
  await snap('5_round_by_the_stairs');
  s = await st();
  check('nobody walked across a ledge', !!s.watch && s.watch.crossed.length === 0, s.watch ? s.watch.crossed.join('; ') : 'not watched');
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.projectiles.length = 0; });

  // ---- a real dungeon with terraces --------------------------------------------------------------
  const found = await page.evaluate(([cls]) => {
    const d = window.__dbg;
    for (let seed = 5; seed < 45; seed++) {
      d.run(cls, seed);
      const g = d.game(); g.depth = 2; g.enterDungeon();
      const f = g.level.floor;
      if (!f.height) continue;
      d.autoLevel = false; d.autoWords = false; d.god = true;
      g.level.explored.fill(1);
      const rooms = [];
      for (const r of f.rooms) {
        const highs = []; const lows = []; const stairs = [];
        for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
          const i = y * f.w + x;
          if (g.level.walk[i] !== 1) continue;
          // (raised floor only: sunken floor, where the map-maker lays any, is neither)
          if (f.height[i] < 0) continue;
          if (f.stair[i]) stairs.push([x, y]); else if (f.height[i] > 0) highs.push([x, y]); else lows.push([x, y]);
        }
        if (!highs.length) continue;
        const gap = (p, list) => Math.min(...list.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])));
        // (on the terrace, as far from its stairs as it goes; on the low floor, as far from that as it goes)
        const top = highs.reduce((b, p) => (gap(p, stairs) > gap(b, stairs) ? p : b), highs[0]);
        const low = lows.reduce((b, p) => (gap(p, [top]) > gap(b, [top]) ? p : b), lows[0]);
        rooms.push({ id: r.id, kind: r.kind, w: r.w, h: r.h, raised: highs.length, stairs: stairs.length, top, low });
      }
      return { seed, rooms };
    }
    return null;
  }, [cls]);
  check('a dungeon with terraces', !!found && found.rooms.length > 0, found ? `seed ${found.seed}: ${found.rooms.map((r) => `room ${r.id} (${r.kind}, ${r.w}x${r.h}): ${r.raised} raised, ${r.stairs} stair tiles`).join(' | ')}` : 'none in forty seeds');
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
  log('frames (ms), a room with a terrace in view', frames);
  check('a frame is drawn in good time with a terrace in view', frames.median <= 25, `${frames.median} ms`);
  await still(false);

  // the playtests' own player: from the low floor of a room to a skeleton asleep on its terrace
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
  check("the playtests' own player walks up to what waits on a terrace", reached && s.high === 1, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}, from ${r0.low} to ${r0.top}`);
  await snap('bot_on_the_terrace');
  check('nobody walked across a ledge in the dungeon', !!s.watch && s.watch.crossed.length === 0, s.watch ? s.watch.crossed.join('; ') : 'not watched');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `heights: ${fails} thing(s) wrong` : 'heights: ok');
}
