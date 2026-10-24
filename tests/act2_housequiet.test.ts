// ACT 2, THE HUSH: FLOOR 14, THE HOUSE OF QUIET, as its own map-maker and dresser lay it (game/act2/housequiet.ts; behind
// ACT2, game/act1.ts, switched on here for each test and off again after). His doc's floor: "The city infirmary, where the
// Hushed are taken to be cured."; "indoors: wards of iron beds, apothecary rooms, and a surgical theatre with a gallery. Rooms
// and halls, like the Prison."; "spilled tonics that leave clouds of the Hush on the floor". Over twenty seeds: everything
// that matters reached from where he comes in, on the walk grid as it is once the floor is dressed (each bell, the Muffled
// Bell, the boss, the way on); the Bells' contract (docs/act2_build.md) kept; rooms of every kind of floor; the theatre big
// enough for the Physician's moves; the same seed the same floor; nothing of the descent's pieces.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT2 } from '../src/game/act1';
import { BUILT, HOUSE_ZONE, HQ_BELLS, houseBeds, walkReach } from '../src/game/act2/housequiet';
import type { HouseDress } from '../src/game/act2/housequiet';
import { makeDungeon } from '../src/game/level';
import type { Level } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';
import { HQ_ZONE } from '../src/art/housequiet';
// @ts-ignore
import * as fs from 'node:fs';
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
assert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;

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

const floors = new Map<number, Level>();
/** Floor 14 of seed `s`, laid once for all the tests (with the switch on). */
function floorOf(s: number): Level {
  let L = floors.get(s);
  if (!L) {
    L = hush(() => makeDungeon(14, s));
    floors.set(s, L);
  }
  return L;
}
const tileOf = (L: Level, p: { x: number; y: number }): number => Math.floor(p.y) * L.floor.w + Math.floor(p.x);
const reached = (L: Level): Uint8Array => walkReach(L.walk, L.floor.w, L.floor.h, tileOf(L, L.floor.start));
/** The room a world point is in, or undefined. */
const roomAt = (L: Level, x: number, y: number) => L.floor.rooms.find((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
const zoneAt = (L: Level, x: number, y: number): number => L.land!.zones![Math.floor(y) * L.floor.w + Math.floor(x)];
const theatreOf = (L: Level) => L.floor.rooms.find((r) => r.kind === 'boss')!;
const inRect = (r: { x: number; y: number; w: number; h: number }, x: number, y: number): boolean => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;

test('the switch is off; with it on floor 14 is laid by its own map-maker: indoors, every walkable tile said, no stronghold', () => {
  assert.equal(ACT2.on, false);
  assert.equal(BUILT, true);
  assert.equal(makeDungeon(14, 1).land, undefined, 'with the switch off, floor 14 is the Prison\'s');
  // (the zones' numbers the art's own: no file of the game imports the art)
  assert.deepEqual({ ...HOUSE_ZONE }, { ...HQ_ZONE });
  for (const s of SEEDS) {
    const L = floorOf(s);
    const land = L.land!;
    assert.equal(land.kind, 'housequiet');
    assert.equal(land.holds.length, 0);
    assert.ok(land.zones, 'its zones');
    const f = L.floor;
    for (let i = 0; i < f.w * f.h; i++) {
      if (f.tiles[i] !== T_FLOOR) continue;
      assert.ok(land.zones![i] <= HOUSE_ZONE.Chapel, `seed ${s}: tile ${i} said`);
      assert.equal(f.cut![i], 0, 'edges straight: no half tiles');
    }
    assert.ok(L.act1 && L.act1.floor === 14, 'dressed as floor 14');
  }
});

// (EXITS: a way on that stands in a back wall, the art chat's (game/ways.ts ONWARD place 'wall'), is its doorway, shut until it
// opens: what is reached is the floor before it, a tile back from the wall into the room)
function wayInTile(L: Level): number {
  const f = L.floor;
  const a1 = L.ways?.a1;
  const tile = Math.floor(L.land!.exit.y) * f.w + Math.floor(L.land!.exit.x);
  if (!a1) return tile;
  const u = ({ 'x+': [1, 0], 'x-': [-1, 0], 'y+': [0, 1], 'y-': [0, -1] } as Record<string, number[]>)[a1.way.dir];
  return L.walk[tile] === 1 ? tile : (a1.way.ref.y - u[1]) * f.w + a1.way.ref.x - u[0];
}

test('everything that matters is reached from where he comes in, on the walk grid as dressed: each bell, the Muffled Bell, the boss, the way on, every room; nothing walled off', () => {
  for (const s of SEEDS) {
    const L = floorOf(s);
    const f = L.floor;
    const W = f.w;
    const seen = reached(L);
    const b = L.land!.bells!;
    for (const q of b.bells) assert.equal(seen[tileOf(L, q)], 1, `seed ${s}: a call bell at ${q.x},${q.y} reached`);
    // (the Muffled Bell stands solid on its tile: every floor tile round it reached)
    const m = tileOf(L, b.muffled);
    for (const d of [-W - 1, -W, -W + 1, -1, 1, W - 1, W, W + 1]) if (f.tiles[m + d] === T_FLOOR) assert.equal(seen[m + d], 1, `seed ${s}: round the Muffled Bell`);
    assert.equal(seen[tileOf(L, f.boss)], 1, `seed ${s}: the boss`);
    assert.equal(seen[wayInTile(L)], 1, `seed ${s}: the way on`);
    if (L.ways?.way) assert.equal(seen[tileOf(L, L.ways.way)], 1, `seed ${s}: the waypoint`);
    for (const p of f.packs) assert.equal(seen[tileOf(L, p)], 1, `seed ${s}: a pack at ${p.x},${p.y}`);
    for (const r of f.rooms) {
      let any = false;
      for (let ty = r.y; ty < r.y + r.h && !any; ty++) for (let tx = r.x; tx < r.x + r.w && !any; tx++) any = seen[ty * W + tx] === 1;
      assert.ok(any, `seed ${s}: room ${r.id} reached`);
    }
    for (let i = 0; i < W * f.h; i++) if (L.walk[i] === 1) assert.equal(seen[i], 1, `seed ${s}: walkable tile ${i % W},${Math.floor(i / W)} walled off`);
  }
});

test('THE BELLS\' CONTRACT: the chapel bell off the main way, six call bells in the wards spread about, the Hush\'s circle round it', () => {
  for (const s of SEEDS) {
    const L = floorOf(s);
    const f = L.floor;
    const W = f.w;
    const b = L.land!.bells!;
    const T = theatreOf(L);
    const d = (a: { x: number; y: number }, c: { x: number; y: number }): number => Math.hypot(a.x - c.x, a.y - c.y);
    // THE MUFFLED BELL: on whole floor, in the chapel, off the main way, 12 tiles and more from the start, not in the boss's ground
    const m = b.muffled;
    assert.equal(m.x % 1, 0.5, 'a tile\'s middle');
    assert.equal(m.y % 1, 0.5);
    assert.equal(f.tiles[tileOf(L, m)], T_FLOOR);
    assert.equal(zoneAt(L, m.x, m.y), HOUSE_ZONE.Chapel, `seed ${s}: in the chapel`);
    assert.equal(roomAt(L, m.x, m.y)!.path, -1, 'off the main way');
    assert.ok(d(m, f.start) >= 12, `seed ${s}: 12 from the start`);
    assert.ok(!inRect(T, m.x, m.y), 'not in the boss\'s ground');
    const mp = L.props.filter((p) => p.name === HQ_BELLS.muffled);
    assert.equal(mp.length, 1);
    assert.deepEqual([mp[0].kind, mp[0].solid, mp[0].state, mp[0].variant, mp[0].tx, mp[0].ty], ['piece', true, 0, 0, Math.floor(m.x), Math.floor(m.y)]);
    // THE BELLS: six (the contract's "14 six"), each on whole floor in a ward, by a bed, no two within 8, none within 10 of the start
    assert.equal(b.bells.length, 6, `seed ${s}: six bells`);
    const beds = houseBeds(L);
    for (const q of b.bells) {
      assert.equal(q.x % 1, 0.5);
      assert.equal(q.y % 1, 0.5);
      assert.equal(f.tiles[tileOf(L, q)], T_FLOOR);
      assert.equal(zoneAt(L, q.x, q.y), HOUSE_ZONE.Ward, `seed ${s}: in a ward`);
      assert.ok(d(q, f.start) >= 10, 'not within 10 of the start');
      assert.ok(!inRect(T, q.x, q.y), 'not in the boss\'s ground');
      for (const o of b.bells) if (o !== q) assert.ok(d(o, q) >= 8, `seed ${s}: two bells within 8 tiles`);
      assert.ok(beds.some((bd) => d(bd.prop, q) <= 2.6), `seed ${s}: the bell at ${q.x},${q.y} by a bed`);
      // its piece: on the wall's foot behind its tile (render/act1_pieces.ts draws it on that face), at state 0
      const p = L.props.filter((pp) => pp.name === HQ_BELLS.small && pp.tx === Math.floor(q.x) && pp.ty === Math.floor(q.y));
      assert.equal(p.length, 1, `seed ${s}: its piece`);
      assert.equal(p[0].kind, 'piece');
      assert.equal(p[0].state, 0);
      const face = p[0].variant & 1;
      assert.equal(p[0].variant >> 1, 0);
      const back = face === 0 ? tileOf(L, q) - W : tileOf(L, q) - 1;
      assert.notEqual(f.tiles[back], T_FLOOR, 'a wall behind it');
      assert.deepEqual([p[0].x, p[0].y], face === 0 ? [q.x, Math.floor(q.y)] : [Math.floor(q.x), q.y], 'its point on the wall\'s foot');
    }
    assert.equal(L.props.filter((p) => p.name === HQ_BELLS.small).length, 6);
    // THE EIGHT TILES ROUND EACH: what is floor of them walkable, nothing solid on them
    for (const q of [m, ...b.bells]) {
      const i = tileOf(L, q);
      for (const dd of [-W - 1, -W, -W + 1, -1, 1, W - 1, W, W + 1]) {
        if (f.tiles[i + dd] !== T_FLOOR) continue;
        assert.equal(L.walk[i + dd], 1, `seed ${s}: by a bell, walkable`);
        assert.ok(!L.props.some((p) => p.solid && p.ty * W + p.tx === i + dd), `seed ${s}: nothing solid by a bell`);
      }
    }
    // THE HUSH: round the Muffled Bell, every bell inside it with 4 tiles to spare; 12 clear of the start; not reaching the theatre
    const h = b.hush;
    assert.ok(d(h, m) < 1, 'round the Muffled Bell');
    for (const q of b.bells) assert.ok(d(q, h) <= h.r - 4, `seed ${s}: a bell inside the Hush with 4 to spare`);
    assert.ok(d(f.start, h) - h.r >= 12, `seed ${s}: 12 clear of the start`);
    for (let ty = T.y; ty < T.y + T.h; ty++) for (let tx = T.x; tx < T.x + T.w; tx++) assert.ok(Math.hypot(tx + 0.5 - h.x, ty + 0.5 - h.y) > h.r, `seed ${s}: the Hush reaches the theatre`);
  }
});

test('rooms and halls, like the Prison: wards of iron beds, halls, an apothecary, the chapel, the theatre; long, as the descent\'s', () => {
  for (const s of SEEDS) {
    const L = floorOf(s);
    const f = L.floor;
    const zones = new Set(f.rooms.map((r) => zoneAt(L, r.x + r.w / 2, r.y + r.h / 2)));
    for (const z of Object.values(HOUSE_ZONE)) assert.ok(zones.has(z), `seed ${s}: a room of zone ${z}`);
    assert.equal(f.rooms.filter((r) => zoneAt(L, r.x + r.w / 2, r.y + r.h / 2) === HOUSE_ZONE.Chapel).length, 1, 'one chapel');
    assert.equal(f.rooms.filter((r) => r.kind === 'boss').length, 1);
    assert.equal(f.rooms.filter((r) => r.kind === 'guardian').length, 1, 'a lair');
    assert.ok(f.rooms.filter((r) => r.kind === 'treasure').length >= 1, 'a store, its chests');
    assert.ok(L.props.filter((p) => p.kind === 'chest').length >= 2);
    // (many beds: every ward but the lair a row of them at least)
    const beds = houseBeds(L);
    const wards = f.rooms.filter((r) => r.kind !== 'guardian' && zoneAt(L, r.x + r.w / 2, r.y + r.h / 2) === HOUSE_ZONE.Ward);
    assert.ok(wards.length >= 6, `seed ${s}: wards`);
    assert.ok(beds.length >= 40, `seed ${s}: ${beds.length} beds`);
    for (const bd of beds) {
      // (each its head against a far wall: the wall behind the head tile)
      const [head, foot] = bd.tiles;
      assert.notEqual(f.tiles[bd.along === 'y' ? head - f.w : head - 1], T_FLOOR, 'its head to the wall');
      assert.equal(L.walk[head], 0);
      assert.equal(L.walk[foot], 0);
    }
    // (packs of the floor in the wards among the beds)
    const wardIds = new Set(wards.map((r) => r.id));
    assert.ok(f.packs.filter((p) => wardIds.has(p.roomId)).length >= 4, `seed ${s}: packs in the wards`);
    // (the walk from where he comes in to the theatre as long as the descent's floors are, a hundred and fifty tiles and more)
    const W = f.w;
    const dist = new Int32Array(W * f.h).fill(-1);
    const q = [tileOf(L, f.start)];
    dist[q[0]] = 0;
    for (let k = 0; k < q.length; k++) {
      const i = q[k];
      for (const n of [i + 1, i - 1, i + W, i - W]) if (L.walk[n] === 1 && dist[n] < 0) (dist[n] = dist[i] + 1), q.push(n);
    }
    assert.ok(dist[tileOf(L, f.boss)] >= 150, `seed ${s}: the walk to the boss ${dist[tileOf(L, f.boss)]}`);
    assert.ok(Math.max(f.w, f.h) >= 160, `seed ${s}: ${f.w} by ${f.h}`);
  }
});

test('THE THEATRE: big enough for his moves, the operating table in its middle under its lamp, the gallery round its far corner, beds about its edge, the ledger', () => {
  for (const s of SEEDS) {
    const L = floorOf(s);
    const f = L.floor;
    const T = theatreOf(L);
    assert.equal(zoneAt(L, T.x + T.w / 2, T.y + T.h / 2), HOUSE_ZONE.Theatre);
    assert.ok(T.w >= 19 && T.h >= 19, `seed ${s}: ${T.w} by ${T.h}`);
    assert.equal(T.path, Math.max(...f.rooms.map((r) => r.path)) - 1, 'at the far end of the main way, the way on beyond it');
    const table = L.props.filter((p) => p.name === 'the operating table');
    assert.equal(table.length, 1);
    const t = table[0];
    assert.ok(Math.abs(t.x - (T.x + T.w / 2)) <= 1 && Math.abs(t.y - (T.y + T.h / 2)) <= 1, 'in its middle');
    // (room round it: of the floor within five tiles of the table, nearly all walkable)
    let n = 0;
    let open = 0;
    for (let ty = Math.floor(t.y - 5); ty <= t.y + 5; ty++) for (let tx = Math.floor(t.x - 5); tx <= t.x + 5; tx++) {
      if (Math.hypot(tx + 0.5 - t.x, ty + 0.5 - t.y) > 5 || Math.abs(tx + 0.5 - t.x) < 1 && Math.floor(ty) === Math.floor(t.y)) continue;
      n++;
      if (L.walk[ty * f.w + tx] === 1) open++;
    }
    assert.ok(open / n >= 0.9, `seed ${s}: the floor round the table ${open} of ${n}`);
    const gallery = L.props.filter((p) => p.name === "the theatre's gallery");
    assert.equal(gallery.length, 1);
    assert.deepEqual([gallery[0].tx, gallery[0].ty], [T.x + 1, T.y + 1], 'in its far corner');
    assert.equal(L.props.filter((p) => p.name === "the Physician's ledger" && inRect(T, p.tx, p.ty)).length, 1, 'the ledger in the theatre');
    assert.ok(houseBeds(L).filter((b) => b.room === T.id).length >= 2, `seed ${s}: beds about its edge`);
    // (the boss waits in it, his ground its area; the way on beyond it)
    assert.ok(inRect(T, f.boss.x, f.boss.y));
    const area = L.land!.areas.find((a) => a.role === 'boss')!;
    assert.equal(area.room, T.id);
    assert.ok(!inRect(T, L.land!.exit.x, L.land!.exit.y));
    assert.equal(L.land!.areas.find((a) => a.role === 'start')!.room, f.rooms.find((r) => r.kind === 'start')!.id);
  }
});

test('the spilled tonic laid as the descent\'s traps (the spike floor\'s beat); the falling screen\'s place in a ward kept clear', () => {
  for (const s of SEEDS) {
    const L = floorOf(s);
    const f = L.floor;
    const T = theatreOf(L);
    const hz = f.hazards ?? [];
    assert.ok(hz.length >= 3, `seed ${s}: ${hz.length} spilled tonics`);
    assert.equal(L.hazards.length, hz.length);
    for (const z of hz) {
      assert.equal(z.kind, 'spikes');
      assert.deepEqual([z.w, z.h], [1, 1]);
      assert.equal(L.walk[z.y * f.w + z.x], 1, 'walked over');
      assert.ok(Math.hypot(z.x + 0.5 - f.start.x, z.y + 0.5 - f.start.y) >= 12, 'not where he comes in');
      assert.ok(!inRect(T, z.x, z.y), 'none in the theatre');
    }
    const m = (L.act1 as HouseDress).moment;
    assert.ok(m, `seed ${s}: the screen's place`);
    assert.equal(zoneAt(L, m!.x - 0.5, m!.y), HOUSE_ZONE.Ward);
    for (let ty = Math.floor(m!.y); ty <= Math.floor(m!.y) + 2; ty++) for (const tx of [m!.x - 1, m!.x]) {
      assert.equal(L.walk[ty * f.w + tx], 1, `seed ${s}: where it stands and falls, clear`);
      assert.ok(!hz.some((z) => z.x === tx && z.y === ty));
    }
  }
});

test('the same seed lays the same floor; another seed another', () => {
  for (const s of [2, 9]) {
    const a = floorOf(s);
    const b = hush(() => makeDungeon(14, s));
    assert.deepEqual(Array.from(b.floor.tiles), Array.from(a.floor.tiles));
    assert.deepEqual(Array.from(b.land!.zones!), Array.from(a.land!.zones!));
    assert.deepEqual(b.floor.packs, a.floor.packs);
    assert.deepEqual(b.land!.bells, a.land!.bells);
    assert.deepEqual(b.props.map((p) => [p.kind, p.name, p.tx, p.ty, p.x, p.y, p.variant, p.solid]), a.props.map((p) => [p.kind, p.name, p.tx, p.ty, p.x, p.y, p.variant, p.solid]));
    assert.deepEqual(b.floor.hazards, a.floor.hazards);
  }
  assert.notDeepEqual(Array.from(floorOf(3).floor.tiles), Array.from(floorOf(4).floor.tiles));
});

test('nothing of the descent\'s pieces: every piece laid is floor 14\'s own or the Hush\'s (the art chat\'s), every breakable the floor\'s own', () => {
  // (the art's two lists of 25 by their names, read from their files: painting them wants a canvas)
  const ours = new Set<string>();
  for (const file of ['src/art/floor14.ts', 'src/art/act2_set.ts']) for (const m of fs.readFileSync(file, 'utf8').matchAll(/\{ name: (['"])(.+?)\1, kind: '/g)) ours.add(m[2]);
  assert.equal(ours.size, 50, 'the 25 and the 25');
  for (const s of SEEDS) {
    const L = floorOf(s);
    for (const p of L.props) {
      if (p.kind === 'piece') assert.ok(ours.has(p.name!), `seed ${s}: ${p.name}`);
      else assert.ok(['chest', 'barrel', 'urn'].includes(p.kind), `seed ${s}: ${p.kind}`);
      // (a barrel and an urn the floor's own two breakables: not the descent's camp's, variant 100 and on)
      if (p.kind === 'barrel' || p.kind === 'urn') assert.ok(p.variant < 100);
    }
    for (const t of L.act1!.tiles) assert.ok(ours.has(t.name), t.name);
  }
});
