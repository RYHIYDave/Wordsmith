// How the 3D figures move: a pose for every instant of what the rules say a hero or a monster is
// doing (standing, walking, how far into which attack). A pose is the angle of each joint
// (figures.ts); everything here is a few key poses and the passage from one to the next.
//
// An attack is three poses and a clock, the same clock the pixel figures keep (render/figure.ts):
// it winds up for as long as the rules say (the blow lands, the arrow leaves, when the wind-up is
// over), snaps to the blow, and comes back to rest over what the rules leave it of follow-through.

import type { Pose } from './figures';

type Three = readonly [number, number, number];
type Two = readonly [number, number];

const REST_ARM: Three = [0, 8, 6];
const part = (v: boolean | number | undefined): number => (typeof v === 'number' ? v : v ? 1 : 0);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const lerp3 = (a: Three | undefined, b: Three | undefined, t: number): Three => {
  const p = a ?? REST_ARM;
  const q = b ?? REST_ARM;
  return [lerp(p[0], q[0], t), lerp(p[1], q[1], t), lerp(p[2], q[2], t)];
};
const lerp2 = (a: Two | undefined, b: Two | undefined, t: number): Two => {
  const p = a ?? [0, 0];
  const q = b ?? [0, 0];
  return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
};

/** The pose `t` of the way from one to another (0..1). */
export function mix(a: Pose, b: Pose, t: number): Pose {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return {
    lean: lerp(a.lean ?? 0, b.lean ?? 0, t),
    twist: lerp(a.twist ?? 0, b.twist ?? 0, t),
    headYaw: lerp(a.headYaw ?? 0, b.headYaw ?? 0, t),
    headPitch: lerp(a.headPitch ?? 0, b.headPitch ?? 0, t),
    armR: lerp3(a.armR, b.armR, t),
    armL: lerp3(a.armL, b.armL, t),
    wristR: lerp(a.wristR ?? -90, b.wristR ?? -90, t),
    wristL: lerp(a.wristL ?? -90, b.wristL ?? -90, t),
    plantR: lerp(part(a.plantR), part(b.plantR), t),
    plantL: lerp(part(a.plantL), part(b.plantL), t),
    growR: lerp(a.growR ?? 1, b.growR ?? 1, t),
    legR: lerp2(a.legR, b.legR, t),
    legL: lerp2(a.legL, b.legL, t),
    lift: lerp(a.lift ?? 0, b.lift ?? 0, t),
  };
}

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);
const easeBoth = (t: number): number => t * t * (3 - 2 * t);

/** An attack's three poses: gathered, struck, and how long the blow itself takes to fall. */
export interface Blow {
  wind: Pose;
  hit: Pose;
  /** Seconds from gathered to struck. */
  snap?: number;
}

/**
 * The pose of an attack `age` seconds after it was begun, when the rules give it `windT` seconds of
 * wind-up and `follow` seconds after the blow. `rest`: how the figure stands when it is not attacking.
 */
export function strike(rest: Pose, blow: Blow, age: number, windT: number, follow: number): Pose {
  if (age < windT) return mix(rest, blow.wind, easeOut(windT > 0 ? age / windT : 1));
  const v = age - windT;
  const snap = Math.min(blow.snap ?? 0.07, Math.max(0.03, follow * 0.4));
  if (v < snap) return mix(blow.wind, blow.hit, v / snap);
  return mix(blow.hit, rest, easeBoth(Math.min(1, (v - snap) / Math.max(0.08, follow - snap))));
}

/**
 * Legs, and the swing of the body that goes with them, laid over a pose of the upper body.
 * `gone`: tiles walked so far (the stride follows the ground: feet do not slide); `pace`: 0 standing
 * .. 1 at full stride; `size`: how many times life size the figure is drawn; `t`: the clock, for
 * the breath of something standing.
 */
export function walk(upper: Pose, gone: number, pace: number, size: number, t: number, held: { r: boolean; l: boolean }, seed = 0): Pose {
  const phase = (gone / size) * 4.4;
  const s = Math.sin(phase) * pace;
  const c = Math.cos(phase);
  const breath = Math.sin(t * 2.1 + seed);
  const swing = (a: Three | undefined, dir: number, heldThis: boolean): Three => {
    const p = a ?? [0, 9, 12 + 12 * pace];
    return [p[0] + dir * s * (heldThis ? 7 : 26) + breath * 1.2, p[1], p[2]];
  };
  return {
    ...upper,
    lean: (upper.lean ?? 0) + 5 * pace + breath * 0.8,
    twist: (upper.twist ?? 0) + s * 5,
    headYaw: (upper.headYaw ?? 0) - s * 4,
    legR: [30 * s, 38 * Math.max(0, c) * pace],
    legL: [-30 * s, 38 * Math.max(0, -c) * pace],
    armR: swing(upper.armR, -1, held.r),
    armL: swing(upper.armL, 1, held.l),
    lift: (upper.lift ?? 0) + 0.025 * Math.abs(c) * pace,
  };
}

// ---------------------------------------------------------------------------------------------
// The heroes

export type HeroKind = 'warrior' | 'ranger' | 'mage';

/** How each hero stands when nothing is happening. */
export const HERO_REST: Record<HeroKind, Pose> = {
  warrior: { armR: [16, 52, 28], plantR: 1, armL: [30, 22, 62] },
  ranger: { armL: [16, 36, 12], plantL: 1, armR: [20, 12, 50] },
  mage: { armR: [34, 30, 28], plantR: 1, armL: [14, 14, 34] },
};

/** With the great sword: both hands on it, the blade up and across the body. */
export const GREAT_REST: Pose = { lean: 3, armR: [48, 14, 62], wristR: -24, plantR: 0, armL: [62, -6, 78] };

/** Each hero's two attacks: the quick one, and the slow one. */
export const HERO_BLOW: Record<HeroKind, readonly [Blow, Blow]> = {
  warrior: [
    // a cut: the sword back over the shoulder, then down across the body
    { wind: { lean: -6, twist: -22, armR: [150, 24, 34], wristR: -146, armL: [44, 24, 70], headYaw: 10 }, hit: { lean: 16, twist: 26, armR: [34, 6, 6], wristR: -72, armL: [18, 30, 58], headYaw: -8 } },
    // a slam: the sword high in both hands, then down on the floor in front
    { wind: { lean: -12, armR: [168, 8, 14], wristR: -168, armL: [150, -12, 40], lift: 0.1 }, hit: { lean: 34, armR: [26, 2, 4], wristR: -28, armL: [34, -4, 30] }, snap: 0.08 },
  ],
  ranger: [
    // a shot: side on, the bow arm straight out, the string drawn to the shoulder; then let go
    { wind: { twist: -78, headYaw: 74, armL: [0, 88, 0], plantL: 1, armR: [10, 80, 125] }, hit: { twist: -78, headYaw: 74, armL: [0, 90, 0], plantL: 1, armR: [0, 84, 70] }, snap: 0.04 },
    // a volley: the same, aimed at the sky
    { wind: { twist: -78, headYaw: 70, headPitch: -22, lean: -4, armL: [0, 128, 0], plantL: 0.35, wristL: -90, armR: [10, 104, 125] }, hit: { twist: -78, headYaw: 70, headPitch: -22, lean: -4, armL: [0, 132, 0], plantL: 0.35, wristL: -90, armR: [0, 108, 70] }, snap: 0.04 },
  ],
  mage: [
    // the staff thrust out: drawn back to the hip, then out at arm's length, its head forward
    { wind: { lean: -5, twist: -16, armR: [-18, 26, 70], plantR: 0.7, wristR: -90, armL: [46, 24, 66] }, hit: { lean: 12, twist: 16, armR: [84, 8, 6], plantR: 0.25, wristR: -34, armL: [28, 30, 44] } },
    // the staff brought down: raised high, then its foot struck on the floor
    { wind: { lean: -8, armR: [156, 16, 16], plantR: 1, armL: [120, -6, 40], lift: 0.06 }, hit: { lean: 14, armR: [52, 18, 20], plantR: 1, armL: [40, 16, 50] }, snap: 0.08 },
  ],
};

/** With the great sword: a sweep from the shoulder, and the overhead blow. */
export const GREAT_BLOW: readonly [Blow, Blow] = [
  { wind: { lean: -4, twist: -34, armR: [120, 40, 40], wristR: -150, armL: [130, -20, 70], headYaw: 16 }, hit: { lean: 14, twist: 38, armR: [50, -10, 10], wristR: -84, armL: [60, 20, 40], headYaw: -14 }, snap: 0.09 },
  { wind: { lean: -12, armR: [168, 6, 14], wristR: -172, armL: [160, -10, 30], lift: 0.1 }, hit: { lean: 34, armR: [28, 2, 4], wristR: -26, armL: [34, -4, 26] }, snap: 0.09 },
];

/** A whirlwind: the sword held straight out and carried round (the figure itself is turned by whoever draws it). */
export const WHIRL: Pose = { lean: 6, armR: [0, 86, 0], wristR: 180, plantR: 0, armL: [10, 60, 30] };

/** Tucked up, for a roll (the figure is turned head over heels by whoever draws it). */
export const TUCK: Pose = { lean: 46, headPitch: 30, armR: [60, 10, 110], armL: [60, 10, 110], legR: [86, 118], legL: [80, 112], plantR: 0, plantL: 0, wristR: -90, wristL: -90 };

/** In the air, for a leap: `k` 0 at the spring, 1 at the landing. The sword goes up as the hero rises and comes down as they do. */
export function leap(rest: Pose, k: number): Pose {
  const up: Pose = { lean: -8, armR: [160, 12, 14], wristR: -160, armL: [60, 40, 40], legR: [40, 80], legL: [-20, 60], plantR: 0 };
  const down: Pose = { lean: 30, armR: [30, 4, 4], wristR: -30, armL: [30, 30, 40], legR: [20, 30], legL: [-30, 50], plantR: 0 };
  if (k < 0.55) return mix(rest, up, easeOut(k / 0.55));
  return mix(up, down, easeBoth((k - 0.55) / 0.45));
}

// ---------------------------------------------------------------------------------------------
// The monsters

export type Beast = 'skeleton' | 'archer' | 'cultist' | 'brute' | 'guardian' | 'warden';

export const BEAST_REST: Record<Beast, Pose> = {
  skeleton: { armR: [44, 22, 52], wristR: -112, armL: [10, 14, 20] },
  archer: { armL: [16, 36, 12], plantL: 1, armR: [30, 10, 80] },
  cultist: { armR: [84, 30, 44], plantR: 1, armL: [18, 20, 36] },
  brute: { lean: 10, armR: [30, 26, 40], wristR: -58, armL: [20, 26, 40] },
  guardian: { lean: 10, armR: [30, 26, 40], wristR: -58, armL: [20, 26, 40] },
  warden: { lean: 3, armR: [30, 26, 50], wristR: -30, armL: [14, 18, 30] },
};

const SMASH: Blow = { wind: { lean: -8, armR: [165, 18, 20], wristR: -150, armL: [150, -10, 40] }, hit: { lean: 30, armR: [30, 0, 5], wristR: -30, armL: [30, 0, 20] }, snap: 0.09 };

export const BEAST_BLOW: Record<Beast, Blow> = {
  skeleton: { wind: { lean: -4, twist: -16, armR: [150, 16, 26], wristR: -130, armL: [-20, 22, 40] }, hit: { lean: 14, twist: 18, armR: [38, 10, 10], wristR: -70, armL: [20, 20, 40] } },
  archer: { wind: { twist: -78, headYaw: 74, armL: [0, 88, 0], plantL: 1, armR: [10, 80, 125] }, hit: { twist: -78, headYaw: 74, armL: [0, 90, 0], plantL: 1, armR: [0, 84, 70] }, snap: 0.04 },
  // (its fire swells as it is raised, and has left the hand when the arm comes down)
  cultist: { wind: { lean: -6, armR: [150, 18, 18], plantR: 1, growR: 2.3, armL: [40, 30, 50] }, hit: { lean: 12, armR: [76, 8, 8], plantR: 1, growR: 0.15, armL: [20, 24, 40] }, snap: 0.08 },
  brute: SMASH,
  guardian: SMASH,
  warden: { wind: { lean: -8, armR: [170, 14, 10], wristR: -170, armL: [160, -16, 30] }, hit: { lean: 26, armR: [28, 0, 0], wristR: -15, armL: [30, 0, 10] }, snap: 0.1 },
};

/** The Warden's other attack: a hand thrown out, and the bolts go. */
export const WARDEN_VOLLEY: Blow = { wind: { lean: -5, twist: 18, armL: [70, 30, 90], armR: [30, 26, 50], wristR: -30 }, hit: { lean: 9, twist: -14, armL: [96, 16, 0], armR: [30, 26, 50], wristR: -30 }, snap: 0.07 };
