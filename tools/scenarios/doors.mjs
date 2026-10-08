// DOORS AND THE BOSS'S GATE (src/game/doors.ts; their pictures src/art/gates.ts; render.ts, standDoors).
//
// The owner, 7 Oct 2026, 14:01: "wrought iron jail style bar doors that swing open [...] Dungeon
// Boss always has a big gate that locks you in with him once you pass through the opening. [...]
// Doors are always unlocked and open as you get near them."; 16:57: "I’d like the gate to have an
// arch of stone above it.  And I’d like the boss gate to have some sort of emblem in the middle of
// the arch.  And the doors look too much like the gate.  Give them a stone outline to make the door
// smaller than the hallway width.  Have it open from one side, not from the middle on both sides".
//
// What this holds, on the page itself, in Dungeon DEPTH of game seed SEED (lit, and empty but for
// the boss, who sleeps):
//   1. the level has doors, every one of them shut, and one gate, which is up;
//   2. A DOOR IN A BACK WALL, and 3. ONE ON A SIDE TOWARD THE EYE: shut, its bars are seen across
//      its opening and the stone of its lintel over it (read off the canvas); WITH REAL INPUT the
//      hero walks out through it and back in: it is open before he reaches it, he is seen all the
//      way, and open its opening is clear of bars;
//   4. A BRUTE, who is more than a tile across, comes through a door after the hero;
//   5. THE BOSS'S GATE: up, its doorway is clear and the mark in its arch is in embers; the hero
//      goes well inside and it falls: bars across the doorway, the mark alight; with real input
//      he walks at it and is held; the boss dies and it rises; he walks out under it;
//   6. a frame is drawn in good time beside a door.
// (The map-maker's switch for doors is on since Version 18.5. This playtest sets it for the dungeon
// it makes all the same, and puts it back, so that it can be run on a page whose switch is off.)
//   SEED=6 DEPTH=2 node tools/playtest.mjs --file <page> [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/doors.mjs --out shots/doors
import { makeHands, log } from './lib.mjs';

/** (game/doors.ts) */
const DOOR_NEAR = 2.6;
const GATE_INSIDE = 2.2;

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = hands.touch;
  const client = hands.client;
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 6);
  const depth = Number(process.env.DEPTH || 2);
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  // ---- hands (as in walls.mjs) -------------------------------------------------------------------
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
  // (where the hero is; `glow`: how many picture pixels of the cyan that marks the player are seen on and about him; and the door asked about)
  const st = (door = -1) => page.evaluate((door) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const s = d.screen; const c = d.cam();
    const k = s.canvas.width / s.w;
    const lift = c.lift ? c.lift(h.x, h.y) : 0;
    const X = c.ox + (h.x - h.y) * 16; const Y = c.oy + (h.x + h.y) * 8 - lift;
    const x0 = Math.max(0, Math.round((X - 16) * k)); const y0 = Math.max(0, Math.round((Y - 38) * k));
    const w = Math.max(1, Math.min(s.canvas.width - x0, Math.round(32 * k))); const hh = Math.max(1, Math.min(s.canvas.height - y0, Math.round(44 * k)));
    const px = s.g.getImageData(x0, y0, w, hh).data;
    let glow = 0;
    for (let j = 0; j < px.length; j += 4) if (px[j + 2] > 170 && px[j + 1] > 150 && px[j] < 150 && px[j + 2] - px[j] > 60) glow++;
    const q = door >= 0 ? g.level.doors[door] : null;
    const sp = q ? q.spot : null;
    return { x: h.x, y: h.y, glow, w: s.w, h: s.h, open: q ? q.open : -1, want: q ? q.want : -1, inside: sp ? ((sp.alongX ? h.y : h.x) - sp.plane) * -sp.out : 0 };
  }, door);
  const place = (x, y) => page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.move = null; h.fx = 0.7; h.fy = 0.7; }, [x, y]);
  /**
   * WALK TO A PLACE WITH REAL INPUT, aiming again at every look: the stick points at it; the keys
   * walk in eight directions of the screen, and the nearest of them to the way there is held. (A
   * hallway runs along the grid, which none of the eight does: a player at the keys steers so too.)
   */
  const walkTo = async (tx, ty, door, done, ms, each) => {
    let s = await st(door);
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
      s = await st(door);
      if (each) await each(s);
      if (done(s) || Math.hypot(tx - s.x, ty - s.y) < 0.25) break;
      await aim(s);
      await page.waitForTimeout(50);
    }
    if (stick) await up(1); else await letGo();
    await page.waitForTimeout(160);
    return st(door);
  };

  // ---- 0. the switch, and a dungeon laid with doors, lit, asleep and empty but for the boss -------
  const game = await page.evaluate(() => window.__dbg.doors.on);
  log('the map-maker\'s switch for doors, in the game', game ? 'on' : 'OFF (this playtest sets it for its own dungeon, and puts it back)');
  check('0. doors are in the game: the map-maker\'s switch is on', game === true || process.env.OFF === '1');
  const begun = await page.evaluate(([cls, seed, depth]) => {
    const d = window.__dbg; d.saving(false);
    const was = d.doors.on;
    d.doors.on = true;
    d.run(cls, seed);
    const g = d.game();
    g.depth = depth; g.enterDungeon();
    d.doors.on = was;
    d.autoLevel = false; d.autoWords = false; d.god = true;
    g.wakeUp = () => {};
    g.monsters = g.monsters.filter((m) => m.boss);
    for (const m of g.monsters) m.state = 'sleep';
    g.projectiles.length = 0;
    clearInterval(window.__lit);
    window.__lit = setInterval(() => { const q = window.__dbg.game(); if (!q) return; q.level.explored.fill(1); q.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
    const L = g.level; const f = L.floor;
    // (a place `by` tiles inside a door's line, in line with the middle of its opening; negative: out in the corridor)
    const line = (s) => (s.out > 0 ? s.plane : s.plane - 1);
    const mid = (s) => (s.alongX ? { x: s.a + 1.5, y: line(s) + 0.5 } : { x: line(s) + 0.5, y: s.a + 1.5 });
    const inLine = (s, by) => (s.alongX ? { x: mid(s).x, y: s.plane - s.out * by } : { x: s.plane - s.out * by, y: mid(s).y });
    const things = [...L.props, ...(L.portal ? [L.portal] : [])];
    const clearWay = (s) => {
      for (let by = -6; by <= 4.5; by += 0.5) {
        const p = inLine(s, by);
        if (L.walk[Math.floor(p.y) * f.w + Math.floor(p.x)] !== 1 || !g.free(L.walk, p.x, p.y, 0.45)) return false;
        // (and nothing that stands close beside the way: the canvas is read there)
        if (by > -1 && by < 3 && things.some((t) => Math.hypot(t.x - p.x, t.y - p.y) < 1.6)) return false;
      }
      return true;
    };
    const site = (near) => {
      const i = L.doors.findIndex((q) => q.spot.kind === 'door' && q.spot.near === near && clearWay(q.spot));
      if (i < 0) return null;
      const s = L.doors[i].spot;
      return { i, spot: s, mid: mid(s), face: line(s) + 1 };
    };
    const gi = L.doors.findIndex((q) => q.spot.kind === 'bossgate');
    const gs = gi >= 0 ? L.doors[gi].spot : null;
    return {
      doors: L.doors.filter((q) => q.spot.kind === 'door').length,
      shut: L.doors.filter((q) => q.spot.kind === 'door' && q.open === 0 && q.want === 0).length,
      gates: L.doors.filter((q) => q.spot.kind === 'bossgate').length,
      gateUp: gi >= 0 && L.doors[gi].open === 1 && L.doors[gi].want === 1,
      rooms: f.rooms.length,
      piers: L.pier ? L.pier.reduce((n, v) => n + v, 0) : 0,
      back: site(false),
      near: site(true),
      gate: gs ? { i: gi, spot: gs, mid: mid(gs), face: line(gs) + 1 } : null,
      boss: !!g.boss,
    };
  }, [cls, seed, depth]);
  log('Dungeon ' + depth + ' of game seed ' + seed, `${begun.rooms} rooms, ${begun.doors} doors (${begun.piers} tiles of stone beside them), ${begun.gates} gate`);
  check('1. the level has doors, every one of them shut, and one gate, which is up', begun.doors >= 5 && begun.shut === begun.doors && begun.gates === 1 && begun.gateUp && begun.piers === begun.doors * 2 && begun.boss, `${begun.shut} of ${begun.doors} shut`);
  if (!begun.back || !begun.near || !begun.gate) {
    check('a door in a back wall, a door on a side toward the eye and the gate, each with a clear way to it', false, JSON.stringify({ back: !!begun.back, near: !!begun.near, gate: !!begun.gate }));
    console.log(`doors: ${fails} thing(s) wrong`);
    return;
  }

  const inLine = (s, by) => (s.alongX ? { x: s.a + 1.5, y: s.plane - s.out * by } : { x: s.plane - s.out * by, y: s.a + 1.5 });
  /**
   * What is seen in the plane a door or gate stands in, read off the canvas: over `tiles` tiles of
   * that plane from `t0` tiles along it from where the doorway begins, and from 3 to `high` game
   * pixels over the floor, how many of the places looked at are LIGHT (iron bars in the light are;
   * the floor and the dark behind them are not), how many are at least as light as dressed STONE
   * is on its side in shade, and how many are the fire of the enemy (alight, or in embers).
   */
  const seenIn = (site, t0, tiles, lo, high) => page.evaluate(([s, face, t0, tiles, lo, high]) => {
    const d = window.__dbg; const sc = d.screen; const c = d.cam();
    const k = sc.canvas.width / sc.w;
    const img = sc.g.getImageData(0, 0, sc.canvas.width, sc.canvas.height);
    let light = 0; let stone = 0; let fire = 0; let embers = 0; let n = 0;
    for (let t = t0 + 0.12; t <= t0 + tiles - 0.12; t += 1 / 32) {
      const x = s.alongX ? s.a + t : face;
      const y = s.alongX ? face : s.a + t;
      const X = c.ox + (x - y) * 16; const Y0 = c.oy + (x + y) * 8;
      for (let v = lo; v <= high; v += 0.5) {
        const px = Math.round(X * k); const py = Math.round((Y0 - v) * k);
        if (px < 0 || py < 0 || px >= img.width || py >= img.height) continue;
        const i = (py * img.width + px) * 4;
        const r = img.data[i]; const g2 = img.data[i + 1]; const b = img.data[i + 2];
        const lum = 0.2126 * r + 0.7152 * g2 + 0.0722 * b;
        n++;
        // (fire alight is orange to pale yellow: red, a good deal of green, less blue. The arch may stand at the edge of the
        // hero's light, where everything is dimmer: so it is told by its hue and not by how bright it is)
        if (r >= 150 && g2 >= 90 && g2 > b + 15) fire++;
        else if (r > 140 && g2 < 80 && b > 60 && b < 160) embers++;
        else if (lum > 78) light++;
        if (lum > 56) stone++;
      }
    }
    return { light, stone, fire, embers, n };
  }, [site.spot, site.face, t0, tiles, lo, high]);
  const doorState = (i) => page.evaluate((i) => { const q = window.__dbg.game().level.doors[i]; return { open: q.open, want: q.want }; }, i);

  // ---- 2 and 3. a door: in a back wall, and on a side toward the eye --------------------------------
  let n = 2;
  for (const [where, site] of [['in a back wall', begun.back], ['on a side toward the eye', begun.near]]) {
    const s = site.spot;
    const name = where.replace(/ /g, '_');
    // inside the room, too far off to open it
    const from = inLine(s, 3.4);
    const out = inLine(s, -3.4);
    await place(from.x, from.y);
    await page.waitForTimeout(900);
    let ds = await doorState(site.i);
    // (its bars: across the whole opening. Its foot, on the far half of the opening from its hinge: bars when it is shut,
    // and nothing when it is open, for an open leaf is swung back and is seen through the opening only higher up)
    const shut = await seenIn(site, 1, 1, 3, 25);
    const footShut = await seenIn(site, 1.4, 0.6, 2.5, 6.5);
    const lintel = await seenIn(site, 1, 1, 31, 34);
    await snap(`${n}_a_door_${name}_shut`);
    check(`${n}. a door ${where}: from 3.9 tiles off it is shut, and its bars are seen across its opening`, ds.open === 0 && ds.want === 0 && shut.light >= 60 && footShut.light >= 8, `${shut.light} light places of ${shut.n} in its opening, ${footShut.light} of ${footShut.n} at its foot`);
    check('   and the stone of its lintel over it', lintel.stone >= lintel.n * 0.6, `${lintel.stone} of ${lintel.n}`);
    // out through it with real input
    const seen = [];
    let openAt = -1;
    // (LEAST=1: a picture of the moment he is seen least, to be looked at. Not in the regression: a picture takes time, and
    // the walk goes on while it is taken.)
    let least = 60;
    const look = async (z) => {
      seen.push(z.glow);
      if (process.env.LEAST === '1' && z.glow < least) { least = z.glow; await snap(`${n}_least_seen_${name}`); log('   (seen least so far)', `${z.glow} at ${z.inside.toFixed(2)} inside`); }
    };
    // (HOW FAR OFF HE IS WHEN IT FIRST STANDS OPEN IS NOTED ON THE PAGE, after every step of the game. Looked at from
    // outside, about twenty times a second at best, a late look saw the open door late: the playtests of Version
    // 18.5's published page read 0.53 tiles once, on a busy machine, where the game's own clock has about 1.1.)
    await page.evaluate(([i, mx, my]) => {
      const g = window.__dbg.game();
      window.__openAt = -1;
      const step = g.update.bind(g);
      g.update = (dt, c) => {
        step(dt, c);
        const d = g.level.doors[i];
        if (window.__openAt < 0 && d && d.open === 1) window.__openAt = Math.hypot(g.hero.x - mx, g.hero.y - my);
      };
    }, [site.i, site.mid.x, site.mid.y]);
    let q = await walkTo(out.x, out.y, site.i, (z) => z.inside <= -3.2, 9000, look);
    openAt = await page.evaluate(() => { const g = window.__dbg.game(); delete g.update; return window.__openAt; });
    const outAt = q.inside;
    ds = await doorState(site.i);
    check('   with real input the hero walks out through it', outAt <= -3 && ds.open === 1, `he is ${(-outAt).toFixed(2)} tiles out in the corridor`);
    check('   it stood open before he reached it', openAt > 0.8 && openAt < DOOR_NEAR, `open when he was ${openAt.toFixed(2)} tiles from the middle of it`);
    // back in, to where its opening is read again: open
    q = await walkTo(from.x, from.y, site.i, (z) => z.inside >= 3.2, 9000, look);
    const sorted = [...seen].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    log('   the glow of the player (picture pixels)', `walking: least ${sorted[0]}, median ${median}, most ${sorted[sorted.length - 1]} in ${seen.length} looks`);
    // (how much of that glow a figure shows changes with every frame of its stride and with the way it faces, and for a
    // moment the post and the lintel of the frame stand before a part of it: this asks only that it never goes out)
    check('   and back in; and all the way he is seen', q.inside >= 3 && seen.length >= 12 && sorted[0] >= 8, `back to ${q.inside.toFixed(2)} inside; least ${sorted[0]} against a median of ${median}`);
    await place(from.x, from.y);
    await page.waitForTimeout(700);
    const footOpen = await seenIn(site, 1.4, 0.6, 2.5, 6.5);
    await snap(`${n}_a_door_${name}_open`);
    check('   open, the foot of its opening is clear of bars, and it stays open', footOpen.light <= 2 && (await doorState(site.i)).open === 1, `${footOpen.light} light places where there were ${footShut.light}`);
    n++;
  }

  // ---- 4. a brute comes through a door ---------------------------------------------------------------
  {
    const site = begun.back;
    const s = site.spot;
    const inPlace = inLine(s, 2.5);
    const out = inLine(s, -3.5);
    await place(inPlace.x, inPlace.y);
    const r = await page.evaluate(([x, y]) => {
      const g = window.__dbg.game();
      delete g.wakeUp;
      const b = g.spawn('brute', x, y, 901, 0, false, g.rng);
      g.wakeUp(b);
      window.__brute = b;
      return b.r;
    }, [out.x, out.y]);
    let through = null;
    const t0 = Date.now();
    while (Date.now() - t0 < 12000 && through === null) {
      const at = await page.evaluate((sp) => { const b = window.__brute; return ((sp.alongX ? b.y : b.x) - sp.plane) * -sp.out; }, s);
      if (at > 0.3) through = (Date.now() - t0) / 1000;
      else await page.waitForTimeout(80);
    }
    await snap('4_a_brute_comes_through');
    check(`4. a brute (${r} of a tile from its middle to its side: more than a tile across) comes through a door after the hero`, through !== null, through !== null ? `in ${through.toFixed(1)} seconds` : 'not in 12 seconds');
    await page.evaluate(() => { const g = window.__dbg.game(); g.monsters = g.monsters.filter((m) => m.boss); g.wakeUp = () => {}; });
  }

  // ---- 5. the boss's gate -------------------------------------------------------------------------------
  {
    const site = begun.gate;
    const s = site.spot;
    // out in the corridor before it: up
    let p = inLine(s, -3);
    await place(p.x, p.y);
    await page.waitForTimeout(900);
    let ds = await doorState(site.i);
    const up0 = await seenIn(site, 0, 3, 3, 25);
    const arch0 = await seenIn(site, 1.1, 0.8, 40, 58);
    await snap('5_the_gate_up');
    check('5. the boss\'s gate: with the hero out in the corridor it is up, and its doorway is clear', ds.open === 1 && ds.want === 1 && up0.light <= 150, `${up0.light} light places of ${up0.n} in its doorway`);
    check('   its arch stands over the doorway, and the mark in the middle of it is in embers', arch0.light + arch0.embers >= arch0.n * 0.35 && arch0.embers >= 4 && arch0.fire === 0, `${arch0.light} of stone, ${arch0.embers} of embers, ${arch0.fire} alight, of ${arch0.n}`);
    // well inside: it falls
    p = inLine(s, GATE_INSIDE + 1.2);
    await place(p.x, p.y);
    await page.waitForTimeout(800);
    ds = await doorState(site.i);
    const down = await seenIn(site, 0, 3, 3, 25);
    const arch1 = await seenIn(site, 1.1, 0.8, 40, 58);
    await snap('5_the_gate_down_behind_him');
    check('   the hero goes well inside: it falls, and its bars are across the doorway', ds.open === 0 && ds.want === 0 && down.light >= 600 && down.light > up0.light * 5, `${down.light} light places where there were ${up0.light}`);
    check('   and the mark is alight', arch1.fire >= 6, `${arch1.fire} alight (${arch1.embers} of embers before: ${arch0.embers})`);
    // with real input he walks at it, and is held
    const beyond = inLine(s, -3);
    let q = await walkTo(beyond.x, beyond.y, site.i, () => false, 2600);
    check('   with real input he walks at it for two seconds and more, and is held inside', q.inside >= 0.25 && q.want === 0, `${q.inside.toFixed(2)} tiles inside its line`);
    // the boss dies: it rises
    await page.evaluate(() => { const g = window.__dbg.game(); if (g.boss) g.damageMonster(g.boss, 1e9, 'phys', false, -1); });
    await page.waitForTimeout(1700);
    ds = await doorState(site.i);
    check('   the boss dies: it rises', ds.open === 1 && ds.want === 1, `open ${ds.open}`);
    q = await walkTo(beyond.x, beyond.y, site.i, (z) => z.inside <= -2, 9000);
    check('   and he walks out under it', q.inside <= -1.8, `${(-q.inside).toFixed(2)} tiles out`);
    await page.waitForTimeout(500);
    const up1 = await seenIn(site, 0, 3, 3, 25);
    await snap('5_out_under_the_gate');
    check('   and behind him the doorway is clear again', up1.light <= 150, `${up1.light} light places in its doorway`);
  }

  // ---- 6. a frame, beside a door -------------------------------------------------------------------------
  {
    const p = inLine(begun.near.spot, 2);
    await place(p.x, p.y);
    await page.waitForTimeout(300);
    const frames = await page.evaluate(() => new Promise((done) => {
      const times = []; let last = performance.now(); let n = 0;
      const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 90) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ median: Math.round(times[45] * 10) / 10, worst: Math.round(times[89] * 10) / 10 }); } };
      requestAnimationFrame(tick);
    }));
    log('frames (ms), beside a door', frames);
    check('6. a frame is drawn in good time', frames.median <= 25, `${frames.median} ms`);
  }

  await page.evaluate(() => { clearInterval(window.__lit); });
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `doors: ${fails} thing(s) wrong` : 'doors: ok');
}
