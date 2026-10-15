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
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { lazyFrames } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Sheet, Stage } from './skin';
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
/** The earth heaved up round it as it is dragged under: the Pinewood's earth, torn. */
const EARTH: Ramp = ['#1e140e', '#30221a', '#463426', '#604834', '#7a5e44'];
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

/** The canvas it is painted on, and its floor point on it (room for its antlers' tips as it rears, from behind; for the splinters of its charge before it). */
export const STAG_CANVAS = { w: 420, h: 400, ax: 190, ay: 312 };
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
  /** Its jaw (0 shut, 1 wide: its bellow). */
  jaw: number;
  /** Still living: its pink edge is painted round it. */
  alive: boolean;
  /** Its death: how far the roots have grown up round it (0 to 1), how far the earth has heaved round it (0 to 1); and whether the floor swallows what of it is below the floor (dragged down). */
  grown: number;
  earth: number;
  swallowed: boolean;
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
  jaw: 0,
  alive: true,
  grown: 0,
  earth: 0,
  swallowed: false,
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
  if (t >= 0.92 && t < 1.1) return lift(0.92, 1.1, 9.5, 3, 68);
  if (t >= 1.1 && t < s1) return strike(1.1, s1, 9.5, 3, 68);
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
    neck: -6 * toss + 10 * snortDown - 2 * snortJerk + 4 * jolt,
    head: [7 * shake * toss + 5 * Math.sin(a + 2), -18 * toss + 13 * snortDown - 6 * snortJerk + 4 * jolt + 3 * Math.sin(a), 7 * shake * toss],
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

// ---------------------------------------------------------------------------------------------
// ITS MOVES (his design doc's: "an antler gore (its basic attack); a charge that splinters trees; lines of roots
// bursting toward you; a bellow that wolves answer from the fog"; and his pick for its death, "Roots drag it down into
// the ground")

/** How fast it walks (tiles a second): slow, stalking. Its walk is painted for it, so each hoof down stays on its spot. */
export const STAG_PACE = 0.8;
/** Its walk: a four-beat stalk, sixteen frames a second, one round of 0.875 s (its left hind, left fore, right hind, right fore). */
export const STAG_WALK = { frames: 14, fps: 16, period: 0.875 } as const;
/** Its basic blow, the antler gore: its head lowered, antlers aimed, held trembling (the warning) from `warn`; the thrust from `thrust`, its antlers raking the earth and hooking up through you at `hit`, held a tenth (`freeze`); flung up high after; `reach`: how far before its feet its antlers sweep (its own lengths). */
export const STAG_GORE = { long: 1.7, warn: 0.38, thrust: 0.6, hit: 0.9, freeze: 0.1, reach: 66, fps: 30 } as const;
/** Its charge that splinters trees: head lowered, pawing, snorting (the warning, from `warn`); THE RUN from `run` to `crash`, the game carrying it `pace` tiles a second; at `crash` its antlers smash into what is before it, held (`freeze`), splinters flying; it shakes its head and steps back onto its stand. */
export const STAG_CHARGE = { long: 2.7, warn: 0.3, run: 0.84, crash: 1.74, freeze: 0.12, pace: 6, fps: 30 } as const;
/** Its roots: it rears up on its hind legs (by `rear`), forelegs pawing the air, held (the warning); it slams its forefeet down at `slam`, held (`freeze`); lines of roots burst out from it toward you, `speed` tiles a second, out to `reach` tiles (each burst painted by `rootBurstPainted`, laid by the game along its lines). */
export const STAG_ROOTS = { long: 2.6, rear: 0.55, slam: 1.0, freeze: 0.1, speed: 7, reach: 6, fps: 30 } as const;
/** Its bellow: it draws in its breath, its ribs swelling; throws its head up, its jaw opening (the warning, from `warn`); THE BELLOW from `roar` to `quiet`, rings of fog rolling from its mouth and fog pouring out over the ground round it (the wolves answer from the fog: the game's). */
export const STAG_BELLOW = { long: 2.6, warn: 0.45, roar: 0.75, quiet: 1.75, fps: 30 } as const;
/** Struck: held a moment; its head thrown back, rocked, its eye flinching shut, bone and moss flying off it; back on its stand by `long`. */
export const STAG_REEL = { long: 0.6, freeze: 0.06, fps: 30 } as const;
/** Its death (his pick, roots drag it down into the ground): held as the blow lands (`freeze`); roots burst up round its legs (`roots`); dragged down from `sink`, its legs folding, thrashing; its eye shuts and goes out by `out`; under by `under`, only its antlers standing up out of the heaved earth; still from `still`. */
export const STAG_DIE = { long: 3.2, freeze: 0.12, roots: 0.2, sink: 0.55, out: 2.3, under: 2.6, still: 2.75, fps: 30 } as const;

const STAND0 = standBase(0);
/** Ease out with a little overshoot that settles (a follow-through). */
const backOut = (v: number): number => {
  const c = cl01(v) - 1;
  return 1 + 2.5 * c * c * c + 1.5 * c * c;
};
/** A key of its body and head, to blend between. */
interface Key {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  neck: number;
  hy: number;
  hp: number;
  hr: number;
  ears: number;
  glow: number;
  jaw: number;
  breath: number;
}
const keyOf = (P: StagPose): Key => ({ x: P.x, y: P.y, z: P.z, yaw: P.yaw, pitch: P.pitch, roll: P.roll, neck: P.neck, hy: P.head[0], hp: P.head[1], hr: P.head[2], ears: P.ears, glow: P.glow, jaw: P.jaw, breath: P.breath });
const K0 = keyOf(STAND0);
const keyed = (k: Partial<Key>): Key => ({ ...K0, ...k });
function mixKey(a: Key, b: Key, k: number): Key {
  const o = { ...a };
  for (const f of Object.keys(a) as (keyof Key)[]) o[f] = a[f] + (b[f] - a[f]) * k;
  return o;
}
/** A moment of it from a key: its feet where they stand (or as given). */
function fromKey(K: Key, feet: V3[] = STAG_FEET, fold: number[] = [0, 0, 0, 0]): StagPose {
  return { ...STAND0, x: K.x, y: K.y, z: K.z, yaw: K.yaw, pitch: K.pitch, roll: K.roll, neck: K.neck, head: [K.hy, K.hp, K.hr], ears: K.ears, glow: K.glow, jaw: K.jaw, breath: K.breath, feet: feet.map((f) => f), fold: fold.slice(), look: [0, 0], lid: 0, tail: [0, 0], chips: [], flares: [] };
}
/** Along a run of keys at their times, each stretch eased its own way. */
function along(t: number, keys: [number, Key, (v: number) => number][]): Key {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, k1, ease] = keys[i];
    const [t0, k0] = keys[i - 1];
    if (t < t1) return mixKey(k0, k1, ease((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}
const lin = (v: number): number => cl01(v);
/** Slow to start, a little past its mark, and settled, slow to stop (a wind-up's weight, a follow-through). */
const swell = (v: number): number => {
  const c = cl01(v);
  return sm(c) + 0.3 * Math.pow(Math.sin(Math.PI * c), 2) * c;
};
const easeIn = (v: number): number => Math.pow(cl01(v), 2);
const easeOut = (v: number): number => 1 - Math.pow(1 - cl01(v), 2);
/** A shiver: its body and head trembling as it holds a pose. */
const shiver = (t: number, k: number, a = 1): Partial<Key> => ({ hy: a * 1.4 * Math.sin(t * 190) * k, hp: a * 1.1 * Math.sin(t * 150 + 1) * k, z: a * 0.35 * Math.sin(t * 170 + 2) * k });
const plus = (K: Key, d: Partial<Key>): Key => {
  const o = { ...K };
  for (const f of Object.keys(d) as (keyof Key)[]) o[f] += d[f] ?? 0;
  return o;
};

/** A hoof's steps by a list of them (each lifted at `a`, set down at `b` on a spot `to` along the floor from where it stood), the floor going by under its body by `ground`: where the hoof is on its body's own floor, and its fold. */
function stepping(i: number, t: number, steps: { a: number; b: number; to: number; up: number; fold: number }[], ground: number): { foot: V3; fold: number } {
  const r = STAG_FEET[i];
  let at = 0;
  for (const s of steps) {
    if (t < s.a) break;
    if (t < s.b) {
      const v = (t - s.a) / (s.b - s.a);
      const x = at + (s.to - at) * sm(v);
      return { foot: [r[0] + x - ground, r[1], s.up * Math.sin(Math.PI * v)], fold: s.fold * Math.sin(Math.PI * v) };
    }
    at = s.to;
  }
  return { foot: [r[0] + at - ground, r[1], 0], fold: 0 };
}
/** A forefoot struck down on its own spot, as in its stand's pawing, lifted at `a`, high at `b`, down at `c`. */
function pawAt(t: number, a: number, b: number, c: number, up: number, fold: number): { foot: V3; fold: number } | null {
  const F = STAG_FEET[0];
  if (t < a || t >= c) return null;
  if (t < b) {
    const u = sm((t - a) / (b - a));
    return { foot: [F[0] - 3.5 * u, F[1], up * Math.sin((Math.PI / 2) * u)], fold: fold * u };
  }
  const v = Math.pow(cl01((t - b) / (c - b)), 1.6);
  return { foot: [F[0] - 3.5 * (1 - v) + 4 * Math.sin(Math.PI * v), F[1], up * (1 - v * v)], fold: fold * (1 - v) - 18 * Math.sin(Math.PI * v) };
}

// --- ITS WALK ---
const WALK_DUTY = 0.6;
/** When each hoof comes down in its round: its right fore, left fore, right hind, left hind (its left hind, left fore, right hind, right fore, a quarter of a round apart; the round begins where its hoofs are nearest where they stand, so that it steps off its stand without a leap). */
const WALK_DOWN = [0.375, 0.875, 0.125, 0.625];
function walkFoot(i: number, ph: number): { foot: V3; fold: number } {
  const r = STAG_FEET[i];
  const front = i < 2;
  const span = STAG_PACE * TILE3 * STAG_WALK.period;
  const half = (span * WALK_DUTY) / 2;
  const u = fr(ph - WALK_DOWN[i]);
  if (u < WALK_DUTY) return { foot: [r[0] + half - span * u, r[1], 0], fold: 0 };
  const v = (u - WALK_DUTY) / (1 - WALK_DUTY);
  return { foot: [r[0] - half + 2 * half * sm(v), r[1], (front ? 7.5 : 5.5) * Math.sin(Math.PI * v)], fold: (front ? 64 : 24) * Math.sin(Math.PI * v) };
}
/** Its walk: slow and heavy, its head nodding with its forefeet, its weight rolling from side to side; its eye on you. */
function walkPose(t: number): StagPose {
  const ph = fr(t / STAG_WALK.period);
  const a = Math.PI * 2 * ph;
  const fs = [0, 1, 2, 3].map((i) => walkFoot(i, ph));
  return {
    ...STAND0,
    x: 0,
    y: 0.9 * Math.sin(a + 0.4),
    z: 0.9 * Math.cos(2 * a),
    yaw: 1.5 * Math.sin(a),
    pitch: 1.3 * Math.sin(a),
    roll: 1.8 * Math.sin(a),
    neck: 3 * Math.sin(2 * a + 0.8),
    head: [4 * Math.sin(a), 4 * Math.sin(2 * a + 1.2), 2 * Math.sin(a)],
    ears: 0,
    tail: [6 * Math.sin(2 * a), 10 * Math.sin(a)],
    feet: fs.map((f) => f.foot),
    fold: fs.map((f) => f.fold),
    breath: Math.sin(a),
    look: [0, 0],
    lid: 0,
    glow: 1 + 0.1 * Math.sin(a),
    chips: [],
    flares: [],
  };
}

// --- ITS ANTLER GORE ---
// (its head down low, its antlers' tines aimed forward at a man's height; driven in lower still, its brow tines raking
// the earth; hooked up through him; flung on up)
const G_LOW = keyed({ x: -5, z: -4, pitch: 6, neck: 72, hp: 52, hy: -9, hr: -4, ears: -25, glow: 1.6 });
const G_SCRAPE = keyed({ x: 5, z: -5, pitch: 9, neck: 82, hp: 62, hy: -4, hr: -2, ears: -30, glow: 1.8 });
const G_HIT = keyed({ x: 10, z: -1, pitch: 2, neck: 36, hp: 22, hy: 8, hr: 5, ears: -30, glow: 2 });
const G_FLUNG = keyed({ x: 7, z: 2, pitch: -6, neck: 0, hp: -14, hy: 12, hr: 8, ears: -20, glow: 1.5 });
/**
 * The antler gore, its basic blow: it lowers its head, its antlers aimed at you, crouched on its haunches, cocked to
 * one side (the warning, held, trembling, snorting); then it drives forward, its antlers raking the earth and hooking up
 * through you (`hit`), held a tenth; its head flung up high, its forefeet lifted off the floor by the force; and it comes
 * back down onto its stand.
 */
function gorePose(t: number): StagPose {
  const G = STAG_GORE;
  const tt = t >= G.hit && t < G.hit + G.freeze ? G.hit : t;
  let K = along(tt, [
    [0, K0, lin],
    [G.warn, G_LOW, swell],
    [G.thrust, G_LOW, lin],
    [0.68, G_SCRAPE, easeIn],
    [G.hit, G_HIT, (v) => Math.pow(cl01(v), 1.3)],
    [G.hit + G.freeze, G_HIT, lin],
    [1.32, G_FLUNG, easeOut],
    [G.long, K0, swell],
  ]);
  if (tt > G.warn && tt < G.thrust) K = plus(K, shiver(tt, sm((tt - G.warn) / 0.08)));
  const lift = 3.5 * bump(tt, 1.0, 1.44);
  const feet = STAG_FEET.map((f, i): V3 => (i < 2 ? [f[0], f[1], lift] : f));
  const P = fromKey(K, feet, [28 * lift / 3.5, 28 * lift / 3.5, 0, 0]);
  P.tail = [30 * bump(tt, 0.6, 1.4), 0];
  return P;
}

// --- ITS CHARGE ---
const C_LOW = keyed({ x: -4, z: -3, pitch: 4, neck: 58, hp: 46, hy: 0, ears: -30, glow: 1.6 });
const C_RUN = keyed({ x: 0, z: 0, pitch: 4, neck: 56, hp: 44, ears: -38, glow: 1.9 });
const C_SMASH = keyed({ x: 3, z: -2, pitch: 8, neck: 64, hp: 50, ears: -38, glow: 2.1 });
const C_RECOIL = keyed({ x: -3, z: 1, pitch: -3, neck: 16, hp: 6, ears: -10, glow: 1.4 });
/** Its feet through its charge: its forefeet paw twice in the warning; galloping, its hind pair and fore pair by turns; its forefeet braced forward at the crash; then it steps back onto its stand. The floor goes by under it at its pace through the run. */
function chargeFeet(t: number): { foot: V3; fold: number }[] {
  const C = STAG_CHARGE;
  const V = C.pace * TILE3;
  const ground = V * cl01((t - C.run) / (C.crash - C.run)) * (C.crash - C.run);
  const end = V * (C.crash - C.run);
  const at = (tau: number): number => C.run + tau;
  const X = (tau: number): number => V * Math.max(0, tau);
  const H = 11.75;
  const hind = (d: number): { a: number; b: number; to: number; up: number; fold: number }[] => [
    { a: at(0 + d), b: at(0.2 + d), to: X(0.2 + d) + H, up: 9, fold: 35 },
    { a: at(0.3 + d), b: at(0.5 + d), to: X(0.5 + d) + H, up: 9, fold: 35 },
    { a: at(0.6 + d), b: at(0.8 + d), to: X(0.8 + d) + H, up: 9, fold: 35 },
    { a: 2.0 + d * 8, b: 2.28 + d * 8, to: end, up: 6, fold: 22 },
  ];
  const fore = (d: number, back: number): { a: number; b: number; to: number; up: number; fold: number }[] => [
    { a: at(-0.08 + d), b: at(0.12 + d), to: X(0.12 + d) + H, up: 13, fold: 75 },
    { a: at(0.22 + d), b: at(0.42 + d), to: X(0.42 + d) + H, up: 13, fold: 75 },
    { a: at(0.52 + d), b: at(0.72 + d), to: X(0.72 + d) + H, up: 13, fold: 75 },
    { a: at(0.8), b: at(0.9), to: end + 13, up: 8, fold: 40 },
    { a: back, b: back + 0.26, to: end, up: 6, fold: 50 },
  ];
  const out = [stepping(0, t, fore(0.02, 2.12), ground), stepping(1, t, fore(0, 1.94), ground), stepping(2, t, hind(0.02), ground), stepping(3, t, hind(0), ground)];
  for (const [a, b, c] of [[0.38, 0.45, 0.5], [0.56, 0.63, 0.68]] as const) {
    const p = pawAt(t, a, b, c, 10, 70);
    if (p) out[0] = p;
  }
  return out;
}
/**
 * Its charge that splinters trees: it lowers its head and crouches, paws the ground twice and snorts (the warning);
 * it bursts into a gallop, its head low, its antlers before it, the game carrying it at its pace; at the crash its
 * antlers smash into what is before it (a pine, the knight), held, splinters of wood and bark and needles flying; its
 * head flung back; it shakes its head and steps back onto its stand.
 */
function chargePose(t: number): StagPose {
  const C = STAG_CHARGE;
  const tt = t >= C.crash && t < C.crash + C.freeze ? C.crash : t;
  const tau = tt - C.run;
  let K = along(tt, [
    [0, K0, lin],
    [C.warn, C_LOW, swell],
    [C.run - 0.04, C_LOW, lin],
    [C.run + 0.1, C_RUN, easeOut],
    [C.crash - 0.05, C_RUN, lin],
    [C.crash, C_SMASH, easeIn],
    [C.crash + C.freeze, C_SMASH, lin],
    [2.2, C_RECOIL, sm],
    [2.46, C_RECOIL, lin],
    [C.long, K0, sm],
  ]);
  if (tt > C.warn && tt < C.run - 0.04) K = plus(K, shiver(tt, sm((tt - C.warn) / 0.1), 0.7));
  if (tau > 0 && tt < C.crash - 0.05) {
    // (the gallop: rocking, its body rising and falling a stride at a time)
    const g = (2 * Math.PI * tau) / 0.3;
    const on = sm(tau / 0.1);
    K = plus(K, { z: 2.4 * Math.sin(g + 1.2) * on, pitch: 5 * Math.sin(g + 2.6) * on, hp: 3 * Math.sin(g) * on, neck: 2 * Math.sin(g + 0.5) * on });
  }
  // (shaking its head, the splinters off its antlers)
  K = plus(K, { hy: 11 * Math.sin(((tt - 2.14) / 0.4) * Math.PI * 3) * bump(tt, 2.14, 2.54), hr: 6 * Math.sin(((tt - 2.14) / 0.4) * Math.PI * 3 + 0.6) * bump(tt, 2.14, 2.54) });
  const fs = chargeFeet(tt);
  const P = fromKey(K, fs.map((f) => f.foot), fs.map((f) => f.fold));
  P.tail = [44 * bump(tt, C.run - 0.1, C.crash + 0.3), 10 * Math.sin(tt * 20) * bump(tt, C.run, C.crash)];
  return P;
}

// --- ITS ROOTS ---
/** Where its hind hips are: it rears up about them. */
const HIPS: V3 = [-27, 0, 52];
/** Reared up on its hind legs `deg` degrees: its pose's turn and the lift that keeps its hips where they are. */
function reared(K: Key, deg: number): Key {
  const rel = sub(HIPS, PIVOT);
  const r = turn(rel, K.yaw, K.pitch - deg, K.roll);
  const r0 = turn(rel, K.yaw, K.pitch, K.roll);
  return { ...K, pitch: K.pitch - deg, x: K.x + (r0[0] - r[0]), z: K.z + (r0[2] - r[2]) };
}
const R_GATHER = keyed({ z: -3, pitch: 3, neck: 10, hp: 16, ears: -20, glow: 1.4 });
const R_UP = keyed({ neck: -14, hp: -24, hy: 4, ears: -30, glow: 2, jaw: 0.45 });
const R_SLAM = keyed({ z: -1.5, neck: 8, hp: 14, ears: -30, glow: 2.1, jaw: 0 });
const R_GLARE = keyed({ neck: 10, hp: 18, ears: -15, glow: 1.7 });
/**
 * Its roots: it gathers itself on its haunches, then rears up on its hind legs, its forelegs pawing the air, its head
 * thrown up (the warning, held); it slams its forefeet down onto the spots they left, held a tenth, the earth bursting
 * under them; and lines of roots burst out from it toward you (painted by `rootBurstPainted`, laid by the game). It
 * glares after them, heaving, and settles.
 */
function rootsPose(t: number): StagPose {
  const R = STAG_ROOTS;
  const tt = t >= R.slam && t < R.slam + R.freeze ? R.slam : t;
  let K = along(tt, [
    [0, K0, lin],
    [0.2, R_GATHER, sm],
    [R.rear, R_UP, swell],
    [0.8, R_UP, lin],
    [R.slam, R_SLAM, (v) => Math.pow(cl01(v), 1.6)],
    [R.slam + R.freeze, R_SLAM, lin],
    [1.4, R_GLARE, easeOut],
    [1.8, R_GLARE, lin],
    [R.long, K0, sm],
  ]);
  if (tt > R.rear && tt < 0.85) K = plus(K, shiver(tt, sm((tt - R.rear) / 0.08), 0.8));
  const up = (v: number): number => 40 * swell(v);
  const top = 40 + 2 * Math.sin((0.8 - R.rear) * 20);
  const deg = tt < 0.2 ? 0 : tt < R.rear ? up((tt - 0.2) / (R.rear - 0.2)) : tt < 0.8 ? 40 + 2 * Math.sin((tt - R.rear) * 20) : tt < R.slam ? top * (1 - Math.pow((tt - 0.8) / (R.slam - 0.8), 1.6)) : 0;
  K = reared(K, deg);
  K = plus(K, { breath: 1.4 * Math.sin(tt * 14) * bump(tt, 1.1, 2.4) });
  const P = fromKey(K);
  // its forefeet: lifted off their spots as it rears, hanging folded and pawing the air, struck down onto the spots they left
  for (const i of [0, 1]) {
    const F = STAG_FEET[i];
    if (tt <= 0.22 || tt >= R.slam) continue;
    const paddle = Math.sin((tt - R.rear) * 22 + i * 2.4) * bump(tt, R.rear - 0.05, 0.84);
    const hang = worldOf(P, [24 + 3 * paddle, F[1], 16 + 3 * paddle]);
    const lifted = sm((tt - 0.22) / 0.22);
    const down = Math.pow(cl01((tt - 0.8) / (R.slam - 0.8)), 1.6);
    const air = lerpV(lerpV(F, hang, lifted), F, down);
    P.feet[i] = [air[0], air[1], Math.max(air[2], 0.01 * (1 - down))];
    P.fold[i] = (95 + 18 * paddle) * lifted * (1 - down) - 14 * Math.sin(Math.PI * down);
  }
  P.tail = [40 * bump(tt, 0.2, 1.3), 0];
  return P;
}

// --- ITS BELLOW ---
const B_IN = keyed({ z: 1, pitch: -2, neck: 6, hp: 14, ears: -10, glow: 1.6, breath: 2.4 });
const B_UP = keyed({ z: 1.5, pitch: -4, neck: -18, hp: -42, hy: 3, ears: -35, glow: 2, jaw: 0.4, breath: 2.4 });
const B_ROAR = keyed({ z: 0.5, pitch: -3, neck: -16, hp: -38, hy: -3, ears: -40, glow: 2.3, jaw: 1, breath: -1.8 });
/**
 * Its bellow: it lowers its head and draws in its breath, its ribs swelling; it throws its head up, its jaw opening, held
 * (the warning); then THE BELLOW, its jaw wide, its whole body shaking: rings of fog roll out from its mouth, and fog pours
 * out of its open ribs and over the ground round it; its ribs empty. Its jaw shuts, it lowers its head and settles, the
 * fog thinning.
 */
function bellowPose(t: number): StagPose {
  const B = STAG_BELLOW;
  let K = along(t, [
    [0, K0, lin],
    [B.warn - 0.05, B_IN, sm],
    [B.roar - 0.06, B_UP, swell],
    [B.roar, plus(B_UP, { jaw: 0.6 - 0.4 }), lin],
    [B.roar + 0.1, B_ROAR, easeOut],
    [B.quiet, B_ROAR, lin],
    [1.98, keyed({ neck: -6, hp: -10, glow: 1.4, jaw: 0, breath: -1 }), sm],
    [B.long, K0, sm],
  ]);
  if (t > B.roar - 0.06 && t < B.quiet) K = plus(K, shiver(t, sm((t - B.roar + 0.06) / 0.1), t > B.roar ? 1.5 : 0.7));
  if (t > B.roar && t < B.quiet) K = plus(K, { glow: 0.25 * Math.sin(t * 40), roll: 1.2 * Math.sin(t * 90) });
  const P = fromKey(K);
  P.tail = [25 * bump(t, 0.4, 1.9), 0];
  return P;
}

// --- STRUCK ---
/** Struck: held as the blow lands; its head thrown back, its body rocked back and up, its eye flinching shut, bone and moss and hide flying off it; back on its stand by its end. */
function reelPose(t: number): StagPose {
  const R = STAG_REEL;
  if (t < R.freeze) return { ...STAND0, glow: 1.8, chips: [], flares: [] };
  const k = cl01((t - R.freeze) / (R.long - R.freeze));
  const kk = cl01(k / 0.75);
  const arc = Math.sin(Math.PI * (1 - (1 - kk) * (1 - kk)));
  const K = plus(K0, { x: -4.5 * arc, z: 1.4 * arc, pitch: -4 * arc, roll: 3.5 * Math.sin(3 * Math.PI * kk) * (1 - kk), neck: -7 * arc, hp: -13 * arc, hy: 7 * arc, hr: 5 * arc, ears: -30 * arc, glow: 0.8 * (1 - k) });
  const P = fromKey(K);
  P.lid = 0.85 * bump(t, R.freeze, 0.4);
  P.tail = [30 * arc, 0];
  return P;
}

// --- ITS DEATH ---
/**
 * Its death (his pick: roots drag it down into the ground): held as the blow lands; it throws up its head, its jaw open,
 * as roots burst up out of the earth round its legs and climb them; it is dragged down, its legs folding, the earth
 * heaving round it, roots arching over its back; it thrashes its head once; its eye glares, shuts, and goes out; it is
 * gone under, only its antlers standing up out of the heaved earth, roots coiled round them. Nothing of it is seen
 * below the floor: the floor swallows it.
 */
function deathPose(t: number): StagPose {
  const Dd = STAG_DIE;
  if (t < Dd.freeze) return { ...STAND0, alive: false, glow: 2, chips: [], flares: [] };
  const sinkK = sm((t - Dd.sink) / (Dd.under - Dd.sink));
  const sink = 6 * sm((t - Dd.sink) / 0.12) + 76 * Math.pow(sinkK, 1.15);
  let K = along(t, [
    [Dd.freeze, keyed({ glow: 2 }), lin],
    [0.42, keyed({ x: -3, roll: 5, neck: -12, hp: -28, hy: 6, jaw: 0.75, ears: -35, glow: 2.2 }), easeOut],
    [1.1, keyed({ x: -2, roll: 9, pitch: 5, neck: -4, hp: -10, hy: -4, jaw: 0.4, ears: -30, glow: 1.8 }), sm],
    [1.6, keyed({ x: -2, roll: 12, pitch: 7, neck: 6, hp: 10, hy: 6, jaw: 0.6, ears: -30, glow: 1.4 }), sm],
    [Dd.under, keyed({ x: -2, roll: 10, pitch: 6, neck: -6, hp: -12, hy: 2, jaw: 0, ears: -20, glow: 0 }), sm],
  ]);
  K = plus(K, { hy: 14 * Math.sin(((t - 1.1) / 0.5) * Math.PI * 3) * bump(t, 1.1, 1.6), z: -sink + 0.6 * Math.sin(t * 60) * bump(t, Dd.freeze, Dd.sink + 0.3) });
  const fold = sm((t - Dd.sink) / 0.9);
  const feet = STAG_FEET.map((f): V3 => [f[0], f[1], -sink * 0.92]);
  const P = fromKey(K, feet, [72 * fold, 72 * fold, 38 * fold, 38 * fold]);
  P.alive = false;
  P.swallowed = true;
  P.lid = cl01((t - 2.0) / 0.22);
  P.glow = Math.min(K.glow, 2.2 * (1 - sm((t - 1.9) / (Dd.out - 1.9))));
  P.grown = sm((t - Dd.roots) / 1.0);
  P.earth = sm((t - 0.25) / 0.45);
  P.tail = [0, 0];
  if (t >= Dd.still) return deathPose(Math.min(t, Dd.still - 1e-9));
  return P;
}

function basePose(which: string, t: number): StagPose {
  if (which === 'stand') return standBase(t);
  if (which === 'walk') return walkPose(t);
  if (which === 'attack') return gorePose(t);
  if (which === 'charge') return chargePose(t);
  if (which === 'roots') return rootsPose(t);
  if (which === 'bellow') return bellowPose(t);
  if (which === 'reel') return reelPose(t);
  return deathPose(t);
}
/** A move's length (its stand and walk: once round). */
export function stagLong(which: string): number {
  return ({ stand: STAG_STAND.period, walk: STAG_WALK.period, attack: STAG_GORE.long, charge: STAG_CHARGE.long, roots: STAG_ROOTS.long, bellow: STAG_BELLOW.long, reel: STAG_REEL.long, dying: STAG_DIE.long } as Record<string, number>)[which];
}

/** Where the tip of one of its antlers' beams is (its left, 1, or its right, -1). */
function antlerTip(P: StagPose, s: number): V3 {
  return headFrame(P).q([1.5 + 5, s * (2.6 + 40), 5.4 + 61]);
}

/** A burst of what flies from `c` at `t0`, thrown out (`ahead` biases it, and `up`), falling, gone `life` after. */
function burst(c: V3, t0: number, t: number, n: number, seed: number, cols: string[], o: { speed?: number; up?: number; ahead?: V3; life?: number; size?: number; spread?: number } = {}): [V3, string, number][] {
  const life = o.life ?? 0.5;
  const s = t - t0;
  if (s < 0 || s >= life) return [];
  const out: [V3, string, number][] = [];
  const ahead = o.ahead ?? [0, 0, 0];
  const sp = o.spread ?? 1;
  for (let i = 0; i < n; i++) {
    const ang = hash(i, 1, seed) * Math.PI * 2;
    const v = (o.speed ?? 30) * (0.45 + 0.75 * hash(i, 2, seed));
    const up = (o.up ?? 34) * (0.4 + 0.9 * hash(i, 3, seed));
    const z = c[2] + up * s - 190 * s * s;
    if (z < 0.6 && s > 0.06) continue;
    out.push([[c[0] + (Math.cos(ang) * sp + ahead[0]) * v * s, c[1] + (Math.sin(ang) * sp + ahead[1]) * v * s, Math.max(0.6, z)], cols[i % cols.length], o.size ?? (i % 3 ? 2 : 3)]);
  }
  return out;
}
/** Splinters of a pine smashed by its antlers: fresh pale wood, bark, needles. */
const SPLINTER = ['#e8d6aa', '#cbb07c', '#5a3a2a', '#f2e4c0', '#4c6a34', '#8a6a48'];
/** What flies off it when struck: bone, moss, dark hide. */
const FLAKES = [BONE[3], MOSS[3], HIDE[3], BONE[2], ROOT[3]];

/** Its sound's rings and its fog, rolled from its mouth and poured over the ground round it as it bellows. */
function bellowFog(P: StagPose, t: number): [V3, string, number][] {
  const B = STAG_BELLOW;
  const out: [V3, string, number][] = [];
  const H = headFrame(P);
  const mouth = H.p([17, 0, -2.5]);
  const up = norm(cross(H.f, H.l));
  for (const t0 of [B.roar, B.roar + 0.25, B.roar + 0.5, B.roar + 0.75]) {
    const s = t - t0;
    if (s < 0 || s >= 0.6) continue;
    const k = s / 0.6;
    const r = 5 + 26 * easeOut(k);
    const c = add(mouth, mul(H.f, 8 + 40 * easeOut(k)));
    const n = Math.round(34 * (1 - 0.4 * k));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t0 * 3;
      out.push([add(c, add(mul(H.l, Math.cos(a) * r), mul(up, Math.sin(a) * r))), FOG[k < 0.4 ? 0 : 1], k < 0.3 ? 3 : 2]);
    }
  }
  // (the fog pouring over the ground, rolling out round it, thinning)
  const s = t - (B.roar + 0.1);
  if (s >= 0 && t < B.long - 0.04) {
    const k = cl01(s / (B.long - 0.04 - B.roar - 0.1));
    for (let i = 0; i < 170; i++) {
      if (hash(i, 7, 61) < k * 1.05 - 0.1) continue;
      const a = hash(i, 1, 61) * Math.PI * 2;
      const r = 12 + 70 * easeOut(cl01(s / 1.1)) * (0.35 + 0.65 * hash(i, 2, 61));
      out.push([[-3 + Math.cos(a) * r * 1.2, Math.sin(a) * r, 1 + 7 * hash(i, 3, 61) * (1 - 0.5 * k)], FOG[Math.min(2, Math.floor(k * 2.2 + hash(i, 4, 61)))], k < 0.5 && i % 3 === 0 ? 4 : 3]);
    }
  }
  return out;
}

/** One moment of it, with what hangs from it dragged by its moving and what it throws off. */
/** The moment a move is held at, in a heavy blow's freeze (so that what hangs from it is held too). */
function heldAt(which: string, t: number): number {
  const held: Record<string, [number, number]> = { attack: [STAG_GORE.hit, STAG_GORE.freeze], charge: [STAG_CHARGE.crash, STAG_CHARGE.freeze], roots: [STAG_ROOTS.slam, STAG_ROOTS.freeze] };
  const h = held[which];
  return h && t >= h[0] && t < h[0] + h[1] ? h[0] : t;
}
function poseOf(which: string, t: number, view: GameView = 'front'): StagPose {
  const P = basePose(which, t);
  const before = basePose(which, heldAt(which, t) - 0.1);
  P.drag = sub(worldOf(P, [0, 0, 40]), worldOf(before, [0, 0, 40]));
  P.dragHead = sub(headFrame(P).at, headFrame(before).at);
  if (which === 'charge') {
    // (running, the wind of its own going streams what hangs from it back)
    const C = STAG_CHARGE;
    const wind = 5.5 * bump(heldAt(which, t), C.run - 0.05, C.crash + 0.2);
    P.drag = add(P.drag, [wind, 0, 0]);
    P.dragHead = add(P.dragHead, [wind, 0, 0]);
  }
  const H = headFrame(P);
  if (which === 'stand') {
    const tt = fr(t / STAG_STAND.period) * STAG_STAND.period;
    const [s1, s2] = STAG_HABITS.stamps;
    P.chips = [...clods(STAG_FEET[0], s1, tt, 14, 91), ...clods(STAG_FEET[0], s2, tt, 10, 93)];
    const nose: [V3, V3] = [H.p([19.5, 1.2, -1.2]), H.p([19.5, -1.2, -1.2])];
    P.chips.push(...fog(nose, norm(add(H.f, [0, 0, -0.35])), STAG_HABITS.snort, tt, 95));
  } else if (which === 'attack') {
    const G = STAG_GORE;
    const nose: [V3, V3] = [H.p([19.5, 1.2, -1.2]), H.p([19.5, -1.2, -1.2])];
    P.chips = [...fog(nose, norm(add(H.f, [0, 0, -0.6])), 0.48, t, 97, 0.36)];
    // (its antlers rake the earth before it as they come up: clods and needles thrown forward)
    P.chips.push(...burst([52, 0, 0.6], 0.7, t, 26, 101, [...CLOD, '#6a5a3a'], { speed: 40, up: 46, ahead: [1.1, 0, 0], life: 0.6 }));
    // (the sweep of its antlers through the blow, a pale arc trailing their tips, held with the blow)
    if (t >= 0.74 && t < G.hit + G.freeze + 0.14) {
      const until = Math.min(t, G.hit);
      const fade = t > G.hit + G.freeze ? 1 - (t - G.hit - G.freeze) / 0.14 : 1;
      for (const sd of [1, -1]) {
        let last = antlerTip(basePose('attack', until), sd);
        for (let j = 1; j <= 14; j++) {
          const tj = until - j * 0.006;
          if (tj < 0.72) break;
          const q = antlerTip(basePose('attack', tj), sd);
          const steps = Math.max(1, Math.ceil(len(sub(q, last)) / 1.6));
          for (let m = 0; m < steps; m++) {
            if (hash(j * 31 + m, sd + 3, 5) > fade * (1 - j / 18)) continue;
            out(P, lerpV(last, q, m / steps), j < 5 ? ANTLER[4] : FOG[j < 9 ? 0 : 1], j < 6 ? 3 : 2);
          }
          last = q;
        }
      }
    }
    // (moss torn off its antlers by the throw)
    P.chips.push(...burst(antlerTip(P, 1), 1.04, t, 8, 103, [MOSS[3], MOSS[2], MOSS[4]], { speed: 20, up: 30, ahead: [-0.6, 0, 0], life: 0.45 }));
  } else if (which === 'charge') {
    const C = STAG_CHARGE;
    const nose: [V3, V3] = [H.p([19.5, 1.2, -1.2]), H.p([19.5, -1.2, -1.2])];
    P.chips = [...fog(nose, norm(add(H.f, [0, 0, -0.6])), 0.6, t, 105, 0.4), ...clods(STAG_FEET[0], 0.5, t, 10, 107), ...clods(STAG_FEET[0], 0.68, t, 10, 109)];
    // (earth kicked up behind it at each stride of the run)
    for (let k = 0; k < 3; k++) P.chips.push(...burst([-34, 0, 0.6], C.run + 0.02 + 0.3 * k, t, 12, 111 + k, CLOD, { speed: 26, up: 30, ahead: [-1.4, 0, 0], life: 0.3 }));
    // (THE CRASH: splinters of the pine, bark and needles burst from before its antlers, held with the blow, then flying)
    const hitAt: V3 = [58, 0, 52];
    const s = t < C.crash ? -1 : t < C.crash + C.freeze ? 0.02 : t - C.crash - C.freeze + 0.02;
    if (s >= 0) {
      P.chips.push(...burst(hitAt, 0, s, 70, 113, SPLINTER, { speed: 80, up: 56, ahead: [0.8, 0, 0], life: 0.8, spread: 1.15, size: 3 }), ...burst([60, 0, 34], 0, s, 30, 114, SPLINTER, { speed: 50, up: 30, ahead: [0.5, 0, 0], life: 0.7, size: 4 }));
      // (needles shaken down out of its crown, drifting down round the spot)
      if (s < 0.8) for (let i = 0; i < 46; i++) {
        if (hash(i, 9, 115) < s / 0.8) continue;
        const a = hash(i, 1, 115) * Math.PI * 2;
        const r = 6 + 34 * hash(i, 2, 115) * (0.4 + s);
        out(P, [64 + Math.cos(a) * r, Math.sin(a) * r, Math.max(0.6, 70 + 50 * hash(i, 3, 115) - 90 * s)], ['#4c6a34', '#3a5428', '#5e7a40', '#6a5a3a'][i % 4], 2);
      }
      // (a ring of dust kicked up round its braced forefeet)
      const k = s / 0.5;
      if (k < 1) for (let i = 0; i < 30; i++) {
        if (hash(i, 5, 116) < k * 0.9) continue;
        const a = (i / 30) * Math.PI * 2;
        const r = 8 + 40 * easeOut(k);
        out(P, [24 + Math.cos(a) * r, Math.sin(a) * r * 0.9, 1 + 3 * hash(i, 6, 116)], ['#9a8a70', '#b4a486', '#7e6e58'][i % 3], 3);
      }
    }
    // (the splinters shaken off its antlers as it tosses its head)
    P.chips.push(...burst(antlerTip(P, -1), 2.2, t, 8, 117, SPLINTER, { speed: 24, up: 26, life: 0.4, size: 2 }), ...burst(antlerTip(P, 1), 2.3, t, 8, 119, SPLINTER, { speed: 24, up: 26, life: 0.38, size: 2 }));
  } else if (which === 'roots') {
    const R = STAG_ROOTS;
    const s = t < R.slam ? -1 : t < R.slam + R.freeze ? 0.02 : t - R.slam - R.freeze + 0.02;
    if (s >= 0) {
      // (the earth bursting under its forefeet, a ring of dust rolling out)
      P.chips = [...burst(STAG_FEET[0], 0, s, 18, 121, CLOD, { speed: 36, up: 44, life: 0.55 }), ...burst(STAG_FEET[1], 0, s, 18, 123, CLOD, { speed: 36, up: 44, life: 0.55 })];
      const k = s / 0.6;
      if (k < 1) for (let i = 0; i < 40; i++) {
        if (hash(i, 5, 125) < k * 0.9) continue;
        const a = (i / 40) * Math.PI * 2;
        const r = 10 + 46 * easeOut(k);
        P.chips.push([[19 + Math.cos(a) * r, Math.sin(a) * r * 0.9, 1 + 3 * hash(i, 6, 125)], ['#9a8a70', '#b4a486', '#7e6e58'][i % 3], 2]);
      }
    }
  } else if (which === 'bellow') {
    P.chips = bellowFog(P, t);
  } else if (which === 'reel') {
    const R = STAG_REEL;
    P.chips = burst(worldOf(P, [-2, 0, 58]), R.freeze, t, 18, 127, FLAKES, { speed: 34, up: 36, life: R.long - R.freeze - 0.02 });
  } else if (which === 'dying') {
    const Dd = STAG_DIE;
    P.chips = [...burst(STAG_FEET[0], Dd.roots, t, 12, 131, CLOD, { speed: 30, up: 40 }), ...burst(STAG_FEET[3], Dd.roots + 0.05, t, 12, 133, CLOD, { speed: 30, up: 40 }), ...burst([-4, 0, 0.6], Dd.sink, t, 26, 135, CLOD, { speed: 40, up: 46, life: 0.6 }), ...burst(worldOf(P, [-2, 0, 58]), 0, t - Dd.freeze + 0.0001, 14, 137, FLAKES, { speed: 30, up: 30, life: 0.4 })];
  }
  void view;
  return P;
}
/** A grain laid at `p` (to the list of what its pose throws off). */
function out(P: StagPose, p: V3, col: string, size: number): void {
  P.chips.push([[p[0], p[1], Math.max(0.6, p[2])], col, size]);
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
function strand(put: Put, part: string, piece: string, a: V3, long: number, r0: number, r1: number, ramp: Ramp, drag0: V3, sway: V3, n = 4): void {
  // (however fast it moves, what hangs from it swings out so far and no further: a share of its length)
  const most = 0.42 * long;
  const dl = len(drag0) * 1.6;
  const drag = dl > most ? mul(drag0, most / dl) : drag0;
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
  // (its jaw, hinged under its skull, dropping open as it bellows; the dark of its mouth inside)
  const jawTip = add([3, 0, -3.4], turn([13.5, 0, -0.2], 0, 34 * P.jaw, 0));
  put('jaw', 'jaw', { k: 'rod', a: H.p([3, 0, -3.4]), b: H.p(jawTip), ra: 2.8, rb: 1.6, ramp: HIDE });
  if (P.jaw > 0.08) put('jaw', 'mouth', { k: 'ball', c: H.p([9.5, 0, -2.6 - 2.6 * P.jaw]), ax: [mul(H.f, 6.5), mul(H.l, 1.9), mul(H.u, 1.2 + 2.2 * P.jaw)], skin: HOLLOW });
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

  // ITS DEATH: roots up out of the earth, climbing its legs and arching over its back as it is dragged down; the earth
  // heaved round it
  if (P.grown > 0.01) {
    P.feet.forEach((foot, i) => {
      const top = W(LEG_TOP[i]);
      for (const k of [0, 1]) {
        const ang0 = hash(i, k, 141) * Math.PI * 2;
        const base: V3 = [foot[0] + Math.cos(ang0) * 4, foot[1] + Math.sin(ang0) * 4, 0];
        const high = Math.min(34 * P.grown * (0.75 + 0.35 * hash(i, k + 2, 141)), top[2] - 6);
        if (high < 1.5) continue;
        const n = 6;
        let last = base;
        for (let j = 1; j <= n; j++) {
          const z = (high * j) / n;
          const c = lerpV(foot, top, cl01((z - foot[2]) / Math.max(1, top[2] - foot[2])));
          const a = ang0 + (j / n) * Math.PI * 3 * (k ? 1 : -1);
          const q: V3 = [c[0] + Math.cos(a) * 3.4, c[1] + Math.sin(a) * 3.4, z];
          put(`rootleg${i}_${k}`, `rootleg${i}_${k}_${j}`, { k: 'rod', a: last, b: q, ra: 2.0 - (1.4 * j) / n, rb: 1.9 - (1.4 * (j + 1)) / n, ramp: ROOT });
          last = q;
        }
      }
    });
    const over = cl01((P.grown - 0.35) / 0.65);
    if (over > 0.02) {
      for (const [x0, j] of [[10, 0], [-8, 1], [-24, 2]] as const) {
        const T = W([x0, 0, 67]);
        for (const sd of [1, -1]) {
          const G: V3 = [x0 + 4 * sd, sd * 27, 0];
          const C: V3 = [G[0], sd * 22, T[2] + 8];
          let last = G;
          for (let k = 1; k <= 6; k++) {
            const u = (k / 6) * over;
            const q: V3 = [(1 - u) * (1 - u) * G[0] + 2 * u * (1 - u) * C[0] + u * u * T[0], (1 - u) * (1 - u) * G[1] + 2 * u * (1 - u) * C[1] + u * u * T[1], (1 - u) * (1 - u) * G[2] + 2 * u * (1 - u) * C[2] + u * u * T[2]];
            put(`rootover${j}_${sd}`, `rootover${j}_${sd}_${k}`, { k: 'rod', a: last, b: q, ra: 2.0 - 0.18 * k, rb: 1.82 - 0.18 * k, ramp: ROOT });
            last = q;
          }
        }
      }
    }
  }
  if (P.earth > 0.02) {
    const e = P.earth;
    const earth: Skin = (u, tone) => (fr(u[0] * 4.5 + u[1] * 2.6 + 0.3 * Math.sin(u[1] * 9)) < 0.13 ? ROOT[Math.max(1, Math.min(3, tone))] : EARTH[Math.max(0, Math.min(4, tone - (patch(u, 4, 143) > 0.6 ? 1 : 0)))]);
    put('earth', 'mound', { k: 'ball', c: [-4, 0, 0.4], ax: [[42 * e, 0, 0], [0, 24 * e, 0], [0, 0, 3.4 * e]], skin: earth });
    // (clods of the torn earth heaped round its rim, and the roots coiled over it)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3 * hash(i, 1, 145);
      const r = 0.82 + 0.16 * hash(i, 2, 145);
      const sz = (2.4 + 2.2 * hash(i, 3, 145)) * e;
      put('earth', `lump${i}`, { k: 'ball', c: [-4 + Math.cos(a) * 42 * e * r, Math.sin(a) * 24 * e * r, 1.4 * e], ax: [[sz * 1.3, 0, 0], [0, sz, 0], [0, 0, sz * 0.8]], skin: EARTH });
    }
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.7;
      const A: V3 = [-4 + Math.cos(a) * 30 * e, Math.sin(a) * 15 * e, 0];
      const B: V3 = [-4 + Math.cos(a + 0.9) * 26 * e, Math.sin(a + 0.9) * 13 * e, 0];
      const M: V3 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 7 * e];
      put(`coil${i}`, `coil${i}a`, { k: 'rod', a: A, b: M, ra: 1.8, rb: 1.5, ramp: ROOT });
      put(`coil${i}`, `coil${i}b`, { k: 'rod', a: M, b: B, ra: 1.5, rb: 1.1, ramp: ROOT });
    }
  }

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
  const st0 = stage(view, STAG_CANVAS.ax, STAG_CANVAS.ay, STAG_CANVAS);
  // (each part's sheet kept, so that what of it is below the floor can be taken away as the floor swallows it)
  const sheets: Sheet[] = [];
  const st: Stage = { ...st0, part: (where) => { const sh = st0.part(where); sheets.push(sh); return sh; } };
  const bits: Bit[] = [];
  stagBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, view);
  const lights = paintBits(st, bits, worldOf(P, PIVOT));
  if (P.swallowed) for (const sh of sheets) swallow(sh, st0);
  for (const [p, r, a] of P.flares) {
    const [x, y] = st.at(p);
    lights.push({ x, y, r, color: FLAME[3], a });
  }
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}
/** The floor swallows it: every pixel of a part whose skin there is below the floor is taken away. */
function swallow(sh: Sheet, st: Stage): void {
  const b = st.back;
  for (let y = 0; y < sh.h; y++) {
    for (let x = 0; x < sh.w; x++) {
      if (!sh.has(x, y)) continue;
      const k = y * sh.w + x;
      const n = sh.z[k] !== sh.z[k] ? sh.near : sh.z[k];
      const sx = x + 0.5 - STAG_CANVAS.ax;
      const sy = y + 0.5 - STAG_CANVAS.ay;
      const z = b[2][0] * sx + b[2][1] * sy + b[2][2] * n;
      if (z < 0) {
        sh.erase(x, y);
        sh.z[k] = NaN;
      }
    }
  }
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

// ---------------------------------------------------------------------------------------------
// ITS ROOTS' BURSTS, laid by the game along its lines

/** One burst of its roots, from where it bursts: a crack in the earth glowing the enemy's pink burning to gold before it (the warning, `warn` seconds), then roots shooting up out of it (`up`), writhing (to `hold`), and sinking back (by `gone`). */
export const ROOT_BURST = { warn: 0.25, up: 0.1, hold: 0.45, gone: 0.8 } as const;
/** The canvas a burst is painted on, and its floor point on it. */
export const ROOT_CANVAS = { w: 140, h: 130, ax: 70, ay: 98 };
/** When a burst of its roots comes, `d` tiles out along one of its lines, from the start of its roots move. */
export function stagRootTime(d: number): number {
  return STAG_ROOTS.slam + STAG_ROOTS.freeze + d / STAG_ROOTS.speed;
}
/** A burst of roots `t` seconds from its bursting (negative: its crack, the warning), from in front or behind; `seed` makes each its own. */
export function rootBurstPainted(t: number, view: GameView = 'front', seed = 0): Painted {
  const B = ROOT_BURST;
  const st = stage(view, ROOT_CANVAS.ax, ROOT_CANVAS.ay, ROOT_CANVAS);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const chips: [V3, string, number][] = [];
  const lights: { x: number; y: number; r: number; color: string; a: number }[] = [];
  // (the crack: a jagged line across the earth, glowing, before the roots and as they burst)
  if (t >= -B.warn && t < B.up + 0.15) {
    const k = t < 0 ? (t + B.warn) / B.warn : 1 - (t - 0) / (B.up + 0.15);
    const ang = hash(seed, 1, 151) * Math.PI;
    for (let i = -9; i <= 9; i++) {
      const jag = 2.2 * (hash(seed, i + 20, 153) - 0.5);
      const p: V3 = [Math.cos(ang) * i * 1.3 - Math.sin(ang) * jag, Math.sin(ang) * i * 1.3 + Math.cos(ang) * jag, 0.6];
      if (Math.abs(i) <= 9 * Math.min(1, k * 1.6)) chips.push([p, Math.abs(i) < 4 * k ? FLAME[3] : FLAME[2], 2]);
    }
    const [x, y] = st.at([0, 0, 0]);
    lights.push({ x, y, r: 18 + 10 * k, color: FLAME[3], a: 0.3 * k });
  }
  // (its roots: shooting up, writhing, sinking back into the earth)
  if (t >= 0 && t < B.gone) {
    const rise = t < B.up ? easeOut(t / B.up) : t < B.hold ? 1 : 1 - sm((t - B.hold) / (B.gone - B.hold));
    for (let r = 0; r < 5; r++) {
      const a0 = (r / 5) * Math.PI * 2 + hash(seed, r, 155) * 0.9;
      const rad = 2.5 + 3 * hash(seed, r, 157);
      const tall = (16 + 12 * hash(seed, r, 159)) * rise * (r === 0 ? 1.35 : 1);
      const lean = 0.35 + 0.4 * hash(seed, r, 161);
      let last: V3 = [Math.cos(a0) * rad, Math.sin(a0) * rad, 0];
      const n = 6;
      for (let j = 1; j <= n; j++) {
        const k = j / n;
        const writhe = 2.2 * Math.sin(t * 18 + r * 1.7 + k * 4) * k * (t < B.hold ? 1 : 0.5);
        const q: V3 = [Math.cos(a0) * (rad + lean * tall * k * k) + writhe * -Math.sin(a0), Math.sin(a0) * (rad + lean * tall * k * k) + writhe * Math.cos(a0), tall * k];
        put(`root${r}`, `root${r}_${j}`, { k: 'rod', a: last, b: q, ra: 2.6 * (1 - 0.8 * (k - 1 / n)), rb: 2.6 * (1 - 0.8 * k) + 0.2, ramp: ROOT });
        last = q;
      }
    }
    for (const c of burst([0, 0, 0.6], 0, t, 16, 163 + seed, CLOD, { speed: 26, up: 40, life: 0.45 })) chips.push(c);
  }
  paintBits(st, bits, [0, 0, 10]);
  const px = st.whole(bits.length ? ENEMY_RIM : null);
  for (const [pt, col, size] of chips) laid(px, st, pt, col, size);
  return { px, lights };
}

// ---------------------------------------------------------------------------------------------
// AS THE GAME HOLDS A MONSTER'S PICTURES

/** THE STAG, as the game holds a monster's pictures: its stand, its walk, its antler gore (`attack`), its charge, its roots and its bellow (`clips.moves`), struck, and its death. */
export function makeStagArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => stagFrame(which, t, view);
    const clip = (which: string, long: number, fps: number, hit?: number): Clip => {
      const c: Clip = { frames: lazyFrames(Math.round(long * fps) + 1, (i) => frame(which, i / fps)), fps };
      if (hit !== undefined) c.hit = hit;
      return c;
    };
    const attack = clip('attack', STAG_GORE.long, STAG_GORE.fps, STAG_GORE.hit);
    return {
      idle: lazyFrames(STAG_STAND.frames, (i) => frame('stand', i / STAG_STAND.fps)),
      walk: lazyFrames(STAG_WALK.frames, (i) => frame('walk', i / STAG_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[12, 22, 27][i]]),
      idleFps: STAG_STAND.fps,
      walkFps: STAG_WALK.fps,
      clips: {
        attack,
        die: clip('dying', STAG_DIE.long, STAG_DIE.fps),
        reel: clip('reel', STAG_REEL.long, STAG_REEL.fps),
        moves: { charge: clip('charge', STAG_CHARGE.long, STAG_CHARGE.fps, STAG_CHARGE.crash), roots: clip('roots', STAG_ROOTS.long, STAG_ROOTS.fps, STAG_ROOTS.slam), bellow: clip('bellow', STAG_BELLOW.long, STAG_BELLOW.fps, STAG_BELLOW.roar) },
      },
    };
  };
  return { front: set('front'), back: set('back') };
}
