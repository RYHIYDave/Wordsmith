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
import { trimmed } from './act1_ways';
import { BRIGHT, quietRGB } from './act2_quiet';
import type { RGB } from './terrain';
import { UC_DEEP, UC_RISE, undercityTopAt, undercityWallFace } from './undercity';
import { HQ_DEEP, HQ_RISE, HQ_ZONE, houseTopAt, houseWallFace } from './housequiet';
import { LB_DEEP, LB_RISE, LB_ZONE, libraryTopAt, libraryWallFace } from './library';
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

/** A picture from its under and over (each seamed), quietened as every colour of Act 2's places is (act2_quiet.ts: no
 * richer than the dullest word, what glows left bright), cut down to what is painted in it, its anchor kept. */
function whole(under: Px | null, over: Px | null, ax: number, ay: number, w: number, h: number): Sprite {
  const layers = [under, over].filter((p): p is Px => !!p);
  const p = layers.length ? compose(null, layers) : new Px(w, h);
  quieten(p);
  return trimmed(p, ax, ay);
}
const hex2 = (v: number): string => v.toString(16).padStart(2, '0');
/** Every colour of a picture no richer than act2_quiet.ts's QUIET_MOST, but what glows. */
function quieten(p: Px): void {
  const d = p.d;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const M = Math.max(d[i], d[i + 1], d[i + 2]);
    const m = Math.min(d[i], d[i + 1], d[i + 2]);
    if (M === 0 || (M - m) / M <= 0.46) continue;
    if (BRIGHT.has('#' + hex2(d[i]) + hex2(d[i + 1]) + hex2(d[i + 2]))) continue;
    const q = quietRGB([d[i], d[i + 1], d[i + 2]]);
    d[i] = Math.round(q[0]);
    d[i + 1] = Math.round(q[1]);
    d[i + 2] = Math.round(q[2]);
  }
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
  // (shut and open, all of it lies flat in the square: under whoever stands on it)
  const none = new Px(GW, GH);
  const art: WayArt = {
    shut: { under: whole(shutPx.under, shutPx.over, GAX, GAY, GW, GH), over: whole(null, none, GAX, GAY, GW, GH) },
    film,
    open: { under: whole(openPx.under, openPx.over, GAX, GAY, GW, GH), over: whole(null, none, GAX, GAY, GW, GH) },
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
  /** What is seen through the opening, far in: its colour at depth `k` 0..1 in and height z (none: what is behind it, seen through). */
  beyond?: (k: number, z: number, b: number) => string;
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
  const by = W.beyond;
  if (!by) return;
  const far = a1 + 12;
  R.quad([[a0, -ow, 0.2], [far, -ow, 0.2], [far, ow, 0.2], [a0, ow, 0.2]], (u, v) => by(u, 0, -ow + v * 2 * ow), id + 5);
  R.quad([[far, -ow - 2, 0], [far, ow + 2, 0], [far, ow + 2, oh + 2], [far, -ow - 2, oh + 2]], (u, v) => by(1, v * (oh + 2), -ow - 2 + u * (2 * ow + 4)), id + 6);
  for (const s of [-1, 1]) R.quad([[a1, s * ow, 0], [far, s * ow, 0], [far, s * ow, oh], [a1, s * ow, oh]], (u, v) => by(0.4 + u * 0.6, v * oh, s * ow), id + 7);
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
// A WAY THROUGH ONE OF THE FLOOR'S OWN WALLS (floors 12, 14 and 15, whose rooms are walled round a tile thick): three
// tiles of a BACK wall of the floor's (its face toward the eye, the way leading x- or y-), painted as the ground paints
// the floor's own walls (the same face, the same top, its pattern running on from the walls either side of it, given
// where it stands), an opening through its middle, and what is in the opening. Anchored as floor 4's cave is: at the
// foot of the wall's face under the middle of the doorway's middle tile; the wall a tile thick behind that.
//   over: the wall's face round the opening, its top, and whatever stands at the face (a door shut, a grille, a seal);
//   under: in the opening, under whoever walks into it: its jambs and head, the threshold, the dark (or the light) beyond.

/** A floor's own wall as its ground paints it (art/terrain.ts TerrainLook.face and .top). */
interface WallLook {
  rise: number;
  /** The dark beyond it. */
  deep: string;
  face(shade: number, v: number, px: number, x: number, y: number): RGB;
  top(px: number, py: number, back: number, x: number, y: number): RGB;
}
/** Where a piece stands in the world (its anchor, in tiles): for the wall's pattern to run on into the floor's own. */
export interface WallAt {
  x: number;
  y: number;
}
const AT0: WallAt = { x: 0, y: 0 };
const hexOf = (c: RGB): string => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const UNDERCITY_WALL: WallLook = {
  rise: UC_RISE,
  deep: hexOf(UC_DEEP),
  face: (s, v, px, x, y) => undercityWallFace(s, v, px, x, y),
  top: (px, py, back, x, y) => undercityTopAt(x, y, px, py, back),
};
const houseWall = (zone: number): WallLook => ({
  rise: HQ_RISE,
  deep: hexOf(HQ_DEEP),
  face: (s, v, px) => houseWallFace(zone, s, v, px),
  top: (px, py, back, x, y) => houseTopAt(x, y, px, py, back),
});
const libraryWall = (zone: number): WallLook => ({
  rise: LB_RISE,
  deep: hexOf(LB_DEEP),
  face: (s, v, px) => libraryWallFace(zone, s, v, px),
  top: (px, py, back) => libraryTopAt(px, py, back),
});

interface Doorway {
  /** The stretch either side of the middle (60: three tiles), how thick (40: a tile). */
  half: number;
  thick: number;
  /** The opening: `ow` either side, `oh` to its crown (round-headed, or flat). */
  ow: number;
  oh: number;
  flat?: boolean;
}
/** Where a point of the way's frame is in the world, in tiles, and its column of the world's picture (as terrain.ts worldOf). */
function worldPx(R: Rig, at: WallAt, a: number, b: number): { x: number; y: number; px: number } {
  const t = R.T(a, b, 0);
  const x = at.x + t[0] / 40;
  const y = at.y + t[1] / 40;
  return { x, y, px: Math.round((x - y) * 32 - 0.5) };
}
/** How a face turned `n` (world) looks to the light, as terrain.ts shadeAt: 1 to the lower left, -1 to the lower right. */
const shadeOf = (n: V3): number => Math.max(-1, Math.min(1, n[1] - n[0]));
/** The ground's foot shadow at a face's foot (as the floors' looks have it). */
const footed = (c: RGB, v: number): RGB => (v < 3 ? [c[0] * 0.6, c[1] * 0.6, c[2] * 0.6] : v < 7 ? [c[0] * 0.78, c[1] * 0.78, c[2] * 0.78] : c);

/**
 * THE WALL ROUND THE OPENING into `over`, and the opening's jambs, head, threshold and beyond into `under`. `dress(b, z)`
 * paints what is cut or set in the face (a door case, an arch's stones), else the floor's own face; `beyond(k, z, b)` what
 * is seen far in (k 0 at the back of the wall to 1 far in).
 */
function paintBackWall(over: Rig, under: Rig, L: WallLook, at: WallAt, D: Doorway, id: number, dress: ((b: number, z: number) => string | null) | null, beyond: (k: number, z: number, b: number) => string): void {
  const { half, thick, ow, oh } = D;
  const H = L.rise;
  const nF = over.V([-1, 0, 0]);
  const sF = shadeOf(nF);
  const inHole = (b: number, z: number): boolean => inArch(b, z, ow, oh, D.flat);
  const faceAt = (s: number, a: number, b: number, z: number): string => {
    const w = worldPx(over, at, a, b);
    return hexOf(quietRGB(footed(L.face(s, z, w.px, w.x, w.y), z)));
  };
  // ITS FACE, round the opening
  over.quad([[0, -half, 0], [0, half, 0], [0, half, H], [0, -half, H]], (u, v) => {
    const b = -half + u * 2 * half;
    const z = v * H;
    if (inHole(b, z)) return null;
    return (dress && dress(b, z)) || faceAt(sF, 0, b, z);
  }, id);
  // ITS TOP: the wall's thickness seen from above, its edge catching the light, the dark beyond
  over.quad([[0, -half, H], [thick, -half, H], [thick, half, H], [0, half, H]], (u, v) => {
    const a = u * thick;
    const b = -half + v * 2 * half;
    const w = worldPx(over, at, a, b);
    return hexOf(quietRGB(L.top(w.px, Math.round((w.x + w.y) * 16 - H), a / 20, w.x, w.y)));
  }, id + 1);
  // its ends (hidden where the floor's own walls go on either side) and its back (seen only from behind)
  for (const s of [-1, 1]) {
    const n = over.V([0, s, 0]);
    over.quad([[0, s * half, 0], [thick, s * half, 0], [thick, s * half, H], [0, s * half, H]], (u, v) => faceAt(shadeOf(n), u * thick, s * half, v * H), id + 2);
  }
  const nB = over.V([1, 0, 0]);
  over.quad([[thick, -half, 0], [thick, half, 0], [thick, half, H], [thick, -half, H]], (u, v) => {
    const b = -half + u * 2 * half;
    const z = v * H;
    if (inHole(b, z)) return null;
    return faceAt(shadeOf(nB), thick, b, z);
  }, id + 3);
  // THE OPENING'S JAMBS AND HEAD, inside the wall's thickness, in the shade of it
  const N = 18;
  const rim: [number, number][] = [[-ow, 0]];
  if (D.flat) rim.push([-ow, oh], [ow, oh]);
  else for (let i = 0; i <= N; i++) {
    const t = Math.PI - (i / N) * Math.PI;
    rim.push([Math.cos(t) * ow, oh - ow + Math.sin(t) * ow]);
  }
  rim.push([ow, 0]);
  for (let i = 0; i + 1 < rim.length; i++) {
    const [b0, z0] = rim[i];
    const [b1, z1] = rim[i + 1];
    const nn = norm(under.V([0, z1 - z0, -(b1 - b0)]));
    under.quad([[0, b0, z0], [thick, b0, z0], [thick, b1, z1], [0, b1, z1]], (u) => mix(faceAt(shadeOf(nn), u * thick, (b0 + b1) / 2, (z0 + z1) / 2), L.deep, 0.3 + u * 0.55), id + 4);
  }
  // the threshold, going in under the wall into the dark, and the dark (or the light) far in
  const far = thick + 14;
  under.quad([[0, -ow, 0.3], [far, -ow, 0.3], [far, ow, 0.3], [0, ow, 0.3]], (u, v) => beyond(u * 0.8, 0, -ow + v * 2 * ow), id + 5);
  under.quad([[far, -ow - 2, 0], [far, ow + 2, 0], [far, ow + 2, oh + 2], [far, -ow - 2, oh + 2]], (u, v) => beyond(1, v * (oh + 2), -ow - 2 + u * (2 * ow + 4)), id + 6);
  for (const s of [-1, 1]) under.quad([[thick, s * ow, 0], [far, s * ow, 0], [far, s * ow, oh], [thick, s * ow, oh]], (u, v) => beyond(0.6 + u * 0.4, v * oh, s * ow), id + 7);
}

// =================================================================================================
// FLOOR 12, THE UNDERCITY: THE OUTFALL. In a back wall of the King's cistern, the arch of the great outfall where the
// sewer runs out to the river, ringed in dressed stone: the channel's green water running out of it over the floor
// under an iron grille. SHUT: the grille choked with the Rat King's nest, rags, straw, broken jars of the bottled voices,
// corks and bones heaped up against it. AS THE RAT KING DIES: the nest seethes; his rats pour out of it in a flood across
// the floor and away into the dark; the grille, rusted through at its hinge, is shoved and swings open with a clang.

export const OUTFALL: Doorway = { half: 60, thick: 40, ow: 24, oh: 58 };
export const OUTFALL_FILM = { frames: 116, seethe: 4, pour: 26, swing: 52, fps: 30 } as const;
const OW = 680;
const OH = 520;
const OAX = 340;
const OAY = 360;
const UWATER: Ramp = ['#0d1513', '#14221c', '#1a2c22', '#25392b', '#55715a'];
const FUR: Ramp = ['#141217', '#242026', '#37302f', '#4c433e', '#655a52'];
const RTAIL: Ramp = ['#2e2226', '#4a3638', '#664c4c', '#806460', '#987a72'];
const RGLASS: Ramp = ['#0e1712', '#1a281e', '#2a3e2e', '#3e563c', '#68845e'];
const RAGS: Ramp = ['#2a2420', '#3c342c', '#524638', '#6a5c48', '#807058'];
const NSTRAW: Ramp = ['#3e3220', '#5a4a2a', '#7a6636', '#9a8444', '#b8a058'];
/** The arch's dressed stones, as the cistern's coping. */
const VOUSSOIR: Ramp = ['#26262e', '#3a3a42', '#4c4c53', '#5e5d62', '#6e6d70'];

/** The arch's ring of dressed stones round the opening, a keystone at its crown: its colour at (b, z) on the face, if there. */
function archStones(b: number, z: number, D: Doorway, ring: number): string | null {
  if (!inArch(b, z, D.ow + ring, D.oh + ring, D.flat) || inArch(b, z, D.ow, D.oh, D.flat)) return null;
  const spring = D.oh - D.ow;
  if (z < spring) {
    // the jambs' quoins, in courses
    const k = Math.floor(z / 12);
    if (fr(z / 12) < 0.1) return VOUSSOIR[0];
    return (k % 2 ? Math.abs(b) > D.ow + ring * 0.55 : true) ? VOUSSOIR[k % 2 ? 2 : 3] : null;
  }
  // the voussoirs, their joints running out from the arch's middle
  const ang = Math.atan2(z - spring, b);
  const k = Math.floor((ang / Math.PI) * 11);
  if (fr((ang / Math.PI) * 11) < 0.12) return VOUSSOIR[0];
  if (k === 5) return VOUSSOIR[4];
  return VOUSSOIR[k % 2 ? 2 : 3];
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
/** THE NEST against the grille: rags, straw, broken jars, corks and bones, heaped up to its middle; `k` 1 whole to 0 gone. */
function ratNest(R: Rig, k: number, seethe: number, f: number): void {
  if (k <= 0) return;
  const O = OUTFALL;
  for (let i = 0; i < 90; i++) {
    if (hash(i, 9, 1703) > k) continue;
    const b = (hash(i, 1, 1703) - 0.5) * 2 * (O.ow + 6);
    const hmax = 50 * Math.sqrt(Math.max(0, 1 - (b / (O.ow + 8)) ** 2));
    const z = Math.pow(hash(i, 2, 1703), 0.8) * hmax;
    const a = 2 - hash(i, 3, 1703) * 16 * (1 - z / (hmax + 1)) - 2;
    const jog = seethe * (hash(f, i, 1704) - 0.5) * 2;
    const kind = i % 7;
    const id = 200 + (i % 20);
    if (kind === 0) R.egg([a, b + jog, z + 4], XYZ, [4, 3, 5.5], (n) => toneAt(n, RGLASS, 0.15), id);
    else if (kind === 1) R.rod([a, b - 6 + jog, z], [a - 3, b + 6 + jog, z + 3], 1.2, 1, NSTRAW, id);
    else if (kind === 2) R.egg([a, b + jog, z + 1.5], XYZ, [2.2, 2.2, 1.8], (n) => toneAt(n, ['#382a1c', '#523e28', '#6c5436', '#886c46', '#a4885c'], 0.1), id);
    else if (kind === 3) R.rod([a, b - 4 + jog, z + 1], [a - 2, b + 5 + jog, z + 2], 1.3, 1.1, ['#5e5850', '#7e7768', '#9a9282', '#b4ac9a', '#cac2ae'], id);
    else R.egg([a, b + jog, z + 3], XYZ, [8, 6, 4.5], (n, w) => (hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 1705 + i) < 0.2 ? RAGS[0] : toneAt(n, RAGS, 0.05)), id);
  }
  // a rat or two of his sat up on it, watching
  if (k > 0.9) for (let j = 0; j < 3; j++) rat(R, [-6 - j * 3, -14 + j * 13, 34 - j * 10 + seethe * 2], 0.5 + j, f, 280 + j * 2);
}
/** The iron grille, hinged at its left, its bars up and across; `open` 0 shut in the arch, 1 swung out flat to the wall. */
function grille(R: Rig, open: number): void {
  const O = OUTFALL;
  const hw = O.ow - 1;
  const ang = open * 1.62;
  const dir: V3 = [-Math.sin(ang), Math.cos(ang), 0];
  const hinge: V3 = [3 - open * 3, -hw, 0];
  const at = (u: number, z: number): V3 => [hinge[0] + dir[0] * u, hinge[1] + dir[1] * u, z];
  for (let k = 0; k <= 8; k++) {
    const u = (k / 8) * 2 * hw;
    const zt = O.oh - O.ow + Math.sqrt(Math.max(0, hw * hw - (u - hw) ** 2)) - 1;
    R.rod(at(u, 0), at(u, zt), 1.4, 1.4, IRON, 60);
  }
  for (const z of [10, 26, 42]) R.rod(at(0, z), at(2 * hw, z), 1.2, 1.2, IRON, 61);
  for (const z of [6, 34]) R.box([...at(-1, z)], XYZ, [2, 2, 3], () => IRON[1], 62);
}

const outfallCache = new Map<string, WayArt>();
/** FLOOR 12'S WAY ON, THE OUTFALL, in a back wall: shut, its film, open; leading `d` (x- or y-), standing at `at`. */
export function undercityWay(d: WayDir, at: WallAt = AT0): WayArt {
  const key = `${d}:${at.x}:${at.y}`;
  const had = outfallCache.get(key);
  if (had) return had;
  const F = OUTFALL_FILM;
  const O = OUTFALL;
  const wallO = new Rig(OW, OH, OAX, OAY, d, 0);
  const wallU = new Rig(OW, OH, OAX, OAY, d, 0);
  // the channel's water running out of the arch and away over the floor
  wallU.quad([[-44, -16, 0.4], [O.thick + 14, -16, 0.4], [O.thick + 14, 16, 0.4], [-44, 16, 0.4]], (u, v) => {
    const a = -44 + u * (O.thick + 58);
    if (a < 0 && hash(Math.floor(a / 2), Math.floor(v * 12), 1706) < -a / 44) return null;
    const rip = fr(a / 3.2 + Math.sin(v * 5) * 0.4) < 0.1 ? UWATER[4] : UWATER[2];
    return mix(rip, DARK, clamp01((a - 4) / (O.thick + 10)) * 0.92);
  }, 5);
  paintBackWall(wallO, wallU, UNDERCITY_WALL, at, O, 10, (b, z) => archStones(b, z, O, 8), (k, z) => mix(UWATER[1], UNDERCITY_WALL.deep, Math.min(1, 0.45 + k * 0.55 + z * 0.004)));
  const flood: { p0: V3; dir: number; sp: number; f0: number }[] = [];
  for (let i = 0; i < 40; i++) {
    const dir = Math.PI + (hash(i, 1, 1707) - 0.5) * 2.4;
    flood.push({ p0: [-8, (hash(i, 2, 1707) - 0.5) * 40, 0], dir, sp: 2.6 + hash(i, 3, 1707) * 2.2, f0: F.pour + Math.floor(hash(i, 4, 1707) * 24) });
  }
  const splash: Chip[] = [];
  const dust: Cloud[] = [];
  const paintFrame = (f: number): { under: Px; over: Px } => {
    const R = wallO.copy();
    const U = wallU.copy();
    const seethe = f >= F.seethe && f < F.pour ? 0.5 + ((f - F.seethe) / (F.pour - F.seethe)) * 2.5 : 0;
    const left = f < F.pour ? 1 : Math.max(0, 1 - (f - F.pour) / 30);
    const open = f < F.swing ? 0 : Math.min(1, (f - F.swing) / 8) - (f >= F.swing + 8 ? Math.sin(Math.min(1, (f - F.swing - 8) / 14) * Math.PI) * 0.06 : 0);
    grille(R, f > F.frames ? 1 : open);
    ratNest(R, f > F.frames ? 0 : left, seethe, f);
    flood.forEach((r, i) => {
      const k = f - r.f0;
      if (k < 0 || f > F.frames) return;
      const p: V3 = [r.p0[0] + Math.cos(r.dir) * r.sp * k, r.p0[1] + Math.sin(r.dir) * r.sp * k + Math.sin(k * 0.4 + i) * 3, 0];
      if (Math.hypot(p[0], p[1]) > 230) return;
      rat(R, p, r.dir + Math.sin(k * 0.4 + i) * 0.3, f, 300 + i * 2);
    });
    paintChips(R, splash, f, UWATER, 600);
    U.S.seams();
    R.S.seams();
    paintDust(R, dust, f, ['#1a2a22', '#24382c', '#2e4636', '#3a5442', '#4a6450'], ['#1a2a22', '#24382c', '#2e4636', '#3a5442', '#4a6450'], (1 << 20) + 10);
    return { under: U.S.p, over: R.S.p };
  };
  const shutPx = paintFrame(-1);
  const frames: Sprite[] = [];
  const kicks = [{ f: F.pour, k: 4 }, { f: F.swing + 8, k: 6 }];
  for (let f = 0; f < F.frames; f++) {
    if (f === F.swing + 8) {
      for (let i = 0; i < 30; i++) splash.push(chip(f, [-2, (hash(i, 1, 1708) - 0.5) * 30, 4], [-2 - hash(i, 2, 1708) * 3, (hash(i, 3, 1708) - 0.5) * 3, 2 + hash(i, 4, 1708) * 3], 1 + hash(i, 5, 1708), 1800 + i));
      for (let i = 0; i < 4; i++) dust.push(cloud(f, [-8, (hash(i, 6, 1708) - 0.5) * 30, 6], [-2, (hash(i, 7, 1708) - 0.5) * 2, 0.6], 12 + 4 * hash(i, 8, 1708), 1810 + i, 30, 6, 10));
    }
    stepChips(splash, f, () => 0);
    const p = paintFrame(f);
    frames.push(whole(p.under, p.over, OAX, OAY, OW, OH));
  }
  const film: WayFilm = { frames, fps: F.fps, jolts: kicks.map((k) => k.f), kicks: kicks.map((k) => k.k) };
  const openPx = paintFrame(F.frames + 300);
  const art: WayArt = {
    shut: { under: whole(shutPx.under, null, OAX, OAY, OW, OH), over: whole(null, shutPx.over, OAX, OAY, OW, OH) },
    film,
    open: { under: whole(openPx.under, null, OAX, OAY, OW, OH), over: whole(null, openPx.over, OAX, OAY, OW, OH) },
  };
  outfallCache.set(key, art);
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
function posternSheets(side: number): Sheet[] {
  const P = POSTERN;
  const out: Sheet[] = [];
  for (let i = side < 0 ? 0 : 100; i < (side < 0 ? 46 : 146); i++) {
    const b = (hash(i, 1, 1904) - 0.5) * 2 * (P.ow + 10);
    const z = 4 + hash(i, 2, 1904) * (P.oh + 8);
    const peel = POSTERN_FILM.peel + (1 - z / (P.oh + 12)) * 34 + hash(i, 3, 1904) * 8;
    out.push({ b, z, w: 9 + hash(i, 4, 1904) * 4, h: 11 + hash(i, 5, 1904) * 4, tilt: (hash(i, 6, 1904) - 0.5) * 0.5, t0: peel, land: [P.a0 - 4 - hash(i, 7, 1904) * 14, b * 0.8 + (hash(i, 8, 1904) - 0.5) * 10], blow: i % 6 === 0, seed: i });
  }
  return out;
}
/** A sheet as it is `k` frames after it began to peel (before: pasted flat, sagging `sag`); on the wall's face toward the floor (`side` -1) or its back (1), mirrored through the wall. */
function paintSheet(R0: Rig, s: Sheet, f: number, sag: number, side: number): void {
  const P = POSTERN;
  const M2 = 2 * P.a0 + P.thick;
  const R = { quad: (q: number[][], sh: (u: number, v: number) => string | null, id: number): void => R0.quad(side < 0 ? q : q.map(([a, b, z]) => [M2 - a, b, z]), sh, id) };
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
  // (what is behind it seen through it: it stands alone in the fields)
  paintStretch(base, { ...P, top: posternTop, face: ashlarAt }, 10);
  // the wall's fallen stones at its ends
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    base.egg([P.a0 + hash(i, 1, 1906) * P.thick, s * (P.half + 4 + hash(i, 2, 1906) * 14), 5], XYZ, [8 + hash(i, 3, 1906) * 4, 7, 5], facetOf(MSTONE, 0.05), 30 + i);
  }
  const sheets = [...posternSheets(-1).map((s) => ({ s, side: -1 })), ...posternSheets(1).map((s) => ({ s, side: 1 }))];
  const paintFrame = (f: number): Px => {
    const R = base.copy();
    const open = f < F.door ? 0 : Math.min(1, (f - F.door) / 16);
    posternDoor(R, f > F.frames ? 1 : open);
    const sag = f < F.sag ? 0 : Math.min(3, (f - F.sag) * 0.2);
    sheets.forEach(({ s, side }) => paintSheet(R, s, f < 0 ? -1e9 : f > F.frames ? 1e9 : f, f < 0 ? 0 : sag, side));
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
// FLOOR 14, THE HOUSE OF QUIET: THE STITCHED DOOR. In a back wall of the Physician's rooms, limewashed over the
// infirmary's green dado as they all are, a plain ward door in a dark green door case: the way on. SHUT: stitched shut,
// as he stitches what he has cut: great cross stitches of the Order's black thread across the gap between the door and
// its case, up both sides and over the head, knotted. AS THE PHYSICIAN DIES: the door strains against them; the stitches
// snap one after another from the top down, the cut thread whipping loose; the door falls open on the dark.

export const STITCHED: Doorway = { half: 60, thick: 40, ow: 15, oh: 66, flat: true };
export const STITCH_FILM = { frames: 110, strain: 4, snap0: 24, snapEvery: 3, door: 78, fps: 30 } as const;
/** The door case's paint, the infirmary's dark green; the door's, its green. */
const CASE: Ramp = ['#1c231a', '#2a3426', '#3b4634', '#4b5742', '#5d6a52'];
const LEAF: Ramp = ['#2a3426', '#3b4a34', '#4b5e44', '#5c7052', '#6e8262'];
const THREAD: Ramp = ['#050407', '#0a0810', '#141019', '#1e1924', '#2a2432'];
const BRASS: Ramp = ['#3a2e18', '#5e4a26', '#82683a', '#a68a50', '#c4aa6c'];

/** The door case round the opening: its colour at (b, z) on the face, if there. */
function doorCase(b: number, z: number, D: Doorway, w: number): string | null {
  const ab = Math.abs(b);
  if (z >= D.oh + w || ab >= D.ow + w) return null;
  if (z < D.oh && ab < D.ow) return null;
  // its moulding: lit along its outer edge on the left and top, dark on the right
  const edge = Math.min(D.ow + w - ab, D.oh + w - z);
  if (edge < 1.2) return b < 0 || z >= D.oh ? CASE[4] : CASE[1];
  if (z < 5) return CASE[0];
  return edge < 2.6 ? CASE[2] : CASE[3];
}
/** The stitches: each where it crosses the gap (b, z on the face), which side it bridges, and when it snaps. */
interface Stitch {
  b: number;
  z: number;
  head: boolean;
  t: number;
  seed: number;
}
function stitchesOf(): Stitch[] {
  const S = STITCHED;
  const F = STITCH_FILM;
  const out: Stitch[] = [];
  let k = 0;
  // up both sides, and over the head
  for (const s of [-1, 1]) for (let z = 8; z < S.oh - 4; z += 9) out.push({ b: s * S.ow, z, head: false, t: 0, seed: k++ });
  for (let b = -S.ow + 5; b <= S.ow - 5; b += 10) out.push({ b, z: S.oh, head: true, t: 0, seed: k++ });
  out.sort((p, q) => q.z - p.z || p.b - q.b);
  out.forEach((s, i) => (s.t = F.snap0 + Math.floor(i * F.snapEvery * 0.7) + Math.floor(hash(i, 1, 2004) * 2)));
  return out;
}
/** A stitch: a cross of thread over the gap, from the door case into the door, knotted at its middle; snapped `k` frames ago, its ends whipping and then hanging from where they were sewn. */
function paintStitch(R: Rig, s: Stitch, k: number, strain: number): void {
  const a = -0.8;
  // (across the gap: along b at the sides, along z over the head)
  const p = (u: number, w: number): V3 => (s.head ? [a, s.b + w, s.z + u] : [a, s.b + u * Math.sign(s.b), s.z + w]);
  const pull = strain * Math.sin(s.seed * 3 + k * 0.9) * 0.5;
  if (k < 0) {
    for (const sg of [-1, 1]) R.rod(p(-5 - pull, -4 * sg), p(5 + pull, 4 * sg), 0.9, 0.9, THREAD, 90 + (s.seed % 6));
    R.egg(p(0, 0), XYZ, [1.9, 1.9, 1.9], (n) => toneAt(n, THREAD, 0.25), 90 + (s.seed % 6));
    // the holes it is drawn through, pricked in the case and the door
    for (const u of [-5, 5]) for (const sg of [-1, 1]) R.egg(p(u, 4 * sg), XYZ, [0.9, 0.9, 0.9], () => THREAD[0], 96);
    return;
  }
  // snapped: each half whips back about where it was sewn, then hangs
  const sw = Math.max(0, 1 - k / 9);
  for (const [u, sg] of [[-5, -1], [5, 1]] as const) {
    const o = p(u, 4 * sg);
    const whip = Math.sin(k * 1.1 + s.seed) * 5 * sw;
    R.rod(o, [o[0] - 2 - Math.abs(whip) * 0.5, o[1] + whip * (s.head ? 1 : 0.4), o[2] - 6 + whip * (s.head ? 0.3 : 1)], 0.8, 0.6, THREAD, 97 + (s.seed % 3));
  }
}
/** The ward door: four sunk panels, a brass knob and plate; hinged on the left; `open` 0 shut in its case, 1 swung in. */
function wardDoor(R: Rig, open: number, shake: number): void {
  const S = STITCHED;
  doorLeaf(R, 7 + shake, -S.ow, 2 * S.ow, S.oh - 1, open, true, (u, v, n) => {
    const pu = u * 2;
    const pv = v * 4;
    const fu = fr(pu);
    const fv = fr(pv);
    // the stiles and rails, the panels sunk between them
    if (u < 0.08 || u > 0.92 || v < 0.05 || v > 0.95 || Math.abs(u - 0.5) < 0.05 || Math.abs(v - 0.55) < 0.04) return toneAt(n, LEAF, 0.1);
    if (fu < 0.14 || fv < 0.08) return LEAF[1];
    if (fu > 0.9 || fv > 0.92) return LEAF[3];
    // the knob and its plate
    if (Math.abs(u - 0.86) < 0.05 && Math.abs(v - 0.48) < 0.06) return BRASS[3];
    return toneAt(n, LEAF, 0.02);
  }, 80);
}

const stitchCache = new Map<string, WayArt>();
/** FLOOR 14'S WAY ON, THE STITCHED DOOR, in a back wall: shut, its film, open; leading `d` (x- or y-), at `at`, the wall's room `zone` (HQ_ZONE). */
export function houseOfQuietWay(d: WayDir, at: WallAt = AT0, zone: number = HQ_ZONE.Ward): WayArt {
  const key = `${d}:${at.x}:${at.y}:${zone}`;
  const had = stitchCache.get(key);
  if (had) return had;
  const F = STITCH_FILM;
  const S = STITCHED;
  const W = 560;
  const H = 440;
  const AX = 280;
  const AY = 330;
  const wallO = new Rig(W, H, AX, AY, d, 0);
  const wallU = new Rig(W, H, AX, AY, d, 0);
  paintBackWall(wallO, wallU, houseWall(zone), at, S, 10, (b, z) => doorCase(b, z, S, 6), (k) => mix('#121419', hexOf(HQ_DEEP), 0.5 + k * 0.5));
  const stitches = stitchesOf();
  const paintFrame = (f: number): { under: Px; over: Px } => {
    const R = wallO.copy();
    const U = wallU.copy();
    const strain = f >= F.strain && f < F.door ? 1 + (f - F.strain) * 0.06 : 0;
    const shake = f >= F.strain && f < F.door ? Math.sin(f * 1.7) * Math.min(2, strain * 0.4) : 0;
    const open = f < F.door ? 0 : Math.min(1, (f - F.door) / 10) - (f > F.door + 10 ? Math.sin(Math.min(1, (f - F.door - 10) / 10) * Math.PI) * 0.08 : 0);
    // the door: in its case while shut, swung in on the dark once open (under whoever walks in)
    wardDoor(f > F.frames || open > 0.02 ? U : R, f > F.frames ? 1 : open, shake);
    stitches.forEach((s) => paintStitch(R, s, f < 0 ? -1 : f > F.frames ? 999 : f - s.t, strain));
    U.S.seams();
    R.S.seams();
    return { under: U.S.p, over: R.S.p };
  };
  const shutPx = paintFrame(-1);
  const frames: Sprite[] = [];
  for (let f = 0; f < F.frames; f++) {
    const p = paintFrame(f);
    frames.push(whole(p.under, p.over, AX, AY, W, H));
  }
  const film: WayFilm = { frames, fps: F.fps, jolts: [F.snap0, F.door + 10], kicks: [2, 5] };
  const openPx = paintFrame(F.frames + 300);
  const art: WayArt = {
    shut: { under: whole(shutPx.under, null, AX, AY, W, H), over: whole(null, shutPx.over, AX, AY, W, H) },
    film,
    open: { under: whole(openPx.under, null, AX, AY, W, H), over: whole(null, openPx.over, AX, AY, W, H) },
  };
  stitchCache.set(key, art);
  return art;
}

// =================================================================================================
// FLOOR 15, THE GREAT LIBRARY: THE GREAT DOORS. In a back wall of the Reading Room, among its bookcases, the library's
// great doors, carved oak under a round arch in a walnut doorcase, gilt: the way out, home. SHUT: blacked out, the
// Censor's ink poured over the doors and the shelves round them, glossy and wet, run in drips, his bars struck across.
// AS THE CENSOR DIES: the ink runs and thins and drains down off them into a pool at their foot, which sinks into the
// floor; the doors swing open, and the morning's grey light pours in across the floor.

export const GREAT_DOORS: Doorway = { half: 60, thick: 40, ow: 30, oh: 100 };
export const DOORS_FILM = { frames: 130, run: 6, door: 86, fps: 30 } as const;
const WALNUT: Ramp = ['#1f1610', '#2e2117', '#3d2c1f', '#4c3828', '#5e4632'];
const GILT: Ramp = ['#4a3c22', '#6e5a32', '#8c733f', '#b39552', '#cdb070'];
const DOOR_OAK: Ramp = ['#1a130e', '#34261a', '#402f21', '#4b3828', '#5d4632'];
const MORNING: Ramp = ['#6e6c66', '#8a8780', '#a6a299', '#c0bbb0', '#d6d1c4'];
const GLOSS = '#36303f';

/** The doorcase round the arch: pilasters with gilt capitals, an archivolt with a gilt bead, a keystone carved with an open book. */
function doorcase(b: number, z: number, D: Doorway): string | null {
  const w = 9;
  if (!inArch(b, z, D.ow + w, D.oh + w, D.flat) || inArch(b, z, D.ow, D.oh, D.flat)) {
    // the plinths at the pilasters' feet, a step proud
    if (z < 10 && Math.abs(b) >= D.ow && Math.abs(b) < D.ow + w + 2) return z > 8 ? WALNUT[4] : WALNUT[2];
    return null;
  }
  const spring = D.oh - D.ow;
  if (z < spring) {
    const ab = Math.abs(b) - D.ow;
    // the capital, gilt
    if (z > spring - 7) return z > spring - 2 ? GILT[4] : GILT[2 + ((Math.floor(ab) % 2) as number)];
    // its fluting
    if (fr(ab / 3) < 0.3) return b < 0 ? WALNUT[2] : WALNUT[1];
    return b < 0 ? WALNUT[4] : WALNUT[3];
  }
  const r = Math.hypot(b, z - spring) - D.ow;
  const ang = Math.atan2(z - spring, b);
  // the keystone with its open book
  if (Math.abs(ang - Math.PI / 2) < 0.16) {
    const u = (ang - Math.PI / 2) / 0.16;
    if (r > 2 && r < 7 && Math.abs(u) < 0.8) return Math.abs(u) < 0.08 ? GILT[1] : GILT[3];
    return WALNUT[4];
  }
  if (Math.abs(r - 4.5) < 0.9) return GILT[3];
  return r < 4.5 ? WALNUT[3] : WALNUT[2];
}
/** The ink over the doors and the shelves round them, at (b, z) as it drains (`drain` 0 just poured, 1 gone): the ink, a
 * streak of its gloss running down, its lit edge, the Censor's bars struck across it; or none. */
function inkAt(b: number, z: number, drain: number, f: number): 'ink' | 'gloss' | 'edge' | 'bar' | 'barEdge' | null {
  const D = GREAT_DOORS;
  if (drain >= 1) return null;
  const col = Math.floor((b + 200) / 2);
  const wide = D.ow + 18 + hash(Math.floor((b + 200) / 5), 1, 2104) * 8;
  if (Math.abs(b) > wide) return null;
  const runnel = hash(col, 2, 2105);
  // its top: where it was poured over, ragged, lower over the shelves either side; it sinks as it drains, the runnels lagging
  const top0 = D.oh + 14 + Math.sin(b * 0.21) * 4 + (Math.abs(b) > D.ow + 12 ? -20 + runnel * 12 : runnel * 7);
  const top = top0 - drain * (top0 + 6) * (0.72 + runnel * 0.56);
  if (z > top) return null;
  if (z > top - 1.6) return 'edge';
  const bar = drain < 0.3 && Math.abs(b) < D.ow + 13 && (Math.abs(z - 34) < 4.5 || Math.abs(z - 72) < 4.5);
  if (bar) return Math.abs(z - 34) > 3.4 && Math.abs(z - 72) > 3.4 && (z - 34 > 0 || z - 72 > 0) ? 'barEdge' : 'bar';
  // the gloss in streaks running down it, moving down as it drains
  const streak = hash(col, 3, 2106) < 0.16 && fr((z + col * 7.3 + f * (0.4 + drain)) / 38) < 0.3;
  return streak ? 'gloss' : 'ink';
}
const mod = (v: number, m: number): number => ((v % m) + m) % m;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** An ordered dither's threshold at a cell, 0 to 1. */
const bayer = (i: number, j: number): number => (BAYER[mod(i, 4) * 4 + mod(j, 4)] + 0.5) / 16;

const doorsCache = new Map<string, WayArt>();
/** FLOOR 15'S WAY ON, THE GREAT DOORS, in a back wall: shut, its film, open; leading `d` (x- or y-), at `at`, the wall's room `zone` (LB_ZONE). */
export function libraryWay(d: WayDir, at: WallAt = AT0, zone: number = LB_ZONE.Reading): WayArt {
  const key = `${d}:${at.x}:${at.y}:${zone}`;
  const had = doorsCache.get(key);
  if (had) return had;
  const F = DOORS_FILM;
  const D = GREAT_DOORS;
  const W = 640;
  const H = 520;
  const AX = 320;
  const AY = 380;
  const wallO = new Rig(W, H, AX, AY, d, 0);
  const wallUdark = new Rig(W, H, AX, AY, d, 0);
  const wallUlit = new Rig(W, H, AX, AY, d, 0);
  const L = libraryWall(zone);
  paintBackWall(wallO, wallUdark, L, at, D, 10, (b, z) => doorcase(b, z, D), (k) => mix(DOOR_OAK[0], L.deep, 0.6 + k * 0.4));
  paintBackWall(new Rig(W, H, AX, AY, d, 0), wallUlit, L, at, D, 10, null, (k, z) => (k >= 1 ? (hash(Math.floor(z / 6), 1, 2110) < 0.5 ? MORNING[3] : MORNING[4]) : mix(MORNING[2], MORNING[4], k)));
  const leaves = (R: Rig, open: number): void => {
    // two leaves of carved oak, each a half of the arch, hinged at the jambs, swinging in
    for (const s of [-1, 1]) {
      const ang = open * Math.PI * 0.5 * 0.9;
      const dir: V3 = [Math.sin(ang), -s * Math.cos(ang), 0];
      const hinge: V3 = [6, s * D.ow, 0];
      const n = norm(R.V(cross(dir, [0, 0, 1]) as V3));
      R.quad([hinge, [hinge[0] + dir[0] * D.ow, hinge[1] + dir[1] * D.ow, 0], [hinge[0] + dir[0] * D.ow, hinge[1] + dir[1] * D.ow, D.oh], [hinge[0], hinge[1], D.oh]], (u, v) => {
        // the arch's head cuts its top: across the opening, how high the arch is at this part of the leaf
        const bShut = s * D.ow * (1 - u);
        const z = v * D.oh;
        if (!inArch(bShut, z, D.ow, D.oh)) return null;
        const pu = fr(u * 2);
        const pv = fr((z / D.oh) * 5);
        if (u > 0.94) return DOOR_OAK[0];
        if (pu < 0.12 || pv < 0.1) return toneAt(n, DOOR_OAK, -0.05);
        if (Math.abs(pu - 0.56) < 0.05 && Math.abs(pv - 0.55) < 0.06) return GILT[3];
        if (pu > 0.9 || pv > 0.9) return DOOR_OAK[4];
        return toneAt(n, DOOR_OAK, 0.1);
      }, 80 + (s > 0 ? 1 : 0));
      // its iron ring
      if (open < 0.05) R.rod([3, s * 4, 46], [3, s * 4, 40], 1.4, 1.4, IRON, 85);
    }
  };
  const paintFrame = (f: number): { under: Px; over: Px } => {
    const drain = f < 0 ? 0 : f > F.frames ? 1 : clamp01((f - F.run) / (F.door - F.run - 8));
    const open = f < F.door ? 0 : f > F.frames ? 1 : clamp01((f - F.door) / 20);
    const R = wallO.copy();
    const U = (open > 0 ? wallUlit : wallUdark).copy();
    // the light poured in across the floor before them, as they open
    if (open > 0) {
      U.quad([[0, -D.ow, 0.35], [-100 * open, -D.ow * 1.9, 0.35], [-100 * open, D.ow * 1.9, 0.35], [0, D.ow, 0.35]], (u, v) => {
        // solid by the doors, thinning away from them in an ordered dither, softer at its sides
        const edge = Math.min(v, 1 - v);
        const keep = 1.15 - u * 1.25 - (edge < 0.15 ? (0.15 - edge) * 3 : 0);
        if (bayer(Math.floor(u * 100), Math.floor(v * 60)) >= keep) return null;
        return u < 0.35 ? MORNING[2] : MORNING[1];
      }, 6);
    }
    leaves(open > 0 ? U : R, f > F.frames ? 1 : open);
    // THE INK over it all
    if (drain < 1) {
      R.quad([[-1.2, -D.ow - 32, 0.4], [-1.2, D.ow + 32, 0.4], [-1.2, D.ow + 32, D.oh + 30], [-1.2, -D.ow - 32, D.oh + 30]], (u, v) => {
        const b = -D.ow - 32 + u * (2 * D.ow + 64);
        const z = v * (D.oh + 30);
        const k = inkAt(b, z, drain, f);
        if (!k) return null;
        return k === 'bar' ? INK[0] : k === 'barEdge' || k === 'edge' ? INK[4] : k === 'gloss' ? GLOSS : z < 4 ? INK[1] : INK[2];
      }, 70);
    }
    // its pool at their foot, spreading as it drains, then sinking away into the floor
    const pool = f < 0 ? 0.55 : f > F.frames ? 0 : f < F.door ? 0.55 + drain * 0.65 : Math.max(0, 1.2 - (f - F.door) / 28);
    if (pool > 0) {
      const P = f < F.door || f < 0 ? R : U;
      P.egg([-10 * pool, 0, 0.45], XYZ, [14 * pool, (D.ow + 22) * pool, 0.4], (_n, w) => (hash(Math.floor(w[0]), Math.floor(w[1]), 2108) < 0.05 ? GLOSS : INK[1]), 71);
    }
    U.S.seams();
    R.S.seams();
    return { under: U.S.p, over: R.S.p };
  };
  const shutPx = paintFrame(-1);
  const frames: Sprite[] = [];
  for (let f = 0; f < F.frames; f++) {
    const p = paintFrame(f);
    frames.push(whole(p.under, p.over, AX, AY, W, H));
  }
  const film: WayFilm = { frames, fps: F.fps, jolts: [F.door + 20], kicks: [4] };
  const openPx = paintFrame(F.frames + 300);
  const art: WayArt = {
    shut: { under: whole(shutPx.under, null, AX, AY, W, H), over: whole(null, shutPx.over, AX, AY, W, H) },
    film,
    open: { under: whole(openPx.under, null, AX, AY, W, H), over: whole(null, openPx.over, AX, AY, W, H) },
  };
  doorsCache.set(key, art);
  return art;
}

// =================================================================================================
// WHERE EACH OF FLOORS 11 TO 15 BEGINS: what he came out of, behind him where he stands (`d` the way from the boss toward
// the start: it lies that way of him). Each stood `back` tiles on from the start that way, the tile he arrives on and
// every tile round it clear; floors 14's and 15's in a back wall of the floor's own (as floor 5's mouth), he coming in
// standing `back` tiles out from it.

const SW = 560;
const SH = 460;
const SAX = 280;
const SAY = 320;
function startOf(over: Rig, under: Rig | null, back: number): StartArt {
  over.S.seams();
  if (under) under.S.seams();
  return { under: whole(under ? under.S.p : new Px(SW, SH), null, SAX, SAY, SW, SH), over: whole(null, over.S.p, SAX, SAY, SW, SH), back };
}
const startCache = new Map<string, StartArt>();
function cachedStart(key: string, make: () => StartArt): StartArt {
  const had = startCache.get(key);
  if (had) return had;
  const s = make();
  startCache.set(key, s);
  return s;
}
/** How far back each stands. */
export const A2_START_BACK = { gateward: 1.5, undercity: 1.5, millrace: 1.5, house: 1.7, library: 1.7 } as const;
const CART_DEAL: Ramp = ['#2a2620', '#4a4236', '#6a604e', '#857a64', '#9c917a'];
const SACK: Ramp = ['#3e3628', '#5c5240', '#7a6e58', '#968a70', '#b0a488'];

/** FLOOR 11 BEGINS: OUT OF THE CAMP, past its barricade hauled aside: the market cart that blocked the street, on its side, dragged over to the house fronts, its wheels up; the crates and the door that were piled against it shoved over the other way; the scrapes it left on the setts. */
export function gateWardStart(d: WayDir): StartArt {
  return cachedStart('g' + d, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const U = new Rig(SW, SH, SAX, SAY, d, 0);
    // the scrapes on the setts where it was dragged, pale, along b
    for (let k = 0; k < 5; k++) {
      const a = 8 + k * 9 + hash(k, 1, 2201) * 4;
      U.quad([[a, -6, 0.3], [a + 1.4, -6, 0.3], [a + 1.4, 40, 0.3], [a, 40, 0.3]], (_u, v) => (hash(k, Math.floor(v * 20), 2202) < 0.3 + v * 0.4 ? null : '#77706e'), 10 + k);
    }
    // THE CART, on its side, its bed's floor toward the street, its wheels sticking out sideways
    R.box([30, 48, 16], XYZ, [34, 7, 16], (f, u, v, n) => {
      if (f === 3) {
        // its floor, planked along it, iron straps across
        if (Math.abs(fr(u * 3) - 0.5) < 0.03) return IRON[1];
        return toneAt(n, CART_DEAL, fr(v * 5) < 0.08 ? -0.6 : (hash(Math.floor(v * 5), 1, 2203) - 0.5) * 0.3);
      }
      return toneAt(n, CART_DEAL, fr((f < 2 ? v : u) * 4) < 0.08 ? -0.5 : 0);
    }, 20);
    for (const a of [8, 52]) {
      const c: V3 = [a, 58, 16];
      const N = 26;
      for (let k = 0; k < N; k++) {
        const t0 = (k / N) * Math.PI * 2;
        const t1 = ((k + 1) / N) * Math.PI * 2;
        const P = (t: number, r: number): number[] => [c[0] + Math.cos(t) * r, c[1], c[2] + Math.sin(t) * r];
        R.quad([P(t0, 12), P(t1, 12), P(t1, 14.5), P(t0, 14.5)], () => IRON[2], 21);
        R.quad([P(t0, 9.5), P(t1, 9.5), P(t1, 12), P(t0, 12)], () => OAK[2], 21);
      }
      for (let k = 0; k < 6; k++) {
        const t = (k / 6) * Math.PI * 2 + 0.4;
        R.rod([c[0], c[1], c[2]], [c[0] + Math.cos(t) * 10, c[1], c[2] + Math.sin(t) * 10], 1.1, 0.9, OAK, 22);
      }
      R.ball([c[0], c[1] + 1, c[2]], 2.4, IRON, 23);
    }
    // its shafts, sticking up
    R.rod([64, 44, 26], [84, 40, 56], 1.5, 1.3, CART_DEAL, 24);
    R.rod([64, 52, 26], [82, 50, 58], 1.5, 1.3, CART_DEAL, 24);
    // the crates shoved over the other way, a door leant on them, a sack
    R.box([22, -48, 9], XYZ, [12, 10, 9], (f, u, v, n) => toneAt(n, CART_DEAL, fr((f < 2 ? u : v) * 3) < 0.1 ? -0.6 : 0), 30);
    R.box([26, -46, 24], XYZ, [9, 8, 6], (f, u, v, n) => toneAt(n, CART_DEAL, fr((f < 2 ? u : v) * 2) < 0.12 ? -0.6 : 0.05), 31);
    R.box([44, -50, 7], XYZ, [8, 9, 7], (f, u, v, n) => toneAt(n, CART_DEAL, fr((f < 2 ? u : v) * 2) < 0.12 ? -0.6 : -0.05), 32);
    R.box([8, -40, 20], [[0.2, 0.98, 0], [-0.4, 0.08, 0.91], [0.89, -0.18, 0.42]], [14, 20, 1.4], (_f, u, _v, n) => toneAt(n, OAK, fr(u * 4) < 0.06 ? -0.6 : 0.05), 33);
    R.egg([4, -60, 6], XYZ, [8, 6, 6], (n, w) => (w[2] > 9 ? toneAt(n, SACK, -0.1) : toneAt(n, SACK, 0)), 34);
    return startOf(R, U, A2_START_BACK.gateward);
  });
}

/** FLOOR 12 BEGINS: AT THE FOOT OF THE LADDER down from the Crier's grate, an iron ladder going up out of sight into the shaft, the moon's light falling down it onto the wet floor round its foot. */
export function undercityStart(d: WayDir): StartArt {
  return cachedStart('u' + d, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const U = new Rig(SW, SH, SAX, SAY, d, 0);
    const MOON: Ramp = ['#4c5058', '#62666e', '#7a7e86', '#92969c', '#aeb1b4'];
    // the moon's light on the floor round its foot, and its shaft coming down
    U.quad([[-10, -34, 0.3], [70, -34, 0.3], [70, 34, 0.3], [-10, 34, 0.3]], (u, v) => {
      const r = Math.hypot((u - 0.5) * 2, (v - 0.5) * 2);
      if (bayer(Math.floor(u * 80), Math.floor(v * 68)) >= 1.25 - r * 1.3) return null;
      return r < 0.45 ? MOON[2] : MOON[1];
    }, 5);
    // a puddle by its foot
    U.egg([18, 14, 0.4], XYZ, [12, 8, 0.3], (_n, w) => (hash(Math.floor(w[0]), Math.floor(w[1]), 2211) < 0.1 ? MOON[3] : '#1a2a24'), 6);
    R.quad([[30, -22, 0], [30, 22, 0], [30, 22, 190], [30, -22, 190]], (u, v) => {
      if (bayer(Math.floor(u * 44), Math.floor(v * 190)) >= 0.42 - v * 0.2 - Math.abs(u - 0.5) * 0.5) return null;
      return v < 0.5 ? MOON[3] : MOON[2];
    }, 1 << 20);
    // THE LADDER: two rails, rungs, its feet bolted to the floor, going up into the dark of the shaft
    const up = (z: number): Ramp => {
      const k = z < 90 ? 0 : Math.min(0.92, (z - 90) / 80);
      return [mix(IRON[0], DARK, k), mix(IRON[1], DARK, k), mix(IRON[2], DARK, k), mix(IRON[3], DARK, k), mix(IRON[4], DARK, k)];
    };
    for (const b of [-10, 10]) for (let z = 0; z < 180; z += 15) R.rod([30, b, z], [30, b, z + 15.5], 1.6, 1.6, up(z), 20);
    for (let z = 10; z < 180; z += 13) R.rod([30, -10, z], [30, 10, z], 1.1, 1.1, up(z), 21);
    for (const b of [-10, 10]) R.box([30, b, 1], XYZ, [3, 3, 1], () => IRON[1], 22);
    return startOf(R, U, A2_START_BACK.undercity);
  });
}

/** FLOOR 13 BEGINS: AT THE OUTFALL'S MOUTH, a low brick arch in a bank of earth and grass at the fields' edge, the sewer's water trickling out of it through the reeds. */
export function millraceStart(d: WayDir): StartArt {
  return cachedStart('m' + d, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const U = new Rig(SW, SH, SAX, SAY, d, 0);
    const EARTH: Ramp = ['#2e2820', '#463c2e', '#5e523e', '#766a50', '#8c8064'];
    const GRASS: Ramp = ['#2c3424', '#3c4830', '#4e5c3c', '#606e48', '#727f56'];
    const BR: Ramp = ['#3a2a26', '#563c32', '#6e4c3e', '#86604c', '#9c745c'];
    const A0 = 18;
    // the trickle out of it, away over the ground
    U.quad([[-30, -7, 0.3], [A0 + 4, -7, 0.3], [A0 + 4, 7, 0.3], [-30, 7, 0.3]], (u, v) => {
      if (u < 0.4 && hash(Math.floor(u * 60), Math.floor(v * 8), 2221) < (0.4 - u) / 0.4) return null;
      return fr(u * 20 + Math.sin(v * 4) * 0.3) < 0.1 ? '#5a6e5c' : '#1c2a24';
    }, 5);
    // THE BANK: a long low mound of earth, grassed on top
    R.egg([A0 + 26, 0, -4], XYZ, [30, 76, 34], (n, w) => {
      const g = hash(Math.floor(w[0] / 2), Math.floor(w[1] / 2), 2223);
      if (n[2] > 0.55 || (n[2] > 0.3 && g < 0.5)) return toneAt(n, GRASS, (g - 0.5) * 0.4);
      return toneAt(n, EARTH, g < 0.1 ? -0.3 : 0);
    }, 20);
    // the arch's face of brick set in it, its mouth dark
    R.quad([[A0, -20, 0], [A0, 20, 0], [A0, 20, 30], [A0, -20, 30]], (u, v) => {
      const b = -20 + u * 40;
      const z = v * 30;
      if (inArch(b, z, 12, 22)) return z < 2 ? '#1c2a24' : '#0c0d10';
      if (inArch(b, z, 17, 27)) {
        const ang = Math.atan2(z - 10, b);
        return fr((ang / Math.PI) * 9) < 0.14 ? BR[0] : BR[2 + (Math.floor((ang / Math.PI) * 9) % 2)];
      }
      if (z > 26 + Math.sin(b * 0.3) * 2) return null;
      return fr(z / 5) < 0.18 || fr((b + (Math.floor(z / 5) % 2) * 5) / 10) < 0.1 ? BR[0] : BR[1];
    }, 30);
    // reeds by its mouth
    for (let i = 0; i < 14; i++) {
      const b = (i % 2 ? 1 : -1) * (12 + hash(i, 1, 2224) * 14);
      const a = A0 - 4 - hash(i, 2, 2224) * 16;
      R.rod([a, b, 0], [a - 2 + hash(i, 3, 2224) * 4, b + (hash(i, 4, 2224) - 0.5) * 6, 16 + hash(i, 5, 2224) * 14], 0.9, 0.4, GRASS, 40 + (i % 4));
    }
    return startOf(R, U, A2_START_BACK.millrace);
  });
}

/** FLOOR 14 BEGINS: AT THE INFIRMARY'S BACK DOOR, in a back wall of the floor's own: the door he came in by standing open into the dark of the yard. */
export function houseOfQuietStart(d: WayDir, at: WallAt = AT0, zone: number = HQ_ZONE.Hall): StartArt {
  return cachedStart(`h${d}:${at.x}:${at.y}:${zone}`, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const U = new Rig(SW, SH, SAX, SAY, d, 0);
    const D: Doorway = { half: 60, thick: 40, ow: 15, oh: 64, flat: true };
    paintBackWall(R, U, houseWall(zone), at, D, 10, (b, z) => doorCase(b, z, D, 6), (k, z) => (k >= 1 && z < 30 ? '#161a20' : mix('#141820', hexOf(HQ_DEEP), 0.4 + k * 0.6)));
    // the door, swung in against its jamb, open
    doorLeaf(U, 7, D.ow, 2 * D.ow, D.oh - 1, 0.95, true, (u, v, n) => {
      if (u < 0.08 || u > 0.92 || v < 0.05 || v > 0.95 || Math.abs(v - 0.55) < 0.04) return toneAt(n, LEAF, 0.05);
      return toneAt(n, LEAF, -0.05);
    }, 80);
    return startOf(R, U, A2_START_BACK.house);
  });
}

/** FLOOR 15 BEGINS: AT A SIDE DOOR OF THE LIBRARY, in a back wall of its bookcases: a narrow door in a walnut case, standing open on a dark passage. */
export function libraryStart(d: WayDir, at: WallAt = AT0, zone: number = LB_ZONE.Hall): StartArt {
  return cachedStart(`b${d}:${at.x}:${at.y}:${zone}`, () => {
    const R = new Rig(SW, SH, SAX, SAY, d, 0);
    const U = new Rig(SW, SH, SAX, SAY, d, 0);
    const D: Doorway = { half: 60, thick: 40, ow: 15, oh: 70 };
    const L = libraryWall(zone);
    paintBackWall(R, U, L, at, D, 10, (b, z) => doorcase(b, z, D), (k) => mix(DOOR_OAK[0], L.deep, 0.5 + k * 0.5));
    doorLeaf(U, 6, -D.ow, 2 * D.ow, D.oh - D.ow, 0.95, true, (_u, v, n) => (fr(v * 4) < 0.08 ? DOOR_OAK[1] : toneAt(n, DOOR_OAK, 0.05)), 80);
    return startOf(R, U, A2_START_BACK.library);
  });
}
