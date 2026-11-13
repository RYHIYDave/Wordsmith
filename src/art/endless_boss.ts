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

import { INK, hash } from './kit';
import type { Px } from '../engine/px';
import type { Ramp } from './kit';
import { ENEMY_RIM, FLAME } from './mkit';
import { GLYPH, WORD_COLOR, WORD_GLOW } from './icons';
import { P as PAL } from './palette';
import { paintBits } from './new_mobs3';
import type { Painted } from './kit';
import type { Bit, Mob, MobCanvas, Moment, Put, Shape } from './new_mobs3';
import type { BossShape, CheckLimb, CheckLump, Handover } from './boss_checks';
import type { Ring, Skin, Stage } from './skin';
import { stage, wornOn } from './skin';
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
/** HIM CASTING FROM THE SADDLE: his staff raised high (0 ... 1), hammered down forward (0 ... 1, and on a little), his left hand
 * writing a rune on the air (0 ... 1, and where in its strokes), his hips going first into each blow (0 ... 1). */
export interface Cast {
  raise: number;
  hammer: number;
  write: number;
  stroke: number;
  lead: number;
}
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
  /** ITS HOOVES PUT ON SPOTS (the moves): for each that is, its sole (where it is, as the boar's own points are) and how far its
   * pastern is folded back (degrees); null, as `lift` or `legs` has it. */
  feet?: ReadonlyArray<readonly [number, number, number, number] | null>;
  /** HIM IN THE SADDLE, as it moves under him: leaning forward into a charge (degrees), braced back against a stop (degrees). */
  ride?: { lean: number; brace: number; still?: boolean; cast?: Cast; surge?: number };
  /** ITS DEATH: how far its legs have gone slack, from where `feet` put them to hanging as `legs` says (0 ... 1); how far its runes
   * have gone out, one after another (0 ... 1, `runeOn`); how far its stirrups hang from its own saddle with no feet in them
   * (0 ... 1). */
  limp?: number;
  dead?: number;
  free?: number;
  /** ITS END: how grey it has gone to ash (0 ... 1), and how far its ash has burst and blown away (0 ... 1, gone). */
  ash?: number;
  crumble?: number;
}
/** WHETHER A RUNE OF ITS IS LIT (1) OR GONE OUT (0), the rune going out at `when` of its dying: lit as it was, flickering as it
 * goes, then dark. */
export function runeOn(P: BoarPose, when: number): number {
  const d = P.dead ?? 0;
  if (d <= when - 0.08) return 1;
  if (d >= when) return 0;
  return hash(Math.floor(d * 300), Math.round(when * 100), 7711) < (when - d) / 0.08 ? 1 : 0;
}
/** When each of its runes goes out, in its dying (0 ... 1): the brand on its flank first, then its armour's, its greaves', the
 * runes cut in its tusks, its eyes last. */
export const RUNES_OUT = { brand: 0.18, armour: 0.38, greaves: 0.52, tusks: 0.68, eyes: 0.94 } as const;
/** A rune gone out: a cold scar where it burned. */
const SCAR = ['#1e1216', '#2e1a20', '#3e2228'] as const;
export const BOAR_STAND: BoarPose = {
  // (its head carried as it was drawn: `low` is how far it is lowered, so its stand's -6 tips its snout a little up)
  x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, low: -6, look: 0,
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
  // WHERE ITS HOOF GOES, if it is put somewhere: its sole on a spot (the moves: galloping, skidding, rearing), and how far its
  // pastern folds back; or, standing, PLANTED where it stands, lifted off it to stamp
  const c = Math.cos(P.yaw * D), sn = Math.sin(P.yaw * D);
  const fh: V3 = [c, sn, 0];
  const pastern = (fold: number): V3 => {
    const a = (REST_PASTERN[i] - fold) * D;
    return mul(add(mul(fh, Math.sin(a)), [0, 0, -Math.cos(a)]), l3 * S);
  };
  let pEnd: V3;
  let pv: V3;
  const F = P.feet?.[i];
  if (F) {
    pv = pastern(F[3]);
    pEnd = [F[0], F[1], F[2] + SOLE * S];
  } else if (P.lift) {
    // (its spot as it stands square, carried with it if it has moved; lifted, its hoof comes up and out in front of its chest,
    // under its jaw where it is seen, its pastern folding back so the hoof hangs, its sole to the rear; then struck back down)
    const R = PLANT[i];
    const at = (v: V3): V3 => [P.x + v[0] * c - v[1] * sn, P.y + v[0] * sn + v[1] * c, v[2]];
    const p = P.lift[i];
    const up: V3 = add([0, 0, p * STAMP_UP * S], mul(fh, p * STAMP_OUT * S));
    pv = pastern(STAMP_FOLD * p);
    pEnd = add(add(at(R.fet), up), pastern(0));
    pEnd = add(sub(pEnd, pastern(0)), pv);
  } else return { top, knee, fet, end };
  const slack = P.limp ?? 0;
  // (the knee forward on a foreleg, the hock back on a hind, bent to reach)
  const pFet = sub(pEnd, pv);
  const L1 = l1 * S;
  const L2 = l2 * S;
  const v = sub(pFet, top);
  const d = Math.max(Math.abs(L1 - L2) + 0.01, Math.min(L1 + L2 - 0.01, len(v)));
  const u = norm(v, [0, 0, -1]);
  const want = mul(fh, i < 2 ? 1 : -1);
  const n = norm(sub(want, mul(u, want[0] * u[0] + want[1] * u[1] + want[2] * u[2])), want);
  const ca = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  const kneeIK = add(top, add(mul(u, L1 * ca), mul(n, L1 * sa)));
  const fetIK = add(top, mul(u, d));
  const endIK = add(fetIK, pv);
  if (slack <= 0) return { top, knee: kneeIK, fet: fetIK, end: endIK };
  // (going slack: from where it was put to hanging as `legs` says; lying on the floor where it meets it)
  const up = (p: V3, r: number): V3 => [p[0], p[1], Math.max(r, p[2])];
  return { top, knee: up(lerp3(kneeIK, knee, slack), 2.4 * S), fet: up(lerp3(fetIK, fet, slack), 1.9 * S), end: up(lerp3(endIK, end, slack), 1.8 * S + 0.4) };
}
/** How far a hoof's end stands above the floor (its sole; its own lengths), and each pastern's slope standing (degrees forward). */
const SOLE = 1.8;
const REST_PASTERN = [0, 1, 2, 3].map((i) => BOAR_STAND.legs[i][0] + BOAR_STAND.legs[i][1] + 22);
/** How high a stamp lifts a hoof off the floor, how far out in front it brings it, how far its pastern folds (its own lengths,
 * degrees), and the pastern's slope as it stands (forward of straight down, degrees). */
const STAMP_UP = 7.5;
const STAMP_OUT = 7;
const STAMP_FOLD = 70;
/** Where each hoof stands as it stands square (its pastern's top and its end): its spot on the floor. */
const PLANT: { fet: V3; end: V3 }[] = [0, 1, 2, 3].map((i) => {
  const P = { ...BOAR_STAND, lift: undefined };
  const L = legOf(P, i);
  return { fet: L.fet, end: L.end };
});
/** Its hooves' soles (near fore, off fore, near hind, off hind). */
export function boarSoles(P: BoarPose): V3[] {
  return [0, 1, 2, 3].map((i) => add(legOf(P, i).end, [0, 0, -SOLE * S]));
}

// ITS HEAD AND NECK: a short, thick neck under the hump; a big wedge of a head carried low; a long snout to a flat disc.
function headOf(P: BoarPose): { at: (fwd: number, out: number, up: number) => V3; f: V3; l: V3; u: V3 } {
  // (the head turns and drops about its poll, behind its ears)
  const poll = boarAt(P, [19, 0, 26]);
  // (lowered by `low`: + down, as its pose says; a turn's pitch is + up)
  const f = turned(P, turn([1, 0, 0], P.look, -P.low, 0));
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
        if (gx >= 0 && gx < 5 && gy >= 0 && gy < 9 && g[gy][gx] === '#') return runeOn(P, RUNES_OUT.brand) ? (gy < 3 ? BURN[3] : BURN[2]) : gy < 3 ? SCAR[2] : SCAR[1];
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
  const eyesOn = runeOn(P, RUNES_OUT.eyes);
  for (const k of [-1, 1]) hb('eyes', 8.6, k * 4.9, -1.2, 1.1, 0.7, 0.9, (u) => (Math.hypot(u[1], u[2]) < 0.6 ? (eyesOn ? BURN[3] : SCAR[1]) : eyesOn ? BURN[2] : SCAR[0]));
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
      put('boarHead', 'tusks', { k: 'dot', p: lerp3(pts[seg], pts[seg + 1], ff), c: runeOn(P, RUNES_OUT.tusks) ? BURN[2] : TUSK[0], facing: H.l });
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
    const tip0 = add(add(root, mul(turned(P, [-0.2, k, 0]), 0.9 * S)), [sw * 0.5 * S, 0, -long]);
    // (lying on the floor where it reaches it)
    const tip: V3 = [tip0[0], tip0[1], Math.max(0.6, tip0[2])];
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
    const fr = P.free ?? 0;
    const foot = add(add(add(sd.at, mul(sd.f, -0.5)), mul(sd.l, k * (13.4 - 5.6 * fr) * S)), add(mul([0, 0, -12.0 * S - 0.6], 1 - fr), mul(sd.u, -(10 * S) * fr)));
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
  // (dying, its runes go out one after another: a cold scar where each burned)
  const lit = runeOn(P, RUNES_OUT.armour) ? burnAt(pulse) : SCAR[1];
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
    put(part, 'greave', { k: 'dot', p: add(lerp3(knee, fet, 0.3), mul(outw, 2.55 * S)), c: runeOn(P, RUNES_OUT.greaves) ? burnAt(pulse) : SCAR[1], facing: outw });
  }
  // ITS EYES: his power pouring out of them, pink, throbbing: a light on each eye that can be seen, and the burn of it streaming
  // back off its eye over its head like a flame in a wind, longer and brighter at each throb
  for (const k of [-1, 1]) {
    const eye = H.at(8.8, k * 5.0, -1.0);
    const facing = norm(add(mul(H.l, k), mul(H.f, 0.4)), H.f);
    if (st && dot3(facing, st.eye) < -0.05) continue;
    // (gone out: nothing pours out of them)
    if (!runeOn(P, RUNES_OUT.eyes)) continue;
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
  if (pulse > 0.15 && runeOn(P, RUNES_OUT.armour)) {
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
  const lean = P.ride?.lean ?? 0;
  const brace = P.ride?.brace ?? 0;
  const cy = Math.cos(P.yaw * D), sy = Math.sin(P.yaw * D);
  const yawed = (x: number, y: number): [number, number] => [x * cy - y * sy, x * sy + y * cy];
  const cast = P.ride?.cast;
  const cr = cast?.raise ?? 0, ch = cast?.hammer ?? 0, cw = cast?.write ?? 0, cs = cast?.stroke ?? 0, cl = cast?.lead ?? 0;
  // (writing: his clawed hand raised and tracing the rune's strokes on the air before him)
  const hl = yawed(10 + 1.4 * Math.sin(a * 2) + 3 * cw * Math.sin(cs), 4.0 + 1.0 * Math.cos(a * 2) + 2.5 * cw * Math.cos(cs));
  // (his staff hand: up high, then brought down forward like a hammer)
  const hrt = yawed(1.2 + 9 * ch, -11.5 + 2 * ch);
  return {
    px: at[0] + 0.9 * Math.sin(a + 0.9), py: at[1] + 0.4 * Math.sin(a + 0.9), pz: at[2] - PELVIS0 + 1.0 * Math.sin(a * 2),
    // (leaning down over its neck into a charge, thrown back against a stop)
    // (his seat tips with the boar's back: reared, he is tipped back with it as far as he does not lean into it)
    yaw: P.yaw, pitch: -2 + 0.6 * lean - 0.55 * brace - 0.45 * P.pitch + 6 * cl, roll: 0, twist: 6 + 2 * Math.sin(a + 0.5), bend: -2 + 0.9 * lean - 0.45 * brace + 14 * ch, side: 0, hunch: 5 + 0.4 * lean,
    faceTurn: 4 * Math.sin(a * 0.5), faceUp: 6 + 0.7 * lean + 0.3 * brace, faceTilt: 2,
    // (his knees and feet turned with him, as the boar turns: their ways are the figure's own)
    lfx: fl[0], lfy: fl[1] - B.stance, lfz: fl[2] - B.ankle, lfp: 10, lft: 8 + P.yaw, lk: 72 + P.yaw, lkUp: 8,
    rfx: frt[0], rfy: frt[1] + B.stance, rfz: frt[2] - B.ankle, rfp: 10, rft: -8 + P.yaw, rk: -72 + P.yaw, rkUp: 8,
    // (his left hand out before him, fingers clawed, writing on the air; his right hand high, the staff in it)
    // (his hands' places are along the figure's own axes: turned with him as the boar turns)
    // (at rest his writing hand is in before his belly, his elbow down; raised to write)
    lhIn: 1, lhx: hl[0], lhy: hl[1], lhz: -8 + 1.2 * Math.sin(a * 2 + 0.6) + 13 * cw + 3 * cw * Math.sin(cs * 2), le: -6,
    rhIn: 1, rhx: hrt[0], rhy: hrt[1], rhz: 7 + 0.6 * Math.sin(a) + 12 * cr * (1 - ch) - 8 * ch, re: 14,
    out: 0,
  } as Partial<Bones>;
}

/** His staff: from below his hand to well over his head, taller than he is; the iron ring at its head and his great rune in it. */
function staffOf(s: Skeleton, tilt = 0, planted: boolean | number = false): { foot: V3; head: V3; ring: V3; up: V3; side: V3 } {
  // (leaning a little forward and out to his right, as he faces; brought down forward by `tilt` degrees as he hammers with it)
  const f = norm([s.hips[0][0], s.hips[0][1], 0], [1, 0, 0]);
  const up0 = norm([0.08 * f[0] + 0.12 * f[1], 0.08 * f[1] - 0.12 * f[0], 1]);
  const up = norm(add(mul(up0, Math.cos(tilt * D)), mul(f, Math.sin(tilt * D))), up0);
  // (through his fist: a little in from his knuckles, toward his body, so that his fingers close round it)
  const grip = gripOf(s);
  // (riding, held a third of the way up; on foot, planted: his fist where it is on it, its foot on the floor, as far down as 40
  // below his fist (his staff raised, its foot off the floor), its length kept)
  const w = typeof planted === 'number' ? planted : planted ? 1 : 0;
  const below = 26 + (Math.max(10, Math.min(40, (grip[2] - 0.8) / Math.max(0.5, up[2]))) - 26) * w;
  const foot = add(grip, mul(up, -below));
  const head = add(grip, mul(up, 74 - below));
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
function head(put: Put, st: Stage, s: Skeleton, t: number, wind = 0): void {
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
      // (streaming out behind him in the wind of a charge)
      const w = wind * k;
      pts.push(add(at0, add([-w * long * 2.4, Math.abs(wind) * Math.sin(t * 27 + j + k * 3) * 0.6 * k, -long * i * (1 - 0.55 * Math.abs(wind))], add(mul(ff, -5.2 * k), mul(fl, j * 0.7 * k + Math.sin(t * 2 + j + k * 2) * 0.35 * k)))));
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

/** Where his staff passes through his right fist: a little in from his knuckles, toward his body. */
function gripOf(s: Skeleton): V3 {
  return add(s.handR, add(mul(s.chest[0], -0.4), mul(s.chest[1], 0.2)));
}
/** HIS FIST ROUND HIS STAFF (his words, 13 Nov 2026: “the hand on the staff is bad.  It doesn’t read as a hand”): built round the
 * staff, not a hand closed on nothing: the back of his hand on the wrist's side; four fingers, each its own, wrapped round the staff
 * one over another, their knuckles in a row; his thumb wrapped over the top of them from the other side. The staff goes in at its
 * top and out at its foot. At the Brawler's fists' size, as all his hands are. */
function gripHand(put: Put, side: 'L' | 'R', at: V3, ax: V3, fore: V3): void {
  const k = HAND;
  const up = norm(ax, [0, 0, 1]);
  // (across the staff: o from his wrist through the staff, w round it)
  const o = norm(sub(fore, mul(up, fore[0] * up[0] + fore[1] * up[1] + fore[2] * up[2])), [1, 0, 0]);
  const w = norm(cross(up, o), [0, 1, 0]);
  const sk = side === 'L' ? -1 : 1;
  // (THE FIST, as the Brawler's are: a chunky rounded block, bigger than life, closed right round the staff so the staff is not seen
  // through it, lit from the upper left)
  put(`hand${side}`, `fist${side}`, { k: 'ball', c: add(at, mul(o, 0.35 * k)), ax: [mul(o, 1.75 * k), mul(w, 1.6 * k), mul(up, 1.75 * k)], skin: ASH });
  // (its knuckles, a row of four down the front of it where his fingers bend round the staff: the line of them is what reads)
  for (let i = 0; i < 4; i++) {
    const h = (1.05 - i * 0.7) * k;
    put(`hand${side}`, `knuckle${side}`, { k: 'ball', c: add(at, add(mul(up, h), add(mul(o, 1.55 * k), mul(w, -sk * 0.75 * k)))), ax: [mul(o, 0.42 * k), mul(w, 0.5 * k), mul(up, 0.4 * k)], skin: ASH });
  }
  // (the creases between his fingers, dark across the front of his fist)
  const CREASE: Ramp = ['#100c14', '#1a1620', '#241e2a', '#2e2836', '#3a3442'];
  for (let i = 0; i < 3; i++) {
    const h = (0.7 - i * 0.7) * k;
    const a = add(at, add(mul(up, h), add(mul(o, 1.62 * k), mul(w, -sk * 1.05 * k))));
    const b = add(at, add(mul(up, h + 0.08 * k), add(mul(o, 1.75 * k), mul(w, sk * 0.55 * k))));
    put(`hand${side}`, `crease${side}`, { k: 'rod', a, b, ra: 0.2 * k, rb: 0.2 * k, ramp: CREASE });
  }
  // (his thumb, over the top of his fingers from the inside, its tip down in front: its own, a seam round it)
  // (his words, 13 Nov 2026: “The thumb is too big”: a thumb, not a second fist: thin, short, lying along the top of his fist)
  const t0 = add(at, add(mul(up, 1.4 * k), add(mul(o, -0.2 * k), mul(w, sk * 0.95 * k))));
  const t1 = add(at, add(mul(up, 1.55 * k), add(mul(o, 0.85 * k), mul(w, sk * 0.45 * k))));
  const t2 = add(at, add(mul(up, 1.3 * k), add(mul(o, 1.5 * k), mul(w, -sk * 0.05 * k))));
  put(`thumb${side}`, `thumb${side}`, { k: 'rod', a: t0, b: t1, ra: 0.34 * k, rb: 0.31 * k, ramp: ASH });
  put(`thumb${side}`, `thumb${side}`, { k: 'rod', a: t1, b: t2, ra: 0.31 * k, rb: 0.24 * k, ramp: ASH });
}
/** AN ARM: his order's sleeve, wide and ragged, to the forearm; the forearm bare below it, thin, ashen, cut with burning runes; the hand. */
function arm(put: Put, s: Skeleton, side: 'L' | 'R', cu: V3, grip: number, spread: number, holds?: V3): void {
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
  // (not over his fist on his staff)
  const hang = add(cuff, [0, 0, holds ? -2 : -4.5]);
  put(`fore${side}`, `sleeve${side}`, { k: 'rod', a: cuff, b: hang, ra: r1 * 1.9, rb: 0.5, ramp: RAGS, far: true });
  // (runes cut down the forearm, burning)
  for (const f of [0.35, 0.65, 0.9]) put(`fore${side}`, `fore${side}`, { k: 'dot', p: lerp3(cuff, wrist, f), c: BURN[2], facing: norm(cross(fore, [0, 0, 1]), [0, 1, 0]) });
  // (holding his staff, his fist is round it; else his hand as it is)
  if (holds) gripHand(put, side, gripOf(s), holds, fore);
  else hand(put, side, ha, fore, cu, grip, spread);
}

/** HIS ROBE AND CLOAK: his order's, gone to violet rags; seated, the robe over his thighs, the cloak hanging in strips down the boar's flanks. */
function robe(put: Put, s: Skeleton, sway: number, wind = 0, t = 0): void {
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
    // (in the wind of a charge it streams out behind him, snapping; flung forward as it stops dead)
    const fl = Math.abs(wind) * Math.sin(t * 31 + i * 1.9) * 2.2;
    const mid = add(top, add(mul(out, 5), [sw * 0.4 - wind * long * 0.38, fl * 0.4, -long * 0.5 * (1 - 0.5 * Math.abs(wind))]));
    const end = add(mid, add(mul(out, 4), [sw - wind * long * 0.48, fl, -long * 0.5 * (1 - 0.65 * Math.abs(wind)) + fl * 0.6]));
    put('cloak', 'cloak', { k: 'rod', a: top, b: mid, ra: 3.0, rb: 2.6, ramp: RAGS });
    put('cloak', 'cloak', { k: 'rod', a: mid, b: end, ra: 2.6, rb: 0.9, ramp: RAGS });
  }
  void sub;
}

/** HIS STAFF: old dark wood, iron-shod, runes cut down it burning; the iron ring at its head, his great rune burning in it. */
function staff(put: Put, s: Skeleton, t: number, tilt = 0, planted: boolean | number = false): void {
  const st = staffOf(s, tilt, planted);
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
  if (move === 'charge') return chargePoseAt(t);
  if (move === 'fall') return fallPoseAt(t);
  if (move === 'wheel') return wheelPoseAt(t);
  if (move === 'gore') return gorePoseAt(t);
  if (move === 'stomp') return stompPoseAt(t);
  if (move === 'power') return powerPoseAt(t);
  if (move === 'flame') return flamePoseAt(t);
  if (move === 'frost') return frostPoseAt(t);
  if (move === 'lightning') return boltPoseAt(t);
  if (move === 'poison') return sporePoseAt(t);
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
// =============================================================================================
// THE CHARGE (his pick, 12 Nov 2026: “Boar charge (Recommended)”, offered as: it stamps and snorts as a warning, then charges in a
// straight line and skids to a stop; up to three runs, wheeling round, faster each time). By his Movement 9 (“the wind up and wind
// down are big but the actual punch is lightning quick”) and Monsters 4 (the warning is a pose):
//   THE WIND-UP   its head drops, its haunches sink, its near forefoot paws the floor twice, throwing grit back; it snorts, its
//                 eyes flaring; he leans down over its neck
//   HELD          trembling, its eyes blazing, his rune-staff high (the lane is marked on the floor: the rules are the main chat's)
//   THE STRIKE    TWO FRAMES, smeared: it bursts off, all four hooves off the floor
//   THE RUN       a flat-out gallop down the lane, the game carrying it (`chargeCarry`), each hoof down on its own spot of the floor
//                 while the floor goes by under it; grit thrown up at each footfall; he low over its neck, his cloak streaming
//   THE SKID      forelegs braced out before it, haunches sat down, its hooves ploughing (the one time a hoof slides: his pick,
//                 “Heavy charges, skid and turn (Recommended)”), grit and frost sprayed out ahead; he thrown back in the saddle
//   AT REST       its hooves stepped back under it, a snort.
/** A tile in the figure's own lengths. */
const TILE = 32 / Math.sqrt(2 / 3);
const FR = 1 / 30;
const fr = (n: number): number => n / 30;
export const CHARGE_STRIKE = [fr(32), fr(34)] as const;
export const CHARGE = {
  lower: 0.3,
  paws: [[0.34, 0.56], [0.6, 0.82]] as const,
  snort: 0.84,
  held: 0.88,
  strike: CHARGE_STRIKE,
  launch: [1.1, 2.5] as const,
  pace: 11,
  run: 0.62,
  skid: 0.55,
  settle: 0.6,
  /** the lane: how long (tiles), and how wide to either side of its middle */
  lane: 0,
  half: 1.0,
  long: 0,
};
CHARGE.long = CHARGE_STRIKE[1] + CHARGE.run + CHARGE.skid + CHARGE.settle;
/** When it starts to skid, and when it has stopped. */
const SKID0 = CHARGE_STRIKE[1] + CHARGE.run;
const SKID1 = SKID0 + CHARGE.skid;
export const CHARGE_SKID = [SKID0, SKID1] as const;
/** How far the game has carried it down its lane, `t` seconds into the charge (tiles). */
export function chargeCarry(t: number): number {
  const [s0, s1] = CHARGE_STRIKE;
  const [l0, l1] = CHARGE.launch;
  if (t <= s0) return 0;
  if (t < s0 + FR) return l0 * ((t - s0) / FR);
  if (t < s1) return l0 + (l1 - l0) * ((t - s0 - FR) / FR);
  const run = l1 + CHARGE.pace * Math.min(CHARGE.run, t - s1);
  if (t <= SKID0) return run;
  // (the skid: slowing from its pace to nothing, harder at the first)
  const u = Math.min(1, (t - SKID0) / CHARGE.skid);
  return run + CHARGE.pace * CHARGE.skid * (u - u * u / 2) * (1 - 0.15 * u * (1 - u));
}
CHARGE.lane = chargeCarry(CHARGE.long) + 1.2;
export const chargeSmeared = (t: number): boolean => t > CHARGE_STRIKE[0] + 1e-6 && t <= CHARGE_STRIKE[1] + FR + 1e-6;
/** Its soles as it stands square (as its own points are, the floor point under it at nothing). */
const SOLE0: V3[] = [0, 1, 2, 3].map((i) => add(legOf({ ...BOAR_STAND, lift: [0, 0, 0, 0] }, i).end, [0, 0, -SOLE * S]));
// ITS GALLOP: each hoof down on its own spot of the floor while the floor goes by under it (a stride, how much of it a hoof is
// down for, when in the stride each comes down: its hind feet a beat before its fore)
const STRIDE = 2.9 * TILE;
const HALF = 7 * S;
const SPAN = 2 * HALF;
const FIRST = CHARGE.launch[1] * TILE;
const ORDER = [0.5, 0.62, 0.0, 0.1];
const plantAt = (i: number, k: number): number => FIRST + (k + ORDER[i]) * STRIDE;
type Foot = readonly [number, number, number, number];
function gallopFoot(i: number, c: number): Foot {
  const r = SOLE0[i];
  const fore = i < 2;
  const p0 = plantAt(i, 0);
  if (c < p0 - HALF) {
    // (bursting off: its forelegs flung out before it, its hind legs thrust out behind, all four off the floor)
    const v = clamp01(c / (p0 - HALF));
    const arc = Math.sin(Math.PI * v);
    const w = Math.min(1, v * 1.2);
    const reach = Math.sin(Math.PI * w);
    const lift = 0.8 * Math.min(1, v * 8);
    return fore ? [r[0] + HALF * smooth01(w) + 6 * S * reach, r[1], 8 * S * arc + lift, 85 * arc] : [r[0] + HALF * smooth01(w) - 10 * S * reach, r[1], 6 * S * arc + lift, 30 * arc];
  }
  const kf = (c - p0 + HALF) / STRIDE;
  const k = Math.floor(kf);
  const u = (kf - k) * STRIDE;
  if (u < SPAN) return [r[0] + (plantAt(i, k) - c), r[1], 0, 0];
  const v = (u - SPAN) / (STRIDE - SPAN);
  const arc = Math.sin(Math.PI * v);
  // (it reaches its next spot a little before it comes down, so that it comes down on it, not sliding onto it; clear of the floor
  // till then)
  return [r[0] - HALF + SPAN * smooth01(Math.min(1, v * 1.18)) + (fore ? 4 : -4) * S * arc, r[1], (fore ? 9 : 7) * S * arc + 0.8, (fore ? 95 : 40) * arc];
}
/** Its skid: its forelegs braced out before it, its hind feet under its belly, all ploughing (as its own points are). */
const SKID_FEET: Foot[] = [0, 1, 2, 3].map((i) => (i < 2 ? [SOLE0[i][0] + 5 * S, SOLE0[i][1], 0, -8] : [SOLE0[i][0] + 5 * S, SOLE0[i][1], 0, 10]));
/** Where its hooves are as it begins to skid (the gallop's last), and as it comes to rest. */
function chargeFeet(t: number): Foot[] {
  const c = chargeCarry(t) * TILE;
  const [s0] = CHARGE_STRIKE;
  return [0, 1, 2, 3].map((i): Foot => {
    const rest: Foot = [SOLE0[i][0], SOLE0[i][1], 0, 0];
    if (t <= s0) {
      // (its near forefoot pawing: lifted out before it, struck down, dragged back over the floor throwing grit, twice)
      if (i === 1) {
        for (const [a, b] of CHARGE.paws) {
          if (t <= a || t >= b) continue;
          const u = (t - a) / (b - a);
          const fwd = u < 0.4 ? smooth01(u / 0.4) : 1 - smooth01((u - 0.4) / 0.6);
          const up = u < 0.4 ? Math.sin((Math.PI / 2) * smooth01(u / 0.4)) : u < 0.55 ? 1 - smooth01((u - 0.4) / 0.15) * 0.9 : 0.1 * (1 - smooth01((u - 0.55) / 0.45));
          return [rest[0] + (7 * fwd - 3 * smooth01((u - 0.4) / 0.6) * (u > 0.4 ? 1 : 0)) * S, rest[1], Math.max(0.75, 6 * S * up), 70 * up];
        }
      }
      return rest;
    }
    if (t <= SKID0) return gallopFoot(i, c);
    // (into the skid: each hoof thrown down onto its braced spot over a few frames, then held there, ploughing)
    const g = gallopFoot(i, chargeCarry(SKID0) * TILE);
    const sk = SKID_FEET[i];
    if (t <= SKID1) {
      const v = smooth01((t - SKID0) / 0.12);
      return [g[0] + (sk[0] - g[0]) * v, g[1], g[2] * (1 - v), g[3] + (sk[3] - g[3]) * v];
    }
    // (stepped back under it, one after another)
    const w0 = SKID1 + 0.04 + [0.0, 0.12, 0.2, 0.3][i];
    const v = clamp01((t - w0) / 0.18);
    const arc = Math.sin(Math.PI * v);
    return [sk[0] + (rest[0] - sk[0]) * smooth01(v), sk[1], 4 * S * arc, sk[3] * (1 - smooth01(v)) + 40 * arc];
  });
}
export function chargePoseAt(t: number): BoarPose {
  const [s0, s1] = CHARGE_STRIKE;
  const c = chargeCarry(t) * TILE;
  // (head down and haunches sunk for the wind-up; flat out; sat back in the skid; at rest)
  const low = smooth01(t / CHARGE.lower) * (1 - smooth01((t - SKID0) / 0.2));
  const run = clamp01((t - s0) / FR) * (1 - smooth01((t - SKID0) / 0.14));
  const skid = smooth01((t - SKID0) / 0.12) * (1 - smooth01((t - SKID1 - 0.05) / 0.45));
  const ph = TAU * ((c - FIRST) / STRIDE);
  const rock = t > s1 ? run : 0;
  // (its paws: it dips onto each; then held, trembling; its snort)
  let dip = 0;
  for (const [a, b] of CHARGE.paws) dip += bumpOf(t, a + 0.4 * (b - a), b);
  const held = t > CHARGE.held && t < s0 ? 1 : 0;
  const shiver = held * (0.5 * Math.sin(t * 90) + 0.3 * Math.sin(t * 137));
  const snort = bumpOf(t, CHARGE.snort - 0.05, CHARGE.snort + 0.3);
  const after = bumpOf(t, SKID1 + 0.1, SKID1 + 0.5);
  return {
    ...BOAR_STAND,
    x: 0,
    z: -2.2 * low * S - 1.2 * dip + 0.5 * shiver - 2.4 * S * skid + rock * S * (1.0 * Math.cos(ph) - 1.0),
    pitch: -4 * low + 3 * skid + rock * 3.5 * Math.sin(ph) - 0.6 * snort,
    roll: 1.2 * dip + 0.6 * shiver,
    low: BOAR_STAND.low + 16 * low - 22 * skid - 12 * snort + 6 * after + rock * 3 * Math.cos(ph + 0.5),
    look: 2 * shiver - 8 * after * Math.sin((t - SKID1) * 20),
    tilt: 10 * after * Math.sin((t - SKID1) * 20 + 0.6),
    flap: run * 0.9 + 0.6 * skid - after * Math.cos((t - SKID1) * 20),
    legs: BOAR_STAND.legs,
    feet: chargeFeet(t),
    breath: 0.5 + 0.5 * snort,
    sway: t / WS_STAND_LONG + 0.3 * run * Math.sin(ph),
    pulse: Math.max(smooth01((t - 0.2) / 0.6), 0.6) * (t > SKID1 + 0.3 ? 1 - 0.6 * smooth01((t - SKID1 - 0.3) / 0.3) : 1),
    ride: { lean: 26 * Math.max(low * 0.5, run), brace: 20 * skid },
  };
}

/** WHAT FLIES OFF IT, laid after its edge: a blast of breath out of its snout at each snort, cold, white, spreading and thinning;
 * dust kicked up round a stamped hoof. Never a glow. */
const BREATH: readonly string[] = ['#e6e4ea', '#c9c6d0', '#a8a4b0', '#878392'];
const DUST: readonly string[] = ['#c4b8b4', '#9e9294', '#786c74'];
export function boarGrains(t: number, move = 'stand', near = -1): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  if (move === 'charge') return chargeGrains(t);
  if (move === 'fall') return fallGrains(t, near);
  if (move === 'wheel') return wheelGrains(t);
  if (move === 'gore') return goreGrains(t);
  if (move === 'stomp') return stompGrains(t);
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

// THE WHEEL ROUND (his yes, 12 Nov 2026: “Yes, build the wheel-round (Recommended)”, offered as: up to three runs, wheeling round
// after each skid and coming back faster): stopped, it spins round on its forehand to face back down its lane, its hindquarters
// flung round in two great hops, its forefeet stepping round under it, its head swung round first; grit thrown out from its hind
// feet. It ends facing the way it came (the game then shows it from the other side, and the next run goes back down the lane).
export const WHEEL = { long: 0.72, hops: [[0.06, 0.32], [0.38, 0.62]] as const, steps: [[0.1, 0.2], [0.18, 0.28], [0.42, 0.52], [0.5, 0.6]] as const };
/** Where it turns: its forehand, on the floor between its forefeet. */
const WHEEL_PIVOT: V3 = [(SOLE0[0][0] + SOLE0[1][0]) / 2, 0, 0];
/** How far round it has come at `t` (degrees): each half of it on a hop of its hindquarters, still as they come down between. */
function wheelYaw(t: number): number {
  const [[a0, a1], [b0, b1]] = WHEEL.hops;
  return 90 * smooth01((t - a0) / (a1 - a0)) + 90 * smooth01((t - b0) / (b1 - b0));
}
/** A point of it as it stands square, turned round its forehand by `Y` degrees. */
function wheeled(p: V3, Y: number): V3 {
  const c = Math.cos(Y * D), sn = Math.sin(Y * D);
  const d = sub(p, WHEEL_PIVOT);
  return [WHEEL_PIVOT[0] + d[0] * c - d[1] * sn, WHEEL_PIVOT[1] + d[0] * sn + d[1] * c, p[2]];
}
export function wheelPoseAt(t: number): BoarPose {
  const Y = wheelYaw(t);
  const spin = bumpOf(t, 0.02, WHEEL.long - 0.04);
  const feet: Foot[] = [0, 1, 2, 3].map((i): Foot => {
    const r = SOLE0[i];
    if (i >= 2) {
      // (its hind feet: flung round off the floor in two hops, down a moment between)
      for (const [a, b] of WHEEL.hops) {
        if (t <= a || t >= b) continue;
        const v = (t - a) / (b - a);
        const p = wheeled(r, wheelYaw(t));
        return [p[0], p[1], 6.5 * S * Math.sin(Math.PI * v) + 0.8, 30 * Math.sin(Math.PI * v)];
      }
      const p = wheeled(r, wheelYaw(t));
      return [p[0], p[1], 0, 0];
    }
    // (its forefeet: each stepped round twice under it, down on its spot between)
    let Yp = 0;
    for (const [k, [a, b]] of WHEEL.steps.entries()) {
      if (k % 2 !== i) continue;
      if (t >= b) Yp = wheelYaw(b);
      else if (t > a) {
        const v = (t - a) / (b - a);
        const from = wheeled(r, Yp);
        const to = wheeled(r, wheelYaw(b));
        const w = smooth01(Math.min(1, v * 1.2));
        return [from[0] + (to[0] - from[0]) * w, from[1] + (to[1] - from[1]) * w, 3.5 * S * Math.sin(Math.PI * v) + 0.8, 50 * Math.sin(Math.PI * v)];
      }
    }
    const p = wheeled(r, Yp);
    return [p[0], p[1], 0, 0];
  });
  // (its body turned round its forehand: where its floor point is carried to, as it turns)
  const at = sub(WHEEL_PIVOT, rotZ(WHEEL_PIVOT, Y));
  return {
    ...BOAR_STAND,
    x: at[0],
    y: at[1],
    z: -1.4 * S * spin,
    yaw: Y,
    pitch: -3 * spin,
    roll: -7 * spin * Math.sin(Math.PI * clamp01(t / WHEEL.long)),
    // (its head swung round ahead of it)
    low: BOAR_STAND.low + 4 * spin,
    look: 28 * bumpOf(t, 0.0, WHEEL.long * 0.8),
    tilt: -8 * spin,
    flap: -0.8 * spin,
    legs: BOAR_STAND.legs,
    feet,
    breath: 0.6,
    sway: t / WS_STAND_LONG + 0.4 * spin,
    pulse: 0.75,
    ride: { lean: 10 * spin, brace: 0 },
  };
}
const rotZ = (p: V3, Y: number): V3 => {
  const c = Math.cos(Y * D), sn = Math.sin(Y * D);
  return [p[0] * c - p[1] * sn, p[0] * sn + p[1] * c, p[2]];
};

// THE GORE (his pick, 12 Nov 2026: “Tusk gore (Recommended)”, offered as: up close, it hooks its tusks up and throws you back). By
// his Movement 9 and Monsters 4:
//   THE WIND-UP  rocked back on its haunches, its head dropped right down to the floor, its tusks levelled forward, its near
//                forefoot pawing once; he leans back, his staff high
//   HELD         trembling, snorting, its eyes blazing (its sweep marked on the floor before it: the rules are the main chat's)
//   THE STRIKE   ONE FRAME, smeared: its head swung straight up, hooking with its tusks (his words, 12 Nov 2026: “A gore would be a
//                swing up of the head, trying to hook with the horns”), its forequarters heaved up and forward behind it
//   AFTER        its head flung high and over, held, shaken; settling back to its stand
// (one frame: wound up in one, hooked through in the next, a flash from either side)
export const GORE_STRIKE = [fr(21), fr(22)] as const;
export const GORE = { lower: 0.5, paw: [0.12, 0.38] as const, snort: 0.5, held: 0.52, strike: GORE_STRIKE, hit: GORE_STRIKE[1], high: 1.15, long: 2.1, arc: 90, reach: 2.4 };
export const goreSmeared = (t: number): boolean => t > GORE_STRIKE[0] + 1e-6 && t <= GORE_STRIKE[1] + FR + 1e-6;
/** The gore's way: 0 at rest, 1 wound up (its head down at the floor), -1 hooked through (its head swung up high); its lunge. */
function goreWay(t: number): number {
  const [s0, s1] = GORE_STRIKE;
  if (t <= GORE.lower) return smooth01(t / GORE.lower);
  if (t <= s0) return 1;
  if (t <= s1) return 1 - 2 * ((t - s0) / (s1 - s0));
  // (carried on through, held high, then let down)
  if (t <= s1 + 0.25) return -1 - 0.14 * Math.sin((Math.PI / 2) * ((t - s1) / 0.25));
  if (t <= GORE.high) return -1.14 + 0.06 * smooth01((t - s1 - 0.25) / (GORE.high - s1 - 0.25));
  return -1.08 * (1 - smooth01((t - GORE.high) / (GORE.long - GORE.high)));
}
export function gorePoseAt(t: number): BoarPose {
  const w = goreWay(t);
  const wound = Math.max(0, w);
  const thrown = Math.max(0, -w);
  const [s0] = GORE_STRIKE;
  const held = t > GORE.held && t < s0 ? 1 : 0;
  const shiver = held * (0.4 * Math.sin(t * 90) + 0.25 * Math.sin(t * 137));
  const snort = bumpOf(t, GORE.snort - 0.04, GORE.snort + 0.3);
  // (shaken high after it hooks through)
  const shake = bumpOf(t, GORE.hit + 0.18, GORE.high + 0.1);
  const feet: Foot[] = [0, 1, 2, 3].map((i): Foot => {
    if (i === 1 && t > GORE.paw[0] && t < GORE.paw[1]) {
      const u = (t - GORE.paw[0]) / (GORE.paw[1] - GORE.paw[0]);
      const fwd = u < 0.4 ? smooth01(u / 0.4) : 1 - smooth01((u - 0.4) / 0.6);
      const up = u < 0.4 ? Math.sin((Math.PI / 2) * smooth01(u / 0.4)) : u < 0.55 ? 1 - 0.9 * smooth01((u - 0.4) / 0.15) : 0.1 * (1 - smooth01((u - 0.55) / 0.45));
      return [SOLE0[i][0] + 6 * fwd * S, SOLE0[i][1], Math.max(0.75, 5.5 * S * up), 60 * up];
    }
    // (its forefeet heaved up off the floor with the toss, and brought down again on their spots)
    if (i < 2) {
      const up = bumpOf(t, GORE.hit - FR, GORE.high + 0.12) ** 0.6;
      if (up > 0) return [SOLE0[i][0] + 2.5 * S * up, SOLE0[i][1], 5.5 * S * up + 0.8 * Math.min(1, up * 6), 55 * up];
    }
    return [SOLE0[i][0], SOLE0[i][1], 0, 0];
  });
  // (the toss rears its forequarters up off the floor)
  const rear = bumpOf(t, GORE.hit - FR, GORE.high + 0.12) ** 0.6;
  return {
    ...BOAR_STAND,
    x: (-2.2 * wound + 2.6 * thrown) * S,
    z: (-1.4 * wound - 2.1 * thrown + 1.2 * rear) * S + 0.4 * shiver,
    pitch: -4 * wound + 4 * thrown + 9 * rear,
    roll: -1.5 * wound + 2 * thrown + 0.5 * shiver,
    low: BOAR_STAND.low + 30 * wound - 58 * thrown - 6 * snort,
    look: -7 * wound + 8 * thrown + 1.2 * shiver + 6 * shake * Math.sin((t - GORE.hit) * 26),
    tilt: -6 * wound + 9 * thrown + 10 * shake * Math.sin((t - GORE.hit) * 26 + 0.7),
    flap: 0.3 * wound - 1.0 * thrown,
    legs: BOAR_STAND.legs,
    feet,
    breath: 0.5 + 0.5 * snort,
    sway: t / WS_STAND_LONG + 0.3 * thrown,
    pulse: Math.max(0.55, smooth01((t - 0.15) / 0.3)) * (t > GORE.high ? 1 - 0.5 * smooth01((t - GORE.high) / 0.5) : 1),
    ride: { lean: 10 * thrown, brace: 12 * wound },
  };
}
/** The gore's striking end: the tip of its left tusk, as it hooks up. */
export function goreTip(P: BoarPose): V3 {
  return headOf(P).at(16.0, 6.4, 4.2);
}
/** WHAT FLIES OFF IT AS IT GORES: grit flung back as it paws; its snort; the hook's track, a crescent of pink-white off its tusk
 * through the strike, fading; grit and frost flung up from the floor its tusk tore through. */
function goreGrains(t: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const g = 30;
  // (the paw)
  {
    const t0 = GORE.paw[0] + 0.45 * (GORE.paw[1] - GORE.paw[0]);
    for (let i = 0; i < 12; i++) {
      const u = t - t0 - 0.02 * (i % 4);
      if (u <= 0 || u > 0.5) continue;
      const p: V3 = [SOLE0[1][0] + 4 * S - (40 + 50 * hash(i, 2, 8931)) * S * u, SOLE0[1][1] + (hash(i, 3, 8932) - 0.5) * 30 * S * u, 0.5 + (14 + 16 * hash(i, 4, 8933)) * S * u - 0.5 * g * S * u * u];
      if (p[2] < 0 || hash(i, Math.floor(u * 30), 8934) < (u / 0.5) * 0.8) continue;
      out.push([p, DUST[Math.min(2, Math.floor((u / 0.5) * 3))], 1]);
    }
  }
  // (its snort)
  {
    const u = t - GORE.snort;
    if (u > 0 && u < 0.6) {
      const H = headOf(gorePoseAt(GORE.snort + 0.05));
      for (const k of [-1, 1]) {
        const nose = H.at(22.6, k * 1.2, -8.2);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * TAU + hash(i, k, 8935);
          const r = (1.5 + 7 * Math.sqrt(u)) * S * Math.sqrt(0.2 + 0.8 * hash(i, k + 5, 8936));
          const p = add(add(nose, mul(H.f, 9 * S * (1 - Math.exp(-u * 6)))), [Math.cos(a) * r, Math.sin(a) * r, 4 * u + Math.sin(a) * r * 0.3]);
          if (hash(i, Math.floor(u * 20), 8937) < (u / 0.6) * 0.9) continue;
          out.push([p, BREATH[Math.min(3, Math.floor((u / 0.6) * 4))], u < 0.25 ? 2 : 1]);
        }
      }
    }
  }
  // (the hook's track: where its tusk tip went through the strike and a little after, a crescent fading from its far end)
  const [s0, s1] = GORE_STRIKE;
  if (t > s0 && t < s1 + 0.3) {
    const age = Math.max(0, t - s1);
    const n = 26;
    for (let i = 0; i <= n; i++) {
      const tt = s0 + (i / n) * (Math.min(t, s1 + 0.1) - s0);
      const p = goreTip(gorePoseAt(tt));
      const f = i / n;
      if (age > 0 && f < age / 0.3) continue;
      const hot = f > 0.6 ? FLAME[4] : f > 0.3 ? FLAME[3] : FLAME[2];
      out.push([p, age > 0.18 ? FLAME[1] : hot, f > 0.5 && age < 0.12 ? 2 : 1]);
      out.push([add(p, [0, 0, -1.2]), age > 0.12 ? FLAME[1] : FLAME[2], 1]);
    }
  }
  // (grit and frost torn up from the floor before it as its tusk comes through)
  for (let i = 0; i < 22; i++) {
    const u = t - s0 - 0.01 * (i % 3);
    if (u <= 0 || u > 0.6) continue;
    const a = (-0.6 + 1.2 * hash(i, 1, 8938)) + 0.2;
    const sp = (40 + 70 * hash(i, 2, 8939)) * S;
    const from: V3 = [SOLE0[0][0] + 12 * S, (hash(i, 5, 8940) - 0.5) * 10 * S, 0.5];
    const p: V3 = [from[0] + Math.cos(a) * sp * u, from[1] + Math.sin(a) * sp * u, from[2] + (30 + 30 * hash(i, 3, 8941)) * S * u - 0.5 * g * S * u * u];
    if (p[2] < 0 || hash(i, Math.floor(u * 30), 8942) < (u / 0.6) * 0.8) continue;
    out.push([p, i % 3 === 0 ? BREATH[1] : DUST[Math.min(2, Math.floor((u / 0.6) * 3))], u < 0.1 ? 2 : 1]);
  }
  return out;
}

// THE REAR UP AND STOMP (his words, 12 Nov 2026: “And I want a rear up and stomp with a big aoe from the boar as well”; offered:
// it rears onto its hind legs with him still in the saddle, then slams down, the floor cracking and shock rings rolling out one
// after another, a warning ring on the floor first). By his Movement 9 and Monsters 4:
//   THE WIND-UP  it gathers, haunches down; rears up onto its hind legs, its forefeet off the floor, pawing the air, its head flung
//                up, bellowing (a blast of breath up out of its snout); he leans into its neck, his staff high
//   HELD         reared at its height, trembling, its forefeet beating the air (the rings it will send out marked on the floor)
//   THE STRIKE   TWO FRAMES, smeared: it crashes down onto its forefeet
//   THE BLAST    the floor cracks under its forefeet and shock rings roll out from them one after another (the film draws them: how
//                far, how many and how hard are the rules', the main chat's); stone and grit and frost thrown up in a ring; the screen
//                kicks hard; its head whipped down, shaken; its body squashed down and coming back up
export const STOMP_STRIKE = [fr(30), fr(32)] as const;
export const STOMP = { gather: 0.15, up: 0.78, held: 0.8, strike: STOMP_STRIKE, hit: STOMP_STRIKE[1], rings: [0, 0.22, 0.44] as const, ringLong: 0.7, reach: 4.5, long: 2.0, height: 50 };
export const stompSmeared = (t: number): boolean => t > STOMP_STRIKE[0] + 1e-6 && t <= STOMP_STRIKE[1] + FR + 1e-6;
/** How far it is reared (0 down ... 1 at its height). */
function rearOf(t: number): number {
  const [s0, s1] = STOMP_STRIKE;
  if (t <= STOMP.gather) return 0;
  if (t <= STOMP.up) {
    const u = (t - STOMP.gather) / (STOMP.up - STOMP.gather);
    return 1 - (1 - u) * (1 - u) * (1 - u) * (1 + 0.0 * u);
  }
  if (t <= s0) return 1;
  if (t <= s1) return 1 - (t - s0) / (s1 - s0);
  return 0;
}
/** Its hind leg's top as it stands (its own points): it rears about it, its haunches let down. */
const HAUNCH: V3 = [-14, 0, 22.8];
export function stompPoseAt(t: number): BoarPose {
  const [s0, s1] = STOMP_STRIKE;
  const r = rearOf(t);
  const th = STOMP.height * r;
  const gather = bumpOf(t, 0, STOMP.gather * 2.2);
  const held = t > STOMP.held && t < s0 ? 1 : 0;
  const shiver = held * (0.4 * Math.sin(t * 88) + 0.25 * Math.sin(t * 133));
  // (the slam: squashed down, nose down, coming back up)
  const after = t > s1 ? t - s1 : -1;
  const squash = after >= 0 ? Math.exp(-after * 7) * (after < 0.04 ? 1 : 1) : 0;
  const settle = after >= 0 ? smooth01(after / 0.7) : 0;
  // (reared about its haunches, they let down as it goes up: where its body must be for its haunch to stay over its hind feet)
  const drop = (4.5 * r + 1.2 * gather) * S;
  const c = Math.cos(th * D), sn = Math.sin(th * D);
  const rel: V3 = mul(sub(HAUNCH, PIVOT), S);
  const x2 = rel[0] * c - rel[2] * sn;
  const z2 = rel[0] * sn + rel[2] * c;
  const px = rel[0] - x2;
  const pz = rel[2] - z2 - drop;
  const P0: BoarPose = { ...BOAR_STAND, x: px, z: pz, pitch: th };
  // (its forefeet: off the floor as it rears, tucked and beating the air; slammed down on their spots)
  const air = smooth01((t - 0.11) / 0.12) * (t < s0 ? 1 : 1 - (t - s0) / (s1 - s0));
  const feet: Foot[] = [0, 1, 2, 3].map((i): Foot => {
    const rest: Foot = [SOLE0[i][0], SOLE0[i][1], 0, 0];
    if (i >= 2) return rest;
    if (t > s1) {
      // (down, then each stepped once, settling)
      const w0 = s1 + 0.45 + 0.16 * i;
      const v = clamp01((t - w0) / 0.2);
      const arc = Math.sin(Math.PI * v);
      return arc > 0 ? [rest[0], rest[1], 3.5 * S * arc + 0.8, 40 * arc] : rest;
    }
    if (air <= 0) return rest;
    const ph = (t - 0.3) * TAU * 2.6 + i * Math.PI;
    const local: V3 = [14.6 + 2.2 * Math.sin(ph), i === 0 ? 6.4 : -6.4, 10.5 + 2.2 * Math.cos(ph)];
    const up = boarAt(P0, local);
    const sole: V3 = [up[0], up[1], up[2] - SOLE * S];
    return [rest[0] + (sole[0] - rest[0]) * air, rest[1] + (sole[1] - rest[1]) * air, Math.max(0.8 * Math.min(1, air * 8), sole[2] * air), 95 * air];
  });
  return {
    ...BOAR_STAND,
    x: px,
    z: pz - 2.2 * S * squash + 0.4 * shiver,
    pitch: th - 6 * squash * (1 - settle) + 0.4 * shiver,
    roll: 0.6 * shiver,
    // (its head flung up as it rears, bellowing; whipped down as it lands, shaken)
    low: BOAR_STAND.low - 26 * r - 10 * bumpOf(t, 0.45, 0.85) + 30 * squash + 12 * bumpOf(t, s1, s1 + 0.9),
    look: 1.2 * shiver + 10 * bumpOf(t, s1 + 0.1, s1 + 0.8) * Math.sin((t - s1) * 24),
    tilt: 12 * bumpOf(t, s1 + 0.1, s1 + 0.8) * Math.sin((t - s1) * 24 + 0.6),
    flap: -0.9 * r + 1.0 * squash,
    legs: BOAR_STAND.legs,
    feet,
    breath: 0.5 + 0.5 * bumpOf(t, 0.45, 0.85),
    sway: t / WS_STAND_LONG + 0.3 * squash,
    pulse: Math.max(0.6, smooth01((t - 0.2) / 0.5)) * (t > s1 + 0.6 ? 1 - 0.5 * smooth01((t - s1 - 0.6) / 0.6) : 1),
    // (he leans into its neck as it rears, and is thrown down with it as it lands)
    ride: { lean: 34 * (t <= s1 ? smooth01((t - STOMP.gather) / 0.4) : 1 - smooth01((t - s1) / 0.4)) + 12 * squash, brace: 0, still: true },
  };
}
/** The stomp's striking end: its snout, crashing down with it. */
export function stompTip(P: BoarPose): V3 {
  return headOf(P).at(21.6, 0, -7.6);
}
/** WHAT FLIES OFF IT AS IT STOMPS: its bellow, a blast of breath up out of its snout; as it lands, stone, grit and frost thrown up in a
 * ring out from its forefeet, and dust rolling out low. */
function stompGrains(t: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const g = 30;
  // (its bellow)
  {
    const u = t - 0.5;
    if (u > 0 && u < 0.7) {
      const H = headOf(stompPoseAt(0.55));
      for (const k of [-1, 1]) {
        const nose = H.at(22.6, k * 1.2, -8.2);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU + hash(i, k, 8951);
          const rr = (1.5 + 8 * Math.sqrt(u)) * S * Math.sqrt(0.2 + 0.8 * hash(i, k + 5, 8952));
          const p = add(add(nose, mul(H.f, 12 * S * (1 - Math.exp(-u * 5)))), [Math.cos(a) * rr, Math.sin(a) * rr, 6 * u + Math.sin(a) * rr * 0.3]);
          if (hash(i, Math.floor(u * 20), 8953) < (u / 0.7) * 0.9) continue;
          out.push([p, BREATH[Math.min(3, Math.floor((u / 0.7) * 4))], u < 0.3 ? 2 : 1]);
        }
      }
    }
  }
  // (the landing: a ring of stone, grit and frost thrown up and out, falling; dust rolling out low behind it)
  const at: V3 = [(SOLE0[0][0] + SOLE0[1][0]) / 2, 0, 0];
  const u0 = t - STOMP.hit;
  if (u0 > 0 && u0 < 0.9) {
    for (let i = 0; i < 48; i++) {
      const u = u0 - 0.01 * (i % 3);
      if (u <= 0) continue;
      const a = (i / 48) * TAU + 0.3 * hash(i, 1, 8954);
      const sp = (50 + 90 * hash(i, 2, 8955)) * S;
      const p: V3 = [at[0] + Math.cos(a) * (4 * S + sp * u), at[1] + Math.sin(a) * (4 * S + sp * u) * 0.9, 0.5 + (24 + 40 * hash(i, 3, 8956)) * S * u - 0.5 * g * S * u * u];
      if (p[2] < 0 || hash(i, Math.floor(u * 30), 8957) < (u / 0.9) * 0.85) continue;
      const big = i % 5 === 0 && u < 0.35;
      out.push([p, i % 4 === 0 ? BREATH[1] : big ? SLATE[2] : DUST[Math.min(2, Math.floor((u / 0.9) * 3))], big ? 2 : 1]);
    }
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * TAU;
      const rr = (5 + 70 * Math.sqrt(u0)) * S * (0.85 + 0.3 * hash(i, 4, 8958));
      if (hash(i, Math.floor(u0 * 20), 8959) < (u0 / 0.9) * 0.9) continue;
      out.push([[at[0] + Math.cos(a) * rr, at[1] + Math.sin(a) * rr * 0.9, 1 + 3 * S * u0], DUST[1 + (i % 2)], 1]);
    }
  }
  return out;
}

// =============================================================================================
// THE BOAR'S DEATH AND HIS RISING (his pick, 12 Nov 2026: “Crashes onto its side (Recommended)”, offered as: killed mid-charge, it
// ploughs on, flips onto its side and skids to a stop in frost, its runes going out; his fight: “I want two phases, one saddled,
// then another after the boar dies”; thrown clear, he lands on his feet, never on his knees: “Remember we’re trying to stay away
// from “falling to their knees””; and his words as it was made, 12 Nov 2026: “make sure you follow the rules, make it badass, i
// want to be nervous that hes now on foot”, “figure out a way for the boar to leave the arena so hes not just there for the rest of
// the fight.  like he turns to ash after the rune power seeps out of him”). By his Movement 9 and his Monsters rules:
//   KILLED       mid-gallop down its lane: a flash of his pink out of all of it at once; its front gives way, its head driven
//                down into the floor, its legs gone slack
//   PLOUGHING    on with all its weight, nose down, and over onto its side (its left: its belly and its legs to the side it is seen
//                from), the floor coming up to meet it, dust and frost thrown out where it hits; on its side, sliding on down its
//                lane in a spray of frost and grit, slowing, stopped; a last kick of its hind legs
//   HIM THROWN   up out of the saddle as it goes over, on over its head, his cloak streaming, his staff held high; down ON HIS
//                FEET well clear of it, crouched deep, his boots sliding on in the frost; held there, his head turned back over
//                his shoulder to it (his line for his steed is the sound chat's)
//   ITS POWER    its runes go out one after another, each flickering and gone, and the power that burned in each SEEPS OUT OF IT
//                and streams through the air INTO HIM, a ribbon of his pink; as it goes, the boar greys to ash; he burns
//                brighter with each, his eyes blazing, the air crackling round him
//   HE RISES     tall, slowly, his head coming round to the hero; his staff thrust high over his head, his rune blazing in its ring,
//                the room's light drawn into it; then THE SLAM: the staff driven down into the floor, a lightning strike of two
//                frames, smeared; a ring of his pink rolls out across the whole floor, cracks thrown out under it; where it meets
//                the boar the ash of it bursts and blows away, nothing left but a scorch on the floor
//   ON FOOT      he stands over the place, hunched forward like something hunting, his staff planted, his writing hand clawed out
//                before him, his runes burning brighter than they ever did in the saddle: the second phase begins.
export const FALL = {
  /** where in the charge it is killed (the charge's own time: flat out down its lane), and how long its gallop goes on before */
  from: CHARGE_STRIKE[1] + 0.3,
  kill: 0.3,
  /** after the kill: its slide (to a stop), its roll onto its side; its last kick */
  skid: 0.62,
  roll: [0.08, 0.5] as const,
  kick: 1.3,
  /** its runes going out, the power of each streaming into him (each this long in the air); it greying to ash */
  out: [1.35, 2.65] as const,
  stream: 0.42,
  grey: [1.45, 2.85] as const,
  /** him (after the kill): thrown, flying, sliding on his feet */
  throw: 0.12,
  fly: 0.5,
  slide: 0.28,
  /** him (the move's own time): looking back at it, rising, his staff raised; the slam (its strike), its ring's reach (tiles) and how long it rolls */
  look: [1.3, 1.95] as const,
  rise: [1.95, 2.55] as const,
  raise: [2.5, 2.9] as const,
  slam: 92 / 30,
  ring: { reach: 4.6, long: 0.62 },
  /** his shade tearing up out of him as he strikes (the move's own time), risen */
  shade: [3.15, 4.05] as const,
  long: 5.4,
};
export const SLAM_STRIKE = [FALL.slam - 2 / 30, FALL.slam] as const;
export const slamSmeared = (t: number): boolean => t > SLAM_STRIKE[0] + 1e-6 && t <= SLAM_STRIKE[1] + 1 / 30 + 1e-6;
/** How far the game has carried it down its lane, `t` seconds into its death (tiles): its gallop, then slowing to nothing. */
export function fallCarry(t: number): number {
  const c0 = chargeCarry(FALL.from);
  if (t <= FALL.kill) return chargeCarry(FALL.from + t) - c0;
  const ck = chargeCarry(FALL.from + FALL.kill) - c0;
  const u = Math.min(FALL.skid, t - FALL.kill);
  return ck + CHARGE.pace * (u - (u * u) / (2 * FALL.skid));
}
/** How low it reaches (the floor's height of its lowest point, its body's and its head's, standing where it is, at z 0). */
function lowestOf(P: BoarPose): number {
  let lo = Infinity;
  for (const l of boarLumps(P)) lo = Math.min(lo, l.c[2] - Math.hypot(l.ax[0][2], l.ax[1][2], l.ax[2][2]));
  const H = headOf(P);
  for (const [f, o, u, r] of [[2.4, 0, 0.8, 6.6], [11, 0, -8.6, 4.8], [14, 0, -5.4, 4.6], [21.4, 0, -7.6, 3.0]] as const) lo = Math.min(lo, H.at(f, o, u)[2] - r * S);
  return lo;
}
/** Its feet as it is killed (the gallop's), and its legs slack: stiff and splayed, the upper pair (its right) one way and the pair
 * under it the other, so they read as legs and not a heap. */
const KILL_FEET = (): Foot[] => chargeFeet(FALL.from + FALL.kill);
const SLACK_LEGS: BoarPose['legs'] = [[22, -8], [44, -16], [-14, 12], [-38, 22]];
/** Where the ring reaches its middle and when (from where his staff strikes the floor): how far it has rolled, `t` into the move. */
export function slamRing(t: number): number {
  const u = (t - FALL.slam) / FALL.ring.long;
  return u <= 0 ? 0 : FALL.ring.reach * TILE * Math.min(1, 1 - (1 - u) * (1 - u));
}
/** When the ring meets the boar's ash and blows it away. */
const ASH_BLOWN = (): number => {
  const d = Math.hypot(slamAt()[0] - 6 * S, slamAt()[1]) - 18 * S;
  let t = FALL.slam;
  while (slamRing(t) < d && t < FALL.slam + FALL.ring.long) t += 1 / 120;
  return t;
};
let ASH_AT: number | null = null;
const ashBlownAt = (): number => (ASH_AT ??= ASH_BLOWN());
export function fallPoseAt(t: number): BoarPose {
  const K = FALL.kill;
  const g = chargePoseAt(FALL.from + Math.min(t, K));
  if (t <= K) return g;
  const u = t - K;
  // (its front gives way, its head driven down; its legs gone slack; over onto its side, rocking back a little as it lands on it)
  const buckle = smooth01(u / 0.16);
  const rl = smooth01((u - FALL.roll[0]) / (FALL.roll[1] - FALL.roll[0]));
  const rock = bumpOf(u, FALL.roll[1] - 0.05, FALL.roll[1] + 0.3);
  const kick = bumpOf(t, FALL.kick, FALL.kick + 0.32);
  const slide = clamp01(u / FALL.skid);
  const legs: BoarPose['legs'] = [
    [SLACK_LEGS[0][0], SLACK_LEGS[0][1]],
    [SLACK_LEGS[1][0], SLACK_LEGS[1][1]],
    [SLACK_LEGS[2][0] - 30 * kick, SLACK_LEGS[2][1] - 26 * kick],
    [SLACK_LEGS[3][0] - 22 * kick, SLACK_LEGS[3][1] - 18 * kick],
  ];
  // (him: the wind of his flight in his cloak; flung forward as he lands; still, crouched and risen; blown back by his own slam;
  // and his power growing in him as its runes stream into him, at its height as he strikes)
  const T0 = K + FALL.throw;
  const land = T0 + FALL.fly;
  const flying = t > T0 && t < land ? 1 : 0;
  const arrived = RUNE_TIMES.filter((w) => t > w + FALL.stream).length / RUNE_TIMES.length;
  const P: BoarPose = {
    ...g,
    z: 0,
    pitch: g.pitch * (1 - buckle) - 15 * buckle * (1 - rl) - 2 * rl,
    roll: -90 * rl + 6 * rock,
    low: g.low * (1 - buckle) + 30 * buckle * (1 - rl) + 10 * rl,
    look: -8 * rl,
    tilt: -12 * rl,
    flap: (g.flap ?? 0) * (1 - buckle) + 1.2 * buckle * (1 - slide) * Math.sin(u * 30),
    legs,
    feet: KILL_FEET(),
    limp: smooth01(u / 0.22),
    breath: 0.5 * (1 - smooth01(u / 0.4)),
    sway: g.sway + 0.2 * (1 - slide) * Math.sin(u * 14),
    // (the kill: his pink flaring out of it all at once; then smouldering low until its runes go out)
    pulse: u < 0.1 ? 1 : 0.25 + 0.75 * (1 - smooth01((u - 0.1) / 0.5)),
    dead: clamp01((t - FALL.out[0]) / (FALL.out[1] - FALL.out[0])),
    free: smooth01((u - FALL.throw) / 0.25),
    ash: smooth01((t - FALL.grey[0]) / (FALL.grey[1] - FALL.grey[0])),
    crumble: t > FALL.slam ? smooth01((t - ashBlownAt()) / 0.4) : 0,
    ride: t <= T0
      ? { lean: 26 + 22 * bumpOf(u, 0, 2 * FALL.throw), brace: 0 }
      : { lean: 22 * flying + 18 * bumpOf(t, FALL.slam, FALL.slam + 0.5), brace: 10 * bumpOf(t, land - 0.02, land + 0.3), still: !flying && t > land + 0.3 && t < FALL.slam, surge: Math.min(1, 0.15 * smooth01((t - land) / 0.4) + 0.75 * arrived + 0.4 * bumpOf(t, FALL.raise[0], FALL.slam + 0.25)) },
  };
  // (down: falling as its legs go, and on the floor once it is there, rolling over on it)
  const floor = 1.4 - lowestOf(P);
  const fall = g.z - 0.5 * 900 * u * u;
  return { ...P, z: Math.max(floor, fall) };
}
/** When each rune of it goes out, and its power leaves it for him (the move's own time). */
const RUNE_TIMES = Object.values(RUNES_OUT).map((w) => FALL.out[0] + w * (FALL.out[1] - FALL.out[0]));
/** Where its runes are as it lies (as its own points are): the brand on its flank, its armour's, its greaves', its tusks', its eyes. */
function runeSpots(near: number): [number, V3][] {
  const R = fallPoseAt(FALL.out[0]);
  const H = headOf(R);
  return [
    [RUNE_TIMES[0], boarAt(R, [-6, near * 9.95, 25.5])],
    [RUNE_TIMES[1], boarAt(R, [13.5, near * 10.6, 27])],
    [RUNE_TIMES[1] + 0.05, boarAt(R, [-19, 0, 31])],
    [RUNE_TIMES[2], boarAt(R, [10, near * 6, 10])],
    [RUNE_TIMES[3], H.at(15, near * 6, -10)],
    [RUNE_TIMES[4], H.at(8.8, near * 5.0, -1.0)],
  ];
}
/** WHAT FLIES OFF IT AS IT DIES, carried as the charge's are (what is thrown stays where it was thrown): its gallop's grit before;
 * a burst of dust and frost where it hits the floor; frost and grit sprayed out ahead of it as it slides on its side; frost thrown
 * up from his boots as he lands sliding; the power of each rune as it goes out, streaming through the air into him; sparks and
 * stone thrown up where his staff strikes; its ash bursting and blown away as his ring meets it. */
function fallGrains(t: number, near: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const K = FALL.kill;
  if (t < K) return chargeGrains(FALL.from + t);
  const c = fallCarry(t) * TILE;
  const G = 30 * S;
  const FROSTED = ['#eef4fa', '#c4d4e4', '#93a8c0'] as const;
  const ASHES = ['#cfc8c6', '#a8a0a2', '#847c80', '#5e585c'] as const;
  const fly = (p0: V3, v: V3, t0: number, seed: number, long: number, cols: readonly string[], g = G): void => {
    const u = t - t0;
    if (u <= 0 || u > long) return;
    const p: V3 = [p0[0] + v[0] * u - c, p0[1] + v[1] * u, p0[2] + v[2] * u - 0.5 * g * u * u];
    if (p[2] < 0) return;
    if (hash(seed, Math.floor(u * 30), 8971) < (u / long) * 0.8) return;
    out.push([p, cols[Math.min(cols.length - 1, Math.floor((u / long) * cols.length))], u < 0.1 && seed % 3 === 0 ? 2 : 1]);
  };
  // (where it hits the floor: dust and frost thrown out all round its front)
  const hit = K + 0.2;
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * TAU;
    const at = add(boarAt(fallPoseAt(hit), [12, 0, 14]), [fallCarry(hit) * TILE, 0, -10]);
    const sp = (28 + 40 * hash(i, 1, 8972)) * S;
    fly([at[0], at[1], 1], [Math.cos(a) * sp + 160 * S, Math.sin(a) * sp, (14 + 22 * hash(i, 2, 8973)) * S], hit, i, 0.7, i % 3 ? FROSTED : DUST);
  }
  // (on its side, sliding: frost and grit sprayed out ahead of it and off its side, every few frames)
  for (let e = 0; e < 20; e++) {
    const te = K + 0.22 + e * 0.02;
    if (te > K + FALL.skid) break;
    const ce = fallCarry(te) * TILE;
    const speed = CHARGE.pace * TILE * (1 - (te - K) / FALL.skid);
    for (let j = 0; j < 4; j++) {
      const sd = e * 7 + j;
      const p0: V3 = [ce + (18 + 14 * hash(sd, 1, 8974)) * S, (hash(sd, 2, 8975) - 0.5) * 22 * S, 1];
      fly(p0, [speed * (0.9 + 0.4 * hash(sd, 3, 8976)), (hash(sd, 4, 8977) - 0.5) * 70 * S, (10 + 18 * hash(sd, 5, 8978)) * S], te, 100 + sd, 0.5, j % 2 ? FROSTED : DUST);
    }
  }
  // (his boots sliding on as he lands: frost thrown up off them)
  const land = K + FALL.throw + FALL.fly;
  for (let e = 0; e < 10; e++) {
    const te = land + e * 0.03;
    if (te > land + FALL.slide) break;
    const b = fallRiderAt(te);
    const ce = fallCarry(te) * TILE;
    for (const [side, f] of [[1, b.footL], [-1, b.footR]] as const) {
      for (let j = 0; j < 3; j++) {
        const sd = 300 + e * 9 + j * 3 + (side > 0 ? 1 : 0);
        fly([f[0] + ce + 3, f[1], 1], [(60 + 80 * hash(sd, 1, 8982)) * S * (1 - e / 10), side * (12 + 30 * hash(sd, 2, 8983)) * S, (8 + 14 * hash(sd, 3, 8984)) * S], te, sd, 0.45, FROSTED);
      }
    }
  }
  // (ITS POWER SEEPING OUT OF IT INTO HIM: as each rune goes out, a ribbon of his pink rises off it and streams through the air,
  // arcing, into his chest; tiny runes blinking off its tail)
  for (const [k, [t0, from]] of runeSpots(near).entries()) {
    const u = (t - t0) / FALL.stream;
    if (u <= 0 || u > 1.25) continue;
    const b = fallRiderAt(t);
    const to = add(b.pelvis, [1, 0, 17]);
    const mid = add(lerp3(from, to, 0.5), [0, (k % 2 ? 1 : -1) * 14, 34 + 8 * (k % 3)]);
    const along = (v: number): V3 => { const q = Math.max(0, Math.min(1, v)); return add(add(mul(from, (1 - q) * (1 - q)), mul(mid, 2 * q * (1 - q))), mul(to, q * q)); };
    for (let i = 0; i < 22; i++) {
      const v = u * u - i * 0.032;
      if (v <= 0 || v > 1) continue;
      const p = along(v);
      const wob: V3 = [Math.sin(t * 40 + i) * 1.2, Math.cos(t * 33 + i * 1.7) * 1.2, Math.sin(t * 27 + i * 0.9) * 1.2];
      out.push([add(p, wob), i < 2 ? BURN[4] : i < 8 ? BURN[3] : BURN[2], i < 10 ? 2 : 1]);
      if (i % 3 === 1) out.push([add(p, [-wob[1], wob[0], 2.2]), BURN[3], 1]);
    }
    // (off its tail, tiny runes blinking out where it left it)
    for (let i = 0; i < 6; i++) {
      const w = t - t0 - 0.04 * i;
      if (w <= 0 || w > 0.6 || hash(k * 13 + i, Math.floor(w * 15), 8979) < w / 0.6) continue;
      const a = hash(k, i, 8980) * TAU;
      out.push([[from[0] + Math.cos(a) * (2 + 5 * w) * S, from[1] + Math.sin(a) * (2 + 5 * w) * S, from[2] + (2 + 10 * w) * S], i % 2 ? BURN[3] : BURN[2], 1]);
    }
  }
  // (as it greys, ash already lifting off it in flakes, drifting)
  const R = fallPoseAt(FALL.out[1]);
  for (let i = 0; i < 30; i++) {
    const te = FALL.grey[0] + (FALL.grey[1] - FALL.grey[0] + 0.3) * hash(i, 1, 8990);
    const p0 = boarAt(R, [-20 + 40 * hash(i, 2, 8991), (hash(i, 3, 8992) - 0.5) * 16, 22 + 14 * hash(i, 4, 8993)]);
    fly([p0[0] + c, p0[1], p0[2]], [(-8 + 16 * hash(i, 5, 8994)) * S, (-6 + 12 * hash(i, 6, 8995)) * S, (6 + 6 * hash(i, 7, 8996)) * S], te, 500 + i, 1.4, ASHES, 2 * S);
  }
  // (THE SLAM: sparks of his pink and chips of stone thrown up all round where his staff strikes)
  const at = slamAt();
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * TAU + hash(i, 1, 8997);
    const sp = (30 + 60 * hash(i, 2, 8998)) * S;
    fly([at[0] + c, at[1], 1], [Math.cos(a) * sp, Math.sin(a) * sp, (20 + 34 * hash(i, 3, 8999)) * S], FALL.slam, 700 + i, 0.6, i % 3 ? [BURN[4], BURN[3], BURN[2]] : DUST);
  }
  // (ITS ASH, BURST AND BLOWN AWAY as his ring meets it: the whole of it, from its top down, flung out away from him, rising,
  // thinning to nothing)
  const t1 = ashBlownAt();
  for (let i = 0; i < 160; i++) {
    const h = hash(i, 4, 9001);
    const p0 = boarAt(R, [-24 + 46 * hash(i, 5, 9002), (hash(i, 6, 9003) - 0.5) * 18, 15 + 22 * h]);
    const away = norm([p0[0] - at[0], p0[1] - at[1], 0], [-1, 0, 0]);
    const sp = (40 + 70 * hash(i, 7, 9004)) * S;
    // (its top first)
    const te = t1 + 0.35 * (1 - (p0[2] - 10) / 40) * hash(i, 8, 9005) + 0.1 * (1 - h);
    fly([p0[0] + c, p0[1], p0[2]], [away[0] * sp, away[1] * sp, (10 + 26 * hash(i, 9, 9006)) * S], te, 900 + i, 0.9 + 0.5 * hash(i, 10, 9007), ASHES, 4 * S);
  }
  return out;
}
/** Where his staff strikes the floor (as the boar's own points are, the floor point under it: the carry is done by then). */
let SLAM_AT: V3 | null = null;
export function slamAt(): V3 {
  if (SLAM_AT) return SLAM_AT;
  const s = solve(B, { ...standing(B), ...fallRider(FALL.slam) } as never);
  const f = staffOf(s, 0, true).foot;
  return (SLAM_AT = [f[0], f[1], 0]);
}
/** HIM THROWN CLEAR AND DOWN ON HIS FEET (as the boar's own points are, the floor point under it): where his pelvis is, and his feet
 * (each ankle), `t` seconds into its death, once he has left the saddle. */
function fallRiderAt(t: number): { pelvis: V3; footL: V3; footR: V3 } {
  const T0 = FALL.kill + FALL.throw;
  const R0 = { ...standing(B), ...riderPose(fallPoseAt(T0), T0) } as Bones;
  const c = (tt: number): number => fallCarry(tt) * TILE;
  // (where he leaves the saddle from, on the floor's own place)
  const x0 = R0.px + c(T0), y0 = R0.py, z0 = R0.pz + PELVIS0;
  const vx = CHARGE.pace * TILE;
  const vz = 150;
  const zl = PELVIS0 - 13;
  const tf = FALL.fly;
  const g = (2 * (z0 + vz * tf - zl)) / (tf * tf);
  const u = Math.max(0, t - T0);
  const side = 22;
  const ankL0: V3 = [R0.lfx, R0.lfy + B.stance, R0.lfz + B.ankle];
  const ankR0: V3 = [R0.rfx, R0.rfy - B.stance, R0.rfz + B.ankle];
  if (u < tf) {
    // (flying: on at the gallop's pace, slowing; up, then down; his feet drawn up under him, then reaching for where they will come
    // down, never through the floor)
    const wx = x0 + vx * (u - (0.2 * u * u) / tf);
    const wy = y0 + side * smooth01(u / tf);
    const wz = z0 + vz * u - 0.5 * g * u * u;
    const pel: V3 = [wx - c(t), wy, wz];
    // (his legs go up with him still astride, out past its flanks, till he is clear of it; then drawn up under him)
    const pel0: V3 = [x0 - c(T0), y0, z0];
    const tuck = smooth01((u - 0.12) / 0.16);
    const reach = smooth01((u - 0.6 * tf) / (0.4 * tf));
    const rel = (L: boolean): V3 => add(mul(L ? [-3, 5, -17] : [-5, -5, -15], 1 - reach), mul(L ? [7, 5, -28.5] : [-5, -5, -28], reach));
    const onFloor = (p: V3): V3 => [p[0], p[1], Math.max(B.ankle + 0.4, p[2])];
    return { pelvis: pel, footL: onFloor(lerp3(add(ankL0, sub(pel, pel0)), add(pel, rel(true)), tuck)), footR: onFloor(lerp3(add(ankR0, sub(pel, pel0)), add(pel, rel(false)), tuck)) };
  }
  // (down: his boots on the floor and sliding on in the frost, slowing; his landing taken in his knees, deep, and held; then risen,
  // driven down into his knees by his slam, and standing low over it, breathing)
  const xl = x0 + vx * (tf - 0.2 * tf);
  const v1 = vx * 0.6;
  const w = u - tf;
  const ws = Math.min(w, FALL.slide);
  const wx = xl + v1 * (ws - (ws * ws) / (2 * FALL.slide));
  const vl = vz - g * tf;
  const give = vl * w * Math.exp(-w / 0.05);
  const risen = smooth01((t - FALL.rise[0]) / (FALL.rise[1] - FALL.rise[0]));
  const up = 1.5 * smooth01((t - FALL.raise[0]) / (FALL.raise[1] - FALL.raise[0]));
  const slam = t < FALL.slam ? smooth01((t - SLAM_STRIKE[0]) / (FALL.slam - SLAM_STRIKE[0])) : 1 - 0.45 * smooth01((t - FALL.slam - 0.08) / 0.6);
  const breath = smooth01((t - FALL.slam - 0.3) / 0.4) * 0.7 * Math.sin((t - FALL.slam) * 3.4);
  const pz = zl + give + (PELVIS0 - zl) * risen + up * (1 - slam) - 8 * slam + breath;
  const wy = y0 + side;
  return { pelvis: [wx - c(t), wy, pz], footL: [wx + 7 - c(t), wy + 5, B.ankle], footR: [wx - 5 - c(t), wy - 5, B.ankle] };
}
/** His pose through it: in the saddle, jolted forward as it is killed; then thrown, flying, landing, looking back, risen, his staff
 * raised, the slam, standing over it (his bones). */
export function fallRider(t: number): Partial<Bones> {
  const T0 = FALL.kill + FALL.throw;
  if (t <= T0) return riderPose(fallPoseAt(t), t);
  const R0 = { ...standing(B), ...riderPose(fallPoseAt(T0), T0) } as Bones;
  const b = fallRiderAt(t);
  const u = t - T0;
  const tf = FALL.fly;
  const fl = Math.sin(Math.PI * clamp01(u / tf));
  const reach = smooth01((u - 0.6 * tf) / (0.4 * tf));
  type Look = { pitch: number; roll: number; twist: number; bend: number; hunch: number; faceTurn: number; faceUp: number; faceTilt: number; lfp: number; lft: number; rft: number; lk: number; rk: number; lkUp: number; lhx: number; lhy: number; lhz: number; le: number; rhx: number; rhy: number; rhz: number; re: number };
  const SEAT: Look = { pitch: R0.pitch, roll: R0.roll, twist: R0.twist, bend: R0.bend, hunch: R0.hunch ?? 5, faceTurn: R0.faceTurn, faceUp: R0.faceUp, faceTilt: R0.faceTilt, lfp: R0.lfp, lft: R0.lft, rft: R0.rft, lk: R0.lk, rk: R0.rk, lkUp: R0.lkUp, lhx: R0.lhx, lhy: R0.lhy, lhz: R0.lhz, le: R0.le, rhx: R0.rhx, rhy: R0.rhy, rhz: R0.rhz, re: R0.re };
  // (thrown: tipped forward and tucked, his left arm flung out for his balance, his staff high)
  const FLY: Look = { pitch: 12 + 14 * fl, roll: 6 * fl, twist: 0, bend: 10, hunch: 8, faceTurn: 0, faceUp: 8, faceTilt: 4, lfp: 30 * (1 - reach), lft: 10, rft: -10, lk: 12, rk: -12, lkUp: 20, lhx: 3, lhy: 15, lhz: 7, le: 30, rhx: 3, rhy: -10, rhz: 15, re: 20 };
  // (landed: crouched deep over his knees, his left hand out behind him low, his staff up)
  const LAND: Look = { ...FLY, pitch: 20, roll: 0, twist: 4, bend: 18, hunch: 10, faceTurn: -4, faceUp: 20, faceTilt: 0, lfp: 0, lft: 12, rft: -14, lk: 16, rk: -16, lkUp: 4, lhx: -3, lhy: 13, lhz: -7, le: 24, rhx: 6, rhy: -11, rhz: 6, re: 18 };
  // (looking back over his shoulder to it, still crouched: his head bowed a little)
  const LOOK: Look = { ...LAND, twist: -24, faceTurn: -80, faceUp: -4, faceTilt: -8, lhz: -9 };
  // (risen: tall, his head come round to the hero; his writing hand out before him)
  const RISEN: Look = { ...LAND, pitch: -2, twist: 0, bend: 0, hunch: 5, faceTurn: 0, faceUp: 8, faceTilt: 2, lk: 8, rk: -8, lkUp: 0, lhx: 9, lhy: 4, lhz: -8, le: -4, rhx: 1.2, rhy: -11.5, rhz: 14, re: 14 };
  // (his staff thrust high over his head, arched back, his face up to it, his left hand clawed up and wide)
  const RAISE: Look = { ...RISEN, pitch: -8, bend: -6, hunch: 0, faceUp: 24, lhx: 4, lhy: 12, lhz: 14, le: 40, rhx: 2, rhy: -6, rhz: 26, re: 30 };
  // (the slam: driven down, his staff's foot into the floor at his right side, his head up, glaring; then standing over it, hunched
  // forward like something hunting, his staff planted, his writing hand clawed out before him)
  const SLAM: Look = { ...RISEN, pitch: 16, bend: 20, hunch: 10, faceUp: 16, lhx: 7, lhy: 9, lhz: -6, le: 8, rhx: 6, rhy: -16, rhz: -9, re: 4 };
  const OVER: Look = { ...SLAM, pitch: 10, bend: 10, hunch: 14, faceUp: 14, lhx: 9, lhy: 4, lhz: -9, le: -4 };
  // (each in turn, eased; the slam itself two frames)
  const steps: [Look, number][] = [
    [FLY, smooth01(u / 0.12)],
    [LAND, smooth01((u - tf + 0.04) / 0.08)],
    [LOOK, smooth01((t - FALL.look[0]) / 0.3) * (1 - 0)],
    [RISEN, smooth01((t - FALL.rise[0]) / (FALL.rise[1] - FALL.rise[0]))],
    [RAISE, smooth01((t - FALL.raise[0]) / (FALL.raise[1] - FALL.raise[0]))],
    [SLAM, clamp01((t - SLAM_STRIKE[0]) / (FALL.slam - SLAM_STRIKE[0]))],
    [OVER, smooth01((t - FALL.slam - 0.12) / 0.6)],
  ];
  // (driving on down through the blow, his weight into it)
  const on = bumpOf(t, FALL.slam - 0.02, FALL.slam + 0.42);
  const L: Look = { ...SEAT };
  for (const [to, f] of steps) for (const k of Object.keys(L) as (keyof Look)[]) L[k] += (to[k] - L[k]) * f;
  L.rhz -= 6 * on;
  L.pitch += 5 * on;
  // (his staff planted after the slam: its foot kept on the floor)
  return {
    px: b.pelvis[0], py: b.pelvis[1], pz: b.pelvis[2] - PELVIS0 - 6 * on,
    yaw: 0, pitch: L.pitch, roll: L.roll, twist: L.twist, bend: L.bend, side: 0, hunch: L.hunch,
    faceTurn: L.faceTurn, faceUp: L.faceUp, faceTilt: L.faceTilt,
    lfx: b.footL[0], lfy: b.footL[1] - B.stance, lfz: b.footL[2] - B.ankle,
    rfx: b.footR[0], rfy: b.footR[1] + B.stance, rfz: b.footR[2] - B.ankle,
    lfp: L.lfp, rfp: L.lfp, lft: L.lft, rft: L.rft, lk: L.lk, rk: L.rk, lkUp: L.lkUp, rkUp: L.lkUp,
    lhIn: 1, lhx: L.lhx, lhy: L.lhy, lhz: L.lhz + (t > FALL.slam ? 1.2 * Math.sin(t * 4) : 0), le: L.le,
    rhIn: 1, rhx: L.rhx, rhy: L.rhy, rhz: L.rhz, re: L.re,
    out: 0,
  } as Partial<Bones>;
}
/** Its death as a move: his bones, every frame (30 a second). */
function fallMotion(): Motion {
  const keys: Key3[] = [];
  const N = Math.round(FALL.long * 30);
  for (let i = 0; i <= N; i++) keys.push({ at: i / 30, ease: 'lin', pose: fallRider(i / 30) });
  return { keys, hit: FALL.slam };
}
/** His boots, down on the floor (as his skeleton has them), once he has landed. */
export const fallLanded = (t: number): boolean => t >= FALL.kill + FALL.throw + FALL.fly - 1e-6;

/** How far his staff is brought down forward (degrees): as far as he hammers with it. */
const staffTiltOf = (P: BoarPose): number => 64 * (P.ride?.cast?.hammer ?? 0);

// =============================================================================================
// HIS WORDS FROM THE SADDLE (his picks, 12 Nov 2026: each damage word its own attack, “Own colour, pink through it (Recommended)”)
//
// POWER: THE HAMMER FROM THE SKY (“Hammer from the sky (Recommended)”, offered as: a giant Power rune forms high over you, its shadow
// chasing you across the floor, then slams down three times in a row: craters, shockwaves, stone flying). By his Movement 9:
//   HE WRITES IT  his left hand claws the rune's strokes on the air, burning red with pink through them; he thrusts his staff up and
//                 it flies up off its ring into the sky
//   IT HANGS      high over the hero, its shadow on the floor chasing the hero (where it falls is the rules', the main chat's: the
//                 film follows the hero a beat behind); A GREAT HAMMER MATERIALIZES OUT OF IT (his words, 12 Nov 2026: “I want him to
//                 form the rune, then a big hammer materializes from the rune and slams down”), of the same red with his pink through
//                 it, raised back up over the rune
//   THREE BLOWS   each: he raises his staff high, HELD; in two frames he hammers it down forward, his hips first, and the hammer
//                 swings down out of the sky in the same two frames onto the rune's shadow: a crater, a ring of force, stone flying,
//                 the screen kicked; it is heaved back up for the next. After the third, hammer and rune burst into shards.
export const POWER = { write: [0.12, 0.7] as const, cast: 0.74, slams: [fr(42), fr(62), fr(81)] as const, raise: 0.42, back: 0.32, long: 3.4, high: 3.0 };
/** Each blow's strike: two frames, to the moment it lands. */
export const POWER_STRIKES = POWER.slams.map((h) => [h - 2 * FR, h] as const);
export const powerSmeared = (t: number): boolean => POWER_STRIKES.some(([a, b]) => t > a + 1e-6 && t <= b + FR + 1e-6);
/** His staff through the three blows: raised and held before each, hammered down in two frames, carried on a little, brought back. */
function powerCast(t: number): Cast {
  let raise = 0;
  let hammer = 0;
  let lead = 0;
  // (thrust up as the rune flies off it)
  raise = Math.max(raise, smooth01((t - (POWER.cast - 0.3)) / 0.25) * (t < POWER.slams[0] ? 1 : 0));
  for (const h of POWER.slams) {
    const s0 = h - 2 * FR;
    if (t > h - POWER.raise && t <= s0) raise = Math.max(raise, smooth01((t - (h - POWER.raise)) / (POWER.raise - 0.14)));
    if (t > s0 && t <= h) {
      const u = (t - s0) / (h - s0);
      raise = Math.max(raise, 1 - u);
      hammer = Math.max(hammer, u);
    }
    if (t > h && t < h + POWER.back) {
      const u = (t - h) / POWER.back;
      hammer = Math.max(hammer, u < 0.25 ? 1 + 0.15 * Math.sin((Math.PI / 2) * (u / 0.25)) : 1.15 * (1 - smooth01((u - 0.25) / 0.75)));
    }
    // (his hips into it first: from just before the strike)
    lead = Math.max(lead, bumpOf(t, s0 - 0.08, h + 0.25));
  }
  const write = bumpOf(t, POWER.write[0] - 0.05, POWER.write[1] + 0.1);
  return { raise, hammer, write, stroke: (t - POWER.write[0]) * TAU * 2.2, lead };
}
export function powerPoseAt(t: number): BoarPose {
  const P = boarPoseAt('stand', t);
  // (the boar under him braced, its eyes and runes flaring at each blow)
  let flare = 0;
  for (const h of POWER.slams) flare = Math.max(flare, bumpOf(t, h - 0.05, h + 0.5));
  return { ...P, pulse: Math.max(P.pulse ?? 0, 0.6 * smooth01(t / 0.6), flare), ride: { lean: 0, brace: 0, still: true, cast: powerCast(t) } };
}
/** Where the rune is over its shadow (its own lengths above the floor), how much of it has formed, and how far it has burst, `t`
 * seconds into the move: it flies up off his staff and forms high over the hero, and hangs there while its hammer swings; it bursts
 * with the hammer after the last blow. */
export function powerRuneAt(t: number): { up: number; formed: number; gone: number } {
  const formed = smooth01((t - POWER.cast) / 0.35);
  const gone = smooth01((t - POWER.slams[2] - 0.12) / 0.3);
  return { up: POWER.high * TILE, formed, gone };
}
/** THE HAMMER OUT OF THE RUNE (his words, 12 Nov 2026: “I want him to form the rune, then a big hammer materializes from the rune and
 * slams down”): how much of it has come out of the rune (0 ... 1), and its swing (degrees from hanging straight down from the rune:
 * raised back up over it, -165, held; swung down onto the floor in each strike's two frames; heaved back up for the next), `t`
 * seconds into the move. Its head comes down on the rune's shadow. */
export function powerHammerAt(t: number): { formed: number; swing: number; gone: number } {
  const formed = smooth01((t - POWER.cast - 0.25) / 0.4);
  const UP = -165;
  let swing = UP;
  for (const [s0, h] of POWER_STRIKES) {
    if (t > s0 && t <= h) swing = UP * (1 - (t - s0) / (h - s0));
    else if (t > h && t < h + 0.55) {
      const u = (t - h) / 0.55;
      // (it lies a moment where it struck, then is heaved back up for the next)
      swing = u < 0.25 ? 0 : UP * smooth01((u - 0.25) / 0.75);
    }
  }
  return { formed, swing, gone: smooth01((t - POWER.slams[2] - 0.12) / 0.3) };
}
// THE HAMMER (his words, 12 Nov 2026: “I want him to form the rune, then a big hammer materializes from the rune and slams down”;
// “I want the runes to create something, not use the rune itself”; and of the first try, “A poorly drawn flat 2D hammer swinging on a
// hinge from the rune I specifically said I didn't want in the spell”). So: the rune he flings bursts over the hero, and out of the
// burst a great war hammer forms, made of solids as he is: a heavy barrel of a head banded in darker iron, its faces rimmed, cracks
// down it burning with his pink, a long haft, a pommel; Power's own red, his pink through it, crackling. No hand holds it: it hangs
// head down over the hero, its haft straight up, and is crushed straight down head first by his power (his words: “Don’t have it
// swing, have it crush straight down, top of the hammer first”). Its points are as the floor's, the place it strikes at nothing.
const HAMMER_RED: Ramp = ['#2a0610', '#6e1020', '#a81c2c', '#e03c44', '#ff8a80'];
const HAMMER_IRON: Ramp = ['#140408', '#2a0610', '#4a0c18', '#7a1a2a', '#a8343e'];
const HAMMER_HAFT: Ramp = ['#1a0610', '#3a0a12', '#5e1222', '#8a1e2e', '#b83a46'];
export const HAMMER_CANVAS: MobCanvas = { w: 340, h: 440, ax: 170, ay: 380 };
/** Its grip and the way its haft runs from the grip to the head's middle (degrees from straight down), as it comes down: 0 raised
 * high over the place it strikes, 1 struck. It hangs head down, its haft straight up, and is crushed straight down head first (his
 * words, 12 Nov 2026: “Don’t have it swing, have it crush straight down, top of the hammer first”), a little tilt as it trembles. */
function hammerHold(k: number, t: number): { grip: V3; ang: number } {
  const R = 84;
  const up = 128 + 5 * Math.sin(t * 3.1);
  const z = up + (25 - up) * k;
  const tremble = (1 - k) * 2.5 * Math.sin(t * 23);
  return { grip: [0, 0, z + R], ang: tremble };
}
/** How far it has come down (0 raised ... 1 struck) `t` seconds into his Power. */
function hammerSwung(t: number): number {
  const hm = powerHammerAt(t);
  return 1 - hm.swing / -165;
}
export function powerHammerBits(t: number, put: Put): void {
  const hm = powerHammerAt(t);
  if (hm.formed <= 0 || hm.gone >= 1) return;
  const k = hammerSwung(t);
  const { grip, ang } = hammerHold(k, t);
  // (forming out of the burst: grown from small; shattering: shrunk into its sparks)
  const sc = (0.35 + 0.65 * smooth01(hm.formed)) * (1 - 0.6 * hm.gone);
  const R = 84 * sc;
  // (its head across the way it is seen, so that it is seen whole, a hammer upside down)
  // (turned a little off square to the eye, so that its top, its front and one striking face all show)
  const across = norm([1, 0.55, 0]);
  const side = norm([-0.55, 1, 0]);
  const dir: V3 = add(mul(across, Math.sin(ang * D)), [0, 0, -Math.cos(ang * D)]);
  const hx: V3 = add(mul(across, Math.cos(ang * D)), [0, 0, Math.sin(ang * D)]);
  // (it grows out of the burst about its head, where the rune burst)
  const hc = add(grip, mul(dir, 84));
  const gripS = sub(hc, mul(dir, R));
  const HL = 36 * sc;
  const HR = 25 * sc;
  const ring = (along: number, r: number) => ({ c: add(hc, mul(hx, along)), u: mul(dir, r), v: mul(side, r) });
  // (its head: a great block, each face lit as it faces the light; its long faces Power's red, banded near each end in darker iron
  // riveted down the band, cracked down the middle with his pink burning in the cracks; its striking faces dark iron, a hot pink
  // heart in each; every edge bevelled, the edges toward the light caught bright)
  const HH = HR;
  const HD = HR * 0.92;
  const box: [V3, number, V3, number, V3, number, 'long' | 'face'][] = [
    [dir, HH, hx, HL, side, HD, 'long'], [mul(dir, -1), HH, hx, HL, side, HD, 'long'],
    [side, HD, hx, HL, dir, HH, 'long'], [mul(side, -1), HD, hx, HL, dir, HH, 'long'],
    [hx, HL, side, HD, dir, HH, 'face'], [mul(hx, -1), HL, side, HD, dir, HH, 'face'],
  ];
  const crack = (a: number, b: number, seed: number): boolean => {
    // (two jagged cracks running along its middle, a branch off each)
    const f1 = 0.08 * Math.sin(a * 9 + seed) + 0.05 * Math.sin(a * 23 + seed * 2);
    const f2 = -0.42 + 0.07 * Math.sin(a * 11 + seed * 3);
    const br = Math.abs(a - 0.2 * Math.sin(seed)) < 0.22 && Math.abs(b - (f1 + (a - 0.2 * Math.sin(seed)) * 1.6)) < 0.05;
    return (Math.abs(b - f1) < 0.045 && Math.abs(a) < 0.62) || (Math.abs(b - f2) < 0.035 && Math.abs(a + 0.1) < 0.35) || br;
  };
  box.forEach(([n, hn, u, hu, v, hv, kind], fi) => {
    put('hammerHead', 'head', {
      k: 'panel', c: add(hc, mul(n, hn)), u: mul(u, hu), v: mul(v, hv),
      // (each face drawn both ways round: the nearer face hides the farther, as its depth says)
      skin: (a0, b0, _front, tone0) => {
        // (where on the face, as a share of its half-sizes; never darker than its second tone, so its shadowed faces still read)
        const a = a0 / hu, b = b0 / hv;
        const tone = Math.max(1, tone0);
        const edgeA = Math.abs(a) > 0.95, edgeB = Math.abs(b) > 0.93;
        const lit = tone >= 3;
        if (kind === 'face') {
          const r = Math.hypot(a, b);
          if (edgeA || edgeB) return HAMMER_IRON[T5(tone + (lit ? 1 : -1))];
          if (r < 0.32) return r < 0.16 ? FLAME[3] : FLAME[2];
          if (r < 0.42) return HAMMER_IRON[T5(tone - 1)];
          return HAMMER_IRON[T5(tone)];
        }
        if (edgeA || edgeB) return (edgeB ? b > 0 : a < 0) && lit ? HAMMER_RED[4] : HAMMER_RED[T5(tone - 1)];
        // (its iron bands near each end, riveted)
        if (Math.abs(a) > 0.66 && Math.abs(a) < 0.86) {
          const mid = Math.abs(Math.abs(a) - 0.76) < 0.035 && Math.abs((b * 4) % 1) < 0.2;
          return mid ? HAMMER_IRON[4] : HAMMER_IRON[T5(tone)];
        }
        if (crack(a, b, fi * 1.7)) return Math.abs(a) < 0.3 ? FLAME[3] : FLAME[2];
        return HAMMER_RED[T5(tone)];
      },
    });
  });
  put('hammerBands', 'collar', { k: 'band', ring: { c: add(hc, mul(dir, -HH)), u: mul(hx, 9 * sc), v: mul(side, 9 * sc) }, ramp: HAMMER_IRON, rows: 2 });
  // (its haft and pommel)
  put('hammerHaft', 'haft', { k: 'rod', a: gripS, b: add(hc, mul(dir, -HR * 0.8)), ra: 6 * sc, rb: 7 * sc, ramp: HAMMER_HAFT });
  put('hammerHaft', 'pommel', { k: 'ball', c: add(gripS, mul(dir, -3 * sc)), ax: [mul(dir, 9 * sc), mul(side, 10 * sc), mul(hx, 10 * sc)], skin: HAMMER_IRON });
  // (its haft's grain burning; brighter as it strikes)
  const hot = 0.5 + 0.5 * Math.max(0, 1 - Math.abs(k - 1) * 4);
  for (let i = 0; i < 9; i++) {
    const p = lerp3(gripS, hc, 0.12 + i * 0.08);
    put('hammerHaft', 'haft', { k: 'dot', p: add(p, mul(side, -6.5 * sc)), c: FLAME[2], facing: mul(side, -1) });
  }
  // (its power, crackling off it: sparks jumping off its head, a light on it)
  const fr0 = Math.floor(t * 30);
  for (let i = 0; i < 14; i++) {
    const h = hash(i, fr0, 8971);
    if (h < 0.45) continue;
    const a = h * TAU * 3;
    const along = (hash(i, fr0, 8972) - 0.5) * 2 * HL;
    const n = add(mul(dir, Math.cos(a)), mul(side, Math.sin(a)));
    const p = add(add(hc, mul(hx, along)), mul(n, HR * (1.2 + 0.6 * hash(i, fr0, 8973))));
    put('sparks', 'sparks', { k: 'mote', p, c: h > 0.85 ? FLAME[4] : h > 0.65 ? FLAME[3] : FLAME[2], size: 1 });
  }
  put('glow', 'hammerGlow', { k: 'glow', p: hc, c: FLAME[2], r: 40 * sc, a: 0.25 + 0.3 * hot });
  // (shattering: its pieces' sparks flung out)
  if (hm.gone > 0) {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * TAU;
      const r = (10 + 90 * hm.gone) * (0.5 + 0.5 * hash(i, 3, 8974));
      const p = add(hc, [Math.cos(a) * r, Math.sin(a) * r * 0.9, Math.sin(a * 2) * r * 0.4 + 20 * hm.gone]);
      if (hash(i, fr0, 8975) < hm.gone * 0.8) continue;
      put('sparks', 'sparks', { k: 'mote', p, c: i % 3 ? FLAME[2] : POWER_RED[2], size: hm.gone < 0.4 ? 2 : 1 });
    }
  }
}
/** THE HAMMER PAINTED, as the game paints its monsters, `t` seconds into his Power: its picture (anchored on the place it strikes)
 * and its lights. */
export function paintPowerHammer(t: number, view: 'front' | 'rear'): Painted {
  const st = stage(view, HAMMER_CANVAS.ax, HAMMER_CANVAS.ay, HAMMER_CANVAS);
  const bits: Bit[] = [];
  powerHammerBits(t, (part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, [0, 0, 60]);
  const px = st.whole(ENEMY_RIM);
  return { px, lights } as Painted;
}

// FLAME: THE FIRESTORM (his pick, 12 Nov 2026: “Firestorm (Recommended)”, offered as: he hurls the rune skyward; it bursts and
// fireballs rain across the room, each onto a warning mark, leaving burning ground so there's less and less room to stand). By his
// rules for the words: one rune, flung out over the room, bursting; what strikes is what it makes, made as solids.
//   HE WRITES IT   his left hand claws the Flame rune on the air; he fires it straight up into the sky, out of sight
//   THE SKY OPENS  meteors come down out of it at random over the whole arena, each onto its own mark on the floor
//                  (marked on the floor first, a ring of the word's orange with his pink through it: where they fall is the rules')
//   THE STORM      he holds his staff high, calling them down; three waves, each faster; each fireball lands in a burst of fire and
//                  leaves the floor burning where it fell, the flames standing up off it, so there is less and less room to stand
export const FIRE = { write: [0.12, 0.7] as const, cast: 0.74, burst: 1.0, warn: 0.75, fall: 0.34, long: 4.6, high: 260 };
/** Where each fireball lands (its own lengths from the storm's middle on the floor) and when (seconds into the move). */
export const FIRE_DROPS: ReadonlyArray<{ at: V3; t: number }> = ((): { at: V3; t: number }[] => {
  const out: { at: V3; t: number }[] = [];
  const waves: [number, number, number][] = [[1.5, 6, 0.1], [2.25, 8, 0.075], [3.0, 10, 0.055]];
  let k = 0;
  for (const [t0, n, gap] of waves) {
    for (let i = 0; i < n; i++, k++) {
      // (anywhere over the whole arena, at random: his words, 12 Nov 2026, “like he fires the rune into the sky and meteors fall
      // randomly over the whole arena”; the arena 14 tiles by 10 about its middle)
      let x = (hash(k, 1, 8981) - 0.5) * 14 * TILE;
      const y = (hash(k, 2, 8982) - 0.5) * 10 * TILE;
      // (none on him: the arena's middle is 4.6 tiles before him, and none falls within 2 of where he stands)
      if (Math.hypot(x + 4.6 * TILE, y) < 2 * TILE) x += 3 * TILE;
      out.push({ at: [x, y, 0], t: t0 + i * gap });
    }
  }
  return out;
})();
function flameCast(t: number): Cast {
  const raise = smooth01((t - (FIRE.cast - 0.3)) / 0.25) * (1 - smooth01((t - FIRE.long + 0.5) / 0.4));
  const write = bumpOf(t, FIRE.write[0] - 0.05, FIRE.write[1] + 0.1);
  return { raise, hammer: 0, write: Math.max(write, 0.6 * bumpOf(t, FIRE.burst, FIRE.long - 0.4)), stroke: (t - FIRE.write[0]) * TAU * 2.2, lead: 0 };
}
export function flamePoseAt(t: number): BoarPose {
  const P = boarPoseAt('stand', t);
  let flare = 0;
  for (const d of FIRE_DROPS) flare = Math.max(flare, 0.7 * bumpOf(t, d.t - 0.05, d.t + 0.3));
  return { ...P, pulse: Math.max(P.pulse ?? 0, 0.6 * smooth01(t / 0.6), flare), ride: { lean: 0, brace: 0, still: true, cast: flameCast(t) } };
}
/** The way the meteors come down out of the sky (up the way they came): steep, from high over his side of the room. */
export const METEOR_FROM: V3 = norm([-0.75, -0.3, 2.0]);
const ROCK: Ramp = ['#140c0e', '#2a1a1a', '#43292a', '#5e3c36', '#7a5446'];
/** The Flame word's own orange, his pink through it: from its dark edge to its white-hot heart. */
const FIRE_RAMP: Ramp = ['#7a1058', '#e0287a', '#ff8a2a', '#ffc860', '#fff0a0'];
export const FIRE_CANVAS: MobCanvas = { w: 640, h: 460, ax: 320, ay: 300 };
/** Where the burst is (as the storm's own points are): high over its middle. */
export const FIRE_BURST: V3 = [-1.2 * TILE, 0, FIRE.high];
/** THE FIRESTORM'S SOLIDS, `t` seconds into the move, as the storm's own points are (its middle on the floor at nothing): each
 * fireball flung down in its arc out of the burst (a ball of fire, white-hot at its heart, his pink at its edge, a tail of fire and
 * smoke behind it); and each place one has fallen burning, the flames standing up off it, flickering. */
export function firestormBits(t: number, put: Put): void {
  const fr0 = Math.floor(t * 30);
  for (const [k, d] of FIRE_DROPS.entries()) {
    const t0 = d.t - FIRE.fall;
    if (t > t0 && t < d.t) {
      // (A METEOR, his words of 12 Nov 2026, “nah more like a meteor shower”: a burning rock streaking down out of the sky the burst
      // opened, steep and fast, its molten cracks glowing, a mantle of fire about it and a long tail of fire and smoke behind)
      const u = (t - t0) / FIRE.fall;
      const p = add(d.at, mul(METEOR_FROM, 520 * (1 - Math.pow(u, 1.15))));
      const R = 8.5;
      put(`meteor${k % 4}`, 'rock', { k: 'ball', c: p, ax: [[R, 0, 0], [0, R * 0.85, 0], [0, 0, R * 0.95]], skin: (uu, tone) => {
        const crack = hash(Math.floor((uu[0] + 1) * 5), Math.floor((uu[2] + 1) * 5) + k, 8988) < 0.3;
        return crack ? FIRE_RAMP[T5(tone + 1)] : ROCK[T5(tone)];
      } });
      // (its mantle and tail: fire wrapped about it and streaming back up the way it came, as solids, then sparks and smoke)
      const back = METEOR_FROM;
      put('meteorFire', 'mantle', { k: 'rod', a: add(p, mul(back, R * 0.9)), b: add(p, mul(back, 40)), ra: R * 1.1, rb: 3, ramp: FIRE_RAMP });
      put('meteorFire', 'tail', { k: 'rod', a: add(p, mul(back, 20)), b: add(p, mul(back, 80)), ra: 4.2, rb: 0.6, ramp: FIRE_RAMP });
      for (let j = 0; j < 16; j++) {
        const q = add(p, add(mul(back, 70 + j * 9), [(hash(k, j + fr0, 8983) - 0.5) * 6, (hash(k, j, 8984) - 0.5) * 6, (hash(k, j + 9, 8989) - 0.5) * 6]));
        put('fireTrail', 'trail', { k: 'mote', p: q, c: j < 4 ? FIRE_RAMP[3] : j < 8 ? FIRE_RAMP[2] : j < 11 ? FIRE_RAMP[1] : j % 2 ? '#3a2a30' : '#52404a', size: j < 6 ? 2 : 1 });
      }
      put('glow', 'fireGlow', { k: 'glow', p, c: FIRE_RAMP[2], r: 18, a: 0.6 });
    }
    // (the blast as it strikes: fire flung out and up, rock thrown)
    if (t >= d.t && t < d.t + 0.45) {
      const u = t - d.t;
      for (let j = 0; j < 20; j++) {
        const a = (j / 20) * TAU + hash(k, j, 8990);
        const sp = 90 + 110 * hash(k, j + 1, 8991);
        const q: V3 = [d.at[0] + Math.cos(a) * sp * u, d.at[1] + Math.sin(a) * sp * u * 0.9, 4 + (70 + 80 * hash(k, j + 2, 8992)) * u - 260 * u * u];
        if (q[2] < 0) continue;
        if (j % 4 === 0) put('meteorRock', 'chunk', { k: 'ball', c: q, ax: [[2.6, 0, 0], [0, 2.2, 0], [0, 0, 2.4]], skin: ROCK });
        else put('fireSplash', 'splash', { k: 'mote', p: q, c: FIRE_RAMP[j % 3 ? 3 : 2], size: u < 0.15 ? 2 : 1 });
      }
      if (u < 0.12) put('blast', 'blast', { k: 'ball', c: [d.at[0], d.at[1], 10], ax: [[20 + 80 * u, 0, 0], [0, 18 + 70 * u, 0], [0, 0, 14 + 40 * u]], skin: (_uu, tone) => FIRE_RAMP[T5(tone + 2)] });
      put('glow', 'blastGlow', { k: 'glow', p: [d.at[0], d.at[1], 14], c: FIRE_RAMP[3], r: 40, a: 0.7 * (1 - u / 0.45) });
    }
    // (where it fell: a burst of fire as it lands, then the floor burning there to the end, flames standing up off it)
    if (t >= d.t) {
      const u = t - d.t;
      const fade = 1 - smooth01((t - (FIRE.long - 0.35)) / 0.35);
      const big = 1 + 1.4 * Math.exp(-u * 7);
      for (let j = 0; j < 9; j++) {
        const a = (j / 9) * TAU + hash(k, j, 8985);
        const rr = (3 + 13 * hash(k, j + 3, 8986)) * Math.min(1, 0.5 + u * 3);
        const base: V3 = [d.at[0] + Math.cos(a) * rr, d.at[1] + Math.sin(a) * rr * 0.9, 0];
        const h = (10 + 14 * hash(k, j + fr0 * 3, 8987)) * big * fade;
        if (h < 2) continue;
        const sway: V3 = [Math.sin(t * 9 + j) * 2.5, Math.cos(t * 7 + j) * 2, 0];
        put(`burn${k % 3}`, 'flames', { k: 'rod', a: base, b: add(add(base, sway), [0, 0, h]), ra: 3.6, rb: 0.6, ramp: FIRE_RAMP });
      }
      if (u < 0.25) {
        for (let j = 0; j < 16; j++) {
          const a = (j / 16) * TAU;
          const rr = 8 + 60 * u;
          put('fireSplash', 'splash', { k: 'mote', p: [d.at[0] + Math.cos(a) * rr, d.at[1] + Math.sin(a) * rr, 6 + 30 * u - 120 * u * u], c: FIRE_RAMP[j % 2 ? 3 : 2], size: u < 0.1 ? 2 : 1 });
        }
      }
      put('glow', 'burnGlow', { k: 'glow', p: [d.at[0], d.at[1], 10], c: FIRE_RAMP[2], r: 22 * fade, a: (0.25 + 0.3 * Math.exp(-u * 5)) * fade });
    }
  }
}
export function paintFirestorm(t: number, view: 'front' | 'rear'): Painted {
  const st = stage(view, FIRE_CANVAS.ax, FIRE_CANVAS.ay, FIRE_CANVAS);
  const bits: Bit[] = [];
  firestormBits(t, (part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, [0, 0, 40]);
  return { px: st.whole(ENEMY_RIM), lights } as Painted;
}

// FROST: ICE SPIKES (his pick, 12 Nov 2026: “Ice spikes (Recommended)”, offered as: jagged ice bursts up out of the floor in lines
// racing at you, leaving the floor frozen and slippery behind them). By his rules for the words: one rune; what strikes is what it
// makes, as solids.
//   HE WRITES IT   his left hand claws the Frost rune on the air; he raises his staff high, HELD
//   THE STRIKE     two frames: he drives his staff down and the rune down with it into the floor before him, where it shatters
//   THE ICE        out of the place it struck, five lines of jagged ice burst up out of the floor in a fan, racing out across the
//                  room at the hero, a cluster of spikes at each step, each up in a flash; the floor frozen white behind them (the
//                  film draws it: how slippery is the rules'); they stand, then shatter into shards
export const FROST_STRIKE = [fr(26), fr(28)] as const;
export const FROST = { write: [0.12, 0.62] as const, raise: 0.42, hit: FROST_STRIKE[1], lines: 5, fan: 72, steps: 11, step: 0.55, race: 0.055, grow: 0.08, stand: 1.3, long: 3.4, from: 2.4 };
export const frostSmeared = (t: number): boolean => t > FROST_STRIKE[0] + 1e-6 && t <= FROST_STRIKE[1] + FR + 1e-6;
function frostCast(t: number): Cast {
  const [s0, h] = FROST_STRIKE;
  let raise = 0;
  let hammer = 0;
  if (t > h - FROST.raise && t <= s0) raise = smooth01((t - (h - FROST.raise)) / (FROST.raise - 0.14));
  if (t > s0 && t <= h) {
    const u = (t - s0) / (h - s0);
    raise = 1 - u;
    hammer = u;
  }
  if (t > h) {
    const u = (t - h) / 0.5;
    hammer = u < 0.25 ? 1 + 0.15 * Math.sin((Math.PI / 2) * (u / 0.25)) : 1.15 * (1 - smooth01((u - 0.25) / 0.75));
  }
  const write = bumpOf(t, FROST.write[0] - 0.05, FROST.write[1] + 0.1);
  return { raise, hammer, write, stroke: (t - FROST.write[0]) * TAU * 2.2, lead: bumpOf(t, s0 - 0.08, h + 0.25) };
}
export function frostPoseAt(t: number): BoarPose {
  const P = boarPoseAt('stand', t);
  return { ...P, pulse: Math.max(P.pulse ?? 0, 0.6 * smooth01(t / 0.5), bumpOf(t, FROST.hit - 0.05, FROST.hit + 0.6)), ride: { lean: 0, brace: 0, still: true, cast: frostCast(t) } };
}
/** The Frost word's own blue, his pink at its heart: ice from its deep shadow to its white edge (never the friend's cyan). */
const ICE: Ramp = ['#1a2448', '#2e4f86', '#58a8f0', '#b4d6f6', '#f2f6ff'];
export const ICE_CANVAS: MobCanvas = { w: 720, h: 420, ax: 200, ay: 300 };
/** Each spike of ice, as the ice's own points are (the place the rune struck at nothing, its lines fanned out along +x): where its
 * foot is, the way it leans, how tall, how thick, and when it bursts up. */
export const FROST_SPIKES: ReadonlyArray<{ at: V3; lean: V3; tall: number; r: number; t: number }> = ((): { at: V3; lean: V3; tall: number; r: number; t: number }[] => {
  const out: { at: V3; lean: V3; tall: number; r: number; t: number }[] = [];
  for (let l = 0; l < FROST.lines; l++) {
    const a = ((l / (FROST.lines - 1)) - 0.5) * FROST.fan * D;
    for (let j = 0; j < FROST.steps; j++) {
      const d = (0.6 + j * FROST.step) * TILE;
      const c: V3 = [Math.cos(a) * d, Math.sin(a) * d, 0];
      const n = 3 + (j % 2);
      for (let m = 0; m < n; m++) {
        const k = l * 100 + j * 7 + m;
        const off: V3 = [(hash(k, 1, 8994) - 0.5) * 9, (hash(k, 2, 8995) - 0.5) * 9, 0];
        const lean = norm([Math.cos(a) * 0.35 + (hash(k, 3, 8996) - 0.5) * 0.9, Math.sin(a) * 0.35 + (hash(k, 4, 8997) - 0.5) * 0.9, 1], [0, 0, 1]);
        out.push({ at: add(c, off), lean, tall: (m === 0 ? 30 : 14 + 12 * hash(k, 5, 8998)) * (1 + 0.35 * (j / FROST.steps)), r: m === 0 ? 6.5 : 3.5 + 2 * hash(k, 6, 8999), t: FROST.hit + 0.04 + j * FROST.race });
      }
    }
  }
  return out;
})();
/** THE ICE'S SOLIDS, `t` seconds into the move: each spike bursting up out of the floor in a flash, standing, then shattering. */
export function frostBits(t: number, put: Put): void {
  for (const [i, sp] of FROST_SPIKES.entries()) {
    const u = t - sp.t;
    if (u <= 0) continue;
    const end = sp.t + FROST.stand;
    const grow = Math.min(1, u / FROST.grow);
    const gone = smooth01((t - end) / 0.18);
    if (gone >= 1) {
      continue;
    }
    const h = sp.tall * (grow < 1 ? 0.25 + 0.75 * grow : 1 + 0.08 * Math.exp(-(u - FROST.grow) * 12)) * (1 - 0.7 * gone);
    const tip = add(sp.at, mul(sp.lean, h));
    put(`ice${i % 5}`, 'spike', { k: 'rod', a: add(sp.at, [0, 0, -2]), b: tip, ra: sp.r * (1 - 0.4 * gone), rb: 0.35, ramp: ICE });
    // (his pink at the heart of the bigger ones, a glint of it)
    if (sp.r > 6) put(`ice${i % 5}`, 'spike', { k: 'dot', p: lerp3(sp.at, tip, 0.35), c: '#ff4f8a', facing: [1, 0, 0], c2: '#e0287a' });
    // (bursting up: shards flung off it; shattering: it breaks into them)
    if (u < 0.15 || gone > 0) {
      const w = u < 0.15 ? u : t - end;
      for (let m = 0; m < 5; m++) {
        const a = (m / 5) * TAU + hash(i, m, 9001);
        const q: V3 = [sp.at[0] + Math.cos(a) * (4 + 60 * w), sp.at[1] + Math.sin(a) * (4 + 60 * w), 2 + 40 * w - 120 * w * w + (gone > 0 ? h * 0.5 : 0)];
        if (q[2] > 0) put('iceShards', 'shards', { k: 'mote', p: q, c: m % 2 ? ICE[4] : ICE[3], size: 1 });
      }
    }
  }
}
export function paintFrost(t: number, view: 'front' | 'rear'): Painted {
  const st = stage(view, ICE_CANVAS.ax, ICE_CANVAS.ay, ICE_CANVAS);
  const bits: Bit[] = [];
  frostBits(t, (part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, [0, 0, 20]);
  return { px: st.whole(ENEMY_RIM), lights } as Painted;
}

// LIGHTNING: BALL LIGHTNING (his pick, 12 Nov 2026: “Ball lightning”, offered as: slow crackling orbs drift after you, zapping
// anything near, then burst). By his rules for the words: one rune, flung out over the hero; what strikes is what it makes, as solids.
//   HE WRITES IT   his left hand claws the Lightning rune on the air; he flings it out over the room
//   IT CRACKS      over the room it cracks open in a flash, bolts thrown down to the floor, and lets out the orbs
//   THE ORBS       four balls of lightning, the word's yellow white-hot at the heart with his pink about them, crackling, arcs
//                  jumping off them; they drift after the hero, slow, each zapping the floor about it as it goes (how they hunt is
//                  the rules': the film has them drift after the hero); each swells, flickering, and bursts in a blast of bolts
// (his words of 12 Nov 2026, of four small orbs: “one big orb that zaps out periodically”: one great orb, zapping out bolts across the
// floor all round it every so often, swelling and crackling first; bursting at the last)
export const BOLT = { write: [0.12, 0.62] as const, cast: 0.68, crack: 0.95, orbs: 1, long: 4.4, bursts: [3.9] as const, swell: 0.35, zaps: [1.75, 2.45, 3.15] as const, zapLong: 0.18, reach: 2.6, bolts: 7 };
function boltCast(t: number): Cast {
  const raise = smooth01((t - (BOLT.cast - 0.3)) / 0.25) * (1 - smooth01((t - BOLT.long + 0.5) / 0.4));
  const write = bumpOf(t, BOLT.write[0] - 0.05, BOLT.write[1] + 0.1);
  return { raise, hammer: 0, write: Math.max(write, 0.5 * bumpOf(t, BOLT.crack, BOLT.long - 0.4)), stroke: (t - BOLT.write[0]) * TAU * 2.2, lead: 0 };
}
export function boltPoseAt(t: number): BoarPose {
  const P = boarPoseAt('stand', t);
  let flare = 0.6 * smooth01(t / 0.5);
  for (const b of [...BOLT.bursts, ...BOLT.zaps]) flare = Math.max(flare, bumpOf(t, b - 0.05, b + 0.4));
  return { ...P, pulse: Math.max(P.pulse ?? 0, flare), ride: { lean: 0, brace: 0, still: true, cast: boltCast(t) } };
}
/** The Lightning word's own yellow, white-hot at its heart, his pink about it. */
const BOLT_RAMP: Ramp = ['#c0206a', '#ff4f8a', '#ffd84a', '#fff060', '#fffbe0'];
export const ORB_CANVAS: MobCanvas = { w: 420, h: 300, ax: 210, ay: 200 };
/** ONE ORB OF BALL LIGHTNING as solids, at `p` (its own points), `t` seconds into the move: a ball of light, white-hot at its heart,
 * his pink about it, crackling (arcs jumping off it, flickering each frame); swelling and flickering at `swell` (0 ... 1) before it
 * bursts; `zap`, a bolt down to the floor beside it (from 0 just struck to 1 gone, or none). */
export function orbBits(put: Put, p: V3, t: number, seed: number, swell: number, zaps: ReadonlyArray<V3>): void {
  const fr0 = Math.floor(t * 30);
  const R = 24 * (1 + 0.35 * swell) * (1 + 0.06 * Math.sin(t * 40 + seed));
  // (the word's yellow, white-hot at its heart; his pink only at its edge)
  put('orb', 'orb', { k: 'ball', c: p, ax: [[R, 0, 0], [0, R, 0], [0, 0, R]], skin: (u, tone) => {
    const edge = Math.hypot(u[0], u[1], u[2] * 0.2);
    if (edge > 0.9) return BOLT_RAMP[1];
    if (edge > 0.78) return BOLT_RAMP[2];
    return tone >= 2 ? BOLT_RAMP[4] : BOLT_RAMP[3];
  } });
  // (its crackle: arcs jumping off it, a new set each frame)
  for (let a = 0; a < 14 + Math.round(14 * swell); a++) {
    let q = p;
    const dir = norm([hash(a, fr0, 9011) - 0.5, hash(a, fr0, 9012) - 0.5, hash(a, fr0, 9013) - 0.5], [1, 0, 0]);
    for (let j = 0; j < 5; j++) {
      q = add(q, add(mul(dir, R * 0.32), [(hash(a, j + fr0, 9014) - 0.5) * 7, (hash(a, j + fr0, 9015) - 0.5) * 7, (hash(a, j + fr0, 9016) - 0.5) * 7]));
      if (j > 0) put('orbArcs', 'arc', { k: 'mote', p: q, c: j < 3 ? BOLT_RAMP[4] : BOLT_RAMP[3], size: j < 3 ? 2 : 1 });
    }
  }
  for (const [zi, zap] of zaps.entries()) {
    // (a bolt lancing out from it to the floor: jagged, white-hot, forking)
    for (let j = 0; j < 22; j++) {
      const f = (j + 1) / 22;
      const want = lerp3(p, zap, f);
      const q = add(want, [(hash(seed + zi, j + fr0, 9017) - 0.5) * 9, (hash(seed + zi, j + fr0, 9018) - 0.5) * 9, (hash(seed + zi, j + fr0, 9019) - 0.5) * 4]);
      put('orbArcs', 'zap', { k: 'mote', p: q, c: j % 3 ? BOLT_RAMP[4] : BOLT_RAMP[3], size: j < 6 ? 2 : 1 });
    }
  }
  put('glow', 'orbGlow', { k: 'glow', p, c: BOLT_RAMP[3], r: 40 + 30 * swell, a: 0.5 + 0.35 * swell });
}
export function paintOrb(p: V3, t: number, seed: number, swell: number, zaps: ReadonlyArray<V3>, view: 'front' | 'rear'): Painted {
  const st = stage(view, ORB_CANVAS.ax, ORB_CANVAS.ay, ORB_CANVAS);
  const bits: Bit[] = [];
  orbBits((part, piece, shape) => bits.push({ part, piece, shape }), p, t, seed, swell, zaps);
  const lights = paintBits(st, bits, [0, 0, 20]);
  return { px: st.whole(ENEMY_RIM), lights } as Painted;
}

// POISON: SPORE MINES (his pick, 12 Nov 2026: “Spore mines”, offered as: runes sink into the floor around you and burst into poison
// clouds when you come near). By his rules for the words (the rune makes what strikes; one rune, flung out over the hero; solids):
//   HE WRITES IT   his left hand claws the Poison rune on the air; he flings it out over the room
//   IT BURSTS      into a spray of spores flung out all round, each sinking into the floor where it lands
//   THE TRAPS      where each sank a poison rune burns itself into the floor, ringed, glowing, pulsing (his words: “have them be
//                  poison runes on the ground that trigger like a trap”); when the hero comes near one it snaps, flaring white-hot,
//                  and a cloud of poison bursts up out of it, billows and hangs (how near, how long and how much are the rules': the
//                  film sets them off as the hero passes)
export const SPORE = { write: [0.12, 0.62] as const, cast: 0.68, burst: 0.95, land: [1.2, 1.6] as const, sprout: 0.3, swell: 0.25, cloud: 1.7, long: 5.2, pods: 10 };
function sporeCast(t: number): Cast {
  const raise = smooth01((t - (SPORE.cast - 0.3)) / 0.25) * (1 - smooth01((t - SPORE.long + 0.5) / 0.4));
  const write = bumpOf(t, SPORE.write[0] - 0.05, SPORE.write[1] + 0.1);
  return { raise, hammer: 0, write, stroke: (t - SPORE.write[0]) * TAU * 2.2, lead: 0 };
}
export function sporePoseAt(t: number): BoarPose {
  const P = boarPoseAt('stand', t);
  return { ...P, pulse: Math.max(P.pulse ?? 0, 0.6 * smooth01(t / 0.5)), ride: { lean: 0, brace: 0, still: true, cast: sporeCast(t) } };
}
/** The Poison word's own acid green, his pink in its veins. */
const SPORE_GREEN: Ramp = ['#1e2a0c', '#3e5212', '#6e8a18', '#b4cc24', '#e2f07a'];
const SPORE_GAS: Ramp = ['#2a3412', '#4a5a1c', '#7a8e2a', '#a8bc48', '#cede7a'];
/** The Poison rune's glyph, the word's own (art/icons.ts GLYPH: the skull), as the traps are burned in the floor: 'X' the word's
 * green, 'o' his pink. */
export const SPORE_RUNE = ['.XXXX.', 'XXXXXX', 'X.XX.X', 'XXXXXX', '.XooX.', '.X..X.'];
const LEX_POISON = ((): (string | null)[][] => lexiconRune('poison'))();
/** Where each trap is (the spores' own points: the place the rune burst, on the floor) and when its spore lands. */
export const SPORE_PODS: ReadonlyArray<{ at: V3; land: number }> = Array.from({ length: SPORE.pods }, (_, k) => {
  const a = (k / SPORE.pods) * TAU + 0.5 * hash(k, 1, 9021);
  // (spread wide: his words, 12 Nov 2026, “gimme a bigger spread with the same amount of traps”)
  const r = (1.6 + 3.4 * hash(k, 2, 9022)) * TILE;
  return { at: [Math.cos(a) * r, Math.sin(a) * r, 0] as V3, land: SPORE.land[0] + (SPORE.land[1] - SPORE.land[0]) * hash(k, 3, 9023) };
});
export const SPORE_CANVAS: MobCanvas = { w: 720, h: 460, ax: 360, ay: 300 };
/** THE SPORES' SOLIDS, `t` seconds into the move, each pod set off at `fired[k]` (or never): spores flung out of the burst, sinking
 * in; pods sprouting, breathing, swelling and bursting; their clouds billowing and hanging, thinning. `from` is where the burst is
 * (over the place, as its points are). */
export function sporeBits(t: number, fired: ReadonlyArray<number | null>, put: Put): void {
  const B: V3 = [0, 0, 70];
  for (const [k, pod] of SPORE_PODS.entries()) {
    // (flung out of the burst in an arc, sinking into the floor)
    if (t > SPORE.burst && t < pod.land) {
      const u = (t - SPORE.burst) / (pod.land - SPORE.burst);
      const p: V3 = [B[0] + (pod.at[0] - B[0]) * u, B[1] + (pod.at[1] - B[1]) * u, B[2] * (1 - u) + 50 * Math.sin(Math.PI * u)];
      put('spores', 'spore', { k: 'ball', c: p, ax: [[3, 0, 0], [0, 3, 0], [0, 0, 3]], skin: SPORE_GREEN });
      put('spores', 'trail', { k: 'mote', p: add(p, [0, 0, 4]), c: '#ff4f8a', size: 1 });
      continue;
    }
    if (t < pod.land) continue;
    const f = fired[k];
    const grow = smooth01((t - pod.land) / SPORE.sprout);
    if (f === null || f === undefined || t < f + SPORE.swell) {
      // (THE TRAP, his words of 12 Nov 2026: “have them be poison runes on the ground that trigger like a trap”: where each spore sank
      // a poison rune burns itself into the floor, a ring round it, glowing faintly and pulsing, set; stepped near, it snaps: flaring
      // white-hot as it goes off)
      const sw = f !== null && f !== undefined && t > f ? smooth01((t - f) / SPORE.swell) : 0;
      const pulse = 0.5 + 0.5 * Math.sin(t * 4 + k * 1.3);
      const R = 19 * (0.6 + 0.4 * grow) * (1 + 0.15 * sw);
      put(`trap${k % 4}`, 'rune', { k: 'panel', c: [pod.at[0], pod.at[1], 0.4], u: [R, 0, 0], v: [0, R, 0], skin: (a, b) => {
        const x = a / R, y = b / R;
        const r = Math.hypot(x, y);
        if (r > 1) return null;
        if (r > 0.86) return sw > 0.4 ? '#fff0d0' : pulse > 0.5 || grow < 1 ? SPORE_GREEN[3] : SPORE_GREEN[2];
        // (the Lexicon's own Poison rune, its stone and all, laid in the floor)
        const gx = Math.floor((x * 0.68 + 0.5) * 14), gy = Math.floor((-y * 0.68 + 0.5) * 14);
        const c = gx >= 0 && gx < 14 && gy >= 0 && gy < 14 ? LEX_POISON[gy][gx] : null;
        if (!c) return null;
        if (sw > 0.4) return '#fff0d0';
        return c;
      } });
      put('glow', 'trapGlow', { k: 'glow', p: [pod.at[0], pod.at[1], 2], c: '#b4cc24', r: 12 + 18 * sw, a: 0.15 + 0.15 * pulse + 0.6 * sw });
      continue;
    }
    // (burst: its cloud billowing out and up, hanging, thinning)
    const u = t - f - SPORE.swell;
    if (u > SPORE.cloud) continue;
    const fade = 1 - smooth01((u - SPORE.cloud * 0.6) / (SPORE.cloud * 0.4));
    for (let j = 0; j < 9; j++) {
      const a = (j / 9) * TAU + hash(k, j, 9026);
      const spread = (10 + 34 * Math.sqrt(Math.min(1, u / 0.5))) * (0.6 + 0.4 * hash(k, j + 1, 9027));
      const R = (9 + 10 * Math.min(1, u / 0.4)) * (0.7 + 0.5 * hash(k, j + 2, 9028)) * (0.4 + 0.6 * fade);
      const c: V3 = [pod.at[0] + Math.cos(a) * spread, pod.at[1] + Math.sin(a) * spread * 0.9, 8 + 14 * Math.min(1, u / 0.6) + Math.sin(t * 2 + j) * 2];
      put(`cloud${k % 3}`, 'gas', { k: 'ball', c, ax: [[R, 0, 0], [0, R, 0], [0, 0, R * 0.8]], skin: (uu, tone, x, y) => {
        // (thinning as it goes: its pixels dropping out from its edge, in a dither)
        if (fade < 1 && ((x * 3 + y * 5) % 7) / 7 > fade + 0.15) return null;
        return Math.hypot(uu[0], uu[1]) > 0.8 ? SPORE_GAS[T5(tone - 1)] : SPORE_GAS[T5(tone)];
      } });
    }
    if (u < 0.2) for (let j = 0; j < 14; j++) {
      const a = (j / 14) * TAU;
      put('spores', 'spray', { k: 'mote', p: [pod.at[0] + Math.cos(a) * (6 + 120 * u), pod.at[1] + Math.sin(a) * (6 + 120 * u), 6 + 50 * u], c: j % 2 ? '#ff4f8a' : '#e2f07a', size: 2 });
    }
    put('glow', 'cloudGlow', { k: 'glow', p: [pod.at[0], pod.at[1], 14], c: '#b4cc24', r: 34 * fade, a: 0.3 * fade });
  }
}
export function paintSpores(t: number, fired: ReadonlyArray<number | null>, view: 'front' | 'rear'): Painted {
  const st = stage(view, SPORE_CANVAS.ax, SPORE_CANVAS.ay, SPORE_CANVAS);
  const bits: Bit[] = [];
  sporeBits(t, fired, (part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, [0, 0, 20]);
  return { px: st.whole(ENEMY_RIM), lights } as Painted;
}

/** THE RUNE AS HIS LEXICON SHOWS IT (art/icons.ts runeSprite, the very same: a stone tablet, its top and left edges lit, its foot and
 * right in shadow, the word's own glyph carved in it in the word's colour, its heart glowing, inked round): Poison's traps on the
 * floor are it (his words, 12 Nov 2026: “i want to see the runes i see in my lexicon on thiese attacks”; then “not with the stone
 * around it, just the symbol carved into it”, “i do like the stone with poison on the ground tho”, “just one the ground”, “and just
 * poison”: the runes he writes and throws are the bare symbol, tools/endless_boss_film.ts writeRune). 14 by 14 picture pixels,
 * null where there is nothing. */
export function lexiconRune(word: 'power' | 'fire' | 'frost' | 'lightning' | 'poison'): (string | null)[][] {
  const base = [
    '............',
    '..11111111..',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '..33333333..',
    '............',
  ];
  const col: Record<string, string> = { '1': PAL.st6, '2': PAL.st5, '3': PAL.st3 };
  const g: (string | null)[][] = base.map((r) => [...r].map((c) => col[c] ?? null));
  const rows = GLYPH[word];
  const n = rows.length;
  const on = (gx: number, gy: number): boolean => gy >= 0 && gy < n && gx >= 0 && gx < n && rows[gy].charAt(gx) !== '.';
  for (let gy = 0; gy < n; gy++) for (let gx = 0; gx < n; gx++) {
    if (!on(gx, gy)) continue;
    if (!on(gx, gy - 1) && g[2 + gy]) g[2 + gy][3 + gx] = PAL.st3;
    if (!on(gx - 1, gy) && g[3 + gy]) g[3 + gy][2 + gx] = PAL.st3;
  }
  for (let gy = 0; gy < n; gy++) for (let gx = 0; gx < n; gx++) if (on(gx, gy) && g[3 + gy]) g[3 + gy][3 + gx] = rows[gy].charAt(gx) === 'o' ? WORD_GLOW[word] : WORD_COLOR[word];
  // (inked round, as the Lexicon's are)
  const W = 14;
  const out: (string | null)[][] = Array.from({ length: W }, (_, y) => Array.from({ length: W }, (_, x) => g[y - 1]?.[x - 1] ?? null));
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) if (!out[y][x] && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (g[y + dy - 1]?.[x + dx - 1] ?? null) !== null)) out[y][x] = PAL.ink;
  return out;
}

/** THE POWER RUNE: its glyph (the word's own, art/icons.ts GLYPH, two chevrons pointing up), `k` picture pixels to its cell, in the
 * word's red with his pink through its middle and a hot edge; ink round it. */
export const POWER_GLYPH = ['..oo..', '.XXXX.', 'XX..XX', '..oo..', '.XXXX.', 'XX..XX'];
export const POWER_RED = ['#3a0a12', '#a81c2c', '#e03c44', '#ff8a80'] as const;

/** WHAT FLIES OFF IT AS IT CHARGES (as its own points are, the game carrying it on: what is thrown stays where it was thrown):
 * grit thrown back as it paws; the blast of its snort; a ring of grit blown out where it bursts off; grit kicked up at every
 * footfall; and in the skid, grit and frost sprayed out ahead of its ploughing forefeet. */
function chargeGrains(t: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const c = chargeCarry(t) * TILE;
  const g = 30;
  // (thrown from `p0` (on the floor's own spot) at `t0`, at `v` a second, falling; kept while it is above the floor)
  const fly = (p0: V3, v: V3, t0: number, seed: number, long: number, cols: readonly string[]): void => {
    const u = t - t0;
    if (u <= 0 || u > long) return;
    const p: V3 = [p0[0] + v[0] * u - c, p0[1] + v[1] * u, p0[2] + v[2] * u - 0.5 * g * S * u * u];
    if (p[2] < 0) return;
    if (hash(seed, Math.floor(u * 30), 8891) < (u / long) * 0.8) return;
    out.push([p, cols[Math.min(cols.length - 1, Math.floor((u / long) * cols.length))], u < 0.1 && seed % 3 === 0 ? 2 : 1]);
  };
  // (its paws: grit flung back off its forefoot as it drags it)
  for (const [a, b] of CHARGE.paws) {
    const t0 = a + 0.45 * (b - a);
    const foot = SOLE0[1];
    for (let i = 0; i < 12; i++) fly([foot[0] + 4 * S, foot[1] + (hash(i, 1, 8892) - 0.5) * 3 * S, 0.5], [-(40 + 50 * hash(i, 2, 8893)) * S, (hash(i, 3, 8894) - 0.5) * 30 * S, (14 + 16 * hash(i, 4, 8895)) * S], t0 + 0.02 * (i % 4), i + 100 * a, 0.5, DUST);
  }
  // (its snort)
  {
    const u = t - CHARGE.snort;
    if (u > 0 && u < 0.6) {
      const H = headOf(chargePoseAt(CHARGE.snort + 0.05));
      for (const k of [-1, 1]) {
        const nose = H.at(22.6, k * 1.2, -8.2);
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * TAU + hash(i, k, 8896);
          const r = (1.5 + 7 * Math.sqrt(u)) * S * Math.sqrt(0.2 + 0.8 * hash(i, k + 5, 8897));
          const p = add(add(nose, mul(H.f, 10 * S * (1 - Math.exp(-u * 6)))), [Math.cos(a) * r, Math.sin(a) * r, 4 * u + Math.sin(a) * r * 0.3]);
          if (hash(i, Math.floor(u * 20), 8898) < (u / 0.6) * 0.9) continue;
          out.push([p, BREATH[Math.min(3, Math.floor((u / 0.6) * 4))], u < 0.25 ? 2 : 1]);
        }
      }
    }
  }
  // (bursting off: a ring of grit blown out round where it stood)
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * TAU + hash(i, 6, 8899);
    const sp = (60 + 70 * hash(i, 7, 8900)) * S;
    const at: V3 = [SOLE0[2][0] + 6 * S + Math.cos(a) * 10 * S, Math.sin(a) * 9 * S, 0.5];
    fly(at, [Math.cos(a) * sp - 30 * S, Math.sin(a) * sp * 0.8, (10 + 18 * hash(i, 8, 8901)) * S], CHARGE_STRIKE[0], i + 7, 0.55, DUST);
  }
  // (every footfall of its gallop: grit kicked up back off the hoof)
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 8; k++) {
      const pk = plantAt(i, k);
      if (pk > chargeCarry(SKID0) * TILE) break;
      const t0 = chargeTimeAt(pk / TILE);
      const foot: V3 = [SOLE0[i][0] + pk - 0, SOLE0[i][1], 0.4];
      for (let j = 0; j < 8; j++) fly([foot[0], foot[1] + (hash(j, i, 8902) - 0.5) * 3 * S, 0.4], [-(10 + 40 * hash(j, k, 8903)) * S, (hash(j, k + 9, 8904) - 0.5) * 30 * S, (10 + 16 * hash(j, k + 3, 8905)) * S], t0, i * 31 + k * 7 + j, 0.45, DUST);
    }
  }
  // (the skid: grit and frost sprayed out ahead of its forefeet as they plough, the whole way)
  for (let e = 0; e < 18; e++) {
    const te = SKID0 + 0.04 + (e / 18) * (CHARGE.skid - 0.08);
    const ce = chargeCarry(te) * TILE;
    for (const i of [0, 1]) {
      const f0 = SKID_FEET[i];
      for (let j = 0; j < 3; j++) {
        const sd = e * 13 + i * 5 + j;
        const sp = (40 + 60 * hash(sd, 1, 8906)) * S * (1 - 0.5 * (e / 18));
        fly([f0[0] + 2 * S + ce, f0[1] + (hash(sd, 2, 8907) - 0.5) * 4 * S, 0.6], [sp + CHARGE.pace * TILE * 0.5 * (1 - e / 18), (hash(sd, 3, 8908) - 0.5) * 40 * S, (12 + 22 * hash(sd, 4, 8909)) * S], te, sd + 500, 0.5, j === 0 ? BREATH : DUST);
      }
    }
  }
  return out;
}
/** WHAT FLIES OFF IT AS IT WHEELS: grit flung out from its hind feet as they leave the floor and as they come down. */
function wheelGrains(t: number): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const g = 30;
  for (const [hi, [a, b]] of WHEEL.hops.entries()) {
    for (const [t0, Y] of [[a, wheelYaw(a)], [b, wheelYaw(b)]] as const) {
      const u = t - t0;
      if (u <= 0 || u > 0.45) continue;
      for (const i of [2, 3]) {
        const foot = wheeled(SOLE0[i], Y);
        // (out from the way the hindquarters swing)
        const sw = rotZ([0, -1, 0], Y);
        for (let j = 0; j < 9; j++) {
          const sd = hi * 97 + i * 13 + j + (t0 === a ? 0 : 50);
          const sp = (30 + 60 * hash(sd, 1, 8921)) * S;
          const ang = (hash(sd, 2, 8922) - 0.5) * 1.6;
          const dir: V3 = [sw[0] * Math.cos(ang) - sw[1] * Math.sin(ang), sw[0] * Math.sin(ang) + sw[1] * Math.cos(ang), 0];
          const p: V3 = [foot[0] + dir[0] * sp * u, foot[1] + dir[1] * sp * u, 0.5 + (12 + 16 * hash(sd, 3, 8923)) * S * u - 0.5 * g * S * u * u];
          if (p[2] < 0 || hash(sd, Math.floor(u * 30), 8924) < (u / 0.45) * 0.8) continue;
          out.push([p, DUST[Math.min(2, Math.floor((u / 0.45) * 3))], 1]);
        }
      }
    }
  }
  return out;
}
/** When in the charge it has been carried `d` tiles. */
function chargeTimeAt(d: number): number {
  let lo = 0;
  let hi = CHARGE.long;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (chargeCarry(m) < d) lo = m;
    else hi = m;
  }
  return hi;
}

/** A colour gone to ash: its light kept, its colour gone, as far as `a` (0 ... 1). */
function ashOf(c: string, a: number): string {
  const n = parseInt(c.slice(1, 7), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const l = 0.3 * r + 0.59 * g + 0.11 * b;
  const ash = 54 + 0.62 * l;
  const m = (v: number, w: number): number => Math.round(v + (w - v) * a);
  return `#${[m(r, ash), m(g, ash * 0.97), m(b, ash * 0.99)].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`;
}
/** ITS END (his words, 12 Nov 2026: “like he turns to ash after the rune power seeps out of him”): everything of it painted gone to
 * ash as far as `a`; and, blown away as far as `cr`, its small pieces gone one by one and its great ones eaten away in flakes
 * from their tops down. Its glows go out as it greys. */
function ashPut(put: Put, a: number, cr: number): Put {
  let n = 0;
  const ramp = (r: Ramp): Ramp => r.map((c) => ashOf(c, a)) as unknown as Ramp;
  // (a flake of it gone: in blotches, its top first)
  const gone = (x: number, y: number): boolean => cr > 0 && 0.55 * hash(Math.floor(x / 2), Math.floor(y / 2), 9011) + 0.45 * clamp01((y - 150) / 120) < cr * 1.25 - 0.05;
  return (part, piece, shape) => {
    const when = hash(n++, 3, 9101);
    if (shape.k === 'glow') {
      if (a < 0.6) put(part, piece, { ...shape, a: shape.a * (1 - a / 0.6) });
      return;
    }
    if (shape.k !== 'ball' && shape.k !== 'panel' && cr > 0.15 + 0.7 * when) return;
    if (shape.k === 'rod' || shape.k === 'cloth' || shape.k === 'band') return put(part, piece, { ...shape, ramp: ramp(shape.ramp) } as never);
    if (shape.k === 'dot') return put(part, piece, { ...shape, c: ashOf(shape.c, a), ...(shape.c2 ? { c2: ashOf(shape.c2, a) } : {}) });
    if (shape.k === 'mote' || shape.k === 'thread') return put(part, piece, { ...shape, c: ashOf(shape.c, a) } as never);
    if (shape.k === 'ball') {
      const sk = shape.skin;
      const R = Array.isArray(sk) ? ramp(sk as Ramp) : null;
      return put(part, piece, { ...shape, skin: (u: V3, tone: number, x: number, y: number) => {
        if (gone(x, y)) return null;
        if (R) return R[T5(tone)];
        const c = (sk as (u: V3, tone: number, x: number, y: number) => string | null)(u, tone, x, y);
        return c ? ashOf(c, a) : c;
      } });
    }
    if (shape.k === 'panel') {
      const sk = shape.skin;
      return put(part, piece, { ...shape, skin: (pa: number, pb: number, front: boolean, tone: number) => {
        if (cr > 0 && hash(Math.floor(pa * 6 + 9), Math.floor(pb * 6 + 9), 9012) < cr * 1.2 - 0.1) return null;
        const c = sk(pa, pb, front, tone);
        return c ? ashOf(c, a) : c;
      } });
    }
    put(part, piece, shape);
  };
}
function wsBits(st: Stage, m: Moment): Bit[] {
  const bits: Bit[] = [];
  const put: Put = (part, piece, shape) => bits.push({ part, piece, shape });
  const { s } = m;
  const onFoot = FOOT_MOVES.has(m.move ?? 'stand');
  const P0 = boarPoseAt(onFoot ? 'stand' : (m.move ?? 'stand'), m.t);
  // (on foot: no boar; his power burning in him all the while, flaring as he melds)
  const P: BoarPose = onFoot ? { ...P0, ride: { lean: 0, brace: 0, still: true, surge: 0.55 + 0.45 * (m.move === 'foot' ? 0 : bumpOf(m.t, MELD.up, MELD.slam + 0.4)) } } : P0;
  const near = st.near(add(s.pelvis, [0, -3, 0])) > st.near(add(s.pelvis, [0, 3, 0])) ? -1 : 1;
  // (its end: gone to ash, and blown away)
  const ash = P.ash ?? 0, cr = P.crumble ?? 0;
  if (!onFoot && cr < 1) boarBits(P, ash > 0 || cr > 0 ? ashPut(put, ash, cr) : put, near, st);
  // (his death: overwhelmed, burning paler and pinker, light splitting out of him; then crushed in to his heart, and gone)
  if (m.move === 'death') {
    const k = implodeAt(m.t);
    if (k <= 0.001) return bits;
    const o = overwhelmAt(m.t);
    const heart = heartOf(s);
    const dp = dyingPut(put, o, k, heart);
    const wind = 0.4 * o * Math.sin(m.t * 17);
    robe(dp, s, P.sway, wind, m.t);
    arm(dp, s, 'L', s.chest[2], 0.32, 1.25);
    arm(dp, s, 'R', s.chest[2], 1, 0, staffOf(s, 0, true).up);
    dp('neck', 'neck', { k: 'rod', a: lerp3(s.ribs, s.neck, 0.5), b: lerp3(s.neck, s.head, 0.5), ra: 1.6, rb: 1.3, ramp: ASH });
    head(dp, st, s, m.t, wind);
    staff(dp, s, m.t, 0, true);
    put('glow', 'dying', { k: 'glow', p: heart, c: '#ff7aa8', r: 20 + 40 * o + 30 * (1 - k), a: 0.2 + 0.4 * o });
    return bits;
  }
  // (his power swelling in him: its runes' power streaming into him, at its height as he strikes: a light about him, his eyes
  // blazing, the air crackling with his pink, sparks running up him)
  const surge = P.ride?.surge ?? 0;
  if (surge > 0) {
    put('glow', 'surge', { k: 'glow', p: lerp3(s.ribs, s.neck, 0.4), c: BURN[2], r: 14 + 26 * surge, a: 0.1 + 0.28 * surge });
    put('glow', 'surgeEyes', { k: 'glow', p: s.head, c: BURN[3], r: 5 + 7 * surge, a: 0.25 + 0.45 * surge });
    const n = Math.round(22 * surge);
    const fr = Math.floor(m.t * 30);
    for (let i = 0; i < n; i++) {
      const h = hash(i, fr, 9021);
      const along = lerp3(s.pelvis, s.head, h);
      const a2 = hash(i, fr + 1, 9022) * TAU;
      const r = 6 + 6 * hash(i, fr + 2, 9023);
      put('air', 'crackle', { k: 'mote', p: add(along, [Math.cos(a2) * r, Math.sin(a2) * r, 2 + 8 * hash(i, fr + 3, 9024)]), c: i % 3 === 0 ? BURN[4] : BURN[3], size: i % 4 === 0 ? 2 : 1 });
    }
  }
  // (the wind of its going: on him as it charges, the other way as it stops dead)
  const wind = P.ride?.still ? 0 : ((P.ride?.lean ?? 0) - 1.6 * (P.ride?.brace ?? 0)) / 22;
  robe(put, s, P.sway, wind, m.t);
  // (his left hand clawed, fingers spread, writing on the air; his right closed round the staff)
  arm(put, s, 'L', s.chest[2], 0.32, 1.25);
  arm(put, s, 'R', s.chest[2], 1, 0, staffOf(s, staffTiltOf(P), plantedIn(m.move ?? 'stand', m.t)).up);
  // (his neck: thin, the cords of it standing out)
  put('neck', 'neck', { k: 'rod', a: lerp3(s.ribs, s.neck, 0.5), b: lerp3(s.neck, s.head, 0.5), ra: 1.6, rb: 1.3, ramp: ASH });
  head(put, st, s, m.t, wind);
  staff(put, s, m.t, staffTiltOf(P), plantedIn(m.move ?? 'stand', m.t));
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
/** A move's motion: his pose in the saddle, every frame (30 a second), as the boar moves under him. */
function moveMotion(move: string, long: number): Motion {
  const keys: Key3[] = [];
  const N = Math.round(long * 30);
  for (let i = 0; i <= N; i++) {
    const t = i / 30;
    keys.push({ at: t, ease: 'lin', pose: riderPose(boarPoseAt(move, t), t) });
  }
  return { keys };
}

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
    // (dead, the boar is no longer a living monster: its edge is the dark seam, not his pink; his own stays pink)
    finish: (px: Px, _st: Stage, m: Moment, partAt: (k: number) => string | null) => {
      if (m.move !== 'fall' || m.t <= FALL.kill + 0.1) return;
      const boarAt0 = (x: number, y: number): number => {
        if (x < 0 || y < 0 || x >= px.w || y >= px.h) return 0;
        const n = partAt(y * px.w + x);
        return n === null ? 0 : n.startsWith('boar') ? 1 : 2;
      };
      // (its pink edge, outside its dark seam: whatever is painted of no part, and nearest the boar within two pixels, not him)
      const ink = INK.toLowerCase();
      const fix: number[] = [];
      for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
        const c = px.get(x, y);
        if (!c || c.toLowerCase() === ink || partAt(y * px.w + x) !== null) continue;
        let b = 0, o = 0;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const w = boarAt0(x + dx, y + dy); if (w === 1) b++; else if (w === 2) o++; }
        if (b > 0 && o === 0) fix.push(x, y);
      }
      for (let i = 0; i < fix.length; i += 2) px.d[(fix[i + 1] * px.w + fix[i]) * 4 + 3] = 0;
    },
    grains: (st: Stage, m: Moment) => m.move === 'death' ? deathGrains(m.t, DEATH_HEART()) : boarGrains(m.t, m.move ?? 'stand', st.near(add(m.s.pelvis, [0, -3, 0])) > st.near(add(m.s.pelvis, [0, 3, 0])) ? -1 : 1),
    more: { charge: { name: 'charge', motion: moveMotion('charge', CHARGE.long), rest: REST }, wheel: { name: 'wheel', motion: moveMotion('wheel', WHEEL.long), rest: REST }, gore: { name: 'gore', motion: { ...moveMotion('gore', GORE.long), hit: GORE.hit }, rest: REST }, stomp: { name: 'stomp', motion: { ...moveMotion('stomp', STOMP.long), hit: STOMP.hit }, rest: REST }, power: { name: 'power', motion: { ...moveMotion('power', POWER.long), hit: POWER.slams[2] }, rest: REST }, flame: { name: 'flame', motion: moveMotion('flame', FIRE.long), rest: REST }, frost: { name: 'frost', motion: { ...moveMotion('frost', FROST.long), hit: FROST.hit }, rest: REST }, lightning: { name: 'lightning', motion: moveMotion('lightning', BOLT.long), rest: REST }, poison: { name: 'poison', motion: moveMotion('poison', SPORE.long), rest: REST }, fall: { name: 'fall', motion: fallMotion(), rest: REST }, foot: { name: 'foot', motion: footMotion(footStandAt, FOOT_LONG, true), rest: REST }, death: { name: 'death', motion: footMotion(deathRiderAt, DEATH.long), rest: REST }, turn: { name: 'turn', motion: footMotion(turnAt, TURN.long), rest: REST }, hailstorm: { name: 'hailstorm', motion: { ...footMotion(meldRiderAt, MELD.long), hit: MELD.slam }, rest: REST }, avalanche: { name: 'avalanche', motion: { ...footMotion(meldRiderAt, MELD.long), hit: MELD.slam }, rest: REST }, thunder: { name: 'thunder', motion: { ...footMotion(meldRiderAt, MELD.long), hit: MELD.slam }, rest: REST }, blight: { name: 'blight', motion: { ...footMotion(meldRiderAt, MELD.long), hit: MELD.slam }, rest: REST }, scald: { name: 'scald', motion: { ...footMotion(meldRiderAt, MELD.long), hit: MELD.slam }, rest: REST }, eruption: { name: 'eruption', motion: { ...footMotion(meldRiderAt, MELD.long), hit: MELD.slam }, rest: REST } },
  } as unknown as Mob;
}



// =============================================================================================
// HIM ON FOOT: THE SECOND PHASE (his fight: “I want two phases, one saddled, then another after the boar dies”; “So while on the
// boar he's using single words?  Then off he's melding?  I like that.”; his shade, “he forges a word, as he would in phase one, the
// shade also phases a word, and they meld into the new attack”; his gameplay rulebook: each phase harder than the last). On foot he
// stands as he rose: hunched forward like something hunting, his staff planted, his writing hand clawed out before him, his runes
// burning brighter than ever they did in the saddle, his shade looming over him doing as he does.
/** A pose of his on foot, his body and his hands (his feet and his pelvis apart). */
export type Look = { pitch: number; roll: number; twist: number; bend: number; hunch: number; faceTurn: number; faceUp: number; faceTilt: number; lfp: number; lft: number; rft: number; lk: number; rk: number; lkUp: number; lhx: number; lhy: number; lhz: number; le: number; rhx: number; rhy: number; rhz: number; re: number };
/** Standing over it, hunched forward, his staff planted at his right side, his writing hand clawed out before him. */
// (his writing arm in by his side, its elbow down, its forearm forward, the hand clawed before him; his staff hand forward at his
// elbow's height, the staff upright in his fist at his right side, its foot on the floor: never along his forearm, so never through
// it; his words, 13 Nov 2026: “His casting arm is still sticking out awkwardly and the hand on the staff is clipping.  That’s a
// rule broken.”)
export const FOOT_OVER: Look = { pitch: 10, roll: 0, twist: 0, bend: 10, hunch: 14, faceTurn: 0, faceUp: 14, faceTilt: 2, lfp: 0, lft: 12, rft: -14, lk: 8, rk: -8, lkUp: 0, lhx: 9, lhy: 4, lhz: -9, le: -4, rhx: 6, rhy: -16, rhz: -9, re: 4 };
/** Writing a rune on the air: his clawed hand up before him; his staff still planted. */
const FOOT_WRITE: Look = { ...FOOT_OVER, pitch: 4, bend: 4, hunch: 8, faceUp: 10, twist: 8, lhx: 11, lhy: 4, lhz: 9, le: -4 };
/** His staff thrust high over his head, arched back, his face up to it, his left hand clawed up and wide. */
const FOOT_RAISE: Look = { ...FOOT_OVER, pitch: -8, bend: -6, hunch: 0, faceUp: 24, twist: 0, lhx: 4, lhy: 12, lhz: 14, le: 40, rhx: 2, rhy: -6, rhz: 26, re: 30 };
/** Driven down, his staff's foot into the floor at his right side, his head up, glaring. */
const FOOT_SLAM: Look = { ...FOOT_OVER, pitch: 16, bend: 20, hunch: 10, faceUp: 16, lhx: 7, lhy: 9, lhz: -6, le: 8 };
/** Where his feet are on foot (each ankle, from his floor point): his left a stride before his right. */
const FOOT_L: V3 = [7, 5, 2.496];
const FOOT_R: V3 = [-5, -5, 2.496];
/** His bones on foot: a look, how low his pelvis is (0, standing tall), and his hands' small habits. */
function footBones(L: Look, low: number, t: number, claw = 1): Partial<Bones> {
  return {
    px: 0, py: 0, pz: -low,
    yaw: 0, pitch: L.pitch, roll: L.roll, twist: L.twist, bend: L.bend, side: 0, hunch: L.hunch,
    faceTurn: L.faceTurn, faceUp: L.faceUp, faceTilt: L.faceTilt,
    lfx: FOOT_L[0], lfy: FOOT_L[1] - B.stance, lfz: FOOT_L[2] - B.ankle,
    rfx: FOOT_R[0], rfy: FOOT_R[1] + B.stance, rfz: FOOT_R[2] - B.ankle,
    lfp: L.lfp, rfp: L.lfp, lft: L.lft, rft: L.rft, lk: L.lk, rk: L.rk, lkUp: L.lkUp, rkUp: L.lkUp,
    lhIn: 1, lhx: L.lhx, lhy: L.lhy, lhz: L.lhz + claw * 1.2 * Math.sin(t * 4), le: L.le,
    rhIn: 1, rhx: L.rhx, rhy: L.rhy, rhz: L.rhz, re: L.re,
    out: 0,
  } as Partial<Bones>;
}
const mixLook = (a: Look, b: Look, f: number): Look => {
  const o = { ...a };
  for (const k of Object.keys(o) as (keyof Look)[]) o[k] = a[k] + (b[k] - a[k]) * f;
  return o;
};
/** HIS STAND ON FOOT, a round of FOOT_LONG: breathing deep and hard, his shoulders heaving; his head jerking round to the hero and
 * back now and then, as a hunting thing's does; his writing hand's claws flexing; the air crackling round him. */
export const FOOT_LONG = 4.8;
export function footStandAt(t: number): Partial<Bones> {
  const T = FOOT_LONG;
  const tt = ((t % T) + T) % T;
  const br = Math.sin((tt / T) * TAU * 3);
  const jerk = bumpOf(tt, 1.5, 2.1) - 0.7 * bumpOf(tt, 3.3, 3.9);
  const L: Look = { ...FOOT_OVER, hunch: FOOT_OVER.hunch + 2 * br, faceTurn: 14 * jerk, faceTilt: 2 - 6 * jerk, faceUp: FOOT_OVER.faceUp + 2 * br, pitch: FOOT_OVER.pitch + 1.2 * br };
  return footBones(L, 4 - 0.8 * br, t);
}
// THE MELDS: he writes his word at his hand as he did in the saddle, and his shade, a moment after him, writes the other at its own
// great hand; his staff thrust high, the two runes fly up and meet over him, wheel round each other faster and faster and MELD in a
// flash into the meld's own rune (the game's: render/melds3.ts MELD_GLYPH, in its own colours, his pink through it); THE SLAM, a
// lightning strike of two frames, smeared, drives it down into the floor before him, and what it makes rises out of the floor.
export const MELD = { write: [0.12, 0.7] as const, up: 0.74, meet: 1.02, melded: 1.16, raise: [0.7, 1.05] as const, slam: 38 / 30, long: 2.3 };
export const MELD_STRIKE = [MELD.slam - 2 / 30, MELD.slam] as const;
export const meldSmeared = (t: number): boolean => t > MELD_STRIKE[0] + 1e-6 && t <= MELD_STRIKE[1] + 1 / 30 + 1e-6;
/** His bones as he melds (any meld: what it makes is its own). */
export function meldRiderAt(t: number): Partial<Bones> {
  const stroke = (t - MELD.write[0]) * TAU * 2.2;
  const w = bumpOf(t, MELD.write[0] - 0.05, MELD.write[1] + 0.1);
  const writing: Look = { ...FOOT_WRITE, lhx: FOOT_WRITE.lhx + 3 * w * Math.sin(stroke), lhy: FOOT_WRITE.lhy + 2.5 * w * Math.cos(stroke), lhz: FOOT_WRITE.lhz + 3 * w * Math.sin(stroke * 2) };
  let L = mixLook(FOOT_OVER, writing, smooth01(t / 0.15));
  L = mixLook(L, FOOT_RAISE, smooth01((t - MELD.raise[0]) / (MELD.raise[1] - MELD.raise[0])));
  L = mixLook(L, FOOT_SLAM, clamp01((t - MELD_STRIKE[0]) / (MELD.slam - MELD_STRIKE[0])));
  L = mixLook(L, FOOT_OVER, smooth01((t - MELD.slam - 0.15) / 0.7));
  // (driving on down through the blow, his weight into it)
  const on = bumpOf(t, MELD.slam - 0.02, MELD.slam + 0.42);
  L = { ...L, rhz: L.rhz - 6 * on, pitch: L.pitch + 5 * on };
  const up = 1.5 * smooth01((t - MELD.raise[0]) / (MELD.raise[1] - MELD.raise[0]));
  const slam = t < MELD.slam ? clamp01((t - MELD_STRIKE[0]) / (MELD.slam - MELD_STRIKE[0])) : 1 - smooth01((t - MELD.slam - 0.15) / 0.7);
  return footBones(L, 4 * (1 - smooth01(t / 0.3)) - up * (1 - slam) + 8 * slam + 6 * on + 4 * smooth01((t - MELD.slam - 0.15) / 0.7) * (t > MELD.slam ? 1 : 0), t, 1 - w);
}
/** HIM TURNING ON FOOT (to show his shade gliding round after him): a heavy turn to his right, held, then back round to his left, his
 * feet stepping round, each lifted and put down where it goes; his facing (degrees) over time. */
export const TURN = { long: 3.6, turns: [[0.3, 1.0, -110], [2.0, 2.6, 50]] as const };
export function turnYaw(t: number): number {
  let y = 0;
  for (const [a, b, to] of TURN.turns) y += (to - y) * smooth01((t - a) / (b - a));
  return y;
}
export function turnAt(t: number): Partial<Bones> {
  const Y = turnYaw(t);
  // (each foot turned round with him in its own half of the turn, lifted as it goes)
  const footYaw = (first: boolean): number => {
    let y = 0;
    for (const [a, b, to] of TURN.turns) { const m = (a + b) / 2; y += (to - y) * smooth01((t - (first ? a : m - 0.05)) / ((b - a) / 2 + 0.05)); }
    return y;
  };
  const lift = (first: boolean): number => TURN.turns.reduce((acc, [a, b]) => { const m = (a + b) / 2; return Math.max(acc, bumpOf(t, first ? a : m - 0.05, first ? m + 0.05 : b)); }, 0);
  const rot = (p: V3, deg: number): V3 => { const c = Math.cos((deg * Math.PI) / 180), sn = Math.sin((deg * Math.PI) / 180); return [p[0] * c - p[1] * sn, p[0] * sn + p[1] * c, p[2]]; };
  const yl = footYaw(Y < 0 ? false : true), yr = footYaw(Y < 0 ? true : false);
  const fl = rot(FOOT_L, yl), fr = rot(FOOT_R, yr);
  const b = footStandAt(t);
  // (his hands' places are along the figure's own axes, which do not turn with him: turned with him, as in the saddle, else his arms
  // twist as he turns; his words, 13 Nov 2026: “His arm is all messed up again when he turns”)
  const c = Math.cos((Y * Math.PI) / 180), sn = Math.sin((Y * Math.PI) / 180);
  const yh = (x: number, y: number): [number, number] => [x * c - y * sn, x * sn + y * c];
  const [lhx, lhy] = yh(b.lhx ?? 0, b.lhy ?? 0);
  const [rhx, rhy] = yh(b.rhx ?? 0, b.rhy ?? 0);
  return { ...b, yaw: Y, lhx, lhy, rhx, rhy, lfx: fl[0], lfy: fl[1] - B.stance, lfz: 3 * lift(Y >= 0) + 0, lft: (b.lft ?? 12) + yl, lk: (b.lk ?? 8) + yl, rfx: fr[0], rfy: fr[1] + B.stance, rfz: 3 * lift(Y < 0), rft: (b.rft ?? -14) + yr, rk: (b.rk ?? -8) + yr };
}
/** His motion on foot, every frame. */
function footMotion(at: (t: number) => Partial<Bones>, long: number, loop = false): Motion {
  const keys: Key3[] = [];
  const N = Math.round(long * 30);
  for (let i = 0; i <= N; i++) keys.push({ at: i / 30, ease: 'lin', pose: at(i / 30) });
  return loop ? { loop: 0, keys } : { keys };
}

// ERUPTION (Power and Flame, melded: the game's meld, render/melds3.ts, “a mountain blowing its top”): he writes Power, his shade
// writes Flame; melded, the rune is driven down into the floor before him, and THE FLOOR SPLITS: three fissures race out from where
// it went in, across the room toward the hero, glowing molten in their depths, a vent swelling along each every tile or so (the
// warning: where each will blow); then, from the nearest out, each vent BLOWS: a column of magma bursting up out of the floor
// (molten rock, its crust breaking, white-hot at its heart, his pink through it), rocks flung out of it in arcs, crashing down
// and smouldering where they land; the column falls back into a pool of rock cooling, its cracks glowing and going dark. His
// rules for the words stand: one rune (the meld's), what it makes made as solids.
export const ERUPT = { at: 1.6, fans: [-34, 0, 34] as const, long: 6.0, vents: 5, first: 1.25, step: 1.05, race: [0.04, 0.5] as const, blow: 0.62, every: 0.18, burst: 0.1, hold: 0.28, fallBack: 0.3, cool: 1.6, rocks: 5, end: 5.0 };
export const ERUPT_CANVAS: MobCanvas = { w: 760, h: 560, ax: 220, ay: 330 };
const MAGMA: Ramp = ['#1c0806', '#4a1208', '#8a2c0c', '#c25a12', '#ffb43a'];
const MAGMA_HOT = '#fff0b0';
/** Each vent: where it is (his floor point's own lengths: forward, left) and when it blows (the move's own time). */
export const ERUPT_VENTS: ReadonlyArray<{ at: V3; t: number; fan: number; j: number }> = ERUPT.fans.flatMap((deg, f) =>
  Array.from({ length: ERUPT.vents }, (_, j) => {
    const a = deg * D + (hash(f, j, 9401) - 0.5) * 0.12;
    const r = (ERUPT.at + ERUPT.first + j * ERUPT.step) * TILE;
    const o = (hash(f, j, 9402) - 0.5) * 0.35 * TILE;
    return { at: [Math.cos(a) * r - Math.sin(a) * o, Math.sin(a) * r + Math.cos(a) * o, 0] as V3, t: MELD.slam + ERUPT.blow + j * ERUPT.every + 0.04 * f, fan: f, j };
  }),
);
/** Where the meld's rune goes into the floor. */
export const ERUPT_AT: V3 = [ERUPT.at * TILE, 0, 0];
/** How far each fissure has raced out (0 ... 1), `t` into the move. */
export const eruptRace = (t: number): number => smooth01((t - MELD.slam - ERUPT.race[0]) / (ERUPT.race[1] - ERUPT.race[0]));
/** Molten rock: its crust dark in plates, breaking; between, it glows; hot at its heart, his pink in its deepest seams. */
function magmaSkin(seed: number, heat: number): (u: V3, tone: number, x: number, y: number) => string | null {
  return (u, tone, x, y) => {
    const crust = hash(Math.floor(x / 3) + seed, Math.floor(y / 3), 9403) < 0.55 - 0.45 * heat;
    const seam = (x + 2 * y + seed) % 7 === 0;
    if (crust) return MAGMA[Math.max(0, Math.min(2, tone - 2))];
    if (seam && heat > 0.4) return '#ff4f8a';
    const hot = heat * (0.6 + 0.4 * (1 - Math.hypot(u[0], u[1])));
    return hot > 0.8 ? MAGMA_HOT : MAGMA[Math.max(2, Math.min(4, Math.round(2 + 2.4 * hot + (tone - 2) * 0.3)))];
  };
}
/** THE ERUPTION'S SOLIDS, `t` into the move: each vent swelling, blowing, its column, its rocks, its pool cooling. */
export function eruptBits(t: number, put: Put): void {
  for (const [k, v] of ERUPT_VENTS.entries()) {
    const raced = eruptRace(t) * (ERUPT.vents + 0.5) > v.j + 0.5;
    if (!raced) continue;
    const u = t - v.t;
    const c = v.at;
    if (u < 0) {
      // (the vent swelling where it will blow: a dome of crust heaving up, cracked, glowing through, faster as it comes)
      const sw = clamp01(1 + u / 0.6);
      const R = 5 + 4 * sw;
      put(`vent${k % 4}`, 'dome', { k: 'ball', c: [c[0], c[1], 0.5], ax: [[R, 0, 0], [0, R, 0], [0, 0, 2 + 3 * sw + 0.6 * Math.sin(t * 30 + k)]], skin: magmaSkin(k, 0.25 + 0.5 * sw) });
      put('glow', 'ventGlow', { k: 'glow', p: [c[0], c[1], 3], c: '#ff8a2a', r: 10 + 10 * sw, a: 0.15 + 0.3 * sw });
      continue;
    }
    const life = ERUPT.burst + ERUPT.hold + ERUPT.fallBack;
    if (u < life) {
      // (the column: a jet of molten rock bursting up out of the floor, narrow at its root and spraying wide at its top, held,
      // falling back into itself)
      const up = u < ERUPT.burst ? smooth01(u / ERUPT.burst) : u < ERUPT.burst + ERUPT.hold ? 1 : 1 - smooth01((u - ERUPT.burst - ERUPT.hold) / ERUPT.fallBack);
      const Hc = (58 + 16 * hash(k, 1, 9404)) * up;
      const n = 13;
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const wob = Math.sin(t * 24 + i * 1.7 + k) * 1.6 * f;
        const R = (4.6 + 3.4 * f * f) * (0.75 + 0.25 * up) * (1 + 0.14 * Math.sin(t * 31 + i * 2));
        put(`column${k % 3}`, 'magma', { k: 'ball', c: [c[0] + wob, c[1] + 0.6 * wob, 2 + f * Hc], ax: [[R, 0, 0], [0, R, 0], [0, 0, R * 1.2]], skin: magmaSkin(k * 7 + i, 0.55 + 0.45 * f) });
      }
      // (its spray: gobs of it flung up and out over its top, falling)
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + k;
        const w = clamp01(u / (ERUPT.burst + ERUPT.hold + ERUPT.fallBack));
        const r = (5 + 22 * w) * (0.6 + 0.6 * hash(k, i, 9405));
        const z = 2 + Hc + 14 * Math.sin(Math.PI * Math.min(1, w * 1.4)) - 30 * w * w;
        if (z < 2) continue;
        const R = 2.2 + 1.4 * hash(k, i, 9410);
        put(`column${k % 3}`, 'crown', { k: 'ball', c: [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, z], ax: [[R, 0, 0], [0, R, 0], [0, 0, R * 1.1]], skin: magmaSkin(k * 13 + i, 0.95) });
      }
      put('glow', 'columnGlow', { k: 'glow', p: [c[0], c[1], 3 + Hc * 0.5], c: '#ff8a2a', r: 30 + Hc * 0.4, a: 0.35 * up + 0.1 });
      put('glow', 'columnPink', { k: 'glow', p: [c[0], c[1], 6], c: '#ff4f8a', r: 18, a: 0.25 * up });
    }
    // (its rocks: flung up out of it in arcs, crashing down and smouldering where they land)
    for (let i = 0; i < ERUPT.rocks; i++) {
      const a = hash(k, i, 9406) * TAU;
      const sp = 50 + 60 * hash(k, i, 9407);
      const vz = 140 + 80 * hash(k, i, 9408);
      const g = 520;
      const w = u - 0.05 - 0.05 * i;
      if (w <= 0) continue;
      const tl = (2 * vz) / g;
      const ww = Math.min(w, tl);
      const p: V3 = [c[0] + Math.cos(a) * sp * ww, c[1] + Math.sin(a) * sp * ww, Math.max(2.4, 8 + vz * ww - 0.5 * g * ww * ww)];
      const heat = w < tl ? 0.85 : Math.max(0, 0.7 - (w - tl) / 1.2);
      if (w > tl + 1.6) continue;
      const R = 2.6 + 1.6 * hash(k, i, 9409);
      put('rocks', 'rock', { k: 'ball', c: p, ax: [[R, 0, 0], [0, R * 0.9, 0], [0, 0, R * 0.8]], skin: magmaSkin(k * 31 + i, heat) });
    }
    // (the pool it falls back into: rock cooling, its cracks glowing and going dark)
    if (u > ERUPT.burst + ERUPT.hold) {
      const cool = clamp01((u - ERUPT.burst - ERUPT.hold - ERUPT.fallBack) / ERUPT.cool);
      if (cool < 1) {
        const R = 13;
        put(`pool${k % 3}`, 'pool', { k: 'ball', c: [c[0], c[1], 0.2], ax: [[R, 0, 0], [0, R * 0.9, 0], [0, 0, 1.6]], skin: magmaSkin(k * 3, 0.85 * (1 - cool)) });
        put('glow', 'poolGlow', { k: 'glow', p: [c[0], c[1], 2], c: '#ff8a2a', r: 16, a: 0.3 * (1 - cool) });
      }
    }
  }
}
export function paintEruption(t: number, view: 'front' | 'rear'): Painted {
  const st = stage(view, ERUPT_CANVAS.ax, ERUPT_CANVAS.ay, ERUPT_CANVAS);
  const bits: Bit[] = [];
  eruptBits(t, (part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, [0, 0, 20]);
  return { px: st.whole(ENEMY_RIM), lights } as Painted;
}


// HIS DEATH (his brief, 12 Nov 2026: “Remember we’re trying to stay away from “falling to their knees”.  I think he is overwhelmed by
// the word power he is using and implodes in pink energy that dissipates into tiny runes that blink out until nothing is left”):
//   STRUCK       the last blow: a flash; he is rocked back a step, never down
//   OVERWHELMED  the power he holds turns on him: he is wrenched upright and back, arched, his staff thrust up as if to hold it
//                off, shaking; light splits out through him in cracks, more and more of him burning white and pink; bolts of it
//                lash out of him to the floor; his shade is dragged back down into him, writhing
//   IMPLODES     all of him, staff and all, is crushed in to a point at his heart in a quarter of a second, white-hot
//   THE RUNES    a beat; then a ring of his light, and a burst of TINY RUNES flung out from where he was, drifting out and up,
//                each blinking out on its own, until nothing is left.
export const DEATH = { struck: 0.12, over: [0.12, 1.1] as const, shade: [0.25, 0.95] as const, implode: [1.1, 1.35] as const, burst: 1.42, runes: 150, long: 3.9 };
/** How far the power has him (0 ... 1): light splitting out through him. */
export const overwhelmAt = (t: number): number => smooth01((t - DEATH.over[0]) / (DEATH.over[1] - DEATH.over[0]));
/** How much of him is left as he implodes (1 ... 0). */
export const implodeAt = (t: number): number => { const u = clamp01((t - DEATH.implode[0]) / (DEATH.implode[1] - DEATH.implode[0])); return 1 - u * u * u; };
/** His bones as he dies: rocked back a step; wrenched up and back, arched, his staff thrust high, shaking. */
export function deathRiderAt(t: number): Partial<Bones> {
  const hit = bumpOf(t, 0, 0.3);
  const o = overwhelmAt(t);
  const shake = o * (t < DEATH.implode[1] ? 1 : 0);
  const j = (k: number): number => shake * 2.2 * Math.sin(t * (53 + k * 7) + k);
  const ARCH: Look = { ...FOOT_RAISE, pitch: -16, bend: -12, hunch: -4, faceUp: 34, faceTilt: 8, lhx: 2, lhy: 15, lhz: 12, le: 50, rhx: 1, rhy: -8, rhz: 27, re: 34 };
  let L = mixLook(FOOT_OVER, { ...FOOT_OVER, pitch: -6, bend: -4, faceUp: 22, lhx: 4, lhy: 12, lhz: 6, le: 30 }, hit);
  L = mixLook(L, ARCH, o);
  L = { ...L, pitch: L.pitch + j(1), roll: L.roll + j(2), faceTurn: L.faceTurn + 3 * j(3), lhz: L.lhz + j(4), rhz: L.rhz + 0.5 * j(5) };
  const b = footBones(L, 4 - 5 * o - 2 * hit, t, 0);
  // (rocked back a step: his pelvis back over his right foot)
  return { ...b, px: -3.5 * smooth01(t / 0.25) };
}
/** WHAT IS LEFT OF HIM: tiny runes, flung out from where he imploded, drifting out and up, each blinking out on its own, until
 * nothing is left; and the bolts that lash out of him as it overwhelms him. As his own points are. */
const TINY: readonly (readonly string[])[] = [['X.X', '.X.', 'X.X'], ['.X.', 'XXX', '.X.'], ['XX.', '.X.', '.XX'], ['X..', 'XXX', '..X'], ['.X.', 'X.X', '.X.'], ['XXX', '.X.', '.X.']];
function deathGrains(t: number, heart: V3): [V3, string, number][] {
  const out: [V3, string, number][] = [];
  const right: V3 = [0.613, 0.613, 0];
  if (t >= DEATH.burst) {
    for (let i = 0; i < DEATH.runes; i++) {
      const u = t - DEATH.burst - 0.12 * hash(i, 1, 9501);
      if (u <= 0) continue;
      // (each goes out at its own moment; flickering a little before it does)
      const life = 0.5 + 1.9 * hash(i, 2, 9502);
      if (u > life) continue;
      if (u > life - 0.25 && hash(i, Math.floor(u * 20), 9503) < 0.5) continue;
      const a = hash(i, 3, 9504) * TAU;
      const up = (hash(i, 4, 9505) - 0.3) * 1.6;
      const sp = 40 + 110 * hash(i, 5, 9506);
      const d = sp * (1 - Math.exp(-u * 2.2)) / 2.2;
      const p: V3 = [heart[0] + Math.cos(a) * d, heart[1] + Math.sin(a) * d, Math.max(3, heart[2] + up * d * 0.5 + 14 * u)];
      const g = TINY[i % TINY.length];
      const hot = u < 0.3 ? '#fffbe8' : i % 3 === 0 ? BURN[4] : i % 3 === 1 ? BURN[3] : '#ff7aa8';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (g[r][c] === 'X') out.push([add(add(p, mul(right, c - 1)), [0, 0, 1 - r]), hot, 1]);
    }
  }
  // (bolts lashing out of him to the floor as it overwhelms him: jagged, white at their core, gone in a frame or two)
  const o = overwhelmAt(t);
  if (o > 0.1 && t < DEATH.implode[1]) {
    const fr = Math.floor(t * 30);
    const n = Math.floor(1 + 4 * o);
    for (let b = 0; b < n; b++) {
      if (hash(b, fr, 9510) > 0.55 + 0.3 * o) continue;
      const a = hash(b, fr, 9511) * TAU;
      const r = 20 + 30 * hash(b, fr, 9512);
      const end: V3 = [heart[0] + Math.cos(a) * r, heart[1] + Math.sin(a) * r, 0];
      let p: V3 = heart;
      for (let k = 1; k <= 14; k++) {
        const f = k / 14;
        const q: V3 = [heart[0] + (end[0] - heart[0]) * f + (hash(b, fr * 31 + k, 9513) - 0.5) * 7, heart[1] + (end[1] - heart[1]) * f + (hash(b, fr * 37 + k, 9514) - 0.5) * 7, heart[2] * (1 - f)];
        for (let m = 0; m < 3; m++) out.push([lerp3(p, q, m / 3), m % 2 ? BURN[3] : '#fffbe8', 1]);
        p = q;
      }
    }
  }
  return out;
}
/** His heart (as his own points are): where he implodes to. */
const heartOf = (s: Skeleton): V3 => lerp3(s.ribs, s.neck, 0.35);
/** As he is overwhelmed and implodes: every part of him burning paler and pinker, light splitting out of him in cracks; then
 * crushed in to his heart. */
function dyingPut(put: Put, o: number, k: number, heart: V3): Put {
  const hotOf = (c: string): string => {
    const n = parseInt(c.slice(1, 7), 16);
    const m = (v: number, w: number): number => Math.round(v + (w - v) * Math.min(1, 0.75 * o + 1.2 * (1 - k)));
    return `#${[m((n >> 16) & 255, 255), m((n >> 8) & 255, 150), m(n & 255, 200)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  };
  const crack = (x: number, y: number): boolean => o > 0.15 && hash(x >> 1, y >> 1, 9520) < 0.07 + 0.3 * o * o && ((x + y * 3) % 5 === 0 || (x * 2 - y) % 7 === 0);
  return (part, piece, shape) => {
    const sh = k < 1 ? greatShape(shape, heart, k, [0, 0, 0]) : shape;
    if (sh.k === 'rod' || sh.k === 'cloth' || sh.k === 'band') return put(part, piece, { ...sh, ramp: (sh.ramp as Ramp).map(hotOf) as unknown as Ramp } as Shape);
    if (sh.k === 'ball') {
      const sk = sh.skin;
      return put(part, piece, { ...sh, skin: (u: V3, tone: number, x: number, y: number) => {
        if (crack(x, y)) return '#fff0f6';
        const c = Array.isArray(sk) ? (sk as Ramp)[T5(tone)] : (sk as (u: V3, tone: number, x: number, y: number) => string | null)(u, tone, x, y);
        return c ? hotOf(c) : c;
      } });
    }
    if (sh.k === 'dot') return put(part, piece, { ...sh, c: hotOf(sh.c), ...(sh.c2 ? { c2: hotOf(sh.c2) } : {}) });
    put(part, piece, sh);
  };
}


// HAILSTORM (Frost and Lightning, melded: “a storm cloud and its hail”): he writes Frost, his shade writes Lightning; melded, the slam
// flings the rune STRAIGHT UP out of sight, and a STORM CLOUD boils out over the whole room, low and dark, lightning crawling in
// its belly; out of it HAIL hammers down at random all over the floor, each stone's shadow on the floor growing as it comes (the
// warning), each stone a lump of ice shattering where it strikes, shards flung, a splash of frost left; and every so often a BOLT
// of lightning cracks down out of the cloud onto a spot ringed first in crackling white, the cloud lit from inside as it goes. Then
// the cloud thins and is gone. His rules for the words stand: one rune (the meld's), what it makes made as solids.
export const HAIL = { up: 0.3, cloud: [0.15, 0.85] as const, high: 190, stones: 110, fall: 0.42, warn: 0.55, rain: [0.9, 3.7] as const, bolts: 7, boltWarn: 0.55, gone: [4.2, 5.0] as const, end: 5.4 };
export const HAIL_CANVAS: MobCanvas = { w: 940, h: 720, ax: 300, ay: 520 };
/** The room the storm covers (his floor point's own lengths, tiles): forward, and to either side. */
const HAIL_AREA = { x: [-1.5, 9.5] as const, y: [-4.5, 4.5] as const };
const HAIL_HERO: V3 = [4.4 * TILE, -1.2 * TILE, 0];
/** Each hailstone: where it strikes, when (the move's own time), how big. None on him; none on the hero (so he is not covered). */
export const HAIL_STONES: ReadonlyArray<{ at: V3; t: number; r: number }> = ((): { at: V3; t: number; r: number }[] => {
  const out: { at: V3; t: number; r: number }[] = [];
  for (let i = 0; out.length < HAIL.stones && i < 4000; i++) {
    const x = (HAIL_AREA.x[0] + (HAIL_AREA.x[1] - HAIL_AREA.x[0]) * hash(i, 1, 9601)) * TILE;
    const y = (HAIL_AREA.y[0] + (HAIL_AREA.y[1] - HAIL_AREA.y[0]) * hash(i, 2, 9602)) * TILE;
    if (Math.hypot(x, y) < 1.8 * TILE || Math.hypot(x - HAIL_HERO[0], y - HAIL_HERO[1]) < 0.9 * TILE) continue;
    out.push({ at: [x, y, 0], t: MELD.slam + HAIL.rain[0] + (HAIL.rain[1] - HAIL.rain[0]) * hash(i, 3, 9603), r: 3.2 + 2.3 * hash(i, 4, 9604) });
  }
  return out;
})();
/** Each bolt: where it strikes and when. */
export const HAIL_BOLTS: ReadonlyArray<{ at: V3; t: number }> = Array.from({ length: HAIL.bolts }, (_, i) => {
  const a = hash(i, 1, 9611) * TAU;
  const r = (2.2 + 4.2 * hash(i, 2, 9612)) * TILE;
  return { at: [3.6 * TILE + Math.cos(a) * r, Math.sin(a) * r * 0.8, 0] as V3, t: MELD.slam + HAIL.rain[0] + 0.25 + i * ((HAIL.rain[1] - HAIL.rain[0] - 0.4) / HAIL.bolts) };
});
const STORM: Ramp = ['#141a34', '#2c3a6a', '#45528a', '#6878b8', '#8c9ad0'];
const HAIL_ICE: Ramp = ['#4a6a9a', '#7c9cc8', '#b4cce8', '#e2eefa', '#ffffff'];
/** How thick the cloud is, `t` into the move (0 ... 1). */
export const hailCloudAt = (t: number): number => smooth01((t - MELD.slam - HAIL.cloud[0]) / (HAIL.cloud[1] - HAIL.cloud[0])) * (1 - smooth01((t - MELD.slam - HAIL.gone[0]) / (HAIL.gone[1] - HAIL.gone[0])));
/** THE HAILSTORM'S SOLIDS, `t` into the move: its cloud, its stones falling and shattering, its bolts' light. */
export function hailBits(t: number, put: Put): void {
  const cl = hailCloudAt(t);
  // (the cloud itself is high over the room, out of the picture: what is seen of it is its shadow on the floor, drifting, and its
  // light as its bolts go: the film's and the game's floor)
  // (the hail: each stone falling out of the cloud, a little slanted, and shattering where it strikes, shards flung)
  for (const [k, h] of HAIL_STONES.entries()) {
    const u = t - (h.t - HAIL.fall);
    if (u < 0) continue;
    if (u < HAIL.fall) {
      const f = u / HAIL.fall;
      const c: V3 = [h.at[0] - 18 * (1 - f), h.at[1] + 6 * (1 - f), HAIL.high * (1 - f * f) + h.r];
      put('hail', 'stone', { k: 'ball', c, ax: [[h.r, 0, 0], [0, h.r, 0], [0, 0, h.r * 1.2]], skin: HAIL_ICE });
      // (its streak behind it, the way it came)
      put('hail', 'streak', { k: 'rod', a: c, b: add(c, [-9, 3, 26]), ra: h.r * 0.45, rb: 0.3, ramp: HAIL_ICE });
      continue;
    }
    const w = u - HAIL.fall;
    if (w > 0.45) continue;
    for (let i = 0; i < 5; i++) {
      const a = hash(k, i, 9613) * TAU;
      const d = (8 + 20 * hash(k, i, 9614)) * w / 0.45;
      const z = Math.max(1, 10 * Math.sin(Math.PI * Math.min(1, w / 0.35)) * (0.5 + hash(k, i, 9615)));
      const r = h.r * 0.45;
      put('hail', 'shard', { k: 'ball', c: [h.at[0] + Math.cos(a) * d, h.at[1] + Math.sin(a) * d, z], ax: [[r, 0, 0], [0, r * 0.7, 0], [0, 0, r]], skin: HAIL_ICE });
    }
  }
  for (const b of HAIL_BOLTS) if (t > b.t && t < b.t + 0.2) {
    put('glow', 'boltGlow', { k: 'glow', p: [b.at[0], b.at[1], 6], c: '#eef2ff', r: 40, a: 0.5 * (1 - (t - b.t) / 0.2) });
    put('glow', 'boltPink', { k: 'glow', p: [b.at[0], b.at[1], 6], c: '#ff4f8a', r: 22, a: 0.3 * (1 - (t - b.t) / 0.2) });
  }
}
export function paintHail(t: number, view: 'front' | 'rear'): Painted {
  const st = stage(view, HAIL_CANVAS.ax, HAIL_CANVAS.ay, HAIL_CANVAS);
  const bits: Bit[] = [];
  hailBits(t, (part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, [0, 0, 40]);
  return { px: st.whole(ENEMY_RIM), lights } as Painted;
}
export { HAIL_HERO };


// (HIS LAST STAND was made and CUT at his word, 13 Nov 2026: “Let’s just cut the last stand, I think the shade with him on foot and
// the multitude of melds and moves will make it unique and memorable”: in the branch's history at 06891c2.)


// AVALANCHE (Power and Frost, melded: “a mountainside shedding its snow”), as he laid it out, 13 Nov 2026: “OK, here’s what I want.
// The word Smith does his room. The flies to either the left or the right side of the wall. A red warning covers the entire arena
// except for a little spot at the top or a little spot at the bottom then you hear rumbling building up to like a wall like a freight
// train of snow flying across the street wherever that red is on the floor goes on for a few seconds freezes if you’re in it and you
// take a ton of damage and then once it’s done, that’s it” (read: he does his rune; it flies to the left or the right wall; a red
// warning covers the whole arena but a little spot at the top or the bottom; rumbling builds; then a freight train of snow flies
// across the screen wherever the floor is red, for a few seconds; one in it is frozen and takes a ton of damage; when it is done,
// that is it). So: he writes Power, his shade writes Frost; melded, the slam flings the rune to the wall, where it sinks in, a flash;
// THE WARNING floods the floor red, all of it but the one safe strip; the wall RUMBLES, the screen shaking harder and harder, snow
// sifting out of its cracks; then THE SNOW COMES OUT OF THE WALL like a freight train: a torrent of powder and streaking snow, ice
// boulders hurtling in it, tearing across the room the whole way, sparing only the safe strip, for a few seconds; its tail passes,
// and that is it. HE NEEDS NO SAFE PLACE (his words, 13 Nov 2026: “it doesn’t need the circle under the boss, he’s fine”): the red
// runs right up under his feet and the snow pours straight past him, his own spell. Here, out of the left wall, the strip at the bottom.
export const ARENA = { x: [-3, 12.2] as const, y: [-5.6, 5.2] as const };
export const AVAL = { red: [0.3, 0.75] as const, rumble: [0.75, 1.95] as const, cross: 0.35, stream: 2.6, tail: 0.45, safe: { side: 'bottom' as 'top' | 'bottom', w: 1.6, at: [6.2, -4.8] as const }, boulders: 26, end: 7.2 };
export const AVAL_CANVAS: MobCanvas = { w: 1300, h: 820, ax: 420, ay: 470 };
const SNOW: Ramp = ['#34485c', '#6a8aa2', '#a5c6d7', '#e2f0f8', '#ffffff'];
const AVAL_ICE: Ramp = ['#1a2430', '#34485c', '#6a8aa2', '#a5c6d7', '#e2f0f8'];
/** When the snow bursts out of the wall (the move's own time). */
export const AVAL_OUT = (): number => MELD.slam + AVAL.rumble[1];
/** How far its front has come across the room, and its tail (his floor point's own lengths, along the room from the left wall). */
export function avalFront(t: number): number {
  const u = clamp01((t - AVAL_OUT()) / AVAL.cross);
  return (ARENA.x[0] + (ARENA.x[1] - ARENA.x[0]) * u) * TILE;
}
export function avalTail(t: number): number {
  const u = clamp01((t - AVAL_OUT() - AVAL.cross - AVAL.stream) / AVAL.tail);
  return (ARENA.x[0] + (ARENA.x[1] - ARENA.x[0]) * u) * TILE;
}
/** Whether a spot of the floor is spared it: THE SAFE STRIP (his words, 13 Nov 2026: “The safe spots should be a strip along the top of
 * the arena or the bottom of the arena”: the whole length of the room, along the top edge or the bottom, the way the snow goes). Not
 * his own ground: “he’s fine”. */
export function avalSpared(x: number, y: number, pad = 0): boolean {
  void x;
  const w = AVAL.safe.w * TILE + pad;
  return AVAL.safe.side === 'bottom' ? y < ARENA.y[0] * TILE + w : y > ARENA.y[1] * TILE - w;
}
/** Whether a mass of the snow (its middle, its half-length along the room and its half-width) would go through his body: those break
 * past him instead; the river of it still runs right up to his legs (no safe place round him: “he’s fine”). */
const avalThroughHim = (x: number, y: number, hx: number, hy: number): boolean => Math.abs(y) < hy + 12 && Math.abs(x) < hx + 14;
/** THE AVALANCHE'S SOLIDS, `t` into the move: the torrent of snow tearing across the room out of the wall, its boulders, its
 * streaks, its powder; sparing the safe strip, pouring straight past him. All of it one body of snow, no seams through it. Only
 * what `keep` keeps (by its floor point): the snow nearer the eye than he is, to be laid over him where he stands in it. */
export function avalancheBits(t: number, put: Put, keep: (x: number, y: number) => boolean = () => true, glow = true): void {
  const out = AVAL_OUT();
  if (t < out) return;
  const F = avalFront(t), Tl = avalTail(t);
  if (Tl >= F - 1) return;
  const fr = Math.floor(t * 30);
  const y0 = ARENA.y[0] * TILE, y1 = ARENA.y[1] * TILE;
  const speed = 26 * TILE;
  const powder = (seed: number): ((u: V3, tone: number, x: number, y: number) => string | null) => (u, tone, x, y) => {
    const rim = 1 - Math.max(0, u[0] * 0.5 + 0.5 - Math.hypot(u[1], u[2]) * 0.2);
    const n = hash((x - fr * 3) >> 1, y >> 1, 9934 + seed);
    if (n < rim * 0.55 - 0.05) return null;
    if (n > 0.975 && u[0] > 0.3) return '#ff9cc0';
    return SNOW[T5(tone + (n > 0.7 ? 1 : 0))];
  };
  const L = (ARENA.x[1] - ARENA.x[0]) * TILE;
  const flow = speed * (t - out);
  // (THE TORRENT'S BODY: one river of snow the whole room's width, no gaps in it, streaked along the way it goes, tearing past;
  // ragged at its front and its tail; sparing the safe strip; round his legs)
  {
    const cx = (F + Tl) / 2, cy = (y0 + y1) / 2, hx = (F - Tl) / 2, hy = (y1 - y0) / 2;
    put('snow', 'river', { k: 'panel', c: [cx, cy, 16], u: [hx, 0, 0], v: [0, hy, 0], skin: (a, b2) => {
      const x = cx + a, y = cy + b2;
      if (!keep(x, y) || avalSpared(x, y, 3 + 4 * hash(Math.floor(x / 3), Math.floor(y / 3), 9961))) return null;
      if (hx - Math.abs(a) < 10 * hash(Math.floor(y / 3), 1, 9962)) return null;
      const n = hash(Math.floor((x - flow) / 7), Math.floor(y / 2), 9963);
      return n > 0.85 ? '#ffffff' : n > 0.5 ? SNOW[3] : n > 0.2 ? SNOW[2] : SNOW[1];
    } });
  }
  // (on it, long masses of powder hurled along it, streaked out the way they go, rising and breaking)
  for (let i = 0; i < 70; i++) {
    const y = y0 + (y1 - y0) * hash(i, 1, 9951);
    const x = ARENA.x[0] * TILE + ((hash(i, 2, 9952) * L + flow * 1.1) % L);
    const R = 8 + 6 * hash(i, 3, 9953);
    if (x > F || x < Tl || avalSpared(x, y, 8) || !keep(x, y) || avalThroughHim(x, y, R * 3.6, R)) continue;
    const h = 22 + 34 * hash(i, 4, 9954);
    put('snow', 'powder', { k: 'ball', c: [x, y, 14 + h * 0.4], ax: [[R * 3.6, 0, 0], [0, R, 0], [0, 0, h * 0.45]], skin: (u, tone, px, py) => {
      const rim = 1 - Math.max(0, u[0] * 0.5 + 0.5 - Math.hypot(u[1], u[2]) * 0.2);
      const n = hash((px - fr * 6) >> 3, py >> 1, 9964 + i);
      if (n < rim * 0.6 - 0.05) return null;
      return SNOW[T5(tone + (n > 0.6 ? 1 : 0))];
    } });
  }
  // (its front: a heaving wall of it, tallest, blasting on)
  if (F < ARENA.x[1] * TILE - 2) for (let i = 0; i < 16; i++) {
    const y = y0 + ((y1 - y0) * i) / 15;
    if (avalSpared(F, y, 6) || !keep(F - 26, y) || avalThroughHim(F - 26, y, 42, 15)) continue;
    put('snow', 'front', { k: 'ball', c: [F - 26, y + 6 * Math.sin(t * 9 + i), 26], ax: [[42, 0, 0], [0, 15, 0], [0, 0, 30]], skin: (u, tone, px, py) => {
      const rim = 1 - Math.max(0, u[0] * 0.5 + 0.5 - Math.hypot(u[1], u[2]) * 0.2);
      const n = hash((px - fr * 6) >> 3, py >> 1, 9970 + i);
      if (n < rim * 0.6 - 0.05) return null;
      return SNOW[T5(tone + (n > 0.6 ? 1 : 0))];
    } });
  }
  // (streaks of it, as fast as it goes: the speed of it)
  for (let i = 0; i < 160; i++) {
    const y = y0 + (y1 - y0) * hash(i, 5, 9955);
    const x = ARENA.x[0] * TILE + ((hash(i, 6, 9956) * L + speed * 1.3 * (t - out)) % L);
    const z = 6 + 50 * hash(i, 7, 9957);
    if (x > F || x - 40 < Tl || avalSpared(x, y, 2) || !keep(x - 20, y)) continue;
    put('streaks', 'streak', { k: 'rod', a: [x - 40, y, z], b: [x, y, z], ra: 0.7, rb: 1.1, ramp: SNOW });
  }
  // (ice boulders hurtling in it, bounding)
  for (let k = 0; k < AVAL.boulders; k++) {
    const y = y0 + (y1 - y0) * hash(k, 1, 9904);
    const x = ARENA.x[0] * TILE + ((hash(k, 8, 9958) * L + speed * 0.9 * (t - out)) % L);
    const bounce = Math.abs(Math.sin(t * (7 + 3 * hash(k, 3, 9906)) + k)) * (12 + 22 * hash(k, 4, 9907));
    const R = 6 + 6 * hash(k, 5, 9908);
    if (x > F || x < Tl || avalSpared(x, y, 8) || !keep(x, y) || avalThroughHim(x, y, R, R)) continue;
    put('boulders', 'ice', { k: 'ball', c: [x, y, R + bounce], ax: [[R, 0, 0], [0, R * 0.85, 0], [0, 0, R * 0.9]], skin: (u, tone, px, py) => ((px + py + fr) % 5 === 0 ? AVAL_ICE[4] : AVAL_ICE[T5(tone)]) });
  }
  // (powder thrown up off the torrent's flank, along the safe strip's edge; and off his legs as it breaks on him and pours past)
  const edge = AVAL.safe.side === 'bottom' ? ARENA.y[0] * TILE + AVAL.safe.w * TILE : ARENA.y[1] * TILE - AVAL.safe.w * TILE;
  for (let i = 0; i < 120; i++) {
    const u = (t * 2 + hash(i, 10, 9960)) % 1;
    let x: number, y: number, z: number;
    if (i % 3) {
      x = ARENA.x[0] * TILE + (ARENA.x[1] - ARENA.x[0]) * TILE * hash(i, 11, 9965);
      y = edge + (AVAL.safe.side === 'bottom' ? 1 : -1) * (2 + 8 * u);
      z = 8 + 30 * u * (1 - u) * 2;
      x += 20 * u;
    } else {
      const a = (hash(i, 9, 9959) - 0.5) * 2.4;
      x = -8 + 30 * u;
      y = 14 * Math.sin(a) + 10 * u * Math.sign(a);
      z = 14 + 46 * u * (1 - u) * 2 * hash(i, 12, 9966);
    }
    if (x > F || x < Tl || !keep(x, y)) continue;
    put('spray', 'snow', { k: 'mote', p: [x, y, z], c: u < 0.4 ? '#ffffff' : '#a5c6d7', size: u < 0.3 ? 2 : 1 });
  }
  if (glow) put('glow', 'avalGlow', { k: 'glow', p: [(F + Tl) / 2, 0, 30], c: '#e2f0f8', r: 160, a: 0.22 });
}
/** The avalanche's picture; with `nearer` (a floor point in his own lengths), only its snow nearer the eye than that, inked but
 * without its rim or its light: laid over him (or his shade) where he stands in it, as it pours past him. */
export function paintAvalanche(t: number, view: 'front' | 'rear', nearer: V3 | null = null): Painted {
  const st = stage(view, AVAL_CANVAS.ax, AVAL_CANVAS.ay, AVAL_CANVAS);
  const bits: Bit[] = [];
  const lo = nearer ? st.near(nearer) : -Infinity;
  avalancheBits(t, (part, piece, shape) => bits.push({ part, piece, shape }), (x, y) => st.near([x, y, 0]) >= lo, !nearer);
  const lights = paintBits(st, bits, [0, 0, 30]);
  return { px: st.whole(nearer ? null : ENEMY_RIM), lights: nearer ? [] : lights } as Painted;
}


// BLIGHT (Power and Poison, melded: the game's meld, render/melds3.ts, “a dead tree standing in rot”): he writes Power, his shade
// writes Poison; melded, the slam drives the rune down into the floor before him, and THE ROT SPREADS out of where it went in: a
// stain of black-green rot creeping over the floor in long fingers, forking as they go (the warning: the rotted floor flushed in
// the colour of every boss's warning on the ground, its creeping front hot); then the rot HEAVES: from the rune outward, dead trees
// punch up out of it everywhere it reached, gnarled trunks and spiked branches, his pink seeping from their cracks, rotten clods
// thrown up with them, spores rising; they stand a moment, then crack, crumble and sink back into the rot, which dries and is gone.
// His rules for the words stand: one rune (the meld's), what it makes made as solids (the trees).
// WAY BIGGER, AND BETTER TREES (his words, 13 Nov 2026: “Gotta be way bigger.  And let’s do a little better on those trees”): the
// rot creeps over most of the room; the trees tower over him, twisting trunks on flared roots, ridged bark, branches forking and
// forking again into claws, his pink glowing out of splits in the wood.
export const BLIGHT = { at: 3.0, fingers: 9, core: 2.0, spread: [0.05, 1.5] as const, heave: 1.65, ripple: 0.35, rise: 0.2, hold: 0.9, wither: 1.0, dry: 1.0, end: 7.0 };
export const BLIGHT_CANVAS: MobCanvas = { w: 1300, h: 960, ax: 560, ay: 600 };
export const BLIGHT_AT: V3 = [BLIGHT.at * TILE, 0, 0];
const BARK: Ramp = ['#0a0908', '#1a1812', '#2c2a1c', '#44452a', '#606638'];
const CREASE_BARK: Ramp = ['#030302', '#070605', '#0c0b08', '#14130e', '#1e1d14'];
const SPLIT_GLOW: Ramp = ['#7a1058', '#c0206a', '#ff4f8a', '#ff9cc0', '#ffd0e0'];
const DEAD_ASH: Ramp = ['#141214', '#2a2628', '#48424a', '#6e6670', '#948c96'];
/** The rot's fingers: each a line of points over the floor (his floor point's own lengths), how wide it is at each (half), and how
 * far the rot has crept to reach each, from where the rune went in. */
export const BLIGHT_FINGERS: ReadonlyArray<{ pts: V3[]; w: number[]; d: number[] }> = ((): { pts: V3[]; w: number[]; d: number[] }[] => {
  const out: { pts: V3[]; w: number[]; d: number[] }[] = [];
  const grow = (x0: number, y0: number, a0: number, L: number, w0: number, d0: number, seed: number, depth: number): void => {
    const pts: V3[] = [], w: number[] = [], d: number[] = [];
    let x = x0, y = y0, a = a0;
    const n = Math.ceil(L / 4);
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      if (i > 1 && (x < (ARENA.x[0] + 0.4) * TILE || x > (ARENA.x[1] - 0.4) * TILE || y < (ARENA.y[0] + 0.4) * TILE || y > (ARENA.y[1] - 0.4) * TILE)) break;
      pts.push([x, y, 0]); w.push(w0 * (1 - 0.7 * f)); d.push(d0 + f * L);
      a += (hash(seed, i, 9501) - 0.5) * 0.45;
      x += (Math.cos(a) * L) / n; y += (Math.sin(a) * L) / n;
    }
    if (pts.length < 2) return;
    out.push({ pts, w, d });
    if (depth < 1) for (let b = 0; b < 2; b++) {
      if (hash(seed, b, 9502) < 0.3) continue;
      const j = Math.min(pts.length - 1, Math.floor(n * (0.3 + 0.4 * hash(seed, b, 9503))));
      grow(pts[j][0], pts[j][1], a0 + (b ? 1 : -1) * (0.5 + 0.5 * hash(seed, b, 9504)), L * (0.35 + 0.25 * hash(seed, b, 9505)), w[j] * 0.8, d[j], seed * 7 + b + 1, depth + 1);
    }
  };
  for (let f = 0; f < BLIGHT.fingers; f++) {
    const a = (f / BLIGHT.fingers) * TAU + 0.3 + (hash(f, 1, 9506) - 0.5) * 0.45;
    const r0 = BLIGHT.core * TILE * 0.8;
    grow(BLIGHT_AT[0] + Math.cos(a) * r0, BLIGHT_AT[1] + Math.sin(a) * r0, a, (5.5 + 3.5 * hash(f, 2, 9507)) * TILE, (0.5 + 0.2 * hash(f, 3, 9508)) * TILE, r0, f + 1, 0);
  }
  return out;
})();
/** THE ROT'S REACH over the floor, worked out once: a grid (a cell a length) of how far the rot has to creep to reach each spot, and
 * how deep into a finger it is (1 at its middle, 0 at its edge); nothing where it never reaches. */
export const BLIGHT_FIELD = ((): { x0: number; y0: number; w: number; h: number; at: Float32Array; deep: Float32Array; far: number } => {
  const R = 12.5 * TILE;
  const x0 = Math.floor(BLIGHT_AT[0] - R), y0 = Math.floor(BLIGHT_AT[1] - R), w = Math.ceil(2 * R), h = Math.ceil(2 * R);
  const at = new Float32Array(w * h).fill(Infinity), deep = new Float32Array(w * h);
  const mark = (cx: number, cy: number, d: number, dp: number): void => {
    const k = (cy - y0) * w + (cx - x0);
    if (cx < x0 || cy < y0 || cx >= x0 + w || cy >= y0 + h) return;
    if (d < at[k]) at[k] = d;
    if (dp > deep[k]) deep[k] = dp;
  };
  const core = BLIGHT.core * TILE;
  for (let yy = -core; yy <= core; yy++) for (let xx = -core; xx <= core; xx++) {
    const r = Math.hypot(xx, yy);
    const rim = core * (0.85 + 0.15 * Math.sin(Math.atan2(yy, xx) * 5));
    if (r < rim) mark(Math.round(BLIGHT_AT[0] + xx), Math.round(BLIGHT_AT[1] + yy), r, 1 - r / rim);
  }
  let far = core;
  for (const fg of BLIGHT_FINGERS) for (let i = 1; i < fg.pts.length; i++) {
    const [ax, ay] = fg.pts[i - 1], [bx, by] = fg.pts[i];
    const L = Math.hypot(bx - ax, by - ay) || 1, wm = Math.max(fg.w[i - 1], fg.w[i]);
    for (let yy = Math.floor(Math.min(ay, by) - wm); yy <= Math.ceil(Math.max(ay, by) + wm); yy++) for (let xx = Math.floor(Math.min(ax, bx) - wm); xx <= Math.ceil(Math.max(ax, bx) + wm); xx++) {
      const u = clamp01(((xx - ax) * (bx - ax) + (yy - ay) * (by - ay)) / (L * L));
      const px = ax + (bx - ax) * u, py = ay + (by - ay) * u, dist = Math.hypot(xx - px, yy - py);
      const ww = (fg.w[i - 1] + (fg.w[i] - fg.w[i - 1]) * u) * (0.85 + 0.3 * hash(Math.floor(xx / 5), Math.floor(yy / 5), 9509));
      if (dist > ww) continue;
      const d = fg.d[i - 1] + (fg.d[i] - fg.d[i - 1]) * u + dist * 0.5;
      far = Math.max(far, d);
      mark(xx, yy, d, 1 - dist / ww);
    }
  }
  return { x0, y0, w, h, at, deep, far };
})();
/** How far the rot has crept (as `BLIGHT_FIELD`'s `at`), `t` into the move. */
export const blightReach = (t: number): number => {
  const u = clamp01((t - MELD.slam - BLIGHT.spread[0]) / (BLIGHT.spread[1] - BLIGHT.spread[0]));
  return (1 - (1 - u) * (1 - u) * (1 - u)) * BLIGHT_FIELD.far * 1.02 + (u > 0 ? 1 : -1);
};
/** The rot at a spot of the floor: how far it had to creep to get there (Infinity, never), and how deep into a finger it is. */
export function blightAt(x: number, y: number): { at: number; deep: number } {
  const cx = Math.round(x) - BLIGHT_FIELD.x0, cy = Math.round(y) - BLIGHT_FIELD.y0;
  if (cx < 0 || cy < 0 || cx >= BLIGHT_FIELD.w || cy >= BLIGHT_FIELD.h) return { at: Infinity, deep: 0 };
  const k = cy * BLIGHT_FIELD.w + cx;
  return { at: BLIGHT_FIELD.at[k], deep: BLIGHT_FIELD.deep[k] };
}
/** The dead trees: where each stands (his floor point's own lengths), how big, and when it bursts up (the move's own time). */
export const BLIGHT_TREES: ReadonlyArray<{ at: V3; size: number; t: number; seed: number }> = ((): { at: V3; size: number; t: number; seed: number }[] => {
  const out: { at: V3; size: number; t: number; seed: number }[] = [];
  const when = (d: number): number => MELD.slam + BLIGHT.heave + BLIGHT.ripple * (d / BLIGHT_FIELD.far);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + 0.5, r = (0.3 + 0.25 * hash(i, 1, 9511)) * BLIGHT.core * TILE;
    out.push({ at: [BLIGHT_AT[0] + Math.cos(a) * r, BLIGHT_AT[1] + Math.sin(a) * r, 0], size: 1.25 + 0.15 * hash(i, 2, 9512), t: when(r), seed: i });
  }
  for (const [f, fg] of BLIGHT_FINGERS.entries()) {
    const L = fg.d[fg.d.length - 1] - fg.d[0];
    if (L < 2.2 * TILE) continue;
    const n = Math.max(1, Math.round(L / (3.3 * TILE)));
    for (let j = 0; j < n; j++) {
      const u = (j + 0.4 + 0.3 * hash(f, j, 9513)) / n, i = Math.min(fg.pts.length - 2, Math.floor(u * (fg.pts.length - 1))), v = u * (fg.pts.length - 1) - i;
      const a = fg.pts[i], b = fg.pts[i + 1], w = fg.w[i] + (fg.w[i + 1] - fg.w[i]) * v;
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny) || 1, side = (hash(f, j, 9514) - 0.5) * 0.6 * w;
      const at: V3 = [a[0] + (b[0] - a[0]) * v + (nx / nl) * side, a[1] + (b[1] - a[1]) * v + (ny / nl) * side, 0];
      out.push({ at, size: 0.75 + 0.45 * (w / (0.6 * TILE)) * (0.8 + 0.4 * hash(f, j, 9515)), t: when(fg.d[i] + (fg.d[i + 1] - fg.d[i]) * v), seed: 100 + f * 31 + j });
    }
  }
  return out;
})();
/** THE BLIGHT'S SOLIDS, `t` into the move: the dead trees punching up out of the rot, standing, cracking, crumbling and sinking
 * back; splinters thrown up with them; spores rising. */
export function blightBits(t: number, put: Put, keep: (x: number, y: number) => boolean = () => true): void {
  const out = (t2: number): number => { const c = clamp01(t2); const s2 = 1.9; return 1 + (s2 + 1) * Math.pow(c - 1, 3) + s2 * Math.pow(c - 1, 2); };
  for (const [n, tr] of BLIGHT_TREES.entries()) {
    const u = t - tr.t;
    if (u < 0 || !keep(tr.at[0], tr.at[1])) continue;
    const wi = clamp01((u - BLIGHT.rise - BLIGHT.hold) / BLIGHT.wither);
    if (wi >= 1) continue;
    const g = out(u / BLIGHT.rise) * (1 - wi);
    const S = tr.size, sd = tr.seed;
    const H = (120 + 50 * hash(sd, 1, 9521)) * S;
    const ramp = wi > 0.15 ? DEAD_ASH : BARK;
    const part = `tree${n % 6}`;
    // (the whole of it rising out of the rot, scaled up out of it as it punches up)
    const P = (q2: V3): V3 => [tr.at[0] + q2[0] * g, tr.at[1] + q2[1] * g, q2[2] * g];
    const rod = (piece: string, a2: V3, b2: V3, ra: number, rb: number, rp: Ramp = ramp): void => put(part, piece, { k: 'rod', a: P(a2), b: P(b2), ra: ra * Math.max(0.4, g), rb: rb * Math.max(0.4, g), ramp: rp });
    let q = (sd * 2654435761) >>> 0;
    const rnd = (): number => { q = (q + 0x6d2b79f5) >>> 0; let z = q; z = Math.imul(z ^ (z >>> 15), z | 1); z ^= z + Math.imul(z ^ (z >>> 7), z | 61); return ((z ^ (z >>> 14)) >>> 0) / 4294967296; };
    const turnBy = (v: V3, amt: number): V3 => norm([v[0] + (rnd() - 0.5) * amt, v[1] + (rnd() - 0.5) * amt, v[2] + (rnd() - 0.5) * amt * 0.6]);
    // (A LIMB: crooked, in bends, tapering; at its end it forks again, two or three ways, into smaller limbs, down to claws. The
    // trunk is the first of them: its bark ridged (dark creases running up it, twisting round it), his pink glowing out of a split
    // in it. As it crumbles its smallest limbs break off first.)
    const limb = (from: V3, dir: V3, L: number, r: number, depth: number): void => {
      if (depth >= 2 && wi > 0.35) return;
      if (depth >= 1 && wi > 0.6) return;
      let p = from, d = dir;
      const segs = depth === 0 ? 4 : 3;
      for (let k = 0; k < segs; k++) {
        d = turnBy(d, depth === 0 ? 0.3 : 0.45);
        if (depth > 0) d = norm([d[0], d[1], d[2] + 0.2]);
        const e: V3 = [p[0] + d[0] * (L / segs), p[1] + d[1] * (L / segs), Math.max(1, p[2] + d[2] * (L / segs))];
        const ra = r * (1 - (0.55 * k) / segs), rb = r * (1 - (0.55 * (k + 1)) / segs);
        rod(depth === 0 ? 'trunk' : 'limb', p, e, ra, rb);
        if (depth <= 1 && ra > 2.2) {
          const side = norm(cross(d, [0, 0, 1])), up2 = norm(cross(side, d));
          const nC = depth === 0 ? 4 : 2;
          for (let c = 0; c < nC; c++) {
            const an = (c / nC) * TAU + k * 0.5 + sd;
            const o = (rr: number): V3 => add(mul(side, Math.cos(an) * rr), mul(up2, Math.sin(an) * rr));
            rod('crease', add(p, o(ra * 0.97)), add(e, o(rb * 0.97)), Math.max(0.7, ra * 0.2), Math.max(0.5, rb * 0.2), CREASE_BARK);
          }
          if (depth === 0 && k < 3 && wi < 0.3) {
            const o = add(mul(side, Math.cos(sd) * ra * 0.9), mul(up2, Math.sin(sd) * ra * 0.9));
            rod('split', add(p, o), add(e, mul(o, rb / ra)), Math.max(0.9, ra * 0.26), Math.max(0.6, rb * 0.2), SPLIT_GLOW);
            if (k === 1) put('splitGlow', 'glow', { k: 'glow', p: P(add(p, o)), c: '#ff4f8a', r: 14 * S, a: 0.35 * (1 - wi / 0.3) });
          }
        }
        p = e;
      }
      if (depth >= 2) {
        // (claws at its end)
        for (const c of [-0.6, 0.6]) {
          const cd = turnBy(norm([d[0] + c * d[1], d[1] - c * d[0], d[2] + 0.3]), 0.3), cl = L * 0.35;
          rod('claw', p, [p[0] + cd[0] * cl, p[1] + cd[1] * cl, p[2] + cd[2] * cl], r * 0.5, 0.3);
        }
        return;
      }
      const kids = depth === 0 ? 2 + (rnd() < 0.5 ? 1 : 0) : 2;
      for (let c = 0; c < kids; c++) {
        const sp = (depth === 0 ? 0.5 : 0.55) + 0.35 * rnd(), an = (c / kids) * TAU + rnd() * 1.2;
        const side = norm(cross(d, [Math.cos(an), Math.sin(an), 0.2]));
        const nd = norm(add(mul(d, Math.cos(sp)), mul(side, Math.sin(sp))));
        limb(p, norm([nd[0], nd[1], Math.max(0.15, nd[2])]), L * (0.6 + 0.15 * rnd()), r * 0.5, depth + 1);
      }
    };
    const la = rnd() * TAU, lean = 0.1 + 0.15 * rnd();
    limb([0, 0, 0], norm([Math.cos(la) * lean, Math.sin(la) * lean, 1]), H * 0.55, 9 * S, 0);
    // (flared roots clawing out over the rot at its foot)
    for (let r = 0; r < 5; r++) {
      const ra = (r / 5) * TAU + rnd() * 0.8;
      const kn: V3 = [Math.cos(ra) * 9 * S, Math.sin(ra) * 9 * S, 5 * S];
      rod('root', [0, 0, 12 * S], kn, 5 * S, 3 * S);
      rod('root', kn, [Math.cos(ra + 0.3) * 22 * S, Math.sin(ra + 0.3) * 22 * S, 0.5], 3 * S, 0.6);
    }
    // (splinters of the floor and rot thrown up as it bursts out, falling back)
    if (u < 0.7) for (let c = 0; c < 6; c++) {
      const a2 = hash(sd, c, 9530) * TAU, sp = 40 + 60 * hash(sd, c, 9531), vz = 90 + 90 * hash(sd, c, 9532), gz = 520;
      const w = Math.min(u, (2 * vz) / gz);
      put('splinters', 'splinter', { k: 'mote', p: [tr.at[0] + Math.cos(a2) * sp * w, tr.at[1] + Math.sin(a2) * sp * w, Math.max(0, vz * w - 0.5 * gz * w * w)], c: c % 3 ? '#2c2a1c' : '#7e9a3a', size: 2 });
    }
    // (spores rising off it while it stands)
    if (wi === 0 && u > BLIGHT.rise) for (let c = 0; c < 3; c++) {
      const v = ((u - BLIGHT.rise) * 0.8 + hash(sd, c, 9534)) % 1;
      put('spores', 'spore', { k: 'mote', p: [tr.at[0] + Math.cos(c * 2.1 + sd) * 10 * S + 6 * v, tr.at[1] + Math.sin(c * 2.1 + sd) * 10 * S, 8 + 50 * v * S], c: '#b8cc7a', size: v < 0.5 ? 2 : 1 });
    }
    // (crumbling: its ash falling off it as it sinks)
    if (wi > 0) for (let c = 0; c < 6; c++) {
      const v = (wi * 1.5 + hash(sd, c, 9535)) % 1;
      put('ash', 'ash', { k: 'mote', p: [tr.at[0] + (hash(sd, c, 9536) - 0.5) * 16 * S, tr.at[1] + (hash(sd, c, 9537) - 0.5) * 16 * S, H * (1 - wi) * (1 - v)], c: c % 2 ? '#6e6670' : '#948c96', size: 2 });
    }
  }
}
/** The blight's picture; with `nearer` (a floor point in his own lengths), only its trees nearer the eye than that, inked but without
 * their rim: laid over a figure (him, his shade, the hero) where it stands among them. */
export function paintBlight(t: number, view: 'front' | 'rear', nearer: V3 | null = null): Painted {
  const st = stage(view, BLIGHT_CANVAS.ax, BLIGHT_CANVAS.ay, BLIGHT_CANVAS);
  const bits: Bit[] = [];
  const lo = nearer ? st.near(nearer) : -Infinity;
  blightBits(t, (part, piece, shape) => bits.push({ part, piece, shape }), (x, y) => st.near([x, y, 0]) >= lo);
  const lights = paintBits(st, bits, [0, 0, 20]);
  return { px: st.whole(nearer ? null : ENEMY_RIM), lights: nearer ? [] : lights } as Painted;
}

// SCALD (Flame and Frost, melded: the game's meld, render/melds3.ts, “steam rising off scalding water”; and on the ground, as the
// game has it, “Fire meeting ice on the ground bursts into steam that hurts and hides”): he writes Flame, his shade writes Frost;
// melded, the slam drives the rune into the floor at his feet, and A RING OF ICE races out round him over the floor, a broad band
// of it, leaving him and the ground at his feet bare (the warning: the ice flushed in the colour of every boss's warning on the
// ground, its edges hot); fire glows up through its cracks, hotter and hotter, the ice hissing; then the whole ring FLASHES into
// scalding steam: great billows of it boiling up and rolling over, hiding all in it, his pink-hot at their roots; it hangs, drifts
// and thins away off a wet floor. The safe ground is close to him, inside the ring, or far out past it. His rules for the words
// stand: one rune (the meld's), what it makes made as solids (the steam's billows).
export const SCALD = { r0: 2.0, r1: 6.4, freeze: [0.05, 0.55] as const, heat: [0.55, 1.55] as const, flash: 1.65, rise: 0.5, hang: 1.4, thin: 1.3, puffs: 60, end: 6.4 };
export const SCALD_CANVAS: MobCanvas = { w: 1200, h: 900, ax: 600, ay: 560 };
const STEAM: Ramp = ['#5a4446', '#a08884', '#d8c4bc', '#f2e4dc', '#ffffff'];
/** How far out the ice has raced (his floor point's own lengths, from him), `t` into the move. */
export const scaldIce = (t: number): number => {
  const u = clamp01((t - MELD.slam - SCALD.freeze[0]) / (SCALD.freeze[1] - SCALD.freeze[0]));
  return (SCALD.r0 + (SCALD.r1 - SCALD.r0) * (1 - (1 - u) * (1 - u))) * TILE;
};
/** Whether a spot of the floor is in the ring (its ragged edges, frost-fronted). */
export function scaldIn(x: number, y: number, pad = 0): boolean {
  const r = Math.hypot(x, y), a = Math.atan2(y, x);
  const rag = (k: number): number => (Math.sin(a * 7 + k) * 0.5 + Math.sin(a * 13 + k * 2) * 0.3 + Math.sin(a * 23 + k) * 0.2) * 0.22 * TILE;
  return r > SCALD.r0 * TILE + rag(1) - pad && r < SCALD.r1 * TILE + rag(4) + pad;
}
/** The steam's billows: where each boils up (his floor point's own lengths), how big it grows, how high it rises. */
export const SCALD_PUFFS: ReadonlyArray<{ at: V3; R: number; up: number; d: number }> = Array.from({ length: SCALD.puffs }, (_, i) => {
  for (let k = 0; ; k++) {
    const a = hash(i, k, 9601) * TAU, r = (SCALD.r0 + (SCALD.r1 - SCALD.r0) * Math.sqrt(hash(i, k, 9602))) * TILE;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (scaldIn(x, y, -6) || k > 20) return { at: [x, y, 0] as V3, R: 20 + 14 * hash(i, 3, 9603), up: 40 + 150 * hash(i, 4, 9604), d: hash(i, 5, 9605) };
  }
});
/** THE SCALD'S SOLIDS, `t` into the move: hot droplets flung out of the steam as it flashes (the steam itself is vapour, not a solid:
 * drawn soft, banded, as `scaldSteamAt` has it). Only those `keep` keeps (by their floor point). */
export function scaldBits(t: number, put: Put, keep: (x: number, y: number) => boolean = () => true): void {
  const f = t - MELD.slam - SCALD.flash;
  if (f < 0) return;
  const gone = clamp01((f - SCALD.rise - SCALD.hang) / SCALD.thin);
  if (gone >= 1) return;
  // (hot droplets flung out of it as it flashes)
  if (f < 0.8) for (let i = 0; i < 70; i++) {
    const p = SCALD_PUFFS[i % SCALD_PUFFS.length];
    if (!keep(p.at[0], p.at[1])) continue;
    const a = hash(i, 1, 9607) * TAU, sp = 60 + 80 * hash(i, 2, 9608), vz = 120 + 100 * hash(i, 3, 9609), g = 600;
    const z = vz * f - 0.5 * g * f * f;
    if (z < 0) continue;
    put('drops', 'drop', { k: 'mote', p: [p.at[0] + Math.cos(a) * sp * f, p.at[1] + Math.sin(a) * sp * f, z], c: i % 4 ? '#fff4ec' : '#ff9cc0', size: 1 });
  }
  if (f < 0.35) put('glow', 'scaldGlow', { k: 'glow', p: [0, 0, 20], c: '#ffb090', r: 260, a: 0.4 * (1 - f / 0.35) });
}
/** THE STEAM, `t` into the move: each billow's plume (his floor point's own lengths: where it stands on the floor, the heights and
 * sizes of the puffs it boils up in), how thick it is (0 ... 1, thinning away), how hot it is at its root (as it flashes). */
export function scaldSteamAt(t: number): { at: V3; puffs: [number, number, number, number][]; thick: number; hot: number }[] {
  const f = t - MELD.slam - SCALD.flash;
  if (f < 0) return [];
  const gone = clamp01((f - SCALD.rise - SCALD.hang) / SCALD.thin);
  if (gone >= 1) return [];
  const out: { at: V3; puffs: [number, number, number, number][]; thick: number; hot: number }[] = [];
  for (const p of SCALD_PUFFS) {
    const u = f - p.d * 0.12;
    if (u < 0) continue;
    const r = clamp01(u / SCALD.rise), e = 1 - (1 - r) * (1 - r);
    const R = p.R * (0.4 + 0.6 * e) * (1 + 0.3 * gone);
    const n = Math.hypot(p.at[0], p.at[1]) || 1, drift = 12 * u;
    const at: V3 = [p.at[0] + (p.at[0] / n) * drift, p.at[1] + (p.at[1] / n) * drift, 0];
    const top = p.up * e + 14 * u;
    // (a plume of it: lumpy billows heaped up its height, each over the last and swaying off it, widening as it rises)
    const n2 = Math.max(1, Math.ceil(top / (0.7 * R)));
    const k0 = SCALD_PUFFS.indexOf(p);
    const puffs: [number, number, number, number][] = Array.from({ length: n2 + 1 }, (_, j) => {
      const rj = R * (1 + (0.55 * j) / n2) * (0.75 + 0.5 * hash(k0, j, 9621));
      const sw = R * 0.5 * (j / n2 + 0.2);
      return [R * 0.6 + (top * j) / n2, rj, sw * Math.sin(j * 1.7 + k0 + t * 1.3), sw * 0.6 * Math.cos(j * 1.3 + k0 * 2 + t * 1.1)];
    });
    out.push({ at, puffs, thick: (1 - gone) * Math.min(1, u / 0.08), hot: Math.max(0, 1 - u / 0.3) });
  }
  return out;
}
/** The scald's picture; with `nearer` (a floor point in his own lengths), only its steam nearer the eye than that, inked but without
 * its rim or its light: laid over a figure (him, his shade, the hero) where it stands in it. */
export function paintScald(t: number, view: 'front' | 'rear', nearer: V3 | null = null): Painted {
  const st = stage(view, SCALD_CANVAS.ax, SCALD_CANVAS.ay, SCALD_CANVAS);
  const bits: Bit[] = [];
  const lo = nearer ? st.near(nearer) : -Infinity;
  scaldBits(t, (part, piece, shape) => bits.push({ part, piece, shape }), (x, y) => st.near([x, y, 0]) >= lo);
  const lights = paintBits(st, bits, [0, 0, 20]);
  return { px: st.whole(nearer ? null : ENEMY_RIM), lights: nearer ? [] : lights } as Painted;
}


// THUNDER (Power and Lightning, melded: “a storm cloud and its one great bolt”): he writes Power, his shade writes Lightning; melded,
// the slam flings the rune straight up out of sight; a GREAT RING of crackling violet locks onto where the hero stands, tightening as
// it charges (the warning); then ONE GREAT BOLT, a pillar of violet-white lightning the width of a man, hammers down on it: the
// floor blasted into a crater, rock thrown out of it, a THUNDERCLAP ring rolling out over the floor, sparks crawling from it. Three
// times, each locking on faster, following the hero. His rules for the words stand: one rune (the meld's), what it makes made as
// solids (the rock it throws; the bolt is light, as his Lightning's are). Seven times (his word, below).
// MORE STRIKES (his words, 13 Nov 2026: “The lightning doesn’t look like lightning but I like the idea.  Maybe more strikes, 6-7
// total”): seven, each locking on faster than the last, each where the hero has gone.
// AND THE THUNDER IN IT (his words, 13 Nov 2026: “Also the word is thunder so that should be involved somehow”): storm clouds gather
// over the room as the rune goes up into them, rumbling as each ring locks on; and a moment after each bolt its THUNDERCLAP rolls out
// over the floor from where it struck, a ring of force rippling the floor and throwing up its dust: one caught in it is knocked back.
export const THUNDER = {
  strikes: [
    { at: [2.6, -2.4], warn: 0.9 }, { at: [4.3, -0.7], warn: 0.78 }, { at: [6.0, 1.0], warn: 0.68 }, { at: [8.2, 0.05], warn: 0.6 },
    { at: [6.5, -1.65], warn: 0.52 }, { at: [4.8, -3.35], warn: 0.46 }, { at: [3.1, -5.05], warn: 0.42 },
  ] as const,
  first: 0.75, gap: 0.35, R: 1.6, clap: 3.2, clapAfter: 0.08, clapLong: 0.5, bolt: 0.3, clouds: [0.05, 0.7] as const, end: 9.6,
};
/** How far a strike's thunderclap has rolled out from where it struck (his floor point's own lengths), `u` seconds after the bolt;
 * null before it comes or once it is gone. */
export function thunderClapR(u: number): number | null {
  const v = (u - THUNDER.clapAfter) / THUNDER.clapLong;
  if (v < 0 || v >= 1) return null;
  return 10 + THUNDER.clap * TILE * (1 - (1 - v) * (1 - v));
}
/** When a strike's thunderclap reaches `d` from where it struck (seconds after the bolt). */
export function thunderClapAt(d: number): number {
  const C = THUNDER.clap * TILE;
  return THUNDER.clapAfter + (1 - Math.sqrt(Math.max(0, 1 - (d - 10) / C))) * THUNDER.clapLong;
}
export const THUNDER_CANVAS: MobCanvas = { w: 900, h: 640, ax: 260, ay: 420 };
/** Each strike: where (his floor point's own lengths), when its ring locks on, when the bolt falls (the move's own time). */
export const THUNDER_STRIKES: ReadonlyArray<{ at: V3; lock: number; t: number }> = ((): { at: V3; lock: number; t: number }[] => {
  const out: { at: V3; lock: number; t: number }[] = [];
  let t = MELD.slam + THUNDER.first;
  for (const s of THUNDER.strikes) {
    out.push({ at: [s.at[0] * TILE, s.at[1] * TILE, 0], lock: t, t: t + s.warn });
    t += s.warn + THUNDER.gap;
  }
  return out;
})();
const THUNDER_ROCK: Ramp = ['#1c1038', '#2e2440', '#4a4058', '#6e6478', '#948aa0'];
/** THE THUNDER'S SOLIDS, `t` into the move: the rock thrown out of each crater, falling and lying there. */
export function thunderBits(t: number, put: Put): void {
  for (const [k, s] of THUNDER_STRIKES.entries()) {
    const u = t - s.t;
    if (u < 0) continue;
    for (let i = 0; i < 14; i++) {
      const a = hash(k, i, 9921) * TAU;
      const sp = 60 + 90 * hash(k, i, 9922);
      const vz = 120 + 110 * hash(k, i, 9923);
      const g = 600;
      const tl = (2 * vz) / g;
      const w = Math.min(u, tl);
      const fade = u > 2.2 ? 1 - Math.min(1, (u - 2.2) / 0.6) : 1;
      if (fade <= 0) continue;
      const R = (3.6 + 3.6 * hash(k, i, 9924)) * (0.6 + 0.4 * fade);
      const c: V3 = [s.at[0] + Math.cos(a) * sp * w, s.at[1] + Math.sin(a) * sp * w, Math.max(R * 0.55, vz * w - 0.5 * g * w * w)];
      // (a jagged chunk of the floor, four-faced, tumbling as it flies, still once it lies)
      const spin = w * (8 + 10 * hash(k, i, 9925));
      const ax = norm([hash(k, i, 9926) - 0.5, hash(k, i, 9927) - 0.5, hash(k, i, 9928) - 0.5]);
      const corner = ([x, y, z]: V3, j: number): V3 => {
        const r = R * (0.75 + 0.6 * hash(k, i * 4 + j, 9929));
        const d = norm([x, y, z]);
        // (turned about its own axis by `spin`: Rodrigues)
        const cs = Math.cos(spin), sn = Math.sin(spin), dt = ax[0] * d[0] + ax[1] * d[1] + ax[2] * d[2];
        const cr: V3 = [ax[1] * d[2] - ax[2] * d[1], ax[2] * d[0] - ax[0] * d[2], ax[0] * d[1] - ax[1] * d[0]];
        return [c[0] + r * (d[0] * cs + cr[0] * sn + ax[0] * dt * (1 - cs)), c[1] + r * (d[1] * cs + cr[1] * sn + ax[1] * dt * (1 - cs)), Math.max(0.3, c[2] + r * (d[2] * cs + cr[2] * sn + ax[2] * dt * (1 - cs)))];
      };
      const P4 = ([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as V3[]).map((d, j) => corner(d, j));
      const hot = u < 0.6;
      for (const [a0, b0, c0] of [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]]) {
        const p0 = P4[a0], e1 = sub(P4[b0], p0), e2 = sub(P4[c0], p0);
        const lu = len(e1) / 2, lv = len(e2) / 2;
        put(`rock${k}`, 'rock', { k: 'panel', c: add(p0, mul(add(e1, e2), 0.5)), u: mul(e1, 0.5), v: mul(e2, 0.5), skin: (aa, bb, _f, tone) => (aa / lu + bb / lv > 0 ? null : hot && hash(Math.round(aa * 2), Math.round(bb * 2), 9930 + i) > 0.86 ? '#ff9cc0' : THUNDER_ROCK[T5(tone)]) });
      }
    }
    if (u < 0.3) put('glow', 'boltGlow', { k: 'glow', p: [s.at[0], s.at[1], 20], c: '#f0e4ff', r: 70, a: 0.6 * (1 - u / 0.3) });
  }
}
export function paintThunder(t: number, view: 'front' | 'rear'): Painted {
  const st = stage(view, THUNDER_CANVAS.ax, THUNDER_CANVAS.ay, THUNDER_CANVAS);
  const bits: Bit[] = [];
  thunderBits(t, (part, piece, shape) => bits.push({ part, piece, shape }));
  const lights = paintBits(st, bits, [0, 0, 20]);
  return { px: st.whole(ENEMY_RIM), lights } as Painted;
}

/** Where his heart is as he implodes (as his own points are). */
let DEATH_H: V3 | null = null;
const DEATH_HEART = (): V3 => (DEATH_H ??= heartOf(solve(B, { ...standing(B), ...deathRiderAt(DEATH.implode[0]) } as never)));
/** Where the game has him as he stands, risen: where he landed, from the floor point it carried down its lane. */
export function footFrom(): [number, number] {
  const p = fallRiderAt(FALL.long).pelvis;
  return [p[0], p[1]];
}
/** Whether his staff is planted on the floor (on foot: his fist sliding along it, its foot down), or held as he rides. */
export const plantedIn = (move: string, t: number): number => (move === 'turn' ? 1 - TURN.turns.reduce((m, [a0, b0]) => Math.max(m, bumpOf(t, a0 - 0.1, b0 + 0.1)), 0) : FOOT_MOVES.has(move) ? 1 : move === 'fall' ? smooth01((t - FALL.kill - FALL.throw - FALL.fly) / 0.35) : 0);
/** His moves on foot (no boar under him). */
export const FOOT_MOVES = new Set<string>(['foot', 'turn', 'death', 'eruption', 'avalanche', 'thunder', 'blight', 'scald', 'wildfire', 'fumes', 'hailstorm', 'frostbite', 'contagion']);

// =============================================================================================
// HIS SHADE (his words, 12 Nov 2026, for the second phase: “how about a large pink energy shade that looms above him and mimics his
// movements.  he forges a word, as he would in phase one, the shade also phases a word, and they meld into the new attack.”; and,
// of his rising: “i want to be nervous that hes now on foot”): a great figure of his own pink, more than twice his height, risen
// out of him as he strikes the floor and looming over him from behind, a little off the floor; it does whatever he does, a moment
// after him, as a shadow does; made of his power, it burns: bands of it rising through it, flickering, its eyes white-hot. It is
// painted apart from him, on his own bones, every part of him made great: the game lays it behind him, its light over the floor.
export const SHADE = { size: 2.35, behind: 52, side: -10, up: 24, lag: 0.1 };
/** WHERE IT STANDS ROUND HIM (his pick, 13 Nov 2026, asked how it turns with him: “Glides round behind him (Recommended)”, offered as:
 * it sweeps round on a curve a beat after he turns, never teleporting, and never steps in front of him or your view of him): behind
 * his back, at its distance, as he faces; but always on the far side of him from the eye, so that it never covers him or his warnings
 * (his rulebook's Animations 4): facing away, it looms over him from just above, not round in front. The game glides it there,
 * `shadeGlide`. Angles are the floor's own (radians: 0 his forward at rest, + to his left). */
export const SHADE_GLIDE = { lag: 0.3, far: (135 * Math.PI) / 180, within: (78 * Math.PI) / 180 };
const wrapA = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));
/** Where it wants to be, his facing `yaw` (degrees): behind him, kept to the far side. */
export function shadeWants(yaw: number): number {
  const behind = wrapA((yaw * Math.PI) / 180 + Math.PI + Math.atan2(-SHADE.side, SHADE.behind));
  const d = wrapA(behind - SHADE_GLIDE.far);
  return wrapA(SHADE_GLIDE.far + Math.max(-SHADE_GLIDE.within, Math.min(SHADE_GLIDE.within, d)));
}
/** Where it is, `t` seconds on, his facing over time `yawAt` (degrees): eased round after where it wants to be, the short way round,
 * a beat after him, never a jump. */
export function shadeGlide(yawAt: (t: number) => number, t: number): number {
  let a = shadeWants(yawAt(0));
  const dt = 1 / 60;
  for (let u = dt; u <= t + 1e-9; u += dt) a = wrapA(a + wrapA(shadeWants(yawAt(u)) - a) * (1 - Math.exp(-dt / SHADE_GLIDE.lag)));
  return a;
}
export const SHADE_CANVAS: MobCanvas = { w: 460, h: 560, ax: 230, ay: 470 };
/** His pink as the shade is made of it: dark at its depths, hot at its edges and its eyes. */
export const SHADE_PINK: Ramp = ['#2a0618', '#5e0f36', '#a01e58', '#e2367a', '#ff7aa8'];
const SHADE_HOT = '#ffd8e6';
/** A part of him made great, about `O` (his floor point), by `k`, and moved by `off`. */
function greatShape(sh: Shape, O: V3, k: number, off: V3): Shape {
  const P = (p: V3): V3 => add(add(O, mul(sub(p, O), k)), off);
  const R = (r: Ring): Ring => ({ c: P(r.c), u: mul(r.u, k), v: mul(r.v, k) });
  switch (sh.k) {
    case 'rod': return { ...sh, a: P(sh.a), b: P(sh.b), ra: sh.ra * k, rb: sh.rb * k };
    case 'ball': return { ...sh, c: P(sh.c), ax: [mul(sh.ax[0], k), mul(sh.ax[1], k), mul(sh.ax[2], k)] };
    case 'cloth': return { ...sh, rings: sh.rings.map(R) };
    case 'band': return { ...sh, ring: R(sh.ring) };
    case 'panel': return { ...sh, c: P(sh.c), u: mul(sh.u, k), v: mul(sh.v, k) };
    case 'thread': return { ...sh, a: P(sh.a), b: P(sh.b) };
    case 'dot': return { ...sh, p: P(sh.p) };
    case 'mote': return { ...sh, p: P(sh.p), size: Math.min(3, Math.round(sh.size * Math.sqrt(k))) };
    case 'glow': return { ...sh, p: P(sh.p), r: sh.r * k };
    default: return sh;
  }
}
/** A colour of his made of the shade's pink: its light kept, its colour his pink. */
function shadeOf(c: string): string {
  const n = parseInt(c.slice(1, 7), 16);
  const l = 0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255);
  return SHADE_PINK[Math.max(0, Math.min(4, Math.round((l / 255) * 5.2 - 0.3)))];
}
/** HIS SHADE (his words, 13 Nov 2026, of a remake as raw fire: “I take it back, I like the old shade better”: his own figure made
 * great and made of his pink), `t` seconds into a move, risen as far as `grow` (0, inside him ... 1, looming over him), from his skeleton then: his
 * picture made great and made of his pink, bands of it rising through it. Its canvas's anchor is his floor point. */
export function paintShade(s: Skeleton, t: number, view: 'front' | 'rear', grow = 1, lean = 0, around = Math.atan2(SHADE.side, -SHADE.behind)): Painted {
  const st = stage(view, SHADE_CANVAS.ax, SHADE_CANVAS.ay, SHADE_CANVAS);
  const raw: Bit[] = [];
  const put0: Put = (part, piece, shape) => raw.push({ part, piece, shape });
  robe(put0, s, t / WS_STAND_LONG, 0.35 * Math.sin(t * 2.1), t);
  arm(put0, s, 'L', s.chest[2], 0.32, 1.25);
  arm(put0, s, 'R', s.chest[2], 1, 0, staffOf(s, 0, true).up);
  put0('neck', 'neck', { k: 'rod', a: lerp3(s.ribs, s.neck, 0.5), b: lerp3(s.neck, s.head, 0.5), ra: 1.6, rb: 1.3, ramp: ASH });
  head(put0, st, s, t, 0.3);
  staff(put0, s, t, 0, true);
  const O: V3 = [s.pelvis[0], s.pelvis[1], 0];
  const k = 1 + (SHADE.size - 1) * grow;
  const far = Math.hypot(SHADE.behind, SHADE.side) * grow;
  const off: V3 = [Math.cos(around) * far - O[0] + lean, Math.sin(around) * far - O[1], SHADE.up * grow];
  // (bands of it rising through it, flickering: where they are it is thin)
  const band = (x: number, y: number): boolean => ((y + Math.floor(t * 40)) % 7 === 0 && hash(x >> 2, (y + Math.floor(t * 40)) >> 3, 9301) < 0.7) || hash(x, y + Math.floor(t * 30) * 3, 9302) < 0.06;
  const bits: Bit[] = raw.map(({ part, piece, shape }) => {
    const sh = greatShape(shape, O, k, off);
    if (sh.k === 'rod' || sh.k === 'cloth' || sh.k === 'band') return { part, piece, shape: { ...sh, ramp: (sh.ramp as Ramp).map(shadeOf) as unknown as Ramp } as Shape };
    if (sh.k === 'dot') return { part, piece, shape: { ...sh, c: part === 'head' ? SHADE_HOT : shadeOf(sh.c), ...(sh.c2 ? { c2: shadeOf(sh.c2) } : {}) } };
    if (sh.k === 'mote') return { part, piece, shape: { ...sh, c: SHADE_HOT } };
    if (sh.k === 'glow') return { part, piece, shape: { ...sh, c: BURN[2] } };
    if (sh.k === 'ball') {
      const sk = sh.skin;
      return { part, piece, shape: { ...sh, skin: (u: V3, tone: number, x: number, y: number) => {
        if (band(x, y)) return null;
        const c = Array.isArray(sk) ? (sk as Ramp)[T5(tone)] : (sk as (u: V3, tone: number, x: number, y: number) => string | null)(u, tone, x, y);
        return c ? shadeOf(c) : c;
      } } };
    }
    if (sh.k === 'panel') {
      const sk = sh.skin;
      return { part, piece, shape: { ...sh, skin: (a: number, b: number, front: boolean, tone: number) => { const c = sk(a, b, front, tone); return c ? shadeOf(c) : c; } } };
    }
    return { part, piece, shape: sh };
  });
  // (its light: a great glow of his pink about it, and its eyes)
  bits.push({ part: 'glow', piece: 'shadeGlow', shape: { k: 'glow', p: add(add(O, mul(sub(lerp3(s.ribs, s.neck, 0.3), O), k)), off), c: BURN[2], r: 40 * k * 0.6, a: 0.16 + 0.1 * Math.sin(t * 5) } });
  const lights = paintBits(st, bits, [0, 0, 20]);
  const px = st.whole(SHADE_HOT);
  // (bands of it rising through it, flickering, its edge thin: cut through the finished picture)
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (px.get(x, y) && band(x, y)) px.d[(y * px.w + x) * 4 + 3] = 0;
  return { px, lights } as Painted;
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
  things: (move: string, t: number, s: Skeleton) => {
    const st = staffOf(s, staffTiltOf(boarPoseAt(move, t)), plantedIn(move, t));
    const pts: V3[] = [];
    for (let i = 0; i <= 12; i++) pts.push(lerp3(st.foot, st.head, i / 12));
    return [{ name: 'staff', pts, r: 1.2, may: ['foreR', 'upperR'] }];
  },
  // (its hooves; and, its death, his boots once he is down on them: thrown clear, he lands on his feet)
  grips: (move: string, t: number, s: Skeleton) => [
    // (killed, they grip nothing: dragged as it slides)
    ...((move === 'fall' && t > FALL.kill) || FOOT_MOVES.has(move) ? [] : boarSoles(boarPoseAt(move, t)).map((p, i) => ({ name: `hoof${i}`, p }))),
    ...((move === 'fall' && fallLanded(t)) || FOOT_MOVES.has(move) ? [{ name: 'heelL', p: s.heelL }, { name: 'toeL', p: s.toeL }, { name: 'heelR', p: s.heelR }, { name: 'toeR', p: s.toeR }] : []),
  ],
  follow: (move: string, t: number, s: Skeleton, _q: Posed) => {
    const P = boarPoseAt(move, t);
    const H = headOf(P);
    const st = staffOf(s, staffTiltOf(P), plantedIn(move, t));
    const soles = boarSoles(P);
    const pts: Record<string, V3> = { head: s.head, handL: s.handL, handR: s.handR, pelvis: s.pelvis, ring: st.ring, snout: H.at(21.6, 0, -7.6) };
    // (no boar once it has blown away, nor on foot)
    if (FOOT_MOVES.has(move) || (move === 'fall' && (P.crumble ?? 0) >= 1)) delete pts.snout;
    // (its hooves followed as it stands and stamps; galloping, each is down on its own spot of the floor and held to that by
    // SLIDE, not followed as a thing in the air)
    if (move !== 'charge' && move !== 'fall' && !FOOT_MOVES.has(move)) Object.assign(pts, { hoof0: soles[0], hoof2: soles[2] });
    return pts;
  },
  // (the charge: the game carries it down its lane; its burst is a lightning strike, smeared)
  carried: (move: string, t: number) => (move === 'charge' ? chargeCarry(t) * TILE : move === 'fall' ? fallCarry(t) * TILE : 0),
  strikes: { charge: CHARGE_STRIKE, gore: GORE_STRIKE, stomp: STOMP_STRIKE, frost: FROST_STRIKE, fall: SLAM_STRIKE, eruption: MELD_STRIKE, hailstorm: MELD_STRIKE, avalanche: MELD_STRIKE, thunder: MELD_STRIKE, blight: MELD_STRIKE, scald: MELD_STRIKE },
  // (his hammer from the sky: three blows of his staff, each its own wind-up, flash and follow-through)
  blows: { power: POWER.slams.map((h, i) => ({ hit: h, strike: POWER_STRIKES[i], from: i ? POWER.slams[i - 1] + 0.1 : 0, until: i < 2 ? POWER.slams[i + 1] - POWER.raise : Infinity })) },
  smeared: (move: string, t: number) => (move === 'charge' && chargeSmeared(t)) || (move === 'gore' && goreSmeared(t)) || (move === 'stomp' && stompSmeared(t)) || (move === 'power' && powerSmeared(t)) || (move === 'frost' && frostSmeared(t)) || (move === 'fall' && slamSmeared(t)) || (FOOT_MOVES.has(move) && move !== 'foot' && meldSmeared(t)),
  // (the end the boar strikes with in its gore: its leading tusk's tip)
  tip: (move: string, t: number, s: Skeleton) => (move === 'gore' ? goreTip(boarPoseAt('gore', t)) : move === 'stomp' ? stompTip(boarPoseAt('stomp', t)) : move === 'power' || move === 'frost' ? staffOf(s, staffTiltOf(boarPoseAt(move, t))).ring : move === 'fall' || (FOOT_MOVES.has(move) && !['foot', 'death'].includes(move)) ? staffOf(s, 0, plantedIn(move, t)).ring : null),
  // (each move from his stand and back, as the game hands over; a run done, it wheels round out of its skid; done wheeling, the
  // game shows it from its other side and the next run goes back down the lane: that hand-over is the charge's own start drawn the
  // other way round, and is not one these checks can draw)
  handovers: [
    ...['attack', 'reel', 'charge', 'gore', 'stomp', 'power', 'flame', 'frost', 'lightning', 'poison'].flatMap((m): Handover[] => [{ from: 'stand', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'stand', toAt: 0 }]),
    { from: 'charge', at: 'end', to: 'wheel', toAt: 0 },
    // (killed mid-charge, flat out down its lane)
    { from: 'charge', at: FALL.from, to: 'fall', toAt: 0 },
    // (risen, on foot: his stand, and each meld from it and back)
    { from: 'fall', at: 'end', to: 'foot', toAt: 0, shift: footFrom() },
    { from: 'foot', at: 0, to: 'death', toAt: 0 },
    { from: 'foot', at: 0, to: 'turn', toAt: 0 },
    ...['eruption', 'hailstorm', 'avalanche', 'thunder', 'blight', 'scald'].flatMap((m): Handover[] => [{ from: 'foot', at: 0, to: m, toAt: 0 }, { from: m, at: 'end', to: 'foot', toAt: 0 }]),
    { from: 'stand', at: 0, to: 'dying', toAt: 0 },
    { from: 'stand', at: 0, to: 'walk', toAt: 0 },
  ],
};
void len;
