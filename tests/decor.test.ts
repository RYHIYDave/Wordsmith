// (MOCK-UP, NOT IN THE GAME) DECORATIONS (src/game/decor.ts; their pictures src/art/decor.ts; drawn
// by src/render/render.ts).
//
// The owner, 5 Oct 2026, 12:43: "I'd like the layout as whole to be less uniform. The floors and
// walls just need more variation. And more doodads around like molted tapestries or gargoyle heads
// or missing broken floors tiles. That kind of thing. I know it's a tomb but I'd like it to look
// more alive if that makes sense"; 12:44: "And everything looks too flat".
//
// ALL OF IT IS BEHIND ONE SWITCH, `DECOR.on`, WHICH IS OFF until he has seen the pictures and said
// yes. What is held here:
//   - THE SWITCH IS OFF IN THE GAME, and with it off a dungeon is EXACTLY WHAT IT WAS: the
//     map-maker lays no decoration and the level holds none; nothing has a shadow at its foot; no
//     figure is drawn darker by a fire;
//   - laying decorations takes no dice: with the switch on a dungeon is the dungeon it was, but for
//     its decorations;
//   - WHERE THEY GO: a tapestry (two blocks wide) or a gargoyle (one) hangs on blocks of a room's
//     back walls whose faces to the room are painted and stand, with such a block either side; the
//     wall runs on unbroken for two blocks further either way (so no doorway, door or gate is near);
//     before it is level floor of the room, nothing standing right before it, no fire near it, no
//     pillar near it. A broken flagstone lies on whole level floor of its room, clear of the walls,
//     of all that stands or lies there, of where the hero comes in and the boss waits. No more than
//     two on a room's walls and two on its floor, three in all, and apart from each other;
//   - THE PICTURES: at the heroes' grain; a tapestry in strips a quarter of a tile wide, within its
//     two blocks and the solid part of the wall, with moth holes in it; a gargoyle's head out of its
//     wall at the height of a hero's head, built for each of the two walls (not one the mirror of the
//     other); a broken flagstone anchored at its stone's corner.
//   run: tsx --test tests/decor.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { GARGOYLE_KINDS, SLAB_KINDS, TAPESTRY_KINDS, TAPESTRY_WIDE, makeDecorArt } from '../src/art/decor';
import { STRIP } from '../src/art/gates';
import { VAULT, WALLS_FADING } from '../src/art/ground';
import { GRAIN } from '../src/art/kit';
import { APART, DECOR, FLOOR_MOST, ROOM_MOST, SLABS, TAPESTRY_BLOCKS, WALL_MOST, footShadow, nearSide } from '../src/game/decor';
import { doorPiers, doorTiles } from '../src/game/doors';
import { generateFloor } from '../src/game/dungeon';
import { Game } from '../src/game/game';
import { makeDungeon, makeTown } from '../src/game/level';
import { emptyControls } from '../src/game/state';
import { SOLID_PROPS, T_FLOOR, T_WALL } from '../src/game/types';
import type { DecorSpot, Floor } from '../src/game/types';
import { FACE_LEFT, FACE_RIGHT, wallFaces, wallsAway } from '../src/render/walls';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
  notDeepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

/** The decorations' switch (and `near`), set for the length of a test and put back. */
function decorSet<T>(on: boolean, run: () => T, near = false): T {
  const was = { ...DECOR };
  DECOR.on = on;
  DECOR.near = near;
  try {
    return run();
  } finally {
    Object.assign(DECOR, was);
  }
}

/** The first thing of two levels that differs, by name (null: nothing does), leaving out what is named in `but`. Asked piece by piece (a level is too big to hand to deepEqual whole). */
function differs(a: Floor, b: Floor, but: readonly string[] = []): string | null {
  const ka = Object.keys(a).filter((k) => !but.includes(k)).sort();
  const kb = Object.keys(b).filter((k) => !but.includes(k)).sort();
  if (ka.join() !== kb.join()) return `what it holds (${ka.join()} / ${kb.join()})`;
  for (const k of ka) {
    const va = (a as unknown as Record<string, unknown>)[k];
    const vb = (b as unknown as Record<string, unknown>)[k];
    if (ArrayBuffer.isView(va) && ArrayBuffer.isView(vb)) {
      const xa = va as unknown as ArrayLike<number>;
      const xb = vb as unknown as ArrayLike<number>;
      if (xa.length !== xb.length) return `${k} (its length)`;
      for (let i = 0; i < xa.length; i++) if (xa[i] !== xb[i]) return `${k}[${i}]`;
      continue;
    }
    if (JSON.stringify(va) !== JSON.stringify(vb)) return k;
  }
  return null;
}

test('the switch is off in the game, and with it off a dungeon is exactly what it was: no decoration is laid or held, nothing has a shadow at its foot, no figure is darkened by a fire', () => {
  assert.equal(DECOR.on, false, 'a mock-up: off until the owner has seen its pictures and said yes');
  assert.equal(DECOR.near, false);
  for (const [depth, seed] of [[1, 3], [2, 6], [3, 41], [7, 1234], [12, 9001]]) {
    const f = generateFloor(depth, seed);
    assert.ok(!('decor' in f), `dungeon ${depth}, seed ${seed}: the map-maker lays none`);
  }
  assert.ok(!('decor' in makeDungeon(2, 6).floor), 'nor does a level of the game hold any');
  assert.ok(!('decor' in makeTown(7).floor), 'nor the town');
  for (const kind of ['brazier', 'barrel', 'urn', 'chest', 'pillar', 'bones', 'rubble', 'portal', 'forge']) assert.equal(footShadow(kind, 0), null, `no shadow at the foot of a ${kind}`);
  assert.equal(nearSide(1.6, 1.6, [{ x: 0.5, y: 0.5 }]), 0, 'and a figure in front of a fire is drawn as it always was');
  // (a few seconds of a game in a dungeon go as they did: its level has none)
  const g = new Game('warrior', 6);
  g.depth = 2;
  g.enterDungeon();
  g.hero.invuln = 1e9;
  for (let k = 0; k < 120; k++) g.update(1 / 60, emptyControls());
  assert.ok(!('decor' in g.level.floor));
});

test('laying decorations takes no dice: with the switch on a dungeon is the dungeon it was, but for its decorations', () => {
  let laid = 0;
  let dungeons = 0;
  for (const depth of [1, 2, 3, 5, 9, 12]) {
    for (let k = 0; k < 12; k++) {
      const seed = 700 + depth * 61 + k * 37;
      const off = decorSet(false, () => generateFloor(depth, seed));
      const on = decorSet(true, () => generateFloor(depth, seed));
      assert.equal(differs(on, off, ['decor']), null, `dungeon ${depth}, seed ${seed}: everything but its decorations is as it was`);
      assert.ok(on.decor !== undefined && on.decor.length > 0, `dungeon ${depth}, seed ${seed}: decorations are laid`);
      laid += (on.decor ?? []).length;
      dungeons++;
    }
  }
  console.log(`(${dungeons} dungeons the same with decorations as without; ${laid} decorations laid in them)`);
});

/** Dungeons laid with the switch on, for the tests of where things go. */
const SAMPLES: Floor[] = [];
for (const depth of [1, 2, 3, 4, 6, 9, 12]) for (let k = 0; k < 8; k++) SAMPLES.push(decorSet(true, () => generateFloor(depth, 3100 + depth * 97 + k * 53)));

const isWall = (d: DecorSpot): boolean => d.kind === 'tapestry' || d.kind === 'gargoyle';

test('a tapestry or a gargoyle hangs on a room\'s back wall, on blocks whose faces to the room are painted and stand, never by a doorway, a door or a fire, and with nothing standing right before it', () => {
  let tapestries = 0;
  let gargoyles = 0;
  for (const f of SAMPLES) {
    const away = wallsAway(f, WALLS_FADING);
    const piers = new Set<number>();
    for (const d of f.doors ?? []) for (const i of doorPiers(f, d)) piers.add(i);
    const at = (x: number, y: number): number => y * f.w + x;
    const propAt = new Map<number, string>();
    for (const p of f.props) propAt.set(at(p.x, p.y), p.kind);
    for (const d of (f.decor ?? []).filter(isWall)) {
      const what = `dungeon ${f.depth}, seed ${f.seed}: a ${d.kind} at ${d.x},${d.y}`;
      const r = f.rooms[d.room];
      const wide = d.kind === 'tapestry' ? TAPESTRY_BLOCKS : 1;
      if (d.kind === 'tapestry') tapestries++;
      else gargoyles++;
      // (along the wall, and the floor before a block)
      const sx = d.alongX ? 1 : 0;
      const sy = d.alongX ? 0 : 1;
      const before = (k: number): [number, number] => (d.alongX ? [d.x + k, d.y + 1] : [d.x + 1, d.y + k]);
      // a back wall of its room: the row before its first row, or the column before its first column; not at its corners
      assert.ok(d.alongX ? d.y === r.y - 1 && d.x > r.x && d.x + wide < r.x + r.w : d.x === r.x - 1 && d.y > r.y && d.y + wide < r.y + r.h, `${what}: on a back wall of its room`);
      for (let k = -1; k <= wide; k++) {
        const i = at(d.x + k * sx, d.y + k * sy);
        assert.equal(f.tiles[i], T_WALL, `${what}: block ${k} is wall`);
        assert.ok(!f.cut || f.cut[i] === 0, `${what}: block ${k} is whole`);
        assert.equal(away[i], 0, `${what}: block ${k} is drawn (not left out)`);
        assert.ok(!piers.has(i), `${what}: block ${k} is not the stone beside a door`);
        assert.ok((wallFaces(f, i) & (d.alongX ? FACE_LEFT : FACE_RIGHT)) !== 0, `${what}: block ${k}'s face to the room is painted`);
        const [fx, fy] = before(k);
        const j = at(fx, fy);
        assert.ok(f.tiles[j] === T_FLOOR && (!f.cut || f.cut[j] === 0) && (!f.height || f.height[j] === 0) && (!f.stair || f.stair[j] === 0), `${what}: level floor of the room before block ${k}`);
      }
      // no opening in the wall, no door, within two blocks of it
      for (const k of [-2, wide + 1]) {
        const i = at(d.x + k * sx, d.y + k * sy);
        assert.ok(f.tiles[i] === T_WALL && !piers.has(i), `${what}: the wall runs on unbroken two blocks past it (${k})`);
      }
      // no door or gate, nor any way in or out of a room, within two tiles of the floor before it, on any side of the room
      for (let k = 0; k < wide; k++) {
        const [fx, fy] = before(k);
        for (const door of f.doors ?? []) {
          for (const i of doorTiles(f, door)) assert.ok(Math.max(Math.abs((i % f.w) - fx), Math.abs(Math.floor(i / f.w) - fy)) >= 3, `${what}: well away from a door or gate`);
        }
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const x = fx + dx;
            const y = fy + dy;
            const ring = f.rooms.some((q) => x >= q.x - 1 && x <= q.x + q.w && y >= q.y - 1 && y <= q.y + q.h && !(x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h));
            assert.ok(!(ring && f.tiles[y * f.w + x] === T_FLOOR), `${what}: no way into a room at ${x},${y}, within two tiles`);
          }
        }
      }
      // nothing standing right before it; no fire before it, beside that or a row out; no pillar near
      for (let k = 0; k < wide; k++) {
        const [fx, fy] = before(k);
        const right = propAt.get(at(fx, fy));
        assert.ok(right === undefined || !SOLID_PROPS.includes(right as never), `${what}: nothing stands right before it (a ${right})`);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) assert.ok(propAt.get(at(fx + dx, fy + dy)) !== 'brazier', `${what}: no fire near it`);
        for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) assert.ok(propAt.get(at(fx + dx, fy + dy)) !== 'pillar', `${what}: no pillar near it`);
      }
    }
  }
  console.log(`(${tapestries} tapestries and ${gargoyles} gargoyles hung in ${SAMPLES.length} dungeons)`);
  assert.ok(tapestries > SAMPLES.length && gargoyles > SAMPLES.length, 'both are hung, more than one of each to a dungeon');
});

test('a broken flagstone lies on whole level floor of its room, clear of the walls and of all that stands or lies there, and away from where the hero comes in and the boss waits', () => {
  let cracks = 0;
  let holes = 0;
  for (const f of SAMPLES) {
    const level = (x: number, y: number): boolean => {
      const i = y * f.w + x;
      return f.tiles[i] === T_FLOOR && (!f.cut || f.cut[i] === 0) && (!f.height || f.height[i] === 0) && (!f.stair || f.stair[i] === 0);
    };
    const taken = new Set(f.props.map((p) => p.y * f.w + p.x));
    for (const d of (f.decor ?? []).filter((q) => !isWall(q))) {
      const what = `dungeon ${f.depth}, seed ${f.seed}: a ${d.kind} at ${d.x},${d.y}`;
      if (d.kind === 'crack') cracks++;
      else holes++;
      const r = f.rooms[d.room];
      const x0 = Math.floor(d.x / SLABS);
      const x1 = Math.floor((d.x + 1) / SLABS - 1e-9);
      const y0 = Math.floor(d.y / SLABS);
      const y1 = Math.floor((d.y + 1) / SLABS - 1e-9);
      for (let ty = y0; ty <= y1; ty++) {
        for (let tx = x0; tx <= x1; tx++) {
          assert.ok(tx >= r.x && ty >= r.y && tx < r.x + r.w && ty < r.y + r.h, `${what}: in its room`);
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              assert.ok(level(tx + dx, ty + dy), `${what}: level floor all round`);
              assert.ok(!taken.has((ty + dy) * f.w + tx + dx), `${what}: nothing stands or lies within a tile of it`);
            }
          }
          for (const p of [f.start, f.boss]) assert.ok(Math.max(Math.abs(tx - Math.floor(p.x)), Math.abs(ty - Math.floor(p.y))) >= 3, `${what}: away from where the hero comes in and the boss waits`);
        }
      }
    }
  }
  console.log(`(${cracks} cracked flagstones and ${holes} gone)`);
  assert.ok(cracks > SAMPLES.length / 2 && holes > SAMPLES.length / 2, 'both kinds are laid');
});

test('a couple to a room at most: two on its walls, two on its floor, three in all, apart from each other; and most rooms have something', () => {
  let rooms = 0;
  let decorated = 0;
  for (const f of SAMPLES) {
    for (const r of f.rooms) {
      rooms++;
      const mine = (f.decor ?? []).filter((d) => d.room === r.id);
      if (mine.length > 0) decorated++;
      const walls = mine.filter(isWall);
      const floors = mine.filter((d) => !isWall(d));
      const what = `dungeon ${f.depth}, seed ${f.seed}, room ${r.id}`;
      assert.ok(walls.length <= WALL_MOST && floors.length <= FLOOR_MOST && mine.length <= ROOM_MOST, `${what}: ${walls.length} on the walls and ${floors.length} on the floor`);
      assert.ok(walls.filter((d) => d.kind === 'tapestry').length <= 1 && walls.filter((d) => d.kind === 'gargoyle').length <= 1, `${what}: one of each kind on the walls at the most`);
      // (the middles of wall pieces, along their walls; of flagstones, in tiles)
      const middle = (d: DecorSpot): [number, number] => {
        if (!isWall(d)) return [(d.x + 0.5) / SLABS, (d.y + 0.5) / SLABS];
        const w = d.kind === 'tapestry' ? TAPESTRY_BLOCKS : 1;
        return d.alongX ? [d.x + w / 2, d.y + 1] : [d.x + 1, d.y + w / 2];
      };
      for (const group of [walls, floors]) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const [ax, ay] = middle(group[i]);
            const [bx, by] = middle(group[j]);
            assert.ok(Math.hypot(ax - bx, ay - by) >= APART - 1e-9, `${what}: its pieces are apart`);
          }
        }
      }
    }
  }
  console.log(`(${decorated} of ${rooms} rooms have a decoration)`);
  assert.ok(decorated > rooms * 0.6 && decorated < rooms, 'most rooms have something, and some have nothing');
});

test('with the switch on: a shadow at the foot of every standing thing, none under what lies flat or is broken; and a figure in front of a fire is darkened only with `near` as well, the more the nearer it is in front of it', () => {
  decorSet(true, () => {
    for (const kind of ['brazier', 'barrel', 'urn', 'chest', 'pillar']) {
      const s = footShadow(kind, 0);
      assert.ok(s !== null && s.r > 0.3 && s.r < 0.7 && s.a > 0.4 && s.a <= 0.8, `a soft shadow at the foot of a ${kind}`);
    }
    assert.equal(footShadow('barrel', 1), null, 'a broken barrel lies on the floor');
    assert.equal(footShadow('urn', 1), null);
    assert.equal(footShadow('bones', 0), null);
    assert.equal(footShadow('rubble', 0), null);
    assert.equal(nearSide(1.6, 1.6, [{ x: 0.5, y: 0.5 }]), 0, 'not without `near`');
  });
  decorSet(true, () => {
    const fire = [{ x: 0.5, y: 0.5 }];
    const inFront = nearSide(1.1, 1.1, fire);
    assert.ok(inFront > 0.9, `just in front of it, in line: ${inFront}`);
    assert.ok(nearSide(1.9, 1.9, fire) < inFront && nearSide(1.9, 1.9, fire) > 0, 'further in front, less');
    assert.equal(nearSide(0.2, 0.2, fire), 0, 'behind it (further from the eye): nothing');
    assert.equal(nearSide(1.6, -0.4, fire), 0, 'well to the side: nothing');
    assert.equal(nearSide(3.5, 3.5, fire), 0, 'far in front: nothing');
  }, true);
});

paintWithoutCanvas();

test('the pictures: at the heroes\' grain; a tapestry in strips over its two blocks, within the solid part of the wall, torn and burnt; a gargoyle out of its wall high up and small (his word of 8 Oct), built for each wall; a broken flagstone at its stone\'s corner', () => {
  const A = makeDecorArt(VAULT);
  assert.equal(TAPESTRY_WIDE, TAPESTRY_BLOCKS * 32, 'a tapestry is as wide as the blocks the map-maker hangs it over');
  for (let v = 0; v < TAPESTRY_KINDS; v++) {
    for (const alongX of [true, false]) {
      const strips = A.tapestry(alongX, v);
      assert.ok(strips.length >= 6, 'cut into strips');
      let holes = 0;
      let cloth = 0;
      for (const q of strips) {
        const p = paintingOf(q.s);
        assert.equal(q.s.density, GRAIN, 'at the heroes\' grain');
        assert.equal(p.w, STRIP, 'a quarter of a tile wide');
        assert.ok(q.t >= 0 && q.t * 32 + STRIP <= TAPESTRY_WIDE, 'within its two blocks');
        // (rows up from the floor: the strip's anchor row is its foot; the solid part of a wall is 56 picture pixels: 28 game pixels)
        const ay = q.s.ay * GRAIN;
        for (let y = 0; y < p.h; y++) {
          for (let x = 0; x < p.w; x++) {
            const a = p.d[(y * p.w + x) * 4 + 3];
            if (a === 0) continue;
            assert.ok(ay - y < 60, 'no higher than the solid part of the wall, and a knob');
            if (a === 255) cloth++;
            else holes++;
          }
        }
      }
      assert.ok(cloth > 1200, `cloth enough (${cloth} picture pixels)`);
      if (alongX) assert.ok(holes > 30, 'and on the lit wall, the wall in its shadow showing through the holes and under the hem');
    }
  }
  for (let v = 0; v < GARGOYLE_KINDS; v++) {
    const x = paintingOf(A.gargoyle(true, v));
    const y = paintingOf(A.gargoyle(false, v));
    for (const alongX of [true, false]) {
      const s = A.gargoyle(alongX, v);
      const p = paintingOf(s);
      assert.equal(s.density, GRAIN);
      // (the head itself, what is solid of the picture: its top no higher than the wall's solid part and a horn's tip, its jaw well above the floor; the shadow it throws on the wall is laid under it, see-through)
      let top = Infinity;
      let low = -Infinity;
      for (let yy = 0; yy < p.h; yy++) for (let xx = 0; xx < p.w; xx++) if (p.d[(yy * p.w + xx) * 4 + 3] === 255) {
        top = Math.min(top, yy);
        low = Math.max(low, yy);
      }
      const ay = s.ay * GRAIN;
      assert.ok(ay - top <= 62 && ay - low >= 28, `out of the wall high up, in the top half of its solid part ("too low on the wall", 8 Oct): from ${ay - low} to ${ay - top} picture pixels over the floor`);
      assert.ok(low - top > 20 && low - top < 32 && p.w >= 20, `big enough to read, and smaller than first shown ("too big", 8 Oct): ${low - top} tall`);
    }
    // (one is not the other turned over: each is built for its own wall, so the light stays on the upper left)
    const flipped = y.flipX();
    assert.ok(x.w !== flipped.w || x.h !== flipped.h || x.d.some((c, i) => c !== flipped.d[i]), 'not a mirror of the other');
  }
  for (const kind of ['crack', 'hole'] as const) {
    for (let v = 0; v < SLAB_KINDS; v++) {
      const s = A.slab(kind, v);
      assert.equal(s.density, GRAIN);
      // (anchored at the top corner of its stone: the stone lies under and to either side of it)
      assert.ok(s.ax * GRAIN >= 40 && (s.w - s.ax) * GRAIN >= 40 && (s.h - s.ay) * GRAIN >= 30, 'room for its stone and the stones beside it');
    }
  }
  assert.ok(A.tapestry(true, 0) === A.tapestry(true, 0) && A.gargoyle(false, 1) === A.gargoyle(false, 1), 'painted once and kept');
});
