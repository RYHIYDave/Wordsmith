// FLOOR 14, THE HOUSE OF QUIET (THE PHYSICIAN'S THEATRE): ITS OWN PIECES, themed after its boss (a mock-up; nothing of
// the game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of
// the 5 levels, then 25 for each boss.” This floor's boss is the Physician (his doc "Wordsmith Act 2: The Hush", the
// planning chat's, with his yes as ideas): "A beaked plague doctor with a quill-tipped syringe", in the Physician's
// Theatre. The floor: "The city infirmary, where the Hushed are taken to be cured", "wards of iron beds, apothecary
// rooms, and a surgical theatre with a gallery"; its hazards "spilled tonics that leave clouds of the Hush on the
// floor"; its enemies "Hushed patients who sit up in their beds as you pass, and the Physician's orderlies"; its story
// "the doctors aren't curing anyone. They draw out people's last words. The Physician's ledger shows where every page
// goes: up the hill to the High City."; its palette "Whitewash, pale green lamplight"; its Muffled Bell "The chapel
// bell", its Bells "Patients' call bells in the wards". Its ground: art/housequiet.ts. Made on his word to this chat,
// 18 Oct, 21:24 Pacific: “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great
// jobs. At least for 11-15”.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says. Pink burning to gold only on what is the enemy's (the last words the
// Physician drew out, kept in phials); the infirmary's lamps burning behind green glass, their light a pale
// yellow-green (his doc's "pale green lamplight": an honest lamp's, never near the hero's cyan); the stove and the
// chapel's candles an honest orange; the Bells awake or rung the hero's cyan (his to ring); the quest's own pale
// light; nothing else gives light.

import type { Sprite } from '../engine/px';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { CANDLE, SWING, bell, bellGlow, metalOf } from './floor11';
import { rope, timber } from './floor6';
import type { Piece } from './floorkit';
import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { HUSH } from './crier';
import { bright } from './act2_quiet';
import { BLACK, BRASS, IRON, MASK, OAK, ROPE, SOFT_ID, checker, cylinder, done, facing, frontPiece, lying, scene, slab, turned } from './act2_kit';

const fr = (t: number): number => t - Math.floor(t);

// =================================================================================================
// THE HOUSE OF QUIET'S MATERIALS (each from its deep shade to its lit top)

/** The beds' iron, painted white long ago, chipped. */
export const BEDIRON: Ramp = ['#3a3c38', '#5e6159', '#85887c', '#a8ab9e', '#c4c6b8'];
/** The infirmary's grey wool blankets. */
export const BLANKET: Ramp = ['#2a2c2e', '#424548', '#5a5e60', '#717574', '#888c8a'];
/** Its linen: sheets, pillows, bandages, screens. */
export const LINEN: Ramp = ['#5c5a52', '#827f76', '#a4a296', '#c0beb0', '#d6d4c6'];
/** The infirmary's green paint (doors, lockers, the dado's). */
export const GREENPAINT: Ramp = ['#232b20', '#36412d', '#49573c', '#5c6c4c', '#71825e'];
/** The apothecary's dark wood. */
export const MAHOGANY: Ramp = ['#1d1412', '#32211b', '#483025', '#5f4131', '#775442'];
/** Marble, a washstand's top. */
export const MARBLE: Ramp = ['#54564e', '#787a70', '#9a9c90', '#b6b8ab', '#cdcec2'];
/** THE TONIC, pale green, in its vials and spilled: its glass and the liquid in it. */
export const TONIC: Ramp = ['#26301f', '#3b4a30', '#536643', '#6e8758', '#93ab76'];
/** Leather (straps, the ledger's binding). */
export const LEATHER: Ramp = ['#1d1511', '#32241e', '#48352a', '#5f4737', '#775a46'];
/** Wicker (the bath chair, the hamper). */
export const WICKER: Ramp = ['#2a2016', '#40311f', '#5a462c', '#76603c', '#927a4e'];
/** Canvas (a stretcher). */
export const CANVAS: Ramp = ['#3e3a30', '#5a5444', '#766e5a', '#908670', '#a89d84'];
/** Cast iron (the stove), near black. */
export const CASTIRON: Ramp = ['#121316', '#1d1f23', '#2a2d32', '#3a3e44', '#50555c'];
/** Wax (the chapel's candles). */
export const WAX: Ramp = ['#6e6a5a', '#908a76', '#b0aa94', '#ccc6ae', '#e0dac4'];
/** THE LAMPS' GREEN GLASS, lit: the infirmary's light (his doc's "pale green lamplight"), a yellow-green never near cyan. */
export const LAMPLIT: Ramp = ['#59653d', '#7f8f55', '#a8b97a', '#cfdca0', '#ecf3cc'];
/** The same glass, unlit. */
export const LAMPDARK: Ramp = ['#1b2116', '#283120', '#38442c', '#4b5a3a', '#617248'];
/** The lamplight's colour, as a light. */
export const LAMPLIGHT = '#c8d896';
/** THE LAST WORDS the Physician drew out: the enemy's pink burning to gold (his rulebook, Colour 3). */
const WORDS = FLAME;
/** The quest's own pale light. */
const PALE: Ramp = ['#6e6858', '#9a927e', '#c4bca4', '#e2dac2', '#f4eedc'];
bright(LAMPLIT, PALE, [LAMPLIGHT]);

// =================================================================================================
// HELPERS

/** A small upright bottle or phial at (x, y, z0): `h` tall, `r` round, its neck and stopper; its glass and what is in it by `inner`. */
function phial(S: Scene, x: number, y: number, z0: number, h: number, r: number, id: number, inner: Ramp, glow = 0, stopper: Ramp = OAK): void {
  const body = (z: number): number => {
    const t = (z - z0) / h;
    if (t < 0.66) return r;
    if (t < 0.8) return r * (1 - ((t - 0.66) / 0.14) * 0.55);
    return r * 0.45;
  };
  cylinder(S, x, y, body, z0, z0 + h, (n, a, z) => {
    const t = (z - z0) / h;
    if (glow > 0 && t > 0.12 && t < 0.6 && Math.cos(a - Math.PI / 4) > 0.3) return inner[glow > 1 ? 3 : 2];
    if (fr(a / (Math.PI * 2) - 0.62) < 0.04 && t < 0.66) return inner[4];
    return toneAt(n, inner, t < 0.6 ? 0.1 : -0.2);
  }, id, () => inner[3]);
  cylinder(S, x, y, r * 0.5, z0 + h, z0 + h + Math.max(1.2, h * 0.14), (n) => toneAt(n, stopper, 0.1), id + 1, () => stopper[3]);
}

/** A rolled or folded heap of linen at (x, y, z): soft lumps, the folds shaded. */
function linenHeap(S: Scene, x: number, y: number, z: number, n: number, id: number, seed: number, R = 7, ramp: Ramp = LINEN): void {
  for (let i = 0; i < n; i++) {
    const a = i * 2.4 + seed;
    const d = i === 0 ? 0 : R * (0.35 + 0.65 * hash(i, seed, 7101));
    const c: V3 = [x + Math.cos(a) * d, y + Math.sin(a) * d, z + 1.8 + 1.6 * hash(i, seed, 7102)];
    const ang = a * 1.3;
    S.egg(c, [[Math.cos(ang), Math.sin(ang), 0], [-Math.sin(ang), Math.cos(ang), 0], [0, 0, 1]], [5 + 3 * hash(i, seed, 7103), 3.6, 2.4], (nn, w) => (fr((w[0] + w[1]) * 0.35) < 0.12 ? toneAt(nn, ramp, -0.5) : toneAt(nn, ramp, 0.05)), id + i);
  }
}

/** A curl of the Hush rising off what lets it out: grey soft lumps, thinning as they rise (soft: no seam). */
function hushRising(S: Scene, c: V3, n: number, seed: number, rise = 20, spread = 6): void {
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const a = seed * 1.7 + i * 2.3;
    const p: V3 = [c[0] + Math.cos(a) * spread * (0.4 + t), c[1] + Math.sin(a) * spread * (0.3 + t * 0.8), c[2] + t * rise];
    S.ball(p, 3.2 - t * 1.6, HUSH, SOFT_ID + 30 + i, undefined, 0.15 - t * 0.4);
  }
}

/** Whether (x, y) is in a tilted rectangle: half-lengths `a` along `ang` and `b` across it. */
const inBox = (x: number, y: number, ang: number, a: number, b: number): boolean => Math.abs(x * Math.cos(ang) + y * Math.sin(ang)) < a && Math.abs(-x * Math.sin(ang) + y * Math.cos(ang)) < b;

// =================================================================================================
// THE WARDS

/**
 * AN IRON WARD BED: an iron frame painted white long ago, chipped, its head rail of upright bars between two posts and
 * a lower foot rail; castors; a ticking mattress, a grey blanket, the sheet folded back over it, a pillow; the patient's
 * chart on the foot rail. `empty`: the patient risen (his doc: "Hushed patients who sit up in their beds as you pass"),
 * the blanket thrown back in a heap, the sheet trailing over the side to the floor, the pillow askew. Turned as
 * art/act2_kit.ts `turned` turns: its head toward -x (`k` 0) or toward -y (3). 160 x 130 at (80, 90).
 */
function wardBed(empty: boolean, k: number): Sprite {
  const S = turned(scene(160, 130, 80, 90), k);
  const L = 27;
  const B = 12;
  // the legs on their castors, the side rails
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    S.rod([sx * L, sy * B, 2.2], [sx * L, sy * B, 14], 0.9, 0.9, BEDIRON, 1);
    S.ball([sx * L, sy * B, 1.3], 1.3, IRON, 1);
  }
  for (const sy of [-1, 1]) S.rod([-L, sy * B, 13], [L, sy * B, 13], 0.8, 0.8, BEDIRON, 2);
  // the head end (at -x): two posts with their knobs, two rails, upright bars between; the foot end lower
  const end = (x: number, top: number, id: number): void => {
    for (const sy of [-1, 1]) {
      S.rod([x, sy * B, 2.2], [x, sy * B, top], 1.1, 1.1, BEDIRON, id);
      S.ball([x, sy * B, top + 1], 1.6, BEDIRON, id);
    }
    for (const z of [top - 3, 16]) S.rod([x, -B, z], [x, B, z], 0.75, 0.75, BEDIRON, id + 1);
    for (let i = 1; i < 6; i++) S.rod([x, -B + (2 * B * i) / 6, 16], [x, -B + (2 * B * i) / 6, top - 3], 0.45, 0.45, BEDIRON, id + 2);
  };
  end(-L, 36, 3);
  end(L, 27, 6);
  // the mattress: ticking, its stripes along it
  slab(S, -L + 1, -B + 0.8, L - 1, B - 0.8, 13.6, 18, LINEN, 9, -0.25, (f, u) => (f === 1 || f === 3) && fr(u * 11) < 0.25 ? -0.4 : 0);
  if (!empty) {
    // the blanket over it, hanging down its sides, the sheet folded back over its top end; the pillow
    S.box([3, 0, 19.2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [L - 6, B + 0.6, 1.4], (f, u, v, n) => {
      if (f === 4 && fr(u * 4.5) < 0.06) return toneAt(n, BLANKET, -0.4);
      if (f !== 4 && v < 0.2) return toneAt(n, BLANKET, -0.6);
      return toneAt(n, BLANKET, Math.abs(u - 0.82) < 0.04 ? -0.5 : 0);
    }, 10);
    for (const sy of [-1, 1]) S.quad([[-L + 4, sy * (B + 0.9), 19], [L - 3, sy * (B + 0.9), 19], [L - 3, sy * (B + 0.9), 12], [-L + 4, sy * (B + 0.9), 12]], (u, v) => (fr(u * 6) < 0.05 ? BLANKET[0] : v > 0.85 ? BLANKET[2] : BLANKET[sy > 0 ? 2 : 1]), 11);
    slab(S, -L + 4, -B - 0.6, -L + 9, B + 0.6, 19.2, 21, LINEN, 12, 0.1);
    S.egg([-L + 5.5, 0, 22], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.8, 9, 2.6], (n) => toneAt(n, LINEN, 0.2), 13);
  } else {
    // the blanket thrown back in a heap at the foot; the sheet pulled half off, trailing over the side to the floor
    linenHeap(S, L - 9, 0, 17, 5, 20, 3, 6, BLANKET);
    S.quad([[-L + 6, -B + 1, 18.6], [L - 14, -B + 1, 18.6], [L - 16, B + 1, 18.4], [-L + 4, B + 1, 18.4]], (u, v) => (fr(u * 3 + v * 0.5) < 0.08 ? LINEN[1] : LINEN[3]), 14);
    S.quad([[-L + 6, B + 1, 18.4], [L - 16, B + 1, 18.4], [L - 18, B + 6, 0.6], [-L + 2, B + 4, 0.6]], (u, v) => (fr(u * 4 + v) < 0.1 ? LINEN[0] : v > 0.6 ? LINEN[1] : LINEN[2]), 15);
    S.egg([-L + 6, -3, 20.5], [[0.9, 0.4, 0], [-0.4, 0.9, 0], [0, 0, 1]], [3.8, 8.5, 2.4], (n) => toneAt(n, LINEN, 0.15), 16);
  }
  // the chart on the foot rail: a board, a sheet on it, a hand of writing
  const FR = facing(S, [1, 0, 0]);
  S.quad([[L + 1.4, -4, 25], [L + 1.4, 4, 25], [L + 1.4, 4, 15], [L + 1.4, -4, 15]], (u, v) => (u < 0.08 || u > 0.92 || v < 0.06 || v > 0.94 ? toneAt(FR, OAK, 0) : fr(v * 7) < 0.25 && u > 0.18 && u < 0.82 && hash(Math.floor(u * 9), Math.floor(v * 7), 7111) < 0.7 ? '#3a3830' : toneAt(FR, LINEN, 0.2)), 17);
  return done(S, 80, 90);
}

/**
 * A WARD SCREEN: three panels of linen on iron frames, standing folded in a zigzag; a stain on one. `see`: as the game
 * shows it while someone is behind it, the linen half there (a fine checker), as floor 13's drying lines. 150 x 150 at (75, 118).
 */
function wardScreen(see: boolean): Sprite {
  const S = scene(150, 150, 75, 118);
  const P: [number, number][] = [[-36, -6], [-12, 6], [12, -6], [36, 6]];
  const H = 58;
  for (let i = 0; i < 3; i++) {
    const [x0, y0] = P[i];
    const [x1, y1] = P[i + 1];
    // the frame: its uprights on little feet, a rail top and bottom
    for (const [x, y] of [[x0, y0], [x1, y1]]) {
      S.rod([x, y, 0], [x, y, H], 0.7, 0.7, BEDIRON, 1 + i);
      S.rod([x - 2, y, 0.6], [x + 2, y, 0.6], 0.6, 0.6, BEDIRON, 1 + i);
    }
    S.rod([x0, y0, H], [x1, y1, H], 0.6, 0.6, BEDIRON, 1 + i);
    S.rod([x0, y0, 6], [x1, y1, 6], 0.5, 0.5, BEDIRON, 1 + i);
    const n: V3 = [-(y1 - y0), x1 - x0, 0];
    const nl = Math.hypot(n[0], n[1]);
    const N: V3 = [n[0] / nl, n[1] / nl, 0];
    const F = facing(S, N[1] < 0 ? [-N[0], -N[1], 0] : N);
    S.quad([[x0, y0, H - 1], [x1, y1, H - 1], [x1, y1, 7], [x0, y0, 7]], (u, v, wp) => {
      if (see && !checker(S, wp)) return null;
      // gathered on its rails, in pleats
      const pleat = fr(u * 9);
      if (i === 1 && Math.hypot((u - 0.6) * 2, v - 0.55) < 0.14) return toneAt(F, ['#4e4836', '#6a6248', '#857c5c', '#9a906c', '#aaa07a'], 0);
      return toneAt(F, LINEN, pleat < 0.2 ? -0.35 : pleat > 0.7 ? 0.25 : 0);
    }, 10 + i);
  }
  return done(S, 75, 118);
}

/** A BEDSIDE LOCKER (breakable): a small cupboard painted the infirmary's green, a jug and a cup on it, a bottle of tonic; knocked over, the jug smashed. 90 x 100 at (45, 74). */
function locker(broken: boolean): Sprite {
  const S = scene(90, 100, 45, 74);
  if (!broken) {
    slab(S, -7, -7, 7, 7, 0, 22, GREENPAINT, 1, 0, (f, u, v) => (f === 2 && (Math.abs(v - 0.62) < 0.03 || Math.abs(u - 0.5) < 0.03) ? -0.6 : f === 2 && Math.abs(u - 0.8) < 0.05 && Math.abs(v - 0.4) < 0.05 ? 0.9 : 0));
    slab(S, -8, -8, 8, 8, 22, 23.4, GREENPAINT, 2, 0.2);
    // the jug and its cup; a bottle of tonic
    cylinder(S, -2, -2, (z) => 3.2 - Math.abs(z - 28.5) * 0.12, 23.4, 32, (n) => toneAt(n, MARBLE, 0.15), 3, () => '#1c1c1c');
    S.rod([1, -2, 30], [2.6, -2, 27], 0.5, 0.5, MARBLE, 3);
    cylinder(S, 4, 3, 1.6, 23.4, 26, (n) => toneAt(n, MARBLE, 0.1), 4, () => MARBLE[1]);
    phial(S, -4, 4, 23.4, 7, 1.5, 5, TONIC);
  } else {
    // on its side, its door open, what was on it smashed on the floor
    S.box([0, 2, 7.5], [[1, 0, 0], [0, 0, 1], [0, -1, 0]], [7, 7.5, 7], (f, u, v, n) => (f === 3 ? toneAt(n, GREENPAINT, -0.6) : toneAt(n, GREENPAINT, fr(u * 2) < 0.04 ? -0.5 : 0)), 1);
    for (let i = 0; i < 7; i++) S.ball([12 + Math.cos(i * 2.3) * (2 + i), -6 + Math.sin(i * 2.3) * (2 + i * 0.7), 0.8], 0.9 + 0.3 * (i % 2), MARBLE, 2 + (i % 3));
    S.egg([14, -4, 0.3], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [9, 6, 0.3], (n) => toneAt(n, TONIC, 0.1), 6);
  }
  return done(S, 45, 74);
}

/**
 * A PATIENT'S CALL BELL by a bed (one of the Bells on this floor): a little bell on a sprung iron bracket out from the
 * wall, its pull-wire run down to a brass handle by the bed. Quiet; awake; rung (one way, back).
 */
function callBell(state: number): { left: Sprite; right: Sprite } {
  let glow: { at: V3; r: number; color: string; a?: number }[] = [];
  return frontPiece((S, w) => {
    const Z = 50;
    // the bracket's plate on the wall, the coil spring, the bracket out
    S.rod(w(0, 0.6, Z - 2), w(0, 0.6, Z + 6), 3.2, 3.2, BRASS, 1);
    for (let i = 0; i < 7; i++) S.ball(w(Math.cos(i * 2.1) * 1.8, 2 + i * 0.7, Z + 2 + Math.sin(i * 2.1) * 1.8), 0.7, IRON, 2);
    S.rod(w(0, 6, Z + 2), w(0, 11, Z + 2), 0.8, 0.8, IRON, 2);
    const c = w(0, 11, Z + 1);
    bell(S, c, 6, 11, SWING[state], 3, false, metalOf(state));
    // the pull-wire down the wall to its handle
    for (let i = 0; i < 9; i++) S.ball(w(5, 1.2, Z - 4 - i * 3.6), 0.4, IRON, 4);
    S.rod(w(5, 1.6, Z - 37), w(5, 1.6, Z - 42), 1.2, 1.2, BRASS, 5);
    glow = bellGlow(S, c, 6, 11, state, w(0, 11, 0));
  }, 180, 180, () => glow, 60);
}

/** A HAMPER OF SOILED LINEN (breakable): a wicker hamper, its lid up, sheets heaped out of it; tipped over, the linen spilled across the floor. 110 x 100 at (55, 74). */
function hamper(tipped: boolean): Sprite {
  const S = scene(110, 100, 55, 74);
  const weave = (n: V3, a: number, z: number): string => toneAt(n, WICKER, (fr(z / 2.4 + (Math.floor(a * 6) % 2) * 0.5) < 0.5 ? 0.15 : -0.25));
  if (!tipped) {
    S.box([0, 0, 10], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [10, 7, 10], (f, u, v, n) => (f === 4 ? WICKER[1] : weave(n, u * 3, v * 20)), 1);
    linenHeap(S, 0, 0, 18, 5, 2, 1, 6);
    // the lid propped up behind
    S.quad([[-10, -7.5, 20], [10, -7.5, 20], [10, -11, 32], [-10, -11, 32]], (u, v) => (fr(u * 10) < 0.3 ? WICKER[2] : WICKER[3 - (v > 0.8 ? 0 : 1)]), 8);
  } else {
    S.box([0, -4, 7], [[1, 0, 0], [0, 0, 1], [0, -1, 0]], [10, 7, 7], (f, u, v, n) => (f === 3 ? WICKER[0] : weave(n, u * 3, v * 20)), 1);
    linenHeap(S, 4, 10, 0, 7, 2, 4, 12);
  }
  return done(S, 55, 74);
}

/** A WASHSTAND (breakable): a stand of painted deal, a marble top, the basin and its ewer, a towel over its rail; knocked down, the basin smashed. 100 x 110 at (50, 84). */
function washstand(broken: boolean): Sprite {
  const S = scene(100, 110, 50, 84);
  if (!broken) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod([sx * 11, sy * 6, 0], [sx * 11, sy * 6, 24], 0.9, 0.9, GREENPAINT, 1);
    slab(S, -12, -7, 12, 7, 6, 7.2, GREENPAINT, 2, 0);
    slab(S, -13, -8, 13, 8, 24, 26.4, MARBLE, 3, 0.15);
    cylinder(S, 0, 0, (z) => 3 + (z - 26.4) * 2.2, 26.4, 29.6, (n) => toneAt(n, MARBLE, 0.2), 4, (_a, rr) => (rr < 0.85 ? '#3e4440' : MARBLE[4]));
    cylinder(S, -1, 1, (z) => (z < 36 ? 3.2 : 3.2 - (z - 36) * 0.4), 27, 39, (n) => toneAt(n, MARBLE, 0.1), 5, () => '#1c1c1c');
    S.rod([2, 1, 37.5], [4, 1, 34], 0.6, 0.6, MARBLE, 5);
    // the towel over its side rail
    S.rod([-13.5, -6, 20], [-13.5, 6, 20], 0.5, 0.5, GREENPAINT, 6);
    S.quad([[-14, -4, 20.6], [-14, 4, 20.6], [-14.2, 4, 9], [-14.2, -4, 10]], (u) => (fr(u * 6) < 0.1 ? LINEN[1] : LINEN[3]), 7);
  } else {
    S.box([0, 0, 5], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [5, 7, 12], (_f, u, _v, n) => toneAt(n, GREENPAINT, fr(u * 3) < 0.1 ? -0.5 : 0), 1);
    slab(S, -16, 4, 6, 18, 0, 2.2, MARBLE, 3, 0.1);
    for (let i = 0; i < 9; i++) S.ball([12 + Math.cos(i * 2.2) * (2 + i * 0.9), -8 + Math.sin(i * 2.2) * (2 + i * 0.5), 0.9], 1 + 0.4 * (i % 2), MARBLE, 4 + (i % 3));
  }
  return done(S, 50, 84);
}

/**
 * A COAL STOVE in the ward: a squat cast-iron stove on its legs, its door's grate glowing an honest orange, its flue up
 * into the dark; a coal scuttle by it. 110 x 190 at (55, 160).
 */
function stove(): Sprite {
  const S = scene(110, 190, 55, 160);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod([sx * 8, sy * 8, 0], [sx * 8, sy * 8, 5], 1.1, 0.8, CASTIRON, 1);
  cylinder(S, 0, 0, (z) => 10 - Math.abs(z - 17) * 0.12, 5, 30, (n, a, z) => {
    // the grate in its door toward the eye, the fire through it
    const toward = a - Math.PI * 0.25;
    if (Math.abs(toward) < 0.42 && z > 9 && z < 19) return fr(z / 2.2) < 0.4 ? CASTIRON[0] : z < 13 ? CANDLE[3] : CANDLE[2];
    if (Math.abs(z - 22) < 1 || Math.abs(z - 7) < 0.8) return toneAt(n, CASTIRON, 0.6);
    return toneAt(n, CASTIRON, fr(z / 3) < 0.15 ? -0.3 : 0.1);
  }, 2, () => CASTIRON[3]);
  // its flue, up into the dark
  S.rod([0, 0, 30], [0, 0, 120], 2.6, 2.6, CASTIRON, 3);
  S.rod([0, 0, 60], [0, 0, 61.5], 3.1, 3.1, CASTIRON, 3);
  // the coal scuttle and its coal
  cylinder(S, 15, 9, (z) => 4 - z * 0.1, 0, 8, (n) => toneAt(n, CASTIRON, 0.2), 4, (_a, rr) => (rr < 0.9 ? (hash(Math.floor(rr * 5), 0, 7121) < 0.5 ? '#141414' : '#2a2a2a') : CASTIRON[3]));
  return done(S, 55, 160, [{ at: [6, 6, 14], r: 44, color: CANDLE[2], a: 0.4 }]);
}

/** A BATH CHAIR: a wicker invalid chair on two great wheels and a little steering wheel, a blanket over its seat. 120 x 120 at (60, 88). */
function bathChair(): Sprite {
  const S = scene(120, 120, 60, 88);
  // the great wheels either side, and the little one before
  for (const sy of [-1, 1]) {
    for (let i = 0; i <= 26; i++) {
      const a = (i / 26) * Math.PI * 2;
      S.ball([-3 + Math.cos(a) * 11, sy * 11, 11 + Math.sin(a) * 11], 0.9, BEDIRON, 1);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI;
      S.rod([-3 - Math.cos(a) * 10.5, sy * 11, 11 - Math.sin(a) * 10.5], [-3 + Math.cos(a) * 10.5, sy * 11, 11 + Math.sin(a) * 10.5], 0.3, 0.3, BEDIRON, 1);
    }
  }
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    S.ball([17 + Math.cos(a) * 3.5, 0, 3.5 + Math.sin(a) * 3.5], 0.7, BEDIRON, 2);
  }
  S.rod([17, 0, 3.5], [8, 0, 13], 0.7, 0.7, BEDIRON, 2);
  // the wicker seat, its high back and its sides
  const weave = (n: V3, u: number, v: number): string => toneAt(n, WICKER, fr(u * 9 + (Math.floor(v * 9) % 2) * 0.5) < 0.5 ? 0.15 : -0.25);
  S.box([-1, 0, 15], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [8, 9, 3], (f, u, v, n) => weave(n, u, v), 3);
  S.box([-9, 0, 26], [[0.96, 0, 0.28], [0, 1, 0], [-0.28, 0, 0.96]], [1.4, 9, 12], (f, u, v, n) => weave(n, u, v), 4);
  for (const sy of [-1, 1]) S.box([-2, sy * 9.4, 21], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [7, 0.8, 4], (f, u, v, n) => weave(n, u, v), 5);
  // the blanket over its seat, hanging down its front
  S.quad([[-8, -8, 18.4], [5, -8, 18.4], [5, 8, 18.4], [-8, 8, 18.4]], (u, v) => (fr(u * 5) < 0.12 ? BLANKET[1] : BLANKET[3]), 6);
  S.quad([[5, -8, 18.4], [5, 8, 18.4], [7, 8, 8], [7, -8, 8]], (u) => (fr(u * 5) < 0.12 ? BLANKET[0] : BLANKET[2]), 7);
  // its handle behind
  S.rod([-12, -7, 34], [-17, -7, 36], 0.6, 0.6, BEDIRON, 8);
  S.rod([-12, 7, 34], [-17, 7, 36], 0.6, 0.6, BEDIRON, 8);
  S.rod([-17, -7, 36], [-17, 7, 36], 0.7, 0.7, BEDIRON, 8);
  return done(S, 60, 88);
}

/** A STRETCHER, LEFT on the floor where the Hushed were carried in: two poles, the canvas between, a grey blanket rumpled on it. 150 x 80 at (75, 50). */
function stretcher(): Sprite {
  const S = scene(150, 80, 75, 50);
  for (const sy of [-1, 1]) {
    S.rod([-36, sy * 8, 2.2], [36, sy * 8, 2.2], 1, 1, OAK, 1);
    for (const sx of [-24, 24]) S.rod([sx, sy * 8, 0.4], [sx, sy * 8, 2], 0.8, 0.8, IRON, 2);
  }
  S.quad([[-25, -7.6, 3], [25, -7.6, 3], [25, 7.6, 3], [-25, 7.6, 3]], (u, v) => (u < 0.03 || u > 0.97 ? CANVAS[1] : fr(v * 2) < 0.04 ? CANVAS[2] : CANVAS[3]), 3);
  linenHeap(S, 6, 0, 2.6, 4, 4, 5, 7, BLANKET);
  return done(S, 75, 50);
}

/** THE WARD'S DOORS: a pair of doors painted the infirmary's green, a round window in each, brass push plates, in a plain frame. Shut, or swung open. */
function wardDoors(open: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const HW = 18;
    const HT = 58;
    // the frame, its lintel; the dark beyond
    for (const s of [-1, 1]) S.rod(w(s * (HW + 1.5), 1, 0), w(s * (HW + 1.5), 1, HT + 2), 1.6, 1.6, GREENPAINT, 1);
    S.rod(w(-HW - 3, 1, HT + 2.5), w(HW + 3, 1, HT + 2.5), 2, 2, GREENPAINT, 2);
    S.quad([w(-HW, 0.2, 0), w(HW, 0.2, 0), w(HW, 0.2, HT), w(-HW, 0.2, HT)], () => '#0a0810', 3);
    const leaf = (side: number, id: number): void => {
      const hinge = side * HW;
      const ang = open ? 1.25 : 0;
      const P = (a: number, z: number): V3 => w(hinge + (a - hinge) * Math.cos(ang), 0.8 + Math.abs(a - hinge) * Math.sin(ang), z);
      const a0 = side < 0 ? -HW : 0;
      const a1 = side < 0 ? 0 : HW;
      S.quad([P(a0, 0), P(a1, 0), P(a1, HT), P(a0, HT)], (u, v) => {
        const a = a0 + (a1 - a0) * u;
        const z = v * HT;
        const cx = (a0 + a1) / 2;
        // its round window: dark, the lamplight caught in it
        const d = Math.hypot(a - cx, z - 42);
        if (d < 5) return d > 4 ? BRASS[2] : a - cx < -1.5 && z > 43 ? '#4e5644' : '#151a14';
        // the brass push plate, the kick plate at its foot
        if (Math.abs(a - (side < 0 ? -2.5 : 2.5)) < 1.6 && Math.abs(z - 28) < 4) return BRASS[3];
        if (z < 5) return z > 4.4 ? BRASS[3] : BRASS[2];
        // its panels' mouldings
        if (Math.abs(z - 32) < 0.7 || Math.abs(a - a0) < 1 || Math.abs(a - a1) < 1) return GREENPAINT[1];
        // the paint chipped and scuffed low down
        if (z < 16 && hash(Math.floor(a), Math.floor(z / 2), 7131) < 0.08) return OAK[2];
        return GREENPAINT[open ? 2 : 3];
      }, id);
    };
    leaf(-1, 4);
    leaf(1, 5);
  }, 110, 100, undefined, 22);
}

/**
 * THE ORDER'S IRON GRILLE (a gate across a hall): a grille of iron bars hung in a frame, its lock and chain, the Order's
 * blank mask on a plate on it, the house's patients kept in. Shut, or swung open. Looking along +y (`k` 0) or +x (1).
 * 150 x 170 at (75, 134).
 */
function grille(open: boolean, k: number): Sprite {
  const S = turned(scene(150, 170, 75, 134), k);
  const HW = 26;
  const HT = 62;
  for (const s of [-1, 1]) {
    S.rod([s * HW, 0, 0], [s * HW, 0, HT + 4], 1.8, 1.8, IRON, 1);
    S.ball([s * HW, 0, HT + 5], 2, IRON, 1);
  }
  S.rod([-HW, 0, HT + 2], [HW, 0, HT + 2], 1.4, 1.4, IRON, 2);
  // the gate: hung on its left post, swung toward the eye when open
  const ang = open ? 1.35 : 0;
  const P = (a: number, z: number): V3 => [-HW + (a + HW) * Math.cos(ang), (a + HW) * Math.sin(ang), z];
  for (let i = 1; i < 12; i++) {
    const a = -HW + (2 * HW * i) / 12;
    S.rod(P(a, 1), P(a, HT - 1), 0.6, 0.6, IRON, 3);
    S.ball(P(a, HT - 0.4), 0.9, IRON, 3);
  }
  for (const z of [3, 26, HT - 2]) S.rod(P(-HW + 1, z), P(HW - 1, z), 0.8, 0.8, IRON, 4);
  // the plate with the Order's mask on it; the lock and its chain
  const pc = P(0, 40);
  S.egg(pc, [[Math.cos(ang), Math.sin(ang), 0], [-Math.sin(ang), Math.cos(ang), 0], [0, 0, 1]], [5, 0.8, 6.5], (n, wp) => {
    const lp = wp[2] - 40;
    const la = (wp[0] - pc[0]) * Math.cos(ang) + (wp[1] - pc[1]) * Math.sin(ang);
    if (Math.abs(Math.abs(la) - 1.8) < 0.9 && Math.abs(lp - 1.2) < 0.6) return BLACK[0];
    return toneAt(n, MASK, 0.1);
  }, 5);
  if (!open) {
    S.box(P(HW - 3, 24), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.2, 1.4, 2.8], (_f, _u, _v, n) => toneAt(n, BRASS, 0), 6);
    for (let i = 0; i < 9; i++) S.ball([HW - 4 + Math.cos(i * 0.7) * 3, 1.5, 27 - i * 1.8], 0.7, IRON, 7);
  }
  return done(S, 75, 134);
}

// =================================================================================================
// THE LAMPS

/**
 * A LAMP OF GREEN GLASS on its bracket in the wall: a brass oil lamp, its chimney and shade of the infirmary's green
 * glass, the flame low in it; the light pale green (his doc's "pale green lamplight"). Lit, or out.
 */
function greenLamp(lit: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const Z = 44;
    // the bracket: a plate, an arm out with a scroll under it
    S.rod(w(0, 0.6, Z - 9), w(0, 0.6, Z + 5), 1.4, 1.4, BRASS, 1);
    S.rod(w(0, 0.6, Z - 3), w(0, 12, Z - 3), 1.1, 1.1, BRASS, 1);
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      S.ball(w(0, 1 + 9 * t, Z - 4 - 6 * Math.sin(t * Math.PI)), 0.6, BRASS, 1);
    }
    // the lamp: its brass font, the green glass chimney, a shade over it
    const c = w(0, 12, Z);
    cylinder(S, c[0], c[1], (z) => 4.2 - Math.abs(z - c[2] + 1) * 0.5, c[2] - 4.5, c[2] + 1.5, (n) => toneAt(n, BRASS, 0.1), 2, () => BRASS[3]);
    cylinder(S, c[0], c[1], (z) => 2.6 + Math.sin(((z - c[2] - 1.5) / 12) * Math.PI) * 1.4, c[2] + 1.5, c[2] + 13.5, (n, a, z) => {
      if (!lit) return toneAt(n, LAMPDARK, 0.15);
      // the flame low in it, bright through the glass toward the eye
      const toward = Math.cos(a - Math.PI / 4);
      if (toward > 0.2 && z < c[2] + 7) return z < c[2] + 4.5 ? LAMPLIT[4] : LAMPLIT[3];
      return toward > 0 ? LAMPLIT[2] : LAMPLIT[1];
    }, 3);
    cylinder(S, c[0], c[1], (z) => 7.4 - (z - c[2] - 12) * 1.3, c[2] + 12, c[2] + 16.5, (n) => (lit ? toneAt(n, LAMPLIT, -0.3) : toneAt(n, LAMPDARK, 0.1)), 4, () => (lit ? LAMPLIT[0] : LAMPDARK[1]));
  }, 80, 120, (_S, w) => (lit ? [{ at: w(0, 12, 50), r: 56, color: LAMPLIGHT, a: 0.5 }] : []), 34);
}

/** A STAND OF CANDLES in the chapel: an iron pricket stand, its tray of candles at different heights, burning (an honest flame), wax run down. Built a little bigger than measured: 110 x 170 at (55, 144). */
function candles(): Sprite {
  const S = turned(scene(110, 170, 55, 144), 0, 1.25);
  // three feet, a stem, the tray
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    S.rod([0, 0, 4], [Math.cos(a) * 8, Math.sin(a) * 8, 0.5], 0.8, 0.8, IRON, 1);
  }
  S.rod([0, 0, 2], [0, 0, 34], 1.1, 1.1, IRON, 2);
  cylinder(S, 0, 0, 10, 34, 35.4, (n) => toneAt(n, IRON, 0.3), 3, (_a, rr) => (rr > 0.88 ? IRON[3] : '#8c8670'));
  // the candles
  const flames: V3[] = [];
  for (let i = 0; i < 7; i++) {
    const a = i * 2.39 + 0.3;
    const d = i === 0 ? 0 : 3.5 + 3.5 * hash(i, 0, 7141);
    const x = Math.cos(a) * d;
    const y = Math.sin(a) * d;
    const h = 4 + 9 * hash(i, 1, 7141);
    cylinder(S, x, y, 0.85, 35.4, 35.4 + h, (n, aa, z) => toneAt(n, WAX, Math.cos(aa * 3 + i) > 0.6 && z < 35.4 + h - 1 ? 0.5 : 0), 4 + i, () => WAX[4]);
    flames.push([x, y, 35.4 + h + 1.6]);
    S.ball([x, y, 35.4 + h + 1.4], 0.9, CANDLE, 20 + i, undefined, 0.6);
    S.ball([x, y, 35.4 + h + 2.6], 0.55, CANDLE, 30 + i, undefined, 0.9);
  }
  return done(S, 55, 144, [{ at: [0, 0, 44], r: 50, color: CANDLE[3], a: 0.4 }]);
}

// =================================================================================================
// THE APOTHECARY

/**
 * THE APOTHECARY'S SHELVES: a tall dresser of dark wood, drawers below with brass pulls and labels, shelves above of
 * jars and bottles, the tonic's pale green among them, a few on their sides. Its front along +y (`k` 0) or +x (1).
 * 150 x 200 at (75, 160).
 */
function apothecaryShelves(k: number): Sprite {
  const S = turned(scene(150, 200, 75, 160), k);
  const HW = 24;
  // the base: a run of drawers
  slab(S, -HW, -9, HW, 9, 0, 28, MAHOGANY, 1, 0, (f, u, v) => {
    if (f !== 2) return 0;
    if (fr(u * 6) < 0.04 || fr(v * 3) < 0.05) return -0.7;
    if (Math.abs(fr(u * 6) - 0.5) < 0.06 && Math.abs(fr(v * 3) - 0.55) < 0.08) return 1;
    if (Math.abs(fr(u * 6) - 0.5) < 0.2 && Math.abs(fr(v * 3) - 0.8) < 0.07) return 0.5;
    return 0;
  });
  slab(S, -HW - 1, -10, HW + 1, 10, 28, 30, MAHOGANY, 2, 0.25);
  // the back and sides of the shelves, the shelves themselves
  slab(S, -HW, -9, HW, -7, 30, 92, MAHOGANY, 3, -0.3);
  for (const s of [-1, 1]) slab(S, s * HW - 1, -9, s * HW + 1, 0, 30, 92, MAHOGANY, 4, 0);
  slab(S, -HW - 1, -10, HW + 1, 1, 92, 95, MAHOGANY, 5, 0.25);
  const BOTTLES: Ramp[] = [TONIC, ['#2a2220', '#43362c', '#62503a', '#857048', '#a89060'], ['#2c2a30', '#45424c', '#625e6a', '#807b88', '#9e98a6'], MARBLE];
  let id = 10;
  for (const z of [30, 50, 71]) {
    slab(S, -HW + 1, -8, HW - 1, -1, z, z + 1.4, MAHOGANY, 6, 0.1);
    let x = -HW + 4;
    let n = 0;
    while (x < HW - 3) {
      const h = 7 + 8 * hash(n, z, 7151);
      const r = 1.6 + 1.8 * hash(n, z + 1, 7151);
      const ramp = BOTTLES[Math.floor(hash(n, z + 2, 7151) * 4)];
      if (hash(n, z + 3, 7151) < 0.12) {
        // one on its side, rolled to the shelf's front
        S.rod([x - 3, -3, z + 1.4 + r], [x + 3, -3, z + 1.4 + r], r, r * 0.7, ramp, id++);
      } else phial(S, x, -4, z + 1.4, h, r, id++, ramp);
      id++;
      x += r * 2 + 1.4;
      n++;
    }
  }
  return done(S, 75, 160);
}

/**
 * THE APOTHECARY'S COUNTER: a long counter of dark wood, its brass scales and their weights, a mortar and pestle, a row
 * of tonic bottles waiting, a ledger of doses. Its length along x (`k` 0) or along y (1). 170 x 130 at (85, 96).
 */
function counter(k: number): Sprite {
  const S = turned(scene(170, 130, 85, 96), k);
  const HL = 34;
  slab(S, -HL, -8, HL, 8, 0, 24, MAHOGANY, 1, 0, (f, u) => (f !== 4 && fr(u * 5) < 0.03 ? -0.7 : 0));
  slab(S, -HL - 1.5, -9.5, HL + 1.5, 9.5, 24, 26.4, MAHOGANY, 2, 0.3);
  // the scales: a brass pillar and beam, two pans, the weights in a row
  S.rod([-18, 0, 26.4], [-18, 0, 44], 0.8, 0.8, BRASS, 3);
  S.rod([-27, 0, 43], [-9, 0, 43], 0.5, 0.5, BRASS, 3);
  for (const sx of [-27, -9]) {
    for (const d of [-1, 1]) S.rod([sx, 0, 43], [sx + d * 3, 0, 33], 0.25, 0.25, BRASS, 4);
    cylinder(S, sx, 0, (z) => 3.6 - (33 - z) * 0.6, 31.5, 33, (n) => toneAt(n, BRASS, 0.2), 5, () => BRASS[2]);
  }
  for (let i = 0; i < 4; i++) cylinder(S, -24 + i * 3.4, 6, 0.8 + i * 0.25, 26.4, 28 + i * 0.6, (n) => toneAt(n, BRASS, 0), 6 + i, () => BRASS[3]);
  // the mortar and its pestle
  cylinder(S, 2, -1, (z) => 4.2 - Math.abs(z - 29.5) * 0.4, 26.4, 32, (n) => toneAt(n, MARBLE, 0.1), 12, (_a, rr) => (rr < 0.75 ? '#5a6650' : MARBLE[3]));
  S.rod([2, -1, 30], [5, 2, 38], 0.9, 1.1, MARBLE, 13);
  // the bottles waiting, the ledger of doses open
  for (let i = 0; i < 5; i++) phial(S, 12 + i * 4, -4, 26.4, 8, 1.5, 20 + i * 2, TONIC);
  S.quad([[14, 1, 26.6], [30, 1, 26.6], [30, 8, 26.6], [14, 8, 26.6]], (u, v) => (Math.abs(u - 0.5) < 0.03 ? LINEN[1] : fr(v * 7) < 0.3 && fr(u * 2) > 0.1 && fr(u * 2) < 0.9 && hash(Math.floor(u * 12), Math.floor(v * 7), 7161) < 0.6 ? '#3a3830' : LINEN[3]), 40);
  return done(S, 85, 96);
}

/** A RACK OF TONIC VIALS (breakable): a little rack of wood, three rows of corked vials of the pale green tonic; smashed, the vials broken, the tonic spilled. 100 x 90 at (50, 66). */
function vialRack(broken: boolean): Sprite {
  const S = scene(100, 90, 50, 66);
  if (!broken) {
    slab(S, -13, -5, 13, 5, 0, 2, OAK, 1, 0);
    for (const s of [-1, 1]) slab(S, s * 13 - 1, -5, s * 13 + 1, 5, 2, 16, OAK, 2, 0);
    slab(S, -13, -5, 13, 5, 10, 11.4, OAK, 3, 0.15, (f, u, v) => (f === 4 && fr(u * 7) > 0.3 && fr(u * 7) < 0.7 && fr(v * 2) > 0.3 && fr(v * 2) < 0.7 ? -0.9 : 0));
    let id = 10;
    for (const y of [-2.5, 2.5]) for (let i = 0; i < 7; i++) phial(S, -10.5 + i * 3.5, y, 2, 13, 1.2, (id += 2), TONIC);
  } else {
    S.box([0, 0, 3], [[1, 0, 0], [0, 0, 1], [0, -1, 0]], [13, 3, 5], (_f, u, _v, n) => toneAt(n, OAK, fr(u * 7) < 0.1 ? -0.6 : 0), 1);
    S.egg([8, 6, 0.3], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [14, 9, 0.3], (n) => toneAt(n, TONIC, 0.15), 2);
    for (let i = 0; i < 12; i++) S.ball([Math.cos(i * 1.9) * (4 + i), 4 + Math.sin(i * 1.9) * (3 + i * 0.5), 0.8], 0.7 + 0.3 * (i % 2), TONIC, 3 + (i % 4), undefined, 0.4);
    hushRising(S, [8, 6, 1], 4, 2, 14, 3);
  }
  return done(S, 50, 66);
}

/**
 * SPILLED TONIC (a trap: his doc's "spilled tonics that leave clouds of the Hush on the floor"): a pool of the pale
 * green tonic round a broken vial. Frames: lying; the warning (bubbling, wisps of the Hush curling off it); the cloud of
 * the Hush risen off it, low and grey over the floor. 200 x 140 at (100, 96).
 */
function spilledTonic(f: number): Sprite {
  const S = scene(200, 140, 100, 96);
  S.egg([0, 0, 0.3], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [22, 14, 0.3], (n, w) => {
    const d = Math.hypot(w[0] / 22, w[1] / 14);
    if (d > 0.82 && hash(Math.floor(w[0]), Math.floor(w[1]), 7171) < 0.5) return TONIC[1];
    return toneAt(n, TONIC, fr(w[0] * 0.3 + w[1] * 0.2) < 0.1 ? 0.6 : 0.1);
  }, 1);
  for (let i = 0; i < 6; i++) S.ball([-8 + i * 3, -4 + (i % 2) * 3, 0.8], 0.9, TONIC, 2, undefined, 0.5);
  // the broken vial on its side, its neck snapped off by it
  S.rod([-20, -8, 1.8], [-10, -5, 1.8], 1.8, 1.5, TONIC, 3);
  S.rod([-8, -2, 0.9], [-5, -1, 0.9], 0.8, 0.6, TONIC, 3);
  if (f >= 1) {
    // bubbling, the Hush curling off it
    for (let i = 0; i < 7; i++) S.ball([Math.cos(i * 2.2) * (2 + i), Math.sin(i * 2.2) * (1.5 + i * 0.6), 0.8], 0.7, ['#3b4a30', '#536643', '#6e8758', '#93ab76', '#b4c89a'], 4, undefined, 0.6);
    hushRising(S, [0, 0, 1], f === 1 ? 4 : 2, 1, f === 1 ? 14 : 8, 3);
  }
  if (f === 2) {
    // the cloud of the Hush: a low bank of its grey fog over the floor and the spill, thick in its heart and half there
    // round its ragged edge (a fine checker), so the floor shows through
    for (let i = 0; i < 26; i++) {
      const a = i * 2.4;
      const d = i < 5 ? 5 * hash(i, 4, 7172) : 12 + 16 * hash(i, 0, 7172);
      const c: V3 = [Math.cos(a) * d * 1.25, Math.sin(a) * d * 0.95, 3 + 2.5 * hash(i, 1, 7172) + (i < 5 ? 3 : 0)];
      const outer = d > 17;
      S.egg(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [9 + 5 * hash(i, 2, 7172), 7 + 4 * hash(i, 3, 7172), 2.6 + 1.6 * hash(i, 5, 7172)], (n, wp) => (outer && !checker(S, wp) ? null : toneAt(n, HUSH, 0.55 - (outer ? 0.2 : 0))), SOFT_ID + 50 + i);
    }
  }
  return done(S, 100, 96);
}

// =================================================================================================
// THE THEATRE

/**
 * THE OPERATING TABLE, in the middle of the theatre: a heavy table of oak, its top padded in black leather, the
 * Order's straps across it, a headrest; a great lamp over it on a chain, its green glass shade, burning (the pale green
 * lamplight). Nothing gory: the Physician draws out words, not blood. 180 x 230 at (90, 160).
 */
function operatingTable(): Sprite {
  const S = scene(180, 230, 90, 160);
  const L = 30;
  const B = 12;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod([sx * (L - 3), sy * (B - 2), 0], [sx * (L - 3), sy * (B - 2), 18], 2, 2, OAK, 1);
  slab(S, -L + 2, -B + 2, L - 2, B - 2, 4, 6, OAK, 2, -0.1);
  slab(S, -L, -B, L, B, 18, 21, OAK, 3, 0.1);
  // the padded top in black leather, its buttons; the headrest at -x
  slab(S, -L + 1, -B + 1, L - 1, B - 1, 21, 23.6, LEATHER, 4, -0.2, (f, u, v) => (f === 4 && fr(u * 8) < 0.12 && fr(v * 3) < 0.25 ? -0.8 : 0));
  S.egg([-L + 4, 0, 25], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3, 6, 1.8], (n) => toneAt(n, LEATHER, 0.1), 5);
  // the straps across it, their buckles
  for (const x of [-12, 4, 18]) {
    S.box([x, 0, 23.9], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6, B + 0.4, 0.4], (f, _u, _v, n) => toneAt(n, LEATHER, f === 4 ? 0.4 : 0), 6);
    S.box([x, B - 3, 24.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.4, 1, 0.5], (_f, _u, _v, n) => toneAt(n, BRASS, 0.2), 7);
  }
  // the great lamp over it on its chain, its shade of green glass, lit
  for (let i = 0; i < 18; i++) S.ball([0, 0, 108 - i * 3], 0.7, IRON, 8);
  const lz = 52;
  cylinder(S, 0, 0, (z) => 3 + (lz + 10 - z) * 1.0, lz, lz + 10, (n, a) => {
    const toward = Math.cos(a - Math.PI / 4);
    return toward > 0.4 ? LAMPLIT[2] : toward > -0.2 ? LAMPLIT[1] : LAMPLIT[0];
  }, 9, () => LAMPLIT[0]);
  S.rod([0, 0, lz + 10], [0, 0, lz + 13], 1.6, 1.6, BRASS, 9);
  S.ball([0, 0, lz + 1], 2.4, LAMPLIT, 10, undefined, 0.8);
  return done(S, 90, 160, [{ at: [0, 0, lz - 4], r: 70, color: LAMPLIGHT, a: 0.5 }]);
}

/**
 * THE THEATRE'S GALLERY: three tiers of standing room rising one behind another round the theatre's edge, each with its
 * rail of dark wood on turned posts, where the city's students once stood to watch; empty now. Curved, its middle
 * toward +x+y. Built half as big again as it is measured: 440 x 320 at (220, 236).
 */
function gallery(): Sprite {
  const S = turned(scene(440, 320, 220, 236), 0, 1.5);
  const R0 = 52;
  const A0 = Math.PI * 0.02;
  const A1 = Math.PI * 0.48;
  let id = 1;
  for (let t = 0; t < 3; t++) {
    const r = R0 + t * 14;
    const z = t * 14;
    const P = (a: number, rr: number, zz: number): V3 => [-Math.cos(a) * rr + 40, -Math.sin(a) * rr + 40, zz];
    // the tier's floor and its riser, in short straight runs round the curve
    const N = 14;
    for (let i = 0; i < N; i++) {
      const a0 = A0 + ((A1 - A0) * i) / N;
      const a1 = A0 + ((A1 - A0) * (i + 1)) / N;
      S.quad([P(a0, r, z + 14), P(a1, r, z + 14), P(a1, r + 14, z + 14), P(a0, r + 14, z + 14)], (u, v) => (fr(v * 3) < 0.08 ? MAHOGANY[1] : MAHOGANY[3]), id);
      const am = (a0 + a1) / 2;
      const n = facing(S, [Math.cos(am), Math.sin(am), 0]);
      S.quad([P(a0, r, z), P(a1, r, z), P(a1, r, z + 14), P(a0, r, z + 14)], (_u, v) => (v > 0.9 ? toneAt(n, MAHOGANY, 0.5) : toneAt(n, MAHOGANY, fr(v * 3) < 0.06 ? -0.6 : -0.1)), id + 1);
      // the rail on its turned posts along the tier's front edge
      S.rod(P(a0, r + 1.5, z + 26), P(a1, r + 1.5, z + 26), 0.9, 0.9, OAK, id + 2);
      S.rod(P(a0, r + 1.5, z + 14), P(a0, r + 1.5, z + 26), 0.6, 0.6, OAK, id + 2);
      if (i === N - 1) S.rod(P(a1, r + 1.5, z + 14), P(a1, r + 1.5, z + 26), 0.6, 0.6, OAK, id + 2);
    }
    id += 4;
  }
  return done(S, 220, 236);
}

/**
 * A TRAY OF THE PHYSICIAN'S INSTRUMENTS (breakable): an iron stand, a tray on it laid with what he draws out words
 * with: glass syringes tipped with quills, a funnel, a bell jar over a phial in which a last word drawn out burns the
 * enemy's pink; knocked over, all of it smashed on the floor and the word guttering. Built a little bigger than
 * measured: 130 x 150 at (65, 120).
 */
function instruments(broken: boolean): Sprite {
  const S = turned(scene(130, 150, 65, 120), 0, 1.3);
  const QUILL: Ramp = ['#5a564c', '#7e786a', '#a29a88', '#c2baa6', '#dcd4c0'];
  if (!broken) {
    S.rod([0, 0, 0], [0, 0, 26], 0.9, 0.9, IRON, 1);
    for (let i = 0; i < 3; i++) S.rod([0, 0, 3], [Math.cos(i * 2.1) * 7, Math.sin(i * 2.1) * 7, 0.4], 0.7, 0.7, IRON, 1);
    slab(S, -12, -7, 12, 7, 26, 27.4, IRON, 2, 0.2);
    // the linen on it, the syringes laid out, each tipped with a quill
    S.quad([[-11, -6, 27.6], [11, -6, 27.6], [11, 6, 27.6], [-11, 6, 27.6]], () => LINEN[3], 3);
    for (let i = 0; i < 3; i++) {
      const y = -4 + i * 2.6;
      S.rod([-9, y, 28.5], [1, y, 28.5], 0.8, 0.8, ['#4c5650', '#6e7a72', '#94a096', '#b6c0b4', '#d2dace'], 4 + i);
      S.rod([1, y, 28.5], [5, y + 0.6, 28.5], 0.3, 0.15, IRON, 4 + i);
      S.quad([[5, y + 0.6, 28.5], [9, y + 1.2, 28.7], [9.5, y + 2.2, 28.7], [5.5, y + 1.2, 28.5]], (u) => (u > 0.5 ? QUILL[4] : QUILL[2]), 10 + i);
    }
    // the bell jar over the phial with its word in it
    phial(S, -6, 4, 27.4, 6, 1.4, 20, WORDS, 2, BLACK);
    S.egg([-6, 4, 30.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.4, 3.4, 5.2], (n, w) => (w[2] < 28 || !checker(S, w) ? null : n[0] < -0.2 ? '#b8c2b4' : '#8e9a90'), SOFT_ID + 3);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      S.ball([-6 + Math.cos(a) * 3.4, 4 + Math.sin(a) * 3.4, 27.8], 0.35, ['#6e7a72', '#94a096', '#b6c0b4', '#d2dace', '#e6ece2'], 22);
    }
    S.rod([-6, 4, 35.6], [-6, 4, 36.8], 0.5, 0.5, ['#6e7a72', '#94a096', '#b6c0b4', '#d2dace', '#e6ece2'], 22);
    // a funnel
    cylinder(S, 7, -4, (z) => 0.4 + (z - 27.4) * 0.7, 27.4, 31, (n) => toneAt(n, IRON, 0.3), 23);
  } else {
    S.rod([-14, 6, 1], [10, -4, 1], 0.9, 0.9, IRON, 1);
    S.box([12, 6, 1], [[0.9, 0.4, 0], [-0.4, 0.9, 0], [0, 0, 1]], [12, 7, 0.7], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 2);
    for (let i = 0; i < 14; i++) S.ball([Math.cos(i * 1.7) * (3 + i * 1.2), -8 + Math.sin(i * 1.7) * (2 + i * 0.6), 0.7], 0.6, ['#6e7a72', '#94a096', '#b6c0b4', '#d2dace', '#e6ece2'], 3 + (i % 3), undefined, 0.3);
    S.quad([[-4, -12, 0.5], [0, -11, 0.5], [0.5, -10, 0.5], [-3.5, -11, 0.5]], () => QUILL[4], 8);
    // the word, out of its phial, guttering on the floor
    for (let i = 0; i < 5; i++) S.ball([2 + Math.sin(i) * 1.5, -6, 1 + i * 2.2], 1.1 - i * 0.15, WORDS, SOFT_ID + 9 + i, undefined, 0.4 - i * 0.2);
  }
  return done(S, 65, 120, [{ at: broken ? [2, -6, 3] : [-6, 4, 30], r: broken ? 16 : 24, color: WORDS[1], a: broken ? 0.2 : 0.3 }]);
}

/**
 * A CABINET OF LAST WORDS: a tall glass-fronted cabinet of dark wood, shelf on shelf of little phials stoppered in black
 * wax, each with a paper label tied to its neck (the name of whose it was), and in each a last word the Physician drew
 * out, burning the enemy's pink. Its front along +y (`k` 0) or +x (1). 130 x 200 at (65, 168).
 */
function lastWords(k: number): Sprite {
  const S = turned(scene(130, 200, 65, 168), k);
  const HW = 16;
  slab(S, -HW, -7, HW, 7, 0, 14, MAHOGANY, 1, 0, (f, u, v) => (f === 2 && (fr(u * 2) < 0.04 || Math.abs(v - 0.5) < 0.05) ? -0.7 : 0));
  slab(S, -HW, -7, HW, -5.5, 14, 86, MAHOGANY, 2, -0.3);
  for (const s of [-1, 1]) slab(S, s * HW - 1.4, -7, s * HW + 1.4, 7, 14, 86, MAHOGANY, 3, 0);
  slab(S, -HW - 1.5, -8, HW + 1.5, 8, 86, 90, MAHOGANY, 4, 0.25);
  let id = 10;
  for (let row = 0; row < 5; row++) {
    const z = 15 + row * 14;
    slab(S, -HW + 1.4, -5.5, HW - 1.4, 5.5, z, z + 1, MAHOGANY, 5, 0.1);
    for (let i = 0; i < 7; i++) {
      const x = -HW + 4 + i * 4.1;
      const lit = hash(i, row, 7181) < 0.8 ? 1 : 0;
      phial(S, x, -1, z + 1, 7, 1.3, id, WORDS, lit, BLACK);
      // its label, a scrap of paper on the neck
      S.quad([[x + 1.2, 0.5, z + 7], [x + 2.6, 0.6, z + 7], [x + 2.6, 0.6, z + 5], [x + 1.2, 0.5, z + 5]], () => LINEN[3], id + 2);
      id += 3;
    }
  }
  // the glass doors: their frames, the glass a faint sheen, a lock
  const F = facing(S, [0, 1, 0]);
  for (const x of [-HW, 0, HW]) S.rod([x, 7.2, 14], [x, 7.2, 86], 0.8, 0.8, MAHOGANY, 90);
  for (const z of [14, 86]) S.rod([-HW, 7.2, z], [HW, 7.2, z], 0.8, 0.8, MAHOGANY, 90);
  S.quad([[-HW, 7.4, 85], [HW, 7.4, 85], [HW, 7.4, 15], [-HW, 7.4, 15]], (u, v, wp) => (fr(u * 2.3 + v * 1.4) < 0.06 && checker(S, wp) ? toneAt(F, ['#58605a', '#7a8278', '#9ca498', '#bcc2b6', '#d6dacd'], 0.2) : null), SOFT_ID + 91);
  S.box([1.5, 7.6, 50], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0.8, 0.3, 1.4], (_f, _u, _v, n) => toneAt(n, BRASS, 0.2), 92);
  return done(S, 65, 168, [{ at: [0, 0, 50], r: 46, color: WORDS[1], a: 0.35 }]);
}

/** A DRAIN in the theatre's floor (a floor tile): a square iron grate set in the boards, its bars, the dark under them, sawdust drifted round it. Laid flat: 100 x 56 at (50, 28). */
function drain(): Sprite {
  const SAW = ['#6e6448', '#8e815e', '#a69872'];
  return lying(100, 56, 50, 28, (u, v, px, py) => {
    if (Math.abs(u) > 0.47 || Math.abs(v) > 0.47) return null;
    const g = Math.max(Math.abs(u), Math.abs(v));
    if (g < 0.2) {
      if (g > 0.17) return IRON[3];
      return fr((u + v) * 12) < 0.4 ? IRON[2] : '#0a0810';
    }
    if (g < 0.24) return IRON[1];
    // sawdust drifted round it, thinning out
    const k = (0.47 - g) / 0.23;
    return hash(px >> 1, py, 7191) < k * 0.8 ? SAW[hash(px, py, 7192) < 0.2 ? 2 : 1] : null;
  });
}

// =================================================================================================
// THE CHAPEL AND ITS BELL

/**
 * THE CHAPEL BELL (the Bells' Muffled Bell on this floor): the infirmary chapel's bell, hung in a heavy frame of oak on
 * the chapel's floor beneath its tower, its wheel and rope; gagged by the Silent Order (black cloth bound round it,
 * chains over it), or rung, swinging `swing`. 150 x 230 at (75, 200).
 */
function chapelBell(gagged: boolean, swing = 0): Sprite {
  const S = scene(150, 230, 75, 200);
  // the frame: two raking posts each side, a beam across, braces
  for (const sx of [-1, 1]) {
    timber(S, [sx * 22, -8, 0], [sx * 18, 0, 84], 2.4, 1);
    timber(S, [sx * 22, 8, 0], [sx * 18, 0, 84], 2.4, 1);
    timber(S, [sx * 21, -6, 30], [sx * 21, 6, 30], 1.6, 2);
  }
  timber(S, [-24, 0, 86], [24, 0, 86], 3, 3, [0.1, 0.9]);
  // the headstock and its wheel, to one side
  for (let i = 0; i <= 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    S.ball([14, Math.cos(a) * 10, 80 + Math.sin(a) * 10], 0.8, OAK, 4);
  }
  bell(S, [0, 0, 82], 12, 26, swing, 10, gagged);
  // the bell rope from the wheel down to its sally
  rope(S, [14, -10, 80], [10, -4, 16], 0.5, 12, 0.5);
  S.rod([10, -4, 20], [10, -4, 13], 1.1, 1.1, ['#4a1e22', '#6a2a2e', '#86423a', '#a05a48', '#b8705a'], 13);
  return done(S, 75, 200);
}

/** CHAPEL PEWS: two benches of dark oak, one behind the other, their ends carved; a hymn book left on one. Their length along x (`k` 0) or along y (1). 170 x 120 at (85, 84). */
function pews(k: number): Sprite {
  const S = turned(scene(170, 120, 85, 84), k);
  for (const y of [-10, 8]) {
    // the seat, the back, the ends
    slab(S, -26, y - 4, 26, y + 4, 10, 12, OAK, 1, 0.15);
    slab(S, -26, y - 5, 26, y - 4, 12, 26, OAK, 2, -0.1);
    for (const s of [-1, 1]) {
      S.box([s * 27, y - 1, 13], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.2, 5.5, 13], (f, u, v, n) => (v > 0.85 && f !== 4 ? toneAt(n, OAK, 0.5) : toneAt(n, OAK, fr(v * 4) < 0.08 ? -0.5 : 0)), 3);
      S.ball([s * 27, y - 1, 27], 2, OAK, 3);
    }
  }
  // a hymn book left on the near pew
  slab(S, -6, 5, 0, 9, 12, 13.4, LEATHER, 4, 0.1);
  return done(S, 85, 84);
}

// =================================================================================================
// THE PHYSICIAN'S LEDGER (the quest)

/**
 * THE PHYSICIAN'S LEDGER (the quest): his great ledger open on a sloped desk, page on page of names and the last words
 * drawn from each, and in the margin where every page went, each line ending in the same mark, a little drawing of the
 * High City's gate on its hill (his doc: "The Physician's ledger shows where every page goes: up the hill to the High
 * City."); a quill in its well. Its own pale light. 120 x 140 at (60, 112).
 */
function ledger(): Sprite {
  const S = scene(120, 140, 60, 112);
  // the desk: a sloped top on four legs
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod([sx * 10, sy * 7, 0], [sx * 10, sy * 7, 26 + sy * 2], 1, 1, MAHOGANY, 1);
  S.box([0, 0, 28], [[1, 0, 0], [0, 0.96, 0.28], [0, -0.28, 0.96]], [12, 8.5, 1.2], (_f, _u, _v, n) => toneAt(n, MAHOGANY, 0.2), 2);
  // the ledger open on it: two pages, a hand of writing, the gate at the end of each line
  const ON = (x: number, y: number, lift: number): V3 => [x, y * 0.96, 29.4 + y * 0.28 + lift];
  S.quad([ON(-10, -7, 0), ON(10, -7, 0), ON(10, 7, 0), ON(-10, 7, 0)], (u, v) => (v > 0.96 || v < 0.04 || u < 0.03 || u > 0.97 ? LEATHER[2] : LEATHER[1]), 3);
  for (const side of [-1, 1]) {
    S.quad([ON(side < 0 ? -9.4 : 0.4, -6.4, 0.6), ON(side < 0 ? -0.4 : 9.4, -6.4, 0.6), ON(side < 0 ? -0.4 : 9.4, 6.4, 0.6), ON(side < 0 ? -9.4 : 0.4, 6.4, 0.6)], (u, v) => {
      const line = Math.floor(v * 9);
      const lv = fr(v * 9);
      if (lv > 0.3 && lv < 0.7) {
        // the gate at the end of each line, on its hill: a tiny arch
        if (u > 0.82 && u < 0.94) return Math.abs(u - 0.88) < 0.025 && lv < 0.6 ? PALE[3] : '#2a2620';
        if (u > 0.08 && u < 0.78 - 0.2 * hash(line, side, 7201) && hash(Math.floor(u * 20), line + side * 9, 7202) < 0.72) return '#2e2a24';
      }
      return PALE[side < 0 ? 3 : 4];
    }, 4 + (side > 0 ? 1 : 0));
  }
  // the quill in its well
  cylinder(S, 11, 6, 1.4, 30.5, 33, (n) => toneAt(n, BLACK, 0.4), 6, () => '#0a0810');
  S.quad([[11, 6, 33], [13, 8, 44], [14, 9, 44], [11.6, 6.4, 33]], (u) => (u > 0.4 ? '#d6d0bc' : '#a29a88'), 7);
  return done(S, 60, 112, [{ at: [0, 0, 30], r: 36, color: '#e8e2d2', a: 0.35 }]);
}

// =================================================================================================

let made: Piece[] | null = null;
/** FLOOR 14'S PIECES, the Physician's: 25. */
export function houseOfQuietPieces(): Piece[] {
  if (made) return made;
  made = [
    // (frames: made and risen, its length along x, its head toward -x; the same along y, its head toward -y: its head
    // against a far wall either way)
    { name: 'an iron ward bed', kind: 'obstacle', frames: [0, 3].flatMap((k) => [wardBed(false, k), wardBed(true, k)]), shadow: 0.9 },
    // (frames: whole; half there, while someone is behind it)
    { name: 'a ward screen', kind: 'obstacle', frames: [wardScreen(false), wardScreen(true)], shadow: 0.8 },
    { name: 'a bedside locker', kind: 'breakable', frames: [locker(false), locker(true)], shadow: 0.3 },
    // (the Bells: quiet, awake, rung one way, rung back)
    { name: "a patient's call bell", kind: 'on the wall', ...withFramesN([0, 1, 2, 3].map(callBell)) },
    { name: 'a hamper of soiled linen', kind: 'breakable', frames: [hamper(false), hamper(true)], shadow: 0.4 },
    { name: 'a washstand', kind: 'breakable', frames: [washstand(false), washstand(true)], shadow: 0.4 },
    { name: 'a coal stove', kind: 'obstacle', frames: [stove()], shadow: 0.45 },
    { name: 'a bath chair', kind: 'obstacle', frames: [bathChair()], shadow: 0.55 },
    { name: 'a stretcher, left', kind: 'obstacle', frames: [stretcher()], shadow: 0.8 },
    { name: "the ward's doors", kind: 'door', ...withFramesN([wardDoors(false), wardDoors(true)]) },
    // (frames: shut and open along +y, shut and open along +x)
    { name: "the Order's iron grille", kind: 'gate', frames: [0, 1].flatMap((k) => [grille(false, k), grille(true, k)]), shadow: 0.9 },
    { name: 'a lamp of green glass', kind: 'on the wall', ...withFramesN([greenLamp(true), greenLamp(false)]) },
    { name: 'a stand of candles', kind: 'obstacle', frames: [candles()], shadow: 0.35 },
    // (frames: its front along +y, along +x)
    { name: "the apothecary's shelves", kind: 'obstacle', frames: [apothecaryShelves(0), apothecaryShelves(1)], shadow: 0.8 },
    { name: "the apothecary's counter", kind: 'obstacle', frames: [counter(0), counter(1)], shadow: 1.0 },
    { name: 'a rack of tonic vials', kind: 'breakable', frames: [vialRack(false), vialRack(true)], shadow: 0.35 },
    // (frames: lying, the warning, the cloud)
    { name: 'spilled tonic', kind: 'trap', frames: [0, 1, 2].map(spilledTonic) },
    { name: 'the operating table', kind: 'obstacle', frames: [operatingTable()], shadow: 1.0 },
    { name: "the theatre's gallery", kind: 'obstacle', frames: [gallery()], shadow: 0 },
    { name: "a tray of the Physician's instruments", kind: 'breakable', frames: [instruments(false), instruments(true)], shadow: 0.35 },
    { name: 'a cabinet of last words', kind: 'obstacle', frames: [lastWords(0), lastWords(1)], shadow: 0.6 },
    { name: "a drain in the theatre's floor", kind: 'floor tile', frames: [drain()] },
    { name: 'the chapel bell (the Muffled Bell)', kind: 'obstacle', frames: [chapelBell(true), chapelBell(false, 0), chapelBell(false, 0.35), chapelBell(false, -0.35)], shadow: 0.9 },
    { name: 'chapel pews', kind: 'obstacle', frames: [pews(0), pews(1)], shadow: 1.0 },
    { name: "the Physician's ledger", kind: 'quest', frames: [ledger()], shadow: 0.4 },
  ];
  return made;
}

function withFramesN(ss: { left: Sprite; right: Sprite }[]): { left: Sprite[]; right: Sprite[] } {
  return { left: ss.map((s) => s.left), right: ss.map((s) => s.right) };
}
