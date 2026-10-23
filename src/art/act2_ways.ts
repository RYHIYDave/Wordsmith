// FLOORS 11 TO 15, THEIR WAYS ON, WHERE EACH NEXT FLOOR BEGINS, AND THE CAMP'S WAY OUT (the art chat's, 22 Oct 2026). A
// MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE; it is behind A2_WAYS, off.
//
// His words to the main chat, 22 Oct 2026, 11:21 (Pacific): “Then have exits that lead to the next zone in a natural way
// as opposed to just a waypoint being plopped down.” Told in the art chat what each floor's way on would be, asked
// “Paint these ways on for floors 6 to 15? I'd show you floors 6 to 10 first, then 11 to 15.”, by 14:16: “Yes, paint them
// (Recommended)”.
//
// As floors 6 to 10's (art/act1_ways.ts, the kit art/ways_kit.ts): each at the far end of the boss's ground, leading on
// the way from where the boss stood toward it, in its floor's own look, at night in the city.

import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { XYZ, facetOf, toneAt } from './floor4';
import type { V3 } from './floor4';
import { add, cross, fr, mul, norm, sub } from './floor6';
import { GRAIN, compose, hash, mix } from './kit';
import type { Ramp } from './kit';
import { BLACK, BRICK, DEAL, IRON, OAK, PAPER, STONE } from './act2_kit';
import { Rig, chip, cloud, paintChips, paintDust, rodIn, stepChips } from './ways_kit';
import type { Chip, Cloud, StartArt, WayArt, WayDir, WayFilm } from './ways_kit';

/** THE SWITCH: off, nothing of the game uses any of this. */
export const A2_WAYS = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (t: number): number => {
  const k = clamp01(t);
  return k * k * (3 - 2 * k);
};
/** The dark down a hole, at night in the city. */
const DARK = '#0c0a10';
/** The Order's seal: its ink, and its rune burning the enemy's pink. */
const INK: Ramp = ['#060509', '#0c0a10', '#14111a', '#1e1a26', '#2a2434'];
const SEAL_PINK: Ramp = ['#3a0c2a', '#7a1058', '#c0206a', '#ff4f8a', '#ffc0d6'];

function whole(under: Px | null, over: Px | null, ax: number, ay: number, w: number, h: number): Sprite {
  const layers = [under, over].filter((p): p is Px => !!p);
  if (!layers.length) return new Px(w, h).sprite(ax, ay, GRAIN);
  return compose(null, layers).sprite(ax, ay, GRAIN);
}

// =================================================================================================
// FLOOR 11, THE GATE WARD: THE GRATE. In the Crier's square, the great round grate of the city's sewer, iron bars in a ring
// of dressed stone, a shaft of brick going down under it, an iron ladder down its side. SHUT: sealed with the Silent
// Order's ink, poured black over the bars and the ring, its mark written across it, a rune at its heart burning the
// enemy's pink. AS THE CRIER DIES: the rune flares, the ink seethes and cracks; the seal bursts, ink flung out over the
// flags in black splashes; the grate is thrown up, tips and drops into the shaft with a clang, and is gone down it.

export const GATE_GRATE = { r: 38, ring: 10, deep: 140 };
export const GRATE_FILM = { frames: 104, flare: 6, burst: 34, fps: 30 } as const;
const GW = 600;
const GH = 480;
const GAX = 300;
const GAY = 260;
const GZ0 = 150;
const FLAG: Ramp = ['#2f2936', '#433c48', '#554c55', '#62585e', '#7a6d6b'];

/** The shaft under the grate: its brick, round, going down into the dark; its ladder on its far side. */
function grateShaft(d: WayDir): Rig {
  const G = GATE_GRATE;
  const R = new Rig(GW, GH, GAX, GAY, d, GZ0);
  const N = 36;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const p = (a: number, z: number): number[] => [Math.cos(a) * (G.r - 1), Math.sin(a) * (G.r - 1), z];
    R.quad([p(a0, 0), p(a1, 0), p(a1, -G.deep), p(a0, -G.deep)], (u, v) => {
      const z = -v * G.deep;
      const course = Math.floor(-z / 5);
      const joint = fr(-z / 5) < 0.2 || fr(u * 2 + (course % 2) * 0.5) < 0.1;
      const c = joint ? BRICK[0] : hash(i, course, 1501) < 0.3 ? BRICK[2] : BRICK[1];
      return mix(c, DARK, Math.min(0.97, 1 - Math.exp(z / 26)));
    }, 10 + (i % 2));
  }
  // the ladder down its far side: two iron rails and their rungs
  for (const s of [-1, 1]) R.rod([G.r - 4, s * 6, 2], [G.r - 4, s * 6, -G.deep + 20], 1.2, 1.2, IRON, 20);
  for (let k = 0; k < 14; k++) R.rod([G.r - 4, -6, -4 - k * 8], [G.r - 4, 6, -4 - k * 8], 0.9, 0.9, IRON, 21);
  // (darkened down the shaft)
  const p = R.S.p;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = y * p.w + x;
      if (R.S.id[i] < 20 || R.S.id[i] > 21) continue;
      const z = R.S.hz[i] - GZ0;
      const c = p.get(x, y);
      if (c) p.set(x, y, mix(c, DARK, Math.min(0.95, 1 - Math.exp(z / 34))));
    }
  }
  return R;
}
const grateOpen = (a: number, b: number): boolean => Math.hypot(a, b) < GATE_GRATE.r - 1;

/** The ring of dressed stone round it, flush with the square's flags, worn. */
function grateRing(R: Rig): void {
  const G = GATE_GRATE;
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    const p = (a: number, r: number): number[] => [Math.cos(a) * r, Math.sin(a) * r, 0.8];
    R.quad([p(a0, G.r - 1), p(a1, G.r - 1), p(a1, G.r + G.ring), p(a0, G.r + G.ring)], (u, v) => {
      if (u < 0.06) return FLAG[1];
      return v < 0.2 ? FLAG[4] : hash(i, Math.floor(v * 4), 1502) < 0.2 ? FLAG[2] : FLAG[3];
    }, 30 + (i % 3));
  }
}
/** The grate: iron bars across a rim, at `c` (its middle), tipped `tilt` about an axis across the way, turned `spin`. */
function paintGrate(R: Rig, c: V3, tilt: number, spin: number, inked: number, f: number): void {
  const G = GATE_GRATE;
  const ax: V3 = [Math.cos(spin), Math.sin(spin), 0];
  const up: V3 = norm([Math.sin(tilt) * -ax[1], Math.sin(tilt) * ax[0], Math.cos(tilt)]);
  const across: V3 = norm(cross(up, ax));
  const at = (u: number, v: number, h = 0): V3 => add(c, add(add(mul(ax, u), mul(across, v)), mul(up, h)));
  // its rim
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    rodIn(R.S, R.P(...at(Math.cos(a0) * (G.r + 1), Math.sin(a0) * (G.r + 1))), R.P(...at(Math.cos(a1) * (G.r + 1), Math.sin(a1) * (G.r + 1))), 2.2, 2.2, IRON, 40);
  }
  // its bars, across it both ways
  for (let k = -3; k <= 3; k++) {
    const t = k * 8;
    const L = Math.sqrt(Math.max(0, (G.r + 1) ** 2 - t * t));
    rodIn(R.S, R.P(...at(t, -L, 0.4)), R.P(...at(t, L, 0.4)), 1.5, 1.5, IRON, 41);
    rodIn(R.S, R.P(...at(-L, t, 1.2)), R.P(...at(L, t, 1.2)), 1.3, 1.3, IRON, 42);
  }
  // the ink over it: poured black across the bars, its mark, its rune
  if (inked > 0) {
    R.egg(at(0, 0, 1.4), [ax, across, up], [G.r + 6, G.r + 6, 2.2], (n, w) => {
      const q = R.un(w[0] - R.P(...c)[0], w[1] - R.P(...c)[1]);
      const r = Math.hypot(q[0], q[1]);
      // (cracking as it seethes)
      if (inked < 1 && hash(Math.floor(q[0] / 3), Math.floor(q[1] / 3), 1503) > inked) return null;
      if (r > G.r + 2 && hash(Math.floor(q[0] / 2), Math.floor(q[1] / 2), 1504) < 0.5) return null;
      return toneAt(n, INK, 0.15);
    }, 43);
  }
  void f;
}
/** The Order's mark written over the seal, and its rune, burning (`burn` 0 out, 1, more as it flares). */
function paintSeal(R: Rig, burn: number, f: number): void {
  const z = 4.2;
  // the bar of the Order's mark, written across it, and the ring round the rune
  R.quad([[-34, -4, z], [34, -4, z], [34, 4, z], [-34, 4, z]], (u) => (fr(u * 9) < 0.05 ? INK[3] : INK[1]), 50);
  const k = Math.min(1, burn);
  const flick = 0.85 + 0.15 * Math.sin(f * 1.7);
  const hot = burn > 1 ? SEAL_PINK[4] : SEAL_PINK[3];
  const big = 12 + (burn > 1 ? (burn - 1) * 6 : 0);
  R.egg([0, 0, z + 0.6], XYZ, [big, big, 0.8], (n, w) => {
    const q = R.un(w[0] - R.P(0, 0, 0)[0], w[1] - R.P(0, 0, 0)[1]);
    const r = Math.hypot(q[0], q[1]);
    const ring = Math.abs(r - big * 0.8) < 1.4 || Math.abs(r - big * 0.45) < 1;
    const mark = (Math.abs(q[0]) < 1.2 && Math.abs(q[1]) < big * 0.7) || (Math.abs(q[1]) < 1.2 && Math.abs(q[0]) < big * 0.35);
    if (!(ring || mark)) return null;
    return k * flick > 0.6 ? hot : SEAL_PINK[2];
  }, 51);
}

const grateCache = new Map<WayDir, WayArt>();
/** FLOOR 11'S WAY ON, THE GRATE: shut, its film, open; leading `d`. */
export function gateWardWay(d: WayDir): WayArt {
  const had = grateCache.get(d);
  if (had) return had;
  const F = GRATE_FILM;
  const G = GATE_GRATE;
  const shaft = grateShaft(d);
  const splash: Chip[] = [];
  const dust: Cloud[] = [];
  const pools: { a: number; b: number; r: number }[] = [];
  /** Where the grate is on frame `f` after the burst: thrown up, tipping, dropping in down the shaft. */
  const grateAt = (k: number): { c: V3; tilt: number } | null => {
    if (k < 0) return { c: [0, 0, 1], tilt: 0 };
    const up = 9 * k - 0.5 * 1.0 * k * k;
    const z = up + 1;
    const tilt = Math.min(Math.PI * 0.45, k * 0.09);
    const slide = Math.min(G.r * 0.3, k * 0.6);
    if (z < -G.deep * 0.8) return null;
    return { c: [slide, 0, z], tilt };
  };
  const paintFrame = (f: number): { under: Px; over: Px } => {
    const U = shaft.copy();
    const R = new Rig(GW, GH, GAX, GAY, d, 0);
    grateRing(R);
    // the ink splashed out over the flags
    pools.forEach((p, i) => R.egg([p.a, p.b, 0.5], XYZ, [p.r, p.r * 0.8, 0.4], (n, w) => (hash(Math.floor(w[0]), Math.floor(w[1]), 1505 + i) < 0.15 ? null : INK[2]), 60 + i));
    const k = f - F.burst;
    const g = f < 0 ? { c: [0, 0, 1] as V3, tilt: 0 } : grateAt(k);
    const inked = f < 0 || f < F.burst - 12 ? 1 : f < F.burst ? 1 - (f - (F.burst - 12)) / 16 : 0;
    if (g) {
      paintGrate(U, g.c, g.tilt, 0.2, inked, f);
      paintGrate(R, g.c, g.tilt, 0.2, inked, f);
    }
    if (f < F.burst) {
      const burn = f < F.flare ? 1 : 1 + ((f - F.flare) / (F.burst - F.flare)) * 1.2;
      paintSeal(R, burn, f);
    }
    U.under(grateOpen);
    U.S.seams();
    paintChips(R, splash, f, INK, 600);
    R.S.seams();
    paintDust(R, dust, f, ['#1a1622', '#24202e', '#2e2a3a', '#3a3446', '#463f52'], ['#1a1622', '#24202e', '#2e2a3a', '#3a3446', '#463f52'], (1 << 20) + 10);
    return { under: U.S.p, over: R.S.p };
  };
  const shutPx = paintFrame(-1);
  const frames: Sprite[] = [];
  const kicks: { f: number; k: number }[] = [{ f: F.burst, k: 7 }];
  let clanged = false;
  for (let f = 0; f < F.frames; f++) {
    if (f === F.burst) {
      // THE SEAL BURSTS: ink flung out over the flags, a pall of it
      for (let i = 0; i < 40; i++) {
        const ang = hash(i, 1, 1506) * Math.PI * 2;
        const sp = 2 + hash(i, 2, 1506) * 4.5;
        splash.push(chip(f, [Math.cos(ang) * 12, Math.sin(ang) * 12, 4], [Math.cos(ang) * sp, Math.sin(ang) * sp, 3 + hash(i, 3, 1506) * 5], 1 + hash(i, 4, 1506) * 1.6, 1600 + i));
      }
      for (let i = 0; i < 9; i++) {
        const ang = (i / 9) * Math.PI * 2 + hash(i, 5, 1506);
        const r = G.r + G.ring + 8 + hash(i, 6, 1506) * 30;
        pools.push({ a: Math.cos(ang) * r, b: Math.sin(ang) * r, r: 4 + hash(i, 7, 1506) * 6 });
      }
      for (let i = 0; i < 5; i++) dust.push(cloud(f, [(hash(i, 8, 1506) - 0.5) * 30, (hash(i, 9, 1506) - 0.5) * 30, 10], [(hash(i, 10, 1506) - 0.5) * 3, (hash(i, 11, 1506) - 0.5) * 3, 1.8], 16 + 6 * hash(i, 12, 1506), 1610 + i, 44, 10, 12));
    }
    const g = grateAt(f - F.burst);
    if (!clanged && f > F.burst && g && g.c[2] < -10) {
      clanged = true;
      kicks.push({ f, k: 4 });
    }
    stepChips(splash, f, (a, b) => (grateOpen(a, b) ? -300 : 0));
    const p = paintFrame(f);
    frames.push(whole(p.under, p.over, GAX, GAY, GW, GH));
  }
  const film: WayFilm = { frames, fps: F.fps, jolts: kicks.map((k) => k.f), kicks: kicks.map((k) => k.k) };
  const openPx = paintFrame(F.frames + 300);
  const art: WayArt = {
    shut: { under: whole(shutPx.under, null, GAX, GAY, GW, GH), over: whole(null, shutPx.over, GAX, GAY, GW, GH) },
    film,
    open: { under: whole(openPx.under, null, GAX, GAY, GW, GH), over: whole(null, openPx.over, GAX, GAY, GW, GH) },
  };
  grateCache.set(d, art);
  void smooth;
  void sub;
  void facetOf;
  void DEAL;
  void OAK;
  void PAPER;
  void STONE;
  void BLACK;
  return art;
}

// =================================================================================================
// A STRETCH OF WALL WITH A WAY THROUGH IT (floors 12 to 15): a slab of the floor's own wall across the way at its far end,
// its face toward the floor, an opening in it (round-headed: `ow` either side of the middle, `oh` high to the top of its
// arch), what lies beyond seen through it (dark, or light), the jambs and the arch's soffit inside its thickness.

interface Stretch {
  /** Its face toward the floor at a = a0; how thick; how far either side; how high (and its top along it: `top(b)`). */
  a0: number;
  thick: number;
  half: number;
  high: number;
  top?: (b: number) => number;
  ow: number;
  oh: number;
  /** A flat head to the opening in place of a round one. */
  flat?: boolean;
  /** A face's colour: where on it (b across, z up), which face (0 its face to the floor, 1 its back, 2 an end, 3 its top, 4 inside the opening), lit as `n`. */
  face: (b: number, z: number, which: number, n: V3) => string;
  /** What is seen through the opening, far in: its colour at depth `k` 0..1 in and height z. */
  beyond: (k: number, z: number, b: number) => string;
}
/** Whether (b, z) is in a round-headed opening `ow` either side and `oh` to its crown. */
const inArch = (b: number, z: number, ow: number, oh: number, flat = false): boolean => z >= 0 && Math.abs(b) < ow && (flat ? z < oh : z < oh - ow || Math.hypot(b, z - (oh - ow)) < ow);

function paintStretch(R: Rig, W: Stretch, id: number): void {
  const { a0, thick, half, high, ow, oh } = W;
  const a1 = a0 + thick;
  const top = W.top ?? (() => high);
  const n0: V3 = R.V([-1, 0, 0]);
  const n1: V3 = R.V([1, 0, 0]);
  // its face toward the floor, and its back
  for (const [a, which, n] of [[a0, 0, n0], [a1, 1, n1]] as const) {
    R.quad([[a, -half, 0], [a, half, 0], [a, half, high + 30], [a, -half, high + 30]], (u, v) => {
      const b = -half + u * 2 * half;
      const z = v * (high + 30);
      if (z > top(b) || inArch(b, z, ow, oh, W.flat)) return null;
      return W.face(b, z, which, n);
    }, id + which);
  }
  // its ends
  for (const s of [-1, 1]) {
    const nn: V3 = R.V([0, s, 0]);
    R.quad([[a0, s * half, 0], [a1, s * half, 0], [a1, s * half, high + 30], [a0, s * half, high + 30]], (u, v) => {
      const z = v * (high + 30);
      if (z > top(s * half)) return null;
      return W.face(s * half, z, 2, nn);
    }, id + 2);
  }
  // its top, in strips along it, each at its own height (crenels, a broken end)
  const step = 4;
  const nt: V3 = [0, 0, 1];
  for (let b = -half; b < half; b += step) {
    const z = top(b + step / 2);
    R.quad([[a0, b, z], [a1, b, z], [a1, b + step, z], [a0, b + step, z]], () => W.face(b + step / 2, z, 3, nt), id + 3);
    // the step down to the next strip, where it is lower
    const zn = top(b + step * 1.5);
    if (b + step < half && Math.abs(zn - z) > 0.5) {
      const zl = Math.min(z, zn);
      const zh = Math.max(z, zn);
      const nn: V3 = R.V([0, zn < z ? 1 : -1, 0]);
      R.quad([[a0, b + step, zl], [a1, b + step, zl], [a1, b + step, zh], [a0, b + step, zh]], (_u, v) => W.face(b + step, zl + v * (zh - zl), 2, nn), id + 2);
    }
  }
  // the opening's jambs and soffit, inside the wall's thickness, in shade
  const N = 18;
  const rim: [number, number][] = [];
  rim.push([-ow, 0]);
  if (W.flat) rim.push([-ow, oh], [ow, oh]);
  else {
    for (let i = 0; i <= N; i++) {
      const t = Math.PI - (i / N) * Math.PI;
      rim.push([Math.cos(t) * ow, oh - ow + Math.sin(t) * ow]);
    }
  }
  rim.push([ow, 0]);
  for (let i = 0; i + 1 < rim.length; i++) {
    const [b0, z0] = rim[i];
    const [b1, z1] = rim[i + 1];
    const nn: V3 = norm(R.V([0, -(z1 - z0), b1 - b0]));
    R.quad([[a0, b0, z0], [a1, b0, z0], [a1, b1, z1], [a0, b1, z1]], (u) => W.face((b0 + b1) / 2, (z0 + z1) / 2, 4, mul(nn, -1) as V3) && mix(W.face((b0 + b1) / 2, (z0 + z1) / 2, 4, mul(nn, -1) as V3), DARK, 0.35 + u * 0.3), id + 4);
  }
  // beyond it: a floor going on into it, and a dark (or a light) far in
  const far = a1 + 12;
  R.quad([[a0, -ow, 0.2], [far, -ow, 0.2], [far, ow, 0.2], [a0, ow, 0.2]], (u, v) => W.beyond(u, 0, -ow + v * 2 * ow), id + 5);
  R.quad([[far, -ow - 2, 0], [far, ow + 2, 0], [far, ow + 2, oh + 2], [far, -ow - 2, oh + 2]], (u, v) => W.beyond(1, v * (oh + 2), -ow - 2 + u * (2 * ow + 4)), id + 6);
  for (const s of [-1, 1]) R.quad([[a1, s * ow, 0], [far, s * ow, 0], [far, s * ow, oh], [a1, s * ow, oh]], (u, v) => W.beyond(0.4 + u * 0.6, v * oh, s * ow), id + 7);
}

/** A DOOR'S LEAF of planks, hinged at (a, s*hw) turning `open` (0 shut across the opening, 1 swung in against the jamb), `hw` either side, `h` high; shaded `shade(u, v, n)`. */
function doorLeaf(R: Rig, a: number, hinge: number, w: number, h: number, open: number, inward: boolean, shade: (u: number, v: number, n: V3) => string | null, id: number): void {
  const ang = open * Math.PI * 0.5 * 0.92;
  const s = Math.sign(hinge) || 1;
  const dir: V3 = [inward ? Math.sin(ang) : -Math.sin(ang), -s * Math.cos(ang), 0];
  const p0 = [a, hinge, 0];
  const p1 = [a + dir[0] * w, hinge + dir[1] * w, 0];
  const n = norm(R.V(cross(dir, [0, 0, 1]) as V3));
  R.quad([p0, p1, [p1[0], p1[1], h], [p0[0], p0[1], h]], (u, v) => shade(u, v, n), id);
}

// =================================================================================================
// FLOOR 12, THE UNDERCITY: THE OUTFALL. In the brick at the far end of the King's cistern, the arch of the great outfall
// where the sewer runs out to the river: the channel's green water running into it under an iron grille. SHUT: the
// grille choked with the Rat King's nest, rags, straw, broken jars of the bottled voices, corks and bones heaped up
// against it. AS THE RAT KING DIES: the nest seethes; his rats pour out of it in a flood across the floor and away into
// the dark; the grille, rusted through at its hinge, is shoved and swings open with a clang; the water gushes out.

export const OUTFALL = { a0: 26, thick: 22, half: 74, high: 112, ow: 30, oh: 64 };
export const OUTFALL_FILM = { frames: 116, seethe: 4, pour: 26, swing: 52, fps: 30 } as const;
const OW = 680;
const OH = 520;
const OAX = 340;
const OAY = 330;
const UBRICK = [
  ['#9c6550', '#83523f', '#704535', '#3a3040'],
  ['#7a4f40', '#674336', '#57392f', '#2c2634'],
  ['#4f3833', '#41302e', '#37282a', '#1c1a26'],
];
const UWATER: Ramp = ['#0d1513', '#14221c', '#1a2c22', '#25392b', '#55715a'];
const FUR: Ramp = ['#141217', '#242026', '#37302f', '#4c433e', '#655a52'];
const RTAIL: Ramp = ['#2e2226', '#4a3638', '#664c4c', '#806460', '#987a72'];
const RGLASS: Ramp = ['#0e1712', '#1a281e', '#2a3e2e', '#3e563c', '#68845e'];
const RAGS: Ramp = ['#2a2420', '#3c342c', '#524638', '#6a5c48', '#807058'];
const NSTRAW: Ramp = ['#3e3220', '#5a4a2a', '#7a6636', '#9a8444', '#b8a058'];

/** The sewer's brick, by a face's light: its courses, its mortar. */
function brickAt(b: number, z: number, which: number, n: V3): string {
  const l = n[0] * -0.55 + n[1] * 0.45 + n[2] * 0.7;
  const row = UBRICK[l > 0.25 ? 0 : l > -0.25 ? 1 : 2];
  if (which === 3) return UBRICK[0][2];
  const course = Math.floor(z / 6);
  const bond = fr((b + (course % 2) * 6) / 12);
  if (fr(z / 6) < 0.16 || bond < 0.08) return row[3];
  const c = hash(Math.floor((b + (course % 2) * 6) / 12), course, 1701) < 0.3 ? row[0] : row[1];
  // wet and slimed toward its foot
  return z < 14 && hash(Math.floor(b / 2), Math.floor(z / 2), 1702) < (14 - z) / 20 ? '#2f3b24' : c;
}

/** A RAT of his, running: its body along its way, its tail behind, its legs a blur. */
function rat(R: Rig, p: V3, dir: number, f: number, id: number): void {
  const F: V3 = [Math.cos(dir), Math.sin(dir), 0];
  const side: V3 = [-F[1], F[0], 0];
  const bob = Math.abs(Math.sin(f * 1.3 + id)) * 1.2;
  R.egg([p[0], p[1], p[2] + 3 + bob], [F, side, [0, 0, 1]], [6, 3, 2.8], (n) => toneAt(n, FUR, 0.1), id);
  R.egg([p[0] + F[0] * 6, p[1] + F[1] * 6, p[2] + 3 + bob], [F, side, [0, 0, 1]], [3, 2, 2], (n) => toneAt(n, FUR, 0.15), id);
  const t0: V3 = [p[0] - F[0] * 5, p[1] - F[1] * 5, p[2] + 2.5];
  const wig = Math.sin(f * 0.9 + id) * 3;
  R.rod(t0, [t0[0] - F[0] * 9 + side[0] * wig, t0[1] - F[1] * 9 + side[1] * wig, p[2] + 1], 0.9, 0.4, RTAIL, id + 1);
}

/** THE NEST against the grille: rags, straw, broken jars, corks and bones, heaped up; `k` 1 whole to 0 gone (scattered by the flood). */
function ratNest(R: Rig, k: number, seethe: number, f: number): void {
  if (k <= 0) return;
  const O = OUTFALL;
  for (let i = 0; i < 60; i++) {
    if (hash(i, 9, 1703) > k) continue;
    const b = (hash(i, 1, 1703) - 0.5) * 2 * (O.ow - 4);
    const hmax = 46 * Math.sqrt(Math.max(0, 1 - (b / O.ow) ** 2));
    const z = hash(i, 2, 1703) * hmax;
    const a = O.a0 + 2 - hash(i, 3, 1703) * 14 + (z / hmax) * 6;
    const jog = seethe * (hash(f, i, 1704) - 0.5) * 2;
    const kind = i % 7;
    if (kind === 0) R.egg([a, b + jog, z + 4], XYZ, [4, 3, 5.5], (n) => toneAt(n, RGLASS, 0.15), 200 + (i % 20));
    else if (kind === 1) R.rod([a, b - 6 + jog, z], [a - 3, b + 6 + jog, z + 3], 1.2, 1, NSTRAW, 200 + (i % 20));
    else if (kind === 2) R.egg([a, b + jog, z + 1.5], XYZ, [2.2, 2.2, 1.8], (n) => toneAt(n, ['#382a1c', '#523e28', '#6c5436', '#886c46', '#a4885c'], 0.1), 200 + (i % 20));
    else R.egg([a, b + jog, z + 3], XYZ, [8, 6, 4], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 1705 + i) < 0.2 ? RAGS[0] : toneAt(n, RAGS, 0.05)), 200 + (i % 20));
  }
}

const outfallCache = new Map<WayDir, WayArt>();
/** FLOOR 12'S WAY ON, THE OUTFALL: shut, its film, open; leading `d`. */
export function undercityWay(d: WayDir): WayArt {
  const had = outfallCache.get(d);
  if (had) return had;
  const F = OUTFALL_FILM;
  const O = OUTFALL;
  const base = new Rig(OW, OH, OAX, OAY, d, 0);
  // the channel's water running from the floor into the arch
  base.quad([[-10, -18, 0.4], [O.a0 + O.thick + 12, -18, 0.4], [O.a0 + O.thick + 12, 18, 0.4], [-10, 18, 0.4]], (u, v) => {
    if (u < 0.15 && hash(Math.floor(u * 80), Math.floor(v * 12), 1706) < (0.15 - u) / 0.15) return null;
    const rip = fr(u * 30 + Math.sin(v * 5) * 0.4) < 0.08 ? UWATER[4] : UWATER[2];
    return mix(rip, DARK, clamp01((u - 0.45) / 0.55) * 0.9);
  }, 5);
  paintStretch(base, {
    ...O,
    face: brickAt,
    beyond: (k, z) => mix(UWATER[1], DARK, Math.min(1, 0.5 + k * 0.5 + z * 0.004)),
  }, 10);
  const grille = (R: Rig, open: number): void => {
    // the grille, hinged at its left, bars up and across
    const hw = O.ow - 1;
    const ang = open * 1.45;
    const dir: V3 = [Math.sin(ang) * -1, Math.cos(ang), 0];
    const hinge: V3 = [O.a0 + 3, -hw, 0];
    const at = (u: number, z: number): V3 => [hinge[0] + dir[0] * u, hinge[1] + dir[1] * u, z];
    for (let k = 0; k <= 8; k++) {
      const u = (k / 8) * 2 * hw;
      const zt = O.oh - O.ow + Math.sqrt(Math.max(0, hw * hw - (u - hw) ** 2)) - 1;
      R.rod(at(u, 0), at(u, zt), 1.4, 1.4, IRON, 60);
    }
    for (const z of [10, 26, 42]) R.rod(at(0, z), at(2 * hw, z), 1.2, 1.2, IRON, 61);
  };
  const flood: { p0: V3; dir: number; sp: number; f0: number }[] = [];
  for (let i = 0; i < 34; i++) {
    const dir = Math.PI + (hash(i, 1, 1707) - 0.5) * 2.2;
    flood.push({ p0: [O.a0 - 6, (hash(i, 2, 1707) - 0.5) * 40, 0], dir, sp: 2.4 + hash(i, 3, 1707) * 1.8, f0: F.pour + Math.floor(hash(i, 4, 1707) * 22) });
  }
  const splash: Chip[] = [];
  const dust: Cloud[] = [];
  const paintFrame = (f: number): Px => {
    const R = base.copy();
    const seethe = f >= F.seethe && f < F.pour ? 0.5 + ((f - F.seethe) / (F.pour - F.seethe)) * 2.5 : 0;
    const left = f < 0 ? 1 : f < F.pour ? 1 : Math.max(0, 1 - (f - F.pour) / 30);
    const open = f < F.swing ? 0 : Math.min(1, (f - F.swing) / 8) - (f >= F.swing + 8 ? Math.sin(Math.min(1, (f - F.swing - 8) / 14) * Math.PI) * 0.06 : 0);
    grille(R, f > F.frames ? 1 : open);
    ratNest(R, left, seethe, f);
    flood.forEach((r, i) => {
      const k = f - r.f0;
      if (k < 0 || f > F.frames) return;
      const p: V3 = [r.p0[0] + Math.cos(r.dir) * r.sp * k, r.p0[1] + Math.sin(r.dir) * r.sp * k + Math.sin(k * 0.4 + i) * 3, 0];
      if (Math.hypot(p[0], p[1]) > 200) return;
      rat(R, p, r.dir + Math.sin(k * 0.4 + i) * 0.3, f, 300 + i * 2);
    });
    paintChips(R, splash, f, UWATER, 600);
    R.S.seams();
    paintDust(R, dust, f, ['#1a2a22', '#24382c', '#2e4636', '#3a5442', '#4a6450'], ['#1a2a22', '#24382c', '#2e4636', '#3a5442', '#4a6450'], (1 << 20) + 10);
    return R.S.p;
  };
  const shutPx = paintFrame(-1);
  const frames: Sprite[] = [];
  const kicks = [{ f: F.pour, k: 4 }, { f: F.swing + 8, k: 6 }];
  for (let f = 0; f < F.frames; f++) {
    if (f === F.swing + 8) {
      for (let i = 0; i < 30; i++) splash.push(chip(f, [O.a0 + 2, (hash(i, 1, 1708) - 0.5) * 30, 4], [-2 - hash(i, 2, 1708) * 3, (hash(i, 3, 1708) - 0.5) * 3, 2 + hash(i, 4, 1708) * 3], 1 + hash(i, 5, 1708), 1800 + i));
      for (let i = 0; i < 4; i++) dust.push(cloud(f, [O.a0 - 4, (hash(i, 6, 1708) - 0.5) * 30, 6], [-2, (hash(i, 7, 1708) - 0.5) * 2, 0.6], 12 + 4 * hash(i, 8, 1708), 1810 + i, 30, 6, 10));
    }
    stepChips(splash, f, () => 0);
    frames.push(whole(null, paintFrame(f), OAX, OAY, OW, OH));
  }
  const film: WayFilm = { frames, fps: F.fps, jolts: kicks.map((k) => k.f), kicks: kicks.map((k) => k.k) };
  const openPx = paintFrame(F.frames + 300);
  const empty = new Px(OW, OH);
  const art: WayArt = {
    shut: { under: whole(empty, null, OAX, OAY, OW, OH), over: whole(null, shutPx, OAX, OAY, OW, OH) },
    film,
    open: { under: whole(empty, null, OAX, OAY, OW, OH), over: whole(null, openPx, OAX, OAY, OW, OH) },
  };
  outfallCache.set(d, art);
  void smooth;
  return art;
}

// =================================================================================================
// FLOOR 13, THE MILLRACE: THE POSTERN. At the far end of the mill's yard, a stretch of the city's old outer wall still
// standing, crenellated, fallen away at its ends; a small door in it, iron-studded oak, the way back in. SHUT: papered
// over, the door and the wall round it, with layer on layer of the mill's wet sheets, written over and over in the
// Order's ink. AS THE PALIMPSEST DIES: the sheets bulge and sag; they peel from the top down, flopping over and
// sloughing off in a wet heap at the door's foot, a few blown away fluttering; the door swings in on the dark.

export const POSTERN = { a0: 24, thick: 26, half: 84, high: 118, ow: 15, oh: 48 };
export const POSTERN_FILM = { frames: 120, sag: 4, peel: 18, door: 84, fps: 30 } as const;
const MSTONE: Ramp = ['#3c3a36', '#4a4844', '#6c6862', '#928d84', '#b0aa9e'];
const SHEET: Ramp = ['#5e5850', '#827a6c', '#a69c88', '#c4b9a2', '#ddd2ba'];

function ashlarAt(b: number, z: number, which: number, n: V3): string {
  const c = toneAt(n, MSTONE, 0.02);
  if (which === 3) return hash(Math.floor(b / 6), 1, 1901) < 0.2 ? '#4e5f36' : MSTONE[3];
  const course = Math.floor(z / 14);
  const joint = fr(z / 14) < 0.08 || fr((b + (course % 2) * 11) / 22) < 0.05;
  if (joint) return MSTONE[0];
  // moss and weed in the joints toward its foot
  return z < 16 && hash(Math.floor(b / 3), Math.floor(z / 3), 1902) < 0.25 ? '#3c4a2c' : c;
}
/** Its top: merlons and crenels, fallen away toward each end. */
function posternTop(b: number): number {
  const P = POSTERN;
  const merlon = fr((b + 200) / 18) < 0.55 ? 12 : 0;
  const ruin = Math.max(0, Math.abs(b) - P.half * 0.62) * 1.4 + hash(Math.floor(b / 4), 3, 1903) * 6 * (Math.abs(b) > P.half * 0.6 ? 1 : 0);
  return Math.max(20, P.high + merlon - ruin);
}
/** A sheet pasted over the door: its middle, size, tilt; when it begins to peel, where it lands. */
interface Sheet {
  b: number;
  z: number;
  w: number;
  h: number;
  tilt: number;
  t0: number;
  land: [number, number];
  blow: boolean;
  seed: number;
}
function posternSheets(): Sheet[] {
  const P = POSTERN;
  const out: Sheet[] = [];
  for (let i = 0; i < 46; i++) {
    const b = (hash(i, 1, 1904) - 0.5) * 2 * (P.ow + 10);
    const z = 4 + hash(i, 2, 1904) * (P.oh + 8);
    const peel = POSTERN_FILM.peel + (1 - z / (P.oh + 12)) * 34 + hash(i, 3, 1904) * 8;
    out.push({ b, z, w: 9 + hash(i, 4, 1904) * 4, h: 11 + hash(i, 5, 1904) * 4, tilt: (hash(i, 6, 1904) - 0.5) * 0.5, t0: peel, land: [P.a0 - 4 - hash(i, 7, 1904) * 14, b * 0.8 + (hash(i, 8, 1904) - 0.5) * 10], blow: i % 6 === 0, seed: i });
  }
  return out;
}
/** A sheet as it is `k` frames after it began to peel (before: pasted flat, sagging `sag`). */
function paintSheet(R: Rig, s: Sheet, f: number, sag: number): void {
  const P = POSTERN;
  const k = f - s.t0;
  const ink = (u: number, v: number): string | null => {
    if (fr(v * 7 + s.seed * 0.3) < 0.14 && u > 0.12 && u < 0.88) return INK[2];
    return hash(Math.floor(u * 6), Math.floor(v * 8), 1905 + s.seed) < 0.18 ? SHEET[1] : SHEET[2 + (s.seed % 2)];
  };
  const ca = Math.cos(s.tilt);
  const sa = Math.sin(s.tilt);
  const corner = (u: number, v: number): [number, number] => [s.b + (u - 0.5) * s.w * ca - (v - 0.5) * s.h * sa, s.z + (u - 0.5) * s.w * sa + (v - 0.5) * s.h * ca];
  if (k < 0) {
    const out = sag * (0.5 + s.z / 60);
    const q = [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)].map(([b, z], j) => [P.a0 - 0.6 - (j < 2 ? out * 0.4 : out), b, z - sag * 0.6]);
    R.quad(q, ink, 400 + (s.seed % 30));
    return;
  }
  // peeling: its top falls away from the wall, it hangs, it drops and flutters down to its heap (or blows off)
  const flop = Math.min(1, k / 10);
  const fall = Math.max(0, k - 10);
  const [bm, zb] = corner(0.5, 0);
  if (fall === 0) {
    const ang = flop * Math.PI * 0.9;
    const top: [number, number] = [P.a0 - 0.6 - Math.sin(ang) * s.h, zb + Math.cos(ang) * s.h];
    R.quad([[P.a0 - 0.6, bm - s.w / 2, zb], [P.a0 - 0.6, bm + s.w / 2, zb], [top[0], bm + s.w / 2, top[1]], [top[0], bm - s.w / 2, top[1]]], ink, 400 + (s.seed % 30));
    return;
  }
  const t = Math.min(1, fall / (s.blow ? 40 : 14));
  const a = P.a0 - 2 + (s.land[0] - P.a0 + 2) * t + (s.blow ? -t * 30 : 0);
  const b = bm + (s.land[1] - bm) * t + Math.sin(fall * 0.4 + s.seed) * (s.blow ? 8 : 2) * (1 - t * 0.6);
  const z = Math.max(0.5 + (s.seed % 5) * 0.4, zb * (1 - t) + (s.blow ? 30 * Math.sin(t * Math.PI) : 0));
  const tw = fall * 0.3 + s.seed;
  const lie = t >= 1 && !s.blow;
  const A: V3 = [Math.cos(tw) * 0.5, Math.sin(tw) * 0.5, lie ? 0 : 0.7];
  if (s.blow && t >= 1) return;
  const w2 = s.w / 2;
  const h2 = s.h / 2;
  const L = [Math.cos(tw), Math.sin(tw)];
  R.quad([[a - L[0] * h2, b - L[1] * h2 - w2, z], [a - L[0] * h2, b - L[1] * h2 + w2, z], [a + L[0] * h2, b + L[1] * h2 + w2, z + (lie ? 0 : A[2] * h2)], [a + L[0] * h2, b + L[1] * h2 - w2, z + (lie ? 0 : A[2] * h2)]], ink, 400 + (s.seed % 30));
}
/** The door's leaf: oak boards, iron studs and straps; swung `open` (0 shut, 1 in against its jamb). */
function posternDoor(R: Rig, open: number): void {
  const P = POSTERN;
  doorLeaf(R, P.a0 + P.thick * 0.5, -P.ow, 2 * P.ow, P.oh - 2, open, true, (u, v, n) => {
    if (fr(u * 4) < 0.06) return OAK[0];
    if (Math.abs(v - 0.25) < 0.03 || Math.abs(v - 0.7) < 0.03) return toneAt(n, IRON, 0.1);
    if (Math.abs(fr(u * 4) - 0.5) < 0.05 && Math.abs(fr(v * 6) - 0.5) < 0.05) return IRON[3];
    return toneAt(n, OAK, 0.1);
  }, 80);
}

const posternCache = new Map<WayDir, WayArt>();
/** FLOOR 13'S WAY ON, THE POSTERN: shut, its film, open; leading `d`. */
export function millraceWay(d: WayDir): WayArt {
  const had = posternCache.get(d);
  if (had) return had;
  const F = POSTERN_FILM;
  const P = POSTERN;
  const base = new Rig(OW, OH, OAX, OAY, d, 0);
  paintStretch(base, { ...P, top: posternTop, face: ashlarAt, beyond: (k) => mix('#1a1c22', DARK, 0.5 + k * 0.5) }, 10);
  // the wall's fallen stones at its ends
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    base.egg([P.a0 + hash(i, 1, 1906) * P.thick, s * (P.half + 4 + hash(i, 2, 1906) * 14), 5], XYZ, [8 + hash(i, 3, 1906) * 4, 7, 5], facetOf(MSTONE, 0.05), 30 + i);
  }
  const sheets = posternSheets();
  const paintFrame = (f: number): Px => {
    const R = base.copy();
    const open = f < F.door ? 0 : Math.min(1, (f - F.door) / 16);
    posternDoor(R, f > F.frames ? 1 : open);
    const sag = f < F.sag ? 0 : Math.min(3, (f - F.sag) * 0.2);
    sheets.forEach((s) => paintSheet(R, s, f < 0 ? -1e9 : f > F.frames ? 1e9 : f, f < 0 ? 0 : sag));
    R.S.seams();
    return R.S.p;
  };
  const shutPx = paintFrame(-1);
  const frames: Sprite[] = [];
  for (let f = 0; f < F.frames; f++) frames.push(whole(null, paintFrame(f), OAX, OAY, OW, OH));
  const film: WayFilm = { frames, fps: F.fps, jolts: [F.peel + 26, F.door + 14], kicks: [3, 4] };
  const openPx = paintFrame(F.frames + 300);
  const empty = new Px(OW, OH);
  const art: WayArt = {
    shut: { under: whole(empty, null, OAX, OAY, OW, OH), over: whole(null, shutPx, OAX, OAY, OW, OH) },
    film,
    open: { under: whole(empty, null, OAX, OAY, OW, OH), over: whole(null, openPx, OAX, OAY, OW, OH) },
  };
  posternCache.set(d, art);
  return art;
}

// =================================================================================================
// FLOOR 14, THE HOUSE OF QUIET: THE STITCHED DOOR. In the far wall of the Physician's theatre, limewashed over the
// infirmary's green dado, a plain ward door: the way on. SHUT: stitched shut, as he stitches what he has cut, great
// stitches of black thread across its edges into the frame, knotted. AS THE PHYSICIAN DIES: the stitches strain and
// snap one after another from the top down, the cut thread whipping loose; the door falls open on the dark.

export const STITCHED = { a0: 24, thick: 16, half: 70, high: 96, ow: 16, oh: 58 };
export const STITCH_FILM = { frames: 108, strain: 4, snap0: 22, snapEvery: 4, door: 74, fps: 30 } as const;
const WASH = [
  ['#c2c6b4', '#b2b7a4', '#a7ac99', '#8f9583'],
  ['#a2a795', '#949a88', '#898f7e', '#767c6c'],
  ['#6c7266', '#62685d', '#585e55', '#474d46'],
];
const DADO = [
  ['#7d8f6c', '#6b7d5c', '#5d6e50', '#30392a'],
  ['#64755a', '#57674d', '#4b5a43', '#262e22'],
  ['#45513c', '#3b4634', '#333d2d', '#1c231a'],
];
const THREAD: Ramp = ['#060508', '#0c0a10', '#17141d', '#26212e', '#332c3c'];

function limewashAt(b: number, z: number, which: number, n: V3): string {
  const l = n[0] * -0.55 + n[1] * 0.45 + n[2] * 0.7;
  const k = l > 0.25 ? 0 : l > -0.25 ? 1 : 2;
  if (which === 3) return WASH[0][1];
  if (z < 24) {
    if (z > 22 || z < 3) return '#262a24';
    return fr(b / 5) < 0.12 ? DADO[k][3] : DADO[k][hash(Math.floor(b / 5), 1, 2001) < 0.4 ? 1 : 2];
  }
  return WASH[k][hash(Math.floor(b / 7), Math.floor(z / 7), 2002) < 0.25 ? 3 : hash(Math.floor(b / 3), Math.floor(z / 4), 2003) < 0.5 ? 1 : 2];
}
/** The stitches: where each crosses the door's edge (b, z), and when it snaps. */
function stitchesOf(): { b: number; z: number; t: number; seed: number }[] {
  const S = STITCHED;
  const F = STITCH_FILM;
  const out: { b: number; z: number; t: number; seed: number }[] = [];
  let k = 0;
  // down the latch side, and across the head
  for (let z = S.oh - 8; z > 6; z -= 8) out.push({ b: S.ow, z, t: 0, seed: k++ });
  for (let b = -S.ow + 6; b < S.ow - 4; b += 8) out.push({ b, z: S.oh, t: 0, seed: k++ });
  for (let z = S.oh - 12; z > 10; z -= 12) out.push({ b: -S.ow, z, t: 0, seed: k++ });
  out.sort((p, q) => q.z - p.z);
  out.forEach((s, i) => (s.t = F.snap0 + i * F.snapEvery + Math.floor(hash(i, 1, 2004) * 2)));
  return out;
}
/** A stitch across the door's edge: two crossed strokes of thread and a knot; snapped `k` frames ago, its ends whipping loose and hanging. */
function paintStitch(R: Rig, s: { b: number; z: number; seed: number }, k: number, strain: number): void {
  const S = STITCHED;
  const a = S.a0 - 1.2;
  const head = s.z >= S.oh - 0.5;
  const across = (u: number): [number, number] => (head ? [s.b, s.z + u] : [s.b + u, s.z]);
  const pull = strain * Math.sin(s.seed * 3 + k * 0.7) * 0.6;
  if (k < 0) {
    for (const sg of [-1, 1]) {
      const [b0, z0] = across(-6);
      const [b1, z1] = across(6);
      R.rod([a - pull, b0 + (head ? sg * 3 : 0), z0 + (head ? 0 : sg * 3)], [a - pull, b1 - (head ? sg * 3 : 0), z1 - (head ? 0 : sg * 3)], 0.9, 0.9, THREAD, 90 + (s.seed % 6));
    }
    R.egg([a - 1 - pull, ...across(0)], XYZ, [1.6, 1.6, 1.6], (n) => toneAt(n, THREAD, 0.2), 90 + (s.seed % 6));
    return;
  }
  // snapped: each half whips back and hangs down from where it was sewn
  const sw = Math.max(0, 1 - k / 10);
  for (const sg of [-1, 1]) {
    const [bo, zo] = across(sg * 6);
    const whip = Math.sin(k * 0.9) * 4 * sw;
    R.rod([a, bo, zo], [a - 2 - whip, bo - sg * 2 * sw, zo - 7 + whip], 0.8, 0.6, THREAD, 96 + (s.seed % 4));
  }
}

const stitchCache = new Map<WayDir, WayArt>();
/** FLOOR 14'S WAY ON, THE STITCHED DOOR: shut, its film, open; leading `d`. */
export function houseOfQuietWay(d: WayDir): WayArt {
  const had = stitchCache.get(d);
  if (had) return had;
  const F = STITCH_FILM;
  const S = STITCHED;
  const base = new Rig(OW, OH, OAX, OAY, d, 0);
  paintStretch(base, { ...S, flat: true, face: limewashAt, beyond: (k) => mix('#14161c', DARK, 0.5 + k * 0.5) }, 10);
  const stitches = stitchesOf();
  const paintFrame = (f: number): Px => {
    const R = base.copy();
    const open = f < F.door ? 0 : Math.min(1, (f - F.door) / 12) - (f > F.door + 12 ? Math.sin(Math.min(1, (f - F.door - 12) / 10) * Math.PI) * 0.08 : 0);
    doorLeaf(R, S.a0 + 4, -S.ow, 2 * S.ow, S.oh - 1, f > F.frames ? 1 : open, true, (u, v, n) => {
      if (fr(u * 3) < 0.05) return DADO[1][3];
      if (Math.abs(v - 0.5) < 0.02 || Math.abs(u - 0.5) < 0.02) return DADO[1][3];
      return toneAt(n, ['#2e3a2a', '#3e4c38', '#4e5e46', '#5f7056', '#728468'], 0.05);
    }, 80);
    const strain = f >= F.strain && f < F.door ? 1 + (f - F.strain) * 0.05 : 0;
    stitches.forEach((s) => paintStitch(R, s, f < 0 ? -1 : f > F.frames ? 999 : f - s.t, strain));
    R.S.seams();
    return R.S.p;
  };
  const shutPx = paintFrame(-1);
  const frames: Sprite[] = [];
  for (let f = 0; f < F.frames; f++) frames.push(whole(null, paintFrame(f), OAX, OAY, OW, OH));
  const film: WayFilm = { frames, fps: F.fps, jolts: [F.snap0, F.door + 12], kicks: [2, 4] };
  const openPx = paintFrame(F.frames + 300);
  const empty = new Px(OW, OH);
  const art: WayArt = {
    shut: { under: whole(empty, null, OAX, OAY, OW, OH), over: whole(null, shutPx, OAX, OAY, OW, OH) },
    film,
    open: { under: whole(empty, null, OAX, OAY, OW, OH), over: whole(null, openPx, OAX, OAY, OW, OH) },
  };
  stitchCache.set(d, art);
  return art;
}

// =================================================================================================
// FLOOR 15, THE GREAT LIBRARY: THE GREAT DOORS. In the Reading Room's far wall of bookcases, the library's great doors,
// carved oak in a tall round arch: the way out, home. SHUT: blacked out, the Censor's ink poured over them and the shelves
// round them, glossy and dripping, bars of it struck across. AS THE CENSOR DIES: the ink runs, thins and drains down off
// them into a pool at their foot that sinks into the floor; the doors swing open and the morning's grey light pours in
// across the floor.

export const GREAT_DOORS = { a0: 22, thick: 20, half: 92, high: 150, ow: 28, oh: 92 };
export const DOORS_FILM = { frames: 126, run: 6, door: 82, fps: 30 } as const;
const SPINES: Ramp[] = [
  ['#2e161c', '#4a2226', '#6a302e', '#86423a', '#a05a48'],
  ['#1a2218', '#263422', '#364830', '#4a6040', '#607a50'],
  ['#1d2133', '#262b40', '#30364e', '#3e4560', '#505874'],
  ['#3a2a1c', '#523e28', '#6c5436', '#886c46', '#a4885c'],
  ['#5e5850', '#827a6c', '#a69c88', '#c4b9a2', '#ddd2ba'],
  ['#09080d', '#121019', '#1c1924', '#282331', '#352e40'],
];
const LWOOD: Ramp = ['#1a130e', '#34261a', '#402f21', '#4b3828', '#5d4632'];
const DAWN: Ramp = ['#5a6070', '#7a8294', '#a2a8b6', '#c8ccd4', '#e2e4e8'];

function shelvesAt(b: number, z: number, which: number, n: V3): string {
  if (which === 3) return LWOOD[3];
  if (which === 4 || which === 2) return toneAt(n, LWOOD, 0);
  // the shelves, every 22, and the books on them
  const shelf = fr(z / 22);
  if (shelf < 0.12) return shelf < 0.04 ? LWOOD[4] : LWOOD[2];
  if (fr((b + 400) / 46) < 0.06) return LWOOD[2];
  const k = Math.floor((b + 400) / 3.2);
  const row = Math.floor(z / 22);
  const tall = 0.62 + hash(k, row, 2101) * 0.38;
  if (shelf > tall) return LWOOD[0];
  const sp = SPINES[Math.floor(hash(k, row, 2102) * SPINES.length)];
  if (Math.abs(shelf - 0.4) < 0.03 || Math.abs(shelf - (tall - 0.08)) < 0.03) return '#8c733f';
  return sp[hash(k, row, 2103) < 0.3 ? 1 : 2];
}
/** The ink over the doors and shelves: how much of it there is still at (b, z) as it drains (`k` 0 just poured, 1 gone). */
function inkAt(b: number, z: number, k: number, f: number): boolean {
  const D = GREAT_DOORS;
  const wide = D.ow + 16 + hash(Math.floor(b / 5), 1, 2104) * 10;
  if (Math.abs(b) > wide) return false;
  // runs down: what is left is low, and in runnels
  const runnel = hash(Math.floor((b + 400) / 3), 2, 2105);
  const top = D.oh + 16 - k * (D.oh + 30) * (0.7 + runnel * 0.6) - (k > 0 ? (f % 7) * 0.2 : 0);
  if (z > top) return false;
  return k < 0.95 || z < 4;
}
const doorsCache = new Map<WayDir, WayArt>();
/** FLOOR 15'S WAY ON, THE GREAT DOORS: shut, its film, open; leading `d`. */
export function libraryWay(d: WayDir): WayArt {
  const had = doorsCache.get(d);
  if (had) return had;
  const F = DOORS_FILM;
  const D = GREAT_DOORS;
  const W = 720;
  const H = 560;
  const AX = 360;
  const AY = 360;
  const paintFrame = (f: number): Px => {
    const drain = f < 0 ? 0 : f > F.frames ? 1 : clamp01((f - F.run) / (F.door - F.run - 6));
    const open = f < 0 ? 0 : f > F.frames ? 1 : clamp01((f - F.door) / 18);
    const R = new Rig(W, H, AX, AY, d, 0);
    const light = open;
    paintStretch(R, { ...D, face: shelvesAt, beyond: (k, z) => (light > 0.05 ? mix(DAWN[3], DAWN[1], k * 0.4 + z * 0.002) : mix(LWOOD[0], DARK, 0.6 + k * 0.4)) }, 10);
    // the light poured in across the floor before them, as they open
    if (light > 0) {
      R.quad([[D.a0 - 0.5, -D.ow * light, 0.3], [D.a0 - 0.5, D.ow * light, 0.3], [D.a0 - 90 * light, D.ow * 1.6 * light, 0.3], [D.a0 - 90 * light, -D.ow * 1.6 * light, 0.3]], (u, v) => {
        if (hash(Math.floor(u * 40), Math.floor(v * 20), 2106) < u * 0.8) return null;
        return u < 0.3 ? DAWN[3] : DAWN[2];
      }, 6);
    }
    // the two leaves, carved in panels, hinged at either side, swinging in
    for (const s of [-1, 1]) {
      doorLeaf(R, D.a0 + D.thick * 0.5, s * D.ow, D.ow, D.oh - 2, open, true, (u, v, n) => {
        const pu = fr(u * 2);
        const pv = fr(v * 3);
        if (pu < 0.08 || pv < 0.06) return LWOOD[1];
        if (pu > 0.92 || pv > 0.94) return LWOOD[4];
        return toneAt(n, LWOOD, 0.08);
      }, 80 + (s > 0 ? 1 : 0));
    }
    // THE INK over all of it, glossy, its bars struck across
    if (drain < 1) {
      R.quad([[D.a0 - 1.2, -D.ow - 30, 0.4], [D.a0 - 1.2, D.ow + 30, 0.4], [D.a0 - 1.2, D.ow + 30, D.oh + 24], [D.a0 - 1.2, -D.ow - 30, D.oh + 24]], (u, v) => {
        const b = -D.ow - 30 + u * (2 * D.ow + 60);
        const z = v * (D.oh + 24);
        if (!inkAt(b, z, drain, f)) return null;
        const bar = Math.abs(fr((z + b * 0.1) / 26) - 0.5) < 0.12 && drain < 0.3;
        const sheen = hash(Math.floor(b / 2), Math.floor(z / 3), 2107) < 0.06;
        return bar ? INK[0] : sheen ? INK[4] : INK[2];
      }, 70);
    }
    // its pool at their foot, sinking away
    const pool = f < 0 ? 0.6 : f > F.frames ? 0 : drain < 1 ? 0.6 + drain * 0.6 : Math.max(0, 1.2 - (f - F.door) / 30);
    if (pool > 0) R.egg([D.a0 - 8, 0, 0.4], XYZ, [12 * pool, (D.ow + 18) * pool, 0.5], (n, w) => (hash(Math.floor(w[0]), Math.floor(w[1]), 2108) < 0.06 ? INK[4] : INK[1]), 71);
    R.S.seams();
    return R.S.p;
  };
  const shutPx = paintFrame(-1);
  const frames: Sprite[] = [];
  for (let f = 0; f < F.frames; f++) frames.push(whole(null, paintFrame(f), AX, AY, W, H));
  const film: WayFilm = { frames, fps: F.fps, jolts: [F.door + 18], kicks: [4] };
  const openPx = paintFrame(F.frames + 300);
  const empty = new Px(W, H);
  const art: WayArt = {
    shut: { under: whole(empty, null, AX, AY, W, H), over: whole(null, shutPx, AX, AY, W, H) },
    film,
    open: { under: whole(empty, null, AX, AY, W, H), over: whole(null, openPx, AX, AY, W, H) },
  };
  doorsCache.set(d, art);
  return art;
}
