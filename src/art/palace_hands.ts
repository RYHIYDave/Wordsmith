// FLOOR 16'S HUSHED GARDENERS AND GROOMS (the art chat, 28 Oct 2026). A MOCK-UP: NOT IN THE GAME. Nothing of the game
// imports this file; `PALACE_HANDS_ON` is off. Their moves are art/palace_hands_moves.ts.
//
// His doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)", level 16, THE SWAN GARDENS: its enemies “the Hushed
// gardeners and grooms, the palace guard, and the swans”. His brief for them (his art rulebook, "A new character", and
// sound rule 7), his picks, 28 Oct:
// - who they are: “A gardener and a groom (Recommended)” (offered as: two kinds mixed in a crowd, a gardener in a
//   leather apron with hedge shears and a stable groom in palace livery with a pitchfork);
// - how big: “Knight's size, in crowds (Recommended)” (small: many of them, one attack each);
// - how they move: “Rush at you” (offered as: they run at you the moment they see you);
// - their attack: “Shears snap, fork jab (Recommended)” (the gardener holds his shears open high, then snaps them shut
//   on you; the groom draws his pitchfork back, then jabs);
// - what marks them: “Grey breath leaking out (Recommended)” (as the city's Hushed: grey faces, dull pink eyes, mouths
//   working with no sound, grey breath curling out);
// - their death: “The Hush leaves them (Recommended)” (a gasp as the grey breath leaves, the tool drops, they slump
//   down, people again);
// - never: “Not undead or gory (Recommended)”;
// - their sound: “Silent but their tools (Recommended)” (the snip of shears, the scrape of the fork, running feet, a gasp
//   when they die).
//
// WHO THEY ARE: the palace's own servants, their words stolen like the city's: floor 11's Hushed (art/hushed.ts), whose
// body, skin and breath they share, here in the palace's gardens and stables. A GARDENER (a broad-brimmed felt hat, his
// shirtsleeves rolled to the elbow, a waistcoat of hedge green, a long bib apron of leather, cord breeches, leather
// gaiters and boots; hedge shears in both hands) and a GROOM (the palace's livery: a short coat of faded madder with buff
// collar and cuffs and a row of buttons, buff breeches, tall black boots with tan tops; his hair tied back in a queue;
// a pitchfork). Grown men, the knight's height. Nothing cyan.

import { BREATH_PALE, GREY_HAIR, HAIR, HUSHED_BODY, HUSHED_REST, INKBLOT, SKIN, hushBreath, hushLeaves, lagOf } from './hushed';
import { INK, hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, cross, dot, lerp3, mul, norm, sub } from './skeleton';
import type { Bones, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const PALACE_HANDS_ON = { on: false };

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
void BREATH_PALE;

// =============================================================================================
// THEIR COLOURS: the palace's working clothes, dulled by the dawn's grey

/** The gardener's shirt (linen), his waistcoat (hedge green), his leather apron, cord breeches, gaiters, boots, felt hat. */
const LINEN: Ramp = ['#36342e', '#36342e', '#77725f', '#9c9580', '#9c9580'];
const WAISTCOAT: Ramp = ['#121a14', '#121a14', '#2c3e30', '#405644', '#405644'];
const LEATHER: Ramp = ['#20150e', '#20150e', '#583b25', '#775236', '#775236'];
const CORD: Ramp = ['#1a1814', '#1a1814', '#403a2c', '#58503c', '#58503c'];
const GAITER: Ramp = ['#18120e', '#18120e', '#3c2e22', '#523f2e', '#523f2e'];
const BOOT: Ramp = ['#0e0c0c', '#0e0c0c', '#28221e', '#3a322c', '#3a322c'];
const FELT: Ramp = ['#121012', '#121012', '#302a2c', '#443c3c', '#4e4646'];
/** The groom's livery: a short coat of faded madder, buff facings and breeches, brass buttons gone dull; his top boots' tan tops. */
const LIVERY: Ramp = ['#24131a', '#24131a', '#5a3036', '#76444a', '#76444a'];
const BUFF: Ramp = ['#3a3428', '#3a3428', '#7e7458', '#a29672', '#a29672'];
const BREECHES: Ramp = ['#3a372f', '#3a372f', '#85806d', '#a9a28a', '#a9a28a'];
const TAN: Ramp = ['#2a1c12', '#2a1c12', '#6a4c32', '#8a6644', '#8a6644'];
const BUTTON = '#8a7a52';
const RIBBON: Ramp = ['#0c0a0c', '#0c0a0c', '#201c20', '#2e282c', '#2e282c'];
/** Their tools: ash handles worn dark; iron. */
const ASH: Ramp = ['#22180e', '#22180e', '#56402a', '#74583a', '#74583a'];
const IRON: Ramp = ['#1a1c22', '#1a1c22', '#4e535d', '#7a808c', '#9aa0aa'];

// =============================================================================================
// THE BODY: floor 11's Hushed

export const PH_BODY = HUSHED_BODY;
const HB = PH_BODY;
/** Their picture: room for the shears raised high and the fork jabbed out its whole length. */
export const PH_CANVAS: MobCanvas = { w: 300, h: 240, ax: 140, ay: 172 };

/** Who: a gardener, a groom. */
export type PalaceWho = 'gardener' | 'groom';

// =============================================================================================
// THE HEDGE SHEARS: two handles, one in each hand, crossing at a pivot; a blade on past it from each

/** Each handle from the fist to the pivot; each blade from the pivot to its point. */
export const SHEARS = { handle: 8.0, blade: 13.0 } as const;
/**
 * The shears as they are at a moment: from where the two fists are, the pivot (as far from each as a handle is long,
 * out the way the right hand's grip points, `s.point`), and each blade, on past the pivot from its own handle (so as
 * the fists part the blades open, and as they come together the blades snap shut); the blades' points and the middle
 * of their ends (what strikes).
 */
export function shearsOf(s: Skeleton): { pivot: V3; gripL: V3; gripR: V3; tipL: V3; tipR: V3; mid: V3; open: number } {
  const gL = s.handL;
  const gR = s.handR;
  const m = lerp3(gL, gR, 0.5);
  const across = sub(gR, gL);
  const d = Math.hypot(across[0], across[1], across[2]);
  const half = Math.min(d / 2, SHEARS.handle * 0.97);
  const ac = norm(across, [0, -1, 0]);
  // (the pivot out along the grip's way, square to the line between the fists)
  const way = norm(sub(s.point, mul(ac, dot(s.point, ac))), [1, 0, 0]);
  const pivot = add(m, mul(way, Math.sqrt(SHEARS.handle * SHEARS.handle - half * half)));
  const tipOf = (g: V3): V3 => add(pivot, mul(norm(sub(pivot, g), way), SHEARS.blade));
  const tipL = tipOf(gL);
  const tipR = tipOf(gR);
  return { pivot, gripL: gL, gripR: gR, tipL, tipR, mid: lerp3(tipL, tipR, 0.5), open: half / SHEARS.handle };
}
/** THE SHEARS: two ash handles, the iron pivot, two long straight blades; a pink glint along them as they are raised and opened to strike (the warning). */
function shears(put: Put, s: Skeleton, glint: number): void {
  const k = shearsOf(s);
  for (const [g, tip] of [[k.gripL, k.tipL], [k.gripR, k.tipR]] as const) {
    const way = norm(sub(k.pivot, g), [1, 0, 0]);
    put('shears', 'shears', { k: 'rod', a: add(g, mul(way, -1.6)), b: add(k.pivot, mul(way, -1.4)), ra: 0.72, rb: 0.62, ramp: ASH });
    put('shears', 'shears', { k: 'rod', a: add(k.pivot, mul(way, -1.6)), b: add(k.pivot, mul(way, 0.6)), ra: 0.7, rb: 0.75, ramp: IRON });
    put('shears', 'shears', { k: 'rod', a: add(k.pivot, mul(way, 0.4)), b: tip, ra: 1.0, rb: 0.42, ramp: IRON });
  }
  put('shears', 'shears', { k: 'ball', c: k.pivot, ax: sphere(0.9), skin: IRON });
  if (glint > 0.05) put('glint', 'shears', { k: 'glow', p: k.mid, c: FLAME[1], r: 5 + 5 * glint, a: 0.45 * glint });
}

// =============================================================================================
// THE PITCHFORK: a long ash shaft; three iron tines on a crossbar

/** Its length from the butt to the tines' points; where the iron begins; how far apart the outer tines stand. */
export const FORK = { long: 58, socket: 46, bar: 48, spread: 2.6 } as const;
/** Where the right hand holds it, from the butt: `draw` 0 down by the butt (to jab at full reach), 1 high up the shaft (as the dredgers' boathook, art/dredgers.ts POLE_HOLD). */
export const FORK_HOLD = (draw: number): number => 6 + 44 * clamp01(draw);
/** The fork as it is at a moment: its butt, the way it runs, a place this far along it; the tines' points, and the middle one (what strikes). */
export function forkOf(s: Skeleton, q: { draw: number }): { butt: V3; way: V3; across: V3; at: (k: number) => V3; tines: [V3, V3][]; tip: V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const butt = add(s.handR, mul(way, -FORK_HOLD(q.draw)));
  const at = (k: number): V3 => add(butt, mul(way, k));
  const tines: [V3, V3][] = [-1, 0, 1].map((i) => [add(at(FORK.bar), mul(across, i * FORK.spread)), add(at(FORK.long), mul(across, i * FORK.spread * 1.15))]);
  return { butt, way, across, at, tines, tip: at(FORK.long) };
}
/** THE PITCHFORK: the ash shaft, an iron ferrule, the crossbar and its three tines curving a little up at their points; a pink glint at the tines as it is drawn back to jab (the warning). */
function pitchfork(put: Put, s: Skeleton, q: { draw: number }, glint: number): void {
  const f = forkOf(s, q);
  const up = norm(cross(f.way, f.across), [0, 0, 1]);
  put('fork', 'fork', { k: 'rod', a: f.at(0.4), b: f.at(FORK.socket), ra: 0.85, rb: 0.8, ramp: ASH });
  put('fork', 'fork', { k: 'rod', a: f.at(FORK.socket - 0.6), b: f.at(FORK.bar), ra: 0.95, rb: 0.85, ramp: IRON });
  put('fork', 'fork', { k: 'rod', a: add(f.at(FORK.bar), mul(f.across, -FORK.spread - 0.3)), b: add(f.at(FORK.bar), mul(f.across, FORK.spread + 0.3)), ra: 0.6, rb: 0.6, ramp: IRON });
  for (const [a, b] of f.tines) {
    const bend = add(lerp3(a, b, 0.7), mul(up, 0.25));
    put('fork', 'fork', { k: 'rod', a, b: bend, ra: 0.5, rb: 0.42, ramp: IRON });
    put('fork', 'fork', { k: 'rod', a: bend, b: add(b, mul(up, 0.8)), ra: 0.42, rb: 0.18, ramp: IRON });
  }
  if (glint > 0.05) put('glint', 'fork', { k: 'glow', p: f.at(FORK.long - 4), c: FLAME[1], r: 5 + 5 * glint, a: 0.45 * glint });
}

// =============================================================================================
// THEM AS SOLIDS

/** A sleeve from shoulder to wrist (or rolled to the elbow, the forearm bare), a cuff, and the hand closed on a handle or slack. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', upper: Ramp, lower: Ramp, cuff: Ramp | null, cuffAt: number, grip: number, cu: V3): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = HB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.15), skin: upper, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.12, rb: r1 * 1.1, ramp: upper, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.1), skin: upper, far: true });
  const wrist = add(hand, mul(fore, -1.2));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: wrist, ra: r1 * 1.06, rb: r2 * 1.1, ramp: lower, far: true });
  if (cuff) put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, cuffAt), b: lerp3(el, wrist, cuffAt + 0.24), ra: r1 * 1.28, rb: r1 * 1.24, ramp: cuff, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.7), mul(e2, 1.5), mul(e1, 0.9)], skin: SKIN, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.3;
    const base = add(hand, add(mul(fore, 1.4), mul(e2, spread * 0.85)));
    const mid = add(base, add(mul(fore, 1.3 * (1 - 0.5 * grip)), mul(e1, -0.9 - 0.4 * grip)));
    const tip = add(mid, add(mul(fore, 0.9 * (1 - 0.8 * grip)), mul(e1, -1.2 - 0.3 * grip)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.5, rb: 0.42, ramp: SKIN, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.42, rb: 0.3, ramp: SKIN, far: true });
  }
}
/** A boot: its foot. */
function boot(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.6)), ax: [mul(fwd, 4.8), mul(side3, 2.1), mul(up3, 1.7)], skin: BOOT, far: true });
}
/** A leg: the thigh in its breeches; the gardener's leather gaiters buckled to the knee, or the groom's tall boots with their tan tops. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R', who: PalaceWho): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const [rH, rK, rA] = HB.legR;
  const thigh = who === 'gardener' ? CORD : BREECHES;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.08, rb: rK * 1.08, ramp: thigh, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.1), skin: thigh, far: true });
  if (who === 'gardener') {
    put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.1, rb: rA * 1.2, ramp: GAITER, far: true });
    for (let i = 1; i <= 2; i++) {
      const c = lerp3(knee, ankle, i / 3);
      put(`shin${side}`, `strap${side}`, { k: 'rod', a: add(c, [0, 0, -0.3]), b: add(c, [0, 0, 0.3]), ra: rK * 1.2 - 0.05 * i, rb: rK * 1.2 - 0.05 * i, ramp: BOOT, far: true });
    }
  } else {
    put(`shin${side}`, `shin${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.22), b: ankle, ra: rK * 1.14, rb: rA * 1.22, ramp: BOOT, far: true });
    put(`shin${side}`, `top${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.04), b: lerp3(knee, ankle, 0.24), ra: rK * 1.26, rb: rK * 1.2, ramp: TAN, far: true });
  }
  boot(put, s, side);
}

/** The torso from the throat down to `hem` (if any), padded out by what is worn. */
function torsoRings(s: Skeleton, pad: number, hem: Ring | null): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.6));
  const rings: Ring[] = [];
  if (hem) rings.push(hem);
  rings.push(
    { c: waistC, u: mul(be[0], HB.waistDeep + 1.4 + pad), v: mul(be[1], HB.waistHalf + 1.4 + pad) },
    { c: s.ribs, u: mul(cf, HB.ribDeep + 1.6 + pad), v: mul(cl, HB.ribHalf + 1.8 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, HB.ribDeep + 1.0 + pad), v: mul(cl, HB.shoulderHalf + 0.4 + pad) },
    { c: add(s.neck, mul(cu, -0.8)), u: mul(cf, 3.2), v: mul(cl, 3.8) },
  );
  return rings;
}
/** A ring round the hips (the hem of a coat or a waistcoat), hanging back a little as they go. */
function hipRing(s: Skeleton, drop: number, pad: number, lag: V3): Ring {
  return { c: add(add(s.pelvis, mul(s.hips[2], -drop)), mul(lag, 0.5)), u: mul(s.hips[0], HB.pelvisDeep + 1.8 + pad), v: mul(s.hips[1], HB.pelvisHalf + 2.0 + pad) };
}

/** THE HEAD: a drained face, the cult's dull pink in the eyes, the mouth hanging open and working; the gardener's broad felt hat, the groom's hair tied back in a queue. Returns the mouth. */
function head(put: Put, st: Stage, s: Skeleton, who: PalaceWho, jaw: number, lit: number, lag: V3): V3 {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [HB.headR[0] * 1.02, HB.headR[1] * 1.08, HB.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.3));
  const hairOf = who === 'gardener' ? GREY_HAIR : HAIR;
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    const open = 0.08 + 0.2 * jaw;
    if (fwd > 0.7 && side < 0.24 && u[2] < -0.32 && u[2] > -0.32 - open * 1.5) return u[2] > -0.38 ? '#22161a' : INK;
    if (fwd > 0.45 && fwd < 0.75 && side > 0.42 && side < 0.7 && u[2] < -0.1 && u[2] > -0.5) return SKIN[Math.max(0, tone - 1)];
    if (fwd > 0.88 && side < 0.14 && u[2] > -0.24 && u[2] < 0.1) return SKIN[Math.min(4, tone + 1)];
    // (the gardener's grey side-whiskers)
    if (who === 'gardener' && fwd > 0.1 && fwd < 0.6 && side > 0.55 && u[2] < -0.05 && hash(Math.floor(u[1] * 12), Math.floor(u[2] * 12), 7411) < 0.6) return GREY_HAIR[tone];
    if (fwd < 0.1 && u[2] > -0.45) return hairOf[tone];
    if (who === 'groom' && u[2] > 0.5) return hairOf[tone];
    return SKIN[tone];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 0.88), add(mul(fl, k * hr[1] * 0.12), mul(fu, hr[2] * 0.3))));
    const b = add(hc, add(mul(ff, hr[0] * 0.72), add(mul(fl, k * hr[1] * 0.6), mul(fu, hr[2] * 0.24))));
    put('head', 'brows', { k: 'rod', a, b, ra: 0.75, rb: 0.6, ramp: hairOf });
  }
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.92), add(mul(fl, k * hr[1] * 0.34), mul(fu, hr[2] * 0.1))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#3a2a30', facing: ff });
  }
  if (who === 'gardener') {
    // a broad-brimmed felt hat, its crown dented, its brim turned down all round
    const top = add(hc, mul(fu, hr[2] * 0.55));
    put('hat', 'hat', { k: 'ball', c: add(top, mul(fu, 0.7)), ax: [mul(ff, hr[0] * 0.95), mul(fl, hr[1] * 0.95), mul(fu, hr[2] * 0.66)], skin: (u, tone) => (u[2] < -0.4 ? null : FELT[u[2] > 0.75 && Math.abs(u[1]) < 0.2 ? Math.max(0, tone - 1) : tone]) });
    put('hat', 'brim', { k: 'ball', c: add(add(top, mul(fu, -1.3)), mul(lag, 0.2)), ax: [mul(norm(add(ff, mul(fu, -0.1))), hr[0] * 2.0), mul(fl, hr[1] * 1.9), mul(norm(add(fu, mul(ff, 0.1))), 0.6)], skin: FELT });
    put('hat', 'band', { k: 'band', ring: { c: add(top, mul(fu, -0.2)), u: mul(ff, hr[0] * 0.98), v: mul(fl, hr[1] * 0.98) }, ramp: LEATHER, rows: 1 });
  } else {
    // his hair drawn back and tied at the nape in a short queue, a black ribbon round it
    const nape = add(hc, add(mul(ff, -hr[0] * 0.92), mul(fu, -hr[2] * 0.25)));
    const end = add(add(nape, add(mul(ff, -1.2), mul(fu, -4.4))), mul(lag, 0.5));
    put('hat', 'queue', { k: 'rod', a: nape, b: end, ra: 1.1, rb: 0.6, ramp: HAIR });
    put('hat', 'ribbon', { k: 'ball', c: lerp3(nape, end, 0.15), ax: [mul(ff, 0.9), mul(fl, 1.5), mul(fu, 0.9)], skin: RIBBON });
  }
  return add(hc, add(mul(ff, hr[0] * 1.02), mul(fu, -hr[2] * 0.4)));
}

/** The Hush leaking out of them at each moment, laid after their edge (Mob.grains). */
const BREATH = new WeakMap<Moment, [V3, string, number][]>();
/** What a moment of a move says over and above the bones: whether the tool has fallen from the hands. */
export interface PalaceSay {
  dropped: (m: Moment) => boolean;
}
function palaceBits(who: PalaceWho, st: Stage, m: Moment, say: PalaceSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const breath: [V3, string, number][] = [];
  BREATH.set(m, breath);
  const put: Put = (part, piece, shape) => {
    if (shape.k === 'mote' && part === 'hush') {
      breath.push([shape.p, shape.c, shape.size]);
      return;
    }
    bits.push({ part, piece, shape });
  };
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.5, 3.0);
  const jaw = clamp01(m.jaw ?? 0.4);
  const seed = who === 'gardener' ? 6 : 7;
  const held = !say.dropped(m);
  for (const side of ['L', 'R'] as const) leg(put, s, side, who);
  if (who === 'gardener') {
    // A GARDENER: his shirt, a waistcoat of hedge green to the hips; over it a long bib apron of leather, strapped round
    // his neck and his waist, to the middle of his thighs; his shirtsleeves rolled to the elbow
    put('body', 'waistcoat', { k: 'cloth', rings: torsoRings(s, 0.6, hipRing(s, 1.4, 0.6, lag)), ramp: WAISTCOAT, look: { folds: [0, 30, -30, 90, -90, 150, -150], lift: 0.05 } });
    put('body', 'collar', { k: 'band', ring: { c: add(s.neck, mul(cu, -1.0)), u: mul(cf, 3.4), v: mul(cl, 4.0) }, ramp: LINEN, rows: 1 });
    // the apron: its bib over the chest, and from the waist down over the thighs, reaching past whichever thigh is
    // further forward
    const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
    const l: V3 = [-f[1], f[0], 0];
    const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.55));
    const out = Math.max(...[lerp3(s.hipL, s.kneeL, 0.6), lerp3(s.hipR, s.kneeR, 0.6)].map((p) => dot(sub(p, waistC), f))) + HB.legR[0] * 1.08 + 1.2;
    const top = add(waistC, mul(s.belly[0], HB.waistDeep + 2.3));
    const thighZ = Math.min(lerp3(s.hipL, s.kneeL, 0.62)[2], lerp3(s.hipR, s.kneeR, 0.62)[2]);
    const low: V3 = add([waistC[0], waistC[1], thighZ], add(mul(f, Math.max(HB.waistDeep + 2.3, out)), mul(lag, 0.6)));
    const apronSkin = (a: number, b: number, front: boolean, tone: number): string => (front ? (hash(Math.round(a * 4), Math.round(b * 4), 7412) > 0.88 ? LEATHER[Math.max(0, tone - 1)] : LEATHER[tone]) : LEATHER[Math.max(0, tone - 1)]);
    put('apron', 'apron', { k: 'panel', c: add(lerp3(top, low, 0.5), mul(f, 0.4)), u: mul(l, HB.waistHalf + 1.4), v: mul(sub(low, top), -0.5), skin: apronSkin });
    const bibTop = add(lerp3(s.ribs, s.neck, 0.62), mul(cf, HB.ribDeep + 1.6));
    const bibLow = add(lerp3(s.ribs, waistC, 0.65), mul(cf, HB.ribDeep + 2.2));
    put('apron', 'bib', { k: 'panel', c: lerp3(bibTop, bibLow, 0.5), u: mul(cl, HB.ribHalf * 0.75), v: mul(sub(bibLow, bibTop), -0.5), skin: apronSkin });
    for (const k of [-1, 1]) put('apron', 'strap', { k: 'rod', a: add(bibTop, mul(cl, k * HB.ribHalf * 0.7)), b: add(add(s.neck, mul(cl, k * 2.6)), mul(cu, -0.4)), ra: 0.35, rb: 0.35, ramp: LEATHER });
    put('body', 'ink', { k: 'ball', c: add(add(lerp3(s.ribs, s.neck, 0.3), mul(cf, HB.ribDeep + 1.7)), mul(cl, HB.ribHalf * 0.75)), ax: [mul(cf, 0.5), mul(cl, 1.4), mul(cu, 1.6)], skin: () => INKBLOT });
    for (const side of ['L', 'R'] as const) arm(put, s, side, LINEN, SKIN, LINEN, 0.0, held ? 1 : 0.4, cu);
  } else {
    // A GROOM: the palace's livery, a short coat of faded madder to the hips, its collar and cuffs buff, a row of dull
    // brass buttons down its front
    put('body', 'coat', { k: 'cloth', rings: torsoRings(s, 0.8, hipRing(s, 2.4, 0.9, lag)), ramp: LIVERY, look: { folds: [0, 25, -25, 80, -80, 140, -140, 180], lift: 0.05 } });
    put('body', 'collar', { k: 'band', ring: { c: add(s.neck, mul(cu, -0.9)), u: mul(cf, 3.6), v: mul(cl, 4.2) }, ramp: BUFF, rows: 2 });
    const waistC = add(s.pelvis, mul(s.hips[2], HB.waist * 0.6));
    for (let i = 0; i < 4; i++) {
      const c = lerp3(lerp3(s.ribs, s.neck, 0.55), waistC, i / 3.2);
      const deep = i < 2 ? HB.ribDeep + 1.6 + 0.8 : HB.waistDeep + 1.4 + 0.9 + (3 - i) * 0.3;
      put('body', 'buttons', { k: 'ball', c: add(c, mul(i < 2 ? cf : s.belly[0], deep + 0.2)), ax: sphere(0.55), skin: [BUTTON, BUTTON, BUTTON, BUTTON, BUTTON] });
    }
    put('body', 'ink', { k: 'ball', c: add(add(s.ribs, mul(cf, HB.ribDeep + 2.2)), mul(cl, -HB.ribHalf * 0.6)), ax: [mul(cf, 0.5), mul(cl, 1.6), mul(cu, 1.4)], skin: () => INKBLOT });
    for (const side of ['L', 'R'] as const) arm(put, s, side, LIVERY, LIVERY, BUFF, 0.66, held ? 1 : 0.4, cu);
  }
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 2.2, rb: 2.0, ramp: SKIN });
  const mouth = head(put, st, s, who, jaw, lit, lag);
  // (painted even once dropped: as they die it falls from them as a piece of its own, Mob.fall)
  const glint = held ? clamp01(m.glint) : 0;
  if (who === 'gardener') shears(put, s, glint);
  else pitchfork(put, s, q as unknown as { draw: number }, glint);
  const [ff, fl] = wornOn(st, s, 8);
  const puff = m.dying ? Math.max(0, 2.2 * (1 - clamp01((m.t - 0.15) / 1.1))) : 0.7 + 0.8 * clamp01(m.glint);
  hushBreath(put, mouth, ff, fl, m.t, puff, seed);
  if (m.dying) hushLeaves(put, mouth, ff, fl, m.t, seed, 0.12, 1.7);
  return bits;
}

/** Their rest, as floor 11's Hushed: slack, the head hung a little. */
export const PH_REST: Bones = { ...HUSHED_REST };

/** THEM AS THE PAINTER TAKES THEM. */
export function palacePainter(who: PalaceWho, say: PalaceSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => palaceBits(who, st, m, say), grains: (_st, m) => BREATH.get(m) ?? [] };
}
