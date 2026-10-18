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
import { hash, mix } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { BLACK, BOTTLE, BRASS, BRONZE, CHAR, CREAM, DEAL, GREENS, IRON, MASK, MUSTARD, OAK, OXBLOOD, PAPER, ROPE, SLATEBLUE, STONE, APPLE, CRUST, HOLE, WATER, cylinder, done, frontPiece, planks, scene, slab } from './act2_kit';

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
function stall(variant: number, smashed: boolean): Sprite {
  const S = scene(120, 140, 60, 112);
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
  return done(S, 60, 112);
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
export function bell(S: Scene, c: V3, R: number, H: number, swing: number, id: number, gag = false): void {
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
        if (t > 0.88 && t < 0.93) return toneAt(N3, BRONZE, 0.5); // the lip's ridge
        if (Math.abs(t - 0.3) < 0.03) return toneAt(N3, BRONZE, -0.4); // a band
        void tm;
        return toneAt(N3, BRONZE, 0.05);
      }, id);
    }
  }
  // its mouth, dark under the lip
  S.egg(sw([c[0], c[1], c[2] - H * 0.98]), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [prof(1) * 0.92, prof(1) * 0.92, 0.6], () => HOLE, id + 1);
  // its crown's loop
  S.rod(sw([c[0] - 2, c[1], c[2]]), sw([c[0] - 2, c[1], c[2] + 4]), 1, 1, BRONZE, id + 2);
  S.rod(sw([c[0] + 2, c[1], c[2]]), sw([c[0] + 2, c[1], c[2] + 4]), 1, 1, BRONZE, id + 2);
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

let made: Piece[] | null = null;
/** FLOOR 11'S PIECES, the Crier's (the first of them). */
export function gateWardPieces(): Piece[] {
  if (made) return made;
  made = [
    { name: 'market stall', kind: 'obstacle', frames: [0, 1, 2, 3].map((v) => stall(v, false)), shadow: 0.7 },
    { name: 'market stall, smashed', kind: 'obstacle', frames: [stall(0, true), stall(2, true)], shadow: 0.6 },
    { name: 'the cart barricade', kind: 'obstacle', frames: [cartBarricade()], shadow: 0.9 },
    { name: "the crier's rostrum", kind: 'obstacle', frames: [rostrum()], shadow: 0.9 },
    { name: 'the notice board', kind: 'obstacle', frames: [noticeBoard()], shadow: 0.4 },
    { name: 'the town well', kind: 'obstacle', frames: [well()], shadow: 0.6 },
    { name: 'the herald, gagged', kind: 'obstacle', frames: [heraldStatue()], shadow: 0.5 },
    { name: "a firepot's crater, burning", kind: 'trap', frames: [0, 1, 2, 3].map(firepotCrater) },
    { name: 'the market bell (the Muffled Bell)', kind: 'obstacle', frames: [marketBell(true), marketBell(false, 0), marketBell(false, 0.35), marketBell(false, -0.35)], shadow: 0.5 },
    { name: 'festival bunting', kind: 'on the wall', ...withFrames(bunting(0)) },
    { name: 'guild sign, blotted', kind: 'on the wall', ...withFramesN((['boot', 'key', 'loaf', 'tankard'] as const).map(guildSign)) },
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
