// Placeholder art for the five regular monsters, painted in code at start-up (no image files).
//
//   skeleton  24x32, anchor (12, 29)  melee: bone white, rusty sword
//   archer    24x32, anchor (12, 29)  ranged: the same skeleton in a tattered red hood, with a bow
//   cultist   24x32, anchor (12, 29)  caster: purple robe, glowing eyes, conjures a flame
//   bat       20x28, anchor (10, 26)  swarmer: it flies, so its body floats well above the anchor
//   brute     34x40, anchor (17, 37)  heavy: an ogre with a club; its wind-up frame is the warning
//
// All frames face screen-RIGHT; the renderer mirrors them for screen-left.
//   front = facing the camera (down-right): we see the face.
//   back  = facing away (up-right): we see the back.
// The anchor is the floor point under the monster. As with the heroes, the foot nearer the camera
// stands on the row above the anchor and the other foot one row higher.
//
// How it is built (the same idea as heroes.ts):
//   - Each monster has a Pose (a handful of numbers) and one "rig" function that paints one frame
//     from a Pose. Parts that never change are small character maps ("stamps"); everything that
//     moves is placed by the Pose.
//   - An animation is a short list of Poses: see the *Poses functions. To change an animation,
//     change its numbers.
//   - Big overlapping parts (the brute's arms, the cultist's sleeves, the bow) are painted on
//     their own layers; each layer gets a 1 px ink outline before the layers are stacked, so a
//     part held in front of the body stays readable.

import { Px, rgba } from '../engine/px';
import type { Sprite } from '../engine/px';
import { P } from './palette';
import type { ActorArt, AnimSet } from './actor_types';

export type RegularMonster = 'skeleton' | 'archer' | 'cultist' | 'bat' | 'brute';

/** A pixel position or offset, [x, y]: x grows toward screen-right, y grows downward. */
type Pt = readonly [number, number];
/** The tones of one material: [shadow, mid, light]. */
type Ramp = readonly [string, string, string];
/** Which colour each letter of a stamp stands for. Letters that are not listed leave the pixel alone. */
type Key = Readonly<Record<string, string>>;

/** One monster's animations: one Pose per frame. */
interface Poses<T> {
  idle: ReadonlyArray<T>;
  walk: ReadonlyArray<T>;
  attack: ReadonlyArray<T>;
}

// ---------------------------------------------------------------------------------------------
// Small painting helpers

function add(a: Pt, b: Pt): Pt {
  return [a[0] + b[0], a[1] + b[1]];
}

/** Stack layers bottom to top. Each one is outlined first so overlapping parts stay separate. */
function stack(layers: ReadonlyArray<Px>): Px {
  const out = new Px(layers[0].w, layers[0].h);
  for (const l of layers) out.blit(l.outline(P.ink), 0, 0);
  return out;
}

/** Paint a small hand-drawn pixel map with its top-left corner at (x, y). `flip` mirrors it. */
function stamp(p: Px, x: number, y: number, rows: ReadonlyArray<string>, key: Key, flip = false): void {
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const c: string | undefined = key[row.charAt(flip ? row.length - 1 - i : i)];
      if (c) p.set(x + i, y + j, c);
    }
  }
}

/** The pixels of a straight line from a to b, in order. */
function linePts(a: Pt, b: Pt): Pt[] {
  const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    out.push([Math.round(a[0] + ((b[0] - a[0]) * i) / n), Math.round(a[1] + ((b[1] - a[1]) * i) / n)]);
  }
  return out;
}

/** A fat line of round blobs from pixel a to pixel b; its radius goes from r0 to r1. Limbs, sleeves, clubs. */
function thick(p: Px, a: Pt, b: Pt, r0: number, r1: number, c: string): void {
  const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const r = r0 + (r1 - r0) * t;
    p.ellipse(a[0] + (b[0] - a[0]) * t + 0.5, a[1] + (b[1] - a[1]) * t + 0.5, r, r, c);
  }
}

/**
 * Paint a shape on a scratch layer, light it from the top-left and copy it onto `dst`.
 * Pixels within `hi` diagonal steps of the shape's upper-left edge get the light tone, pixels
 * within `lo` steps of its lower-right edge the shadow tone, everything else the mid tone.
 */
function lit(dst: Px, ramp: Ramp, hi: number, lo: number, paint: (l: Px) => void): void {
  const l = new Px(dst.w, dst.h);
  paint(l);
  const nearEdge = (x: number, y: number, step: number, reach: number): boolean => {
    for (let k = 1; k <= reach; k++) if (!l.has(x + step * k, y + step * k)) return true;
    return false;
  };
  l.each((x, y) => {
    const light = nearEdge(x, y, -1, hi);
    const dark = nearEdge(x, y, 1, lo);
    return light === dark ? ramp[1] : light ? ramp[2] : ramp[0];
  });
  dst.blit(l, 0, 0);
}

/** Turn a monster's pose lists into finished sprites for both facings. */
function animate<T>(poses: (back: boolean) => Poses<T>, rig: (q: T, back: boolean) => Px, ax: number, ay: number): ActorArt {
  const facing = (back: boolean): AnimSet => {
    const frames = (list: ReadonlyArray<T>): Sprite[] => list.map((q) => rig(q, back).sprite(ax, ay));
    const q = poses(back);
    return { idle: frames(q.idle), walk: frames(q.walk), attack: frames(q.attack) };
  };
  return { front: facing(false), back: facing(true) };
}

// ---------------------------------------------------------------------------------------------
// The skeleton body, shared by the skeleton and the archer. It stands one pixel left of the
// anchor column so that the sword or bow has room on the right.

const BONE_W = 24;
const BONE_H = 32;
const BONE_AX = 12;
const BONE_AY = 29;
/** Sole row of the foot nearer the camera. The other foot stands one row higher. */
const BONE_FLOOR = 28;
/** Row of the hip joints when standing straight. */
const BONE_HIP = 21;

const BONE_KEY: Key = { a: P.bn4, b: P.bn3, c: P.bn2, d: P.bn1, e: P.er1, k: P.ink };

// 8 wide, rows 6..13. The face sits right of centre because the head is turned toward screen-right.
const SKULL_FRONT = [
  '..aaabb.',
  '.aaaabbc',
  'aabbbbbc',
  'abkkbkkc',
  'bbkkbkkc',
  '.bbbebbc',
  '..cadadc',
  '...cccc.',
];

const SKULL_BACK = [
  '..aaabb.',
  '.aaaabbc',
  'aaabdbbc',
  'aabbbdcc',
  'abbbbccc',
  '.bbbcccc',
  '..bcccd.',
  '...cd...',
];

// Shoulders, three ribs with dark gaps, and the bare spine at the waist. 8 wide, rows 14..19.
const RIBS_FRONT = [
  'abbbbbbc',
  '.eeecee.',
  '.abbbbc.',
  '.eeecee.',
  '..abbbc.',
  '....c...',
];

const RIBS_BACK = [
  'abbbbbbc',
  '.eeceee.',
  '.abbbbc.',
  '.eeceee.',
  '..abbc..',
  '...c....',
];

// 5 wide, rows 20..21. The legs hang from its two lower corners.
const PELVIS = ['abbbc', 'b..c.'];

/** The part of a pose every skeleton shares. */
interface BonePose {
  /** Upper body pushed down this many pixels (breathing, footfalls). The feet stay put. */
  bob: number;
  /** Upper body pushed toward screen-right (+) or left (-). */
  lean: number;
  /** Foot nearer the camera: [stride (+ forward, toward screen-right), pixels lifted off the floor]. */
  near: Pt;
  /** Foot further from the camera. */
  far: Pt;
}

/** One thin leg: thigh, shin and a foot whose toes point screen-right. */
function boneLeg(p: Px, hipX: number, hipY: number, stride: number, lifted: boolean, sole: number, c: string): void {
  const footX = hipX + stride;
  const kneeX = Math.round((hipX + footX) / 2) + (lifted ? 1 : 0); // a lifted leg bends at the knee
  const kneeY = Math.round((hipY + sole) / 2);
  p.line(hipX, hipY, kneeX, kneeY, c);
  p.line(kneeX, kneeY, footX, sole - 1, c);
  p.hline(footX, sole, 3, c);
}

function boneLegs(p: Px, q: BonePose, back: boolean): void {
  const hipY = BONE_HIP + q.bob;
  // The foot nearer the camera is the screen-left one when facing us, the screen-right one from behind.
  const nearX = back ? 12 : 9;
  const farX = back ? 9 : 12;
  // A step forward goes down the screen when facing the camera and up the screen when facing away.
  const slope = back ? -1 : 1;
  boneLeg(p, farX, hipY, q.far[0], q.far[1] > 0, BONE_FLOOR - 1 + slope * Math.sign(q.far[0]) - q.far[1], P.bn2);
  boneLeg(p, nearX, hipY, q.near[0], q.near[1] > 0, BONE_FLOOR + slope * Math.sign(q.near[0]) - q.near[1], P.bn3);
}

/** Pelvis, ribcage and skull. Only the ribcage and skull follow the lean. */
function boneTrunk(p: Px, q: BonePose, back: boolean): void {
  stamp(p, 9, 20 + q.bob, PELVIS, BONE_KEY);
  stamp(p, 7 + q.lean, 14 + q.bob, back ? RIBS_BACK : RIBS_FRONT, BONE_KEY);
  stamp(p, 8 + q.lean, 6 + q.bob, back ? SKULL_BACK : SKULL_FRONT, BONE_KEY);
}

/** Shoulder joints: [screen-left, screen-right]. */
function boneShoulders(q: BonePose): [Pt, Pt] {
  return [
    [7 + q.lean, 14 + q.bob],
    [14 + q.lean, 14 + q.bob],
  ];
}

/** A two-bone arm from shoulder `s`. `elbow` and `hand` are offsets from the shoulder. */
function boneArm(p: Px, s: Pt, elbow: Pt, hand: Pt, c: string): void {
  const e = add(s, elbow);
  const h = add(s, hand);
  p.line(s[0], s[1], e[0], e[1], c);
  p.line(e[0], e[1], h[0], h[1], c);
  p.set(h[0], h[1], P.bn4);
}

/** Where an arm bends when the pose does not say: halfway to the hand, pushed `out` pixels sideways. */
function midElbow(hand: Pt, out: number): Pt {
  return [Math.round(hand[0] / 2) + out, Math.round(hand[1] / 2)];
}

// ---------------------------------------------------------------------------------------------
// Skeleton: bone white, dark eye sockets, visible ribs, a rusty sword.

interface SkeletonPose extends BonePose {
  /** Sword hand, as an offset from the sword-arm shoulder. */
  hand: Pt;
  /** Sword-arm elbow, as an offset from the shoulder. Left out: the arm is nearly straight. */
  elbow?: Pt;
  /** Sword tip, as an offset from the hand. */
  tip: Pt;
  /** Free hand, as an offset from its shoulder. */
  off: Pt;
}

/** A rusty sword held at `hand`, its tip at hand + `tip`. */
function sword(p: Px, hand: Pt, tip: Pt): void {
  const pts = linePts(hand, add(hand, tip));
  const steep = Math.abs(tip[1]) >= Math.abs(tip[0]);
  // The blade is two pixels wide: a rust line through the hand and a steel edge up-left of it.
  const ex = steep ? -1 : 0;
  const ey = steep ? 0 : -1;
  // pommel, one step behind the hand
  p.set(2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1], P.er3);
  // cross-guard, at right angles to the blade
  const g = pts[1];
  if (steep) p.hline(g[0] - 1, g[1], 3, P.gd1);
  else p.vline(g[0], g[1] - 1, 3, P.gd1);
  for (let i = 2; i < pts.length; i++) {
    const last = i === pts.length - 1; // the edge stops one pixel short: a pointed tip
    p.set(pts[i][0], pts[i][1], last ? P.sl3 : P.er4);
    if (!last) p.set(pts[i][0] + ex, pts[i][1] + ey, P.sl3);
  }
}

function skeleton(q: SkeletonPose, back: boolean): Px {
  const [sl, sr] = boneShoulders(q);
  const elbow = q.elbow ?? midElbow(q.hand, 0);
  const offElbow = midElbow(q.off, -1);
  const p = new Px(BONE_W, BONE_H);
  // Facing the camera the sword arm is the far one; facing away it is the free arm.
  if (back) boneArm(p, sl, offElbow, q.off, P.bn2);
  boneLegs(p, q, back);
  boneTrunk(p, q, back);
  if (!back) boneArm(p, sl, offElbow, q.off, P.bn3);
  sword(p, add(sr, q.hand), q.tip);
  boneArm(p, sr, elbow, q.hand, back ? P.bn3 : P.bn2);
  return p.outline(P.ink);
}

function skeletonPoses(back: boolean): Poses<SkeletonPose> {
  const rest: SkeletonPose = { bob: 0, lean: 0, near: [0, 0], far: [0, 0], hand: [3, 5], tip: [4, -9], off: [0, 6] };
  return {
    idle: [rest, { ...rest, bob: 1 }],
    // contact, passing, contact on the other foot, passing
    walk: [
      { ...rest, bob: 1, near: [2, 0], far: [-2, 0], off: [-1, 6] },
      { ...rest, far: [0, 2] },
      { ...rest, bob: 1, near: [-2, 0], far: [2, 0], off: [1, 6] },
      { ...rest, near: [0, 2] },
    ],
    attack: [
      // sword raised high beside the skull, tip tilted back
      { bob: 0, lean: -1, near: [-1, 0], far: [1, 0], hand: [4, -5], elbow: [4, -1], tip: [-2, -8], off: [1, 5] },
      // chopped forward: down the screen when facing us, up the screen when facing away
      { bob: 1, lean: 1, near: [-2, 0], far: [2, 0], hand: [1, 1], tip: back ? [6, -3] : [6, 6], off: [-2, 5] },
      { bob: 1, lean: 0, near: [-1, 0], far: [1, 0], hand: [3, 3], tip: back ? [4, -1] : [4, 4], off: [-1, 6] },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Archer: the same skeleton under a tattered dull-red hood and scarf, holding a bow.

interface ArcherPose extends BonePose {
  /** Bow grip, as an offset from the bow-arm shoulder. */
  grip: Pt;
  /** String hand, as an offset from its shoulder. */
  pull: Pt;
  /** String-arm elbow, as an offset from the shoulder. Left out: the arm hangs. */
  elbow?: Pt;
  /** Bowstring: 1 = drawn back to the string hand with an arrow on it, 0 = at rest, -1 = snapping forward just after the release. */
  string: number;
  /** Scarf tail flutter: 0 or 1. */
  flap: number;
}

const CLOTH_KEY: Key = { R: P.bl3, r: P.bl2, c: P.bn2, q: P.wd3, w: P.wd2, f: P.bn4 };

// 9 wide, rows 5..12, over the skull. The face stays open; its brow is in the hood's shadow.
const HOOD_FRONT = [
  '..RRRRRr.',
  '.RRRRRRRr',
  'RRRRRRrrr',
  'RRccccccc',
  'RR.......',
  'Rr.......',
  'Rr.......',
  '.r.......',
];

const HOOD_BACK = [
  '..RRRRRr.',
  '.RRRRRRRr',
  'RRRRRRRrr',
  'RRRRRRrrr',
  'RRRRRrrrr',
  'RRRRrrrrr',
  '.RRrrrrrr',
  '..Rrrrrr.',
];

// Scarf round the neck and over the shoulders, with a ragged lower edge. 8 wide, rows 13..15.
const SCARF = ['..RRRrrr', 'RRRRRrrr', '.R.R..r.'];

// The loose end of the scarf: it streams out behind when we see the face, and hangs down the back otherwise.
const TAIL_FRONT = [
  ['....R', '...R.', '...r.', '..r..'],
  ['...RR', '..Rr.', '.r...', '.....'],
];
const TAIL_BACK = [
  ['Rr', 'Rr', 'R.', '.r'],
  ['Rr', 'Rr', '.r', 'R.'],
];

// Quiver slung across the back, arrow feathers at the top. 4 wide.
const QUIVER = ['...f', '..qf', '..qw', '.qw.', '.qw.', 'qw..', 'qw..'];

function cowl(p: Px, q: ArcherPose, back: boolean): void {
  const x = 7 + q.lean;
  const y = 5 + q.bob;
  stamp(p, x, y, back ? HOOD_BACK : HOOD_FRONT, CLOTH_KEY);
  stamp(p, x, y + 8, SCARF, CLOTH_KEY);
  if (back) {
    stamp(p, x + 4, y + 7, QUIVER, CLOTH_KEY);
    stamp(p, x + 2, y + 10, TAIL_BACK[q.flap ? 1 : 0], CLOTH_KEY);
  } else {
    stamp(p, x - 5, y + 9, TAIL_FRONT[q.flap ? 1 : 0], CLOTH_KEY);
  }
}

/** How far each row of a bow limb sits behind the grip, by distance from the grip. */
const BOW_BEND = [0, 0, 0, -1, -1, -2, -3];

/** The bow's wooden limbs, held upright by the grip at g, belly toward screen-right. 13 tall. */
function bow(p: Px, g: Pt): void {
  for (let t = -6; t <= 6; t++) p.set(g[0] + BOW_BEND[Math.abs(t)], g[1] + t, t <= 0 ? P.wd4 : P.wd3);
}

function arrow(p: Px, from: Pt, to: Pt): void {
  const pts = linePts(from, to);
  pts.forEach((pt, i) => p.set(pt[0], pt[1], i === 0 ? P.bn4 : i >= pts.length - 2 ? P.sl5 : P.wd5));
}

function archer(q: ArcherPose, back: boolean): Px {
  const [sl, sr] = boneShoulders(q);
  const grip = add(sr, q.grip);
  const pull = add(sl, q.pull);
  const pullElbow = q.elbow ?? midElbow(q.pull, -1);
  const bowElbow = midElbow(q.grip, 0);
  const drawn = q.string > 0;

  const weapon = new Px(BONE_W, BONE_H);
  bow(weapon, grip);
  // The arrow points down the screen when the archer faces us and up the screen when it faces away.
  if (drawn) arrow(weapon, [pull[0] + 1, pull[1]], [Math.min(BONE_W - 2, grip[0] + 2), grip[1] + (back ? -1 : 1)]);
  // Facing away, the bow arm belongs to the bow's layer: one shape, so no outline cuts the bow in two.
  if (back) boneArm(weapon, sr, bowElbow, q.grip, P.bn3);
  weapon.set(grip[0], grip[1], P.bn4); // the bow hand

  // The string is a single pixel wide and has no outline, or it would turn the bow into a blob.
  const strings = new Px(BONE_W, BONE_H);
  const sx = grip[0] - 3;
  const mid: Pt = drawn ? pull : [sx + (q.string < 0 ? 1 : 0), grip[1]];
  strings.line(sx, grip[1] - 5, mid[0], mid[1], P.bn2);
  strings.line(mid[0], mid[1], sx, grip[1] + 5, P.bn2);

  const body = new Px(BONE_W, BONE_H);
  // far arm first, near arm last: the bow arm is the far one when the archer faces us
  if (back) boneArm(body, sl, pullElbow, q.pull, P.bn2);
  else boneArm(body, sr, bowElbow, q.grip, P.bn2);
  boneLegs(body, q, back);
  boneTrunk(body, q, back);
  cowl(body, q, back);
  if (!back) boneArm(body, sl, pullElbow, q.pull, P.bn3);

  // Facing away, the bow and its string are beyond the archer, so the body covers them.
  return back ? stack([weapon]).blit(strings, 0, 0).blit(stack([body]), 0, 0) : stack([body, weapon]).blit(strings, 0, 0);
}

function archerPoses(back: boolean): Poses<ArcherPose> {
  // Facing away, the bow is held closer in, so the string runs right beside the body.
  const rest: ArcherPose = { bob: 0, lean: 0, near: [0, 0], far: [0, 0], grip: back ? [5, 3] : [6, 3], pull: [0, 6], string: 0, flap: 0 };
  return {
    idle: [rest, { ...rest, bob: 1, flap: 1 }],
    walk: [
      { ...rest, bob: 1, near: [2, 0], far: [-2, 0], pull: [-1, 6], flap: 1 },
      { ...rest, far: [0, 2] },
      { ...rest, bob: 1, near: [-2, 0], far: [2, 0], pull: [1, 6], flap: 1 },
      { ...rest, near: [0, 2] },
    ],
    attack: [
      // draw: bow arm straight, string hand back at the jaw, elbow out behind
      {
        bob: 0,
        lean: -1,
        near: [-1, 0],
        far: [1, 0],
        grip: back ? [7, -2] : [7, 1],
        pull: back ? [6, -2] : [6, 0],
        elbow: [-3, 1],
        string: 1,
        flap: 1,
      },
      // release: bow pushed forward, string snapping; the string hand stays where it let go
      { bob: 0, lean: 1, near: [-1, 0], far: [2, 0], grip: back ? [6, -2] : [6, 1], pull: [4, 0], elbow: [-3, 1], string: -1, flap: 0 },
      { bob: 1, lean: 0, near: [0, 0], far: [1, 0], grip: back ? [5, 1] : [6, 2], pull: [1, 5], string: 0, flap: 1 },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Cultist: a dark purple hooded robe, two glowing eyes, pale hands held out. Casts fire.

const CULT_W = 24;
const CULT_H = 32;
const CULT_AX = 12;
const CULT_AY = 29;
/** Last row of the robe. The shoes show on the row below it. */
const ROBE_HEM = 27;

const ROBE: Ramp = [P.pu1, P.pu2, P.pu3];
const CULT_KEY: Key = { h: P.pu3, m: P.pu2, s: P.pu1, T: P.pu4, k: P.ink, E: P.fr5, o: P.fr4, y: P.fr5, w: P.fr6 };

// 9 wide, rows 6..13. A lit rim round a pitch-dark opening with two ember eyes.
const CULT_HOOD_FRONT = [
  '...hhh...',
  '..hhhmm..',
  '.hhhmmmm.',
  'hhmTTTTTs',
  'hhTkkkkks',
  'hmTkEkEks',
  'mmTkkkkks',
  '.mmssssss',
];

const CULT_HOOD_BACK = [
  '...hhh...',
  '..hhhmm..',
  '.hhhsmmm.',
  'hhhmsmmms',
  'hhmmsmmss',
  'hmmmsmsss',
  'mmmmmssss',
  '.mmmssss.',
];

// Flames by size: 1 a dying ember, 2 gathered over the head, 3 the cast itself.
const FLAMES: ReadonlyArray<ReadonlyArray<string>> = [
  [],
  ['.o.', 'oyo', '.o.'],
  ['.o...', '.oyo.', 'oywyo', 'oywyo', '.oyo.'],
  ['..o..', '.oy..', '.oyo.', 'oyyyo', 'oywyo', 'oywyo', '.oyo.'],
];

interface CultistPose {
  /** Upper body pushed down this many pixels. The hem stays on the floor. */
  bob: number;
  /** Hood and shoulders pushed toward screen-right (+) or left (-). */
  lean: number;
  /** The hem of the robe swings this many pixels sideways. */
  sway: number;
  /** Columns where a shoe shows under the hem. */
  feet: ReadonlyArray<number>;
  /** Hands (2x2 pixels, this is their top-left corner), as offsets from the screen-left and screen-right shoulder. */
  left: Pt;
  right: Pt;
  /** Flame size, 0 (none) to 3. */
  flame: number;
  /** Where the flame burns: [centre column, bottom row]. */
  flameAt: Pt;
}

/** A wide sleeve from shoulder `s` to a pale hand at s + `hand`. */
function sleeve(p: Px, s: Pt, hand: Pt): void {
  const h = add(s, hand);
  const n = Math.hypot(hand[0], hand[1]) || 1;
  // the cuff stops two pixels short of the hand
  const cuff: Pt = [h[0] - (hand[0] / n) * 2, h[1] - (hand[1] / n) * 2];
  lit(p, ROBE, 1, 1, (l) => thick(l, s, cuff, 1.5, 2, ROBE[1]));
  p.rect(h[0], h[1], 2, 2, P.sk3);
  p.set(h[0], h[1], P.sk4);
}

/** The robe: a bell from the shoulders to the hem, with shoes peeking out underneath. */
function robe(p: Px, q: CultistPose, back: boolean): void {
  const top = 14 + q.bob;
  // the shoulders follow the lean; the hem stays over the feet and swings with the stride
  const shift = (y: number): number => (y <= top + 3 ? q.lean : y >= 23 ? q.sway : 0);
  // a broad lit side and only a thin shadow edge: the robe must not sink into the dark floor
  lit(p, ROBE, 3, 1, (l) => {
    for (let y = top; y <= ROBE_HEM; y++) {
      const flare = y >= 20 ? 1 : 0;
      l.hline(7 - flare + shift(y), y, 9 + 2 * flare, ROBE[1]);
    }
  });
  for (let y = top; y <= ROBE_HEM; y++) {
    const x = shift(y);
    if (back) {
      if (y >= top + 2) p.set(10 + x, y, P.pu1); // fold down the middle of the back
    } else {
      p.set(12 + x, y, P.pu4); // trim down the front
      if (y >= 20) p.set(9 + x, y, P.pu1); // folds in the skirt
      if (y >= 21) p.set(14 + x, y, P.pu1);
    }
  }
  for (const f of q.feet) p.hline(f, ROBE_HEM + 1, 2, P.er3);
}

function flame(p: Px, size: number, at: Pt): void {
  const rows = FLAMES[Math.max(0, Math.min(FLAMES.length - 1, size))];
  if (rows.length === 0) return;
  stamp(p, at[0] - Math.floor(rows[0].length / 2), at[1] - rows.length + 1, rows, CULT_KEY);
}

function cultist(q: CultistPose, back: boolean): Px {
  const sl: Pt = [7 + q.lean, 15 + q.bob];
  const sr: Pt = [15 + q.lean, 15 + q.bob];
  const layer = (): Px => new Px(CULT_W, CULT_H);
  const far = layer();
  const body = layer();
  const near = layer();
  const fire = layer();
  // The arm nearer the camera is the screen-left one when facing us, the screen-right one from behind.
  sleeve(back ? far : near, sl, q.left);
  sleeve(back ? near : far, sr, q.right);
  robe(body, q, back);
  stamp(body, 7 + q.lean, 6 + q.bob, back ? CULT_HOOD_BACK : CULT_HOOD_FRONT, CULT_KEY);
  flame(fire, q.flame, q.flameAt);
  return stack([far, body, near, fire]);
}

function cultistPoses(back: boolean): Poses<CultistPose> {
  const rest: CultistPose = { bob: 0, lean: 0, sway: 0, feet: [8, 13], left: [3, 6], right: [3, 3], flame: 0, flameAt: [0, 0] };
  return {
    idle: [rest, { ...rest, bob: 1 }],
    // the robe hides the legs, so the walk is carried by the swinging hem, the shoes and the hands
    walk: [
      { ...rest, bob: 1, sway: -1, feet: [7, 14], left: [2, 6], right: [4, 3] },
      { ...rest, feet: [11] },
      { ...rest, bob: 1, sway: 1, feet: [8, 13], left: [4, 6], right: [2, 3] },
      { ...rest, feet: [10] },
    ],
    attack: [
      // both hands raised, a flame gathering between them over the hood
      { ...rest, bob: 1, left: [-2, -10], right: [3, -10], flame: 2, flameAt: [11, 5] },
      // both hands thrust forward with the full flame between them
      {
        ...rest,
        bob: 1,
        lean: 1,
        left: back ? [9, 0] : [9, 3],
        right: back ? [2, -7] : [2, -4],
        flame: 3,
        flameAt: back ? [20, 16] : [20, 19],
      },
      { ...rest, left: [5, 4], right: [4, 1], flame: 1, flameAt: back ? [20, 13] : [20, 14] },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Bat: a dark furry ball with ears, red eyes and lighter wing membranes. It flies: the body
// hovers about 10 px above the anchor and nothing touches the ground (the game draws the shadow).

const BAT_W = 20;
const BAT_H = 28;
const BAT_AX = 10;
const BAT_AY = 26;

const BAT_KEY: Key = { b: P.pu2, s: P.er2, m: P.pu3, E: P.bl4, F: P.bn4, r: P.bl2, k: P.bl1 };

// 7 wide, 9 tall: ears, head, belly, feet. Painted with the body centre on its 4th column, 6th row.
const BAT_FRONT = [
  '.b...b.',
  'bb...bb',
  'mmbbbbs',
  'mbbbbbs',
  'bbEEbEE',
  'bbbbbss',
  '.bsssss',
  '.bssss.',
  '..s.s..',
];

const BAT_BACK = [
  '.b...b.',
  'bb...bb',
  'mmbbbbs',
  'mbbbbbs',
  'bbbbbss',
  'bbbbbss',
  '.bbbsss',
  '.bbsss.',
  '..s.s..',
];

// Mouths, painted over rows 5..7 of the front body.
const MOUTH_FANGS = ['bbbFrFs'];
const MOUTH_OPEN = ['bbbFrFs', '.bsrkrs', '.bsrrr.'];

/** One wing shape: its rows, and the row (relative to the body centre) where the first one goes. */
interface Wing {
  top: number;
  rows: ReadonlyArray<string>;
}

// The screen-right wing; the other one is its mirror image. b = arm and finger bones, m = membrane.
const WING_UP: Wing = {
  top: -8,
  rows: ['....b', '...bm', '..bmm', '.bmmm', '.bmbm', 'bmmbm', 'bmbm.', 'mmm..', 'mm...', 'm....'],
};
const WING_LEVEL: Wing = {
  top: -3,
  rows: ['.bbb.', 'bmmmb', 'mmbmm', 'mmbmm', 'mm.mm', 'm...m'],
};
const WING_DOWN: Wing = {
  top: -2,
  rows: ['bb...', 'mmb..', 'mmmb.', 'mmmmb', '.mbmm', '..mmm', '...mm', '....m'],
};

// Both wings swept back behind the body for the lunge. 6 wide, left of the body.
const SWEPT_HIGH = ['b.....', 'mbb...', 'mmmbb.', '.mmmmb', '..mmmm', '...mmm', '.....m'];
const SWEPT_LOW = ['...bbb', 'bbbmmm', 'mmmmmm', '.mm.mm', '..m...'];

interface BatPose {
  /** Body offset from its hovering spot. */
  dx: number;
  dy: number;
  /** Wings: 1 up, 0 level, -1 down, 2 swept back (the lunge). */
  wing: number;
  /** Mouth: 0 shut, 1 fangs bared, 2 wide open. */
  mouth: number;
}

function bat(q: BatPose, back: boolean): Px {
  const cx = 10 + q.dx;
  const cy = 13 + q.dy;
  const p = new Px(BAT_W, BAT_H);
  if (q.wing === 2) {
    stamp(p, cx - 9, cy - 8, SWEPT_HIGH, BAT_KEY);
    stamp(p, cx - 9, cy - 1, SWEPT_LOW, BAT_KEY);
  } else {
    const wing = q.wing > 0 ? WING_UP : q.wing < 0 ? WING_DOWN : WING_LEVEL;
    stamp(p, cx + 4, cy + wing.top, wing.rows, BAT_KEY);
    stamp(p, cx - 8, cy + wing.top, wing.rows, BAT_KEY, true);
  }
  stamp(p, cx - 3, cy - 5, back ? BAT_BACK : BAT_FRONT, BAT_KEY);
  if (!back && q.mouth > 0) stamp(p, cx - 3, cy, q.mouth > 1 ? MOUTH_OPEN : MOUTH_FANGS, BAT_KEY);
  return p.outline(P.ink);
}

function batPoses(back: boolean): Poses<BatPose> {
  // The lunge dives down the screen when the bat faces us and climbs up the screen when it faces away.
  const dive = back ? -1 : 1;
  return {
    idle: [
      { dx: 0, dy: 1, wing: 1, mouth: 0 },
      { dx: 0, dy: 0, wing: -1, mouth: 0 },
    ],
    walk: [
      { dx: 0, dy: 1, wing: 1, mouth: 0 },
      { dx: 0, dy: 0, wing: 0, mouth: 0 },
      { dx: 0, dy: 0, wing: -1, mouth: 0 },
      { dx: 0, dy: 1, wing: 0, mouth: 0 },
    ],
    attack: [
      { dx: -1, dy: -dive, wing: 1, mouth: 1 },
      { dx: 3, dy: 2 * dive, wing: 2, mouth: 2 },
      { dx: 0, dy: dive, wing: 0, mouth: 1 },
    ],
  };
}

// ---------------------------------------------------------------------------------------------
// Brute: a hulking ogre. Grey-green skin, tiny head, huge arms, a big wooden club.

const BRUTE_W = 34;
const BRUTE_H = 40;
const BRUTE_AX = 17;
const BRUTE_AY = 37;
/** Sole row of the foot nearer the camera. The other foot stands one row higher. */
const BRUTE_FLOOR = 36;

const SKIN: Ramp = [P.er3, P.gn2, P.gn3];
/** Limbs on the far side of the body sit in its shadow. */
const SKIN_FAR: Ramp = [P.er3, P.gn2, P.gn2];
const WOOD: Ramp = [P.wd2, P.wd3, P.wd4];
const HIDE: Ramp = [P.wd1, P.wd2, P.wd3];
const BRUTE_KEY: Key = { h: P.gn3, m: P.gn2, s: P.er3, Y: P.gd4, T: P.bn4, k: P.ink };

// 9 wide, rows 8..14: heavy brow, small yellow eyes, tusks jutting up from the lower jaw, an ear each side.
const BRUTE_HEAD_FRONT = [
  '..hhhhm..',
  '.hhhhhmm.',
  '.hssssss.',
  'hhmmYmYsm',
  '.hhTmmmT.',
  '.hmTkkkT.',
  '..mmmss..',
];

const BRUTE_HEAD_BACK = [
  '..hhhhm..',
  '.hhhhhmm.',
  '.hhhmmmm.',
  'hhhmmmmsm',
  '.hmmmmss.',
  '.mmmmsss.',
  '..mmsss..',
];

interface BrutePose {
  /** Upper body pushed down this many pixels. */
  bob: number;
  /** Upper body pushed toward screen-right (+) or left (-). */
  lean: number;
  /** Feet: [stride, pixels lifted off the floor], as for the skeletons. */
  near: Pt;
  far: Pt;
  /** Club fist, as an offset from the club-arm shoulder. */
  fist: Pt;
  /** Club head, as an offset from the club fist. */
  club: Pt;
  /** Other fist, as an offset from its shoulder. */
  off: Pt;
}

/** One stumpy leg: a column with toes pointing screen-right. */
function bruteLeg(p: Px, x: number, top: number, sole: number, ramp: Ramp): void {
  lit(p, ramp, 1, 2, (l) => {
    l.rect(x, top, 5, sole - top + 1, ramp[1]);
    l.rect(x + 5, sole - 1, 1, 2, ramp[1]);
  });
}

/** Make one skin pixel a tone darker: used for creases. */
function crease(p: Px, x: number, y: number): void {
  const c = p.get(x, y);
  if (c === P.gn3) p.set(x, y, P.gn2);
  else if (c === P.gn2) p.set(x, y, P.er3);
}

/** Legs, barrel torso, loincloth and head. */
function bruteBody(p: Px, q: BrutePose, back: boolean): void {
  const slope = back ? -1 : 1;
  const top = 27 + q.bob;
  bruteLeg(p, (back ? 11 : 19) + q.far[0], top, BRUTE_FLOOR - 1 + slope * Math.sign(q.far[0]) - q.far[1], SKIN_FAR);
  bruteLeg(p, (back ? 19 : 11) + q.near[0], top, BRUTE_FLOOR + slope * Math.sign(q.near[0]) - q.near[1], SKIN);

  const head = (): void => stamp(p, 15 + q.lean, 8 + q.bob, back ? BRUTE_HEAD_BACK : BRUTE_HEAD_FRONT, BRUTE_KEY);
  if (back) head(); // seen from behind, the hunched back hides the lower half of the head

  // the torso leans half as far as the head and shoulders
  lit(p, SKIN, 4, 3, (l) => l.ellipse(17.5 + q.lean / 2, 20.5 + q.bob, 9.5, 8.5, SKIN[1]));
  const tx = 17 + Math.round(q.lean / 2);
  const ty = 20 + q.bob;
  if (back) {
    for (let y = ty - 5; y <= ty + 5; y++) crease(p, tx - 2, y); // spine
    for (let i = 0; i < 3; i++) {
      crease(p, tx - 6 + i, ty - 3 + i); // shoulder blades
      crease(p, tx + 4 - i, ty - 3 + i);
    }
  } else {
    for (let i = 0; i < 5; i++) {
      crease(p, tx - 5 + i, ty - 1); // under the chest
      crease(p, tx + 2 + i, ty - 1);
    }
    crease(p, tx + 1, ty + 4); // navel
  }

  // loincloth: a band round the hips and a flap between the legs
  lit(p, HIDE, 1, 1, (l) => {
    l.rect(10, 26 + q.bob, 15, 4, HIDE[1]);
    l.rect(14, 30 + q.bob, 7, 3, HIDE[1]);
  });
  if (!back) {
    p.rect(17, 26 + q.bob, 2, 2, P.bn3); // bone buckle
    p.set(17, 26 + q.bob, P.bn4);
    head();
  }
}

/** A huge arm: shoulder ball, forearm thicker than the upper arm, and a fist at `fist`. */
function bruteArm(p: Px, s: Pt, fist: Pt, ramp: Ramp): void {
  const hanging = fist[1] > s[1] + 4;
  // a hanging arm bows outward at the elbow
  const elbow: Pt = [(s[0] + fist[0]) / 2 + (hanging ? Math.sign(s[0] - BRUTE_AX) : 0), (s[1] + fist[1]) / 2];
  lit(p, ramp, 2, 2, (l) => {
    thick(l, s, elbow, 3.4, 2.6, ramp[1]);
    thick(l, elbow, fist, 2.6, 3.2, ramp[1]);
  });
}

/** The club: a thin handle through the fist that swells into a heavy head. */
function club(p: Px, fist: Pt, head: Pt): void {
  const n = Math.hypot(head[0] - fist[0], head[1] - fist[1]) || 1;
  const ux = (head[0] - fist[0]) / n;
  const uy = (head[1] - fist[1]) / n;
  const butt: Pt = [fist[0] - ux * 3, fist[1] - uy * 3];
  // the handle stays thin for the first third of the way to the head
  const neck: Pt = [fist[0] + ux * n * 0.3, fist[1] + uy * n * 0.3];
  lit(p, WOOD, 1, 2, (l) => {
    thick(l, butt, neck, 1, 1.2, WOOD[1]);
    thick(l, neck, head, 1.2, 3, WOOD[1]);
  });
  // two dark knots in the thick end, one on each side of the grain
  for (const [t, side] of [[0.6, 1], [0.9, -1]] as const) {
    const x = Math.round(fist[0] + ux * n * t - uy * side);
    const y = Math.round(fist[1] + uy * n * t + ux * side);
    if (p.get(x, y) === P.wd3) p.set(x, y, P.wd2);
  }
}

function brute(q: BrutePose, back: boolean): Px {
  const sl: Pt = [8 + q.lean, 15 + q.bob];
  const sr: Pt = [26 + q.lean, 15 + q.bob];
  const fist = add(sr, q.fist);
  const off = add(sl, q.off);
  const layer = (): Px => new Px(BRUTE_W, BRUTE_H);
  const farArm = layer();
  const body = layer();
  const weapon = layer();
  const nearArm = layer();
  // The club is always on the screen-right side: that arm is the far one when the brute faces us.
  bruteArm(back ? farArm : nearArm, sl, off, back ? SKIN_FAR : SKIN);
  bruteArm(back ? nearArm : farArm, sr, fist, back ? SKIN : SKIN_FAR);
  bruteBody(body, q, back);
  // The club is painted last, with the fist that holds it on top of the handle, so the whole
  // club stays visible even when an arm passes behind it.
  club(weapon, fist, add(fist, q.club));
  lit(weapon, SKIN, 2, 2, (l) => thick(l, fist, fist, 3.2, 3.2, SKIN[1]));
  return stack([farArm, body, nearArm, weapon]);
}

function brutePoses(back: boolean): Poses<BrutePose> {
  // club held low, its head resting on the floor beside the right foot
  const rest: BrutePose = { bob: 0, lean: 0, near: [0, 0], far: [0, 0], fist: [1, 7], club: [2, 11], off: [-2, 14] };
  return {
    idle: [rest, { ...rest, bob: 1, club: [2, 10] }],
    walk: [
      { ...rest, bob: 1, near: [2, 0], far: [-2, 0], club: [2, 10], off: [-3, 13] },
      { ...rest, far: [0, 2] },
      { ...rest, bob: 1, near: [-2, 0], far: [2, 0], club: [2, 10], off: [-1, 14] },
      { ...rest, near: [0, 2] },
    ],
    attack: [
      // THE WARNING: crouched, both fists over the head, club cocked back as high as the canvas allows
      { bob: 2, lean: -1, near: [-1, 0], far: [1, 0], fist: [-4, -10], club: [-11, -3], off: [10, -11] },
      // slammed down in front: beside the feet when facing us, further up the screen when facing away
      {
        bob: 2,
        lean: 2,
        near: [-1, 0],
        far: [2, 0],
        fist: back ? [-4, 4] : [-5, 10],
        club: back ? [5, 4] : [6, 6],
        off: back ? [11, 3] : [11, 8],
      },
      { bob: 1, lean: 1, near: [-1, 0], far: [1, 0], fist: [-2, 9], club: back ? [4, 4] : [4, 8], off: [-2, 13] },
    ],
  };
}

// ---------------------------------------------------------------------------------------------

/** The same picture with some colours swapped for others: `swaps` lists [from, to] pairs. */
function recolour(p: Px, swaps: ReadonlyArray<readonly [string, string]>): Px {
  const out = p.clone();
  const d = out.d;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    for (const [from, to] of swaps) {
      const f = rgba(from);
      if (d[i] !== f[0] || d[i + 1] !== f[1] || d[i + 2] !== f[2]) continue;
      const t = rgba(to);
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
      break;
    }
  }
  return out;
}

/** A guardian is a brute with blood-red skin and ember eyes, so it is never mistaken for one. */
const GUARDIAN_SWAPS: ReadonlyArray<readonly [string, string]> = [
  [P.gn3, P.bl3],
  [P.gn2, P.bl2],
  [P.er3, P.bl1],
  [P.gd4, P.fr6],
];

/**
 * The guardian: the powerful monster at the end of a side branch. The same frames as the brute
 * in its own colours; the renderer draws it larger.
 */
export function makeGuardianArt(): ActorArt {
  return animate(brutePoses, (q, back) => recolour(brute(q, back), GUARDIAN_SWAPS), BRUTE_AX, BRUTE_AY);
}

/** Paint every regular monster. Call once at start-up and keep the result. */
export function makeMonsterArt(): Record<RegularMonster, ActorArt> {
  return {
    skeleton: animate(skeletonPoses, skeleton, BONE_AX, BONE_AY),
    archer: animate(archerPoses, archer, BONE_AX, BONE_AY),
    cultist: animate(cultistPoses, cultist, CULT_AX, CULT_AY),
    bat: animate(batPoses, bat, BAT_AX, BAT_AY),
    brute: animate(brutePoses, brute, BRUTE_AX, BRUTE_AY),
  };
}
