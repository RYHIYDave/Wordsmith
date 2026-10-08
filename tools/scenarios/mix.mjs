// (THE MIX: NOT IN ANY DUNGEON YET) A LEVER, ITS GATE AND A ROOM THAT LOCKS, in the hall laid by hand
// for them (game/level.ts, makeMixHall; the rules: game.ts, `pullLever`, `updateLocks`).
//
// The owner, 7 Oct 2026, 14:01: "They can be closed with levers or switches nearby to open them."
// 17:51: "We can mix it up with the doors and the gates to make more different and interesting
// layouts for the whole dungeon."
//
// What this holds, on the page itself, WITH REAL INPUT:
//   1. the hall is as its plan says: a lever's gate, down; the lever, not pulled; two gates of
//      the room that locks, up;
//   2. the hero walks at the gate and is held by it; a line on the screen says what it is;
//   3. he walks to the nook, whose door opens for him, and up to the lever: it is pulled, the
//      gate rises, a line says so;
//   4. he walks through the gate, through the gated room and on into the room that locks, where
//      a pack stands: its gates fall behind him, and he walks at one and is held;
//   5. the pack dies: the gates rise, and he walks out by the way on.
// STILLS of each, for looking at (LOOK=1 leaves the hall lit: every room seen).
//   CLS=warrior node tools/playtest.mjs --file <page> [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/mix.mjs --out shots/mix/pc
import { makeHands, log } from './lib.mjs';

/** (game/level.ts, MIX_HALL; game/doors.ts) */
const LEVER = { x: 10.5, y: 3.5 };
const GATE = { x: 20.5, y: 16.5 };
const LOCKS = { x: 34, y: 10, w: 10, h: 12 };
const WEST = { x: 33.5, y: 16.5 };
const LEVER_NEAR = 1.5;
const LOCK_CLEAR = 2.7;

export default async function (page, snap) {
  const hands = await makeHands(page);
  const touch = hands.touch;
  const client = hands.client;
  const cls = process.env.CLS || 'warrior';
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  // ---- hands (as in doors.mjs) -------------------------------------------------------------------
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
    const d = window.__dbg; const g = d.game(); const h = g.hero; const L = g.level;
    const lever = L.props.find((p) => p.kind === 'lever');
    return {
      x: h.x, y: h.y, w: d.screen.w, h: d.screen.h,
      lever: lever ? lever.state : -1,
      doors: L.doors.map((q) => ({ kind: q.spot.kind, room: q.spot.room, open: q.open, want: q.want })),
      said: d.fx.messages.map((m) => m.text),
    };
  });
  /** WALK TO A PLACE WITH REAL INPUT, aiming again at every look (as in doors.mjs). */
  const walkTo = async (tx, ty, done, ms) => {
    let s = await st();
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
      s = await st();
      if ((done && done(s)) || Math.hypot(tx - s.x, ty - s.y) < 0.25) break;
      await aim(s);
      await page.waitForTimeout(50);
    }
    if (stick) await up(1); else await letGo();
    await page.waitForTimeout(160);
    return st();
  };
  const heard = [];
  const hear = async () => { for (const t of (await st()).said) if (!heard.includes(t)) heard.push(t); };

  // ---- 0. the hall, empty, a hero nothing can hurt -----------------------------------------------
  await page.evaluate(([cls, look]) => {
    const d = window.__dbg; d.saving(false);
    d.practice(cls, 5, 'mix');
    const g = d.game();
    d.god = true; d.autoLevel = false; d.autoWords = false;
    g.updatePractice = () => {};
    g.monsters.length = 0; g.projectiles.length = 0;
    d.fx.messages.length = 0;
    if (look) { clearInterval(window.__lit); window.__lit = setInterval(() => { const q = window.__dbg.game(); if (q) { q.level.explored.fill(1); } }, 50); }
  }, [cls, process.env.LOOK === '1']);
  await page.waitForTimeout(700);
  let s = await st();
  const kinds = s.doors.map((q) => `${q.room}:${q.kind}:${q.want}`).sort().join(' ');
  check('1. the hall: a lever\'s gate, down; two gates of the room that locks, up; two doors, shut', kinds === '1:gate:0 2:door:0 3:trapgate:1 3:trapgate:1 4:door:0', kinds);
  check('   the lever stands, not pulled', s.lever === 0, `state ${s.lever}`);
  await snap('01_the_first_room');

  // ---- 2. the gate holds him, and is told of ------------------------------------------------------
  s = await walkTo(GATE.x - 0.4, GATE.y, null, 7000);
  await hear();
  check('2. the hero walks at the gate with real input: it holds him', s.x < GATE.x - 0.5 && s.x > GATE.x - 1.6, `he stands at ${s.x.toFixed(2)}, the gate's tiles begin at ${GATE.x - 0.5}`);
  check('   and it is down still', s.doors.find((q) => q.kind === 'gate').want === 0);
  check('   a line on the screen said what it is', heard.includes('A gate bars the way. Its lever is near.'), heard.join(' | '));
  await snap('02_at_the_gate_which_is_down');

  // ---- 3. to the nook, and the lever --------------------------------------------------------------
  await walkTo(10.5, 16.5, null, 7000);
  await walkTo(10.5, 9.6, null, 7000);
  s = await st();
  await snap('03_the_nook_its_door_and_the_lever');
  let pulledAt = -1;
  s = await walkTo(10.5, 4.5, (q) => { if (q.lever === 1 && pulledAt < 0) pulledAt = Math.hypot(q.x - LEVER.x, q.y - LEVER.y); return q.lever === 1; }, 7000);
  await hear();
  check('3. he walks up to the lever with real input: it is pulled', s.lever === 1, `state ${s.lever}`);
  check('   as he comes within its reach', pulledAt > 0 && pulledAt < LEVER_NEAR + 0.05 && pulledAt > LEVER_NEAR - 0.6, `${pulledAt.toFixed(2)} tiles off`);
  check('   the gate rises', s.doors.find((q) => q.kind === 'gate').want === 1);
  check('   and a line says so', heard.includes('A gate rises.'), heard.join(' | '));
  await snap('04_the_lever_pulled');

  // ---- 4. through the gate, and into the room that locks ------------------------------------------
  await walkTo(10.5, 16.5, null, 8000);
  s = await walkTo(GATE.x - 2.5, GATE.y, null, 7000);
  await page.waitForTimeout(900);
  await snap('05_the_gate_is_up');
  s = await walkTo(GATE.x + 4, GATE.y, null, 7000);
  check('4. he walks through the gate into the gated room', s.x > GATE.x + 1, `he is at ${s.x.toFixed(2)}`);
  // (the pack of the room that locks: three, in its far corner)
  await page.evaluate(([r]) => {
    const g = window.__dbg.game(); const pack = g.level.floor.packs.findIndex((q) => q.roomId === 3);
    window.__pack = [0, 1, 2].map((k) => g.spawn('skeleton', r.x + r.w - 1.5, r.y + 1.5 + k, pack, 0, false, g.rng));
  }, [LOCKS]);
  s = await walkTo(WEST.x - 2.5, WEST.y, null, 7000);
  await page.waitForTimeout(400);
  await snap('06_the_room_that_locks_its_gates_up');
  s = await walkTo(WEST.x + LOCK_CLEAR + 1.5, WEST.y, (q) => q.doors.filter((d) => d.kind === 'trapgate').every((d) => d.want === 0), 7000);
  await hear();
  const fellAt = Math.hypot(s.x - WEST.x, s.y - WEST.y);
  check('   and on into the room that locks: its gates fall behind him', s.doors.filter((q) => q.kind === 'trapgate').every((q) => q.want === 0), `he is ${fellAt.toFixed(2)} tiles from the middle of the doorway he came in by`);
  check('   once he is clear of the doorway', fellAt >= LOCK_CLEAR - 0.05 && fellAt < LOCK_CLEAR + 1.2, `${fellAt.toFixed(2)}`);
  check('   and a line says so', heard.includes('The gates fall.'), heard.join(' | '));
  await page.waitForTimeout(500);
  await snap('07_locked_in');
  s = await walkTo(WEST.x - 1, WEST.y, null, 3500);
  check('   he walks at the gate he came in by: held', s.x >= LOCKS.x, `he is at ${s.x.toFixed(2)}, the room's floor begins at ${LOCKS.x}`);

  // ---- 5. the pack dies: they rise -----------------------------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); for (const m of window.__pack) g.damageMonster(m, 1e6, 'phys', false, 0); });
  await page.waitForTimeout(1500);
  await hear();
  s = await st();
  check('5. the pack is dead: the gates rise', s.doors.filter((q) => q.kind === 'trapgate').every((q) => q.want === 1 && q.open === 1));
  check('   and a line says so', heard.includes('The gates rise.'), heard.join(' | '));
  await snap('08_the_gates_are_up_again');
  await walkTo(39.5, 16.5, null, 6000);
  s = await walkTo(39.5, 24.5, null, 7000);
  check('   he walks out by the way on', s.y > LOCKS.y + LOCKS.h + 0.5, `he is at ${s.x.toFixed(2)}, ${s.y.toFixed(2)}`);
  await snap('09_out_by_the_way_on');

  await page.evaluate(() => { clearInterval(window.__lit); });
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
  console.log(fails ? `mix: ${fails} thing(s) wrong` : 'mix: ok');
}
