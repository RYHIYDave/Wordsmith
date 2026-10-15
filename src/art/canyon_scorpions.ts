// FLOOR 8'S MEDIUM MOBS, THE CANYON SCORPIONS OF ECHO CANYON: a mock-up (nothing of the game imports this file;
// `SCORPION_ON` is off).
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (15 Oct, by 08:15, each his pick, the labels as
// he tapped them): what it is, and where it lives, “Armoured scorpion of the red rock (Recommended)”; how big, and how
// it should feel, “Knee-high, fun to smash” (not the recommended pick); how it moves, “Darting bursts, then dead still
// (Recommended)”; the one thing to know it by, “Its tail raised high, stinger glowing (Recommended)”; how it attacks,
// “Pincer snap, then a long tail strike (Recommended)”; how it dies, “Flips onto its back, legs curling (Recommended)”;
// what it must never look like, “Not cute or cartoonish (Recommended)”; its sound (sound rule 7), “Dry clicks and a
// rattling tail (Recommended)”.
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its eyes, its stinger and its edge are the enemy's
// pink while it lives, and nothing cyan; wild, no cult mark; knee-high to the knight, its tail raised over its back to
// about his waist; eight legs, two pincers, a tail of five segments and its sting; its shell banded as the canyon's
// rock is, but bold (Monsters 7: monsters as boldly painted as the heroes; Colour 5: never mud-brown all over): a hot
// rust-orange lit to gold over deep plum-dark bands.
//
// NOT ON THE HEROES' BONES: eight legs, pincers and a tail have no place on them, so it is painted from its own solids,
// as the cliff crawler is (art/ledge_crawlers.ts), in the same painter (art/new_mobs3.ts's paintBits).
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves), and its stand: dead still but for its breath, its tail swaying high over its back, its pincers
// working.

import type { Sprite } from '../engine/px';
import { toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const SCORPION_ON = { on: false };

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
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: its shell banded as the canyon's rock is, but bold and dark against the canyon's pale sand (Colour
// 5: “Neon on dark”; never mud-brown all over): deep plum-black plates, lit at their edges, and between them bands of
// hot rust-orange lit to gold, as the rock's red beds under its dark varnish; its legs dark, their joints the bands'
// orange; its pincers' fingers and its barb black at their tips; its eyes and its sting the enemy's pink burning to
// gold (FLAME). Nothing of it glows cyan.

const SHELL: Ramp = ['#0e0610', '#1e0c16', '#3c1820', '#682a26', '#9a4230'];
const BAND: Ramp = ['#4a160e', '#7a2410', '#c04818', '#f07a2a', '#ffb060'];
const LEG: Ramp = ['#0c060a', '#1a0c10', '#36161a', '#5a2620', '#7c3626'];
const TIP: Ramp = ['#060305', '#060305', '#1a0c10', '#34181a', '#4e2622'];
const HOTSTING: Ramp = ['#7a1058', '#7a1058', '#c0206a', '#ff4f8a', '#ff7aa8'];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high; his knee is about 17 up). x forward, y left, z up; its own
// frame has its middle at the origin.

/** Its middle's height over the floor, at rest: its back about 12 up, knee-high to the knight. */
const BODY_Z = 7.5;
/** Its legs, four pairs: where each comes out of its body (its own frame), front pair first. */
const HIP: V3[] = [
  [6, 6, -1], [6, -6, -1],
  [2, 7.5, -1], [2, -7.5, -1],
  [-3, 8, -1], [-3, -8, -1],
  [-8, 7.5, -1], [-8, -7.5, -1],
];
/** Its feet at rest, on the floor, splayed wide about it. */
export const SC_FEET: V3[] = [
  [16, 20, 0], [16, -20, 0],
  [7, 25, 0], [7, -25, 0],
  [-5, 25, 0], [-5, -25, 0],
  [-15, 21, 0], [-15, -21, 0],
];
/** Its tail: where it rises from (the end of its body, its own frame), each of its five segments' length, and its sting's. */
const TAIL_ROOT: V3 = [-19, 0, 1];
const SEG = [7.4, 7.2, 7.0, 6.8, 6.6];
const SEG_R = [3.5, 3.2, 3.0, 2.8, 2.6];
/** Its tail at rest: the way each segment points, degrees up from forward in the tail's plane: up off its back and curled over it, the sting pointing down and forward over its head. */
const TAIL_REST = [118, 86, 54, 22, -10];
/** Its pincers at rest: each hand's place (its own frame), held out before it, open a little. */
const HAND: V3 = [25, 12, 1.5];

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: ten frames a second, a loop of 1.6 s: dead still but for its breath, its tail and its pincers. */
export const SC_STAND = { frames: 16, fps: 10, period: 1.6 } as const;

/** The canvas it is painted on, and its floor point on it. */
export const SC_CANVAS = { w: 240, h: 170, ax: 120, ay: 116 };
/** Its pool of light while it lives (the enemy's pink, faint). */
const SC_AURA = { x: SC_CANVAS.ax, y: SC_CANVAS.ay - 8, r: 30, color: '#ff3a78', a: 0.08 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

/** One moment of it. */
interface ScPose {
  /** Its middle, forward and to its left and up, from its floor point; and how it is turned (degrees: to its left, nose down, rolled to its right). */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Each foot's place on the floor's own grid (on the floor when z is 0), and how high each knee arches over its leg. */
  feet: V3[];
  knee: number[];
  /** Its tail: the way each segment points (degrees, as `TAIL_REST`), and the tail's plane turned to its left (degrees). */
  tail: number[];
  tailYaw: number;
  /** Each pincer's hand (its own frame), and how far each is open (0 shut, 1 wide). */
  hands: [V3, V3];
  pinch: [number, number];
  /** How bright its sting burns, and its eyes (0 out). */
  sting: number;
  eyes: number;
  /** Still living: its pink edge is painted round it. */
  alive: boolean;
}

/** Its stand: dead still, its feet where they are; it breathes; its tail sways slowly high over its back, curling and uncurling a little; its pincers open and shut by turns; its sting pulses. */
function standPose(t: number): ScPose {
  const a = (Math.PI * 2 * t) / SC_STAND.period;
  return {
    x: 0,
    y: 0,
    z: BODY_Z + 0.35 * Math.sin(a),
    yaw: 0,
    pitch: 0,
    roll: 0,
    feet: SC_FEET.map((f) => f),
    knee: SC_FEET.map(() => 7),
    tail: TAIL_REST.map((d, i) => d + 4 * Math.sin(a + i * 0.5) * (i / 4)),
    tailYaw: 7 * Math.sin(a + 0.4),
    hands: [[HAND[0], HAND[1], HAND[2]], [HAND[0], -HAND[1], HAND[2]]],
    pinch: [0.25 + 0.25 * Math.max(0, Math.sin(a)), 0.25 + 0.25 * Math.max(0, Math.sin(a + Math.PI))],
    sting: 1 + 0.25 * Math.sin(2 * a),
    eyes: 1,
    alive: true,
  };
}

function poseOf(which: string, t: number): ScPose {
  void which;
  return standPose(t);
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

/** A point of its own frame, where it is: turned and moved with its body. */
function worldOf(P: ScPose, p: V3): V3 {
  const cy = Math.cos(P.yaw * D), sy = Math.sin(P.yaw * D);
  const cp = Math.cos(P.pitch * D), sp = Math.sin(P.pitch * D);
  const cr = Math.cos(P.roll * D), sr = Math.sin(P.roll * D);
  // roll about its length, then pitch (nose down), then yaw
  const r1: V3 = [p[0], p[1] * cr - p[2] * sr, p[1] * sr + p[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  const r3: V3 = [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
  return [P.x + r3[0], P.y + r3[1], P.z + r3[2]];
}
/** A direction of its own frame, where it points. */
function turned(P: ScPose, v: V3): V3 {
  return sub(worldOf(P, v), worldOf(P, [0, 0, 0]));
}

/** Its shell, banded across as the canyon's rock is: its plates lit, the seams between them in its deep bands; its edges darker. */
function bandedSkin(bands: number, seed: number): Skin {
  return (u, tone) => {
    const b = fr(u[0] * bands * 0.5 + 0.5 + seed);
    const seam = b < 0.32;
    const rim = Math.abs(u[1]) > 0.78;
    let t = tone + (Math.abs(u[1]) < 0.12 && u[2] > 0.3 ? 1 : 0);
    if (rim) t -= 1;
    return (seam ? BAND : SHELL)[Math.max(0, Math.min(4, t))];
  };
}

/** Its tail's joints, from its root to its sting's base, and the way its last segment points (its own frame). */
export function tailJoints(P: Pick<ScPose, 'tail' | 'tailYaw'>): { pts: V3[]; dir: V3 } {
  const pts: V3[] = [TAIL_ROOT];
  const cy = Math.cos(P.tailYaw * D), sy = Math.sin(P.tailYaw * D);
  let p = TAIL_ROOT;
  let dir: V3 = [1, 0, 0];
  P.tail.forEach((a, i) => {
    dir = [Math.cos(a * D) * cy, Math.cos(a * D) * sy, Math.sin(a * D)];
    p = add(p, mul(dir, SEG[i]));
    pts.push(p);
  });
  return { pts, dir };
}

/** THE SCORPION AS SOLIDS: its body, its tail and sting, its pincers, its eight legs, its eyes. */
function scorpionBits(P: ScPose, put: Put): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const axes = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  // its body: the head-plate before, the long banded back behind it
  put('body', 'back', { k: 'ball', c: W([-8, 0, 0]), ax: axes([13, 0, 0], [0, 9, 0], [0, 0, 4.6]), skin: bandedSkin(6, 0.1) });
  put('body', 'head', { k: 'ball', c: W([6.5, 0, 0.6]), ax: axes([8, 0, 0], [0, 8, 0], [0, 0, 4.2]), skin: bandedSkin(1, 0.6) });
  // its tail: five segments rising off the end of its back and curled over it, each banded at its joint; then its sting
  const { pts, dir } = tailJoints(P);
  for (let i = 0; i < SEG.length; i++) {
    const a = W(pts[i]);
    const b = W(pts[i + 1]);
    put('tail', `seg${i}`, { k: 'rod', a, b, ra: SEG_R[i], rb: SEG_R[i] * 0.92, ramp: SHELL });
    put('tail', `joint${i}`, { k: 'ball', c: b, ax: [[SEG_R[i] * 0.95, 0, 0], [0, SEG_R[i] * 0.95, 0], [0, 0, SEG_R[i] * 0.95]], skin: BAND });
  }
  // the sting: a swollen bulb, its venom burning the cult's pink through it, and the curved barb
  const end = pts[pts.length - 1];
  const bulbC = add(end, mul(dir, 3.4));
  const downish = norm(add(mul(dir, 0.4), [0, 0, -1]));
  const barbA = add(bulbC, mul(dir, 2.6));
  const barbB = add(barbA, mul(norm(add(dir, mul(downish, 1.2))), 5));
  const hot = P.alive ? Math.min(1.6, P.sting) : 0;
  // (its venom burning through its skin: all of the bulb but a dark cap along its top, brightest where the light falls)
  const venom: Skin = (u, tone) => (hot > 0.3 && u[2] < 0.45 ? HOTSTING[Math.max(2, Math.min(4, tone + 1))] : SHELL[Math.max(1, Math.min(4, tone))]);
  const bAx = norm(dir);
  const bSide = norm(cross(bAx, [0, 0, 1]), [0, 1, 0]);
  const bUp = norm(cross(bSide, bAx));
  put('sting', 'bulb', { k: 'ball', c: W(bulbC), ax: axes(mul(bAx, 4.8), mul(bSide, 3.8), mul(bUp, 4.0)), skin: venom });
  put('sting', 'barb', { k: 'rod', a: W(barbA), b: W(barbB), ra: 1.6, rb: 0.45, ramp: TIP });
  if (hot > 0.3) put('glow', 'glow', { k: 'glow', p: W(bulbC), c: FLAME[2], r: 10 + 8 * hot, a: 0.35 + 0.25 * Math.min(1, hot) });
  // its pincers: a long arm from each side of its head, an elbow out wide, a heavy hand and two fingers that open
  for (const [k, side] of [[0, 1], [1, -1]] as const) {
    const sh: V3 = [11, side * 5, 0];
    const hand = P.hands[k];
    const elbow: V3 = [(sh[0] + hand[0]) / 2 - 3, (sh[1] + hand[1]) / 2 + side * 7, Math.max(sh[2], hand[2]) + 3];
    put(`arm${k}`, `upper${k}`, { k: 'rod', a: W(sh), b: W(elbow), ra: 2.0, rb: 1.9, ramp: LEG });
    put(`arm${k}`, `fore${k}`, { k: 'rod', a: W(elbow), b: W(hand), ra: 1.9, rb: 2.2, ramp: SHELL });
    put(`arm${k}`, `elbow${k}`, { k: 'ball', c: W(elbow), ax: axes([2.1, 0, 0], [0, 2.1, 0], [0, 0, 2.1]), skin: BAND });
    const fwd = norm(sub(hand, elbow), [1, 0, 0]);
    const inward = norm(cross([0, 0, side], fwd), [0, -side, 0]);
    const up = norm(cross(fwd, inward));
    put(`arm${k}`, `hand${k}`, { k: 'ball', c: W(hand), ax: axes(mul(fwd, 4.6), mul(inward, 3.2), mul(up, 2.9)), skin: bandedSkin(2, 0.3) });
    // (the fixed finger on the inside, the moving one on the outside, swung out as it opens)
    const root = add(hand, mul(fwd, 3.6));
    const open = P.pinch[k];
    const fixedTip = add(add(root, mul(fwd, 6.5)), mul(inward, 1.2));
    const moveDir = norm(add(fwd, mul(inward, -0.25 - 1.1 * open)));
    const moveTip = add(add(root, mul(inward, -1.4)), mul(moveDir, 6.5));
    put(`arm${k}`, `fixed${k}`, { k: 'rod', a: W(add(root, mul(inward, 1.2))), b: W(fixedTip), ra: 1.4, rb: 0.5, ramp: TIP });
    put(`arm${k}`, `moving${k}`, { k: 'rod', a: W(add(root, mul(inward, -1.4))), b: W(moveTip), ra: 1.4, rb: 0.5, ramp: TIP });
  }
  // its eight legs: a hip under its body, the knee arched high, the foot down on the rock, pointed
  P.feet.forEach((foot, i) => {
    const hip = W(HIP[i]);
    const side = Math.sign(HIP[i][1]);
    const mid = lerpV(hip, foot, 0.45);
    const outward = norm([foot[0] - hip[0], foot[1] - hip[1], 0], [0, side, 0]);
    const knee: V3 = [mid[0] + outward[0] * 1.5, mid[1] + outward[1] * 1.5, Math.max(hip[2], foot[2]) + P.knee[i]];
    const toe: V3 = [foot[0], foot[1], foot[2] + 0.7];
    put(`leg${i}`, `thigh${i}`, { k: 'rod', a: hip, b: knee, ra: 1.7, rb: 1.4, ramp: LEG });
    put(`leg${i}`, `shin${i}`, { k: 'rod', a: knee, b: toe, ra: 1.4, rb: 0.6, ramp: LEG });
    put(`leg${i}`, `knee${i}`, { k: 'ball', c: knee, ax: [[1.6, 0, 0], [0, 1.6, 0], [0, 0, 1.6]], skin: BAND });
  });
  // its eyes: two small ones high on its head-plate, and a few at its front corners, the enemy's pink (none once out)
  if (P.eyes > 0.3) {
    for (const s of [1, -1]) {
      put('body', `eye${s}`, { k: 'dot', p: W([9.5, s * 1.6, 4.2]), c: FLAME[2], facing: turned(P, [0.3, 0, 1]), c2: FLAME[3] });
      put('body', `side${s}`, { k: 'dot', p: W([12.6, s * 5.2, 2.2]), c: FLAME[2], facing: turned(P, [0.6, s * 0.6, 0.5]) });
    }
    put('glow', 'eyes', { k: 'glow', p: W([10, 0, 4]), c: FLAME[2], r: 5, a: 0.25 * Math.min(1, P.eyes) });
  }
}

/** One frame of the scorpion: `which` (its stand, for now), `t` seconds in, from in front or behind. */
export function scorpionPainted(which: string, t: number, view: GameView = 'front'): Painted {
  const st = stage(view, SC_CANVAS.ax, SC_CANVAS.ay, SC_CANVAS);
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  scorpionBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  const lights = paintBits(st, bits, [P.x, P.y, P.z]);
  return { px: st.whole(P.alive ? ENEMY_RIM : null), lights };
}
/** The same frame as the game holds a figure (its pool of light behind it while it lives). */
export function scorpionFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(scorpionPainted(which, t, view), which === 'dying' ? null : SC_AURA, SC_CANVAS.ax, SC_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function scorpionSolids(which: string, t: number): Bit[] {
  const bits: Bit[] = [];
  scorpionBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  });
  return bits;
}
void cl01;
