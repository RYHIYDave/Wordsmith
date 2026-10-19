// FLOOR 15, THE GREAT LIBRARY (THE READING ROOM): ITS OWN PIECES, themed after its boss (a mock-up; nothing of the
// game imports it).
//
// His rule for a set of floors from the second on (10 Oct, 14:54): “Going forward, let’s do 25 that are the theme of
// the 5 levels, then 25 for each boss.” This floor's boss is the Censor (his doc "Wordsmith Act 2: The Hush", the
// planning chat's, with his yes as ideas): "The leader of the Silent Order, robed in black, with a great ink brush.
// Whatever he strikes through is gone.", in the Reading Room. The floor: "The lair floor that ends the first half: the
// stolen words are being bound into one book here."; "tall halls of shelves, galleries, rolling ladders, chained books
// and candle chandeliers."; "the Silent Order in force, and creatures of spilled ink."; "the dream's version of the
// library they fell asleep in."; "on the lectern at the heart of the library lies the book of stolen words, nearly
// full."; its palette "Dark wood, candle gold, black ink"; its Muffled Bell "The library's closing bell", its Bells
// "Hand bells on the reading desks and in the galleries"; at half his life the Censor "blacks out parts of the floor
// for good, so the room shrinks". Its ground: art/library.ts. Made on his word to this chat, 18 Oct, 21:24 Pacific:
// “Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for
// 11-15”.
//
// THE RULES THEY KEEP: as art/act2_kit.ts says. Pink burning to gold only on what is the enemy's (the stolen words in
// their book); the candles of the chandeliers, the candelabra and the sconces an honest orange (his doc's "candle
// gold" is their light, and the gilt and brass about the library, dull); the Bells awake or rung the hero's cyan (his
// to ring); the book of stolen words, the quest, its own pale light as well as the stolen words' pink; nothing else
// gives light. The Order's ink is black, its sheen a cold grey.

import type { Sprite } from '../engine/px';
import { toneAt } from './floor4';
import type { Scene, V3 } from './floor4';
import { CANDLE, SWING, bell, bellGlow, metalOf } from './floor11';
import { rope, timber } from './floor6';
import type { Piece } from './floorkit';
import { hash } from './kit';
import type { Ramp } from './kit';
import { FLAME } from './mkit';
import { bright } from './act2_quiet';
import { BLACK, BOTTLE, BRASS, IRON, MASK, OXBLOOD, SLATEBLUE, SOFT_ID, cylinder, done, frontPiece, lying, scene, slab, turned } from './act2_kit';

const fr = (t: number): number => t - Math.floor(t);

// =================================================================================================
// THE GREAT LIBRARY'S MATERIALS (each from its deep shade to its lit top)

/** The library's dark wood: walnut, old and polished. */
export const WALNUT: Ramp = ['#1c1310', '#2f2018', '#442e21', '#5b3f2d', '#74533b'];
/** The green leather of the reading desks' tops. */
export const DESKLEATHER: Ramp = ['#141c17', '#1f2b22', '#2c3d30', '#3c513f', '#4e6650'];
/** The books' bindings: tan calf, black, vellum. */
export const CALF: Ramp = ['#3a2a1c', '#5a442e', '#7c6040', '#9c7c54', '#b8986a'];
export const BINDING: Ramp = ['#121014', '#1e1a1e', '#2c2729', '#3e383a', '#524a4c'];
export const VELLUM: Ramp = ['#5e5644', '#887b5c', '#aa9c78', '#c4b690', '#d8cca8'];
/** The books, by their leathers. */
const BOOKS: Ramp[] = [OXBLOOD, BOTTLE, SLATEBLUE, CALF, BINDING, VELLUM];
/** Pages, the paper of the library. */
export const PAGES: Ramp = ['#6a6250', '#938a74', '#b4aa92', '#cec4aa', '#e2d8c0'];
/** Wax, the candles'. */
export const WAX: Ramp = ['#6e6754', '#928a72', '#b2a98e', '#ccc3a6', '#e0d8bc'];
/** Wicker (the baskets of pages). */
export const WICKER: Ramp = ['#2a2016', '#40311f', '#5a462c', '#76603c', '#927a4e'];
/** THE ORDER'S INK, black, its sheen a cold grey. */
export const INK: Ramp = ['#060509', '#0d0b12', '#16131c', '#241f2c', '#4a4654'];
/** The globe's old sea and its lands. */
const SEA: Ramp = ['#1e2630', '#2c3644', '#3e4a5a', '#52606e', '#687684'];
const LAND: Ramp = ['#3a321e', '#58492a', '#7a6838', '#968248', '#b09a5a'];
/** THE STOLEN WORDS: the enemy's pink burning to gold (his rulebook, Colour 3). */
const WORDS = FLAME;
/** The quest's own pale light. */
const PALE: Ramp = ['#6e6858', '#9a927e', '#c4bca4', '#e2dac2', '#f4eedc'];
bright(PALE);

// =================================================================================================
// HELPERS

/** A BOOK standing or lying, its middle at `c`, turned `ang` about the upright: `L` long (its height when standing), `T` thick, `W` deep (the pages' width); `up` stood on its foot; its leather `r`. */
function book(S: Scene, c: V3, ang: number, L: number, T: number, W: number, up: boolean, r: Ramp, id: number): void {
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  // (standing: its spine along z, its thickness along `ang`; lying: its spine along `ang`, its thickness up)
  const A: [V3, V3, V3] = up ? [[-sa, ca, 0], [ca, sa, 0], [0, 0, 1]] : [[ca, sa, 0], [0, 0, 1], [-sa, ca, 0]];
  const R: V3 = up ? [W / 2, T / 2, L / 2] : [L / 2, T / 2, W / 2];
  S.box(c, A, R, (f, u, v, n) => {
    // the pages' edges (the faces away from the spine): pale, lined; standing, its head shows them too
    const pages = up ? f === 1 || f === 4 : f === 0 || f === 1 || f === 4;
    if (pages) return toneAt(n, PAGES, fr((up ? u : v) * 9) < 0.2 ? -0.5 : f === 4 && up ? -0.2 : 0.1);
    // gilt bands across the spine
    const spine = up ? f === 0 : f === 5;
    if (spine && Math.abs(fr((up ? v : u) * 4) - 0.5) < 0.05) return toneAt(n, BRASS, 0);
    return toneAt(n, r, spine ? -0.1 : 0);
  }, id);
}

/** A ROW OF BOOKS standing on a shelf from x0 to x1 at depth y, foot at z, their spines toward +y; some leaning, one gap. */
function bookRow(S: Scene, x0: number, x1: number, y: number, z: number, seed: number, id: number, H = 9): number {
  let x = x0;
  let n = 0;
  while (x < x1 - 1.2) {
    const t = 1 + 1.4 * hash(n, seed, 8101);
    const h = H * (0.75 + 0.35 * hash(n, seed + 1, 8101));
    if (hash(n, seed + 2, 8101) < 0.08) {
      x += 2.4;
      n++;
      continue;
    }
    const r = BOOKS[Math.floor(hash(n, seed + 3, 8101) * BOOKS.length)];
    S.box([x + t / 2, y, z + h / 2], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [t / 2, 3, h / 2], (f, u, v, nn) => {
      if (f === 4) return toneAt(nn, PAGES, -0.1);
      if (Math.abs(v - 0.82) < 0.05 || Math.abs(v - 0.18) < 0.05) return toneAt(nn, BRASS, -0.1);
      return toneAt(nn, r, 0);
    }, id + n);
    x += t + 0.2;
    n++;
  }
  return id + n;
}

/** A CANDLE at (x, y) standing on `z`: `h` tall, wax run down it; lit (an honest flame) or out (its wick black). */
function candle(S: Scene, x: number, y: number, z: number, h: number, lit: boolean, id: number, r = 0.8): V3 {
  cylinder(S, x, y, r, z, z + h, (n, a, zz) => toneAt(n, WAX, Math.cos(a * 3 + id) > 0.65 && zz < z + h - 0.8 ? 0.5 : 0), id, () => WAX[4]);
  const tip: V3 = [x, y, z + h + 1.4];
  if (lit) {
    S.ball([x, y, z + h + 1.3], 1.1, CANDLE, 1000 + id, undefined, 0.6);
    S.ball([x, y, z + h + 2.7], 0.7, CANDLE, 1500 + id, undefined, 0.95);
  } else {
    S.rod([x, y, z + h], [x, y, z + h + 0.9], 0.2, 0.2, BLACK, id);
  }
  return tip;
}

/** An open page of writing at the quad `q`: lines of a hand, some struck out with a bar of the Order's ink. */
function writtenPage(S: Scene, q: [V3, V3, V3, V3], id: number, seed: number, struck = 0, ramp: Ramp = PAGES): void {
  S.quad(q, (u, v) => {
    const line = Math.floor(v * 10);
    const lv = fr(v * 10);
    if (u < 0.06 || u > 0.94 || v < 0.05 || v > 0.95) return ramp[3];
    if (lv > 0.3 && lv < 0.7) {
      const end = 0.94 - 0.25 * hash(line, seed, 8111);
      if (hash(line, seed + 1, 8112) < struck && u > 0.08 && u < end) return INK[1];
      if (u > 0.1 && u < end && hash(Math.floor(u * 22), line + seed * 13, 8113) < 0.7) return '#3a3428';
    }
    return ramp[4];
  }, id);
}

// =================================================================================================
// THE READING ROOM

/**
 * A READING DESK: a long desk of walnut on turned legs, its top inlaid with green leather and a tooled border of dull
 * gilt; a great book open on a book-rest, two more shut beside it, an inkwell and a quill, a page of notes. Its length
 * along x (`k` 0) or along y (1). 190 x 140 at (95, 102).
 */
function readingDesk(k: number): Sprite {
  const S = turned(scene(190, 140, 95, 102), k);
  const HL = 32;
  const HB = 11;
  // the legs, turned, a stretcher between each pair
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) cylinder(S, sx * (HL - 3), sy * (HB - 2), (z) => 1.5 + 0.7 * Math.sin((z / 22) * Math.PI * 3) ** 2, 0, 22, (n) => toneAt(n, WALNUT, 0.05), 1);
    S.rod([sx * (HL - 3), -HB + 2, 5], [sx * (HL - 3), HB - 2, 5], 0.8, 0.8, WALNUT, 2);
  }
  S.rod([-HL + 3, 0, 5], [HL - 3, 0, 5], 0.8, 0.8, WALNUT, 2);
  // the apron under the top, a drawer either side; the top
  slab(S, -HL + 1, -HB + 1, HL - 1, HB - 1, 22, 26, WALNUT, 3, -0.1, (f, u) => (f !== 4 && (Math.abs(u - 0.25) < 0.08 || Math.abs(u - 0.75) < 0.08) && fr(u * 50) < 0.5 ? 0.2 : 0));
  slab(S, -HL - 1, -HB - 1, HL + 1, HB + 1, 26, 27.6, WALNUT, 4, 0.25);
  S.quad([[-HL + 1.5, -HB + 1.5, 27.7], [HL - 1.5, -HB + 1.5, 27.7], [HL - 1.5, HB - 1.5, 27.7], [-HL + 1.5, HB - 1.5, 27.7]], (u, v) => {
    const e = Math.min(u, 1 - u, (v * HB) / HL, ((1 - v) * HB) / HL);
    if (Math.abs(e - 0.025) < 0.006) return BRASS[2];
    // the leather worn paler where elbows rested
    return Math.hypot((u - 0.35) * 2.2, v - 0.5) < 0.3 ? DESKLEATHER[3] : DESKLEATHER[2];
  }, 5);
  // the book-rest and the great book open on it
  S.box([-8, -2, 30], [[1, 0, 0], [0, 0.94, 0.34], [0, -0.34, 0.94]], [9, 5, 0.6], (_f, _u, _v, n) => toneAt(n, WALNUT, 0.2), 6);
  const ON = (x: number, y: number, lift: number): V3 => [x, -2 + y * 0.94, 30.6 + y * 0.34 + lift];
  S.quad([ON(-17, -5.6, 0), ON(1, -5.6, 0), ON(1, 5.6, 0), ON(-17, 5.6, 0)], () => OXBLOOD[2], 7);
  writtenPage(S, [ON(-16.4, -5, 0.5), ON(-8.3, -5, 0.5), ON(-8.3, 5, 0.5), ON(-16.4, 5, 0.5)], 8, 3, 0.2);
  writtenPage(S, [ON(-7.7, -5, 0.5), ON(0.4, -5, 0.5), ON(0.4, 5, 0.5), ON(-7.7, 5, 0.5)], 9, 4, 0.35);
  // two shut, one on the other; the inkwell and its quill; a page of notes
  book(S, [14, -2, 28.8], 0.2, 10, 2.4, 7, false, BOTTLE, 10);
  book(S, [14.5, -2.4, 31.2], -0.25, 9, 2.2, 6.5, false, CALF, 11);
  cylinder(S, 22, 5, (z) => 1.8 - (z - 27.6) * 0.15, 27.6, 30.4, (n) => toneAt(n, BLACK, 0.4), 12, (_a, rr) => (rr < 0.45 ? INK[0] : BLACK[3]));
  S.quad([[22, 5, 30.2], [24, 7.5, 40], [25, 8, 40], [22.6, 5.4, 30.2]], (u) => (u > 0.4 ? PAGES[4] : PAGES[2]), 13);
  writtenPage(S, [[4, 3, 27.8], [12, 4.5, 27.8], [11, 9.5, 27.8], [3, 8, 27.8]], 14, 7, 0.4);
  return done(S, 95, 102);
}

/**
 * A READING CHAIR (breakable): a high-backed chair of walnut, its seat and back of buttoned oxblood leather, arms
 * ending in scrolls; knocked over on its back, a leg snapped. 130 x 120 at (74, 94).
 */
function readingChair(fallen: boolean): Sprite {
  const S = scene(130, 120, 74, 94);
  // (built upright, then laid over on its back when knocked down: turned about the y axis through its back foot)
  const PH = 1.4;
  const P = (x: number, y: number, z: number): V3 => (fallen ? [-8 + (x + 8) * Math.cos(PH) - z * Math.sin(PH), y, (x + 8) * Math.sin(PH) + z * Math.cos(PH) + 0.6] : [x, y, z]);
  const L = (a: V3, b: V3, r: number, ramp: Ramp, id: number): void => S.rod(P(a[0], a[1], a[2]), P(b[0], b[1], b[2]), r, r, ramp, id);
  for (const sy of [-1, 1]) {
    L([8, sy * 8, 0], [8, sy * 8, 14], 1.1, WALNUT, 1);
    if (!(fallen && sy > 0)) L([-8, sy * 8, 0], [-9, sy * 8, 14], 1.1, WALNUT, 1);
    // the back's uprights, raking back, their finials; the arms on their posts
    L([-9, sy * 8, 14], [-12, sy * 8, 46], 1.2, WALNUT, 2);
    S.ball(P(-12.2, sy * 8, 47.5), 1.5, WALNUT, 2);
    L([6, sy * 8.6, 14], [6, sy * 8.6, 23], 0.8, WALNUT, 3);
    L([-9.5, sy * 8.6, 23], [7, sy * 8.6, 23], 1, WALNUT, 3);
    S.ball(P(7.5, sy * 8.6, 23), 1.4, WALNUT, 3);
  }
  if (fallen) S.rod([12, 14, 0.8], [18, 17, 0.8], 1.1, 1.1, WALNUT, 1);
  // the seat and the back, buttoned leather
  const seat: [V3, V3, V3, V3] = [P(-9, -8, 15), P(8, -8, 15), P(8, 8, 15), P(-9, 8, 15)];
  S.quad(seat, (u, v) => (fr(u * 3 + 0.5) < 0.12 && fr(v * 3 + 0.5) < 0.12 ? OXBLOOD[0] : u > 0.85 ? OXBLOOD[4] : OXBLOOD[3]), 4);
  const back: [V3, V3, V3, V3] = [P(-10.6, -7.5, 18), P(-10.6, 7.5, 18), P(-12.2, 7.5, 44), P(-12.2, -7.5, 44)];
  S.quad(back, (u, v) => (fr(u * 3 + 0.5) < 0.1 && fr(v * 4 + 0.5) < 0.08 ? OXBLOOD[0] : v > 0.95 ? OXBLOOD[4] : OXBLOOD[2]), 5);
  return done(S, 74, 94);
}

/**
 * A LECTERN: a reading stand of walnut, a turned column on three scrolled feet, its sloped top with a ledge, a great
 * book open on it, a ribbon of faded red hanging from it. 100 x 150 at (50, 128).
 */
function lectern(): Sprite {
  const S = scene(100, 150, 50, 128);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    S.rod([0, 0, 5], [Math.cos(a) * 11, Math.sin(a) * 11, 1], 1.4, 1, WALNUT, 1);
    S.ball([Math.cos(a) * 11.5, Math.sin(a) * 11.5, 1.3], 1.5, WALNUT, 1);
  }
  cylinder(S, 0, 0, (z) => 2.2 + 1.3 * Math.sin((z / 40) * Math.PI * 4) ** 2, 3, 40, (n) => toneAt(n, WALNUT, 0.1), 2);
  // the sloped top, its ledge along the low edge (toward +y)
  S.box([0, 0, 43], [[1, 0, 0], [0, 0.9, -0.44], [0, 0.44, 0.9]], [11, 8, 0.9], (_f, _u, _v, n) => toneAt(n, WALNUT, 0.15), 3);
  S.rod([-11, 7.4, 39.4], [11, 7.4, 39.4], 0.8, 0.8, WALNUT, 4);
  const ON = (x: number, y: number, lift: number): V3 => [x, y * 0.9 + lift * 0.44, 43.9 - y * 0.44 + lift * 0.9];
  S.quad([ON(-10, -7, 0), ON(10, -7, 0), ON(10, 7, 0), ON(-10, 7, 0)], () => CALF[1], 5);
  writtenPage(S, [ON(-9.5, -6.4, 0.6), ON(-0.4, -6.4, 0.8), ON(-0.4, 6.4, 0.8), ON(-9.5, 6.4, 0.6)], 6, 11, 0.15);
  writtenPage(S, [ON(0.4, -6.4, 0.8), ON(9.5, -6.4, 0.6), ON(9.5, 6.4, 0.6), ON(0.4, 6.4, 0.8)], 7, 12, 0.25);
  // the ribbon, hanging down over the ledge
  S.quad([ON(0.2, -6, 1), ON(1.2, -6, 1), [1.6, 8.6, 30], [0.6, 8.6, 30]], (_u, v) => (v > 0.5 ? OXBLOOD[3] : OXBLOOD[2]), 8);
  return done(S, 50, 128);
}

/**
 * THE BOOK OF STOLEN WORDS (the quest; his doc: "on the lectern at the heart of the library lies the book of stolen
 * words, nearly full."): an immense book bound in black, iron at its corners and its clasps undone, open on a great
 * lectern of black wood carved with the Order's blank mask; its pages crowded with the city's stolen words, burning the
 * enemy's pink, the last few lines still empty; words rising off it. Its own pale light, and the stolen words' pink.
 * 160 x 200 at (80, 170).
 */
function stolenBook(): Sprite {
  const S = scene(160, 200, 80, 170);
  // the great lectern: a stepped base, a thick square column, the Order's mask carved on its front
  slab(S, -15, -12, 15, 12, 0, 4, BLACK, 1, 0.3);
  slab(S, -12, -9, 12, 9, 4, 7, BLACK, 2, 0.25);
  slab(S, -6, -5, 6, 5, 7, 40, BLACK, 3, 0.2, (f, u) => (f !== 4 && Math.abs(fr(u * 3) - 0.5) < 0.04 ? -0.5 : 0));
  S.egg([0, 5.4, 25], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.6, 0.8, 4.8], (n, w) => {
    if (Math.abs(Math.abs(w[0]) - 1.4) < 0.7 && Math.abs(w[2] - 26) < 0.5) return BLACK[0];
    return toneAt(n, MASK, -0.2);
  }, 4);
  // its top, sloped toward the eye (+y)
  S.box([0, 0, 43], [[1, 0, 0], [0, 0.9, -0.44], [0, 0.44, 0.9]], [17, 11, 1.4], (_f, _u, _v, n) => toneAt(n, BLACK, 0.35), 5);
  const ON = (x: number, y: number, lift: number): V3 => [x, y * 0.9 + lift * 0.44, 44.4 - y * 0.44 + lift * 0.9];
  // the covers, black, their iron corners; the clasps hanging open
  S.quad([ON(-17, -11, 0), ON(17, -11, 0), ON(17, 11, 0), ON(-17, 11, 0)], (u, v) => ((u < 0.08 || u > 0.92) && (v < 0.12 || v > 0.88) ? IRON[3] : BINDING[2]), 6);
  for (const sx of [-1, 1]) S.rod(ON(sx * 17, 2, 0.4), [sx * 19, 10, 38], 0.6, 0.6, IRON, 7);
  // the pages, a thick block of them; written over with the stolen words, burning; the last lines of the right page empty
  const page = (x0: number, x1: number, lift: number, id: number, full: number): void => {
    S.quad([ON(x0, -10, lift), ON(x1, -10, lift), ON(x1, 10, lift), ON(x0, 10, lift)], (u, v) => {
      const line = Math.floor(v * 13);
      const lv = fr(v * 13);
      if (u < 0.05 || u > 0.95 || v < 0.04 || v > 0.96) return PALE[2];
      if (v < full && lv > 0.25 && lv < 0.75 && u > 0.08 && u < 0.92) {
        const g = hash(Math.floor(u * 26), line + id * 17, 8121);
        if (g < 0.62) return g < 0.12 ? WORDS[4] : g < 0.4 ? WORDS[3] : WORDS[2];
      }
      return PALE[3];
    }, id);
  };
  for (let i = 0; i < 4; i++) {
    // (the block of pages: their edges, stepped)
    S.quad([ON(-16, 10.4, i * 0.4), ON(16, 10.4, i * 0.4), ON(16, 10.4, i * 0.4 + 0.4), ON(-16, 10.4, i * 0.4 + 0.4)], () => PAGES[i % 2 ? 2 : 3], 8);
  }
  page(-16, -0.6, 1.8, 10, 1);
  page(0.6, 16, 1.8, 11, 0.72);
  S.quad([ON(-0.6, -10, 1.4), ON(0.6, -10, 1.4), ON(0.6, 10, 1.4), ON(-0.6, 10, 1.4)], () => PAGES[1], 12);
  // the stolen words rising off it, faint, pink burning to gold
  for (let i = 0; i < 12; i++) {
    const a = i * 2.39996;
    const t = i / 11;
    S.ball([Math.cos(a) * (3 + 9 * hash(i, 1, 8122)), -2 + Math.sin(a) * 6, 50 + t * 34], 1.1 - t * 0.5, WORDS, SOFT_ID + 300 + i, undefined, 0.5 - t * 0.6);
  }
  return done(S, 80, 170, [
    { at: [0, 0, 50], r: 52, color: '#e8e2d2', a: 0.35 },
    { at: [0, 0, 56], r: 40, color: WORDS[2], a: 0.3 },
  ]);
}

// =================================================================================================
// THE STACKS

/** LIBRARY STEPS: a set of rolling steps of walnut on brass castors, five treads up to a little platform, a handrail of turned posts. 120 x 150 at (60, 120). */
function libraryLadder(): Sprite {
  const S = scene(120, 150, 60, 120);
  const HW = 7;
  // the stringers, sloping up from +x to -x
  for (const sy of [-1, 1]) {
    S.box([0, sy * HW, 15], [[0.66, 0, 0.75], [0, 1, 0], [-0.75, 0, 0.66]], [21, 0.9, 1.8], (_f, _u, _v, n) => toneAt(n, WALNUT, 0.05), 1);
    S.rod([-12, sy * HW, 0], [-12, sy * HW, 30], 1.1, 1.1, WALNUT, 2);
    for (const x of [-12, 13]) cylinder(S, x, sy * HW, 1.1, 0, 1.8, (n) => toneAt(n, BRASS, 0.1), 3);
  }
  // the treads, each lit along its front edge; the platform
  for (let i = 0; i < 5; i++) {
    const x = 12 - i * 5;
    const z = 3 + i * 5.6;
    slab(S, x - 2.4, -HW + 0.6, x + 2.4, HW - 0.6, z, z + 1, WALNUT, 4 + i, 0.15);
  }
  slab(S, -14, -HW - 0.4, -6, HW + 0.4, 30, 31.4, WALNUT, 10, 0.25);
  // the handrail: posts up from the platform, the rail down along the stringer
  for (const sy of [-1, 1]) {
    S.rod([-12, sy * HW, 31], [-12, sy * HW, 46], 0.7, 0.7, WALNUT, 11);
    S.rod([-12, sy * HW, 46], [10, sy * HW, 18], 0.75, 0.75, WALNUT, 11);
    S.rod([2, sy * HW, 13], [2, sy * HW, 30.8], 0.5, 0.5, WALNUT, 11);
  }
  S.rod([-12, -HW, 46], [-12, HW, 46], 0.7, 0.7, WALNUT, 11);
  // a book left on the platform
  book(S, [-10, 0, 32.6], 0.4, 8, 2, 6, false, SLATEBLUE, 12);
  return done(S, 60, 120);
}

/**
 * A CANDLE CHANDELIER, hung over the floor on its chain (his doc's "candle chandeliers"): a great iron hoop and a
 * smaller one above it, scrolled arms to its stem, eighteen candles, wax run down them and dripping; lit (an honest
 * flame), or out. It hangs: nothing of it stands on the floor. 200 x 270 at (100, 250).
 */
function chandelier(lit: boolean): Sprite {
  const S = scene(200, 270, 100, 250);
  const Z = 84;
  // the chain up into the dark
  for (let i = 0; i < 26; i++) S.ball([0, 0, Z + 22 + i * 3.2], 0.75, IRON, 1);
  // the stem, its finial and its boss
  cylinder(S, 0, 0, (z) => 1.4 + 1.2 * Math.sin(((z - Z + 6) / 28) * Math.PI * 2) ** 2, Z - 6, Z + 22, (n) => toneAt(n, IRON, 0.2), 2);
  S.ball([0, 0, Z - 7], 2, IRON, 2);
  const tips: V3[] = [];
  const hoop = (R: number, z: number, n: number, id: number): void => {
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      S.ball([Math.cos(a) * R, Math.sin(a) * R, z], 0.95, IRON, id);
    }
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.2;
      const x = Math.cos(a) * R;
      const y = Math.sin(a) * R;
      // the arm in from the hoop to the stem, a scroll under it
      S.rod([x * 0.95, y * 0.95, z], [0, 0, z + 6], 0.5, 0.5, IRON, id + 1);
      // the candle's cup and the candle
      cylinder(S, x, y, (zz) => 1.1 + (zz - z) * 0.4, z, z + 1.6, (nn) => toneAt(nn, IRON, 0.2), id + 2);
      tips.push(candle(S, x, y, z + 1.6, 5 + 2.5 * hash(i, id, 8131), lit, id + 3 + i * 2));
    }
  };
  hoop(27, Z, 12, 10);
  hoop(14, Z + 12, 6, 60);
  // wax dripped off it, hanging in strings
  for (let i = 0; i < 7; i++) {
    const a = i * 0.9 + 0.4;
    const r = i % 2 ? 27 : 14;
    const z = i % 2 ? Z : Z + 12;
    for (let k = 0; k < 3; k++) S.ball([Math.cos(a) * r, Math.sin(a) * r, z - 1.3 - k * 1.1], 0.55 - k * 0.1, WAX, 100);
  }
  return done(S, 100, 250, lit ? [{ at: [0, 0, Z + 6], r: 84, color: CANDLE[3], a: 0.45 }] : []);
}

/** A CANDELABRUM standing on the floor: a tall stand of dark iron and brass, three feet, five branches, five candles burning (an honest flame). 120 x 190 at (60, 166). */
function candelabrum(): Sprite {
  const S = scene(120, 190, 60, 166);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.3;
    S.rod([0, 0, 6], [Math.cos(a) * 10, Math.sin(a) * 10, 0.6], 1, 0.8, IRON, 1);
    S.ball([Math.cos(a) * 10.4, Math.sin(a) * 10.4, 0.9], 1.2, IRON, 1);
  }
  cylinder(S, 0, 0, (z) => 1.2 + 1.2 * Math.sin((z / 54) * Math.PI * 5) ** 2, 2, 54, (n) => toneAt(n, IRON, 0.25), 2);
  cylinder(S, 0, 0, 2.6, 30, 32, (n) => toneAt(n, BRASS, 0.1), 3);
  const tips: V3[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 4) * Math.PI;
    const x = i === 2 ? 0 : Math.cos(a) * (i % 2 ? 7 : 13);
    const zz = i === 2 ? 62 : 56 + (i % 2) * 2;
    if (i !== 2) {
      // the branch curving out and up
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        S.ball([x * t, 0, 50 + (zz - 50) * Math.sin(t * Math.PI * 0.5) - 3 * Math.sin(t * Math.PI)], 0.8, BRASS, 4);
      }
    }
    cylinder(S, x, 0, (z) => 1.3 + (z - zz) * 0.4, zz, zz + 1.8, (n) => toneAt(n, BRASS, 0.2), 5);
    tips.push(candle(S, x, 0, zz + 1.8, 7 + 3 * hash(i, 0, 8141), true, 10 + i * 2));
  }
  return done(S, 60, 166, [{ at: [0, 0, 66], r: 56, color: CANDLE[3], a: 0.42 }]);
}

/** A STACK OF BOOKS (breakable): books heaped where they were pulled down, crooked, one leaning against them; kicked over, they lie scattered and splayed, pages loose. 140 x 120 at (70, 86). */
function bookHeap(scattered: boolean): Sprite {
  const S = turned(scene(140, 120, 70, 86), 0, 1.35);
  if (!scattered) {
    let z = 0;
    for (let i = 0; i < 9; i++) {
      const L = 9 + 4 * hash(i, 0, 8151);
      const T = 1.6 + 1.2 * hash(i, 1, 8151);
      const W = 6 + 2.5 * hash(i, 2, 8151);
      book(S, [(hash(i, 3, 8151) - 0.5) * 3, (hash(i, 4, 8151) - 0.5) * 3, z + T / 2], (hash(i, 5, 8151) - 0.5) * 0.9, L, T, W, false, BOOKS[Math.floor(hash(i, 6, 8151) * BOOKS.length)], 1 + i);
      z += T;
    }
    // one leaning against the heap
    book(S, [9, 6, 6], 0.3, 11, 2.2, 7, true, OXBLOOD, 20);
  } else {
    for (let i = 0; i < 9; i++) {
      const a = i * 2.39996;
      const d = 4 + 13 * hash(i, 7, 8151);
      book(S, [Math.cos(a) * d * 1.3, Math.sin(a) * d * 0.9, 1.1], a * 1.7, 9 + 4 * hash(i, 0, 8151), 2, 6.5, false, BOOKS[Math.floor(hash(i, 6, 8151) * BOOKS.length)], 1 + i);
    }
    for (let i = 0; i < 6; i++) {
      const a = i * 1.9 + 1;
      const x = Math.cos(a) * (10 + i * 3);
      const y = Math.sin(a) * (7 + i * 2);
      writtenPage(S, [[x, y, 0.4], [x + 6, y + 2, 0.4], [x + 4, y + 9, 0.4], [x - 2, y + 7, 0.4]], 30 + i, i, 0.2);
    }
  }
  return done(S, 70, 86);
}

/** A BOOK CART (breakable): a librarian's trolley of walnut, two shelves of books, a handle, four castors; tipped over, its books spilled across the floor. 160 x 120 at (80, 92). */
function bookCart(tipped: boolean): Sprite {
  const S = scene(160, 120, 80, 92);
  if (!tipped) {
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      S.rod([sx * 21, sy * 6, 2], [sx * 21, sy * 6, 24], 0.9, 0.9, WALNUT, 1);
      cylinder(S, sx * 21, sy * 6, 1.3, 0, 2, (n) => toneAt(n, BRASS, 0), 2);
    }
    for (const z of [5, 15]) {
      slab(S, -22, -7, 22, 7, z, z + 1.4, WALNUT, 3, 0.15);
      bookRow(S, -20.5, 20.5, -1, z + 1.4, z, 10 + z * 2, 8);
    }
    slab(S, -22, -7, 22, 7, 24, 25.4, WALNUT, 4, 0.2);
    // a few books lying on its top; the handle at its end
    book(S, [6, 0, 26.4], 0.15, 9, 2, 6, false, CALF, 60);
    book(S, [-8, 1, 26.4], -0.3, 10, 2, 6.5, false, BOTTLE, 61);
    S.rod([-21, -6, 24], [-26, -6, 30], 0.6, 0.6, BRASS, 5);
    S.rod([-21, 6, 24], [-26, 6, 30], 0.6, 0.6, BRASS, 5);
    S.rod([-26, -6, 30], [-26, 6, 30], 0.8, 0.8, BRASS, 5);
  } else {
    // on its side (turned about x: its side at -y down on the floor), the books poured out before it
    for (const z of [6, 19, 30]) slab(S, -17, -z - 1.4, 17, -z, 0, 14, WALNUT, 3, z === 30 ? 0.2 : 0.1);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      S.rod([sx * 16, -2, sy * 6 + 7], [sx * 16, -30, sy * 6 + 7], 0.9, 0.9, WALNUT, 1);
      S.ball([sx * 16, -1, sy * 6 + 7], 1.3, BRASS, 2);
    }
    S.rod([-16, -30, 1], [-21, -36, 1], 0.6, 0.6, BRASS, 5);
    S.rod([-16, -30, 13], [-21, -36, 13], 0.6, 0.6, BRASS, 5);
    S.rod([-21, -36, 1], [-21, -36, 13], 0.8, 0.8, BRASS, 5);
    for (let i = 0; i < 11; i++) {
      const a = i * 2.2;
      book(S, [-14 + i * 3 + Math.cos(a) * 2, 4 + 9 * hash(i, 1, 8161), 1.1], a, 9 + 3 * hash(i, 2, 8161), 2, 6, false, BOOKS[i % BOOKS.length], 10 + i);
    }
  }
  return done(S, 80, 92);
}

/**
 * A CARD CATALOGUE (breakable): a cabinet of walnut, rows of small drawers each with a brass pull and a little card in a
 * brass frame; pulled about, drawers hanging open and one on the floor, its cards spilled. 120 x 140 at (60, 112).
 */
function catalogue(spilled: boolean): Sprite {
  const S = scene(120, 140, 60, 112);
  const HW = 14;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod([sx * (HW - 1), sy * 6, 0], [sx * (HW - 1), sy * 6, 6], 1, 1, WALNUT, 1);
  slab(S, -HW, -7, HW, 7, 6, 40, WALNUT, 2, 0, (f, u, v) => {
    if (f !== 2) return 0;
    const cu = fr(u * 4);
    const cv = fr(v * 6);
    if (cu < 0.05 || cv < 0.06) return -0.8;
    if (Math.abs(cu - 0.5) < 0.12 && Math.abs(cv - 0.72) < 0.1) return 0.9;
    if (Math.abs(cu - 0.5) < 0.06 && Math.abs(cv - 0.35) < 0.08) return 0.6;
    return 0;
  });
  slab(S, -HW - 1, -8, HW + 1, 8, 40, 42, WALNUT, 3, 0.25);
  if (spilled) {
    // two drawers hanging out of it; a third on the floor, its cards fanned out across the boards
    for (const [x, z] of [[-7, 31], [7, 14]] as const) {
      slab(S, x - 3, 7, x + 3, 15, z, z + 4.6, WALNUT, 4, 0.1);
      for (let i = 0; i < 6; i++) S.quad([[x - 2.4, 8 + i * 1.1, z + 4.4], [x + 2.4, 8 + i * 1.1, z + 4.4], [x + 2.4, 8.3 + i * 1.1, z + 6.6], [x - 2.4, 8.3 + i * 1.1, z + 6.6]], (_u, v) => (v > 0.8 ? PAGES[4] : PAGES[2]), 5);
    }
    slab(S, 14, 10, 20, 18, 0, 4.6, WALNUT, 6, 0.1);
    for (let i = 0; i < 14; i++) {
      const a = i * 2.39996;
      const d = 3 + 1.2 * i;
      const x = 18 + Math.cos(a) * d * 1.1;
      const y = 14 + Math.sin(a) * d * 0.8;
      S.quad([[x, y, 0.3], [x + 3, y + 0.6, 0.3], [x + 2.6, y + 2.6, 0.3], [x - 0.4, y + 2, 0.3]], () => PAGES[3 + (i % 2)], 7 + (i % 3));
    }
  }
  return done(S, 60, 112);
}

/**
 * A GLOBE (breakable): the world as the library knew it, on a stand of walnut, a brass ring about it; its seas a faded
 * blue-grey, its lands the colour of old parchment (lands of its own, no real map); smashed, the globe fallen from its
 * stand, split and rolled on the floor. 110 x 120 at (55, 98).
 */
function globe(broken: boolean): Sprite {
  const S = scene(110, 120, 55, 98);
  const R = 9;
  const shade = (n: V3, w: readonly number[], c: V3): string => {
    const lx = (w[0] - c[0]) / R;
    const ly = (w[1] - c[1]) / R;
    const lz = (w[2] - c[2]) / R;
    const lon = Math.atan2(ly, lx);
    const lat = Math.asin(Math.max(-1, Math.min(1, lz)));
    // the lines of the meridians and parallels, inked faint
    if (fr((lon / Math.PI) * 6) < 0.04 || fr((lat / Math.PI) * 6 + 0.5) < 0.04) return toneAt(n, SEA, 0.4);
    const land = hash(Math.floor((lon + 4) * 3.2), Math.floor((lat + 2) * 3.4), 8171) + 0.3 * Math.sin(lon * 5 + lat * 7) > 0.85;
    return toneAt(n, land ? LAND : SEA, 0.05);
  };
  if (!broken) {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      S.rod([Math.cos(a) * 6, Math.sin(a) * 6, 20], [Math.cos(a) * 10, Math.sin(a) * 10, 0.5], 0.9, 0.9, WALNUT, 1);
    }
    cylinder(S, 0, 0, 7, 19, 21, (n) => toneAt(n, WALNUT, 0.2), 2, () => WALNUT[3]);
    S.rod([0, 0, 21], [0, 0, 24], 1.2, 1.2, BRASS, 3);
    const c: V3 = [0, 0, 34];
    S.egg(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [R, R, R], (n, w) => shade(n, w, c), 4);
    // the meridian ring of brass, tilted
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      S.ball([Math.cos(a) * (R + 1.2) * 0.4, Math.cos(a) * (R + 1.2) * 0.92, 34 + Math.sin(a) * (R + 1.2)], 0.55, BRASS, 5);
    }
  } else {
    S.box([-6, -6, 3], [[0.7, 0.7, 0], [0, 0, 1], [0.7, -0.7, 0]], [10, 2.5, 1.2], (_f, _u, _v, n) => toneAt(n, WALNUT, 0), 1);
    for (let i = 0; i < 3; i++) S.rod([-6 + i * 4, -10 + i, 1], [-2 + i * 5, -2 + i * 2, 1], 0.9, 0.9, WALNUT, 2);
    const c: V3 = [10, 8, R * 0.85];
    S.egg(c, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [R, R, R * 0.85], (n, w) => (w[0] - c[0] + (w[1] - c[1]) * 0.4 > 5 ? null : shade(n, w, c)), 3);
    for (let i = 0; i < 5; i++) S.ball([16 + i * 2, 12 - i, 0.8], 0.9, SEA, 4);
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 1.4;
      S.ball([-14 + Math.cos(a) * 9, 6 + Math.sin(a) * 4, 0.6], 0.5, BRASS, 5);
    }
  }
  return done(S, 55, 98);
}

/**
 * CHAINED BOOKS (his doc's): a long double desk of walnut, sloped both ways, great books lying on it each chained by
 * its cover to an iron rod running under the desk's ridge, the chains hanging in loops. Its length along x (`k` 0) or
 * along y (1). 190 x 150 at (95, 112).
 */
function chainedDesk(k: number): Sprite {
  const S = turned(scene(190, 150, 95, 112), k);
  const HL = 30;
  for (const sx of [-1, 1]) {
    slab(S, sx * HL - 1.6, -9, sx * HL + 1.6, 9, 0, 3, WALNUT, 1, 0.1);
    slab(S, sx * HL - 1.2, -2, sx * HL + 1.2, 2, 3, 34, WALNUT, 2, 0);
  }
  slab(S, -HL, -1.4, HL, 1.4, 6, 9, WALNUT, 3, -0.1);
  // the two sloped tops, the ridge between
  for (const sy of [-1, 1]) {
    S.box([0, sy * 5.2, 30], [[1, 0, 0], [0, 0.9, sy * -0.44], [0, sy * 0.44, 0.9]], [HL + 1, 5.4, 0.8], (_f, _u, _v, n) => toneAt(n, WALNUT, 0.1), 4);
    S.rod([-HL - 1, sy * 10, 27.4], [HL + 1, sy * 10, 27.4], 0.7, 0.7, WALNUT, 5);
  }
  S.rod([-HL, 0, 35], [HL, 0, 35], 1.1, 1.1, WALNUT, 6);
  // the iron rod along under the ridge, its hasp and lock at one end
  S.rod([-HL + 1, 0, 26], [HL - 1, 0, 26], 0.5, 0.5, IRON, 7);
  S.box([HL - 2, 0.8, 26], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.2, 0.8, 1.6], (_f, _u, _v, n) => toneAt(n, IRON, 0.3), 8);
  // the books lying on the near slope (and the far), each with its chain looping down to the rod
  let id = 10;
  for (const sy of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = -20 + i * 20 + (sy > 0 ? 2 : -3);
      const c: V3 = [x, sy * 5.6, 31.6];
      S.box(c, [[1, 0, 0], [0, 0.9, sy * -0.44], [0, sy * 0.44, 0.9]], [6, 4.4, 1.4], (f, u, v, n) => {
        if (f === 2 || f === 3) return toneAt(n, PAGES, fr(v * 6) < 0.3 ? -0.3 : 0.1);
        if ((u < 0.12 || u > 0.88) && (v < 0.15 || v > 0.85)) return toneAt(n, BRASS, 0);
        return toneAt(n, BOOKS[(i + (sy > 0 ? 3 : 0)) % BOOKS.length], 0);
      }, id++);
      // the chain: from the cover's edge down in a loop to the rod
      const a: V3 = [x - 6, sy * 9.4, 29.6];
      for (let k2 = 0; k2 <= 9; k2++) {
        const t = k2 / 9;
        const p: V3 = [a[0] + (x - 3 - a[0]) * t, a[1] * (1 - t), a[2] + (26 - a[2]) * t - 4 * Math.sin(t * Math.PI)];
        S.ball(p, 0.45, IRON, id);
      }
      id++;
    }
  }
  return done(S, 95, 112);
}

// =================================================================================================
// THE BELLS

/**
 * THE LIBRARY'S CLOSING BELL (the Muffled Bell on this floor): a great bell that rang the library shut each night,
 * hung in a carved frame of walnut, its posts topped with finials, a scrolled crossbeam, its rope; gagged by the Silent
 * Order (black cloth bound round it, chains over it), or rung, swinging `swing`. 160 x 240 at (80, 210).
 */
function closingBell(gagged: boolean, swing = 0): Sprite {
  const S = scene(160, 240, 80, 210);
  for (const sx of [-1, 1]) {
    slab(S, sx * 22 - 4, -8, sx * 22 + 4, 8, 0, 4, WALNUT, 1, 0.15);
    cylinder(S, sx * 22, 0, (z) => 2.4 + 0.9 * Math.sin((z / 86) * Math.PI * 6) ** 2, 4, 90, (n) => toneAt(n, WALNUT, 0.05), 2);
    S.ball([sx * 22, 0, 93], 2.8, WALNUT, 2);
    cylinder(S, sx * 22, 0, 1.2, 94, 98, (n) => toneAt(n, BRASS, 0.2), 3);
    timber(S, [sx * 22, -6, 2], [sx * 22, 6, 2], 1.2, 4);
  }
  timber(S, [-25, 0, 86], [25, 0, 86], 3, 5, [0.15, 0.85]);
  // the scroll carved on the beam's face, gilt dull
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const a = t * Math.PI * 4;
    S.ball([-14 + t * 28, 3.2, 86 + Math.sin(a) * 1.2], 0.45, BRASS, 6);
  }
  bell(S, [0, 0, 82], 12, 26, swing, 10, gagged);
  // the rope down from the bell's wheel at its side to its sally
  for (let i = 0; i <= 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    S.ball([14, Math.cos(a) * 9, 78 + Math.sin(a) * 9], 0.75, WALNUT, 7);
  }
  rope(S, [14, -9, 78], [10, -5, 16], 0.5, 12, 0.5);
  S.rod([10, -5, 20], [10, -5, 13], 1.1, 1.1, OXBLOOD, 13);
  return done(S, 80, 210);
}

/**
 * A HAND BELL (one of the Bells on this floor: his doc's "Hand bells on the reading desks and in the galleries"): a
 * brass hand bell, its turned handle of walnut, set on a little round reading table on one leg. Quiet; awake; rung (one
 * way, back). 220 x 160 at (110, 118): room for its ring on the floor.
 */
function handBell(state: number): Sprite {
  const S = scene(220, 160, 110, 118);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.3;
    S.rod([0, 0, 4], [Math.cos(a) * 7, Math.sin(a) * 7, 0.5], 1, 0.8, WALNUT, 1);
  }
  cylinder(S, 0, 0, (z) => 1.4 + 0.8 * Math.sin((z / 24) * Math.PI * 3) ** 2, 2, 24, (n) => toneAt(n, WALNUT, 0.1), 2);
  cylinder(S, 0, 0, 9, 24, 25.6, (n) => toneAt(n, WALNUT, 0.3), 3, () => WALNUT[3]);
  // the bell on it, its handle up
  const c: V3 = [0, 0, 33.4];
  const sw = SWING[state];
  bell(S, c, 4.2, 7.8, sw, 4, false, metalOf(state));
  const up: V3 = [0, -Math.sin(sw) * 5.5, Math.cos(sw) * 5.5];
  S.rod(c, [c[0], c[1] + up[1] * 0.4, c[2] + up[2] * 0.4], 0.7, 0.7, BRASS, 5);
  S.rod([c[0], c[1] + up[1] * 0.4, c[2] + up[2] * 0.4], [c[0], c[1] + up[1], c[2] + up[2]], 1.1, 1.3, WALNUT, 6);
  S.ball([c[0], c[1] + up[1] * 1.15, c[2] + up[2] * 1.15], 1.4, WALNUT, 6);
  const glow = bellGlow(S, c, 4.2, 7.8, state, [0, 0, 25.6]);
  return done(S, 110, 118, glow);
}

// =================================================================================================
// DOORS, GATES, WHAT IS ON THE WALL

/** THE LIBRARY'S DOORS: a pair of tall doors of walnut, each of four carved panels and studded with brass, under a round-headed frame carved with a scroll. Shut, or swung open. */
function libraryDoors(open: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const HW = 20;
    const HT = 64;
    for (const s of [-1, 1]) S.rod(w(s * (HW + 2), 1.2, 0), w(s * (HW + 2), 1.2, HT + 2), 2.2, 2.2, WALNUT, 1);
    // the round head over them, a scroll carved in it
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI;
      S.ball(w(-Math.cos(a) * (HW + 2), 1.4, HT + 2 + Math.sin(a) * 9), 2.2, WALNUT, 2);
      if (i % 3 === 0) S.ball(w(-Math.cos(a) * (HW - 3), 1.6, HT + 2 + Math.sin(a) * 5), 0.8, BRASS, 3);
    }
    S.quad([w(-HW, 0.2, 0), w(HW, 0.2, 0), w(HW, 0.2, HT + 10), w(-HW, 0.2, HT + 10)], () => '#0a0810', 4);
    const leaf = (side: number, id: number): void => {
      const hinge = side * HW;
      const ang = open ? 1.25 : 0;
      const P = (a: number, z: number): V3 => w(hinge + (a - hinge) * Math.cos(ang), 0.8 + Math.abs(a - hinge) * Math.sin(ang), z);
      const a0 = side < 0 ? -HW : 0;
      const a1 = side < 0 ? 0 : HW;
      S.quad([P(a0, 0), P(a1, 0), P(a1, HT), P(a0, HT)], (u, v) => {
        const a = a0 + (a1 - a0) * u;
        const z = v * HT;
        const pu = fr(((a - a0) / HW) * 2);
        const pv = fr((z / HT) * 2);
        // the panels: sunk, their mouldings lit along the top and left
        if (pu < 0.1 || pv < 0.06) return WALNUT[1];
        if (pu < 0.15 || pv < 0.1) return WALNUT[open ? 3 : 4];
        if (pu > 0.9 || pv > 0.94) return WALNUT[1];
        // the studs, in rows
        if (fr(pu * 3) < 0.2 && fr(pv * 4) < 0.12) return BRASS[3];
        return WALNUT[open ? 2 : 3];
      }, id);
      // its ring pull
      for (let i = 0; i < 10; i++) {
        const t = (i / 10) * Math.PI * 2;
        S.ball(P((side < 0 ? -3 : 3) + Math.cos(t) * 2, 30 + Math.sin(t) * 2), 0.5, BRASS, id + 2);
      }
    };
    leaf(-1, 5);
    leaf(1, 8);
  }, 120, 120, undefined, 22);
}

/**
 * A GATE OF THE ORDER across the stacks: a gate of wrought iron, its bars ending in spikes and scrolled between, the
 * Order's blank mask on a plate at its heart, chained and locked. Shut, or swung open. Looking along +y (`k` 0) or +x
 * (1). 150 x 170 at (75, 134).
 */
function galleryGate(open: boolean, k: number): Sprite {
  const S = turned(scene(150, 170, 75, 134), k);
  const HW = 26;
  const HT = 60;
  for (const s of [-1, 1]) {
    S.rod([s * HW, 0, 0], [s * HW, 0, HT + 6], 1.8, 1.8, IRON, 1);
    S.ball([s * HW, 0, HT + 7.5], 2.1, IRON, 1);
  }
  const ang = open ? 1.35 : 0;
  const P = (a: number, z: number): V3 => [-HW + (a + HW) * Math.cos(ang), (a + HW) * Math.sin(ang), z];
  for (let i = 1; i < 12; i++) {
    const a = -HW + (2 * HW * i) / 12;
    const top = HT - 4 + 6 * Math.sin((i / 12) * Math.PI);
    S.rod(P(a, 1), P(a, top), 0.6, 0.6, IRON, 3);
    S.rod(P(a, top), P(a, top + 3), 0.8, 0.1, IRON, 3);
  }
  for (const z of [3, 22, HT - 6]) S.rod(P(-HW + 1, z), P(HW - 1, z), 0.8, 0.8, IRON, 4);
  // the scrolls between the lower rails
  for (let i = 0; i < 6; i++) {
    const a0 = -HW + 4 + i * 8.6;
    for (let k2 = 0; k2 < 12; k2++) {
      const t = (k2 / 12) * Math.PI * 2;
      S.ball(P(a0 + 2.4 + Math.cos(t) * 2.4 * (1 - k2 / 16), 12.5 + Math.sin(t) * 3.5 * (1 - k2 / 16)), 0.45, IRON, 5);
    }
  }
  const pc = P(0, 38);
  S.egg(pc, [[Math.cos(ang), Math.sin(ang), 0], [-Math.sin(ang), Math.cos(ang), 0], [0, 0, 1]], [5, 0.8, 6.5], (n, wp) => {
    const lp = wp[2] - 38;
    const la = (wp[0] - pc[0]) * Math.cos(ang) + (wp[1] - pc[1]) * Math.sin(ang);
    if (Math.abs(Math.abs(la) - 1.8) < 0.9 && Math.abs(lp - 1.2) < 0.6) return BLACK[0];
    return toneAt(n, MASK, 0.1);
  }, 6);
  if (!open) {
    S.box(P(HW - 3, 22), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.2, 1.4, 2.8], (_f, _u, _v, n) => toneAt(n, BRASS, 0), 7);
    for (let i = 0; i < 9; i++) S.ball([HW - 4 + Math.cos(i * 0.7) * 3, 1.5, 25 - i * 1.8], 0.7, IRON, 8);
  }
  return done(S, 75, 134);
}

/**
 * A PORTRAIT, BLACKED OUT (on the wall): a founder of the library in his scholar's robe and cap, painted dark, in a
 * heavy frame of dull gilt; the Order's ink slashed across his face, run down over the canvas; the little brass plate
 * under it scratched blank. (A man of the library's own; no one real.)
 */
function portrait(): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const Z = 52;
    const HW = 13;
    const HH = 17;
    S.quad([w(-HW, 0.8, Z - HH), w(HW, 0.8, Z - HH), w(HW, 0.8, Z + HH), w(-HW, 0.8, Z + HH)], (u, v) => {
      const a = (u - 0.5) * 2 * HW;
      const z = (v - 0.5) * 2 * HH;
      // the frame: carved, gilt dull, lit along its top and left
      const e = Math.min(HW - Math.abs(a), HH - Math.abs(z));
      if (e < 3) return e < 0.8 ? BRASS[1] : (a < 0 && Math.abs(a) > HW - 3) || z > HH - 3 ? BRASS[3] : fr((a + z) * 0.4) < 0.3 ? BRASS[1] : BRASS[2];
      // the painting: a dark ground; the scholar's black robe and its pale collar; his face, struck through
      const fx = a;
      const fz = z - 4;
      const slash = Math.abs(fz - fx * 0.35 - 0.5) < 3.2 && Math.abs(fx) < 8;
      if (slash || (Math.abs(fx - 2 - (fz - 2) * 0.1) < 0.9 && fz < 1 && fz > -14 && fx > -1)) return INK[fr(fx * 0.7) < 0.15 ? 3 : 1];
      if (Math.hypot(fx / 4.2, (fz - 1) / 5.2) < 1) return fz > 3.5 ? '#2a2620' : '#7a6650';
      if (Math.abs(fz + 5.5) < 1.2 && Math.abs(fx) < 5) return '#9a9282';
      if (fz < -5 && Math.abs(fx) < 8 + (-5 - fz) * 0.6) return fx < -2 ? '#1e1c22' : '#141218';
      return z > 0 ? '#2e2a22' : '#25221c';
    }, 1);
    // the brass plate under it, scratched
    S.quad([w(-4, 1.2, Z - HH - 4), w(4, 1.2, Z - HH - 4), w(4, 1.2, Z - HH - 1.5), w(-4, 1.2, Z - HH - 1.5)], (u) => (fr(u * 9) < 0.3 ? BRASS[1] : BRASS[3]), 2);
  }, 90, 130, undefined, 34);
}

/** A WALL SCONCE: a brass back plate, a scrolled arm out from the wall, a candle in its cup, wax run down it; lit (an honest flame), or out. */
function sconce(lit: boolean): { left: Sprite; right: Sprite } {
  return frontPiece((S, w) => {
    const Z = 46;
    S.egg(w(0, 0.6, Z), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [3.6, 0.6, 7], (n) => toneAt(n, BRASS, 0.1), 1);
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      S.ball(w(0, 1 + 8 * t, Z - 3 - 4 * Math.sin(t * Math.PI)), 0.7, BRASS, 2);
    }
    const c = w(0, 9.5, Z);
    cylinder(S, c[0], c[1], (z) => 1.6 + (z - c[2]) * 0.5, c[2] - 1.5, c[2] + 0.6, (n) => toneAt(n, BRASS, 0.2), 3);
    candle(S, c[0], c[1], c[2] + 0.6, 9, lit, 4, 1.2);
    for (let k = 0; k < 3; k++) S.ball([c[0] + 0.9, c[1] + 0.6, c[2] - 2 - k], 0.5 - k * 0.1, WAX, 5);
  }, 80, 120, (_S, w) => (lit ? [{ at: w(0, 9.5, 56), r: 50, color: CANDLE[3], a: 0.45 }] : []), 34);
}

// =================================================================================================
// THE ORDER'S WORK: THE SCRIPTORIUM

/**
 * SPILLED INK (a trap: the Order's black ink run out of an upset pot): a black pool, its sheen cold. Frames: lying; the
 * warning (it stirs, rings running across it, bubbles); sprung (the ink thrown up out of it in a crown of black,
 * splashing out across the floor). 200 x 160 at (100, 110).
 */
function spilledInk(f: number): Sprite {
  const S = scene(200, 160, 100, 110);
  S.egg([0, 0, 0.3], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [21, 13, 0.3], (n, w) => {
    const d = Math.hypot(w[0] / 21, w[1] / 13);
    if (f >= 1 && Math.abs(fr(d * 3 - f * 0.3) - 0.5) < 0.06) return INK[4];
    if (d > 0.84 && hash(Math.floor(w[0]), Math.floor(w[1]), 8181) < 0.5) return INK[2];
    return fr(w[0] * 0.25 - w[1] * 0.15) < 0.06 ? INK[3] : INK[1];
  }, 1);
  // the pot it ran out of, on its side
  S.rod([-22, -10, 3], [-15, -6, 3], 3, 2.4, BLACK, 2);
  S.rod([-15, -6, 3], [-13.5, -5, 3], 1.4, 1.4, BLACK, 2);
  if (f >= 1) for (let i = 0; i < 6; i++) S.ball([Math.cos(i * 2.2) * (3 + i * 1.6), Math.sin(i * 2.2) * (2 + i), 0.9], 0.8, INK, 3, undefined, 0.3);
  if (f === 2) {
    // the crown of black thrown up out of it, drops flying, splashed out beyond
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = 7 + 2 * hash(i, 0, 8182);
      const h = 9 + 9 * hash(i, 1, 8182);
      S.rod([Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, 0.5], [Math.cos(a) * r, Math.sin(a) * r, h], 1.2, 0.5, INK, 4);
      S.ball([Math.cos(a) * (r + 1.5), Math.sin(a) * (r + 1.5), h + 2.5 + 3 * hash(i, 2, 8182)], 0.8, INK, 5, undefined, 0.2);
    }
    S.rod([0, 0, 0.5], [0, 0, 22], 2.6, 0.8, INK, 6);
    S.ball([0, 0, 25], 1.4, INK, 6);
    for (let i = 0; i < 14; i++) {
      const a = i * 2.39996;
      const d = 24 + 10 * hash(i, 3, 8182);
      S.egg([Math.cos(a) * d * 1.1, Math.sin(a) * d * 0.8, 0.3], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.6 + hash(i, 4, 8182), 1.2, 0.3], () => INK[1], 7);
    }
  }
  return done(S, 100, 110);
}

/**
 * THE FLOOR BLACKED OUT (a floor tile; his doc: at half his life the Censor "blacks out parts of the floor for good, so
 * the room shrinks"): a bar of the Order's ink laid across the floor by a great brush, its edges ragged with the
 * bristles' marks, a cold sheen along it, drips off its ends. Laid flat: 100 x 56 at (50, 28).
 */
function blackedFloor(): Sprite {
  return lying(100, 56, 50, 28, (u, v, px, py) => {
    if (Math.abs(u) > 0.48 || Math.abs(v) > 0.48) return null;
    // the bar along u, nearly the tile's whole width across v; its ends and edges ragged
    const rag = 0.04 * Math.sin(u * 41 + 1.3) + 0.03 * Math.sin(u * 87);
    const edge = 0.42 + rag - Math.abs(v);
    const end = 0.47 - Math.abs(u) - 0.03 * Math.abs(Math.sin(v * 53));
    if (edge < 0 || end < 0) {
      // drips and spatter round it
      return hash(px >> 1, py, 8191) < 0.05 && edge > -0.05 && end > -0.04 ? INK[1] : null;
    }
    // the bristles' streaks along it; a sheen
    if (Math.abs(v + 0.12) < 0.03 && Math.abs(u) < 0.35) return INK[3];
    return hash(Math.floor(u * 60), Math.floor(v * 18), 8192) < 0.15 ? INK[2] : INK[0];
  });
}

/**
 * A BOOK PRESS: a heavy standing press of oak and iron, two posts and a crossbeam, a great iron screw down through it
 * and its turning bar, pressing a stack of pages bound into a book; the Order's work. 140 x 150 at (70, 120).
 */
function bookPress(): Sprite {
  const S = scene(140, 150, 70, 120);
  // the bed of the press, a heavy bench of oak on short legs
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod([sx * 18, sy * 9, 0], [sx * 18, sy * 9, 12], 1.6, 1.6, WALNUT, 1);
  slab(S, -21, -11, 21, 11, 12, 17, WALNUT, 2, 0.1);
  // its two cheeks and the head across them, iron-strapped
  for (const sx of [-1, 1]) slab(S, sx * 15 - 2.6, -4, sx * 15 + 2.6, 4, 17, 46, WALNUT, 3, 0);
  slab(S, -19, -5, 19, 5, 46, 53, WALNUT, 4, 0.1);
  for (const sx of [-1, 1]) for (const z of [19, 47]) S.box([sx * 15, 4.3, z], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.8, 0.3, 0.9], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), 5);
  // the great screw down through the head, its threads; its boss and the long bar through it
  cylinder(S, 0, 0, 2.2, 32, 60, (n, _a, z) => toneAt(n, IRON, fr(z / 1.6) < 0.4 ? -0.4 : 0.2), 6);
  cylinder(S, 0, 0, 4, 58, 63, (n) => toneAt(n, IRON, 0.1), 7, () => IRON[3]);
  S.rod([-22, -9, 60.5], [22, 9, 60.5], 1, 1, IRON, 8);
  for (const s2 of [-1, 1]) S.ball([s2 * 22.8, s2 * 9.3, 60.5], 1.5, IRON, 8);
  // the platen pressing down; the book in the press, its pages squeezed
  slab(S, -11, -7, 11, 7, 28, 32, WALNUT, 9, 0.15);
  slab(S, -9.5, -6.4, 9.5, 6.4, 17, 18.4, BINDING, 10, 0.1);
  slab(S, -9, -6, 9, 6, 18.4, 26.6, PAGES, 11, 0.1, (f, _u, v) => (f !== 4 && fr(v * 9) < 0.25 ? -0.4 : 0));
  slab(S, -9.5, -6.4, 9.5, 6.4, 26.6, 28, BINDING, 12, 0.1);
  // loose pages waiting on the bench
  writtenPage(S, [[12, 2, 17.2], [19, 3, 17.2], [18, 9, 17.2], [11, 8, 17.2]], 13, 31, 0.5);
  return done(S, 70, 120);
}

/**
 * A COPYING DESK in the scriptorium: a tall sloped desk of oak and its stool, a page half copied under a weight, every
 * other line of it blacked out by the Order; an inkhorn, quills in a pot, a candle stub cold. Its front toward +y (`k`
 * 0) or +x (1). 130 x 150 at (65, 120).
 */
function copyingDesk(k: number): Sprite {
  const S = turned(scene(130, 150, 65, 120), k);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod([sx * 11, sy * 7, 0], [sx * 11, sy * 7, sy > 0 ? 30 : 38], 1, 1, WALNUT, 1);
  for (const sx of [-1, 1]) S.rod([sx * 11, -7, 8], [sx * 11, 7, 8], 0.7, 0.7, WALNUT, 2);
  S.box([0, 0, 34.5], [[1, 0, 0], [0, 0.88, -0.48], [0, 0.48, 0.88]], [13, 8.6, 0.8], (_f, _u, _v, n) => toneAt(n, WALNUT, 0.2), 3);
  const ON = (x: number, y: number, lift: number): V3 => [x, y * 0.88 + lift * 0.48, 35.3 - y * 0.48 + lift * 0.88];
  writtenPage(S, [ON(-8, -6.6, 0.3), ON(6, -6.6, 0.3), ON(6, 6.6, 0.3), ON(-8, 6.6, 0.3)], 4, 21, 0.5);
  S.box(ON(-1, 4.6, 1.2), [[1, 0, 0], [0, 0.88, -0.48], [0, 0.48, 0.88]], [3.4, 1, 0.9], (_f, _u, _v, n) => toneAt(n, IRON, 0.2), 5);
  // the ledge along the desk's top edge: the inkhorn, the quills in their pot, a cold candle stub
  slab(S, -13, -9, 13, -6.4, 38, 39.4, WALNUT, 6, 0.2);
  cylinder(S, -9, -7.6, 1.5, 39.4, 42, (n) => toneAt(n, BLACK, 0.4), 7, (_a, rr) => (rr < 0.5 ? INK[0] : BLACK[3]));
  cylinder(S, 7, -7.6, 1.6, 39.4, 43, (n) => toneAt(n, WALNUT, 0.1), 8, () => WALNUT[0]);
  for (let i = 0; i < 3; i++) S.quad([[7 + i * 0.6 - 0.6, -7.6, 43], [9 + i * 1.6, -8.6 + i, 53 - i * 2], [10 + i * 1.6, -8.4 + i, 53 - i * 2], [7.6 + i * 0.6 - 0.6, -7.4, 43]], (u) => (u > 0.4 ? PAGES[4] : PAGES[2]), 9 + i);
  candle(S, 0, -7.6, 39.4, 2.6, false, 12);
  // the stool before it
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) S.rod([sx * 4, 15 + sy * 4, 0], [sx * 3.4, 15 + sy * 3.4, 24], 0.7, 0.7, WALNUT, 13);
  cylinder(S, 0, 15, 5.6, 24, 25.6, (n) => toneAt(n, WALNUT, 0.2), 14, () => WALNUT[3]);
  return done(S, 65, 120);
}

/** A VAT OF THE ORDER'S INK: a squat oak cask bound with iron, open, full to its brim with black ink, a ladle hooked over its lip, ink run down its staves and pooled at its foot. 110 x 110 at (55, 84). */
function inkVat(): Sprite {
  const S = scene(110, 110, 55, 84);
  S.egg([6, 6, 0.3], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [17, 11, 0.3], (_n, w) => (fr(w[0] * 0.3 - w[1] * 0.2) < 0.06 ? INK[3] : INK[1]), 1);
  cylinder(S, 0, 0, (z) => 11 + 1.6 * Math.sin((z / 22) * Math.PI), 0, 22, (n, a, z) => {
    if (Math.abs(z - 4) < 1 || Math.abs(z - 18) < 1) return toneAt(n, IRON, 0.3);
    // the ink run down the staves, toward the eye
    if (Math.abs(Math.sin(a * 3 + 1)) < 0.12 && z > 6 + 10 * fr(a * 2.3) && Math.cos(a - Math.PI / 4) > 0) return INK[1];
    return toneAt(n, WALNUT, fr((a / (Math.PI * 2)) * 18) < 0.12 ? -0.5 : 0.05);
  }, 2, (a, rr) => (rr > 0.93 ? WALNUT[2] : fr(rr * 4 + a * 0.2) < 0.06 ? INK[3] : INK[1]));
  // the ladle hooked over its lip
  S.rod([-6, -8, 22.5], [-14, -13, 34], 0.6, 0.6, IRON, 3);
  S.rod([-14, -13, 34], [-15, -13.6, 32.5], 0.6, 0.6, IRON, 3);
  S.egg([-3.6, -6.4, 20], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2.2, 2.2, 1.6], (n) => toneAt(n, IRON, 0.2), 4);
  return done(S, 55, 84);
}

/** A BASKET OF STRUCK-OUT PAGES (breakable): a wicker basket heaped with pages the Order has censored, line after line blacked out; tipped, the pages spilled out across the floor. 110 x 100 at (55, 76). */
function pageBasket(tipped: boolean): Sprite {
  const S = scene(110, 100, 55, 76);
  const weave = (n: V3, a: number, z: number): string => toneAt(n, WICKER, fr(z / 2.4 + (Math.floor(a * 6) % 2) * 0.5) < 0.5 ? 0.15 : -0.25);
  if (!tipped) {
    cylinder(S, 0, 0, (z) => 8 + z * 0.12, 0, 15, (n, a, z) => weave(n, a, z), 1);
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4;
      const d = i === 0 ? 0 : 3 + 4 * hash(i, 0, 8201);
      const x = Math.cos(a) * d;
      const y = Math.sin(a) * d;
      const z = 15 + 1.5 * hash(i, 1, 8201) + (i === 0 ? 2 : 0);
      const t = a * 0.7;
      const c = Math.cos(t) * 4;
      const s = Math.sin(t) * 4;
      writtenPage(S, [[x - c + s, y - s - c, z], [x + c + s, y + s - c, z + 1], [x + c - s, y + s + c, z + 1.6], [x - c - s, y - s + c, z + 0.6]], 2 + i, i + 3, 0.7);
    }
  } else {
    S.rod([-14, -9, 8.4], [0, -2, 8.4], 8, 9.4, WICKER, 1);
    S.egg([0.4, -1.8, 8.4], [[0.9, 0.44, 0], [-0.44, 0.9, 0], [0, 0, 1]], [0.6, 9.4, 9.4], () => WICKER[0], 2);
    for (let i = 0; i < 12; i++) {
      const a = i * 2.39996;
      const d = 6 + 2 * i;
      const x = 6 + Math.cos(a) * d * 0.9;
      const y = 6 + Math.sin(a) * d * 0.6;
      const t = a * 1.3;
      const c = Math.cos(t) * 4;
      const s = Math.sin(t) * 4;
      writtenPage(S, [[x - c + s, y - s - c, 0.4], [x + c + s, y + s - c, 0.4], [x + c - s, y + s + c, 0.4], [x - c - s, y - s + c, 0.4]], 2 + i, i + 3, 0.7);
    }
  }
  return done(S, 55, 76);
}

/**
 * A SPIRAL STAIR up to the gallery: a stair of cast iron winding round its pole, its treads pierced, a rail on slender
 * balusters, going up into the dark where the gallery is. 150 x 290 at (75, 270).
 */
function spiralStair(): Sprite {
  const S = scene(150, 290, 75, 270);
  const R = 18;
  const TOP = 150;
  cylinder(S, 0, 0, 1.6, 0, TOP + 12, (n) => toneAt(n, IRON, 0.2), 1);
  const N = 28;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2 * 2.2;
    const a1 = a0 + (Math.PI * 2 * 2.2) / N;
    const z = 4 + (i / N) * (TOP - 4);
    // the tread, a wedge out from the pole, pierced with a pattern
    S.quad([[Math.cos(a0) * 1.6, Math.sin(a0) * 1.6, z], [Math.cos(a0) * R, Math.sin(a0) * R, z], [Math.cos(a1) * R, Math.sin(a1) * R, z], [Math.cos(a1) * 1.6, Math.sin(a1) * 1.6, z]], (u, v) => (fr(u * 5) < 0.18 && fr(v * 3) < 0.25 && u > 0.25 && u < 0.85 ? IRON[0] : u > 0.9 ? IRON[3] : v < 0.12 ? IRON[1] : IRON[2]), 2 + (i % 2));
    S.rod([Math.cos(a1) * R, Math.sin(a1) * R, z], [Math.cos(a1) * R, Math.sin(a1) * R, z - 1.2], 0.5, 0.5, IRON, 4);
    // a baluster, the rail
    S.rod([Math.cos(a0) * (R - 0.6), Math.sin(a0) * (R - 0.6), z], [Math.cos(a0) * (R - 0.6), Math.sin(a0) * (R - 0.6), z + 16], 0.35, 0.35, IRON, 5);
    S.rod([Math.cos(a0) * (R - 0.6), Math.sin(a0) * (R - 0.6), z + 16], [Math.cos(a1) * (R - 0.6), Math.sin(a1) * (R - 0.6), z + 16 + (TOP - 4) / N], 0.55, 0.55, BRASS, 6);
  }
  // the foot of it: a newel and its rail's scroll
  S.ball([R - 0.6, 0, 20], 1.4, BRASS, 7);
  return done(S, 75, 270);
}

// =================================================================================================

let made: Piece[] | null = null;
/** FLOOR 15'S PIECES, the Censor's: 25. */
export function greatLibraryPieces(): Piece[] {
  if (made) return made;
  made = [
    // (frames: its length along x, along y)
    { name: 'a reading desk', kind: 'obstacle', frames: [readingDesk(0), readingDesk(1)], shadow: 1.0 },
    { name: 'a reading chair', kind: 'breakable', frames: [readingChair(false), readingChair(true)], shadow: 0.4 },
    { name: 'a lectern', kind: 'obstacle', frames: [lectern()], shadow: 0.4 },
    { name: 'the book of stolen words', kind: 'quest', frames: [stolenBook()], shadow: 0.6 },
    { name: 'library steps', kind: 'obstacle', frames: [libraryLadder()], shadow: 0.55 },
    // (it hangs over the floor: frames lit, out)
    { name: 'a candle chandelier', kind: 'obstacle', frames: [chandelier(true), chandelier(false)], shadow: 0 },
    { name: 'a candelabrum', kind: 'obstacle', frames: [candelabrum()], shadow: 0.35 },
    { name: 'a stack of books', kind: 'breakable', frames: [bookHeap(false), bookHeap(true)], shadow: 0.4 },
    { name: 'a book cart', kind: 'breakable', frames: [bookCart(false), bookCart(true)], shadow: 0.6 },
    { name: 'a card catalogue', kind: 'breakable', frames: [catalogue(false), catalogue(true)], shadow: 0.5 },
    { name: 'a globe', kind: 'breakable', frames: [globe(false), globe(true)], shadow: 0.35 },
    // (frames: its length along x, along y)
    { name: 'chained books', kind: 'obstacle', frames: [chainedDesk(0), chainedDesk(1)], shadow: 1.0 },
    { name: "the library's closing bell (the Muffled Bell)", kind: 'obstacle', frames: [closingBell(true), closingBell(false, 0), closingBell(false, 0.35), closingBell(false, -0.35)], shadow: 0.9 },
    // (the Bells: quiet, awake, rung one way, rung back)
    { name: 'a hand bell', kind: 'obstacle', frames: [0, 1, 2, 3].map(handBell), shadow: 0.3 },
    { name: "the library's doors", kind: 'door', ...withFramesN([libraryDoors(false), libraryDoors(true)]) },
    // (frames: shut and open along +y, shut and open along +x)
    { name: "a gate of the Order", kind: 'gate', frames: [0, 1].flatMap((k) => [galleryGate(false, k), galleryGate(true, k)]), shadow: 0.9 },
    { name: 'a portrait, blacked out', kind: 'on the wall', ...withFramesN([portrait()]) },
    { name: 'a wall sconce', kind: 'on the wall', ...withFramesN([sconce(true), sconce(false)]) },
    // (frames: lying, the warning, sprung)
    { name: 'spilled ink', kind: 'trap', frames: [0, 1, 2].map(spilledInk) },
    { name: 'the floor blacked out', kind: 'floor tile', frames: [blackedFloor()] },
    { name: 'a book press', kind: 'obstacle', frames: [bookPress()], shadow: 0.6 },
    // (frames: its front along +y, along +x)
    { name: 'a copying desk', kind: 'obstacle', frames: [copyingDesk(0), copyingDesk(1)], shadow: 0.6 },
    { name: "a vat of the Order's ink", kind: 'obstacle', frames: [inkVat()], shadow: 0.5 },
    { name: 'a basket of struck-out pages', kind: 'breakable', frames: [pageBasket(false), pageBasket(true)], shadow: 0.35 },
    { name: 'a spiral stair', kind: 'obstacle', frames: [spiralStair()], shadow: 0.7 },
  ];
  return made;
}

function withFramesN(ss: { left: Sprite; right: Sprite }[]): { left: Sprite[]; right: Sprite[] } {
  return { left: ss.map((s) => s.left), right: ss.map((s) => s.right) };
}
