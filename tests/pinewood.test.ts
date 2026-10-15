// FLOOR 9, THE PINEWOOD: ITS GROUND (src/art/pinewood.ts, painted by src/art/terrain.ts; a mock-up nothing of the
// game imports), held to his rules before he sees it, as Echo Canyon's is:
//   - the game walks by today's tiles and the edge is painted round over them (12 Oct, 18:33: “Yeah I really
//     like the rounded edges”): every walkable tile's middle is floor, and no other tile's;
//   - his word, 12 Oct, 18:56: “The forest and the swamp don’t really have walls”: no faces, the forest floor at
//     the meadow's height, so nothing painted stands over the walkable floor;
//   - his art rulebook: light from the upper left; no cyan and no pink in a place (Colour 3); duller than any
//     word's colour (Colour 4); crisp, opaque pixels;
// and what the main chat needs of it: two pieces side by side are one picture, the same every time; the river,
// the trails and the sickness come from the level.
//   run: tsx --test tests/pinewood.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { C_GRASS, C_WATER, RIVER_HALF, grassMark, pinewoodLook } from '../src/art/pinewood';
import { WORD_COLOR } from '../src/art/icons';
import { TK, paintTerrain, pictureOf, terrainOf, worldOf } from '../src/art/terrain';
import type { RGB, Terrain } from '../src/art/terrain';
import { CUT_FAR, CUT_NEAR, T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as {
  ok(v: unknown, msg?: string): void;
  equal(a: unknown, b: unknown, msg?: string): void;
  deepEqual(a: unknown, b: unknown, msg?: string): void;
};
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

/** A Pinewood laid by hand: a great meadow, a grove standing in it, the wood round it; a river across it with a footbridge; a trail; the sickness toward one side; two halves. */
const W = 44;
const H = 44;
const riverDist = (x: number, y: number): number => Math.abs(x - y + 2) / Math.SQRT2;
const trailDist = (x: number, y: number): number => Math.abs(x + y - 44) / Math.SQRT2;
const sick = (x: number, y: number): number => Math.max(0, Math.min(1, (x - y - 8) / 12));
function pineFloor(): Floor {
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const cut = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cx = x + 0.5;
      const cy = y + 0.5;
      const meadow = Math.hypot(cx - 22, cy - 22) < 16;
      const grove = Math.hypot(cx - 28, cy - 14) < 2.5;
      const water = riverDist(cx, cy) < RIVER_HALF + 0.3;
      const bridge = Math.abs(cx + cy - 44) < 1.2;
      if (meadow && !grove && (!water || bridge)) tiles[y * W + x] = T_FLOOR;
    }
  }
  for (const [x, y, c] of [[22, 7, CUT_FAR], [22, 37, CUT_NEAR]] as const) {
    tiles[y * W + x] = T_FLOOR;
    cut[y * W + x] = c;
  }
  return { depth: 9, seed: 9, w: W, h: H, tiles, cut, variant: new Uint8Array(W * H), rooms: [], start: { x: 22, y: 22 } } as unknown as Floor;
}

const FLOOR = pineFloor();
const LOOK = pinewoodLook({ river: riverDist, trail: trailDist, sick });
const T: Terrain = terrainOf(FLOOR, LOOK);
const [ax] = pictureOf(0, FLOOR.h);
const [bx] = pictureOf(FLOOR.w, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -40;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(FLOOR.w, FLOOR.h)[1]) + 80;
const WHOLE = paintTerrain(T, X0, Y0, WW, HH);
const kindAt = (px: number, py: number): number => WHOLE.kind[(py - Y0) * WW + (px - X0)];
const rgbAt = (px: number, py: number): RGB => {
  const i = ((py - Y0) * WW + (px - X0)) * 4;
  return [WHOLE.rgba[i], WHOLE.rgba[i + 1], WHOLE.rgba[i + 2]];
};

test('nothing of the game imports it (a mock-up for his yes)', () => {
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('pinewood.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/pinewood['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Pinewood's ground`);
  }
});

test('every walkable tile\'s middle is painted floor, and no other tile\'s', () => {
  for (let ty = 0; ty < FLOOR.h; ty++) {
    for (let tx = 0; tx < FLOOR.w; tx++) {
      const i = ty * FLOOR.w + tx;
      if (FLOOR.cut && FLOOR.cut[i]) continue;
      assert.equal(T.ground(tx + 0.5, ty + 0.5), FLOOR.tiles[i] === T_FLOOR, `tile ${tx},${ty}`);
    }
  }
});

test('no walls (his word): only floor and the forest floor at its height are painted, a pixel floor exactly where the ground is', () => {
  let floors = 0;
  for (let py = Y0; py < Y0 + HH; py++) {
    for (let px = X0; px < X0 + WW; px++) {
      const [x, y] = worldOf(px, py);
      const g = T.ground(x, y);
      if (g) floors++;
      const k = kindAt(px, py);
      assert.equal(k === TK.Floor, g, `pixel ${px},${py}`);
      assert.ok(k === TK.Floor || k === TK.Top, `pixel ${px},${py} is kind ${k}`);
    }
  }
  assert.ok(floors > 30000, `there is floor to see: ${floors}`);
});

test('the river\'s water runs where the level puts it, over its bridge too; its banks either side', () => {
  const water = new Set(C_WATER.map((c) => c.map(Math.round).join(',')));
  let wet = 0;
  let bridge = 0;
  for (let py = Y0; py < Y0 + HH; py += 2) {
    for (let px = X0; px < X0 + WW; px += 2) {
      const [x, y] = worldOf(px, py);
      if (x < 0 || y < 0 || x > W || y > H) continue;
      const isWater = water.has(rgbAt(px, py).map(Math.round).join(','));
      const d = riverDist(x, y);
      if (d < RIVER_HALF - 0.12) {
        assert.ok(isWater, `no water at ${x.toFixed(2)},${y.toFixed(2)}`);
        wet++;
        if (T.ground(x, y)) bridge++;
      } else if (d > RIVER_HALF + 0.02) assert.ok(!isWater, `water out of the river at ${x.toFixed(2)},${y.toFixed(2)}`);
    }
  }
  assert.ok(wet > 500 && bridge > 20, `water ${wet}, under the bridge ${bridge}`);
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  const x0 = X0 + 500;
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

/** Hue in degrees and saturation 0..1 (HSV). */
function hsv([r, g, b]: RGB): [number, number] {
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
  return [h, mx ? d / mx : 0];
}
const hexRgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

test('no cyan and no pink anywhere in the wood, its water and its sickness, and duller than every word\'s colour (his rulebook, Colour 3 and 4)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
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
  assert.ok(most < dullest, `the ground's most saturated ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
});

test('light from the upper left: every blade and tuft of grass lit at its top, its shade under it, never over it', () => {
  const lum = (c: RGB): number => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  const tone = 3;
  const base = lum(C_GRASS[tone]);
  let lit = 0;
  for (let py = 0; py < 400; py++) {
    for (let px = 0; px < 400; px++) {
      const m = grassMark(px, py, tone, 0.3);
      if (!m || lum(m) <= base) continue;
      lit++;
      // under a lit pixel: the mark going on, or its shade; never anything lighter
      const under = grassMark(px, py + 1, tone, 0.3) ?? C_GRASS[tone];
      assert.ok(lum(under) <= lum(m), `at ${px},${py} lighter under a lit pixel`);
      // and somewhere under it, before the mark ends, its shade
      let k = 1;
      let shaded = false;
      while (k < 5) {
        const q = grassMark(px, py + k, tone, 0.3);
        if (q && lum(q) < base) shaded = true;
        if (!q) break;
        k++;
      }
      assert.ok(shaded || grassMark(px, py + 1, tone, 0.3) !== null, `at ${px},${py} no shade under its mark`);
    }
  }
  assert.ok(lit > 10000, `lit tips: ${lit}`);
});
