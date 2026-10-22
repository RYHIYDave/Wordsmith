// FLOOR 11, THE GATE WARD (THE CRIER'S SQUARE): ITS OWN PIECES, themed after its boss (a mock-up; nothing of
// the game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the
// theme of the 5 levels, then 25 for each boss.” This floor's boss is the Crier, the town crier, a huge man
// whose voice was the first the Silent Order took; the Hush speaks through his great brass speaking-trumpet
// (the planning chat's post of 18 Oct, 08:48 Eastern, with his “Yes” at 05:47 Pacific). So his floor's pieces
// are the crier's own world: the market square he called in, the rostrum he called from, the notice board his
// proclamations were pinned to (blank now), the festival the siege's end was to be, and the scars of the
// siege on it. Its ground, with his yes: art/gateward.ts.
//
// THE STORY IN THEM: the welcome is wrong. The bunting is up for a festival nobody is having; the
// proclamations are blank; the herald on his plinth has a black gag tied over his trumpet's mouth; the guild
// signs have their pictures blotted out with the Silent Order's black ink; the market bell is gagged in black
// cloth and chains (the Bells, the set's event: struck, the Hush pours out). Firepots of the siege still
// burn in their craters with the cult's pink fire; shards of the broken dome glitter pink in the gutters.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { timber, rope } from './floor6';
import type { Piece } from './floorkit';
import { CYAN, hash, mix } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { bright } from './act2_quiet';
import { BLACK, BOTTLE, BRASS, BRONZE, CHAR, CREAM, DEAL, GREENS, IRON, MASK, MUSTARD, OAK, OXBLOOD, PAPER, ROPE, SLATEBLUE, STONE, STRAW, APPLE, CRUST, HOLE, SOFT_ID, WATER, checker, cylinder, done, facing, frontPiece, local, planks, scene, slab, turned } from './act2_kit';

const fr = (t: number): number => t - Math.floor(t);

// =================================================================================================
// THE MARKET

/** A STALL'S AWNING colours, one to a stall: [the stripe, the plain]. */
const AWNINGS: readonly [Ramp, Ramp][] = [
  [OXBLOOD, CREAM],
  [BOTTLE, CREAM],
  [MUSTARD, OXBLOOD],
  [SLATEBLUE, CREAM],
];

/** What a stall sells, piled on its counter. */
type Goods = 'apples' | 'greens' | 'bread' | 'cloth';

/** Apples, cabbages or loaves heaped in a shallow basket at (x, y) on the counter (z). */
function basket(S: Scene, x: number, y: number, z: number, goods: Goods, id: number, seed: number): void {
  // the basket: a low wicker drum
  cylinder(S, x, y, 7, z, z + 4, (n, a, zz) => (fr(a * 3) < 0.15 || fr(zz / 2) < 0.3 ? toneAt(n, ROPE, -0.3) : toneAt(n, ROPE, 0)), id);
  if (goods === 'cloth') return;
  const R = goods === 'apples' ? APPLE : goods === 'greens' ? GREENS : CRUST;
  const r = goods === 'apples' ? 2.2 : goods === 'greens' ? 3.2 : 2.8;
  const pts: V3[] = [];
  for (let k = 0; k < 9; k++) {
    const a = k * 2.4 + seed;
    const d = k === 0 ? 0 : 3.2 + (k % 3);
    pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d, z + 4 + r * 0.6 + (k === 0 ? r : 0)]);
  }
  pts.forEach((c, k) => {
    if (goods === 'bread') S.egg(c, [[Math.cos(k), Math.sin(k), 0], [-Math.sin(k), Math.cos(k), 0], [0, 0, 1]], [r * 1.6, r, r * 0.8], (n) => toneAt(n, CRUST, 0.1), id + 1 + k);
    else S.ball(c, r, R, id + 1 + k, undefined, 0.05);
  });
}

/** Bolts of cloth laid on the counter, each its own dye. */
function bolts(S: Scene, x: number, y: number, z: number, id: number): void {
  const dyes = [OXBLOOD, BOTTLE, MUSTARD, SLATEBLUE, CREAM];
  for (let k = 0; k < 4; k++) {
    const c: V3 = [x - 9 + k * 6, y, z + 3];
    S.egg(c, [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [9, 2.8, 2.8], (n, w) => (fr((w[1] - y) / 3) < 0.12 ? toneAt(n, dyes[k], -0.4) : toneAt(n, dyes[k], 0.05)), id + k);
  }
}

/**
 * A MARKET STALL: a counter of weathered deal with a cloth hung down its front, four posts, a striped awning
 * sloping down toward the street, its scalloped valance; goods on the counter. `smashed`: the siege went
 * through it: a front post snapped and fallen across, the awning torn and hanging in strips from the back
 * beam, the counter split, its goods spilled. Its front looks along +y. 120 x 140 at (60, 112).
 */
function stall(variant: number, smashed: boolean, facing = 0): Sprite {
  const S0 = scene(120, 140, 60, 112);
  const S = turned(S0, facing);
  const [STRIPE, PLAIN] = AWNINGS[variant % AWNINGS.length];
  const goods: Goods = (['apples', 'greens', 'bread', 'cloth'] as const)[variant % 4];
  // the counter
  if (!smashed) {
    slab(S, -26, -6, 26, 12, 0, 22, DEAL, 1, 0, planks(4));
    // the cloth hung down its front, gathered
    S.quad([[-26, 12.4, 22], [26, 12.4, 22], [26, 12.4, 6], [-26, 12.4, 6]], (u, v, w) => {
      const fold = Math.sin(u * 30);
      if (v > 0.85 + 0.08 * fold) return null;
      const stripe = fr(u * 6) < 0.5;
      return toneAt([0, 1, 0.2 + fold * 0.3], stripe ? STRIPE : PLAIN, fold * 0.25 + (w[2] > 20 ? 0.15 : 0));
    }, 2);
    if (goods === 'cloth') bolts(S, 0, 3, 22, 10);
    else {
      basket(S, -12, 2, 22, goods, 10, variant);
      basket(S, 10, 4, 22, goods, 30, variant + 1.3);
    }
  } else {
    // split: its left half sagged to the floor, its right still up on a trestle
    S.box([-14, 3, 7], [[0.96, 0, -0.28], [0, 1, 0], [0.28, 0, 0.96]], [13, 9, 6], (f, u, v, n) => toneAt(n, DEAL, planks(3)(f, u, v)), 1);
    slab(S, 2, -6, 26, 12, 0, 22, DEAL, 2, 0, planks(3));
    // its goods spilled across the floor before it
    for (let k = 0; k < 11; k++) {
      const a = hash(k, variant, 11) * Math.PI * 2;
      const d = 10 + hash(k, variant, 12) * 22;
      const R = goods === 'greens' ? GREENS : goods === 'bread' ? CRUST : APPLE;
      S.ball([-4 + Math.cos(a) * d * 1.2, 22 + Math.sin(a) * d * 0.5, 2.2], 2.2, R, 40 + k);
    }
  }
  // the posts: the back two taller, so the awning slopes toward the street
  const posts: [number, number, number][] = [[-28, -14, 82], [28, -14, 82], [-28, 18, 66], [28, 18, 66]];
  posts.forEach(([x, y, h], k) => {
    if (smashed && k === 2) return;
    timber(S, [x, y, 0], [x, y, smashed && k === 3 ? 40 : h], 1.6, 60 + k);
  });
  if (smashed) {
    // the snapped front post, fallen across the counter and down to the floor
    timber(S, [-30, 26, 1.5], [-2, 8, 28], 1.6, 64);
    timber(S, [28, 18, 40], [24, 19, 52], 1.4, 65); // its stump's splinter
  }
  // the awning's frame along the back and the front
  timber(S, [-30, -14, 82], [30, -14, 82], 1.3, 66);
  if (!smashed) timber(S, [-30, 18, 66], [30, 18, 66], 1.3, 67);
  // THE AWNING: canvas from the back beam down to the front, striped across, sagging a little between the posts
  const aw = (u: number, v: number): V3 => [-30 + 60 * u, -14 + 34 * v, 82 - 16 * v - 3 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v)];
  const N = 12;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < 6; j++) {
      const u0 = i / N;
      const u1 = (i + 1) / N;
      const v0 = j / 6;
      const v1 = (j + 1) / 6;
      if (smashed && v0 > 0.25) continue;
      S.quad([aw(u0, v0), aw(u1, v0), aw(u1, v1), aw(u0, v1)], (u) => {
        const uu = u0 + (u1 - u0) * u;
        const R = fr(uu * 5) < 0.5 ? STRIPE : PLAIN;
        // lit from the upper left: its top a step brighter toward the back, its sag shaded
        return R[uu < 0.12 || uu > 0.88 ? 2 : 3];
      }, 70);
    }
  }
  if (!smashed) {
    // its valance, hanging along the front, cut in scallops
    S.quad([aw(0, 1), aw(1, 1), [30, 20, 54], [-30, 20, 54]], (u, v) => {
      const sc = Math.abs(Math.sin(u * Math.PI * 10));
      if (v > 0.55 + 0.45 * sc) return null;
      const R = fr(u * 5) < 0.5 ? STRIPE : PLAIN;
      return v < 0.12 ? R[3] : R[2];
    }, 71);
  } else {
    // torn strips hanging from what is left, ragged at their feet
    for (let k = 0; k < 7; k++) {
      const u = 0.06 + k * 0.14 + hash(k, variant, 13) * 0.05;
      const len = 18 + hash(k, variant, 14) * 30;
      const top = aw(u, 0.25);
      const R = fr(u * 5) < 0.5 ? STRIPE : PLAIN;
      S.quad([top, [top[0] + 4, top[1], top[2]], [top[0] + 5, top[1] + 4, top[2] - len], [top[0] + 1, top[1] + 4, top[2] - len * 0.8]], (_u, v) => (v > 0.9 ? R[1] : R[2]), 72 + k);
    }
  }
  return done(S0, 60, 112);
}

/**
 * THE CART BARRICADE, left from the siege: a market cart heaved over on its side across the way, its bed a
 * wall of planks toward the street, its wheels up; crates and a door piled against it, a sack slumped at
 * its foot. Two tiles long, along x. 150 x 120 at (75, 92).
 */
function cartBarricade(): Sprite {
  const S = scene(150, 120, 75, 92);
  // the bed, on its side: its floor toward +y (the street), planked
  S.box([0, -4, 18], [[1, 0, 0], [0, 0, 1], [0, -1, 0]], [36, 18, 9], (f, u, v, n) => {
    if (f === 2 || f === 3) {
      // its floor (face +y): planks along x
      const t = v * 6;
      return toneAt(n, DEAL, Math.abs(t - Math.round(t)) < 0.08 ? -0.6 : (hash(Math.floor(t), 1, 21) - 0.5) * 0.3);
    }
    return toneAt(n, DEAL, planks(3)(f, u, v));
  }, 1);
  // its iron straps across the floor
  for (const x of [-26, 0, 26]) S.quad([[x - 1.4, 5.2, 0], [x + 1.4, 5.2, 0], [x + 1.4, 5.2, 36], [x - 1.4, 5.2, 36]], (_u, v, w) => toneAt([0, 1, 0], IRON, Math.abs(w[2] - 18) < 1 ? 0.6 : 0.1 + v * 0.1), 2);
  // the wheels, up, spoked, iron-rimmed: one at each end, on its axle, seen edge-ish
  for (const x of [-24, 24]) {
    const c: V3 = [x, -16, 34];
    const N = 28;
    for (let k = 0; k < N; k++) {
      const a0 = (k / N) * Math.PI * 2;
      const a1 = ((k + 1) / N) * Math.PI * 2;
      const P = (a: number, r: number): V3 => [c[0] + Math.cos(a) * r, c[1] - 3, c[2] + Math.sin(a) * r];
      S.quad([P(a0, 14), P(a1, 14), P(a1, 16.5), P(a0, 16.5)], () => toneAt([0, 1, Math.sin((a0 + a1) / 2)], IRON, 0.1), 3);
      S.quad([P(a0, 11), P(a1, 11), P(a1, 14), P(a0, 14)], () => toneAt([0, 1, Math.sin((a0 + a1) / 2)], OAK, 0.1), 3);
    }
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.3;
      S.rod([c[0], c[1] - 3, c[2]], [c[0] + Math.cos(a) * 11, c[1] - 3, c[2] + Math.sin(a) * 11], 1.1, 0.9, OAK, 4);
    }
    S.ball([c[0], c[1] - 3, c[2]], 2.6, IRON, 5);
  }
  // the shafts, sticking up and out
  timber(S, [36, -2, 30], [58, -6, 62], 1.4, 6);
  timber(S, [36, -12, 30], [56, -18, 64], 1.4, 7);
  // crates piled against it, and a door leant on them
  slab(S, -42, 6, -24, 22, 0, 16, DEAL, 8, 0, planks(3));
  slab(S, -38, 8, -26, 20, 16, 28, DEAL, 9, 0.1, planks(2));
  S.box([-6, 14, 18], [[1, 0, 0], [0, 0.42, 0.91], [0, -0.91, 0.42]], [14, 1.6, 20], (f, u, v, n) => {
    if (f > 1 && f < 4) return toneAt(n, OAK, 0);
    const t = u * 4;
    return toneAt(n, OAK, Math.abs(t - Math.round(t)) < 0.06 ? -0.6 : 0.05);
  }, 10);
  // a sack slumped at its foot
  S.egg([20, 14, 6], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [8, 6, 6], (n, w) => (w[2] > 10 ? toneAt(n, CREAM, -0.2) : toneAt(n, CREAM, -0.05)), 11);
  return done(S, 75, 92);
}

/** BASKETS OF PRODUCE set out on the ground before a stall: apples, greens, loaves. `spilled`: knocked over, the goods rolled out. 90 x 70 at (45, 52). */
function produce(spilled: boolean): Sprite {
  const S = scene(90, 70, 45, 52);
  if (!spilled) {
    basket(S, -10, 2, 0, 'apples', 1, 0.4);
    basket(S, 6, -6, 0, 'greens', 20, 1.1);
    basket(S, 8, 10, 0, 'bread', 40, 2.3);
  } else {
    // one tipped on its side, its apples rolled out; the others trodden flat
    S.egg([-8, 2, 4], [[0.8, 0.6, 0], [-0.6, 0.8, 0], [0, 0, 1]], [7, 4, 4], (n, w) => (fr((w[0] + w[1]) / 3) < 0.2 ? toneAt(n, ROPE, -0.3) : toneAt(n, ROPE, 0)), 1);
    for (let k = 0; k < 12; k++) {
      const a = hash(k, 7, 101) * 1.6 - 0.2;
      const d = 6 + hash(k, 8, 101) * 20;
      S.ball([-2 + Math.cos(a) * d, 6 + Math.sin(a) * d * 0.7, 2.1], 2.1, k % 3 ? APPLE : GREENS, 2 + k);
    }
    S.egg([10, -6, 1.2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [8, 6, 1.4], (n) => toneAt(n, ROPE, -0.1), 20);
  }
  return done(S, 45, 52);
}

/** SACKS OF GRAIN slumped against each other. `slit`: one slashed open, its grain run out in a heap. 80 x 70 at (40, 54). */
function sacks(slit: boolean): Sprite {
  const S = scene(80, 70, 40, 54);
  const sack = (x: number, y: number, z: number, tilt: number, id: number, empty = false): void => {
    S.egg([x, y, z + (empty ? 4 : 9)], [[1, 0, 0], [0, Math.cos(tilt), Math.sin(tilt)], [0, -Math.sin(tilt), Math.cos(tilt)]], [8, 7, empty ? 4 : 10], (n, w) => {
      if (Math.abs(w[2] - z - 15) < 1 && !empty) return toneAt(n, ROPE, -0.4); // its tie
      return toneAt(n, CREAM, (hash(Math.floor(w[0]), Math.floor(w[2] / 2), id) - 0.5) * 0.2 - 0.05);
    }, id);
  };
  sack(-8, -2, 0, 0.1, 1);
  sack(6, -4, 0, -0.15, 2);
  sack(-1, 8, 0, 0.3, 3, slit);
  if (slit) {
    // the grain run out of it in a low heap, its slash dark
    S.egg([2, 16, 0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [10, 7, 3], (n) => toneAt(n, ['#3e3220', '#5a4a2a', '#7a6636', '#9a8444', '#b8a058'], 0.1), 4);
  }
  return done(S, 40, 54);
}

/** A HANDCART of the market: a barrow on two wheels, its handles down on the setts, a crate and a sack in it. 100 x 80 at (50, 62). */
function handcart(): Sprite {
  const S = scene(100, 80, 50, 62);
  // its bed, tipped forward onto its handles
  S.box([0, 0, 12], [[0.97, 0, 0.24], [0, 1, 0], [-0.24, 0, 0.97]], [16, 10, 4], (f, u, v, n) => toneAt(n, DEAL, planks(3)(f, u, v)), 1);
  for (const y of [-11, 11]) S.box([0, y, 16], [[0.97, 0, 0.24], [0, 1, 0], [-0.24, 0, 0.97]], [16, 1, 4], (_f, _u, _v, n) => toneAt(n, DEAL, 0.05), 2);
  // its handles to the setts
  for (const y of [-8, 8]) timber(S, [14, y, 15], [32, y, 2], 1.2, 3);
  // its wheels, at its back
  for (const y of [-13, 13]) {
    const c: V3 = [-6, y, 9];
    const N = 24;
    for (let k = 0; k < N; k++) {
      const a0 = (k / N) * Math.PI * 2;
      const a1 = ((k + 1) / N) * Math.PI * 2;
      const P = (a: number, r: number): V3 => [c[0] + Math.cos(a) * r, c[1], c[2] + Math.sin(a) * r];
      S.quad([P(a0, 7), P(a1, 7), P(a1, 9), P(a0, 9)], () => toneAt([0, Math.sign(y), Math.sin((a0 + a1) / 2)], IRON, 0.1), 4);
    }
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      S.rod(c, [c[0] + Math.cos(a) * 7, c[1], c[2] + Math.sin(a) * 7], 0.8, 0.7, OAK, 5);
    }
  }
  // what is in it
  slab(S, -10, -6, 2, 6, 14, 24, DEAL, 6, 0.1, planks(2));
  S.egg([6, 0, 22], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [6, 6, 7], (n) => toneAt(n, CREAM, -0.05), 7);
  return done(S, 50, 62);
}

// =================================================================================================
// THE CRIER'S OWN

/** A SPEAKING-TRUMPET of brass from `a` (its mouthpiece) to `b` (the rim of its bell), its bell `R` across. */
export function speakingTrumpet(S: Scene, a: V3, b: V3, R: number, id: number, gag = false): void {
  // the long cone, a ring of brass at its throat
  S.rod(a, b, 1.2, R * 0.55, BRASS, id);
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const L = Math.hypot(d[0], d[1], d[2]);
  const D: V3 = [d[0] / L, d[1] / L, d[2] / L];
  const up: V3 = Math.abs(D[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const B1: V3 = [up[1] * D[2] - up[2] * D[1], up[2] * D[0] - up[0] * D[2], up[0] * D[1] - up[1] * D[0]];
  const b1l = Math.hypot(...B1);
  const A1: V3 = [B1[0] / b1l, B1[1] / b1l, B1[2] / b1l];
  const A2: V3 = [D[1] * A1[2] - D[2] * A1[1], D[2] * A1[0] - D[0] * A1[2], D[0] * A1[1] - D[1] * A1[0]];
  // the bell's flared rim, its dark mouth
  S.egg(b, [D, A1, A2], [1.6, R, R], (n, w) => {
    const q: V3 = [w[0] - b[0], w[1] - b[1], w[2] - b[2]];
    const along = q[0] * D[0] + q[1] * D[1] + q[2] * D[2];
    const rr = Math.hypot(q[0] * A1[0] + q[1] * A1[1] + q[2] * A1[2], q[0] * A2[0] + q[1] * A2[1] + q[2] * A2[2]);
    if (along > 0.3 && rr < R * 0.78) return gag ? toneAt(n, BLACK, 0.1) : HOLE;
    return toneAt(n, BRASS, 0.15);
  }, id + 1);
  // a ring of brass two thirds of the way along
  const m: V3 = [a[0] + d[0] * 0.3, a[1] + d[1] * 0.3, a[2] + d[2] * 0.3];
  S.egg(m, [D, A1, A2], [0.9, 2.2, 2.2], (n) => toneAt(n, BRASS, 0.3), id + 2);
  if (gag) {
    // the Silent Order's black cloth bound over its mouth, knotted, its ends hanging
    S.egg([b[0] - D[0] * 2, b[1] - D[1] * 2, b[2] - D[2] * 2], [D, A1, A2], [3.4, R + 0.8, R + 0.8], (n, w) => (fr((w[0] + w[1] + w[2]) / 4) < 0.15 ? toneAt(n, BLACK, -0.3) : toneAt(n, BLACK, 0.2)), id + 3);
    for (const k of [0, 1]) {
      const knot: V3 = [b[0] - D[0] * 2 + A2[0] * -R, b[1] - D[1] * 2 + A2[1] * -R, b[2] - D[2] * 2 - R];
      S.quad([knot, [knot[0] + 2, knot[1], knot[2]], [knot[0] + 3 + k * 3, knot[1] + 2, knot[2] - 14 - k * 4], [knot[0] + 1 + k * 3, knot[1] + 2, knot[2] - 12 - k * 4]], (_u, v) => (v > 0.85 ? BLACK[1] : BLACK[2 + k]), id + 4 + k);
    }
  }
}

/**
 * THE CRIER'S ROSTRUM: a platform of deal on an oak frame, three steps up its front, a rail round its back
 * and sides; on a hook-post at its back his spare speaking-trumpet hangs; the herald's banner on a pole at
 * its corner, the city's colours, blank. 120 x 170 at (60, 136).
 */
function rostrum(): Sprite {
  const S = scene(120, 170, 60, 136);
  const T = 26;
  // the frame and its planked top
  slab(S, -24, -24, 24, 22, 0, T, DEAL, 1, 0, planks(5));
  for (const [x, y] of [[-24, 22], [24, 22], [24, -24]] as const) timber(S, [x, y, 0], [x, y, T + 0.5], 1.8, 2);
  // the steps up its front
  for (let k = 0; k < 3; k++) slab(S, -10, 22 + (2 - k) * 6, 10, 28 + (2 - k) * 6, 0, (k + 1) * (T / 3) - 0.5, OAK, 3 + k, 0.1, planks(2));
  // its rail, round the back and the sides
  for (const [x, y] of [[-23, -23], [0, -23], [23, -23], [23, 0], [23, 20], [-23, 0], [-23, 20]] as const) timber(S, [x, y, T], [x, y, T + 22], 1.1, 8);
  timber(S, [-23, -23, T + 22], [23, -23, T + 22], 1.1, 9);
  timber(S, [23, -23, T + 22], [23, 20, T + 22], 1.1, 9);
  timber(S, [-23, -23, T + 22], [-23, 20, T + 22], 1.1, 9);
  // his spare speaking-trumpet laid along the back rail on two iron hooks, its bell to the right
  for (const x of [-10, 6]) S.rod([x, -22, T + 22], [x, -20, T + 17], 0.6, 0.6, IRON, 10);
  speakingTrumpet(S, [-20, -19, T + 18], [16, -18, T + 22], 7.5, 11);
  // the banner pole at its back corner, and the banner: oxblood, a cream border, nothing on it
  S.rod([22, -22, T], [22, -22, T + 92], 1, 1, OAK, 15);
  for (let k = 0; k < 10; k++) {
    const t = k / 10;
    const t1 = (k + 1) / 10;
    const wave = (tt: number): number => Math.sin(tt * 5) * 2;
    S.quad([[22 - t * 26, -22 + wave(t), T + 90], [22 - t1 * 26, -22 + wave(t1), T + 90], [22 - t1 * 26, -22 + wave(t1), T + 56 - t1 * 3], [22 - t * 26, -22 + wave(t), T + 56 - t * 3]], (u, v) => {
      const uu = t + (t1 - t) * u;
      if (v < 0.07 || v > 0.93 || uu > 0.94) return CREAM[2];
      return OXBLOOD[Math.cos((t + (t1 - t) * u) * 5) > 0 ? 3 : 2];
    }, 16);
  }
  return done(S, 60, 136);
}

/**
 * THE NOTICE BOARD of the crier's square: two oak posts, a board between them under a little pitched roof of
 * shingles; the proclamations pinned to it, blank (the Hush's), one torn half away, a wax seal on some.
 * 100 x 120 at (50, 104).
 */
function noticeBoard(): Sprite {
  const S = scene(100, 120, 50, 104);
  for (const x of [-22, 22]) timber(S, [x, 0, 0], [x, 0, 66], 1.8, 1);
  // the board
  slab(S, -24, -1.6, 24, 1.6, 22, 58, OAK, 2, -0.05, planks(5));
  // the roof
  S.quad([[-28, -7, 62], [28, -7, 62], [28, 0, 70], [-28, 0, 70]], (u, v) => (fr(v * 4) < 0.2 ? OAK[1] : fr(u * 9 + Math.floor(v * 4) * 0.5) < 0.1 ? OAK[1] : OAK[2]), 3);
  S.quad([[-28, 0, 70], [28, 0, 70], [28, 7, 62], [-28, 7, 62]], (u, v) => (fr(v * 4) < 0.2 ? OAK[2] : fr(u * 9 + Math.floor(v * 4) * 0.5) < 0.1 ? OAK[2] : OAK[3]), 4);
  // the sheets, each a little turned, pinned at the top
  const sheets: [number, number, number, number, number][] = [[-16, 50, 12, 15, -0.08], [-1, 51, 13, 16, 0.05], [14, 49, 11, 14, 0.1], [-12, 32, 12, 13, 0.06], [6, 33, 14, 12, -0.07]];
  sheets.forEach(([x, z, w, h, rot], k) => {
    const torn = k === 2;
    const P = (u: number, v: number): V3 => [x + (u - 0.5) * w + v * h * rot, 1.9 + k * 0.05, z - v * h + (u - 0.5) * w * rot];
    S.quad([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], (u, v) => {
      if (torn && v > 0.45 + 0.2 * Math.sin(u * 13)) return null;
      if (v < 0.08 && Math.abs(u - 0.5) < 0.08) return IRON[3]; // its nail
      if (k % 2 === 0 && v > 0.7 && v < 0.84 && Math.abs(u - 0.75) < 0.1) return OXBLOOD[3]; // a wax seal, nothing over it
      return PAPER[u < 0.06 || v > 0.94 ? 2 : 3];
    }, 10 + k);
  });
  return done(S, 50, 104);
}

/**
 * THE TOWN WELL of the square: a round wall of the city's stone, its throat dark, a winch of oak on two posts
 * with its rope down into it, a bucket on the rim, a little shingled roof over the winch. 100 x 140 at (50, 114).
 */
function well(): Sprite {
  const S = scene(100, 140, 50, 114);
  // the wall: courses of stone, its rim a ring of dressed stone
  cylinder(S, 0, 0, 17, 0, 18, (n, a, z) => {
    const course = Math.floor(z / 5);
    const joint = fr(a * 5 + course * 0.5) < 0.05 || fr(z / 5) < 0.12;
    return toneAt(n, STONE, joint ? -0.55 : (hash(Math.floor(a * 5 + course * 0.5), course, 31) - 0.5) * 0.3);
  }, 1);
  cylinder(S, 0, 0, 18, 18, 21, (n) => toneAt(n, STONE, 0.25), 2, (_a, rr) => (rr > 0.78 ? STONE[4] : rr > 0.74 ? STONE[2] : rr > 0.7 ? WATER[1] : HOLE));
  // the posts and the winch between them
  for (const x of [-15, 15]) timber(S, [x, 0, 18], [x, 0, 62], 1.6, 3);
  timber(S, [-17, 0, 52], [17, 0, 52], 2.2, 4);
  S.rod([17, 0, 52], [22, 0, 46], 0.8, 0.8, IRON, 5); // its crank
  S.rod([22, 0, 46], [22, 3, 46], 0.8, 0.8, OAK, 5);
  rope(S, [-2, 0, 50], [-2, 0, 22], 0, 6, 0.6);
  // the bucket on the rim
  cylinder(S, 12, 12, (z) => 4.2 + (z - 21) * 0.05, 21, 29, (n, a) => (fr(a * 2.5) < 0.1 ? toneAt(n, OAK, -0.4) : toneAt(n, OAK, 0)), 7, () => WATER[2]);
  // the roof over the winch
  S.quad([[-20, -8, 64], [20, -8, 64], [20, 0, 72], [-20, 0, 72]], (u, v) => (fr(v * 3) < 0.2 ? OAK[1] : OAK[2]), 8);
  S.quad([[-20, 0, 72], [20, 0, 72], [20, 8, 64], [-20, 8, 64]], (u, v) => (fr(v * 3) < 0.2 ? OAK[2] : OAK[3]), 9);
  return done(S, 50, 114);
}

/**
 * THE HERALD, on his plinth in the square: a stone figure of the city's first herald, robed, his speaking-
 * trumpet raised to his mouth; the Silent Order has bound a black gag over its mouth, its ends hanging.
 * 90 x 190 at (45, 172).
 */
function heraldStatue(): Sprite {
  const S = scene(120, 200, 50, 182);
  // the plinth: a step, a block, a moulded cap
  slab(S, -17, -17, 17, 17, 0, 6, STONE, 1, -0.05);
  slab(S, -14, -14, 14, 14, 6, 30, STONE, 2, 0, (f, _u, v) => (f < 4 && v > 0.42 && v < 0.5 ? -0.5 : 0));
  slab(S, -16, -16, 16, 16, 30, 34, STONE, 3, 0.1);
  // the figure, in a paler stone streaked by the rain
  const ST: Ramp = ['#3a3440', '#585060', '#7a7076', '#9c908c', '#b8ac a2'.replace(' ', '')];
  const streak = (w: V3): number => (fr(w[0] * 0.21 + w[1] * 0.13) < 0.08 ? -0.25 : 0);
  // his long robe, falling in folds to the plinth, a cloak behind him
  cylinder(S, 0, 0, (z) => 10.5 - (z - 34) * 0.08, 34, 76, (n, a, z) => toneAt(n, ST, Math.sin(a * 6) * 0.14 + streak([a * 9, 0, z])), 4);
  S.egg([-1, -5, 74], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [11, 5, 26], (n, w) => toneAt(n, ST, -0.1 + streak(w)), 5);
  // his chest, his shoulders, his head, his herald's cap and its plume
  S.egg([0, 0, 85], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [9, 6.5, 10], (n, w) => toneAt(n, ST, 0.05 + streak(w)), 6);
  for (const x of [-8, 8]) S.ball([x, 0, 92], 3.6, ST, 7);
  S.ball([1, 1, 102], 5.6, ST, 8, undefined, 0.05);
  S.egg([1, 0, 107], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [7, 7, 2.6], (n) => toneAt(n, ST, 0.1), 9);
  S.egg([0, -1, 109], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [4.6, 4.6, 3], (n) => toneAt(n, ST, 0.1), 9);
  for (let k = 0; k < 6; k++) S.ball([-4 - k * 1.4, -2 - k * 1.2, 110 + k * 2.2 - k * k * 0.12], 1.6 - k * 0.12, ST, 10);
  // his left arm down, a scroll in his hand
  S.rod([-8, 1, 91], [-12, 4, 80], 2.6, 2.2, ST, 11);
  S.rod([-12, 4, 80], [-7, 9, 76], 2.2, 2, ST, 11);
  S.rod([-12, 8, 75], [-2, 11, 74], 1.8, 1.8, ST, 12);
  // his right arm raised, his hand on the trumpet; the trumpet to his lips, its bell out over the square, gagged
  S.rod([8, 1, 92], [15, 5, 92], 2.6, 2.2, ST, 13);
  S.rod([15, 5, 92], [12, 10, 101], 2.2, 2, ST, 13);
  speakingTrumpet(S, [3, 5, 102], [34, 16, 106], 7.5, 14, true);
  return done(S, 50, 182);
}

// =================================================================================================
// THE SIEGE'S SCARS

/**
 * A FIREPOT'S CRATER, still burning (his doc's hazard: “firepot craters still burning”): a scorched ring of
 * broken setts, the clay pot's shards, and the cult's fire burning in its heart, pink to gold, flickering
 * (four frames). Laid on the floor. 96 x 96 at (48, 68).
 */
function firepotCrater(f: number): Sprite {
  const p = new Px(96, 96);
  const AX = 48;
  const AY = 68;
  // the ground: scorched setts broken in a ring, char in the middle
  const ground = new Px(96, 96);
  for (let py = 0; py < 96; py++) {
    for (let px = 0; px < 96; px++) {
      const a = (px + 0.5 - AX) / 32;
      const b = (py + 0.5 - AY) / 16;
      const u = (a + b) / 2;
      const v = (b - a) / 2;
      const d = Math.hypot(u, v);
      if (d > 0.62) continue;
      let c: string;
      if (d < 0.26) c = CHAR[hash(px >> 1, py >> 1, 41) < 0.3 ? 1 : 0];
      else {
        const ang = Math.atan2(v, u);
        const chunk = Math.floor(ang * 3 + d * 9);
        if (d > 0.48 && hash(chunk, 1, 42) < 0.45) continue;
        const lit = fr(ang * 3 + d * 9) < 0.2;
        const gap = fr(ang * 3 + d * 9) > 0.9;
        c = gap ? CHAR[0] : mix(lit ? STONE[4] : STONE[hash(chunk, 2, 43) < 0.5 ? 2 : 3], CHAR[1], Math.max(0, 0.62 - d) * 1.2);
      }
      ground.set(px, py, c);
    }
  }
  p.blit(ground, 0, 0);
  // the pot's shards, standing on edge in the char
  for (let k = 0; k < 5; k++) {
    const a = k * 1.3 + 0.4;
    const x = Math.round(AX + Math.cos(a) * 14);
    const y = Math.round(AY + Math.sin(a) * 6);
    p.rect(x, y - 3, 3, 3, k % 2 ? '#5a3a30' : '#7a5040').set(x, y - 3, '#94684e');
  }
  // the cult's fire: tongues of pink burning to gold, licking up from the heart, leaping, each frame its own
  const tongues = 7;
  for (let k = 0; k < tongues; k++) {
    const x0 = AX - 15 + k * 5 + ((k * 7 + f) % 3) - 1;
    const mid = 1 - Math.abs(k - 3) / 3.5;
    const h = Math.round(10 + mid * 22 + ((k * 5 + f * 3) % 7));
    const lean = ((f + k) % 4) - 1.5;
    for (let i = 0; i < h; i++) {
      const t = i / h;
      const hw = Math.max(0.5, (2.4 + mid * 1.6) * Math.sin(Math.PI * (0.25 + t * 0.75)) * (1 - t * 0.4));
      const m = x0 + lean * t * t * 4;
      for (let x = Math.floor(m - hw); x < Math.ceil(m + hw); x++) {
        const dd = Math.abs(x + 0.5 - m) / hw;
        p.set(x, AY - 3 - i, dd < 0.4 && t < 0.45 ? FLAME[4] : dd < 0.75 && t < 0.72 ? FLAME[3] : t > 0.86 ? FLAME[0] : t > 0.7 ? FLAME[1] : FLAME[2]);
      }
    }
  }
  // sparks flung up
  for (let k = 0; k < 7; k++) {
    const x = AX - 14 + ((k * 11 + f * 5) % 29);
    const y = AY - 30 - ((k * 7 + f * 9) % 22);
    p.set(x, y, FLAME[3]).set(x, y + 1, FLAME[2]);
  }
  const sp = p.sprite(AX, AY, 2);
  sp.lights = [{ x: AX / 2, y: (AY - 14) / 2, r: 30 + (f % 2) * 4, color: FLAME[2], a: 0.5 }];
  return sp;
}

// =================================================================================================
// THE EVENT'S BELLS ON THIS FLOOR

/** A BELL of bronze hung at `c` (its crown), `R` wide at its lip and `H` tall; swung `swing` radians about x. `gag`: bound in black cloth and chains. */
export function bell(S: Scene, c: V3, R: number, H: number, swing: number, id: number, gag = false, METAL: Ramp = BRONZE): void {
  const prof = (t: number): number => R * (0.45 + 0.55 * t ** 1.7) + (t > 0.9 ? (t - 0.9) * R * 0.8 : 0); // its flare to the lip
  // built upright then swung: each point (x, y, z below the crown) turned about the x axis through the crown
  const sw = (w: V3): V3 => {
    const dy = w[1] - c[1];
    const dz = w[2] - c[2];
    return [w[0], c[1] + dy * Math.cos(swing) - dz * Math.sin(swing), c[2] + dy * Math.sin(swing) + dz * Math.cos(swing)];
  };
  const N = 36;
  const M = 10;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    for (let j = 0; j < M; j++) {
      const t0 = j / M;
      const t1 = (j + 1) / M;
      const P = (a: number, t: number): V3 => sw([c[0] + Math.cos(a) * prof(t), c[1] + Math.sin(a) * prof(t), c[2] - H * t]);
      const am = (a0 + a1) / 2;
      const tm = (t0 + t1) / 2;
      const nn: V3 = sw([Math.cos(am), Math.sin(am), (prof(t1) - prof(t0)) / (H / M)]);
      const n: V3 = [nn[0] - c[0], nn[1] - c[1], nn[2] - c[2]];
      const nl = Math.hypot(n[0], n[1], n[2]) || 1;
      const N3: V3 = [n[0] / nl, n[1] / nl, n[2] / nl];
      S.quad([P(a0, t0), P(a1, t0), P(a1, t1), P(a0, t1)], (_u, v) => {
        const t = t0 + (t1 - t0) * v;
        if (gag && t > 0.2 && t < 0.86) {
          // the blank mask painted on the cloth where it faces the street: an oval, two eyes, no mouth
          const mx = (am - Math.PI * 0.42) / 0.5;
          const my = (t - 0.5) / 0.2;
          if (mx * mx + my * my < 1) return Math.abs(Math.abs(mx) - 0.38) < 0.2 && Math.abs(my + 0.2) < 0.18 ? BLACK[0] : toneAt(N3, MASK, 0.1);
          return fr(t * 5 + am) < 0.12 ? BLACK[1] : toneAt(N3, BLACK, 0.2);
        }
        if (t > 0.88 && t < 0.93) return toneAt(N3, METAL, 0.5); // the lip's ridge
        if (Math.abs(t - 0.3) < 0.03) return toneAt(N3, METAL, -0.4); // a band
        void tm;
        return toneAt(N3, METAL, 0.05);
      }, id);
    }
  }
  // its mouth, dark under the lip
  S.egg(sw([c[0], c[1], c[2] - H * 0.98]), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [prof(1) * 0.92, prof(1) * 0.92, 0.6], () => HOLE, id + 1);
  // its crown's loop
  S.rod(sw([c[0] - 2, c[1], c[2]]), sw([c[0] - 2, c[1], c[2] + 4]), 1, 1, METAL, id + 2);
  S.rod(sw([c[0] + 2, c[1], c[2]]), sw([c[0] + 2, c[1], c[2] + 4]), 1, 1, METAL, id + 2);
  if (gag) {
    // chains crossed over the cloth, and their padlock
    for (const s of [-1, 1]) {
      for (let k = 0; k < 9; k++) {
        const t = k / 8;
        const a = Math.PI / 2 + s * (0.6 - t * 1.2);
        const z = c[2] - H * (0.25 + t * 0.6);
        const r = prof(0.25 + t * 0.6) + 1.2;
        const w = sw([c[0] + Math.cos(a) * r * s, c[1] + Math.sin(a) * r, z]);
        S.egg(w, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.8, 1.4, 1.4], (n) => toneAt(n, IRON, k % 2 ? 0.55 : 0.3), id + 3);
      }
    }
    S.box(sw([c[0], c[1] + prof(0.6) + 2, c[2] - H * 0.62]), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.4, 1, 3], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), id + 4);
  }
}

/**
 * THE MARKET BELL in its bell-cote at the square's edge: two piers of the city's stone, a lintel and a little
 * gabled roof of clay tiles over them, the great bell hung between. Its state: `gagged` (the Silent Order's
 * black cloth bound round it and chains over it: the Bells' Muffled Bell on this floor), or rung, swinging
 * `swing`. 110 x 210 at (55, 186).
 */
function marketBell(gagged: boolean, swing = 0): Sprite {
  const S = scene(110, 210, 55, 186);
  for (const x of [-24, 24]) {
    slab(S, x - 6, -6, x + 6, 6, 0, 104, STONE, x < 0 ? 1 : 2, 0, (f, _u, v) => (f < 4 && fr(v * 104 / 9) < 0.1 ? -0.5 : 0));
  }
  // the lintel and the gable
  slab(S, -32, -8, 32, 8, 104, 114, STONE, 3, 0.1);
  S.quad([[-34, -10, 114], [34, -10, 114], [34, 0, 128], [-34, 0, 128]], (u, v) => (fr(v * 4) < 0.2 ? ['#371f26', '#53292b', '#6d3833', '#874a3c', '#9f5c47'][1] : fr(u * 12 + Math.floor(v * 4) * 0.5) < 0.15 ? '#53292b' : '#6d3833'), 4);
  S.quad([[-34, 0, 128], [34, 0, 128], [34, 10, 114], [-34, 10, 114]], (u, v) => (fr(v * 4) < 0.2 ? '#6d3833' : fr(u * 12 + Math.floor(v * 4) * 0.5) < 0.15 ? '#6d3833' : '#874a3c'), 5);
  // its beam and yoke
  timber(S, [-24, 0, 98], [24, 0, 98], 2.2, 6);
  bell(S, [0, 0, 95], 17, 34, swing, 10, gagged);
  return done(S, 55, 186);
}

// =================================================================================================
// ON THE HOUSE FRONTS

/** FESTIVAL BUNTING along a house front, sagging from nail to nail: little pennants in the market's dyes, faded, one or two torn off. */
function bunting(seed: number): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const dyes = [OXBLOOD, CREAM, BOTTLE, MUSTARD, SLATEBLUE];
    const z0 = 108;
    const sag = (a: number): number => z0 - 10 * (1 - ((a / 30) ** 2));
    for (let a = -30; a < 30; a += 2) S.rod(w(a, 3, sag(a)), w(a + 2, 3, sag(a + 2)), 0.5, 0.5, ROPE, 1);
    for (let k = 0; k < 9; k++) {
      if (hash(k, seed, 51) < 0.15) continue; // torn off
      const a = -27 + k * 6.8;
      const R = dyes[(k + seed) % dyes.length];
      S.quad([w(a - 2.4, 3.2, sag(a - 2.4)), w(a + 2.4, 3.2, sag(a + 2.4)), w(a + 0.2, 3.6, sag(a) - 9), w(a, 3.6, sag(a) - 9)], (u, v) => (v > 0.7 ? R[1] : u < 0.3 ? R[3] : R[2]), 2 + k);
    }
    for (const a of [-30, 30]) S.ball(w(a, 1, z0), 0.9, IRON, 20);
  });
}

/** What a guild sign showed (blotted now): the cobbler's boot, the locksmith's key, the baker's loaf, the tavern's tankard. */
type Emblem = 'boot' | 'key' | 'loaf' | 'tankard';
function emblemAt(e: Emblem, x: number, y: number): boolean {
  // (x, y) on the sign, each -1..1
  switch (e) {
    case 'boot':
      return (x > -0.5 && x < 0.05 && y > -0.65 && y < 0.45) || (x > -0.5 && x < 0.6 && y > 0.2 && y < 0.5);
    case 'key':
      return Math.hypot(x + 0.45, y) < 0.32 && Math.hypot(x + 0.45, y) > 0.14 || (x > -0.15 && x < 0.65 && Math.abs(y) < 0.08) || (x > 0.38 && x < 0.65 && y > 0 && y < 0.32 && fr((x - 0.38) * 7) < 0.6);
    case 'loaf':
      return ((x / 0.62) ** 2 + ((y + 0.05) / 0.38) ** 2 < 1 && y < 0.3) || (y >= 0.25 && y < 0.36 && Math.abs(x) < 0.55);
    case 'tankard':
      return (x > -0.4 && x < 0.25 && y > -0.5 && y < 0.55) || (Math.hypot(x - 0.32, y) < 0.26 && Math.hypot(x - 0.32, y) > 0.12 && x > 0.25);
  }
}

/** A GUILD SIGN hung from an iron bracket out of a house front: a board painted with the guild's emblem, the Silent Order's black ink slapped across it. */
function guildSign(e: Emblem): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    // the bracket: an iron arm out of the wall, a scroll of iron under it
    S.rod(w(0, 0, 112), w(0, 26, 112), 1, 1, IRON, 1);
    S.rod(w(0, 0, 100), w(0, 16, 111), 0.8, 0.8, IRON, 1);
    for (let k = 0; k < 6; k++) {
      const a = k / 5;
      S.ball(w(0, 4 + 6 * a + Math.sin(a * 6) * 2, 103 + 6 * a + Math.cos(a * 6) * 2), 0.7, IRON, 1);
    }
    // its chains, and the board, out from the wall, seen at a slant
    S.rod(w(0, 8, 112), w(0, 8, 106), 0.5, 0.5, IRON, 2);
    S.rod(w(0, 22, 112), w(0, 22, 106), 0.5, 0.5, IRON, 2);
    S.quad([w(-1, 6, 106), w(-1, 24, 106), w(-1, 24, 86), w(-1, 6, 86)], (u, v) => {
      if (u < 0.06 || u > 0.94 || v < 0.06 || v > 0.94) return OAK[1];
      const x = (u - 0.5) * 2.4;
      const y = (v - 0.5) * 2.4;
      // the ink: a black smear slapped diagonally across, its drips
      const ink = Math.abs(y - x * 0.3 + 0.05) < 0.32 || (fr(u * 5) < 0.12 && y > 0 && y < 0.9 && Math.abs(y - x * 0.3) < 1.1);
      if (ink) return BLACK[fr(u * 9) < 0.5 ? 1 : 2];
      if (emblemAt(e, x, y)) return BRASS[3];
      return OXBLOOD[2];
    }, 3);
  });
}

// =================================================================================================
// THE WARD'S GATES

/** Ashlar of the city's stone on a face, `a` along it and `z` up: its tone's shift (the joints dark). */
function ashlar(a: number, z: number, seed: number, bw = 14, ch = 8): number {
  const row = Math.floor(z / ch);
  const off = (row & 1) * bw * 0.5;
  if (fr(z / ch) < 0.13 || fr((a + off) / bw) < 0.06) return -0.6;
  return (hash(Math.floor((a + off) / bw), row, seed) - 0.5) * 0.32;
}

/** Courses on a box's sides (slab's grain): a dark joint every `ch` of its height `H`. */
const coursed = (H: number, ch = 9) => (f: number, u: number, v: number): number => {
  if (f >= 4) return 0;
  const z = f === 0 || f === 1 ? v : u;
  return fr((z * H) / ch) < 0.1 ? -0.55 : 0;
};

/** The dome's shards: glass of the cult's pink, faceted (as the set's). */
const SHARD: Ramp = ['#2a0c22', '#4a1236', '#7a1a4e', '#b4306a', '#e86a98'];

/**
 * A SHARD OF THE DOME, a blade of its pink glass: two faces meeting in a ridge down its middle, its end broken
 * in a jag; its foot at `base`, running `L` along `D`, `W` either way along `A`.
 */
function shardBlade(S: Scene, base: V3, D0: V3, A0: V3, L: number, W: number, id: number): void {
  const nz = (v: V3): V3 => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const D = nz(D0);
  const A = nz(A0);
  let O: V3 = [D[1] * A[2] - D[2] * A[1], D[2] * A[0] - D[0] * A[2], D[0] * A[1] - D[1] * A[0]];
  if (O[0] + O[1] + O[2] * 0.8 < 0) O = [-O[0], -O[1], -O[2]];
  const P = (u: number, z: number, o: number): V3 => [base[0] + A[0] * u + D[0] * z + O[0] * o, base[1] + A[1] * u + D[1] * z + O[1] * o, base[2] + A[2] * u + D[2] * z + O[2] * o];
  const top = (u: number): number => L * (0.72 + 0.28 * Math.abs(Math.sin(u * 0.5 + 1.3))) - Math.abs(u) * 0.6;
  const N = 10;
  for (let i = 0; i < N; i++) {
    const u0 = -W + (2 * W * i) / N;
    const u1 = -W + (2 * W * (i + 1)) / N;
    for (const side of [1, -1]) {
      const o0 = side * 2 * (1 - Math.abs(u0) / W);
      const o1 = side * 2 * (1 - Math.abs(u1) / W);
      S.quad([P(u0, 0, o0), P(u1, 0, o1), P(u1, top(u1), o1 * 0.2), P(u0, top(u0), o0 * 0.2)], (u, v) => {
        const uu = u0 + (u1 - u0) * u;
        if (side < 0) return SHARD[1];
        if (Math.abs(Math.sin(uu * 1.6 + v * 6.1)) < 0.08) return SHARD[4];
        if (W - Math.abs(uu) < 1 || v > 0.94) return SHARD[4];
        return uu < 0 ? SHARD[3] : SHARD[2];
      }, id);
    }
  }
}

/**
 * THE CITY GATE, BROKEN: the Gate Ward's own gate in the city wall, where the siege broke in. Two round towers
 * of the city's stone, crenellated, arrow slits dark; the gate wall between them, its arch scorched black by
 * the cult's fire; the portcullis jammed half up, its bars bent and snapped; one oak leaf torn off and flung
 * flat before it, the other hanging askew from its last hinge; the city's arms over the arch smeared out with
 * the Silent Order's ink, their black banner on the left tower; a shard of the dome driven into the right one.
 * Its front looks along +y (`k` 0) or +x (`k` 1); built 1.4 times as big as it is measured here, so that it
 * stands over the houses. 290 x 380 at (145, 296).
 */
/**
 * (`held`, for Act 2's town hub, art/hub2.ts, a mock-up behind HUB2, off: the gate as the camp inside it keeps it: the
 * Order's banner torn down and the city's own hung in its place, the ink scrubbed off the city's arms, the dome's shard
 * pulled out of the tower. Not set, it is the Gate Ward's, as it was.)
 */
export function cityGate(k: number, held = false): Sprite {
  const S = turned(scene(290, 380, 145, 296), k, 1.4);
  const WALL = 112;
  const FRONT = facing(S, [0, 1, 0]);
  const inArch = (x: number, z: number): boolean => Math.abs(x) < 18 && (z < 58 || Math.hypot(x, z - 58) < 18);
  // how far the cult's fire blackened the stone: round the arch and licking up the wall over it
  const scorch = (x: number, z: number): number => Math.max(0, 1 - Math.hypot(x * 0.8, Math.max(0, z - 30) * 0.42) / 40) * (0.75 + 0.25 * Math.sin(x * 0.9 + z * 0.17));
  const burnt = (c: string, x: number, z: number): string => {
    const s = scorch(x, z);
    return s > 0.08 ? mix(c, CHAR[1], Math.min(0.9, s * 1.3)) : c;
  };
  // THE GATE WALL's front: the arch through it, the ring of the arch's stones, the city's arms over it
  S.quad([[-50, 0, 0], [50, 0, 0], [50, 0, WALL], [-50, 0, WALL]], (_u, _v, w0) => {
    const [x, , z] = local(S, w0);
    if (inArch(x, z)) return null;
    const r = Math.hypot(x, z - 58);
    if ((z >= 58 && r < 27) || (z < 58 && Math.abs(x) < 25)) {
      const ang = (Math.atan2(z - 58, x) / Math.PI) * 11;
      const wedge = z >= 58 ? Math.floor(ang) : Math.floor(z / 10) + 40 + (x > 0 ? 20 : 0);
      const joint = z >= 58 ? fr(ang) < 0.08 || Math.abs(r - 26.4) < 0.7 : fr(z / 10) < 0.1 || Math.abs(Math.abs(x) - 24.4) < 0.7;
      return burnt(joint ? toneAt(FRONT, STONE, -0.6) : toneAt(FRONT, STONE, 0.2 + (hash(wedge, 1, 711) - 0.5) * 0.2), x, z);
    }
    // the city's arms, a shield of paler stone; the ink slapped across it
    const sx = x / 9;
    const sz = (z - 96) / 11;
    if (Math.abs(sx) < 1 && sz < 1 && (sz > -0.2 || Math.hypot(sx, (sz + 0.2) * 1.25) < 1)) {
      if (!held && (Math.abs(sz - sx * 0.35 + 0.1) < 0.3 || (fr(x * 0.45) < 0.3 && sz < -0.1 && sz > -0.95 && Math.abs(sz - sx * 0.35) < 0.95))) return BLACK[fr(x * 0.4) < 0.5 ? 1 : 2];
      if (Math.abs(sx) > 0.84 || sz > 0.86) return toneAt(FRONT, STONE, 0.45);
      if (Math.abs(sx - sz * 0.8) < 0.13 || (Math.abs(sx + sz * 0.8) < 0.11 && sz > -0.55)) return toneAt(FRONT, STONE, -0.35);
      return toneAt(FRONT, STONE, 0.3);
    }
    return burnt(toneAt(FRONT, STONE, ashlar(x, z, 712)), x, z);
  }, 1);
  // its top, and its merlons
  S.quad([[-50, -22, WALL], [50, -22, WALL], [50, 0, WALL], [-50, 0, WALL]], (u, v) => toneAt([0, 0, 1], STONE, fr(u * 7) < 0.05 || fr(v * 2) < 0.08 ? -0.4 : 0.05), 2);
  for (let x = -46; x < 44; x += 12) slab(S, x, -6, x + 7, 0, WALL, WALL + 10, STONE, 3, 0.05);
  // THE PASSAGE through it, its sides in shade
  for (const sx of [-1, 1]) {
    S.quad([[sx * 18, -22, 0], [sx * 18, 0, 0], [sx * 18, 0, 58], [sx * 18, -22, 58]], (_u, _v, w0) => {
      const [, y, z] = local(S, w0);
      return burnt(toneAt(facing(S, [-sx, 0, 0]), STONE, ashlar(y, z, 713) - 0.3), 0, z * 0.6);
    }, 4);
  }
  // THE PORTCULLIS, jammed half up: its bars bent and two snapped short, its spikes, one bar torn down and out
  const archTop = (x: number): number => 58 + Math.sqrt(Math.max(0, 324 - x * x));
  for (let x = -15; x <= 15; x += 5) {
    const snapped = x === -5 || x === 5;
    const bot = snapped ? 50 : 38;
    S.rod([x, -8, bot], [x, -8, archTop(x) - 1], 1.1, 1.1, IRON, 20);
    if (!snapped) S.rod([x, -8, bot], [x, -8, bot - 5], 1.1, 0.25, IRON, 20);
  }
  for (const z of [44, 56, 68]) {
    const half = z < 58 ? 17 : Math.sqrt(324 - (z - 58) ** 2) - 1;
    S.rod([-half, -8, z], [half, -8, z], 0.9, 0.9, IRON, 21);
  }
  S.rod([10, -8, 40], [13, -3, 30], 1, 1, IRON, 22);
  S.rod([13, -3, 30], [11, 3, 21], 1, 0.3, IRON, 22);
  // THE LEFT LEAF, torn off and flung flat before the gate: oak boards, two iron bands, its end split
  {
    const t = 0.35;
    const A0: V3 = [Math.cos(t), Math.sin(t), 0];
    const A1: V3 = [-Math.sin(t), Math.cos(t), 0];
    S.box([-24, 28, 2.2], [A0, A1, [0, 0, 1]], [10, 30, 2.2], (f, u, v, n) => {
      if (f === 4) {
        if (v > 0.9 && fr(u * 4) > 0.45 - (v - 0.9) * 4) return null;
        if (Math.abs(v - 0.18) < 0.035 || Math.abs(v - 0.7) < 0.035) return fr(u * 6) < 0.15 ? IRON[4] : toneAt(n, IRON, 0.1);
        return fr(u * 4) < 0.08 ? OAK[0] : toneAt(n, OAK, (hash(Math.floor(u * 4), 3, 714) - 0.5) * 0.3);
      }
      return toneAt(n, OAK, -0.25);
    }, 23);
    // splinters off its broken end
    for (let i = 0; i < 4; i++) S.rod([-24 + A1[0] * 30 + A0[0] * (i * 5 - 7), 28 + A1[1] * 30 + A0[1] * (i * 5 - 7), 2], [-24 + A1[0] * (33 + (i % 2) * 3) + A0[0] * (i * 5 - 6), 28 + A1[1] * (33 + (i % 2) * 3) + A0[1] * (i * 5 - 6), 1], 0.8, 0.2, OAK, 24);
  }
  // THE RIGHT LEAF, hanging askew from its last hinge, swung half open and sagging
  {
    const th = 0.95;
    const tilt = 0.17;
    const d: V3 = [-Math.cos(th), Math.sin(th), 0];
    const A0: V3 = [d[0] * Math.cos(tilt), d[1] * Math.cos(tilt), -Math.sin(tilt)];
    const A2: V3 = [d[0] * Math.sin(tilt), d[1] * Math.sin(tilt), Math.cos(tilt)];
    const A1: V3 = [A2[1] * A0[2] - A2[2] * A0[1], A2[2] * A0[0] - A2[0] * A0[2], A2[0] * A0[1] - A2[1] * A0[0]];
    const h: V3 = [17, -2, 2];
    const c: V3 = [h[0] + A0[0] * 9 + A2[0] * 28, h[1] + A0[1] * 9 + A2[1] * 28, h[2] + A0[2] * 9 + A2[2] * 28];
    S.box(c, [A0, A1, A2], [9, 1.7, 28], (f, u, v, n) => {
      if (f === 2 || f === 3) {
        // u up it, v across it
        if (u > 0.93 && v > 0.55) return null; // its top corner broken away
        if (Math.abs(u - 0.2) < 0.03 || Math.abs(u - 0.78) < 0.03) return fr(v * 5) < 0.18 ? IRON[4] : toneAt(n, IRON, 0.05);
        return fr(v * 3) < 0.07 ? OAK[0] : toneAt(n, OAK, (hash(Math.floor(v * 3), 5, 715) - 0.5) * 0.3 - 0.05);
      }
      return toneAt(n, OAK, -0.2);
    }, 25);
    S.rod([17, -2, 4], [17, -2, 12], 1.2, 1.2, IRON, 26);
  }
  // THE TOWERS: round, of coursed stone, arrow slits toward the street; their tops crenellated
  for (const sx of [-1, 1]) {
    const cx = sx * 57;
    const cy = -9;
    cylinder(S, cx, cy, 21, 0, 138, (n, a, z) => {
      const slit = (z > 56 && z < 76) || (z > 98 && z < 114);
      if (slit && Math.abs(a - Math.PI / 2 + sx * 0.4) < 0.05) return HOLE;
      return toneAt(n, STONE, ashlar(a * 21, z, 716 + sx));
    }, 30 + sx, (_a, rr) => (fr(rr * 3) < 0.08 ? STONE[1] : STONE[3]));
    cylinder(S, cx, cy, 22.5, 136, 150, (n, a, z) => {
      if (z > 143 && fr((a * 12) / (2 * Math.PI)) < 0.42) return null;
      return toneAt(n, STONE, ashlar(a * 22, z, 718) + 0.05);
    }, 33 + sx, (a, rr) => (rr > 0.9 && fr((a * 12) / (2 * Math.PI)) >= 0.42 ? STONE[4] : null));
  }
  // THE ORDER'S BANNER down the left tower: black, the blank mask, its foot cut in tongues (held: the city's own in its
  // place, slate blue, an open book worked on it in cream, its foot cut square)
  S.rod([-66, 13, 137], [-48, 13, 137], 0.8, 0.8, OAK, 40);
  S.quad([[-64, 13.2, 136], [-50, 13.2, 136], [-50, 13.2, 64], [-64, 13.2, 64]], (u, v) => {
    if (held) {
      if (v > 0.9) return null;
      const bx = (u - 0.5) / 0.34;
      const by = (v - 0.36) / 0.12;
      const book = Math.abs(by) < 1 && Math.abs(bx) < 1 && Math.abs(bx) > 0.08 && by > -1 + Math.abs(bx) * 0.3;
      if (book) return Math.abs(by - 0.2) < 0.25 && fr(bx * 3) < 0.4 ? CREAM[2] : CREAM[4];
      return fr(u * 4) < 0.16 ? SLATEBLUE[1] : SLATEBLUE[u < 0.5 ? 3 : 2];
    }
    if (v > 0.88 && v > 0.88 + Math.abs(fr(u * 3) - 0.5) * 0.24) return null;
    const mx = (u - 0.5) / 0.32;
    const my = (v - 0.3) / 0.15;
    if (mx * mx + my * my < 1) return Math.abs(Math.abs(mx) - 0.42) < 0.2 && Math.abs(my + 0.15) < 0.22 ? BLACK[0] : MASK[my < -0.35 ? 4 : 3];
    return fr(u * 4) < 0.16 ? BLACK[1] : BLACK[u < 0.5 ? 3 : 2];
  }, 41);
  // A SHARD OF THE DOME driven into the right tower (held: pulled out)
  if (!held) {
    // out of the tower's face toward the street, tipped up, stuck in deep
    const base: V3 = [57 + 21 * Math.cos(1.0), -9 + 21 * Math.sin(1.0), 88];
    shardBlade(S, base, [0.3, 0.5, 0.8], [0.86, -0.5, 0], 34, 8, 50);
  }
  // stones knocked from the battlements, at the foot of the right tower
  for (const [x, y, s, t] of [[36, 16, 4, 0.3], [45, 25, 3.2, 1.1], [29, 27, 2.6, 0.7]] as const) {
    S.box([x, y, s], [[Math.cos(t), Math.sin(t), 0], [-Math.sin(t), Math.cos(t), 0], [0, 0, 1]], [s * 1.5, s, s], (_f, _u, _v, n) => toneAt(n, STONE, 0.05), 51);
  }
  return done(S, 145, 296, held ? [] : [{ at: [76, 20, 100], r: 26, color: SHARD[3], a: 0.4 }]);
}

/**
 * THE CRIER'S GATE, the way into the Crier's Square (the boss's gate): an arch between two piers of the city's
 * stone; across its head his emblem, a great speaking-trumpet of brass; down each pier his banner, oxblood, his
 * trumpet worked on it in brass thread. Shut: its oak doors bound across with the Silent Order's black cloth,
 * the blank mask on it, chained and padlocked, and the trumpet over it gagged. Open: the doors stand back, the
 * cloth hangs torn. Front along +y (`k` 0) or +x (1). 140 x 180 at (70, 154).
 */
function criersGate(open: boolean, k: number): Sprite {
  const S = turned(scene(140, 180, 70, 154), k);
  const FRONT = facing(S, [0, 1, 0]);
  const H = 104;
  // its step, the piers and the cornice over them
  slab(S, -36, -12, 36, 12, 0, 3, STONE, 1, 0.05);
  for (const sx of [-1, 1]) {
    // each pier: a moulded foot, its shaft of dressed stone, a capital
    slab(S, sx * 27 - 9, -11, sx * 27 + 9, 11, 3, 12, STONE, 30 + sx, 0.05);
    slab(S, sx * 27 - 7, -9, sx * 27 + 7, 9, 12, H - 8, STONE, 2 + (sx > 0 ? 1 : 0), 0, (f, u, v) => {
      if (f >= 4) return 0;
      const z = f === 0 || f === 1 ? v : u;
      const a = f === 0 || f === 1 ? u : v;
      const row = Math.floor(z * 8);
      if (fr(z * 8) < 0.1 || fr(a * 2 + (row & 1) * 0.5) < 0.06) return -0.6;
      return (hash(row, Math.floor(a * 2 + (row & 1) * 0.5), 724 + sx) - 0.5) * 0.3 - 0.05;
    });
    slab(S, sx * 27 - 9, -11, sx * 27 + 9, 11, H - 8, H, STONE, 32 + sx, 0.15);
  }
  // the head over the arch, its front cut by the arch, its wedge stones
  const inArch = (x: number, z: number): boolean => Math.abs(x) < 20 && (z < 58 || Math.hypot(x, z - 58) < 20);
  S.quad([[-20, 9, 3], [20, 9, 3], [20, 9, H], [-20, 9, H]], (_u, _v, w0) => {
    const [x, , z] = local(S, w0);
    if (inArch(x, z)) return null;
    const r = Math.hypot(x, z - 58);
    if (z >= 58 && r < 27) {
      const ang = (Math.atan2(z - 58, x) / Math.PI) * 9;
      return fr(ang) < 0.09 || Math.abs(r - 26.4) < 0.7 ? toneAt(FRONT, STONE, -0.6) : toneAt(FRONT, STONE, 0.22 + (hash(Math.floor(ang), 2, 721) - 0.5) * 0.2);
    }
    return toneAt(FRONT, STONE, ashlar(x, z, 722));
  }, 5);
  S.quad([[-20, -9, H], [20, -9, H], [20, 9, H], [-20, 9, H]], () => toneAt([0, 0, 1], STONE, 0.05), 6);
  slab(S, -37, -11, 37, 11, H, H + 6, STONE, 7, 0.15);
  slab(S, -33, -8, 33, 8, H + 6, H + 9, STONE, 8, 0.05);
  // the arch's inner sides, in shade
  for (const sx of [-1, 1]) S.quad([[sx * 20, -9, 3], [sx * 20, 9, 3], [sx * 20, 9, 58], [sx * 20, -9, 58]], () => toneAt(facing(S, [-sx, 0, 0]), STONE, -0.35), 9);
  // HIS EMBLEM across the head: the great speaking-trumpet in brass, its bell to the right; gagged while the gate is shut
  speakingTrumpet(S, [-24, 11, 90], [20, 12, 94], 8, 10, !open);
  for (const x of [-14, 10]) S.rod([x, 9, 92], [x, 11, 92], 0.9, 0.9, IRON, 14);
  // HIS BANNERS down the piers: oxblood, a cream border, his trumpet worked in brass thread
  for (const sx of [-1, 1]) {
    const x0 = sx * 27 - 6;
    const x1 = sx * 27 + 6;
    S.rod([x0 - 1, 9.8, 96], [x1 + 1, 9.8, 96], 0.7, 0.7, BRASS, 15);
    S.quad([[x0, 10, 95], [x1, 10, 95], [x1, 10, 30], [x0, 10, 30]], (u, v) => {
      if (v > 0.9 && v > 0.9 + Math.abs(fr(u * 2) - 0.5) * 0.2) return null;
      if (u < 0.1 || u > 0.9 || v < 0.05) return CREAM[3];
      // the trumpet: a line from its mouthpiece (lower left) to its flared bell (upper right)
      const ax = 0.25;
      const ay = 0.62;
      const bx = 0.72;
      const by = 0.3;
      const t = Math.max(0, Math.min(1, ((u - ax) * (bx - ax) + (v - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
      const d = Math.hypot(u - (ax + (bx - ax) * t), v - (ay + (by - ay) * t));
      if (d < 0.035 + Math.max(0, t - 0.72) * 0.45 && t > 0.02) return BRASS[t > 0.9 ? 4 : 3];
      return OXBLOOD[fr(u * 2.5 + 0.3) < 0.2 ? 2 : 3];
    }, 16 + (sx > 0 ? 1 : 0));
  }
  // THE DOORS
  const archTop = (x: number): number => (Math.abs(x) < 20 ? 58 + Math.sqrt(Math.max(0, 400 - x * x)) : 58);
  const leafAt = (hx: number, ang: number, id: number): void => {
    // a leaf hung at (hx, 0), 20 wide, its head cut to the arch, turned `ang` back from shut (toward -y)
    const s = hx < 0 ? 1 : -1;
    const d: V3 = [s * Math.cos(ang), -Math.sin(ang), 0];
    const n = facing(S, [-d[1] * s, d[0] * s, 0]);
    S.quad([[hx, 0, 3], [hx + d[0] * 20, d[1] * 20, 3], [hx + d[0] * 20, d[1] * 20, 79], [hx, 0, 79]], (u, _v, w0) => {
      const z = local(S, w0)[2];
      if (z > archTop(hx + s * 20 * u) - 0.4) return null;
      if (Math.abs(z - 16) < 1.5 || Math.abs(z - 48) < 1.5) return fr(u * 4) < 0.15 ? IRON[4] : toneAt(n, IRON, 0.05);
      if (fr(u * 4) < 0.07) return OAK[0];
      return toneAt(n, OAK, (hash(Math.floor(u * 4), id, 723) - 0.5) * 0.3 - 0.05);
    }, id);
  };
  if (!open) {
    leafAt(-20, 0, 20);
    leafAt(20, 0, 21);
    // the Order's cloth bound across them, the blank mask in its middle; chains crossed over; a padlock
    S.quad([[-21, 1.2, 28], [21, 1.2, 28], [21, 1.2, 46], [-21, 1.2, 46]], (u, v) => {
      const mx = (u - 0.5) / 0.11;
      const my = (v - 0.5) / 0.42;
      if (mx * mx + my * my < 1) return Math.abs(Math.abs(mx) - 0.42) < 0.2 && Math.abs(my - 0.15) < 0.22 ? BLACK[0] : MASK[my > 0.4 ? 4 : 3];
      return fr(u * 9 + v * 0.6) < 0.14 ? BLACK[1] : BLACK[3];
    }, 22);
    for (const s of [-1, 1]) {
      for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        S.egg([s * (-18 + 36 * t), 2.2, 14 + 46 * t], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.7, 1.2, 1.4], (n) => toneAt(n, IRON, i % 2 ? 0.55 : 0.25), 23);
      }
    }
    S.box([0, 2.8, 33], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 1.2, 3.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.25), 24);
  } else {
    leafAt(-20, 1.35, 20);
    leafAt(20, 1.35, 21);
    // the cloth torn, hanging in two shreds from the piers' inner edges
    for (const s of [-1, 1]) {
      S.quad([[s * 20.5, 1.5, 46], [s * 13, 1.5, 46], [s * 15, 2, 22], [s * 20.5, 2, 18]], (u, v) => (v > 0.85 && fr(u * 3) > 0.5 ? null : fr(u * 5) < 0.2 ? BLACK[1] : BLACK[3]), 25 + (s > 0 ? 1 : 0));
    }
  }
  return done(S, 70, 154);
}

// =================================================================================================
// THE HUSH'S TRAP ON THIS FLOOR

/** The Hush's colours: the dead grey-violet of a silence. */
const HUSH: Ramp = ['#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4'];

/**
 * THE WATCH'S ALARM HORN, the Hush's now (the floor's trap): a great brass horn of the town watch on a swivel
 * atop an oak post, the Silent Order's black gag pulled down off its mouth. Quiet; its throat kindles pink to
 * gold and it shudders (the warning); it blasts a cone of silence along its mouth, three and a half tiles:
 * waves of dead grey-violet air rolling out, the setts under them darkened (inside, the hero's words go dark).
 * `f`: 0 quiet, 1 the warning, 2 to 4 the blast. Turned to look along +y (`k` 0) or +x (1). 380 x 230 at (180, 130).
 */
function alarmHorn(f: number, k: number): Sprite {
  const S = turned(scene(380, 230, 180, 130), k);
  const shake = f === 1 ? 1 : 0;
  const kick = f >= 2 ? -2.5 + (f - 2) : 0;
  // its stone footing, the post, its iron collar and the swivel's yoke
  slab(S, -6, -6, 6, 6, 0, 5, STONE, 1, 0);
  timber(S, [0, 0, 5], [0, 0, 56], 2.6, 2, [0.1, 0.9]);
  S.rod([0, 0, 56], [-5, 0, 61], 0.9, 0.9, IRON, 3);
  S.rod([0, 0, 56], [5, 0, 61], 0.9, 0.9, IRON, 3);
  // the horn: long, its bell along +y
  const mouth: V3 = [shake, 26 + kick, 61];
  speakingTrumpet(S, [-shake, -20 + kick, 63], mouth, 9.5, 4);
  // the gag, pulled down off its mouth, hanging from its throat
  S.quad([[-7, 18, 56], [7, 18, 56], [6, 21, 42], [-5, 20, 40]], (u, v) => (v > 0.8 && fr(u * 3) < 0.4 ? null : fr(u * 4) < 0.2 ? BLACK[1] : BLACK[3]), 8);
  const lights: { at: V3; r: number; color: string; a?: number }[] = [];
  if (f >= 1) {
    // its throat kindled: pink burning to gold in its mouth
    S.egg([mouth[0], mouth[1] + 1.9, mouth[2]], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [0.3, 7.2, 7.2], (_n, w) => {
      const [x, , z] = local(S, w);
      const r = Math.hypot(x - mouth[0], z - mouth[2]) / 7.2;
      return r < 0.35 ? FLAME[4] : r < 0.65 ? FLAME[3] : FLAME[2];
    }, SOFT_ID + 1);
    lights.push({ at: [mouth[0], mouth[1] + 4, mouth[2]], r: f === 1 ? 22 : 30, color: FLAME[2], a: 0.5 });
  }
  // ITS CONE on the setts, three and a half tiles along its mouth: drawn round in the warning (where it will
  // blast), tinted inside while it blasts
  const HALF = 0.46;
  const LEN = 140;
  if (f >= 1) {
    const p = f - 2;
    const SPREAD = Math.atan(HALF);
    S.quad([[-80, 16, 0.4], [80, 16, 0.4], [80, 18 + LEN + 4, 0.4], [-80, 18 + LEN + 4, 0.4]], (_u, _v, w0) => {
      const [x, y] = local(S, w0);
      const d = Math.hypot(x, y - 18);
      const ang = Math.abs(Math.atan2(x, y - 18));
      if (y < 18 || d > LEN + 1.4 || ang > SPREAD + 1.4 / Math.max(1, d)) return null;
      const rim = Math.abs(d - LEN) < 1.4 || Math.abs(ang - SPREAD) * d < 1.4;
      if (f === 1) return rim && fr((d + ang * 30) / 9) < 0.55 ? HUSH[3] : null;
      if (rim) return HUSH[3];
      // inside: a dead tint where the waves have reached
      const reach = 34 + p * 52;
      return d < reach && checker(S, w0, 4) ? HUSH[2] : null;
    }, SOFT_ID + 2);
  }
  if (f >= 2) {
    const p = f - 2;
    // the waves of silence rolling out of it: arcs of dead grey-violet air, crisp near it, fading as they go
    for (let j = 0; j < 4; j++) {
      const y = 32 + j * 30 + p * 10;
      if (y > 18 + LEN) continue;
      const r = 6 + (y - 26) * 0.4;
      const zc = 61 - (y - 26) * 0.25;
      const tone = j === 0 ? HUSH[4] : j === 1 ? HUSH[4] : HUSH[3];
      const solid = j < 2;
      S.quad([[-r - 3, y, zc - r - 3], [r + 3, y, zc - r - 3], [r + 3, y, zc + r + 3], [-r - 3, y, zc + r + 3]], (_u, _v, w0) => {
        const [x, , z] = local(S, w0);
        const d = Math.hypot(x, z - zc);
        if (Math.abs(d - r) > 1.1 || z < 2) return null;
        // the arc over the top and down its sides, open below
        if (z - zc < -r * 0.55) return null;
        return solid || checker(S, w0) ? tone : null;
      }, SOFT_ID + 3 + j);
    }
    // sparks of the cult's fire spat from its mouth
    for (let i = 0; i < 6; i++) {
      const t = (i * 0.37 + p * 0.21) % 1;
      S.ball([Math.sin(i * 2.3) * (4 + t * 14), 28 + t * 36, 61 + Math.cos(i * 1.7) * (3 + t * 8) - t * 6], 0.8, FLAME, SOFT_ID + 10);
    }
  }
  return done(S, 180, 130, lights);
}

// =================================================================================================
// THE FLOOR'S QUEST

/**
 * THE CRIER'S LAST PROCLAMATION (the floor's quest): the one proclamation the Hush did not blank, dropped when
 * they took his voice: a scroll of heavy paper half unrolled on the setts, his words still on it in ink, the
 * city's seal in oxblood wax on its ribbon. A faint white light on its words. 80 x 60 at (40, 40).
 */
function proclamation(): Sprite {
  const S = scene(80, 60, 40, 40);
  // the sheet, unrolled, lying a little curled
  S.quad([[-13, -6, 0.6], [11, -6, 0.6], [11, 13, 0.9], [-13, 13, 1.4]], (u, v) => {
    if (u < 0.04 || u > 0.96) return PAPER[2];
    // the title, bigger, then his lines; each word a dash of ink
    const row = v * 8;
    const line = Math.floor(row);
    const inLine = fr(row);
    if (line === 0) return PAPER[3];
    const title = line === 1;
    if (inLine > (title ? 0.2 : 0.35) && inLine < (title ? 0.75 : 0.62) && u > 0.12 && u < (line === 7 ? 0.55 : 0.88)) {
      const word = Math.floor(u * (title ? 5 : 9) + hash(line, 1, 731) * 3);
      if (fr(u * (title ? 5 : 9) + hash(line, 1, 731) * 3) > 0.18 && hash(word, line, 732) > 0.12) return title ? '#3a1c22' : '#2a2030';
    }
    return PAPER[v > 0.9 ? 3 : 4];
  }, 1);
  // the roll at its far end
  S.egg([-1, -7, 2.7], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [12.6, 2.6, 2.6], (n, w) => {
    const [x] = local(S, w);
    if (Math.abs(x) > 11.8) return PAPER[1]; // its ends: the turns of the roll
    return toneAt(n, PAPER, -0.15);
  }, 2);
  // the seal, oxblood, on its ribbon, at the near end
  S.quad([[-3, 12.6, 1.6], [-1, 12.6, 1.6], [-4, 19, 0.3], [-6, 18, 0.3]], (_u, v) => (v > 0.7 ? MUSTARD[2] : MUSTARD[3]), 3);
  S.quad([[1, 12.6, 1.6], [3, 12.6, 1.6], [4, 19.5, 0.3], [2, 20, 0.3]], (_u, v) => (v > 0.7 ? MUSTARD[2] : MUSTARD[3]), 4);
  S.egg([0, 13, 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.6, 3.6, 1.2], (n, w) => {
    const [x, y] = local(S, w);
    return Math.hypot(x, y - 13) < 1.6 ? OXBLOOD[2] : toneAt(n, OXBLOOD, 0.2);
  }, 5);
  return done(S, 40, 40, [{ at: [-1, 3, 4], r: 18, color: '#e8e2d2', a: 0.3 }]);
}

// =================================================================================================
// THE BELLS ON THIS FLOOR (the set's event: struck in time, they break the Hush)

/** A bell's swing in each of its states: quiet, awake (ready to ring), rung one way, rung back. */
export const SWING = [0, 0, 0.42, -0.42];
/** The friend's cyan (his rulebook, Colour 3: friendly magic, as a waypoint's). */
const CY: Ramp = CYAN;
/** The Bells' metal: a lighter bronze for the small ones to read; awake or rung, the cyan in it. */
const BELL_METAL: Ramp = ['#3a2c22', '#5c4630', '#86683e', '#ad8c52', '#d0b070'];
const AWAKE_METAL: Ramp = BELL_METAL.map((c, i) => mix(c, i >= 3 ? '#b8fff8' : '#22d0e0', i >= 3 ? 0.45 : 0.22)) as unknown as Ramp;
export const metalOf = (state: number): Ramp => (state === 0 ? BELL_METAL : AWAKE_METAL);

/**
 * A BELL'S STATE about it: awake, a cyan shimmer round its lip and motes rising off it (friendly magic: the
 * Bells are the hero's to ring); rung, the shimmer flung out along the ground in rings round `foot`. Its lights.
 */
export function bellGlow(S: Scene, c: V3, R: number, H: number, state: number, foot: V3): { at: V3; r: number; color: string; a?: number }[] {
  if (state === 0) return [];
  const sw = SWING[state];
  const lip: V3 = [c[0], c[1] + H * Math.sin(sw), c[2] - H * Math.cos(sw)];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + state * 0.4;
    const r = R * 1.28 + (i % 2) * 1.1;
    S.ball([lip[0] + Math.cos(a) * r, lip[1] + Math.sin(a) * r, lip[2] + (i % 3) * 0.9], i % 3 === 0 ? 1.1 : 0.75, CY, SOFT_ID + 20);
  }
  if (state === 1) {
    for (let i = 0; i < 10; i++) {
      const a = i * 2.1;
      const rr = R * (0.7 + (i % 3) * 0.35);
      S.ball([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr, lip[2] + 4 + ((i * 7) % 13) * 2.2], i % 2 ? 0.7 : 1, CY, SOFT_ID + 21);
    }
    return [{ at: [lip[0], lip[1], lip[2] + H * 0.4], r: 26, color: '#28dcf0', a: 0.45 }];
  }
  // rung: rings of it on the ground round the bell's foot
  const rings = state === 2 ? [24, 44] : [34, 56];
  const M = rings[1] + 4;
  S.quad([[foot[0] - M, foot[1] - M, 0.5], [foot[0] + M, foot[1] - M, 0.5], [foot[0] + M, foot[1] + M, 0.5], [foot[0] - M, foot[1] + M, 0.5]], (_u, _v, w0) => {
    const [x, y] = local(S, w0);
    const d = Math.hypot(x - foot[0], y - foot[1]);
    if (Math.abs(d - rings[0]) < 1.5) return CY[3];
    if (Math.abs(d - rings[1]) < 1.3) return checker(S, w0) ? CY[2] : null;
    return null;
  }, SOFT_ID + 22);
  return [{ at: [lip[0], lip[1], lip[2] + H * 0.4], r: 40, color: '#28dcf0', a: 0.6 }];
}

/** An honest flame's colours: a candle's, a lantern's. */
export const CANDLE: Ramp = ['#5a2a10', '#8a4418', '#c8702a', '#f0a040', '#ffd890'];
// (a candle's flame, the dome's shards' pink, a bell awake with the hero's cyan: what glows, left bright)
bright(CANDLE, SHARD, AWAKE_METAL, CY);

/**
 * A WAYSIDE SHRINE'S BELL (one of the Bells on this floor): a little shrine of the city's stone at a lane's
 * corner, a niche in its front with a candle stub burning and an offering bowl, a gabled cap of clay tiles; its
 * small bronze bell hung from an iron arm out over the lane. Quiet; awake; rung. 210 x 196 at (105, 134).
 */
function shrineBell(state: number): Sprite {
  const S = scene(210, 196, 105, 134);
  slab(S, -9, -9, 9, 9, 0, 6, STONE, 1, -0.05);
  slab(S, -7, -7, 7, 7, 6, 62, STONE, 2, 0, coursed(56, 8));
  // the niche: an arched dark hollow, the candle stub, the bowl
  S.quad([[-4.5, 7.05, 30], [4.5, 7.05, 30], [4.5, 7.05, 49], [-4.5, 7.05, 49]], (u, v) => {
    const x = (u - 0.5) * 9;
    const z = v * 19;
    return z < 14.5 || Math.hypot(x, z - 14.5) < 4.5 ? HOLE : null;
  }, 3);
  S.rod([-1.5, 7.4, 30.5], [-1.5, 7.4, 34], 1, 1, CREAM, 4);
  S.ball([-1.5, 7.6, 35.4], 0.8, CANDLE, 5);
  cylinder(S, 2, 7.6, 2.2, 30, 31.6, (n) => toneAt(n, CLAY_POT, 0), 6, () => CLAY_POT[1]);
  // its cap
  S.quad([[-10, -10, 62], [10, -10, 62], [10, 0, 71], [-10, 0, 71]], (u, v) => (fr(v * 3) < 0.2 ? CLAY_TILE[1] : fr(u * 7 + Math.floor(v * 3) * 0.5) < 0.12 ? CLAY_TILE[1] : CLAY_TILE[2]), 7);
  S.quad([[-10, 0, 71], [10, 0, 71], [10, 10, 62], [-10, 10, 62]], (u, v) => (fr(v * 3) < 0.2 ? CLAY_TILE[2] : fr(u * 7 + Math.floor(v * 3) * 0.5) < 0.12 ? CLAY_TILE[2] : CLAY_TILE[3]), 8);
  S.quad([[10, -10, 62], [10, 10, 62], [10, 0.5, 71], [10, -0.5, 71]], () => toneAt([1, 0, 0], STONE, 0), 9);
  // the iron arm out over the lane, a scroll of iron under it; the bell
  S.rod([0, 7, 58], [0, 24, 58], 0.9, 0.9, IRON, 10);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    S.ball([0, 8 + 10 * t + Math.sin(t * 6.3) * 2, 51 + 6 * t + Math.cos(t * 6.3) * 2], 0.6, IRON, 10);
  }
  const c: V3 = [0, 22, 56.5];
  bell(S, c, 7.5, 15, SWING[state], 11, false, metalOf(state));
  rope(S, [0, 22 + 15 * Math.sin(SWING[state]), 56.5 - 15 * Math.cos(SWING[state])], [0, 20, 28], 0.5, 12, 0.45);
  const glow = bellGlow(S, c, 7.5, 15, state, [0, 22, 0]);
  return done(S, 105, 134, [{ at: [-1.5, 8, 36], r: 10, color: CANDLE[3], a: 0.4 }, ...glow]);
}

/** Clay: a pot's, and the roofs' tiles. */
const CLAY_POT: Ramp = ['#2e1a18', '#4a2a22', '#6a3c2c', '#8a5238', '#a46a48'];
const CLAY_TILE: Ramp = ['#371f26', '#53292b', '#6d3833', '#874a3c', '#9f5c47'];

/**
 * A SHOP'S DOORBELL (one of the Bells on this floor), hung on a house front over its door: a curly iron
 * bracket, the little bell under its end, its pull-chain down beside the door. Quiet; awake; rung.
 */
function doorbell(state: number): { left: Sprite; right: Sprite } {
  let glow: { at: V3; r: number; color: string; a?: number }[] = [];
  return frontPiece((S, w) => {
    const Z = 74;
    S.rod(w(0, 0, Z), w(0, 21, Z), 1, 1, IRON, 1);
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      S.ball(w(0, 3 + 13 * t + Math.sin(t * 6.3) * 2.6, Z - 9 + 8 * t + Math.cos(t * 6.3) * 2.6), 0.75, IRON, 1);
    }
    const c = w(0, 18, Z - 1);
    bell(S, c, 6.5, 12, SWING[state], 2, false, metalOf(state));
    for (let i = 0; i < 9; i++) S.ball(w(0, 14 - i * 0.12, Z - 13 - i * 3), 0.6, IRON, 3);
    S.ball(w(0, 13, Z - 42), 1.5, BRASS, 3);
    glow = bellGlow(S, c, 6.5, 12, state, w(0, 18, 0));
  }, 220, 280, () => glow, 72);
}

/**
 * THE WATCH'S ALARM BELL (one of the Bells on this floor): a tall frame of oak, two legs splayed at each end
 * and braced, a little shingled hood over the beam the bell hangs from, a ladder up its side, the bell-rope
 * hanging to a man's hand. Quiet; awake; rung. 170 x 240 at (85, 196).
 */
function watchBell(state: number): Sprite {
  const S = scene(170, 240, 85, 196);
  for (const x of [-10, 10]) {
    timber(S, [x, -24, 0], [x, -4, 120], 2, 1);
    timber(S, [x, 24, 0], [x, 4, 120], 2, 1);
    timber(S, [x, -18, 40], [x, 18, 40], 1.5, 2);
  }
  timber(S, [-14, 0, 120], [14, 0, 120], 2.2, 3);
  // the hood
  S.quad([[-15, -8, 122], [15, -8, 122], [15, 0, 131], [-15, 0, 131]], (u, v) => (fr(v * 3) < 0.2 ? OAK[1] : fr(u * 9 + Math.floor(v * 3) * 0.5) < 0.12 ? OAK[1] : OAK[2]), 4);
  S.quad([[-15, 0, 131], [15, 0, 131], [15, 8, 122], [-15, 8, 122]], (u, v) => (fr(v * 3) < 0.2 ? OAK[2] : fr(u * 9 + Math.floor(v * 3) * 0.5) < 0.12 ? OAK[2] : OAK[3]), 5);
  // the ladder against its side
  for (const y of [-5, 5]) timber(S, [27, y, 0], [13, y, 104], 1, 6);
  for (let z = 10; z < 100; z += 11) {
    const x = 27 - (14 * z) / 104;
    S.rod([x, -5, z], [x, 5, z], 0.8, 0.8, OAK, 7);
  }
  // its yoke down from the beam, and the bell
  for (const x of [-4, 4]) S.rod([x, 0, 119], [x, 0, 109], 1, 1, IRON, 9);
  const c: V3 = [0, 0, 109];
  bell(S, c, 13, 26, SWING[state], 10, false, metalOf(state));
  const sw = SWING[state];
  rope(S, [0, 26 * Math.sin(sw), 109 - 26 * Math.cos(sw)], [0, 3, 30], 1, 11, 0.6);
  S.ball([0, 3, 29], 1.4, ROPE, 11);
  const glow = bellGlow(S, c, 13, 26, state, [0, 0, 0]);
  return done(S, 85, 196, glow);
}

// =================================================================================================
// THE FESTIVAL NOBODY IS HAVING

/** PAPER LANTERNS strung along a house front for the festival: round, ribbed, in faded dyes, one torn; lit with candles inside, or dark. */
function paperLanterns(lit: boolean): { left: Sprite; right: Sprite } {
  const at: V3[] = [];
  return frontPiece((S, w) => {
    const z0 = 118;
    const sag = (a: number): number => z0 - 9 * (1 - (a / 30) ** 2);
    for (let a = -30; a < 30; a += 2) S.rod(w(a, 4, sag(a)), w(a + 2, 4, sag(a + 2)), 0.45, 0.45, ROPE, 1);
    for (const a of [-30, 30]) S.ball(w(a, 1, z0), 0.9, IRON, 2);
    const dyes = [CREAM, OXBLOOD, MUSTARD, CREAM];
    at.length = 0;
    for (let i = 0; i < 4; i++) {
      const a = -21 + i * 14;
      const zc = sag(a) - 9;
      const c = w(a, 4.5, zc);
      S.rod(w(a, 4, sag(a)), w(a, 4.5, zc + 5), 0.4, 0.4, ROPE, 3);
      const torn = i === 2;
      const R = dyes[i];
      S.egg(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [4.6, 4.6, 5.4], (n, wp) => {
        const dz = wp[2] - zc;
        if (Math.abs(dz) > 4.6) return toneAt(n, BLACK, 0.3); // its rims
        if (torn && n[2] < 0.2 && dz < 1 && dz > -3.5 && Math.abs(n[0] - n[1]) < 0.5) return HOLE;
        const rib = fr(dz / 1.8) < 0.22;
        if (lit && !torn) {
          const glowT = Math.max(0, 1 - Math.abs(dz) / 5);
          const base = mix(R[3], CANDLE[3], 0.35 + glowT * 0.35);
          return rib ? mix(base, R[1], 0.5) : base;
        }
        return rib ? toneAt(n, R, -0.45) : toneAt(n, R, 0);
      }, 4 + i);
      if (lit && !torn) at.push([c[0], c[1], c[2]]);
    }
  }, 80, 200, () => at.map((p) => ({ at: p, r: 16, color: CANDLE[3], a: 0.4 })));
}

/**
 * THE FESTIVAL MAYPOLE in the square: a tall pole painted in a spiral of cream and oxblood, set in a socket of
 * the city's stone, a hoop of dried garland at its top under a brass knob; ribbons in the market's dyes hang
 * limp from the hoop, two torn loose and trailing over the setts; a strip of the Order's black cloth knotted
 * round the pole. 150 x 262 at (75, 212).
 */
function maypole(): Sprite {
  const S = scene(150, 262, 75, 212);
  cylinder(S, 0, 0, 7, 0, 7, (n) => toneAt(n, STONE, 0), 1, (_a, rr) => (rr < 0.4 ? STONE[1] : STONE[3]));
  cylinder(S, 0, 0, (z) => 2.6 - (z - 7) * 0.004, 7, 160, (n, a, z) => (fr(a / (2 * Math.PI) + z / 20) < 0.32 ? toneAt(n, OXBLOOD, 0.1) : toneAt(n, CREAM, 0.05)), 2);
  S.ball([0, 0, 162.5], 3, BRASS, 3);
  // the hoop of dried garland
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    S.ball([Math.cos(a) * 13, Math.sin(a) * 13, 150 + Math.sin(a * 3) * 0.6], 1.9, GREENS, 4, undefined, -0.15);
    if (i % 4 === 1) S.ball([Math.cos(a) * 13.5, Math.sin(a) * 13.5, 151.5], 0.9, i % 8 === 1 ? MUSTARD : OXBLOOD, 5);
  }
  for (const a of [0.4, 2.0, 3.6, 5.2]) S.rod([0, 0, 156], [Math.cos(a) * 13, Math.sin(a) * 13, 150], 0.35, 0.35, ROPE, 6);
  // the ribbons, limp
  const dyes = [OXBLOOD, BOTTLE, MUSTARD, SLATEBLUE, CREAM, OXBLOOD, MUSTARD, BOTTLE];
  dyes.forEach((R, i) => {
    const a = (i / dyes.length) * Math.PI * 2 + 0.2;
    const loose = i === 1 || i === 6;
    const L = loose ? 0 : 70 + hash(i, 1, 741) * 50;
    const top: V3 = [Math.cos(a) * 13, Math.sin(a) * 13, 149];
    const t: V3 = [-Math.sin(a) * 1.3, Math.cos(a) * 1.3, 0];
    if (!loose) {
      const N = 10;
      for (let j = 0; j < N; j++) {
        const p0 = j / N;
        const p1 = (j + 1) / N;
        const P = (p: number, s: number): V3 => [top[0] + t[0] * s + Math.sin(p * 5 + i) * 1.2, top[1] + t[1] * s, top[2] - L * p];
        S.quad([P(p0, -1), P(p0, 1), P(p1, 1), P(p1, -1)], (u) => (u < 0.5 ? R[3] : R[2]), 10 + i);
      }
    } else {
      // torn loose, lying along the setts from the pole's foot
      const N = 12;
      for (let j = 0; j < N; j++) {
        const p0 = j / N;
        const p1 = (j + 1) / N;
        const P = (p: number, s: number): V3 => [Math.cos(a) * (8 + p * 50) + Math.sin(p * 7) * 3 + t[0] * s, Math.sin(a) * (8 + p * 50) + t[1] * s, 0.4];
        S.quad([P(p0, -1), P(p0, 1), P(p1, 1), P(p1, -1)], (u) => (u < 0.5 ? R[2] : R[1]), 10 + i);
      }
    }
  });
  // the Order's black cloth, knotted round the pole, its ends hanging
  cylinder(S, 0, 0, 3.4, 62, 67, (n, a) => (fr(a * 2) < 0.2 ? toneAt(n, BLACK, -0.2) : toneAt(n, BLACK, 0.3)), 30);
  S.quad([[1, 3, 64], [3, 3, 64], [5, 4, 46], [3, 4, 47]], (_u, v) => (v > 0.8 ? BLACK[1] : BLACK[3]), 31);
  S.quad([[3, 2, 64], [4, 2, 64], [9, 3, 50], [7, 3, 50]], (_u, v) => (v > 0.8 ? BLACK[1] : BLACK[2]), 32);
  return done(S, 75, 212);
}

/**
 * THE HORSE TROUGH: a long trough cut from the city's stone, its water dark and still, a blank leaflet
 * floating on it; a cast-iron pump at its end, its handle up, its spout over the water; a bucket by it.
 * 140 x 110 at (70, 78).
 */
function horseTrough(): Sprite {
  const S = scene(140, 110, 70, 78);
  const g = coursed(18, 9);
  // the stone old and greyed, darker at its foot where the wet has got into it
  const grime = (f: number, u: number, v: number): number => g(f, u, v) - 0.2 + (f < 4 && (f === 2 || f === 3 ? u : v) < 0.25 && hash(Math.floor((f === 2 || f === 3 ? v : u) * 30), 1, 751) < 0.6 ? -0.3 : 0);
  slab(S, -32, -11, 32, -8, 0, 18, STONE, 1, 0, grime);
  slab(S, -32, 8, 32, 11, 0, 18, STONE, 2, 0, grime);
  slab(S, -32, -8, -29, 8, 0, 18, STONE, 3, -0.2, grime);
  slab(S, 29, -8, 32, 8, 0, 18, STONE, 4, -0.2, grime);
  // the water, and the leaflet on it
  S.quad([[-29, -8, 14.5], [29, -8, 14.5], [29, 8, 14.5], [-29, 8, 14.5]], (u, v, w) => {
    if (u > 0.55 && u < 0.72 && v > 0.3 && v < 0.75) return PAPER[3];
    if (fr(u * 9 + v * 2) < 0.05 && v < 0.5) return WATER[4];
    void w;
    return WATER[v < 0.3 ? 2 : 1];
  }, 5);
  // the pump: an iron column, its cap, its spout, its handle up
  cylinder(S, -38, 0, 3.4, 0, 34, (n, _a, z) => (fr(z / 8) < 0.12 ? toneAt(n, IRON, -0.4) : toneAt(n, IRON, 0.05)), 6, () => IRON[3]);
  S.ball([-38, 0, 36], 3.4, IRON, 7);
  S.rod([-38, 0, 28], [-31, 0, 27], 1.4, 1.1, IRON, 8);
  S.rod([-31, 0, 27], [-30, 0, 23], 1.1, 0.9, IRON, 8);
  S.rod([-38, 0, 36], [-44, 2, 48], 1, 0.8, IRON, 9);
  // a bucket by it
  cylinder(S, 40, 14, (z) => 4.6 + z * 0.05, 0, 9, (n, a) => (fr(a * 2.5) < 0.1 ? toneAt(n, OAK, -0.4) : toneAt(n, OAK, 0)), 10, () => WATER[2]);
  return done(S, 70, 78);
}

/** A BALE OF HAY at (x, y, z), turned `t` about the upright: its straw along it, two bands of twine round it. */
function bale(S: Scene, x: number, y: number, z: number, t: number, id: number): void {
  const A0: V3 = [Math.cos(t), Math.sin(t), 0];
  const A1: V3 = [-Math.sin(t), Math.cos(t), 0];
  S.box([x, y, z + 6.5], [A0, A1, [0, 0, 1]], [12, 7.5, 6.5], (f, u, v, n) => {
    // along it: u on its top, v on its long sides; across: v on its top, u on its long sides
    const along = f === 4 || f === 5 ? u : f === 2 || f === 3 ? v : -1;
    const across = f === 4 || f === 5 ? v : f === 2 || f === 3 ? u : u;
    if (along >= 0 && (Math.abs(along - 0.28) < 0.03 || Math.abs(along - 0.72) < 0.03)) return toneAt(n, ROPE, -0.35);
    if (f < 2) return toneAt(n, STRAW, (hash(Math.floor(u * 12), Math.floor(v * 10), id) - 0.5) * 0.6 - 0.15); // its cut ends
    const streak = hash(Math.floor(across * 22), Math.floor(along * 3), id + 1);
    return toneAt(n, STRAW, (streak - 0.5) * 0.5 + (fr(across * 22) < 0.2 ? -0.25 : 0));
  }, id);
}

/** HAY BALES, stacked by the stables' lane: three, one on top; broken, burst open, straw strewn wide. 120 x 90 at (60, 66). */
function hayBales(broken: boolean): Sprite {
  const S = scene(120, 90, 60, 66);
  if (!broken) {
    bale(S, -9, 4, 0, 0.05, 1);
    bale(S, 13, -6, 0, -0.1, 2);
    bale(S, 2, -1, 13, 0.25, 3);
  } else {
    bale(S, -9, 4, 0, 0.05, 1);
    // the rest, burst: straw strewn in a heap and wisps
    for (let i = 0; i < 70; i++) {
      const a = i * 2.39996;
      const d = Math.sqrt(i / 70) * 26;
      const x = 12 + Math.cos(a) * d;
      const y = -4 + Math.sin(a) * d * 0.8;
      const h = Math.max(0, 5 - d * 0.18);
      const b = a * 1.7;
      S.rod([x, y, h + 0.5], [x + Math.cos(b) * 5, y + Math.sin(b) * 5, h * 0.7 + 0.3], 0.5, 0.4, STRAW, 4 + (i % 3));
    }
    for (const s of [-1, 1]) S.rod([4, s * 4, 0.5], [16, s * 7, 0.5], 0.4, 0.4, ROPE, 8);
  }
  return done(S, 60, 66);
}

// =================================================================================================

let made: Piece[] | null = null;
/** FLOOR 11'S PIECES, the Crier's (the first of them). */
export function gateWardPieces(): Piece[] {
  if (made) return made;
  made = [
    // (frames: facing +y, +x, -y and -x, four stalls to each: frame = facing * 4 + stall)
    { name: 'market stall', kind: 'obstacle', frames: [0, 1, 2, 3].flatMap((k) => [0, 1, 2, 3].map((v) => stall(v, false, k))), shadow: 0.7 },
    { name: 'market stall, smashed', kind: 'obstacle', frames: [0, 1, 2, 3].flatMap((k) => [stall(0, true, k), stall(2, true, k)]), shadow: 0.6 },
    { name: 'the cart barricade', kind: 'obstacle', frames: [cartBarricade()], shadow: 0.9 },
    { name: 'baskets of produce', kind: 'breakable', frames: [produce(false), produce(true)], shadow: 0.35 },
    { name: 'sacks of grain', kind: 'breakable', frames: [sacks(false), sacks(true)], shadow: 0.3 },
    { name: 'handcart', kind: 'obstacle', frames: [handcart()], shadow: 0.45 },
    { name: "the crier's rostrum", kind: 'obstacle', frames: [rostrum()], shadow: 0.9 },
    { name: 'the notice board', kind: 'obstacle', frames: [noticeBoard()], shadow: 0.4 },
    { name: 'the town well', kind: 'obstacle', frames: [well()], shadow: 0.6 },
    { name: 'the herald, gagged', kind: 'obstacle', frames: [heraldStatue()], shadow: 0.5 },
    { name: "a firepot's crater, burning", kind: 'trap', frames: [0, 1, 2, 3].map(firepotCrater) },
    { name: 'the market bell (the Muffled Bell)', kind: 'obstacle', frames: [marketBell(true), marketBell(false, 0), marketBell(false, 0.35), marketBell(false, -0.35)], shadow: 0.5 },
    { name: 'festival bunting', kind: 'on the wall', ...withFrames(bunting(0)) },
    { name: 'guild sign, blotted', kind: 'on the wall', ...withFramesN((['boot', 'key', 'loaf', 'tankard'] as const).map(guildSign)) },
    // (frames: its front along +y, along +x)
    { name: 'the city gate, broken', kind: 'gate', frames: [cityGate(0), cityGate(1)], shadow: 1.6 },
    // (frames: shut and open along +y, shut and open along +x)
    { name: "the crier's gate", kind: 'gate', frames: [criersGate(false, 0), criersGate(true, 0), criersGate(false, 1), criersGate(true, 1)], shadow: 0.9 },
    // (frames: quiet, the warning, the blast three, looking along +y; the same looking along +x)
    { name: "the watch's alarm horn, the Hush's", kind: 'trap', frames: [0, 1].flatMap((k) => [0, 1, 2, 3, 4].map((f) => alarmHorn(f, k))), shadow: 0.3 },
    { name: "the crier's last proclamation", kind: 'quest', frames: [proclamation()], shadow: 0.25 },
    // (the Bells: quiet, awake, rung one way, rung back)
    { name: "a wayside shrine's bell", kind: 'obstacle', frames: [0, 1, 2, 3].map(shrineBell), shadow: 0.3 },
    { name: "a shop's doorbell", kind: 'on the wall', ...withFramesN([0, 1, 2, 3].map(doorbell)) },
    { name: "the watch's alarm bell", kind: 'obstacle', frames: [0, 1, 2, 3].map(watchBell), shadow: 0.7 },
    { name: 'paper lanterns', kind: 'on the wall', ...withFramesN([paperLanterns(true), paperLanterns(false)]) },
    { name: 'the festival maypole', kind: 'obstacle', frames: [maypole()], shadow: 0.35 },
    { name: 'the horse trough', kind: 'obstacle', frames: [horseTrough()], shadow: 0.7 },
    { name: 'hay bales', kind: 'breakable', frames: [hayBales(false), hayBales(true)], shadow: 0.45 },
  ];
  return made;
}

function withFrames(s: { left: Sprite; right: Sprite }): { left: Sprite[]; right: Sprite[] } {
  return { left: [s.left], right: [s.right] };
}
function withFramesN(ss: { left: Sprite; right: Sprite }[]): { left: Sprite[]; right: Sprite[] } {
  return { left: ss.map((s) => s.left), right: ss.map((s) => s.right) };
}

export { MASK };
