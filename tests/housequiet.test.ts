// FLOOR 14, THE HOUSE OF QUIET: ITS GROUND (src/art/housequiet.ts, painted by src/art/terrain.ts; a mock-up nothing
// of the game imports), held to his rules before it goes to the main chat, as the Undercity's is
// (tests/undercity.test.ts):
//   - the game walks by the level's tiles: every walkable tile's middle is painted floor (a ward, a hall, the
//     apothecary, the theatre, the chapel); every other tile is a wall (its face, its top);
//   - every pixel opaque;
//   - his rulebook: nothing in a place that could be taken for a glow, the hero's cyan or the enemy's pink (Colour 3);
//     duller than any word's colour (Colour 4); its own palette (Colour 1, the doc's "Whitewash, pale green
//     lamplight"): the limewash pale on the walls, the infirmary's green there to see and a yellow-green, never near
//     cyan; not mud-brown all over (Colour 5); crisp, opaque pixels;
// and what the main chat needs of it: two pieces side by side are one picture, the same every time.
//   run: tsx --test tests/housequiet.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { HQ_ZONE, houseOfQuietLook } from '../src/art/housequiet';
import { WORD_COLOR } from '../src/art/icons';
import { TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import type { RGB, Terrain } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

/** A stretch of the House of Quiet laid by hand: a hall along x; a ward, the apothecary and the theatre off it; the chapel. */
const W = 44;
const H = 36;
type Rect = [number, number, number, number];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const ROOMS: [Rect, number][] = [
  [[2, 18, 40, 22], HQ_ZONE.Hall],
  [[3, 6, 15, 16], HQ_ZONE.Ward],
  [[17, 9, 25, 16], HQ_ZONE.Apothecary],
  [[27, 3, 40, 16], HQ_ZONE.Theatre],
  [[6, 24, 18, 33], HQ_ZONE.Chapel],
];
const DOORS: Rect[] = [
  [8, 16, 10, 18],
  [20, 16, 22, 18],
  [32, 16, 34, 18],
  [11, 22, 13, 24],
];
const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H).fill(HQ_ZONE.Hall);
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
  }
}
const FLOOR = { depth: 14, seed: 14, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 20 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: (x: number, y: number) => zone[y * W + x] };
const T: Terrain = terrainOf(FLOOR, houseOfQuietLook(LAND));
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -200;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 240;
const WHOLE = paintTerrain(T, X0, Y0, WW, HH);

test('in no game file: nothing of the game imports the House of Quiet\'s ground', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(housequiet)\.ts$/.test(f)) continue;
    assert.ok(!/from ['"][^'"]*\/housequiet['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the House of Quiet's ground`);
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

test('no cyan and no pink anywhere, duller than every word\'s colour (Colour 3 and 4); pale limewash and the infirmary\'s yellow-green (Colour 1); not mud-brown all over (Colour 5)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  let most = 0;
  let seen = 0;
  let brown = 0;
  let faces = 0;
  let wash = 0;
  let green = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s, v] = hsv(c);
    if (v < 0.12) continue;
    seen++;
    most = Math.max(most, s);
    if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
    if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    // (every green of it a yellow-green, well short of the hero's cyan)
    if (s > 0.12 && v >= 0.2 && h >= 80 && h < 205) assert.ok(h < 140, `a green too near cyan at ${i}: ${c}`);
    if (s > 0.18 && h >= 5 && h < 45) brown++;
    if (s > 0.12 && h >= 80 && h < 140) green++;
    if (WHOLE.kind[i] === TK.Face) {
      faces++;
      // (the limewash: pale, near grey, a little green in it)
      if (v > 0.5 && s < 0.16) wash++;
    }
  }
  assert.ok(most < dullest, `the House of Quiet's richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  assert.ok(wash > 0.2 * faces, `limewash ${wash} of ${faces} on the walls`);
  assert.ok(green > 0.04 * seen, `the infirmary's green ${green} of ${seen}`);
  assert.ok(brown < 0.5 * seen, `brown ${brown} of ${seen}`);
});
