// Concept art, not part of the game: ten designs for the WORDSMITH, for the owner to pick from.
//
// The owner, 5 Oct 2026 (16:43): "I'm not happy with the wordsmith's look. Can I get 10 options
// and I'll choose. I want to replace the witch/librarian on the title screen with him so we need
// to get him right". Before that, of the town's people (07:49): "the wordsmith I'm not sure about
// but I want him to be very runic."
//
// So: ten men (and one who may be read either way) who are each "very runic" in a different way,
// and as unlike one another, and as unlike the pale hooded figure of Version 14.4, as they can be
// made. Each is painted with the game's own kit (art/kit.ts), at the heroes' grain, and SEEN FROM
// A CORNER as every figure is to be since Version 14.5 (kit.ts, "Turned to the grid"): facing
// down the screen and to the right, the nearer shoulder (on the left of the picture) lower, the
// middle line of the body and the eyes toward the side faced. The one he picks can go into the
// game as it stands here, and be given its loop and its act afterwards.
//
// What glows on a friend is cyan (kit.ts: GLINT, SPARK); pink and gold are the enemy's.

import type { Light, Px } from '../engine/px';
import {
  BONE, CYAN, GLINT, HI, INDIGO, INK, KAY, KX, LEAF, LO, MAIL, PINK, PLUM, SKIN4, SPARK, STAND, STEEL, TEAL, TURN,
  along, ball, bezAt, blend, compose, dim, dir, hash, inEllipse, joint, layer, leg, limb, lit, shear, shearBy, slant, stroke,
} from '../art/kit';
import type { LegStyle, Painted, Ramp, V } from '../art/kit';
import { RED, SCARF_GOLD } from '../art/hero_warrior';
import { IRON } from '../art/mkit';

export interface Option {
  n: number;
  name: string;
  note: string;
  paint: () => Painted;
}

// ---------------------------------------------------------------------------------------------
// Colours

export const SKIN: Ramp = [SKIN4[0], SKIN4[0], SKIN4[1], SKIN4[2], SKIN4[3]];
/** Cut stone: paler than the walls' iron, darker than steel. */
export const STONE: Ramp = blend(IRON, STEEL, 0.5);
/** Cloth the colour of stone dust. */
export const DUST: Ramp = blend(BONE, INDIGO, 0.32);
/** Printer's ink, and a cloth soaked in it. */
export const INKY: Ramp = ['#141230', '#141230', '#26224e', '#3c3672', '#3c3672'];
/** Fair hair, in this world's light. */
export const FAIR: Ramp = blend(BONE, PLUM, 0.3);
/** Light wood: a mallet's head, a spindle. */
export const WOOD: Ramp = blend(PLUM, BONE, 0.3);
export const HOT = '#ffffff';
/** A darker skin, for the one whose skin is written on: the writing must stand off it. */
export const DUSK: Ramp = ['#2e2456', '#2e2456', '#5a4a8a', '#8a7ab0', '#8a7ab0'];
/** Yellow hair. (Gold as a thing's own colour; what GLOWS gold is the enemy's.) */
export const GOLDEN: Ramp = blend(SCARF_GOLD, PLUM, 0.18);
/** An apron black with ink, light enough to be seen on a dark floor. */
export const INKED: Ramp = ['#1a1840', '#1a1840', '#322e6a', '#524c9c', '#524c9c'];

// ---------------------------------------------------------------------------------------------
// What every figure is hung from

const NEAR_DROP = 2;
const FAR_RISE = 3;

export interface Build {
  X: number;
  /** The top of the shoulders, the chin, the belt and the hem, as rows. */
  sy: number;
  chin: number;
  beltY: number;
  hem: number;
  /** The head: its middle and its radius. */
  cx: number;
  cy: number;
  r: number;
  /** The body's middle line, and the middle of the face: both toward the side faced. */
  mid: number;
  fx: number;
  /** How far a column of the body is slid down the screen, seen from a corner. */
  lean: (x: number) => number;
  /** The same for a long garment: all of it down to the belt, less and less below, none at the hem. */
  fall: (x: number, y: number) => number;
  /** The shoulders: the nearer one (on the left of the picture, lower) and the further. */
  near: V;
  far: V;
}

/** `shoulder`, `belt`, `hemUp`: how far above the floor each is. `half`: half the chest. `r`: the head. */
export function build(shoulder: number, belt: number, hemUp: number, half: number, r: number): Build {
  const X = KX;
  const sy = KAY - shoulder;
  const beltY = KAY - belt;
  const hem = KAY - hemUp;
  const chin = sy - 2;
  const cx = X - 0.5;
  const lean = slant(X - 4, 2);
  const fall = (x: number, y: number): number => lean(x) * (y <= beltY + 3 ? 1 : Math.max(0, 1 - (y - beltY - 3) / Math.max(1, hem - beltY - 6)));
  return { X, sy, chin, beltY, hem, cx, cy: chin - r + 1, r, mid: X + TURN, fx: Math.round(cx) + TURN, lean, fall, near: [X - half + 1, sy + 3 + NEAR_DROP], far: [X + half - 1, sy + 3 - FAR_RISE] };
}

/** Paint a part level on a layer of its own, then set it on the grid: all of it, or (a long garment) less and less of it down to a hem that stays level. */
export function turned(onto: Px, b: Build, long: boolean, paint: (t: Px) => void): void {
  const t = layer();
  paint(t);
  if (long) shearBy(t, b.fall, onto);
  else shear(t, b.lean, onto);
}

/** Paint a pixel only where the layer already has one (a mark ON a thing, never beside it). */
export function mark(p: Px, x: number, y: number, color: string): void {
  if (p.has(Math.round(x), Math.round(y))) p.set(Math.round(x), Math.round(y), color);
}

/** Two legs seen from a corner: the nearer foot lower on the screen, both pointing down the screen and to the right. */
export function legs(p: Px, s: LegStyle, top: number): void {
  leg(p, KX + 1, top - 1, KAY - 3, true, s, STAND, 3, 1);
  leg(p, KX - 1 - s.w, top, KAY - 1, false, s, STAND, 3, 1);
}

export function boots(upper: Ramp, lower: Ramp, w = 4, share = 0.5, band: Ramp | null = null): LegStyle {
  return { w, upper, lower, share, cuff: true, knee: null, band };
}

export function hand(p: Px, x: number, y: number, ramp: Ramp = SKIN): void {
  ball(p, x, y, 2.2, 2.1, ramp);
}

/**
 * An arm of two bones from a shoulder to a hand. `out`: which way the elbow goes (-1 to the left
 * of the picture, +1 to the right, 0 whichever is lower: an arm that hangs). It gives back the elbow.
 */
export function armTo(p: Px, s: V, h: V, upper: Ramp, lower: Ramp, r = 2.8, out: -1 | 0 | 1 = 0, la = 8, lb = 8): V {
  const a = joint(s, h, la, lb, 1);
  const c = joint(s, h, la, lb, -1);
  const e = out === 0 ? (a[1] >= c[1] ? a : c) : (a[0] - c[0]) * out >= 0 ? a : c;
  limb(p, s[0], s[1], e[0], e[1], r, r - 0.2, upper);
  limb(p, e[0], e[1], h[0], h[1], r - 0.2, r - 0.5, lower);
  return e;
}

/**
 * A face seen from a corner: the eyes are two points of light in a band of shadow, toward the
 * side faced, and the nose is under them. It gives back the row of the eyes.
 */
export function face(p: Px, b: Build, skin: Ramp = SKIN, band = false): number {
  ball(p, b.cx, b.cy, b.r, b.r + 0.3, skin);
  const ey = Math.round(b.cy) + 1;
  if (band) {
    // (the eyes lost in one shadow from ear to ear: under a brim, behind a visor)
    for (const [x, y] of inEllipse(b.cx, b.cy, b.r, b.r + 0.3)) if (y === ey - 1 || y === ey) p.set(x, y, INK);
    p.set(b.fx - 2, ey, GLINT).set(b.fx + 1, ey, GLINT);
  } else {
    // (each eye in its own socket, the bridge of the nose between them)
    for (const ex of [b.fx - 3, b.fx + 2]) {
      p.rect(ex - 1, ey - 1, 3, 2, INK);
      p.set(ex, ey, GLINT);
    }
  }
  p.rect(b.fx - 1, ey + 1, 2, 2, skin[3]);
  return ey;
}

/**
 * Hair, a cap, the crown of a hood: whatever of the head is above a line `brow` rows from its
 * middle. The line is lower at the back of the head, which is away from the side faced.
 */
export function crown(p: Px, b: Build, ramp: Ramp, brow: number, grow = 0.7, nape = 3): void {
  lit(p, ramp, HI, LO, (l) => {
    for (const [x, y] of inEllipse(b.cx, b.cy - 0.3, b.r + grow, b.r + grow + 0.3)) {
      if (y < Math.round(b.cy) + brow + (x < b.cx - 2 ? nape : 0)) l.set(x, y, INK);
    }
  });
}

/** A beard: from the cheeks to a point `len` rows under the eyes. The chin it hangs from is toward the side faced. */
export function beard(p: Px, b: Build, ey: number, ramp: Ramp, len: number, wide = 0): void {
  const m = b.cx + 1.5;
  const r = b.r;
  lit(p, ramp, HI, LO, (l) =>
    l.poly([[m - r - 0.5, ey + 1], [m - 2, ey + 3], [m + 2, ey + 3], [m + r - 0.5, ey + 1], [m + r - 1 + wide, ey + Math.min(8, len * 0.55)], [m + 1.5, ey + len - 2], [m + 0.5, ey + len], [m - 1.5, ey + len - 2], [m - r - wide, ey + Math.min(8, len * 0.55)]], INK),
  );
}

// ---------------------------------------------------------------------------------------------
// Runes

/** Small runes: a few strokes on a 3 x 5 grid. */
const RUNES: ReadonlyArray<ReadonlyArray<string>> = [
  ['#.#', '#.#', '.#.', '.#.', '.#.'],
  ['#..', '##.', '#.#', '##.', '#..'],
  ['.#.', '###', '.#.', '#.#', '#.#'],
  ['##.', '..#', '.#.', '#..', '.##'],
  ['#.#', '.#.', '#.#', '.#.', '.#.'],
  ['.#.', '#.#', '#.#', '.#.', '###'],
  ['#..', '#.#', '##.', '#.#', '#..'],
  ['.#.', '.##', '.#.', '##.', '.#.'],
];

export function rune(p: Px, k: number, x: number, y: number, color: string): void {
  const rows = RUNES[((k % RUNES.length) + RUNES.length) % RUNES.length];
  for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (rows[j].charAt(i) === '#') p.set(Math.round(x) + i, Math.round(y) + j, color);
}

/** A rune that is alight: it takes no seam, and gives off a little light. */
export function glowRune(over: Px, lights: Light[], k: number, x: number, y: number, a = 0.32, color: string = SPARK[3]): void {
  rune(over, k, x, y, color);
  lights.push({ x: Math.round(x) + 1.5, y: Math.round(y) + 2.5, r: 6, color: SPARK[2], a });
}

/** Great runes: strokes on a 5 x 7 grid. */
const GREAT: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  [[2, 0, 2, 6], [0, 2, 2, 0], [4, 2, 2, 0]],
  [[0, 0, 0, 6], [0, 0, 4, 2], [4, 2, 0, 4]],
  [[0, 0, 4, 6], [4, 0, 0, 6]],
  [[2, 0, 2, 6], [0, 5, 4, 1]],
  [[0, 6, 2, 0], [2, 0, 4, 6], [1, 3, 3, 3]],
  [[0, 0, 0, 6], [4, 0, 4, 6], [0, 2, 4, 4]],
];

export function greatRune(p: Px, k: number, x: number, y: number, color: string): void {
  for (const [a, c, d, e] of GREAT[((k % GREAT.length) + GREAT.length) % GREAT.length]) p.line(Math.round(x) + a, Math.round(y) + c, Math.round(x) + d, Math.round(y) + e, color);
}

export function glowGreat(over: Px, lights: Light[], k: number, x: number, y: number, a = 0.45, r = 11): void {
  greatRune(over, k, x, y, SPARK[4]);
  lights.push({ x: Math.round(x) + 2.5, y: Math.round(y) + 3.5, r, color: SPARK[2], a });
}

// ---------------------------------------------------------------------------------------------
// Things held

/**
 * A hammer or a mallet: the hand at `h`, the handle pointing along `deg` (90 = straight up) for
 * `len` pixels, then the head, `across` wide and `deep` along the handle. It gives back the middle
 * of the head.
 */
export function hammer(p: Px, h: V, deg: number, len: number, across: number, deep: number, wood: Ramp, iron: Ramp): V {
  const [dx, dy] = dir(deg);
  limb(p, h[0] - dx * 3, h[1] - dy * 3, h[0] + dx * len, h[1] + dy * len, 1.25, 1.25, wood);
  const mx = h[0] + dx * (len + deep / 2 - 1);
  const my = h[1] + dy * (len + deep / 2 - 1);
  const nx = -dy;
  const ny = dx;
  const corner = (u: number, v: number): [number, number] => [Math.round(mx + nx * u + dx * v), Math.round(my + ny * u + dy * v)];
  lit(p, iron, HI, LO, (l) => l.poly([corner(-across / 2, -deep / 2), corner(across / 2, -deep / 2), corner(across / 2, deep / 2), corner(-across / 2, deep / 2)], INK));
  return [mx, my];
}

/** A scroll's rolled end, seen end on. */
export function scrollEnd(p: Px, x: number, y: number, r = 2.3): void {
  ball(p, x, y, r, r, BONE);
  p.set(Math.round(x - 0.5), Math.round(y - 0.5), BONE[1]);
}

// ---------------------------------------------------------------------------------------------
// 1. The rune-smith: the word taken at its word. A smith of words, at a forge of them.

function runeSmith(): Painted {
  const b = build(41, 24, 12, 8, 6);
  const { X, sy, beltY } = b;
  const lights: Light[] = [];
  const body = layer();
  const head = layer();
  const tool = layer();
  const arms = layer();
  const over = layer();

  legs(body, boots(INDIGO, PLUM, 5), KAY - 17);

  // a dark jerkin without sleeves, and over it the leather apron: a bib on two straps, a skirt to the knees
  const waist = sy + 15;
  turned(body, b, false, (t) => {
    lit(t, INDIGO, HI, LO, (l) => l.poly([[X - 8, sy + 1], [X - 6, sy - 1], [X + 6, sy - 1], [X + 8, sy + 1], [X + 7, beltY + 9], [X - 7, beltY + 9]], INK));
    lit(t, PLUM, HI, LO, (l) => {
      l.rect(X - 5, sy + 5, 10, waist - sy - 5, INK);
      l.poly([[X - 7, waist], [X + 7, waist], [X + 8, KAY - 13], [X - 8, KAY - 13]], INK);
    });
    for (const x of [X - 5, X + 4]) t.vline(x, sy, 5, PLUM[1]);
    t.hline(X - 7, waist, 14, PLUM[0]);
    t.hline(X - 8, KAY - 14, 16, PLUM[0]);
  });
  // (the rune burned into the bib, and the scorch marks of the trade)
  greatRune(body, 0, b.mid - 3, sy + 7 + b.lean(b.mid), CYAN[2]);
  lights.push({ x: b.mid - 0.5, y: sy + 10, r: 8, color: SPARK[2], a: 0.22 });
  for (const [dx, dy] of [[-5, 6], [-3, 9], [4, 7]] as const) mark(body, X + dx, waist + dy + b.lean(X + dx), PLUM[0]);

  // the head: dark hair, goggles pushed up on the brow, a short dark beard
  const ey = face(head, b);
  beard(head, b, ey, IRON, 8);
  crown(head, b, IRON, -3);
  const gy = Math.round(b.cy) - 3;
  for (const [x, y] of inEllipse(b.cx, b.cy, b.r + 0.6, b.r + 0.6)) if (y === gy || y === gy + 1) head.set(x, y, PLUM[y === gy ? 2 : 1]);
  for (const x0 of [b.fx - 4, b.fx]) {
    head.rect(x0, gy - 1, 3, 3, STEEL[2]);
    head.set(x0 + 1, gy, CYAN[2]);
    over.set(x0 + 1, gy, SPARK[3]);
  }

  // the great hammer stands on its head at his nearer side, and his hand rests on the end of its handle
  const nHand: V = [X - 13, beltY - 1];
  const hm = hammer(tool, nHand, -90, 15, 13, 9, PLUM, IRON);
  // (its top is worn bright, and a rune is alight in its face)
  for (let x = Math.round(hm[0] - 6); x <= Math.round(hm[0] + 6); x++) mark(tool, x, Math.round(hm[1] - 4), STEEL[3]);
  glowGreat(over, lights, 1, hm[0] - 2.5, hm[1] - 3, 0.5, 12);
  const nElbow = armTo(arms, b.near, nHand, SKIN, SKIN, 3.2, -1, 7, 7);
  // (the marks of his trade, burned into the forearm)
  for (const k of [0.25, 0.5, 0.75]) {
    const x = nElbow[0] + (nHand[0] - nElbow[0]) * k;
    const y = nElbow[1] + (nHand[1] - nElbow[1]) * k;
    mark(arms, x, y, SPARK[2]);
    mark(arms, x + 1, y, CYAN[2]);
  }
  hand(arms, nHand[0], nHand[1]);

  // the further arm is lifted: in the tongs a word, white from the fire
  const fHand: V = [X + 12, sy + 10];
  const fElbow = armTo(arms, b.far, fHand, dim(SKIN), dim(SKIN), 3.1, 1, 7.5, 7.5);
  for (const k of [0.35, 0.65]) mark(arms, fElbow[0] + (fHand[0] - fElbow[0]) * k, fElbow[1] + (fHand[1] - fElbow[1]) * k, CYAN[2]);
  const grip: V = [fHand[0] + 6, fHand[1] - 10];
  tool.line(fHand[0], fHand[1], grip[0] - 1, grip[1] + 2, STEEL[2]).line(fHand[0] + 1, fHand[1], grip[0] + 1, grip[1] + 3, STEEL[1]);
  over.rect(grip[0] - 3, grip[1] - 2, 7, 5, SPARK[3]);
  over.rect(grip[0] - 2, grip[1] - 1, 5, 3, HOT);
  rune(over, 6, grip[0] - 1, grip[1] - 2, SPARK[2]);
  lights.push({ x: grip[0] + 0.5, y: grip[1] + 0.5, r: 14, color: SPARK[2], a: 0.6 });
  for (const [dx, dy, c] of [[5, -6, SPARK[3]], [-4, -7, SPARK[2]], [7, 1, SPARK[2]], [2, -9, CYAN[2]]] as const) over.set(Math.round(grip[0] + dx), Math.round(grip[1] + dy), c);
  hand(arms, fHand[0], fHand[1], dim(SKIN));

  return { px: compose(null, [body, head, tool, arms], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 2. The old scribe: a beard to his belt, lenses that shine, a quill as tall as he is.

function scribe(): Painted {
  const b = build(37, 21, 2, 7, 6);
  // (he stoops: the head is carried forward and low)
  b.cx += 1;
  b.cy += 2;
  b.fx += 1;
  const { X, sy, beltY, hem } = b;
  const lights: Light[] = [];
  const back = layer();
  const quill = layer();
  const body = layer();
  const head = layer();
  const front = layer();
  const over = layer();

  // two scroll cases on his back, their ends over the nearer shoulder
  limb(back, X - 4, sy + 9, X - 12, sy - 6, 2.7, 2.7, PLUM);
  scrollEnd(back, X - 12.5, sy - 7);
  limb(back, X + 1, sy + 7, X - 5, sy - 9, 2.5, 2.5, dim(PLUM));
  scrollEnd(back, X - 5.5, sy - 10, 2.1);

  // the quill, held like a staff: its nib on the floor, its feather over his head
  const qx = X + 15;
  limb(quill, qx, KAY - 6, qx, sy + 4, 0.9, 0.9, BONE);
  quill.line(qx - 1, KAY - 6, qx, KAY - 2, INDIGO[1]).line(qx, KAY - 6, qx, KAY - 2, INDIGO[2]);
  // (the feather: a narrow web on the side of the spine nearer him, a broad one on the other, cut into barbs)
  const spine: [V, V, V, V] = [[qx, sy + 5], [qx - 1.5, sy - 7], [qx + 0.5, sy - 18], [qx + 5, sy - 28]];
  lit(quill, BONE, HI, LO, (l) => {
    for (let k = 0; k <= 80; k++) {
      const t = k / 80;
      const [x, y] = bezAt(spine, t);
      const swell = Math.sin(Math.PI * Math.min(1, t * 1.08)) ** 0.75;
      for (let d = -1 - 1.6 * swell; d <= 1 + 4.6 * swell; d += 0.5) l.set(Math.round(x + d), Math.round(y - Math.max(0, d) * 0.55), INK);
    }
  });
  for (const t of [0.24, 0.42, 0.6, 0.76]) {
    const [x, y] = bezAt(spine, t);
    for (let i = 2; i <= 6; i++) quill.erase(Math.round(x + i), Math.round(y - i * 0.55 + 1));
  }
  for (let k = 1; k <= 30; k++) {
    const [x, y] = bezAt(spine, k / 31);
    mark(quill, x, y, TEAL[3]);
  }
  over.set(qx, KAY - 2, SPARK[3]);
  lights.push({ x: qx + 0.5, y: KAY - 2, r: 7, color: SPARK[2], a: 0.4 });

  // the further arm, in its wide sleeve, to the quill
  const fHand: V = [qx - 1, sy + 12];
  armTo(body, b.far, fHand, dim(INDIGO), dim(INDIGO), 3.2, 1, 7, 7);

  // the robe: ink blue, to the floor, a rope round it; a line of his own writing along the hem
  turned(body, b, true, (t) => {
    lit(t, INDIGO, HI, [LO[0], LO[1] + 1], (l) => l.poly([[X - 7, sy + 1], [X - 5, sy - 1], [X + 5, sy - 1], [X + 7, sy + 1], [X + 6, beltY], [X + 10, hem], [X - 10, hem], [X - 6, beltY]], INK));
    for (const [dx, from] of [[-5, 6], [3, 10], [6, 14]] as const) for (let y = beltY + from; y < hem - 4; y++) mark(t, X + dx + Math.round(((y - beltY) * dx) / 40), y, INDIGO[1]);
    t.rect(X - 6, beltY, 12, 2, BONE[2]);
    t.hline(X - 6, beltY + 1, 12, BONE[1]);
    for (let i = 0; i < 6; i++) t.set(b.mid - 2, beltY + 2 + i, BONE[i < 5 ? 2 : 3]);
  });
  for (let x = X - 9; x <= X + 9; x++) if ((x - X + 30) % 4 !== 3) mark(body, x, hem - 3, (x - X + 30) % 8 < 4 ? TEAL[3] : CYAN[2]);

  // the head: a skullcap, brows like his beard, two round lenses with the light in them
  const ey = face(head, b);
  beard(head, b, ey, BONE, 22, 1);
  crown(head, b, PLUM, -3, 0.7, 2);
  for (const x0 of [b.fx - 4, b.fx]) {
    head.rect(x0, ey - 1, 3, 3, STEEL[1]);
    head.set(x0 + 1, ey, SPARK[3]);
    over.set(x0 + 1, ey, HOT);
    head.hline(x0, ey - 3, 3, BONE[3]);
  }
  head.set(b.fx - 1, ey, STEEL[2]);
  lights.push({ x: b.fx, y: ey + 0.5, r: 6, color: SPARK[2], a: 0.34 });
  // (the locks of the beard)
  for (const [dx, y0, n] of [[-2, 7, 9], [2, 8, 8], [0, 12, 8]] as const) for (let i = 0; i < n; i++) mark(head, b.cx + 1.5 + dx, ey + y0 + i, BONE[2]);

  // the nearer arm holds a scroll he has let run out to the floor
  const nHand: V = [X - 11, beltY + 1];
  armTo(front, b.near, nHand, INDIGO, INDIGO, 3.2, -1, 7, 7);
  lit(front, BONE, HI, LO, (l) => {
    l.rect(X - 16, beltY + 2, 7, KAY - 8 - beltY, INK);
    l.ellipse(X - 12.5, KAY - 5, 3.6, 2.2, INK);
  });
  front.set(X - 13, KAY - 5, BONE[1]).set(X - 12, KAY - 5, BONE[1]);
  for (let y = beltY + 5; y < KAY - 8; y += 2) front.hline(X - 15, y, y % 3 === 0 ? 4 : 5, INDIGO[2]);
  for (const y of [beltY + 9, beltY + 11]) over.hline(X - 15, y, 5, SPARK[3]);
  lights.push({ x: X - 12.5, y: beltY + 10, r: 8, color: SPARK[2], a: 0.34 });
  hand(front, nHand[0], nHand[1]);
  const hands = layer();
  hand(hands, fHand[0] + 1, fHand[1]);

  return { px: compose(null, [back, quill, body, head, front, hands], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 3. The stone-carver: he carries the stone he is cutting on his back.

function carver(): Painted {
  const b = build(38, 22, 13, 8.5, 6);
  const { X, sy, beltY } = b;
  const lights: Light[] = [];
  const back = layer();
  const body = layer();
  const head = layer();
  const front = layer();
  const over = layer();

  // the standing stone on his back: taller than he is, a great rune cut in its head and a column of small ones down its edge
  // (It lies flat against his back, so its face runs the way his shoulders do: up the screen to
  // the right, all the way across. It is not a box seen from a corner, as his body is.)
  const top = sy - 32;
  const sx = X - 2;
  {
    const t = layer();
    lit(t, STONE, HI, LO, (l) => {
      l.rect(sx - 13, top + 9, 26, KAY - 10 - top - 9, INK);
      l.ellipse(sx, top + 10, 13, 10, INK);
    });
    // (its thickness, where the light catches the edge nearest us)
    for (let y = top + 6; y < KAY - 10; y++) {
      mark(t, sx - 13, y, STONE[3]);
      mark(t, sx - 12, y, STONE[3]);
    }
    // (weathered: a chip out of its edge, a crack)
    for (const [dx, dy] of [[12, 30], [12, 31], [11, 31]] as const) t.erase(sx + dx, top + dy);
    for (let i = 0; i < 9; i++) mark(t, sx + 6 + Math.round(i * 0.6), top + 14 + i, STONE[0]);
    for (let k = 0; k < 4; k++) rune(t, k + 2, sx - 10, top + 14 + k * 8, k === 1 ? CYAN[2] : STONE[0]);
    shear(t, along(sx, -1), back);
  }
  glowGreat(over, lights, 0, sx - 2, top + 4, 0.5, 13);

  legs(body, boots(MAIL, PLUM, 5), KAY - 17);

  // the further arm, raised: a chisel in the fist, held up to the eye
  const fHand: V = [X + 12, sy + 8];
  armTo(body, b.far, fHand, dim(DUST), dim(SKIN), 3, 1, 7, 7);

  // a tunic the colour of stone dust, the harness the stone hangs from crossed on his chest, a belt with a pouch
  turned(body, b, false, (t) => {
    lit(t, DUST, HI, LO, (l) => l.poly([[X - 8.5, sy + 1], [X - 6, sy - 1], [X + 6, sy - 1], [X + 8.5, sy + 1], [X + 8, KAY - 14], [X - 8, KAY - 14]], INK));
    for (let k = 0; k <= 16; k++) {
      const y = sy + 1 + k;
      t.rect(Math.round(X - 7 + k * 0.85), y, 2, 1, PLUM[2]);
      t.rect(Math.round(X + 5 - k * 0.85), y, 2, 1, PLUM[k < 8 ? 2 : 1]);
    }
    t.rect(X - 8, beltY, 16, 3, PLUM[1]);
    t.hline(X - 8, beltY, 16, PLUM[2]);
    lit(t, PLUM, HI, LO, (l) => l.rect(X + 2, beltY + 2, 5, 6, INK));
    t.set(X + 4, beltY + 4, BONE[2]);
  });
  over.set(b.mid, sy + 9 + b.lean(b.mid), STEEL[3]);

  // the head: a band round the brow, short dark hair, a beard grey with dust
  const ey = face(head, b);
  beard(head, b, ey, DUST, 9);
  crown(head, b, IRON, -2);
  const by = Math.round(b.cy) - 3;
  for (const [x, y] of inEllipse(b.cx, b.cy, b.r + 0.7, b.r + 0.7)) if (y === by || y === by + 1) head.set(x, y, TEAL[y === by ? 3 : 2]);
  head.rect(Math.round(b.cx - b.r - 2), by + 1, 2, 4, TEAL[2]);

  // the chisel: bright where it has been ground
  limb(front, fHand[0], fHand[1] + 2, fHand[0] + 1, fHand[1] - 9, 1.1, 1.3, STEEL);
  over.hline(Math.round(fHand[0]), Math.round(fHand[1]) - 10, 3, HOT);
  lights.push({ x: fHand[0] + 1.5, y: fHand[1] - 10, r: 6, color: SPARK[2], a: 0.4 });
  hand(front, fHand[0], fHand[1]);
  // the nearer arm hangs, the mallet in it: its head low and forward
  const nHand: V = [X - 12, beltY + 4];
  armTo(front, b.near, nHand, DUST, SKIN, 3.1, -1, 7.5, 7.5);
  hammer(front, nHand, 224, 8, 10, 7, PLUM, WOOD);
  hand(front, nHand[0], nHand[1]);
  // (chips and dust at his feet)
  for (const [dx, dy] of [[-17, -2], [-9, 1], [9, 0], [13, -3], [-21, -5]] as const) over.set(X + dx, KAY + dy, STONE[3]);

  return { px: compose(null, [back, body, head, front], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 4. The stone man: not a man who cuts runes, but a thing of cut runes that walks.

function stoneMan(): Painted {
  const b = build(43, 25, 0, 9.5, 6.5);
  const { X, sy, beltY } = b;
  const lights: Light[] = [];
  const body = layer();
  const head = layer();
  const front = layer();
  const over = layer();
  const PALE: Ramp = blend(STONE, BONE, 0.35);

  // the legs: two pillars of two blocks, the nearer one lower on the screen
  const pillar = (x0: number, top: number, sole: number, far: boolean): void => {
    const r = far ? dim(STONE) : STONE;
    lit(body, r, HI, LO, (l) => {
      l.rect(x0, top, 7, sole - top - 3, INK);
      l.rect(x0 - 1, sole - 4, 10, 5, INK);
    });
    body.hline(x0, Math.round((top + sole) / 2) - 1, 7, INK);
    over.set(x0 + 3, Math.round((top + sole) / 2) - 1, CYAN[far ? 1 : 2]);
  };
  pillar(X + 2, beltY + 2, KAY - 3, true);
  pillar(X - 8, beltY + 3, KAY - 1, false);

  // the further arm: bent up, the hand open, and over it a rune stone hangs in the air
  const fHand: V = [X + 14, sy + 9];
  const fElbow = armTo(body, b.far, fHand, dim(STONE), dim(STONE), 3.9, 1, 8, 8);
  lit(body, dim(STONE), HI, LO, (l) => l.rect(Math.round(fHand[0]) - 3, Math.round(fHand[1]) - 3, 7, 6, INK));
  over.set(Math.round(fElbow[0]), Math.round(fElbow[1]), CYAN[2]);

  // the trunk: three courses of blocks. The joints between them hold a little light, and each block of the middle course a rune.
  const c1 = sy + 6;
  const c2 = sy + 13;
  turned(body, b, false, (t) => {
    lit(t, STONE, HI, LO, (l) => l.poly([[X - 10, sy + 1], [X - 8, sy - 1], [X + 8, sy - 1], [X + 10, sy + 1], [X + 9, beltY + 4], [X - 9, beltY + 4]], INK));
    for (const y of [c1, c2]) for (let x = X - 10; x <= X + 10; x++) mark(t, x, y, INK);
    for (const [x, y0, y1] of [[X - 1, sy, c1], [X - 5, c1 + 1, c2], [X + 4, c1 + 1, c2], [X + 1, c2 + 1, beltY + 4]] as const) for (let y = y0; y < y1; y++) mark(t, x, y, INK);
  });
  for (let x = X - 4; x <= X + 9; x++) if (x % 2 === 0) over.set(x, c1 + b.lean(x), CYAN[1]);
  for (const [k, x] of [[0, X - 9], [3, X - 2], [5, X + 6]] as const) glowRune(over, lights, k, x, c1 + 2 + b.lean(x + 1), x === X - 2 ? 0.4 : 0.22, x === X - 2 ? SPARK[4] : SPARK[2]);
  // (a crack down the lowest course, and moss on the shoulder nearest us)
  for (let i = 0; i < 6; i++) mark(body, X - 6 + (i % 2), c2 + 2 + i + b.lean(X - 6), INK);
  for (const [dx, dy, c] of [[-9, 0, LEAF[2]], [-8, -1, LEAF[3]], [-7, -1, LEAF[2]], [-9, 1, LEAF[1]], [-6, -1, LEAF[2]], [-8, 0, LEAF[2]], [-7, 0, LEAF[1]]] as const) mark(body, X + dx, sy + 1 + dy + b.lean(X + dx), c);

  // the head: one block, a rune cut in its brow, and no face but the two lights
  turned(head, b, false, (t) => {
    lit(t, PALE, HI, LO, (l) => l.poly([[b.cx - 6.5, b.cy - 5], [b.cx - 4.5, b.cy - 7], [b.cx + 5.5, b.cy - 7], [b.cx + 7.5, b.cy - 5], [b.cx + 7.5, b.cy + 6], [b.cx + 5.5, b.cy + 8], [b.cx - 4.5, b.cy + 8], [b.cx - 6.5, b.cy + 6]], INK));
    const ey = Math.round(b.cy) + 2;
    for (let x = Math.round(b.cx - 6); x <= Math.round(b.cx + 7); x++) {
      mark(t, x, ey, INK);
      mark(t, x, ey - 1, INK);
    }
    for (let x = Math.round(b.cx - 2); x <= Math.round(b.cx + 3); x++) mark(t, x, Math.round(b.cy) + 6, STONE[0]);
  });
  const eyeY = Math.round(b.cy) + 2;
  head.set(b.fx - 2, eyeY + b.lean(b.fx - 2), GLINT).set(b.fx + 2, eyeY + b.lean(b.fx + 2), GLINT);
  glowRune(over, lights, 2, b.fx - 1, Math.round(b.cy) - 6 + b.lean(b.fx), 0.4, SPARK[4]);
  for (const [dx, dy, c] of [[-5, -7, LEAF[2]], [-4, -8, LEAF[3]], [-3, -8, LEAF[2]], [-6, -6, LEAF[1]], [-4, -7, LEAF[2]], [-3, -7, LEAF[1]]] as const) head.set(Math.round(b.cx) + dx, Math.round(b.cy) + dy + b.lean(Math.round(b.cx) + dx) + 1, c);

  // the nearer arm hangs: an arm of two blocks and a fist like a mason's maul
  const nHand: V = [X - 14, beltY + 6];
  const nElbow = armTo(front, b.near, nHand, STONE, STONE, 4, -1, 8.5, 8.5);
  lit(front, STONE, HI, LO, (l) => l.rect(Math.round(nHand[0]) - 4, Math.round(nHand[1]) - 2, 8, 7, INK));
  over.set(Math.round(nElbow[0]), Math.round(nElbow[1]), CYAN[2]);
  front.hline(Math.round(nHand[0]) - 4, Math.round(nHand[1]) + 1, 8, STONE[0]);

  // the rune stone over the open hand, and the grit that goes round it
  const sxx = fHand[0] + 1;
  const syy = fHand[1] - 14;
  lit(front, PALE, HI, LO, (l) => l.poly([[sxx - 4, syy - 5], [sxx + 2, syy - 6], [sxx + 5, syy - 2], [sxx + 4, syy + 5], [sxx - 2, syy + 6], [sxx - 5, syy + 1]], INK));
  glowGreat(over, lights, 3, sxx - 2, syy - 3, 0.55, 14);
  for (const [dx, dy] of [[-8, 3], [8, -4], [7, 6], [-7, -6]] as const) over.set(Math.round(sxx + dx), Math.round(syy + dy), dx > 0 ? SPARK[2] : STONE[3]);

  return { px: compose(null, [body, head, front], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 5. The skald: his words are sung. A pelt on his shoulders, a stave cut with runes.

function skald(): Painted {
  const b = build(42, 25, 14, 8, 6);
  const { X, sy, beltY } = b;
  const lights: Light[] = [];
  const back = layer();
  const body = layer();
  const mantle = layer();
  const head = layer();
  const front = layer();
  const over = layer();

  // a cloak down his back to the calf (it hangs behind him: its hem runs the way his shoulders do)
  {
    const t = layer();
    lit(t, TEAL, HI, LO, (l) => {
      for (let y = sy + 2; y <= KAY - 7; y++) {
        const half = 10 + ((y - sy) * 5) / (KAY - 7 - sy);
        for (let x = Math.round(X - half); x < Math.round(X + half); x++) if (y <= KAY - 8 - Math.floor(hash(x, 3) * 3)) l.set(x, y, INK);
      }
    });
    for (const dx of [-11, 10]) for (let y = sy + 12; y < KAY - 10; y++) mark(t, X + dx + Math.round(((y - sy) * dx) / 90), y, TEAL[1]);
    shear(t, along(X, -1), back);
  }

  legs(body, boots(INDIGO, PLUM, 5, 0.5, BONE), KAY - 17);

  // the further arm: lifted a little from his side, the hand open, as a man's is who is telling a thing
  const fHand: V = [X + 13, sy + 11];
  armTo(body, b.far, fHand, dim(MAIL), dim(PLUM), 3, 1, 7.5, 7.5);

  // a tunic to the knee with a woven border, a belt, a horn hung from it
  turned(body, b, false, (t) => {
    lit(t, MAIL, HI, LO, (l) => l.poly([[X - 8, sy + 1], [X - 6, sy - 1], [X + 6, sy - 1], [X + 8, sy + 1], [X + 8, KAY - 15], [X - 8, KAY - 15]], INK));
    for (let x = X - 8; x < X + 8; x++) {
      mark(t, x, KAY - 16, (x - X + 40) % 4 < 2 ? TEAL[3] : BONE[2]);
      mark(t, x, KAY - 17, (x - X + 40) % 4 < 2 ? BONE[2] : TEAL[3]);
    }
    t.rect(X - 8, beltY, 16, 3, PLUM[1]);
    t.hline(X - 8, beltY, 16, PLUM[2]);
    t.rect(b.mid - 1, beltY, 3, 3, STEEL[3]);
    t.set(b.mid, beltY + 1, CYAN[2]);
  });
  lit(body, BONE, HI, LO, (l) => stroke(l, [[X + 3, beltY + 4], [X + 8, beltY + 5], [X + 9, beltY + 10], [X + 6, beltY + 14]], (t) => 2.5 - 1.9 * t));
  body.set(X + 3, beltY + 3, STEEL[3]).set(X + 2, beltY + 4, STEEL[3]);

  // the pelt: pale, across both shoulders, ragged below
  turned(mantle, b, false, (t) => {
    lit(t, BONE, HI, LO, (l) => {
      for (let x = X - 13; x <= X + 13; x++) {
        const e = Math.abs(x + 0.5 - X) / 13.5;
        const y0 = sy - 2 + Math.round(e * e * 4);
        const y1 = sy + 5 + Math.round(e * 7) - (hash(x, 9) < 0.4 ? 2 : 0) + (hash(x, 11) < 0.3 ? 1 : 0);
        for (let y = y0; y <= y1; y++) l.set(x, y, INK);
      }
    });
    for (let x = X - 12; x <= X + 12; x += 2) mark(t, x, sy + 2 + Math.floor(hash(x, 13) * 4), BONE[1]);
    for (let x = X - 12; x <= X + 12; x += 3) mark(t, x, sy + 6 + Math.floor(hash(x, 17) * 4), BONE[1]);
  });

  // the head: yellow hair to the shoulders, a band of steel with a stone in it, a beard in two plaits
  for (const [x0, y0, n] of [[b.cx - b.r - 1.5, b.cy - 1, 11], [b.cx + b.r - 1.5, b.cy + 1, 8]] as const) lit(head, dim(GOLDEN), HI, LO, (l) => l.rect(Math.round(x0), Math.round(y0), 3, n, INK));
  const ey = face(head, b);
  crown(head, b, GOLDEN, -2, 0.8, 4);
  const cy = Math.round(b.cy) - 3;
  for (const [x, y] of inEllipse(b.cx, b.cy, b.r + 0.8, b.r + 0.8)) if (y === cy) head.set(x, y, STEEL[x < b.cx ? 3 : 2]);
  head.set(b.fx, cy, CYAN[2]);
  over.set(b.fx, cy, SPARK[3]);
  // (the beard: full under the nose and round the jaw, then the two plaits, each tied with a bead)
  lit(head, GOLDEN, HI, LO, (l) => l.poly([[b.fx - 6, ey + 1], [b.fx - 2, ey + 3], [b.fx + 2, ey + 3], [b.fx + 5, ey + 1], [b.fx + 5, ey + 6], [b.fx + 3, ey + 8], [b.fx - 4, ey + 8], [b.fx - 6, ey + 6]], INK));
  for (const x0 of [b.fx - 4, b.fx + 2]) {
    for (let i = 0; i < 10; i++) head.rect(x0, ey + 8 + i, 2, 1, GOLDEN[Math.floor(i / 2) % 2 ? 2 : 3]);
    head.rect(x0, ey + 18, 2, 2, CYAN[2]);
    over.set(x0, ey + 18, SPARK[3]);
  }

  // the stave in the nearer hand: taller than he is, a ring at its head, runes cut all down it
  const nHand: V = [X - 14, sy + 14];
  const stx = X - 15;
  limb(front, stx, KAY - 1, stx, sy - 22, 1.35, 1.35, PLUM);
  lit(front, STEEL, HI, LO, (l) => {
    for (const [x, y] of inEllipse(stx, sy - 27, 5, 5)) if (Math.hypot(x + 0.5 - stx, y + 0.5 - (sy - 27)) > 2.6) l.set(x, y, INK);
  });
  glowRune(over, lights, 4, stx - 2, sy - 30, 0.5, SPARK[4]);
  lights.push({ x: stx, y: sy - 27, r: 12, color: SPARK[2], a: 0.3 });
  for (let k = 0; k < 9; k++) {
    const y = sy - 16 + k * 6;
    const on = k === 2 || k === 5;
    front.set(stx - 1, y, on ? SPARK[3] : CYAN[1]).set(stx, y + 1, on ? SPARK[3] : CYAN[1]);
    if (on) lights.push({ x: stx, y: y + 0.5, r: 5, color: SPARK[2], a: 0.3 });
  }
  armTo(front, b.near, nHand, MAIL, PLUM, 3, -1, 7.5, 7.5);
  hand(front, nHand[0], nHand[1]);
  const hands = layer();
  hand(hands, fHand[0], fHand[1]);

  // the song: three runes leave his mouth and rise, each fainter than the last
  for (const [k, dx, dy, c, a] of [[1, 8, -1, SPARK[4], 0.5], [6, 12, -9, SPARK[3], 0.36], [7, 13, -18, CYAN[2], 0.2]] as const) {
    rune(over, k, b.fx + dx, ey + dy, c);
    lights.push({ x: b.fx + dx + 1.5, y: ey + dy + 2.5, r: 7, color: SPARK[2], a });
  }

  return { px: compose(null, [back, body, front, mantle, head, hands], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 6. The printer: words are cast in metal and pressed. He holds up the sheet he has just pulled.

function printer(): Painted {
  const b = build(43, 25, 12, 6.5, 5.5);
  const { X, sy, beltY } = b;
  const lights: Light[] = [];
  const back = layer();
  const body = layer();
  const head = layer();
  const front = layer();
  const over = layer();

  legs(body, boots(MAIL, PLUM, 4, 0.24), KAY - 17);

  // the further arm hangs: in the hand the roller he inks the type with
  const fHand: V = [X + 11, beltY + 3];
  const fElbow = armTo(body, b.far, fHand, dim(BONE), dim(SKIN), 2.7, 1, 7.5, 7.5);
  body.rect(Math.round(fElbow[0]) - 2, Math.round(fElbow[1]) - 2, 5, 2, PINK[1]);

  // a white shirt, and the apron black with ink: a bib and a skirt to the knee
  turned(body, b, false, (t) => {
    lit(t, BONE, HI, LO, (l) => l.poly([[X - 6.5, sy + 1], [X - 5, sy - 1], [X + 5, sy - 1], [X + 6.5, sy + 1], [X + 6, beltY + 8], [X - 6, beltY + 8]], INK));
    lit(t, INKED, HI, LO, (l) => {
      l.rect(X - 4, sy + 6, 8, beltY - sy - 6, INK);
      l.poly([[X - 6, beltY], [X + 6, beltY], [X + 7, KAY - 13], [X - 7, KAY - 13]], INK);
    });
    for (const x of [X - 4, X + 3]) t.vline(x, sy, 6, INKED[2]);
    t.hline(X - 6, beltY, 12, INKED[0]);
    // (a pocket, and the composing stick in it)
    t.rect(X - 1, beltY + 6, 6, 1, INKED[0]);
    t.vline(X + 1, beltY + 3, 4, STEEL[3]).vline(X + 2, beltY + 4, 3, STEEL[2]);
  });
  // (the rune of the last sheet, printed off on his bib, and ink where his hands have been wiped)
  greatRune(body, 4, b.mid - 3, sy + 8 + b.lean(b.mid), CYAN[2]);
  for (const [dx, dy] of [[-4, 9], [-3, 11], [-5, 13], [4, 12]] as const) mark(body, X + dx, beltY + dy + b.lean(X + dx), CYAN[1]);

  // the head: hair parted and oiled, a moustache, and the green shade a printer wears over his eyes
  const ey = face(head, b, SKIN, true);
  crown(head, b, INDIGO, -3, 0.5, 4);
  head.hline(b.fx - 3, ey + 3, 6, INDIGO[1]);
  head.set(b.fx - 4, ey + 4, INDIGO[1]).set(b.fx + 3, ey + 4, INDIGO[1]);
  lit(head, LEAF, HI, LO, (l) => l.poly([[b.cx - b.r - 0.5, b.cy - 3], [b.fx + 2, b.cy - 3.5], [b.fx + 9, b.cy - 1], [b.fx + 8, b.cy], [b.cx - b.r - 0.5, b.cy - 1]], INK));
  head.hline(Math.round(b.cx - b.r), Math.round(b.cy) - 4, Math.round(b.r * 2), PLUM[1]);

  // the roller: a drum of ink on a fork and a handle
  const rx = Math.round(fHand[0]) + 1;
  const ry = Math.round(fHand[1]) + 7;
  front.vline(rx, Math.round(fHand[1]) + 1, 4, PLUM[2]);
  front.rect(rx - 4, ry - 2, 1, 4, STEEL[2]).rect(rx + 4, ry - 2, 1, 4, STEEL[2]).hline(rx - 4, ry - 3, 9, STEEL[3]);
  lit(front, INKED, HI, LO, (l) => l.rect(rx - 3, ry, 7, 5, INK));
  over.hline(rx - 3, ry + 4, 7, CYAN[2]);
  over.set(rx - 1, ry + 6, CYAN[2]).set(rx + 2, ry + 7, CYAN[1]);
  hand(front, fHand[0], fHand[1], INKED);

  // the sheet he has just pulled, held up by one corner: a great rune at its head and lines of small ones under it, the ink still alight
  // (it hangs flat, its face toward us and its top running up the screen to the left, away from him)
  const nHand: V = [X - 12, sy + 9];
  {
    const t = layer();
    const x0 = X - 26;
    const y0 = sy + 7;
    lit(t, BONE, HI, LO, (l) => {
      l.rect(x0, y0, 14, 22, INK);
    });
    // (a corner that has curled)
    t.erase(x0, y0 + 21).erase(x0 + 1, y0 + 21).erase(x0, y0 + 20);
    t.set(x0 + 1, y0 + 20, BONE[1]).set(x0 + 2, y0 + 21, BONE[1]);
    for (const [a, c, d, e] of GREAT[4]) {
      for (const o of [0, 1]) t.line(x0 + 2 + a * 2 + o, y0 + 2 + Math.round(c * 1.3), x0 + 2 + d * 2 + o, y0 + 2 + Math.round(e * 1.3), o ? SPARK[2] : SPARK[3]);
    }
    for (let k = 0; k < 4; k++) for (let x = x0 + 2; x < x0 + 12; x++) if ((x * 3 + k * 5) % 7 > 1) t.set(x, y0 + 13 + k * 2, k === 1 ? CYAN[2] : INDIGO[2]);
    shear(t, along(X - 13, 1), back);
  }
  lights.push({ x: X - 20, y: sy + 9, r: 13, color: SPARK[2], a: 0.5 });
  const nElbow = armTo(front, b.near, nHand, BONE, SKIN, 2.8, -1, 6.5, 6.5);
  front.rect(Math.round(nElbow[0]) - 2, Math.round(nElbow[1]) - 3, 5, 2, PINK[2]);
  // (his fingers are black with it)
  hand(front, nHand[0], nHand[1], INKED);

  return { px: compose(null, [back, body, head, front], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 7. The marked one: he keeps no book. Every word he knows is written in his skin.

function marked(): Painted {
  const b = build(43, 26, 6, 6.5, 5.5);
  const { X, sy, beltY, hem } = b;
  const lights: Light[] = [];
  const back = layer();
  const body = layer();
  const head = layer();
  const front = layer();
  const over = layer();

  // (a long tail of hair down his back, from the knot on his crown)
  lit(back, IRON, HI, LO, (l) => stroke(l, [[b.cx - 3, b.cy - 4], [b.cx - 9, b.cy + 2], [b.cx - 8, b.cy + 12], [b.cx - 11, b.cy + 22]], (t) => 1.8 - t * 0.9));
  back.rect(Math.round(b.cx) - 12, Math.round(b.cy) + 21, 2, 2, CYAN[2]);

  // bare feet under the hem of the wrap
  const bare: LegStyle = { w: 3, upper: DUSK, lower: DUSK, share: 0.3, cuff: false, knee: null, band: null };
  leg(body, KX + 1, hem - 3, KAY - 3, true, bare, STAND, 3, 1);
  leg(body, KX - 4, hem - 2, KAY - 1, false, bare, STAND, 3, 1);

  // the further arm hangs: in its hand a brush, its tip wet with light
  const fHand: V = [X + 10, beltY + 4];
  const fElbow = armTo(body, b.far, fHand, dim(DUSK), dim(DUSK), 2.6, 1, 8, 8);
  for (const k of [0.3, 0.6]) {
    mark(body, b.far[0] + (fElbow[0] - b.far[0]) * k + 1, b.far[1] + (fElbow[1] - b.far[1]) * k, CYAN[2]);
    mark(body, fElbow[0] + (fHand[0] - fElbow[0]) * k, fElbow[1] + (fHand[1] - fElbow[1]) * k, CYAN[2]);
  }

  // the chest is bare; from the waist a long wrap of ink blue, a sash with one end hanging
  turned(body, b, true, (t) => {
    lit(t, DUSK, HI, LO, (l) => l.poly([[X - 6.5, sy + 1], [X - 5, sy - 1], [X + 5, sy - 1], [X + 6.5, sy + 1], [X + 5, beltY + 1], [X - 5, beltY + 1]], INK));
    lit(t, INDIGO, HI, [LO[0], LO[1] + 1], (l) => l.poly([[X - 5.5, beltY], [X + 5.5, beltY], [X + 8, hem], [X - 8, hem]], INK));
    for (let y = beltY + 5; y < hem - 1; y++) mark(t, b.mid + 2 + Math.round((y - beltY) / 9), y, INDIGO[1]);
    t.rect(X - 6, beltY - 1, 12, 3, PINK[2]);
    t.hline(X - 6, beltY - 1, 12, PINK[3]);
    t.hline(X - 6, beltY + 1, 12, PINK[1]);
    for (let i = 0; i < 11; i++) t.rect(X - 4, beltY + 2 + i, 3, 1, i > 8 ? PINK[3] : PINK[2]);
    for (let x = X - 8; x <= X + 8; x++) mark(t, x, hem - 2, (x + 40) % 3 ? CYAN[2] : INDIGO[3]);
  });
  // (the writing: down the breastbone, and in lines round the ribs)
  for (let k = 0; k < 3; k++) glowRune(over, lights, k + 1, b.mid - 2, sy + 2 + k * 6 + b.lean(b.mid), k === 1 ? 0.4 : 0.26, k === 1 ? SPARK[4] : SPARK[3]);
  for (const [dx, dy, n] of [[-5, 5, 3], [-6, 8, 4], [-5, 11, 3], [3, 4, 3], [3, 7, 4], [2, 10, 4]] as const) for (let i = 0; i < n; i++) if (i !== 1 || n === 3) over.set(X + dx + i, sy + dy + b.lean(X + dx + i), CYAN[2]);

  // the head: shaved but for the knot, the eyes deep, a line drawn from the crown down the brow
  const ey = face(head, b, DUSK);
  ball(head, b.cx - 1, b.cy - b.r - 1.5, 2.4, 2.2, IRON);
  head.hline(b.fx - 2, ey + 4, 4, DUSK[1]);
  for (let y = Math.round(b.cy - b.r) + 1; y <= ey - 2; y++) over.set(b.fx - 1, y, y % 2 ? SPARK[3] : SPARK[4]);
  over.set(b.fx - 5, ey + 2, SPARK[3]).set(b.fx + 4, ey + 2, SPARK[3]).set(b.fx - 5, ey + 3, CYAN[2]).set(b.fx + 4, ey + 3, CYAN[2]);
  lights.push({ x: b.fx, y: ey - 3, r: 7, color: SPARK[2], a: 0.34 });

  // the brush
  limb(front, fHand[0], fHand[1] - 5, fHand[0] + 1, fHand[1] + 8, 0.9, 0.9, PLUM);
  over.rect(Math.round(fHand[0]), Math.round(fHand[1]) + 8, 2, 3, SPARK[3]);
  over.set(Math.round(fHand[0]) + 1, Math.round(fHand[1]) + 13, SPARK[2]);
  lights.push({ x: fHand[0] + 1, y: fHand[1] + 10, r: 7, color: SPARK[2], a: 0.4 });
  hand(front, fHand[0], fHand[1], dim(DUSK));

  // the nearer hand is held out, palm up, and the word he has just written stands over it
  const nHand: V = [X - 12, sy + 13];
  const nElbow = armTo(front, b.near, nHand, DUSK, DUSK, 2.7, -1, 8, 8);
  for (const k of [0.25, 0.5, 0.75]) {
    const x = b.near[0] + (nElbow[0] - b.near[0]) * k;
    const y = b.near[1] + (nElbow[1] - b.near[1]) * k;
    over.set(Math.round(x), Math.round(y), SPARK[3]);
    mark(front, x + 1, y, CYAN[2]);
  }
  for (const k of [0.3, 0.6]) over.set(Math.round(nElbow[0] + (nHand[0] - nElbow[0]) * k), Math.round(nElbow[1] + (nHand[1] - nElbow[1]) * k), SPARK[3]);
  hand(front, nHand[0], nHand[1], DUSK);
  glowGreat(over, lights, 5, nHand[0] - 3, nHand[1] - 13, 0.6, 15);
  for (const [dx, dy] of [[-6, -6], [5, -10], [4, -3]] as const) over.set(Math.round(nHand[0] + dx), Math.round(nHand[1] + dy), SPARK[2]);

  return { px: compose(null, [back, body, head, front], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 8. The archivist: blindfolded, he knows every word in the stacks by touch. A lantern for you, not for him.

function archivist(): Painted {
  const b = build(45, 27, 3, 7, 5.5);
  const { X, sy, beltY, hem } = b;
  const lights: Light[] = [];
  const body = layer();
  const head = layer();
  const front = layer();
  const over = layer();

  // the toes of his boots under the coat
  const shod = boots(IRON, IRON, 4, 0.5);
  leg(body, KX + 1, hem - 3, KAY - 3, true, shod, STAND, 3, 1);
  leg(body, KX - 5, hem - 2, KAY - 1, false, shod, STAND, 3, 1);

  // the further arm holds the lantern out
  const fHand: V = [X + 14, sy + 13];
  armTo(body, b.far, fHand, dim(PLUM), dim(PLUM), 2.9, 1, 8, 8);

  // the long coat, buttoned to a high collar; two rows of pockets down it, a scroll in each
  turned(body, b, true, (t) => {
    lit(t, PLUM, HI, [LO[0], LO[1] + 1], (l) => l.poly([[X - 7, sy + 1], [X - 5, sy - 2], [X + 5, sy - 2], [X + 7, sy + 1], [X + 6, beltY], [X + 9, hem], [X - 9, hem], [X - 6, beltY]], INK));
    for (let y = sy + 2; y < hem - 1; y++) mark(t, b.mid + Math.round(Math.max(0, y - beltY) / 12), y, PLUM[1]);
    for (let k = 0; k < 4; k++) t.set(b.mid - 1, sy + 4 + k * 5, STEEL[3]);
    t.rect(X - 6, beltY, 12, 2, IRON[2]);
    t.set(b.mid, beltY, STEEL[3]).set(b.mid, beltY + 1, STEEL[2]);
    for (let row = 0; row < 2; row++) {
      for (const dx of [-6, -1, 5]) {
        const x = X + dx + (row === 1 ? (dx < 0 ? -1 : 1) : 0);
        const y = beltY + 6 + row * 9;
        // (a pocket: its flap a dark line, and the end of the scroll that stands up out of it)
        t.rect(x - 1, y + 3, 5, 1, PLUM[0]);
        t.rect(x - 1, y + 4, 5, 3, PLUM[1]);
        t.rect(x, y, 3, 3, BONE[3]);
        t.set(x + 1, y + 1, BONE[1]);
        t.hline(x, y + 2, 3, BONE[2]);
      }
    }
  });
  for (const [x, y] of [[X - 1, beltY + 6], [X + 6, beltY + 15]] as const) {
    over.set(x + 1, y + 1 + Math.round(b.fall(x + 1, y + 1)), SPARK[3]);
    lights.push({ x: x + 1.5, y: y + 1.5, r: 5, color: SPARK[2], a: 0.3 });
  }

  // the head: bald, a pointed beard, and a dark band over his eyes with one rune sewn into it
  // (the collar of the coat stands up behind his jaw)
  lit(head, PLUM, HI, LO, (l) => l.poly([[b.cx - 6, b.chin - 2], [b.cx + 7, b.chin - 4], [b.cx + 7, b.chin + 2], [b.cx - 6, b.chin + 4]], INK));
  ball(head, b.cx, b.cy, b.r, b.r + 0.3, SKIN);
  const ey = Math.round(b.cy) + 1;
  head.rect(b.fx - 1, ey + 1, 2, 2, SKIN[3]);
  lit(head, BONE, HI, LO, (l) => l.poly([[b.fx - 3, ey + 4], [b.fx + 2, ey + 4], [b.fx + 1, ey + 7], [b.fx - 1, ey + 8], [b.fx - 2, ey + 7]], INK));
  for (const [x, y] of inEllipse(b.cx, b.cy, b.r + 0.6, b.r + 0.9)) if (y >= ey - 2 && y <= ey) head.set(x, y, INDIGO[y === ey - 2 ? 3 : y === ey ? 1 : 2]);
  // (its knot and its ends, behind the head)
  head.rect(Math.round(b.cx - b.r - 2), ey - 2, 2, 3, INDIGO[2]);
  head.rect(Math.round(b.cx - b.r - 3), ey + 1, 2, 5, INDIGO[1]);
  head.rect(Math.round(b.cx - b.r - 1), ey + 1, 1, 4, INDIGO[2]);
  over.set(b.fx, ey - 2, SPARK[3]).set(b.fx - 1, ey - 1, SPARK[4]).set(b.fx + 1, ey - 1, SPARK[4]).set(b.fx, ey, SPARK[3]);
  lights.push({ x: b.fx + 0.5, y: ey - 0.5, r: 7, color: SPARK[2], a: 0.42 });

  // the lantern: a cage of iron on a ring, and in it not a flame but a word
  const lx = Math.round(fHand[0]);
  const ly = Math.round(fHand[1]) + 5;
  front.vline(lx, Math.round(fHand[1]) + 1, 4, STEEL[2]);
  lit(front, IRON, HI, LO, (l) => {
    l.poly([[lx - 2, ly], [lx + 3, ly], [lx + 5, ly + 3], [lx - 4, ly + 3]], INK);
    l.rect(lx - 4, ly + 12, 9, 2, INK);
    for (const x of [lx - 4, lx, lx + 4]) l.rect(x, ly + 3, 1, 9, INK);
  });
  over.rect(lx - 3, ly + 4, 3, 8, CYAN[1]);
  over.rect(lx + 1, ly + 4, 3, 8, CYAN[1]);
  rune(over, 6, lx - 1, ly + 5, HOT);
  lights.push({ x: lx + 0.5, y: ly + 8, r: 20, color: SPARK[2], a: 0.6 });
  hand(front, fHand[0], fHand[1]);

  // the nearer hand rests on the great book chained at his hip
  const nHand: V = [X - 10, beltY + 6];
  armTo(front, b.near, nHand, PLUM, PLUM, 3, -1, 8, 8);
  for (let k = 0; k < 5; k++) front.set(X - 8 - k, beltY + 1 + k + (k % 2), STEEL[k % 2 ? 2 : 3]);
  // (its cover toward us, its pages a pale edge along the top and the nearer side)
  lit(front, TEAL, HI, LO, (l) => l.poly([[X - 18, beltY + 5], [X - 8, beltY + 10], [X - 8, beltY + 22], [X - 18, beltY + 17]], INK));
  for (let i = 0; i < 10; i++) front.set(X - 18 + i, beltY + 5 + Math.floor(i / 2), BONE[3]);
  for (let i = 0; i < 11; i++) front.set(X - 8, beltY + 11 + i, BONE[i % 3 ? 3 : 2]);
  front.rect(X - 15, beltY + 11, 4, 4, STEEL[3]);
  front.set(X - 14, beltY + 12, CYAN[2]).set(X - 13, beltY + 13, CYAN[2]);
  hand(front, nHand[0], nHand[1] + 1);

  return { px: compose(null, [body, head, front], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 9. The engraver: short and wide, a beard to his boots, and the finest hand in the trade.

function engraver(): Painted {
  const b = build(29, 15, 9, 9.5, 7);
  const { X, sy, beltY } = b;
  const lights: Light[] = [];
  const body = layer();
  const head = layer();
  const front = layer();
  const over = layer();

  legs(body, boots(MAIL, PLUM, 6, 0.6), KAY - 10);

  // the further arm holds a tablet of slate against his chest
  const fHand: V = [X + 12, sy + 13];
  armTo(body, b.far, fHand, dim(TEAL), dim(TEAL), 3.4, 1, 6, 6);

  // a jerkin, a belt of tools
  turned(body, b, false, (t) => {
    lit(t, TEAL, HI, LO, (l) => l.poly([[X - 9.5, sy + 1], [X - 7, sy - 1], [X + 7, sy - 1], [X + 9.5, sy + 1], [X + 10, KAY - 9], [X - 10, KAY - 9]], INK));
    t.rect(X - 10, beltY, 20, 3, PLUM[1]);
    t.hline(X - 10, beltY, 20, PLUM[2]);
    for (const dx of [-9, -7]) t.vline(X + dx, beltY + 1, 5, STEEL[dx === -9 ? 3 : 2]);
  });

  // the head: a leather cap, a nose like a knuckle, and over one eye the glass he cuts by
  const ey = face(head, b);
  head.rect(b.fx - 2, ey + 1, 4, 3, SKIN[3]);
  head.set(b.fx + 1, ey + 3, SKIN[2]);
  crown(head, b, PLUM, -2, 0.8, 3);
  head.hline(Math.round(b.cx - b.r), Math.round(b.cy) - 3, Math.round(b.r * 2) + 1, PLUM[1]);
  head.rect(b.fx + 1, ey - 2, 4, 4, STEEL[2]);
  head.rect(b.fx + 2, ey - 1, 2, 2, SPARK[3]);
  over.set(b.fx + 2, ey - 1, HOT);
  lights.push({ x: b.fx + 3, y: ey, r: 6, color: SPARK[2], a: 0.4 });

  // the beard: red, from under his nose to his knees, parted below into three plaits, a rune stone tied into the end of each
  const bx = b.cx + 1.5;
  lit(head, RED, HI, LO, (l) => l.poly([[bx - b.r - 1, ey + 2], [b.fx - 2, ey + 4], [b.fx + 2, ey + 4], [bx + b.r, ey + 2], [bx + b.r + 1, ey + 10], [bx + b.r - 1, ey + 15], [bx - b.r, ey + 15], [bx - b.r - 2, ey + 10]], INK));
  head.hline(b.fx - 3, ey + 4, 6, RED[3]);
  for (const [k, dx] of [[0, -6], [1, -1.5], [2, 3]] as const) {
    const x = Math.round(bx + dx);
    const n = k === 1 ? 9 : 6;
    lit(head, RED, HI, LO, (l) => l.rect(x, ey + 14, 4, n, INK));
    // (the tie that binds it, and the stone that weighs it)
    head.rect(x, ey + 14 + n - 2, 4, 1, STEEL[3]);
    lit(head, IRON, HI, LO, (l) => l.rect(x - 1, ey + 14 + n, 6, 7, INK));
    rune(over, k + 3, x + 1, ey + 15 + n, k === 1 ? SPARK[4] : SPARK[3]);
    lights.push({ x: x + 2, y: ey + 17 + n, r: 4, color: SPARK[2], a: k === 1 ? 0.3 : 0.18 });
  }
  // (the locks of it)
  for (const [dx, y0, n] of [[-4, 6, 7], [0, 7, 6], [4, 6, 7]] as const) for (let i = 0; i < n; i++) mark(head, bx + dx, ey + y0 + i, RED[1]);

  // the tablet, and the rune half cut in it
  lit(front, STONE, HI, LO, (l) => l.poly([[X + 8, sy + 8], [X + 18, sy + 3], [X + 19, sy + 15], [X + 9, sy + 20]], INK));
  over.line(X + 12, sy + 8, X + 12, sy + 15, SPARK[3]).line(X + 12, sy + 8, X + 16, sy + 9, SPARK[3]);
  over.set(X + 16, sy + 9, HOT);
  lights.push({ x: X + 14, y: sy + 11, r: 8, color: SPARK[2], a: 0.36 });
  hand(front, fHand[0] + 3, fHand[1] + 3, dim(SKIN));

  // the nearer arm is lifted: a hammer no bigger than a thumb
  const nHand: V = [X - 14, sy + 6];
  armTo(front, b.near, nHand, TEAL, SKIN, 3.4, -1, 6, 6);
  hammer(front, nHand, 70, 6, 7, 5, PLUM, STEEL);
  hand(front, nHand[0], nHand[1]);
  for (const [dx, dy] of [[-12, -3], [20, 0], [22, -4]] as const) over.set(X + dx, KAY + dy, STONE[3]);

  return { px: compose(null, [body, head, front], over), lights };
}

// ---------------------------------------------------------------------------------------------
// 10. The weaver: every word is a thread, and the band that is never finished goes on round the shoulders.

function weaver(): Painted {
  const b = build(43, 27, 2, 6, 5.5);
  const { X, sy, beltY, hem } = b;
  const lights: Light[] = [];
  const back = layer();
  const body = layer();
  const head = layer();
  const band = layer();
  const front = layer();
  const over = layer();

  // the distaff in the further hand: a staff, and at its head the wool not yet spun, which is light
  const dx0 = X + 14;
  limb(back, dx0, KAY - 2, dx0, sy - 14, 1.1, 1.1, PLUM);
  lit(back, BONE, HI, LO, (l) => l.poly([[dx0 - 4, sy - 12], [dx0 - 5, sy - 19], [dx0 - 2, sy - 25], [dx0 + 3, sy - 25], [dx0 + 6, sy - 19], [dx0 + 5, sy - 12]], INK));
  for (let k = 0; k < 4; k++) for (let i = 0; i < 9; i++) mark(back, dx0 - 4 + i + (k % 2), sy - 23 + k * 3 + (i % 3 === 0 ? 1 : 0), i % 2 ? CYAN[2] : BONE[2]);
  lights.push({ x: dx0 + 0.5, y: sy - 18, r: 14, color: SPARK[2], a: 0.4 });
  const shod = boots(PLUM, PLUM, 3, 0.5);
  leg(body, KX + 1, hem - 3, KAY - 3, true, shod, STAND, 2, 1);
  leg(body, KX - 4, hem - 2, KAY - 1, false, shod, STAND, 2, 1);

  const fHand: V = [dx0 - 1, sy + 11];
  armTo(body, b.far, fHand, dim(TEAL), dim(TEAL), 2.6, 1, 7.5, 7.5);

  // a long gown, narrow, a girdle low on the hips
  turned(body, b, true, (t) => {
    lit(t, TEAL, HI, [LO[0], LO[1] + 1], (l) => l.poly([[X - 6, sy + 1], [X - 4.5, sy - 1], [X + 4.5, sy - 1], [X + 6, sy + 1], [X + 4.5, beltY], [X + 8, hem], [X - 8, hem], [X - 4.5, beltY]], INK));
    for (const [dx, from] of [[-3, 8], [4, 12]] as const) for (let y = beltY + from; y < hem - 2; y++) mark(t, X + dx + Math.round(((y - beltY) * dx) / 30), y, TEAL[1]);
    for (let x = X - 5; x <= X + 5; x++) mark(t, x, beltY + 3 + Math.round(Math.abs(x - X) * -0.3) + 1, BONE[2]);
    for (let x = X - 8; x <= X + 8; x++) mark(t, x, hem - 2, (x + 40) % 3 ? CYAN[2] : TEAL[3]);
  });

  // the head: silver hair in a plait over the nearer shoulder, a thread of light bound round the brow
  const ey = face(head, b);
  crown(head, b, BONE, -2, 0.8, 5);
  lit(head, BONE, HI, LO, (l) => stroke(l, [[b.cx - b.r, b.cy + 2], [b.cx - b.r - 2, b.cy + 9], [b.cx - b.r + 1, b.cy + 15], [b.cx - b.r, b.cy + 22]], (t) => 2.2 - t * 0.9));
  for (let i = 0; i < 6; i++) mark(head, b.cx - b.r - 0.5 + (i % 2), b.cy + 5 + i * 3, BONE[1]);
  head.rect(Math.round(b.cx - b.r) - 1, Math.round(b.cy) + 22, 2, 2, CYAN[2]);
  for (const [x, y] of inEllipse(b.cx, b.cy, b.r + 0.8, b.r + 0.8)) if (y === Math.round(b.cy) - 3 && x > b.cx - 3) over.set(x, y, SPARK[x % 2 ? 3 : 2]);
  head.hline(b.fx - 1, ey + 4, 3, SKIN[1]);

  // the band: over both shoulders like a stole, its nearer end down to the knee, runes woven all along it
  turned(band, b, false, (t) => {
    lit(t, BONE, HI, LO, (l) => {
      l.poly([[X - 7, sy], [X - 3, sy - 1], [X - 2, sy + 4], [X - 7, sy + 5]], INK);
      l.poly([[X + 3, sy - 1], [X + 7, sy], [X + 7, sy + 5], [X + 2, sy + 4]], INK);
      l.rect(X - 7, sy + 4, 5, 26, INK);
      l.rect(X + 3, sy + 4, 4, 9, INK);
    });
    for (let y = sy + 5; y < sy + 30; y++) {
      t.set(X - 7, y, TEAL[2]);
      t.set(X - 3, y, TEAL[2]);
    }
    for (let k = 0; k < 4; k++) rune(t, k, X - 6, sy + 6 + k * 6, TEAL[1]);
    t.hline(X - 7, sy + 29, 5, CYAN[2]);
    t.hline(X + 3, sy + 12, 4, CYAN[2]);
  });
  glowRune(over, lights, 1, X - 6, sy + 12 + b.lean(X - 5), 0.4, SPARK[4]);

  // the nearer hand lets the spindle down on its thread; the thread comes to it from the wool on the distaff
  const nHand: V = [X - 12, sy + 16];
  armTo(front, b.near, nHand, TEAL, TEAL, 2.6, -1, 7.5, 7.5);
  const thread: [V, V, V, V] = [[dx0 - 3, sy - 13], [X + 2, sy - 24], [X - 12, sy - 14], [nHand[0] - 1, nHand[1] - 2]];
  for (let k = 0; k <= 70; k++) {
    const [x, y] = bezAt(thread, k / 70);
    over.set(Math.round(x), Math.round(y), k % 3 ? SPARK[2] : SPARK[3]);
  }
  for (let y = Math.round(nHand[1]) + 2; y < KAY - 16; y++) over.set(Math.round(nHand[0]) - 1, y, y % 2 ? SPARK[3] : SPARK[2]);
  const spx = Math.round(nHand[0]) - 1;
  const spy = KAY - 15;
  limb(front, spx, spy - 2, spx, spy + 9, 0.8, 0.8, PLUM);
  lit(front, BONE, HI, LO, (l) => l.ellipse(spx + 0.5, spy + 2, 3, 3.6, INK));
  for (let i = 0; i < 3; i++) front.hline(spx - 2, spy + i * 2, 5, CYAN[i === 1 ? 3 : 2]);
  lit(front, WOOD, HI, LO, (l) => l.ellipse(spx + 0.5, spy + 7, 4, 1.6, INK));
  lights.push({ x: spx + 0.5, y: spy + 2, r: 9, color: SPARK[2], a: 0.45 });
  hand(front, nHand[0], nHand[1]);
  const hands = layer();
  hand(hands, fHand[0] + 1, fHand[1]);

  return { px: compose(null, [back, body, head, band, front, hands], over), lights };
}

// ---------------------------------------------------------------------------------------------

export const WORDSMITHS: Option[] = [
  { n: 1, name: 'Rune-smith', note: 'A smith of words: bare arms, goggles pushed up. He leans on a hammer with a rune alight in its head and holds a word white-hot in the tongs.', paint: runeSmith },
  { n: 2, name: 'Old scribe', note: 'Stooped, a white beard to his belt, lenses that shine. He leans on a quill as tall as he is and trails a scroll to the floor.', paint: scribe },
  { n: 3, name: 'Stone-carver', note: 'He carries the stone he is cutting on his back, taller than he is. Mallet in one hand, chisel in the other.', paint: carver },
  { n: 4, name: 'Stone man', note: 'Not a man who cuts runes: a thing of cut stone that walks. Runes in every block, moss on its shoulder, a rune stone over its open hand.', paint: stoneMan },
  { n: 5, name: 'Skald', note: 'His words are sung. Yellow hair, a plaited beard, a pale pelt on his shoulders, a stave cut with runes, and runes rising from his mouth.', paint: skald },
  { n: 6, name: 'Printer', note: 'Words cast in metal and pressed. A green eyeshade, an apron black with ink, and the sheet he has just pulled, its rune still wet.', paint: printer },
  { n: 7, name: 'Marked one', note: 'He keeps no book: every word he knows is written in his skin. A brush wet with light, and the last word standing over his palm.', paint: marked },
  { n: 8, name: 'Blind archivist', note: 'He knows every word in the stacks by touch. A band over his eyes, a coat of scroll pockets, a chained book, a lantern with a word in it.', paint: archivist },
  { n: 9, name: 'Engraver', note: 'Short and wide. A red beard in three plaits with a rune stone tied in each, a glass over one eye, and the finest hand in the trade.', paint: engraver },
  { n: 10, name: 'Weaver', note: 'Every word is a thread. Light on the distaff, a spindle on its thread, and a woven band of runes that is never finished.', paint: weaver },
];
