// FLOOR 8, ECHO CANYON (THE CANTOR'S GORGE): ITS PIECES, the first of them (a mock-up; nothing of the game
// imports it).
//
// The owner, 14 Oct 2026, to Echo Canyon's ground (art/canyon.ts), asked “Is this Echo Canyon's ground?”, by
// 22:13: “Yes, on to its pieces (Recommended)”. What they are follows the planning chat's canyon he said yes to
// on 12 Oct (“Yes, this is it (Recommended)”, with the near wall's shadow and see-through pillars where it turns)
// and its dressed tops (“Yes, like this (Recommended)”: junipers, sage, yucca, dead trees, boulders, small
// hoodoos, a skull; the cult's lookout on the far top with a hoist letting crates down to the road); and his
// design doc: the canyon is the cult's supply road down the mountain, its wagons hauling the quarry's obelisks.
//
// THE FLOOR'S BOSS is the Cantor, the cult's choirmaster, whose every move echoes off the canyon walls a beat
// later (his yes of 12 Oct, 18:07); his rule for a set of floors from the second on (10 Oct): “Going forward,
// let's do 25 that are the theme of the 5 levels, then 25 for each boss.” So these are the red-rock canyon's
// and the cult's supply road's; the Cantor's own (his chant, his bells, his horn) come next.
//
// THE RULES THEY KEEP: crisp pixels, two to a game pixel; light from the upper left (floor 4's painter in depth,
// Scene); the indigo seam where one thing ends before another; in daylight in the canyon, a step quieter than the
// figures and duller than any word; nothing of a place glows, nothing cyan, nothing pink or red (the rock is
// red-orange, never red: its hue is kept off the pinks); the cult's violet only on what is the cult's. Each
// thing's soft shadow the game's (a piece's `shadow`).
//
// Measures as floor 4's Scene: across the floor 40 units to a tile (x down the screen to the right, y down it
// to the left), heights in picture pixels; each picture anchored at the middle of its foot. A piece "on the
// wall" stands at a wall's foot against its face, the face behind it (toward -x and -y).

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { CLOTH, PAINT } from './act1_cult';
import { C_SAND } from './canyon';
import { Scene, XYZ, facetOf, toneAt } from './floor4';
import type { V3 } from './floor4';
import { FRESH, IRON, ROPE, TIMBER, add, beamAxes, cross, dot, finish, fr, mul, norm, rope, seenNormal, sub, tileUV, timber } from './floor6';
import { BONE, DRIFT, SACKING } from './floor7';
import type { Piece } from './floorkit';
import { GRAIN, hash } from './kit';
import type { Ramp } from './kit';

// =================================================================================================
// The colours: the canyon's and its plants', in hard daylight

/** THE CANYON'S RED SANDSTONE, as what stands and lies: deep shade to lit (its hue kept on the orange side of red). */
export const RROCK: Ramp = ['#4c3832', '#6a4838', '#8a5c48', '#a4725a', '#bc8a6c'];
/** Its paler beds, banded through the red. */
export const RBAND: Ramp = ['#56423a', '#785848', '#98745c', '#b68c72', '#ccaa8e'];
/** The hard pale caprock (a hoodoo's cap, the rim's slabs). */
export const CAPROCK: Ramp = ['#5a4a44', '#7e6858', '#a48a74', '#c4aa90', '#dcc6ac'];
/** A juniper's needles: a dull grey-green, never the friend's cyan. */
export const JUNIPER: Ramp = ['#1f2a24', '#2c3c32', '#3e5244', '#556a56', '#6e8268'];
/** A juniper's shreddy bark. */
export const BARK: Ramp = ['#3a302c', '#54463c', '#6e5e50', '#8a7a68', '#a49480'];
/** Sagebrush, grey-green and silvered. */
export const SAGE: Ramp = ['#3e4438', '#56604c', '#727c64', '#8e967c', '#a8ae96'];
/** A yucca's leaves, olive, their tips dry. */
export const YUCCA: Ramp = ['#3a4026', '#525a34', '#6c7442', '#878e56', '#a0a66e'];
/** A yucca's flowers, cream bells. */
export const BLOOM: Ramp = ['#7c7466', '#a49a86', '#c6bea8', '#ded6c2', '#eee8d8'];

// =================================================================================================
// Little helpers

/** A ring of points round `c` in the plane of the unit axes `u` and `v`, radius `R`: an upright wheel's rim, a hoop. */
function ring(S: Scene, c: V3, u: V3, v: V3, R: number, r: number, ramp: Ramp, id: number, skip?: (a: number) => boolean): void {
  const n = Math.max(24, Math.round(R * 4));
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    if (skip && skip(a)) continue;
    S.ball(add(c, add(mul(u, Math.cos(a) * R), mul(v, Math.sin(a) * R))), r, ramp, id, undefined, 0.1);
  }
}

/** A WAGON'S WHEEL, upright: its rim, its spokes, its hub. `c` its middle, `axle` the way its axle runs. */
function wheel(S: Scene, c: V3, axle: V3, R: number, id: number, broken = false): void {
  const a = norm(axle);
  const u: V3 = norm(cross(a, Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const v: V3 = norm(cross(a, u));
  ring(S, c, u, v, R, 1.3, TIMBER, id, broken ? (t) => t > 4.1 && t < 4.9 : undefined);
  for (let k = 0; k < 8; k++) {
    if (broken && (k === 3 || k === 6)) continue;
    const t = (k / 8) * Math.PI * 2 + 0.2;
    S.rod(c, add(c, add(mul(u, Math.cos(t) * (R - 1)), mul(v, Math.sin(t) * (R - 1)))), 0.6, 0.55, TIMBER, id + 1);
  }
  S.egg(c, [a, u, v], [2.2, 2.6, 2.6], (n) => toneAt(n, IRON, 0.1), id + 2);
}

/** A CRATE of the cult's stores: boarded, iron at its corners; `mark`: the cult's mark daubed on its face in bone-pale paint. */
function crate(S: Scene, c: V3, turn: number, r: V3, id: number, mark = false): void {
  const A = beamAxes([0, 0, 0], [Math.cos(turn), Math.sin(turn), 0]);
  S.box(c, A, r, (f, u, v, n) => {
    const edge = u < 0.08 || u > 0.92 || v < 0.08 || v > 0.92;
    if (edge && f !== 4) return toneAt(n, IRON, 0.15);
    if (mark && (f === 0 || f === 2) && Math.abs(u - 0.5) < 0.07 && v > 0.25 && v < 0.75) return PAINT;
    if (mark && (f === 0 || f === 2) && Math.abs(v - 0.42) < 0.06 && u > 0.32 && u < 0.68) return PAINT;
    if (Math.abs(fr(v * 3) - 0.5) < 0.06 && f !== 4) return TIMBER[1]; // the boards' seams
    if (f === 4 && Math.abs(fr(u * 3) - 0.5) < 0.06) return TIMBER[2];
    return toneAt(n, TIMBER, 0.05);
  }, id);
}

/** A SACK of meal, tied at its neck. */
function sack(S: Scene, c: V3, turn: number, size: number, id: number): void {
  S.egg(c, beamAxes([0, 0, 0], [Math.cos(turn), Math.sin(turn), 0]), [8 * size, 5.6 * size, 5 * size], (n, w) => {
    const q = sub(w, c);
    if (Math.abs(q[2] - 1.5 * size) < 0.6 && n[2] > 0) return SACKING[1];
    return toneAt(n, SACKING, 0);
  }, id);
}

// =================================================================================================
// THE CANYON'S OWN: its hoodoos, its rock, its plants, its bones

/**
 * A HOODOO: a column of the red sandstone the wind has carved round, bulging and necking as its beds were soft or
 * hard, banded red and pale, a harder cap of the pale caprock riding on its top, scree at its foot. Tall: see it
 * through, as the mystic's tent is (his pick of 12 Oct). `size` 0, 1 or 2.
 */
function hoodoo(size: number, seed: number): Sprite {
  const H = [92, 122, 152][size];
  const R0 = [13, 16, 19][size];
  const W = 2 * Math.ceil(R0 * 1.7) + 30;
  const S = new Scene(new Px(W, H + 36), W / 2, H + 14);
  // its beds, from the foot up: each its own thickness, most red, a few pale, a hard one standing out a little
  const beds: { z: number; pale: boolean; hard: boolean }[] = [];
  for (let z = 0, j = 0; z < H; j++) {
    const t = 5 + Math.floor(hash(j, seed, 981) * 10);
    beds.push({ z, pale: hash(j, seed, 982) > 0.7, hard: hash(j, seed, 983) > 0.72 });
    z += t;
  }
  const bedAt = (z: number) => {
    let i = 0;
    while (i + 1 < beds.length && beds[i + 1].z <= z) i++;
    return beds[i];
  };
  const radius = (z: number): number => {
    const k = z / H;
    const taper = 1 - 0.3 * k;
    const bulge = 0.13 * Math.sin(z / 13 + seed) + 0.07 * Math.sin(z / 5.3 + seed * 2);
    // the neck under its cap, worn thin
    const neck = k > 0.74 ? -0.3 * Math.sin(((k - 0.74) / 0.26) * Math.PI) : 0;
    return R0 * (taper + bulge + neck + (bedAt(z).hard ? 0.07 : 0));
  };
  // (it leans and wanders a little as it rises, not turned on a lathe)
  const mid = (z: number): V3 => [2.2 * Math.sin(z / 37 + seed), 1.6 * Math.cos(z / 29 + seed * 1.7), z];
  for (let z = 0; z < H - 7; z += 2) {
    const r = radius(z);
    const b = bedAt(z);
    S.egg(add(mid(z), [0, 0, 1]), XYZ, [r * (1 + 0.05 * Math.sin(seed + z)), r, 1.6], (n, w) => {
      // a bed's foot, a dark line where the one under it gives way
      if (w[2] - bedAt(w[2]).z < 1.2) return toneAt(n, RROCK, -0.45);
      // grooves the wind and rain have cut down it, here and there
      const a = Math.atan2(w[1] - mid(w[2])[1], w[0] - mid(w[2])[0]);
      if (fr(a * 2.2 + seed) < 0.06 && hash(Math.floor(w[2] / 9), Math.floor(a * 2.2 + seed), 984) > 0.4) return toneAt(n, RROCK, -0.3);
      return toneAt(n, b.pale ? RBAND : RROCK, b.hard ? 0.02 : -0.1);
    }, 1);
  }
  // its cap of hard pale caprock, wider than the neck under it: flat-topped, lit, dark under its lip
  const capR = R0 * 1.0;
  const top = mid(H - 4);
  S.egg(add(top, [1, -1, 0]), beamAxes([0, 0, 0], [1, 0.3, 0.06]), [capR * 1.12, capR * 0.96, 5], (n) => (n[2] > 0.8 ? CAPROCK[3] : n[2] < -0.2 ? CAPROCK[0] : toneAt(n, CAPROCK, -0.08)), 2);
  // scree at its foot
  for (let i = 0; i < 9; i++) {
    const a = hash(i, seed, 985) * Math.PI * 2;
    const d = R0 + 2 + hash(i, seed, 986) * 7;
    const sz = 1.4 + hash(i, seed, 987) * 1.8;
    S.egg([Math.cos(a) * d, Math.sin(a) * d, sz * 0.5], beamAxes([0, 0, 0], [Math.cos(a), Math.sin(a), 0]), [sz * 1.3, sz, sz * 0.7], facetOf(RROCK, -0.05), 3 + (i % 3));
  }
  return finish(S, W / 2, H + 14);
}

/** A RED BOULDER, fallen from the walls: the sandstone in a rounded block, its beds showing as lines across it. `size` 0 to 2. */
function redBoulder(size: number, seed: number): Sprite {
  const S = new Scene(new Px(80, 64), 40, 46);
  const r = 9 + size * 5;
  const turn = hash(seed, 1, 985) * Math.PI;
  const A = beamAxes([0, 0, 0], [Math.cos(turn), Math.sin(turn), 0.12]);
  S.egg([0, 0, r * 0.62], A, [r * 1.2, r * 0.95, r * 0.72], (n, w) => {
    if (fr(w[2] / 5 + hash(seed, 2, 985)) < 0.14 && n[2] < 0.7) return toneAt(n, RROCK, -0.4);
    return facetOf(RROCK, -0.08)(n);
  }, 1);
  if (size > 0) S.egg([r * 0.8, r * 0.55, r * 0.3], XYZ, [r * 0.55, r * 0.5, r * 0.38], facetOf(RROCK, -0.05), 2);
  return finish(S, 40, 46);
}

/** A JUNIPER: a twisted trunk of shreddy bark, its crown in dense dull-green clumps, lit at their upper left. `size` 0 to 2. Tall: see it through. */
function juniper(size: number, seed: number): Sprite {
  const H = [44, 62, 80][size];
  const S = new Scene(new Px(96, H + 24), 48, H + 14);
  // the trunk, leaning and twisting, two leads off it
  const lean = (hash(seed, 1, 986) - 0.5) * 10;
  const trunk = (t: number): V3 => [lean * t + Math.sin(t * 3 + seed) * 2.5, -lean * 0.4 * t + Math.cos(t * 2.4) * 2, t * H * 0.42];
  for (let k = 0; k < 6; k++) S.rod(trunk(k / 6), trunk((k + 1) / 6), 3.2 - k * 0.3, 3 - (k + 1) * 0.3, BARK, 1);
  const top = trunk(1);
  // the crown: clumps round and above the top of the trunk, bigger low, smaller high
  const n = 9 + size * 4;
  for (let i = 0; i < n; i++) {
    const a = hash(i, seed, 987) * Math.PI * 2;
    const up = hash(i, seed, 988);
    const d = (1 - up * 0.6) * (H * 0.32) * hash(i, seed, 989);
    const c: V3 = add(top, [Math.cos(a) * d, Math.sin(a) * d, up * H * 0.5 - 4]);
    const r = (H * 0.14) * (1 - up * 0.45) * (0.7 + 0.5 * hash(i, seed, 990));
    S.egg(c, XYZ, [r * 1.15, r * 1.15, r * 0.85], (nn, w) => {
      // tufts: the clump's face broken into little tips, a lit one here and there
      const t = hash(Math.floor(w[0] / 2.5), Math.floor(w[1] / 2.5) + Math.floor(w[2] / 2.5) * 7, seed + i);
      return toneAt(nn, JUNIPER, t > 0.7 ? 0.25 : t < 0.2 ? -0.25 : 0);
    }, 2 + (i % 3));
  }
  // a few dark berries' blue would be the friend's: none. Its roots over the rock.
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + seed;
    S.rod([0, 0, 2], [Math.cos(a) * 8, Math.sin(a) * 8, 0.4], 2, 1, BARK, 6);
  }
  return finish(S, 48, H + 14);
}

/** A DEAD JUNIPER: bleached by the sun, its bark gone, its trunk and limbs twisted back on themselves. Tall: see it through. */
function deadJuniper(): Sprite {
  const S = new Scene(new Px(96, 96), 48, 86);
  const trunk = (t: number): V3 => [Math.sin(t * 3.2) * 4 - t * 4, Math.cos(t * 2.6) * 3 + t * 3, t * 40];
  for (let k = 0; k < 8; k++) S.rod(trunk(k / 8), trunk((k + 1) / 8), 3.6 - k * 0.25, 3.4 - (k + 1) * 0.25, DRIFT, 1);
  const limbs: [number, number, number, number][] = [[0.5, 0.4, 24, 18], [0.7, 2.6, 22, 14], [0.85, -1.2, 18, 22], [1, 1.6, 14, 16], [0.35, 3.8, 18, 6]];
  limbs.forEach(([t, a, l, up], i) => {
    const s = trunk(t);
    const m = add(s, [Math.cos(a) * l * 0.5, Math.sin(a) * l * 0.5, up * 0.7]);
    const e = add(m, [Math.cos(a - 0.7) * l * 0.55, Math.sin(a - 0.7) * l * 0.55, up * 0.25]);
    S.rod(s, m, 1.8, 1.2, DRIFT, 2 + i);
    S.rod(m, e, 1.2, 0.6, DRIFT, 2 + i);
  });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.3;
    S.rod([0, 0, 2], [Math.cos(a) * 11, Math.sin(a) * 11, 0.4], 2.4, 1.1, DRIFT, 8);
  }
  return finish(S, 48, 86);
}

/** A YUCCA: a rosette of stiff, sword-thin leaves, their tips dry; `bloom`: its tall stalk up out of it hung with cream bells. */
function yucca(bloom: boolean, seed: number): Sprite {
  const H = bloom ? 96 : 40;
  const S = new Scene(new Px(64, H + 16), 32, H + 8);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + hash(i, seed, 991) * 0.5;
    const out = 0.35 + 0.65 * hash(i, seed, 992);
    const len = 15 + hash(i, seed, 993) * 8;
    const tip: V3 = [Math.cos(a) * len * out, Math.sin(a) * len * out, 4 + len * Math.sqrt(1 - out * out) * 1.6];
    const mid = mul(tip, 0.55);
    S.rod([0, 0, 3], mid, 1.2, 0.9, YUCCA, 1 + (i % 2));
    S.rod(mid, tip, 0.9, 0.35, out > 0.8 ? [YUCCA[0], YUCCA[1], BARK[2], BARK[3], BARK[4]] : YUCCA, 1 + (i % 2));
  }
  if (bloom) {
    const top = H - 4;
    S.rod([0, 0, 18], [1, -1, top], 1.1, 0.7, BARK, 3);
    for (let k = 0; k < 16; k++) {
      const z = top - 34 + (k / 16) * 32;
      const a = k * 2.4 + seed;
      const r = 4.5 * (1 - (k / 16) * 0.6);
      S.egg([1 + Math.cos(a) * r, -1 + Math.sin(a) * r, z], XYZ, [2.2, 2.2, 2.8], (n) => toneAt(n, BLOOM, 0.1), 4);
    }
  }
  return finish(S, 32, H + 8);
}

/** SAGEBRUSH: a low grey-green mound of twigs and silvered leaves, ragged at its edge. `size` 0 or 1. */
function sagebrush(size: number, seed: number): Sprite {
  const S = new Scene(new Px(64, 44), 32, 34);
  const R = 10 + size * 4;
  for (let i = 0; i < 18 + size * 8; i++) {
    const a = hash(i, seed, 994) * Math.PI * 2;
    const d = R * Math.sqrt(hash(i, seed, 995)) * 0.75;
    const r = 3.4 + hash(i, seed, 996) * 2.4;
    const z = r * 0.8 + (1 - d / R) * R * 0.5;
    S.egg([Math.cos(a) * d, Math.sin(a) * d, z], XYZ, [r, r, r * 0.8], (n, w) => {
      const t = hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2) + Math.floor(w[2] / 2) * 5, seed + i);
      return toneAt(n, SAGE, t > 0.72 ? 0.3 : t < 0.18 ? -0.3 : 0);
    }, 1 + (i % 3));
  }
  return finish(S, 32, 34);
}

/** A BLEACHED SKULL of a longhorn steer, lying on the sand: its long face, its dark eyes, its horns sweeping wide. */
function steerSkull(): Sprite {
  const S = new Scene(new Px(72, 40), 36, 28);
  const F: V3 = norm([0.55, 0.75, -0.15]);
  const U: V3 = norm(cross(cross(F, [0, 0, 1]), F));
  const Rt: V3 = norm(cross(F, U));
  const c: V3 = [0, 0, 4.2];
  // its long face, narrowing to the muzzle
  S.egg(add(c, mul(F, 3)), [F, Rt, U], [9, 4.6, 3.4], (n, w) => {
    const q = sub(w, c);
    const f = dot(q, F);
    const s = dot(q, Rt);
    if (Math.abs(f + 1.2) < 1.4 && Math.abs(Math.abs(s) - 2.6) < 1.1 && dot(n, U) > 0.2) return '#2a2420'; // its eyes
    if (f > 9 && Math.abs(s) < 1.2 && dot(n, U) > 0) return BONE[1]; // the nose's hollow
    return toneAt(n, BONE, 0.08);
  }, 1);
  S.ball(add(c, mul(F, -4)), 4, BONE, 1, undefined, 0.05);
  // its horns: out to each side, then sweeping up and forward at their tips
  for (const sg of [1, -1]) {
    let prev = add(add(c, mul(F, -4)), mul(Rt, sg * 3.2));
    for (let k = 1; k <= 8; k++) {
      const t = k / 8;
      const p = add(add(add(c, mul(F, -4 + t * 4)), mul(Rt, sg * (3.2 + t * 17))), mul(U, t * t * 7));
      S.rod(prev, p, 1.5 - t * 0.9, 1.5 - (t + 1 / 8) * 0.9, k > 6 ? BARK : BONE, 2);
      prev = p;
    }
  }
  return finish(S, 36, 28);
}

// =================================================================================================
// THE CULT'S SUPPLY ROAD: its wagons, its stores, its ruts, its hoist, its lookout

/**
 * THE CULT'S WAGON: a four-wheeled supply wagon along x, its bed boarded, hooped and covered in the cult's violet
 * cloth, the cult's mark painted on its side in bone-pale; crates and sacks at its tail; its tongue out before it.
 * `broken`: broken down on the road, a front wheel off and lying, its nose down in the sand, its cover torn, crates
 * spilt from its tail.
 */
function wagon(broken: boolean): Sprite {
  const S = new Scene(new Px(150, 120), 75, 84);
  const tilt = broken ? 0.16 : 0;
  // the bed: along x, its nose (+x) down if broken
  const bedZ = (x: number): number => 15 + (broken ? -x * tilt : 0);
  const bedC: V3 = [0, 0, bedZ(0)];
  const along = norm([1, 0, -tilt]);
  const A = beamAxes([0, 0, 0], along);
  S.box(bedC, A, [30, 13, 3.4], (f, u, v, n) => {
    if (f === 4 && Math.abs(fr(v * 6) - 0.5) < 0.08) return TIMBER[1];
    if (f !== 4 && Math.abs(fr(u * 8) - 0.5) < 0.05) return TIMBER[1];
    return toneAt(n, TIMBER, 0);
  }, 1);
  // its sides: boards up from the bed
  for (const sy of [1, -1]) {
    const a: V3 = add(bedC, add(mul(along, -30), [0, sy * 13, 3]));
    const b: V3 = add(bedC, add(mul(along, 30), [0, sy * 13, 3]));
    S.quad([a, b, add(b, [0, 0, 7]), add(a, [0, 0, 7])], (u, v) => (v > 0.85 || Math.abs(fr(u * 6) - 0.5) < 0.05 ? TIMBER[3] : sy > 0 ? TIMBER[2] : TIMBER[1]), 2);
  }
  // the hoops and the cover over them, the cult's violet, the mark on its side; torn if broken
  const coverTop = 26;
  for (let k = 0; k < 5; k++) {
    const x = -24 + k * 12;
    if (broken && k === 4) continue;
    const base = add(bedC, add(mul(along, x), [0, 0, 6]));
    S.egg(add(base, [0, 0, 0]), [along, [0, 1, 0], [0, 0, 1]], [0.8, 13.4, coverTop], (n, w) => (w[2] > bedZ(x) + 6 ? toneAt(n, TIMBER, 0.1) : null), 3);
  }
  const cov0 = broken ? -26 : -26;
  const cov1 = broken ? 10 : 26;
  S.egg(add(bedC, add(mul(along, (cov0 + cov1) / 2), [0, 0, 6])), [along, [0, 1, 0], [0, 0, 1]], [(cov1 - cov0) / 2 + 1, 13.6, coverTop + 0.5], (n, w) => {
    const q = sub(w, bedC);
    const x = dot(q, along);
    if (q[2] < 6 + (broken ? -x * tilt : 0)) return null;
    // its folds: lines across it at each hoop
    if (Math.abs(fr((x + 24) / 12) - 0.5) > 0.44) return CLOTH[1];
    // the cult's mark, bone-pale, on its near side
    if (q[1] > 9 && Math.abs(x + 2) < 1.8 && q[2] > 16 && q[2] < 30) return PAINT;
    if (q[1] > 9 && Math.abs(q[2] - 24) < 1.6 && Math.abs(x + 2) < 5.5) return PAINT;
    if (broken && x > 4 && hash(Math.floor(x), Math.floor(q[2] / 3), 997) > 0.55) return null; // torn
    return toneAt(n, CLOTH, 0.05);
  }, 4);
  // its wheels: big behind, smaller before
  const wy = 15;
  wheel(S, [-20, wy, 10], [0, 1, 0], 10, 10);
  wheel(S, [-20, -wy, 10], [0, 1, 0], 10, 13);
  if (!broken) {
    wheel(S, [20, wy, 8.5], [0, 1, 0], 8.5, 16);
    wheel(S, [20, -wy, 8.5], [0, 1, 0], 8.5, 19);
    // the tongue, out before it, resting on the sand
    timber(S, [30, 0, 8], [56, 2, 1.5], 1.4, 22);
  } else {
    // the far front wheel still on; the near one off, lying flat beside the wagon, two spokes gone
    wheel(S, [20, -wy, 6], [0, 1, 0.1], 8.5, 19);
    const lw: V3 = [34, 26, 1.2];
    wheel(S, lw, [0.1, 0.1, 1], 8.5, 16, true);
    timber(S, [30, 0, 5], [52, -6, 1.5], 1.4, 22);
    // crates and a sack spilt from its tail
    crate(S, [-42, 6, 6], 0.5, [6, 5.5, 5.5], 23, true);
    crate(S, [-36, 20, 5], 1.2, [5, 5, 4.6], 24);
    sack(S, [-24, 26, 4.4], 0.3, 0.85, 25);
  }
  if (!broken) {
    crate(S, [-36, 0, 18], 0, [5, 6, 5], 23, true);
    sack(S, [-38, 8, 4.5], 1.1, 0.8, 25);
  }
  return finish(S, 75, 84);
}

/** A CRATE OF THE CULT'S STORES, standing on the road; broken: its boards burst and lying, its meal spilt pale on the sand. */
function storesCrate(broken: boolean): Sprite {
  const S = new Scene(new Px(56, 52), 28, 40);
  if (!broken) {
    crate(S, [0, 0, 7], 0.4, [7.5, 7, 7], 1, true);
    return finish(S, 28, 40);
  }
  S.egg([1, 2, 0], XYZ, [13, 10, 0.5], (_n, w) => (Math.hypot((w[0] - 1) / 13, (w[1] - 2) / 10) > 0.75 ? SACKING[3] : SACKING[4]), 1);
  for (let k = 0; k < 6; k++) {
    const a = hash(k, 1, 998) * Math.PI * 2;
    const r = 5 + hash(k, 2, 998) * 7;
    const c: V3 = [Math.cos(a) * r, Math.sin(a) * r, 1.2];
    const t = a + (hash(k, 3, 998) - 0.5) * 2;
    S.box(c, beamAxes([0, 0, 0], [Math.cos(t), Math.sin(t), 0.05]), [6, 1.6, 0.8], (f, _u, _v, n) => (f === 4 ? TIMBER[3] : toneAt(n, TIMBER, 0)), 2 + k);
  }
  S.box([-3, -3, 3], beamAxes([0, 0, 0], [1, 0.2, 0]), [6, 4.5, 3], (f, u, _v, n) => (u < 0.1 || u > 0.9 ? toneAt(n, IRON, 0.1) : f === 4 ? TIMBER[3] : toneAt(n, TIMBER, 0)), 9);
  return finish(S, 28, 40);
}

/** A SACK OF MEAL, the cult's; split: torn open, its meal spilt pale on the sand. */
function mealSack(split: boolean): Sprite {
  const S = new Scene(new Px(44, 36), 22, 26);
  if (!split) {
    sack(S, [0, 0, 5], 0.6, 1, 1);
    sack(S, [2, 4, 12], 0.2, 0.8, 2);
    return finish(S, 22, 26);
  }
  S.egg([2, 1, 0], XYZ, [12, 9, 0.5], (_n, w) => (Math.hypot((w[0] - 2) / 12, (w[1] - 1) / 9) > 0.7 ? SACKING[3] : BONE[4]), 1);
  S.egg([-3, -2, 3], beamAxes([0, 0, 0], [1, 0.5, 0]), [7, 5, 2.6], (n) => toneAt(n, SACKING, -0.05), 2);
  return finish(S, 22, 26);
}

/** The riverbed's sand (art/canyon.ts), as the ruts are worn in it. */
const SAND = C_SAND.map((c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join(''));

/** THE CULT'S WHEEL RUTS, a floor tile: two grooves worn in the sand by its wagons, along x or along y, their far lips lit. */
function rutsTile(alongY: boolean): Sprite {
  const p = new Px(64, 34);
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const across = alongY ? uv[0] : uv[1];
      const along = alongY ? uv[1] : uv[0];
      for (const mid of [21, 43]) {
        const m = mid + 1.6 * Math.sin(along / 11 + mid);
        const d = across - m;
        if (Math.abs(d) < 2.2) p.set(px, py, d < -0.6 ? SAND[0] : SAND[1]);
        else if (d >= 2.2 && d < 3.6) p.set(px, py, SAND[4]);
      }
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/** THE CULT'S HOIST, on the wall: a rope let down the face from the lookout above, a crate of stores slung in it halfway down, the rope's slack coiled at the wall's foot. */
function hoist(): Sprite {
  const S = new Scene(new Px(56, 168), 28, 158);
  const top: V3 = [0, -4, 150];
  const crateC: V3 = [1, -2, 72];
  rope(S, top, add(crateC, [0, 0, 9]), 0, 1, 0.6);
  // the sling round the crate
  rope(S, add(crateC, [0, 0, 9]), add(crateC, [-4, 3, 5]), 0, 2, 0.5);
  rope(S, add(crateC, [0, 0, 9]), add(crateC, [4, -3, 5]), 0, 2, 0.5);
  crate(S, crateC, 0.2, [5, 5, 5], 3, true);
  // the slack below, down to a coil at its foot
  rope(S, add(crateC, [0, 0, -5]), [2, 2, 3], 0, 4, 0.6);
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 4;
    const r = 4 + k * 0.12;
    S.ball([2 + Math.cos(a) * r, 2 + Math.sin(a) * r * 0.8, 1 + k * 0.08], 0.8, ROPE, 5, undefined, 0.1);
  }
  return finish(S, 28, 158);
}

/** THE CULT'S LOOKOUT TENT, for the tops: a ridge tent of the cult's violet cloth on its poles, guyed out, the mark painted on its side, a bedroll at its mouth. */
function lookoutTent(): Sprite {
  const S = new Scene(new Px(110, 80), 55, 58);
  const L = 22;
  const half = 16;
  const ridge = 30;
  // its two sloping sides along x
  for (const sy of [1, -1]) {
    const a: V3 = [-L, 0, ridge];
    const b: V3 = [L, 0, ridge];
    const c: V3 = [L + 2, sy * half, 0];
    const d: V3 = [-L - 2, sy * half, 0];
    S.quad([a, b, c, d], (u, v) => {
      if (Math.abs(fr(u * 4) - 0.5) > 0.46) return CLOTH[sy > 0 ? 1 : 0];
      if (sy > 0 && Math.abs(u - 0.5) < 0.035 && v > 0.25 && v < 0.75) return PAINT;
      if (sy > 0 && Math.abs(v - 0.42) < 0.05 && Math.abs(u - 0.5) < 0.11) return PAINT;
      if (sy > 0 && v > 0.92) return CLOTH[2];
      return CLOTH[sy > 0 ? 3 : 1];
    }, 1 + (sy > 0 ? 0 : 1));
  }
  // its end toward the eye, open: the dark inside, the flaps tied back
  S.quad([[L + 0.5, -half + 1, 0.5], [L + 0.5, half - 1, 0.5], [L + 0.5, 0.5, ridge - 1], [L + 0.5, -0.5, ridge - 1]], (u, v) => (Math.abs(u - 0.5) < 0.42 - v * 0.38 ? '#17121f' : null), 3);
  // poles and guys
  S.rod([L + 1.5, 0, 0], [L + 1.5, 0, ridge + 4], 0.8, 0.7, TIMBER, 4);
  S.rod([-L - 1.5, 0, 0], [-L - 1.5, 0, ridge + 4], 0.8, 0.7, TIMBER, 4);
  rope(S, [L + 1.5, 0, ridge + 3], [L + 14, 0, 0], 0, 5, 0.45);
  rope(S, [-L - 1.5, 0, ridge + 3], [-L - 14, 0, 0], 0, 5, 0.45);
  // a bedroll at its mouth
  S.egg([L + 8, 6, 3], beamAxes([0, 0, 0], [0.2, 1, 0]), [7, 3.4, 3], (n) => toneAt(n, SACKING, 0), 6);
  return finish(S, 55, 58);
}

// =================================================================================================
// THE CANTOR'S: his chant, his bells, his horn, the stones that sing

/** Bronze, the cult's bells: dark, dull, a little green in its hollows (never the friend's cyan). */
export const BRONZE: Ramp = ['#3a2e26', '#584634', '#7a6442', '#9c8656', '#b8a26e'];
/** Parchment, the chant's pages, old and sun-yellowed. */
export const PARCH: Ramp = ['#6e6252', '#958870', '#b8ab90', '#d4c8ac', '#e6dcc4'];
/** The cult's ink: a dull violet-black. */
const INK = '#2e2638';

/**
 * THE CANTOR'S LECTERN: a tall stand of dark carved wood planted in the road, its top slanted toward the singers,
 * the great book of the chant lying open on it, lines of the chant across its pages; the cult's violet hung from
 * its desk, the mark on it in bone-pale. Where he leads the chant down the supply road.
 */
function lectern(): Sprite {
  const S = new Scene(new Px(64, 92), 32, 80);
  // its foot: a cross of timbers; its post
  timber(S, [-9, 0, 1.4], [9, 0, 1.4], 1.4, 1);
  timber(S, [0, -9, 1.4], [0, 9, 1.4], 1.4, 1);
  S.rod([0, 0, 2], [0, 0, 40], 2.4, 2, TIMBER, 2);
  // its desk, slanting down toward the eye (+x +y)
  const deskC: V3 = [0, 0, 44];
  const tilt = norm([0.45, 0.45, 1]);
  const along = norm([1, -1, 0]);
  const down = norm(cross(tilt, along));
  S.box(deskC, [along, down, tilt], [11, 8, 1.2], (f, _u, _v, n) => (f === 4 ? TIMBER[2] : toneAt(n, TIMBER, -0.05)), 3);
  // the book open on it: two pages bowed up a little from the spine, lines of the chant across each
  for (const sg of [1, -1]) {
    const c = add(add(deskC, mul(along, sg * 5)), mul(tilt, 2));
    S.egg(c, [along, down, tilt], [5.2, 6.6, 1.4], (n, w) => {
      const q = sub(w, c);
      const a = dot(q, along);
      const d = dot(q, down);
      if (dot(n, tilt) < 0.5) return PARCH[1]; // the pages' edges
      if (Math.abs(fr(d / 1.7) - 0.5) < 0.18 && Math.abs(a) < 4 && Math.abs(d) < 5.4 && hash(Math.floor(a * 1.2), Math.floor(d / 1.7), sg + 3) > 0.25) return INK;
      return toneAt(n, PARCH, 0.15);
    }, 4 + (sg > 0 ? 0 : 1));
  }
  // the cult's violet hanging from the desk's lower edge toward the eye, the mark on it
  const top = add(deskC, mul(down, 8));
  S.quad([add(top, mul(along, -6)), add(top, mul(along, 6)), add(add(top, mul(along, 5)), [0, 0, -20]), add(add(top, mul(along, -5)), [0, 0, -20])], (u, v) => {
    if (Math.abs(u - 0.5) < 0.06 && v > 0.25 && v < 0.75) return PAINT;
    if (Math.abs(v - 0.4) < 0.05 && Math.abs(u - 0.5) < 0.18) return PAINT;
    if (v > 0.93 && fr(u * 5) < 0.5) return null; // its ragged hem
    return CLOTH[u < 0.15 ? 3 : 2];
  }, 6);
  return finish(S, 32, 80);
}

/** A BELL of the cult's, hanging: its crown, its waist, its flared lip; its mouth dark. */
function bell(S: Scene, top: V3, h: number, id: number): void {
  const n = Math.ceil(h / 1.2);
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const z = top[2] - t * h;
    const r = h * (0.32 + 0.12 * t + 0.28 * Math.pow(t, 4));
    S.egg([top[0], top[1], z], XYZ, [r, r, 1.1], (nn) => (k === n ? '#1c1716' : toneAt(nn, BRONZE, t > 0.85 ? 0.15 : 0)), id);
  }
  S.ball([top[0], top[1], top[2] + 1], h * 0.22, BRONZE, id, undefined, 0.1);
}

/** A FRAME OF THE CULT'S BELLS: two posts and a beam of rough timber, three bronze bells of three sizes hung from it, the cords to ring them hanging. */
function bellFrame(): Sprite {
  const S = new Scene(new Px(96, 104), 48, 90);
  const L: V3 = [1, -1, 0];
  const Ln = norm(L);
  const at = (l: number, z: number): V3 => add(mul(Ln, l), [0, 0, z]);
  timber(S, at(-26, 0), at(-26, 64), 1.8, 1);
  timber(S, at(26, 0), at(26, 64), 1.8, 1);
  timber(S, at(-30, 62), at(30, 62), 1.9, 2, [0.12, 0.88]);
  // the bells, their sizes as the notes of the chant
  const bells: [number, number][] = [[-14, 15], [1, 19], [16, 12]];
  bells.forEach(([l, h], i) => {
    rope(S, at(l, 60), at(l, 56), 0, 3, 0.55);
    bell(S, at(l, 55), h, 4 + i);
    rope(S, at(l, 56 - h), at(l + 1, 56 - h - 14), 0, 7, 0.45);
  });
  return finish(S, 48, 90);
}

/** THE CULT'S GREAT HORN: a long horn of bone and old brass resting on two forked stands, its mouth flared and turned down the canyon, to carry the call from wall to wall. */
function greatHorn(): Sprite {
  const S = new Scene(new Px(160, 84), 72, 62);
  // two forked stands
  for (const x of [-18, 16]) {
    S.rod([x, 0, 0], [x, 0, 18], 1.2, 1, TIMBER, 1);
    S.rod([x, 0, 18], [x - 2, -3, 23], 0.8, 0.6, TIMBER, 1);
    S.rod([x, 0, 18], [x + 2, 3, 23], 0.8, 0.6, TIMBER, 1);
  }
  // the horn along x, curving up at its mouth end, its tube widening
  const pt = (t: number): V3 => [-46 + t * 100, 0, 21 + 12 * Math.pow(t, 3) - 4 * t * (1 - t)];
  const N = 30;
  for (let k = 0; k < N; k++) {
    const t0 = k / N;
    const t1 = (k + 1) / N;
    const r0 = 1.5 + 5.5 * Math.pow(t0, 2.6);
    const r1 = 1.5 + 5.5 * Math.pow(t1, 2.6);
    const band = k % 7 === 3 || k === N - 1;
    S.rod(pt(t0), pt(t1), r0, r1, band ? BRONZE : BONE, band ? 3 : 2);
  }
  // its mouth, open and dark, a rim of brass round it
  const m = pt(1);
  S.egg(add(m, [0.6, 0, 1.2]), beamAxes([0, 0, 0], [0.9, 0, 0.45]), [0.9, 8, 8], (n) => (n[0] > 0.4 ? '#1c1716' : toneAt(n, BRONZE, 0.1)), 4);
  // the mouthpiece
  S.ball(pt(0), 1.6, BRONZE, 5, undefined, 0.1);
  return finish(S, 72, 62);
}

/** SINGING STONES: three standing stones of the red rock, pierced through with round holes where the wind moans, a fourth fallen. */
function singingStones(): Sprite {
  const S = new Scene(new Px(104, 96), 52, 80);
  const stones: [number, number, number, number, number][] = [[-14, -8, 52, 7, 0.3], [8, -14, 64, 8, -0.2], [18, 8, 44, 6.5, 0.6]];
  stones.forEach(([x, y, h, r, turn], i) => {
    const A = beamAxes([0, 0, 0], [Math.cos(turn), Math.sin(turn), 0]);
    const c: V3 = [x, y, h / 2];
    S.box(c, [A[0], A[1], [0, 0, 1]], [r, r * 0.6, h / 2], (f, u, v, n) => {
      // its holes, through it: dark, lit along their lower lip
      for (let k = 0; k < 3; k++) {
        const hv = 0.3 + k * 0.22 + hash(i, k, 999) * 0.06;
        const hu = 0.35 + hash(i, k + 5, 999) * 0.3;
        const d = Math.hypot((u - hu) * r * 2, (v - hv) * h * 0.55);
        if ((f === 0 || f === 2 || f === 1 || f === 3) && d < 2.4) return '#1e1618';
        if ((f === 0 || f === 2) && d < 3.3 && v < hv) return RROCK[4];
      }
      if (f === 4) return RROCK[3];
      if (fr(v * h / 7 + i * 0.3) < 0.12) return toneAt(n, RROCK, -0.4); // its beds
      return toneAt(n, RROCK, -0.05);
    }, 1 + i);
  });
  // the fourth, fallen and broken
  S.box([-6, 18, 4], beamAxes([0, 0, 0], [1, 0.4, 0]), [16, 5, 4], (f, _u, _v, n) => (f === 4 ? RROCK[3] : toneAt(n, RROCK, -0.08)), 4);
  return finish(S, 52, 80);
}

/** THE CHANT CARVED IN THE WALL (on the wall): a panel of the face smoothed flat and cut with the chant's lines, row under row, the grooves dark and lit along their lower lips; the cult's mark at its head. */
function chantInWall(): Sprite {
  const S = new Scene(new Px(80, 130), 40, 120);
  const y0 = -7;
  const at = (x: number, z: number): V3 => [x * 0.75 - 3, y0 - x * 0.75, z];
  S.quad([at(-22, 98), at(22, 98), at(22, 34), at(-22, 34)], (u, v) => {
    const x = (u - 0.5) * 44;
    const z = 98 - v * 64;
    // its border, a groove round it
    if (u < 0.04 || u > 0.96 || v < 0.05 || v > 0.96) return u < 0.02 || u > 0.98 || v < 0.025 || v > 0.985 ? RROCK[1] : RBAND[3];
    // the mark at its head
    if (z > 84) {
      if (Math.abs(x) < 1.2 && z < 95) return RROCK[0];
      if (Math.abs(z - 91) < 1 && Math.abs(x) < 4) return RROCK[0];
      return RBAND[2];
    }
    // the rows of the chant: glyphs cut as short strokes, a groove dark over a lip lit
    const row = (84 - z) / 6;
    const ri = Math.floor(row);
    const rf = row - ri;
    const gi = Math.floor((x + 22) / 3.2);
    const cut = hash(ri, gi, 1001) > 0.3;
    if (cut && rf > 0.2 && rf < 0.55 && fr((x + 22) / 3.2) < 0.65) return RROCK[0];
    if (cut && rf >= 0.55 && rf < 0.7 && fr((x + 22) / 3.2) < 0.65) return RBAND[4];
    return RBAND[2];
  }, 1);
  return finish(S, 40, 120);
}

/** A SEEP IN THE WALL (on the wall): where the old river still runs inside the rock, water weeping from a crack, the face dark and stained under it, maidenhair fern in a fringe, a little pool at its foot. */
function seep(): Sprite {
  const S = new Scene(new Px(72, 118), 36, 100);
  const at = (x: number, z: number): V3 => [x * 0.75 - 3, -6 - x * 0.75, z];
  // the wet stain down the face from the crack: the rock darkened, ragged at its edges, streaked
  S.quad([at(-9, 76), at(9, 76), at(12, 2), at(-12, 2)], (u, v) => {
    const half = 0.18 + 0.3 * v + 0.06 * Math.sin(v * 23 + 1) + 0.04 * Math.sin(v * 51);
    const d = Math.abs(u - 0.5);
    if (d > half) return null;
    if (v < 0.05 && d < 0.12) return '#3a2c28'; // the crack it weeps from
    if (hash(Math.floor(u * 16), Math.floor(v * 40), 1002) > 0.86) return '#9a7262'; // a wet glint, dull
    return d > half - 0.05 ? '#8a604c' : '#7a5444';
  }, 1);
  // the fern: little fronds out of the crack and down the stain
  for (let k = 0; k < 22; k++) {
    const x = (hash(k, 1, 1003) - 0.5) * 16;
    const z = 74 - hash(k, 2, 1003) * 60;
    const c = at(x, z);
    const d: V3 = [3 + hash(k, 3, 1003) * 3, 3 + hash(k, 4, 1003) * 3, -2 - hash(k, 5, 1003) * 3];
    S.rod(c, add(c, d), 1.1, 0.4, JUNIPER, 2 + (k % 2));
  }
  // its pool at the foot, dark and still
  S.egg([5, 3, 0.2], XYZ, [12, 9, 0.4], (_n, w) => (Math.hypot((w[0] - 5) / 12, (w[1] - 3) / 9) > 0.78 ? '#6a5a52' : '#3e4450'), 4);
  return finish(S, 36, 100);
}

/** A TORN PAGE OF THE CHANT (a quest piece: the ritual's pages, hidden through the descent): a leaf of the chant torn from its book, weighed down on the sand by a stone, the cult's lines on it. */
function chantPage(): Sprite {
  const S = new Scene(new Px(44, 30), 22, 20);
  S.quad([[-9, -6, 0.6], [8, -8, 0.6], [10, 7, 0.6], [-8, 8, 0.6]], (u, v) => {
    if ((u > 0.9 && hash(Math.floor(v * 14), 1, 1004) > 0.45) || (v > 0.92 && hash(Math.floor(u * 14), 2, 1004) > 0.5)) return null; // its torn edges
    if (fr(v * 7) < 0.22 && u > 0.12 && u < 0.85 && hash(Math.floor(u * 9), Math.floor(v * 7), 1005) > 0.2) return INK;
    return v < 0.06 || u < 0.04 ? PARCH[2] : PARCH[3];
  }, 1);
  S.egg([7, -6, 2], beamAxes([0, 0, 0], [1, 0.4, 0]), [3.6, 2.8, 2], facetOf(RROCK, 0), 2);
  return finish(S, 22, 20);
}

/**
 * AN OBELISK ON ITS DRAY: one of the quarry's great obelisks, roped down along a long low dray of timber on four
 * small solid wheels, bound for the swamp (the siege's thread: the obelisks hauled downhill); the cult's mark cut in
 * its top, its point toward the canyon's mouth.
 */
function obeliskDray(): Sprite {
  const S = new Scene(new Px(180, 112), 90, 70);
  // the dray
  S.box([0, 0, 6], XYZ, [46, 12, 2], (f, u, v, n) => (f === 4 && Math.abs(fr(v * 5) - 0.5) < 0.08 ? TIMBER[1] : toneAt(n, TIMBER, 0)), 1);
  for (const [x, y] of [[-34, 13], [34, 13], [-34, -13], [34, -13]]) {
    S.egg([x, y, 4], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [1.4, 4, 4], (n) => (Math.abs(n[1]) > 0.6 ? toneAt(n, TIMBER, 0.1) : toneAt(n, TIMBER, -0.1)), 2);
    S.ball([x, y + Math.sign(y) * 1.5, 4], 1, IRON, 3, undefined, 0.1);
  }
  timber(S, [46, 0, 6], [66, 0, 2], 1.3, 4);
  // the obelisk lying along it: tapering, its point toward +x
  const X0 = -44;
  const X1 = 34;
  const top: [V3, V3, V3, V3] = [[X0, -11, 30], [X1, -7, 23], [X1, 7, 23], [X0, 11, 30]];
  const side: [V3, V3, V3, V3] = [[X0, 11, 8], [X1, 7, 8], [X1, 7, 23], [X0, 11, 30]];
  const nTop = seenNormal(top);
  const nSide = seenNormal(side);
  S.quad(top, (u, v) => {
    const a = u * (X1 - X0);
    const b = (v - 0.5) * 20;
    // the mark, cut near its foot end
    if (Math.abs(a - 14) < 1.2 && Math.abs(b) < 6) return '#4a4250';
    if (Math.abs(b) < 1.2 && Math.abs(a - 14) < 4) return '#4a4250';
    return toneAt(nTop, FRESH, 0.05);
  }, 5);
  S.quad(side, (u, v) => (v > 0.94 ? FRESH[3] : fr(u * 18) < 0.06 && v > 0.3 ? FRESH[1] : toneAt(nSide, FRESH, 0)), 6);
  // its point
  S.quad([[X1, -7, 23], [X1 + 14, 0, 15], [X1, 7, 23], [X1, 0, 24]], () => FRESH[3], 7);
  S.quad([[X1, 7, 8], [X1 + 14, 0, 15], [X1, 7, 23], [X1, 7, 15]], () => toneAt(nSide, FRESH, -0.1), 7);
  // the ropes over it, lashed to the dray
  for (const x of [-30, -6, 20]) {
    const w = 11 - ((x - X0) / (X1 - X0)) * 4;
    const h = 30 - ((x - X0) / (X1 - X0)) * 7;
    rope(S, [x, -13, 7], [x, -w, h + 0.6], 0, 8, 0.6);
    rope(S, [x, -w, h + 0.6], [x, w, h + 0.6], 0, 8, 0.6);
    rope(S, [x, w, h + 0.6], [x, 13, 7], 0, 8, 0.6);
  }
  return finish(S, 90, 70);
}

/**
 * ROCKFALL FROM THE RIM (the trap, a floor tile; the Cantor's voice shakes the rim loose): 0, grit and pebbles
 * fallen on the sand, the sign; 1, its warning: a shadow on the sand where the rock will land, grit trickling into
 * it; 2, the rock come down: broken blocks of the red rock in a burst of dust; 3, the rubble left.
 */
function rockfallTile(f: number): Sprite {
  const p = new Px(64, 34);
  const SH = SAND;
  for (let py = 0; py < 34; py++) {
    for (let px = 0; px < 64; px++) {
      const uv = tileUV(px, py);
      if (!uv) continue;
      const [u, v] = uv;
      const du = (u - 32) / 32;
      const dv = (v - 32) / 32;
      const d = Math.hypot(du, dv);
      const n = hash(px >> 1, py >> 1, 1006 + f);
      const g2 = hash(px >> 1, py, 1016 + f);
      if (f === 1 && d < 0.62 + 0.06 * Math.sin(Math.atan2(dv, du) * 5)) p.set(px, py, d > 0.5 ? SH[1] : SH[0]); // the shadow of what will fall
      if (f === 2 && d < 0.95 && n > 0.62) p.set(px, py, d < 0.5 ? SH[5] : SH[4]); // the dust's burst
      if ((f === 0 || f === 1) && g2 > 0.9 && d < 0.85) p.set(px, py, RROCK[2]); // the grit, two pixels a grain
      // the blocks, come down (and lying, in 3)
      if (f >= 2) {
        const blocks: [number, number, number][] = [[0, 0, 0.28], [0.3, -0.25, 0.18], [-0.3, 0.22, 0.2], [0.18, 0.36, 0.14], [-0.34, -0.2, 0.13]];
        for (const [bu, bv, r] of blocks) {
          const q = Math.max(Math.abs(du - bu), Math.abs(dv - bv) * 0.9);
          if (q < r) {
            const lit = du - bu < 0 || dv - bv < 0;
            p.set(px, py, q > r - 0.06 ? RROCK[1] : lit ? RROCK[3] : RROCK[2]);
          }
        }
      }
      if (f === 3 && g2 > 0.84 && d < 0.95 && d > 0.4) p.set(px, py, RROCK[1]);
    }
  }
  return p.sprite(32, 0, GRAIN);
}

/**
 * THE WAYSTATION'S GATE (the canyon's cult stronghold, a walled waystation on the supply road): a gate of
 * lashed logs between two great posts, the cult's violet on the left post, a skull of the canyon's cattle over it;
 * along x or along y, shut or dragged open.
 */
function waystationGate(alongY: boolean, open: boolean): Sprite {
  const S = new Scene(new Px(140, 128), 70, 98);
  const L: V3 = alongY ? [0, 1, 0] : [1, 0, 0];
  const at = (l: number, z: number, o = 0): V3 => add(add(mul(L, l), mul(alongY ? [1, 0, 0] : [0, 1, 0], o)), [0, 0, z]);
  // the posts and the lintel
  S.rod(at(-30, 0), at(-30, 78), 3.4, 3, TIMBER, 1);
  S.rod(at(30, 0), at(30, 78), 3.4, 3, TIMBER, 1);
  timber(S, at(-36, 74), at(36, 74), 2.2, 2);
  // the gate: two leaves of logs side by side, bound across with timber
  const leaf = (from: number, to: number, swing: number, id: number): void => {
    for (let l = from; l * Math.sign(to - from) < to * Math.sign(to - from); l += Math.sign(to - from) * 4.6) {
      const k = (l - from) / (to - from);
      const base = add(at(from, 0), add(mul(L, (l - from) * Math.cos(swing)), mul(alongY ? [1, 0, 0] : [0, 1, 0], (l - from) * Math.sin(swing))));
      const h = 56 + 4 * Math.sin(k * 7 + id);
      S.rod(base, add(base, [0, 0, h]), 2.1, 1.6, TIMBER, id);
      S.ball(add(base, [0, 0, h]), 1.7, TIMBER, id, undefined, -0.1);
    }
  };
  if (!open) {
    leaf(-27, 0, 0, 3);
    leaf(27, 0.5, 0, 4);
    timber(S, at(-27, 16, 2.4), at(27, 16, 2.4), 1.2, 5);
    timber(S, at(-27, 44, 2.4), at(27, 44, 2.4), 1.2, 5);
  } else {
    leaf(-27, -4, 1.25, 3);
    leaf(27, 4, -1.25, 4);
  }
  // the cult's violet hung on the left post, the mark on it
  S.quad([at(-27, 70, 3.5), at(-19, 70, 3.5), at(-19, 40, 3.5), at(-27, 40, 3.5)], (u, v) => {
    if (Math.abs(u - 0.5) < 0.09 && v > 0.25 && v < 0.75) return PAINT;
    if (Math.abs(v - 0.4) < 0.06 && Math.abs(u - 0.5) < 0.24) return PAINT;
    if (v > 0.94 && fr(u * 3) < 0.5) return null;
    return CLOTH[2];
  }, 6);
  // a steer's skull over the gate
  const sc = at(0, 82, 2);
  S.egg(sc, XYZ, [4, 3.4, 3.6], (n, w) => (Math.abs(w[2] - sc[2] + 0.2) < 1 && n[0] + n[1] > 0.5 && Math.abs((alongY ? w[1] : w[0]) - (alongY ? sc[1] : sc[0])) > 1.4 ? '#2a2420' : toneAt(n, BONE, 0.05)), 7);
  for (const sg of [1, -1]) S.rod(add(sc, mul(L, sg * 3)), add(add(sc, mul(L, sg * 14)), [0, 0, 5]), 1.3, 0.5, BONE, 8);
  return finish(S, 70, 98);
}

/** DRIFTWOOD from the old river: a bleached log the last flood left in the bed, its root ball dragged after it, a branch stub. */
function driftwood(): Sprite {
  const S = new Scene(new Px(104, 50), 52, 34);
  const a: V3 = [-30, 6, 3.4];
  const b: V3 = [26, -8, 2.6];
  S.rod(a, b, 3.6, 2.6, DRIFT, 1);
  // the root ball at its foot end: roots splayed every way
  for (let k = 0; k < 9; k++) {
    const t = (k / 9) * Math.PI * 2;
    const d: V3 = [Math.cos(t) * 2 - 6, Math.sin(t) * 9, Math.cos(t * 1.7) * 6 + 5];
    S.rod(a, add(a, d), 1.6, 0.5, DRIFT, 2);
  }
  S.rod(add(a, mul(sub(b, a), 0.55)), add(add(a, mul(sub(b, a), 0.55)), [4, 8, 7]), 1.4, 0.6, DRIFT, 3);
  return finish(S, 52, 34);
}

// =================================================================================================
// THE LIST

let made: Piece[] | null = null;
/** ECHO CANYON'S 25 PIECES, by name, made once. */
export function canyonPieces(): Piece[] {
  if (made) return made;
  made = [
    // the canyon's own
    { name: 'hoodoo', kind: 'obstacle', frames: [hoodoo(0, 1), hoodoo(1, 2), hoodoo(2, 3)], shadow: 0.55 },
    { name: 'red boulder', kind: 'obstacle', frames: [redBoulder(0, 1), redBoulder(1, 2), redBoulder(2, 3)], shadow: 0.42 },
    { name: 'juniper', kind: 'obstacle', frames: [juniper(0, 1), juniper(1, 2), juniper(2, 3)], shadow: 0.45 },
    { name: 'dead juniper', kind: 'obstacle', frames: [deadJuniper()], shadow: 0.4 },
    { name: 'yucca', kind: 'obstacle', frames: [yucca(false, 1), yucca(true, 2)], shadow: 0.25 },
    { name: 'sagebrush', kind: 'on the floor', frames: [sagebrush(0, 1), sagebrush(1, 2)], shadow: 0.25 },
    { name: 'a steer\'s skull', kind: 'on the floor', frames: [steerSkull()] },
    // the cult's supply road
    { name: "the cult's wagon", kind: 'obstacle', frames: [wagon(false)], shadow: 1.0 },
    { name: "the cult's wagon, broken down", kind: 'obstacle', frames: [wagon(true)], shadow: 1.0 },
    { name: 'crate of stores', kind: 'breakable', frames: [storesCrate(false), storesCrate(true)], shadow: 0.25 },
    { name: 'sacks of meal', kind: 'breakable', frames: [mealSack(false), mealSack(true)], shadow: 0.22 },
    { name: 'wheel ruts', kind: 'floor tile', frames: [rutsTile(false), rutsTile(true)] },
    { name: "the cult's hoist", kind: 'on the wall', frames: [hoist()], shadow: 0.15 },
    { name: "the cult's lookout tent", kind: 'obstacle', frames: [lookoutTent()], shadow: 0.9 },
    // the Cantor's
    { name: "the Cantor's lectern", kind: 'obstacle', frames: [lectern()], shadow: 0.3 },
    { name: "a frame of the cult's bells", kind: 'obstacle', frames: [bellFrame()], shadow: 0.5 },
    { name: "the cult's great horn", kind: 'obstacle', frames: [greatHorn()], shadow: 0.6 },
    { name: 'singing stones', kind: 'obstacle', frames: [singingStones()], shadow: 0.7 },
    { name: 'the chant carved in the wall', kind: 'on the wall', frames: [chantInWall()] },
    { name: 'a torn page of the chant', kind: 'quest', frames: [chantPage()] },
    // the road's and the canyon's, the rest
    { name: 'an obelisk on its dray', kind: 'obstacle', frames: [obeliskDray()], shadow: 1.1 },
    { name: 'rockfall from the rim', kind: 'trap', frames: [0, 1, 2, 3].map(rockfallTile) },
    { name: "the waystation's gate", kind: 'gate', frames: [waystationGate(false, false), waystationGate(false, true), waystationGate(true, false), waystationGate(true, true)], shadow: 0.9 },
    { name: 'a seep in the wall', kind: 'on the wall', frames: [seep()] },
    { name: 'driftwood', kind: 'on the floor', frames: [driftwood()], shadow: 0.4 },
  ];
  return made;
}
