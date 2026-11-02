// FLOORS 6 TO 8'S MOBS, MORE ACTION: WHAT THEIR NEW MOVES SHARE (the art chat's helper, 1 Nov 2026; docs/mockups/action_f6/README.md).
// A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE. The smear of a strike (after-images along the way it came), the crackling
// lightning of the Chanter and the dust devil (white at its heart, the cult's violet and pink about it, never the friend's cyan),
// and a few helpers for what is laid on the floor in whole pixels. The moves themselves: art/action_f6_cult.ts (the Firepot
// Thrower's big lob, the Chanter's chain lightning), art/action_f6_golem.ts (the quarry golem's boulder roll and its hammer by
// Movement 9), art/action_f6_canyon.ts (the canyon scorpion's acid spit and its snap by Movement 9, the dust devil's twister).

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import { hash } from './kit';
import { FLAME } from './mkit';
import type { Put } from './new_mobs3';
import type { Stage } from './skin';
import { lerp3 } from './skeleton';
import type { V3 } from './skeleton';
import { floorPx } from './action_f1_fx';

export const FR = 1 / 30;
export const f = (n: number): number => n / 30;
export const TAU = Math.PI * 2;
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (k: number): number => {
  const v = clamp01(k);
  return v * v * (3 - 2 * v);
};

// =============================================================================================
// THE SMEAR OF A STRIKE

/**
 * After-images along lines of points (each line given oldest last: `n` moments from a frame and a fifth back to now): the newest
 * near white, the oldest dull and broken; the first line's newest half in the enemy's pink (its leading edge). `colours`: oldest to
 * newest. `thin`: the frame after the strike, only the newest of it, thinning.
 */
export function smearAlong(st: Stage, put: Put, lines: V3[][], thin: boolean, colours: readonly string[], lead: string = FLAME[2]): void {
  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];
    for (let i = line.length - 1; i >= 1; i--) {
      const age = i / (line.length - 1);
      if (thin && age > 0.45) continue;
      const a = line[i];
      const b = line[i - 1];
      const n = Math.max(1, Math.ceil(Math.hypot(st.at(b)[0] - st.at(a)[0], st.at(b)[1] - st.at(a)[1])));
      const c = age > 0.75 ? colours[0] : age > 0.45 ? colours[1] : age > 0.2 ? colours[2] : colours[3];
      for (let k = 0; k < n; k++) {
        if (age > 0.55 && (k + j) % 2 === 1) continue;
        put('smear', 'smear', { k: 'mote', p: lerp3(a, b, k / n), c: j === 0 && age < 0.5 && !thin ? lead : c, size: !thin && age < 0.35 && j % 2 === 1 ? 2 : 1 });
      }
    }
  }
}

// =============================================================================================
// LIGHTNING: crackling white, the cult's violet and its pink. Never cyan (the friend's).

/** Its colours: the white heart of a bolt, its pale violet, its violet, its deep violet, and the enemy's pink flecks about it. */
export const BOLT = { white: '#fff6ff', pale: '#e6c8ff', violet: '#b070ff', deep: '#6a2cc0', pink: '#ff4f8a', rose: '#ff7aa8' } as const;
/** A pen of whole pixels on a picture: each laid where asked (only where nothing is, if `under`), within its edge. */
export function pen(px: Px, under = false): (x: number, y: number, c: string) => void {
  return (x, y, c) => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 1 || Y < 1 || X >= px.w - 1 || Y >= px.h - 1) return;
    if (under && px.d[(Y * px.w + X) * 4 + 3] !== 0) return;
    px.set(X, Y, c);
  };
}
/** A round speck `r` across (whole pixels), thinned by `thin`. */
export function blob(dot2: (x: number, y: number, c: string) => void, x: number, y: number, r: number, c: string, thin = 0, seed = 0): void {
  for (let j = -Math.ceil(r); j <= Math.ceil(r); j++) {
    for (let i = -Math.ceil(r); i <= Math.ceil(r); i++) {
      if (i * i + j * j > r * r + 0.3) continue;
      if (thin > 0 && hash(Math.round(x) + i, Math.round(y) + j, seed) < thin) continue;
      dot2(x + i, y + j, c);
    }
  }
}
/**
 * THE WAY OF A BOLT from (x0, y0) to (x1, y1) on a picture: jagged, its kinks thrown out to either side of the straight way, new
 * every `flick` (a whole number: the frame it is on, so that it crackles), the middle kinks furthest out. Its points, in picture pixels.
 */
export function boltWay(x0: number, y0: number, x1: number, y1: number, seed: number, flick: number, jag = 0.22): [number, number][] {
  const L = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.max(3, Math.round(L / 7));
  const nx = -(y1 - y0) / (L || 1);
  const ny = (x1 - x0) / (L || 1);
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const off = i === 0 || i === n ? 0 : (hash(i, flick * 7 + seed, 913) - 0.5) * 2 * jag * Math.min(L, 90) * Math.sin(Math.PI * u) ** 0.6;
    out.push([x0 + (x1 - x0) * u + nx * off, y0 + (y1 - y0) * u + ny * off]);
  }
  return out;
}
/**
 * A BOLT laid on a picture: its jagged way, its heart white (`thick` 2: two pixels; 1: one), pale violet beside it, the violet and
 * the deep violet outside that, flecks of the enemy's pink thrown off its kinks, and a branch or two forking off it. `k` (0 to 1):
 * how strong it is (fading, it thins and breaks).
 */
export function layBolt(px: Px, x0: number, y0: number, x1: number, y1: number, seed: number, flick: number, k = 1, thick = 2, branches = 2): void {
  const dot2 = pen(px);
  const under = pen(px, true);
  const way = boltWay(x0, y0, x1, y1, seed, flick);
  const line = (pts: [number, number][], heart: number, strength: number, s2: number): void => {
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay)));
      for (let j = 0; j <= n; j++) {
        const x = ax + ((bx - ax) * j) / n;
        const y = ay + ((by - ay) * j) / n;
        // (fading: broken up)
        if (strength < 0.95 && hash(Math.round(x), Math.round(y), s2 + flick) > strength + 0.1) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const r = Math.max(Math.abs(dx), Math.abs(dy));
            if (r === 0 || (heart >= 2 && r === 1 && dx >= 0 && dy >= 0)) dot2(x + dx, y + dy, BOLT.white);
            else if (r === 1) under(x + dx, y + dy, strength > 0.5 ? BOLT.pale : BOLT.violet);
            else if (heart >= 2 && hash(Math.round(x) + dx, Math.round(y) + dy, s2) < 0.55) under(x + dx, y + dy, strength > 0.6 ? BOLT.violet : BOLT.deep);
          }
        }
      }
    }
  };
  line(way, thick, k, seed);
  // (forks off its kinks, short, thinner, crooked)
  for (let b = 0; b < branches; b++) {
    const i = 1 + Math.floor(hash(b, flick + seed, 917) * (way.length - 2));
    const [bx, by] = way[i];
    const L = Math.hypot(x1 - x0, y1 - y0);
    const ang = Math.atan2(y1 - y0, x1 - x0) + (hash(b, flick + seed, 919) < 0.5 ? 1 : -1) * (0.5 + 0.6 * hash(b, flick + seed, 921));
    const long = Math.min(40, 10 + L * 0.25 * hash(b, flick + seed, 923));
    line(boltWay(bx, by, bx + Math.cos(ang) * long, by + Math.sin(ang) * long, seed + 5 + b, flick, 0.35), 1, k * 0.85, seed + 31);
  }
  // (sparks of the enemy's pink thrown off its kinks)
  for (let i = 1; i < way.length - 1; i++) {
    if (hash(i, flick + seed, 927) > 0.45 * k) continue;
    const [x, y] = way[i];
    const a = hash(i, flick + seed, 929) * TAU;
    const r = 2 + 4 * hash(i, flick + seed, 931);
    dot2(x + Math.cos(a) * r, y + Math.sin(a) * r, i % 2 ? BOLT.pink : BOLT.rose);
  }
}
/** Where a bolt strikes the floor: a flash, a star of white and violet, sparks of the enemy's pink flung out, a scorch (`t` seconds after it struck; gone by 0.3 s). */
export function layStrike(px: Px, x: number, y: number, t: number, seed: number, big = 1): void {
  if (t < 0 || t > 0.3) return;
  const dot2 = pen(px);
  const under = pen(px, true);
  const k = 1 - t / 0.3;
  if (t < 0.1) {
    blob(dot2, x, y, (3 + 3 * k) * big, BOLT.white);
    blob(under, x, y, (6 + 4 * k) * big, BOLT.pale, 0.4, seed);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, -1], [0.7, -0.6], [-0.7, -0.6], [0.8, 0.4], [-0.8, 0.4]] as const) {
      for (let s = 0; s < (10 + 12 * k) * big; s++) dot2(x + dx * s, y + dy * s * 0.7, s < 6 * big ? BOLT.white : s < 12 * big ? BOLT.violet : BOLT.pink);
    }
  }
  for (let i = 0; i < 14; i++) {
    const a = hash(i, 1, seed) * TAU;
    const r = (6 + 18 * hash(i, 2, seed)) * Math.sqrt(t / 0.3) * big;
    const up = 10 * Math.sin(Math.PI * clamp01(t / 0.3)) * hash(i, 3, seed);
    if (hash(i, 4, seed) < t / 0.3) continue;
    dot2(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.5 - up, i % 3 ? BOLT.pink : BOLT.pale);
  }
}
/** A light at a bolt's heart (the cult's violet-pink: the enemy's). */
export const boltLight = (x: number, y: number, k: number): Light => ({ x, y, r: 40 + 30 * k, color: '#c060ff', a: 0.35 * k });

// =============================================================================================
// THE FLOOR, IN TILES

/** Where a floor point `x`, `y` tiles from an anchor is on a picture (picture pixels from the anchor). */
export const tileAt = (ax: number, ay: number, x: number, y: number): [number, number] => {
  const [X, Y] = floorPx(x, y);
  return [ax + X, ay + Y];
};
/** A dashed ring of the enemy's pink round a point on the floor (`r` tiles), on a picture: `k` (0 to 1) how much of it is laid. */
export function markRing(px: Px, ax: number, ay: number, r: number, k: number, colour: readonly [string, string, string] = ['#e0287a', '#ff7aa8', '#7a1058'], spin = 0): void {
  const dot2 = pen(px, true);
  const n = Math.round(r * 120);
  for (let i = 0; i < n; i++) {
    const dash = i % 6;
    if (dash >= 2 + Math.round(3 * k)) continue;
    const a = (i / n) * TAU + spin;
    const [x, y] = tileAt(ax, ay, Math.cos(a) * r, Math.sin(a) * r);
    dot2(x, y, k > 0.6 && dash === 1 ? colour[1] : colour[0]);
    dot2(x, y + 1, colour[2]);
    if (i % 3 === 0 && k > 0.3) {
      const [x2, y2] = tileAt(ax, ay, Math.cos(a) * r * 0.94, Math.sin(a) * r * 0.94);
      dot2(x2, y2, colour[2]);
    }
  }
}
/** A growing shadow under a thing in flight (`k` 0 to 1 through its flight), `big` picture pixels across at its biggest, in whole pixels of the floor's own dark. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function layShadow(px: Px, x: number, y: number, k: number, big: number, ink = '#0e0c24'): void {
  const rx = big * (0.35 + 0.65 * clamp01(k));
  const ry = rx * 0.45;
  const thick = 0.3 + 0.62 * clamp01(k);
  for (let j = -Math.ceil(ry); j <= Math.ceil(ry); j++) {
    for (let i = -Math.ceil(rx); i <= Math.ceil(rx); i++) {
      const e = (i / rx) ** 2 + (j / ry) ** 2;
      if (e > 1) continue;
      const X = Math.round(x) + i;
      const Y = Math.round(y) + j;
      if (X < 1 || Y < 1 || X >= px.w - 1 || Y >= px.h - 1) continue;
      if (BAYER[(Y & 3) * 4 + (X & 3)] / 16 < thick * (e > 0.7 ? 0.6 : 1)) px.set(X, Y, ink);
    }
  }
}
