// A CORRIDOR STRAIGHT ACROSS THE SCREEN, PLAYED: with real input.
//
// The owner, 7 Oct 2026, 08:01, of stills that had one in them: "Triangles look pretty good I like
// it"; and at 12:39, of the picture of three in a real dungeon and the question "Want it in?":
// "Let’s try it out". IN THE GAME SINCE VERSION 18.3. Some rooms are joined corner to corner by a
// band of floor that runs straight across the screen (game/dungeon.ts, Across and cutBands; the
// switch RELIEF.across, with RELIEF.cuts): a row of half tiles under a flat wall that faces the
// eye, three whole rows, a row of half tiles under a wall cut down low. This sets both switches
// for itself and puts them back as it found them (so it tests the corridor whichever way they
// stand), finds a dungeon that has one, and with the keyboard and the mouse on a PC, the stick and
// a swipe on a phone:
//   1. the hero walks the corridor from end to end, straight across the screen;
//   2. walks straight into its far wall, and into its near wall, and is stopped by each at their
//      own half width, standing on a half tile of floor;
//   3. pushed against the far wall at a slant, slides along it;
//   4. the swipe move at the far wall does not land in it;
//   5. a skeleton at the other end comes through the corridor to them;
//   and through all of it nobody's middle was ever in the wall half of a tile. A frame is timed
//   with the corridor in view.
//   CLS=warrior node tools/playtest.mjs --scenario tools/scenarios/across.mjs --out shots/across/pc
import { makeHands, log } from './lib.mjs';

const R = 0.3; // (game/defs.ts, TUNE.heroRadius: half a hero's width, in tiles)
const R2 = Math.SQRT1_2;

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = hands.touch;
  const client = hands.client;
  const cls = process.env.CLS || 'warrior';
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  // ---- hands (as in slants.mjs) ---------------------------------------------------------------
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
  const watch = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const L = g.level; const f = L.floor;
    const W = (window.__watch = { inside: [], seen: 0 });
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

  // ---- a dungeon with a corridor straight across the screen (both switches set for this, and put back) ----
  const found = await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false);
    const was = [d.relief.cuts, d.relief.across];
    d.relief.cuts = true; d.relief.across = true;
    let out = null;
    for (let seed = 1; seed < 41 && !out; seed++) {
      d.run(cls, seed); /* (THE FIRST LEVELS, since Version 19.5: a hero this far in has the wordsmith's ring lit; with it dark the fallen wordsmith would lie in this dungeon too, and the playtests' own player would go to him first) */ d.seasoned(1);
      const g = d.game(); g.depth = 2; g.enterDungeon();
      const f = g.level.floor;
      if (!f.cut) continue;
      const inRoom = (x, y) => f.rooms.some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
      const taken = new Set();
      // the far side of a corridor across the screen: a run of half tiles of floor in no room, cut FAR (1), each next one a tile right and a tile up the map
      for (let i = 0; i < f.cut.length && !out; i++) {
        if (f.cut[i] !== 1 || f.tiles[i] !== 1 || taken.has(i) || inRoom(i % f.w, Math.floor(i / f.w))) continue;
        const run = [];
        for (let j = i; j >= 0 && j < f.cut.length && f.cut[j] === 1 && f.tiles[j] === 1 && !taken.has(j) && !inRoom(j % f.w, Math.floor(j / f.w)); j += f.w - 1) { run.push(j); taken.add(j); }
        for (let j = i - f.w + 1; j >= 0 && f.cut[j] === 1 && f.tiles[j] === 1 && !taken.has(j) && !inRoom(j % f.w, Math.floor(j / f.w)); j -= f.w - 1) { run.push(j); taken.add(j); }
        if (run.length < 6) continue;
        const ts = run.map((j) => (j % f.w) - Math.floor(j / f.w));
        // (`far`: x + y of the tiles of its far side; the far wall's line is x + y = far + 1, the near wall's x + y = far + 5, its middle x + y = far + 3)
        out = { seed, far: (run[0] % f.w) + Math.floor(run[0] / f.w), t0: Math.min(...ts), t1: Math.max(...ts), long: run.length };
      }
    }
    d.relief.cuts = was[0]; d.relief.across = was[1];
    if (!out) return null;
    d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game();
    g.wakeUp = () => {};
    g.monsters.length = 0; g.projectiles.length = 0;
    g.level.explored.fill(1);
    return out;
  }, [cls]);
  check('a dungeon with a corridor straight across the screen', !!found, found ? `seed ${found.seed}: ${found.long} tiles long, its far side on x + y = ${found.far}, from x - y = ${found.t0} to ${found.t1}` : 'none in forty seeds');
  if (!found) return;
  await page.waitForTimeout(500);
  await watch();
  // (a place on the corridor's middle line, by how far along it is: x - y)
  const onMid = (t) => [(found.far + 3 + t) / 2, (found.far + 3 - t) / 2];
  const offFar = (x, y) => (x + y - (found.far + 1)) * R2;
  const offNear = (x, y) => (found.far + 5 - (x + y)) * R2;
  const along = (q) => q.x - q.y;

  // 1. from end to end, straight across the screen (+x and -y in the world: to the right on the screen)
  await place(...onMid(found.t0 + 1));
  await page.waitForTimeout(250);
  await snap('1_at_its_left_end');
  let s = await walk(1, -1, (q) => along(q) >= found.t1 - 1, 9000);
  check('1. the hero walks the corridor from end to end, straight across the screen', along(s) >= found.t1 - 1.2 && offFar(s.x, s.y) >= R - 0.01 && offNear(s.x, s.y) >= R - 0.01, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}: ${(along(s) - found.t0).toFixed(1)} of ${found.t1 - found.t0} along it`);
  await snap('1_at_its_right_end');

  // 2. straight into its far wall, and into its near wall
  // (from the middle line, in line with the middle of a tile of the far side: x - y of those tiles goes in twos from t0)
  const mid = found.t0 + 2 * Math.round((found.t1 - found.t0) / 4);
  await place(...onMid(mid));
  await page.waitForTimeout(150);
  s = await walk(-1, -1, (q) => offFar(q.x, q.y) < R + 0.02, 3500);
  let off = offFar(s.x, s.y);
  check("2. walking into the far wall: stopped at half a hero's width from it", off >= R - 0.01 && off <= R + 0.12, `${off.toFixed(3)} tiles from it, at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  check('   and stands on a half tile of floor', s.cut !== 0 && s.floor, `cut ${s.cut}`);
  await snap('2_at_the_far_wall');
  await place(...onMid(mid));
  await page.waitForTimeout(150);
  s = await walk(1, 1, (q) => offNear(q.x, q.y) < R + 0.02, 3500);
  off = offNear(s.x, s.y);
  check("   walking into the near wall: stopped at half a hero's width from it", off >= R - 0.01 && off <= R + 0.12, `${off.toFixed(3)} tiles from it, at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  check('   and stands on a half tile of floor', s.cut !== 0 && s.floor, `cut ${s.cut}`);
  await snap('2_at_the_near_wall');

  // 3. pushed against the far wall at a slant (toward -x: up and to the left on the screen), the hero slides along it, to the left
  const from = found.t1 - 3;
  await place(...onMid(from));
  await page.waitForTimeout(150);
  s = await walk(-1, 0, (q) => along(q) < from - 2.5, 5000);
  check('3. pushed against the far wall at a slant, the hero slides along it', along(s) < from - 2 && offFar(s.x, s.y) >= R - 0.01 && offFar(s.x, s.y) <= R + 0.15, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}: ${(from - along(s)).toFixed(1)} along it, ${offFar(s.x, s.y).toFixed(3)} from the wall`);

  // 4. the swipe move at the far wall
  await place(...onMid(mid));
  await page.waitForTimeout(350);
  const [mx, my] = onMid(mid);
  s = await swipeTo(mx - 2.4, my - 2.4);
  check('4. the swipe move at the far wall does not land in it', offFar(s.x, s.y) >= R - 0.01 && s.floor, `at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}, ${offFar(s.x, s.y).toFixed(3)} from it`);
  await snap('4_swiped_at_it');

  // a frame, with the corridor in view
  await place(...onMid(mid));
  await page.waitForTimeout(300);
  const frames = await page.evaluate(() => new Promise((done) => {
    const times = []; let last = performance.now(); let n = 0;
    const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 90) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ median: Math.round(times[45] * 10) / 10, worst: Math.round(times[89] * 10) / 10 }); } };
    requestAnimationFrame(tick);
  }));
  log('frames (ms), a corridor across the screen in view', frames);
  check('a frame is drawn in good time with the corridor in view', frames.median <= 25, `${frames.median} ms`);

  // 5. a skeleton at the other end comes through the corridor
  await place(...onMid(found.t1 - 1));
  await page.evaluate(([x, y]) => {
    const g = window.__dbg.game();
    delete g.wakeUp;
    const m = g.spawn('skeleton', x, y, 900, 0, false, g.rng); m.xp = 0; m.seen = true; g.wakeUp(m);
  }, onMid(found.t0 + 1));
  const came = await hands.until(() => { const g = window.__dbg.game(); const h = g.hero; return g.monsters.some((m) => !m.dead && Math.hypot(m.x - h.x, m.y - h.y) < 1.6); }, 15000);
  s = await st();
  check('5. a skeleton at the other end comes through the corridor to them', came, `the hero at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('5_came_through');
  check('nobody was ever in the wall half of a tile', !!s.watch && s.watch.seen > 100 && s.watch.inside.length === 0, s.watch ? `${s.watch.seen} steps watched ${s.watch.inside.join('; ')}` : 'not watched');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `across: ${fails} thing(s) wrong` : 'across: ok');
}
