// THE BONE RAIN'S LITTLE BONE MONSTERS: BONE MITES (the art chat's helper, 1 Nov 2026, the second round of the Amalgamation's action
// rework; docs/mockups/action_f4_amalgam/README.md). A MOCK-UP: NOTHING OF THE GAME IMPORTS THIS FILE; behind the switch
// AMALGAM_ACTION (art/amalgam_action.ts), off.
//
// His words, 1 Nov 2026, to the first round's film and sheet, of the bone rain: “Love the bone rain, can they all become little bone
// monsters.  Super easy to kill, but there’s a ton of them”. So every skull of the rain that comes down still bursts where it lands
// (the hit), and its bones then pull together into A BONE MITE, in place of the pile that slowed you: a skull carried low on six
// legs of finger bones, scuttling. Small (about a third of the knight's height), quick, and one blow kills it. Its moves:
//   FORMING (`more.form`)  0.5 s: the skull lying on its side among its bones, the bones dragged in to it; its legs unfold under
//                          it and grip; it heaves itself up onto them, rolling upright; the pink lights in its sockets.
//   ITS SKITTER (`walk`)   six legs, three down and three up at a time, 6 frames round at 30 a second, painted for 3.2 tiles a
//                          second: feet gripping, the swinging legs blurred.
//   ITS BITE (`attack`)    Movement 9 at its size: crouched, its front legs raised and its jaw wide, HELD; the snap, in two frames:
//                          it leaps on, its jaw snapping shut; the freeze; it hops back.
//   STRUCK, AND DEAD (`dying`) one blow: knocked back, the skull cracking, and it bursts into a puff of bone chips.
// Its stand (alive: bobbing, its skull turning, its jaw clacking) and its flinch (`reel`, never needed: one blow kills it).
// Every pixel crisp, the pink in its sockets and its pink rim, never the friend's cyan. Every frame of every move through every
// boss check (art/boss_checks.ts), from in front and from behind (tests/action_f4_amalgam.test.ts).

import type { ActorArt } from './actor_types';
import { OSS } from './bosses3';
import type { BossShape, Handover } from './boss_checks';
import { BONE, INK, PINK, hash } from './kit';
import { FLAME } from './mkit';
import { TILE3, eyesOf, faceAlong, mobSet, posedOfMob, skeletonAt, skull, sphere } from './new_mobs3';
import type { Bit, Mob, MobMove, Moment, Put, Ropes } from './new_mobs3';
import type { Stage } from './skin';
import { add, buildOf, cross, dot, len, mul, norm, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

type P = Partial<Bones>;
const D = Math.PI / 180;
const FR = 1 / 30;
const f = (n: number): number => n / 30;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth01 = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};

// =============================================================================================
// ITS NUMBERS (for the main chat; tiles and seconds)

/**
 * A BONE MITE, its numbers.
 *   pace       its skitter, tiles a second (its frames are painted for it: its feet grip at this pace)
 *   form       how long it takes to pull itself together where its skull burst (seconds, from the burst)
 *   bite       its bite: when it snaps (`hit`, seconds into it), the strike's two frames, how far its lunge carries it (`lunge`,
 *              tiles) and how far before its middle its bite strikes (`reach`, tiles: a hero there as it snaps is bitten)
 *   long       how long its bite is, wind-up to hopping back
 *   die        its death: struck, bursting into chips (seconds)
 *   tall       how tall it stands (its own lengths; the knight is 57)
 */
export const MITE = {
  pace: 3.2,
  form: 0.5,
  bite: { hit: f(14), strike: [f(12), f(14)] as const, lunge: 16 / TILE3, reach: 0.75, long: f(31) },
  die: 0.45,
  tall: 20,
} as const;

// =============================================================================================
// ITS BODY

const MB: Build = buildOf(30, 1, {});
/** Its skull at rest (forward, to its left, up from its floor point; how big). */
const SK_AT: V3 = [1, 0, 10.5];
const SK_R: V3 = [7.0, 5.7, 5.6];
/** Its six legs: where each comes out of it (degrees round from its front, to its left), how long its two finger bones, how thick. */
interface Leg {
  name: string;
  deg: number;
  a: number;
  b: number;
  r: number;
}
const LEGS: ReadonlyArray<Leg> = [
  { name: 'FR', deg: -42, a: 7.5, b: 9.5, r: 1.0 },
  { name: 'MR', deg: -92, a: 7.5, b: 9.5, r: 1.0 },
  { name: 'HR', deg: -142, a: 7.2, b: 9.2, r: 0.95 },
  { name: 'FL', deg: 42, a: 7.5, b: 9.5, r: 1.0 },
  { name: 'ML', deg: 92, a: 7.5, b: 9.5, r: 1.0 },
  { name: 'HL', deg: 142, a: 7.2, b: 9.2, r: 0.95 },
];
const NAMES = LEGS.map((l) => l.name);
/** Where its feet grip the floor at rest. */
const PLANT: Readonly<Record<string, V3>> = Object.fromEntries(LEGS.map((l) => [l.name, [SK_AT[0] + Math.cos(l.deg * D) * 14.5, Math.sin(l.deg * D) * 13.5, 0] as V3]));

/** Where it is at a moment: its floor point and the ways it faces; its skull (risen or crouched, tipped, turned, rolled over as it lies apart); its jaw; the fire in its sockets. */
interface MiteFrame {
  O: V3;
  f: V3;
  l: V3;
  skull: V3;
  look: readonly [V3, V3, V3];
  jaw: number;
  apart: number;
  lit: number;
}
function miteFrame(s: Skeleton, q: Posed): MiteFrame {
  const fw = norm([s.chest[0][0], s.chest[0][1], 0], [1, 0, 0]);
  const l: V3 = [-fw[1], fw[0], 0];
  const O: V3 = [s.pelvis[0], s.pelvis[1], 0];
  const apart = clamp01(q.gale);
  const at = (x: number, y: number, z: number): V3 => add(O, add(add(mul(fw, x), mul(l, y)), [0, 0, z]));
  // (apart, it lies on its side on the floor among its bones)
  const up = SK_AT[2] + q.pz;
  const lying = SK_R[1] * 0.98;
  const skullAt = at(SK_AT[0] - 2 * apart, 0, up + (lying - up) * smooth01(apart));
  const lean = q.pitch * D;
  const turn = q.faceTurn * D;
  const lookF = norm(add(add(mul(fw, Math.cos(turn) * Math.cos(lean)), mul(l, Math.sin(turn) * Math.cos(lean))), [0, 0, -Math.sin(lean)]));
  const roll = 80 * D * smooth01(apart);
  const look = faceAlong(lookF, norm(add([0, 0, Math.cos(roll)], mul(l, Math.sin(roll)))));
  return { O, f: fw, l, skull: skullAt, look, jaw: clamp01(q.draw), apart, lit: 1 - clamp01(q.out) };
}
/** Two bones from where a leg comes out to its foot: its knee, its foot put within reach. */
function twoBone(sh: V3, target: V3, a: number, b: number, hint: V3): { el: V3; hand: V3 } {
  let d = sub(target, sh);
  let L = len(d);
  const most = (a + b) * 0.995;
  const least = Math.abs(a - b) + 0.5;
  let hand = target;
  if (L > most) {
    hand = add(sh, mul(d, most / L));
    d = sub(hand, sh);
    L = most;
  } else if (L < least) {
    const dir0 = L > 1e-6 ? mul(d, 1 / L) : ([0, 0, -1] as V3);
    hand = add(sh, mul(dir0, least));
    d = sub(hand, sh);
    L = least;
  }
  const dir = mul(d, 1 / L);
  const x = (a * a - b * b + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, a * a - x * x));
  const e = norm(sub(hint, mul(dir, dot(hint, dir))), norm(cross(dir, [0, 0, 1]), [1, 0, 0]));
  return { el: add(add(sh, mul(dir, x)), mul(e, h)), hand };
}
interface MiteLeg {
  name: string;
  sh: V3;
  el: V3;
  hand: V3;
  r: number;
}
/** Its six legs at a moment: out of the underside of its skull, their knees up and out as a spider's (flat out along the floor as it lies apart), each foot where the move has it (its `ropes`, `m<name>`; at rest, PLANT). */
function miteLegs(fr: MiteFrame, ropes?: Ropes): MiteLeg[] {
  return LEGS.map((lg) => {
    const a = lg.deg * D;
    const out = norm(add(mul(fr.f, Math.cos(a)), mul(fr.l, Math.sin(a))));
    const sh = add(fr.skull, add(mul(out, SK_R[1] * 0.62), [0, 0, -SK_R[2] * 0.55 * (1 - fr.apart)]));
    const local = ropes?.[`m${lg.name}`]?.[0] ?? PLANT[lg.name];
    // (its feet are where the floor is, not where its body is: a foot that is down stays put as it lunges)
    const want = local;
    const hint = norm(add(mul(out, 0.45 + 0.8 * fr.apart), [0, 0, 1 - 0.75 * fr.apart]));
    const { el, hand } = twoBone(sh, want, lg.a, lg.b, hint);
    return { name: lg.name, sh, el, hand, r: lg.r };
  });
}
/** Its skull and its legs at a moment (for the checks, and for the pictures). */
export function miteGeometry(s: Skeleton, q: Posed, ropes?: Ropes): { frame: MiteFrame; legs: MiteLeg[] } {
  const frame = miteFrame(s, q);
  return { frame, legs: miteLegs(frame, ropes) };
}

/** A FINGER BONE: a rod knobbed at both ends. */
function fingerBone(put: Put, part: string, a: V3, b: V3, r: number): void {
  put(part, part, { k: 'rod', a, b, ra: r, rb: r * 0.85, ramp: OSS });
  put(part, part, { k: 'ball', c: a, ax: sphere(r * 1.35), skin: OSS });
  put(part, part, { k: 'ball', c: b, ax: sphere(r * 1.2), skin: OSS });
}

/** THE BONE MITE AS SOLIDS: its skull, its jaw and teeth, its legs of finger bones, a stub of tail; or, burst, its chips. */
function miteBits(st: Stage, m: Moment): Bit[] {
  const { s, q, t } = m;
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => {
    bits.push({ part, piece, shape });
  };
  const fr = miteFrame(s, q);
  const burst = m.ropes?.burstT?.[0]?.[0];
  if (burst !== undefined && burst >= 0) {
    chipBits(put, fr, burst);
    return bits;
  }
  const { f: fw, l, lit } = fr;
  const [lf, ll, lu] = fr.look;
  // --- its skull, the pink in its sockets ---
  skull(st, put, 'skull', 'skull', fr.skull, fr.look, SK_R, OSS, eyesOf(st, fr.look), lit * (0.85 + 0.15 * Math.sin(t * 9)), true, 3);
  // its cheekbones, jutting under its sockets
  for (const side of [-1, 1]) put('skull', 'skull', { k: 'ball', c: add(fr.skull, add(add(mul(lf, SK_R[0] * 0.62), mul(ll, side * SK_R[1] * 0.62)), mul(lu, -SK_R[2] * 0.28))), ax: [mul(lf, 1.6), mul(ll, 1.3), mul(lu, 1.1)], skin: OSS });
  // cracks over its crown and down its back, the enemy's fire glowing in them (and, struck, split white)
  const struck = m.ropes?.cracked?.[0]?.[0] ?? 0;
  for (const [a0, side] of [[0.2, 1], [-0.5, -1], [-1.1, 1]] as const) {
    for (let i = 0; i < 6; i++) {
      const th = a0 - i * 0.28;
      const w = side * (0.25 + 0.12 * Math.sin(i * 2.1));
      const d = norm(add(add(mul(lf, Math.cos(th) * 0.55), mul(lu, Math.sin(th) * 0.0 + 0.85)), mul(ll, w)));
      const pt = add(fr.skull, add(add(mul(lf, d[0] * 0 + Math.sin(-th) * -SK_R[0] * 0.55), mul(ll, w * SK_R[1])), mul(lu, SK_R[2] * Math.cos(th * 0.6) * 0.99)));
      put('crack', 'skull', { k: 'mote', p: pt, c: struck > 0 ? '#fff0e6' : lit > 0.3 && i % 2 ? FLAME[1] : INK, size: 1 });
    }
  }
  // --- its jaw, hung under its front, dropping open; its teeth ---
  const hinge = add(fr.skull, add(mul(lf, -SK_R[0] * 0.15), mul(lu, -SK_R[2] * 0.5)));
  const drop = (6 + 48 * fr.jaw) * D;
  const jf = norm(add(mul(lf, Math.cos(drop)), mul(lu, -Math.sin(drop))));
  const ju = norm(cross(jf, ll));
  const jawC = add(hinge, mul(jf, SK_R[0] * 0.62));
  put('jaw', 'jaw', {
    k: 'ball',
    c: jawC,
    ax: [mul(jf, SK_R[0] * 0.66), mul(ll, SK_R[1] * 0.7), mul(ju, 1.3)],
    skin: (u, tone) => (u[2] > 0.3 && Math.hypot(u[0] * 1.2, u[1]) < 0.7 && fr.jaw > 0.3 ? (lit > 0.1 ? FLAME[1] : INK) : OSS[tone]),
  });
  for (let i = 0; i <= 6; i++) {
    const k = (i / 6) * 2 - 1;
    const round = Math.sqrt(Math.max(0, 1 - k * k));
    const base = add(jawC, add(add(mul(jf, SK_R[0] * 0.6 * round), mul(ll, k * SK_R[1] * 0.6)), mul(ju, 1.0)));
    put('teeth', 'jaw', { k: 'rod', a: base, b: add(base, mul(ju, 1.2 + (i === 1 || i === 5 ? 0.9 : 0.3))), ra: 0.5, rb: 0.2, ramp: OSS });
  }
  if (lit > 0.1 && fr.jaw > 0.3) put('jaw', 'jaw', { k: 'glow', p: add(fr.skull, mul(lf, SK_R[0])), c: '#ff3a78', r: 5 + 4 * fr.jaw, a: 0.3 * fr.jaw * lit });
  // --- its legs of finger bones: knuckled, a claw at each foot ---
  const legs = miteLegs(fr, m.ropes);
  for (const g of legs) {
    fingerBone(put, `leg${g.name}`, g.sh, g.el, g.r);
    fingerBone(put, `leg${g.name}`, g.el, g.hand, g.r * 0.85);
    const down = norm(sub(g.hand, g.el), [0, 0, -1]);
    const toe = add(g.hand, mul(norm(add(down, [0, 0, 0.6])), 1.8));
    put(`leg${g.name}`, `leg${g.name}`, { k: 'rod', a: g.hand, b: [toe[0], toe[1], Math.max(0.5, toe[2])], ra: g.r * 0.6, rb: 0.25, ramp: OSS });
  }
  // (the legs swinging through the air, blurred: where they were a moment ago, dim)
  for (const n of NAMES) {
    const was = m.ropes?.[`blur${n}`];
    if (!was) continue;
    const g = legs.find((x) => x.name === n) as MiteLeg;
    for (const p of was) {
      for (let k = 1; k <= 4; k++) put('blur', 'blur', { k: 'mote', p: add(g.el, mul(sub(p, g.el), k / 4)), c: k % 2 ? '#5a5280' : '#3e3860', size: 1 });
    }
  }
  // --- its tail: a finger of four knuckles out of the back of its skull, curled up over it, a hooked claw at its tip, twitching ---
  let prev = add(fr.skull, add(mul(lf, -SK_R[0] * 0.85), mul(lu, -0.5)));
  const wag = Math.sin(t * 11) * 0.18;
  for (let i = 0; i < 4; i++) {
    const th = (-20 + 42 * i) * D + wag;
    const dir = norm(add(add(mul(fw, -Math.cos(th)), [0, 0, Math.sin(th) + 0.25]), mul(l, wag * 1.5)));
    const p = add(prev, mul(dir, i === 0 ? 3.2 : 3.0 - 0.3 * i));
    fingerBone(put, 'tail', prev, p, 0.95 - 0.12 * i);
    prev = p;
  }
  {
    const hook = add(prev, add(mul(fw, 2.6), [0, 0, -1.2]));
    put('tail', 'tail', { k: 'rod', a: prev, b: hook, ra: 0.6, rb: 0.2, ramp: OSS });
  }
  // --- the fire under it ---
  if (lit > 0.1) put('fire', 'fire', { k: 'glow', p: add(fr.skull, [0, 0, -3]), c: '#ff3a78', r: 7, a: 0.12 * lit });
  // --- its bones dragged in to it as it pulls itself together ---
  for (const p of m.ropes?.loose ?? []) {
    const k = Math.round(p[2]);
    const w = hash(k, 1, 2301) * Math.PI * 2;
    const half: V3 = [Math.cos(w) * 2.6, Math.sin(w) * 2.6, 0];
    fingerBone(put, `loose${k}`, [p[0] - half[0], p[1] - half[1], 1.1], [p[0] + half[0], p[1] + half[1], 1.1], 0.85);
  }
  return bits;
}
/** BURST: its skull split and its bones flung out every way in chips, falling; a puff of bone dust (`since` its bursting). */
function chipBits(put: Put, fr: MiteFrame, since: number): void {
  const c = fr.skull;
  for (let i = 0; i < 24; i++) {
    const life = 0.26 + 0.18 * hash(i, 1, 2311);
    if (since > life) continue;
    const a = hash(i, 2, 2311) * Math.PI * 2;
    const sp = 60 + 70 * hash(i, 3, 2311);
    const vz = 50 + 90 * hash(i, 4, 2311);
    const p: V3 = [c[0] + Math.cos(a) * sp * since, c[1] + Math.sin(a) * sp * since, Math.max(0.8, c[2] + vz * since - 0.5 * 650 * since * since)];
    // (a shard of bone, tumbling)
    const spin = since * (14 + 10 * hash(i, 5, 2311)) + i;
    const L = i % 3 === 0 ? 3.6 : 2.2;
    const d: V3 = [Math.cos(spin) * L, Math.sin(spin * 0.7) * L, Math.sin(spin) * L * 0.6];
    put(`chip${i % 6}`, `chip${i % 6}`, { k: 'rod', a: sub(p, mul(d, 0.5)), b: add(p, mul(d, 0.5)), ra: i % 3 === 0 ? 0.95 : 0.7, rb: 0.55, ramp: OSS });
  }
  // the puff of bone dust
  const k = clamp01(since / 0.4);
  for (let i = 0; i < 10; i++) {
    if (hash(i, 6, 2311) < k * 0.95) continue;
    const a = hash(i, 7, 2311) * Math.PI * 2;
    const r = 2 + 10 * Math.sqrt(k) * hash(i, 8, 2311);
    put('dust', 'dust', { k: 'mote', p: [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 2 + 7 * hash(i, 9, 2311) * (0.4 + k)], c: i % 3 ? '#6a6488' : '#8a82a8', size: 1 });
  }
  if (since < 0.08) {
    put('flash', 'flash', { k: 'glow', p: c, c: '#fff0e6', r: 16, a: 0.6 * (1 - since / 0.08) });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      for (let j = 1; j <= 3; j++) put('flash', 'flash', { k: 'mote', p: [c[0] + Math.cos(a) * (2 + j * 2.2 + since * 60), c[1] + Math.sin(a) * (2 + j * 2.2 + since * 60), c[2] + Math.sin(a) * 2], c: j === 1 ? '#fff0e6' : BONE[3], size: j === 1 ? 2 : 1 });
    }
  }
  void PINK;
}

// =============================================================================================
// ITS MOVES

/** Its feet through a move (the figure's own lengths, its floor point the origin), as ropes `m<name>`. */
type Feet = (t: number) => Record<string, V3>;
function feetRopes(feet: Feet): (t: number) => Record<string, V3[]> {
  return (t) => {
    const at = feet(t);
    const out: Record<string, V3[]> = {};
    for (const n of NAMES) out[`m${n}`] = [at[n]];
    return out;
  };
}
function mmove(name: string, motion: Motion, feet?: Feet, more: Partial<MobMove> & { also?: (t: number) => Record<string, V3[]> } = {}): MobMove {
  const { also, ...rest } = more;
  return {
    name,
    motion,
    rest: M_REST,
    ...(feet || also ? { ropes: (t: number) => ({ ...(feet ? feetRopes(feet)(t) : {}), ...(also ? also(t) : {}) }) } : {}),
    ...rest,
  };
}
/** How it rests: crouched on its six feet. */
const M_REST: Bones = { ...standing(MB), pz: 0, px: 0, yaw: 0, pitch: 0, roll: 0, twist: 0, bend: 0, side: 0, faceTurn: 0, faceUp: 0, faceTilt: 0, draw: 0.15, pt: 0.3, out: 0, prop: 0, gale: 0 };
/** A step of a foot from `a` to `b` on the floor over `u` (0 to 1): up off its spot, over, and down on the next. */
function step(a: V3, b: V3, u: number, lift: number): V3 {
  const g = smooth01((u - 0.12) / 0.76);
  const h = lift * Math.pow(Math.sin(Math.PI * clamp01(u)), 0.6);
  return [a[0] + (b[0] - a[0]) * g, a[1] + (b[1] - a[1]) * g, h];
}

/** STANDING, ALIVE: bobbing on its legs, swaying, its skull turning this way and that, its jaw clacking; a front foot tapping. 1.2 s round. */
const STAND_LONG = 1.2;
function standMotion(): Motion {
  return {
    loop: 0,
    keys: [
      { at: 0, pose: {} },
      { at: 0.3, pose: { pz: 1.4, py: 1.0, faceTurn: 16, draw: 0.5, pitch: -4 }, ease: 'io' },
      { at: 0.45, pose: { pz: 1.1, py: 1.1, faceTurn: 18, draw: 0.05, pitch: -3 }, ease: 'io' },
      { at: 0.75, pose: { pz: -0.6, py: -1.0, faceTurn: -14, draw: 0.45, pitch: 2 }, ease: 'io' },
      { at: 0.95, pose: { pz: -0.3, py: -1.1, faceTurn: -16, draw: 0.05, pitch: 1 }, ease: 'io' },
      { at: STAND_LONG, pose: {}, ease: 'io' },
    ],
  };
}
const standFeet: Feet = (t) => {
  const out: Record<string, V3> = { ...PLANT };
  const u = clamp01((t - 0.5) / 0.22);
  if (u > 0 && u < 1) out.FR = step(PLANT.FR, PLANT.FR, u, 3);
  return out;
};

/** ITS SKITTER: six frames round at 30 a second (0.2 s), painted for MITE.pace; three feet down (front and hind of one side, the middle of the other) while the floor goes back under them, the other three up and reaching on. */
const WALK_FRAMES = 6;
const WALK_FPS = 30;
const PERIOD = WALK_FRAMES / WALK_FPS;
const GROUND = MITE.pace * TILE3;
const STANCE = 0.5;
const STRIDE = GROUND * PERIOD * STANCE;
const PHASE: Readonly<Record<string, number>> = { FR: 0, ML: 0, HR: 0, FL: 0.5, MR: 0.5, HL: 0.5 };
function gaitAt(n: string, t: number): V3 {
  const home = PLANT[n];
  const tau = (((t / PERIOD - PHASE[n]) % 1) + 1) % 1;
  const half = STRIDE / 2;
  if (tau < STANCE) return [home[0] + half - GROUND * tau * PERIOD, home[1], 0];
  const u = (tau - STANCE) / (1 - STANCE);
  return step([home[0] - half, home[1], 0], [home[0] + half, home[1], 0], u, 4.5);
}
const walkFeet: Feet = (t) => Object.fromEntries(NAMES.map((n) => [n, gaitAt(n, t)]));
function walkMotion(): Motion {
  const keys: Key3[] = [];
  for (let i = 0; i <= WALK_FRAMES; i++) {
    const a = (i / WALK_FRAMES) * Math.PI * 2;
    keys.push({ at: i / WALK_FPS, ease: 'lin', pose: { pz: 0.6 - 0.7 * Math.cos(2 * a), py: 0.8 * Math.sin(a), pitch: 4 + 1.5 * Math.cos(2 * a), yaw: 3 * Math.sin(a), faceTurn: -4 * Math.sin(a), draw: 0.3 + 0.2 * Math.sin(2 * a) } });
  }
  return { keys, loop: 0 };
}
/** The swinging legs' blur: where each foot that is up was a sixtieth and a thirtieth of a second ago. */
const walkBlur = (t: number): Record<string, V3[]> => {
  const out: Record<string, V3[]> = {};
  for (const n of NAMES) {
    const now = gaitAt(n, t);
    if (now[2] < 1.5) continue;
    out[`blur${n}`] = [gaitAt(n, t - FR / 2), gaitAt(n, t - FR)];
  }
  return out;
};

/**
 * ITS BITE (Movement 9 at its size): crouched low, its skull tipped up, its jaw wide and its front legs raised, claws up: HELD,
 * trembling (the warning); the snap, in two frames: it leaps on, all six feet off the floor, its skull thrown forward and down and
 * its jaw snapped shut; the freeze on the bite; it hops back to where it was.
 *   crouched by 0.167 s (f5), HELD to 0.4 (f12); strike f12-f14, the bite 0.467 s; frozen to f15; carried on into it to 0.633
 *   (f19); hopped back by 0.933 (f28); settled by 1.033 (f31)
 */
const [B0, B1] = MITE.bite.strike;
const LUNGE = 16;
function biteFeet(): Feet {
  const raised: Record<string, V3> = { FR: [9, -13.5, 13], FL: [9, 13.5, 13] };
  return (t) => {
    const out: Record<string, V3> = {};
    for (const n of NAMES) {
      const home = PLANT[n];
      const on: V3 = [home[0] + LUNGE, home[1], 0];
      const front = n === 'FR' || n === 'FL';
      let p: V3 = home;
      if (front) {
        // (its front legs raised, claws up, as it crouches; trembling there)
        const r = raised[n];
        if (t < f(5)) p = add(home, mul(sub(r, home), smooth01((t - f(1)) / f(4))));
        else if (t < B0) p = add(r, [0, 0, 0.25 * Math.sin(t * 60)]);
        else p = r;
        if (t > f(5) && t < f(12)) p = add(r, [0.2 * Math.sin(t * 50), 0, 0.3 * Math.sin(t * 60)]);
      }
      if (t >= B0) {
        // THE SNAP: all its feet off the floor; down again on the bite, a lunge on
        const u = clamp01((t - B0) / (B1 - B0));
        const from = front ? raised[n] : home;
        const g = front ? Math.pow(u, 0.6) : Math.pow(u, 0.75);
        p = u < 1 ? [from[0] + (on[0] - from[0]) * g, from[1] + (on[1] - from[1]) * g, (front ? from[2] * (1 - g) : 0) + 2.5 * Math.sin(Math.PI * u)] : on;
      }
      if (t >= f(20)) {
        // (hopped back: three and three)
        const late = PHASE[n] ? f(3) : 0;
        p = step(on, home, (t - f(20) - late) / f(5), 3.5);
        if (t - f(20) - late >= f(5)) p = home;
        if (t - f(20) - late <= 0) p = on;
      }
      out[n] = p;
    }
    return out;
  };
}
function biteMotion(): Motion {
  return {
    hit: MITE.bite.hit,
    keys: [
      { at: 0, pose: {} },
      { at: f(5), pose: { pz: -3, px: -4, pitch: -16, draw: 1, pt: 1 }, ease: 'io' },
      { at: f(8), pose: { pz: -3.2, px: -4.2, py: 0.3, pitch: -17, draw: 1, pt: 1 }, ease: 'io' },
      { at: f(10), pose: { pz: -3.3, px: -4.3, py: -0.3, pitch: -17, draw: 1, pt: 1 }, ease: 'io' },
      { at: B0, pose: { pz: -3.4, px: -4.1, pitch: -15, draw: 1, pt: 1 }, ease: 'in' },
      // the snap: leapt on, the skull thrown forward and down, the jaw shut
      { at: B1, pose: { pz: 0.5, px: LUNGE, pitch: 14, draw: 0, pt: 1 }, ease: 'lin' },
      { at: B1 + FR, pose: { pz: 0.5, px: LUNGE, pitch: 14, draw: 0, pt: 1 }, ease: 'lin' },
      // (carried on into it, worrying at it)
      { at: f(19), pose: { pz: -0.8, px: LUNGE + 5, pitch: 26, draw: 0.1, pt: 1 }, ease: 'out' },
      { at: f(24), pose: { pz: 0, px: LUNGE * 0.55, pitch: 6, draw: 0.3, pt: 0.8 }, ease: 'io' },
      { at: f(28), pose: { pz: 0.4, px: 1, pitch: 0, draw: 0.2, pt: 0.6 }, ease: 'io' },
      { at: MITE.bite.long, pose: {}, ease: 'io' },
    ],
  };
}
/** Whether a frame of its bite shows the snap's smear (its strike's frames, and the one after). */
export const miteSmeared = (move: string, t: number): boolean => move === 'attack' && t > B0 + 1e-6 && t <= B1 + FR + 1e-6;
/** The snap's smear: the way its skull's front came, as ropes (oldest first). */
function biteSmear(t: number): Record<string, V3[]> {
  if (!miteSmeared('attack', t)) return {};
  const mob = BONE_MITE;
  const from = t > B1 + 1e-6 ? B1 - FR * 0.5 : B0;
  const to = Math.min(t, B1);
  const pts: V3[] = [];
  for (let k = 0; k <= 8; k++) {
    const tt = from + ((to - from) * k) / 8;
    const fr = miteFrame(skeletonAt(mob, 'attack', tt), posedOfMob(mob, 'attack', tt));
    pts.push(add(fr.skull, mul(fr.look[0], SK_R[0])));
  }
  return { smear: pts };
}
function smearBits(m: Moment): Bit[] {
  const line = m.ropes?.smear;
  if (!line || line.length < 2) return [];
  const bits: Bit[] = [];
  for (let i = 1; i < line.length; i++) {
    const age = i / (line.length - 1);
    const n = Math.max(1, Math.ceil(len(sub(line[i], line[i - 1])) / 1.0));
    for (let j = 0; j < n; j++) {
      const p = add(line[i - 1], mul(sub(line[i], line[i - 1]), j / n));
      for (const dz of [-1.6, 0, 1.6]) bits.push({ part: 'smear', piece: 'smear', shape: { k: 'mote', p: [p[0], p[1], Math.max(0.8, p[2] + dz)], c: age > 0.7 ? '#fff0e6' : age > 0.35 ? PINK[3] : PINK[2], size: age > 0.5 && dz === 0 ? 2 : 1 } });
    }
  }
  return bits;
}

/** STRUCK (its flinch: never needed, one blow kills it; as the game holds a monster): jerked back, its jaw flying open, crouched again. */
function reelMotion(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: f(2), pose: { pz: -1.4, px: -2, pitch: -10, draw: 0.8, faceTurn: 8 }, ease: 'out' },
      { at: f(5), pose: { pz: -0.6, px: -0.8, pitch: -4, draw: 0.4, faceTurn: 3 }, ease: 'io' },
      { at: f(9), pose: {}, ease: 'io' },
    ],
  };
}

/** STRUCK DEAD, IN ONE BLOW: knocked back, its skull cracking, its legs flung up; at 0.07 s it bursts into a puff of bone chips (`burstT`). */
export const MITE_BURST = f(3);
function dyingMotion(): Motion {
  return {
    keys: [
      { at: 0, pose: {} },
      { at: MITE_BURST, pose: { pz: 2.5, px: -3.5, pitch: -22, draw: 1, faceTurn: 10 }, ease: 'out' },
      { at: 0.2, pose: { pz: 1, px: -4.5, pitch: -10, draw: 1, gale: 0.5, out: 0.6 }, ease: 'io' },
      { at: MITE.die, pose: { pz: 0, px: -5, pitch: 0, draw: 1, gale: 1, out: 1 }, ease: 'io' },
    ],
  };
}
const dyingFeet: Feet = (t) => {
  const out: Record<string, V3> = {};
  for (const n of NAMES) {
    const home = PLANT[n];
    // (flung up off the floor as it is struck, and falling flat apart)
    const u = clamp01(t / 0.12);
    const k = clamp01((t - 0.1) / 0.18);
    const o = norm([home[0] - SK_AT[0], home[1], 0]);
    out[n] = [home[0] - 3 * u + o[0] * 5 * k, home[1] + o[1] * 5 * k, 4 * Math.sin(Math.PI * clamp01(t / 0.3))];
  }
  return out;
};

/**
 * PULLING ITSELF TOGETHER (`more.form`, MITE.form seconds from where its skull burst): its skull lying on its side, its bones
 * strewn round it; they are dragged in to it, hopping over the floor; its legs unfold under it and grip; it heaves itself up onto
 * them, rolling upright; the pink lights in its sockets; it shakes itself.
 */
function formMotion(): Motion {
  return {
    keys: [
      { at: 0, pose: { gale: 1, out: 1, draw: 0.6, pz: -2 } },
      { at: 0.18, pose: { gale: 0.85, out: 0.9, draw: 0.5, pz: -2 }, ease: 'io' },
      { at: 0.36, pose: { gale: 0.2, out: 0.3, draw: 0.8, pz: -1, pitch: -6 }, ease: 'io' },
      { at: 0.44, pose: { gale: 0, out: 0, draw: 0.9, pz: 1.2, pitch: -8, faceTurn: 8 }, ease: 'io' },
      { at: MITE.form, pose: {}, ease: 'io' },
    ],
  };
}
const LOOSE = 7;
/** Its bones, strewn round it by the burst and dragged in (each lying at its spot, hopping in, gone into it as it arrives). */
function looseBones(t: number): Record<string, V3[]> {
  const out: V3[] = [];
  for (let i = 0; i < LOOSE; i++) {
    const a = (i / LOOSE) * Math.PI * 2 + hash(i, 1, 2321) * 0.6;
    const r0 = 13 + 9 * hash(i, 2, 2321);
    const go = 0.04 + 0.03 * i;
    const u = clamp01((t - go) / 0.22);
    if (u >= 1) continue;
    const r = r0 * (1 - smooth01(u)) + 4 * smooth01(u);
    const hop = 3 * Math.sin(Math.PI * u);
    out.push([Math.cos(a) * r, Math.sin(a) * r, i + hop * 0]);
  }
  return out.length ? { loose: out } : {};
}
const formFeet: Feet = (t) => {
  const out: Record<string, V3> = {};
  NAMES.forEach((n, i) => {
    const home = PLANT[n];
    const o = norm([home[0] - SK_AT[0], home[1], 0]);
    // (splayed out flat round it; each drawn in under it, a little hop, and gripping)
    const flat: V3 = [home[0] + o[0] * 6, home[1] + o[1] * 6, 0];
    const t0 = 0.14 + 0.025 * i;
    out[n] = t <= t0 ? flat : t >= t0 + 0.16 ? home : step(flat, home, (t - t0) / 0.16, 3);
  });
  return out;
};

export const BONE_MITE: Mob = {
  id: 'bonemite',
  name: 'A bone mite',
  size: 'little: the bone rain’s skulls, pulled together on legs of finger bones',
  build: MB,
  stand: mmove('A bone mite twitches', standMotion(), standFeet),
  attack: mmove('A bone mite bites', biteMotion(), biteFeet(), { also: (t) => biteSmear(t) }),
  idleFrames: 12,
  idleFps: 10,
  walk: mmove('A bone mite skitters', walkMotion(), walkFeet, { period: PERIOD, ground: GROUND, also: walkBlur }),
  walkFrames: WALK_FRAMES,
  walkFps: WALK_FPS,
  pace: MITE.pace,
  more: {
    form: mmove('A bone mite pulls itself together', formMotion(), formFeet, { also: looseBones }),
  },
  reel: mmove('A bone mite flinches', reelMotion()),
  reelTime: f(9),
  hit: MITE.bite.hit,
  warn: f(12),
  dieTime: MITE.die,
  dying: mmove('A bone mite bursts', dyingMotion(), dyingFeet, { also: (t) => ({ burstT: [[t - MITE_BURST, 0, 0]], cracked: [[1, 0, 0]] }) }),
  aura: { x: 84, y: 124, r: 16, color: '#ff3a78', a: 0.1 },
  shadow: 9,
  bits: (st, m) => [...miteBits(st, m), ...smearBits(m)],
  fall: () => null,
};

/** THE BONE MITE AS THE CHECKS SEE IT: its skull (which lies on the floor as it comes apart), its six legs, its feet gripping the floor; followed: its skull and its feet; its bite, struck with its skull. */
export const MITE_SHAPE: BossShape = {
  body: (s, q) => {
    const fr = miteFrame(s, q);
    return { limbs: [], lumps: [{ name: 'skull', c: fr.skull, rot: fr.look, h: [SK_R[0] * 0.9, SK_R[1] * 0.9, SK_R[2] * 0.9] }] };
  },
  floorFree: ['skull'],
  low: { elbow: 1.2, hand: -0.6, grip: -0.6 },
  grips: (move, t, s, q) => miteLegs(miteFrame(s, q), ropesOf(move, t)).map((g) => ({ name: `foot ${g.name}`, p: g.hand })),
  arms: (move, t, s, q) => miteLegs(miteFrame(s, q), ropesOf(move, t)).map((g) => ({ name: g.name, sh: g.sh, el: g.el, hand: g.hand })),
  follow: (move, t, s, q) => {
    const fr = miteFrame(s, q);
    const out: Record<string, V3> = { skull: fr.skull };
    for (const g of miteLegs(fr, ropesOf(move, t))) out[`foot${g.name}`] = g.hand;
    return out;
  },
  tip: (move, _t, s, q) => {
    if (move !== 'attack') return null;
    const fr = miteFrame(s, q);
    return add(fr.skull, mul(fr.look[0], SK_R[0]));
  },
  strikes: { attack: MITE.bite.strike },
  smeared: miteSmeared,
  handovers: [
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
    { from: 'walk', at: 0, to: 'stand', toAt: 0 },
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    { from: 'walk', at: 0, to: 'dying', toAt: 0 },
    { from: 'form', at: 'end', to: 'stand', toAt: 0 },
    { from: 'form', at: 'end', to: 'walk', toAt: 0 },
    ...['attack', 'reel'].flatMap((m): Handover[] => [
      { from: 'stand', at: 0, to: m, toAt: 0 },
      { from: m, at: 'end', to: 'stand', toAt: 0 },
    ]),
  ],
};
function ropesOf(move: string, t: number): Ropes | undefined {
  const mv = move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? BONE_MITE[move] : move === 'dying' ? BONE_MITE.dying : BONE_MITE.more?.[move];
  if (!mv?.ropes) return undefined;
  const L = mv.motion.keys[mv.motion.keys.length - 1].at;
  return mv.ropes(mv.motion.loop !== undefined ? ((t % L) + L) % L : t);
}
/** Its feet and skull at a moment of one of its moves (the figure's own lengths, its floor point the origin): for the numbers. */
export function miteAt(move: string, t: number): { skull: V3; feet: Record<string, V3>; front: V3 } {
  const s = skeletonAt(BONE_MITE, move, t);
  const q = posedOfMob(BONE_MITE, move, t);
  const g = miteGeometry(s, q, ropesOf(move, t));
  return { skull: g.frame.skull, feet: Object.fromEntries(g.legs.map((x) => [x.name, x.hand])), front: add(g.frame.skull, mul(g.frame.look[0], SK_R[0])) };
}

/** THE BONE MITE, as the game holds a monster (the bestiary's, with AMALGAM_ACTION on). */
export function makeBoneMiteArt(pace = MITE.pace): ActorArt {
  return { front: mobSet(BONE_MITE, 'front', pace), back: mobSet(BONE_MITE, 'back', pace) };
}
