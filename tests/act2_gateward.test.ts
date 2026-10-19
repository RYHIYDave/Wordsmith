// ACT 2, THE HUSH: FLOOR 11, THE GATE WARD, AS ITS OWN MAP-MAKER LAYS IT AND ITS DRESSER DRESSES IT (game/act2/gateward.ts),
// AND ITS HOUSES WALKED INTO AS THEY ARE DRAWN (render/act2_houses.ts); behind ACT2 (game/act1.ts, off: switched on here, and
// off again after). Held to:
//   - his doc's floor: lanes between the houses opening into squares, the Crier's Square at the far end ("at least 2x that
//     size", then "Bigger still": at least 26 tiles across), houses walked into (the art's GWHouse: its room, its front not
//     walkable but its doorway), the broken city gate behind him where he comes in;
//   - THE BELLS' CONTRACT (docs/act2_build.md): where the Muffled Bell, the small bells and the Hush are, and their pieces;
//   - everything that matters reached from the start on the walk grid, over 20 floors: each bell, the boss, the way on, every
//     house's room; the same seed the same floor; nothing of the descent's pieces laid (only the art's fifty for the floor);
//   - his rule for houses walked into (his art rulebook, Places 9): whole from the street, faded away in about a third of a
//     second once he is inside, what stands in a house under its shell and what stands outside over it; the shell over its
//     own house only, never over the street behind it.
//   run: tsx --test tests/act2_gateward.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import * as fs from 'node:fs';
import { ACT2 } from '../src/game/act1';
import { makeDungeon } from '../src/game/level';
import { GW_NAMES, GW_PLAN, GW_ZONES, bellKinds } from '../src/game/act2/gateward';
import type { GateWardDress } from '../src/game/act2/gateward';
import type { HouseLaid } from '../src/game/act2_types';
import type { Level } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';
import { GW_ZONE } from '../src/art/gateward';
import { worldOf } from '../src/art/terrain';
import { gateWardLand, landTerrain } from '../src/render/outdoor';
import { HouseShells, SHELL_FADE, houseDepth, inHouse, shellMaker, trapSprite } from '../src/render/act2_houses';
import { SPIKE } from '../src/game/traps';
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
assert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;

function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const floors = new Map<number, Level>();
const floorOf = (seed: number): Level => {
  let L = floors.get(seed);
  if (!L) {
    L = hush(() => makeDungeon(11, seed));
    floors.set(seed, L);
  }
  return L;
};

/** The tiles reached from the start, walking as the game walks (its walk grid, side steps). */
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
const tile = (W: number, p: { x: number; y: number }): number => Math.floor(p.y) * W + Math.floor(p.x);
/** A place reached: its tile, or (it is solid: a bell) a tile beside it. */
const reachedAt = (L: Level, seen: Uint8Array, p: { x: number; y: number }): boolean => {
  const W = L.floor.w;
  const i = tile(W, p);
  return !!seen[i] || [1, -1, W, -W].some((d) => seen[i + d] === 1);
};
const bossRect = (L: Level): [number, number, number, number] => {
  const b = L.land!.areas.find((a) => a.role === 'boss')!.blob;
  return [b.x - b.rx, b.y - b.ry, b.x + b.rx, b.y + b.ry];
};
const rectDist = (r: [number, number, number, number], x: number, y: number): number => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - y, 0, y - r[3]));

test('the switch is off; with it on, floor 11 is laid by its own map-maker, as the Gate Ward', () => {
  assert.equal(ACT2.on, false);
  const L = floorOf(1);
  assert.equal(ACT2.on, false, 'switched off again after');
  assert.equal(L.land?.kind, 'gateward');
  assert.equal(L.land!.holds.length, 0, 'no stronghold of the descent');
  assert.ok(L.land!.zones && L.land!.squares && L.land!.houses && L.land!.bells, 'its zones, squares, houses and bells');
  // (the zones are the art's: a street, a square, a room)
  assert.deepEqual(GW_ZONES, GW_ZONE);
  // (as long as the descent's: about 160 tiles, ten open areas on the main way)
  for (const seed of SEEDS) {
    const M = floorOf(seed);
    const way = M.land!.areas.filter((a) => a.role === 'start' || a.role === 'path' || a.role === 'boss');
    assert.equal(way.length, GW_PLAN.chain, `seed ${seed}: ${way.length} open areas on the main way`);
    assert.ok(Math.max(M.floor.w, M.floor.h) >= 110, `seed ${seed}: ${M.floor.w} by ${M.floor.h}`);
    assert.ok(M.land!.areas.some((a) => a.role === 'lair'), 'a lair');
    assert.ok(M.land!.areas.some((a) => a.role === 'side'), 'a side area');
  }
});

test('over 20 floors, everything that matters is reached from the start: each bell, the boss, the way on, every house\'s room', () => {
  for (const seed of SEEDS) {
    const L = floorOf(seed);
    const land = L.land!;
    const seen = reached(L);
    const B = land.bells!;
    assert.ok(reachedAt(L, seen, B.muffled), `seed ${seed}: the Muffled Bell`);
    B.bells.forEach((b, n) => assert.ok(reachedAt(L, seen, b), `seed ${seed}: bell ${n}`));
    assert.ok(seen[tile(L.floor.w, L.floor.boss!)], `seed ${seed}: the boss`);
    assert.ok(seen[tile(L.floor.w, land.exit)], `seed ${seed}: the way on`);
    land.houses!.forEach((h, n) => {
      let any = false;
      for (let y = h.room[1]; y < h.room[3]; y++) for (let x = h.room[0]; x < h.room[2]; x++) if (seen[y * L.floor.w + x]) any = true;
      assert.ok(any, `seed ${seed}: house ${n}'s room`);
    });
    assert.ok(land.houses!.length >= 4, `seed ${seed}: ${land.houses!.length} houses walked into`);
    // (and every pack's middle, and every chest)
    for (const p of L.floor.packs!) assert.ok(reachedAt(L, seen, p), `seed ${seed}: a pack at ${p.x},${p.y}`);
    for (const p of L.props.filter((q) => q.kind === 'chest')) assert.ok(reachedAt(L, seen, p), `seed ${seed}: a chest`);
  }
});

test('THE BELLS\' CONTRACT (docs/act2_build.md) holds on every floor, and their pieces are laid at them', () => {
  for (const seed of SEEDS) {
    const L = floorOf(seed);
    const f = L.floor;
    const W = f.w;
    const land = L.land!;
    const B = land.bells!;
    const s = f.start;
    const br = bossRect(L);
    const mid = (p: { x: number; y: number }): boolean => Math.abs(p.x - Math.floor(p.x) - 0.5) < 1e-9 && Math.abs(p.y - Math.floor(p.y) - 0.5) < 1e-9;
    // THE MUFFLED BELL: a tile's middle, on whole floor, off the main way (in a side area), 12 tiles from the start at least, not in the boss's ground
    assert.ok(mid(B.muffled) && f.tiles[tile(W, B.muffled)] === T_FLOOR, `seed ${seed}: the Muffled Bell on a tile's middle`);
    const side = land.areas.find((a) => a.role === 'side' && Math.abs(B.muffled.x - a.blob.x) < a.blob.rx && Math.abs(B.muffled.y - a.blob.y) < a.blob.ry);
    assert.ok(side, `seed ${seed}: the Muffled Bell in a side area, off the main way`);
    assert.ok(Math.hypot(B.muffled.x - s.x, B.muffled.y - s.y) >= 12, `seed ${seed}: the Muffled Bell 12 tiles from the start`);
    assert.ok(rectDist(br, B.muffled.x, B.muffled.y) > 0, `seed ${seed}: the Muffled Bell not in the boss's ground`);
    // THE BELLS: four or five on floor 11, each a tile's middle on whole floor, no two within 8, none in the boss's ground, none within 10 of the start
    assert.ok(B.bells.length >= 4 && B.bells.length <= 5, `seed ${seed}: ${B.bells.length} bells`);
    B.bells.forEach((b, n) => {
      assert.ok(mid(b) && f.tiles[tile(W, b)] === T_FLOOR, `seed ${seed}: bell ${n} on a tile's middle of floor`);
      assert.ok(rectDist(br, b.x, b.y) > 0, `seed ${seed}: bell ${n} not in the boss's ground`);
      assert.ok(Math.hypot(b.x - s.x, b.y - s.y) >= 10, `seed ${seed}: bell ${n} 10 from the start`);
      B.bells.forEach((o, m) => assert.ok(m === n || Math.hypot(b.x - o.x, b.y - o.y) >= 8, `seed ${seed}: bells ${n} and ${m} 8 apart`));
      // (the Hush holds it, 4 tiles to spare)
      assert.ok(Math.hypot(b.x - B.hush.x, b.y - B.hush.y) <= B.hush.r - 4 + 1e-9, `seed ${seed}: bell ${n} in the Hush, 4 to spare`);
    });
    // THE HUSH: round the Muffled Bell, 12 clear of the start, clear of the boss's ground
    assert.ok(Math.hypot(B.hush.x - B.muffled.x, B.hush.y - B.muffled.y) < 1, `seed ${seed}: the Hush round the Muffled Bell`);
    assert.ok(Math.hypot(B.hush.x - s.x, B.hush.y - s.y) >= B.hush.r + 12, `seed ${seed}: the Hush 12 clear of the start`);
    assert.ok(rectDist(br, B.hush.x, B.hush.y) >= B.hush.r, `seed ${seed}: the Hush clear of the boss's ground`);
    // THEIR PIECES: a piece prop at each, state 0; the Muffled Bell and the standing bells solid, variant 0; the doorbell on the wall
    const at = (p: { x: number; y: number }) => L.props.filter((q) => q.kind === 'piece' && q.tx === Math.floor(p.x) && q.ty === Math.floor(p.y));
    const mb = at(B.muffled);
    assert.ok(mb.length === 1 && mb[0].name === GW_NAMES.muffled && mb[0].solid && mb[0].state === 0 && mb[0].variant === 0, `seed ${seed}: the Muffled Bell's piece`);
    const kinds = bellKinds(f, B);
    assert.ok(kinds.includes('door') && kinds.some((k) => k !== 'door'), `seed ${seed}: the bells mixed: ${kinds}`);
    B.bells.forEach((b, n) => {
      const p = at(b);
      assert.equal(p.length, 1, `seed ${seed}: bell ${n}'s piece`);
      const want = kinds[n] === 'door' ? GW_NAMES.door : kinds[n] === 'shrine' ? GW_NAMES.shrine : GW_NAMES.watch;
      assert.equal(p[0].name, want);
      assert.equal(p[0].state, 0);
      if (kinds[n] === 'door') {
        // (on the wall: at a house front's foot, the street side; its face by its variant's first bit, its frame its state's)
        const face = p[0].variant & 1;
        const back = face === 0 ? f.tiles[(p[0].ty - 1) * W + p[0].tx] : f.tiles[p[0].ty * W + p[0].tx - 1];
        assert.notEqual(back, T_FLOOR, `seed ${seed}: the doorbell has a house at its back`);
        assert.ok(face === 0 ? p[0].y === p[0].ty : p[0].x === p[0].tx, `seed ${seed}: the doorbell on its wall's foot line`);
      } else assert.ok(p[0].solid && p[0].variant === 0, `seed ${seed}: bell ${n} stands, solid`);
    });
    // (the 8 tiles round each bell: those of floor walkable, nothing solid on them)
    for (const b of [B.muffled, ...B.bells]) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const i = (Math.floor(b.y) + dy) * W + Math.floor(b.x) + dx;
        if (f.tiles[i] !== T_FLOOR) continue;
        assert.equal(L.walk[i], 1, `seed ${seed}: the tile ${dx},${dy} by the bell at ${b.x},${b.y} walkable`);
      }
    }
  }
});

test('the Crier\'s Square is at least 26 tiles across; his rostrum and the proclamation are in it; the way on at its far side', () => {
  for (const seed of SEEDS) {
    const L = floorOf(seed);
    const r = bossRect(L);
    assert.ok(r[2] - r[0] >= 26 && r[3] - r[1] >= 26, `seed ${seed}: ${r[2] - r[0]} by ${r[3] - r[1]}`);
    const inR = (p: { x: number; y: number }): boolean => p.x >= r[0] && p.x < r[2] && p.y >= r[1] && p.y < r[3];
    assert.ok(inR(L.floor.boss!), 'the boss in it');
    assert.ok(inR(L.land!.exit), 'the way on in it');
    const rost = L.props.find((p) => p.name === GW_NAMES.rostrum);
    assert.ok(rost && inR(rost), `seed ${seed}: his rostrum in it`);
    const quest = L.props.find((p) => p.name === GW_NAMES.quest);
    assert.ok(quest && !quest.solid && Math.hypot(quest.x - rost!.x, quest.y - rost!.y) < 2, `seed ${seed}: the crier's last proclamation by the rostrum, walked over`);
    // (the way on at the far side from where the way came in: further from the square's way in than its middle is)
    const way = L.land!.way;
    const from = way[way.length - 2];
    const [cx, cy] = [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
    assert.ok(Math.hypot(L.land!.exit.x - from[0], L.land!.exit.y - from[1]) > Math.hypot(cx - from[0], cy - from[1]), `seed ${seed}: the way on at the far side`);
    // (the boss's ground as the game asks it: its blob round it)
    const boss = L.land!.areas.find((a) => a.role === 'boss')!;
    assert.ok(boss.blob.rx >= 13 && boss.blob.ry >= 13 && boss.blob.wob === 0);
  }
});

test('the houses walked into are as the art\'s GWHouse says: the room and doorway walkable, rooms; the front a wall but its doorway', () => {
  for (const seed of SEEDS) {
    const L = floorOf(seed);
    const f = L.floor;
    const W = f.w;
    const z = L.land!.zones!;
    L.land!.houses!.forEach((h: HouseLaid, n) => {
      const [x0, y0, x1, y1] = h.room;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        assert.equal(f.tiles[y * W + x], T_FLOOR, `seed ${seed}: house ${n}'s room is floor`);
        assert.equal(z[y * W + x], GW_ZONES.Room);
      }
      const F = h.front;
      const span: [number, number] = F.along === 'x' ? [x0, x1] : [y0, y1];
      assert.equal(F.at, F.along === 'x' ? y1 : x1, 'its front just before its room, toward the eye');
      assert.ok(F.door[0] > span[0] && F.door[1] < span[1] && F.door[1] - F.door[0] === GW_PLAN.houses.door, `seed ${seed}: house ${n}'s doorway in its front`);
      for (let k = span[0]; k < span[1]; k++) {
        const i = F.along === 'x' ? F.at * W + k : k * W + F.at;
        const door = k >= F.door[0] && k < F.door[1];
        assert.equal(f.tiles[i] === T_FLOOR, door, `seed ${seed}: house ${n}'s front at ${k}: ${door ? 'its doorway' : 'a wall'}`);
        if (door) {
          assert.equal(z[i], GW_ZONES.Room, 'its doorway a room');
          // (the street before it)
          const o = F.along === 'x' ? (F.at + 1) * W + k : k * W + F.at + 1;
          assert.equal(f.tiles[o], T_FLOOR, 'the street before its doorway');
          assert.equal(L.walk[o], 1, 'nothing standing before its doorway');
          assert.equal(L.walk[i], 1, 'nothing standing in its doorway');
        }
      }
      // (houses round it at its back and sides: nothing of the street behind its shell)
      const ring: [number, number, number, number] = [x0 - 2, y0 - 2, F.along === 'x' ? x1 + 2 : x1, F.along === 'x' ? y1 : y1 + 2];
      for (let y = ring[1]; y < ring[3]; y++) for (let x = ring[0]; x < ring[2]; x++) {
        if (x >= x0 && x < x1 && y >= y0 && y < y1) continue;
        assert.notEqual(f.tiles[y * W + x], T_FLOOR, `seed ${seed}: house ${n}: floor at ${x},${y} by its room`);
      }
    });
  }
});

test('the same seed, the same floor; the squares\' rings, the start and the boss as the game asks them', () => {
  for (const seed of [2, 7]) {
    const a = hush(() => makeDungeon(11, seed));
    const b = hush(() => makeDungeon(11, seed));
    assert.deepEqual(Array.from(a.floor.tiles), Array.from(b.floor.tiles));
    assert.deepEqual(a.props.map((p) => [p.name ?? p.kind, p.tx, p.ty, p.variant]), b.props.map((p) => [p.name ?? p.kind, p.tx, p.ty, p.variant]));
    assert.deepEqual(a.land!.bells, b.land!.bells);
    assert.deepEqual(a.land!.houses, b.land!.houses);
    assert.deepEqual(a.floor.packs, b.floor.packs);
  }
  const L = floorOf(3);
  assert.equal(L.land!.areas.filter((q) => q.role === 'start').length, 1);
  assert.equal(L.land!.areas.filter((q) => q.role === 'boss').length, 1);
  assert.ok(L.land!.squares!.length >= 9, 'a ring of setts in every square');
});

test('nothing of the descent\'s pieces is laid: only the art\'s fifty for the floor (art/floor11.ts and art/act2_set.ts); the gate behind him', () => {
  const names = new Set<string>();
  for (const file of ['src/art/floor11.ts', 'src/art/act2_set.ts']) {
    const src = fs.readFileSync(file, 'utf8') as string;
    for (const m of src.matchAll(/\{ name: (['"])(.*?)\1, kind: '/g)) names.add(m[2]);
  }
  assert.equal(names.size, 50, `the art's fifty: ${names.size}`);
  for (const seed of SEEDS) {
    const L = floorOf(seed);
    for (const p of L.props) if (p.kind === 'piece') assert.ok(names.has(p.name!), `seed ${seed}: "${p.name}" is not one of the floor's`);
    for (const t of L.act1!.tiles) assert.ok(names.has(t.name), `seed ${seed}: the tile "${t.name}"`);
    // (only the game's own things besides: chests, and its breakables drawn as the floor's barrel and crates)
    for (const p of L.props) assert.ok(['piece', 'chest', 'barrel', 'urn'].includes(p.kind), `seed ${seed}: a ${p.kind}`);
    // (the gate, behind him: within a few tiles of where he comes in)
    const g = L.props.find((p) => p.name === GW_NAMES.gate);
    assert.ok(g && Math.hypot(g.x - L.floor.start.x, g.y - L.floor.start.y) < 5, `seed ${seed}: the city gate behind him`);
  }
  // (the floor laid with the piece names the dresser's list gives: all fifty-odd of what it lays are the art's)
  for (const n of Object.values(GW_NAMES)) assert.ok(names.has(n), n);
});

test('the traps are laid as the descent\'s are, a spike floor\'s beat, and their pictures follow it', () => {
  for (const seed of SEEDS.slice(0, 6)) {
    const L = floorOf(seed);
    const d = L.act1 as unknown as GateWardDress;
    assert.ok(d.wardTraps.length >= 4, `seed ${seed}: ${d.wardTraps.length} traps`);
    const hz = L.floor.hazards!;
    for (const t of d.wardTraps) {
      const p = L.props.find((q) => q.kind === 'piece' && q.ty * L.floor.w + q.tx === t.i)!;
      assert.equal(p.name, t.name);
      assert.equal(hz[t.hz].kind, 'spikes');
      // (the beat: quiet, the warning, sprung: the frames as the art has them)
      const frames = Array.from({ length: 10 }, (_, k) => ({ img: null, w: 1, h: 1, ax: 0, ay: k }));
      const piece = () => ({ name: t.name, kind: 'trap' as const, frames: frames as never });
      const phase = hz[t.hz].phase ?? 0;
      const down = trapSprite(L, p, 0.5 - phase + 10 * (SPIKE.down + SPIKE.warn + SPIKE.up), piece)!;
      const warn = trapSprite(L, p, SPIKE.down + 0.1 - phase + 10 * (SPIKE.down + SPIKE.warn + SPIKE.up), piece)!;
      const up = trapSprite(L, p, SPIKE.down + SPIKE.warn + 0.1 - phase + 10 * (SPIKE.down + SPIKE.warn + SPIKE.up), piece)!;
      if (t.name === GW_NAMES.firepot) assert.ok(down.ay < 2 && warn.ay >= 2 && up.ay >= 2, 'the firepot flares as it bites');
      else assert.deepEqual([down.ay, warn.ay, up.ay], [t.frame0, t.frame0 + 1, t.frame0 + 2], `${t.name}'s frames by its beat`);
    }
  }
});

test('his rule for houses walked into: what is in a house under its shell, what is outside over it; faded in about a third of a second', () => {
  const L = floorOf(4);
  const land = L.land!;
  const h = land.houses![0];
  const shells = new HouseShells(() => null);
  shells.begin(land, L.floor, null, null, 0);
  // (no shells painted here: nothing to stand, but the fade and the order are kept all the same)
  const camOx = 400;
  const camOy = 100;
  const at = (x: number, y: number) => ({ d: x + y, x: camOx + (x - y) * 16 });
  const F = h.front;
  const inside = F.along === 'x' ? at(h.room[2] - 0.5, F.at - 0.5) : at(F.at - 0.5, h.room[3] - 0.5);
  const door = F.along === 'x' ? at(F.door[0] + 0.5, F.at + 0.5) : at(F.at + 0.5, F.door[0] + 0.5);
  const street = F.along === 'x' ? at(h.room[0] + 0.3, F.at + 1.3) : at(F.at + 1.3, h.room[1] + 0.3);
  const stands = [inside, door, street];
  const D = houseDepth(h);
  shells.lay(stands, camOx, camOy, F.along === 'x' ? h.room[0] + 0.5 : F.at + 3, F.along === 'x' ? F.at + 3 : h.room[1] + 0.5, 0.016, () => undefined);
  assert.ok(inside.d < D && door.d < D, 'what stands in the house (its room, its doorway) goes under its shell');
  assert.ok(street.d > D, 'what stands in the street before it goes over its shell');
  // (the hero in its room: it fades, all gone within a third of a second and a little; out again, it comes back as fast)
  const hx = (h.room[0] + h.room[2]) / 2;
  const hy = (h.room[1] + h.room[3]) / 2;
  assert.ok(inHouse(h, hx, hy));
  let t = 0.016;
  for (let k = 0; k < 10; k++) shells.lay([], camOx, camOy, hx, hy, (t += 0.03), () => undefined);
  assert.ok(shells.showing()[0] > 0 && shells.showing()[0] < 0.2, `a third of a second in: ${shells.showing()[0]}`);
  for (let k = 0; k < 3; k++) shells.lay([], camOx, camOy, hx, hy, (t += 0.03), () => undefined);
  assert.equal(shells.showing()[0], 0, 'gone');
  assert.ok(SHELL_FADE > 0.25 && SHELL_FADE < 0.4);
  for (let k = 0; k < 12; k++) shells.lay([], camOx, camOy, hx, h.room[3] + 6, (t += 0.03), () => undefined);
  assert.equal(shells.showing()[0], 1, 'back whole as he leaves');
});

test('a house\'s shell, made as the ground\'s worker makes it: over its own house and roof, never over the street behind it or before it', () => {
  const L = floorOf(5);
  const land = L.land!;
  const f = L.floor;
  const open = landTerrain(land, f);
  const mk = shellMaker(gateWardLand(land, f), open);
  assert.equal(mk.count, land.houses!.length);
  const h = land.houses![0];
  const sh = mk.make(0);
  let n = 0;
  let street = 0;
  const F = h.front;
  const own = (tx: number, ty: number): boolean => (tx >= h.room[0] && tx < h.room[2] && ty >= h.room[1] && ty < h.room[3]) || (F.along === 'x' ? ty === F.at && tx >= h.room[0] && tx < h.room[2] : tx === F.at && ty >= h.room[1] && ty < h.room[3]);
  for (let i = 0; i < sh.w * sh.h; i++) {
    if (!sh.rgba[i * 4 + 3]) continue;
    n++;
    const [x, y] = worldOf(sh.x0 + (i % sh.w), sh.y0 + Math.floor(i / sh.w));
    if (open.ground(x, y) && !own(Math.floor(x), Math.floor(y))) street++;
  }
  assert.ok(n > 2000, `its shell: ${n} pixels`);
  assert.equal(street, 0, 'none of it over the street');
});
