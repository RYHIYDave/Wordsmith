// FLOOR 18, THE GLASS GALLERY: ITS GROUND (src/art/glassgallery.ts, painted by src/art/terrain.ts), checked as the Swan
// Gardens' is (tests/swangardens.test.ts) and the House of Quiet's (tests/housequiet.test.ts), on a stretch of the queen's
// wing laid by hand: a gallery with a runner down it; off it the chapel, a dressing room and the glasshouse; the Mirror Hall
// at its end; a skylight broken through in the gallery's floor (the ground's drop, the hall below painted in). The checks:
//   - nothing of the game imports it;
//   - walkable tiles are floor, the skylight's tiles the drop, every other tile's middle wall;
//   - two pieces side by side are one picture, the same every time; every pixel opaque, the hall below in the hole;
//   - his rulebook: nothing cyan, no pink, every colour under the dullest word's (Colour 3 and 4); its own palette (the doc's
//     "Silver, cold blue glass, dark violet"): silver the most of what the gallery's floor is, violet on its walls, the
//     glasshouse's panes a cold grey-blue (well past cyan); not mud-brown all over (Colour 5);
//   - the walls fade into the dark at their tops; each room's walls its own; the skylight's hole shows its lip and the hall
//     below.
//   run: tsx --test tests/glassgallery.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { GG_FADE, GG_MARBLE, GG_RISE, GG_ZONE, glassGalleryTerrain, paintGlassGallery } from '../src/art/glassgallery';
import { WORD_COLOR } from '../src/art/icons';
import { TK, pictureOf } from '../src/art/terrain';
import type { RGB } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

/** A stretch of the queen's wing laid by hand. */
const W = 40;
const H = 30;
type Rect = [number, number, number, number];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const ROOMS: [Rect, number][] = [
  [[3, 12, 32, 19], GG_ZONE.Gallery],
  [[4, 3, 12, 10], GG_ZONE.Chapel],
  [[14, 5, 20, 10], GG_ZONE.Dressing],
  [[22, 2, 31, 10], GG_ZONE.Glasshouse],
  [[33, 11, 39, 22], GG_ZONE.MirrorHall],
];
const DOORS: Rect[] = [
  [7, 10, 9, 12],
  [16, 10, 18, 12],
  [26, 10, 28, 12],
  [32, 14, 33, 17],
];
const HOLE: Rect = [12, 16, 14, 18];
const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H).fill(GG_ZONE.Gallery);
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
    if (inR(HOLE, x, y)) tiles[i] = T_WALL;
  }
}
const isHole = (tx: number, ty: number): boolean => inR(HOLE, tx, ty);
const FLOOR = { depth: 18, seed: 18, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 14 } } as unknown as Floor;
const RUN = { y0: 14.9, y1: 16.1 };
const LAND = {
  floor: FLOOR,
  zone: (x: number, y: number) => zone[y * W + x],
  runner: (x: number, y: number) => (x > 3.6 && x < 31.4 ? Math.min(y - RUN.y0, RUN.y1 - y) : -1),
  skylight: isHole,
};
const T = glassGalleryTerrain(LAND);
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -200;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 240;
const WHOLE = paintGlassGallery(T, X0, Y0, WW, HH, isHole);
const at = (x: number, y: number): [number, number] => {
  const [px, py] = pictureOf(x, y);
  return [Math.floor(px) - X0, Math.floor(py) - Y0];
};
const colAt = (c: number, r: number): RGB => {
  const i = (r * WW + c) * 4;
  return [WHOLE.rgba[i], WHOLE.rgba[i + 1], WHOLE.rgba[i + 2]];
};

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
const lum = (c: readonly number[]): number => 0.3 * c[0] + 0.5 * c[1] + 0.2 * c[2];

test('nothing of the game imports the Glass Gallery\'s ground', () => {
  const art = new Set(['art/glassgallery']);
  const atp = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (its own pieces, art/floor18.ts, take its marble from it: they too are a mock-up nothing of the game imports)
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(glassgallery|floor18)\.ts$/.test(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(atp(dir, spec)), `src/${f} imports the Glass Gallery's ground`);
    }
  }
});

test('every walkable tile\'s middle is floor; every tile of a skylight broken through is the drop; every other tile\'s middle is wall', () => {
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const walk = tiles[ty * W + tx] === T_FLOOR;
      if (walk) assert.ok(T.ground(tx + 0.5, ty + 0.5), `walkable tile ${tx},${ty} is not floor`);
      else {
        assert.ok(!T.ground(tx + 0.5, ty + 0.5), `tile ${tx},${ty} is floor but cannot be walked`);
        assert.equal(T.drop(tx + 0.5, ty + 0.5), isHole(tx, ty), `tile ${tx},${ty}: the drop ${T.drop(tx + 0.5, ty + 0.5)}`);
      }
    }
  }
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  // (round the skylight's hole and the gallery's back wall)
  const [hx, hy] = at(12, 15);
  const x0 = X0 + hx - 100;
  const y0 = Y0 + hy - 120;
  const one = paintGlassGallery(T, x0, y0, 200, 160, isHole);
  const again = paintGlassGallery(T, x0, y0, 200, 160, isHole);
  assert.deepEqual(Array.from(again.rgba), Array.from(one.rgba));
  const parts = [paintGlassGallery(T, x0, y0, 120, 70, isHole), paintGlassGallery(T, x0 + 120, y0, 80, 70, isHole), paintGlassGallery(T, x0, y0 + 70, 200, 90, isHole)];
  for (let r = 0; r < 160; r++) {
    for (let c = 0; c < 200; c++) {
      const p = r < 70 ? (c < 120 ? parts[0] : parts[1]) : parts[2];
      const pc = r < 70 && c >= 120 ? c - 120 : c;
      const pr = r < 70 ? r : r - 70;
      for (let k = 0; k < 4; k++) if (p.rgba[(pr * p.w + pc) * 4 + k] !== one.rgba[(r * 200 + c) * 4 + k]) assert.ok(false, `seam at ${c},${r}`);
    }
  }
});

test('every pixel is opaque, the hall below painted in where the floor is broken through; floor, wall, top and the drop to see', () => {
  const kinds = new Map<number, number>();
  for (let i = 0; i < WHOLE.kind.length; i++) {
    assert.equal(WHOLE.rgba[i * 4 + 3], 255);
    kinds.set(WHOLE.kind[i], (kinds.get(WHOLE.kind[i]) ?? 0) + 1);
  }
  for (const k of [TK.Floor, TK.Face, TK.Top]) assert.ok((kinds.get(k) ?? 0) > 2000, `kinds painted: ${[...kinds].map(([a, b]) => `${a}:${b}`).join(', ')}`);
  assert.ok((kinds.get(TK.Drop) ?? 0) > 1000, `the hole: ${kinds.get(TK.Drop) ?? 0} pixels`);
  assert.ok((kinds.get(TK.Hang) ?? 0) > 50, `the floor's thickness under the hole's lip: ${kinds.get(TK.Hang) ?? 0} pixels`);
});

test('no cyan and no pink anywhere, duller than every word\'s colour (Colour 3 and 4); silver, cold blue glass and dark violet (Colour 1); not mud-brown (Colour 5)', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  let most = 0;
  let seen = 0;
  let brown = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const [h, s, v] = hsv(c);
    if (v < 0.12) continue;
    seen++;
    most = Math.max(most, s);
    if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
    if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    if (s > 0.18 && h >= 5 && h < 45) brown++;
  }
  assert.ok(most < dullest, `the Glass Gallery's richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  assert.ok(brown < 0.1 * seen, `brown ${brown} of ${seen}`);
  // the gallery's floor: silver-grey the most of it (cool, barely coloured), dark violet at its corners and border
  let floor = 0;
  let silver = 0;
  let violet = 0;
  for (let y = 12.2; y < 18.8; y += 0.07) {
    for (let x = 3.2; x < 11.8; x += 0.07) {
      if (y > RUN.y0 && y < RUN.y1) continue;
      const [h, s, v] = hsv(colAt(...at(x, y)));
      floor++;
      if (s < 0.2 && v > 0.3 && (s < 0.06 || (h >= 210 && h < 290))) silver++;
      if (s > 0.15 && h >= 250 && h < 300) violet++;
    }
  }
  assert.ok(silver > 0.6 * floor, `silver ${silver} of ${floor} of the gallery's floor`);
  assert.ok(violet > 0.03 * floor, `violet ${violet} of ${floor} of the gallery's floor`);
});

test('the walls: violet silk in the gallery, the glasshouse\'s panes a cold grey-blue, the chapel\'s stained glass; each fades into the dark at its top', () => {
  const L = T.look;
  // (a far face looking down to the left, in the light: along x, its foot on y; px across it, v up it)
  const faceIn = (room: [number, number], v: number, px: number): RGB => {
    const [x, y] = room;
    return L.face(1, v, px, Math.round(pictureOf(x, y)[1]) - v, x, y);
  };
  let silk = 0;
  let glass = 0;
  let stained = 0;
  let all = 0;
  for (let px = 0; px < 600; px += 3) {
    for (const v of [34, 44, 54]) {
      all++;
      const [h1, s1] = hsv(faceIn([20, 12], v, px));
      if (s1 > 0.12 && h1 >= 250 && h1 < 300) silk++;
      const [h2, s2, v2] = hsv(faceIn([25, 2], v, px));
      if (v2 > 0.3 && s2 > 0.05 && h2 >= 210 && h2 < 245) glass++;
      const [, s3] = hsv(faceIn([8, 3], v, px));
      if (s3 > 0.25) stained++;
    }
  }
  assert.ok(silk > 0.5 * all, `violet silk on the gallery's walls: ${silk} of ${all}`);
  assert.ok(glass > 0.5 * all, `cold grey-blue panes in the glasshouse's walls: ${glass} of ${all}`);
  assert.ok(stained > 0.05 * all, `stained glass in the chapel's walls: ${stained} of ${all}`);
  for (const room of [[20, 12], [8, 3], [17, 5], [25, 2]] as [number, number][]) {
    let mid = 0;
    let top = 0;
    for (let px = 0; px < 400; px += 2) {
      mid += lum(faceIn(room, 40, px));
      top += lum(faceIn(room, GG_RISE - 4, px));
    }
    assert.ok(top < 0.6 * mid, `the wall of ${room} at its top ${(top / 200).toFixed(0)}, at its middle ${(mid / 200).toFixed(0)} (it fades into the dark from ${GG_FADE})`);
  }
});

test('the skylight broken through: its lip lit, the floor\'s thickness under it, and the hall below\'s marble far down', () => {
  let drop = 0;
  let marble = 0;
  let seen = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    if (WHOLE.kind[i] !== TK.Drop) continue;
    drop++;
    const [h, s, v] = hsv([WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]]);
    // (the hall below's marble, silver-grey and violet, or its dark; nothing else down there)
    if (s < 0.06 || (h >= 210 && h < 300)) marble++;
    if (v > 0.14) seen++;
  }
  assert.ok(marble === drop, `the hall below: ${marble} of ${drop} of the hole its marble`);
  assert.ok(seen > 0.3 * drop, `the hall below to be seen (not all dark): ${seen} of ${drop}`);
  // the lip: at the hole's far edges the marble's lit edge
  const lit = new Set([GG_MARBLE[4], GG_MARBLE[3]].map((c) => c.map(Math.round).join(',')));
  let lip = 0;
  let edge = 0;
  for (let x = 12.2; x < 13.8; x += 0.05) {
    const [c, r] = at(x, 16);
    for (let dr = -3; dr <= 3; dr++) {
      edge++;
      const q = colAt(c, r + dr);
      const k = q.map(Math.round).join(',');
      if (lit.has(k) || lum(q) > lum(GG_MARBLE[3]) * 0.9) {
        lip++;
        break;
      }
    }
  }
  assert.ok(lip > 0.15 * (edge / 7), `the hole's lit lip: ${lip} of ${edge / 7}`);
});
