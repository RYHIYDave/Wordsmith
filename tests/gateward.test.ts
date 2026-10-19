// FLOOR 11, THE GATE WARD: ITS GROUND (src/art/gateward.ts, painted by src/art/terrain.ts; a mock-up nothing of the
// game imports), held to his rules before it goes to the main chat, as Act 1's grounds are (tests/fen.test.ts):
//   - the game walks by the level's tiles: every walkable tile's middle is painted floor (a street's setts, a square's
//     flags, a house's room); every other tile is a house (its front a wall, its top a roof), but a house's front
//     that can be walked into, cut down on the floor;
//   - his word, 18 Oct (to the first picture): “Can we make it so the fronts of any building you can go into is there,
//     but once you enter, the wholefacade fades to transparent so you can see inside?”, and his rulebook, Places 9: a
//     house walked into stands whole from the street (its SHELL, over the ground) and is painted inside under it;
//   - his rulebook: nothing in a place that could be taken for a glow, the hero's cyan or the enemy's pink (Colour 3); duller than any word's colour (Colour 4), a lit
//     window's candlelight aside; crisp, opaque pixels;
// and what the main chat needs of it: two pieces side by side are one picture, the same every time.
//   run: tsx --test tests/gateward.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { GW_GLASS, GW_ZONE, gateWardLook, gateWardPaintFloor, houseShell } from '../src/art/gateward';
import type { GWHouse } from '../src/art/gateward';
import { WORD_COLOR } from '../src/art/icons';
import { TK, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import type { RGB, Terrain } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

/** A stretch of the Gate Ward laid by hand: a lane along x, a square off it, a shop off the lane that can be walked into. */
const W = 40;
const H = 40;
const HOUSE: GWHouse = { room: [9, 12, 15, 16], front: { along: 'x', at: 16, door: [11, 13] } };
const tiles = new Uint8Array(W * H).fill(T_WALL);
const zone = new Uint8Array(W * H);
const inRoom = (x: number, y: number): boolean => x >= HOUSE.room[0] && x < HOUSE.room[2] && y >= HOUSE.room[1] && y < HOUSE.room[3];
const onFront = (x: number, y: number): boolean => y === HOUSE.front.at && x >= HOUSE.room[0] && x < HOUSE.room[2];
const inDoor = (x: number, y: number): boolean => y === HOUSE.front.at && x >= HOUSE.front.door[0] && x < HOUSE.front.door[1];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (y >= 17 && y < 20 && x >= 3 && x < 36) tiles[i] = T_FLOOR;
    if (x >= 18 && x < 32 && y >= 20 && y < 34) {
      tiles[i] = T_FLOOR;
      zone[i] = GW_ZONE.Square;
    }
    if (inRoom(x, y) || inDoor(x, y)) {
      tiles[i] = T_FLOOR;
      zone[i] = GW_ZONE.Room;
    }
  }
}
const FLOOR = { depth: 11, seed: 11, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 5, y: 18 } } as unknown as Floor;
const LAND = { floor: FLOOR, zone: (x: number, y: number) => zone[y * W + x], squares: [{ x: 25, y: 27, r: 2.4 }], houses: [HOUSE] };
const OPEN: Terrain = terrainOf(gateWardPaintFloor(LAND, 'open'), gateWardLook(LAND, 'open'));
const CLOSED: Terrain = terrainOf(gateWardPaintFloor(LAND, 'closed'), gateWardLook(LAND, 'closed'));
const [ax] = pictureOf(0, H);
const [bx] = pictureOf(W, 0);
const X0 = Math.floor(ax) - 40;
const Y0 = -200;
const WW = Math.ceil(bx - ax) + 80;
const HH = Math.ceil(pictureOf(W, H)[1]) + 240;
const WHOLE = paintTerrain(OPEN, X0, Y0, WW, HH);

test('in the game only through its own (ACT 2, THE HUSH: render/outdoor.ts, render/act2_houses.ts); nothing else of the game imports the Gate Ward\'s ground', () => {
  // (an import of the art's own file, wherever from: the game's own map-maker of the same name, game/act2/<ground>.ts, is not it)
  const own = new Set(['render/outdoor.ts', 'render/act2_houses.ts']);
  const art = new Set(['art/gateward']);
  const at = (dir: string, spec: string): string => {
    const out = dir ? dir.split('/') : [];
    for (const q of spec.split('/')) {
      if (q === '..') out.pop();
      else if (q !== '.') out.push(q);
    }
    return out.join('/');
  };
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(gateward|floor11|floor11_moments|act2_set|act2_kit)\.ts$/.test(f) || own.has(f)) continue;
    const dir = f.includes('/') ? f.slice(0, f.lastIndexOf('/')) : '';
    for (const [, spec] of fs.readFileSync(`src/${f}`, 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      assert.ok(!art.has(at(dir, spec)), `src/${f} imports the Gate Ward's ground`);
    }
  }
});

test('every walkable tile\'s middle is painted floor; every other tile is a house, but the front of one walked into, cut down on the floor', () => {
  for (let ty = 0; ty < H; ty++) {
    for (let tx = 0; tx < W; tx++) {
      const walk = tiles[ty * W + tx] === T_FLOOR;
      if (walk) assert.ok(OPEN.ground(tx + 0.5, ty + 0.5), `walkable tile ${tx},${ty} is not floor`);
      else if (!onFront(tx, ty)) assert.ok(!OPEN.ground(tx + 0.5, ty + 0.5), `tile ${tx},${ty} is floor but cannot be walked`);
    }
  }
  // (and the house whole, for its shell: its room and doorway under its roof)
  for (let ty = HOUSE.room[1]; ty < HOUSE.room[3]; ty++) for (let tx = HOUSE.room[0]; tx < HOUSE.room[2]; tx++) assert.ok(!CLOSED.ground(tx + 0.5, ty + 0.5), `the house whole: its room's tile ${tx},${ty} open to the sky`);
});

test('the house walked into (Places 9): its shell, whole from the street, lies over its own tiles and roof only, and is not empty', () => {
  const sh = houseShell(OPEN, CLOSED, HOUSE, paintTerrain);
  let n = 0;
  for (let i = 3; i < sh.rgba.length; i += 4) if (sh.rgba[i]) n++;
  assert.ok(n > 2000, `its shell: ${n} pixels`);
  // (none of it over the street before it: below the foot of its front, nothing)
  const footY = (HOUSE.room[0] + HOUSE.front.at + 1) * 16;
  for (let y = 0; y < sh.h; y++) {
    for (let x = 0; x < sh.w; x++) {
      if (!sh.rgba[(y * sh.w + x) * 4 + 3]) continue;
      const px = sh.x0 + x;
      const py = sh.y0 + y;
      // (the front's foot runs from its left corner down to its right: x from (rx0 - at - 1) * 32 to (rx1 - at - 1) * 32)
      const t = (px - (HOUSE.room[0] - HOUSE.front.at - 1) * 32) / ((HOUSE.room[2] - HOUSE.room[0]) * 32);
      if (t < 0 || t > 1) continue;
      const foot = footY + t * (HOUSE.room[2] - HOUSE.room[0]) * 16;
      // (but the kerb at its foot and the step of its door, a few pixels)
      assert.ok(py <= foot + 10, `its shell over the street at ${px},${py} (the front's foot at ${foot.toFixed(0)})`);
    }
  }
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  const x0 = X0 + 300;
  const y0 = Y0 + 300;
  const one = paintTerrain(OPEN, x0, y0, 200, 160);
  const again = paintTerrain(OPEN, x0, y0, 200, 160);
  assert.deepEqual(Array.from(again.rgba), Array.from(one.rgba));
  const parts = [paintTerrain(OPEN, x0, y0, 120, 70), paintTerrain(OPEN, x0 + 120, y0, 80, 70), paintTerrain(OPEN, x0, y0 + 70, 200, 90)];
  for (let r = 0; r < 160; r++) {
    for (let c = 0; c < 200; c++) {
      const p = r < 70 ? (c < 120 ? parts[0] : parts[1]) : parts[2];
      const pc = r < 70 && c >= 120 ? c - 120 : c;
      const pr = r < 70 ? r : r - 70;
      for (let k = 0; k < 4; k++) if (p.rgba[(pr * p.w + pc) * 4 + k] !== one.rgba[(r * 200 + c) * 4 + k]) assert.ok(false, `seam at ${c},${r}`);
    }
  }
});

test('every pixel is opaque, and there is floor, wall and roof to see', () => {
  const kinds = new Set<number>();
  for (let i = 0; i < WHOLE.kind.length; i++) {
    assert.equal(WHOLE.rgba[i * 4 + 3], 255);
    kinds.add(WHOLE.kind[i]);
  }
  assert.ok(kinds.has(TK.Floor) && kinds.has(TK.Top), `kinds painted: ${[...kinds].join(',')}`);
});

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

test('no cyan and no pink anywhere in the ward, and duller than every word\'s colour (Colour 3 and 4), a lit window\'s candlelight aside', () => {
  const nine = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
  const dullest = Math.min(...nine.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
  const lit = new Set(GW_GLASS.slice(2).map((c) => c.join(',')));
  let most = 0;
  let candle = 0;
  for (const P of [WHOLE, paintTerrain(CLOSED, X0, Y0, WW, HH)]) {
    for (let i = 0; i < P.kind.length; i++) {
      const c: RGB = [P.rgba[i * 4], P.rgba[i * 4 + 1], P.rgba[i * 4 + 2]];
      if (lit.has(c.join(','))) {
        candle++;
        continue;
      }
      const [h, s] = hsv(c);
      if (Math.max(...c) / 255 < 0.2) continue;
      most = Math.max(most, s);
      // (a colour that could be taken for a glow: the hero's cyan or the enemy's pink, bright enough to read as one;
      // the clay roofs' deepest shade is a dark wine, and no glow)
      if (s > 0.2) assert.ok(!(h > 160 && h < 205), `cyan at ${i}: ${c}`);
      if (s > 0.35 && Math.max(...c) / 255 >= 0.3) assert.ok(!(h > 300 && h < 350), `pink at ${i}: ${c}`);
    }
  }
  assert.ok(most < dullest, `the ward's richest colour ${most.toFixed(3)}, the dullest word ${dullest.toFixed(3)}`);
  assert.ok(candle > 0, 'a lit window somewhere');
});
