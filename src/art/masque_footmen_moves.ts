// FLOOR 17'S FOOTMEN: THEIR MOVES (the art chat, 29 Oct 2026). A MOCK-UP: NOT IN THE GAME, behind FOOTMEN_ON
// (art/masque_footmen.ts, off). Their look and his brief are art/masque_footmen.ts; what the tray and the candles do once
// they leave him, art/masque_footmen_fx.ts.
//
// His pick for how they move: “Brisk and stiff (Recommended)”. And his rules for every enemy from the Princess on: his
// Movement 9 (24 Oct, “Like the wind up and wind down are big but the actual punch is lightning quick”; for the enemies, 28
// Oct, “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the
// extra time the player gets to evade”), and his speed (28 Oct, “It’s all too slow and too narrow and too small.  I could
// dodge anything you’ve put in these moves with my eyes closed”): every blow winds up big and is held (the warning),
// strikes in two frames smeared with its after-images, and winds down big; and they move fast from the first.
//
// THEIR MOVES:
//   STANDING: upright and stiff, chin up, heels together and toes out; the tray level on the flat of his left hand beside
//     his head, the candelabrum held before him in his right, its candles burning; breathing, the weight shifting, the head
//     turning slowly as he looks the room over, the tray hand settling it now and then.
//   THE MARCH (his pick, “Brisk and stiff (Recommended)”): upright, stiff-legged, quick short steps, heel first; the tray
//     steady beside his head, the candelabrum steady before him, its flames blown back; FM_PACE tiles a second, faster than
//     the knight walks.
//   THE TRAY FLUNG (his first blow): the tray taken off the palm by its rim and swung down across him to his right hip, his
//     whole body coiled round after it, knees bent (THE WARNING, held, a pink glint running round the rim); hips first; then
//     in two frames he uncoils and flings it backhand, spinning flat like a disc, his arm whipped out before him to his
//     left; the tray flies FM_TRAY's reach out, swings round and comes back on the other side of its loop
//     (art/masque_footmen_fx.ts), and he catches it, and has it up on his palm again.
//   THE CANDELABRUM (his second blow, the bigger): the tray lowered to hang at his side by its rim; the candelabrum raised
//     high over his right shoulder and back, his back arched, the flames streaming (THE WARNING, held, a pink glint on the
//     gilt); hips first; then in two frames it comes over his head and down before him to his left, smeared, the flames a
//     streak of fire; it lands and they splash out across the floor before him in a wide fan of fire
//     (art/masque_footmen_fx.ts); bent over it, he holds; then straightens, and the tray goes back up.
//   STRUCK: jolted back, the head snapped back, the tray tipping on his palm, the flames blown about.
//   HIS DEATH (made new on his pick of 30 Oct, “Yes, these (Recommended)”, so that Act 2's enemies die differently): struck
//     dead he goes rigid, upright, his arms snapping to his sides, a last stiff shiver; the tray flies from his hand, the
//     candelabrum drops and its candles go out; then he goes over backwards in one piece like a plank, hinged at his heels,
//     and comes down flat on his back with a little bounce; the tray comes down on its rim and rolls round and round on it,
//     rattling flatter until it lies still; the Hush leaves him in a grey breath rising out of him; he lies still, a man
//     again, alive.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind, and
// the lightning strikes as his Movement 9 asks.
//   test: tsx --test tests/masque_footmen.test.ts

import type { ActorArt } from './actor_types';
import type { BossShape, CheckLimb, CheckLump, CheckThing, Handover } from './boss_checks';
import { footOn, footwork, plantBy, plantOf } from './bosses3';
import { hash } from './kit';
import { FLAME } from './mkit';
import { CANDELABRUM, FOOTMAN_BODY, FOOTMAN_CANVAS, TRAY, candelabrumOf, footmanPainter, trayOf } from './masque_footmen';
import type { FootmanSay } from './masque_footmen';
import { TRAY_FX, trayLoop } from './masque_footmen_fx';
import { TILE3, mobSet, skeletonAt } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, cross, dot, elbowFor, heading, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = FOOTMAN_BODY;
const FPS = 30;
const FR = 1 / FPS;
const D = 180 / Math.PI;
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, t: number): number => {
  const u = clamp01((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const fr = (t: number): number => t - Math.floor(t);

// =============================================================================================
// WHAT HE HOLDS, AS THE BONES HAVE IT

/** The candelabrum in his right hand at `hand` (from his place on the floor), its stem pointing `way` (from its foot to its candles), its branches spread along `across`. */
export function candleGrip(hand: V3, way: V3, across: V3): P {
  const w = norm(way);
  const wAz = Math.atan2(w[1], w[0]) * D;
  const wEl = Math.asin(Math.max(-1, Math.min(1, w[2]))) * D;
  let flat: V3 = sub([0, 0, 1], mul(w, w[2]));
  if (Math.hypot(...flat) < 1e-3) flat = [-1, 0, 0];
  flat = norm(flat);
  const ac = norm(sub(across, mul(w, dot(across, w))), flat);
  const wRoll = Math.atan2(dot(cross(flat, ac), w), dot(flat, ac)) * D;
  return { rhIn: 2, rhx: hand[0], rhy: hand[1], rhz: hand[2], wAz, wEl, wRoll };
}
/** The tray's face turned this way (its `pAz`, `pEl`), sitting on his hand so (`pt`: 0 on the flat of the palm, 1 gripped by its rim). */
const trayIs = (pAz: number, pEl: number, pt: number): P => ({ pAz, pEl, pt });

// =============================================================================================
// HIS REST: upright, stiff, chin up; heels together, toes out; the tray high on his left palm, the candelabrum before him

const CARRY_HAND: V3 = [5.5, -12.4, 30.5];
const CARRY_WAY = heading(-10, 84);
const REST0: Bones = {
  ...standing(B),
  pz: -0.6, pitch: -1, bend: -3, roll: 0, side: 0, faceUp: 6, faceTilt: 0, faceTurn: 0,
  lfx: 0.6, lfy: 0.9, lft: 20, lk: 10, rfx: 0.6, rfy: -0.9, rft: -20, rk: -10,
  lhIn: 1, lhx: 3.0, lhy: 7.0, lhz: 3.5, le: 0,
  ...candleGrip(CARRY_HAND, CARRY_WAY, [0, 1, 0]),
  pAz: 0, pEl: 90, pt: 0, out: 0, draw: 0,
} as Bones;
const LE0 = elbowFor(B, REST0 as Posed, true, norm([-0.15, 0.45, -1]));
const RE0 = elbowFor(B, { ...REST0, le: LE0 } as Posed, false, norm([-0.7, -0.3, -1]));
export const FOOTMAN_REST: Bones = { ...REST0, le: LE0, re: RE0 };
const R = FOOTMAN_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);

/** A key pose: the body as `body` says, the left hand at `L` and the right at `Rh` (each from his place on the floor: the left measured from its own shoulder as the body then has it), the elbows toward `wantL` and `wantR`. */
function key(body: P, L: V3 | null, Rh: P | null, wantL: V3 | null, wantR: V3 | null): P {
  const q0 = { ...R, ...body, ...(Rh ?? {}) } as Posed;
  const s = solve(B, q0);
  const lh: P = L ? { lhIn: 1, lhx: L[0] - s.shoulderL[0], lhy: L[1] - s.shoulderL[1], lhz: L[2] - s.shoulderL[2] } : {};
  const q = { ...q0, ...lh } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...body, ...(Rh ?? {}), ...lh, le, re };
}

// =============================================================================================
// A MOVE THROUGH KEY POSES (as the Princess's: every field through its keys smoothly, its speed carried through each key,
// not stopped at it; straight through a lightning strike; sampled on every frame the game shows)

/** A value through keys [time, value], smooth through each (a monotone cubic, as the Princess's steed's `track`, art/princess_ride.ts: it does not overshoot, and stops only where it turns back or holds). */
function track(keys: ReadonlyArray<readonly [number, number]>): (t: number) => number {
  const n = keys.length;
  const ts = keys.map((k) => k[0]);
  const vs = keys.map((k) => k[1]);
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
interface Plan {
  long: number;
  keys: ReadonlyArray<readonly [number, P]>;
  /** The strike: from the last frame of its wind-up to the frame it lands on (and a key in its middle, if it goes round an arc). */
  strike?: readonly [number, number];
  hit?: number;
}
function poseFn(plan: Plan): (t: number) => P {
  const full = plan.keys.map(([t, p]) => [t, { ...R, ...p } as Record<string, number>] as const);
  const fields = Object.keys(full[0][1]).filter((k) => k !== 'lhIn' && k !== 'rhIn' && typeof full[0][1][k] === 'number');
  const tracks = new Map(fields.map((k) => [k, track(full.map(([t, p]) => [t, p[k]] as const))]));
  const st = plan.strike;
  // (inside the strike: straight from key to key, through any key in it)
  const inStrike = st ? full.filter(([kt]) => kt >= st[0] - 1e-6 && kt <= st[1] + 1e-6) : [];
  return (t) => {
    const out: Record<string, number> = { lhIn: full[0][1].lhIn, rhIn: full[0][1].rhIn };
    if (st && inStrike.length >= 2 && t > st[0] && t < st[1]) {
      let i = 0;
      while (i < inStrike.length - 2 && t > inStrike[i + 1][0]) i++;
      const [ta, a] = inStrike[i];
      const [tb, b] = inStrike[i + 1];
      const k = (t - ta) / (tb - ta);
      for (const f of fields) out[f] = a[f] + (b[f] - a[f]) * k;
    } else for (const f of fields) out[f] = (tracks.get(f) as (t: number) => number)(t);
    return out as P;
  };
}
function motionOf(plan: Plan): Motion {
  const f = poseFn(plan);
  const keys: Key3[] = [];
  const n = Math.round(plan.long * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: f(i / FPS), ease: 'lin' });
  return plan.hit !== undefined ? { keys, hit: plan.hit } : { keys };
}

// =============================================================================================
// STANDING

export const FM_STAND_LONG = 3.0;
function standMotion(): Motion {
  const T = FM_STAND_LONG;
  const keys: Key3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    // (now and then he settles the tray: a small lift and down, once a round)
    const settle = Math.max(0, Math.sin(a - 2.2)) ** 3;
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.7 * breath,
        py: 1.3 * Math.sin(a),
        roll: R.roll + 1.4 * Math.sin(a),
        bend: R.bend - 1.6 * breath,
        pitch: R.pitch + 0.6 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 2 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 2 * Math.sin(a + 2.0),
        faceTurn: R.faceTurn + 16 * Math.sin(a),
        lhz: R.lhz + 0.4 * breath + 1.1 * settle,
        lhx: R.lhx + 0.3 * Math.sin(a),
        rhz: R.rhz + 0.5 * breath,
        rhy: R.rhy + 1.0 * Math.sin(a),
        pEl: 90 - 3 * settle,
      },
    });
  }
  return { loop: 0, keys };
}
const standJaw = (t: number): number => {
  const u = fr(t / FM_STAND_LONG);
  return 0.3 + 0.45 * Math.max(0, Math.sin(u * Math.PI * 6)) * (u < 0.7 ? 1 : 0.3);
};

// =============================================================================================
// THE MARCH (his pick, “Brisk and stiff (Recommended)”)

/** His pace marching, tiles a second (the knight walks 2.5): brisk, faster than you walk. */
export const FM_PACE = 2.8;
/** The march's frames: twelve at twenty-six a second, a quick stiff step every 0.23 s (a step no longer than his stand can hand over from). */
export const FM_MARCH = { frames: 12, fps: 26 } as const;
/**
 * A FOOT OF THE MARCH, `u` of the way round (0 as its heel strikes): down for the first half, carried back under him at his
 * pace (struck on its heel, its toes up; rolled down flat; up onto its toe as it leaves), each end of it on its spot of the
 * floor while it is down; then swung through, stiff, and put down heel first. The bones' fields for that foot.
 */
function marchFoot(side: 'L' | 'R', u: number, step: number, turn: number): P {
  const half = 0.5;
  const y = (side === 'L' ? 1 : -1) * (B.stance + 0.5);
  /** The foot's ankle along the floor as it lies flat, `v` of the way through its time down (from ahead of him to behind). */
  const flatAt = (v: number): number => step * (0.5 - v);
  const HEEL = MARCH_FOOT.heel;
  const TOE = MARCH_FOOT.toe;
  const down = (v: number): P => {
    const A = flatAt(v);
    if (v < 0.2) return footOn(B, side, { at: [A - B.heel, y], turn, pitch: HEEL * (1 - smooth(0, 0.2, v)), on: 'heel' });
    if (v < 0.62) return footOn(B, side, { at: [A + B.ball, y], turn, pitch: 0, on: 'toe' });
    return footOn(B, side, { at: [A + B.ball, y], turn, pitch: TOE * smooth(0.62, 1, v), on: 'toe' });
  };
  if (u <= half) return down(u / half);
  // (swung through: from where its toe left the floor to where its heel will strike, lifted, the knee a little bent)
  const k = (u - half) / half;
  const a = down(1);
  const b = down(0);
  const g = smooth(0, 1, k);
  const L = side === 'L';
  const f = (n: string): number => ((a[n as keyof P] as number) ?? 0) + (((b[n as keyof P] as number) ?? 0) - ((a[n as keyof P] as number) ?? 0)) * g;
  const lift = 3.4 * Math.sin(Math.PI * k);
  return L ? { lfx: f('lfx'), lfy: f('lfy'), lfz: f('lfz') + lift, lfp: f('lfp'), lft: f('lft') } : { rfx: f('rfx'), rfy: f('rfy'), rfz: f('rfz') + lift, rfp: f('rfp'), rft: f('rft') };
}
/** How far a foot of the march is tipped: back on its heel as it strikes (toes up), up on its toe as it leaves. */
const MARCH_FOOT = { heel: -10, toe: 18 } as const;
/** How low the hips must come for both feet to reach where they are put (legs as near straight as they go: stiff), and no higher than `most`. */
function hipsFor(pose: P, most: number): number {
  const reachOk = (pz: number): boolean => {
    const s = solve(B, { ...R, ...pose, pz } as Posed);
    for (const sd of ['L', 'R'] as const) {
      const hip = sd === 'L' ? s.hipL : s.hipR;
      const fx = (sd === 'L' ? pose.lfx : pose.rfx) as number;
      const fy = ((sd === 'L' ? pose.lfy : pose.rfy) as number) + (sd === 'L' ? 1 : -1) * B.stance;
      const fz = (sd === 'L' ? pose.lfz : pose.rfz) as number;
      const want: V3 = [fx, fy, B.ankle + fz];
      if (Math.hypot(hip[0] - want[0], hip[1] - want[1], hip[2] - want[2]) > B.thigh + B.shank - 0.35) return false;
    }
    return true;
  };
  if (reachOk(most)) return most;
  let lo = most - 12;
  let hi = most;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (reachOk(m)) lo = m;
    else hi = m;
  }
  return lo;
}
function marchMotion(): Motion {
  const n = FM_MARCH.frames;
  const T = n / FM_MARCH.fps;
  // (a step of his: as far as his pace carries him in half a round)
  const step = FM_PACE * TILE3 * (T / 2);
  const keys: Key3[] = [];
  const raw: P[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    // (from a moment with his left foot under him, mid-step: so the march starts, and stops, with his feet near together)
    const u = j / n;
    const uL = fr(u + 0.25);
    const uR = fr(u + 0.75);
    const a = u * Math.PI * 2;
    const body: P = {
      py: 0.6 * Math.sin(a + Math.PI / 2), roll: R.roll + 1.0 * Math.sin(a + Math.PI / 2), yaw: 2.5 * Math.cos(a + Math.PI / 2), twist: -2 * Math.cos(a + Math.PI / 2), side: R.side + 0.4 * Math.sin(a + Math.PI / 2),
      bend: R.bend + 0.4, pitch: R.pitch + 1.5, faceUp: R.faceUp, faceTilt: R.faceTilt, faceTurn: R.faceTurn,
      ...marchFoot('L', uL, step, 6),
      ...marchFoot('R', uR, step, -6),
      lk: 4, rk: -4,
    };
    raw.push(body);
  }
  // (the hips as high as straight legs let them be, smoothed a little round the loop)
  const most = R.pz - 0.2;
  const hz = raw.map((b) => hipsFor(b, most));
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const pz = Math.min(hz[j], (hz[(j + n - 1) % n] + 2 * hz[j] + hz[(j + 1) % n]) / 4);
    const up = pz - R.pz;
    keys.push({
      at: i / FM_MARCH.fps,
      ease: 'lin',
      pose: {
        ...raw[j],
        pz,
        lhx: R.lhx + 0.3, lhz: R.lhz + 0.2 * up,
        rhx: CARRY_HAND[0] + 0.4, rhz: CARRY_HAND[2] + up * 0.95, rhy: CARRY_HAND[1] + 0.4 * Math.sin((j / n) * Math.PI * 2),
      },
    });
  }
  return { keys, loop: 0 };
}
const marchJaw = (t: number): number => 0.35 + 0.25 * Math.max(0, Math.sin((t / (FM_MARCH.frames / FM_MARCH.fps)) * Math.PI * 2));

// =============================================================================================
// THE TRAY FLUNG (his first blow)

/** Its times: how long; the warning, held; the strike (two frames, landing as it leaves his hand); when he catches it again. */
export const FM_THROW = { long: 2.3, warn: [0.44, 0.74] as const, strike: [24 / FPS, 26 / FPS] as const, hit: 26 / FPS, catch: 1.84 } as const;
/** The way his right hand holds the candelabrum out of the tray's way as he coils: before him and out to his right. */
const CANDLE_OUT = (x: number, y: number, z: number, tilt = 0): P => candleGrip([x, y, z], heading(-20, 84 - tilt), [0.2, 1, 0]);
function throwPlan(): Plan {
  const [w0, w1] = FM_THROW.warn;
  const [s0, s1] = FM_THROW.strike;
  // lifted off his shoulder, forward, still flat on his palm
  const LIFT = key({ yaw: -2, twist: -2, bend: 0, pitch: 0, pz: -0.8, faceUp: 6, faceTurn: 0, ...trayIs(0, 88, 0) }, [9, 14, 53], null, [-0.3, 0.6, -0.8], null);
  // taken by its rim, brought down before him
  const TAKE = key({ yaw: -8, twist: -8, bend: 3, pitch: 1, pz: -1.4, faceUp: 4, faceTurn: 4, ...trayIs(-20, 86, 1) }, [13, 5, 44], CANDLE_OUT(9, -18, 44, 4), [0.3, -0.5, -0.8], [0, -1, -0.3]);
  // COILED: swung across him and back past his right hip, his whole body wound round after it, crouched, his weight back on
  // his right foot, his eyes on you over his left shoulder; the candelabrum thrown out before him to balance it
  const COIL = key({ yaw: -34, twist: -30, bend: 12, pitch: 6, side: 3, pz: -4.6, faceUp: 2, faceTurn: 6, faceTilt: -6, ...trayIs(-60, 80, 1) }, [-5, -14, 43], CANDLE_OUT(9, -19, 47, 4), [0.2, -0.6, 0.7], [0, -1, -0.3]);
  // (on its way round: swung out wide before him, clear of him, the candelabrum already lifted out of its way)
  const ROUND = key({ yaw: -20, twist: -18, bend: 7, pitch: 3, side: 1, pz: -3.0, faceUp: 3, faceTurn: 5, faceTilt: -3, ...trayIs(-40, 82, 1) }, [8, -8, 40], CANDLE_OUT(9, -19, 47, 4), [0.4, -0.9, -0.3], [0, -1, -0.3]);
  const shake = (k: number): P => ({ ...COIL, lhx: (COIL.lhx as number) + (k % 2 ? 0.35 : -0.2), lhz: (COIL.lhz as number) + (k % 2 ? -0.25 : 0.2), pz: (COIL.pz as number) - 0.15 * (k % 2) });
  // hips first: the hips come round, the chest and the tray still held back
  const HIPS = { ...COIL, yaw: -16, twist: -48, pz: -4.2 };
  // FLUNG: in two frames uncoiled, his arm whipped out before him to his left, the tray leaving his fingers
  const FLUNG = key({ yaw: 20, twist: 18, bend: 7, pitch: 5, side: -2, pz: -3.4, faceUp: 4, faceTurn: -4, faceTilt: 2, ...trayIs(20, 84, 1) }, [14, 10, 45], CANDLE_OUT(8, -19, 44, 6), [-0.6, 0.5, -0.6], [-0.3, -1, 0.1]);
  // (half way through the strike: the tray swung out wide before him, clear of him)
  const MID = key({ yaw: 2, twist: -14, bend: 10, pitch: 6, side: 0, pz: -4.0, faceUp: 3, faceTurn: 2, faceTilt: -2, ...trayIs(-20, 82, 1) }, [13, -4, 43], CANDLE_OUT(8.5, -19, 45, 5), [0.5, -0.4, -0.6], [-0.3, -1, 0.1]);
  // carried on round, the arm out after it
  const ON = key({ yaw: 22, twist: 18, bend: 6, pitch: 4, side: -2, pz: -3.0, faceUp: 4, faceTurn: -8, faceTilt: 2, ...trayIs(30, 84, 1) }, [15, 17, 47], CANDLE_OUT(7, -18, 41, 4), [-0.7, 0.4, -0.6], [-0.3, -0.9, -0.4]);
  // watching it go, the hand drawn back before him, open, waiting for it
  const WATCH = key({ yaw: 10, twist: 8, bend: 3, pitch: 2, side: 0, pz: -1.8, faceUp: 6, faceTurn: -2, ...trayIs(0, 90, 0) }, [15, 10, 48], CANDLE_OUT(8, -12, 33, 2), [-0.4, 0.6, -0.8], [-0.4, -0.6, -1]);
  const WAIT = key({ yaw: 6, twist: 4, bend: 2, pitch: 1, side: 0, pz: -1.4, faceUp: 6, faceTurn: 4, ...trayIs(0, 90, 0) }, [15, 10.5, 50], CANDLE_OUT(8.5, -10, 33.5, 1), [-0.4, 0.6, -0.8], [-0.4, -0.6, -1]);
  // CAUGHT: the tray slapped back onto his palm, the hand driven back and down a little by it
  const CAUGHT = key({ yaw: 3, twist: 1, bend: 3, pitch: 2, side: 0, pz: -2.0, faceUp: 5, faceTurn: 2, ...trayIs(-8, 86, 0) }, [12, 10.5, 47], CANDLE_OUT(8, -9, 33, 0), [-0.4, 0.6, -0.8], [-0.4, -0.6, -1]);
  // up onto his shoulder again
  const BACKUP = key({ yaw: 1, twist: 0, bend: 0, pitch: 0, side: 0, pz: -1.0, faceUp: 6, faceTurn: 0, ...trayIs(0, 90, 0) }, [8, 14, 53], null, [-0.3, 0.6, -0.8], null);
  return {
    long: FM_THROW.long,
    strike: FM_THROW.strike,
    hit: FM_THROW.hit,
    keys: [
      [0, {}],
      [0.1, LIFT],
      [0.22, TAKE],
      [0.33, ROUND],
      [w0, COIL],
      [0.54, shake(1)],
      [0.64, shake(2)],
      [w1, COIL],
      [s0, HIPS],
      [s0 + FR, MID],
      [s1, FLUNG],
      [1.02, ON],
      [1.3, WATCH],
      [1.7, WAIT],
      [FM_THROW.catch + 0.06, CAUGHT],
      [2.08, BACKUP],
      [FM_THROW.long, {}],
    ],
  };
}
/** Whether the tray is on his hand during the throw: not from the moment it leaves him until he catches it. */
const trayGone = (t: number): boolean => t > FM_THROW.hit + 1e-6 && t < FM_THROW.catch - 1e-6;
function throwFeet(): (t: number) => P {
  const [s0] = FM_THROW.strike;
  return footwork(B, {
    // (the right foot back as he coils; the left stepped forward, out to his left, as he throws; both home again)
    R: { start: R0, moves: [{ t0: 0.14, t1: 0.34, to: plantBy(R0, -5, -2.5, -16), lift: 2.4 }, { t0: 1.92, t1: 2.16, to: R0, lift: 2.0 }] },
    L: { start: L0, moves: [{ t0: s0 - 0.14, t1: s0 - 0.01, to: plantBy(L0, 9, 3, -6), lift: 3.2 }, { t0: 1.98, t1: 2.24, to: L0, lift: 2.4 }] },
  });
}

// =============================================================================================
// THE CANDELABRUM (his second blow, the bigger)

/** Its times: how long; the warning, held; the strike (two frames, over his head and down); the fire splashing out as it lands. */
export const FM_SWING = { long: 2.1, warn: [0.48, 0.8] as const, strike: [26 / FPS, 28 / FPS] as const, hit: 28 / FPS } as const;
/** The tray let down to hang at his left side, gripped by its rim, its face to his thigh. */
const TRAY_DOWN = (dx = 0): P => ({ lhIn: 1, lhx: 0.5 + dx, lhy: 3.8, lhz: -21.5, ...trayIs(90, 2, 1) });
function swingPlan(): Plan {
  const [w0, w1] = FM_SWING.warn;
  const [s0, s1] = FM_SWING.strike;
  // (the tray first taken forward off his shoulder and turned on edge, then let down at his side)
  const TURN = key({ yaw: -2, twist: -2, bend: 0, pitch: 0, pz: -0.8, faceUp: 6, faceTurn: 2, ...trayIs(90, 50, 0.7) }, [11, 14, 46], candleGrip([7, -11, 40], heading(-10, 82), [0, 1, 0]), [-0.3, 0.6, -0.8], [-0.4, -0.8, -0.8]);
  const LIFT = key({ yaw: -4, twist: -6, bend: 0, pitch: 0, pz: -0.6, faceUp: 6, faceTurn: 4, ...TRAY_DOWN() }, null, candleGrip([6, -11, 50], heading(-10, 80), [0, 1, 0]), [-0.3, 0.5, -1], [-0.2, -1, -0.4]);
  // RAISED: high over his right shoulder and back, his back arched, up on the balls of his feet
  const RAISED = key({ yaw: -12, twist: -16, bend: -12, pitch: -4, side: 3, pz: 0.6, faceUp: 12, faceTurn: 10, faceTilt: -3, ...TRAY_DOWN(1.5) }, null, candleGrip([-5, -8, 72], heading(180, 58), [0, 1, 0]), [-0.3, 0.6, -1], [0.2, -0.9, 0.4]);
  const shake = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.45 : -0.25), rhx: (RAISED.rhx as number) - 0.25 * (k % 2), pz: (RAISED.pz as number) - 0.1 * (k % 2) });
  const HIPS = { ...RAISED, yaw: 2, twist: -30, pz: 0.2 };
  // over the top: the candelabrum above his head, coming forward
  const OVER = key({ yaw: 8, twist: -6, bend: 6, pitch: 4, side: 0, pz: -1.4, faceUp: 4, faceTurn: 0, ...TRAY_DOWN(2) }, null, candleGrip([8, -6, 70], heading(10, 60), [0, 1, 0]), [-0.3, 0.6, -1], [0.3, -0.9, 0.2]);
  // SLAMMED: down before him to his left, bent over it, the left foot planted forward
  const SLAM = key({ yaw: 16, twist: 12, bend: 26, pitch: 14, side: -3, pz: -6.0, faceUp: -6, faceTurn: -6, ...TRAY_DOWN(3) }, null, candleGrip([19, 2, 24], heading(14, -32), [-0.2, 1, 0]), [-0.3, 0.6, -1], [-0.3, -0.8, -0.6]);
  const ON = key({ yaw: 20, twist: 16, bend: 30, pitch: 16, side: -4, pz: -6.6, faceUp: -8, faceTurn: -8, ...TRAY_DOWN(3.5) }, null, candleGrip([19, 7, 20], heading(28, -40), [-0.4, 1, 0]), [-0.3, 0.6, -1], [-0.3, -0.8, -0.6]);
  const LOW = key({ yaw: 16, twist: 12, bend: 24, pitch: 12, side: -3, pz: -5.6, faceUp: -2, faceTurn: -4, ...TRAY_DOWN(3) }, null, candleGrip([18, 4, 23], heading(20, -10), [-0.2, 1, 0]), [-0.3, 0.6, -1], [-0.3, -0.8, -0.6]);
  const UP = key({ yaw: 4, twist: 2, bend: 6, pitch: 3, side: 0, pz: -1.6, faceUp: 4, faceTurn: 0, ...TRAY_DOWN(1) }, null, candleGrip([13, -6, 31], heading(0, 70), [0, 1, 0]), [-0.3, 0.6, -1], [-0.5, -0.5, -1]);
  return {
    long: FM_SWING.long,
    strike: FM_SWING.strike,
    hit: FM_SWING.hit,
    keys: [
      [0, {}],
      [0.12, TURN],
      [0.26, LIFT],
      [w0, RAISED],
      [0.58, shake(1)],
      [0.68, shake(2)],
      [w1, RAISED],
      [s0, HIPS],
      [s0 + FR, OVER],
      [s1, SLAM],
      [1.08, ON],
      [1.4, LOW],
      [1.66, UP],
      [1.88, TURN],
      [FM_SWING.long, {}],
    ],
  };
}
function swingFeet(): (t: number) => P {
  const [s0] = FM_SWING.strike;
  return footwork(B, {
    // (up on the balls of his feet as he raises it; the left foot stepped long before him as it comes down; both home again)
    R: { start: R0, moves: [{ t0: 0.16, t1: 0.36, to: plantBy(R0, -4, -1.5, -10), lift: 2.2 }, { t0: 1.76, t1: 2.0, to: R0, lift: 2.0 }] },
    L: { start: L0, moves: [{ t0: s0 - 0.16, t1: s0 - 0.02, to: plantBy(L0, 12, 2, -10), lift: 3.4 }, { t0: 1.8, t1: 2.06, to: L0, lift: 2.6 }] },
  });
}

// =============================================================================================
// STRUCK

export const FM_REEL = 0.4;
function reelPlan(): Plan {
  const JOLT: P = { px: -2.6, pz: 0.4, pitch: -6, bend: -8, faceUp: 22, faceTilt: 6, ...trayIs(-20, 76, 0), lhz: R.lhz + 1.5, lhx: R.lhx - 1.5, rhx: R.rhx - 2.4, rhz: R.rhz + 1.0, out: 0.08 };
  const BACK: P = { px: -1.0, pitch: 2, bend: 2, faceUp: 8, ...trayIs(10, 86, 0) };
  return { long: FM_REEL, keys: [[0, {}], [0.07, JOLT], [0.2, BACK], [FM_REEL, {}]] };
}

// =============================================================================================
// HIS DEATH (his pick of 30 Oct, “Yes, these (Recommended)”): struck dead, he goes rigid and upright a moment, a last stiff
// shiver; then over backwards in one piece like a plank, hinged at his heels, stiff from heels to head, his arms at his
// sides; flat on his back with a little bounce. The tray flies from his hand as he stiffens, lands on its rim and spins
// round and round, rattling flatter until it lies still (a coin settling); the candelabrum drops and its candles go out;
// the Hush leaves him in a grey breath rising out of him; and he lies still, a man again, alive.

/** His hands as the chest has them (HandIn 0: from each shoulder, along the chest's own forward, left and up), so that a body that goes over in one piece takes its arms with it. */
const handsIn = (s: Skeleton, L: V3, Rt: V3): P => {
  const c = s.chest;
  const i = (d: V3): V3 => [dot(d, c[0]), dot(d, c[1]), dot(d, c[2])];
  const l = i(sub(L, s.shoulderL));
  const r = i(sub(Rt, s.shoulderR));
  return { lhIn: 0, lhx: l[0], lhy: l[1], lhz: l[2], rhIn: 0, rhx: r[0], rhy: r[1], rhz: r[2] };
};
const S_REST = solve(B, R as Posed);
/** His rest with his hands said as the chest has them (the same bones). */
const REST_C: P = { ...handsIn(S_REST, S_REST.handL, S_REST.handR), le: R.le, re: R.re };
/** HIS ARMS RIGID AT HIS SIDES: straight down, a little out over his coat's skirts, the elbows back. */
const SIDE_L: V3 = [0.5, 2.6, -23.2];
const SIDE_R: V3 = [0.5, -2.6, -23.2];
/** RIGID: bolt upright, his weight back on his heels, legs locked, chin up, arms at his sides (his hands as the chest has them). */
const RIGID: P = (() => {
  const body: P = { px: -0.5, py: 0, pz: -0.45, yaw: 0, pitch: -1.5, roll: 0, twist: 0, bend: -1.5, side: 0, faceUp: 4, faceTurn: 0, faceTilt: 0, lhIn: 0, lhx: SIDE_L[0], lhy: SIDE_L[1], lhz: SIDE_L[2], rhIn: 0, rhx: SIDE_R[0], rhy: SIDE_R[1], rhz: SIDE_R[2], out: 0.55 };
  const q = { ...R, ...body } as Posed;
  const le = elbowFor(B, q, true, norm([-1, 0.25, -0.1]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([-1, -0.25, -0.1]));
  return { ...body, le, re };
})();
/** The line his heels are on, that he goes over about (forward of his floor point, and up). */
const S_RIGID = solve(B, { ...R, ...RIGID } as Posed);
const HINGE: readonly [number, number] = [(S_RIGID.heelL[0] + S_RIGID.heelR[0]) / 2, (S_RIGID.heelL[2] + S_RIGID.heelR[2]) / 2];
const HEEL_L = plantOf(B, 'L', RIGID, R, 'heel');
const HEEL_R = plantOf(B, 'R', RIGID, R, 'heel');
const HIP_H = B.ankle + B.shank + B.thigh;
/** As far as his legs go over (degrees from upright): where the back of his coat at his hips comes down on the floor; and his trunk on beyond them, his shoulders down too (a body lying flat is a little bent at the hips). */
const LIE_LEGS = 80.0;
const LIE_TRUNK = 7.6;
/** And his head, as it strikes the floor, rocked back onto it (degrees, chin up). */
const LIE_HEAD = 18;
/**
 * HIM GONE OVER IN ONE PIECE: the rigid pose turned back about his heels by `legs` degrees, his trunk `trunk` more about
 * his hips; his feet rocked back on their heels, each heel where it stood; his knees and his face going with him.
 */
function tipped(base: P, legs: number, trunk: number): P {
  const b = { ...R, ...base } as Bones;
  const a = (legs * Math.PI) / 180;
  const rx = b.px - HINGE[0];
  const rz = HIP_H + b.pz - HINGE[1];
  const x = rx * Math.cos(a) - rz * Math.sin(a);
  const z = rx * Math.sin(a) + rz * Math.cos(a);
  return {
    ...base,
    px: HINGE[0] + x,
    pz: HINGE[1] + z - HIP_H,
    pitch: b.pitch - legs - trunk,
    faceUp: b.faceUp + legs + trunk,
    ...footOn(B, 'L', { ...HEEL_L, pitch: -legs }),
    ...footOn(B, 'R', { ...HEEL_R, pitch: -legs }),
    lkUp: legs,
    rkUp: legs,
  };
}

/**
 * THE FALL: how far over he has gone (his legs, degrees from upright) `u` seconds after he begins to tip. A plank on its
 * end, its weight just past its heels: slow to start, faster and faster (as a body falls, `GO`), till his hips come down.
 */
const FALL = ((): { at: (u: number) => number; long: number } => {
  const GO = 70;
  const PAST = (1.6 * Math.PI) / 180;
  const dt = 1 / 1200;
  const th: number[] = [0];
  let w = 0;
  let a = 0;
  while (a < (LIE_LEGS * Math.PI) / 180) {
    w += GO * Math.sin(a + PAST) * dt;
    a += w * dt;
    th.push(a);
  }
  const long = (th.length - 1) * dt;
  return {
    long,
    at: (u) => {
      if (u <= 0) return 0;
      if (u >= long) return LIE_LEGS;
      const k = u / dt;
      const i = Math.floor(k);
      return ((th[i] + (th[i + 1] - th[i]) * (k - i)) * 180) / Math.PI;
    },
  };
})();

/** Its times: struck; seized rigid (his arms snap to his sides, the candelabrum let go, the tray flung from his hand); held rigid, the shiver; tipping; down flat on his back; the tray down on its rim, and still; the rigidity going out of him. */
const TIP = 0.6;
const LAND = TIP + FALL.long;
export const FM_DIES = {
  long: 2.9,
  jolt: 0.08,
  dropC: 0.13,
  drop: 0.15,
  rigid: 0.3,
  shiver: [0.32, 0.56] as const,
  tip: TIP,
  land: LAND,
  trayDown: 0.8,
  trayStill: 2.36,
  ease: [1.6, 2.3] as const,
  breath: [LAND + 0.03, LAND + 1.25] as const,
} as const;
/** The bounce as he lands (degrees: his legs, his trunk): up off the floor a little, and down; and once more, less. */
function bounce(t: number): number {
  const u = t - LAND;
  if (u <= 0) return 0;
  if (u < 0.13) return Math.sin((Math.PI * u) / 0.13);
  if (u < 0.21) return 0.28 * Math.sin((Math.PI * (u - 0.13)) / 0.08);
  return 0;
}
/** The face's numbers (as `solve` reads them: turned, then up, then tilted) for a face turned to its forward `f`, its left `l`. */
function faceNumbers(f: V3, l: V3): { faceTurn: number; faceUp: number; faceTilt: number } {
  const up = Math.asin(Math.max(-1, Math.min(1, f[2])));
  const turn = Math.atan2(f[1], f[0]);
  const l0: V3 = [-Math.sin(turn), Math.cos(turn), 0];
  const u0: V3 = [-Math.sin(up) * Math.cos(turn), -Math.sin(up) * Math.sin(turn), Math.cos(up)];
  const tilt = Math.atan2(dot(l, u0), dot(l, l0));
  return { faceTurn: turn * D, faceUp: up * D, faceTilt: tilt * D };
}
/** A vector turned `deg` degrees about the line `ax` (right-handed). */
const turnAbout = (v: V3, ax: V3, deg: number): V3 => {
  const a = (deg * Math.PI) / 180;
  const k = norm(ax);
  return add(add(mul(v, Math.cos(a)), mul(cross(k, v), Math.sin(a))), mul(k, dot(k, v) * (1 - Math.cos(a))));
};

/** HIS BONES AT EVERY MOMENT OF HIS DEATH, all of them (laid over its keys as a mob's feet are: so that his going over is exact on every frame). */
const deathPose: (t: number) => P = (() => {
  // STRUCK: jolted back, his head snapped back, his hands thrown
  const JOLT: P = { ...REST_C, px: -2.0, pitch: -4, bend: -6, faceUp: 18, out: 0.1, lhx: (REST_C.lhx as number) - 1.0, lhz: (REST_C.lhz as number) + 1.2, rhx: (REST_C.rhx as number) - 1.6, rhz: (REST_C.rhz as number) + 0.8 };
  // SEIZED: his arms snapping straight down to his sides (the tray flung up off his palm as the left goes, the candelabrum
  // let fall from the right), his body snapping straight and stiff, up onto locked knees, the chin coming up
  const SEIZE: P = { ...REST_C, px: -1.0, pz: -0.3, pitch: -2, bend: -2, faceUp: 10, out: 0.3, lhIn: 0, lhx: 2.2, lhy: 9.5, lhz: -9.0, rhIn: 0, rhx: 3.0, rhy: -4.4, rhz: -21.0, le: RIGID.le, re: RIGID.re };
  const plan: Plan = {
    long: FM_DIES.shiver[1] + 0.04,
    keys: [
      [0, REST_C],
      [FM_DIES.jolt, JOLT],
      [0.19, SEIZE],
      [FM_DIES.rigid, RIGID],
      [FM_DIES.shiver[1] + 0.04, RIGID],
    ],
  };
  const early = poseFn(plan);
  const trunkAt = (legs: number): number => LIE_TRUNK * smooth(LIE_LEGS * 0.72, LIE_LEGS, legs);
  // (lying: his hands down on the floor beside him, his arms straight; his head rolled over toward his right)
  const lie = { ...tipped(RIGID, LIE_LEGS, LIE_TRUNK) };
  lie.faceUp = (lie.faceUp as number) + LIE_HEAD;
  const sLie = solve(B, { ...R, ...lie } as Posed);
  const down = (hand: V3): number => (hand[2] - 2.5) / Math.max(0.3, sLie.chest[0][2]);
  const dropL = down(sLie.handL);
  const dropR = down(sLie.handR);
  const fLie = sLie.face;
  return (t: number): P => {
    if (t < TIP) {
      const p = early(t);
      // (the last stiff shiver: a quick tremble through him, rigid, dying away)
      const [a0, a1] = FM_DIES.shiver;
      if (t > a0 && t < a1) {
        const k = Math.sin((Math.PI * (t - a0)) / (a1 - a0)) * (1 - 0.5 * (t - a0) / (a1 - a0));
        const w = (t - a0) * 2 * Math.PI * 9;
        const shook = { ...p, roll: (p.roll as number) + 1.6 * k * Math.sin(w), faceTilt: (p.faceTilt as number) + 4.0 * k * Math.sin(w * 1.1 + 2), faceTurn: (p.faceTurn as number) + 2.8 * k * Math.sin(w * 0.9), lhy: (p.lhy as number) + 0.7 * k * Math.sin(w + 0.5), rhy: (p.rhy as number) - 0.7 * k * Math.sin(w + 1.5) };
        // (all of him trembling back on his heels, in one piece)
        return tipped(shook, 1.1 * k * (0.5 + 0.5 * Math.sin(w * 0.8 + 0.3)), 0);
      }
      return p;
    }
    // OVER LIKE A PLANK, and down; the little bounce
    const legs = FALL.at(t - TIP) - 0.9 * bounce(t);
    const trunk = trunkAt(FALL.at(t - TIP)) - 2.2 * bounce(t);
    const out = 0.55 + 0.45 * smooth(TIP, LAND, t);
    const p = tipped({ ...RIGID, out }, legs, trunk);
    // (as he comes down his arms slap down onto the floor beside him)
    const slap = smooth(LAND - 0.04, LAND + 0.1, t);
    p.lhx = (p.lhx as number) - dropL * slap;
    p.rhx = (p.rhx as number) - dropR * slap;
    // (and his head, striking the floor, rocks back onto it)
    p.faceUp = (p.faceUp as number) + LIE_HEAD * smooth(LAND - 0.03, LAND + 0.09, t);
    // THE RIGIDITY GOING OUT OF HIM: his head rolls over toward his left (his white wig to the eye, his queue on the floor), his hands ease
    const [e0, e1] = FM_DIES.ease;
    const ease = smooth(e0, e1, t);
    if (ease > 0) {
      const sNow = solve(B, { ...R, ...p } as Posed);
      const along = sNow.chest[2];
      const f = turnAbout(fLie[0], along, 34 * ease);
      const l = turnAbout(fLie[1], along, 34 * ease);
      // (and a little over toward his chin, the neck easing)
      const fx = faceNumbers(turnAbout(f, l, 6 * ease), l);
      Object.assign(p, fx);
      p.lhy = (p.lhy as number) + 0.8 * ease;
      p.rhy = (p.rhy as number) - 0.8 * ease;
    }
    return p;
  };
})();
function diesMotion(): Motion {
  const keys: Key3[] = [];
  const n = Math.round(FM_DIES.long * FPS);
  for (let i = 0; i <= n; i++) keys.push({ at: i / FPS, pose: deathPose(i / FPS), ease: 'lin' });
  return { keys };
}

// =============================================================================================
// THE TRAY AS HE DIES: flung from his hand as he stiffens; tumbling over once in the air; down on its rim; rolling round
// and round on it, faster and flatter, a coin settling, until it lies still on its back, its face up

/** Where it comes down (his own lengths, forward and to his left of his floor point), how tipped it is as it does (degrees from flat), and how fast it then goes round on its rim at first and at most (turns a second). */
export const TRAY_LIES = { at: [11, 27] as const, tilt: 68, round0: 2.3, roundMost: 6.0 } as const;
/** The lowest of its rim stands this far off the floor. */
const RIM_UP = 0.05;
/** Its middle's height when tipped `th` (radians) from flat, its face up: the lowest of its rolled rim on the floor. */
const trayHigh = (th: number): number => 0.97 * TRAY.r * Math.sin(th) - 0.35 * Math.cos(th) + 0.55 + RIM_UP;
/** THE TRAY'S WAY, worked out once, finely: from the hand at `FM_DIES.drop` to lying still. */
const TRAY_PATH = ((): { t0: number; dt: number; c: V3[]; n: V3[]; u: V3[] } => {
  const G = 400;
  const t0 = FM_DIES.drop;
  const dt = 1 / 600;
  const s = solve(B, { ...R, ...deathPose(t0) } as Posed);
  const tr0 = trayOf(s, { pAz: R.pAz, pEl: R.pEl, pt: 0 });
  const tL = FM_DIES.trayDown;
  const tS = FM_DIES.trayStill;
  const th0 = (TRAY_LIES.tilt * Math.PI) / 180;
  // (it tumbles over once, short of a whole turn, about a line square to the way it flies, coming down on its rim)
  const fly: V3 = norm([TRAY_LIES.at[0] - tr0.c[0], TRAY_LIES.at[1] - tr0.c[1], 0]);
  const axis = norm(cross([0, 0, 1], fly));
  const turnBy = 360 - TRAY_LIES.tilt;
  const land: V3 = [TRAY_LIES.at[0], TRAY_LIES.at[1], trayHigh(th0)];
  const T = tL - t0;
  const v: V3 = [(land[0] - tr0.c[0]) / T, (land[1] - tr0.c[1]) / T, (land[2] - tr0.c[2] + 0.5 * G * T * T) / T];
  const c: V3[] = [];
  const n: V3[] = [];
  const u: V3[] = [];
  let phi = 0;
  let nn: V3 = tr0.n;
  let uu: V3 = tr0.u;
  for (let t = t0; t <= FM_DIES.long + 1e-9; t += dt) {
    if (t < tL) {
      const tau = t - t0;
      const k = tau / T;
      nn = turnAbout(tr0.n, axis, turnBy * k);
      uu = turnAbout(turnAbout(tr0.u, tr0.n, 40 * k), axis, turnBy * k);
      c.push([tr0.c[0] + v[0] * tau, tr0.c[1] + v[1] * tau, tr0.c[2] + v[2] * tau - 0.5 * G * tau * tau]);
      n.push(nn);
      u.push(uu);
      continue;
    }
    if (phi === 0) phi = Math.atan2(nn[1], nn[0]);
    // ROUND ON ITS RIM: tipped less and less (slowly, then all at once, as a coin settles), going round faster and faster
    const th = t >= tS ? 0 : th0 * Math.pow((tS - t) / (tS - tL), 0.42);
    const rate = Math.min(TRAY_LIES.roundMost, TRAY_LIES.round0 * Math.sqrt(Math.sin(th0) / Math.max(1e-3, Math.sin(th))));
    if (th > 0) phi += 2 * Math.PI * rate * dt;
    const want: V3 = [Math.sin(th) * Math.cos(phi), Math.sin(th) * Math.sin(phi), Math.cos(th)];
    // (rolling on its rim, not sliding: the way across it carried along with its face, by the least turn each step)
    const ax = cross(nn, want);
    const sn = Math.hypot(...ax);
    if (sn > 1e-9) uu = turnAbout(uu, ax, (Math.atan2(sn, dot(nn, want)) * 180) / Math.PI);
    uu = norm(sub(uu, mul(want, dot(uu, want))));
    nn = want;
    // (as it comes down, the clatter: a little hop off its rim)
    const hop = t - tL < 0.07 ? 0.9 * Math.sin((Math.PI * (t - tL)) / 0.07) : 0;
    c.push([land[0], land[1], trayHigh(th) + hop]);
    n.push(nn);
    u.push(uu);
  }
  return { t0, dt, c, n, u };
})();
/** The tray loose of him `t` seconds into his death (null while it is on his hand). */
export function trayLooseAt(t: number): { c: V3; n: V3; u: V3 } | null {
  if (t < FM_DIES.drop) return null;
  const i = Math.min(TRAY_PATH.c.length - 1, Math.round((t - TRAY_PATH.t0) / TRAY_PATH.dt));
  return { c: TRAY_PATH.c[i], n: TRAY_PATH.n[i], u: TRAY_PATH.u[i] };
}

// =============================================================================================
// WHAT THE TRAY DOES IN THE AIR (art/masque_footmen_fx.ts draws it): from his hand as it leaves it to his hand as he catches it

const PLANS = { attack: throwPlan(), candelabrum: swingPlan(), reel: reelPlan() } as const;
const POSES: Record<string, (t: number) => P> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, poseFn(p)]));
/** His bones at a moment of one of his moves (by the review's name for it), as the plans and the feet have them. */
const FEET: Record<string, (t: number) => P> = { attack: throwFeet(), candelabrum: swingFeet() };
function bonesOf(move: string, t: number): Skeleton {
  if (move === 'attack' || move === 'candelabrum') return solve(B, { ...R, ...POSES[move](t), ...FEET[move](t) } as Posed);
  return skeletonAt(FOOTMAN, move, t);
}
const trayAt = (move: string, t: number): { c: V3; n: V3; u: V3 } => {
  const s = bonesOf(move, t);
  const q = { ...R, ...(POSES[move]?.(t) ?? {}) } as Posed;
  return trayOf(s, q);
};
/**
 * THE TRAY'S FLIGHT, `t` seconds after it leaves his hand (0 to `TRAY_FLIGHT.long`): where its middle is (his own lengths,
 * from his place on the floor, his forward and his left), how far it has spun (turns), how it is tipped, and the way its
 * face looks. From where it left his hand, out FM_TRAY's reach in a long loop, and back into his hand.
 */
export const TRAY_FLIGHT = { long: FM_THROW.catch - FM_THROW.hit } as const;
export function trayFlight(t: number): { c: V3; spin: number; n: V3; u: V3 } {
  const a = trayAt('attack', FM_THROW.hit);
  const b = trayAt('attack', FM_THROW.catch);
  return trayLoop(a.c, b.c, t, TRAY_FLIGHT.long);
}
void TRAY_FX;

// =============================================================================================
// WHAT IS LAID AFTER HIS EDGE: the smear of each strike, the air on the flames, the glints, the smoke as his candles go out

/** The strikes, by move: from the last frame of the wind-up to the frame it lands on. */
export const FM_STRIKES: Readonly<Record<string, readonly [number, number]>> = { attack: FM_THROW.strike, candelabrum: FM_SWING.strike };
/** Whether a frame of a move shows its strike's smear: from the frame after its wind-up ends to the frame after it lands (thinning then). */
export function smearedAt(move: string, t: number): boolean {
  const s = FM_STRIKES[move];
  return !!s && t > s[0] + 1e-6 && t <= s[1] + FR + 1e-6;
}
function smearOf(move: string, t: number): { lines: V3[][]; fire: V3[][] } | null {
  if (!smearedAt(move, t)) return null;
  const [s0, s1] = FM_STRIKES[move];
  const to = Math.min(t, s1);
  const lines: V3[][] = [];
  const fire: V3[][] = [];
  const n = 8;
  const wicks: V3[][] = [[], [], []];
  for (let i = 0; i <= n; i++) {
    const u = s0 - FR * 0.5 + ((to - (s0 - FR * 0.5)) * i) / n;
    const s = bonesOf(move, u);
    if (move === 'attack') {
      // (the arm and the tray's rim, after-images all along the way they came)
      const tr = trayAt('attack', u);
      lines.push([s.elbowL, s.handL]);
      const rim: V3[] = [];
      for (let k = 0; k <= 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        rim.push(add(tr.c, add(mul(tr.u, Math.cos(a) * TRAY.r), mul(norm(cross(tr.n, tr.u)), Math.sin(a) * TRAY.r))));
      }
      lines.push(rim);
    } else {
      const k = candelabrumOf(s);
      lines.push([s.elbowR, s.handR], [k.foot, k.at(CANDELABRUM.top)], [k.cups[0], k.at(CANDELABRUM.spring), k.cups[2]]);
      k.wicks.forEach((w, j) => wicks[j].push(add(w, [0, 0, 1.5])));
    }
  }
  if (move === 'candelabrum') fire.push(...wicks);
  // (and after it has landed, thinned: the oldest gone)
  const late = t > s1 + 1e-6;
  return { lines: late ? lines.slice(Math.floor(lines.length / 2)) : lines, fire: late ? fire.map((f) => f.slice(Math.floor(f.length / 2))) : fire };
}
const byName: Record<string, string> = {};
/** The air going past his candles at a moment of a move: as they have moved since a frame before (and as the game carries him, marching), back the other way. */
function windOf(move: string, t: number): V3 {
  if (move === 'dying' || move === '') return [0, 0, 0];
  const now = candelabrumOf(bonesOf(move, t)).at(CANDELABRUM.cup);
  const was = candelabrumOf(bonesOf(move, t - FR)).at(CANDELABRUM.cup);
  const ground: V3 = move === 'walk' ? [(FM_PACE * TILE3) / FPS, 0, 0] : [0, 0, 0];
  return mul(add(sub(now, was), ground), -1);
}
/** How much his candles burn: as they always do; flared as they come down in the strike; guttering for a moment after; out once the candelabrum leaves his hand. */
function burnOf(move: string, t: number): number {
  if (move === 'candelabrum') {
    const [, s1] = FM_SWING.strike;
    if (t > s1 && t < s1 + 0.5) return 0.45 + 0.55 * smooth(s1, s1 + 0.5, t);
    if (t >= FM_SWING.strike[0] && t <= s1) return 1.4;
  }
  if (move === 'dying') return t < FM_DIES.dropC ? 1 - 0.4 * smooth(0.1, FM_DIES.dropC, t) : 0;
  return 1;
}
function moreOf(move: string, m: Moment): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const t = m.t;
  // (the warning: points of pink and gold running round the tray's rim, or along the candelabrum's arms)
  const warn = move === 'attack' ? FM_THROW.warn : move === 'candelabrum' ? FM_SWING.warn : null;
  if (warn && t >= warn[0] - 0.1 && t <= warn[1] + 0.03) {
    const s = m.s;
    const tick = Math.floor(t * 15);
    if (move === 'attack') {
      const tr = trayOf(s, m.q as unknown as { pAz: number; pEl: number; pt: number });
      for (let i = 0; i < 12; i++) {
        if ((i + tick) % 4) continue;
        const a = (i / 12) * Math.PI * 2;
        out.push([add(tr.rim[i], [0, 0, 0.8 + 0 * a]), (i + tick) % 8 ? FLAME[3] : FLAME[4], 1]);
      }
    } else {
      const k = candelabrumOf(s);
      const pts = [k.cups[0], k.at(CANDELABRUM.spring), k.cups[2], k.at(CANDELABRUM.foot + 1), k.mid];
      pts.forEach((p, i) => {
        if ((i + tick) % 2 === 0) out.push([add(p, [0, 0, 0.6]), (i + tick) % 4 ? FLAME[3] : FLAME[4], 1]);
      });
    }
  }
  // (his candles going out as the candelabrum leaves his hand: a breath of smoke from each wick, rising and thinning)
  if (move === 'dying' && t >= FM_DIES.dropC && t < FM_DIES.dropC + 1.0) {
    const s = bonesOf('dying', FM_DIES.dropC);
    const k = candelabrumOf(s);
    const age = t - FM_DIES.dropC;
    k.wicks.forEach((w, j) => {
      for (let i = 0; i < 6; i++) {
        const life = age * 1.4 - i * 0.08;
        if (life < 0 || life > 1) continue;
        const p: V3 = [w[0] + Math.sin(i * 2.1 + j + t * 4) * 1.2 * life, w[1] + Math.cos(i * 1.7 + j) * 1.0 * life, w[2] + 2 + 12 * life];
        out.push([p, life < 0.4 ? '#8a8494' : '#5a5466', 1]);
      }
    });
  }
  void hash;
  return out;
}
const SAY: FootmanSay = {
  trayHeld: (m) => {
    const mv = byName[m.move ?? ''] ?? '';
    if (mv === 'attack') return !trayGone(m.t);
    if (mv === 'dying') return m.t < FM_DIES.drop;
    return true;
  },
  loose: (m) => (byName[m.move ?? ''] === 'dying' ? trayLooseAt(m.t) : null),
  dies: {
    // (it leaks hard from him while he stands rigid and goes over; once he is down it leaves him in one great breath)
    puff: (t) => (t < LAND ? 1.3 + 0.5 * smooth(0.05, 0.3, t) : Math.max(0, 1.8 * (1 - (t - LAND) / 0.6))),
    breath: FM_DIES.breath,
  },
  candleHeld: (m) => !(byName[m.move ?? ''] === 'dying' && m.t >= FM_DIES.dropC),
  burn: (m) => burnOf(byName[m.move ?? ''] ?? '', m.t),
  wind: (m) => windOf(byName[m.move ?? ''] ?? '', m.t),
  smear: (m) => smearOf(byName[m.move ?? ''] ?? '', m.t),
  more: (m) => moreOf(byName[m.move ?? ''] ?? '', m),
};

// =============================================================================================
// HIM, AS THE GAME HOLDS A MONSTER

export const FM_NAMES = {
  stand: 'The footman stands',
  walk: 'The footman marches',
  attack: 'The tray flung',
  candelabrum: 'The candelabrum',
  reel: 'The footman is struck',
  dying: 'Over like a plank, the tray spinning to a stop, the Hush leaves him',
} as const;
for (const [k, v] of Object.entries(FM_NAMES)) byName[v] = k;

function footmanMob(): Mob {
  const paint = footmanPainter(SAY);
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  const glow = (warn: readonly [number, number]) => (t: number): number => (t >= warn[0] - 0.12 && t <= warn[1] + 0.06 ? 1 : 0);
  return {
    id: 'masque-footman',
    name: 'A Hushed footman of the Masque',
    size: 'medium: a little taller than the knight',
    build: B,
    stand: mv(FM_NAMES.stand, standMotion(), { jaw: standJaw }),
    attack: mv(FM_NAMES.attack, motionOf(PLANS.attack), { feet: FEET.attack, glint: glow(FM_THROW.warn), jaw: standJaw }),
    more: {
      candelabrum: mv(FM_NAMES.candelabrum, motionOf(PLANS.candelabrum), { feet: FEET.candelabrum, glint: glow(FM_SWING.warn), jaw: standJaw }),
    },
    idleFrames: 30,
    idleFps: 10,
    walk: mv(FM_NAMES.walk, marchMotion(), { period: FM_MARCH.frames / FM_MARCH.fps, ground: FM_PACE * TILE3, jaw: marchJaw }),
    walkFrames: FM_MARCH.frames,
    walkFps: FM_MARCH.fps,
    pace: FM_PACE,
    reel: mv(FM_NAMES.reel, motionOf(PLANS.reel), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: FM_REEL,
    hit: FM_THROW.hit,
    warn: FM_THROW.warn[1] - FM_THROW.warn[0],
    dieTime: FM_DIES.long,
    // (his mouth: wide as he seizes, a silent cry; open as the Hush leaves him; slack)
    dying: mv(FM_NAMES.dying, diesMotion(), { feet: deathPose, jaw: (t) => (t < 0.1 ? 0.4 : t < FM_DIES.breath[1] ? 1 : 0.5) }),
    aura: { x: FOOTMAN_CANVAS.ax, y: FOOTMAN_CANVAS.ay - 46, r: 40, color: CANDLE_LIGHT_AURA, a: 0.06 },
    shadow: 12,
    canvas: FOOTMAN_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the candelabrum drops from his right hand to the floor before him, its candles out; the tray is not let fall so but
    // flies and rolls on its rim, trayLooseAt)
    fall(piece) {
      if (piece === 'candelabrum') return { from: FM_DIES.dropC, to: [6, -16], spin: 12, lay: 'axis', hop: 1.2 };
      return null;
    },
  };
}
const CANDLE_LIGHT_AURA = '#9a8070';
export const FOOTMAN: Mob = footmanMob();
export function makeFootmanArt3(mob: Mob = FOOTMAN, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function footmanSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.14 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.16 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.5]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.5]), r: 1.8 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.2 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.12 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.1 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    // (the head in its wig, the rolls over the ears)
    { name: 'head', c: add(s.head, mul(s.face[2], 0.2)), rot: s.face, h: [B.headR[0] * 1.1, B.headR[1] * 1.36, B.headR[2] * 1.06] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.4, B.ribHalf + 2.3, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 2.2, B.waistHalf + 2.1, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.6, B.pelvisHalf + 2.6, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
function trayThing(s: Skeleton, q: Posed): CheckThing {
  const tr = trayOf(s, q as unknown as { pAz: number; pEl: number; pt: number });
  return { name: 'tray', pts: [tr.c, ...tr.rim], r: 0.7, may: ['foreL'] };
}
function candleThings(s: Skeleton): CheckThing[] {
  const k = candelabrumOf(s);
  const stem: V3[] = [];
  for (let x = CANDELABRUM.foot; x <= CANDELABRUM.top + CANDELABRUM.candle; x += 2.5) stem.push(k.at(x));
  return [
    { name: 'candelabrum', pts: [...stem, ...k.cups, ...k.wicks], r: 0.9, may: ['foreR'] },
    { name: 'candelabrum foot', pts: [k.foot, add(k.foot, mul(k.across, 3)), add(k.foot, mul(k.across, -3))], r: 1.0, may: ['foreR'] },
  ];
}
const isHeld = (move: string, t: number): { tray: boolean; candle: boolean } => ({
  tray: move === 'attack' ? !trayGone(t) : move === 'dying' ? t < FM_DIES.drop : true,
  candle: move === 'dying' ? t < FM_DIES.dropC : true,
});
export const FM_SHAPE: BossShape = {
  body: footmanSolids,
  tip: (move, t, s) => {
    if (move === 'attack') return s.handL;
    if (move === 'candelabrum') return candelabrumOf(s).at(CANDELABRUM.cup);
    return null;
  },
  things: (move, t, s, q) => {
    const h = isHeld(move, t);
    return [...(h.tray ? [trayThing(s, q)] : []), ...(h.candle ? candleThings(s) : [])];
  },
  strikes: FM_STRIKES,
  smeared: smearedAt,
};
void (null as unknown as Handover);
