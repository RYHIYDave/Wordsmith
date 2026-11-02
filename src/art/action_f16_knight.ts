// FLOOR 19'S LARGE MOB, MORE ACTION: THE KING'S KNIGHT (the art chat's helper, 2 Nov 2026; docs/mockups/action_f16/README.md). A MOCK-UP:
// NOTHING OF THE GAME IMPORTS THIS FILE. THE RALLYING BANNER (KNIGHT_BANNER, off), in place of the wide sweep, his overhead cleave kept as
// his blow; on the game's own figure (art/kings_knights.ts, art/kings_knights_moves.ts).
//
// His review of every enemy for more action, 31 Oct 2026: KING'S KNIGHT (floor 19, large): offered a greatsword combo in place of the
// sweep, “Didn’t we just do this for a different enemy?”; told yes, the palace guard's drill; asked: “Something unique”; offered Guard
// and riposte or The rallying banner (he plants a royal banner in the floor; while it stands, every enemy near it hits harder, until you
// cut it down): “The rallying banner”. The banner raised high and held, driven into the floor in 1–2 frames with a shockwave, standing
// tall and plain to read (the King's colours, the enemy's gold glow round it on the floor where its reach is), struck and cut down (it
// splinters and falls). The cleave stays, tightened by Movement 9 (it was drawn by Movement 9 on 29 and 30 Oct: kept frame for frame).
//
// THE BANNER: a royal gonfalon of the King's colours (the knights' own blue and old gold: a blue cloth hung from a crossbar, its border
// gold, the royal swan white on it, cut to three points below), on a tall staff of dark wood with a gold finial and an iron spike at its
// foot. HE CARRIES IT ON HIS BACK, furled, slung across his back from his right hip up over his left shoulder (a picture change to all
// his frames while he has it: his look with the banner). THE MOVE: his right hand keeps his planted sword's grip; his left lets go of it,
// reaches up over his left shoulder and draws the banner off his back; swung up high and unfurled, held aloft in his left fist, HELD,
// shaking; in TWO FRAMES driven down into the floor before him to his left, smeared: a SHOCKWAVE; he lets go and takes his sword's grip
// again. It stands (`bannerPainted`), its gold glow on the floor round it to its reach, the cloth stirring, until it is cut down: struck,
// it shudders; cut, its staff splinters half way up and the top falls, and it is gone. One banner a knight: after it he is the game's own
// knight with the cleave (his look without it, `CLEAVE_KNIGHT`).
//
// 2 Nov 2026 (art/action-fixes), his words, 08:01: “The banner buff AOE probably needs to be much bigger or it won’t affect much”; asked
// how big (it was 3.5 tiles), his pick: “About twice, 7 tiles (Recommended)” (offered as: a wide gold ring on the floor; most of a fight
// happens inside it, but you can still pull enemies out). So ITS REACH IS 7 TILES ROUND (`BANNER.reach`), drawn to match on the floor
// (`rallyPainted`): a ring of the enemy's gold at its edge, plain to read, and a faint glow within (a sparse twinkle of gold and motes
// drifting up), not a wash over the floor.

import { Px } from '../engine/px';
import type { Light } from '../engine/px';
import type { ActorArt } from './actor_types';
import { footwork, plantBy, plantOf } from './bosses3';
import { hash } from './kit';
import type { Ramp } from './kit';
import { BLUE, GOLD, KN_CANVAS, KN_FIRST, KN_GROW, KNIGHT_BODY, swanIn } from './kings_knights';
import { KINGS_KNIGHT, KN_CLEAVE, KN_REST } from './kings_knights_moves';
import { ENEMY_RIM } from './mkit';
import { TILE3, mobSet, paintBits, skeletonAt, sphere } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put } from './new_mobs3';
import { stage } from './skin';
import type { PaintView, Stage } from './skin';
import { add, cross, elbowFor, lerp3, mul, norm, solve, sub } from './skeleton';
import type { Bones, Key3, Posed, Skeleton, V3 } from './skeleton';
import { FR, TAU, clamp01, f, pen, smearAlong, smooth, tileAt } from './action_f6_fx';

/** THE SWITCH, OFF. With it on, the bestiary's king's knight is made by `makeBannerKnightArt` (with his banner) and `makeCleaveKnightArt` (after it). */
export const KNIGHT_BANNER = { on: false };

type P = Partial<Bones>;
const B = KN_FIRST;
const G = KN_GROW;
const LENGTHS = ['px', 'py', 'pz', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'lfx', 'lfy', 'lfz', 'rfx', 'rfy', 'rfz'] as const;
/** A pose in the first pass's lengths, grown to his (art/kings_knights_moves.ts grownPose). */
function grown<T extends P>(q: T): T {
  const o = { ...q } as Record<string, unknown>;
  for (const k of LENGTHS) if (typeof o[k] === 'number') o[k] = (o[k] as number) * G;
  return o as T;
}
function firstPass<T extends P>(q: T): T {
  const o = { ...q } as Record<string, unknown>;
  for (const k of LENGTHS) if (typeof o[k] === 'number') o[k] = (o[k] as number) / G;
  return o as T;
}
/** His rest in the first pass's lengths: the greatsword planted before him, both hands on its grip. */
const R: Bones = firstPass(KN_REST);
const L0 = plantOf(B, 'L', {}, R);
const R0 = plantOf(B, 'R', {}, R);
const PINK = ['#e0287a', '#ff7aa8', '#7a1058'] as const;
const WOOD: Ramp = ['#140c08', '#22160e', '#3a2618', '#523822', '#634530'];
const IRON: Ramp = ['#14141a', '#1e1e26', '#3a3a46', '#5a5a68', '#6e6e7c'];
const SWAN = ['#9a98a8', '#d8d6e0', '#f2f0f6'] as const;
/** The enemy's gold glow (never the friend's cyan). */
export const RALLY_GOLD = ['#5a3c08', '#a8741a', '#e8b23a', '#ffe08a'] as const;

function elbowsTo(pose: P, wantL: V3 | null, wantR: V3 | null): P {
  const q = { ...R, ...pose } as Posed;
  const le = wantL ? elbowFor(B, q, true, norm(wantL)) : q.le;
  const re = wantR ? elbowFor(B, { ...q, le } as Posed, false, norm(wantR)) : q.re;
  return { ...pose, le, re };
}

// =============================================================================================
// THE BANNER'S MAKE (his own lengths: grown)

/** The staff's length (its spike's foot to its finial's top), the crossbar's half-width and how far below the top, the cloth's drop, the spike's length. */
export const STAFF = { long: 150, bar: 20, barDown: 8, drop: 66, spike: 7, r: 1.4 } as const;
/** Where his left fist takes it, from its foot (his own lengths). */
const GRIP = 70;
/** The banner on his back, furled: slung upright behind his left shoulder blade, its foot at the small of his back, rising high over his left shoulder (a standard-bearer's); its way and its crossbar's. */
export function backBanner(s: Skeleton, k = 1): { foot: V3; way: V3; across: V3 } {
  const [cf, cl, cu] = s.chest;
  const deep = (KNIGHT_BODY.ribDeep + 7.5) * k;
  const foot = add(add(add(s.ribs, mul(cf, -deep)), mul(cl, 15 * k)), mul(cu, -26 * k));
  const way = norm(add(add(mul(cu, 0.985), mul(cl, 0.12)), mul(cf, -0.12)));
  const across = norm(cross(way, cf));
  return { foot, way, across };
}

// =============================================================================================
// THE RALLYING BANNER: THE MOVE

/**
 * THE BANNER'S NUMBERS (seconds from its start; tiles):
 *   reaching  his left hand off the sword's grip and up over his left shoulder by 0.42 s, where it takes the banner
 *   drawn     off his back and swung up, unfurling, by 0.9 s: held aloft in his left fist, the staff upright; HELD, shaking, to 1.3 s (0.4 s)
 *   THE PLANT TWO FRAMES, smeared: driven straight down into the floor before him to his left (frame 41, 1.367 s: the clip's `hit`): the
 *             SHOCKWAVE, a hero within `wave` of it struck and knocked `knock`
 *   wind-down  his fist on it, driven on, to 1.75 s; let go; his hand on his sword's grip again by 2.15 s; at rest by 2.6 s
 *   IT STANDS  `at` before him (tiles), until cut down: every enemy within `reach` of it (7 tiles round, his pick of 2 Nov; it was 3.5)
 *             hits harder (the rules' how much); `life` blows of the hero's cut it down (the rules')
 */
export const BANNER_HIT = f(41);
export const BANNER_STRIKE = [f(39), f(41)] as const;
export const BANNER_SMEARED = (t: number): boolean => t > BANNER_STRIKE[0] + 1e-6 && t <= BANNER_STRIKE[1] + FR + 1e-6;
export const BANNER = { grab: 0.42, raised: 0.9, hit: BANNER_HIT, strike: BANNER_STRIKE, let: 1.75, long: 2.6, wave: 2.2, knock: 0.6, reach: 7, sink: 8, near: 1.5, far: 6 } as const;
const BANNER_NAME = 'The rallying banner';
/** Where it is planted (first pass's lengths, before him and to his left), and where his fist is on it then. */
const SPOT0: [number, number] = [27, 19];
const HELD0: V3 = [SPOT0[0], SPOT0[1], GRIP / G];
/** Where it stands, tiles before him and to his left. */
export const BANNER_AT: [number, number] = [(SPOT0[0] * G) / TILE3, (SPOT0[1] * G) / TILE3];

const LEAN_BACK: P = { pitch: -2, bend: -5, yaw: -1, twist: 0, faceUp: 10, faceTurn: 18 };
const handL2 = (v: V3): P => ({ lhIn: 2, lhx: v[0], lhy: v[1], lhz: v[2] });
/** His left fist where it takes the banner off his back (first pass's lengths): worked out on him as he is then. */
function grabAt(body: P): V3 {
  const s = solve(B, { ...R, ...body } as Posed);
  const bb = backBanner(s, 1 / G);
  return add(bb.foot, mul(bb.way, GRIP / G));
}
function bannerKeys(): Key3[] {
  const reachBody: P = { px: -0.4, pz: R.pz + 0.2, ...LEAN_BACK, side: -1, roll: 0 };
  const grip = grabAt(reachBody);
  const raisedBody: P = { px: 0.6, pz: R.pz + 0.6, pitch: -4, bend: -9, yaw: 4, twist: 4, side: -2, roll: 0, faceUp: 18, faceTurn: 6 };
  const RAISED: P = elbowsTo({ ...raisedBody, ...handL2([5, 21, 86]) }, [0.1, 1, -0.2], null);
  const shake = (k: number): P => ({ ...RAISED, lhz: 86 + (k % 2 ? 0.6 : -0.3), lhx: 5 - 0.25 * (k % 2), px: 0.6 - 0.2 * (k % 2) });
  const MID: P = elbowsTo({ px: 3.0, pz: R.pz - 2.6, pitch: 6, bend: 0, yaw: 6, twist: 4, side: -1, roll: 0, faceUp: 6, faceTurn: 10, ...handL2([17, 20, 64]) }, [0.1, 1, -0.3], null);
  const DRIVEN: P = elbowsTo({ px: 6.5, pz: R.pz - 7.0, pitch: 14, bend: 8, yaw: 8, twist: 6, side: 0, roll: 0, faceUp: -2, faceTurn: 12, ...handL2(HELD0) }, [0.2, 1, -0.5], null);
  const ON: P = elbowsTo({ ...DRIVEN, px: 7.0, pz: R.pz - 7.8, pitch: 16, ...handL2([HELD0[0], HELD0[1], HELD0[2] - BANNER.sink / G]) }, [0.2, 1, -0.5], null);
  return [
    { at: 0, pose: {} },
    // (his left hand off the grip, up toward his shoulder; then over it, onto the staff)
    { at: 0.2, pose: elbowsTo({ px: -0.2, pz: R.pz + 0.1, pitch: -1, bend: -3, yaw: -3, twist: -3, faceUp: 6, faceTurn: 8, lhIn: 1, lhx: 6, lhy: -2, lhz: 4 }, [-0.2, 1, -0.4], null), ease: 'io' },
    { at: BANNER.grab, pose: elbowsTo({ ...reachBody, ...handL2(grip) }, [0.3, 1, 0.1], null), ease: 'io' },
    // (drawn off his back: out to his left, clear of him, and up; then round before him)
    { at: 0.6, pose: elbowsTo({ px: -0.2, pz: R.pz + 0.3, pitch: -3, bend: -6, yaw: 0, twist: 0, side: -1, roll: 0, faceUp: 12, faceTurn: 16, ...handL2([grip[0] - 1, grip[1] + 13, grip[2] + 7]) }, [-0.3, 1, -0.2], null), ease: 'io' },
    { at: 0.76, pose: elbowsTo({ px: 0.2, pz: R.pz + 0.5, pitch: -4, bend: -8, yaw: 2, twist: 2, side: -2, roll: 0, faceUp: 14, faceTurn: 10, ...handL2([1, 28, 82]) }, [-0.2, 1, -0.3], null), ease: 'io' },
    { at: BANNER.raised, pose: RAISED, ease: 'io' },
    { at: 1.0, pose: shake(1), ease: 'io' },
    { at: 1.1, pose: shake(2), ease: 'io' },
    { at: 1.2, pose: shake(3), ease: 'io' },
    { at: BANNER_STRIKE[0], pose: RAISED, ease: 'io' },
    { at: f(40), pose: MID, ease: 'lin' },
    { at: BANNER_HIT, pose: DRIVEN, ease: 'lin' },
    { at: BANNER_HIT + 0.14, pose: ON, ease: 'out' },
    { at: 1.6, pose: { ...ON, pz: R.pz - 7.4 }, ease: 'io' },
    { at: BANNER.let, pose: elbowsTo({ ...ON, pz: R.pz - 6.4, px: 6.2 }, [0.2, 1, -0.5], null), ease: 'io' },
    // (let go; the hand out round his side and back onto the sword's grip)
    { at: 1.95, pose: elbowsTo({ px: 2.4, pz: R.pz - 2.6, pitch: 5, bend: 3, yaw: 2, twist: 2, side: 0, roll: 0, faceUp: 2, faceTurn: 4, lhIn: 1, lhx: 10, lhy: 2, lhz: -14 }, [-0.2, 1, -0.5], null), ease: 'io' },
    { at: 2.15, pose: { px: 1.0, pz: R.pz - 0.8, pitch: 3, bend: 2, yaw: 0, twist: 0, faceUp: 0, faceTurn: 0 }, ease: 'io' },
    { at: BANNER.long, pose: {}, ease: 'io' },
  ].map((k) => ({ ...k, pose: grown(k.pose) })) as Key3[];
}
function bannerFeet(): (t: number) => P {
  const first = footwork(B, {
    L: { start: L0, moves: [{ t0: 0.95, t1: 1.22, to: plantBy(L0, 7, 4, 10), lift: 4.0 }, { t0: 2.0, t1: 2.3, to: L0, lift: 3.6 }] },
    R: { start: R0, moves: [{ t0: BANNER_STRIKE[0], t1: BANNER_HIT, to: plantBy(R0, 0, 0, 2, { pitch: 20 }) }, { t0: 1.9, t1: 2.1, to: R0 }] },
  });
  return (t) => grown(first(t));
}
const bannerGlint = (t: number): number => (t < 0.8 || t > BANNER_HIT + 0.05 ? 0 : clamp01((t - 0.8) / 0.1));

/** Where the banner is at a moment of the banner move, as he holds it (null: on his back, or planted). */
export function bannerHeld(mob: Mob, t: number, s: Skeleton): { foot: V3; way: V3; across: V3; unfurled: number } | null {
  if (t < BANNER.grab || t > BANNER_HIT + 1e-6) return null;
  const g = skeletonAt(mob, 'banner', BANNER.grab);
  const b0 = backBanner(g);
  // (from as it lay on his back to upright, as it comes off and up; its crossbar from across his back to across his way)
  const k = smooth((t - BANNER.grab) / (0.86 - BANNER.grab));
  // (its foot swung out wide of his left side as it comes round: the staff's top over toward him)
  const way = norm(add(lerp3(b0.way, [0, 0, 1], k), [0, -0.3 * Math.sin(Math.PI * k), 0]));
  const across = norm(lerp3(b0.across, [0, 1, 0], k));
  const foot = sub(s.handL, mul(way, GRIP));
  return { foot, way, across, unfurled: smooth((t - 0.55) / 0.3) };
}

// =============================================================================================
// THE BANNER AS SOLIDS

/** The cloth's colour at (`a` across from its middle, -1 to 1; `b` down from the crossbar, 0 to 1 and its points below). */
function clothSkin(a: number, b: number, tone: number): string | null {
  // (three points below: the cloth cut to them)
  const pts = 0.82 + 0.18 * (1 - Math.abs(((a + 1) * 1.5) % 1 - 0.5) * 2);
  if (b > pts) return null;
  const edge = Math.abs(a) > 0.84 || b < 0.07 || b > pts - 0.07;
  if (edge) return GOLD[Math.min(4, tone + 1)];
  // (the royal swan, white, at its middle)
  const sa = a / 0.62;
  const sb = (b - 0.42) / 0.3;
  if (swanIn(sa, sb)) return SWAN[Math.min(2, Math.max(0, tone - 1))];
  return BLUE[Math.min(4, tone + 1)];
}
/**
 * The banner laid as solids: its foot at `foot`, its staff up along `way`, its crossbar along `across`; its cloth unfurled `unfurled` (0
 * furled round the staff), stirring at `t`; cut down: `cut` (0 whole; above 0, its top half fallen that far, 1 lying) — the staff
 * broken at `breakAt` of its length. Its parts `banner...`.
 */
export function bannerBits(put: Put, foot: V3, way: V3, across: V3, unfurled: number, t: number, cut = 0, below = 0): void {
  const L = STAFF.long;
  const brk = 0.48;
  // (the top half falls about the break, away from its cloth's face, and lies)
  const fall = clamp01(cut);
  const face = norm(cross(across, way));
  const pivot = add(foot, mul(way, L * brk));
  const tip = (v: V3): V3 => {
    if (fall <= 0) return v;
    const ang = (Math.PI / 2) * 0.98 * fall * fall;
    const d = sub(v, pivot);
    const u = dot3(d, way);
    const w = dot3(d, face);
    const rest = sub(d, add(mul(way, u), mul(face, w)));
    const drop = Math.max(0, 1 - pivot[2] / Math.max(1, L * brk)) * 0;
    void drop;
    // (rotated about the crossbar's way through the break, the top going over toward the cloth's back; sliding down as it lies)
    const nu = u * Math.cos(ang) - w * Math.sin(ang);
    const nw = u * Math.sin(ang) + w * Math.cos(ang);
    return add(add(pivot, add(add(mul(way, nu), mul(face, -Math.abs(nw) - 0.0)), rest)), [0, 0, -pivot[2] * 0.82 * smooth((fall - 0.4) / 0.6)]);
  };
  const at = (k: number): V3 => add(foot, mul(way, k));
  // THE STAFF: the iron spike at its foot, the dark wood, gold bands, the gold finial
  const from = Math.max(below, 0);
  if (from < STAFF.spike) put('bannerStaff', 'spike', { k: 'rod', a: at(from), b: at(STAFF.spike), ra: 0.5, rb: STAFF.r * 0.9, ramp: IRON });
  const lowTop = cut > 0 ? L * brk : L - 2;
  put('bannerStaff', 'staff', { k: 'rod', a: at(Math.max(from, STAFF.spike)), b: at(lowTop), ra: STAFF.r, rb: STAFF.r * 0.92, ramp: WOOD });
  if (cut > 0) {
    // (the break: splintered ends)
    for (let i = 0; i < 4; i++) {
      const o = mul(across, (i - 1.5) * 0.7);
      put('bannerStaff', 'staff', { k: 'rod', a: add(at(L * brk - 1), o), b: add(at(L * brk + 2 + (i % 2) * 2), o), ra: 0.45, rb: 0.2, ramp: WOOD });
    }
  }
  const upper = (k: number): V3 => tip(at(k));
  const topFrom = cut > 0 ? L * brk + 1.5 : L - 2;
  if (cut > 0) put('bannerTop', 'staff', { k: 'rod', a: upper(topFrom), b: upper(L - 2), ra: STAFF.r * 0.92, rb: STAFF.r * 0.9, ramp: WOOD });
  for (const k of [STAFF.spike + 1, L * 0.3, L - STAFF.barDown - 1]) {
    if (cut > 0 && k > L * brk) put('bannerTop', 'band', { k: 'rod', a: upper(k - 0.8), b: upper(k + 0.8), ra: STAFF.r + 0.45, rb: STAFF.r + 0.45, ramp: GOLD });
    else if (k >= from) put('bannerStaff', 'band', { k: 'rod', a: at(k - 0.8), b: at(k + 0.8), ra: STAFF.r + 0.45, rb: STAFF.r + 0.45, ramp: GOLD });
  }
  const part = cut > 0 ? 'bannerTop' : 'bannerStaff';
  const P2 = (k: number): V3 => (cut > 0 ? upper(k) : at(k));
  put(part, 'finial', { k: 'rod', a: P2(L - 2.5), b: P2(L + 3.5), ra: 2.0, rb: 0.2, ramp: GOLD });
  put(part, 'finial', { k: 'ball', c: P2(L - 2), ax: sphere(1.9), skin: GOLD });
  // THE CROSSBAR, gold-capped
  const barAt = L - STAFF.barDown;
  const bar = (s: number): V3 => (cut > 0 ? tip(add(at(barAt), mul(across, s))) : add(at(barAt), mul(across, s)));
  if (unfurled > 0.02) {
    put(part, 'crossbar', { k: 'rod', a: bar(-STAFF.bar), b: bar(STAFF.bar), ra: 0.85, rb: 0.85, ramp: WOOD });
    for (const sd of [-1, 1]) put(part, 'crossbar', { k: 'ball', c: bar(sd * (STAFF.bar + 0.6)), ax: sphere(1.3), skin: GOLD });
  }
  // THE CLOTH: furled round the staff below the crossbar (a roll of blue bound with gold cord); unfurling, it drops from the crossbar
  if (unfurled < 0.98) {
    const roll = 1 - unfurled;
    const a0 = barAt - 1;
    const a1 = barAt - STAFF.drop * (0.55 + 0.45 * unfurled) ;
    put(part, 'furled', { k: 'rod', a: P2(a1), b: P2(a0), ra: 1.6 + 2.0 * roll, rb: 1.4 + 2.4 * roll, ramp: BLUE });
    for (let k = a1 + 4; k < a0 - 2; k += 8) put(part, 'furled', { k: 'rod', a: P2(k - 0.5), b: P2(k + 0.5), ra: 2.0 + 2.2 * roll, rb: 2.0 + 2.2 * roll, ramp: GOLD });
  }
  if (unfurled > 0.02) {
    // (in strips across, each turned a little with the stir of the air: a cloth that moves)
    const N = 6;
    const drop = STAFF.drop * unfurled;
    for (let i = 0; i < N; i++) {
      const a0 = -1 + (2 * i) / N;
      const a1 = a0 + 2 / N;
      const am = (a0 + a1) / 2;
      const wave = Math.sin(t * 3.1 + am * 2.6) * 1.6 + Math.sin(t * 5.3 + am * 4) * 0.6;
      const c0: V3 = add(add(at(barAt - 0.9), mul(across, am * STAFF.bar * 0.94)), mul(face, wave * 0.5));
      const mid = add(c0, add(mul(way, -drop / 2), mul(face, wave)));
      const cc = cut > 0 ? tip(mid) : mid;
      const vDown = cut > 0 ? sub(tip(add(mid, mul(way, -drop / 2))), cc) : mul(way, -drop / 2);
      const uAcross = cut > 0 ? sub(tip(add(mid, mul(across, (STAFF.bar * 0.94) / N))), cc) : mul(across, (STAFF.bar * 0.94) / N + 0.25);
      put(part, 'cloth', { k: 'panel', c: cc, u: uAcross, v: vDown, skin: (aa, bb, front, tone) => {
        const A = am + ((aa / ((STAFF.bar * 0.94) / N + 0.25)) * (a1 - a0)) / 2;
        const Bv = (bb / (drop / 2) + 1) / 2;
        const c = clothSkin(A, (1 - Bv) * unfurled, front ? tone : Math.max(0, tone - 1));
        return c;
      } });
    }
  }
}
const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// =============================================================================================
// HIM, WITH IT

function moreBits(mob: Mob, carrying: boolean, st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  if (!carrying || (m.dying && m.t > 99)) return bits;
  const t = m.t;
  const s = m.s;
  if (m.move === BANNER_NAME) {
    const h = bannerHeld(mob, t, s);
    if (h) {
      bannerBits(put, h.foot, h.way, h.across, h.unfurled, t);
      if (BANNER_SMEARED(t)) {
        // (the smear of the plant: after-images of the staff's foot, its middle and its crossbar, along the way it came down)
        const thin = Math.abs(t - BANNER_HIT - FR) < 1e-6;
        const lines: V3[][] = [[], [], []];
        for (let i = 0; i <= 8; i++) {
          const u = Math.min(t, BANNER_HIT) - (FR * 1.3 * i) / 8;
          const hh = bannerHeld(mob, u, skeletonAt(mob, 'banner', u));
          if (!hh) continue;
          lines[0].push(hh.foot);
          lines[1].push(add(hh.foot, mul(hh.way, STAFF.long * 0.5)));
          lines[2].push(add(hh.foot, mul(hh.way, STAFF.long - STAFF.barDown)));
        }
        smearAlong(st, put, lines, thin, ['#4c5680', '#a4accc', '#e8e2c8', '#fff6e0'], PINK[1]);
      }
      return bits;
    }
    if (t > BANNER_HIT) return bits;
  }
  const b = backBanner(s);
  bannerBits(put, b.foot, b.way, b.across, 0, t);
  return bits;
}
const BANNER_CANVAS = { w: KN_CANVAS.w, h: KN_CANVAS.h + 170, ax: KN_CANVAS.ax, ay: KN_CANVAS.ay + 170 } as const;
function bannerKnight(carrying: boolean): Mob {
  const base = KINGS_KNIGHT;
  const cleave = (base.more as Record<string, MobMove>).cleave;
  const more: Record<string, MobMove> = { setOff: (base.more as Record<string, MobMove>).setOff, halt: (base.more as Record<string, MobMove>).halt };
  if (carrying) more.banner = { name: BANNER_NAME, motion: { keys: bannerKeys(), hit: BANNER_HIT }, rest: KN_REST, feet: bannerFeet(), glint: bannerGlint };
  const mob: Mob = {
    ...base,
    id: carrying ? 'kings-knight-banner' : 'kings-knight-cleave',
    attack: cleave,
    hit: KN_CLEAVE.hit,
    warn: KN_CLEAVE.warn[1] - KN_CLEAVE.warn[0],
    more,
    canvas: carrying ? BANNER_CANVAS : base.canvas,
    aura: carrying ? { ...base.aura, y: base.aura.y + 170 } : base.aura,
    bits: carrying ? (st, m) => [...base.bits(st, m), ...moreBits(mob, true, st, m)] : base.bits,
  };
  return mob;
}
/** THE KING'S KNIGHT WITH HIS BANNER (KNIGHT_BANNER): on his back in every move; his cleave his blow; the banner move. */
export const BANNER_KNIGHT = bannerKnight(true);
/** THE KING'S KNIGHT AFTER IT: the game's own, his cleave his blow (no sweep). */
export const CLEAVE_KNIGHT = bannerKnight(false);
/** As the game holds a monster: the cleave as `attack`, the banner as `moves.banner` (in place of the sweep). */
export function makeBannerKnightArt(pace = BANNER_KNIGHT.pace): ActorArt {
  return { front: mobSet(BANNER_KNIGHT, 'front', pace), back: mobSet(BANNER_KNIGHT, 'back', pace) };
}
export function makeCleaveKnightArt(pace = CLEAVE_KNIGHT.pace): ActorArt {
  return { front: mobSet(CLEAVE_KNIGHT, 'front', pace), back: mobSet(CLEAVE_KNIGHT, 'back', pace) };
}

// =============================================================================================
// THE BANNER STANDING, AND CUT DOWN

/** Its canvas (its anchor where its foot stands). */
export const STANDING_CANVAS = { w: 240, h: 400, ax: 120, ay: 340 } as const;
/**
 * THE BANNER STANDING where he planted it, `t` seconds after (driven on `BANNER.sink` in its first 0.14 s), drawn as the knight faces in
 * `view`; `struck` seconds after a blow on it (it shudders; -1 none); `cut` seconds after it is cut down (-1 none): its staff splinters
 * half way up, the top half falls and lies, and by 1.6 s it is gone. Its pink edge, the enemy's.
 */
export function bannerPainted(t: number, view: PaintView, struck = -1, cut = -1): { px: Px; lights: Light[] } {
  const C = STANDING_CANVAS;
  const st = stage(view, C.ax, C.ay, C);
  const bits: Bit[] = [];
  const sink = BANNER.sink * smooth(t / 0.14);
  const shudder = struck >= 0 && struck < 0.4 ? Math.sin(struck * 60) * 2.2 * (1 - struck / 0.4) : 0;
  const way = norm([shudder * 0.02, 0, 1]);
  const fall = cut < 0 ? 0 : clamp01(cut / 0.7);
  if (cut > 1.6) return { px: st.whole(ENEMY_RIM), lights: [] };
  bannerBits((part, piece, shape) => bits.push({ part, piece, shape }), [0, 0, -sink], way, [0, 1, 0], 1, t, cut < 0 ? 0 : Math.max(0.001, fall), sink);
  const lights = paintBits(st, bits, [0, 0, 60]);
  const px = st.whole(ENEMY_RIM);
  // (fading as it goes, after it lies)
  if (cut > 1.0) {
    const k = (cut - 1.0) / 0.6;
    for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3] && hash(x, y, 1931) < k) px.d[(y * px.w + x) * 4 + 3] = 0;
  }
  return { px, lights };
}

/** The floor's canvas (its anchor where the banner stands): room for its reach, 7 tiles round. */
export const RALLY_CANVAS = { w: 700, h: 372, ax: 350, ay: 186 } as const;
/**
 * WHAT IS ON THE FLOOR ROUND IT, `t` seconds after it is planted:
 *   floor  the SHOCKWAVE: a ring of force and dust going out to `BANNER.wave` in 0.2 s, the floor cracked under its foot; then THE GOLD
 *          GLOW of its reach: a ring of the enemy's gold on the floor `BANNER.reach` round it, slowly turning, its light over it; `cut`
 *          seconds after it is cut down, going out
 *   air    splinters flung as it is cut (`cut`), the flash of the plant
 */
export function rallyPainted(t: number, layer: 'floor' | 'air', cut = -1): { px: Px; lights: Light[] } {
  const C = RALLY_CANVAS;
  const px = new Px(C.w, C.h);
  const lights: Light[] = [];
  const dot2 = pen(px);
  const under = pen(px, true);
  const at = (x: number, y: number): [number, number] => tileAt(C.ax, C.ay, x, y);
  if (layer === 'floor') {
    // the shockwave
    if (t >= 0 && t < 0.6) {
      const k = 1 - (1 - clamp01(t / 0.2)) ** 2;
      const fade = 1 - smooth((t - 0.3) / 0.3);
      const r = BANNER.wave * k;
      for (let i = 0; i < 260; i++) {
        const a = (i / 260) * TAU;
        const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
        if (hash(i, 1, 1951) > fade) continue;
        dot2(x, y, i % 3 ? PINK[1] : PINK[0]);
        dot2(x, y + 1, PINK[2]);
        const [x2, y2] = at(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9);
        if (i % 2 === 0) under(x2, y2, '#8a8892');
      }
      for (let i = 0; i < 120; i++) {
        const a = hash(i, 2, 1951) * TAU;
        const d = r * (0.3 + 0.6 * hash(i, 3, 1951));
        const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
        if (hash(i, 4, 1951) > fade) continue;
        under(x, y, i % 2 ? '#6a6872' : '#4e4c56');
      }
    }
    // the floor cracked under its foot
    if (t >= 0 && (cut < 0 || cut < 1.6)) {
      for (let j = 0; j < 7; j++) {
        const a0 = hash(j, 5, 1953) * TAU;
        let x0 = 0;
        let y0 = 0;
        const n = 6 + Math.floor(5 * hash(j, 6, 1953));
        for (let i = 0; i < n; i++) {
          const a = a0 + (hash(j, i, 1955) - 0.5) * 0.9;
          const x1 = x0 + Math.cos(a) * 0.09;
          const y1 = y0 + Math.sin(a) * 0.09;
          const [X, Y] = at(x1, y1);
          dot2(X, Y, '#120f18');
          x0 = x1;
          y0 = y1;
        }
      }
    }
    // THE GOLD OF ITS REACH (7 tiles round, 2 Nov): a ring of the enemy's gold at its edge, plain to read; a faint glow within
    const on = clamp01((t - 0.15) / 0.35) * (cut < 0 ? 1 : 1 - clamp01(cut / 0.5));
    if (on > 0) {
      const r = BANNER.reach;
      // (the glow within: a sparse twinkle of gold over the floor, thinning out from the banner to the ring, so that the floor shows)
      const tw = Math.floor(t * 3);
      for (let Y = 2; Y < C.h - 2; Y++) {
        for (let X = 2; X < C.w - 2; X += 2) {
          const a = (X - C.ax) / 32;
          const b = (Y - C.ay) / 16;
          const d = Math.hypot((a + b) / 2, (b - a) / 2);
          if (d > r - 0.25) continue;
          const g = hash(X >> 1, Y, 1961 + (hash(X >> 3, Y >> 2, 1963) < 0.5 ? tw : tw + 7));
          if (g > (0.035 - 0.015 * (d / r)) * on) continue;
          under(X, Y, g < 0.006 ? RALLY_GOLD[2] : RALLY_GOLD[1]);
        }
      }
      // (the ring at its edge: a thick dashed band of gold turning slowly, its dashes bright, a fine line inside it)
      const n = Math.round(r * 150);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + t * 0.12;
        const dash = i % 14;
        if (hash(i, 7, 1957) > on) continue;
        const [xi, yi] = at(Math.cos(a) * (r - 0.16), Math.sin(a) * (r - 0.16));
        if (i % 3 === 0) dot2(xi, yi, RALLY_GOLD[1]);
        if (dash > 9) continue;
        const [x, y] = at(Math.cos(a) * r, Math.sin(a) * r);
        const hi = dash === 3 || dash === 4;
        dot2(x, y - 1, hi ? RALLY_GOLD[3] : RALLY_GOLD[2]);
        dot2(x + 1, y - 1, hi ? RALLY_GOLD[3] : RALLY_GOLD[2]);
        dot2(x, y, RALLY_GOLD[2]);
        dot2(x + 1, y, RALLY_GOLD[2]);
        dot2(x, y + 1, RALLY_GOLD[1]);
        dot2(x + 1, y + 1, RALLY_GOLD[1]);
        dot2(x, y + 2, RALLY_GOLD[0]);
        dot2(x + 1, y + 2, RALLY_GOLD[0]);
      }
      // (twelve chevrons pointing in round the ring: the banner's reach, read from anywhere on it)
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * TAU + t * 0.12;
        for (let j = -10; j <= 10; j++) {
          const side = Math.abs(j) / 10;
          const rr = r - 0.32 - 0.3 * (1 - side);
          const [x, y] = at(Math.cos(a + j * 0.007) * rr, Math.sin(a + j * 0.007) * rr);
          if (hash(k, j, 1965) > on + 0.2) continue;
          dot2(x, y - 1, RALLY_GOLD[3]);
          dot2(x, y, RALLY_GOLD[2]);
          dot2(x, y + 1, RALLY_GOLD[0]);
        }
      }
      // (motes of gold drifting up over its reach: the rally)
      for (let i = 0; i < 220; i++) {
        const a = hash(i, 8, 1957) * TAU;
        const d = r * Math.sqrt(hash(i, 9, 1957));
        const life = (t * 0.6 + hash(i, 10, 1957)) % 1;
        if (life > 0.7 || hash(i, 11, 1957) > on) continue;
        const [x, y] = at(Math.cos(a) * d, Math.sin(a) * d);
        under(x, y - life * 6, life < 0.3 ? RALLY_GOLD[2] : RALLY_GOLD[1]);
      }
      lights.push({ x: C.ax, y: C.ay, r: 150, color: RALLY_GOLD[2], a: 0.18 * on });
    }
    return { px, lights };
  }
  // the flash of the plant
  if (t >= 0 && t < 0.08) {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * TAU;
      const d = 6 + 10 * (t / 0.08);
      dot2(C.ax + Math.cos(a) * d, C.ay + Math.sin(a) * d * 0.5 - 2, i % 2 ? '#fff6e0' : PINK[1]);
    }
    lights.push({ x: C.ax, y: C.ay - 6, r: 60, color: '#ffe0a0', a: 0.35 });
  }
  // splinters flung as it is cut, up from the break (`STAFF.long` x 0.48 up)
  if (cut >= 0 && cut < 1.0) {
    const hgt = (STAFF.long * 0.48) / 2;
    for (let i = 0; i < 36; i++) {
      const a = hash(i, 1, 1959) * TAU;
      const sp = 20 + 50 * hash(i, 2, 1959);
      const x = C.ax + Math.cos(a) * sp * cut;
      const y = C.ay - hgt + Math.sin(a) * sp * cut * 0.5 - (40 * cut - 70 * cut * cut) * hash(i, 3, 1959);
      if (y > C.ay + 4 || hash(i, 4, 1959) < cut) continue;
      dot2(x, y, i % 3 ? WOOD[3] : WOOD[4]);
      if (i % 2) dot2(x + 1, y, WOOD[2]);
    }
  }
  return { px, lights };
}
/** Whether the plant's shockwave strikes a hero `x` tiles before him and `y` to his left; whether one stands within the banner's reach. */
export const waveStrikes = (x: number, y: number): boolean => Math.hypot(x - BANNER_AT[0], y - BANNER_AT[1]) <= BANNER.wave;
export const inRally = (x: number, y: number): boolean => Math.hypot(x - BANNER_AT[0], y - BANNER_AT[1]) <= BANNER.reach;
