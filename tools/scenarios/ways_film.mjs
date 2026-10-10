// THE WAYS THROUGH THE CRYPT, IN THE GAME (game/ways.ts, WAYS, off), with the art chat's Crypt
// (art/crypt.ts, CRYPT) and the Crypt's layout (CRYPT_LAYOUT) on with them: films for the owner.
// His outline, 9 Oct 2026, 22:47: "The gate on the wall with be turned to a gate from the levels.
// It will open automatically as you approach it and go through.  you will enter floor 1 of the
// Crypt.  [...] kill the warden and find a stairwell leading down.  At the bottom of the stairs is
// Crypt floor 2.  There is a waypoint that will warp you to town and back at the beginning over
// every floor except the first as you could just walk back through the gate." Everything here is
// played by the game itself: the hero is sent by touching the gate, the stairwell and the waypoint,
// as a player would (main.ts, the errand). Nothing in the way (no monster but the boss). For
// looking at, not a test. Three films, a frame every 15th of a second of the game's time (the game
// slowed to a tenth while they are taken):
//   a_f...  in town he is sent to the gate; it rises as he comes; through it, into the first floor
//   b_f...  the first floor's boss falls; the stairwell opens; sent down it; the second floor, its waypoint waking
//   c_f...  sent onto the waypoint: to town, onto the town's; and from it, back
//   node tools/build_to.mjs dist/ways.html
//   node tools/playtest.mjs --file dist/ways.html --touch --size 844x390 --dpr 1 --scenario tools/scenarios/ways_film.mjs --out shots/ways/w
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const FPS = 15;
  const SLOW = 0.1;
  const hands = await makeHands(page);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.crypt(true); d.cryptLayout(true); d.ways(true);
    const g = d.game(); g.wayDepth = 0; g.enterTown();
    const h = g.hero; h.x = 14.5; h.y = 12.6; h.fx = 0; h.fy = -1;
  });
  await page.waitForTimeout(900);
  const state = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    return { town: g.level.town, depth: g.depth, x: +g.hero.x.toFixed(2), y: +g.hero.y.toFixed(2), errand: d.errand(), leaving: g.leaving ? g.leaving.to : null, way: g.wayDepth };
  });
  /** Frames, one every 1/FPS s of the game's time, at most `max`; `at(i)` runs before frame i is taken, and says when to stop. */
  const film = async (name, max, at) => {
    await page.evaluate((s) => { window.__dbg.fx.messages.length = 0; window.__dbg.slowmo = s; }, SLOW);
    const step = 1000 / FPS / SLOW;
    const t0 = Date.now();
    let i = 0;
    for (; i < max; i++) {
      const wait = t0 + i * step - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      const stop = at ? await at(i) : false;
      await snap(`${name}_f${String(i).padStart(3, '0')}`);
      if (stop) break;
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    return i;
  };
  /** A touch on a point of the world (tiles), `up` game pixels over it. */
  const touch = async (x, y, up = 0) => {
    const p = await page.evaluate(([a, b]) => window.__dbg.at(a, b), [x, y]);
    await hands.pressAt(p.x, p.y - up);
  };

  // ---- A: THE GATE IN TOWN ----
  let came = -1;
  const a = await film('a', 150, async (i) => {
    if (i === 8) {
      const st = await page.evaluate(() => { const q = window.__dbg.game().level.stations.find((s) => s.kind === 'gate'); return { x: q.x, y: q.y }; });
      await touch(st.x, st.y, 30);
      log('a', `the gate touched: errand ${(await state()).errand}`);
    }
    const s = await state();
    if (i % 10 === 0) log('a', `frame ${i}: ${JSON.stringify(s)}`);
    if (came < 0 && !s.town) { came = i; log('a', `on the first floor at frame ${i}, at ${s.x}, ${s.y}`); }
    return came >= 0 && i >= came + 22;
  });
  log('film a', `${a + 1} frames`);

  // ---- B: THE BOSS FALLS, THE STAIRWELL OPENS, DOWN IT ----
  const where = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const L = g.level;
    g.monsters = g.monsters.filter((m) => m.boss);
    L.explored.fill(1);
    const st = L.ways.stair;
    const s = L.doors.find((q) => q.spot.kind === 'bossgate').spot;
    // (just inside the hall's gate, short of where it would fall behind him: GATE_INSIDE, 2.2 tiles; looking at the hall's middle)
    const across = s.plane - s.out * 1.4;
    const h = g.hero;
    h.x = s.alongX ? s.a + 1.5 : across;
    h.y = s.alongX ? across : s.a + 1.5;
    const mx = st.x + 1.2; const my = st.y + 0.62;
    const n = Math.hypot(mx - h.x, my - h.y);
    h.fx = (mx - h.x) / n; h.fy = (my - h.y) / n;
    const boss = g.monsters[0];
    return { hero: [h.x, h.y], stair: [st.x, st.y], boss: [boss.x, boss.y], far: n };
  });
  log('b', JSON.stringify(where));
  await page.waitForTimeout(700);
  came = -1;
  const b = await film('b', 200, async (i) => {
    if (i === 6) {
      await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.boss && !q.dead); if (m) g.damageMonster(m, m.life + m.shield + 1, 'phys', false, -1); });
      log('b', `the boss falls; the stairwell open: ${await page.evaluate(() => window.__dbg.game().level.ways.stair.open)}`);
    }
    if (i === 30) {
      const st = await page.evaluate(() => { const q = window.__dbg.game().level.ways.stair; return { x: q.x + 1.2, y: q.y + 0.62 }; });
      await touch(st.x, st.y, 2);
      log('b', `the stairwell touched: errand ${(await state()).errand}`);
    }
    const s = await state();
    if (i % 10 === 0) log('b', `frame ${i}: ${JSON.stringify(s)}`);
    if (came < 0 && s.depth === 2) { came = i; log('b', `on the second floor at frame ${i}, at ${s.x}, ${s.y}`); }
    return came >= 0 && i >= came + 24;
  });
  log('film b', `${b + 1} frames`);

  // ---- C: THE WAYPOINT, TO TOWN AND BACK ----
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.splice(0); g.level.explored.fill(1); });
  await page.waitForTimeout(500);
  let inTown = -1;
  let back = -1;
  const c = await film('c', 160, async (i) => {
    if (i === 6) {
      const w = await page.evaluate(() => { const q = window.__dbg.game().level.ways.way; return { x: q.x, y: q.y }; });
      await touch(w.x, w.y, 4);
      log('c', `the waypoint touched: errand ${(await state()).errand}`);
    }
    const s = await state();
    if (i % 10 === 0) log('c', `frame ${i}: ${JSON.stringify(s)}`);
    if (inTown < 0 && s.town) { inTown = i; log('c', `in town at frame ${i}, at ${s.x}, ${s.y}`); }
    if (inTown >= 0 && i === inTown + 16) {
      const w = await page.evaluate(() => { const q = window.__dbg.game().level.ways.way; return { x: q.x, y: q.y, awake: q.awake }; });
      log('c', `the town's waypoint, awake ${w.awake}: touched`);
      await touch(w.x, w.y, 4);
    }
    if (inTown >= 0 && back < 0 && !s.town) { back = i; log('c', `back on floor ${s.depth} at frame ${i}, at ${s.x}, ${s.y}`); }
    return back >= 0 && i >= back + 18;
  });
  log('film c', `${c + 1} frames`);
  await page.evaluate(() => { const d = window.__dbg; d.ways(false); d.crypt(false); d.cryptLayout(false); });
}
