// ACT 2, THE HUSH: FLOOR 12, THE UNDERCITY, laid and dressed (game/act2/undercity.ts), behind ACT2 (game/act1.ts: off until
// his yes; switched on here, and put back). His doc's floor 12: "brick tunnels between cisterns, sluice gates, and the river's
// outflow under the walls. Tunnels and chambers, like the Prison's corridors and rooms"; its hazards "sluices that open and
// flood a tunnel, and slick floors"; its boss the Rat King in "The King's Cistern". Over twenty seeds:
//   - everything that matters reached from where he comes in, on the walk grid: each bell, the Muffled Bell, the King, the
//     way on, every pack;
//   - THE BELLS' CONTRACT (docs/act2_build.md): where the Muffled Bell and the bells stand, the Hush's circle, their pieces;
//   - no walkable tile is water, and every crossing is over it;
//   - the King's Cistern big enough for the Roll (about 6.45 tiles a second: long straight runs) and the Unknot (a wide
//     paved floor), the heap's ground clear;
//   - the same seed, the same floor; nothing of the descent's pieces; its two traps; as long as the descent's floors.
//   run: tsx --test tests/act2_undercity.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
import { ACT2 } from '../src/game/act1';
import { BUILT, CRIERS_JAR, FLOOD, MUFFLED_BELL, SLICK, SMALL_BELL, ZONE, surgeSites } from '../src/game/act2/undercity';
import { blobDist } from '../src/game/act1_layout';
import { makeDungeon } from '../src/game/level';
import type { Level } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';
import { UC_ZONE } from '../src/art/undercity';

const fs = nodeFs as { readFileSync(p: string, e: string): string };

function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
const SEEDS = Array.from({ length: 20 }, (_v, k) => k + 1);
const levels = new Map<number, Level>();
const level = (seed: number): Level => {
  let L = levels.get(seed);
  if (!L) {
    L = hush(() => makeDungeon(12, seed));
    levels.set(seed, L);
  }
  return L;
};

/** The pieces' names in an art file (its list of pieces: `name: '...', kind: ...`). */
function namesIn(file: string): Set<string> {
  const src = fs.readFileSync(file, 'utf8');
  const out = new Set<string>();
  for (const m of src.matchAll(/name: (['"])(.*?)\1, kind:/g)) out.add(m[2]);
  return out;
}

/** Every walkable tile reached from where he comes in by side steps on the walk grid. */
function reached(L: Level): Uint8Array {
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
      const u = x + dx;
      const v = y + dy;
      if (u < 0 || v < 0 || u >= W || v >= f.h) continue;
      const j = v * W + u;
      if (seen[j] || L.walk[j] !== 1) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  return seen;
}

test('floor 12 is laid by its own map-maker; its zones are the art\'s', () => {
  assert.equal(BUILT, true);
  assert.deepEqual({ ...ZONE }, { ...UC_ZONE });
  hush(() => {
    const L = level(1);
    assert.equal(L.land?.kind, 'undercity');
    assert.equal(L.act1?.floor, 12);
    assert.equal(L.land!.zones!.length, L.floor.w * L.floor.h);
    assert.equal(L.land!.water!.length, L.floor.w * L.floor.h);
    assert.equal(L.land!.holds.length, 0, 'no stronghold of the descent');
  });
});

test('everything that matters is reached from where he comes in, on the walk grid (each bell, the Muffled Bell, the King, the way on, every pack)', () => {
  for (const seed of SEEDS) {
    const L = level(seed);
    const f = L.floor;
    const W = f.w;
    const got = reached(L);
    const tile = (p: { x: number; y: number }): number => Math.floor(p.y) * W + Math.floor(p.x);
    assert.equal(got[tile(f.boss)], 1, `seed ${seed}: the King`);
    assert.equal(got[tile(L.land!.exit)], 1, `seed ${seed}: the way on`);
    assert.equal(L.walk[tile(L.land!.exit)], 1);
    for (const p of f.packs) assert.equal(got[tile(p)], 1, `seed ${seed}: a pack at ${p.x}, ${p.y}`);
    const b = L.land!.bells!;
    for (const q of [b.muffled, ...b.bells]) {
      // (a bell stands solid on its tile: reached from the eight round it, every one of them walkable)
      const x = Math.floor(q.x);
      const y = Math.floor(q.y);
      let any = false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const j = (y + dy) * W + x + dx;
        assert.equal(L.walk[j], 1, `seed ${seed}: the eight round the bell at ${q.x}, ${q.y} walkable`);
        if (got[j]) any = true;
      }
      assert.ok(any, `seed ${seed}: the bell at ${q.x}, ${q.y} reached`);
    }
  }
});

test('THE BELLS\' CONTRACT (docs/act2_build.md): the Muffled Bell off the main way, five or six bells spread about it, the Hush\'s circle holding them; their pieces', () => {
  for (const seed of SEEDS) {
    const L = level(seed);
    const f = L.floor;
    const land = L.land!;
    const b = land.bells!;
    const boss = f.rooms.find((r) => r.kind === 'boss')!;
    const bossR: [number, number, number, number] = [boss.x, boss.y, boss.x + boss.w, boss.y + boss.h];
    const inBoss = (p: { x: number; y: number }): boolean => p.x >= bossR[0] && p.y >= bossR[1] && p.x < bossR[2] && p.y < bossR[3];
    const d = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);
    const mid = (p: { x: number; y: number }): boolean => p.x - Math.floor(p.x) === 0.5 && p.y - Math.floor(p.y) === 0.5;
    // the Muffled Bell: a tile's middle on whole floor, off the main way (a chamber of its own, not on the way), twelve from the start, not the King's
    assert.ok(mid(b.muffled));
    assert.equal(f.tiles[Math.floor(b.muffled.y) * f.w + Math.floor(b.muffled.x)], T_FLOOR);
    assert.ok(d(b.muffled, f.start) >= 12, `seed ${seed}: the Muffled Bell twelve from the start`);
    assert.ok(!inBoss(b.muffled));
    const its = land.areas.find((a) => {
      const r = f.rooms[a.room];
      return b.muffled.x >= r.x && b.muffled.y >= r.y && b.muffled.x < r.x + r.w && b.muffled.y < r.y + r.h;
    });
    assert.ok(its && its.role === 'side' && f.rooms[its.room].path === -1, `seed ${seed}: the Muffled Bell in a side chamber`);
    // the bells: five or six (floor 12), spread, none near the start, none the King's, all in the Hush with four to spare
    assert.ok(b.bells.length >= 5 && b.bells.length <= 6, `seed ${seed}: ${b.bells.length} bells`);
    for (const q of b.bells) {
      assert.ok(mid(q));
      assert.equal(f.tiles[Math.floor(q.y) * f.w + Math.floor(q.x)], T_FLOOR);
      assert.ok(d(q, f.start) >= 10, `seed ${seed}: a bell ten from the start`);
      assert.ok(!inBoss(q));
      assert.ok(d(q, b.hush) <= b.hush.r - 4, `seed ${seed}: a bell in the Hush with four to spare`);
      for (const o of b.bells) if (o !== q) assert.ok(d(o, q) >= 8, `seed ${seed}: two bells ${d(o, q).toFixed(1)} apart`);
    }
    assert.ok(d(b.hush, b.muffled) <= 1, 'the Hush round the Muffled Bell');
    assert.ok(d(b.hush, f.start) >= b.hush.r + 12, `seed ${seed}: the Hush twelve clear of the start`);
    const rd = Math.hypot(Math.max(bossR[0] - b.hush.x, 0, b.hush.x - bossR[2]), Math.max(bossR[1] - b.hush.y, 0, b.hush.y - bossR[3]));
    assert.ok(rd >= b.hush.r, `seed ${seed}: the Hush clear of the King's Cistern`);
    // their pieces: solid, quiet (state 0, variant 0), on their tiles, nothing solid in the eight round them; each bell at a sluice gate
    const at = (q: { x: number; y: number }, name: string) => L.props.find((p) => p.kind === 'piece' && p.name === name && p.tx === Math.floor(q.x) && p.ty === Math.floor(q.y));
    for (const [q, name] of [[b.muffled, MUFFLED_BELL], ...b.bells.map((q) => [q, SMALL_BELL] as const)] as const) {
      const p = at(q, name);
      assert.ok(p, `seed ${seed}: ${name} at ${q.x}, ${q.y}`);
      assert.equal(p!.solid, true);
      assert.equal(p!.state, 0);
      assert.equal(p!.variant, 0);
      for (const o of L.props) if (o !== p && o.solid) assert.ok(Math.max(Math.abs(o.tx - p!.tx), Math.abs(o.ty - p!.ty)) > 1, `seed ${seed}: ${o.name ?? o.kind} beside ${name}`);
    }
    for (const q of b.bells) assert.ok(L.props.some((p) => p.name === 'a sluice gate' && d(p, q) <= 5), `seed ${seed}: the bell at ${q.x}, ${q.y} at a sluice`);
    assert.equal(L.props.filter((p) => p.name === MUFFLED_BELL).length, 1);
    assert.equal(L.props.filter((p) => p.name === SMALL_BELL).length, b.bells.length);
  }
});

test('no walkable tile is water; the water is never floor; every crossing (a grate, the Order\'s planks) is over it', () => {
  for (const seed of SEEDS) {
    const L = level(seed);
    const f = L.floor;
    const W = f.w;
    const land = L.land!;
    let wet = 0;
    let crossings = 0;
    for (let i = 0; i < W * f.h; i++) {
      if (land.water![i]) {
        wet++;
        assert.notEqual(f.tiles[i], T_FLOOR, `seed ${seed}: water at ${i % W}, ${Math.floor(i / W)} is not floor`);
      }
      if (L.walk[i] === 1) assert.equal(land.water![i], 0, `seed ${seed}: a walkable tile is water`);
      const z = land.zones![i];
      if (z === ZONE.Grate || z === ZONE.Planks) {
        crossings++;
        assert.equal(f.tiles[i], T_FLOOR);
        const x = i % W;
        const y = (i - x) / W;
        const w = (u: number, v: number): boolean => land.water![v * W + u] === 1 || land.zones![v * W + u] === z;
        assert.ok((w(x - 1, y) && w(x + 1, y)) || (w(x, y - 1) && w(x, y + 1)), `seed ${seed}: a crossing at ${x}, ${y} over the water`);
      }
    }
    assert.ok(wet > 300, `seed ${seed}: its channels and pools (${wet})`);
    assert.ok(crossings >= 6, `seed ${seed}: its crossings (${crossings})`);
    // (and the zones: the cisterns paved, the Order's tunnels dug)
    const zs = new Set(land.zones);
    for (const z of [ZONE.Walk, ZONE.Cistern, ZONE.Dug]) assert.ok(zs.has(z), `seed ${seed}: zone ${z}`);
  }
});

test('THE KING\'S CISTERN: wide and paved for the Roll\'s long runs and the Unknot\'s swarm, the heap\'s ground clear, his ground an area of the boss\'s', () => {
  for (const seed of SEEDS) {
    const L = level(seed);
    const f = L.floor;
    const W = f.w;
    const r = f.rooms.find((q) => q.kind === 'boss')!;
    let paved = 0;
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (L.walk[y * W + x] === 1 && L.land!.zones![y * W + x] === ZONE.Cistern) paved++;
    assert.ok(paved >= 380, `seed ${seed}: ${paved} tiles of paving`);
    // the longest straight run three tiles wide along x, and along y (the ball barrels along at about 6.45 tiles a second)
    const run = (alongX: boolean): number => {
      let best = 0;
      const [n, m] = alongX ? [r.h, r.w] : [r.w, r.h];
      for (let k = 1; k + 1 < n; k++) {
        let cur = 0;
        for (let a = 0; a < m; a++) {
          let ok = true;
          for (let o = -1; o <= 1 && ok; o++) {
            const x = alongX ? r.x + a : r.x + k + o;
            const y = alongX ? r.y + k + o : r.y + a;
            ok = L.walk[y * W + x] === 1;
          }
          cur = ok ? cur + 1 : 0;
          best = Math.max(best, cur);
        }
      }
      return best;
    };
    assert.ok(run(true) >= 18 && run(false) >= 18, `seed ${seed}: runs ${run(true)} and ${run(false)}`);
    // the heap near three tiles across: where he waits, five by five clear
    const bx = Math.floor(f.boss.x);
    const by = Math.floor(f.boss.y);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) assert.equal(L.walk[(by + dy) * W + bx + dx], 1, `seed ${seed}: the King's ground`);
    const area = L.land!.areas.find((a) => a.role === 'boss')!;
    assert.ok(area && blobDist(area.blob, f.boss.x, f.boss.y) < 0.8, 'his ground covers where he waits');
    assert.equal(L.land!.areas.find((a) => a.role === 'start')?.room, 0, 'where he comes in');
    // the King's nest at its back, the jar of the Crier's voice in it
    const nest = L.props.find((p) => p.name === "the King's nest");
    const jar = L.props.find((p) => p.name === CRIERS_JAR);
    assert.ok(nest && jar, `seed ${seed}: the nest and the jar`);
    assert.ok(Math.hypot(nest!.x - jar!.x, nest!.y - jar!.y) < 4.5);
    for (const p of [nest!, jar!]) assert.ok(p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h);
  }
});

test('the same seed lays the same floor, dressed the same', () => {
  for (const seed of [3, 11]) {
    const a = level(seed);
    const b = hush(() => makeDungeon(12, seed));
    assert.deepEqual([...a.floor.tiles], [...b.floor.tiles]);
    assert.deepEqual([...a.land!.zones!], [...b.land!.zones!]);
    assert.deepEqual([...a.land!.water!], [...b.land!.water!]);
    assert.deepEqual(a.land!.bells, b.land!.bells);
    assert.deepEqual(a.floor.packs, b.floor.packs);
    assert.deepEqual(a.props.map((p) => [p.kind, p.name, p.x, p.y, p.variant, p.solid]), b.props.map((p) => [p.kind, p.name, p.x, p.y, p.variant, p.solid]));
    assert.deepEqual(a.floor.hazards, b.floor.hazards);
    assert.deepEqual(a.act1, b.act1);
  }
});

test('nothing of the descent\'s pieces: every piece is floor 12\'s own or the Hush\'s; its two traps, each drawn by its own picture', () => {
  const own = new Set([...namesIn('src/art/floor12.ts'), ...namesIn('src/art/act2_set.ts')]);
  assert.ok(own.size >= 50, `the art's names (${own.size})`);
  const descent = new Set<string>();
  for (const k of [6, 7, 8, 9, 10]) for (const n of namesIn(`src/art/floor${k}.ts`)) descent.add(n);
  for (const file of ['src/art/act1_camp.ts', 'src/art/act1_cult.ts', 'src/art/redoubt.ts']) for (const n of namesIn(file)) descent.add(n);
  for (const seed of SEEDS) {
    const L = level(seed);
    const used = new Set<string>();
    for (const p of L.props) if (p.kind === 'piece') used.add(p.name!);
    for (const t of L.act1!.tiles) used.add(t.name);
    for (const t of L.act1!.traps ?? []) used.add(t.name);
    for (const n of used) assert.ok(own.has(n), `seed ${seed}: "${n}" is floor 12's or the Hush's`);
    // (a name the descent has too is drawn as floor 12's own: render/act1_pieces.ts looks its pieces up by floor)
    for (const n of used) if (descent.has(n)) assert.ok(own.has(n));
    // the traps: the flood and the slick, every hazard one of them, drawn once where it stands
    const traps = L.act1!.traps ?? [];
    assert.equal(traps.length, L.hazards.length);
    assert.ok(traps.some((t) => t.name === FLOOD) && traps.some((t) => t.name === SLICK), `seed ${seed}: both traps`);
    for (const z of L.hazards) {
      const t = traps.find((q) => q.x === z.spot.x && q.y === z.spot.y && q.w === z.spot.w && q.h === z.spot.h);
      assert.ok(t, `seed ${seed}: a hazard with its picture`);
      assert.equal(z.spot.kind, 'spikes', 'the spike floor\'s beat, as the descent\'s traps');
      for (let y = z.spot.y; y < z.spot.y + z.spot.h; y++) for (let x = z.spot.x; x < z.spot.x + z.spot.w; x++) assert.equal(L.floor.tiles[y * L.floor.w + x], T_FLOOR, `seed ${seed}: a trap on the floor`);
    }
    // the moment's places (art/floor12_moments.ts, not wired yet): each on a channel two across along x
    for (const s of surgeSites(L.floor, L.land!)) assert.equal(L.land!.water![s.y * L.floor.w + s.x], 1);
  }
});

test('as long as the descent\'s floors (his words of 17 Oct: "The levels are very short in 6-7 so far"): its main way, its floor, its packs', () => {
  for (const seed of SEEDS) {
    const L = level(seed);
    const way = L.land!.way;
    let len = 0;
    for (let i = 1; i < way.length; i++) len += Math.hypot(way[i][0] - way[i - 1][0], way[i][1] - way[i - 1][1]);
    let walk = 0;
    for (let i = 0; i < L.walk.length; i++) walk += L.walk[i];
    assert.ok(len >= 160, `seed ${seed}: its main way ${Math.round(len)} tiles`);
    assert.ok(walk >= 2200, `seed ${seed}: ${walk} walkable tiles`);
    assert.ok(L.floor.packs.length >= 14, `seed ${seed}: ${L.floor.packs.length} packs`);
  }
});
