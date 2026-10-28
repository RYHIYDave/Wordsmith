// THE BRAWLER'S BLOWS, AS THEY LAND: WHAT FLIES OFF HIS FISTS (a mock-up; nothing of the game imports it).
//
// His brief, 23 Oct 2026, by 22:07 Pacific: “Bone-crunching (Recommended)”, offered as fewer, huge blows, a freeze, a
// shockwave and a screen kick on each. His art rulebook: Animations 1, as big, wild, kinetic and weighty as it can be;
// Animations 3, each hero wild in his own way (the brawler's is the AIR HE HITS: a ring of it bursting off the fist, a
// crack of light where it lands, a streak behind a fist going fast, and for the uppercut the floor itself pushed out from
// under him in a ring of dust); Animations 4, nothing covers the hero but for a blink (thin rings, gone in a third of a
// second); what glows on a friend is cyan (Colour); effects are pixel art too, crisp (Animations 8).
//
// The freeze and the screen kick are the game's (Movement 7: everything holds a tenth of a second as a heavy blow lands);
// a film of them holds the picture and shakes it.

import type { Drawn } from './sculpt';
import { solve } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import { CYAN } from '../art/kit';
import { BRAWLER_B, brawlerPose, drawBrawlerAt } from './brawler_moves';
import type { BlowAt, BrawlerMove } from './brawler_moves';

/** One blow: where the fist is as it lands, the way it is going, how big what bursts off it grows (pixels), whether it shakes the floor under him, and whether it rolls a wave out along the floor ahead of him. */
export interface Blow {
  at: V3;
  way: V3;
  size: number;
  floor?: boolean;
  roll?: boolean;
}

/** How long what bursts off a blow lasts, seconds. */
export const BLOW_LIFE = 0.3;

export const DUST = ['#8a7a66', '#b8a88e', '#5e5246'];

const norm = (v: V3): V3 => {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** A number from 0 to 1 that is the same for the same `i` (which pixels of a fading ring are dropped). */
const hash = (i: number): number => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** A pixel of what bursts off a blow, two wide (a picture pixel is half of one of the game's: none is left alone). */
export function dot(d: Drawn, x: number, y: number, col: string): void {
  // (whole or not at all, and kept two pixels in from the picture's edge: what bursts off a blow is never cut off by it)
  x = Math.floor(x);
  y = Math.floor(y);
  if (x < 2 || y < 2 || x + 1 > d.px.w - 3 || y > d.px.h - 3) return;
  d.px.set(x, y, col);
  d.px.set(x + 1, y, col);
}

/** A ring round `c`, square to `way`, of radius `r` (in the figure's lengths), fading as `u` goes from 0 to 1. */
function ring(d: Drawn, c: V3, way: V3, r: number, u: number, seed: number): void {
  const w = norm(way);
  const a = norm(Math.abs(w[2]) < 0.9 ? cross(w, [0, 0, 1]) : cross(w, [1, 0, 0]));
  const b = cross(w, a);
  const n = Math.max(24, Math.round(r * 9));
  const col = u < 0.18 ? '#ffffff' : u < 0.5 ? CYAN[3] : CYAN[2];
  const seen = new Set<number>();
  for (let i = 0; i < n; i++) {
    // (fading: more of it dropped, in broken runs, as it goes)
    if (hash(seed + Math.floor(i / 3)) < u * 0.95 - 0.1) continue;
    const t = (i / n) * Math.PI * 2;
    const p: V3 = [c[0] + r * (a[0] * Math.cos(t) + b[0] * Math.sin(t)), c[1] + r * (a[1] * Math.cos(t) + b[1] * Math.sin(t)), c[2] + r * (a[2] * Math.cos(t) + b[2] * Math.sin(t))];
    const [x, y] = d.st.at(p);
    const k = Math.floor(y) * 10000 + Math.floor(x);
    if (seen.has(k)) continue;
    seen.add(k);
    dot(d, x, y, col);
  }
}

/** A line of pixels from one point of the picture to another (`behind`: only where nothing of him is). */
export function line(d: Drawn, x0: number, y0: number, x1: number, y1: number, col: string, behind = false): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) {
    const x = Math.floor(x0 + ((x1 - x0) * i) / n);
    const y = Math.floor(y0 + ((y1 - y0) * i) / n);
    if (behind && d.px.inside(x, y) && d.stuff[y * d.px.w + x] >= 0) continue;
    if (behind && d.px.inside(x + 1, y) && d.stuff[y * d.px.w + x + 1] >= 0) continue;
    dot(d, x, y, col);
  }
}

/** What bursts off a blow `age` seconds after it lands (nothing before, nothing after BLOW_LIFE). */
export function drawBlow(d: Drawn, b: Blow, age: number): void {
  if (age < 0 || age >= BLOW_LIFE) return;
  const u = age / BLOW_LIFE;
  const grow = 1 - (1 - u) * (1 - u);
  const R = (b.size / 1.155) * (0.25 + 1.05 * grow);
  // THE RING OF AIR bursting off the fist, square to the way it went, a little ahead of it; a second inside it for a big one
  const ahead: V3 = [b.at[0] + b.way[0] * 2, b.at[1] + b.way[1] * 2, b.at[2] + b.way[2] * 2];
  ring(d, ahead, b.way, R, u, 1);
  // (two pixels thick while it is young)
  if (u < 0.55) ring(d, ahead, b.way, R + 0.75, u, 1);
  if (b.size >= 20 && u > 0.1) {
    ring(d, ahead, b.way, R * 0.66, Math.min(1, u * 1.25), 7);
    if (u < 0.45) ring(d, ahead, b.way, R * 0.66 + 0.75, Math.min(1, u * 1.25), 7);
  }
  // THE CRACK where it lands: rays of light from the fist for the first frames, white at the heart
  if (age < 0.1) {
    const [x, y] = d.st.at(b.at);
    const rays = 10;
    const long = (b.size / 1.7) * (1 - age / 0.12) + 3;
    for (let i = 0; i < rays; i++) {
      const t = (i / rays) * Math.PI * 2 + 0.3;
      const l = long * (i % 2 ? 0.6 : 1);
      line(d, x + Math.cos(t) * 2, y + Math.sin(t) * 2, x + Math.cos(t) * (2 + l), y + Math.sin(t) * (2 + l), i % 2 ? CYAN[3] : '#ffffff');
    }
    dot(d, x - 1, y, '#ffffff');
    dot(d, x - 1, y + 1, '#ffffff');
  }
  // A WAVE ROLLED OUT ALONG THE FLOOR AHEAD OF HIM (the overhand and the haymaker): a crest of air and dust, bowed forward, running on
  // from under the blow the way it went, and grit thrown up off it
  if (b.roll) {
    const f = norm([b.way[0], b.way[1], 0.0001]);
    const s2: V3 = [-f[1], f[0], 0];
    const go = 4 + b.size * 1.6 * grow;
    const c: V3 = [b.at[0] + f[0] * go, b.at[1] + f[1] * go, 0];
    const wide = 5 + b.size * 0.5 * grow;
    const seen = new Set<number>();
    for (let row = 0; row < 3; row++) {
      const n = Math.round(wide * 6);
      for (let i = 0; i <= n; i++) {
        if (hash(70 + row * 31 + Math.floor(i / 3)) < u * 0.95 - 0.1) continue;
        const k = (i / n) * 2 - 1;
        const back = (k * k) * wide * 0.45 + row * 1.6;
        const p: V3 = [c[0] + s2[0] * k * wide - f[0] * back, c[1] + s2[1] * k * wide - f[1] * back, row === 0 ? 1.4 * (1 - u) : 0];
        const [x, y] = d.st.at(p);
        const key = Math.floor(y) * 10000 + Math.floor(x);
        if (seen.has(key)) continue;
        seen.add(key);
        dot(d, x, y, row === 0 ? (u < 0.35 ? '#ffffff' : CYAN[3]) : row === 1 ? DUST[1] : DUST[0]);
      }
    }
    for (let i = 0; i < 12; i++) {
      if (u > 0.85) continue;
      const k = hash(i + 200) * 2 - 1;
      const up = (1 - (2 * u - 1) ** 2) * (2 + 6 * hash(i + 230));
      const [x, y] = d.st.at([c[0] + s2[0] * k * wide - f[0] * 2, c[1] + s2[1] * k * wide - f[1] * 2, up]);
      dot(d, x, y, DUST[i % 3]);
      dot(d, x, y + 1, DUST[(i + 2) % 3]);
    }
  }
  // THE FLOOR PUSHED OUT FROM UNDER HIM: a ring of dust along the floor, and grit thrown up
  if (b.floor) {
    const fr = (b.size * 1.5 / 1.155) * (0.15 + 0.85 * grow);
    const seen = new Set<number>();
    const n = Math.round(fr * 10);
    for (let i = 0; i < n; i++) {
      if (hash(40 + Math.floor(i / 4)) < u * 0.95 - 0.1) continue;
      const t = (i / n) * Math.PI * 2;
      const [x, y] = d.st.at([Math.cos(t) * fr, Math.sin(t) * fr, 0]);
      const k = Math.floor(y) * 10000 + Math.floor(x);
      if (seen.has(k)) continue;
      seen.add(k);
      dot(d, x, y, u < 0.3 ? DUST[1] : DUST[0]);
      if (hash(i) < 0.35 * (1 - u)) dot(d, x, y - 1, DUST[2]);
    }
    for (let i = 0; i < 14; i++) {
      const t = hash(i + 90) * Math.PI * 2;
      const out = (0.4 + 0.6 * hash(i + 120)) * fr;
      const up = (1 - (2 * u - 1) ** 2) * (3 + 7 * hash(i + 150));
      if (u > 0.85) continue;
      const [x, y] = d.st.at([Math.cos(t) * out, Math.sin(t) * out, up]);
      dot(d, x, y, DUST[i % 3]);
      dot(d, x, y + 1, DUST[(i + 1) % 3]);
    }
  }
}

/**
 * POWER GATHERING IN A FIST (his rulebook's Animations 5, “Power you can see”): crackling light round it, more and longer
 * as `k` goes from 0 to 1, flickering from frame to frame (`seed`), white at the heart and the friend's cyan out from it.
 */
export function drawCharge(d: Drawn, at: V3, k: number, seed: number): void {
  const [x, y] = d.st.at(at);
  const rays = 3 + Math.round(7 * k);
  for (let i = 0; i < rays; i++) {
    const t = hash(seed * 13 + i) * Math.PI * 2;
    const l = 3 + 7 * k * (0.5 + hash(seed * 7 + i));
    // (a crackle: out a way, a kink, on again)
    const mx = x + Math.cos(t) * l * 0.55 + (hash(seed + i * 3) - 0.5) * 3;
    const my = y + Math.sin(t) * l * 0.55 + (hash(seed + i * 5) - 0.5) * 3;
    line(d, x + Math.cos(t) * 2.5, y + Math.sin(t) * 2.5, mx, my, i % 2 ? CYAN[3] : '#ffffff');
    line(d, mx, my, x + Math.cos(t) * l, y + Math.sin(t) * l, CYAN[2]);
  }
  if (k > 0.4) {
    const r = 4 + 3 * k;
    for (let i = 0; i < 20; i++) {
      if (hash(seed * 3 + i) < 0.45) continue;
      const t = (i / 20) * Math.PI * 2;
      dot(d, x + Math.cos(t) * r, y + Math.sin(t) * r * 0.8, CYAN[3]);
    }
  }
}

/**
 * THE PUNCH ITSELF, A SMEAR (his: “Like the wind up and wind down are big but the actual punch is lightning quick”, of a
 * moving picture of a boxer's punch, all after-images and speed lines): the arm's after-images along the way it has just
 * come, each forearm a pale bar from elbow to fist, the newest whitest; the older over everything (a blink: Animations
 * 4), the newest few behind him, so that the arm as it is now stays clear; thinned and gone a couple of frames after the
 * blow lands.
 */
export function drawSmear(d: Drawn, arms: { elbow: V3; fist: V3 }[], thin: number): void {
  const n = arms.length;
  arms.forEach((a, i) => {
    if (thin > 0 && (n - 1 - i) % (thin + 1) !== 0) return;
    const [ex, ey] = d.st.at(a.elbow);
    const [fx, fy] = d.st.at(a.fist);
    const k = i / Math.max(1, n - 1);
    const arm = k > 0.75 ? '#ffffff' : k > 0.4 ? '#efe6f2' : CYAN[3];
    const behind = k > 0.8;
    line(d, ex, ey, fx, fy, arm, behind);
    line(d, ex, ey + 1, fx, fy + 1, arm, behind);
    line(d, ex, ey + 2, fx, fy + 2, k > 0.5 ? CYAN[3] : CYAN[2], behind);
    dot(d, fx - 1, fy - 1, '#ffffff');
    dot(d, fx - 1, fy + 2, '#ffffff');
  });
}

/** SPEED LINES BURSTING FROM A BLOW for the first frames after it lands: long rays of light thrown out round where it lands, never over him. */
export function drawSpeedLines(d: Drawn, at: V3, size: number, age: number): void {
  if (age < 0 || age > 0.1) return;
  const [x, y] = d.st.at(at);
  const n = 10 + Math.round(size / 3);
  const r0 = 5 + size * 0.45 + age * 160;
  for (let i = 0; i < n; i++) {
    const t = hash(i * 7 + 3) * Math.PI * 2;
    const l = size * (0.4 + 0.6 * hash(i * 11 + 5));
    line(d, x + Math.cos(t) * r0, y + Math.sin(t) * r0 * 0.8, x + Math.cos(t) * (r0 + l), y + Math.sin(t) * (r0 + l) * 0.8, i % 3 ? '#ffffff' : CYAN[3], true);
  }
}

/** A streak behind a fist going fast: the way it has come over the last frames (oldest first), drawn as lines of light behind him (never over him). */
export function drawStreak(d: Drawn, path: V3[]): void {
  for (let i = 1; i < path.length; i++) {
    const [x0, y0] = d.st.at(path[i - 1]);
    const [x1, y1] = d.st.at(path[i]);
    if (Math.hypot(x1 - x0, y1 - y0) < 3) continue;
    line(d, x0, y0, x1, y1, i === path.length - 1 ? '#ffffff' : CYAN[3], true);
    line(d, x0, y0 + 1, x1, y1 + 1, CYAN[2], true);
  }
}


/** A point of him turned `turn` degrees to his left about the floor point under him, as a turned figure is (dev/sculpt.ts spin). */
export function turned(p: V3, turn: number): V3 {
  if (!turn) return p;
  const a = (turn * Math.PI) / 180;
  return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
}
/** Where a fist is at a moment of a move (him turned `turn`). */
function fistAt(m: BrawlerMove, hand: 'left' | 'right', t: number, turn = 0): V3 {
  const s = solve(BRAWLER_B, brawlerPose(m.motion, Math.max(0, Math.min(m.long, t))));
  return turned(hand === 'left' ? s.handL : s.handR, turn);
}
/** A blow of a move as it lands: where its fist is, the way it is going, and what bursts off it (him turned `turn`). */
export function blowOf(m: BrawlerMove, b: BlowAt, turn = 0): Blow {
  const p = fistAt(m, b.hand, b.at - 1 / 60, turn);
  const q = fistAt(m, b.hand, b.at, turn);
  return { at: q, way: norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), size: b.size, floor: b.floor, roll: b.roll };
}
/** How long before a blow lands its fist streaks. */
const STREAK = 0.12;
/** Him at a moment of a move, with a streak behind each fist going in to a blow, and what bursts off each from the moment it lands. */
export function drawPunchAt(view: GameView, m: BrawlerMove, t: number, turn = 0): Drawn {
  const d = drawBrawlerAt(view, m, t, turn);
  drawBursts(d, m, t, turn);
  return d;
}
/** The streaks and bursts of a move's blows at a moment of it, drawn on `d` (him turned `turn`). */
export function drawBursts(d: Drawn, m: BrawlerMove, t: number, turn = 0): void {
  for (const b of m.blows ?? []) {
    if (b.charge && t >= b.charge[0] && t <= b.at) drawCharge(d, fistAt(m, b.hand, t, turn), Math.min(1, (t - b.charge[0]) / (b.charge[1] - b.charge[0])), Math.round(t * 30));
    const strike = b.strike ?? 0;
    if (strike > 0) {
      // (the smear: from a frame before the strike begins to now, or to the blow once it has landed)
      const from = b.at - strike - 1 / 30;
      const to = Math.min(t, b.at);
      const age = t - b.at;
      if (t > from && age < 2.5 / 30) {
        const arms: { elbow: V3; fist: V3 }[] = [];
        const N = 10;
        for (let i = 0; i <= N; i++) {
          const u = from + ((to - from) * i) / N;
          const sk = solve(BRAWLER_B, brawlerPose(m.motion, Math.max(0, Math.min(m.long, u))));
          arms.push({ elbow: turned(b.hand === 'left' ? sk.elbowL : sk.elbowR, turn), fist: turned(b.hand === 'left' ? sk.handL : sk.handR, turn) });
        }
        drawSmear(d, arms, age > 1.5 / 30 ? 2 : age > 0.5 / 30 ? 1 : 0);
      }
    } else if (t < b.at && t > b.at - STREAK) drawStreak(d, [fistAt(m, b.hand, t - 2 / 30, turn), fistAt(m, b.hand, t - 1 / 30, turn), fistAt(m, b.hand, t, turn)]);
    if (t >= b.at) {
      const bl = blowOf(m, b, turn);
      drawBlow(d, bl, t - b.at);
      drawSpeedLines(d, bl.at, b.size, t - b.at);
    }
  }
}
