// Pictures of THE CARRION QUEEN'S MOVES DONE THE ACTION WAY, put together for the owner (the sheet, the film's frames): her rake, her
// gust (no drop-push: straight away from her), her dive, and the Eclipse (art/carrion_queen_action.ts, QUEEN_ACTION; what they do to
// her eyrie, art/carrion_queen_action_fx.ts), on a stand-in for her eyrie (the Ledge Road's rock, its lip and the drop past it, in the
// floor's own colours, art/ledge.ts), with the knight for size, each figure at its floor point and sorted by it, as the game sorts them;
// her flock, the game's own vultures (art/ledge_vultures.ts). Made outside a browser (tools/action_f7_queen_film.ts,
// tools/action_f7_queen_sheet.ts). Nothing of the game imports it. THE FLOOR IS A STAND-IN: the game's own eyrie is the game's.

import { Px, rgba } from '../engine/px';
import type { ActorArt } from '../art/actor_types';
import { QA_DIVE, QA_ECLIPSE, QA_GUST, QA_RAKE, f, makeQueenActionArt } from '../art/carrion_queen_action';
import { Q2_GUST, makeQueen2Art } from '../art/carrion_queen2_moves';
import { DARK_FLOOR, darkened, eclipseDark, from, gustShove, inPool, lightAt, paintDiveMarks, paintGustMarks, paintPoolRims, paintRakeMarks, paintVultureLine, poolsAt } from '../art/carrion_queen_action_fx';
import type { At, Pool } from '../art/carrion_queen_action_fx';
import { VULTURE_DIVE, vultureFrame } from '../art/ledge_vultures';
import { makeHeroArt3 } from '../art/heroes3';
import { hash } from '../art/kit';
import type { Sprite } from '../engine/px';
import { onFloor } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import { shadow, spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';
const cl01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = cl01(u);
  return k * k * (3 - 2 * k);
};
/** How long she stands before each move begins (seconds). */
export const LEAD = 0.4;
/** The way she faces on the floor seen `view` (radians on the floor's own axes): from in front, down the picture (+x); from behind, up it (-y). */
export const aimOf = (view: View): number => (view === 'front' ? 0 : -Math.PI / 2);
/** How far behind her the drop's edge is (tiles; her death's films and the game's perch, game/act1_rules/queen.ts QN.edge). */
export const EDGE = 1.715;

// ---------------------------------------------------------------------------------------------
// The figures

let QA: ActorArt | null = null;
let OLD: ActorArt | null = null;
let HERO: ActorArt | null = null;
export function figures(): { qa: ActorArt; old: ActorArt; knight: ActorArt } {
  QA ??= makeQueenActionArt();
  OLD ??= makeQueen2Art();
  HERO ??= makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt;
  return { qa: QA, old: OLD, knight: HERO };
}
const VUL = new Map<string, Laid>();
/** A vulture of her flock (the game's own): flying (`walk`, its circling) or its dive, `t` seconds in, seen `view`. */
function vulture(move: 'walk' | 'attack', t: number, view: View): Laid {
  const fps = move === 'walk' ? 16 : 30;
  const n = move === 'walk' ? 16 : Math.round(VULTURE_DIVE.long * 30);
  const i = move === 'walk' ? ((Math.floor(t * fps) % n) + n) % n : Math.max(0, Math.min(n, Math.round(t * fps)));
  const key = `${move}:${i}:${view}`;
  let l = VUL.get(key);
  if (!l) {
    l = spriteLaid(vultureFrame(move, i / fps, view) as Sprite);
    VUL.set(key, l);
  }
  return l;
}

// ---------------------------------------------------------------------------------------------
// THE STAND-IN EYRIE: the Ledge Road's rock (art/ledge.ts L_ROAD), its pale lip, and past it the drop

const ROCK = ['#4e4656', '#5a5262', '#625a6a', '#6c6474', '#766d7c', '#8a818e'];
const CRACK = '#3a3342';
const LIP = '#cfc8cc';
const FACE = ['#363048', '#4a4358', '#5a536c'];
const HAZE = ['#3e5482', '#465c8c', '#4e6696', '#5a72a2', '#667eac'];
const CLOUD = ['#7f8cab', '#98a3bd', '#b4bdcf'];
/** Smooth noise, 0 to 1 (a value at each whole point, blended between). */
function vnoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const v = (i: number, j: number): number => hash(xi + i, yi + j, 9105);
  return (v(0, 0) * (1 - sx) + v(1, 0) * sx) * (1 - sy) + (v(0, 1) * (1 - sx) + v(1, 1) * sx) * sy;
}
/** A floor point (tiles) of a scene whose middle is at (cx, cy), from a pixel of it. */
export const toFloor = (X: number, Y: number, cx: number, cy: number): [number, number] => {
  const a = (X + 0.5 - cx) / 32;
  const b = (Y + 0.5 - cy) / 16;
  return [(a + b) / 2, (b - a) / 2];
};
/**
 * THE EYRIE'S FLOOR (a stand-in): bare rock, cracked into slabs, grit lying; its lip pale where it ends; past it the drop: where the
 * drop is toward us, the cliff's face falling away under the lip; then far below, the haze and the clouds. `rock(x, y)`: how far
 * inside the rock a floor point is (tiles; below 0, past the edge); `faceDown`: whether the drop falls away toward us.
 */
export function eyrieFloor(w: number, h: number, cx: number, cy: number, rock: (x: number, y: number) => number, faceDown: boolean): Px {
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const [x, y] = toFloor(X, Y, cx, cy);
      const rag = 0.12 * Math.sin(x * 2.1 + y * 1.3) + 0.08 * Math.sin(x * 5.3 - y * 4.1) + 0.05 * Math.sin((x + y) * 11);
      const d = rock(x, y) + rag;
      if (d >= 0) {
        // (slabs of the rock, a tile and a half, turned; cracks between; grit)
        const u = x * 0.8 + y * 0.35;
        const v = y * 0.8 - x * 0.35;
        const cu = Math.floor(u / 1.4);
        const cv = Math.floor(v / 1.1 + (cu % 2) * 0.5);
        const fu = u / 1.4 - cu;
        const fv = v / 1.1 + (cu % 2) * 0.5 - cv;
        let t = 2 + Math.floor(hash(cu, cv, 9101) * 2.6);
        if (hash(X >> 2, Y >> 2, 9102) > 0.93) t = Math.max(0, t - 1);
        if (hash(X >> 1, Y >> 1, 9103) > 0.985) t = 5;
        const crack = fu < 0.025 || fv < 0.03;
        if (d < 0.12) px.set(X, Y, LIP);
        else if (d < 0.2) px.set(X, Y, ROCK[5]);
        else px.set(X, Y, crack ? CRACK : ROCK[t]);
        continue;
      }
      if (faceDown && d > -0.7) {
        // (the cliff's face under the lip, falling away toward us, streaked)
        const k = Math.floor((-d / 0.7) * 3);
        const streak = hash(X >> 2, 0, 9104) > 0.7 ? 1 : 0;
        px.set(X, Y, FACE[Math.max(0, 2 - k - streak)]);
        continue;
      }
      // (the drop: haze far below, banded, torn wisps of cloud drifting in it)
      const band = Math.max(0, Math.min(4, Math.floor((Y / h) * 4 + 0.25 * Math.sin(X / 90))));
      let c = HAZE[faceDown ? 4 - band : band];
      const cl = vnoise(X / 70, Y / 22) * 0.65 + vnoise(X / 23, Y / 9 + 7) * 0.35;
      if (cl > 0.66 && ((X >> 1) + (Y >> 1)) % 2 === 0) c = CLOUD[0];
      if (cl > 0.72) c = CLOUD[cl > 0.8 ? 2 : cl > 0.76 ? 1 : 0];
      px.set(X, Y, c);
    }
  }
  return px;
}
/** Her eyrie close up, she at its middle facing `view`'s way, the drop EDGE tiles behind her. */
export function closeFloor(view: View, w: number, h: number, cx: number, cy: number): Px {
  return eyrieFloor(w, h, cx, cy, view === 'front' ? (x) => x + EDGE : (_x, y) => EDGE - y, view === 'back');
}
/** THE WHOLE EYRIE FROM ABOVE: an arena about 17 by 20 tiles; she on its near side, seen from behind, the drop at her back. */
export const ARENA = { rx: 8.5, ry: 10 } as const;
export const QUEEN_AT: [number, number] = [-1, 6.2];
export function arenaRock(x: number, y: number): number {
  const e = (1 - Math.hypot(x / ARENA.rx, y / ARENA.ry)) * 8;
  return Math.min(e, QUEEN_AT[1] + EDGE - y);
}
export function arenaFloor(w: number, h: number, cx: number, cy: number): Px {
  return eyrieFloor(w, h, cx, cy, arenaRock, true);
}

// ---------------------------------------------------------------------------------------------
// Laying a scene, in the dark or not

interface Fig {
  at: [number, number];
  l: Laid;
  flip?: boolean;
  shadow?: number;
  /** How lit it is (1: as it is). */
  light?: number;
}
/** Lay a picture on the scene at (x, y), flipped or not, each pixel darkened to `light` (its glows kept). */
function layLit(dst: Px, src: Laid, x: number, y: number, flip = false, light = 1): void {
  const { px, ax, ay } = src;
  const x0 = Math.round(flip ? x - (px.w - ax) : x - ax);
  const y0 = Math.round(y - ay);
  const d = dst.d;
  const s = px.d;
  for (let j = 0; j < px.h; j++) {
    const Y = y0 + j;
    if (Y < 0 || Y >= dst.h) continue;
    for (let i = 0; i < px.w; i++) {
      const X = x0 + i;
      if (X < 0 || X >= dst.w) continue;
      const si = (j * px.w + (flip ? px.w - 1 - i : i)) * 4;
      const a = s[si + 3];
      if (!a) continue;
      const [r, g, b] = darkened(s[si], s[si + 1], s[si + 2], light);
      const di = (Y * dst.w + X) * 4;
      if (a >= 255) {
        d[di] = r;
        d[di + 1] = g;
        d[di + 2] = b;
      } else {
        const k = a / 255;
        d[di] = Math.round(d[di] * (1 - k) + r * k);
        d[di + 1] = Math.round(d[di + 1] * (1 - k) + g * k);
        d[di + 2] = Math.round(d[di + 2] * (1 - k) + b * k);
      }
      d[di + 3] = 255;
    }
  }
}
interface Dark {
  dark: number;
  pools: ReadonlyArray<Pool>;
}
/**
 * LAY A SCENE: the floor and its marks; in the dark, the floor darkened point by point (the pools lit) and the pools' rims; the
 * figures' shadows; then the figures from the top of the scene down, each darkened by how lit its own floor point is.
 */
function scene(base: Px, cx: number, cy: number, marks: (p: Px) => void, figs: Fig[], dk: Dark | null, shake: readonly [number, number] = [0, 0], over?: (p: Px) => void): Px {
  const p = new Px(base.w, base.h);
  p.d.set(base.d);
  marks(p);
  if (dk && dk.dark > 0) {
    const d = p.d;
    for (let Y = 0; Y < p.h; Y++) {
      for (let X = 0; X < p.w; X++) {
        const [x, y] = toFloor(X, Y, cx, cy);
        const l = lightAt(x, y, dk.dark, dk.pools);
        if (l >= 0.999) continue;
        const i = (Y * p.w + X) * 4;
        const [r, g, b] = darkened(d[i], d[i + 1], d[i + 2], l);
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
      }
    }
    if (dk.dark > 0.5) paintPoolRims(p, atOf(cx, cy), dk.pools, 0);
  }
  for (const s of figs) if (s.shadow) shadow(p, s.at[0], s.at[1], s.shadow, 1);
  for (const s of [...figs].sort((a, b) => a.at[1] - b.at[1])) layLit(p, s.l, s.at[0], s.at[1], s.flip, s.light ?? 1);
  over?.(p);
  return shaken(p, shake);
}
const atOf = (cx: number, cy: number): At => (x, y, z = 0) => {
  const [X, Y] = onFloor(x, y, cx, cy, 1);
  return [X, Y - z];
};
function shakeOf(m: number, hits: ReadonlyArray<readonly [number, number]>): [number, number] {
  let a = 0;
  for (const [at, amount] of hits) {
    const s = m - at;
    if (s >= 0 && s < 0.35) a = Math.max(a, amount * (1 - s / 0.35));
  }
  const fr = Math.floor(m * 30);
  return [2 * Math.round((hash(fr, 1, 9201) - 0.5) * a), 2 * Math.round((hash(fr, 2, 9201) - 0.5) * a)];
}
function shaken(p: Px, d: readonly [number, number]): Px {
  if (!d[0] && !d[1]) return p;
  const out = new Px(p.w, p.h);
  for (let y = 0; y < p.h; y++) {
    const sy = Math.min(p.h - 1, Math.max(0, y - d[1]));
    for (let x = 0; x < p.w; x++) {
      const sx = Math.min(p.w - 1, Math.max(0, x - d[0]));
      const i = (sy * p.w + sx) * 4;
      out.d.set(p.d.subarray(i, i + 4), (y * p.w + x) * 4);
    }
  }
  return out;
}
/** Her at `B`, a frame of `move` (`m` seconds in: before it, her stand; after it, her stand again). */
function queenAt(art: ActorArt, B: readonly [number, number], view: View, move: string, m: number, long: number, cx: number, cy: number, light = 1): Fig {
  const l = m < 0 ? frameAt(art, view, 'stand', m + 10) : m < long ? frameAt(art, view, move, m) : frameAt(art, view, 'stand', m - long);
  return { at: onFloor(B[0], B[1], cx, cy, 1), l, shadow: 30, light };
}
/** The knight at `K`: standing turned toward `B`; running along `run` (a floor way); struck (`reel` seconds in). */
function knightAt(K: readonly [number, number], B: readonly [number, number], t: number, cx: number, cy: number, act: 'stand' | { run: [number, number] } | { reel: number } = 'stand', light = 1): Fig {
  const { knight } = figures();
  const [kx, ky] = onFloor(K[0], K[1], cx, cy, 1);
  let v: View;
  let flip: boolean;
  let l: Laid;
  if (typeof act === 'object' && 'run' in act) {
    const [sx, sy] = [32 * (act.run[0] - act.run[1]), 16 * (act.run[0] + act.run[1])];
    v = sy > 0 ? 'front' : 'back';
    flip = sx < 0;
    l = frameAt(knight, v, 'walk', t);
  } else {
    const [bx, by] = onFloor(B[0], B[1], cx, cy, 1);
    v = ky < by ? 'front' : 'back';
    flip = kx > bx;
    l = typeof act === 'object' ? frameAt(knight, v, 'reel', act.reel) : frameAt(knight, v, 'stand', t);
  }
  return { at: [kx, ky], l, flip, shadow: 9, light };
}
const lerp2 = (a: readonly [number, number], b: readonly [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const B0: [number, number] = [0, 0];

// ---------------------------------------------------------------------------------------------
// HER RAKE: the knight 2.3 tiles before her. From in front he holds his ground and is raked; from behind he runs back out of the wedge.

export const RAKE_PASS = LEAD + QA_RAKE.long + 0.7;
export function rakeScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { qa } = figures();
  const m = t - LEAD;
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const K0 = from(B0, aim, 2.3, 0.2);
  let knight: Fig;
  if (view === 'front') {
    const s = m - QA_RAKE.hit;
    const K = s > 0 ? lerp2(K0, from(B0, aim, 2.8, 0.2), smooth(s / 0.25)) : K0;
    knight = s >= 0 && s < 0.45 ? knightAt(K, B0, t, cx, cy, { reel: s }) : knightAt(K, B0, t, cx, cy);
  } else {
    const K1 = from(B0, aim, 4.1, 0.4);
    const k = smooth((m - QA_RAKE.up + 0.05) / 0.45);
    const K = lerp2(K0, K1, k);
    knight = k > 0.02 && k < 0.98 ? knightAt(K, B0, t, cx, cy, { run: [K1[0] - K0[0], K1[1] - K0[1]] }) : knightAt(K, B0, t, cx, cy);
  }
  const figs = [queenAt(qa, B0, view, 'attack', m, QA_RAKE.long, cx, cy), knight];
  return scene(base, cx, cy, (p) => paintRakeMarks(p, at, B0, aim, m), figs, null, shakeOf(m, [[QA_RAKE.hit, 5]]));
}

// ---------------------------------------------------------------------------------------------
// HER GUST: the knight 2.6 tiles before her, struck and SHOVED STRAIGHT AWAY FROM HER

export const GUST_PASS = LEAD + QA_GUST.long + 0.5;
export const GUST_K = 2.6;
export function gustScene(view: View, t: number, base: Px, cx: number, cy: number, old = false): Px {
  const { qa, old: oldArt } = figures();
  const m = t - LEAD;
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const K0 = from(B0, aim, GUST_K, 0.7);
  const hit = old ? Q2_GUST.hit : QA_GUST.hit;
  const s = m - hit;
  // (straight away from her: along the line from her through him)
  const d = Math.hypot(K0[0], K0[1]);
  const shove = old ? 2.0 : gustShove(GUST_K);
  const K = s > 0 ? lerp2(K0, [K0[0] + (K0[0] / d) * shove, K0[1] + (K0[1] / d) * shove], 1 - (1 - cl01(s / QA_GUST.pushFor)) ** 2) : K0;
  const knight = s >= 0 && s < 0.5 ? knightAt(K, B0, t, cx, cy, { reel: s }) : knightAt(K, B0, t, cx, cy);
  const figs = [queenAt(old ? oldArt : qa, B0, view, 'gust', m, old ? Q2_GUST.long : QA_GUST.long, cx, cy), knight];
  return scene(base, cx, cy, (p) => (old ? undefined : paintGustMarks(p, at, B0, aim, m)), figs, null, shakeOf(m, [[hit, 4]]));
}

// ---------------------------------------------------------------------------------------------
// HER DIVE: the knight 4 tiles off, where her line ends. From in front he runs out of her ring as she hangs; from behind he is struck.

export const DIVE_PASS = LEAD + QA_DIVE.long + 0.4;
export function diveScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { qa } = figures();
  const m = t - LEAD;
  const aim = aimOf(view);
  const at = atOf(cx, cy);
  const K0 = from(B0, aim, QA_DIVE.at, 0.1);
  let knight: Fig;
  if (view === 'front') {
    const K1 = from(B0, aim, QA_DIVE.at + 0.2, -2.3);
    const k = smooth((m - QA_DIVE.hold[0]) / 0.5);
    const K = lerp2(K0, K1, k);
    knight = k > 0.02 && k < 0.98 ? knightAt(K, B0, t, cx, cy, { run: [K1[0] - K0[0], K1[1] - K0[1]] }) : knightAt(K, B0, t, cx, cy);
  } else {
    const s = m - QA_DIVE.hit;
    const K = s > 0 ? lerp2(K0, from(B0, aim, QA_DIVE.at + 1.0, 0.1), smooth(s / 0.25)) : K0;
    knight = s >= 0 && s < 0.45 ? knightAt(K, B0, t, cx, cy, { reel: s }) : knightAt(K, B0, t, cx, cy);
  }
  const figs = [queenAt(qa, B0, view, 'dive', m, QA_DIVE.long, cx, cy), knight];
  return scene(base, cx, cy, (p) => paintDiveMarks(p, at, B0, aim, m), figs, null, shakeOf(m, [[QA_DIVE.hit, 7]]));
}

// ---------------------------------------------------------------------------------------------
// THE ECLIPSE CLOSE UP: her summoning, the flock pouring over the ledge from the drop behind her, the light going; a pool of light
// drifting over the knight

export const ECLIPSE_CLOSE_PASS = LEAD + QA_ECLIPSE.hit + 2.0;
/** Her flock pouring over (`m` seconds into her Eclipse): each vulture from the drop behind her, over her, out over the ledge and up. */
function pourStood(m: number, B: readonly [number, number], aim: number, cx: number, cy: number, n: number, spread: number, light: number): Fig[] {
  const out: Fig[] = [];
  const t0 = QA_ECLIPSE.hit - 0.25;
  for (let i = 0; i < n; i++) {
    const s = m - t0 - hash(i, 1, 9301) * 0.35;
    if (s < 0 || s > 1.1) continue;
    const k = s / 1.1;
    const side = (hash(i, 2, 9301) - 0.5) * spread;
    const P0 = from(B, aim, -4, side);
    const P1 = from(B, aim, 9, side * 1.4);
    const P = lerp2(P0, P1, k);
    const z = 60 + 220 * hash(i, 3, 9301) + 120 * k * k;
    const [X, Y] = onFloor(P[0], P[1], cx, cy, 1);
    const sx = 32 * (P1[0] - P1[1] - P0[0] + P0[1]);
    const sy = 16 * (P1[0] + P1[1] - P0[0] - P0[1]);
    out.push({ at: [X, Y - z], l: vulture('walk', s + i * 0.13, sy > 0 ? 'front' : 'back'), flip: sx < 0, light });
  }
  return out;
}
/** Her flock wheeling high over the ledge in the dark (silhouettes): `n` of them round `C` (tiles), `R` tiles round. */
function wheelStood(m: number, C: readonly [number, number], R: number, cx: number, cy: number, n: number, light: number, gone = 0): Fig[] {
  const out: Fig[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + m * (0.35 + 0.15 * hash(i, 1, 9302)) * (i % 2 ? 1 : -1);
    const r = R * (0.5 + 0.5 * hash(i, 2, 9302));
    // (scattering at the end: out and up and away)
    const out2 = gone > 0 ? 1 + gone * (3 + 2 * hash(i, 4, 9302)) : 1;
    const P: [number, number] = [C[0] + Math.cos(a) * r * out2, C[1] + Math.sin(a) * r * out2];
    const z = 150 + 90 * hash(i, 3, 9302) + gone * 400;
    const [X, Y] = onFloor(P[0], P[1], cx, cy, 1);
    const va = a + (i % 2 ? Math.PI / 2 : -Math.PI / 2);
    const sx = 32 * (Math.cos(va) - Math.sin(va));
    const sy = 16 * (Math.cos(va) + Math.sin(va));
    out.push({ at: [X, Y - z], l: vulture('walk', m + i * 0.21, sy > 0 ? 'front' : 'back'), flip: sx < 0, light });
  }
  return out;
}
export function eclipseCloseScene(view: View, t: number, base: Px, cx: number, cy: number): Px {
  const { qa } = figures();
  const m = t - LEAD;
  const aim = aimOf(view);
  const dark = eclipseDark(m);
  // (the knight off to her side, where her wings do not hide him)
  const K = view === 'front' ? from(B0, aim, 3.0, 0.8) : from(B0, aim, 3.6, -1.6);
  // (a pool drifting over the knight as the dark falls)
  const s = m - QA_ECLIPSE.hit;
  const pool: Pool[] = [];
  if (s > QA_ECLIPSE.fall * 0.5) {
    const [x, y] = lerp2([K[0] + 0.5, K[1] - 0.4], [K[0] - 0.4, K[1] + 0.5], cl01(s / 3));
    pool.push({ x, y, r: QA_ECLIPSE.r, k: cl01((s - QA_ECLIPSE.fall * 0.5) / 0.3) });
  }
  const lit = (P: readonly [number, number]): number => lightAt(P[0], P[1], dark, pool);
  const figs: Fig[] = [queenAt(qa, B0, view, 'eclipse', m, QA_ECLIPSE.long, cx, cy, Math.max(0.62, lit(B0))), knightAt(K, B0, t, cx, cy, 'stand', Math.max(0.62, lit(K)))];
  figs.push(...pourStood(m, B0, aim, cx, cy, 16, 9, 0.62 + 0.38 * (1 - dark)));
  if (s > 0.6) figs.push(...wheelStood(m, from(B0, aim, 3, 0), 5, cx, cy, 8, 0.45));
  return scene(base, cx, cy, () => undefined, figs, { dark, pools: pool }, shakeOf(m, [[QA_ECLIPSE.hit, 4]]));
}

// ---------------------------------------------------------------------------------------------
// THE ECLIPSE OVER THE WHOLE EYRIE, FROM ABOVE: she at the drop's edge, seen from behind; the knight in the middle. The light goes; he
// runs into a pool of light; later he crosses the dark to another, a vulture's dive marked at him and striking where he stood; he
// stops, the next one strikes him; on into the light. The flock scatters and the light comes back.

export const ARENA_PASS = LEAD + QA_ECLIPSE.hit + QA_ECLIPSE.dark + QA_ECLIPSE.back + 0.7;
const ARENA_K0: [number, number] = [0.2, 0.0];
/** The pools over the arena at `m` seconds into her Eclipse. */
export const arenaPools = (m: number): Pool[] => poolsAt(m, ARENA.rx * 0.9, ARENA.ry * 0.75, 0.9).map((q) => ({ ...q, x: q.x + POOLS_AT[0], y: q.y + POOLS_AT[1] }));
/** (their round's middle: off to the right of her, where her wings do not hide them) */
const POOLS_AT: [number, number] = [1.4, -1.4];
/** The knight's way over the arena (`m` seconds into her Eclipse): where he is, and the way he runs (or null standing). */
interface KnightNow {
  at: [number, number];
  run: [number, number] | null;
}
let PATH: KnightNow[] | null = null;
const PATH_DT = 1 / 120;
/**
 * THE KNIGHT'S SCRIPT (seconds after the dark falls): a moment's start, then into the nearest pool (a dive marked at him on the way
 * strikes where he was); out across the dark toward the far pool, stopping on the way (the next dive finds him); on into it; and later
 * across to the last pool, a dive striking behind him.
 */
export const ARENA_LEGS: ReadonlyArray<{ go: number; v: number; stop?: readonly [number, number] }> = [
  { go: 0.5, v: 3.6 },
  { go: 2.4, v: 2.6, stop: [3.75, 4.75] },
  { go: 5.9, v: 3.4 },
];
function knightPath(): KnightNow[] {
  if (PATH) return PATH;
  const out: KnightNow[] = [];
  let K: [number, number] = [...ARENA_K0];
  const hit = QA_ECLIPSE.hit;
  let target = -1;
  let leg = -1;
  const been = new Set<number>();
  for (let m = 0; m <= ARENA_PASS + 1e-9; m += PATH_DT) {
    const pools = arenaPools(m);
    let run: [number, number] | null = null;
    const s = m - hit;
    if (pools.length) {
      // (a new leg: the nearest pool first; then the furthest he has not been to, within reach)
      while (leg + 1 < ARENA_LEGS.length && s >= ARENA_LEGS[leg + 1].go) {
        leg++;
        let best = -1;
        let bd = leg === 0 ? Infinity : -1;
        pools.forEach((q, i) => {
          if (been.has(i)) return;
          const d = Math.hypot(q.x - K[0], q.y - K[1]);
          if (leg === 0 ? d < bd : d > bd && d < 9.5) {
            bd = d;
            best = i;
          }
        });
        if (best < 0) best = target;
        target = best;
        been.add(best);
      }
    }
    if (target >= 0 && pools.length) {
      const L = ARENA_LEGS[leg];
      const q = pools[target];
      const stopped = !!L.stop && s > L.stop[0] && s < L.stop[1];
      const dx = q.x - K[0];
      const dy = q.y - K[1];
      const d = Math.hypot(dx, dy);
      const inside = d < q.r * 0.45;
      if (!stopped && !inside && d > 1e-6) {
        const step = Math.min(d, L.v * PATH_DT);
        K = [K[0] + (dx / d) * step, K[1] + (dy / d) * step];
        run = [dx / d, dy / d];
      } else if (inside) {
        // (in the light he keeps with it as it drifts)
        const q2 = arenaPools(m + PATH_DT)[target];
        if (q2) K = [K[0] + (q2.x - q.x), K[1] + (q2.y - q.y)];
      }
    }
    out.push({ at: [K[0], K[1]], run });
  }
  PATH = out;
  return out;
}
export function knightOnArena(m: number): KnightNow {
  const p = knightPath();
  return p[Math.max(0, Math.min(p.length - 1, Math.round(m / PATH_DT)))];
}
/** A vulture's dive in the dark: when its line is marked, where from, where it strikes, whether it strikes him. */
export interface Dive {
  mark: number;
  a: [number, number];
  b: [number, number];
  hits: boolean;
}
let DIVES: Dive[] | null = null;
/** THE DIVES, as the rules would have them: one every QA_ECLIPSE.every while he is outside every pool, aimed where he stands. */
export function arenaDives(): Dive[] {
  if (DIVES) return DIVES;
  const out: Dive[] = [];
  const E = QA_ECLIPSE;
  for (let T = E.hit + E.first; T < E.hit + E.dark - E.warn - 0.3; T += E.every) {
    const k = knightOnArena(T);
    if (inPool(arenaPools(T), k.at[0], k.at[1])) continue;
    // (from out over the drop or across the ledge, never through her)
    const a0 = -2.2 + out.length * 1.9;
    const dir: [number, number] = [Math.cos(a0), Math.sin(a0)];
    const a: [number, number] = [k.at[0] + dir[0] * E.from, k.at[1] + dir[1] * E.from];
    const at = knightOnArena(T + E.warn).at;
    out.push({ mark: T, a, b: [k.at[0], k.at[1]], hits: Math.hypot(at[0] - k.at[0], at[1] - k.at[1]) <= E.hitR });
  }
  DIVES = out;
  return out;
}
/** A diving vulture `s` seconds after its line was marked: circling high over where it comes in; down the line in two frames; held in the strike; pulled out and up into the dark. */
function diveStood(dv: Dive, s: number, cx: number, cy: number, light: number): { fig: Fig | null; smear: [number, number, number, number] | null } {
  const E = QA_ECLIPSE;
  const ux = dv.b[0] - dv.a[0];
  const uy = dv.b[1] - dv.a[1];
  const sx = 32 * (ux - uy);
  const sy = 16 * (ux + uy);
  const v: View = sy > 0 ? 'front' : 'back';
  const flip = sx < 0;
  const HIGH = 230;
  const [aX, aY] = onFloor(dv.a[0], dv.a[1], cx, cy, 1);
  const [bX, bY] = onFloor(dv.b[0], dv.b[1], cx, cy, 1);
  const strike = E.warn;
  if (s < strike) {
    const k = s / strike;
    return { fig: { at: [aX, aY - HIGH - 30 * (1 - k)], l: vulture(k < 0.7 ? 'walk' : 'attack', k < 0.7 ? s : 0.25 + (k - 0.7) * 0.8, v), flip, light }, smear: null };
  }
  const u = (s - strike) / f(2);
  if (u <= 1) {
    const X = aX + (bX - aX) * u;
    const Y = aY + (bY - aY) * u;
    return { fig: { at: [X, Y - HIGH * (1 - u)], l: vulture('attack', 0.62, v), flip, light: 1 }, smear: [aX, aY - HIGH, X, Y - HIGH * (1 - u)] };
  }
  const r = s - strike - f(2);
  if (r < 0.1) return { fig: { at: [bX, bY], l: vulture('attack', VULTURE_DIVE.hit, v), flip, light: 1 }, smear: r < f(1) + 1e-6 ? [aX, aY - HIGH, bX, bY] : null };
  const k = (r - 0.1) / 0.5;
  if (k > 1) return { fig: null, smear: null };
  const X = bX + (bX - aX) * 0.5 * k;
  const Y = bY + (bY - aY) * 0.5 * k;
  return { fig: { at: [X, Y - 300 * k * k], l: vulture('attack', VULTURE_DIVE.hit + 0.1 + 0.4 * k, v), flip, light: 1 - 0.4 * k }, smear: null };
}
/** A smear behind a diving vulture: after-images down its way, the newest white, then its gold and the enemy's pink. */
function smearLine(p: Px, s: [number, number, number, number]): void {
  const [x0, y0, x1, y1] = s;
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
  const cols = ['#fff6e0', '#fff0a0', '#ffb070', '#ff4f8a', '#c0206a'];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const c = cols[Math.min(4, Math.floor((1 - u) * 5))];
    for (const o of [-6, 0, 6]) {
      const X = 2 * Math.round((x0 + (x1 - x0) * u + o * (1 - u * 0.5)) / 2);
      const Y = 2 * Math.round((y0 + (y1 - y0) * u - 20 * (1 - u)) / 2);
      if (o !== 0 && hash(i, o, 9401) > 0.55) continue;
      for (let j = 0; j < 2; j++) for (let q = 0; q < 2; q++) p.set(X + q, Y + j, c);
    }
  }
}
export function eclipseArena(t: number, base: Px, cx: number, cy: number): Px {
  const { qa, knight: _k } = figures();
  void _k;
  const m = t - LEAD;
  const E = QA_ECLIPSE;
  const dark = eclipseDark(m);
  const pools = arenaPools(m);
  const at = atOf(cx, cy);
  const lit = (P: readonly [number, number]): number => lightAt(P[0], P[1], dark, pools);
  const k = knightOnArena(Math.max(0, m));
  const figs: Fig[] = [];
  // (her: at her edge, seen from behind, her Eclipse; then her stand, glaring out into the dark)
  figs.push(queenAt(qa, QUEEN_AT, 'back', 'eclipse', m, E.long, cx, cy, Math.max(0.6, lit(QUEEN_AT))));
  // (the knight: struck by a dive that finds him; else running or standing turned to her)
  const dives = arenaDives();
  const struck = dives.find((d) => d.hits && m >= d.mark + E.warn + f(2) && m < d.mark + E.warn + f(2) + 0.45);
  const kl = Math.max(0.6, lit(k.at));
  if (struck) figs.push(knightAt(k.at, QUEEN_AT, t, cx, cy, { reel: m - struck.mark - E.warn - f(2) }, kl));
  else figs.push(knightAt(k.at, QUEEN_AT, t, cx, cy, k.run ? { run: k.run } : 'stand', kl));
  // (her flock: pouring over from the drop behind her; wheeling high in the dark; scattering)
  figs.push(...pourStood(m, QUEEN_AT, -Math.PI / 2, cx, cy, 22, 14, 0.5 + 0.5 * (1 - dark)));
  const s = m - E.hit;
  if (s > 0.6) figs.push(...wheelStood(m, [0, -1], 6.5, cx, cy, 14, 0.42, cl01((s - E.dark + 0.2) / 0.8)));
  const smears: [number, number, number, number][] = [];
  for (const dv of dives) {
    const ds = m - dv.mark;
    if (ds < 0) continue;
    const { fig, smear } = diveStood(dv, ds, cx, cy, 0.6);
    if (fig) figs.push(fig);
    if (smear) smears.push(smear);
  }
  const marks = (p: Px): void => {
    for (const dv of dives) {
      const ds = m - dv.mark;
      if (ds < 0) continue;
      if (ds < E.warn + f(2)) paintVultureLine(p, at, dv.a, dv.b, ds / E.warn);
      else paintVultureLine(p, at, dv.a, dv.b, 1, (ds - E.warn - f(2)) / 0.9, dives.indexOf(dv));
    }
  };
  const hits: [number, number][] = [[E.hit, 4], ...dives.filter((d) => d.hits).map((d) => [d.mark + E.warn + f(2), 3] as [number, number])];
  return scene(base, cx, cy, marks, figs, { dark, pools }, shakeOf(m, hits), (p) => smears.forEach((q) => smearLine(p, q)));
}
void DARK_FLOOR;
void rgba;
