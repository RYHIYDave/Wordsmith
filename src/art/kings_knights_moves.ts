// FLOOR 19'S KING'S KNIGHTS: THEIR MOVES (the art chat, 29 and 30 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// KNIGHTS_ON (art/kings_knights.ts, off). Their look and his brief are art/kings_knights.ts; what their blows leave on the
// floor, art/kings_knights_fx.ts.
//
// HIS PICK OF 30 OCT, “Huge and slow, one each” ("Fewer and much bigger: one or two at a time, a head and a half taller
// than you, a huge two-handed sword, slow, wide sweeping blows."), in place of his first, “Quick for their armour”; and
// his rules for every new enemy: Movement 9, his words of 24 Oct, “Like the wind up and wind down are big but the actual
// punch is lightning quick”, and for the enemies, 28 Oct, “Start from now on, but every enemy is going to need that
// change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”. So:
//
//   STANDING: his greatsword planted point down before him, both gauntlets on its long grip; breathing, the weight
//     shifting, the helm turning slowly; the Hush leaking from the sight.
//   SETTING OFF (`setOff`), WALKING (his walk), STOPPING (`halt`): HUGE AND SLOW. He plucks the greatsword from the floor
//     and lets it swing down round his right side to trail behind him in his right fist, its point low; he walks at
//     KN_PACE tiles a second (the hero runs 4.6), on bent knees, each foot coming down flat with his weight dropping onto
//     it, the helm nodding, the sword bouncing; his left arm swinging; he stops in two steps and plants the sword again.
//   THE WIDE SWEEP (his first blow, his attack): the greatsword plucked up in both hands and hauled round behind him to
//     his right, his body wound right round after it, the blade glinting pink, held shaking (THE WARNING); his hips first,
//     then in two frames the blade sweeps across the whole half-circle before him, smeared, and its sweep tears across the
//     floor three and a half tiles out (art/kings_knights_fx.ts); carried on round to his left, held, brought back and planted.
//   THE OVERHEAD CLEAVE (his second, `more.cleave`): the greatsword heaved up high over his helm in both hands, stepping
//     in, arched back, held shaking (THE WARNING); hips first, then in two frames down into the floor before him
//     (smeared); the floor cracks open in a line six tiles out (art/kings_knights_fx.ts); held; wrenched out; planted.
//   STRUCK: jolted back on his sword, the helm rocked back, the Hush coughed out of the sight.
//   HIS DEATH (the brief's): struck, he sinks onto his right knee behind his planted sword, both hands on its grip, and
//     bows his head over them; the Hush leaves him in one great grey breath, the pink going out of the sight; his hands
//     slip from the grip, the sword falls aside, and he topples forward onto his face and lies still: a man again.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and
// the lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/kings_knights.test.ts

import type { ActorArt } from './actor_types';
import { footwork, kneelHips, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { FLAME } from './mkit';
import { KNIGHT_BODY, KN_CANVAS, KN_FIRST, KN_GROW, SWORD, firstOf, knightPainter, swordOf } from './kings_knights';
import type { KnightSay } from './kings_knights';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, dot, elbowFor, heading, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
// BIGGER STILL (his word on the first pass): every move is drawn in the first pass's lengths, on its body (`KN_FIRST`, 74
// tall), and grown to his (`KNIGHT_BODY`, 87 tall) as the game is given it (`grownPose`): every length alike, so each
// pose is the same pose, only bigger. His pace and his blows' reach are in tiles, as the game has them.
const B = KN_FIRST;
const G = KN_GROW;
/** The sword in the first pass's lengths. */
const SW = { cross: SWORD.cross / G, blade: SWORD.blade / G, lower: SWORD.lower / G } as const;
const LENGTHS = ['px', 'py', 'pz', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'lfx', 'lfy', 'lfz', 'rfx', 'rfy', 'rfz'] as const;
/** A pose in the first pass's lengths, grown to his: every length in it alike (its angles as they are). */
function grownPose<T extends P>(q: T): T {
  const o = { ...q } as Record<string, unknown>;
  for (const f of LENGTHS) if (typeof o[f] === 'number') o[f] = (o[f] as number) * G;
  return o as T;
}
const FPS = 30;
const FR = 1 / FPS;
const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

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
  'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'lk', 'rk', 'lkUp', 'rkUp', 'wAz', 'wEl', 'wRoll', 'draw', 'out', 'gale',
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
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: grownPose(f(i / FPS)), ease: 'lin' });
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
/** A place before his chest, turned `h` degrees to his left, `x` before it and `y` to its left, `z` up: on the floor's axes. */
const beforeChest = (h: number, x: number, y: number, z: number): V3 => [x * Math.cos(h * D) - y * Math.sin(h * D), x * Math.sin(h * D) + y * Math.cos(h * D), z];

// =============================================================================================
// HIS PACE (his pick, “Huge and slow, one each”): a heavy walk, slower than anything the hero meets on two legs

/** His walking pace, tiles a second (the hero runs 4.6: TUNE.heroSpeed): a little quicker than the first pass's 1.2, for his longer legs. */
export const KN_PACE = 1.5;
export const KN_WALK = { frames: 36, fps: 30 } as const;
/** How far the floor goes by under him in a second, his own lengths (the game's). */
const GROUND = KN_PACE * TILE3;
/** How far a foot down goes back under him in a frame, in the first pass's lengths (grown, the floor's own: feet grip). */
const STEP = GROUND / G / KN_WALK.fps;
/** How many frames each foot is flat on the floor in a stride of 36 (both down four frames of each stride). */
const DOWN = 20;
/** Where a foot comes down before him (its ankle: forward of where it stands), set so that he sets off and stops in nine frames from feet side by side. */
const X0 = 0.8 + 9 * STEP;
const TURN = 8;

// =============================================================================================
// HIS REST: HIS GREATSWORD PLANTED BEFORE HIM, BOTH HANDS ON ITS GRIP

/** Where his sword's point rests on the floor as he stands (the first pass's lengths: grown, 0.6 off the floor), and how far from upright it leans (degrees, its hilt toward him). */
const PLANTED0: V3 = [34, -1.0, 0.6 / G];
/** Where his sword's point rests on the floor as he stands, his own lengths. */
export const SWORD_PLANTED: V3 = mul(PLANTED0, G);
const PLANT_EL = -72;
const PLANT_WAY = heading(0, PLANT_EL);
/** His right fist on the grip under the cross, the sword's point on the floor. */
const PLANT_HAND = sub(PLANTED0, mul(PLANT_WAY, SW.cross + SW.blade));
const BASE0: Bones = {
  ...standing(B),
  pz: -0.4, pitch: 2, bend: 2, roll: 0, side: 0, faceUp: -2, faceTilt: 0, faceTurn: 0,
  lfx: 0.8, lfy: 2.0, lfz: 0, lfp: 0, lft: TURN, lk: 8, rfx: 0.8, rfy: -2.0, rfz: 0, rfp: 0, rft: -TURN, rk: -8,
  rhIn: 2, rhx: PLANT_HAND[0], rhy: PLANT_HAND[1], rhz: PLANT_HAND[2], wAz: 0, wEl: PLANT_EL, wRoll: 0,
  lhIn: 3, lhx: SW.lower, lhy: 0, lhz: 0,
  out: 0,
} as Bones;
const LE0 = elbowFor(B, BASE0 as Posed, true, norm([-0.3, 1, -0.6]));
/** His rest in the first pass's lengths. */
const R: Bones = { ...BASE0, le: LE0, re: elbowFor(B, { ...BASE0, le: LE0 } as Posed, false, norm([-0.3, -1, -0.6])) };
/** HIS REST, as he is. */
export const KN_REST: Bones = grownPose(R);
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
/** His rest with his left hand measured from its shoulder (for a move that lets go of the grip). */
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
      pose: grownPose({
        pz: R.pz + 0.9 * breath,
        py: 1.0 * Math.sin(a),
        roll: R.roll + 1.6 * Math.sin(a),
        bend: R.bend - 1.8 * breath,
        pitch: R.pitch + 0.8 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 2 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 2 * Math.sin(a + 2.0),
        faceTurn: R.faceTurn + 6 * Math.sin(a * 0.5 + 0.8),
      }),
    });
  }
  return { loop: 0, keys };
}

// =============================================================================================
// THE WALK (his pick, “Huge and slow, one each”): slow, on bent knees, each foot coming down flat under his weight

/** Feet frame by frame: [forward, up, toes down, to the left (over the stance), turned]. */
type FootAt = readonly [number, number, number, number, number];
const feetOf = (l: FootAt, r: FootAt): P => ({ lfx: l[0], lfz: l[1], lfp: l[2], lfy: l[3], lft: l[4], rfx: r[0], rfz: r[1], rfp: r[2], rfy: r[3], rft: r[4] });
/** A foot rolled up onto its toe, `pitch` degrees, the toe staying at `toe` (forward) on the floor: its ankle [forward, up, to the left over its stance]. */
function rolled(toe: number, pitch: number, turn: number, y0: number): [number, number, number] {
  const p = pitch * D;
  const off = B.ball * Math.cos(p) - B.ankle * Math.sin(p);
  return [toe - off * Math.cos(turn * D), B.ball * Math.sin(p) + B.ankle * Math.cos(p) - B.ankle + 0.05, y0 + (B.ball - off) * Math.sin(turn * D)];
}
/** A foot swung through the air from where it left the floor (`a`) to where it comes down flat (`b`), `u` of the way (0 to 1): lifted low, its toes tipped as it goes. */
function swung(a: FootAt, b: FootAt, u: number, lift: number): FootAt {
  const e = u * u * (3 - 2 * u);
  return [a[0] + (b[0] - a[0]) * e, a[1] * (1 - u) * (1 - u) + lift * Math.sin(Math.PI * u) * (1 - 0.3 * u), a[2] * (1 - u) * (1 - u) - 7 * Math.sin(Math.PI * u) * u, a[3] + (b[3] - a[3]) * e, a[4] + (b[4] - a[4]) * e];
}
/** A foot through his stride, frame by frame from the moment it comes down: flat on the floor DOWN frames (going back under him with the floor), rolled onto its toe two, swung through fourteen. */
function strideOf(side: 'L' | 'R'): FootAt[] {
  const turn = side === 'L' ? TURN : -TURN;
  const y0 = side === 'L' ? 2.0 : -2.0;
  const out: FootAt[] = [];
  for (let k = 0; k < DOWN; k++) out.push([X0 - STEP * k, 0, 0, y0, turn]);
  const toe = X0 - STEP * (DOWN - 1) + B.ball * Math.cos(turn * D);
  for (const [k, p] of [[1, 16], [2, 32]] as const) {
    const [x, z, y] = rolled(toe - STEP * k, p, turn, y0);
    out.push([x, z, p, y, turn]);
  }
  const from = out[out.length - 1];
  const n = KN_WALK.frames - DOWN - 2;
  for (let k = 1; k <= n; k++) out.push(swung(from, [X0, 0, 0, y0, turn], k / (n + 1), 6));
  return out;
}
const STRIDE_L = strideOf('L');
const STRIDE_R = strideOf('R');
/** His body through the walk, frame by frame (frame 0: his left foot just down before him, his right behind him). */
function walkPose(f: number): Bones {
  const N = KN_WALK.frames;
  const a = (2 * Math.PI * f) / N;
  const l = STRIDE_L[f % N];
  const r = STRIDE_R[(f + N / 2) % N];
  // (his weight dropping onto each foot as it comes down: lowest three frames after; high over the foot under him)
  const land = (0.5 + 0.5 * Math.cos(2 * a - (4 * Math.PI * 3) / N)) ** 3;
  const over = Math.cos(a - (2 * Math.PI * (DOWN / 2)) / N);
  const yaw = -5 * Math.cos(a);
  const body: P = {
    px: 0.6, py: 1.8 * over, pz: -3.8 - 2.4 * land,
    yaw, twist: -0.8 * yaw, pitch: 5, bend: 3 + 1.6 * land, roll: 2.0 * over, side: -1.4 * over,
    faceUp: 1 - 3 * land, faceTurn: 0.4 * yaw, faceTilt: -1.2 * over,
    ...feetOf(l, r), lk: 6, rk: -6, lkUp: 0, rkUp: 0, out: 0,
  };
  // the greatsword trailing behind him in his right fist, its point low; his left arm swinging slowly
  const right: V3 = [-0.5 + 2.0 * Math.cos(a), -5.5, -25.5 + 0.8 * land];
  const lx = 2.0 - 7.0 * Math.cos(a);
  const left: V3 = [lx, 5.5, -25.5 + 0.05 * lx * lx];
  const q = { ...R, ...body, rhIn: 1, rhx: right[0], rhy: right[1], rhz: right[2], wAz: -162 + 2 * Math.cos(a), wEl: -25 + 1.5 * Math.cos(a + 0.6) - 1.5 * land, wRoll: 0, lhIn: 1, lhx: left[0], lhy: left[1], lhz: left[2] } as Bones;
  q.le = elbowFor(B, q as Posed, true, norm([-1, 0.6, -0.2]));
  q.re = elbowFor(B, q as Posed, false, norm([-0.6, -1, -0.3]));
  return q;
}
const WALK_POSES: Bones[] = Array.from({ length: KN_WALK.frames }, (_, f) => walkPose(f));
function knightWalk(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= KN_WALK.frames; i++) keys.push({ at: i / KN_WALK.fps, ease: 'lin', pose: grownPose(WALK_POSES[i % KN_WALK.frames]) });
  return { keys, loop: 0 };
}
const WALK0 = WALK_POSES[0];
const WALK0_HAND = onFloor(WALK0, 'R');
const WALK0_KEY: P = { ...WALK0, ...handR2(WALK0_HAND, WALK0.wAz, WALK0.wEl), ...handsL([WALK0.lhx, WALK0.lhy, WALK0.lhz]), le: WALK0.le, re: WALK0.re };

// =============================================================================================
// SETTING OFF: he plucks his sword from the floor, lets it swing down round his right side, and takes his first step;
// the game carries him at his pace from its first frame

export const KN_SETOFF = 9 / FPS;
/** His feet as he sets off: the right stays down (going back under him with the floor); the left rolls up, swings through and comes down before him. */
const SETOFF_FEET: ReadonlyArray<P> = (() => {
  const r: FootAt[] = [];
  for (let f = 0; f <= 9; f++) r.push([R.rfx - STEP * f, 0, 0, -2.0, -TURN]);
  const toe = R.lfx + B.ball * Math.cos(TURN * D);
  const l: FootAt[] = [[R.lfx, 0, 0, 2.0, TURN]];
  for (const [k, p] of [[1, 14], [2, 30]] as const) {
    const [x, z, y] = rolled(toe - STEP * k, p, TURN, 2.0);
    l.push([x, z, p, y, TURN]);
  }
  for (let k = 1; k <= 6; k++) l.push(swung(l[2], STRIDE_L[0], k / 7, 6));
  l.push(STRIDE_L[0]);
  return l.map((x, i) => feetOf(x, r[i]));
})();
function setOffPlan(): Plan {
  const T = KN_SETOFF;
  const keys: Key[] = [
    { at: 0, pose: { ...handsL(REST_L1) } },
    // (the point lifted off the floor, the left hand letting go of the grip)
    { at: 3 / FPS, pose: { px: 0.4, pz: -1.6, pitch: 4, bend: 4, yaw: -2, twist: -2, faceUp: 1, ...handR2([19.5, -10.0, 45.5], -10, -55), ...handsL([12.0, -6.0, -19.0]) }, wl: [-0.6, 1, -0.4], wr: [-0.3, -1, -0.5] },
    // (swung down round his right side, its point clear of the floor)
    { at: 6 / FPS, pose: { px: 0.6, pz: -3.2, pitch: 5, bend: 4, yaw: -3, twist: 1, faceUp: 1, ...handR2([8.0, -22.0, 41.0], -90, -38), ...handsL([4.0, 5.0, -24.0]) }, wl: [-1, 0.6, -0.2], wr: [-0.6, -1, -0.3] },
    { at: T, pose: WALK0_KEY },
  ];
  return { long: T, base: { ...R, ...handsL(REST_L1) } as Bones, keys, feet: (t) => SETOFF_FEET[Math.max(0, Math.min(9, Math.round(t * FPS)))] };
}

// =============================================================================================
// STOPPING: two steps, the sword brought round and planted before him again

export const KN_HALT = 9 / FPS;
/** His feet as he stops: the left stays down (going back under him with the floor); the right rolls up, swings through and comes down beside it. */
const HALT_FEET: ReadonlyArray<P> = (() => {
  const l: FootAt[] = [];
  for (let f = 0; f <= 9; f++) l.push(STRIDE_L[f]);
  const r: FootAt[] = [STRIDE_R[KN_WALK.frames / 2]];
  const r0 = STRIDE_R[KN_WALK.frames / 2][0];
  const toe = r0 + B.ball * Math.cos(TURN * D);
  for (const [k, p] of [[1, 16], [2, 32]] as const) {
    const [x, z, y] = rolled(toe - STEP * k, p, -TURN, -2.0);
    r.push([x, z, p, y, -TURN]);
  }
  const down: FootAt = [R.rfx + STEP, 0, 0, -2.0, -TURN];
  for (let k = 1; k <= 5; k++) r.push(swung(r[2], down, k / 6, 5));
  r.push(down, [R.rfx, 0, 0, -2.0, -TURN]);
  return l.map((x, i) => feetOf(x, r[i]));
})();
function haltPlan(): Plan {
  const T = KN_HALT;
  const keys: Key[] = [
    { at: 0, pose: WALK0_KEY },
    // (swung up round his right side, the point coming forward clear of the floor)
    { at: 3 / FPS, pose: { px: 0.4, pz: -4.2, pitch: 4, bend: 4, yaw: -2, twist: 0, faceUp: 0, ...handR2([8.0, -22.0, 42.0], -90, -38), ...handsL([4.0, 5.5, -23.0]) }, wl: [-1, 0.6, -0.2], wr: [-0.6, -1, -0.3] },
    { at: 6 / FPS, pose: { px: 0.4, pz: -2.4, pitch: 3, bend: 3, yaw: 0, twist: 0, faceUp: -1, ...handR2([19.5, -9.0, 45.5], -10, -58), ...handsL(add(REST_L1, [-4.0, 4.0, -3.0])) }, wl: [-0.5, 1, -0.5], wr: [-0.3, -1, -0.5] },
    { at: T, pose: { ...handR2(PLANT_HAND, 0, PLANT_EL), ...handsL(REST_L1), le: R.le, re: R.re } },
  ];
  return { long: T, base: { ...R, ...handsL(REST_L1) } as Bones, keys, feet: (t) => HALT_FEET[Math.max(0, Math.min(9, Math.round(t * FPS)))] };
}

// =============================================================================================
// THE WIDE SWEEP (his first blow): hauled round behind him, held; across the half-circle before him in two frames

/** Its times: how long; its warning, held from and to; the strike (from the last frame of the wind-up to the frame it lands on); the blow. */
export const KN_SWEEP = { long: 2.7, warn: [0.62, 0.98] as const, strike: [31 / FPS, 33 / FPS] as const, hit: 33 / FPS } as const;
function sweepPlan(): Plan {
  const [w0, w1] = KN_SWEEP.warn;
  const [s0, s1] = KN_SWEEP.strike;
  // (wound: his body turned right round to his right, the hands before his chest at his right hip, the blade out behind him to his right)
  const WOUND: P = { px: -1.0, py: -0.6, pz: -4.5, yaw: -16, twist: -30, pitch: 6, bend: 4, roll: 2, side: -2, faceTurn: 0, faceUp: 4, faceTilt: 0, ...handR2(beforeChest(-46, 10, -6, 58), -150, 30) };
  const shake = (k: number): P => ({ ...WOUND, pz: -4.5 + (k % 2 ? 0.3 : -0.2), rhz: 58 + (k % 2 ? 0.5 : -0.3), wEl: 30 + (k % 2 ? 0.8 : -0.5) });
  // (the hips first: turned back toward the front, the chest and the sword still wound)
  const DRIVE: P = { ...WOUND, yaw: -4, twist: -42, px: -0.2 };
  // (half way: before him, the blade out to his front right)
  const MID: P = { px: 1.0, py: 0.2, pz: -5.0, yaw: 14, twist: 6, pitch: 7, bend: 5, roll: 0, side: 0, faceTurn: 0, faceUp: 2, faceTilt: 0, ...handR2(beforeChest(20, 19, 0, 42), -25, -8) };
  // (landed: swept on round to his left, the blade out to his left)
  const LANDED: P = { px: 1.4, py: 1.0, pz: -5.2, yaw: 26, twist: 28, pitch: 7, bend: 6, roll: -2, side: 1, faceTurn: 0, faceUp: 0, faceTilt: 0, ...handR2(beforeChest(54, 21, 1, 41), 82, -10) };
  const ON: P = { ...LANDED, px: 1.2, pz: -5.6, yaw: 29, twist: 35, bend: 7, ...handR2(beforeChest(64, 20, 1, 39), 112, -16) };
  return {
    long: KN_SWEEP.long,
    base: R,
    strike: KN_SWEEP.strike,
    hit: KN_SWEEP.hit,
    keys: [
      { at: 0, pose: {} },
      // plucked from the floor, its point swung up before him
      { at: 0.14, pose: { px: 0.6, pz: -0.8, pitch: 4, bend: 3, ...handR2([24.0, -3.0, 44.0], -6, -22) }, wl: [-0.3, 1, -0.6], wr: [-0.3, -1, -0.6] },
      // hauled round to his right
      { at: 0.25, pose: { px: 0, pz: -1.6, yaw: -4, twist: -8, pitch: 4, bend: 3, faceUp: 1, ...handR2(beforeChest(-12, 22, -4, 49), -50, -6) }, wl: [-0.2, 1, -0.7], wr: [0, -0.6, -1] },
      { at: 0.38, pose: { px: -0.4, pz: -2.6, yaw: -9, twist: -17, pitch: 4, bend: 3, faceUp: 2, ...handR2(beforeChest(-26, 15, -5, 54), -100, 18) }, wl: [0.3, 0.6, -1], wr: [0.3, -0.3, -1] },
      { at: w0, pose: WOUND, wl: [0.3, 0.6, -1], wr: [0.3, -0.3, -1] },
      { at: 0.72, pose: shake(1), wl: [0.3, 0.6, -1], wr: [0.3, -0.3, -1] },
      { at: 0.82, pose: shake(2), wl: [0.3, 0.6, -1], wr: [0.3, -0.3, -1] },
      { at: 0.9, pose: shake(3), wl: [0.3, 0.6, -1], wr: [0.3, -0.3, -1] },
      { at: w1, pose: shake(4), wl: [0.3, 0.6, -1], wr: [0.3, -0.3, -1] },
      { at: s0, pose: DRIVE, wl: [0.3, 0.6, -1], wr: [0.3, -0.3, -1] },
      { at: s0 + FR, pose: MID, wl: [-0.2, 1, -0.6], wr: [-0.2, -1, -0.6] },
      { at: s1, pose: LANDED, wl: [-0.2, 0.6, -1], wr: [-0.2, -1, -0.5] },
      { at: s1 + 0.13, pose: ON, wl: [-0.2, 0.5, -1], wr: [-0.2, -1, -0.5] },
      { at: 1.42, pose: { ...ON, pz: -5.3, ...handR2(beforeChest(62, 20, 1, 38), 114, -20) }, wl: [-0.2, 0.5, -1], wr: [-0.2, -1, -0.5] },
      // brought back round before him, the point coming down
      { at: 1.84, pose: { px: 0.6, py: 0, pz: -2.4, yaw: 4, twist: 6, pitch: 4, bend: 3, roll: 0, side: 0, faceUp: 0, ...handR2(beforeChest(10, 23, 0, 43), 10, -34) }, wl: [-0.3, 1, -0.6], wr: [-0.3, -1, -0.6] },
      { at: 2.3, pose: { ...handR2(add(PLANT_HAND, [0, 0, 0.7]), 0, PLANT_EL) }, wl: [-0.3, 1, -0.6], wr: [-0.3, -1, -0.6] },
      { at: KN_SWEEP.long, pose: { le: R.le, re: R.re } },
    ],
    feet: footwork(B, {
      L: { start: L0, moves: [{ t0: s0, t1: s1 + 0.1, to: plantBy(L0, 0, 0, 0, { pitch: 0 }) }] },
      R: { start: R0, moves: [{ t0: 0.2, t1: 0.46, to: plantBy(R0, -7.0, -2.5, -22), lift: 3.6 }, { t0: 1.9, t1: 2.2, to: R0, lift: 3.4 }] },
    }),
  };
}

// =============================================================================================
// THE OVERHEAD CLEAVE (his second blow): heaved high in both hands, held; over and down in two frames; the floor cracks

export const KN_CLEAVE = { long: 2.3, warn: [0.6, 1.0] as const, strike: [32 / FPS, 34 / FPS] as const, hit: 34 / FPS } as const;
/** His fists as the blow lands (the first pass's lengths), and the blade's way then: its point down on the floor before him (grown, 1.4 off it). */
const CLEAVE_HAND: V3 = [31.0, -1.6, 29.0];
const CLEAVE_EL = Math.asin((1.4 / G - CLEAVE_HAND[2]) / (SW.cross + SW.blade)) / D;
/** Where the blade bites the floor (its point; his own lengths before him): the crack runs on from here (art/kings_knights_fx.ts). */
export const CHOP_AT = G * (CLEAVE_HAND[0] + (SW.cross + SW.blade) * Math.cos(CLEAVE_EL * D));
function cleavePlan(): Plan {
  const [w0, w1] = KN_CLEAVE.warn;
  const [s0, s1] = KN_CLEAVE.strike;
  // (raised: both fists high over his helm, the blade back and up behind him; `el` past upright: over the top)
  const RAISED: P = { px: 4.0, py: 0.4, pz: -1.0, pitch: -4, bend: -11, yaw: 2, twist: -4, side: 0, roll: 0, faceUp: 14, faceTurn: 0, ...handR2([4.0, -2.0, 85.0], 0, 148) };
  const shake = (k: number): P => ({ ...RAISED, rhz: 85.0 + (k % 2 ? 0.7 : -0.4), rhx: 4.0 - 0.25 * (k % 2), rhy: -2.0 + (k % 2 ? -0.3 : 0.2), px: 4.0 - 0.2 * (k % 2) });
  // (the hips first: driven forward and tipped, the chest and the sword still back)
  const DRIVE: P = { ...RAISED, px: 6.5, pz: -1.8, pitch: 6, bend: -19, faceUp: 12 };
  // (over the top: half way, the blade before him pointing up, his fists out over his head)
  const OVER: P = { px: 6.0, py: -0.2, pz: -3.4, pitch: 10, bend: 0, yaw: 0, twist: 0, side: 0, roll: 0, faceUp: 8, faceTurn: 0, ...handR2([27.0, -1.8, 74.0], 0, 45) };
  // (struck: the blade down into the floor before him, his arms out after it, deep in the lunge)
  const STRUCK: P = { px: 7.0, py: -0.4, pz: -8.0, pitch: 16, bend: 21, yaw: -2, twist: 2, side: 0, roll: 0, faceUp: -2, faceTurn: 0, ...handR2(CLEAVE_HAND, 0, CLEAVE_EL) };
  // (the fists held where they struck, the body sinking on after them, the point biting the floor)
  const ON: P = { ...STRUCK, px: 7.8, pz: -9.0, pitch: 18, bend: 23 };
  return {
    long: KN_CLEAVE.long,
    base: R,
    strike: KN_CLEAVE.strike,
    hit: KN_CLEAVE.hit,
    keys: [
      { at: 0, pose: {} },
      // plucked from the floor, swung up point first before him, stood upright
      { at: 0.1, pose: { px: 0.3, pz: -0.1, pitch: 1, bend: 0, faceUp: 0, ...handR2([22.0, -1.6, 47.0], 0, -14) }, wl: [-0.3, 1, -0.5], wr: [-0.3, -1, -0.5] },
      { at: 0.2, pose: { px: 0.6, pz: 0.2, pitch: 0, bend: -1, faceUp: 2, ...handR2([17.0, -1.6, 50.0], 0, 72) }, wl: [-0.2, 1, -0.6], wr: [-0.2, -1, -0.6] },
      // heaved up over his helm as he steps in
      { at: 0.4, pose: { px: 2.8, pz: 0.1, pitch: -2, bend: -6, faceUp: 10, ...handR2([10.0, -2.0, 76.0], 0, 112) }, wl: [0, 1, -0.2], wr: [0, -1, -0.2] },
      { at: w0, pose: RAISED, wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: 0.7, pose: shake(1), wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: 0.8, pose: shake(2), wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: 0.9, pose: shake(3), wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: w1, pose: shake(4), wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: s0, pose: DRIVE, wl: [-0.1, 1, 0.2], wr: [-0.1, -1, 0.2] },
      { at: s0 + FR, pose: OVER, wl: [0.3, 1, -0.1], wr: [0.3, -1, -0.1] },
      { at: s1, pose: STRUCK, wl: [0.2, 1, -0.5], wr: [0.2, -1, -0.5] },
      { at: s1 + 0.1, pose: ON, wl: [0.2, 1, -0.5], wr: [0.2, -1, -0.5] },
      { at: 1.38, pose: { ...ON, pz: -8.8, faceUp: 0 }, wl: [0.2, 1, -0.5], wr: [0.2, -1, -0.5] },
      // wrenched up out of the floor
      { at: 1.62, pose: { px: 4.4, pz: -4.4, pitch: 8, bend: 8, yaw: 0, twist: 0, faceUp: 4, ...handR2([26.0, -1.6, 43.0], 0, 8) }, wl: [0, 1, -0.5], wr: [0, -1, -0.5] },
      // stepping back, the sword brought round point down
      { at: 1.88, pose: { px: 1.4, pz: -1.4, pitch: 3, bend: 3, faceUp: 0, ...handR2([26.0, -1.4, 43.0], 0, -36) }, wl: [-0.2, 1, -0.5], wr: [-0.2, -1, -0.5] },
      { at: 2.1, pose: { ...handR2(add(PLANT_HAND, [0, 0, 0.7]), 0, PLANT_EL) } },
      { at: KN_CLEAVE.long, pose: {} },
    ],
    feet: footwork(B, {
      L: { start: L0, moves: [{ t0: 0.2, t1: 0.46, to: plantBy(L0, 15.0, 0.5, -4), lift: 5.0 }, { t0: 1.74, t1: 2.02, to: L0, lift: 3.8 }] },
      R: { start: R0, moves: [{ t0: s0 - 0.04, t1: s1, to: plantBy(R0, 0, 0, 4, { pitch: 26 }) }, { t0: 1.62, t1: 1.84, to: plantBy(R0, 0, 0, 0, { pitch: 0 }) }] },
    }),
  };
}

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
/** How high his knee stands off the floor as he kneels on it: its thick cop (the first pass's lengths). */
const KNEE_DOWN0 = B.legR[1] * 1.3 + 2.0;
/** How high his knee stands off the floor as he kneels on it, his own lengths. */
export const KNEE_DOWN = KNEE_DOWN0 * G;
const KNEEL_R: Plant = plantBy(R0, -23.0, 0.5, 0);
const KNEEL_L: Plant = plantBy(L0, 2.0, -0.4, 2);
const DOWN_L: Plant = plantBy(L0, KNEEL_R.at[0] - L0.at[0], -0.5, 0);
const mirrorR = (p: Plant): Plant => ({ ...p, at: [p.at[0], -p.at[1]], turn: -p.turn });
function oneKnee(lean: number, body: P): P {
  return { ...kneelHips(B, R, { L: mirrorR(KNEEL_R), R: KNEEL_R }, TUCK, KNEE_DOWN0, lean), lk: 0, lkUp: 70, ...body };
}
const bothKnees = (lean: number, body: P): P => ({ ...kneelHips(B, R, { L: DOWN_L, R: KNEEL_R }, TUCK, KNEE_DOWN0, lean), ...body });
/** His arms flung out on the floor as he falls: each hand `back` behind its shoulder (before it, if less than nothing) and `out` to its side (from the floor's axes). */
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const Lh: V3 = [s.shoulderL[0] - back, s.shoulderL[1] + out, 5.4];
  const Rh: V3 = [s.shoulderR[0] - back, s.shoulderR[1] - out, 5.4];
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, -0.4]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, -0.4]));
  return { ...body, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const lifted = (p: P, dz: number): P => ({ ...p, pz: (p.pz as number) + dz });
/** Where he plants his sword as he kneels: further before him than he stands it, leaning to him. */
const KNEEL_SWORD: V3 = [48, -1.6, 0.6 / G];
const KNEEL_EL = -58;
const KNEEL_HAND = sub(KNEEL_SWORD, mul(heading(0, KNEEL_EL), SW.cross + SW.blade));
/** His feet through his death: the right back onto its knee, the left a little forward; then the left knee down beside it. */
const DIE_FEET = footwork(B, {
  L: { start: L0, moves: [{ t0: 0.22, t1: 0.46, to: KNEEL_L, lift: 3.0 }, { t0: KN_DIES.slip + 0.08, t1: KN_DIES.fold, to: { ...DOWN_L, pitch: TUCK }, lift: 2.0 }] },
  R: { start: R0, moves: [{ t0: 0.16, t1: 0.5, to: { ...KNEEL_R, pitch: TUCK }, lift: 1.8 }] },
});
const EL_L: V3 = [0.3, 1, -0.4];
const EL_R: V3 = [0.3, -1, -0.4];
function dyingPlans(): { held: Plan; fallen: Plan } {
  const ON_KNEE = oneKnee(1, { yaw: 0, pitch: 2, roll: 1, twist: 0, bend: 3, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 4 });
  const BOWED = oneKnee(2, { yaw: 0, pitch: 3, roll: 1, twist: 0, bend: 6, side: 0, faceTurn: 2, faceUp: -26, faceTilt: 6 });
  const held: Plan = {
    long: KN_DIES.slip,
    base: R,
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.2, pitch: -4, bend: -6, faceUp: 14, out: 0.1, ...handR2(add(PLANT_HAND, [-1.0, 0, 0.3]), 0, PLANT_EL - 1.6) } },
      // the sword lifted from the floor as he goes down onto his right knee
      { at: 0.32, pose: { px: -1.2, pz: R.pz - 6, pitch: 3, bend: 4, faceUp: 6, out: 0.12, ...handR2([20.0, -1.5, 46.0], 0, -64) }, wl: EL_L, wr: EL_R },
      // planted again before him, further out, both hands on its grip
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
  // (from the slip, his hands measured from the floor: they slide off the grip and fall; he topples forward)
  const slipPose = poseFn(held)(KN_DIES.slip);
  const sk = solve(B, slipPose as Posed);
  const FOLD = bothKnees(22, { yaw: 3, pitch: 36, roll: 3, twist: 0, bend: 20, side: 1, faceTurn: 6, faceUp: -26, faceTilt: 8 });
  const SLUMP = limp(bothKnees(40, { yaw: 5, pitch: 60, roll: 2, twist: 0, bend: 22, side: 0, faceTurn: 12, faceUp: -40, faceTilt: 12 }), -6, 16);
  const PRONE = limp(lifted(bothKnees(68, { yaw: 7, pitch: 80, roll: 5, twist: 0, bend: 8, side: 0, faceTurn: 28, faceUp: -34, faceTilt: 20 }), 3.6), -3, 18);
  const foldHands = ((): P => {
    const s2 = solve(B, { ...R, ...FOLD, lhIn: 0, rhIn: 0 } as Posed);
    return { lhx: s2.shoulderL[0] - 2, lhy: s2.shoulderL[1] + 8, lhz: Math.max(6, s2.shoulderL[2] - 22), rhx: s2.shoulderR[0] - 2, rhy: s2.shoulderR[1] - 8, rhz: Math.max(6, s2.shoulderR[2] - 22) };
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
    keys.push({ at: t, pose: grownPose(t < KN_DIES.slip - 1e-6 ? a(t) : b(t)), ease: 'lin' });
  }
  return { keys };
}

// =============================================================================================
// HIS LIGHTNING STRIKES: their smear; the warning's pink glints

/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const KN_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: KN_SWEEP.strike, cleave: KN_CLEAVE.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = KN_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
export const KN_NAMES = {
  stand: 'The king’s knight stands guard',
  setOff: 'The king’s knight sets off',
  walk: 'The king’s knight walks',
  halt: 'The king’s knight stops',
  attack: 'The wide sweep',
  cleave: 'The overhead cleave',
  reel: 'The king’s knight is struck',
  dying: 'He kneels, and the Hush leaves him',
} as const;
const byName: Record<string, string> = Object.fromEntries(Object.entries(KN_NAMES).map(([k, v]) => [v, k]));
const PLANS: Record<string, Plan> = { attack: sweepPlan(), cleave: cleavePlan(), setOff: setOffPlan(), halt: haltPlan(), reel: reelPlan() };
const POSES: Record<string, (t: number) => Bones> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
const bonesOf = (move: string, t: number): Skeleton => solve(KNIGHT_BODY, grownPose(POSES[move](Math.max(0, Math.min(PLANS[move].long, t)))) as Posed);
/** THE SMEAR: after-images of the blade, root to point, at moments along the way it has come (the sweep's fanned round the half-circle, the cleave's over the top and down). */
function smearOf(move: string, t: number): V3[][] | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = KN_STRIKES[move];
  const to = Math.min(t, s1);
  const out: V3[][] = [];
  const n = move === 'attack' ? 12 : 8;
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const w = swordOf(bonesOf(move, u));
    out.push([w.cross, lerp3(w.cross, w.tip, 0.5), w.tip]);
  }
  return t > s1 + 1e-6 ? out.slice(Math.floor(out.length / 2)) : out;
}
/** WHAT IS LAID AFTER HIS EDGE IN HIS MOVES: the warning's pink glints running along his blade. */
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  const warn = move === 'attack' ? KN_SWEEP.warn : move === 'cleave' ? KN_CLEAVE.warn : null;
  if (!warn || t < warn[0] - 0.12 || t > warn[1] + 0.04) return out;
  const tick = Math.floor(t * 15);
  const w = swordOf(m.s);
  for (let i = 0; i <= 14; i++) if ((i + tick) % 4 === 0) out.push([add(lerp3(w.cross, w.tip, i / 14), [0, 0, 0.8]), (i + tick) % 8 === 0 ? FLAME[4] : FLAME[3], 1]);
  return out;
}
const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] - 0.1 && t <= warn[1] + 0.03 ? clamp01((t - warn[0] + 0.1) / 0.1) : 0);
const SAY: KnightSay = {
  dropped: (m) => !!m.dying && m.t >= KN_DIES.drop,
  hard: (m) => {
    const mv = byName[m.move ?? ''] ?? '';
    return mv === 'attack' ? glow(KN_SWEEP.warn)(m.t) : mv === 'cleave' ? glow(KN_CLEAVE.warn)(m.t) : mv === 'walk' ? 0.25 : 0;
  },
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
};

// =============================================================================================
// HIM, AS THE GAME HOLDS A MONSTER

function knightMob(): Mob {
  const paint = knightPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: KN_REST, ...more });
  return {
    id: 'kings-knight',
    name: 'A king’s knight',
    size: 'huge: half as tall again as the knight, one at a time',
    build: KNIGHT_BODY,
    stand: mv(KN_NAMES.stand, knightStand()),
    attack: mv(KN_NAMES.attack, motionOf(PLANS.attack), { glint: glow(KN_SWEEP.warn) }),
    more: {
      cleave: mv(KN_NAMES.cleave, motionOf(PLANS.cleave), { glint: glow(KN_CLEAVE.warn) }),
      setOff: mv(KN_NAMES.setOff, motionOf(PLANS.setOff), { ground: GROUND }),
      halt: mv(KN_NAMES.halt, motionOf(PLANS.halt), { ground: GROUND }),
    },
    idleFrames: 32,
    idleFps: 10,
    walk: mv(KN_NAMES.walk, knightWalk(), { period: KN_WALK.frames / KN_WALK.fps, ground: GROUND }),
    walkFrames: KN_WALK.frames,
    walkFps: KN_WALK.fps,
    pace: KN_PACE,
    reel: mv(KN_NAMES.reel, motionOf(PLANS.reel), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: KN_REEL,
    hit: KN_SWEEP.hit,
    warn: KN_SWEEP.warn[1] - KN_SWEEP.warn[0],
    dieTime: KN_DIES.long,
    dying: mv(KN_NAMES.dying, dyingMotion()),
    aura: { x: KN_CANVAS.ax, y: KN_CANVAS.ay - Math.round(52 * G), r: Math.round(52 * G), color: '#8c90b8', a: 0.06 },
    shadow: Math.round(19 * G),
    canvas: KN_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (his sword falls from his hands as they slip and topples to the floor at his right)
    fall(piece) {
      if (piece === 'sword') return { from: KN_DIES.drop, to: [-6 * G, -50 * G], spin: -8, lay: 'axis', hop: 1.4 };
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
/** His solids as the checks see them: worked out in the first pass's lengths and grown to his. */
export function knightSolids(sk: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const { limbs, lumps } = firstSolids(firstOf(sk));
  return {
    limbs: limbs.map((l) => ({ ...l, a: mul(l.a, G), b: mul(l.b, G), r: l.r * G })),
    lumps: lumps.map((l) => ({ ...l, c: mul(l.c, G), h: mul(l.h, G) })),
  };
}
function firstSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
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
    for (let k = 0.06; k <= 1.0001; k += 0.08) blade.push(lerp3(w.cross, w.tip, k));
    // (the grip is held where a hand is on it: the right fist, and the left on it too)
    const ab = sub(w.cross, w.pommel);
    const kL = clamp01(dot(sub(s.handL, w.pommel), ab) / Math.max(1e-6, dot(ab, ab)));
    const onHilt = len3(sub(s.handL, add(w.pommel, mul(ab, kL)))) < G * (1.0 + B.armR[2] * 1.2 + 2.6);
    out.push({ name: 'sword hilt', pts: [w.pommel, w.cross], r: 1.0 * G, may: q.lhIn === 3 || onHilt ? ['foreR', 'foreL'] : ['foreR'] }, { name: 'sword', pts: blade, r: 0.9 * G, may: [] });
  }
  return out;
}
export const KN_SHAPE: BossShape = {
  body: knightSolids,
  // (what he strikes with: the greatsword's point)
  tip: (move, t, s) => (move === 'dying' && t >= KN_DIES.drop ? null : swordOf(s).tip),
  things: knightThings,
  strikes: KN_STRIKES,
  smeared: smearedAt,
  // (his sword planted when he stands: he plucks it up to walk and plants it again as he stops; every blow begins and ends planted)
  handovers: [
    { from: 'stand', at: 0, to: 'setOff', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'walk', toAt: 0 },
    { from: 'setOff', at: 'end', to: 'halt', toAt: 0 },
    { from: 'walk', at: 0, to: 'halt', toAt: 0 },
    { from: 'halt', at: 'end', to: 'stand', toAt: 0 },
    ...['attack', 'cleave', 'reel'].flatMap((m): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }]),
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
  ],
};
