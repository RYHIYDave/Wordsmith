// FLOOR 16, THE SWAN GARDENS: ITS GROUND (src/art/swangardens.ts, painted by src/art/terrain.ts), checked as the
// Millrace's is (tests/millrace.test.ts), on a stretch of the gardens laid by hand: lawns, a walk, a bed, paving, nettles;
// a block of yew (the hedges are the ground's walls); the lake across the near rows (the ground's drop, its water painted
// in). The checks:
//   - nothing of the game imports it;
//   - walkable tiles are floor, the lake's tiles the drop, every other tile's middle yew;
//   - two pieces side by side are one picture, the same every time; every pixel opaque, the lake's water in it;
//   - his rulebook: nothing cyan, no pink, every colour under the dullest word's (Colour 3 and 4); its own palette (the doc's
//     "Dawn rose, swan white, deep hedge green"): green the most of what is walked on, the lake's dawn lavender there;
//   - the yew throws its shadow away from the low sun (to the right, never to the left); the nettles show where they are;
//     the lake has its kerb of stone.
//   run: tsx --test tests/swangardens.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { SG_LAWN, SG_LAWN_SH, SG_NETTLE, SG_STONE, paintSwanGardens, swanGardensTerrain } from '../src/art/swangardens';
import { WORD_COLOR } from '../src/art/icons';
import { TK, pictureOf } from '../src/art/terrain';
import type { RGB } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
import { HIGH_CITY } from '../src/game/act1';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

const W = 40;
const H = 40;
const isLake = (tx: number, ty: number): boolean => tx >= 2 && tx < 38 && ty >= 30 && ty < 36;
const isYew = (tx: number, ty: number): boolean => tx >= 10 && tx < 13 && ty >= 5 && ty < 15;
const tiles = new Uint8Array(W * H).fill(T_WALL);
for (let y = 2; y < 30; y++) for (let x = 2; x < 38; x++) if (!isYew(x, y)) tiles[y * W + x] = T_FLOOR;
const FLOOR = { depth: 16, seed: 16, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 5 } } as unknown as Floor;
const NETTLES = { x0: 5, x1: 9, y0: 24, y1: 27 };
const T = swanGardensTerrain(FLOOR, {
  lake: isLake,
  walk: (_x, y) => y >= 20 && y < 21.5,
  paved: (x, y) => Math.hypot(x - 30, y - 10) < 2,
  bed: (x, y) => x > 20 && x < 24 && y > 10 && y < 12,
  nettles: (x, y) => Math.min(x - NETTLES.x0, NETTLES.x1 - x, y - NETTLES.y0, NETTLES.y1 - y),
});
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -80;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 120;
const WHOLE = paintSwanGardens(T, X0, Y0, WW, HH);
const at = (x: number, y: number): [number, number] => {
  const [px, py] = pictureOf(x, y);
  return [Math.floor(px) - X0, Math.floor(py) - Y0];
};
const colAt = (c: number, r: number): RGB => {
  const i = (r * WW + c) * 4;
  return [WHOLE.rgba[i], WHOLE.rgba[i + 1], WHOLE.rgba[i + 2]];
};
const key = (c: readonly number[]): string => c.join(',');

// (Since his “Levels are ready to add”, 29 Oct 2026, 18:09, the game takes the Swan Gardens' ground in, on floors 16 to 20 behind
// HIGH_CITY (game/act1.ts, docs/high_city_build.md); nothing of it is seen until he has played the floors and said yes.)
test('the Swan Gardens\' ground is in the game only behind HIGH_CITY, off until his yes', () => {
  assert.equal(HIGH_CITY.on, false);
});

test('every walkable tile\'s middle is floor; every tile of the lake\'s is the drop; every other tile\'s middle is yew', () => {
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const walk = tiles[ty * W + tx] === T_FLOOR;
      if (walk) assert.ok(T.ground(tx + 0.5, ty + 0.5), `walkable tile ${tx},${ty} is not floor`);
      else {
        assert.ok(!T.ground(tx + 0.5, ty + 0.5), `tile ${tx},${ty} is floor but cannot be walked`);
        assert.equal(T.drop(tx + 0.5, ty + 0.5), isLake(tx, ty), `tile ${tx},${ty}: the drop ${T.drop(tx + 0.5, ty + 0.5)}`);
      }
    }
  }
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  const x0 = X0 + 500;
  const y0 = Y0 + 700;
  const one = paintSwanGardens(T, x0, y0, 200, 160);
  const again = paintSwanGardens(T, x0, y0, 200, 160);
  assert.deepEqual(Array.from(again.rgba), Array.from(one.rgba));
  const parts = [paintSwanGardens(T, x0, y0, 120, 70), paintSwanGardens(T, x0 + 120, y0, 80, 70), paintSwanGardens(T, x0, y0 + 70, 200, 90)];
  for (let r = 0; r < 160; r++) {
    for (let c = 0; c < 200; c++) {
      const p = r < 70 ? (c < 120 ? parts[0] : parts[1]) : parts[2];
      const pc = r < 70 && c >= 120 ? c - 120 : c;
      const pr = r < 70 ? r : r - 70;
      for (let k = 0; k < 4; k++) if (p.rgba[(pr * p.w + pc) * 4 + k] !== one.rgba[(r * 200 + c) * 4 + k]) assert.ok(false, `seam at ${c},${r}`);
    }
  }
});

test('every pixel is opaque, the lake\'s water painted in where the ground falls away', () => {
  let drop = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    assert.equal(WHOLE.rgba[i * 4 + 3], 255);
    if (WHOLE.kind[i] === TK.Drop) drop++;
  }
  assert.ok(drop > 10000, `the lake: ${drop} pixels`);
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

test('no cyan and no pink anywhere, duller than every word\'s colour (Colour 3 and 4); deep hedge green and the dawn\'s lavender (Colour 1)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  let most = 0;
  let green = 0;
  let field = 0;
  let lavender = 0;
  let water = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s, v] = hsv(c);
    if (WHOLE.kind[i] === TK.Drop) {
      water++;
      if (s > 0.1 && h >= 225 && h < 290) lavender++;
    }
    if (v < 0.12) continue;
    most = Math.max(most, s);
    if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
    if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    if (WHOLE.kind[i] === TK.Floor) {
      field++;
      if (s > 0.12 && h >= 80 && h < 160) green++;
    }
  }
  assert.ok(most < dullest, `the gardens' richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  assert.ok(green > 0.5 * field, `green ${green} of ${field} walked on`);
  assert.ok(lavender > 0.5 * water, `the dawn's lavender ${lavender} of ${water} of the lake`);
});

test('the yew throws its shadow away from the low sun: across the lawn to its right, never to its left', () => {
  const shade = new Set(SG_LAWN_SH.map(key));
  const lit = new Set(SG_LAWN.map(key));
  let right = 0;
  let left = 0;
  let rightAll = 0;
  let leftAll = 0;
  // (a stripe of lawn along the block's side toward +x and -y: the right on the picture; and along its -x side, the left)
  for (let y = 6; y < 14; y += 0.25) {
    for (const [x, side] of [[13.3, 'r'], [9.7, 'l']] as const) {
      const [c, r] = at(x, y);
      const k = key(colAt(c, r));
      if (side === 'r') {
        rightAll++;
        if (shade.has(k)) right++;
      } else {
        leftAll++;
        if (shade.has(k)) left++;
      }
      void lit;
    }
  }
  assert.ok(right > 0.4 * rightAll, `in the yew's shadow to its right: ${right} of ${rightAll}`);
  assert.equal(left, 0, `in shadow to its left: ${left} of ${leftAll}`);
});

test('the nettles show where they are; the lake has its kerb of stone', () => {
  const nettle = new Set([...SG_NETTLE.map(key), '58,43,55', '163,166,151']);
  let n = 0;
  let all = 0;
  for (let y = NETTLES.y0 + 0.6; y < NETTLES.y1 - 0.6; y += 0.2) {
    for (let x = NETTLES.x0 + 0.6; x < NETTLES.x1 - 0.6; x += 0.2) {
      const [c, r] = at(x, y);
      all++;
      if (nettle.has(key(colAt(c, r)))) n++;
    }
  }
  assert.ok(n > 0.9 * all, `nettles: ${n} of ${all}`);
  const stone = new Set(SG_STONE.map(key));
  let k = 0;
  let kAll = 0;
  for (let x = 4; x < 36; x += 0.5) {
    const [c, r] = at(x, 29.85);
    kAll++;
    if (stone.has(key(colAt(c, r)))) k++;
  }
  assert.ok(k > 0.8 * kAll, `the kerb: ${k} of ${kAll}`);
});
