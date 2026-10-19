// FLOOR 15'S BOSS, THE CENSOR: HIS MOVES (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE GAME,
// behind CENSOR_ON (art/censor.ts, off). His look and brief are art/censor.ts: made on his word of 18 Oct, 21:24
// Pacific, “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”, the picks this chat would have marked recommended, and sent him with their films.
//
// HIS MOVES (his doc's four: “a brush slash (his basic attack); Redaction, black bars slamming across the floor in a
// telegraphed pattern; Strike-Through, a line drawn straight through you, which you have to dodge; the Hush, silence
// across the whole room”):
//   STANDING (art/censor.ts): still as a pillar, the brush stood upright like a staff, his masked head turning slowly.
//   THE WALK: slow and upright, the robe sweeping the floor, the brush carried upright, swaying forward with his left foot.
//   THE BRUSH SLASH (his blow): the brush heaved up over his right shoulder in both hands, its bristles high behind him,
//     held trembling, their point glinting pink (THE WARNING); then hips first, a step in, and a great stroke down and
//     across before him from his right to his left, the bristles sweeping the floor at its end; held; drawn back up.
//   REDACTION: the brush raised straight up over his head in both hands, his body arched back, held trembling (THE
//     WARNING: the game lays out on the floor where the bars will fall); then slammed down onto the floor before him and
//     dragged across it (the game slams the black bars down across the floor: art/censor_shots.ts); drawn back up.
//   STRIKE-THROUGH: he turns side-on, sinks low and draws the brush back along his side, its point levelled at you,
//     glinting pink (THE WARNING: the game draws the line it will take through you); then a lunge, the brush thrust out
//     its whole reach, its point low over the floor, and the line drawn out from it straight across the room (the game's,
//     art/censor_shots.ts); held; sprung back.
//   THE HUSH: the brush stood upright; he raises his left hand to his mask, one finger to the inked bar where his mouth
//     would be, and it burns pink (THE WARNING); then he sweeps the hand out wide, and silence rolls out from him across
//     the whole room (the game's, art/censor_shots.ts); his robe billowing.
//   STRUCK: jolted back, the mask knocked up, the brush rocking.
//   HIS DEATH: rocked back; the brush slips from his hands and falls; he clutches at his mask with both hands, it cracks
//     and splits and its halves fall away, and the words of the city burst out of him, pink going pale as they go free;
//     his knees give, he sways, and he falls forward onto the floor, long and black, a grey face turned to one side.
//
// By his rulebook: every move through every check the bosses have (art/boss_checks.ts), from in front and behind.
//   test: tsx --test tests/censor.test.ts

import { footwork, kneelHips, kneelSettle, plantBy, plantOf } from './bosses3';
import type { Plant } from './bosses3';
import type { BossShape, CheckLimb, CheckLump, CheckThing } from './boss_checks';
import type { ActorArt } from './actor_types';
import { hash } from './kit';
import { FLAME } from './mkit';
import { CE_BODY, CE_CANVAS, CE_REST, INK, brushOf, censorPainter, censorStand, clamp01, sm } from './censor';
import { TILE3, mobSet } from './new_mobs3';
import type { Mob, MobMove, Moment } from './new_mobs3';
import { add, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const B = CE_BODY;
const R = CE_REST;
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const fr = (t: number): number => t - Math.floor(t);

/** Elbows pointed as nearly toward these ways as the arms let them (the figure's own axes). */
function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}
const glintOf = (t: number, a: number, b: number, c: number, d = 0.2): number => (t < a ? 0 : t < b ? sm((t - a) / (b - a)) : t < c ? 1 : t < c + d ? 1 - (t - c) / d : 0);

/** Both hands on the brush, as on a great sword's grip: the right where it is, the left just below it, toward the butt. */
const BOTH: P = { lhIn: 3, lhx: -6.5, lhy: 0, lhz: 0 };

/**
 * A MOVE IN SPANS: each of the pose's numbers eased (smooth at both ends) from what it was to what a span says, over
 * that span, and laid down as keys thirty a second: a long stroke that turns as it goes, without a stop at each key.
 */
interface Span {
  t0: number;
  t1: number;
  to: P;
}
function flowing(base: P, spans: ReadonlyArray<Span>, long: number): Key3[] {
  const fields = new Set<string>(Object.keys(base));
  for (const s of spans) for (const k of Object.keys(s.to)) fields.add(k);
  const keys: Key3[] = [];
  const n = Math.round(long * 30);
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * long;
    const pose: Record<string, number> = {};
    for (const f of fields) {
      const v0 = (base as Record<string, number>)[f] ?? (R as unknown as Record<string, number>)[f];
      if (typeof v0 !== 'number') continue;
      let v = v0;
      let was = v0;
      for (const s of spans) {
        const to = (s.to as Record<string, number>)[f];
        if (typeof to !== 'number') continue;
        v += sm((t - s.t0) / (s.t1 - s.t0)) * (to - was);
        was = to;
      }
      pose[f] = v;
    }
    if (base.lhIn !== undefined) pose.lhIn = base.lhIn;
    if (base.rhIn !== undefined) pose.rhIn = base.rhIn;
    keys.push({ at: t, ease: 'lin', pose: pose as P });
  }
  return keys;
}

// =============================================================================================
// THE WALK: slow and upright, the brush as a staff

export const CE_PACE = 0.8;
export const CE_WALK = { frames: 12, fps: 8 } as const;
function stepFoot(k: number, n: number, step: number, lift: number): [number, number, number] {
  const half = n / 2;
  if (k <= half) return [step * (half / 2 - k), 0, 0];
  const u = (k - half) / half;
  const g = u * u * (3 - 2 * u);
  return [-step * (half / 2) + step * half * g, lift * Math.sin(Math.PI * u), 14 * Math.sin(Math.PI * u) * (1 - u) - 5 * Math.sin(Math.PI * u) * u];
}
function censorWalk(): Motion {
  const n = CE_WALK.frames;
  const d = (CE_PACE * TILE3) / CE_WALK.fps;
  const keys: Key3[] = [];
  for (let i = 0; i <= n; i++) {
    const j = i % n;
    const a = (j / n) * Math.PI * 2;
    const [lx, lz, lp] = stepFoot(j, n, d, 2.8);
    const [rx, rz, rp] = stepFoot((j + n / 2) % n, n, d, 2.8);
    const sag = Math.abs(Math.sin(a));
    keys.push({
      at: i / CE_WALK.fps,
      ease: 'lin',
      pose: {
        pz: R.pz - 0.9 * sag, py: 0.6 * Math.sin(a), roll: R.roll + 1.6 * Math.sin(a), yaw: 2 * Math.cos(a), side: 0.8 * Math.sin(a),
        bend: R.bend + 1.0 * sag, pitch: R.pitch + 1.5, faceUp: R.faceUp - 1.5 * sag, faceTurn: R.faceTurn + 5 * Math.sin(a * 0.5),
        lfx: lx, lfz: lz, lfp: lp, lfy: R.lfy, lft: R.lft,
        rfx: rx, rfz: rz, rfp: rp, rfy: R.rfy, rft: R.rft,
        // (the brush swaying forward with his left foot, as a standard is carried)
        rhx: (R.rhx as number) + 3.0 * Math.sin(a + Math.PI), rhz: (R.rhz as number) + 1.6 * Math.max(0, Math.sin(a + Math.PI)), wEl: (R.wEl as number) - 6 * Math.sin(a + Math.PI), lhz: (R.lhz as number) + 0.5 * sag,
      },
    });
  }
  return { keys, loop: 0 };
}

// =============================================================================================
// THE BRUSH SLASH

/** His blow: how long; the warning; the stroke crossing before him (a frame of the game's thirty a second); its end on the floor at his left. */
export const CE_SLASH = { long: 1.8, warn: [0.34, 0.64], hit: 24 / 30, through: 27 / 30 } as const;
const SH = CE_SLASH.hit;
/** Heaved up over his right shoulder in both hands, the bristles high behind him; his body wound round to his right. */
const HEAVED: P = elbowsTo({ ...BOTH, px: -1.6, pz: R.pz + 0.8, yaw: -18, twist: -18, pitch: -4, bend: -5, side: 1.5, faceUp: 6, faceTurn: 12, rhIn: 1, rhx: -1, rhy: -6, rhz: 17, wAz: -150, wEl: 42, wRoll: 0 }, [0.9, -0.2, -0.3], [-0.3, -0.8, 0.4]);
const heaved = (k: number): P => ({ ...HEAVED, rhz: (HEAVED.rhz as number) + (k % 2 ? 0.7 : -0.3), twist: (HEAVED.twist as number) + (k % 2 ? -1.2 : 0), wEl: (HEAVED.wEl as number) + (k % 2 ? 2 : -1) });
/** THE STROKE, frame by frame (each a frame of the game's thirty a second): the brush brought over his right shoulder and down across before him, from his right to his left. */
const STROKE: P[] = [
  { ...BOTH, px: 0.4, pz: R.pz + 0.4, yaw: -14, twist: -14, pitch: 2, bend: -2, side: 1.2, faceUp: 4, faceTurn: 10, rhIn: 1, rhx: 1, rhy: -8, rhz: 18, wAz: -150, wEl: 52 },
  { ...BOTH, px: 1.6, pz: R.pz - 0.2, yaw: -8, twist: -8, pitch: 6, bend: 3, side: 0.8, faceUp: 2, faceTurn: 6, rhIn: 1, rhx: 4, rhy: -9, rhz: 17, wAz: -125, wEl: 62 },
  { ...BOTH, px: 2.9, pz: R.pz - 1.0, yaw: -2, twist: -2, pitch: 10, bend: 6, side: 0.4, faceUp: 0, faceTurn: 2, rhIn: 1, rhx: 8, rhy: -8, rhz: 13, wAz: -80, wEl: 52 },
  { ...BOTH, px: 4.0, pz: R.pz - 2.0, yaw: 4, twist: 6, pitch: 14, bend: 10, side: 0, faceUp: -2, faceTurn: -2, rhIn: 1, rhx: 12, rhy: -6, rhz: 6, wAz: -40, wEl: 26 },
  { ...BOTH, px: 5.0, pz: R.pz - 3.0, yaw: 9, twist: 12, pitch: 18, bend: 13, side: -0.5, faceUp: -4, faceTurn: -6, rhIn: 1, rhx: 15, rhy: -6, rhz: -3, wAz: 2, wEl: -6 },
  { ...BOTH, px: 5.6, pz: R.pz - 3.7, yaw: 14, twist: 18, pitch: 20, bend: 15, side: -1, faceUp: -6, faceTurn: -10, rhIn: 1, rhx: 14, rhy: 1, rhz: -10, wAz: 32, wEl: -24 },
  { ...BOTH, px: 5.8, pz: R.pz - 4.0, yaw: 17, twist: 22, pitch: 21, bend: 16, side: -1.2, faceUp: -6, faceTurn: -14, rhIn: 1, rhx: 12, rhy: 4, rhz: -14, wAz: 52, wEl: -33 },
];
const strokeAt = (i: number): P => elbowsTo(STROKE[i], [0.9, -0.2, -0.3], [0, -0.85, -0.5]);
const THROUGH: P = elbowsTo({ ...STROKE[6], px: 5.6, pz: R.pz - 3.9, yaw: 18, twist: 24, wAz: 58, wEl: -35 }, [0.9, -0.2, -0.3], [0.2, -0.8, -0.4]);
function censorSlash(): Motion {
  const f = 1 / 30;
  return {
    hit: SH,
    keys: [
      { at: 0, pose: {} },
      { at: CE_SLASH.warn[0], pose: HEAVED, ease: 'io' },
      { at: 0.44, pose: heaved(1), ease: 'io' },
      { at: 0.54, pose: heaved(2), ease: 'io' },
      { at: CE_SLASH.warn[1], pose: heaved(3), ease: 'io' },
      { at: SH - 4 * f, pose: strokeAt(0), ease: 'in' },
      { at: SH - 3 * f, pose: strokeAt(1), ease: 'lin' },
      { at: SH - 2 * f, pose: strokeAt(2), ease: 'lin' },
      { at: SH - f, pose: strokeAt(3), ease: 'lin' },
      { at: SH, pose: strokeAt(4), ease: 'lin' },
      { at: SH + f, pose: strokeAt(5), ease: 'lin' },
      { at: SH + 2 * f, pose: strokeAt(6), ease: 'out' },
      { at: 1.18, pose: THROUGH, ease: 'out' },
      { at: 1.42, pose: elbowsTo({ px: 2.4, pz: R.pz - 1.6, yaw: 8, twist: 10, pitch: 8, bend: 6, faceUp: 0, lhIn: 1, lhx: 11, lhy: -2, lhz: -18, rhIn: 1, rhx: 9, rhy: -8, rhz: -16, wAz: 24, wEl: 40 }, [-0.2, 0.8, -0.5], [-0.2, -0.8, -0.4]), ease: 'io' },
      { at: CE_SLASH.long, pose: {}, ease: 'io' },
    ],
  };
}
function censorSlashFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: SH - 0.13, t1: SH - 0.02, to: plantBy(L0, 8, 0.5, 6), lift: 2.6 }, { t0: 1.32, t1: 1.6, to: L0, lift: 2.2 }] },
    R: { start: R0, moves: [{ t0: SH - 0.06, t1: SH + 0.06, to: { ...R0, pitch: 14 } }, { t0: 1.36, t1: 1.6, to: R0 }] },
  });
}
const slashGlint = (t: number): number => glintOf(t, 0.18, CE_SLASH.warn[0], SH);

// =============================================================================================
// REDACTION

/** Redaction: how long; the warning (the brush held up over his head); the slam (a frame of the game's thirty a second); in the floor; dragged across it; drawn back up. */
export const CE_REDACT = { long: 2.6, warn: [0.32, 0.92], hit: 30 / 30, floor: 32 / 30, drag: [1.12, 1.52], up: 2.0 } as const;
const XH = CE_REDACT.hit;
/** Raised up over his head in both hands, the brush laid back over it, its bristles high behind him; his body arched back, his masked head up. */
const RAISED: P = elbowsTo({ ...BOTH, px: -2.2, pz: R.pz + 1.4, yaw: -4, twist: -4, pitch: -6, bend: -9, side: 0.5, faceUp: 16, faceTurn: 0, rhIn: 1, rhx: 7, rhy: -4, rhz: 24, wAz: 0, wEl: 122, wRoll: 0 }, [0.6, 0.7, -0.2], [0.5, -0.8, -0.1]);
const raised = (k: number): P => ({ ...RAISED, rhz: (RAISED.rhz as number) + (k % 2 ? 0.8 : -0.3), wEl: (RAISED.wEl as number) + (k % 2 ? 2.5 : -1.5), pz: (RAISED.pz as number) + (k % 2 ? 0.2 : 0) });
/** The slam, frame by frame: hips first, then the brush brought over and down onto the floor before him. */
const SLAM: P[] = [
  { ...BOTH, px: 0.4, pz: R.pz + 0.6, yaw: 0, twist: 0, pitch: 2, bend: -3, side: 0, faceUp: 10, rhIn: 1, rhx: 9, rhy: -4, rhz: 24, wAz: 0, wEl: 112 },
  { ...BOTH, px: 2.0, pz: R.pz - 0.8, pitch: 9, bend: 4, faceUp: 4, rhIn: 1, rhx: 12, rhy: -4, rhz: 20, wAz: 0, wEl: 80 },
  { ...BOTH, px: 3.8, pz: R.pz - 3.0, pitch: 18, bend: 12, faceUp: -2, rhIn: 1, rhx: 15, rhy: -4, rhz: 10, wAz: 0, wEl: 40 },
  { ...BOTH, px: 5.4, pz: R.pz - 5.6, pitch: 28, bend: 19, faceUp: -8, rhIn: 1, rhx: 17, rhy: -4, rhz: -3, wAz: 0, wEl: 0 },
  { ...BOTH, px: 6.2, pz: R.pz - 7.2, pitch: 34, bend: 22, faceUp: -10, rhIn: 1, rhx: 17, rhy: -4, rhz: -12, wAz: 0, wEl: -34 },
];
const slamAt = (i: number): P => elbowsTo(SLAM[i], [0.6, 0.7, -0.3], [0.5, -0.8, -0.3]);
/** Dragged across the floor before him, from his right to his left, the bristles laying the bar down. */
const DRAG = (side: number): P => elbowsTo({ ...SLAM[4], yaw: side * -10, twist: side * -14, side: side * 0.8, rhy: -4 - side * 6, wAz: side * -24, wEl: -31, faceTurn: side * -10 }, [0.6, 0.7, -0.3], [0.5, -0.8, -0.3]);
function censorRedact(): Motion {
  const f = 1 / 30;
  return {
    hit: XH,
    keys: [
      { at: 0, pose: {} },
      { at: CE_REDACT.warn[0], pose: RAISED, ease: 'io' },
      { at: 0.46, pose: raised(1), ease: 'io' },
      { at: 0.6, pose: raised(2), ease: 'io' },
      { at: 0.74, pose: raised(3), ease: 'io' },
      { at: CE_REDACT.warn[1], pose: raised(4), ease: 'io' },
      { at: XH - 3 * f, pose: slamAt(0), ease: 'in' },
      { at: XH - 2 * f, pose: slamAt(1), ease: 'lin' },
      { at: XH - f, pose: slamAt(2), ease: 'lin' },
      { at: XH, pose: slamAt(3), ease: 'lin' },
      { at: CE_REDACT.floor, pose: slamAt(4), ease: 'out' },
      { at: CE_REDACT.drag[0], pose: DRAG(1), ease: 'io' },
      { at: CE_REDACT.drag[1], pose: DRAG(-1), ease: 'io' },
      { at: 1.72, pose: elbowsTo({ ...SLAM[2], yaw: 6, twist: 8, wAz: 10, wEl: 40, rhy: -2 }, [0.6, 0.7, -0.3], [0.5, -0.8, -0.3]), ease: 'io' },
      { at: CE_REDACT.up, pose: elbowsTo({ px: 1, pz: R.pz - 0.6, pitch: 6, bend: 4, lhIn: 1, lhx: 11, lhy: -3, lhz: -18, rhIn: 1, rhx: 8, rhy: -8, rhz: -20, wAz: 0, wEl: 80 }, [-0.2, 0.8, -0.5], [-0.2, -0.85, -0.3]), ease: 'io' },
      { at: CE_REDACT.long, pose: {}, ease: 'io' },
    ],
  };
}
function censorRedactFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: XH - 0.12, t1: XH - 0.01, to: plantBy(L0, 9, 1, 2), lift: 3 }, { t0: 2.04, t1: 2.34, to: L0, lift: 2.2 }] },
    R: { start: R0, moves: [{ t0: XH - 0.06, t1: XH + 0.04, to: { ...R0, pitch: 16 } }, { t0: 2.06, t1: 2.3, to: R0 }] },
  });
}
const redactGlint = (t: number): number => glintOf(t, 0.18, CE_REDACT.warn[0], XH);

// =============================================================================================
// STRIKE-THROUGH

/** Strike-Through: how long; the warning (levelled, drawn back); the thrust (a frame of the game's thirty a second), from which the line runs out; held; sprung back. */
export const CE_STRIKE = { long: 2.2, warn: [0.26, 0.78], hit: 27 / 30, held: 1.3, back: 1.6 } as const;
const KH = CE_STRIKE.hit;
/** A spear's grip: the right hand at the butt, the left forward along the shaft. */
const SPEAR: P = { lhIn: 3, lhx: 15, lhy: 0, lhz: 0 };
/** Side-on and low, the brush drawn back along his right side in both hands, its point levelled at you. */
const LEVELLED: P = elbowsTo({ ...SPEAR, px: -2.4, pz: R.pz - 3.6, yaw: -32, twist: -18, pitch: 6, bend: 6, side: 1, faceUp: 4, faceTurn: 32, rhIn: 1, rhx: -4, rhy: -12, rhz: -20, wAz: 26, wEl: 4, wRoll: 0, lk: 16, rk: -12 }, [0.5, 0.6, -0.6], [-0.6, -0.6, -0.4]);
const levelled = (k: number): P => ({ ...LEVELLED, rhx: (LEVELLED.rhx as number) + (k % 2 ? -0.6 : 0.3), rhz: (LEVELLED.rhz as number) + (k % 2 ? 0.4 : -0.2) });
/** THE THRUST, frame by frame: the hips going first, then the brush driven out its whole reach, its point low over the floor far before him. */
const THRUSTS: P[] = [
  { ...LEVELLED, px: 0.5, pz: R.pz - 3.9, pitch: 8, rhx: -3, wAz: 22 },
  { ...LEVELLED, px: 3.0, pz: R.pz - 4.6, yaw: -28, pitch: 11, bend: 7, rhx: 1, rhz: -19, wAz: 16, wEl: 0 },
  { ...LEVELLED, px: 6.5, pz: R.pz - 5.8, yaw: -25, twist: -12, pitch: 14, bend: 8, faceTurn: 26, rhx: 7, rhy: -10, rhz: -18, wAz: 11, wEl: -6, lk: 24 },
  { ...LEVELLED, px: 10.0, pz: R.pz - 7.0, yaw: -22, twist: -8, pitch: 16, bend: 9, faceTurn: 22, rhx: 14, rhy: -8, rhz: -17, wAz: 7, wEl: -12, lk: 30 },
  { ...SPEAR, px: 12.6, pz: R.pz - 7.9, yaw: -20, twist: -6, pitch: 18, bend: 10, side: 0, faceUp: 0, faceTurn: 20, rhIn: 1, rhx: 19, rhy: -7, rhz: -16, wAz: 5, wEl: -17, wRoll: 0, lk: 34, rk: -6 },
];
const thrustAt = (i: number): P => elbowsTo(THRUSTS[i], [0.5, 0.6, -0.6], [-0.6, -0.6, -0.4]);
const THRUSTED: P = elbowsTo({ ...THRUSTS[4], px: 13.2, pz: R.pz - 8.3, rhx: 20, wEl: -19 }, [0.5, 0.6, -0.6], [-0.6, -0.6, -0.4]);
function censorStrike(): Motion {
  return {
    hit: KH,
    keys: [
      { at: 0, pose: {} },
      { at: CE_STRIKE.warn[0], pose: LEVELLED, ease: 'io' },
      { at: 0.4, pose: levelled(1), ease: 'io' },
      { at: 0.52, pose: levelled(2), ease: 'io' },
      { at: 0.65, pose: levelled(3), ease: 'io' },
      { at: CE_STRIKE.warn[1], pose: levelled(4), ease: 'io' },
      { at: KH - 4 / 30, pose: thrustAt(0), ease: 'in' },
      { at: KH - 3 / 30, pose: thrustAt(1), ease: 'lin' },
      { at: KH - 2 / 30, pose: thrustAt(2), ease: 'lin' },
      { at: KH - 1 / 30, pose: thrustAt(3), ease: 'lin' },
      { at: KH, pose: thrustAt(4), ease: 'lin' },
      { at: KH + 0.1, pose: THRUSTED, ease: 'out' },
      { at: CE_STRIKE.held, pose: { ...THRUSTED, pz: (THRUSTED.pz as number) + 0.3 }, ease: 'io' },
      { at: CE_STRIKE.back, pose: elbowsTo({ ...SPEAR, px: 2, pz: R.pz - 1.6, yaw: -8, twist: -4, pitch: 6, bend: 4, faceTurn: 8, rhIn: 1, rhx: 4, rhy: -10, rhz: -20, wAz: 0, wEl: 40 }, [0.5, 0.6, -0.6], [-0.4, -0.8, -0.4]), ease: 'io' },
      { at: CE_STRIKE.long, pose: {}, ease: 'io' },
    ],
  };
}
function censorStrikeFeet(): (t: number) => P {
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.08, t1: 0.26, to: plantBy(L0, 2, 0.5, -24), lift: 2.2 }, { t0: KH - 0.12, t1: KH - 0.01, to: plantBy(L0, 20, 1, -20), lift: 3.4 }, { t0: CE_STRIKE.held + 0.04, t1: CE_STRIKE.back + 0.06, to: plantBy(L0, 1, 0.5, -6), lift: 3 }, { t0: 1.8, t1: 2.08, to: L0, lift: 2 }] },
    R: { start: R0, moves: [{ t0: 0.12, t1: 0.28, to: plantBy(R0, -3, -1, -30), lift: 2 }, { t0: KH - 0.06, t1: KH + 0.04, to: { ...plantBy(R0, -3, -1, -30), pitch: 20 } }, { t0: CE_STRIKE.held + 0.08, t1: CE_STRIKE.back + 0.1, to: plantBy(R0, -1, -0.5, -8), lift: 2.4 }, { t0: 1.84, t1: 2.1, to: R0, lift: 2 }] },
  });
}
const strikeGlint = (t: number): number => glintOf(t, 0.12, CE_STRIKE.warn[0], KH);

// =============================================================================================
// THE HUSH

/** The Hush: how long; the warning (a finger to his mask, its bar burning pink); the silence let go (from `hit`), his hand swept out wide; back. */
export const CE_HUSH = { long: 2.6, warn: [0.3, 1.0], hit: 1.06, sweep: [1.06, 1.42], back: 2.1 } as const;
/** His left hand up before his mask, one finger to the inked bar; his head bowed a little over it; the brush upright. */
const FINGER: P = elbowsTo({ pz: R.pz + 0.4, pitch: 3, bend: 5, faceUp: -4, faceTurn: 0, faceTilt: 4, lhIn: 1, lhx: 10, lhy: -3, lhz: 6 }, [-0.1, 0.6, -0.8], null);
const finger = (k: number): P => ({ ...FINGER, faceTilt: (FINGER.faceTilt as number) + (k % 2 ? 3 : -2), pz: (FINGER.pz as number) + (k % 2 ? 0.3 : 0) });
/** The silence let go: his hand swept out wide to his left, palm down, his body drawn up tall, his head up. */
const SWEPT: P = elbowsTo({ px: -0.6, pz: R.pz + 1.4, pitch: -4, bend: -6, side: -1, faceUp: 12, faceTurn: 6, faceTilt: 0, lhIn: 1, lhx: 6, lhy: 22, lhz: 2 }, [-0.2, 0.9, -0.3], null);
function censorHush(): Motion {
  return {
    hit: CE_HUSH.hit,
    keys: [
      { at: 0, pose: {} },
      { at: CE_HUSH.warn[0], pose: FINGER, ease: 'io' },
      { at: 0.48, pose: finger(1), ease: 'io' },
      { at: 0.66, pose: finger(2), ease: 'io' },
      { at: 0.84, pose: finger(3), ease: 'io' },
      { at: CE_HUSH.warn[1], pose: finger(4), ease: 'io' },
      { at: CE_HUSH.sweep[1], pose: SWEPT, ease: 'out' },
      { at: 1.7, pose: { ...SWEPT, pz: (SWEPT.pz as number) - 0.2, lhz: 0, faceUp: 8 }, ease: 'io' },
      { at: CE_HUSH.back, pose: elbowsTo({ pz: R.pz, lhIn: 1, lhx: 9, lhy: 10, lhz: -14 }, [-0.3, 0.8, -0.5], null), ease: 'io' },
      { at: CE_HUSH.long, pose: {}, ease: 'io' },
    ],
  };
}
/** The finger raised to the mask, and the bar on it burning pink, through the warning and until he lets the silence go. */
const hushOf = (t: number): number => (t < CE_HUSH.warn[0] ? 0 : t < CE_HUSH.hit ? sm((t - CE_HUSH.warn[0]) / 0.3) : 1 - sm((t - CE_HUSH.hit) / 0.3));
const fingerOf = (t: number): number => (t > CE_HUSH.warn[0] - 0.12 && t < CE_HUSH.hit + 0.05 ? 1 : 0);

// =============================================================================================
// STRUCK

export const CE_REEL = 0.45;
function censorReel(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.06, pose: { px: -2.8, pz: R.pz + 0.4, pitch: -5, bend: -7, faceUp: R.faceUp + 24, faceTilt: R.faceTilt + 8, lhx: (R.lhx as number) - 2, lhz: (R.lhz as number) + 2, rhx: (R.rhx as number) - 2, wEl: (R.wEl as number) - 8, out: 0.1 }, ease: 'out' },
      { at: 0.2, pose: { px: -1.0, pitch: 3, bend: 5, faceUp: R.faceUp + 6, wEl: (R.wEl as number) + 3 }, ease: 'io' },
      { at: CE_REEL, pose: {}, ease: 'io' },
    ],
  };
}

// =============================================================================================
// HIS DEATH

export const CE_DIES = { long: 3.4, brush: 0.3, clutch: [0.4, 0.86], crack: [0.56, 0.96], halves: [1.0, 1.06], words: [0.6, 2.6], knees: 1.4, down: 2.5 } as const;
const DIE_FEET = ((): Record<'L' | 'R', Plant> => ({ L: plantBy(L0, R0.at[0] - L0.at[0] + 3, 0), R: R0 }))();
const TUCK = 56;
const KNEE_DOWN = B.legR[1] * 1.3;
const kneeling = (lean: number, body: P): P => kneelSettle(B, R, { ...kneelHips(B, R, DIE_FEET, TUCK, KNEE_DOWN, lean), ...body }, DIE_FEET, TUCK, KNEE_DOWN);
const HANG = -(B.upperArm + B.foreArm) * 0.9;
const HANGING: P = { lhIn: 0, lhx: 3, lhy: 9, lhz: HANG + 4, le: -10, rhIn: 0, rhx: 3, rhy: -9, rhz: HANG + 4, re: 10 };
/** Both hands at his mask, clutching. */
const CLUTCH: P = elbowsTo({ lhIn: 1, lhx: 14, lhy: -5, lhz: 6, rhIn: 1, rhx: 14, rhy: 5, rhz: 6 }, [0.2, 1, -0.5], [0.2, -1, -0.5]);
/** His arms laid on the floor where his body puts them: each hand `back` behind its shoulder and `out` to its side. */
function limp(body: P, back: number, out: number): P {
  const s = solve(B, { ...R, ...body, lhIn: 0, rhIn: 0 } as Posed);
  const at = (sh: V3, side: number): V3 => [sh[0] - back, sh[1] + side * out, 4.2];
  const Lh = at(s.shoulderL, 1);
  const Rh = at(s.shoulderR, -1);
  const q = { ...R, ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2] } as Posed;
  const le = elbowFor(B, q, true, norm([0, 1, 0.3]));
  const re = elbowFor(B, { ...q, le } as Posed, false, norm([0, -1, 0.3]));
  return { ...body, lhIn: 2, lhx: Lh[0], lhy: Lh[1], lhz: Lh[2], rhIn: 2, rhx: Rh[0], rhy: Rh[1], rhz: Rh[2], le, re };
}
const lifted2 = (p: P, dz: number): P => ({ ...p, pz: (p.pz as number) + dz });
const ON_KNEES: P = kneeling(6, { yaw: 0, pitch: 2, roll: 2, twist: 0, bend: 4, side: 1, faceTurn: 0, faceUp: 10, faceTilt: 8, ...HANGING });
const FOLD: P = kneeling(14, { yaw: 4, pitch: 28, roll: 3, twist: 0, bend: 22, side: 1, faceTurn: 8, faceUp: -24, faceTilt: 8, ...HANGING });
const SLUMP: P = limp(kneeling(30, { yaw: 6, pitch: 62, roll: 2, twist: 0, bend: 24, side: 0, faceTurn: 16, faceUp: -38, faceTilt: 14 }), 8, 11);
const PRONE: P = { ...limp(lifted2(kneeling(66, { yaw: 8, pitch: 80, roll: 6, twist: 0, bend: 8, side: 0, faceTurn: 34, faceUp: -30, faceTilt: 22 }), 2.4), 22, 10), out: 1 };
function censorDying(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.08, pose: { px: -2.8, pz: R.pz + 0.4, pitch: -5, bend: -7, faceUp: R.faceUp + 24, out: 0.15 }, ease: 'out' },
      { at: 0.3, pose: { px: -2.6, pz: R.pz + 0.6, pitch: -6, bend: -9, faceUp: 20, rhIn: 1, rhx: 6, rhy: -10, rhz: -18, out: 0.3 }, ease: 'io' },
      { at: CE_DIES.clutch[0] + 0.12, pose: { ...CLUTCH, px: -2.2, pz: R.pz + 0.8, pitch: -4, bend: 2, faceUp: 6, faceTilt: 6, out: 0.45 }, ease: 'out' },
      { at: CE_DIES.crack[1], pose: { ...CLUTCH, px: -2.0, pz: R.pz + 0.4, pitch: -8, bend: -10, faceUp: 28, faceTilt: -6, out: 0.8 }, ease: 'io' },
      { at: 1.16, pose: { px: -1.4, pz: R.pz - 0.6, pitch: -6, bend: -12, faceUp: 32, faceTilt: 0, lhIn: 1, lhx: 6, lhy: 8, lhz: -22, rhIn: 1, rhx: 6, rhy: -8, rhz: -22, out: 1 }, ease: 'in' },
      { at: 1.26, pose: { px: -0.6, pz: R.pz - 6.0, pitch: 2, bend: 2, faceUp: 14, lk: 26, rk: -26, ...HANGING, out: 1 }, ease: 'lin' },
      { at: CE_DIES.knees, pose: { ...ON_KNEES, out: 1 }, ease: 'out' },
      { at: 1.66, pose: { ...ON_KNEES, pz: (ON_KNEES.pz as number) + 0.6, pitch: -2, roll: -3, faceUp: 14, out: 1 }, ease: 'io' },
      { at: 1.94, pose: { ...ON_KNEES, pitch: 8, roll: 4, faceUp: -4, out: 1 }, ease: 'io' },
      { at: 2.16, pose: { ...FOLD, out: 1 }, ease: 'in' },
      { at: 2.32, pose: { ...SLUMP, out: 1 }, ease: 'lin' },
      { at: CE_DIES.down, pose: PRONE, ease: 'out' },
      { at: CE_DIES.long, pose: PRONE, ease: 'io' },
    ],
  };
}
function censorDyingFeet(): (t: number) => P {
  const F = DIE_FEET;
  return footwork(B, {
    L: { start: L0, moves: [{ t0: 0.04, t1: 0.26, to: F.L, lift: 2.4 }, { t0: 1.02, t1: 1.36, to: { ...F.L, pitch: TUCK } }] },
    R: { start: F.R, moves: [{ t0: 1.02, t1: 1.36, to: { ...F.R, pitch: TUCK } }] },
  });
}
/** THE WORDS GOING FREE as he dies: grains of the enemy's pink bursting out of the crack in his mask and out of his breast, going pale as they rise. */
const FREED = ['#7a7468', '#a49c8c', '#cec6b2', '#e8e2d2', '#f6f2e6'];
function wordsFree(out: [V3, string, number][], s: Skeleton, t: number): void {
  const [a, b] = CE_DIES.words;
  if (t < a || t > b) return;
  const pour = sm((t - a) / 0.25) * (1 - sm((t - (b - 0.6)) / 0.6));
  const N = Math.round(80 * pour);
  const from = [s.head, lerp3(s.ribs, s.neck, 0.4)];
  for (let i = 0; i < N; i++) {
    const life = fr(t * 0.75 + i / 80 + 0.19 * hash(i, 3, 8451));
    const o = from[i % 2];
    const ang = i * 2.39996;
    const r = (2 + 10 * hash(i, 4, 8451)) * (1 + 1.4 * life);
    const p: V3 = [o[0] + Math.cos(ang + life * 2) * r, o[1] + Math.sin(ang + life * 2) * r, o[2] + life * 60 + Math.sin(life * 9 + i) * 1.5];
    const pale = life > 0.6 - 0.4 * sm((t - a) / 1.4);
    out.push([p, pale ? FREED[life > 0.85 ? 4 : 3] : life < 0.25 ? FLAME[3] : FLAME[2], life < 0.4 ? 2 : 1]);
  }
}
/** INK FLYING OFF THE BRUSH as it is swung: black drops thrown from the bristles along the stroke. */
function inkFlung(out: [V3, string, number][], s: Skeleton, t: number, t0: number, t1: number): void {
  if (t < t0 || t > t1) return;
  const b = brushOf(s);
  const k = (t - t0) / (t1 - t0);
  for (let i = 0; i < 14; i++) {
    const u = hash(i, 1, 8461);
    const p = lerp3(b.belly, b.tip, u);
    const fly = (k * 0.8 + 0.2 * hash(i, 2, 8461)) * 14;
    out.push([[p[0] + (hash(i, 3, 8461) - 0.5) * fly, p[1] + (hash(i, 4, 8461) - 0.5) * fly, Math.max(0.5, p[2] - fly * 0.6 * hash(i, 5, 8461))], INK, i % 3 === 0 ? 2 : 1]);
  }
}

// =============================================================================================
// WHAT EACH MOVE TELLS HIS PAINTER

/** His moves' names, as the game holds them (a moment says which move it is of by its name). */
export const NAMES = { stand: 'The Censor stands, watching', walk: 'The Censor walks', attack: 'The brush slash', redact: 'Redaction', strike: 'Strike-Through', hush: 'The Hush', reel: 'The Censor is struck', dying: 'The Censor falls' } as const;
const KEY_OF = new Map<string, string>(Object.entries(NAMES).map(([k, v]) => [v, k]));
const keyOf = (m: Moment): string => (m.dying ? 'dying' : KEY_OF.get(m.move ?? '') ?? '');

function censorMob(): Mob {
  const paint = censorPainter({
    brush: (m) => !(m.dying && m.t >= CE_DIES.brush),
    leftOn: (m) => {
      const k = keyOf(m);
      return k === 'attack' || k === 'redact' || k === 'strike';
    },
    crack: (m) => (m.dying ? sm((m.t - CE_DIES.crack[0]) / (CE_DIES.crack[1] - CE_DIES.crack[0])) : 0),
    low: (m) => (m.dying ? sm((m.t - 1.1) / 0.4) : 0),
    hush: (m) => (keyOf(m) === 'hush' ? hushOf(m.t) : 0),
    finger: (m) => (keyOf(m) === 'hush' ? fingerOf(m.t) : 0),
    grains: (m, out) => {
      if (m.dying) wordsFree(out, m.s, m.t);
      const k = keyOf(m);
      if (k === 'attack') inkFlung(out, m.s, m.t, SH - 3 / 30, SH + 4 / 30);
      if (k === 'redact') inkFlung(out, m.s, m.t, XH - 2 / 30, CE_REDACT.floor + 3 / 30);
      if (k === 'strike') inkFlung(out, m.s, m.t, KH - 2 / 30, KH + 5 / 30);
    },
  });
  const mv = (name: string, motion: Motion, more: Partial<MobMove> = {}): MobMove => ({ name, motion, rest: R, ...more });
  return {
    id: 'censor',
    name: 'The Censor',
    size: 'a boss: the Silent Order\'s leader, tall and broad, half a head again over the Physician',
    build: B,
    stand: mv(NAMES.stand, censorStand()),
    attack: mv(NAMES.attack, censorSlash(), { feet: censorSlashFeet(), glint: slashGlint }),
    idleFrames: 32,
    idleFps: 10,
    walk: mv(NAMES.walk, censorWalk(), { period: CE_WALK.frames / CE_WALK.fps, ground: CE_PACE * TILE3 }),
    walkFrames: CE_WALK.frames,
    walkFps: CE_WALK.fps,
    pace: CE_PACE,
    more: {
      redact: mv(NAMES.redact, censorRedact(), { feet: censorRedactFeet(), glint: redactGlint }),
      strike: mv(NAMES.strike, censorStrike(), { feet: censorStrikeFeet(), glint: strikeGlint }),
      hush: mv(NAMES.hush, censorHush()),
    },
    reel: mv(NAMES.reel, censorReel(), { glint: (t) => (t < 0.3 ? 1 - t / 0.3 : 0) }),
    reelTime: CE_REEL,
    hit: SH,
    warn: CE_SLASH.warn[1] - CE_SLASH.warn[0],
    dieTime: CE_DIES.long,
    dying: mv(NAMES.dying, censorDying(), { feet: censorDyingFeet() }),
    aura: { x: CE_CANVAS.ax, y: CE_CANVAS.ay - 70, r: 84, color: '#ff3a78', a: 0.1 },
    shadow: 16,
    canvas: CE_CANVAS,
    trueBack: true,
    bits: paint.bits,
    grains: paint.grains,
    // (the brush falls behind him to his right; the mask's halves fall away to either side of him)
    fall(piece) {
      if (piece === 'brush') return { from: CE_DIES.brush, to: [-48, -22], spin: 20, lay: 'axis', hop: 1.4 };
      if (piece === 'maskL') return { from: CE_DIES.halves[0], to: [12, 40], spin: 160, lay: 'keep', hop: 2.4, rise: 6 };
      if (piece === 'maskR') return { from: CE_DIES.halves[1], to: [8, -40], spin: -150, lay: 'keep', hop: 2.2, rise: 5 };
      return null;
    },
  };
}
export const CENSOR = censorMob();
export function makeCensorArt(mob: Mob = CENSOR, pace = mob.pace): ActorArt {
  return { front: mobSet(mob, 'front', pace), back: mobSet(mob, 'back', pace) };
}

// =============================================================================================
// HIM AS THE CHECKS SEE HIM (art/boss_checks.ts)

const len3 = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
export function censorSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [rH, rK, rA] = B.legR;
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: rH * 1.08 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: Math.max(rK, rA) * 1.05 },
      { name: `foot${side}`, a: add(L ? s.heelL : s.heelR, [0, 0, 1.5]), b: add(L ? s.toeL : s.toeR, [0, 0, 1.5]), r: 1.7 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.3 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.36 },
    );
  }
  limbs.push({ name: 'neck', a: s.neck, b: lerp3(s.neck, s.head, 0.5), r: 2.8 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 1.2, B.headR[1] * 1.25, B.headR[2] * 1.15] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 2.0, B.ribHalf + 2.2, len3(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.8, B.waistHalf + 1.8, Math.max(3, len3(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 2.6, B.pelvisHalf + 2.8, B.waist * 0.75] },
  ];
  return { limbs, lumps };
}
/** The brush as the checks see it, while it is his. */
function brushThings(s: Skeleton): CheckThing[] {
  const b = brushOf(s);
  const pts: V3[] = [];
  for (let k = 0; k <= 8; k++) pts.push(lerp3(b.butt, b.root, k / 8));
  pts.push(b.belly, lerp3(b.belly, b.tip, 0.5), b.tip);
  return [{ name: 'brush', pts, r: 1.6, may: ['foreR', 'foreL'] }];
}
export const CE_SHAPE: BossShape = {
  body: censorSolids,
  // (what he strikes with: the brush's point, in his slash)
  tip: (move, _t, s) => (move === 'attack' ? brushOf(s).tip : null),
  things: (move, t, s) => (move === 'dying' && t >= CE_DIES.brush ? [] : brushThings(s)),
};
void clamp01;
void sub;
