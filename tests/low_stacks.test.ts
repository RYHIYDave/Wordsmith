// FLOOR 15'S STACKS, THE SHELVES ONE BLOCK HIGH (src/art/low_stacks.ts; the art chat's, a mock-up nothing of the game imports;
// docs/mockups/low_stacks/README.md), held to what the main chat needs and to his rules:
//   1. the switch off, and nothing of the game imports the file;
//   2. the floor the ground is painted from: the rows' tiles floor, nothing else changed; the library's look, given the rows,
//      paints under them their room's floor (the stacks' boards), as it does none without;
//   3. THE ROWS STANDING LOW: painted only where a row is seen, never higher than a block (LOW_RISE) over its row; every pixel
//      opaque, its line of tiles across the screen its row tile's (x + y, plus 1); each row seen whole, its top and its faces
//      toward the eye; nothing cyan or pink, every colour as quiet as Act 2's places (Colour 3 and 4); two pieces side by side
//      one picture;
//   4. laid with the walls standing whole: at each pixel whichever is nearer the eye.
//   run: tsx --test tests/low_stacks.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { LOW_RISE, LOW_STACKS, lowStacksFloor, paintLowStacks, rowsOf, withLowStacks } from '../src/art/low_stacks';
import { LB_ZONE, greatLibraryLook } from '../src/art/library';
import { QUIET_MOST } from '../src/art/act2_quiet';
import type { StandingPiece } from '../src/art/standing';
import { pictureOf, worldOf } from '../src/art/terrain';
import { T_FLOOR, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';
import { hsv } from './floor_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void } = nodeAssert;

/** A stacks room laid by hand: rows along x, and rows along y, a tile thick, two tiles of aisle between. */
const W = 40;
const H = 34;
type Rect = [number, number, number, number];
const inR = (r: Rect, x: number, y: number): boolean => x >= r[0] && x < r[2] && y >= r[1] && y < r[3];
const ROOM: Rect = [4, 4, 34, 30];
const SHELVES: Rect[] = [];
for (let k = 2; k <= 11; k += 3) SHELVES.push([7, 4 + k, 18, 5 + k]);
for (let k = 2; k <= 11; k += 3) SHELVES.push([18 + k, 18, 19 + k, 27]);
const tiles = new Uint8Array(W * H).fill(T_WALL);
const mask = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (inR(ROOM, x, y)) tiles[y * W + x] = T_FLOOR;
    if (SHELVES.some((r) => inR(r, x, y))) {
      tiles[y * W + x] = T_WALL;
      mask[y * W + x] = 1;
    }
  }
}
const FLOOR = { depth: 15, seed: 15, w: W, h: H, tiles, cut: new Uint8Array(W * H), variant: new Uint8Array(W * H), rooms: [], start: { x: 0, y: 0 } } as unknown as Floor;
const rows = rowsOf(mask, W, H);

// the picture of the room: from its left corner to its right, its top corner to LOW_RISE under its bottom corner
const [lx] = pictureOf(ROOM[0], ROOM[3]);
const [rx] = pictureOf(ROOM[2], ROOM[1]);
const [, ty] = pictureOf(ROOM[0], ROOM[1]);
const [, by] = pictureOf(ROOM[2], ROOM[3]);
const X0 = Math.floor(lx / 2) * 2;
const Y0 = Math.floor((ty - LOW_RISE - 8) / 2) * 2;
const PW = Math.ceil(rx - X0) + 2;
const PH = Math.ceil(by - Y0) + 8;
const LOW = paintLowStacks(rows, X0, Y0, PW, PH);

// (TOLD BY THE MAIN CHAT, 23 Oct 2026: hooked in behind the switch, on his yes in the art chat by 13:06, “Yes, send to main
// (Recommended)”: the library's rules mark the rows and hang nothing on them, the ground paints them low, and the page's handle
// holds the switch for pictures. Still off until he says to put it live.)
// (ON, at his word in the main chat: his yes by 22:06, 23 Oct 2026, to the game's pictures: “Yes, next version (Recommended)”)
test('1. the switch on, and the game files that use it are the main chat\'s hooks', () => {
  assert.equal(LOW_STACKS.on, true, 'LOW_STACKS is on');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x: unknown) => String(x).replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/low_stacks.ts') continue;
    const dir = f.split('/').slice(0, -1);
    for (const [, spec] of (fs.readFileSync(path.join('src', f), 'utf8') as string).matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const bit of spec.split('/')) {
        if (bit === '..') parts.pop();
        else if (bit !== '.') parts.push(bit);
      }
      if (parts.join('/') === 'art/low_stacks') users.push(f);
    }
  }
  assert.equal([...new Set(users)].sort().join(' '), 'game/act2/library.ts main.ts render/outdoor.ts render/painter.ts', 'game files that import it');
});

test('2. the floor the ground is painted from: the rows floor, nothing else; under them the stacks\' own floor', () => {
  const low = lowStacksFloor(FLOOR, rows);
  let n = 0;
  for (let i = 0; i < W * H; i++) {
    if (mask[i]) {
      assert.equal(low.tiles[i], T_FLOOR, `row tile ${i} painted as floor`);
      n++;
    } else assert.equal(low.tiles[i], FLOOR.tiles[i], `tile ${i} as it was`);
  }
  assert.ok(n > 60, `the rows (${n} tiles)`);
  assert.equal(FLOOR.tiles[(4 + 2) * W + 8], T_WALL, 'the floor given is left as it was');
  // the look, given the rows, paints the stacks' boards under a row (as a hall's marble without them)
  const zone = (): number => LB_ZONE.Stacks;
  const withRows = greatLibraryLook({ floor: FLOOR, zone, rows });
  const without = greatLibraryLook({ floor: FLOOR, zone });
  const boards = greatLibraryLook({ floor: FLOOR, zone });
  const [px, py] = pictureOf(10.5, 6.5);
  const under = withRows.floor(10.5, 6.5, Math.round(px), Math.round(py), 1);
  const marble = without.floor(10.5, 6.5, Math.round(px), Math.round(py), 1);
  const [bx, byy] = pictureOf(10.5, 7.5);
  const aisle = boards.floor(10.5, 7.5, Math.round(bx), Math.round(byy), 1);
  const warm = (c: number[]): boolean => c[0] > c[2] + 4;
  assert.ok(warm(under) && warm(aisle), `the stacks' boards under the row (${under}) as in the aisle (${aisle})`);
  assert.ok(!warm(marble) || Math.abs(marble[0] - marble[2]) < 12, `a hall's marble there without the rows (${marble})`);
});

test('3. the rows standing low: only where a row is seen, a block high at most, opaque, at their own depth, quiet, one picture', () => {
  let painted = 0;
  const seen = new Set<number>();
  for (let r = 0; r < PH; r++) {
    for (let c = 0; c < PW; c++) {
      const i = r * PW + c;
      const d = LOW.depth[i];
      const a = LOW.rgba[i * 4 + 3];
      if (d < 0) {
        assert.equal(a, 0, `clear where no row is (${c}, ${r})`);
        continue;
      }
      painted++;
      assert.equal(a, 255, `opaque (${c}, ${r})`);
      // a row tile in front of it, no more than a block up: the ray from this pixel meets a row tile at a height 0 to LOW_RISE
      let hit = -1;
      for (let v = LOW_RISE; v >= 0 && hit < 0; v--) {
        const [x, y] = worldOf(X0 + c, Y0 + r + v);
        if (rows(Math.floor(x), Math.floor(y))) hit = Math.floor(x) + Math.floor(y) + 1;
      }
      assert.ok(hit >= 0, `a row there (${c}, ${r})`);
      assert.equal(d, hit, `its depth its row tile's (${c}, ${r})`);
      seen.add(d);
      const [R, G, B] = [LOW.rgba[i * 4], LOW.rgba[i * 4 + 1], LOW.rgba[i * 4 + 2]];
      const [h, s, v] = hsv(R, G, B);
      assert.ok(!(h >= 175 && h <= 200 && s > 0.55 && v > 0.6), `nothing cyan (${c}, ${r})`);
      assert.ok(!(h >= 320 && h <= 350 && s > 0.5 && v > 0.55), `nothing pink (${c}, ${r})`);
      const M = Math.max(R, G, B);
      assert.ok(M === 0 || (M - Math.min(R, G, B)) / M <= QUIET_MOST + 0.02, `as quiet as Act 2's places (${c}, ${r}: ${R}, ${G}, ${B})`);
    }
  }
  assert.ok(painted > 20000, `painted (${painted} pixels)`);
  // every row tile's top seen, at its middle a block up
  for (let ty0 = 0; ty0 < H; ty0++) {
    for (let tx0 = 0; tx0 < W; tx0++) {
      if (!mask[ty0 * W + tx0]) continue;
      const [px, py] = pictureOf(tx0 + 0.5, ty0 + 0.5);
      const c = Math.round(px) - X0;
      const r = Math.round(py) - LOW_RISE - Y0;
      assert.equal(LOW.depth[r * PW + c], tx0 + ty0 + 1, `the top of row tile (${tx0}, ${ty0}) seen`);
    }
  }
  // the faces toward the eye: under a row's near edge, half a block up
  const [fx, fy] = pictureOf(12.5, 7);
  const fi = (Math.round(fy) - LOW_RISE / 2 - Y0) * PW + (Math.round(fx) - X0);
  assert.equal(LOW.depth[fi], 12 + 6 + 1, 'a row along x seen from its lit side');
  const [gx, gy] = pictureOf(21, 22.5);
  const gi = (Math.round(gy) - LOW_RISE / 2 - Y0) * PW + (Math.round(gx) - X0);
  assert.equal(LOW.depth[gi], 20 + 22 + 1, 'a row along y seen from its shaded side');
  assert.ok(seen.size > 20, 'many lines of tiles');
  // two pieces side by side: the same pixels as one
  const half = Math.floor(PW / 4) * 2;
  const A = paintLowStacks(rows, X0, Y0, half, PH);
  const B = paintLowStacks(rows, X0 + half, Y0, PW - half, PH);
  let differ = 0;
  for (let r = 0; r < PH; r++) {
    for (let c = 0; c < PW; c++) {
      const P = c < half ? A : B;
      const cc = c < half ? c : c - half;
      const i = r * PW + c;
      const j = r * P.w + cc;
      if (P.depth[j] !== LOW.depth[i]) differ++;
      else for (let k = 0; k < 4; k++) if (P.rgba[j * 4 + k] !== LOW.rgba[i * 4 + k]) differ++;
    }
  }
  assert.equal(differ, 0, 'two pieces side by side are one picture');
});

test('4. laid with the walls standing whole: at each pixel whichever is nearer the eye', () => {
  const walls: StandingPiece = { x0: X0, y0: Y0, w: PW, h: PH, rgba: new Uint8ClampedArray(PW * PH * 4), depth: new Int32Array(PW * PH).fill(-1) };
  // a wall in front of everything over the left third, one behind everything over the middle third
  for (let r = 0; r < PH; r++) {
    for (let c = 0; c < PW; c++) {
      const i = r * PW + c;
      if (c < PW / 3) walls.depth[i] = 999;
      else if (c < (2 * PW) / 3) walls.depth[i] = 0;
      else continue;
      walls.rgba.set([1, 2, 3, 255], i * 4);
    }
  }
  const both = withLowStacks(walls, LOW);
  let nearer = 0;
  let low = 0;
  for (let i = 0; i < PW * PH; i++) {
    const c = i % PW;
    const want = c < PW / 3 ? 999 : LOW.depth[i] >= 0 ? LOW.depth[i] : c < (2 * PW) / 3 ? 0 : -1;
    assert.equal(both.depth[i], want, `pixel ${i}`);
    if (want === 999) nearer++;
    if (want >= 1 && want < 999) low++;
  }
  assert.ok(nearer > 0 && low > 0, 'both kinds there');
});
