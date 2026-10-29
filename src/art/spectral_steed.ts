// THE PRINCESS'S SPECTRAL STEED (floor 16's boss, her ultimate). A MOCK-UP: NOT IN THE GAME. Nothing of the game imports
// this file; it is behind PRINCESS_ON (art/princess.ts, off).
//
// His words, 28 Oct, 20:29: “I was gonna say a spectral steed from the guys with pitchforks to kinda tie it all
// together.  Maybe one of her moves a spectral steed forms under her and she does like dressage jumps all over the arena
// that you have to dodge”; and “It’s her ultimate ability so it can slot into whatever that might have been.  I want it
// to last a while and you have to really dodge around a bit to not get hit.”; her sound, “Silent, but vines and hooves
// (Recommended)”.
//
// WHAT IT IS: a horse of the palace stables (the grooms' charge) made of the Hush's grey fog, as the fog wolves of the
// Pinewood are (art/fog_wolves.ts): a tall, proud horse, its neck arched high and its head drawn in as a dressage horse
// carries it; churning fog, dense at its chest and shoulders and thinning to mist at its legs, its belly and its tail;
// its mane and tail streaming off it as smoke; its eyes the enemy's pink; its hooves faint and pale. It carries her side-
// saddle, her gown falling down its left flank. Painted from its own solids, in the same painter as the swans and the
// wolves; its loose fog laid grain by grain after its edge.

import type { Px } from '../engine/px';
import { INK, RIM_ALPHA, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import type { Bit, Put } from './new_mobs3';
import type { Skin, Stage } from './skin';
import type { V3 } from './skeleton';

const D = Math.PI / 180;
const TAU = Math.PI * 2;
const fr = (t: number): number => t - Math.floor(t);
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Its fog: the Hush's own grey with the dawn's mauve in it, paler than the wolves'. */
const FOG: Ramp = ['#46424f', '#625e6e', '#86808f', '#aaa4b2', '#ccc6d2'];
const HOOF: Ramp = ['#5a5664', '#7a7686', '#9e98a8', '#c0bac8', '#dcd6e0'];
/** The mist it thins to. */
const MIST = '#c6c0cc';
const WISP = ['#dcd8e2', '#cac6d0', '#b4b0bc', '#a6a2b0', '#8e8a9a'];

// =============================================================================================
// ITS POSE

/** One leg: its upper bone's swing from hanging straight down (degrees, + forward), and its lower bone's bend from the upper's line (+ forward). */
export type LegPose = readonly [number, number];
export interface SteedPose {
  /** Where its middle is over the floor (forward, left, up), and its turn: yaw, pitch nose up, roll onto its right. */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Its neck: arched up and in (1, a dressage horse's carriage) or stretched out (0); its head turned. */
  arch: number;
  look: number;
  /** Its legs: near fore, off fore, near hind, off hind (near: its left). */
  legs: readonly [LegPose, LegPose, LegPose, LegPose];
  /** Its tail lifted (degrees), its churn (0 to 1 round), how much of it is there (1 whole; 0 not yet formed, or gone). */
  tail: number;
  churn: number;
  formed: number;
}
const LEG_TOP: readonly V3[] = [[13, 5.6, 34], [13, -5.6, 34], [-15, 5.8, 35], [-15, -5.8, 35]];
const LEG_LONG: readonly [number, number][] = [[16, 17.5], [16, 17.5], [15.5, 18.5], [15.5, 18.5]];
/** Standing square: its fore legs straight down, its hind legs a little back at the hock. */
export const STEED_STAND: SteedPose = {
  x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, arch: 1, look: 0,
  legs: [[0, 0], [0, 0], [-18, 22], [-18, 22]],
  tail: 10, churn: 0, formed: 1,
};
/** IN THE AIR, A LEAP (a capriole): its fore legs folded up under its chest, its hind legs kicked out behind; its body lifted and tipped up a little. */
export const STEED_LEAP: SteedPose = {
  x: 0, y: 0, z: 16, yaw: 0, pitch: 6, roll: 0, arch: 1, look: 0,
  legs: [[62, -130], [56, -122], [-58, -18], [-52, -24]],
  tail: 34, churn: 0, formed: 1,
};

function turn(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const [x0, y0, z0] = v;
  const cr = Math.cos(roll * D), sr = Math.sin(roll * D);
  const y1 = y0 * cr - z0 * sr;
  const z1 = y0 * sr + z0 * cr;
  // (pitch: nose up for positive)
  const cp = Math.cos(pitch * D), sp = Math.sin(pitch * D);
  const x2 = x0 * cp - z1 * sp;
  const z2 = x0 * sp + z1 * cp;
  const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D);
  return [x2 * cy - y1 * sy, x2 * sy + y1 * cy, z2];
}
/** A point of its body (its own lengths, about its middle 40 up) where it is now. */
const PIVOT: V3 = [0, 0, 40];
export function steedAt(P: SteedPose, p: V3): V3 {
  return add(add(turn(sub(p, PIVOT), P.yaw, P.pitch, P.roll), PIVOT), [P.x, P.y, P.z]);
}
const turned = (P: SteedPose, v: V3): V3 => turn(v, P.yaw, P.pitch, P.roll);
/** Where a rider sits on it: the middle of its back, just behind its withers, and its own forward, left and up there. */
export function seatOf(P: SteedPose): { at: V3; f: V3; l: V3; u: V3 } {
  return { at: steedAt(P, [2, 0, 51]), f: turned(P, [1, 0, 0]), l: turned(P, [0, 1, 0]), u: turned(P, [0, 0, 1]) };
}
/** Each leg's joints: its top, its middle joint, the end (the hoof). */
function legOf(P: SteedPose, i: number): [V3, V3, V3] {
  const [a1, a2] = P.legs[i];
  const [l1, l2] = LEG_LONG[i];
  const top = steedAt(P, LEG_TOP[i]);
  const d1 = turned(P, turn([0, 0, -1], 0, -a1, 0));
  const mid = add(top, mul(d1, l1));
  const d2 = turned(P, turn([0, 0, -1], 0, -(a1 + a2), 0));
  return [top, mid, add(mid, mul(d2, l2))];
}
/** Its neck and head: points along its crest from the withers to the poll, and its head's way (poll to muzzle). */
function neckOf(P: SteedPose): { pts: V3[]; poll: V3; muzzle: V3 } {
  const a = P.arch;
  const raw: V3[] = [
    [16, 0, 46],
    [21, 0, 52 + 3 * a],
    [25 + 2 * (1 - a), 0, 58 + 4 * a],
    [28 + 4 * (1 - a), 0, 63 + 3 * a],
    [30 + 6 * (1 - a), 0, 66 + 1 * a],
  ];
  const pts = raw.map((p) => steedAt(P, p));
  const poll = pts[pts.length - 1];
  // (its head: drawn in near upright, a dressage horse's; stretched out, level)
  const hd = turned(P, turn(norm([0.25 + 0.75 * (1 - a), 0, -0.95 * a - 0.2 * (1 - a)]), P.look, 0, 0));
  return { pts, poll, muzzle: add(poll, mul(hd, 15)) };
}

/** Its fog: pale streaks streaming back along it, churning, and darker hollows where it is thin. */
function patch(u: V3, k: number, seed: number): number {
  const x = u[0] * k + 7.3, y = u[1] * k + 3.1, z = u[2] * k + 5.7;
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number, m: number): number => hash(xi + i + 101 * (zi + m), yi + j, seed);
  const lx = (j: number, m: number): number => h(0, j, m) + (h(1, j, m) - h(0, j, m)) * s(fx);
  const ly = (m: number): number => lx(0, m) + (lx(1, m) - lx(0, m)) * s(fy);
  return ly(0) + (ly(1) - ly(0)) * s(fz);
}
function fogSkin(seed: number, churn: number, thin: number): Skin {
  const wob = Math.sin(TAU * churn * 0.5);
  return (u, tone) => {
    const streak = fr(u[0] * 0.9 + churn + 0.3 * Math.sin(u[2] * 2.6 + u[1] * 2 + seed));
    const hollow = thin > 0 && patch([u[0] + 0.35 * wob, u[1], u[2] - 0.25 * wob], 1.6, seed) > 1 - thin;
    const t = tone + (streak < 0.3 ? 1 : 0) - (hollow ? 1 : 0);
    return FOG[Math.max(0, Math.min(4, t))];
  };
}
const EYE_SKIN: Skin = (u) => {
  const r = Math.hypot(u[1], u[2]);
  return r < 0.55 ? FLAME[3] : FLAME[2];
};

/** THE STEED AS SOLIDS (`part` names are its own, prefixed `steed`). */
export function steedBits(P: SteedPose, put: Put, near: number): void {
  const W = (p: V3): V3 => steedAt(P, p);
  const ax = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  const c = P.churn;
  // ITS BODY: its barrel, its deep chest, its round haunch; its withers
  put('steedBody', 'barrel', { k: 'ball', c: W([0, 0, 40.5]), ax: ax([17, 0, 0], [0, 9.2, 0], [0, 0, 10.2]), skin: fogSkin(1, c, 0.22) });
  put('steedBody', 'chest', { k: 'ball', c: W([14, 0, 42]), ax: ax([8.5, 0, 0], [0, 9.0, 0], [0, 0, 11]), skin: fogSkin(2, c, 0.08) });
  put('steedBody', 'haunch', { k: 'ball', c: W([-15, 0, 43]), ax: ax([10, 0, 0], [0, 9.8, 0], [0, 0, 10.6]), skin: fogSkin(3, c, 0.3) });
  put('steedBody', 'withers', { k: 'ball', c: W([9, 0, 49]), ax: ax([7, 0, 0], [0, 6, 0], [0, 0, 4]), skin: fogSkin(4, c, 0.1) });
  // ITS NECK, arched high, thick at its root; ITS HEAD, drawn in
  const N = neckOf(P);
  const neckR = [7.2, 6.2, 5.2, 4.4, 3.8];
  for (let i = 0; i < N.pts.length; i++) {
    const r = neckR[i];
    put('steedNeck', 'neck', { k: 'ball', c: add(N.pts[i], turned(P, [-1.2, 0, -2.2])), ax: [turned(P, [r * 1.1, 0, 0]), turned(P, [0, r * 0.7, 0]), turned(P, [0, 0, r])], skin: fogSkin(5 + i, c, 0.05) });
  }
  const hd = norm(sub(N.muzzle, N.poll), [1, 0, 0]);
  const side = turned(P, [0, 1, 0]);
  const hup = norm(cross(side, hd), [0, 0, 1]);
  const hc = add(N.poll, mul(hd, 6.5));
  put('steedHead', 'head', { k: 'ball', c: hc, ax: [mul(hd, 8.2), mul(side, 3.2), mul(hup, 4.2)], skin: fogSkin(11, c, 0.02) });
  put('steedHead', 'muzzle', { k: 'ball', c: add(N.poll, mul(hd, 12.5)), ax: [mul(hd, 3.4), mul(side, 2.6), mul(hup, 3.0)], skin: fogSkin(12, c, 0) });
  for (const k of [-1, 1]) {
    // its ears, pricked
    const base = add(add(N.poll, mul(side, k * 1.6)), mul(hup, 1.6));
    put('steedHead', 'ears', { k: 'rod', a: base, b: add(add(base, mul(hup, 4.2)), mul(hd, -0.8)), ra: 1.0, rb: 0.3, ramp: FOG });
    // its eyes, the enemy's pink, burning
    put('steedHead', 'eyes', { k: 'ball', c: add(add(add(N.poll, mul(hd, 4.2)), mul(side, k * 3.0)), mul(hup, 1.6)), ax: [mul(hd, 0.9), mul(side, 0.6), mul(hup, 0.7)], skin: EYE_SKIN });
  }
  // ITS LEGS: fog, thinning toward its pale hooves
  for (let i = 0; i < 4; i++) {
    const [top, mid, end] = legOf(P, i);
    const part = `steedLeg${i}`;
    const far = (i % 2 === 0 ? 1 : -1) !== near;
    put(part, 'leg', { k: 'rod', a: top, b: mid, ra: i < 2 ? 3.6 : 4.4, rb: 2.4, ramp: FOG, far });
    put(part, 'leg', { k: 'ball', c: mid, ax: [[2.4, 0, 0], [0, 2.4, 0], [0, 0, 2.4]], skin: FOG, far });
    put(part, 'leg', { k: 'rod', a: mid, b: end, ra: 2.0, rb: 1.6, ramp: FOG, far });
    const d2 = norm(sub(end, mid), [0, 0, -1]);
    put(part, 'hoof', { k: 'rod', a: add(end, mul(d2, -1.2)), b: add(end, mul(d2, 1.3)), ra: 1.9, rb: 2.3, ramp: HOOF, far });
  }
}

/** ITS LOOSE FOG: its mane streaming back off its crest, its tail off its haunch, mist curling off its legs. As grains: [where, colour, size]. */
export function steedGrains(P: SteedPose, t: number, wind: V3): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const N = neckOf(P);
  const back = norm(add(turned(P, [-1, 0, 0.15]), mul(wind, 0.6)), [-1, 0, 0]);
  // the mane: along the crest, streaming back and up off it
  for (let i = 0; i < 26; i++) {
    const k = (i % 13) / 12;
    const life = fr(t * 0.9 + i * 0.137);
    const base = N.pts[Math.min(N.pts.length - 1, Math.floor(k * (N.pts.length - 1) + 0.5))];
    const p = add(add(base, turned(P, [-1.5, (i % 2 ? 1 : -1) * 1.2, 3.2])), mul(back, 2 + life * 8));
    if (life > 0.85) continue;
    out.push([add(p, [0, 0, Math.sin(life * 6 + i) * 0.8]), WISP[Math.min(4, Math.floor(life * 5))], life < 0.4 ? 3 : 2]);
  }
  // the tail: a plume of smoke streaming from its haunch
  const root = steedAt(P, [-24, 0, 47]);
  const tdir = norm(add(turned(P, turn([-1, 0, 0], 0, P.tail - 20, 0)), mul(wind, 0.5)), [-1, 0, 0]);
  for (let i = 0; i < 30; i++) {
    const life = fr(t * 0.8 + i * 0.0333 + 0.17 * hash(i, 3, 7601));
    const along2 = 2 + life * 22;
    const sway = Math.sin(t * 3 + life * 6) * 2.2 * life;
    const p = add(add(root, mul(tdir, along2)), add(turned(P, [0, sway, 0]), [0, 0, -life * life * 10]));
    if (life > 0.9) continue;
    out.push([p, WISP[Math.min(4, Math.floor(life * 5))], life < 0.5 ? 3 : 2]);
  }
  // mist curling off its legs
  for (let i = 0; i < 4; i++) {
    const [, mid, end] = legOf(P, i);
    for (let j = 0; j < 4; j++) {
      const life = fr(t * 0.7 + j * 0.25 + i * 0.13);
      const p = add(lerp(mid, end, 0.3 + 0.2 * j), add(mul(back, life * 5), [0, 0, life * 3]));
      out.push([p, WISP[2 + (j % 3)], 2]);
    }
  }
  return out;
}
const lerp = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

function noise2(x: number, y: number, seed: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number): number => hash(xi + i, yi + j, seed);
  const a = h(0, 0) + (h(1, 0) - h(0, 0)) * s(fx);
  const b = h(0, 1) + (h(1, 1) - h(0, 1)) * s(fx);
  return a + (b - a) * s(fy);
}
/**
 * MORE FOG THAN HORSE BELOW: gaps through it you can see the ground through, few at its chest and neck, more toward its
 * belly and its haunch, most at its legs; its eyes stay whole. `isSteed(i)`: whether a pixel of the picture is its (a
 * rider's are left alone). `formed`: 1 whole; less, thinner, to nothing (forming under her; fading as she dies).
 */
export function thinSteed(px: Px, st: Stage, P: SteedPose, isSteed: (i: number) => boolean): void {
  const [cx, cy] = st.at(steedAt(P, [6, 0, 46]));
  const [, by] = st.at(steedAt(P, [0, 0, 30]));
  const ang = Math.PI * P.churn;
  const ox = 1.6 * Math.cos(ang), oy = 1.6 * Math.sin(ang);
  const keep = new Set(FLAME.map((c) => c.toLowerCase()));
  const [ir, ig, ib] = [parseInt(INK.slice(1, 3), 16), parseInt(INK.slice(3, 5), 16), parseInt(INK.slice(5, 7), 16)];
  const W = px.w;
  const cut = new Uint8Array(W * px.h);
  const edgeAt = (i: number): boolean => px.d[i + 3] === RIM_ALPHA || (px.d[i] === ir && px.d[i + 1] === ig && px.d[i + 2] === ib);
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < W; x++) {
      const k = y * W + x;
      const i = k * 4;
      if (px.d[i + 3] === 0 || !isSteed(k) || (edgeAt(i) && P.formed >= 1)) continue;
      const hex = '#' + [px.d[i], px.d[i + 1], px.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
      if (keep.has(hex) && P.formed > 0.5) continue;
      // (lower is thinner: its legs mostly mist)
      const low = Math.max(0, Math.min(1.6, (y - by) / 14));
      const far = Math.min(1, Math.hypot(x - cx, y - cy) / 60);
      const thr = 0.82 - 0.28 * low - 0.1 * far - 1.2 * (1 - P.formed);
      const n = 0.78 * noise2(x * 0.24 + ox, y * 0.34 + oy, 71) + 0.22 * noise2(x * 0.6 - oy, y * 0.7 + ox, 73);
      cut[k] = n > thr + 0.08 ? 2 : n > thr ? 1 : 0;
    }
  }
  for (let pass = 0; pass < 2; pass++) {
    const was = cut.slice();
    for (let y = 0; y < px.h; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        const i = k * 4;
        if (cut[k] || px.d[i + 3] === 0 || !edgeAt(i) || !isSteed(k)) continue;
        let gone = 0;
        for (const [ax2, ay2] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + ax2, yy = y + ay2;
          if (xx >= 0 && yy >= 0 && xx < W && yy < px.h && was[yy * W + xx] === 2) gone++;
        }
        if (gone) cut[k] = 2;
      }
    }
  }
  for (let k = 0; k < W * px.h; k++) {
    const i = k * 4;
    if (cut[k] === 2 || (cut[k] === 1 && ((k % W) + Math.floor(k / W)) % 2 === 1)) px.d[i + 3] = 0;
    else if (cut[k] === 1) {
      px.d[i] = parseInt(MIST.slice(1, 3), 16);
      px.d[i + 1] = parseInt(MIST.slice(3, 5), 16);
      px.d[i + 2] = parseInt(MIST.slice(5, 7), 16);
      px.d[i + 3] = 255;
    }
  }
}
export type { Bit };
