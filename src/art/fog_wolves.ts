// FLOOR 9'S SMALL MOB, THE FOG WOLVES OF THE PINEWOOD: a mock-up (nothing of the game imports this file; `WOLF_ON` is
// off).
//
// HIS DESIGN DOC: "Fog Wolves | Small | A bite. They circle to come at you from behind."
//
// HIS BRIEF, asked as his art rulebook's questions for a new character in two pop-ups (15 Oct, by 14:20, each his
// pick, the labels as he tapped them): what they are, “Wolves made of fog” (not the recommended pick); how big, “Lean,
// hip-high to the knight (Recommended)”; how they move, “A ghostly glide” (not the recommended pick); the one thing to
// know them by, “Eyes burning in the fog” (not the recommended pick); its bite, “A lunge out of the fog (Recommended)”;
// how it dies, “It blows apart into fog (Recommended)”; what it must never look like, “Not a friendly ghost dog
// (Recommended)”; its sound (sound rule 7), “Growls and a howl in the fog (Recommended)”.
//
// READ AS (told him so): a wolf's shape of drifting grey fog, churning, dense at its chest and ruff and thinning to
// wisps at its legs, its haunch and its tail; its legs lost in the fog, never touching the ground, so it glides (his
// rule that feet grip the floor does not hold for it, as for a flier); its eyes burning the enemy's pink to gold, the
// first thing you see of it; its jaws come solid, white fangs, only for the bite; it blows apart into fog, its eyes the
// last to go out; gaunt and hungry, never soft; its edge pink while it lives; nothing cyan.
//
// NOT ON THE HEROES' BONES: painted from its own solids, as the Hollow Stag and the Twisted Deer are, in the same
// painter. Its loose fog (the wisps that stream off it and the fog low on the ground round it) is laid over the
// picture grain by grain after its edge, so that it frays the wolf's shape rather than being outlined.
//
// THIS FIRST STEP: its look, standing (his rulebook: a sheet of it standing, front and back, beside a hero, before
// anything moves), and its stand: hovering, never still.

import type { Px, Sprite } from '../engine/px';
import { INK, RIM_ALPHA, hash, lazyFrames, toSprite } from './kit';
import type { Painted, Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { paintBits } from './new_mobs3';
import type { ActorArt, AnimSet } from './actor_types';
import type { Bit, Put } from './new_mobs3';
import type { Skin } from './skin';
import { stage } from './skin';
import type { GameView, Stage } from './skin';
import type { V3 } from './skeleton';

/** THE SWITCH, OFF: nothing of the game reads this file. */
export const WOLF_ON = { on: false };

const cl01 = (v: number): number => Math.max(0, Math.min(1, v));
const fr = (t: number): number => t - Math.floor(t);
const D = Math.PI / 180;
const TAU = Math.PI * 2;
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3, or: V3 = [0, 0, 1]): V3 => {
  const l = len(a);
  return l > 1e-9 ? mul(a, 1 / l) : or;
};
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lerpV = (a: V3, b: V3, s: number): V3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const sm = (v: number): number => {
  const c = cl01(v);
  return c * c * (3 - 2 * c);
};
/** A swell from nothing at `a` to its fullest half way and back to nothing at `b`, smooth at both ends. */
const bump = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.pow(Math.sin((Math.PI * (t - a)) / (b - a)), 2));

// ---------------------------------------------------------------------------------------------
// ITS COLOURS: fog, grey with a cold violet in it (the swamp's sickness is in the wood's fog), pale where the light
// takes it, its heart churning dark; its fangs bone-white; its eyes the enemy's pink burning to gold (FLAME). Nothing
// of it cyan.

const FOG: Ramp = ['#3a3846', '#5a5768', '#7e7a8a', '#a6a2b0', '#cac6d0'];
const DEEP: Ramp = ['#14121c', '#1e1c28', '#2a2836', '#3a3848', '#4c4960'];
const FANG: Ramp = ['#4a4440', '#7a7068', '#a89c90', '#d0c6b8', '#ece4d8'];
/** Its loose fog: the wisps that stream off it, palest as they leave it, greyer as they thin. */
const WISP = ['#dcd8e2', '#cac6d0', '#b4b0bc', '#a6a2b0', '#8e8a9a'];

// ---------------------------------------------------------------------------------------------
// ITS BODY, in picture units (the knight stands 58 high, his hip about 30 up). x forward, y to its left, z up; its own
// frame has its floor point under its middle at the origin. Lean and hip-high: the top of its ruff about 31 up.

const PIVOT: V3 = [0, 0, 22];
/** Where each leg leaves its body: its right fore, left fore, right hind, left hind. */
const LEG_TOP: V3[] = [
  [10, -3.4, 19.5],
  [10, 3.4, 19.5],
  [-12, -3.4, 20],
  [-12, 3.4, 20],
];
/** Each leg's two lengths; its lower length ends in fog, short of the floor. */
const LEG_LONG = [7.5, 6.5];
/** How much of its lower leg is solid fog; the rest is loose grains of it. */
const LEG_SOLID = 0.45;
const NECK_ROOT: V3 = [14, 0, 24.5];
const NECK_LONG = 8;
/** Its neck's way at rest: forward and a little up; its head carried low, level with its back, hunting. */
const NECK_REST: V3 = [10, 0, 2.5];

// ---------------------------------------------------------------------------------------------
// ITS TIMES (seconds)

/** Its stand: fifteen frames a second, a loop of 2.4 s: hovering, never still. */
export const WOLF_STAND = { frames: 36, fps: 15, period: 2.4 } as const;
/** In its stand: a growl (its head lowered, its lips drawn back off its fangs, its ears flat, fog breathed out), and a glance aside and back. */
export const WOLF_HABITS = { growl: [0.7, 1.55], glance: [1.7, 2.3] } as const;

/** The canvas it is painted on, and its floor point on it. */
export const WOLF_CANVAS = { w: 200, h: 160, ax: 96, ay: 118 };
const WOLF_AURA = { x: WOLF_CANVAS.ax, y: WOLF_CANVAS.ay - 18, r: 30, color: '#ff3a78', a: 0.08 };

// ---------------------------------------------------------------------------------------------
// ITS POSES

interface WolfPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  neck: number;
  head: [number, number, number];
  /** How far its jaw hangs open (0 shut, 1 wide). */
  gape: number;
  /** How far its lips are drawn back off its fangs (0 to 1). */
  snarl: number;
  ears: number;
  tail: number;
  /** Each leg's swing (degrees, forward positive) and its bend at its middle joint (degrees). */
  swing: number[];
  bend: number[];
  /** Its fog's churning, a phase (a whole turn is 1). */
  churn: number;
  eyes: number;
  alive: boolean;
  drag: V3;
}

const REST: WolfPose = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, neck: 0, head: [0, 0, 0], gape: 0, snarl: 0, ears: 0, tail: 0, swing: [0, 0, 0, 0], bend: [0, 0, 0, 0], churn: 0, eyes: 1, alive: true, drag: [0, 0, 0] };

/**
 * Its stand, hovering (his pick, a ghostly glide): it hangs low in its own fog, rising and sinking a little, its legs
 * drifting as though wading; its head low, turning; it growls, its head lowered, its lips drawn back off its fangs, its
 * ears flat, fog breathed out; it glances aside and back; its fog churns all through, its tail streaming.
 */
function standPose(t0: number): WolfPose {
  const T = WOLF_STAND.period;
  const t = fr(t0 / T) * T;
  const a = (TAU * t) / T;
  const [g0, g1] = WOLF_HABITS.growl;
  const growl = bump(t, g0, g1);
  const [l0, l1] = WOLF_HABITS.glance;
  const glance = bump(t, l0, l1);
  return {
    ...REST,
    y: 0.4 * Math.sin(a),
    z: 0.9 * Math.sin(2 * a) + 0.4,
    pitch: 1.5 * Math.sin(2 * a + 0.8) + 2 * growl,
    roll: 1.5 * Math.sin(a + 0.4),
    yaw: 1.5 * Math.sin(a + 1.2),
    neck: 2.5 * Math.sin(2 * a + 1.6) + 6 * growl,
    head: [4 * Math.sin(a) - 26 * glance, 8 * growl + 2 * Math.sin(2 * a), 4 * glance],
    gape: 0.32 * growl + 0.04 * (1 + Math.sin(3 * a)),
    snarl: growl,
    ears: -40 * growl,
    tail: 6 * Math.sin(2 * a + 0.5),
    swing: [10 * Math.sin(a), 10 * Math.sin(a + 2.2), 10 * Math.sin(a + Math.PI), 10 * Math.sin(a + Math.PI + 2.2)],
    bend: [18 + 8 * Math.sin(a + 0.6), 18 + 8 * Math.sin(a + 2.8), 22 + 8 * Math.sin(a + 3.7), 22 + 8 * Math.sin(a + 5.9)],
    churn: 2 * (t / T),
    eyes: 1.1 + 0.15 * Math.sin(5 * a) + 0.35 * growl,
  };
}

function basePose(which: string, t: number): WolfPose {
  void which;
  return standPose(t);
}
/** A move's length (its stand: once round). */
export function wolfLong(which: string): number {
  return ({ stand: WOLF_STAND.period } as Record<string, number>)[which];
}
function poseOf(which: string, t: number): WolfPose {
  const P = basePose(which, t);
  const before = basePose(which, t - 0.1);
  P.drag = sub(worldOf(P, [0, 0, 22]), worldOf(before, [0, 0, 22]));
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
function worldOf(P: WolfPose, p: V3): V3 {
  return add(add([P.x, P.y, P.z], PIVOT), turn(sub(p, PIVOT), P.yaw, P.pitch, P.roll));
}
function turned(P: WolfPose, v: V3): V3 {
  return turn(v, P.yaw, P.pitch, P.roll);
}
interface HeadFrame {
  at: V3;
  f: V3;
  l: V3;
  u: V3;
  p: (v: V3) => V3;
}
function headFrame(P: WolfPose): HeadFrame {
  const root = worldOf(P, NECK_ROOT);
  const along = turned(P, turn(norm(NECK_REST), 0, P.neck, 0));
  const at = add(root, mul(along, NECK_LONG));
  const [hy, hp, hr] = P.head;
  const skull = (v: V3): V3 => turned(P, turn(v, hy, hp + P.neck * 0.5, hr));
  return { at, f: skull([1, 0, 0]), l: skull([0, 1, 0]), u: skull([0, 0, 1]), p: (v) => add(at, skull(v)) };
}
/** A smooth noise in 3D (0 to 1). */
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
/**
 * Its fog: pale streaks of it streaming back along it, churning as they go (`churn`), and dark hollows in it where its
 * heart shows through, drifting; `thin`: how much of it is hollow (its haunch and tail more than its chest).
 */
function fogSkin(seed: number, churn: number, thin: number): Skin {
  const wob = Math.sin(TAU * churn * 0.5);
  return (u, tone) => {
    // (broad bands of paler fog curling back along it, and, where it is thin, its darker heart showing)
    const streak = fr(u[0] * 0.9 + churn + 0.3 * Math.sin(u[2] * 2.6 + u[1] * 2 + seed));
    const hollow = thin > 0 && patch([u[0] + 0.35 * wob, u[1], u[2] - 0.25 * wob], 1.6, seed) > 1 - thin;
    const t = tone + (streak < 0.3 ? 1 : 0) - (hollow ? 1 : 0);
    return FOG[Math.max(0, Math.min(4, t))];
  };
}
/** Its eyes: burning, the enemy's pink at their rim, gold to white at their heart. */
const EYE_SKIN: Skin = (u) => {
  const r = Math.hypot(u[1], u[2]);
  return r < 0.55 ? FLAME[4] : r < 0.85 ? FLAME[3] : FLAME[2];
};

const VIEWS = new Map<GameView, V3>();
function eyeOf(view: GameView): V3 {
  let e = VIEWS.get(view);
  if (!e) VIEWS.set(view, (e = stage(view, 0, 0, { w: 2, h: 2 }).eye));
  return e;
}

/** Each leg, at one moment: its top, its middle joint and the end of it (fog, short of the floor). */
function legOf(P: WolfPose, i: number): [V3, V3, V3] {
  const top = worldOf(P, LEG_TOP[i]);
  const fore = i < 2;
  const sw = P.swing[i];
  // (a fore leg's elbow bends it back, a hind leg's stifle forward; its middle joint the other way)
  const up = turned(P, turn([0, 0, -1], 0, -sw, 0));
  const mid = add(top, mul(up, LEG_LONG[0]));
  const low = turned(P, turn([0, 0, -1], 0, -sw + (fore ? -1 : 1) * P.bend[i], 0));
  const end = add(mid, mul(low, LEG_LONG[1]));
  return [top, mid, end];
}

/** THE WOLF AS SOLIDS. */
function wolfBits(P: WolfPose, put: Put, view: GameView): void {
  const W = (p: V3): V3 => worldOf(P, p);
  const axes = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, a), turned(P, b), turned(P, c)];
  const ch = P.churn;
  const sway = (k: number): V3 => mul(P.drag, -0.9 * k);

  // ITS BODY: a deep chest and a thick ruff of fog at its shoulders, a narrow waist, a lean haunch thinning to wisps
  put('fog', 'chest', { k: 'ball', c: W([8.5, 0, 22]), ax: axes([7.5, 0, 0], [0, 5, 0], [0, 0, 7.4]), skin: fogSkin(3, ch, 0) });
  put('fog', 'ruff', { k: 'ball', c: W([9, 0, 26.6]), ax: axes([6.6, 0, 0], [0, 5.2, 0], [0, 0, 4.4]), skin: fogSkin(5, ch + 0.3, 0) });
  put('fog', 'waist', { k: 'ball', c: W([-2.5, 0, 22.8]), ax: axes([8.5, 0, 0], [0, 4, 0], [0, 0, 4.8]), skin: fogSkin(7, ch + 0.6, 0.16) });
  put('fog', 'haunch', { k: 'ball', c: W([-11.5, 0, 22.2]), ax: axes([6.2, 0, 0], [0, 4.6, 0], [0, 0, 5.8]), skin: fogSkin(9, ch + 0.15, 0.2) });
  // (its hind end fraying: puffs of it streaming back off its haunch, swinging as it moves)
  ([[-16.5, 0, 23.6, 3.4], [-19.6, 0, 25, 2.4]] as const).forEach(([x, y, z, r], i) => {
    put('fog', `fray${i}`, { k: 'ball', c: add(W([x, y, z + 0.6 * Math.sin(TAU * (ch + i * 0.3))]), sway(0.4 + 0.3 * i)), ax: axes([r * 1.3, 0, 0], [0, r, 0], [0, 0, r * 0.9]), skin: fogSkin(11 + i, ch + 0.5, 0.4) });
  });
  // ITS HACKLES: tufts of fog standing up along its neck and back
  for (let i = 0; i < 4; i++) {
    const x = 12 - i * 5;
    const k = 1 + 0.5 * P.snarl;
    put('fog', `hackle${i}`, { k: 'ball', c: W([x, 0, 29.6 - i * 0.9 + 0.5 * Math.sin(TAU * (ch * 1.5 + i * 0.27))]), ax: axes([2.6, 0, 0.8], [0, 1.6, 0], [0, 0, 2.2 * k]), skin: fogSkin(13 + i, ch + i * 0.2, 0.2) });
  }

  // ITS TAIL: low, a wolf's, streaming out behind it into wisps
  const tr = W([-19, 0, 23.5]);
  let tp = tr;
  for (let i = 0; i < 3; i++) {
    const k = (i + 1) / 4;
    const d = turned(P, turn(norm([-1, 0, -0.55]), 0, -P.tail * k, 4 * Math.sin(TAU * (ch + k * 0.4))));
    const next = add(add(tp, mul(d, 3)), sway(0.5 * k));
    const r = 2.7 - 0.45 * i;
    put('fog', `tail${i}`, { k: 'ball', c: next, ax: [[r * 1.25, 0, 0], [0, r, 0], [0, 0, r]], skin: fogSkin(17 + i, ch + k, 0.3 + 0.1 * i) });
    tp = next;
  }

  // ITS NECK AND HEAD: long-muzzled, carried low and forward, hunting
  const H = headFrame(P);
  const root = W(NECK_ROOT);
  for (let i = 0; i < 3; i++) {
    const k = (i + 0.5) / 3;
    put('fog', `neck${i}`, { k: 'ball', c: lerpV(root, H.at, k), ax: axes([3.4, 0, 0], [0, 3.6 - 0.4 * i, 0], [0, 0, 4.4 - 0.5 * i]), skin: fogSkin(21 + i, ch + k * 0.5, 0.16) });
  }
  put('fog', 'cranium', { k: 'ball', c: H.p([1, 0, 1.2]), ax: [mul(H.f, 4.6), mul(H.l, 3.4), mul(H.u, 3.3)], skin: fogSkin(25, ch, 0.1) });
  put('fog', 'cheek', { k: 'ball', c: H.p([2.6, 0, -0.6]), ax: [mul(H.f, 3.4), mul(H.l, 3), mul(H.u, 2.2)], skin: fogSkin(27, ch + 0.4, 0.1) });
  put('fog', 'muzzle', { k: 'rod', a: H.p([4.2, 0, 0.3]), b: H.p([10.6, 0, -0.5]), ra: 2.1, rb: 1.3, ramp: FOG });
  put('muzzle', 'nose', { k: 'ball', c: H.p([10.9, 0, -0.3]), ax: [mul(H.f, 1.1), mul(H.l, 1.1), mul(H.u, 0.9)], skin: DEEP });
  // (its jaw, hinged under its cheek, hanging open by `gape`)
  const hinge = H.p([3, 0, -1.6]);
  const jawDir = turn([1, 0, 0], 0, 0, 0);
  void jawDir;
  const jd = norm(add(mul(H.f, Math.cos(P.gape * 38 * D)), mul(H.u, -Math.sin(P.gape * 38 * D))));
  const jawTip = add(hinge, mul(jd, 7.4));
  put('jaw', 'jaw', { k: 'rod', a: hinge, b: jawTip, ra: 1.5, rb: 0.9, ramp: FOG });
  if (P.gape > 0.08) {
    // (its mouth's dark inside, and its tongue)
    put('jaw', 'mouth', { k: 'ball', c: lerpV(H.p([6.5, 0, -1.2]), add(hinge, mul(jd, 4)), 0.5), ax: [mul(H.f, 3), mul(H.l, 1.2), mul(H.u, 0.6 + 1.6 * P.gape)], skin: DEEP });
  }
  // (its fangs: bone-white, bared as its lips draw back or its jaw opens)
  const bare = Math.max(P.snarl, cl01((P.gape - 0.1) * 4));
  if (bare > 0.15) {
    for (const s of [1, -1]) {
      const up = H.p([9.2, s * 0.9, -1.1]);
      put('fangs', `fang${s}`, { k: 'rod', a: up, b: add(up, add(mul(H.u, -1.7 * bare), mul(H.f, 0.2))), ra: 0.55, rb: 0.2, ramp: FANG });
      const lo = add(hinge, add(mul(jd, 6.6), mul(H.l, s * 0.8)));
      const lu = norm(add(mul(H.u, Math.cos(P.gape * 38 * D)), mul(H.f, Math.sin(P.gape * 38 * D))));
      put('fangs', `lfang${s}`, { k: 'rod', a: lo, b: add(lo, mul(lu, 1.3 * bare)), ra: 0.5, rb: 0.2, ramp: FANG });
    }
  }
  // ITS EYES: the one thing to know it by, burning the enemy's pink to gold; a light of their own
  for (const s of [1, -1]) {
    const e = H.p([4, s * 3.4, 2]);
    // (a dark hollow of fog round each, for it to burn in)
    put('fog', `socket${s}`, { k: 'ball', c: H.p([3.6, s * 2.5, 2]), ax: [mul(H.f, 2.2), mul(H.l, 1.4), mul(H.u, 2)], skin: DEEP });
    if (P.eyes > 0.05) {
      put('eyes', `eye${s}`, { k: 'ball', c: e, ax: [mul(H.f, 1.7), mul(H.l, 1.6), mul(H.u, 1.6)], skin: EYE_SKIN });
      if (dot(norm(add(mul(H.l, s), mul(H.f, 0.6))), eyeOf(view)) > -0.3) put('glow', `eyeglow${s}`, { k: 'glow', p: e, c: FLAME[3], r: 6 * Math.min(1.5, P.eyes), a: Math.min(0.55, 0.4 * P.eyes) });
    }
    // (its ears, pricked, laid flat as it snarls)
    const base = H.p([-0.6, s * 2, 3]);
    const tip = add(base, mul(norm(add(add(mul(H.f, -0.5 - P.ears / 60), mul(H.l, s * 0.45)), mul(H.u, 1 + P.ears / 80))), 4.6));
    put('fog', `ear${s}`, { k: 'rod', a: base, b: tip, ra: 1.4, rb: 0.3, ramp: FOG });
  }

  // ITS LEGS: fog, lost toward the ground; no paws: they fray into wisps short of the floor
  // (its legs on the side you see are of a piece with its body; those on its far side stand behind it)
  const near = dot(turned(P, [0, 1, 0]), eyeOf(view)) > 0 ? [1, 3] : [0, 2];
  for (let i = 0; i < 4; i++) {
    const [top, mid, end] = legOf(P, i);
    const fore = i < 2;
    const part = near.includes(i) ? 'fog' : `leg${i}`;
    put(part, `upper${i}`, { k: 'rod', a: top, b: mid, ra: fore ? 2.5 : 2.9, rb: 1.7, ramp: FOG, far: part !== 'fog' });
    // (its lower leg solid only at first; below, it is lost in the fog: grains, laid over the picture, below)
    put(part, `lower${i}`, { k: 'rod', a: mid, b: lerpV(mid, end, LEG_SOLID), ra: 1.6, rb: 1.0, ramp: FOG, far: part !== 'fog' });
  }
}

/** Every solid of one moment of it, as seen from `view`. */
function bitsOf(which: string, t: number, view: GameView): { P: WolfPose; bits: Bit[] } {
  const P = poseOf(which, t);
  const bits: Bit[] = [];
  wolfBits(P, (part, piece, shape) => {
    bits.push({ part, piece, shape });
  }, view);
  return { P, bits };
}

// ---------------------------------------------------------------------------------------------
// ITS LOOSE FOG: wisps streaming off it, and its fog low on the ground round it, laid grain by grain over its picture

type Grain = [V3, string, number];
/**
 * Wisps streaming off a place on it: `n` of them, each living `life` seconds (a whole number of them to its stand's
 * round, so that its loop closes), leaving from where the place was when it left (so that, moving, it trails them),
 * drifting `drift` a second and spreading, thinning and greying as they go.
 */
function stream(which: string, t: number, from: (P: WolfPose) => V3, n: number, life: number, drift: V3, spread: number, seed: number): Grain[] {
  const out: Grain[] = [];
  for (let i = 0; i < n; i++) {
    const age = fr((t + (life * i) / n + 0.13 * life * hash(i, 1, seed)) / life) * life;
    const k = age / life;
    const P = basePose(which, t - age);
    const a = hash(i, 2, seed) * TAU;
    const b = (hash(i, 3, seed) - 0.5) * 2;
    const q = add(add(from(P), mul(drift, age)), [Math.cos(a) * spread * age, Math.sin(a) * spread * age, b * spread * 0.4 * age]);
    const p: V3 = [q[0], q[1], Math.max(0.4, q[2])];
    out.push([p, WISP[Math.min(4, Math.floor(k * 4.2 + hash(i, 4, seed)))], k < 0.45 && hash(i, 5, seed) < 0.6 ? 2 : 1]);
  }
  return out;
}
/** Its fog low on the ground round it: a drift of grains under it, each fading in and out where it lies. */
function groundFog(t: number, cx: number, n: number, seed: number): Grain[] {
  const out: Grain[] = [];
  const T = WOLF_STAND.period;
  for (let i = 0; i < n; i++) {
    const ph = fr(t / T + hash(i, 1, seed));
    // (each lies a while, then is gone a while)
    if (ph > 0.7) continue;
    const a = hash(i, 2, seed) * TAU + ph * 0.6;
    const r = 4 + 16 * Math.sqrt(hash(i, 3, seed));
    out.push([[cx + Math.cos(a) * r * 1.4 - 3 * ph, Math.sin(a) * r * 0.8, 0.6 + 1.6 * hash(i, 4, seed)], WISP[1 + Math.floor(hash(i, 5, seed) * 3)], ph < 0.25 || ph > 0.55 ? 1 : 2]);
  }
  return out;
}
/** All of its loose fog at one moment. */
function grainsOf(which: string, t: number): Grain[] {
  const legEnd = (i: number) => (P: WolfPose): V3 => legOf(P, i)[2];
  const out: Grain[] = [];
  for (let i = 0; i < 4; i++) out.push(...stream(which, t, legEnd(i), 8, 0.6, [-6, 0, -8], 3.5, 31 + i));
  out.push(...stream(which, t, (P) => worldOf(P, [-30, 0, 15]), 7, 0.8, [-9, 0, 3], 4, 41));
  out.push(...stream(which, t, (P) => worldOf(P, [-19, 0, 26]), 5, 0.6, [-8, 0, 4], 4, 43));
  for (let j = 0; j < 4; j++) out.push(...stream(which, t, (P) => worldOf(P, [12 - j * 6, 0, 30.5 - j]), 3, 0.8, [-6, 0, 6], 2.5, 45 + j * 7));
  out.push(...stream(which, t, (P) => worldOf(P, [-3, 0, 17]), 4, 0.6, [-4, 0, -8], 3, 47));
  // (its outline fraying: wisps leaving it from all over its body and drifting back off it)
  const SKIN: V3[] = [[8.5, 0, 22], [9, 0, 26.6], [-2.5, 0, 22.8], [-11.5, 0, 22.2], [17, 0, 26]];
  const RAD: V3[] = [[7.5, 5, 7.4], [6.6, 5.2, 4.4], [8.5, 4, 4.8], [6.2, 4.6, 5.8], [3.4, 3.4, 4]];
  for (let j = 0; j < 22; j++) {
    const b = j % SKIN.length;
    const a1 = hash(j, 7, 53) * TAU;
    const a2 = (hash(j, 8, 53) - 0.3) * Math.PI;
    const on: V3 = [SKIN[b][0] + RAD[b][0] * Math.cos(a1) * Math.cos(a2), SKIN[b][1] + RAD[b][1] * Math.sin(a1) * Math.cos(a2), SKIN[b][2] + RAD[b][2] * Math.sin(a2)];
    out.push(...stream(which, t, (P) => worldOf(P, on), 1, 0.6, [-7, 0, 2.5], 2.5, 60 + j));
  }
  // (its breath, as it growls: fog from its jaws, rolling down)
  out.push(...stream(which, t, (P) => headFrame(P).p([10, 0, -2]), 6, 0.6, [6, 0, -6], 4, 49).filter((g, i) => {
    void g;
    const P = basePose(which, t - (i / 6) * 0.6);
    return P.snarl + P.gape > 0.35;
  }));
  out.push(...groundFog(t, -2, 34, 51));
  // (its lower legs lost in the fog: loose grains of it, thick at the top and thinning, churning)
  const P = basePose(which, t);
  for (let i = 0; i < 4; i++) {
    const [, mid, end] = legOf(P, i);
    for (let j = 0; j < 16; j++) {
      const k = LEG_SOLID + (1 - LEG_SOLID) * Math.pow(j / 16, 0.8);
      const a = TAU * (hash(i, j, 55) + P.churn * (1 + (j % 2)));
      const r = 1.3 * (1 - 0.5 * (j / 16)) * (0.3 + 0.7 * hash(i, j + 20, 55));
      const c = add(lerpV(mid, end, k), [Math.cos(a) * r, Math.sin(a) * r, 0]);
      out.push([c, i === 0 || i === 2 ? WISP[3 + (j % 2)] : WISP[1 + (j % 3)], j < 10 && j % 3 !== 2 ? 2 : 1]);
    }
  }
  // (its tail's tip, the same)
  const tip = worldOf(P, [-28.5, 0, 17.5]);
  for (let j = 0; j < 10; j++) {
    const a = TAU * (hash(j, 1, 57) + P.churn);
    out.push([add(tip, [Math.cos(a) * 1.8 * hash(j, 2, 57) - j * 0.35, Math.sin(a) * 1.2, (hash(j, 3, 57) - 0.5) * 2.4]), WISP[j % 4], j < 5 ? 2 : 1]);
  }
  // (fog pouring off it: down from its belly and chest to the ground, and back off its back in a long trail)
  for (let j = 0; j < 5; j++) out.push(...stream(which, t, (P) => worldOf(P, [12 - j * 6, (j % 2 ? 1 : -1) * 2, 16 + 0.6 * j]), 6, 0.6, [-3, 0, -14], 3, 71 + j));
  for (let j = 0; j < 3; j++) out.push(...stream(which, t, (P) => worldOf(P, [-14 - j * 3, (j - 1) * 2.5, 26 - j]), 6, 0.8, [-11, 0, 3], 4.5, 81 + j));
  // (its eyes burning: embers of their fire streaming back off them)
  for (const s of [1, -1]) {
    const em = stream(which, t, (P) => headFrame(P).p([4, s * 3.6, 2.2]), 4, 0.3, [-12, 0, 5], 3, s > 0 ? 91 : 93);
    em.forEach((g, i) => out.push([g[0], [FLAME[4], FLAME[3], FLAME[3], FLAME[2]][i], 1]));
  }
  return out;
}

/** A smooth noise across the picture (0 to 1), cells `k` pixels across. */
function noise2(x: number, y: number, seed: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const s = (v: number): number => v * v * (3 - 2 * v);
  const h = (i: number, j: number): number => hash(xi + i, yi + j, seed);
  const a = h(0, 0) + (h(1, 0) - h(0, 0)) * s(fx);
  const b = h(0, 1) + (h(1, 1) - h(0, 1)) * s(fx);
  return a + (b - a) * s(fy);
}
/**
 * More fog than wolf (his word): gaps through it you can see the ground through, drifting as its fog churns: few at its
 * head, more and more toward its haunch and tail and under its belly, fraying its outline where they reach it. Its eyes
 * and its fangs stay whole (only they are solid).
 */
function thinned(px: Px, st: Stage, P: WolfPose): void {
  const H = headFrame(P);
  const [hx, hy] = st.at(H.p([2, 0, 0.5]));
  const [tx, ty] = st.at(worldOf(P, [-24, 0, 21]));
  const eyes = [1, -1].map((s) => st.at(H.p([4, s * 3.4, 2])));
  const dx = tx - hx, dy = ty - hy;
  const L2 = Math.max(1, dx * dx + dy * dy);
  const ang = Math.PI * P.churn;
  const ox = 1.6 * Math.cos(ang), oy = 1.6 * Math.sin(ang);
  const keep = new Set([...FLAME, ...FANG].map((c) => c.toLowerCase()));
  const [ir, ig, ib] = [parseInt(INK.slice(1, 3), 16), parseInt(INK.slice(3, 5), 16), parseInt(INK.slice(5, 7), 16)];
  const W = px.w;
  // (0: kept; 1: thinned to a mist, every other pixel; 2: gone)
  const cut = new Uint8Array(W * px.h);
  const edgeAt = (i: number): boolean => px.d[i + 3] === RIM_ALPHA || (px.d[i] === ir && px.d[i + 1] === ig && px.d[i + 2] === ib);
  for (let y = 0; y < px.h; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (px.d[i + 3] === 0 || edgeAt(i)) continue;
      if (eyes.some(([ex, ey]) => Math.abs(x + 0.5 - ex) < 4 && Math.abs(y + 0.5 - ey) < 4)) continue;
      const hex = '#' + [px.d[i], px.d[i + 1], px.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
      if (keep.has(hex)) continue;
      const k = Math.max(0, Math.min(1, ((x - hx) * dx + (y - hy) * dy) / L2));
      // (below the line from its head to its tail: its belly, thinning)
      const below = y - (hy + dy * k) - 2;
      const thr = 0.79 - 0.27 * k - 0.05 * Math.max(0, Math.min(2, below / 4));
      const n = 0.78 * noise2(x * 0.24 + ox, y * 0.34 + oy, 61) + 0.22 * noise2(x * 0.6 - oy, y * 0.7 + ox, 63);
      cut[y * W + x] = n > thr + 0.07 ? 2 : n > thr ? 1 : 0;
    }
  }
  // (its outline goes with the fog inside it: an edge beside a gap is gone too, and then the edge beside that)
  for (let pass = 0; pass < 2; pass++) {
    // (each pass reads the gaps as they stood before it, so that a gap eats one step outward, not along the edge)
    const was = cut.slice();
    for (let y = 0; y < px.h; y++) {
      for (let x = 0; x < W; x++) {
        const k = y * W + x;
        const i = k * 4;
        if (cut[k] || px.d[i + 3] === 0 || !edgeAt(i)) continue;
        let gone = 0;
        for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + ax, yy = y + ay;
          if (xx >= 0 && yy >= 0 && xx < W && yy < px.h && was[yy * W + xx] === 2) gone++;
        }
        if (gone) cut[k] = 2;
      }
    }
  }
  for (let k = 0; k < W * px.h; k++) {
    const i = k * 4;
    if (cut[k] === 2 || (cut[k] === 1 && ((k % W) + Math.floor(k / W)) % 2 === 1)) px.d[i + 3] = 0;
    else if (cut[k] === 1) {
      // (a mist: pale, every other pixel)
      px.d[i] = 0xca;
      px.d[i + 1] = 0xc6;
      px.d[i + 2] = 0xd0;
    }
  }
}

/** One frame of the wolf: `which` (stand), `t` seconds in, from in front or behind. */
export function wolfPainted(which: string, t: number, view: GameView = 'front'): Painted {
  eyeOf(view);
  const { P, bits } = bitsOf(which, t, view);
  const st = stage(view, WOLF_CANVAS.ax, WOLF_CANVAS.ay, WOLF_CANVAS);
  const lights = paintBits(st, bits, worldOf(P, PIVOT));
  const px = st.whole(P.alive ? ENEMY_RIM : null);
  thinned(px, st, P);
  for (const [pt, col, size] of grainsOf(which, t)) laid(px, st, pt, col, size);
  return { px, lights };
}
/** A grain laid on a finished picture (after its pink edge, so that it frays the wolf rather than being outlined), on whole game pixels. */
function laid(px: Px, st: Stage, p: V3, col: string, size: number): void {
  const [x, y] = st.at(p);
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) if (xi + dx >= 0 && yi + dy >= 0 && xi + dx < px.w && yi + dy < px.h) px.set(xi + dx, yi + dy, col);
}
/** The same frame as the game holds a figure. */
export function wolfFrame(which: string, t: number, view: GameView = 'front'): Sprite {
  return toSprite(wolfPainted(which, t, view), WOLF_AURA, WOLF_CANVAS.ax, WOLF_CANVAS.ay);
}
/** Every solid of one moment of it, as the tests read them. */
export function wolfSolids(which: string, t: number, view: GameView = 'front'): Bit[] {
  eyeOf(view);
  return bitsOf(which, t, view).bits;
}
/** Its loose fog at one moment (for the tests): where each grain is. */
export function wolfGrains(which: string, t: number): V3[] {
  return grainsOf(which, t).map((g) => g[0]);
}

/** THE FOG WOLF, as the game holds a monster's pictures: so far its stand (its moves come next). */
export function makeWolfArt(): ActorArt {
  const set = (view: GameView): AnimSet => {
    const frame = (which: string, t: number): Sprite => wolfFrame(which, t, view);
    const idle = lazyFrames(WOLF_STAND.frames, (i) => frame('stand', i / WOLF_STAND.fps));
    return { idle, walk: idle, attack: lazyFrames(3, (i) => idle[i * 12]), idleFps: WOLF_STAND.fps, walkFps: WOLF_STAND.fps };
  };
  return { front: set('front'), back: set('back') };
}
