// FLOOR 13'S DOUBLE BOSS, THE FIRST OF THE TWO: THE SCRAPER (the art chat, 20 Oct 2026). A MOCK-UP: NOT IN THE GAME (PAIR_ON,
// off). The other is the Quill (art/quill.ts); what they are made of, art/pair_skins.ts, with his words.
//
// THE SCRAPER: a giant crayfish of sodden, layered pages, as long as four tiles from the tip of its claws to its tail fan, its
// back as high as the knight's chest. Its shell is plate on plate of wet grey paper written over in the Order's black ink;
// where the plates part, the old writing under them, brown on yellowed vellum, the stolen words burning in it the enemy's
// pink. Its two great claws are the Order's ink, black and wet and glossy, their inner edges scraping knives. Long whips of
// antennae sweep back over it; its eyes on stalks burn pink. It is what scrapes a page clean.
//
// NOT ON THE HEROES' BONES: eight legs, two claws and a tail; painted from its own solids, as the canyon scorpion is
// (art/canyon_scorpions.ts), in the same painter (art/new_mobs3.ts paintBits).
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before anything
// moves), and its stand.

import type { Px, Sprite } from '../engine/px';
import { hash, lazyFrames, toSprite } from './kit';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import type { Painted } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';
import { INK, OLDV, PULPG, SODDEN, inkSkin, leafSkin, oldLayers, rolledSkin } from './pair_skins';
import type { Skin } from './skin';

/** Its legs' rolled pulp, dark and wet. */
const DARKP: typeof INK = ['#121110', '#22201d', '#3a3732', '#57534a', '#746e62'];
/** Its fan's pages: sodden grey, soaked darker toward their ends, their torn ends dipped in the Order's ink. */
function fanSkin(seed: number, lu: number, lv: number): import('./new_mobs3').PanelSkin {
  const page = leafSkin(seed, lu, lv, SODDEN, false, 0, 0.6);
  return (a, b, front, tone) => {
    const c = page(a, b, front, tone);
    if (c === null) return null;
    if (b > lv * 0.55) return INK[Math.max(0, Math.min(4, tone - 1))];
    if (b > lv * 0.2) return SODDEN[Math.max(0, Math.min(4, tone - 2))];
    return c;
  };
}
/** Under its plates, where they part: the old layers deep in shadow, a stolen word burning in them here and there. */
function deepLayers(seed: number, scale: V3): Skin {
  const old = oldLayers(seed, scale, 0.6) as (u: V3, tone: number) => string | null;
  return (u, tone) => {
    const c = old(u, tone);
    if (c && (c.startsWith('#ff') || c.startsWith('#c0'))) return c;
    return OLDV[Math.max(0, Math.min(2, tone - 2))];
  };
}

/** THE SWITCH, OFF: nothing of the game reads this file (nor art/quill.ts). */
export const PAIR_ON = { on: false };

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
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
export const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high). x forward, y to its left, z up; its own frame has the middle of its
// shell at the origin.

/** Its shell's middle over the floor, at rest. */
export const SR_BODY_Z = 17;
/** Its shell (the carapace): its middle and half-lengths; its snout's tip. */
const CARA_C: V3 = [4, 0, 1];
const CARA_R: V3 = [26, 15, 12.5];
const SNOUT: V3 = [36, 0, 3];
/** Its tail: where it starts, each of its six segments' length and half-widths across and up; then its fan. */
const ABD_ROOT: V3 = [-21, 0, 0];
const ABD_LEN = [10.5, 10, 9.6, 9.2, 8.6, 8];
const ABD_RY = [15.5, 14.5, 13.2, 11.8, 10.2, 8.6];
const ABD_RZ = [11.5, 10.8, 10, 9, 8, 7];
/** Its tail at rest: how far each segment points down from straight back (degrees): laid out behind it, curving to the floor. */
const ABD_REST = [-2, 6, 10, 13, 15, 16];
/** Its eight legs: where each comes out from under its shell (its own frame), front pair first; its feet at rest, splayed wide. */
const HIP: V3[] = [
  [17, 10, -9], [17, -10, -9],
  [8, 12, -10], [8, -12, -10],
  [-1, 12.5, -10], [-1, -12.5, -10],
  [-10, 11.5, -9], [-10, -11.5, -9],
];
export const SR_FEET: V3[] = [
  [24, 22, 0], [24, -22, 0],
  [12, 25, 0], [12, -25, 0],
  [0, 26, 0], [0, -26, 0],
  [-12, 23, 0], [-12, -23, 0],
];
/** Its claws: each arm's shoulder (its own frame), its hand at rest, held out before it and a little raised; the palm's half-lengths; a finger's length. */
const SHOULDER: V3 = [26, 10, -3];
const HAND: V3 = [64, 30, 19];
const PALM_R: V3 = [19, 11, 9.5];
const FINGER = 26;
/** Its antennae: where each rises, and its four lengths; the way each points at rest (degrees: round from straight ahead toward its side, and up). */
const ANT_ROOT: V3 = [35, 5, 6];
const ANT_LEN = [16, 22, 26, 30];
const ANT_REST: [number, number][] = [[10, 44], [38, 32], [80, 18], [122, 6]];

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: ten frames a second, a loop of 2.4 s: heavy and still, breathing, its antennae sweeping, its claws working. */
export const SR_STAND = { frames: 24, fps: 10, period: 2.4 } as const;
/** The canvas it is painted on, and its floor point on it: room for its claws out before it and its tail behind, and for its moves. */
export const SR_CANVAS = { w: 780, h: 560, ax: 390, ay: 350 };
/** Its pool of light while it lives (the enemy's pink, faint). */
const SR_AURA = { x: SR_CANVAS.ax, y: SR_CANVAS.ay - 12, r: 70, color: '#ff3a78', a: 0.07 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

export interface SrPose {
  /** Its middle, forward and to its left and up, from its floor point; how it is turned (degrees: to its left, nose down, rolled to its right). */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Each foot's place on the floor's own grid, and how high each knee arches over its leg. */
  feet: V3[];
  knee: number[];
  /** Its tail: how far each segment points down from straight back (degrees); its fan spread (0 shut, 1 wide). */
  abd: number[];
  fan: number;
  /** Each claw's hand (its own frame), how far each is open (0 shut, 1 wide), and its edge's glint (0 to 1). */
  hands: [V3, V3];
  open: [number, number];
  glint: number;
  /** Its antennae: each one's three angles (up from straight back, out to its side), left then right. */
  ants: [[number, number][], [number, number][]];
  /** Its eyes' burn (0 out) and its stalks' lean (degrees forward). */
  eyes: number;
  stalk: number;
  alive: boolean;
  /** How far its plates have peeled off and flown (0 none, 1 all: as it dies). */
  peel: number;
  /** Grains its moves throw off (place, colour, size), laid over its picture; and lights. */
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

/** Its stand: heavy and still; it breathes, its plates lifting a little; its antennae sweep slowly, each its own way; its claws open and shut by turns; ink drips off them. */
function standPose(t: number): SrPose {
  const a = (Math.PI * 2 * t) / SR_STAND.period;
  const ant = (side: number): [number, number][] => ANT_REST.map(([round, up], i) => [round + 10 * Math.sin(a + side * 2 + i * 0.5) * (i / 3), up + 6 * Math.sin(a + side * 1.3 + i * 0.6)]);
  const drip: [V3, string, number][] = [];
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    const ph = (t / SR_STAND.period + k * 0.5) % 1;
    const z = 10 - 70 * ph * ph;
    if (z > 0.6) drip.push([[SR_BODY_Z * 0 + HAND[0] + 4, side * HAND[1], z], INK[1], 2]);
  }
  return {
    x: 0,
    y: 0,
    z: SR_BODY_Z + 0.5 * Math.sin(a),
    yaw: 0,
    pitch: 0.8 * Math.sin(a),
    roll: 0,
    feet: SR_FEET.map((f) => f),
    knee: SR_FEET.map(() => 9),
    abd: ABD_REST.map((d, i) => d + 2 * Math.sin(a + i * 0.5) * (i / 5)),
    fan: 0.85 + 0.1 * Math.sin(a),
    hands: [
      [HAND[0], HAND[1], HAND[2] + 1.5 * Math.sin(a)],
      [HAND[0], -HAND[1], HAND[2] + 1.5 * Math.sin(a + Math.PI)],
    ],
    open: [0.2 + 0.25 * Math.max(0, Math.sin(a)), 0.2 + 0.25 * Math.max(0, Math.sin(a + Math.PI))],
    glint: 0,
    ants: [ant(1), ant(-1)],
    eyes: 1 + 0.15 * Math.sin(2 * a),
    stalk: 4 * Math.sin(a),
    alive: true,
    peel: 0,
    chips: drip,
    flares: [],
  };
}

// ---------------------------------------------------------------------------------------------
// ITS MOVES. Each a run of keys (seconds, and what it is then), eased between; a tremble laid over its warnings.

type Num = number;
/** Eased from key to key (smoothstep between each pair; `ease` per key: 'out' an overshoot that settles, 'in' slow then fast, 'lin'). */
export function keyed<T>(t: number, keys: ReadonlyArray<readonly [number, T, string?]>, mix: (a: T, b: T, k: number) => T): T {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, ease] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const u = (t - t0) / Math.max(1e-6, t1 - t0);
      const k = ease === 'in' ? u * u : ease === 'out' ? backOut(u) : ease === 'lin' ? u : sm(u);
      return mix(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}
const mixNum = (a: Num, b: Num, k: number): Num => a + (b - a) * k;
const mixArr = (a: number[], b: number[], k: number): number[] => a.map((v, i) => v + (b[i] - v) * k);
export const KN = (t: number, keys: ReadonlyArray<readonly [number, Num, string?]>): number => keyed(t, keys, mixNum);
export const KV = (t: number, keys: ReadonlyArray<readonly [number, V3, string?]>): V3 => keyed(t, keys, lerpV);
export const KA = (t: number, keys: ReadonlyArray<readonly [number, number[], string?]>): number[] => keyed(t, keys, mixArr);
/** Eased with an overshoot that settles (a follow-through): smooth from rest, past the mark by about a twentieth, and back. */
export function backOut(v: number): number {
  const u = cl01(v);
  return sm(u) + 0.3 * u * Math.sin(Math.PI * u);
}
/** A tremble, `amp` units, while t is within [a, b]. */
export const shake = (t: number, a: number, b: number, amp: number, k: number): number => (t > a && t < b ? amp * Math.sin(t * 150 + k * 2.1) : 0);
const pairOf = (v: V3): [V3, V3] => [[v[0], v[1], v[2]], [v[0], -v[1], v[2]]];
const STAND0 = standPose(0);

/** Paper shreds and grit thrown off the floor from `c` at `t0`: flung out and up, falling, gone `life` after. */
export function shreds(c: V3, t0: number, t: number, n: number, seed: number, reach: number, up: number, life = 0.6, cols: readonly string[] = ['#a29a86', '#827c6c', '#d2c9b0', '#14121a']): [V3, string, number][] {
  const s = t - t0;
  if (s < 0 || s >= life) return [];
  const out: [V3, string, number][] = [];
  const k = s / life;
  for (let i = 0; i < n; i++) {
    if (hash(i, 7, seed) < k * 0.7) continue;
    const a = hash(i, 1, seed) * Math.PI * 2;
    const r = reach * (1 - (1 - k) * (1 - k)) * (0.4 + 0.6 * hash(i, 2, seed));
    const z = Math.max(0.6, up * (0.4 + 0.6 * hash(i, 3, seed)) * s * 3 - 120 * s * s);
    out.push([[c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z], cols[i % cols.length], hash(i, 4, seed) < 0.3 ? 3 : 2]);
  }
  return out;
}

/** ITS TIMES, THE MOVES (seconds; `fps` 30). */
/** Its walk, a heavy scuttle: four legs down at a time, twelve frames a second, a stride of a second. The game carries it over the floor at SR_PACE. */
export const SR_WALK = { frames: 12, fps: 12, period: 1.0 } as const;
/** How fast it scuttles (tiles a second). */
export const SR_PACE = 1.0;
/** CLAW SNAP, its basic blow: its left claw drawn back high and wide open (the warning, from `warn[0]`, held trembling to `warn[1]`); it lunges and the claw snaps shut through you at `hit`, its fingers' tips `reach` tiles before its middle. */
export const SR_SNAP = { long: 1.0, warn: [0.16, 0.36], hit: 0.5, reach: 3.5, fps: 30 } as const;
/**
 * THE SCOUR: it rears up, both claws raised high and wide (the warning, `warn`); slams them down on the floor out at its sides
 * (`slam`) and drags them in across the floor before it in a great arc, scraping it bare (`sweep`), until they clash together
 * before it. The floor it scrapes: a fan before it from SCOUR_HALF either side of straight ahead, out to SCOUR_REACH tiles
 * from its middle (art/pair_shots.ts drawScour).
 */
export const SR_SCOUR = { long: 2.6, warn: [0.32, 0.82], slam: 1.0, sweep: [1.0, 1.5], fps: 30 } as const;
/**
 * THE BACKWARD RUSH: it crouches, its tail cocked high and its fan spread wide and shaking (the warning, `warn`); its tail
 * snaps down and under it (`flip`) and it shoots backward: THE GAME CARRIES IT back RUSH_TILES along the way it faces,
 * between `go` and `stop`, whoever is in its lane struck by its fan and its bulk; then it settles, its claws up.
 */
export const SR_RUSH = { long: 1.9, warn: [0.18, 0.54], flip: 0.66, go: 0.7, stop: 1.2, fps: 30 } as const;
export const RUSH_TILES = 5;
/**
 * THE PALIMPSEST, ITS HALF (the combo, with the Quill's: art/quill.ts QL_SWOOP): it rears, both claws raised together over its
 * head (the warning, `warn`); slams them down together on the floor before it (`slam`), and the scrape runs out from them
 * across the floor in a straight strip (`run`), STRIP_TILES long: the strip lies bare for the Quill to write over.
 */
export const SR_STRIP = { long: 2.6, warn: [0.3, 0.82], slam: 1.0, run: [1.0, 1.5], fps: 30 } as const;
/** Struck: jolted, its claws flung up and out, a plate or two torn loose; back on its stand by `long`. */
export const SR_REEL = { long: 0.55, freeze: 0.06, fps: 30 } as const;
/** Its death: its claws drop (`drop`); it sags, its legs give (`sag`); its plates peel off and fly (`peel`), the stolen words going free out of the old writing under them; flat and still by `still`. */
export const SR_DIE = { long: 3.2, drop: 0.4, sag: [0.3, 1.0], peel: [0.8, 2.6], still: 2.9, fps: 30 } as const;

/** A foot as the walk puts it, `u` its phase: down for the first half, carried back as the body goes over it; swung through the air the second. */
const W_HALF = (SR_PACE * 39.19 * SR_WALK.period) / 2 / 2;
const W_LIFT = 6;
const W_OFF = [0, 0.5, 0.5, 0, 0, 0.5, 0.5, 0];
function stepFoot(i: number, u: number): V3 {
  const r = SR_FEET[i];
  if (u < 0.5) return [r[0] + W_HALF * (1 - 4 * u), r[1], 0];
  const v = (u - 0.5) * 2;
  return [r[0] + W_HALF * (-1 + 2 * sm(v)), r[1], W_LIFT * Math.sin(Math.PI * v)];
}
/** Its walk: its legs in two sets of four taking turns; its body rolling a little with them; its claws held before it, bobbing by turns; its tail swaying. */
function walkPose(t: number): SrPose {
  const ph = (t / SR_WALK.period) % 1;
  const a = Math.PI * 2 * ph;
  const feet = SR_FEET.map((_, i) => stepFoot(i, (ph + W_OFF[i]) % 1));
  const base = standPose((t / SR_WALK.period) * SR_STAND.period);
  return {
    ...base,
    z: SR_BODY_Z + 1.2 * Math.pow(Math.sin(a), 2),
    yaw: 2.5 * Math.sin(a),
    roll: 2.5 * Math.sin(a),
    pitch: 1.2 * Math.sin(2 * a),
    feet,
    knee: feet.map((f) => 9 + 0.5 * f[2]),
    abd: ABD_REST.map((d, i) => d + 4 * Math.sin(a + i * 0.7) * (i / 5)),
    hands: [
      [HAND[0] + 2, HAND[1], HAND[2] + 3 * Math.sin(a)],
      [HAND[0] + 2, -HAND[1], HAND[2] - 3 * Math.sin(a)],
    ],
    open: [0.15, 0.15],
    chips: [],
  };
}

/** CLAW SNAP. */
function snapPose(t: number): SrPose {
  const S = SR_SNAP;
  const P: SrPose = { ...STAND0, feet: STAND0.feet, chips: [], flares: [] };
  const H0: V3 = [HAND[0], HAND[1], HAND[2]];
  const COCK: V3 = [40, 50, 40];
  const STRIKE: V3 = [104, 8, 8];
  const tr = shake(t, S.warn[0], S.warn[1], 1.2, 1);
  const hand = KV(t, [
    [0, H0],
    [S.warn[0], COCK],
    [S.warn[1], COCK],
    [S.hit, STRIKE, 'in'],
    [S.hit + 0.12, add(STRIKE, [4, -2, -2])],
    [S.long, H0, 'out'],
  ]);
  const other: V3 = [HAND[0] - 6, -HAND[1] + 4, HAND[2] - 4];
  P.hands = [[hand[0], hand[1] + tr, hand[2] + tr], KV(t, [[0, STAND0.hands[1]], [S.warn[0], other], [S.long - 0.2, other], [S.long, STAND0.hands[1]]])];
  P.open = [KN(t, [[0, STAND0.open[0]], [S.warn[0], 1], [S.hit - 0.02, 1], [S.hit, 0], [S.hit + 0.2, 0], [S.long, STAND0.open[0]]]), KN(t, [[0, STAND0.open[1]], [S.warn[0], 0.2], [S.long - 0.2, 0.2], [S.long, STAND0.open[1]]])];
  P.glint = KN(t, [[0, 0], [S.warn[0], 0.7], [S.warn[1], 1], [S.hit, 1], [S.hit + 0.15, 0]]);
  P.x = KN(t, [[0, 0], [S.warn[0], -4], [S.warn[1], -5], [S.hit, 9, 'in'], [S.hit + 0.12, 10], [S.long, 0, 'out']]);
  P.z = KN(t, [[0, SR_BODY_Z], [S.warn[0], SR_BODY_Z + 3], [S.warn[1], SR_BODY_Z + 3], [S.hit, SR_BODY_Z - 2], [S.long, SR_BODY_Z]]);
  P.pitch = KN(t, [[0, 0], [S.warn[0], -9], [S.warn[1], -9], [S.hit, 7, 'in'], [S.hit + 0.12, 8], [S.long, 0, 'out']]);
  P.yaw = KN(t, [[0, 0], [S.warn[0], 12], [S.warn[1], 12], [S.hit, -8, 'in'], [S.long, 0, 'out']]);
  P.eyes = 1 + 0.5 * P.glint;
  // (the snap: a clack of pale grit and ink where the fingers meet, the floor under them spattered)
  if (t >= S.hit && t < S.hit + 0.08) {
    const at = worldOf(P, add(STRIKE, [PALM_R[0] + FINGER * 0.8, 0, 0]));
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = 4 + 9 * ((t - S.hit) / 0.08);
      P.chips.push([[at[0] + Math.cos(a) * r * 0.6, at[1] + Math.sin(a) * r, Math.max(0.6, at[2] + Math.cos(a) * r * 0.5)], i % 2 ? '#fff0d8' : FLAME[3], 2]);
    }
  }
  return P;
}

/** THE SCOUR. */
function scourPose(t: number): SrPose {
  const S = SR_SCOUR;
  const P: SrPose = { ...STAND0, feet: STAND0.feet, chips: [], flares: [] };
  const UP: V3 = [36, 58, 52];
  const DOWN: V3 = [46, 84, 6];
  const tr = shake(t, S.warn[0], S.warn[1], 1.4, 2);
  // (the sweep: each claw dragged in across the floor along an arc before it, from out at its side to before it)
  const arcAt = (u: number): V3 => {
    const ang = (82 - 76 * u) * D;
    const r = 86 + 6 * Math.sin(Math.PI * u);
    return [12 + Math.cos(ang) * r, Math.sin(ang) * r, 5];
  };
  let h: V3;
  if (t < S.slam) h = KV(t, [[0, HAND], [0.3, UP, 'out'], [S.warn[1], UP], [S.slam, DOWN, 'in']]);
  else if (t < S.sweep[1]) h = arcAt(sm((t - S.sweep[0]) / (S.sweep[1] - S.sweep[0])));
  else h = KV(t, [[S.sweep[1], arcAt(1)], [S.sweep[1] + 0.1, add(arcAt(1), [4, -4, 2])], [S.long, HAND, 'out']]);
  P.hands = [[h[0], h[1] + tr, h[2] + tr], [h[0], -h[1] - tr, h[2] + tr]];
  P.open = [KN(t, [[0, 0.2], [0.3, 1], [S.slam, 0.8], [S.sweep[1], 0.6], [S.sweep[1] + 0.06, 0], [S.long, 0.2]]), 0];
  P.open[1] = P.open[0];
  P.glint = KN(t, [[0, 0], [0.3, 0.8], [S.warn[1], 1], [S.sweep[1], 1], [S.sweep[1] + 0.3, 0]]);
  P.z = KN(t, [[0, SR_BODY_Z], [0.3, SR_BODY_Z + 9, 'out'], [S.warn[1], SR_BODY_Z + 9], [S.slam, SR_BODY_Z - 3, 'in'], [S.sweep[1], SR_BODY_Z - 2], [S.long, SR_BODY_Z, 'out']]);
  P.pitch = KN(t, [[0, 0], [0.3, -20, 'out'], [S.warn[1], -20], [S.slam, 9, 'in'], [S.sweep[1], 6], [S.long, 0, 'out']]);
  P.x = KN(t, [[0, 0], [0.3, -4], [S.warn[1], -5], [S.slam, 4, 'in'], [S.sweep[1], 12], [S.long, 0, 'out']]);
  P.abd = KA(t, [[0, ABD_REST], [0.3, ABD_REST.map((d, i) => d + 10 + 3 * i)], [S.warn[1], ABD_REST.map((d, i) => d + 10 + 3 * i)], [S.slam, ABD_REST.map((d) => d - 6)], [S.long, ABD_REST, 'out']]);
  P.fan = KN(t, [[0, 0.85], [0.3, 1.2], [S.slam, 1.3], [S.long, 0.85]]);
  P.eyes = 1 + 0.6 * P.glint;
  P.ants = [STAND0.ants[0].map(([r, u], i): [number, number] => [r + 20 * P.glint * (i / 3), u + 14 * P.glint]), STAND0.ants[1].map(([r, u], i): [number, number] => [r + 20 * P.glint * (i / 3), u + 14 * P.glint])];
  // the slam: grit and shreds bursting from under each claw; the sweep: a spray of paper and grit thrown off before each claw as it scrapes
  for (const s of [1, -1]) {
    const at = worldOf(P, [DOWN[0], s * DOWN[1], 0]);
    P.chips.push(...shreds([at[0], at[1], 0], S.slam, t, 18, 31 + s, 26, 30, 0.5));
  }
  if (t >= S.sweep[0] && t < S.sweep[1] + 0.25) {
    for (const k of [0, 1]) {
      for (let j = 0; j < 6; j++) {
        const tj = t - j * 0.035;
        if (tj < S.sweep[0] || tj > S.sweep[1]) continue;
        const p = arcAt(sm((tj - S.sweep[0]) / (S.sweep[1] - S.sweep[0])));
        const w = worldOf(P, [p[0] + 14, (k ? -1 : 1) * p[1], 0]);
        const age = t - tj;
        P.chips.push([[w[0] + 6 * age * 30 * (hash(j, k, 77) - 0.5), w[1] + 5 * age * 30 * (hash(j, k, 78) - 0.5), 1 + 60 * age - 200 * age * age], j % 3 ? '#d2c9b0' : '#14121a', 2]);
      }
    }
    P.flares.push([worldOf(P, [arcAt(0.5)[0], 0, 4]), 30, 0.25]);
  }
  return P;
}

/** THE BACKWARD RUSH. */
function rushPose(t: number): SrPose {
  const S = SR_RUSH;
  const P: SrPose = { ...STAND0, feet: STAND0.feet, chips: [], flares: [] };
  const COCKED = [-12, -16, -12, -6, 0, 6];
  const UNDER = [26, 46, 60, 66, 62, 56];
  const tr = shake(t, S.warn[0], S.warn[1], 3, 3);
  P.abd = KA(t, [[0, ABD_REST], [S.warn[0], COCKED, 'out'], [S.warn[1], COCKED], [S.flip, UNDER, 'in'], [S.stop, UNDER], [S.stop + 0.3, ABD_REST.map((d) => d + 4), 'out'], [S.long, ABD_REST]]).map((d, i) => d + tr * (i / 5));
  P.fan = KN(t, [[0, 0.85], [S.warn[0], 1.35], [S.flip, 1.4], [S.stop, 1.0], [S.long, 0.85]]) + 0.06 * tr;
  P.z = KN(t, [[0, SR_BODY_Z], [S.warn[0], SR_BODY_Z - 4], [S.warn[1], SR_BODY_Z - 4], [S.flip, SR_BODY_Z + 7, 'in'], [S.stop, SR_BODY_Z + 5], [S.stop + 0.2, SR_BODY_Z - 2], [S.long, SR_BODY_Z, 'out']]);
  P.pitch = KN(t, [[0, 0], [S.warn[0], 6], [S.warn[1], 6], [S.flip, -14, 'in'], [S.stop, -10], [S.stop + 0.2, 4], [S.long, 0, 'out']]);
  const IN: V3 = [42, 20, 10];
  const TRAIL: V3 = [80, 34, 16];
  const h = KV(t, [[0, HAND], [S.warn[0], IN, 'out'], [S.warn[1], IN], [S.flip, TRAIL, 'in'], [S.stop, TRAIL], [S.long, HAND, 'out']]);
  P.hands = pairOf(h);
  P.open = [KN(t, [[0, 0.3], [S.warn[0], 0], [S.flip, 0.7], [S.stop, 0.8], [S.long, 0.3]]), 0];
  P.open[1] = P.open[0];
  // (its legs lifted off the floor as it shoots back, trailing before it; set down as it stops)
  const lift = KN(t, [[0, 0], [S.flip, 0], [S.go, 7, 'in'], [S.stop, 7], [S.stop + 0.12, 0]]);
  const reach = KN(t, [[0, 0], [S.flip, 0], [S.go, 10], [S.stop, 10], [S.stop + 0.12, 0]]);
  P.feet = SR_FEET.map((f): V3 => [f[0] + reach, f[1] * 0.92, lift]);
  P.knee = SR_FEET.map(() => 9 + lift * 0.4);
  P.eyes = KN(t, [[0, 1], [S.warn[0], 1.6], [S.stop, 1.4], [S.long, 1]]);
  P.glint = KN(t, [[0, 0], [S.warn[0], 0.6], [S.flip, 1], [S.stop, 0.6], [S.long, 0]]);
  // (the flip: water and shreds flung up where its fan strikes the floor; the dash: its wake thrown off before it)
  const fanAt = worldOf(P, [-80, 0, -10]);
  P.chips.push(...shreds([fanAt[0], fanAt[1], 0], S.flip, t, 22, 51, 30, 40, 0.5));
  if (t > S.go && t < S.stop + 0.2) {
    for (let j = 0; j < 14; j++) {
      const age = (t - S.go + j * 0.03) % 0.3;
      const w = worldOf(P, [60 + 120 * age, (hash(j, 1, 61) - 0.5) * 50, 0]);
      P.chips.push([[w[0], w[1], Math.max(0.6, 4 + 50 * age - 160 * age * age)], j % 3 ? '#a29a86' : '#14121a', 2]);
    }
  }
  return P;
}

/** THE PALIMPSEST, ITS HALF: the strip scraped. */
function stripPose(t: number): SrPose {
  const S = SR_STRIP;
  const P: SrPose = { ...STAND0, feet: STAND0.feet, chips: [], flares: [] };
  const OVER: V3 = [44, 12, 62];
  const DOWN: V3 = [94, 11, 5];
  const PUSH: V3 = [104, 9, 4];
  const tr = shake(t, S.warn[0], S.warn[1], 1.5, 4);
  const h = KV(t, [[0, HAND], [S.warn[0], OVER, 'out'], [S.warn[1], OVER], [S.slam, DOWN, 'in'], [S.run[1], PUSH], [S.run[1] + 0.4, PUSH], [S.long, HAND, 'out']]);
  P.hands = [[h[0], h[1], h[2] + tr], [h[0], -h[1], h[2] + tr]];
  P.open = [KN(t, [[0, 0.3], [S.warn[0], 0], [S.long, 0.3]]), 0];
  P.open[1] = P.open[0];
  P.glint = KN(t, [[0, 0], [S.warn[0], 0.8], [S.warn[1], 1], [S.run[1], 1], [S.run[1] + 0.4, 0]]);
  P.z = KN(t, [[0, SR_BODY_Z], [S.warn[0], SR_BODY_Z + 10, 'out'], [S.warn[1], SR_BODY_Z + 10], [S.slam, SR_BODY_Z - 1.5, 'in'], [S.run[1], SR_BODY_Z - 1], [S.long, SR_BODY_Z, 'out']]);
  P.pitch = KN(t, [[0, 0], [S.warn[0], -24, 'out'], [S.warn[1], -24], [S.slam, 12, 'in'], [S.run[1], 10], [S.long, 0, 'out']]);
  P.x = KN(t, [[0, 0], [S.warn[0], -6], [S.warn[1], -7], [S.slam, 6, 'in'], [S.run[1], 10], [S.long, 0, 'out']]);
  P.abd = KA(t, [[0, ABD_REST], [S.warn[0], ABD_REST.map((d, i) => d + 12 + 3 * i)], [S.warn[1], ABD_REST.map((d, i) => d + 12 + 3 * i)], [S.slam, ABD_REST.map((d) => d - 8)], [S.long, ABD_REST, 'out']]);
  P.fan = KN(t, [[0, 0.85], [S.warn[0], 1.3], [S.long, 0.85]]);
  P.eyes = 1 + 0.6 * P.glint;
  const at = worldOf(P, [DOWN[0] + 20, 0, 0]);
  P.chips.push(...shreds([at[0], at[1], 0], S.slam, t, 26, 91, 30, 44, 0.6));
  return P;
}

/** Struck: jolted back, its claws flung up and out, its antennae whipping; two plates torn loose and flung. */
function reelPose(t: number): SrPose {
  const R = SR_REEL;
  if (t < R.freeze) return { ...STAND0, eyes: 1.6, chips: [], flares: [] };
  const k = cl01((t - R.freeze) / (R.long - R.freeze));
  const arc = Math.sin(Math.PI * Math.min(1, k * 1.25)) * (1 - 0.2 * k);
  const P: SrPose = {
    ...STAND0,
    x: -9 * arc,
    z: SR_BODY_Z + 5 * arc,
    pitch: -14 * arc,
    roll: 8 * Math.sin(3 * Math.PI * k) * (1 - k),
    hands: [lerpV(STAND0.hands[0], [50, 44, 40], arc), lerpV(STAND0.hands[1], [50, -44, 40], arc)],
    open: [0.2 + 0.8 * arc, 0.2 + 0.8 * arc],
    abd: ABD_REST.map((d, i) => d - 10 * arc + 5 * Math.sin(k * 12 + i) * (1 - k)),
    feet: SR_FEET.map((f, i): V3 => [f[0], f[1], (i < 2 ? 8 : i < 4 ? 4 : 0) * arc]),
    eyes: 1.6 - 0.6 * k,
    chips: [],
    flares: [],
  };
  // (two plates torn off its back and flung, tumbling)
  for (let j = 0; j < 2; j++) {
    const s = t - R.freeze;
    const w: V3 = [5 - 30 * s * (j ? 1 : 0.6), (j ? -1 : 1) * (8 + 40 * s), 32 + 90 * s - 220 * s * s];
    if (w[2] > 0.6) for (let q = 0; q < 6; q++) P.chips.push([[w[0] + (q % 3) * 1.5, w[1] + Math.floor(q / 3) * 1.5, w[2] + (q % 2)], q % 2 ? '#827c6c' : '#a29a86', 2]);
  }
  return P;
}

/** Its death. */
function deathPose(t: number): SrPose {
  const Dd = SR_DIE;
  const sag = sm((t - Dd.sag[0]) / (Dd.sag[1] - Dd.sag[0]));
  const drop = sm(t / Dd.drop);
  const P: SrPose = {
    ...STAND0,
    z: SR_BODY_Z - (SR_BODY_Z - 14) * sag + 3 * Math.sin(Math.PI * cl01(t / 0.3)) * (1 - drop),
    pitch: 6 * sag - 6 * Math.sin(Math.PI * cl01(t / 0.3)),
    roll: 7 * sag,
    hands: [lerpV(STAND0.hands[0], [58, 40, 3], drop), lerpV(STAND0.hands[1], [56, -38, 3], drop)],
    open: [0.2 + 0.6 * drop, 0.2 + 0.4 * drop],
    abd: ABD_REST.map((d, i) => d + (10 + 4 * i) * sag),
    fan: 0.85 - 0.5 * sag,
    feet: SR_FEET.map((f): V3 => [f[0] * (1 + 0.15 * sag), f[1] * (1 + 0.35 * sag), 0]),
    knee: SR_FEET.map(() => 9 - 5 * sag),
    ants: [STAND0.ants[0].map(([r, u], i): [number, number] => [r + 10 * sag, u - (20 + 8 * i) * sag]), STAND0.ants[1].map(([r, u], i): [number, number] => [r + 10 * sag, u - (20 + 8 * i) * sag])],
    eyes: 1.4 * (1 - sm((t - 0.8) / 1.2)),
    alive: false,
    peel: sm((t - Dd.peel[0]) / (Dd.peel[1] - Dd.peel[0])),
    chips: [],
    flares: [],
  };
  // the stolen words going free: sparks of the enemy's pink rising out of the old writing as its plates fly, going pale as they go
  for (let i = 0; i < 26; i++) {
    const t0 = Dd.peel[0] + hash(i, 1, 93) * (Dd.still - 1.2 - Dd.peel[0]);
    const s = t - t0;
    if (s < 0 || s > 1.2) continue;
    const a = hash(i, 2, 93) * Math.PI * 2;
    const c = add([4 - 50 * hash(i, 3, 93), (hash(i, 4, 93) - 0.5) * 30, 26], [Math.cos(a) * 12 * s, Math.sin(a) * 12 * s, 70 * s]);
    P.chips.push([c, s < 0.4 ? FLAME[3] : s < 0.8 ? FLAME[4] : '#fff8e0', 2]);
  }
  return P;
}

function poseOf(which: string, t: number): SrPose {
  if (which === 'walk') return walkPose(t);
  if (which === 'attack') return snapPose(t);
  if (which === 'scour') return scourPose(t);
  if (which === 'rush') return rushPose(t);
  if (which === 'strip') return stripPose(t);
  if (which === 'reel') return reelPose(t);
  if (which === 'dying') return deathPose(t);
  return standPose(t);
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

/** A point of its own frame, where it is: turned and moved with its body. */
function worldOf(P: SrPose, p: V3): V3 {
  const cy = Math.cos(P.yaw * D), sy = Math.sin(P.yaw * D);
  const cp = Math.cos(P.pitch * D), sp = Math.sin(P.pitch * D);
  const cr = Math.cos(P.roll * D), sr = Math.sin(P.roll * D);
  const r1: V3 = [p[0], p[1] * cr - p[2] * sr, p[1] * sr + p[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  const r3: V3 = [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
  return [P.x + r3[0], P.y + r3[1], P.z + r3[2]];
}
function turned(P: SrPose, v: V3): V3 {
  return sub(worldOf(P, v), worldOf(P, [0, 0, 0]));
}

/** A point on an upright ellipsoid (its own frame): `s` along it (-1 its back, 1 its front), `ang` round it from its top (degrees, to its left); with the way out of it there. */
function onShell(c: V3, r: V3, s: number, ang: number, frameX: V3 = [1, 0, 0], frameY: V3 = [0, 1, 0], frameZ: V3 = [0, 0, 1]): { p: V3; n: V3 } {
  const q = Math.sqrt(Math.max(0, 1 - s * s));
  const lx = r[0] * s;
  const ly = r[1] * q * Math.sin(ang * D);
  const lz = r[2] * q * Math.cos(ang * D);
  const p = add(c, add(add(mul(frameX, lx), mul(frameY, ly)), mul(frameZ, lz)));
  const n = norm(add(add(mul(frameX, lx / (r[0] * r[0])), mul(frameY, ly / (r[1] * r[1]))), mul(frameZ, lz / (r[2] * r[2]))));
  return { p, n };
}

/** A plate of page laid on a shell at (s, ang), shingled back toward its tail: its middle, across and down (its own frame). */
function plate(c: V3, r: V3, s: number, ang: number, w: number, h: number, back: V3, frameX?: V3, frameY?: V3, frameZ?: V3, lift = 0.9): { c: V3; u: V3; v: V3 } {
  const { p, n } = onShell(c, r, s, ang, frameX, frameY, frameZ);
  // (down the plate: toward its tail along the shell, and out a little, so each plate overlaps the one behind it)
  const along = norm(sub(back, mul(n, dot(back, n))), [-1, 0, 0]);
  const v = norm(add(along, mul(n, 0.28)));
  const u = cross(v, n);
  return { c: add(add(p, mul(n, lift)), mul(v, h * 0.35)), u: mul(u, w), v: mul(v, h) };
}

/** A plate as it peels off and flies as it dies (`P.peel`): each its own moment, lifted off and tumbling up and away; gone (null) once well away. */
function flown(P: SrPose, seed: number, pl: { c: V3; u: V3; v: V3 }): { c: V3; u: V3; v: V3 } | null {
  if (P.peel <= 0) return pl;
  const at = 0.05 + 0.85 * hash(seed, 9, 8302);
  const s = (P.peel - at) * 3.2;
  if (s <= 0) return pl;
  if (s > 1.2) return null;
  const out = norm(cross(pl.u, pl.v));
  const spin = s * (2 + 3 * hash(seed, 10, 8302));
  const c = add(add(pl.c, mul(out, 30 * s)), [(hash(seed, 11, 8302) - 0.5) * 30 * s, (hash(seed, 12, 8302) - 0.5) * 30 * s, 60 * s]);
  const u = add(mul(pl.u, Math.cos(spin)), mul(pl.v, Math.sin(spin)));
  const v = add(mul(pl.v, Math.cos(spin)), mul(pl.u, -Math.sin(spin)));
  return { c, u: mul(u, 1 - 0.4 * s), v: mul(v, 1 - 0.4 * s) };
}

/** Its tail's joints, from its root to its fan's root, each segment's middle and the way it points (its own frame). */
export function tailOf(P: Pick<SrPose, 'abd'>): { pts: V3[]; dirs: V3[] } {
  const pts: V3[] = [ABD_ROOT];
  const dirs: V3[] = [];
  let p = ABD_ROOT;
  for (let i = 0; i < ABD_LEN.length; i++) {
    const a = P.abd[i] * D;
    const dir: V3 = [-Math.cos(a), 0, -Math.sin(a)];
    dirs.push(dir);
    p = add(p, mul(dir, ABD_LEN[i]));
    pts.push(p);
  }
  return { pts, dirs };
}

/** THE SCRAPER AS SOLIDS: its shell and its plates, its tail and fan, its claws, its eight legs, its antennae and eyes. */
function scraperBits(P: SrPose, put: Put): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const T = (v: V3): V3 => turned(P, v);
  const X: V3 = [1, 0, 0];
  const Y: V3 = [0, 1, 0];
  const Z: V3 = [0, 0, 1];
  // ITS SHELL: the old layers under it all (seen where the plates part), the plates over them in rows, shingled back
  put('body', 'shell', { k: 'ball', c: W(CARA_C), ax: [T(mul(X, CARA_R[0])), T(mul(Y, CARA_R[1])), T(mul(Z, CARA_R[2]))], skin: deepLayers(5, CARA_R) });
  // (the ridge down the middle of its shell, and the groove across it where its head meets its back: dark seams of ink)
  for (let j = 0; j <= 10; j++) {
    const sj = 0.85 - j * 0.17;
    const { p, n } = onShell(CARA_C, CARA_R, sj, 0);
    put('body', 'ridge', { k: 'mote', p: W(add(p, mul(n, 1.6))), c: INK[2], size: 2 });
  }
  for (let j = -6; j <= 6; j++) {
    const { p, n } = onShell(CARA_C, CARA_R, 0.38, j * 16);
    put('body', 'groove', { k: 'mote', p: W(add(p, mul(n, 1.4))), c: INK[1], size: 2 });
  }
  // (its snout: a beak of shell running forward to a point between its eyes)
  put('body', 'snout', { k: 'rod', a: W([24, 0, 6]), b: W(SNOUT), ra: 4.2, rb: 0.8, ramp: SODDEN });
  let seed = 11;
  const PLATES: [number, number, number, number, number, number][] = [
    [0.74, -64, 64, 3, 7.6, 6.6],
    [0.36, -104, 104, 5, 9.4, 8.6],
    [-0.08, -112, 112, 5, 10, 9.4],
    [-0.5, -100, 100, 5, 9.4, 8.6],
  ];
  for (const [s, a0, a1, n, w, h] of PLATES) {
    for (let i = 0; i < n; i++) {
      const ang = a0 + ((i + 0.5) / n) * (a1 - a0) + (hash(seed, 1, 8301) - 0.5) * 8;
      const pl = flown(P, seed, plate(CARA_C, CARA_R, s + (hash(seed, 2, 8301) - 0.5) * 0.06, ang, w * (0.9 + 0.2 * hash(seed, 3, 8301)), h * (0.9 + 0.2 * hash(seed, 4, 8301)), [-1, 0, -0.15]));
      if (pl) put('body', 'plate', { k: 'panel', c: W(pl.c), u: T(pl.u), v: T(pl.v), skin: leafSkin(seed, w, h, SODDEN) });
      seed++;
    }
  }
  // ITS TAIL: six segments, each a hoop of shell with a broad plate of page over its back and one down each side; then its fan
  const { pts, dirs } = tailOf(P);
  for (let i = 0; i < ABD_LEN.length; i++) {
    const mid = lerpV(pts[i], pts[i + 1], 0.5);
    const fx = dirs[i];
    const fz = norm(cross(fx, Y), Z);
    const fz2 = dot(fz, Z) < 0 ? mul(fz, -1) : fz;
    const rx = ABD_LEN[i] * 0.62;
    put('tail', `seg${i}`, { k: 'ball', c: W(mid), ax: [T(mul(fx, rx)), T(mul(Y, ABD_RY[i])), T(mul(fz2, ABD_RZ[i]))], skin: oldLayers(20 + i, [rx, ABD_RY[i], ABD_RZ[i]], 0.4) });
    const segR: V3 = [rx, ABD_RY[i], ABD_RZ[i]];
    // (its plates lie from front to back down it: `back` is the way along it toward the fan)
    for (const ang of [0, -62, 62]) {
      const w = ang === 0 ? ABD_RY[i] * 0.62 : ABD_RZ[i] * 0.55;
      const h = ang === 0 ? ABD_LEN[i] * 0.6 + 1.2 : ABD_LEN[i] * 0.5 + 1;
      const pl = flown(P, 400 + i * 3 + (ang > 0 ? 1 : ang < 0 ? 2 : 0), plate(mid, segR, 0.25, ang, w, h, fx, fx, Y, fz2, 0.7));
      if (pl) put('tail', `plate${i}`, { k: 'panel', c: W(pl.c), u: T(pl.u), v: T(pl.v), skin: leafSkin(400 + i * 3 + (ang > 0 ? 1 : ang < 0 ? 2 : 0), w, h, SODDEN) });
    }
  }
  // (the seams between its tail's segments: a dark line of ink across its back at each joint)
  for (let i = 1; i < ABD_LEN.length; i++) {
    const j = pts[i];
    const fxj = dirs[i];
    const upj0 = norm(cross(fxj, Y), Z);
    const upj = dot(upj0, Z) < 0 ? mul(upj0, -1) : upj0;
    for (let a = -70; a <= 70; a += 14) {
      const out = add(mul(upj, Math.cos(a * D) * (ABD_RZ[i] + 1.4)), mul(Y, Math.sin(a * D) * (ABD_RY[i] + 1.4)));
      put('tail', 'seam', { k: 'mote', p: W(add(j, out)), c: INK[1], size: 2 });
    }
  }
  // its fan: five broad pages spread from the end of its tail, the middle one longest
  const end = pts[pts.length - 1];
  const fx = dirs[dirs.length - 1];
  const fz0 = norm(cross(fx, Y), Z);
  const fz = dot(fz0, Z) < 0 ? mul(fz0, -1) : fz0;
  for (let k = -2; k <= 2; k++) {
    const spread = (k * (12 + 16 * P.fan)) * D;
    const d = norm(add(mul(fx, Math.cos(spread)), mul(Y, Math.sin(spread))));
    const L = k === 0 ? 17 : 16 - Math.abs(k) * 1.0;
    const c = add(end, mul(d, L * 0.9));
    const across = norm(cross(fz, d));
    const v = norm(add(d, mul(fz, -0.08)));
    put('tail', 'fan', { k: 'panel', c: W(c), u: T(mul(across, 7.5)), v: T(mul(v, L)), skin: fanSkin(500 + k, 7.5, L) });
  }
  // ITS CLAWS: an arm from each side of its head, the elbow out wide; a great palm and two fingers, all the Order's ink
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    const sh: V3 = [SHOULDER[0], side * SHOULDER[1], SHOULDER[2]];
    const hand = P.hands[k];
    const elbow: V3 = [(sh[0] + hand[0]) / 2 - 4, (sh[1] + hand[1]) / 2 + side * 11, Math.max(sh[2], hand[2]) + 5];
    const wrist = lerpV(elbow, hand, 0.62);
    put(`arm${k}`, `upper${k}`, { k: 'rod', a: W(sh), b: W(elbow), ra: 4.6, rb: 4.4, ramp: SODDEN });
    put(`arm${k}`, `elbow${k}`, { k: 'ball', c: W(elbow), ax: [T([5, 0, 0]), T([0, 5, 0]), T([0, 0, 5])], skin: rolledSkin(SODDEN, 61 + k) });
    put(`arm${k}`, `fore${k}`, { k: 'rod', a: W(elbow), b: W(wrist), ra: 5, rb: 6, ramp: INK });
    const fwd = norm(sub(hand, elbow), [1, 0, 0]);
    const inward = norm(cross([0, 0, side], fwd), [0, -side, 0]);
    const up = norm(cross(fwd, inward));
    put(`arm${k}`, `palm${k}`, { k: 'ball', c: W(hand), ax: [T(mul(fwd, PALM_R[0])), T(mul(inward, PALM_R[1])), T(mul(up, PALM_R[2]))], skin: inkSkin(P.glint) });
    // (a plate of page stuck on the palm's back, its writing running across it)
    const pc = add(add(hand, mul(up, PALM_R[2] * 0.85)), mul(fwd, -3));
    put(`arm${k}`, `palmPlate${k}`, { k: 'panel', c: W(pc), u: T(mul(inward, 7)), v: T(mul(norm(add(mul(fwd, -1), mul(up, 0.3))), 9)), skin: leafSkin(600 + k, 7, 9, SODDEN) });
    // the fingers: the fixed one on the inside, the moving one on the outside, swung out as it opens; their inner edges knives
    const root = add(hand, mul(fwd, PALM_R[0] * 0.78));
    const open = P.open[k];
    const fixedTip = add(add(root, mul(fwd, FINGER)), mul(inward, 2.2));
    const moveDir = norm(add(fwd, mul(inward, -0.3 - 1.2 * open)));
    const moveTip = add(add(root, mul(inward, -3.2)), mul(moveDir, FINGER * 0.95));
    put(`arm${k}`, `fixed${k}`, { k: 'rod', a: W(add(root, mul(inward, 3.2))), b: W(fixedTip), ra: 6, rb: 0.8, ramp: INK });
    put(`arm${k}`, `moving${k}`, { k: 'rod', a: W(add(root, mul(inward, -3.6))), b: W(moveTip), ra: 5.6, rb: 0.8, ramp: INK });
    // (the knives' edges: a bright line along each finger's inner side, burning the enemy's pink when it is about to scrape)
    const edgeC = P.glint > 0.05 ? (P.glint > 0.6 ? FLAME[3] : FLAME[2]) : INK[4];
    for (let j = 1; j <= 6; j++) {
      const q = j / 7;
      put(`arm${k}`, 'edge', { k: 'mote', p: W(lerpV(add(root, mul(inward, 1.0)), add(fixedTip, mul(inward, -0.6)), q)), c: edgeC, size: 1 });
      put(`arm${k}`, 'edge', { k: 'mote', p: W(lerpV(add(root, mul(inward, -1.6)), add(moveTip, mul(moveDir, -0.5)), q)), c: edgeC, size: 1 });
    }
  }
  // ITS LEGS: eight, of rolled grey pulp, the knee arched high, the foot a point on the floor
  P.feet.forEach((foot, i) => {
    const hip = W(HIP[i]);
    const side = Math.sign(HIP[i][1]);
    const mid = lerpV(hip, foot, 0.42);
    const outward = norm([foot[0] - hip[0], foot[1] - hip[1], 0], [0, side, 0]);
    const knee: V3 = [mid[0] + outward[0] * 2, mid[1] + outward[1] * 2, Math.max(hip[2], foot[2]) + P.knee[i]];
    const toe: V3 = [foot[0], foot[1], foot[2] + 0.8];
    put(`leg${i}`, `thigh${i}`, { k: 'rod', a: hip, b: knee, ra: 2.0, rb: 1.7, ramp: DARKP });
    put(`leg${i}`, `shin${i}`, { k: 'rod', a: knee, b: toe, ra: 1.6, rb: 0.6, ramp: INK });
    put(`leg${i}`, `knee${i}`, { k: 'ball', c: knee, ax: [[1.9, 0, 0], [0, 1.9, 0], [0, 0, 1.9]], skin: INK });
  });
  // ITS ANTENNAE: two long whips of the Order's ink, sweeping back over it
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    let p: V3 = [ANT_ROOT[0], side * ANT_ROOT[1], ANT_ROOT[2]];
    P.ants[k].forEach(([round, up], i) => {
      // (forward and up from its head, then swept out and back along its side, long as its whole body)
      const d: V3 = [Math.cos(round * D) * Math.cos(up * D), side * Math.sin(round * D) * Math.cos(up * D), Math.sin(up * D)];
      const q = add(p, mul(d, ANT_LEN[i]));
      put(`ant${k}`, `ant${k}`, { k: 'rod', a: W(p), b: W(q), ra: 2.0 - i * 0.38, rb: 1.65 - i * 0.38, ramp: INK });
      p = q;
    });
    // (its short feelers, a pair either side, between its eyes)
    const fr0: V3 = [35, side * 2, 5];
    put(`ant${k}`, 'feeler', { k: 'rod', a: W(fr0), b: W(add(fr0, [9, side * 3, 4])), ra: 0.9, rb: 0.5, ramp: SODDEN });
  }
  // ITS EYES: on short stalks either side of its snout, burning the enemy's pink
  if (P.eyes > 0.2) {
    for (const s of [1, -1]) {
      const root: V3 = [31, s * 5.5, 8];
      const tip = add(root, [3 + P.stalk * 0.15, s * 2.5, 6]);
      put('body', `stalk${s}`, { k: 'rod', a: W(root), b: W(tip), ra: 1.7, rb: 1.5, ramp: PULPG });
      put('body', `eye${s}`, { k: 'ball', c: W(tip), ax: [[2.6, 0, 0], [0, 2.6, 0], [0, 0, 2.6]], skin: INK });
      put('body', `pupil${s}`, { k: 'dot', p: W(add(tip, [1.6, s * 0.8, 0.8])), c: FLAME[2], facing: T([0.8, s * 0.4, 0.4]), c2: FLAME[3] });
    }
    put('glow', 'eyes', { k: 'glow', p: W([34, 0, 14]), c: FLAME[2], r: 9, a: 0.22 * Math.min(1, P.eyes) });
  }
}

/** One frame of the Scraper: `which` (stand, for now), `t` seconds in, from in front or behind. */
/** The lowest any of `bits` (of the parts `re` matches, or all) comes to the floor (picture units over it): balls, rods and panels by their size. */
export function lowestOf(bits: readonly Bit[], re?: RegExp): number {
  let low = Infinity;
  for (const b of bits) {
    if (re && !re.test(b.part)) continue;
    const sh = b.shape;
    if (sh.k === 'ball') low = Math.min(low, sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]));
    else if (sh.k === 'rod') low = Math.min(low, sh.a[2] - sh.ra, sh.b[2] - sh.rb);
    else if (sh.k === 'panel') low = Math.min(low, sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]));
  }
  return low;
}
/** The angle nearest `a` (radians) at which A cos x + B sin x is at least `c`; if none, the angle at which it is most. */
function atLeast(a: number, A: number, B: number, c: number): number {
  if (A * Math.cos(a) + B * Math.sin(a) >= c) return a;
  const R = Math.hypot(A, B);
  const ph = Math.atan2(B, A);
  if (c >= R) return ph;
  const w = Math.acos(c / R);
  const near = (x: number): number => Math.abs(Math.atan2(Math.sin(x - a), Math.cos(x - a)));
  return near(ph + w) < near(ph - w) ? ph + w : ph - w;
}
/**
 * ITS TAIL AND ANTENNAE KEPT OFF THE FLOOR: each segment of its tail, from its root, bent no further down than keeps its
 * hoop clear of the floor (its fan's tip too); each length of its antennae likewise. Changes `abd` and `ants`.
 */
function offTheFloor(P: SrPose): void {
  const O = worldOf(P, [0, 0, 0]);
  const ax = (v: V3): number => worldOf(P, v)[2] - O[2];
  const [xz, yz, zz] = [ax([1, 0, 0]), ax([0, 1, 0]), ax([0, 0, 1])];
  let p = worldOf(P, ABD_ROOT);
  P.abd = P.abd.slice();
  for (let i = 0; i < ABD_LEN.length; i++) {
    const L = ABD_LEN[i];
    let c = (ABD_RZ[i] + 0.3 - p[2]) / L;
    if (i === ABD_LEN.length - 1) c = Math.max(c, (1 - p[2]) / (L + 32));
    const a = atLeast(P.abd[i] * D, -xz, -zz, c);
    P.abd[i] = a / D;
    p = [p[0], p[1], p[2] + L * (-Math.cos(a) * xz - Math.sin(a) * zz)];
  }
  const lifted = (chain: readonly [number, number][], k: number): [number, number][] => {
    const side = k ? -1 : 1;
    let z = worldOf(P, [ANT_ROOT[0], side * ANT_ROOT[1], ANT_ROOT[2]])[2];
    return chain.map(([round, up], i): [number, number] => {
      const L = ANT_LEN[i];
      const A = Math.cos(round * D) * xz + side * Math.sin(round * D) * yz;
      const u = atLeast(up * D, A, zz, (2.2 - i * 0.38 + 0.3 - z) / L);
      z += L * (A * Math.cos(u) + zz * Math.sin(u));
      return [round, u / D];
    });
  };
  P.ants = [lifted(P.ants[0], 0), lifted(P.ants[1], 1)];
}
/** One moment of it, never through the floor: its tail and antennae kept off it, and where a claw would go into it, its hand lifted till it lies on it. */
function posed(which: string, t: number): { P: SrPose; bits: Bit[] } {
  const P = poseOf(which, t);
  P.hands = [P.hands[0], P.hands[1]];
  offTheFloor(P);
  let bits: Bit[] = [];
  for (let pass = 0; pass < 3; pass++) {
    bits = [];
    scraperBits(P, (part, piece, shape) => {
      bits.push({ part, piece, shape });
    });
    let moved = false;
    for (const k of [0, 1]) {
      const low = lowestOf(bits, k ? /^arm1$/ : /^arm0$/);
      if (low < 0.5) {
        const h = P.hands[k];
        P.hands[k] = [h[0], h[1], h[2] + (0.6 - low) / Math.max(0.5, Math.cos(P.pitch * D))];
        moved = true;
      }
    }
    if (!moved) break;
  }
  return { P, bits };
}
export function scraperPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, SR_CANVAS.ax, SR_CANVAS.ay, SR_CANVAS);
  const { P, bits } = posed(which, t);
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
/** The same frame as the game holds a figure (its pool of light behind it while it lives). */
export function scraperFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(scraperPainted(which, t, view), which === 'dying' ? null : SR_AURA, SR_CANVAS.ax, SR_CANVAS.ay);
}
/** Where its forward (its own +x, one picture unit) goes on its picture, from in front or behind: for carrying it over the floor on a dev page. */
export function srForward(view: GameView): [number, number] {
  const st = stage(view, 0, 0, SR_CANVAS);
  const a = st.at([0, 0, 0]);
  const b = st.at([1, 0, 0]);
  return [b[0] - a[0], b[1] - a[1]];
}
/** Every solid of one moment of it, as the tests read them. */
export function scraperSolids(which: string, t: number): Bit[] {
  return posed(which, t).bits;
}

/** How long each of its moves is (seconds; a loop, its round). */
export function scraperLong(which: string): number {
  return (
    {
      stand: SR_STAND.period,
      walk: SR_WALK.period,
      attack: SR_SNAP.long,
      scour: SR_SCOUR.long,
      rush: SR_RUSH.long,
      strip: SR_STRIP.long,
      reel: SR_REEL.long,
      dying: SR_DIE.long,
    } as Record<string, number>
  )[which] ?? 1;
}
/** THE SCRAPER, as the game holds a monster's pictures: its stand and walk; its claw snap the attack; the scour, the rush and its half of the Palimpsest (`strip`) its moves; struck; its death. */
export function makeScraperArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => scraperFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', SR_SNAP.long, SR_SNAP.fps, SR_SNAP.hit);
    return {
      idle: lazyFrames(SR_STAND.frames, (i) => frame('stand', i / SR_STAND.fps)),
      walk: lazyFrames(SR_WALK.frames, (i) => frame('walk', i / SR_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[6, 14, 17][i]]),
      idleFps: SR_STAND.fps,
      walkFps: SR_WALK.fps,
      clips: {
        attack,
        reel: clip('reel', SR_REEL.long, SR_REEL.fps),
        die: clip('dying', SR_DIE.long, SR_DIE.fps),
        moves: {
          scour: clip('scour', SR_SCOUR.long, SR_SCOUR.fps, SR_SCOUR.slam),
          rush: clip('rush', SR_RUSH.long, SR_RUSH.fps, SR_RUSH.go),
          strip: clip('strip', SR_STRIP.long, SR_STRIP.fps, SR_STRIP.slam),
        },
      },
    };
  };
  return { front: set('front'), back: set('back') };
}
