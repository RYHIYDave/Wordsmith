// ENDLESS MODE'S FINAL BOSS: THE WARPED WORDSMITH ON THE GREAT WOOLLY BOAR. Its look, standing, to the game's standard (the art
// chat, 12 Nov 2026; the queue's draw-endless-tablet-portal-final-boss). A MOCK-UP: nothing of the game imports this file; it is
// behind ENDLESS_TABLET (art/endless_tablet.ts, off).
//
// His picks, 12 Nov 2026 (docs/mockups/endless_tablet/README.md has every word): “Ooo let’s have you fight a warped runesmith”;
// “A new runesmith of his own”; “Riding a four-legged beast”; the lore, “Yeah thats not bad” (wordsmiths are an old order who keep
// the words, from a cold mountain monastery in the north; this one went down the shaft for the deepest words and was warped by
// them); “Maybe a big wooly boar would kinda satisfy the mix of the two”; the boar's horns “Without (Recommended)”; “Yes, lock them
// in (Recommended)”. HIS BRIEF: “I don’t want the wordsmith to be huge, at least at the start.  So scale the boar to whatever we
// decided the wordsmith size would be.  I think he’s a little taller than the hero”; he grows huge once thrown, “Yes, after he's
// thrown (Recommended)”; they move in “Heavy charges, skid and turn (Recommended)”; known at a glance by “His burning rune-staff
// held high (Recommended)”; “Together, then he's thrown (Recommended)”; his death, overwhelmed by the words, imploding in pink
// energy that comes apart into tiny runes (never falling to his knees); “Never kindly, never the Old Skald (Recommended)”. HOW HARD,
// 14:32: “this is the biggest, baddest boss in the game”.
//
// HIM: one of the old order, warped. Gaunt, a little taller than the hero; long white hair and a beard to his belt, thin and
// lank; an iron band on his brow, its stone cracked through and burning; his order's cloak gone to violet rags, hanging in strips
// down the boar's flanks; his skin ashen, cut with runes that burn the enemy's pink; his eyes pink, sunk deep; a staff of his
// order taller than he is, runes cut down it burning, his great rune burning in the iron ring at its head, held high in his right
// hand; his left hand clawed, writing runes on the air; cracked rune stones going round him. Never kindly: his face hollow, his
// mouth a hard line; no hood, no pointed hat, nothing of the Old Skald (no furs, no horn).
//
// IT: a boar of the cold mountains grown huge, sized to carry him: high at the shoulders, its back falling away to small
// hindquarters; long pale wool, matted, hanging in locks, frost on their tips; a dark crest of bristles down its spine; its head
// big and low, its snout long, its small eyes burning pink; tusks curving up out of its jaw, cut with his runes, burning; short
// thick legs and cloven hooves; his runes branded on its flank, the wool burnt off round them; a saddle of iron and old leather on
// its hump, a girth round its barrel, stirrups.
//
// BOTH THE ENEMY'S: what burns on them is pink burning to gold (art/mkit.ts FLAME), and the pink edge goes round them both. Nothing
// cyan. On the heroes' bones he rides as the Princess rides her steed (art/princess_ride.ts); the boar is its own solids, as the
// steed and the Hollow Stag are, in the same painter (art/new_mobs3.ts paintBits).

import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import type { Bit, Mob, MobCanvas, Moment, Put } from './new_mobs3';
import type { BossShape, CheckLimb, CheckLump } from './boss_checks';
import type { Ring, Skin, Stage } from './skin';
import { add, buildOf, cross, lerp3, mul, norm, solve, standing, sub } from './skeleton';
import type { Bones, Build, Key3, Motion, Posed, Skeleton, V3 } from './skeleton';

const D = Math.PI / 180;
const TAU = Math.PI * 2;
const len = (a: V3): number => Math.hypot(a[0], a[1], a[2]);
const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));
const T5 = (k: number): number => (k < 0 ? 0 : k > 4 ? 4 : k);

// =============================================================================================
// THEIR COLOURS

/** The boar's wool: long and pale, a cold cream gone grey at its roots. */
export const WOOL: Ramp = ['#2e2a2e', '#57505a', '#8c8488', '#bdb4ae', '#e2dad0'];
/** Frost on the tips of its locks: a cold white, never a glow. */
const FROST = '#e8eef2';
/** Its crest of bristles down its spine, and the dark of its legs and snout where the wool gives out. */
export const CREST: Ramp = ['#0e0b10', '#1c161c', '#2e242a', '#43363c', '#5c4c52'];
export const HIDE: Ramp = ['#171217', '#2a2026', '#41333a', '#5b4a50', '#7a666a'];
/** Its tusks: old ivory. */
export const TUSK: Ramp = ['#4e4234', '#83735e', '#b4a286', '#dccdb0', '#f4ead4'];
const HOOFR: Ramp = ['#0a080c', '#16121a', '#262028', '#3a323c', '#544a54'];
/** The saddle: old leather, and iron. */
const LEATHER: Ramp = ['#1a0f0c', '#2e1c16', '#4a2e22', '#6a4430', '#8c5e42'];
const IRON: Ramp = ['#121218', '#24242e', '#3a3a48', '#585866', '#7e7e8e'];
/** His skin: ashen, the life gone grey out of it. */
export const ASH: Ramp = ['#2a2430', '#4a4252', '#726878', '#9a909e', '#c2b8c4'];
/** His order's cloak, gone to violet rags. */
export const RAGS: Ramp = ['#140a1e', '#261338', '#3c2054', '#583472', '#764e92'];
/** His hair and beard: long, white, lank. */
export const HAIR: Ramp = ['#6a6874', '#9c9aa6', '#c8c6d0', '#e6e4ec', '#fbfaff'];
/** His staff: old dark wood. */
const STAFF: Ramp = ['#140d0c', '#241816', '#3a2824', '#523a32', '#6c5044'];
/** A rune stone: grey slate. */
const SLATE: Ramp = ['#1c1a22', '#302e38', '#4a4854', '#666470', '#86848e'];
/** What burns on them: the enemy's pink burning to gold (FLAME: dark pink to pale gold). */
const BURN = FLAME;

// =============================================================================================
// THEIR SIZES. He is a little taller than the hero (the soldier is 58 picture pixels); the boar is sized to carry a man so:
// its hump about as high as his hip standing, its body about twice his stride long.

/** His build: gaunt, long in the arm, thin in the limb, his head a little big as every figure's is. */
export const WS_BODY: Build = buildOf(64, 1.3, { shoulders: 0.9, chest: 0.8, depth: 0.82, waist: 0.68, hips: 0.86, legs: 1.0, arms: 1.06, trunk: 1.02, limbs: 0.74 });
const B = WS_BODY;
/** Their picture: room for the staff held high, and for the boar's whole length turned any way. */
export const WS_CANVAS: MobCanvas = { w: 300, h: 300, ax: 150, ay: 214 };
/** The boar's size (its own lengths are a boar 34 at the hump). */
export const BOAR_SIZE = 1.28;
const S = BOAR_SIZE;

// =============================================================================================
// THE BOAR'S POSE

/** One leg: its upper bone's swing from hanging straight down (degrees, + forward), its lower's bend from the upper's line (+ forward). */
export type BoarLeg = readonly [number, number];
export interface BoarPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** Its head: lowered (degrees, + down) and turned (+ to its left). */
  low: number;
  look: number;
  /** Its legs: near fore, off fore, near hind, off hind (near: its left). */
  legs: readonly [BoarLeg, BoarLeg, BoarLeg, BoarLeg];
  /** How far its flanks are drawn in with its breath (0 ... 1), and its wool's swing (a round, 0 ... 1). */
  breath: number;
  sway: number;
}
export const BOAR_STAND: BoarPose = {
  x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, low: 6, look: 0,
  legs: [[2, -4], [2, -4], [-8, 14], [-8, 14]],
  breath: 0, sway: 0,
};

function turn(v: V3, yaw: number, pitch: number, roll: number): V3 {
  const [x0, y0, z0] = v;
  const cr = Math.cos(roll * D), sr = Math.sin(roll * D);
  const y1 = y0 * cr - z0 * sr;
  const z1 = y0 * sr + z0 * cr;
  const cp = Math.cos(pitch * D), sp = Math.sin(pitch * D);
  const x2 = x0 * cp - z1 * sp;
  const z2 = x0 * sp + z1 * cp;
  const cy = Math.cos(yaw * D), sy = Math.sin(yaw * D);
  return [x2 * cy - y1 * sy, x2 * sy + y1 * cy, z2];
}
/** A point of it (its own lengths, about its middle 24 up) where it is now. */
const PIVOT: V3 = [0, 0, 24];
export function boarAt(P: BoarPose, p: V3): V3 {
  return add(add(turn(mul(sub(p, PIVOT), S), P.yaw, P.pitch, P.roll), mul(PIVOT, S)), [P.x, P.y, P.z]);
}
const turned = (P: BoarPose, v: V3): V3 => turn(v, P.yaw, P.pitch, P.roll);
/** Where its rider sits: the saddle on its hump, and its own forward, left and up there. */
export function saddleOf(P: BoarPose): { at: V3; f: V3; l: V3; u: V3 } {
  return { at: boarAt(P, [1, 0, 37.2]), f: turned(P, [1, 0, 0]), l: turned(P, [0, 1, 0]), u: turned(P, [0, 0, 1]) };
}
/** Its legs' tops and lengths (upper, lower, its pastern to the hoof). */
const LEG_TOP: readonly V3[] = [[13, 6.2, 21.6], [13, -6.2, 21.6], [-14, 6.0, 22.8], [-14, -6.0, 22.8]];
const LEG_LONG: readonly (readonly [number, number, number])[] = [[9.5, 7.5, 3.0], [9.5, 7.5, 3.0], [10.5, 8.0, 3.0], [10.5, 8.0, 3.0]];
function legOf(P: BoarPose, i: number): { top: V3; knee: V3; fet: V3; end: V3 } {
  const [a1, a2] = P.legs[i];
  const [l1, l2, l3] = LEG_LONG[i];
  const top = boarAt(P, LEG_TOP[i]);
  const dir = (a: number): V3 => turned(P, turn([0, 0, -1], 0, a, 0));
  const knee = add(top, mul(dir(a1), l1 * S));
  const fet = add(knee, mul(dir(a1 + a2), l2 * S));
  const end = add(fet, mul(dir(a1 + a2 + 22), l3 * S));
  return { top, knee, fet, end };
}
/** Its hooves' soles (near fore, off fore, near hind, off hind). */
export function boarSoles(P: BoarPose): V3[] {
  return [0, 1, 2, 3].map((i) => add(legOf(P, i).end, [0, 0, -1.8 * S]));
}

// ITS HEAD AND NECK: a short, thick neck under the hump; a big wedge of a head carried low; a long snout to a flat disc.
function headOf(P: BoarPose): { at: (fwd: number, out: number, up: number) => V3; f: V3; l: V3; u: V3 } {
  // (the head turns and drops about its poll, behind its ears)
  const poll = boarAt(P, [19, 0, 26]);
  const f = turned(P, turn([1, 0, 0], P.look, P.low, 0));
  const l = turned(P, turn([0, 1, 0], P.look, 0, 0));
  const u = norm(cross(f, l), [0, 0, 1]);
  return { at: (fwd, out, up) => add(poll, add(mul(f, fwd * S), add(mul(l, out * S), mul(u, up * S)))), f, l, u };
}

// THE WOOL: long locks hanging, combed down and matted; frost on their tips; darker at the roots where it parts.
function woolSkin(seed: number, burnt?: (u: V3) => string | null): Skin {
  return (u, tone) => {
    const b = burnt?.(u);
    if (b !== undefined && b !== null) return b;
    // (locks: streaks running down the ball, each its own shade; their parting dark)
    const ang = Math.atan2(u[1], u[0]);
    const lock = Math.floor(ang * 5.2 + 40 + 0.8 * Math.sin(u[2] * 3 + seed));
    const h = hash(lock, seed, 8801);
    let t = tone + (h > 0.72 ? 1 : h < 0.2 ? -1 : 0);
    const fr = ((ang * 5.2 + 40 + 0.8 * Math.sin(u[2] * 3 + seed)) % 1 + 1) % 1;
    if (fr < 0.12 && tone < 3) t -= 1;
    // (its underside: the locks' tips, frosted)
    if (u[2] < -0.72 && h > 0.45 && tone >= 2) return FROST;
    return WOOL[T5(t)];
  };
}
/** His runes branded on its flank: the wool burnt off round them, the hide dark, the runes in it burning. The rune grids are the wordsmith's (art/town.ts RUNES). */
const RUNE_GRID: ReadonlyArray<ReadonlyArray<string>> = [
  ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..', '.#.#.', '#...#', '.....'],
  ['#.#.#', '#.#.#', '.###.', '..#..', '..#..', '.###.', '#.#.#', '#...#', '.....'],
];
const brand = (side: number) => (u: V3): string | null => {
  // (on the flank that faces out: its middle a little behind the barrel's middle, high on its side)
  if (u[1] * side < 0.55) return null;
  const a = (u[0] + 0.05) / 0.62; // -0.5 ... 0.5 across the brand
  const b = (0.38 - u[2]) / 0.9; // 0 ... 1 down it
  const r = Math.hypot(a * 1.4, (b - 0.45) * 1.2);
  if (r > 0.82) return null;
  // (the burnt patch round the rune: dark, scarred hide)
  const gx = Math.floor((a + 0.5) * 5);
  const gy = Math.floor(b * 9);
  const g = RUNE_GRID[side > 0 ? 0 : 1];
  const on = gx >= 0 && gx < 5 && gy >= 0 && gy < 9 && g[gy][gx] === '#';
  if (on) return gy < 3 ? BURN[3] : BURN[2];
  return r > 0.7 ? HIDE[1] : HIDE[2];
};

/** THE BOAR AS SOLIDS (its parts named `boar...`). */
export function boarBits(P: BoarPose, put: Put, near: number): void {
  const W = (p: V3): V3 => boarAt(P, p);
  const ax = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, mul(a, S)), turned(P, mul(b, S)), turned(P, mul(c, S))];
  const ball = (part: string, piece: string, at: V3, a: V3, b: V3, c: V3, skin: Skin, far?: boolean): void =>
    put(part, piece, { k: 'ball', c: W(at), ax: ax(a, b, c), skin, ...(far ? { far } : {}) });
  const br = 1 - 0.06 * P.breath;
  // ITS BODY: a deep barrel; its shoulders high and heavy, the hump over them where the saddle sits; its chest broad; its back
  // falling away to small hindquarters; a heavy belly
  ball('boarBody', 'barrel', [-2, 0, 24], [17, 0, 0], [0, 9.6 * br, 0], [0, 0, 9.4], woolSkin(1, near > 0 ? brand(1) : brand(-1)));
  ball('boarBody', 'shoulders', [9, 0, 27], [10.5, 0, 0], [0, 10.8, 0], [0, 0, 11.2], woolSkin(2));
  ball('boarBody', 'hump', [5, 0, 33], [8.5, 0, 0], [0, 7.6, 0], [0, 0, 4.6], woolSkin(3));
  ball('boarBody', 'chest', [16, 0, 21], [6.8, 0, 0], [0, 9.0, 0], [0, 0, 9.0], woolSkin(4));
  ball('boarBody', 'haunch', [-15, 0, 24], [8.2, 0, 0], [0, 8.4, 0], [0, 0, 8.4], woolSkin(5));
  ball('boarBody', 'rump', [-21, 0, 24], [4.4, 0, 0], [0, 7.2, 0], [0, 0, 7.0], woolSkin(6));
  ball('boarBody', 'belly', [0, 0, 18], [13, 0, 0], [0, 8.4 * br, 0], [0, 0, 6.2], woolSkin(7));
  // ITS NECK AND HEAD
  const H = headOf(P);
  const hb = (piece: string, fwd: number, out: number, up: number, rx: number, ry: number, rz: number, skin: Skin): void =>
    put('boarHead', piece, { k: 'ball', c: H.at(fwd, out, up), ax: [mul(H.f, rx * S), mul(H.l, ry * S), mul(H.u, rz * S)], skin });
  put('boarBody', 'neck', { k: 'ball', c: W([18, 0, 24]), ax: ax([6.4, 0, 0], [0, 8.6, 0], [0, 0, 8.8]), skin: woolSkin(8) });
  hb('skull', 4, 0, -0.5, 7.4, 7.0, 7.4, woolSkin(9));
  hb('face', 10.5, 0, -4.2, 7.4, 5.4, 5.2, HIDE);
  hb('snout', 17, 0, -7.2, 5.0, 3.6, 3.8, HIDE);
  hb('jaw', 11.5, 0, -9.2, 6.2, 4.6, 2.8, HIDE);
  // (its snout's flat disc, its nostrils)
  put('boarHead', 'disc', { k: 'ball', c: H.at(21.6, 0, -7.6), ax: [mul(H.f, 1.0 * S), mul(H.l, 3.0 * S), mul(H.u, 2.9 * S)], skin: (u, tone) => HIDE[T5(tone + 1)] });
  for (const k of [-1, 1]) put('boarHead', 'nostrils', { k: 'dot', p: H.at(22.6, k * 1.2, -7.8), c: CREST[0], facing: H.f });
  // (wool hanging from its cheeks and jowls, a beard of it under its jaw)
  for (const k of [-1, 1]) {
    for (let j = 0; j < 3; j++) {
      const a = H.at(5 + j * 2.6, k * (5.4 - j * 0.5), -4 - j * 0.6);
      const b = add(a, add(mul(H.l, k * 1.4 * S), [0, 0, -(5.5 - j) * S]));
      put('boarHead', 'jowls', { k: 'rod', a, b, ra: 2.0 * S, rb: 0.6 * S, ramp: WOOL });
    }
  }
  // ITS EYES: small, sunk, burning
  for (const k of [-1, 1]) hb('eyes', 8.6, k * 4.9, -1.2, 1.1, 0.7, 0.9, (u) => (Math.hypot(u[1], u[2]) < 0.6 ? BURN[3] : BURN[2]));
  // ITS EARS: small, pointed, laid back, the wool long on them
  for (const k of [-1, 1]) {
    const a = H.at(1, k * 4.4, 4.8);
    const b = add(a, add(mul(H.f, -3.4 * S), add(mul(H.l, k * 2.0 * S), mul(H.u, 2.6 * S))));
    put('boarHead', 'ears', { k: 'rod', a, b, ra: 1.8 * S, rb: 0.3 * S, ramp: WOOL });
  }
  // ITS TUSKS: out of its jaw, curving up and back, cut with his runes that burn
  for (const k of [-1, 1]) {
    const pts: V3[] = [H.at(16.5, k * 3.2, -9), H.at(19.4, k * 5.4, -6.6), H.at(20.6, k * 6.8, -2.2), H.at(19.0, k * 7.2, 2.0), H.at(16.0, k * 6.4, 4.2)];
    const rr = [2.0, 1.7, 1.3, 0.85, 0.35];
    for (let i = 0; i + 1 < pts.length; i++) put('boarHead', 'tusks', { k: 'rod', a: pts[i], b: pts[i + 1], ra: rr[i] * S, rb: rr[i + 1] * S, ramp: TUSK });
    // (the runes cut in them: notches burning down the curve)
    for (const f of [0.35, 0.6, 0.85]) {
      const seg = Math.min(pts.length - 2, Math.floor(f * (pts.length - 1)));
      const ff = f * (pts.length - 1) - seg;
      put('boarHead', 'tusks', { k: 'dot', p: lerp3(pts[seg], pts[seg + 1], ff), c: BURN[2], facing: H.l });
    }
  }
  // ITS CREST: a ridge of dark bristles down its spine, from its poll over the hump (under the saddle) to its rump
  const ridge: V3[] = [H.at(-1, 0, 6.2), W([14, 0, 37.5]), W([8, 0, 38.6]), W([-4, 0, 34.8]), W([-13, 0, 33]), W([-22, 0, 30])];
  for (let i = 0; i + 1 < ridge.length; i++) put('boarCrest', 'crest', { k: 'rod', a: ridge[i], b: ridge[i + 1], ra: 2.4 * S, rb: 1.9 * S, ramp: CREST });
  for (let i = 0; i < 12; i++) {
    const f = i / 11;
    const seg = Math.min(ridge.length - 2, Math.floor(f * (ridge.length - 1)));
    const p = lerp3(ridge[seg], ridge[seg + 1], f * (ridge.length - 1) - seg);
    const up = norm(add(turned(P, [-0.5, 0, 1]), [(hash(i, 3, 8803) - 0.5) * 0.5, (hash(i, 4, 8804) - 0.5) * 0.6, 0]));
    put('boarCrest', 'bristles', { k: 'rod', a: p, b: add(p, mul(up, (3.6 + 1.6 * hash(i, 5, 8805)) * S)), ra: 0.9 * S, rb: 0.2 * S, ramp: CREST });
  }
  // ITS LEGS: short and thick, the wool long on its shoulders and thighs and thinning to dark hide at its shanks; cloven hooves
  for (let i = 0; i < 4; i++) {
    const { top, knee, fet, end } = legOf(P, i);
    const part = `boarLeg${i}`;
    const far = (i % 2 === 0 ? 1 : -1) !== near;
    const hind = i >= 2;
    put(part, 'leg', { k: 'rod', a: top, b: knee, ra: (hind ? 4.4 : 4.0) * S, rb: 2.6 * S, ramp: WOOL, far });
    put(part, 'leg', { k: 'rod', a: knee, b: fet, ra: 2.3 * S, rb: 1.8 * S, ramp: HIDE, far });
    put(part, 'leg', { k: 'rod', a: fet, b: end, ra: 1.8 * S, rb: 1.7 * S, ramp: HIDE, far });
    // (the hoof: two toes, a cleft between them)
    const fw = turned(P, [1, 0, 0]);
    const side = turned(P, [0, 1, 0]);
    for (const t of [-1, 1]) {
      const toe = add(end, mul(side, t * 0.8 * S));
      put(part, 'hoof', { k: 'rod', a: add(toe, [0, 0, 0.6 * S]), b: add(add(toe, mul(fw, 1.4 * S)), [0, 0, -1.0 * S]), ra: 1.2 * S, rb: 0.8 * S, ramp: HOOFR, far });
    }
    // (wool hanging off the back of its thigh or forearm)
    const back = mul(fw, hind ? -1 : -0.6);
    for (let j = 0; j < 2; j++) {
      const a = lerp3(top, knee, 0.3 + 0.35 * j);
      put(part, 'locks', { k: 'rod', a, b: add(add(a, mul(back, 2.4 * S)), [0, 0, -5.5 * S]), ra: 2.0 * S, rb: 0.5 * S, ramp: WOOL, far });
    }
  }
  // ITS LOCKS: the long wool hanging down its flanks and belly, swinging, frost on their tips
  const sw = Math.sin(TAU * P.sway);
  for (let i = 0; i < 18; i++) {
    const f = (i % 9) / 8;
    const k = i < 9 ? 1 : -1;
    const along = 16 - f * 34;
    const root = W([along, k * (8.4 - Math.abs(along - 2) * 0.05), 17.5 + 0.12 * Math.max(0, along)]);
    const long = (5.5 + 2.6 * hash(i, 7, 8807)) * S;
    const tip = add(add(root, mul(turned(P, [0, k, 0]), 1.2 * S)), [sw * 0.8 * S, 0, -long]);
    put('boarLocks', 'locks', { k: 'rod', a: root, b: tip, ra: 2.2 * S, rb: 0.6 * S, ramp: WOOL, far: k !== near });
    put('boarLocks', 'frost', { k: 'dot', p: tip, c: FROST, facing: turned(P, [0, k, 0]) });
  }
  // ITS TAIL: short, a tuft
  const dock = W([-24.5, 0, 28]);
  put('boarTail', 'tail', { k: 'rod', a: dock, b: add(dock, add(turned(P, [-2.4, 0, -4.6]), [sw * 0.6, 0, 0])), ra: 1.3 * S, rb: 1.6 * S, ramp: CREST });
  // THE SADDLE on its hump: a seat of old leather on an iron frame, a high iron cantle, a pommel; a girth round its barrel; stirrups
  const sd = saddleOf(P);
  put('boarSaddle', 'saddle', { k: 'ball', c: add(sd.at, mul(sd.u, -0.6 * S)), ax: [mul(sd.f, 6.6 * S), mul(sd.l, 6.2 * S), mul(sd.u, 1.8 * S)], skin: LEATHER });
  put('boarSaddle', 'saddle', { k: 'rod', a: add(add(sd.at, mul(sd.f, -5.4)), mul(sd.l, 4.2)), b: add(add(add(sd.at, mul(sd.f, -6.2)), mul(sd.l, 0)), mul(sd.u, 3.2)), ra: 1.0, rb: 1.1, ramp: IRON });
  put('boarSaddle', 'saddle', { k: 'rod', a: add(add(sd.at, mul(sd.f, -6.2)), mul(sd.u, 3.2)), b: add(add(sd.at, mul(sd.f, -5.4)), mul(sd.l, -4.2)), ra: 1.1, rb: 1.0, ramp: IRON });
  put('boarSaddle', 'saddle', { k: 'rod', a: add(sd.at, mul(sd.f, 5.2)), b: add(add(sd.at, mul(sd.f, 6.4)), mul(sd.u, 3.0)), ra: 1.2, rb: 0.9, ramp: IRON });
  // (the saddle cloth under it: his order's violet, ragged, hanging over its sides)
  for (const k of [-1, 1]) {
    for (let j = 0; j < 3; j++) {
      const a = add(add(sd.at, mul(sd.f, -3 + j * 3)), add(mul(sd.l, k * 5.6), mul(sd.u, -1.2)));
      put('boarSaddle', 'cloth', { k: 'rod', a, b: add(add(a, mul(sd.l, k * 2.6)), [0, 0, -(7 + (j % 2) * 2)]), ra: 1.9, rb: 1.2, ramp: RAGS, far: k !== near });
    }
  }
  const girthC = W([2, 0, 24]);
  put('boarSaddle', 'girth', { k: 'band', ring: { c: girthC, u: turned(P, [0, 0, 9.8 * S]), v: turned(P, [0, 10.2 * S, 0]) }, ramp: LEATHER, rows: 1 });
  for (const k of [-1, 1]) {
    const hang = add(add(sd.at, mul(sd.l, k * 7.4)), mul(sd.u, -2));
    const foot = add(hang, [0, 0, -14]);
    put('boarSaddle', 'stirrups', { k: 'rod', a: hang, b: foot, ra: 0.45, rb: 0.45, ramp: LEATHER, far: k !== near });
    put('boarSaddle', 'stirrups', { k: 'rod', a: add(foot, mul(sd.f, -1.4)), b: add(foot, mul(sd.f, 1.4)), ra: 0.7, rb: 0.7, ramp: IRON, far: k !== near });
  }
}

// =============================================================================================
// HIM, ON THE HEROES' BONES

/** His pelvis's height standing, as the bones have it (his seat is set from it). */
const PELVIS0 = solve(B, { ...standing(B) } as never).pelvis[2];

/** His rest in the saddle: upright and stiff, his staff held high in his right hand, his left hand clawed before him, writing. */
export function riderPose(P: BoarPose, t = 0): Partial<Bones> {
  const seat = saddleOf(P);
  const at = add(seat.at, mul(seat.u, 2.6));
  const foot = (fwd: number, out: number, down: number): V3 => add(add(add(seat.at, mul(seat.f, fwd)), mul(seat.l, out)), [0, 0, -down]);
  const fl = foot(3.5, 8.2, 18);
  const frt = foot(3.5, -8.2, 18);
  const a = (t / WS_STAND_LONG) * TAU;
  return {
    px: at[0], py: at[1] + 1.1 * Math.sin(a + 0.9), pz: at[2] - PELVIS0 + 1.0 * Math.sin(a * 2),
    yaw: P.yaw, pitch: -2, roll: 0, twist: 6 + 2 * Math.sin(a + 0.5), bend: -2, side: 0, hunch: 5,
    faceTurn: 4 * Math.sin(a * 0.5), faceUp: 6, faceTilt: 2,
    lfx: fl[0], lfy: fl[1] - B.stance, lfz: fl[2] - B.ankle, lfp: 10, lft: 8, lk: 30, lkUp: 18,
    rfx: frt[0], rfy: frt[1] + B.stance, rfz: frt[2] - B.ankle, rfp: 10, rft: -8, rk: -30, rkUp: 18,
    // (his left hand out before him, fingers clawed, writing on the air; his right hand high, the staff in it)
    lhIn: 1, lhx: 10 + 1.4 * Math.sin(a * 2), lhy: 5.5 + 1.0 * Math.cos(a * 2), lhz: -2 + 1.2 * Math.sin(a * 2 + 0.6), le: -36,
    rhIn: 1, rhx: 2.6, rhy: -9.5, rhz: 12 + 0.6 * Math.sin(a), re: 54,
    out: 0,
  } as Partial<Bones>;
}

/** His staff: from below his hand to well over his head, taller than he is; the iron ring at its head and his great rune in it. */
function staffOf(s: Skeleton): { foot: V3; head: V3; ring: V3; up: V3; side: V3 } {
  const up = norm([0.08, -0.12, 1]);
  const foot = add(s.handR, mul(up, -26));
  const head = add(s.handR, mul(up, 48));
  const side = norm(cross(up, [0, 1, 0]), [1, 0, 0]);
  return { foot, head, ring: add(head, mul(up, 6.2)), up, side };
}

/** His skin: ashen, cut with runes that burn (a scatter of short cuts on the ball, burning pink). */
function ashSkin(seed: number, cuts = 0.08): Skin {
  return (u, tone) => {
    const a = Math.floor((Math.atan2(u[1], u[0]) + 4) * 5);
    const b = Math.floor((u[2] + 1) * 6);
    if (hash(a, b, seed) < cuts && tone >= 1) return tone >= 3 ? BURN[3] : BURN[2];
    return ASH[T5(tone)];
  };
}

/** HIS HEAD: gaunt, hollow-cheeked; his eyes sunk and burning; the iron band on his brow, its stone cracked and burning; long white hair. */
function head(put: Put, s: Skeleton): void {
  const [ff, fl, fu] = s.face;
  const hr = B.headR;
  const c = s.head;
  const at = (f: number, l: number, u: number): V3 => add(c, add(mul(ff, f), add(mul(fl, l), mul(fu, u))));
  // (his skull long, his cheeks hollow under the bone, his jaw narrow)
  put('head', 'head', { k: 'ball', c: at(-0.3, 0, 0.4), ax: [mul(ff, hr[0] * 0.95), mul(fl, hr[1] * 0.92), mul(fu, hr[2] * 1.0)], skin: ashSkin(41, 0.05) });
  put('head', 'jaw', { k: 'ball', c: at(1.0, 0, -2.6), ax: [mul(ff, hr[0] * 0.62), mul(fl, hr[1] * 0.62), mul(fu, hr[2] * 0.42)], skin: ASH });
  put('head', 'nose', { k: 'rod', a: at(hr[0] * 0.78, 0, 0.6), b: at(hr[0] * 1.02, 0, -1.2), ra: 0.75, rb: 0.6, ramp: ASH });
  // (his brow heavy over sunk eyes, the eyes burning)
  put('head', 'brow', { k: 'rod', a: at(hr[0] * 0.7, 2.1, 1.5), b: at(hr[0] * 0.7, -2.1, 1.5), ra: 0.75, rb: 0.75, ramp: ASH });
  // (the hollows under his cheekbones, dark)
  for (const k of [-1, 1]) put('head', 'cheeks', { k: 'dot', p: at(hr[0] * 0.8, k * 1.9, -1.0), c: ASH[0], facing: ff });
  for (const k of [-1, 1]) put('head', 'eyes', { k: 'dot', p: at(hr[0] * 0.86, k * 1.25, 0.4), c: BURN[3], facing: ff, c2: BURN[2] });
  // (his mouth a hard line)
  put('head', 'mouth', { k: 'dot', p: at(hr[0] * 0.9, 0, -1.6), c: ASH[0], facing: ff, c2: ASH[0] });
  // THE IRON BAND on his brow, and its stone, cracked, burning
  const band: Ring = { c: at(0.2, 0, 2.2), u: mul(ff, hr[0] * 0.98), v: mul(fl, hr[1] * 1.0) };
  put('head', 'band', { k: 'band', ring: band, ramp: IRON, rows: 1 });
  put('head', 'stone', { k: 'ball', c: at(hr[0] * 1.02, 0, 2.0), ax: [mul(ff, 0.7), mul(fl, 1.1), mul(fu, 1.2)], skin: (u) => (Math.abs(u[1] - u[2] * 0.4) < 0.22 ? BURN[3] : SLATE[2]) });
  // (his crown: thin white hair over it, combed back under the band)
  put('head', 'crown', { k: 'ball', c: at(-0.9, 0, 1.6), ax: [mul(ff, hr[0] * 0.92), mul(fl, hr[1] * 0.98), mul(fu, hr[2] * 0.78)], skin: (u, tone) => (u[0] > 0.55 && u[2] < 0.35 ? null : HAIR[T5(tone)]) });
  // HIS HAIR: long and white, lank, from under the band at the sides and back, falling over his shoulders and down his back
  for (let i = 0; i < 9; i++) {
    const a = (-100 + i * 25) * D;
    const root = at(-Math.cos(a) * hr[0] * 0.55 - 0.8, Math.sin(a) * hr[1] * 0.92, 1.0);
    const down = norm(add(mul(ff, -0.45), [0, 0, -1]));
    const long = 12 + 4 * hash(i, 2, 8811);
    put('hair', 'hair', { k: 'rod', a: root, b: add(root, add(mul(down, long), mul(fl, Math.sin(a) * 2.0))), ra: 1.25, rb: 0.4, ramp: HAIR });
  }
  // HIS BEARD: to his belt, thin and lank, in long strands with the dark between them, each narrowing to a point
  const BEARD_LO: Ramp = [HAIR[0], HAIR[0], HAIR[1], HAIR[2], HAIR[3]];
  for (let i = 0; i < 5; i++) {
    const o = (i - 2) * 1.15;
    const root = at(hr[0] * 0.7, o * 0.7, -2.2 - 0.4 * Math.abs(o));
    const mid = add(lerp3(s.neck, s.ribs, 0.55), add(mul(s.chest[0], B.ribDeep + 1.3), mul(s.chest[1], o * 1.1)));
    const end = add(lerp3(s.ribs, s.pelvis, 0.85 - 0.1 * Math.abs(o)), add(mul(s.belly[0], B.waistDeep + 1.3 + 0.2 * Math.abs(o)), mul(s.belly[1], o * 1.35)));
    const ramp = i % 2 ? BEARD_LO : HAIR;
    put('beard', `beard${i}`, { k: 'rod', a: root, b: mid, ra: 0.9, rb: 0.75, ramp });
    put('beard', `beard${i}`, { k: 'rod', a: mid, b: end, ra: 0.75, rb: 0.2, ramp });
  }
}

/** AN ARM: a ragged sleeve over a thin ashen arm cut with runes; a long bony hand. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R'): void {
  const L = side === 'L';
  const sh = L ? s.shoulderL : s.shoulderR;
  const el = L ? s.elbowL : s.elbowR;
  const ha = L ? s.handL : s.handR;
  const [r0, r1] = B.armR;
  // (the sleeve: wide, ragged, falling from the arm; under it the forearm bare from mid-way)
  put(`arm${side}`, 'sleeve', { k: 'rod', a: sh, b: el, ra: r0 * 1.6, rb: r0 * 1.5, ramp: RAGS });
  const cuff = lerp3(el, ha, 0.38);
  put(`arm${side}`, 'sleeve', { k: 'rod', a: el, b: cuff, ra: r0 * 1.5, rb: r1 * 2.1, ramp: RAGS });
  // (rags hanging off the sleeve)
  for (let j = 0; j < 2; j++) {
    const a = lerp3(el, cuff, 0.5 + 0.5 * j);
    put(`arm${side}`, 'sleeve', { k: 'rod', a, b: add(a, [0, 0, -6 - 2 * j]), ra: 1.3, rb: 0.5, ramp: RAGS });
  }
  put(`arm${side}`, 'fore', { k: 'rod', a: cuff, b: ha, ra: r1 * 0.95, rb: r1 * 0.8, ramp: ASH });
  // (runes cut down the forearm, burning)
  for (const f of [0.25, 0.55, 0.8]) put(`arm${side}`, 'fore', { k: 'dot', p: lerp3(cuff, ha, f), c: BURN[2], facing: norm(sub(ha, cuff)) });
  // (the hand: long and bony; the left clawed, the right closed on the staff)
  const dir = norm(sub(ha, el));
  put(`arm${side}`, 'hand', { k: 'ball', c: add(ha, mul(dir, 1.0)), ax: [mul(dir, 1.7), mul(norm(cross(dir, [0, 0, 1]), [0, 1, 0]), 1.2), [0, 0, 1.2]], skin: ASH });
  if (L) {
    for (let k = 0; k < 4; k++) {
      const spread = (k - 1.5) * 0.45;
      const a = add(ha, mul(dir, 2.0));
      const f = norm(add(dir, add(mul(norm(cross(dir, [0, 0, 1]), [0, 1, 0]), spread), [0, 0, 0.35])));
      const mid = add(a, mul(f, 2.0));
      put('armL', 'fingers', { k: 'rod', a, b: mid, ra: 0.45, rb: 0.4, ramp: ASH });
      put('armL', 'fingers', { k: 'rod', a: mid, b: add(mid, add(mul(f, 1.0), [0, 0, -1.2])), ra: 0.4, rb: 0.25, ramp: ASH });
    }
  }
}

/** HIS ROBE AND CLOAK: his order's, gone to violet rags; seated, the robe over his thighs, the cloak hanging in strips down the boar's flanks. */
function robe(put: Put, s: Skeleton, sway: number): void {
  const [cf, cl, cu] = s.chest;
  // (his chest and belly under the robe: thin; the robe's body)
  const neckC = lerp3(s.ribs, s.neck, 0.7);
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const rings: Ring[] = [
    { c: add(s.pelvis, mul(s.hips[2], -0.6)), u: mul(s.hips[0], B.pelvisDeep + 2.0), v: mul(s.hips[1], B.pelvisHalf + 2.2) },
    { c: waistC, u: mul(s.belly[0], B.waistDeep + 1.4), v: mul(s.belly[1], B.waistHalf + 1.4) },
    { c: lerp3(waistC, s.ribs, 0.6), u: mul(s.belly[0], B.ribDeep + 1.2), v: mul(s.belly[1], B.ribHalf + 1.2) },
    { c: neckC, u: mul(cf, B.ribDeep * 0.9), v: mul(cl, B.shoulderHalf * 0.95) },
  ];
  put('body', 'robe', { k: 'cloth', rings, ramp: RAGS, look: { folds: [0, 35, -35, 90, -90], lift: 0.02 } });
  // (a rope belt)
  put('body', 'belt', { k: 'band', ring: { c: waistC, u: mul(s.belly[0], B.waistDeep + 1.7), v: mul(s.belly[1], B.waistHalf + 1.7) }, ramp: LEATHER, rows: 1 });
  // (his thighs in the robe, out over the saddle; his shins down to the stirrups, wrapped)
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    const hip = L ? s.hipL : s.hipR;
    const knee = L ? s.kneeL : s.kneeR;
    const ankle = L ? s.ankleL : s.ankleR;
    const heel = L ? s.heelL : s.heelR;
    const toe = L ? s.toeL : s.toeR;
    put(`leg${side}`, 'thigh', { k: 'rod', a: hip, b: knee, ra: 3.0, rb: 2.4, ramp: RAGS });
    put(`leg${side}`, 'shin', { k: 'rod', a: knee, b: ankle, ra: 1.8, rb: 1.4, ramp: LEATHER });
    put(`leg${side}`, 'foot', { k: 'rod', a: add(heel, [0, 0, 0.8]), b: add(toe, [0, 0, 0.7]), ra: 1.2, rb: 1.0, ramp: LEATHER });
  }
  // THE CLOAK: from his shoulders, down his back and over the boar's flanks, in strips; its collar high and stiff
  const back = mul(s.upper[0], -1);
  for (let i = 0; i < 9; i++) {
    const a = (-70 + i * 17.5) * D;
    const top = add(neckC, add(mul(back, Math.cos(a) * (B.ribDeep + 1.0)), add(mul(cl, Math.sin(a) * (B.shoulderHalf + 0.8)), mul(cu, 1.2))));
    const out = add(mul(back, Math.cos(a) * 0.9), mul(cl, Math.sin(a) * 1.3));
    const long = 24 + 6 * hash(i, 9, 8821);
    const sw = Math.sin(TAU * sway + i * 0.7) * 1.2;
    const mid = add(top, add(mul(out, 5), [sw * 0.4, 0, -long * 0.5]));
    const end = add(mid, add(mul(out, 4), [sw, 0, -long * 0.5]));
    put('cloak', 'cloak', { k: 'rod', a: top, b: mid, ra: 3.0, rb: 2.6, ramp: RAGS });
    put('cloak', 'cloak', { k: 'rod', a: mid, b: end, ra: 2.6, rb: 0.9, ramp: RAGS });
  }
  // (the collar: stiff, high round the back of his neck)
  put('cloak', 'collar', { k: 'band', ring: { c: add(neckC, mul(cu, 2.2)), u: mul(cf, B.ribDeep + 0.6), v: mul(cl, B.shoulderHalf * 0.75) }, ramp: RAGS, rows: 2 });
  void sub;
}

/** HIS STAFF: old dark wood, iron-shod, runes cut down it burning; the iron ring at its head, his great rune burning in it. */
function staff(put: Put, s: Skeleton, t: number): void {
  const st = staffOf(s);
  put('staff', 'staff', { k: 'rod', a: st.foot, b: st.head, ra: 1.05, rb: 1.2, ramp: STAFF });
  put('staff', 'staff', { k: 'rod', a: st.foot, b: add(st.foot, mul(st.up, 3)), ra: 1.25, rb: 1.2, ramp: IRON });
  // (runes cut down it, burning, each lit in turn)
  for (let i = 0; i < 7; i++) {
    const p = add(st.foot, mul(st.up, 30 + i * 3.4));
    const hot = (Math.floor(t * 6) + i) % 7 === 0;
    put('staff', 'runes', { k: 'dot', p, c: hot ? BURN[4] : BURN[2], facing: st.side, c2: BURN[1] });
  }
  // THE RING: iron, round, standing over the staff's head, two prongs holding it
  const R = 5.4;
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU;
    const a1 = ((i + 1) / n) * TAU;
    const p0 = add(st.ring, add(mul(st.side, Math.cos(a0) * R), mul(st.up, Math.sin(a0) * R)));
    const p1 = add(st.ring, add(mul(st.side, Math.cos(a1) * R), mul(st.up, Math.sin(a1) * R)));
    put('staff', 'ring', { k: 'rod', a: p0, b: p1, ra: 0.95, rb: 0.95, ramp: IRON });
  }
  for (const k of [-1, 1]) put('staff', 'ring', { k: 'rod', a: st.head, b: add(st.ring, add(mul(st.side, k * R * 0.7), mul(st.up, -R * 0.7))), ra: 0.8, rb: 0.7, ramp: IRON });
  // HIS GREAT RUNE, burning in it: the strokes of the wordsmith's great rune (a staff with arms and a fork), white-hot at its heart
  const g = ['..#..', '#.#.#', '.###.', '..#..', '.###.', '#.#.#', '..#..'];
  for (let j = 0; j < g.length; j++) for (let i = 0; i < 5; i++) {
    if (g[j][i] !== '#') continue;
    const p = add(st.ring, add(mul(st.side, (i - 2) * 1.35), mul(st.up, (3 - j) * 1.35)));
    const heart = i === 2 && j > 1 && j < 5;
    put('staffRune', 'rune', { k: 'mote', p, c: heart ? BURN[4] : (Math.floor(t * 10) + i + j) % 5 === 0 ? BURN[4] : BURN[3], size: 2 });
  }
  put('staffRune', 'glow', { k: 'glow', p: st.ring, c: BURN[2], r: 16, a: 0.4 });
}

/** HIS RUNES ON THE AIR, where his left hand writes, and the cracked rune stones going round him. */
function runesAbout(put: Put, s: Skeleton, t: number): void {
  // (the strokes his fingers leave, burning, thinning as they go)
  for (let i = 0; i < 9; i++) {
    const age = ((t * 2 + i / 9) % 1);
    const a = (i / 9) * TAU * 1.3 + t * 4;
    const p = add(s.handL, [2.5 + Math.cos(a) * 2.6, Math.sin(a) * 2.6, 1.5 + age * 6]);
    if (age > 0.8) continue;
    put('air', 'runes', { k: 'mote', p, c: age < 0.25 ? BURN[4] : age < 0.55 ? BURN[3] : BURN[2], size: age < 0.4 ? 2 : 1 });
  }
  // (three cracked rune stones going round him, slowly, at his waist; a crack burning in each)
  for (let k = 0; k < 3; k++) {
    const a = t * 0.9 + (k / 3) * TAU;
    const c = add(s.pelvis, [Math.cos(a) * 17, Math.sin(a) * 17, 6 + 2.5 * Math.sin(a * 2 + k)]);
    put('stones', `stone${k}`, { k: 'ball', c, ax: [[1.8, 0.4, 0], [-0.4, 1.4, 0], [0, 0, 2.4]], skin: (u, tone) => (Math.abs(u[0] * 0.6 + u[2] * 0.5) < 0.14 ? BURN[3] : SLATE[T5(tone)]) });
  }
}

// =============================================================================================
// THE TWO TOGETHER, AS THE PAINTER TAKES THEM

/** The boar's pose at a moment of a move: standing, breathing heavily, its head tossing a little, a forefoot pawing. */
export function boarPoseAt(move: string, t: number): BoarPose {
  void move;
  const a = (t / WS_STAND_LONG) * TAU;
  const paw = clamp01(Math.sin(a * 2 + 0.3)) ** 2;
  return {
    ...BOAR_STAND,
    z: -0.3 * Math.sin(a * 2),
    pitch: 0.6 * Math.sin(a * 2),
    low: BOAR_STAND.low + 3 * Math.sin(a + 0.4) - 2 * clamp01(Math.sin(a * 2 - 1)),
    look: 4 * Math.sin(a * 0.5),
    // (a forefoot pawing the floor: lifted straight up off its spot (its knee forward as its shank folds back), struck down where it was)
    legs: [[2 + 16 * paw, -4 - 36 * paw], [2, -4], [-8, 14], [-8, 14]],
    breath: 0.5 + 0.5 * Math.sin(a * 2),
    sway: t / WS_STAND_LONG,
  };
}

function wsBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const { s } = m;
  const P = boarPoseAt(m.move ?? 'stand', m.t);
  const near = st.near(add(s.pelvis, [0, -3, 0])) > st.near(add(s.pelvis, [0, 3, 0])) ? -1 : 1;
  boarBits(P, put, near);
  robe(put, s, P.sway);
  arm(put, s, 'L');
  arm(put, s, 'R');
  // (his neck: thin, the cords of it standing out)
  put('neck', 'neck', { k: 'rod', a: lerp3(s.ribs, s.neck, 0.5), b: lerp3(s.neck, s.head, 0.5), ra: 1.6, rb: 1.3, ramp: ASH });
  head(put, s);
  staff(put, s, m.t);
  runesAbout(put, s, m.t);
  return bits;
}

/** HIS STAND IN THE SADDLE: 3.2 s round. */
export const WS_STAND_LONG = 3.2;
function standMotion(): Motion {
  const keys: Key3[] = [];
  const N = 32;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * WS_STAND_LONG;
    keys.push({ at: t, ease: 'lin', pose: riderPose(boarPoseAt('stand', t), t) });
  }
  return { loop: 0, keys };
}
const REST: Bones = { ...standing(B), ...riderPose(BOAR_STAND, 0) } as Bones;

/** THEM AS A MONSTER OF THE GAME'S (only the stand so far: the look, for his yes; the moves come after). */
export function wsMob(): Mob {
  const stand = { name: 'stand', motion: standMotion(), rest: REST };
  return {
    id: 'wordsmithBoss',
    name: 'The Warped Wordsmith',
    size: 'the biggest boss: a little taller than the hero, on a boar sized to carry him',
    build: B,
    stand,
    attack: stand,
    walk: stand,
    reel: stand,
    dying: stand,
    idleFrames: 32,
    idleFps: 10,
    walkFrames: 32,
    walkFps: 10,
    pace: 1,
    reelTime: 0.4,
    hit: 0.5,
    warn: 0.5,
    dieTime: 1,
    aura: { x: WS_CANVAS.ax, y: WS_CANVAS.ay - 60, r: 60, color: '#ff3a78', a: 0.08 },
    shadow: 30,
    canvas: WS_CANVAS,
    trueBack: true,
    bits: wsBits,
  } as unknown as Mob;
}

// =============================================================================================
// THEM AS THE CHECKS SEE THEM (art/boss_checks.ts; his rulebook's How art is made 7)

/** His outside as painted: his legs in the robe and his shins, his sleeves, his neck; his head, his chest, his belly and his hips. */
export function wsSolids(s: Skeleton): { limbs: CheckLimb[]; lumps: CheckLump[] } {
  const [r0, r1] = B.armR;
  const limbs: CheckLimb[] = [];
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    limbs.push(
      { name: `leg${side}`, a: L ? s.hipL : s.hipR, b: L ? s.kneeL : s.kneeR, r: 3.0 },
      { name: `shin${side}`, a: L ? s.kneeL : s.kneeR, b: L ? s.ankleL : s.ankleR, r: 1.8 },
      { name: `upper${side}`, a: L ? s.shoulderL : s.shoulderR, b: L ? s.elbowL : s.elbowR, r: r0 * 1.6 },
      { name: `fore${side}`, a: L ? s.elbowL : s.elbowR, b: L ? s.handL : s.handR, r: r1 * 1.4 },
    );
  }
  limbs.push({ name: 'neck', a: lerp3(s.ribs, s.neck, 0.5), b: lerp3(s.neck, s.head, 0.5), r: 1.6 });
  const waistC = add(s.pelvis, mul(s.hips[2], B.waist * 0.6));
  const lumps: CheckLump[] = [
    { name: 'head', c: s.head, rot: s.face, h: [B.headR[0] * 0.95, B.headR[1] * 0.95, B.headR[2]] },
    { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [B.ribDeep + 1.0, B.ribHalf + 1.0, len(sub(s.neck, s.ribs)) * 0.55] },
    { name: 'belly', c: lerp3(waistC, s.ribs, 0.45), rot: s.belly, h: [B.waistDeep + 1.2, B.waistHalf + 1.2, Math.max(3, len(sub(s.ribs, waistC)) * 0.6)] },
    { name: 'hips', c: add(s.pelvis, mul(s.hips[2], B.waist * 0.2)), rot: s.hips, h: [B.pelvisDeep + 1.8, B.pelvisHalf + 1.8, B.waist * 0.7] },
  ];
  return { limbs, lumps };
}
/** THE SHAPE THE REVIEW TAKES: his body; the staff he carries (held in his right hand); the boar's hooves, what grips the floor (he rides: his feet are in the stirrups, not on it); the points followed from frame to frame. */
export const WS_SHAPE: BossShape = {
  body: (s: Skeleton) => wsSolids(s),
  things: (_move: string, _t: number, s: Skeleton) => {
    const st = staffOf(s);
    const pts: V3[] = [];
    for (let i = 0; i <= 12; i++) pts.push(lerp3(st.foot, st.head, i / 12));
    return [{ name: 'staff', pts, r: 1.2, may: ['foreR', 'upperR'] }];
  },
  grips: (move: string, t: number) => boarSoles(boarPoseAt(move, t)).map((p, i) => ({ name: `hoof${i}`, p })),
  follow: (move: string, t: number, s: Skeleton, _q: Posed) => {
    const P = boarPoseAt(move, t);
    const H = headOf(P);
    const st = staffOf(s);
    const soles = boarSoles(P);
    return { head: s.head, handL: s.handL, handR: s.handR, pelvis: s.pelvis, ring: st.ring, snout: H.at(21.6, 0, -7.6), hoof0: soles[0], hoof2: soles[2] };
  },
};
void len;
