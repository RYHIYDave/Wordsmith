// ACT 2, THE HUSH: FLOOR 13, THE MILLRACE, laid by its own map-maker and dressed by its own dresser (game/act2/millrace.ts;
// behind ACT2, game/act1.ts, off until his yes: switched on here for each test and off after). The owner, 19 Oct 2026, 11:01
// Pacific, to the planning chat: "Get levels 11-15 into the game". Over twenty floors:
//   - everything that matters is reached from the start on the walk grid (each bell, the Muffled Bell, the boss, the way on,
//     the mill's strip past its wheel, every chest);
//   - the Bells' contract holds (docs/act2_build.md);
//   - no walkable tile is in the river or the race but the bridges (and the tracks cross the river only on one);
//   - the same seed gives the same floor;
//   - nothing of the descent's pieces: only the Millrace's own and the Hush's;
// and what the pictures do with it (render/act1_pieces.ts): the drying lines seen through, as the art drew them for it; the
// water wheel turning and the stamping mill striking by their traps' beat.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { hushSetPieces } from '../src/art/act2_set';
import { millracePieces } from '../src/art/floor13';
import { MR_RACE_HALF, MR_RIVER_HALF } from '../src/art/millrace';
import { ACT2 } from '../src/game/act1';
import { ACT1_SETS, CAMP, HOLD } from '../src/game/act1_dress';
import { blobDist, cross, laneDist } from '../src/game/act1_layout';
import { BUILT, MR_PIECE, MR_WET, millOf, millWorks } from '../src/game/act2/millrace';
import { makeDungeon } from '../src/game/level';
import type { Level } from '../src/game/state';
import { spikeAt } from '../src/game/traps';
import { T_FLOOR } from '../src/game/types';
import { Act1Pieces, SEE_TALL, act1Pieces } from '../src/render/act1_pieces';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}

const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 37);
const LEVELS: Level[] = hush(() => SEEDS.map((s) => makeDungeon(13, s)));
type P = [number, number];

/** Tiles reached from the start on the walk grid (side steps; what stands in the way, in the way). */
function walked(L: Level): Uint8Array {
  const f = L.floor;
  const W = f.w;
  const seen = new Uint8Array(W * f.h);
  const s = Math.floor(f.start.y) * W + Math.floor(f.start.x);
  const q = [s];
  seen[s] = 1;
  while (q.length) {
    const i = q.pop()!;
    const x = i % W;
    const y = (i - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= f.h) continue;
      const j = ny * W + nx;
      if (seen[j] || L.walk[j] !== 1) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  return seen;
}
/** Is a tile reached, or (it standing in the way) one of the eight round it? */
function reachedAt(L: Level, seen: Uint8Array, x: number, y: number): boolean {
  const W = L.floor.w;
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (seen[(ty + dy) * W + tx + dx]) return true;
  return false;
}

test('the Millrace has a map-maker of its own, and with the switch on floor 13 is laid by it', () => hush(() => {
  assert.equal(BUILT, true);
  // (the water as the art paints it)
  assert.equal(MR_WET.water.river, MR_RIVER_HALF);
  assert.equal(MR_WET.water.race, MR_RACE_HALF);
  for (const L of LEVELS) {
    const land = L.land!;
    assert.equal(land.kind, 'millrace');
    assert.ok(land.river && land.river.length > 4, 'its river');
    assert.ok(land.race && land.race.length === 4, 'its race');
    assert.ok(land.tracks && land.tracks.length >= 2, 'its cart tracks, the main one and the branch to the mill');
    assert.ok(land.yards && land.yards.length === 2, "its yards: the mill's and the Pulping Floor's");
    assert.equal(land.holds.length, 0);
    assert.ok(land.areas.filter((a) => a.role === 'start').length === 1 && land.areas.filter((a) => a.role === 'boss').length === 1, 'its start and its boss\'s ground');
    const boss = land.areas.find((a) => a.role === 'boss')!;
    assert.ok(blobDist(boss.blob, L.floor.boss.x, L.floor.boss.y) < 0.8, 'the boss waits inside his ground (Game.meetOutdoorBoss)');
    assert.ok(blobDist(boss.blob, land.exit.x, land.exit.y) < 1, 'the way on at its far end');
    assert.deepEqual(land.arrive, L.floor.start);
    // (as long as the descent's floors: the Pinewood's chain of eleven fields, and the side areas)
    assert.ok(land.areas.length >= 14, `${land.areas.length} areas`);
    assert.ok(L.floor.packs.length > 20, `${L.floor.packs.length} packs`);
  }
}));

test('everything that matters is reached from the start on the walk grid: each bell, the Muffled Bell, the boss, the way on, the strip past the wheel, every chest', () => hush(() => {
  for (const L of LEVELS) {
    const land = L.land!;
    const seen = walked(L);
    const b = land.bells!;
    assert.ok(reachedAt(L, seen, b.muffled.x, b.muffled.y), `seed ${L.floor.seed}: the Muffled Bell`);
    for (const q of b.bells) assert.ok(reachedAt(L, seen, q.x, q.y), `seed ${L.floor.seed}: a bell at ${q.x}, ${q.y}`);
    assert.ok(reachedAt(L, seen, L.floor.boss.x, L.floor.boss.y), `seed ${L.floor.seed}: the boss`);
    assert.ok(seen[Math.floor(land.exit.y) * L.floor.w + Math.floor(land.exit.x)], `seed ${L.floor.seed}: the way on`);
    const w = millWorks(millOf(land)!);
    for (let y = w.beside.y; y < w.beside.y + w.beside.h; y++) assert.ok(seen[y * L.floor.w + w.beside.x], `seed ${L.floor.seed}: the strip beside the wheel`);
    for (const p of L.props) if (p.kind === 'chest') assert.ok(reachedAt(L, seen, p.x, p.y), `seed ${L.floor.seed}: a chest at ${p.tx}, ${p.ty}`);
  }
}));

test("the Bells' contract holds (docs/act2_build.md)", () => hush(() => {
  for (const L of LEVELS) {
    const f = L.floor;
    const land = L.land!;
    const b = land.bells!;
    const seed = `seed ${f.seed}`;
    const boss = land.areas.find((a) => a.role === 'boss')!.blob;
    const seen = walked(L);
    const mid = (p: { x: number; y: number }): boolean => p.x % 1 === 0.5 && p.y % 1 === 0.5;
    const wholeFloor = (p: { x: number; y: number }): boolean => {
      const i = Math.floor(p.y) * f.w + Math.floor(p.x);
      return f.tiles[i] === T_FLOOR && f.cut![i] === 0;
    };
    const far = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);
    // THE MUFFLED BELL: a tile's middle on whole floor reached from the start, off the main way, 12 from the start, not in the boss's ground
    assert.ok(mid(b.muffled) && wholeFloor(b.muffled) && reachedAt(L, seen, b.muffled.x, b.muffled.y), seed);
    assert.ok(far(b.muffled, f.start) >= 12, seed);
    assert.ok(blobDist(boss, b.muffled.x, b.muffled.y) > 1, seed);
    assert.ok(land.areas.some((a) => a.role === 'side' && blobDist(a.blob, b.muffled.x, b.muffled.y) < 1), `${seed}: in a side area`);
    assert.ok(!land.areas.some((a) => (a.role === 'path' || a.role === 'start' || a.role === 'boss') && blobDist(a.blob, b.muffled.x, b.muffled.y) < 1), `${seed}: not on the main way`);
    // THE BELLS: five or six (floor 13), spread (no two within 8), none within 10 of the start nor in the boss's ground
    assert.ok(b.bells.length >= 5 && b.bells.length <= 6, `${seed}: ${b.bells.length} bells`);
    for (const q of b.bells) {
      assert.ok(mid(q) && wholeFloor(q) && reachedAt(L, seen, q.x, q.y), `${seed}: a bell on whole floor reached`);
      assert.ok(far(q, f.start) >= 10, seed);
      assert.ok(blobDist(boss, q.x, q.y) > 1, seed);
      for (const o of b.bells) if (o !== q) assert.ok(far(o, q) >= 8, `${seed}: two bells ${far(o, q).toFixed(1)} apart`);
    }
    // THE HUSH: round the Muffled Bell, every bell in it with 4 to spare, 12 clear of the start, clear of the boss's ground
    const h = b.hush;
    assert.ok(far(h, b.muffled) <= 2, seed);
    for (const q of b.bells) assert.ok(far(h, q) <= h.r - 4, seed);
    assert.ok(far(h, f.start) - h.r >= 12, seed);
    for (let ty = Math.floor(boss.y - 16); ty <= boss.y + 16; ty++) for (let tx = Math.floor(boss.x - 16); tx <= boss.x + 16; tx++) {
      if (blobDist(boss, tx + 0.5, ty + 0.5) < 1) assert.ok(far(h, { x: tx + 0.5, y: ty + 0.5 }) > h.r, `${seed}: the Hush reaches the boss's ground`);
    }
    // THEIR PIECES: solid, state 0, variant 0, each its name; the eight tiles round each walkable and clear of anything solid
    const at = (q: { x: number; y: number }) => L.props.filter((p) => p.tx === Math.floor(q.x) && p.ty === Math.floor(q.y));
    const one = (q: { x: number; y: number }, name: string): void => {
      const here = at(q).filter((p) => p.kind === 'piece' && p.name === name);
      assert.equal(here.length, 1, `${seed}: ${name}`);
      assert.ok(here[0].solid && here[0].state === 0 && here[0].variant === 0, seed);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const x = Math.floor(q.x) + dx;
        const y = Math.floor(q.y) + dy;
        assert.equal(L.walk[y * f.w + x], 1, `${seed}: round ${name}`);
        assert.ok(!L.props.some((p) => p.solid && p.tx === x && p.ty === y), `${seed}: something solid round ${name}`);
      }
    };
    one(b.muffled, MR_PIECE.muffled);
    for (const q of b.bells) one(q, MR_PIECE.bell);
  }
}));

test('no walkable tile in the river or the race but the bridges; the tracks cross the river only on a bridge', () => hush(() => {
  for (const L of LEVELS) {
    const f = L.floor;
    const W = f.w;
    const land = L.land!;
    const seed = `seed ${f.seed}`;
    const river = land.river!;
    const race = land.race!;
    const bridge = new Set<number>();
    for (const b of land.bridges ?? []) for (const i of b.tiles) bridge.add(i);
    const pts: P[] = [[0.5, 0.5], [0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0], [0, 0.5], [1, 0.5], [0.5, 1]];
    for (let i = 0; i < W * f.h; i++) {
      if (L.walk[i] !== 1 || bridge.has(i)) continue;
      const x = i % W;
      const y = (i - x) / W;
      for (const [u, v] of pts) {
        assert.ok(laneDist({ pts: river, w: 0 }, x + u, y + v) >= MR_RIVER_HALF, `${seed}: tile ${x}, ${y} is in the river`);
        assert.ok(laneDist({ pts: race, w: 0 }, x + u, y + v) >= MR_RACE_HALF, `${seed}: tile ${x}, ${y} is in the race`);
      }
    }
    // (the race leaves the river and comes back into it)
    assert.ok(laneDist({ pts: river, w: 0 }, race[0][0], race[0][1]) < 0.2 && laneDist({ pts: river, w: 0 }, race[3][0], race[3][1]) < 0.2, seed);
    // (every bridge over water is whole floor; the tracks cross the river only on a bridge's tiles)
    for (const b of land.bridges ?? []) for (const i of b.tiles) if (f.tiles[i] === T_FLOOR) assert.equal(f.cut![i], 0, seed);
    let crossings = 0;
    for (const t of land.tracks ?? []) {
      for (let k = 0; k + 1 < t.length; k++) {
        for (let j = 0; j + 1 < river.length; j++) {
          const c = cross(t[k], t[k + 1], river[j], river[j + 1]);
          if (!c) continue;
          crossings++;
          assert.ok(bridge.has(Math.floor(c[1]) * W + Math.floor(c[0])), `${seed}: a track crosses the river at ${c[0].toFixed(1)}, ${c[1].toFixed(1)} off a bridge`);
        }
      }
    }
    assert.ok(crossings >= 1, `${seed}: the main track crosses the river`);
    // (the cart bridge is laid where it does)
    assert.ok(L.act1!.tiles.some((t) => t.name === MR_PIECE.cart), `${seed}: the cart bridge`);
    assert.ok(L.act1!.tiles.some((t) => t.name === MR_PIECE.foot), `${seed}: a footbridge`);
  }
}));

test('the same seed gives the same floor', () => hush(() => {
  const sum = (L: Level): string => JSON.stringify({ t: [...L.floor.tiles], c: [...L.floor.cut!], w: [...L.walk], p: L.props, k: L.floor.packs, h: L.floor.hazards, b: L.land!.bells, r: L.land!.river, a: L.land!.race, y: L.land!.yards, d: L.act1 });
  for (const s of SEEDS.slice(0, 4)) assert.equal(sum(makeDungeon(13, s)), sum(makeDungeon(13, s)), `seed ${s}`);
  assert.notEqual(sum(LEVELS[0]), sum(LEVELS[1]));
}));

test("nothing of the descent's pieces: every piece laid is the Millrace's own or the Hush's (art/floor13.ts, art/act2_set.ts)", () => hush(() => {
  const own = new Set([...millracePieces(), ...hushSetPieces()].map((p) => p.name));
  const descent = new Set<string>([...CAMP.things, ...CAMP.big, ...CAMP.lying, ...CAMP.breakables, ...Object.values(HOLD).filter((v) => typeof v === 'string') as string[]]);
  for (let n = 6; n <= 10; n++) {
    const s = ACT1_SETS[n];
    for (const k of [...s.things, ...s.big, ...s.lying, ...s.wallFoot, ...s.breakables, ...s.edge]) descent.add(k);
    if (s.trap) descent.add(s.trap.name);
    if (s.tile) descent.add(s.tile.name);
  }
  for (const name of Object.values(MR_PIECE)) assert.ok(own.has(name), `${name} is one of the art's`);
  for (const L of LEVELS) {
    for (const p of L.props) {
      if (p.kind === 'piece') {
        assert.ok(own.has(p.name!), `${p.name}`);
        assert.ok(!descent.has(p.name!), `${p.name} is the descent's`);
      } else assert.ok(p.kind === 'chest' || p.kind === 'barrel' || p.kind === 'urn', p.kind);
    }
    for (const t of L.act1!.tiles) assert.ok(own.has(t.name) && !descent.has(t.name), t.name);
    // (the game's barrels and urns are drawn as the floor's own two breakables, the stooks and the rag bales)
    assert.ok(ACT1_SETS[13].breakables.every((n) => own.has(n)));
  }
}));

test('the mill: its works where its race says, its traps (the wheel beside it, the stamping mill under its hammers) laid as the spike floor', () => hush(() => {
  for (const L of LEVELS) {
    const f = L.floor;
    const land = L.land!;
    const w = millWorks(millOf(land)!);
    const seed = `seed ${f.seed}`;
    const named = (n: string) => L.props.filter((p) => p.kind === 'piece' && p.name === n);
    assert.equal(named(MR_PIECE.mill).length, 1, seed);
    for (let y = w.mill.y0; y <= w.mill.y1; y++) for (let x = w.mill.x0; x <= w.mill.x1; x++) assert.equal(L.walk[y * f.w + x], 0, `${seed}: the mill in the way`);
    const wheel = named(MR_PIECE.wheel);
    assert.equal(wheel.length, 1, seed);
    assert.ok(wheel[0].tx === w.wheel.tx && wheel[0].ty === w.wheel.ty && (wheel[0].variant & 4) === 4, seed);
    assert.equal(named(MR_PIECE.headgate).length, 1, seed);
    assert.equal(named(MR_PIECE.quest).length, 1, `${seed}: the mould and deckle`);
    assert.ok(named(MR_PIECE.lines).length >= 3, `${seed}: drying lines in rows`);
    const hz = f.hazards ?? [];
    assert.ok(hz.some((h) => h.kind === 'spikes' && h.x === w.beside.x && h.y === w.beside.y && h.h === 3), `${seed}: the wheel's strike`);
    const stampers = named(MR_PIECE.stamper);
    assert.ok(stampers.length >= 1, seed);
    for (const p of stampers) {
      assert.ok(!p.solid, `${seed}: walked under`);
      assert.ok(hz.some((h) => h.kind === 'spikes' && h.x === p.tx && h.y === p.ty && h.w === 2), `${seed}: its hammers' strike under it`);
    }
    assert.equal(L.hazards.length, hz.length, 'the game holds them');
    // (none in the boss's ground)
    const boss = land.areas.find((a) => a.role === 'boss')!.blob;
    for (const h of hz) assert.ok(blobDist(boss, h.x + 0.5, h.y + 0.5) > 1, seed);
  }
}));

test('drawn: the drying lines are seen through as the art drew them for it; the wheel turns and the stamping mill strikes by their beat', () => hush(() => {
  const L = LEVELS[0];
  const map = act1Pieces(13);
  const lines = map.get(MR_PIECE.lines)!.frames!;
  assert.ok(lines[0].h >= SEE_TALL, `the drying lines (${lines[0].h} tall) are tall enough to be seen through (render.ts seeThrough)`);
  const pieces = new Act1Pieces();
  assert.ok(pieces.begin(L));
  const line = L.props.find((p) => p.name === MR_PIECE.lines)!;
  assert.equal(pieces.sprite(line, 0), lines[0], 'whole');
  assert.equal(pieces.seenOf(line), lines[1], 'half there, while someone is behind them');
  const other = L.props.find((p) => p.name === MR_PIECE.mill)!;
  assert.equal(pieces.seenOf(other), null, 'the rest seen through as ever, faded');
  // the wheel: turning, a frame each eighth of a second, its four frames looking along +x
  const wheel = L.props.find((p) => p.name === MR_PIECE.wheel)!;
  const wf = map.get(MR_PIECE.wheel)!.frames!;
  const shown = new Set<number>();
  for (let k = 0; k < 16; k++) shown.add(wf.indexOf(pieces.sprite(wheel, 0, 0.3 + k / 8) as never));
  assert.deepEqual([...shown].sort(), [4, 5, 6, 7]);
  // the stamping mill: at rest while its trap is down, lifted in its warning, down and struck as it springs
  const st = L.props.find((p) => p.name === MR_PIECE.stamper)!;
  const sf = map.get(MR_PIECE.stamper)!.frames!;
  const spot = L.floor.hazards!.find((h) => h.x === st.tx && h.y === st.ty)!;
  const seenAt = new Map<string, Set<number>>();
  for (let t = 0; t < 5; t += 0.01) {
    const at = spikeAt(spot, t).at;
    const set = seenAt.get(at) ?? new Set<number>();
    set.add(sf.indexOf(pieces.sprite(st, 0, t) as never));
    seenAt.set(at, set);
  }
  assert.deepEqual([...seenAt.get('down')!], [0]);
  assert.deepEqual([...seenAt.get('warn')!], [1]);
  assert.deepEqual([...seenAt.get('up')!].sort(), [2, 3]);
  // (and the game's own spikes do not come up out of their patches: they strike in their own pictures)
  for (const h of L.floor.hazards!) assert.equal(pieces.standsFor(h), true);
}));

test('the switch off: floor 13 is not the Millrace (the stand-ins of the frame untouched)', () => {
  assert.equal(ACT2.on, false);
  assert.equal(makeDungeon(13, 5).land, undefined);
});
