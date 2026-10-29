// FLOOR 20, THE QUIET TOWER (THE TOWER TOP): ITS OWN PIECES, themed after its boss, the Moth, and the last chapter (a
// mock-up; nothing of the game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of the 5
// levels, then 25 for each boss.” This floor's boss is the Moth (his doc "Wordsmith Act 2, Part Two: The High City
// (Levels 16–20)", approved by him: “Yes, go (Recommended)”): "A vast grey moth, its wings wider than the room is long, an
// eye on each wing that opens and follows you. The dust off its wings is the Hush itself: where it falls, words go dark
// and sound dies. It never lands for long." Its floor, the Tower Top. The level: "the highest tower of the High City,
// where the last chapter was taken"; its layout "a climb up the tower's spiralling floors (a scriptorium, a bell-less
// belfry, rooms the fog has filled) to the open top under the sky"; its enemies "the Hush in its own shapes, the Silent
// Order's last masks, and shadows of the four royals"; its story "the torn-out last chapter lies open on the tower's top.
// It does not tell how the story ends. It is a name, and the thing it names is the Hush itself."; its palette "Grey fog,
// bone white, no colour at all." Its ground: art/quiettower.ts.
//
// THE PIECES: the climb's (the scriptorium's desks, stools, presses of blank books, chests of blank quires, torn pages;
// the bell-less belfry's empty frame, its rope, its fallen clapper, its boards broken through; the tower's stair, its
// doors, its trapdoor to the top) and the Moth's (its cocoon on the wall, a wing it shed, its silk strung from a fallen
// beam, its grey dust drifted and the Hush's dust that rises as you step in it, moth-eaten hangings), the Silent Order's
// last (its banner gone grey, a fallen mask), and the top's (a fallen merlon, the cold beacon, the last chapter on its
// lectern, the quest).
//
// THE RULES THEY KEEP: as art/act2_kit.ts says (built in depth in floor 4's Scene, a step quieter than any word through
// art/act2_quiet.ts, seams of ink where one thing ends before another; real shapes, not circles and squares). Nothing
// glows but the guttering candles (an honest flame) and the last chapter's own pale light (the quest); nothing cyan, no
// pink. No colour at all: greys, bone white, the fog's grey; strong values so each reads at a phone's size.

import type { Sprite } from '../engine/px';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import type { Piece } from './floorkit';
import { CANDLE } from './floor11';
import { hash } from './kit';
import type { Ramp } from './kit';
import { HOLE, IRON, MASK, SOFT_ID, checker, cylinder, done, facing, frontPiece, local, lying, scene, turned } from './act2_kit';
import { QT_BOARD, boards } from './quiettower';

const fr = (t: number): number => t - Math.floor(t);
const AX: [V3, V3, V3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const add = (a: readonly number[], b: readonly number[]): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: readonly number[], b: readonly number[]): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: readonly number[], k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: readonly number[], b: readonly number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: readonly number[], b: readonly number[]): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: readonly number[]): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
/** A light a piece gives, at a point of its own frame. */
export type PieceLight = { at: V3; r: number; color: string; a?: number };

// =================================================================================================
// THE TOWER'S MATERIALS (each from its deep shade to its lit top): grey fog, bone white, no colour at all

/** The tower's dressed stone, bone-grey. */
export const TSTONE: Ramp = ['#25252b', '#4b4a4c', '#6e6d6b', '#8f8c86', '#b4afa5'];
/** Bone white: worn stone's lit edges, the masks, the pages' light. */
export const BONE: Ramp = ['#6f6a60', '#9a9486', '#bcb5a5', '#d4cdbd', '#e4ded0'];
/** The scriptorium's oak, grey with age. */
export const GREYOAK: Ramp = ['#19181c', '#2e2c31', '#45424a', '#5d595d', '#787372'];
/** The belfry's great timbers, darker. */
export const BELLOAK: Ramp = ['#131216', '#232127', '#363339', '#4a464b', '#625d5f'];
/** Paper, blank. */
export const PAPER: Ramp = ['#5e5a52', '#827d72', '#a39d90', '#c2bcae', '#dad4c6'];
/** Candle wax, old. */
export const WAX: Ramp = ['#6a6556', '#8e8874', '#ada692', '#c8c1aa', '#ddd6c0'];
/** Grey ash, cold. */
export const ASH: Ramp = ['#29292d', '#3d3d41', '#545458', '#6d6d6f', '#888786'];
/** The Moth's silk. */
export const SILK: Ramp = ['#56575d', '#74767b', '#939599', '#b2b3b5', '#cdcdcb'];
/** The Moth's wing: its scales grey, a little warm. */
export const WING: Ramp = ['#2a292d', '#433f44', '#5d585a', '#7a7472', '#97918b'];
/** The Silent Order's black cloth, gone grey. */
export const GREYED: Ramp = ['#1c1c21', '#2b2a30', '#3b3a40', '#4e4d53', '#636268'];
/** Hemp rope, grey. */
export const HEMP: Ramp = ['#38342f', '#4f4942', '#696257', '#837b6e', '#9c9486'];
/** The Hush's grey dust. */
export const DUST: Ramp = ['#2f2f35', '#45454b', '#5b5b60', '#76767a', '#8f8f92'];
/** The books' bindings, faded: calf gone grey, slate cloth, a dull mauve-grey, vellum. */
const BINDINGS: Ramp[] = [
  ['#2b2827', '#3e3a37', '#544e49', '#6c645c', '#837a70'],
  ['#24262b', '#353841', '#4a4e58', '#60656f', '#787d86'],
  ['#2c2a2c', '#403c3f', '#575256', '#6f696c', '#878082'],
  ['#5c574e', '#7c766a', '#9b9486', '#b7b0a1', '#cdc6b6'],
];
/** A line of writing gone dark on a page; the name. */
const DARKLINE = '#2c2a30';
const NAME = '#1a181e';
/** The last chapter's own pale light (the quest's, as floor 16's shirt's). */
export const QUEST_LIGHT = '#e8e2d2';

// =================================================================================================
// HELPERS

/** The axes of a thing laid from `a` to `b`: along it, across it level, and up from it. */
function axesAlong(a: V3, b: V3): [V3, V3, V3] {
  const d = unit(sub(b, a));
  const up: V3 = Math.abs(d[2]) > 0.95 ? [1, 0, 0] : [0, 0, 1];
  const s = unit(cross(d, up));
  return [d, s, unit(cross(s, d))];
}
/** A SQUARED TIMBER (or a bar) from `a` to `b`, `t` thick each way; lit as it faces; its ends dark; a crack along its grain now and then. */
function beam(S: Scene, a: V3, b: V3, t: number, r: Ramp, id: number, bias = 0, t2 = t): void {
  const A = axesAlong(a, b);
  const len = Math.hypot(...sub(b, a));
  S.box(mul(add(a, b), 0.5), A, [len / 2, t, t2], (f, u, v, n) => {
    if (f < 2) return r[0];
    const along = f === 2 || f === 3 ? v : u;
    if (len > 30 && Math.abs(fr(along * 3 + hash(f, id, 6301) * 0.7) - 0.5) < 0.035) return r[1];
    return toneAt(n, r, bias);
  }, id);
}
/**
 * AN UPRIGHT PRISM of `n` sides round (cx, cy), its corners at radius `r0` at its foot (z0) and `r1` at its head (z1), turned
 * `rot`: each side lit as it faces (`side` for its own colour); its top `top` (null: open).
 */
function prism(S: Scene, cx: number, cy: number, n: number, r0: number, r1: number, z0: number, z1: number, r: Ramp, id: number, rot = 0, bias = 0, top: string | null = r[4], side?: (k: number, u: number, v: number, nn: V3) => string | null): void {
  const P = (a: number, rr: number, z: number): V3 => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, z];
  for (let k = 0; k < n; k++) {
    const a0 = rot + (k / n) * Math.PI * 2;
    const a1 = rot + ((k + 1) / n) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const nn = unit([Math.cos(am), Math.sin(am), (r0 - r1) / Math.max(0.01, z1 - z0)]);
    const nw = facing(S, nn);
    S.quad([P(a0, r0, z0), P(a1, r0, z0), P(a1, r1, z1), P(a0, r1, z1)], (u, v) => (side ? side(k, u, v, nw) : toneAt(nw, r, bias + (v > 0.9 ? 0.25 : 0))), id);
  }
  if (top) {
    const c: V3 = [cx, cy, z1];
    for (let k = 0; k < n; k++) {
      const a0 = rot + (k / n) * Math.PI * 2;
      const a1 = rot + ((k + 1) / n) * Math.PI * 2;
      S.quad([c, P(a0, r1, z1), P(a1, r1, z1), P(a1, r1, z1)], () => top, id);
    }
  }
}
/** A CANDLE at (x, y) standing on `z`: `h` tall, wax run down it; lit (an honest flame, `f` its flicker) or out (its wick black). Its tip. */
function candle(S: Scene, x: number, y: number, z: number, h: number, lit: boolean, id: number, r = 1.4, f = 0): V3 {
  cylinder(S, x, y, r, z, z + h, (n, a, zz) => toneAt(n, WAX, Math.cos(a * 3 + id) > 0.65 && zz < z + h - 0.8 ? 0.45 : 0), id, () => WAX[4]);
  const tip: V3 = [x, y, z + h + 1.6];
  if (lit) {
    const tall = f === 1 ? 0.6 : 1;
    S.ball([x, y, z + h + 1.4], 1.3, CANDLE, 1000 + id, undefined, 0.6);
    S.ball([x + (f === 1 ? 0.6 : 0), y, z + h + 1.4 + 1.9 * tall], 0.9 * tall + 0.2, CANDLE, 1500 + id, undefined, 0.95);
  } else S.rod([x, y, z + h], [x, y, z + h + 1.2], 0.3, 0.3, ASH, id);
  return tip;
}
/** Wax run down from (x, y, z): a few drips, the last a bead. */
function drips(S: Scene, x: number, y: number, z: number, n: number, id: number): void {
  for (let k = 0; k < n; k++) S.ball([x + (k % 2) * 0.3, y + 0.2, z - k * 1.2], 0.75 - k * 0.08, WAX, id);
}
/** A BOOK standing or lying: its middle `c`, turned `ang` about the upright; `L` long (its height standing), `T` thick, `W` deep; open on its back (`open`, pages up) or shut; its binding `r`. */
function book(S: Scene, c: V3, ang: number, L: number, T: number, W: number, up: boolean, r: Ramp, id: number): void {
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const A: [V3, V3, V3] = up ? [[-sa, ca, 0], [ca, sa, 0], [0, 0, 1]] : [[ca, sa, 0], [0, 0, 1], [-sa, ca, 0]];
  const R: V3 = up ? [W / 2, T / 2, L / 2] : [L / 2, T / 2, W / 2];
  S.box(c, A, R, (f, u, v, n) => {
    // the pages' edges (away from the spine): pale, lined
    const pages = up ? f === 1 || f === 4 : f === 0 || f === 1 || f === 4;
    if (pages) return toneAt(n, PAPER, fr((up ? u : v) * 7) < 0.2 ? -0.5 : f === 4 && up ? -0.2 : 0.1);
    return toneAt(n, r, 0);
  }, id);
}
/** AN OPEN BOOK lying on its back at `c` (its gutter along `ang`), two page-blocks rising from the gutter; blank, or a line or two gone dark. */
function openBook(S: Scene, c: V3, ang: number, L: number, half: number, r: Ramp, id: number, seed: number): void {
  const G: V3 = [Math.cos(ang), Math.sin(ang), 0];
  const X: V3 = [-Math.sin(ang), Math.cos(ang), 0];
  // the covers, a little wider than the pages
  S.quad([add(c, add(mul(G, -L / 2 - 1), mul(X, -half - 1))), add(c, add(mul(G, L / 2 + 1), mul(X, -half - 1))), add(c, add(mul(G, L / 2 + 1), mul(X, half + 1))), add(c, add(mul(G, -L / 2 - 1), mul(X, half + 1)))], () => r[2], id);
  for (const s of [-1, 1]) {
    const N = 6;
    for (let i = 0; i < N; i++) {
      const u0 = i / N;
      const u1 = (i + 1) / N;
      const h = (u: number): number => 1 + 1.6 * Math.sin(Math.min(1, u * 2) * Math.PI * 0.5) - 1.0 * u * u;
      const P = (u: number, g: number): V3 => add(c, add(add(mul(X, s * u * half), mul(G, g)), [0, 0, h(u)]));
      S.quad([P(u0, -L / 2), P(u1, -L / 2), P(u1, L / 2), P(u0, L / 2)], (uu, vv) => {
        const u = u0 + (u1 - u0) * uu;
        const line = fr(vv * 8);
        if (hash(Math.floor(vv * 8), seed + (s > 0 ? 1 : 0), 6311) < 0.25 && line > 0.4 && line < 0.6 && u > 0.15 && u < 0.85) return DARKLINE;
        return u < 0.12 ? PAPER[2] : s < 0 ? PAPER[4] : PAPER[3];
      }, id + 1);
    }
  }
}

// =================================================================================================
// THE LAST CHAPTER ON ITS LECTERN (the quest)

/**
 * THE LAST CHAPTER ON ITS LECTERN: a lectern of the tower's stone (an octagonal foot of two steps, a shaft clustered with
 * four colonnettes, a flared capital, a sloping rest with a lip), and on it the torn-out last chapter lying open: a
 * quire of pages torn from its book, its sewing threads hanging from the gutter; on the left page its lines, faint; on the
 * right, one line alone, darker: the name. A page slipping off it. Its own pale light. 150 x 130 at (75, 100).
 */
export function lecternIn(S: Scene, chapter = true): PieceLight[] {
  prism(S, 0, 0, 8, 17, 17, 0, 4, TSTONE, 1, Math.PI / 8, 0, BONE[3]);
  prism(S, 0, 0, 8, 13, 13, 4, 8, TSTONE, 2, Math.PI / 8, 0, BONE[2]);
  prism(S, 0, 0, 8, 7, 7, 8, 11, TSTONE, 3, Math.PI / 8, 0.1, TSTONE[3]);
  prism(S, 0, 0, 8, 5, 5, 11, 32, TSTONE, 3, Math.PI / 8, 0, null);
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    S.rod([Math.cos(a) * 5.6, Math.sin(a) * 5.6, 11], [Math.cos(a) * 5.6, Math.sin(a) * 5.6, 32], 1.5, 1.5, TSTONE, 4);
  }
  prism(S, 0, 0, 8, 7.5, 7.5, 31, 33, TSTONE, 5, Math.PI / 8, 0.1, null);
  prism(S, 0, 0, 8, 7, 12, 33, 38, TSTONE, 5, Math.PI / 8, 0.05, TSTONE[3]);
  // the rest, sloping down toward +y, and its lip
  const t = 0.44;
  const N: V3 = [0, Math.sin(t), Math.cos(t)];
  const D: V3 = [0, -Math.cos(t), Math.sin(t)];
  const X: V3 = [1, 0, 0];
  const C: V3 = [0, 1, 42];
  S.box(C, [X, D, N], [24, 15, 2], (f, _u, v, n) => (f === 4 ? (v > 0.95 ? BONE[3] : toneAt(n, TSTONE, -0.05)) : toneAt(n, TSTONE, 0.05)), 6);
  S.box(add(C, add(mul(D, -15), mul(N, 2.2))), [X, D, N], [24, 1.3, 2.4], (f, _u, _v, n) => (f === 4 ? BONE[3] : toneAt(n, TSTONE, 0.1)), 7);
  if (!chapter) return [];
  // THE LAST CHAPTER: two page-blocks rising from the gutter along the rest's slope
  const at = (s: number, d: number, h: number): V3 => add(C, add(add(mul(X, s), mul(D, d)), mul(N, 2 + h)));
  const HALF = 20;
  const LEN = 12.5;
  for (const side of [-1, 1]) {
    const NS = 8;
    for (let i = 0; i < NS; i++) {
      const u0 = i / NS;
      const u1 = (i + 1) / NS;
      const h = (u: number): number => 0.8 + 2.6 * Math.sin(Math.min(1, u * 1.8) * Math.PI * 0.5) - 1.6 * u * u;
      const P = (u: number, d: number): V3 => at(side * u * HALF, d, h(u));
      S.quad([P(u0, -LEN), P(u1, -LEN), P(u1, LEN), P(u0, LEN)], (uu, vv) => {
        const u = u0 + (u1 - u0) * uu;
        const d = -LEN + 2 * LEN * vv;
        // its edges a step darker; the gutter's shade
        if (u > 0.95 || Math.abs(d) > LEN - 0.8) return PAPER[3];
        if (u < 0.1) return PAPER[2];
        if (side < 0) {
          // the left page: its lines, faint; ten of them
          const row = (d + LEN) / (2 * LEN) * 11;
          const lr = fr(row);
          const end = 0.88 - 0.3 * hash(Math.floor(row), 1, 6321);
          if (row > 1 && row < 10.2 && lr > 0.42 && lr < 0.66 && u > 0.18 && u < end && hash(Math.floor(u * 26), Math.floor(row), 6322) < 0.72) return PAPER[1];
          return u > 0.5 ? BONE[4] : BONE[3];
        }
        // the right page: one line alone, near its head, darker: the name. The rest of the page blank.
        if (d > 5.5 && d < 7.6 && u > 0.22 && u < 0.7 && hash(Math.floor(u * 20), 3, 6323) < 0.8) return NAME;
        return u > 0.5 ? BONE[3] : BONE[4];
      }, 8);
    }
    // the pages' outer edge: their thickness, lined
    S.quad([at(side * HALF, -LEN, 0.8 + 2.6 - 1.6), at(side * HALF, LEN, 0.8 + 2.6 - 1.6), at(side * HALF, LEN, 0), at(side * HALF, -LEN, 0)], (_u, v) => (fr(v * 4) < 0.3 ? PAPER[1] : PAPER[2]), 9);
  }
  // its torn sewing: threads hanging from the gutter over the lip
  for (let k = 0; k < 4; k++) {
    const s = -2 + k * 1.3;
    const top = at(s, -LEN + 0.5, 0.6);
    S.rod(top, add(top, [0.4 * (k - 1.5), 1.6, -5 - (k % 2) * 3]), 0.35, 0.3, PAPER, 10);
  }
  // a loose page slipping off its right side
  const lp0 = at(HALF - 2, -6, 1.4);
  S.quad([lp0, add(lp0, [9, 3, -6]), add(lp0, [7, 10, -9]), add(lp0, [-1, 8, -2])], (u, v) => (u > 0.9 || v > 0.92 ? PAPER[2] : BONE[3]), 11);
  return [{ at: at(0, 0, 6), r: 34, color: QUEST_LIGHT, a: 0.3 }];
}
function lectern(): Sprite {
  const S = scene(150, 130, 75, 100);
  return done(S, 75, 100, lecternIn(S));
}

// =================================================================================================
// THE SCRIPTORIUM: a copyist's desk, a stool, a press of blank books, a chest of blank quires, torn pages

/**
 * A COPYIST'S DESK: a tall sloping desk of grey oak on four posts, stretchers low, a shelf under; on its slope a blank
 * page pinned, another curling off; on the flat strip at its head an inkwell of horn, dry, two quills in it, a candle
 * stub burnt out. Along x (`k` 0: the slope faces +y) or along y (1). 110 x 110 at (55, 76).
 */
export function deskIn(S: Scene): void {
  for (const [x, y, h] of [[-17, -8, 39], [17, -8, 39], [-17, 8, 30], [17, 8, 30]] as const) S.box([x, y, h / 2], AX, [1.6, 1.6, h / 2], (f, _u, _v, n) => toneAt(n, GREYOAK, f === 4 ? 0.2 : 0), 1);
  S.box([0, -8, 7], AX, [16, 1.1, 1.3], (_f, _u, _v, n) => toneAt(n, GREYOAK, 0), 2);
  S.box([0, 8, 7], AX, [16, 1.1, 1.3], (_f, _u, _v, n) => toneAt(n, GREYOAK, 0), 2);
  S.box([-17, 0, 7], AX, [1.1, 7, 1.3], (_f, _u, _v, n) => toneAt(n, GREYOAK, 0), 2);
  S.box([17, 0, 7], AX, [1.1, 7, 1.3], (_f, _u, _v, n) => toneAt(n, GREYOAK, 0), 2);
  // the shelf under the slope, a bundle of blank quires on it
  S.box([0, 0, 17], AX, [15.5, 7, 0.9], (f, _u, v, n) => (f === 4 && v > 0.9 ? GREYOAK[4] : toneAt(n, GREYOAK, 0)), 3);
  S.box([-6, 1, 19.5], AX, [6, 4.5, 1.6], (f, u, _v, n) => (f === 4 ? PAPER[3] : fr(u * 6) < 0.3 ? PAPER[1] : toneAt(n, PAPER, 0)), 4);
  // the slope: from its foot at the front (+y) up to the strip at its head
  const t = 0.42;
  const D: V3 = [0, -Math.cos(t), Math.sin(t)];
  const N: V3 = [0, Math.sin(t), Math.cos(t)];
  const C: V3 = [0, 2.5, 34];
  S.box(C, [[1, 0, 0], D, N], [19, 8, 1.1], (f, u, v, n) => {
    if (f === 4) return v > 0.94 ? GREYOAK[4] : fr(u * 5 + 0.1) < 0.03 ? GREYOAK[1] : toneAt(n, GREYOAK, 0.05);
    return toneAt(n, GREYOAK, 0);
  }, 5);
  // the ledge at its foot
  S.box(add(C, add(mul(D, -8), mul(N, 1.8))), [[1, 0, 0], D, N], [19, 0.9, 1.6], (_f, _u, _v, n) => toneAt(n, GREYOAK, 0.15), 6);
  // the strip at its head
  S.box([0, -7, 38.5], AX, [19, 2.6, 0.9], (f, _u, v, n) => (f === 4 && v > 0.85 ? GREYOAK[4] : toneAt(n, GREYOAK, 0)), 7);
  // a blank page pinned on the slope; another curling off its edge
  const pg = (s: number, d: number, h: number): V3 => add(C, add(add([s, 0, 0], mul(D, d)), mul(N, 1.2 + h)));
  S.quad([pg(-11, -6, 0), pg(1, -6, 0), pg(1, 6, 0), pg(-11, 6, 0)], (u, v) => (u > 0.94 || v < 0.04 ? PAPER[2] : PAPER[4]), 8);
  S.quad([pg(4, -5, 0), pg(15, -5, 0.5), pg(16, 5, 2.5), pg(4, 5, 0)], (u) => (u > 0.8 ? PAPER[2] : PAPER[3]), 9);
  // the inkwell: a horn in a hole, dry; two quills in it
  cylinder(S, 9, -7, 1.9, 39.4, 42.4, (n) => toneAt(n, GREYED, 0.1), 10, () => '#141218');
  for (const [dx, dy, lean] of [[0.4, 0.3, 1], [-0.5, -0.2, -1]] as const) {
    const base: V3 = [9 + dx, -7 + dy, 41];
    const tip: V3 = [9 + dx + lean * 6, -7 + dy - 2, 55];
    S.rod(base, tip, 0.35, 0.3, BONE, 11);
    S.egg(mul(add(add(base, tip), [lean * 1.2, 0, 4]), 0.5), axesAlong(base, tip), [6, 1.6, 0.5], (n) => toneAt(n, BONE, 0.1), 12, (w) => w[2] > 45);
  }
  // a candle stub, burnt out
  candle(S, -14, -7, 39.4, 3, false, 13, 1.3);
  drips(S, -12.8, -6, 41.6, 2, 13);
}
function desk(k: number): Sprite {
  const S = turned(scene(110, 110, 55, 76), k);
  deskIn(S);
  return done(S, 55, 76);
}

/** A COPYIST'S STOOL: a round seat of grey oak on three splayed legs, a ring of stretchers; or broken, its seat split in two on the floor, a leg snapped. 60 x 60 at (30, 46). */
export function stoolIn(S: Scene, broken: boolean): void {
  if (!broken) {
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.4;
      S.rod([Math.cos(a) * 4, Math.sin(a) * 4, 20], [Math.cos(a) * 8.5, Math.sin(a) * 8.5, 0], 1.3, 1.1, GREYOAK, 1);
      const b = a + (Math.PI * 2) / 3;
      S.rod([Math.cos(a) * 6.6, Math.sin(a) * 6.6, 7], [Math.cos(b) * 6.6, Math.sin(b) * 6.6, 7], 0.7, 0.7, GREYOAK, 2);
    }
    // the seat: dished a little, its edge rounded over
    cylinder(S, 0, 0, (z) => 7.5 + (z - 20) * 0.4, 20, 22.5, (n) => toneAt(n, GREYOAK, 0.05), 3, (a, rr) => (rr > 0.86 ? GREYOAK[4] : Math.abs(Math.sin(a * 2)) < 0.05 && rr < 0.8 ? GREYOAK[1] : GREYOAK[3]));
    return;
  }
  // its seat split in two, the halves lying tilted; a leg snapped, a leg lying, a stump
  const half = (cx: number, cy: number, ang: number, tilt: number, id: number): void => {
    const A: [V3, V3, V3] = [[Math.cos(ang), Math.sin(ang), 0], [-Math.sin(ang) * Math.cos(tilt), Math.cos(ang) * Math.cos(tilt), Math.sin(tilt)], [Math.sin(ang) * Math.sin(tilt), -Math.cos(ang) * Math.sin(tilt), Math.cos(tilt)]];
    S.egg([cx, cy, 2], A, [7.5, 7.5, 1.4], (n, w) => {
      const q = sub(local(S, w), [cx, cy, 2]);
      return dot(q, A[1]) < 0 ? null : toneAt(n, GREYOAK, 0.05);
    }, id);
  };
  half(-5, -2, 0.3, 0.35, 3);
  half(6, 5, 2.6, 0.25, 4);
  S.rod([-3, 9, 1.2], [12, 13, 1.2], 1.2, 1.0, GREYOAK, 5);
  S.rod([8, -6, 0], [8.6, -6.4, 6], 1.2, 1.1, GREYOAK, 6);
  S.rod([8.6, -6.4, 6], [8.9, -6.2, 7.5], 0.6, 0.3, GREYOAK, 6);
  S.rod([-14, 4, 1], [-4, -10, 1.4], 1.1, 1.0, GREYOAK, 7);
}
function stool(broken: boolean): Sprite {
  const S = scene(60, 60, 30, 46);
  stoolIn(S, broken);
  return done(S, 30, 46);
}

/**
 * A PRESS OF BLANK BOOKS: an open press of grey oak a tile long, its cornice, four shelves of books, their bindings faded
 * and their spines blank; one lying open on its shelf, its pages blank; a run of them fallen against each other; a gap.
 * Along x (`k` 0: its shelves face +y) or along y (1). 110 x 150 at (55, 120).
 */
export function pressIn(S: Scene): void {
  const L = 19;
  const Dp = 6;
  const H = 74;
  // its back, its sides, its plinth and cornice
  S.box([0, -Dp + 0.8, H / 2], AX, [L, 0.8, H / 2], (_f, _u, _v, n) => toneAt(n, GREYOAK, -0.5), 1);
  for (const x of [-L, L]) S.box([x, 0, H / 2], AX, [1.3, Dp, H / 2], (f, _u, v, n) => (f === 4 ? GREYOAK[4] : f === 2 && v < 0.06 ? GREYOAK[0] : toneAt(n, GREYOAK, 0.05)), 2);
  S.box([0, 0.6, 2.5], AX, [L, Dp + 0.6, 2.5], (_f, _u, _v, n) => toneAt(n, GREYOAK, 0), 3);
  S.box([0, 0.8, H + 1.6], AX, [L + 2.5, Dp + 1.6, 1.6], (f, _u, v, n) => (f === 4 && v > 0.88 ? GREYOAK[4] : toneAt(n, GREYOAK, 0.1)), 4);
  const shelves = [5, 22, 39, 56];
  shelves.forEach((z, s) => {
    S.box([0, 0, z], AX, [L - 1.3, Dp - 0.6, 0.8], (f, _u, v, n) => (f === 2 || (f === 4 && v > 0.9) ? GREYOAK[3] : toneAt(n, GREYOAK, 0)), 5);
    // the books on it, standing, each its own height and binding; one shelf with a gap and a run leaning
    let x = -L + 1.6;
    let i = 0;
    while (x < L - 2.5) {
      const h0 = hash(i, s, 6331);
      const T = 2 + Math.floor(h0 * 3);
      const Hb = 10 + Math.floor(hash(i, s, 6332) * 5);
      const r = BINDINGS[Math.floor(hash(i, s, 6333) * BINDINGS.length)];
      if (s === 2 && x > 2 && x < 10) {
        // the gap; a book lying open in it, its pages blank
        if (x < 3) openBook(S, [6, -1.5, z + 1.6], Math.PI / 2, 8, 4.5, r, 20 + s * 2, 6334);
        x += T;
        i++;
        continue;
      }
      const lean = s === 1 && x > 8 ? 0.35 : 0;
      const c: V3 = [x + T / 2 + lean * Hb * 0.5, -1, z + 0.8 + Hb / 2 - lean * 2];
      if (lean) {
        const A: [V3, V3, V3] = [[0, 1, 0], [Math.cos(lean), 0, -Math.sin(lean)], [Math.sin(lean), 0, Math.cos(lean)]];
        S.box(c, A, [4.2, T / 2, Hb / 2], (f, _u, _v, n) => (f === 1 || f === 4 ? toneAt(n, PAPER, -0.1) : toneAt(n, r, 0)), 10 + s);
      } else book(S, c, 0, Hb, T, 8.4, true, r, 10 + s);
      x += T + (hash(i, s, 6335) < 0.12 ? 1.5 : 0.2);
      i++;
    }
  });
}
function press(k: number): Sprite {
  const S = turned(scene(110, 150, 55, 120), k);
  pressIn(S);
  return done(S, 55, 120);
}

/** A CHEST OF BLANK QUIRES: an oak chest bound with iron, its lid thrown up, folded quires of blank paper heaped in it; or broken open, its lid off, a side split, the quires spilled out. 80 x 80 at (40, 58). */
export function chestIn(S: Scene, broken: boolean): void {
  const band = (f: number, u: number, v: number): boolean => (f === 2 || f === 3 ? u : f === 0 || f === 1 ? v : 0) % 1 < 0.08 || Math.abs(((f === 2 || f === 3 ? u : f === 0 || f === 1 ? v : 0) % 1) - 0.92) < 0.06;
  if (!broken) {
    S.box([0, 0, 7], AX, [12, 7.5, 7], (f, u, v, n) => {
      if (f === 4) return null;
      if (band(f, u, v)) return toneAt(n, IRON, 0.1);
      return fr((f === 2 || f === 3 ? v : u) * 3) < 0.06 ? GREYOAK[0] : toneAt(n, GREYOAK, 0);
    }, 1);
    S.quad([[-11.5, -7, 13], [11.5, -7, 13], [11.5, 7, 13], [-11.5, 7, 13]], () => '#141218', 1);
    // the quires heaped in it, each a folded stack of blank paper
    for (let k = 0; k < 5; k++) {
      const x = -7 + (k % 3) * 7 + hash(k, 1, 6341) * 2;
      const y = -2.5 + Math.floor(k / 3) * 5;
      const z = 13 + (k > 2 ? 1.5 : 0);
      const a = (hash(k, 2, 6341) - 0.5) * 0.4;
      S.box([x, y, z], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [3.4, 2.5, 1.4], (f, u, _v, n) => (f === 4 ? PAPER[4] : fr(u * 5) < 0.3 ? PAPER[1] : toneAt(n, PAPER, 0)), 2);
    }
    // the lid, thrown up and back against its stay
    const ang = 1.95;
    const hinge: V3 = [0, -7.5, 14];
    const d: V3 = [0, Math.cos(ang), Math.sin(ang)];
    S.box(add(hinge, mul(d, 7.5)), [[1, 0, 0], d, unit(cross([1, 0, 0], d))], [12.5, 7.5, 1.4], (f, u, v, n) => (band(f, u, v) && f !== 4 && f !== 5 ? toneAt(n, IRON, 0.1) : toneAt(n, GREYOAK, f === 5 ? -0.2 : 0.05)), 3);
    return;
  }
  // broken open: its body split down one corner, the lid lying off it, the quires spilled
  S.box([-1, 0, 6], AX, [11, 7.5, 6], (f, u, v, n) => {
    if (f === 4) return null;
    if (f === 2 && u > 0.6) return null;
    if (band(f, u, v)) return toneAt(n, IRON, 0.1);
    return toneAt(n, GREYOAK, 0);
  }, 1);
  S.quad([[-10.5, -7, 11], [10, -7, 11], [10, 7, 11], [-10.5, 7, 11]], () => '#141218', 1);
  S.box([16, 6, 1.5], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [12, 7.5, 1.4], (f, u, v, n) => (band(f, u, v) ? toneAt(n, IRON, 0.1) : toneAt(n, GREYOAK, 0.05)), 3);
  S.rod([7, 8, 1], [4, 18, 1], 1.1, 1.1, GREYOAK, 4);
  for (let k = 0; k < 7; k++) {
    const x = -14 + hash(k, 1, 6342) * 26;
    const y = 8 + hash(k, 2, 6342) * 10;
    const a = hash(k, 3, 6342) * Math.PI;
    S.box([x, y, 0.9 + (k % 2) * 0.8], [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]], [3.4, 2.5, 0.8], (f, u, _v, n) => (f === 4 ? PAPER[4] : fr(u * 4) < 0.3 ? PAPER[1] : toneAt(n, PAPER, 0)), 5);
  }
}
function chest(broken: boolean): Sprite {
  const S = scene(90, 80, 42, 58);
  chestIn(S, broken);
  return done(S, 42, 58);
}

/**
 * A HEAP OF TORN PAGES: pages torn out of their books and heaped up, blank (the words gone), a few with a line gone dark;
 * on top an empty binding, its boards open on stubs; or kicked apart, the pages scattered flat. 100 x 70 at (50, 46).
 */
export function pagesIn(S: Scene, scattered: boolean): void {
  const n = scattered ? 16 : 22;
  for (let k = 0; k < n; k++) {
    const r = scattered ? 6 + hash(k, 1, 6351) * 20 : 2 + hash(k, 1, 6351) * 11 * (1 - k / n);
    const a0 = hash(k, 2, 6351) * Math.PI * 2;
    const cx = Math.cos(a0) * r;
    const cy = Math.sin(a0) * r * 0.8;
    const z = scattered ? 0.4 + (k % 3) * 0.2 : 0.4 + (k / n) * 9 * (1 - r / 16);
    const a = hash(k, 3, 6351) * Math.PI;
    const ca = Math.cos(a) * 4.5;
    const sa = Math.sin(a) * 4.5;
    const tilt = (hash(k, 4, 6351) - 0.5) * 3;
    const line = hash(k, 5, 6351) < 0.3;
    S.quad([[cx - ca + sa * 0.7, cy - sa - ca * 0.7, z + tilt], [cx + ca + sa * 0.7, cy + sa - ca * 0.7, z], [cx + ca - sa * 0.7, cy + sa + ca * 0.7, z - tilt * 0.5], [cx - ca - sa * 0.7, cy - sa + ca * 0.7, z + tilt]], (u, v) => {
      if (u > 0.92 && hash(Math.floor(v * 7), k, 6352) < 0.5) return null;
      if (line && Math.abs(v - 0.35) < 0.06 && u > 0.15 && u < 0.8) return DARKLINE;
      return u < 0.06 || v > 0.94 ? PAPER[2] : k % 2 ? PAPER[4] : PAPER[3];
    }, 1 + (k % 4));
  }
  if (!scattered) {
    // the empty binding on top: two boards open, the stubs of the torn pages along its spine
    const c: V3 = [1, -1, 10.5];
    S.box(add(c, [-5.5, 0, 0]), [[0.96, 0, -0.27], [0, 1, 0], [0.27, 0, 0.96]], [5.5, 7.5, 0.7], (_f, _u, _v, n) => toneAt(n, BINDINGS[0], 0), 6);
    S.box(add(c, [5.5, 0, 0.3]), [[0.94, 0, 0.33], [0, 1, 0], [-0.33, 0, 0.94]], [5.5, 7.5, 0.7], (_f, _u, _v, n) => toneAt(n, BINDINGS[0], 0), 6);
    for (let k = 0; k < 5; k++) S.rod([c[0], c[1] - 6 + k * 3, c[2] + 0.8], [c[0] + 0.3, c[1] - 6 + k * 3, c[2] + 2.4], 0.6, 0.4, PAPER, 7);
  }
}
function pages(scattered: boolean): Sprite {
  const S = scene(100, 70, 50, 46);
  pagesIn(S, scattered);
  return done(S, 50, 46);
}

// =================================================================================================
// THE BELL-LESS BELFRY: the empty frame, a rope, the fallen clapper, the boards broken through

/**
 * THE EMPTY BELL FRAME: the belfry's great frame of dark oak, two trestles (each a sill on the floor, two raking posts,
 * a cap, a brace), the headstock across them on its bearings, its wheel for the rope; and where the bell hung, nothing:
 * its iron straps hanging empty from the headstock, one broken. Two tiles across. 200 x 250 at (104, 186).
 */
export function bellFrameIn(S: Scene): void {
  const T = 3.2;
  for (const x of [-36, 36]) {
    beam(S, [x, -22, T], [x, 22, T], T, BELLOAK, 1, 0.05);
    beam(S, [x, -18, T], [x, -3, 104], T * 0.9, BELLOAK, 2);
    beam(S, [x, 18, T], [x, 3, 104], T * 0.9, BELLOAK, 3);
    beam(S, [x, -6, 105], [x, 6, 105], T, BELLOAK, 4, 0.1);
    beam(S, [x, -12, 44], [x, 12, 44], T * 0.7, BELLOAK, 5);
    // the iron bearing on its cap
    S.box([x, 0, 109.5], AX, [3.6, 3, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 6);
  }
  // the headstock across, square, banded; the axle's stubs in the bearings
  beam(S, [-38, 0, 114], [38, 0, 114], 4.2, BELLOAK, 7, 0.05);
  for (const x of [-26, -10, 10, 26]) S.box([x, 0, 114], AX, [1, 4.5, 4.5], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 8);
  // the wheel at its end: a rim of oak on spokes, the rope's groove; past the frame on -x
  const wc: V3 = [-46, 0, 114];
  const R = 26;
  for (let k = 0; k < 28; k++) {
    const a0 = (k / 28) * Math.PI * 2;
    const a1 = ((k + 1) / 28) * Math.PI * 2;
    S.rod(add(wc, [0, Math.cos(a0) * R, Math.sin(a0) * R]), add(wc, [0, Math.cos(a1) * R, Math.sin(a1) * R]), 1.6, 1.6, BELLOAK, 9);
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    S.rod(wc, add(wc, [0, Math.cos(a) * R, Math.sin(a) * R]), 1.1, 0.9, BELLOAK, 10);
  }
  S.box(wc, AX, [2.4, 3, 3], (_f, _u, _v, n) => toneAt(n, IRON, 0), 11);
  // WHERE THE BELL HUNG: its crown straps hanging empty from the headstock, one snapped; a link of chain
  for (const [x, len, bent] of [[-5, 22, 0], [5, 15, 1]] as const) {
    S.box([x, 0, 109.8 - len / 2], AX, [1.2, 0.7, len / 2], (_f, _u, _v, n) => toneAt(n, IRON, 0.05), 12);
    if (bent) S.box([x + 1.2, 1.2, 109.8 - len - 1.5], [[0.7, 0, -0.7], [0, 1, 0], [0.7, 0, 0.7]], [2.5, 0.7, 1.2], (_f, _u, _v, n) => toneAt(n, IRON, 0.05), 12);
    else S.box([x, 0, 109.8 - len + 1], AX, [3.5, 1.2, 1], (_f, _u, _v, n) => toneAt(n, IRON, 0.1), 12);
  }
}
function bellFrame(): Sprite {
  const S = scene(200, 250, 104, 186);
  bellFrameIn(S);
  return done(S, 104, 186);
}

/** A BELL ROPE, HANGING: down out of the dark from the wheel above, its sally (a grip of grey wool) at a man's chest, its tail coiled on the boards. 70 x 210 at (35, 190). */
export function bellRopeIn(S: Scene): void {
  const x = 0;
  const y = 0;
  // the rope from high above to the sally, swaying a little
  let prev: V3 = [x - 2, y, 176];
  for (let k = 1; k <= 18; k++) {
    const z = 176 - k * 7;
    const p: V3 = [x - 2 + Math.sin(k * 0.25) * 1.2, y, z];
    S.rod(prev, p, 0.9, 0.9, HEMP, 1);
    prev = p;
  }
  // the sally: thicker, wool, in grey and bone bands
  S.rod(prev, [prev[0], prev[1], 30], 2.1, 2.1, ['#3e3c3e', '#585558', '#757174', '#938e8c', '#ada7a0'], 2);
  for (let z = 32; z < prev[2] - 1; z += 4) S.rod([prev[0], prev[1], z], [prev[0], prev[1], z + 1.4], 2.3, 2.3, BONE, 3);
  // its tail down to the boards, and coiled there
  S.rod([prev[0], prev[1], 30], [prev[0] + 2, prev[1] + 2, 6], 0.9, 0.9, HEMP, 4);
  let q: V3 = [prev[0] + 2, prev[1] + 2, 6];
  for (let k = 1; k <= 26; k++) {
    const a = k * 0.55;
    const r = 3 + k * 0.28;
    const p: V3 = [Math.cos(a) * r + 2, Math.sin(a) * r + 2, 0.9 + (26 - k) * 0.12];
    S.rod(q, p, 0.9, 0.9, HEMP, 5);
    q = p;
  }
}
function bellRope(): Sprite {
  const S = scene(70, 210, 35, 190);
  bellRopeIn(S);
  return done(S, 35, 190);
}

/** THE GREAT BELL'S CLAPPER, FALLEN: a long iron clapper lying on the boards, its ball, its flight beyond it, the ring it hung by. On the floor. 110 x 60 at (55, 36). */
export function clapperIn(S: Scene): void {
  const a: V3 = [-20, -8, 2.2];
  const b: V3 = [16, 6, 2.2];
  S.rod(a, b, 1.8, 2.3, IRON, 1);
  // the ball, a long egg; and its flight beyond it
  const A = axesAlong(a, b);
  S.egg(add(b, mul(A[0], 3)), A, [6.5, 4.8, 4.8], (n) => toneAt(n, IRON, 0.05), 2);
  S.rod(add(b, mul(A[0], 9)), add(b, mul(A[0], 16)), 2.4, 1.4, IRON, 3);
  // the ring it hung by, lying
  for (let k = 0; k < 12; k++) {
    const t0 = (k / 12) * Math.PI * 2;
    const t1 = ((k + 1) / 12) * Math.PI * 2;
    const P = (t: number): V3 => add(a, add(mul(A[0], -4 - Math.cos(t) * 3.5), mul(A[1], Math.sin(t) * 3.5)));
    S.rod(P(t0), P(t1), 1.1, 1.1, IRON, 4);
  }
}
function clapper(): Sprite {
  const S = scene(110, 60, 55, 36);
  clapperIn(S);
  return done(S, 55, 36);
}

/** THE BOARDS BROKEN THROUGH (a floor tile of the belfry): its heavy boards stove in, splintered round a hole into the dark of the floor below. 64 x 32 at (32, 0). */
function brokenBoards(): Sprite {
  return lying(64, 34, 32, 1, (u, v, px, py) => {
    // (the tile's own diamond)
    if (u < 0 || v < 0 || u > 1 || v > 1) return null;
    const du = u - 0.5;
    const dv = v - 0.48;
    const ang = Math.atan2(dv, du);
    const rag = 0.22 + 0.06 * Math.sin(ang * 5 + 1) + 0.04 * Math.sin(ang * 11);
    const d = Math.hypot(du * 1.05, dv);
    if (d < rag) {
      // the hole: its far edge lit as splinters, the boards' thickness on its far side, then the dark
      if (dv < 0 && d > rag - 0.04) return BOARD_HEX[4];
      if (dv < 0 && d > rag - 0.09) return BOARD_HEX[1];
      return HOLE;
    }
    // splinters standing up round its edge
    if (d < rag + 0.05 && hash(Math.floor(ang * 9), 1, 6361) < 0.5) return d < rag + 0.025 ? BOARD_HEX[4] : BOARD_HEX[0];
    return rgbHex(boards(u, v, px, py));
  });
}

// =================================================================================================
// THE TOWER'S OWN: its stair, its door, the trapdoor to the top, the candles

/**
 * THE TOWER'S STAIR: a newel stair of the tower's stone winding up round its column into the dark: each step a wedge out
 * of the newel, its nose worn bone white, its riser in shade; a rope handrail on iron eyes. 160 x 300 at (80, 270).
 */
export function stairIn(S: Scene): void {
  const R = 32;
  const TOP = 160;
  const N = 17;
  const fade = (c: string, z: number): string => {
    if (z < 84) return c;
    const t = Math.min(1, (z - 84) / (TOP - 84));
    return t > 0.85 ? '#07080c' : t > 0.6 ? mixHex(c, '#07080c', 0.75) : t > 0.3 ? mixHex(c, '#07080c', 0.5) : mixHex(c, '#07080c', 0.25);
  };
  prism(S, 0, 0, 8, 6, 6, 0, TOP, TSTONE, 1, Math.PI / 8, 0, null, (_k, _u, v, n) => fade(toneAt(n, TSTONE, 0.3), v * TOP));
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2 * 1.6 + 2.2;
    const a1 = a0 + (Math.PI * 2 * 1.6) / N;
    const z = 9 + i * 9;
    const P = (a: number, r: number, zz: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, zz];
    // the tread
    S.quad([P(a0, 5, z), P(a0, R, z), P(a1 + 0.04, R, z), P(a1 + 0.04, 5, z)], (u, v) => fade(v < 0.14 ? BONE[3] : u > 0.92 ? TSTONE[3] : hash(i, Math.floor(u * 4), 6371) < 0.2 ? TSTONE[2] : TSTONE[3], z), 2 + (i % 2));
    // its riser, its outer end, its underside's edge
    S.quad([P(a0, 5, z - 9), P(a0, R, z - 9), P(a0, R, z), P(a0, 5, z)], (_u, v) => fade(toneAt(facing(S, [Math.cos(a0 - Math.PI / 2), Math.sin(a0 - Math.PI / 2), 0]), TSTONE, v > 0.85 ? 0.3 : -0.1), z), 2 + (i % 2));
    S.quad([P(a0, R, z - 9), P(a1 + 0.04, R, z - 4), P(a1 + 0.04, R, z), P(a0, R, z)], () => fade(toneAt(facing(S, [Math.cos((a0 + a1) / 2), Math.sin((a0 + a1) / 2), 0]), TSTONE, -0.05), z), 2 + (i % 2));
    // an iron eye on every third step, the rope through them
    if (i % 3 === 0) S.rod(P(a0 + 0.1, R - 1, z), P(a0 + 0.1, R - 1, z + 22), 0.6, 0.6, IRON, 6);
  }
  let prev: V3 | null = null;
  for (let i = 0; i <= N; i += 3) {
    const a = (i / N) * Math.PI * 2 * 1.6 + 2.2 + 0.1;
    const p: V3 = [Math.cos(a) * (R - 1), Math.sin(a) * (R - 1), 9 + i * 9 + 22];
    if (prev && p[2] < 120) S.rod(prev, p, 0.7, 0.7, HEMP, 7);
    prev = p;
  }
}
const rgbHex = (c: readonly number[]): string => '#' + [0, 1, 2].map((i) => Math.round(c[i]).toString(16).padStart(2, '0')).join('');
/** The belfry's boards as hex (the ground's own, art/quiettower.ts). */
const BOARD_HEX = QT_BOARD.map(rgbHex);
function mixHex(a: string, b: string, t: number): string {
  const p = (c: string, i: number): number => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16);
  return '#' + [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t).toString(16).padStart(2, '0')).join('');
}
function stair(): Sprite {
  const S = scene(160, 300, 80, 270);
  stairIn(S);
  return done(S, 80, 270);
}

/** A DOOR OF THE TOWER: a pointed arch of dressed stone, a heavy door of grey oak strapped with long iron hinges, a ring to pull it; shut, or open on the dark. */
export function doorMake(open: boolean) {
  return (S: Scene, w: (a: number, b: number, z: number) => V3): void => {
    const HW = 14;
    const SP = 38;
    const HEAD = 58;
    const inArch = (a: number, z: number, m: number): boolean => Math.abs(a) < (HW + m) * (z < SP ? 1 : Math.pow(Math.max(0, 1 - (z - SP) / (HEAD + m * 1.3 - SP)), 0.62));
    // the surround: voussoirs and jambs, standing out a little
    S.quad([w(-HW - 6, 1.2, 0), w(HW + 6, 1.2, 0), w(HW + 6, 1.2, HEAD + 9), w(-HW - 6, 1.2, HEAD + 9)], (u, v) => {
      const a = (u - 0.5) * 2 * (HW + 6);
      const z = v * (HEAD + 9);
      if (!inArch(a, z, 6) || inArch(a, z, 0)) return null;
      const k = z < SP ? Math.floor(z / 9) : Math.floor(Math.atan2(z - SP, a) * 4);
      return fr(z < SP ? z / 9 : Math.atan2(z - SP, a) * 4) < 0.12 ? TSTONE[0] : a < 0 ? (k % 2 ? TSTONE[3] : TSTONE[4]) : k % 2 ? TSTONE[2] : TSTONE[3];
    }, 1);
    if (open) {
      S.quad([w(-HW, 0.6, 0), w(HW, 0.6, 0), w(HW, 0.6, HEAD), w(-HW, 0.6, HEAD)], (u, v) => (inArch((u - 0.5) * 2 * HW, v * HEAD, 0) ? HOLE : null), 2);
      // the leaf swung in, seen on its edge
      S.quad([w(-HW, 0.7, 0), w(-HW + 3, -11, 0), w(-HW + 3, -11, SP + 8), w(-HW, 0.7, SP + 8)], (u) => (u < 0.2 ? GREYOAK[1] : GREYOAK[2]), 3);
      return;
    }
    S.quad([w(-HW, 0.8, 0), w(HW, 0.8, 0), w(HW, 0.8, HEAD), w(-HW, 0.8, HEAD)], (u, v) => {
      const a = (u - 0.5) * 2 * HW;
      const z = v * HEAD;
      if (!inArch(a, z, 0)) return null;
      // the long strap hinges, the ring
      if ((Math.abs(z - 12) < 1.4 || Math.abs(z - 36) < 1.4) && a < 8 - (Math.abs(z - 12) < 1.4 ? 0 : 3)) return a > 5 ? IRON[2] : IRON[3];
      if (Math.abs(Math.hypot(a - 8, z - 26) - 2.4) < 0.8) return IRON[4];
      return fr((a + HW) / 5.6) < 0.1 ? GREYOAK[0] : GREYOAK[hash(Math.floor((a + HW) / 5.6), 1, 6381) > 0.5 ? 2 : 3];
    }, 3);
  };
}

/**
 * THE TRAPDOOR TO THE TOP: a heavy leaf of grey oak strapped with iron in a frame of stone in the floor, a ring to lift it;
 * shut, or thrown open, back against its stay, and the steps going down into the dark of the stair. 110 x 120 at (55, 70).
 */
export function trapdoorIn(S: Scene, open: boolean): void {
  for (const [x0, y0, x1, y1] of [[-24, -20, 24, -16], [-24, 16, 24, 20], [-24, -16, -20, 16], [20, -16, 24, 16]] as const) {
    S.box([(x0 + x1) / 2, (y0 + y1) / 2, 1.2], AX, [(x1 - x0) / 2, (y1 - y0) / 2, 1.2], (f, _u, v, n) => (f === 4 && v > 0.85 ? BONE[2] : toneAt(n, TSTONE, f === 4 ? 0.05 : 0)), 1);
  }
  const leafShade = (u: number, v: number, back: boolean): string => {
    if (Math.abs(u - 0.22) < 0.05 || Math.abs(u - 0.78) < 0.05) return back ? IRON[1] : v < 0.85 ? IRON[3] : IRON[2];
    if (!back && Math.abs(v - 0.88) < 0.06 && Math.abs(u - 0.5) < 0.12) return IRON[4];
    return fr(v * 5) < 0.07 ? GREYOAK[0] : GREYOAK[back ? 2 : 3];
  };
  if (!open) {
    S.quad([[-20, -16, 1.8], [20, -16, 1.8], [20, 16, 1.8], [-20, 16, 1.8]], (u, v) => leafShade(v, u, false), 2);
    return;
  }
  // the steps down into the dark, each fainter
  for (let k = 0; k < 6; k++) {
    const z = -k * 6;
    const y0 = -16 + k * 5.3;
    const dimk = 0.15 + k * 0.15;
    S.quad([[-19.5, y0, z + 1.5], [19.5, y0, z + 1.5], [19.5, y0 + 5.3, z + 1.5], [-19.5, y0 + 5.3, z + 1.5]], (_u, v) => mixHex(v < 0.2 ? BONE[2] : TSTONE[3], '#07080c', Math.min(0.95, dimk)), 3);
    S.quad([[-19.5, y0 + 5.3, z + 1.5], [19.5, y0 + 5.3, z + 1.5], [19.5, y0 + 5.3, z - 4.5], [-19.5, y0 + 5.3, z - 4.5]], () => mixHex(TSTONE[1], '#07080c', Math.min(0.95, dimk + 0.1)), 3);
  }
  S.quad([[-19.5, 16, 1.5], [19.5, 16, 1.5], [19.5, 16, -40], [-19.5, 16, -40]], () => '#07080c', 3);
  // the leaf, thrown back past upright against its iron stay
  const ang = 1.85;
  const d: V3 = [0, -Math.cos(Math.PI - ang), Math.sin(Math.PI - ang)];
  const hinge = -16;
  S.quad([[-20, hinge, 1.8], [20, hinge, 1.8], add([20, hinge, 1.8], mul(d, 32)), add([-20, hinge, 1.8], mul(d, 32))], (u, v) => leafShade(u, v, true), 4);
  S.rod([17, hinge - 1, 1.8], [17, hinge - 9, 14], 0.6, 0.6, IRON, 5);
}
function trapdoor(open: boolean): Sprite {
  const S = scene(110, 120, 55, 70);
  trapdoorIn(S, open);
  return done(S, 55, 70);
}

/**
 * GUTTERING CANDLES: an iron pricket stand on three feet, its dish brimming with old wax run down in long drips; three
 * candles burnt down to stubs, the tallest lit (an honest flame) and guttering, one lit low, one out. Two frames: the
 * flame up, the flame down. 70 x 110 at (35, 92).
 */
export function candlesIn(S: Scene, f: number): PieceLight[] {
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.5;
    S.rod([0, 0, 8], [Math.cos(a) * 9, Math.sin(a) * 9, 0], 0.9, 0.8, IRON, 1);
    S.rod([Math.cos(a) * 9, Math.sin(a) * 9, 0], [Math.cos(a) * 10.5, Math.sin(a) * 10.5, 0], 1.1, 1.1, IRON, 1);
  }
  S.rod([0, 0, 8], [0, 0, 40], 1.2, 1.0, IRON, 2);
  S.ball([0, 0, 22], 1.8, IRON, 2);
  // the dish, brimming with wax, a long drip run down over its rim
  cylinder(S, 0, 0, (z) => 6 + (z - 40) * 2.2, 40, 42, (n) => toneAt(n, IRON, 0.1), 3, (_a, rr) => (rr > 0.86 ? IRON[3] : rr > 0.7 ? WAX[2] : WAX[3]));
  for (const [x, y, n] of [[5.2, 3, 4], [-2, 6.5, 6], [6, -2.5, 3]] as const) drips(S, x, y, 41.4, n, 4);
  const lights: PieceLight[] = [];
  const t1 = candle(S, -1.5, -1, 42, 9, true, 5, 1.7, f);
  drips(S, -0.2, 0.4, 49, 4, 5);
  const t2 = candle(S, 2.6, 1.8, 42, 4.5, true, 6, 1.5, 1 - f);
  candle(S, -2.4, 2.8, 42, 2.2, false, 7, 1.4);
  lights.push({ at: t1, r: 30 + (f ? -3 : 3), color: CANDLE[3], a: 0.42 }, { at: t2, r: 14, color: CANDLE[3], a: 0.24 });
  return lights;
}
function candles(f: number): Sprite {
  const S = scene(70, 110, 35, 92);
  return done(S, 35, 92, candlesIn(S, f));
}

// =================================================================================================
// THE MOTH'S: its cocoon, a wing it shed, its silk, its dust; the hangings it has eaten

/** A COCOON ON THE WALL: the Moth's, long as a man, spun of grey silk in winding bands and stuck to the stone by threads; split open down its foot, the flaps curled back, empty. */
export function cocoonMake(S: Scene, w: (a: number, b: number, z: number) => V3): void {
  const Z0 = 26;
  const Z1 = 92;
  const R = 9.5;
  const C = w(0, R + 1.5, 0);
  const out = sub(w(0, 1, 0), w(0, 0, 0));
  const facingOut = Math.atan2(out[1], out[0]);
  // the spindle: narrow at its foot, fullest a third of the way up, drawn out to its point where it is stuck to the stone
  const rAt = (z: number): number => {
    const t = (z - Z0) / (Z1 - Z0);
    return Math.max(0.6, R * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.75));
  };
  cylinder(S, C[0], C[1], rAt, Z0, Z1, (n, a, z) => {
    const da = Math.atan2(Math.sin(a - facingOut), Math.cos(a - facingOut));
    // split open down its foot, toward the room: the dark of its empty inside, its edges ragged
    const split = z < Z0 + 30 && Math.abs(da) < 0.5 + (Z0 + 30 - z) * 0.03 + 0.12 * Math.sin(z * 1.3);
    if (split) return Math.abs(da) > 0.42 + (Z0 + 30 - z) * 0.03 ? SILK[0] : '#121116';
    // the silk wound round it every which way: strands crossing, matted, here and there a darker hollow
    const s1 = fr(z / 3.2 + a * 0.9 + 0.6 * Math.sin(z * 0.21));
    const s2 = fr(z / 4.1 - a * 0.7 + 0.5 * Math.sin(z * 0.17 + 1));
    const matted = hash(Math.floor(z / 3), Math.floor(a * 3), 6481) < 0.18;
    if (matted) return toneAt(n, SILK, -0.35);
    return toneAt(n, SILK, s1 < 0.12 || s2 < 0.12 ? 0.3 : -0.05);
  }, 1);
  // the flaps of the split, curled back
  for (const s of [-1, 1]) {
    const a = facingOut + s * 0.75;
    const r0 = rAt(Z0 + 14);
    const root: V3 = [C[0] + Math.cos(a) * r0, C[1] + Math.sin(a) * r0, Z0 + 14];
    S.egg(add(root, [Math.cos(a) * 2.4, Math.sin(a) * 2.4, -4]), [unit([Math.cos(a), Math.sin(a), 0]), unit([-Math.sin(a), Math.cos(a), 0]), [0, 0, 1]], [1.4, 4, 8], (n) => toneAt(n, SILK, -0.15), 2);
  }
  // the threads that hold it to the wall, and a few loose ones trailing
  // (fine threads fanning from its point up to the stone, and a few from its foot down to it)
  for (const [a0, z0, zr, r] of [[-7, Z1 + 12, Z1 - 3, 2], [4, Z1 + 15, Z1 - 2, 1.5], [10, Z1 + 6, Z1 - 6, 2.5], [-13, Z1 - 2, Z1 - 10, 3.5], [-5, Z0 - 10, Z0 + 4, 3], [8, Z0 - 6, Z0 + 6, 4]] as const) {
    S.rod(w(a0, 0.4, z0), w(a0 * 0.15, R + 1 - r * 0.3, zr), 0.3, 0.28, SILK, 3);
  }
  S.rod(w(0, 0.4, Z1 + 8), w(0, R + 1, Z1 - 1), 0.5, 0.4, SILK, 3);
}

/** A MOTH-EATEN TAPESTRY: a hanging on a pole, its weave faded to greys (a border, a tall tower under stars, a crescent), riddled with moth holes, its foot eaten to tatters. */
export function tapestryMake(S: Scene, w: (a: number, b: number, z: number) => V3): void {
  const TOPZ = 86;
  const FOOT = 30;
  const HW = 15;
  S.rod(w(-HW - 3, 2, TOPZ + 1), w(HW + 3, 2, TOPZ + 1), 0.9, 0.9, GREYOAK, 1);
  for (const a of [-HW - 3, HW + 3]) S.ball(w(a, 2, TOPZ + 1), 1.4, GREYOAK, 1);
  S.quad([w(-HW, 2.4, TOPZ), w(HW, 2.4, TOPZ), w(HW, 2.4, FOOT), w(-HW, 2.4, FOOT)], (u, v) => {
    const x = (u - 0.5) * 2 * HW;
    const z = (1 - v) * (TOPZ - FOOT);
    // its foot eaten to tatters
    const tat = 5 + 4 * Math.sin(x * 0.9) + 3 * Math.sin(x * 2.3 + 1);
    if (z < tat) return null;
    // moth holes: small round holes, the stone behind
    const hx = Math.floor((x + 40) / 5);
    const hz = Math.floor(z / 5);
    if (hash(hx, hz, 6391) < 0.14) {
      const cx = hx * 5 - 40 + 2.5;
      const cz = hz * 5 + 2.5;
      const r = 0.9 + hash(hx, hz, 6392) * 1.2;
      if (Math.hypot(x - cx, (z - cz) * 1.3) < r) return null;
    }
    const fold = Math.sin(u * 13);
    const sh = fold > 0.6 ? 0.25 : fold < -0.6 ? -0.35 : 0;
    const T = (r: Ramp): string => toneAt([0, 0.5 + sh, 0.6], r, 0);
    // the border; a tower tall in the middle under three stars; a crescent
    if (Math.abs(x) > HW - 3 || z > TOPZ - FOOT - 4 || z < 12) return fr((x + z) * 0.35) < 0.3 ? T(BONE) : T(GREYED);
    if (Math.abs(x) < 3.2 && z < 46 && z > 12) return Math.abs(x) < 1 && z > 30 && z < 34 ? T(GREYED) : T(TSTONE);
    if (Math.abs(x) < 4.5 && z >= 46 && z < 50 && fr(x * 0.6) < 0.5) return T(TSTONE);
    for (const [sx, sz] of [[-8, 44], [7, 48], [-6, 34]]) if (Math.abs(x - sx) + Math.abs(z - sz) < 1.6) return T(BONE);
    if (Math.hypot(x - 7, z - 36) < 3.2 && Math.hypot(x - 8.4, z - 37) > 2.6) return T(BONE);
    return T(fold > 0 ? WING : GREYED);
  }, 2);
}

/** THE SILENT ORDER'S BANNER, GONE GREY: its black faded to grey, moth holes all through it, its tails eaten ragged; the blank mask on it, no mouth. */
export function bannerMake(S: Scene, w: (a: number, b: number, z: number) => V3): void {
  const TOPZ = 92;
  S.rod(w(-14, 2, TOPZ), w(14, 2, TOPZ), 0.8, 0.8, IRON, 1);
  for (const a of [-14, 14]) S.ball(w(a, 2, TOPZ), 1.3, IRON, 1);
  S.quad([w(-12, 2.6, TOPZ - 1), w(12, 2.6, TOPZ - 1), w(12, 2.6, 26), w(-12, 2.6, 26)], (u, v) => {
    const x = (u - 0.5) * 2;
    const z = 1 - v;
    const tail = Math.abs(fr(u * 3) - 0.5) * 2;
    if (z < 0.12 * (1 - tail) + 0.04 * Math.sin(u * 40)) return null;
    // moth holes
    const hx = Math.floor(u * 9);
    const hz = Math.floor(z * 14);
    if (hash(hx, hz, 6401) < 0.12 && Math.hypot((u * 9 - hx - 0.5), (z * 14 - hz - 0.5) * 0.7) < 0.32) return null;
    const my = (z - 0.62) / 0.2;
    const mx = x / 0.5;
    if (mx * mx + my * my < 1) {
      const eye = Math.abs(Math.abs(mx) - 0.38) < 0.17 && Math.abs(my - 0.18) < 0.12;
      if (eye) return GREYED[0];
      return mx + my * 0.6 < -0.5 ? MASK[3] : mx > 0.5 ? MASK[1] : MASK[2];
    }
    const fold = Math.sin(u * 14);
    return GREYED[fold > 0.55 ? 4 : fold < -0.55 ? 1 : 2];
  }, 2);
}

/** A BROKEN WINDOW: a tall lancet in the wall, its leaded panes nearly all gone, a few grey panes left hanging in the lead, the fog's grey day outside; shards on its sill. */
export function windowMake(S: Scene, w: (a: number, b: number, z: number) => V3): void {
  const HW = 9;
  const SILL = 26;
  const SP = 62;
  const HEAD = 80;
  const inside = (a: number, z: number, m: number): boolean => z >= SILL - m && Math.abs(a) < (HW + m) * (z < SP ? 1 : Math.pow(Math.max(0, 1 - (z - SP) / (HEAD + m * 1.3 - SP)), 0.62));
  // its surround, standing out of the wall; its sill
  S.quad([w(-HW - 4, 1.0, SILL - 4), w(HW + 4, 1.0, SILL - 4), w(HW + 4, 1.0, HEAD + 6), w(-HW - 4, 1.0, HEAD + 6)], (u, v) => {
    const a = (u - 0.5) * 2 * (HW + 4);
    const z = SILL - 4 + v * (HEAD + 10 - SILL);
    if (!inside(a, z, 4) || inside(a, z, 0)) return null;
    if (z < SILL) return z > SILL - 1.5 ? BONE[3] : TSTONE[1];
    return a < 0 ? TSTONE[3] : TSTONE[1];
  }, 1);
  S.quad([w(-HW, 0.6, SILL), w(HW, 0.6, SILL), w(HW, 0.6, HEAD), w(-HW, 0.6, HEAD)], (u, v) => {
    const a = (u - 0.5) * 2 * HW;
    const z = SILL + v * (HEAD - SILL);
    if (!inside(a, z, 0)) return null;
    // the lead cames: a lattice of diamonds; a few panes left, grey, cracked
    const d1 = fr((a + z) / 6);
    const d2 = fr((a - z) / 6);
    const left = hash(Math.floor((a + z) / 6), Math.floor((a - z) / 6), 6411) < 0.18 || z > HEAD - 6;
    if ((d1 < 0.12 || d2 < 0.12) && (left || hash(Math.floor((a + z) / 6), Math.floor((a - z) / 6), 6412) < 0.5 || z > SP)) return IRON[1];
    if (left) return d1 < 0.5 ? '#5d6066' : '#4b4e55';
    // the day outside: the fog's grey, paler up toward the head
    const f = hash(Math.floor(a), Math.floor(z / 3), 6413);
    return z > SP ? (f < 0.2 ? '#a1a3a7' : '#b4b5b7') : f < 0.25 ? '#83878d' : '#979a9f';
  }, 2);
  // shards on the sill
  for (let k = 0; k < 4; k++) S.quad([w(-6 + k * 4, 2, SILL + 0.2), w(-4 + k * 4, 3, SILL + 0.2), w(-5 + k * 4, 4, SILL + 1.5), w(-6 + k * 4, 3, SILL + 0.2)], () => '#5d6066', 3);
}

/**
 * A SHED WING (on the floor): a forewing the Moth has shed, longer than a man, lying flat: its leading edge dark and
 * straight, its tip rounded, its outer edge scalloped and torn back to the root; grey scales banded paler toward its
 * edge, its veins running out from the root; on it the great eye, shut, ringed in bone white. Grey scales dusted round
 * it. 220 x 100 at (110, 50).
 */
function shedWing(): Sprite {
  const S = scene(230, 130, 110, 76);
  wingIn(S);
  return done(S, 110, 76);
}
/**
 * THE SHED WING in depth: laid along the picture, its root on the floor and the rest of it curling up off the floor
 * toward its tip as a dry leaf curls, so that its face is seen; painted as `shedWingAt` paints it.
 */
export function wingIn(S: Scene): void {
  // (its frame: `s` from the root, near, up the picture to the tip; `t` across it to the right; turned a little)
  const a = WING_TURN;
  const world = (s: number, t: number): V3 => {
    const Xp = t - 0.55;
    const Yp = -(s - 1.2);
    const X = Xp * Math.cos(a) - Yp * Math.sin(a);
    const Y = Xp * Math.sin(a) + Yp * Math.cos(a);
    const u = (X + Y) * 0.7071;
    const v = (Y - X) * 0.7071;
    return [u, v, 0.6 + Math.max(0, s - 1.3) ** 2 * 11 + Math.max(0, 0.25 - t) * 4 * Math.max(0, s - 0.8)];
  };
  const NS = 30;
  const NT = 12;
  for (let i = 0; i < NS; i++) {
    for (let j = 0; j < NT; j++) {
      const s0 = (i / NS) * 2.5;
      const s1 = ((i + 1) / NS) * 2.5;
      const t0 = -0.08 + (j / NT) * 1.25;
      const t1 = -0.08 + ((j + 1) / NT) * 1.25;
      const P = (ss: number, tt: number): V3 => {
        const w = world(ss, tt);
        return [w[0] * 40, w[1] * 40, w[2]];
      };
      S.quad([P(s0, t0), P(s1, t0), P(s1, t1), P(s0, t1)], (uu, vv) => {
        const w = world(s0 + (s1 - s0) * uu, t0 + (t1 - t0) * vv);
        const c = shedWingAt(w[0], w[1], Math.floor((s0 + (s1 - s0) * uu) * 40), Math.floor((t0 + (t1 - t0) * vv) * 40));
        return c && c !== DUST[3] ? c : null;
      }, 1);
    }
  }
}
const WING_TURN = 0.25;
/** The shed wing at the floor's (u, v), tiles from its anchor (`px`, `py` a picture pixel, for its grain); null off it. */
export function shedWingAt(u: number, v: number, px: number, py: number): string | null {
  // (laid with its root near and its tip far, up the picture: `s` from the root up it, `t` across it to the right, both
  // in tiles of the floor; turned a little)
  const a = WING_TURN;
  const X = (u - v) * 0.7071;
  const Y = (u + v) * 0.7071;
  const s = -(Y * Math.cos(a) - X * Math.sin(a)) + 1.2;
  const t = X * Math.cos(a) + Y * Math.sin(a) + 0.55;
  const L = 2.4;
  if (s < 0 || s > L + 0.05) return scales(px, py, s, t, L);
  // its outline: the leading edge straight; the outer edge from the rounded tip sweeping back, scalloped, to the inner corner; the inner edge back to the root
  const lead = -0.02 * s;
  const tip = 0.6 * L;
  let trail: number;
  if (s < tip) trail = 0.15 + (s / tip) * 0.95;
  else {
    const q = (s - tip) / (L - tip);
    trail = lead + (1.1 - lead) * Math.sqrt(Math.max(0, 1 - q * q));
  }
  const scallop = s > tip * 0.7 ? 0.05 * Math.abs(Math.sin(s * 12)) : 0;
  const torn = hash(Math.floor(s * 6), 1, 6421) < 0.22 && s > 0.8 ? 0.12 : 0;
  if (t < lead || t > trail - scallop - torn) return scales(px, py, s, t, L);
  const edge = trail - scallop - torn - t;
  // the leading edge, dark; the fringe along the outer edge, checkered; a pale band inside it
  if (t < lead + 0.05) return WING[0];
  if (edge < 0.05) return (Math.floor(px / 2) + Math.floor(py / 2)) % 2 ? WING[1] : WING[3];
  if (edge < 0.15) return BONE[1];
  // the eye: rings round a lid shut (its line, the lid over it a step paler)
  const ex = s - 0.52 * L;
  const ey = t - 0.5;
  const er = Math.hypot(ex / 1.2, ey);
  if (er < 0.34) {
    if (er > 0.3) return WING[0];
    if (er > 0.24) return BONE[3];
    if (er > 0.21) return WING[1];
    const lid = ey - 0.06 * Math.cos(ex * 6) + 0.02;
    if (Math.abs(lid) < 0.025) return '#121116';
    if (lid < 0 && Math.abs(lid) < 0.06 && Math.abs(fr(ex * 14) - 0.5) < 0.18) return '#121116';
    return lid < 0 ? WING[4] : WING[3];
  }
  // its markings: two wavering cross-lines, the band between them a step darker; its veins out from the root
  const line1 = s - 0.3 * L - 0.04 * Math.sin(t * 26);
  const line2 = s - 0.78 * L + 0.18 * t - 0.05 * Math.sin(t * 30);
  if (Math.abs(line1) < 0.035 || Math.abs(line2) < 0.035) return WING[0];
  const ang = Math.atan2(t - 0.1, s + 0.2);
  if (Math.abs(fr(ang * 6) - 0.5) < 0.035 && s > 0.2) return WING[1];
  if (line1 > 0 && line2 < 0) return hash(px >> 1, py, 6422) < 0.1 ? WING[1] : WING[2];
  if (s < 0.25) return hash(px >> 1, py, 6425) < 0.4 ? WING[4] : WING[3];
  return hash(px >> 1, py, 6422) < 0.08 ? WING[2] : WING[3];
}
/** Grey scales dusted on the floor round a shed wing, near it; null elsewhere. */
function scales(px: number, py: number, s: number, t: number, L: number): string | null {
  const d = Math.max(Math.abs(t - 0.55) - 0.65, -s, s - L, 0);
  if (d > 0.4) return null;
  return hash(px >> 1, py >> 1, 6423) < 0.1 * (1 - d / 0.4) ? DUST[3] : null;
}

/**
 * MOTH SILK, STRUNG FROM A FALLEN BEAM: a roof beam fallen and leaning on the floor, the Moth's grey silk strung from it to
 * the boards in sheets and threads, a lump of it wrapping something; or torn through, tatters hanging. 120 x 140 at (60, 110).
 */
export function silkIn(S: Scene, torn: boolean): void {
  const a: V3 = [-26, -6, 0];
  const b: V3 = [22, 4, 84];
  beam(S, a, b, 3.4, BELLOAK, 1, 0, 2.8);
  // a splintered end at its top
  S.rod(b, add(b, [3, 2, 6]), 1.6, 0.4, BELLOAK, 1);
  const at = (t: number): V3 => add(a, mul(sub(b, a), t));
  // the sheets: from the beam down to the floor, each a ragged, see-through veil
  const keep = (w: V3): boolean => checker(S, w) || hash(Math.floor(w[0] / 3), Math.floor(w[2] / 3), 6431) < 0.35;
  for (let k = 0; k < 4; k++) {
    const t0 = 0.25 + k * 0.17;
    const t1 = t0 + 0.13;
    const p0 = at(t0);
    const p1 = at(t1);
    const f0: V3 = [p0[0] + 6, p0[1] + 12, 0];
    const f1: V3 = [p1[0] + 4, p1[1] + 12, 0];
    if (torn && k % 2 === 0) {
      // torn through: only rags hanging from the beam
      S.quad([p0, p1, mul(add(p1, f1), 0.5), mul(add(p0, add(f0, [0, 0, 20])), 0.5)], (u, v) => (v > 0.6 + 0.3 * Math.sin(u * 9) ? null : toneAt([0, 0.6, 0.5], SILK, fr(u * 5) < 0.2 ? -0.3 : 0)), SOFT_ID + 10 + k);
      continue;
    }
    S.quad([p0, p1, f1, f0], (u, v) => {
      const w = add(add(p0, mul(sub(p1, p0), u)), mul(sub(add(f0, mul(sub(f1, f0), u)), add(p0, mul(sub(p1, p0), u))), v));
      if (!keep(w)) return null;
      return toneAt([0, 0.6, 0.5], SILK, fr(u * 4 + v) < 0.15 ? 0.3 : 0);
    }, SOFT_ID + 10 + k);
  }
  // threads, drawn taut
  for (let k = 0; k < 7; k++) {
    const p = at(0.18 + k * 0.11);
    S.rod(p, [p[0] + (hash(k, 1, 6432) - 0.5) * 16, p[1] + 10 + hash(k, 2, 6432) * 6, 0], 0.3, 0.3, SILK, 20);
  }
  // a lump of silk wrapping something, hung from it
  if (!torn) S.egg(add(at(0.62), [2, 6, -14]), AX, [4.5, 4, 8], (n, w) => toneAt(n, SILK, fr(w[2] / 3 + w[0] * 0.2) < 0.25 ? -0.4 : 0), 21);
}
function silk(torn: boolean): Sprite {
  const S = scene(130, 140, 64, 112);
  silkIn(S, torn);
  return done(S, 64, 112);
}

/** GREY DUST, DRIFTED (on the floor): a long drift of the Hush's grey dust heaped against nothing, rippled, pale grains on it. 100 x 50 at (50, 30). */
export function dustIn(S: Scene): void {
  // (heaps along a curve, the biggest first, smaller as it tails off; rippled across; pale grains)
  const heaps: [number, number, number, number, number][] = [[-14, -4, 13, 9, 5.5], [-2, -1, 11, 8, 4.6], [9, 3, 9, 6.5, 3.6], [18, 8, 7, 5, 2.6], [24, 13, 5, 3.5, 1.6], [-22, -8, 6, 5, 2.4]];
  heaps.forEach(([x, y, a, b, h], k) => S.egg([x, y, 0], [[0.92, 0.38, 0], [-0.38, 0.92, 0], [0, 0, 1]], [a, b, h], (n, w) => {
    const rip = fr((w[0] * 0.92 + w[1] * 0.38) / 4 + Math.sin(w[1] * 0.45) * 0.4);
    if (hash(Math.floor(w[0] * 2), Math.floor(w[1] * 2), 6441) < 0.05) return DUST[4];
    return toneAt(n, DUST, rip < 0.25 ? -0.3 : 0.05);
  }, 1 + (k % 2)));
}
function dustDrift(): Sprite {
  const S = scene(100, 56, 50, 32);
  dustIn(S);
  return done(S, 50, 32);
}

/**
 * THE HUSH'S DUST (a trap): a patch of the Moth's finest dust lying on the floor, darker than the drifts. Frames: lying;
 * the warning (it stirs, motes lifting off it); sprung (it rises in a grey cloud to a man's waist, where words go dark
 * and sound dies). 120 x 110 at (60, 80).
 */
export function hushDustIn(S: Scene, f: number): void {
  S.egg([0, 0, 0.2], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [26, 17, 0.6], (n, w) => {
    const d = Math.hypot(w[0] / 26, w[1] / 17);
    // (its edge ragged, fingers of it out across the floor)
    const ang = Math.atan2(w[1], w[0]);
    if (d > 0.72 + 0.16 * Math.sin(ang * 5 + 1) + 0.1 * Math.sin(ang * 11)) return null;
    if (d > 0.84 && hash(Math.floor(w[0]), Math.floor(w[1]), 6451) < 0.5) return DUST[2];
    if (f >= 1 && Math.abs(fr(d * 3 - f * 0.4) - 0.5) < 0.05) return DUST[3];
    return hash(Math.floor(w[0] * 1.5), Math.floor(w[1] * 1.5), 6452) < 0.06 ? DUST[2] : DUST[0];
  }, 1);
  // motes lifting off it
  const motes = f === 0 ? 0 : f === 1 ? 10 : 26;
  for (let k = 0; k < motes; k++) {
    const x = (hash(k, 1, 6453) - 0.5) * 40;
    const y = (hash(k, 2, 6453) - 0.5) * 26;
    const z = 2 + hash(k, 3, 6453) * (f === 1 ? 10 : 46);
    S.ball([x, y, z], 0.9, DUST, 2 + k);
  }
  if (f === 2) {
    // the cloud: billows of dust, each a lumpy body, the light on their upper left
    const B: [number, number, number, number][] = [[0, 0, 14, 13], [-12, 4, 10, 10], [11, -4, 11, 10], [-4, -8, 22, 9], [6, 8, 24, 8], [-10, -4, 30, 7], [2, 2, 34, 8]];
    B.forEach(([x, y, z, r], i) => S.egg([x, y, z], AX, [r * 1.1, r, r * 0.9], (n, w) => {
      const g = hash(Math.floor(w[0] / 2), Math.floor(w[2] / 2), 6454 + i);
      return toneAt(n, DUST, g < 0.2 ? -0.3 : 0.1);
    }, SOFT_ID + 30 + i, (w) => checker(S, w) || hash(Math.floor(w[0] / 2), Math.floor(w[2] / 2), 6455 + i) < 0.82));
  }
}
function hushDust(f: number): Sprite {
  const S = scene(120, 110, 60, 80);
  hushDustIn(S, f);
  return done(S, 60, 80);
}

/** A FALLEN MASK OF THE ORDER (on the floor): the Silent Order's blank white mask, no mouth, lying face up and tilted, cracked across, its black ribbon frayed. 60 x 40 at (30, 24). */
export function maskIn(S: Scene): void {
  const A: [V3, V3, V3] = [unit([0.85, -0.3, 0.2]), unit([0.32, 0.92, 0.18]), [0, 0, 1]];
  A[2] = unit(cross(A[0], A[1]));
  const C: V3 = [0, 0, 1.6];
  S.egg(C, A, [7, 9.5, 3.4], (n, w) => {
    const q = sub(local(S, w), C);
    const x = dot(q, A[0]) / 7;
    const y = dot(q, A[1]) / 9.5;
    const h = dot(q, A[2]);
    if (h < 0) return null;
    // the eyes: two dark slits, the brow over them; no mouth; a crack across from the brow to the chin
    if (Math.abs(Math.abs(x) - 0.38) < 0.17 && Math.abs(y + 0.15) < 0.09) return '#121116';
    if (Math.abs(x - 0.1 - y * 0.35 + Math.sin(y * 9) * 0.04) < 0.035 && y > -0.05) return MASK[0];
    return toneAt(n, MASK, Math.abs(x) < 0.08 && y < 0.1 ? 0.15 : 0);
  }, 1);
  // its ribbon, black gone grey, frayed
  const r0 = add(C, mul(A[0], 7));
  S.rod(r0, add(r0, [5, 4, -1.4]), 0.6, 0.5, GREYED, 2);
  S.rod(add(r0, [5, 4, -1.4]), add(r0, [9, 2, -1.4]), 0.5, 0.3, GREYED, 2);
  const r1 = add(C, mul(A[0], -7));
  S.rod(r1, add(r1, [-4, 5, -1.4]), 0.6, 0.4, GREYED, 2);
}
function fallenMask(): Sprite {
  const S = scene(60, 40, 30, 24);
  maskIn(S);
  return done(S, 30, 24);
}

// =================================================================================================
// THE TOWER TOP: a fallen merlon, the cold beacon

/** A FALLEN MERLON: a block of the parapet broken off and fallen inward, lying on its side, its coping cap still on it, cracked in two; chips round it. 100 x 70 at (50, 46). */
export function merlonIn(S: Scene): void {
  const ang = 0.35;
  const A: [V3, V3, V3] = [[Math.cos(ang), Math.sin(ang), 0], [0, 0, 1], [Math.sin(ang), -Math.cos(ang), 0]];
  const course = (f: number, u: number, v: number, n: V3): string => {
    // its courses (now lying along its length), a lit arris; the broken face rough
    if (f === 1) return hash(Math.floor(u * 6), Math.floor(v * 6), 6461) < 0.3 ? TSTONE[1] : toneAt(n, TSTONE, -0.15);
    const k = f === 2 || f === 3 ? u : v;
    if (fr(k * 3) < 0.06) return TSTONE[0];
    return toneAt(n, TSTONE, 0.05);
  };
  S.box([-4, 0, 9], A, [12, 9, 8], course, 1);
  // its cap, the coping, a lip lit bone
  S.box(add([-4, 0, 9], mul(A[0], -13.5)), A, [1.8, 10.5, 9.5], (f, _u, _v, n) => (f === 4 || f === 0 ? BONE[2] : toneAt(n, TSTONE, 0.1)), 2);
  // the piece broken off it
  const B: [V3, V3, V3] = [[Math.cos(-0.5), Math.sin(-0.5), 0], [-Math.sin(-0.5), Math.cos(-0.5), 0], [0, 0, 1]];
  S.box([18, 6, 5], B, [6, 5, 5], course, 3);
  for (let k = 0; k < 6; k++) S.box([10 + hash(k, 1, 6462) * 20, 14 + hash(k, 2, 6462) * 8, 1], AX, [1.4, 1.2, 1], (_f, _u, _v, n) => toneAt(n, TSTONE, 0), 4 + k);
}
function merlon(): Sprite {
  const S = scene(100, 70, 50, 46);
  merlonIn(S);
  return done(S, 50, 46);
}

/** THE COLD BEACON: the tower's iron fire-basket on a tall post and three feet, the beacon that should have warned the city, never lit; full of grey ash and charred ends, cold. 80 x 130 at (40, 112). */
export function beaconIn(S: Scene): void {
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.3;
    S.rod([0, 0, 22], [Math.cos(a) * 14, Math.sin(a) * 14, 0], 1.4, 1.2, IRON, 1);
    S.rod([Math.cos(a) * 14, Math.sin(a) * 14, 0], [Math.cos(a) * 16, Math.sin(a) * 16, 0], 1.6, 1.6, IRON, 1);
  }
  S.rod([0, 0, 0], [0, 0, 66], 1.8, 1.6, IRON, 2);
  S.ball([0, 0, 22], 2.6, IRON, 2);
  // the basket: bars flaring up from a ring, a ring at its lip, curled finials
  const R0 = 6;
  const R1 = 13;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    S.rod([Math.cos(a) * R0, Math.sin(a) * R0, 66], [Math.cos(a) * R1, Math.sin(a) * R1, 84], 0.8, 0.8, IRON, 3);
    S.rod([Math.cos(a) * R1, Math.sin(a) * R1, 84], [Math.cos(a) * (R1 + 2.4), Math.sin(a) * (R1 + 2.4), 87], 0.7, 0.4, IRON, 3);
  }
  for (const [r, z] of [[R0, 66], [R1, 84], [(R0 + R1) / 2, 75]] as const) {
    for (let k = 0; k < 20; k++) {
      const a0 = (k / 20) * Math.PI * 2;
      const a1 = ((k + 1) / 20) * Math.PI * 2;
      S.rod([Math.cos(a0) * r, Math.sin(a0) * r, z], [Math.cos(a1) * r, Math.sin(a1) * r, z], 0.7, 0.7, IRON, 4);
    }
  }
  // the grey ash heaped in it, charred ends sticking out
  S.egg([0, 0, 79], AX, [11, 11, 5], (n, w) => (hash(Math.floor(w[0] * 1.5), Math.floor(w[1] * 1.5), 6471) < 0.12 ? ASH[0] : toneAt(n, ASH, 0.1)), 5, (w) => w[2] > 76);
  for (const [x, y, dx, dy, dz] of [[-3, 1, -5, 2, 6], [2, -2, 6, -1, 5], [0, 3, 1, 6, 4]] as const) S.rod([x, y, 80], [x + dx, y + dy, 80 + dz], 1.2, 0.8, ['#0e0d10', '#17151a', '#221f24', '#2e2a2e', '#3a3538'], 6);
}
function beacon(): Sprite {
  const S = scene(80, 130, 40, 112);
  beaconIn(S);
  return done(S, 40, 112);
}

// =================================================================================================
// THE SET

function wallOf(make: (S: Scene, w: (a: number, b: number, z: number) => V3, alongX: boolean) => void): { left: Sprite[]; right: Sprite[] } {
  const s = frontPiece(make, 80, 130, undefined, 30);
  return { left: [s.left], right: [s.right] };
}
function wallFrames(makes: ((S: Scene, w: (a: number, b: number, z: number) => V3, alongX: boolean) => void)[]): { left: Sprite[]; right: Sprite[] } {
  const ss = makes.map((m) => frontPiece(m, 80, 130, undefined, 30));
  return { left: ss.map((s) => s.left), right: ss.map((s) => s.right) };
}

let made: Piece[] | null = null;
/** THE QUIET TOWER'S OWN PIECES, the Moth's twenty-five, made the first time they are asked for and kept. */
export function quietTowerPieces(): Piece[] {
  if (made) return made;
  made = [
    { name: 'the last chapter on its lectern', kind: 'quest', frames: [lectern()], shadow: 0.5 },
    // (frames: along x, along y)
    { name: "a copyist's desk", kind: 'obstacle', frames: [desk(0), desk(1)], shadow: 0.7 },
    { name: "a copyist's stool", kind: 'breakable', frames: [stool(false), stool(true)], shadow: 0.25 },
    { name: 'a press of blank books', kind: 'obstacle', frames: [press(0), press(1)], shadow: 0.7 },
    { name: 'a chest of blank quires', kind: 'breakable', frames: [chest(false), chest(true)], shadow: 0.4 },
    { name: 'a heap of torn pages', kind: 'breakable', frames: [pages(false), pages(true)], shadow: 0.3 },
    { name: 'the empty bell frame', kind: 'obstacle', frames: [bellFrame()], shadow: 1.3 },
    { name: 'a bell rope, hanging', kind: 'obstacle', frames: [bellRope()], shadow: 0.2 },
    { name: "the bell's clapper, fallen", kind: 'on the floor', frames: [clapper()] },
    { name: 'the boards broken through', kind: 'floor tile', frames: [brokenBoards()] },
    { name: "the tower's stair", kind: 'obstacle', frames: [stair()], shadow: 0.8 },
    // (frames: shut, open)
    { name: 'a door of the tower', kind: 'door', ...wallFrames([doorMake(false), doorMake(true)]) },
    { name: 'the trapdoor to the top', kind: 'gate', frames: [trapdoor(false), trapdoor(true)] },
    // (frames: the flame up, the flame down)
    { name: 'guttering candles', kind: 'obstacle', frames: [candles(0), candles(1)], shadow: 0.3 },
    { name: 'a cocoon on the wall', kind: 'on the wall', ...wallOf(cocoonMake) },
    { name: 'a moth-eaten tapestry', kind: 'on the wall', ...wallOf(tapestryMake) },
    { name: "the Order's banner, gone grey", kind: 'on the wall', ...wallOf(bannerMake) },
    { name: 'a broken window', kind: 'on the wall', ...wallOf(windowMake) },
    { name: 'a shed wing', kind: 'on the floor', frames: [shedWing()] },
    // (frames: whole, torn through)
    { name: 'moth silk, strung from a fallen beam', kind: 'breakable', frames: [silk(false), silk(true)], shadow: 0.6 },
    { name: 'grey dust, drifted', kind: 'on the floor', frames: [dustDrift()] },
    // (frames: lying, the warning, sprung)
    { name: "the Hush's dust", kind: 'trap', frames: [0, 1, 2].map(hushDust) },
    { name: 'a fallen mask of the Order', kind: 'on the floor', frames: [fallenMask()] },
    { name: 'a fallen merlon', kind: 'obstacle', frames: [merlon()], shadow: 0.6 },
    { name: 'the cold beacon', kind: 'obstacle', frames: [beacon()], shadow: 0.5 },
  ];
  return made;
}
