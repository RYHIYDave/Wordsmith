// FLOOR 9'S BOSS, THE HOLLOW STAG OF THE PINEWOOD: a mock-up (nothing of the game imports this file; `STAG_ON` is off).
//
// HIS DESIGN DOC ("Wordsmith Act 1: The Descent (Levels 6–10)", the planning chat's, with his yes of 12 Oct, 18:07):
// "A great stag hollowed out by the swamp's influence, with a blinking eye visible through its ribs. It foreshadows
// the Drowned Eye." Its moves, there: "an antler gore (its basic attack); a charge that splinters trees; lines of roots
// bursting toward you; a bellow that wolves answer from the fog."
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (15 Oct, the first four by 11:26, the rest by
// 11:47, each his pick, the labels as he tapped them): how big, “Huge: elk-sized, antlers towering (Recommended)”; the
// one thing to know it by, “The eye blinking in its open ribs (Recommended)”; how hollowed, “Half rotted: hide hanging,
// bone and roots showing (Recommended)”; how it moves, “Restless, stamping, snorting” (not the recommended pick); how it
// dies, “Roots drag it down into the ground” (not the recommended pick); its eye, “Gold, like the Drowned Eye's
// (Recommended)”; what it must never look like, “Not a gory zombie” (not the recommended pick); its sound (sound rule
// 7), “A deep bellow, creaking wood, a wet blink (Recommended)”.
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its eye burns gold (pink burning to gold, his
// rulebook's enemy fire) and its edge is pink while it lives; nothing cyan; rotted but clean: a dark hide in tatters,
// pale bone, the swamp's dark violet roots and the wood's moss, never red flesh or blood; its shoulder above the
// knight's head, its antlers towering over him; its chest hollowed, the ribs bare, two of them snapped to open a window
// on the great eye, held in a nest of roots, that looks at you and blinks; its stand restless: shifting its weight,
// tossing its head, pawing and stamping a forefoot, snorting a breath of fog.
//
// NOT ON THE HEROES' BONES: four legs and antlers have no place on them, so it is painted from its own solids, as the
// cliff crawler and the canyon scorpion are, in the same painter (art/new_mobs3.ts's paintBits).
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves), and its restless stand.

import type { Px, Sprite } from '../engine/px';
import { INK, hash, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const STAG_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const D = Math.PI / 180;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
/** A swell from nothing at `a` to its fullest half way and back to nothing at `b`, smooth at both ends. */
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.pow(Math.sin((Math.PI * (t - a)) / (b - a)), 2));

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: a dark hide (a cool, deep umber), pale bone gone a little lilac (the swamp's), antlers of old ivory, the
// swamp's dark violet roots (the sickness's veins in the Pinewood's grass), the wood's moss; inside its ribs the dark,
// and in the dark its eye: pale, veined, its iris the enemy's pink burning to gold (FLAME), its pupil a black slit.
// No red flesh, no blood (his word: "Not a gory zombie"). Nothing of it glows cyan.

const HIDE: Ramp = ['#100a12', '#1e141c', '#33232a', '#4e3634', '#6a4c42'];
const MANE: Ramp = ['#0b070d', '#150d15', '#251922', '#38272b', '#4c3733'];
const BONE: Ramp = ['#3a3048', '#5c5070', '#8c80a0', '#c2b8cc', '#ebe3ee'];
const ANTLER: Ramp = ['#2e2430', '#4e3e48', '#7c6a6c', '#ae9c94', '#d8cabc'];
const ROOT: Ramp = ['#120a16', '#22142a', '#3a2642', '#58405c', '#78607a'];
const MOSS: Ramp = ['#141e14', '#22341e', '#36502a', '#52703a', '#748c4c'];
/** Its knees and hocks: the bone showing dark through the worn hide. */
const KNOB: Ramp = ['#1e141c', '#33232a', '#4e4050', '#76688a', '#9a8eae'];
const HOOF: Ramp = ['#0a070c', '#140e14', '#241a22', '#362832', '#4a3844'];
const HOLLOW: Ramp = ['#050308', '#09060d', '#0f0a15', '#17101f', '#21172b'];
const EYEBALL: Ramp = ['#5a4a5c', '#8a7a86', '#bcaeae', '#e2d6cc', '#f6eee4'];
const VEIN = '#7c4466';
/** Its breath, a puff of the fog the wood's hollows are full of. */
const FOG = ['#cfc6da', '#aea4be', '#8e849e'];
/** Clods of the meadow's earth and grass, kicked up as it stamps. */
const CLOD = ['#4c3c30', '#5e4a3a', '#3e4c2c', '#56663a'];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high). x forward, y to its left, z up; its own frame has its floor
// point under its middle at the origin. Elk-sized: its withers about 68 up, ten over the knight's head; its antlers'
// tips about 130 up.

/** The middle of its barrel: what its body turns about. */
const PIVOT: V3 = [0, 0, 50];
/** Its hoofs at rest, on the floor: its right fore, its left fore, its right hind, its left hind. */
export const STAG_FEET: V3[] = [
  [19, -7, 0],
  [19, 7, 0],
  [-28, -7.5, 0],
  [-28, 7.5, 0],
];
/** Where each leg leaves its body (its own frame): the shoulder joints, the hip joints. */
const LEG_TOP: V3[] = [
  [20, -8.5, 49],
  [20, 8.5, 49],
  [-27, -8, 52],
  [-27, 8, 52],
];
/** Each leg's two upper bones (front: the upper arm and the forearm; hind: the thigh and the shank), and which way its middle joint bends (front: the elbow back; hind: the stifle forward). */
const UPPER = [14, 18.5];
const HIND_UPPER = [16.5, 19.5];
/** Its lower leg, rigid from the hoof up (in the hoof's own frame, at rest): the knee (front) or the hock (hind), and the fetlock. */
const FORE_KNEE: V3 = [-2.5, 0, 20.5];
const FORE_FET: V3 = [-2, 0, 6.5];
const HIND_HOCK: V3 = [-4, 0, 23];
const HIND_FET: V3 = [-1, 0, 6.5];
/** Its ribs: where each meets its spine (forward), seven a side; the third and fourth of each side snapped, a window on its eye. */
const RIB_X = [12, 6.5, 1, -4.5, -10, -15.5];
/** Each side's window: the ribs snapped there (its right side, then its left), and the window's middle (along its body, and up). Its eye sits behind the window of the side you see, along your line of sight through it: from in front you look in through its right side and back, from behind through its left side and forward, so the two windows are not opposite each other. */
const WINDOWS: Record<number, { broken: number[]; x: number; z: number }> = { [-1]: { broken: [1, 2, 3], x: -0.5, z: 53 }, [1]: { broken: [2, 3, 4], x: -6, z: 53 } };
/** Its ribcage's round, across and up, at rest (it heaves as it breathes), and its middle's height. */
const CAGE_Y = 11.6;
const CAGE_Z = 13.6;
const CAGE_C = 50.5;
/** Where its neck leaves its shoulders, and how long it is; its head's skull pitched nose-down at rest. */
const NECK_ROOT: V3 = [26, 0, 59];
const NECK_LONG = 20;
const NECK_REST: V3 = [15, 0, 14];
const SKULL_PITCH = 35;

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: fifteen frames a second, a loop of 2.4 s: restless, shifting its weight, tossing its head, pawing and stamping its right forefoot twice, snorting a breath of fog, its eye blinking. */
export const STAG_STAND = { frames: 36, fps: 15, period: 2.4 } as const;
/** In its stand: the head toss; the paw (its right forefoot lifted, struck down, lifted and struck down again: `stamps`); the snort; the blink. */
export const STAG_HABITS = { toss: [0.24, 0.92], paw: [0.92, 1.54], stamps: [1.22, 1.54], snort: 1.84, blink: [2.04, 2.24] } as const;

/** The canvas it is painted on, and its floor point on it (room for its antlers' tips from behind). */
export const STAG_CANVAS = { w: 300, h: 300, ax: 140, ay: 232 };
/** Its pool of light while it lives (the enemy's pink, faint). */
const STAG_AURA = { x: STAG_CANVAS.ax, y: STAG_CANVAS.ay - 40, r: 70, color: '#ff3a78', a: 0.07 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

/** One moment of it. */
interface StagPose {
  /** Its body moved from where it stands (forward, to its left, up) and turned about its barrel's middle (degrees: to its left, nose down, rolled to its right). */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Its neck lowered (degrees, forward and down) and its head turned on it (degrees: to its left, nose down, rolled to its right). */
  neck: number;
  head: [number, number, number];
  /** Its ears laid back (degrees), its tail raised and swung (degrees). */
  ears: number;
  tail: [number, number];
  /** Each hoof's place on the floor's own grid (on the floor when z is 0), and how far each lower leg is folded (degrees). */
  feet: V3[];
  fold: number[];
  /** Its breath (-1 out, 1 in): its ribs heave. */
  breath: number;
  /** Its eye: its gaze turned off you (degrees: to its left, down), its lids (0 open, 1 shut), how bright it burns (0 out). */
  look: [number, number];
  lid: number;
  glow: number;
  /** Still living: its pink edge is painted round it. */
  alive: boolean;
  /** How its hanging things are dragged by its moving: its body's, its head's (how far each moved in the last tenth of a second). */
  drag: V3;
  dragHead: V3;
  /** What its moves throw off, laid over its picture: clods, its breath's fog (each its place, colour and size); and lights. */
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

const REST: StagPose = {
  x: 0,
  y: 0,
  z: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
  neck: 0,
  head: [0, 0, 0],
  ears: 0,
  tail: [0, 0],
  feet: STAG_FEET,
  fold: [0, 0, 0, 0],
  breath: 0,
  look: [0, 0],
  lid: 0,
  glow: 1,
  alive: true,
  drag: [0, 0, 0],
  dragHead: [0, 0, 0],
  chips: [],
  flares: [],
};

/** Its right forefoot as it paws: lifted and tucked, struck down onto the spot it left, lifted again, struck down again; on the floor between. Its hoof's place and its lower leg's fold. */
function pawFoot(t: number): { foot: V3; fold: number } {
  const F = STAG_FEET[0];
  const [s1, s2] = STAG_HABITS.stamps;
  const lift = (a: number, b: number, up: number, back: number, fold: number): { foot: V3; fold: number } => {
    const u = sm((t - a) / (b - a));
    return { foot: [F[0] - back * u, F[1], up * Math.sin((Math.PI / 2) * u)], fold: fold * u };
  };
  const strike = (a: number, b: number, up: number, back: number, fold: number): { foot: V3; fold: number } => {
    // (struck down fast, the leg flung forward as it falls, onto the spot it left)
    const v = Math.pow(cl01((t - a) / (b - a)), 1.6);
    return { foot: [F[0] - back * (1 - v) + 4 * Math.sin(Math.PI * v), F[1], up * (1 - v * v)], fold: fold * (1 - v) - 18 * Math.sin(Math.PI * v) };
  };
  if (t >= 0.92 && t < 1.1) return lift(0.92, 1.1, 11, 4, 72);
  if (t >= 1.1 && t < s1) return strike(1.1, s1, 11, 4, 72);
  if (t >= 1.3 && t < 1.42) return lift(1.3, 1.42, 8, 3, 58);
  if (t >= 1.42 && t < s2) return strike(1.42, s2, 8, 3, 58);
  return { foot: F, fold: 0 };
}

/** A blow to the floor as a hoof comes down: from nothing just before, at its fullest a moment after, gone two tenths after. */
const thud = (t: number, at: number): number => bump(t, at - 0.03, at + 0.2);

/**
 * Its stand, restless (his pick): its weight shifting from side to side; it breathes, its ribs heaving; it tosses its
 * head, its antlers rattling; it lifts its right forefoot and strikes it down, twice, the clods flying, its body
 * jolted; it lowers its head and snorts a breath of fog; its tail flicks; its eye glances off and back, and blinks.
 */
function standBase(t0: number): StagPose {
  const T = STAG_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (Math.PI * 2 * t) / T;
  const breath = Math.sin(2 * a);
  const [toss0, toss1] = STAG_HABITS.toss;
  const toss = bump(t, toss0, toss1);
  const shake = Math.sin((2 * Math.PI * 1.5 * (t - toss0)) / (toss1 - toss0));
  const paw = pawFoot(t);
  const [s1, s2] = STAG_HABITS.stamps;
  const jolt = thud(t, s1) + 0.8 * thud(t, s2);
  const off = bump(t, 0.85, 1.7);
  const snortDown = bump(t, 1.6, 1.9);
  const snortJerk = bump(t, 1.78, 2.2);
  const feet = STAG_FEET.map((f) => f);
  feet[0] = paw.foot;
  return {
    ...REST,
    x: 0.6 * Math.sin(a + 1) + 0.6 * snortJerk,
    y: 1.3 * Math.sin(a) + 1.0 * off,
    z: 0.5 * breath - 1.4 * jolt,
    roll: 2.2 * Math.sin(a) + 1.8 * off,
    pitch: 2.2 * jolt + 1.2 * snortDown,
    yaw: 1.2 * Math.sin(a + 0.6),
    neck: -9 * toss + 10 * snortDown - 4 * snortJerk + 4 * jolt,
    head: [9 * shake * toss + 5 * Math.sin(a + 2), -24 * toss + 13 * snortDown - 10 * snortJerk + 4 * jolt + 3 * Math.sin(a), 7 * shake * toss],
    ears: -30 * bump(t, 0.72, 0.98) - 18 * snortJerk,
    tail: [36 * bump(t, 0.18, 0.5) + 30 * bump(t, 1.62, 1.95), 22 * Math.sin((t - 0.18) * 30) * bump(t, 0.18, 0.5) + 18 * Math.sin((t - 1.62) * 28) * bump(t, 1.62, 1.95)],
    feet,
    fold: [paw.fold, 0, 0, 0],
    breath,
    look: [30 * bump(t, 0.12, 0.62), -16 * bump(t, 0.95, 1.6)],
    lid: bump(t, STAG_HABITS.blink[0], STAG_HABITS.blink[1]) > 0.25 ? cl01((bump(t, STAG_HABITS.blink[0], STAG_HABITS.blink[1]) - 0.25) / 0.6) : 0,
    glow: 1 + 0.12 * breath + 0.3 * off,
  };
}

/** Clods of the meadow kicked up where a hoof strikes, at `t0`, falling, gone `life` after. */
function clods(c: V3, t0: number, t: number, n: number, seed: number, life = 0.4): [V3, string, number][] {
  const s = t - t0;
  if (s < 0 || s >= life) return [];
  const out: [V3, string, number][] = [];
  for (let i = 0; i < n; i++) {
    const ang = hash(i, 1, seed) * Math.PI * 2;
    const v = 30 * (0.5 + 0.7 * hash(i, 2, seed));
    const up = 34 * (0.5 + 0.8 * hash(i, 3, seed));
    const z = up * s - 190 * s * s;
    if (z < 0 && s > 0.05) continue;
    out.push([[c[0] + Math.cos(ang) * v * s, c[1] + Math.sin(ang) * v * s, Math.max(0.6, z)], CLOD[i % CLOD.length], i % 3 ? 2 : 3]);
  }
  return out;
}

/** Its breath: two jets of fog from its nostrils at `t0`, blown forward and down, spreading and thinning, gone `life` after. */
function fog(nose: [V3, V3], ahead: V3, t0: number, t: number, seed: number, life = 0.5): [V3, string, number][] {
  const s = t - t0;
  if (s < 0 || s >= life) return [];
  const k = s / life;
  const out: [V3, string, number][] = [];
  nose.forEach((p, j) => {
    for (let i = 0; i < 22; i++) {
      if (hash(i, 9 + j, seed) < k * 0.9) continue;
      const go = (1 - (1 - k) * (1 - k)) * (0.5 + 0.6 * hash(i, 1 + j, seed));
      const sp = 10 * go * (0.4 + hash(i, 3, seed));
      const ang = hash(i, 4 + j, seed) * Math.PI * 2;
      const q = add(add(p, mul(ahead, 26 * go)), [Math.cos(ang) * sp, Math.sin(ang) * sp, 7 * go * hash(i, 5, seed) - 2 * go]);
      out.push([[q[0], q[1], Math.max(0.6, q[2])], FOG[Math.min(2, Math.floor(k * 3 + hash(i, 6, seed)))], k < 0.5 && i % 3 === 0 ? 4 : i % 2 ? 2 : 3]);
    }
  });
  return out;
}

function basePose(which: string, t: number): StagPose {
  void which;
  return standBase(t);
}

/** One moment of it, with what hangs from it dragged by its moving and what it throws off. */
function poseOf(which: string, t: number, view: GameView = 'front'): StagPose {
  const P = basePose(which, t);
  const before = basePose(which, t - 0.1);
  P.drag = sub(worldOf(P, [0, 0, 40]), worldOf(before, [0, 0, 40]));
  P.dragHead = sub(headFrame(P).at, headFrame(before).at);
  if (which === 'stand') {
    const tt = fr(t / STAG_STAND.period) * STAG_STAND.period;
    const [s1, s2] = STAG_HABITS.stamps;
    P.chips = [...clods(STAG_FEET[0], s1, tt, 14, 91), ...clods(STAG_FEET[0], s2, tt, 10, 93)];
    const H = headFrame(P);
    const nose: [V3, V3] = [H.p([19.5, 1.2, -1.2]), H.p([19.5, -1.2, -1.2])];
    P.chips.push(...fog(nose, norm(add(H.f, [0, 0, -0.35])), STAG_HABITS.snort, tt, 95));
  }
  void view;
  return P;
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

/** A turn: rolled about its length, then pitched (nose down), then turned to its left. */
function turn(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D);
  const cp = Math.cos(pitch * D), sp = Math.sin(pitch * D);
  const cr = Math.cos(roll * D), sr = Math.sin(roll * D);
  const r1: V3 = [v[0], v[1] * cr - v[2] * sr, v[1] * sr + v[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  return [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
}
/** A point of its body, where it is: turned about its barrel's middle and moved with it. */
function worldOf(P: StagPose, p: V3): V3 {
  return add(add([P.x, P.y, P.z], PIVOT), turn(sub(p, PIVOT), P.yaw, P.pitch, P.roll));
}
/** A direction of its body, where it points. */
function turned(P: StagPose, v: V3): V3 {
  return turn(v, P.yaw, P.pitch, P.roll);
}

/** Its head's frame: where its skull sits on its neck, and its skull's forward, left and up (the skull pitched nose-down at rest); `p` a point of its head (forward, left, up), `q` a point of its crown (the same, but as if its skull were level: its antlers). */
interface HeadFrame {
  at: V3;
  f: V3;
  l: V3;
  u: V3;
  p: (v: V3) => V3;
  q: (v: V3) => V3;
}
function headFrame(P: StagPose): HeadFrame {
  const root = worldOf(P, NECK_ROOT);
  const along = turned(P, turn(norm(NECK_REST), 0, P.neck, 0));
  const at = add(root, mul(along, NECK_LONG));
  const [hy, hp, hr] = P.head;
  const skull = (v: V3): V3 => turned(P, turn(turn(v, 0, SKULL_PITCH, 0), hy, hp, hr));
  const crown = (v: V3): V3 => turned(P, turn(v, hy, hp, hr));
  const f = skull([1, 0, 0]);
  const l = skull([0, 1, 0]);
  const u = skull([0, 0, 1]);
  return { at, f, l, u, p: (v) => add(at, skull(v)), q: (v) => add(at, crown(v)) };
}

/** Two bones from `a` to a point `c`, `l1` and `l2` long, the joint between them bent toward `hint`. */
function joint(a: V3, c: V3, l1: number, l2: number, hint: V3): V3 {
  const d0 = sub(c, a);
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, len(d0)));
  const n = norm(d0);
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const side = norm(sub(hint, mul(n, dot(hint, n))), [0, 0, 1]);
  return add(add(a, mul(n, along)), mul(side, h));
}
/** A rigid lower leg's point, its hoof at `foot`, folded `fold` degrees (the hoof swung back under the knee). */
const lowerOf = (foot: V3, v: V3, fold: number): V3 => add(foot, turn(v, 0, fold, 0));

/** A smooth value noise over a ball's skin (`u` on it), for patches of moss and wear. */
function patch(u: V3, k: number, seed: number): number {
  const x = u[0] * k + 7.3;
  const y = u[1] * k + 3.1;
  const z = u[2] * k + 5.7;
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number, m: number): number => hash(xi + i + 101 * (zi + m), yi + j, seed);
  const lx = (j: number, m: number): number => h(0, j, m) + (h(1, j, m) - h(0, j, m)) * s(fx);
  const ly = (m: number): number => lx(0, m) + (lx(1, m) - lx(0, m)) * s(fy);
  return ly(0) + (ly(1) - ly(0)) * s(fz);
}
/** Its hide: dark, its hair lying in streaks; moss grown on it where it faces up; worn through to bone or roots where `worn` says. */
function hideSkin(seed: number, mossy: boolean, worn?: (u: V3) => Ramp | null): Skin {
  return (u, tone) => {
    const w = worn?.(u);
    if (w) return w[Math.max(0, Math.min(4, tone))];
    if (mossy && u[2] > 0.3 && patch(u, 2.6, seed) > 0.6) return MOSS[Math.max(1, Math.min(4, tone))];
    const streak = fr(u[2] * 4.2 + u[0] * 1.3 + 0.35 * Math.sin(u[1] * 6 + seed)) < 0.24;
    return HIDE[Math.max(0, Math.min(4, tone - (streak ? 1 : 0)))];
  };
}

/** A hanging thing (a tatter of hide, a root, a strand of moss, its mane): from `a` down `long`, swinging back from how it was dragged, and a little of its own sway. */
function strand(put: Put, part: string, piece: string, a: V3, long: number, r0: number, r1: number, ramp: Ramp, drag: V3, sway: V3, n = 4): void {
  let last = a;
  for (let j = 1; j <= n; j++) {
    const k = j / n;
    const lag = Math.pow(k, 1.4);
    const p: V3 = [a[0] - drag[0] * 1.6 * lag + sway[0] * lag, a[1] - drag[1] * 1.6 * lag + sway[1] * lag, a[2] - long * k + Math.abs(drag[2]) * 0.4 * lag];
    put(part, `${piece}${j}`, { k: 'rod', a: last, b: p, ra: r0 + (r1 - r0) * (k - 1 / n), rb: r0 + (r1 - r0) * k, ramp });
    last = p;
  }
}

/** Which of its sides faces whoever looks: its right (-1) from in front, its left (1) from behind. */
const sideSeen = (view: GameView): number => (view === 'front' ? -1 : 1);
const VIEWS = new Map<GameView, { eye: V3; at: (p: V3) => readonly [number, number] }>();
/** The way to the eye of whoever looks, and where a point is on its canvas (worked out before a frame is begun: making a stage begins one). */
function viewOf(view: GameView): { eye: V3; at: (p: V3) => readonly [number, number] } {
  let v = VIEWS.get(view);
  if (!v) {
    const st = stage(view, STAG_CANVAS.ax, STAG_CANVAS.ay, { w: 2, h: 2 });
    VIEWS.set(view, (v = { eye: st.eye, at: st.at }));
  }
  return v;
}
const eyeOf = (view: GameView): V3 => viewOf(view).eye;
/** A ball's outline on the canvas is a circle this many times its radius (the game's camera is a true one, scaled). */
const SEEN_R = 2 / Math.sqrt(3);

/** THE STAG AS SOLIDS: its body (shoulders, haunch, its hollow and its ribs, its spine), its eye in its nest of roots, its neck and mane, its head and antlers, its four legs, its tail, its hanging tatters and roots. */
function stagBits(P: StagPose, put: Put, view: GameView): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const axes = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  const seen = sideSeen(view);
  const sway = (k: number): V3 => [0.5 * Math.sin(k), 0.4 * Math.cos(k * 1.3), 0];

  // ITS SHOULDERS AND ITS HUMP: hide, the shoulder blade's bone worn through on each side
  const blade = (u: V3): Ramp | null => (Math.abs(u[1]) > 0.62 && u[2] > -0.05 && u[2] < 0.62 && Math.abs(u[0] + 0.12 - 0.25 * u[2]) < 0.2 ? BONE : null);
  put('shoulder', 'shoulder', { k: 'ball', c: W([19, 0, 52]), ax: axes([12, 0, 0], [0, 11, 0], [0, 0, 15.5]), skin: hideSkin(3, true, blade) });
  put('shoulder', 'hump', { k: 'ball', c: W([14, 0, 62]), ax: axes([10, 0, 0], [0, 7.4, 0], [0, 0, 6.6]), skin: hideSkin(5, true) });
  // ITS HAUNCH: hide, its hip bones' knobs bare, and on each side a hole torn in it, roots knotted in the dark there
  const hip = (u: V3): Ramp | null => {
    if (u[2] > 0.72 && Math.abs(u[1]) > 0.18 && Math.abs(u[1]) < 0.55 && u[0] > -0.1 && u[0] < 0.45) return BONE;
    if (Math.abs(u[1]) > 0.6 && u[0] > -0.55 && u[0] < 0.05 && u[2] > -0.35 && u[2] < 0.3) return patch(u, 7, 17) > 0.5 ? ROOT : HOLLOW;
    return null;
  };
  put('haunch', 'haunch', { k: 'ball', c: W([-27, 0, 53]), ax: axes([13, 0, 0], [0, 11.5, 0], [0, 0, 14.5]), skin: hideSkin(7, true, hip) });

  // ITS HOLLOW: the dark inside its ribs
  const breathe = 1 + 0.045 * P.breath;
  // (the dark gives way to its eye where its eye is: the eye sits in it, half sunk)
  const R = 8.6;
  const toYou = eyeOf(view);
  const win = WINDOWS[seen];
  const eyeC = sub(W([win.x, seen * CAGE_Y, win.z]), mul(toYou, R + 1.2));
  const [ex, ey] = viewOf(view).at(eyeC);
  const cut = SEEN_R * R - 0.6;
  const hollow: Skin = (_u, tone, x, y) => (Math.hypot(x + 0.5 - ex, y + 0.5 - ey) < cut ? null : HOLLOW[tone]);
  put('hollow', 'hollow', { k: 'ball', c: W([-3, 0, 51]), ax: axes([17, 0, 0], [0, 9.6 * breathe, 0], [0, 0, 12.4 * breathe]), skin: hollow });
  // ITS HIDE OVER ITS BACK: torn, hanging in a ragged edge over its ribs, torn away on the side you see where its ribs
  // are snapped, its spine bare along a rent down its back
  const mantle: Skin = (u, tone) => {
    const x = u[0];
    let edge = 0.5 + 0.1 * Math.sin(x * 9 + 1.3) + 0.08 * Math.sin(x * 23 + 0.4);
    if (fr(x * 4.3 + 0.15) < 0.14) edge -= 0.3;
    const win = WINDOWS[u[1] > 0 ? 1 : -1];
    edge = Math.max(edge, 0.82 - 1.6 * Math.max(0, Math.abs(x - (win.x + 3) / 21) - 0.22));
    if (u[2] < edge) return null;
    if (Math.abs(u[1]) < 0.16 && u[2] > 0.85 && x > -0.55 && x < 0.3) return null;
    if (u[2] > 0.45 && patch(u, 2.4, 23) > 0.62) return MOSS[Math.max(1, Math.min(4, tone))];
    const streak = fr(u[2] * 4.2 + x * 1.3 + 0.35 * Math.sin(u[1] * 6 + 9)) < 0.24;
    return HIDE[Math.max(0, Math.min(4, tone - (streak || u[2] < edge + 0.06 ? 1 : 0)))];
  };
  put('mantle', 'mantle', { k: 'ball', c: W([-3, 0, 52.5]), ax: axes([21, 0, 0], [0, 12.9 * breathe, 0], [0, 0, 14.5 * breathe]), skin: mantle });
  // ITS RIBS: bare bone arcs from its spine down to its breastbone, both sides; the back ones float; two snapped short
  // on each side, a window on its eye
  for (const s of [1, -1]) {
    RIB_X.forEach((x0, i) => {
      const low = i >= 4 ? -50 : -78;
      const at = (deg: number): V3 => {
        const th = deg * D;
        return W([x0 - 1.8 * (1 - Math.sin(th)), s * CAGE_Y * breathe * Math.cos(th), CAGE_C + CAGE_Z * breathe * Math.sin(th)]);
      };
      const w = WINDOWS[s];
      // (the middle one snapped shortest, the two either side of it a little longer)
      const midRib = i === w.broken[1];
      const runs: [number, number][] = w.broken.includes(i) ? [[80, midRib ? 64 : 54 + 4 * (i % 2)], [low, midRib ? -56 : -44 + 4 * (i % 2)]] : [[80, low]];
      for (const [a0, a1] of runs) {
        const n = Math.max(2, Math.round(Math.abs(a1 - a0) / 26));
        for (let j = 0; j < n; j++) {
          const p = at(a0 + ((a1 - a0) * j) / n);
          const q = at(a0 + ((a1 - a0) * (j + 1)) / n);
          put(`ribs${s}`, `rib${s}_${i}_${a0}_${j}`, { k: 'rod', a: p, b: q, ra: 1.2, rb: 1.05, ramp: BONE });
        }
      }
    });
  }
  put('ribs1', 'sternum', { k: 'rod', a: W([13.5, 0, 37.4]), b: W([-3, 0, 37.2]), ra: 2.0, rb: 1.6, ramp: BONE });
  // ITS SPINE: knobs of bone along its back, bare in the rent of its hide, each with its spike
  for (let i = 0; i < 11; i++) {
    const x = 9 - i * 2.6;
    const z = 64.2 + 0.6 * Math.sin((i / 10) * Math.PI);
    put('spine', `vert${i}`, { k: 'ball', c: W([x, 0, z]), ax: axes([1.5, 0, 0], [0, 1.9, 0], [0, 0, 1.6]), skin: BONE });
    put('spine', `spike${i}`, { k: 'rod', a: W([x, 0, z + 1]), b: W([x - 0.8, 0, z + 3.4]), ra: 0.9, rb: 0.5, ramp: BONE });
  }

  // ITS EYE: in the window of its snapped ribs on the side you see, in a nest of roots; pale, veined, its iris burning
  // gold, a slit pupil; it looks at you, glances off and back, and blinks
  const gaze = norm(turn(toYou, P.look[0], -P.look[1], 0));
  const gl = norm(cross([0, 0, 1], gaze), [0, 1, 0]);
  const gu = norm(cross(gaze, gl));
  const open = 1 - P.lid;
  const topLid = -0.12 + 0.92 * open;
  const lowLid = -0.12 - 0.66 * open;
  const eyeSkin: Skin = (u, tone) => {
    if (u[2] > topLid || u[2] < lowLid) {
      const edge = Math.min(Math.abs(u[2] - topLid), Math.abs(u[2] - lowLid)) < 0.13;
      return edge ? INK : ROOT[Math.max(1, Math.min(3, tone))];
    }
    const c = u[0];
    if (c > 0.8 && Math.abs(u[1]) < 0.13 + 0.05 * (P.glow - 1)) return INK;
    if (c > 0.9) return FLAME[4];
    if (c > 0.76) return FLAME[3];
    if (c > 0.7) return FLAME[2];
    const phi = Math.atan2(u[2], u[1]);
    if (c < 0.64 && Math.abs(fr((phi * 6) / (Math.PI * 2) + 0.4 * c) - 0.5) < 0.05) return VEIN;
    return EYEBALL[Math.max(1, Math.min(4, tone + 1))];
  };
  put('eye', 'eye', { k: 'ball', c: eyeC, ax: [mul(gaze, R), mul(gl, R), mul(gu, R)], skin: eyeSkin });
  if (P.glow > 0.05) put('glow', 'eyeglow', { k: 'glow', p: add(eyeC, mul(gaze, R)), c: FLAME[3], r: 26 * Math.min(1.4, P.glow), a: Math.min(0.5, 0.32 * P.glow * (0.25 + 0.75 * open)) });
  // (its nest: roots from round its eye out to its ribs and the dark)
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + 0.4;
    const rim = add(eyeC, add(mul(gaze, R * 0.35), add(mul(gl, R * 0.95 * Math.cos(ang)), mul(gu, R * 0.95 * Math.sin(ang)))));
    const out = add(rim, add(mul(gl, 5.5 * Math.cos(ang)), add(mul(gu, 5.5 * Math.sin(ang)), mul(gaze, -2.5))));
    const bend = add(lerpV(rim, out, 0.5), mul(gaze, 1.4));
    put('nest', `nestA${i}`, { k: 'rod', a: rim, b: bend, ra: 1.25, rb: 1.0, ramp: ROOT });
    put('nest', `nestB${i}`, { k: 'rod', a: bend, b: out, ra: 1.0, rb: 0.6, ramp: ROOT });
  }
  // (roots knotted through where its flesh was: wound round its ribs on each side, and out of its hollow)
  for (const s of [1, -1]) {
    for (const [x0, z0, x1, z1] of [[10, 58, 4.5, 44], [-6, 60, -14, 46], [-11, 42, -3, 40]] as const) {
      const a = W([x0, s * 10.6, z0]);
      const b = W([x1, s * 10.9, z1]);
      const m = add(lerpV(a, b, 0.5), turned(P, [0, s * 1.6, 0]));
      put(`ribs${s}`, `wind${s}_${x0}a`, { k: 'rod', a, b: m, ra: 1.0, rb: 0.9, ramp: ROOT });
      put(`ribs${s}`, `wind${s}_${x0}b`, { k: 'rod', a: m, b, ra: 0.9, rb: 0.6, ramp: ROOT });
    }
  }

  // ITS NECK AND MANE: thick and shaggy, the mane hanging long under its throat
  const H = headFrame(P);
  const root = W(NECK_ROOT);
  const along = norm(sub(H.at, root));
  const nl = turned(P, [0, 1, 0]);
  const nu = norm(cross(along, nl));
  const shag = (seed: number): Skin => (u, tone) => {
    const streak = fr(u[0] * 3.1 + 0.4 * Math.sin(u[2] * 5 + seed) + u[1] * 0.6) < 0.3;
    return (u[2] < -0.25 ? MANE : HIDE)[Math.max(0, Math.min(4, tone - (streak ? 1 : 0)))];
  };
  put('neck', 'neckroot', { k: 'ball', c: root, ax: axes([9, 0, 0], [0, 8.6, 0], [0, 0, 10.5]), skin: hideSkin(11, true) });
  ([[0.3, 9.4, 8.2, 8.6], [0.62, 8.2, 7.2, 7.6], [0.92, 6.8, 6.2, 6.6]] as const).forEach(([k, ra, rl, ru], i) => {
    put('neck', `neck${i}`, { k: 'ball', c: lerpV(root, H.at, k), ax: [mul(along, ra), mul(nl, rl), mul(nu, ru)], skin: shag(i * 2.3) });
  });
  // (its mane: long dark hair hanging from under its throat, and shaggy down both sides of its neck)
  for (let i = 0; i < 6; i++) {
    const k = 0.1 + i * 0.16;
    const throat = add(lerpV(root, H.at, k), add(mul(nu, -(7.2 - 2.6 * k)), mul(nl, (i % 2 ? 1 : -1) * 2.4)));
    strand(put, 'mane', `mane${i}`, throat, 11 - 4 * k, 2.4, 0.5, MANE, add(mul(P.drag, 0.7), mul(P.dragHead, 0.5 * k)), sway(i * 1.7));
  }
  for (const sd of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const k = 0.2 + i * 0.27;
      const side = add(lerpV(root, H.at, k), add(mul(nl, sd * (7.6 - 2.2 * k)), mul(nu, -1.5)));
      strand(put, `ruff${sd}`, `ruff${sd}_${i}`, side, 7 - 2 * k, 2.0, 0.5, MANE, add(mul(P.drag, 0.6), mul(P.dragHead, 0.4 * k)), sway(i * 2.9 + sd), 3);
    }
  }

  // ITS HEAD: the skull bare at its face (dark sockets, the nose's holes), hide behind and on its jaw; its ears
  const skullSkin: Skin = (u, tone) => {
    if (u[0] < -0.15 || (u[2] < -0.45 && u[0] < 0.4)) return HIDE[Math.max(0, Math.min(4, tone))];
    return BONE[Math.max(1, Math.min(4, tone))];
  };
  put('neck', 'poll', { k: 'ball', c: H.p([-1.5, 0, 1.2]), ax: [mul(H.f, 5.6), mul(H.l, 5.2), mul(H.u, 5.4)], skin: hideSkin(13, false) });
  put('head', 'cranium', { k: 'ball', c: H.p([3, 0, 2.2]), ax: [mul(H.f, 6.8), mul(H.l, 5.2), mul(H.u, 5.6)], skin: skullSkin });
  put('head', 'muzzle', { k: 'rod', a: H.p([6.5, 0, 0.8]), b: H.p([19, 0, -0.6]), ra: 3.7, rb: 2.3, ramp: BONE });
  put('jaw', 'jaw', { k: 'rod', a: H.p([3, 0, -3.4]), b: H.p([16.5, 0, -3.6]), ra: 2.8, rb: 1.6, ramp: HIDE });
  for (const s of [1, -1]) {
    put('head', `socket${s}`, { k: 'ball', c: H.p([5.2, s * 4.4, 3.2]), ax: [mul(H.f, 1.9), mul(H.l, 1.2), mul(H.u, 1.5)], skin: HOLLOW });
    put('head', `nostril${s}`, { k: 'dot', p: H.p([19.6, s * 1.1, -0.4]), c: INK, facing: H.f });
    // (its ears: long and torn, laid back as it tosses and snorts)
    const base = H.p([-1.5, s * 4.2, 4.5]);
    const tip = add(base, mul(norm(add(add(mul(H.f, -1), mul(H.l, s * 1.1)), mul(H.u, 0.55 - P.ears / 60))), 7));
    put('head', `ear${s}`, { k: 'rod', a: base, b: tip, ra: 1.9, rb: 0.6, ramp: HIDE });
  }
  // ITS ANTLERS: towering, wide: a beam each side sweeping up and out, its tines turned forward and up; moss hanging
  for (const s of [1, -1]) {
    const B: V3 = [1.5, s * 2.6, 5.4];
    const at = (v: V3): V3 => H.q(add(B, [v[0], s * v[1], v[2]]));
    const beam: V3[] = [[0, 0, 0], [-4, 7, 10], [-8.5, 16, 22], [-10, 25.5, 34], [-7.5, 33.5, 45.5], [-1.5, 38.5, 55], [5, 40, 61]];
    const part = `antler${s}`;
    for (let i = 0; i < beam.length - 1; i++) put(part, `beam${s}_${i}`, { k: 'rod', a: at(beam[i]), b: at(beam[i + 1]), ra: 3.0 - 0.3 * i, rb: 3.0 - 0.3 * (i + 1), ramp: ANTLER });
    put(part, `burr${s}`, { k: 'ball', c: at([0, 0, 0.6]), ax: [mul(H.f, 3.4), mul(H.l, 3.4), mul(H.u, 1.8)], skin: ANTLER });
    const tines: [V3, V3, number][] = [
      [lerpV(beam[0], beam[1], 0.3), [11, 6, 7], 1.9],
      [lerpV(beam[1], beam[2], 0.3), [9, 12.5, 18], 1.7],
      [lerpV(beam[2], beam[3], 0.45), [6, 21, 37], 1.5],
      [lerpV(beam[3], beam[4], 0.5), [5, 28.5, 50], 1.35],
      [beam[5], [9.5, 41.5, 67], 1.1],
      [beam[5], [-7.5, 44, 60], 1.05],
    ];
    tines.forEach(([from, to, r], i) => {
      const mid = lerpV(from, to, 0.55);
      const curl: V3 = [mid[0] - 0.8, mid[1], mid[2] - 1.2];
      put(part, `tine${s}_${i}a`, { k: 'rod', a: at(from), b: at(curl), ra: r, rb: r * 0.75, ramp: ANTLER });
      put(part, `tine${s}_${i}b`, { k: 'rod', a: at(curl), b: at(to), ra: r * 0.75, rb: 0.5, ramp: ANTLER });
    });
    strand(put, `moss${s}`, `moss${s}a`, at([-8.6, 17, 23.5]), 11, 1.4, 0.5, MOSS, mul(P.dragHead, 1.2), sway(s * 2.1), 3);
    strand(put, `moss${s}`, `moss${s}b`, at([-9.2, 29, 39]), 8, 1.2, 0.45, MOSS, mul(P.dragHead, 1.2), sway(s * 3.3), 3);
  }

  // ITS LEGS: the upper legs thick with hide, its left forearm bone with a root wound round it; knobbed knees and hocks;
  // slender cannons; black hoofs. Each foot where its pose sets it.
  P.feet.forEach((foot, i) => {
    const front = i < 2;
    const s = i % 2 === 0 ? -1 : 1;
    const top = W(LEG_TOP[i]);
    const fold = P.fold[i];
    const lowJoint = lowerOf(foot, front ? FORE_KNEE : HIND_HOCK, fold);
    const fet = lowerOf(foot, front ? FORE_FET : HIND_FET, fold);
    const [l1, l2] = front ? UPPER : HIND_UPPER;
    const mid = joint(top, lowJoint, l1, l2, turned(P, front ? [-1, s * 0.15, 0] : [1, s * 0.1, 0]));
    const part = `leg${i}`;
    const boneArm = front && s === 1;
    if (front) {
      put(part, `arm${i}`, { k: 'rod', a: top, b: mid, ra: 5.8, rb: 3.6, ramp: HIDE, far: true });
      put(part, `fore${i}`, { k: 'rod', a: mid, b: lowJoint, ra: boneArm ? 2.2 : 3.0, rb: boneArm ? 1.6 : 1.9, ramp: boneArm ? BONE : HIDE, far: true });
      if (boneArm) {
        // (a root wound round its bare forearm)
        for (let j = 0; j < 5; j++) {
          const k0 = j / 5;
          const k1 = (j + 1) / 5;
          const ring = (k: number): V3 => {
            const c = lerpV(mid, lowJoint, 0.1 + 0.8 * k);
            const a = k * Math.PI * 4;
            return add(c, turned(P, [Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0]));
          };
          put(part, `wrap${i}_${j}`, { k: 'rod', a: ring(k0), b: ring(k1), ra: 0.9, rb: 0.9, ramp: ROOT, far: true });
        }
      }
    } else {
      put(part, `thigh${i}`, { k: 'rod', a: top, b: mid, ra: 7.2, rb: 4.6, ramp: HIDE, far: true });
      put(part, `shank${i}`, { k: 'rod', a: mid, b: lowJoint, ra: 3.6, rb: 1.9, ramp: HIDE, far: true });
    }
    put(part, `knob${i}`, { k: 'ball', c: lowJoint, ax: [[2.1, 0, 0], [0, 2.0, 0], [0, 0, 2.1]], skin: boneArm ? BONE : KNOB, far: true });
    put(part, `cannon${i}`, { k: 'rod', a: lowJoint, b: fet, ra: 1.75, rb: 1.45, ramp: HIDE, far: true });
    put(part, `fet${i}`, { k: 'ball', c: fet, ax: [[1.9, 0, 0], [0, 1.8, 0], [0, 0, 1.9]], skin: HIDE, far: true });
    const hoofUp = lowerOf(foot, [0.6, 0, 2.6], fold);
    put(part, `pastern${i}`, { k: 'rod', a: fet, b: hoofUp, ra: 1.5, rb: 1.7, ramp: HIDE, far: true });
    put(part, `hoof${i}`, { k: 'ball', c: lowerOf(foot, [1.1, 0, 1.75], fold), ax: [turn([3.1, 0, 0], 0, fold, 0), [0, 2.4, 0], turn([0, 0, 1.75], 0, fold, 0)], skin: HOOF, far: true });
  });

  // ITS TAIL: short, a tattered tuft, flicking
  const tailRoot = W([-37, 0, 58]);
  const tailDir = turned(P, turn(norm([-0.45, 0, -1]), P.tail[1], -P.tail[0], 0));
  put('tail', 'tail', { k: 'rod', a: tailRoot, b: add(tailRoot, mul(tailDir, 7)), ra: 2.6, rb: 1.6, ramp: HIDE });
  put('tail', 'tuft', { k: 'rod', a: add(tailRoot, mul(tailDir, 6)), b: add(tailRoot, mul(tailDir, 10)), ra: 1.6, rb: 0.5, ramp: MANE });

  // ITS TATTERS: its hide hanging in strips off its shoulders, its haunch and its back over its ribs; and roots
  // dangling from its hollow belly
  for (const s of [1, -1]) {
    const tatters: [V3, number][] = [
      [[11, s * 9.4, 45], 9],
      [[14, s * 9.9, 42.5], 6.5],
      [[-16.5, s * 9.8, 46], 10],
      [[-20.5, s * 10.2, 43], 7],
      [[-13.5, s * 8.6, 62.5], 12],
      [[22, s * 6.5, 42], 6],
    ];
    tatters.forEach(([a, l], i) => strand(put, `tatter${s}_${i}`, `tatter${s}_${i}`, W(a), l, 1.9, 0.6, HIDE, P.drag, sway(i * 1.3 + s)));
  }
  const roots: [V3, number][] = [[[5, 3, 38.5], 13], [[-3, -3, 38.5], 15], [[-10, 2, 39.5], 11], [[1, -1, 38], 9]];
  roots.forEach(([a, l], i) => strand(put, 'roots', `root${i}`, W(a), l, 1.15, 0.45, ROOT, P.drag, sway(i * 2.3), 5));
}

/** One frame of the Stag: `which` (stand), `t` seconds in, from in front or behind. */
export function stagPainted(which: string, t: number, view: GameView = 'front'): Painted {
  eyeOf(view);
  const P = poseOf(which, t, view);
  const st = stage(view, STAG_CANVAS.ax, STAG_CANVAS.ay, STAG_CANVAS);
  const bits: Bit[] = [];
  stagBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, view);
  const lights = paintBits(st, bits, worldOf(P, PIVOT));
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[3], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}
/** A grain laid on a finished picture (after its pink edge, so that it stays its own colour), on whole game pixels. */
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
/** How many grains its moves throw off at one moment (for the tests). */
export function stagChipCount(which: string, t: number): number {
  return poseOf(which, t).chips.length;
}
/** Its hoofs at one moment (for the tests). */
export function stagFeet(which: string, t: number): V3[] {
  return poseOf(which, t).feet;
}
/** Its eye's lids at one moment (0 open, 1 shut; for the tests). */
export function stagLid(which: string, t: number): number {
  return poseOf(which, t).lid;
}
/** The same frame as the game holds a figure (its pool of light behind it while it lives). */
export function stagFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(stagPainted(which, t, view), which === 'dying' ? null : STAG_AURA, STAG_CANVAS.ax, STAG_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them (as seen from `view`: its eye is on the side you see). */
export function stagSolids(which: string, t: number, view: GameView = 'front'): Bit[] {
  eyeOf(view);
  const bits: Bit[] = [];
  stagBits(poseOf(which, t, view), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, view);
  return bits;
}
