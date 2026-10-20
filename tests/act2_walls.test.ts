// ACT 2: THE WALLS STANDING WHOLE, SEEN THROUGH ROUND WHOEVER IS BEHIND THEM; FLOOR 11'S SLATE; THE GROUND FIRST AT A FLOOR'S
// START (the art chat, 20 Oct 2026). The owner, 20 Oct 2026, 07:41 Pacific: "Floor textures weren’t loaded at the beginning of
// levels", and "Level 11 needs some work.  The doorways are very hard to see, the roof and ground textures are hard to
// distinguish between.  All the 11-15 levels have weird slanting walls that I hate.  I know it’s so they don’t hide the
// character when he goes behind them but I just want that wall piece to go transparent when you walk behind it."; to their
// pictures: "Put everything in but the doorways.  With the new walls I think it’ll look fine".
//
//   npx tsx --test tests/act2_walls.test.ts

// @ts-ignore
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT2 } from '../src/game/act1';
import { makeDungeon } from '../src/game/level';
import type { Level } from '../src/game/state';
import { GW_SETT, GW_SLATE, GW_SLATE_FRESH, gateWardLook } from '../src/art/gateward';
import { paintTerrain, worldOf } from '../src/art/terrain';
import { paintStanding, standingBits, standingOf } from '../src/art/standing';
import { ACT2_WALLS, OPEN_FOR, WallWindows, wallsThick } from '../src/render/act2_walls';
import type { Window } from '../src/render/act2_walls';
import { OutdoorGround, gateWardLand, landTerrain } from '../src/render/outdoor';
import { shellMaker, houseDepth } from '../src/render/act2_houses';
import { T_FLOOR } from '../src/game/types';

ACT2.on = false;
function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
const floors = new Map<string, Level>();
const floorOf = (depth: number, seed = 3): Level => {
  const k = `${depth}:${seed}`;
  let L = floors.get(k);
  if (!L) {
    L = hush(() => makeDungeon(depth, seed));
    floors.set(k, L);
  }
  return L;
};

/** A spot of floor with a wall toward the eye just in front of it (rock along +y, two tiles deep), open floor behind it. */
function nearWallSpot(L: Level): [number, number] {
  const f = L.floor;
  const at = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < f.w && y < f.h && f.tiles[y * f.w + x] === T_FLOOR;
  for (let y = 4; y < f.h - 4; y++) {
    for (let x = 4; x < f.w - 4; x++) {
      if (!at(x, y) || !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y - 2)) continue;
      if (at(x, y + 1) || at(x, y + 2) || at(x - 1, y + 1) || at(x + 1, y + 1)) continue;
      return [x, y];
    }
  }
  throw new Error('no near wall');
}

test('the switch: on at his word; which floors stand whole, and how far', () => {
  assert.equal(ACT2_WALLS.on, true);
  const kinds: [number, number][] = [
    [11, Infinity],
    [12, 1],
    [13, 0],
    [14, 1],
    [15, 1],
  ];
  for (const [d, thick] of kinds) assert.equal(wallsThick(floorOf(d).land!), thick, `floor ${d}`);
  ACT2_WALLS.on = false;
  try {
    for (const [d] of kinds) assert.equal(wallsThick(floorOf(d).land!), 0, `floor ${d}, off`);
  } finally {
    ACT2_WALLS.on = true;
  }
});

test('what stands whole: only rock, in front of what it covers, a tile thick on the floors of rooms; the Gate Ward\'s every house', () => {
  for (const d of [14, 15, 12, 11]) {
    const L = floorOf(d);
    const T = landTerrain(L.land!, L.floor, true);
    const thick = wallsThick(L.land!);
    const stands = standingOf(T, thick);
    // (a tile thick: the rock against the floor stands, the rock two tiles out does not; on floor 11 all rock does)
    const [sx, sy] = nearWallSpot(L);
    assert.ok(stands(sx + 0.5, sy + 1.4), `floor ${d}: the wall against the floor stands`);
    if (thick === 1) assert.ok(!stands(sx + 0.5, sy + 2.6) || T.ground(sx + 0.5, sy + 2.6), `floor ${d}: two tiles out, the dark beyond`);
    else assert.ok(!T.ground(sx + 0.5, sy + 2.6) ? stands(sx + 0.5, sy + 2.6) : true, 'floor 11: all of it');
    // a stretch of the picture round the spot
    const [px, py] = [Math.round((sx - sy) * 32), Math.round((sx + sy) * 16)];
    const x0 = (Math.floor((px - 256) / 128) * 128) | 0;
    const y0 = (Math.floor((py - 192) / 128) * 128) | 0;
    const W = 512;
    const H = 384;
    const g = paintTerrain(T, x0, y0, W, H);
    const s = paintStanding(T, stands, x0, y0, W, H);
    let n = 0;
    let overFloor = 0;
    for (let r = 0; r < H; r++) {
      for (let c = 0; c < W; c++) {
        const i = r * W + c;
        if (!s.rgba[i * 4 + 3]) {
          assert.equal(s.depth[i], -1);
          continue;
        }
        n++;
        // (it stands in front of what it covers: the ground's point there is further back than the rock it shows)
        const [x, y] = worldOf(x0 + c, y0 + r);
        // (its depth is its tile's middle, x + y + 1: the tile reaches to x + y + 2)
        assert.ok(s.depth[i] + 1 > x + y, `floor ${d}: a standing pixel in front of what it covers (${s.depth[i]} over ${(x + y).toFixed(2)})`);
        if (T.ground(x, y)) overFloor++;
        void g;
      }
    }
    assert.ok(n > 2000, `floor ${d}: something stands whole near the wall (${n} pixels)`);
    assert.ok(overFloor > 500, `floor ${d}: and it covers floor behind it (${overFloor})`);
    // the bits: every standing pixel in exactly one, of its own depth, each corner on an even pixel
    const bits = standingBits(s);
    let m = 0;
    for (const b of bits) {
      assert.equal((b.x0 - x0) % 2, 0);
      assert.equal((b.y0 - y0) % 2, 0);
      for (let r = 0; r < b.h; r++) {
        for (let c = 0; c < b.w; c++) {
          if (!b.rgba[(r * b.w + c) * 4 + 3]) continue;
          m++;
          assert.equal(s.depth[(b.y0 - y0 + r) * W + (b.x0 - x0 + c)], b.d);
        }
      }
    }
    assert.equal(m, n, `floor ${d}: the bits hold every standing pixel once`);
    assert.ok(new Set(bits.map((b) => b.d)).size === bits.length, 'one bit a line of tiles');
  }
});

test('the Millrace (floor 13) has no walls: nothing stands', () => {
  const L = floorOf(13);
  const T = landTerrain(L.land!, L.floor, true);
  const h = { x: L.floor.start.x, y: L.floor.start.y };
  const s = paintStanding(T, standingOf(T, 1), Math.round((h.x - h.y) * 32) - 128, Math.round((h.x + h.y) * 16) - 128, 256, 256);
  assert.equal(s.depth.filter((d) => d >= 0).length, 0);
});

test('a window: a bit with someone behind it opens round them over a fifth of a second, and shuts as fast when they are not', () => {
  const W = new WallWindows();
  const behind: Window = { x: 50, y: 50, rx: 30, ry: 40, d: 10 };
  const front: Window = { x: 50, y: 50, rx: 30, ry: 40, d: 30 };
  const away: Window = { x: 500, y: 50, rx: 30, ry: 40, d: 10 };
  // (a bit at depth 20 over the screen box 20..120 x 20..120)
  W.begin();
  assert.equal(W.holesOf('a', 20, 20, 20, 100, 100, [front, away], 0), null, 'no one behind it: not seen through');
  let t = 0;
  let h = W.holesOf('a', 20, 20, 20, 100, 100, [behind], t);
  for (let k = 0; k < 6; k++) {
    W.begin();
    h = W.holesOf('a', 20, 20, 20, 100, 100, [behind], (t += 0.05));
  }
  assert.ok(h && h.length === 1 && h[0].a === 1, `open after ${t.toFixed(2)} s`);
  assert.ok(OPEN_FOR >= 0.15 && OPEN_FOR <= 0.3);
  // he steps out in front of it: it shuts over OPEN_FOR, the last window kept while it does
  W.begin();
  h = W.holesOf('a', 20, 20, 20, 100, 100, [front], (t += 0.05));
  assert.ok(h && h[0].a < 1 && h[0].a > 0 && h[0].x === 50, 'shutting');
  for (let k = 0; k < 6; k++) {
    W.begin();
    h = W.holesOf('a', 20, 20, 20, 100, 100, [front], (t += 0.05));
  }
  assert.equal(h, null, 'shut');
});

test('floor 11: the slate set apart from the street (darker and bluer than any sett), only with the switch\'s look', () => {
  for (const c of GW_SLATE_FRESH) {
    assert.ok(c[2] - c[0] >= 14, `blue: ${c}`);
    const lum = (k: readonly number[]): number => 0.3 * k[0] + 0.59 * k[1] + 0.11 * k[2];
    assert.ok(lum(c) < lum(GW_SETT[3]), `darker than the street's middle tones: ${c}`);
  }
  // the old slate is the setts' own purple grey: it is what the look had, and has with the switch off
  assert.ok(GW_SLATE.some((c) => c[0] >= c[2] - 20));
  const L = floorOf(11);
  const now = gateWardLook(gateWardLand(L.land!, L.floor, false), 'open');
  const fresh = gateWardLook(gateWardLand(L.land!, L.floor, true), 'open');
  let differ = 0;
  for (let k = 0; k < 400; k++) {
    const x = 3 + (k % 20) * 1.7;
    const y = 3 + Math.floor(k / 20) * 1.3;
    const a = now.top(x, y, 0, 0, 0.5, 0);
    const b = fresh.top(x, y, 0, 0, 0.5, 0);
    if (a.join() !== b.join()) differ++;
  }
  assert.ok(differ > 40 && differ < 300, `some roofs are slate, the rest clay as they were (${differ} of 400 differ)`);
});

test('floor 11: a house walked into stands whole over the street behind it, never over the street before it', () => {
  const L = floorOf(11, 5);
  const land = L.land!;
  const f = L.floor;
  const open = landTerrain(land, f, true);
  const mk = shellMaker(gateWardLand(land, f, true), open, true);
  let behindAll = 0;
  for (let n = 0; n < mk.count; n++) {
    const h = land.houses![n];
    const sh = mk.make(n);
    const D = houseDepth(h);
    let behind = 0;
    let before = 0;
    for (let i = 0; i < sh.w * sh.h; i++) {
      if (!sh.rgba[i * 4 + 3]) continue;
      const [x, y] = worldOf(sh.x0 + (i % sh.w), sh.y0 + Math.floor(i / sh.w));
      if (!open.ground(x, y)) continue;
      const inIt = x >= h.room[0] - 0.01 && y >= h.room[1] - 0.01 && x <= Math.max(h.room[2], h.front.along === 'y' ? h.front.at + 1 : 0) && y <= Math.max(h.room[3], h.front.along === 'x' ? h.front.at + 1 : 0);
      if (inIt) continue;
      if (x + y < D - 1) behind++;
      if (x + y > D + 0.5) before++;
    }
    assert.equal(before, 0, `house ${n}: nothing of it over the street before it`);
    behindAll += behind;
  }
  assert.ok(behindAll > 200, `the houses' roofs over the streets behind them (${behindAll} pixels)`);
});

test('the ground at a floor\'s start: the pieces round the screen wanted before the monsters\' pictures, a piece on the screen wanted again sooner', () => {
  const L = floorOf(14);
  const asked: [number, number, number][] = [];
  const fake = {
    state: 'on',
    groundReady: () => true,
    groundBegin: () => 7,
    groundPiece: (_id: number, i: number, j: number, pri: number) => {
      asked.push([i, j, pri]);
      return true;
    },
    toGround: null,
  };
  const o = new OutdoorGround();
  o.painterOf = () => fake as never;
  o.begin(L.land!, L.floor);
  const cam = { ox: -100, oy: -200, lift: null } as never;
  // (not the floor's first frame: what is not painted is asked of the worker)
  (o as unknown as { camWas: unknown }).camWas = { ox: -100, oy: -200 };
  const g = { drawImage: () => undefined, fillRect: () => undefined, fillStyle: '' } as unknown as CanvasRenderingContext2D;
  o.draw(g, cam, 200, 120, false);
  const screen = asked.filter((a) => a[2] === 0);
  const ahead = asked.filter((a) => a[2] > 0);
  assert.ok(screen.length >= 4, `the screen's pieces wanted at once (${screen.length})`);
  assert.ok(ahead.length > 10 && ahead.every((a) => a[2] > 1 && a[2] < 1.5), 'those round it before the monsters (2) and the houses (1.5)');
  // nearest first
  for (let k = 1; k < ahead.length; k++) assert.ok(ahead[k][2] >= ahead[k - 1][2]);
  // the camera moves: a piece asked for ahead, now on the screen, is wanted again at 0; a piece is asked again only sooner
  const n = asked.length;
  o.draw(g, { ox: -100 - 64, oy: -200, lift: null } as never, 200, 120, false);
  const again = asked.slice(n).filter((a) => a[2] === 0);
  assert.ok(again.length >= 1, 'a piece come on the screen wanted sooner');
  for (const a of again) assert.ok(ahead.some((b) => b[0] === a[0] && b[1] === a[1]), 'one that was wanted ahead before');
  for (const a of asked.slice(n)) {
    const was = asked.slice(0, n).filter((b) => b[0] === a[0] && b[1] === a[1]);
    for (const b of was) assert.ok(a[2] < b[2], `asked again only sooner: ${a} after ${b}`);
  }
});
