// FLOOR 8, ECHO CANYON: ITS GROUND (src/art/canyon.ts, painted by src/art/terrain.ts; a mock-up nothing of the
// game imports), held to his rules before he sees it, as the Quarry's and the Ledge Road's are:
//   - the game walks by today's tiles and the edge is painted round over them (12 Oct, 18:33: “Yeah I really
//     like the rounded edges”): every walkable tile's middle is floor, and no rock tile's;
//   - nothing painted stands over the walkable floor, so the hero and every warning stay in sight;
//   - the near cliff's face shows where the ridge slants back past straight down, in shadow, rising from the
//     floor's edge on the cliff's side (12 Oct, by 21:40; 13 Oct, “Yes, keep the floor in sight”);
//   - his art rulebook: light from the upper left; no cyan and no pink in a place (Colour 3); duller than any
//     word's colour (Colour 4); crisp, opaque pixels; three tones or so a material;
// and what the main chat needs of it: two pieces side by side are one picture, the same every time.
//   run: tsx --test tests/canyon.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { CANYON_LOOK, C_CAP, C_CREAM, C_EARTH, C_SAND, C_SCRUB, C_STONE, C_WALL } from '../src/art/canyon';
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

/** A canyon laid by hand: running up the screen, turning across it, and up again; a bay at the turn; two halves. */
function canyonFloor(): Floor {
  const w = 44;
  const h = 44;
  const tiles = new Uint8Array(w * h).fill(T_WALL);
  const cut = new Uint8Array(w * h);
  // its middle line, in tiles: up the screen is along -x -y, across it along +x -y
  const line: [number, number][] = [[6, 30], [12, 26], [18, 24], [24, 18], [30, 12], [36, 6]];
  const dist = (x: number, y: number): number => {
    let d = Infinity;
    for (let i = 0; i + 1 < line.length; i++) {
      const [ax, ay] = line[i];
      const [bx, by] = line[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      d = Math.min(d, Math.hypot(x - ax - t * dx, y - ay - t * dy));
    }
    return d;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (dist(x + 0.5, y + 0.5) < 2.0 || ((x + 0.5 - 19) / 2.5) ** 2 + ((y + 0.5 - 25) / 1.6) ** 2 < 1) {
        tiles[y * w + x] = T_FLOOR;
      }
    }
  }
  // two halves at the canyon's edge
  for (const [x, y, c] of [[26, 13, CUT_FAR], [14, 27, CUT_NEAR]] as const) {
    tiles[y * w + x] = T_FLOOR;
    cut[y * w + x] = c;
  }
  return { depth: 8, seed: 8, w, h, tiles, cut, variant: new Uint8Array(w * h), rooms: [], start: { x: 18, y: 24 } } as unknown as Floor;
}

const FLOOR = canyonFloor();
const T: Terrain = terrainOf(FLOOR, CANYON_LOOK);
const [ax] = pictureOf(0, FLOOR.h);
const [bx] = pictureOf(FLOOR.w, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -40;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(FLOOR.w, FLOOR.h)[1]) + 80;
const WHOLE = paintTerrain(T, X0, Y0, WW, HH);
const kindAt = (px: number, py: number): number => WHOLE.kind[(py - Y0) * WW + (px - X0)];

test('nothing of the game imports it (a mock-up for his yes)', () => {
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('canyon.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/canyon['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports Echo Canyon's ground`);
  }
});

test('every walkable tile\'s middle is painted floor, and no rock tile\'s', () => {
  for (let ty = 0; ty < FLOOR.h; ty++) {
    for (let tx = 0; tx < FLOOR.w; tx++) {
      const i = ty * FLOOR.w + tx;
      if (FLOOR.cut && FLOOR.cut[i]) continue;
      assert.equal(T.ground(tx + 0.5, ty + 0.5), FLOOR.tiles[i] === T_FLOOR, `tile ${tx},${ty}`);
    }
  }
});

test('nothing painted stands over the walkable floor: a pixel is floor exactly where the ground is', () => {
  let floors = 0;
  for (let py = Y0; py < Y0 + HH; py++) {
    for (let px = X0; px < X0 + WW; px++) {
      const [x, y] = worldOf(px, py);
      const g = T.ground(x, y);
      if (g) floors++;
      assert.equal(kindAt(px, py) === TK.Floor, g, `pixel ${px},${py}`);
    }
  }
  assert.ok(floors > 30000, `there is floor to see: ${floors}`);
});

test('the near cliff\'s face rises from the floor\'s edge on the cliff\'s side, within its height, and there is some', () => {
  let n = 0;
  for (let px = X0; px < X0 + WW; px++) {
    for (let py = Y0; py < Y0 + HH - CANYON_LOOK.near - 2; py++) {
      if (kindAt(px, py) !== TK.Near) continue;
      n++;
      let d = 1;
      while (d <= CANYON_LOOK.near && kindAt(px, py + d) !== TK.Floor) d++;
      assert.ok(d <= CANYON_LOOK.near, `near face at ${px},${py} has floor under it`);
    }
  }
  assert.ok(n > 100, `near faces shown: ${n}`);
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

test('every pixel is opaque, and every kind of ground is painted (floor, far face, top, near top cut away, near face)', () => {
  const seen = new Set<number>();
  for (let i = 0; i < WHOLE.kind.length; i++) {
    seen.add(WHOLE.kind[i]);
    assert.equal(WHOLE.rgba[i * 4 + 3], 255);
  }
  for (const k of [TK.Floor, TK.Face, TK.Top, TK.Cut, TK.Near]) assert.ok(seen.has(k), `kind ${k} painted`);
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

test('no cyan and no pink anywhere in the canyon, and duller than every word\'s colour (his rulebook, Colour 3 and 4)', () => {
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

test('light from the upper left: a face to the lower left is lighter than one at the eye, and that than one to the lower right', () => {
  const lum = (c: RGB): number => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  let lit = 0;
  let mid = 0;
  let dark = 0;
  for (let v = 2; v < 140; v++) {
    for (let px = 0; px < 120; px++) {
      lit += lum(CANYON_LOOK.face(1, v, px, 0, 0, 0));
      mid += lum(CANYON_LOOK.face(0, v, px, 0, 0, 0));
      dark += lum(CANYON_LOOK.face(-1, v, px, 0, 0, 0));
    }
  }
  assert.ok(lit > mid && mid > dark, `${lit} > ${mid} > ${dark}`);
});

test('the palettes are three tones a material or so, each its own (sand, stones, walls, cream beds, earth, scrub, caprock)', () => {
  for (const r of [C_SAND, C_STONE, C_CREAM, C_EARTH, C_SCRUB, C_CAP, ...C_WALL]) {
    assert.ok(r.length >= 3 && r.length <= 6, `${r.length} tones`);
    assert.equal(new Set(r.map((c) => c.join(','))).size, r.length);
  }
});
