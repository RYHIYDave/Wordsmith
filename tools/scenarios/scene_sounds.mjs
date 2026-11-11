// THE FLOORS' SCENE SOUNDS IN PLAY (the sound chat's eighth batch: game/scene_sounds.ts, engine/audio.ts): a new game; floor 1's
// background going round, its act's pack fetched, its moments' sounds come, and one heard as its moment begins; floor 3's
// crank turned (the gear, the turn, the furnace dying) and its furnace's loop near it; floor 2 come into, floor 1's and 3's
// backgrounds let go; a stronghold's altar and seal on floor 6; floor 11 muffled, its background, a bell rung; and no errors.
// Served with its sounds: --serve, on a page built with them.
import { makeHands, log } from './lib.mjs';
export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e && e.stack || e)));
  const got = [];
  page.on('request', (r) => { const u = r.url(); if (u.includes('/sounds/')) got.push(u.replace(/.*\/sounds\/[0-9a-f]+\//, '')); });
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press('class:warrior', 0, true);
  // (25.3.5: on the published page at a phone's shape CONFIRM is on screen a frame or two after the card is pressed, and the
  // game began for nobody: wait for the button, press it, and wait for the game itself, then the 8 s as before)
  let c = null;
  for (let k = 0; k < 150 && !c; k++) { c = await hands.mark('button:CONFIRM'); if (!c) await page.waitForTimeout(20); }
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForFunction(() => !!window.__dbg.game(), null, { timeout: 30000 });
  await page.waitForTimeout(8000);
  const detail = () => page.evaluate(() => window.__dbg.soundsDetail());
  const toFloor = async (d, ms = 7000) => {
    await page.evaluate((depth) => { const g = window.__dbg.game(); g.god = true; g.depth = depth; g.cleared = depth - 1; g.wayDepth = depth; g.enterDungeon('gate'); g.level.explored.fill(1); }, d);
    await page.waitForTimeout(ms);
  };
  const heardOf = (d, re) => d.heard.filter((k) => re.test(k));

  const d0 = await detail();
  log('town: loops going', d0.loops);

  // FLOOR 1: its background, its act's pack, its moments' sounds; a moment begun by coming up to it
  await toFloor(1, 9000);
  const d1 = await detail();
  log('floor 1: loops going', d1.loops);
  log('floor 1: its moments\' sounds come', d1.come.filter((n) => /^f1_/.test(n)));
  const m1 = await page.evaluate(() => {
    const g = window.__dbg.game();
    const L = g.level;
    const hosts = (L.dress && L.dress.moments) || [];
    const W = L.floor.w;
    for (const host of hosts) {
      // (a tile he may stand on, two to four tiles off it)
      for (let r = 2; r <= 4; r++) for (const [dx, dy] of [[0, r], [r, 0], [-r, 0], [0, -r], [r, r], [-r, r]]) {
        const x = Math.floor(host.x) + dx, y = Math.floor(host.y) + dy;
        if (x > 0 && y > 0 && x < W && y < L.floor.h && L.walk[y * W + x] === 1) { g.monsters.length = 0; g.hero.x = x + 0.5; g.hero.y = y + 0.5; return { n: host.n, at: [host.x, host.y], hero: [x, y] }; }
      }
    }
    return null;
  });
  log('floor 1: come up to a moment', m1);
  // (its film is painted in the background, some seconds of it: wait for it to begin, then for its sound's length)
  let began = -1;
  for (let k = 0; k < 180 && began < 0; k++) {
    await page.waitForTimeout(1000);
    const st = await page.evaluate(() => window.__dbg.renderer.pieces.moments.map((m) => m.state));
    if (st.some((x) => x !== 'wait')) began = k + 1;
  }
  log('floor 1: its moment began after (s)', began);
  await page.waitForTimeout(4000);
  const d1b = await detail();
  log('floor 1: moments heard', heardOf(d1b, /^world:f1_/));
  const st1 = await page.evaluate(() => window.__dbg.renderer.pieces.moments.map((m) => [m.host.n, m.state]));
  log('floor 1: moments\' states', st1);
  // (its jolts are in its sound: no blow made in code on top of it)
  const from = d1b.heard.findIndex((k) => /^world:f1_/.test(k));
  log('floor 1: blows in code over its sound', from < 0 ? 'not heard' : d1b.heard.slice(from + 1).filter((k) => k === 'sfx:slam').length);

  // FLOOR 3: the furnace's loop by its crank; the crank turned
  await toFloor(3, 8000);
  const f3 = await page.evaluate(() => {
    const g = window.__dbg.game();
    const F = g.level.furnace;
    if (!F) return null;
    g.monsters.length = 0;
    g.hero.x = F.crank.x + 0.2; g.hero.y = F.crank.y + 0.9;
    return { crank: [F.crank.x, F.crank.y], spot: !!F.spot };
  });
  log('floor 3: by the crank', f3);
  await page.waitForTimeout(5000);
  const d3 = await detail();
  log('floor 3: loops going', d3.loops);
  if (f3) {
    await page.evaluate(() => { const g = window.__dbg.game(); g.hero.furnace = 'gear'; g.turnCrank(g.level.furnace.crank); });
    await page.waitForTimeout(4500);
    const d3b = await detail();
    log('floor 3: the crank heard', heardOf(d3b, /^world:(crank_|furnace_out|gate_fire_out)/));
    await page.waitForTimeout(8000);
    log('floor 3: loops going, the furnace out', (await detail()).loops);
  }

  // FLOOR 2: floor 1's and floor 3's backgrounds let go
  await toFloor(2, 14000);
  const d2 = await detail();
  log('floor 2: loops going', d2.loops);
  log('floor 2: backgrounds held decoded', d2.come.filter((n) => /^(bed_f|furnace|pillar)/.test(n)));
  log('floor 2: floor 1\'s moments let go', d2.come.filter((n) => /^f1_/.test(n)).length === 0);
  log('let go so far', d2.letGo);

  // FLOOR 6: a stronghold's altar and seal
  await toFloor(6, 8000);
  const h6 = await page.evaluate(() => {
    const g = window.__dbg.game();
    const q = g.level.land && g.level.land.holds[0];
    if (!q) return null;
    g.monsters.length = 0;
    g.hero.words.fire = (g.hero.words.fire || 0) + 1;
    g.hero.x = q.altar.x + 1.2; g.hero.y = q.altar.y + 0.9;
    const a = g.altarWord(q.n, 'fire');
    return { n: q.n, altar: a };
  });
  await page.waitForTimeout(3500);
  if (h6) await page.evaluate((n) => window.__dbg.game().openHold(n), h6.n);
  await page.waitForTimeout(3500);
  const d6 = await detail();
  log('floor 6: loops going', d6.loops);
  log('floor 6: the altar and the seal heard', heardOf(d6, /^world:(altar_word|seal_burn)/));

  // FLOOR 11: the Hush, its background, the Muffled Bell and a bell
  await toFloor(11, 9000);
  const b11 = await page.evaluate(() => {
    const g = window.__dbg.game();
    if (!g.level.bells) return null;
    g.monsters.length = 0;
    g.bellsStart();
    return { bells: g.level.bells.plan.bells.length };
  });
  await page.waitForTimeout(2500);
  if (b11) await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; g.bellRung(0); });
  await page.waitForTimeout(4500);
  const d11 = await detail();
  log('floor 11: loops going', d11.loops);
  log('floor 11: the bells heard', heardOf(d11, /^world:bell_/));
  // (its moment, the pigeons off a roof: he comes up to the floor it is seen from)
  const m11 = await page.evaluate(() => {
    const g = window.__dbg.game();
    const L = g.level;
    const host = L.act1 && L.act1.moments && L.act1.moments[0];
    if (!host) return null;
    const W = L.floor.w;
    const sx = host.seen % W, sy = Math.floor(host.seen / W);
    g.monsters.length = 0;
    for (let r = 0; r <= 3; r++) for (const [dx, dy] of [[0, r], [r, 0], [-r, 0], [0, -r]]) {
      const x = sx + dx, y = sy + dy;
      if (x > 0 && y > 0 && x < W && y < L.floor.h && L.walk[y * W + x] === 1 && Math.hypot(x + 0.5 - host.x, y + 0.5 - host.y) < 5) { g.hero.x = x + 0.5; g.hero.y = y + 0.5; return { at: [host.x, host.y], hero: [x, y] }; }
    }
    return { at: [host.x, host.y], hero: null };
  });
  log('floor 11: come up to its moment', m11);
  let began11 = -1;
  for (let k = 0; k < 240 && began11 < 0 && m11 && m11.hero; k++) {
    await page.waitForTimeout(1000);
    const st = await page.evaluate(() => window.__dbg.renderer.act1.momentStates().map((m) => m.state));
    if (st.some((x) => x !== 'wait')) began11 = k + 1;
  }
  log('floor 11: its moment began after (s)', began11);
  await page.waitForTimeout(3500);
  log('floor 11: its moment heard', heardOf(await detail(), /^world:f11_/));

  const dz = await detail();
  log('all: come, failed, let go', [dz.come.length, dz.failed, dz.letGo]);
  const packs = [...new Set(got.filter((u) => u.endsWith('-pack.mp3')))];
  log('packs fetched', packs);
  log('loops fetched', [...new Set(got.filter((u) => u.endsWith('.wav')))]);
  log('errors', errs.length);
  for (const e of errs.slice(0, 5)) console.log('ERR', e.slice(0, 600));
}
