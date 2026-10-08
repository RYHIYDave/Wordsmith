// TRIANGLES, PLAYED: walls that slant, with real input.
//
// The owner, 7 Oct 2026, 08:01, of stills of rooms with their corners cut clean, an eight-sided
// hall and a flat back wall: "Triangles look pretty good I like it". A tile cut corner to corner
// is half floor and half wall (game/cut.ts). IN THE GAME SINCE VERSION 18.2 (game/dungeon.ts,
// RELIEF.cuts): he was sent three real rooms at 11:11 and said at 11:28 "That’s good." The hall is
// reached by this playtest's own door, and for the dungeon it sets the switch for itself and puts
// it back as it was (so it tests triangles whichever way the switch stands).
//
// In the room built for them (level.ts, makeShapeRoom: __dbg.practice(cls, seed, 'shape:cut'): the
// floor of x 8..21, y 8..21, every corner cut three tiles), with the keyboard and the mouse on a PC,
// and with the stick and a swipe on a phone:
//   1. the hero walks straight into each of the four corners and is stopped by the slanting wall at
//      their own half width from it, standing on a half tile of floor;
//   2. pushed against a slanting wall at a slant, they slide along it;
//   3. the swipe move at a slanting wall does not land in it;
//   4. a skeleton comes at a hero who stands on a half tile;
//   and through all of it nobody's middle was ever in the wall half of a tile.
// Then in a real dungeon laid with triangles: an eight-sided hall, a room with a flat back wall
// and a treasure vault photographed with everything in them, how long a frame takes there, and
// the playtests' own player walking across a room to what waits against its flat back wall.
//   CLS=warrior node tools/playtest.mjs --scenario tools/scenarios/slants.mjs --out shots/slants/pc
import { makeHands, log } from './lib.mjs';

const R = 0.3; // (game/defs.ts, TUNE.heroRadius: half a hero's width, in tiles)
const R2 = Math.SQRT1_2;
// (how far a place is from each corner's cut, on the floor side: the room of 'cut')
const OFF = {
  back: (x, y) => (x + y - 19) * R2,
  front: (x, y) => (41 - x - y) * R2,
  left: (x, y) => (11 - (y - x)) * R2,
  right: (x, y) => (11 - (x - y)) * R2,
};

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
    return { x: h.x, y: h.y, cut: f.cut ? f.cut[i] : 0, floor: f.tiles[i] === 1, moving: !!h.move, w: d.screen.w, h: d.screen.h,
      watch: window.__watch ? { inside: window.__watch.inside.slice(0, 6), seen: window.__watch.seen } : null };
  });
  const place = (x, y) => page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.move = null; }, [x, y]);
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
  /**
   * From now on, on this level: note anybody whose middle is in the wall half of a cut tile after
   * a step of the game (a hero in the middle of a swipe is in the air: a leap passes over nothing
   * here, but a warp is nowhere until it lands). Bats fly over the floor, and are held by walls
   * as everything is: they are watched too.
   */
  const watch = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const L = g.level; const f = L.floor;
    const W = (window.__watch = { inside: [], seen: 0 });
    // (game/cut.ts, intoWall: which half of a cut tile is wall; 1 far, 2 near, 3 left, 4 right; 5 to 8 the same, cut down low)
    const into = (c, u, v) => { const k = c > 4 ? c - 4 : c; return k === 1 ? 1 - u - v : k === 2 ? u + v - 1 : k === 3 ? v - u : u - v; };
    const inWall = (x, y) => { const tx = Math.floor(x); const ty = Math.floor(y); const c = f.cut ? f.cut[ty * f.w + tx] : 0; return c !== 0 && into(c, x - tx, y - ty) > 1e-6; };
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      const r = run(dt, c);
      if (g.level !== L) return r;
      W.seen++;
      const h = g.hero;
      if (!h.move && inWall(h.x, h.y)) W.inside.push(`the hero at ${h.x.toFixed(2)},${h.y.toFixed(2)}`);
      for (const m of g.monsters) if (!m.dead && inWall(m.x, m.y)) W.inside.push(`a ${m.kind} at ${m.x.toFixed(2)},${m.y.toFixed(2)}`);
      return r;
    };
  });

  // ---- the room built for triangles ---------------------------------------------------------------
  await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7, 'shape:cut'); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, [cls]);
  await page.waitForTimeout(700);
  const hall = await page.evaluate(() => { const g = window.__dbg.game(); const f = g.level.floor; return { cuts: f.cut ? [...f.cut].filter((v) => v).length : 0, practice: g.practice }; });
  check('in the room built for triangles', hall.cuts === 20 && hall.practice, JSON.stringify(hall));
  if (!hall.cuts) return;
  await watch();

  // 1. straight into each corner
  const corners = [
    ['back', 11.5, 11.5, -1, -1],
    ['front', 17.5, 17.5, 1, 1],
    // (not from the two tiles a pillar stands on)
    ['left', 11.5, 18.5, -1, 1],
    ['right', 18.5, 11.5, 1, -1],
  ];
  let s;
  for (const [which, x, y, dx, dy] of corners) {
    await place(x, y);
    await page.waitForTimeout(150);
    s = await walk(dx, dy, (q) => OFF[which](q.x, q.y) < R + 0.02, 3500);
    const off = OFF[which](s.x, s.y);
    check(`1. walking into the ${which} corner: stopped at the slanting wall, half a hero's width from it`, off >= R - 0.01 && off <= R + 0.12, `${off.toFixed(3)} tiles from it, at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
    check('   and stands on a half tile of floor', s.cut !== 0 && s.floor, `cut ${s.cut}`);
    if (which === 'back' || which === 'front') await snap(`1_${which}_corner`);
  }

  // 2. pushed against it at a slant: along the back wall toward the back corner, then on down the cut
  await place(12.5, 9.5);
  await page.waitForTimeout(150);
  s = await walk(-1, 0, (q) => q.y > 10.5 && q.x < 9.2, 4500);
  check('2. pushed against the slanting wall at a slant, the hero slides along it', s.y > 10.4 && s.x < 9.4 && OFF.back(s.x, s.y) >= R - 0.01, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}, ${OFF.back(s.x, s.y).toFixed(3)} from it`);
  await snap('2_slid_along_it');

  // 3. the swipe move at the wall
  await place(12.5, 12.5);
  await page.waitForTimeout(350);
  s = await swipeTo(8.3, 8.3);
  check('3. the swipe move at the slanting wall does not land in it', OFF.back(s.x, s.y) >= R - 0.01 && s.floor, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}, ${OFF.back(s.x, s.y).toFixed(3)} from it`);
  await snap('3_swiped_at_it');

  // 4. a monster comes at a hero who stands on a half tile
  await place(9.75, 9.75);
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const m = g.spawn('skeleton', 14.5, 14.5, 900, 0, false, g.rng); m.xp = 0; m.seen = true; g.wakeUp(m);
  });
  const came = await hands.until(() => { const g = window.__dbg.game(); const h = g.hero; return g.monsters.some((m) => !m.dead && Math.hypot(m.x - h.x, m.y - h.y) < 1.6); }, 10000);
  s = await st();
  check('4. a skeleton comes at a hero who stands on a half tile', came && s.cut !== 0, `the hero at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('4_comes_at_them');
  check('nobody was ever in the wall half of a tile', !!s.watch && s.watch.seen > 100 && s.watch.inside.length === 0, s.watch ? `${s.watch.seen} steps watched ${s.watch.inside.join('; ')}` : 'not watched');
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.projectiles.length = 0; });

  // ---- a real dungeon laid with triangles (the switch set for this, and put back) ------------------
  const found = await page.evaluate(([cls]) => {
    const d = window.__dbg;
    const was = d.relief.cuts;
    d.relief.cuts = true;
    let out = null;
    for (let seed = 5; seed < 45 && !out; seed++) {
      d.run(cls, seed);
      const g = d.game(); g.depth = 2; g.enterDungeon();
      const f = g.level.floor;
      if (!f.cut) continue;
      const rooms = [];
      for (const r of f.rooms) {
        // how many tiles each corner is cut (back, right, left, front): along the room's edge from the corner, the first tile that is floor
        const cutOf = (cx, cy, sx) => { let k = 0; while (k < 9 && f.tiles[cy * f.w + cx + k * sx] !== 1) k++; return k; };
        const x1 = r.x + r.w - 1; const y1 = r.y + r.h - 1;
        const c = [cutOf(r.x, r.y, 1), cutOf(x1, r.y, -1), cutOf(r.x, y1, 1), cutOf(x1, y1, -1)];
        const vault = r.kind === 'treasure';
        const eight = c.filter((v) => v >= 3).length >= 3;
        const back = !eight && c[0] >= (vault ? 3 : 4) && c[0] > Math.max(c[1], c[2]);
        if (!eight && !back) continue;
        // the room's middle; and, for a flat back wall, the middle tiles of the first whole row in front of it and a place across the room from them
        const mid = [r.x + r.w / 2, r.y + r.h / 2];
        const line = []; for (let k = 1; k <= c[0]; k++) line.push([r.x + k, r.y + c[0] + 1 - k]);
        const free = line.filter(([x, y]) => g.level.walk[y * f.w + x] === 1);
        const at = free.length ? free[Math.floor(free.length / 2)] : null;
        const chests = g.level.props.filter((p) => p.kind === 'chest' && p.tx >= r.x && p.tx <= x1 && p.ty >= r.y && p.ty <= y1).length;
        rooms.push({ id: r.id, kind: r.kind, w: r.w, h: r.h, cuts: c, what: eight ? 'eight' : vault ? 'vault' : 'back', mid, at, far: [x1 - 1.5, y1 - 1.5], chests });
      }
      // (a dungeon with a flat back wall that something can stand against, and an eight-sided hall)
      if (rooms.some((r) => r.what !== 'eight' && r.at) && rooms.some((r) => r.what === 'eight')) out = { seed, rooms };
    }
    d.relief.cuts = was;
    if (!out) return null;
    d.autoLevel = false; d.autoWords = false; d.god = true;
    window.__dbg.game().level.explored.fill(1);
    return out;
  }, [cls]);
  check('a dungeon with an eight-sided hall and a flat back wall', !!found, found ? `seed ${found.seed}: ${found.rooms.map((r) => `room ${r.id} (${r.kind}, ${r.w}x${r.h}, corners ${r.cuts.join('/')}: ${r.what})`).join(' | ')}` : 'none in forty seeds');
  if (!found) return;
  await page.waitForTimeout(500);
  await watch();
  // (a place a body may stand, the nearest to the one asked for)
  const stand = (x, y) => page.evaluate(([x, y]) => {
    const g = window.__dbg.game(); const h = g.hero;
    let best = null; let bd = 1e9;
    for (let yy = y - 3; yy <= y + 3; yy += 0.5) for (let xx = x - 3; xx <= x + 3; xx += 0.5) {
      if (!g.free(g.level.walk, xx, yy, 0.45)) continue;
      const dd = Math.hypot(xx - x, yy - y);
      if (dd < bd) { bd = dd; best = [xx, yy]; }
    }
    if (best) { h.x = best[0]; h.y = best[1]; h.move = null; }
    return best;
  }, [x, y]);
  // the rooms, with what the map-maker put in them asleep where it stands
  const still = (on) => page.evaluate((on) => {
    clearInterval(window.__still);
    if (!on) return;
    const g = window.__dbg.game(); const h = g.hero;
    window.__still = setInterval(() => { for (const m of g.monsters) { m.state = 'sleep'; m.seen = true; } h.invuln = 1; h.flash = 0; g.level.explored.fill(1); g.level.visible.fill(1); }, 3);
  }, on);
  // (nothing wakes while the rooms are photographed and walked: see heights.mjs for why a timer alone will not do)
  await page.evaluate(() => { window.__dbg.game().wakeUp = () => {}; });
  await still(true);
  const shown = [];
  for (const what of ['eight', 'back', 'vault']) {
    const r = found.rooms.find((q) => q.what === what);
    if (!r) continue;
    // (a vault's chests are opened by a hero who comes up to them: in a vault the picture is taken from the front of the room)
    await stand(what === 'vault' ? r.far[0] : r.mid[0], what === 'vault' ? r.far[1] : r.mid[1]);
    await page.waitForTimeout(700);
    await snap(`room_${what}`);
    shown.push(what);
  }
  log('rooms photographed', shown.join(', '));
  const frames = await page.evaluate(() => new Promise((done) => {
    const times = []; let last = performance.now(); let n = 0;
    const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 90) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ median: Math.round(times[45] * 10) / 10, worst: Math.round(times[89] * 10) / 10 }); } };
    requestAnimationFrame(tick);
  }));
  log('frames (ms), a room with slanting walls in view', frames);
  check('a frame is drawn in good time with slanting walls in view', frames.median <= 25, `${frames.median} ms`);
  await still(false);

  // the playtests' own player: across a room to a skeleton asleep against its flat back wall
  const r0 = found.rooms.find((q) => q.what !== 'eight' && q.at);
  await stand(r0.far[0], r0.far[1]);
  await page.evaluate((r) => {
    const d = window.__dbg; const g = d.game();
    g.monsters.length = 0; g.projectiles.length = 0;
    const m = g.spawn('skeleton', r.at[0] + 0.5, r.at[1] + 0.5, 900, 0, false, g.rng);
    m.seen = true;
    window.__sleeper = m;
    window.__still = setInterval(() => { m.state = 'sleep'; }, 3);
    d.bot(true);
  }, r0);
  const reached = await hands.until(() => { const g = window.__dbg.game(); const h = g.hero; const m = window.__sleeper; return Math.hypot(m.x - h.x, m.y - h.y) < 1.6; }, 20000);
  await page.evaluate(() => { window.__dbg.bot(false); clearInterval(window.__still); delete window.__dbg.game().wakeUp; });
  s = await st();
  check("the playtests' own player walks up to what waits against a flat back wall", reached, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}, room ${r0.id}, to ${r0.at}`);
  await snap('bot_at_the_flat_wall');
  check('nobody was ever in the wall half of a tile in the dungeon', !!s.watch && s.watch.seen > 30 && s.watch.inside.length === 0, s.watch ? `${s.watch.seen} steps watched ${s.watch.inside.join('; ')}` : 'not watched');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `slants: ${fails} thing(s) wrong` : 'slants: ok');
}
