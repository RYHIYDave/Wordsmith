// FLOOR 10, THE SUNKEN FEN: ITS GROUND (src/art/fen.ts, painted by src/art/terrain.ts; a mock-up nothing of the game
// imports), held to his rules before he sees it, as the Pinewood's is:
//   - the game walks by today's tiles and the edge is painted round over them (12 Oct, 18:33: “Yeah I really like the
//     rounded edges”): every walkable tile's middle is floor, and no other tile's;
//   - his word, 12 Oct, 18:56: “The forest and the swamp don’t really have walls”: no faces, the fen's water at the
//     islands' height, so nothing painted stands over the walkable floor;
//   - his art rulebook: no cyan and no pink in a place (Colour 3); duller than any word's colour (Colour 4); crisp,
//     opaque pixels;
// and what the main chat needs of it: two pieces side by side are one picture, the same every time; the boardwalks'
// water, the ruin's paving and the Eye's pool come from the level.
//   run: tsx --test tests/fen.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { C_FEN, C_PAVE, fenLook } from '../src/art/fen';
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

/** A fen laid by hand: two islands, a boardwalk between them over the water, the ruin's ring of paving round the Eye's pool; two halves. */
const W = 44;
const H = 44;
const island = (x: number, y: number): boolean => Math.hypot(x - 12, y - 14) < 6 || Math.hypot(x - 30, y - 30) < 5;
const poolDist = (x: number, y: number): number => Math.hypot(x - 30, y - 12) / 3;
const ring = (x: number, y: number): boolean => poolDist(x, y) >= 1 && Math.hypot(x - 30, y - 12) < 6.5;
const walk = (x: number, y: number): boolean => Math.abs(x - y - 2) < 1.2 && x > 14 && x < 28;
function fenFloor(): Floor {
  const tiles = new Uint8Array(W * H).fill(T_WALL);
  const cut = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const cx = x + 0.5;
      const cy = y + 0.5;
      if (island(cx, cy) || ring(cx, cy) || walk(cx, cy)) tiles[y * W + x] = T_FLOOR;
    }
  }
  for (const [x, y, c] of [[12, 7, CUT_FAR], [12, 20, CUT_NEAR]] as const) {
    tiles[y * W + x] = T_FLOOR;
    cut[y * W + x] = c;
  }
  return { depth: 10, seed: 10, w: W, h: H, tiles, cut, variant: new Uint8Array(W * H), rooms: [], start: { x: 12, y: 14 } } as unknown as Floor;
}

const FLOOR = fenFloor();
const LOOK = fenLook({ boards: (x, y) => walk(x, y) && !island(x, y), paved: ring, pool: poolDist });
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
const key = (c: RGB): string => c.map(Math.round).join(',');

test('nothing of the game imports it (a mock-up for his yes)', () => {
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('fen.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/fen['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the fen's ground`);
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

test('no walls (his word): only floor and the fen\'s water at its height are painted, a pixel floor exactly where the ground is', () => {
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
  assert.ok(floors > 20000, `there is floor to see: ${floors}`);
});

test('where the level says: the islands of peat, not water, the ruin paved, water under the boardwalk, the Eye\'s pool dark in its ring', () => {
  const pave = new Set(C_PAVE.map(key));
  const fen = new Set(C_FEN.map(key));
  let n = { peat: 0, pave: 0, under: 0, pool: 0, island: 0, ring: 0, walk: 0, deep: 0 };
  for (let py = Y0; py < Y0 + HH; py += 2) {
    for (let px = X0; px < X0 + WW; px += 2) {
      const [x, y] = worldOf(px, py);
      if (x < 0 || y < 0 || x > W || y > H) continue;
      const c = key(rgbAt(px, py));
      // (well inside each, away from its rounded edge)
      if (Math.hypot(x - 12, y - 14) < 4.5) {
        n.island++;
        if (!fen.has(c) && !pave.has(c)) n.peat++;
      } else if (poolDist(x, y) > 1.15 && Math.hypot(x - 30, y - 12) < 5.8) {
        n.ring++;
        const rgb = rgbAt(px, py);
        const [h, sat] = hsv(rgb);
        // (its stone, grey with a cold violet, the sickness's grey and violet over it)
        if (pave.has(c) || (!fen.has(c) && (sat < 0.2 || (h > 220 && h < 320)))) n.pave++;
      } else if (Math.abs(x - y - 2) < 0.6 && x > 19 && x < 24) {
        n.walk++;
        if (fen.has(c)) n.under++;
      } else if (poolDist(x, y) < 0.8) {
        n.deep++;
        if (c === key(C_FEN[0]) || c === key(C_FEN[1]) || c === key(C_FEN[2]) || c === key(C_FEN[3])) n.pool++;
      }
    }
  }
  assert.ok(n.peat > 0.85 * n.island, `the island's peat (no water, no paving) ${n.peat} of ${n.island}`);
  assert.ok(n.pave > 0.4 * n.ring, `the ruin's paving ${n.pave} of ${n.ring}`);
  assert.ok(n.under > 0.4 * n.walk, `the water under the boardwalk ${n.under} of ${n.walk}`);
  assert.ok(n.pool > 0.85 * n.deep, `the pool's dark water ${n.pool} of ${n.deep}`);
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  const x0 = X0 + 400;
  const y0 = Y0 + 200;
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

test('no cyan and no pink anywhere in the fen, its water and its sickness, and duller than every word\'s colour (his rulebook, Colour 3 and 4)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  let most = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s] = hsv(c);
    most = Math.max(most, s);
    if (s > 0.2) {
      assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
      assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    }
  }
  assert.ok(most < dullest, `the ground's most saturated ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
});
