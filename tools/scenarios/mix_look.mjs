// THE MIX IN A REAL DUNGEON, FOR PICTURES (not in the regression). The map-maker's switch for the
// mix (game/dungeon.ts, MIX: OFF in the game) is switched on for the one dungeon this lays, and put
// back. The dungeon is lit for looking at, and of its monsters only the pack of the room that locks is kept.
//   1. two rooms next door, the door between them shut;
//   2. a gate down across the way, and the lever off to one side in its nook;
//   3. a room that locks, its gates down with the hero inside and its pack about him.
//   DEPTH=5 SEED=372602855 node tools/playtest.mjs --file <page> --scenario tools/scenarios/mix_look.mjs --out shots/mixlook/pc
// (SEED is the game's seed: Dungeon 5 of game seed 372602855 is the map-maker's dungeon 5 of seed 38,
// whose lever stands nearest its gate of those looked through: the scratchpad's mix/find_look.ts.)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 5);
  const seed = Number(process.env.SEED || 372602855);
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  const laid = await page.evaluate(([depth, seed]) => {
    const d = window.__dbg; d.saving(false);
    const was = d.mix.on;
    d.mix.on = true;
    d.run('warrior', seed);
    const g = d.game();
    g.depth = depth; g.enterDungeon();
    d.mix.on = was;
    const f0 = () => g.level.floor;
    d.autoLevel = false; d.autoWords = false; d.god = true;
    // (only the pack of the room that locks is kept, for its gates fall only with its pack inside: the other pictures are of the pieces, not of a fight)
    const lock = f0().rooms.find((r) => r.locks);
    g.monsters = g.monsters.filter((m) => lock && m.packId >= 0 && m.packId < f0().packs.length && f0().packs[m.packId].roomId === lock.id);
    g.projectiles.length = 0;
    clearInterval(window.__lit);
    window.__lit = setInterval(() => { const q = window.__dbg.game(); if (!q) return; q.level.explored.fill(1); q.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
    const L = g.level; const f = L.floor;
    return {
      fseed: f.seed, mixWas: was,
      rooms: f.rooms.map((r) => ({ id: r.id, x: r.x, y: r.y, w: r.w, h: r.h, kind: r.kind, gated: !!r.gated, locks: !!r.locks, nook: !!r.nook, nextDoor: !!r.nextDoor })),
      doors: L.doors.map((q, i) => ({ i, kind: q.spot.kind, room: q.spot.room, alongX: q.spot.alongX, a: q.spot.a, plane: q.spot.plane, out: q.spot.out })),
      levers: f.levers || [],
    };
  }, [depth, seed]);
  log(`Dungeon ${depth} of game seed ${seed}`, `the map-maker's seed ${laid.fseed}; ${laid.rooms.length} rooms; doors: ${laid.doors.map((q) => q.kind).join(' ')}`);
  check('the mix\'s switch is off in the game, and was put back', laid.mixWas === false && (await page.evaluate(() => window.__dbg.mix.on)) === false);

  /** A place `by` tiles inside a door's line (negative: outside the room it belongs to), in line with the middle of its opening. */
  const inLine = (s, by) => (s.alongX ? { x: s.a + 1.5, y: s.plane - s.out * by } : { x: s.plane - s.out * by, y: s.a + 1.5 });
  /** The hero set down at a place, facing a point; then the camera is given a moment to come. */
  const stand = async (p, look, ms = 900) => {
    await page.evaluate(([p, look]) => {
      const g = window.__dbg.game(); const h = g.hero;
      h.x = p.x; h.y = p.y;
      const dx = look.x - p.x; const dy = look.y - p.y; const n = Math.hypot(dx, dy) || 1;
      h.fx = dx / n; h.fy = dy / n;
    }, [p, look]);
    await page.waitForTimeout(ms);
  };
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game(); const L = g.level;
    return { x: g.hero.x, y: g.hero.y, doors: L.doors.map((q) => ({ kind: q.spot.kind, room: q.spot.room, open: q.open, want: q.want })), lever: (L.props.find((p) => p.kind === 'lever') || { state: -1 }).state };
  });

  // ---- 1. two rooms next door ---------------------------------------------------------------------
  const pair = laid.rooms.find((r) => r.nextDoor);
  const pd = pair ? laid.doors.find((q) => q.room === pair.id && q.kind === 'door') : null;
  check('1. two rooms next door, with a door between them', !!pd, pair ? `room ${pair.id}` : 'none');
  if (pd) {
    await stand(inLine(pd, -3.2), inLine(pd, 0));
    const s = await state();
    check('   the door between them is shut (the hero is too far off to open it)', s.doors[pd.i].open === 0, `open ${s.doors[pd.i].open}`);
    await snap('01_two_rooms_next_door');
  }

  // ---- 2. a gate down across the way, its lever off to one side ------------------------------------
  const gd = laid.doors.find((q) => q.kind === 'gate');
  const lever = laid.levers[0];
  check('2. a gate across the way, and its lever', !!gd && !!lever);
  if (gd && lever) {
    const out = inLine(gd, -2.5);
    // (half way between the gate and the lever, so that both are in the picture)
    const mid = { x: (out.x + lever.x + 0.5) / 2, y: (out.y + lever.y + 0.5) / 2 };
    await stand(mid, inLine(gd, 0));
    const s = await state();
    check('   the gate is down, the lever not pulled', s.doors[gd.i].want === 0 && s.lever === 0, `gate ${s.doors[gd.i].want}, lever ${s.lever}`);
    await snap('02_a_gate_and_its_lever');
  }

  // ---- 3. a room that locks, its gates down ----------------------------------------------------------
  const lr = laid.rooms.find((r) => r.locks);
  check('3. a room that locks', !!lr);
  if (lr) {
    const c = { x: lr.x + lr.w / 2, y: lr.y + lr.h / 2 };
    // (soon after: the gates have fallen, and the pack has not yet come at him)
    await stand(c, { x: c.x + 1, y: c.y + 1 }, 450);
    const s = await state();
    const gates = s.doors.filter((q) => q.kind === 'trapgate' && q.room === lr.id);
    check('   with the hero inside among its pack, its gates are down', gates.length > 0 && gates.every((q) => q.want === 0), `${gates.filter((q) => q.want === 0).length} of ${gates.length} down`);
    await snap('03_a_room_that_locks');
  }

  await page.evaluate(() => { clearInterval(window.__lit); });
  console.log(fails ? `mix_look: ${fails} thing(s) wrong` : 'mix_look: ok');
}
