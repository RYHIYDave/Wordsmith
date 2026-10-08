// The dungeon's own pictures, as the game shows them (Version 14.1).
//
// The owner, 4 Oct 2026: "we need the dungeons and mobs brought up to the level of the character
// models". The monsters were Version 14.0. This is what they stand on and between: the floor and
// the walls (src/art/ground.ts) and what stands or lies in a dungeon (src/art/props.ts), painted
// at the heroes' grain. Every one of those pictures is painted here, a plain painting standing in
// for the canvas (tests/helpers.ts), and held to what the game needs of it:
//   - a floor tile is exactly its diamond, so that the tiles meet without a gap or an overlap;
//   - the flagstones are laid on the world, not on the tiles, and their pattern comes round;
//   - a wall is lit on the left and shaded on the right (as a whole block of its height with a
//     capstone, it is the look the game had until Version 18.3: tests/walls.test.ts holds the
//     look in force since 18.4, in which a wall is its faces alone);
//   - everything is in its theme's colours, and another theme paints another dungeon;
//   - what stands has its foot on the floor point the game puts it at, what lies is laid by its middle;
//   - a fire and an open portal give light, a shut one gives none, and none of it is an enemy's pink.
//   run: tsx --test tests/ground.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { VAULT, WALLS_BLOCKS, WALL_LOOK, makeGroundArt, setWallLook } from '../src/art/ground';
import type { GroundArt, Theme, WallLook } from '../src/art/ground';
import { GRAIN, PLUM, SPARK } from '../src/art/kit';
import { FLAME, SOCKET } from '../src/art/mkit';
import { EMBER, makeDungeonProps } from '../src/art/props';
import { LOW_WALL_H, WALL_H } from '../src/engine/iso';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const GROUND = makeGroundArt();
const PROPS = makeDungeonProps();
// THE WALLS (Version 18.4). In the look in force a wall is its faces alone, 40 pixels high and
// fading into the dark at the top (tests/walls.test.ts). The look the game had until Version 18.3
// (art/ground.ts, WALLS_BLOCKS: a block with a capstone, cut down low toward the eye) is kept in
// the code, should the owner want it back; the tests here that are of a wall as a block are of
// that look: painted under it, and the look in force put back after.
function paintedUnder(look: Readonly<WallLook>, theme?: Theme): GroundArt {
  const was = { ...WALL_LOOK };
  setWallLook(look);
  try {
    return theme ? makeGroundArt(theme) : makeGroundArt();
  } finally {
    setWallLook(was);
  }
}
const BLOCKS = paintedUnder(WALLS_BLOCKS);
/** A tile in picture pixels. */
const TW = 32 * GRAIN;
const TH = 16 * GRAIN;

/** Every colour in a painting, with how many pixels are that colour. */
function colours(s: Sprite): Map<string, number> {
  const p = paintingOf(s);
  const out = new Map<string, number>();
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c !== null) out.set(c, (out.get(c) ?? 0) + 1);
    }
  }
  return out;
}

/** How light a colour is, 0..255. */
function light(c: string): number {
  const v = rgba(c);
  return 0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2];
}

/** The mean lightness of the painted pixels in a box of a painting. */
function meanLight(s: Sprite, x0: number, y0: number, x1: number, y1: number): number {
  const p = paintingOf(s);
  let sum = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const c = p.get(x, y);
      if (c === null) continue;
      sum += light(c);
      n++;
    }
  }
  return n ? sum / n : 0;
}

/** The first and last painted row of a painting. */
function rows(s: Sprite): [number, number] {
  const p = paintingOf(s);
  let top = -1;
  let bottom = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      if (!p.has(x, y)) continue;
      if (top < 0) top = y;
      bottom = y;
      break;
    }
  }
  return [top, bottom];
}

test('a floor tile is exactly its diamond: tiles meet without a gap or an overlap', () => {
  for (let ty = 0; ty < 10; ty++) {
    for (let tx = 0; tx < 10; tx++) {
      const s = GROUND.floor(tx, ty);
      const p = paintingOf(s);
      assert.equal(p.w, TW, 'a tile is 64 picture pixels across');
      assert.equal(p.h, TH, 'and 32 down');
      assert.equal(s.w, 32, 'which is 32 game pixels');
      assert.equal(s.h, 16);
      assert.equal(s.ax, 16, 'laid by the top corner of its diamond');
      assert.equal(s.ay, 0);
      for (let y = 0; y < TH; y++) {
        // rows 2, 6, 10 ... 62 pixels wide and back: the first builds' diamond at twice the size
        const hw = y < TH / 2 ? 2 * y + 1 : 2 * (TH - 1 - y) + 1;
        for (let x = 0; x < TW; x++) {
          const inside = x >= TW / 2 - hw && x < TW / 2 + hw;
          assert.equal(p.has(x, y), inside, `tile ${tx},${ty}: pixel ${x},${y} ${inside ? 'is' : 'is not'} floor`);
        }
      }
    }
  }
});

test('the diamonds of neighbouring tiles fit together', () => {
  // A tile's neighbours are 32 across and 16 down from it (picture pixels). Lay a block of
  // diamonds down as the game does and every pixel inside it is covered exactly once.
  const N = 4;
  const W = (N + 1) * TW;
  const H = (N + 1) * TH;
  const count = new Uint8Array(W * H);
  for (let ty = 0; ty < N; ty++) {
    for (let tx = 0; tx < N; tx++) {
      const p = paintingOf(GROUND.floor(tx, ty));
      const ox = W / 2 + (tx - ty) * (TW / 2) - TW / 2;
      const oy = (tx + ty) * (TH / 2);
      for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) if (p.has(x, y)) count[(oy + y) * W + ox + x]++;
    }
  }
  let twice = 0;
  let holes = 0;
  // (inside the block: the diamond of half-diagonals N/2 tiles round its middle, less a pixel's margin)
  const cy = (N * TH) / 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = count[y * W + x];
      if (c > 1) twice++;
      const d = Math.abs(x + 0.5 - W / 2) / ((N * TW) / 2) + Math.abs(y + 0.5 - cy) / ((N * TH) / 2);
      if (d < 0.97 && c === 0) holes++;
    }
  }
  assert.equal(twice, 0, 'no pixel is painted by two tiles');
  assert.equal(holes, 0, 'and none inside the block is left unpainted');
});

test('the flagstones are laid on the world: a tile is painted by where it is, and the pattern comes round', () => {
  assert.ok(GROUND.floor(3, 4) === GROUND.floor(13, 4), 'ten tiles on, the same picture');
  assert.ok(GROUND.floor(3, 4) === GROUND.floor(3, 24));
  assert.ok(GROUND.floor(-1, -1) === GROUND.floor(9, 9), 'and it does not matter that a place is before the first tile');
  assert.ok(GROUND.floor(0, 0) !== GROUND.floor(1, 0));
  // eight stones cross five tiles, so a tile's joints fall in a different place from its neighbour's
  let different = 0;
  for (let ty = 0; ty < 10; ty++) for (let tx = 0; tx < 9; tx++) if (unlike(GROUND.floor(tx, ty), GROUND.floor(tx + 1, ty)) > 100) different++;
  assert.ok(different >= 85, `neighbouring tiles are different pictures (${different} of 90 pairs)`);
  // a joint that leaves a tile by one edge comes into the next by the edge they share: the row of
  // pixels along the lower right edge of a tile and the row along the upper left edge of the next
  // are a pixel apart, and mortar runs on from one into the other
  let joints = 0;
  let carried = 0;
  for (let ty = 0; ty < 10; ty++) {
    for (let tx = 0; tx < 10; tx++) {
      const a = paintingOf(GROUND.floor(tx, ty));
      const b = paintingOf(GROUND.floor(tx + 1, ty));
      for (let i = 2; i < 14; i++) {
        // a's lower right edge: from its right corner down to its bottom corner
        const ax = TW - 2 - 2 * i;
        const ay = TH / 2 + i;
        if (a.get(ax, ay) !== VAULT.mortar || a.get(ax - 2, ay - 1) !== VAULT.mortar) continue;
        joints++;
        // the same place seen from the next tile (which lies 32 right and 16 down): just across the edge
        const near = [0, 1, 2, 3].some((k) => b.get(ax - TW / 2 + k, ay - TH / 2 + 1) === VAULT.mortar || b.get(ax - TW / 2 + k, ay - TH / 2) === VAULT.mortar);
        if (near) carried++;
      }
    }
  }
  assert.ok(joints > 40, `joints do reach the edges of tiles (${joints})`);
  assert.ok(carried >= joints * 0.9, `and are carried on by the next tile (${carried} of ${joints})`);
});

test('the floor is flat colour in its theme\'s tones, and not all one tone', () => {
  const allowed = new Set<string>([VAULT.mortar, ...VAULT.slab]);
  const seen = new Map<string, number>();
  for (let ty = 0; ty < 10; ty++) {
    for (let tx = 0; tx < 10; tx++) {
      for (const [c, n] of colours(GROUND.floor(tx, ty))) {
        assert.ok(allowed.has(c), `${c} is one of the theme's floor colours`);
        seen.set(c, (seen.get(c) ?? 0) + n);
      }
    }
  }
  const all = [...seen.values()].reduce((a, b) => a + b, 0);
  for (const c of allowed) assert.ok((seen.get(c) ?? 0) > all * 0.04, `${c} is a real part of the floor`);
  // (the joints are the darkest of it, and thin)
  assert.ok((seen.get(VAULT.mortar) ?? 0) < all * 0.25, 'the joints are not a quarter of the floor');
  for (const c of VAULT.slab) assert.ok(light(c) > light(VAULT.mortar), 'a stone is lighter than its joint');
});

test('the look until Version 18.3, kept in the code: a wall is a whole block of its height with three distinct faces: the top lightest, the left medium, the right in shade', () => {
  const sets: [Sprite[], number, string][] = [
    [BLOCKS.wallsTall, WALL_H, 'a whole wall'],
    [BLOCKS.wallsLow, LOW_WALL_H, 'a wall cut down low'],
  ];
  for (const [list, height, what] of sets) {
    assert.ok(list.length >= 3, `${what} has several faces to it`);
    for (const s of list) {
      const p = paintingOf(s);
      const h = height * GRAIN;
      assert.equal(p.w, TW);
      assert.equal(p.h, TH + h, `${what} is its top and ${height} game pixels of face`);
      assert.equal(s.ax, 16);
      assert.equal(s.ay, height, 'it stands with the diamond of its foot on its tile');
      // its two faces hang from the lower edges of its top, whole, down to its foot
      for (let x = 1; x <= TW - 2; x++) {
        const xx = x < TW / 2 ? x : TW - 1 - x;
        const edge = Math.floor((xx + TW / 2 - 1) / 2);
        for (let k = 1; k <= h; k++) assert.ok(p.has(x, edge + k), `${what}: its face is whole at ${x},${edge + k}`);
        assert.ok(!p.has(x, edge + h + 1), `${what}: and ends at its foot`);
      }
      const left = meanLight(s, 2, TH / 2 + 2, TW / 2 - 1, TH + h);
      const right = meanLight(s, TW / 2 + 1, TH / 2 + 2, TW - 2, TH + h);
      assert.ok(left > right * 1.3, `${what}: the left face is the middle tone and the right one is in shade (${left.toFixed(1)} against ${right.toFixed(1)})`);
      // THE TOP IS THE LIGHTEST OF THE THREE (the owner, 6 Oct 2026: "a lighter Top face (catching
      // light), a medium Left face, and a darker Right face (in shadow)"). Up to Version 16 it
      // was the darkest, and this test held it so.
      const top = meanLight(s, TW / 2 - 8, 4, TW / 2 + 8, TH / 2);
      assert.ok(top > left * 1.15, `${what}: its top is the lightest face (${top.toFixed(1)} against ${left.toFixed(1)} on the left)`);
      // (and its two near edges, which catch the light, are lighter than the middle of it)
      const p2 = paintingOf(s);
      const lip = p2.get(TW / 2, TH - 2);
      const mid = p2.get(TW / 2, TH / 2 - 2);
      assert.ok(lip !== null && mid !== null && light(lip) > light(mid), `${what}: a lit lip along the top's near edges`);
    }
  }
  // a low wall shows the foot of the same stonework as a whole one: the lines of the courses meet
  const tall = paintingOf(BLOCKS.wallsTall[0]);
  const low = paintingOf(BLOCKS.wallsLow[0]);
  const dy = (WALL_H - LOW_WALL_H) * GRAIN;
  let same = 0;
  let n = 0;
  for (let y = TH; y < low.h; y++) {
    for (let x = 1; x < TW - 1; x++) {
      if (!low.has(x, y)) continue;
      n++;
      if (low.get(x, y) === tall.get(x, y + dy)) same++;
    }
  }
  assert.ok(same > n * 0.97, `the foot of a whole wall and a low wall are the same stones (${same} of ${n})`);
});

test('the walls are in their theme\'s tones', () => {
  // (the look in force: a wall is its faces, of the lit stone and of the shaded stone)
  const stone = new Set<string>([...VAULT.lit, ...VAULT.shade]);
  for (const s of [...GROUND.faceLeft, ...GROUND.faceRight]) for (const c of colours(s).keys()) assert.ok(stone.has(c), `${c} is one of the theme's stone colours`);
  // (the look until Version 18.3: blocks, with a capstone)
  const allowed = new Set<string>([...VAULT.lit, ...VAULT.shade, ...VAULT.cap, ...VAULT.capLow]);
  for (const s of [...BLOCKS.wallsTall, ...BLOCKS.wallsLow]) for (const c of colours(s).keys()) assert.ok(allowed.has(c), `${c} is one of the theme's wall colours`);
});

test('the shadow of a wall lies along the edge of the tile that the wall stands over', () => {
  const alpha = (s: Sprite, x: number, y: number): number => paintingOf(s).d[(y * TW + x) * 4 + 3];
  const sumIn = (s: Sprite, pick: (x: number, y: number) => boolean): number => {
    let n = 0;
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) if (pick(x, y)) n += alpha(s, x, y);
    return n;
  };
  for (const s of [GROUND.shadeLeft, GROUND.shadeRight, GROUND.shadeCorner]) {
    const p = paintingOf(s);
    assert.equal(p.w, TW);
    assert.equal(p.h, TH);
    assert.equal(s.ax, 16);
    assert.equal(s.ay, 0);
    // (nothing outside the diamond, and never so dark that the floor is lost under it)
    for (let y = 0; y < TH; y++) {
      const hw = y < TH / 2 ? 2 * y + 1 : 2 * (TH - 1 - y) + 1;
      for (let x = 0; x < TW; x++) {
        const a = alpha(s, x, y);
        if (x < TW / 2 - hw || x >= TW / 2 + hw) assert.equal(a, 0, 'a shadow does not leave its tile');
        assert.ok(a <= 140, 'a shadow leaves the floor to be seen');
      }
    }
  }
  // a wall up and to the left: the shadow is on the upper left half of the tile, and broad
  const leftHalf = (x: number, y: number): boolean => x < TW / 2 && y < TH / 2;
  const rightHalf = (x: number, y: number): boolean => x >= TW / 2 && y < TH / 2;
  const lowerHalf = (_x: number, y: number): boolean => y >= TH / 2 + 4;
  assert.ok(sumIn(GROUND.shadeLeft, leftHalf) > 3 * sumIn(GROUND.shadeLeft, rightHalf), 'the left shadow is on the left');
  assert.ok(sumIn(GROUND.shadeRight, rightHalf) > 3 * sumIn(GROUND.shadeRight, leftHalf), 'the right shadow is on the right');
  assert.ok(sumIn(GROUND.shadeLeft, () => true) > 1.5 * sumIn(GROUND.shadeRight, () => true), 'the light is from the left: the wall on that side throws the broader shadow');
  assert.equal(sumIn(GROUND.shadeCorner, lowerHalf), 0, 'a wall straight above darkens only the top corner');
  assert.ok(sumIn(GROUND.shadeCorner, () => true) > 0);
});

test('another theme paints another dungeon through the same painters', () => {
  const frost: Theme = {
    id: 'test',
    mortar: '#102030',
    slab: ['#203040', '#304050', '#405060', '#506070'],
    slabs: 1.25,
    cap: ['#485868', '#8898a8', '#a0b0c0', '#98a8b8', '#c0d0e0'],
    capLow: ['#384858', '#687888', '#8090a0', '#788898', '#a0b0c0'],
    lit: ['#283848', '#485868', '#687888', '#586878', '#8898a8'],
    shade: ['#182838', '#283848', '#384858', '#304050', '#506070'],
  };
  const g = makeGroundArt(frost);
  const mine = new Set<string>([frost.mortar, ...frost.slab, ...frost.lit, ...frost.shade, ...frost.cap, ...frost.capLow]);
  // (the floor, a wall's two faces as the look in force paints them, and the blocks of the look the game had)
  const gb = paintedUnder(WALLS_BLOCKS, frost);
  for (const s of [g.floor(0, 0), g.floor(4, 7), ...g.faceLeft, ...g.faceRight, ...gb.wallsTall, ...gb.wallsLow]) for (const c of colours(s).keys()) assert.ok(mine.has(c), `${c} is the other theme's`);
  // (stones of another size: four to five tiles)
  assert.ok(unlike(g.floor(0, 0), GROUND.floor(0, 0)) > 500);
  // and what is made of the dungeon's stone is made of this one's
  const p = makeDungeonProps(frost);
  const stone = new Set<string>([...frost.lit, ...frost.shade]);
  for (const [name, s] of [['the pillar', p.pillar], ['the portal', p.portalOff], ['rubble', p.rubble[0]]] as const) {
    let n = 0;
    let all = 0;
    for (const [c, k] of colours(s)) {
      all += k;
      if (stone.has(c)) n += k;
    }
    assert.ok(n > all * 0.3, `${name} is of the theme's stone (${n} of ${all} pixels)`);
    for (const c of colours(s).keys()) assert.ok(!new Set<string>([...VAULT.lit, ...VAULT.shade]).has(c), `${name} has none of the vault's stone in it`);
  }
});

/** What stands in a dungeon: [name, picture]. */
const STANDING: [string, Sprite][] = [
  ...PROPS.brazier.map((s, i): [string, Sprite] => [`brazier ${i}`, s]),
  ['chest', PROPS.chest],
  ['open chest', PROPS.chestOpen],
  ['barrel', PROPS.barrel],
  ['urn', PROPS.urn],
  ['pillar', PROPS.pillar],
  ...PROPS.portal.map((s, i): [string, Sprite] => [`portal ${i}`, s]),
  ['shut portal', PROPS.portalOff],
];
/** What lies on its floor. */
const LYING: [string, Sprite][] = [
  ...PROPS.bones.map((s, i): [string, Sprite] => [`bones ${i}`, s]),
  ...PROPS.rubble.map((s, i): [string, Sprite] => [`rubble ${i}`, s]),
  ...PROPS.staves.map((s, i): [string, Sprite] => [`staves ${i}`, s]),
  ...PROPS.shards.map((s, i): [string, Sprite] => [`shards ${i}`, s]),
  ['the fallen wordsmith', PROPS.fallen],
  ['the fallen wordsmith, searched', PROPS.fallenSearched],
];

test('every picture of the dungeon is painted at the heroes\' grain', () => {
  const all: [string, Sprite][] = [
    ['floor', GROUND.floor(0, 0)],
    ['a wall\'s left face', GROUND.faceLeft[0]],
    ['a wall\'s right face', GROUND.faceRight[0]],
    ['the flat wall across a cut tile', GROUND.part.far.tall],
    ['a wall as a block (the look until Version 18.3)', BLOCKS.wallsTall[0]],
    ['a low wall (the same)', BLOCKS.wallsLow[0]],
    ['shadow', GROUND.shadeLeft],
    ...STANDING,
    ...LYING,
  ];
  for (const [name, s] of all) {
    assert.equal(s.density, GRAIN, `${name}: two picture pixels to a game pixel`);
    const p = paintingOf(s);
    assert.equal(p.w, s.w * GRAIN, `${name}: its width in game pixels is half its painting's`);
    assert.equal(p.h, s.h * GRAIN);
    assert.ok(Number.isInteger(s.w) && Number.isInteger(s.h), `${name}: it covers whole game pixels`);
    assert.ok(Number.isInteger(s.ax) && Number.isInteger(s.ay), `${name}: and is laid down on a whole one`);
  }
  assert.equal(PROPS.brazier.length, 4, 'the fire has the four frames the game turns through');
  assert.equal(PROPS.portal.length, 4, 'and so has the portal');
  assert.equal(PROPS.bones.length, 3);
  assert.equal(PROPS.rubble.length, 3);
});

/**
 * What is built on the grid (Version 14.5: "any sprite or doodad or whatever should always be seen
 * at an angle"): its floor point is the middle of its tile, and its nearest corner comes down the
 * screen from there by as much as it reaches along the grid. The rest (round things, which look
 * the same from every side) stand with their foot on the floor point, as before.
 */
const ON_THE_GRID = ['chest', 'open chest', 'pillar', 'portal 0', 'portal 1', 'portal 2', 'portal 3', 'shut portal'];

test('what stands has its foot on the floor point the game puts it at, or stands on the grid about the middle of its tile', () => {
  for (const [name, s] of STANDING) {
    const p = paintingOf(s);
    const [top, bottom] = rows(s);
    assert.ok(top >= 0, `${name} is painted`);
    assert.ok(top >= 1, `${name}: nothing is cut off at the top of its canvas`);
    const foot = s.ay * GRAIN;
    if (ON_THE_GRID.includes(name)) {
      // its nearest corner is below the middle of its tile, by less than a tile is deep (16 game pixels)
      assert.ok(bottom > foot + 3 && bottom <= foot + 16 * GRAIN, `${name}: its nearest corner (row ${bottom}) is below the middle of its tile (${foot}), and inside a tile of it`);
      // and the middle of its tile is under it: that column is painted, at the floor point's own height or a little above
      let under = false;
      for (let y = foot - 12; y <= foot + 2 && !under; y++) if (p.has(s.ax * GRAIN, y)) under = true;
      assert.ok(under, `${name}: it stands over the middle of its tile`);
    } else {
      assert.ok(bottom >= foot - 3 && bottom <= foot + 1, `${name}: its lowest row (${bottom}) is at its foot (${foot})`);
      // and it stands over that point, not beside it
      let lo = p.w;
      let hi = -1;
      for (let y = bottom - 5; y <= bottom; y++) {
        for (let x = 0; x < p.w; x++) {
          if (!p.has(x, y)) continue;
          lo = Math.min(lo, x);
          hi = Math.max(hi, x);
        }
      }
      const mid = (lo + hi + 1) / 2;
      assert.ok(Math.abs(mid - s.ax * GRAIN) <= 2.5, `${name}: its foot (${lo}..${hi}) is over its floor point (${s.ax * GRAIN})`);
    }
    // nothing touches the sides of its canvas: nothing was cut off
    for (let y = 0; y < p.h; y++) assert.ok(!p.has(0, y) && !p.has(p.w - 1, y), `${name}: nothing is cut off at the sides`);
  }
  // what stands on the grid shows three of its faces: its top is lighter than the side that looks
  // left, and that side lighter than the one that looks right (the chest's wood, by its tones)
  {
    const p = paintingOf(PROPS.chest);
    const at = PROPS.chest.ax * GRAIN;
    let left = 0;
    let right = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c === PLUM[2]) (x < at ? left++ : right++);
    }
    assert.ok(left > right * 1.5, `the chest's lit wood is on the side that looks down the screen to the left (${left} pixels against ${right})`);
  }
  // the things a hero can walk behind are no wider than a tile; the portal is one tile wide
  for (const [name, s] of STANDING) assert.ok(s.w <= 32, `${name} is no wider than a tile (${s.w})`);
  // a pillar is a hero's height and more (taller than a whole wall was until Version 18.3: since 18.4
  // the walls rise past it and are lost in the dark); a barrel comes up to the waist
  assert.ok(PROPS.pillar.ay > WALL_H + 8);
  assert.ok(PROPS.barrel.ay < 22 && PROPS.barrel.ay > 12);
});

test('what lies on the floor is laid by its middle, and is small', () => {
  for (const [name, s] of LYING) {
    const p = paintingOf(s);
    let n = 0;
    let sx = 0;
    let sy = 0;
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.w; x++) {
        if (!p.has(x, y)) continue;
        n++;
        sx += x + 0.5;
        sy += y + 0.5;
      }
    }
    assert.ok(n > 40, `${name} is painted (${n} pixels)`);
    assert.ok(Math.abs(sx / n - s.ax * GRAIN) < p.w * 0.2, `${name}: its middle is where it is laid (across)`);
    assert.ok(Math.abs(sy / n - s.ay * GRAIN) < p.h * 0.25, `${name}: (and down)`);
    // (the fallen wordsmith lies along the grid, head up the screen and feet down it: a tile wide, and as tall as that makes them)
    if (name.startsWith('the fallen')) assert.ok(s.w <= 32 && s.h <= 36, `${name} lies along the grid, within a tile's width (${s.w} by ${s.h})`);
    else assert.ok(s.w <= 32 && s.h <= 20, `${name} lies within a tile`);
  }
});

test('the fire burns, the portal stirs, and a thing opened or searched looks it', () => {
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    assert.ok(unlike(PROPS.brazier[i], PROPS.brazier[j]) > 60, `the fire's frames ${i} and ${j} differ`);
    assert.ok(unlike(PROPS.portal[i], PROPS.portal[j]) > 200, `the portal's frames ${i} and ${j} differ`);
  }
  // (only the fire moves: the dish and its legs stay where they are)
  const a = paintingOf(PROPS.brazier[0]);
  const b = paintingOf(PROPS.brazier[2]);
  let moved = 0;
  for (let y = 30; y < a.h; y++) for (let x = 0; x < a.w; x++) if (a.get(x, y) !== b.get(x, y)) moved++;
  assert.equal(moved, 0, 'below its rim the brazier is the same in every frame');
  assert.ok(unlike(PROPS.chest, PROPS.chestOpen) > 200, 'an open chest is not a shut one');
  assert.ok(unlike(PROPS.portalOff, PROPS.portal[0]) > 500, 'nor a shut portal an open one');
  assert.ok(unlike(PROPS.fallen, PROPS.fallenSearched) > 30, 'a searched body shows it');
  // the variants of what lies about are different pictures
  for (const list of [PROPS.bones, PROPS.rubble, PROPS.staves, PROPS.shards]) for (let i = 1; i < list.length; i++) assert.ok(unlike(list[0], list[i]) > 30);
});

test('a fire and an open portal give light: an honest fire\'s orange, the player\'s cyan, never an enemy\'s pink', () => {
  const pink = new Set<string>([SOCKET, ...FLAME]);
  for (const s of PROPS.brazier) {
    const lights = s.lights ?? [];
    assert.equal(lights.length, 1, 'a brazier gives light');
    const l = lights[0];
    assert.ok((EMBER as readonly string[]).includes(l.color), 'in the orange of a fire');
    assert.ok(!pink.has(l.color), 'which is not an enemy\'s');
    // the light is in the flames: above the dish, over its middle
    assert.ok(Math.abs(l.x - s.ax) <= 2 && l.y < s.ay - 10 && l.y > 0, 'and it is in the fire');
  }
  for (const s of PROPS.portal) {
    const lights = s.lights ?? [];
    assert.equal(lights.length, 1, 'an open portal gives light');
    assert.ok((SPARK as readonly string[]).includes(lights[0].color), 'in the cyan of what is the player\'s');
  }
  assert.ok(!PROPS.portalOff.lights, 'a shut portal gives none');
  for (const s of [PROPS.chest, PROPS.chestOpen, PROPS.barrel, PROPS.urn, PROPS.pillar]) assert.ok(!s.lights, 'and nothing else in a dungeon glows');
  // no enemy pink is painted on anything that stands in a dungeon either
  for (const [name, s] of [...STANDING, ...LYING]) for (const c of colours(s).keys()) assert.ok(!pink.has(c) || (EMBER as readonly string[]).includes(c), `${name}: ${c} is not an enemy's colour`);
});
