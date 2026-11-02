// WHAT THE PHYSICIAN SENDS OUT, DONE THE ACTION WAY (the art chat's helper, 2 Nov 2026; docs/mockups/action_f14_physician). A
// MOCK-UP: NOTHING OF THE GAME IMPORTS IT, and it is behind PHYSICIAN_ACTION (art/physician_action.ts), off. Under the owner's
// Movement 9 and his rule for the enemies (28 Oct): “Start from now on, but every enemy is going to need that change eventually.  And
// bigger AOE to compensate for the extra time the player gets to evade”; his rulebook's Monsters 9 (bosses fill the arena with things
// to dance around); and his pick of 31 Oct, “Diagnosis (Recommended)”. In warm brass and pale light with the enemy's pink and gold,
// and the Hush's grey; never a friend's cyan.
//
//   THE RAP (RAP): while the cane is held up, the line to where it will come down and the star round it marked in his pink; at the
//     blow the ferrule cracks the boards, a star of cracks runs out round it, chips and dust thrown up, a ring of dust rolling out.
//   THE DRAW (LUNGE): en garde, his lane marked down the floor; at the lunge a needle of pink light thrust out down it past the quill;
//     while he draws, the word's light pulled back up it to him (the word over his head after is the game's own: drawHeldWord).
//   DIAGNOSIS (BEAM, MARK): a cone of pale light from the lens across the floor at you, following you a breath behind; the beds and
//     the pillars throw hard shadows down it (their line broken: `blocked`); a mark on the floor round you, a dial filling in the
//     enemy's pink to gold while you stand in the light, draining while you are hid; a shaft of light from the lens to it.
//   HE OPERATES (FIELD): the mark full, the field round where you stood marked out as a surgeon marks his cuts, a ring and a cross,
//     beating ever faster while he holds the wind-up; at the strike the light through the lens BURNS the cuts into the floor, the
//     field blinding white for two frames; the scorched cuts glowing after, smoking, dying away.
//   ROUNDS (RINGS): while he holds the cane up, the reach of his rings marked round him; from each rap a great ring of the Hush rolls
//     out over the floor, thick, pink motes in it.
// Each is painted onto a picture through `at` (a floor point, tiles, and a height, picture pixels, to the picture), every pixel whole;
// the beam through `iso` (the floor's own diamond: so that every pixel of the floor is lit or shadowed by its own line to the lens).

import { Px, rgba } from '../engine/px';
import { hash } from './kit';
import { FLAME } from './mkit';
import { DRAW9, DRAW9_HIT, DRAW9_HOLD, LIGHT, OP_HIT, OP_HOLD, OP_STRIKE, RAP9_HIT, RAP9_HOLD, ROUNDS9_HITS, ROUNDS9_HOLD } from './physician_action';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};
/** Where a floor point (tiles) and a height over it (picture pixels) is on the picture. */
export type At = (x: number, y: number, z?: number) => readonly [number, number];
/** The floor's diamond on the picture: a floor point (x, y) is at (cx + 32 (x - y), cy + 16 (x + y)). */
export interface Iso {
  cx: number;
  cy: number;
}
export const isoAt = (I: Iso): At => (x, y, z = 0) => [I.cx + 32 * (x - y), I.cy + 16 * (x + y) - z];
const floorOf = (I: Iso, X: number, Y: number): [number, number] => {
  const a = (X + 0.5 - I.cx) / 32;
  const b = (Y + 0.5 - I.cy) / 16;
  return [(a + b) / 2, (b - a) / 2];
};
/** Which of a picture's things to paint, by the picture row of its floor point. */
export type Keep = (floorY: number) => boolean;
export type Pt = readonly [number, number];
const dot = (p: Px, x: number, y: number, c: string, w = 1, h = 1): void => {
  const X = Math.round(x);
  const Y = Math.round(y);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (X + i >= 0 && Y + j >= 0 && X + i < p.w && Y + j < p.h) p.set(X + i, Y + j, c);
};
/** The Hush's greys (the game's), and its pale; the scorch of a burnt cut; dust and chips. */
const HUSH = ['#14121e', '#262234', '#3e3852', '#625a7a', '#9890b4'] as const;
const PALE = '#c8c2dc';
const SCORCH = ['#0a0608', '#2a1410', '#5a2a18'] as const;
const DUST = ['#4a4438', '#6e6656', '#958c78', '#b4ab94'] as const;
const INK = '#0b0910';

/** A dashed line on the floor from a to b (tiles): dashes running along it by `run`, lit by `lit` (0 to 1). */
function dashes(p: Px, at: At, a: Pt, b: Pt, lit: number, run: number, hot: boolean, step = 0.04): void {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  for (let d = 0; d <= L; d += step) {
    if ((((d * 2.2 - run) % 1) + 1) % 1 > 0.6) continue;
    const u = d / Math.max(1e-6, L);
    const [X, Y] = at(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u);
    if (lit < 0.5 && hash(Math.round(X), Math.round(Y), 7901) > lit * 2) continue;
    dot(p, X, Y, hot ? FLAME[3] : FLAME[2], 2, 2);
    dot(p, X, Y + 2, FLAME[0], 2, 1);
  }
}
/** A dashed circle on the floor round (cx, cy), `r` tiles. */
function dashedRing(p: Px, at: At, cx: number, cy: number, r: number, lit: number, run: number, hot: boolean): void {
  const n = Math.max(24, Math.round(r * 60));
  for (let i = 0; i < n; i++) {
    const u = i / n;
    if ((((u * Math.max(12, r * 9) + run) % 1) + 1) % 1 > 0.55) continue;
    const [X, Y] = at(cx + Math.cos(u * Math.PI * 2) * r, cy + Math.sin(u * Math.PI * 2) * r);
    if (lit < 0.5 && hash(i, 3, 7903) > lit * 2) continue;
    dot(p, X, Y, hot ? FLAME[3] : FLAME[2], 2, 2);
    dot(p, X, Y + 2, FLAME[0], 2, 1);
  }
}
/** The way he faces on the floor and his left, as his picture is seen (`front`: down the picture; `back`: up it), as unit floor vectors. */
export function waysOf(view: 'front' | 'back'): { fwd: Pt; left: Pt } {
  return view === 'front' ? { fwd: [1, 0], left: [0, -1] } : { fwd: [0, -1], left: [1, 0] };
}
/** A floor point `fwd` tiles before C and `left` to his left, as his picture is seen. */
export function spot(C: Pt, view: 'front' | 'back', fwd: number, left: number): [number, number] {
  const w = waysOf(view);
  return [C[0] + w.fwd[0] * fwd + w.left[0] * left, C[1] + w.fwd[1] * fwd + w.left[1] * left];
}
/** How hard a warning beats `t` seconds into it, faster as its blow comes (its dashes' run). */
const runOf = (t: number, until: number): number => t * (2 + 3 * clamp01(t / Math.max(0.1, until)));

// =============================================================================================
// THE RAP

/** Where the ferrule comes down (tiles before him and to his left: art/physician_action.ts tipAt), the star of cracks round it, the line's half-width to it; how long its marks lie. */
export const RAP = { ahead: 1.9, left: -0.15, r: 1.5, half: 0.6, lie: 0.8 } as const;
/** For the rules: whether a hero `fwd` tiles before him and `left` to his left is struck by the rap (in its line, or in the star round where it lands). */
export function rapStrikes(fwd: number, left: number): boolean {
  if (Math.hypot(fwd - RAP.ahead, left - RAP.left) <= RAP.r) return true;
  return fwd >= -0.2 && fwd <= RAP.ahead && Math.abs(left - RAP.left) <= RAP.half;
}
export function paintRap(p: Px, at: At, m: number, C: Pt, view: 'front' | 'back'): void {
  const S = spot(C, view, RAP.ahead, RAP.left);
  if (m >= RAP9_HOLD[0] - 0.15 && m < RAP9_HIT) {
    const k = clamp01((m - RAP9_HOLD[0] + 0.15) / 0.2);
    const run = runOf(m - RAP9_HOLD[0], RAP9_HIT - RAP9_HOLD[0]);
    const hot = m > RAP9_HIT - 0.2;
    dashes(p, at, spot(C, view, 0.3, RAP.left), S, k, run, hot);
    dashedRing(p, at, S[0], S[1], RAP.r * (0.4 + 0.6 * k), k, run, hot);
    dashedRing(p, at, S[0], S[1], 0.35, k, -run, true);
  }
  const s = m - RAP9_HIT;
  if (s < 0 || s > RAP.lie) return;
  const fade = 1 - s / RAP.lie;
  // the star of cracks, run out to the star's edge in a tenth of a second
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + hash(i, 0, 7911) * 0.5;
    const reach = RAP.r * (0.75 + 0.25 * hash(i, 1, 7911)) * clamp01(s / 0.1);
    let x = S[0];
    let y = S[1];
    const n = Math.ceil(reach / 0.04);
    for (let k = 0; k < n; k++) {
      const jog = (hash(i, k >> 2, 7912) - 0.5) * 0.9;
      x += Math.cos(a + jog) * 0.04;
      y += Math.sin(a + jog) * 0.04;
      if (hash(i, k, 7913) > fade + 0.15) continue;
      const [X, Y] = at(x, y);
      dot(p, X, Y, s < 0.15 ? FLAME[3] : INK, k < n * 0.4 ? 2 : 1, 1);
      if (s < 0.25 && k < n * 0.6) dot(p, X, Y - 1, FLAME[2]);
    }
  }
  // a ring of dust rolling out to the star's edge
  if (s < 0.4) {
    const r = RAP.r * smooth(s / 0.25);
    const n = Math.round(r * 70) + 12;
    for (let i = 0; i < n; i++) {
      if (hash(i, Math.floor(s * 30), 7914) < s * 1.8) continue;
      const a = (i / n) * Math.PI * 2;
      const [X, Y] = at(S[0] + Math.cos(a) * r, S[1] + Math.sin(a) * r);
      dot(p, X, Y - 2, DUST[2 + (i % 2)], 2, 1);
      dot(p, X, Y - 1, DUST[1], 2, 1);
    }
  }
  // chips and dust thrown up and down again
  if (s < 0.5) {
    const q = s / 0.5;
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996;
      const sp = 0.4 + 0.6 * hash(i, 2, 7915);
      const r = 0.1 + 0.9 * Math.sqrt(q) * sp;
      const [X, Y] = at(S[0] + Math.cos(a) * r, S[1] + Math.sin(a) * r, 26 * sp * 4 * q * (1 - q));
      dot(p, X, Y, i % 5 === 0 ? FLAME[3] : DUST[i % 4], i % 3 === 0 ? 2 : 1, 1);
    }
  }
}

// =============================================================================================
// THE DRAW

/** The lane his lunge reaches down (tiles before him), its half-width; the needle of light thrust out down it, how long it lasts. */
export const LUNGE = { to: 3.6, half: 0.65, needle: 0.25 } as const;
/** For the rules: whether a hero `fwd` before him and `left` to his left is in the lunge's lane (struck, and a word drawn out of him). */
export function drawStrikes(fwd: number, left: number): boolean {
  return fwd >= -0.2 && fwd <= LUNGE.to && Math.abs(left) <= LUNGE.half;
}
export function paintDraw(p: Px, at: At, m: number, C: Pt, view: 'front' | 'back'): void {
  const E = spot(C, view, LUNGE.to, 0);
  if (m >= DRAW9_HOLD[0] - 0.2 && m < DRAW9_HIT) {
    const k = clamp01((m - DRAW9_HOLD[0] + 0.2) / 0.25);
    const run = runOf(m - DRAW9_HOLD[0], DRAW9_HIT - DRAW9_HOLD[0]);
    const hot = m > DRAW9_HIT - 0.2;
    const L = LUNGE.to * (0.3 + 0.7 * k);
    for (const side of [-1, 1]) dashes(p, at, spot(C, view, 0.4, side * LUNGE.half), spot(C, view, L, side * LUNGE.half), k, run, hot);
    dashes(p, at, spot(C, view, L, -LUNGE.half), spot(C, view, L, LUNGE.half), k, run, true);
    // its point: a diamond at the lane's end
    const [X, Y] = at(...spot(C, view, L, 0));
    dot(p, X - 3, Y, FLAME[3], 7, 1);
    dot(p, X - 1, Y - 1, FLAME[3], 3, 3);
  }
  const s = m - DRAW9_HIT;
  // THE NEEDLE: thrust out down the lane in two frames (from the quill, 2 tiles out, to its end), then thinning
  if (s >= -1 / 30 && s < LUNGE.needle) {
    const out = clamp01((s + 1 / 30) / (2 / 30));
    const fade = 1 - clamp01(s / LUNGE.needle);
    const from = spot(C, view, 1.0, 0);
    const to: Pt = [from[0] + (E[0] - from[0]) * out, from[1] + (E[1] - from[1]) * out];
    const L = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const zq = 34;
    for (let d = 0; d <= L; d += 0.02) {
      const u = d / Math.max(1e-6, L);
      if (hash(Math.round(d * 50), 1, 7921) > fade + 0.2) continue;
      const x = from[0] + (to[0] - from[0]) * u;
      const y = from[1] + (to[1] - from[1]) * u;
      const [X, Y] = at(x, y, zq * (1 - 0.35 * (d / LUNGE.to)));
      const c = u > 0.92 ? '#fff4e8' : u > 0.6 ? FLAME[3] : FLAME[2];
      dot(p, X, Y, c, 2, 1);
      dot(p, X, Y + 1, FLAME[1], 2, 1);
    }
    // the lane flashes along the floor under it
    for (let d = 0; d <= L; d += 0.05) {
      if (hash(Math.round(d * 20), 2, 7922) > 0.6 * fade) continue;
      const u = d / Math.max(1e-6, L);
      for (const side of [-1, 1]) {
        const q = spot(C, view, 1.0 + (LUNGE.to - 1.0) * out * u, side * LUNGE.half * (0.6 + 0.4 * hash(Math.round(d * 20), 3, 7922)));
        const [X, Y] = at(...q);
        dot(p, X, Y, FLAME[2], 1, 1);
      }
    }
  }
  // THE WORD'S LIGHT pulled back up the lane to him while he draws
  if (m > DRAW9.fill[0] - 0.1 && m < DRAW9.fill[1]) {
    const k = (m - DRAW9.fill[0] + 0.1) / (DRAW9.fill[1] - DRAW9.fill[0] + 0.1);
    for (let i = 0; i < 14; i++) {
      const life = (k * 2.2 + i / 14) % 1;
      const fwd = 2.3 + (LUNGE.to - 2.3) * (1 - life);
      const [X, Y] = at(...spot(C, view, fwd, (hash(i, 4, 7923) - 0.5) * 0.3), 30 + 6 * Math.sin(life * 9 + i));
      dot(p, X, Y, life > 0.7 ? '#fff4e8' : life > 0.35 ? FLAME[3] : FLAME[2], 2, 2);
    }
  }
}

// =============================================================================================
// DIAGNOSIS: the beam, the shadows of the beds and pillars, the mark

/** What breaks the lens's line: a bed (its footprint on the floor, tiles) or a pillar (its middle and how far round). */
export type Cover = { kind: 'bed'; x0: number; y0: number; x1: number; y1: number } | { kind: 'pillar'; x: number; y: number; r: number };
/**
 * THE BEAM: half the cone's width (radians), how far it reaches (tiles); how far behind you its middle swings (seconds: it follows
 * you a breath behind); how long it takes to fill the mark while you stand in its light, and to drain it while you are hid
 * (seconds, the whole of it); the mark's size round you (tiles).
 */
export const BEAM = { half: 0.26, reach: 18, lag: 0.22, fill: 2.2, drain: 1.6, ring: 0.85 } as const;
/** Whether the line from a to b (floor points, tiles) is broken by any of the cover. */
export function blocked(a: Pt, b: Pt, cover: ReadonlyArray<Cover>): boolean {
  for (const c of cover) {
    if (c.kind === 'pillar') {
      // (the nearest point of the line to the pillar's middle)
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const L2 = dx * dx + dy * dy || 1e-9;
      const u = clamp01(((c.x - a[0]) * dx + (c.y - a[1]) * dy) / L2);
      if (Math.hypot(a[0] + dx * u - c.x, a[1] + dy * u - c.y) < c.r) return true;
    } else {
      // (the line clipped to the bed's box: Liang-Barsky)
      let t0 = 0;
      let t1 = 1;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const clip = (p0: number, q0: number): boolean => {
        if (Math.abs(p0) < 1e-12) return q0 >= 0;
        const r = q0 / p0;
        if (p0 < 0) {
          if (r > t1) return false;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return false;
          if (r < t1) t1 = r;
        }
        return true;
      };
      if (clip(-dx, a[0] - c.x0) && clip(dx, c.x1 - a[0]) && clip(-dy, a[1] - c.y0) && clip(dy, c.y1 - a[1]) && t0 <= t1) return true;
    }
  }
  return false;
}
/** Whether a floor point is in the beam's cone (from `L`, its middle the way `aim`, radians) and within its reach. */
export function inCone(L: Pt, aim: number, q: Pt): boolean {
  const dx = q[0] - L[0];
  const dy = q[1] - L[1];
  const d = Math.hypot(dx, dy);
  if (d > BEAM.reach || d < 0.3) return false;
  let a = Math.atan2(dy, dx) - aim;
  a -= Math.PI * 2 * Math.round(a / (Math.PI * 2));
  return Math.abs(a) <= BEAM.half;
}
/** For the rules: whether the hero at `h` stands in the light (in the cone, his line to the lens unbroken). */
export function inLight(L: Pt, aim: number, h: Pt, cover: ReadonlyArray<Cover>): boolean {
  return inCone(L, aim, h) && !blocked(L, h, cover);
}
/**
 * THE DIAGNOSIS FOLLOWED THROUGH, from when the beam comes on (`from`, seconds) to `m`: where its middle points (swinging after
 * the hero a breath behind, from pointing at him as it comes on), how full the mark is, whether he stands in the light, and when the
 * mark came full (or null). `hero(t)`: where he is at each moment.
 */
export function diagnosis(L: Pt, hero: (t: number) => Pt, from: number, m: number, cover: ReadonlyArray<Cover>): { aim: number; fill: number; lit: boolean; full: number | null } {
  const dt = 1 / 60;
  const h0 = hero(from);
  let aim = Math.atan2(h0[1] - L[1], h0[0] - L[0]);
  let fill = 0;
  let lit = false;
  let full: number | null = null;
  for (let t = from; t <= m + 1e-9; t += dt) {
    const h = hero(t);
    let want = Math.atan2(h[1] - L[1], h[0] - L[0]) - aim;
    want -= Math.PI * 2 * Math.round(want / (Math.PI * 2));
    aim += want * (1 - Math.exp(-dt / BEAM.lag));
    lit = inLight(L, aim, h, cover);
    if (full === null) {
      fill = clamp01(fill + (lit ? dt / BEAM.fill : -dt / BEAM.drain));
      if (fill >= 1) full = t;
    }
  }
  return { aim, fill, lit, full };
}
/** Floor colours lit by the lens's pale light, and laid in its shadow. */
const mixHex = (a: string, b: string, k: number): string => {
  const A = rgba(a);
  const B = rgba(b);
  const c = [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * k));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};
/**
 * THE BEAM ON THE FLOOR: every pixel of the floor in the cone lit pale (warmer toward its middle and near the lens, a fine dither
 * at its edges), or in hard shadow where a bed or a pillar breaks its line to the lens; its two edges a line of brass-gold.
 * `on`: how far it has come on (0 to 1); `only`: where the floor is (the room's own floor, not its walls).
 */
export function paintBeam(p: Px, I: Iso, L: Pt, aim: number, cover: ReadonlyArray<Cover>, on: number, only: (x: number, y: number) => boolean): void {
  if (on <= 0.01) return;
  const cache = new Map<string, string>();
  for (let Y = 0; Y < p.h; Y++) {
    for (let X = 0; X < p.w; X++) {
      const q = floorOf(I, X, Y);
      if (!only(q[0], q[1])) continue;
      const dx = q[0] - L[0];
      const dy = q[1] - L[1];
      const d = Math.hypot(dx, dy);
      if (d > BEAM.reach * on || d < 0.25) continue;
      let a = Math.atan2(dy, dx) - aim;
      a -= Math.PI * 2 * Math.round(a / (Math.PI * 2));
      const off = Math.abs(a) / BEAM.half;
      if (off > 1) continue;
      const i = (Y * p.w + X) * 4;
      const was = p.d[i + 3] ? '#' + [p.d[i], p.d[i + 1], p.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('') : '#1c1611';
      const edge = off > 0.94;
      const shade = blocked(L, q, cover);
      let c: string;
      if (edge && !shade) c = off > 0.98 ? '#8a6a2c' : '#c8a050';
      else if (shade) {
        const key = `s${was}`;
        c = cache.get(key) ?? mixHex(was, '#050407', 0.55);
        cache.set(key, c);
      } else {
        // (warmer in its middle and nearer the lens; dithered out toward its edges and far off)
        const strong = (1 - off * off) * (1 - 0.45 * clamp01(d / BEAM.reach)) * on;
        if (off > 0.75 && hash(X, Y, 7931) > (1 - off) * 4) continue;
        const k = strong > 0.75 ? 0.62 : strong > 0.5 ? 0.5 : strong > 0.25 ? 0.38 : 0.26;
        const key = `l${was}${k}`;
        c = cache.get(key) ?? mixHex(was, strong > 0.6 ? LIGHT.warm : LIGHT.pale, k);
        cache.set(key, c);
      }
      p.set(X, Y, c);
    }
  }
}
/** THE SHAFT: the lens's light through the air from the lens (picture point) to where it falls (picture point): a fine dither of pale, so that what it passes over shows through. */
export function paintShaft(p: Px, from: Pt, to: Pt, k: number, wide = 6): void {
  if (k <= 0.02) return;
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const nx = -(to[1] - from[1]) / Math.max(1e-6, L);
  const ny = (to[0] - from[0]) / Math.max(1e-6, L);
  for (let d = 0; d <= L; d += 1) {
    const u = d / Math.max(1e-6, L);
    const w = 1 + wide * u;
    for (let s = -w; s <= w; s += 1) {
      if (hash(Math.round(d), Math.round(s + 50), 7933) > 0.2 * k * (1 - Math.abs(s) / (w + 1))) continue;
      dot(p, from[0] + (to[0] - from[0]) * u + nx * s, from[1] + (to[1] - from[1]) * u + ny * s, Math.abs(s) < w * 0.3 ? LIGHT.white : LIGHT.pale);
    }
  }
}
/** THE MARK round the hero at (x, y): a ring, its reticle's four ticks, a dial filling in his pink to gold (`fill`); bright and turning while he stands in the light (`lit`), dim and dashed while he is hid. */
export function paintMark(p: Px, at: At, x: number, y: number, fill: number, lit: boolean, t: number): void {
  const R = BEAM.ring;
  const n = 72;
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const a = u * Math.PI * 2 - Math.PI / 2;
    const [X, Y] = at(x + Math.cos(a) * R, y + Math.sin(a) * R);
    const filled = u < fill;
    if (!lit && !filled && i % 3 === 2) continue;
    const c = filled ? (u > 0.85 ? FLAME[4] : u > 0.5 ? FLAME[3] : FLAME[2]) : lit ? LIGHT.pale : HUSH[3];
    dot(p, X, Y, c, 2, 2);
    dot(p, X, Y + 2, filled ? FLAME[0] : INK, 2, 1);
  }
  // the reticle's ticks, turning slowly while lit
  const spin = lit ? t * 1.2 : 0;
  for (let k = 0; k < 4; k++) {
    const a = spin + (k * Math.PI) / 2;
    for (let d = R * 1.12; d <= R * 1.5; d += 0.03) {
      const [X, Y] = at(x + Math.cos(a) * d, y + Math.sin(a) * d);
      dot(p, X, Y, lit ? (fill > 0.7 ? FLAME[3] : LIGHT.warm) : HUSH[3], 2, 2);
    }
  }
}
const DIAL_BRASS = ['#38280f', '#a07a36', '#ecca7c'] as const;
/** THE MARK OVER HIM: a little brass-ringed dial over the hero's head (picture point X, Y: its middle), filling round from the top in the enemy's pink to gold; dull while he is hid. `r`: its size (picture pixels). */
export function paintDial(p: Px, X: number, Y: number, fill: number, lit: boolean, r = 7): void {
  for (let j = -r - 2; j <= r + 2; j++) {
    for (let i = -r - 2; i <= r + 2; i++) {
      const d = Math.hypot(i, j);
      if (d > r + 1.5) continue;
      if (d > r - 0.5) {
        dot(p, X + i, Y + j, d > r + 0.5 ? DIAL_BRASS[0] : lit ? (j < 0 ? DIAL_BRASS[2] : DIAL_BRASS[1]) : HUSH[3]);
        continue;
      }
      let a = Math.atan2(i, -j) / (Math.PI * 2);
      if (a < 0) a += 1;
      const c = a <= fill ? (fill >= 1 ? LIGHT.white : a > 0.7 ? FLAME[4] : a > 0.4 ? FLAME[3] : FLAME[2]) : lit ? '#2a1e24' : HUSH[1];
      dot(p, X + i, Y + j, c);
    }
  }
}

// =============================================================================================
// HE OPERATES: the field marked, the cut burnt in

/** The field round where you stood as the mark came full (tiles round it); how long the scorched cuts lie after. */
export const FIELD = { r: 2.5, lie: 1.4 } as const;
/** For the rules: whether a hero `dx`, `dy` tiles from the field's middle is struck as he operates. */
export function fieldStrikes(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) <= FIELD.r;
}
/** The cuts' lines in the field: a ring, and a cross of four long cuts, turned a little (as a surgeon marks them), each from and to (tiles from its middle). */
function cutsOf(seed: number): [Pt, Pt][] {
  const a0 = 0.35 + 0.2 * hash(seed, 1, 7941);
  const out: [Pt, Pt][] = [];
  for (let k = 0; k < 2; k++) {
    const a = a0 + (k * Math.PI) / 2;
    const r = FIELD.r * 0.95;
    out.push([[Math.cos(a) * r, Math.sin(a) * r], [-Math.cos(a) * r, -Math.sin(a) * r]]);
  }
  return out;
}
/** THE FIELD at (x, y), `t` seconds into his operation (from when the mark came full): marked and beating through the wind-up; burnt in at the strike; the scorch after. `aimFrom`: the lens's floor point, for the light's line in at the strike. */
export function paintField(p: Px, at: At, x: number, y: number, t: number, seed = 0): void {
  const cuts = cutsOf(seed);
  if (t < OP_STRIKE[0] + 1 / 30) {
    // MARKED: the ring and the cross dashed, beating ever faster, hot as the strike comes
    const k = clamp01(t / 0.3);
    const run = runOf(t, OP_HIT);
    const hot = t > OP_HOLD[1] - 0.3 || Math.floor(t * (4 + 10 * clamp01(t / OP_HIT))) % 2 === 0;
    for (const dr of [0, -0.06]) dashedRing(p, at, x, y, FIELD.r * (0.5 + 0.5 * smooth(k)) + dr, k, run, hot);
    for (const [a, b] of cuts) for (const o of [0, 0.05]) dashes(p, at, [x + a[0] * k + o, y + a[1] * k - o], [x + b[0] * k + o, y + b[1] * k - o], k, -run, hot);
    // (the field stippled with his pink, beating)
    const beat = Math.floor(t * (3 + 9 * clamp01(t / OP_HIT))) % 2;
    for (let gx = -FIELD.r; gx <= FIELD.r; gx += 0.3) {
      for (let gy = -FIELD.r; gy <= FIELD.r; gy += 0.3) {
        if (Math.hypot(gx, gy) > FIELD.r * smooth(k) - 0.1) continue;
        const ix = Math.round(gx / 0.3);
        const iy = Math.round(gy / 0.3);
        if ((ix + iy + beat) % 2) continue;
        const [X, Y] = at(x + gx, y + gy);
        dot(p, X, Y, hot ? FLAME[2] : FLAME[1], 2, 1);
      }
    }
    // (the light gathering in on the field: motes drawn in to its middle)
    for (let i = 0; i < 24; i++) {
      const life = (t * 1.5 + i / 24) % 1;
      const a = i * 2.39996;
      const r = FIELD.r * (1 - life);
      const [X, Y] = at(x + Math.cos(a) * r, y + Math.sin(a) * r, 2 + 20 * (1 - life) * hash(i, 5, 7942));
      dot(p, X, Y, life > 0.7 ? FLAME[3] : LIGHT.warm, 1, 1);
    }
    return;
  }
  const s = t - OP_HIT;
  if (s > FIELD.lie) return;
  // THE STRIKE: the field blinding for its two frames and the one after, then the burnt cuts glowing white to gold to scorch
  if (s < 2 / 30 + 1e-6) {
    const n = Math.round(FIELD.r * 46);
    for (let j = 0; j <= n; j++) {
      const r = (FIELD.r * j) / n;
      const m = Math.max(8, Math.round(r * 50));
      for (let i = 0; i < m; i++) {
        const a = (i / m) * Math.PI * 2;
        const [X, Y] = at(x + Math.cos(a) * r, y + Math.sin(a) * r);
        if (r > FIELD.r * 0.7 && hash(i, j, 7943) < (r / FIELD.r - 0.7) * 2.5) continue;
        dot(p, X, Y, r < FIELD.r * 0.45 ? LIGHT.white : r < FIELD.r * 0.8 ? LIGHT.warm : FLAME[3], 2, 1);
      }
    }
  }
  const glow = clamp01(1 - s / FIELD.lie);
  const col = s < 0.12 ? LIGHT.white : s < 0.35 ? FLAME[4] : s < 0.7 ? FLAME[3] : s < 1.0 ? FLAME[2] : SCORCH[2];
  const lines: [Pt, Pt][] = [...cuts];
  // (the ring cut round it too)
  const N = 40;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2;
    const a1 = ((i + 1) / N) * Math.PI * 2;
    lines.push([[Math.cos(a0) * FIELD.r, Math.sin(a0) * FIELD.r], [Math.cos(a1) * FIELD.r, Math.sin(a1) * FIELD.r]]);
  }
  for (const [a, b] of lines) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let d = 0; d <= L; d += 0.03) {
      const u = d / Math.max(1e-6, L);
      const [X, Y] = at(x + a[0] + (b[0] - a[0]) * u, y + a[1] + (b[1] - a[1]) * u);
      dot(p, X - 1, Y, SCORCH[0], 3, 2);
      if (hash(Math.round(X), Math.round(Y), 7944) < glow + 0.2) dot(p, X, Y, col, 2, 1);
    }
  }
  // sparks and smoke going up off the cuts
  for (let i = 0; i < 40; i++) {
    const life = (s * 1.4 + hash(i, 6, 7945)) % 1;
    if (s + 0.05 < life * 0.5) continue;
    const [a, b] = lines[i % lines.length];
    const u = hash(i, 7, 7945);
    const [X, Y] = at(x + a[0] + (b[0] - a[0]) * u, y + a[1] + (b[1] - a[1]) * u, life * 40);
    const smoke = s > 0.4;
    dot(p, X, Y, smoke ? (life > 0.5 ? HUSH[2] : HUSH[3]) : life < 0.3 ? LIGHT.white : FLAME[3], smoke ? 2 : 1, smoke ? 2 : 1);
  }
}
/** THE LIGHT FOCUSED through the lens at the strike: a blinding line from the lens (picture point) down into the field's middle (picture point), for the strike's two frames and three after. */
export function paintBurnLine(p: Px, from: Pt, to: Pt, s: number): void {
  if (s < -1 / 30 - 1e-6 || s > 0.17) return;
  const k = 1 - clamp01(s / 0.17);
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const nx = -(to[1] - from[1]) / Math.max(1e-6, L);
  const ny = (to[0] - from[0]) / Math.max(1e-6, L);
  for (let d = 0; d <= L; d += 1) {
    const u = d / L;
    const w = (1 + 2.5 * u) * (0.4 + 0.6 * k);
    for (let q = -w; q <= w; q += 1) dot(p, from[0] + (to[0] - from[0]) * u + nx * q, from[1] + (to[1] - from[1]) * u + ny * q, Math.abs(q) < w * 0.5 ? LIGHT.white : FLAME[3]);
  }
}

// =============================================================================================
// ROUNDS: the rings of the Hush

/** The rings: how far each rolls out (tiles from where the cane strikes), in how long, how thick; where the cane strikes (tiles before him). */
export const RINGS = { reach: 6.5, out: 0.6, band: 0.55, ahead: 0.8, left: -0.38 } as const;
/** How far ring `i` has rolled out `m` seconds into his rounds (null before its rap or once it is gone). */
export function ringAt(i: number, m: number): number | null {
  const s = m - ROUNDS9_HITS[i];
  if (s < 0 || s > RINGS.out) return null;
  return 0.2 + (RINGS.reach - 0.2) * (1 - (1 - s / RINGS.out) ** 1.6);
}
/** For the rules: whether a hero `d` tiles from where the cane strikes is in ring `i`'s band `m` seconds into his rounds (the Hush on him). */
export function ringStrikes(i: number, m: number, d: number): boolean {
  const r = ringAt(i, m);
  return r !== null && Math.abs(d - r) <= RINGS.band / 2 + 0.15;
}
export function paintRounds(p: Px, at: At, m: number, C: Pt, view: 'front' | 'back'): void {
  const S = spot(C, view, RINGS.ahead, RINGS.left);
  // while he holds the cane up: the reach marked round him
  if (m >= ROUNDS9_HOLD[0] - 0.2 && m < ROUNDS9_HITS[2]) {
    const k = clamp01((m - ROUNDS9_HOLD[0] + 0.2) / 0.3);
    dashedRing(p, at, S[0], S[1], RINGS.reach, k * 0.9, runOf(m, ROUNDS9_HITS[0]), m > ROUNDS9_HITS[0] - 0.2);
  }
  for (let i = 0; i < 3; i++) {
    const r = ringAt(i, m);
    if (r === null) continue;
    const s = m - ROUNDS9_HITS[i];
    const q = s / RINGS.out;
    const n = Math.round(r * 90) + 20;
    for (let j = 0; j < n; j++) {
      const a = (j / n) * Math.PI * 2;
      for (let b = 0; b < 5; b++) {
        const rr = r - RINGS.band * (b / 4);
        if (hash(j, b + Math.floor(s * 30) * 7, 7951) < q * 0.6 + b * 0.08) continue;
        const [X, Y] = at(S[0] + Math.cos(a) * rr, S[1] + Math.sin(a) * rr);
        dot(p, X, Y - (b === 0 ? 2 : 0), b === 0 ? PALE : b === 1 ? HUSH[4] : b < 4 ? HUSH[3] : HUSH[2], 2, b === 0 ? 2 : 1);
      }
      if (j % 7 === 0 && hash(j, 9, 7952) > q) {
        const [X, Y] = at(S[0] + Math.cos(a) * (r - 0.1), S[1] + Math.sin(a) * (r - 0.1), 3 + 6 * hash(j, 10, 7952));
        dot(p, X, Y, i === 2 ? FLAME[3] : FLAME[2]);
      }
    }
    // (the boards cracked where it struck, as the rap's)
    if (s < 0.3) {
      for (let j = 0; j < 7; j++) {
        const a = (j / 7) * Math.PI * 2 + hash(j, i, 7953);
        for (let d = 0; d < 0.5 * clamp01(s / 0.06); d += 0.04) {
          const [X, Y] = at(S[0] + Math.cos(a) * d, S[1] + Math.sin(a) * d);
          dot(p, X, Y, s < 0.1 ? FLAME[3] : INK);
        }
      }
    }
  }
}
void DRAW9_HOLD;
