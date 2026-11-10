// THE WARRIOR'S BATTLE AXE, STEP 2: HIS MOVES WITH IT (the art chat's helper, 9 Nov 2026; docs/mockups/warrior_weapons/README.md).
// A MOCK-UP BEHIND A SWITCH THAT IS OFF (art/warrior_up_weapons.ts WARRIOR_WEAPONS): nothing of the game imports this file
// (tests/warrior_weapons.test.ts holds it). The axe is HIS PICK of 9 Nov 2026: “B, the war axe” (two flared bits, a spike).
//
// On his own bones (moves3.ts KNIGHT_BODY) and his own stance (art/warrior_up_moves.ts WU_REST), every list 30 pictures a second,
// keys eased in and out, each blow by his rulebook's Movement 9: a big wind-up, HELD; the strike in one or two frames, smeared;
// a big wind-down. What he does with the axe (the main chat's board post of 8 Nov 2026, 06:35; his “All those are good”):
//   STANDING AND RUNNING   his own stand and run as the game has them (art/warrior_up_moves.ts: frame for frame his body and his
//                          legs), the axe in his hands in place of the sword: its edge down, both hands on the haft
//   CLEAVE (tap)           a wide cut through 150 degrees before him, right to left; a second tap cuts back, left to right
//   THE THROWN AXE (hold)  thrown flat, spinning, out along his aim and back to his hand: the throw, him braced and empty-handed
//                          while it flies, the catch. TWIN AXES (a talent): a second axe drawn from his back, both thrown,
//                          one each side of his aim, both caught, the second put away again
//   LEAPING CHOP (swipe)   a crouch, a leap up and over with the axe overhead, the chop as he lands, the ground struck
//
// HOW HE HOLDS IT, in every move: his LEFT hand at the butt, his RIGHT hand up the haft (a right-hander's grip, as his guard has
// it: art/warrior_up_weapons.ts GUARD_HEAVY), the two never changing places; in a throw his right hand alone, low on the grip.
// THE RULES THAT HOLD IN EVERY FRAME, FROM EVERY SIDE (the checks below, held by the test): his helm is seen; the working edge
// points down or toward the mark, never at his own head; both hands on the grip wherever the move has two on it; nothing of the
// axe through him.

import type { Light, Px, Sprite } from '../engine/px';
import type { AnimSet, Clip } from './actor_types';
import { lazyFrames, toSprite } from './kit';
import { CANVAS3 } from './skin';
import { KNIGHT_BODY, KNIGHT_RUN3, UNITS_PER_TILE } from './moves3';
import { add, bonesAt, cross, dot, heading, len, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Posed, Skeleton, V3 } from './skeleton';
import { easeOf } from './clip';
import { primDist } from '../dev/sculpt';
import { WU_SIDES, WU_SPIN, spun } from './warrior_up';
import type { WuAround, WuFrame, WuSide } from './warrior_up';
import { WU_REAR3, WU_REST, plantedFeet } from './warrior_up_moves';
import { GUARD_HEAVY, TAKES, armedThrough, handsOnHaft, inTake, leftHandOn, onTake, paintAlone, paintArmed, placedAlong, takePlace } from './warrior_up_weapons';
import type { ArmedFrame, Placed, WeaponTake } from './warrior_up_weapons';

const FR = 1 / 30;
const B = KNIGHT_BODY;
const D = Math.PI / 180;

/** HIS BATTLE AXE: take B, the war axe (his pick, 9 Nov 2026: “B, the war axe”). */
export const AXE: WeaponTake = TAKES.axeB;
/** Where his left hand holds it, along it: at the butt, its knob just out of his fist. */
const BUTT = leftHandOn(AXE);

/** HIS GUARD WITH THE AXE (step 1's, as he saw it: art/warrior_up_weapons.ts GUARD_HEAVY), on his own stance. */
export const AXE_REST: Bones = { ...WU_REST, ...GUARD_HEAVY, lhx: BUTT } as Bones;

// ---------------------------------------------------------------------------------------------
// A MOVE WITH THE AXE

/** A key of a move with the axe: his bones (skeleton.ts Key3), and what of the axe a key of his bones cannot say. */
export interface AxeKey extends Key3 {
  /** Where on the haft his right hand is, along it (the axe's X: 0 where his guard has it, less toward the butt). */
  grip?: number;
  /** A SECOND AXE in his left hand (Twin Axes): the way it points (as `heading` has it), how far it is rolled about that, and
   * where on its haft his left hand is. Between two keys that both have one it goes smoothly from the one to the other. */
  twin?: { az: number; el: number; roll: number; on: number };
}
/** What he has in his hands at a moment of a move. */
export interface Holding {
  /** His axe is in his hands (not thrown and in the air). */
  axe: boolean;
  /** The second axe is in his left hand (Twin Axes). */
  twin: boolean;
}
export interface AxeMove {
  name: string;
  rest: Bones;
  keys: readonly AxeKey[];
  /** The moment the blow lands, or the axe leaves his hand, or comes into it (seconds). */
  hit?: number;
  /** A move that is held: the moment its loop begins. */
  loop?: number;
  /** Where its end waits while a second tap may still come (as his Strike's: moves3.ts Move3.poise). */
  poise?: number;
  tail?: boolean;
  /** The frames in which the axe is drawn smeared (seconds, from and to, both counted). */
  smear?: readonly [number, number];
  /** What is in his hands at a moment (his axe, all through, if not given). */
  holding?: (t: number) => Holding;
  /** The game lifts him through the air for the first `until` seconds of it, `high` GAME pixels at the top (a leap). */
  arc?: { until: number; high: number };
}

function spanOf(m: AxeMove): { end: number; from: number | undefined } {
  const k = m.keys;
  return { end: k.length ? k[k.length - 1].at : 0, from: m.loop };
}
/** A moment of a move, a loop folded into its turn. */
function folded(m: AxeMove, t: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  let when = Math.max(0, t);
  if (from !== undefined && long > 1e-6 && when >= end) when = from + ((when - from) % long);
  return Math.min(end, when);
}
/** A moment `back` seconds before `t` (in a loop, before its beginning is before its end). */
function before(m: AxeMove, t: number, back: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : 0;
  let w = t - back;
  if (from !== undefined && long > 1e-6 && w < from) w += long;
  return Math.max(0, w);
}

/** Him at a moment of a move with the axe: his bones, and where the axe (and the second) is. */
export interface AxePosed {
  q: Posed;
  s: Skeleton;
  /** Where on the haft his right hand is. */
  rightOn: number;
  holding: Holding;
  /** Where his axe is (in his hands, whether or not it is there now). */
  placed: Placed;
  /** Where the second axe is, if a key about this moment has one. */
  twin: Placed | null;
}

/**
 * HIS POSE AT A MOMENT OF A MOVE. His bones go from key to key as every move's do (skeleton.ts bonesAt); the axe's own numbers
 * (`grip`, `twin`) go with them, eased the same. THE HEAD OF THE AXE NEVER FLIPS: the line across what he holds is measured from
 * straight up (skeleton.ts solve), which turns right over as the haft passes upright; here it is turned back, so that a key's
 * `wRoll` means the same on either side of upright and an edge that leads a swing over the top goes on leading it.
 */
export function axePosed(m: AxeMove, t: number): AxePosed {
  const when = folded(m, t);
  const keys = m.keys;
  const q = bonesAt(keys, m.rest, when);
  if (Math.cos(q.wEl * D) < 0) q.wRoll += 180;
  // (which two keys, and how far between them, as bonesAt has it)
  let i = 0;
  let k = 0;
  const n = keys.length;
  if (n >= 2) {
    if (when >= keys[n - 1].at) {
      i = n - 2;
      k = 1;
    } else if (when > keys[0].at) {
      while (i < n - 2 && when >= keys[i + 1].at) i++;
      const span = keys[i + 1].at - keys[i].at;
      k = easeOf(keys[i + 1].ease, span > 0 ? (when - keys[i].at) / span : 1);
    }
  }
  const a = keys[i];
  const z = keys[Math.min(n - 1, i + 1)];
  const rightOn = (a.grip ?? 0) + ((z.grip ?? 0) - (a.grip ?? 0)) * k;
  const s = solve(B, q);
  const placed = takePlace(AXE, B, s, q, rightOn);
  let twin: Placed | null = null;
  const ta = a.twin ?? z.twin;
  const tz = z.twin ?? a.twin;
  if (ta && tz) {
    const az = ta.az + (tz.az - ta.az) * k;
    const el = ta.el + (tz.el - ta.el) * k;
    const roll = ta.roll + (tz.roll - ta.roll) * k;
    const on = ta.on + (tz.on - ta.on) * k;
    const point = heading(az, el);
    twin = placedAlong(sub(s.handL, mul(point, on)), point, edgeOf(az, el, roll));
  }
  const holding = m.holding ? m.holding(when) : { axe: true, twin: false };
  return { q, s, rightOn, holding, placed, twin: holding.twin ? twin : null };
}
/** The way the edge of a thing faces that points along (`az`, `el`) and is rolled `roll` about that: as `solve` has what is held, never flipping. */
function edgeOf(az: number, el: number, roll: number): V3 {
  const p = heading(az, el);
  // (the line across it: straight up made square to it, turned the same way on either side of upright)
  const up: V3 = [-Math.sin(el * D) * Math.cos(az * D), -Math.sin(el * D) * Math.sin(az * D), Math.cos(el * D)];
  const c = Math.cos(roll * D);
  const sn = Math.sin(roll * D);
  return add(add(mul(up, c), mul(cross(p, up), sn)), mul(p, dot(p, up) * (1 - c)));
}

/** Whether a moment of a move is drawn smeared (its strike). */
export function axeSmeared(m: AxeMove, t: number): boolean {
  const w = m.smear;
  return !!w && t >= w[0] - 1e-6 && t <= w[1] + 1e-6;
}

/** Where the wind is (0..1) at a moment of a move (art/warrior_up_art.ts windOf's way). */
function windOf(m: AxeMove, t: number): number {
  const { end, from } = spanOf(m);
  const long = from !== undefined ? end - from : end;
  if (long <= 1e-6) return 0;
  const period = long / Math.max(1, Math.round(long / 1.2));
  const k = ((t - (from ?? 0)) / period) % 1;
  return k < 0 ? k + 1 : k;
}

/**
 * HIM AT A MOMENT OF A MOVE WITH THE AXE, painted from one of his eight sides: with the figure a frame and three frames before
 * (his cloth follows), the wind, and in a strike the axe's smear (where it has been over the last two frames).
 */
export function paintAxe(m: AxeMove, t: number, side: WuSide, rim: string | null | undefined = undefined): ArmedFrame {
  const p = axePosed(m, t);
  const around: WuAround = { prev: axePosed(m, before(m, t, FR)).s, past: axePosed(m, before(m, t, 3 * FR)).s, wind: windOf(m, t) };
  let trail: Placed[] | undefined;
  let trail2: Placed[] | undefined;
  if (axeSmeared(m, t)) {
    trail = [];
    trail2 = [];
    for (let i = 0; i <= 10; i++) {
      const was = axePosed(m, before(m, t, (2 * FR * i) / 10));
      // (only where it was in his hand: what has left it is the game's to draw)
      if (was.holding.axe) trail.push(was.placed);
      if (was.twin) trail2.push(was.twin);
    }
  }
  return paintArmed(AXE, p.s, p.q, side, B, around, rim === undefined ? undefined : rim, { rightOn: p.rightOn, empty: !p.holding.axe, second: p.twin, trail: p.holding.axe ? trail : undefined, trail2: p.twin ? trail2 : undefined });
}

// ---------------------------------------------------------------------------------------------
// STANDING AND RUNNING WITH IT: HIS OWN STAND AND RUN AS THE GAME HAS THEM (his word for the heroes, 7 Nov 2026: “Just make him
// move like he used to.”), every number of his body and his legs the game's; only his arms are the axe's, in place of the sword's.

/** A key of one of his own moves with his arms and what he holds made the axe's: `arms` gives them from the key's own. */
function withAxe(keys: readonly Key3[], arms: (pose: Partial<Bones>) => Partial<Bones>): AxeKey[] {
  return keys.map((k) => {
    const pose: Partial<Bones> = { ...k.pose };
    for (const f of ['rhIn', 'rhx', 'rhy', 'rhz', 'lhIn', 'lhx', 'lhy', 'lhz', 'le', 're', 'wAz', 'wEl', 'wRoll'] as const) delete pose[f];
    return { at: k.at, ease: k.ease, pose: { ...pose, ...arms(k.pose) } };
  });
}

/**
 * HIS GUARD WITH THE AXE, ALIVE (2 s, 60 pictures): his rear stance as the game has it alive (art/warrior_up_moves.ts WU_REAR3: he
 * breathes twice, his weight goes over onto his front foot and back, and once in the round his chin comes up, his eyes go to his
 * right and his hands roll on the grip), the head of the axe stirring behind him as the point of his sword does. His feet never move.
 */
export const AXE_STAND: AxeMove = {
  name: 'Battle axe: his guard, alive',
  rest: AXE_REST,
  loop: 0,
  keys: withAxe(WU_REAR3.motion.keys, (p) => {
    const R = WU_REST;
    const A = AXE_REST;
    const out: Partial<Bones> = {};
    // (what the stand does to his sword, done to the axe: the same stir of its head, a little less of it, the axe being heavier)
    if (p.wEl !== undefined) out.wEl = A.wEl + (p.wEl - R.wEl) * 0.8;
    if (p.wAz !== undefined) out.wAz = A.wAz + (p.wAz - R.wAz);
    if (p.wRoll !== undefined) out.wRoll = A.wRoll + (p.wRoll - R.wRoll);
    if (p.rhz !== undefined) out.rhz = A.rhz + (p.rhz - R.rhz);
    return out;
  }),
};

/** Where his right hand carries the axe as he runs, from his right shoulder (forward, to his left, up, as he faces): where his
 * guard has it from that shoulder, so that his arm lies across the haft as it does there and not along it. */
const RUN_HAND: V3 = [5, -5, -14];
/** The way the haft trails as he runs (more across him than his guard has it: his chest is less turned in his run, and his
 * left hand must reach the butt), and how far his right elbow is swung in toward him, so that his forearm lies across the haft. */
const RUN_AZ = -130;
const RUN_ELBOW = 30;
/**
 * RUNNING WITH THE AXE: THE GAME'S OWN RUN, frame for frame (moves3.ts KNIGHT_RUN3: its gait, stride, bob, lean; a turn in half a
 * second, played by the clock), the axe carried as his guard has it: both hands on the haft before his right hip, the head
 * trailing up behind his right shoulder, its edge down, riding with his steps as his sword does (swung a little with each arm's
 * swing, its head dipping and rising twice a turn).
 */
export const AXE_RUN: AxeMove = {
  name: 'Battle axe: he runs (the game\'s run)',
  rest: AXE_REST,
  loop: 0,
  keys: withAxe(KNIGHT_RUN3.motion.keys, (p) => ({
    rhIn: 1, rhx: RUN_HAND[0] + ((p.rhx ?? 6.2) - 6.2), rhy: RUN_HAND[1], rhz: RUN_HAND[2],
    lhIn: 3, lhx: BUTT, lhy: 0, lhz: 0,
    wAz: RUN_AZ + ((p.wAz ?? -160) + 160), wEl: 16 + ((p.wEl ?? -31) + 31) * 0.8, wRoll: 180,
    le: 12, re: RUN_ELBOW,
  })),
};

// ---------------------------------------------------------------------------------------------
// THE CHECKS (for the test and the pictures)

/** The way the working edge of the axe faces where it is: of its two bits, the one turned more down or toward the mark. */
export function workingEdge(pl: Placed): V3 {
  const y = pl.y;
  const score = (v: V3): number => Math.max(-v[2], v[0]);
  return score(y) >= score(mul(y, -1)) ? y : mul(y, -1);
}

/**
 * HOW MUCH OF HIS HELM IS SEEN in a frame: of the points of its skin that face the eye (its skull and its snout), the share the
 * picture shows (nothing of him, of the axe or of its smear nearer the eye there), and how many pixels of it that is.
 */
export function helmSeen(f: WuFrame): { share: number; shown: number; of: number } {
  const helm = f.sc.prims.filter((p) => p.piece === 'helm' || p.piece === 'visor');
  const st = f.drawn.st;
  const eye = spun(st.eye, -f.spin);
  const W = f.px.w;
  const H = f.px.h;
  const seenAt = new Set<number>();
  const facing = new Set<number>();
  for (const p of helm) {
    if (p.k !== 'ell') continue;
    const [a0, a1, a2] = p.axes;
    for (let i = 0; i < 24; i++) for (let j = 1; j < 12; j++) {
      const th = (i / 24) * Math.PI * 2;
      const ph = (j / 12) * Math.PI;
      const d: V3 = [Math.sin(ph) * Math.cos(th), Math.sin(ph) * Math.sin(th), Math.cos(ph)];
      const at = add(p.c, add(mul(a0, d[0]), add(mul(a1, d[1]), mul(a2, d[2]))));
      const nrm = norm(add(mul(a0, d[0] / dot(a0, a0)), add(mul(a1, d[1] / dot(a1, a1)), mul(a2, d[2] / dot(a2, a2)))));
      if (dot(nrm, eye) < 0.2) continue;
      // (a point of one of its solids that is inside another is not of its skin)
      if (helm.some((o) => o !== p && primDist(o, at) < -0.4)) continue;
      const P = spun(at, f.spin);
      const [x, y] = st.at(P);
      const xi = Math.round(x - 0.5);
      const yi = Math.round(y - 0.5);
      if (xi < 0 || yi < 0 || xi >= W || yi >= H) continue;
      const k = yi * W + xi;
      facing.add(k);
      if (f.drawn.stuff[k] === p.mat && f.drawn.z[k] <= st.near(P) + 2.2) seenAt.add(k);
    }
  }
  return { share: facing.size ? seenAt.size / facing.size : 0, shown: seenAt.size, of: facing.size };
}

/** What the checks find wrong with a frame of a move (nothing, if it is right): for the test and the peek. */
export function axeFaults(m: AxeMove, t: number, f: ArmedFrame, p: AxePosed = axePosed(m, t)): string[] {
  const out: string[] = [];
  const helm = helmSeen(f);
  if (helm.share < HELM_LEAST) out.push(`his helm ${Math.round(helm.share * 100)}% seen`);
  for (const th of armedThrough(f)) out.push(th);
  if (p.holding.axe) {
    const two = p.q.lhIn === 3 && !p.q.lh2;
    for (const h of handsOnHaft(f)) if (two || /right/.test(h)) out.push(h);
    const way = workingEdge(p.placed);
    const head = onTake(p.placed, [AXE.heart + 5, 0, 0]);
    if (Math.max(-way[2], way[0]) < EDGE_LEAST) out.push(`its edge neither down nor toward the mark (${way.map((v) => v.toFixed(2)).join(',')})`);
    const atHead = dot(way, norm(sub(p.s.head, head)));
    if (atHead > AT_HEAD_MOST) out.push(`its edge toward his head (${atHead.toFixed(2)})`);
  }
  return out;
}
/** The least of his helm that must be seen in every frame from every side (a share of what of it faces the eye). */
export const HELM_LEAST = 0.6;
/** The least the working edge points down, or toward the mark (a unit's part). */
export const EDGE_LEAST = 0.25;
/** The most the working edge may be turned toward his own head (the cosine of the angle between them). */
export const AT_HEAD_MOST = 0.5;

/** Every move with the axe, by a short name. */
export const AXE_MOVES: Record<string, AxeMove> = { stand: AXE_STAND, run: AXE_RUN };

export { FR as AXE_FRAME, UNITS_PER_TILE, WU_SIDES, WU_SPIN, CANVAS3, inTake, lerp3, len, paintAlone, plantedFeet, toSprite, lazyFrames };
export type { Light, Px, Sprite, AnimSet, Clip };
