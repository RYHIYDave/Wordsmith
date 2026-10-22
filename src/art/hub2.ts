// ACT 2'S TOWN HUB, IN VELLUM: ITS OWN PIECES (the art chat's, 22 Oct 2026). A MOCK-UP: NOTHING OF THE GAME IMPORTS
// THIS FILE; `HUB2` is off.
//
// His words to the art chat, 22 Oct 2026, 08:42 Pacific: “I’d like a new town hub for act 2.  So something matching the
// city vibe of Vellum”. Asked where in the city, who works there and its mood (one pop-up), his answers: “I like the
// market square and the camp.  Can I see both?”, “Same four, moved in (Recommended)” (offered as: the armourer, mystic,
// wordsmith and stranger followed you into the city; same looks, new city-style stalls), and “Dusk, warm and alive
// (Recommended)” (offered as: evening light, lit windows and lanterns, townsfolk about: the one place the Hush can't
// reach). So two pictures, one of each place; these are the pieces neither had among the Gate Ward's
// (art/floor11.ts, art/act2_set.ts):
//   THE SQUARE:  the fountain in its middle (an open book of stone on its column, the water spilling from its pages:
//                Vellum is a city of the written word), and the ward arch, the way on out of it (the gate);
//   THE CAMP:    the survivors' tents of patched canvas, their bedrolls, their cooking fire, a log to sit on by it, and
//                the broken city gate as they hold it (the Order's banner down, the city's up: art/floor11.ts cityGate).
// Built as the Gate Ward's pieces are (art/act2_kit.ts: 40 units to a tile along x and y, picture pixels up), and a
// step quieter than any word as they are; what burns is an honest fire.

import type { Sprite } from '../engine/px';
import type { Scene, V3 } from './floor4';
import { toneAt } from './floor4';
import { rope } from './floor6';
import { CYAN, hash, mix } from './kit';
import type { Ramp } from './kit';
import { EMBER } from './props';
import { bright } from './act2_quiet';
import { cityGate } from './floor11';
import { BRASS, CHAR, CREAM, BOTTLE, DEAL, IRON, MASK, OAK, OXBLOOD, PAPER, ROPE, SLATEBLUE, STONE, STRAW, MUSTARD, HOLE, cylinder, done, lying, planks, scene, slab, turned } from './act2_kit';
import type { Theme } from './ground';

export const HUB2 = { on: false };

const fr = (t: number): number => t - Math.floor(t);

/** Water in the fountain's basin: dark, the dusk's glints on it. */
const POOL: Ramp = ['#1a1c2a', '#242838', '#30364a', '#48506a', '#8c96ae'];
/** Water falling: pale, catching the lamps. */
const FALL: Ramp = ['#3a4058', '#566078', '#7a86a0', '#a8b4ca', '#d4dce8'];
/** Canvas, old and sun-bleached. */
const CANVAS: Ramp = ['#3a342c', '#585044', '#7a705e', '#9a8e76', '#b6a98c'];
/** A flame's glints on the water and on wet stone: an honest fire's, so left bright. */
bright(['#ffc860', '#ff8a2a']);

/**
 * THE CITY'S STONE AS A THEME, for the town's own things painted in it (art/town.ts makeTownProps: the forge, the
 * wordsmith's slab and standing stones, the Lexicon's lectern): the Gate Ward's grey stone (art/act2_kit.ts STONE),
 * in place of the dungeon's blue.
 */
export const CITY: Theme = {
  id: 'city',
  mortar: '#1c1820',
  slab: ['#2a2530', '#38323c', '#463e48', '#544a52'],
  slabs: 1.6,
  cap: ['#4f4652', '#7a6e6c', '#8e8078', '#84766f', '#a89686'],
  capLow: ['#463e4a', '#6c6262', '#80736c', '#776b66', '#9a8a7c'],
  lit: ['#2c2632', '#463e4a', '#5a5056', '#524a50', '#766a68'],
  shade: ['#17141c', '#221e28', '#2e2832', '#2a242e', '#3e3640'],
};

// =================================================================================================
// THE SQUARE

/**
 * THE FOUNTAIN in the square's middle: a round basin of the city's stone, brimful, a ring of coping round it; out of
 * the water a column, a shallow bowl on it, and on the bowl an open book carved in stone, its pages spilling water
 * into the bowl, the bowl spilling it into the basin in eight falls. `f` (0..3): the water's ripple. A tile and a
 * third round; 170 x 190 at (85, 132).
 */
function fountain(f: number): Sprite {
  const S = scene(170, 190, 85, 132);
  const R = 54;
  // the basin: coursed stone, a dark line where the water stains it
  cylinder(S, 0, 0, R, 0, 13, (n, a, z) => {
    const course = Math.floor(z / 6.5);
    const joint = fr((a / (Math.PI * 2)) * 18 + course * 0.5) < 0.06 || fr(z / 6.5) < 0.12;
    return toneAt(n, STONE, joint ? -0.45 : (hash(Math.floor(a * 3), course, 11) - 0.5) * 0.3);
  }, 1, (a, rr) => {
    // the coping, then the water: rings spreading out from the falls, the lamps' glints
    if (rr > 0.9) return rr > 0.97 ? STONE[4] : STONE[3];
    if (rr > 0.87) return STONE[1];
    const ring = fr(rr * 7 - f * 0.25);
    if (rr > 0.5 && ring < 0.08) return POOL[3];
    if (hash(Math.floor(a * 10), Math.floor(rr * 16), 13 + f) > 0.94) return POOL[4];
    return rr < 0.32 ? POOL[1] : POOL[2];
  });
  // the column: three drums and a band
  cylinder(S, 0, 0, (z) => (z < 22 ? 9 : 7), 13, 58, (n, _a, z) => toneAt(n, STONE, fr(z / 15) < 0.1 ? -0.4 : 0.05), 2);
  // the bowl, flaring out, brimful
  cylinder(S, 0, 0, (z) => 8 + (z - 58) * 2.1, 58, 66, (n, a) => toneAt(n, STONE, fr(a * 2) < 0.03 ? -0.3 : 0.1), 3, (a, rr) => {
    if (rr > 0.88) return STONE[4];
    if (hash(Math.floor(a * 8), Math.floor(rr * 6), 17 + f) > 0.9) return POOL[4];
    return POOL[2];
  });
  // the book: two pages open, leaning back from its spine, on a little plinth in the bowl
  slab(S, -5, -5, 5, 5, 66, 72, STONE, 4, 0.05);
  for (const s of [-1, 1]) {
    const c: V3 = [s * 8.5, 0, 80];
    const A: readonly [V3, V3, V3] = [[Math.cos(0.32) * s, 0, Math.sin(0.32)], [0, 1, 0], [-Math.sin(0.32) * s, 0, Math.cos(0.32)]];
    S.box(c, [A[0], A[1], A[2]], [9.5, 11, 1.6], (face, u, v, n) => {
      // the page's face: lines of carved script, worn
      if (face === 4 && u > 0.12 && u < 0.88 && fr(v * 7) < 0.3 && hash(Math.floor(u * 9), Math.floor(v * 7), 19 + s) > 0.35) return toneAt(n, STONE, -0.25);
      return toneAt(n, STONE, face === 4 ? 0.25 : 0);
    }, 5 + (s > 0 ? 1 : 0));
  }
  // the water: a sheet off the head of each page into the bowl, and eight falls off the bowl's rim into the basin
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const y = -6 + k * 6;
      S.rod([s * 16, y, 84], [s * 19, y, 66], 0.7, 0.9, FALL, 7);
    }
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.2;
    const top: V3 = [Math.cos(a) * 25, Math.sin(a) * 25, 65];
    const out: V3 = [Math.cos(a) * 31, Math.sin(a) * 31, 50];
    const foot: V3 = [Math.cos(a) * 34, Math.sin(a) * 34, 14];
    S.rod(top, out, 1.1, 1.3, FALL, 8);
    S.rod(out, foot, 1.3, 1.6, FALL, 8);
    // the splash where it meets the basin's water
    S.ball([foot[0], foot[1], 14], 2.2 + ((f + k) % 2) * 0.6, FALL, 9);
  }
  return done(S, 85, 132);
}

/**
 * THE WARD ARCH, the way on out of the square: an arch of the city's stone across the mouth of a street three tiles
 * wide, its piers against the house corners either side, an iron gate of bars folded back against each pier, a
 * lantern hung from the keystone, the keystone carved with a quill crossed over an open book (the city's). Built
 * across the world's x, its front looking along +y (toward the eye on the square's back edge); `k` 1: across y, its
 * front looking along +x. 200 x 260 at (100, 220).
 */
function wardArch(k: number): Sprite {
  const S0 = scene(200, 260, 100, 220);
  const S = turned(S0, k);
  const SPAN = 64;
  const PIER = 10;
  const SPRING = 92;
  const coursed = (h: number, w: number) => (f: number, u: number, v: number): number => {
    const across = f === 4 || f === 5 ? u : u;
    const up = f === 4 || f === 5 ? v : v;
    const row = Math.floor(up * h);
    const joint = fr(up * h) < 0.08 || fr(across * w + row * 0.5) < 0.06;
    return joint ? -0.5 : (hash(Math.floor(across * w + row * 0.5), row, 23) - 0.5) * 0.35;
  };
  // the piers, each with a plinth and a cap
  for (const s of [-1, 1]) {
    const x0 = s * SPAN - PIER;
    const x1 = s * SPAN + PIER;
    slab(S, x0 - 2, -PIER - 2, x1 + 2, PIER + 2, 0, 10, STONE, 10 + (s > 0 ? 1 : 0), -0.1, coursed(1, 2));
    slab(S, x0, -PIER, x1, PIER, 10, SPRING, STONE, 12 + (s > 0 ? 1 : 0), 0, coursed(10, 2));
    slab(S, x0 - 2, -PIER - 2, x1 + 2, PIER + 2, SPRING, SPRING + 5, STONE, 14 + (s > 0 ? 1 : 0), 0.2);
  }
  // the arch: a ring of wedge stones from pier to pier, the keystone bigger
  const N = 15;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const th = Math.PI * (1 - t);
    const key = i === Math.floor(N / 2);
    const rr = SPAN + (key ? 2 : 0);
    const c: V3 = [Math.cos(th) * rr, 0, SPRING + 5 + Math.sin(th) * rr * 0.62];
    const tang: V3 = [-Math.sin(th), 0, Math.cos(th) * 0.62];
    const tl = Math.hypot(tang[0], tang[2]);
    const t1: V3 = [tang[0] / tl, 0, tang[2] / tl];
    const rad: V3 = [-t1[2], 0, t1[0]];
    S.box(c, [t1, [0, 1, 0], rad], [(Math.PI * rr * 0.75) / N / 2 - 0.6, PIER + (key ? 2 : 0), key ? 12 : 9], (face, u, v, n) => {
      if (key && face === 2) {
        // the city's mark: an open book and a quill across it
        const du = u - 0.5;
        const dv = v - 0.5;
        const book = Math.abs(dv + 0.08) < 0.16 && Math.abs(du) < 0.36 && Math.abs(du) > 0.03;
        const quill = Math.abs(du - dv * 0.9) < 0.05 && dv > -0.38 && dv < 0.36;
        if (book || quill) return toneAt(n, STONE, -0.35);
      }
      return toneAt(n, STONE, (hash(i, face, 29) - 0.5) * 0.3 + (face === 4 ? 0.2 : 0));
    }, 20 + i);
  }
  // the gate's two leaves of iron bars, folded back flat against the piers' inner faces
  for (const s of [-1, 1]) {
    const x = s * (SPAN - PIER - 2.5);
    for (let b = 0; b < 6; b++) {
      const y = -PIER + 3 + b * 3.4;
      S.rod([x, y, 2], [x, y, SPRING - 6], 0.8, 0.8, IRON, 40 + (s > 0 ? 1 : 0));
    }
    for (const z of [8, 46, SPRING - 8]) S.rod([x, -PIER + 2, z], [x, PIER - 2, z], 0.9, 0.9, IRON, 40 + (s > 0 ? 1 : 0));
  }
  // the lantern under the keystone: an iron cage on a short chain, its flame
  const top = SPRING + 5 + SPAN * 0.62 - 10;
  S.rod([0, 0, top], [0, 0, top - 10], 0.6, 0.6, IRON, 50);
  const c: V3 = [0, 0, top - 18];
  S.box([0, 0, top - 10], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.6, 3.6, 1.4], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), 51);
  S.box(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.2, 3.2, 7], (face, u, v, n) => {
    if (face >= 4) return toneAt(n, IRON, 0);
    if (u < 0.15 || u > 0.85 || v < 0.1 || v > 0.9) return toneAt(n, IRON, 0.1);
    const d = Math.abs(u - 0.5) + Math.abs(v - 0.42) * 0.6;
    return d < 0.14 ? EMBER[4] : d < 0.26 ? EMBER[3] : EMBER[2];
  }, 52);
  return done(S, 100, 220, [{ at: c, r: 46, color: EMBER[2], a: 0.5 }]);
}

// =================================================================================================
// THE CAMP

/** The patches on each of the camp's tents: the cloths it was mended with. */
const PATCHES: readonly Ramp[][] = [
  [OXBLOOD, SLATEBLUE],
  [BOTTLE, MUSTARD],
  [SLATEBLUE, OXBLOOD],
  [MUSTARD, BOTTLE],
];

/**
 * A SURVIVORS' TENT: a ridge tent of old canvas mended with patches of whatever cloth was to hand, its two poles,
 * its guy ropes pegged out, the flaps of its door tied back and a blanket and a bundle inside. Built with its door
 * looking along +y; `facing` turns it a quarter at a time (art/act2_kit.ts turned). 160 x 150 at (80, 104).
 */
function tent(variant: number, facing: number): Sprite {
  const S0 = scene(160, 150, 80, 104);
  const S = turned(S0, facing);
  const L = 34; // half its length, along y
  const Wd = 26; // half its width at the foot, along x
  const H = 50; // its ridge
  const patches = PATCHES[variant % PATCHES.length];
  const cloth = (u: number, v: number, side: number): Ramp => {
    // patches: squares of other cloth here and there, a seam round each
    const cu = Math.floor(u * 5);
    const cv = Math.floor(v * 4);
    const h = hash(cu + side * 7, cv, 31 + variant);
    if (h > 0.82) return patches[h > 0.91 ? 0 : 1];
    return CANVAS;
  };
  // the two sides of the roof, each from the ridge down to its foot
  for (const s of [-1, 1]) {
    const n: V3 = [s * H, 0, Wd];
    const nl = Math.hypot(n[0], n[2]);
    const nn: V3 = [n[0] / nl, 0, n[2] / nl];
    S.quad([[0, -L, H], [0, L, H], [s * Wd, L, 0], [s * Wd, -L, 0]], (u, v) => {
      const r = cloth(u, v, s);
      // a seam down it every so often, the sag between the poles darker, the foot dirty
      const seam = fr(u * 5) < 0.05 || fr(v * 4) < 0.04;
      const sag = Math.sin(u * Math.PI) * 0.15;
      const foot = v > 0.86 ? -0.35 : 0;
      return toneAt(nn, r, (seam ? -0.4 : 0) - sag + foot + (hash(Math.floor(u * 40), Math.floor(v * 30), 37) - 0.5) * 0.12);
    }, s > 0 ? 1 : 2);
  }
  // its back end, shut; its front, the door open: the dark inside, the flaps tied back either side
  S.quad([[-Wd, -L, 0], [Wd, -L, 0], [0, -L, H], [0, -L, H]], (u, v) => toneAt([0, -1, 0], cloth(u, v, 3), 0), 3);
  S.quad([[-Wd, L - 1, 0], [Wd, L - 1, 0], [0, L - 1, H], [0, L - 1, H]], (u, v, w) => {
    // the inside: dark, a blanket on the ground, a bundle against the back
    if (w[2] < 4 && Math.abs(w[0]) < Wd * 0.6) return mix(OXBLOOD[1], HOLE, 0.4);
    if (w[2] < 12 && w[0] > Wd * 0.15 && w[0] < Wd * 0.55) return mix(CANVAS[1], HOLE, 0.5);
    void u;
    void v;
    return HOLE;
  }, 4);
  for (const s of [-1, 1]) {
    // a flap: a triangle of canvas folded back against the front of the roof's side, tied with a cord
    S.quad([[s * 2, L + 0.5, H - 4], [s * Wd * 0.95, L + 0.5, 1], [s * Wd * 0.62, L + 4, 6], [s * Wd * 0.62, L + 4, 6]], (u, v) => toneAt([s * 0.6, 0.7, 0.4], CANVAS, (u + v) * -0.25), 5 + (s > 0 ? 1 : 0));
    S.rod([s * Wd * 0.5, L + 3, 20], [s * Wd * 0.62, L + 4, 18], 0.5, 0.5, ROPE, 7);
  }
  // the poles at either end, standing a little proud of the ridge; the ridge's guy ropes out to their pegs
  for (const y of [-L, L]) {
    S.rod([0, y + (y > 0 ? 1.5 : -1.5), 0], [0, y + (y > 0 ? 1.5 : -1.5), H + 6], 1.1, 0.9, OAK, 8);
    const peg: V3 = [0, y + (y > 0 ? 24 : -24), 0];
    S.rod([0, y, H + 4], peg, 0.45, 0.45, ROPE, 9);
    S.rod(peg, [peg[0], peg[1], 4], 0.9, 0.7, OAK, 10);
  }
  // the side's guy ropes, two to a side
  for (const s of [-1, 1]) {
    for (const y of [-L * 0.55, L * 0.55]) {
      const at: V3 = [s * Wd * 0.5, y, H * 0.5];
      const peg: V3 = [s * (Wd + 18), y, 0];
      S.rod(at, peg, 0.4, 0.4, ROPE, 11);
      S.rod(peg, [peg[0], peg[1], 3.5], 0.8, 0.6, OAK, 12);
    }
  }
  return done(S, 80, 104);
}

/**
 * THE COOKING FIRE in the middle of the camp: a ring of cobbles pulled up out of the street, logs burning in it, a
 * tripod of iron over it and a black pot hung from it, steam off the pot. `f` (0..3): the flames. An honest fire.
 * 110 x 130 at (55, 92).
 */
function cookingFire(f: number): Sprite {
  const S = scene(110, 130, 55, 92);
  // the ring of stones
  for (let k = 0; k < 11; k++) {
    const a = (k / 11) * Math.PI * 2;
    S.egg([Math.cos(a) * 17, Math.sin(a) * 17, 3], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [4.4, 5.2, 3.6], (n) => toneAt(n, STONE, (hash(k, 1, 41) - 0.5) * 0.4), 1 + (k % 3));
  }
  // the ash and the bed of embers
  cylinder(S, 0, 0, 13, 0, 1.2, (n) => toneAt(n, CHAR, 0), 4, (a, rr) => {
    const h = hash(Math.floor(a * 6), Math.floor(rr * 5), 43 + f);
    return rr < 0.6 ? (h > 0.55 ? EMBER[1] : h > 0.3 ? EMBER[0] : CHAR[2]) : CHAR[1 + (h > 0.5 ? 1 : 0)];
  });
  // the logs, crossed
  for (const [a, z] of [[0.3, 3], [1.9, 3.5], [3.5, 4]] as const) {
    S.rod([Math.cos(a) * 14, Math.sin(a) * 14, 1.5], [Math.cos(a + Math.PI) * 4, Math.sin(a + Math.PI) * 4, z + 3], 3, 2.4, OAK, 5);
  }
  // the flames: tongues licking up, their tips flickering
  for (let k = 0; k < 7; k++) {
    const a = k * 2.4 + f * 0.7;
    const d = 2 + (k % 3) * 2.2;
    const h = 14 + ((k * 5 + f * 3) % 7) * 2.4;
    const base: V3 = [Math.cos(a) * d, Math.sin(a) * d, 4];
    const tip: V3 = [base[0] + Math.sin(f + k) * 2, base[1], base[2] + h];
    S.rod(base, tip, 3.6 - (k % 2), 0.4, [EMBER[0], EMBER[1], EMBER[2], EMBER[3], EMBER[4]], 60);
    S.rod([base[0], base[1], base[2] + 1], [tip[0], tip[1], base[2] + h * 0.6], 1.6, 0.3, [EMBER[3], EMBER[3], EMBER[4], EMBER[4], EMBER[4]], 61);
  }
  // the tripod, its legs out past the stones, its head over the fire; the pot hung from it
  const head: V3 = [0, 0, 58];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    S.rod([Math.cos(a) * 27, Math.sin(a) * 27, 0], head, 1.1, 0.9, IRON, 20);
  }
  S.rod(head, [0, 0, 34], 0.5, 0.5, IRON, 21);
  cylinder(S, 0, 0, (z) => 8 + Math.sin(((z - 20) / 13) * Math.PI) * 2, 20, 33, (n, _a, z) => toneAt(n, IRON, z > 31 ? 0.1 : -0.2), 22, (_a, rr) => (rr > 0.85 ? IRON[3] : '#3a2a22'));
  // steam off the pot
  for (let k = 0; k < 3; k++) {
    const y = (k - 1) * 3;
    S.rod([0, y, 35 + k * 2], [Math.sin(f + k) * 3, y, 48 + k * 4 + f], 1.2, 0.6, ['#5a5664', '#6e6a78', '#86828e', '#9a96a2', '#aeaab6'], (1 << 20) + 1);
  }
  return done(S, 55, 92, [{ at: [0, 0, 10], r: 62 + f * 2, color: EMBER[2], a: 0.55 }]);
}

/** A LOG TO SIT ON by the fire: a length of trunk, its bark, its sawn ends. Lying along x (`k` 1: along y). 100 x 60 at (50, 36). */
function logSeat(k: number): Sprite {
  const S0 = scene(100, 60, 50, 36);
  const S = turned(S0, k);
  S.rod([-26, 0, 6], [26, 0, 6], 6, 5.6, OAK, 1);
  return done(S, 50, 36);
}

/** A BEDROLL laid out by a tent: a blanket rolled at its head, a straw pallet under it. Along y (`k` 1: along x). 90 x 60 at (45, 36). */
function bedroll(variant: number, k: number): Sprite {
  const S0 = scene(90, 60, 45, 36);
  const S = turned(S0, k);
  const blanket = [OXBLOOD, SLATEBLUE, BOTTLE, MUSTARD][variant % 4];
  slab(S, -11, -24, 11, 22, 0, 2.5, STRAW, 1, -0.1);
  slab(S, -9, -14, 9, 20, 2.5, 4.5, blanket, 2, 0, (f, u, v) => (f === 4 && fr(v * 6) < 0.12 ? -0.35 : 0));
  S.rod([-9, -18, 6], [9, -18, 6], 4.5, 4.5, blanket, 3);
  return done(S, 45, 36);
}


// =================================================================================================
// THE CAMP'S SHOPS, AND THE REST CAMP-STYLE
//
// His picks for the camp (22 Oct, one pop-up): “The camp yes.  Also some different looks for the shops”; then, for the
// armourer, “Field forge on a cart (Recommended)” (offered as: a smith's cart with a fire-basket forge and bellows, his
// anvil on a stump, blades racked along the cart); for the mystic, “Painted caravan wagon (Recommended)” (offered as: a
// covered wagon, its side let down as a counter, potions and charms hanging inside); and of the rest, “I’d like to see
// all of them in a new style but more than likely we’ll stick to just the vendors for new looks”. So the two shops, and
// camp-style ones of the wordsmith's ring, the Lexicon, the stash and the stranger's corner to look at beside them.

/** Steel: a blade's bright grey. */
const STEEL: Ramp = ['#2a2a36', '#44445a', '#6a6a82', '#9a9ab0', '#c8c8da'];
/** Leather: the bellows, a strap. */
const LEATHER: Ramp = ['#24161a', '#3a2420', '#56362a', '#704a36', '#8a6046'];
/** The mystic's glass: four colours of bottle, each a ramp. */
const GLASS: readonly Ramp[] = [
  ['#3a141c', '#5e1e28', '#8a2e3a', '#b04a52', '#e09098'],
  ['#14301c', '#1e4a2a', '#2e6a3c', '#4a8a52', '#9ac8a0'],
  ['#18183e', '#24285e', '#36408a', '#5262ae', '#a0acd8'],
  ['#3a2810', '#5e4018', '#8a6022', '#b08036', '#e0c080'],
];
/** The friend's cyan (art/kit.ts CYAN): the wordsmith's runes, the Lexicon's script, the stash's stone, the mystic's crystal. */
const RUNE = CYAN[2];
const RUNE_HI = CYAN[3];

/** A CART WHEEL standing on the floor: its rim of oak with an iron tyre, its spokes, its hub; `c` its middle (on an axle along y). */
function wheel(S: Scene, c: V3, r: number, id: number, spokes = 10): void {
  const N = 28;
  const out = c[1] >= 0 ? 1 : -1;
  const P = (a: number, rr: number): V3 => [c[0] + Math.cos(a) * rr, c[1], c[2] + Math.sin(a) * rr];
  for (let k = 0; k < N; k++) {
    const a0 = (k / N) * Math.PI * 2;
    const a1 = ((k + 1) / N) * Math.PI * 2;
    const n: V3 = [0, out, Math.sin((a0 + a1) / 2) * 0.3];
    S.quad([P(a0, r - 2.6), P(a1, r - 2.6), P(a1, r - 0.6), P(a0, r - 0.6)], () => toneAt(n, OAK, 0.05), id);
    S.quad([P(a0, r - 0.6), P(a1, r - 0.6), P(a1, r + 0.4), P(a0, r + 0.4)], () => toneAt(n, IRON, 0.15), id);
  }
  for (let k = 0; k < spokes; k++) S.rod(c, P((k / spokes) * Math.PI * 2 + 0.2, r - 2), 0.9, 0.7, OAK, id + 1);
  S.ball(c, 2.4, IRON, id + 2);
}

/** A LANTERN hung at `c`: an iron cage, its little roof, its flame. */
function lantern(S: Scene, c: V3, id: number, f = 0): void {
  S.box([c[0], c[1], c[2] + 8.4], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.2, 3.2, 1.3], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), id);
  S.box(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.8, 2.8, 6.6], (face, u, v, n) => {
    if (face >= 4) return toneAt(n, IRON, 0);
    if (u < 0.15 || u > 0.85 || v < 0.1 || v > 0.9) return toneAt(n, IRON, 0.1);
    const d = Math.abs(u - 0.5) + Math.abs(v - 0.42 - f * 0.05) * 0.6;
    return d < 0.14 ? EMBER[4] : d < 0.26 ? EMBER[3] : EMBER[2];
  }, id + 1);
}

/** Flames licking up from a bed at `c`, `n` tongues, `h` their height, `w` how wide the bed is. */
function flames(S: Scene, c: V3, n: number, h: number, w: number, f: number, id: number): void {
  for (let k = 0; k < n; k++) {
    const a = k * 2.4 + f * 0.7;
    const d = (w * ((k % 3) + 1)) / 3.4;
    const hh = h * (0.6 + (((k * 5 + f * 3) % 7) / 7) * 0.6);
    const base: V3 = [c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d * 0.6, c[2]];
    const tip: V3 = [base[0] + Math.sin(f + k) * 1.6, base[1], base[2] + hh];
    S.rod(base, tip, w * 0.3, 0.4, [EMBER[0], EMBER[1], EMBER[2], EMBER[3], EMBER[4]], id);
    S.rod([base[0], base[1], base[2] + 1], [tip[0], tip[1], base[2] + hh * 0.55], w * 0.13, 0.3, [EMBER[3], EMBER[3], EMBER[4], EMBER[4], EMBER[4]], id + 1);
  }
}

/** A BLADE hung by its hilt from a rail at `top`, its point down: a sword (`axe` false) or a hand-axe. */
function hungBlade(S: Scene, top: V3, axe: boolean, id: number): void {
  if (axe) {
    S.rod(top, [top[0], top[1], top[2] - 18], 0.9, 0.9, OAK, id);
    S.box([top[0] + 2.4, top[1], top[2] - 16], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.2, 0.7, 3.4], (_f, u, _v, n) => toneAt(n, STEEL, u > 0.8 ? 0.4 : 0), id + 1);
  } else {
    S.rod([top[0], top[1], top[2] + 2], [top[0], top[1], top[2] - 4], 0.9, 0.9, LEATHER, id);
    S.rod([top[0] - 3, top[1], top[2] - 4], [top[0] + 3, top[1], top[2] - 4], 0.7, 0.7, BRASS, id + 1);
    S.rod([top[0], top[1], top[2] - 4.5], [top[0], top[1], top[2] - 24], 1.2, 0.5, STEEL, id + 2);
  }
}

/**
 * THE ARMOURER'S FIELD FORGE ON A CART (his pick): a smith's cart, its shafts down on the setts, two great wheels; on
 * the back of its bed a hearth of stones with an iron fire-basket on it, the coals and the fire, a stovepipe; the
 * bellows beside it; along its near side a rail of blades and hand-axes hung for sale; tongs and a hammer on the bed;
 * his anvil on a stump before the cart, a quenching bucket by it. Its long side along x, the side he sells from looking
 * along +y. `f` (0..3): the fire. 260 x 230 at (130, 160).
 */
function forgeCart(f: number): Sprite {
  const S0 = scene(260, 230, 130, 160);
  const S = turned(S0, 0, 1.45);
  // the bed and its low sides
  slab(S, -40, -17, 34, 17, 20, 24, DEAL, 1, 0, planks(5));
  slab(S, -40, 14, 34, 17, 24, 30, OAK, 2, 0);
  slab(S, -40, -17, 34, -14, 24, 30, OAK, 3, 0);
  slab(S, 31, -14, 34, 14, 24, 30, OAK, 4, 0);
  slab(S, -40, -14, -37, 14, 24, 30, OAK, 5, 0);
  // the axle and the wheels, under the hearth's end (so the rail of blades shows); the shafts to the setts
  S.rod([-22, -22, 18.5], [-22, 22, 18.5], 1.6, 1.6, IRON, 6);
  wheel(S, [-22, 22, 18.4], 18, 7);
  wheel(S, [-22, -22, 18.4], 18, 10);
  for (const y of [-11, 11]) S.rod([34, y, 21], [72, y, 2.5], 1.8, 1.4, OAK, 13);
  // the hearth: a bed of stones, the iron fire-basket on it, its coals, the fire; the stovepipe at its back corner
  slab(S, -36, -12, -12, 12, 24, 28, STONE, 14, 0.05);
  slab(S, -34, -10, -14, 10, 28, 32, IRON, 15, 0);
  S.quad([[-33, -9, 32.2], [-15, -9, 32.2], [-15, 9, 32.2], [-33, 9, 32.2]], (u, v) => {
    const h = hash(Math.floor(u * 9), Math.floor(v * 9), 71 + f);
    return h > 0.7 ? EMBER[3] : h > 0.4 ? EMBER[2] : h > 0.15 ? EMBER[1] : CHAR[2];
  }, 16);
  flames(S, [-24, 0, 32], 6, 14, 4.2, f, 60);
  cylinder(S, -32, -8, 2.6, 32, 70, (n, _a, z) => toneAt(n, IRON, fr(z / 12) < 0.08 ? 0.3 : 0), 17, () => HOLE);
  // the bellows, its nozzle to the fire
  S.egg([-4, 2, 30], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [8, 6, 3], (n) => toneAt(n, LEATHER, 0), 18);
  slab(S, -11, -4, 4, 8, 33, 34.5, OAK, 19, 0.1);
  S.rod([-12, 2, 30], [-17, 2, 31], 1, 0.7, IRON, 20);
  S.rod([4, 2, 34], [12, 2, 40], 0.8, 0.8, OAK, 21);
  // the rail of blades along the near side
  for (const x of [0, 32]) S.rod([x, 18.5, 30], [x, 18.5, 50], 0.9, 0.9, OAK, 22);
  S.rod([0, 18.5, 49], [32, 18.5, 49], 0.9, 0.9, OAK, 23);
  for (let k = 0; k < 6; k++) hungBlade(S, [3.4 + k * 5.4, 19.5, 47.5], k % 3 === 2, 24 + k * 3);
  // tongs and a hammer on the bed
  S.rod([8, -6, 24.6], [24, -2, 24.6], 0.6, 0.5, IRON, 45);
  S.rod([8, -4, 24.6], [24, -1, 24.6], 0.6, 0.5, IRON, 45);
  S.rod([14, 6, 24.8], [26, 9, 24.8], 0.9, 0.9, OAK, 46);
  S.box([26, 9, 25.6], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.8, 3, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 47);
  // the quenching bucket by its near wheel
  cylinder(S, -4, 30, (z) => 6 + z * 0.05, 0, 12, (n, a) => (fr(a * 2.5) < 0.1 ? toneAt(n, OAK, -0.4) : toneAt(n, OAK, 0)), 52, () => '#2a2a3c');
  return done(S, 130, 160, [{ at: [-24, 0, 40], r: 58 + f * 2, color: EMBER[2], a: 0.55 }]);
}

/** THE ARMOURER'S ANVIL ON ITS STUMP, before his cart (a piece of its own, so that he stands behind it). 90 x 90 at (45, 66). */
function anvilStump(): Sprite {
  const S0 = scene(90, 90, 45, 66);
  const S = turned(S0, 0, 1.45);
  cylinder(S, 0, 0, 9, 0, 21, (n, a) => toneAt(n, OAK, fr(a * 2.4) < 0.12 ? -0.4 : 0), 1, (_a, rr) => (fr(rr * 4) < 0.15 ? OAK[2] : OAK[4]));
  S.box([0, 0, 23], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [5, 3.6, 2], (_f, _u, _v, n) => toneAt(n, IRON, -0.1), 2);
  S.box([0, 0, 27.4], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [8, 4.2, 2.4], (face, _u, v, n) => toneAt(n, IRON, face === 4 ? 0.35 : v > 0.9 ? 0.4 : 0), 3);
  S.rod([8, 0, 28.2], [15, 0, 27.6], 2.6, 0.6, IRON, 4);
  // his hammer laid on it
  S.rod([-6, 2, 30.4], [3, 3, 30.4], 0.8, 0.8, OAK, 5);
  S.box([-6.5, 2, 31], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6, 2.6, 1.5], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 6);
  return done(S, 45, 66);
}

/**
 * THE MYSTIC'S PAINTED CARAVAN (his pick): a covered wagon, its body painted oxblood with mustard scrolls and green
 * shutters under a green barrel roof, a stovepipe through it; its near side let down: the upper half propped up on two
 * poles as an awning, striped under, and inside, shelves of bottles and jars and charms hung from the roof, a lamp
 * lit; its four wheels, its shafts down on the setts, a lantern at its front corner. Its long side along x, its open
 * side looking along +y (he stands before it, his trestle of wares before him). 290 x 300 at (145, 220).
 */
function caravan(): Sprite {
  const S0 = scene(290, 300, 145, 220);
  const S = turned(S0, 0, 1.4);
  const L = 44; // half its length
  const Wd = 20; // half its width
  const FLOOR = 30;
  const EAVE = 82;
  const OPEN: [number, number, number, number] = [-28, 28, 46, 80]; // the opening in its near side: x0, x1, z0, z1
  const paint = (u: number, z: number, n: V3, x: number): string => {
    // its panels: oxblood framed in mustard, a scroll in each, green shutters at its ends
    const px = fr((x + L) / 22);
    const frame = px < 0.07 || px > 0.93 || Math.abs(z - (FLOOR + 3)) < 1.6 || Math.abs(z - (EAVE - 2)) < 1.6;
    if (frame) return toneAt(n, MUSTARD, 0.15);
    const sx = px - 0.5;
    const sz = (z - (FLOOR + EAVE) / 2) / 26;
    const scroll = Math.abs(Math.hypot(sx * 1.6, sz) - 0.32) < 0.05 && hash(Math.floor((x + L) / 22), 1, 81) < 0.9;
    if (scroll) return toneAt(n, MUSTARD, -0.1);
    void u;
    return toneAt(n, OXBLOOD, 0.05);
  };
  // the chassis
  slab(S, -L + 4, -Wd + 2, L - 4, Wd - 2, 22, FLOOR, OAK, 1, -0.2);
  // its sides and ends
  S.quad([[-L, Wd, FLOOR], [L, Wd, FLOOR], [L, Wd, EAVE], [-L, Wd, EAVE]], (u, v, w) => {
    if (w[0] > OPEN[0] && w[0] < OPEN[1] && w[2] > OPEN[2] && w[2] < OPEN[3]) return null;
    return paint(u, w[2], [0, 1, 0], w[0]);
  }, 2);
  S.quad([[L, Wd, FLOOR], [L, -Wd, FLOOR], [L, -Wd, EAVE], [L, Wd, EAVE]], (u, v, w) => {
    // the front end: a shuttered window
    if (Math.abs(w[1]) < 8 && w[2] > 50 && w[2] < 70) return Math.abs(w[1]) < 0.8 || fr(w[2] / 4) < 0.15 ? toneAt([1, 0, 0], BOTTLE, -0.4) : toneAt([1, 0, 0], BOTTLE, 0.05);
    return paint(u, w[2], [1, 0, 0], -w[1]);
  }, 3);
  S.quad([[-L, -Wd, FLOOR], [L, -Wd, FLOOR], [L, -Wd, EAVE], [-L, -Wd, EAVE]], (u, v, w) => paint(u, w[2], [0, -1, 0], w[0]), 4);
  S.quad([[-L, Wd, FLOOR], [-L, -Wd, FLOOR], [-L, -Wd, EAVE], [-L, Wd, EAVE]], (u, v, w) => paint(u, w[2], [-1, 0, 0], w[1]), 5);
  // INSIDE, seen through the opening: its floor, its back wall's inside, its shelves of bottles, charms hung, its lamp
  S.quad([[OPEN[0], -Wd + 1, FLOOR + 0.5], [OPEN[1], -Wd + 1, FLOOR + 0.5], [OPEN[1], Wd - 1, FLOOR + 0.5], [OPEN[0], Wd - 1, FLOOR + 0.5]], () => mix(OAK[1], HOLE, 0.3), 6);
  S.quad([[OPEN[0], -Wd + 1, FLOOR], [OPEN[1], -Wd + 1, FLOOR], [OPEN[1], -Wd + 1, EAVE + 8], [OPEN[0], -Wd + 1, EAVE + 8]], (u, v) => (fr(u * 9) < 0.06 ? mix(OAK[0], HOLE, 0.3) : mix(OAK[1], HOLE, 0.15 + v * 0.3)), 7);
  for (const [z, d] of [[54, 7], [68, 6]] as const) {
    slab(S, OPEN[0] + 1, -Wd + 1, OPEN[1] - 1, -Wd + 1 + d, z - 1.2, z, OAK, 8, 0);
    for (let k = 0; k < 9; k++) {
      const x = OPEN[0] + 4 + k * 6.2 + (z === 68 ? 2 : 0);
      const g = GLASS[(k + (z === 68 ? 2 : 0)) % 4];
      const h = 5 + ((k * 7) % 4);
      cylinder(S, x, -Wd + 4, k % 3 === 0 ? 2.6 : 1.9, z, z + h, (n, a) => toneAt(n, g, fr(a * 1.5) < 0.12 ? 0.6 : 0), 9 + k, () => g[4]);
      if (k % 3 !== 0) S.rod([x, -Wd + 4, z + h], [x, -Wd + 4, z + h + 2.4], 0.7, 0.6, OAK, 18);
    }
  }
  for (let k = 0; k < 6; k++) {
    // charms hung from the roof on threads: a little bone, a bundle of herbs, a brass disc
    const x = OPEN[0] + 6 + k * 10;
    const top: V3 = [x, -4 + (k % 2) * 8, EAVE + 6];
    const end: V3 = [x, top[1], EAVE - 10 - (k % 3) * 4];
    S.rod(top, end, 0.35, 0.35, ROPE, 19);
    if (k % 3 === 0) S.ball(end, 2.2, BRASS, 20);
    else if (k % 3 === 1) S.egg(end, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6, 1.6, 4], (n) => toneAt(n, BOTTLE, 0), 21);
    else S.rod([end[0] - 2.4, end[1], end[2]], [end[0] + 2.4, end[1], end[2]], 1, 1, MASK, 22);
  }
  lantern(S, [6, -4, EAVE - 2], 23, 1);
  // the roof: a barrel of green boards over it all, its ribs; the stovepipe
  const N = 10;
  for (let k = 0; k < N; k++) {
    const a0 = (k / N) * Math.PI;
    const a1 = ((k + 1) / N) * Math.PI;
    const Pt = (a: number, x: number): V3 => [x, Math.cos(a) * (Wd + 4), EAVE + Math.sin(a) * 18];
    const nm: V3 = [0, Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2)];
    S.quad([Pt(a0, -L - 4), Pt(a0, L + 4), Pt(a1, L + 4), Pt(a1, -L - 4)], (u) => toneAt(nm, BOTTLE, fr(u * 8) < 0.06 ? -0.45 : 0.05), 25);
  }
  for (const x of [-L - 4, L + 4]) {
    for (let k = 0; k < N; k++) {
      const a0 = (k / N) * Math.PI;
      const a1 = ((k + 1) / N) * Math.PI;
      S.rod([x, Math.cos(a0) * (Wd + 4), EAVE + Math.sin(a0) * 18], [x, Math.cos(a1) * (Wd + 4), EAVE + Math.sin(a1) * 18], 1.1, 1.1, MUSTARD, 26);
    }
  }
  cylinder(S, -26, -6, 2.4, EAVE + 16, EAVE + 32, (n) => toneAt(n, IRON, 0), 27, () => HOLE);
  // the awning: the side's upper half swung up, striped under, on two poles; its painted face to the sky
  const hinge = EAVE - 1;
  S.quad([[OPEN[0] - 2, Wd + 0.5, hinge], [OPEN[1] + 2, Wd + 0.5, hinge], [OPEN[1] + 2, Wd + 17, hinge + 7], [OPEN[0] - 2, Wd + 17, hinge + 7]], (u, v) => (fr(u * 7) < 0.5 ? toneAt([0, 0.4, 0.9], MUSTARD, 0.1 - v * 0.2) : toneAt([0, 0.4, 0.9], OXBLOOD, 0.1 - v * 0.2)), 28);
  for (const x of [OPEN[0], OPEN[1]]) S.rod([x, Wd + 15, hinge + 6], [x, Wd + 18, 0], 0.9, 0.9, OAK, 29);
  // the counter: the side's lower half let down level on its chains
  slab(S, OPEN[0] - 1, Wd, OPEN[1] + 1, Wd + 9, OPEN[2] - 2, OPEN[2], OAK, 30, 0.15);
  for (const x of [OPEN[0], OPEN[1]]) S.rod([x, Wd, OPEN[2] + 12], [x, Wd + 9, OPEN[2]], 0.4, 0.4, IRON, 31);
  // the wheels, the shafts, the lantern at its front corner, a step at its back
  wheel(S, [-26, Wd + 3, 17.4], 17, 32);
  wheel(S, [-26, -Wd - 3, 17.4], 17, 35);
  wheel(S, [28, Wd + 3, 13.4], 13, 38, 8);
  wheel(S, [28, -Wd - 3, 13.4], 13, 41, 8);
  for (const y of [-9, 9]) S.rod([L, y, 24], [L + 34, y, 2.5], 1.6, 1.3, OAK, 44);
  S.rod([L + 2, Wd + 2, EAVE + 6], [L + 6, Wd + 6, EAVE + 2], 0.7, 0.7, IRON, 45);
  lantern(S, [L + 6, Wd + 6, EAVE - 8], 46);
  slab(S, -L - 12, -6, -L, 6, 0, 10, OAK, 48, 0, planks(2));
  slab(S, -L - 6, -6, -L, 6, 10, 20, OAK, 49, 0, planks(2));
  return done(S, 145, 220, [
    { at: [L + 6, Wd + 6, EAVE - 10], r: 34, color: EMBER[2], a: 0.45 },
    { at: [6, -4, EAVE - 4], r: 30, color: EMBER[2], a: 0.4 },
  ]);
}

/**
 * THE MYSTIC'S TRESTLE before his caravan: a board across two barrels, a fringed cloth over its front, on it his
 * bottles, a bowl of charms and a little brass scale (his crystal he holds himself). Along x. 150 x 120 at (75, 84).
 */
function trestle(f: number): Sprite {
  const S0 = scene(150, 120, 75, 84);
  const S = turned(S0, 0, 1.4);
  for (const x of [-22, 22]) {
    cylinder(S, x, 0, (z) => 7 + 1.2 * Math.sin((z / 22) * Math.PI), 0, 22, (n, a, z) => {
      if (Math.abs(z - 4) < 1 || Math.abs(z - 18) < 1) return toneAt(n, IRON, 0.25);
      return fr(a * 2.6) < 0.1 ? toneAt(n, OAK, -0.5) : toneAt(n, OAK, 0.05);
    }, 1 + (x > 0 ? 1 : 0), () => OAK[3]);
  }
  slab(S, -32, -9, 32, 9, 22, 25, DEAL, 3, 0.1, planks(4));
  // the cloth over its front, fringed
  S.quad([[-32, 9.4, 25.2], [32, 9.4, 25.2], [32, 9.4, 12], [-32, 9.4, 12]], (u, v) => {
    if (v > 0.9) return fr(u * 30) < 0.5 ? MUSTARD[3] : null;
    if (Math.abs(v - 0.15) < 0.04 || Math.abs(v - 0.8) < 0.04) return toneAt([0, 1, 0], MUSTARD, 0);
    return toneAt([0, 1, 0], OXBLOOD, 0 - v * 0.2);
  }, 4);
  // the bottles
  for (let k = 0; k < 7; k++) {
    const x = -27 + k * 4.4;
    const g = GLASS[k % 4];
    const h = 5 + ((k * 3) % 4);
    cylinder(S, x, -3 + (k % 2) * 4, k % 3 === 1 ? 2.4 : 1.8, 25, 25 + h, (n, a) => toneAt(n, g, fr(a * 1.5) < 0.12 ? 0.6 : 0), 5 + k, () => g[4]);
    S.rod([x, -3 + (k % 2) * 4, 25 + h], [x, -3 + (k % 2) * 4, 27 + h], 0.7, 0.6, OAK, 12);
  }
  // a bowl of charms, a scale
  cylinder(S, 8, 2, (z) => 3 + (z - 25) * 0.9, 25, 28, (n) => toneAt(n, BRASS, 0), 13, (a, rr) => (rr > 0.8 ? BRASS[3] : hash(Math.floor(a * 3), Math.floor(rr * 4), 91) > 0.5 ? MASK[3] : GLASS[1][3]));
  S.rod([16, 0, 25], [16, 0, 34], 0.5, 0.5, BRASS, 14);
  S.rod([12, 0, 34], [20, 0, 34], 0.5, 0.5, BRASS, 14);
  for (const x of [12, 20]) S.egg([x, 0, 31], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.2, 2.2, 0.5], (n) => toneAt(n, BRASS, 0.2), 15);
  // (his crystal is his own, in his hands: the trestle has none)
  void f;
  return done(S, 75, 84);
}

/**
 * THE STASH, CAMP-STYLE: an iron-bound strongbox lashed with rope on a little handcart, its lock's stone the town's
 * teal-to-cyan (what outlasts a character). 120 x 100 at (60, 72).
 */
function strongboxCart(): Sprite {
  const S0 = scene(120, 100, 60, 72);
  const S = turned(S0, 0, 1.3);
  slab(S, -18, -11, 14, 11, 12, 15, DEAL, 1, 0, planks(4));
  S.rod([-6, -15, 9], [-6, 15, 9], 1.2, 1.2, IRON, 2);
  wheel(S, [-6, 15, 9], 8.5, 3, 6);
  wheel(S, [-6, -15, 9], 8.5, 6, 6);
  for (const y of [-8, 8]) S.rod([14, y, 13], [30, y, 2], 1.1, 0.9, OAK, 9);
  // the strongbox: oak, bound with iron bands, a hasp and its lock
  S.box([-2, 0, 22], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [12, 9, 7], (face, u, v, n) => {
    const across = face === 4 || face === 5 ? u : face < 2 ? u : v;
    if (Math.abs(across - 0.2) < 0.06 || Math.abs(across - 0.8) < 0.06) return toneAt(n, IRON, 0.2);
    if (face === 4) return toneAt(n, OAK, fr(v * 4) < 0.08 ? -0.4 : 0.15);
    return toneAt(n, OAK, fr(v * 3) < 0.08 ? -0.4 : 0);
  }, 10);
  S.box([10.4, 0, 25], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0.6, 2.4, 2.8], (_f, _u, _v, n) => toneAt(n, IRON, 0.25), 11);
  S.ball([11.2, 0, 24.4], 1.1, ['#0c6a80', '#0c6a80', RUNE, RUNE_HI, RUNE_HI], 12);
  rope(S, [-14, -9.4, 29.2], [-14, 9.4, 29.2], 0.2, 13);
  rope(S, [6, -9.4, 29.2], [6, 9.4, 29.2], 0.2, 13);
  return done(S, 60, 72, [{ at: [11.2, 0, 24.4], r: 10, color: RUNE, a: 0.35 }]);
}

/**
 * THE LEXICON, CAMP-STYLE: the great book open on a lectern made of two crates stood one on another and a board
 * across their top, a lantern hung off a pole beside it; its script the friend's cyan, lifting off the page. `f`
 * (0..1): the script. 110 x 140 at (55, 104).
 */
function campLexicon(f: number): Sprite {
  const S0 = scene(110, 140, 55, 104);
  const S = turned(S0, 0, 1.3);
  slab(S, -11, -9, 11, 9, 0, 18, DEAL, 1, 0, planks(3));
  S.box([0, 0, 27], [[Math.cos(0.15), Math.sin(0.15), 0], [-Math.sin(0.15), Math.cos(0.15), 0], [0, 0, 1]], [9, 8, 9], (f2, u, v, n) => toneAt(n, DEAL, planks(3)(f2, u, v) + 0.05), 2);
  // the slanted board, the book on it: two pages, its script
  const t = 0.42;
  const A: readonly [V3, V3, V3] = [[1, 0, 0], [0, Math.cos(t), Math.sin(t)], [0, -Math.sin(t), Math.cos(t)]];
  S.box([0, 0, 38], A, [12, 8, 1], (_f, _u, _v, n) => toneAt(n, OAK, 0), 3);
  for (const s of [-1, 1]) {
    S.box([s * 5.6, 0.3, 39.6], A, [5.4, 7.4, 0.6], (face, u, v, n) => {
      if (face !== 4) return toneAt(n, PAPER, -0.2);
      const line = fr(v * 7) < 0.32 && u > 0.12 && u < 0.88 && hash(Math.floor(u * 8), Math.floor(v * 7), 101 + s + f) > 0.25;
      return line ? (hash(Math.floor(u * 8), Math.floor(v * 7), 103 + f) > 0.6 ? RUNE_HI : RUNE) : toneAt(n, PAPER, 0.35);
    }, 4 + (s > 0 ? 1 : 0));
  }
  // a pole beside it, the lantern hung from it
  S.rod([-16, 6, 0], [-16, 6, 62], 1, 0.9, OAK, 6);
  S.rod([-16, 6, 60], [-10, 6, 60], 0.7, 0.7, OAK, 7);
  lantern(S, [-10, 6, 50], 8);
  // motes of script lifting off the page
  for (let k = 0; k < 4; k++) S.ball([-4 + k * 3, 1, 44 + ((k * 5 + f * 7) % 12)], 0.7, ['#0c6a80', '#0c6a80', RUNE, RUNE_HI, RUNE_HI], (1 << 20) + 2 + k);
  return done(S, 55, 104, [{ at: [0, 0, 42], r: 26, color: RUNE, a: 0.4 }, { at: [-10, 6, 50], r: 24, color: EMBER[2], a: 0.4 }]);
}

/** A rune of the wordsmith's, chalked: strokes in a box 0..1 by 0..1 (across, up). */
const RUNES: readonly (readonly [number, number, number, number][])[] = [
  [[0.5, 0.1, 0.5, 0.9], [0.5, 0.65, 0.85, 0.85], [0.5, 0.45, 0.15, 0.25]],
  [[0.2, 0.1, 0.2, 0.9], [0.2, 0.9, 0.8, 0.6], [0.8, 0.6, 0.2, 0.4]],
  [[0.5, 0.1, 0.5, 0.9], [0.2, 0.7, 0.8, 0.7], [0.2, 0.35, 0.8, 0.5]],
  [[0.2, 0.1, 0.5, 0.9], [0.5, 0.9, 0.8, 0.1], [0.3, 0.45, 0.7, 0.45]],
  [[0.3, 0.1, 0.3, 0.9], [0.7, 0.1, 0.7, 0.9], [0.3, 0.75, 0.7, 0.35]],
];
function chalked(rune: readonly [number, number, number, number][], a: number, b: number): number {
  let best = 9;
  for (const [x0, y0, x1, y1] of rune) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const t = Math.max(0, Math.min(1, ((a - x0) * dx + (b - y0) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(a - x0 - dx * t, b - y0 - dy * t));
  }
  return best;
}

/**
 * THE WORDSMITH'S RING, CAMP-STYLE, ITS STONES: a paving slab prised up out of the street and stood on end, propped at
 * its foot with rubble, a rune chalked on its face in the friend's cyan (`v` 0..4: which). Its face along +y. 80 x
 * 120 at (40, 96).
 */
function proppedSlab(v: number): Sprite {
  const S0 = scene(80, 120, 40, 96);
  const S = turned(S0, 0, 1.3);
  const t = 0.1 + (v % 2) * 0.06;
  const A: readonly [V3, V3, V3] = [[1, 0, 0], [0, Math.cos(t), Math.sin(t)], [0, -Math.sin(t), Math.cos(t)]];
  const rune = RUNES[v % RUNES.length];
  S.box([0, 0, 22], A, [10, 2.6, 22], (face, u, w, n) => {
    if (face === 2) {
      const d = chalked(rune, (w - 0.0), 0.1 + u * 0.8);
      if (d < 0.05) return RUNE_HI;
      if (d < 0.085) return RUNE;
    }
    const chip = hash(Math.floor(u * 6), Math.floor(w * 4), 111 + v) > 0.86 ? -0.3 : 0;
    return toneAt(n, STONE, chip + (face === 4 ? 0.3 : 0));
  }, 1);
  for (let k = 0; k < 4; k++) {
    const a = k * 1.7 + v;
    S.egg([Math.cos(a) * 11, 5 + Math.sin(a) * 4, 2.4], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [3.6, 2.8, 2.6], (n) => toneAt(n, STONE, -0.1), 2 + k);
  }
  return done(S, 40, 96, [{ at: [0, 2, 26], r: 16, color: RUNE, a: 0.35 }]);
}

/**
 * THE WORDSMITH'S RING, CAMP-STYLE, HIS SLAB: a column's drum fallen from the gatehouse, stood upright as his writing
 * table, runes chalked round its top in the friend's cyan, a stub of chalk on it. 90 x 90 at (45, 64).
 */
function columnDrum(): Sprite {
  const S0 = scene(90, 90, 45, 64);
  const S = turned(S0, 0, 1.3);
  cylinder(S, 0, 0, 13, 0, 18, (n, a, z) => {
    const flute = fr((a / (Math.PI * 2)) * 16) < 0.18;
    const chip = hash(Math.floor(a * 4), Math.floor(z / 6), 121) > 0.85 ? -0.3 : 0;
    return toneAt(n, STONE, (flute ? -0.3 : 0.05) + chip);
  }, 1, (a, rr) => {
    const ring = Math.abs(rr - 0.78) < 0.05;
    const mark = rr > 0.5 && rr < 0.72 && fr((a / (Math.PI * 2)) * 8) < 0.22 && hash(Math.floor((a / (Math.PI * 2)) * 8), 1, 123) > 0.3;
    if (ring || mark) return fr((a / (Math.PI * 2)) * 40) < 0.7 ? RUNE : RUNE_HI;
    return rr > 0.94 ? STONE[4] : STONE[3];
  });
  S.rod([2, 3, 18.8], [6, 1, 18.8], 0.8, 0.8, MASK, 2);
  return done(S, 45, 64, [{ at: [0, 0, 20], r: 22, color: RUNE, a: 0.3 }]);
}

/** THE WORDSMITH'S RING, CAMP-STYLE, ITS CIRCLE: chalked on the setts, two rings and runes round between them, the friend's cyan. Flat. 330 x 170 at (165, 85). */
function chalkRing(): Sprite {
  return lying(330, 170, 165, 85, (u, v) => {
    const r = Math.hypot(u, v);
    const a = Math.atan2(v, u);
    const dash = hash(Math.floor((a / (Math.PI * 2)) * 90), Math.floor(r * 3), 131) > 0.18;
    if (Math.abs(r - 2.35) < 0.035 && dash) return RUNE;
    if (Math.abs(r - 2.0) < 0.03 && dash) return RUNE;
    if (r > 2.04 && r < 2.31) {
      const k = Math.floor((a / (Math.PI * 2) + 0.5) * 12);
      const ca = ((k + 0.5) / 12 - 0.5) * Math.PI * 2;
      const lx = ((u * Math.cos(ca) + v * Math.sin(ca)) - 2.175) / 0.13 * 0.5 + 0.5;
      const ly = ((v * Math.cos(ca) - u * Math.sin(ca)) / 0.13) * 0.5 + 0.5;
      if (lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1 && chalked(RUNES[k % RUNES.length], ly, lx) < 0.09) return RUNE;
    }
    return null;
  });
}

/**
 * THE STRANGER'S CORNER, CAMP-STYLE: a barrel stood up as a table by the wall he leans on, dice and cards on its head,
 * a stub of candle guttering in a saucer, a crate to sit on; his coins in a little stack. 110 x 90 at (55, 66).
 */
function strangerBarrel(f: number): Sprite {
  const S0 = scene(110, 90, 55, 66);
  const S = turned(S0, 0, 1.3);
  cylinder(S, 0, 0, (z) => 8 + 1.4 * Math.sin((z / 24) * Math.PI), 0, 24, (n, a, z) => {
    if (Math.abs(z - 4) < 1.1 || Math.abs(z - 20) < 1.1) return toneAt(n, IRON, 0.25);
    return fr(a * 2.6) < 0.1 ? toneAt(n, OAK, -0.5) : toneAt(n, OAK, 0.05);
  }, 1, (a, rr) => (rr > 0.9 ? OAK[4] : fr(a * 1.2) < 0.06 ? OAK[1] : OAK[3]));
  // two dice, three cards, a stack of coins
  for (const [x, y, k] of [[-2, 1, 0], [2.4, -1.6, 1]] as const) {
    S.box([x, y, 25.3], [[Math.cos(k), Math.sin(k), 0], [-Math.sin(k), Math.cos(k), 0], [0, 0, 1]], [1.3, 1.3, 1.3], (_f, u, v, n) => (Math.hypot(u - 0.5, v - 0.5) < 0.16 ? HOLE : toneAt(n, MASK, 0.2)), 2 + k);
  }
  for (let k = 0; k < 3; k++) {
    const a = k * 0.5 - 0.4;
    S.quad([[-6 + k, -4 + k * 1.2, 24.2 + k * 0.1], [-6 + k + Math.cos(a) * 4, -4 + k * 1.2 + Math.sin(a) * 4, 24.2 + k * 0.1], [-6 + k + Math.cos(a) * 4 - Math.sin(a) * 5.6, -4 + k * 1.2 + Math.sin(a) * 4 + Math.cos(a) * 5.6, 24.2 + k * 0.1], [-6 + k - Math.sin(a) * 5.6, -4 + k * 1.2 + Math.cos(a) * 5.6, 24.2 + k * 0.1]], (u, v) => (Math.abs(u - 0.5) < 0.12 && Math.abs(v - 0.5) < 0.12 ? OXBLOOD[3] : PAPER[4]), 4 + k);
  }
  cylinder(S, 4, 3.6, 1.6, 24, 26.4, (n) => toneAt(n, BRASS, 0.25), 7, () => BRASS[4]);
  // the candle in its saucer
  cylinder(S, -3.6, -5, 2.2, 24, 24.8, (n) => toneAt(n, PAPER, 0), 8);
  cylinder(S, -3.6, -5, 0.9, 24.8, 27.6, (n) => toneAt(n, CREAM, 0.2), 9);
  S.rod([-3.6, -5, 27.8], [-3.6 + (f % 2) * 0.4, -5, 30.4], 0.9, 0.2, [EMBER[2], EMBER[3], EMBER[4], EMBER[4], EMBER[4]], 10);
  // the crate he sits on, beside it
  slab(S, 8, 6, 20, 18, 0, 12, DEAL, 11, 0, planks(3));
  return done(S, 55, 66, [{ at: [-3.6, -5, 29], r: 20 + f * 2, color: EMBER[2], a: 0.4 }]);
}

/** HUB2'S PIECES, by name, as the Gate Ward's are (art/floorkit.ts Piece): each its frames and the shadow under it. */
export interface HubPiece {
  name: string;
  frames: Sprite[];
  shadow: number;
}

let made: HubPiece[] | null = null;
export function hubPieces(): HubPiece[] {
  if (made) return made;
  made = [
    { name: 'the fountain', frames: [0, 1, 2, 3].map(fountain), shadow: 1.5 },
    // (frames: across x, its front along +y; across y, its front along +x)
    { name: 'the ward arch', frames: [wardArch(0), wardArch(1)], shadow: 0 },
    // (frames: variant * 4 + facing)
    { name: 'a tent', frames: [0, 1, 2, 3].flatMap((v) => [0, 1, 2, 3].map((k) => tent(v, k))), shadow: 1.1 },
    { name: 'the cooking fire', frames: [0, 1, 2, 3].map(cookingFire), shadow: 0.5 },
    { name: 'a log to sit on', frames: [logSeat(0), logSeat(1)], shadow: 0.5 },
    // (frames: variant * 2 + which way)
    { name: 'a bedroll', frames: [0, 1, 2, 3].flatMap((v) => [bedroll(v, 0), bedroll(v, 1)]), shadow: 0.3 },
    // THE CITY'S GATE AS THE CAMP HOLDS IT (art/floor11.ts cityGate, held): the Order's banner down and the city's up, the
    // ink scrubbed off the arms, the dome's shard pulled out. (frames: its front along +y, along +x)
    { name: 'the city gate, held', frames: [cityGate(0, true), cityGate(1, true)], shadow: 1.6 },
    // THE CAMP'S SHOPS (his picks), and the rest camp-style to look at
    { name: "the armourer's field forge", frames: [0, 1, 2, 3].map(forgeCart), shadow: 1.6 },
    { name: "the armourer's anvil, on its stump", frames: [anvilStump()], shadow: 0.4 },
    { name: "the mystic's caravan", frames: [caravan()], shadow: 2.0 },
    { name: "the mystic's trestle", frames: [0, 1, 2, 3].map(trestle), shadow: 0.9 },
    { name: 'the stash, on its cart', frames: [strongboxCart()], shadow: 0.6 },
    { name: 'the Lexicon, on its crates', frames: [campLexicon(0), campLexicon(1)], shadow: 0.5 },
    { name: "the wordsmith's stone, propped", frames: [0, 1, 2, 3, 4].map(proppedSlab), shadow: 0.45 },
    { name: "the wordsmith's drum", frames: [columnDrum()], shadow: 0.5 },
    { name: "the wordsmith's chalk ring", frames: [chalkRing()], shadow: 0 },
    { name: "the stranger's barrel", frames: [0, 1].map(strangerBarrel), shadow: 0.5 },
  ];
  return made;
}
