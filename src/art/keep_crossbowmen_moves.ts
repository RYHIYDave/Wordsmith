// FLOOR 19'S CROSSBOWMEN ON THE WALLS: THEIR MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind
// CROSSBOW_ON (art/keep_crossbowmen.ts, off). Their look and his brief are art/keep_crossbowmen.ts; their aim line and
// their bolt, art/keep_crossbowmen_fx.ts.
//
// His pick, “Stand and shoot” (offered as: "Same brief, but they plant and hold their spot."): they are turrets. They come
// to a spot on the walls with the pavise on their backs, plant it, and hold the spot.
//
// THEIR MOVES:
//   STANDING, planted behind the pavise: the crossbow on the right shoulder, the left thumb in the belt; breathing,
//     shifting the weight, the head turning slowly along the walls, the mouth working, the Hush leaking.
//   THE JOG (to a spot, `CB_PACE` tiles a second): leaning into it, the pavise on the back bouncing, the left hand on its
//     strap, the crossbow carried low in the right hand.
//   THE PLANT (`more.plant`): the left hand up over the shoulder to the pavise's top; it is swung off the back round the
//     left side, and driven down into the floor before them with a stamp; the crossbow up onto the shoulder.
//   THE AIMED SHOT (their one attack; his rulebook's Movement 9, “Like the wind up and wind down are big but the actual
//     punch is lightning quick”): THE WIND-UP, big and held: the crossbow brought down off the shoulder and held up before
//     them, the crank given two hard turns (the crank); raised to the shoulder over the pavise, the cheek on the stock,
//     the body turned side-on; the red aim line drawn out from the bolt's head far across the floor (art/keep_crossbowmen_fx.ts)
//     and HELD, trembling, then steadied (the warning: step out of it). THE STRIKE, two frames: the lever squeezed, the
//     prod snaps, the bolt flashes down the whole line (the thunk, the hiss), the crossbow kicks up and back, smeared.
//     THE WIND-DOWN, big: the kick carried on, rocked back on the heels, the Hush bursting out; the crossbow lowered
//     before them, the string slack.
//   THE RELOAD (`more.reload`, played after every shot): the crossbow held up before them, the right hand on the crank,
//     five hard turns drawing the string back to the nut (the crank, the ratchet), the click; a bolt from the case at the
//     hip laid in the groove; back onto the shoulder.
//   STRUCK: jolted back, the head snapped back, the Hush coughed out.
//   THEIR DEATH (made new on his pick of 30 Oct; see HIS DEATH below): thrown back over, away from the pavise, the last
//     bolt shot up into the air; flat on their backs, sprawled, the helm knocked off; the pavise slapping down flat after
//     them; the Hush leaving them in a grey breath: people again, alive.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/keep_crossbowmen.test.ts

import { footwork, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import type { ActorArt } from './actor_types';
import { CB, CB_BODY, CB_CANVAS, CB_REST0, PAVISE, PLANTED_AT, crossbowAt, crossbowPainter, helmLow, onBack, paviseOutline, planted } from './keep_crossbowmen';
import type { BowPose, Crossbow, CrossbowSay, LooseHelm, Pavise } from './keep_crossbowmen';
import { hash } from './kit';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, cross, dot, elbowFor, heading, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = CB_BODY;
const FPS = 30;
const FR = 1 / FPS;
/** How finely each move is worked out (keys a second): the game's frames fall between them. */
const SR = 60;
const D = Math.PI / 180;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const Z: V3 = [0, 0, 1];

// =============================================================================================
// SMOOTH TRACKS: a value through keys, its speed carried smoothly through each (a monotone cubic: no overshoot; it stops
// only where it turns back or holds). As art/princess_ride.ts `track`.

type Track = (t: number) => number;
export function track(keys: ReadonlyArray<readonly [number, number]>): Track {
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
/** A point through keys (each coordinate its own track). */
function trackAt(ts: ReadonlyArray<number>, vs: ReadonlyArray<V3>, t: number): V3 {
  return [0, 1, 2].map((j) => track(ts.map((x, i) => [x, vs[i][j]] as const))(t)) as unknown as V3;
}
/** A loop's track: its keys repeated either side so that it goes round smoothly. */
function loopTrack(keys: ReadonlyArray<readonly [number, number]>, T: number): Track {
  const ext = [...keys.map(([t, v]) => [t - T, v] as const), ...keys, ...keys.map(([t, v]) => [t + T, v] as const)];
  const f = track(ext);
  return (t) => f(((t % T) + T) % T);
}

// =============================================================================================
// HOW EACH MOVE IS MADE: the body through its keys; the crossbow through its places (each worked out on the body as it is
// at the moment, so that a crossbow on the shoulder rides the shoulder); each hand through what it holds (the crossbow's
// grip, its crank, its fore-stock; the belt; the pavise's top; the bolt case), and each elbow the way it hangs; sampled
// SR times a second. A lightning strike goes straight from its wind-up's end to where it lands.

/** What a hand goes to, worked out at the moment on the body (`s`), the crossbow (`cb`) and the pavise (`pv`). */
type Hand = (s: Skeleton, cb: Crossbow, pv: Pavise, t: number) => V3;
/** Where the crossbow is, worked out at the moment on the body. */
type Bow = (s: Skeleton, t: number) => BowPose;
interface Plan {
  long: number;
  /** A loop (its stand): its keys go round. */
  loop?: boolean;
  body: ReadonlyArray<readonly [number, P]>;
  bow: ReadonlyArray<readonly [number, Bow]>;
  right: ReadonlyArray<readonly [number, Hand]>;
  left: ReadonlyArray<readonly [number, Hand]>;
  /** The way each elbow hangs from its arm (the figure's own ways), through keys. */
  elbows: ReadonlyArray<readonly [number, V3, V3]>;
  draw: ReadonlyArray<readonly [number, number]>;
  crank: ReadonlyArray<readonly [number, number]>;
  /** The pavise: planted (if not said), or how far it has come from their back to planted (0 to 1), through keys. */
  pavise?: ReadonlyArray<readonly [number, number]>;
  strike?: readonly [number, number];
  hit?: number;
}
/** What a move is, sampled: its motion, and at each sample the crossbow and the pavise as they are. */
interface Made {
  motion: Motion;
  bows: { grip: V3; way: V3; across: V3; draw: number; crank: number }[];
  pavises: Pavise[];
}
const fieldsOf = (ps: ReadonlyArray<P>): string[] => [...new Set(ps.flatMap((p) => Object.keys(p)))].filter((k) => k !== 'lhIn' && k !== 'rhIn');
/** The pavise `k` of the way from their back (0) to planted (1): lifted off the back over the left shoulder, swung round their left side, and driven down into the floor before them. Its hold, the middle of its top, is where their left hand is on it. */
export function paviseSwing(s: Skeleton, k: number): Pavise {
  const P1 = planted();
  if (k <= 0) return onBack(s);
  if (k >= 1) return P1;
  const P0 = onBack(s);
  const topOf = (p: Pavise): V3 => add(p.c, mul(p.up, PAVISE.h));
  const ks = [0, 0.42, 0.74, 1];
  const T = trackAt(ks, [topOf(P0), [-1, 21, 59], [24, 5, 46.5], topOf(P1)], k);
  const up = norm(trackAt(ks, [P0.up, norm([0, -0.2, 1]), norm([-0.05, 0, 1]), P1.up], k));
  const n0 = norm(trackAt(ks, [P0.n, heading(100, 0), heading(14, -2), P1.n], k));
  const n = norm(sub(n0, mul(up, dot(n0, up))), [1, 0, 0]);
  return { c: sub(T, mul(up, PAVISE.h)), n, up, across: norm(cross(up, n)) };
}
/** The hold on the pavise's top for the left hand: the middle of its top edge, the hand on it. */
export const paviseHold = (pv: Pavise): V3 => add(pv.c, add(mul(pv.up, PAVISE.h + 1.5), mul(pv.n, -0.5)));

function make(plan: Plan, rest: Bones): Made {
  const T = plan.long;
  const bodyFields = fieldsOf(plan.body.map(([, p]) => p));
  const full = plan.body.map(([t, p]) => [t, { ...rest, ...p } as Record<string, number>] as const);
  const tr = (keys: ReadonlyArray<readonly [number, number]>): Track => (plan.loop ? loopTrack(keys, T) : track(keys));
  const bodyTracks = new Map(bodyFields.map((f) => [f, tr(full.map(([t, p]) => [t, p[f]] as const))]));
  const drawT = tr(plan.draw);
  const crankT = tr(plan.crank);
  const pavT = plan.pavise ? tr(plan.pavise) : null;
  const st = plan.strike;
  /** A time as the tracks see it: in a strike, its wind-up's end and where it lands only (the strike itself is a straight line between them). */
  const bodyAt = (t: number): P => {
    const out: Record<string, number> = {};
    for (const f of bodyFields) out[f] = (bodyTracks.get(f) as Track)(t);
    return out as P;
  };
  /** Keys through a list of places, each worked out now; a loop's repeated either side. */
  const through = <X>(keys: ReadonlyArray<readonly [number, X]>, val: (x: X) => V3, t: number): V3 => {
    const ts = keys.map(([k]) => k);
    const vs = keys.map(([, x]) => val(x));
    if (!plan.loop) return trackAt(ts, vs, t);
    const tt = [...ts.map((x) => x - T), ...ts, ...ts.map((x) => x + T)];
    return trackAt(tt, [...vs, ...vs, ...vs], ((t % T) + T) % T);
  };
  const sample = (t: number): { pose: P; bow: Made['bows'][number]; pv: Pavise } => {
    const body = bodyAt(t);
    const s0 = solve(B, { ...rest, ...body } as Posed);
    const pv = pavT ? paviseSwing(s0, clamp01(pavT(t))) : planted();
    const bows = plan.bow.map(([k, f]) => [k, f(s0, t)] as const);
    const grip = through(bows, (b) => b.grip, t);
    const way0 = norm(through(bows, (b) => b.way, t), [1, 0, 0]);
    const ac0 = through(bows, (b) => b.across, t);
    const across = norm(sub(ac0, mul(way0, dot(ac0, way0))), [0, 1, 0]);
    const draw = clamp01(drawT(t));
    const crank = crankT(t);
    const cb = crossbowAt({ grip, way: way0, across }, draw, crank);
    const handR = through(plan.right, (h) => h(s0, cb, pv, t), t);
    const handL = through(plan.left, (h) => h(s0, cb, pv, t), t);
    const ekeys = plan.elbows;
    const eL = norm(through(ekeys.map(([k, l]) => [k, l] as const), (v) => v, t));
    const eR = norm(through(ekeys.map(([k, , r]) => [k, r] as const), (v) => v, t));
    const hands: P = { lhIn: 2, lhx: handL[0], lhy: handL[1], lhz: handL[2], rhIn: 2, rhx: handR[0], rhy: handR[1], rhz: handR[2] };
    const q = { ...rest, ...body, ...hands } as Posed;
    const le = elbowFor(B, q, true, eL);
    const re = elbowFor(B, { ...q, le } as Posed, false, eR);
    return { pose: { ...body, ...hands, le, re, draw, pAz: crank, pt: pavT ? clamp01(pavT(t)) : 1 }, bow: { grip, way: way0, across, draw, crank }, pv };
  };
  const n = Math.round(T * SR);
  const keys: Key3[] = [];
  const bowsOut: Made['bows'] = [];
  const pavs: Pavise[] = [];
  const at: { pose: P; bow: Made['bows'][number]; pv: Pavise }[] = [];
  for (let i = 0; i <= n; i++) at.push(sample(i / SR));
  // (the strike: straight from its wind-up's end to where it lands)
  if (st) {
    const i0 = Math.round(st[0] * SR);
    const i1 = Math.round(st[1] * SR);
    for (let i = i0 + 1; i < i1; i++) {
      const k = (i - i0) / (i1 - i0);
      const a = at[i0];
      const b = at[i1];
      const pose: Record<string, number> = {};
      for (const f of Object.keys(b.pose)) {
        const va = (a.pose as Record<string, number>)[f];
        const vb = (b.pose as Record<string, number>)[f];
        pose[f] = typeof va === 'number' && typeof vb === 'number' ? va + (vb - va) * k : vb;
      }
      pose.lhIn = 2;
      pose.rhIn = 2;
      const bow = { grip: lerp3(a.bow.grip, b.bow.grip, k), way: norm(lerp3(a.bow.way, b.bow.way, k)), across: norm(lerp3(a.bow.across, b.bow.across, k)), draw: a.bow.draw + (b.bow.draw - a.bow.draw) * k, crank: b.bow.crank };
      at[i] = { pose: pose as P, bow, pv: b.pv };
    }
  }
  for (let i = 0; i <= n; i++) {
    keys.push({ at: i / SR, pose: at[i].pose, ease: 'lin' });
    bowsOut.push(at[i].bow);
    pavs.push(at[i].pv);
  }
  const motion: Motion = plan.loop ? { keys, loop: 0 } : plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
  return { motion, bows: bowsOut, pavises: pavs };
}
/** The crossbow of a made move at a moment (between its samples). */
function bowOf(made: Made, t: number, loop: boolean): Crossbow {
  const n = made.bows.length - 1;
  const T = n / SR;
  const u = loop ? ((((t % T) + T) % T) * SR) : clamp01(t / T) * n;
  const i = Math.min(n - 1, Math.floor(u));
  const k = u - i;
  const a = made.bows[i];
  const b = made.bows[i + 1];
  return crossbowAt({ grip: lerp3(a.grip, b.grip, k), way: norm(lerp3(a.way, b.way, k)), across: norm(lerp3(a.across, b.across, k)) }, a.draw + (b.draw - a.draw) * k, a.crank + (b.crank - a.crank) * k);
}
function paviseOfMade(made: Made, t: number): Pavise {
  const n = made.pavises.length - 1;
  const u = clamp01(t / (n / SR)) * n;
  const i = Math.min(n - 1, Math.floor(u));
  const k = u - i;
  const a = made.pavises[i];
  const b = made.pavises[i + 1];
  const up = norm(lerp3(a.up, b.up, k));
  const n0 = norm(lerp3(a.n, b.n, k));
  const nn = norm(sub(n0, mul(up, dot(n0, up))));
  return { c: lerp3(a.c, b.c, k), up, n: nn, across: norm(cross(up, nn)) };
}

// =============================================================================================
// WHAT THE HANDS GO TO, AND WHERE THE CROSSBOW IS

const R0 = CB_REST0;
/** The crossbow's left for a stock that points `way` upright (its groove up). */
const leftOf = (way: V3): V3 => norm(cross(Z, way), [0, 1, 0]);
const bowAt = (grip: V3, az: number, el: number): BowPose => {
  const way = heading(az, el);
  return { grip, way, across: leftOf(way) };
};
/** ON THE RIGHT SHOULDER: the stock over it, the butt before it in the right hand, the prod up behind the helm. */
const SHOULDER_AZ = 160;
const SHOULDER_EL = 48;
const onShoulder: Bow = (s) => {
  const [cf, cl, cu] = s.chest;
  const way = heading(SHOULDER_AZ, SHOULDER_EL);
  const q = add(s.shoulderR, add(mul(cu, 3.9), add(mul(cl, -0.5), mul(cf, -0.6))));
  return { grip: sub(q, mul(way, 3.6)), way, across: leftOf(way) };
};
/** CARRIED, jogging: low at the right side, the nose forward and down. */
const carried: Bow = (s) => {
  const [hf, hl, hu] = s.hips;
  const way = heading(-4, -26);
  return { grip: add(s.pelvis, add(mul(hf, 4.6), add(mul(hl, -10.2), mul(hu, -1.8)))), way, across: leftOf(way) };
};
/** UPRIGHT before the right shoulder, on the way off it or onto it: the prod clear over the helm. */
const upright: Bow = (s) => {
  const way = norm([0.3, -0.2, 0.93]);
  return { grip: add(s.shoulderR, add(mul(s.chest[0], 7.6), add(mul(s.chest[1], -0.8), mul(s.chest[2], -2.4)))), way, across: leftOf(way) };
};
/** PRESENTED before them, to crank: the butt at the right hip, the nose up over the pavise. */
const PRESENT = { butt: [8.6, -6.4, 31.5] as V3, az: 2, el: 50 };
const presented: Bow = () => {
  const way = heading(PRESENT.az, PRESENT.el);
  return { grip: add(PRESENT.butt, mul(way, CB.butt)), way, across: leftOf(way) };
};
/** LEVELLED AT YOU over the pavise: the butt in the right shoulder, the cheek on the stock; `t` for the tremble while it is held. */
export const AIM = { butt: [3.3, -6.0, 48.6] as V3 };
const aimed = (tremble: number): Bow => (_s, t) => {
  // (the tremble: small and quick, as a man holds a heavy thing still)
  const a = tremble * (0.35 * Math.sin(t * 41) + 0.2 * Math.sin(t * 67 + 1.3));
  const e = tremble * (0.3 * Math.sin(t * 53 + 0.4) + 0.18 * Math.sin(t * 79 + 2.1));
  const way = heading(a, e);
  return { grip: add(add(AIM.butt, mul(way, CB.butt)), [0, 0.06 * tremble * Math.sin(t * 47), 0.05 * tremble * Math.sin(t * 59)]), way, across: leftOf(way) };
};
/** KICKED: the lever squeezed, the crossbow thrown up and back against the shoulder. */
const kicked = (back: number, up: number, el: number): Bow => () => {
  const way = heading(0, el);
  return { grip: add(add(AIM.butt, mul(way, CB.butt)), [-back, 0, up]), way, across: leftOf(way) };
};

const gripOf: Hand = (_s, cb) => cb.grip;
const knobOf: Hand = (_s, cb) => add(cb.handle, mul(cb.across, 0.6));
/** The left hand under the fore-stock, `k` before the grip. */
const foreOf = (k: number): Hand => (_s, cb) => cb.at(k, -2.0, 0.3);
/** The left thumb hooked in the belt, at its front left. */
const belt: Hand = (s) => add(s.pelvis, add(mul(s.belly[0], B.waistDeep + 4.2), add(mul(s.belly[1], 2.8), mul(s.hips[2], B.waist * 0.42 - 0.6))));
/** The left hand on the pavise's strap at the chest, jogging. */
const strap: Hand = (s) => add(lerp3(s.ribs, s.neck, 0.5), add(mul(s.chest[0], B.ribDeep + 3.6), mul(s.chest[1], 3.4)));
const onPavise: Hand = (_s, _cb, pv) => paviseHold(pv);
/** The mouth of the bolt case at the right hip, the hand in it. */
const caseMouth: Hand = (s) => add(s.pelvis, add(mul(s.hips[1], -(B.pelvisHalf + 3.9)), add(mul(s.hips[0], -0.6), mul(s.hips[2], B.waist * 0.25 + 1.6))));
/** Over the groove, laying the bolt in. */
const groove: Hand = (_s, cb) => cb.at(CB.nut + 4, 2.8, -0.6);

// =============================================================================================
// STANDING, PLANTED BEHIND THE PAVISE

export const CB_STAND_LONG = 2.4;
const ELB_REST: [V3, V3] = [[0.1, 1, -0.7], [0.2, -1, -0.8]];
function standPlan(): Plan {
  const T = CB_STAND_LONG;
  const body: [number, P][] = [];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * T;
    const a = (t / T) * Math.PI * 2;
    body.push([t, {
      pz: R0.pz + 0.6 * Math.sin(a), py: 1.3 * Math.sin(a + 0.6), roll: R0.roll + 2.2 * Math.sin(a + 0.6), side: 1.3 * Math.sin(a + 0.6),
      pitch: R0.pitch, bend: R0.bend - 1.6 * Math.sin(a),
      faceTurn: R0.faceTurn + 18 * Math.sin(a + 0.4), faceUp: R0.faceUp + 2 * Math.sin(2 * a), faceTilt: R0.faceTilt + 3 * Math.sin(a + 1.2),
    }]);
  }
  return {
    long: T,
    loop: true,
    body,
    bow: [[0, onShoulder]],
    right: [[0, gripOf]],
    left: [[0, belt]],
    elbows: [[0, ...ELB_REST]],
    draw: [[0, 1]],
    crank: [[0, 0]],
  };
}
/** Their mouths, working on words that make no sound. */
export function cbJaw(t: number): number {
  const u = (t / CB_STAND_LONG) % 1;
  return 0.3 + 0.5 * Math.max(0, Math.sin(u * Math.PI * 6)) * (u < 0.7 ? 1 : 0.3);
}

// =============================================================================================
// THE JOG, THE PAVISE ON THE BACK

/** Their pace, tiles a second: a quick jog to their spot (the knight walks 2.5). */
export const CB_PACE = 2.0;
export const CB_RUN = { frames: 12, fps: 20 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u) * (1 - u) - 6 * Math.sin(Math.PI * u) * u];
}
/** Carrying: the body as it is jogging, on average (the plant begins from it). */
const CARRY_BODY: P = { pz: R0.pz - 1.0, pitch: R0.pitch + 6, bend: R0.bend + 2, roll: R0.roll, side: 0, py: 0, faceUp: R0.faceUp + 6, faceTurn: 0, faceTilt: 0 };
const ELB_CARRY: [V3, V3] = [[0.2, 1, -0.6], [-0.1, -1, -0.5]];
function jog(): Motion {
  const n = CB_RUN.frames;
  const d = (CB_PACE * TILE3) / CB_RUN.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 4.6);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 4.6);
    const bob = Math.abs(Math.cos(a));
    const body: P = {
      ...CARRY_BODY,
      pz: (CARRY_BODY.pz as number) - 0.8 + 1.8 * bob, py: 1.2 * Math.sin(a), roll: R0.roll + 3 * Math.sin(a), yaw: 4 * Math.cos(a), twist: -4 * Math.cos(a), side: 1.2 * Math.sin(a),
      bend: (CARRY_BODY.bend as number) + 1.5 * (1 - bob), faceUp: (CARRY_BODY.faceUp as number) - 2 * bob, faceTilt: 3 * Math.sin(a), faceTurn: 3 * Math.cos(a),
      lfx: lx, lfz: lz, lfp: lp, lfy: R0.lfy - 0.6, lft: 6, lk: 9,
      rfx: rx, rfz: rz, rfp: rp, rfy: R0.rfy + 0.6, rft: -6, rk: -9,
    };
    const s0 = solve(B, { ...R0, ...body } as Posed);
    const bp = carried(s0, 0);
    // (the crossbow swinging a little with the stride)
    const grip = add(bp.grip, [0.9 * Math.sin(a + Math.PI), 0, 0.5 * bob]);
    const way = norm(add(bp.way, [0, 0, 0.03 * Math.sin(a)]));
    const cb = crossbowAt({ grip, way, across: leftOf(way) }, 1, 0);
    const hL = strap(s0, cb, planted(), 0);
    const hands: P = { lhIn: 2, lhx: hL[0], lhy: hL[1], lhz: hL[2], rhIn: 2, rhx: grip[0], rhy: grip[1], rhz: grip[2] };
    const q = { ...R0, ...body, ...hands } as Posed;
    const le = elbowFor(B, q, true, norm(ELB_CARRY[0]));
    const re = elbowFor(B, { ...q, le } as Posed, false, norm(ELB_CARRY[1]));
    keys.push({ at: i / CB_RUN.fps, ease: 'lin', pose: { ...body, ...hands, le, re, draw: 1, pt: 0, pAz: 0, wAz: Math.atan2(way[1], way[0]) / D, wEl: Math.asin(way[2]) / D } });
  }
  return { keys, loop: 0 };
}
/** The crossbow while jogging, from the bones of the moment. */
function jogBow(s: Skeleton, q: Posed): Crossbow {
  const way = heading(q.wAz, q.wEl);
  return crossbowAt({ grip: s.handR, way, across: leftOf(way) }, 1, 0);
}
const runJaw = (t: number): number => 0.55 + 0.3 * Math.max(0, Math.sin((t / (CB_RUN.frames / CB_RUN.fps)) * Math.PI * 4));

// =============================================================================================
// THE PLANT

export const CB_PLANT = { long: 0.8, grab: 0.12, slam: 0.47 } as const;
const L0: Plant = plantOf(B, 'L', {}, R0);
const RF0: Plant = plantOf(B, 'R', {}, R0);
function plantPlan(): Plan {
  const S = CB_PLANT.slam;
  return {
    long: CB_PLANT.long,
    body: [
      [0, CARRY_BODY],
      [CB_PLANT.grab, { ...CARRY_BODY, pitch: R0.pitch + 1, bend: R0.bend - 2, pz: R0.pz - 0.4, faceUp: 6, faceTurn: 10 }],
      [0.27, { yaw: 22, twist: 12, pitch: 0, bend: 2, roll: -2, side: -3, pz: R0.pz + 0.4, py: 1.5, faceUp: 10, faceTurn: 30, faceTilt: -4 }],
      [0.4, { yaw: 4, twist: -2, pitch: 8, bend: 6, roll: 0, side: 0, pz: R0.pz - 0.8, px: 1.2, py: 0.5, faceUp: 0, faceTurn: 6, faceTilt: 0 }],
      [S, { yaw: -2, twist: -4, pitch: 15, bend: 11, roll: 1, side: 0, pz: R0.pz - 3.4, px: 3.2, py: 0, faceUp: -8, faceTurn: 0, faceTilt: 2 }],
      [0.6, { yaw: 0, twist: 0, pitch: 8, bend: 9, pz: R0.pz - 1.8, px: 1.4, faceUp: -2, faceTurn: 2, faceTilt: -2 }],
      [CB_PLANT.long, {}],
    ],
    bow: [[0, carried], [0.42, carried], [0.66, upright], [CB_PLANT.long, onShoulder]],
    right: [[0, gripOf]],
    left: [[0, strap], [CB_PLANT.grab, onPavise], [0.56, onPavise], [CB_PLANT.long, belt]],
    elbows: [[0, ...ELB_CARRY], [0.12, [0.5, 0.5, 0.4], [-0.1, -1, -0.5]], [0.3, [0.5, 0.3, -0.5], [-0.1, -1, -0.5]], [0.47, [-0.1, 1, 0.25], [0, -1, -0.6]], [0.6, [0, 1, -0.2], [0, -1, -0.6]], [CB_PLANT.long, ...ELB_REST]],
    draw: [[0, 1]],
    crank: [[0, 0]],
    pavise: [[0, 0], [CB_PLANT.grab, 0], [0.27, 0.42], [0.4, 0.74], [S - 1 / 60, 0.985], [S, 1], [CB_PLANT.long, 1]],
  };
}
function plantFeet(): (t: number) => P {
  const S = CB_PLANT.slam;
  return footwork(B, {
    // (the left foot stamps forward as the pavise is driven down, and is drawn back under them)
    L: { start: L0, moves: [{ t0: S - 0.12, t1: S - 0.005, to: plantBy(L0, 6.5, -1.0, -4), lift: 3.2 }, { t0: 0.58, t1: 0.76, to: L0, lift: 2.4 }] },
    // (the right turns on its ball with the swing, and back)
    R: { start: RF0, moves: [{ t0: 0.14, t1: 0.3, to: { ...RF0, turn: RF0.turn + 16, pitch: 24 } }, { t0: 0.34, t1: 0.5, to: RF0 }] },
  });
}

// =============================================================================================
// THE AIMED SHOT (their one attack)

/** Its times (seconds): the crank's two turns; the raise; the aim line drawn out and held (the warning) and steadied at its end; the strike (two frames, the game's thirty a second); the blow, as it lands; the long wind-down. */
export const CB_SHOT = {
  long: 2.1,
  crank: [0.16, 0.52] as const,
  raise: [0.52, 0.72] as const,
  line: [0.62, 0.76] as const,
  warn: [0.76, 41 / FPS] as const,
  steady: [1.22, 41 / FPS] as const,
  strike: [41 / FPS, 43 / FPS] as const,
  hit: 43 / FPS,
};
/** The aim line's length (tiles, from their floor point along the way they face) and where the bolt lands at its end. */
export const CB_LINE = { tiles: 12 } as const;
export const boltLands = (): V3 => {
  const head = crossbowAt(aimed(0)(null as unknown as Skeleton, 0), 1, 0).head;
  return [CB_LINE.tiles * TILE3, head[1], head[2]];
};
const AIM_BODY: P = { yaw: -18, twist: -14, pitch: 7, bend: 3, roll: 1, side: 4, pz: R0.pz - 1.4, px: 0.6, py: 0, faceTurn: 0, faceUp: -2, faceTilt: 13 };
const PRESENT_BODY: P = { yaw: -6, twist: -4, pitch: 6, bend: 7, roll: 1, side: 1, pz: R0.pz - 1.0, px: 0.4, faceTurn: 6, faceUp: -12, faceTilt: 2 };
const ELB_AIM: [V3, V3] = [[0, 0.9, -0.5], [-0.2, -1, -0.5]];
const ELB_PRESENT: [V3, V3] = [[0, 1, -0.6], [0, -1, -0.7]];
function shotPlan(): Plan {
  const S = CB_SHOT;
  const [s0, s1] = S.strike;
  return {
    long: S.long,
    strike: S.strike,
    hit: S.hit,
    body: [
      [0, {}],
      [0.18, PRESENT_BODY],
      [0.3, { ...PRESENT_BODY, pz: (PRESENT_BODY.pz as number) - 0.4, roll: 2 }],
      [S.crank[1], { ...PRESENT_BODY, faceUp: -8 }],
      [S.raise[1], AIM_BODY],
      [S.warn[0], { ...AIM_BODY, pz: (AIM_BODY.pz as number) - 0.15 }],
      [S.steady[0], { ...AIM_BODY, pz: (AIM_BODY.pz as number) - 0.25, faceTilt: 13.5 }],
      [s0, { ...AIM_BODY, pz: (AIM_BODY.pz as number) - 0.3, faceTilt: 14 }],
      // (the strike: the hips hold; the chest and the head take the kick)
      [s1, { ...AIM_BODY, pz: (AIM_BODY.pz as number) - 0.3, twist: -17, bend: 0.5, faceUp: 3, faceTilt: 10 }],
      [s1 + 0.1, { ...AIM_BODY, pz: (AIM_BODY.pz as number) - 0.2, twist: -18, bend: -0.5, faceUp: 6, faceTilt: 8 }],
      // (rocked back on the heels by it)
      [1.7, { ...AIM_BODY, yaw: -15, twist: -16, pitch: 1, bend: -3, px: -1.4, pz: (AIM_BODY.pz as number) + 0.2, faceUp: 7, faceTilt: 6 }],
      [1.88, { ...PRESENT_BODY, pitch: 4, faceUp: -2 }],
      [S.long, PRESENT_BODY],
    ],
    bow: [
      [0, onShoulder],
      [0.08, upright],
      [0.18, presented],
      [S.crank[1], presented],
      [S.raise[1], aimed(0)],
      [S.warn[0], aimed(1)],
      [S.steady[0], aimed(1)],
      [s0, aimed(0)],
      [s1, kicked(2.6, 1.8, 13)],
      [s1 + 0.12, kicked(3.4, 2.5, 17)],
      [1.7, kicked(3.6, 2.4, 18)],
      [1.9, presented],
      [S.long, presented],
    ],
    right: [[0, gripOf], [0.12, gripOf], [S.crank[0] + 0.02, knobOf], [S.crank[1], knobOf], [S.raise[0] + 0.1, gripOf]],
    left: [[0, belt], [0.2, foreOf(13)], [S.crank[1], foreOf(13)], [S.raise[1], foreOf(8.5)], [1.7, foreOf(8.5)], [1.9, foreOf(13)], [S.long, foreOf(13)]],
    elbows: [[0, ...ELB_REST], [0.2, ...ELB_PRESENT], [S.crank[1], ...ELB_PRESENT], [S.raise[1], ...ELB_AIM], [1.7, ...ELB_AIM], [1.9, ...ELB_PRESENT]],
    draw: [[0, 1], [s0, 1], [s1, 0], [S.long, 0]],
    crank: [[0, 0], [S.crank[0], 0], [S.crank[1], 720], [S.long, 720]],
  };
}

// =============================================================================================
// THE RELOAD

export const CB_RELOAD = { long: 2.2, crank: [0.16, 1.3] as const, turns: 5, take: 1.46, laid: 1.64 } as const;
function reloadPlan(): Plan {
  const L = CB_RELOAD;
  const body: [number, P][] = [[0, PRESENT_BODY]];
  // (bobbing with each turn of the crank)
  for (let i = 0; i <= 10; i++) {
    const t = L.crank[0] + ((L.crank[1] - L.crank[0]) * i) / 10;
    body.push([t, { ...PRESENT_BODY, pz: (PRESENT_BODY.pz as number) - 0.3 - 0.5 * (i % 2), roll: 1 + 1.5 * (i % 2 ? 1 : -1), bend: (PRESENT_BODY.bend as number) + (i % 2), faceUp: -16 }]);
  }
  body.push(
    [L.take, { ...PRESENT_BODY, yaw: -10, twist: -6, faceUp: -20, faceTurn: -14 }],
    [L.laid, { ...PRESENT_BODY, faceUp: -14, faceTurn: 4 }],
    [1.9, { pitch: R0.pitch + 2, bend: R0.bend + 2, faceUp: 0 }],
    [L.long, {}],
  );
  return {
    long: L.long,
    body,
    bow: [[0, presented], [L.laid + 0.06, presented], [L.long - 0.14, upright], [L.long, onShoulder]],
    right: [[0, gripOf], [0.08, gripOf], [L.crank[0], knobOf], [L.crank[1], knobOf], [L.take, caseMouth], [L.take + 0.04, caseMouth], [L.laid, groove], [L.laid + 0.12, gripOf], [L.long, gripOf]],
    left: [[0, foreOf(13)], [L.laid + 0.12, foreOf(13)], [L.long, belt]],
    elbows: [[0, ...ELB_PRESENT], [L.crank[1], ...ELB_PRESENT], [L.take, [0, 1, -0.6], [-0.4, -1, -0.4]], [L.laid + 0.12, ...ELB_PRESENT], [L.long, ...ELB_REST]],
    draw: ((): [number, number][] => {
      const k: [number, number][] = [[0, 0], [L.crank[0], 0]];
      // (the string drawn back a notch with each half turn: the ratchet)
      for (let i = 1; i <= L.turns * 2; i++) k.push([L.crank[0] + ((L.crank[1] - L.crank[0]) * i) / (L.turns * 2), i / (L.turns * 2)]);
      k.push([L.long, 1]);
      return k;
    })(),
    crank: [[0, 0], [L.crank[0], 0], [L.crank[1], 360 * L.turns], [L.long, 360 * L.turns]],
  };
}
/** The bolt in the right hand, from its case to the groove. */
function boltInHand(t: number, s: Skeleton, cb: Crossbow): { nock: V3; head: V3 } | null {
  const L = CB_RELOAD;
  if (t < L.take || t >= L.laid) return null;
  const k = smooth(L.take + 0.04, L.laid - 0.02, t);
  const way = norm(lerp3([0.1, 0, 1], cb.way, k));
  const nock = lerp3(add(s.handR, mul(way, -1.5)), cb.nock, smooth(L.laid - 0.1, L.laid, t));
  return { nock, head: add(nock, mul(way, CB.bolt)) };
}

// =============================================================================================
// STRUCK, AND THE HUSH LEAVING THEM

export const CB_REEL = 0.4;
function reelPlan(): Plan {
  return {
    long: CB_REEL,
    body: [[0, {}], [0.07, { px: -2.6, pz: R0.pz + 0.4, pitch: -3, bend: -5, faceUp: R0.faceUp + 24, faceTilt: R0.faceTilt + 10 }], [0.2, { px: -1.2, pitch: 3, bend: 7, faceUp: R0.faceUp + 6 }], [CB_REEL, {}]],
    bow: [[0, onShoulder]],
    right: [[0, gripOf]],
    left: [[0, belt]],
    elbows: [[0, ...ELB_REST]],
    draw: [[0, 1]],
    crank: [[0, 0]],
  };
}
// =============================================================================================
// HIS DEATH (made new on his pick of 30 Oct, “Yes, these (Recommended)”, so that Act 2's Hushed die differently): struck
// dead behind his planted pavise he is thrown back hard; his hand jerks on the trigger and the last bolt shoots up into
// the air, a white streak climbing away and gone; his feet swept from under him, he goes over backwards, away from the
// pavise, his legs up, his arms flung out, the crossbow flung from his hand; he comes down flat on his back, sprawled,
// arms and legs out, his kettle helm knocked off and rocking to a stop on its brim behind his head; the pavise, its prop
// giving as he is thrown, tips back after him, heavy, and slaps down flat on its back in a puff of dust a beat after he
// lands; the crossbow clatters down beside him; the Hush leaves him in a grey breath; he lies still, a man
// again, alive. His rulebook's Movement 9: the blow throws him fast; the pavise's fall a heavy beat after.

/** Its times (seconds), but those worked out below from how he and the pavise fall (`CB_DIES`). */
const DT = {
  long: 2.6,
  /** the trigger jerked: the last bolt loosed, straight up */
  fire: 0.06,
  /** the pavise's prop gives as he is thrown (and folds up against its back); and it begins to tip */
  prop: 0.11,
  tip: 0.13,
  /** the crossbow flung from his hand, out to his right as he goes over */
  drop: 0.3,
  /** his back hits the floor; his legs come down after it */
  land: 0.42,
  heels: 0.52,
  /** the light going out of his eyes; the Hush leaving him in a grey breath */
  out: [0.45, 1.1] as const,
  breath: [0.5, 1.62] as const,
  /** his head lolls over and he lies still */
  loll: [0.62, 1.2] as const,
} as const;

/** A vector turned `deg` degrees about the line `ax` (right-handed). */
const turnAbout = (v: V3, ax: V3, deg: number): V3 => {
  const a = deg * D;
  const k = norm(ax);
  return add(add(mul(v, Math.cos(a)), mul(cross(k, v), Math.sin(a))), mul(k, dot(k, v) * (1 - Math.cos(a))));
};
/** The face's numbers (as `solve` reads them: turned, then up, then tilted) for a face turned to its forward `f`, its left `l`. */
function faceNumbers(f: V3, l: V3): { faceTurn: number; faceUp: number; faceTilt: number } {
  const up = Math.asin(Math.max(-1, Math.min(1, f[2])));
  const turn = Math.atan2(f[1], f[0]);
  const l0: V3 = [-Math.sin(turn), Math.cos(turn), 0];
  const u0: V3 = [-Math.sin(up) * Math.cos(turn), -Math.sin(up) * Math.sin(turn), Math.cos(up)];
  const tilt = Math.atan2(dot(l, u0), dot(l, l0));
  return { faceTurn: turn / D, faceUp: up / D, faceTilt: tilt / D };
}
/** A point as the chest has it (from a shoulder, along the chest's forward, left and up), and back. */
const inChest = (s: Skeleton, d: V3): V3 => [dot(d, s.chest[0]), dot(d, s.chest[1]), dot(d, s.chest[2])];
const fromChest = (s: Skeleton, c: V3): V3 => add(add(mul(s.chest[0], c[0]), mul(s.chest[1], c[1])), mul(s.chest[2], c[2]));

/** HIM AS HE STANDS when it takes him (his rest, the crossbow on his shoulder, his left thumb in his belt): where it begins. */
const S0 = solve(B, R0 as Posed);
const BOW0 = onShoulder(S0, 0);
const HAND_R0 = inChest(S0, sub(BOW0.grip, S0.shoulderR));
const HAND_L0 = inChest(S0, sub(belt(S0, crossbowAt(BOW0, 1, 0), planted(), 0), S0.shoulderL));
const FACE_F0 = inChest(S0, S0.face[0]);
const FACE_L0 = inChest(S0, S0.face[1]);
/** The standing pelvis's height (its `pz` 0). */
const HIP_H = B.ankle + B.shank + B.thigh;

/** THE TRACKS OF HIS FALL: his pelvis on the floor's own lines (forward, up); his hips' tip, spine and turn; his legs swung up from them (degrees: 0 hanging, 90 flat along the floor) and spread; how far his knees bend; his head thrown back and lolling; the light out of him. */
const tr = (keys: ReadonlyArray<readonly [number, number]>): Track => track(keys);
const DK = {
  px: tr([[0, 0], [DT.fire, -4], [0.15, -16], [0.26, -31], [0.36, -43.5], [DT.land, -49], [0.47, -51.6], [0.55, -53], [0.7, -53.5]]),
  pz: tr([[0, S0.pelvis[2]], [DT.fire, S0.pelvis[2] + 1.4], [0.12, S0.pelvis[2] + 1.8], [0.2, 29.5], [0.3, 22], [0.37, 13.6], [DT.land, 7.6], [0.465, 8.7], [DT.heels, 7.5], [0.6, 7.65]]),
  pitch: tr([[0, R0.pitch], [DT.fire, -2], [0.15, -22], [0.26, -50], [0.36, -73], [DT.land, -86], [0.47, -82.5], [0.53, -86.5], [0.7, -86]]),
  bend: tr([[0, R0.bend], [DT.fire, -10], [0.15, -9], [0.3, -5], [DT.land, -2], [0.47, 1.5], [0.53, -1], [0.8, -1.5]]),
  roll: tr([[0, R0.roll], [0.15, 3], [DT.land, 4], [0.6, 3]]),
  yaw: tr([[0, 0], [0.2, 6], [DT.land, 9], [0.6, 8]]),
  twist: tr([[0, 0], [0.2, -5], [DT.land, -7], [0.6, -6]]),
  side: tr([[0, 0], [DT.land, -3], [0.6, -2.5]]),
  legs: tr([[0, 0], [DT.fire, 2], [0.15, 16], [0.26, 46], [0.36, 84], [DT.land, 103], [0.47, 99]]),
  spread: tr([[0, 0], [0.15, 6], [0.36, 15], [DT.heels, 18], [0.6, 18]]),
  knee: tr([[0, 1], [0.15, 0.95], [0.36, 0.88], [0.47, 0.92], [DT.heels, 0.985], [0.6, 0.985]]),
  feetOut: tr([[0, 0], [0.3, 10], [DT.heels, 30], [0.7, 34]]),
  back: tr([[0, 0], [DT.fire, 30], [0.18, 18], [DT.land, 14], [0.5, 34], [0.6, 42], [1.2, 44]]),
  loll: tr([[0, 0], [DT.loll[0], 0], [DT.loll[1], 30]]),
  out: tr([[0, 0], [DT.out[0], 0], [DT.out[1], 1]]),
};
/** His legs, lying: each swung up this far, so that his calves rest on the floor (worked out below). */
const LIE_LEGS = { L: 84, R: 84 };
const legsAt = (t: number, side: 'L' | 'R'): number => (t >= DT.heels ? LIE_LEGS[side] : t <= 0.47 ? DK.legs(t) : DK.legs(0.47) + (LIE_LEGS[side] - DK.legs(0.47)) * smooth(0.47, DT.heels, t));

/** His body at a moment of his fall, but his arms and his head (the bones' fields). */
function fallBody(t: number): P {
  return {
    px: DK.px(t), py: 0, pz: DK.pz(t) - HIP_H, pitch: DK.pitch(t), bend: DK.bend(t), roll: DK.roll(t), yaw: DK.yaw(t), twist: DK.twist(t), side: DK.side(t),
    out: clamp01(DK.out(t)),
  };
}
/**
 * HIS LEGS at a moment of his fall, on a body whose hips are where `s` has them: each leg as it hangs at rest, spread out
 * from the hips' forward, swung up about their left (`legs` degrees), its knee bent to bring the ankle in (`knee`); the
 * foot going with the shin as far as it can (then pointing), and falling outward as he lies.
 */
function legsOf(s: Skeleton, t: number, legsBy: (side: 'L' | 'R') => number): P {
  const yaw = DK.yaw(t);
  const F: V3 = [Math.cos(yaw * D), Math.sin(yaw * D), 0];
  const L: V3 = [-F[1], F[0], 0];
  const spread = DK.spread(t);
  const kk = DK.knee(t);
  const out: P = {};
  for (const side of ['L', 'R'] as const) {
    const k = side === 'L' ? 1 : -1;
    const legs = legsBy(side);
    let v = turnAbout(sub(side === 'L' ? S0.ankleL : S0.ankleR, side === 'L' ? S0.hipL : S0.hipR), [0, 0, 1], yaw);
    v = turnAbout(v, F, k * spread);
    v = turnAbout(mul(v, kk), L, -legs);
    const a = add(side === 'L' ? s.hipL : s.hipR, v);
    const foot = Math.min(legs, 62);
    const turn = (side === 'L' ? R0.lft : R0.rft) + yaw + k * DK.feetOut(t);
    const knee = (side === 'L' ? R0.lk : R0.rk) + yaw + k * spread * 0.8;
    if (side === 'L') Object.assign(out, { lfx: a[0], lfy: a[1] - B.stance, lfz: a[2] - B.ankle, lfp: -foot, lft: turn, lk: knee, lkUp: legs });
    else Object.assign(out, { rfx: a[0], rfy: a[1] + B.stance, rfz: a[2] - B.ankle, rfp: -foot, rft: turn, rk: knee, rkUp: legs });
  }
  return out;
}
// (his calves on the floor as he lies: the ankles this far above it, the heels clear of it)
const LIE_ANKLE = 4.0;
{
  const body = fallBody(0.8);
  const s = solve(B, { ...R0, ...body } as Posed);
  for (const side of ['L', 'R'] as const) {
    let lo = 70;
    let hi = 100;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      const q = solve(B, { ...R0, ...body, ...legsOf(s, 0.8, () => mid) } as Posed);
      if ((side === 'L' ? q.ankleL : q.ankleR)[2] > LIE_ANKLE) hi = mid;
      else lo = mid;
    }
    LIE_LEGS[side] = (lo + hi) / 2;
  }
}

/** HIS HANDS through his fall, as the chest has them (from each shoulder): the right on the crossbow, jerking it up; both flung out wide; down flat on the floor beside him. Worked out as he lies. */
const HANDS_LIE = ((): { L: V3; R: V3 } => {
  const body = fallBody(0.8);
  const s0 = solve(B, { ...R0, ...body } as Posed);
  const s = solve(B, { ...R0, ...body, ...legsOf(s0, 0.8, (side) => LIE_LEGS[side]) } as Posed);
  const L: V3 = [s.shoulderL[0] - 2.5, s.shoulderL[1] + 18.5, 2.6];
  const Rt: V3 = [s.shoulderR[0] + 1.5, s.shoulderR[1] - 18, 2.6];
  return { L: inChest(s, sub(L, s.shoulderL)), R: inChest(s, sub(Rt, s.shoulderR)) };
})();
const handTrack = (keys: ReadonlyArray<readonly [number, V3]>): ((t: number) => V3) => {
  const ts = keys.map(([k]) => k);
  const vs = keys.map(([, v]) => v);
  return (t) => trackAt(ts, vs, t);
};
const HAND_R = handTrack([
  [0, HAND_R0],
  [DT.fire, add(HAND_R0, [0.3, -2.0, 4.5])],
  [0.16, [4, -9, 13]],
  [0.28, [7, -15, 10]],
  [0.5, HANDS_LIE.R],
  [0.56, add(HANDS_LIE.R, [0.8, 0, 0])],
  [0.62, HANDS_LIE.R],
]);
const HAND_L = handTrack([
  [0, HAND_L0],
  [DT.fire, add(HAND_L0, [3, 3, 4])],
  [0.16, [9, 8, -4]],
  [0.28, [8, 15, 6]],
  [0.5, HANDS_LIE.L],
  [0.56, add(HANDS_LIE.L, [0.8, 0, 0])],
  [0.62, HANDS_LIE.L],
]);
/** The way each elbow points, through his fall. */
const ELBOWS = ((): ((t: number) => [V3, V3]) => {
  const keys: [number, V3, V3][] = [[0, ...ELB_REST], [DT.fire, [0.3, 1, -0.4], [0.2, -1, -0.2]], [0.2, [0, 1, 0.2], [0, -1, 0.3]], [DT.land, [0.4, 0.6, 0.6], [0.4, -0.6, 0.6]], [0.5, [1, 0.1, 0.4], [1, -0.1, 0.4]]];
  const ts = keys.map(([k]) => k);
  return (t) => [norm(trackAt(ts, keys.map(([, l]) => l), t)), norm(trackAt(ts, keys.map(([, , r]) => r), t))];
})();
/** THE CROSSBOW in his right hand till it is flung from it: on his shoulder; jerked up on end as the trigger goes; swung back as he goes over (its way, as `heading` has it). */
const BOW_AZ = tr([[0, SHOULDER_AZ], [DT.fire, 176], [0.16, 200], [DT.drop, 248]]);
const BOW_EL = tr([[0, SHOULDER_EL], [DT.fire, 77], [0.16, 62], [DT.drop, 30]]);

/** HIS BONES AT EVERY MOMENT OF HIS DEATH (laid over its keys as a mob's feet are: so that his fall is exact on every frame). */
function deathPose(t: number): P {
  const body = fallBody(t);
  const s0 = solve(B, { ...R0, ...body } as Posed);
  const legs = legsOf(s0, t, (side) => legsAt(t, side));
  const s1 = solve(B, { ...R0, ...body, ...legs } as Posed);
  // his head: thrown back by the blow, back on the floor as he lands, lolling over to his right as he lies still
  const back = DK.back(t);
  const loll = DK.loll(t);
  let f = fromChest(s1, FACE_F0);
  let l = fromChest(s1, FACE_L0);
  f = turnAbout(f, s1.chest[1], -back);
  l = turnAbout(l, s1.chest[1], -back);
  f = turnAbout(f, s1.chest[2], -loll);
  l = turnAbout(l, s1.chest[2], -loll);
  const face = faceNumbers(f, l);
  const hR = HAND_R(t);
  const hL = HAND_L(t);
  const hands: P = { lhIn: 0, lhx: hL[0], lhy: hL[1], lhz: hL[2], rhIn: 0, rhx: hR[0], rhy: hR[1], rhz: hR[2] };
  const q = { ...R0, ...body, ...legs, ...face, ...hands } as Posed;
  const [eL, eR] = ELBOWS(t);
  const le = elbowFor(B, q, true, eL);
  const re = elbowFor(B, { ...q, le } as Posed, false, eR);
  return { ...body, ...legs, ...face, ...hands, le, re, draw: t < DT.fire ? 1 : 0, pt: 1, pAz: 0 };
}
function diesMotion(): Motion {
  const keys: Key3[] = [];
  const n = Math.round(DT.long * SR);
  for (let i = 0; i <= n; i++) keys.push({ at: i / SR, pose: deathPose(i / SR), ease: 'lin' });
  return { keys };
}
/** The crossbow as he dies, from his bones: in his right hand, its way through its keys; loosed at `fire`. */
function dyingBow(t: number, s: Skeleton): Crossbow {
  const way = heading(BOW_AZ(t), BOW_EL(t));
  return crossbowAt({ grip: s.handR, way, across: leftOf(way) }, t < DT.fire ? 1 : 0, 0);
}

// THE HELM, KNOCKED OFF HIM as his head comes down to the floor: flung back off it, turning over toward its crown up; down
// on the back of its brim, tipped; rocking on its brim, less and less, turning a little as it rocks; still, crown up.
/** When it leaves his head: as his head comes down within this of the floor (worked out below). */
const HELM_OFF_Z = 9.5;
/** How far his helm is painted tipped from the eye on his head (art/keep_crossbowmen.ts: wornOn's eight degrees). */
const HELM_TIPPED = 8;
const HELM = ((): { off: number; still: number; at: (t: number) => LooseHelm | null } => {
  let off: number = DT.land;
  for (let t = 0.25; t <= DT.land; t += 1 / 240) {
    if (solve(B, { ...R0, ...deathPose(t) } as Posed).head[2] < HELM_OFF_Z) {
      off = t;
      break;
    }
  }
  const s0 = solve(B, { ...R0, ...deathPose(off) } as Posed);
  const s1 = solve(B, { ...R0, ...deathPose(off + 1 / 120) } as Posed);
  const [F0, L0f, U0] = s0.face;
  const c0 = add(s0.head, mul(U0, -0.3));
  // (where it comes down: back beyond his head, and a little to his left)
  const away = norm([U0[0], U0[1], 0], [-1, 0, 0]);
  const FLY = 0.2;
  const ROCK = 0.95;
  const TIPPED_LAND = 24;
  const cLand: V3 = add(c0, add(mul(away, 15), [0, 2.5, 0]));
  // (its crown turned over to the sky about a level line square to where it goes)
  const ax = norm(cross(U0, [0, 0, 1]), [0, 1, 0]);
  const A = Math.acos(Math.max(-1, Math.min(1, U0[2]))) / D;
  const frameAt = (deg: number, spin: number): [V3, V3, V3] => [F0, L0f, U0].map((v) => turnAbout(turnAbout(v, ax, deg), [0, 0, 1], spin)) as [V3, V3, V3];
  /** How far its crown has turned toward the sky, and turned round, `u` seconds after it leaves him. */
  const turnOf = (u: number): [number, number] => {
    if (u <= FLY) return [(A - TIPPED_LAND) * smooth(0, FLY, u) * (0.6 + 0.4 * (u / FLY)), 0];
    const r = u - FLY;
    // (rocking on its brim: tipped back, over, back, less and less; turned round a little as it goes)
    const rock = r >= ROCK ? 0 : TIPPED_LAND * Math.exp(-r / 0.2) * Math.cos((Math.PI * r) / 0.15) * (1 - smooth(ROCK - 0.25, ROCK, r));
    return [A - rock, 26 * smooth(0, ROCK, r)];
  };
  const lowOf = (c: V3, fr: [V3, V3, V3]): number => helmLow(c, fr[0], fr[1], fr[2]) - c[2];
  const vel = mul(sub(s1.head, s0.head), 120);
  return {
    off,
    still: off + FLY + ROCK,
    at: (t) => {
      if (t < off) return null;
      const u = t - off;
      const [deg, spin] = turnOf(u);
      const fr = frameAt(deg, spin);
      // its middle: carried on from the head as it left it, out to where it comes down, up a little on the way; never in the floor
      const k = smooth(0, FLY, u);
      const carried = add(c0, mul(vel, Math.min(u, 0.04) * (1 - k)));
      const cx = carried[0] + (cLand[0] - carried[0]) * k;
      const cy = carried[1] + (cLand[1] - carried[1]) * k;
      const arc = c0[2] + 5 * Math.sin(Math.PI * Math.min(1, u / FLY));
      const rest = 0.3 - lowOf([cx, cy, 0], fr);
      const cz = u < FLY ? Math.max(rest, arc * (1 - k) + rest * k) : rest + (u - FLY < 0.06 ? 0.8 * Math.sin((Math.PI * (u - FLY)) / 0.06) : 0);
      const c: V3 = [cx, cy, cz];
      return { c, ff: fr[0], fl: fr[1], fu: fr[2], tip: HELM_TIPPED * (1 - smooth(0, 0.12, u)) };
    },
  };
})();

// THE PAVISE AFTER HIM: its prop giving (folding up against its back), it tips back about its feet, heavy,
// slow to start and faster and faster as a board falls, and slaps down flat on its back, the royal swan to the sky; a
// little bounce; a puff of dust from under it; still.
const PV = ((): { long: number; at: (u: number) => number } => {
  // (a board tipped `a` from upright about its foot: a'' = (3g / 2h) sin a, its height h and the game's fall, 400 a second each second)
  const GO = (3 * 400) / (2 * 2 * PAVISE.h);
  const dt = 1 / 1200;
  const th: number[] = [PLANTED_AT.lean * D];
  let w = 0;
  let a = th[0];
  while (a < Math.PI / 2) {
    w += GO * Math.sin(a) * dt;
    a = Math.min(Math.PI / 2, a + w * dt);
    th.push(a);
  }
  const long = (th.length - 1) * dt;
  return {
    long,
    at: (u) => {
      if (u <= 0) return th[0] / D;
      if (u >= long) return 90;
      const k = u / dt;
      const i = Math.floor(k);
      return ((th[i] + (th[i + 1] - th[i]) * (k - i)) * 180) / Math.PI;
    },
  };
})();
const SLAP = DT.tip + PV.long;
/** How far back from upright the pavise is (degrees) as he dies: leaning on its prop; tipping; flat; the bounce as it slaps down. */
function paviseTip(t: number): number {
  const u = t - SLAP;
  if (u > 0 && u < 0.1) return 90 - 2.6 * Math.sin((Math.PI * u) / 0.1);
  return PV.at(t - DT.tip);
}
const PIVOT: V3 = [PLANTED_AT.x, 0, 0.9];
/** How far its feet kick forward along the floor as it comes down. */
const PV_SLIDE = 5;
const P_HINGE = (pv: Pavise): V3 => add(pv.c, add(mul(pv.n, -PAVISE.thick - 0.45), mul(pv.up, PAVISE.h * 0.35)));
/** Where the prop's foot stands on the floor while it holds the pavise up (the look's own, art/keep_crossbowmen.ts). */
const PROP_FOOT: V3 = ((): V3 => {
  const h = P_HINGE(planted());
  return [h[0] - 13, h[1] + 1.5, 0.6];
})();
/** The pavise as it falls (`deg` back from upright), and its prop's foot: tipped about its feet; lifted onto its back's straps and its folded prop as it lies, never into the floor. */
function paviseFallen(deg: number, fold: number): { pv: Pavise; prop: V3 } {
  const P0 = planted();
  // (back, toward him: about its feet's line, its top going back)
  const by = PLANTED_AT.lean - deg;
  const Y: V3 = [0, 1, 0];
  // (its feet kicked forward along the floor as it comes down, as a falling board's are)
  const at = add(PIVOT, [PV_SLIDE * smooth(50, 90, deg), 0, 0]);
  const c = add(at, turnAbout(sub(P0.c, PIVOT), Y, by));
  const up = norm(turnAbout(P0.up, Y, by));
  const n = norm(turnAbout(P0.n, Y, by));
  const pv: Pavise = { c, n, up, across: norm(cross(up, n)) };
  // (its prop: from where it stood on the floor, folding up flat against its back)
  const hinge = P_HINGE(pv);
  const d0 = sub(PROP_FOOT, hinge);
  const d1 = mul(up, -PAVISE.h * 1.1);
  const L = Math.hypot(...d0) + (Math.hypot(...d1) - Math.hypot(...d0)) * fold;
  let prop = add(hinge, mul(norm(lerp3(norm(d0), norm(d1), fold), d1), L));
  // (the lowest of it: its back, its straps, its prop, its iron feet)
  const back = mul(n, -PAVISE.thick - 0.45);
  let low = pv.c[2] - PAVISE.thick * n[2] - PAVISE.w * Math.abs(pv.across[2]) - PAVISE.h * Math.abs(up[2]);
  for (const k of [-1, 1]) for (const b of [0.55, -0.15]) low = Math.min(low, add(pv.c, add(back, add(mul(pv.across, k * 3.2), mul(up, PAVISE.h * b))))[2] - 0.5);
  for (const k of [-1, 1]) low = Math.min(low, add(pv.c, add(mul(pv.across, k * (PAVISE.w - 1.0)), mul(up, -PAVISE.h - 0.2)))[2] - 0.6, add(pv.c, add(mul(pv.across, k * (PAVISE.w - 1.2)), mul(up, -PAVISE.h + 1.6)))[2] - 0.8);
  low = Math.min(low, hinge[2] - 0.6, fold > 0.99 ? prop[2] - 0.55 : Infinity);
  const lift = Math.max(0, 0.15 - low);
  if (lift > 0) {
    pv.c = add(pv.c, [0, 0, lift]);
    if (fold > 0.99) prop = add(prop, [0, 0, lift]);
  }
  return { pv, prop };
}
const propFold = (t: number): number => smooth(DT.prop, DT.prop + 0.16, t);
function paviseDying(t: number): { pv: Pavise; prop: V3 | null } {
  if (t < DT.prop) return { pv: planted(), prop: null };
  return paviseFallen(paviseTip(t), propFold(t));
}

/** Its times: the trigger, the crossbow flung, the prop, his helm knocked off and still, his back down, his heels down, the pavise flat, the Hush and the light out of him. */
/** Where the crossbow comes to lie, from where it was as it left his hand (`Mob.fall`'s `to`): back, and out to his right. */
const XBOW_LANDS: readonly [number, number] = [7, -11];
export const CB_DIES = {
  ...DT,
  helmOff: HELM.off,
  helmStill: HELM.still,
  slap: SLAP,
} as const;

/** THE LAST BOLT: loosed up into the air as the trigger jerks, a white streak climbing away out of his crossbow and gone (laid after his edge, on his own picture: nothing for the game to draw apart). The shot's own white heat (art/keep_crossbowmen_fx.ts BOLT_HOT), its wake pale air. */
export const LAST_BOLT = { speed: 760, reach: 72, tail: 26, wake: 0.2 } as const;
const LAST_BOLT_HOT = ['#fff4ea', '#ffd8c4', '#ff9a78'] as const;
const LAST_BOLT_WAKE = '#a49cae';
const LAST_BOLT_FROM = ((): { head: V3; way: V3 } => {
  const s = solve(B, { ...R0, ...deathPose(DT.fire) } as Posed);
  const cb = dyingBow(DT.fire - 1e-6, s);
  return { head: cb.head, way: cb.way };
})();
/** Where the last bolt's head is `t` seconds into his death (null before it is loosed, or once it is gone). */
export function lastBoltAt(t: number): V3 | null {
  const d = LAST_BOLT.speed * (t - DT.fire);
  if (d < 0 || d > LAST_BOLT.reach) return null;
  return add(LAST_BOLT_FROM.head, mul(LAST_BOLT_FROM.way, d));
}
function lastBolt(t: number): [V3, string, number][] {
  const u = t - DT.fire;
  if (u < 0 || u > LAST_BOLT.wake) return [];
  const { head, way } = LAST_BOLT_FROM;
  const d = LAST_BOLT.speed * u;
  const out: [V3, string, number][] = [];
  // (its wake: thin pale air along the way it went, thinning out)
  const thin = u / LAST_BOLT.wake;
  for (let x = 1; x <= Math.min(d, LAST_BOLT.reach); x += 1.1) if (hash(Math.round(x * 3), Math.floor(t * 30), 9431) > 0.35 + 0.65 * thin) out.push([add(head, mul(way, x)), LAST_BOLT_WAKE, 1]);
  // (the streak: white at its head, cooling behind it; gone up into the dark at its reach)
  const a = Math.max(0, d - LAST_BOLT.tail);
  const b = Math.min(d, LAST_BOLT.reach);
  for (let x = a; x <= b; x += 0.7) {
    const k = (d - x) / LAST_BOLT.tail;
    out.push([add(head, mul(way, x)), k < 0.25 ? LAST_BOLT_HOT[0] : k < 0.6 ? LAST_BOLT_HOT[1] : LAST_BOLT_HOT[2], k < 0.5 ? 2 : 1]);
  }
  return out;
}
/** The dust that puffs out from under the pavise as it slaps down flat. */
function slapDust(t: number): [V3, string, number][] {
  const u = t - SLAP;
  if (u < 0 || u > 0.45) return [];
  const k = u / 0.45;
  const { pv } = paviseFallen(90, 1);
  const out: [V3, string, number][] = [];
  for (let i = 0; i < 64; i++) {
    const own = hash(i, 5, 9441);
    if (own < k * 0.95) continue;
    // (round its edges: along each side, and off its top)
    const e = hash(i, 6, 9441);
    const side = i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : -1;
    const at = side === 0 ? add(pv.c, add(mul(pv.up, PAVISE.h), mul(pv.across, (e - 0.5) * 2 * (PAVISE.w - PAVISE.chamfer)))) : add(pv.c, add(mul(pv.across, side * PAVISE.w), mul(pv.up, (e - 0.5) * 2 * PAVISE.h)));
    const outward = side === 0 ? pv.up : mul(pv.across, side);
    const r = (1.5 + 11 * Math.sqrt(k)) * (0.5 + 0.6 * hash(i, 7, 9441));
    const z = 0.5 + (0.8 + 5 * hash(i, 8, 9441)) * Math.sin(Math.PI * Math.min(1, k * 1.3));
    const p = add(at, mul(outward, r));
    out.push([[p[0], p[1], z], k < 0.35 ? '#b0aca2' : own > 0.6 ? '#8a867e' : '#66625a', own > 0.55 && k < 0.6 ? 2 : 1]);
  }
  return out;
}
const dieJaw = (t: number): number => (t < 0.03 ? 0.4 : t < DT.breath[0] ? 0.75 : t < DT.breath[1] ? 1 : 1 - 0.6 * Math.min(1, (t - DT.breath[1]) / 0.4));

// =============================================================================================
// THEM, AS THE GAME HOLDS A MONSTER

export const CB_NAMES = {
  stand: 'The crossbowman stands behind his pavise',
  walk: 'The crossbowman jogs to his spot',
  attack: 'The aimed shot',
  plant: 'The pavise planted',
  reload: 'The reload',
  reel: 'The crossbowman is struck',
  dying: 'Thrown back over, the Hush leaves him',
} as const;
const STAND_REST: Bones = { ...R0 } as Bones;
const MADE: Record<string, Made> = {
  stand: make(standPlan(), STAND_REST),
  attack: make(shotPlan(), STAND_REST),
  plant: make(plantPlan(), STAND_REST),
  reload: make(reloadPlan(), STAND_REST),
  reel: make(reelPlan(), STAND_REST),
};
const byName: Record<string, string> = Object.fromEntries(Object.entries(CB_NAMES).map(([k, v]) => [v, k]));
/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const CB_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: CB_SHOT.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands. */
export function smearedAt(move: string, t: number): boolean {
  const s = CB_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}

/** THE CROSSBOW at a moment of a move (by its name as the review knows it), from its bones (`s`, `q`). */
export function bowAtMove(move: string, t: number, s: Skeleton, q: Posed): Crossbow {
  if (move === 'walk') return jogBow(s, q);
  if (move === 'dying') return dyingBow(Math.max(0, t), s);
  const made = MADE[move];
  return bowOf(made, Math.max(0, t), move === 'stand');
}
/** THE PAVISE at a moment of a move. */
export function paviseAtMove(move: string, t: number, s: Skeleton): Pavise {
  if (move === 'walk') return onBack(s);
  if (move === 'plant') return paviseOfMade(MADE.plant, t);
  if (move === 'dying') return paviseDying(t).pv;
  return planted();
}
/** Whether a bolt lies in the groove at a moment of a move. */
export function loadedAt(move: string, t: number): boolean {
  if (move === 'attack') return t <= CB_SHOT.strike[0] + 1e-6;
  if (move === 'reload') return t >= CB_RELOAD.laid - 1e-6;
  if (move === 'dying') return t < CB_DIES.fire;
  return true;
}
/** How hard the Hush comes out of them: breathing; held in as they aim; bursting out after the shot. */
function puffAt(move: string, t: number): number {
  if (move === 'attack') {
    if (t < CB_SHOT.raise[1]) return 1.0 - 0.6 * smooth(0.3, CB_SHOT.raise[1], t);
    if (t < CB_SHOT.hit) return 0.4;
    return 0.4 + 1.0 * smooth(CB_SHOT.hit, CB_SHOT.hit + 0.08, t) - 0.6 * smooth(1.6, CB_SHOT.long, t);
  }
  // (as he dies: coughed out of him by the blow; breathed out of him as he lies, while it leaves him in one great breath, art/hushed.ts hushLeaves)
  if (move === 'dying') return t < 0.4 ? 1.8 : Math.max(0, 1.6 * (1 - smooth(1.0, 1.5, t)));
  if (move === 'walk') return 1.2;
  if (move === 'reload') return 1.1;
  return 0.8;
}
/** THE SMEAR: after-images of the crossbow along its kick, and the bolt's streak leaving the muzzle (the rest of it is the fx's). */
const SMEAR = ['#8a8480', '#cbbcb2', '#fff0e6'];
export const CB_SMEAR = SMEAR;
/** How far out of the muzzle the bolt's streak is painted on their own picture (the fx paints the whole line). */
export const STREAK_NEAR = 1.4 * TILE3;
function smearOf(t: number): [V3, string, number][] {
  if (!smearedAt('attack', t)) return [];
  const [s0, s1] = CB_SHOT.strike;
  const to = Math.min(t, s1);
  const out: [V3, string, number][] = [];
  const made = MADE.attack;
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const u = s0 + ((to - s0) * i) / n;
    const cb = bowOf(made, u, false);
    const k = i / n;
    const col = k > 0.7 ? SMEAR[2] : k > 0.35 ? SMEAR[1] : SMEAR[0];
    // (the stock and the prod's arms where they have just been)
    for (const [a, b] of [[cb.butt, cb.nose], [cb.prodC, cb.tips[0]], [cb.prodC, cb.tips[1]]] as const) {
      const steps = 10;
      for (let j = 0; j <= steps; j++) if ((j + i) % 2 === 0 || k > 0.6) out.push([lerp3(a, b, j / steps), col, 1]);
    }
  }
  // (the bolt's streak out of the muzzle, white at its middle; thinning once it has landed)
  const cb0 = bowOf(made, s0, false);
  const from = cb0.head;
  const way = cb0.way;
  const reach = t >= s1 - 1e-6 ? STREAK_NEAR : STREAK_NEAR * clamp01((t - s0) / (s1 - s0)) * 1.6;
  const after = t > s1 + 1e-6;
  for (let d = 0; d <= Math.min(STREAK_NEAR, reach); d += 0.8) {
    const p = add(from, mul(way, d));
    if (after && hash(Math.round(d * 2), 3, 9401) < 0.5) continue;
    out.push([p, d > STREAK_NEAR - 6 ? SMEAR[1] : SMEAR[2], after ? 1 : 2]);
    if (!after) out.push([add(p, [0, 0, 1.2]), SMEAR[1], 1]);
  }
  return out;
}
/** The dust and the grit that fly where the pavise's foot is driven into the floor. */
function slamDust(t: number): [V3, string, number][] {
  const S = CB_PLANT.slam;
  if (t < S - 1e-6 || t > S + 0.4) return [];
  const k = (t - S) / 0.4;
  const pv = planted();
  const foot = add(pv.c, mul(pv.up, -PAVISE.h));
  const out: [V3, string, number][] = [];
  for (let i = 0; i < 36; i++) {
    const own = hash(i, 5, 9411);
    if (own < k * 0.9) continue;
    const a = (i / 36) * Math.PI * 2;
    const r = (3 + 22 * Math.sqrt(k)) * (0.6 + 0.5 * hash(i, 6, 9411));
    const z = 0.5 + (1 + 6 * hash(i, 7, 9411)) * Math.sin(Math.PI * Math.min(1, k * 1.5));
    out.push([[foot[0] + Math.cos(a) * r * 0.7, foot[1] + Math.sin(a) * r, z], k < 0.3 ? '#9a968e' : own > 0.6 ? '#7a766e' : '#5c5852', own > 0.7 && k < 0.5 ? 2 : 1]);
  }
  return out;
}
/** The click and the grit of the crank: no grains; the string drawn back is the bones' `draw`. */
const SAY: CrossbowSay = {
  pavise: (m) => paviseAtMove(byName[m.move ?? ''] ?? 'stand', m.t, m.s),
  bow: (m) => bowAtMove(byName[m.move ?? ''] ?? 'stand', m.t, m.s, m.q),
  dropped: (m) => !!m.dying && m.t >= CB_DIES.drop,
  loaded: (m) => loadedAt(byName[m.move ?? ''] ?? 'stand', m.t),
  inHand: (m) => ((byName[m.move ?? ''] ?? '') === 'reload' ? boltInHand(m.t, m.s, bowAtMove('reload', m.t, m.s, m.q)) : null),
  puff: (m) => puffAt(byName[m.move ?? ''] ?? 'stand', m.t),
  more: (m) => {
    const move = byName[m.move ?? ''] ?? '';
    if (move === 'attack') return smearOf(m.t);
    if (move === 'plant') return slamDust(m.t);
    if (move === 'dying') return [...lastBolt(m.t), ...slapDust(m.t)];
    return [];
  },
  standing: (m) => (byName[m.move ?? ''] ?? '') !== 'walk' && !((byName[m.move ?? ''] ?? '') === 'plant' && m.t < CB_PLANT.slam),
  strap: (m) => (byName[m.move ?? ''] ?? '') === 'walk' || ((byName[m.move ?? ''] ?? '') === 'plant' && m.t < CB_PLANT.grab),
  helm: (m) => ((byName[m.move ?? ''] ?? '') === 'dying' ? HELM.at(m.t) : null),
  propEnd: (m) => ((byName[m.move ?? ''] ?? '') === 'dying' ? paviseDying(m.t).prop : null),
  exhale: CB_DIES.breath,
};

function crossbowMob(): Mob {
  const paint = crossbowPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: STAND_REST, ...more });
  return {
    id: 'keep-crossbowman',
    name: 'A crossbowman of the keep',
    size: "small: the knight's height",
    build: B,
    stand: mv(CB_NAMES.stand, MADE.stand.motion, { jaw: cbJaw }),
    attack: mv(CB_NAMES.attack, MADE.attack.motion, { jaw: (t) => (t < CB_SHOT.raise[1] ? 0.4 : t < CB_SHOT.hit ? 0.12 : t < 1.7 ? 0.9 : 0.5), glint: (t) => (t >= CB_SHOT.line[0] && t <= CB_SHOT.hit ? 1 : 0) }),
    more: {
      plant: mv(CB_NAMES.plant, MADE.plant.motion, { feet: plantFeet(), jaw: () => 0.6 }),
      reload: mv(CB_NAMES.reload, MADE.reload.motion, { jaw: (t) => 0.4 + 0.3 * Math.max(0, Math.sin(t * 18)) }),
    },
    idleFrames: 24,
    idleFps: 10,
    walk: mv(CB_NAMES.walk, jog(), { period: CB_RUN.frames / CB_RUN.fps, ground: CB_PACE * TILE3, jaw: runJaw }),
    walkFrames: CB_RUN.frames,
    walkFps: CB_RUN.fps,
    pace: CB_PACE,
    reel: mv(CB_NAMES.reel, MADE.reel.motion, { jaw: (t) => (t < 0.25 ? 1 : 0.45) }),
    reelTime: CB_REEL,
    hit: CB_SHOT.hit,
    warn: CB_SHOT.warn[1] - CB_SHOT.warn[0],
    dieTime: CB_DIES.long,
    dying: mv(CB_NAMES.dying, diesMotion(), { feet: deathPose, jaw: dieJaw }),
    aura: { x: CB_CANVAS.ax, y: CB_CANVAS.ay - 40, r: 34, color: '#8c90ac', a: 0.06 },
    shadow: 11,
    canvas: CB_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the crossbow flung from his hand as he goes over: it clatters down on the floor beside him, to his right)
    fall(piece) {
      if (piece === 'xbow') return { from: CB_DIES.drop, to: XBOW_LANDS, spin: 30, lay: 'axis', hop: 1.6 };
      return null;
    },
  };
}
export const CROSSBOWMAN = crossbowMob();
export function makeCrossbowArt3(mob: Mob = CROSSBOWMAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function crossbowSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.16 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.6]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.6]), r: 1.9 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.3 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.28 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.3 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.05, B.headR[1] * 1.1, B.headR[2]] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.2, B.ribHalf + 2.2, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.0, B.waistHalf + 2.0, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.6, B.pelvisHalf + 2.7, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/** The crossbow's line and its prod as points, for the checks. */
function bowThings(cb: Crossbow, held: string[]): CheckThing[] {
  const line = (a: V3, b: V3, n: number): V3[] => Array.from({ length: n + 1 }, (_, i) => lerp3(a, b, i / n));
  return [
    { name: 'crossbow stock', pts: line(cb.butt, cb.nose, 8), r: 1.5, may: held },
    { name: 'crossbow prod', pts: [...line(cb.prodC, cb.tips[0], 4), ...line(cb.prodC, cb.tips[1], 4)], r: 1.0, may: held },
    { name: 'crossbow crank', pts: [cb.drum, cb.axle, cb.knob, cb.handle], r: 0.8, may: held },
  ];
}
/** Which of their parts hold the crossbow (or rest it), at a moment of a move. */
function holding(move: string, t: number): string[] {
  const both = ['foreR', 'foreL'];
  if (move === 'stand' || move === 'reel') return ['foreR', 'upperR'];
  if (move === 'attack') return t > CB_SHOT.raise[0] && t < 1.75 ? [...both, 'upperR'] : t < 0.2 ? ['foreR', 'upperR', 'foreL'] : both;
  if (move === 'plant') return t > 0.55 ? ['foreR', 'upperR'] : ['foreR'];
  if (move === 'reload') return t > 1.8 ? ['foreR', 'upperR', 'foreL'] : both;
  if (move === 'dying') return ['foreR', 'upperR', 'foreL'];
  return ['foreR'];
}
const ALL_MOVES = ['stand', 'walk', 'attack', 'reel', 'dying', 'plant', 'reload'];
export const CB_SHAPE: BossShape = {
  body: crossbowSolids,
  // (what strikes: the bolt; in the groove till the strike, flashing down the line in it, at the line's end once landed)
  tip: (move, t, s, q) => {
    if (move !== 'attack') return null;
    const [s0, s1] = CB_SHOT.strike;
    if (t <= s0 + 1e-6) return bowAtMove('attack', t, s, q).head;
    const from = bowAtMove('attack', s0, s, q).head;
    return lerp3(from, boltLands(), clamp01((t - s0) / (s1 - s0)));
  },
  things: (move, t, s, q) => {
    const out: CheckThing[] = [];
    if (!(move === 'dying' && t >= CB_DIES.drop)) out.push(...bowThings(bowAtMove(move, t, s, q), holding(move, t)));
    const pv = paviseAtMove(move, t, s);
    out.push({ name: 'pavise', pts: paviseOutline(pv), r: 1.0, may: move === 'plant' && t > CB_PLANT.grab - 0.02 && t < 0.62 ? ['foreL'] : [] });
    return out;
  },
  strikes: CB_STRIKES,
  smeared: smearedAt,
  handovers: [
    // his stand into each move and back, as the game plays them: the shot always followed by the reload
    { from: 'stand', at: 0, to: 'attack', toAt: 0 },
    { from: 'attack', at: 'end', to: 'reload', toAt: 0 },
    { from: 'reload', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'reel', toAt: 0 },
    { from: 'reel', at: 'end', to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    { from: 'reel', at: 0, to: 'dying', toAt: 0 },
    { from: 'reel', at: 'end', to: 'dying', toAt: 0 },
    // his jog, from wherever in it the game stops him, into the plant; the plant into his stand
    ...Array.from({ length: CB_RUN.frames + 1 }, (_, i): Handover => ({ from: 'walk', at: i / CB_RUN.fps, to: 'plant', toAt: 0 })),
    { from: 'plant', at: 'end', to: 'stand', toAt: 0 },
  ],
};
void ALL_MOVES;
