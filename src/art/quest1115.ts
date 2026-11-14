// THE QUEST LINE OF FLOORS 11 TO 15 (game/quests1115.ts, QUESTS1115): what it lays on the floor, SCULPTED as the art chat's
// pieces are (art/act2_kit.ts: built in depth, 40 units to a tile, then turned into pixel art at two picture pixels to a game
// pixel, its seams in deep indigo, lit from the upper left, a step quieter than any word), at his word, 13 Nov 2026, shown the
// stand-ins: “Yes, but redraw the page and clapper first”, then “Just draw them”.
//   AN UNSTRUCK PAGE: an old leaf of the city's paper lying on the floor, a corner curled up off it, its lines of plain dark ink
//     whole (none struck through), its first letter a capital of the friend's cyan (his rulebook: what glows on a friend is cyan;
//     wordsmithing glows), a little of that light on the floor round it, a soft shadow under the curl.
//   THE CLAPPER: a bell's iron tongue lying on its side, its eye (the ring it hung by) flat on the floor at one end, its shaft
//     thickening to the swollen bob at the other; the Bells' metal rung, a breath of the friend's cyan in its lights (as a rung
//     bell's, art/floor11.ts metalOf); a soft shadow under it.
// The Crier's jar is the art chat's own (art/floor12.ts criersJar); the camp's bell is floor 11's wayside shrine's bell, the art
// chat's (art/floor11.ts shrineBellFrames).

import type { Sprite } from '../engine/px';
import { BLACK, IRON, PAPER, SOFT_ID, checker, done, scene } from './act2_kit';
import { toneAt } from './floor4';
import type { V3 } from './floor4';
import type { Ramp } from './kit';
import { CYAN, hash, mix } from './kit';

let PAGE: Sprite | null = null;
let ROLL: Sprite | null = null;
let CLAPPER: Sprite | null = null;

/** The cult's wax: its violet, dark, a seal (not a glow: his rulebook, only the enemy's eyes, runes and fire glow pink). */
const WAX: Ramp = ['#22102a', '#36183e', '#4e2456', '#6a3472', '#84468a'];

/** The soft shadow on the floor: a dark oval, half there (no seam round it). */
const SHADOW = '#08060c';

/** An unstruck page lying on the floor (anchored where its middle lies). */
export function pageSprite(): Sprite {
  return (PAGE ??= leaf('page'));
}

/**
 * (MUSTER, game/quests610.ts) A page of the cult's muster roll lying on the floor: the same old leaf, written as a list of names
 * (short lines, each with its mark), the cult's violet seal pressed at its foot; no cyan in it (it is the enemy's).
 */
export function rollSprite(): Sprite {
  return (ROLL ??= leaf('roll'));
}

function leaf(kind: 'page' | 'roll'): Sprite {
  const S = scene(64, 40, 32, 22);
  // (the leaf's own frame, turned a little on the floor: `a` along its lines, `b` down the page)
  const turn = 0.32;
  const c = Math.cos(turn);
  const s = Math.sin(turn);
  const P = (a: number, b: number, z: number): V3 => [a * c - b * s, a * s + b * c, z];
  const A = 15;
  const B = 10.5;
  const CURL = 8;
  // its shadow: thin, soft (half there), along its lower edges and under the curled corner
  S.quad([P(-A + 1, -B + 1, 0.05), P(A + 1.6, -B + 1, 0.05), P(A + 1.6, B + 1.6, 0.05), P(-A + 1, B + 1.6, 0.05)], (u, v, w) => {
    const a = -A + 1 + (2 * A + 0.6) * u;
    const b = -B + 1 + (2 * B + 0.6) * v;
    const edge = a > A - 0.4 || b > B - 0.4 || a + b > A + B - CURL - 1.2;
    return edge && checker(S, w) ? SHADOW : null;
  }, SOFT_ID + 1);
  // the leaf, flat, but for its curled corner
  S.quad([P(-A, -B, 0.6), P(A, -B, 0.6), P(A, B, 0.6), P(-A, B, 0.6)], (u, v) => {
    const a = -A + 2 * A * u;
    const b = -B + 2 * B * v;
    if (a + b > A + B - CURL) return null;
    // its deckled edge, a shade down, and the foxing of age now and then
    const ea = A - Math.abs(a);
    const eb = B - Math.abs(b);
    const rough = hash(Math.floor(a * 2), Math.floor(b * 2), 1151);
    if (ea < 0.9 + rough * 0.6 || eb < 0.9 + rough * 0.6) return PAPER[2];
    if (kind === 'roll') {
      // the cult's seal, pressed at the foot of the list, a drip of wax under it
      const sd = Math.hypot(a - 6.5, b - 5.2);
      if (sd < 2.6 || (Math.abs(a - 7.6) < 0.5 && b > 5.2 && b < 8.4)) return sd < 1.2 ? WAX[1] : sd > 2.1 ? WAX[2] : WAX[3];
      // the names, a list: short lines, each with its mark at the left
      const row = (b + B - 1.8) / 1.85;
      const n = Math.floor(row);
      const f = row - n;
      if (n >= 0 && n <= 7 && f < 0.4) {
        if (a > -A + 2 && a < -A + 2.9) return BLACK[2];
        const len = 6 + 9 * hash(n, 3, 1159);
        if (a > -A + 3.8 && a < -A + 3.8 + len && !(a > -A + 3.8 + len * 0.45 && a < -A + 4.6 + len * 0.45)) return BLACK[3];
      }
      return hash(Math.floor(a), Math.floor(b), 1157) < 0.08 ? PAPER[3] : PAPER[4];
    }
    // the capital: the first letter, the friend's cyan
    if (a > -A + 1.8 && a < -A + 4.6 && b > -B + 1.7 && b < -B + 4.6) {
      const inner = a > -A + 2.5 && a < -A + 3.9 && b > -B + 2.4 && b < -B + 3.9;
      return inner ? CYAN[3] : CYAN[2];
    }
    // its lines of writing, whole: rows of dark ink, the words parted by gaps; the first rows begun after the capital
    const row = (b + B - 1.9) / 2.05;
    const n = Math.floor(row);
    const f = row - n;
    if (n >= 0 && n <= 6 && f < 0.42) {
      const from = n <= 1 ? -A + 5.6 : -A + 2;
      const to = n === 6 ? 2 : A - 2.4;
      if (a > from && a < to) {
        const word = Math.floor((a + A + n * 3.1) / 3.4);
        const inWord = (a + A + n * 3.1) / 3.4 - word;
        if (inWord < 0.8 - 0.25 * hash(word, n, 1153)) return BLACK[3];
      }
    }
    return hash(Math.floor(a), Math.floor(b), 1157) < 0.06 ? PAPER[3] : PAPER[4];
  }, 1);
  // the curled corner: lifted off the floor and rolled back over, its underside (the back of the leaf) a shade darker
  const k0 = P(A - CURL, B, 0.6);
  const k1 = P(A, B - CURL, 0.6);
  const tip = P(A - CURL * 0.45, B - CURL * 0.45, 6.2);
  const mid = P(A - CURL * 0.22, B - CURL * 0.22, 3.4);
  const nrm: V3 = [-0.45, -0.45, 0.77];
  S.quad([k0, mid, k1, tip], (u, v) => (u + v > 1.6 ? PAPER[1] : toneAt(nrm, PAPER, 0.05)), 2);
  return kind === 'page' ? done(S, 32, 22, [{ at: [-4, -4, 1], r: 9, color: CYAN[2], a: 0.18 }]) : done(S, 32, 22);
}

/** The Bells' iron, rung: a breath of the friend's cyan in its lights (as a rung bell's metal, art/floor11.ts). */
const RUNG_IRON: Ramp = IRON.map((c, i) => mix(c, i >= 3 ? '#b8fff8' : '#22d0e0', i >= 3 ? 0.28 : 0.1)) as unknown as Ramp;

/** The clapper, lying on its side (anchored where its middle lies on the floor). */
export function clapperSprite(): Sprite {
  if (CLAPPER) return CLAPPER;
  const S = scene(80, 52, 38, 30);
  // (it lies across the screen: along the world's +x and -y, the bob to the right)
  const dx = 0.8;
  const dy = -0.6;
  const eye: V3 = [-16 * dx, -16 * dy, 1.5];
  const bob: V3 = [11 * dx, 11 * dy, 5];
  const neck: V3 = [bob[0] - dx * 6, bob[1] - dy * 6, 3.3];
  // its shadow on the floor, under the bob most
  S.quad([[-20, -16, 0.05], [20, -16, 0.05], [20, 16, 0.05], [-20, 16, 0.05]], (_u, _v, w) => {
    const toBob = Math.hypot((w[0] - bob[0] - 1.5) / 7.4, (w[1] - bob[1] - 1.2) / 6.2);
    // (along the shaft: the nearest point of it)
    const t = Math.max(0, Math.min(1, ((w[0] - eye[0]) * dx + (w[1] - eye[1]) * dy) / Math.hypot(bob[0] - eye[0], bob[1] - eye[1])));
    const px = eye[0] + (bob[0] - eye[0]) * t + 0.8;
    const py = eye[1] + (bob[1] - eye[1]) * t + 0.8;
    const toShaft = Math.hypot(w[0] - px, w[1] - py) / 2.6;
    if (toBob < 1 || toShaft < 1) return checker(S, w) ? SHADOW : null;
    return null;
  }, SOFT_ID + 1);
  // its eye: the ring it hung by, flat on the floor, a link of round iron
  const ringC: V3 = [eye[0] - dx * 3.3, eye[1] - dy * 3.3, 1.2];
  const R = 3.3;
  for (let i = 0; i < 14; i++) {
    const a0 = (i / 14) * Math.PI * 2;
    const a1 = ((i + 1) / 14) * Math.PI * 2;
    S.rod([ringC[0] + Math.cos(a0) * R, ringC[1] + Math.sin(a0) * R, 1.1], [ringC[0] + Math.cos(a1) * R, ringC[1] + Math.sin(a1) * R, 1.1], 1.1, 1.1, RUNG_IRON, 3);
  }
  // the shaft, thickening from the eye to the bob's neck
  S.rod(eye, neck, 1.5, 2.1, RUNG_IRON, 4);
  // the collar where it meets the bob
  S.ball(neck, 2.7, RUNG_IRON, 5);
  // the bob: swollen, a little longer than it is round, its striking face worn bright where it met the bell
  const side: V3 = [-dy, dx, 0];
  S.egg(bob, [[dx, dy, 0], side, [0, 0, 1]], [6.4, 5.1, 5], (nn, w) => {
    const strike = (w[0] - bob[0]) * dx + (w[1] - bob[1]) * dy > 4.2 && w[2] > 4;
    return strike ? RUNG_IRON[4] : toneAt(nn, RUNG_IRON, 0);
  }, 6);
  CLAPPER = done(S, 38, 30, [{ at: bob, r: 8, color: CYAN[2], a: 0.14 }]);
  return CLAPPER;
}

/** Forget what was made (a test's painting without a canvas). */
export function forgetQuest1115Art(): void {
  PAGE = null;
  ROLL = null;
  CLAPPER = null;
}
