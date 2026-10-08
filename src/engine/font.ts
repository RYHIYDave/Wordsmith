// Bitmap pixel fonts. Every piece of text in the game is drawn with these on the low-resolution
// canvas, so it stays crisp when the canvas is scaled up (canvas fillText would blur the edges).
//
//   'normal'  proportional font in an 8 px cell. Capitals and digits are 7 px tall (rows 0-6),
//             lower-case letters are 5 px tall (rows 2-6), row 7 is only for descenders
//             (g j p q y and the comma). All ten digits are 5 px wide so numbers do not jiggle.
//   'small'   3x5 capitals and digits for damage numbers and tiny labels (M and W are 5 wide and
//             N is 4 wide, so they cannot be mistaken for H). Lower-case text is drawn with the
//             capitals, except that an x standing on its own ("x3") is a small multiply sign.
//   Both fonts leave 1 px between glyphs. A character without a glyph is drawn as '?'.
//
// THE FINER GRAIN (Version 13: "update the font and menus to match the art style"). The screen
// holds two picture pixels to a game pixel (engine/screen.ts), and the heroes are painted at that
// grain. So are the letters now: every glyph below is still DESIGNED on the game's pixel grid,
// and its width, its advance and the line height are what they always were (no screen had to be
// laid out again), but it is DRAWN at twice the grain: the stair-steps of its diagonals and round
// corners are filled smooth (fineGlyph), and the normal font's stems are thickened (boldGlyph).
// A canvas that is not the screen (a tool's preview, a picture built off screen at one pixel to a
// game pixel) is drawn on with the plain glyphs, as before.
//
// HOW DRAWING WORKS: each font is painted once, in white, into an "atlas" (one small image that
// holds every glyph side by side). To draw in a colour we keep a tinted copy of the atlas per
// colour (and one per colour + shadow pair, with the shadow baked in) and copy glyphs out of it
// with drawImage: one drawImage per glyph, which is fast enough for hundreds of calls a frame.
// Nothing touches the DOM until the first drawText call, so textWidth and wrapText also work in
// Node tests.

export type FontId = 'normal' | 'small';

/** Line advance in pixels (glyph cell height plus a 1 px gap). */
export const LINE_H: Record<FontId, number> = { normal: 9, small: 6 };

export interface TextOpts {
  /** Default 'left'. x is the left edge, the centre, or the right edge of the text. */
  align?: 'left' | 'center' | 'right';
  /** Default 'normal'. */
  font?: FontId;
  /** If a colour, the text is first drawn in that colour 1 px down and right (`scale` px when scaled). */
  shadow?: string | null;
  /** Whole number >= 1, default 1. Each font pixel becomes scale x scale canvas pixels. */
  scale?: number;
}

// ---------------------------------------------------------------------------------------------
// Glyph pictures.
//
// Each strip is [characters, rows]. The rows are the pictures of those characters side by side,
// separated by ONE space: '#' is ink, '.' is empty. A glyph's width is simply the width of its
// cell, so narrow characters use narrower cells. To change a glyph, edit its column in every row
// of the strip, then look at the result with:
//   node tools/preview.mjs src/dev/preview_font.ts shots/font.png 1300 820
// Rules (checked when the game starts; mistakes are reported in the console):
//   - every row of a strip has one cell per character, in the same order as the characters
//   - all cells of one character are equally wide
//   - a strip has exactly as many rows as the font's cell height (8 for normal, 5 for small)
// In the character lists \' is a quote, \\ a backslash, \u2026 the one-character ellipsis and
// \u00d7 the multiply sign. The space is not in a strip: it is a blank glyph, 3 px wide in the
// normal font and 2 px in the small one (see FONTS below).

type Strip = readonly [chars: string, rows: readonly string[]];

/** Pixels of empty space between neighbouring glyphs. */
const GAP = 1;

/**
 * Empty font pixels after each glyph in an atlas. Two: at the finer grain a letter is one picture
 * pixel wider than its cell (its stems are thickened, see boldGlyph) and its shadow lies a whole
 * font pixel further right again, and none of that may reach the next glyph's cell.
 */
const PAD = 2;

const NORMAL_STRIPS: readonly Strip[] = [
  ['ABCDEFGHIJKLM', [
    '.###. ####. .###. ####. ##### ##### .###. #...# ### ...# #...# #... #...#',
    '#...# #...# #...# #...# #.... #.... #...# #...# .#. ...# #..#. #... ##.##',
    '#...# #...# #.... #...# #.... #.... #.... #...# .#. ...# #.#.. #... #.#.#',
    '##### ####. #.... #...# ####. ####. #.### ##### .#. ...# ##... #... #.#.#',
    '#...# #...# #.... #...# #.... #.... #...# #...# .#. ...# #.#.. #... #...#',
    '#...# #...# #...# #...# #.... #.... #...# #...# .#. #..# #..#. #... #...#',
    '#...# ####. .###. ####. ##### #.... .###. #...# ### .##. #...# #### #...#',
    '..... ..... ..... ..... ..... ..... ..... ..... ... .... ..... .... .....',
  ]],
  ['NOPQRSTUVWXYZ', [
    '#...# .###. ####. .###. ####. .#### ##### #...# #...# #...# #...# #...# #####',
    '#...# #...# #...# #...# #...# #.... ..#.. #...# #...# #...# #...# #...# ....#',
    '##..# #...# #...# #...# #...# #.... ..#.. #...# #...# #...# .#.#. .#.#. ...#.',
    '#.#.# #...# ####. #...# ####. .###. ..#.. #...# #...# #.#.# ..#.. ..#.. ..#..',
    '#..## #...# #.... #.#.# #.#.. ....# ..#.. #...# #...# #.#.# .#.#. ..#.. .#...',
    '#...# #...# #.... #..#. #..#. ....# ..#.. #...# .#.#. #.#.# #...# ..#.. #....',
    '#...# .###. #.... .##.# #...# ####. ..#.. .###. ..#.. .#.#. #...# ..#.. #####',
    '..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... ..... .....',
  ]],
  ['abcdefghijklm', [
    '..... #.... .... ....# ..... ..## ..... #.... # ..# #... #. .....',
    '..... #.... .... ....# ..... .#.. ..... #.... . ... #... #. .....',
    '.###. #.##. .### .##.# .###. ###. .#### #.##. # ..# #..# #. ##.#.',
    '....# ##..# #... #..## #...# .#.. #...# ##..# # ..# #.#. #. #.#.#',
    '.#### #...# #... #...# ##### .#.. #...# #...# # ..# ##.. #. #.#.#',
    '#...# #...# #... #...# #.... .#.. .#### #...# # ..# #.#. #. #.#.#',
    '.#### ####. .### .#### .###. .#.. ....# #...# # ..# #..# .# #.#.#',
    '..... ..... .... ..... ..... .... .###. ..... . ##. .... .. .....',
  ]],
  ['nopqrstuvwxyz', [
    '..... ..... ..... ..... .... ..... .#.. ..... ..... ..... ..... ..... .....',
    '..... ..... ..... ..... .... ..... .#.. ..... ..... ..... ..... ..... .....',
    '#.##. .###. ####. .#### #.## .#### ###. #...# #...# #...# #...# #...# #####',
    '##..# #...# #...# #...# ##.. #.... .#.. #...# #...# #...# .#.#. #...# ...#.',
    '#...# #...# #...# #...# #... .###. .#.. #...# #...# #.#.# ..#.. #...# ..#..',
    '#...# #...# ####. .#### #... ....# .#.. #..## .#.#. #.#.# .#.#. .#### .#...',
    '#...# .###. #.... ....# #... ####. ..## .##.# ..#.. .#.#. #...# ....# #####',
    '..... ..... #.... ....# .... ..... .... ..... ..... ..... ..... .###. .....',
  ]],
  ['0123456789', [
    '.###. ..#.. .###. .###. ...#. ##### ..##. ##### .###. .###.',
    '#...# .##.. #...# #...# ..##. #.... .#... ....# #...# #...#',
    '#..## ..#.. ....# ....# .#.#. ####. #.... ...#. #...# #...#',
    '#.#.# ..#.. ...#. ..##. #..#. ....# ####. ..#.. .###. .####',
    '##..# ..#.. ..#.. ....# ##### ....# #...# .#... #...# ....#',
    '#...# ..#.. .#... #...# ...#. #...# #...# .#... #...# ...#.',
    '.###. .###. ##### .###. ...#. .###. .###. .#... .###. .##..',
    '..... ..... ..... ..... ..... ..... ..... ..... ..... .....',
  ]],
  ['!"#$%&\'()*+,-./', [
    '# #.# ..... ..#.. ##... .##.. # .# #. ..... ..... .. .... . ..#',
    '# #.# .#.#. .#### ##..# #..#. # #. .# ..#.. ..#.. .. .... . ..#',
    '# ... ##### #.#.. ...#. #.#.. . #. .# #.#.# ..#.. .. .... . .#.',
    '# ... .#.#. .###. ..#.. .#... . #. .# .###. ##### .. #### . .#.',
    '# ... ##### ..#.# .#... #.#.# . #. .# #.#.# ..#.. .. .... . .#.',
    '. ... .#.#. ####. #..## #..#. . #. .# ..#.. ..#.. .. .... . #..',
    '# ... ..... ..#.. ...## .##.# . .# #. ..... ..... .# .... # #..',
    '. ... ..... ..... ..... ..... . .. .. ..... ..... #. .... . ...',
  ]],
  [':;<=>?@[\\]^_`{|}~\u2026', [
    '. .. ... .... ... .###. .###. ## #.. ## .#. ..... #. ..# # #.. ..... .....',
    '. .. ..# .... #.. #...# #...# #. #.. .# #.# ..... .# .#. # .#. ..... .....',
    '. .. .#. #### .#. ....# #.### #. .#. .# ... ..... .. .#. # .#. .#... .....',
    '# .# #.. .... ..# ...#. #.#.# #. .#. .# ... ..... .. #.. # ..# #.#.# .....',
    '. .. .#. #### .#. ..#.. #.### #. .#. .# ... ..... .. .#. # .#. ...#. .....',
    '. .. ..# .... #.. ..... #.... #. ..# .# ... ..... .. .#. # .#. ..... .....',
    '# .# ... .... ... ..#.. .#### ## ..# ## ... ..... .. ..# # #.. ..... #.#.#',
    '. #. ... .... ... ..... ..... .. ... .. ... ##### .. ... . ... ..... .....',
  ]],
];

const SMALL_STRIPS: readonly Strip[] = [
  ['ABCDEFGHIJKLM', [
    '.#. ##. .## ##. ### ### .## #.# ### ..# #.# #.. #...#',
    '#.# #.# #.. #.# #.. #.. #.. #.# .#. ..# ##. #.. ##.##',
    '### ##. #.. #.# ##. ##. #.# ### .#. ..# #.. #.. #.#.#',
    '#.# #.# #.. #.# #.. #.. #.# #.# .#. #.# ##. #.. #...#',
    '#.# ##. .## ##. ### #.. .## #.# ### .#. #.# ### #...#',
  ]],
  ['NOPQRSTUVWXYZ', [
    '#..# .#. ##. .#. ##. .## ### #.# #.# #...# #.# #.# ###',
    '##.# #.# #.# #.# #.# #.. .#. #.# #.# #...# #.# #.# ..#',
    '#.## #.# ##. #.# ##. .#. .#. #.# #.# #.#.# .#. .#. .#.',
    '#..# #.# #.. .#. #.# ..# .#. #.# #.# #.#.# #.# .#. #..',
    '#..# .#. #.. ..# #.# ##. .#. ### .#. .#.#. #.# .#. ###',
  ]],
  ['0123456789', [
    '### .#. ### ### #.# ### ### ### ### ###',
    '#.# ##. ..# ..# #.# #.. #.. ..# #.# #.#',
    '#.# .#. ### .## ### ### ### ..# ### ###',
    '#.# .#. #.. ..# ..# ..# #.# ..# #.# ..#',
    '### ### ### ### ..# ### ### ..# ### ###',
  ]],
  ['+-%.,:!?/\'()\u00d7\u2026', [
    '... ... #.# . .. . # ### ..# # .# #. ... .....',
    '.#. ... ..# . .. # # ..# ..# # #. .# #.# .....',
    '### ### .#. . .. . # .#. .#. . #. .# .#. .....',
    '.#. ... #.. . .# # . ... #.. . #. .# #.# .....',
    '... ... #.# # #. . # .#. #.. . .# #. ... #.#.#',
  ]],
  [';"=*<>[]#_', [
    '.. #.# ... ... ..# #.. ## ## .#.#. ...',
    '.# #.# ### #.# .#. .#. #. .# ##### ...',
    '.. ... ... .#. #.. ..# #. .# .#.#. ...',
    '.# ... ### #.# .#. .#. #. .# ##### ...',
    '#. ... ... ... ..# #.. ## ## .#.#. ###',
  ]],
];

/**
 * Typographic characters that writers (and word processors) sneak into text, drawn with the
 * plain look-alike glyph instead of a '?'. Only used when the font has no glyph of its own.
 */
const LOOK_ALIKES: ReadonlyArray<readonly [from: string, to: string]> = [
  ['\u2018', "'"], // curly single quotes
  ['\u2019', "'"],
  ['\u201c', '"'], // curly double quotes
  ['\u201d', '"'],
  ['\u2013', '-'], // en dash, em dash, minus sign
  ['\u2014', '-'],
  ['\u2212', '-'],
  ['\u00d7', 'x'], // multiplication sign
  ['\u00a0', ' '], // non-breaking space
];

// ---------------------------------------------------------------------------------------------
// Fonts built from the strips (plain data, no DOM).

interface Font {
  id: FontId;
  /** Glyph cell height in pixels. */
  h: number;
  /** Per glyph: its picture as rows of '#' and '.'. */
  rows: string[][];
  /** Per glyph: width in pixels. */
  w: number[];
  /** Per glyph: left edge inside the atlas. */
  x: number[];
  /** Per glyph: false for glyphs with no ink (the space), which are skipped when drawing. */
  ink: boolean[];
  /** Glyph number for every ASCII code. Codes without a glyph point at '?'. */
  ascii: Uint8Array;
  /** Glyph number for the few non-ASCII characters we can draw. */
  other: Map<number, number>;
  /** Glyph drawn for every character we cannot draw: '?'. */
  unknown: number;
  /** 'small' only: the multiply sign drawn for a lone lower-case x (as in "x3"). -1 if none. */
  times: number;
  atlasW: number;
  /** The glyphs at the finer grain (see fineGlyph), worked out on first use. */
  fine: (string[] | undefined)[];
  /** The white atlases, painted on first use: [1] at the font's own grain, [FONT_GRAIN] at the finer one. */
  white: (HTMLCanvasElement | undefined)[];
  /** Coloured copies of the atlases, keyed by grain and colour (or by grain, colour and shadow colour). */
  tinted: Map<string, HTMLCanvasElement>;
}

/** Picture pixels to a font pixel in the fine atlases: the screen's two to a game pixel. */
export const FONT_GRAIN = 2;

/**
 * A glyph at the finer grain: every font pixel becomes two by two picture pixels, and the
 * stair-steps of its diagonals are filled smooth. A quarter of an EMPTY pixel is inked when it
 * lies in the crook of a step: its two neighbours on that side are inked, the pixel diagonally
 * between those two is not (they touch only at their corners), and its other two neighbours are
 * empty. So a diagonal stroke comes out as a straight slope, and a round letter (O, C, S, whose
 * corner pixels are left empty for exactly this) comes out round, inside and out.
 *
 * Everything else is left as it was drawn:
 * - nothing that was inked is taken away. (The old "Scale2x" rule, tried first on 4 Oct 2026,
 *   also cuts the tip off every outer corner where two strokes meet: it made D an O, B an 8 and
 *   5 an S, because a square corner against a round one is all that tells them apart this small.)
 * - where two strokes meet at a right angle the crook is NOT filled. (Tried second: it turned the
 *   small font's plus sign into a diamond.)
 * `rows` are the glyph's rows, '#' for ink; so are the rows returned, twice as many and twice as long.
 */
export function fineGlyph(rows: readonly string[]): string[] {
  const h = rows.length;
  const w = h > 0 ? rows[0].length : 0;
  const ink = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && rows[y].charCodeAt(x) === 35;
  const out: string[] = [];
  for (let y = 0; y < h; y++) {
    let top = '';
    let bottom = '';
    for (let x = 0; x < w; x++) {
      const p = ink(x, y);
      const up = ink(x, y - 1);
      const right = ink(x + 1, y);
      const left = ink(x - 1, y);
      const down = ink(x, y + 1);
      const q0 = p || (left && up && !down && !right && !ink(x - 1, y - 1));
      const q1 = p || (up && right && !left && !down && !ink(x + 1, y - 1));
      const q2 = p || (down && left && !right && !up && !ink(x - 1, y + 1));
      const q3 = p || (right && down && !up && !left && !ink(x + 1, y + 1));
      top += (q0 ? '#' : '.') + (q1 ? '#' : '.');
      bottom += (q2 ? '#' : '.') + (q3 ? '#' : '.');
    }
    out.push(top, bottom);
  }
  return out;
}

/**
 * Which fonts have their letters thickened at the finer grain (boldGlyph). The normal font: its
 * stems go from one game pixel to one and a half, which is the weight of the heroes' own shapes
 * and is easier to read on a phone, where a capital is under two millimetres tall. Not the small
 * one: its letters are three game pixels wide, and a thicker stem would close the eye of every
 * A, B, D, O and 8.
 */
export const FONT_BOLD: Record<FontId, boolean> = { normal: true, small: false };

/**
 * A fine glyph with its upright strokes one picture pixel thicker: every inked pixel inks the
 * pixel to its right as well. A stem goes from two picture pixels to three (from one game pixel
 * to one and a half), a level stroke stays as tall as it was, and the glyph comes back one
 * picture pixel wider than its cell: half a game pixel of the gap to the next letter, which is
 * how a bold face sits anyway. The advance from letter to letter does not change.
 */
export function boldGlyph(rows: readonly string[]): string[] {
  return rows.map((row) => {
    let out = '';
    for (let x = 0; x <= row.length; x++) out += (x < row.length && row.charCodeAt(x) === 35) || (x > 0 && row.charCodeAt(x - 1) === 35) ? '#' : '.';
    return out;
  });
}

/** A glyph as the fine atlas holds it. */
function fineRows(rows: readonly string[], bold: boolean): string[] {
  const fine = fineGlyph(rows);
  return bold ? boldGlyph(fine) : fine;
}

/**
 * @param spaceW   width of the space character
 * @param capsOnly true for a font without lower-case letters: a-z are drawn with A-Z
 */
function buildFont(name: FontId, h: number, spaceW: number, strips: readonly Strip[], capsOnly: boolean): Font {
  const f: Font = {
    id: name,
    h,
    rows: [],
    w: [],
    x: [],
    ink: [],
    ascii: new Uint8Array(128),
    other: new Map(),
    unknown: 0,
    times: -1,
    atlasW: 0,
    fine: [],
    white: [],
    tinted: new Map(),
  };
  const byCode = new Map<number, number>();
  const problems: string[] = [];

  const add = (ch: string, pic: string[]): void => {
    let w = 0;
    for (const row of pic) w = Math.max(w, row.length);
    if (pic.some((row) => row.length !== w)) problems.push(`'${ch}' has rows of different widths`);
    const rows = pic.map((row) => row + '.'.repeat(w - row.length));
    byCode.set(ch.charCodeAt(0), f.w.length);
    f.rows.push(rows);
    f.w.push(w);
    f.x.push(f.atlasW);
    f.ink.push(rows.some((row) => row.indexOf('#') >= 0));
    f.atlasW += w + PAD; // padding, so neighbours can never bleed into each other (see PAD)
  };

  const blankRow = '.'.repeat(spaceW);
  const blank: string[] = [];
  for (let y = 0; y < h; y++) blank.push(blankRow);
  add(' ', blank);

  for (const [chars, rows] of strips) {
    if (rows.length !== h) problems.push(`strip '${chars}' has ${rows.length} rows, expected ${h}`);
    const cells = rows.map((row) => row.split(' '));
    for (const c of cells) {
      if (c.length !== chars.length) problems.push(`strip '${chars}' has a row with ${c.length} cells, expected ${chars.length}`);
    }
    for (let i = 0; i < chars.length; i++) {
      const pic: string[] = [];
      for (let y = 0; y < h; y++) pic.push(cells[y]?.[i] ?? '');
      add(chars.charAt(i), pic);
    }
  }

  f.unknown = byCode.get(63) ?? 0; // '?'
  f.ascii.fill(f.unknown);
  for (const [code, glyph] of byCode) {
    if (code < 128) f.ascii[code] = glyph;
    else f.other.set(code, glyph);
  }
  if (capsOnly) {
    for (let code = 97; code <= 122; code++) {
      if (!byCode.has(code)) f.ascii[code] = f.ascii[code - 32];
    }
    // The multiply sign must be exactly as wide as X, so swapping one for the other never
    // changes a text's width.
    const times = byCode.get(0xd7);
    if (times !== undefined && f.w[times] === f.w[f.ascii[88]]) f.times = times;
  }
  for (const [from, to] of LOOK_ALIKES) {
    const target = byCode.get(to.charCodeAt(0));
    if (target !== undefined && !byCode.has(from.charCodeAt(0))) f.other.set(from.charCodeAt(0), target);
  }

  if (problems.length > 0) console.error(`font '${name}': ${problems.join('; ')}`);
  return f;
}

const FONTS: Record<FontId, Font> = {
  normal: buildFont('normal', 8, 3, NORMAL_STRIPS, false),
  small: buildFont('small', 5, 2, SMALL_STRIPS, true),
};

function fontOf(id: FontId | undefined): Font {
  return (id !== undefined ? FONTS[id] : undefined) ?? FONTS.normal;
}

function cleanScale(scale: number | undefined): number {
  return scale !== undefined && scale >= 1 ? Math.floor(scale) : 1;
}

function isLetter(code: number): boolean {
  const lower = code | 32;
  return lower >= 97 && lower <= 122;
}

/** Characters some text asked for that a font cannot draw (playtests read this: it should stay empty). */
export const MISSING_GLYPHS = new Set<string>();

/** Which glyph draws this character code ('?' for anything the font does not have). */
function glyphOf(f: Font, code: number): number {
  const i = code < 128 ? f.ascii[code] : (f.other.get(code) ?? f.unknown);
  if (i === f.unknown && code !== 63 && code > 32) MISSING_GLYPHS.add(`${f.id}:${String.fromCharCode(code)}`);
  return i;
}

/** Width of one line at scale 1: the glyph widths plus a 1 px gap between neighbours. */
function measure(f: Font, text: string): number {
  const n = text.length;
  if (n === 0) return 0;
  let w = -GAP;
  for (let i = 0; i < n; i++) {
    const code = text.charCodeAt(i);
    w += f.w[glyphOf(f, code)] + GAP;
  }
  return w;
}

// ---------------------------------------------------------------------------------------------
// Atlases (created lazily; these are the only functions that need a DOM).

/** Coloured atlases kept per font. Far more than the game's palette needs; the oldest is dropped. */
const MAX_TINTS = 96;

/** `grain`: 1 for the font's own pixels, FONT_GRAIN for the finer ones (a glyph is then `grain` times as far along the atlas, and as big). */
function paintAtlas(f: Font, grain: number): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, f.atlasW * grain);
  cv.height = f.h * grain;
  const g = cv.getContext('2d');
  if (g) {
    g.fillStyle = '#ffffff';
    for (let i = 0; i < f.rows.length; i++) {
      const rows = grain === 1 ? f.rows[i] : (f.fine[i] ?? (f.fine[i] = fineRows(f.rows[i], FONT_BOLD[f.id])));
      for (let y = 0; y < rows.length; y++) {
        const row = rows[y];
        for (let x = 0; x < row.length; x++) {
          if (row.charCodeAt(x) === 35) g.fillRect(f.x[i] * grain + x, y, 1, 1); // '#'
        }
      }
    }
  }
  return cv;
}

function remember(f: Font, key: string, cv: HTMLCanvasElement): HTMLCanvasElement {
  if (f.tinted.size >= MAX_TINTS) {
    const oldest = f.tinted.keys().next();
    if (!oldest.done) f.tinted.delete(oldest.value);
  }
  f.tinted.set(key, cv);
  return cv;
}

/** The font's atlas filled with one colour. Cached, so fades should use globalAlpha, not new colours. */
function atlasFor(f: Font, color: string, grain: number): HTMLCanvasElement {
  const key = grain + color;
  const hit = f.tinted.get(key);
  if (hit) return hit;
  const white = f.white[grain] ?? (f.white[grain] = paintAtlas(f, grain));
  const cv = document.createElement('canvas');
  cv.width = white.width;
  cv.height = white.height;
  const g = cv.getContext('2d');
  if (!g) return white;
  g.drawImage(white, 0, 0);
  g.globalCompositeOperation = 'source-in'; // keep the glyph shapes, replace their colour
  g.fillStyle = color;
  g.fillRect(0, 0, cv.width, cv.height);
  return remember(f, key, cv);
}

/**
 * An atlas with each glyph's shadow baked in: the shadow colour one pixel down and right, the
 * text colour on top. One row taller than the plain atlas; the shadow's extra column falls into
 * the padding between glyphs. This makes a shadowed line cost one drawImage per glyph, not two.
 */
function shadowAtlasFor(f: Font, color: string, shadow: string, grain: number): HTMLCanvasElement {
  const key = grain + color + '\n' + shadow;
  const hit = f.tinted.get(key);
  if (hit) return hit;
  const under = atlasFor(f, shadow, grain);
  const over = atlasFor(f, color, grain);
  const cv = document.createElement('canvas');
  cv.width = over.width;
  cv.height = over.height + grain;
  const g = cv.getContext('2d');
  if (!g) return over;
  // (one FONT pixel down and right, as it always was: the shadow is as deep as before)
  g.drawImage(under, grain, grain);
  g.drawImage(over, 0, 0);
  return remember(f, key, cv);
}

/**
 * Copy the glyphs of one line out of an atlas. x, y and scale must be whole numbers.
 * `extra` is 1 for a shadow atlas (each glyph is one column and one row bigger), otherwise 0.
 * `grain`: the atlas holds that many pixels to a font pixel.
 */
function blit(g: CanvasRenderingContext2D, f: Font, src: HTMLCanvasElement, text: string, x: number, y: number, scale: number, extra: number, grain: number): void {
  const n = text.length;
  const h = f.h + extra;
  // (a fine glyph may be a picture pixel wider than its cell: a font pixel more is copied, out of the atlas's padding)
  const wide = extra + (grain > 1 ? 1 : 0);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const code = text.charCodeAt(i);
    let glyph = glyphOf(f, code);
    // Small font: a lower-case x that is not part of a word ("x3", "2 x 4") is a multiply sign.
    if (code === 120 && f.times >= 0 && !isLetter(prev) && !(i + 1 < n && isLetter(text.charCodeAt(i + 1)))) {
      glyph = f.times;
    }
    const w = f.w[glyph];
    if (f.ink[glyph]) g.drawImage(src, f.x[glyph] * grain, 0, (w + wide) * grain, h * grain, x, y, (w + wide) * scale, h * scale);
    x += (w + GAP) * scale;
    prev = code;
  }
}

/**
 * Which atlas a canvas is drawn on with: the fine one where the canvas holds at least FONT_GRAIN
 * picture pixels to a game pixel (the screen: its context is scaled so), the font's own pixels
 * anywhere else (a tool's preview, a picture built off screen), where the fine letters would be
 * squeezed back into half their pixels and come out broken.
 */
function grainOf(g: CanvasRenderingContext2D): number {
  if (typeof g.getTransform !== 'function') return 1;
  const m = g.getTransform();
  return Math.hypot(m.a, m.b) >= FONT_GRAIN - 0.01 ? FONT_GRAIN : 1;
}

// ---------------------------------------------------------------------------------------------
// Public API

/**
 * Draw one line of text. y is the TOP of the glyph cell. Returns the width drawn in pixels.
 * x and y are rounded to whole pixels. Line breaks are not handled here: split the text with
 * wrapText and draw each line LINE_H further down.
 */
export function drawText(g: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, opts?: TextOpts): number {
  const f = fontOf(opts?.font);
  const scale = cleanScale(opts?.scale);
  const str = typeof text === 'string' ? text : String(text);
  const width = measure(f, str) * scale;
  if (width <= 0 || typeof document === 'undefined') return width;

  const align = opts?.align;
  const left = Math.round(align === 'center' ? x - width / 2 : align === 'right' ? x - width : x);
  const top = Math.round(y);

  // Scaled-up glyphs must stay hard-edged; put the caller's setting back afterwards.
  const smoothing = g.imageSmoothingEnabled;
  if (scale > 1) g.imageSmoothingEnabled = false;
  const shadow = opts?.shadow;
  const grain = grainOf(g);
  if (shadow) blit(g, f, shadowAtlasFor(f, color, shadow, grain), str, left, top, scale, 1, grain);
  else blit(g, f, atlasFor(f, color, grain), str, left, top, scale, 0, grain);
  if (scale > 1) g.imageSmoothingEnabled = smoothing;
  return width;
}

/**
 * (MOCK-UP, words carved in the world: render/words_world.ts) The pixels of one line of text as rows of
 * '#' (ink) and '.', as drawText would ink them: at the font's own pixels, or at the finer grain
 * (`fine`: FONT_GRAIN picture pixels to a font pixel, the diagonals filled and the stems made bold
 * as the screen's letters are). Works without a DOM.
 */
export function glyphRows(text: string, font: FontId = 'normal', fine = false): string[] {
  const f = fontOf(font);
  const g = fine ? FONT_GRAIN : 1;
  const str = typeof text === 'string' ? text : String(text);
  const w = Math.max(0, measure(f, str) * g + (fine && FONT_BOLD[f.id] ? 1 : 0));
  const out = Array.from({ length: f.h * g }, () => new Array<string>(w).fill('.'));
  let x = 0;
  for (let i = 0; i < str.length; i++) {
    const gi = glyphOf(f, str.charCodeAt(i));
    const rows = fine ? (f.fine[gi] ?? (f.fine[gi] = fineRows(f.rows[gi], FONT_BOLD[f.id]))) : f.rows[gi];
    if (f.ink[gi]) for (let y = 0; y < rows.length && y < out.length; y++) for (let c = 0; c < rows[y].length; c++) if (rows[y].charCodeAt(c) === 35 && x + c < w) out[y][x + c] = '#';
    x += (f.w[gi] + GAP) * g;
  }
  return out.map((r) => r.join(''));
}

/** Width in pixels that drawText would draw (0 for an empty string). Works without a DOM. */
export function textWidth(text: string, font: FontId = 'normal', scale = 1): number {
  return measure(fontOf(font), typeof text === 'string' ? text : String(text)) * cleanScale(scale);
}

/** How many leading characters of `text` fit into maxWidth (at least 1, so wrapping always advances). */
function fitCount(f: Font, text: string, maxWidth: number): number {
  let w = -GAP;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    w += f.w[glyphOf(f, code)] + GAP;
    if (w > maxWidth) return Math.max(1, i);
  }
  return Math.max(1, text.length);
}

/**
 * Greedy word wrap to a pixel width. Honours '\n'. Never returns an empty array.
 * Runs of spaces collapse to one (a paragraph's leading indent is kept); a single word wider than
 * maxWidth is split across lines. An empty paragraph gives an empty line.
 */
export function wrapText(text: string, maxWidth: number, font: FontId = 'normal'): string[] {
  const f = fontOf(font);
  // NaN or a missing width means "do not wrap" rather than one letter per line
  const limit = typeof maxWidth === 'number' && !Number.isNaN(maxWidth) ? maxWidth : Infinity;
  const out: string[] = [];
  const paragraphs = (typeof text === 'string' ? text : String(text)).replace(/\r\n?/g, '\n').split('\n');
  for (const para of paragraphs) {
    const indent = /^ */.exec(para)?.[0] ?? '';
    const words = para.split(/[ \t]+/).filter((word) => word !== '');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const first = i === 0 ? indent + words[i] : words[i];
      const joined = line === '' ? first : line + ' ' + words[i];
      if (measure(f, joined) <= limit) {
        line = joined;
        continue;
      }
      // The word does not fit on this line: finish the line and start a new one with the word.
      if (line !== '') out.push(line);
      let rest = first;
      // A single word wider than the limit is chopped into pieces that fit.
      while (measure(f, rest) > limit && rest.length > 1) {
        const k = fitCount(f, rest, limit);
        out.push(rest.slice(0, k));
        rest = rest.slice(k);
      }
      line = rest;
    }
    out.push(line);
  }
  return out;
}
