// FLOOR 19'S KING'S KNIGHTS: THEIR MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind KNIGHTS_ON
// (art/kings_knights.ts, off). Their look and his brief are art/kings_knights.ts; what their blows leave on the floor,
// art/kings_knights_fx.ts.
//
// HIS PICK, “Quick for their armour” ("Same brief, but surprisingly quick for men in full plate."); and his rules for every
// new enemy: Movement 9, his words of 24 Oct, “Like the wind up and wind down are big but the actual punch is lightning
// quick”, and for the enemies, 28 Oct, “Start from now on, but every enemy is going to need that change eventually.  And
// bigger AOE to compensate for the extra time the player gets to evade”; and of speed, 28 Oct, “It’s all too slow and
// too narrow and too small”, “Everything is always so plodding when you first animate them.” So, from the first pass:
//
//   STANDING: his sword planted point down before him, both gauntlets on its hilt (the left over the pommel), the shield
//     on its strap across his back; breathing, the weight shifting, the helm turning slowly; the Hush leaking from the
//     sight.
//   SETTING OFF (`setOff`), RUNNING (his walk), STOPPING (`halt`): QUICK FOR HIS ARMOUR. He plucks the sword from the
//     floor and drives off; he runs at KN_PACE tiles a second, faster than the hero runs (4.6), leaning hard into it,
//     long strides with a flight between them, the sword trailing low in his right fist, the left arm pumping, the
//     surcoat flying back, the shield bouncing on his back; he stops in three hard steps and plants the sword again.
//   THE OVERHEAD CHOP (his first blow, his attack): he plucks the sword up and heaves it high over his head in both hands,
//     stepping in, arched back, the blade glinting pink, held shaking (THE WARNING); hips first, then in two frames the
//     blade comes over and down into the floor before him (smeared); the floor cracks open in a line out before him
//     (art/kings_knights_fx.ts); held a moment in the floor; then he wrenches it out, steps back and plants it again.
//   THE SHIELD RUSH (his second blow, `more.rush`): he plucks the sword up; his shield swung round off his back onto his
//     left arm; down he goes into a crouch behind it, the sword drawn back low, its rim glinting pink, held shaking (THE
//     WARNING); then in two frames he bursts forward several tiles (the game carries him: `KN_RUSH.carry`), smeared, and
//     slams into you shield first, his left foot stamped down: a flash, and you are knocked back
//     (art/kings_knights_fx.ts); he gathers himself, slings the shield back and plants the sword.
//   STRUCK: jolted back on his sword, the helm rocked back, the Hush coughed out of the sight.
//   HIS DEATH (the brief's): struck, he sinks onto his right knee behind his planted sword, both hands on its hilt, and
//     bows his head onto them; the Hush leaves him in one great grey breath, the pink going out of the sight; his hands
//     slip from the hilt, the sword falls aside, and he topples forward onto his face and lies still: a man again.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and
// the lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/kings_knights.test.ts

import type { ActorArt } from './actor_types';
import { footwork, kneelHips, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { FLAME } from './mkit';
import { KITE, KNIGHT_BODY, KN_CANVAS, SWORD, knightPainter, shieldOf, swordOf } from './kings_knights';
import type { KnightSay } from './kings_knights';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, dot, elbowFor, heading, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = KNIGHT_BODY;
const FPS = 30;
const FR = 1 / FPS;
const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};

// =============================================================================================
// A MOVE THROUGH KEY POSES: every number through its keys smoothly (a monotone curve: its speed carried through a key,
// not stopped at it, and never overshooting), but straight through a lightning strike; sampled on every frame the game
// shows. Each move keeps its hands measured one way throughout (the bones' `lhIn`, `rhIn`); where one move hands over
// to the next with its hands measured another way, the next begins where the bones put them.

/** A smooth curve through keys [time, value]: monotone between them (Fritsch and Carlson's). */
function track(keys: ReadonlyArray<readonly [number, number]>): (t: number) => number {
  const n = keys.length;
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
  if (n === 1) return () => vs[0];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((vs[i + 1] - vs[i]) / (ts[i + 1] - ts[i]));
  const m: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0 || i === n - 1 || d[i - 1] * d[i] <= 0) m.push(0);
    else {
      const w1 = 2 * (ts[i + 1] - ts[i]) + (ts[i] - ts[i - 1]);
      const w2 = ts[i + 1] - ts[i] + 2 * (ts[i] - ts[i - 1]);
      m.push((w1 + w2) / (w1 / d[i - 1] + w2 / d[i]));
    }
  }
  return (t: number) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (i < n - 2 && t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i];
    const u = (t - ts[i]) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * vs[i] + h10 * h * m[i] + h01 * vs[i + 1] + h11 * h * m[i + 1];
  };
}
/** A key of a plan: when, the pose (what it does not say, as the plan's base has it), and which way each elbow should lie (if said: its swing worked out from it). */
interface Key {
  at: number;
  pose: P;
  wl?: V3;
  wr?: V3;
}
interface Plan {
  long: number;
  base: Bones;
  keys: ReadonlyArray<Key>;
  /** The strike: from the last frame of its wind-up to the frame it lands on. */
  strike?: readonly [number, number];
  hit?: number;
  /** Its feet, over and above its keys (art/bosses3.ts `footwork`). */
  feet?: (t: number) => P;
}
const FIELDS = [
  'px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'faceTurn', 'faceUp', 'faceTilt',
  'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'le', 're',
  'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk', 'lkUp', 'rkUp', 'wAz', 'wEl', 'wRoll', 'draw', 'out', 'gale', 'pt', 'pAz', 'pEl',
] as const;
type Field = (typeof FIELDS)[number];
/** A plan's whole pose at each of its keys, its elbows worked out (each the nearest of its numbers to the key before's). */
function keyPoses(plan: Plan): [number, Bones][] {
  const out: [number, Bones][] = [];
  let le = plan.base.le;
  let re = plan.base.re;
  for (const k of plan.keys) {
    const q = { ...plan.base, ...k.pose, ...(plan.feet ? plan.feet(k.at) : {}) } as Bones;
    if (k.wl) le = elbowFor(B, q as Posed, true, norm(k.wl), le);
    else if (k.pose.le !== undefined) le = k.pose.le;
    q.le = le;
    if (k.wr) re = elbowFor(B, q as Posed, false, norm(k.wr), re);
    else if (k.pose.re !== undefined) re = k.pose.re;
    q.re = re;
    out.push([k.at, q]);
  }
  return out;
}
function poseFn(plan: Plan): (t: number) => Bones {
  const full = keyPoses(plan);
  const tracks = new Map<Field, (t: number) => number>(FIELDS.map((f) => [f, track(full.map(([t, p]) => [t, p[f]] as const))]));
  const st = plan.strike;
  // (the strike's own keys: its wind-up's last, any it passes through, and where it lands; straight from one to the next)
  const inStrike = st ? full.filter(([kt]) => kt >= st[0] - 1e-6 && kt <= st[1] + 1e-6) : [];
  return (t) => {
    const out = { ...plan.base } as Bones;
    if (st && inStrike.length >= 2 && t > st[0] && t < st[1]) {
      let i = 0;
      while (i < inStrike.length - 2 && t > inStrike[i + 1][0]) i++;
      const [ta, a0] = inStrike[i];
      const [tb, a1] = inStrike[i + 1];
      const k = (t - ta) / (tb - ta);
      for (const f of FIELDS) out[f] = a0[f] + (a1[f] - a0[f]) * k;
    } else for (const f of FIELDS) out[f] = (tracks.get(f) as (t: number) => number)(t);
    if (plan.feet) Object.assign(out, plan.feet(t));
    return out;
  };
}
/** A plan as the bones play it: a key on every frame. */
function motionOf(plan: Plan): Motion {
  const f = poseFn(plan);
  const keys: Key3[] = [];
  const n = Math.round(plan.long * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: f(i / FPS), ease: 'lin' });
  return plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
}
/** Where a hand is, measured from its own shoulder along the figure's axes (`lhIn`, `rhIn` 1), in a pose. */
function fromShoulder(q: Bones, side: 'L' | 'R'): V3 {
  const s = solve(B, q as Posed);
  return side === 'L' ? sub(s.handL, s.shoulderL) : sub(s.handR, s.shoulderR);
}
/** Where a hand is on the floor's own axes (`rhIn` 2), in a pose. */
function onFloor(q: Bones, side: 'L' | 'R'): V3 {
  const s = solve(B, q as Posed);
  return side === 'L' ? s.handL : s.handR;
}
const handsL = (v: V3): P => ({ lhIn: 1, lhx: v[0], lhy: v[1], lhz: v[2] });
const handR2 = (v: V3, az: number, el: number): P => ({ rhIn: 2, rhx: v[0], rhy: v[1], rhz: v[2], wAz: az, wEl: el, wRoll: 0 });

// =============================================================================================
// HIS REST: HIS SWORD PLANTED BEFORE HIM, BOTH HANDS ON ITS HILT

/** Where his sword's point rests on the floor as he stands, and how far from upright it leans (degrees, its hilt toward him). */
export const SWORD_PLANTED: V3 = [18, -1.0, 0.6];
const PLANT_EL = -82;
const PLANT_WAY = heading(0, PLANT_EL);
/** His right fist on the grip under the cross, the sword's point on the floor. */
const PLANT_HAND = sub(SWORD_PLANTED, mul(PLANT_WAY, SWORD.cross + SWORD.blade));
/** The left gauntlet over the pommel (along the sword from the right fist, toward the pommel). */
const ON_POMMEL = -6.3;
const BASE0: Bones = {
  ...standing(B),
  pz: -0.4, pitch: 2, bend: 2, roll: 0, side: 0, faceUp: -2, faceTilt: 0, faceTurn: 0,
  lfx: 0.8, lfy: 2.0, lfz: 0, lfp: 0, lft: 12, lk: 8, rfx: -0.6, rfy: -2.0, rfz: 0, rfp: 0, rft: -12, rk: -8,
  rhIn: 2, rhx: PLANT_HAND[0], rhy: PLANT_HAND[1], rhz: PLANT_HAND[2], wAz: 0, wEl: PLANT_EL, wRoll: 0,
  lhIn: 3, lhx: ON_POMMEL, lhy: 0, lhz: 0,
  pt: 0, pAz: 0, pEl: 0, out: 0,
} as Bones;
const LE0 = elbowFor(B, BASE0 as Posed, true, norm([-0.4, 1, -0.5]));
export const KN_REST: Bones = { ...BASE0, le: LE0, re: elbowFor(B, { ...BASE0, le: LE0 } as Posed, false, norm([-0.4, -1, -0.5])) };
const R = KN_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
/** His rest with his left hand measured from its shoulder (for a move that lets go of the pommel). */
const REST_L1: V3 = fromShoulder(R, 'L');

// =============================================================================================
// STANDING

export const KN_STAND_LONG = 3.2;
function knightStand(): Motion {
  const T = KN_STAND_LONG;
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.8 * breath,
        py: 0.9 * Math.sin(a),
        roll: R.roll + 1.6 * Math.sin(a),
        bend: R.bend - 1.8 * breath,
        pitch: R.pitch + 0.8 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 2 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 2 * Math.sin(a + 2.0),
        faceTurn: R.faceTurn + 6 * Math.sin(a * 0.5 + 0.8),
      },
    });
  }
  return { loop: 0, keys };
}

// =============================================================================================
// THE RUN (his pick, “Quick for their armour”): faster than the hero runs, a flight between the strides

/** His running pace, tiles a second (the hero runs 4.6: TUNE.heroSpeed). */
export const KN_PACE = 5.0;
export const KN_RUN = { frames: 16, fps: 30 } as const;
const GROUND = KN_PACE * TILE3;
const STEP = GROUND / KN_RUN.fps;
/** A foot through his stride, frame by frame from the moment it comes down: [forward, up, toes tipped down]. Down five frames (going back under him with the floor), off it eleven. */
const STRIDE: ReadonlyArray<readonly [number, number, number]> = (() => {
  const x0 = 13.0;
  const out: [number, number, number][] = [];
  for (let k = 0; k <= 4; k++) out.push([x0 - STEP * k, 0, 0]);
  // (rolled onto the toe as it goes: the toe stays where it was on the floor)
  const toe4 = x0 - STEP * 4 + B.ball;
  const p5 = 30 * D;
  out.push([toe4 - STEP - (B.ball * Math.cos(p5) - B.ankle * Math.sin(p5)), B.ball * Math.sin(p5) + B.ankle * Math.cos(p5) - B.ankle + 0.05, 30]);
  out.push([-19.5, 8.5, 45], [-17.0, 14.0, 45], [-10.5, 16.5, 30], [-2.5, 16.0, 10], [5.5, 13.0, -5], [12.0, 9.0, -14], [17.0, 5.2, -16], [19.2, 2.8, -12], [19.4, 1.5, -6], [18.2, 0.9, -2]);
  return out;
})();
/** The stride's frame for each foot at a frame of the run (the run's first frame: the right foot leaving the floor behind him, the left reaching out before him). */
const strideL = (f: number): number => (f + 12) % 16;
const strideR = (f: number): number => (f + 4) % 16;
/** His body through the run, frame by frame. */
function runPose(f: number): Bones {
  const a = (2 * Math.PI * f) / 16;
  const [lx, lz, lp] = STRIDE[strideL(f)];
  const [rx, rz, rp] = STRIDE[strideR(f)];
  // (low as a foot is under him, high in the flight; his hips turned toward the foot that reaches)
  const yaw = -7 * Math.cos(a - (2 * Math.PI * 2) / 16);
  const swing = Math.cos(a - (2 * Math.PI * 2) / 16);
  const body: P = {
    px: 2.4 + 0.5 * Math.cos(2 * a), py: 0.6 * swing, pz: -3.2 - 1.3 * Math.cos(2 * (a - (2 * Math.PI * 6) / 16)),
    yaw, twist: -1.5 * yaw, pitch: 9, bend: 9 + 1.2 * Math.cos(2 * a), roll: 2.2 * swing, side: -1.2 * swing,
    faceUp: 9, faceTurn: 0.5 * yaw, faceTilt: -1.5 * swing,
    lfx: lx, lfy: -2.2, lfz: lz, lfp: lp, lft: 4, lk: 6, lkUp: 0,
    rfx: rx, rfy: 2.2, rfz: rz, rfp: rp, rft: -4, rk: -6, rkUp: 0,
    pt: 0, pAz: 0, pEl: 0, out: 0,
  };
  // the sword trailing low in his right fist, its point back and down, out to his right; his left arm pumping
  const right: V3 = [-1.5 + 5.5 * swing, -4.0, -21.5 + 1.8 * swing];
  const left: V3 = [2.0 - 8.0 * swing, 4.0 + 0.8 * swing, -15.5 - 3.0 * swing];
  const q = { ...R, ...body, rhIn: 1, rhx: right[0], rhy: right[1], rhz: right[2], wAz: 16, wEl: -152 + 6 * swing, wRoll: 0, lhIn: 1, lhx: left[0], lhy: left[1], lhz: left[2] } as Bones;
  q.le = elbowFor(B, q as Posed, true, norm([-1, 0.6, -0.2]));
  q.re = elbowFor(B, q as Posed, false, norm([-0.6, -1, -0.3]));
  return q;
}
const RUN_POSES: Bones[] = Array.from({ length: 16 }, (_, f) => runPose(f));
function knightRun(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= 16; i++) keys.push({ at: i / KN_RUN.fps, ease: 'lin', pose: RUN_POSES[i % 16] });
  return { keys, loop: 0 };
}
const RUN0 = RUN_POSES[0];
const RUN0_HAND = onFloor(RUN0, 'R');

/** Feet frame by frame: [forward, up, toes down, to the left (over the stance), turned]. */
type FootAt = readonly [number, number, number, number, number];
const feetOf = (l: FootAt, r: FootAt): P => ({ lfx: l[0], lfz: l[1], lfp: l[2], lfy: l[3], lft: l[4], rfx: r[0], rfz: r[1], rfp: r[2], rfy: r[3], rft: r[4] });

// =============================================================================================
// SETTING OFF: he plucks his sword from the floor and drives off, the game carrying him at his pace from its first frame

export const KN_SETOFF = 9 / FPS;
/** His feet as he sets off: the left pushes off and is swung through; the right lifts at once, strides out and comes down before him. */
const SETOFF_FEET: ReadonlyArray<P> = (() => {
  const l0 = R.lfx;
  const r0 = R.rfx;
  const toeOff = (x: number, turn: number, pitch: number): [number, number] => {
    // (the ankle that keeps the toe where it was, tipped `pitch`; and how high the ankle then is)
    const p = pitch * D;
    const c = Math.cos(turn * D);
    return [x - (B.ball * Math.cos(p) - B.ankle * Math.sin(p)) * c, B.ball * Math.sin(p) + B.ankle * Math.cos(p) - B.ankle + 0.05];
  };
  const toe2 = l0 - 2 * STEP + B.ball * Math.cos(12 * D);
  const [l3x, l3z] = toeOff(toe2 - STEP, 12, 30);
  const L: FootAt[] = [
    [l0, 0, 0, 2.0, 12], [l0 - STEP, 0, 0, 2.0, 12], [l0 - 2 * STEP, 0, 0, 2.0, 12], [l3x, l3z, 30, 1.6, 12],
    [-17.5, 8.5, 42, 0.6, 10], [-11.5, 14.5, 28, -0.6, 8], [-2.5, 15.0, 8, -1.4, 6], [6.5, 12.0, -6, -1.9, 5], [13.0, 8.0, -14, -2.1, 4],
  ];
  const [x9, z9, p9] = STRIDE[strideL(0)];
  L.push([x9, z9, p9, -2.2, 4]);
  const Rx: FootAt[] = [[r0, 0, 0, -2.0, -12], [1.0, 4.0, -4, -1.0, -9], [5.0, 7.5, -10, 0.4, -7], [10.0, 6.5, -12, 1.6, -5], [14.6, 2.6, -6, 2.1, -4]];
  for (let k = 0; k <= 4; k++) Rx.push([STRIDE[k][0], 0, 0, 2.2, -4]);
  return L.map((l, i) => feetOf(l, Rx[i]));
})();
function setOffPlan(): Plan {
  const T = KN_SETOFF;
  const keys: Key[] = [
    { at: 0, pose: { ...handsL(REST_L1) } },
    { at: 2 / FPS, pose: { px: 0.6, pz: -1.6, pitch: 8, bend: 6, yaw: 3, twist: -4, faceUp: 4, ...handR2([12.0, -9.5, 40.5], 0, -92), ...handsL([7.0, 2.0, -16.5]) }, wl: [-0.6, 1, -0.3], wr: [-0.2, -1, -0.4] },
    { at: 5 / FPS, pose: { px: 2.2, pz: -3.6, pitch: 12, bend: 10, yaw: 6, twist: -8, faceUp: 8, ...handR2([6.0, -15.0, 37.5], 6, -128), ...handsL([2.0, 4.0, -16.0]) }, wl: [-1, 0.6, -0.2], wr: [-0.6, -1, -0.3] },
    { at: T, pose: { ...RUN0, ...handR2(RUN0_HAND, RUN0.wAz, RUN0.wEl), ...handsL([RUN0.lhx, RUN0.lhy, RUN0.lhz]), le: RUN0.le, re: RUN0.re } },
  ];
  return { long: T, base: { ...R, ...handsL(REST_L1) } as Bones, keys, feet: (t) => SETOFF_FEET[Math.max(0, Math.min(9, Math.round(t * FPS)))] };
}

// =============================================================================================
// STOPPING: three hard steps, the sword brought round and planted before him again

export const KN_HALT = 12 / FPS;
/** How fast the game carries him while he stops, tiles a second (from his run's pace he comes to a stand). */
export const KN_HALT_PACE = 2.0;
const HALT_STEP = (KN_HALT_PACE * TILE3) / FPS;
/** His feet as he stops: the left comes down before him, the right after it, then the left again beside it. */
const HALT_FEET: ReadonlyArray<P> = (() => {
  const l = STRIDE[strideL(0)];
  const r = STRIDE[strideR(0)];
  const L: FootAt[] = [[l[0], l[1], l[2], -2.2, 4], [16.0, 2.4, -8, -2.2, 4]];
  for (let k = 0; k <= 3; k++) L.push([13.0 - HALT_STEP * k, 0, 0, -2.2, 4]);
  // (rolled onto its toe and lifted; then down beside the right, square)
  const toe5 = 13.0 - HALT_STEP * 3 + B.ball * Math.cos(4 * D);
  const p6 = 24 * D;
  L.push([toe5 - HALT_STEP - (B.ball * Math.cos(p6) - B.ankle * Math.sin(p6)), B.ball * Math.sin(p6) + B.ankle * Math.cos(p6) - B.ankle + 0.05, 24, -1.6, 6]);
  L.push([3.5, 5.0, 10, 0.0, 9], [7.0, 2.5, 0, 1.4, 11]);
  for (let k = 3; k >= 0; k--) L.push([R.lfx + HALT_STEP * k, 0, 0, 2.0, 12]);
  // (the right foot: leaving the floor behind him, rolled onto its toe, swung through and down before him)
  const toe0 = r[0] + B.ball * Math.cos(-4 * D);
  const p1 = 30 * D;
  // (it hangs a moment, swung through, and stamps down beside the left as he plants his sword)
  const Rf: FootAt[] = [[r[0], r[1], r[2], 2.2, -4], [toe0 - HALT_STEP - (B.ball * Math.cos(p1) - B.ankle * Math.sin(p1)), B.ball * Math.sin(p1) + B.ankle * Math.cos(p1) - B.ankle + 0.05, 30, 2.2, -4], [-16.5, 8.0, 40, 1.6, -5], [-9.5, 12.5, 20, 0.8, -6], [-1.5, 12.0, 4, -0.2, -8], [4.5, 9.0, -6, -1.0, -9], [7.5, 6.0, -8, -1.5, -10], [8.0, 4.0, -6, -1.8, -11], [7.0, 2.6, -3, -2.0, -12], [5.4, 1.6, -1, -2.0, -12], [3.8, 0.9, 0, -2.0, -12]];
  for (let k = 1; k >= 0; k--) Rf.push([R.rfx + HALT_STEP * k, 0, 0, -2.0, -12]);
  return L.map((x, i) => feetOf(x, Rf[i]));
})();
function haltPlan(): Plan {
  const T = KN_HALT;
  const keys: Key[] = [
    { at: 0, pose: { ...RUN0, ...handR2(RUN0_HAND, RUN0.wAz, RUN0.wEl), ...handsL([RUN0.lhx, RUN0.lhy, RUN0.lhz]), le: RUN0.le, re: RUN0.re } },
    { at: 3 / FPS, pose: { px: 1.0, pz: -4.6, pitch: 4, bend: 6, yaw: -4, twist: 4, faceUp: 6, roll: 0, side: 0, ...handR2([5.0, -15.5, 36.0], 8, -125), ...handsL([4.0, 5.0, -17.0]) }, wl: [-1, 0.6, -0.3], wr: [-0.6, -1, -0.3] },
    { at: 7 / FPS, pose: { px: -0.6, pz: -3.0, pitch: -2, bend: 3, yaw: 2, twist: -2, faceUp: 2, ...handR2([9.0, -15.5, 41.0], 2, -100), ...handsL([8.0, 1.5, -15.0]) }, wl: [-0.6, 1, -0.4], wr: [-0.3, -1, -0.4] },
    { at: 10 / FPS, pose: { px: 0, pz: -2.6, pitch: 1, bend: 2, yaw: 0, twist: 0, faceUp: -1, ...handR2([13.0, -6.5, 43.0], 0, -86), ...handsL(add(REST_L1, [0.6, -1.0, 1.6])) }, wl: [-0.4, 1, -0.5], wr: [-0.4, -1, -0.5] },
    { at: T, pose: { ...handR2(PLANT_HAND, 0, PLANT_EL), ...handsL(REST_L1), le: R.le, re: R.re } },
  ];
  return { long: T, base: { ...R, ...handsL(REST_L1) } as Bones, keys, feet: (t) => HALT_FEET[Math.max(0, Math.min(12, Math.round(t * FPS)))] };
}

// =============================================================================================
// THE OVERHEAD CHOP (his first blow): heaved high in both hands, held; over and down in two frames; the floor cracks

/** Its times: how long; its warning, held from and to; the strike (from the last frame of the wind-up to the frame it lands on); the blow. */
export const KN_CHOP = { long: 2.0, warn: [0.48, 0.82] as const, strike: [26 / FPS, 28 / FPS] as const, hit: 28 / FPS } as const;
/** His fists as the blow lands, and the blade's way then: its point down on the floor before him. */
const CHOP_HAND: V3 = [22.0, -1.6, 24.0];
const CHOP_EL = Math.asin((0.9 - CHOP_HAND[2]) / (SWORD.cross + SWORD.blade)) / D;
/** Where the blade bites the floor (its point; the figure's own lengths before him): the crack runs on from here (art/kings_knights_fx.ts). */
export const CHOP_AT = CHOP_HAND[0] + (SWORD.cross + SWORD.blade) * Math.cos(CHOP_EL * D);
/** The sword's way for a point at `tip` from a fist at `hand` (degrees round and up). */
function wayTo(hand: V3, tip: V3): [number, number] {
  const d = norm(sub(tip, hand));
  return [Math.atan2(d[1], d[0]) / D, Math.asin(Math.max(-1, Math.min(1, d[2]))) / D];
}
function chopPlan(): Plan {
  const [w0, w1] = KN_CHOP.warn;
  const [s0, s1] = KN_CHOP.strike;
  // (raised: both fists high over his helm, the blade back and up behind him; `el` past upright: over the top)
  const RAISED: P = { px: 3.5, py: 0.4, pz: -0.8, pitch: -4, bend: -11, yaw: 2, twist: -4, side: 0, roll: 0, faceUp: 14, faceTurn: 0, ...handR2([3.5, -2.0, 77.0], 0, 148), lhx: SWORD.lower };
  const shake = (k: number): P => ({ ...RAISED, rhz: 77.0 + (k % 2 ? 0.7 : -0.4), rhx: 3.5 - 0.25 * (k % 2), rhy: -2.0 + (k % 2 ? -0.3 : 0.2), px: 3.5 - 0.2 * (k % 2) });
  // (the hips first: driven forward and tipped, the chest and the sword still back)
  const DRIVE: P = { ...RAISED, px: 5.5, pz: -1.6, pitch: 6, bend: -19, faceUp: 12 };
  // (over the top: half way, the blade before him pointing up, his fists out over his head)
  const OVER: P = { px: 5.0, py: -0.2, pz: -3.0, pitch: 10, bend: 0, yaw: 0, twist: 0, side: 0, roll: 0, faceUp: 8, faceTurn: 0, ...handR2([24.0, -1.8, 66.0], 0, 45), lhx: SWORD.lower };
  // (struck: the blade down into the floor before him, his arms out after it, deep in the lunge)
  const hand: V3 = [CHOP_HAND[0], CHOP_HAND[1], CHOP_HAND[2]];
  const STRUCK: P = { px: 6.0, py: -0.4, pz: -7.0, pitch: 16, bend: 22, yaw: -2, twist: 2, side: 0, roll: 0, faceUp: -2, faceTurn: 0, ...handR2(hand, 0, CHOP_EL), lhx: SWORD.lower };
  // (carried on: the fists still going down, the blade's point running on along the floor as the crack opens)
  // (the fists held where they struck, the body sinking on after them, the point biting the floor)
  const ON: P = { ...STRUCK, px: 6.8, pz: -8.0, pitch: 18, bend: 25 };
  void wayTo;
  return {
    long: KN_CHOP.long,
    base: R,
    strike: KN_CHOP.strike,
    hit: KN_CHOP.hit,
    keys: [
      { at: 0, pose: {} },
      // plucked from the floor, swung up point first before him, stood upright, the left hand down onto the grip
      { at: 0.07, pose: { px: 0.3, pz: -0.1, pitch: 1, bend: 0, faceUp: 0, ...handR2([16.5, -1.6, 40.0], 0, -12), lhx: -5.2 }, wl: [-0.3, 1, -0.5], wr: [-0.3, -1, -0.5] },
      { at: 0.14, pose: { px: 0.6, pz: 0.2, pitch: 0, bend: -1, faceUp: 2, ...handR2([12.5, -1.6, 44.0], 0, 72), lhx: SWORD.lower }, wl: [-0.2, 1, -0.6], wr: [-0.2, -1, -0.6] },
      // heaved up over his helm as he steps in
      { at: 0.3, pose: { px: 2.4, pz: 0.1, pitch: -2, bend: -6, faceUp: 10, ...handR2([8.0, -2.0, 66.0], 0, 112), lhx: SWORD.lower }, wl: [0, 1, -0.2], wr: [0, -1, -0.2] },
      { at: w0, pose: RAISED, wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: 0.58, pose: shake(1), wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: 0.68, pose: shake(2), wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: 0.76, pose: shake(3), wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: w1, pose: shake(4), wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: s0, pose: DRIVE, wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: s0 + FR, pose: OVER, wl: [0.3, 1, -0.1], wr: [0.3, -1, -0.1] },
      { at: s1, pose: STRUCK, wl: [0.2, 1, -0.5], wr: [0.2, -1, -0.5] },
      { at: s1 + 0.1, pose: ON, wl: [0.2, 1, -0.5], wr: [0.2, -1, -0.5] },
      { at: 1.12, pose: { ...ON, pz: -7.8, faceUp: 0 }, wl: [0.2, 1, -0.5], wr: [0.2, -1, -0.5] },
      // wrenched up out of the floor
      { at: 1.36, pose: { px: 4.0, pz: -4.0, pitch: 8, bend: 8, yaw: 0, twist: 0, faceUp: 4, ...handR2([21.0, -1.6, 37.0], 0, 8), lhx: SWORD.lower }, wl: [0, 1, -0.5], wr: [0, -1, -0.5] },
      // stepping back, the sword brought round point down
      { at: 1.62, pose: { px: 1.4, pz: -1.4, pitch: 3, bend: 3, faceUp: 0, ...handR2([17.0, -1.4, 41.0], 0, -58), lhx: -5.0 }, wl: [-0.2, 1, -0.5], wr: [-0.2, -1, -0.5] },
      { at: 1.84, pose: { ...handR2(add(PLANT_HAND, [0, 0, 0.7]), 0, PLANT_EL), lhx: ON_POMMEL } },
      { at: KN_CHOP.long, pose: {} },
    ],
    feet: footwork(B, {
      L: { start: L0, moves: [{ t0: 0.14, t1: 0.36, to: plantBy(L0, 12.5, 0.5, -4), lift: 4.5 }, { t0: 1.5, t1: 1.76, to: L0, lift: 3.4 }] },
      R: { start: R0, moves: [{ t0: s0 - 0.04, t1: s1, to: plantBy(R0, 0, 0, 4, { pitch: 26 }) }, { t0: 1.4, t1: 1.6, to: plantBy(R0, 0, 0, 0, { pitch: 0 }) }] },
    }),
  };
}

// =============================================================================================
// THE SHIELD RUSH (his second blow): the shield swung round onto his arm, crouched behind it, held; a burst of several
// tiles in two frames (the game carries him), slammed in shield first

/** Its times; and how far the game carries him in its two frames of strike, tiles. */
export const KN_RUSH = { long: 2.36, take: [0.08, 0.36] as const, warn: [0.55, 0.92] as const, strike: [29 / FPS, 31 / FPS] as const, hit: 31 / FPS, carry: 3.5, sling: [1.6, 1.92] as const } as const;
/** How far the game has carried him `t` seconds into the rush (tiles): none before its strike, `carry` once it has landed. */
export function rushCarried(t: number): number {
  const [s0, s1] = KN_RUSH.strike;
  return KN_RUSH.carry * clamp01((t - s0) / (s1 - s0));
}
function rushPlan(): Plan {
  const [w0, w1] = KN_RUSH.warn;
  const [s0, s1] = KN_RUSH.strike;
  const [k0, k1] = KN_RUSH.take;
  // (crouched behind the shield: his left forearm across behind it, his shoulder in it, the sword drawn back low)
  const CROUCH: P = { px: -1.0, py: 0.5, pz: -8.5, pitch: 16, bend: 14, yaw: 14, twist: -6, roll: 2, side: 0, faceUp: 18, faceTurn: -8, ...handR2([-3.0, -14.0, 30.0], 196, -26), ...handsL([9.0, -6.0, -18.0]), pt: 1, pAz: -14, pEl: 10 };
  const shake = (k: number): P => ({ ...CROUCH, pz: -8.5 + (k % 2 ? 0.35 : -0.2), py: 0.5 + (k % 2 ? -0.3 : 0.2), lhx: 9.0 + (k % 2 ? 0.3 : -0.2) });
  const HIPS: P = { ...CROUCH, px: -0.6, pz: -8.4, pitch: 19, yaw: 11, twist: -3 };
  // (in the air, driving: flat out behind the shield)
  // (landed: the shield slammed out before him at arm's length, his left foot stamped down, the right leg out behind)
  const SLAM: P = { px: 3.0, py: 0.6, pz: -6.0, pitch: 24, bend: 10, yaw: 4, twist: 2, roll: 0, side: 0, faceUp: 14, faceTurn: -4, ...handR2([-4.0, -15.0, 31.0], 200, -30), ...handsL([20.5, -2.0, -2.5]), pt: 1, pAz: -24, pEl: 18 };
  const ON: P = { ...SLAM, px: 5.4, pz: -6.6, ...handsL([23.0, -1.5, 1.0]), pEl: 24 };
  return {
    long: KN_RUSH.long,
    base: { ...R, ...handsL(REST_L1) } as Bones,
    strike: KN_RUSH.strike,
    hit: KN_RUSH.hit,
    keys: [
      { at: 0, pose: { ...handsL(REST_L1) } },
      // the sword plucked up into his right fist; his left hand to the shield's edge at his back
      { at: k0, pose: { px: 0.2, pz: -0.4, pitch: 2, bend: 1, yaw: 4, twist: 2, faceUp: 0, ...handR2([10.0, -11.0, 40.0], 0, -96), ...handsL([-6.0, 6.0, -12.0]), pt: 0.04, pAz: 160, pEl: 0 }, wl: [-0.3, 1, -0.2], wr: [-0.3, -1, -0.4] },
      // the shield swung round his left side onto his arm
      { at: 0.22, pose: { px: -0.2, pz: -2.0, pitch: 4, bend: 3, yaw: 8, twist: 0, faceUp: 4, ...handR2([3.0, -14.5, 37.0], 90, -110), ...handsL([2.0, 10.0, -14.0]), pt: 0.45, pAz: 90, pEl: 2 }, wl: [-0.6, 1, -0.3], wr: [-0.4, -1, -0.4] },
      { at: k1, pose: { px: -0.6, pz: -4.5, pitch: 8, bend: 7, yaw: 12, twist: -3, faceUp: 10, faceTurn: -4, ...handR2([-1.0, -14.5, 36.0], 180, -58), ...handsL([9.5, -3.0, -12.0]), pt: 0.92, pAz: -10, pEl: 10 }, wl: [-0.5, 1, -0.4], wr: [-0.5, -1, -0.3] },
      { at: w0, pose: CROUCH, wl: [-0.4, 1, -0.5], wr: [-0.6, -1, -0.2] },
      { at: 0.66, pose: shake(1), wl: [-0.4, 1, -0.5], wr: [-0.6, -1, -0.2] },
      { at: 0.76, pose: shake(2), wl: [-0.4, 1, -0.5], wr: [-0.6, -1, -0.2] },
      { at: 0.85, pose: shake(3), wl: [-0.4, 1, -0.5], wr: [-0.6, -1, -0.2] },
      { at: w1, pose: shake(4), wl: [-0.4, 1, -0.5], wr: [-0.6, -1, -0.2] },
      { at: s0, pose: HIPS, wl: [-0.4, 1, -0.5], wr: [-0.6, -1, -0.2] },
      { at: s1, pose: SLAM, wl: [-0.2, 1, -0.4], wr: [-0.6, -1, -0.2] },
      { at: s1 + 0.13, pose: ON, wl: [-0.2, 1, -0.4], wr: [-0.6, -1, -0.2] },
      { at: 1.24, pose: { ...ON, pz: -5.8, pitch: 20, ...handsL([22.0, -1.5, -0.5]) }, wl: [-0.2, 1, -0.4], wr: [-0.6, -1, -0.2] },
      // gathered up, the shield lowered
      { at: 1.58, pose: { px: 1.0, pz: -3.0, pitch: 8, bend: 5, yaw: 8, twist: -2, faceUp: 6, faceTurn: -2, ...handR2([2.0, -14.0, 36.0], 200, -70), ...handsL([9.0, -2.0, -17.0]), pt: 0.95, pAz: -14, pEl: 4 }, wl: [-0.4, 1, -0.4], wr: [-0.4, -1, -0.4] },
      // slung back round onto his back
      { at: 1.76, pose: { px: 0.6, pz: -1.6, pitch: 4, bend: 3, yaw: 6, twist: 0, faceUp: 2, faceTurn: 0, ...handR2([6.0, -13.0, 39.0], 40, -100), ...handsL([2.0, 10.0, -14.0]), pt: 0.45, pAz: 90, pEl: 2 }, wl: [-0.6, 1, -0.3], wr: [-0.4, -1, -0.4] },
      { at: KN_RUSH.sling[1], pose: { px: 0.2, pz: -0.6, pitch: 2, bend: 2, yaw: 2, twist: 0, faceUp: 0, ...handR2([11.0, -6.0, 40.0], 0, -92), ...handsL([-6.0, 6.0, -12.0]), pt: 0, pAz: 160, pEl: 0 }, wl: [-0.3, 1, -0.2], wr: [-0.3, -1, -0.4] },
      // the sword planted again, both hands on its hilt
      { at: 2.14, pose: { ...handR2(add(PLANT_HAND, [0, 0, 0.6]), 0, PLANT_EL), ...handsL(add(REST_L1, [0.4, 0, 0.5])), pt: 0 }, wl: [-0.4, 1, -0.5], wr: [-0.4, -1, -0.5] },
      { at: KN_RUSH.long, pose: { ...handsL(REST_L1), le: R.le, re: R.re } },
    ],
    feet: footwork(B, {
      L: { start: L0, moves: [{ t0: 0.3, t1: 0.46, to: plantBy(L0, 7.5, -0.5, -10), lift: 3.4 }, { t0: s0, t1: s1, to: plantBy(L0, 12.0, -0.8, -12), lift: 4.0 }, { t0: 1.8, t1: 2.04, to: L0, lift: 3.4 }] },
      R: { start: R0, moves: [{ t0: 0.14, t1: 0.32, to: plantBy(R0, -12.5, -1.6, -10), lift: 3.2 }, { t0: s0, t1: s1 + 0.12, to: plantBy(R0, -13.0, -1.2, -14), lift: 5.0 }, { t0: 1.4, t1: 1.68, to: R0, lift: 3.6 }] },
    }),
  };
}

/** Where his shield's face is as it slams in (his own lengths: before him, to his left, up): the knockback bursts from it (art/kings_knights_fx.ts). */
export const RUSH_SHIELD_AT: V3 = (() => {
  const q = poseFn(rushPlan())(KN_RUSH.hit);
  const sh = shieldOf(solve(B, q as Posed), q);
  return add(sh.c, mul(sh.n, 1.2));
})();

// =============================================================================================
// STRUCK

export const KN_REEL = 0.4;
function reelPlan(): Plan {
  return {
    long: KN_REEL,
    base: R,
    keys: [
      { at: 0, pose: {} },
      { at: 0.07, pose: { px: -2.4, pz: R.pz + 0.4, pitch: -5, bend: -7, faceUp: 16, faceTilt: 6, out: 0.1, ...handR2(add(PLANT_HAND, [-1.2, 0, 0.4]), 0, PLANT_EL - 2) } },
      { at: 0.2, pose: { px: -0.8, pitch: 3, bend: 4, faceUp: 2, faceTilt: 2, ...handR2(add(PLANT_HAND, [-0.4, 0, 0.1]), 0, PLANT_EL - 0.5) } },
      { at: KN_REEL, pose: {} },
    ],
  };
}

// =============================================================================================
// HIS DEATH: to his knee behind his planted sword, the head bowed; the Hush leaves him; the sword falls; he topples

export const KN_DIES = { long: 3.6, knee: 0.7, planted: 0.62, bow: [1.0, 1.3] as const, out: [1.2, 1.8] as const, slip: 2.5, drop: 2.5, fold: 2.8, down: 3.2 } as const;
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3 + 1.4;
const KNEEL_R: Plant = plantBy(R0, -23.0, 0.5, 0);
const KNEEL_L: Plant = plantBy(L0, 1.5, -0.4, 2);
const DOWN_L: Plant = plantBy(L0, KNEEL_R.at[0] - L0.at[0], -0.5, 0);
const mirrorR = (p: Plant): Plant => ({ ...p, at: [p.at[0], -p.at[1]], turn: -p.turn });
function oneKnee(lean: number, body: P): P {
  return { ...kneelHips(B, R, { L: mirrorR(KNEEL_R), R: KNEEL_R }, TUCK, KNEE_DOWN, lean), lk: 0, lkUp: 70, ...body };
}
const bothKnees = (lean: number, body: P): P => ({ ...kneelHips(B, R, { L: DOWN_L, R: KNEEL_R }, TUCK, KNEE_DOWN, lean), ...body });
/** His arms flung out on the floor as he falls: each hand `back` behind its shoulder (before it, if less than nothing) and `out` to its side (from the floor's axes). */
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const Lh: V3 = [s.shoulderL[0] - back, s.shoulderL[1] + out, 3.2];
  const Rh: V3 = [s.shoulderR[0] - back, s.shoulderR[1] - out, 3.2];
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, -0.4]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, -0.4]));
  return { ...body, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const lifted = (p: P, dz: number): P => ({ ...p, pz: (p.pz as number) + dz });
/** Where he plants his sword as he kneels: further before him than he stands it, leaning to him. */
const KNEEL_SWORD: V3 = [26.5, -1.6, 0.6];
const KNEEL_EL = -76;
const KNEEL_HAND = sub(KNEEL_SWORD, mul(heading(0, KNEEL_EL), SWORD.cross + SWORD.blade));
/** His feet through his death: the right back onto its knee, the left a little forward; then the left knee down beside it. */
const DIE_FEET = footwork(B, {
  L: { start: L0, moves: [{ t0: 0.22, t1: 0.46, to: KNEEL_L, lift: 3.0 }, { t0: KN_DIES.slip + 0.08, t1: KN_DIES.fold, to: { ...DOWN_L, pitch: TUCK }, lift: 2.0 }] },
  R: { start: R0, moves: [{ t0: 0.16, t1: 0.5, to: { ...KNEEL_R, pitch: TUCK }, lift: 1.8 }] },
});
const EL_L: V3 = [0.3, 1, -0.4];
const EL_R: V3 = [0.3, -1, -0.4];
function dyingPlans(): { held: Plan; fallen: Plan } {
  const ON_KNEE = oneKnee(4, { yaw: 0, pitch: 3, roll: 1, twist: 0, bend: 5, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 4 });
  const BOWED = oneKnee(8, { yaw: 0, pitch: 5, roll: 1, twist: 0, bend: 12, side: 0, faceTurn: 2, faceUp: -26, faceTilt: 6 });
  const held: Plan = {
    long: KN_DIES.slip,
    base: R,
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.2, pitch: -4, bend: -6, faceUp: 14, out: 0.1, ...handR2(add(PLANT_HAND, [-1.0, 0, 0.3]), 0, PLANT_EL - 1.6) } },
      // the sword lifted from the floor as he goes down onto his right knee
      { at: 0.32, pose: { px: -1.2, pz: R.pz - 6, pitch: 3, bend: 4, faceUp: 6, out: 0.12, ...handR2([17.0, -1.5, 42.0], 0, -70) }, wl: EL_L, wr: EL_R },
      // planted again before him, further out, both hands on its hilt
      { at: KN_DIES.planted, pose: { ...ON_KNEE, out: 0.15, ...handR2(KNEEL_HAND, 0, KNEEL_EL) }, wl: EL_L, wr: EL_R },
      { at: KN_DIES.knee, pose: { ...ON_KNEE, out: 0.15, ...handR2(KNEEL_HAND, 0, KNEEL_EL) }, wl: EL_L, wr: EL_R },
      // his head bowed over his hands
      { at: KN_DIES.bow[0], pose: { ...BOWED, out: 0.2, ...handR2(KNEEL_HAND, 0, KNEEL_EL) }, wl: EL_L, wr: EL_R },
      { at: KN_DIES.bow[1], pose: { ...BOWED, faceUp: -28, out: 0.3, ...handR2(KNEEL_HAND, 0, KNEEL_EL) }, wl: EL_L, wr: EL_R },
      // the Hush leaving him; the pink going out of the sight
      { at: KN_DIES.out[1], pose: { ...BOWED, bend: 13, faceUp: -29, out: 1, ...handR2(KNEEL_HAND, 0, KNEEL_EL) }, wl: EL_L, wr: EL_R },
      { at: 2.2, pose: { ...BOWED, pz: (BOWED.pz as number) - 0.4, bend: 13.5, faceUp: -29, out: 1, ...handR2(KNEEL_HAND, 0, KNEEL_EL) }, wl: EL_L, wr: EL_R },
      { at: KN_DIES.slip, pose: { ...BOWED, pz: (BOWED.pz as number) - 0.6, bend: 14, faceUp: -29, out: 1, ...handR2(KNEEL_HAND, 0, KNEEL_EL) }, wl: EL_L, wr: EL_R },
    ],
    feet: DIE_FEET,
  };
  // (from the slip, his hands measured from the floor: they slide off the hilt and fall; he topples forward)
  const slipPose = poseFn(held)(KN_DIES.slip);
  const sk = solve(B, slipPose as Posed);
  const FOLD = bothKnees(22, { yaw: 3, pitch: 36, roll: 3, twist: 0, bend: 20, side: 1, faceTurn: 6, faceUp: -26, faceTilt: 8 });
  const SLUMP = limp(bothKnees(40, { yaw: 5, pitch: 60, roll: 2, twist: 0, bend: 22, side: 0, faceTurn: 12, faceUp: -40, faceTilt: 12 }), -6, 14);
  const PRONE = limp(lifted(bothKnees(68, { yaw: 7, pitch: 80, roll: 5, twist: 0, bend: 8, side: 0, faceTurn: 28, faceUp: -34, faceTilt: 20 }), 2.8), -3, 16);
  const foldHands = ((): P => {
    const s2 = solve(B, { ...R, ...FOLD, lhIn: 0, rhIn: 0 } as Posed);
    return { lhx: s2.shoulderL[0] - 2, lhy: s2.shoulderL[1] + 7, lhz: Math.max(5, s2.shoulderL[2] - 20), rhx: s2.shoulderR[0] - 2, rhy: s2.shoulderR[1] - 7, rhz: Math.max(5, s2.shoulderR[2] - 20) };
  })();
  const fallen: Plan = {
    long: KN_DIES.long,
    base: { ...R, lhIn: 2, rhIn: 2, out: 1 } as Bones,
    keys: [
      { at: KN_DIES.slip, pose: { ...slipPose, lhIn: 2, lhx: sk.handL[0], lhy: sk.handL[1], lhz: sk.handL[2], rhIn: 2, rhx: sk.handR[0], rhy: sk.handR[1], rhz: sk.handR[2] } },
      { at: KN_DIES.slip + 0.14, pose: { ...slipPose, pz: (slipPose.pz as number) - 0.6, bend: 18, faceUp: -24, lhx: sk.handL[0] + 1.5, lhy: sk.handL[1] + 6, lhz: sk.handL[2] - 9, rhx: sk.handR[0] + 1.5, rhy: sk.handR[1] - 6, rhz: sk.handR[2] - 9 }, wl: EL_L, wr: EL_R },
      { at: KN_DIES.fold, pose: { ...FOLD, ...foldHands }, wl: EL_L, wr: EL_R },
      { at: 3.0, pose: SLUMP },
      { at: KN_DIES.down, pose: PRONE },
      { at: KN_DIES.long, pose: PRONE },
    ],
    feet: DIE_FEET,
  };
  return { held, fallen };
}
function dyingMotion(): Motion {
  const { held, fallen } = dyingPlans();
  const a = poseFn(held);
  const b = poseFn(fallen);
  const keys: Key3[] = [];
  const n = Math.round(KN_DIES.long * FPS);
  for (let i = 0; i <= n; i++) {
    const t = i / FPS;
    keys.push({ at: t, pose: t < KN_DIES.slip - 1e-6 ? a(t) : b(t), ease: 'lin' });
  }
  return { keys };
}

// =============================================================================================
// HIS LIGHTNING STRIKES: their smear; the warning's pink glints

/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const KN_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: KN_CHOP.strike, rush: KN_RUSH.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = KN_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
export const KN_NAMES = {
  stand: 'The king’s knight stands guard',
  setOff: 'The king’s knight sets off',
  walk: 'The king’s knight runs',
  halt: 'The king’s knight stops',
  attack: 'The overhead chop',
  rush: 'The shield rush',
  reel: 'The king’s knight is struck',
  dying: 'He kneels, and the Hush leaves him',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(KN_NAMES).map(([k, v]) => [v, k]));
const PLANS: Record<string, Plan> = { attack: chopPlan(), rush: rushPlan(), setOff: setOffPlan(), halt: haltPlan(), reel: reelPlan() };
const POSES: Record<string, (t: number) => Bones> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const bonesOf = (move: string, t: number): Skeleton => solve(B, POSES[move](Math.max(0, Math.min(PLANS[move].long, t))) as Posed);
/** THE SMEAR: after-images of what strikes. The chop: the blade, root to point, at moments along the way it has come. The rush: streaks from where the game carried him from (behind him: he is drawn where he is) of his helm, his shoulders, his shield's rim, his knees, and outlines of the shield along the way. */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = KN_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = move === 'attack' ? 8 : 5;
  if (move === 'attack') {
    for (let i = 0; i <= n; i++) {
      const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
      const w = swordOf(bonesOf('attack', u));
      out.push([w.cross, lerp3(w.cross, w.tip, 0.5), w.tip]);
    }
  } else {
    // (where he is now, and where each moment of the burst had him, in his own lengths: the game's carry, behind him)
    const now = rushCarried(t) * TILE3;
    const marks = (s: Skeleton, q: Posed): V3[] => {
      const sh = shieldOf(s, q);
      return [add(s.head, [0, 0, 7]), s.shoulderR, s.kneeL, s.kneeR, sh.rim[0], sh.rim[2], sh.rim[5], sh.rim[8], sh.c];
    };
    const samples: V3[][] = [];
    for (let i = 0; i <= n; i++) {
      const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
      const back = rushCarried(Math.max(s0, u)) * TILE3 - now;
      const q = POSES.rush(u) as Posed;
      samples.push(marks(solve(B, q), q).map((p) => add(p, [back, 0, 0])));
      if (i % 2 === 0) {
        const sh = shieldOf(solve(B, q), q);
        out.push([...sh.rim, sh.rim[0]].map((p) => add(p, [back, 0, 0])));
      }
    }
    // (each streak from where he was to just behind where he is: never over him)
    for (let j = 0; j < samples[0].length; j++) out.push(samples.slice(0, -1).map((m) => m[j]));
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** WHAT IS LAID AFTER HIS EDGE IN HIS MOVES: the warning's pink glints running along his blade, or round his shield's rim. */
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  const warn = move === 'attack' ? KN_CHOP.warn : move === 'rush' ? KN_RUSH.warn : null;
  if (!warn || t < warn[0] - 0.12 || t > warn[1] + 0.04) return out;
  const tick = Math.floor(t * 15);
  if (move === 'attack') {
    const w = swordOf(m.s);
    for (let i = 0; i <= 12; i++) if ((i + tick) % 4 === 0) out.push([add(lerp3(w.cross, w.tip, i / 12), [0, 0, 0.8]), (i + tick) % 8 === 0 ? FLAME[4] : FLAME[3], 1]);
  } else {
    const sh = shieldOf(m.s, m.q);
    sh.rim.forEach((p, i) => {
      if ((i + tick) % 3 === 0) out.push([add(p, mul(sh.n, 0.8)), (i + tick) % 2 ? FLAME[3] : FLAME[4], 1]);
    });
  }
  return out;
}
const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] - 0.1 && t <= warn[1] + 0.03 ? clamp01((t - warn[0] + 0.1) / 0.1) : 0);
const SAY: KnightSay = {
  dropped: (m) => !!m.dying && m.t >= KN_DIES.drop,
  hard: (m) => {
    const mv = byName[m.move ?? ''] ?? '';
    return mv === 'attack' ? glow(KN_CHOP.warn)(m.t) : mv === 'rush' ? glow(KN_RUSH.warn)(m.t) : mv === 'walk' ? 0.4 : 0;
  },
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
  shieldGlint: (m) => ((byName[m.move ?? ''] ?? '') === 'rush' ? glow(KN_RUSH.warn)(m.t) : 0),
};

// =============================================================================================
// HIM, AS THE GAME HOLDS A MONSTER

function knightMob(): Mob {
  const paint = knightPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'kings-knight',
    name: 'A king’s knight',
    size: 'medium: a head taller than the knight',
    build: B,
    stand: mv(KN_NAMES.stand, knightStand()),
    attack: mv(KN_NAMES.attack, motionOf(PLANS.attack), { glint: glow(KN_CHOP.warn) }),
    more: {
      rush: mv(KN_NAMES.rush, motionOf(PLANS.rush)),
      setOff: mv(KN_NAMES.setOff, motionOf(PLANS.setOff), { ground: GROUND }),
      halt: mv(KN_NAMES.halt, motionOf(PLANS.halt), { ground: KN_HALT_PACE * TILE3 }),
    },
    idleFrames: 32,
    idleFps: 10,
    walk: mv(KN_NAMES.walk, knightRun(), { period: KN_RUN.frames / KN_RUN.fps, ground: GROUND }),
    walkFrames: KN_RUN.frames,
    walkFps: KN_RUN.fps,
    pace: KN_PACE,
    reel: mv(KN_NAMES.reel, motionOf(PLANS.reel), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: KN_REEL,
    hit: KN_CHOP.hit,
    warn: KN_CHOP.warn[1] - KN_CHOP.warn[0],
    dieTime: KN_DIES.long,
    dying: mv(KN_NAMES.dying, dyingMotion()),
    aura: { x: KN_CANVAS.ax, y: KN_CANVAS.ay - 46, r: 42, color: '#8c90b8', a: 0.06 },
    shadow: 14,
    canvas: KN_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (his sword falls from his hands as they slip and topples to the floor at his right)
    fall(piece) {
      if (piece === 'sword') return { from: KN_DIES.drop, to: [2, -21], spin: 70, lay: 'axis', hop: 1.4 };
      return null;
    },
  };
}
export const KINGS_KNIGHT = knightMob();
export function makeKnightArt3(mob: Mob = KINGS_KNIGHT, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function knightSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.12 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.28 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.8]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.8]), r: 2.1 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.2 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.2 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.45), r: 3.2 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: add(s.head, mul(s.face[2], -0.6)), rot: s.face, h: [B.headR[0] * 1.17, B.headR[1] * 1.36, B.headR[2] * 1.2] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 3.3, B.ribHalf + 2.9, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 3.0, B.waistHalf + 2.8, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 3.0, B.pelvisHalf + 2.9, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function knightThings(move: string, t: number, s: Skeleton, q: Posed): CheckThing[] {
  const out: CheckThing[] = [];
  if (!(move === 'dying' && t >= KN_DIES.drop)) {
    const w = swordOf(s);
    const blade: V3[] = [];
    for (let k = 0.08; k <= 1.0001; k += 0.12) blade.push(lerp3(w.cross, w.tip, k));
    // (the hilt is held where a hand is on it: the right fist, and the left on the grip or over the pommel)
    const ab = sub(w.cross, w.pommel);
    const kL = clamp01(dot(sub(s.handL, w.pommel), ab) / Math.max(1e-6, dot(ab, ab)));
    const onHilt = len3(sub(s.handL, add(w.pommel, mul(ab, kL)))) < 1.0 + B.armR[2] * 1.2 + 2.6;
    out.push({ name: 'sword hilt', pts: [w.pommel, w.cross], r: 1.0, may: q.lhIn === 3 || onHilt ? ['foreR', 'foreL'] : ['foreR'] }, { name: 'sword', pts: blade, r: 0.9, may: [] });
  }
  const sh = shieldOf(s, q);
  out.push({ name: 'shield', pts: [sh.c, ...sh.rim], r: 0.9, may: q.pt > 0.02 ? ['foreL', 'upperL'] : [] });
  return out;
}
const ALL_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying', 'rush', 'setOff', 'halt'];
export const KN_SHAPE: BossShape = {
  body: knightSolids,
  // (what he strikes with: the sword's point; rushing, his shield's face)
  tip: (move, t, s, q) => (move === 'dying' && t >= KN_DIES.drop ? null : move === 'rush' ? shieldOf(s, q).c : swordOf(s).tip),
  things: knightThings,
  strikes: KN_STRIKES,
  smeared: smearedAt,
  // (his sword planted when he stands: he plucks it up to run and plants it again as he stops; every blow begins and ends planted)
  handovers: [
    { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'halt', toAt: 0 },
    { from: 'walk', at: 0, to: 'halt', toAt: 0 },
    { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
    ...['attack', 'rush', 'reel'].flatMap((m): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }]),
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
  ],
};
void ALL_MOVES;
void KITE;
void dot;
void smooth;
