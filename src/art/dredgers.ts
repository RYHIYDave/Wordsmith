// FLOOR 12'S MEDIUM MOB, THE ORDER'S DREDGERS (the art chat for floors 11 to 15, 19 Oct 2026). A MOCK-UP: NOT IN THE
// GAME. Nothing of the game imports this file; `DREDGERS_ON` is off. Their moves are art/dredgers_moves.ts.
//
// His doc "Wordsmith Act 2: The Hush" (the planning chat's, with his yes as ideas), level 12, THE UNDERCITY: its
// enemies "the Hushed, the Silent Order, and things that live in the sewers"; the Silent Order "came in through the
// sewers during the siege and is stealing people's words". And his word to this chat of 18 Oct, 21:24 Pacific: “Hey go
// without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”. So
// their brief is this chat's, the picks it would have marked recommended, sent him with their films:
// - WHO THEY ARE: the Silent Order's labourers in the sewers. They wade the channels with long boathooks, fishing out
//   the voice jars the Rat King's brood drags off, and carry them back in wicker creels on their backs. Stooped from
//   the low vaults, the knight's height and heavier.
// - WHAT MARKS THEM: the Order's BLANK WHITE MASK (the scribes' own, art/scribes.ts), smeared with the sewer's muck,
//   the cult's dull pink in its eye slits, under a black hood; a long OILSKIN COAT to the knee, dark olive, its wet
//   sheen; WADERS to the thigh; heavy leather gauntlets; THE CREEL on the back, its jars of stolen voices glowing
//   faint pink, a voice leaking up out of them now and then.
// - THEIR BLOW, THE HOOK AND HAUL: the boathook levelled low in both hands and drawn back, its hook glinting pink, held
//   shaking (the warning); a lunge, the pole thrust out its whole length; a twist as the hook bites; and a hard haul
//   back, leaning into it, stepping back (what it does to the hero, a pull toward them, is the main chat's).
// - THEIR DEATH: the jars in the creel burst, the voices pouring up out of it, pink going pale as they go free (as
//   the Rat King's do); the lid flung off, the boathook dropped; emptied, they sink to their knees and fall on their
//   faces.
// And his words of 18 Oct on the act's enemies: Act 2's own, nothing of Act 1's (no cult robe, no bone, no violet).
//
// ON THE HEROES' BONES (art/skeleton.ts), as the watch and the scribes are; the boathook held as the watch hold their
// halberds (art/hushed_watch.ts `halberdGrip`, its like here as `poleGrip`).

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { sphere } from './new_mobs3';
import type { Bit, MobCanvas, Moment, Put } from './new_mobs3';
import { wornOn } from './skin';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, dot, elbowFor, len, lerp3, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

/** THE SWITCH, OFF. Nothing of the game reads this file. */
export const DREDGERS_ON = { on: false };

const fr = (t: number): number => t - Math.floor(t);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// =============================================================================================
// THEIR COLOURS: oilskin, wet rubber, leather, wicker; the Order's black and white

/** The oilskin coat: a dark olive black, its wet sheen pale on the turn toward the light. */
const OIL: Ramp = ['#0e100c', '#0e100c', '#2a2e24', '#40463a', '#5c6350'];
/** The waders: black, wet. */
const WADER: Ramp = ['#0a0a0c', '#0a0a0c', '#1e1e24', '#2e2e36', '#4a4a54'];
const LEATHER: Ramp = ['#1a120e', '#1a120e', '#3e2c20', '#56402e', '#56402e'];
const IRON: Ramp = ['#1a1c22', '#1a1c22', '#464b55', '#6e7480', '#6e7480'];
/** The Order's black: their hoods. */
const ROBE: Ramp = ['#0e0d13', '#0e0d13', '#2b2835', '#423e4e', '#423e4e'];
/** The blank mask: white porcelain (the scribes'), the muck of the sewer on it. */
const MASK: Ramp = ['#5a5660', '#5a5660', '#bcb7c2', '#e4e0e8', '#e4e0e8'];
const MUCK: Ramp = ['#2a2a1e', '#2a2a1e', '#5a5840', '#77744f', '#77744f'];
/** The boathook's pole: ash, black with the sewer at its business end. */
const ASH: Ramp = ['#22180e', '#22180e', '#5a4630', '#7a6244', '#7a6244'];
const SLIMED: Ramp = ['#10120c', '#10120c', '#2c3022', '#3e4430', '#3e4430'];
/** Wicker. */
const WICKER: Ramp = ['#2a2012', '#2a2012', '#5e4a2c', '#7c6440', '#94794e'];
/** The jars' glass, dull green, and their corks. */
const GLASS: Ramp = ['#1e261c', '#1e261c', '#3a4834', '#52624a', '#6c7e62'];
const CORK: Ramp = ['#3a2a1a', '#3a2a1a', '#7a5e3c', '#9a7a50', '#9a7a50'];
/** A voice gone free: pale (the Rat King's). */
const FREED = ['#7a7468', '#a49c8c', '#cec6b2', '#e8e2d2', '#f6f2e6'];

// =============================================================================================
// THE BODY

/** The knight's height (58) and a little over, heavy, stooped. */
export const DREDGER_BODY: Build = buildOf(61, 1.3, { shoulders: 1.08, chest: 1.06, depth: 1.06, waist: 1.06, hips: 1.02, arms: 1.04, trunk: 1.0, limbs: 1.0 });
const DB = DREDGER_BODY;
/** Their picture: room for the boathook thrust out its whole length before them. */
export const DREDGER_CANVAS: MobCanvas = { w: 380, h: 300, ax: 170, ay: 210 };

// =============================================================================================
// THE BOATHOOK

/** Its length from the butt to the point of its spike; where its iron head begins; its hook, standing out from the pole and curving back toward the butt. */
export const POLE = { long: 86, socket: 77, spike: 80.5, hookAt: 79.5, hookOut: 4.6, barb: 75.5 } as const;
/** Where their right hand holds it, from the butt: `draw` 0 down by the butt (to thrust it at full reach), 1 high up the pole (to carry it). */
export const POLE_HOLD = (draw: number): number => 6 + 44 * clamp01(draw);
/** The boathook as it is at a moment: its butt, the way it runs (butt to point), the way its hook stands out, a place this far along it; the hook's bend (what strikes, and bites) and its barb's point. */
export function poleOf(s: Skeleton, q: { draw: number }): { butt: V3; way: V3; across: V3; at: (k: number) => V3; tip: V3; hook: V3; barb: V3 } {
  const way = s.point;
  const across = norm(sub(s.across, mul(way, dot(s.across, way))), [0, 1, 0]);
  const butt = add(s.handR, mul(way, -POLE_HOLD(q.draw)));
  const at = (k: number): V3 => add(butt, mul(way, k));
  return { butt, way, across, at, tip: at(POLE.long), hook: add(at(POLE.hookAt), mul(across, POLE.hookOut)), barb: add(at(POLE.barb), mul(across, POLE.hookOut * 0.62)) };
}
/**
 * The boathook held in their right hand at `hand` (from their place on the floor, along their own forward, left and
 * up), pointing `way` (from the butt), its hook standing out along `across`, the hand `draw` of the way up it; their
 * left hand `left` along it from the right toward the head, or free (null). (As the watch hold their halberds.)
 */
export function poleGrip(hand: V3, way: V3, across: V3, draw: number, left: number | null): Partial<Bones> {
  const w = norm(way);
  const D = 180 / Math.PI;
  const wAz = Math.atan2(w[1], w[0]) * D;
  const wEl = Math.asin(Math.max(-1, Math.min(1, w[2]))) * D;
  let flat = sub([0, 0, 1], mul(w, w[2]));
  if (Math.hypot(...flat) < 1e-3) flat = [-1, 0, 0];
  flat = norm(flat);
  const ac = norm(sub(across, mul(w, dot(across, w))), flat);
  const wRoll = Math.atan2(dot(cross(flat, ac), w), dot(flat, ac)) * D;
  return { rhIn: 2, rhx: hand[0], rhy: hand[1], rhz: hand[2], wAz, wEl, wRoll, draw, ...(left === null ? {} : { lhIn: 3 as const, lhx: left, lhy: 0, lhz: 0 }) };
}
/** The boathook stood on its butt at their right side, their right hand round it at `z`, leaning `lean` degrees forward from upright, its hook out to `across`. */
export function polePlanted(hand: [number, number], z: number, lean: number, across: V3 = [1, 0, 0]): Partial<Bones> {
  const el = (90 - lean) * (Math.PI / 180);
  const way: V3 = [Math.cos(el), 0, Math.sin(el)];
  // (so far up it that its butt just rests on the floor: its iron shoe is 1.0 thick)
  const hold = (z - 1.05) / way[2];
  return poleGrip([hand[0], hand[1], z], way, across, (hold - 6) / 44, null);
}

const REST0: Bones = {
  ...standing(DB),
  pz: -0.8, pitch: 6, bend: 8, roll: 1, side: 0, faceUp: 4, faceTilt: -4, faceTurn: 2,
  lfx: 1.0, lfy: 1.8, lft: 12, lk: 9, rfx: -0.8, rfy: -1.8, rft: -10, rk: -9,
  lhIn: 1, lhx: 4.5, lhy: 3.0, lhz: -20, le: -10,
  ...polePlanted([4.6, -11.8], 40, 4, [0.3, -0.95, 0]),
  pt: 0, out: 0,
} as Bones;
/** Their rest: stooped, leaning on the boathook stood at their right side, its hook turned out; the left hand hanging; the masked head lifted, listening. */
export const DREDGER_REST: Bones = { ...REST0, re: elbowFor(DB, REST0 as Posed, false, norm([-0.7, -0.05, -1])) };

// =============================================================================================
// THEM AS SOLIDS

/** How the figure's going drags what hangs off it. */
export function lagOf(m: Moment, k: number, most: number): V3 {
  const raw = mul(m.come, -k);
  const l = len(raw);
  return l > most ? mul(raw, most / l) : raw;
}

/** An oilskin sleeve from shoulder to wrist, a leather gauntlet with a wide cuff, its fingers closed round the pole or hanging half-curled. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, curl: number): void {
  const sh = side === 'L' ? s.shoulderL : s.shoulderR;
  const el = side === 'L' ? s.elbowL : s.elbowR;
  const hand = side === 'L' ? s.handL : s.handR;
  const [r0, r1, r2] = DB.armR;
  const fore = norm(sub(hand, el), [0, 0, -1]);
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: sphere(r0 * 1.26), skin: OIL, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.22, rb: r1 * 1.22, ramp: OIL, far: true });
  put(`fore${side}`, `fore${side}`, { k: 'ball', c: el, ax: sphere(r1 * 1.22), skin: OIL, far: true });
  const wrist = add(hand, mul(fore, -1.3));
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: el, b: lerp3(el, wrist, 0.6), ra: r1 * 1.18, rb: r2 * 1.2, ramp: OIL, far: true });
  // the gauntlet's wide cuff, over the sleeve
  put(`fore${side}`, `cuff${side}`, { k: 'rod', a: lerp3(el, wrist, 0.5), b: wrist, ra: r1 * 1.42, rb: r2 * 1.2, ramp: LEATHER, far: true });
  const e1 = norm(sub(cu, mul(fore, dot(cu, fore))), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  put(`hand${side}`, `hand${side}`, { k: 'ball', c: add(hand, mul(fore, 0.4)), ax: [mul(fore, 1.9), mul(e2, 1.7), mul(e1, 1.15)], skin: LEATHER, far: true });
  for (let i = 0; i < 4; i++) {
    const spread = (i - 1.5) * 0.36;
    const base = add(hand, add(mul(fore, 1.5), mul(e2, spread * 0.9)));
    const mid = add(base, add(mul(fore, 1.4 * (1 - 0.4 * curl)), mul(e1, -1.1 * curl)));
    const tip = add(mid, add(mul(fore, 1.0 * (1 - 0.8 * curl)), mul(e1, -1.4 * curl)));
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.6, rb: 0.52, ramp: LEATHER, far: true });
    put(`hand${side}`, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.52, rb: 0.4, ramp: LEATHER, far: true });
  }
}

/** A leg in its wader: black and wet from the foot to high on the thigh, a strap at the top; a big wader's foot. */
function leg(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const hip = side === 'L' ? s.hipL : s.hipR;
  const knee = side === 'L' ? s.kneeL : s.kneeR;
  const ankle = side === 'L' ? s.ankleL : s.ankleR;
  const heel = side === 'L' ? s.heelL : s.heelR;
  const toe = side === 'L' ? s.toeL : s.toeR;
  const [rH, rK, rA] = DB.legR;
  put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: rH * 1.12, rb: rK * 1.16, ramp: WADER, far: true });
  put(`leg${side}`, `leg${side}`, { k: 'ball', c: knee, ax: sphere(rK * 1.18), skin: WADER, far: true });
  const shin = norm(sub(ankle, knee), [0, 0, -1]);
  put(`shin${side}`, `shin${side}`, { k: 'rod', a: knee, b: ankle, ra: rK * 1.16, rb: rA * 1.32, ramp: WADER, far: true });
  // (a band where the wader's leg is turned and strapped, below the knee)
  put(`shin${side}`, `strap${side}`, { k: 'rod', a: add(knee, mul(shin, 2.0)), b: add(knee, mul(shin, 3.0)), ra: rK * 1.3, rb: rK * 1.28, ramp: LEATHER, far: true });
  const fwd = norm(sub(toe, heel), [1, 0, 0]);
  const side3 = norm(Math.abs(fwd[2]) < 0.95 ? [-fwd[1], fwd[0], 0] : cross(s.hips[2], fwd), [0, 1, 0]);
  const up3 = norm(cross(fwd, side3), [0, 0, 1]);
  put(`foot${side}`, `foot${side}`, { k: 'ball', c: add(lerp3(heel, toe, 0.5), mul(up3, 1.8)), ax: [mul(fwd, 5.2), mul(side3, 2.4), mul(up3, 1.9)], skin: WADER, far: true });
}

/** The torso as rings from the throat down to `hem` (a ring round both thighs). */
function torsoRings(s: Skeleton, pad: number, hem: Ring): Ring[] {
  const [cf, cl, cu] = s.chest;
  const be = s.belly;
  const waistC = add(s.pelvis, mul(s.hips[2], DB.waist * 0.6));
  return [
    hem,
    { c: add(s.pelvis, mul(s.hips[2], -1.4)), u: mul(s.hips[0], DB.pelvisDeep + 2.2 + pad), v: mul(s.hips[1], DB.pelvisHalf + 2.4 + pad) },
    { c: waistC, u: mul(be[0], DB.waistDeep + 1.8 + pad), v: mul(be[1], DB.waistHalf + 1.8 + pad) },
    { c: s.ribs, u: mul(cf, DB.ribDeep + 1.9 + pad), v: mul(cl, DB.ribHalf + 2.0 + pad) },
    { c: lerp3(s.ribs, s.neck, 0.72), u: mul(cf, DB.ribDeep + 1.3 + pad), v: mul(cl, DB.shoulderHalf + 0.8 + pad) },
    // (its high collar, turned up round the neck)
    { c: add(s.neck, mul(cu, 0.4)), u: mul(cf, 4.2 + pad * 0.5), v: mul(cl, 4.8 + pad * 0.5) },
  ];
}

/** A ring round both thighs `down` of the way from the hips to the knees, hanging back as they go. */
function thighRing(s: Skeleton, down: number, pad: number, lag: V3): Ring {
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const l: V3 = [-f[1], f[0], 0];
  const a = lerp3(s.hipL, s.kneeL, down);
  const b = lerp3(s.hipR, s.kneeR, down);
  const c = lerp3(a, b, 0.5);
  const spanF = Math.abs(dot(sub(a, b), f));
  const spanL = Math.abs(dot(sub(a, b), l));
  const rT = DB.legR[0] * 1.12;
  return {
    c: add(c, mul(lag, 0.7)),
    u: mul(f, Math.max(DB.pelvisDeep + 2.0, spanF / 2 + rT + 1.2) + pad),
    v: mul(l, Math.max(DB.pelvisHalf + 2.2, spanL / 2 + rT + 1.2) + pad),
  };
}

/**
 * THE HEAD: in the Order's black hood, THE BLANK WHITE MASK over the face (the scribes'), smooth, no mouth, two slits
 * for the eyes with the cult's dull pink in them (going out as they die), the sewer's muck smeared on it.
 */
function head(put: Put, st: Stage, s: Skeleton, lit: number, lag: V3): { ff: V3; fl: V3; fu: V3 } {
  const [ff, fl, fu] = wornOn(st, s, 8);
  const hr: V3 = [DB.headR[0] * 1.0, DB.headR[1] * 1.06, DB.headR[2] * 1.0];
  const hc = add(s.head, mul(fu, -0.3));
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin: ROBE });
  // THE HOOD: round the head, open at the face, its peak falling back
  put('hood', 'hood', {
    k: 'ball', c: add(hc, add(mul(ff, -0.7), mul(fu, 0.6))), ax: [mul(ff, hr[0] * 1.3), mul(fl, hr[1] * 1.34), mul(fu, hr[2] * 1.22)],
    skin: (u, tone) => (u[0] > 0.28 && Math.abs(u[1]) < 0.8 && u[2] < 0.62 ? null : u[0] > 0.16 && Math.abs(u[1]) < 0.9 && u[2] < 0.72 ? ROBE[Math.min(4, tone + 1)] : ROBE[tone]),
  });
  const peak = add(hc, add(mul(ff, -hr[0] * 1.5), mul(fu, hr[2] * 0.2)));
  put('hood', 'hood', { k: 'rod', a: add(hc, add(mul(ff, -hr[0] * 0.8), mul(fu, hr[2] * 0.5))), b: add(add(peak, [0, 0, -4.5]), mul(lag, 1.0)), ra: hr[1] * 0.8, rb: 0.6, ramp: ROBE });
  // THE MASK, the muck of the sewer smeared up its chin and one cheek
  const mc = add(hc, mul(ff, hr[0] * 0.42));
  const skin: Skin = (u, tone) => {
    if (u[0] < 0.05) return null;
    if (Math.abs(u[1]) > 0.16 && Math.abs(u[1]) < 0.52 && u[2] > 0.02 && u[2] < 0.22) return '#18141e';
    if (Math.abs(u[1]) < 0.22 && u[2] < -0.42 && u[2] > -0.46 && u[0] > 0.6) return MASK[1];
    const muck = u[2] < -0.5 + 0.18 * Math.sin(u[1] * 9) || (u[1] < -0.3 && u[2] < -0.1 + 0.12 * Math.sin(u[2] * 14));
    return muck ? MUCK[tone] : MASK[Math.min(4, tone + 1)];
  };
  put('mask', 'mask', { k: 'ball', c: mc, ax: [mul(ff, hr[0] * 0.86), mul(fl, hr[1] * 0.98), mul(fu, hr[2] * 1.04)], skin });
  for (const k of [-1, 1]) {
    const e = add(mc, add(mul(ff, hr[0] * 0.86 * 0.92), add(mul(fl, k * hr[1] * 0.98 * 0.34), mul(fu, hr[2] * 1.04 * 0.12))));
    put('head', 'eyes', { k: 'dot', p: e, c: lit > 0.4 ? FLAME[1] : '#18141e', facing: ff });
  }
  return { ff, fl, fu };
}

/** THE BOATHOOK: an ash pole, black with the sewer toward its head; an iron shoe at its butt; its iron head, a socket, a spike straight on, a hook curving back; a pink glint on the hook as they draw it back to thrust (the warning). */
function boathook(put: Put, s: Skeleton, q: { draw: number }, glint: number): void {
  const h = poleOf(s, q);
  const { at, across, way } = h;
  put('pole', 'boathook', { k: 'rod', a: at(0.6), b: at(52), ra: 0.95, rb: 0.9, ramp: ASH });
  put('pole', 'boathook', { k: 'rod', a: at(52), b: at(POLE.socket), ra: 0.9, rb: 0.88, ramp: SLIMED });
  put('shoe', 'boathook', { k: 'rod', a: h.butt, b: at(2.6), ra: 1.05, rb: 1.0, ramp: IRON });
  put('socket', 'boathook', { k: 'rod', a: at(POLE.socket - 0.5), b: at(POLE.spike), ra: 1.2, rb: 1.05, ramp: IRON });
  put('spike', 'boathook', { k: 'rod', a: at(POLE.spike), b: at(POLE.long), ra: 0.95, rb: 0.2, ramp: IRON });
  // the hook: out from the socket, round, and back toward the butt to its barb
  const out = POLE.hookOut;
  const p0 = add(at(POLE.hookAt + 0.4), mul(across, 1.0));
  const p1 = add(at(POLE.hookAt + 0.6), mul(across, out * 0.8));
  const p2 = add(at(POLE.hookAt - 1.2), mul(across, out));
  const p3 = h.barb;
  put('hook', 'boathook', { k: 'rod', a: p0, b: p1, ra: 0.95, rb: 0.85, ramp: IRON });
  put('hook', 'boathook', { k: 'rod', a: p1, b: p2, ra: 0.85, rb: 0.7, ramp: IRON });
  put('hook', 'boathook', { k: 'rod', a: p2, b: p3, ra: 0.7, rb: 0.22, ramp: IRON });
  // a rag of weed caught on it
  put('weed', 'boathook', { k: 'rod', a: at(POLE.socket - 1), b: add(at(POLE.socket - 4), add([0, 0, -3.2], mul(cross(way, across), 0.6))), ra: 0.55, rb: 0.35, ramp: SLIMED });
  if (glint > 0.05) put('glint', 'boathook', { k: 'glow', p: h.hook, c: FLAME[1], r: 6 + 6 * glint, a: 0.5 * glint });
}

/** Where the creel sits on their back: its middle, and its forward, left and up (the chest's). */
function creelOf(s: Skeleton): { c: V3; f: V3; l: V3; u: V3; mouth: V3 } {
  const [cf, cl, cu] = s.chest;
  const c = add(add(s.ribs, mul(cf, -(DB.ribDeep + 2.2 + 3.6))), mul(cu, 0.8));
  return { c, f: cf, l: cl, u: cu, mouth: add(c, mul(cu, 7.2)) };
}
/** The jars in it: where each stands up out of it (from its middle, along its own left and forward). */
const JARS: readonly [number, number, number][] = [
  [-2.4, 0.4, 0.2],
  [0.3, -0.6, 1.4],
  [2.6, 0.5, 0.6],
];

/**
 * THE CREEL: a wicker basket strapped on their back, its lid tied open; three jars of stolen voices standing up out of
 * it, corked and waxed, glowing faint pink. As they die (`burst`) the jars crack and the lid is flung off (the painter
 * leaves it to Mob.fall).
 */
function creel(put: Put, s: Skeleton, burst: number, t: number): void {
  const { c, f, l, u } = creelOf(s);
  const weave: Skin = (v, tone) => {
    // (the weave: rows of withies, alternately in and out)
    const row = Math.floor((v[2] + 1) * 7);
    const col = Math.floor((Math.atan2(v[1], v[0]) / Math.PI + 1) * 9);
    if (Math.abs(v[2]) > 0.86) return WICKER[Math.max(0, tone - 1)];
    return (row + col) % 2 ? WICKER[tone] : WICKER[Math.max(0, tone - 1)];
  };
  put('creel', 'creel', { k: 'ball', c, ax: [mul(f, 3.8), mul(l, 5.0), mul(u, 7.0)], skin: weave });
  // its rim, a band of withies round its mouth
  put('creel', 'creel', { k: 'band', ring: { c: add(c, mul(u, 5.8)), u: mul(f, 3.0), v: mul(l, 4.1) }, ramp: WICKER, rows: 1 });
  // the straps, over the shoulders to its top, and under the arms to its foot
  for (const side of [1, -1]) {
    const sh = side > 0 ? s.shoulderL : s.shoulderR;
    const top = add(c, add(mul(u, 5.0), mul(l, side * 3.2)));
    const over = add(sh, add(mul(f, 0.4), mul(u, 2.4)));
    put('creel', 'strap', { k: 'rod', a: add(sh, add(mul(f, 3.2), mul(u, 0.6))), b: over, ra: 0.7, rb: 0.7, ramp: LEATHER });
    put('creel', 'strap', { k: 'rod', a: over, b: top, ra: 0.7, rb: 0.7, ramp: LEATHER });
  }
  // the jars, standing up out of it, corked, a faint pink light in each; cracked as they die
  JARS.forEach(([dl, df, du], i) => {
    const base = add(c, add(add(mul(l, dl), mul(f, df)), mul(u, 3.6 + du)));
    const neck = add(base, mul(u, 4.4));
    const crack = clamp01(burst * 3 - i * 0.4);
    put('creel', 'jar', { k: 'rod', a: base, b: neck, ra: 1.7, rb: 1.5, ramp: GLASS });
    if (crack < 0.5) {
      put('creel', 'jar', { k: 'rod', a: neck, b: add(neck, mul(u, 1.1)), ra: 0.9, rb: 0.85, ramp: GLASS });
      put('creel', 'cork', { k: 'ball', c: add(neck, mul(u, 1.5)), ax: sphere(0.95), skin: CORK });
      put('glow', 'jarglow', { k: 'glow', p: add(base, mul(u, 2.4)), c: FLAME[1], r: 4, a: 0.1 + 0.04 * Math.sin(t * 7 + i * 2) });
    }
  });
  // the lid, tied open, leaning back off its far edge
  put('lid', 'lid', { k: 'ball', c: add(c, add(mul(u, 7.6), mul(f, -4.2))), ax: [mul(norm(add(f, mul(u, 1.6))), 0.7), mul(l, 4.6), mul(norm(add(u, mul(f, -0.6))), 3.6)], skin: weave });
}

/**
 * THE VOICES IN THE JARS: while they live, a voice now and then leaking up out of a jar's cork, a few pink grains,
 * rising and gone; as they die, the jars burst and the voices pour up out of the creel in a great rush, pink going
 * pale as they go free (as the Rat King's do), until the last of them is gone.
 */
function leaking(out: [V3, string, number][], s: Skeleton, t: number): void {
  const { c, l, u, f } = creelOf(s);
  // (a thin thread of pink off each jar's cork, now and then)
  JARS.forEach(([dl, df, du], i) => {
    const top = add(c, add(add(mul(l, dl), mul(f, df)), mul(u, 3.6 + du + 6.4)));
    for (let k = 0; k < 3; k++) {
      const life = fr(t * 0.8 + i / 3 + k / 3 + 0.13 * hash(i, k, 6401));
      if (life > 0.5) continue;
      out.push([add(top, [Math.sin(life * 9 + i) * 1.2, Math.cos(life * 7 + k) * 1.0, 1.5 + life * 14]), FLAME[1], life < 0.12 ? 2 : 1]);
    }
  });
}
function pouring(out: [V3, string, number][], s: Skeleton, t: number, pour: number, freed: number, since: number): void {
  const mouth = creelOf(s).mouth;
  // (the jars bursting: a puff of pink thrown out all round the creel's mouth, gone in a third of a second)
  if (since >= 0 && since < 0.32) {
    const q = since / 0.32;
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996;
      const up = hash(i, 5, 6402) * 2 - 0.4;
      const r = (3 + 13 * Math.sqrt(q)) * (0.6 + 0.5 * hash(i, 6, 6402));
      out.push([add(mouth, [Math.cos(a) * r, Math.sin(a) * r, 1 + r * up * 0.8 - 6 * q * q]), q < 0.35 ? FLAME[3] : FLAME[2], q < 0.5 ? 2 : 1]);
    }
  }
  // (the great rush out of the burst creel: many, rising high, wavering, spreading, pink going pale)
  const N = Math.round(96 * pour);
  for (let i = 0; i < N; i++) {
    const life = fr(t * 0.75 + i / 96 + 0.21 * hash(i, 3, 6402));
    const a = i * 2.39996;
    const r = (1.4 + 9 * life) * (0.5 + hash(i, 4, 6402));
    const p = add(mouth, [Math.cos(a + life * 3) * r, Math.sin(a + life * 3) * r, 1 + life * 46 + Math.sin(life * 8 + i) * 1.8]);
    const pale = life > 0.55 - 0.4 * freed;
    out.push([p, pale ? FREED[life > 0.8 ? 4 : 3] : life < 0.25 ? FLAME[3] : FLAME[2], life < 0.4 ? 2 : 1]);
  }
}

/** The voices of them at each moment, laid after their edge (Mob.grains): grains, not a solid of them. */
const GRAINS = new WeakMap<Moment, [V3, string, number][]>();

/** What a moment of their death says: how far the jars have burst (0 whole, 1 burst), how much of the voices is pouring out of them now, how far they have gone free (pale). */
export interface DredgerSay {
  burst: (t: number) => number;
  /** When the jars burst (seconds into their death). */
  burstAt: number;
  pour: (t: number) => number;
  freed: (t: number) => number;
}

/** THE DREDGERS AS SOLIDS: waders, oilskin coat and belt, gauntlets; the hood and the blank mask; the creel and its jars; the boathook while it is theirs. */
function dredgerBits(st: Stage, m: Moment, say: DredgerSay): Bit[] {
  const { s, q } = m;
  const bits: Bit[] = [];
  const grains: [V3, string, number][] = [];
  GRAINS.set(m, grains);
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const [cf, cl, cu] = s.chest;
  const lit = 1 - clamp01(q.out);
  const lag = lagOf(m, 1.5, 3.0);
  const burst = m.dying ? clamp01(say.burst(m.t)) : 0;

  for (const side of ['L', 'R'] as const) leg(put, s, side);
  // THE OILSKIN COAT, to the knee, open a little at the front, its skirts swinging
  put('body', 'coat', { k: 'cloth', rings: torsoRings(s, 0.5, thighRing(s, 0.88, 0.8, lag)), ramp: OIL, look: { folds: [15, -15, 50, -50, 95, -95, 140, -140, 180], lift: 0.05 } });
  // its buttons down the front, horn
  for (let i = 0; i < 4; i++) {
    const p = add(lerp3(lerp3(s.ribs, s.neck, 0.6), s.pelvis, i / 3.4), mul(cf, DB.ribDeep + 2.4 - 0.3 * i));
    put('body', 'button', { k: 'ball', c: p, ax: [mul(cf, 0.4), mul(cl, 0.7), mul(cu, 0.7)], skin: LEATHER });
  }
  // the belt, an iron ring on it
  const waistC = add(s.pelvis, mul(s.hips[2], DB.waist * 0.6));
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], DB.waistDeep + 2.9), v: mul(s.belly[1], DB.waistHalf + 2.9) }, ramp: LEATHER, rows: 2 });
  put('body', 'buckle', { k: 'ball', c: add(waistC, mul(s.belly[0], DB.waistDeep + 3.2)), ax: [mul(s.belly[0], 0.5), mul(s.belly[1], 1.2), mul(s.belly[2], 1.0)], skin: IRON });
  // the arms: the right hand closed round the boathook, the left half-curled (closed too when on it)
  arm(put, s, 'L', cu, q.lhIn === 3 ? 1 : 0.5);
  arm(put, s, 'R', cu, m.bare ? 0.45 : 1);
  put('neck', 'neck', { k: 'rod', a: add(s.neck, mul(cu, -1.5)), b: lerp3(s.neck, s.head, 0.5), ra: 2.9, rb: 2.6, ramp: ROBE });
  head(put, st, s, lit, lag);
  creel(put, s, burst, m.t);
  if (!m.bare) boathook(put, s, q, clamp01(m.glint));
  // (alive, and dying until the jars burst: a thread off the jars now and then; once burst, the rush, until it is spent)
  if (burst <= 0) leaking(grains, s, m.t);
  else pouring(grains, s, m.t, clamp01(say.pour(m.t)), clamp01(say.freed(m.t)), m.t - say.burstAt);
  return bits;
}

// =============================================================================================
// THEIR STAND

/** Their stand: 3.0 s round. Stooped, leaning on the boathook; the masked head turning slowly, listening down the tunnel; the creel shrugged higher on the back once. */
export const DREDGER_STAND_LONG = 3.0;
export function dredgerStand(): Motion {
  const R = DREDGER_REST;
  const T = DREDGER_STAND_LONG;
  const keys: Key3[] = [];
  const N = 30;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * T;
    const a = (t / T) * Math.PI * 2;
    const breath = Math.sin(a * 2 - 0.5);
    // (a shrug of the creel higher on the back, a little past halfway round)
    const shrug = Math.max(0, Math.sin((a - 3.4) * 2.4)) * (a > 3.4 && a < 3.4 + Math.PI / 2.4 ? 1 : 0);
    keys.push({
      at: t,
      ease: 'lin',
      pose: {
        pz: R.pz + 0.8 * breath + 0.6 * shrug,
        py: 0.9 * Math.sin(a),
        roll: R.roll + 2.0 * Math.sin(a),
        bend: R.bend - 2.0 * breath - 3 * shrug,
        pitch: R.pitch + 1.2 * Math.sin(a + 1.2),
        faceUp: R.faceUp + 4 * Math.sin(a + 0.4),
        faceTilt: R.faceTilt + 8 * Math.sin(a + 2.0),
        faceTurn: R.faceTurn + 16 * Math.sin(a + 0.8),
        lhx: R.lhx + 1.0 * Math.sin(a + 0.4),
        lhz: R.lhz + 0.5 * breath + 1.2 * shrug,
      },
    });
  }
  return { loop: 0, keys };
}

/** THE DREDGERS AS THE PAINTER TAKES THEM: painted at a moment; the voices at that moment, laid after their edge. */
export function dredgerPainter(say: DredgerSay): { bits: (st: Stage, m: Moment) => Bit[]; grains: (st: Stage, m: Moment) => ReadonlyArray<readonly [V3, string, number]> } {
  return { bits: (st, m) => dredgerBits(st, m, say), grains: (_st, m) => GRAINS.get(m) ?? [] };
}
/** (for the checks: where the creel is, and how big) */
export function creelLump(s: Skeleton): { c: V3; rot: [V3, V3, V3]; h: V3 } {
  const { c, f, l, u } = creelOf(s);
  return { c, rot: [f, l, u], h: [3.8, 5.0, 7.0] };
}
