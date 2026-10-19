// FLOOR 12, THE UNDERCITY: ITS GROUND (src/art/undercity.ts, painted by src/art/terrain.ts; a mock-up nothing of the
// game imports), held to his rules before it goes to the main chat, as the Gate Ward's is (tests/gateward.test.ts):
//   - the game walks by the level's tiles: every walkable tile's middle is painted floor (a walkway, a cistern, a grate
//     or planks over the water); every water tile's middle is the water (the look's drop, painted); every other tile
//     is a wall (its face, its top);
//   - the water is painted, every pixel of it opaque: nothing need be laid behind the ground;
//   - his rulebook: nothing in a place that could be taken for a glow, the hero's cyan or the enemy's pink (Colour 3);
//     duller than any word's colour (Colour 4); never mud-brown all over (Colour 5); crisp, opaque pixels;
// and what the main chat needs of it: two pieces side by side are one picture, the same every time.
//   run: tsx --test tests/undercity.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { UC_ZONE, undercityLook } from '../src/art/undercity';
import { WORD_COLOR } from '../src/art/icons';
import { TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import type { RGB, Terrain } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

/** A stretch of the Undercity laid by hand: a tunnel along x, its channel, a grate and planks over it; a cistern and its pool; the Order's tunnel. */
const W = 40;
const H = 40;
type Rect = [number, number, number, number];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const TUNNEL: Rect = [3, 10, 24, 17];
const CHANNEL: Rect = [3, 12, 24, 14];
const CISTERN: Rect = [24, 6, 36, 22];
const POOL: Rect = [27, 10, 33, 18];
const GRATE: Rect = [8, 12, 9, 14];
const PLANKS: Rect = [16, 12, 17, 14];
const DUG: Rect = [29, 22, 31, 34];
const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H);
const water = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (inR(TUNNEL, x, y)) tiles[i] = T_FLOOR;
    if (inR(CISTERN, x, y)) {
      tiles[i] = T_FLOOR;
      zone[i] = UC_ZONE.Cistern;
    }
    if (inR(DUG, x, y)) {
      tiles[i] = T_FLOOR;
      zone[i] = UC_ZONE.Dug;
    }
    if (inR(CHANNEL, x, y) || inR(POOL, x, y)) {
      tiles[i] = T_WALL;
      water[i] = 1;
    }
    if (inR(GRATE, x, y) || inR(PLANKS, x, y)) {
      tiles[i] = T_FLOOR;
      zone[i] = inR(GRATE, x, y) ? UC_ZONE.Grate : UC_ZONE.Planks;
    }
  }
}
const FLOOR = { depth: 12, seed: 12, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 15 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: (x: number, y: number) => zone[y * W + x], water: (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && water[y * W + x] === 1 };
const T: Terrain = terrainOf(FLOOR, undercityLook(LAND));
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -200;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 240;
const WHOLE = paintTerrain(T, X0, Y0, WW, HH);

test('in no game file: nothing of the game imports the Undercity\'s ground', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(undercity)\.ts$/.test(f)) continue;
    assert.ok(!/from ['"][^'"]*\/undercity['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Undercity's ground`);
  }
});

test('every walkable tile\'s middle is painted floor; every water tile\'s middle is the water; every other tile is a wall', () => {
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const walk = tiles[ty * W + tx] === T_FLOOR;
      const wet = water[ty * W + tx] === 1 && !walk;
      if (walk) assert.ok(T.ground(tx + 0.5, ty + 0.5), `walkable tile ${tx},${ty} is not floor`);
      else assert.ok(!T.ground(tx + 0.5, ty + 0.5), `tile ${tx},${ty} is floor but cannot be walked`);
      if (wet) assert.ok(T.drop(tx + 0.5, ty + 0.5), `water tile ${tx},${ty} is not the water`);
      else if (!walk) assert.ok(!T.drop(tx + 0.5, ty + 0.5), `wall tile ${tx},${ty} is painted as water`);
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

test('every pixel is opaque, the water too; and there is floor, wall, top and water to see', () => {
  const kinds = new Map<number, number>();
  for (let i = 0; i < WHOLE.kind.length; i++) {
    assert.equal(WHOLE.rgba[i * 4 + 3], 255);
    kinds.set(WHOLE.kind[i], (kinds.get(WHOLE.kind[i]) ?? 0) + 1);
  }
  assert.ok(!kinds.has(TK.Drop), `${kinds.get(TK.Drop)} pixels of the water left clear`);
  for (const k of [TK.Floor, TK.Face, TK.Top, TK.Hang]) assert.ok((kinds.get(k) ?? 0) > 2000, `kinds painted: ${[...kinds].map(([a, b]) => `${a}:${b}`).join(', ')}`);
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

test('no cyan and no pink anywhere, duller than every word\'s colour (Colour 3 and 4), and not mud-brown all over (Colour 5)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  let most = 0;
  let brown = 0;
  let cool = 0;
  let green = 0;
  let seen = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s, v] = hsv(c);
    if (v < 0.12) continue;
    seen++;
    most = Math.max(most, s);
    // (a colour that could be taken for a glow: the hero's cyan or the enemy's pink, bright enough to read as one)
    if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
    if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    if (s > 0.18 && h >= 5 && h < 45) brown++;
    else if (s > 0.12 && h >= 80 && h < 160) green++;
    else if (s <= 0.18 || (h >= 200 && h < 300)) cool++;
  }
  assert.ok(most < dullest, `the Undercity's richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  // (the brick warm, but the walkways cool and the water green: brown no more than half of what is seen)
  assert.ok(brown < 0.5 * seen, `brown ${brown} of ${seen}`);
  assert.ok(cool > 0.25 * seen && green > 0.05 * seen, `cool ${cool}, green ${green}, of ${seen}`);
});
