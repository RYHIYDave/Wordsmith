// FLOOR 7, THE LEDGE ROAD: its ground (src/art/terrain.ts with the drop; the look src/art/ledge.ts) and its
// sky (paintSky), held to his rules before he sees them:
//   - his rule of the ledge (planning's mock-up with his yes, 12 Oct: “the rear wall is gone and that where you
//     see the sky”): past the road's far edge, nothing is painted, so the sky behind shows; the mountain in
//     front is cut away there too, so nothing stands over the drop beyond the road;
//   - nothing painted stands over the walkable floor (his rule for every level);
//   - the cliff's face hangs only under an edge that looks toward the eye over the drop, a little way;
//   - his art rulebook: no cyan and no pink in a place, duller than every word's colour, crisp pixels (every
//     pixel all there or not at all), light from the upper left;
//   - and what the main chat needs: two pieces side by side are one picture; the sky comes round seamlessly.
//   run: tsx --test tests/ledge.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { WORD_COLOR } from '../src/art/icons';
import { CLOUD, HANG_TALL, L_GRASS, L_ROAD, L_ROCK, L_STONE, SKY, SKY_WRAP, ledgeLook, paintSky } from '../src/art/ledge';
import { TK, clearOfFloor, paintTerrain, pictureOf, terrainOf, worldOf } from '../src/art/terrain';
import type { RGB, Terrain } from '../src/art/terrain';
import { T_FLOOR, T_PIT, T_WALL } from '../src/game/types';
import type { Floor } from '../src/game/types';

const LOOK_RISE = ledgeLook(() => false).rise;
const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as {
  ok(v: unknown, msg?: string): void;
  equal(a: unknown, b: unknown, msg?: string): void;
  deepEqual(a: unknown, b: unknown, msg?: string): void;
};

// Two ledges laid by hand.
// TRAIL, HIS (13 Oct: “it looks like your on a cliff side trail with cliff on top and bottom.  When you make a
// northwest turn, the sky would open up, it’s like your going around the mountain”; “I’d like the road to kinda
// wrap around the mountain not just float off into space”; “The mountain side goes all the way to the ground you
// would never see the ground under the cliff.  Only off the side of cliff as you round the mountain.”): the
// trail across the screen (x + y about 40), the mountain above it (rock tiles), the drop below it (pit tiles);
// at x - y = -4 it turns up the screen (along -x-y) round the mountain's corner, the mountain on its right
// (x - y over -4), the drop on its left.
// BEYOND, the first try (the planning mock-up's way): the road across, the drop past its far edge (up the
// screen), the mountain's slope toward the eye, cut away; it keeps what the painter does for that case.
const N = 48;
const segDist = (x: number, y: number, ax: number, ay: number, bx: number, by: number): number => {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
};
const wob = (x: number, y: number): number => 0.25 * Math.sin((x - y) / 3) + 0.15 * Math.sin((x + y) / 2.3);
const trailRoad = (x: number, y: number): boolean => Math.min(segDist(x, y, 18, 22, 46, -6), segDist(x, y, 18, 22, -4, 0)) < 1.84 + wob(x, y);
const trailDrop = (x: number, y: number): boolean => x + y > 40 || x - y < -4;
const beyondRoad = (x: number, y: number): boolean => Math.abs(x + y - 40 - 1.2 * Math.sin((x - y) / 5)) < 2.6;
const beyondDrop = (x: number, y: number): boolean => x + y < 40 + 1.2 * Math.sin((x - y) / 5);
function laid(road: (x: number, y: number) => boolean, beyond: (x: number, y: number) => boolean): { floor: Floor; drop: (tx: number, ty: number) => boolean } {
  const tiles = new Uint8Array(N * N).fill(T_WALL);
  for (let ty = 0; ty < N; ty++) {
    for (let tx = 0; tx < N; tx++) {
      if (road(tx + 0.5, ty + 0.5)) tiles[ty * N + tx] = T_FLOOR;
      else if (beyond(tx + 0.5, ty + 0.5)) tiles[ty * N + tx] = T_PIT;
    }
  }
  const floor = { depth: 7, seed: 7, w: N, h: N, tiles, cut: new Uint8Array(N * N), variant: new Uint8Array(N * N), rooms: [], start: { x: 20, y: 20 } } as unknown as Floor;
  const drop = (tx: number, ty: number): boolean => (tx >= 0 && ty >= 0 && tx < N && ty < N ? tiles[ty * N + tx] === T_PIT : beyond(tx + 0.5, ty + 0.5));
  return { floor, drop };
}

interface Painted { T: Terrain; x0: number; y0: number; w: number; h: number; rgba: Uint8ClampedArray; kind: Uint8Array }
function painted(road: (x: number, y: number) => boolean, beyond: (x: number, y: number) => boolean): Painted {
  const { floor, drop } = laid(road, beyond);
  const T = terrainOf(floor, ledgeLook(drop));
  // x - y from -18 to 24, x + y from 14 to 62
  const x0 = -18 * 32;
  const y0 = 14 * 16;
  const w = 42 * 32;
  const h = 48 * 16;
  const p = paintTerrain(T, x0, y0, w, h);
  return { T, x0, y0, w, h, rgba: p.rgba, kind: p.kind };
}
const TRAIL = painted(trailRoad, trailDrop);
const LEDGE = painted(beyondRoad, beyondDrop);
const kindOf = (P: Painted, c: number, r: number): number => P.kind[r * P.w + c];
/** The panel's column of x - y = d. */
const colOf = (P: Painted, d: number): number => d * 32 - P.x0;
/** The first and last floor pixel down a column. */
function floorIn(P: Painted, c: number): [number, number] {
  let a = 0;
  while (a < P.h && kindOf(P, c, a) !== TK.Floor) a++;
  let b = a;
  while (b + 1 < P.h && kindOf(P, c, b + 1) === TK.Floor) b++;
  return [a, b];
}

test('every road tile\'s middle is painted floor, and no drop or rock tile\'s', () => {
  for (const P of [TRAIL, LEDGE]) {
    const f = P.T.floor;
    for (let ty = 0; ty < N; ty++) {
      for (let tx = 0; tx < N; tx++) {
        const isFloor = f.tiles[ty * N + tx] === T_FLOOR;
        assert.equal(P.T.ground(tx + 0.5, ty + 0.5), isFloor, `tile ${tx},${ty}`);
        if (f.tiles[ty * N + tx] === T_PIT) assert.ok(P.T.drop(tx + 0.5, ty + 0.5), `pit tile ${tx},${ty} is the drop`);
        if (f.tiles[ty * N + tx] === T_WALL) assert.ok(!P.T.drop(tx + 0.5, ty + 0.5), `rock tile ${tx},${ty} is not the drop`);
      }
    }
  }
});

test('nothing painted stands over the walkable floor: a pixel is floor exactly where the ground is', () => {
  for (const P of [TRAIL, LEDGE]) {
    let floors = 0;
    for (let r = 0; r < P.h; r++) {
      for (let c = 0; c < P.w; c++) {
        const [x, y] = worldOf(P.x0 + c, P.y0 + r);
        const g = P.T.ground(x, y);
        if (g) floors++;
        assert.equal(kindOf(P, c, r) === TK.Floor, g, `pixel ${c},${r}`);
      }
    }
    assert.ok(floors > 30000, `there is road to see: ${floors}`);
  }
});

test('his trail: a cliff on top (the mountain\'s wall over it) and on the bottom (its face hanging under it, all the way down); off the side of the cliff past the turn, the view open', () => {
  const P = TRAIL;
  for (let d = 10; d <= 23; d++) {
    const c = colOf(P, d);
    const [a, b] = floorIn(P, c);
    let wall = 0;
    while (a - 1 - wall >= 0 && kindOf(P, c, a - 1 - wall) === TK.Face) wall++;
    assert.ok(wall >= LOOK_RISE - 4, `x - y = ${d}: the wall over the trail, ${wall} pixels`);
    for (let r = b + 1; r < P.h; r++) assert.equal(kindOf(P, c, r), TK.Hang, `x - y = ${d}, pixel ${r}: the cliff under the trail, all the way down`);
  }
  for (let d = -5; d <= -3; d++) {
    const c = colOf(P, d);
    const [, b] = floorIn(P, c);
    assert.ok(b < P.h - 1, `x - y = ${d}: the trail going up round the corner`);
    for (let r = b + 1; r < P.h; r++) assert.equal(kindOf(P, c, r), TK.Hang, `x - y = ${d}, pixel ${r}: the cliff under it, all the way down`);
  }
  for (let d = -17; d <= -8; d++) {
    const c = colOf(P, d);
    for (let r = 0; r < P.h; r++) assert.equal(kindOf(P, c, r), TK.Drop, `x - y = ${d}, pixel ${r}: open, off the side of the cliff`);
  }
});

test('the mountain looks like a mountain: above the wall its slopes climb, snow lying higher up and none at the wall\'s brow', () => {
  const P = TRAIL;
  const snow = new Set(['#a9adc0', '#c9cbd8', '#e8e8ee'].map((h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16)).join(',')));
  let high = 0;
  let low = 0;
  for (let d = 10; d <= 23; d++) {
    const c = colOf(P, d);
    const [a] = floorIn(P, c);
    let r = a - 1;
    while (r >= 0 && kindOf(P, c, r) === TK.Face) r--;
    // the brow: the first two dozen pixels of the top over the wall
    for (let k = 0; k < 24 && r - k >= 0; k++) {
      const i = ((r - k) * P.w + c) * 4;
      if (snow.has(`${P.rgba[i]},${P.rgba[i + 1]},${P.rgba[i + 2]}`)) low++;
    }
    for (let k = 24; r - k >= 0; k++) {
      const i = ((r - k) * P.w + c) * 4;
      if (kindOf(P, c, r - k) === TK.Top && snow.has(`${P.rgba[i]},${P.rgba[i + 1]},${P.rgba[i + 2]}`)) high++;
    }
  }
  assert.equal(low, 0, 'no snow at the brow');
  assert.ok(high > 300, `snow higher up: ${high} pixels`);
});

test('the first try\'s case: the drop past the road\'s far edge is clear, all of it; nothing of a cliff in front, cut away, stands over it', () => {
  let clear = 0;
  for (let c = 0; c < LEDGE.w; c++) {
    let r = 0;
    while (r < LEDGE.h && kindOf(LEDGE, c, r) !== TK.Floor) {
      assert.equal(kindOf(LEDGE, c, r), TK.Drop, `column ${c}, pixel ${r} over the road`);
      assert.equal(LEDGE.rgba[(r * LEDGE.w + c) * 4 + 3], 0, `column ${c}, pixel ${r} clear`);
      clear++;
      r++;
    }
    assert.ok(r < LEDGE.h, `column ${c} has road`);
  }
  assert.ok(clear > 100000, `the drop: ${clear} pixels`);
});

test('crisp: every pixel all there or not at all; clear only where the ground is the drop', () => {
  for (const P of [TRAIL, LEDGE]) {
    for (let i = 0; i < P.kind.length; i++) {
      const a = P.rgba[i * 4 + 3];
      assert.ok(a === 0 || a === 255, `pixel ${i}: alpha ${a}`);
      assert.equal(a === 0, P.kind[i] === TK.Drop, `pixel ${i}: clear exactly where it is the drop`);
      if (a === 0) {
        const [x, y] = worldOf(P.x0 + (i % P.w), P.y0 + Math.floor(i / P.w));
        assert.ok(P.T.drop(x, y), `pixel ${i}: clear over the drop`);
      }
    }
  }
});

test('the cliff\'s face hangs only under an edge over the drop that looks toward the eye, no further than its height; none where the drop is only past the far edge', () => {
  for (const [P, some] of [[TRAIL, true], [LEDGE, false]] as const) {
    let n = 0;
    for (let c = 0; c < P.w; c++) {
      for (let r = 0; r < P.h; r++) {
        if (kindOf(P, c, r) !== TK.Hang) continue;
        n++;
        // the drop under it at ground level, and above it, within its height, floor or rock (the edge it hangs from)
        const [x, y] = worldOf(P.x0 + c, P.y0 + r);
        assert.ok(P.T.drop(x, y), `hang at ${c},${r} is over the drop`);
        let d = 1;
        while (d <= HANG_TALL && r - d >= 0) {
          const [ux, uy] = worldOf(P.x0 + c, P.y0 + r - d);
          if (!P.T.drop(ux, uy)) break;
          d++;
        }
        assert.ok(d <= HANG_TALL, `hang at ${c},${r} is within ${HANG_TALL} of its edge`);
      }
    }
    if (some) assert.ok(n > 20000, `the face under the trail: ${n} pixels`);
    else assert.equal(n, 0, 'no face hangs where the drop is only past the far edge (its edges over the drop look away)');
  }
});

test('the road\'s lip over the drop catches the light', () => {
  const lum = (i: number, P: Painted): number => 0.3 * P.rgba[i * 4] + 0.59 * P.rgba[i * 4 + 1] + 0.11 * P.rgba[i * 4 + 2];
  let lip = 0;
  let nl = 0;
  let inner = 0;
  let ni = 0;
  for (let c = 0; c < LEDGE.w; c++) {
    let r = 0;
    while (r < LEDGE.h && kindOf(LEDGE, c, r) !== TK.Floor) r++;
    if (r + 12 >= LEDGE.h) continue;
    lip += lum(r * LEDGE.w + c, LEDGE);
    nl++;
    for (let k = 6; k < 12; k++) {
      if (kindOf(LEDGE, c, r + k) !== TK.Floor) continue;
      inner += lum((r + k) * LEDGE.w + c, LEDGE);
      ni++;
    }
  }
  assert.ok(lip / nl > inner / ni + 25, `the lip ${(lip / nl).toFixed(0)}, the road just in from it ${(inner / ni).toFixed(0)}`);
});

test('nothing stands on a top where it would be over the drop (the mountain in front is cut away there)', () => {
  const P = LEDGE;
  // a thing on the slope in front, well below the road; and the same, raised so that it would stand over the drop
  let ok = 0;
  let over = 0;
  for (let c = 40; c < P.w - 40; c += 37) {
    let r = 0;
    while (kindOf(P, c, r) !== TK.Floor) r++;
    let e = r;
    while (kindOf(P, c, e) === TK.Floor) e++;
    if (clearOfFloor(P.T, P.x0 + c, P.y0 + e + 160, 12, 40)) ok++;
    assert.ok(!clearOfFloor(P.T, P.x0 + c, P.y0 + r - 20, 12, 40), `column ${c}: a thing over the drop`);
    over++;
  }
  assert.ok(ok > 10 && over > 10, `${ok} on the slope, ${over} refused over the drop`);
});

test('two pieces side by side are one picture, and it is the same every time', () => {
  const P = TRAIL;
  const x0 = P.x0 + 300;
  const y0 = P.y0 + 300;
  const one = paintTerrain(P.T, x0, y0, 200, 160);
  const again = paintTerrain(P.T, x0, y0, 200, 160);
  assert.deepEqual(Array.from(again.rgba), Array.from(one.rgba));
  const parts = [paintTerrain(P.T, x0, y0, 120, 70), paintTerrain(P.T, x0 + 120, y0, 80, 70), paintTerrain(P.T, x0, y0 + 70, 200, 90)];
  for (let r = 0; r < 160; r++) {
    for (let c = 0; c < 200; c++) {
      const p = r < 70 ? (c < 120 ? parts[0] : parts[1]) : parts[2];
      const pc = r < 70 && c >= 120 ? c - 120 : c;
      const pr = r < 70 ? r : r - 70;
      for (let k = 0; k < 4; k++) if (p.rgba[(pr * p.w + pc) * 4 + k] !== one.rgba[(r * 200 + c) * 4 + k]) assert.ok(false, `seam at ${c},${r}`);
    }
  }
});

/** Hue in degrees, saturation 0..1 (HSV). */
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
const NINE = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison'];
const DULLEST = Math.min(...NINE.map((w) => hsv(hexRgb((WORD_COLOR as Record<string, string>)[w]))[1]));
function placeColours(rgba: Uint8ClampedArray, what: string): void {
  let most = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue;
    const c: RGB = [rgba[i], rgba[i + 1], rgba[i + 2]];
    const [h, s] = hsv(c);
    most = Math.max(most, s);
    if (s > 0.25) {
      assert.ok(!(h > 165 && h < 205), `${what}: cyan at ${i / 4}: ${c}`);
      assert.ok(!(h > 300 && h < 350), `${what}: pink at ${i / 4}: ${c}`);
    }
  }
  assert.ok(most < DULLEST, `${what}: its most saturated ${most.toFixed(2)}, the dullest word ${DULLEST.toFixed(2)}`);
}

test('no cyan and no pink in the ground or the sky, and both duller than every word\'s colour (his rulebook, Colour 3 and 4)', () => {
  placeColours(TRAIL.rgba, 'the ground of his trail');
  placeColours(LEDGE.rgba, 'the ground of the first try');
  placeColours(paintSky(0, -220, SKY_WRAP, 520), 'the sky');
  for (const [name, r] of [['road', L_ROAD], ['grass', L_GRASS], ['stone', L_STONE], ['sky', SKY], ['cloud', CLOUD], ...L_ROCK.map((x, i) => [`rock ${i}`, x])] as [string, RGB[]][]) {
    assert.ok(r.length >= 3 && r.length <= 7, `${name}: ${r.length} tones`);
    assert.equal(new Set(r.map((c) => c.join(','))).size, r.length, `${name}: each tone its own`);
  }
});

test('the sky: every pixel opaque, the same every time, and it comes round across with no seam', () => {
  const a = paintSky(SKY_WRAP - 300, -200, 600, 420);
  const b = paintSky(-300, -200, 600, 420);
  assert.deepEqual(Array.from(a), Array.from(b));
  const once = paintSky(SKY_WRAP - 300, -200, 600, 420);
  assert.deepEqual(Array.from(once), Array.from(a));
  for (let i = 3; i < a.length; i += 4) assert.equal(a[i], 255);
  // across the place it comes round, no column is all unlike its neighbours (a seam would be)
  const col = (c: number): number[] => Array.from({ length: 420 }, (_, r) => a[(r * 600 + c) * 4] + a[(r * 600 + c) * 4 + 1] * 256 + a[(r * 600 + c) * 4 + 2] * 65536);
  const differ = (c: number): number => {
    const p = col(c - 1);
    const q = col(c);
    return p.filter((v, i) => v !== q[i]).length;
  };
  const atSeam = differ(300);
  const usual = [100, 200, 400, 500].map(differ).reduce((s, v) => s + v, 0) / 4;
  assert.ok(atSeam < usual * 2.2 + 10, `where it comes round, ${atSeam} pixels change from one column to the next; usually ${usual}`);
  // and painted in two pieces, it is one picture
  const left = paintSky(1000, -200, 250, 420);
  const right = paintSky(1250, -200, 350, 420);
  const whole = paintSky(1000, -200, 600, 420);
  for (let r = 0; r < 420; r++) {
    for (let c = 0; c < 600; c++) {
      const [p, pc, pw] = c < 250 ? [left, c, 250] : [right, c - 250, 350];
      for (let k = 0; k < 4; k++) if (p[(r * pw + pc) * 4 + k] !== whole[(r * 600 + c) * 4 + k]) assert.ok(false, `the sky's seam at ${c},${r}`);
    }
  }
});

test('the sky: open sky above, the far ranges on the horizon with snow on their heads, the land below, clouds below the ledge', () => {
  const H = 420;
  const px = paintSky(0, -200, SKY_WRAP, H);
  const at = (c: number, y: number): RGB => {
    const o = ((y + 200) * SKY_WRAP + c) * 4;
    return [px[o], px[o + 1], px[o + 2]];
  };
  const lum = (c: RGB): number => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  // higher up, a deeper blue
  let top = 0;
  let low = 0;
  for (let c = 0; c < SKY_WRAP; c += 7) {
    top += lum(at(c, -195));
    low += lum(at(c, -60));
  }
  assert.ok(top < low, `the sky deepens upward: ${top} < ${low}`);
  // snow: the brightest of the far range somewhere on the ranges
  const snow = hexRgb('#e7eaf1').join(',');
  let snowy = 0;
  for (let c = 0; c < SKY_WRAP; c++) for (let y = -80; y < 0; y++) if (at(c, y).join(',') === snow) snowy++;
  assert.ok(snowy > 200, `snow on the far peaks: ${snowy} pixels`);
  // clouds under the horizon (the bank below the ledge)
  const cl = new Set(CLOUD.map((c) => c.join(',')));
  let bank = 0;
  for (let c = 0; c < SKY_WRAP; c++) for (let y = 20; y < 80; y++) if (cl.has(at(c, y).join(','))) bank++;
  assert.ok(bank > SKY_WRAP * 60 * 0.15, `the bank of clouds below the ledge: ${bank} pixels`);
});

test('light from the upper left: a face to the lower left is lighter than one at the eye, and that than one to the lower right', () => {
  const look = ledgeLook(() => false);
  const lum = (c: RGB): number => 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2];
  let lit = 0;
  let mid = 0;
  let dark = 0;
  for (let v = 2; v < 100; v++) {
    for (let p = 0; p < 60; p++) {
      lit += lum(look.face(1, v, p, 0, 0, 0));
      mid += lum(look.face(0, v, p, 0, 0, 0));
      dark += lum(look.face(-1, v, p, 0, 0, 0));
    }
  }
  assert.ok(lit > mid && mid > dark, `${lit} > ${mid} > ${dark}`);
  // and the picture's place: the road at the world's (20, 20) is drawn where the game draws it
  assert.deepEqual(pictureOf(20, 20), [0, 640]);
});
