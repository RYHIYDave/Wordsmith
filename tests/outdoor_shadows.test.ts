// EVERY FLOOR'S NEAR SHADOW WITH NO TEETH, AND THE QUARRY AND THE LEDGE ROAD REPAINTED AS ECHO CANYON WAS (src/art/terrain.ts
// SHADOW_EVEN, src/art/quarry.ts QUARRY_RIM, src/art/ledge.ts LEDGE_RIM: mock-ups behind switches that are off;
// docs/mockups/outdoor_shadows/README.md), held to his rules before he sees them:
//   - off, each look is the game's;
//   - on, nothing painted stands over the walkable floor: every pixel shows the kind of ground it did;
//   - a shadow's edge is the wall's own line (his words, 11 Nov 2026, “The shadow is spikey when the wall is not”): the near
//     shadow reaches as far up from the cliff's edge in every column;
//   - the Quarry's near cliffs have their caprock rim where they are cut, and its shaded walls throw their shadow; the Ledge
//     Road's shaded walls throw theirs, and its drop, which is air, throws none;
//   - the light is one light (his words, 11 Nov 2026, to the Ledge Road's first picture: “As long as the light source is
//     consistent”): the shadows are thrown the way the walls are lit, across the screen from the left, so a wall painted in shade
//     throws one from its foot and a wall painted lit throws none before it.
//   run: tsx --test tests/outdoor_shadows.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { LEDGE_RIM, ledgeLook } from '../src/art/ledge';
import { QUARRY_LOOK, QUARRY_RIM, Q_CAP } from '../src/art/quarry';
import { SHADOW_EVEN, TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import type { TerrainLook, TerrainPiece } from '../src/art/terrain';
import { F8F9_FIX } from '../src/game/f8f9';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };

/** A floor 20 tiles by 12, rock all round it: walls on its far sides, near cliffs on its near ones. */
function bed(): Floor {
  const w = 40;
  const h = 40;
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  for (let y = 14; y < 26; y++) for (let x = 10; x < 30; x++) tiles[y * w + x] = T_FLOOR;
  return { depth: 6, seed: 6, w, h, tiles, cut: new Uint8Array(w * h), variant: new Uint8Array(w * h), rooms: [], start: { x: 20, y: 20 } } as unknown as Floor;
}

// (as the game has floors 6 to 8: their mends on)
F8F9_FIX.on = true;
const FLOOR = bed();
const X0 = Math.floor(pictureOf(0, FLOOR.h)[0]);
const Y0 = -200;
const WW = Math.ceil(pictureOf(FLOOR.w, 0)[0]) - X0;
const HH = Math.ceil(pictureOf(FLOOR.w, FLOOR.h)[1]) + 200;
const paint = (look: TerrainLook): TerrainPiece => paintTerrain(terrainOf(FLOOR, look), X0, Y0, WW, HH);
const at = (p: TerrainPiece, px: number, py: number): [number, number, number] => {
  const o = ((py - Y0) * WW + (px - X0)) * 4;
  return [p.rgba[o], p.rgba[o + 1], p.rgba[o + 2]];
};
const kindAt = (p: TerrainPiece, px: number, py: number): number => p.kind[(py - Y0) * WW + (px - X0)];
const pixelOf = (x: number, y: number): [number, number] => {
  const [px, py] = pictureOf(x, y);
  return [Math.round(px), Math.round(py)];
};
const sameKinds = (a: TerrainPiece, b: TerrainPiece): void => {
  let floors = 0;
  for (let i = 0; i < a.kind.length; i++) {
    if (a.kind[i] === TK.Floor) floors++;
    assert.equal(b.kind[i], a.kind[i], `pixel ${i}`);
  }
  assert.ok(floors > 20000, `there is floor to see: ${floors}`);
};
/** How far up from the near cliff's edge the floor is darker than on `bare` (the same ground with no near shadow), down each column along the near cliff at x = 30. */
const reaches = (p: TerrainPiece, bare: TerrainPiece): number[] => {
  const out: number[] = [];
  for (let px = 200; px <= 440; px += 2) {
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
    while (kindAt(p, px, edge - n) === TK.Floor && at(p, px, edge - n).join() !== at(bare, px, edge - n).join()) n++;
    out.push(n);
  }
  return out;
};
/** `b` at world (x, y) is `a` there made `dark` darker (to a pixel's rounding). */
const darker = (a: TerrainPiece, b: TerrainPiece, x: number, y: number, dark: number): void => {
  const [px, py] = pixelOf(x, y);
  assert.equal(kindAt(b, px, py), TK.Floor);
  const ca = at(a, px, py);
  const cb = at(b, px, py);
  for (let c = 0; c < 3; c++) assert.ok(Math.abs(cb[c] - ca[c] * (1 - dark)) <= 1.5, `at ${x},${y}: ${ca} to ${cb}`);
};
const same = (a: TerrainPiece, b: TerrainPiece, x: number, y: number): void => {
  const [px, py] = pixelOf(x, y);
  assert.deepEqual(at(b, px, py), at(a, px, py), `at ${x},${y}`);
};

// THE QUARRY: as the game has it; with every floor's shadow even; with its own repaint; and with no near shadow at all
const Q_OFF = paint(QUARRY_LOOK);
SHADOW_EVEN.on = true;
const Q_EVEN = paint(QUARRY_LOOK);
SHADOW_EVEN.on = false;
QUARRY_RIM.on = true;
const Q_ON = paint(QUARRY_LOOK);
const Q_ON_BARE = paint({ ...QUARRY_LOOK, nearShadow: undefined });
QUARRY_RIM.on = false;
const Q_BARE = paint({ ...QUARRY_LOOK, nearShadow: undefined });

test('the switches are off, and off each look is the game\'s', () => {
  assert.equal(SHADOW_EVEN.on, false);
  assert.equal(QUARRY_RIM.on, false);
  assert.equal(LEDGE_RIM.on, false);
  assert.equal(QUARRY_LOOK.cutRim, undefined);
  assert.equal(QUARRY_LOOK.shade, undefined);
  assert.deepEqual(QUARRY_LOOK.nearShadow, { reach: 1.3, dark: [0.36, 0.22] });
  const ledge = ledgeLook(() => false);
  assert.equal(ledge.cutRim, undefined);
  assert.equal(ledge.shade, undefined);
  assert.deepEqual(ledge.nearShadow, { reach: 1.2, dark: [0.32, 0.2] });
});

test('SHADOW_EVEN: a near shadow reaches as far up from the cliff\'s edge in every column, and nothing else changes (the Quarry)', () => {
  sameKinds(Q_OFF, Q_EVEN);
  const off = reaches(Q_OFF, Q_BARE);
  const on = reaches(Q_EVEN, Q_BARE);
  assert.equal(Math.min(...on), 41, `1.3 tiles up the picture: ${Math.min(...on)}`);
  assert.equal(Math.max(...on), 41, `and no further anywhere: ${Math.max(...on)}`);
  assert.ok(Math.max(...off) - Math.min(...off) >= 8, `as the game has it, it wanders: ${Math.min(...off)} to ${Math.max(...off)}`);
  // out of the near shadow, not a pixel's colour changed
  for (const [x, y] of [[18, 17], [20, 18], [11, 18], [22, 15.2]] as const) same(Q_OFF, Q_EVEN, x, y);
});

test('QUARRY_RIM: every pixel the kind of ground it was; the caprock rim along the near edges; the near shadow even', () => {
  sameKinds(Q_OFF, Q_ON);
  const isCap = (c: [number, number, number]): boolean => Q_CAP.some((k) => k[0] === c[0] && k[1] === c[1] && k[2] === c[2]);
  let edges = 0;
  let rimOn = 0;
  let rimOff = 0;
  for (let px = X0; px < X0 + WW; px++) {
    for (let py = Y0; py < Y0 + HH - 1; py++) {
      const below = kindAt(Q_OFF, px, py + 1);
      if (kindAt(Q_OFF, px, py) !== TK.Floor || (below !== TK.Top && below !== TK.Cut)) continue;
      edges++;
      if (isCap(at(Q_ON, px, py + 1))) rimOn++;
      if (isCap(at(Q_OFF, px, py + 1))) rimOff++;
    }
  }
  assert.ok(edges > 800, `near edges to see: ${edges}`);
  assert.ok(rimOn >= 0.98 * edges, `the rim along the near edge: ${rimOn} of ${edges}`);
  assert.ok(rimOff <= 0.1 * edges, `no rim there as the game has it: ${rimOff} of ${edges}`);
  const on = reaches(Q_ON, Q_ON_BARE);
  assert.equal(Math.min(...on), 41);
  assert.equal(Math.max(...on), 41);
});

test('QUARRY_RIM: a wall in shade throws its shadow across the screen to the right; a lit wall none; the open floor as it was', () => {
  for (const y of [17.5, 19.5, 21.5]) darker(Q_OFF, Q_ON, 10.7, y, QUARRY_RIM.shade.sunDark);
  for (const [x, y] of [[18, 17], [20, 18], [22, 17], [24, 16]] as const) same(Q_OFF, Q_ON, x, y);
  for (const x of [20.5, 24.5]) same(Q_OFF, Q_ON, x, 15.2);
});

test('LEDGE_RIM: every pixel the kind it was; a wall in shade throws its shadow; the drop, which is air, throws none', () => {
  // the drop along the near side, and in place of the lower half of the wall the light comes over
  const drop = (tx: number, ty: number): boolean => ty >= 26 || (tx < 10 && ty >= 20);
  const off = paint(ledgeLook(drop));
  LEDGE_RIM.on = true;
  const look = ledgeLook(drop);
  LEDGE_RIM.on = false;
  assert.deepEqual(look.nearShadow, { reach: 1.2, dark: [0.32, 0.2], even: true });
  const on = paint(look);
  let floors = 0;
  for (let i = 0; i < off.kind.length; i++) {
    if (off.kind[i] === TK.Floor) floors++;
    assert.equal(on.kind[i], off.kind[i], `pixel ${i}`);
  }
  assert.ok(floors > 20000, `there is floor to see: ${floors}`);
  // beside the rock wall: in its shadow
  for (const y of [15.5, 17]) darker(off, on, 10.7, y, LEDGE_RIM.shade.sunDark);
  // beside the drop: as it was
  for (const y of [22.5, 24]) same(off, on, 11, y);
  // and the open road
  for (const [x, y] of [[18, 17], [20, 18], [24, 16]] as const) same(off, on, x, y);
});
