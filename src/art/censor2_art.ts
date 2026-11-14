// FLOOR 15'S BOSS, THE CENSOR, MADE AGAIN: HIS PICTURES AS THE GAME HOLDS A MONSTER'S (art/act1_figs/censor.ts, behind CENSOR2,
// off until his yes). Made from his sculpt (art/censor2_sculpt.ts) and his moves (art/censor2_moves.ts); seen from in front and from
// behind (his back as the camera truly sees it: the brush stays in his right hand), facing up or down the screen to the right and
// turned over for the left, as every monster is: his stand, his glide, the slash (`attack`), Strike-Through (`strike`), Redaction
// (`redact`, which the rules also play for the ink they lay), the Hush (`hush`), struck, his death.
//
// WHAT FOLLOWS HIM IS IN HIS PICTURES (Movement 9: the strike a flash smeared with after-images; Animations 1, a notch too high; each
// blow its own, his word of 14 Nov 2026: “you have the same impact art for a big front paw stomp as a minion being raised from the
// mist.  these are two completely different things.”):
//   THE WORDS HE HAS STRUCK OUT circle him always, slowly, each a word of the city's in the enemy's pink with a black bar across it:
//     what he is known by at a glance, and his light in the dark of the library (his own light besides: the mask's slits, the brush's
//     wet point, a dim pink about him);
//   the brush's point drips as he stands;
//   THE SLASH: the stroke itself left in the air as a great calligrapher's stroke of black ink, edged with burning pink, thick where it
//     came down and thinning to a dry-brush tail; ink flung off its point in drops that fall;
//   STRIKE-THROUGH: his after-images down the thrust in ink; the line's speed; a spray of ink off the point;
//   REDACTION: ink running off his hem in drops as he rises; the brush driven in: a crown of ink thrown up round its point, drops of
//     it flung out and falling; loose pages torn from his ruff by the blow, fluttering down;
//   THE HUSH: the words that circle him drawn in, spiralling, into the ink bar of his mouth; let go: the pages of his ruff flung
//     out and fluttering down;
//   HIS DEATH: light through the cracks of his mask; the words of the city bursting out of him in streams, pink going pale as they go
//     free; the brush falling; his robe falling in, empty, onto a pool of his ink.
// What lies on the floor (the slash's mark, the bars, the line, the Hush's ring, the ink that stays) is painted where it is:
// render/act1_fx/censor.ts (art/censor2_shots.ts).

import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Light } from '../engine/px';
import { Px } from '../engine/px';
import { lazyFrames, toSprite } from './kit';
import type { Painted } from './kit';
import { FLAME } from './mkit';
import { project } from './skeleton';
import type { V3 } from './skeleton';
import { CENSOR2_CANVAS, CS, brushOf, sculptCensor2 } from './censor2_sculpt';
import type { CensorPose } from './censor2_sculpt';
import { CENSOR2_MOVES, CENSOR2_PLAY, censorDie, censorPose, censorReel, censorStill, censorWalk } from './censor2_moves';
import type { CensorMove } from './censor2_moves';
import { arcPath, ghost, put } from './f9_bosses_paint';
import type { Pr } from './f9_bosses_paint';

/**
 * HIS SWITCH: his pictures made again (art/act1_figs/censor.ts; art/bestiary.ts useCensor2). ON at his yes, 14 Nov 2026, asked with
 * his fight filmed in the game (docs/mockups/censor_redo/pictures/censor_fight.mp4): “Yes, switch him on (Recommended)”.
 */
export const CENSOR2 = { on: true };
/** His size as the game measures a figure (game pixels: the top of him as he stands, his hood's peak over the ruff, as the hall measures
 * every kind, tests/act1_kinds_room_c.ts measuredSize; half his body's width), made again. */
export const CENSOR2_SIZE = { top: 80, half: 18 };

/** The two views: from in front, and from behind as the camera truly sees him. */
export type CensorView = 'front' | 'rear';
/** Frames a second of his moves, and of his death. */
export const CENSOR2_FPS = 30;
export const CENSOR2_DIE_FPS = 20;
const YAW = 45;
/** The room round a picture for what follows him (the slash's stroke flung far before him). */
const PAD = 170;
/** His pool of light: the enemy's pink, dim, so that he is seen in the dark of the library. */
const AURA: Light = { x: CENSOR2_CANVAS.ax, y: CENSOR2_CANVAS.ay - 70, r: 96, color: '#ff3a78', a: 0.15 };
/** His ink: black with a cold sheen; its burning edge the enemy's. */
const INK = ['#020203', '#08080c', '#14141c', '#2a2a38'] as const;
const EYE = ['#7a1030', '#c0206a', '#ff3a78', '#ffb070', '#fff0c0'] as const;
const FREED = ['#5a4a58', '#8e7f90', '#c4b8c4', '#ece4ea', '#ffffff'] as const;
const PAPER = ['#1e1e28', '#3a3a46', '#6a6874', '#a29eaa', '#c8c4ce'] as const;

const hashOf = (a: number, b: number, s: number): number => {
  const v = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Where a point of his (his own lengths) is on a picture, seen `view`, his floor point at (ax, ay). */
export function censorPr(view: CensorView, ax: number, ay: number): Pr {
  return (f, l, u) => {
    const p = project([f * CS, l * CS, u * CS], view);
    return [ax + p[0], ay + p[1]];
  };
}

/** A figure laid on a picture, its (0, 0) at (ox, oy). */
function lay(px: Px, fig: Px, ox: number, oy: number): void {
  for (let y = 0; y < fig.h; y++) {
    for (let x = 0; x < fig.w; x++) {
      const i = (y * fig.w + x) * 4;
      if (fig.d[i + 3] === 0) continue;
      const X = ox + x;
      const Y = oy + y;
      if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
      px.d.set(fig.d.subarray(i, i + 4), (Y * px.w + X) * 4);
    }
  }
}
const roomy = (): Px => new Px(CENSOR2_CANVAS.w + PAD * 2, CENSOR2_CANVAS.h + PAD * 2);

const KEPT = new Map<string, Px>();
function kept(key: string, make: () => Px): Px {
  let p = KEPT.get(key);
  if (p) return p;
  p = make();
  if (KEPT.size >= 40) KEPT.delete(KEPT.keys().next().value as string);
  KEPT.set(key, p);
  return p;
}
function censorPx(view: CensorView, pose: CensorPose): Px {
  return sculptCensor2(view, pose, YAW, CENSOR2_CANVAS).px;
}

// =================================================================================================
// WHAT FOLLOWS HIM, PAINTED

/**
 * A STROKE OF INK in the air, as a calligrapher's: between the path its point swept (`outer`, oldest first) and the path its bristles'
 * root swept (`inner`): black, its edge burning pink to gold; thick where it came down (its head), thinning along to a dry-brush tail of
 * broken streaks; `k` of it left (it is eaten from its tail as it goes).
 */
function inkStroke(px: Px, outer: readonly (readonly number[])[], inner: readonly (readonly number[])[], k: number, seed: number): void {
  const n = outer.length;
  for (let i = 1; i < n; i++) {
    const t = i / (n - 1);
    if (t < 1 - k) continue;
    const o0 = outer[i - 1];
    const o1 = outer[i];
    const i0 = inner[i - 1];
    const i1 = inner[i];
    const across = Math.max(Math.hypot(i0[0] - o0[0], i0[1] - o0[1]), Math.hypot(i1[0] - o1[0], i1[1] - o1[1]));
    const steps = Math.max(6, Math.ceil(across * 2));
    // (thick at its head, a dry brush at its tail: streaks broken by the bristles)
    const full = 0.25 + 0.75 * t;
    for (let s = 0; s <= steps; s++) {
      const q = s / steps;
      if (q > full) continue;
      if (t < 0.45 && hashOf(s, 3, seed) < (0.45 - t) * 1.6) continue;
      const a = [o0[0] + (i0[0] - o0[0]) * q, o0[1] + (i0[1] - o0[1]) * q];
      const b = [o1[0] + (i1[0] - o1[0]) * q, o1[1] + (i1[1] - o1[1]) * q];
      const edge = q < 0.08 || q > full - 0.06;
      const c = edge ? (t > 0.7 ? EYE[3] : EYE[2]) : q < 0.22 ? INK[3] : INK[(s + i) % 2];
      const len = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
      for (let j = 0; j <= len; j++) put(px, a[0] + ((b[0] - a[0]) * j) / len, a[1] + ((b[1] - a[1]) * j) / len, c);
    }
  }
}

/** DROPS OF INK flung from (x, y) on the picture along (dx, dy), `t` seconds since, falling; each a black drop, a pink glint on it. */
function drops(px: Px, x: number, y: number, dx: number, dy: number, t: number, n: number, speed: number, seed: number, floorY: number): void {
  if (t < 0 || t > 1.1) return;
  for (let i = 0; i < n; i++) {
    const a = Math.atan2(dy, dx) + (hashOf(i, 1, seed) - 0.5) * 1.3;
    const v = speed * (0.5 + 0.8 * hashOf(i, 2, seed));
    const X = x + Math.cos(a) * v * t;
    let Y = y + Math.sin(a) * v * t * 0.7 + 260 * t * t;
    const s = 1 + Math.round(2 * hashOf(i, 3, seed));
    if (Y > floorY) {
      // (a splat where it lands, drying)
      Y = floorY + hashOf(i, 4, seed) * 10 - 5;
      if (t > 0.9) continue;
      for (let k = -s * 2; k <= s * 2; k++) put(px, X + k, Y, INK[1]);
      continue;
    }
    for (let a2 = 0; a2 < s; a2++) for (let b2 = 0; b2 < s; b2++) put(px, X + a2, Y + b2, INK[1]);
    put(px, X, Y, EYE[2]);
  }
}

/** A WORD STRUCK OUT: a run of its little letters in the enemy's pink (or, gone free, pale), a black bar across it. */
function struckWord(px: Px, x: number, y: number, n: number, colour: readonly string[], barred: boolean, seed: number, z = 2): void {
  const w = n * 4 * z;
  // (a dark halo round it, so that it reads on what it is over)
  for (let k = -z; k <= w + z; k++) for (let r = -2 * z; r <= 6 * z; r++) if ((k + r) % 2 === 0) put(px, x - w / 2 + k, y - 2 * z + r, '#140a12');
  for (let i = 0; i < n; i++) {
    // (each letter its own shape: a few pixels of a three-by-five, each pixel `z` across)
    for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
      if (hashOf(i * 7 + r, c, seed) < 0.45 && !(r === 0 && c === 1)) continue;
      for (let a = 0; a < z; a++) for (let b = 0; b < z; b++) put(px, x - w / 2 + (i * 4 + c) * z + a, y - 2 * z + r * z + b, r < 2 ? colour[4] : r < 4 ? colour[3] : colour[2]);
    }
  }
  if (barred) for (let k = -z; k <= w + z; k++) for (let b = 0; b < z + 1; b++) put(px, x - w / 2 + k, y + b, INK[0]);
}

/** THE WORDS HE HAS STRUCK OUT, circling him at `t` (seconds of his clock): behind him (`behind`) or before him. `pull` 0..1 draws them in to his mouth at `mouth`. */
function circling(px: Px, pr: Pr, hipF: number, t: number, behind: boolean, view: CensorView, pull = 0, mouth?: readonly number[]): void {
  const cam = view === 'front' ? -0.4 : Math.PI - 0.4;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + (t / 6) * Math.PI * 2;
    const front = Math.cos(a - cam) > 0;
    if (front === behind) continue;
    // (a ring tilted toward the eye: low before him, about his waist; high behind him, over his head)
    const r = 58 + 5 * Math.sin(t * 1.3 + i);
    const u = 80 - 38 * Math.cos(a - cam) + 4 * Math.sin(t * 2 + i * 1.7);
    let p = pr(hipF + Math.cos(a) * r, Math.sin(a) * r, u);
    if (pull > 0 && mouth) {
      const k = Math.min(1, pull * (1 + i * 0.12));
      const sw = (1 - k) * 0.9;
      p = [mouth[0] + (p[0] - mouth[0]) * (1 - k) + Math.cos(t * 9 + i) * 8 * sw, mouth[1] + (p[1] - mouth[1]) * (1 - k) + Math.sin(t * 9 + i) * 5 * sw];
      if (k >= 1) continue;
    }
    struckWord(px, p[0], p[1], 3 + (i % 3), EYE, true, 9600 + i * 13);
  }
}

/** LOOSE PAGES torn from his ruff, flung out from (x, y) `t` seconds since and fluttering down. */
function pages(px: Px, x: number, y: number, t: number, n: number, seed: number, floorY: number): void {
  if (t < 0 || t > 2.2) return;
  for (let i = 0; i < n; i++) {
    const a = hashOf(i, 1, seed) * Math.PI * 2;
    const v = 60 + 90 * hashOf(i, 2, seed);
    const out = 1 - Math.exp(-t * 3);
    let X = x + Math.cos(a) * v * out + Math.sin(t * 5 + i) * 6 * t;
    let Y = y + Math.sin(a) * v * 0.6 * out + 40 * t * t;
    if (Y > floorY) Y = floorY;
    if (t > 1.6 && hashOf(i, 9, seed) < (t - 1.6) / 0.6) continue;
    // (a page: a little slip, turning: wide, then edge-on)
    const turn = Math.abs(Math.cos(t * 7 + i));
    const w = Math.max(1, Math.round(5 * turn));
    for (let a2 = 0; a2 < w; a2++) for (let b2 = 0; b2 < 3; b2++) put(px, X + a2, Y + b2, b2 === 1 && a2 % 2 ? PAPER[2] : PAPER[4]);
    void X;
  }
}

/** THE WORDS OF THE CITY bursting out of him, `t` seconds since, from (x, y): in streams, pink going pale as they go free. */
function burst(px: Px, x: number, y: number, t: number, seed: number): void {
  if (t < 0 || t > 2.0) return;
  for (let i = 0; i < 28; i++) {
    const a = -Math.PI / 2 + (hashOf(i, 1, seed) - 0.5) * 3.4;
    const v = 70 + 150 * hashOf(i, 2, seed);
    const st = t - hashOf(i, 3, seed) * 0.5;
    if (st < 0) continue;
    const X = x + Math.cos(a) * v * st + Math.sin(st * 4 + i) * 8;
    const Y = y + Math.sin(a) * v * st * 0.8 - 20 * st;
    const free = Math.min(1, st / 0.9);
    struckWord(px, X, Y, 3 + (i % 3), free > 0.5 ? FREED : EYE, free < 0.3, seed + i);
  }
}

// =================================================================================================
// HIS FRAMES

/** HIM, frame `i` of `move` (CENSOR2_FPS), seen `view`: over his floor point, with what follows him. */
export function censorMovePainted(view: CensorView, move: CensorMove, i: number): Painted & { ax: number; ay: number } {
  const C = CENSOR2_CANVAS;
  const M = CENSOR2_MOVES[move];
  const t = i / CENSOR2_FPS;
  const pose = censorPose(move, t);
  const body = censorPx(view, pose);
  const out = roomy();
  const pr = censorPr(view, C.ax + PAD, C.ay + PAD);
  const floorY = C.ay + PAD;
  const lights: Light[] = [];
  const B = brushOf(pose);
  const tip = pr(B.tip[0], B.tip[1], B.tip[2]);
  const mouth = pr(pose.hip[0] + 8, 0, 96 + pose.hip[2]);
  const since = t - M.beats[0].at;
  // (BEHIND HIM: the words circling behind; his after-images through each strike, in ink)
  const pull = move === 'hush' ? Math.max(0, Math.min(1, (t - 0.3) / 0.7)) * (t < 1.06 ? 1 : 0) : 0;
  const words = !(move === 'hush' && t >= 1.0 && t < 1.8);
  if (words) circling(out, pr, pose.hip[0], t, true, view, pull, mouth);
  const strike = M.strikes.find(([a, b]) => t >= a && t <= b + 0.1);
  if (strike) {
    const [a, b] = strike;
    const n = move === 'strike' ? 4 : 2;
    const fade = t > b ? 1 - (t - b) / 0.1 : 1;
    for (let k = n; k >= 1; k--) {
      const q = Math.max(a - 0.05, Math.min(t, b) - (k * (b - a)) / n);
      const j = Math.max(0, Math.min(i - 1, Math.round(q * CENSOR2_FPS)));
      if (j >= i) continue;
      const g = kept(`${view}:${move}:${j}`, () => censorPx(view, censorPose(move, j / CENSOR2_FPS)));
      ghost(out, g, EYE, (1 - k / (n + 1)) * fade * 0.8, 9700 + k, PAD, PAD);
    }
  }
  lay(out, body, PAD, PAD);
  // (BEFORE HIM)
  if (words) circling(out, pr, pose.hip[0], t, false, view, pull, mouth);
  if (move === 'slash') {
    // (THE STROKE: left in the air as a calligrapher's stroke of ink, from where it came down to where its point is; then eaten away)
    const [a, b] = M.strikes[0];
    if (t >= a && t < b + 0.35) {
      const p0 = censorPose(move, a);
      const p1 = censorPose(move, Math.min(t, b));
      const piv: V3 = [p1.hip[0], p1.hip[1] - 10, p1.hip[2] + 82];
      const ptOf = (q: CensorPose, d: number): V3 => {
        const bb = brushOf(q);
        return [bb.base[0] + bb.axis[0] * d, bb.base[1] + bb.axis[1] * d, bb.base[2] + bb.axis[2] * d];
      };
      // (flung far beyond the bristles: the ink thrown off their point)
      const outer = arcPath(piv, ptOf(p0, 60), ptOf(p1, 60), 20).map((q) => pr(q[0], q[1], Math.max(0, q[2])));
      const inner = arcPath(piv, ptOf(p0, -4), ptOf(p1, -4), 20).map((q) => pr(q[0], q[1], Math.max(0, q[2])));
      const k = t <= b ? 1 : 1 - (t - b) / 0.35;
      inkStroke(out, outer, inner, k, 9711);
    }
    drops(out, tip[0], tip[1], tip[0] - (pr(0, 0, 0)[0]), 30, since, 14, 160, 9713, floorY + 30);
  }
  if (move === 'strike') {
    // (the spray of ink off the point as it is thrust; the thrust's speed lines along the line)
    if (since >= 0) drops(out, tip[0], tip[1], tip[0] - pr(0, 0, 0)[0], tip[1] - pr(0, 0, 60)[1], since, 16, 220, 9721, floorY + 40);
    if (t > 0.82 && t < 1.0) {
      const p0 = pr(pose.hip[0] - 60, 0, 64);
      for (let k = 0; k < 10; k++) {
        const off = (hashOf(k, 1, 9723 + i) - 0.5) * 50;
        const len = 30 + 50 * hashOf(k, 2, 9723 + i);
        for (let s = 0; s < len; s++) put(out, p0[0] - s * 0.9 + off * 0.3, p0[1] + off * 0.6 - s * 0.25, k % 3 ? INK[2] : EYE[2]);
      }
    }
  }
  if (move === 'redact') {
    // (rising: ink running off his hem; the brush driven in: a crown of ink thrown up round its point, drops of it; pages torn loose)
    if (t > 0.2 && t < 0.95) {
      const hem = pr(pose.hip[0], 0, Math.max(0, pose.hip[2] * 0.6));
      for (let k = 0; k < 10; k++) {
        const ph = (t * 1.8 + hashOf(k, 1, 9731)) % 1;
        put(out, hem[0] + (hashOf(k, 2, 9731) - 0.5) * 60, hem[1] - 4 + ph * 40, INK[1]);
      }
    }
    if (since >= 0 && since < 0.6) {
      const q = since / 0.6;
      const r = 8 + 40 * Math.sqrt(q);
      for (let k = 0; k < 22; k++) {
        const a = (k / 22) * Math.PI * 2;
        const h = (1 - q) * (14 + 14 * hashOf(k, 1, 9733)) * Math.sin(Math.min(1, q * 3) * Math.PI * 0.5);
        const x = tip[0] + Math.cos(a) * r;
        const y = tip[1] + Math.sin(a) * r * 0.5;
        for (let s = 0; s < h; s++) put(out, x, y - s, s > h - 2 ? EYE[2] : INK[1]);
      }
    }
    drops(out, tip[0], tip[1] - 6, 0, -1, since, 18, 150, 9735, floorY + 40);
    const ruff = pr(pose.hip[0] - 6, 0, 104 + pose.hip[2]);
    pages(out, ruff[0], ruff[1], since, 8, 9737, floorY + 30);
  }
  if (move === 'hush') {
    const ruff = pr(pose.hip[0] - 6, 0, 100 + pose.hip[2]);
    pages(out, ruff[0], ruff[1], since, 14, 9741, floorY + 30);
    // (the mask's slits flare as he lets it go)
    if (since >= 0 && since < 0.4) lights.push({ x: mouth[0] - PAD, y: mouth[1] - PAD - 8, r: 50, color: EYE[2], a: 0.3 * (1 - since / 0.4) });
  }
  // (his own light: the brush's wet point; the mask)
  lights.push({ x: tip[0] - PAD, y: tip[1] - PAD, r: 22, color: EYE[2], a: 0.2 });
  return { px: out, lights, ax: C.ax + PAD, ay: C.ay + PAD };
}

/** HIM STANDING, GLIDING OR STRUCK at a pose, `t` of its clock: the words circling him; the brush's point dripping. */
function plainPainted(view: CensorView, pose: CensorPose, t: number, drip: boolean): Painted & { ax: number; ay: number } {
  const C = CENSOR2_CANVAS;
  const out = roomy();
  const pr = censorPr(view, C.ax + PAD, C.ay + PAD);
  circling(out, pr, pose.hip[0], t, true, view);
  lay(out, censorPx(view, pose), PAD, PAD);
  circling(out, pr, pose.hip[0], t, false, view);
  const B = brushOf(pose);
  const tip = pr(B.tip[0], B.tip[1], B.tip[2]);
  if (drip) {
    // (a drop of ink swelling on the point, falling, splashing)
    const ph = (t % 2) / 2;
    if (ph < 0.6) put(out, tip[0], tip[1] + 1 + Math.round(ph * 3), EYE[2]);
    else {
      const y = tip[1] + 3 + (ph - 0.6) * 60;
      const fy = C.ay + PAD + 4;
      if (y < fy) { put(out, tip[0], y, INK[1]); put(out, tip[0], y + 1, EYE[1]); }
      else for (let k = -2; k <= 2; k++) put(out, tip[0] + k, fy, INK[1]);
    }
  }
  return { px: out, lights: [{ x: tip[0] - PAD, y: tip[1] - PAD, r: 18, color: EYE[2], a: 0.18 }], ax: C.ax + PAD, ay: C.ay + PAD };
}

/** HIS DEATH, frame `i` (CENSOR2_DIE_FPS): light through his mask's cracks, the words of the city bursting out, the robe falling in. */
export function censorDiePainted(view: CensorView, i: number): Painted & { ax: number; ay: number } {
  const C = CENSOR2_CANVAS;
  const t = i / CENSOR2_DIE_FPS;
  const pose = censorDie(t);
  const out = roomy();
  const pr = censorPr(view, C.ax + PAD, C.ay + PAD);
  // (the pool of his ink spreading under him as he goes)
  const pool = Math.min(1, Math.max(0, (t - 1.6) / 0.9));
  if (pool > 0) {
    const c = pr(pose.hip[0], 0, 0);
    const rx = 30 + 40 * pool;
    for (let y = -rx * 0.5; y <= rx * 0.5; y++) for (let x = -rx; x <= rx; x++) {
      if ((x / rx) ** 2 + (y / (rx * 0.5)) ** 2 > 1 - hashOf(Math.round(x / 3), Math.round(y / 3), 9751) * 0.15) continue;
      put(out, c[0] + x, c[1] + y, hashOf(x, y, 9752) < 0.04 ? EYE[1] : INK[1]);
    }
  }
  lay(out, censorPx(view, pose), PAD, PAD);
  const chest = pr(pose.hip[0] + 4, 0, 78 + pose.hip[2]);
  burst(out, chest[0], chest[1], t - 0.9, 9755);
  const lights: Light[] = [];
  if (t > 0.6 && t < 2.2) lights.push({ x: chest[0] - PAD, y: chest[1] - PAD - 16, r: 70, color: FREED[3], a: 0.25 * Math.sin(Math.min(1, (t - 0.6) / 1.6) * Math.PI) });
  return { px: out, lights, ax: C.ax + PAD, ay: C.ay + PAD };
}

/** HIS PICTURES SEEN ONE WAY. */
function censorSet(view: CensorView): AnimSet {
  const P = CENSOR2_PLAY;
  const spr = (f: Painted & { ax: number; ay: number }, aura: Light | null = AURA): ReturnType<typeof toSprite> => toSprite(f, aura ? { ...aura, x: aura.x + PAD, y: aura.y + PAD } : null, f.ax, f.ay);
  const idle = lazyFrames(P.idle.frames, (i) => spr(plainPainted(view, censorStill(i / P.idle.fps), i / P.idle.fps, true)));
  const walk = lazyFrames(P.walk.frames, (i) => spr(plainPainted(view, censorWalk(i / P.walk.fps), i / P.walk.fps, false)));
  const moveClip = (move: CensorMove): Clip => {
    const M = CENSOR2_MOVES[move];
    const n = Math.round(M.long * CENSOR2_FPS) + 1;
    return { frames: lazyFrames(n, (i) => spr(censorMovePainted(view, move, i))), fps: CENSOR2_FPS, hit: M.beats[0].at };
  };
  const slash = moveClip('slash');
  const rn = Math.round(P.reel * CENSOR2_FPS) + 1;
  const reel: Clip = { frames: lazyFrames(rn, (i) => spr(plainPainted(view, censorReel(i / CENSOR2_FPS), i / CENSOR2_FPS, false))), fps: CENSOR2_FPS };
  const dn = Math.round(P.dies * CENSOR2_DIE_FPS) + 1;
  const die: Clip = { frames: lazyFrames(dn, (i) => spr(censorDiePainted(view, i), null)), fps: CENSOR2_DIE_FPS };
  const hitAt = Math.round(CENSOR2_MOVES.slash.beats[0].at * CENSOR2_FPS);
  return {
    idle,
    walk,
    attack: lazyFrames(3, (i) => slash.frames[[Math.round(hitAt * 0.6), hitAt + 1, Math.round((hitAt + slash.frames.length) / 2)][i]]),
    idleFps: P.idle.fps,
    walkFps: P.walk.fps,
    clips: { attack: slash, die, reel, moves: { strike: moveClip('strike'), redact: moveClip('redact'), hush: moveClip('hush') } },
  };
}

/** THE CENSOR'S PICTURES, made again, as the game holds a monster's. */
export function makeCensor2Art(): ActorArt {
  return { front: censorSet('front'), back: censorSet('rear') };
}

/** (for the films and the tests) frame `i` of a clip, painted, its floor point: `move` a move, or 'still', 'walk', 'reel', 'die'. */
export function censorFramePainted(view: CensorView, what: CensorMove | 'still' | 'walk' | 'reel' | 'die', i: number): Painted & { ax: number; ay: number } {
  if (what === 'die') return censorDiePainted(view, i);
  if (what === 'still') return plainPainted(view, censorStill(i / CENSOR2_PLAY.idle.fps), i / CENSOR2_PLAY.idle.fps, true);
  if (what === 'walk') return plainPainted(view, censorWalk(i / CENSOR2_PLAY.walk.fps), i / CENSOR2_PLAY.walk.fps, false);
  if (what === 'reel') return plainPainted(view, censorReel(i / CENSOR2_FPS), i / CENSOR2_FPS, false);
  return censorMovePainted(view, what, i);
}
