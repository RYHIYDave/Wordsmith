// The two paintings behind the title, painted in code like all the other art.
//
// `real` is the school library at dusk: a small child, seen from behind, stands before a big desk
// and looks up at the librarian leaning over it. `dream` is the same picture as they dream it: a
// child-sized knight before a cauldron, looking up at a witch. The title screen turns the one into
// the other and back, so every big shape sits in the same place in both: child and knight, desk
// and cauldron, librarian and witch, window and barred arch, shelf boards and courses of stone,
// the cat on the sill.
//
// How a picture is built:
//   - back to front in six groups (wall and floor, the big figure, the desk or cauldron, her arms
//     and hands, the things on top, the small figure), each made of parts that get a 1 px ink line
//     as they go on. The groups are kept apart (see "A picture as a stack of groups") because the
//     change from one picture to the other is made group by group: title_morph.ts.
//   - there is one light, low in the middle (the desk lamp / the brew), so the big figure is lit
//     from under the chin, her shadow is thrown up the wall behind her, and the corners fall into
//     the dark. Big surfaces are shaded by their distance from that light, cut into flat bands;
//     faces, hands and the small figure are hand-drawn character maps. A thin cold edge of light
//     from the window (the moon, in the dream) picks out the left side of the big figure.
//   - colours are the palette's, or blends of palette colours (`mix`, or the same sum done
//     straight on the pixel buffer where a whole layer is being darkened or lit).
//
// To change a face, a hand or the small figure, edit its character map. TITLE_MARKS says where the
// eyes and the two lights are, for anything drawn over the pictures: keep it in step if the heads,
// the lamp or the cauldron move. Painting both takes about a tenth of a second, once, at start-up.
// (tests/title.test.ts keeps a checksum of each picture: if you change one on purpose, it tells
// you the new sum to put there.)

import { Px, mix, rgba } from '../engine/px';
import { RNG, hash2 } from '../engine/rng';
import { P } from './palette';
import { TitleMorph } from './title_morph';

export interface TitleArt {
  /** Both pictures are this size: 240 x 160. */
  w: number;
  h: number;
  /** The library: a small child seen from behind, before a big desk, looking up at a very large librarian. */
  real: HTMLCanvasElement;
  /** The same picture as the child dreams it: a small knight before a big cauldron, looking up at a very large witch. */
  dream: HTMLCanvasElement;
  /**
   * The picture `t` of the way from the library (0) to the dream (1): the librarian part-way to
   * being the witch, the desk part-way to the cauldron. `back` says the change is on its way back
   * to the library (it looks a little different: see title_morph.ts). The canvas is one that is
   * painted afresh each call, so draw it before asking for another; at 0 and at 1 it is `real` or
   * `dream` itself.
   */
  morph(t: number, back?: boolean): HTMLCanvasElement;
  /**
   * The small life in the pictures at time `t` (seconds): bubbles, steam, flames, motes of dust,
   * on a see-through sheet to be drawn over the picture. `k` is how far the picture has turned
   * toward the dream, as for `morph`. Null when there is none to show (in the middle of a change).
   */
  life(t: number, k: number): HTMLCanvasElement | null;
}

/**
 * Where the lights are, in picture pixels, for anything drawn over the art (a flicker, a glow).
 * `lens` and `eye` are the middle pixel of each of the librarian's lenses and the witch's eyes.
 */
export const TITLE_MARKS = {
  lens: [
    [112, 36],
    [127, 36],
  ],
  eye: [
    [111, 35],
    [128, 35],
  ],
  /** The bulb under the lamp's shade. */
  lamp: [120, 85],
  /** The middle of the brew in the cauldron. */
  brew: [120, 97],
} as const;

const W = 240;
const H = 160;
/** Everything is arranged about this column. */
const CX = 120;
/** First row of the floor: the wall and the big object stand on it. */
const FLOOR = 138;
/** First row of the desk top / the cauldron's mouth. */
const TOP = 93;
/** First row of the front edge of the desk top / the cauldron's front lip. */
const LIP = 97;

type Pt = readonly [number, number];
type Key = Readonly<Record<string, string>>;
/** Tones of one material, dark to light. */
type Ramp = readonly string[];

// ---------------------------------------------------------------------------------------------
// Small helpers

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function layer(): Px {
  return new Px(W, H);
}

/**
 * Put a part on the picture with an ink line round it, so overlapping parts stay separate.
 * (The same as `dst.blit(part.outline(P.ink))`, but it only visits the part's own corner of the
 * picture: there are thirty-odd parts and this runs on a phone at start-up.)
 */
function over(dst: Px, part: Px): void {
  const a = part.d;
  let x0 = W;
  let y0 = H;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0, i = 3; y < H; y++) {
    for (let x = 0; x < W; x++, i += 4) {
      if (a[i] === 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      y1 = y;
    }
  }
  if (x1 < 0) return;
  const ink = rgba(P.ink);
  const b = dst.d;
  const row = W * 4;
  for (let y = Math.max(0, y0 - 1); y <= Math.min(H - 1, y1 + 1); y++) {
    for (let x = Math.max(0, x0 - 1); x <= Math.min(W - 1, x1 + 1); x++) {
      const i = (y * W + x) * 4;
      if (a[i + 3] > 0) {
        b[i] = a[i];
        b[i + 1] = a[i + 1];
        b[i + 2] = a[i + 2];
        b[i + 3] = 255;
      } else if ((x > 0 && a[i - 1] > 0) || (x < W - 1 && a[i + 7] > 0) || (y > 0 && a[i + 3 - row] > 0) || (y < H - 1 && a[i + 3 + row] > 0)) {
        b[i] = ink[0];
        b[i + 1] = ink[1];
        b[i + 2] = ink[2];
        b[i + 3] = 255;
      }
    }
  }
}

/** Fill a whole block of the picture with one colour: `p.rect`, for the two big grounds. */
function fill(p: Px, x: number, y: number, w: number, h: number, c: string): void {
  const v = rgba(c);
  const d = p.d;
  for (let j = y; j < y + h; j++) {
    for (let i = (j * W + x) * 4, end = i + w * 4; i < end; i += 4) {
      d[i] = v[0];
      d[i + 1] = v[1];
      d[i + 2] = v[2];
      d[i + 3] = 255;
    }
  }
}

/** Mix the pixel at byte offset i toward the colour c. The same sum as `mix`, without the strings. */
function toward(d: Uint8ClampedArray, i: number, c: readonly number[], t: number): void {
  d[i] = Math.round(d[i] + (c[0] - d[i]) * t);
  d[i + 1] = Math.round(d[i + 1] + (c[1] - d[i + 1]) * t);
  d[i + 2] = Math.round(d[i + 2] + (c[2] - d[i + 2]) * t);
}

/**
 * Visit every painted pixel of a layer; return a colour to repaint it, or undefined to leave it.
 * (`Px.each` read straight from the buffer: most layers are nearly empty, and there are many.)
 */
function scan(l: Px, fn: (x: number, y: number) => string | undefined): void {
  const d = l.d;
  for (let y = 0, i = 3; y < H; y++) {
    for (let x = 0; x < W; x++, i += 4) {
      if (d[i] === 0) continue;
      const c = fn(x, y);
      if (c !== undefined) l.set(x, y, c);
    }
  }
}

/** Paint a hand-drawn pixel map with its top-left corner at (x, y). Characters that are not in the key are skipped. */
function stamp(p: Px, x: number, y: number, rows: readonly string[], key: Key, flip = false): void {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = key[row.charAt(i)];
      if (c !== undefined) p.set(flip ? x + row.length - 1 - i : x + i, y + j, c);
    }
  });
}

/** Paint a left half and its mirror image. The last character of each row sits just left of the centre line. */
function stampBoth(p: Px, y: number, rows: readonly string[], key: Key): void {
  rows.forEach((row, j) => {
    const n = row.length;
    for (let i = 0; i < n; i++) {
      const c = key[row.charAt(i)];
      if (c === undefined) continue;
      p.set(CX - n + i, y + j, c);
      p.set(CX + n - 1 - i, y + j, c);
    }
  });
}

/** The same outline on the other side of the picture. */
function mirror(pts: readonly Pt[]): Pt[] {
  return pts.map((q): Pt => [W - q[0], q[1]]);
}

/** Mix the pixel that is already there toward `c`. */
function tint(p: Px, x: number, y: number, c: string, t: number): void {
  const cur = p.get(x, y);
  if (cur) p.set(x, y, mix(cur, c, t));
}

/** Distance from the light at (lx, ly). Light spreads a little further sideways than up and down. */
function reach(x: number, y: number, lx: number, ly: number): number {
  const dx = (x + 0.5 - lx) * 0.8;
  const dy = y + 0.5 - ly;
  return Math.sqrt(dx * dx + dy * dy);
}

/** A flat band 0..bands for a value 0..1. */
function band(t: number, bands: number): number {
  return Math.floor(clamp01(t) * bands + 0.5);
}

/** The same, with a thin checker where two bands meet: only the evening sky is dithered. */
function ditherBand(t: number, bands: number, x: number, y: number): number {
  return Math.floor(clamp01(t) * bands + ((x + y) % 2 === 0 ? 0.35 : 0.65));
}

/**
 * Sink a layer into the dark: each pixel is mixed toward `dark`, more the further it is from the
 * light and the higher up the picture it is. The falloff is cut into flat bands so it stays pixel
 * art rather than a smooth gradient.
 */
function gloom(p: Px, lx: number, ly: number, near: number, far: number, dark: string, max: number, bands = 14): void {
  const c = rgba(dark);
  const d = p.d;
  // one mixing amount per band, worked out once
  const amount: number[] = [];
  for (let q = 0; q <= bands; q++) amount.push((q / bands) * max);
  for (let y = 0, i = 0; y < H; y++) {
    const up = clamp01((46 - y) / 46) * 0.3;
    for (let x = 0; x < W; x++, i += 4) {
      if (d[i + 3] === 0) continue;
      const t = amount[band((reach(x, y, lx, ly) - near) / (far - near) + up, bands)];
      if (t > 0) toward(d, i, c, t);
    }
  }
}

/** Light spilling from (lx, ly): pixels within `far` are mixed toward `c`, most of all close in. */
function glow(p: Px, lx: number, ly: number, far: number, c: string, max: number, bands = 6): void {
  const to = rgba(c);
  const d = p.d;
  const x0 = Math.max(0, Math.floor(lx - far / 0.8));
  const x1 = Math.min(W - 1, Math.ceil(lx + far / 0.8));
  for (let y = Math.max(0, Math.floor(ly - far)); y <= Math.min(H - 1, Math.ceil(ly + far)); y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] === 0) continue;
      const t = clamp01(1 - reach(x, y, lx, ly) / far);
      const q = band(t * t, bands);
      if (q > 0) toward(d, i, to, (q / bands) * max);
    }
  }
}

/** Shade a filled shape by how near each pixel is to the light: `ramp` runs dark to light. */
function underlit(l: Px, ramp: Ramp, lx: number, ly: number, far: number, extra?: (x: number, y: number) => number): void {
  const n = ramp.length;
  scan(l, (x, y) => {
    const v = 1 - reach(x, y, lx, ly) / far + (extra ? extra(x, y) : 0);
    return ramp[Math.max(0, Math.min(n - 1, Math.floor(v * n)))];
  });
}

/** A thin cold edge of light from the left: tint the left-hand (and upper-left) edge pixels of a shape. */
function rimLeft(l: Px, c: string, t: number, maxX = CX): void {
  const to = rgba(c);
  const d = l.d;
  const row = W * 4;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < maxX; x++) {
      const i = (y * W + x) * 4;
      if (d[i + 3] === 0) continue;
      if (x === 0 || d[i - 1] === 0) toward(d, i, to, t);
      else if (y === 0 || (d[i + 3 - row] === 0 && d[i - 1 - row] === 0)) toward(d, i, to, t * 0.6);
    }
  }
}

/**
 * The big figure's shadow on the wall behind her. The light is low and in front of her, so her
 * outline is thrown up and outward, bigger than she is: `grow` is how much bigger.
 */
function wallShadow(p: Px, figure: readonly Px[], lx: number, ly: number, grow: number, dark: string, amount: number): void {
  const c = rgba(dark);
  // her whole outline as one mask
  const mask = new Uint8Array(W * H);
  for (const part of figure) {
    for (let i = 0; i < W * H; i++) if (part.d[i * 4 + 3] > 0) mask[i] = 1;
  }
  for (let y = 0; y < FLOOR; y++) {
    const fy = Math.round(ly + (y - ly) / grow);
    if (fy < 0 || fy >= H) continue;
    for (let x = 0; x < W; x++) {
      const fx = Math.round(lx + (x - lx) / grow);
      if (mask[fy * W + fx] === 1) toward(p.d, (y * W + x) * 4, c, amount);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The wall behind. We look up at it from low down, so its uprights lean toward a point far above
// the picture and the shelves (or courses of stone) get shallower as they climb.

const VANISH = -560;

/** How much narrower the wall is drawn at row y than at the floor. */
function lean(y: number): number {
  return (y - VANISH) / (FLOOR - VANISH);
}

/** Screen column of the wall line that meets the floor at column u. */
function wallX(u: number, y: number): number {
  return CX + (u - CX) * lean(y);
}

/** Top row of each shelf board (2 px thick). In the dream the same rows are the joints between courses. */
const BOARDS: readonly number[] = [4, 18, 34, 52, 72, 94, 118];

/** The window on the left, in floor columns. In the dream the same opening is a barred arch. */
const WIN_L = 8;
const WIN_R = 42;
const WIN_MID = (WIN_L + WIN_R) / 2;
const WIN_SPRING = 25; // the arch springs from this row
const WIN_SILL = 90;

/** How far inside the window opening a pixel is, in pixels. Negative = outside it. */
function windowInset(x: number, y: number): number {
  if (y >= WIN_SILL) return WIN_SILL - 0.5 - y;
  if (y >= WIN_SPRING) return (wallX(WIN_R, y) - wallX(WIN_L, y)) / 2 - Math.abs(x + 0.5 - wallX(WIN_MID, y));
  const r = (wallX(WIN_R, WIN_SPRING) - wallX(WIN_L, WIN_SPRING)) / 2;
  return r - Math.hypot(x + 0.5 - wallX(WIN_MID, WIN_SPRING), y + 0.5 - WIN_SPRING);
}

/** The cat on the window sill, seen from behind. Columns 34..43; its feet are on row 89. */
const CAT: readonly string[] = [
  '..k...k...',
  '..kk.kk...',
  '..kkkkk...',
  '..kkkkk...',
  '..kkkkk...',
  '...kkkkk..',
  '..kkkkkk..',
  '.kkkkkkk..',
  '.kkkkkkkk.',
  '.kkkkkkkk.',
  'kkkkkkkkk.',
];

/** The cat's tail, hanging down over the sill, from its root to its tip. */
const CAT_TAIL: readonly Pt[] = [[43, 90], [44, 91], [44, 92], [44, 93], [44, 94], [43, 95], [42, 96]];

/** Paint the cat. `rim` is the colour of the sky's light along its left side. */
function cat(p: Px, fur: string, rim: string): void {
  const l = layer();
  stamp(l, 34, 79, CAT, { k: fur });
  scan(l, (x, y) => (!l.has(x - 1, y) ? rim : undefined));
  p.blit(l, 0, 0);
  for (const q of CAT_TAIL) p.set(q[0], q[1], fur);
}

/** An old cobweb across the top right corner. */
function cobweb(p: Px, c: string): void {
  const spokes: ReadonlyArray<Pt> = [[210, 0], [215, 10], [223, 19], [232, 24], [239, 27]];
  for (const q of spokes) p.line(239, 0, q[0], q[1], c);
  for (const f of [0.45, 0.72, 1]) {
    for (let i = 0; i + 1 < spokes.length; i++) {
      const a = spokes[i];
      const b = spokes[i + 1];
      const ax = 239 + (a[0] - 239) * f;
      const ay = a[1] * f;
      const bx = 239 + (b[0] - 239) * f;
      const by = b[1] * f;
      // each thread sags a little toward the corner
      const mx = (ax + bx) / 2 + (239 - (ax + bx) / 2) * 0.12;
      const my = (ay + by) / 2 - ((ay + by) / 2) * 0.12;
      p.line(ax, ay, mx, my, c).line(mx, my, bx, by, c);
    }
  }
}

// ----- the library ---------------------------------------------------------------------------

const dull = (c: string, t = 0.45): string => mix(c, P.er2, t);

/** Book cloths: [shade, spine, lit edge]. Muted, so the shelves stay behind the figures. */
const BOOKS: ReadonlyArray<Ramp> = [
  [P.wd1, P.wd2, P.wd3],
  [P.wd2, P.wd3, P.wd4],
  [P.er2, P.er3, P.er4],
  [P.er3, P.er4, P.er5],
  [dull(P.bl1), dull(P.bl2), dull(P.bl3)],
  [dull(P.bl1, 0.25), dull(P.bl2, 0.3), dull(P.bl3, 0.4)],
  [dull(P.gn1), dull(P.gn2), dull(P.gn3)],
  [dull(P.gn1, 0.3), dull(P.gn2, 0.35), dull(P.gn3, 0.55)],
  [dull(P.bu1), dull(P.bu2), dull(P.bu3)],
  [dull(P.bu1, 0.3), dull(P.bu2, 0.4), dull(P.bu3, 0.6)],
  [dull(P.tl1), dull(P.tl2), dull(P.tl3, 0.55)],
  [dull(P.gd1), dull(P.gd2, 0.5), dull(P.gd3, 0.55)],
];
const GILT = dull(P.gd3, 0.35);
const LABEL = dull(P.bn3, 0.3);

/** One book standing on its shelf. `tilt` leans it over to the right: 1 px for every 4 rows it rises. */
function book(p: Px, x: number, w: number, top: number, bottom: number, tones: Ramp, gilt: boolean, label: boolean, tilt = false): void {
  const h = bottom - top + 1;
  for (let y = top; y <= bottom; y++) {
    const lean = tilt ? (bottom - y) >> 2 : 0;
    const band = gilt && h >= 8 && (y === top + 2 || y === bottom - 2);
    const tag = label && w >= 3 && h >= 10 && (y === top + 4 || y === top + 5);
    for (let i = 0; i < w; i++) {
      const edge = w >= 2 && i === w - 1 ? 0 : w >= 3 && i === 0 ? 2 : 1;
      p.set(x + lean + i, y, band ? GILT : tag && edge === 1 ? LABEL : tones[edge]);
    }
  }
}

/**
 * One shelf of books, rows top..bottom. Books keep upright; the whole row is squeezed toward the
 * middle as the wall leans. Only books left of column `xMax` are painted (the rest are still dealt
 * from `rng`, so the same seed always gives the same shelves).
 */
function bookRow(p: Px, top: number, bottom: number, rng: RNG, xMax: number): void {
  const rowH = bottom - top + 1;
  const s = lean((top + bottom) / 2);
  let u = -70 - rng.int(0, 4);
  while (u < 310) {
    const set = rng.chance(0.2) ? rng.int(3, 6) : 1; // now and then a run of matching volumes
    const tones = rng.pick(BOOKS);
    const wu = rng.int(3, 6);
    const drop = rng.int(1, Math.max(1, Math.min(6, rowH >> 2)));
    const gilt = rng.chance(0.45);
    const label = rng.chance(0.3);
    if (set === 1 && rng.chance(0.06)) {
      u += rng.int(3, 7); // a gap where a book is out on loan
      continue;
    }
    const tilt = set === 1 && rowH >= 12 && rng.chance(0.07); // and now and then one that has slumped into a gap
    for (let k = 0; k < set; k++) {
      const x0 = Math.round(CX + (u - CX) * s);
      const x1 = Math.round(CX + (u + wu - CX) * s);
      if (x1 > x0 && x1 > 0 && x0 < xMax) book(p, x0, x1 - x0, top + drop + (tilt ? 1 : 0), bottom, tones, gilt, label, tilt);
      u += wu + (tilt ? 2 + (rowH >> 2) : 0);
    }
  }
}

const SHELF_BACK = mix(P.wd1, P.black, 0.55);

/** The books on the shelves: always the same ones, in both pictures. */
const BOOK_SEED = 1802;

/**
 * Shelves of books from row `from` down to the floor, as far across as column `xMax`.
 * The library has the whole wall of them; in the dream only a corner is left.
 */
function shelves(p: Px, from: number, xMax: number): void {
  fill(p, 0, from, xMax, FLOOR - from, SHELF_BACK);
  const rng = new RNG(BOOK_SEED);
  let top = 0;
  for (let i = 0; i <= BOARDS.length; i++) {
    const last = i < BOARDS.length ? BOARDS[i] - 1 : FLOOR - 5;
    if (last - top >= 2) bookRow(p, top, last, rng, top >= from ? xMax : 0);
    top = last + 3;
  }
  for (const b of BOARDS) {
    if (b < from) continue;
    p.hline(0, b, xMax, P.wd2).hline(0, b + 1, xMax, P.wd3); // the lamp is below: the underside is the lit one
    for (let x = 0; x < xMax; x++) tint(p, x, b - 1, P.black, 0.3);
  }
  p.rect(0, FLOOR - 4, xMax, 4, P.wd2).hline(0, FLOOR - 4, xMax, P.wd3);
}

/** The wall of the library: bookcases going up out of sight, with a tall window let into them on the left. */
function library(p: Px): void {
  shelves(p, 0, W);
  // uprights between the bookcases; two of them flank the window
  for (const u of [WIN_L - 5, WIN_R + 5, 87, 153, 191, 237]) {
    for (let y = 0; y < FLOOR - 4; y++) {
      const x = Math.round(wallX(u, y));
      const toMiddle = u < CX ? 1 : -1;
      p.set(x - toMiddle, y, P.wd1).set(x, y, P.wd2).set(x + toMiddle, y, P.wd3);
    }
  }
  // the wall round the window, panelled in wood
  const panelling = mix(P.wd1, P.wd2, 0.6);
  for (let y = 0; y < WIN_SILL + 4; y++) {
    const x0 = Math.round(wallX(WIN_L - 5, y)) + 2;
    const x1 = Math.round(wallX(WIN_R + 5, y)) - 2;
    for (let x = x0; x <= x1; x++) p.set(x, y, hash2(x, y >> 2, 11) < 0.12 ? P.wd1 : panelling);
  }
}

/** The tall window, drawn after the wall has been darkened: the sky still holds the last blue of evening. */
function windowGlass(p: Px): void {
  const sky: Ramp = [
    mix(P.bu1, P.ink, 0.45),
    mix(P.bu1, P.ink, 0.15),
    P.bu1,
    mix(P.bu1, P.bu2, 0.45),
    mix(P.bu2, P.pu3, 0.25),
    mix(P.bu2, P.pu4, 0.4),
    mix(P.bu3, P.pu4, 0.5),
    mix(mix(P.bu3, P.pu4, 0.5), P.fr5, 0.3),
  ];
  const frame = mix(P.wd1, P.ink, 0.35);
  const frameLit = mix(P.wd3, P.bu3, 0.4);
  const glass = (x: number, y: number): boolean => windowInset(x, y) > 2.2;
  for (let y = 0; y < WIN_SILL; y++) {
    for (let x = 0; x < 70; x++) {
      const d = windowInset(x, y);
      if (d <= 0) continue;
      if (d <= 2.2) {
        // the frame: the side that faces the sky's last light is the lit one
        p.set(x, y, d > 1.1 && x + 0.5 > wallX(WIN_MID, y) ? frameLit : frame);
        continue;
      }
      p.set(x, y, sky[Math.min(sky.length - 1, ditherBand((y - 9) / (WIN_SILL - 9), sky.length - 1, x, y))]);
    }
  }
  // glazing bars
  for (let y = 0; y < WIN_SILL; y++) {
    const xm = Math.round(wallX(WIN_MID, y));
    if (glass(xm, y)) p.set(xm, y, frame);
  }
  for (const y of [WIN_SPRING, 47, 69]) {
    for (let x = 0; x < 70; x++) if (glass(x, y)) p.set(x, y, frame);
  }
  // a bare branch outside
  const twig = mix(P.bu1, P.ink, 0.75);
  const branch: ReadonlyArray<readonly [number, number, number, number]> = [
    [14, 86, 30, 68],
    [30, 68, 45, 59],
    [24, 75, 27, 62],
    [27, 62, 33, 53],
    [36, 64, 39, 55],
    [19, 80, 18, 70],
  ];
  const cut = layer();
  for (const b of branch) cut.line(b[0], b[1], b[2], b[3], twig);
  scan(cut, (x, y) => {
    if (glass(x, y) && p.get(x, y) !== frame) p.set(x, y, twig);
    return undefined;
  });
  // the evening star
  p.set(Math.round(wallX(34, 31)), 31, P.bu5);
  // sill
  const x0 = Math.round(wallX(WIN_L, WIN_SILL)) - 3;
  const x1 = Math.round(wallX(WIN_R, WIN_SILL)) + 3;
  p.hline(x0, WIN_SILL, x1 - x0, mix(P.wd4, P.bu4, 0.35)).hline(x0, WIN_SILL + 1, x1 - x0, P.wd2).hline(x0 + 1, WIN_SILL + 2, x1 - x0 - 2, P.wd1);
  // the library cat, watching the evening
  cat(p, mix(P.ink, P.bu1, 0.25), mix(P.bu2, P.pu4, 0.4));
}

/** A globe on its stand, on one of the shelves. */
const GLOBE: readonly string[] = [
  '...aaaa...',
  '..abBBba..',
  '.abBgBBba.',
  '.aBggBBBa.',
  '.aBBgBgba.',
  '.abBBggba.',
  '..abBbba..',
  '...aaaa...',
  '....ww....',
  '..wwWWww..',
];

/** The floor's lines all run to a point on this row, behind the big object. */
const FLOOR_VANISH = 112;

/** Which strip of floor a pixel is in: strips are `width` pixels wide at the bottom of the picture. */
function floorLane(x: number, y: number, width: number, shift = 0): number {
  const xb = CX + ((x + 0.5 - CX) * (H - FLOOR_VANISH)) / (y + 0.5 - FLOOR_VANISH);
  return Math.floor((xb - CX - width / 2 + shift) / width);
}

/** How far away a floor row is: 1 at the bottom edge of the picture, more further back. */
function floorDepth(y: number): number {
  return (H - FLOOR_VANISH) / (y + 0.5 - FLOOR_VANISH);
}

/** The floor of the library: boards running away from us. */
function floorboards(p: Px): void {
  const joint = mix(P.wd1, P.ink, 0.55);
  const tones: Ramp = [mix(P.wd1, P.wd2, 0.5), P.wd2, mix(P.wd2, P.wd3, 0.35)];
  const grain: Ramp = tones.map((c) => mix(c, P.wd1, 0.4));
  const plankOf = (lane: number, y: number): number => Math.floor(floorDepth(y) * 3.1 + hash2(lane, 0, 5) * 7);
  for (let y = FLOOR; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const lane = floorLane(x, y, 22);
      const plank = plankOf(lane, y);
      if (lane !== floorLane(x + 1, y, 22) || plank !== plankOf(lane, y + 1)) {
        p.set(x, y, joint);
        continue;
      }
      const tone = Math.floor(hash2(lane, plank, 9) * 3);
      p.set(x, y, hash2(x >> 2, y, 21) < 0.07 ? grain[tone] : tones[tone]);
    }
  }
}

// ----- the dungeon -----------------------------------------------------------------------------

const STONE: Ramp = [
  mix(P.st1, P.black, 0.35),
  mix(P.st1, P.pu1, 0.3),
  mix(P.st2, P.pu1, 0.25),
  mix(P.st3, P.pu2, 0.2),
  mix(P.st4, P.pu2, 0.15),
];

/** One course of big stone blocks, rows top..bottom. */
function course(p: Px, top: number, bottom: number, rng: RNG): void {
  const s = lean((top + bottom) / 2);
  let u = -90 + rng.int(0, 30);
  while (u < 330) {
    const wu = rng.int(26, 46);
    const x0 = Math.round(CX + (u - CX) * s);
    const x1 = Math.round(CX + (u + wu - CX) * s) - 2; // last column of the block; then a joint
    const base = rng.chance(0.35) ? 3 : 2;
    const seed = rng.int(0, 9999);
    const litSide = x0 + x1 < 2 * CX ? x1 : x0; // the side nearer the brew
    for (let y = top; y <= bottom; y++) {
      for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
        let t = base;
        if (y === bottom || x === litSide) t = base + 1; // chiselled edges: the brew lights the undersides
        else if (y === top || x === x0 || x === x1) t = base - 1;
        else {
          const h = hash2(x, y, seed);
          if (h < 0.05) t = base + 1;
          else if (h > 0.92) t = base - 1;
        }
        p.set(x, y, STONE[t]);
      }
    }
    u += wu;
  }
}

/** The wall of the dream: the shelves have become courses of stone. */
function dungeonWall(p: Px): void {
  fill(p, 0, 0, W, FLOOR, STONE[0]);
  const rng = new RNG(1313);
  let top = 0;
  for (let i = 0; i <= BOARDS.length; i++) {
    const last = i < BOARDS.length ? BOARDS[i] : FLOOR - 1;
    if (last - top >= 2) course(p, top, last, rng);
    top = last + 2;
  }
  // cracks
  const crack: ReadonlyArray<readonly Pt[]> = [
    [[204, 22], [207, 27], [205, 31], [209, 36], [208, 42]],
    [[68, 20], [65, 25], [67, 30], [63, 36]],
    [[176, 8], [173, 12], [175, 17]],
    [[212, 100], [216, 106], [214, 111], [218, 116]],
  ];
  for (const c of crack) {
    for (let i = 0; i + 1 < c.length; i++) p.line(c[i][0], c[i][1], c[i + 1][0], c[i + 1][1], STONE[0]);
  }
  // what is left of the low bookcase under the window: old books, some of them still awake
  const old = layer();
  shelves(old, BOARDS[5], 46);
  scan(old, (x, y) => {
    p.set(x, y, mix(old.get(x, y) as string, P.pu1, 0.5));
    return undefined;
  });
  for (const s of [[9, 101, 12], [23, 103, 10], [31, 123, 7], [14, 124, 6]] as const) {
    p.vline(s[0], s[1], s[2], P.tl3).set(s[0], s[1] + 2, P.tl5).set(s[0], s[1] + 4, P.tl4);
  }
  // damp and moss creeping up from the floor
  for (let y = 100; y < FLOOR; y++) {
    for (let x = 46; x < W; x++) {
      if (hash2(x >> 1, y >> 1, 77) < ((y - 100) / 38) * 0.22) tint(p, x, y, P.gn1, 0.45);
    }
  }
}

/** The barred arch where the window was, drawn after the wall has been darkened. */
function archBars(p: Px): void {
  const sky: Ramp = [mix(P.pu1, P.ink, 0.6), mix(P.pu1, P.ink, 0.25), P.pu1, mix(P.pu1, P.pu2, 0.45), mix(P.pu2, P.bu2, 0.3)];
  const open = (x: number, y: number): boolean => windowInset(x, y) > 1.6;
  const cx = wallX(WIN_MID, WIN_SPRING);
  const wedge = (x: number, y: number): number => Math.floor((Math.atan2(WIN_SPRING - y - 0.5, x + 0.5 - cx) / Math.PI) * 9);
  for (let y = 0; y < WIN_SILL; y++) {
    for (let x = 0; x < 72; x++) {
      const d = windowInset(x, y);
      if (d <= -4) continue;
      if (d <= 0) {
        // the stones of the arch, a little paler than the wall, with joints
        const jointed = y >= WIN_SPRING ? y % 9 === 3 : wedge(x, y) !== wedge(x + 1, y) || wedge(x, y) !== wedge(x, y + 1);
        p.set(x, y, jointed ? STONE[1] : d > -1.2 ? STONE[2] : d < -3 ? STONE[4] : STONE[3]);
        continue;
      }
      if (!open(x, y)) {
        p.set(x, y, STONE[0]); // the depth of the wall, in shadow
        continue;
      }
      p.set(x, y, sky[Math.min(sky.length - 1, ditherBand((y - 9) / (WIN_SILL - 9), sky.length - 1, x, y))]);
    }
  }
  // a low moon and two stars
  const mx = wallX(WIN_MID + 5, 40);
  const moon = layer();
  moon.ellipse(mx, 40, 6, 6, P.bn3);
  moon.ellipse(mx - 1.2, 38.8, 4.2, 4.2, P.bn4);
  moon.set(Math.floor(mx) + 2, 41, P.bn2).set(Math.floor(mx) - 2, 43, P.bn2).set(Math.floor(mx) + 1, 37, P.bn3);
  scan(moon, (x, y) => {
    if (open(x, y)) p.set(x, y, mix(moon.get(x, y) as string, P.pu4, 0.3));
    return undefined;
  });
  p.set(Math.round(wallX(15, 22)), 22, P.pu5).set(Math.round(wallX(35, 64)), 64, P.pu4);
  // iron bars
  const iron = mix(P.ink, P.black, 0.4);
  const ironLit = mix(P.sl1, P.pu2, 0.4);
  for (const u of [13, 19, 25, 31, 37]) {
    for (let y = 0; y < WIN_SILL; y++) {
      const x = Math.round(wallX(u, y));
      if (open(x, y)) p.set(x, y, iron);
      if (open(x + 1, y)) p.set(x + 1, y, ironLit);
    }
  }
  for (const y of [WIN_SPRING + 6, 62]) {
    for (let x = 0; x < 72; x++) {
      if (open(x, y)) p.set(x, y, ironLit);
      if (open(x, y + 1)) p.set(x, y + 1, iron);
    }
  }
  // sill
  const x0 = Math.round(wallX(WIN_L, WIN_SILL)) - 4;
  const x1 = Math.round(wallX(WIN_R, WIN_SILL)) + 4;
  p.hline(x0, WIN_SILL, x1 - x0, mix(STONE[4], P.pu4, 0.3)).hline(x0, WIN_SILL + 1, x1 - x0, STONE[3]).hline(x0, WIN_SILL + 2, x1 - x0, STONE[1]);
  // the same cat, but in the dream it has turned its head to look at us
  cat(p, mix(P.ink, P.black, 0.5), mix(P.pu2, P.pu3, 0.5));
  p.set(37, 82, P.gn5).set(39, 82, P.gn5);
}

const SKULL: readonly string[] = [
  '.hhhhhb.',
  'hhhhhhbb',
  'hkkhkkbb',
  'hkkhkkbs',
  'hhhkhbbs',
  '.hhhbbs.',
  '.hshsbs.',
  '..sbsb..',
];
const JAR: readonly string[] = [
  '.wwww.',
  'gGGGGg',
  'gttTtg',
  'gtTTtg',
  'gttttg',
  'gtutTg',
  'gttttg',
  '.gggg.',
];
const SHELF_KEY: Key = {
  h: P.bn3,
  b: P.bn2,
  s: P.bn1,
  k: P.ink,
  w: P.wd4,
  g: P.st5,
  G: P.st7,
  t: P.tl3,
  T: P.tl5,
  u: P.tl1,
};

/** A shelf that has survived into the dream: a skull, a jar of something, two books with glowing spines. */
function relicShelf(p: Px): void {
  const y = BOARDS[4];
  p.hline(188, y, 44, P.wd3).hline(188, y + 1, 44, P.wd2).hline(189, y + 2, 42, P.wd1);
  for (const x of [192, 226]) p.vline(x, y + 2, 5, STONE[0]).set(x + 1, y + 3, STONE[0]).set(x - 1, y + 3, STONE[0]);
  const things = layer();
  stamp(things, 192, y - 8, SKULL, SHELF_KEY);
  stamp(things, 204, y - 8, JAR, SHELF_KEY);
  // two fat books, one leaning on the other
  things.rect(215, y - 12, 4, 12, P.pu2).vline(215, y - 12, 12, P.pu3).vline(218, y - 12, 12, P.pu1);
  things.set(216, y - 9, P.tl5).set(217, y - 8, P.tl4).set(216, y - 7, P.tl5).set(216, y - 5, P.tl4);
  things.poly([[220, y], [224, y], [227, y - 10], [223, y - 11]], P.bl2);
  things.line(221, y - 1, 224, y - 10, P.bl3);
  things.set(223, y - 6, P.fr5).set(224, y - 5, P.fr4);
  over(p, things);
}

/** A chain hanging down the wall from out of sight, ending in an open shackle. */
function chain(p: Px, x: number, len: number): void {
  const dark = mix(P.ink, P.black, 0.4);
  const lit = mix(P.sl1, P.pu2, 0.3);
  for (let y = 0; y < len; y += 4) {
    p.vline(x, y, 2, lit).set(x - 1, y + 2, dark).set(x + 1, y + 2, lit).set(x - 1, y + 3, dark).set(x + 1, y + 3, lit);
  }
  // the shackle
  p.hline(x - 1, len, 3, lit).vline(x - 2, len + 1, 3, dark).vline(x + 2, len + 1, 2, lit).hline(x - 1, len + 4, 2, dark);
}

/** Old bones on the flagstones. */
const BONES: readonly string[] = [
  '.hhhhb..........',
  'hhhhhbb.....hb..',
  'hkhkhbs...bbbb..',
  'hhkhbbs.bb......',
  '.hbhbs.hb.......',
  '..sbs......b.bb.',
  '..........bbb...',
];

/** The floor of the dream: flagstones, laid like bricks. */
function flagstones(p: Px): void {
  const joint = mix(P.st1, P.black, 0.4);
  const tones: Ramp = [mix(P.st2, P.er2, 0.35), mix(P.st3, P.er2, 0.3), mix(P.st3, P.er3, 0.35), mix(P.st4, P.er3, 0.3)];
  const worn: Ramp = tones.map((c) => mix(c, P.st5, 0.35)); // the far edge of each stone
  const pitted: Ramp = tones.map((c) => mix(c, P.st1, 0.4));
  const rowOf = (y: number): number => Math.floor(floorDepth(y) * 3.4);
  const stoneOf = (x: number, y: number): number => floorLane(x, y, 38, rowOf(y) % 2 === 0 ? 0 : 19);
  for (let y = FLOOR; y < H; y++) {
    const row = rowOf(y);
    for (let x = 0; x < W; x++) {
      const stone = stoneOf(x, y);
      if (row !== rowOf(y + 1) || stone !== stoneOf(x + 1, y)) {
        p.set(x, y, joint);
        continue;
      }
      const tone = Math.floor(hash2(stone, row, 31) * 4);
      p.set(x, y, row !== rowOf(y - 1) ? worn[tone] : hash2(x, y, 41) < 0.06 ? pitted[tone] : tones[tone]);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The big figure. Both pictures share these outlines, so the librarian and the witch are the same
// looming shape: head hung forward between hunched shoulders, both arms straight down to the hands.

/** Shoulders and chest, narrowing to the waist behind the desk: she leans toward us, so the top is nearer and bigger. */
const TORSO: readonly Pt[] = [
  [110, 51], [100, 53], [90, 54], [84, 56], [92, 62], [99, 76], [105, 90], [107, 100],
  [133, 100], [135, 90], [141, 76], [148, 62], [156, 56], [150, 54], [140, 53], [130, 51],
];

/** Screen-left arm, shoulder to cuff. The other arm is its mirror image. */
const ARM: readonly Pt[] = [
  [87, 53], [82, 54], [79, 57], [78, 62], [77, 72], [78, 80], [79, 90], [90, 90], [89, 80], [89, 70], [91, 62], [91, 56],
];

/** The witch's sleeve: the same arm, with a pointed shoulder and a hem in tatters. */
const SLEEVE: readonly Pt[] = [
  [87, 52], [82, 48], [79, 53], [77, 58], [76, 66], [76, 78], [74, 90], [77, 87], [79, 94], [82, 88], [85, 93],
  [88, 87], [91, 92], [93, 85], [91, 76], [92, 66], [94, 58], [91, 53],
];

/** Both arms, lit from the middle of the picture: the insides of the sleeves catch the light. */
function arms(shape: readonly Pt[], ramp: Ramp): Px {
  const l = layer();
  l.poly(shape, ramp[0]).poly(mirror(shape), ramp[0]);
  underlit(l, ramp, CX, 100, 62, (x) => 0.13 * (x < CX ? (x - 84) / 7 : (156 - x) / 7));
  return l;
}

/**
 * Top row of the librarian's hair. The head hangs low between the shoulders, which is most of the
 * looming. (Her bun, collar and brooch, and the witch's hat, hair and cowl, are placed to match.)
 */
const HEAD_TOP = 15;

// ----- the librarian ---------------------------------------------------------------------------

const CARDIGAN: Ramp = [
  mix(P.st2, P.pu1, 0.35),
  mix(P.st3, P.pu2, 0.25),
  mix(P.st4, P.pu3, 0.22),
  mix(mix(P.st5, P.pu3, 0.25), P.er4, 0.25),
  mix(mix(P.st6, P.pu4, 0.2), P.fr5, 0.3),
];

const SKIN: Ramp = [
  mix(P.sk1, P.ink, 0.45),
  mix(P.sk1, P.st3, 0.35),
  mix(P.sk2, P.st4, 0.3),
  mix(P.sk2, P.sk3, 0.5),
  mix(P.sk3, P.sk4, 0.5),
  mix(P.sk4, P.gd5, 0.35),
];

const LIB_KEY: Key = {
  a: mix(P.sl1, P.ink, 0.5),
  b: P.sl1,
  c: mix(P.sl1, P.sl2, 0.5),
  d: P.sl2,
  '1': SKIN[0],
  '2': SKIN[1],
  '3': SKIN[2],
  '4': SKIN[3],
  '5': SKIN[4],
  '6': SKIN[5],
  e: P.ink,
  f: P.ink,
  w: P.gd5,
  W: P.white,
  n: mix(P.sk1, P.ink, 0.65),
  m: mix(P.bl1, P.ink, 0.4),
  p: P.bn2,
  P: P.bn4,
  k: P.ink,
};

/** The librarian's head, left half (columns 102..119), from row HEAD_TOP down to the chin. The right half is its mirror image. */
const LIB_HEAD: readonly string[] = [
  '............bbbbbb',
  '.........bbbbccccc',
  '.......bbbcccccccc',
  '......abbccccccccc',
  '.....abbcccccdcccc',
  '....abbccccdcccccc',
  '...abbcccdcccccccc',
  '...abbccdccccccccc',
  '...abbcccccccccccb',
  '...abbccccccccb222',
  '...abbcccccb222233',
  '...abbcccb22233333',
  '...abbcb2223333333',
  '...abbb22233333323',
  '...abb222333333323',
  '...abb2eeee3333323',
  '...ab22333eeeee323',
  '...ab223fffff33334',
  '...a223fwwwwwf3334',
  '..3223fwwWWWwwf3ff',
  '.4fffffwWWWWWwff44',
  '.53223fwWWWWWwf334',
  '.53223fwWWWWWwf334',
  '.43223fwwWWWwwf334',
  '.422234fwwwwwf4334',
  '.3223455fffff54334',
  '.pP234555555544334',
  '.Pp.23455554444344',
  '....23444444443345',
  '.....2333444443345',
  '.....2333344434455',
  '......333344345556',
  '......533444344nn6',
  '.......53443444455',
  '.......54434455555',
  '........5434444444',
  '........54344mmmmm',
  '.........544445555',
  '..........54455555',
  '...........5555566',
  '............555666',
  '.............55666',
  '..............5666',
];

function librarianTorso(): Px {
  const l = layer();
  l.poly(TORSO, CARDIGAN[0]);
  // soft wool: the lamp's light climbs it unevenly
  underlit(l, CARDIGAN, CX, 100, 62, (x) => 0.03 * Math.sin(x * 0.8) + 0.02 * Math.sin(x * 0.31 + 2));
  // folds dragging from the shoulders toward the waist
  l.line(98, 60, 104, 76, CARDIGAN[1]).line(142, 60, 136, 76, CARDIGAN[1]);
  l.line(104, 62, 108, 74, CARDIGAN[1]).line(136, 62, 132, 74, CARDIGAN[1]);
  // the blouse in the V of the cardigan, and the cardigan's ribbed front edges
  l.poly([[115, 59], [125, 59], [121, 76], [119, 76]], P.bn2);
  l.poly([[117, 65], [123, 65], [121, 76], [119, 76]], P.bn3);
  l.line(114, 59, 118, 75, CARDIGAN[3]).line(125, 59, 121, 75, CARDIGAN[3]);
  l.line(113, 59, 117, 75, CARDIGAN[1]).line(126, 59, 122, 75, CARDIGAN[1]);
  l.vline(119, 76, 24, CARDIGAN[1]).vline(120, 76, 24, CARDIGAN[4]);
  l.set(119, 69, P.bn1).set(120, 69, P.bn1);
  rimLeft(l, P.bu4, 0.45);
  return l;
}

function librarianCollar(): Px {
  const l = layer();
  // a high collar with two stiff points, and a brooch at the throat
  l.poly([[110, 50], [130, 50], [131, 56], [127, 61], [122, 58], [118, 58], [113, 61], [109, 56]], P.bn2);
  l.line(110, 56, 113, 60, P.bn3).line(130, 56, 127, 60, P.bn3);
  return l;
}

function brooch(): Px {
  const l = layer();
  l.rect(118, 58, 4, 4, P.gd3).hline(118, 58, 3, P.gd4).set(121, 61, P.gd2);
  l.rect(119, 59, 2, 2, P.bl3).set(119, 59, P.bl5);
  return l;
}

function librarianHead(): Px {
  const l = layer();
  stampBoth(l, HEAD_TOP, LIB_HEAD, LIB_KEY);
  // the hair is dragged back tight into the bun: comb lines from the hairline to the crown
  const hair = new Set<string>([LIB_KEY.b, LIB_KEY.c, LIB_KEY.d]);
  const comb = layer();
  for (const c of [[105, 31, 113, 17], [107, 28, 115, 16], [110, 26, 117, 16], [114, 24, 119, 16]] as const) {
    comb.line(c[0], c[1], c[2], c[3], LIB_KEY.a).line(W - 1 - c[0], c[1], W - 1 - c[2], c[3], LIB_KEY.a);
  }
  comb.vline(120, 16, 8, LIB_KEY.a);
  scan(comb, (x, y) => {
    if (hair.has(l.get(x, y) ?? '')) l.set(x, y, LIB_KEY.a);
    return undefined;
  });
  rimLeft(l, P.bu4, 0.4, 112);
  return l;
}

/** The pencil she keeps pushed through her bun. Only its two ends show. */
function pencil(): Px {
  const l = layer();
  l.line(109, 13, 131, 5, P.gd3).line(109, 14, 131, 6, P.gd2);
  // the rubber on one end, the point on the other
  l.set(109, 13, P.bl5).set(109, 14, P.bl4).set(110, 13, P.sl4).set(110, 14, P.sl3).set(111, 12, P.sl4);
  l.set(130, 5, P.bn3).set(130, 6, P.bn2).set(131, 5, P.bn3).set(131, 6, P.bn2).set(132, 5, P.ink);
  return l;
}

function librarianBun(): Px {
  const l = layer();
  l.ellipse(CX, 9, 7.5, 6.5, LIB_KEY.b);
  // coils of hair
  l.line(115, 7, 119, 5, LIB_KEY.c).line(119, 5, 124, 7, LIB_KEY.c);
  l.line(116, 11, 120, 9, LIB_KEY.c).line(120, 9, 125, 11, LIB_KEY.c);
  l.line(114, 12, 117, 14, LIB_KEY.a).line(122, 13, 126, 10, LIB_KEY.a);
  rimLeft(l, P.bu4, 0.4);
  return l;
}

/** Her right hand (screen-left), planted on the desk with the fingers over its edge: columns 74..96, rows 90..98. */
const LIB_HAND: readonly string[] = [
  '......455555566........',
  '.....45555555566.......',
  '....445555555556656....',
  '...46456645664566566...',
  '..45345634563456k.566..',
  '.45.k456k456k456k..566.',
  '.56..456.456.456....66.',
  '.....56..456.56........',
  '.........66............',
];

function librarianArms(): Px {
  const l = arms(ARM, CARDIGAN);
  for (const flip of [false, true]) {
    const f = (x: number): number => (flip ? W - 1 - x : x);
    // ribbed cuffs
    for (let y = 85; y <= 89; y++) {
      for (let x = 78; x <= 90; x++) {
        if (y === 85) tint(l, f(x), y, P.ink, 0.45);
        else if (x % 2 === 0) tint(l, f(x), y, P.ink, 0.3);
      }
    }
    // folds at the elbow
    l.line(f(78), 72, f(83), 74, CARDIGAN[0]).line(f(79), 76, f(82), 77, CARDIGAN[0]);
  }
  rimLeft(l, P.bu4, 0.45);
  return l;
}

function librarianHands(): Px {
  const l = layer();
  stamp(l, 74, 90, LIB_HAND, LIB_KEY);
  stamp(l, W - 74 - 23, 90, LIB_HAND, LIB_KEY, true);
  return l;
}

// ----- the witch -------------------------------------------------------------------------------

const ROBE: Ramp = [mix(P.ink, P.pu1, 0.4), mix(P.ink, P.pu1, 0.85), mix(P.pu1, P.pu2, 0.4), mix(P.pu1, P.tl3, 0.6), mix(P.tl3, P.gn3, 0.4)];
const MOON = mix(P.pu5, P.bu4, 0.45);

const HAG: Ramp = [
  mix(P.gn1, P.ink, 0.55),
  mix(P.gn1, P.st2, 0.3),
  mix(P.gn2, P.bn1, 0.35),
  mix(P.gn3, P.bn2, 0.4),
  mix(P.gn4, P.bn3, 0.35),
  mix(P.gn5, P.tl5, 0.5),
];

const HAG_KEY: Key = {
  '1': HAG[0],
  '2': HAG[1],
  '3': HAG[2],
  '4': HAG[3],
  '5': HAG[4],
  '6': HAG[5],
  e: P.ink,
  y: P.fr4,
  Y: P.fr6,
  W: P.white,
  n: mix(P.gn1, P.ink, 0.7),
  m: mix(P.ink, P.bl1, 0.3),
  t: mix(P.bn4, P.gn5, 0.25),
  T: mix(P.bn2, P.gn3, 0.3),
  c: mix(P.bn3, P.gn4, 0.3),
  C: P.bn4,
  k: P.ink,
};

/** The witch's face, left half (columns 102..119), from under the brim of her hat (row HEAD_TOP + 12) to the point of her chin. */
const HAG_HEAD: readonly string[] = [
  '....11111111111111',
  '....11111111111111',
  '....11111111111212',
  '....eeee1111111212',
  '....1eeeee22222212',
  '....yYyeeeee222223',
  '....yYWWYyeeeee223',
  '....2yYWWWWYyeee33',
  '....22yYWWWWWYy234',
  '....2322yYWWWYy234',
  '....233222yyyy2234',
  '....23332111222344',
  '....34443333323345',
  '...345554433323445',
  '...456655433234455',
  '...345544332234555',
  '....23333222234555',
  '.....2222222344555',
  '.....2222232345556',
  '......223332445566',
  '......333332455566',
  '......m443324nn566',
  '......mm443234n566',
  '.......mmm43224566',
  '.......3tmmmm22456',
  '........3ttmtmm245',
  '........34tTttmtmm',
  '.........34mmTmtmm',
  '..........44mmmmtm',
  '...........455mmmm',
  '............455555',
  '.............45566',
  '..............5666',
  '...............566',
  '................66',
  '.................6',
];

/** Her right claw (screen-left), hooked over the cauldron's lip: columns 75..97, rows 88..102. */
const HAG_HAND: readonly string[] = [
  '.......3444455.........',
  '......234444555........',
  '.....23443443455.......',
  '...23443443443455......',
  '.2345345534553456.45...',
  '.356k456k456k466k.356..',
  '..35..35..45..46...46..',
  '..35..35..45..46...46..',
  '.356.356.456.466...456.',
  '..35..35..45..46....46.',
  '..35..35..45..46....45.',
  '..34..35..45..45....cC.',
  '..34..34..45..45.....c.',
  '..cC..cC..cC..cC.......',
  '..c...c...c...c........',
];

function witchTorso(): Px {
  const l = layer();
  l.poly(TORSO, ROBE[0]);
  // the brew's light rakes up the folds of the cloth: each fold catches it to a different height
  underlit(l, ROBE, CX, 100, 62, (x) => 0.07 * Math.sin(x * 1.1) + 0.05 * Math.sin(x * 0.37 + 1));
  // the dark opening of the robe at the throat, and folds hanging from the shoulders
  l.poly([[113, 59], [127, 59], [121, 82], [119, 82]], ROBE[0]);
  l.line(112, 59, 118, 81, ROBE[2]).line(128, 59, 122, 81, ROBE[2]);
  for (const x of [100, 105, 110, 130, 135, 140]) l.line(x, 60, x + (x < CX ? 3 : -3), 86, ROBE[0]);
  rimLeft(l, MOON, 0.5);
  return l;
}

function witchCowl(): Px {
  const l = layer();
  l.poly([[106, 49], [134, 49], [139, 58], [129, 65], [120, 61], [111, 65], [101, 58]], ROBE[1]);
  l.line(102, 58, 111, 64, ROBE[3]).line(138, 58, 129, 64, ROBE[3]);
  l.line(112, 64, 119, 61, ROBE[2]).line(128, 64, 121, 61, ROBE[2]);
  return l;
}

function amulet(): Px {
  const l = layer();
  // a tooth necklace and a stone that glows like the brew
  for (const dx of [-8, -5, 5, 8]) l.vline(CX + dx - (dx < 0 ? 1 : 0), Math.abs(dx) === 5 ? 69 : 67, 2, P.bn3);
  l.rect(118, 68, 4, 4, P.gd2).hline(118, 68, 3, P.gd3);
  l.rect(119, 69, 2, 2, P.tl4).set(119, 69, P.tl5);
  return l;
}

function witchHair(): Px {
  const l = layer();
  const lit = mix(P.st6, P.gn4, 0.35);
  const mid = mix(P.st4, P.gn2, 0.3);
  const dim = mix(P.st2, P.gn1, 0.4);
  const strand = (x0: number, y0: number, len: number, drift: number, phase: number, c: string): void => {
    for (let k = 0; k < len; k++) l.set(Math.round(x0 + drift * k + 1.3 * Math.sin(k / 4 + phase)), y0 + k, c);
  };
  for (const side of [-1, 1]) {
    const x = (dx: number): number => CX + side * dx - (side < 0 ? 1 : 0);
    const ph = side < 0 ? 0 : 1.7;
    strand(x(15), 25, 36, side * 0.06, 0.4 + ph, dim);
    strand(x(16), 25, 40, side * 0.08, 1.9 + ph, mid);
    strand(x(17), 26, 33, side * 0.1, 3.1 + ph, lit);
    strand(x(18), 26, 42, side * 0.12, 0.9 + ph, dim);
    strand(x(19), 27, 29, side * 0.16, 2.4 + ph, mid);
    strand(x(20), 28, 37, side * 0.18, 4.0 + ph, lit);
    strand(x(22), 29, 24, side * 0.25, 1.2 + ph, dim);
  }
  return l;
}

function witchHead(): Px {
  const l = layer();
  stampBoth(l, HEAD_TOP + 12, HAG_HEAD, HAG_KEY);
  // nothing about her is even: a tooth knocked out, a wart on the nose and one on the chin
  l.set(126, 52, HAG_KEY.m).set(127, 52, HAG_KEY.m).set(125, 53, HAG_KEY.m).set(126, 53, HAG_KEY.m);
  l.set(124, 45, HAG[5]).set(125, 45, HAG[1]).set(124, 46, HAG[1]);
  l.set(116, 58, HAG[5]).set(116, 59, HAG[2]);
  return l;
}

const HAT: Ramp = [mix(P.black, P.pu1, 0.25), mix(P.ink, P.pu1, 0.55), mix(P.pu1, P.pu2, 0.45), mix(P.pu2, P.tl3, 0.45), P.tl3];

function witchHat(): Px {
  const l = layer();
  // the crown: a tall cone with a crook in it, running off the top of the picture
  l.poly([[102, 24], [105, 12], [107, 9], [114, 3], [119, -1], [137, -1], [130, 10], [133, 15], [138, 24]], HAT[1]);
  l.poly([[128, 24], [128, 13], [126, 10], [132, -1], [137, -1], [130, 10], [133, 15], [138, 24]], HAT[0]);
  l.line(106, 10, 129, 11, HAT[0]).line(107, 11, 129, 12, HAT[2]);
  // a patch, stitched on
  l.rect(110, 13, 5, 4, HAT[2]).set(109, 13, P.bn1).set(115, 14, P.bn1).set(111, 17, P.bn1).set(113, 12, P.bn1);
  // band and buckle
  l.poly([[103, 18], [137, 18], [138, 24], [102, 24]], mix(P.bl2, P.pu2, 0.5));
  l.hline(103, 18, 34, mix(P.bl1, P.pu1, 0.5));
  l.rect(117, 17, 6, 6, P.gd3).rect(118, 18, 4, 4, mix(P.bl1, P.pu1, 0.5)).hline(117, 17, 5, P.gd4).vline(117, 17, 5, P.gd4);
  rimLeft(l, MOON, 0.5);
  // the brim, wide and drooping; its front edge catches the light of the brew
  const brim = layer();
  brim.ellipse(CX, 24, 39, 6, HAT[1]);
  scan(brim, (x, y) => {
    if (!brim.has(x, y + 1)) return HAT[4];
    if (!brim.has(x, y + 2)) return HAT[3];
    if (!brim.has(x, y - 1)) return HAT[0];
    return y > 25 ? HAT[2] : HAT[1];
  });
  // the crown stands on the brim
  for (let y = 0; y < 24; y++) for (let x = 100; x < 140; x++) if (l.has(x, y)) brim.erase(x, y);
  l.blit(brim, 0, 0);
  return l;
}

function witchArms(): Px {
  const l = arms(SLEEVE, ROBE);
  for (const flip of [false, true]) {
    const f = (x: number): number => (flip ? W - 1 - x : x);
    l.line(f(79), 62, f(80), 86, ROBE[0]).line(f(84), 66, f(85), 88, ROBE[1]).line(f(88), 62, f(88), 84, ROBE[1]);
  }
  rimLeft(l, MOON, 0.55);
  return l;
}

function witchHands(): Px {
  const l = layer();
  stamp(l, 75, 88, HAG_HAND, HAG_KEY);
  stamp(l, W - 75 - 23, 88, HAG_HAND, HAG_KEY, true);
  return l;
}

// ---------------------------------------------------------------------------------------------
// The big object

const DESK_TOP: Ramp = [P.wd3, P.wd4, P.wd5, mix(P.wd5, P.gd4, 0.5)];

/** One sunk panel of the desk front, with a raised field in the middle. */
function panel(l: Px, x0: number, y0: number, x1: number, y1: number): void {
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const sunk = mix(P.wd1, P.wd2, 0.4);
  const shadow = mix(P.wd1, P.ink, 0.55);
  l.rect(x0, y0, w, h, sunk);
  l.hline(x0, y0, w, shadow).vline(x0, y0, h, shadow);
  l.hline(x0, y1, w, P.wd3).vline(x1, y0, h, P.wd3);
  l.rect(x0 + 3, y0 + 3, w - 6, h - 6, P.wd2);
  l.hline(x0 + 3, y0 + 3, w - 6, P.wd3).vline(x0 + 3, y0 + 3, h - 6, P.wd3);
  l.hline(x0 + 3, y1 - 3, w - 6, P.wd1).vline(x1 - 3, y0 + 3, h - 6, P.wd1);
}

function desk(): Px {
  const l = layer();
  l.rect(46, LIP + 4, 148, 31, P.wd2);
  panel(l, 51, 106, 103, 128);
  panel(l, 109, 106, 130, 128);
  panel(l, 136, 106, 188, 128);
  // grain
  scan(l, (x, y) => (hash2(x, Math.floor(y / 6), 3) < 0.09 ? mix(l.get(x, y) as string, P.wd1, 0.35) : undefined));
  // a brass slot for returned books
  const brass = mix(P.gd2, P.wd2, 0.35);
  l.rect(150, 119, 24, 7, brass).hline(150, 119, 24, mix(P.gd3, P.wd3, 0.3)).hline(150, 125, 24, mix(P.gd1, P.wd1, 0.4));
  l.rect(153, 121, 18, 2, P.ink).hline(153, 123, 18, mix(P.gd3, P.wd3, 0.2));
  l.set(151, 120, P.gd3).set(172, 120, P.gd3).set(151, 124, P.gd2).set(172, 124, P.gd2);
  l.rect(46, LIP + 4, 148, 2, mix(P.wd1, P.ink, 0.6)); // shadow under the overhanging top
  // plinth
  l.rect(44, 132, 152, 6, P.wd2).hline(44, 132, 152, P.wd3).hline(44, 137, 152, P.wd1);
  // the top: a thick slab seen almost edge-on, bright where the lamp stands
  for (let x = 42; x < 198; x++) {
    const d = Math.abs(x + 0.5 - CX);
    const i = d < 28 ? 3 : d < 48 ? 2 : d < 66 ? 1 : 0;
    l.set(x, TOP, DESK_TOP[Math.max(0, i - 1)]);
    l.vline(x, TOP + 1, 3, DESK_TOP[i]);
    l.set(x, LIP, DESK_TOP[Math.max(1, i - 1)]);
    l.set(x, LIP + 1, i > 1 ? P.wd3 : P.wd2);
    l.set(x, LIP + 2, P.wd2);
    l.set(x, LIP + 3, P.wd1);
  }
  return l;
}

/** The green-shaded desk lamp: the one light in the library. */
function lamp(): Px {
  const l = layer();
  const g: Ramp = [P.gn2, P.gn3, mix(P.gn3, P.gn4, 0.5), P.gn4, mix(P.gn4, P.gn5, 0.6)];
  const rows: ReadonlyArray<readonly [number, number, number]> = [
    [112, 127, 0],
    [110, 129, 1],
    [109, 130, 1],
    [108, 131, 2],
    [108, 131, 2],
    [107, 132, 3],
    [107, 132, 3],
    [107, 132, 4],
  ];
  rows.forEach((r, i) => {
    for (let x = r[0]; x <= r[1]; x++) {
      const end = x - r[0] < 2 || r[1] - x < 2;
      l.set(x, 76 + i, g[Math.max(0, r[2] - (end ? 1 : 0))]);
    }
  });
  l.hline(112, 78, 6, P.gn5).hline(111, 79, 3, P.gn5); // the gleam on the glass
  l.hline(107, 84, 26, P.gd3).hline(112, 84, 16, P.gd4); // brass rim
  // stem and foot
  l.rect(119, 85, 2, 7, P.gd3).vline(119, 85, 7, P.gd4);
  l.hline(115, 92, 10, P.gd4).hline(113, 93, 14, P.gd3).hline(112, 94, 16, P.gd2);
  // pull chain
  l.set(129, 86, P.gd3).set(129, 88, P.gd3).set(129, 90, P.gd4);
  return l;
}

const STACK: readonly string[] = [
  '.....gggggggggggggggg...',
  '.....GGGGGGGyGGGGGGGGd..',
  '.....GGGGGGGyGGGGGGGGd..',
  '.....dddddddddddddddd...',
  '..rrrrrrrrrrrrrrrrrrrrr.',
  '..RppppppppppppppppppPr.',
  '..RpPpPppPpPppPpPppPpPr.',
  '..RppppppppppppppppppPr.',
  '..eeeeeeeeeeeeeeeeeeeee.',
  'bbbbbbbbbbbbbbbbbbbbbbbb',
  'BBBlllBBBBBBBBBBBByBBBBD',
  'BBBlllBBBBBBBBBBBByBBBBD',
  'BBBBBBBBBBBBBBBBBByBBBBD',
  'BBBBBBBBBBBBBBBBBBBBBBBD',
  'DDDDDDDDDDDDDDDDDDDDDDDD',
];
const STACK_KEY: Key = {
  g: dull(P.gn3, 0.3),
  G: dull(P.gn2, 0.25),
  d: dull(P.gn1, 0.2),
  y: P.gd3,
  r: dull(P.bl3, 0.25),
  R: dull(P.bl2, 0.2),
  e: dull(P.bl1, 0.2),
  p: P.bn2,
  P: P.bn3,
  b: dull(P.bu3, 0.35),
  B: dull(P.bu2, 0.3),
  D: dull(P.bu1, 0.2),
  l: P.bn2,
};

const BELL: readonly string[] = [
  '......bb.....',
  '......Bb.....',
  '....BBbbbd...',
  '...BBbbbbdd..',
  '..BBHBbbbbdd.',
  '..BBBBbbbbdd.',
  '..dbbbbbbddd.',
  '.KKKKKKKKKKK.',
  '.kkkkkkkkkkk.',
];
const BELL_KEY: Key = { b: P.gd3, B: P.gd4, H: P.gd5, d: P.gd2, K: P.wd2, k: P.wd1 };

/** The date stamp, standing on its pad. */
const STAMP: readonly string[] = [
  '..wWw..',
  '.wWWWd.',
  '..wWd..',
  '..wWd..',
  '..wWd..',
  '.kkkkk.',
  '.kKKKk.',
  'rrrrrrr',
  'RRRRRRR',
];
const STAMP_KEY: Key = { w: P.wd4, W: P.wd5, d: P.wd3, k: P.st2, K: P.st4, r: dull(P.bl3, 0.3), R: dull(P.bl1, 0.2) };

/** The pink detention slip, lying on the desk with its end hanging over the edge. No words: just the look of a form. */
function slip(l: Px): void {
  const lit = mix(P.bl5, P.white, 0.5);
  const mid = mix(P.bl5, P.white, 0.2);
  const shade = mix(P.bl5, P.bl3, 0.35);
  const text = mix(P.bl2, P.ink, 0.25);
  l.hline(134, TOP + 1, 8, mid).hline(133, TOP + 2, 9, lit).hline(133, TOP + 3, 9, lit);
  l.rect(133, LIP, 9, 11, mid).hline(133, LIP, 9, lit).vline(141, LIP + 1, 10, shade);
  l.hline(134, LIP + 11, 9, shade).set(133, LIP + 10, shade); // the end curls up a little
  l.hline(135, LIP + 2, 5, text).hline(135, LIP + 3, 5, text); // a heavy heading, then three lines and a signature
  l.hline(135, LIP + 5, 5, text).hline(135, LIP + 7, 4, text).hline(137, LIP + 9, 3, text);
}

const IRON: Ramp = [mix(P.black, P.ink, 0.5), mix(P.ink, P.sl1, 0.3), mix(P.ink, P.sl1, 0.7), P.sl1];
const BREW: Ramp = [
  mix(P.tl2, P.gn2, 0.5),
  mix(P.tl3, P.gn3, 0.5),
  mix(P.tl4, P.gn4, 0.5),
  mix(P.tl5, P.gn5, 0.5),
  mix(mix(P.tl5, P.gn5, 0.5), P.white, 0.55),
];

/** Words of power cut into the iron, 5 x 6 each: the same kind of glyph the game's wordsmith works with. */
const RUNES: ReadonlyArray<readonly string[]> = [
  ['x.x.x', 'x.x.x', '.xxx.', '..x..', '..x..', '..x..'],
  ['.x...', '.xx..', '.x.x.', '.xx..', '.x...', '.x...'],
  ['..x..', '.x.x.', 'x...x', '.x.x.', '..x..', '..x..'],
  ['x...x', '.x.x.', '..x..', '.x.x.', 'x...x', '.....'],
  ['.x...', '.x.x.', '.xx..', '.x.x.', '.x..x', '.x...'],
  ['..x..', '..x..', 'xxxxx', '..x..', '.x.x.', 'x...x'],
];

/** The widest row of the cauldron, and how far its round bottom hangs below that. */
const POT_MID = 112;
const POT_DEPTH = 21.5;

/** The surface of the brew: an oval about (CX, BREW_Y), this far across and this far up and down. */
const BREW_Y = 96.8;
const BREW_RX = 72;
const BREW_RY = 4.2;

/** Half the cauldron's width at row y. */
function belly(y: number): number {
  return y < POT_MID ? 80 - (POT_MID - y) * (POT_MID - y) * 0.08 : 80 * Math.sqrt(Math.max(0, 1 - ((y - POT_MID) / POT_DEPTH) ** 2));
}

function cauldron(): Px {
  const l = layer();
  const heat: Ramp = [mix(IRON[1], P.fr1, 0.45), mix(IRON[1], P.fr1, 0.9), mix(P.fr1, P.fr2, 0.5), P.fr2, mix(P.fr2, P.fr3, 0.7)];
  // three stubby legs (the middle one is behind the knight)
  for (const s of [-1, 1]) {
    const leg = layer();
    leg.poly([[CX + s * 64, 118], [CX + s * 50, 126], [CX + s * 54, 141], [CX + s * 66, 141]], IRON[1]);
    scan(leg, (x, y) => {
      const inner = s < 0 ? !leg.has(x + 1, y) : !leg.has(x - 1, y);
      return inner ? heat[2] : y > 138 ? IRON[0] : undefined;
    });
    l.blit(leg, 0, 0);
  }
  l.rect(114, 128, 12, 13, IRON[1]);
  // the pot
  for (let y = 103; y <= POT_MID + POT_DEPTH; y++) {
    const hw = belly(y + 0.5);
    for (let x = Math.round(CX - hw); x < Math.round(CX + hw); x++) {
      const nx = (x + 0.5 - CX) / 80;
      const under = POT_MID + POT_DEPTH * Math.sqrt(Math.max(0, 1 - nx * nx)) - (y + 0.5); // rows above the bottom edge
      let c = Math.abs(x + 0.5 - CX) > hw - 3 ? IRON[0] : IRON[1];
      // the fire lights the underside
      const k = ditherBand(1 - under / (11 - 5 * nx * nx), 5, x, y);
      if (k > 0 && Math.abs(nx) < 0.93) c = heat[k - 1];
      l.set(x, y, c);
    }
  }
  // a riveted band
  for (let x = 46; x < 194; x++) {
    const y = 107 + Math.round(2.5 * (1 - ((x + 0.5 - CX) / 76) ** 2));
    l.set(x, y, IRON[2]).set(x, y + 1, IRON[0]);
    if (x % 9 === 3) l.set(x, y, P.sl2);
  }
  // a ring of runes below the band; they glow faintly, the ones nearest the middle most
  [-64, -50, -36, -22, 22, 36, 50, 64].forEach((dx, i) => {
    const near = Math.abs(dx) < 40;
    const top = 112 + Math.round(2.5 * (1 - (dx / 76) ** 2));
    stamp(l, CX + dx - 2, top, RUNES[i % RUNES.length], { x: near ? P.tl3 : P.tl2 });
  });
  // ring handles
  for (const s of [-1, 1]) {
    const x = CX + s * 80 - (s < 0 ? 0 : 1);
    l.rect(x - 2, 104, 5, 2, IRON[2]).vline(x - 2 * s, 106, 7, IRON[2]).vline(x + 2 * s, 106, 7, IRON[1]).hline(x - 2, 113, 5, IRON[1]);
  }
  // the rim: a thick iron ring, and the brew brimming inside it
  const inBrew = (x: number, y: number): number => ((x + 0.5 - CX) / BREW_RX) ** 2 + ((y + 0.5 - BREW_Y) / BREW_RY) ** 2;
  const farRim = mix(P.sl1, P.tl2, 0.5);
  const inside = mix(P.tl2, P.tl3, 0.5); // the inside of the pot, lit by the brew
  for (let y = 88; y <= 105; y++) {
    for (let x = 40; x < 200; x++) {
      if (((x + 0.5 - CX) / 78) ** 2 + ((y + 0.5 - 97) / 7.5) ** 2 > 1) continue;
      const inMouth = ((x + 0.5 - CX) / 73) ** 2 + ((y + 0.5 - 96) / 5) ** 2 <= 1;
      if (!inMouth) {
        if (y < 96) l.set(x, y, farRim);
        else l.set(x, y, y >= 103 ? IRON[0] : y >= 101 ? IRON[1] : IRON[2]);
        continue;
      }
      const r = inBrew(x, y);
      if (r > 1) {
        l.set(x, y, y < 96 ? inside : IRON[0]);
        continue;
      }
      l.set(x, y, r < 0.2 ? BREW[4] : r < 0.5 ? BREW[3] : r < 0.82 ? BREW[2] : BREW[1]);
    }
  }
  // the lit top edge of the front lip
  for (let x = 44; x < 196; x++) {
    for (let y = 96; y <= 104; y++) {
      if (l.get(x, y) !== IRON[2]) continue;
      const above = l.get(x, y - 1) ?? '';
      if (above === IRON[0] || BREW.includes(above)) l.set(x, y, P.tl3);
      break;
    }
  }
  return l;
}

/** The bubbles standing on the brew: where the middle of each one's foot is, and how big it is. */
const BUBBLES: ReadonlyArray<readonly [cx: number, cy: number, r: number]> = [
  [104, 97, 3.2],
  [133, 98, 4.2],
  [146, 96, 2.2],
  [68, 98, 2.4],
  [175, 98, 3],
  [112, 95, 1.6],
];

/** The pixels of one bubble: a dome with a dark skin, and a glint on its upper left. */
function bubbleDots(cx: number, cy: number, r: number, put: (x: number, y: number, c: string) => void): void {
  for (let y = Math.floor(cy - r); y <= cy; y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d > r) continue;
      put(x, y, d > r - 1 ? BREW[1] : BREW[3]);
    }
  }
  put(Math.floor(cx - r / 2), Math.floor(cy - r / 2), P.white);
}

/** The drop hanging from the drip over the lip: its lowest pixel. */
const DRIP_TIP: Pt = [140, 111];

/** Bubbles, ripples and things afloat in the brew. */
function brewLife(p: Px): void {
  for (const b of BUBBLES) bubbleDots(b[0], b[1], b[2], (x, y, c) => p.set(x, y, c));
  // ripples
  p.hline(114, 97, 7, BREW[4]).hline(123, 99, 5, P.white).hline(96, 99, 5, BREW[4]).hline(138, 95, 4, BREW[4]);
  p.hline(58, 97, 6, BREW[3]).hline(180, 96, 6, BREW[3]).hline(84, 100, 5, BREW[1]).hline(150, 100, 6, BREW[1]);
  // loose bubbles rising
  for (const b of [[108, 86], [139, 82], [127, 76], [99, 79], [150, 88]] as const) {
    p.set(b[0], b[1], BREW[3]).set(b[0] + 1, b[1], BREW[2]).set(b[0], b[1] + 1, BREW[2]);
  }
  // a drip over the lip
  p.vline(139, 99, 8, BREW[2]).vline(140, 99, 10, BREW[3]).rect(139, 108, 3, 3, BREW[3]).set(140, 108, P.white).set(DRIP_TIP[0], DRIP_TIP[1], BREW[2]);
}

const STEAM = mix(BREW[3], P.white, 0.35);

/** A wisp of steam: where it leaves the brew, how many rows it climbs, how far it sways and from what point in its sway, and how wide it starts. */
interface Wisp {
  x0: number;
  y0: number;
  len: number;
  sway: number;
  phase: number;
  w0: number;
}
const WISPS: readonly Wisp[] = [
  { x0: 101, y0: 92, len: 34, sway: 4, phase: 0.3, w0: 3 },
  { x0: 126, y0: 91, len: 30, sway: 5, phase: 2.2, w0: 3.5 },
  { x0: 143, y0: 92, len: 37, sway: 4, phase: 4.4, w0: 2.6 },
  { x0: 113, y0: 90, len: 22, sway: 3, phase: 1.1, w0: 2 },
];

/** The middle of a wisp, and half its width, `k` rows up from the brew. */
function wispAt(v: Wisp, k: number): { x: number; w: number } {
  const f = k / v.len;
  return { x: v.x0 + v.sway * Math.sin(k / 5.5 + v.phase) * (0.4 + f), w: v.w0 * (1 - f * 0.55) * (0.75 + 0.25 * Math.sin(k / 2.3 + v.phase)) };
}

/** Steam curling up in front of the witch: a veil over whatever it drifts across. */
function steam(p: Stack): void {
  for (const v of WISPS) {
    for (let k = 0; k < v.len; k++) {
      const f = k / v.len;
      const { x, w } = wispAt(v, k);
      for (let dx = -Math.ceil(w); dx <= Math.ceil(w); dx++) {
        const a = 1 - Math.abs(dx) / (w + 0.5);
        if (a <= 0) continue;
        // three strengths as it rises and thins, and a fainter edge: flat steps, not a smooth fade
        p.tint(Math.round(x + dx), v.y0 - k, STEAM, (f < 0.35 ? 0.34 : f < 0.7 ? 0.24 : 0.14) * (a > 0.55 ? 1 : 0.5));
      }
    }
  }
}

/** A tongue of flame: the column and row it stands on, half its width, its height, and how far its tip leans over. */
type Tongue = readonly [cx: number, base: number, w: number, h: number, leanTo: number];

/** The flames licking up round the pot, behind it... */
const TONGUES: readonly Tongue[] = [
  [76, 139, 3, 9, -2],
  [87, 138, 4, 13, 1],
  [98, 138, 4, 10, -1],
  [106, 138, 3, 8, 1],
  [135, 138, 3, 9, -1],
  [143, 138, 4, 11, 1],
  [154, 138, 4, 13, -1],
  [165, 139, 3, 9, 2],
];
/** ...and the two in front of its round bottom. */
const FRONT_TONGUES: readonly Tongue[] = [
  [92, 139, 3, 7, 1],
  [148, 139, 3, 7, -1],
];

const FLAME: Ramp = [P.fr3, P.fr4, P.fr5, P.fr6];

/** The pixels of one tongue of flame: four flames one inside the other, the hottest in the middle. */
function tongueDots(cx: number, base: number, w: number, h: number, leanTo: number, put: (x: number, y: number, c: string) => void): void {
  const scale = [1, 0.7, 0.45, 0.22];
  FLAME.forEach((col, i) => {
    const hh = h * scale[i];
    for (let k = 0; k < hh; k++) {
      const f = (k + 0.5) / hh;
      const hw = w * scale[i] * Math.pow(1 - f, 0.8);
      const mid = cx + leanTo * Math.pow(k / h, 1.5);
      for (let x = Math.round(mid - hw); x < Math.round(mid + hw); x++) put(x, base - k, col);
    }
  });
}

/** Paint one tongue of flame. */
function tongue(p: Px, v: Tongue): void {
  tongueDots(v[0], v[1], v[2], v[3], v[4], (x, y, c) => p.set(x, y, c));
}

/** The fire under the cauldron: a bed of embers and small flames licking up round the pot. */
function fire(p: Px): void {
  for (let y = 135; y <= 142; y++) {
    for (let x = 62; x < 178; x++) {
      const edge = Math.abs(x + 0.5 - CX) / 58;
      if (hash2(x, y, 5) < edge * edge * 0.9) continue;
      const hot = hash2(x >> 1, y >> 1, 9) + (139 - Math.abs(y - 138) * 2 - 135) * 0.04;
      p.set(x, y, hot > 0.86 ? P.fr6 : hot > 0.66 ? P.fr5 : hot > 0.42 ? P.fr4 : hot > 0.22 ? P.fr3 : hot > 0.1 ? P.fr2 : P.fr1);
    }
  }
  // charred logs
  p.line(70, 141, 100, 136, P.wd1).line(71, 142, 101, 137, mix(P.wd1, P.ink, 0.5));
  p.line(140, 136, 170, 141, P.wd1).line(140, 137, 170, 142, mix(P.wd1, P.ink, 0.5));
  for (const v of TONGUES) tongue(p, v);
}

// ---------------------------------------------------------------------------------------------
// The small figure, seen from behind

const KID_KEY: Key = {
  Y: mix(P.wd5, P.gd5, 0.6),
  I: P.wd5,
  i: P.wd4,
  H: P.wd3,
  h: P.wd2,
  d: P.wd1,
  S: P.sk3,
  T: P.sk4,
  s: P.sk2,
  C: P.bn4,
  o: mix(P.bl4, P.gd4, 0.55),
  '4': P.bl4,
  '3': P.bl3,
  '2': P.bl2,
  '1': P.bl1,
  t: P.tl1,
  u: P.tl2,
  U: P.tl3,
  v: P.tl4,
  g: P.sl1,
  G: P.sl2,
  j: P.sl1,
  W: P.bn4,
  w: P.bn2,
  n: P.wd3,
  B: P.wd2,
  b: P.wd1,
};

/**
 * The child: columns 108..131, rows 114..156. Drawn so as to be anybody's child, a boy or a girl
 * (the owner: "make the kid and knight in the title art gender neutral"): a mop of hair down to
 * the shoulders, a school jumper, a backpack, long trousers.
 */
const KID: readonly string[] = [
  '..........Y....Y........',
  '.......Y.YYi.YYYi.Y.....',
  '......YYYiiiYiiiiYYY....',
  '.....YiiiIiiiiIiiiiiY...',
  '....YiiiiiHiiiiHiiiiY...',
  '....iiiHiiHHiiHHiiHii...',
  '....iHHHHiHHHHHHiHHHi...',
  '....HHHhHHHHhHHHHhHHH...',
  '....HHhhHHhHHhHHhhHHH...',
  '....HhhhHhhHHhhHhhhHH...',
  '...HHhhhhhhHhhhhhhhhHH..',
  '...HhhhdhhhhdhhhhdhhhH..',
  '...HhhdhhdhhdhhdhhdhhH..',
  '...hhddhddhddhddhddhhh..',
  '...hdddhdhdhddhdhdddh...',
  '....dddddddddddddddd....',
  '....o44t34433443t44o....',
  '..o4332vvvvvvvvvv2334o..',
  '..43232UUUUUUUUUU23234..',
  '..43212Uuuuuuuuut21234..',
  '..43212Uuuuuuuuut21234..',
  '..43212UuUUUUUUut21234..',
  '..43212Uuuuuuuuut21234..',
  '..43212Uuvvvvvvut21234..',
  '..43212UuUuuuuUut21234..',
  '..43212UuUuuuuUut21234..',
  '..43212UuUuuuuUut21234..',
  '..33212UuUUUUUUut21233..',
  '..33212tuuuuuuutt21233..',
  '..332122tttttttt221233..',
  '..22112222222222221122..',
  '..SSs.gGGGGGGGGGGg.sSS..',
  '..Ss..gGGGGgGGGGGg..sS..',
  '......gGGGGgjGGGGg......',
  '......gGGGg..GGGGg......',
  '.......GGGg..GGGg.......',
  '.......GGGg..GGGg.......',
  '.......GGgg..GGgg.......',
  '.......GGgg..GGgg.......',
  '.......Gggg..Gggg.......',
  '......nBBBb..nBBBb......',
  '......BBBBb..BBBBb......',
  '......bbbbb..bbbbb......',
];

/** The light is above and beyond the small figure: a line of it runs along the top of them, and a fainter one down their sides. */
function backlight(l: Px, c: string): void {
  scan(l, (x, y) => {
    if (!l.has(x, y - 1)) return mix(l.get(x, y) as string, c, 0.6);
    if (y < 146 && (!l.has(x - 1, y) || !l.has(x + 1, y))) return mix(l.get(x, y) as string, c, 0.25);
    return undefined;
  });
}

function kid(): Px {
  const l = layer();
  stamp(l, 108, 114, KID, KID_KEY);
  backlight(l, P.gd5);
  return l;
}

const KNIGHT_KEY: Key = {
  '1': P.sl1,
  '2': P.sl2,
  '3': P.sl3,
  '4': P.sl4,
  '5': P.sl5,
  t: P.tl4,
  T: P.tl5,
  q: P.bl1,
  r: P.bl2,
  R: P.bl3,
  Q: P.bl4,
  g: P.gd2,
  G: P.gd3,
  Y: P.gd4,
  w: P.wd2,
  W: P.wd3,
  v: P.wd1,
  o: P.fr4,
};

/** The knight: columns 102..133, rows 110..156. Helm and plume, pauldrons, a short cape, greaves and boots: armour from head to foot, so it is whoever the child is. */
const KNIGHT: readonly string[] = [
  '.................RQR............',
  '................RQQRRr..........',
  '................rRQRRRr.........',
  '.............TTTrRQRRrTT........',
  '............t544rRQRr433t.......',
  '...........t5443rRQRr3332t......',
  '...........44433rRQRr33222......',
  '...........44333qrRRr32221......',
  '...........433333qRrq32221......',
  '...........433333qrr332221......',
  '...........3333333qr322211......',
  '...........3333322q2222211......',
  '...........GYYGGGGGGGGgggg......',
  '...........333222222222111......',
  '..........33332222222222111.....',
  '..........43333222222222211.....',
  '...........222211111111111......',
  '..............121212121.........',
  '.......TTTTtrRRRRRRRRRRRrtTTTT..',
  '......t544433rrRRRRRRRrr334445t.',
  '.....44443332qrrRRRRRrrq23334444',
  '.....44333322rRRRRRRRRRr22333344',
  '.....3333222rrRRRRRRRRRrr2223333',
  '......222211qrRRrRRRrRRrq112222.',
  '......212qrrRRrRRRrRRRrRRrrq212.',
  '......121qrrRRrRRRrRRRrRRrrq121.',
  '......212qrRRRrRRRrRRRrRRRrq212.',
  '......121qrRRRrRRRrRRRrRRRrq121.',
  '......212qrRRRrRRRrRRRrRRRrq212.',
  '......121qrRRRrRRRrRRRrRRRrq121.',
  '......212qrRRrrRRRrRRRrRRrrq212.',
  '......121qrRRrrRRrrRRRrrRrrq121.',
  '......212qrRrrrRRrrRRrrrRrrq212.',
  '......121qrrrrrRrrrRRrrrrrrq121.',
  '......332qrrrrrrrrrRrrrrrrrq233.',
  '......432qrrqrrrrqrrrrqrrrrq234.',
  '......32.gGGgGGGgGGgGGGgGGGg.23.',
  '.............4332...2334........',
  '.............4332...2334........',
  '.............5432...2345........',
  '.............o332...233o........',
  '.............o332...233o........',
  '.............o322...223o........',
  '............oWWww...wwWWo.......',
  '............oWWww...wwWWo.......',
  '...........oWWWww...wwWWWo......',
  '...........wwwwwv...vwwwww......',
];

/** The round shield slung on the knight's back, where the child's backpack is. */
function shield(): Px {
  const l = layer();
  l.ellipse(120.5, 138.5, 7.5, 7.5, P.sl3);
  l.ellipse(120.5, 138.5, 6, 6, P.wd3);
  // planks, lit from above
  for (let y = 132; y <= 145; y++) {
    for (let x = 114; x <= 126; x++) {
      if (l.get(x, y) !== P.wd3) continue;
      l.set(x, y, x % 3 === 0 ? P.wd2 : y < 137 ? P.wd4 : P.wd3);
    }
  }
  // iron bands and the boss
  l.hline(115, 138, 12, P.sl2).vline(120, 133, 12, P.sl2);
  l.ellipse(120.5, 138.5, 2.5, 2.5, P.sl3).set(119, 137, P.sl5).set(120, 137, P.sl4).set(121, 140, P.sl2);
  // the rim: the brew lights its top
  scan(l, (x, y) => {
    if (l.get(x, y) !== P.sl3) return undefined;
    return y < 135 && Math.hypot(x - 120, y - 138) > 6 ? P.tl4 : y > 142 ? P.sl1 : undefined;
  });
  return l;
}

/** The sword at the knight's hip. */
function sword(): Px {
  const l = layer();
  l.line(107, 143, 103, 154, P.wd3).line(106, 143, 102, 154, P.wd2).line(108, 143, 104, 154, P.wd1);
  l.set(102, 155, P.gd3).set(103, 155, P.gd2).set(103, 156, P.gd2);
  l.hline(103, 142, 8, P.gd3).set(103, 142, P.gd4).set(104, 142, P.gd4).set(110, 142, P.gd2);
  l.line(107, 141, 108, 138, P.wd4).line(108, 141, 109, 138, P.wd2);
  l.rect(108, 136, 2, 2, P.gd3).set(108, 136, P.gd4);
  return l;
}

function knight(): Px {
  const l = layer();
  stamp(l, 102, 110, KNIGHT, KNIGHT_KEY);
  backlight(l, P.tl5);
  return l;
}

/** The small figure's shadow: the light is in front of them, so it falls toward us. */
function castShadow(p: Stack, dark: string): void {
  const s = layer();
  s.poly([[113, 155], [127, 155], [134, H], [106, H]], P.ink);
  scan(s, (x, y) => {
    p.tint(x, y, dark, 0.55);
    return undefined;
  });
}

// ---------------------------------------------------------------------------------------------
// A picture as a stack of groups
//
// The title screen does not fade from one picture to the other: the librarian turns into the
// witch, the desk into the cauldron, the child into the knight (see title_morph.ts). For that,
// each picture is kept as six groups, back to front, and the two pictures match group for group:
//
//   bg     everything behind: wall and floor, the window or the barred arch, the shadows
//   big    the big figure: the librarian, or the witch
//   objA   the desk; or the fire, the cauldron and the flames in front of it
//   arms   her sleeves and hands
//   objB   what is on top: the books, bell, stamp, slip and lamp; or the life in the brew
//   small  the child, or the knight

/** The groups of a picture, back to front. */
export const TITLE_GROUPS = ['bg', 'big', 'objA', 'arms', 'objB', 'small'] as const;
export type TitleGroup = (typeof TITLE_GROUPS)[number];

/** One picture as its groups. Laid over one another in that order they are the picture, to the pixel. */
export type TitleStack = Readonly<Record<TitleGroup, Px>>;

/**
 * A picture being built, group by group. A part goes onto the group that is open, and its ink line
 * with it (`over(p, part)`). What used to be done to "the picture so far" has to reach every group
 * begun so far, now that the picture is not one sheet:
 *   - `gloom` and `glow` change each pixel by where it is, so each group gets them in turn (they
 *     leave empty pixels alone, so what shows is lit exactly as it was);
 *   - `tint` changes whatever shows at one spot, so it goes to the front-most group that has a
 *     pixel there.
 * Done this way the groups, laid back over one another, are the picture as it was when it was
 * painted on one sheet: tests/title.test.ts holds them to that, pixel for pixel.
 */
class Stack {
  private readonly groups: Px[] = [];

  /** Begin the next group (they come in the order of TITLE_GROUPS) and return it to be painted on. */
  open(): Px {
    const l = layer();
    this.groups.push(l);
    return l;
  }

  /** `gloom`, for the picture as it stands. */
  gloom(lx: number, ly: number, near: number, far: number, dark: string, max: number, bands = 14): void {
    for (const l of this.groups) gloom(l, lx, ly, near, far, dark, max, bands);
  }

  /** `glow`, for the picture as it stands. */
  glow(lx: number, ly: number, far: number, c: string, max: number, bands = 6): void {
    for (const l of this.groups) glow(l, lx, ly, far, c, max, bands);
  }

  /** Mix whatever shows at (x, y) toward `c`. */
  tint(x: number, y: number, c: string, t: number): void {
    for (let k = this.groups.length - 1; k >= 0; k--) {
      if (!this.groups[k].has(x, y)) continue;
      tint(this.groups[k], x, y, c, t);
      return;
    }
  }

  /** The finished picture's groups, by name. */
  done(): TitleStack {
    const [bg, big, objA, arms, objB, small] = this.groups;
    return { bg, big, objA, arms, objB, small };
  }
}

/** Lay a picture's groups over one another: the picture itself. */
export function flatten(stack: TitleStack): Px {
  const p = stack.bg.clone();
  // (a pixel is moved as one number, not as its four parts: this runs at start-up, on a phone)
  const b = new Uint32Array(p.d.buffer);
  for (const name of TITLE_GROUPS) {
    if (name === 'bg') continue;
    const d = stack[name].d;
    const a = new Uint32Array(d.buffer);
    for (let i = 0, o = 3; i < a.length; i++, o += 4) if (d[o] !== 0) b[i] = a[i];
  }
  return p;
}

// ---------------------------------------------------------------------------------------------
// The two pictures

const NIGHT = mix(P.black, P.bu1, 0.3);
const MURK = mix(P.black, P.pu1, 0.45);

/** The library, as its groups. */
export function stackReal(): TitleStack {
  const s = new Stack();

  // ---- everything behind ----
  let p = s.open();
  library(p);
  const globe = layer();
  stamp(globe, 192, BOARDS[4] - 10, GLOBE, { a: dull(P.bu1, 0.2), b: dull(P.bu2, 0.3), B: dull(P.bu3, 0.35), g: dull(P.gn3, 0.4), w: P.wd3, W: P.wd4 });
  over(p, globe);
  floorboards(p);
  // the window throws a pale shape on the floor
  for (let y = FLOOR + 3; y < H; y++) {
    for (let x = 0; x < 84; x++) {
      const lane = floorLane(x, y, 30, 8);
      if (lane >= -4 && lane <= -3 && y !== 148) tint(p, x, y, P.bu4, 0.2);
    }
  }
  s.gloom(CX, 88, 22, 135, NIGHT, 0.9);
  s.glow(CX, 88, 64, P.fr5, 0.2);
  const torso = librarianTorso();
  const bun = librarianBun();
  const head = librarianHead();
  const sleeves = librarianArms();
  wallShadow(p, [torso, bun, head, sleeves], CX, 90, 1.42, NIGHT, 0.55);
  windowGlass(p);
  cobweb(p, mix(P.er2, P.st3, 0.5));

  // ---- the librarian ----
  p = s.open();
  over(p, torso);
  over(p, librarianCollar());
  over(p, brooch());
  over(p, pencil());
  over(p, bun);
  over(p, head);

  // ---- the desk ----
  p = s.open();
  const d = desk();
  gloom(d, CX, 96, 18, 110, NIGHT, 0.6, 8);
  rimLeft(d, P.bu4, 0.3);
  over(p, d);

  // ---- her arms ----
  p = s.open();
  over(p, sleeves);
  over(p, librarianHands());
  s.glow(CX, 87, 30, P.fr6, 0.4);

  // ---- the things on the desk ----
  p = s.open();
  const things = layer();
  stamp(things, 50, 80, STACK, STACK_KEY);
  rimLeft(things, P.bu4, 0.4);
  over(p, things);
  const bell = layer();
  stamp(bell, 167, 86, BELL, BELL_KEY);
  over(p, bell);
  const stampAndPad = layer();
  stamp(stampAndPad, 184, 86, STAMP, STAMP_KEY);
  over(p, stampAndPad);
  const note = layer();
  slip(note);
  over(p, note);
  over(p, lamp());
  // the bulb under the shade, and its light on whatever is just below it
  p.hline(109, 85, 22, P.fr6).hline(112, 85, 16, P.white);
  for (let x = 111; x <= 128; x++) s.tint(x, 86, P.fr6, 0.6);

  // (the child's shadow lies on the floor, so it belongs to "everything behind": it is laid now
  // only because that is when it always was)
  castShadow(s, NIGHT);

  // ---- the child ----
  p = s.open();
  over(p, kid());
  return s.done();
}

/** The dream, as its groups. */
export function stackDream(): TitleStack {
  const s = new Stack();

  // ---- everything behind ----
  let p = s.open();
  dungeonWall(p);
  relicShelf(p);
  flagstones(p);
  stamp(p, 196, 147, BONES, SHELF_KEY);
  s.gloom(CX, 96, 22, 135, MURK, 0.9);
  s.glow(CX, 92, 92, BREW[2], 0.3, 8);
  s.glow(CX, 141, 56, P.fr3, 0.5, 12);
  const hair = witchHair();
  const torso = witchTorso();
  const head = witchHead();
  const hat = witchHat();
  const sleeves = witchArms();
  wallShadow(p, [hair, torso, head, hat, sleeves], CX, 96, 1.42, MURK, 0.55);
  archBars(p);
  cobweb(p, STONE[4]);
  chain(p, 172, 30);
  chain(p, 179, 21);

  // ---- the witch ----
  p = s.open();
  over(p, hair);
  over(p, torso);
  over(p, witchCowl());
  over(p, amulet());
  over(p, head);
  over(p, hat);

  // ---- the fire and the cauldron ----
  p = s.open();
  fire(p);
  over(p, cauldron());
  // flames in front of the pot's round bottom
  for (const v of FRONT_TONGUES) tongue(p, v);
  // sparks drifting up
  for (const q of [[58, 126, 0], [64, 133, 1], [181, 128, 0], [176, 119, 1], [52, 118, 1], [187, 136, 0], [70, 121, 1]] as const) {
    p.set(q[0], q[1], q[2] === 0 ? P.fr5 : P.fr4);
  }

  // ---- her arms ----
  p = s.open();
  over(p, sleeves);
  over(p, witchHands());
  s.glow(CX, 95, 34, BREW[3], 0.3);

  // ---- the life in the brew, and the steam (which is a veil over whatever it drifts across) ----
  p = s.open();
  brewLife(p);
  steam(s);

  castShadow(s, MURK);

  // ---- the knight ----
  p = s.open();
  over(p, knight());
  over(p, shield());
  over(p, sword());
  return s.done();
}

/** The library: one whole picture. */
export function paintReal(): Px {
  return flatten(stackReal());
}

/** The dream: one whole picture. */
export function paintDream(): Px {
  return flatten(stackDream());
}

// ---------------------------------------------------------------------------------------------
// The life in the pictures
//
// (The owner: "Make the cauldron bubble. That sort of thing.") Small things that move, drawn over
// the still pictures every frame. In the dream: bubbles swell and burst on the brew and loose ones
// rise from it, the steam drifts upward, the flames under the pot lick and the embers shimmer,
// sparks float up, the witch's eyes burn, the cat blinks. In the library: the lamp gutters, motes
// of dust drift through its light, the evening star twinkles, and now and then the cat's tail
// flicks.
//
// Nothing is remembered from one frame to the next: every dot is worked out from the time alone.
// (Bubble number 3 is, at 12.4 seconds, always in the same place and at the same size.) So the
// life cannot drift or pile up, and it does not matter how often a frame is drawn. Most of it
// moves in steps of about a tenth of a second, like hand-drawn animation, and not on every frame:
// a pixel that changes sixty times a second is noise, not a flame.

/**
 * Draws one dot of the life: the pixel (x, y) of the picture, or a block `w` wide and `h` high
 * from there, in one colour, as strongly as `a` says (1 = solid).
 */
export type LifeDot = (x: number, y: number, color: string, a: number, w?: number, h?: number) => void;

/**
 * Lay one dot of the life on a see-through sheet (RGBA, as big as the pictures): what `LifeDot`
 * asks for, done on plain numbers. A dot that is not solid is laid over what the sheet already
 * holds there in the usual way of one thin colour over another.
 */
function layDot(sheet: Uint8ClampedArray, x: number, y: number, color: string, a: number, w = 1, h = 1): void {
  if (a <= 0) return;
  const v = rgba(color);
  for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) {
    for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) {
      const o = (yy * W + xx) * 4;
      const under = (sheet[o + 3] / 255) * (1 - a);
      const all = a + under;
      sheet[o] = (v[0] * a + sheet[o] * under) / all;
      sheet[o + 1] = (v[1] * a + sheet[o + 1] * under) / all;
      sheet[o + 2] = (v[2] * a + sheet[o + 2] * under) / all;
      sheet[o + 3] = all * 255;
    }
  }
}

const FIRE: Ramp = [P.fr1, P.fr2, P.fr3, P.fr4, P.fr5, P.fr6];

/** A colour as one number, for comparing pixels. */
function packed(c: string): number {
  const v = rgba(c);
  return (v[0] << 16) | (v[1] << 8) | v[2];
}

/** Every tongue of flame, those behind the pot first; and the flames' colours as numbers. */
const ALL_TONGUES: readonly Tongue[] = [...TONGUES, ...FRONT_TONGUES];
const FLAME_PACKED = new Map<string, number>(FLAME.map((c): [string, number] => [c, packed(c)]));

/** The whole part and the rest of a count that runs on for ever: which turn of a cycle this is, and how far through it. */
function turnOf(age: number): [n: number, u: number] {
  const n = Math.floor(age);
  return [n, age - n];
}

export class TitleLife {
  /** What shows at each pixel of the dream: which group (its place in TITLE_GROUPS), and its colour as one number. */
  private readonly front = new Uint8Array(W * H);
  private readonly seen = new Int32Array(W * H);
  /** Places on the brew where a bubble can stand clear of her claws and of the painted bubbles, and those of them that lie between the claws. */
  private readonly spots: Pt[] = [];
  private middle: Pt[] = [];
  /** The painted bubbles: for each, the pixels it covers and what would show there if it were not: [x, y, colour]. */
  private readonly painted: [number, number, string][][] = [];
  /** The brew between her claws, as rows: [x, y, width]. Its glow gutters. */
  private readonly brewRows: [number, number, number][] = [];
  /** 1 where a flame behind the pot can show (the wall, the floor, the fire itself), 2 where only one in front of it can (the pot). */
  private readonly room = new Uint8Array(W * H);
  /** The embers and the feet of the flames that show: [x, y, place in FIRE]. */
  private readonly embers: [number, number, number][] = [];
  /** The witch's eyes, left and right: their white-hot pixels, the yellow ones, the orange rim, and the outer corner. */
  private readonly eyes: { hot: Pt[]; mid: Pt[]; rim: Pt[]; corner: Pt }[] = [];
  /**
   * The cat. In the library the two pixels of its tail that show (the rest hangs behind the desk)
   * can be lifted off the sill: `tail` is the fur's colour and the sill's under the second of
   * them, or null if the picture is no longer as this expects. In the dream it is looking at us,
   * and blinks: `blink` is the fur's colour there, or null.
   */
  private readonly tail: { fur: string; sill: string } | null;
  private readonly blink: string | null;
  /** The stars that are really there to twinkle: in the library's window, and in the dream's arch. */
  private readonly stars: [Pt[], Pt[]] = [[], []];
  /** The dream, until what its life needs to know about it has been worked out (`warm`). */
  private unread: TitleStack | null;

  /**
   * Costs next to nothing: the library's life needs only to find a cat and a star. What the
   * dream's needs (where the brew shows, which pixels are fire, where her eyes are) takes a few
   * thousandths of a second to work out, and is left to `warm`.
   */
  constructor(real: TitleStack, dream: TitleStack) {
    this.unread = dream;
    const [root, next] = CAT_TAIL;
    const fur = real.bg.get(root[0], root[1]);
    const sill = real.bg.get(next[0] + 1, next[1]);
    this.tail = fur && sill && real.bg.get(next[0], next[1]) === fur && real.bg.get(next[0], next[1] - 1) !== fur ? { fur, sill } : null;
    this.blink = dream.bg.get(37, 82) === P.gn5 && dream.bg.get(39, 82) === P.gn5 ? dream.bg.get(38, 83) : null;
    const star = (bg: Px, x: number, y: number, c: string): Pt[] => (bg.get(x, y) === c ? [[x, y]] : []);
    this.stars[0] = star(real.bg, Math.round(wallX(34, 31)), 31, P.bu5);
    this.stars[1] = [...star(dream.bg, Math.round(wallX(15, 22)), 22, P.pu5), ...star(dream.bg, Math.round(wallX(35, 64)), 64, P.pu4)];
  }

  /**
   * Work out what the dream's life needs to know about the dream, if that has not been done. (It
   * is done by itself the first time that life is drawn; calling this at a quiet moment before
   * then keeps the work out of the middle of the change.)
   */
  warm(): void {
    const dream = this.unread;
    if (!dream) return;
    this.unread = null;
    const groups = TITLE_GROUPS.map((name) => dream[name].d);
    for (let i = 0; i < W * H; i++) {
      let g = 0;
      for (let k = groups.length - 1; k > 0; k--) {
        if (groups[k][i * 4 + 3] > 0) {
          g = k;
          break;
        }
      }
      this.front[i] = g;
      this.seen[i] = (groups[g][i * 4] << 16) | (groups[g][i * 4 + 1] << 8) | groups[g][i * 4 + 2];
    }
    const OBJ_A = TITLE_GROUPS.indexOf('objA');
    // --- the brew: where its surface shows (nothing in front of it, and not one of the painted bubbles)
    const free = (x: number, y: number): boolean => {
      if (x < 0 || x >= W || this.front[y * W + x] !== OBJ_A) return false;
      return ((x + 0.5 - CX) / BREW_RX) ** 2 + ((y + 0.5 - BREW_Y) / BREW_RY) ** 2 <= 0.86;
    };
    for (let y = Math.floor(BREW_Y - BREW_RY); y <= Math.ceil(BREW_Y + BREW_RY); y++) {
      for (let x = CX - BREW_RX; x <= CX + BREW_RX; x++) {
        // room for the biggest bubble: nine pixels of clear brew to stand on, and nothing in front for four rows above
        let ok = true;
        for (let dx = -4; dx <= 4 && ok; dx++) {
          ok = free(x + dx, y);
          for (let up = 1; up <= 4 && ok; up++) ok = this.front[(y - up) * W + x + dx] === OBJ_A;
        }
        if (ok) this.spots.push([x, y]);
      }
    }
    this.middle = this.spots.filter((q) => Math.abs(q[0] - CX) < 20);
    // the painted bubbles: what is under each (the brew, or a claw), so that it can be made to burst
    const OBJ_B = TITLE_GROUPS.indexOf('objB');
    for (const [cx, cy, r] of BUBBLES) {
      const under = new Map<number, [number, number, string]>();
      bubbleDots(cx, cy, r, (x, y) => {
        for (let k = OBJ_B - 1; k >= 0; k--) {
          const c = dream[TITLE_GROUPS[k]].get(x, y);
          if (c === null) continue;
          under.set(y * W + x, [x, y, c]);
          break;
        }
      });
      this.painted.push([...under.values()]);
    }
    const [bx, by] = TITLE_MARKS.brew;
    for (let y = by - 1; y <= by + 1; y++) {
      let from = -1;
      for (let x = bx - 40; x <= bx + 41; x++) {
        const clear = x <= bx + 40 && free(x, y);
        if (clear && from < 0) from = x;
        else if (!clear && from >= 0) {
          this.brewRows.push([from, y, x - from]);
          from = -1;
        }
      }
    }
    // --- the fire: paint it once more on its own, to know which pixels of the finished picture are fire
    const flames = layer();
    fire(flames);
    for (const v of FRONT_TONGUES) tongue(flames, v);
    const fireTone = new Map<number, number>(FIRE.map((c, k): [number, number] => [packed(c), k]));
    for (let y = 0, i = 0; y < H; y++) {
      for (let x = 0; x < W; x++, i++) {
        const g = this.front[i];
        if (g === 0) this.room[i] = 1;
        else if (g === OBJ_A) {
          const o = i * 4;
          const isFire = flames.d[o + 3] > 0 && ((flames.d[o] << 16) | (flames.d[o + 1] << 8) | flames.d[o + 2]) === this.seen[i];
          this.room[i] = isFire ? 1 : 2;
          const tone = fireTone.get(this.seen[i]);
          if (isFire && y >= 135 && tone !== undefined) this.embers.push([x, y, tone]);
        }
      }
    }
    // --- the witch's eyes: found by their colours, in the box round each of TITLE_MARKS.eye
    const big = dream.big;
    for (const [ex, ey] of TITLE_MARKS.eye) {
      const out = ex < CX ? -1 : 1;
      const hot: Pt[] = [];
      const mid: Pt[] = [];
      const rim: Pt[] = [];
      for (let y = ey - 5; y <= ey + 4; y++) {
        for (let x = ex - 8; x <= ex + 8; x++) {
          const c = big.get(x, y);
          if (c === P.white) hot.push([x, y]);
          else if (c === P.fr6) mid.push([x, y]);
          else if (c === P.fr4) rim.push([x, y]);
        }
      }
      if (hot.length === 0 || mid.length === 0 || rim.length === 0) continue;
      // the outer corner: the rim pixel furthest out, and of those the highest (they were found from the top down)
      let corner = rim[0];
      for (const q of rim) if ((q[0] - corner[0]) * out > 0) corner = q;
      this.eyes.push({ hot, mid, rim, corner });
    }
  }

  /**
   * The life at time `t` (seconds), dot by dot. `k` is how far the picture has turned from the
   * library (0) to the dream (1): each picture's life is there only while that picture is all but
   * whole, and comes and goes with it.
   */
  draw(t: number, k: number, dot: LifeDot): void {
    const lib = clamp01(1 - k / 0.2);
    const drm = clamp01((k - 0.8) / 0.2);
    if (lib > 0) this.library(t, lib, dot);
    if (drm > 0) this.dreaming(t, drm, dot);
  }

  /**
   * The same, painted on a see-through sheet as big as the pictures (RGBA, W * H * 4) to be laid
   * over the picture. Returns false, and leaves the sheet alone, when there is no life to show
   * (the picture is in the middle of its change).
   */
  paint(t: number, k: number, sheet: Uint8ClampedArray): boolean {
    if (k >= 0.2 && k <= 0.8) return false;
    sheet.fill(0);
    this.draw(t, k, (x, y, color, a, w, h) => layDot(sheet, x, y, color, a, w, h));
    return true;
  }

  /**
   * The cat's tail flicks: it lifts off the sill, stands against the evening sky for a moment, and
   * drops back. A full flick, then a half-hearted one, in every seven seconds.
   */
  private flick(t: number, a: number, dot: LifeDot): void {
    if (!this.tail) return;
    const u = t % 7;
    const v = u < 3.2 ? u : u - 3.2;
    const pose = u < 3.2 ? (v < 0.09 ? 1 : v < 0.32 ? 2 : v < 0.41 ? 1 : 0) : v < 0.14 ? 1 : 0;
    if (pose === 0) return;
    const [root, next] = CAT_TAIL;
    dot(next[0], next[1], this.tail.sill, a);
    if (pose === 1) dot(root[0] + 1, root[1], this.tail.fur, a);
    else {
      dot(root[0] + 1, root[1] - 1, this.tail.fur, a);
      dot(root[0] + 2, root[1] - 2, this.tail.fur, a);
    }
  }

  private library(t: number, a: number, dot: LifeDot): void {
    const [lx, ly] = TITLE_MARKS.lamp;
    // the lamp gutters
    const beat = 0.5 + 0.5 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
    dot(lx - 9, ly - 1, P.gd5, a * 0.22 * beat, 19, 3);
    // Motes of dust in its light. Each drifts for a few seconds, a little upward on the warm air,
    // and is brightest where the light is: pale gold close to the lamp, dull further out.
    for (let j = 0; j < 11; j++) {
      const [n, u] = turnOf(t / (5 + 3 * hash2(j, 0, 61)) + hash2(j, 1, 61));
      const x = Math.round(84 + 72 * hash2(j, n, 62) + (hash2(j, n, 64) - 0.5) * 10 * u + 1.6 * Math.sin(u * 6.3 * (1 + hash2(j, n, 65)) + j));
      const y = Math.round(58 + 33 * hash2(j, n, 63) - (1 + 5 * hash2(j, n, 66)) * u);
      // not on the lamp itself, where it would look like a fault in the glass, and not below the desk top
      if (y >= TOP - 1 || (x >= 105 && x <= 134 && y >= 74)) continue;
      const far = reach(x, y, lx, ly);
      const glint = Math.sin(u * 40 + j * 2.4) > 0.55;
      const faint = u < 0.1 || u > 0.9 || far > 27;
      dot(x, y, faint ? P.er5 : far < 16 && glint ? P.gd5 : P.wd5, a);
    }
    // the evening star: it dims for a moment, then flashes
    for (const q of this.stars[0]) {
      const u = t % 2.9;
      if (u < 0.12) dot(q[0], q[1], P.bu3, a);
      else if (u < 0.3) dot(q[0], q[1], P.white, a);
    }
    this.flick(t, a, dot);
  }

  private dreaming(t: number, a: number, dot: LifeDot): void {
    this.warm();
    const front = this.front;
    const OBJ_A = TITLE_GROUPS.indexOf('objA');
    const SMALL = TITLE_GROUPS.indexOf('small');
    /** A dot that anything standing in front of the brew, the fire and the witch would hide is not drawn. */
    const put = (x: number, y: number, c: string): void => {
      if (x >= 0 && y >= 0 && x < W && y < H && front[y * W + x] !== SMALL) dot(x, y, c, a);
    };
    // the brew's glow gutters
    const beat = 0.5 + 0.5 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
    for (const r of this.brewRows) dot(r[0], r[1], P.tl5, a * 0.2 * beat, r[2], 1);

    // A bubble bursts: its skin flies off as three drops, and a bright ring runs out where it stood.
    // `v` is how far through the burst it is, 0..1.
    const burst = (cx: number, cy: number, r: number, v: number): void => {
      const out = Math.round(r) + (v < 0.5 ? 0 : 1);
      const up = Math.round(r) + (v < 0.5 ? 1 : 2);
      const c = v < 0.5 ? P.white : BREW[4];
      put(cx - out, cy - up + 1, c);
      put(cx, cy - up - 1, c);
      put(cx + out, cy - up + 1, c);
      if (v < 0.5) for (let x = cx - Math.round(r) + 1; x < cx + Math.round(r); x++) onBrew(x, cy, BREW[4]);
      else {
        onBrew(cx - out - 1, cy, BREW[4]);
        onBrew(cx + out + 1, cy, BREW[4]);
      }
    };
    /** A dot of a bubble: only over the pot and the brew, never across a claw. */
    const onBrew = (x: number, y: number, c: string): void => {
      if (x >= 0 && x < W && front[y * W + x] === OBJ_A) dot(x, y, c, a);
    };
    // The painted bubbles are alive: each stands a few seconds as it was painted, bursts, leaves
    // the brew flat for a moment, and swells up again from nothing.
    BUBBLES.forEach(([cx, cy, r], i) => {
      const u = turnOf(t / (3.2 + 2.4 * hash2(i, 0, 87)) + hash2(i, 1, 87))[1];
      if (u < 0.7) return;
      for (const q of this.painted[i]) dot(q[0], q[1], q[2], a);
      const again = (x: number, y: number, c: string): void => dot(x, y, c, a);
      if (u < 0.78) burst(cx, cy, r, (u - 0.7) / 0.08);
      else if (u >= 0.93) bubbleDots(cx, cy, Math.max(1, r * 0.75), again);
      else if (u >= 0.86) bubbleDots(cx, cy, Math.max(1, r * 0.45), again);
    });
    // And new ones come up between them: each swells from a speck, stands a moment as a dome, and bursts.
    if (this.spots.length > 0) {
      for (let j = 0; j < 4; j++) {
        const [n, u] = turnOf(t / (1.8 + 1.2 * hash2(j, 0, 81)) + hash2(j, 1, 81));
        const [sx, sy] = this.spots[Math.floor(hash2(j, n, 82) * this.spots.length)];
        const r = 1.6 + 2 * hash2(j, n, 83);
        if (u < 0.62) bubbleDots(sx, sy, u < 0.14 ? 1 : u < 0.3 ? Math.max(1, r * 0.55) : r, onBrew);
        else if (u < 0.7) burst(sx, sy, r, (u - 0.62) / 0.08);
      }
      // Loose bubbles: one leaves the surface between her claws, wanders up in front of her, and is gone with a wink.
      for (let j = 0; j < 3 && this.middle.length > 0; j++) {
        const [n, u] = turnOf(t / (2.6 + 1.2 * hash2(j, 0, 84)) + hash2(j, 1, 84));
        const [sx, sy] = this.middle[Math.floor(hash2(j, n, 85) * this.middle.length)];
        const e = Math.min(1, u / 0.75);
        const x = sx + Math.round(1.3 * Math.sin(e * 7 + j));
        const y = Math.round(sy - 3 - (12 + 12 * hash2(j, n, 86)) * e);
        if (u < 0.75) {
          put(x, y, BREW[3]);
          put(x + 1, y, BREW[2]);
          put(x, y + 1, BREW[2]);
        } else if (u < 0.81) {
          for (const q of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) put(x + q[0], y + q[1], BREW[4]);
        }
      }
    }
    // A drop falls from the drip over the lip every two and a half seconds, faster as it goes.
    const drop = turnOf(t / 2.6)[1] / 0.16;
    if (drop < 1) {
      const fall = Math.round(1 + 15 * drop * drop);
      put(DRIP_TIP[0], DRIP_TIP[1] + fall, BREW[3]);
      if (fall > 3) put(DRIP_TIP[0], DRIP_TIP[1] + fall - 1, BREW[2]);
    }

    // The steam: a paler puff travels up each of the painted wisps, so that they seem to rise.
    WISPS.forEach((v, i) => {
      const span = v.len + 8;
      for (let j = 0; j < 2; j++) {
        // the middle of the puff, in rows up from the brew; it moves about a row every eighth of a second
        const mid = ((Math.floor(t * 8) + i * 5 + j * (span >> 1)) % span) - 4;
        for (let k = Math.max(0, mid - 3); k <= Math.min(v.len - 1, mid + 3); k++) {
          const at = wispAt(v, k);
          const half = Math.max(1, Math.round(at.w * 0.6));
          const thin = Math.abs(k - mid) > 1;
          dot(Math.round(at.x) - half + 1, v.y0 - k, STEAM, a * (thin ? 0.11 : 0.22) * (1 - (k / v.len) * 0.5), 2 * half - 1, 1);
        }
      }
    });

    // The flames: each one stretches and leans afresh eleven times a second. Only what differs from
    // the painted flame is drawn (the painted one is the flame at its lowest).
    const seen = this.seen;
    ALL_TONGUES.forEach((v, i) => {
      const n = Math.floor(t * 11 + i * 0.37);
      const stretch = hash2(i, n, 91);
      const inFront = i >= TONGUES.length;
      tongueDots(v[0], v[1], v[2], v[3] * (1 + 0.6 * stretch * stretch), v[4] + (hash2(i, n, 92) - 0.5) * 2.6, (x, y, c) => {
        if (x < 0 || y < 0 || x >= W || y >= H) return;
        const where = this.room[y * W + x];
        if (where === 0 || (where === 2 && !inFront)) return;
        if (seen[y * W + x] !== FLAME_PACKED.get(c)) dot(x, y, c, a);
      });
    });
    // The embers shimmer: seven times a second a few of them glow a step brighter, and a few sink a step.
    const beatN = Math.floor(t * 7);
    for (const e of this.embers) {
      const r = hash2(e[0] + beatN * 31, e[1] - beatN * 17, 53);
      if (r < 0.05 && e[2] < FIRE.length - 1) dot(e[0], e[1], FIRE[e[2] + 1], a);
      else if (r > 0.96 && e[2] > 0) dot(e[0], e[1], FIRE[e[2] - 1], a);
    }
    // Sparks: one leaves each end of the fire in turn, floats up and outward across the dark of the pot, and cools
    // from yellow to red as it goes. (They are out before they reach the runes, where a red dot would look like a fault.)
    for (let j = 0; j < 6; j++) {
      const [n, u] = turnOf(t / (1.9 + 1.4 * hash2(j, 0, 71)) + hash2(j, 1, 71));
      if (u > 0.9) continue;
      const side = j % 2 === 0 ? -1 : 1;
      const x = Math.round(CX + side * (44 + 14 * hash2(j, n, 72) + 6 * u) + 1.5 * Math.sin(u * 11 + j * 2));
      const y = Math.round(137 - 3 * hash2(j, n, 73) - (7 + 7 * hash2(j, n, 74)) * u);
      put(x, y, u < 0.2 ? P.fr6 : u < 0.45 ? P.fr5 : u < 0.7 ? P.fr4 : P.fr3);
    }

    // Her eyes burn: nine times a second the heat shifts in them, and a lick of flame comes and goes at each outer corner.
    const flick = Math.floor(t * 9);
    this.eyes.forEach((eye, s) => {
      const pick = (list: readonly Pt[], q: number): Pt => list[Math.floor(hash2(flick, q, 97 + s) * list.length)];
      const flare = pick(eye.rim, 0);
      const flare2 = pick(eye.rim, 1);
      const white = pick(eye.mid, 2);
      const dim = pick(eye.hot, 3);
      dot(flare[0], flare[1], P.fr6, a);
      dot(flare2[0], flare2[1], P.fr5, a);
      dot(white[0], white[1], P.white, a);
      dot(dim[0], dim[1], P.fr6, a);
      if (hash2(flick, 4, 97 + s) < 0.6) dot(eye.corner[0], eye.corner[1] - 1, P.fr4, a);
    });

    // The cat is watching us, and blinks: both green eyes shut for a moment.
    if (this.blink && t % 5.3 < 0.14) {
      dot(37, 82, this.blink, a);
      dot(39, 82, this.blink, a);
    }
    for (const [j, q] of this.stars[1].entries()) {
      const u = (t + j * 1.7) % 3.7;
      if (u < 0.2) dot(q[0], q[1], P.white, a);
    }
  }
}

/** How long the title's picture rests on the library or on the dream, and how long it takes to turn into the other, in seconds. */
export const TITLE_REST = 2.0;
export const TITLE_TURN = 2.2;

/**
 * Where the title's picture is in its round at time `t` (seconds): it rests on the library, turns
 * into the dream, rests there, and turns back.
 *   k     how far it has turned from the library (0) to the dream (1)
 *   back  the change under way, or the next one to come, is the one back to the library
 *   lead  seconds until that change begins (0 or less once it has begun)
 * (The owner: "Also have it transition more often". A round was 11.6 seconds; it is 8.4.)
 */
export function titleRound(t: number): { k: number; back: boolean; lead: number } {
  const half = TITLE_REST + TITLE_TURN;
  const u = ((t % (2 * half)) + 2 * half) % (2 * half);
  const back = u >= half;
  const v = back ? u - half : u;
  if (v < TITLE_REST) return { k: back ? 1 : 0, back, lead: TITLE_REST - v };
  // Only a little slower at its two ends than in the middle. The change has a slow beginning and
  // a slow end of its own (it starts as a glimmer in her eyes, and ends in the far corners of the
  // room): eased any harder, nothing seems to happen for the first and last half second of it.
  const p = (v - TITLE_REST) / TITLE_TURN;
  const eased = 0.75 * p + 0.25 * p * p * (3 - 2 * p);
  return { k: back ? 1 - eased : eased, back, lead: TITLE_REST - v };
}

/**
 * What turns the one picture into the other: the change spreads from the lamp (which is where the
 * brew is), and in her from her eyes; the light on its front is the brew's bright teal on the way
 * to the dream, and the lamp's gold on the way back.
 */
export function titleMorph(real: TitleStack, dream: TitleStack): TitleMorph {
  return new TitleMorph(real, dream, { cx: CX, cy: 92, eyes: TITLE_MARKS.eye, toDream: P.tl5, toReal: P.gd4, ink: P.ink });
}

/**
 * Paint both title pictures. Call once at start-up. (What the change between them needs is not
 * worked out here but later, a piece at a time: see `TitleMorph.warm`.)
 */
export function makeTitleArt(): TitleArt {
  const realStack = stackReal();
  const dreamStack = stackDream();
  const real = flatten(realStack).toCanvas();
  const dream = flatten(dreamStack).toCanvas();
  const change = titleMorph(realStack, dreamStack);
  /** A canvas as big as the pictures, and its pixels to paint on. */
  interface Sheet {
    cv: HTMLCanvasElement;
    g: CanvasRenderingContext2D;
    im: ImageData;
  }
  const sheet = (): Sheet => {
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const g = cv.getContext('2d')!;
    return { cv, g, im: g.createImageData(W, H) };
  };
  // the one canvas the in-between pictures are painted on, and the one for the life: each is made
  // the first time it is asked for
  let between: Sheet | null = null;
  let over: Sheet | null = null;
  const alive = new TitleLife(realStack, dreamStack);
  /**
   * How many frames the picture has been asked for while at rest; whether the change is ready; and
   * how many of the five frames of practice are done (see `morph`).
   */
  let rests = 0;
  let changeReady = false;
  let practised = 0;
  return {
    w: W,
    h: H,
    real,
    dream,
    morph(t: number, back = false): HTMLCanvasElement {
      if (t <= 0 || t >= 1) {
        // At rest on one picture: a good moment for a piece of the getting ready. (Not in the
        // first few frames, though: the page has enough to do just after it starts.) First the
        // change, a piece to a frame. Then five frames of practice, painted and thrown away: the
        // first run of anything is the slow one, and this way it is not the first frames of the
        // first change that pay for it, with everyone watching. One frame to work out what the
        // dream's life needs and two to paint it; then the change itself, first with only her
        // begun and then with everything in the middle of changing.
        if (++rests > 20) {
          if (!changeReady) changeReady = change.warm();
          else if (practised < 5) {
            if (practised < 3) {
              if (!over) over = sheet();
              if (practised === 0) alive.warm();
              else alive.paint(practised, 1, over.im.data);
            } else {
              if (!between) between = sheet();
              change.render(practised === 3 ? 0.08 : 0.5, between.im.data);
              between.g.putImageData(between.im, 0, 0);
            }
            practised++;
          }
        }
        return t <= 0 ? real : dream;
      }
      if (!between) between = sheet();
      change.render(t, between.im.data, back);
      between.g.putImageData(between.im, 0, 0);
      return between.cv;
    },
    life(t: number, k: number): HTMLCanvasElement | null {
      if (!over) over = sheet();
      if (!alive.paint(t, k, over.im.data)) return null;
      over.g.putImageData(over.im, 0, 0);
      return over.cv;
    },
  };
}
