// THE WALLS, READ OFF THE REAL SCREEN AND WALKED AMONG (Version 18.4).
//
// The owner, 7 Oct 2026, 11:32: "Now that we have varying levels of height, the walls suddenly
// increasing or decreasing in height is jarring. Also I don't like being able to see the tops of
// the walls." Of three ways shown to him he chose the third (13:39: "3"): taller walls that fade
// into the dark at the top, and none toward the eye; and of its pictures and the question "Good
// to put out?" (14:46) he said at 14:55: "Good". IN THE GAME SINCE VERSION 18.4 (art/ground.ts,
// WALLS_FADING; render/walls.ts has its two rules, and tests/walls.test.ts holds them).
//
// What this holds, read off the canvas of the page itself (the level lit, and empty of monsters):
//   0. the look in force is the one he chose;
//   1. IN THE TOWN AND IN A DUNGEON a back wall is stone for 28 game pixels above its foot, fainter
//      and fainter above that, and from 40 up there is nothing: the dark, and no top of a wall;
//   2. behind RAISED floor the wall ends on the same top line (it is not built up);
//   3. on a side TOWARD THE EYE nothing stands where the rules have a wall: the dark;
//   4. beside a doorway in a back wall the two blocks that would hide the corridor are left out;
//   5. WITH REAL INPUT the hero walks out of a room through a doorway on a side toward the eye and
//      back in: all the way the glow that marks the player is seen (it never goes out);
//   6. a frame is drawn in good time with walls all round.
// Pictures: the town, a room with raised floor, a corridor across the screen, an eight-sided hall.
//   CLS=warrior node tools/playtest.mjs --scenario tools/scenarios/walls.mjs --out shots/walls/pc
// LOOK=blocks: the look the game had until Version 18.3, set for the pictures and put back (the
// checks of the fading look are then not made; with CHECK=1 they are, and should fail).
import { makeHands, log } from './lib.mjs';

/** (art/ground.ts, WALLS_FADING: a wall is 40 game pixels high, of which the top 12 fade out) */
const TALL = 40;
const SOLID = 28;

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = hands.touch;
  const client = hands.client;
  const cls = process.env.CLS || 'warrior';
  const other = process.env.LOOK || null;
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  // ---- hands (as in across.mjs) ----------------------------------------------------------------
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
  // (where the hero is; and `glow`: how many picture pixels of the cyan that marks the player are seen on and about him)
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const f = g.level.floor; const s = d.screen; const c = d.cam();
    const i = Math.floor(h.y) * f.w + Math.floor(h.x);
    const k = s.canvas.width / s.w;
    const lift = c.lift ? c.lift(h.x, h.y) : 0;
    const X = c.ox + (h.x - h.y) * 16; const Y = c.oy + (h.x + h.y) * 8 - lift;
    const x0 = Math.max(0, Math.round((X - 16) * k)); const y0 = Math.max(0, Math.round((Y - 38) * k));
    const w = Math.max(1, Math.min(s.canvas.width - x0, Math.round(32 * k))); const hh = Math.max(1, Math.min(s.canvas.height - y0, Math.round(44 * k)));
    const px = s.g.getImageData(x0, y0, w, hh).data;
    let glow = 0;
    for (let j = 0; j < px.length; j += 4) if (px[j + 2] > 170 && px[j + 1] > 150 && px[j] < 150 && px[j + 2] - px[j] > 60) glow++;
    return { x: h.x, y: h.y, floor: f.tiles[i] === 1, moving: !!h.move, w: s.w, h: s.h, glow };
  });
  const place = (x, y) => page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.move = null; h.fx = 0.7; h.fy = 0.7; }, [x, y]);
  const walk = async (wdx, wdy, done, ms, each) => {
    const sdx = (wdx - wdy) * 2; const sdy = wdx + wdy; const n = Math.hypot(sdx, sdy) || 1;
    let s = await st();
    let stick = null;
    if (touch) { stick = { x: Math.round(s.w * 0.17), y: Math.round(s.h * 0.62) }; await down(1, stick.x, stick.y); await move(1, stick.x + (sdx / n) * 26, stick.y + (sdy / n) * 26); }
    else await steer(sdx, sdy);
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { s = await st(); if (each) each(s); if (done(s)) break; await page.waitForTimeout(60); }
    if (stick) await up(1); else await letGo();
    await page.waitForTimeout(160);
    return st();
  };
  // (the mean lightness, 0 to 255, of a patch of the screen 3 game pixels wide and 2 high about each point given in game pixels)
  const light = (points) => page.evaluate((points) => {
    const s = window.__dbg.screen; const k = s.canvas.width / s.w;
    return points.map(([x, y]) => {
      const w = Math.round(3 * k); const h = Math.round(2 * k);
      const d = s.g.getImageData(Math.round(x * k - w / 2), Math.round(y * k - h / 2), w, h).data;
      let t = 0;
      for (let i = 0; i < d.length; i += 4) t += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      return Math.round((t / (d.length / 4)) * 10) / 10;
    });
  }, points);
  // (where the top corner of a tile's diamond is on the screen, in game pixels: a tile's middle is 8 below it)
  const corner = (tx, ty) => page.evaluate(([tx, ty]) => { const c = window.__dbg.cam(); return [c.ox + (tx - ty) * 16, c.oy + (tx + ty) * 8]; }, [tx, ty]);

  // ---- 0. the look -----------------------------------------------------------------------------
  const look = await page.evaluate((other) => {
    const d = window.__dbg; d.saving(false);
    const was = d.wallLook();
    if (other) d.walls(d.wallLooks[other]);
    return { was, now: d.wallLook(), fading: d.wallLooks.fading };
  }, other);
  // (CHECK=1 with LOOK=blocks makes the checks all the same: to see them fail on the old look. A playtest that cannot fail proves nothing.)
  const fading = JSON.stringify(look.now) === JSON.stringify(look.fading) || process.env.CHECK === '1';
  if (other) log('the look set for these pictures', `${other}: ${JSON.stringify(look.now)}`);
  else check('0. the look in force is the one he chose', fading, JSON.stringify(look.now));

  // ---- a level, lit, asleep and empty -----------------------------------------------------------
  const begin = (seed, depth) => page.evaluate(([cls, seed, depth]) => {
    const d = window.__dbg; d.saving(false);
    d.run(cls, seed);
    const g = d.game();
    if (depth > 0) { g.depth = depth; g.enterDungeon(); }
    d.autoLevel = false; d.autoWords = false; d.god = true;
    g.wakeUp = () => {};
    g.monsters.length = 0; g.projectiles.length = 0;
    clearInterval(window.__lit);
    window.__lit = setInterval(() => { const q = window.__dbg.game(); if (!q) return; q.level.explored.fill(1); q.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
  }, [cls, seed, depth]);
  // The places this reads: walls and floor by the rules, with nothing but the dark where the screen is read.
  const sites = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const L = g.level; const f = L.floor;
    const low = d.renderer.lowWalls(L);
    const inside = (x, y) => x >= 0 && y >= 0 && x < f.w && y < f.h;
    const T = (x, y) => (inside(x, y) ? f.tiles[y * f.w + x] : 0);
    const C = (x, y) => (f.cut && inside(x, y) ? f.cut[y * f.w + x] : 0);
    const H = (x, y) => (f.height && inside(x, y) ? f.height[y * f.w + x] : 0);
    const S = (x, y) => (f.stair && inside(x, y) ? f.stair[y * f.w + x] : 0);
    const LOW = (x, y) => inside(x, y) && low[y * f.w + x] === 1;
    const plain = (x, y, level = 0) => T(x, y) === 1 && C(x, y) === 0 && S(x, y) === 0 && H(x, y) === level;
    const dark = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (T(x, y) === 1 || T(x, y) === 3) return false; return true; };
    const things = [...L.props, ...(L.stations || []), ...(L.portal ? [L.portal] : [])];
    const clear = (x, y, r) => !things.some((p) => Math.hypot(p.x - x, p.y - y) < r);
    const free = (x, y) => g.free(L.walk, x, y, 0.45);
    const out = { back: null, raised: null, near: null, notch: null, door: null, town: !!L.town };
    // (Version 18.5: where a door stands in its frame, or the boss's gate between its pillars. What 4 and 5 read are
    // doorways with nothing in them, as wide as they ever were; doors and the gate have a playtest of their own, doors.mjs.)
    const doorAt = new Set();
    for (const q of f.doors || []) { const line = q.out > 0 ? q.plane : q.plane - 1; for (let k = 0; k < 3; k++) doorAt.add(q.alongX ? line * f.w + q.a + k : (q.a + k) * f.w + line); }
    const DOOR = (x, y) => doorAt.has(y * f.w + x);
    for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) {
      if (T(x, y) !== 2 || C(x, y) !== 0) continue;
      // a wall that stands, its face turned to screen-left, floor at its foot, and nothing but the dark behind it and above it on the screen
      if (!LOW(x, y) && dark(x - 7, y - 7, x + 2, y) && clear(x + 0.5, y + 1.5, 2.2)) {
        if (!out.back && plain(x, y + 1) && plain(x, y + 2) && plain(x, y + 3) && free(x + 0.5, y + 3.5)) out.back = { x, y, hero: [x + 0.5, y + 3.5] };
        if (!out.raised && plain(x, y + 1, 1) && T(x, y + 2) === 1 && T(x, y + 3) === 1 && free(x + 0.5, y + 3.5)) out.raised = { x, y, hero: [x + 0.5, y + 3.5] };
      }
      // a wall toward the eye that is left out: floor right behind it (up the screen to the right), and nothing but the dark from it on toward the eye
      if (!out.near && LOW(x, y) && plain(x, y - 1) && plain(x, y - 2) && dark(x - 1, y, x + 7, y + 7) && clear(x + 0.5, y - 0.5, 2.6) && free(x + 0.5, y - 2.5)) out.near = { x, y, hero: [x + 0.5, y - 2.5] };
    }
    for (const r of f.rooms || []) {
      // a doorway three tiles wide in the back wall that runs down the screen to the right, and the two blocks after it
      const y = r.y - 1;
      for (let x = r.x; x + 4 < r.x + r.w && !out.notch; x++) {
        if (T(x - 1, y) !== 2 || T(x, y) !== 1 || T(x + 1, y) !== 1 || T(x + 2, y) !== 1 || T(x + 3, y) !== 2 || T(x + 4, y) !== 2) continue;
        if (DOOR(x, y) || DOOR(x + 1, y) || DOOR(x + 2, y)) continue;
        if (C(x + 3, y) || C(x + 4, y) || !plain(x + 3, y + 1) || !plain(x + 4, y + 1) || !free(x + 3.5, y + 3.5) || !clear(x + 3.5, y + 1.5, 2.6)) continue;
        out.notch = { x: x + 3, y, out: [LOW(x + 3, y), LOW(x + 4, y)], hero: [x + 3.5, y + 3.5] };
      }
      // a doorway three tiles wide on the side toward the eye that runs down the screen to the right (the row under the room), a corridor leading on from it
      // (three tiles wide for five tiles on: the walk of 5 ends 3.6 tiles out, short of any door further on and the stone beside it)
      const y2 = r.y + r.h;
      for (let x = r.x; x + 2 < r.x + r.w && !out.door; x++) {
        if (T(x - 1, y2) !== 2 || !plain(x, y2) || !plain(x + 1, y2) || !plain(x + 2, y2) || T(x + 3, y2) !== 2) continue;
        if (DOOR(x, y2) || DOOR(x + 1, y2) || DOOR(x + 2, y2)) continue;
        let ok = true;
        for (let k = 1; k <= 4 && ok; k++) ok = plain(x + 1, y2 + k) && plain(x + 1, y2 - k);
        for (let k = 1; k <= 5 && ok; k++) ok = plain(x, y2 + k) && plain(x + 1, y2 + k) && plain(x + 2, y2 + k) && !DOOR(x + 1, y2 + k);
        if (ok && clear(x + 1.5, y2, 3.5)) out.door = { x: x + 1.5, y: y2, room: r.id };
      }
    }
    return out;
  });
  // Stand the hero, let the view settle, and read a wall's face up its middle: at these heights above its foot.
  const HEIGHTS = [6, 14, 22, 30, 33, 36, 39, 43, 47, 52];
  // Where a wall that is left out is read: inside its own diamond (from its top corner: the middle is 8 below), where the
  // top of a wall cut down low was seen until Version 18.3. (The floor's edge beside it is a line of light: these keep off it.)
  const NEAR = [[0, 8], [0, 4], [-6, 9], [4, 10]];
  const readFace = async (site) => {
    await place(...site.hero);
    await page.waitForTimeout(900);
    const [px, py] = await corner(site.x, site.y);
    // (the face turned to screen-left hangs from the tile's lower-left edge: its middle column is 8 left of the tile's top corner, its foot there 12 below it)
    return light(HEIGHTS.map((h) => [px - 8, py + 12 - h]));
  };
  const faceChecks = (n, where, v, raised) => {
    log(`   lightness up the face ${where}`, HEIGHTS.map((h, i) => `${h}:${v[i]}`).join(' '));
    const stone = raised ? [v[2]] : [v[0], v[1], v[2]];
    const above = [v[7], v[8], v[9]];
    check(`${n} ${where}: stone below 28 pixels`, Math.min(...stone) > 16, `${stone.join(', ')}`);
    check(`${n} ${where}: fainter and fainter above that`, v[3] > v[5] && v[4] > v[6] && v[2] > v[6] * 1.6, `${v[3]}, ${v[4]}, ${v[5]}, ${v[6]} at 30, 33, 36, 39`);
    check(`${n} ${where}: and from 40 up nothing, the dark (no top of a wall)`, Math.max(...above) < 9, `${above.join(', ')} at 43, 47, 52`);
  };

  // ---- 1. the town -----------------------------------------------------------------------------
  await begin(6, 0);
  await page.waitForTimeout(900);
  await snap('town');
  if (fading) {
    const t = await sites();
    check('1. the town has a back wall to read', !!t.back, t.back ? `the wall at ${t.back.x}, ${t.back.y}` : 'none found');
    if (t.back) faceChecks('1.', 'in the town', await readFace(t.back), false);
    if (t.near) {
      await place(...t.near.hero);
      await page.waitForTimeout(900);
      const [px, py] = await corner(t.near.x, t.near.y);
      const v = await light(NEAR.map(([dx, dy]) => [px + dx, py + dy]));
      check('3. the town: nothing stands on the side toward the eye', Math.max(...v) < 9, `${v.join(', ')} where a wall is in the rules, at ${t.near.x}, ${t.near.y}`);
    } else check('3. the town has a side toward the eye to read', false, 'none found');
  }

  // ---- a dungeon that has every kind of place ---------------------------------------------------
  let found = null;
  for (let seed = 1; seed < 41 && !found; seed++) {
    await begin(seed, 2);
    const s = await sites();
    if (s.back && s.raised && s.near && s.notch && s.door) found = { seed, ...s };
  }
  check('a dungeon with a back wall, a wall behind raised floor, a side toward the eye, a back doorway and a near doorway to read', !!found, found ? `game seed ${found.seed}, Dungeon 2` : 'none in forty seeds');
  if (!found) return;
  await page.waitForTimeout(500);

  if (fading) {
    // 1. a back wall
    faceChecks('1.', 'in a dungeon', await readFace(found.back), false);
    await snap('1_a_back_wall');
    // 2. behind raised floor: the same top line (its foot is behind the raised floor, 12 pixels of it)
    faceChecks('2.', 'behind raised floor', await readFace(found.raised), true);
    await snap('2_behind_raised_floor');
    // 3. a side toward the eye
    await place(...found.near.hero);
    await page.waitForTimeout(900);
    let [px, py] = await corner(found.near.x, found.near.y);
    let v = await light(NEAR.map(([dx, dy]) => [px + dx, py + dy]));
    check('3. on a side toward the eye nothing stands where the rules have a wall: the dark', Math.max(...v) < 9, `${v.join(', ')} at ${found.near.x}, ${found.near.y}`);
    await snap('3_a_side_toward_the_eye');
    // 4. beside a doorway in a back wall
    check('4. beside a doorway in a back wall the two blocks that would hide the corridor are left out', found.notch.out[0] && found.notch.out[1], `${found.notch.out.join(', ')} at ${found.notch.x}, ${found.notch.y}`);
    await place(...found.notch.hero);
    await page.waitForTimeout(900);
    [px, py] = await corner(found.notch.x, found.notch.y);
    // (inside the two blocks' own diamonds: the second lies a tile down the screen to the right, 16 right and 8 down; left of its middle, clear of the face of the wall that stands next)
    v = await light([[px, py + 8], [px - 6, py + 9], [px + 12, py + 16], [px + 8, py + 13]]);
    check('   and there the screen is dark', Math.max(...v) < 9, `${v.join(', ')}`);
    await snap('4_beside_a_back_doorway');
  }

  // ---- 5. out through a doorway on a side toward the eye, and back, with real input ---------------
  {
    const dr = found.door;
    await place(dr.x, dr.y - 3.5);
    await page.waitForTimeout(900);
    const seen = [];
    let s = await st();
    const still = s.glow;
    s = await walk(0, 1, (q) => q.y >= dr.y + 3.6, 6000, (q) => seen.push(q.glow));
    const outAt = s.y;
    await snap('5_out_through_a_near_doorway');
    s = await walk(0, -1, (q) => q.y <= dr.y - 3.2, 6000, (q) => seen.push(q.glow));
    const sorted = [...seen].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    log('   the glow of the player (picture pixels)', `standing ${still}; walking: least ${sorted[0]}, median ${median}, most ${sorted[sorted.length - 1]} in ${seen.length} looks`);
    check('5. with real input the hero walks out through a doorway on a side toward the eye, and back in', outAt >= dr.y + 3.4 && s.y <= dr.y - 3 && s.floor, `out to y ${outAt.toFixed(2)}, back to ${s.y.toFixed(2)} (the doorway is at y ${dr.y})`);
    // (how much of that glow a figure shows changes with every frame of its stride, and from hero to hero: this asks only
    // that it never goes out. That nothing is DRAWN toward the eye is what 3 reads off the screen, and tests/walls.test.ts
    // holds that no wall stands over floor.)
    check('   and all the way he is seen', seen.length >= 12 && sorted[0] >= 20 && sorted[0] > median * 0.3, `least ${sorted[0]} against a median of ${median}`);
    await snap('5_back_in');
  }

  // ---- 6. a frame, with walls all round -----------------------------------------------------------
  await place(...found.back.hero);
  await page.waitForTimeout(300);
  const frames = await page.evaluate(() => new Promise((done) => {
    const times = []; let last = performance.now(); let n = 0;
    const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 90) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ median: Math.round(times[45] * 10) / 10, worst: Math.round(times[89] * 10) / 10 }); } };
    requestAnimationFrame(tick);
  }));
  log('frames (ms), in a room', frames);
  check('6. a frame is drawn in good time', frames.median <= 25, `${frames.median} ms`);

  // ---- pictures ---------------------------------------------------------------------------------
  // a room with raised floor (the one read above), from its middle
  const pic = async (name, x, y) => {
    const at = await page.evaluate(([cx, cy]) => {
      const g = window.__dbg.game(); const h = g.hero;
      let best = null; let bd = 1e9;
      for (let y = cy - 3; y <= cy + 3; y += 0.5) for (let x = cx - 3; x <= cx + 3; x += 0.5) {
        if (!g.free(g.level.walk, x, y, 0.45)) continue;
        const d = Math.hypot(x - cx, y - cy);
        if (d < bd) { bd = d; best = [x, y]; }
      }
      if (best) { h.x = best[0]; h.y = best[1]; h.move = null; h.fx = 0.7; h.fy = 0.7; }
      return best;
    }, [x, y]);
    await page.waitForTimeout(900);
    await snap(name);
    return at;
  };
  await pic('a_room_with_raised_floor', found.raised.x + 0.5, found.raised.y + 4.5);
  // a corridor straight across the screen, and an eight-sided hall: the first dungeon that has each
  let band = null;
  let hall = null;
  for (let seed = 1; seed < 41 && !(band && hall); seed++) {
    await begin(seed, 2);
    const got = await page.evaluate(() => {
      const f = window.__dbg.game().level.floor;
      const inRoom = (x, y) => f.rooms.some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
      let band = null;
      if (f.cut) for (let i = 0; i < f.cut.length && !band; i++) {
        if (f.cut[i] !== 1 || f.tiles[i] !== 1 || inRoom(i % f.w, Math.floor(i / f.w))) continue;
        const run = [];
        for (let j = i; j >= 0 && j < f.cut.length && f.cut[j] === 1 && f.tiles[j] === 1 && !inRoom(j % f.w, Math.floor(j / f.w)); j += f.w - 1) run.push(j);
        if (run.length >= 6) { const m = run[Math.floor(run.length / 2)]; band = [(m % f.w) + 1.5, Math.floor(m / f.w) + 1.5]; }
      }
      let hall = null;
      for (const r of f.rooms) {
        const cutOf = (cx, cy, sx) => { let k = 0; while (k < 9 && f.tiles[cy * f.w + cx + k * sx] !== 1) k++; return k; };
        const x1 = r.x + r.w - 1; const y1 = r.y + r.h - 1;
        if (Math.min(cutOf(r.x, r.y, 1), cutOf(x1, r.y, -1), cutOf(r.x, y1, 1), cutOf(x1, y1, -1)) >= 2) { hall = [r.x + r.w / 2, r.y + r.h / 2]; break; }
      }
      return { band, hall };
    });
    if (!band && got.band) { band = got.band; await pic('a_corridor_across_the_screen', ...got.band); }
    if (!hall && got.hall) { hall = got.hall; await pic('an_eight_sided_hall', ...got.hall); }
  }
  check('pictures: a corridor across the screen and an eight-sided hall were found', !!band && !!hall, `${band ? 'a corridor' : 'no corridor'}, ${hall ? 'a hall' : 'no hall'}`);

  // (the look as it was found)
  await page.evaluate((was) => { clearInterval(window.__lit); if (was) window.__dbg.walls(was); }, other ? look.was : null);
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `walls: ${fails} thing(s) wrong` : 'walls: ok');
}
