// THE VETERAN MOVING (the art chat, 2 Nov 2026). A MOCK-UP: PICTURES AND A FILM FOR THE OWNER; NOTHING OF THE GAME IMPORTS
// IT (tests/veteran.test.ts).
//
// His word on the Veteran as drawn, 2 Nov 2026: “Pretty good.  Those action lines will probably need to be bigger.
// Remember, I’d rather have to pull back from a 10 then build up from a 1.  In terms of awesome looking animations”. His
// rulebook's Animations 1 (10 Oct): “Put in the ruleset that I want animations as big and wild and kinetic and weighty as
// possible.  I’d rather it be a notch too high than a notch too low.” At 22:06: “I gotta say it, follow all the rules.  I
// want him to look and play like an action movie hero.  Muscly, Bouncing on his toes”. At 22:43: “Make sure his limbs all
// face the correct way, don’t make mistakes”; at 22:44: “It can be over the top, I just don’t want his foot facing
// backwards or something”.
//
// So every move here is his own (nothing of the old Brawler): keys of his bones (art/skeleton.ts) from his stance, at 30
// frames a second, each a big HELD wind-up you can read, a strike of one or two frames, a big wind-down (his Movement 9);
// his feet grip the floor (a foot down stays where its ball is; a pivot turns on the ball); his headband's tails follow the
// wind of how his head moves; and every joint stays inside what a body can do (tests/veteran.test.ts: knees and elbows
// bend only their own way and never past straight, feet point the way a foot can, the spine and neck never over-twisted,
// fists turned as a fist turns, left never swapped for right).

import { elbowFor, solve, standing } from '../art/skeleton';
import type { Bones, Posed, Skeleton, V3 } from '../art/skeleton';
import { GUARD_ELBOW, VET_BUILD, VET_STANCE, VET_STANCE_UP } from './sculpt_veteran';
import type { VetPose } from './sculpt_veteran';

export const VFPS = 30;
const B = VET_BUILD;
/** A tile of the floor, in his own measure (the game's: 32 picture pixels across, along the floor). */
export const VET_TILE = 32 / Math.sqrt(2 / 3);
/** The game's hero pace, tiles a second (art/moves3.ts GRIP_SPEED). */
const HERO_PACE = 4.6;

// ---------------------------------------------------------------------------------------------
// Poses, keys and how a move is played

/** A pose of his: his bones (hands measured along his chest), and which way each palm faces (forward, left, up). */
export type Q = Partial<Bones> & { palmL?: V3; palmR?: V3 };
/** His stance, down in the bounce: what every pose not named is as. */
export const BASE: Bones = { ...standing(B), ...VET_STANCE.bones, lhIn: 0, rhIn: 0 } as Bones;
type Ease = 'io' | 'lin' | 'in' | 'out' | 'hold';
export interface Key {
  f: number;
  q: Q;
  /** How it eases into this key from the one before. */
  e?: Ease;
}
export type Joint = 'handL' | 'handR' | 'elbowL' | 'elbowR' | 'ankleL' | 'ankleR' | 'kneeL' | 'kneeR' | 'toeL' | 'toeR' | 'heelL' | 'heelR';
/** What a foe does when a blow lands on him. */
export type Reaction = 'snap' | 'reel' | 'knock' | 'launch' | 'fly' | 'kneed' | 'aside' | 'shove';
export interface Strike {
  /** The last frame of the held wind-up, and the frame the blow lands: one or two frames apart (Movement 9). */
  from: number;
  at: number;
  joint: Joint;
  /** A punch's lines are cyan, a kick's hot orange (as his globes: tap cyan, hold orange). */
  kind: 'punch' | 'kick';
  heavy: boolean;
  /** Which foes it lands on, and when (each its own frame: the hook catches two side by side, the spinning kick all round). */
  hits: { foe: number; f: number; react: Reaction }[];
  /** How wide its smear is, and how big its impact burst (if not as a heavy or a light blow has them). */
  w?: number;
  burst?: number;
  /** Its smear painted under him (behind his body), so that the limb that strikes is seen leading it. */
  under?: boolean;
  /**
   * A BLOW THAT HITS EVERYONE IN A CONE in front of him (his push kick: “Push kick hits in a cone in front of”): how wide
   * the cone is (degrees, all of it) and how far it reaches (his own measure), from the striking foot along his forward.
   * Every foe in it is hit, the near ones first (a frame for each tile out).
   */
  cone?: { deg: number; reach: number; react: Reaction };
}
export interface VetMotion {
  id: string;
  name: string;
  /** How it is put in, plain words. */
  input: string;
  line: string;
  /** Frames. */
  long: number;
  loops?: boolean;
  keys?: Key[];
  /** For a move worked out frame by frame (the run, the spins). */
  fn?: (f: number) => Q;
  /**
   * A foot down on the floor, from a frame to a frame: its ball stays where it was put (at the first frame), or, for a
   * foot coming down (`'end'`), where it is at the last: eased onto it over the three frames before it lands.
   */
  plants?: ['L' | 'R', number, number, 'end'?][];
  /** How far the game carries him, along his own forward and left (his own measure), at a frame. */
  carry?: (f: number) => [number, number];
  /**
   * A WHOLE TURN OF HIM (degrees to his left) at a frame, about a point on the floor (his own measure; the floor point under
   * him if not given): a spin on the ball of a foot that stays where it is, or a turn in the air.
   */
  spin?: (f: number) => number;
  pivot?: [number, number];
  strikes: Strike[];
  /** Where his foes stand at the start (along his forward and left); how many, and when one swings at him (frame). */
  foes: [number, number][];
  foeSwing?: { foe: number; f: number }[];
  /** Dust kicked off the floor: at a frame, from a foot or both, big or small. */
  dust?: { f: number; at: 'L' | 'R' | 'both'; big?: boolean }[];
  /** When a blow lands on him (a flash on him). */
  struck?: number[];
  /** How far the light has gone out of him (his fall). */
  out?: (f: number) => number;
  /** A shake of the whole picture: frames from and to. */
  shake?: [number, number][];
  /**
   * THE PATH OF A WHOLE TURN DRAWN IN LIGHT (the spinning elbow: his “the elbow's swing plain to see”): the path a joint
   * takes from a frame to a frame, drawn as a great band round him, its head at the joint; dying away after.
   */
  arc?: { joint: Joint; from: number; to: number; w: number; kind: 'punch' | 'kick'; out?: number };
  /** Frames he lands heavily: a ring of force along the floor round his feet. */
  quake?: number[];
  /** A key put in between two, as they have it, with a palm of its own (a fist turning over in the strike). */
  turn?: { f: number; palmL?: V3; palmR?: V3 };
}

const easeOf = (e: Ease | undefined, u: number): number => {
  const v = Math.max(0, Math.min(1, u));
  switch (e) {
    case 'lin':
      return v;
    case 'in':
      return v * v * v;
    case 'out':
      return 1 - (1 - v) * (1 - v) * (1 - v);
    case 'hold':
      return v >= 1 ? 1 : 0;
    default:
      return v * v * (3 - 2 * v);
  }
};
const CH = ['px', 'py', 'pz', 'yaw', 'pitch', 'roll', 'twist', 'bend', 'side', 'hunch', 'shrug', 'faceTurn', 'faceUp', 'faceTilt', 'lhx', 'lhy', 'lhz', 'le', 'rhx', 'rhy', 'rhz', 're', 'lfx', 'lfy', 'lfz', 'lfp', 'lft', 'lk', 'lkUp', 'rfx', 'rfy', 'rfz', 'rfp', 'rft', 'rk', 'rkUp'] as const;
type Ch = (typeof CH)[number];
const num = (q: Q, c: Ch): number => ((q as Record<string, number | undefined>)[c] ?? (BASE as unknown as Record<string, number>)[c] ?? 0);
const vnorm = (v: V3): V3 => {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
};
const vdot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Solve a pose of his. */
export function skel(q: Q): Skeleton {
  return solve(B, { ...BASE, ...q, lhIn: 0, rhIn: 0 } as Posed);
}
/**
 * THE `le` (or `re`) THAT POINTS AN ELBOW ALONG `want` (the figure's own axes): the skeleton's own answer, checked; where
 * the hand is so near the line of the arm's natural hang that the answer is measured from another place than the one
 * the arm is solved from (its elbow would flip right over), the swing that comes nearest is found by trying round.
 */
function aimElbow(q: Q, left: boolean, want: V3, near: number): number {
  const posed = { ...BASE, ...q, lhIn: 0, rhIn: 0 } as Posed;
  const first = elbowFor(B, posed, left, want, near);
  const fit = (e: number): number => {
    const s = solve(B, { ...posed, [left ? 'le' : 're']: e } as Posed);
    const sh = left ? s.shoulderL : s.shoulderR;
    const el = left ? s.elbowL : s.elbowR;
    const ha = left ? s.handL : s.handR;
    const d = vnorm([ha[0] - sh[0], ha[1] - sh[1], ha[2] - sh[2]]);
    const flat = (v: V3): V3 => {
      const k = vdot(v, d);
      return [v[0] - d[0] * k, v[1] - d[1] * k, v[2] - d[2] * k];
    };
    return vdot(vnorm(flat([el[0] - sh[0], el[1] - sh[1], el[2] - sh[2]])), vnorm(flat(want)));
  };
  if (fit(first) > 0.97) return first;
  let best = first;
  let bestFit = fit(first);
  for (let a = -180; a < 180; a += 10) {
    const e = first + a;
    const v = fit(e);
    if (v > bestFit) {
      best = e;
      bestFit = v;
    }
  }
  for (const step of [4, 2, 1, 0.5]) {
    for (const e of [best - step, best + step]) {
      const v = fit(e);
      if (v > bestFit) {
        best = e;
        bestFit = v;
      }
    }
  }
  return best - 360 * Math.round((best - near) / 360);
}

/**
 * His palm's way in a pose, as given; or (not given) as a forearm hangs when nothing turns it: facing in, square to the
 * bend of his elbow (the thumb toward his biceps); with the arm near straight, toward his middle.
 */
function palmOf(q: Q, side: 'L' | 'R', s: Skeleton): V3 {
  const want = side === 'L' ? q.palmL : q.palmR;
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const ha = side === 'L' ? s.handL : s.handR;
  const d = vnorm([ha[0] - el[0], ha[1] - el[1], ha[2] - el[2]]);
  const sq = (w: V3): V3 => {
    const k = vdot(w, d);
    return [w[0] - d[0] * k, w[1] - d[1] * k, w[2] - d[2] * k];
  };
  if (want) return vnorm(sq(want));
  const l = s.upper[1];
  const mid = sq(side === 'L' ? [-l[0], -l[1], -l[2]] : l);
  // (the bend: the way the forearm folds toward the biceps; the palm faces in across it)
  const ant = sq([sh[0] - el[0], sh[1] - el[1], sh[2] - el[2]]);
  const a = vnorm(ant);
  const lat: V3 = side === 'R' ? [d[1] * a[2] - d[2] * a[1], d[2] * a[0] - d[0] * a[2], d[0] * a[1] - d[1] * a[0]] : [a[1] * d[2] - a[2] * d[1], a[2] * d[0] - a[0] * d[2], a[0] * d[1] - a[1] * d[0]];
  const ua: V3 = [sh[0] - el[0], sh[1] - el[1], sh[2] - el[2]];
  const cosE = -vdot(vnorm(ua), d);
  const bentK = Math.max(0, Math.min(1, (0.95 - cosE) / 0.45));
  const mn = Math.hypot(...mid);
  const w0: V3 = mn > 1e-3 ? [mid[0] / mn, mid[1] / mn, mid[2] / mn] : [-lat[0], -lat[1], -lat[2]];
  return vnorm([w0[0] * (1 - bentK) - lat[0] * bentK, w0[1] * (1 - bentK) - lat[1] * bentK, w0[2] * (1 - bentK) - lat[2] * bentK]);
}

const POLES = new WeakMap<object, [V3, V3]>();
/** Which way each elbow points in a key's pose, in his chest's own measure (forward, left, up). */
function polesOf(q: Q): [V3, V3] {
  const have = POLES.get(q);
  if (have) return have;
  const s = skel(q);
  const [cf, cl, cu] = s.chest;
  const pole = (sh: V3, el: V3, ha: V3): V3 => {
    const ab: V3 = [ha[0] - sh[0], ha[1] - sh[1], ha[2] - sh[2]];
    const t = vdot([el[0] - sh[0], el[1] - sh[1], el[2] - sh[2]], ab) / (vdot(ab, ab) || 1);
    const p: V3 = [el[0] - sh[0] - ab[0] * t, el[1] - sh[1] - ab[1] * t, el[2] - sh[2] - ab[2] * t];
    const n = vnorm(p);
    return [vdot(n, cf), vdot(n, cl), vdot(n, cu)];
  };
  const out: [V3, V3] = [pole(s.shoulderL, s.elbowL, s.handL), pole(s.shoulderR, s.elbowR, s.handR)];
  POLES.set(q, out);
  return out;
}

/** The pose between keys, at a frame (fractional frames too: for the after-images). */
function keyed(keys: Key[], f: number): Q {
  if (f <= keys[0].f) return { ...keys[0].q };
  const last = keys[keys.length - 1];
  if (f >= last.f) return { ...last.q };
  let i = 0;
  while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const k = easeOf(b.e, (f - a.f) / (b.f - a.f));
  const out: Record<string, unknown> = {};
  for (const c of CH) out[c] = num(a.q, c) + (num(b.q, c) - num(a.q, c)) * k;
  // THE ELBOWS GO THE SHORT WAY: from where the one key points each elbow to where the other does, turned smoothly between
  // (not their numbers mixed, which can swing an elbow right round the arm and back between two frames)
  {
    const pa = polesOf(a.q);
    const pb = polesOf(b.q);
    const q = out as Q;
    const s = skel(q);
    const [cf, cl, cu] = s.chest;
    for (const side of ['L', 'R'] as const) {
      const A = side === 'L' ? pa[0] : pa[1];
      const Bv = side === 'L' ? pb[0] : pb[1];
      // (two ways near opposite are turned through the way out from his side, not through nothing)
      const W: V3 = side === 'L' ? [0, 1, 0] : [0, -1, 0];
      const mix = (P0: V3, P1: V3, u: number): V3 => vnorm([P0[0] + (P1[0] - P0[0]) * u, P0[1] + (P1[1] - P0[1]) * u, P0[2] + (P1[2] - P0[2]) * u]);
      const v = vdot(A, Bv) < -0.2 ? (k < 0.5 ? mix(A, W, k * 2) : mix(W, Bv, k * 2 - 1)) : mix(A, Bv, k);
      const fig: V3 = [cf[0] * v[0] + cl[0] * v[1] + cu[0] * v[2], cf[1] * v[0] + cl[1] * v[1] + cu[1] * v[2], cf[2] * v[0] + cl[2] * v[1] + cu[2] * v[2]];
      const key = side === 'L' ? 'le' : 're';
      const near = num(a.q, key) + (num(b.q, key) - num(a.q, key)) * k;
      (out as Record<string, number>)[key] = aimElbow(q, side === 'L', fig, near);
    }
  }
  // (the palms: each key's own, or as it faces in that key; turned smoothly from the one to the other)
  if (a.q.palmL || b.q.palmL || a.q.palmR || b.q.palmR) {
    const sa = skel(a.q);
    const sb = skel(b.q);
    for (const side of ['L', 'R'] as const) {
      if (!(side === 'L' ? a.q.palmL || b.q.palmL : a.q.palmR || b.q.palmR)) continue;
      const pa = palmOf(a.q, side, sa);
      const pb = palmOf(b.q, side, sb);
      out[`palm${side}`] = vnorm([pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k, pa[2] + (pb[2] - pa[2]) * k]);
    }
  }
  return out as Q;
}

/** The raw pose of a move at a frame (before its feet are held where they are put). */
function rawAt(m: VetMotion, f: number): Q {
  const g = m.loops ? (((f % m.long) + m.long) % m.long) : Math.max(0, Math.min(m.long, f));
  if (m.fn) return m.fn(g);
  return keyed(m.keys as Key[], g);
}

/** HIS FEET GRIP THE FLOOR: while a foot is planted, its ball stays where it was put (a pivot turns on it). */
export function poseAt(m: VetMotion, f: number): Q {
  const q = rawAt(m, f);
  const g = m.loops ? (((f % m.long) + m.long) % m.long) : Math.max(0, Math.min(m.long, f));
  for (const [side, a, b, anchor] of m.plants ?? []) {
    // (held from a to b; eased off over three frames after b as the foot lifts, or on over three before a as it lands)
    const fade = g < a ? (anchor === 'end' ? Math.max(0, 1 - (a - g) / 3) : 0) : g <= b ? 1 : anchor === 'end' ? 0 : Math.max(0, 1 - (g - b) / 3);
    if (fade <= 0) continue;
    const want = toeOf(rawAt(m, anchor === 'end' ? b : a), side);
    const now = toeOf(q, side);
    const x = side === 'L' ? 'lfx' : 'rfx';
    const y = side === 'L' ? 'lfy' : 'rfy';
    const k = fade * fade * (3 - 2 * fade);
    (q as Record<string, number>)[x] = num(q, x) + (want[0] - now[0]) * k;
    (q as Record<string, number>)[y] = num(q, y) + (want[1] - now[1]) * k;
  }
  return q;
}
function toeOf(q: Q, side: 'L' | 'R'): V3 {
  const s = skel(q);
  return side === 'L' ? s.toeL : s.toeR;
}

const clampF = (m: VetMotion, f: number): number => (m.loops ? f : Math.max(0, Math.min(m.long, f)));
/** How far the game has carried him at a frame (his own forward and left). */
export const carryAt = (m: VetMotion, f: number): [number, number] => (m.carry ? m.carry(clampF(m, f)) : [0, 0]);
/** How far he is turned as a whole at a frame (degrees to his left). */
export const spinAt = (m: VetMotion, f: number): number => (m.spin ? m.spin(clampF(m, f)) : 0);
/** Where a point of him (his own measure, as his pose has it) is on the floor of the scene at a frame: turned and carried. */
export function worldOf(m: VetMotion, f: number, p: V3): V3 {
  const a = spinAt(m, f);
  const [cx, cy] = carryAt(m, f);
  const [px, py] = m.pivot ?? [0, 0];
  const [x, y] = turnXY(p[0] - px, p[1] - py, a);
  return [x + px + cx, y + py + cy, p[2]];
}
/**
 * How he is placed at a frame, for his painter: the floor point under him (his own measure) and his whole turn. (A turn
 * about a pivot is a turn about the floor point under him and a move of it.)
 */
export function placeOf(m: VetMotion, f: number): { at: [number, number]; turn: number } {
  const o = worldOf(m, f, [0, 0, 0]);
  return { at: [o[0], o[1]], turn: spinAt(m, f) };
}

/** Is he off the floor (both feet clear of it)? */
export function inAir(s: Skeleton): boolean {
  return Math.min(s.toeL[2], s.toeR[2], s.heelL[2], s.heelR[2]) > 0.9;
}

/**
 * HIS POSE AT A FRAME, ready to sculpt: his bones; his palms; off the floor or not; and THE HEADBAND'S TAILS, streaming
 * the way the air pushes them: back from his face and down, and blown against the way his head has been going over the
 * last few frames (Movement 4: loose things follow; they whip as he strikes, trail as he leaps, spiral as he spins).
 */
export function vetAt(m: VetMotion, f: number): VetPose & { s: Skeleton } {
  const q = poseAt(m, f);
  const s = skel(q);
  const headW = (g: number): V3 => worldOf(m, g, skel(poseAt(m, g)).head);
  // (the wind: how his head has moved over the last frames, the nearest the most)
  const v: number[] = [0, 0, 0];
  let all = 0;
  const first = m.loops ? -Infinity : 0;
  for (let k = 0; k < 5; k++) {
    const g = f - k * 0.5;
    const g0 = Math.max(first, g - 1);
    if (g <= first) break;
    const a = headW(g);
    const b = headW(g0);
    const w = Math.exp(-k / 2.5) / Math.max(0.25, g - g0);
    for (let c = 0; c < 3; c++) v[c] += w * (a[c] - b[c]);
    all += w;
  }
  if (all) for (let c = 0; c < 3; c++) v[c] /= all;
  {
    const [x, y] = turnXY(v[0], v[1], -spinAt(m, f));
    v[0] = x;
    v[1] = y;
  }
  const [hf] = s.face;
  // (still air: as in his stills, back and a little to his left and down, turned as his head is turned from his stance's)
  const th = Math.atan2(hf[1], hf[0]) - HEAD0;
  const [bx, by] = turnXY(-0.85, 0.2, (th * 180) / Math.PI);
  const base: V3 = [bx, by, -0.45];
  const speed = Math.hypot(v[0], v[1], v[2]);
  const gain = 0.14;
  let tr: V3 = [base[0] - v[0] * gain, base[1] - v[1] * gain, base[2] - v[2] * gain];
  // (never blown out in front of his face: what would be is turned back past his ear)
  const n0 = Math.hypot(tr[0], tr[1], tr[2]);
  const fw = vdot(tr, hf) / n0;
  if (fw > -0.35) tr = [tr[0] - hf[0] * (fw + 0.35) * n0, tr[1] - hf[1] * (fw + 0.35) * n0, tr[2] - hf[2] * (fw + 0.35) * n0];
  const trail = vnorm(tr);
  const ripple = Math.min(2.2, 1.1 + speed * 0.18);
  const phase = 0.4 + f * 0.16;
  const air = inAir(s);
  return { id: `${m.id}@${f}`, name: m.name, bones: { ...BASE, ...q, lhIn: 0, rhIn: 0 }, trail, ripple, phase, air, palmL: q.palmL ?? palmOf(q, 'L', s), palmR: q.palmR ?? palmOf(q, 'R', s), s };
}

// ---------------------------------------------------------------------------------------------
// Helpers for writing poses

const S0 = VET_STANCE.bones;
/** Which way his face points in his stance (radians, to his left): the tails' still air is turned from it. */
const HEAD0 = ((): number => {
  const hf = solve(B, { ...standing(B), ...VET_STANCE.bones } as Posed).face[0];
  return Math.atan2(hf[1], hf[0]);
})();
const SU = VET_STANCE_UP.bones;
/** A pose: his stance, and what changes. */
const P = (q: Q): Q => ({ ...S0, ...q });
/** Smoothly through (frame, value) pairs. */
export function track(f: number, ks: [number, number][], e: Ease = 'io'): number {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (f <= ks[i][0]) return ks[i - 1][1] + (ks[i][1] - ks[i - 1][1]) * easeOf(e, (f - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]));
  }
  return ks[ks.length - 1][1];
}
/** A hand (its own shoulder, along his chest) at a point given along his own forward, left and up, in a pose. */
export function handTo(q: Q, side: 'L' | 'R', want: V3, e: number): Q {
  const s = skel(q);
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const [cf, cl, cu] = s.chest;
  const v: V3 = [want[0] - sh[0], want[1] - sh[1], want[2] - sh[2]];
  return side === 'L' ? { lhx: vdot(v, cf), lhy: vdot(v, cl), lhz: vdot(v, cu), le: e } : { rhx: vdot(v, cf), rhy: vdot(v, cl), rhz: vdot(v, cu), re: e };
}
/** Turn a point about the floor point under him (degrees to his left). */
const turnXY = (x: number, y: number, a: number): [number, number] => {
  const r = (a * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};
/**
 * THE ELBOWS POINTED WHERE A REAL ELBOW GOES in a pose (his “Make sure his limbs all face the correct way”): each named
 * elbow swung to point along a way given in his chest's own measure (forward, left, up): down under a jab, out level for a
 * hook, down under the fist of an uppercut.
 */
function elbows(q: Q, L?: V3, R?: V3): Q {
  const s = skel(q);
  const [cf, cl, cu] = s.chest;
  const fig = (v: V3): V3 => [cf[0] * v[0] + cl[0] * v[1] + cu[0] * v[2], cf[1] * v[0] + cl[1] * v[1] + cu[1] * v[2], cf[2] * v[0] + cl[2] * v[1] + cu[2] * v[2]];
  const out: Q = { ...q };
  const posed = { ...BASE, ...q, lhIn: 0, rhIn: 0 } as Posed;
  void posed;
  if (L) out.le = aimElbow(q, true, fig(L), q.le ?? 0);
  if (R) out.re = aimElbow(q, false, fig(R), q.re ?? 0);
  return out;
}
/** A guard: both fists up before his face, as in his stance (along his chest). */
const GUARD: Q = { lhx: S0.lhx, lhy: S0.lhy, lhz: S0.lhz, le: S0.le, rhx: S0.rhx, rhy: S0.rhy, rhz: S0.rhz, re: S0.re };
/** Each fist by his cheek, guarding, as in his stance (along his chest); its elbow tucked in (`tucked`). */
const CHIN_R: Q = { rhx: S0.rhx, rhy: S0.rhy, rhz: S0.rhz, re: S0.re };
const CHIN_L: Q = { lhx: S0.lhx, lhy: S0.lhy, lhz: S0.lhz, le: S0.le };
/** The rear fist up by his temple (the hook's, out of the way of the lead fist swung across). */
const CHIN_RH: Q = { rhx: 4.4, rhy: 2.0, rhz: 8.4 };
/** A pose with its guarding elbows tucked in, down in front of his ribs (his fighter's guard, 3 Nov 2026). */
function tucked(q: Q, side: 'L' | 'R' | 'both' = 'both'): Q {
  return elbows(q, side !== 'R' ? GUARD_ELBOW : undefined, side !== 'L' ? GUARD_ELBOW : undefined);
}
/** Palms: down; toward him; facing in. */
const DOWN: V3 = [0, 0, -1];

// ---------------------------------------------------------------------------------------------
// HIS STANCE, BOUNCING ON HIS TOES (his “Bouncing on his toes”): cocky, ready. Two seconds round: four bounces, high on
// his toes and sunk into his knees; his fists circling a little, his chin up; on the third he rolls his shoulders and
// tips his head, loose; his feet never leave where their balls are.
const STAND_LONG = 60;
function standAt(f: number): Q {
  // (a bounce every 15 frames: down at 0, up at 7.5; the knees soft, up high on his toes)
  const b = 0.5 - 0.5 * Math.cos(((f % 15) / 15) * Math.PI * 2);
  const mix = (k: keyof Bones): number => (S0[k] as number) + ((SU[k] as number) - (S0[k] as number)) * b;
  const roll = Math.max(0, Math.sin(((f - 30) / 30) * Math.PI)) * (f >= 30 ? 1 : 0);
  const circ = (f / 60) * Math.PI * 2;
  const q: Q = {
    ...S0,
    pz: mix('pz'), bend: mix('bend'), lfp: mix('lfp'), lfz: mix('lfz'), rfp: mix('rfp'), rfz: mix('rfz'), lk: mix('lk'), rk: mix('rk'),
    yaw: (S0.yaw ?? 0) + 3 * Math.sin(circ), twist: (S0.twist ?? 0) + 4 * Math.sin(circ * 2),
    shrug: 0.2 + 0.25 * roll * Math.sin(((f - 30) / 15) * Math.PI), hunch: 5 - 3 * roll,
    faceTilt: 10 * roll * Math.sin(((f - 30) / 30) * Math.PI), faceUp: (S0.faceUp ?? 0) + 3 * b, faceTurn: (S0.faceTurn ?? 0) + 4 * Math.sin(circ),
    lhx: (S0.lhx ?? 0) + 1.0 * Math.sin(circ * 2), lhz: (S0.lhz ?? 0) + 1.2 * (1 - Math.cos(circ * 2)) + 0.8 * b,
    rhx: (S0.rhx ?? 0) - 0.8 * Math.sin(circ * 2), rhz: (S0.rhz ?? 0) + 1.0 * (1 - Math.cos(circ * 2)) + 0.8 * b,
  };
  return q;
}

// ---------------------------------------------------------------------------------------------
// HIS RUN: an action hero's run, light and fast. Twelve frames round (two strides), at the game's hero pace; low and
// driving, leaning into it, his knees coming up high in front and his heels flicked up behind; his fists pumping hard,
// close by his sides, elbows bent; chin up; both feet off the floor between strides; each foot down stays where it is
// (the game carries him; a foot down goes back under him just as fast).
const RUN_LONG = 12;
const RUN_CARRY = (HERO_PACE * VET_TILE) / VFPS;
const RUN_ON = 0.3;
function runAt(f: number): Q {
  const P0 = RUN_LONG;
  const S = RUN_CARRY * P0;
  const A = (S * RUN_ON) / 2;
  const C = 2.5;
  const foot = (phase: number): { x: number; z: number; p: number } => {
    const q = ((phase % 1) + 1) % 1;
    if (q < RUN_ON) return { x: C + A - S * q, z: 0, p: 10 };
    const v = (q - RUN_ON) / (1 - RUN_ON);
    const go = v * v * (3 - 2 * v);
    const z = 16 * Math.sin(Math.PI * v) * (v < 0.5 ? 1 : 1);
    const p = v < 0.35 ? 10 + 60 * Math.sin((Math.PI / 2) * (v / 0.35)) : v < 0.85 ? 70 - 70 * ((v - 0.35) / 0.5) : 10 * ((v - 0.85) / 0.15);
    return { x: C + A + S * go - S * q, z, p };
  };
  const ph = f / P0;
  const l = foot(ph);
  const r = foot(ph + 0.5);
  const sw = Math.cos((ph - RUN_ON / 2) * Math.PI * 2);
  const k = (1 - sw) / 2;
  const bob = Math.cos((ph - RUN_ON / 2) * Math.PI * 4);
  return {
    px: 3, py: 0, pz: -3.2 - 1.6 * bob, yaw: -4 * sw, pitch: 14, roll: 2 * sw, twist: 8 * sw, bend: 8, side: 0, hunch: 4, shrug: 0.1,
    faceTurn: 0, faceUp: 14, faceTilt: 0,
    lfx: l.x, lfy: 1.5, lfz: l.z, lfp: l.p, lft: 4, lk: 4, lkUp: 0,
    rfx: r.x, rfy: -1.5, rfz: r.z, rfp: r.p, rft: -4, rk: -4, rkUp: 0,
    // (the fists pumping, opposite to the legs: forward up to his chin, back past his hip; elbows bent hard)
    lhx: -6 + 15 * (1 - k), lhy: -1.5, lhz: -14 + 13 * (1 - k), le: 14,
    rhx: -6 + 15 * k, rhy: 1.5, rhz: -14 + 13 * k, re: 14,
    palmL: [0, -1, 0.2], palmR: [0, 1, 0.2],
  };
}

// ---------------------------------------------------------------------------------------------
// THE MOVES. Frame numbers at 30 a second. Each: the held wind-up (the last frame of it is the strike's `from`), the strike
// in one or two frames (`at`, the blow lands), a stop on the blow (the weight of it), the big wind-down, back to his stance.

/** The hand-held point of a key, made from a pose's own: hands along his chest (the stills' poses mix the two measures). */
function chestHands(q: Partial<Bones>): Q {
  const s = solve(B, { ...BASE, ...q } as Posed);
  const [cf, cl, cu] = s.chest;
  const out: Q = { ...q, lhIn: 0, rhIn: 0 };
  const L: V3 = [s.handL[0] - s.shoulderL[0], s.handL[1] - s.shoulderL[1], s.handL[2] - s.shoulderL[2]];
  const R: V3 = [s.handR[0] - s.shoulderR[0], s.handR[1] - s.shoulderR[1], s.handR[2] - s.shoulderR[2]];
  Object.assign(out, { lhx: vdot(L, cf), lhy: vdot(L, cl), lhz: vdot(L, cu), rhx: vdot(R, cf), rhy: vdot(R, cl), rhz: vdot(R, cu) });
  return out;
}

// THE JAB (tap): his lead fist. Wind-up: he sinks and coils, his lead shoulder drawn back, the fist cocked by his cheek,
// his weight rocked onto his back foot; held. Strike: the lead foot STAMPS forward a half stride as the fist SHOOTS out
// straight, the shoulder rolled up over his chin, palm down; the stop; the fist snaps back to his guard.
const JAB: VetMotion = {
  id: 'jab', name: 'The jab', input: 'tap (the first punch)', long: 28,
  line: 'Coiled back on his rear foot, the lead fist cocked by his cheek, held; then a stamping step in and the fist shot straight out in a frame; the stop; stepped back out to his guard.',
  keys: [
    { f: 0, q: P({}) },
    { f: 8, q: elbows(P({ px: -4.0, pz: -9.0, yaw: -16, twist: 24, bend: 4, pitch: -5, faceTurn: -18, lfz: 3.6, lfp: 34, lk: 22, lhx: 3.5, lhy: -1.0, lhz: 4.0, le: 2, ...CHIN_R }), [-0.2, 0.3, -1]), e: 'out' },
    { f: 11, q: elbows(P({ px: -4.6, pz: -9.6, yaw: -16, twist: 27, bend: 4, pitch: -6, faceTurn: -18, lfz: 4.2, lfp: 36, lk: 22, lhx: 3.0, lhy: -1.2, lhz: 4.3, le: 2, ...CHIN_R }), [-0.2, 0.3, -1]), e: 'io' },
    { f: 12, q: elbows(P({ px: 9.0, pz: -8.4, yaw: -34, twist: -28, bend: 15, pitch: 11, side: -5, faceTurn: -10, lfx: 11.5, lfz: 0, lfp: 12, lk: 16, rfp: 40, lhx: 22.5, lhy: -1.5, lhz: 3.0, le: 4, palmL: DOWN, ...CHIN_R }), [0.1, 0.45, -1], undefined), e: 'lin' },
    { f: 14, q: elbows(P({ px: 9.4, pz: -8.6, yaw: -35, twist: -29, bend: 16, pitch: 12, side: -5, faceTurn: -10, lfx: 11.5, lfz: 0, lfp: 12, lk: 16, rfp: 40, lhx: 22.8, lhy: -1.6, lhz: 2.8, le: 4, palmL: DOWN, ...CHIN_R }), [0.1, 0.45, -1], undefined), e: 'out' },
    { f: 19, q: elbows(P({ px: 3.5, pz: -6.5, yaw: -28, twist: -6, bend: 10, pitch: 5, faceTurn: -18, lfx: 11.5, lfz: 0, lfp: 16, lk: 20, lhx: 9, lhy: 0.0, lhz: 4.5, le: 18, ...CHIN_R }), [-0.2, 0.4, -1], undefined), e: 'out' },
    { f: 22, q: P({ px: 2.0, pz: -5.0, lfx: 10.5, lfz: 5.5, lfp: 30, lhx: 9, lhz: 4.5, ...CHIN_R }), e: 'out' },
    { f: 24, q: P({ px: 0.5, pz: -4.0, lfx: 7.2, lfz: 4.5, lfp: 30 }), e: 'io' },
    { f: 28, q: P({}) },
  ],
  plants: [['R', 0, 28], ['L', 0, 7], ['L', 12, 20, 'end'], ['L', 26, 28, 'end']],
  strikes: [{ from: 11, at: 12, joint: 'handL', kind: 'punch', heavy: false, hits: [{ foe: 0, f: 12, react: 'snap' }] }],
  foes: [[38, 2]],
  dust: [{ f: 12, at: 'L' }],
};

// THE CROSS (tap, the second punch): his rear fist. Wind-up: his whole trunk wound back right round, the rear fist
// drawn back past his ear, the weight sunk on his back leg; held. Strike: hips and shoulders thrown round, the rear heel
// spun up off the floor, the fist driven straight through, palm down, his lead fist guarding his chin.
const CROSS: VetMotion = {
  id: 'cross', name: 'The cross', input: 'tap (the second punch)', long: 28,
  line: 'Wound right back, the rear fist drawn past his ear, sunk on his back leg, held; then hips, shoulders and heel thrown round as the fist drives straight through; the stop; back to his guard.',
  keys: [
    { f: 0, q: P({}) },
    { f: 9, q: elbows(P({ px: -4.5, pz: -9.5, yaw: -36, twist: -38, bend: 6, pitch: -6, side: 4, faceTurn: -14, rfp: 14, rfz: 1.2, rk: -30, ...CHIN_L, rhx: -6.5, rhy: -2.0, rhz: 6.0, re: 60 }), undefined, [-0.5, -0.4, -1]), e: 'out' },
    { f: 12, q: elbows(P({ px: -5.0, pz: -10.0, yaw: -38, twist: -42, bend: 6, pitch: -7, side: 5, faceTurn: -14, rfp: 14, rfz: 1.2, rk: -30, ...CHIN_L, rhx: -7.2, rhy: -2.2, rhz: 6.2, re: 64 }), undefined, [-0.5, -0.4, -1]), e: 'io' },
    { f: 14, q: elbows(P({ px: 7.5, pz: -7.0, yaw: 4, twist: 44, bend: 16, pitch: 12, side: -6, faceTurn: -6, rft: 10, rfp: 56, rfz: 4.4, rk: -6, lk: 22, ...CHIN_L, rhx: 22.0, rhy: 2.5, rhz: 3.0, re: 6, palmR: DOWN }), undefined, [0.1, -0.45, -1]), e: 'lin' },
    { f: 16, q: elbows(P({ px: 7.8, pz: -7.2, yaw: 5, twist: 45, bend: 17, pitch: 12, side: -6, faceTurn: -6, rft: 10, rfp: 56, rfz: 4.4, rk: -6, lk: 22, ...CHIN_L, rhx: 22.3, rhy: 2.4, rhz: 2.8, re: 6, palmR: DOWN }), undefined, [0.1, -0.45, -1]), e: 'out' },
    { f: 22, q: P({ px: 3.0, pz: -6.0, yaw: -14, twist: 12, bend: 10, pitch: 5, faceTurn: -18, rft: -16, rfp: 36, rfz: 3.0, rk: -18, rhx: 10, rhy: 0.5, rhz: 4.0, re: 14 }), e: 'io' },
    { f: 28, q: P({}) },
  ],
  plants: [['L', 0, 28], ['R', 0, 28]],
  strikes: [{ from: 12, at: 14, joint: 'handR', kind: 'punch', heavy: true, hits: [{ foe: 0, f: 14, react: 'reel' }] }],
  // (the fist turning over as it goes: palm in, then down)
  turn: { f: 13, palmR: [0.2, 0.56, -0.8] },
  foes: [[36, 2]],
  shake: [[14, 16]],
};

// THE HOOK (tap, the third punch: it catches two side by side): his lead fist again, round. Wind-up: his weight
// rocked onto his lead leg, his chest wound left away from them, the lead elbow drawn back and up, the fist by his ear;
// held. Strike: everything whips round to the right, the lead foot pivoting on its ball (heel turned out), the elbow up
// level with the fist, the fist swung flat across in front, knuckles leading and palm down; it sweeps through the one on
// his left and on into the one on his right; the stop; the follow-through carries his shoulders on round; back to guard.
const HOOK: VetMotion = {
  id: 'hook', name: 'The hook', input: 'tap (the third punch)', long: 32,
  line: 'His weight rocked onto his lead leg, wound left, the lead elbow drawn up, held; then everything whips round, the lead foot pivoting, the fist swung flat across and through two of them side by side; carried on round; back to guard.',
  keys: [
    { f: 0, q: P({}) },
    { f: 10, q: elbows(P({ px: 2.5, pz: -9.0, yaw: -6, twist: 34, bend: 10, side: -8, pitch: 2, faceTurn: -22, lk: 24, lft: 20, ...CHIN_RH, lhx: -2.0, lhy: 6.0, lhz: 4.5, le: 78 }), [-0.3, 1, 0.5], undefined), e: 'out' },
    { f: 13, q: elbows(P({ px: 2.7, pz: -9.6, yaw: -4, twist: 38, bend: 10, side: -9, pitch: 2, faceTurn: -22, lk: 24, lft: 20, ...CHIN_RH, lhx: -2.6, lhy: 6.6, lhz: 4.8, le: 80 }), [-0.3, 1, 0.5], undefined), e: 'io' },
    { f: 15, q: elbows(P({ px: 5.0, pz: -8.0, yaw: -46, twist: -34, bend: 12, side: 6, pitch: 6, faceTurn: -30, lft: -28, lfp: 44, lfz: 3.6, lk: -12, rfp: 30, rk: -34, ...CHIN_RH, lhx: 10.0, lhy: -11.0, lhz: 2.5, le: 84, palmL: DOWN }), [0.1, 1, 0.12], undefined), e: 'lin' },
    { f: 16, q: elbows(P({ px: 5.2, pz: -8.0, yaw: -54, twist: -42, bend: 12, side: 6, pitch: 6, faceTurn: -38, lft: -34, lfp: 46, lfz: 3.8, lk: -18, rfp: 32, rk: -36, ...CHIN_RH, lhx: 6.5, lhy: -15.0, lhz: 2.5, le: 86, palmL: DOWN }), [0.15, 1, 0.12], undefined), e: 'lin' },
    { f: 18, q: elbows(P({ px: 5.2, pz: -8.1, yaw: -55, twist: -43, bend: 12, side: 6, pitch: 6, faceTurn: -38, lft: -34, lfp: 46, lfz: 3.8, lk: -18, rfp: 32, rk: -36, ...CHIN_RH, lhx: 6.2, lhy: -15.3, lhz: 2.4, le: 86, palmL: DOWN }), [0.15, 1, 0.12], undefined), e: 'out' },
    { f: 23, q: elbows(P({ px: 3.5, pz: -7.0, yaw: -62, twist: -48, bend: 10, side: 4, pitch: 4, faceTurn: -36, lft: -34, lfp: 44, lfz: 3.6, lk: -18, rfp: 30, rk: -36, ...CHIN_RH, lhx: 2.0, lhy: -14.0, lhz: 0.0, le: 70, palmL: DOWN }), [0.2, 1, -0.2], undefined), e: 'out' },
    { f: 32, q: P({}) },
  ],
  plants: [['L', 0, 32], ['R', 0, 32]],
  strikes: [{ from: 13, at: 15, joint: 'handL', kind: 'punch', heavy: true, hits: [{ foe: 0, f: 15, react: 'reel' }, { foe: 1, f: 16, react: 'reel' }] }],
  foes: [[33, 10], [31, -12]],
  shake: [[15, 18]],
};

// THE ROUND KICK (hold): the switch kick with the shin, from his form picture. Wind-up: his lead foot hops back to his
// rear (the switch), and he hauls that knee up high and cocked, up on the ball of his back foot, fists up, eyes on them;
// held. Strike: the hips turn right over, the support foot pivoting on its ball until its heel points at them, and the
// leg whips round flat at rib height, landing with the SHIN; the kicking arm flung down and back, the other fist at his
// face; the stop; the leg carried on round and down; he lands it back in front and is in his stance again.
const kickW = chestHands(VET_KICK_W());
const kickS = chestHands(VET_KICK_S());
function VET_KICK_W(): Partial<Bones> {
  return { px: -2.0, pz: -1.0, yaw: -16, twist: 12, bend: 4, pitch: -10, hunch: 4, shrug: 0.25, faceTurn: -20, faceUp: 4,
    lfx: 2.4, lfy: 2.6, lfz: 21, lft: 20, lk: 16, lkUp: 52, lfp: 60,
    rfx: -2.4, rfy: -2.0, rft: -40, rk: -34, rfp: 26, rfz: 2.0,
    lhIn: 0, lhx: 10.4, lhy: -4.8, lhz: 6.0, le: 16, rhIn: 0, rhx: 7.4, rhy: 4.8, rhz: 5.5, re: 10 };
}
function VET_KICK_S(): Partial<Bones> {
  return { px: -1.6, pz: -1.4, yaw: -82, twist: 24, bend: -6, pitch: -18, roll: 12, hunch: 4, shrug: 0.2, faceTurn: -6, faceUp: 4,
    lfx: 27.5, lfy: -3.0, lfz: 31, lft: -8, lk: -16, lkUp: 74, lfp: 38,
    rfx: -1.4, rfy: -1.6, rft: -150, rk: -148, rfp: 24, rfz: 1.8,
    lhIn: 1, lhx: -9, lhy: 9, lhz: -11, le: -10, rhIn: 0, rhx: 7.4, rhy: 4.8, rhz: 5.5, re: 10 };
}
const RK: VetMotion = {
  id: 'roundkick', name: 'The round kick', input: 'hold', long: 36,
  line: 'A switch: the lead foot hops back, the knee hauled up high and cocked on the ball of his back foot, held; then the hips turn right over, the support foot pivoting till its heel points at them, and the shin whips round flat into their ribs; carried round; landed back in his stance.',
  keys: [
    { f: 0, q: P({}) },
    { f: 3, q: P({ px: -0.8, pz: -7.5, yaw: -18, bend: 9, lfx: 4.0, lfy: 3.0, lfz: 5.0, lfp: 36, lk: 22, faceTurn: -22 }), e: 'out' },
    { f: 5, q: P({ px: -1.5, pz: -9.0, yaw: -18, bend: 10, lfx: 0.0, lfy: 3.0, lfz: 0.2, lfp: 34, lk: 22, faceTurn: -22 }), e: 'in' },
    { f: 11, q: P(kickW), e: 'out' },
    { f: 14, q: P({ ...kickW, lfz: (kickW.lfz ?? 0) + 1.0, lkUp: 56, pz: -0.6 }), e: 'io' },
    { f: 15, q: P({ ...kickS, yaw: -44, twist: 20, lfx: 20, lfy: 8, lfz: 30, lft: 4, lk: 6, lkUp: 70, rft: -96, rk: -94, lhx: (kickS.lhx ?? 0) * 0.6, lhz: (kickS.lhz ?? 0) * 0.6 }), e: 'lin' },
    { f: 16, q: P(kickS), e: 'lin' },
    { f: 18, q: P({ ...kickS, yaw: -86 }), e: 'out' },
    { f: 23, q: P({ ...kickS, yaw: -104, twist: 18, lfx: 8, lfy: -14, lfz: 16, lft: -50, lk: -60, lkUp: 30, lfp: 40 }), e: 'out' },
    { f: 26, q: P({ ...kickS, yaw: -80, twist: 10, pz: -3.0, lfx: 9, lfy: -4, lfz: 9, lft: -30, lk: -30, lkUp: 20, lfp: 40 }), e: 'io' },
    { f: 29, q: P({ px: 1.0, pz: -7.0, yaw: -40, bend: 8, lfx: 7.0, lfy: 2.0, lfz: 5.5, lft: -10, lk: 6, lfp: 30, rft: -90, rk: -88, faceTurn: -20 }), e: 'io' },
    { f: 36, q: P({}) },
  ],
  plants: [['R', 0, 36], ['L', 0, 1], ['L', 5, 6, 'end'], ['L', 31, 36, 'end']],
  strikes: [{ from: 14, at: 16, joint: 'ankleL', kind: 'kick', heavy: true, hits: [{ foe: 0, f: 16, react: 'knock' }] }],
  foes: [[34, -6]],
  dust: [{ f: 4, at: 'L' }, { f: 16, at: 'R', big: true }, { f: 30, at: 'L' }],
  shake: [[16, 19]],
};

// THE SPINNING ELBOW (tap, between two round kicks: it knocks them back to make room). His word, 3 Nov 2026: “the knee
// and elbow need a little work”; his pick “Read better (Recommended)”: the elbow's swing plain to see, with bigger wind-ups
// and hits. So: A BIG COIL, held: his hips turned right round away from them till his back is nearly to them, his chest
// wound hard against it, the rear arm folded tight across his chest, his eyes on them over his right shoulder; then A WHOLE
// TURN on the ball of his lead foot, his chest whipped round past his hips, and the ELBOW is the leading point: the forearm
// folded tight across his chest, the elbow out at head height, and at the blow pointing straight at them; the path of the
// turn drawn as a great arc of light round him (`arc`); the burst at the elbow; they are knocked aside; he carries on round
// and comes back plainly to his guard, held.
// (the turn is of the whole of him about the ball of his lead foot, which stays where it is: his rear foot is off the
// floor while he goes round; the rest is his pose, coiled and uncoiled)
const ELB_PIVOT = ((): [number, number] => {
  const t = skel(P({})).toeL;
  return [t[0], t[1]];
})();
const ELB_LONG = 50;
/** The coil from 0 to 12, held to 18; the strike 18 to 20; the stop to 23; round to 32; his guard again by 42, held. */
const elbowSpin = (f: number): number => track(f, [[0, 0], [18, 0], [20, -186], [23, -208], [32, -300], [42, -356], [50, -360]], 'io');
function elbowAt(f: number): Q {
  const yaw = track(f, [[0, -24], [12, -96], [18, -100], [20, -104], [23, -108], [32, -64], [42, -28], [50, -24]]);
  const d = yaw - -24;
  // (his weight out over his lead foot as he turns on it, and back)
  const over = track(f, [[0, 0], [12, 0.85], [20, 0.95], [34, 0.95], [46, 0]]);
  const fold = track(f, [[0, 0], [10, 1], [30, 1], [40, 0]]);
  const elbowUp = track(f, [[0, 0], [8, 0.4], [12, 0.75], [18, 0.8], [20, 1], [27, 1], [36, 0.3], [42, 0]]);
  const swing = track(f, [[17, 0], [20, 1], [36, 1], [44, 0]]);
  const q: Q = {
    ...S0,
    px: ELB_PIVOT[0] * over, py: ELB_PIVOT[1] * over,
    pz: (S0.pz ?? 0) + track(f, [[0, 0], [12, -5.5], [18, -6.2], [20, -1.0], [27, -1.0], [36, -4.0], [44, 0]]),
    yaw, twist: track(f, [[0, 6], [12, 46], [18, 50], [20, -20], [23, -24], [32, -8], [42, 4], [50, 6]]),
    bend: track(f, [[0, 8], [12, 14], [18, 15], [20, 6], [27, 6], [42, 8]]), side: track(f, [[0, 0], [12, -6], [18, -7], [20, 8], [27, 6], [40, 0]]),
    hunch: 5, shrug: track(f, [[0, 0.2], [12, 0.45], [20, 0.1], [30, 0.2]]),
    // (his eyes on them over his shoulder as he coils; the head whipped round ahead of the turn, on them at the blow)
    faceTurn: track(f, [[0, -32], [12, -4], [18, -2], [20, 64], [23, 70], [32, 30], [42, -30], [50, -32]]),
    faceUp: 6, faceTilt: track(f, [[0, 0], [12, 12], [18, 12], [20, -8], [27, 0]]),
    // his lead foot turns on its ball with his hips; his rear foot comes up off the floor and is set back down where it was
    lft: (S0.lft ?? 0) + d, lk: (S0.lk ?? 0) + d, lfp: (S0.lfp ?? 0) + 12 * fold, lfz: (S0.lfz ?? 0) + 1.0 * fold,
    rfx: (S0.rfx ?? 0) + 6 * swing, rfy: (S0.rfy ?? 0) + 2 * swing, rfz: (S0.rfz ?? 0) + 10 * swing, rfp: (S0.rfp ?? 0) + 26 * swing,
    rft: (S0.rft ?? 0) + d * 0.6, rk: (S0.rk ?? 0) + d * 0.6,
    // THE REAR ARM FOLDED TIGHT ACROSS HIS CHEST: the fist on his left breast, the forearm flat across him
    rhx: (S0.rhx ?? 0) + (4.6 - (S0.rhx ?? 0)) * fold, rhy: (S0.rhy ?? 0) + (9.6 - (S0.rhy ?? 0)) * fold, rhz: (S0.rhz ?? 0) + (-1.2 - (S0.rhz ?? 0)) * fold,
    re: S0.re,
    // (the lead fist keeps his guard at his face)
    lhx: S0.lhx, lhy: S0.lhy, lhz: S0.lhz, le: S0.le,
  };
  // (the elbow from tucked in his guard to flung out at head height, pointing out to his right: turned toward it the short
  // way; the lead elbow kept tucked)
  const t = tucked(q);
  const out = elbows({ ...q, re: S0.re }, undefined, [0.12, -1, 0.3]).re ?? 0;
  return { ...q, le: t.le, re: (t.re ?? 0) + (out - (t.re ?? 0)) * elbowUp };
}
const ELBOW: VetMotion = {
  id: 'elbow', name: 'The spinning elbow', input: 'tap (between two round kicks)', long: ELB_LONG, fn: elbowAt, spin: elbowSpin, pivot: ELB_PIVOT,
  line: 'A big coil: his back turned nearly to them, his chest wound hard against it, the rear arm folded tight across it, eyes on them over his shoulder, held; then a whole turn on the ball of his lead foot, drawn in light round him, the elbow leading at head height into them; round, and back to his guard.',
  plants: [['L', 0, ELB_LONG], ['R', 0, 17], ['R', 44, ELB_LONG, 'end']],
  strikes: [{ from: 18, at: 20, joint: 'elbowR', kind: 'punch', heavy: true, w: 18, burst: 0.8, under: true, hits: [{ foe: 0, f: 20, react: 'aside' }] }],
  arc: { joint: 'elbowR', from: 18, to: 34, w: 10, kind: 'punch', out: 7 },
  foes: [[35, 11]],
  dust: [{ f: 18, at: 'L', big: true }, { f: 44, at: 'R' }],
  shake: [[20, 24]],
};

// THE DODGE (a swipe on its own): sunk deep into his knees, his arms swung back, gathering all that weight, held; then
// he springs up and away, out of the line of the blow, knees tucked, fists up, the tails streaming; lands deep, dust
// thrown up, and bounces back up into his stance.
const jumpUp = chestHands({ ...VET_JUMP_S() });
function VET_JUMP_S(): Partial<Bones> {
  return { pz: 26, yaw: -18, bend: 12, pitch: -4, hunch: 10, shrug: 0.2, faceTurn: -14, faceUp: 8,
    lfx: 3.5, lfy: 2.6, lfz: 35, lft: 10, lk: 8, lkUp: 30, lfp: 34,
    rfx: -2.6, rfy: -2.8, rfz: 31, rft: -20, rk: -16, rkUp: 14, rfp: 42,
    lhIn: 0, lhx: 8.5, lhy: 1.0, lhz: 5.0, le: 14, rhIn: 0, rhx: 6.5, rhy: 0.5, rhz: 4.5, re: 8 };
}
const DODGE_GO: [number, number] = [-40, 12];
const DODGE: VetMotion = {
  id: 'dodge', name: 'The dodge jump', input: 'swipe', long: 40,
  line: 'Sunk deep, arms swung back, gathering all that weight, held; then a spring up and away out of the blow, knees tucked, fists up; landed deep in the dust and up on his toes again.',
  keys: [
    { f: 0, q: P({}) },
    { f: 4, q: P({ pz: -8, yaw: -14, bend: 16, pitch: 6, hunch: 10, faceUp: 10, lhx: 7, lhy: 1, lhz: -5, le: 14, rhx: 6, rhy: -1, rhz: -5, re: 6 }), e: 'io' },
    { f: 8, q: elbows(P({ pz: -13, yaw: -14, bend: 30, pitch: 12, hunch: 16, shrug: 0.3, faceTurn: -14, faceUp: 16, lfx: 3.6, lfy: 3.2, lft: 14, lk: 30, lfp: 10, lfz: 0.4, rfx: -3.6, rfy: -3.2, rft: -24, rk: -30, rfp: 34, rfz: 2.4, lhx: -10, lhy: 5, lhz: -16, le: -6, rhx: -10, rhy: -5, rhz: -16, re: -6 }), [-1, 0.3, 0.2], [-1, -0.3, 0.2]), e: 'io' },
    { f: 11, q: P({ pz: -13.5, yaw: -14, bend: 31, pitch: 13, hunch: 17, shrug: 0.3, faceTurn: -14, faceUp: 17, lfx: 3.6, lfy: 3.2, lft: 14, lk: 30, lfp: 10, lfz: 0.4, rfx: -3.6, rfy: -3.2, rft: -24, rk: -30, rfp: 34, rfz: 2.4, lhx: -11, lhy: 5, lhz: -16.5, le: -6, rhx: -11, rhy: -5, rhz: -16.5, re: -6 }), e: 'io' },
    { f: 13, q: P({ pz: 8, yaw: -18, bend: -4, pitch: -8, hunch: 2, faceTurn: -14, faceUp: 10, lfx: 3.0, lfy: 3.0, lfz: 8, lft: 10, lk: 10, lfp: 60, rfx: -3.0, rfy: -3.0, rfz: 6, rft: -20, rk: -14, rfp: 60, lhx: 9, lhy: 2, lhz: 8, le: 20, rhx: 8, rhy: -1, rhz: 8, re: 14 }), e: 'lin' },
    { f: 18, q: P(jumpUp), e: 'out' },
    { f: 22, q: P({ ...jumpUp, pz: 16, lfz: 18, rfz: 16, lkUp: 10, rkUp: 4 }), e: 'in' },
    { f: 25, q: P({ pz: -6, yaw: -18, bend: 14, pitch: 6, hunch: 8, faceTurn: -14, faceUp: 10, lfx: 4.0, lfy: 3.2, lfz: 0.5, lft: 14, lk: 24, lfp: 16, rfx: -4.0, rfy: -3.2, rfz: 0.5, rft: -24, rk: -26, rfp: 30, lhx: 9, lhy: 3, lhz: 2, le: 22, rhx: 8, rhy: -2, rhz: 2, re: 18 }), e: 'in' },
    { f: 29, q: P({ pz: -14.5, yaw: -16, bend: 26, pitch: 12, hunch: 14, faceTurn: -14, faceUp: 18, lfx: 4.0, lfy: 3.2, lfz: 0.2, lft: 14, lk: 30, lfp: 10, rfx: -4.0, rfy: -3.2, rfz: 0.2, rft: -24, rk: -30, rfp: 34, lhx: 9, lhy: 5, lhz: -2, le: 24, rhx: 8, rhy: -4, rhz: -2, re: 20 }), e: 'out' },
    { f: 40, q: P({}) },
  ],
  plants: [['L', 0, 12], ['R', 0, 12], ['L', 25, 40, 'end'], ['R', 25, 40, 'end']],
  carry: (f) => {
    const u = track(f, [[12, 0], [25, 1]], 'lin');
    const e = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
    return [DODGE_GO[0] * e, DODGE_GO[1] * e];
  },
  strikes: [],
  foes: [[34, 2]],
  foeSwing: [{ foe: 0, f: 2 }],
  dust: [{ f: 12, at: 'both', big: true }, { f: 25, at: 'both', big: true }],
};

// THE FLYING UPPERCUT (swipe, then tap; or tap, tap, then swipe and tap: it launches one into the air, stunned). Wind-up:
// dropped right down low and coiled, the rear shoulder dipped, the fist hanging by his knee; held. Strike: he drives up off
// the floor behind it, the fist rising up through their chin and on over his head, his lead knee up, his whole body
// stretched; he hangs at the top, comes down hard, dust, back up.
const upW = chestHands(VET_UP_W());
const upS = chestHands(VET_UP_S());
function VET_UP_W(): Partial<Bones> {
  return { px: -1.0, pz: -14, yaw: -14, twist: -34, bend: 34, pitch: 9, hunch: 16, shrug: 0.4, faceTurn: -10, faceUp: 22, side: 7,
    lfx: 4.8, lfy: 3.4, lft: 16, lk: 30, rfx: -4.2, rfy: -3.8, rft: -30, rk: -34, rfp: 34, rfz: 2.6,
    lhIn: 0, lhx: 8.6, lhy: 0.4, lhz: 4.2, le: 16, rhIn: 1, rhx: 6, rhy: -4.5, rhz: -22, re: -4 };
}
function VET_UP_S(): Partial<Bones> {
  return { px: 4.0, pz: 30, yaw: 4, twist: 28, bend: -8, pitch: -8, hunch: 6, shrug: 0, faceTurn: -14, faceUp: 34, side: -8,
    lfx: 8.0, lfy: 2.6, lfz: 45, lft: 10, lk: 4, lkUp: 40, lfp: 34,
    rfx: -3.5, rfy: -3.0, rfz: 27, rft: -20, rk: -16, rkUp: -6, rfp: 50,
    lhIn: 1, lhx: -6, lhy: 9, lhz: -12, le: -16, rhIn: 1, rhx: 7, rhy: 0.5, rhz: 23.5, re: 14 };
}
const TOWARD: V3 = [-1, 0, 0];
/** The flying uppercut, carried `go` in as he goes up (his own measure). */
export function upperOf(go = 10, id = 'uppercut'): VetMotion {
  return {
  id, name: 'The flying uppercut', input: 'swipe, then tap', long: 46,
  line: 'Dropped right down low and coiled, the fist by his knee, held; then he drives up off the floor behind it, the fist rising through their chin and on over his head, launching them; hangs; comes down hard.',
  keys: [
    { f: 0, q: P({}) },
    { f: 4, q: P({ pz: -8, bend: 16, twist: -14, yaw: -14, hunch: 10, faceUp: 12, rhx: 7, rhy: 0.2, rhz: 0, re: 6 }), e: 'io' },
    { f: 9, q: elbows(P({ ...upW, palmR: TOWARD }), undefined, [-0.4, -0.3, -1]), e: 'out' },
    { f: 13, q: elbows(P({ ...upW, pz: (upW.pz ?? 0) - 0.8, bend: (upW.bend ?? 0) + 2, rhz: (upW.rhz ?? 0) - 0.5, palmR: TOWARD }), undefined, [-0.4, -0.3, -1]), e: 'io' },
    { f: 15, q: elbows(P({ ...upS, pz: 9, px: 6, lfz: 18, rfz: 6, lkUp: 30, rhx: 11, rhy: 1.5, rhz: 11, re: 10, faceUp: 22, bend: 0, palmR: TOWARD }), undefined, [0.15, -0.25, -1]), e: 'lin' },
    { f: 17, q: elbows(P({ ...upS, pz: 21, lfz: 36, rfz: 18, px: 5 }), undefined, [0.6, -0.8, -0.2]), e: 'out' },
    { f: 22, q: elbows(P({ ...upS }), undefined, [0.6, -0.8, -0.2]), e: 'out' },
    { f: 25, q: elbows(P({ ...upS, pz: 28, lfz: 42 }), undefined, [0.6, -0.8, -0.2]), e: 'io' },
    { f: 31, q: P({ px: 3.0, pz: -5, yaw: -10, bend: 14, pitch: 6, hunch: 8, faceTurn: -14, faceUp: 10, lfx: 7.0, lfy: 3.0, lfz: 0.5, lft: 14, lk: 24, lfp: 16, rfx: -3.5, rfy: -3.2, rfz: 0.5, rft: -24, rk: -26, rfp: 30, lhx: 9, lhy: 3, lhz: 2, le: 22, rhx: 9, rhy: -3, rhz: 6, re: 18 }), e: 'in' },
    { f: 35, q: P({ px: 3.0, pz: -14.0, yaw: -12, bend: 26, pitch: 12, hunch: 14, faceTurn: -14, faceUp: 18, lfx: 7.0, lfy: 3.0, lfz: 0.2, lft: 14, lk: 30, lfp: 10, rfx: -3.5, rfy: -3.2, rfz: 0.2, rft: -24, rk: -30, rfp: 34, lhx: 9, lhy: 5, lhz: -2, le: 24, rhx: 8, rhy: -4, rhz: 0, re: 20 }), e: 'out' },
    { f: 46, q: P({}) },
  ],
  plants: [['L', 0, 14], ['R', 0, 14], ['L', 31, 46, 'end'], ['R', 31, 46, 'end']],
  carry: (f) => [go * track(f, [[13, 0], [22, 0.8], [31, 1]], 'io'), 0],
  strikes: [{ from: 13, at: 15, joint: 'handR', kind: 'punch', heavy: true, hits: [{ foe: 0, f: 15, react: 'launch' }] }],
  foes: [[20 + go, -4]],
  dust: [{ f: 14, at: 'both', big: true }, { f: 31, at: 'both', big: true }],
  shake: [[15, 18], [31, 33]],
};
}
const UPPER = upperOf();

// THE SPINNING JUMP KICK (swipe, then hold; after two round kicks it hits all round, for when he is surrounded; a swipe and
// hold first, it closes the distance). Wind-up: sunk low on the balls of his feet, his shoulders wound the other way, coiled
// to spring; held. Strike: off the floor into a turn, the back leg whipping round flat at head height, the other tucked
// under him, a whole circle in the air so it catches everyone round him, each in his turn; the tails spiralling; he comes
// down out of the turn into a deep landing, dust ringed out round him, and up into his stance.
const jkW = chestHands(VET_JK_W());
function VET_JK_W(): Partial<Bones> {
  return { px: 0.6, pz: -11, yaw: -16, twist: -34, bend: 22, pitch: 10, hunch: 6, shrug: 0.3, faceTurn: -14, faceUp: 14,
    lfx: 5.0, lfy: 3.0, lft: 20, lk: 28, lfp: 28, lfz: 1.9,
    rfx: -5.0, rfy: -3.4, rft: -24, rk: -28, rfp: 36, rfz: 2.4,
    lhIn: 0, lhx: 10.4, lhy: -4.8, lhz: 6.0, le: 14, rhIn: 1, rhx: -7, rhy: -9, rhz: -3, re: -10 };
}
/** In the air, the leg out: his back to where it points, the right leg whipped out flat at head height, the left tucked under him. */
const jkS = chestHands({ px: 1.0, pz: 20, yaw: 120, twist: 10, bend: -4, pitch: -12, roll: -10, hunch: 4, shrug: 0.2, faceTurn: 30, faceUp: 4,
  lfx: -3.0, lfy: 5.0, lfz: 32, lft: 110, lk: 100, lkUp: -30, lfp: 40,
  rfx: 30, rfy: 2.0, rfz: 47, rft: 30, rk: 30, rkUp: 30, rfp: 30,
  lhIn: 1, lhx: 4, lhy: 9, lhz: 4, le: -20, rhIn: 1, rhx: -6, rhy: -10, rhz: -6, re: -10 });
/** The landing, deep: as the wind-up (his feet where they were: he has come a whole two turns round). */
const jkLand = tucked(P({ ...jkW, pz: -14, bend: 26, twist: 0, pitch: 12, faceTurn: -14, faceUp: 18, rhIn: 0, ...GUARD, lhz: 3.5, rhz: 3.0 }));
// the whole of him turned in the air (about the floor point under him): none while his feet are down; a little as he goes
// up (the rest of the first turn is his own, his hips whipped round); then round at a quarter turn every two frames, each
// foe round him caught in his turn (the leg points along his own forward at the strike, his back to it); on round as he
// comes down, slowing; two whole turns by the time his feet are down again, so that they come down where they went up
function jkSpinOf(sweepEnd: number, land: number): (f: number) => number {
  const at16 = 8;
  const atEnd = at16 + (sweepEnd - 16) * 45;
  return (f) => {
    if (f <= 14) return 0;
    if (f <= 16) return (at16 * (f - 14)) / 2;
    if (f <= sweepEnd) return at16 + (f - 16) * 45;
    if (f >= land) return 720;
    // (on from the sweep at its pace, slowing to a stop as he lands)
    const T = land - sweepEnd;
    const t = (f - sweepEnd) / T;
    return atEnd + (720 - atEnd) * (3 * t * t - 2 * t * t * t) + 45 * T * (t - 2 * t * t + t * t * t);
  };
}
function jkKeysOf(sweepEnd: number, land: number): Key[] {
  return [
    { f: 0, q: P({}) },
    { f: 10, q: tucked(P(jkW), 'L'), e: 'out' },
    { f: 14, q: tucked(P({ ...jkW, pz: (jkW.pz ?? 0) - 1.2, bend: (jkW.bend ?? 0) + 2 }), 'L'), e: 'io' },
    { f: 16, q: P(jkS), e: 'lin' },
    { f: sweepEnd, q: P({ ...jkS, pz: 23, lfz: 35, rfz: 50 }), e: 'lin' },
    { f: land, q: jkLand, e: 'in' },
    { f: land + 4, q: P({ ...jkLand, pz: -15 }), e: 'out' },
    { f: land + 20, q: P({}) },
  ];
}
const SPINKICK: VetMotion = {
  id: 'spinkick', name: 'The spinning jump kick', input: 'swipe, then hold (after two round kicks: all round)', long: 50, keys: jkKeysOf(22, 30), spin: jkSpinOf(22, 30),
  line: 'Sunk low on his toes, wound the other way, coiled, held; then off the floor into two whole turns, the leg whipping round flat at head height through everyone round him, each in his turn; down out of the turn in a ring of dust.',
  plants: [['L', 0, 14], ['R', 0, 14], ['L', 30, 50, 'end'], ['R', 30, 50, 'end']],
  strikes: [{ from: 14, at: 16, joint: 'ankleR', kind: 'kick', heavy: true, hits: [{ foe: 0, f: 16, react: 'fly' }, { foe: 1, f: 18, react: 'fly' }, { foe: 2, f: 20, react: 'fly' }, { foe: 3, f: 22, react: 'fly' }] }],
  foes: [[33, 2], [2, 33], [-33, -2], [-2, -33]],
  dust: [{ f: 15, at: 'both', big: true }, { f: 30, at: 'both', big: true }],
  shake: [[16, 24], [30, 32]],
};
/** The spinning jump kick that closes the distance: `go` in (his own measure). */
export function closeKickOf(go = 70, id = 'spinkickClose'): VetMotion {
  const JK_CLOSE = go;
  return {
  ...SPINKICK, id, name: 'The spinning jump kick, closing in', input: 'swipe, then hold (first)', long: 52,
  keys: jkKeysOf(24, 32), spin: jkSpinOf(24, 32),
  line: 'Coiled low, held; then a spinning leap two tiles in at them, the leg whipping round flat at head height as he arrives; down in a ring of dust.',
  plants: [['L', 0, 14], ['R', 0, 14], ['L', 32, 52, 'end'], ['R', 32, 52, 'end']],
  carry: (f) => [JK_CLOSE * track(f, [[14, 0], [24, 0.88], [32, 1]], 'io'), 0],
  strikes: [{ from: 14, at: 16, joint: 'ankleR', kind: 'kick', heavy: true, hits: [{ foe: 0, f: 24, react: 'fly' }] }],
  foes: [[JK_CLOSE + 30, 0]],
  dust: [{ f: 15, at: 'both', big: true }, { f: 32, at: 'both', big: true }],
  shake: [[24, 27], [32, 34]],
};
}
const SPINKICK_CLOSE = closeKickOf();

// THE FLYING KNEE (tap, tap, then swipe and hold: the strongest single blow). His word, 3 Nov 2026: “the knee and elbow
// need a little work”; his pick “Read better (Recommended)”: the knee driven up clearly into them, with bigger wind-ups and
// hits. So: A BIG LUNGE, HELD LONG: a long step in onto his lead foot, sunk low and leaning hard over it, his rear leg
// stretched back on its toes, both hands reaching up for their head. Then THE LEAP, and THE KNEE DRIVEN UP into their chest
// and face: his thigh near level, his shin tucked under it, the knee the leading point; both hands pulling their head down
// onto it; his other leg trailing; the burst at the knee, they are snapped back. He drops, lands HEAVY (deep, dust, a ring
// of force along the floor), and is up.
const KNEE_LONG = 58;
function VET_KNEE_W(): Partial<Bones> {
  return { px: 6.5, pz: -13.5, yaw: -10, twist: 2, bend: 20, pitch: 22, hunch: 10, shrug: 0.35, faceTurn: -6, faceUp: 24,
    lfx: 15.5, lfy: 3.2, lft: 6, lk: 6, lfp: 6, lfz: 0.4,
    rfx: -15.0, rfy: -3.6, rft: -16, rk: -10, rfp: 58, rfz: 4.6,
    lhIn: 1, lhx: 15.5, lhy: -4.0, lhz: 2.5, le: 10, rhIn: 1, rhx: 15.0, rhy: 4.0, rhz: 3.0, re: 10 };
}
/** At the top: the right thigh level out in front, the shin tucked under it, both hands pulling their head down onto it. */
function VET_KNEE_S(): Partial<Bones> {
  return { px: 4.0, pz: 14.5, yaw: -6, twist: 4, bend: 8, pitch: -18, hunch: 8, shrug: 0.4, faceTurn: -4, faceUp: -2,
    lfx: -8.5, lfy: 0.4, lfz: 17.5, lft: 6, lk: 4, lkUp: -8, lfp: 62,
    rfx: 10.8, rfy: 0.4, rfz: 32.0, rft: -4, rk: -2, rkUp: 42, rfp: 44,
    lhIn: 1, lhx: 17.0, lhy: -5.0, lhz: -5.5, le: 16, rhIn: 1, rhx: 17.0, rhy: 5.0, rhz: -5.5, re: 16 };
}
const kneeW = chestHands(VET_KNEE_W());
/** The reaching arms' elbows: down and a little out (along his chest), as they come up out of his guard. */
const REACH_L: V3 = [0.1, 0.35, -1];
const REACH_R: V3 = [0.1, -0.35, -1];
const kneeS = chestHands(VET_KNEE_S());
/** The landing, heavy: deep in his knees, his feet where his stance has them. */
const KNEE_LAND: Q = P({ px: 1.0, pz: -15.5, yaw: -18, bend: 28, pitch: 14, hunch: 14, faceTurn: -14, faceUp: 20, lfx: 6.6, lfy: 3.0, lfz: 0.2, lft: 14, lk: 30, lfp: 10, rfx: -5.6, rfy: -3.4, rfz: 0.2, rft: -30, rk: -30, rfp: 30, lhx: 9, lhy: 5, lhz: -3, le: 24, rhx: 8, rhy: -4, rhz: -3, re: 20 });
/** The flying knee, leaping `go` in to land it (his own measure). */
export function kneeOf(go = 40, id = 'knee'): VetMotion {
  const KNEE_GO = go;
  const carry = (f: number): [number, number] => [KNEE_GO * track(f, [[19, 0], [22, 0.72], [26, 0.86], [34, 1]], 'out'), 0];
  // (they stand where the knee meets them: just past where it is at the blow)
  const k = skel(P(kneeS)).kneeR;
  return {
  id, name: 'The flying knee', input: 'tap, tap, then swipe and hold', long: KNEE_LONG,
  line: 'A long lunge in, sunk low over his lead foot, both hands reaching for their head, held; then a leap and the knee driven up into them, thigh level, shin tucked, both hands pulling their head down onto it; snapped back; landed heavy, up.',
  keys: [
    { f: 0, q: P({}) },
    { f: 6, q: tucked(P({ px: 3.0, pz: -9.5, yaw: -16, bend: 14, pitch: 10, hunch: 8, faceTurn: -12, faceUp: 14, lfx: 11.0, lfy: 3.1, lfz: 6.5, lft: 10, lk: 24, lfp: 20, rfp: 40, rk: -16 })), e: 'io' },
    { f: 12, q: elbows(P(kneeW), REACH_L, REACH_R), e: 'out' },
    { f: 19, q: elbows(P({ ...kneeW, pz: (kneeW.pz ?? 0) - 1.0, px: (kneeW.px ?? 0) + 0.4, rfx: (kneeW.rfx ?? 0) - 0.4 }), REACH_L, REACH_R), e: 'io' },
    { f: 21, q: P(kneeS), e: 'lin' },
    { f: 22, q: P({ ...kneeS, pz: 15.5, lfz: 18.5, rfz: 33.0, rkUp: 44 }), e: 'out' },
    { f: 26, q: P({ ...kneeS, pz: 13.5, lfz: 16.5, rfz: 29.5, rkUp: 34, bend: 12, lhz: (kneeS.lhz ?? 0) - 3, rhz: (kneeS.rhz ?? 0) - 3 }), e: 'io' },
    { f: 34, q: KNEE_LAND, e: 'in' },
    { f: 38, q: P({ ...KNEE_LAND, pz: -16.2, bend: 30 }), e: 'out' },
    { f: KNEE_LONG, q: P({}) },
  ],
  plants: [['L', 0, 2], ['R', 0, 19], ['L', 11, 19, 'end'], ['L', 34, KNEE_LONG, 'end'], ['R', 34, KNEE_LONG, 'end']],
  carry,
  strikes: [{ from: 19, at: 21, joint: 'kneeR', kind: 'kick', heavy: true, w: 22, burst: 0.85, under: true, hits: [{ foe: 0, f: 21, react: 'kneed' }] }],
  foes: [[carry(21)[0] + k[0] + 9, k[1]]],
  dust: [{ f: 3, at: 'L' }, { f: 19, at: 'both', big: true }, { f: 34, at: 'both', big: true }],
  shake: [[21, 25], [34, 37]],
  quake: [34],
};
}
const KNEE = kneeOf();

// THE PUSH KICK (hold, the first of the three kicks): his word, 3 Nov 2026, 00:36: “And the 3 kick combo seemed like two of
// the same kicks”; his pick “Push kick, then round”; and at 00:37: “Push kick hits in a cone in front of”. So: the rear
// knee CHAMBERED HIGH in front of him and held, the foot cocked under it, the toes pulled back; then the foot DRIVEN STRAIGHT
// OUT heel first into their middle, his hips thrown in behind it, his body leaning back over his support foot, which stays
// FLAT on the floor; his fists guarding his face. It shoves back everyone in a cone in front of him: a blast of force
// spreading out from his heel along the floor, 60 degrees wide and two and a half tiles long. Re-chambered; set down; guard.
const PUSH_LONG = 44;
/** The push kick's cone: 60 degrees wide, two and a half tiles long (his own measure). */
export const PUSH_CONE = { deg: 60, reach: 2.5 * VET_TILE, react: 'shove' as Reaction };
const pushChamber: Q = P({ px: 0.5, pz: -3.0, yaw: -4, twist: -2, bend: 4, pitch: -6, hunch: 6, faceTurn: -6, faceUp: 6,
  lfx: 3.0, lfy: 2.8, lft: 10, lk: 12, lfp: 0, lfz: 0,
  rfx: 7.5, rfy: -2.6, rfz: 21.0, rft: -6, rk: -4, rkUp: 62, rfp: -14,
  ...GUARD });
const pushOut: Q = P({ px: 1.0, pz: -3.6, yaw: -2, twist: -4, bend: -6, pitch: -22, hunch: 4, faceTurn: -4, faceUp: 12,
  lfx: 3.0, lfy: 2.8, lft: 10, lk: 16, lfp: 0, lfz: 0,
  rfx: 26.0, rfy: -2.2, rfz: 23.0, rft: -4, rk: -4, rkUp: 50, rfp: -22,
  ...GUARD });
const PUSH: VetMotion = {
  id: 'push', name: 'The push kick', input: 'hold (the first of the three kicks)', long: PUSH_LONG,
  line: 'The rear knee chambered high, the foot cocked, the toes back, held; then the foot driven straight out heel first, his support foot flat: a blast of force fanning out from his heel shoves back everyone in a cone in front of him; set down; guard.',
  keys: [
    { f: 0, q: P({}) },
    { f: 4, q: P({ px: 0.0, pz: -7.0, yaw: -12, lfx: 4.5, lfy: 3.0, lft: 12, lk: 18, lfp: 6, lfz: 0.3, rfx: -2.5, rfz: 5.0, rfp: 40, rk: -14, rkUp: 20 }), e: 'io' },
    { f: 10, q: pushChamber, e: 'out' },
    { f: 15, q: P({ ...pushChamber, rfz: 21.6, rkUp: 64, pz: -3.4 }), e: 'io' },
    { f: 17, q: pushOut, e: 'lin' },
    { f: 21, q: P({ ...pushOut, rfx: 26.3, pitch: -23 }), e: 'out' },
    { f: 27, q: P({ ...pushChamber, rfz: 18.0, rkUp: 52 }), e: 'io' },
    { f: 34, q: P({ px: 0.2, pz: -6.0, yaw: -18, lfx: 5.0, lfy: 3.0, lft: 14, lk: 18, lfp: 12, lfz: 0.8, rfx: -5.0, rfz: 4.5, rfp: 30, rk: -24 }), e: 'io' },
    { f: PUSH_LONG, q: P({}) },
  ],
  plants: [['L', 0, PUSH_LONG], ['R', 0, 2], ['R', 36, PUSH_LONG, 'end']],
  strikes: [{ from: 15, at: 17, joint: 'heelR', kind: 'kick', heavy: true, w: 16, burst: 0.8, under: true, cone: PUSH_CONE, hits: [{ foe: 0, f: 17, react: 'shove' }] }],
  foes: [[47, -8], [76, 15], [96, -31]],
  dust: [{ f: 17, at: 'L', big: true }, { f: 36, at: 'R' }],
  shake: [[17, 20]],
};

// STRUCK (a blow lands on him, on the second frame): his head snapped round and back, his chest thrown back and over, his
// weight driven onto his back foot; he shakes it off and is back up on his toes, fists up.
const HURT: VetMotion = {
  id: 'hurt', name: 'Struck', input: 'a blow lands on him', long: 16,
  line: 'The blow snaps his head round and back and drives his weight onto his back foot; he shakes it off, fists up again.',
  keys: [
    { f: 0, q: P({}) },
    { f: 1, q: P({ px: 0.3 }) },
    { f: 2, q: P({ px: -1.5, pz: -6.5, yaw: -16, twist: 18, bend: -10, side: 10, pitch: -8, faceTurn: 30, faceUp: 24, faceTilt: -18, lhx: 7, lhy: 3, lhz: 7, le: 30, rhx: 4, rhy: -4, rhz: 6, re: 30 }), e: 'lin' },
    { f: 5, q: P({ px: -4.0, pz: -8.0, yaw: -10, twist: 22, bend: -14, side: 12, pitch: -12, faceTurn: 36, faceUp: 26, faceTilt: -22, lhx: 5, lhy: 6, lhz: 9, le: 40, rhx: 3, rhy: -7, rhz: 8, re: 40, lfp: 14, rfp: 10 }), e: 'out' },
    { f: 10, q: P({ px: -1.5, pz: -9.0, yaw: -20, twist: 8, bend: 14, side: 2, pitch: 6, faceTurn: -10, faceUp: 2, faceTilt: 8 }), e: 'io' },
    { f: 16, q: P({}) },
  ],
  plants: [['L', 0, 16], ['R', 0, 16]],
  strikes: [],
  foes: [[36, 2]],
  foeSwing: [{ foe: 0, f: -14 }],
  struck: [2],
  shake: [[2, 4]],
};

// HIS FALL (a hero's fall, as the other classes' are: proud, true to who falls). The last blow snaps him right round; two
// staggering steps back; his knees go and he drops onto one knee, dust thrown up, a fist on the floor; he pushes himself up
// on it and lifts that fist once more at them; it sinks; his head drops; the light goes out of him. He stays on one knee:
// he does not lie down.
const KNEEL: Q = P({
  px: -8.0, pz: -11.0, yaw: -30, twist: 4, bend: 18, pitch: 8, side: 2, hunch: 12, faceTurn: -14, faceUp: 6,
  lfx: 3.0, lfy: 3.0, lfz: 0.2, lfp: 4, lft: 18, lk: 28, lkUp: 8,
  rfx: -19.0, rfy: -3.0, rfz: 2.6, rfp: 74, rft: -24, rk: -24, rkUp: -62,
  lhx: 8.0, lhy: 2.0, lhz: -12, le: 14, rhx: 7.0, rhy: -6, rhz: -24, re: 10,
});
const FALL: VetMotion = {
  id: 'fall', name: 'His fall', input: 'he falls', long: 96,
  line: 'The last blow snaps him round; two staggering steps back; down onto one knee, a fist on the floor; he pushes up and lifts that fist at them once more; it sinks, his head drops; the light goes out. He never lies down.',
  keys: [
    { f: 0, q: P({}) },
    { f: 2, q: P({ px: -1.5, pz: -6.5, yaw: -14, twist: 24, bend: -12, side: 12, pitch: -10, faceTurn: 40, faceUp: 26, faceTilt: -22, lhx: 4, lhy: 8, lhz: 2, le: 40, rhx: 2, rhy: -9, rhz: 0, re: 50 }), e: 'lin' },
    { f: 7, q: P({ px: -6.0, pz: -8.0, yaw: -6, twist: 30, bend: -16, side: 14, pitch: -14, faceTurn: 48, faceUp: 30, faceTilt: -26, lfx: 3.5, lfz: 4.5, lfp: 30, rfz: 3.0, lhx: 2, lhy: 10, lhz: -2, le: 50, rhx: 0, rhy: -10, rhz: -4, re: 60 }), e: 'out' },
    { f: 12, q: P({ px: -9.0, pz: -9.0, yaw: -14, twist: 16, bend: -4, side: 8, pitch: -6, faceTurn: 20, faceUp: 14, faceTilt: -10, lfx: 3.0, lfz: 0.3, lfp: 6, lft: 18, rfx: -8.0, rfz: 5.0, rfp: 30, lhx: 4, lhy: 8, lhz: -6, le: 30, rhx: 2, rhy: -9, rhz: -8, re: 40 }), e: 'in' },
    { f: 16, q: P({ px: -11.0, pz: -9.5, yaw: -18, twist: 12, bend: 0, side: 5, pitch: -2, faceTurn: 6, faceUp: 8, lfx: 3.0, lfz: 0.3, lfp: 6, lft: 18, rfx: -14.0, rfz: 3.0, rfp: 24, lhx: 5, lhy: 5, lhz: -7, le: 24, rhx: 3, rhy: -7, rhz: -9, re: 28 }), e: 'io' },
    { f: 18, q: P({ px: -12.0, pz: -10.0, yaw: -20, twist: 10, bend: 4, side: 4, pitch: 0, faceTurn: 0, faceUp: 4, lfx: 3.0, lfz: 0.3, lfp: 6, lft: 18, rfx: -15.0, rfz: 0.3, rfp: 20, lhx: 6, lhy: 4, lhz: -8, le: 20, rhx: 4, rhy: -6, rhz: -10, re: 20 }), e: 'io' },
    { f: 24, q: P({ px: -12.0, pz: -9.0, yaw: -24, twist: 8, bend: 8, side: 3, faceUp: 4, lfx: 3.0, lfz: 0.3, lfp: 6, lft: 18, rfx: -15.0, rfz: 5.0, rfp: 40, lhx: 6, lhy: 4, lhz: -9, le: 18, rhx: 5, rhy: -6, rhz: -12, re: 16 }), e: 'io' },
    { f: 27, q: { ...KNEEL, px: -10.0, pz: -7.0, rfz: 6.0, rfx: -17.0, rhz: -16 }, e: 'io' },
    { f: 30, q: KNEEL, e: 'out' },
    { f: 36, q: { ...KNEEL, pz: -11.4, bend: 22, hunch: 16, faceUp: -6 }, e: 'out' },
    { f: 50, q: { ...KNEEL, pz: -9.5, bend: 10, hunch: 8, faceUp: 12, faceTurn: -10, rhx: 9, rhy: -3, rhz: -16, re: 14 }, e: 'io' },
    { f: 58, q: { ...KNEEL, pz: -9.0, bend: 4, hunch: 6, faceUp: 18, faceTurn: -8, rhx: 11, rhy: 1, rhz: 13, re: 20 }, e: 'io' },
    { f: 66, q: { ...KNEEL, pz: -9.2, bend: 6, hunch: 6, faceUp: 16, faceTurn: -8, rhx: 11.5, rhy: 1, rhz: 12.5, re: 20 }, e: 'io' },
    { f: 80, q: { ...KNEEL, pz: -11.6, bend: 26, hunch: 20, faceUp: -24, faceTurn: -4, lhx: 6, lhz: -10, rhx: 8.0, rhy: -2, rhz: -16, re: 18 }, e: 'io' },
    { f: 96, q: { ...KNEEL, pz: -11.8, bend: 28, hunch: 22, faceUp: -28, faceTurn: -4, lhx: 6, lhz: -10.5, rhx: 8.0, rhy: -2, rhz: -16.5, re: 18 } },
  ],
  plants: [['L', 0, 2], ['R', 0, 4], ['L', 13, 96, 'end'], ['R', 18, 22, 'end'], ['R', 30, 96, 'end']],
  strikes: [],
  foes: [[36, 2]],
  foeSwing: [{ foe: 0, f: -14 }],
  struck: [2],
  dust: [{ f: 12, at: 'L' }, { f: 18, at: 'R' }, { f: 30, at: 'R', big: true }],
  shake: [[2, 4], [30, 32]],
  out: (f) => track(f, [[66, 0], [92, 1]]),
};

// THE FISTS AIMED AT THEM: at the strike each fist is put where their chin is (his own forward, left and up), its elbow
// turned as it was
function aim(m: VetMotion, at: number[], side: 'L' | 'R', want: V3, dir?: V3): void {
  for (const k of m.keys ?? []) {
    if (!at.includes(k.f)) continue;
    const q = { ...k.q, ...handTo(k.q, side, want, (side === 'L' ? k.q.le : k.q.re) ?? 0) };
    k.q = dir ? elbows(q, side === 'L' ? dir : undefined, side === 'R' ? dir : undefined) : q;
  }
}
aim(JAB, [12, 14], 'L', [35, 9, 45], [0.1, 0.45, -1]);
aim(CROSS, [14, 16], 'R', [37, 7, 44], [0.1, -0.45, -1]);
aim(HOOK, [15], 'L', [31, 13, 44], [-1, 0.5, 0.5]);
aim(HOOK, [16, 18], 'L', [29, -4, 43], [-1, 0.5, 0.4]);

/** The guard elbows held down under the fists, through a move's keys (so they never swing round between them). */
function guardElbow(m: VetMotion, at: number[], side: 'L' | 'R', dir: V3): void {
  for (const k of m.keys ?? []) if (at.includes(k.f)) k.q = elbows(k.q, side === 'L' ? dir : undefined, side === 'R' ? dir : undefined);
}
guardElbow(CROSS, [9, 12, 14, 16, 22], 'L', GUARD_ELBOW);
guardElbow(FALL, [50, 58, 66, 80, 96], 'R', [0.3, -0.4, -1]);
// HIS GUARD THROUGH HIS MOVES (his “I think his elbows are out a little too much in his stance”): wherever a fist is up
// guarding his face, its elbow is tucked in, down in front of his ribs
guardElbow(JAB, [8, 11, 12, 14, 19, 22, 24], 'R', GUARD_ELBOW);
guardElbow(JAB, [22, 24], 'L', GUARD_ELBOW);
guardElbow(HOOK, [10, 13, 15, 16, 18, 23], 'R', GUARD_ELBOW);
guardElbow(RK, [3, 5, 11, 14], 'L', GUARD_ELBOW);
guardElbow(RK, [3, 5, 11, 14, 15, 16, 18, 23, 26, 29], 'R', GUARD_ELBOW);
guardElbow(PUSH, [4, 10, 15, 17, 21, 27, 34], 'L', GUARD_ELBOW);
guardElbow(PUSH, [4, 10, 15, 17, 21, 27, 34], 'R', GUARD_ELBOW);
guardElbow(CROSS, [22], 'R', GUARD_ELBOW);

// (the keys put in between, with their palms)
for (const m of [JAB, CROSS, HOOK, RK, DODGE, UPPER, KNEE, PUSH, HURT, FALL]) {
  if (!m.turn || !m.keys) continue;
  const at = m.turn.f;
  const i = m.keys.findIndex((k) => k.f > at);
  const q = keyed(m.keys, at);
  m.keys.splice(i, 0, { f: at, q: { ...q, ...(m.turn.palmL ? { palmL: m.turn.palmL } : {}), ...(m.turn.palmR ? { palmR: m.turn.palmR } : {}) }, e: m.keys[i].e });
}
export const VET_STAND: VetMotion = { id: 'stand', name: 'Standing', input: 'standing ready', long: STAND_LONG, loops: true, fn: standAt, strikes: [], foes: [], plants: [], line: 'Bouncing on his toes, cocky, ready: his fists circling, a roll of his shoulders, his chin up.' };
export const VET_RUN: VetMotion = { id: 'run', name: 'Running', input: 'moving', long: RUN_LONG, loops: true, fn: runAt, strikes: [], foes: [], carry: (f) => [RUN_CARRY * f, 0], line: 'An action hero’s run: low and driving, knees high, fists pumping, both feet off the floor between strides.' };

/** EVERY MOVE OF HIS, in the order the film shows them. */
export const VET_MOTIONS: VetMotion[] = [VET_STAND, VET_RUN, DODGE, JAB, CROSS, HOOK, RK, PUSH, ELBOW, UPPER, SPINKICK, SPINKICK_CLOSE, KNEE, HURT, FALL];
export const motionById = (id: string): VetMotion => {
  const m = VET_MOTIONS.find((x) => x.id === id);
  if (!m) throw new Error(`no move ${id}`);
  return m;
};

// ---------------------------------------------------------------------------------------------
// HIS SIX COMBOS (his, locked): what is put in, the globes, and the moves in a row.

export type Input = 'tap' | 'hold' | 'swipe' | 'swipeTap' | 'swipeHold';
export interface Combo {
  n: number;
  name: string;
  /** The inputs, as he put them: tap, hold, swipe; a swipe and then a tap or a hold. */
  inputs: string;
  steps: { input: Input; move: string }[];
  line: string;
}
export const VET_COMBOS: Combo[] = [
  { n: 1, name: 'Jab, cross, hook', inputs: 'tap, tap, tap', steps: [{ input: 'tap', move: 'jab' }, { input: 'tap', move: 'cross' }, { input: 'tap', move: 'hook' }], line: 'Steady damage; the hook catches two side by side.' },
  { n: 2, name: 'Jab, cross, flying knee', inputs: 'tap, tap, swipe and hold', steps: [{ input: 'tap', move: 'jab' }, { input: 'tap', move: 'cross' }, { input: 'swipeHold', move: 'knee' }], line: 'The strongest single blow.' },
  { n: 3, name: 'Jab, cross, flying uppercut', inputs: 'tap, tap, swipe and tap', steps: [{ input: 'tap', move: 'jab' }, { input: 'tap', move: 'cross' }, { input: 'swipeTap', move: 'uppercut' }], line: 'Launches one into the air, stunned.' },
  // (his pick, 3 Nov 2026: “Push kick, then round”: the three kicks are three different kicks)
  { n: 4, name: 'Push kick, round kick, spinning jump kick', inputs: 'hold, hold, swipe and hold', steps: [{ input: 'hold', move: 'push' }, { input: 'hold', move: 'roundkick' }, { input: 'swipeHold', move: 'spinkick' }], line: 'The push kick shoves back all in a cone in front; the spinning jump kick hits all round.' },
  { n: 5, name: 'Round kick, spinning elbow, round kick', inputs: 'hold, tap, hold', steps: [{ input: 'hold', move: 'roundkick' }, { input: 'tap', move: 'elbow' }, { input: 'hold', move: 'roundkick' }], line: 'Knocks them back to make room.' },
  { n: 6, name: 'A swipe first', inputs: 'swipe; or swipe and hold', steps: [{ input: 'swipe', move: 'dodge' }, { input: 'swipeHold', move: 'spinkickClose' }], line: 'A swipe on its own is the dodging jump; a swipe and hold first, a spinning jump kick that closes the distance.' },
];
