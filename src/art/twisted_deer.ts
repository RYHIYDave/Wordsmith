// FLOOR 9'S MEDIUM MOB, THE TWISTED DEER OF THE PINEWOOD: a mock-up (nothing of the game imports this file;
// `TWISTED_DEER_ON` is off).
//
// HIS DESIGN DOC: "Twisted Deer | Medium | An antler gore; a rearing stomp."
//
// HIS BRIEF, asked as his art rulebook's questions for a new character (15 Oct, by 13:17, each his pick, the labels as
// he tapped them): what it is, “A deer grown through with roots” (not the recommended pick); how big, “Pony-sized,
// dangerous in a pack (Recommended)”; how it moves, “Jerky and wrong, a fast hitching limp (Recommended)”; the one thing
// to know it by, “Its antlers grown crooked into thorns (Recommended)”; its rearing stomp, “Thorns burst from the
// ground” (not the recommended pick); how it dies, “It splits apart into roots and bark” (not the recommended pick);
// what it must never look like, “Not a cute Bambi (Recommended)”; its sound (sound rule 7), “Creaking wood, a strangled
// bleat (Recommended)”.
//
// READ AS, NOT ASKED (the pictures are to show them): an enemy, so its eyes burn the enemy's pink to gold and its edge
// is pink while it lives; nothing cyan; a deer gone to wood: its right hind leg wholly a twisted root ending in a splay
// of roots for a foot (so it limps), the others bark and root below the knee; bark plates and roots grown out along its
// back; roots burst through its sides; moss; its antlers crooked, uneven, bramble-thorned; gaunt, never soft.
//
// NOT ON THE HEROES' BONES: painted from its own solids, as the Hollow Stag is, in the same painter.
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves), and its stand: jerky and wrong.

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
export const TWISTED_DEER_ON = { on: false };

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
// ITS COLOURS: a sickly grey-taupe hide gone patchy; dark umber bark where it has turned to wood; the swamp's dark
// violet roots (as the Stag's); moss; its antlers dead wood bleached pale, their thorns' points black; its eyes the enemy's pink
// burning to gold (FLAME). Nothing of it glows cyan; nothing soft.

const HIDE: Ramp = ['#1e181e', '#3a3036', '#5e5254', '#867872', '#a89a8e'];
const BARK: Ramp = ['#120c0c', '#241816', '#3a2820', '#58402c', '#74583a'];
const THORN: Ramp = ['#3a2e30', '#5e4e4a', '#8e7c70', '#bcae9c', '#e0d4c0'];
const POINT: Ramp = ['#120c0c', '#1e1414', '#2e201c', '#46302a', '#5e4436'];
const ROOT: Ramp = ['#120a16', '#22142a', '#3a2642', '#58405c', '#78607a'];
const MOSS: Ramp = ['#141e14', '#22341e', '#36502a', '#52703a', '#748c4c'];
const HOOF: Ramp = ['#0a070c', '#140e14', '#241a22', '#362832', '#4a3844'];
const NOSE: Ramp = ['#0a070c', '#0a070c', '#1a1218', '#2c2026', '#3e3038'];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high, his chest about 40 up). x forward, y to its left, z up; its own
// frame has its floor point under its middle at the origin. Pony-sized: its withers about 40 up, its antlers to about
// the knight's head.

const PIVOT: V3 = [0, 0, 30];
/** Its feet at rest, on the floor: its right fore, left fore, right hind (the root, with no hoof), left hind. */
export const DEER_FEET: V3[] = [
  [11, -4.6, 0],
  [11, 4.6, 0],
  [-17, -5.2, 0],
  [-17, 5, 0],
];
/** Where each leg leaves its body. */
const LEG_TOP: V3[] = [
  [12, -5.4, 29],
  [12, 5.4, 29],
  [-16, -5.4, 31],
  [-16, 5.4, 31],
];
const UPPER = [8.5, 11.5];
const HIND_UPPER = [10, 12];
/** Its lower leg, rigid from the foot up: the knee (front) or the hock (hind), and the fetlock. */
const FORE_KNEE: V3 = [-1.5, 0, 12.5];
const FORE_FET: V3 = [-1.2, 0, 4];
const HIND_HOCK: V3 = [-2.6, 0, 14];
const HIND_FET: V3 = [-0.6, 0, 4];
/** Its root leg: its right hind. */
const ROOT_LEG = 2;
const NECK_ROOT: V3 = [16, 0, 34];
const NECK_LONG = 13;
const NECK_REST: V3 = [12, 0, 5];
const SKULL_PITCH = 34;

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: fifteen frames a second, a loop of 2 s: jerky and wrong: its head snapping round and held, a shudder, its root leg lifted and set down. */
export const DEER_STAND = { frames: 30, fps: 15, period: 2.0 } as const;
/** In its stand: its head's two snaps, its shudder, its root leg's lift. */
export const DEER_HABITS = { snaps: [0.3, 1.2], shudder: [1.0, 1.2], lift: [0.78, 1.04] } as const;

/** The canvas it is painted on, and its floor point on it. */
export const DEER_CANVAS = { w: 240, h: 200, ax: 110, ay: 150 };
const DEER_AURA = { x: DEER_CANVAS.ax, y: DEER_CANVAS.ay - 22, r: 40, color: '#ff3a78', a: 0.08 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

interface DeerPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  neck: number;
  head: [number, number, number];
  ears: number;
  tail: number;
  feet: V3[];
  fold: number[];
  breath: number;
  eyes: number;
  alive: boolean;
  drag: V3;
  chips: [V3, string, number][];
  flares: [V3, number, number][];
}

const REST: DeerPose = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, neck: 0, head: [0, 0, 0], ears: 0, tail: 0, feet: DEER_FEET, fold: [0, 0, 0, 0], breath: 0, eyes: 1, alive: true, drag: [0, 0, 0], chips: [], flares: [] };

/** A snap of its head: wrenched round in a few hundredths of a second at `t0`, held, and let back slowly. */
function snap(t: number, t0: number): number {
  if (t < t0) return 0;
  if (t < t0 + 0.07) return sm((t - t0) / 0.07);
  if (t < t0 + 0.32) return 1;
  return 1 - sm((t - t0 - 0.32) / 0.38);
}

/**
 * Its stand, jerky and wrong (his pick): it breathes, short and quick; its head is wrenched round, held, and let back,
 * twice; a shudder runs through it; it lifts its root leg and sets it down on the spot it left, with a jolt.
 */
function standPose(t0: number): DeerPose {
  const T = DEER_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (Math.PI * 2 * t) / T;
  const breath = Math.sin(2 * a);
  const [s1, s2] = DEER_HABITS.snaps;
  const k1 = snap(t, s1);
  const k2 = snap(t, s2);
  const [h0, h1] = DEER_HABITS.shudder;
  const shudder = bump(t, h0, h1) * Math.sin(t * 95);
  const [l0, l1] = DEER_HABITS.lift;
  const lift = bump(t, l0, l1);
  const jolt = bump(t, l1 - 0.02, l1 + 0.16);
  const feet = DEER_FEET.map((f) => f);
  feet[ROOT_LEG] = [DEER_FEET[ROOT_LEG][0] - 1.5 * lift, DEER_FEET[ROOT_LEG][1], 5 * lift];
  return {
    ...REST,
    y: 0.5 * Math.sin(a),
    z: 0.35 * breath - 0.9 * jolt + 0.25 * shudder,
    roll: 1.2 * Math.sin(a) + 1.6 * shudder + 1.5 * lift,
    pitch: 1.2 * jolt,
    yaw: 0.8 * Math.sin(a + 1),
    neck: -4 * k1 + 6 * k2 + 2 * Math.sin(a),
    head: [16 * k1 - 12 * k2 + 2 * shudder, -6 * k1 + 12 * k2, 12 * k1 - 8 * k2],
    ears: -25 * bump(t, 0.55, 0.75) - 15 * k2,
    tail: 30 * bump(t, 1.45, 1.7),
    feet,
    fold: [0, 0, 30 * lift, 0],
    breath,
    eyes: 1 + 0.2 * Math.sin(a * 3) + 0.4 * k1,
  };
}

function basePose(which: string, t: number): DeerPose {
  void which;
  return standPose(t);
}
function poseOf(which: string, t: number): DeerPose {
  const P = basePose(which, t);
  const before = basePose(which, t - 0.1);
  P.drag = sub(worldOf(P, [0, 0, 30]), worldOf(before, [0, 0, 30]));
  return P;
}

// ---------------------------------------------------------------------------------------------
// ITS PAINTER

function turn(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D);
  const cp = Math.cos(pitch * D), sp = Math.sin(pitch * D);
  const cr = Math.cos(roll * D), sr = Math.sin(roll * D);
  const r1: V3 = [v[0], v[1] * cr - v[2] * sr, v[1] * sr + v[2] * cr];
  const r2: V3 = [r1[0] * cp + r1[2] * sp, r1[1], -r1[0] * sp + r1[2] * cp];
  return [r2[0] * cy - r2[1] * sy, r2[0] * sy + r2[1] * cy, r2[2]];
}
function worldOf(P: DeerPose, p: V3): V3 {
  return add(add([P.x, P.y, P.z], PIVOT), turn(sub(p, PIVOT), P.yaw, P.pitch, P.roll));
}
function turned(P: DeerPose, v: V3): V3 {
  return turn(v, P.yaw, P.pitch, P.roll);
}
interface HeadFrame {
  at: V3;
  f: V3;
  l: V3;
  u: V3;
  p: (v: V3) => V3;
  q: (v: V3) => V3;
}
function headFrame(P: DeerPose): HeadFrame {
  const root = worldOf(P, NECK_ROOT);
  const along = turned(P, turn(norm(NECK_REST), 0, P.neck, 0));
  const at = add(root, mul(along, NECK_LONG));
  const [hy, hp, hr] = P.head;
  const skull = (v: V3): V3 => turned(P, turn(turn(v, 0, SKULL_PITCH, 0), hy, hp, hr));
  const crown = (v: V3): V3 => turned(P, turn(v, hy, hp, hr));
  return { at, f: skull([1, 0, 0]), l: skull([0, 1, 0]), u: skull([0, 0, 1]), p: (v) => add(at, skull(v)), q: (v) => add(at, crown(v)) };
}
function joint(a: V3, c: V3, l1: number, l2: number, hint: V3): V3 {
  const d0 = sub(c, a);
  const d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, len(d0)));
  const n = norm(d0);
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  const side = norm(sub(hint, mul(n, dot(hint, n))), [0, 0, 1]);
  return add(add(a, mul(n, along)), mul(side, h));
}
const lowerOf = (foot: V3, v: V3, fold: number): V3 => add(foot, turn(v, 0, fold, 0));
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
/** Its hide, gone patchy: grey hair lying in streaks, bark broken through it in patches, moss on the bark where it faces up. */
function hideSkin(seed: number, barked: number): Skin {
  return (u, tone) => {
    const n = patch(u, 2.8, seed);
    if (n > 1 - barked) {
      if (u[2] > 0.35 && patch(u, 5, seed + 3) > 0.62) return MOSS[Math.max(1, Math.min(4, tone))];
      const grain = fr(u[2] * 5 + u[0] * 2.4 + 0.5 * Math.sin(u[1] * 7 + seed)) < 0.28;
      return BARK[Math.max(0, Math.min(4, tone - (grain ? 1 : 0)))];
    }
    const streak = fr(u[2] * 4 + u[0] * 1.2 + 0.3 * Math.sin(u[1] * 6 + seed)) < 0.22;
    return HIDE[Math.max(0, Math.min(4, tone - (streak ? 1 : 0)))];
  };
}
/** Bark: dark wood, its grain running along it, knotted. */
function barkSkin(seed: number): Skin {
  return (u, tone) => {
    const grain = fr(u[0] * 3.2 + 0.4 * Math.sin(u[1] * 5 + u[2] * 4 + seed)) < 0.3;
    if (u[2] > 0.5 && patch(u, 4, seed) > 0.68) return MOSS[Math.max(1, Math.min(4, tone))];
    return BARK[Math.max(0, Math.min(4, tone - (grain ? 1 : 0)))];
  };
}

const VIEWS = new Map<GameView, V3>();
function eyeOf(view: GameView): V3 {
  let e = VIEWS.get(view);
  if (!e) VIEWS.set(view, (e = stage(view, 0, 0, { w: 2, h: 2 }).eye));
  return e;
}

/** A crooked line through points (its antlers, its roots): each stretch a rod, tapering from `r0` to `r1`. */
function crooked(put: Put, part: string, piece: string, pts: V3[], r0: number, r1: number, ramp: Ramp): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const k0 = i / (pts.length - 1);
    const k1 = (i + 1) / (pts.length - 1);
    put(part, `${piece}${i}`, { k: 'rod', a: pts[i], b: pts[i + 1], ra: r0 + (r1 - r0) * k0, rb: r0 + (r1 - r0) * k1, ramp });
  }
}
/** Thorns along a crooked line: short, sharp, pointing every way off it, of `wood` with `point`s. */
function thorns(put: Put, part: string, piece: string, pts: V3[], each: number, long: number, seed: number, wood: Ramp, point: Ramp, r0 = 1, r1 = 0.5): void {
  for (let i = 0; i < pts.length - 1; i++) {
    const dir = norm(sub(pts[i + 1], pts[i]));
    const s1 = norm(cross(dir, [0, 0, 1]), [0, 1, 0]);
    const s2 = norm(cross(dir, s1));
    for (let j = 0; j < each; j++) {
      const k = (j + 0.5 + 0.4 * (hash(i, j, seed) - 0.5)) / each;
      const a = hash(i, j + 7, seed) * Math.PI * 2;
      const out = norm(add(add(mul(s1, Math.cos(a)), mul(s2, Math.sin(a))), mul(dir, 0.45)));
      // (from its surface: the line's own thickness there)
      const rr = r0 + (r1 - r0) * ((i + k) / (pts.length - 1));
      const at = add(lerpV(pts[i], pts[i + 1], k), mul(out, rr * 0.7));
      const tip = add(at, mul(out, long * (0.75 + 0.5 * hash(i, j + 3, seed))));
      const mid = lerpV(at, tip, 0.55);
      put(part, `${piece}${i}_${j}a`, { k: 'rod', a: at, b: mid, ra: 0.95, rb: 0.65, ramp: wood });
      put(part, `${piece}${i}_${j}b`, { k: 'rod', a: mid, b: tip, ra: 0.65, rb: 0.25, ramp: point });
    }
  }
}

/** THE DEER AS SOLIDS. */
function deerBits(P: DeerPose, put: Put, view: GameView): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const axes = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  void view;
  const breathe = 1 + 0.04 * P.breath;

  // ITS BODY: a gaunt deer's barrel, its chest and its haunch; its hide patchy, bark broken through it
  put('body', 'barrel', { k: 'ball', c: W([-2, 0, 31]), ax: axes([16, 0, 0], [0, 6.2 * breathe, 0], [0, 0, 7.6 * breathe]), skin: hideSkin(3, 0.45) });
  put('body', 'chest', { k: 'ball', c: W([10, 0, 31.5]), ax: axes([7.5, 0, 0], [0, 6, 0], [0, 0, 8.4]), skin: hideSkin(5, 0.2) });
  put('haunch', 'haunch', { k: 'ball', c: W([-14, 0, 32]), ax: axes([8, 0, 0], [0, 6.6, 0], [0, 0, 8.4]), skin: hideSkin(7, 0.55) });
  // ITS BACK: a ridge of bark plates along its spine, and roots grown up out of it, crooked and thorned, swaying
  for (let i = 0; i < 7; i++) {
    const x = 13 - i * 4.6;
    put('ridge', `plate${i}`, { k: 'ball', c: W([x, 0, 38.6 + 0.6 * Math.sin((i / 6) * Math.PI)]), ax: axes([2.8, 0, 0], [0, 2.3, 0], [0, 0, 1.9]), skin: barkSkin(i) });
  }
  const sway = (k: number): V3 => mul(P.drag, -0.9 * k);
  ([[6, 1, 13, -4], [-4, -1, 16, -8], [-13, 1, 12, -10]] as const).forEach(([x, s, high, lean], i) => {
    const base = W([x, s * 1.2, 39]);
    const pts: V3[] = [base];
    for (let j = 1; j <= 5; j++) {
      const k = j / 5;
      const jag = (hash(i, j, 61) - 0.5) * 2.2;
      pts.push(add(W([x + lean * k * k + jag, s * (1.2 + 3.4 * k * k), 39 + high * Math.sin((k * Math.PI) / 2)]), sway(k)));
    }
    crooked(put, `backroot${i}`, `backroot${i}_`, pts, 1.5, 0.35, BARK);
    thorns(put, `backroot${i}`, `bthorn${i}_`, pts, 1, 2.6, 63 + i, BARK, POINT, 1.5, 0.35);
  });
  // ITS SIDES: roots burst out through its hide and back in, both sides
  for (const s of [1, -1]) {
    ([[6, 33, -6, 26], [-6, 36, -15, 28]] as const).forEach(([x0, z0, x1, z1], i) => {
      const a = W([x0, s * 6.4, z0]);
      const b = W([x1, s * 6.6, z1]);
      const m = add(lerpV(a, b, 0.5), turned(P, [0, s * 3, 0.5]));
      put(`side${s}`, `side${s}_${i}a`, { k: 'rod', a, b: m, ra: 1.6, rb: 1.4, ramp: ROOT });
      put(`side${s}`, `side${s}_${i}b`, { k: 'rod', a: m, b, ra: 1.4, rb: 0.9, ramp: ROOT });
    });
  }

  // ITS NECK AND HEAD: a thin neck; a gaunt deer's head, bark across its brow; long ears, one torn; its eyes burning
  const H = headFrame(P);
  const root = W(NECK_ROOT);
  const along = norm(sub(H.at, root));
  const nl = turned(P, [0, 1, 0]);
  const nu = norm(cross(along, nl));
  put('neck', 'neckroot', { k: 'ball', c: root, ax: axes([5, 0, 0], [0, 5, 0], [0, 0, 6]), skin: hideSkin(11, 0.3) });
  ([[0.4, 5, 4.2, 4.4], [0.85, 3.8, 3.2, 3.4]] as const).forEach(([k, ra, rl, ru], i) => {
    put('neck', `neck${i}`, { k: 'ball', c: lerpV(root, H.at, k), ax: [mul(along, ra), mul(nl, rl), mul(nu, ru)], skin: hideSkin(13 + i, 0.25) });
  });
  // (its face masked in bark, grown over its brow and round its eyes; the hide of its cheeks showing beneath)
  const face: Skin = (u, tone) => {
    if (u[2] > -0.35 || u[0] > 0.45) {
      const grain = fr(u[0] * 3 + 0.5 * Math.sin(u[1] * 6 + u[2] * 3)) < 0.3;
      return BARK[Math.max(0, Math.min(4, tone + 1 - (grain ? 1 : 0)))];
    }
    return HIDE[Math.max(0, Math.min(4, tone))];
  };
  put('head', 'cranium', { k: 'ball', c: H.p([2, 0, 1.6]), ax: [mul(H.f, 4.4), mul(H.l, 3.3), mul(H.u, 3.5)], skin: face });
  put('muzzle', 'muzzle', { k: 'rod', a: H.p([4.5, 0, 0.4]), b: H.p([12.5, 0, -0.8]), ra: 2.3, rb: 1.4, ramp: HIDE });
  put('muzzle', 'nose', { k: 'ball', c: H.p([12.9, 0, -0.7]), ax: [mul(H.f, 1.3), mul(H.l, 1.3), mul(H.u, 1.1)], skin: NOSE });
  put('head', 'jaw', { k: 'rod', a: H.p([2.5, 0, -2]), b: H.p([10.5, 0, -2.3]), ra: 1.6, rb: 1.0, ramp: HIDE });
  for (const s of [1, -1]) {
    const e = H.p([4.2, s * 2.6, 2.3]);
    if (P.eyes > 0.05) {
      put('head', `eye${s}`, { k: 'dot', p: e, c: FLAME[2], c2: FLAME[3], facing: norm(add(mul(H.l, s), mul(H.f, 0.4))) });
      if (dot(norm(add(mul(H.l, s), mul(H.f, 0.4))), eyeOf(view)) > 0) put('glow', `eyeglow${s}`, { k: 'glow', p: e, c: FLAME[2], r: 5 * Math.min(1.5, P.eyes), a: Math.min(0.5, 0.3 * P.eyes) });
    }
    const base = H.p([-0.5, s * 2.8, 3]);
    const tip = add(base, mul(norm(add(add(mul(H.f, -0.9), mul(H.l, s * 1.2)), mul(H.u, 0.4 - P.ears / 60))), s > 0 ? 6.5 : 4.6));
    put('head', `ear${s}`, { k: 'rod', a: base, b: tip, ra: 1.5, rb: s > 0 ? 0.7 : 1.0, ramp: HIDE });
  }
  // ITS ANTLERS: grown crooked into thorns: its left long and twisting, its right short and bent aside; forked, barbed
  // all along like brambles, pale dead wood, their points black
  for (const s of [1, -1]) {
    const at = (v: V3): V3 => H.q([0.5 + v[0], s * (1.8 + v[1]), 3.8 + v[2]]);
    const beam: V3[] = s > 0
      ? [[0, 0, 0], [-2.2, 2.6, 6.4], [2.4, 4.8, 11], [-1.6, 6.6, 16], [3.2, 9.2, 20.4], [0, 11, 25.4], [3.4, 12.4, 29.4]]
      : [[0, 0, 0], [-2.4, 2.8, 5.2], [1.6, 5.6, 8.6], [-1.8, 8.6, 10.6], [1.4, 10.6, 14.6], [-1.6, 12, 18.4]];
    const pts = beam.map(at);
    const part = `antler${s}`;
    crooked(put, part, `beam${s}_`, pts, 2.4, 0.8, THORN);
    put(part, `burr${s}`, { k: 'ball', c: pts[0], ax: [mul(H.f, 1.7), mul(H.l, 1.7), mul(H.u, 1.0)], skin: BARK });
    const forks: [number, V3][] = s > 0 ? [[1, [7.6, 5.4, 11]], [3, [7, 8.8, 22.6]], [4, [-5.6, 13.6, 25.6]]] : [[2, [7.4, 7.4, 13.8]], [3, [-6.2, 12.4, 13.2]]];
    forks.forEach(([i, to], j) => {
      const fp = [pts[i], lerpV(pts[i], at(to), 0.55), at(to)];
      crooked(put, part, `fork${s}_${j}_`, fp, 1.4, 0.45, THORN);
      thorns(put, part, `fthorn${s}_${j}_`, fp, 1, 3.2, 71 + j + (s > 0 ? 0 : 5), THORN, POINT, 1.4, 0.45);
    });
    thorns(put, part, `thorn${s}_`, pts, 2, 3.8, s > 0 ? 73 : 79, THORN, POINT, 2.4, 0.8);
  }

  // ITS LEGS: deer legs, bark and root below the knee; its right hind wholly a twisted root, a splay of roots for a foot
  P.feet.forEach((foot, i) => {
    const front = i < 2;
    const s = i % 2 === 0 ? -1 : 1;
    const top = W(LEG_TOP[i]);
    const fold = P.fold[i];
    const low = lowerOf(foot, front ? FORE_KNEE : HIND_HOCK, fold);
    const fet = lowerOf(foot, front ? FORE_FET : HIND_FET, fold);
    const [l1, l2] = front ? UPPER : HIND_UPPER;
    const mid = joint(top, low, l1, l2, turned(P, front ? [-1, s * 0.15, 0] : [1, s * 0.1, 0]));
    const part = `leg${i}`;
    if (i === ROOT_LEG) {
      // (wholly root: a braid of two roots twisting down from its hip, knotted at the joints, splayed out on the floor)
      put(part, 'rthigh', { k: 'rod', a: top, b: mid, ra: 4.2, rb: 2.4, ramp: BARK, far: true });
      put(part, 'rknot', { k: 'ball', c: mid, ax: [[2.6, 0, 0], [0, 2.4, 0], [0, 0, 2.6]], skin: barkSkin(23), far: true });
      for (const w of [0, 1]) {
        const pts: V3[] = [];
        for (let j = 0; j <= 4; j++) {
          const k = j / 4;
          const c = lerpV(mid, low, k);
          const a = k * Math.PI * 2.2 + w * Math.PI;
          pts.push(add(c, turned(P, [Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0])));
        }
        crooked(put, part, `rshank${w}_`, pts, 1.5, 1.2, w ? ROOT : BARK);
      }
      put(part, 'rhock', { k: 'ball', c: low, ax: [[2.2, 0, 0], [0, 2.1, 0], [0, 0, 2.2]], skin: barkSkin(29), far: true });
      put(part, 'rcannon', { k: 'rod', a: low, b: add(foot, [0, 0, 1.4]), ra: 1.8, rb: 1.6, ramp: ROOT, far: true });
      for (let j = 0; j < 4; j++) {
        const a = (-0.9 + j * 0.6) * Math.PI;
        const toe = add(foot, [Math.cos(a) * 3.6, Math.sin(a) * 3.2, foot[2] > 0.5 ? -0.6 : 0.6]);
        put(part, `rtoe${j}`, { k: 'rod', a: add(foot, [0, 0, 1.2]), b: toe, ra: 1.2, rb: 0.5, ramp: ROOT, far: true });
      }
      return;
    }
    if (front) {
      put(part, `arm${i}`, { k: 'rod', a: top, b: mid, ra: 3.4, rb: 2.1, ramp: HIDE, far: true });
      put(part, `fore${i}`, { k: 'rod', a: mid, b: low, ra: 1.8, rb: 1.3, ramp: HIDE, far: true });
    } else {
      put(part, `thigh${i}`, { k: 'rod', a: top, b: mid, ra: 4.2, rb: 2.6, ramp: HIDE, far: true });
      put(part, `shank${i}`, { k: 'rod', a: mid, b: low, ra: 2.2, rb: 1.3, ramp: HIDE, far: true });
    }
    put(part, `knob${i}`, { k: 'ball', c: low, ax: [[1.6, 0, 0], [0, 1.5, 0], [0, 0, 1.6]], skin: barkSkin(31 + i), far: true });
    put(part, `cannon${i}`, { k: 'rod', a: low, b: fet, ra: 1.2, rb: 1.0, ramp: BARK, far: true });
    // (a root wound round the bark of its cannon)
    for (let j = 0; j < 3; j++) {
      const ring = (k: number): V3 => {
        const c = lerpV(low, fet, 0.1 + 0.8 * k);
        const a = k * Math.PI * 3 + i;
        return add(c, [Math.cos(a) * 1.4, Math.sin(a) * 1.4, 0]);
      };
      put(part, `wrap${i}_${j}`, { k: 'rod', a: ring(j / 3), b: ring((j + 1) / 3), ra: 0.55, rb: 0.55, ramp: ROOT, far: true });
    }
    const hoofUp = lowerOf(foot, [0.4, 0, 1.8], fold);
    put(part, `pastern${i}`, { k: 'rod', a: fet, b: hoofUp, ra: 1.0, rb: 1.15, ramp: BARK, far: true });
    put(part, `hoof${i}`, { k: 'ball', c: lowerOf(foot, [0.7, 0, 1.2], fold), ax: [turn([2.0, 0, 0], 0, fold, 0), [0, 1.5, 0], turn([0, 0, 1.2], 0, fold, 0)], skin: HOOF, far: true });
  });

  // ITS TAIL: a twig, a tuft of moss on it, flicking
  const tr = W([-22, 0, 35]);
  const td = turned(P, turn(norm([-0.6, 0, -0.8]), 0, -P.tail, 0));
  put('tail', 'tail', { k: 'rod', a: tr, b: add(tr, mul(td, 4.5)), ra: 1.3, rb: 0.6, ramp: BARK });
  put('tail', 'tuft', { k: 'ball', c: add(tr, mul(td, 4.2)), ax: [[1.6, 0, 0], [0, 1.4, 0], [0, 0, 1.4]], skin: MOSS });
  void INK;
}

/** One frame of the deer: `which` (stand), `t` seconds in, from in front or behind. */
export function deerPainted(which: string, t: number, view: GameView = 'front'): Painted {
  eyeOf(view);
  const P = poseOf(which, t);
  const st = stage(view, DEER_CANVAS.ax, DEER_CANVAS.ay, DEER_CANVAS);
  const bits: Bit[] = [];
  deerBits(P, (part, piece, shape) => {
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
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
/** Its feet at one moment (for the tests). */
export function deerFeet(which: string, t: number): V3[] {
  return poseOf(which, t).feet;
}
/** The same frame as the game holds a figure. */
export function deerFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(deerPainted(which, t, view), which === 'dying' ? null : DEER_AURA, DEER_CANVAS.ax, DEER_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function deerSolids(which: string, t: number, view: GameView = 'front'): Bit[] {
  eyeOf(view);
  const bits: Bit[] = [];
  deerBits(poseOf(which, t), (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, view);
  return bits;
}
