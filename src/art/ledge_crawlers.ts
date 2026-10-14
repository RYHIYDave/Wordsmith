// FLOOR 7'S MEDIUM MOBS, THE CLIFF CRAWLERS OF THE LEDGE ROAD: a mock-up (nothing of the game imports this file;
// `CRAWLER_ON` is off).
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (14 Oct, each his pick, the labels as he
// tapped them): what it is, and where it lives, “Low, many-legged beast on the cliff face (Recommended)”; how big, and
// how it should feel, “Waist-high and wide, fun to smash (Recommended)”; how it moves, “Wild and skittering, never
// still” (not the recommended pick); the one thing to know it by, “Its many legs, splayed low on the rock
// (Recommended)”; what it carries, and how it attacks, “Nothing it carries; a claw swipe, then a leap onto you
// (Recommended)”; how it dies, “It curls up, and its shell cracks open” (not the recommended pick); what it must never
// look like, “Not a cute or friendly creature (Recommended)”; its sound (sound rule 7), “Clicking, scraping claws on
// stone (Recommended)”.
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its eyes and its edge are the enemy's pink while it
// lives, and nothing cyan; wild, with no cult mark, no chain and no cult colour; six legs; a medium monster, with two
// attacks (the claw swipe is its basic blow, the leap its one big move); no blood (a monster's own shell chips, as the
// rulebook's Hits 4 asks, and nothing else flies off it).
//
// NOT ON THE HEROES' BONES: six legs have no place on them, so it is painted from its own solids, as the Quarry's
// rubbling is (art/floor6_mobs.ts), frame by frame, in the same painter (art/new_mobs3.ts's paintBits). Shown to him
// first, as Monsters 8 asks of a monster that is not on the bones.
//
// ITS MOVES, checked against docs/art/RULEBOOK.md before he sees them: the stand at ten frames a second and never
// still (its knees flex and its jaws click, its feet staying where they are: Movement 8); the walk a tripod, sixteen
// frames a second, each foot down staying on one spot of the floor while it is down; the claw swipe, thirty a second,
// wound up and followed through (Movement 3); the leap, thirty a second: the crouch held as the warning (Animations 4),
// the spring, the landing with its freeze of a tenth of a second (Movement 7) and its sink (Movement 1), and the
// springing back to where it stood; the flinch (Hits 3), its feet on the rock all the while; and the death, thirty a second:
// its shell cracks open (Hits 5, Hits 2), its legs tuck in under it (each foot lifts only to move, and comes down where
// it lands), its eyes go out by 0.5 s, and it lies still from 0.8 s. Nothing of it is ever below the rock (Movement 1).

import type { Px, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { TILE3, paintBits, sphere } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const CRAWLER_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
const fr = (t: number): number => t - Math.floor(t);
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: the stone's, dull and dusty; the enemy's pink and gold only for its eyes (FLAME).

const SHELL: Ramp = ['#15171a', '#15171a', '#33363b', '#4d5157', '#687078'];
const LEG: Ramp = ['#0f1012', '#0f1012', '#25282c', '#3d4248', '#55595f'];
const CLAW: Ramp = ['#2b2620', '#2b2620', '#6e6456', '#9a8e7c', '#bfb4a2'];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high; its waist is about 30 up). x forward, y left, z up.

/** Its middle's height above the floor, at rest. Its top then is about 29: waist-high to the knight. */
const BODY_Z = 19;
/** Its legs: where each comes out of its body (relative to its middle, at rest), front pair first, then middle, then rear. */
const HIP_OFF: V3[] = [
  [10, 16, -2],
  [10, -16, -2],
  [0, 18, -2],
  [0, -18, -2],
  [-10, 16, -2],
  [-10, -16, -2],
];
/** Its feet at rest, on the floor: splayed low on the rock, each straight out from its hip. */
const REST: V3[] = [
  [10, 50, 0],
  [10, -50, 0],
  [0, 52, 0],
  [0, -52, 0],
  [-10, 50, 0],
  [-10, -50, 0],
];
/** The middle of a leg's joint at rest, and the knee's height over it. */
const KNEE_UP = 7;
const KNEE_OUT = 8;
/** The lowest its head's middle may go: its head rests on the rock and never sinks into it (its jaws reach a little lower). */
const HEAD_FLOOR = 6;

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds), each checked against the rulebook's numbers.

/** Its stand: ten frames a second, a loop of 1.2 s (`CR_STAND.frames` frames). */
export const CR_STAND = { frames: 12, fps: 10, period: 1.2 } as const;
/** Its walk: a tripod, sixteen frames a second, one cycle of 0.5 s (eight frames). */
export const CR_WALK = { frames: 8, fps: 16, period: 0.5 } as const;
/** How fast it goes (tiles a second): its walk is painted for it, so each foot down stays on its spot. */
export const CR_PACE = 1.4;
/** Its basic blow: the claw swipe. Wound up, the warning held, the blow at `hit`, followed through. */
export const CR_SWIPE = { long: 0.9, warn: 0.22, hit: 0.38, fps: 30 } as const;
/** Its big move: the leap onto you. The crouch (the warning) to `warn`; the blow lands at `hit` and freezes a tenth. */
export const CR_LEAP = { long: 1.3, warn: 0.35, hit: 0.72, freeze: 0.1, fps: 30 } as const;
/** Struck: the freeze, the knock, back on its feet by `long`. */
export const CR_REEL = { long: 0.3, freeze: 0.1, fps: 30 } as const;
/** Its death: the freeze, the buckle, the shell cracks open, its eyes out by 0.5 s, still from 0.8 s. */
export const CR_DIE = { long: 1.0, freeze: 0.1, still: 0.8, eyesOut: 0.5, fps: 30 } as const;
/** Where its leap lands, forward of where it stood (picture units). */
export const CR_LEAP_X = 24;

/** The canvas it is painted on, and the point on it where its floor is. */
export const CR_CANVAS = { w: 176, h: 136, ax: 88, ay: 86 };
/** Its pool of light while it lives (the enemy's pink, faint). */
const CR_AURA = { x: CR_CANVAS.ax, y: CR_CANVAS.ay - 6, r: 34, color: '#ff3a78', a: 0.08 };

// ---------------------------------------------------------------------------------------------
// ITS POSES.

/** One moment of it: where its middle is, how it is tipped and crouched, where each foot is, its jaws and eyes. */
interface CrPose {
  /** Its middle, forward (x) and up (z) from its floor point; and its yaw and pitch (nose down, radians). */
  x: number;
  z: number;
  yaw: number;
  pitch: number;
  /** 0 standing; 1 crouched and flat. */
  squash: number;
  /** Each foot's place, in its floor's frame (on the floor when z is 0). */
  feet: V3[];
  /** Each leg's knee, lifted and spread beyond its middle. */
  kneeUp: number[];
  kneeOut: number;
  /** Its jaws (0 shut, 1 wide) and its eyes (0 out, 1 burning). */
  mouth: number;
  eyes: number;
  /** How far its shell has cracked (0 whole, 1 open). */
  crack: number;
  /** Still living: its pink edge is painted round it. */
  alive: boolean;
  /** Its flakes of shell in the air or on the floor: each its place, colour and size. */
  chips: [V3, string, number][];
}

/** A foot as the walk puts it: `ph` the phase in the cycle (0 to 1). Down for the first half, its body gone over it; swung through the air for the second. */
const HALF = (CR_PACE * TILE3 * CR_WALK.period) / 2;
const LIFT = 5.5;
/** The tripods: legs 0, 3 and 4 together, then 1, 2 and 5, half a cycle behind. */
const OFF = [0, 0.5, 0.5, 0, 0, 0.5];
function stepFoot(i: number, u: number): V3 {
  const r = REST[i];
  if (u < 0.5) return [r[0] + HALF * (0.5 - 2 * u), r[1], 0];
  const v = (u - 0.5) * 2;
  return [r[0] + HALF * (-0.5 + sm(v)), r[1], LIFT * Math.sin(Math.PI * v)];
}

/** Its flakes of shell: thrown out from `origin` at `t0`, falling, and gone `life` seconds after the blow (as the vulture's feathers are). */
function flakes(origin: V3, t0: number, t: number, n: number, seed: number, speed: number, up: number, life = 0.5): [V3, string, number][] {
  const s = t - t0;
  if (s < 0 || s >= life - 1e-9) return [];
  const out: [V3, string, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = hash(i, 1, seed) * Math.PI * 2;
    const v = speed * (0.6 + 0.8 * hash(i, 2, seed));
    const sl = Math.min(s, life);
    const sh = Math.min(s, 0.25);
    const z = Math.max(0.6, origin[2] + up * (0.5 + hash(i, 3, seed)) * sl - 150 * sl * sl);
    out.push([[origin[0] + Math.cos(a) * v * sh, origin[1] + Math.sin(a) * v * sh, z], i % 3 ? SHELL[3] : CLAW[3], i % 4 ? 2 : 3]);
  }
  return out;
}

/** The stand: its knees flex one after another, its jaws click twice a round, its eyes flicker, its head sways. Its feet do not move. */
function standPose(t: number): CrPose {
  const a = (Math.PI * 2 * t) / CR_STAND.period;
  return {
    x: 0,
    z: BODY_Z + 0.6 * Math.sin(a),
    yaw: 0.07 * Math.sin(a),
    pitch: 0,
    squash: 0,
    feet: REST.map((r) => r),
    kneeUp: REST.map((_, i) => KNEE_UP + 2.2 * Math.sin(a + i * 1.05)),
    kneeOut: KNEE_OUT,
    mouth: 0.2 + 0.2 * Math.max(0, Math.sin(2 * a)),
    eyes: 0.9 + 0.12 * Math.sin(3 * a),
    crack: 0,
    alive: true,
    chips: [],
  };
}

/** The walk: a tripod, its middle bobbing twice a cycle, its head swaying with the stride. */
function walkPose(t: number): CrPose {
  const ph = fr(t / CR_WALK.period);
  const feet = REST.map((_, i) => stepFoot(i, fr(ph + OFF[i])));
  return {
    x: 0,
    z: BODY_Z + 1.0 * Math.abs(Math.sin(Math.PI * 2 * ph)),
    yaw: 0.04 * Math.sin(Math.PI * 2 * ph),
    pitch: 0,
    squash: 0,
    feet,
    kneeUp: feet.map((f) => KNEE_UP + 0.6 * f[2]),
    kneeOut: KNEE_OUT,
    mouth: 0.2,
    eyes: 0.9,
    crack: 0,
    alive: true,
    chips: [],
  };
}

/** The claw swipe, its basic blow: the front-left claw cocked up and back (the warning, held), swept through the hero, followed through, and planted where it was. */
function swipePose(t: number): CrPose {
  const P = standPose(0);
  const R0 = REST[0];
  const C: V3 = [R0[0] - 9, R0[1] + 12, 18];
  const F: V3 = [R0[0] + 30, R0[1] - 18, 4];
  const G: V3 = [R0[0] + 34, R0[1] - 30, 12];
  const shake = (k: number): number => 0.5 * Math.sin(t * 190 + k);
  if (t < CR_SWIPE.warn) {
    const s = sm(t / CR_SWIPE.warn);
    P.feet[0] = lerpV(R0, C, s);
    P.z = BODY_Z + 1.5 * s;
    P.pitch = -0.12 * s;
    P.mouth = 0.2 + 0.4 * s;
    P.eyes = 0.9 + 0.5 * s;
  } else if (t < 0.3) {
    P.feet[0] = [C[0] + shake(1), C[1] + shake(2), C[2] + shake(3)];
    P.z = BODY_Z + 1.5;
    P.pitch = -0.12;
    P.mouth = 0.6;
    P.eyes = 1.4;
  } else if (t < CR_SWIPE.hit) {
    const s = sm((t - 0.3) / 0.08);
    P.feet[0] = lerpV(C, F, s);
    P.z = BODY_Z + 1.5 - 1.5 * s;
    P.pitch = -0.12 + 0.12 * s;
    P.mouth = 0.6 - 0.2 * s;
    P.eyes = 1.4;
  } else if (t < 0.5) {
    const s = sm((t - CR_SWIPE.hit) / 0.12);
    P.feet[0] = lerpV(F, G, s);
    P.pitch = 0.1 * s;
    P.yaw = -0.12 * s;
    P.mouth = 0.4 - 0.2 * s;
    P.eyes = 1.2 - 0.3 * s;
  } else if (t < 0.85) {
    const s = sm((t - 0.5) / 0.35);
    const f = lerpV(G, R0, s);
    P.feet[0] = [f[0], f[1], f[2] + 10 * Math.sin(Math.PI * s)];
    P.pitch = 0.1 * (1 - s);
    P.yaw = -0.12 * (1 - s);
  }
  P.chips = flakes(F, CR_SWIPE.hit, t, 6, 11, 40, 14);
  return P;
}

/** The leap, its big move: the crouch (the warning), the spring over the hero, the landing (frozen a tenth), the sink, and the hop back to where it stood. */
function leapPose(t: number): CrPose {
  const LX = CR_LEAP_X;
  const landing = REST.map((r) => [LX + r[0] * 1.08, r[1] * 1.08, 0] as V3);
  // (the freeze: the blow holds for a tenth of a second, so every frame of it is the same)
  const tt = t >= CR_LEAP.hit && t < CR_LEAP.hit + CR_LEAP.freeze ? CR_LEAP.hit : t;
  const stand = standPose(0);
  let P: CrPose;
  if (tt < 0.23) {
    const c = sm(tt / 0.23);
    P = { ...stand, z: BODY_Z - 9 * c, squash: c, pitch: 0.22 * c, kneeUp: REST.map(() => KNEE_UP + 8 * c), kneeOut: KNEE_OUT + 6 * c, mouth: 0.2 + 0.8 * c, eyes: 0.9 + 0.7 * c };
  } else if (tt < CR_LEAP.warn) {
    P = { ...stand, z: BODY_Z - 9 + 0.5 * Math.sin(tt * 200), squash: 1, pitch: 0.22, kneeUp: REST.map(() => KNEE_UP + 8), kneeOut: KNEE_OUT + 6, mouth: 1, eyes: 1.6 };
  } else if (tt < CR_LEAP.hit) {
    const s = (tt - CR_LEAP.warn) / (CR_LEAP.hit - CR_LEAP.warn);
    const g = sm(s);
    P = {
      ...stand,
      x: LX * g,
      z: 10 + 2 * s + 28 * 4 * s * (1 - s),
      squash: 0.3 * (1 - s),
      pitch: 0.12,
      kneeUp: REST.map(() => KNEE_UP + 4),
      kneeOut: KNEE_OUT + 4,
      mouth: 1,
      eyes: 1.6,
      feet: REST.map((r, i): V3 => {
        const f = lerpV(r, landing[i], g);
        return [f[0], f[1], f[2] + 16 * Math.sin(Math.PI * s)];
      }),
    };
  } else if (tt < CR_LEAP.hit + CR_LEAP.freeze) {
    P = { ...stand, x: LX, z: 12, squash: 0.6, pitch: 0.1, kneeUp: REST.map(() => KNEE_UP + 4), kneeOut: KNEE_OUT + 4, mouth: 1, eyes: 1.6, feet: landing };
  } else if (t < 0.95) {
    // (its landing sinks: the middle drops onto its feet, which stay where they came down)
    const s = sm((t - 0.82) / 0.13);
    P = { ...stand, x: LX, z: 12 - 3.5 * s, squash: 0.6 + 0.4 * s, pitch: 0.1 * (1 - s), kneeUp: REST.map(() => KNEE_UP + 4 - 6 * s), kneeOut: KNEE_OUT + 4, mouth: 1 - 0.5 * s, eyes: 1.6 - 0.6 * s, feet: landing };
  } else {
    // (the hop back: all its feet lift and swing to where they stood, its middle with them; it lands there)
    const s = cl01((t - 0.95) / 0.35);
    const g = sm(s);
    P = {
      ...stand,
      x: LX * (1 - g),
      z: 8.5 + (BODY_Z - 8.5) * g + 8 * Math.sin(Math.PI * s),
      squash: 1 - g,
      pitch: 0.1 * (1 - g),
      kneeUp: REST.map((_, i) => (KNEE_UP + 4 - 6) * (1 - g) + stand.kneeUp[i] * g),
      kneeOut: KNEE_OUT + 4 * (1 - g),
      mouth: 0.5 - 0.3 * g,
      eyes: 1 - 0.1 * g,
      feet: REST.map((r, i): V3 => {
        const f = lerpV(landing[i], r, g);
        return [f[0], f[1], f[2] + 14 * Math.sin(Math.PI * s)];
      }),
    };
  }
  // (its shell flies off as it sinks, once the landing's freeze is over: nothing moves during the freeze)
  P.chips = t >= CR_LEAP.hit + CR_LEAP.freeze ? flakes([LX, 0, 0], CR_LEAP.hit + CR_LEAP.freeze, t, 6, 23, 45, 12) : [];
  return P;
}

/**
 * Struck: frozen a tenth, then knocked back on its heels and back on its feet by `long`. One smooth arc from the blow to its
 * end, so nothing jumps: the knock, the front pair kicking up and coming down where it stood (its feet never slide).
 */
function reelPose(t: number): CrPose {
  if (t < CR_REEL.freeze) return { ...standPose(0), eyes: 1.4 };
  const k = cl01((t - CR_REEL.freeze) / (CR_REEL.long - CR_REEL.freeze));
  const arc = Math.sin(Math.PI * k);
  return {
    ...standPose(0),
    x: -7 * arc,
    z: BODY_Z + 4 * arc,
    pitch: -0.25 * arc,
    mouth: 0.2 + 0.4 * arc,
    eyes: 1.4 - 0.5 * k,
    feet: REST.map((r, i): V3 => [r[0], r[1], (i < 2 ? 7 : 3) * arc]),
    chips: flakes([2, 0, 29], CR_REEL.freeze, t, 6, 31, 30, 14),
  };
}

/**
 * Its death: frozen a tenth as the blow lands; then it buckles and curls up, its shell cracks open and flakes fly, its legs
 * tuck in under it (each foot lifts off the rock, moves in, and comes down under its body), its head goes down on the rock,
 * and its eyes go out by 0.5 s. Its body is still from 0.8 s, and nothing of it is ever below the rock.
 */
function deathPose(t: number): CrPose {
  const b = sm((t - CR_DIE.freeze) / 0.45);
  const crack = sm((t - 0.3) / 0.2);
  const lift = cl01((t - CR_DIE.freeze) / 0.45);
  const tuck: V3[] = REST.map((r) => [r[0] * 0.45, r[1] * 0.3, 0] as V3);
  const eyes = t < CR_DIE.freeze ? 1.4 : 1.4 * (1 - sm((t - CR_DIE.freeze) / (CR_DIE.eyesOut - CR_DIE.freeze)));
  return {
    x: 0,
    z: BODY_Z - 11.4 * b,
    yaw: 0,
    pitch: 0.5 * b,
    squash: b,
    feet: REST.map((r, i): V3 => {
      const f = lerpV(r, tuck[i], sm(lift));
      return [f[0], f[1], f[2] + 9 * Math.sin(Math.PI * lift)];
    }),
    kneeUp: REST.map(() => KNEE_UP - 6 * b),
    kneeOut: KNEE_OUT + 3 * b,
    mouth: 0.2 * (1 - b),
    eyes,
    crack,
    alive: false,
    chips: flakes([2, 0, 14], 0.3, t, 8, 41, 36, 16),
  };
}

function poseOf(which: string, t: number): CrPose {
  if (which === 'stand') return standPose(t);
  if (which === 'walk') return walkPose(t);
  if (which === 'attack') return swipePose(t);
  if (which === 'leap') return leapPose(t);
  if (which === 'reel') return reelPose(t);
  return deathPose(t);
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER: its own solids, in the same painter as the rest.

/**
 * Its carapace: one long, low, plated back. Seams across it make its plates, a ridge runs down its middle, its rim is
 * darker, and when it cracks the crack runs along the back (dark, then its pale inside).
 */
function carapaceSkin(crack: number, seed: number): Skin {
  return (u, tone) => {
    if (crack > 0.02) {
      const jag = Math.abs(u[1] - 0.22 * Math.sin(3 * u[0] + seed));
      if (jag < 0.06 * crack) return crack > 0.6 ? CLAW[2] : '#0a0908';
    }
    const plate = Math.abs(fr(u[0] * 1.9 + 0.2) - 0.5) > 0.45;
    const rim = Math.abs(u[1]) > 0.72;
    const ridge = Math.abs(u[1]) < 0.09;
    let t = tone;
    if (ridge) t += 1;
    if (plate) t -= 1;
    if (rim) t -= 1;
    return SHELL[Math.max(0, Math.min(4, t))];
  };
}

/** THE CRAWLER AS SOLIDS: its three parts, its six legs, its jaws, its eyes. */
function crawlerBits(P: CrPose, put: Put): void {
  const bx = P.x;
  const bz = P.z;
  const sq = P.squash;
  // its body: one long, low carapace (its top about 29 up: waist-high to the knight), and a small head tucked under its front edge
  put('body', 'carapace', { k: 'ball', c: [1 + bx, 0, bz], ax: [[21, 0, 0], [0, 18 * (1 + 0.08 * sq), 0], [0, 0, 10 * (1 - 0.25 * sq)]], skin: carapaceSkin(P.crack, 1) });
  const HR: V3 = [7.5, 7.5, 5.5];
  const H: V3 = [20 + bx + 2 * P.pitch, 6 * P.yaw, Math.max(bz - 4 - 10 * P.pitch, HEAD_FLOOR)];
  put('head', 'head', { k: 'ball', c: H, ax: [[HR[0], 0, 0], [0, HR[1], 0], [0, 0, HR[2]]], skin: SHELL });
  // its jaws: two curved horns, pale at the tips, opening with `mouth`; held above the rock
  for (const side of [1, -1] as const) {
    const m = P.mouth;
    const base: V3 = [H[0] + 6.5, H[1] + side * 3.4, H[2] - 2.5];
    const tip: V3 = [H[0] + 10 + 2.5 * m, H[1] + side * (4.2 + 5.5 * m), H[2] - 3.5 - 1.2 * m];
    put('jaw', `jaw${side}`, { k: 'rod', a: base, b: tip, ra: 1.7, rb: 0.9, ramp: LEG });
    put('jaw', `tip${side}`, { k: 'ball', c: tip, ax: sphere(1.1), skin: CLAW });
  }
  // its six legs: a hip on its middle, a knee high and spread, a foot on the rock with a pale claw
  P.feet.forEach((foot, i) => {
    const hip: V3 = [bx + HIP_OFF[i][0], HIP_OFF[i][1], bz + HIP_OFF[i][2]];
    const side = Math.sign(HIP_OFF[i][1]);
    const mid = lerpV(hip, foot, 0.5);
    const knee: V3 = [mid[0], mid[1] + side * P.kneeOut, mid[2] + P.kneeUp[i]];
    // (the shin ends at the rock with its own thickness, and the claw sits on it: nothing of a foot goes below the rock)
    const toe: V3 = [foot[0], foot[1], foot[2] + 1.3];
    put(`leg${i}`, `thigh${i}`, { k: 'rod', a: hip, b: knee, ra: 3.0, rb: 2.4, ramp: LEG });
    put(`leg${i}`, `shin${i}`, { k: 'rod', a: knee, b: toe, ra: 2.4, rb: 1.3, ramp: LEG });
    put(`leg${i}`, `knee${i}`, { k: 'ball', c: knee, ax: sphere(2.7), skin: LEG });
    put(`leg${i}`, `claw${i}`, { k: 'ball', c: [foot[0], foot[1], foot[2] + 1.6], ax: sphere(1.6), skin: CLAW });
  });
  // its eyes: four on the front of its head, the enemy's pink burning to gold (none once they are out)
  const eyeDirs: V3[] = [
    [0.9, 0.38, 0.22],
    [0.9, -0.38, 0.22],
    [0.8, 0.22, 0.55],
    [0.8, -0.22, 0.55],
  ];
  if (P.eyes > 0.3) {
    eyeDirs.forEach((d0, i) => {
      const d = [d0[0] / 0.95, d0[1] / 0.95, d0[2] / 0.95] as V3;
      const at: V3 = [H[0] + HR[0] * d0[0] * 0.95, H[1] + HR[1] * d0[1] * 0.95, H[2] + HR[2] * d0[2] * 0.95];
      put('head', `eye${i}`, { k: 'dot', p: at, c: FLAME[2], facing: [d[0] / HR[0], d[1] / HR[1], d[2] / HR[2]], c2: FLAME[3] });
      put('head', `eyeLight${i}`, { k: 'glow', p: at, c: FLAME[2], r: 5 + 7 * Math.min(1.6, P.eyes), a: Math.min(0.7, 0.25 + 0.3 * P.eyes) });
    });
  }
}

/** A grain of its shell laid on a finished picture (after its pink edge, so that it stays its own colour). */
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - 0.5);
  const yi = Math.round(y - 0.5);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}

/** One frame of the crawler: `which` (stand, walk, attack, leap, reel, dying), `t` seconds in, from in front or behind. */
export function crawlerPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, CR_CANVAS.ax, CR_CANVAS.ay, CR_CANVAS);
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  crawlerBits(P, put);
  const lights = paintBits(st, bits, [P.x, 0, P.z]);
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  for (const [pt, col, size] of P.chips) laid(px, st, pt, col, size);
  return { px, lights };
}

/** The same frame as the game holds a figure (its pool of light behind it while it lives). */
export function crawlerFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(crawlerPainted(which, t, view), which === 'dying' ? null : CR_AURA, CR_CANVAS.ax, CR_CANVAS.ay);
}

/** THE CRAWLER, as the game holds a monster's pictures: its stand, its walk, its claw swipe (`attack`), its leap (`clips.moves.leap`), its flinch and its death. */
export function makeCrawlerArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => crawlerFrame(which, t, view);
    const attack: Clip = { frames: lazyFrames(Math.round(CR_SWIPE.long * CR_SWIPE.fps) + 1, (i) => frame('attack', i / CR_SWIPE.fps)), fps: CR_SWIPE.fps, hit: CR_SWIPE.hit };
    const leap: Clip = { frames: lazyFrames(Math.round(CR_LEAP.long * CR_LEAP.fps) + 1, (i) => frame('leap', i / CR_LEAP.fps)), fps: CR_LEAP.fps, hit: CR_LEAP.hit };
    const die: Clip = { frames: lazyFrames(Math.round(CR_DIE.long * CR_DIE.fps) + 1, (i) => frame('dying', i / CR_DIE.fps)), fps: CR_DIE.fps };
    const reel: Clip = { frames: lazyFrames(Math.round(CR_REEL.long * CR_REEL.fps) + 1, (i) => frame('reel', i / CR_REEL.fps)), fps: CR_REEL.fps };
    return {
      idle: lazyFrames(CR_STAND.frames, (i) => frame('stand', i / CR_STAND.fps)),
      walk: lazyFrames(CR_WALK.frames, (i) => frame('walk', i / CR_WALK.fps)),
      attack: lazyFrames(3, (i) => attack.frames[[8, 11, 18][i]]),
      idleFps: CR_STAND.fps,
      walkFps: CR_WALK.fps,
      clips: { attack, die, reel, moves: { leap } },
    };
  };
  return { front: set('front'), back: set('back') };
}

/** How many flakes of its shell are in the air at one moment (for the tests). */
export function crawlerChipCount(which: string, t: number): number {
  return poseOf(which, t).chips.length;
}

/** Every solid of one moment of it, as the tests read them: each part, its piece, and its shape. */
export function crawlerSolids(which: string, t: number): Bit[] {
  const bits: Bit[] = [];
  crawlerBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  return bits;
}

/** The standing picture (its first frame), as the sheet shows it. */
export function crawlerStanding(view: GameView = 'front'): Sprite {
  return crawlerFrame('stand', 0, view);
}

