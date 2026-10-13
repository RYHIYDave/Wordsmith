// THE OUTDOOR GROUND OF ACT 1 (src/art/terrain.ts) and the Quarry's look (src/art/quarry.ts).
//
// The owner's rules for the outdoor levels (the project's claude/act1_descent.md), each held here:
//   - the game walks by today's tiles and the edge is painted round over them (12 Oct, 18:33: “Yeah I
//     really like the rounded edges”): every walkable tile's middle is painted floor, and no rock tile's;
//   - nothing painted stands over the walkable floor, so the hero and every warning stay in sight: a
//     pixel is floor exactly where the ground is floor, and a near cliff's face is on the cliff's side;
//   - the near cliff's face shows where the ridge slants back past straight down, in shadow (by 21:40);
//   - his art rulebook: light from the upper left; no cyan and no pink in a place (Colour 3); a place
//     duller than any word's colour (Colour 4); crisp, opaque pixels.
// And what the main chat needs of it: two pieces side by side are one picture, the same every time.
//   run: tsx --test tests/terrain.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { WORD_COLOR } from '../src/art/icons';
import { QUARRY_LOOK, Q_BED, Q_CAP, Q_GRASS, Q_ROCK, Q_WALL } from '../src/art/quarry';
import { TK, edgeAngle, nearShows, paintTerrain, pictureOf, terrainOf, worldOf } from '../src/art/terrain';
import type { RGB, Terrain, TerrainLook } from '../src/art/terrain';
import { CUT_LEFT, CUT_NEAR, T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as {
  ok(v: unknown, msg?: string): void;
  equal(a: unknown, b: unknown, msg?: string): void;
  deepEqual(a: unknown, b: unknown, msg?: string): void;
};

/** A floor laid by hand: a great pit, a second off it, a path a tile wide out of it, and some halves. */
function quarryFloor(): Floor {
  const w = 40;
  const h = 40;
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  const set = (x: number, y: number, c = 0): void => {
    tiles[y * w + x] = T_FLOOR;
    cut[y * w + x] = c;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = ((x + 0.5 - 16) / 7) ** 2 + ((y + 0.5 - 18) / 5.5) ** 2;
      const b = ((x + 0.5 - 27) / 4) ** 2 + ((y + 0.5 - 12) / 3) ** 2;
      if (a < 1 || b < 1) set(x, y);
    }
  }
  for (let x = 22; x < 34; x++) set(x, 26); // a path a tile wide
  set(34, 26, CUT_LEFT); // a half at its end
  set(16, 23, CUT_NEAR); // a half under the pit's floor: its floor half up the screen, against (16, 22)
  return { depth: 6, seed: 6, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 16, y: 18 } } as unknown as Floor;
}

const FLOOR = quarryFloor();
const T: Terrain = terrainOf(FLOOR, QUARRY_LOOK);
/** The floor's whole picture, and a margin. */
const [ax] = pictureOf(0, FLOOR.h);
const [bx] = pictureOf(FLOOR.w, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -40;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(FLOOR.w, FLOOR.h)[1]) + 80;
const WHOLE = paintTerrain(T, X0, Y0, WW, HH);
const kindAt = (px: number, py: number): number => WHOLE.kind[(py - Y0) * WW + (px - X0)];

test('every walkable tile\'s middle is painted floor, and no rock tile\'s', () => {
  for (let ty = 0; ty < FLOOR.h; ty++) {
    for (let tx = 0; tx < FLOOR.w; tx++) {
      const i = ty * FLOOR.w + tx;
      if (FLOOR.cut && FLOOR.cut[i]) continue; // a half: its middle is on the cut
      const floor = FLOOR.tiles[i] === T_FLOOR;
      assert.equal(T.ground(tx + 0.5, ty + 0.5), floor, `tile ${tx},${ty}`);
    }
  }
});

test('the floor half of a cut tile is floor where it meets the floor, its wall half rock', () => {
  // (16, 23) is cut NEAR: its wall is the half nearer the eye (u + v > 1), its floor half against (16, 22)
  assert.ok(T.ground(16 + 0.3, 23 + 0.08), 'its floor half, by the floor');
  assert.ok(!T.ground(16 + 0.85, 23 + 0.85), 'its wall half');
});

test('nothing painted stands over the walkable floor: a pixel is floor exactly where the ground is', () => {
  let floors = 0;
  for (let py = Y0; py < Y0 + HH; py++) {
    for (let px = X0; px < X0 + WW; px++) {
      const [x, y] = worldOf(px, py);
      const g = T.ground(x, y);
      const k = kindAt(px, py);
      if (g) floors++;
      assert.equal(k === TK.Floor, g, `pixel ${px},${py}`);
    }
  }
  assert.ok(floors > 50000, 'there is floor to see');
});

test('a near cliff\'s face rises from the floor\'s edge on the cliff\'s side, within its height, and there is some', () => {
  let n = 0;
  for (let px = X0; px < X0 + WW; px++) {
    for (let py = Y0; py < Y0 + HH - QUARRY_LOOK.near - 2; py++) {
      if (kindAt(px, py) !== TK.Near) continue;
      n++;
      let d = 1;
      while (d <= QUARRY_LOOK.near && kindAt(px, py + d) !== TK.Floor) d++;
      assert.ok(d <= QUARRY_LOOK.near, `near face at ${px},${py} has floor under it`);
    }
  }
  assert.ok(n > 100, `near faces shown: ${n}`);
});

test('the near face shows only where the edge looks back past straight down (his rule)', () => {
  // straight edges with no wander, each way round
  const plain: TerrainLook = { ...QUARRY_LOOK, rag: 0, fine: 0 };
  const half = (inside: (x: number, y: number) => boolean): Terrain => {
    const w = 30;
    const tiles = new Uint8Array(w * w).fill(T_WALL);
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) if (inside(x + 0.5, y + 0.5)) tiles[y * w + x] = T_FLOOR;
    return terrainOf({ w, h: w, tiles, cut: new Uint8Array(w * w), variant: new Uint8Array(w * w) } as unknown as Floor, plain);
  };
  const cases: [string, (x: number, y: number) => boolean, number, number, number, boolean | null][] = [
    // name, floor, a point on its edge, the angle out of the floor ON THE PICTURE (square to the edge as drawn), does the near face show
    ['rock up the screen (a far wall, its face seen whole: the rule\'s very edge)', (x, y) => x + y > 30, 15, 15, -90, null],
    ['rock toward the eye', (x, y) => x + y < 30, 15, 15, 90, false],
    ['rock to the upper left: the ridge slants back past straight down', (x) => x > 15, 15, 15, -116.6, true],
    ['rock to the lower right', (x) => x < 15, 15, 15, 63.4, false],
    ['rock to the upper right', (_x, y) => y > 15, 15, 15, -63.4, false],
    ['rock to the lower left', (_x, y) => y < 15, 15, 15, 116.6, false],
  ];
  for (const [name, inside, x, y, want, shows] of cases) {
    const a = edgeAngle(half(inside), x, y);
    assert.ok(Math.abs(a - want) < 2, `${name}: ${a.toFixed(1)} for ${want}`);
    if (shows !== null) assert.equal(nearShows(a), shows, name);
  }
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  const x0 = X0 + 300;
  const y0 = Y0 + 120;
  const one = paintTerrain(T, x0, y0, 200, 160);
  const again = paintTerrain(T, x0, y0, 200, 160);
  assert.deepEqual(Array.from(again.rgba), Array.from(one.rgba));
  const parts = [paintTerrain(T, x0, y0, 120, 70), paintTerrain(T, x0 + 120, y0, 80, 70), paintTerrain(T, x0, y0 + 70, 200, 90)];
  for (let r = 0; r < 160; r++) {
    for (let c = 0; c < 200; c++) {
      const p = r < 70 ? (c < 120 ? parts[0] : parts[1]) : parts[2];
      const pc = r < 70 && c >= 120 ? c - 120 : c;
      const pr = r < 70 ? r : r - 70;
      for (let k = 0; k < 4; k++) {
        if (p.rgba[(pr * p.w + pc) * 4 + k] !== one.rgba[(r * 200 + c) * 4 + k]) assert.ok(false, `seam at ${c},${r}`);
      }
    }
  }
});

test('every pixel is opaque, and every kind of ground is painted', () => {
  const seen = new Set<number>();
  for (let i = 0; i < WHOLE.kind.length; i++) {
    seen.add(WHOLE.kind[i]);
    assert.equal(WHOLE.rgba[i * 4 + 3], 255);
  }
  for (const k of [TK.Floor, TK.Face, TK.Top, TK.Cut, TK.Near]) assert.ok(seen.has(k), `kind ${k} painted`);
});

/** Hue in degrees and saturation 0..1 (HSV). */
function hsv([r, g, b]: RGB): [number, number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d > 0) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, mx ? d / mx : 0, mx / 255];
}
const hexRgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

test('no cyan and no pink anywhere in the Quarry, and duller than every word\'s colour (his rulebook, Colour 3 and 4)', () => {
  // the nine power words of his rulebook (its numbers: power, swift, twin, fire, frost, lightning, leech, volatile, poison)
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const words = nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]);
  const dullest = Math.min(...words);
  let most = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s] = hsv(c);
    most = Math.max(most, s);
    if (s > 0.25) {
      assert.ok(!(h > 165 && h < 205), `cyan at ${i}: ${c}`);
      assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    }
  }
  assert.ok(most < dullest, `the ground's most saturated ${most.toFixed(2)}, the dullest word ${dullest.toFixed(2)}`);
});

test('light from the upper left: a face to the lower left is lighter than one at the eye, and that than one to the lower right', () => {
  const lum = (c: RGB): number => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  let lit = 0;
  let mid = 0;
  let dark = 0;
  for (let v = 2; v < 100; v++) {
    for (let px = 0; px < 60; px++) {
      lit += lum(QUARRY_LOOK.face(1, v, px, 0, 0, 0));
      mid += lum(QUARRY_LOOK.face(0, v, px, 0, 0, 0));
      dark += lum(QUARRY_LOOK.face(-1, v, px, 0, 0, 0));
    }
  }
  assert.ok(lit > mid && mid > dark, `${lit} > ${mid} > ${dark}`);
});

test('the palettes are three tones a material or so, each its own (the bed, the walls, the grass, the rock, the cap)', () => {
  for (const r of [Q_BED, Q_GRASS, Q_ROCK, Q_CAP, ...Q_WALL]) {
    assert.ok(r.length >= 3 && r.length <= 6, `${r.length} tones`);
    assert.equal(new Set(r.map((c) => c.join(','))).size, r.length);
  }
});
