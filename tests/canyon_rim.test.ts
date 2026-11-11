// THE CANYON REPAINTED AGAINST THE 3D MODEL (src/art/canyon.ts CANYON_RIM, a mock-up behind a switch that is off;
// docs/mockups/canyon_repaint/README.md), held to his rules before he sees it:
//   - off, the canyon is as the game has it (nothing of the look changes);
//   - on, nothing painted stands over the walkable floor (his rule): every pixel shows the kind of ground it did;
//   - the top of a near cliff, cut away, has its pale caprock rim along the floor's edge;
//   - the light the walls are painted by comes across the screen from the left: the walls whose faces are in shade throw their
//     shadow across the screen to the right over the bed, a wall painted lit throws none before it (his words, 11 Nov 2026: “As
//     long as the light source is consistent”), and the bed out in the open is as it was; the near cliff's shadow (his yes of
//     8 Nov 2026) is kept;
//   - a shadow's edge is the wall's own line (his words, 11 Nov 2026, to the first pictures: “The shadow is spikey when the wall
//     is not”): the near cliff's shadow reaches as far up from the cliff's edge in every column, no teeth.
//   run: tsx --test tests/canyon_rim.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { CANYON_LOOK, CANYON_RIM, C_CAP } from '../src/art/canyon';
import { TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import type { TerrainPiece } from '../src/art/terrain';
import { F8F9_FIX } from '../src/game/f8f9';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };

/** A stretch of riverbed 20 tiles by 12, rock all round it: walls on its far sides, near cliffs on its near ones. */
function bed(): Floor {
  const w = 40;
  const h = 40;
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  for (let y = 14; y < 26; y++) for (let x = 10; x < 30; x++) tiles[y * w + x] = T_FLOOR;
  return { depth: 8, seed: 8, w, h, tiles, cut: new Uint8Array(w * h), variant: new Uint8Array(w * h), rooms: [], start: { x: 20, y: 20 } } as unknown as Floor;
}

// (as the game has floor 8: floors 8 and 9's mends on)
F8F9_FIX.on = true;
const FLOOR = bed();
const X0 = Math.floor(pictureOf(0, FLOOR.h)[0]);
const Y0 = -200;
const WW = Math.ceil(pictureOf(FLOOR.w, 0)[0]) - X0;
const HH = Math.ceil(pictureOf(FLOOR.w, FLOOR.h)[1]) + 200;
const paint = (on: boolean): TerrainPiece => {
  CANYON_RIM.on = on;
  const piece = paintTerrain(terrainOf(FLOOR, CANYON_LOOK), X0, Y0, WW, HH);
  CANYON_RIM.on = false;
  return piece;
};
const OFF = paint(false);
const ON = paint(true);
const at = (p: TerrainPiece, px: number, py: number): [number, number, number] => {
  const o = ((py - Y0) * WW + (px - X0)) * 4;
  return [p.rgba[o], p.rgba[o + 1], p.rgba[o + 2]];
};
const kindAt = (p: TerrainPiece, px: number, py: number): number => p.kind[(py - Y0) * WW + (px - X0)];
const pixelOf = (x: number, y: number): [number, number] => {
  const [px, py] = pictureOf(x, y);
  return [Math.round(px), Math.round(py)];
};
const isCap = (c: [number, number, number]): boolean => C_CAP.some((k) => k[0] === c[0] && k[1] === c[1] && k[2] === c[2]);

test('the switch is off, and off the canyon\'s look is the game\'s: no rim where a near cliff is cut, no model\'s shade, his near shadow', () => {
  assert.equal(CANYON_RIM.on, false);
  assert.equal(CANYON_LOOK.cutRim, undefined);
  assert.equal(CANYON_LOOK.shade, undefined);
  assert.deepEqual(CANYON_LOOK.nearShadow, { reach: 2.1, dark: [0.5, 0.3] });
});

test('on, nothing painted stands over the walkable floor: every pixel shows the kind of ground it did', () => {
  let floors = 0;
  for (let i = 0; i < OFF.kind.length; i++) {
    if (OFF.kind[i] === TK.Floor) floors++;
    assert.equal(ON.kind[i], OFF.kind[i], `pixel ${i}`);
  }
  assert.ok(floors > 20000, `there is floor to see: ${floors}`);
});

test('on, the top of a near cliff has its pale caprock rim along the floor\'s edge (off, it has none there)', () => {
  let edges = 0;
  let rimOn = 0;
  let rimOff = 0;
  for (let px = X0; px < X0 + WW; px++) {
    for (let py = Y0; py < Y0 + HH - 1; py++) {
      const below = kindAt(OFF, px, py + 1);
      if (kindAt(OFF, px, py) !== TK.Floor || (below !== TK.Top && below !== TK.Cut)) continue;
      edges++;
      if (isCap(at(ON, px, py + 1))) rimOn++;
      if (isCap(at(OFF, px, py + 1))) rimOff++;
    }
  }
  assert.ok(edges > 800, `near edges to see: ${edges}`);
  assert.ok(rimOn >= 0.98 * edges, `the rim along the near edge: ${rimOn} of ${edges}`);
  assert.ok(rimOff <= 0.1 * edges, `no rim there as the game has it: ${rimOff} of ${edges}`);
});

test('on, a wall whose face is in shade throws its shadow across the screen to the right, three tenths darker; the open bed is as it was', () => {
  // a tile out from the wall along x = 10 (its face looks to the lower right: in shade), in the bed's middle from far to near
  for (const y of [17.5, 19.5, 21.5]) {
    const [px, py] = pixelOf(11, y);
    assert.equal(kindAt(ON, px, py), TK.Floor);
    const a = at(OFF, px, py);
    const b = at(ON, px, py);
    for (let c = 0; c < 3; c++) assert.ok(Math.abs(b[c] - a[c] * 0.7) <= 1.5, `in the wall's shadow at 11,${y}: ${a} to ${b}`);
  }
  // well out from every wall, and from the near cliffs: nothing changed
  for (const [x, y] of [[18, 17], [20, 18], [22, 17], [24, 16]] as const) {
    const [px, py] = pixelOf(x, y);
    assert.deepEqual(at(ON, px, py), at(OFF, px, py), `the open bed at ${x},${y}`);
  }
  // the wall along y = 14 (its face looks to the lower left: lit) throws none: a tile out from it, away from the shaded wall
  for (const x of [20.5, 24.5]) {
    const [px, py] = pixelOf(x, 15.2);
    assert.deepEqual(at(ON, px, py), at(OFF, px, py), `at the lit wall's foot, ${x},15.2`);
  }
});

test('on, the near cliff\'s shadow across the bed is kept as deep and as dark as he said yes to it', () => {
  CANYON_RIM.on = true;
  assert.deepEqual(CANYON_LOOK.nearShadow, { reach: 2.1, dark: [0.5, 0.3], even: true });
  CANYON_RIM.on = false;
  // half a tile in from the near cliff along x = 30: as dark on as off
  const [px, py] = pixelOf(29.3, 18);
  assert.equal(kindAt(ON, px, py), TK.Floor);
  assert.deepEqual(at(ON, px, py), at(OFF, px, py));
});

test('on, the near cliff\'s shadow has no teeth: it reaches as far up from the cliff\'s edge in every column (off, it wanders)', () => {
  // the same ground with no near shadow at all, to tell where the shadow lies
  CANYON_RIM.near = false;
  const BARE = paint(true);
  CANYON_RIM.near = true;
  const reachOf = (p: TerrainPiece, px: number): number => {
    // the near edge down this column (floor over the cut top), and how far up from it the bed is darker than bare
    let edge = -1;
    for (let py = Y0 + HH - 2; py > Y0; py--) {
      const below = kindAt(p, px, py + 1);
      if (kindAt(p, px, py) === TK.Floor && (below === TK.Top || below === TK.Cut)) {
        edge = py;
        break;
      }
    }
    assert.ok(edge > 0, `a near edge down column ${px}`);
    let n = 0;
    while (kindAt(p, px, edge - n) === TK.Floor && at(p, px, edge - n).join() !== at(BARE, px, edge - n).join()) n++;
    return n;
  };
  // along the near cliff at x = 30, clear of its corners and of the shaded wall's shadow
  const on: number[] = [];
  const off: number[] = [];
  for (let px = 200; px <= 440; px += 2) {
    on.push(reachOf(ON, px));
    off.push(reachOf(OFF, px));
  }
  assert.equal(Math.min(...on), 67, `2.1 tiles up the picture: ${Math.min(...on)}`);
  assert.equal(Math.max(...on), 67, `and no further anywhere: ${Math.max(...on)}`);
  assert.ok(Math.max(...off) - Math.min(...off) >= 12, `as the game has it, it wanders: ${Math.min(...off)} to ${Math.max(...off)}`);
});
