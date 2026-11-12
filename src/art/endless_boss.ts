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
import { wornOn } from './skin';
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
/** Its wool in the shade under it, where it hangs. */
const SHAG: Ramp = ['#24212a', '#3e3842', '#615a62', '#8c8488', '#b0a8a6'];
/** Its crest of bristles down its spine, and the dark of its legs and snout where the wool gives out. */
export const CREST: Ramp = ['#0e0b10', '#1c161c', '#2e242a', '#43363c', '#5c4c52'];
export const HIDE: Ramp = ['#171217', '#2a2026', '#41333a', '#5b4a50', '#7a666a'];
/** Its tusks: old ivory. */
export const TUSK: Ramp = ['#4e4234', '#83735e', '#b4a286', '#dccdb0', '#f4ead4'];
const HOOFR: Ramp = ['#0a080c', '#16121a', '#262028', '#3a323c', '#544a54'];
/** The saddle: old leather, and iron. */
const LEATHER: Ramp = ['#1a0f0c', '#2e1c16', '#4a2e22', '#6a4430', '#8c5e42'];
const IRON: Ramp = ['#121218', '#24242e', '#3a3a48', '#585866', '#7e7e8e'];
/** ITS ARMOUR: blackened iron, old and dented, a cold sheen on its edges. */
const ARMOUR: Ramp = ['#100e15', '#1f1c26', '#34303d', '#55505f', '#86808f'];
/** His breeches: a dark grey wool; his riding boots: old black leather. */
const BREECH: Ramp = ['#141218', '#221f28', '#36323e', '#4c4756', '#666070'];
const BOOT: Ramp = ['#0c0a0c', '#1a1416', '#2c2224', '#423234', '#5e4a4a'];
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
export const WS_CANVAS: MobCanvas = { w: 340, h: 320, ax: 170, ay: 232 };
/** The boar's size (its own lengths are a boar 34 at the hump). */
export const BOAR_SIZE = 1.5;
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
  /** Its head rolled over (degrees, + to its right: shaking), and its ears flung (-1 ... 1: left behind as its head swings). */
  tilt?: number;
  flap?: number;
  /** HOOVES PLANTED (standing): each hoof kept on its own spot on the floor, lifted straight up off it by this much (0 down ... 1 a
   * stamp's height), the leg bending to reach it; not said, each leg swings as `legs` says. */
  lift?: readonly [number, number, number, number];
  /** HIS POWER IN IT (0 ... 1): the throb of pink in its eyes and the runes in its armour. */
  pulse?: number;
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
  if (!P.lift) return { top, knee, fet, end };
  // PLANTED: its hoof where it stands (its spot as it stands square, carried with it if it has moved), lifted straight up off it
  // by `lift`; the pastern as it stands; the knee (forward on a foreleg) or the hock (back on a hind) bent to reach
  const R = PLANT[i];
  const c = Math.cos(P.yaw * D), sn = Math.sin(P.yaw * D);
  const at = (v: V3): V3 => [P.x + v[0] * c - v[1] * sn, P.y + v[0] * sn + v[1] * c, v[2]];
  // (lifted, its hoof comes up and out in front of its chest, under its jaw where it is seen, its pastern folding back so the
  // hoof hangs, its sole to the rear; then struck back down where it stood)
  const p = P.lift[i];
  const fh = norm([c, sn, 0], [1, 0, 0]);
  const up: V3 = add([0, 0, p * STAMP_UP * S], mul(fh, p * STAMP_OUT * S));
  const pFet = add(at(R.fet), up);
  const a = (STAND_PASTERN - STAMP_FOLD * p) * D;
  const pEnd = p > 0 ? add(pFet, mul(add(mul(fh, Math.sin(a)), [0, 0, -Math.cos(a)]), l3 * S)) : add(at(R.end), up);
  const L1 = l1 * S;
  const L2 = l2 * S;
  const v = sub(pFet, top);
  const d = Math.max(Math.abs(L1 - L2) + 0.01, Math.min(L1 + L2 - 0.01, len(v)));
  const u = norm(v, [0, 0, -1]);
  const fw0 = turned(P, [1, 0, 0]);
  const want = mul(norm([fw0[0], fw0[1], 0], [1, 0, 0]), i < 2 ? 1 : -1);
  const n = norm(sub(want, mul(u, want[0] * u[0] + want[1] * u[1] + want[2] * u[2])), want);
  const ca = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  const kneeIK = add(top, add(mul(u, L1 * ca), mul(n, L1 * sa)));
  const fetIK = add(top, mul(u, d));
  return { top, knee: kneeIK, fet: fetIK, end: add(fetIK, sub(pEnd, pFet)) };
}
/** How high a stamp lifts a hoof off the floor, how far out in front it brings it, how far its pastern folds (its own lengths,
 * degrees), and the pastern's slope as it stands (forward of straight down, degrees). */
const STAMP_UP = 7.5;
const STAMP_OUT = 7;
const STAMP_FOLD = 70;
const STAND_PASTERN = 20;
/** Where each hoof stands as it stands square (its pastern's top and its end): its spot on the floor. */
const PLANT: { fet: V3; end: V3 }[] = [0, 1, 2, 3].map((i) => {
  const P = { ...BOAR_STAND, lift: undefined };
  const L = legOf(P, i);
  return { fet: L.fet, end: L.end };
});
/** Its hooves' soles (near fore, off fore, near hind, off hind). */
export function boarSoles(P: BoarPose): V3[] {
  return [0, 1, 2, 3].map((i) => add(legOf(P, i).end, [0, 0, -1.8 * S]));
}

// ITS HEAD AND NECK: a short, thick neck under the hump; a big wedge of a head carried low; a long snout to a flat disc.
function headOf(P: BoarPose): { at: (fwd: number, out: number, up: number) => V3; f: V3; l: V3; u: V3 } {
  // (the head turns and drops about its poll, behind its ears)
  const poll = boarAt(P, [19, 0, 26]);
  const f = turned(P, turn([1, 0, 0], P.look, P.low, 0));
  const l0 = turned(P, turn([0, 1, 0], P.look, 0, 0));
  // (shaking: its head rolled over about its own forward)
  const tl = ((P.tilt ?? 0) * Math.PI) / 180;
  const u0 = norm(cross(f, l0), [0, 0, 1]);
  const l = norm(add(mul(l0, Math.cos(tl)), mul(u0, -Math.sin(tl))), l0);
  const u = norm(cross(f, l), [0, 0, 1]);
  return { at: (fwd, out, up) => add(poll, add(mul(f, fwd * S), add(mul(l, out * S), mul(u, up * S)))), f, l, u };
}

// THE WOOL: long locks hanging, combed down and matted; frost on their tips; darker at the roots where it parts.
function woolSkin(seed: number): Skin {
  // THE GAME'S FUR (art/companions_art.ts fur, art/moth.ts furSkin: “a coat's tones broken by short strokes of the tone below, and
  // a few of the one above”; “never squares”): here the strokes hang down, as long wool hangs, and run on across the body's parts
  // (laid by the picture's own pixels), so that it is one coat, not lumps, not scales.
  return (_u, tone, x, y) => {
    const col = Math.floor(x / 1.6 + 0.6 * Math.sin(y * 0.21 + seed * 0.3));
    const run = Math.floor((y + 7 * hash(col, 1, 8812)) / 6);
    const h = hash(col, run, 8811);
    const k = tone + (h < 0.2 ? -1 : h > 0.92 ? 1 : 0);
    return WOOL[T5(k)];
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
export function boarBits(P: BoarPose, put: Put, near: number, st?: Stage): void {
  const W = (p: V3): V3 => boarAt(P, p);
  const ax = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, mul(a, S)), turned(P, mul(b, S)), turned(P, mul(c, S))];
  const ball = (part: string, piece: string, at: V3, a: V3, b: V3, c: V3, skin: Skin, far?: boolean): void =>
    put(part, piece, { k: 'ball', c: W(at), ax: ax(a, b, c), skin, ...(far ? { far } : {}) });
  const br = 1 - 0.06 * P.breath;
  // ITS BODY: a deep barrel; its shoulders high and heavy, the hump over them where the saddle sits; its chest broad; its back
  // falling away to small hindquarters; a heavy belly
  ball('boarBody', 'barrel', [-2, 0, 24], [17, 0, 0], [0, 9.6 * br, 0], [0, 0, 9.4], woolSkin(1));
  ball('boarBody', 'shoulders', [9, 0, 27], [10.5, 0, 0], [0, 10.2, 0], [0, 0, 11.2], woolSkin(2));
  ball('boarBody', 'hump', [6, 0, 32.5], [9.5, 0, 0], [0, 8.2, 0], [0, 0, 6.2], woolSkin(3));
  ball('boarBody', 'chest', [16, 0, 21], [6.8, 0, 0], [0, 9.0, 0], [0, 0, 9.0], woolSkin(4));
  ball('boarBody', 'haunch', [-15, 0, 24], [8.2, 0, 0], [0, 8.4, 0], [0, 0, 8.4], woolSkin(5));
  ball('boarBody', 'rump', [-21, 0, 24], [4.4, 0, 0], [0, 7.2, 0], [0, 0, 7.0], woolSkin(6));
  ball('boarBody', 'belly', [0, 0, 18], [13, 0, 0], [0, 8.4 * br, 0], [0, 0, 6.2], woolSkin(7));
  // (his runes branded on its flank: the wool burnt off round them, the hide dark, the runes burning)
  for (const k of [-1, 1]) {
    if (k !== near) continue;
    put('boarBody', 'brand', {
      k: 'panel', c: W([-6, k * 9.95, 25.5]), u: turned(P, [4.4 * S, 0, 0]), v: turned(P, [0, 0, 5.2 * S]),
      skin: (a2, b2) => {
        const r = Math.hypot(a2, b2 * 0.9);
        if (r > 1) return null;
        const gx = Math.floor((a2 * k * 0.5 + 0.5) * 5);
        const gy = Math.floor((-b2 * 0.5 + 0.5) * 9);
        const g = RUNE_GRID[0];
        if (gx >= 0 && gx < 5 && gy >= 0 && gy < 9 && g[gy][gx] === '#') return gy < 3 ? BURN[3] : BURN[2];
        return r > 0.82 ? HIDE[1] : HIDE[2];
      },
    });
  }
  // ITS NECK AND HEAD
  const H = headOf(P);
  const hb = (piece: string, fwd: number, out: number, up: number, rx: number, ry: number, rz: number, skin: Skin): void =>
    put('boarHead', piece, { k: 'ball', c: H.at(fwd, out, up), ax: [mul(H.f, rx * S), mul(H.l, ry * S), mul(H.u, rz * S)], skin });
  // ITS HEAD: a great wedge carried low, one smooth whole from behind its ears to its snout's flat disc; a heavy jaw under it
  const hr = (fwd: number, up: number, h: number, w: number): Ring => ({ c: H.at(fwd, 0, up), u: mul(H.u, h * S), v: mul(H.l, w * S) });
  put('boarHead', 'head', { k: 'cloth', rings: [hr(-3, 0, 6.0, 6.0), hr(2, -0.5, 7.4, 7.0), hr(8, -2.8, 6.4, 5.8), hr(14, -5.4, 4.6, 4.2), hr(19, -7.2, 3.4, 3.2), hr(21, -7.6, 3.0, 3.0)], ramp: HIDE, look: { folds: [], lift: 0.06 }, rigid: true });
  // (the wool over its poll and down its cheeks, thick)
  hb('skull', 2.4, 0, 0.8, 6.0, 7.2, 6.0, woolSkin(9));
  hb('jaw', 11, 0, -8.6, 6.4, 4.8, 2.6, HIDE);
  // (its snout's flat disc, its nostrils)
  put('boarHead', 'disc', { k: 'ball', c: H.at(21.4, 0, -7.6), ax: [mul(H.f, 0.9 * S), mul(H.l, 3.0 * S), mul(H.u, 2.9 * S)], skin: (u, tone) => HIDE[T5(tone + 1)] });
  for (const k of [-1, 1]) put('boarHead', 'nostrils', { k: 'dot', p: H.at(22.3, k * 1.2, -7.8), c: CREST[0], facing: H.f });
  // (wool hanging from its cheeks and jowls, a beard of it under its jaw)
  for (const k of [-1, 1]) {
    for (let j = 0; j < 3; j++) {
      const a = H.at(5 + j * 2.6, k * (5.4 - j * 0.5), -4 - j * 0.6);
      const b = add(a, add(mul(H.l, (k * 1.4 - 2.4 * (P.flap ?? 0)) * S), [0, 0, -(5.5 - j) * S]));
      put('boarHead', 'jowls', { k: 'rod', a, b, ra: 2.0 * S, rb: 0.6 * S, ramp: WOOL });
    }
  }
  // ITS EYES: small, sunk, burning
  for (const k of [-1, 1]) hb('eyes', 8.6, k * 4.9, -1.2, 1.1, 0.7, 0.9, (u) => (Math.hypot(u[1], u[2]) < 0.6 ? BURN[3] : BURN[2]));
  // ITS EARS: small, pointed, laid back, the wool long on them
  for (const k of [-1, 1]) {
    const a = H.at(1, k * 4.4, 4.8);
    const fl = P.flap ?? 0;
    const b = add(a, add(mul(H.f, -3.4 * S), add(mul(H.l, (k * 2.0 - 2.2 * fl) * S), mul(H.u, (2.6 + 0.8 * Math.abs(fl)) * S))));
    put('boarHead', 'ears', { k: 'rod', a, b, ra: 1.8 * S, rb: 0.3 * S, ramp: WOOL });
  }
  // ITS TUSKS: out of its jaw, curving up and back, cut with his runes that burn
  for (const k of [-1, 1]) {
    const pts: V3[] = [H.at(16.5, k * 3.2, -9), H.at(19.4, k * 5.4, -6.6), H.at(20.6, k * 6.8, -2.2), H.at(19.0, k * 7.2, 2.0), H.at(16.0, k * 6.4, 4.2)];
    const rr = [2.2, 1.9, 1.5, 1.0, 0.4];
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
    // (none on its neck, where its armour lies)
    if (f < 0.2) continue;
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
    put('boarBody', 'legWool', { k: 'rod', a: top, b: knee, ra: (hind ? 4.4 : 4.0) * S, rb: 2.6 * S, ramp: WOOL, far });
    put(part, 'leg', { k: 'rod', a: knee, b: fet, ra: 2.3 * S, rb: 1.8 * S, ramp: HIDE, far });
    put(part, 'leg', { k: 'rod', a: fet, b: end, ra: 1.8 * S, rb: 1.7 * S, ramp: HIDE, far });
    // (the hoof: two toes, a cleft between them)
    const fw = turned(P, [1, 0, 0]);
    const side = turned(P, [0, 1, 0]);
    for (const t of [-1, 1]) {
      const toe = add(end, mul(side, t * 0.8 * S));
      put(part, 'hoof', { k: 'rod', a: add(toe, [0, 0, 0.6 * S]), b: add(add(toe, mul(fw, 1.4 * S)), [0, 0, -1.0 * S]), ra: 1.2 * S, rb: 0.8 * S, ramp: HOOFR, far });
    }
    void fw;
  }
  // ITS SHAG: the long wool hanging from its flanks and belly in a ragged skirt, the boar's own coat (in its body's part, so no
  // seam cuts it into teeth): many soft locks, each its own length, their ends rounded, in the shade under it
  const sw = Math.sin(TAU * P.sway);
  for (let i = 0; i < 40; i++) {
    const k = i % 2 ? 1 : -1;
    const along = 19 - (i / 39) * 40 + (hash(i, 11, 8806) - 0.5) * 2.4;
    const fall = Math.max(0, 1 - Math.abs(along + 1) / 24);
    const root = W([along, k * (8.2 - Math.abs(along - 1) * 0.07), 18.0 + 0.08 * Math.max(0, along)]);
    const long = (3.2 + 3.4 * fall + 1.6 * hash(i, 7, 8807)) * S;
    const tip = add(add(root, mul(turned(P, [-0.2, k, 0]), 0.9 * S)), [sw * 0.5 * S, 0, -long]);
    put('boarBody', 'shag', { k: 'rod', a: root, b: tip, ra: (1.9 + 0.7 * hash(i, 17, 8809)) * S, rb: (0.9 + 0.4 * hash(i, 23, 8813)) * S, ramp: SHAG, far: k !== near });
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
    const hang = add(add(sd.at, mul(sd.l, k * 7.0 * S)), mul(sd.u, -1.6 * S));
    const foot = add(add(add(sd.at, mul(sd.f, -0.5)), mul(sd.l, k * 13.4 * S)), [0, 0, -12.0 * S - 0.6]);
    put('boarSaddle', 'stirrups', { k: 'rod', a: hang, b: foot, ra: 0.5, rb: 0.5, ramp: LEATHER, far: k !== near });
    put('boarSaddle', 'stirrups', { k: 'rod', a: add(foot, mul(sd.f, -1.5)), b: add(foot, mul(sd.f, 1.5)), ra: 0.75, rb: 0.75, ramp: IRON, far: k !== near });
  }
  boarArmour(P, put, near, st);
}

/** How a rune of his burns at a throb of `p` (0 ... 1): dark pink, to pink, to gold at its height. */
const burnAt = (p: number, hot = 0): string => BURN[Math.max(1, Math.min(4, Math.round(1 + 2.2 * p + hot)))];
const dot3 = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** ITS ARMOUR, his: plates of blackened iron hammered to it, his runes cut in them and burning pink with his power, throbbing as
 * its eyes do. A face plate down its brow and snout, a spike out of its brow; a great plate of lames over each shoulder; a plate
 * over its hindquarters; iron on its shanks, spiked, its hooves shod in it. And its eyes: his power pouring out of them, pink,
 * flaring at each throb. In his words, 12 Nov 2026: “The boar really isn’t menacing enough.  Maybe some armor, pink energy
 * pulsing out of its eyes and runes”, then “Spiked hoof plates”. Each plate is a shell over the part it covers, the wool showing
 * round it, so it lies on the boar and is not a lump stuck to it. */
function boarArmour(P: BoarPose, put: Put, near: number, st?: Stage): void {
  const W = (p: V3): V3 => boarAt(P, p);
  const pulse = P.pulse ?? 0;
  const lit = burnAt(pulse);
  const H = headOf(P);
  const glyph = (g: ReadonlyArray<string>, a: number, b: number): boolean => {
    const gx = Math.floor((a + 0.5) * 5);
    const gy = Math.floor(b * 8);
    return gx >= 0 && gx < 5 && gy >= 0 && gy < 8 && g[gy][gx] === '#';
  };
  /** A SHELL: a ball a little bigger than the part of the boar it covers, painted only where the plate is (`plate` says, for each
   * way out from its middle: its lame (0, 1, 2 ...) and how far in from its edge it is (0 at its edge ... 1), or null where the
   * wool shows), its lames lapped (a dark line under each lame's lower edge, a light one along its top), rivets round it. */
  const shell = (part: string, piece: string, c: V3, r: V3, plate: (u: V3) => { lame: number; inn: number; rune?: boolean } | null, far: boolean): void => {
    put(part, piece, {
      k: 'ball', c: W(c), ax: [turned(P, [r[0] * S, 0, 0]), turned(P, [0, r[1] * S, 0]), turned(P, [0, 0, r[2] * S])], far,
      skin: (u, tone, x, y) => {
        const q = plate(u);
        if (!q) return null;
        if (q.rune) return lit;
        // (its edge: a hard dark line, a lit lip inside it, a rivet every few pixels along it)
        if (q.inn < 0.1) return ARMOUR[T5(tone - 2)];
        if (q.inn < 0.24) return (x + 2 * y) % 5 === 0 ? ARMOUR[4] : ARMOUR[T5(tone + 1)];
        // (old iron: dents and pits, a tone down here and there)
        return ARMOUR[T5(tone - (hash(x >> 1, y >> 1, 8871) < 0.12 ? 1 : 0))];
      },
    });
  };
  // THE SHOULDER PLATES: a great plate of three lames over each shoulder's point, lapped downward; his rune burning in the middle one
  for (const k of [-1, 1]) {
    const d0 = norm([0.42, k * 0.8, 0.42], [0, k, 0]);
    const e1 = norm(cross([0, 0, 1], d0), [1, 0, 0]);
    const e2 = cross(d0, e1);
    shell(k === 1 ? 'boarPauldronL' : 'boarPauldronR', 'pauldron', [9, 0, 27], [10.5 * 1.05, 10.2 * 1.06, 11.2 * 1.04], (u) => {
      const ca = dot3(u, d0);
      const lim = 0.62;
      if (ca < lim) return null;
      const inn = (ca - lim) / (1 - lim);
      // (its lames: lapped down its height)
      const h = dot3(u, e2) * k;
      const lame = h > 0.22 ? 0 : h > -0.14 ? 1 : 2;
      const lip = lame === 0 ? h - 0.22 : lame === 1 ? h + 0.14 : 1;
      const a = dot3(u, e1) * k;
      const rune = lame === 1 && Math.abs(a) < 0.24 && glyph(RUNE_GRID[k > 0 ? 0 : 1], a * 1.9, (0.2 - h) / 0.42);
      return { lame, inn: lip >= 0 && lip < 0.05 ? 0 : inn, rune };
    }, k !== near);
  }
  // THE PLATE OVER ITS HINDQUARTERS: lapped from its back down over its rump, his rune on it
  shell('boarCrupper', 'crupper', [-15, 0, 24], [8.2 * 1.06, 8.4 * 1.06, 8.4 * 1.05], (u) => {
    const d0 = norm([-0.55, 0, 0.83], [0, 0, 1]);
    const ca = dot3(u, d0);
    const lim = 0.5;
    if (ca < lim || u[0] > 0.35) return null;
    const inn = Math.min((ca - lim) / (1 - lim), (0.35 - u[0]) * 3);
    const lame = u[0] > -0.15 ? 0 : 1;
    const rune = Math.abs(u[1]) < 0.2 && u[0] < -0.25 && glyph(RUNE_GRID[0], -u[1] * 2.2, (u[2] - 0.15) / -0.05 * 0 + (0.95 - u[2]) / 0.55);
    return { lame, inn: Math.abs(u[0] + 0.15) < 0.04 ? 0 : inn, rune };
  }, false);
  // THE FACE PLATE: one plate down its brow and the ridge of its snout, narrowing, a keel down its middle, his runes cut either side
  const slope = norm(add(H.f, mul(H.u, -0.62)), H.f);
  const nrm = norm(cross(H.l, slope), H.u);
  const face: [number, number, number, number][] = [[5.4, 4.4, 4.0, 4.8], [10.4, 1.2, 3.8, 4.1], [15.2, -1.9, 3.2, 3.2]];
  face.forEach(([fw, up, rx, ry], j) => {
    put('boarFace', 'chamfron', {
      k: 'ball', c: H.at(fw, 0, up), ax: [mul(slope, rx * S), mul(H.l, ry * S), mul(nrm, 0.85 * S)],
      skin: (u, tone) => {
        if (Math.abs(u[1]) > 0.86) return ARMOUR[T5(tone - 2)];
        if (Math.abs(u[1]) < 0.12) return ARMOUR[T5(tone + 1)];
        if (j < 2 && Math.abs(u[1]) > 0.2 && Math.abs(u[1]) < 0.62 && glyph(RUNE_GRID[(j + (u[1] > 0 ? 0 : 1)) % 2], (Math.abs(u[1]) - 0.41) * 2.4, (0.7 - u[0]) / 1.4)) return lit;
        return ARMOUR[T5(tone)];
      },
    });
  });
  // (a spike out of its brow, forward and up: a horn of iron)
  const brow = H.at(3.6, 0, 6.2);
  const hornTo = add(brow, mul(norm(add(H.f, mul(H.u, 1.3)), H.u), 7.0 * S));
  put('boarHorn', 'browSpike', { k: 'rod', a: brow, b: hornTo, ra: 1.9 * S, rb: 0.15 * S, ramp: ARMOUR });
  // ITS SHANKS IN IRON, SPIKED; ITS HOOVES SHOD IN IT
  const fw = turned(P, [1, 0, 0]);
  for (let i = 0; i < 4; i++) {
    const { knee, fet, end } = legOf(P, i);
    const far = (i % 2 === 0 ? 1 : -1) !== near;
    const hind = i >= 2;
    const part = `boarGreave${i}`;
    put(part, 'greave', { k: 'rod', a: lerp3(knee, fet, 0.08), b: fet, ra: 2.6 * S, rb: 2.15 * S, ramp: ARMOUR, far });
    put(part, 'shoe', { k: 'rod', a: lerp3(fet, end, 0.15), b: end, ra: 2.05 * S, rb: 2.0 * S, ramp: ARMOUR, far });
    // (spikes, each its own piece of iron so its edge shows: one out of its knee, forward on a foreleg, back on a hind; one out of
    // each side of its shank; one out of the toe of its shoe, along the floor)
    const sh = norm(sub(fet, knee), [0, 0, -1]);
    const sd2 = turned(P, [0, 1, 0]);
    const outw = mul(sd2, i % 2 === 0 ? 1 : -1);
    const spike = (a: V3, way: V3, long: number, r: number): void =>
      put(`boarSpikes${i}`, 'spikes', { k: 'rod', a, b: add(a, mul(way, long * S)), ra: r * S, rb: 0.15 * S, ramp: ARMOUR, far });
    const kway = norm(add(mul(fw, hind ? -1 : 1), mul(sh, -0.7)), fw);
    spike(add(lerp3(knee, fet, 0.08), mul(kway, 1.8 * S)), kway, 4.6, 1.3);
    for (const sgn of [-1, 1]) {
      const w2 = norm(add(mul(sd2, sgn), mul(sh, -0.2)), sd2);
      spike(add(lerp3(knee, fet, 0.5), mul(w2, 1.9 * S)), w2, 3.4, 1.1);
    }
    const toe = norm(add(fw, [0, 0, 0.18]), fw);
    spike(add(add(end, mul(fw, 1.4 * S)), [0, 0, 0.3 * S]), toe, 3.6, 1.15);
    // (his rune cut in the greave's outer face, burning)
    put(part, 'greave', { k: 'dot', p: add(lerp3(knee, fet, 0.3), mul(outw, 2.55 * S)), c: lit, facing: outw });
  }
  // ITS EYES: his power pouring out of them, pink, throbbing: a light on each eye that can be seen, and the burn of it streaming
  // back off its eye over its head like a flame in a wind, longer and brighter at each throb
  for (const k of [-1, 1]) {
    const eye = H.at(8.8, k * 5.0, -1.0);
    const facing = norm(add(mul(H.l, k), mul(H.f, 0.4)), H.f);
    if (st && dot3(facing, st.eye) < -0.05) continue;
    put('glow', 'eyeGlow', { k: 'glow', p: eye, c: BURN[2], r: 5 + 6 * pulse, a: 0.4 + 0.45 * pulse });
    const n = 6 + Math.round(8 * pulse);
    const fr = Math.floor(P.sway * WS_STAND_LONG * 15);
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n;
      const flick = hash(i, fr, 8861 + k);
      const p = add(eye, add(mul(H.f, -(0.8 + 9 * f * (0.45 + 0.75 * pulse)) * S), add(mul(H.u, (0.6 * f + 2.6 * f * f + (flick - 0.5) * 1.2 * f) * S), mul(H.l, k * (0.6 + 0.6 * f) * S))));
      if (f > 0.35 && flick < 0.35) continue;
      put('wisps', 'eyeWisps', { k: 'mote', p, c: f < 0.2 ? burnAt(pulse, 1.2) : f < 0.55 ? BURN[2] : BURN[1], size: f < 0.2 ? 2 : 1 });
    }
    put('wisps', 'eyeWisps', { k: 'mote', p: eye, c: burnAt(pulse, 1.6), size: 2 });
  }
  // (and a little light off the runes in its plates, at each throb)
  if (pulse > 0.15) {
    put('glow', 'runeGlow', { k: 'glow', p: W([13.5, near * 10.6, 27]), c: BURN[2], r: 6 + 5 * pulse, a: 0.12 + 0.25 * pulse });
    put('glow', 'runeGlow', { k: 'glow', p: W([-19, 0, 31]), c: BURN[2], r: 5 + 4 * pulse, a: 0.1 + 0.2 * pulse });
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
  // (his feet in the stirrups, out past the boar's flanks at their widest, so his legs go down its sides, not into it)
  const fl = foot(-0.5, 13.4 * S, 12.0 * S);
  const frt = foot(-0.5, -13.4 * S, 12.0 * S);
  const a = (t / WS_STAND_LONG) * TAU;
  return {
    px: at[0] + 0.9 * Math.sin(a + 0.9), py: at[1] + 0.4 * Math.sin(a + 0.9), pz: at[2] - PELVIS0 + 1.0 * Math.sin(a * 2),
    yaw: P.yaw, pitch: -2, roll: 0, twist: 6 + 2 * Math.sin(a + 0.5), bend: -2, side: 0, hunch: 5,
    faceTurn: 4 * Math.sin(a * 0.5), faceUp: 6, faceTilt: 2,
    lfx: fl[0], lfy: fl[1] - B.stance, lfz: fl[2] - B.ankle, lfp: 10, lft: 8, lk: 72, lkUp: 8,
    rfx: frt[0], rfy: frt[1] + B.stance, rfz: frt[2] - B.ankle, rfp: 10, rft: -8, rk: -72, rkUp: 8,
    // (his left hand out before him, fingers clawed, writing on the air; his right hand high, the staff in it)
    lhIn: 1, lhx: 10 + 1.4 * Math.sin(a * 2), lhy: 4.0 + 1.0 * Math.cos(a * 2), lhz: -2 + 1.2 * Math.sin(a * 2 + 0.6), le: -6,
    rhIn: 1, rhx: 1.2, rhy: -11.5, rhz: 7 + 0.6 * Math.sin(a), re: 14,
    out: 0,
  } as Partial<Bones>;
}

/** His staff: from below his hand to well over his head, taller than he is; the iron ring at its head and his great rune in it. */
function staffOf(s: Skeleton): { foot: V3; head: V3; ring: V3; up: V3; side: V3 } {
  const up = norm([0.08, -0.12, 1]);
  // (through his fist: a little in from his knuckles, toward his body, so that his fingers close round it)
  const grip = add(s.handR, add(mul(s.chest[0], -0.4), mul(s.chest[1], 0.2)));
  const foot = add(grip, mul(up, -26));
  const head = add(grip, mul(up, 48));
  const side = norm(cross(up, [0, 1, 0]), [1, 0, 0]);
  return { foot, head, ring: add(head, mul(up, 6.2)), up, side };
}

/** His skin: ashen, cut with runes that burn (a scatter of short cuts on the ball, burning pink). */
function ashSkin(seed: number, cuts = 0.08): Skin {
  return (u, tone) => {
    const a = Math.floor((Math.atan2(u[1], u[0]) + 4) * 5);
    const b = Math.floor((u[2] + 1) * 6);
    // (runes cut in his skin: on his face and cheeks, not his crown, so that from behind none reads as a face)
    if (u[0] > 0.2 && u[2] < 0.45 && hash(a, b, seed) < cuts && tone >= 1) return tone >= 3 ? BURN[3] : BURN[2];
    return ASH[T5(tone)];
  };
}

/** HIS HEAD, made as the King's is (art/king.ts head: one head, its face painted on it by where on it each pixel is), his own:
 * gaunt and ashen, the skull close under the skin; his eyes sunk in dark hollows, burning pink; heavy white brows; his cheeks
 * hollow; a long thin nose; his mouth a hard line; runes cut in his brow and cheeks, burning; long white hair down his back;
 * the iron band on his brow, its stone cracked and burning; his beard to his belt. */
function head(put: Put, st: Stage, s: Skeleton, t: number): void {
  const [ff, fl, fu] = wornOn(st, s, 14);
  const hr: V3 = [B.headR[0] * 0.94, B.headR[1] * 0.9, B.headR[2] * 1.02];
  const hc = add(s.head, mul(fu, -0.2));
  const cut = (u: V3): boolean => {
    // (his runes: short cuts on his brow and cheeks, burning)
    const a = Math.floor((u[1] + 1) * 7);
    const b = Math.floor((u[2] + 1) * 7);
    return u[0] > 0.55 && Math.abs(u[1]) > 0.18 && hash(a, b, 8831) < 0.1;
  };
  const skin: Skin = (u, tone) => {
    const fwd = u[0];
    const side = Math.abs(u[1]);
    // his hair, white, over the top of his head and down the back, thin at the temples
    // (combed back in strands: a stroke of the tone below now and then, running back over his skull and down)
    const strand = hash(Math.floor((Math.atan2(u[1], -u[0]) + 4) * 9), 0, 8834) < 0.32 ? 1 : 0;
    if (fwd < -0.2 || u[2] > 0.66) return HAIR[Math.max(1, tone - strand)];
    if (side > 0.86 && u[2] > -0.25) return HAIR[Math.max(1, tone - 1 - strand)];
    // his beard round his jaw and chin
    if (u[2] < -0.5 + 0.35 * Math.max(0, side - 0.5) && fwd > -0.2) return HAIR[Math.min(4, tone + 1)];
    // his eyes, sunk deep: dark hollows (the burning in them is laid on after)
    if (fwd > 0.42 && side > 0.12 && side < 0.58 && u[2] > -0.14 && u[2] < 0.15) return u[2] > 0.07 ? ASH[1] : ASH[0];
    // his brows, white, heavy, drawn down hard at the middle
    if (fwd > 0.38 && side < 0.62 && u[2] >= 0.15 && u[2] < 0.3 - 0.14 * side) return HAIR[Math.min(4, tone + 1)];
    // the hollows of his cheeks, deep under the cheekbones
    if (fwd > 0.32 && side > 0.38 && u[2] < -0.14 && u[2] > -0.46) return ASH[Math.max(0, tone - 2)];
    // his long thin nose, lit down its ridge
    if (fwd > 0.86 && side < 0.11 && u[2] > -0.32 && u[2] < 0.14) return ASH[Math.min(4, tone + 1)];
    if (cut(u) && tone >= 1) return tone >= 3 ? BURN[3] : BURN[2];
    return ASH[Math.max(1, tone)];
  };
  put('head', 'head', { k: 'ball', c: hc, ax: [mul(ff, hr[0]), mul(fl, hr[1]), mul(fu, hr[2])], skin });
  // HIS EYES: burning pink, deep in their hollows
  for (const k of [-1, 1]) {
    const e = add(hc, add(mul(ff, hr[0] * 0.86), add(mul(fl, k * hr[1] * 0.34), mul(fu, -hr[2] * 0.02))));
    put('head', 'eyes', { k: 'dot', p: e, c: BURN[3], facing: ff, c2: BURN[2] });
  }
  put('head', 'nose', { k: 'rod', a: add(hc, add(mul(ff, hr[0] * 0.9), mul(fu, hr[2] * 0.08))), b: add(hc, add(mul(ff, hr[0] * 1.08), mul(fu, -hr[2] * 0.28))), ra: 0.85, rb: 0.95, ramp: ASH });
  // (his moustache, thin, drooping into the beard)
  for (const k of [-1, 1]) {
    const a = add(hc, add(mul(ff, hr[0] * 1.0), add(mul(fl, k * hr[1] * 0.1), mul(fu, -hr[2] * 0.38))));
    const b = add(hc, add(mul(ff, hr[0] * 0.94), add(mul(fl, k * hr[1] * 0.46), mul(fu, -hr[2] * 0.62))));
    const c = add(b, add(mul(ff, 0.5), add(mul(fl, k * 0.6), mul(fu, -3.4))));
    put('head', 'beard', { k: 'rod', a, b, ra: 0.8, rb: 0.75, ramp: HAIR });
    put('head', 'beard', { k: 'rod', a: b, b: c, ra: 0.75, rb: 0.35, ramp: HAIR });
  }
  // THE IRON BAND on his brow, round over his hair, and its stone set in it at the front, cracked through and burning
  put('head', 'band', { k: 'band', ring: { c: add(hc, mul(fu, hr[2] * 0.42)), u: mul(ff, hr[0] * 1.02), v: mul(fl, hr[1] * 1.04) }, ramp: IRON, rows: 1 });
  put('head', 'stone', { k: 'ball', c: add(hc, add(mul(ff, hr[0] * 0.98), mul(fu, hr[2] * 0.44))), ax: [mul(ff, 0.5), mul(fl, 0.95), mul(fu, 0.95)], skin: (u) => (Math.abs(u[1] - u[2] * 0.4) < 0.24 ? BURN[3] : SLATE[2]) });
  // HIS BEARD: long and thin, white, from his jaw down over his robe to a point at his belt, its locks wavering and drawn
  // together, the dark between them; lying on his chest and swaying
  const [cf, cl] = s.chest;
  const sway = Math.sin((t / WS_STAND_LONG) * TAU * 2) * 0.5;
  const jaw = add(hc, add(mul(ff, hr[0] * 0.5), mul(fu, -hr[2] * 0.78)));
  const onChest = (k: number): V3 => add(lerp3(lerp3(s.neck, s.ribs, 0.35), lerp3(s.ribs, s.pelvis, 0.7), k), mul(cf, B.ribDeep + 1.6 - 0.6 * k));
  const mid = add(onChest(0.25), mul(cl, sway * 0.6));
  const low = add(onChest(0.8), mul(cl, sway * 1.3));
  const tip = add(onChest(1.02), add(mul(cl, sway * 1.7), mul(cf, 0.4)));
  for (let j = -2; j <= 2; j++) {
    const own = hash(j + 9, 4, 8832);
    const top = add(jaw, add(mul(fl, j * hr[1] * 0.2), add(mul(fu, Math.abs(j) * 0.9), mul(ff, -Math.abs(j) * 0.6))));
    const m1 = add(mid, add(mul(cl, j * 0.95), mul(cf, 0.4 - 0.2 * Math.abs(j))));
    const m2 = add(lerp3(mid, low, 0.6), add(mul(cl, j * 0.6 + Math.sin(t * 2 + j) * 0.3), mul(cf, 0.3 - 0.15 * Math.abs(j))));
    const end = add(lerp3(low, tip, 0.35 + 0.45 * own - 0.15 * Math.abs(j)), mul(cl, j * 0.3));
    const r = 1.25 - 0.18 * Math.abs(j);
    const ramp = j % 2 ? [HAIR[0], HAIR[0], HAIR[1], HAIR[2], HAIR[3]] as Ramp : HAIR;
    put('beard', 'beard', { k: 'rod', a: top, b: m1, ra: r * 0.9, rb: r, ramp });
    put('beard', 'beard', { k: 'rod', a: m1, b: m2, ra: r, rb: r * 0.8, ramp });
    put('beard', 'beard', { k: 'rod', a: m2, b: end, ra: r * 0.8, rb: 0.35, ramp });
  }
  // HIS HAIR, long, white and lank, down his back from under the band
  const crownC = add(hc, mul(fu, hr[2] * 0.5));
  // (each lock its own length, the shorter ones over the longer, tapering to its end, the darker ones between: a fall of hair
  // with a ragged end, not a block)
  for (let j = -3; j <= 3; j++) {
    const own = hash(j + 20, 5, 8833);
    const long = 4.2 + 2.0 * own - 0.5 * Math.abs(j);
    const at0 = add(hc, add(mul(ff, -hr[0] * 0.72), add(mul(fl, j * hr[1] * 0.28), mul(fu, -hr[2] * 0.15))));
    const pts: V3[] = [add(crownC, add(mul(fl, j * hr[1] * 0.25), mul(ff, -hr[0] * 0.3))), at0];
    for (let i = 1; i <= 3; i++) {
      const k = i / 3;
      pts.push(add(at0, add([0, 0, -long * i], add(mul(ff, -5.2 * k), mul(fl, j * 0.7 * k + Math.sin(t * 2 + j + k * 2) * 0.35 * k)))));
    }
    const ramp = j % 2 ? ([HAIR[0], HAIR[0], HAIR[1], HAIR[2], HAIR[3]] as Ramp) : HAIR;
    for (let i = 1; i < pts.length; i++) put('head', 'hair', { k: 'rod', a: pts[i - 1], b: pts[i], ra: 1.2 - 0.25 * (i - 1), rb: Math.max(0.25, 1.2 - 0.25 * i - (i === pts.length - 1 ? 0.5 : 0)), ramp });
  }
}

/** A HAND, as big as the game draws hands, so that it reads (the Brawler's fists the measure: about half his head across; as heads,
 * hands are drawn bigger than life): its back and palm, four fingers in two joints each, a thumb on its own side (a right hand the
 * mirror of a left). `grip` curls the fingers (1: a fist closed round a staff), `spread` fans them (an open claw writing on the air).
 * Long, bony and ashen; its knuckles standing out. */
const HAND = 1.75;
function hand(put: Put, side: 'L' | 'R', at: V3, fore: V3, cu: V3, grip: number, spread: number): void {
  const e1 = norm(sub(cu, mul(fore, fore[0] * cu[0] + fore[1] * cu[1] + fore[2] * cu[2])), [0, 0, 1]);
  const e2 = norm(cross(fore, e1), [0, 1, 0]);
  const part = `hand${side}`;
  const k = HAND;
  // (the palm and the back of the hand: a closed fist is a solid block of it, an open hand flatter)
  put(part, part, { k: 'ball', c: add(at, mul(fore, 0.7 * k)), ax: [mul(fore, (1.25 - 0.15 * grip) * k), mul(e2, 1.05 * k), mul(e1, (0.55 + 0.35 * grip) * k)], skin: ASH, far: true });
  for (let i = 0; i < 4; i++) {
    const fan = (i - 1.5) * (0.42 + 0.38 * spread);
    const base = add(at, add(mul(fore, 1.45 * k), mul(e2, fan * 0.62 * k)));
    // (the knuckle: a bump on the back of the hand)
    put(part, `knuckle${side}`, { k: 'ball', c: add(base, mul(e1, 0.25 * k)), ax: [mul(fore, 0.38 * k), mul(e2, 0.36 * k), mul(e1, 0.34 * k)], skin: ASH, far: true });
    const mid = add(base, add(mul(fore, 1.1 * k * (1 - 0.55 * grip)), add(mul(e1, (-0.3 - 0.75 * grip) * k), mul(e2, fan * 0.4 * spread * k))));
    const tip = add(mid, add(mul(fore, 0.85 * k * (1 - 0.9 * grip)), add(mul(e1, (-0.45 - 0.55 * grip) * k), mul(e2, fan * 0.3 * spread * k))));
    put(part, `finger${side}`, { k: 'rod', a: base, b: mid, ra: 0.34 * k, rb: 0.3 * k, ramp: ASH, far: true });
    put(part, `finger${side}`, { k: 'rod', a: mid, b: tip, ra: 0.3 * k, rb: 0.2 * k, ramp: ASH, far: true });
  }
  // (the thumb, on its own side: for a right hand the mirror of a left; round the staff in a fist, out and up in a claw)
  const sideK = side === 'L' ? 1 : -1;
  const tb = add(at, add(mul(fore, 0.55 * k), add(mul(e2, sideK * 0.85 * k), mul(e1, -0.2 * k))));
  const tm = add(tb, add(mul(fore, 0.7 * k), add(mul(e2, sideK * (0.45 - 0.55 * grip) * k), mul(e1, (-0.35 - 0.4 * grip) * k))));
  const tt = add(tm, add(mul(fore, 0.55 * k * (1 - 0.5 * grip)), add(mul(e2, sideK * (0.2 - 0.5 * grip) * k), mul(e1, -0.25 * k))));
  put(part, `finger${side}`, { k: 'rod', a: tb, b: tm, ra: 0.36 * k, rb: 0.32 * k, ramp: ASH, far: true });
  put(part, `finger${side}`, { k: 'rod', a: tm, b: tt, ra: 0.32 * k, rb: 0.22 * k, ramp: ASH, far: true });
}

/** AN ARM: his order's sleeve, wide and ragged, to the forearm; the forearm bare below it, thin, ashen, cut with burning runes; the hand. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, grip: number, spread: number): void {
  const L = side === 'L';
  const sh = L ? s.shoulderL : s.shoulderR;
  const el = L ? s.elbowL : s.elbowR;
  const ha = L ? s.handL : s.handR;
  const [r0, r1, r2] = B.armR;
  const fore = norm(sub(ha, el), [0, 0, -1]);
  const wrist = add(ha, mul(fore, -0.9));
  put(`arm${side}`, `arm${side}`, { k: 'ball', c: sh, ax: [[r0 * 1.5, 0, 0], [0, r0 * 1.5, 0], [0, 0, r0 * 1.5]], skin: RAGS, far: true });
  put(`arm${side}`, `arm${side}`, { k: 'rod', a: sh, b: el, ra: r0 * 1.4, rb: r1 * 1.5, ramp: RAGS, far: true });
  const cuff = lerp3(el, wrist, 0.42);
  put(`fore${side}`, `fore${side}`, { k: 'rod', a: lerp3(el, wrist, 0.3), b: wrist, ra: r1 * 0.95, rb: r2 * 0.95, ramp: ASH, far: true });
  // (the sleeve: wide at its end, its edge ragged, falling away from the forearm)
  put(`fore${side}`, `sleeve${side}`, { k: 'rod', a: el, b: cuff, ra: r1 * 1.5, rb: r1 * 2.0, ramp: RAGS, far: true });
  const hang = add(cuff, [0, 0, -4.5]);
  put(`fore${side}`, `sleeve${side}`, { k: 'rod', a: cuff, b: hang, ra: r1 * 1.9, rb: 0.5, ramp: RAGS, far: true });
  // (runes cut down the forearm, burning)
  for (const f of [0.35, 0.65, 0.9]) put(`fore${side}`, `fore${side}`, { k: 'dot', p: lerp3(cuff, wrist, f), c: BURN[2], facing: norm(cross(fore, [0, 0, 1]), [0, 1, 0]) });
  hand(put, side, ha, fore, cu, grip, spread);
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
  // HIS LEGS, astride, plain to see: the robe split to ride and falling either side over his thighs; dark breeches; tall
  // riding boots of old leather to the knee, an iron buckle at the top, his feet in the stirrups
  for (const side of ['L', 'R'] as const) {
    const L = side === 'L';
    const hip = L ? s.hipL : s.hipR;
    const knee = L ? s.kneeL : s.kneeR;
    const ankle = L ? s.ankleL : s.ankleR;
    const heel = L ? s.heelL : s.heelR;
    const toe = L ? s.toeL : s.toeR;
    put(`leg${side}`, `leg${side}`, { k: 'rod', a: hip, b: knee, ra: 2.5, rb: 2.0, ramp: BREECH });
    put(`leg${side}`, `knee${side}`, { k: 'ball', c: knee, ax: [[2.0, 0, 0], [0, 2.0, 0], [0, 0, 2.0]], skin: BOOT });
    put(`shin${side}`, `boot${side}`, { k: 'rod', a: lerp3(knee, ankle, 0.08), b: ankle, ra: 2.0, rb: 1.6, ramp: BOOT });
    put(`shin${side}`, `boot${side}`, { k: 'band', ring: { c: lerp3(knee, ankle, 0.18), u: [1.9, 0, 0], v: [0, 1.9, 0] }, ramp: IRON, rows: 1 });
    put(`shin${side}`, `foot${side}`, { k: 'rod', a: add(heel, [0, 0, 1.0]), b: add(toe, [0, 0, 0.9]), ra: 1.5, rb: 1.2, ramp: BOOT });
    // (the robe's skirt over the thigh, falling to the knee on its outside, ragged)
    const out = norm(sub(hip, s.pelvis), [0, L ? 1 : -1, 0]);
    const skirtTop = add(hip, mul(out, 1.2));
    const skirtEnd = add(lerp3(hip, knee, 0.85), add(mul(out, 2.2), [0, 0, -3.5]));
    put(`skirt${side}`, `skirt${side}`, { k: 'rod', a: skirtTop, b: skirtEnd, ra: 3.0, rb: 1.6, ramp: RAGS });
  }
  // THE CLOAK: from his shoulders, down his back and over the boar's flanks, in strips; its collar high and stiff
  const back = mul(s.upper[0], -1);
  for (let i = 0; i < 7; i++) {
    const a = (-48 + i * 16) * D;
    const top = add(neckC, add(mul(back, Math.cos(a) * (B.ribDeep + 0.6)), add(mul(cl, Math.sin(a) * (B.shoulderHalf + 0.6)), mul(cu, -1.6))));
    const out = add(mul(back, Math.cos(a) * 0.9), mul(cl, Math.sin(a) * 1.3));
    const long = 20 + 6 * hash(i, 9, 8821);
    const sw = Math.sin(TAU * sway + i * 0.7) * 1.2;
    const mid = add(top, add(mul(out, 5), [sw * 0.4, 0, -long * 0.5]));
    const end = add(mid, add(mul(out, 4), [sw, 0, -long * 0.5]));
    put('cloak', 'cloak', { k: 'rod', a: top, b: mid, ra: 3.0, rb: 2.6, ramp: RAGS });
    put('cloak', 'cloak', { k: 'rod', a: mid, b: end, ra: 2.6, rb: 0.9, ramp: RAGS });
  }
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
function runesAbout(put: Put, st: Stage, s: Skeleton, t: number): void {
  // (the strokes his fingers leave, burning, thinning as they go: laid over everything, so only where his hand is not behind him)
  const seenHand = st.near(s.handL) > st.near(s.ribs) - 1;
  for (let i = 0; i < (seenHand ? 9 : 0); i++) {
    const age = ((t * 2 + i / 9) % 1);
    const a = (i / 9) * TAU * 1.3 + t * 4;
    const p = add(s.handL, [6.5 + Math.cos(a) * 2.2, Math.sin(a) * 2.2, 2.5 + age * 6]);
    if (age > 0.8) continue;
    put('air', 'runes', { k: 'mote', p, c: age < 0.25 ? BURN[4] : age < 0.55 ? BURN[3] : BURN[2], size: 1 });
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

/** ITS STAND, ALIVE (his words, 12 Nov: “Doesn’t breathe?  Doesnt snort?  Doesn’t shake its head like a dog?  Doesn’t stamp its
 * feet?”; his rulebook, Movement 6, “Alive when still”, and Animations 1, as far as it will go): over WS_STAND_LONG seconds it
 * breathes deep (three breaths, its barrel swelling, its back rising), SNORTS twice (its head thrown up, a blast of breath from its
 * snout), SHAKES ITS HEAD like a dog (its head rolling and swinging hard, its ears and jowls flung), and STAMPS each forefoot in turn
 * (lifted high, slammed down where it was, its body jolted, dust kicked up). Each moment eased in and out, so nothing leaps. */
export const BOAR_STAND_AT = {
  breaths: 3,
  snorts: [0.55, 3.25],
  snortLong: 0.55,
  shake: [1.75, 2.75] as const,
  stamps: [[0, 1.05], [1, 3.85]] as const,
  stampLong: 0.62,
};
const bumpOf = (t: number, a: number, b: number): number => (t <= a || t >= b ? 0 : Math.sin((Math.PI * (t - a)) / (b - a)) ** 2);
const smooth01 = (v: number): number => { const c = clamp01(v); return c * c * (3 - 2 * c); };
/** How far a stamp is at `u` seconds into it: the foot lifted high (slowly), held, then slammed down (fast, eased into the floor). */
function stampLift(u: number): number {
  const L = BOAR_STAND_AT.stampLong;
  if (u <= 0 || u >= L) return 0;
  const up = 0.34;
  const hold = 0.44;
  if (u < up) return smooth01(u / up);
  if (u < hold) return 1;
  // (down: accelerating into the floor over four frames)
  const k = (u - hold) / (L - hold);
  return 1 - k * k;
}
/** A throb of his power in it: struck in a frame, dying away over the next second (four to its round). */
function throbAt(tt: number): number {
  const u = (((tt + 0.3) % 1.2) + 1.2) % 1.2;
  return u < 0.07 ? u / 0.07 : Math.exp(-(u - 0.07) * 4.2);
}
export function boarPoseAt(move: string, t: number): BoarPose {
  void move;
  const T = WS_STAND_LONG;
  const tt = ((t % T) + T) % T;
  const A = BOAR_STAND_AT;
  // (its breath: deep, three to the round)
  const br = 0.5 - 0.5 * Math.cos((tt / T) * TAU * A.breaths);
  // (a snort: its head thrown up fast and let down slower)
  let snort = 0;
  for (const s0 of A.snorts) {
    const u = tt - s0;
    if (u > 0 && u < A.snortLong) snort = Math.max(snort, u < 0.15 ? smooth01(u / 0.15) : 1 - smooth01((u - 0.15) / (A.snortLong - 0.15)));
  }
  // (its head shaken like a dog's: three swings, hard, eased in and out)
  const [h0, h1] = A.shake;
  const env = bumpOf(tt, h0, h1);
  const ph = ((tt - h0) / (h1 - h0)) * TAU * 2.5;
  const shake = env * Math.sin(ph);
  const flap = -env * Math.cos(ph);
  // (its stamps)
  const lift = [0, 0];
  let jolt = 0;
  for (const [leg, s0] of A.stamps) {
    const u = tt - s0;
    lift[leg] = Math.max(lift[leg], stampLift(u));
    // (the slam: its body jolted down and over as the foot strikes, and settling)
    const after = u - A.stampLong;
    if (after > -0.06 && after < 0.36) jolt = Math.max(jolt, bumpOf(after, -0.06, 0.36));
  }
  return {
    ...BOAR_STAND,
    z: 0.9 * br - 0.9 * jolt,
    pitch: 1.2 * br - 1.2 * snort + 1.5 * jolt,
    roll: 2.0 * shake * 0.6 + (lift[0] - lift[1]) * 1.6,
    // (its head thrown up as it lifts a foot to stamp, and brought down hard with it)
    low: BOAR_STAND.low - 2 * br - 14 * snort - 13 * Math.max(lift[0], lift[1]) + 5 * jolt,
    look: 3 * Math.sin((tt / T) * TAU) + 11 * shake,
    tilt: 22 * shake,
    flap,
    legs: BOAR_STAND.legs,
    lift: [lift[0], lift[1], 0, 0],
    breath: br,
    sway: tt / T + 0.25 * shake,
    // (his power in it: a throb every 1.2 s, struck fast and dying slow; at its height through each snort and each stamp)
    pulse: Math.max(throbAt(tt), snort, 0.8 * Math.max(lift[0], lift[1])),
  };
}
/** WHAT FLIES OFF IT, laid after its edge: a blast of breath out of its snout at each snort, cold, white, spreading and thinning;
 * dust kicked up round a stamped hoof. Never a glow. */
const BREATH: readonly string[] = ['#e6e4ea', '#c9c6d0', '#a8a4b0', '#878392'];
const DUST: readonly string[] = ['#c4b8b4', '#9e9294', '#786c74'];
export function boarGrains(t: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const T = WS_STAND_LONG;
  const tt = ((t % T) + T) % T;
  for (const s0 of BOAR_STAND_AT.snorts) {
    const u = tt - s0 - 0.08;
    if (u <= 0 || u > 0.75) continue;
    const P = boarPoseAt('stand', s0 + 0.1);
    const H = headOf(P);
    // (a puff out of each nostril: blown forward and a little down, slowing, swelling and thinning as it goes, rising as it cools)
    const fh = norm([H.f[0], H.f[1], 0], [1, 0, 0]);
    const blow = norm(add(fh, [0, 0, -0.25]), fh);
    const age = u / 0.75;
    for (const k of [-1, 1]) {
      const nose = H.at(22.6, k * 1.2, -8.2);
      const mid = add(add(add(nose, mul(blow, 11 * S * (1 - Math.exp(-u * 5)))), mul(H.l, k * 2.2 * u * S)), [0, 0, 5 * u * u]);
      const r = (1.2 + 6 * Math.sqrt(u)) * S;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU + 2.4 * hash(i, k + 3, 8841);
        const rr = r * Math.sqrt(0.15 + 0.85 * hash(i, k + 4, 8842));
        const p: V3 = add(mid, [Math.cos(a) * rr, Math.sin(a) * rr * 0.9, Math.sin(a * 2 + 1) * rr * 0.35]);
        // (it thins from its edge in: the outer grains go first)
        if (hash(i, Math.floor(u * 20), 8844) < age * (0.45 + 0.6 * (rr / r))) continue;
        out.push([p, BREATH[Math.min(3, Math.floor(age * 3 + (rr / r) * 1.2))], age < 0.55 && rr < r * 0.7 ? 2 : 1]);
      }
    }
  }
  for (const [leg, s0] of BOAR_STAND_AT.stamps) {
    const u = tt - s0 - BOAR_STAND_AT.stampLong;
    if (u <= 0 || u > 0.5) continue;
    const sole = boarSoles(boarPoseAt('stand', s0 + BOAR_STAND_AT.stampLong + 0.02))[leg];
    // (a ring of grit thrown out low round the hoof as it strikes, flying out, falling back and thinning)
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU + hash(i, leg, 8845);
      const d = (3 + 14 * u) * (0.55 + 0.6 * hash(i, 9, 8846)) * S;
      const p: V3 = [sole[0] + Math.cos(a) * d, sole[1] + Math.sin(a) * d * 0.8, 0.5 + (16 * u - 30 * u * u) * (0.6 + 0.8 * hash(i, 11, 8847))];
      if (p[2] < 0.2 || hash(i, Math.floor(u * 30), 8848) < u * 1.5) continue;
      out.push([p, DUST[Math.min(2, Math.floor(u * 6))], 1]);
    }
  }
  return out;
}

function wsBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const { s } = m;
  const P = boarPoseAt(m.move ?? 'stand', m.t);
  const near = st.near(add(s.pelvis, [0, -3, 0])) > st.near(add(s.pelvis, [0, 3, 0])) ? -1 : 1;
  boarBits(P, put, near, st);
  robe(put, s, P.sway);
  // (his left hand clawed, fingers spread, writing on the air; his right closed round the staff)
  arm(put, s, 'L', s.chest[2], 0.32, 1.25);
  arm(put, s, 'R', s.chest[2], 1, 0);
  // (his neck: thin, the cords of it standing out)
  put('neck', 'neck', { k: 'rod', a: lerp3(s.ribs, s.neck, 0.5), b: lerp3(s.neck, s.head, 0.5), ra: 1.6, rb: 1.3, ramp: ASH });
  head(put, st, s, m.t);
  staff(put, s, m.t);
  runesAbout(put, st, s, m.t);
  return bits;
}

/** HIS STAND IN THE SADDLE: 3.2 s round. */
export const WS_STAND_LONG = 4.8;
function standMotion(): Motion {
  const keys: Key3[] = [];
  const N = Math.round(WS_STAND_LONG * 30);
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
    // (at the beasts' 15 frames a second, as the stag, the hounds and the wolves stand: its shake and stamps need them)
    idleFrames: 72,
    idleFps: 15,
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
    grains: (_st: Stage, m: Moment) => boarGrains(m.t),
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
/** THE BOAR'S BODY AS THE REVIEW SEES IT: its barrel, its shoulders and hump, its chest, its haunch and its belly, each as it is painted (its middle, and its three half-lengths as directions). His legs must go down its sides, never into it. */
export function boarLumps(P: BoarPose): { name: string; c: V3; ax: [V3, V3, V3] }[] {
  const ax = (a: V3, b: V3, c: V3): [V3, V3, V3] => [turned(P, mul(a, S)), turned(P, mul(b, S)), turned(P, mul(c, S))];
  return [
    { name: 'barrel', c: boarAt(P, [-2, 0, 24]), ax: ax([17, 0, 0], [0, 9.6, 0], [0, 0, 9.4]) },
    { name: 'shoulders', c: boarAt(P, [9, 0, 27]), ax: ax([10.5, 0, 0], [0, 10.2, 0], [0, 0, 11.2]) },
    { name: 'chest', c: boarAt(P, [16, 0, 21]), ax: ax([6.8, 0, 0], [0, 9.0, 0], [0, 0, 9.0]) },
    { name: 'haunch', c: boarAt(P, [-15, 0, 24]), ax: ax([8.2, 0, 0], [0, 8.4, 0], [0, 0, 8.4]) },
    { name: 'belly', c: boarAt(P, [0, 0, 18]), ax: ax([13, 0, 0], [0, 8.4, 0], [0, 0, 6.2]) },
  ];
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
