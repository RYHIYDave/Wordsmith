// ACT 2, THE HUSH: FLOOR 15, THE GREAT LIBRARY, AS ITS MAP-MAKER LAYS IT AND ITS DRESSER DRESSES IT (game/act2/library.ts; behind
// ACT2, game/act1.ts, off until his yes: switched on in each test here and off after). His doc's floor: "The lair floor that ends
// the first half: the stolen words are being bound into one book here."; "tall halls of shelves, galleries, rolling ladders,
// chained books and candle chandeliers."; "on the lectern at the heart of the library lies the book of stolen words, nearly
// full."; the Censor's Reading Room, where "At half life he blacks out parts of the floor for good, so the room shrinks". Over 20
// seeds: everything that matters reached from the start on the walk grid; the Bells' contract (docs/act2_build.md); the stacks'
// aisles walkable end to end; the Reading Room big enough to lose a third and keep a fight; the same seed the same floor;
// nothing of the descent's pieces.
//   run: tsx --test tests/act2_library.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';
import { LB_ZONE } from '../src/art/library';
import { ACT2 } from '../src/game/act1';
import { ACT1_SETS, CAMP, HOLD } from '../src/game/act1_dress';
import { BUILT, LB, LB_PIECES, READING } from '../src/game/act2/library';
import type { LibraryDress } from '../src/game/act2/library';
import { makeDungeon } from '../src/game/level';
import type { Level } from '../src/game/state';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Room } from '../src/game/types';
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
assert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;

const fs = nodeFs as { readFileSync(p: string, e: string): string };
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
const levels = new Map<number, Level>();
/** Floor 15 for a run's seed, laid as the game lays it (with ACT2 on only while it is laid). */
function floor15(seed: number): Level {
  let L = levels.get(seed);
  if (!L) {
    L = hush(() => makeDungeon(15, seed));
    levels.set(seed, L);
  }
  return L;
}
/** Every tile reached from where he comes in, by side steps on the walk grid (the game's way-finding has no corner cutting). */
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
const tileOf = (L: Level, p: { x: number; y: number }): number => Math.floor(p.y) * L.floor.w + Math.floor(p.x);
/** A place reached: its tile, or (something solid stands there) a tile beside it. */
function reaches(L: Level, got: Uint8Array, p: { x: number; y: number }): boolean {
  const W = L.floor.w;
  const i = tileOf(L, p);
  return got[i] === 1 || [1, -1, W, -W].some((d) => got[i + d] === 1);
}
const zoneOf = (L: Level, r: Room): number => L.land!.zones![(r.y + Math.floor(r.h / 2)) * L.floor.w + r.x + Math.floor(r.w / 2)];
const reading = (L: Level): Room => L.floor.rooms.find((r) => r.kind === 'boss')!;
const inBox = (r: Room, p: { x: number; y: number }, pad = 0): boolean => p.x >= r.x - pad && p.y >= r.y - pad && p.x < r.x + r.w + pad && p.y < r.y + r.h + pad;

test('built: its zones are the art\'s own numbers (art/library.ts LB_ZONE), and with the switch off floor 15 is not the library', () => {
  assert.equal(BUILT, true);
  assert.deepEqual({ ...LB }, { ...LB_ZONE });
  assert.equal(ACT2.on, false);
  assert.equal(makeDungeon(15, 3).land, undefined);
});

test('over 20 seeds: the Great Library, long, every room and everything that matters reached from the start on the walk grid', () => {
  for (const s of SEEDS) {
    const L = floor15(s);
    const f = L.floor;
    const land = L.land!;
    assert.equal(land.kind, 'library', `seed ${s}`);
    const got = reached(L);
    assert.ok(reaches(L, got, f.boss), `seed ${s}: the boss`);
    assert.ok(reaches(L, got, land.exit), `seed ${s}: the way on`);
    const b = land.bells!;
    assert.ok(reaches(L, got, b.muffled), `seed ${s}: the Muffled Bell`);
    for (const q of b.bells) assert.ok(reaches(L, got, q), `seed ${s}: a hand bell at ${q.x},${q.y}`);
    for (const p of f.packs) assert.ok(reaches(L, got, p), `seed ${s}: a pack at ${p.x},${p.y}`);
    for (const p of L.props) if (p.kind === 'chest') assert.ok(reaches(L, got, p), `seed ${s}: a chest`);
    for (const r of f.rooms) {
      let any = false;
      for (let ty = r.y; ty < r.y + r.h && !any; ty++) for (let tx = r.x; tx < r.x + r.w && !any; tx++) any = got[ty * f.w + tx] === 1;
      assert.ok(any, `seed ${s}: room ${r.id} (${r.kind}) reached`);
    }
    // (every walkable tile of the floor reached: nothing laid cuts any of it off)
    let lost = 0;
    for (let i = 0; i < f.w * f.h; i++) if (L.walk[i] === 1 && !got[i]) lost++;
    assert.equal(lost, 0, `seed ${s}: walkable tiles cut off`);
    // ("The levels are very short in 6-7 so far": a long floor, as the descent's were made)
    let tiles = 0;
    for (const t of f.tiles) if (t === T_FLOOR) tiles++;
    assert.ok(tiles >= 3500, `seed ${s}: ${tiles} tiles of floor`);
    assert.ok(Math.hypot(f.boss.x - f.start.x, f.boss.y - f.start.y) >= 80, `seed ${s}: the Reading Room far from the doors`);
    assert.ok(f.packs.length >= 20, `seed ${s}: ${f.packs.length} packs`);
  }
});

test('the Bells\' contract (docs/act2_build.md): the Muffled Bell off the main way; six or seven hand bells spread about, none in the boss\'s ground nor by the start; the Hush round them all; their pieces, and the eight tiles round each clear', () => {
  for (const s of SEEDS) {
    const L = floor15(s);
    const f = L.floor;
    const land = L.land!;
    const b = land.bells!;
    const R = reading(L);
    const mid = (p: { x: number; y: number }): boolean => Math.abs(p.x % 1 - 0.5) < 1e-9 && Math.abs(p.y % 1 - 0.5) < 1e-9;
    const d = (p: { x: number; y: number }, q: { x: number; y: number }): number => Math.hypot(p.x - q.x, p.y - q.y);
    // the Muffled Bell: a tile's middle, in a room off the main way (a side area), 12 tiles from the start, not in the boss's ground
    assert.ok(mid(b.muffled), `seed ${s}`);
    const mRoom = f.rooms.find((r) => inBox(r, b.muffled))!;
    assert.ok(mRoom && mRoom.path === -1, `seed ${s}: the Muffled Bell off the main way`);
    assert.equal(land.areas.find((a) => a.room === mRoom.id)!.role, 'side');
    assert.ok(d(b.muffled, f.start) >= 12, `seed ${s}`);
    assert.ok(!inBox(R, b.muffled, 1), `seed ${s}`);
    // the bells: six or seven (floor 15), each a tile's middle on whole floor, no two within 8, none in the boss's ground, none within 10 of the start
    assert.ok(b.bells.length >= 6 && b.bells.length <= 7, `seed ${s}: ${b.bells.length} bells`);
    b.bells.forEach((q, k) => {
      assert.ok(mid(q), `seed ${s}`);
      assert.equal(f.tiles[tileOf(L, q)], T_FLOOR);
      assert.equal(f.cut?.[tileOf(L, q)] ?? 0, 0);
      assert.ok(!inBox(R, q, 1), `seed ${s}: a bell in the boss's ground`);
      assert.ok(d(q, f.start) >= 10, `seed ${s}: a bell by the start`);
      for (const o of b.bells.slice(k + 1)) assert.ok(d(q, o) >= 8, `seed ${s}: two bells ${d(q, o).toFixed(1)} apart`);
      // (in the Hush, with 4 tiles to spare)
      assert.ok(d(q, b.hush) <= b.hush.r - 4, `seed ${s}: a bell ${d(q, b.hush).toFixed(1)} from the Hush's middle, r ${b.hush.r}`);
    });
    // the Hush: round the Muffled Bell, not reaching the start (12 tiles clear) nor the boss's ground
    assert.ok(d(b.hush, b.muffled) <= 1.5, `seed ${s}`);
    assert.ok(d(b.hush, f.start) >= b.hush.r + 12, `seed ${s}: the Hush reaches the start`);
    for (let ty = R.y; ty < R.y + R.h; ty++) for (let tx = R.x; tx < R.x + R.w; tx++) assert.ok(Math.hypot(tx + 0.5 - b.hush.x, ty + 0.5 - b.hush.y) > b.hush.r, `seed ${s}: the Hush reaches the Reading Room`);
    // their pieces (kind 'piece', solid, state 0, variant 0), the names the contract's, and the eight tiles round each walkable and clear
    const at = (p: { x: number; y: number }, name: string): void => {
      const pc = L.props.find((q) => q.kind === 'piece' && q.tx === Math.floor(p.x) && q.ty === Math.floor(p.y) && q.solid);
      assert.ok(pc, `seed ${s}: ${name}'s piece`);
      assert.equal(pc!.name, name);
      assert.equal(pc!.state, 0);
      assert.equal(pc!.variant, 0);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const i = (Math.floor(p.y) + dy) * f.w + Math.floor(p.x) + dx;
        assert.equal(L.walk[i], 1, `seed ${s}: round ${name}`);
        assert.ok(!L.props.some((q) => q.solid && q.ty * f.w + q.tx === i), `seed ${s}: something solid round ${name}`);
      }
    };
    at(b.muffled, "the library's closing bell (the Muffled Bell)");
    for (const q of b.bells) at(q, 'a hand bell');
    // (and nothing on the floor is the bells' but these)
    assert.equal(L.props.filter((p) => p.name === LB_PIECES.bell).length, b.bells.length);
    assert.equal(L.props.filter((p) => p.name === LB_PIECES.muffled).length, 1);
  }
});

test('the stacks: rows of shelves a tile thick, and every aisle between them walkable end to end', () => {
  let rooms = 0;
  for (const s of SEEDS) {
    const L = floor15(s);
    const f = L.floor;
    for (const r of f.rooms) {
      if (zoneOf(L, r) !== LB.Stacks) continue;
      rooms++;
      const rowsX = f.tiles[(r.y + 2) * f.w + r.x + 4] === T_WALL || f.tiles[(r.y + 2) * f.w + r.x + r.w - 5] === T_WALL;
      const across = rowsX ? r.h : r.w;
      const along = rowsX ? r.w : r.h;
      let shelves = 0;
      let aisles = 0;
      for (let k = 0; k < across; k++) {
        const shelf = k % 3 === 2 && k <= across - 3;
        for (let a = 0; a < along; a++) {
          const tx = rowsX ? r.x + a : r.x + k;
          const ty = rowsX ? r.y + k : r.y + a;
          const i = ty * f.w + tx;
          if (shelf) {
            if (f.tiles[i] === T_WALL) shelves++;
          } else assert.equal(L.walk[i], 1, `seed ${s}: room ${r.id}'s aisle ${k} at ${tx},${ty}`);
        }
        if (!shelf) aisles++;
      }
      assert.ok(shelves >= along, `seed ${s}: room ${r.id} has its shelves`);
      assert.ok(aisles >= 12, `seed ${s}: room ${r.id}: ${aisles} rows of aisle`);
    }
  }
  assert.ok(rooms >= 3 * SEEDS.length, `${rooms} stacks`);
});

test('the Reading Room: big enough to lose a third of its floor and still have a fight, its middle open, the book of stolen words on the great lectern at its heart', () => {
  for (const s of SEEDS) {
    const L = floor15(s);
    const f = L.floor;
    const R = reading(L);
    assert.equal(zoneOf(L, R), LB.Reading);
    assert.ok(Math.min(R.w, R.h) >= READING.short[0] && Math.max(R.w, R.h) >= READING.long[0], `seed ${s}: ${R.w} by ${R.h}`);
    const cx = R.x + Math.floor(R.w / 2);
    const cy = R.y + Math.floor(R.h / 2);
    const book = L.props.find((p) => p.name === LB_PIECES.book)!;
    assert.ok(book && book.solid && book.tx === cx && book.ty === cy, `seed ${s}: the book at the heart`);
    // (its middle: nothing solid within three tiles of the carpet's inside but the lectern and its two candelabra)
    const solidIn = L.props.filter((p) => p.solid && p.tx >= R.x + 3 && p.ty >= R.y + 3 && p.tx < R.x + R.w - 3 && p.ty < R.y + R.h - 3);
    assert.ok(solidIn.every((p) => p.name === LB_PIECES.book || p.name === LB_PIECES.candelabrum), `seed ${s}: ${solidIn.map((p) => p.name).join(', ')}`);
    assert.ok(solidIn.length <= 3);
    let walk = 0;
    for (let ty = R.y; ty < R.y + R.h; ty++) for (let tx = R.x; tx < R.x + R.w; tx++) if (L.walk[ty * f.w + tx] === 1) walk++;
    assert.ok(walk >= 0.9 * R.w * R.h, `seed ${s}: ${walk} of ${R.w * R.h} walkable`);
    // (a third of it blacked out, the third at any of its four sides: what is left all joined, and still more than 380 tiles)
    for (const side of [0, 1, 2, 3]) {
      const out = (tx: number, ty: number): boolean => (side === 0 ? tx < R.x + R.w / 3 : side === 1 ? tx >= R.x + (2 * R.w) / 3 : side === 2 ? ty < R.y + R.h / 3 : ty >= R.y + (2 * R.h) / 3);
      const left: number[] = [];
      for (let ty = R.y; ty < R.y + R.h; ty++) for (let tx = R.x; tx < R.x + R.w; tx++) if (L.walk[ty * f.w + tx] === 1 && !out(tx, ty)) left.push(ty * f.w + tx);
      const set = new Set(left);
      const seen = new Set([left[0]]);
      const q = [left[0]];
      while (q.length) {
        const i = q.pop()!;
        for (const j of [i + 1, i - 1, i + f.w, i - f.w]) if (set.has(j) && !seen.has(j)) {
          seen.add(j);
          q.push(j);
        }
      }
      assert.equal(seen.size, left.length, `seed ${s}: the room less a third at side ${side} falls apart`);
      assert.ok(left.length >= 380, `seed ${s}: ${left.length} tiles left`);
    }
    // the boss waits in it, beyond the lectern; the way on is past it, through its far wall
    assert.ok(inBox(R, L.floor.boss), `seed ${s}`);
    assert.ok(!inBox(R, L.land!.exit), `seed ${s}: the way on beyond the Reading Room`);
    const area = L.land!.areas.find((a) => a.role === 'boss')!;
    assert.equal(area.room, R.id);
    assert.ok(Math.abs(area.blob.x - (R.x + R.w / 2)) < 1e-9 && area.blob.rx === R.w / 2);
  }
});

test('its dressing: the doors where he comes in; chandeliers hung (nothing of them on the floor), lit an honest orange; its trap the spilled ink; walls hung; where the chandelier may fall kept clear', () => {
  for (const s of SEEDS) {
    const L = floor15(s);
    const f = L.floor;
    const doors = L.props.filter((p) => p.name === LB_PIECES.doors);
    assert.equal(doors.length, 1, `seed ${s}`);
    assert.ok(Math.hypot(doors[0].x - f.start.x, doors[0].y - f.start.y) < 4, `seed ${s}: the doors behind where he comes in`);
    assert.equal(doors[0].variant >> 1, 1, 'standing open');
    const ch = L.props.filter((p) => p.name === LB_PIECES.chandelier);
    assert.ok(ch.length >= 10, `seed ${s}: ${ch.length} chandeliers`);
    assert.ok(ch.every((p) => !p.solid), 'they hang');
    assert.ok(L.props.filter((p) => p.name === LB_PIECES.sconce).length >= 20, `seed ${s}: sconces`);
    assert.ok(L.props.filter((p) => p.name === LB_PIECES.desk || p.name === LB_PIECES.chained).length >= 6, `seed ${s}: desks`);
    assert.ok(L.props.some((p) => p.name === LB_PIECES.copying) && L.props.some((p) => p.name === LB_PIECES.press), `seed ${s}: the scriptorium's`);
    // (every wall piece at a far wall's foot, its face turned to the floor it stands on)
    for (const p of L.props) {
      if (p.name !== LB_PIECES.sconce && p.name !== LB_PIECES.portrait && p.name !== LB_PIECES.banner && p.name !== LB_PIECES.doors) continue;
      const face = p.variant & 1;
      assert.equal(f.tiles[p.ty * f.w + p.tx], T_FLOOR);
      if (face === 0) assert.ok(p.y === p.ty && f.tiles[(p.ty - 1) * f.w + p.tx] === T_WALL, `seed ${s}: ${p.name} at ${p.x},${p.y}`);
      else assert.ok(p.x === p.tx && f.tiles[p.ty * f.w + p.tx - 1] === T_WALL, `seed ${s}: ${p.name} at ${p.x},${p.y}`);
    }
    // the trap: the spilled ink, a spike floor's beat on a tile of a room, its picture named in the floor's set
    assert.equal(ACT1_SETS[15].trap?.name, LB_PIECES.ink);
    assert.ok(f.hazards && f.hazards.length >= 2, `seed ${s}: traps`);
    for (const h of f.hazards!) {
      assert.equal(h.kind, 'spikes');
      assert.equal(h.w * h.h, 1);
      assert.ok(Math.hypot(h.x + 0.5 - f.start.x, h.y + 0.5 - f.start.y) > 4);
      assert.ok(!f.packs.some((p) => Math.hypot(p.x - h.x - 0.5, p.y - h.y - 0.5) < 1.5), `seed ${s}: a trap under a pack`);
    }
    const m = (L.act1 as LibraryDress).moment;
    if (m) {
      for (const p of L.props) if (p.solid) assert.ok(Math.hypot(p.x - m.x, p.y - m.y) > 2.2, `seed ${s}: ${p.name ?? p.kind} where the chandelier may fall`);
      assert.ok(!ch.some((p) => Math.hypot(p.x - m.x, p.y - m.y) < 3), `seed ${s}: a chandelier over where one falls`);
    }
  }
  // (a hall had room for the moment on most floors)
  assert.ok(SEEDS.filter((s) => (floor15(s).act1 as LibraryDress).moment).length >= 15);
});

test('the same seed, the same floor: its tiles, zones, packs, pieces, bells and traps', () => {
  for (const s of [3, 11, 17]) {
    const a = floor15(s);
    const b = hush(() => makeDungeon(15, s));
    assert.deepEqual([...b.floor.tiles], [...a.floor.tiles]);
    assert.deepEqual([...b.land!.zones!], [...a.land!.zones!]);
    assert.deepEqual(b.floor.packs, a.floor.packs);
    assert.deepEqual(b.props.map((p) => [p.kind, p.name, p.x, p.y, p.solid, p.variant]), a.props.map((p) => [p.kind, p.name, p.x, p.y, p.solid, p.variant]));
    assert.deepEqual(b.land!.bells, a.land!.bells);
    assert.deepEqual(b.floor.hazards, a.floor.hazards);
    assert.deepEqual(b.floor.start, a.floor.start);
  }
  // (and another seed, another floor)
  assert.notDeepEqual([...floor15(1).floor.tiles], [...floor15(2).floor.tiles]);
});

test('nothing of the descent\'s pieces: every piece laid is floor 15\'s own or the Hush\'s set\'s (the art\'s names)', () => {
  const own = new Set<string>();
  for (const file of ['src/art/floor15.ts', 'src/art/act2_set.ts']) for (const m of fs.readFileSync(file, 'utf8').matchAll(/\{ name: (['"])(.+?)\1, kind:/g)) own.add(m[2]);
  assert.ok(own.size >= 48, `${own.size} names`);
  const descent = new Set<string>([...CAMP.things, ...CAMP.big, ...CAMP.lying, ...CAMP.breakables, ...Object.values(HOLD).filter((v) => typeof v === 'string') as string[], HOLD.gate(6), HOLD.gate(8)]);
  for (let n = 6; n <= 10; n++) {
    const set = ACT1_SETS[n];
    for (const k of [...set.things, ...set.big, ...set.lying, ...set.wallFoot, ...set.breakables, ...set.edge]) descent.add(k);
  }
  for (const name of Object.values(LB_PIECES)) assert.ok(own.has(name), `${name} is not the art's`);
  for (const name of ACT1_SETS[15].breakables) assert.ok(own.has(name));
  for (const s of SEEDS) {
    for (const p of floor15(s).props) {
      if (p.kind === 'chest' || p.kind === 'barrel' || p.kind === 'urn') {
        // (the game's own: its barrels and urns drawn as the floor's two breakables, never a camp's)
        if (p.kind !== 'chest') assert.ok(p.variant < 100, 'not a camp\'s');
        continue;
      }
      assert.equal(p.kind, 'piece');
      assert.ok(own.has(p.name!), `seed ${s}: ${p.name}`);
      assert.ok(!descent.has(p.name!), `seed ${s}: ${p.name} is the descent's`);
    }
  }
});
