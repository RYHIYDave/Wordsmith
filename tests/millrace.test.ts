// FLOOR 13, THE MILLRACE: ITS GROUND (src/art/millrace.ts, painted by src/art/terrain.ts; a mock-up nothing of the
// game imports), held to his rules before it goes to the main chat, as the Undercity's is (tests/undercity.test.ts):
//   - the game walks by the level's tiles: every walkable tile's middle is painted floor (the fields, a track, the yard,
//     a footbridge's crossing); every other tile is not (the river, the race, the rough past the fields), at the same
//     height (no walls, as the Pinewood);
//   - every pixel opaque;
//   - his rulebook: nothing in a place that could be taken for a glow, the hero's cyan or the enemy's pink (Colour 3);
//     duller than any word's colour (Colour 4); its own palette (Colour 1, the doc's "Gold fields, river blue"):
//     gold the most of it, the river's blue there to see; crisp, opaque pixels;
// and what the main chat needs of it: two pieces side by side are one picture, the same every time.
//   run: tsx --test tests/millrace.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { millraceLook } from '../src/art/millrace';
import { WORD_COLOR } from '../src/art/icons';
import { TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import type { RGB, Terrain } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

/** A stretch of the Millrace laid by hand: fields; a river down y = 12 with a footbridge; a race along y = 24 to a yard; a cart track; the rough past x = 34. */
const W = 40;
const H = 40;
const riverD = (x: number, y: number): number => Math.abs(y - 12.5);
const raceD = (x: number, y: number): number => (x < 28 ? Math.abs(y - 24.5) : Infinity);
const trackD = (x: number, y: number): number => Math.abs(x - 8.5);
const inYard = (x: number, y: number): boolean => Math.hypot(x - 30, y - 24) < 3.5;
const tiles = new Uint8Array(W * H).fill(T_WALL);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const cx = x + 0.5;
    const cy = y + 0.5;
    const bridge = x === 8 && riverD(cx, cy) < 1.2;
    const wet = riverD(cx, cy) < 0.62 || raceD(cx, cy) < 0.5;
    if (x < 34 && (bridge || !wet)) tiles[y * W + x] = T_FLOOR;
  }
}
const FLOOR = { depth: 13, seed: 13, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 5 } } as unknown as Floor;
const T: Terrain = terrainOf(FLOOR, millraceLook({ river: riverD, race: raceD, raceFlow: () => [1, 0], track: trackD, yard: inYard }));
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -60;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 120;
const WHOLE = paintTerrain(T, X0, Y0, WW, HH);

test('in no game file: nothing of the game imports the Millrace\'s ground', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(millrace)\.ts$/.test(f)) continue;
    assert.ok(!/from ['"][^'"]*\/millrace['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Millrace's ground`);
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

test('every pixel is opaque', () => {
  for (let i = 0; i < WHOLE.kind.length; i++) assert.equal(WHOLE.rgba[i * 4 + 3], 255);
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

test('no cyan and no pink anywhere, duller than every word\'s colour (Colour 3 and 4); gold fields and river blue (Colour 1)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  let most = 0;
  let gold = 0;
  let blue = 0;
  let seen = 0;
  let field = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s, v] = hsv(c);
    if (v < 0.12) continue;
    seen++;
    most = Math.max(most, s);
    if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
    if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    // (of what is walked on, the fields)
    if (WHOLE.kind[i] === TK.Floor) {
      field++;
      if (s > 0.2 && h >= 35 && h < 60) gold++;
    }
    if (s > 0.15 && h >= 205 && h < 235) blue++;
  }
  assert.ok(most < dullest, `the Millrace's richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  assert.ok(gold > 0.5 * field, `gold ${gold} of ${field} walked on`);
  assert.ok(blue > 0.02 * seen, `river blue ${blue} of ${seen}`);
});
