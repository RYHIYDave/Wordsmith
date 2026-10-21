// FLOOR 13'S DOUBLE BOSS, THE SECOND OF THE TWO: THE QUILL (the art chat, 20 Oct 2026). A MOCK-UP: NOT IN THE GAME (PAIR_ON,
// art/scraper.ts, off). The other is the Scraper (art/scraper.ts); what they are made of, art/pair_skins.ts, with his words.
//
// THE QUILL: a great heron of clean white pages, twice the knight's height with its neck up, wading after the Scraper and
// writing over what it scrapes. Its plumage is page over page of white vellum, scraped and written fresh in a fine black hand;
// its long legs and its two crest plumes the Order's wet ink; its beak a long steel nib, slit to its point, dripping ink. Its
// eye burns the enemy's pink.
//
// NOT ON THE HEROES' BONES: painted from its own solids, as the canyon scorpion is, in the same painter (art/new_mobs3.ts
// paintBits).
//
// ITS MOVES: its stand and wade; THE NIB STAB (its basic blow); INK LINES; OVERWRITE (taking off, flying, landing, writing:
// healing the Scraper); THE PALIMPSEST, ITS HALF (the swoop down the Scraper's strip); struck; its death.

import type { Px, Sprite } from '../engine/px';
import { hash, lazyFrames, toSprite } from './kit';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Skin, Stage } from './skin';
import type { V3 } from './skeleton';
import { INK, STEEL, WHITE, inkSkin, leafSkin } from './pair_skins';
import { KN, KV, shake, shreds, sm } from './scraper';

/** Its flight feathers' tips: dipped in the Order's ink, as a heron's are dark. */
const INKWHITE: typeof WHITE = ['#121018', '#22202a', '#3a3744', '#5a5666', '#7c7888'];

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const D = Math.PI / 180;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high). x forward, y to its left, z up; its own frame has its body's middle
// at the origin.

/** Its body's middle over the floor, at rest: its back at the knight's head. */
export const QL_BODY_Z = 56;
/** Its body: half-lengths (long, wide, deep); held tilted, its breast up. */
const BODY_R: V3 = [19, 9.5, 10.5];
const BODY_TILT = -20;
/** Its neck at rest (its own frame), from the root at its breast to its head: the heron's S, folded back on itself. */
const NECK_REST: V3[] = [
  [13, 0, 7],
  [19, 0, 15],
  [17, 0, 23],
  [12, 0, 30],
  [14, 0, 38],
  [20, 0, 44],
];
const NECK_R = [4.4, 3.9, 3.5, 3.3, 3.1, 3.0];
/** Its head's half-lengths; its beak's length (a steel nib). */
const HEAD_R: V3 = [7, 4.4, 4.8];
const BEAK = 27;
/** Its legs: each hip (under its body), and its foot at rest on the floor (the floor's own grid, from its floor point). */
const HIP: V3 = [-1, 5, -10];
export const QL_FEET: [V3, V3] = [[2, 9, 0], [-3, -9, 0]];

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: ten frames a second, a loop of 3.0 s: still as a heron is, its neck drawn up, its head turning; ink dripping off its nib. */
export const QL_STAND = { frames: 30, fps: 10, period: 3.0 } as const;
/** The canvas it is painted on, and its floor point on it: room for its neck and wings and its moves (its flight too). */
export const QL_CANVAS = { w: 760, h: 760, ax: 380, ay: 560 };
const QL_AURA = { x: QL_CANVAS.ax, y: QL_CANVAS.ay - 60, r: 60, color: '#ff3a78', a: 0.06 };

/** ITS TIMES, THE MOVES (seconds; `fps` 30 unless said). */
/** Its wade: a slow stalking stride, each foot lifted high and set down, its head jerking forward with each step; eight frames a second, a stride of 1.5 s. The game carries it at QL_PACE. */
export const QL_WALK = { frames: 12, fps: 8, period: 1.5 } as const;
/** How fast it wades (tiles a second). */
export const QL_PACE = 1.1;
/**
 * THE NIB STAB, its basic blow: its neck drawn back into a tight S, its head cocked, the nib glinting pink (the warning,
 * `warn`); then all at once its neck shoots out and down and the nib stabs into the floor at `hit`, STAB_AT tiles before
 * its floor point; held there a moment, wrenched out; back on its stand by `long`.
 */
export const QL_STAB = { long: 1.3, warn: [0.16, 0.44], hit: 0.6, held: 0.82, fps: 30 } as const;
/** Where the nib strikes the floor at the stab (tiles before its floor point, along its facing). */
export const STAB_AT = 2.4;
/**
 * INK LINES: it rears up tall, its wings half open, its neck up, the nib glinting pink (the warning, `warn`); then it whips
 * its neck across before it three times, from its right to its left, back, and across again, flinging a line of the
 * Order's ink off its nib each time (`strokes`): three lines written across the floor before it, as on a page (art/
 * pair_shots.ts drawInkLine); each bursts in turn, LINE_BURST_AFTER its stroke ends.
 */
export const QL_LINES = {
  long: 2.6,
  warn: [0.2, 0.54],
  strokes: [
    [0.7, 0.92],
    [1.02, 1.24],
    [1.34, 1.56],
  ],
  fps: 30,
} as const;
/** OVERWRITE, its first part: it crouches, its wings raised, and springs up into the air with great wingbeats (`spring`), up by `long`, as `fly` begins. */
export const QL_TAKEOFF = { long: 0.9, crouch: [0, 0.3], spring: 0.34, fps: 30 } as const;
/** Its flight: a loop of wingbeats, twenty-four frames a second, a beat each `period`. The game carries it at QL_FLY_PACE. */
export const QL_FLY = { frames: 12, fps: 24, period: 0.5 } as const;
/** How fast it flies (tiles a second). */
export const QL_FLY_PACE = 4.5;
/** Its body's middle over the floor in flight. */
export const QL_FLY_Z = 100;
/** Its landing, from its flight: its wings thrown up to brake, its feet swung down under it, ON THE FLOOR at `down`; folded and standing by `long`. */
export const QL_LAND = { long: 0.8, down: 0.45, fps: 30 } as const;
/**
 * OVERWRITE, writing: landed beside the Scraper, facing it, it bends its neck down and writes over the Scraper's wounds in
 * quick strokes, its nib burning pink: a loop (`period`), as long as the game lets it write; THE GAME HEALS THE SCRAPER
 * while it plays, and stops it when the Quill is struck (its reel) or the writing burns. Its nib is WRITE_AT before it.
 */
export const QL_WRITE = { frames: 30, fps: 30, period: 1.0 } as const;
/** Where its nib writes, while it writes (from its floor point: tiles before it, and how high in picture units): on the Scraper's back, as the game stands it beside it. */
export const WRITE_AT = { ahead: 1.85, up: 30 } as const;
/**
 * THE PALIMPSEST, ITS HALF (the combo, after the Scraper's strip: art/scraper.ts SR_STRIP): it stands beyond the strip's far
 * end, facing back down it toward the Scraper; crouched, its wings raised high, the nib glinting pink (the warning, `warn`);
 * it springs (`spring`) and swoops down the strip, low, its wings spread wide, its neck stretched out and its nib dragged
 * along the floor, writing, until `lift`, as the nib comes to the strip's near end; then it pulls up and lands (`down`)
 * short of the Scraper. THE GAME CARRIES IT SWOOP_TILES along the way it faces between `go` and `stop`. Its nib is on the
 * floor SWOOP_NIB tiles before it. The strip bursts after it (art/pair_shots.ts drawStripBurst).
 */
export const QL_SWOOP = { long: 2.6, warn: [0.2, 0.5], spring: 0.55, go: 0.7, stop: 1.8, lift: 1.62, down: 2.0, fps: 30 } as const;
export const SWOOP_TILES = 8;
export const SWOOP_NIB = 1.79;
/** Struck: jolted back, its wings flung half open, its neck whipped back, white pages torn off it. */
export const QL_REEL = { long: 0.5, freeze: 0.06, fps: 30 } as const;
/** Its death: a shriek with no sound, its head thrown up, wings flung open (`shriek`); it sinks, its legs folding (`sink`); its neck falls across the floor (`fall`); its pages peel off and blow away, the stolen words going free (`peel`); still by `still`. */
export const QL_DIE = { long: 3.4, shriek: [0, 0.36], sink: [0.36, 1.5], fall: [1.1, 2.0], peel: [0.7, 2.7], still: 3.0, fps: 30 } as const;

// ---------------------------------------------------------------------------------------------
// ITS POSES

export interface QlPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Its neck's joints (its own frame), root first, head last; its head's pitch (degrees, beak down) and turn (to its left). */
  neck: V3[];
  headPitch: number;
  headYaw: number;
  /** Its beak open (0 shut, 1 wide), and its nib's glint (0 to 1). */
  gape: number;
  glint: number;
  /** Its wings: how far spread (0 folded along its body, 1 wide), and how far raised (degrees). */
  spread: number;
  lift: number;
  /** Its feet on the floor's own grid, and how far each ankle bends back. */
  feet: [V3, V3];
  ankle: [number, number];
  eye: number;
  alive: boolean;
  /** How far its pages have peeled off it (0 none, 1 all): its death. */
  peel: number;
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

const NECK_LEN = 6;
const flat = (n: readonly V3[]): number[] => n.flatMap((p) => [p[0], p[1], p[2]]);
const unflat = (a: readonly number[]): V3[] => Array.from({ length: NECK_LEN }, (_, i): V3 => [a[i * 3], a[i * 3 + 1], a[i * 3 + 2]]);
/** Its neck drawn back into a tight S, the head cocked high: the stab's warning. */
const NECK_COIL: V3[] = [[13, 0, 7], [17, 0, 14], [11, 0, 21], [4, 0, 28], [6, 0, 36], [11, 0, 41]];
/** Its neck reared straight up, tall: the lines' warning. */
const NECK_UP: V3[] = [[13, 0, 7], [17, 0, 16], [18, 0, 26], [17, 0, 36], [17, 0, 46], [19, 0, 56]];
/** Its neck stretched out before it, a little up: the lines' strokes, swung side to side. */
const NECK_FWD: V3[] = [[13, 0, 7], [21, 0, 12], [29, 0, 16], [37, 0, 19], [45, 0, 21], [52, 0, 22]];
/** Its neck folded back in flight, as a heron flies. */
const NECK_FLY: V3[] = [[12, 0, 6], [16, 0, 11], [12, 0, 15], [9, 0, 19], [13, 0, 22], [19, 0, 24]];
/** Its neck drawn in, its head thrust forward (the wade's head-jerk, forward). */
const NECK_THRUST: V3[] = [[13, 0, 7], [20, 0, 14], [19, 0, 22], [16, 0, 30], [20, 0, 37], [28, 0, 42]];
const mixNeck = (a: readonly V3[], b: readonly V3[], k: number): V3[] => a.map((p, i) => lerpV(p, b[i], k));
/** Its neck (each point but its root) swung round its root about the up axis by `deg` (to its left). */
function swungNeck(n: readonly V3[], deg: number): V3[] {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  const r = n[0];
  return n.map((p, i): V3 => (i === 0 ? p : [r[0] + (p[0] - r[0]) * c - (p[1] - r[1]) * s, r[1] + (p[0] - r[0]) * s + (p[1] - r[1]) * c, p[2]]));
}

/** From the top of its neck to its nib's point, along its head (picture units): its head, its nib's base and the nib. */
const HEAD_TO_TIP = 3 + HEAD_R[0] * 0.8 + BEAK;

/** Its own frame's three axes, where it is turned (to find a point of the world in its own frame). */
function axesOf(P: Pick<QlPose, 'yaw' | 'pitch' | 'roll'>): [V3, V3, V3] {
  const Q = { ...P, x: 0, y: 0, z: 0 } as QlPose;
  return [worldOf(Q, [1, 0, 0]), worldOf(Q, [0, 1, 0]), worldOf(Q, [0, 0, 1])];
}
/**
 * ITS NECK AIMED: its neck laid out from its root toward `target` (a point of the world, from its floor point), as nearly
 * straight as `bow` lets it (a little arch, up, in picture units), and its head turned along it, so that its nib's point is
 * on `target` if it reaches. Sets `neck`, `headPitch` and `headYaw`.
 */
function aimNeck(P: QlPose, target: V3, bow = 3, most = 50): void {
  const [ex, ey, ez] = axesOf(P);
  const root = worldOf(P, NECK_REST[0]);
  const w = sub(target, root);
  const dist = len(w);
  const d: V3 = norm([w[0] * ex[0] + w[1] * ex[1] + w[2] * ex[2], w[0] * ey[0] + w[1] * ey[1] + w[2] * ey[2], w[0] * ez[0] + w[1] * ez[1] + w[2] * ez[2]], [1, 0, 0]);
  const L = Math.max(12, Math.min(most, dist - HEAD_TO_TIP));
  const up = norm(cross(cross(d, [0, 0, 1]), d), [0, 0, 1]);
  P.neck = Array.from({ length: NECK_LEN }, (_, i): V3 => {
    const k = i / (NECK_LEN - 1);
    return add(add(NECK_REST[0], mul(d, L * k)), mul(up, bow * Math.sin(Math.PI * k)));
  });
  P.headPitch = (-Math.asin(Math.max(-1, Math.min(1, d[2]))) / D) as number;
  P.headYaw = (Math.atan2(d[1], d[0]) / D) as number;
}
/** Where its nib's point is (a point of the world, from its floor point). */
export function nibOf(P: QlPose): V3 {
  const head = P.neck[P.neck.length - 1];
  const hp = P.headPitch * D;
  const hy = P.headYaw * D;
  const hf: V3 = [Math.cos(hp) * Math.cos(hy), Math.cos(hp) * Math.sin(hy), -Math.sin(hp)];
  return worldOf(P, add(head, mul(hf, HEAD_TO_TIP)));
}

/** Its stand: still as a heron is; it breathes, its neck rising and settling a little; its head turns slowly, looking; a drop of ink gathers on its nib and falls. */
function standPose(t: number): QlPose {
  const a = (Math.PI * 2 * t) / QL_STAND.period;
  const rise = Math.sin(a);
  const neck = NECK_REST.map((p, i): V3 => [p[0] + 0.6 * rise * (i / 5), p[1], p[2] + 1.2 * rise * (i / 5)]);
  const chips: [V3, string, number][] = [];
  // (the drop of ink: gathers at the nib's point, falls to the floor)
  const ph = (t / QL_STAND.period) % 1;
  if (ph > 0.55) {
    const k = (ph - 0.55) / 0.45;
    chips.push([[34, 0, 98 - 98 * k * k], INK[1], 2]);
  }
  return {
    x: 0,
    y: 0,
    z: QL_BODY_Z + 0.6 * rise,
    yaw: 0,
    pitch: 0,
    roll: 0,
    neck,
    headPitch: 8 + 3 * Math.sin(a),
    headYaw: 22 * Math.sin(a),
    gape: 0,
    glint: 0,
    spread: 0,
    lift: 0,
    feet: [QL_FEET[0], QL_FEET[1]],
    ankle: [1, 1],
    eye: 1,
    alive: true,
    peel: 0,
    chips,
    flares: [],
  };
}
const STAND0 = standPose(0);
const fresh = (): QlPose => ({ ...STAND0, neck: STAND0.neck.map((p): V3 => [p[0], p[1], p[2]]), feet: [QL_FEET[0], QL_FEET[1]], ankle: [1, 1], chips: [], flares: [] });

/** Ink flung off its nib: drops thrown from `at` along `dir` (and falling), `n` of them, over the last `life` seconds of a stroke from `t0`. */
function spray(out: [V3, string, number][], at: V3, dir: V3, t: number, t0: number, t1: number, n: number, seed: number, speed = 160): void {
  for (let j = 0; j < n; j++) {
    const tj = t0 + (j / n) * (t1 - t0);
    const age = t - tj;
    if (age < 0 || age > 0.22) continue;
    const s = speed * (0.6 + 0.4 * hash(j, 1, seed));
    const p: V3 = [at[0] + dir[0] * s * age + (hash(j, 2, seed) - 0.5) * 6, at[1] + dir[1] * s * age + (hash(j, 3, seed) - 0.5) * 6, at[2] + dir[2] * s * age - 260 * age * age];
    if (p[2] > 0.6) out.push([p, j % 4 ? INK[1] : FLAME[2], 2]);
  }
}

/** A foot as the wade puts it, `u` its phase: down for the first half, the body going over it; lifted high and carried forward the second. */
const QW_HALF = (QL_PACE * 39.19 * QL_WALK.period) / 2 / 2;
function wadeFoot(k: number, u: number): V3 {
  const r = QL_FEET[k];
  if (u < 0.5) return [r[0] + QW_HALF * (1 - 4 * u), r[1], 0];
  const v = (u - 0.5) * 2;
  return [r[0] + QW_HALF * (-1 + 2 * sm(v)), r[1], 14 * Math.sin(Math.PI * Math.min(1, v * 1.15))];
}
/** Its wade: each foot lifted high, the toes curled, carried forward and set down; its body rocking over them; its head held still and then jerked forward with each step, as a wading bird's. */
function walkPose(t: number): QlPose {
  const ph = (t / QL_WALK.period) % 1;
  const a = Math.PI * 2 * ph;
  const P = fresh();
  P.feet = [wadeFoot(0, ph), wadeFoot(1, (ph + 0.5) % 1)];
  P.ankle = [1 + 0.8 * cl01(P.feet[0][2] / 14), 1 + 0.8 * cl01(P.feet[1][2] / 14)];
  P.z = QL_BODY_Z + 1.5 * Math.cos(2 * a);
  P.roll = 3 * Math.sin(a);
  P.yaw = 2 * Math.sin(a);
  // (the head-jerk: twice a stride, held back as the body goes on, then thrust forward)
  const hp = (ph * 2) % 1;
  const jerk = hp < 0.7 ? hp / 0.7 : 1 - (hp - 0.7) / 0.3;
  P.neck = mixNeck(NECK_REST, NECK_THRUST, 1 - sm(jerk));
  P.headPitch = 10;
  P.headYaw = 0;
  return P;
}

/** THE NIB STAB. */
function stabPose(t: number): QlPose {
  const S = QL_STAB;
  const P = fresh();
  const tr = shake(t, S.warn[0], S.warn[1], 0.9, 1);
  P.x = KN(t, [[0, 0], [S.warn[0], -6, 'out'], [S.warn[1], -7], [S.hit, 16, 'in'], [S.held, 17], [S.long, 0, 'out']]);
  P.z = KN(t, [[0, QL_BODY_Z], [S.warn[0], QL_BODY_Z + 4], [S.warn[1], QL_BODY_Z + 4], [S.hit, QL_BODY_Z - 8, 'in'], [S.held, QL_BODY_Z - 8], [S.long, QL_BODY_Z, 'out']]);
  P.pitch = KN(t, [[0, 0], [S.warn[0], -12, 'out'], [S.warn[1], -12], [S.hit, 26, 'in'], [S.held, 26], [S.long, 0, 'out']]);
  P.spread = KN(t, [[0, 0], [S.warn[0], 0.25], [S.warn[1], 0.3], [S.hit, 0.45, 'in'], [S.held, 0.3], [S.long, 0]]);
  P.lift = KN(t, [[0, 0], [S.warn[0], 30], [S.hit, -10], [S.long, 0]]);
  P.glint = KN(t, [[0, 0], [S.warn[0], 0.8], [S.warn[1], 1], [S.hit, 1], [S.held, 0.6], [S.held + 0.1, 0]]);
  P.eye = 1 + 0.6 * P.glint;
  // (a step in with its right foot as it strikes)
  const f1 = KV(t, [[0, QL_FEET[1]], [S.warn[1], QL_FEET[1]], [S.hit - 0.05, add(QL_FEET[1], [14, 0, 8])], [S.hit, add(QL_FEET[1], [24, 0, 0]), 'in'], [S.held, add(QL_FEET[1], [24, 0, 0])], [S.long - 0.15, add(QL_FEET[1], [8, 0, 7])], [S.long, QL_FEET[1]]]);
  P.feet = [QL_FEET[0], f1];
  // the neck: coiled back through the warning, then aimed: shot out to the floor STAB_AT before it, held, wrenched back
  const coil = mixNeck(NECK_REST, NECK_COIL, KN(t, [[0, 0], [S.warn[0], 1, 'out'], [S.held + 0.15, 1], [S.long, 0]]));
  P.neck = coil.map((p): V3 => [p[0] + tr * 0.4, p[1], p[2] + tr]);
  P.headPitch = KN(t, [[0, 8], [S.warn[0], 18], [S.held + 0.15, 18], [S.long, 8]]);
  P.headYaw = 0;
  const reach = KN(t, [[0, 0], [S.warn[1] + 0.02, 0], [S.hit, 1, 'in'], [S.held, 1], [S.held + 0.18, 0, 'out']]);
  if (reach > 0) {
    const Q = { ...P };
    aimNeck(Q, [STAB_AT * 39.19, 0, 0.6], 2);
    P.neck = mixNeck(P.neck, Q.neck, reach);
    P.headPitch = P.headPitch + (Q.headPitch - P.headPitch) * reach;
  }
  P.gape = KN(t, [[0, 0], [S.warn[0], 0.25], [S.warn[1], 0.3], [S.hit, 0], [S.long, 0]]);
  // (the strike: ink and grit burst where the nib goes in)
  if (t >= S.hit && t < S.hit + 0.3) {
    const at: V3 = [STAB_AT * 39.19, 0, 0];
    for (let i = 0; i < 14; i++) {
      const s = t - S.hit;
      const ang = (i / 14) * Math.PI * 2;
      const r = 6 + 70 * s;
      const z = Math.max(0.6, 50 * s * (1 + hash(i, 1, 4301)) - 300 * s * s);
      P.chips.push([[at[0] + Math.cos(ang) * r * 0.7, at[1] + Math.sin(ang) * r, z], i % 3 ? INK[1] : FLAME[2], 2]);
    }
  }
  return P;
}

/** INK LINES. */
function linesPose(t: number): QlPose {
  const S = QL_LINES;
  const P = fresh();
  const tr = shake(t, S.warn[0], S.warn[1], 1, 2);
  const s0 = S.strokes[0][0];
  const sN = S.strokes[2][1];
  P.z = KN(t, [[0, QL_BODY_Z], [S.warn[0], QL_BODY_Z + 8, 'out'], [S.warn[1], QL_BODY_Z + 8], [s0, QL_BODY_Z + 2, 'in'], [sN, QL_BODY_Z + 2], [S.long, QL_BODY_Z, 'out']]);
  P.pitch = KN(t, [[0, 0], [S.warn[0], -16, 'out'], [S.warn[1], -16], [s0, 10, 'in'], [sN, 10], [S.long, 0, 'out']]);
  P.spread = KN(t, [[0, 0], [S.warn[0], 0.55, 'out'], [sN, 0.6], [S.long, 0]]);
  P.lift = KN(t, [[0, 0], [S.warn[0], 40], [S.warn[1], 46], [s0, 18], [sN, 22], [S.long, 0]]) + 4 * tr;
  P.glint = KN(t, [[0, 0], [S.warn[0], 0.8], [S.warn[1], 1], [sN, 1], [sN + 0.25, 0]]);
  P.eye = 1 + 0.6 * P.glint;
  P.gape = KN(t, [[0, 0], [S.warn[0], 0.5], [s0, 0.2], [sN, 0.2], [S.long, 0]]);
  // the neck: reared up through the warning; through each stroke stretched out and whipped across, its right to its left, back, and across again
  const out = KN(t, [[0, 0], [S.warn[1], 0], [s0, 1, 'in'], [sN, 1], [S.long, 0, 'out']]);
  const up = KN(t, [[0, 0], [S.warn[0], 1, 'out'], [S.warn[1], 1], [s0, 0.2], [sN, 0.2], [S.long, 0]]);
  // (where the neck is swung at each stroke's start and end: its right, its left, its right, its left)
  const ends = [-46, 46, -46, 46];
  let sweep: number;
  if (t < s0) sweep = ends[0] * sm((t - S.warn[1]) / (s0 - S.warn[1]));
  else if (t > sN) sweep = ends[3] * (1 - sm((t - sN) / 0.4));
  else {
    let i = 0;
    while (i < 2 && t > S.strokes[i][1]) i++;
    const [a, b] = S.strokes[i];
    sweep = t < a ? ends[i] : ends[i] + (ends[i + 1] - ends[i]) * sm((t - a) / (b - a));
  }
  const base = mixNeck(mixNeck(NECK_REST, NECK_UP, up), NECK_FWD, out);
  P.neck = swungNeck(base, sweep).map((p, i): V3 => [p[0], p[1], p[2] + tr * (i / 5)]);
  P.headPitch = KN(t, [[0, 8], [S.warn[0], -6], [S.warn[1], -6], [s0, 34, 'in'], [sN, 34], [S.long, 8]]);
  P.headYaw = sweep;
  // (each stroke: ink flung off the nib, off toward the line it writes)
  for (let i = 0; i < 3; i++) {
    const [a, b] = S.strokes[i];
    if (t < a || t > b + 0.25) continue;
    const nib = nibOf(P);
    const dir = norm([Math.cos(sweep * D), Math.sin(sweep * D), 0.15]);
    spray(P.chips, nib, dir, t, a, b, 16, 4400 + i);
  }
  P.feet = [QL_FEET[0], QL_FEET[1]];
  return P;
}

/** Its flight, `u` the beat's phase (0: the wings at the top of their beat). */
function flyPoseAt(u: number): QlPose {
  const a = Math.PI * 2 * u;
  const P = fresh();
  P.z = QL_FLY_Z - 4 * Math.cos(a);
  P.pitch = -4 + 3 * Math.sin(a);
  P.spread = 0.82 + 0.18 * Math.cos(a);
  P.lift = 42 * Math.cos(a);
  P.neck = NECK_FLY.map((p): V3 => [p[0], p[1], p[2]]);
  P.headPitch = 6;
  P.headYaw = 0;
  P.feet = [[-36, 6, P.z - 30], [-38, -6, P.z - 31]];
  P.ankle = [0.4, 0.4];
  return P;
}
function flyPose(t: number): QlPose {
  return flyPoseAt((t / QL_FLY.period) % 1);
}

/** Taking off: a crouch, its wings raised; a spring and great wingbeats; up as its flight begins. */
function takeoffPose(t: number): QlPose {
  const S = QL_TAKEOFF;
  const F = flyPoseAt(0);
  const P = fresh();
  const k = sm((t - S.spring) / (S.long - S.spring));
  P.z = KN(t, [[0, QL_BODY_Z], [S.crouch[1], QL_BODY_Z - 10, 'out'], [S.spring, QL_BODY_Z - 10], [S.spring + 0.18, QL_BODY_Z + 22, 'in'], [S.long, F.z, 'out']]);
  P.pitch = KN(t, [[0, 0], [S.crouch[1], 12], [S.spring, 12], [S.spring + 0.18, -14], [S.long, F.pitch]]);
  // (wings: raised in the crouch, a downstroke as it springs, a second beat, at the top of a beat as its flight begins)
  P.spread = KN(t, [[0, 0], [S.crouch[1], 0.8, 'out'], [S.spring, 0.9], [S.long, F.spread]]);
  P.lift = KN(t, [[0, 0], [S.crouch[1], 62, 'out'], [S.spring, 66], [S.spring + 0.16, -36, 'in'], [S.spring + 0.36, 46], [S.long - 0.1, -20], [S.long, F.lift]]);
  P.neck = mixNeck(mixNeck(NECK_REST, NECK_COIL, sm(t / S.crouch[1])), NECK_FLY, k);
  P.headPitch = 8 + (F.headPitch - 8) * k;
  P.headYaw = 0;
  const ank = (1 + 1.2 * sm(t / S.crouch[1])) * (1 - k) + F.ankle[0] * k;
  P.ankle = [ank, ank];
  // (its feet push off and trail behind it)
  const lift = sm((t - S.spring) / 0.3);
  P.feet = [lerpV(QL_FEET[0], F.feet[0], lift), lerpV(QL_FEET[1], F.feet[1], lift)];
  P.feet = [[P.feet[0][0], P.feet[0][1], Math.max(0, P.feet[0][2])], [P.feet[1][0], P.feet[1][1], Math.max(0, P.feet[1][2])]];
  // (the downstroke: grit and loose pages blown out across the floor)
  P.chips.push(...shreds([0, 0, 0], S.spring, t, 22, 4501, 46, 18, 0.5, ['#d8d2c4', '#a29a86', '#827c6c']));
  return P;
}

/** Landing: its wings thrown up and forward to brake, its feet swung down under it; down on the floor at `down`; its wings folded, standing, by `long`. */
function landPose(t: number): QlPose {
  const S = QL_LAND;
  const F = flyPoseAt(0);
  const P = fresh();
  P.z = KN(t, [[0, F.z], [S.down, QL_BODY_Z - 2, 'in'], [S.down + 0.08, QL_BODY_Z - 7], [S.long, QL_BODY_Z, 'out']]);
  P.pitch = KN(t, [[0, F.pitch], [S.down - 0.1, -20], [S.down + 0.08, 8], [S.long, 0, 'out']]);
  P.spread = KN(t, [[0, F.spread], [S.down, 1], [S.down + 0.1, 0.8], [S.long, 0, 'out']]);
  P.lift = KN(t, [[0, F.lift], [0.18, -20], [0.32, 54], [S.down, 40], [S.long, 0, 'out']]);
  P.neck = mixNeck(NECK_FLY, NECK_REST, sm((t - 0.2) / (S.long - 0.2)));
  P.headPitch = F.headPitch + (8 - F.headPitch) * sm(t / S.long);
  P.headYaw = 0;
  const down = sm(t / S.down);
  P.feet = [lerpV(F.feet[0], add(QL_FEET[0], [0, 0, 0]), down), lerpV(F.feet[1], QL_FEET[1], down)];
  P.feet = [[P.feet[0][0], P.feet[0][1], Math.max(0, P.feet[0][2])], [P.feet[1][0], P.feet[1][1], Math.max(0, P.feet[1][2])]];
  P.ankle = [KN(t, [[0, 0.4], [S.down, 1.1], [S.down + 0.08, 1.8], [S.long, 1]]), KN(t, [[0, 0.4], [S.down, 1.1], [S.down + 0.08, 1.8], [S.long, 1]])];
  P.chips.push(...shreds([0, 0, 0], S.down, t, 18, 4601, 36, 12, 0.45, ['#d8d2c4', '#a29a86', '#827c6c']));
  return P;
}

/** OVERWRITE, writing: its neck bent down before it, its nib writing in quick loops on what is before it (the Scraper's back), burning pink; its wings half raised, trembling. */
function writePose(t: number): QlPose {
  const u = (t / QL_WRITE.period) % 1;
  const a = Math.PI * 2 * u;
  const P = fresh();
  P.pitch = 12;
  P.z = QL_BODY_Z - 3;
  P.spread = 0.35 + 0.05 * Math.sin(a * 3);
  P.lift = 26 + 4 * Math.sin(a * 5);
  P.glint = 1;
  P.eye = 1.5;
  // (the writing: the nib's point running along a line of loops, a word's length each round, across before it)
  const along = -14 * Math.cos(a);
  const loop = 5 * Math.sin(a * 4);
  const lift = 3 * Math.max(0, Math.cos(a * 4));
  aimNeck(P, [WRITE_AT.ahead * 39.19 + loop * 0.6, along + loop * 0.4, WRITE_AT.up + lift], 7, 46);
  P.gape = 0.15;
  // (the fresh ink burning pink as it is written: sparks at the nib)
  const nib = nibOf(P);
  for (let j = 0; j < 5; j++) {
    const s = ((u * 5 + j / 5) % 1) * 0.3;
    P.chips.push([[nib[0] + (hash(j, Math.floor(u * 5), 4701) - 0.5) * 8, nib[1] + (hash(j, 2, 4701) - 0.5) * 8, nib[2] + 30 * s], s < 0.15 ? FLAME[3] : FLAME[2], 2]);
  }
  P.flares.push([nib, 18, 0.35]);
  return P;
}

/** THE PALIMPSEST, ITS HALF: the swoop down the strip. */
function swoopPose(t: number): QlPose {
  const S = QL_SWOOP;
  const P = fresh();
  const tr = shake(t, S.warn[0], S.warn[1], 1.4, 5);
  const skim = t >= S.go && t <= S.stop;
  P.z = KN(t, [[0, QL_BODY_Z], [S.warn[0], QL_BODY_Z - 10, 'out'], [S.spring, QL_BODY_Z - 10], [S.go, QL_BODY_Z + 4, 'in'], [S.go + 0.1, 46], [S.stop, 46], [S.down, QL_BODY_Z - 4, 'out'], [S.long, QL_BODY_Z, 'out']]) + (skim ? 1.5 * Math.sin((t - S.go) * 14) : 0);
  P.pitch = KN(t, [[0, 0], [S.warn[0], 10], [S.spring, 12], [S.go, 6], [S.go + 0.1, 16], [S.stop, 16], [S.down - 0.1, -18], [S.down, 6], [S.long, 0, 'out']]);
  P.spread = KN(t, [[0, 0], [S.warn[0], 0.85, 'out'], [S.spring, 0.9], [S.go, 1], [S.stop, 1], [S.down, 1], [S.long, 0, 'out']]);
  P.lift = KN(t, [[0, 0], [S.warn[0] + 0.1, 70, 'out'], [S.spring, 72], [S.go, -30, 'in'], [S.go + 0.2, 14], [S.stop - 0.1, 8], [S.stop, 30], [S.down - 0.05, 56], [S.down + 0.1, 30], [S.long, 0, 'out']]) + (skim ? 6 * Math.sin((t - S.go) * 14) : 0) + 3 * tr;
  P.glint = KN(t, [[0, 0], [S.warn[0], 0.8], [S.warn[1], 1], [S.stop, 1], [S.stop + 0.3, 0]]);
  P.eye = 1 + 0.6 * P.glint;
  P.gape = KN(t, [[0, 0], [S.warn[0], 0.4], [S.go, 0.25], [S.stop, 0.25], [S.long, 0]]);
  // the neck: coiled through the warning, then stretched out and down to drag the nib along the floor before it; folded as it lands
  const coil = mixNeck(NECK_REST, NECK_COIL, sm(t / S.warn[0]));
  P.neck = coil.map((p, i): V3 => [p[0], p[1], p[2] + tr * (i / 5)]);
  P.headPitch = KN(t, [[0, 8], [S.warn[0], 14], [S.down, 14], [S.long, 8]]);
  P.headYaw = 0;
  const drag = KN(t, [[0, 0], [S.spring, 0], [S.go + 0.08, 1, 'in'], [S.lift, 1], [S.stop, 0.25, 'out'], [S.stop + 0.2, 0, 'out']]);
  if (drag > 0) {
    const Q = { ...P };
    aimNeck(Q, [P.x + 70, 0, 0.6], 4);
    P.neck = mixNeck(P.neck, Q.neck, drag);
    P.headPitch = P.headPitch + (Q.headPitch - P.headPitch) * drag;
  }
  if (t > S.stop) P.neck = mixNeck(P.neck, NECK_REST, sm((t - S.stop) / (S.long - S.stop)));
  // its feet: pushed off at the spring, trailing behind it, swung down to land
  const off = sm((t - S.spring) / 0.15) * (1 - sm((t - S.stop) / (S.down - S.stop)));
  P.feet = [lerpV(QL_FEET[0], [-30, 6, 22], off), lerpV(QL_FEET[1], [-32, -6, 21], off)];
  P.ankle = [KN(t, [[0, 1], [S.warn[0], 2], [S.spring, 2], [S.go, 0.5], [S.stop, 0.5], [S.down, 1.6], [S.long, 1]]), KN(t, [[0, 1], [S.warn[0], 2], [S.spring, 2], [S.go, 0.5], [S.stop, 0.5], [S.down, 1.6], [S.long, 1]])];
  // (the nib dragged along the floor: ink and paper scraps thrown up behind it)
  if (skim && t < S.lift) {
    const nib = nibOf(P);
    for (let j = 0; j < 10; j++) {
      const age = ((t - S.go) * 3 + j / 10) % 1 * 0.25;
      P.chips.push([[nib[0] - 140 * age, nib[1] + (hash(j, 1, 4801) - 0.5) * 14, Math.max(0.6, 2 + 70 * age - 300 * age * age)], j % 3 ? INK[1] : FLAME[2], 2]);
    }
    P.flares.push([nib, 20, 0.3]);
  }
  P.chips.push(...shreds([0, 0, 0], S.spring, t, 18, 4802, 40, 16, 0.45, ['#d8d2c4', '#a29a86', '#827c6c']));
  return P;
}

/** Struck: jolted back, its wings flung half open, its neck whipped back, two white pages torn off it and flung. */
function reelPose(t: number): QlPose {
  const R = QL_REEL;
  const P = fresh();
  if (t < R.freeze) return { ...P, eye: 1.6 };
  const k = cl01((t - R.freeze) / (R.long - R.freeze));
  const arc = Math.sin(Math.PI * Math.min(1, k * 1.2)) * (1 - 0.2 * k);
  P.x = -8 * arc;
  P.z = QL_BODY_Z + 4 * arc;
  P.pitch = -14 * arc;
  P.roll = 6 * Math.sin(3 * Math.PI * k) * (1 - k);
  P.spread = 0.6 * arc;
  P.lift = 44 * arc;
  P.neck = mixNeck(NECK_REST, NECK_COIL, arc).map((p, i): V3 => [p[0] - 6 * arc * (i / 5), p[1], p[2]]);
  P.headPitch = 8 - 24 * arc;
  P.gape = 0.8 * arc;
  P.eye = 1.6 - 0.6 * k;
  for (let j = 0; j < 2; j++) {
    const s = t - R.freeze;
    const w: V3 = [-4 - 30 * s, (j ? -1 : 1) * (10 + 50 * s), 60 + 80 * s - 200 * s * s];
    if (w[2] > 0.6) for (let q = 0; q < 6; q++) P.chips.push([[w[0] + (q % 3) * 1.5, w[1] + Math.floor(q / 3) * 1.5, w[2] + (q % 2)], q % 2 ? WHITE[3] : WHITE[4], 2]);
  }
  return P;
}

/** Its death. */
function deathPose(t: number): QlPose {
  const Dd = QL_DIE;
  const P = fresh();
  const shriek = sm(t / 0.32) * (1 - sm((t - Dd.shriek[1]) / 0.4));
  const sink = sm((t - Dd.sink[0]) / (Dd.sink[1] - Dd.sink[0]));
  const fall = sm((t - Dd.fall[0]) / (Dd.fall[1] - Dd.fall[0]));
  P.z = QL_BODY_Z + 4 * shriek - (QL_BODY_Z - 15) * sink;
  P.pitch = -10 * shriek + 14 * sink;
  P.roll = 9 * sm((t - 1.6) / 1.0);
  P.spread = Math.max(0.9 * shriek, 0.85 * sm((t - 0.2) / 0.6));
  P.lift = 50 * shriek - 4 * sink;
  P.ankle = [1 + 2.2 * sink, 1 + 2.2 * sink];
  P.feet = [[QL_FEET[0][0] + 6 * sink, QL_FEET[0][1] + 6 * sink, 0], [QL_FEET[1][0] + 4 * sink, QL_FEET[1][1] - 6 * sink, 0]];
  // the neck: thrown up in the shriek; then it falls forward across the floor, the head lying on it
  P.neck = mixNeck(NECK_REST, NECK_UP, shriek);
  P.headPitch = 8 - 46 * shriek;
  P.headYaw = 10 * sink;
  if (fall > 0) {
    const Q = { ...P };
    aimNeck(Q, [86, 18, 1.2], -2);
    P.neck = mixNeck(P.neck, Q.neck, fall);
    P.headPitch = P.headPitch + (Q.headPitch - P.headPitch) * fall;
    P.headYaw = P.headYaw + (Q.headYaw - P.headYaw) * fall;
  }
  P.gape = Math.max(shriek, 0.3 * fall);
  P.eye = 1.6 * (1 - sm((t - 0.9) / 0.8));
  P.alive = false;
  P.peel = sm((t - Dd.peel[0]) / (Dd.peel[1] - Dd.peel[0]));
  // its pages blown off it, and the stolen words going free: pink sparks rising out of it, going pale as they go
  for (let i = 0; i < 24; i++) {
    const t0 = Dd.peel[0] + hash(i, 1, 4901) * (Dd.still - 1.1 - Dd.peel[0]);
    const s = t - t0;
    if (s < 0 || s > 1.1) continue;
    const ang = hash(i, 2, 4901) * Math.PI * 2;
    const c: V3 = [-10 + 30 * hash(i, 3, 4901), (hash(i, 4, 4901) - 0.5) * 30, P.z + 4];
    P.chips.push([[c[0] + Math.cos(ang) * 14 * s, c[1] + Math.sin(ang) * 14 * s, c[2] + 60 * s], s < 0.4 ? FLAME[3] : s < 0.8 ? FLAME[4] : '#fff8e0', 2]);
  }
  for (let i = 0; i < 16; i++) {
    const t0 = Dd.peel[0] + hash(i, 5, 4902) * (Dd.still - 1.4 - Dd.peel[0]);
    const s = t - t0;
    if (s < 0 || s > 1.4) continue;
    const ang = hash(i, 6, 4902) * Math.PI * 2;
    const r = 20 + 50 * s;
    const z = Math.max(0.6, P.z + 10 + 50 * s - 60 * s * s);
    for (let q = 0; q < 4; q++) P.chips.push([[Math.cos(ang) * r + (q % 2) * 1.5, Math.sin(ang) * r + Math.floor(q / 2) * 1.5, z], q % 3 ? WHITE[4] : WHITE[2], 2]);
  }
  return P;
}

function poseOf(which: string, t: number): QlPose {
  if (which === 'walk') return walkPose(t);
  if (which === 'attack') return stabPose(t);
  if (which === 'lines') return linesPose(t);
  if (which === 'takeoff') return takeoffPose(t);
  if (which === 'fly') return flyPose(t);
  if (which === 'land') return landPose(t);
  if (which === 'write') return writePose(t);
  if (which === 'swoop') return swoopPose(t);
  if (which === 'reel') return reelPose(t);
  if (which === 'dying') return deathPose(t);
  return standPose(t);
}
/** Where its nib's point is, `which` move `t` seconds in (a point of the world, from its floor point, picture units). */
export function qlNibAt(which: string, t: number): V3 {
  return nibOf(poseOf(which, t));
}
void flat;
void unflat;

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

function worldOf(P: QlPose, p: V3): V3 {
  const cy = Math.cos(P.yaw * D), sy = Math.sin(P.yaw * D);
  const cp = Math.cos(P.pitch * D), sp = Math.sin(P.pitch * D);
  const cr = Math.cos(P.roll * D), sr = Math.sin(P.roll * D);
  const r1: V3 = [p[0], p[1] * cr - p[2] * sr, p[1] * sr + p[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  const r3: V3 = [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
  return [P.x + r3[0], P.y + r3[1], P.z + r3[2]];
}
function turned(P: QlPose, v: V3): V3 {
  return sub(worldOf(P, v), worldOf(P, [0, 0, 0]));
}
/** `v` turned by `ang` (radians) about the unit axis `ax`. */
function twist(v: V3, ax: V3, ang: number): V3 {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const k = ax[0] * v[0] + ax[1] * v[1] + ax[2] * v[2];
  return add(add(mul(v, c), mul(cross(ax, v), s)), mul(ax, k * (1 - c)));
}
/** Turned by `deg` about its left-right axis (nose down), in its own frame. */
function tilt(v: V3, deg: number): V3 {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

/** White vellum round a solid, written over in a fine black hand: rows round it, a feather's edge now and then. */
function vellumSkin(seed: number): Skin {
  return (u, tone0) => {
    const tone = [1, 2, 3, 3, 4][Math.max(0, Math.min(4, tone0))];
    const z = u[2] * 9;
    const around = Math.atan2(u[1], u[0]) * 8;
    const row = Math.floor(z / 2.2);
    if (z - row * 2.2 < 0.6 && ((around + 40 + hash(row, seed, 8411) * 4) / 3.4) % 1 < 0.6 && hash(Math.floor((around + 40) / 3.4), row + seed, 8412) < 0.55) return WHITE[Math.max(0, tone - 2)];
    return WHITE[tone];
  };
}

/** THE QUILL AS SOLIDS: its body and its plumage, its wings and tail, its neck and head, its nib, its legs and feet, its eye. */
function quillBits(P: QlPose, put: Put): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const T = (v: V3): V3 => turned(P, v);
  const fx = tilt([1, 0, 0], BODY_TILT);
  const fz = tilt([0, 0, 1], BODY_TILT);
  const fy: V3 = [0, 1, 0];
  // ITS BODY: a white egg tilted breast up, page feathers over it in rows, shingled back
  put('body', 'body', { k: 'ball', c: W([0, 0, 0]), ax: [T(mul(fx, BODY_R[0])), T(mul(fy, BODY_R[1])), T(mul(fz, BODY_R[2]))], skin: vellumSkin(3) });
  let seed = 31;
  const rows: [number, number, number, number, number, number][] = [
    [0.62, -60, 60, 4, 4.4, 5.2],
    [0.3, -70, 70, 5, 4.8, 6.0],
    [0.68, 130, 230, 3, 4.2, 5.4],
  ];
  for (const [s, a0, a1, n, w, h] of rows) {
    for (let i = 0; i < n; i++) {
      const ang = a0 + ((i + 0.5) / n) * (a1 - a0) + (hash(seed, 1, 8401) - 0.5) * 8;
      const q = Math.sqrt(1 - s * s);
      const lp: V3 = [BODY_R[0] * s, BODY_R[1] * q * Math.sin(ang * D), BODY_R[2] * q * Math.cos(ang * D)];
      const ln: V3 = norm([lp[0] / (BODY_R[0] * BODY_R[0]), lp[1] / (BODY_R[1] * BODY_R[1]), lp[2] / (BODY_R[2] * BODY_R[2])]);
      const p = add(add(mul(fx, lp[0]), mul(fy, lp[1])), mul(fz, lp[2]));
      const n0 = norm(add(add(mul(fx, ln[0]), mul(fy, ln[1])), mul(fz, ln[2])));
      const back = mul(fx, -1);
      const along = norm(sub(back, mul(n0, back[0] * n0[0] + back[1] * n0[1] + back[2] * n0[2])), [-1, 0, 0]);
      const v = norm(add(along, mul(n0, 0.25)));
      const u = cross(v, n0);
      const c = add(add(p, mul(n0, 0.8)), mul(v, h * 0.35));
      if (hash(seed, 9, 4950) < P.peel) {
        seed++;
        continue;
      }
      put('body', 'feather', { k: 'panel', c: W(c), u: T(mul(u, w)), v: T(mul(v, h)), skin: leafSkin(seed, w, h, WHITE, true, 0, 0.08) });
      seed++;
    }
  }
  // ITS WINGS: folded, each lies along its side like a cloak, row on row of page feathers: the coverts short and high, the
  // flight feathers long beneath them, their tips crossing past its tail. Spread, they swing out from the shoulder and open.
  for (const side of [1, -1]) {
    const sh: V3 = add(mul(fx, 9), add(mul(fy, side * 8.5), mul(fz, 4)));
    // (the wing's own frame: `along` from shoulder to tip, `up` across it, `out` the way its upper face looks)
    const foldAlong = norm(add(mul(fx, -1), mul(fz, -0.22)));
    const spreadAlong = norm(add(mul(fy, side), add(mul(fx, -0.25), [0, 0, Math.sin(P.lift * D)])));
    const along = norm(lerpV(foldAlong, spreadAlong, P.spread));
    const foldOut = mul(fy, side);
    const spreadOut: V3 = [0, 0, 1];
    const out0 = norm(lerpV(foldOut, spreadOut, P.spread));
    const up = norm(cross(out0, along));
    const upS = side > 0 ? mul(up, -1) : up;
    const layers: [number, number, number, number, number][] = [
      // from the shoulder along it, how far across from its leading edge, half-width, half-length, how far out
      [10, 1.5, 7.5, 9, 0.9],
      [16, -2.5, 6.5, 13, 0.5],
      [22, -5.5, 4.0, 16, 0.2],
      [25, -8.0, 3.2, 17, 0.0],
    ];
    layers.forEach(([at, across, w, h, outK], i) => {
      const c = add(add(add(sh, mul(along, at * (1 + 0.6 * P.spread))), mul(upS, across * (1 + 0.4 * P.spread))), mul(out0, 1.4 + outK));
      // (each row of feathers turned a little about the wing's length from the next, as a wing's rows fan: so the wing is never
      // seen all edge-on at once)
      const tw = (i - 1.5) * 24 * (0.25 + 0.75 * P.spread) * D;
      const ch = twist(upS, along, tw);
      put(`wing${side}`, 'feathers', { k: 'panel', c: W(c), u: T(mul(ch, w)), v: T(mul(along, h * (1 + 0.3 * P.spread))), skin: leafSkin(700 + i + (side > 0 ? 0 : 20), w, h * (1 + 0.3 * P.spread), WHITE, true, 0, 0.05) });
    });
    // (its flight feathers' tips: a few long quills fanned from the wing's end, longer when spread)
    for (let k = 0; k < 4; k++) {
      const root = add(add(sh, mul(along, 30 * (1 + 0.6 * P.spread))), mul(upS, -3 - k * 2.6));
      const dir = norm(add(along, mul(upS, -0.03 * k - 0.12 * P.spread * k)));
      const L = 7 + 1.2 * k + 7 * P.spread;
      put(`wing${side}`, 'tips', { k: 'panel', c: W(add(add(root, mul(dir, L)), mul(out0, -0.3 * k))), u: T(mul(twist(upS, dir, (k - 1.5) * 30 * D), 2)), v: T(mul(dir, L)), skin: leafSkin(740 + k + (side > 0 ? 0 : 20), 2, L, INKWHITE, true, 0, 0.0) });
    }
  }
  // ITS TAIL: short pages fanned behind and under the wings' tips
  for (let k = -1; k <= 1; k++) {
    const dir = norm(add(mul(fx, -1), add(mul(fy, k * 0.25), mul(fz, -0.45))));
    const c = add(mul(fx, -BODY_R[0] * 0.92), mul(dir, 6));
    put('tail', 'tail', { k: 'panel', c: W(c), u: T(mul(norm(cross(dir, fz)), 3.4)), v: T(mul(dir, 7)), skin: leafSkin(760 + k, 3.4, 7, WHITE, true) });
  }
  // ITS NECK: the S of it, white, a stripe of ink running down its front; a few long plumes hanging from its foot over its breast
  for (let i = 0; i + 1 < P.neck.length; i++) {
    put('neck', 'neck', { k: 'rod', a: W(P.neck[i]), b: W(P.neck[i + 1]), ra: NECK_R[i], rb: NECK_R[i + 1], ramp: WHITE });
  }
  for (let i = 1; i < P.neck.length - 1; i++) {
    const a = P.neck[i];
    const b = P.neck[i + 1];
    const along = norm(sub(b, a));
    const front = norm(cross(fy, along));
    const fr2 = front[0] < 0 ? mul(front, -1) : front;
    for (let j = 0; j < 3; j++) put('neck', 'stripe', { k: 'mote', p: W(add(lerpV(a, b, j / 3), mul(fr2, NECK_R[i] * 0.95))), c: INK[1], size: 2 });
  }
  for (let k = -1; k <= 1; k++) {
    const root = add(P.neck[1], [2, k * 2, -1]);
    const dir = norm([0.25, k * 0.1, -1]);
    put('neck', 'plume', { k: 'panel', c: W(add(root, mul(dir, 7))), u: T([0, 2.2, 0]), v: T(mul(dir, 8)), skin: leafSkin(780 + k, 2.2, 8, WHITE, true) });
  }
  // ITS HEAD, at the top of its neck, turned and tipped; its crest, two long plumes of ink trailing back from it
  const head = P.neck[P.neck.length - 1];
  const hp = P.headPitch * D;
  const hy = P.headYaw * D;
  const hf: V3 = [Math.cos(hp) * Math.cos(hy), Math.cos(hp) * Math.sin(hy), -Math.sin(hp)];
  const hl = norm(cross([0, 0, 1], hf), [0, 1, 0]);
  const hu = norm(cross(hf, hl));
  const hc = add(head, mul(hf, 3));
  put('head', 'head', { k: 'ball', c: W(hc), ax: [T(mul(hf, HEAD_R[0])), T(mul(hl, HEAD_R[1])), T(mul(hu, HEAD_R[2]))], skin: vellumSkin(9) });
  // (a cap of ink over its crown, as a heron's black brow)
  put('head', 'cap', { k: 'ball', c: W(add(hc, add(mul(hu, 2.6), mul(hf, -0.5)))), ax: [T(mul(hf, HEAD_R[0] * 0.8)), T(mul(hl, HEAD_R[1] * 0.9)), T(mul(hu, 2.4))], skin: inkSkin() });
  for (const k of [0, 1]) {
    const root = add(hc, add(mul(hf, -HEAD_R[0] * 0.7), mul(hu, 2.5)));
    const tip = add(root, add(mul(hf, -16 - 4 * k), add(mul(hu, -3 - 3 * k), mul(hl, (k ? -1 : 1) * 1.5))));
    put('head', 'crest', { k: 'rod', a: W(root), b: W(tip), ra: 1.2, rb: 0.3, ramp: INK });
  }
  // ITS NIB: a long steel pen point, broad at its base and slit to its point, the two halves parting as it gapes
  const base = add(hc, mul(hf, HEAD_R[0] * 0.8));
  const tipU = add(base, add(mul(hf, BEAK), mul(hu, P.gape * 3)));
  const tipL = add(base, add(mul(hf, BEAK * 0.97), mul(hu, -P.gape * 3)));
  const steel = P.glint > 0.6 ? FLAME.slice(1).concat([FLAME[4]]) as unknown as typeof STEEL : STEEL;
  put('head', 'nibU', { k: 'rod', a: W(add(base, mul(hu, 1.2))), b: W(tipU), ra: 2.6, rb: 0.35, ramp: steel });
  put('head', 'nibL', { k: 'rod', a: W(add(base, mul(hu, -1.2))), b: W(tipL), ra: 2.4, rb: 0.35, ramp: steel });
  // (the nib's breather hole, and the ink in its slit)
  put('head', 'breather', { k: 'dot', p: W(add(add(base, mul(hf, 5)), mul(hu, 2.4))), c: INK[0], facing: T(hu) });
  for (let j = 1; j <= 5; j++) put('head', 'slit', { k: 'mote', p: W(add(lerpV(base, lerpV(tipU, tipL, 0.5), 0.3 + j * 0.12), mul(hu, 0.1))), c: INK[0], size: 1 });
  // ITS EYE, the enemy's pink, either side of its head
  if (P.eye > 0.2) {
    for (const s of [1, -1]) put('head', `eye${s}`, { k: 'dot', p: W(add(add(hc, mul(hf, 2.4)), add(mul(hl, s * HEAD_R[1] * 0.92), mul(hu, 1.2)))), c: FLAME[2], facing: T(mul(hl, s)), c2: FLAME[3] });
    put('glow', 'eye', { k: 'glow', p: W(add(hc, mul(hf, 2))), c: FLAME[2], r: 7, a: 0.2 * P.eye });
  }
  // ITS LEGS: long and thin, the Order's ink; the joint that bends back halfway down; three long toes forward and one back
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    const hip = W(add(add(mul(fx, HIP[0]), mul(fy, side * HIP[1])), mul(fz, HIP[2])));
    const foot = P.feet[k];
    const mid = lerpV(hip, foot, 0.48);
    const back = norm([-(foot[1] - hip[1]) * 0, 0, 0], [-1, 0, 0]);
    const ankle = add(mid, mul(turned(P, back), 4.5 * P.ankle[k]));
    put(`leg${k}`, 'shank', { k: 'rod', a: hip, b: ankle, ra: 2.4, rb: 1.5, ramp: INK });
    put(`leg${k}`, 'shin', { k: 'rod', a: ankle, b: [foot[0], foot[1], foot[2] + 1], ra: 1.5, rb: 1.3, ramp: INK });
    put(`leg${k}`, 'ankle', { k: 'ball', c: ankle, ax: [[1.9, 0, 0], [0, 1.9, 0], [0, 0, 1.9]], skin: INK });
    const fw0 = turned(P, [1, 0, 0]);
    const fwd = norm([fw0[0], fw0[1], 0], [1, 0, 0]);
    const left = norm(cross([0, 0, 1], fwd));
    for (const [a, L] of [[-28, 10], [0, 12], [28, 10], [180, 6]] as const) {
      const d = norm(add(mul(fwd, Math.cos(a * D)), mul(left, Math.sin(a * D))));
      put(`leg${k}`, 'toe', { k: 'rod', a: [foot[0], foot[1], foot[2] + 0.9], b: add(foot, add(mul(d, L), [0, 0, 0.6])), ra: 1.1, rb: 0.4, ramp: INK });
    }
  }
}

/** One frame of the Quill: `which` (stand, for now), `t` seconds in, from in front or behind. */
export function quillPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, QL_CANVAS.ax, QL_CANVAS.ay, QL_CANVAS);
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  quillBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  const lights = paintBits(st, bits, [P.x, P.y, P.z]);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[2], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
export function quillFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(quillPainted(which, t, view), which === 'dying' ? null : QL_AURA, QL_CANVAS.ax, QL_CANVAS.ay);
}
export function quillSolids(which: string, t: number): Bit[] {
  const bits: Bit[] = [];
  quillBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  return bits;
}

/** How long each of its moves is (seconds; a loop, its round). */
export function quillLong(which: string): number {
  return (
    {
      stand: QL_STAND.period,
      walk: QL_WALK.period,
      attack: QL_STAB.long,
      lines: QL_LINES.long,
      takeoff: QL_TAKEOFF.long,
      fly: QL_FLY.period,
      land: QL_LAND.long,
      write: QL_WRITE.period,
      swoop: QL_SWOOP.long,
      reel: QL_REEL.long,
      dying: QL_DIE.long,
    } as Record<string, number>
  )[which] ?? 1;
}
/** THE QUILL, as the game holds a monster's pictures: its stand and wade; its nib stab the attack; ink lines, taking off, flying (a loop), landing, writing (a loop) and its half of the Palimpsest (`swoop`) its moves; struck; its death. */
export function makeQuillArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => quillFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const loop = (which: string, frames: number, fps: number): Clip => ({ frames: lazyFrames(frames, (i) => frame(which, i / fps)), fps, loop: 0 });
    const attack = clip('attack', QL_STAB.long, QL_STAB.fps, QL_STAB.hit);
    return {
      idle: lazyFrames(QL_STAND.frames, (i) => frame('stand', i / QL_STAND.fps)),
      walk: lazyFrames(QL_WALK.frames, (i) => frame('walk', i / QL_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[8, 18, 22][i]]),
      idleFps: QL_STAND.fps,
      walkFps: QL_WALK.fps,
      clips: {
        attack,
        reel: clip('reel', QL_REEL.long, QL_REEL.fps),
        die: clip('dying', QL_DIE.long, QL_DIE.fps),
        moves: {
          lines: clip('lines', QL_LINES.long, QL_LINES.fps, QL_LINES.strokes[0][0]),
          takeoff: clip('takeoff', QL_TAKEOFF.long, QL_TAKEOFF.fps),
          fly: loop('fly', QL_FLY.frames, QL_FLY.fps),
          land: clip('land', QL_LAND.long, QL_LAND.fps),
          write: loop('write', QL_WRITE.frames, QL_WRITE.fps),
          swoop: clip('swoop', QL_SWOOP.long, QL_SWOOP.fps, QL_SWOOP.go),
        },
      },
    };
  };
  return { front: set('front'), back: set('back') };
}
