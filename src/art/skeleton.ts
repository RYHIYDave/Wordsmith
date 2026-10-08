// THE SKELETON (begun 6 Oct 2026).
//
// The owner, that morning: "i feel like to body and head of character sprites are too stiff. they
// never move ... research how an actual person would move and look doing it and apply that to the
// animations"; "You can change the proportions of the characters to be more realistic if needed";
// and then: "Or just create a wire frame and we can use that to make animations".
//
// Until now a hero was a painting moved by a handful of numbers: the whole of them above the legs
// slid a pixel or two, a hand went here, a weapon pointed there. There was no spine in it: the
// chest could not tip from the hips, the head could not turn or look up, and each of the two views
// (toward the camera, away from it) had to be given its own numbers by eye.
//
// This is a figure of BONES, with a real person's proportions, posed in three dimensions:
//   - a pelvis that moves, turns and tips;
//   - a spine in three pieces that twists and bends from it, carrying the shoulders;
//   - a head on a neck that looks where it is told to look, WHATEVER THE CHEST IS DOING (a person's
//     head is held steady in space while the trunk works under it: see docs/NEXT_VERSION.md,
//     "BODIES AND HEADS THAT MOVE", for what was read up on);
//   - arms and legs of two bones each, which find their own elbows and knees from where the hand
//     or the foot is put.
// One pose is one set of numbers, and every view of it (from the side, or either of the game's
// two) is the same figure looked at from somewhere else.
//
// AXES. The figure stands at the origin of its own floor. x is the way it faces, y is to its left,
// z is up. Lengths are picture pixels (the heroes' art is painted two picture pixels to one of
// the game's); angles are degrees.
//
// Nothing here draws anything: `solve` says where every joint is, `project` where a point is
// seen. The wire figure is drawn by src/dev/preview_wire.ts.

import { easeOf } from './clip';
import type { Ease } from './clip';

export type V3 = readonly [number, number, number];
/** Where a part's own forward, left and up point. */
export type Rot = readonly [V3, V3, V3];

const D = Math.PI / 180;
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
export const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-6 ? mul(a, 1 / l) : or;
};
export const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** A point given along a part's own forward, left and up, as the figure has it. */
export const along = (r: Rot, v: V3): V3 => [
  r[0][0] * v[0] + r[1][0] * v[1] + r[2][0] * v[2],
  r[0][1] * v[0] + r[1][1] * v[1] + r[2][1] * v[2],
  r[0][2] * v[0] + r[1][2] * v[1] + r[2][2] * v[2],
];
const rz = (v: V3, a: number): V3 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
const rx = (v: V3, a: number): V3 => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
const ry = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const AXES: Rot = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
/**
 * A part turned to its left by `yaw`, and then tipped the way THE FIGURE faces by `pitch` (back,
 * if negative) and to the figure's right by `roll`. The tipping is measured on the figure's axes,
 * not the part's own: an archer who stands side-on and leans away from the mark is leaning BACK,
 * whichever way the chest is turned.
 */
export function orient(yaw: number, pitch: number, roll: number): Rot {
  const one = (e: V3): V3 => ry(rx(rz(e, yaw * D), roll * D), pitch * D);
  return [one(AXES[0]), one(AXES[1]), one(AXES[2])];
}
/** A direction: `az` degrees to the left of the way the figure faces, `el` degrees above level. */
export function heading(az: number, el: number): V3 {
  return [Math.cos(el * D) * Math.cos(az * D), Math.cos(el * D) * Math.sin(az * D), Math.sin(el * D)];
}
/** `v` turned round the axis `k` (a unit vector) by `deg`. */
export function about(v: V3, k: V3, deg: number): V3 {
  const c = Math.cos(deg * D);
  const s = Math.sin(deg * D);
  return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
}

// ---------------------------------------------------------------------------------------------
// How a body is built

/** Every length of a body, in picture pixels. */
export interface Build {
  /** Standing, floor to crown. */
  tall: number;
  /** The ankle joint above the sole; the shin; the thigh. */
  ankle: number;
  shank: number;
  thigh: number;
  /** Each hip joint from the middle of the pelvis, and each foot from the middle when standing. */
  hipHalf: number;
  stance: number;
  /** The spine, in three pieces: pelvis to waist, waist to the bottom of the ribs, and up to the root of the neck. */
  waist: number;
  ribs: number;
  chest: number;
  /** Each shoulder joint from the root of the neck: out, and down. */
  shoulderHalf: number;
  shoulderDrop: number;
  /** The neck, to where the skull turns on it; and the middle of the head from there: up, and forward. */
  neck: number;
  headUp: number;
  headFwd: number;
  /** Half the head's depth (face to back), width and height. */
  headR: V3;
  /** Shoulder to elbow; elbow to the middle of the grip. */
  upperArm: number;
  foreArm: number;
  /** The heel behind the ankle, and the ball of the foot ahead of it. */
  heel: number;
  ball: number;
  /** Half the width and depth of the ribs, of the waist between them and the hips, and of the pelvis: the girth of the trunk. */
  ribHalf: number;
  ribDeep: number;
  waistHalf: number;
  waistDeep: number;
  pelvisHalf: number;
  pelvisDeep: number;
  /** How thick an arm is at the shoulder, the elbow and the wrist, and a leg at the hip, the knee and the ankle (each a radius). */
  armR: readonly [number, number, number];
  legR: readonly [number, number, number];
  /** How far what is worn stands off the trunk: an arm keeps this far clear of it (see `solve`). */
  pad: number;
  /** A coat that flares from the waist, if one is worn: how far out from the hips it stands at the middle of the thigh (to either side; front and back). */
  skirt?: readonly [number, number];
}

/**
 * How one body differs from the usual: each a share of the usual (1 = as it is, and so for any
 * not given). The owner, 6 Oct 2026: "The skeleton gives them shape, but not proportion. They
 * lost all girth, especially the warrior. He needs broader shoulders ... The skeletons can be
 * tweeked as well to make them shorter or taller or broader."
 */
export interface Shape {
  /** How wide the shoulders are; how big round the ribs, the waist and the hips; and how deep the whole trunk is, front to back, over and above that. */
  shoulders?: number;
  depth?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  /** How long the legs, the arms and the trunk are. */
  legs?: number;
  arms?: number;
  trunk?: number;
  /** How thick the arms and legs are. */
  limbs?: number;
  /** How far clothes and armour stand off the trunk, in picture pixels (1.2 if not given). */
  pad?: number;
  /** A coat that flares from the waist: how far out from the hips it stands at the middle of the thigh, to either side and front and back, in picture pixels. Hands and arms are kept out of it as they are out of the trunk. */
  skirt?: readonly [number, number];
}

/**
 * A grown person of height `tall`: seven and a half heads, by the usual table of the lengths of a
 * body as shares of its height (Drillis and Contini, 1966, as every biomechanics text gives it):
 * the hip joints at 0.53 of the height, the knee at 0.285, the shoulders at 0.82, the upper arm
 * 0.186 long and the forearm 0.146, the head 0.13 from chin to crown. `head` makes the head
 * bigger or smaller than life (1 = life).
 */
export function buildOf(tall = 57, head = 1, shape: Shape = {}): Build {
  const H = tall;
  const sh = shape.shoulders ?? 1;
  const ch = shape.chest ?? 1;
  const wa = shape.waist ?? 1;
  const hi = shape.hips ?? 1;
  const lg = shape.legs ?? 1;
  const ar = shape.arms ?? 1;
  const tr = shape.trunk ?? 1;
  const li = shape.limbs ?? 1;
  const dp = shape.depth ?? 1;
  return {
    tall: H,
    ankle: 0.039 * H,
    shank: 0.246 * H * lg,
    thigh: 0.245 * H * lg,
    hipHalf: 0.052 * H * hi,
    stance: 0.066 * H * hi,
    waist: 0.08 * H * tr,
    ribs: 0.09 * H * tr,
    chest: 0.13 * H * tr,
    shoulderHalf: 0.129 * H * sh,
    shoulderDrop: 0.012 * H,
    neck: 0.07 * H,
    headUp: 0.035 * H * head,
    headFwd: 0.012 * H * head,
    headR: [0.058 * H * head, 0.047 * H * head, 0.065 * H * head],
    upperArm: 0.186 * H * ar,
    foreArm: 0.191 * H * ar,
    heel: 0.035 * H,
    ball: 0.105 * H,
    ribHalf: 0.088 * H * ch,
    ribDeep: 0.064 * H * ch * dp,
    waistHalf: 0.072 * H * wa,
    waistDeep: 0.054 * H * wa * dp,
    pelvisHalf: 0.086 * H * hi,
    pelvisDeep: 0.058 * H * hi * dp,
    // (thicker than life: at this size a limb as thin as a real one is a line)
    armR: [0.04 * H * li, 0.034 * H * li, 0.028 * H * li],
    legR: [0.056 * H * li, 0.042 * H * li, 0.032 * H * li],
    pad: shape.pad ?? 1.2,
    skirt: shape.skirt,
  };
}

// ---------------------------------------------------------------------------------------------
// A pose

/**
 * Where a hand's place is measured from (`lhIn`, `rhIn`):
 *   0 = from its own shoulder, along the CHEST's forward, left and up: it goes wherever the chest
 *       goes (an arm that hangs, or is carried);
 *   1 = from its own shoulder, along the FIGURE's axes: the shoulder may move, but the reach keeps
 *       its direction (an arm that points at something);
 *   2 = from the figure's place on the floor: the hand stays put whatever the body does (a hand on
 *       a staff that is planted, a hand on the ground);
 *   3 = the left hand only: on the weapon the right hand holds, `lhx` along it from that hand
 *       toward its point (negative: toward the pommel), `lhy` and `lhz` off it.
 */
export type HandIn = 0 | 1 | 2 | 3;

/** One pose of the bones. Every number moves smoothly from key to key except the two `...In`. */
export interface Bones {
  /** The pelvis, moved from where it is when standing: forward, to its left, up. */
  px: number;
  py: number;
  pz: number;
  /** ... turned to its left, tipped forward (back, if negative), tipped to its right. */
  yaw: number;
  pitch: number;
  roll: number;
  /** The spine: what the CHEST does over and above the pelvis. Turned to the left, bent forward (back, if negative), bent to the right. */
  twist: number;
  bend: number;
  side: number;
  /**
   * The head: where the FACE points, measured from the way the figure faces and from level, not
   * from the chest. (0, 0) looks straight ahead however the body under it is turned or tipped,
   * as far as a neck allows. `faceTilt` lays the head over toward the right shoulder.
   */
  faceTurn: number;
  faceUp: number;
  faceTilt: number;
  /** The hands (see HandIn), and how far each elbow is swung out and up from hanging under the arm. */
  lhIn: HandIn;
  lhx: number;
  lhy: number;
  lhz: number;
  rhIn: HandIn;
  rhx: number;
  rhy: number;
  rhz: number;
  le: number;
  re: number;
  /** Each ankle, moved from where it is when standing (forward, to the left, up); the foot tipped toes-down, and turned to the left. */
  lfx: number;
  lfy: number;
  lfz: number;
  lfp: number;
  lft: number;
  rfx: number;
  rfy: number;
  rfz: number;
  rfp: number;
  rft: number;
  /** The way each knee points: degrees to the left of the way the figure faces, and degrees above level (a knee points down when someone is going over in a roll). */
  lk: number;
  rk: number;
  lkUp: number;
  rkUp: number;
  /**
   * What is held: the way it points (a blade's point, a staff's head, the arrow on a bow), as
   * `heading` has it, and how far it is rolled about that line. `draw`: a bow's string, 0 at
   * rest to 1 at full draw.
   */
  wAz: number;
  wEl: number;
  wRoll: number;
  draw: number;
  /**
   * The light going out of the figure, 0 as it is to 1 quite out (a hero's fall ends with it: the
   * kit's `lightsOut` does it to the painting), and a blast of air in its face, 0 none to 1 the
   * whole of it (its own beam, held: cloth streams back). Neither moves a bone.
   */
  out: number;
  gale: number;
  /**
   * Something extra in the picture, by the painter's own numbering (a squirrel on the shoulders,
   * a mage light, a book: 0 = nothing), and how far along it is in whatever it does, 0..1.
   * Between two keys the thing that is not nothing is the one shown.
   */
  prop: number;
  pt: number;
  /** The way that extra thing points, if it is a thing that points (an arrow in the fingers): as `heading` has it. */
  pAz: number;
  pEl: number;
  /**
   * WHAT IS CARRIED IS PUT AWAY, on the body and not in the hand (1), or is in the hand (0): a
   * sword or a bow on the back in town (carried.ts). It does not move smoothly: between two keys
   * it is as the EARLIER one has it. So a hand that goes to a weapon on the back has it from the
   * key at which it gets there, and one that puts it away has let go of it at the key at which
   * it is there (at that key the weapon in the hand must lie as it lies on the back).
   */
  stow: number;
}

/** Between two keys whose hands are measured from different things: the other key's, and how far along (see `bonesAt`). */
export interface Posed extends Bones {
  lh2?: readonly [HandIn, number, number, number];
  rh2?: readonly [HandIn, number, number, number];
  mixK?: number;
  /**
   * Between two keys: the whole pose of each. AN ELBOW GOES FROM WHERE THE ONE KEY HAS IT TO WHERE
   * THE OTHER HAS IT, by the short way (`solve`); it is not the numbers `le` and `re` that are
   * mixed, which are measured from a line that moves as the hand does (and that turns right over
   * when a hand passes its own shoulder).
   */
  from?: Bones;
  to?: Bones;
}

const SMOOTH3 = [
  'px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt',
  'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're',
  'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk', 'lkUp', 'rkUp', 'wAz', 'wEl', 'wRoll', 'draw', 'out', 'gale', 'pt', 'pAz', 'pEl',
] as const;

/** Standing easy, arms hanging: what every pose starts from. */
export function standing(b: Build): Bones {
  const hang = -(b.upperArm + b.foreArm) * 0.985;
  return {
    px: 0, py: 0, pz: 0, yaw: 0, pitch: 0, roll: 0, twist: 0, bend: 0, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 0,
    lhIn: 0, lhx: 1.2, lhy: 1, lhz: hang, rhIn: 0, rhx: 1.2, rhy: -1, rhz: hang, le: 0, re: 0,
    lfx: 0, lfy: 0, lfz: 0, lfp: 0, lft: 8, rfx: 0, rfy: 0, rfz: 0, rfp: 0, rft: -8, lk: 6, rk: -6, lkUp: 0, rkUp: 0,
    wAz: 0, wEl: 0, wRoll: 0, draw: 0, out: 0, gale: 0, prop: 0, pt: 0, pAz: 0, pEl: 0, stow: 0,
  };
}

export interface Key3 {
  /** Seconds from the start. */
  at: number;
  /** The pose reached then. What it does not name is as the figure's pose at rest has it. */
  pose: Partial<Bones>;
  ease?: Ease;
  /**
   * THE SAME POSE SAID IN OTHER NUMBERS, for the way from this key to the next to be measured
   * from. (A blade that points forward and 34 degrees down is "behind, and 214 degrees up from
   * there" when it has come OVER to get there, and "forward, 34 down" when it is to go ROUND to
   * his side next: the picture is the same, the way on from it is not.)
   */
  as?: Partial<Bones>;
}
/** A whole move of the bones. */
export interface Motion {
  keys: ReadonlyArray<Key3>;
  /** For an attack: the moment the blow lands, in seconds from the start (the rules' own). */
  hit?: number;
  /** For a move that is held: the moment its loop begins. */
  loop?: number;
}

/** The pose at a moment of a move. */
const WHOLE = new WeakMap<object, WeakMap<object, Bones>>();
/** A key's whole pose: what it names, and the rest as the figure's pose at rest has it. (The same one every time it is asked for: `solve` keeps what it works out about it.) */
function wholeOf(k: Key3, rest: Bones): Bones {
  let of = WHOLE.get(k.pose);
  if (!of) WHOLE.set(k.pose, (of = new WeakMap()));
  let w = of.get(rest);
  if (!w) of.set(rest, (w = { ...rest, ...k.pose }));
  return w;
}

const SAID = new WeakMap<object, WeakMap<object, Bones>>();
/** A key's whole pose in the numbers the way on from it is measured from (`Key3.as`), if it has any. */
function saidOf(k: Key3, rest: Bones): Bones {
  if (!k.as) return wholeOf(k, rest);
  let of = SAID.get(k.as);
  if (!of) SAID.set(k.as, (of = new WeakMap()));
  let w = of.get(rest);
  if (!w) of.set(rest, (w = { ...wholeOf(k, rest), ...k.as }));
  return w;
}

export function bonesAt(keys: ReadonlyArray<Key3>, rest: Bones, t: number): Posed {
  const full = (k: Key3): Bones => wholeOf(k, rest);
  if (keys.length === 0) return { ...rest };
  if (t <= keys[0].at) return { ...full(keys[0]) };
  const last = keys[keys.length - 1];
  if (t >= last.at) return { ...full(last) };
  let i = 0;
  while (i < keys.length - 2 && t >= keys[i + 1].at) i++;
  const a = saidOf(keys[i], rest);
  const b = full(keys[i + 1]);
  const span = keys[i + 1].at - keys[i].at;
  const k = easeOf(keys[i + 1].ease, span > 0 ? (t - keys[i].at) / span : 1);
  const out: Posed = { ...a };
  for (const f of SMOOTH3) out[f] = a[f] + (b[f] - a[f]) * k;
  // A hand that is measured from one thing at this key and from another at the next: both places
  // are worked out on the body as it is now, and the hand goes from the one to the other.
  if (a.lhIn !== b.lhIn) {
    out.lhx = a.lhx;
    out.lhy = a.lhy;
    out.lhz = a.lhz;
    out.lh2 = [b.lhIn, b.lhx, b.lhy, b.lhz];
  }
  if (a.rhIn !== b.rhIn) {
    out.rhx = a.rhx;
    out.rhy = a.rhy;
    out.rhz = a.rhz;
    out.rh2 = [b.rhIn, b.rhx, b.rhy, b.rhz];
  }
  out.mixK = k;
  out.from = a;
  out.to = b;
  out.prop = a.prop !== 0 && b.prop !== 0 ? (k < 0.5 ? a.prop : b.prop) : a.prop !== 0 ? a.prop : b.prop;
  return out;
}

// ---------------------------------------------------------------------------------------------
// Where everything is

/** Every joint of a posed figure, in the figure's own space. */
export interface Skeleton {
  pelvis: V3;
  waist: V3;
  ribs: V3;
  neck: V3;
  skull: V3;
  head: V3;
  shoulderL: V3;
  shoulderR: V3;
  elbowL: V3;
  elbowR: V3;
  handL: V3;
  handR: V3;
  hipL: V3;
  hipR: V3;
  kneeL: V3;
  kneeR: V3;
  ankleL: V3;
  ankleR: V3;
  heelL: V3;
  heelR: V3;
  toeL: V3;
  toeR: V3;
  /** How far (degrees) each elbow was swung from where the pose put it, to keep the arm out of the body: 0 if the pose's own place was clear. */
  swungL: number;
  swungR: number;
  /** Which way the pose put each elbow off the line from its shoulder to its hand, in the chest's own space (before the body moved it, if it did). */
  poleL: V3;
  poleR: V3;
  /** How the pelvis, the middle of the trunk, the chest and the head are turned. */
  hips: Rot;
  belly: Rot;
  chest: Rot;
  face: Rot;
  /** The way what is held points, and the line across it (a bow's limbs, a blade's edge). */
  point: V3;
  across: V3;
}

/** One solid of a trunk: its middle, how it is turned, and its half-lengths along its own forward, left and up. */
export interface Solid {
  c: V3;
  r: Rot;
  h: V3;
}
/**
 * The trunk as three solids, for a painter to dress and for an arm to keep clear of: the ribs,
 * the waist under them, and the pelvis.
 */
export function trunkOf(b: Build, s: { pelvis: V3; waist: V3; ribs: V3; hips: Rot; belly: Rot; chest: Rot }): readonly [Solid, Solid, Solid] {
  return [
    { c: add(s.ribs, mul(s.chest[2], b.chest * 0.42)), r: s.chest, h: [b.ribDeep, b.ribHalf, b.chest * 0.7] },
    { c: lerp3(s.waist, s.ribs, 0.45), r: s.belly, h: [b.waistDeep, b.waistHalf, b.ribs * 0.9] },
    { c: add(s.pelvis, mul(s.hips[2], b.waist * 0.3)), r: s.hips, h: [b.pelvisDeep, b.pelvisHalf, b.waist * 0.9] },
  ];
}

/** How deep inside a solid a point is: less than 1 inside it (0 at its middle), 1 on its skin, more outside. `pad` makes the solid that much bigger all round. */
function within(o: Solid, p: V3, pad: number): number {
  const d = sub(p, o.c);
  return Math.hypot(dot(d, o.r[0]) / (o.h[0] + pad), dot(d, o.r[1]) / (o.h[1] + pad), dot(d, o.r[2]) / (o.h[2] + pad));
}
/** A point moved out of a solid, if it is inside it: straight out from the solid's middle to its skin (made `pad` bigger all round). */
function clearOf(o: Solid, p: V3, pad: number): V3 {
  const d = sub(p, o.c);
  const u: V3 = [dot(d, o.r[0]) / (o.h[0] + pad), dot(d, o.r[1]) / (o.h[1] + pad), dot(d, o.r[2]) / (o.h[2] + pad)];
  const m = Math.hypot(u[0], u[1], u[2]);
  if (m >= 1) return p;
  // (a point at the very middle goes out the front)
  const k = m < 1e-4 ? 0 : 1 / m;
  const out: V3 = m < 1e-4 ? [1, 0, 0] : [u[0] * k, u[1] * k, u[2] * k];
  return add(o.c, along(o.r, [out[0] * (o.h[0] + pad), out[1] * (o.h[1] + pad), out[2] * (o.h[2] + pad)]));
}

/** How far a neck lets the face turn from the chest, and look up and down from it. */
const NECK_TURN = 88;
const NECK_UP = 65;
const NECK_DOWN = 55;

/** A body's own frame, as far as an arm needs it. */
interface Torso {
  chest: Rot;
  neck: V3;
  pelvis: V3;
  shoulderL: V3;
  shoulderR: V3;
}

/** Where an elbow is clear of the body by nature, off the line from a shoulder to a hand: away from the trunk's own line at the middle of the arm, a little forward, down, and to the arm's own side. */
function awayFrom(b: Build, t: Torso, left: boolean, shoulder: V3, hand: V3): V3 {
  const middle = lerp3(shoulder, hand, 0.5);
  const spine = sub(t.neck, t.pelvis);
  const onSpine = add(t.pelvis, mul(spine, Math.max(0, Math.min(1, dot(sub(middle, t.pelvis), spine) / Math.max(1e-6, dot(spine, spine))))));
  const out = sub(middle, onSpine);
  return add(mul(out, 1 / Math.max(len(out), b.ribHalf)), along(t.chest, [0.4, left ? 0.25 : -0.25, -0.5]));
}

/**
 * WHICH WAY AN ELBOW LIES off the line from its shoulder to its hand, before a pose swings it
 * (`le`, `re`). Of an arm on its own side of the body it HANGS: back, out a little and down. Of
 * one whose hand has come to the middle of the body or across it (two hands on one hilt, a hand
 * on the other hip, a hand at the face) that would put the elbow in the chest: there it lies
 * AWAY FROM THE TRUNK AND LOW instead. Between the two, as the hand crosses, it goes smoothly
 * from the one to the other.
 */
function poleOf(b: Build, t: Torso, left: boolean, shoulder: V3, hand: V3): V3 {
  const hung = norm(along(t.chest, [-1, left ? 0.25 : -0.25, -0.55]));
  // (how far to its own side of the body's middle the hand is)
  const own = (left ? 1 : -1) * dot(sub(hand, lerp3(t.shoulderL, t.shoulderR, 0.5)), t.chest[1]);
  const k = Math.max(0, Math.min(1, (own - 0.15 * b.shoulderHalf) / (0.6 * b.shoulderHalf)));
  const across = 1 - k * k * (3 - 2 * k);
  if (across <= 0) return hung;
  const away = norm(awayFrom(b, t, left, shoulder, hand));
  return add(mul(hung, 1 - across), mul(away, across));
}

/**
 * A limb of two bones from `a` to as near `b` as it reaches: where its middle joint is, and its
 * end. The joint is pushed toward `pole` (an elbow hangs back and down; a knee goes forward).
 */
export function reach(a: V3, b: V3, la: number, lb: number, pole: V3): { mid: V3; end: V3 } {
  const d = sub(b, a);
  const far = len(d);
  const dir = norm(d, [0, 0, -1]);
  const dist = Math.max(Math.abs(la - lb) + 0.01, Math.min(la + lb - 0.01, far));
  const run = (la * la - lb * lb + dist * dist) / (2 * dist);
  const rise = Math.sqrt(Math.max(0, la * la - run * run));
  let off = sub(pole, mul(dir, dot(pole, dir)));
  if (len(off) < 1e-4) off = sub([0, 0, 1], mul(dir, dir[2]));
  if (len(off) < 1e-4) off = [1, 0, 0];
  return { mid: add(add(a, mul(dir, run)), mul(norm(off), rise)), end: add(a, mul(dir, dist)) };
}

const KEYS = new WeakMap<object, Map<Build, Skeleton>>();
/** A key's own pose, solved (and kept: a move asks for each of its keys again at every frame between them). */
function keyPose(b: Build, pose: Bones): Skeleton {
  let of = KEYS.get(pose);
  if (!of) KEYS.set(pose, (of = new Map()));
  let sk = of.get(b);
  if (!sk) of.set(b, (sk = solve(b, pose)));
  return sk;
}

/** How a pose has the chest turned (its own forward, left and up). */
export function chestOf(q: Pick<Bones, 'yaw' | 'pitch' | 'roll' | 'twist' | 'bend' | 'side'>): Rot {
  return orient(q.yaw + q.twist, q.pitch + q.bend, q.roll + q.side);
}

/**
 * The three numbers of a pose that make what is held point along `point` with `across` the line
 * across it (`wAz`, `wEl`, `wRoll`): for a key at which a weapon must lie in the hand just as it
 * lies somewhere else (on a back: carried.ts).
 */
export function aimFor(point: V3, across: V3): { wAz: number; wEl: number; wRoll: number } {
  const p = norm(point, [1, 0, 0]);
  let flat = sub([0, 0, 1], mul(p, p[2]));
  if (len(flat) < 1e-3) flat = [-1, 0, 0];
  flat = norm(flat);
  const ac = norm(sub(across, mul(p, dot(across, p))), flat);
  return { wAz: Math.atan2(p[1], p[0]) / D, wEl: Math.asin(Math.max(-1, Math.min(1, p[2]))) / D, wRoll: Math.atan2(dot(cross(flat, ac), p), dot(flat, ac)) / D };
}

/** Where every joint of the figure is, for a pose. */
export function solve(b: Build, q: Posed): Skeleton {
  const hipH = b.ankle + b.shank + b.thigh;
  const hips = orient(q.yaw, q.pitch, q.roll);
  const belly = orient(q.yaw + q.twist * 0.45, q.pitch + q.bend * 0.45, q.roll + q.side * 0.45);
  const chest = chestOf(q);
  const pelvis: V3 = [q.px, q.py, hipH + q.pz];
  const waist = add(pelvis, along(hips, [0, 0, b.waist]));
  const ribs = add(waist, along(belly, [0, 0, b.ribs]));
  const neck = add(ribs, along(chest, [0, 0, b.chest]));
  const shoulderL = add(neck, along(chest, [0, b.shoulderHalf, -b.shoulderDrop]));
  const shoulderR = add(neck, along(chest, [0, -b.shoulderHalf, -b.shoulderDrop]));

  // --- the head: it looks where it is told, as far as the neck lets it ---
  const want: Rot = [0, 1, 2].map((i) => rz(ry(rx(AXES[i], q.faceTilt * D), -q.faceUp * D), q.faceTurn * D)) as unknown as Rot;
  const fc: V3 = [dot(want[0], chest[0]), dot(want[0], chest[1]), dot(want[0], chest[2])];
  const turned = Math.atan2(fc[1], fc[0]) / D;
  const up = Math.asin(Math.max(-1, Math.min(1, fc[2]))) / D;
  let face: Rot = want;
  if (Math.abs(turned) > NECK_TURN || up > NECK_UP || up < -NECK_DOWN) {
    const t2 = Math.max(-NECK_TURN, Math.min(NECK_TURN, turned));
    const u2 = Math.max(-NECK_DOWN, Math.min(NECK_UP, up));
    const fwd = along(chest, heading(t2, u2));
    const top = norm(sub(want[2], mul(fwd, dot(want[2], fwd))), chest[2]);
    face = [fwd, cross(top, fwd), top];
  }
  // (a neck stands a little forward of the spine's line, and bends half way to wherever the head is tipped)
  const skull = add(neck, mul(norm(add(add(chest[2], face[2]), mul(chest[0], 0.3))), b.neck));
  const head = add(skull, add(mul(face[2], b.headUp), mul(face[0], b.headFwd)));

  // --- what is held ---
  const point = heading(q.wAz, q.wEl);
  let across = sub([0, 0, 1], mul(point, point[2]));
  if (len(across) < 1e-3) across = [-1, 0, 0];
  across = about(norm(across), point, q.wRoll);

  // --- the arms ---
  const k = q.mixK ?? 0;
  const place = (left: boolean, where: HandIn, x: number, y: number, z: number, other: V3 | null): V3 => {
    const s = left ? shoulderL : shoulderR;
    if (where === 0) return add(s, along(chest, [x, y, z]));
    if (where === 1) return add(s, [x, y, z]);
    if (where === 2) return [x, y, z];
    // on the weapon in the other hand
    const o = other ?? s;
    return add(o, add(mul(point, x), add(mul(across, z), mul(cross(across, point), y))));
  };
  const hand = (left: boolean, other: V3 | null): V3 => {
    const at = left ? place(true, q.lhIn, q.lhx, q.lhy, q.lhz, other) : place(false, q.rhIn, q.rhx, q.rhy, q.rhz, other);
    const next = left ? q.lh2 : q.rh2;
    return next ? lerp3(at, place(left, next[0], next[1], next[2], next[3], other), k) : at;
  };
  // AN ARM GOES ROUND THE BODY, NOT THROUGH IT (the owner, 6 Oct 2026: "do what you can to make
  // sure the arms don't clip through the clothing"). A hand that a pose puts inside the trunk (or
  // inside what is worn on it: `pad`) is moved straight out to its skin; and an elbow that would
  // be inside it, or an arm that would pass through it on the way to the hand, is swung out round
  // the arm's own line by as little as clears it. A pose that is already clear is not changed.
  const trunk: Solid[] = [...trunkOf(b, { pelvis, waist, ribs, hips, belly, chest })];
  if (b.skirt) {
    // (a flared coat: one more solid that an arm goes round, hung plumb below the hips whichever way they tip)
    const fwd = norm([hips[0][0], hips[0][1], 0], [1, 0, 0]);
    const side = norm([hips[1][0], hips[1][1], 0], [0, 1, 0]);
    trunk.push({ c: add(pelvis, [0, 0, -b.thigh * 0.5]), r: [fwd, side, [0, 0, 1]], h: [b.pelvisDeep + b.skirt[1], b.pelvisHalf + b.skirt[0], b.thigh * 0.85] });
  }
  const off = b.pad + b.armR[2];
  /** How hard the body presses an arm out of it, against how far its elbow is turned to get out (see `arm`). */
  const PRESS = 9;
  /** An arm this little into the body's padding still holds what it holds: the weapon is not moved for it. */
  const HELD = 0.3;
  const freed = (p: V3): V3 => {
    let out = p;
    for (let pass = 0; pass < 2; pass++) for (const o of trunk) out = clearOf(o, out, off);
    return out;
  };
  const torso: Torso = { chest, neck, pelvis, shoulderL, shoulderR };
  const keyed = q.from && q.to ? { a: keyPose(b, q.from), z: keyPose(b, q.to), k: q.mixK ?? 0 } : null;
  /** An arm to a hand, and whether it got there without going through the body. */
  const arm = (left: boolean, s: V3, target: V3): { mid: V3; end: V3; ok: boolean; more: number; pole: V3 } => {
    const dir = norm(sub(target, s), [0, 0, -1]);
    // where the elbow lies by nature (poleOf); `le` / `re` swing it from there round the arm's own
    // line (of an arm that hangs or reaches forward, a swing below 0 takes the elbow OUT from the
    // body and one above 0 in toward it and across; of an arm held up, it is the other way about)
    let hung = poleOf(b, torso, left, s, target);
    let swing = left ? q.le : q.re;
    if (keyed) {
      // BETWEEN TWO KEYS the elbow goes from where the one has it to where the other has it, as
      // each is in the chest's own space. A straight mix of the two, if the arm is much the same
      // in both. But if the two are opposite ways (up behind an arrow, then down on a hip), or
      // the arm itself turns far between them (a staff from over the shoulder to out in front),
      // neither key says where the elbow is on the way: it goes ROUND BY WHERE AN ELBOW LIES BY
      // NATURE with the hand where it now is (away from the trunk and low), never through the
      // shoulder or over the arm. (A curve from the one key's way through that to the other's.)
      const k = keyed.k;
      const a = left ? keyed.a.poleL : keyed.a.poleR;
      const z = left ? keyed.z.poleL : keyed.z.poleR;
      const lineIn = (sk: Skeleton): V3 => {
        const v = norm(sub(left ? sk.handL : sk.handR, left ? sk.shoulderL : sk.shoulderR), [0, 0, -1]);
        return [dot(v, sk.chest[0]), dot(v, sk.chest[1]), dot(v, sk.chest[2])];
      };
      const turned = Math.acos(Math.max(-1, Math.min(1, dot(lineIn(keyed.a), lineIn(keyed.z))))) / D;
      const fresh = Math.max(0, Math.min(1, Math.max(-dot(a, z) * 1.25 + 0.25, (turned - 30) / 70)));
      const away = norm(awayFrom(b, torso, left, s, target));
      const natural: V3 = [dot(away, chest[0]), dot(away, chest[1]), dot(away, chest[2])];
      const by = add(mul(lerp3(a, z, 0.5), 1 - fresh), mul(natural, fresh));
      const d = add(add(mul(a, (1 - k) * (1 - k)), mul(by, 2 * k * (1 - k))), mul(z, k * k));
      hung = along(chest, d);
      swing = 0;
    }
    const sign = left ? -1 : 1;
    const flat = (v: V3): V3 => sub(v, mul(dir, dot(v, dir)));
    // A way for the elbow that lies nearly ALONG the arm's own line says nothing of which side of
    // it the elbow is on (and the least change would throw the elbow right over): the less it
    // says, the more the elbow is simply out to its own side and a little down; and under the arm
    // if even that is along it.
    let lay = flat(norm(hung, [0, 0, -1]));
    const thin = 0.4 - len(lay);
    if (thin > 0) {
      lay = add(lay, mul(flat(along(chest, norm([0.2, left ? 1 : -1, -0.5]))), thin));
      const still = 0.2 - len(lay);
      if (still > 0) lay = add(lay, mul(flat(along(chest, norm([-0.3, 0, -1]))), still));
    }
    const at = (more: number): { mid: V3; end: V3 } => reach(s, target, b.upperArm, b.foreArm, about(lay, dir, sign * (swing + more)));
    /** How far into the body an arm goes: 0 if it is clear of it. */
    const into = (r: { mid: V3; end: V3 }): number => {
      let sum = 0;
      // (the elbow itself; the forearm a third and two thirds of the way to the hand; the upper
      // arm two thirds of the way down it, which lies against the side of the chest and is let to)
      for (const [p, pad] of [[r.mid, b.pad + b.armR[1] * 0.8], [lerp3(r.mid, r.end, 0.35), b.pad * 0.8 + b.armR[1] * 0.8], [lerp3(r.mid, r.end, 0.7), b.pad * 0.8 + b.armR[2] * 0.8], [lerp3(s, r.mid, 0.66), b.pad * 0.3 + b.armR[0] * 0.4]] as [V3, number][]) {
        for (const o of trunk) sum += Math.max(0, 1 - within(o, p, pad));
      }
      return sum;
    };
    // THE ELBOW SLIDES ROUND OUT OF THE BODY, AND NO FURTHER THAN IT MUST: round the arm's own
    // line, from where the pose (or the two poses it is between) put it, DOWNHILL, to where what
    // it gains by being less in the body is no longer worth the turning. It is a weighing, not
    // a rule that the arm must be quite clear: a rule made the elbow JUMP, from where the pose
    // had it to the nearest clear place however far round, at the instant the pose's own place
    // stopped being clear. Weighed, it leaves that place little by little as the body presses on
    // it, and an arm may graze what is worn on the body (its padding) rather than fly out.
    // (What keeps it from ever being deep in the body, where downhill could be either way, is
    // `poleOf`: an elbow whose hand is across the body starts out away from the trunk.)
    const slid = ((): { mid: V3; end: V3; ok: boolean; more: number } => {
      const first = at(0);
      const p0 = into(first);
      if (p0 <= 0) return { ...first, ok: true, more: 0 };
      const STEP = 4;
      const cost = (m: number): number => PRESS * into(at(m)) + (m / 90) ** 2;
      const natural = awayFrom(b, torso, left, s, target);
      const from = flat(sub(first.mid, s));
      const to = flat(natural);
      // (how far round, by the pose's own measure, from where the elbow is to its natural place: the way to go if both ways are downhill alike)
      const round = len(from) < 1e-4 || len(to) < 1e-4 ? 0 : (sign * Math.atan2(dot(cross(from, to), dir), dot(from, to))) / D;
      const toward = round >= 0 ? 1 : -1;
      const c0 = PRESS * p0;
      const cT = cost(toward * STEP);
      const cO = cost(-toward * STEP);
      const way = cT <= cO ? toward : -toward;
      let here = Math.min(cT, cO);
      if (here >= c0) {
        // (it is at the bottom already, or within a step of it)
        let a = -STEP;
        let z = STEP;
        for (let i = 0; i < 8; i++) {
          const one = a + (z - a) / 3;
          const two = z - (z - a) / 3;
          if (cost(one) <= cost(two)) z = two;
          else a = one;
        }
        const m = (a + z) / 2;
        const r = at(m);
        return { ...r, ok: into(r) < HELD, more: m };
      }
      let m = STEP;
      for (; m + STEP <= 180; m += STEP) {
        const next = cost(way * (m + STEP));
        if (next >= here) break;
        here = next;
      }
      let a = way * (m - STEP);
      let z = way * (m + STEP);
      for (let i = 0; i < 8; i++) {
        const one = a + (z - a) / 3;
        const two = z - (z - a) / 3;
        if (cost(one) <= cost(two)) z = two;
        else a = one;
      }
      const best = (a + z) / 2;
      const r = at(best);
      return { ...r, ok: into(r) < HELD, more: best };
    })();
    // (which way the pose itself had the elbow, for the frames between this pose and its neighbours)
    const off = norm(flat(sub(at(0).mid, s)), hung);
    return { ...slid, pole: [dot(off, chest[0]), dot(off, chest[1]), dot(off, chest[2])] };
  };
  /** Is the left hand on the weapon (now, or on its way there or from there)? */
  const onWeapon = q.lhIn === 3 || (q.lh2 !== undefined && q.lh2[0] === 3);
  const handAt = (left: boolean, other: V3 | null): V3 => {
    const h = hand(left, other);
    if (!(left && onWeapon)) return freed(h);
    // (a hand on the weapon is where the weapon is: it is the other hand that is kept clear. But
    // one ON ITS WAY to the weapon or from it is kept out of the body like any other hand, the
    // more surely the further it is from the weapon.)
    if (q.lh2 === undefined) return h;
    const gone = q.lhIn === 3 ? k : 1 - k;
    return lerp3(h, freed(h), Math.min(1, gone * 3));
  };
  let right = arm(false, shoulderR, handAt(false, null));
  let left = arm(true, shoulderL, handAt(true, right.end));
  if (onWeapon) {
    // BOTH HANDS ON ONE HILT. The left arm has to come across the body to it, and on a broad
    // chest it may not be able to: the hilt is too far round, and the arm would have to go
    // through him. Then the WEAPON is brought forward and across, a little at a time, until
    // both arms hold it and neither goes through anything. (So a move written on one body is
    // good on another: a broader knight carries his hilt a hand's breadth further in front.)
    const short = (r: { end: V3 }, want: V3): boolean => len(sub(r.end, want)) > 0.6;
    let want = handAt(false, null);
    const held = (at: V3): boolean => {
      right = arm(false, shoulderR, at);
      const leftWant = hand(true, right.end);
      left = arm(true, shoulderL, leftWant);
      return left.ok && right.ok && !short(left, leftWant) && !short(right, at);
    };
    // (toward the front of the chest and its middle: where two hands can meet)
    const meet = add(lerp3(shoulderL, shoulderR, 0.5), add(mul(chest[0], b.ribDeep + b.pad + 6), mul(chest[2], -b.chest * 0.9)));
    const nearer = (from: V3, far: number): V3 => freed(add(from, mul(norm(sub(meet, from), chest[0]), far)));
    if (!held(want)) {
      for (let step = 0; step < 14; step++) {
        const next = nearer(want, 1.2);
        if (held(next)) {
          // (no further than it has to come: found finely, so that the hilt does not jump from frame to frame)
          let no = 0;
          let yes = 1.2;
          for (let i = 0; i < 5; i++) {
            const half = (no + yes) / 2;
            if (held(nearer(want, half))) yes = half;
            else no = half;
          }
          held(nearer(want, yes));
          break;
        }
        want = next;
      }
    }
  }

  // --- the legs: each foot is where it is put, and the knee finds itself ---
  const hipL = add(pelvis, along(hips, [0, b.hipHalf, 0]));
  const hipR = add(pelvis, along(hips, [0, -b.hipHalf, 0]));
  const legOf = (hip: V3, side: 1 | -1, fx: number, fy: number, fz: number, pitch: number, turn: number, knee: number, kneeUp: number): { knee: V3; ankle: V3; heel: V3; toe: V3 } => {
    const want2: V3 = [fx, side * b.stance + fy, b.ankle + fz];
    const r = reach(hip, want2, b.thigh, b.shank, heading(knee, kneeUp));
    const foot = (v: V3): V3 => rz(ry(v, pitch * D), turn * D);
    return { knee: r.mid, ankle: r.end, heel: add(r.end, foot([-b.heel, 0, -b.ankle])), toe: add(r.end, foot([b.ball, 0, -b.ankle])) };
  };
  const legL = legOf(hipL, 1, q.lfx, q.lfy, q.lfz, q.lfp, q.lft, q.lk, q.lkUp);
  const legR = legOf(hipR, -1, q.rfx, q.rfy, q.rfz, q.rfp, q.rft, q.rk, q.rkUp);

  return {
    pelvis, waist, ribs, neck, skull, head,
    shoulderL, shoulderR, elbowL: left.mid, elbowR: right.mid, handL: left.end, handR: right.end,
    hipL, hipR, kneeL: legL.knee, kneeR: legR.knee, ankleL: legL.ankle, ankleR: legR.ankle,
    heelL: legL.heel, heelR: legR.heel, toeL: legL.toe, toeR: legR.toe,
    hips, belly, chest, face, point, across,
    swungL: left.more, swungR: right.more, poleL: left.pole, poleR: right.pole,
  };
}

/**
 * The `le` (or `re`) that makes an elbow point as nearly toward `want` as its arm allows, in a
 * pose (whose own `le` and `re` are not looked at); of the numbers that mean that place, the one
 * nearest `near`. An archer's drawing elbow is behind the
 * arrow, in line with it; nothing about "hanging under the arm" would find that.
 */
export function elbowFor(b: Build, q: Posed, left: boolean, want: V3, near = 0): number {
  const s = solve(b, q);
  const from = left ? s.shoulderL : s.shoulderR;
  const dir = norm(sub(left ? s.handL : s.handR, from), [0, 0, -1]);
  const flat = (v: V3): V3 => sub(v, mul(dir, dot(v, dir)));
  const hung = flat(poleOf(b, s, left, from, left ? s.handL : s.handR));
  const to = flat(want);
  if (len(hung) < 1e-4 || len(to) < 1e-4) return 0;
  const turn = (left ? -1 : 1) * (Math.atan2(dot(cross(hung, to), dir), dot(hung, to)) / D);
  // (the same place is 360 degrees further round either way: the one nearest `near` is given, so
  // that an arm going from a pose with that swing to this one turns the short way)
  return turn - 360 * Math.round((turn - near) / 360);
}

// ---------------------------------------------------------------------------------------------
// Looked at

/**
 * From where a figure is looked at: `side` from its own right, square-on; `front` and `back` are
 * the game's two views (the camera is above and looks down along a diagonal of the grid: a figure
 * that faces down the screen and to the right is seen from in front, one that faces up it and to
 * the right from behind; the other two ways are these two in a mirror).
 *
 * THE VIEW FROM BEHIND IS OVER THE FIGURE'S LEFT SHOULDER, TURNED OVER AS IN A MIRROR. A hero
 * carries what he holds on his right, his chest turned toward it: seen from behind his right
 * shoulder (which is where the game's camera really is when he faces up the screen and to the
 * right) he is side-on and narrow, his sword across his own legs, and an archer who shoots away
 * from the eye shows it his chest. Seen from behind the other shoulder he shows his whole back;
 * and that picture, turned over, faces up the screen and to the right as it must. (So from behind
 * he holds his sword in the other hand; as he does already whenever the game turns a picture over
 * for one who faces left.) The light is laid on what is seen, so it still falls from the top left.
 */
export type View = 'side' | 'front' | 'back';

/** Along the grid, a length is this much across the screen and half as much up or down it, for every one of height. */
export const GRID = Math.sqrt(2 / 3);

/** Where a point of the figure is seen: across and down the picture from the figure's place on the floor, and how near the eye it is. */
export function project(p: V3, view: View): readonly [number, number, number] {
  if (view === 'side') return [p[0], -p[2], -p[1]];
  // (from behind: his left is to the right of the picture and his way forward up it, see above)
  const a = view === 'front' ? p[0] : p[1];
  const b = view === 'front' ? p[1] : p[0];
  return [GRID * (a + b), GRID * 0.5 * (a - b) - p[2], 0.612 * (a - b) + 0.5 * p[2]];
}
