// FLOOR 17, THE MASQUE: ITS GROUND (src/art/masque.ts, painted by src/art/terrain.ts), checked as the Swan Gardens' is
// (tests/swangardens.test.ts) and floor 14's indoor ground (tests/housequiet.test.ts), on a stretch of the palace laid by
// hand: the seven rooms in a row in the tale's order, each six tiles square, a doorway between each; a
// gallery along their south side; a card room and a servants' passage beyond it. The checks:
//   - nothing of the game imports it (its own pieces, art/floor17.ts, take its window and its scarlet from it: a mock-up too);
//   - walkable tiles are floor, every other tile not;
//   - two pieces side by side are one picture, the same every time; every pixel opaque; floor, wall and top to see;
//   - his rulebook: nothing cyan, no pink, every colour under the dullest word's (Colour 3 and 4), but the braziers' fire
//     seen through the windows (an honest fire), and the scarlet panes only in the black room's windows;
//   - the doc's "seven rooms of seven colours": each room's silk its own colour (blue, purple, green, orange, white,
//     violet; the black room's velvet dark), and its marble the same; each room's windows its own glass;
//   - the tale's "in the middle of each wall, a tall and narrow Gothic window": a window in the middle of each room's
//     far wall, painted there; its light lying on the floor before it.
//   run: tsx --test tests/masque.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { MQ_FIRE_CORE, MQ_ROOMS, MQ_SCARLET, MQ_ZONE, WIN, masqueLook, masqueWindows } from '../src/art/masque';
import { BRIGHT } from '../src/art/act2_quiet';
import { WORD_COLOR } from '../src/art/icons';
import { TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import type { RGB, Terrain } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
import { HIGH_CITY } from '../src/game/act1';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

/** A stretch of the palace laid by hand. */
const W = 58;
const H = 30;
type Rect = [number, number, number, number];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const SEVEN = [MQ_ZONE.Blue, MQ_ZONE.Purple, MQ_ZONE.Green, MQ_ZONE.Orange, MQ_ZONE.White, MQ_ZONE.Violet, MQ_ZONE.Black];
/** The seven rooms, x0 of each (six tiles square, at y 3 to 9), one tile of wall between. */
const X0 = SEVEN.map((_z, i) => 2 + i * 7);
const ROOMS: [Rect, number][] = [
  ...SEVEN.map((z, i) => [[X0[i], 3, X0[i] + 6, 9], z] as [Rect, number]),
  [[2, 11, 51, 14], MQ_ZONE.Gallery],
  [[2, 16, 12, 24], MQ_ZONE.Cards],
  [[14, 16, 51, 18], MQ_ZONE.Passage],
];
const DOORS: [Rect, number][] = [
  // between the seven, each the room before it's floor through it
  ...SEVEN.slice(1).map((_z, i) => [[X0[i + 1] - 1, 5, X0[i + 1], 7], SEVEN[i]] as [Rect, number]),
  // each room down into the gallery
  ...SEVEN.map((_z, i) => [[X0[i] + 2, 9, X0[i] + 4, 11], MQ_ZONE.Gallery] as [Rect, number]),
  [[5, 14, 7, 16], MQ_ZONE.Gallery],
  [[30, 14, 32, 16], MQ_ZONE.Passage],
];
const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H).fill(MQ_ZONE.Passage);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    for (const [r, z] of [...ROOMS, ...DOORS]) {
      if (inR(r, x, y)) {
        tiles[i] = T_FLOOR;
        zone[i] = z;
      }
    }
  }
}
const FLOOR = { depth: 17, seed: 17, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 12 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: (x: number, y: number) => zone[y * W + x] };
const T: Terrain = terrainOf(FLOOR, masqueLook(LAND));
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const PX0 = Math.floor(ax) - 40;
const PY0 = -180;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 220;
const WHOLE = paintTerrain(T, PX0, PY0, WW, HH);
const at = (x: number, y: number, up = 0): [number, number] => {
  const [px, py] = pictureOf(x, y);
  return [Math.floor(px) - PX0, Math.floor(py) - PY0 - up];
};
const colAt = (c: number, r: number): RGB => {
  const i = (r * WW + c) * 4;
  return [WHOLE.rgba[i], WHOLE.rgba[i + 1], WHOLE.rgba[i + 2]];
};
const hexOf = (c: readonly number[]): string => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');

function hsv([r, g, b]: readonly number[]): [number, number, number] {
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
/** The mean colour of some picture pixels, and its hue, its share of colour, its brightness. */
function meanOf(px: [number, number][]): { c: RGB; h: number; s: number; v: number } {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [c0, r0] of px) {
    const c = colAt(c0, r0);
    r += c[0];
    g += c[1];
    b += c[2];
  }
  const n = Math.max(1, px.length);
  const c: RGB = [r / n, g / n, b / n];
  const [h, s, v] = hsv(c);
  return { c, h, s, v };
}
const hueOff = (a: number, b: number): number => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

// (Since his “Yes, on to 17 (Recommended)”, 30 Oct 2026, the game takes the Masque's ground in, on floor 17 behind HIGH_CITY
// (game/act1.ts, docs/high_city_build.md); nothing of it is seen until he has played the floor and said yes.)
test('the Masque\'s ground is in the game only behind HIGH_CITY, off until his yes', () => {
  assert.equal(HIGH_CITY.on, false);
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
  const x0 = PX0 + 900;
  const y0 = PY0 + 200;
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

test('no cyan and no pink anywhere, duller than every word\'s colour (Colour 3 and 4), but the braziers\' fire through the glass; the scarlet only in the black room\'s windows', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  const scarlet = new Set(MQ_SCARLET.slice(1).map((c) => c.toLowerCase()));
  const blackX: [number, number] = [X0[6], X0[6] + 6];
  let most = 0;
  let mostAt = '';
  let fire = 0;
  let red = 0;
  for (let i = 0; i < WHOLE.kind.length; i++) {
    const c: RGB = [WHOLE.rgba[i * 4], WHOLE.rgba[i * 4 + 1], WHOLE.rgba[i * 4 + 2]];
    const hx = hexOf(c);
    if (BRIGHT.has(hx)) {
      // (an honest fire: only in a window's glass, on a wall's face)
      assert.equal(WHOLE.kind[i], TK.Face, `a glow ${hx} off a wall's face`);
      fire++;
      if (scarlet.has(hx)) {
        red++;
        // (the scarlet panes: the black room's windows only; its far wall is the one along x at y 3)
        const col = i % WW;
        const row = Math.floor(i / WW);
        const pxw = col + PX0;
        const pyw = row + PY0;
        // its column's foot on the north wall's line y = 3: x - 3 = px / 32
        const fx = pxw / 32 + 3;
        assert.ok(fx > blackX[0] - 0.6 && fx < blackX[1] + 0.6, `scarlet at ${col},${row} outside the black room (x ${fx.toFixed(1)}, ${pyw})`);
      }
      continue;
    }
    const [h, s, v] = hsv(c);
    if (v < 0.12) continue;
    if (s > most) {
      most = s;
      mostAt = hx;
    }
    if (s > 0.2 && v >= 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
    if (s > 0.35 && v >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
  }
  assert.ok(most < dullest, `the Masque's richest colour ${mostAt} at ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  assert.ok(fire > 200, `the fire through the windows: ${fire} pixels`);
  assert.ok(red > 100, `the black room's scarlet panes: ${red} pixels`);
  assert.ok(BRIGHT.has(MQ_FIRE_CORE.toLowerCase()), 'the fire through the glass is an honest fire\'s');
});

/** The silk of a room's far wall (along x, at y 3), between its windows: (u along the room from its west wall, up the wall). */
function silkOf(i: number): { c: RGB; h: number; s: number; v: number } {
  const px: [number, number][] = [];
  const ws = masqueWindows(LAND).filter((w) => w.face === 0 && w.y === 3 && w.x > X0[i] && w.x < X0[i] + 6);
  for (let u = 0.3; u < 5.7; u += 0.1) {
    const x = X0[i] + u;
    if (ws.some((w) => Math.abs((x - w.x) * 32) < WIN.hw + WIN.reveal + 3)) continue;
    for (let v = 30; v < 90; v += 3) px.push(at(x, 3, v));
  }
  return meanOf(px);
}
/** A room's floor, well in from its walls and out of the windows' light. */
function marbleOf(i: number): { c: RGB; h: number; s: number; v: number } {
  const px: [number, number][] = [];
  for (let y = 3.7; y < 4.3; y += 0.05) for (let x = X0[i] + 0.7; x < X0[i] + 5.3; x += 0.05) px.push(at(x, y + 2));
  return meanOf(px);
}

test('the doc\'s "seven rooms of seven colours": each room\'s silk and its marble its own colour; the white pale; the black dark', () => {
  const HUES: Record<number, number> = { [MQ_ZONE.Blue]: 222, [MQ_ZONE.Purple]: 286, [MQ_ZONE.Green]: 136, [MQ_ZONE.Orange]: 24, [MQ_ZONE.Violet]: 260 };
  SEVEN.forEach((z, i) => {
    const silk = silkOf(i);
    const floor = marbleOf(i);
    const name = MQ_ROOMS[z].name;
    if (z === MQ_ZONE.White) {
      assert.ok(silk.s < 0.16 && silk.v > 0.45, `the white room's silk: ${silk.c.map(Math.round)}`);
      assert.ok(floor.s < 0.16 && floor.v > 0.5, `the white room's marble: ${floor.c.map(Math.round)}`);
    } else if (z === MQ_ZONE.Black) {
      assert.ok(silk.v < 0.16, `the black room's velvet: ${silk.c.map(Math.round)}`);
      assert.ok(floor.v < 0.2, `the black room's carpet: ${floor.c.map(Math.round)}`);
    } else {
      assert.ok(hueOff(silk.h, HUES[z]) < 14 && silk.s > 0.2, `the ${name} room's silk: hue ${silk.h.toFixed(0)}, ${silk.s.toFixed(2)} of full colour`);
      assert.ok(hueOff(floor.h, HUES[z]) < 18 && floor.s > 0.12, `the ${name} room's marble: hue ${floor.h.toFixed(0)}, ${floor.s.toFixed(2)} of full colour`);
    }
  });
  // (and the blue, the violet and the purple told apart)
  const hs = [0, 1, 5].map((i) => silkOf(i).h);
  assert.ok(hueOff(hs[0], hs[2]) > 25 && hueOff(hs[2], hs[1]) > 18, `blue ${hs[0].toFixed(0)}, violet ${hs[2].toFixed(0)}, purple ${hs[1].toFixed(0)}`);
});

test('the tale\'s "in the middle of each wall, a tall and narrow Gothic window": one in the middle of each room\'s far wall, its glass its room\'s, the fire behind it; none where the wall is cut away', () => {
  const ws = masqueWindows(LAND);
  SEVEN.forEach((z, i) => {
    const mine = ws.filter((w) => w.face === 0 && w.y === 3 && w.x >= X0[i] && w.x <= X0[i] + 6);
    assert.equal(mine.length, 1, `the ${MQ_ROOMS[z].name} room's north wall: ${mine.length} windows`);
    assert.ok(Math.abs(mine[0].x - (X0[i] + 3)) < 0.01, `its window at ${mine[0].x}, the wall's middle ${X0[i] + 3}`);
    assert.equal(mine[0].zone, z);
    // painted there: the glass, the room's own (the black room's scarlet), and the fire at its heart
    const glass = new Set((z === MQ_ZONE.Black ? MQ_SCARLET.slice(1).map(hexRgb) : MQ_ROOMS[z].glass).map(hexOf));
    let inGlass = 0;
    let all = 0;
    let core = 0;
    for (let v = WIN.sill + 2; v < WIN.spring; v += 2) {
      for (const du of [-4, -1, 2, 5]) {
        const [c, r] = at(mine[0].x + du / 32, 3, v);
        const col = colAt(c, r);
        all++;
        const h = hexOf(col);
        if (h === MQ_FIRE_CORE.toLowerCase()) core++;
        else if (glass.has(h) || [...glass].some((g) => Math.max(...hexRgb(g).map((q, k) => Math.abs(q - col[k]))) < 18)) inGlass++;
      }
    }
    assert.ok(inGlass + core > 0.75 * all && core > 0, `the ${MQ_ROOMS[z].name} room's window: ${inGlass} glass, ${core} fire, of ${all}`);
  });
  // the west walls between the rooms are cut away (each has the next room's floor behind it): no window on them
  for (let i = 1; i < 7; i++) assert.equal(ws.filter((w) => w.face === 1 && w.x === X0[i]).length, 0, `a window on the cut wall west of room ${i}`);
});

test('a window\'s light lies on the floor before it, in its room\'s colour (the same floor painted without it, beside it)', () => {
  const dark = paintTerrain(terrainOf(FLOOR, masqueLook({ ...LAND, windowLight: false })), PX0, PY0, WW, HH);
  const ws = masqueWindows(LAND);
  const lum = (c: readonly number[]): number => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  for (const i of [0, 1, 2, 3, 4, 5, 6]) {
    const z = SEVEN[i];
    const w = ws.find((q) => q.face === 0 && q.y === 3 && q.x >= X0[i] && q.x <= X0[i] + 6)!;
    let more = 0;
    let less = 0;
    let n = 0;
    let toward = 0;
    const L = z === MQ_ZONE.Black ? null : MQ_ROOMS[z].light;
    for (let y = 3.4; y < 4.6; y += 0.02) {
      for (let x = w.x - 0.25; x < w.x + 0.25; x += 0.02) {
        const [c, r] = at(x, y);
        const k = (r * WW + c) * 4;
        const lit = [WHOLE.rgba[k], WHOLE.rgba[k + 1], WHOLE.rgba[k + 2]];
        const not = [dark.rgba[k], dark.rgba[k + 1], dark.rgba[k + 2]];
        n++;
        if (lum(lit) > lum(not) + 1) more++;
        if (lum(lit) < lum(not) - 1) less++;
        if (L && Math.hypot(lit[0] - L[0], lit[1] - L[1], lit[2] - L[2]) < Math.hypot(not[0] - L[0], not[1] - L[1], not[2] - L[2])) toward++;
      }
    }
    assert.ok(more > 0.6 * n && less === 0, `the ${MQ_ROOMS[z].name} room before its window: ${more} of ${n} lighter, ${less} darker`);
    if (L) assert.ok(toward > 0.6 * n, `the ${MQ_ROOMS[z].name} room's window light is its own colour: ${toward} of ${n}`);
    // and beside the window, out of its light, the floor is as it was
    let same = 0;
    let m = 0;
    for (let y = 3.4; y < 4.6; y += 0.05) {
      for (let x = w.x + 1.6; x < w.x + 2.1; x += 0.05) {
        const [c, r] = at(x, y);
        const k = (r * WW + c) * 4;
        m++;
        if (WHOLE.rgba[k] === dark.rgba[k] && WHOLE.rgba[k + 1] === dark.rgba[k + 1] && WHOLE.rgba[k + 2] === dark.rgba[k + 2]) same++;
      }
    }
    assert.equal(same, m, `the ${MQ_ROOMS[z].name} room beside its window: ${m - same} pixels lit`);
  }
});
