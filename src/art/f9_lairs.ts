// FLOOR 9'S TWO SIDE AREAS, DRESSED FOR ITS SIDE BOSSES (docs/mockups/f9_side_bosses/README.md; laid by game/f9_lairs.ts behind
// F9_LAIRS, off until his yes to the pictures). His words, 13 Nov 2026: “I want them in the side areas, but I want the side areas
// stylized to them.  So like some trollish ramshackle barricades or whatever.  Some guardians milling around the entrance.  A misty
// glade for the wolf, moonlight beam coming down”.
//
// THE TROLLS' CAMP (the floor's lair, where the troll chieftain holds court): ramshackle barricades of sharpened logs lashed across
// its way in, crooked stretches of palisade round it, poles hung with skulls and antlers, a great fire, hide lean-tos, gnawed bones,
// and at its back the chieftain's seat of boulders, logs and a draped hide, a rack of antlers over it.
// THE MISTY GLADE (the floor's side area, where the mist wolf waits): a beam of moonlight coming down through the trees into it,
// mist lying on the ground, dead trees bleached white, standing stones scored by claws, pale flowers, a deer's bones picked clean.
//
// THE RULES THEY KEEP (the Pinewood's, art/floor9.ts): crisp pixels, two to a game pixel; light from the upper left; the seam where
// one thing ends before another; a step quieter than the figures; nothing cyan; the trolls' fire the enemy's pink and gold, as the
// cult's is; the moonbeam pale and dithered, never a glow. Measures as floor 4's Scene: across the floor 40 units to a tile (x down
// the screen to the right, y down it to the left), heights in picture pixels; each picture anchored at the middle of its foot.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Scene, XYZ, facetOf, toneAt } from './floor4';
import type { V3 } from './floor4';
import { ROPE, TIMBER, add, beamAxes, finish, mul, rope } from './floor6';
import { BONE, DRIFT, HIDE } from './floor7';
import { GRANITE, MOSS, PBARK } from './floor9';
import { cultFire, fireLight, fireStones, sparks } from './act1_camp';
import type { Piece } from './floorkit';
import { GRAIN, compose, hash } from './kit';
import type { Ramp } from './kit';

// =================================================================================================
// The colours

/** A troll's fur, grey-brown (the hides they sleep on, the one over the chieftain's seat). */
const FUR: Ramp = ['#2a2622', '#3e3934', '#57514a', '#746c62', '#8e867a'];
/** Wood sharpened, the pale of it where it was hacked to a point. */
const HACKED: Ramp = ['#5a4a3a', '#7a654e', '#9a8466', '#b8a282', '#cfbc9c'];
/** Meat roasting, browned (never red). */
const ROAST: Ramp = ['#2e1c16', '#46281c', '#603822', '#7c4c2e', '#96643e'];
/** A dead tree, bleached: pale grey with a cold lilac in its shadow. */
const BLEACH: Ramp = ['#5e5a68', '#7c7886', '#9c98a4', '#bcb8c2', '#d8d4dc'];
/** Moonlight and the mist: pale silver, lilac in its shadow (well off the friend's cyan). */
const MOON: Ramp = ['#6e6a8a', '#8e8aaa', '#b0acc8', '#d2cfe2', '#ecebf6'];
/** Moonflowers' leaves, dark. */
const LEAF: Ramp = ['#1e2a1c', '#2a3a26', '#3a4e32', '#4c643e', '#5e784c'];
/** Grey moss hanging from dead limbs. */
const GREYMOSS: Ramp = ['#4e4c52', '#66646a', '#807e82', '#9a989a', '#b2b0b0'];
/** A stone's grey lichen. */
const LICHEN = '#9a9a7e';

/** A 4 x 4 ordered dither: whether a pixel is lit at a density `d` (0..1). */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const dithered = (x: number, y: number, d: number): boolean => d > (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

/** A stake of rough wood from `a` to `b`, its last part hacked to a pale point. */
function stake(S: Scene, a: V3, b: V3, r: number, id: number, broken = false): void {
  const k = broken ? 1 : 0.78;
  const m = add(a, mul(add(b, mul(a, -1)), k));
  S.rod(a, m, r, r * 0.92, PBARK, id);
  if (!broken) S.rod(m, b, r * 0.92, 0.35, HACKED, id);
  else S.ball(m, r * 0.95, HACKED, id);
}

/** A skull, a troll's or a beast's: its dome, its brow, its sockets dark, its jaw; facing `face` (a unit along the floor). */
function skull(S: Scene, c: V3, r: number, face: V3, id: number, jaw = true): void {
  const F = face;
  const Lf: V3 = [-F[1], F[0], 0];
  S.egg(c, [F, Lf, [0, 0, 1]], [r * 1.05, r * 0.9, r * 0.85], (n, w) => {
    const q = add(w, mul(c, -1));
    const f = q[0] * F[0] + q[1] * F[1];
    const l = q[0] * Lf[0] + q[1] * Lf[1];
    // (its sockets: two dark hollows in its face; its nose between and under them)
    if (f > r * 0.45 && q[2] > -r * 0.25 && q[2] < r * 0.3 && Math.abs(Math.abs(l) - r * 0.38) < r * 0.24) return '#1e1820';
    if (f > r * 0.6 && Math.abs(l) < r * 0.12 && q[2] < -r * 0.3 && q[2] > -r * 0.6) return '#2a2228';
    return toneAt(n, BONE, 0.05);
  }, id);
  if (jaw) S.egg(add(c, add(mul(F, r * 0.5), [0, 0, -r * 0.75])), [F, Lf, [0, 0, 1]], [r * 0.6, r * 0.62, r * 0.3], (n) => toneAt(n, BONE, -0.05), id + 1);
}

/** Antlers from `at`, branching up and out to either side of the way `side` (a unit along the floor). */
function antlers(S: Scene, at: V3, side: V3, size: number, id: number): void {
  for (const s of [1, -1]) {
    const o = mul(side, s);
    const pts: V3[] = [at, add(at, add(mul(o, 4 * size), [0, 0, 5 * size])), add(at, add(mul(o, 8 * size), [0, 0, 11 * size])), add(at, add(mul(o, 9 * size), [0, 0, 18 * size]))];
    for (let i = 1; i < pts.length; i++) S.rod(pts[i - 1], pts[i], 1.3 - i * 0.25, 1.3 - (i + 1) * 0.25, BONE, id);
    for (const [j, dz, dx] of [[1, 6, 2], [2, 6, -2], [2, 4, 4]] as const) S.rod(pts[j], add(pts[j], add(mul(o, dx * size * 0.4), [0, 0, dz * size])), 0.7, 0.3, BONE, id);
  }
}

/** A hide hung on a frame or a pole: four corners, its edge ragged, its hair in tones, a seam stitched here and there. */
function hideOn(S: Scene, q: readonly [V3, V3, V3, V3], id: number, ramp: Ramp = HIDE, seed = 1): void {
  S.quad(q, (u, v, w) => {
    const r = Math.hypot(u - 0.5, (v - 0.5) * 1.2);
    if (r > 0.55 + 0.07 * Math.sin(u * 13 + v * 7 + seed)) return null;
    if (v > 0.8 && hash(Math.floor(u * 14), seed, 611) < 0.4 && v > 0.8 + hash(Math.floor(u * 14), seed, 612) * 0.2) return null;
    const n = hash(Math.floor(w[0] / 3) + Math.floor(w[1] / 3) * 7, Math.floor(w[2] / 3), 613 + seed);
    return n > 0.86 ? ramp[1] : ramp[r < 0.3 ? 3 : 2];
  }, id);
}

// =================================================================================================
// THE TROLLS' CAMP

/**
 * THE TROLLS' BARRICADE: a log laid along the ground with sharpened stakes driven through it crossways in pairs, splayed out both
 * ways, lashed where they cross; a stake or two broken short; a skull stuck on one point. Two tiles long. `alongY`: it runs along y
 * (else along x). 150 x 100 at (75, 70).
 */
function barricade(alongY: boolean): Sprite {
  const S = new Scene(new Px(150, 100), 75, 70);
  const P = (a: number, c: number, z: number): V3 => (alongY ? [c, a, z] : [a, c, z]);
  S.rod(P(-38, 0, 9), P(38, 0, 10), 4, 3.6, PBARK, 1);
  // (its ends cut rough: the pale of the cut)
  S.egg(P(-39, 0, 9), alongY ? [[0, 1, 0], [1, 0, 0], [0, 0, 1]] : XYZ, [0.8, 3.8, 3.8], (n) => toneAt(n, HACKED, 0), 2);
  let id = 3;
  for (let k = 0; k < 5; k++) {
    const a = -32 + k * 16 + (hash(k, 1, 701) - 0.5) * 3;
    const tall = 26 + hash(k, 2, 701) * 8;
    stake(S, P(a, -14, 0), P(a + 2, 16, tall), 2.1, id++, k === 3);
    stake(S, P(a, 14, 0), P(a - 2, -16, tall - 2), 2.0, id++, k === 1);
    rope(S, P(a - 2, -2, 12), P(a + 2, 2, 13), 0, id++, 0.6);
  }
  skull(S, P(-30, 16, 29), 3.6, alongY ? [1, 0, 0] : [0, 1, 0], id, false);
  return finish(S, 75, 70);
}

/**
 * THE TROLLS' PALISADE: a crooked stretch of stakes stood up side by side, no two of a height and none quite upright, their tops
 * hacked to points, lashed together by two runs of rope; one leaning out; a hide hung over it to dry. Two tiles long. 150 x 130 at
 * (75, 96).
 */
function palisade(alongY: boolean): Sprite {
  const S = new Scene(new Px(150, 130), 75, 96);
  const P = (a: number, c: number, z: number): V3 => (alongY ? [c, a, z] : [a, c, z]);
  let id = 1;
  const tops: V3[] = [];
  for (let k = 0; k < 10; k++) {
    const a = -36 + k * 8 + (hash(k, 1, 711) - 0.5) * 2.4;
    const h = 34 + hash(k, 2, 711) * 16;
    const lean = (hash(k, 3, 711) - 0.5) * 6 + (k === 7 ? 9 : 0);
    const top = P(a + lean * 0.3, lean, h);
    stake(S, P(a, 0, 0), top, 3 + hash(k, 4, 711) * 0.8, id++, k === 4);
    tops.push(top);
  }
  for (const z of [12, 30]) for (let k = 1; k < 10; k++) rope(S, P(-36 + (k - 1) * 8, 3.2, z + k * 0.3), P(-36 + k * 8, 3.2, z + (k + 1) * 0.3), 0.6, 30, 0.7);
  hideOn(S, [P(-14, 4.2, 40), P(4, 4.2, 42), P(4, 4.6, 16), P(-14, 4.6, 14)], 40, HIDE, 3);
  return finish(S, 75, 96);
}

/**
 * A SKULL POLE: a crooked pole stood in the ground with a crosspiece; a great skull on its top with a stag's antlers over it, two
 * smaller skulls hung by thongs from the crosspiece, strips of hide fluttering. `seed` makes no two alike. 90 x 140 at (45, 124).
 */
function skullPole(seed: number): Sprite {
  const S = new Scene(new Px(90, 140), 45, 124);
  const lean: V3 = [(hash(seed, 1, 721) - 0.5) * 6, (hash(seed, 2, 721) - 0.5) * 6, 0];
  const top = add([0, 0, 78], lean);
  S.rod([0, 0, 0], top, 2, 1.5, TIMBER, 1);
  // (stones heaped round its foot)
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + seed;
    S.egg([Math.cos(a) * 5, Math.sin(a) * 5, 1.6], XYZ, [3, 2.6, 2.2], facetOf(GRANITE, 0.06), 2);
  }
  const bar = add(mul(top, 0.8), [0, 0, 0]);
  S.rod(add(bar, [-1, -13, 0]), add(bar, [1, 13, 1]), 1.3, 1.1, TIMBER, 3);
  skull(S, add(top, [0, 0, 4]), 5, [0.7, 0.7, 0], 4);
  antlers(S, add(top, [0, 0, 8]), [-0.7, 0.7, 0], 1.1, 6);
  for (const s of [-1, 1]) {
    const hang = add(bar, [0, s * 10, 0]);
    rope(S, hang, add(hang, [0, 0, -9]), 0, 7, 0.4);
    skull(S, add(hang, [0, 0, -12]), 3, [0.7, 0.7, 0], 8 + (s > 0 ? 2 : 0), s > 0);
  }
  for (let k = 0; k < 3; k++) {
    const y = -6 + k * 6;
    const at = add(bar, [0.8, y, -1]);
    S.quad([at, add(at, [0, 2.4, 0]), add(at, [2 + k, 3, -14 - k * 3]), add(at, [2 + k, 0.6, -14 - k * 3])], (u, v) => (v > 0.85 && u > 0.5 ? null : HIDE[v > 0.5 ? 2 : 3]), 12 + k);
  }
  return finish(S, 45, 124);
}

/**
 * THE TROLLS' FIRE: a great ring of boulders, logs heaped and burning in the enemy's pink and gold (the cult's fire, a size up), a
 * haunch of something roasting on a spit between two forked stakes; its light on the ground round it. 4 frames. 120 x 120 at (60, 92).
 */
function trollFire(f: number): Sprite {
  const S = new Scene(new Px(120, 120), 60, 92);
  fireStones(S, 20, 1);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    S.rod([Math.cos(a) * 15, Math.sin(a) * 15, 2], [Math.cos(a) * 2, Math.sin(a) * 2, 16], 2.6, 1.8, PBARK, 3 + k);
  }
  for (const s of [-1, 1]) {
    const foot: V3 = [-6, s * 22, 0];
    S.rod(foot, add(foot, [0, 0, 28]), 1.4, 1.2, TIMBER, 10);
    S.rod(add(foot, [0, 0, 24]), add(foot, [-2, s * 3, 31]), 0.9, 0.6, TIMBER, 10);
    S.rod(add(foot, [0, 0, 24]), add(foot, [2, -s * 1, 31]), 0.9, 0.6, TIMBER, 10);
  }
  S.rod([-6, -26, 27], [-6, 26, 27], 0.9, 0.9, TIMBER, 11);
  S.egg([-6, 0, 26], beamAxes([0, 0, 0], [0, 1, 0]), [10, 5.5, 5], (n, w) => (hash(Math.floor(w[1] / 2), Math.floor(w[2] / 2), 731) > 0.8 ? ROAST[1] : toneAt(n, ROAST, 0)), 12);
  S.rod([-6, 9, 26], [-6, 14, 22], 1.6, 1.0, BONE, 13);
  S.seams();
  const [bx, by] = S.at([0, 0, 8]);
  cultFire(S.p, Math.round(bx), Math.round(by), f, 1.6);
  sparks(S.p, Math.round(bx), Math.round(by), f, 6, 60);
  const s = compose(null, [S.p], null).sprite(60, 92, GRAIN);
  s.lights = [fireLight(bx, by - 18, 60 + (f % 2) * 3, 0.5)];
  return s;
}

/**
 * THE CHIEFTAIN'S SEAT: at the camp's back, a seat of three boulders heaped, a back of two great logs stood up and lashed, a troll's
 * grey fur hide draped over its back and down its seat, a stag's great antlers set over it, skulls at its foot. Two tiles each way.
 * 150 x 170 at (75, 128).
 */
function chiefSeat(): Sprite {
  const S = new Scene(new Px(150, 170), 75, 128);
  S.egg([2, 0, 9], XYZ, [20, 24, 10], facetOf(GRANITE, 0.05), 1);
  S.egg([-6, -12, 18], XYZ, [12, 11, 9], facetOf(GRANITE, 0.05), 2);
  S.egg([-6, 12, 18], XYZ, [12, 11, 9], facetOf(GRANITE, 0.05), 3);
  S.egg([2, 0, 19], XYZ, [14, 14, 3], facetOf(GRANITE, 0.02), 4);
  for (const y of [-14, 14]) S.rod([-14, y, 0], [-16, y * 0.9, 66], 5, 4.2, PBARK, 5);
  S.rod([-16, -18, 54], [-16, 18, 54], 3.2, 3.2, PBARK, 6);
  for (const y of [-14, 14]) rope(S, [-13, y - 3, 55], [-13, y + 3, 53], 0, 7, 0.8);
  // (the fur: over the back and down the seat to the ground in front)
  hideOn(S, [[-12, -16, 60], [-12, 16, 60], [-10, 16, 22], [-10, -16, 22]], 8, FUR, 5);
  hideOn(S, [[-8, -15, 22.5], [-8, 15, 22.5], [14, 15, 21], [14, -15, 21]], 9, FUR, 6);
  hideOn(S, [[14, -14, 21], [14, 14, 21], [21, 13, 2], [21, -13, 2]], 10, FUR, 7);
  antlers(S, [-16, 0, 66], [0, 1, 0], 2.0, 11);
  skull(S, [-15, 0, 64], 5.5, [1, 0, 0], 12);
  for (const [x, y] of [[26, -10], [28, 4], [24, 16]] as const) skull(S, [x, y, 3], 3.2, [0.8, 0.2 * Math.sign(y), 0], 14 + (x % 3), x === 28);
  return finish(S, 75, 128);
}

/**
 * A TROLL'S LEAN-TO: two forked posts stood at its back with a crosspole in their forks, long poles leant from the ground before
 * it up onto that, hides lashed over them for a roof sloping down toward the eye; open at the back, a heap of fur inside to sleep
 * in, the end of it showing. `face`: open toward -x (0) or -y (1). 120 x 100 at (60, 74).
 */
function leanTo(face: number): Sprite {
  const S = new Scene(new Px(120, 100), 60, 74);
  const P = (f: number, l: number, z: number): V3 => (face ? [l, f, z] : [f, l, z]);
  for (const l of [-18, 18]) {
    S.rod(P(-16, l, 0), P(-16, l * 1.02, 32), 1.6, 1.4, TIMBER, 1);
    S.rod(P(-16, l, 29), P(-14, l + Math.sign(l) * 2, 35), 0.9, 0.6, TIMBER, 1);
    S.rod(P(-16, l, 29), P(-18, l - Math.sign(l) * 1, 35), 0.9, 0.6, TIMBER, 1);
  }
  S.rod(P(-16, -22, 31), P(-16, 22, 31), 1.4, 1.4, TIMBER, 2);
  // (the fur inside, under the roof, its end out at one side)
  S.egg(P(-4, 4, 2.5), XYZ, [10, 22, 3.5], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 741) > 0.8 ? FUR[1] : toneAt(n, FUR, 0)), 3);
  // (the roof: hides over leant poles, from the crosspole down to the ground before it)
  const roof = (l0: number, l1: number, id: number, seed: number): void => {
    S.quad([P(-14, l0, 32), P(-14, l1, 32), P(16, l1, 0), P(16, l0, 0)], (u, v, w) => {
      const edge = v > 0.92 || u < 0.03 || u > 0.97;
      if (edge && hash(Math.floor(w[0] / 2) + Math.floor(w[1] / 2) * 3, seed, 742) < 0.5) return null;
      if (Math.abs(u - 0.5) < 0.025) return HIDE[1];
      const n = hash(Math.floor(w[0] / 3) + Math.floor(w[1] / 3) * 7, Math.floor(w[2] / 3), 743 + seed);
      return n > 0.85 ? HIDE[1] : n < 0.1 ? HIDE[4] : HIDE[3];
    }, id);
  };
  roof(-21, 0, 4, 1);
  roof(0, 21, 5, 2);
  for (const l of [-21, -7, 7, 21]) S.rod(P(-18, l, 34.5), P(18, l, -1), 1.0, 1.0, PBARK, 6);
  for (const l of [-14, 0, 14]) rope(S, P(-15, l - 3, 33.5), P(-15, l + 3, 33.5), 0, 7, 0.6);
  return finish(S, 60, 74);
}

/** GNAWED BONES: a heap of a meal's bones, cracked for their marrow, a ribcage, a jaw; walked over. 70 x 40 at (35, 26). */
function gnawedBones(seed: number): Sprite {
  const S = new Scene(new Px(70, 40), 35, 26);
  for (let k = 0; k < 7; k++) {
    const a = hash(k, 1, 751 + seed) * Math.PI;
    const c: V3 = [(hash(k, 2, 751 + seed) - 0.5) * 22, (hash(k, 3, 751 + seed) - 0.5) * 22, 1.2];
    const d: V3 = [Math.cos(a) * 7, Math.sin(a) * 7, 0];
    S.rod(add(c, mul(d, -1)), add(c, d), 1.1, 1.0, BONE, 1 + k);
    S.ball(add(c, mul(d, -1)), 1.6, BONE, 1 + k);
    if (k % 3) S.ball(add(c, d), 1.5, BONE, 1 + k);
  }
  for (let k = 0; k < 4; k++) {
    const pts: V3[] = [];
    for (let j = 0; j <= 4; j++) {
      const t = j / 4;
      pts.push([6 + k * 3, -6 + t * 12, 0.8 + Math.sin(t * Math.PI) * 5]);
    }
    for (let j = 1; j < pts.length; j++) S.rod(pts[j - 1], pts[j], 0.7, 0.7, BONE, 10 + k);
  }
  return finish(S, 35, 26);
}

// =================================================================================================
// THE MISTY GLADE

/**
 * THE MOONBEAM: a beam of pale moonlight coming down slantwise through a gap in the trees into the glade, a pool of it on the
 * ground; dithered (so what stands in it shows through), thinning toward its edges and up toward the canopy; motes drifting in it.
 * It stands in no one's way. 4 frames. 200 x 320 at (100, 296).
 */
function moonbeam(f: number): Sprite {
  const W = 200;
  const H = 320;
  const ax = 100;
  const ay = 296;
  const p = new Px(W, H);
  // (the pool on the ground: an ellipse, densest at its middle)
  const prx = 70;
  const pry = 30;
  for (let y = ay - pry; y <= ay + pry; y++) {
    for (let x = ax - prx; x <= ax + prx; x++) {
      const r = Math.hypot((x - ax) / prx, (y - ay) / pry);
      if (r > 1) continue;
      const d = 0.7 * (1 - r * r) + 0.06;
      if (dithered(x, y, d)) p.set(x, y, r < 0.45 ? MOON[3] : MOON[2]);
    }
  }
  // (the beam: from the pool up and back toward the light (the upper left), wider at its foot, fading as it goes up)
  for (let y = 0; y < ay; y++) {
    const up = (ay - y) / ay;
    const cx = ax - up * 70;
    const half = 52 - up * 18;
    for (let x = Math.floor(cx - half); x <= cx + half; x++) {
      const e = Math.abs(x - cx) / half;
      if (e > 1) continue;
      // (its rays: brighter streaks along it)
      const ray = 0.5 + 0.5 * Math.sin((x - cx) * 0.21 + up * 3 + 1.3) * Math.sin((x - cx) * 0.07 - 0.6);
      const d = (0.5 * (1 - e * e) * (0.6 + 0.4 * ray)) * Math.min(1, (1 - up) * 1.6) * (up < 0.05 ? up / 0.05 : 1);
      if (dithered(x, y, d)) p.set(x, y, e < 0.4 && ray > 0.6 ? MOON[4] : MOON[3]);
    }
  }
  // (motes drifting down in it)
  for (let k = 0; k < 14; k++) {
    const t = (hash(k, 1, 761) + f * 0.06) % 1;
    const up = 0.1 + 0.8 * (1 - t);
    const x = Math.round(ax - up * 70 + (hash(k, 2, 761) - 0.5) * 60 * (1 - up * 0.3) + Math.sin(f * 0.8 + k) * 2);
    const y = Math.round(ay - up * ay);
    p.set(x, y, MOON[4]);
    if (k % 3 === 0) p.set(x, y + 1, MOON[3]);
  }
  // (no ink round it: light has no edge)
  return p.sprite(ax, ay, GRAIN);
}

/** MIST, LYING: low mist in drifts on the ground, pale, thinning to nothing at its edges (dithered); walked through. 200 x 80 at (100, 42). */
function mistLying(seed: number): Sprite {
  const p = new Px(200, 80);
  const lobes: [number, number, number, number][] = [];
  for (let k = 0; k < 5; k++) lobes.push([100 + (hash(k, 1, 771 + seed) - 0.5) * 80, 42 + (hash(k, 2, 771 + seed) - 0.5) * 20, 30 + hash(k, 3, 771 + seed) * 24, 12 + hash(k, 4, 771 + seed) * 8]);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      let d = 0;
      for (const [cx, cy, rx, ry] of lobes) d = Math.max(d, 1 - Math.hypot((x - cx) / rx, (y - cy) / ry));
      if (d <= 0) continue;
      const n = hash(Math.floor(x / 5), Math.floor(y / 3), 779 + seed);
      const dd = Math.min(0.72, d * 1.1) * (0.75 + 0.5 * n);
      if (dithered(x, y, dd)) p.set(x, y, d > 0.45 ? MOON[3] : d > 0.2 ? MOON[2] : MOON[1]);
    }
  }
  return p.sprite(100, 42, GRAIN);
}

/** A WHITE DEAD TREE: a pine long dead and bleached pale, its bark gone, its trunk twisted, its bare limbs reaching; grey moss hanging from them; its roots gripping the ground. 120 x 200 at (60, 186). */
function whiteTree(seed: number): Sprite {
  const S = new Scene(new Px(120, 200), 60, 186);
  const H = 110 + hash(seed, 1, 781) * 30;
  const pts: V3[] = [];
  for (let k = 0; k <= 8; k++) {
    const t = k / 8;
    pts.push([Math.sin(t * 4 + seed) * 4 * t, Math.cos(t * 3 + seed) * 4 * t, t * H]);
  }
  for (let k = 1; k < pts.length; k++) S.rod(pts[k - 1], pts[k], 6.5 - k * 0.65, 6.5 - (k + 1) * 0.65, BLEACH, 1);
  // (roots)
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 + seed;
    S.rod([0, 0, 6], [Math.cos(a) * 9, Math.sin(a) * 9, 1], 3, 1.6, BLEACH, 2);
    S.rod([Math.cos(a) * 9, Math.sin(a) * 9, 1], [Math.cos(a) * 15, Math.sin(a) * 15, 0], 1.6, 0.8, BLEACH, 2);
  }
  // (its limbs: bare, reaching up and out, forking)
  let id = 3;
  for (let k = 0; k < 6; k++) {
    const at = pts[3 + (k % 5)];
    const a = hash(k, 2, 781 + seed) * Math.PI * 2;
    const len = 22 + hash(k, 3, 781 + seed) * 18;
    const end = add(at, [Math.cos(a) * len, Math.sin(a) * len, len * 0.55]);
    S.rod(at, end, 2.4, 0.8, BLEACH, id);
    const mid = add(mul(at, 0.45), mul(end, 0.55));
    const fork = add(mid, [Math.cos(a + 0.8) * len * 0.4, Math.sin(a + 0.8) * len * 0.4, len * 0.45]);
    S.rod(mid, fork, 1.3, 0.5, BLEACH, id);
    // (grey moss hanging from it)
    if (k % 2 === 0) for (let j = 0; j < 3; j++) {
      const top = add(mul(at, 0.3 + j * 0.2), mul(end, 0.7 - j * 0.2));
      S.rod(top, add(top, [0, 0, -8 - j * 3]), 0.7, 0.3, GREYMOSS, 20 + k);
    }
    id++;
  }
  return finish(S, 60, 186);
}

/** A STANDING STONE, CLAWED: a tall rough slab stood up long ago and leaning a little, its top broken off slantwise, grey lichen on it, moss at its foot, scored down its face by three great claws. 70 x 110 at (35, 94). */
function standingStone(seed: number): Sprite {
  const S = new Scene(new Px(70, 110), 35, 94);
  const tilt = (hash(seed, 1, 791) - 0.5) * 0.16;
  const turn = 0.5 + hash(seed, 2, 791) * 0.5;
  const A: [V3, V3, V3] = [[Math.cos(turn), Math.sin(turn), tilt], [-Math.sin(turn), Math.cos(turn), 0], [-tilt * Math.cos(turn), -tilt * Math.sin(turn), 1]];
  const shade = (k: number) => (face: number, u: number, v: number, n: V3): string => {
    // (the claw marks: three grooves slanting down the faces toward the eye)
    if ((face === 0 || face === 2) && k === 0) {
      const s = u * 3 - v * 1.2;
      for (const q of [0.4, 1.0, 1.6]) if (Math.abs(s - q) < 0.07 && v > 0.15 && v < 0.85) return GRANITE[0];
    }
    const h = hash(Math.floor(u * 9) + face * 13 + k * 31, Math.floor(v * 12), 793 + seed);
    if (h > 0.9) return LICHEN;
    if (face === 4) return GRANITE[k ? 3 : 2];
    return facetOf(GRANITE, 0.03)(n);
  };
  S.box(add([0, 0, 20], mul(A[0], 0)), A, [5.5, 9, 20], shade(0), 1);
  // (its broken top: a narrower block set askew on it, its upper face slanting)
  const B: [V3, V3, V3] = [A[0], A[1], [A[2][0] + 0.25 * A[1][0], A[2][1] + 0.25 * A[1][1], 1]];
  S.box([0, 0, 44], B, [5, 7.5, 5.5], shade(1), 2);
  // (moss and stones at its foot)
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + seed;
    S.egg([Math.cos(a) * 11, Math.sin(a) * 11, 1.2], XYZ, [3.4, 3, 2], k % 2 ? facetOf(GRANITE, 0.06) : (n) => toneAt(n, MOSS, 0), 3 + k);
  }
  return finish(S, 35, 94);
}

/** MOONFLOWERS: small pale flowers, five petals and a dim heart, on stems among dark leaves; walked over. 56 x 34 at (28, 24). */
function moonflowers(seed: number): Sprite {
  const S = new Scene(new Px(56, 34), 28, 24);
  for (let k = 0; k < 9; k++) {
    const c: V3 = [(hash(k, 1, 801 + seed) - 0.5) * 24, (hash(k, 2, 801 + seed) - 0.5) * 24, 1];
    S.egg(c, XYZ, [3.6, 2.2, 1], (n) => toneAt(n, LEAF, 0), 1 + k);
  }
  S.seams();
  for (let k = 0; k < 7; k++) {
    const w: V3 = [(hash(k, 3, 801 + seed) - 0.5) * 22, (hash(k, 4, 801 + seed) - 0.5) * 22, 4 + hash(k, 5, 801 + seed) * 3];
    const [x, y] = S.at(w).map(Math.round);
    S.p.set(x, y + 1, LEAF[2]).set(x, y + 2, LEAF[2]);
    for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] as const) S.p.set(x + dx, y + dy, MOON[4]);
    S.p.set(x, y, '#b8a46a');
  }
  return compose(null, [S.p], null).sprite(28, 24, GRAIN);
}

/** A DEER'S BONES, PICKED CLEAN: a deer's ribs standing up off its spine, its skull with short antlers, its long leg bones scattered; walked over. 90 x 50 at (45, 34). */
function deerBones(): Sprite {
  const S = new Scene(new Px(90, 50), 45, 34);
  S.rod([-16, -2, 2], [14, 2, 2.4], 1.4, 1.2, BONE, 1);
  for (let k = 0; k < 7; k++) {
    const x = -10 + k * 3.6;
    for (const s of [-1, 1]) {
      const pts: V3[] = [];
      for (let j = 0; j <= 4; j++) {
        const t = j / 4;
        pts.push([x, s * Math.sin(t * Math.PI * 0.55) * 8, 2.4 + Math.sin(t * Math.PI * 0.8) * (7 - Math.abs(k - 3))]);
      }
      for (let j = 1; j < pts.length; j++) S.rod(pts[j - 1], pts[j], 0.6, 0.55, BONE, 2 + k);
    }
  }
  skull(S, [20, 4, 2.6], 3.2, [0.8, 0.6, 0], 12);
  antlers(S, [19, 4, 5], [-0.6, 0.8, 0], 0.55, 14);
  for (const [a, b] of [[[-22, 10, 1], [-8, 16, 1]], [[-24, -6, 1], [-14, -14, 1.2]], [[4, 14, 1], [16, 18, 1]]] as const) {
    S.rod(a as unknown as V3, b as unknown as V3, 0.9, 0.8, BONE, 15);
    S.ball(a as unknown as V3, 1.3, BONE, 15);
  }
  return finish(S, 45, 34);
}

// =================================================================================================

/** The pieces that move (their frames over and over: render/act1_pieces.ts MOVING). */
export const F9_LAIR_MOVING: readonly string[] = ["the trolls' fire", 'the moonbeam'];

/** FLOOR 9'S TWO SIDE AREAS' PIECES: the trolls' camp's and the misty glade's. */
export function f9LairPieces(): Piece[] {
  return [
    { name: "the trolls' barricade", kind: 'obstacle', frames: [barricade(false), barricade(true)], shadow: 0.6 },
    { name: "the trolls' palisade", kind: 'obstacle', frames: [palisade(false), palisade(true)], shadow: 0.7 },
    { name: 'a skull pole', kind: 'obstacle', frames: [skullPole(1), skullPole(4)], shadow: 0.3 },
    { name: "the trolls' fire", kind: 'obstacle', frames: [0, 1, 2, 3].map(trollFire), shadow: 0.5 },
    { name: "the chieftain's seat", kind: 'obstacle', frames: [chiefSeat()], shadow: 1.0 },
    { name: "a troll's lean-to", kind: 'obstacle', frames: [leanTo(0), leanTo(1)], shadow: 0.8 },
    { name: 'gnawed bones', kind: 'on the floor', frames: [gnawedBones(0), gnawedBones(5)] },
    { name: 'the moonbeam', kind: 'obstacle', frames: [0, 1, 2, 3].map(moonbeam) },
    { name: 'mist, lying', kind: 'on the floor', frames: [mistLying(0), mistLying(7)] },
    { name: 'a white dead tree', kind: 'obstacle', frames: [whiteTree(2), whiteTree(5)], shadow: 0.45 },
    { name: 'a standing stone, clawed', kind: 'obstacle', frames: [standingStone(1), standingStone(3)], shadow: 0.35 },
    { name: 'moonflowers', kind: 'on the floor', frames: [moonflowers(0), moonflowers(4)] },
    { name: "a deer's bones, picked clean", kind: 'on the floor', frames: [deerBones()] },
  ];
}
