// FLOOR 15, THE GREAT LIBRARY: ITS GROUND (src/art/library.ts, painted by src/art/terrain.ts; a mock-up nothing of
// the game imports), held to his rules before it goes to the main chat, as the House of Quiet's is
// (tests/housequiet.test.ts):
//   - the game walks by the level's tiles: every walkable tile's middle is painted floor (the stacks, a hall, the
//     Reading Room, the scriptorium); every other tile is a wall (its face, its top);
//   - every pixel opaque;
//   - his rulebook: nothing in a place that could be taken for a glow, the hero's cyan or the enemy's pink (Colour 3);
//     duller than any word's colour (Colour 4); its own palette (Colour 1, the doc's "Dark wood, candle gold, black
//     ink"): the dark wood on the walls, the gilt dull gold there to see, the Order's black ink on the floor; not
//     mud-brown all over (Colour 5); crisp, opaque pixels;
// and what the main chat needs of it: two pieces side by side are one picture, the same every time.
//   run: tsx --test tests/library.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { LB_ZONE, greatLibraryLook } from '../src/art/library';
import { WORD_COLOR } from '../src/art/icons';
import { TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import type { RGB, Terrain } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

/** A stretch of the Great Library laid by hand: a hall along x; the stacks (rows of shelves), the Reading Room and the scriptorium off it. */
const W = 44;
const H = 36;
type Rect = [number, number, number, number];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const ROOMS: [Rect, number][] = [
  [[2, 18, 40, 22], LB_ZONE.Hall],
  [[3, 4, 15, 16], LB_ZONE.Stacks],
  [[17, 3, 40, 16], LB_ZONE.Reading],
  [[6, 24, 18, 33], LB_ZONE.Scriptorium],
];
const DOORS: Rect[] = [
  [8, 16, 10, 18],
  [26, 16, 30, 18],
  [11, 22, 13, 24],
];
const SHELVES: Rect[] = [
  [5, 7, 14, 8],
  [5, 10, 14, 11],
  [5, 13, 14, 14],
];
const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H).fill(LB_ZONE.Hall);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    for (const [r, z] of ROOMS) {
      if (inR(r, x, y)) {
        tiles[i] = T_FLOOR;
        zone[i] = z;
      }
    }
    if (DOORS.some((r) => inR(r, x, y))) tiles[i] = T_FLOOR;
    if (SHELVES.some((r) => inR(r, x, y))) tiles[i] = T_WALL;
  }
}
const FLOOR = { depth: 15, seed: 15, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 20 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: (x: number, y: number) => zone[y * W + x] };
const T: Terrain = terrainOf(FLOOR, greatLibraryLook(LAND));
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -200;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 240;
const WHOLE = paintTerrain(T, X0, Y0, WW, HH);

test('in the game only through its own (ACT 2, THE HUSH: render/outdoor.ts); nothing else of the game imports the Great Library\'s ground', () => {
  // (an import of the art's own file, wherever from: the game's own map-maker of the same name, game/act2/<ground>.ts, is not it)
  const own = new Set(['render/outdoor.ts']);
  own.add('art/act2_ways.ts'); // the ways between the floors (mockup/ways): floor 15's way and start in a wall of this ground's own face
  const art = new Set(['art/library']);
  const at = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  own.add('art/low_stacks.ts'); // the stacks' rows one block high (mockup/low-stacks): the bookcases' own shelves and light
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(library)\.ts$/.test(f) || own.has(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(at(dir, spec)), `src/${f} imports the Great Library's ground`);
    }
  }
});

test('every walkable tile\'s middle is painted floor, and every other tile\'s middle is not', () => {
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const walk = tiles[ty * W + tx] === T_FLOOR;
      if (walk) assert.ok(T.ground(tx + 0.5, ty + 0.5), `walkable tile ${tx},${ty} is not floor`);
      else assert.ok(!T.ground(tx + 0.5, ty + 0.5), `tile ${tx},${ty} is floor but cannot be walked`);
    }
  }
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  const x0 = X0 + 300;
  const y0 = Y0 + 300;
  const one = paintTerrain(T, x0, y0, 200, 160);
  const again = paintTerrain(T, x0, y0, 200, 160);
  assert.deepEqual(Array.from(again.rgba), Array.from(one.rgba));
  const parts = [paintTerrain(T, x0, y0, 120, 70), paintTerrain(T, x0 + 120, y0, 80, 70), paintTerrain(T, x0, y0 + 70, 200, 90)];
  for (let r = 0; r < 160; r++) {
    for (let c = 0; c < 200; c++) {
      const p = r < 70 ? (c < 120 ? parts[0] : parts[1]) : parts[2];
      const pc = r < 70 && c >= 120 ? c - 120 : c;
      const pr = r < 70 ? r : r - 70;
      for (let k = 0; k < 4; k++) if (p.rgba[(pr * p.w + pc) * 4 + k] !== one.rgba[(r * 200 + c) * 4 + k]) assert.ok(false, `seam at ${c},${r}`);
    }
  }
});

test('every pixel is opaque; and there is floor, wall and top to see', () => {
  const kinds = new Map<number, number>();
  for (let i = 0; i < WHOLE.kind.length; i++) {
    assert.equal(WHOLE.rgba[i * 4 + 3], 255);
    kinds.set(WHOLE.kind[i], (kinds.get(WHOLE.kind[i]) ?? 0) + 1);
  }
  for (const k of [TK.Floor, TK.Face, TK.Top]) assert.ok((kinds.get(k) ?? 0) > 2000, `kinds painted: ${[...kinds].map(([a, b]) => `${a}:${b}`).join(', ')}`);
});

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

test('no cyan and no pink anywhere, duller than every word\'s colour (Colour 3 and 4); dark wood on the walls, dull gilt and black ink to see (Colour 1); not mud-brown all over (Colour 5)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  let most = 0;
  let seen = 0;
  let brown = 0;
  let faces = 0;
  let wood = 0;
  let gilt = 0;
  let floors = 0;
  let ink = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s, v] = hsv(c);
    if (WHOLE.kind[i] === TK.Floor) {
      floors++;
      // (the Order's ink: near black, a little blue-violet in it)
      if (v < 0.13 && c[2] >= c[0] && c[2] > c[1]) ink++;
    }
    if (v < 0.12) continue;
    seen++;
    most = Math.max(most, s);
    if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
    if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    if (s > 0.18 && h >= 5 && h < 45) brown++;
    if (WHOLE.kind[i] === TK.Face) {
      faces++;
      // (the dark wood: a warm brown, dark; the gilt: a dull gold, lighter)
      if (h >= 15 && h < 40 && s > 0.3 && v < 0.45) wood++;
      if (h >= 35 && h < 50 && s > 0.35 && v >= 0.45) gilt++;
    }
  }
  assert.ok(most < dullest, `the Great Library's richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  assert.ok(wood > 0.15 * faces, `dark wood ${wood} of ${faces} on the walls`);
  assert.ok(gilt > 0.008 * faces, `gilt ${gilt} of ${faces} on the walls`);
  assert.ok(ink > 0.015 * floors, `the Order's ink ${ink} of ${floors} on the floors`);
  assert.ok(brown < 0.5 * seen, `brown ${brown} of ${seen}`);
});
