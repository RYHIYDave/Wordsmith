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
//   LEAPING CHOP (swipe)   a crouch, a leap up and over with the axe laid back over his shoulder, the chop as he lands, the
//                          ground struck
//
// HOW HE HOLDS IT, in every move: his LEFT hand at the butt, his RIGHT hand up the haft (a right-hander's grip, as his guard has
// it: art/warrior_up_weapons.ts GUARD_HEAVY), the two never changing places; for a swing his right hand slides down the haft to
// his left, and back up after; in a throw his right hand alone, low on the grip. EACH FOREARM COMES TO THE HAFT ACROSS IT, never
// along it (`elbowed`): a forearm that lay along the haft would have it up its sleeve.
// THE RULES THAT HOLD IN EVERY FRAME, FROM EVERY SIDE (the checks below, held by the test): his helm is seen; the working edge
// points down or toward the mark, never at his own head; both hands on the grip wherever the move has two on it; nothing of the
// axe through him.

import type { Light, Px, Sprite } from '../engine/px';
import type { AnimSet, Clip } from './actor_types';
import { lazyFrames, toSprite } from './kit';
import { CANVAS3 } from './skin';
import { KNIGHT_BODY, KNIGHT_RUN3, UNITS_PER_TILE } from './moves3';
import { add, bonesAt, cross, dot, heading, len, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Posed, Skeleton, V3 } from './skeleton';
import { easeOf } from './clip';
import { Sculpt, draw, primDist } from '../dev/sculpt';
import { WU_RIM, WU_SIDES, spun } from './warrior_up';
import type { WuAround, WuFrame, WuSide } from './warrior_up';
import { WU_REAR3, WU_REST, backFoot, lightFeet, onToes, plantedFeet, skipFeet } from './warrior_up_moves';
import { GUARD_HEAVY, TAKES, WW_GLOW, armedThrough, handsOnHaft, inTake, layTake, leftHandOn, onTake, paintArmed, placedAlong, takePlace } from './warrior_up_weapons';
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
/** His guard with any of the heavy takes: the same, his left hand at that take's butt. */
export function heavyRest(take: WeaponTake): Bones {
  return { ...WU_REST, ...GUARD_HEAVY, lhx: leftHandOn(take) } as Bones;
}

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
  /** What he holds in it: his war axe, if not given (his maul's moves say so: art/warrior_up_hammer_moves.ts). */
  take?: WeaponTake;
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
  /** The game carries and lifts him through the air from `from` to `until` (seconds), `high` GAME pixels at the top (a leap). */
  arc?: { from: number; until: number; high: number };
  /** How far along his aim the game has carried him by a moment of the move (his own lengths): his cloth then streams as he
   * goes (the figure a frame and three frames before is drawn that much further back). His maul's Shoulder Charge. */
  carried?: (t: number) => number;
  /** His bones at a moment, where a move makes them otherwise than from its keys (the keys then give only its timing, the grip
   * and the second axe): his run's body and legs with a catch in his arms; the game's own struck, fall and town with a heavy
   * weapon in place of his sword (art/warrior_up_heavy_art.ts). */
  pose?: (t: number) => Posed;
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
  const q = m.pose ? m.pose(when) : bonesAt(keys, m.rest, when);
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
  const placed = takePlace(m.take ?? AXE, B, s, q, rightOn);
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

/** A figure moved `by` along the way it faces (every place of it; the ways its bones point are as they were). */
function shifted(s: Skeleton, by: number): Skeleton {
  const out = { ...s } as Record<string, unknown>;
  for (const [k, v] of Object.entries(s)) {
    if (k === 'point' || k === 'across' || k === 'poleL' || k === 'poleR') continue;
    if (Array.isArray(v) && v.length === 3 && typeof v[0] === 'number') out[k] = [v[0] + by, v[1], v[2]];
  }
  return out as unknown as Skeleton;
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
  // (the figure a frame and three frames before: where the game carries him, that much further back along his aim)
  const earlier = (back: number): Skeleton => {
    const w = before(m, t, back);
    const s = axePosed(m, w).s;
    const gone = m.carried ? m.carried(t) - m.carried(w) : 0;
    return Math.abs(gone) > 1e-6 ? shifted(s, -gone) : s;
  };
  const around: WuAround = { prev: earlier(FR), past: earlier(3 * FR), wind: windOf(m, t) };
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
  return paintArmed(m.take ?? AXE, p.s, p.q, side, B, around, rim === undefined ? undefined : rim, { rightOn: p.rightOn, empty: !p.holding.axe, second: p.twin, trail: p.holding.axe ? trail : undefined, trail2: p.twin ? trail2 : undefined });
}

// ---------------------------------------------------------------------------------------------
// STANDING AND RUNNING WITH IT: HIS OWN STAND AND RUN AS THE GAME HAS THEM (his word for the heroes, 7 Nov 2026: “Just make him
// move like he used to.”), every number of his body and his legs the game's; only his arms are the axe's, in place of the sword's.

/** A key of one of his own moves with his arms and what he holds made the axe's: `arms` gives them from the key's own (and
 * which key it is). */
export function withAxe(keys: readonly Key3[], arms: (pose: Partial<Bones>, i: number) => Partial<Bones>): AxeKey[] {
  return keys.map((k, i) => {
    const pose: Partial<Bones> = { ...k.pose };
    for (const f of ['rhIn', 'rhx', 'rhy', 'rhz', 'lhIn', 'lhx', 'lhy', 'lhz', 'le', 're', 'wAz', 'wEl', 'wRoll'] as const) delete pose[f];
    return { at: k.at, ease: k.ease, pose: { ...pose, ...arms(k.pose, i) } };
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
// WHAT A KEY SAYS OF THE AXE

/** The war axe has two bits, one each side of its haft: turned half round about its haft it is the same axe. */
const TWO_BITS = true;
const DOWN: V3 = [0, 0, -1];
/** How far apart his two fists are on the grip when his right hand has slid down to his left (one above the other). */
const FISTS = 6;
/** What a key holds the axe as: his bones, and where on the haft his right hand is. */
export interface Held {
  pose: Partial<Bones>;
  grip: number;
  roll: number;
}
/** How nearly along the haft a forearm may lie (the cosine of the angle between them) before the haft is in its sleeve. */
const ALONG = 0.22;

/**
 * WHAT MAKES A MOVE'S KEYS WITH A HEAVY WEAPON (his war axe here; his maul: art/warrior_up_hammer_moves.ts): for a take and his
 * guard with it (`rest`), how a key lays it (`aim`), holds it in both hands (`hold`) or in his right alone (`one`), with each
 * elbow where its forearm comes to the haft across it (`elbowed`). `twoBits`: a head that is the same turned half round about
 * its haft (the war axe's two bits), so that either side of it may be the working one.
 */
export function heavyKit(take: WeaponTake, rest: Bones, twoBits: boolean) {
  /** Where his left hand holds it, along it: at the butt, its knob just out of his fist. */
  const BUTT = leftHandOn(take);
  /** Where on the haft his right hand is when it has slid down to his left for a swing. */
  const SLID = BUTT + FISTS;
  /**
   * The three numbers of a key that lay the axe along (`az`, `el`) with its working edge turned as nearly toward `edge` as an
   * edge square to its haft can be (`wAz`, `wEl`, `wRoll`): `near`, the roll of the key before, so that it goes the short way round.
   */
  function aim(az: number, el: number, edge: V3, near = 180): { wAz: number; wEl: number; wRoll: number } {
    const p = heading(az, el);
    const up: V3 = [-Math.sin(el * D) * Math.cos(az * D), -Math.sin(el * D) * Math.sin(az * D), Math.cos(el * D)];
    const side = cross(p, up);
    const e = norm(sub(edge, mul(p, dot(edge, p))), up);
    let roll = Math.atan2(dot(e, side), dot(e, up)) / D;
    // (THE WAR AXE HAS TWO BITS: either may be the working edge, so the head is never spun half round to bring the other to it)
    const turn = twoBits ? 180 : 360;
    while (roll - near > turn / 2) roll -= turn;
    while (roll - near < -turn / 2) roll += turn;
    return { wAz: az, wEl: el, wRoll: roll };
  }
  /**
   * A key with its two elbows swung to where each forearm lies most nearly square to the haft (the right: square to it, the haft
   * running on past that fist both ways; the left, at the butt: anywhere but toward the head), and no further from where an
   * elbow hangs by nature than that needs.
   */
  function elbowed(pose: Partial<Bones>): Partial<Bones> {
    const cost = (q: Posed, left: boolean): number => {
      const s = solve(B, q);
      const fore = norm(sub(left ? s.elbowL : s.elbowR, left ? s.handL : s.handR));
      const c = dot(fore, s.point);
      const along = left ? Math.max(0, c - ALONG) : Math.max(0, Math.abs(c) - ALONG);
      const swing = left ? q.le : q.re;
      return along * 10 + Math.abs(left ? s.swungL : s.swungR) * 0.004 + Math.abs(swing) * 0.0012;
    };
    const out: Partial<Bones> = { ...pose };
    for (const left of [false, true]) {
      // (a left hand that is not on the haft: its elbow as the key has it)
      if (left && pose.lhIn !== 3) continue;
      let best = Infinity;
      let at = 0;
      for (let a = -170; a <= 180; a += 10) {
        const q = { ...rest, ...out, ...(left ? { le: a } : { re: a }) } as Posed;
        const c = cost(q, left);
        if (c < best - 1e-9) {
          best = c;
          at = a;
        }
      }
      if (left) out.le = at;
      else out.re = at;
    }
    return out;
  }
  /**
   * HOW A KEY HOLDS THE AXE IN BOTH HANDS: his body as the key has it (`body`), his LEFT hand, at the butt, put at `butt` (from the
   * middle of his hips, as his chest is turned: forward, to his left, up), the haft laid from it along (`az`, `el`) as he faces,
   * its working edge turned toward `edge`; his right hand is then where the haft has it, `grip` along it (0 where his guard has
   * it, up the grip; `SLID` when it has slid down to his left for a swing). And HIS ELBOWS ARE SET SO THAT EACH FOREARM COMES TO
   * THE HAFT ACROSS IT, NOT ALONG IT (`elbowed`): a forearm that lay along the haft would have it up its sleeve.
   */
  function hold(body: Partial<Bones>, butt: V3, az: number, el: number, edge: V3, near = 180, grip = 0): Held {
    const q = { ...rest, ...body } as Posed;
    const s = solve(B, q);
    const turn = (q.yaw + q.twist) * D;
    const fwd: V3 = [Math.cos(turn), Math.sin(turn), 0];
    const left: V3 = [-Math.sin(turn), Math.cos(turn), 0];
    const L = add(s.pelvis, add(mul(fwd, butt[0]), add(mul(left, butt[1]), [0, 0, butt[2]])));
    const R = add(L, mul(heading(az, el), grip - BUTT));
    const a = aim(az, el, edge, near);
    return { pose: elbowed({ ...body, rhIn: 2, rhx: R[0], rhy: R[1], rhz: R[2], lhIn: 3, lhx: BUTT - grip, lhy: 0, lhz: 0, ...a }), grip, roll: a.wRoll };
  }
  /**
   * FOR WHOEVER MAKES A MOVE (tools only): how well a hold sits: how far each arm is stretched (1 = straight), the angle of each
   * forearm to the haft, how far the solver had to move a hand or an elbow out of his body; and, searched `span` about `butt`,
   * the place for his left hand that sits best. Nothing of the moves calls it.
   */
  function holdFit(body: Partial<Bones>, butt: V3, az: number, el: number, grip = 0, span = 4): { butt: V3; cost: number; said: string } {
    const reach = B.upperArm + B.foreArm;
    const measure = (bt: V3): { cost: number; said: string } => {
      const h = hold(body, bt, az, el, DOWN, 180, grip);
      const q = { ...rest, ...h.pose } as Posed;
      const s = solve(B, q);
      const rR = len(sub(s.handR, s.shoulderR)) / reach;
      const rL = len(sub(s.handL, s.shoulderL)) / reach;
      const aR = Math.acos(Math.max(-1, Math.min(1, dot(norm(sub(s.elbowR, s.handR)), s.point)))) / D;
      const aL = Math.acos(Math.max(-1, Math.min(1, dot(norm(sub(s.elbowL, s.handL)), s.point)))) / D;
      const want: V3 = [q.rhx, q.rhy, q.rhz];
      const moved = len(sub(s.handR, want));
      const cost = 10 * Math.max(0, rR - 0.86) + 10 * Math.max(0, rL - 0.86) + Math.max(0, Math.abs(aR - 90) - 18) * 0.1 + Math.max(0, 72 - aL) * 0.1 + moved * 2 + (Math.abs(s.swungR) + Math.abs(s.swungL)) * 0.02 + 0.03 * len(sub(bt, butt));
      return { cost, said: `reach R ${rR.toFixed(2)} L ${rL.toFixed(2)}, forearms to the haft R ${aR.toFixed(0)} L ${aL.toFixed(0)}, moved ${moved.toFixed(1)}, swung ${s.swungR.toFixed(0)},${s.swungL.toFixed(0)}, re ${q.re} le ${q.le}` };
    };
    let best = { butt, ...measure(butt) };
    for (let dx = -span; dx <= span; dx += 2) for (let dy = -span; dy <= span; dy += 2) for (let dz = -span; dz <= span; dz += 2) {
      const bt: V3 = [butt[0] + dx, butt[1] + dy, butt[2] + dz];
      const m = measure(bt);
      if (m.cost < best.cost - 1e-9) best = { butt: bt, ...m };
    }
    return best;
  }
  /** A key that holds it in his right hand alone: his hand from his right shoulder (forward, to his left, up, as he faces),
   * the haft along (`az`, `el`), his left arm as `left` has it; his right elbow where his forearm lies across the haft. */
  function one(body: Partial<Bones>, hand: V3, az: number, el: number, edge: V3, near: number, left: Partial<Bones>, grip: number): Held {
    const a = aim(az, el, edge, near);
    return { pose: elbowed({ ...body, rhIn: 1, rhx: hand[0], rhy: hand[1], rhz: hand[2], ...left, ...a }), grip, roll: a.wRoll };
  }
  const key = (frame: number, h: Held, ease?: Key3['ease'], more: Partial<Bones> = {}): AxeKey => ({ at: frame * FR, pose: { ...h.pose, ...more }, grip: h.grip, ease });
  return { BUTT, SLID, aim, elbowed, hold, holdFit, one, key };
}
/** The war axe's own. */
const KIT = heavyKit(AXE, AXE_REST, TWO_BITS);
const { SLID, aim, elbowed, key } = KIT;
export const hold = KIT.hold;
export const holdFit = KIT.holdFit;

// ---------------------------------------------------------------------------------------------
// CLEAVE (his tap with the axe), BY MOVEMENT 9. Beside his Strike: its wind-up and its reach (the blow at 10 frames, 0.333 s;
// 1.7 tiles), but A WIDE CUT THROUGH 150 DEGREES BEFORE HIM.

/** Cleave's blow, both cuts: the rules' moment (as his Strike's: art/warrior_up_moves.ts WU_STRIKE_HIT). */
export const AXE_CLEAVE_HIT = 10 * FR;
/** Where the first cut waits, the axe low on his left, while the second may still come (the game's `poise`). */
export const AXE_CLEAVE_POISE = 21 * FR;
/** The held wind-up of each cut: from, to (frames). The strike is the two frames from its end to the blow. */
export const AXE_CLEAVE_HELD: readonly [number, number] = [6, 8];
/** How wide the cut is before him (degrees, half to each side of his aim), and how far it reaches (tiles): for the rules. */
export const AXE_CLEAVE_ARC = 150;
export const AXE_CLEAVE_REACH = 1.7;

/** The axe low on his left after the first cut, all of him turned and sunk after it: where it waits, and where the second begins. */
function axeLow(near = 180): Held {
  return hold({ ...plantedFeet(), px: 4.6, pz: -9.4, yaw: 50, pitch: 13, twist: 48, bend: 22, faceUp: -4, faceTurn: 30 }, [5, -6, 9], 125, -28, DOWN, near, SLID);
}

/**
 * THE FIRST CUT, RIGHT TO LEFT, DOWN ACROSS HIM. A skip-step in as the game's step carries him (both feet off the floor, 0 to 2),
 * the axe coming up as he goes; the WIND-UP: sunk on his back leg, wound round away, side-on to the mark, THE AXE LIFTED HIGH, its
 * haft upright before his right shoulder and its head right over him, ITS EDGE TOWARD THE MARK (6); HELD (6 to 8: it cocks a
 * little further back). THE STRIKE, two frames: his hips whip round, his hands drop to his hip, his right hand sliding down the
 * haft to his left, and the axe comes down and round (9: out to his right, coming down; 10, the blow: across the front of him
 * at the height of a hip, his weight driven onto his front foot); a freeze (11). THE WIND-DOWN, big: THE AXE CARRIED ON ROUND AND
 * LOW to his left, its head down by the floor at his left side, all of him turned and sunk after it (20); it waits there (21,
 * `poise`: the second cut begins from here); then swung back low across the front of him and up behind his right shoulder
 * into his guard, his right hand sliding back up the haft (36).
 */
function cleaveAcross(): AxeKey[] {
  const P = plantedFeet();
  const coil: Partial<Bones> = { ...P, ...backFoot(0, -8), lk: (P.lk as number) - 10, rk: 14, px: -2.4, pz: -7.2, yaw: -52, pitch: 0, twist: -40, bend: 2, faceUp: 0, faceTurn: 4, faceTilt: 0 };
  const mid: Partial<Bones> = { ...P, px: 2.0, pz: -6.2, yaw: -10, pitch: 7, twist: -46, bend: 11, faceUp: -2 };
  const blow: Partial<Bones> = { ...P, px: 4.4, pz: -6.9, yaw: 30, pitch: 10, twist: 16, bend: 13, faceUp: -4 };
  const k1 = hold({ ...lightFeet(), px: -0.3, pz: -4.2, yaw: -44, twist: -32, bend: 6 }, [11, -3, 8], -162, 36, DOWN, 180);
  const k2 = hold({ ...skipFeet(), px: -0.8, pz: -4.8, yaw: -47, twist: -35, bend: 5 }, [10, -7, 9], -162, 56, DOWN, k1.roll);
  const k6 = hold(coil, [11, -4, 14], -160, 80, [1, 0, 0], k2.roll);
  const k8 = hold({ ...coil, pz: -7.6, yaw: -54, twist: -42, bend: 1 }, [11, -4, 14], -160, 73, [1, 0, 0.2], k6.roll);
  const k9 = hold(mid, [10, -1, 4], -75, 15, norm([0.6, 0.6, -0.5]), k8.roll, -2.5);
  const k10 = hold(blow, [11, -2, 3], 20, -6, norm([-0.2, 1, -0.4]), k9.roll, SLID);
  const k11 = hold({ ...blow, px: 4.6, pz: -7.1, yaw: 33, twist: 20 }, [11, -2, 5], 45, -8, norm([-0.4, 1, -0.4]), k10.roll, SLID);
  const k20 = axeLow(k11.roll);
  const k28 = hold({ ...P, px: 1.6, pz: -5.6, yaw: -14, pitch: 8, twist: -4, bend: 14, faceUp: -2 }, [11, -2, 5], -30, -10, DOWN, k20.roll, SLID);
  const k32 = hold({ ...P, px: 0.8, pz: -4.6, yaw: -28, pitch: 6, twist: -18, bend: 10, faceUp: -1 }, [10, -4, 6], -100, 4, DOWN, k28.roll, -2);
  return [
    { at: 0, pose: {} },
    // (the skip-step: both feet off the floor at once while the game carries him; the axe begun on its way up)
    key(1, k1, 'out'),
    key(2, k2, 'in'),
    // THE WIND-UP, reached and HELD
    key(6, k6, 'out'),
    key(8, k8, 'io'),
    // THE STRIKE: the hips round first, the chest still back, the axe coming down out to his right ...
    key(9, k9, 'in'),
    // ... and the blow: across the front of him, his weight driven onto his front foot
    key(10, k10, 'lin'),
    // (the blow lands with a freeze: his rulebook's Movement 7)
    key(11, k11, 'out'),
    // THE WIND-DOWN: carried on round and low to his left, all of him after it
    key(20, k20, 'io'),
    key(21, k20, 'io', { pz: -9.7, bend: 23 }),
    // (no second cut: swung back low across the front of him, and up behind his right shoulder into his guard)
    key(28, k28, 'io'),
    key(32, k32, 'in'),
    { at: 36 * FR, pose: { wRoll: Math.round((k32.roll - 180) / 360) * 360 + 180 }, ease: 'out' },
  ];
}
export const AXE_CLEAVE: AxeMove = { name: 'Cleave, the cut across (Movement 9)', rest: AXE_REST, keys: cleaveAcross(), hit: AXE_CLEAVE_HIT, poise: AXE_CLEAVE_POISE, tail: true, smear: [9 * FR, 11 * FR] };

/**
 * THE SECOND CUT, BACK ACROSS HIM, LEFT TO RIGHT (a second tap, while the first waits low on his left: as his Strike's second
 * swing follows its first). A skip-step in (0 to 2), the axe coming up on his left; the WIND-UP: THE AXE LIFTED HIGH before his
 * left shoulder, its haft upright and its head over him, ITS EDGE TOWARD THE MARK, all of him wound round to his left (6); HELD (6
 * to 8). THE STRIKE, two frames: his hips whip back round to his right and the axe comes down and across the other way (9: out
 * to his left, coming down; 10, the blow: across the front of him); a freeze (11). THE WIND-DOWN: carried on round to his right
 * and back, low (18), and up behind his right shoulder into his guard, where this cut ends of itself (27).
 */
function cleaveBack(): AxeKey[] {
  const P = plantedFeet();
  const low = axeLow();
  const from: AxeKey = key(0, low, undefined, { pz: -9.7, bend: 23 });
  const coil: Partial<Bones> = { ...P, px: 4.4, pz: -7.6, yaw: 50, pitch: 4, twist: 46, bend: 6, faceUp: 0, faceTurn: 30 };
  const k1 = hold({ ...lightFeet(), px: 4.5, pz: -8.2, yaw: 50, pitch: 10, twist: 48, bend: 17, faceTurn: 30 }, [6, -3, 10], 135, 4, DOWN, low.roll, SLID);
  const k2 = hold({ ...skipFeet(), px: 4.4, pz: -7.8, yaw: 50, pitch: 7, twist: 47, bend: 12, faceTurn: 30 }, [8, 0, 12], 150, 40, DOWN, k1.roll, SLID);
  const k6 = hold(coil, [9, 4, 14], 160, 80, [1, 0, 0], k2.roll, SLID);
  const k8 = hold({ ...coil, pz: -8.0, yaw: 52, twist: 48, bend: 5 }, [9, 4, 14], 160, 73, [1, 0, 0.2], k6.roll, SLID);
  const k9 = hold({ ...P, px: 3.4, pz: -6.6, yaw: 14, pitch: 8, twist: 40, bend: 12, faceUp: -2, faceTurn: 10 }, [10, -3, 4], 75, 15, norm([0.6, -0.6, -0.5]), k8.roll, SLID);
  const k10 = hold({ ...P, px: 1.6, pz: -6.6, yaw: -18, pitch: 9, twist: -12, bend: 13, faceUp: -4 }, [9, 0, 5], -20, -6, norm([-0.2, -1, -0.4]), k9.roll, SLID);
  const k11 = hold({ ...P, px: 1.4, pz: -6.8, yaw: -22, pitch: 9, twist: -16, bend: 13, faceUp: -4 }, [9, 2, 5], -45, -8, norm([-0.4, -1, -0.4]), k10.roll, SLID);
  const k18 = hold({ ...P, px: 0.4, pz: -5.4, yaw: -36, pitch: 5, twist: -30, bend: 8, faceUp: -1 }, [8, -4, 6], -125, 0, DOWN, k11.roll, -2);
  return [
    from,
    key(1, k1, 'out'),
    key(2, k2, 'in'),
    // THE WIND-UP, reached and HELD
    key(6, k6, 'out'),
    key(8, k8, 'io'),
    // THE STRIKE
    key(9, k9, 'in'),
    key(10, k10, 'lin'),
    // (the freeze on the blow)
    key(11, k11, 'out'),
    // THE WIND-DOWN: on round to his right and back, low, and up into his guard
    key(18, k18, 'io'),
    { at: 27 * FR, pose: { wRoll: Math.round((k18.roll - 180) / 360) * 360 + 180 }, ease: 'io' },
  ];
}
export const AXE_CLEAVE2: AxeMove = { name: 'Cleave, the cut back (Movement 9)', rest: AXE_REST, keys: cleaveBack(), hit: AXE_CLEAVE_HIT, tail: true, smear: [9 * FR, 11 * FR] };

// ---------------------------------------------------------------------------------------------
// THE THROWN AXE (his hold with the axe): thrown flat and spinning out along his aim, and back to his hand. Three lists: THE
// THROW (to where he stands braced and empty-handed), BRACED (a loop, for as long as it flies), THE CATCH (and back to his guard).

/** The moment the axe leaves his hand (the rules' moment: as long a wind-up as his tap's, and a frame for the throw's sweep). */
export const AXE_THROW_OUT = 11 * FR;
/** The held wind-up of the throw: from, to (frames). */
export const AXE_THROW_HELD: readonly [number, number] = [6, 9];
/** Where on the haft his right hand throws and catches it: low on the grip, a fist's width above the butt. */
const THROW_GRIP = -6.4;
/** HOW IT FLIES, for the game (which draws it: `axeFlying`): out along his aim to `far` tiles from him and back in `time`
 * seconds, slowing as it turns; from where his hand lets it go (`from` tiles before him) to where his hand takes it (`to`),
 * `high` game pixels above the floor all the way; turning flat once in `turn` seconds; striking what comes within `wide`
 * tiles of it, once on the way out and once on the way back. (Measured on his frames: his hand at the throw's last frame, and
 * at the catch's first.) */
export const AXE_FLIGHT = { far: 6, time: 1.0, from: 0.8, to: 0.4, high: 19, turn: 0.4, wide: 0.6 } as const;
/** Where the thrown axe is at `t` seconds of its flight: how far from him along his aim, in tiles. */
export function axeFlightAt(t: number): number {
  const k = Math.max(0, Math.min(1, t / AXE_FLIGHT.time));
  const base = AXE_FLIGHT.from + (AXE_FLIGHT.to - AXE_FLIGHT.from) * k;
  const mid = (AXE_FLIGHT.from + AXE_FLIGHT.to) / 2;
  return base + (AXE_FLIGHT.far - mid) * Math.sin(Math.PI * k);
}
/** Leaping Chop: where the axe strikes the floor, in tiles before where his feet come down (the far end of its head, on his
 * frames); the crack and the dust are the game's, there. */
export const AXE_CHOP_STRIKE = 1.5;

/** A key that holds the axe in his right hand alone (the kit's `one`), low on the grip if not said. */
export function one(body: Partial<Bones>, hand: V3, az: number, el: number, edge: V3, near: number, left: Partial<Bones>, grip = THROW_GRIP): Held {
  return KIT.one(body, hand, az, el, edge, near, left, grip);
}
/** His left arm free: his hand from his left shoulder (forward, to his left, up, as he faces), and how far its elbow is swung. */
const free = (x: number, y: number, z: number, le = 0): Partial<Bones> => ({ lhIn: 1, lhx: x, lhy: y, lhz: z, le });

/** His feet and body wound round to throw, sunk on his back leg. */
function throwCoil(): Partial<Bones> {
  const P = plantedFeet();
  return { ...P, ...backFoot(0, -8), lk: (P.lk as number) - 10, rk: 14, px: -2.6, pz: -7.0, yaw: -56, pitch: -2, twist: -42, bend: 0, faceUp: 0, faceTurn: 6, faceTilt: 0 };
}
/** HOW HE STANDS BRACED, EMPTY-HANDED, WHILE IT FLIES: low and square on both feet, his right hand out before him for it,
 * open, his left arm out and low for his balance, his eyes on the axe. */
function braced(): Partial<Bones> {
  const P = plantedFeet();
  return { ...P, ...backFoot(0, -8), lk: (P.lk as number) - 6, rk: 4, px: 1.0, pz: -7.2, yaw: -16, pitch: 6, twist: -4, bend: 8, faceUp: 1, faceTurn: 0, faceTilt: 0, rhIn: 1, rhx: 13.5, rhy: 3, rhz: -3, re: -20, ...free(8, 8, -12, -10), wAz: -80, wEl: 4, wRoll: 90 };
}

/**
 * THE THROW. His left hand leaves the haft and goes out toward the mark; his right draws the axe BACK BEHIND HIS RIGHT SHOULDER,
 * its head up behind him and its edge down, all of him wound round after it and sunk on his back leg (6); HELD (6 to 9). THE
 * THROW, two frames, smeared: his hips whip round and his arm comes through level, the axe laid flat and trailing (10), and is
 * whipped on round his hand and LET GO, flat and spinning (11: the moment it leaves). His arm carries on across him, empty
 * (14); and he comes up square and braced, his hand out before him for it (20).
 */
function throwOut(): AxeKey[] {
  const P = plantedFeet();
  const coil = throwCoil();
  const k3 = one({ ...lightFeet(), ...P, px: -1.4, pz: -5.4, yaw: -48, twist: -36, bend: 4 }, [-3, -12, -1], -166, 24, DOWN, 180, free(11, 2, -6, 0), -3);
  const k6 = one(coil, [-7, -6, 6], -170, 30, DOWN, k3.roll, free(16, 3, 1, 0));
  const k9 = one({ ...coil, pz: -7.5, yaw: -58, twist: -44, bend: -2 }, [-8, -6, 7], -170, 35, DOWN, k6.roll, free(16.5, 3, 2, 0));
  const k10 = one({ ...P, px: 2.0, pz: -6.2, yaw: -10, pitch: 6, twist: -44, bend: 8, faceUp: -2 }, [5, -14, 2], -150, 4, norm([0.5, -0.87, 0]), k9.roll, free(13, 7, -2, 0));
  const k11 = one({ ...P, px: 4.4, pz: -6.9, yaw: 30, pitch: 10, twist: 16, bend: 10, faceUp: -2 }, [17, 6, -2], 100, 0, norm([1, 0.1, 0]), k10.roll, free(3, 10, -8, 0));
  const B0 = braced();
  return [
    { at: 0, pose: {} },
    key(3, k3, 'io'),
    // THE WIND-UP, reached and HELD
    key(6, k6, 'out'),
    key(9, k9, 'io'),
    // THE THROW: his arm through level, the axe flat and trailing ... and whipped on round, and let go
    key(10, k10, 'in'),
    key(11, k11, 'lin'),
    // (his arm carries on across him, empty; his left arm back for his balance)
    { at: 14 * FR, pose: { ...P, px: 5.0, pz: -7.6, yaw: 38, pitch: 12, twist: 26, bend: 14, faceUp: -2, rhIn: 1, rhx: 9, rhy: 15, rhz: -9, re: 0, ...free(-7, 7, -11, 0), wAz: 150, wEl: -10, wRoll: k11.roll }, ease: 'out' },
    // (and he comes up square and braced, his hand out for it)
    { at: 20 * FR, pose: B0, ease: 'io' },
  ];
}
export const AXE_THROW: AxeMove = { name: 'The thrown axe: the throw', rest: AXE_REST, keys: throwOut(), hit: AXE_THROW_OUT, smear: [10 * FR, 11 * FR], holding: (t) => ({ axe: t <= AXE_THROW_OUT + 1e-6, twin: false }) };

/**
 * BRACED, WHILE IT FLIES (1 s, 30 pictures, a loop): empty-handed, low and square, alive: he breathes, his weight goes over
 * onto his front foot and back, and his hand out before him reaches and gives as he follows the axe with his eyes.
 */
function bracedAlive(): AxeKey[] {
  const R = braced() as Bones;
  return [
    { at: 0, pose: R },
    { at: 8 * FR, pose: { ...R, px: R.px + 0.9, pz: R.pz - 0.5, bend: R.bend + 1.6, rhx: R.rhx + 1.2, rhz: R.rhz + 0.6, lhz: R.lhz - 0.6, faceUp: R.faceUp + 2 }, ease: 'io' },
    { at: 16 * FR, pose: { ...R, px: R.px + 0.4, pz: R.pz + 0.1, bend: R.bend + 0.4, yaw: R.yaw + 2, twist: R.twist - 2, rhx: R.rhx + 0.3, rhy: R.rhy - 0.8, faceUp: R.faceUp + 3 }, ease: 'io' },
    { at: 23 * FR, pose: { ...R, px: R.px - 0.5, pz: R.pz - 0.6, bend: R.bend + 1.8, rhx: R.rhx + 1.5, rhz: R.rhz + 0.9, lhy: R.lhy + 0.8, faceUp: R.faceUp + 1 }, ease: 'io' },
    { at: 30 * FR, pose: R, ease: 'io' },
  ];
}
export const AXE_BRACED: AxeMove = { name: 'The thrown axe: braced while it flies', rest: AXE_REST, keys: bracedAlive(), loop: 0, holding: () => ({ axe: false, twin: false }) };

/** The moment of the catch in its list (its first picture: the axe is in his hand). */
export const AXE_CATCH_AT = 0;
/**
 * THE CATCH. IT SMACKS INTO HIS HAND, held out before him (0), and HIS ARM IS CARRIED BACK BY IT: round his right side and up
 * behind his shoulder, all of him rocked back onto his back leg after it (1 to 3, smeared), where its weight is held a moment
 * (4 to 6); his left hand comes to the butt, his right slides up the haft, and it is brought down into his guard (18).
 */
function catchIt(): AxeKey[] {
  const P = plantedFeet();
  const B0 = braced();
  const coil = throwCoil();
  const c0 = one({ ...B0, px: 0.6, pz: -7.4, bend: 9 }, [15, 2, -2], -80, 5, norm([1, 0.1, 0]), 90, free(8, 8, -12, -10));
  const c1 = one({ ...P, ...backFoot(0, -8), rk: 8, px: -1.0, pz: -7.0, yaw: -32, pitch: 2, twist: -24, bend: 4 }, [6, -13, 1], -128, 10, norm([0.7, -0.6, -0.3]), c0.roll, free(10, 8, -9, -10));
  const c3 = one({ ...coil, px: -3.4, pz: -7.8, pitch: -4, bend: -3 }, [-7, -6, 6], -168, 26, DOWN, c1.roll, free(13, 5, -4, 0));
  const c6 = one({ ...coil, px: -3.0, pz: -7.4, pitch: -3, bend: -1 }, [-7, -6, 6], -170, 30, DOWN, c3.roll, free(12, 4, -6, 0));
  const c12 = hold({ ...P, ...backFoot(0, -8), rk: 4, px: -1.2, pz: -5.0, yaw: -46, pitch: 2, twist: -34, bend: 4 }, [10, -4, 9], -164, 28, DOWN, c6.roll, -3);
  return [
    key(0, c0),
    key(1, c1, 'lin'),
    key(3, c3, 'out'),
    key(6, c6, 'io'),
    key(12, c12, 'io'),
    { at: 18 * FR, pose: { wRoll: Math.round((c12.roll - 180) / 360) * 360 + 180 }, ease: 'io' },
  ];
}
export const AXE_CATCH: AxeMove = { name: 'The thrown axe: the catch', rest: AXE_REST, keys: catchIt(), hit: AXE_CATCH_AT, smear: [1 * FR, 3 * FR] };

// ---------------------------------------------------------------------------------------------
// TWIN AXES (a talent makes his thrown axe two: “two thrown, one each side of his aim”). WHAT IS DRAWN: A SECOND AXE, THE SAME,
// DRAWN FROM HIS BACK over his left shoulder by his left hand as he winds up (it is first seen in his hand there), both thrown
// at once, one from each hand; both caught, his own in his right hand and then the second in his left; and THE SECOND PUT AWAY
// again over his left shoulder (last seen in his hand there), his left hand coming back to the butt of his own. Between whiles
// it is not seen on him. The same three lists as the one axe's: the throw, braced, the catch.

/** How far to each side of his aim the two fly (degrees): for the game, which draws them (`axeFlying`). */
export const AXE_TWIN_SPREAD = 14;
/** The catch of the second, in the catch's list (frames after his own is caught). */
export const AXE_TWIN_CATCH = 3;

/** The second axe as a key has it, in his left hand: the mirror of what his right does with his own (`az`, `el`, its edge), and
 * his left arm (its elbow where his forearm lies across that haft). */
function mirrored(pose: Partial<Bones>, hand: V3, az: number, el: number, edge: V3, near: number): { pose: Partial<Bones>; twin: NonNullable<AxeKey['twin']> } {
  const a = aim(-az, el, [edge[0], -edge[1], edge[2]], near);
  const point = heading(-az, el);
  let best = Infinity;
  let le = 0;
  for (let e = -170; e <= 180; e += 10) {
    const q = { ...AXE_REST, ...pose, lhIn: 1, lhx: hand[0], lhy: -hand[1], lhz: hand[2], le: e } as Posed;
    const sk = solve(B, q);
    const c = Math.max(0, Math.abs(dot(norm(sub(sk.elbowL, sk.handL)), point)) - ALONG) * 10 + Math.abs(sk.swungL) * 0.004 + Math.abs(e) * 0.0012;
    if (c < best - 1e-9) {
      best = c;
      le = e;
    }
  }
  return { pose: { ...pose, lhIn: 1, lhx: hand[0], lhy: -hand[1], lhz: hand[2], le }, twin: { az: -az, el, roll: a.wRoll, on: THROW_GRIP } };
}
/** A key of Twin Axes: his body, his right hand and his own axe (as `one`), his left hand and the second its mirror. */
function both(frame: number, body: Partial<Bones>, hand: V3, az: number, el: number, edge: V3, near: readonly [number, number], ease?: Key3['ease']): AxeKey & { rolls: readonly [number, number] } {
  const r = one(body, hand, az, el, edge, near[0], {});
  const l = mirrored(r.pose, hand, az, el, edge, near[1]);
  return { at: frame * FR, pose: l.pose, grip: r.grip, twin: l.twin, ease, rolls: [r.roll, l.twin.roll] };
}
/** How he stands braced for two: square, both hands out before him. */
function bracedTwo(): Partial<Bones> {
  return { ...braced(), yaw: -14, twist: 6, rhx: 13, rhy: -1.5, rhz: -3, re: -20, ...free(13, 1.5, -3, 20) };
}

/**
 * TWIN AXES, THE THROW. His left hand leaves the haft and goes up over his left shoulder to his back (3), and comes away with
 * the second axe; BOTH ARE DRAWN BACK, one behind each shoulder, their heads up behind him and their edges down, his chest
 * thrown out and his back arched between them (6); HELD (6 to 9). THE THROW, two frames, smeared: both arms come through level
 * at once (10), and both are LET GO, flat and spinning, one each side of his aim (11: the moment they leave). His arms carry
 * on down before him, empty (14); and he comes up square and braced, both hands out for them (20).
 */
function twinOut(): AxeKey[] {
  const P = plantedFeet();
  const wind: Partial<Bones> = { ...P, ...backFoot(0, -8), lk: (P.lk as number) - 6, rk: 6, px: -1.6, pz: -7.4, yaw: -14, pitch: -6, twist: 6, bend: -8, faceUp: 2, faceTurn: 0, faceTilt: 0 };
  // (his left hand gone up over his shoulder to his back for the second, his right drawing his own back)
  const k3 = both(3, { ...P, px: -0.8, pz: -5.6, yaw: -24, twist: -8, pitch: 0, bend: 0 }, [-3, -12, -1], -166, 24, DOWN, [180, 180], 'io');
  k3.grip = -3;
  const k6 = both(6, wind, [-2, -14, 3], -160, 12, DOWN, k3.rolls, 'out');
  const k9 = both(9, { ...wind, pz: -7.9, pitch: -7, bend: -10 }, [-3, -14, 4], -160, 16, DOWN, k6.rolls, 'io');
  const k10 = both(10, { ...P, px: 2.2, pz: -6.4, yaw: -10, pitch: 6, twist: 4, bend: 6, faceUp: -2 }, [4, -13, 2], -140, 4, norm([0.6, -0.8, 0]), k9.rolls, 'in');
  const k11 = both(11, { ...P, px: 5, pz: -7.2, yaw: -8, pitch: 12, twist: 4, bend: 16, faceUp: -4 }, [16, -4, -2], -72, 0, norm([1, -0.3, 0]), k10.rolls, 'lin');
  return [
    { at: 0, pose: {} },
    k3,
    // THE WIND-UP, reached and HELD: one behind each shoulder
    k6,
    k9,
    // THE THROW: both arms through level ... and both let go
    k10,
    k11,
    // (his arms carry on down before him, empty)
    { at: 14 * FR, pose: { ...P, px: 5.4, pz: -8.0, yaw: -8, pitch: 14, twist: 4, bend: 20, faceUp: -2, rhIn: 1, rhx: 12, rhy: 2, rhz: -13, re: 0, ...free(12, -2, -13, 0), wAz: -60, wEl: -10, wRoll: k11.rolls[0] }, ease: 'out' },
    // (and he comes up square and braced, both hands out for them)
    { at: 20 * FR, pose: bracedTwo(), ease: 'io' },
  ];
}
export const AXE_TWIN_THROW: AxeMove = {
  name: 'Twin Axes: the throw', rest: AXE_REST, keys: twinOut(), hit: AXE_THROW_OUT, smear: [10 * FR, 11 * FR],
  holding: (t) => ({ axe: t <= AXE_THROW_OUT + 1e-6, twin: t >= 4 * FR - 1e-6 && t <= AXE_THROW_OUT + 1e-6 }),
};

/** BRACED FOR TWO, WHILE THEY FLY (1 s, 30 pictures, a loop): as for the one, both hands out before him. */
function bracedTwoAlive(): AxeKey[] {
  const R = bracedTwo() as Bones;
  return [
    { at: 0, pose: R },
    { at: 8 * FR, pose: { ...R, px: R.px + 0.9, pz: R.pz - 0.5, bend: R.bend + 1.6, rhx: R.rhx + 1.2, rhz: R.rhz + 0.6, lhx: R.lhx + 0.8, lhz: R.lhz + 0.4, faceUp: R.faceUp + 2 }, ease: 'io' },
    { at: 16 * FR, pose: { ...R, px: R.px + 0.4, pz: R.pz + 0.1, bend: R.bend + 0.4, rhx: R.rhx + 0.3, rhy: R.rhy - 0.8, lhy: R.lhy + 0.8, faceUp: R.faceUp + 3 }, ease: 'io' },
    { at: 23 * FR, pose: { ...R, px: R.px - 0.5, pz: R.pz - 0.6, bend: R.bend + 1.8, rhx: R.rhx + 1.5, rhz: R.rhz + 0.9, lhx: R.lhx + 1.3, lhz: R.lhz + 0.7, faceUp: R.faceUp + 1 }, ease: 'io' },
    { at: 30 * FR, pose: R, ease: 'io' },
  ];
}
export const AXE_TWIN_BRACED: AxeMove = { name: 'Twin Axes: braced while they fly', rest: AXE_REST, keys: bracedTwoAlive(), loop: 0, holding: () => ({ axe: false, twin: false }) };

/**
 * TWIN AXES, THE CATCH. His own smacks into his right hand (0) and carries that arm back round his right side (1 to 3); the
 * second into his left (3) and carries that arm back round his left (4 to 6): both behind his shoulders, he rocked back
 * between them (6), held a moment (8). His left hand goes on up over his left shoulder and PUTS THE SECOND AWAY on his back
 * (11: last seen there), and comes down to the butt of his own as it is brought into his guard (22).
 */
function twinCatch(): AxeKey[] {
  const P = plantedFeet();
  const B0 = bracedTwo();
  const back: Partial<Bones> = { ...P, ...backFoot(0, -8), lk: (P.lk as number) - 6, rk: 6, px: -3.0, pz: -7.6, yaw: -16, pitch: -6, twist: 6, bend: -8, faceUp: 2, faceTurn: 0 };
  // (his own, caught; his left hand still out for the second)
  const c0 = one({ ...B0, px: 0.6, pz: -7.4, bend: 9 }, [15, -2, -2], -80, 5, norm([1, 0.1, 0]), 90, free(13, 1.5, -3, 20));
  const c1 = one({ ...B0, px: 0.0, pz: -7.2, yaw: -18, bend: 6 }, [6, -13, 1], -128, 10, norm([0.7, -0.6, -0.3]), c0.roll, free(14, 2, -2.5, 20));
  // (the second, caught as his own goes back behind his right shoulder)
  const c3r = one({ ...B0, px: -1.0, pz: -7.2, yaw: -18, pitch: 2, bend: 2 }, [-2, -14, 3], -160, 10, DOWN, c1.roll, {});
  const c3l = mirrored(c3r.pose, [15, -2, -2], -80, 5, norm([1, 0.1, 0]), 90);
  const c3: AxeKey = { at: AXE_TWIN_CATCH * FR, pose: c3l.pose, grip: c3r.grip, twin: c3l.twin, ease: 'out' };
  const c4l = mirrored(one({ ...B0, px: -1.6, pz: -7.3, yaw: -17, pitch: 0, bend: -1 }, [-2, -14, 3], -160, 12, DOWN, c3r.roll, {}).pose, [6, -13, 1], -128, 10, norm([0.7, -0.6, -0.3]), c3l.twin.roll);
  const c4: AxeKey = { at: 4 * FR, pose: c4l.pose, grip: THROW_GRIP, twin: c4l.twin, ease: 'lin' };
  const c6 = both(6, back, [-2, -14, 3], -160, 12, DOWN, [c3r.roll, c4l.twin.roll], 'out');
  const c8 = both(8, { ...back, px: -2.8, pz: -7.3, bend: -7 }, [-3, -14, 4], -160, 16, DOWN, c6.rolls, 'io');
  // (the second put away: his left hand back over his shoulder to his back with it, where it is last seen)
  const c11 = both(11, { ...P, ...backFoot(0, -8), rk: 6, px: -2.2, pz: -6.4, yaw: -30, pitch: -2, twist: -12, bend: -2 }, [-3, -14, 3], -160, 14, DOWN, c8.rolls, 'io');
  const c17 = hold({ ...P, ...backFoot(0, -8), rk: 4, px: -1.2, pz: -5.0, yaw: -46, pitch: 2, twist: -34, bend: 4 }, [10, -4, 9], -164, 28, DOWN, c11.rolls[0], -3);
  return [
    key(0, c0),
    key(1, c1, 'lin'),
    c3,
    c4,
    c6,
    c8,
    c11,
    key(17, c17, 'io'),
    { at: 22 * FR, pose: { wRoll: Math.round((c17.roll - 180) / 360) * 360 + 180 }, ease: 'io' },
  ];
}
export const AXE_TWIN_CATCH_MOVE: AxeMove = {
  name: 'Twin Axes: the catch', rest: AXE_REST, keys: twinCatch(), hit: AXE_CATCH_AT, smear: [1 * FR, 6 * FR],
  holding: (t) => ({ axe: true, twin: t >= AXE_TWIN_CATCH * FR - 1e-6 && t <= 11 * FR + 1e-6 }),
};

// ---------------------------------------------------------------------------------------------
// LEAPING CHOP (his swipe with the axe). Beside his Lunge: its range (6 tiles) and its landing (1.6 tiles round), the half
// second in the air; but A CROUCH FIRST, HELD, and a leap UP AND OVER, the axe overhead, the chop coming down as he lands.

/** Leaping Chop's beats, in frames: the crouch (held from `CHOP_HELD` to the leap), the leap's first and last (the game carries
 * and lifts him between them: the last is the blow, as his feet come down), the end. */
export const AXE_CHOP_HELD = 3;
export const AXE_CHOP_LEAP = 5;
export const AXE_CHOP_LAND = 20;
export const AXE_CHOP_END = 42;
/** How high the game lifts him at the top of the leap (GAME pixels: the game's own leap's, render/wild.ts LEAP_LIFT). */
export const AXE_CHOP_HIGH = 40;

/**
 * LEAPING CHOP, all of it. THE CROUCH: he sinks deep over his feet, the axe gathered low at his hip (3), HELD (3 to 5). THE
 * LEAP (5 to 20, half a second: the game carries him along and lifts him): he drives up off both feet, the axe swept up
 * before his right shoulder (7); his knees come up under him and THE AXE IS LAID BACK OVER HIS RIGHT SHOULDER, his hands by
 * his right ear, his elbows out (10: never over or before his helm, which hands held over his head hide from behind); at the
 * top he hangs, arched and wound to his right, the axe laid right back, his chin down and his eyes on the spot (13); he comes
 * down reaching for the floor with his front foot, the axe still back (17), coming upright past his ear (18); and THE CHOP,
 * two frames, smeared: over (19) and DOWN INTO THE FLOOR as his feet land, his right hand slid down the haft, all his weight
 * on it (20, the blow). A freeze,
 * sunk over it (23). THE WIND-DOWN, heavy: he wrenches it out of the floor and comes up (28), swings it low round his right
 * side as his front foot comes home (33, 38), and is in his guard (42).
 */
function leapingChop(): AxeKey[] {
  const R = AXE_REST;
  const stood: Partial<Bones> = { lfx: R.lfx, lfy: R.lfy, lfz: 0, lfp: 0, lft: R.lft, lk: R.lk, rfx: R.rfx, rfy: R.rfy, rfz: 0, rfp: 0, rft: R.rft, rk: R.rk };
  const crouch: Partial<Bones> = { ...stood, px: -1.5, pz: -11.5, yaw: -36, pitch: 14, twist: -28, bend: 16, faceUp: 8 };
  const landed: Partial<Bones> = { lfx: 22, lfy: 0.5, lfz: 0, lfp: 0, lft: 2, lk: 2, rfx: -12, rfy: -1, rfp: 44, rfz: onToes(44), rft: -10, rk: -4 };
  const k3 = hold(crouch, [9, -3, 6], -150, 6, DOWN, 180);
  const k5 = hold({ ...crouch, pz: -12.4, bend: 18, pitch: 15 }, [9, -3, 6], -152, 3, DOWN, k3.roll);
  // (driving up: his heels off the floor, the axe on its way up)
  const k6 = hold({ ...stood, lfp: 24, lfz: onToes(24), rfp: 30, rfz: onToes(30), px: 0.2, pz: -6, yaw: -28, pitch: 13, twist: -20, bend: 10, faceUp: 6 }, [10, -3, 10], -156, 36, DOWN, k5.roll);
  // (up off both feet, his legs thrown straight, the axe swept up before his right shoulder)
  const k7 = hold({ px: 2, pz: 0.5, yaw: -20, pitch: 12, twist: -12, bend: 4, faceUp: 4, lfx: 6, lfy: 0.5, lfz: 2, lfp: 30, lft: 4, lk: 4, rfx: -10, rfy: -1.5, rfz: 1.5, rfp: 40, rft: -20, rk: -8 }, [7, -11, 12], -170, 50, DOWN, k6.roll);
  // (two moments of the way up, so that the haft goes round his right shoulder and not through it)
  const k8 = hold({ px: 1, pz: 1.5, yaw: -16, pitch: 7, twist: -13, bend: 0, faceUp: 1, lfx: 7, lfy: 0.5, lfz: 4, lfp: 25, lft: 4, lk: 4, rfx: -9, rfy: -1.2, rfz: 5, rfp: 45, rft: -15, rk: -7 }, [8, -11, 17], -172, 40, DOWN, k7.roll);
  const k9 = hold({ px: 0.4, pz: 1.8, yaw: -13, pitch: 4, twist: -14, bend: -2, faceUp: -1, lfx: 7.6, lfy: 0.5, lfz: 5.2, lfp: 22, lft: 4, lk: 4, rfx: -8.4, rfy: -1.1, rfz: 7, rfp: 48, rft: -12, rk: -6 }, [6, -10, 18], -168, 46, DOWN, k8.roll);
  // (his knees coming up, the axe laid back over his right shoulder: his hands by his right ear, never before his helm)
  const k10 = hold({ px: 0, pz: 2, yaw: -12, pitch: 2, twist: -14, bend: -4, faceUp: -2, lfx: 8, lfy: 0.5, lfz: 6, lfp: 20, lft: 4, lk: 4, rfx: -8, rfy: -1, rfz: 8, rfp: 50, rft: -10, rk: -6 }, [5, -9, 19], -168, 45, DOWN, k9.roll);
  // (the top: tucked, arched and wound to his right, the axe laid right back behind his shoulder, his chin down, his eyes on the spot)
  const k13 = hold({ px: 0, pz: 3, yaw: -16, pitch: -4, twist: -22, bend: -10, faceUp: -8, lfx: 10, lfy: 0.5, lfz: 12, lfp: 10, lft: 4, lk: 6, rfx: -6, rfy: -1, rfz: 13, rfp: 60, rft: -8, rk: -8 }, [4, -9, 20], -172, 18, DOWN, k10.roll);
  // (coming down, reaching for the floor, the axe still back)
  const k17 = hold({ px: 2, pz: 1, yaw: -12, pitch: 2, twist: -16, bend: -6, faceUp: -12, lfx: 16, lfy: 0.5, lfz: 5, lfp: -10, lft: 3, lk: 4, rfx: -8, rfy: -1, rfz: 8, rfp: 40, rft: -8, rk: -6 }, [5, -9, 19], -170, 30, DOWN, k13.roll);
  // (the axe coming upright past his right ear as his front foot reaches the floor)
  const k18 = hold({ px: 3.5, pz: -1, yaw: -8, pitch: 8, twist: -12, bend: 0, faceUp: -16, lfx: 18, lfy: 0.5, lfz: 3, lfp: -9, lft: 2, lk: 3, rfx: -9, rfy: -1, rfz: 6, rfp: 35, rft: -9, rk: -5 }, [8, -9, 17], -160, 75, DOWN, k17.roll, -2);
  // THE CHOP: up and over past his right ear ... and down into the floor as his feet land
  const k19 = hold({ px: 5, pz: -3, yaw: -4, pitch: 14, twist: -8, bend: 6, faceUp: -20, lfx: 20, lfy: 0.5, lfz: 1.5, lfp: -8, lft: 2, lk: 3, rfx: -10, rfy: -1, rfz: 4, rfp: 30, rft: -10, rk: -5 }, [11, -7, 12], -6, 45, [1, 0, -0.6], k18.roll, SLID);
  const low: Partial<Bones> = { ...landed, px: 9, pz: -13.5, yaw: 4, pitch: 26, twist: 2, bend: 30, faceUp: -34 };
  const k20 = hold(low, [11, 0, -2], 0, -22, [0.3, 0, -1], k19.roll, SLID);
  const k23 = hold({ ...low, pz: -14.6, bend: 33, pitch: 27 }, [11, 0, -3], 0, -24, [0.3, 0, -1], k20.roll, SLID);
  // THE WIND-DOWN
  const k28 = hold({ ...landed, px: 6, pz: -9, yaw: -6, pitch: 16, twist: -6, bend: 18, faceUp: -16 }, [11, -1, 4], -8, -4, DOWN, k23.roll, SLID);
  const k33 = hold({ ...landed, lfx: 20, lfz: 2.6, lfp: -6, lft: 4, px: 3, pz: -6, yaw: -24, pitch: 8, twist: -16, bend: 10, faceUp: -6 }, [10, -3, 5], -70, 2, DOWN, k28.roll, -3);
  const k38 = hold({ lfx: R.lfx, lfy: R.lfy, lfz: 0, lfp: 0, lft: R.lft, lk: R.lk, rfx: -14, rfy: -1.2, rfz: 2.2, rfp: 6, rft: -40, rk: -30, px: 1, pz: -4.6, yaw: -34, pitch: 5, twist: -26, bend: 8, faceUp: -2 }, [9, -4, 7], -130, 10, DOWN, k33.roll, -1);
  return [
    { at: 0, pose: {} },
    // THE CROUCH, reached and HELD
    key(AXE_CHOP_HELD, k3, 'out'),
    key(AXE_CHOP_LEAP, k5, 'io'),
    // THE LEAP
    key(6, k6, 'in'),
    key(7, k7, 'out'),
    key(8, k8, 'lin'),
    key(9, k9, 'lin'),
    key(10, k10, 'lin'),
    key(13, k13, 'io'),
    key(17, k17, 'io'),
    key(18, k18, 'in'),
    key(19, k19, 'lin'),
    key(AXE_CHOP_LAND, k20, 'lin'),
    // (the blow lands with a freeze, sunk over it)
    key(23, k23, 'out'),
    key(28, k28, 'io'),
    key(33, k33, 'io'),
    key(38, k38, 'lin'),
    { at: AXE_CHOP_END * FR, pose: { wRoll: Math.round((k38.roll - 180) / 360) * 360 + 180 }, ease: 'out' },
  ];
}
export const AXE_CHOP: AxeMove = {
  name: 'Leaping Chop (Movement 9)', rest: AXE_REST, keys: leapingChop(), hit: AXE_CHOP_LAND * FR,
  smear: [19 * FR, 21 * FR], arc: { from: AXE_CHOP_LEAP * FR, until: AXE_CHOP_LAND * FR, high: AXE_CHOP_HIGH },
};

// ---------------------------------------------------------------------------------------------
// THE CHECKS (for the test and the pictures)

/** The way the working edge of the axe faces where it is: of its two bits, the one turned more down or toward the mark. (His
 * maul has one striking face: its way.) */
export function workingEdge(pl: Placed, take: WeaponTake = AXE): V3 {
  const y = pl.y;
  if (take.kind === 'hammer') return y;
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
  const take = m.take ?? AXE;
  // (an axe's edge, a hammer's striking face)
  const edge = take.kind === 'hammer' ? 'face' : 'edge';
  const helm = helmSeen(f);
  if (helm.share < HELM_LEAST) out.push(`his helm ${Math.round(helm.share * 100)}% seen`);
  for (const th of armedThrough(f)) out.push(th);
  // (on his back, in town: nothing of his hands or its way to hold to)
  if (p.holding.axe && !(p.q.stow > 0.5)) {
    const two = p.q.lhIn === 3 && !p.q.lh2;
    for (const h of handsOnHaft(f)) if (two || /right/.test(h)) out.push(h);
    const way = workingEdge(p.placed, take);
    const head = onTake(p.placed, [take.heart + 5, 0, 0]);
    if (Math.max(-way[2], way[0]) < EDGE_LEAST) out.push(`its ${edge} neither down nor toward the mark (${way.map((v) => v.toFixed(2)).join(',')})`);
    const atHead = dot(way, norm(sub(p.s.head, head)));
    if (atHead > AT_HEAD_MOST) out.push(`its ${edge} toward his head (${atHead.toFixed(2)})`);
  }
  if (p.twin) {
    // (the second axe: his left hand on its grip, its edge as his own's)
    const w = inTake(p.twin, p.s.handL);
    if (Math.hypot(w[1], w[2]) > 1.6 || w[0] < take.butt + 1 || w[0] > take.grip[1] + 1.5) out.push('his left hand off the second axe');
    const way = workingEdge(p.twin, take);
    if (Math.max(-way[2], way[0]) < EDGE_LEAST) out.push(`the second's edge neither down nor toward the mark (${way.map((v) => v.toFixed(2)).join(',')})`);
    const atHead = dot(way, norm(sub(p.s.head, onTake(p.twin, [take.heart + 5, 0, 0]))));
    if (atHead > AT_HEAD_MOST) out.push(`the second's edge toward his head (${atHead.toFixed(2)})`);
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
export const AXE_MOVES: Record<string, AxeMove> = {
  stand: AXE_STAND, run: AXE_RUN, cleave: AXE_CLEAVE, cleave2: AXE_CLEAVE2, throw: AXE_THROW, braced: AXE_BRACED, catch: AXE_CATCH,
  twin: AXE_TWIN_THROW, twinBraced: AXE_TWIN_BRACED, twinCatch: AXE_TWIN_CATCH_MOVE, chop: AXE_CHOP,
};

// ---------------------------------------------------------------------------------------------
// WHILE THE AXE FLIES HE MAY MOVE (his word, 9 Nov 2026, 22:37: “Yes he can move.  Yes leaping chop can”): HIS RUN EMPTY-HANDED,
// AND THE CATCH ON THE RUN (and Twin Axes' the same). Standing, he waits braced (AXE_BRACED, AXE_TWIN_BRACED).

/** What of his bones are his arms and what he holds (the rest are his body and his legs). */
const ARM_FIELDS = ['rhIn', 'rhx', 'rhy', 'rhz', 'lhIn', 'lhx', 'lhy', 'lhz', 'le', 're', 'wAz', 'wEl', 'wRoll', 'lh2', 'rh2', 'mixK', 'from', 'to'] as const;
/** His arms from one pose, his body and legs from another. */
export function armsOn(body: Posed, arms: Posed): Posed {
  const out: Record<string, unknown> = { ...body };
  const a = arms as unknown as Record<string, unknown>;
  // (the two keys a hand is carried between, where it goes from one thing to another: the arms' own, only while it does)
  const mixing = a.lh2 !== undefined || a.rh2 !== undefined;
  for (const f of ARM_FIELDS) {
    const v = (f === 'from' || f === 'to') && !mixing ? undefined : a[f];
    if (v === undefined) delete out[f];
    else out[f] = v;
  }
  return out as unknown as Posed;
}
/** His run as the game has it, at a moment (a loop: its body and legs). */
const runAt = (t: number): Posed => bonesAt(AXE_RUN.keys, AXE_REST, ((t % RUN_TURN) + RUN_TURN) % RUN_TURN);
/** A turn of his run (0.5 s). */
const RUN_TURN = AXE_RUN.keys[AXE_RUN.keys.length - 1].at;
/** His guard's left hand and the game's own arms, as his run has them with nothing in his hands. */
const EMPTY_REST: Bones = { ...AXE_REST, ...Object.fromEntries(ARM_FIELDS.filter((f) => f in KNIGHT_RUN3.rest).map((f) => [f, (KNIGHT_RUN3.rest as unknown as Record<string, unknown>)[f]])) } as Bones;

/**
 * HIS RUN, EMPTY-HANDED, WHILE THE AXE FLIES (or both, with Twin Axes): THE GAME'S OWN RUN, frame for frame, his arms as the
 * game's run swings them, nothing in his hands (0.5 s, 15 pictures, a loop).
 */
export const AXE_RUN_EMPTY: AxeMove = {
  name: 'Battle axe: he runs empty-handed while it flies (the game\'s run)', rest: EMPTY_REST, loop: 0,
  keys: KNIGHT_RUN3.motion.keys.map((k) => ({ at: k.at, ease: k.ease, pose: { ...k.pose } })),
  holding: () => ({ axe: false, twin: false }),
};

/** A catch on the run: the standing catch's keys up to `upTo` (frames), then his run's arms with the axe from `from`, and to `end`. */
function onTheRun(catchKeys: readonly AxeKey[], upTo: number, from: number, end: number, mid: AxeKey[] = [], turned = false): { keys: AxeKey[]; pose: (t: number) => Posed } {
  const arms: AxeKey[] = catchKeys.filter((k) => k.at <= upTo * FR + 1e-6).map((k) => {
    // (the second axe's way is the world's: turned as far as his chest is turned on the run from where the standing catch has it)
    if (!k.twin || turned) return { ...k };
    const was = bonesAt(catchKeys, AXE_REST, k.at);
    const now = runAt(k.at);
    return { ...k, twin: { ...k.twin, az: k.twin.az + (now.yaw + now.twist) - (was.yaw + was.twist) } };
  });
  arms.push(...mid);
  for (let f = from; f <= end; f++) {
    const q = bonesAt(AXE_RUN.keys, AXE_REST, (f * FR) % RUN_TURN);
    const pose: Partial<Bones> = {};
    for (const a of ARM_FIELDS) if (a in q && !['lh2', 'rh2', 'mixK', 'from', 'to'].includes(a)) (pose as Record<string, unknown>)[a] = (q as unknown as Record<string, unknown>)[a];
    arms.push({ at: f * FR, pose, ease: f === from ? 'io' : 'lin' });
  }
  // (`turned`: his chest turned and bent as the standing catch has it, on his run's hips and legs, handed back to his run's as he
  // comes into it: an axe held behind his shoulder wants his chest where the standing catch has it)
  const chest = (t: number): Posed => {
    const run = runAt(t);
    if (!turned) return run;
    const was = bonesAt(catchKeys, AXE_REST, Math.min(t, upTo * FR));
    const k = t <= upTo * FR ? 1 : Math.max(0, 1 - (t - upTo * FR) / ((from - upTo) * FR));
    return { ...run, twist: run.twist + k * (was.twist + was.yaw - run.twist - run.yaw), bend: run.bend + k * (was.bend - run.bend), pitch: run.pitch + k * (was.pitch - run.pitch) };
  };
  return { keys: arms, pose: (t) => armsOn(chest(t), bonesAt(arms, AXE_REST, t)) };
}
/** Brought down from behind his shoulder in his right hand alone, round his right side to his hip, the haft trailing as his run
 * carries it (from frame `at`, a key each `step` frames), before his left hand comes to the butt. */
function downOnTheRun(at: number, near: number, step = 2): AxeKey[] {
  const a = one({}, [0, -12, -6], -150, 22, DOWN, near, free(12, 4, -8, 0), -3);
  const b = one({}, [5, -6.5, -13], -131, 16, DOWN, a.roll, { lhIn: 3, lhx: BUTT, lhy: 0, lhz: 0, le: 12 }, 0);
  return [key(at, a, 'io'), key(at + step, b, 'io')];
}
/** THE CATCH ON THE RUN: his run's steps frame for frame from its first picture (his body above his feet turned to the catch) (0.5 s: a turn of it, so that it goes
 * on into his run), the catch in his arms: it smacks into his hand (0), his arm carried back by it (1 to 3), held (to 6); his left
 * hand to the butt and the axe brought down before his hip as his run carries it (14). */
const RUN_CATCH = onTheRun(AXE_CATCH.keys, 6, 12, 14, downOnTheRun(8, AXE_CATCH.keys[4].pose.wRoll ?? 180, 2), true);
export const AXE_RUN_CATCH: AxeMove = { name: 'The thrown axe: the catch on the run', rest: AXE_REST, keys: RUN_CATCH.keys, pose: RUN_CATCH.pose, hit: AXE_CATCH_AT, smear: [1 * FR, 3 * FR] };
/** TWIN AXES' CATCH ON THE RUN: the same, both caught, the second put away over his left shoulder (11), his own brought down
 * into his run (24); a second turn of his run (1 s). */
const TWIN_RUN_CATCH = onTheRun(AXE_TWIN_CATCH_MOVE.keys, 11, 22, 29, downOnTheRun(15, AXE_TWIN_CATCH_MOVE.keys[6].pose.wRoll ?? 180, 3), true);
export const AXE_TWIN_RUN_CATCH: AxeMove = { ...AXE_TWIN_CATCH_MOVE, name: 'Twin Axes: the catch on the run', keys: TWIN_RUN_CATCH.keys, pose: TWIN_RUN_CATCH.pose };
/** His moves while it flies, by a short name (not among AXE_MOVES: those are step 2's, as he saw them). */
export const AXE_RUN_MOVES: Record<string, AxeMove> = { runEmpty: AXE_RUN_EMPTY, runCatch: AXE_RUN_CATCH, twinRunCatch: AXE_TWIN_RUN_CATCH };

// ---------------------------------------------------------------------------------------------
// AS THE GAME WOULD HOLD THEM (for the bake, tools/bake_heroes.mjs, and the film): each move's frames as the lists the game
// holds a hero's in (art/actor_types.ts AnimSet), in the shape his great sword's are (art/warrior_up_art.ts), from each of his
// eight sides; and the thrown axe in the air, which the game draws itself.

const FPS = 30;
/** The pool of light behind him, as behind every hero (art/warrior_up_art.ts AURA: the friend's cyan). */
const AURA: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };

/** A frame of a move as the game holds it: cut down to him, with his lights, his pool of light and where his scarf's ends are fixed. */
export function axeSprite(m: AxeMove, t: number, side: WuSide): Sprite {
  const f = paintAxe(m, t, side);
  // (his pool of light where it is under every hero: on a side that faces left, as far the other way)
  const aura = { ...AURA, x: f.ax + (f.ax === CANVAS3.ax ? AURA.x - CANVAS3.ax : CANVAS3.ax - AURA.x) };
  return toSprite(f, aura, f.ax, f.ay);
}

/** How many pictures of the leap the game spreads over it, by how far through he is (as his Lunge's: art/warrior_up_art.ts). */
export const AXE_LEAP_FRAMES = 16;

function setOf(side: WuSide): AnimSet {
  const at = (m: AxeMove, t: number): Sprite => axeSprite(m, t, side);
  const round = (m: AxeMove): Sprite[] => {
    const { end, from } = spanOf(m);
    const t0 = from ?? 0;
    const n = Math.max(1, Math.round((end - t0) * FPS));
    return lazyFrames(n, (i) => at(m, t0 + i / FPS));
  };
  const clip = (m: AxeMove, t0 = 0, t1 = spanOf(m).end): Clip => {
    const n = Math.max(1, Math.round((t1 - t0) * FPS) + 1);
    const c: Clip = { frames: lazyFrames(n, (i) => at(m, Math.min(t1, t0 + i / FPS))), fps: FPS };
    if (m.hit !== undefined && m.hit >= t0 - 1e-6 && m.hit <= t1 + 1e-6) c.hit = m.hit - t0;
    if (m.tail) c.tail = true;
    if (m.poise !== undefined && m.poise >= t0 && m.poise <= t1) c.poise = m.poise - t0;
    return c;
  };
  const loop = (m: AxeMove): Clip => ({ frames: round(m), fps: FPS, loop: 0 });
  const spread = (m: AxeMove, n: number, t0: number, t1: number): Clip => ({ frames: lazyFrames(n, (i) => at(m, t0 + ((t1 - t0) * i) / (n - 1))), fps: (n - 1) / Math.max(1e-6, t1 - t0) });
  const three = (c: Clip): Sprite[] => {
    const n = c.frames.length;
    const pick = (seconds: number): number => Math.max(0, Math.min(n - 1, Math.round(seconds * c.fps)));
    const hit = c.hit ?? (n - 1) / c.fps / 2;
    const picks = [pick(hit * 0.7), pick(hit + 0.035), pick(((n - 1) / c.fps + hit) / 2)];
    return lazyFrames(3, (i) => c.frames[picks[i]]);
  };
  const attack = clip(AXE_CLEAVE);
  const attack2 = clip(AXE_CLEAVE2);
  const heavy = clip(AXE_THROW);
  const arc = AXE_CHOP.arc as NonNullable<AxeMove['arc']>;
  const leap = spread(AXE_CHOP, AXE_LEAP_FRAMES, arc.from, arc.until);
  return {
    idle: round(AXE_STAND),
    walk: round(AXE_RUN),
    attack: three(attack),
    heavy: three(heavy),
    leap: lazyFrames(3, (i) => leap.frames[Math.round([0.05, 0.45, 0.9][i] * (AXE_LEAP_FRAMES - 1))]),
    idleFps: FPS,
    walkFps: FPS,
    clips: {
      // CLEAVE: the cut across (it waits at its `poise` while a second tap may come) and the cut back
      attack,
      attack2,
      // THE THROWN AXE: the throw (`hit`: the moment it leaves his hand), braced while it flies (a loop), the catch
      heavy,
      hold: loop(AXE_BRACED),
      release: clip(AXE_CATCH),
      // LEAPING CHOP: the leap by how far through he is (16 pictures: the last is the blow), and the landing; its crouch below
      leap,
      land: clip(AXE_CHOP, arc.until),
      moves: {
        chopCrouch: clip(AXE_CHOP, 0, arc.from),
        // TWIN AXES: the same three
        twinThrow: clip(AXE_TWIN_THROW),
        twinBraced: loop(AXE_TWIN_BRACED),
        twinCatch: clip(AXE_TWIN_CATCH_MOVE),
      },
    },
  };
}

/**
 * HIS PICTURES WITH THE BATTLE AXE, in a dungeon, from all eight of his sides (art/warrior_up.ts WuSide), each an AnimSet of the
 * very same lists, each side's made when first asked for and each frame painted when first read. What the main chat's bake and
 * rules take (docs/mockups/warrior_weapons/README.md, step 2). NOT DRAWN YET with the axe: struck, his fall, town and his card.
 */
export function makeWarriorAxeArt(): Record<WuSide, AnimSet> {
  const out = {} as Record<WuSide, AnimSet>;
  for (const side of WU_SIDES) Object.defineProperty(out, side, { enumerable: true, configurable: true, get: () => {
    const set = setOf(side);
    Object.defineProperty(out, side, { value: set, enumerable: true });
    return set;
  } });
  return out;
}

/** The canvas the thrown axe is painted on, and the floor point under it (picture pixels: two to a game pixel). */
const FLY = { w: 96, h: 96, ax: 48, ay: 84 } as const;
/** How many pictures a whole turn of the thrown axe is (30 degrees a picture: once round in 0.4 s at 30 a second). */
export const AXE_FLY_FRAMES = 12;

/**
 * THE THROWN AXE IN THE AIR, at a moment of its turn (`turn` degrees, to its left as seen from above): lying flat, as high above
 * the floor as his hand let it go, its two edges each trailing a short streak of their light the way they have come (its
 * smear: it turns too fast to be seen still). The game's camera, whichever way it flies: one list serves every way.
 */
export function paintFlying(turn: number): { px: Px; lights: Light[] } {
  const a = turn * D;
  const high = AXE_FLIGHT.high * 2;
  const x: V3 = [Math.cos(a), Math.sin(a), 0];
  const y: V3 = [-Math.sin(a), Math.cos(a), 0];
  const heart: V3 = [0, 0, high];
  const pl = placedAlong(sub(heart, mul(x, AXE.heart + 4.5)), x, y);
  const sc = new Sculpt();
  layTake(sc, AXE, pl);
  const lights: Light[] = [];
  const drawn = draw(sc, 'front', FLY.ax, FLY.ay, FLY, (st) => {
    // (each edge's streak: an arc of the ring its tip goes round, from where it was a twelfth of a turn ago to where it is)
    for (const sgn of [1, -1]) {
      const tip: V3 = [4.5, sgn * 13.2, 0];
      const r = Math.hypot(tip[0], tip[1]);
      const at = Math.atan2(tip[1], tip[0]) + a;
      const sheet = st.part(st.near(heart) - 1);
      const N = 14;
      let last: [number, number] | null = null;
      for (let i = 0; i <= N; i++) {
        const age = i / N;
        const ang = at - age * 100 * D;
        const [px, py] = st.at(add(heart, [Math.cos(ang) * r, Math.sin(ang) * r, 0]));
        const here: [number, number] = [Math.round(px), Math.round(py)];
        if (last && age > 0.08) sheet.line(last[0], last[1], here[0], here[1], age < 0.4 ? WW_GLOW[3] : age < 0.75 ? WW_GLOW[2] : WW_GLOW[1]);
        last = here;
      }
      const [lx, ly] = st.at(onTake(pl, [AXE.heart + 4.5, sgn * 12, 0]));
      lights.push({ x: lx, y: ly, r: 10, color: WW_GLOW[3], a: 0.24 });
    }
  }, WU_RIM);
  return { px: drawn.px, lights };
}
/** The thrown axe in the air as the game holds it: `AXE_FLY_FRAMES` pictures, a whole turn, its floor point under its middle. */
export function axeFlying(): Sprite[] {
  return lazyFrames(AXE_FLY_FRAMES, (i) => toSprite(paintFlying((360 * i) / AXE_FLY_FRAMES), null, FLY.ax, FLY.ay));
}

export { FR as AXE_FRAME, UNITS_PER_TILE, plantedFeet };
// (for the film's page, src/dev/axe_film_main.ts: which of his sides a facing is, as his great sword's lists are chosen)
export { wuFacing, wuTailsFacing } from './warrior_up_art';
export type { WuSide };
