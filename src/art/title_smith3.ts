// The picture behind the start screen, MADE NEW FOR THE NEW WORDSMITH (the art chat, 11 Oct 2026). A
// MOCK-UP BEHIND A SWITCH THAT IS OFF: TITLE_SMITH3.on. With it off the start screen is the old skald
// of art/title_smith2.ts, as it has been.
//
// The owner, 11 Oct 2026, 19:46: "Can you reimagine the title screen art to reflect the new wordsmith
// design". The new design is the wordsmith of Version 19.6 (art/smith3.ts and his ring, art/ring3.ts:
// his "Yes, this is him (Recommended)" and, of the ring, "Just right (Recommended)", 8 Oct): ancient
// and mighty; a teal cowl over his head, open over his face, its edge marked with points of light;
// a teal mantle over his shoulders; a deep night-blue robe; a long white beard and heavy white brows;
// his eyes burning cyan; RUNES BURNING ON HIM, down the front of his robe, along the edge of his
// mantle and cowl, in the skin of his bare forearms and the backs of his hands, and one on his brow;
// and his ring BIG AND WILD: each standing stone with a great rune burning in it, light licking up
// the stone above it, letters of light swirling round inside the ring, a column of light standing
// up off his slab with runes climbing in it.
//
// THE PICTURE HE CHOSE IS KEPT: we are on the floor in front of his table, looking steeply up at him
// leaning over us (title_smith2.ts, his "6 is fantastic"), the full screen, the menus along the
// bottom, his breath and the power running through the runes as before. What changes is HIM and HIS
// RING, to the new design.
//
// EVERYTHING UPRIGHT LEANS IN (as title_smith2.ts): whatever stands upright is drawn leaning toward a
// point far above the top of the picture (`up`).
//
// THE WHOLE SCREEN, ON EVERY SCREEN (as title_smith2.ts): painted once at SMITH3_W x SMITH3_H, bigger
// than any screen the game is laid out on; the screen shows the part that fits: its middle column
// is the screen's, and the row SMITH3_LIP (the table's edge) is SMITH3_LIFT above the bottom of the
// screen, where the menu is. Toward its edges and its top the picture sinks into the dark.
//
// One light: the word. Big surfaces are shaded by how far they are from it, in flat bands; the
// under side of everything is what is bright. What glows of his is cyan.

import { Px, mix, rgba } from '../engine/px';
import { hash2 } from '../engine/rng';
import { VAULT } from './ground';
import { CYAN, INK, SPARK, TEAL } from './kit';
import type { Ramp } from './kit';

/**
 * THE SWITCH: the start screen shows this picture only while it is on. ON, on his yes in the art chat by
 * 21:27 on 11 Oct 2026, asked whether it was right: “Yes, send it to main (Recommended)” (the Wordsmith
 * Chat Board, the art chat's post of 21:29).
 */
export const TITLE_SMITH3 = { on: true };

/** The picture's size, in game pixels. */
export const SMITH3_W = 640;
export const SMITH3_H = 360;
const W = SMITH3_W;
const H = SMITH3_H;
/** Everything is arranged about this column. */
const CX = 320;
/** The row of the table's edge: the under side of its lip, where his fists are. */
export const SMITH3_LIP = 280;
const LIP = SMITH3_LIP;
/** How far above the bottom of the screen that row is put: the front of the table shows over the menu's buttons. */
export const SMITH3_LIFT = 74;

type Pt = readonly [number, number];
type Tones = readonly string[];

// ---------------------------------------------------------------------------------------------
// From the floor: the one rule of perspective

/** The row of the point everything upright leans toward (far above the picture). */
const VY = -180;
/** The row at which an upright is at its own column (under the bottom of the picture: the floor at our feet). */
const FLOOR = 354;
/** How much narrower things are at row y than at the floor. */
const lean = (y: number): number => (y - VY) / (FLOOR - VY);
/** The column, at row y, of an upright that stands at column x on the floor. */
const up = (x: number, y: number): number => CX + (x - CX) * lean(y);

/** The light: the word, standing on the table behind its edge. */
const LX = CX;
const LY = LIP - 20;
/** Where the word stands: its middle. */
export const SMITH3_WORD: Pt = [LX, LY];

// ---------------------------------------------------------------------------------------------
// Colours

/** The dark the picture sinks into. */
const NIGHT = '#05040f';
/** The vault overhead: the vault's own stone (ground.ts). */
const WALL = VAULT.lit;
/** A standing stone: paler and bluer than the vault, so that it stands off it. */
const MENHIR: Ramp = ['#191a44', '#262a62', '#3a4088', '#5660ac', '#7e8ad0'];
/** Grit shaken from the vault: the stone's own colour, lit. */
const GRIT = MENHIR[3];
/** The table: the darkest dressed stone in the room, so that its light is the brightest thing. */
const SLAB: Tones = ['#0c0a22', '#12102e', '#1c1a48', '#2a2866', '#3c3a86', '#5a58ac'];
/** The light of the word, from its white heart outward. */
const WORD: readonly string[] = ['#ffffff', SPARK[3], CYAN[2], '#1898b4', CYAN[0]];

// ---------------------------------------------------------------------------------------------
// Small helpers (as title.ts and title_smith.ts have them, for a canvas of this size)

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function layer(): Px {
  return new Px(W, H);
}

/** A part of the picture to work in: columns x0 to before x1, rows y0 to before y1. (He is a small part of it, and he is painted several times over.) */
interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}
const ALL: Box = { x0: 0, y0: 0, x1: W, y1: H };

/** Put a part on the picture with an ink line round it, so that overlapping parts stay separate. `line` null: no line; nor where `bare` says. */
function over(dst: Px, part: Px, line: string | null = INK, box: Box = ALL, bare?: (x: number, y: number) => boolean): void {
  const a = part.d;
  const ink = line ? rgba(line) : null;
  const b = dst.d;
  const row = W * 4;
  for (let y = box.y0; y < box.y1; y++) {
    for (let x = box.x0; x < box.x1; x++) {
      const i = (y * W + x) * 4;
      if (a[i + 3] > 0) {
        b[i] = a[i];
        b[i + 1] = a[i + 1];
        b[i + 2] = a[i + 2];
        b[i + 3] = 255;
      } else if (ink && !(bare && bare(x, y)) && ((x > 0 && a[i - 1] > 0) || (x < W - 1 && a[i + 7] > 0) || (y > 0 && a[i + 3 - row] > 0) || (y < H - 1 && a[i + 3 + row] > 0))) {
        b[i] = ink[0];
        b[i + 1] = ink[1];
        b[i + 2] = ink[2];
        b[i + 3] = 255;
      }
    }
  }
}

/** Mix the pixel at byte offset i toward the colour c. */
function toward(d: Uint8ClampedArray, i: number, c: readonly number[], t: number): void {
  d[i] = Math.round(d[i] + (c[0] - d[i]) * t);
  d[i + 1] = Math.round(d[i + 1] + (c[1] - d[i + 1]) * t);
  d[i + 2] = Math.round(d[i + 2] + (c[2] - d[i + 2]) * t);
}

/** Visit every painted pixel of a layer; return a colour to repaint it, or undefined to leave it. */
function scan(l: Px, fn: (x: number, y: number) => string | undefined, box: Box = ALL): void {
  const d = l.d;
  for (let y = box.y0; y < box.y1; y++) {
    for (let x = box.x0, i = (y * W + x) * 4 + 3; x < box.x1; x++, i += 4) {
      if (d[i] === 0) continue;
      const c = fn(x, y);
      if (c !== undefined) l.set(x, y, c);
    }
  }
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

/** Sink a layer into the dark: each pixel is mixed toward `dark`, more the further it is from the light; in flat bands. */
function gloom(p: Px, lx: number, ly: number, near: number, far: number, dark: string, max: number, bands = 14): void {
  const c = rgba(dark);
  const d = p.d;
  const amount: number[] = [];
  for (let q = 0; q <= bands; q++) amount.push((q / bands) * max);
  for (let y = 0, i = 0; y < H; y++) {
    for (let x = 0; x < W; x++, i += 4) {
      if (d[i + 3] === 0) continue;
      const t = amount[band((reach(x, y, lx, ly) - near) / (far - near), bands)];
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

/** His shadow on what is behind him: the light is low and in front of him, so his outline is thrown up and outward, bigger than he is. */
function thrown(p: Px, mask: Uint8Array, lx: number, ly: number, grow: number, dark: string, amount: number, below: number): void {
  const c = rgba(dark);
  for (let y = 0; y < below; y++) {
    const fy = Math.round(ly + (y - ly) / grow);
    if (fy < 0 || fy >= H) continue;
    for (let x = 0; x < W; x++) {
      const fx = Math.round(lx + (x - lx) / grow);
      if (fx < 0 || fx >= W) continue;
      if (mask[fy * W + fx] === 1 && p.d[(y * W + x) * 4 + 3] > 0) toward(p.d, (y * W + x) * 4, c, amount);
    }
  }
}

/** Shade a filled shape from tones that run dark to light: by how near the light each pixel is, and by whatever else `extra` says. */
function underlit(l: Px, tones: Tones, far: number, extra?: (x: number, y: number) => number): void {
  const n = tones.length;
  scan(l, (x, y) => {
    const v = 1 - reach(x, y, LX, LY) / far + (extra ? extra(x, y) : 0);
    return tones[Math.max(0, Math.min(n - 1, Math.floor(v * n)))];
  }, HIM);
}

/** A limb: a thick line from one point to another, of one width at each end. */
function capsule(l: Px, a: Pt, b: Pt, r0: number, r1: number, c: string): void {
  const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]));
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n;
    const r = r0 + (r1 - r0) * t;
    l.ellipse(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, r, r, c);
  }
}

// ---------------------------------------------------------------------------------------------
// Runes: the old northern ones, none of which reads as a letter of ours (title_smith.ts)

const RUNES: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  [[2, 0, 2, 6], [0, 2, 2, 0], [4, 2, 2, 0]],
  [[1, 0, 1, 6], [1, 3, 4, 0], [1, 5, 4, 2]],
  [[1, 0, 1, 6], [1, 0, 4, 2], [1, 2, 4, 4]],
  [[2, 0, 2, 6], [0, 2, 4, 4]],
  [[2, 0, 2, 6], [2, 0, 4, 2], [2, 6, 0, 4]],
  [[3, 0, 1, 2], [1, 2, 3, 4], [3, 4, 1, 6]],
  [[2, 0, 0, 2], [2, 0, 4, 2], [0, 2, 4, 6], [4, 2, 0, 6]],
  [[2, 1, 0, 3], [0, 3, 2, 5], [2, 5, 4, 3], [4, 3, 2, 1]],
  [[0, 0, 4, 0], [4, 0, 0, 6], [0, 6, 4, 6], [0, 0, 4, 6]],
  [[1, 0, 1, 6], [1, 0, 4, 3]],
  [[2, 0, 2, 6], [0, 1, 4, 3], [0, 3, 4, 5]],
  [[1, 0, 1, 6], [1, 2, 4, 3], [4, 3, 1, 5]],
];

/** The strokes of rune `k`, each `s` times the size, its top left corner at (x, y); `skew`: columns it slides for every row it climbs (a rune cut in a stone that leans). */
function runeAt(p: Px, k: number, x: number, y: number, s: number, c: string, fat = 1, skew = 0): void {
  for (const [a, b, e, f] of RUNES[((k % RUNES.length) + RUNES.length) % RUNES.length]) {
    const x0 = x + a * s + (6 - b) * s * skew;
    const x1 = x + e * s + (6 - f) * s * skew;
    for (let w = 0; w < fat; w++) p.line(Math.round(x0) + w, Math.round(y + b * s), Math.round(x1) + w, Math.round(y + f * s), c);
  }
}

/** Where a rune is cut (for the life of the picture: they light in turn). */
export interface Smith3Rune {
  /** Its top left corner, which rune, how big, how thick, and how it leans. */
  x: number;
  y: number;
  k: number;
  s: number;
  fat: number;
  skew: number;
  /** 0..1: how near the light it is (the further ones are fainter). */
  near: number;
  /** It is cut in the table's front (the rest are in the standing stones). */
  table?: boolean;
  /** It is the great rune of its stone: it burns always, and blazes. */
  great?: boolean;
  /**
   * Where it is along the run the power makes through it (the life: THE POWER, below). In a stone:
   * 0 at the floor, 1 where the stone goes up into the dark. Along the table: 0 at the end on our
   * left, 1 at the end on our right.
   */
  at: number;
  /**
   * What of it can be seen, pixel by pixel (each y * W + x): its strokes, the stone close round
   * them, and the stone further off that it lights when the power is in it. Whatever of it he,
   * his hands or his table stand in front of is left out, however he breathes.
   */
  dots: Int32Array;
  edge: Int32Array;
  halo: Int32Array;
}

/** A rune as it is cut, before it is known what of it can be seen. */
type CutRune = Omit<Smith3Rune, 'dots' | 'edge' | 'halo'>;

// ---------------------------------------------------------------------------------------------
// The vault overhead: ribs that run up and in to a crown out of sight, courses of stone across them

function vault(p: Px): void {
  /** A rib: the column, at row y, of the rib that comes down to column x0 at the table's edge. They curve in as they climb. */
  const rib = (x0: number, y: number): number => {
    const t = clamp01(1 - (y + 60) / (LIP + 60));
    return CX + (x0 - CX) * (1 - t * t * 0.9);
  };
  /** A course: its row at column x, for the course that crosses the middle at row r. They arch. */
  const course = (r: number, x: number): number => r + (1 - Math.cos(((x - CX) / CX) * 1.25)) * (22 + r * 0.42);
  const rows: number[] = [];
  for (let r = -60, h = 13; r < LIP + 40; r += h, h *= 1.13) rows.push(r);
  const feet: number[] = [];
  for (let n = -9; n <= 9; n++) feet.push(CX + n * 62 + (n === 0 ? 0 : Math.sign(n) * 6));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // which cell of the web this pixel is in
      let ci = 0;
      while (ci + 1 < rows.length && course(rows[ci + 1], x) <= y) ci++;
      let ri = 0;
      while (ri + 1 < feet.length && rib(feet[ri + 1], y) <= x) ri++;
      const top = course(rows[ci], x);
      const left = rib(feet[ri], y);
      const n = hash2(ci, ri, 61);
      // the joint; under it the stone's upper edge in shade; a stone now and then a little lighter or darker
      const c = y - top < 1 ? WALL[0] : x - left < 1 ? WALL[0] : y - top < 2 ? WALL[1] : n < 0.22 ? WALL[3] : n > 0.8 ? WALL[1] : WALL[2];
      p.set(x, y, c);
    }
  }
  // the ribs themselves stand proud of the web: a dark side, a lit side
  for (const f of feet) {
    if (f === CX) continue;
    for (let y = 0; y < LIP + 30; y++) {
      const x = Math.round(rib(f, y));
      const s = f < CX ? 1 : -1;
      p.set(x, y, WALL[4]).set(x + s, y, WALL[3]).set(x - s, y, WALL[0]).set(x - 2 * s, y, WALL[0]);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The standing stones of his ring: they lean in over us

/** The row above which the picture sinks into the dark: a stone's runes are counted from the floor up to here (Smith3Rune.at). */
const STONE_DARK = 64;

/**
 * One standing stone. It stands on the floor from column x0 to x1 and rises to row `top`, leaning
 * in with everything else; its head is cut on a slant. `near`: 0..1, how near us it stands (the
 * nearer ones are darker: they are between us and the light). The runes cut in it go on `runes`.
 */
function menhir(p: Px, x0: number, x1: number, top: number, seed: number, near: number, runes: CutRune[], greatY = -1): void {
  const l = layer();
  const side = (x0 + x1) / 2 < CX ? 1 : -1; // which way the light is: +1, to its right
  const base = H + 4;
  for (let y = Math.max(0, top); y < H; y++) {
    const t = y - top;
    const cut = Math.max(0, 16 - t) * 0.8;
    const a = up(x0, y) + (hash2(y >> 3, seed, 41) - 0.5) * 2.4;
    const b = up(x1, y) + (hash2(y >> 3, seed, 43) - 0.5) * 2.4;
    const xa = Math.round(a + (side > 0 ? cut * 1.6 : cut * 0.5));
    const xb = Math.round(b - (side > 0 ? cut * 0.5 : cut * 1.6));
    for (let x = xa; x <= xb; x++) {
      // across it: the face turned to the light, the broad front, the side turned away
      const f = side > 0 ? (x - xa) / Math.max(1, xb - xa) : (xb - x) / Math.max(1, xb - xa);
      const tone = f > 0.88 ? 4 : f > 0.66 ? 3 : f > 0.22 ? 2 : 1;
      l.set(x, y, MENHIR[tone]);
    }
  }
  // its grain: cracks that run with the lean, pits, a band of lichen-dark here and there
  for (let n = 0; n < 16; n++) {
    const y = Math.max(0, top) + 20 + Math.floor(hash2(n, seed, 45) * (base - Math.max(0, top) - 30));
    const fx = x0 + (x1 - x0) * (0.15 + hash2(n, seed, 47) * 0.7);
    const long = 4 + Math.floor(hash2(n, seed, 49) * 12);
    for (let i = 0; i < long; i++) {
      const xx = Math.round(up(fx, y + i) + Math.sin(i * 0.7 + n) * 1.3);
      if (l.has(xx, y + i) && l.has(xx + 1, y + i) && l.has(xx - 1, y + i)) l.set(xx, y + i, MENHIR[1]).set(xx + side, y + i, MENHIR[3]);
    }
  }
  for (let n = 0; n < 22; n++) {
    const y = Math.max(0, top) + 8 + Math.floor(hash2(n, seed, 51) * (base - Math.max(0, top) - 12));
    const xx = Math.round(up(x0 + (x1 - x0) * (0.1 + hash2(n, seed, 53) * 0.8), y));
    if (l.has(xx, y) && l.has(xx + 1, y + 1)) l.set(xx, y, MENHIR[1]).set(xx + 1, y, MENHIR[1]).set(xx, y + 1, MENHIR[3]);
  }
  over(p, l);
  // the runes cut in it, one under another, growing as they come down toward us: dark where they
  // are cut; the light in them is the life's
  const mid = (x0 + x1) / 2 - side * (x1 - x0) * 0.06;
  // THE GREAT RUNE OF THE STONE (art/ring3.ts: each stone with one of his runes cut big and burning), at row greatY
  const gs = Math.round(lean(Math.max(0, greatY)) * (x1 - x0) * 0.064 * 2 * 2.3) / 2;
  if (greatY > 0) {
    const k = (seed * 7 + 2) % RUNES.length;
    const skew = (up(mid, greatY) - up(mid, greatY + 6 * gs)) / (6 * gs);
    const x = Math.round(up(mid, greatY + 6 * gs) - 2 * gs);
    runeAt(p, k, x + 1, greatY + 1, gs, MENHIR[0], 3, skew);
    runeAt(p, k, x, greatY, gs, mix(CYAN[2], MENHIR[2], 0.4), 3, skew);
    runes.push({ x, y: greatY, k, s: gs, fat: 3, skew, near: 1, at: (H - (greatY + 3 * gs)) / (H - STONE_DARK), great: true });
  }
  let y = top + 30;
  for (let n = 0; y < H - 20; n++) {
    const s = Math.max(1, Math.round(lean(y) * (x1 - x0) * 0.064 * 2) / 2);
    const k = (seed * 3 + n * 5) % RUNES.length;
    const skew = (up(mid, y) - up(mid, y + 6 * s)) / (6 * s);
    const x = Math.round(up(mid, y + 6 * s) - 2 * s);
    const fat = s >= 2 ? 2 : 1;
    // (none where the great rune is)
    const clear = greatY < 0 || y + 6 * s < greatY - 8 || y > greatY + 6 * gs + 8;
    if (y > 0 && clear) {
      runeAt(p, k, x + 1, y + 1, s, MENHIR[0], fat, skew);
      runeAt(p, k, x, y, s, mix(CYAN[2], MENHIR[2], 0.5 + near * 0.2), fat, skew);
      runes.push({ x, y, k, s, fat, skew, near: 1 - near, at: (H - (y + 3 * s)) / (H - STONE_DARK) });
    }
    y += Math.round(6 * s + 14 * lean(y) + 6);
  }
}

// ---------------------------------------------------------------------------------------------
// The forge table, from under its edge: we see its front, and nothing of its top

/** The table's front: its two top corners (at the edge) and how far it has spread by the bottom of the picture. */
const TABLE_L = 160;
const TABLE_R = W - 160;
/** The column of a line down the table's front that starts at column x under the edge: it is nearer than the stones, and spreads faster. */
const tableX = (x: number, y: number): number => CX + (x - CX) * (1 + ((y - LIP) / (FLOOR - LIP)) * 0.27);

/** The band cut along the top of the table's front, in which its runes are: its top row, and how many rows of it there are. */
const BAND_TOP = LIP + 6;
const BAND_H = 20;

function table(runes: CutRune[]): Px {
  const l = layer();
  for (let y = LIP; y < H; y++) {
    const xa = Math.round(tableX(TABLE_L, y));
    const xb = Math.round(tableX(TABLE_R, y));
    for (let x = xa; x <= xb; x++) l.set(x, y, SLAB[2]);
  }
  // the band cut along the top of the front: a sunk field between two fillets, the runes in it
  const bandTop = BAND_TOP;
  const bandH = BAND_H;
  scan(l, (x, y) => {
    if (y < LIP + 3) return SLAB[0]; // the shadow under the lip
    if (y === bandTop - 1 || y === bandTop + bandH) return SLAB[4];
    if (y === bandTop - 2 || y === bandTop + bandH + 1) return SLAB[1];
    if (y >= bandTop && y < bandTop + bandH) return SLAB[1];
    return undefined;
  });
  for (let n = -7; n <= 7; n++) {
    const x = Math.round(tableX(CX + n * 21, bandTop + 10)) - 4;
    const k = (n + 40) * 3 + 1;
    const skew = n * -0.012;
    runeAt(l, k, x + 1, bandTop + 4, 2, SLAB[0], 2, skew);
    runeAt(l, k, x, bandTop + 3, 2, mix(CYAN[2], SLAB[2], 0.55), 2, skew);
    runes.push({ x, y: bandTop + 3, k, s: 2, fat: 2, skew, near: 1 - Math.abs(n) / 9, table: true, at: (n + 7) / 14 });
  }
  // under the band: great dressed blocks, their joints spreading as they come down to us
  const courseTop = bandTop + bandH + 2;
  scan(l, (x, y) => {
    if (y < courseTop) return undefined;
    const row = y < courseTop + 34 ? 0 : 1;
    const y0 = row === 0 ? courseTop : courseTop + 34;
    // the joints of one course are set off from the next's
    const pitch = 78;
    const off = row === 0 ? 0 : 39;
    const u = (x - CX) / (1 + ((y - LIP) / (FLOOR - LIP)) * 0.27) + CX; // the column this pixel has at the edge
    const cell = Math.floor((u - CX - off + 4000) / pitch);
    const inCell = (u - CX - off + 4000) % pitch;
    if (y === y0) return SLAB[0];
    if (inCell < 1.2) return SLAB[0];
    if (y === y0 + 1 || inCell < 2.6) return SLAB[3];
    return (cell + row) % 2 ? SLAB[2] : mix(SLAB[2], SLAB[1], 0.5);
  });
  return l;
}

/** The lip of the table's top: it juts out over us. Its under side is the darkest thing in the picture; the light of the word spills over its edge. */
function lip(p: Px): void {
  const xa = Math.round(tableX(TABLE_L, LIP)) - 8;
  const xb = Math.round(tableX(TABLE_R, LIP)) + 8;
  for (let y = LIP - 7; y < LIP + 1; y++) for (let x = xa - (LIP - y > 4 ? 0 : 1); x <= xb + (LIP - y > 4 ? 0 : 1); x++) p.set(x, y, y >= LIP - 1 ? '#080616' : SLAB[0]);
  // its arris: lit from behind and above by the word
  for (let x = xa; x <= xb; x++) {
    const t = 1 - Math.abs(x - CX) / (xb - CX + 6);
    const c = t > 0.78 ? WORD[0] : t > 0.55 ? WORD[1] : t > 0.3 ? WORD[2] : t > 0.12 ? WORD[3] : WORD[4];
    p.set(x, LIP - 8, c);
    if (t > 0.5) p.set(x, LIP - 9, t > 0.8 ? WORD[1] : WORD[2]);
    if (t > 0.25 && (x + 1) % 2 === 0) p.set(x, LIP - 7, WORD[3]);
  }
}

// ---------------------------------------------------------------------------------------------
// The word he is making: one great rune, standing on the table behind its edge

const BOUND: ReadonlyArray<readonly [number, number, number, number]> = [
  [3, 0, 3, 10],
  [3, 0, 1, 2], [3, 0, 5, 2],
  [3, 3, 0.5, 5.5], [0.5, 5.5, 3, 8], [3, 8, 5.5, 5.5], [5.5, 5.5, 3, 3],
  [3, 10, 1, 8.6], [3, 10, 5, 8.6],
];
const BOUND_S = 2.4;

/** The strokes of the word, each grown by `grow` pixels all round: on a layer, or dot by dot for the life. */
export function word3Strokes(put: (x: number, y: number) => void, grow: number): void {
  const [wx, wy] = SMITH3_WORD;
  const x0 = wx - 3 * BOUND_S;
  const y0 = wy - 5 * BOUND_S;
  for (const [a, b, e, f] of BOUND) {
    const n = Math.ceil(Math.max(Math.abs(e - a), Math.abs(f - b)) * BOUND_S);
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + (a + ((e - a) * i) / n) * BOUND_S);
      const y = Math.round(y0 + (b + ((f - b) * i) / n) * BOUND_S);
      for (let ox = -grow; ox <= grow; ox++) for (let oy = -grow; oy <= grow; oy++) if (Math.abs(ox) + Math.abs(oy) <= grow + (grow > 1 ? 1 : 0)) put(x + ox, y + oy);
    }
  }
}

function word(p: Px): void {
  for (const [grow, c] of [[3, WORD[4]], [2, WORD[3]], [1, WORD[2]]] as const) word3Strokes((x, y) => (y < LIP - 8 ? p.set(x, y, c) : p), grow);
  word3Strokes((x, y) => (y < LIP - 8 ? p.set(x, y, WORD[0]) : p), 0);
}

// ---------------------------------------------------------------------------------------------
// THE WORDSMITH AS HE IS NOW (art/smith3.ts: "Yes, this is him (Recommended)"), from under his table,
// leaning over us as the old skald did.
//
// He is foreshortened: what is low on him is near us and big (his fists, his bare forearms, the hang
// of his beard), and his head is far up and small, in the shell of his cowl. The light is under all
// of it, so the under side of everything is what is bright: the hem of his mantle, the roll of his
// sleeves, the tip of his beard, the under side of his nose and of his brows. The runes on him burn
// of themselves.

const SKIN_T: Tones = ['#2a2056', '#40336f', '#5a4a8a', '#7868a6', '#9a8cc6', '#b8ace4', '#d8d0f8', '#dff6fc'];
const HAIR_T: Tones = ['#2c2460', '#3e3478', '#554a92', '#7468ae', '#9a8ecc', '#bcb2e6', '#dcd4f8', '#f0e8ff', '#e9fdff'];
/** His mantle and cowl: the teal of art/smith3.ts MANTLE (the fallen wordsmith's teal), from the dark of its folds to the edge the light finds. */
const MANTLE_T: Tones = ['#041824', '#08283a', '#0c3a4e', '#11566a', '#16707e', '#1d8a92', '#2aa4a6', '#46c2bc'];
/** The deep of his cowl round his face. */
const DEEP = '#020c16';
/** His robe: art/smith3.ts ROBE, the deep night-blue, carried further into the dark for its folds. */
const ROBE_T: Tones = ['#0c0a26', '#120f32', '#1a1642', '#221d54', '#2c2870', '#38338a', '#4844a2', '#5e5abc', '#7672d0'];

/** How big he is: 1 is sketch 6. His measures are taken from the table's edge, so he grows up and outward from it. */
const SIZE = 1;
const X = (dx: number): number => CX + dx * SIZE;
const Y = (row: number): number => LIP - (LIP - row) * SIZE;
/** How far the light reaches up him. */
const FAR = 205 * SIZE;
/** The top of the peak of his cowl: the name of the game goes over it. */
const HOOD_TOP = 144;
/** The part of the picture he is in, all of him above the table, however he breathes (his hands are not of it: they are painted with the table). */
const HIM: Box = { x0: Math.floor(X(-128)), y0: HOOD_TOP - 2, x1: Math.ceil(X(128)) + 1, y1: LIP + 2 };

/** A character map: one character a pixel. `key` says what colour each is; '.' is nothing. */
type Key = Readonly<Record<string, string>>;
function stamp(l: Px, x: number, y: number, rows: readonly string[], key: Key, flip = false): void {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = key[row[flip ? row.length - 1 - i : i]];
      if (c) l.set(x + i, y + j, c);
    }
  });
}

/** The pixels of the strokes of rune `k`, `s` times the size, its top left corner at (x, y), `fat` wide. */
function runePts(k: number, x: number, y: number, s: number, fat = 1): Pt[] {
  const out: Pt[] = [];
  for (const [a, b, e, f] of RUNES[((k % RUNES.length) + RUNES.length) % RUNES.length]) {
    const x0 = x + a * s;
    const y0 = y + b * s;
    const x1 = x + e * s;
    const y1 = y + f * s;
    const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
    for (let i = 0; i <= n; i++) for (let w = 0; w < fat; w++) out.push([Math.round(x0 + ((x1 - x0) * i) / Math.max(1, n)) + w, Math.round(y0 + ((y1 - y0) * i) / Math.max(1, n))]);
  }
  return out;
}

/** A RUNE BURNING ON HIM, laid on the part it is in and nowhere off it: a dim ring of its light round its strokes, the strokes bright, white at the heart (`heart`). */
function burnOn(l: Px, k: number, x: number, y: number, s: number, fat = 1, heart: string = WORD[1]): void {
  const pts = runePts(k, x, y, s, fat);
  const strokes = new Set(pts.map(([px, py]) => py * W + px));
  for (const [px, py] of pts) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const qx = px + dx;
      const qy = py + dy;
      if (!strokes.has(qy * W + qx) && l.has(qx, qy)) l.set(qx, qy, WORD[3]);
    }
  }
  for (const [px, py] of pts) if (l.has(px, py)) l.set(px, py, heart);
}

/**
 * HE BREATHES (the owner, 5 Oct 2026, 20:29: "we want to see him breathing with shoulders kinda
 * raising up every breath"). Everything of him that hangs from his shoulders is painted for a
 * `rise`: how many rows his breath has lifted them, 0 (breathed out) to SMITH3_BREATH (breathed
 * in). His fists stay where they are on the table and his head stays where it is, looking down at
 * us: it is his shoulders that come up behind it, and his elbows a little with them. What is
 * painted ON a part that rises (the runes down his robe, the folds and the burning edge of his
 * mantle) rises with it.
 */
export const SMITH3_BREATH = 4;

/** The back of his mantle, falling behind his arms. */
function cloak(rise: number): Px {
  const l = layer();
  l.poly([[X(-108), LIP], [X(-62 - rise * 0.3), Y(182) - rise], [X(62 + rise * 0.3), Y(182) - rise], [X(108), LIP]], MANTLE_T[3]);
  // (its folds hang with the lean of everything)
  underlit(l, MANTLE_T, FAR, (x, y) => -0.36 + (Math.floor(((x - CX) / lean(y)) / 9) % 2 ? 0.08 : 0));
  return l;
}

/** His robe, the deep night-blue, between his arms: RUNES BURN DOWN ITS FRONT, a column of them either side of where it parts under his beard. */
function robe(rise: number): Px {
  const l = layer();
  const top = Y(186) - rise;
  l.poly([[X(-76), LIP], [X(-52 - rise * 0.25), top], [X(52 + rise * 0.25), top], [X(76), LIP]], ROBE_T[4]);
  // its folds: long ones that hang with the lean, darker toward its sides
  underlit(l, ROBE_T, FAR * 0.82, (x, y) => -0.1 + Math.sin(((x - CX) / lean(y)) / 5.5) * 0.06 - ((x - CX) / (76 * SIZE)) ** 2 * 0.34);
  // (where it parts, under his beard: its two edges, a seam of shade)
  scan(l, (x, y) => (Math.abs(Math.abs(x + 0.5 - CX) - 41 * lean(y) / lean(LIP)) < 0.8 ? ROBE_T[1] : undefined), HIM);
  for (const sd of [-1, 1]) {
    let n = 0;
    for (let y = top + 14; y < LIP - 16; y += 14, n++) burnOn(l, (n * 5 + (sd > 0 ? 3 : 0)) % RUNES.length, Math.round(CX + sd * 47 * lean(y) / lean(LIP)) - 3, Math.round(y), 1.5, 1);
  }
  return l;
}

/** Where his arms are: shoulder, elbow, wrist; for the side s (-1: his right, our left). */
const shoulder = (s: number, rise = 0): Pt => [X(s * (54 + rise * 0.35)), Y(196) - rise];
const elbow = (s: number, rise = 0): Pt => [X(s * (104 + rise * 0.5)), Y(214) - rise * 0.45];
const wrist = (s: number): Pt => [X(s * 93), LIP - 16 * SIZE];
/** The middle of each fist, on the table's edge. */
const fistAt = (s: number): Pt => [X(s * 92), LIP - 5];
/** How thick his sleeve is at the shoulder and the elbow; his bare forearm at the elbow and the wrist (thick, an old smith's arms; the muscle swells it below the elbow); the roll of his sleeve pushed back to the elbow. */
const SLEEVE: readonly [number, number] = [15, 19];
const ARM: readonly [number, number] = [16, 14.5];
const CUFF = 21;

/** How much a pixel of the limb from a to b is turned to the light: -1 (its far side) to 1 (the side the light is on). */
function turned(a: Pt, b: Pt, r: number, x: number, y: number): number {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  const d = ((x + 0.5 - a[0]) * nx + (y + 0.5 - a[1]) * ny) / r;
  const side = (LX - a[0]) * nx + (LY - a[1]) * ny >= 0 ? 1 : -1;
  return Math.max(-1, Math.min(1, d * side));
}

/** The sleeve of his robe over his upper arm: wide, folds across it, the under side of each lit; pushed back to the elbow in a thick roll. */
function upperArm(s: number, rise: number): Px {
  const l = layer();
  const a = shoulder(s, rise);
  const b = elbow(s, rise);
  capsule(l, a, b, SLEEVE[0] * SIZE, SLEEVE[1] * SIZE, ROBE_T[4]);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  const drawn = rise * 0.75;
  underlit(l, ROBE_T, FAR * 0.9, (x, y) => {
    const t = ((x - a[0]) * ux + (y + drawn - a[1]) * uy) / len;
    return -0.28 + (Math.sin(t * 17) > 0.55 ? -0.07 : Math.sin(t * 17) < -0.6 ? 0.05 : 0) + turned(a, b, 15 * SIZE, x, y) * 0.18;
  });
  // THE ROLL OF THE SLEEVE, pushed back to the elbow: thick, its under edge catching the light (the mantle hides its top; his bare forearm comes out of it)
  {
    const e = b;
    const w = wrist(s);
    const fl = Math.hypot(w[0] - e[0], w[1] - e[1]);
    const fx = (w[0] - e[0]) / fl;
    const fy = (w[1] - e[1]) / fl;
    const roll = layer();
    capsule(roll, [e[0] - fx * 5, e[1] - fy * 5], [e[0] + fx * 3, e[1] + fy * 3], CUFF * SIZE, (CUFF - 0.5) * SIZE, ROBE_T[4]);
    underlit(roll, ROBE_T, FAR * 0.9, (x, y) => {
      const t = ((x - e[0]) * fx + (y - e[1]) * fy) / fl;
      // (its folds go round it; its lower edge, nearest the light, the brightest)
      return -0.14 + (t > 0.02 ? 0.14 : 0) + (Math.sin(t * 70 + x * 0.35) > 0.6 ? -0.08 : 0) + turned(e, w, CUFF * SIZE, x, y) * 0.16;
    });
    for (let i = 0; i < W * H * 4; i += 4) {
      if (roll.d[i + 3] === 0) continue;
      l.d[i] = roll.d[i];
      l.d[i + 1] = roll.d[i + 1];
      l.d[i + 2] = roll.d[i + 2];
      l.d[i + 3] = 255;
    }
  }
  return l;
}

/**
 * HIS BARE FOREARM: thick, an old smith's, corded; the swell of the muscle on its outer side below the
 * elbow, tendons standing out toward the wrist, a vein down its inner side; A RUNE BURNING IN ITS SKIN,
 * big. The front of the roll of his sleeve wraps it at the elbow. The light is the word's,
 * low and toward the middle: the inner side of the arm is the lit one.
 */
function foreArm(s: number, rise: number): Px {
  const l = layer();
  const a = elbow(s, rise);
  const b = wrist(s);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  // (across it: + toward its outer side, away from the middle of the picture)
  const nx = -uy;
  const ny = ux;
  const out = nx * s >= 0 ? 1 : -1;
  const along = (x: number, y: number): number => ((x + 0.5 - a[0]) * ux + (y + 0.5 - a[1]) * uy) / len;
  const across = (x: number, y: number): number => ((x + 0.5 - a[0]) * nx + (y + 0.5 - a[1]) * ny) * out;
  // thick at the elbow, swelling below it with the muscle (more on the outer side), narrowing to the wrist
  const r = (t: number): number => (ARM[0] + (ARM[1] - ARM[0]) * clamp01(t)) * SIZE;
  const swell = (t: number): number => Math.sin(Math.PI * clamp01((t + 0.05) / 0.8)) ** 1.4;
  const rOut = (t: number): number => r(t) + 4.4 * swell(t) * SIZE;
  const rIn = (t: number): number => r(t) + 2.2 * swell(t) * SIZE;
  const R = ARM[0] + 6;
  for (let y = Math.floor(Math.min(a[1], b[1]) - R); y <= Math.ceil(Math.max(a[1], b[1]) + R); y++) {
    for (let x = Math.floor(Math.min(a[0], b[0]) - R); x <= Math.ceil(Math.max(a[0], b[0]) + R); x++) {
      const t = along(x, y);
      const d = across(x, y);
      const tt = clamp01(t);
      const half = d >= 0 ? rOut(tt) : rIn(tt);
      // (round at each end)
      if (Math.hypot((t - tt) * len, d) <= half) l.set(x, y, SKIN_T[3]);
    }
  }
  // ROUND, IN FLAT TONES: the inner side turned to the word's light, the outer side in shade with a rim
  // of light thrown back along its edge; the muscle's swell catching the light along its crest, a groove
  // under it; two tendons standing out toward the wrist; a vein raised on the inner side, winding
  scan(l, (x, y) => {
    const tt = clamp01(along(x, y));
    const d = across(x, y);
    const k = Math.max(-1, Math.min(1, d / (d >= 0 ? rOut(tt) : rIn(tt))));
    let v = 1.0 + 4.6 * Math.max(0, Math.cos(Math.asin(k) + 0.85));
    if (k > 0.86) v += 0.9;
    const crest = 0.4 + 0.08 * Math.sin(tt * 3);
    if (tt > 0.1 && tt < 0.52 && Math.abs(k - crest) < 0.1) v += 0.9;
    const groove = 0.1 + (tt - 0.3) * 0.3;
    if (tt > 0.3 && tt < 0.74 && Math.abs(k - groove) < 0.06) v -= 0.9;
    if (tt > 0.66) {
      for (const c of [-0.34, 0.0]) {
        if (Math.abs(k - c) < 0.07) v += 0.8;
        else if (k - c >= 0.07 && k - c < 0.15) v -= 0.7;
      }
    }
    const vk = -0.6 + Math.sin(tt * 11 + 0.6) * 0.09;
    if (tt > 0.16 && tt < 0.86) {
      if (k - vk > -0.08 && k - vk <= 0) v += 0.9;
      else if (k - vk > 0 && k - vk < 0.08) v -= 0.5;
    }
    v -= (1 - tt) * 0.6;
    return SKIN_T[Math.max(0, Math.min(6, Math.round(v)))];
  }, HIM);
  // A RUNE BURNING IN ITS SKIN, big (and another in the back of his hand: hand())
  for (const [t, k] of [[0.42, s < 0 ? 2 : 7]] as const) {
    burnOn(l, k, Math.round(a[0] + (b[0] - a[0]) * t - 4 + out * nx * 1.5), Math.round(a[1] + (b[1] - a[1]) * t - 6), 2, 1);
  }
  // the front of the roll of his sleeve, wrapping the arm at the elbow: a thick band, its lower edge catching the light
  scan(l, (x, y) => {
    const t = along(x, y);
    if (t > 0.1) return undefined;
    const d = across(x, y);
    const fold = Math.sin(d * 0.55 + 1) > 0.7;
    return t > 0.07 ? ROBE_T[6] : t > 0.03 ? (fold ? ROBE_T[3] : ROBE_T[5]) : fold ? ROBE_T[2] : ROBE_T[4];
  });
  return l;
}

/** His mantle over his shoulders, seen from under it: teal, its hem cut in shallow points, ITS EDGE MARKED WITH LIGHT and runes burning along it; `blow` as beard()'s. */
function mantle(rise: number, blow = 0): Px {
  const l = layer();
  const b = blow / 2;
  // (it lies on his shoulders, and goes up with them, hem and all)
  const R = (row: number): number => Y(row) - rise;
  const pts: Pt[] = [[X(-108), R(214)], [X(-90), R(195)], [X(-60), R(181)], [X(-34), R(174)], [X(0), R(178)], [X(34), R(174)], [X(60), R(181)], [X(90), R(195)], [X(108), R(214)]];
  /** Its hem, from his left (our right) round to his right: broad, over his arms to the elbow, cut in shallow points. */
  const HEM: ReadonlyArray<readonly [number, number]> = [[108, 217], [94, 227], [80, 218], [66, 228], [52, 219], [38, 228], [24, 219], [10, 228], [0, 222], [-10, 228], [-24, 219], [-38, 228], [-52, 219], [-66, 228], [-80, 218], [-94, 227], [-108, 217]];
  // blown by the blast from the word (beard()): its points flung up, the middle most, every other point the more, and out at the ends
  const hem: Pt[] = HEM.map(([x, row], i) => {
    const up = b * (6 + 5 * (i % 2)) * (0.7 + 0.6 * (1 - Math.abs(x) / 108));
    return [X(x * (1 + 0.05 * b * clamp01((Math.abs(x) - 50) / 58))), R(row) - up];
  });
  l.poly([...pts, ...hem], MANTLE_T[3]);
  underlit(l, MANTLE_T, FAR * 0.86, (x, y0) => {
    const y = y0 + rise;
    // its folds fall from his shoulders with the lean; it is darker up under his cowl
    return Math.sin(((x - CX) / lean(y)) / 6.5) * 0.07 + (y - Y(196)) * 0.007 - 0.05;
  });
  // ITS EDGE: a band of light along the hem, points of light in it, and runes burning just above it
  for (let i = 0; i + 1 < hem.length; i++) {
    const [ax, ay] = hem[i];
    const [bx, by] = hem[i + 1];
    const n = Math.ceil(Math.hypot(bx - ax, by - ay));
    for (let j = 0; j < n; j++) {
      const x = Math.round(ax + ((bx - ax) * j) / n);
      const y = Math.round(ay + ((by - ay) * j) / n);
      for (let d = 1; d <= 3; d++) if (l.has(x, y - d)) l.set(x, y - d, d === 1 ? MANTLE_T[7] : d === 2 ? MANTLE_T[6] : MANTLE_T[5]);
      if ((x + i) % 3 === 0 && l.has(x, y - 2)) l.set(x, y - 2, WORD[2]);
    }
  }
  for (const [dx, k] of [[-88, 3], [-66, 9], [-45, 6], [45, 1], [66, 11], [88, 2]] as const) {
    // (each a little above the hem where it is: on the band's inner side)
    const x = X(dx);
    let lowest = 0;
    for (let y = R(170); y < R(230); y++) if (l.has(Math.round(x), y)) lowest = y;
    burnOn(l, k, Math.round(x) - 3, lowest - 15, 1.5, 1);
  }
  return l;
}

/** How far each side of the beard is from the middle at row y: it is drawn lock by lock from these. */
function locks(l: Px, tones: Tones, top: number, bottom: number, half: (y: number) => number, mid: (y: number) => number, count: number, far: number, lift: number, seed: number, ragged = 0, round = 0.16): void {
  for (let y = Math.round(top); y <= Math.round(bottom); y++) {
    const h = half(y);
    if (h <= 0) continue;
    const m = mid(y);
    for (let x = Math.round(m - h); x <= Math.round(m + h); x++) {
      const u = (x + 0.5 - m) / h; // -1..1 across
      if (Math.abs(u) > 1) continue;
      // which lock this is, and where across the lock
      const f = (u + 1) * 0.5 * count + Math.sin(y * 0.13 + seed) * 0.25;
      const k = Math.floor(f);
      const w = f - k;
      // (each lock ends where it likes: some rows short of the bottom, in a point)
      if (ragged > 0) {
        const short = hash2(k, seed, 93) * ragged;
        const left = bottom - short - y;
        if (left < 0 || (left < 4 && Math.abs(w - 0.5) > 0.12 + left * 0.1)) continue;
      }
      const v = 1 - reach(x, y, LX, LY) / far + lift - Math.abs(u) ** 1.6 * round + (k % 2 ? 0.05 : -0.03) + (w < 0.16 ? -0.2 : w > 0.7 ? 0.07 : 0);
      l.set(x, y, tones[Math.max(0, Math.min(tones.length - 1, Math.floor(v * tones.length)))]);
    }
  }
}

// HE LEANS OVER US (sketch 12, which the owner asked for more of: "give me more of the 12 lean").
// His head comes down toward us and is bigger for it: it is in front of his shoulders, in the shell
// of his cowl, and his beard hangs to the table. Leaning over and looking down at us, he shows us his
// face nearly square on.

/** How much further than sketch 12 he leans: his head is that many rows lower. */
const LEAN_DROP = 0;

/**
 * His face: the left half, from the crown of his head down to his lower lip. The right half is its
 * mirror image. The crown is in his cowl (its rows are left out); under the cowl's brim his brow is in
 * shade, and a rune burns on it, in the middle (its two middle columns are the stroke). Light from
 * below: the under side of his cheeks, of his nose, of his heavy white brows and of his moustache
 * is what is bright.
 */
const FACE: readonly string[] = [
  '..................aabbbb',
  '..............aabbbbbbbb',
  '...........aabbbbbbbbbbb',
  '.........aabbbbbbbbbbbbb',
  '.......aabbbbbbbbbbbbbbb',
  '......aabbbbbbbbbbbbbbbb',
  '.....aabbbbbbbbbbbbbbbbb',
  '....aabbbbbbbbbbbbbbbbbb',
  '...aabbbbbbbbbbbbbbbbbbb',
  '...aabbbbbbbbbbbbbbbbbbb',
  '..aabbbbbbbbbbbbbbbbbbbb',
  '..aabbbbbbbbbbbbbbbbbbbb',
  '..ksssssssssssssssssgGgG',
  '..kSSSSSSSSSSSSSSSSSSgGG',
  '..kSSSSSSSSSSSSSSSSSSSgW',
  '..kSSSSSSSSSSSSSSSSSSSgW',
  '..kttttttttttttttttttsgG',
  '...333333333333333333ssg',
  '...33444444444444444443s',
  '...344222224444444444444',
  '...344444444422222224444',
  '...344444444444444445555',
  '...344444444444444455555',
  '...3oooooo44444444455555',
  '...3OOOooooooo4444455555',
  '...34OOOOOoooooooo455555',
  '...344eeOOOOOOooooo55555',
  '...34eeeeeeeeeeOOOo55556',
  '...34ekiiiIIWIIiike55556',
  '...345ekiiIIIIiike555566',
  '...3455eeeeeeeee55556667',
  '...345544444444455556667',
  '...345556666665555566677',
  '...345566666666555566677',
  '....45566667777665566677',
  '....45566677776665566677',
  '....45566666666555666777',
  '.....4556666666545566777',
  '.....4556666665445666777',
  '.....4556666654455667777',
  '......45566664344nn67777',
  '......455666433m55667766',
  '......4553mmMMMMmmmmm666',
  '.....455mMMMMMMMMMMmmmmm',
  '.....4mmMMMMNNNNNMMMMMMM',
  '....4mmMMMNNNNNNNNNMMMMM',
  '....mmMMMNNNNNNNNNNNNNNN',
  '...mmMMMNNNNNNmmmNNNNNNN',
  '...mMMMNNNNmmm...mmNNkkk',
  '..mmMMNNNmm........m5667',
  '..mMMNNmm...........6667',
  '..mMNm..............6666',
];
const FACE_KEY: Key = {
  // (the brow, in the shade of the brim; the rune burning on it)
  s: SKIN_T[0], S: SKIN_T[1], t: SKIN_T[2],
  g: WORD[3], G: CYAN[2], W: '#ffffff',
  '2': SKIN_T[1], '3': SKIN_T[2], '4': SKIN_T[3], '5': SKIN_T[4], '6': SKIN_T[5], '7': SKIN_T[6],
  e: '#161234', k: INK, n: SKIN_T[0],
  i: CYAN[2], I: SPARK[3],
  m: HAIR_T[4], M: HAIR_T[6], N: HAIR_T[8],
  o: HAIR_T[5], O: HAIR_T[8],
};
/** Half the face's width, and where its top left corner is. */
const FACE_HALF = 24;
const FACE_AT: Pt = [CX - FACE_HALF, 158 + LEAN_DROP];
/** Where his eyes are (the middle of each), and the rune on his brow: for the life. */
export const SMITH3_EYES: ReadonlyArray<Pt> = [
  [FACE_AT[0] + 12, FACE_AT[1] + 28],
  [FACE_AT[0] + 2 * FACE_HALF - 13, FACE_AT[1] + 28],
];
export const SMITH3_BROW: Pt = [CX, FACE_AT[1] + 14];
/** The row of the top of his head (the peak of his cowl): the name of the game goes over it. */
export const SMITH3_HEAD_TOP = HOOD_TOP;

/**
 * THE OPENING OF HIS COWL, round his face: is (x, y) in it? A round arch over his brow, coming down
 * his cheeks, widening a little to his beard.
 */
const OPEN_TOP = FACE_AT[1] + 9;
const OPEN_ARCH = FACE_AT[1] + 26;
const openHalf = (y: number): number => {
  if (y < OPEN_TOP) return -1;
  if (y < OPEN_ARCH) return (FACE_HALF + 2) * Math.sqrt(Math.max(0, 1 - ((OPEN_ARCH - y) / (OPEN_ARCH - OPEN_TOP)) ** 2));
  return FACE_HALF + 2 + (y - OPEN_ARCH) * 0.16;
};
const inOpening = (x: number, y: number): boolean => Math.abs(x + 0.5 - CX) <= openHalf(y);
/** The cowl's outline: how far each side of it is from the middle at row y (its dome over his head, flaring down onto his shoulders). */
const HOOD_DOME = 172;
const hoodHalf = (y: number): number => {
  if (y < HOOD_TOP + 5) return -1;
  if (y < HOOD_DOME) return 41 * Math.sqrt(Math.max(0, 1 - ((HOOD_DOME - y) / (HOOD_DOME - (HOOD_TOP + 5))) ** 2));
  return 41 + (y - HOOD_DOME) * 0.42;
};
const HOOD_FOOT = 204;

function face(): Px {
  const l = layer();
  stamp(l, FACE_AT[0], FACE_AT[1], FACE, FACE_KEY);
  stamp(l, FACE_AT[0] + FACE_HALF, FACE_AT[1], FACE, FACE_KEY, true);
  // (only what of it is in the opening of his cowl: the cowl's edge is in front of the rest)
  for (let y = FACE_AT[1]; y < FACE_AT[1] + FACE.length; y++) for (let x = FACE_AT[0]; x < FACE_AT[0] + 2 * FACE_HALF; x++) if (!inOpening(x, y)) l.d[(y * W + x) * 4 + 3] = 0;
  return l;
}

/**
 * HIS COWL: a shell of teal over his head, its peak up and back, open over his face, falling onto
 * his shoulders; the deep of it dark round his face. The light is under its brim and down the
 * inside of its edge, and the edge is MARKED WITH POINTS OF LIGHT (art/smith3.ts), and runes burn
 * along the brim over his brow.
 */
function hood(): Px {
  const l = layer();
  for (let y = HOOD_TOP; y <= HOOD_FOOT; y++) {
    const h = hoodHalf(y);
    for (let x = Math.floor(CX - h); x <= Math.ceil(CX + h); x++) if (Math.abs(x + 0.5 - CX) <= h) l.set(x, y, MANTLE_T[3]);
  }
  // its peak, standing up a little back from the crown, to his right of the middle
  l.poly([[CX - 12, HOOD_TOP + 10], [CX - 4, HOOD_TOP], [CX + 2, HOOD_TOP + 1], [CX + 10, HOOD_TOP + 10]], MANTLE_T[3]);
  // (the dark round his face: the deep of the cowl, the width of a finger beyond his face)
  const deep = (x: number, y: number): boolean => inOpening(x, y);
  underlit(l, MANTLE_T, FAR * 0.82, (x, y) => {
    // folds that run down it from the crown, and the stretch of it over his head the darker for being far from the light
    const a = Math.atan2(y - (HOOD_TOP + 22), x + 0.5 - CX);
    const fold = Math.sin(a * 9) > 0.6 ? -0.08 : 0;
    // (inside its edge, the brim's under side: lit)
    const edge = openHalf(y) > 0 ? Math.abs(x + 0.5 - CX) - openHalf(y) : y - OPEN_TOP + 99;
    const brim = edge > 0 && edge < 3 ? 0.22 : edge > 0 && edge < 5 ? 0.1 : 0;
    return 0.05 + fold + brim;
  });
  scan(l, (x, y) => (deep(x, y) ? DEEP : undefined));
  // THE POINTS OF LIGHT along its edge: every third pixel round the opening, a step out from it
  for (let y = OPEN_TOP - 1; y <= HOOD_FOOT; y++) {
    const h = openHalf(y + 1);
    if (h < 0) continue;
    for (const sd of [-1, 1]) {
      const x = Math.round(CX + sd * (h + 1.5) - 0.5);
      if (y % 3 === 0 && l.has(x, y) && !deep(x, y)) l.set(x, y, WORD[2]);
    }
  }
  for (let x = CX - 20; x <= CX + 20; x++) {
    // (along the top of the arch, over his brow)
    let y = OPEN_TOP - 1;
    while (y < OPEN_ARCH && !deep(x, y + 1)) y++;
    if (x % 3 === 0 && l.has(x, y - 1)) l.set(x, y - 1, WORD[2]);
  }
  // runes burning along the brim, over his brow, following the arch
  for (const [dx, k] of [[-21, 4], [-8, 11], [5, 0], [18, 8]] as const) {
    const x = CX + dx;
    let y = OPEN_TOP - 1;
    while (y < OPEN_ARCH + 10 && !deep(x + 2, y + 1)) y++;
    burnOn(l, k, x, y - 11, 1, 1);
  }
  return l;
}

/** The row his beard comes down to: the table's edge. He leans so far that it lies on the table. */
const BEARD_END = LIP - 8;

/**
 * HIS BEARD, lock by lock, the locks ending in points at their own heights. `blow` (0, 1 or 2): how
 * hard the blast from the word, when the top pulses its greatest, has blown it: up and out, its end
 * lifted, flared and parted in the middle (LOOSE THINGS FOLLOW, AND A BLAST BLOWS THEM BACK).
 */
function beard(blow = 0): Px {
  const l = layer();
  const b = blow / 2;
  const top = FACE_AT[1] + 44;
  const end = BEARD_END - Math.round(8 * b);
  const half = (y: number): number => {
    const t = (y - top) / (end - top);
    // it widens from his jaw, hangs full, and is drawn in a little where it comes to the table; blown, its end flares out
    const hang = t < 0.34 ? 20 + (t / 0.34) * 17 : t < 0.7 ? 37 + Math.sin(((t - 0.34) / 0.36) * Math.PI) * 1.5 : 37 - ((t - 0.7) / 0.3) ** 1.6 * 9;
    return hang + b * 17 * clamp01(t) ** 2;
  };
  locks(l, HAIR_T, top, end, half, () => CX, 13, FAR * 0.62, 0.3, 0, 7 + b * 5, 0.42);
  if (b > 0) {
    // blown: the blast comes up from the word under it, and parts it: its end arched up in the middle
    for (let x = CX - 60; x <= CX + 60; x++) {
      const h = half(end);
      const lift = b * 12 * Math.max(0, 1 - Math.abs(x + 0.5 - CX) / (h * 0.8)) ** 1.4;
      for (let y = Math.round(end - lift); y <= end; y++) l.d[(y * W + x) * 4 + 3] = 0;
    }
  }
  // under his moustache and his lip the beard is in their shade
  scan(l, (x, y) => {
    const d = y - (top + 4) - Math.abs(x - CX) * 0.22;
    if (d < 0) return HAIR_T[3];
    if (d < 3) return HAIR_T[4];
    return undefined;
  });
  return l;
}

/**
 * HIS RIGHT HAND, drawn pixel by pixel (the left is the same, turned over): gripping the table's edge,
 * its fingers curled over the arris and down its face, the nails at their ends; the back of the hand
 * rising to the wrist, the knuckles standing out along the edge; the thumb lying along the top toward
 * the middle. The map's left is the hand's inner side, the one turned to the word's light. Its row
 * HAND_ARRIS is the arris; its column HAND_MID is the middle of the wrist, under the forearm.
 */
const HAND: readonly string[] = [
  '...........................555444444433333333333333322211...............',
  '......................2223555444444443333333333333333322211.............',
  '....................2223333454444444433333333333333333322211............',
  '...................2223333444555555445544333333333333322222111..........',
  '..................222333344444555555544444444543333333333333222.........',
  '.................22333344444455556644444544445444444444333333222........',
  '................223333444444555565544446444444544444444433333222........',
  '..............222333344444455566654444454444445444444444333333222.......',
  '.............22233344444455557755544445444444445444444444333332222......',
  '............222333444444555676655544445444444445444444444333333222......',
  '...........22333344444555576665554444444444444446444444443333332222.....',
  '..........223334444445555666665554444444444444444444444443333332222.....',
  '.........2233344444555566666625544444444444444444444444443333332222.....',
  '........22333444455777666664325577776666642244444444444443333333222.....',
  '......12233344444777666666664k6666666666654255666666554223333333222.....',
  '.....112334444455776666555544k6666655554444k66666666555324566655542.....',
  '.....122344442555776666555544k6666655554444k666555544443k6666655553.....',
  '.....223344552256776666555544k6666655554444k666555544443k6655544433.....',
  '....2333335555266776666555544k6666655554444k666555544443k6655544433.....',
  '.....333355556626777776555544k7677765555444k666655554444k6655554443.....',
  '.....33555566666.776666555544k7666665555444k666655554444k6655554443.....',
  '.....355556666...665554443333k6655444433322k664444333222k5544333222.....',
  '......5566655....665554443332k6655444433322k664444333222k5544333222.....',
  '.........6.......665554443332k6655444433322k664444333222k5544333222.....',
  '.................665554443332..65544443332..664444333222k5544333222.....',
  '..................6555444333...65544443332...6544433322..5544333222.....',
  '..................6555444333...65544443332...6544433322..5544333222.....',
  '..................6555444333...65544443332...6544433322...54433322......',
  '.................662222222233k6622222222232k662222222222k5422222222.....',
  '.................665555544333k6655554444322k664554443222k5454554322.....',
  '..................6555444333...65544443332...6544433322...54455422......',
  '..................6555444333...65544443332...6544433322...54455422......',
  '..................6522222233...65544443332...6522222222....445542.......',
  '..................6545555433...65222222232...6545555422....566662.......',
  '..................6545555433...65455555432...6545555422.....cccc........',
  '..................6545555433...65455555432...6545555422.................',
  '...................64555543....66455555432....64555542..................',
  '....................666666......645555542......666666...................',
  '.....................cccc........6666666........cccc....................',
  '..................................ccccc.................................',
];
const HAND_TOP = LIP - 28;
const HAND_MID = 42;
const HAND_KEY: Key = {
  '0': SKIN_T[0],
  '1': SKIN_T[1],
  '2': SKIN_T[2],
  '3': SKIN_T[3],
  '4': SKIN_T[4],
  '5': SKIN_T[5],
  '6': SKIN_T[6],
  '7': SKIN_T[7],
  k: INK,
  c: WORD[2],
};
/** The map's row of the arris; each finger's first column and width, and the row of its end (index, middle, ring, little). */
const HAND_ARRIS = 19;
const HAND_FINGERS: ReadonlyArray<readonly [number, number, number]> = [[17, 12, 38], [30, 13, 39], [44, 12, 38], [57, 10, 34]];
/** How many rows a finger's end comes up when it is lifted off the edge to drum. */
const DRUM_LIFT = 6;
/** The hand map with finger `f` lifted off the table's edge: what of it hangs down the edge's face drawn up, shorter (memo). */
const liftedHands: (readonly string[])[] = [];
function liftedHand(f: number): readonly string[] {
  const done = liftedHands[f];
  if (done) return done;
  const [x0, w] = HAND_FINGERS[f];
  const g = HAND.map((row) => row.split(''));
  const from = HAND_ARRIS + 3;
  for (let r = from; r < g.length; r++) {
    for (let c = x0; c < x0 + w; c++) g[r][c] = r + DRUM_LIFT < g.length ? HAND[r + DRUM_LIFT][c] : '.';
  }
  // (the seams either side of it only where there is a finger either side)
  for (const c of [x0 - 1, x0 + w]) {
    for (let r = from; r < g.length; r++) if (g[r][c] === 'k' && (g[r][c - 1] === '.' || g[r][c + 1] === '.' || g[r][c - 1] === 'k' || g[r][c + 1] === 'k')) g[r][c] = '.';
  }
  const out = g.map((row) => row.join(''));
  liftedHands[f] = out;
  return out;
}
/** Where the end of finger `f` of his right hand (on our right) is, on the picture, when it is down. */
function drumTip(f: number): Pt {
  const [x0, w, tip] = HAND_FINGERS[f];
  return [handX(1) + Math.round(x0 + w / 2), HAND_TOP + tip];
}

/** The left edge of the hand map on the picture, for a side. */
const handX = (s: number): number => {
  const [fx] = fistAt(s);
  const mid = Math.round(fx + s * 2);
  return s > 0 ? mid - HAND_MID : mid + HAND_MID - (HAND[0].length - 1);
};

function hand(s: number, lifted = -1): Px {
  const l = layer();
  stamp(l, handX(s), HAND_TOP, lifted >= 0 ? liftedHand(lifted) : HAND, HAND_KEY, s < 0);
  // where the wrist meets the forearm, the forearm's own colours, so that the one runs into the other
  const fa = foreArm(s, 0);
  for (let y = HAND_TOP; y < HAND_TOP + 3; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (l.d[i + 3] > 0 && fa.d[i + 3] > 0) {
        l.d[i] = fa.d[i];
        l.d[i + 1] = fa.d[i + 1];
        l.d[i + 2] = fa.d[i + 2];
      }
    }
  }
  // A RUNE BURNING IN THE BACK OF IT, behind the knuckles
  const [fx] = fistAt(s);
  burnOn(l, s < 0 ? 5 : 8, Math.round(fx + s * 3) - 3, HAND_TOP + 3, 1.5, 1);
  return l;
}

/** Where a hand is put on the picture there is no line between it and the forearm it comes out of. */
function handBare(s: number): (x: number, y: number) => boolean {
  const fa = foreArm(s, 0);
  return (x, y) => y < HAND_TOP && fa.has(x, y);
}

/** What of him his breath moves, back to front, for a `rise` of his shoulders: the back of his mantle, his robe, his sleeves, the mantle over his shoulders, his forearms. */
function heaving(rise: number, blow = 0): Px[] {
  const parts: Px[] = [cloak(rise), robe(rise)];
  for (const s of [-1, 1]) parts.push(upperArm(s, rise));
  parts.push(mantle(rise, blow));
  for (const s of [-1, 1]) parts.push(foreArm(s, rise));
  return parts;
}

/** ... and what it does not, which is in front of all that: his cowl, his beard, his face. (FACE_PART says which is his face.) */
function head(): Px[] {
  return [hood(), beard(), face()];
}
const FACE_PART = 2;

/** Only where the parts his breath moves are, for a `rise`, and not what they look like (for knowing what he hides, however he breathes). */
function heavingShape(rise: number, into: Uint8Array): void {
  const l = layer();
  l.poly([[X(-108), LIP], [X(-62 - rise * 0.3), Y(182) - rise], [X(62 + rise * 0.3), Y(182) - rise], [X(108), LIP]], INK);
  for (const s of [-1, 1]) {
    capsule(l, shoulder(s, rise), elbow(s, rise), SLEEVE[0] * SIZE, SLEEVE[1] * SIZE, INK);
    capsule(l, elbow(s, rise), wrist(s), CUFF * SIZE, CUFF * SIZE, INK);
  }
  // (the mantle lies inside a box from its collar to the lowest point of its hem; a rune that near him is as good as hidden)
  l.rect(X(-116), Y(172) - rise, X(116) - X(-116) + 1, Y(230) - Y(172), INK);
  for (let i = 0; i < W * H; i++) if (l.d[i * 4 + 3] > 0) into[i] = 1;
}

// ---------------------------------------------------------------------------------------------
// The whole picture

export interface Smith3Scene {
  /** Every rune cut in the stones and along the table, for the life. */
  runes: Smith3Rune[];
  /** What else glows in this picture. */
  look: Smith3Look;
  /** The veins of light, if it has them: a pulse runs out along each. (A point of one that cannot be seen is [-1, -1].) */
  veins: Pt[][];
  /**
   * The lit edge of the table's top, row by row from the arris up: the stretches of each row
   * (from a column, to before a column) that his hands are not on. When the top pulses, the whole
   * of it shines.
   */
  brim: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
  /** Where the stones' faces can be seen (the light licking up them stays on them): 1 for each such pixel (y * W + x). */
  stone: Uint8Array;
  /** Whatever of him, his hands and his table stands in front of what is behind him, however he breathes: 1 for each such pixel. */
  before: Uint8Array;
}

/** What paintSmith3 gives. */
export interface Smith3Painted {
  /** The picture with his breath out, and nothing moving in it. */
  px: Px;
  /** The same with the whole top of the table alight: the life fades from the one to the other as the top pulses. */
  lit: Px;
  scene: Smith3Scene;
  /** The picture with his shoulders lifted `rise` rows by his breath (0..SMITH3_BREATH), his beard and mantle blown `blow` (0..2: smith3Blow), and the same with the top alight. */
  frame(rise: number, blow?: number): { px: Px; lit: Px };
  /** The picture with each finger of his right hand (0 the index .. 3 the little one) up off the table's edge (smith3Drum). */
  drum: Px[];
}

/** What the start screen needs of the picture behind it (ui/panels.ts lays the screen out from this). */
export interface Smith3Title {
  w: number;
  h: number;
  /** The row of the table's edge; how far above the bottom of the screen that row is put; the row of the top of his head. */
  lip: number;
  lift: number;
  headTop: number;
  /** The picture, with nothing moving in it. */
  still: HTMLCanvasElement;
  /** The life of the picture at time `t` (seconds), on a see-through sheet as big as the picture, to be drawn over it. The sheet is the same one each call. */
  life(t: number): HTMLCanvasElement;
  /**
   * His breath is painted a frame at a time, one each time `life` is called, so that the screen is
   * not kept waiting for them; until they are all painted he breathes as far as there are frames
   * for. This paints what is left of them at once (for a recording of it).
   */
  warm?(): void;
  /** THE SCREEN KICKS: how far to throw the picture at time `t`, in its own pixels (smith3Kick). */
  kick?(t: number): readonly [number, number];
  /** THE SCREEN FLASHES: the colour, and how strongly (0: not at all) to lay it over the whole picture at time `t` (smith3Flash). */
  flash?(t: number): readonly [string, number];
}

/**
 * WHAT ELSE GLOWS. The word is always the light under him. The owner was shown the lean with a
 * brazier at either hand and without (sketches 16 to 21), and with five other lights (22 to 26:
 * "and maybe some other luminescent options"); these are those, to be switched on as he chooses.
 * What glows of his is the word's colour; the braziers are an honest fire.
 */
export interface Smith3Look {
  /** A brazier burning at either hand, seen from under its bowl. */
  braziers: boolean;
  /** Every rune cut in the stones and along the table is alight, not only the one the light is passing through. */
  runes: boolean;
  /** A lantern of the word's own light hung on a chain at either hand. */
  lanterns: boolean;
  /** Runes rise off the word all round him. */
  rising: boolean;
  /** A shaft of moonlight comes down across him from high on our left. */
  moon: boolean;
  /** The light of the word runs out through the stone in veins. */
  veins: boolean;
}
export const SMITH3_PLAIN: Smith3Look = { braziers: false, runes: false, lanterns: false, rising: false, moon: false, veins: false };

/** Where the two braziers (or the two lanterns) are: the middle of the bowl's rim, and the column its post stands at on the floor. */
const HANG_FOOT = 192;
const HANG_ROW = 198;
export const SMITH3_FIRES: ReadonlyArray<Pt> = [
  [Math.round(up(CX - HANG_FOOT, HANG_ROW)), HANG_ROW],
  [Math.round(up(CX + HANG_FOOT, HANG_ROW)), HANG_ROW],
];
/** The colour of iron in the dark, back to front edge. */
const IRON_T: Tones = ['#0e0a1c', '#1c1630', '#2c2444', '#443a5e'];
const FIRE_T: Tones = ['#8a2a14', '#d0501a', '#ff8a2a', '#ffc860', '#fff3b0'];
const MOON = '#cfdcff';

/** Light catching the edge of a shape that faces (dx, dy): the warmth of a fire to one side, the cold of a lantern. */
function rim(l: Px, dx: number, dy: number, col: string, t: number, deep = 1, where?: (x: number, y: number) => number, box: Box = ALL): void {
  const c = rgba(col);
  const has = new Uint8Array(W * H);
  for (let y = box.y0; y < box.y1; y++) for (let x = box.x0, i = y * W + x; x < box.x1; x++, i++) has[i] = l.d[i * 4 + 3] > 0 ? 1 : 0;
  for (let y = box.y0; y < box.y1; y++) {
    for (let x = box.x0; x < box.x1; x++) {
      if (!has[y * W + x]) continue;
      for (let k = 1; k <= deep; k++) {
        const nx = x + dx * k;
        const ny = y + dy * k;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || !has[ny * W + nx]) {
          const a = t * (1 - (k - 1) / (deep + 1)) * (where ? clamp01(where(x, y)) : 1);
          if (a > 0) toward(l.d, (y * W + x) * 4, c, a);
          break;
        }
      }
    }
  }
}

/** A brazier seen from under its bowl: a post that leans in with everything else, the dish, the coals over its rim. (Its flames are the life's.) */
function brazier(p: Px, n: number): void {
  const [bx, by] = SMITH3_FIRES[n];
  const foot = n === 0 ? CX - HANG_FOOT : CX + HANG_FOOT;
  const s = n === 0 ? 1 : -1; // which way the middle of the picture is
  const l = layer();
  for (let y = by + 8; y < H; y++) {
    const x = Math.round(up(foot, y));
    l.set(x - 1, y, IRON_T[1]).set(x, y, IRON_T[2]).set(x + 1, y, IRON_T[1]);
    l.set(x + s, y, IRON_T[3]);
  }
  // a knot in the post, and the three arms that hold the dish
  l.rect(Math.round(up(foot, by + 26)) - 3, by + 25, 7, 3, IRON_T[2]);
  for (const dx of [-14, 0, 14]) l.line(bx + dx, by + 6, Math.round(up(foot, by + 16)), by + 16, IRON_T[2]);
  // the dish, from under: wide at the rim, drawn in below; warm where the coals heat it
  for (let y = by; y <= by + 9; y++) {
    const t = (y - by) / 9;
    const half = Math.round(22 - 15 * t ** 1.4);
    for (let x = bx - half; x <= bx + half; x++) {
      const f = (x - bx) / half;
      l.set(x, y, y === by ? IRON_T[3] : f * s > 0.55 ? IRON_T[3] : f * s < -0.6 ? IRON_T[0] : t < 0.45 ? mix(IRON_T[2], FIRE_T[0], 0.35) : IRON_T[1]);
    }
  }
  over(p, l);
  // the coals, seen over the rim
  for (let x = bx - 19; x <= bx + 19; x++) {
    const h = hash2(x, by, 51);
    p.set(x, by - 1, h < 0.35 ? FIRE_T[2] : h < 0.7 ? '#b03a18' : '#5a1c1c');
    if (Math.abs(x - bx) < 15 && h > 0.25) p.set(x, by - 2, h > 0.75 ? FIRE_T[1] : '#5a1c1c');
  }
}

/** A lantern of the word's light: a chain that leans in with everything else, an iron cage, the light in it. */
function lantern(p: Px, n: number): void {
  const [bx, by] = SMITH3_FIRES[n];
  const foot = n === 0 ? CX - HANG_FOOT : CX + HANG_FOOT;
  // the chain: links, one flat and one edge on, up out of the picture
  for (let y = 0; y < by - 16; y++) {
    const x = Math.round(up(foot, y));
    const link = Math.floor(y / 4) % 2;
    if (link === 0) p.set(x - 1, y, IRON_T[3]).set(x + 1, y, IRON_T[2]);
    else p.set(x, y, IRON_T[3]);
  }
  const l = layer();
  // the cap, the foot, and four bars between
  l.rect(bx - 3, by - 18, 7, 3, IRON_T[2]);
  l.rect(bx - 8, by - 15, 17, 3, IRON_T[2]);
  l.rect(bx - 9, by + 9, 19, 3, IRON_T[2]);
  l.rect(bx - 4, by + 12, 9, 2, IRON_T[1]);
  over(p, l);
  // the light in it: a shard of the word's own stuff
  p.poly([[bx, by - 11], [bx + 6, by - 2], [bx + 3, by + 8], [bx - 3, by + 8], [bx - 6, by - 2]], WORD[2]);
  p.poly([[bx, by - 9], [bx + 4, by - 2], [bx + 2, by + 6], [bx - 2, by + 6], [bx - 4, by - 2]], WORD[1]);
  p.poly([[bx, by - 6], [bx + 2, by - 1], [bx + 1, by + 4], [bx - 1, by + 4], [bx - 2, by - 1]], WORD[0]);
  for (const dx of [-8, -3, 3, 8]) for (let y = by - 12; y < by + 9; y++) p.set(bx + dx, y, dx === -8 || dx === 8 ? IRON_T[2] : IRON_T[1]);
}

/** The shaft of moonlight: is this pixel in it? It comes from high on our left and falls across him to the table. */
function inBeam(x: number, y: number): boolean {
  const t = y / LIP;
  return x >= 150 + t * 118 && x <= 236 + t * 190;
}

/** The veins the word's light runs out along: each a list of points, from where it starts. (For the life: a pulse runs out along each.) */
export function smith3Veins(): Pt[][] {
  const veins: Pt[][] = [];
  // down the front of the table from under the word, spreading
  for (let n = 0; n < 7; n++) {
    const pts: Pt[] = [];
    const slope = (n - 3) * 0.55;
    for (let i = 0; i < 70; i++) {
      const y = LIP + 2 + i;
      pts.push([Math.round(tableX(CX + (n - 3) * 22 + slope * i * 0.5, y) + Math.sin(i * 0.5 + n * 2) * 1.6), y]);
    }
    veins.push(pts);
  }
  // up the middle of each standing stone, from the floor
  for (const [x0, x1] of [[56, 118], [146, 188], [W - 188, W - 146], [W - 118, W - 56]] as const) {
    const pts: Pt[] = [];
    const mid = (x0 + x1) / 2;
    for (let y = H - 1; y > 6; y--) pts.push([Math.round(up(mid + (mid < CX ? 6 : -6), y) + Math.sin(y * 0.3 + x0) * 2.2), y]);
    veins.push(pts);
  }
  return veins;
}

/**
 * A STRONGER LIGHT ON HIM. When the whole top of the table is alight (the life: THE TOP PULSES) he
 * is lit by it as he is by the word, from below, only more: every tone he is painted in goes some
 * steps up its own ramp. (His hair and his beard, which are nearly white already, go one.)
 */
const LIT = new Map<number, number>();
{
  const pack = (c: string): number => {
    const v = rgba(c);
    return (v[0] << 16) | (v[1] << 8) | v[2];
  };
  const ramps: ReadonlyArray<readonly [Tones, number]> = [[SKIN_T, 2], [HAIR_T, 1], [MANTLE_T, 2], [ROBE_T, 3]];
  for (const [ramp, steps] of ramps) ramp.forEach((c, i) => LIT.set(pack(c), pack(ramp[Math.min(ramp.length - 1, i + steps)])));
}

/** Every rune of a list alight: each burns where it is cut, and the stone round it is lit by it. */
function alight(p: Px, runes: readonly CutRune[]): void {
  for (const r of runes) {
    const at = (ox: number, oy: number, c: string): void => runeAt(p, r.k, r.x + ox, r.y + oy, r.s, c, r.fat, r.skew);
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) at(ox * r.fat, oy, WORD[3]);
    if (r.great) {
      // (the great ones burn high, white at their heart)
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) at(ox, oy, WORD[2]);
      at(0, 0, WORD[1]);
      runeAt(p, r.k, r.x + 1, r.y, r.s, WORD[0], 1, r.skew);
      continue;
    }
    // (the rest burn low: it is the power going through them that makes them blaze)
    at(0, 0, WORD[2]);
  }
  for (const r of runes) if (!r.great) glow(p, r.x + 2 * r.s, r.y + 3 * r.s, 9 + r.s * 5, WORD[2], 0.24, 4);
}

/**
 * What of a rune can be seen: its strokes, the stone at their very edge and the stone a little
 * further off, each as a list of pixels. `hidden` marks what stands in front of it; `ground`, the
 * stone it is cut in (its light does not leave its stone). `mark` is a sheet to work on, left as
 * empty as it was found.
 */
function seen(r: CutRune, hidden: Uint8Array, ground: Uint8Array, mark: Px, reach: number): Smith3Rune {
  const slid = Math.ceil(Math.abs(r.skew) * 6 * r.s) + 1;
  const x0 = Math.max(0, Math.floor(r.x) - slid - reach);
  const x1 = Math.min(W - 1, Math.ceil(r.x + 4 * r.s) + r.fat + slid + reach);
  const y0 = Math.max(0, Math.floor(r.y) - reach);
  const y1 = Math.min(H - 1, Math.ceil(r.y + 6 * r.s) + reach);
  runeAt(mark, r.k, r.x, r.y, r.s, INK, r.fat, r.skew);
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  // how far each pixel of the box is from a stroke, counted in steps up, down and across
  const far = new Uint8Array(w * h).fill(255);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const o = (y * W + x) * 4 + 3;
      if (mark.d[o] === 0) continue;
      mark.d[o] = 0;
      far[(y - y0) * w + (x - x0)] = 0;
    }
  }
  for (let step = 1; step <= reach; step++) {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (far[j * w + i] !== 255) continue;
        if ((i > 0 && far[j * w + i - 1] === step - 1) || (i < w - 1 && far[j * w + i + 1] === step - 1) || (j > 0 && far[(j - 1) * w + i] === step - 1) || (j < h - 1 && far[(j + 1) * w + i] === step - 1)) far[j * w + i] = step;
      }
    }
  }
  const dots: number[] = [];
  const edge: number[] = [];
  const halo: number[] = [];
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const f = far[j * w + i];
      const at = (y0 + j) * W + x0 + i;
      if (f === 255 || hidden[at] === 1) continue;
      if (f === 0) dots.push(at);
      else if (ground[at] === 1) (f <= 2 ? edge : halo).push(at);
    }
  }
  // (where something cuts it, no pixel of its light is left alone)
  const lit = new Set<number>([...dots, ...edge, ...halo]);
  const kept = (at: number): boolean => {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && lit.has(at + dy * W + dx)) return true;
    return false;
  };
  return { ...r, dots: Int32Array.from(dots.filter(kept)), edge: Int32Array.from(edge.filter(kept)), halo: Int32Array.from(halo.filter(kept)) };
}

/** Where a layer is painted, and one pixel all round it (the ink line it is given when it is put on the picture). */
function shapeOf(l: Px, into: Uint8Array): void {
  const d = l.d;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (d[i * 4 + 3] > 0 || (x > 0 && d[i * 4 - 1] > 0) || (x < W - 1 && d[i * 4 + 7] > 0) || (y > 0 && d[(i - W) * 4 + 3] > 0) || (y < H - 1 && d[(i + W) * 4 + 3] > 0)) into[i] = 1;
    }
  }
}

export function paintSmith3(look: Smith3Look = SMITH3_PLAIN): Smith3Painted {
  const cut: CutRune[] = [];
  const arris = LIP - 8;

  // --- BEHIND HIM: the vault, and the stones of the ring ---
  const bg = layer();
  vault(bg);
  gloom(bg, LX, LY - 20, 24, 250, NIGHT, 0.96, 18);
  const stones = layer();
  // (the two that stand behind the table's ends, in the word's light; then the two near us, great and dark)
  menhir(stones, 146, 188, 44, 1, 0.25, cut, 112);
  menhir(stones, W - 188, W - 146, 60, 2, 0.25, cut, 128);
  menhir(stones, 56, 118, -40, 0, 0.8, cut, 150);
  menhir(stones, W - 118, W - 56, -60, 3, 0.8, cut, 168);
  glow(stones, LX, LY, 200, CYAN[2], 0.16);
  gloom(stones, LX, LY - 10, 60, 330, NIGHT, look.braziers || look.lanterns ? 0.8 : 0.88, 16);
  // (the light of each great rune on its own stone, and on nothing else)
  if (look.runes) for (const r of cut) if (r.great) glow(stones, r.x + 2 * r.s, r.y + 3 * r.s, 16 + r.s * 8, WORD[2], 0.42, 5);
  over(bg, stones, null);
  /** How many of the runes are the stones' (they come first in the list; the table's follow). */
  const stoneCount = cut.length;
  if (look.runes) alight(bg, cut);
  // (veins: cut in the stone as fine dark-and-cyan lines; it is the life that sends the light out along them)
  const veins = look.veins ? smith3Veins() : [];
  const cutVein = (p: Px, v: readonly Pt[]): void => {
    v.forEach(([x, y], i) => {
      if (p.d[(y * W + x) * 4 + 3] === 0) return;
      p.set(x, y, i < v.length * 0.25 ? WORD[2] : WORD[3]);
      // a twig off it here and there
      if (i % 13 === 6) for (let j = 1; j <= 3 + (i % 3); j++) if (p.has(x + (i % 2 ? j : -j), y + (v[0][1] < v[v.length - 1][1] ? j : -j))) p.set(x + (i % 2 ? j : -j), y + (v[0][1] < v[v.length - 1][1] ? j : -j), WORD[4]);
    });
  };
  /** (smith3Veins: the first seven run down the table's front; the rest climb the stones) */
  const TABLE_VEINS = 7;
  veins.slice(TABLE_VEINS).forEach((v) => cutVein(bg, v));
  // the other lights, on what is behind him
  if (look.braziers) for (const [bx, by] of SMITH3_FIRES) glow(bg, bx, by - 14, 130, FIRE_T[2], 0.4, 8);
  if (look.lanterns) for (const [bx, by] of SMITH3_FIRES) glow(bg, bx, by, 120, WORD[2], 0.42, 8);
  if (look.moon) {
    const c = rgba(MOON);
    for (let y = 0; y < arris; y++) for (let x = 0; x < W; x++) if (inBeam(x, y)) toward(bg.d, (y * W + x) * 4, c, (x + y) % 2 === 0 ? 0.24 : 0.13);
  }

  // --- HIM: the other lights catch his edges (his face and all on it keep their own light) ---
  const catchLight = (part: Px, flesh: boolean): Px => {
    for (const s of [-1, 1]) {
      const [bx, by] = SMITH3_FIRES[s < 0 ? 0 : 1];
      // (light from one side reaches the side of him that faces it, less the further it is)
      const near = (x: number, y: number): number => 1.25 - Math.hypot(x - bx, (y - by) * 0.8) / 150;
      if (look.braziers) rim(part, s, 0, FIRE_T[2], flesh ? 0.3 : 0.7, 2, near, HIM);
      if (look.lanterns) rim(part, s, 0, WORD[1], flesh ? 0.3 : 0.65, 2, near, HIM);
      if (look.runes && !flesh) rim(part, s, 0, WORD[2], 0.4, 1, undefined, HIM);
    }
    if (look.moon) {
      rim(part, -1, 0, MOON, flesh ? 0.4 : 0.8, 2, undefined, HIM);
      rim(part, 0, -1, MOON, flesh ? 0.3 : 0.6, 1, undefined, HIM);
      const c = rgba(MOON);
      for (let y = HIM.y0; y < LIP; y++) for (let x = HIM.x0; x < HIM.x1; x++) if (part.d[(y * W + x) * 4 + 3] > 0 && inBeam(x, y)) toward(part.d, (y * W + x) * 4, c, (x + y) % 2 === 0 ? 0.2 : 0.09);
    }
    return part;
  };
  // (what his breath does not move is painted once; his beard once more for each way the blast blows it)
  const fixed = head().map((part, i) => catchLight(part, i === FACE_PART));
  const blownBeards = [fixed[1], catchLight(beard(1), false), catchLight(beard(2), false)];
  const headFor = (blow: number): Px[] => fixed.map((part, i) => (i === 1 ? blownBeards[blow] : part));

  // --- IN FRONT OF HIM: the braziers or the lanterns, the table, the word behind its edge, his hands on it ---
  const fg = layer();
  if (look.braziers) for (const n of [0, 1]) brazier(fg, n);
  if (look.lanterns) for (const n of [0, 1]) lantern(fg, n);
  const front = table(cut);
  gloom(front, LX, LIP, 90, 380, NIGHT, 0.82, 12);
  if (look.runes) alight(front, cut.slice(stoneCount));
  over(fg, front);
  veins.slice(0, TABLE_VEINS).forEach((v) => cutVein(fg, v));
  word(fg);
  lip(fg);
  /** Where his hands are (and the line round them). */
  const hands = new Uint8Array(W * H);
  const dress = (h: Px, s: number): Px => {
    const [bx, by] = SMITH3_FIRES[s < 0 ? 0 : 1];
    const near = (x: number, y: number): number => 1.3 - Math.hypot(x - bx, (y - by) * 0.8) / 150;
    if (look.braziers) rim(h, s, 0, FIRE_T[2], 0.6, 2, near);
    if (look.lanterns) rim(h, s, 0, WORD[1], 0.55, 2, near);
    if (look.moon && s < 0) rim(h, -1, 0, MOON, 0.7, 2);
    return h;
  };
  /** What is in front of him without his right hand (for his fingers drumming). */
  const noRight = layer();
  for (const s of [-1, 1]) {
    if (s > 0) noRight.d.set(fg.d);
    const h = dress(hand(s), s);
    over(fg, h, INK, ALL, handBare(s));
    shapeOf(h, hands);
  }

  // --- WHAT HIDES WHAT, for the life: it draws over the picture, and must not draw a rune's light on his arm ---
  // behind him: whatever he may stand in front of, however he breathes, and whatever is in front of him
  const hidden = new Uint8Array(W * H);
  for (const part of [...fixed, ...blownBeards]) shapeOf(part, hidden);
  {
    const reach = new Uint8Array(W * H);
    for (let rise = 0; rise <= SMITH3_BREATH; rise++) heavingShape(rise, reach);
    const grown = layer();
    for (let i = 0; i < W * H; i++) if (reach[i] === 1) grown.d[i * 4 + 3] = 255;
    shapeOf(grown, hidden);
  }
  for (let i = 0; i < W * H; i++) if (fg.d[i * 4 + 3] > 0) hidden[i] = 1;
  const onStone = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (stones.d[i * 4 + 3] > 0) onStone[i] = 1;
  // along the table: only his hands are in front of it, and a rune's light stays in the band it is cut in
  const inBand = new Uint8Array(W * H);
  for (let y = BAND_TOP - 2; y < BAND_TOP + BAND_H + 2; y++) for (let x = 0; x < W; x++) if (front.d[(y * W + x) * 4 + 3] > 0) inBand[y * W + x] = 1;
  const mark = layer();
  // (the light of one in a stone spreads as far as it is big; of one along the table, over the whole height of its band, fillets and all)
  const runes = cut.map((r, i) => (i < stoneCount ? seen(r, hidden, onStone, mark, 3 + Math.round(r.s)) : seen(r, hands, inBand, mark, 6)));
  const seenVeins = veins.map((v, n) => v.map(([x, y]): Pt => ((n < TABLE_VEINS ? hands[y * W + x] === 1 || fg.d[(y * W + x) * 4 + 3] === 0 : hidden[y * W + x] === 1) ? [-1, -1] : [x, y])));
  // the lit edge of the table's top: what of each of its rows his hands are not on
  const xa = Math.round(tableX(TABLE_L, LIP)) - 8;
  const xb = Math.round(tableX(TABLE_R, LIP)) + 8;
  const brim: [number, number][][] = [];
  for (let row = 0; row < 4; row++) {
    const runs: [number, number][] = [];
    for (let x = xa, from = -1; x <= xb + 1; x++) {
      const free = x <= xb && hands[(arris - row) * W + x] === 0;
      if (free && from < 0) from = x;
      if (!free && from >= 0) {
        runs.push([from, x]);
        from = -1;
      }
    }
    brim.push(runs);
  }

  // --- the light that stands up from the word: motes in it, thick near the word and thinning as they climb ---
  for (let n = 0; n < 150; n++) {
    const u = hash2(n, 1, 91) ** 1.7; // how far up the fan it is
    const y = Math.round(LY - 6 - u * 96);
    const half = 9 + u * 44;
    const x = Math.round(LX + (hash2(n, 2, 91) - 0.5) * 2 * half);
    if (y >= LIP - 9) continue;
    // (they keep off his face: it is his eyes that are to be looked at there)
    if (y < FACE_AT[1] + 50 && Math.abs(x - CX) < FACE_HALF + 2) continue;
    fg.set(x, y, u < 0.22 ? WORD[1] : u < 0.55 ? WORD[2] : WORD[3]);
    if (u < 0.12 && hash2(n, 3, 91) < 0.5) fg.set(x + 1, y, WORD[2]);
  }

  /** Toward its top, its sides and its foot the picture sinks into the dark, in bands, so that a screen bigger than it shows no edge. */
  const night = rgba(NIGHT);
  const sink = (p: Px, box: Box = ALL): Px => {
    for (let y = box.y0; y < box.y1; y++) {
      for (let x = box.x0, i = (y * W + x) * 4; x < box.x1; x++, i += 4) {
        const t = Math.max((64 - y) / 64, (40 - x) / 40, (x - (W - 41)) / 40, (y - 316) / (H - 1 - 316));
        if (t > 0) toward(p.d, i, night, band(t, 8) / 8);
      }
    }
    return p;
  };

  /**
   * THE TOP ALIGHT (the owner, 20:26: "the whole top pulses and illuminates the smith's face").
   * The glare of the whole edge of the table's top, in bands that fall away from it; and him lit
   * by it from below, as he is by the word, only more (LIT). His hands are between us and the
   * light: there is no glare on them, and it is their tops that catch it.
   */
  const white = rgba(WORD[0]);
  const pale = rgba(WORD[1]);
  const cyan = rgba(WORD[2]);
  /** The glare along the whole edge: how near the edge, toward what, how much. */
  const glare: ReadonlyArray<readonly [number, readonly number[], number]> = [[3, white, 0.6], [6, pale, 0.4], [10, pale, 0.2], [15, cyan, 0.1]];
  /** ... and the light of the word itself, swollen: rings about the middle of the edge, wider than they are high, on what is behind him. */
  const swollen: ReadonlyArray<readonly [number, readonly number[], number]> = [[34, pale, 0.3], [58, pale, 0.2], [86, cyan, 0.14], [118, cyan, 0.08]];
  const topAlight = (p: Px, him: Uint8Array): Px => {
    const d = p.d;
    for (let y = 0; y < arris; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const o = i * 4;
        const his = him[i] === 1 || hands[i] === 1;
        if (his) {
          const to = LIT.get((d[o] << 16) | (d[o + 1] << 8) | d[o + 2]);
          if (to !== undefined) {
            d[o] = to >> 16;
            d[o + 1] = (to >> 8) & 255;
            d[o + 2] = to & 255;
          }
        }
        if (hands[i] === 1) continue;
        const far = Math.hypot(Math.max(xa - x, 0, x - xb), arris - y);
        const ring = glare.find((g) => far < g[0]);
        if (ring) toward(d, o, ring[1], ring[2]);
        if (his) continue;
        const round = Math.hypot((x + 0.5 - CX) * 0.5, arris - y);
        const swell = swollen.find((g) => round < g[0]);
        if (swell) toward(d, o, swell[1], swell[2]);
      }
    }
    return p;
  };

  const frame = (rise: number, blow = 0): { px: Px; lit: Px } => {
    const parts = [...heaving(rise, blow).map((part) => catchLight(part, false)), ...headFor(blow)];
    const p = layer();
    p.d.set(bg.d);
    const him = new Uint8Array(W * H);
    for (const part of parts) for (let y = HIM.y0; y < HIM.y1; y++) for (let x = HIM.x0, i = y * W + x; x < HIM.x1; x++, i++) if (part.d[i * 4 + 3] > 0) him[i] = 1;
    // his shadow, thrown up the vault behind him; then him
    thrown(p, him, LX, LY + 40, 1.42, NIGHT, look.braziers || look.lanterns ? 0.45 : 0.62, LIP);
    for (const part of parts) over(p, part, INK, HIM);
    // what is in front of him
    for (let i = 0; i < W * H * 4; i += 4) {
      if (fg.d[i + 3] === 0) continue;
      p.d[i] = fg.d[i];
      p.d[i + 1] = fg.d[i + 1];
      p.d[i + 2] = fg.d[i + 2];
    }
    const lit = layer();
    lit.d.set(p.d);
    return { px: sink(p), lit: sink(topAlight(lit, him)) };
  };

  const first = frame(0);
  // HIS FINGERS DRUMMING: the picture with each finger of his right hand up off the edge. Below the
  // arris all that is in front of him is the table, so only there is anything to paint again.
  const drum = HAND_FINGERS.map((_, f) => {
    const v = layer();
    v.d.set(noRight.d);
    over(v, dress(hand(1, f), 1), INK, ALL, handBare(1));
    const box: Box = { x0: handX(1) - 2, y0: arris, x1: Math.min(W, handX(1) + HAND[0].length + 2), y1: Math.min(H, HAND_TOP + HAND.length + 2) };
    sink(v, box);
    const p = layer();
    p.d.set(first.px.d);
    for (let y = box.y0; y < box.y1; y++) {
      for (let x = box.x0; x < box.x1; x++) {
        const i = (y * W + x) * 4;
        if (v.d[i + 3] === 0) continue;
        p.d[i] = v.d[i];
        p.d[i + 1] = v.d[i + 1];
        p.d[i + 2] = v.d[i + 2];
      }
    }
    return p;
  });
  const stoneSeen = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) stoneSeen[i] = onStone[i] === 1 && hidden[i] === 0 ? 1 : 0;
  return { px: first.px, lit: first.lit, scene: { runes, look, veins: seenVeins, brim, stone: stoneSeen, before: hidden }, frame, drum };
}

// ---------------------------------------------------------------------------------------------
// The life of the picture: everything that moves, drawn over it each frame. Nothing is carried
// from one frame to the next: every dot is worked out from the time alone, and most of it moves
// in steps of about a tenth of a second, like drawn animation (title_smith.ts, title.ts).

/** Draws one dot of the life: the pixel (x, y) of the picture, or a block `w` wide and `h` high from there, in one colour, as strongly as `a` says (1 = solid). */
export type Smith3Dot = (x: number, y: number, color: string, a: number, w?: number, h?: number) => void;

const frac = (v: number): number => v - Math.floor(v);
/** 0 at the ends of 0..1 and 1 in the middle, eased. */
const swell = (u: number): number => Math.sin(clamp01(u) * Math.PI) ** 2;

/** One tongue of flame, as dots: a teardrop standing on `base`, its tip leaning. */
function tongue(put: Smith3Dot, cx: number, base: number, h: number, w: number, leanTo: number): void {
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, w * Math.sin(Math.PI * (0.25 + t * 0.75)) ** 0.8 * (1 - t * 0.3));
    const m = cx + leanTo * t * t;
    for (let x = Math.floor(m - hw); x < Math.ceil(m + hw); x++) {
      const d = Math.abs(x + 0.5 - m) / hw;
      if (d > 1) continue;
      put(x, base - i, d < 0.45 && t < 0.45 ? FIRE_T[4] : d < 0.75 && t < 0.72 ? FIRE_T[3] : t < 0.9 ? FIRE_T[2] : FIRE_T[1], 1);
    }
  }
}

/** One tongue of the word's light, as dots: a flame of it standing on `base`, white at its foot, its tip leaning. Only where `keep` says (on its stone), and no pixel of it left alone where that cuts it. */
function lick(put: Smith3Dot, keep: (x: number, y: number) => boolean, cx: number, base: number, h: number, w: number, leanTo: number, a: number): void {
  const px: { x: number; y: number; c: string; a: number }[] = [];
  const has = new Set<number>();
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, w * Math.sin(Math.PI * (0.25 + t * 0.75)) ** 0.8 * (1 - t * 0.3));
    const m = cx + leanTo * t * t;
    const y = Math.round(base - i);
    for (let x = Math.floor(m - hw); x < Math.ceil(m + hw); x++) {
      const d = Math.abs(x + 0.5 - m) / hw;
      if (d > 1 || !keep(x, y)) continue;
      px.push({ x, y, c: d < 0.45 && t < 0.35 ? WORD[0] : d < 0.75 && t < 0.65 ? WORD[1] : t < 0.88 ? WORD[2] : WORD[3], a: a * (1 - t * 0.5) });
      has.add(y * W + x);
    }
  }
  for (const p of px) {
    let n = 0;
    for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && has.has((p.y + dy) * W + p.x + dx)) n++;
    if (n) put(p.x, p.y, p.c, p.a);
  }
}
/** How many letters of light swirl round him. */
export const SMITH3_LETTERS = 14;

/**
 * Where letter `k` of light is at time t, going round him (its middle, on the picture); whether it
 * is on the near side of him; and how far out they are flung (0..). AS HE GATHERS THE POWER they are
 * drawn in close round him and whipped round faster and faster; AS THE TOP PULSES ITS GREATEST
 * (where the two runs meet in the middle) they are flung far out, still spinning, and come back in
 * over a second and a half (letterSpread, whipAngle). They move every frame, thirty a second.
 */
export function smith3Letter(k: number, t: number): { x: number; y: number; front: boolean; burst: number } {
  const spread = letterSpread(t);
  const yc = 140 + hash2(k, 1, 311) * 92;
  const rx = (112 + hash2(k, 2, 311) * 70) * (1 + spread);
  const ry = (12 + hash2(k, 3, 311) * 9) * (1 + spread * 0.6);
  const ang = hash2(k, 5, 311) * Math.PI * 2 + t * (0.42 + hash2(k, 4, 311) * 0.28) + whipAngle(t) * (0.8 + hash2(k, 6, 311) * 0.4);
  return {
    x: Math.round(CX + rx * Math.cos(ang)),
    y: Math.round(yc + ry * Math.sin(ang) + Math.sin(t * 1.3 + k) * 3),
    front: Math.sin(ang) > 0,
    burst: Math.max(0, spread),
  };
}

/** The strokes of a rune, as dots (one that is not cut in the stone: the runes that rise). */
function runeDots(put: Smith3Dot, r: CutRune, ox: number, oy: number, c: string, a: number): void {
  for (const [p0, q0, p1, q1] of RUNES[((r.k % RUNES.length) + RUNES.length) % RUNES.length]) {
    const x0 = r.x + p0 * r.s + (6 - q0) * r.s * r.skew;
    const x1 = r.x + p1 * r.s + (6 - q1) * r.s * r.skew;
    const y0 = r.y + q0 * r.s;
    const y1 = r.y + q1 * r.s;
    const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
    for (let i = 0; i <= n; i++) put(Math.round(x0 + ((x1 - x0) * i) / Math.max(1, n)) + ox, Math.round(y0 + ((y1 - y0) * i) / Math.max(1, n)) + oy, c, a, r.fat, 1);
  }
}

// THE POWER (the owner, 5 Oct 2026, 20:26: "get the runes to light up in succession so it looks
// like power is running up and down and along the table. Have them run left to right, right to
// left, then meet in the middle and back out to the end of the table. The walls just go up and
// down. And the whole top pulses and illuminates the smith's face"; and at 20:29, "we want to see
// him breathing with shoulders kinda raising up every breath").
//
// It goes round in four runs of SMITH3_BEAT seconds each:
//   1  along the table from our left to our right     up the stones      he breathes in
//   2  back from our right to our left                down them          he breathes out
//   3  in from both ends, to meet in the middle       up                 in
//   4  from the middle back out to both ends          down               out
// A run is on its way for RUN seconds of its beat. As it arrives the whole top of the table pulses
// (THE TOP PULSES); when the two meet in the middle, at the top of his breath, it pulses its
// brightest and his face is lit by it.

/** How long each of the four runs has, start to start, and the whole round, in seconds. */
export const SMITH3_BEAT = 2;
export const SMITH3_CYCLE = 4 * SMITH3_BEAT;
/** How long of its beat a run is on its way: it arrives this long after it sets out. */
export const SMITH3_RUN = 1.6;

/** A time in the round, as the time from `at` in it: the nearest way round, before (-) or after (+). */
function since(t: number, at: number): number {
  const d = (((t - at) % SMITH3_CYCLE) + SMITH3_CYCLE) % SMITH3_CYCLE;
  return d > SMITH3_CYCLE / 2 ? d - SMITH3_CYCLE : d;
}

/** How brightly the power burns in a rune it passed `dt` seconds ago: white as it passes, dying away behind it in steps. */
function wake(dt: number): number {
  return dt < 0 ? 0 : dt < 0.1 ? 1 : dt < 0.2 ? 0.72 : dt < 0.32 ? 0.48 : dt < 0.48 ? 0.28 : dt < 0.7 ? 0.14 : 0;
}

/** How far along its run (Smith3Rune.at) a rune is from where run number `run` (0..3) of the round sets out: of the table's, or of a stone's. */
function runOrder(table: boolean, at: number, run: number): number {
  if (!table) return run % 2 === 0 ? at : 1 - at;
  return run === 0 ? at : run === 1 ? 1 - at : run === 2 ? 1 - Math.abs(2 * at - 1) : Math.abs(2 * at - 1);
}

/** How brightly the power burns, at time t, in a rune `at` along its run: of the table's (`table`), or of a stone's. 0..1. */
export function smith3Power(table: boolean, at: number, t: number): number {
  let best = 0;
  for (let run = 0; run < 4; run++) best = Math.max(best, wake(since(t, run * SMITH3_BEAT + runOrder(table, at, run) * SMITH3_RUN)));
  return best;
}

/**
 * THE TOP PULSES. How brightly the whole top of the table is alight at time t, 0..1: it comes up
 * as each run arrives and dies away after it, and the one where the two meet in the middle is the
 * great one.
 */
export function smith3Pulse(t: number): number {
  let best = 0;
  for (let run = 0; run < 4; run++) {
    const dt = since(t, run * SMITH3_BEAT + SMITH3_RUN);
    const v = dt < -0.1 ? 0 : dt < 0 ? 1 + dt / 0.1 : dt < 0.14 ? 1 : dt < 0.74 ? (1 - (dt - 0.14) / 0.6) ** 1.6 : 0;
    best = Math.max(best, v * (run === 2 ? 1 : 0.45));
  }
  return best;
}

/** How far his breath has lifted his shoulders at time t: 0..SMITH3_BREATH, in whole rows. He is at the top of a breath as runs 1 and 3 arrive, and has let it out as 2 and 4 do. */
export function smith3Breath(t: number): number {
  return Math.round((0.5 + 0.5 * Math.cos(((t - SMITH3_RUN) / (2 * SMITH3_BEAT)) * Math.PI * 2)) * SMITH3_BREATH);
}

// THE GREAT MOMENT, and every animation check (the owner, 11 Oct 2026, 19:46: "Can you reimagine the
// title screen art to reflect the new wordsmith design"; of the first one, "I'd like it to pass all
// the checks we have for animations.  And to just be drawn better.  The arms are too thin and the
// hands look weird"; his rulebook, Animations 1: "as big and wild and kinetic and weighty as
// possible"). Where the two runs meet in the middle, at the top of his breath:
//   WIND-UP   for SMITH3_GATHER seconds before, he gathers it: the letters are drawn in close round
//             him and whipped round faster and faster, motes of light are pulled in to the word from
//             all round, the column of light draws in thin and bright, his eyes burn up;
//   BURST     the top pulses its greatest; the screen kicks (smith3Kick); a ring of light bursts out
//             from the word over the vault; sparks spray up off it and fall; the letters are flung
//             far out, smearing; the blast blows his beard and his mantle up and out (smith3Blow);
//   FOLLOW-THROUGH  the letters spin on and come back in, the beard and mantle drop back and settle,
//             the sparks fall and go out, and grit shaken loose by the blow falls from the vault.

/** When in the round the top pulses its greatest (the burst). */
export const SMITH3_GREAT = 2 * SMITH3_BEAT + SMITH3_RUN;
/** How long before the burst he gathers it. */
export const SMITH3_GATHER = 1.2;

/** How far into the gathering at time t: 0, and up to 1 at the burst (slow, then faster). */
export function smith3Gather(t: number): number {
  const dc = since(t, SMITH3_GREAT);
  return dc < -SMITH3_GATHER || dc >= 0 ? 0 : ((dc + SMITH3_GATHER) / SMITH3_GATHER) ** 2;
}

/** How hard the blast has blown his beard and mantle at time t: 0, 1 or 2 (which of their frames): a gust that flutters, and they drop back. */
export function smith3Blow(t: number): number {
  const dc = since(t, SMITH3_GREAT);
  if (dc < 0) return 0;
  return dc < 0.1 ? 2 : dc < 0.17 ? 1 : dc < 0.3 ? 2 : dc < 0.56 ? 1 : 0;
}

/** THE SCREEN KICKS as the burst comes: how far the picture is thrown at time t, in game pixels: it slams down and rings out in a third of a second. */
export function smith3Kick(t: number): readonly [number, number] {
  const dc = since(t, SMITH3_GREAT);
  if (dc < 0 || dc > 0.42) return [0, 0];
  const e = Math.exp(-dc / 0.1);
  return [Math.round(2.4 * e * Math.sin(dc * Math.PI * 2 * 6.5)), Math.round(6 * e * Math.cos(dc * Math.PI * 2 * 8))];
}

/** THE SCREEN FLASHES as the burst comes, four frames: how strongly, at time t (0..1), in the word's cyan (WORD[2]) over the whole picture. */
export const SMITH3_FLASH = WORD[2];
export function smith3Flash(t: number): number {
  const dc = since(t, SMITH3_GREAT);
  return dc >= 0 && dc < 0.13 ? 0.32 * (1 - Math.floor(dc * 30) / 4) : 0;
}

/** How far out from their way round the letters are at time t: drawn in as he gathers, flung out at the burst, and back in (a little past, then home). */
function letterSpread(t: number): number {
  const dc = since(t, SMITH3_GREAT);
  if (dc < 0) return -0.34 * smith3Gather(t);
  if (dc < 0.2) return -0.34 + (1 - (1 - dc / 0.2) ** 2);
  if (dc < 1.76) {
    const u = (dc - 0.2) / 1.56;
    return 0.66 * (1 - u) ** 2 - 0.07 * Math.sin(Math.PI * u);
  }
  return 0;
}

/** How much faster than their own way the letters go round, `dc` from the burst: whipped up as he gathers, dying away after (radians a second). */
function letterWhip(dc: number): number {
  if (dc < -SMITH3_GATHER) return 0;
  if (dc < 0) return 2.6 * ((dc + SMITH3_GATHER) / SMITH3_GATHER) ** 2;
  return 2.6 * Math.exp(-dc / 0.45);
}
/** The angle the whip has added up to each point of a round (a table), and over a whole round. */
const WHIP_STEPS = 960;
const WHIP: Float64Array = (() => {
  const out = new Float64Array(WHIP_STEPS + 1);
  const dt = SMITH3_CYCLE / WHIP_STEPS;
  for (let i = 1; i <= WHIP_STEPS; i++) out[i] = out[i - 1] + letterWhip(since((i - 0.5) * dt, SMITH3_GREAT)) * dt;
  return out;
})();
/** The angle the whip has added by time t: it adds up round after round, so nothing jumps where one round ends and the next begins. */
function whipAngle(t: number): number {
  const n = Math.floor(t / SMITH3_CYCLE);
  const f = ((t - n * SMITH3_CYCLE) / SMITH3_CYCLE) * WHIP_STEPS;
  const i = Math.max(0, Math.min(WHIP_STEPS - 1, Math.floor(f)));
  return n * WHIP[WHIP_STEPS] + WHIP[i] + (WHIP[i + 1] - WHIP[i]) * (f - i);
}

/**
 * HIS HABITS, WHEN THE POWER IS QUIET (Movement 6, "Alive when still"): he glances aside and back,
 * twice a round (how far his eyes are turned, in pixels: - to our left); and the fingers of his
 * right hand (on our right) drum on the table's edge, the little finger first: which finger is up
 * off it at time t (0 the index .. 3 the little one, -1 none), and which has just come down.
 */
export function smith3Glance(t: number): number {
  const c = (((t % SMITH3_CYCLE) + SMITH3_CYCLE) % SMITH3_CYCLE);
  const turn = (from: number, hold: number, to: number): number => (c < from || c >= hold + 0.2 ? 0 : c < from + 0.2 ? (c - from) / 0.2 : c < hold ? 1 : 1 - (c - hold) / 0.2) * to;
  return Math.round(turn(0.5, 1.35, -3) + turn(6.55, 7.2, 3));
}
/** When each finger of the drum comes down, in the round: the little finger first. */
export const SMITH3_DRUM: readonly number[] = [2.92, 2.79, 2.66, 2.53];
/** How long a finger is up before it comes down. */
const DRUM_UP = 0.1;
export function smith3Drum(t: number): { up: number; down: number } {
  const c = (((t % SMITH3_CYCLE) + SMITH3_CYCLE) % SMITH3_CYCLE);
  let up = -1;
  let down = -1;
  SMITH3_DRUM.forEach((at, f) => {
    if (c >= at - DRUM_UP && c < at) up = f;
    if (c >= at && c < at + 0.1) down = f;
  });
  return { up, down };
}

export function smith3Life(t: number, scene: Smith3Scene, put: Smith3Dot): void {
  const [wx, wy] = SMITH3_WORD;
  const arris = LIP - 8;
  const pulse = smith3Pulse(t);
  /** Seconds from the burst (- before it); how far he has gathered it. */
  const dc = since(t, SMITH3_GREAT);
  const gather = smith3Gather(t);
  /** (what keeps off his face) */
  const onFace = (x: number, y: number): boolean => Math.abs(x - CX) < FACE_HALF + 3 && y > FACE_AT[1] - 3 && y < FACE_AT[1] + 52;
  /** A fleck of light: two pixels, along the way it is going. */
  const fleck = (x: number, y: number, dx: number, dy: number, c: string, a: number): void => {
    if (Math.abs(dx) > Math.abs(dy)) put(dx > 0 ? x - 1 : x, y, c, a, 2, 1);
    else put(x, dy > 0 ? y - 1 : y, c, a, 1, 2);
  };

  // --- the runes cut in the stones and along the table: the power runs through them (THE POWER) ---
  for (const r of scene.runes) {
    // (where the stones go up into the dark, so does the power)
    const a = smith3Power(r.table === true, r.at, t) * (r.table ? 1 : clamp01(1.15 - (r.at - 1) * 4));
    if (a < 0.05) continue;
    for (let i = 0; i < r.halo.length; i++) put(r.halo[i] % W, Math.floor(r.halo[i] / W), WORD[2], a * 0.42);
    for (let i = 0; i < r.edge.length; i++) put(r.edge[i] % W, Math.floor(r.edge[i] / W), WORD[1], a * 0.72);
    for (let i = 0; i < r.dots.length; i++) put(r.dots[i] % W, Math.floor(r.dots[i] / W), WORD[0], Math.min(1, a * 1.3));
  }

  // --- THE GREAT RUNES OF THE STONES (art/ring3.ts): they burn always, blaze as the power passes and when the top pulses, and THE LIGHT LICKS UP THE STONE above each ---
  const onStone = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && scene.stone[y * W + x] === 1;
  scene.runes.forEach((r, n) => {
    if (!r.great) return;
    const a = Math.min(1, Math.max(smith3Power(false, r.at, t), 0.62 + 0.25 * Math.sin(t * 2.2 + n * 1.7)) + pulse * 0.7);
    for (let i = 0; i < r.halo.length; i++) put(r.halo[i] % W, Math.floor(r.halo[i] / W), WORD[2], a * 0.5);
    for (let i = 0; i < r.edge.length; i++) put(r.edge[i] % W, Math.floor(r.edge[i] / W), WORD[1], a * 0.8);
    for (let i = 0; i < r.dots.length; i++) put(r.dots[i] % W, Math.floor(r.dots[i] / W), WORD[0], a);
    // (its top, where the light leaves it: the stone leans, and the light climbs with it)
    const cx = r.x + 2 * r.s + 6 * r.s * r.skew;
    const f = Math.floor(t * 15 + n * 3);
    for (let k = 0; k < 3; k++) {
      const h1 = hash2(f, k, 301 + n);
      const h2 = hash2(f, k, 303 + n);
      const tall = (12 + h2 * 16) * (0.6 + 0.6 * a) * (k === 1 ? 1.45 : 1);
      lick(put, onStone, cx + (k - 1) * r.s * 1.7 + (h1 - 0.5) * 3, r.y - 2, tall, k === 1 ? 3.6 : 2.6, r.skew * tall * 1.6 + (h1 - 0.5) * 4, 0.55 + 0.4 * a);
    }
  });

  // --- THE LETTERS OF LIGHT swirling round him inside the ring (art/ring3.ts): at every height, going round; those behind him hidden by him; they keep off his face; AS THE TOP PULSES ITS GREATEST THEY BURST OUTWARD ---
  {
    for (let k = 0; k < SMITH3_LETTERS; k++) {
      const { x, y, front, burst } = smith3Letter(k, t);
      const a = Math.min(1, (front ? 0.95 : 0.55) * (0.75 + 0.25 * Math.sin(t * 3 + k)) * (1 + burst * 0.3 + gather * 0.5));
      const r: CutRune = { x: x - 3, y: y - 4, k: k * 5 + 3, s: front ? 1.5 : 1, fat: 1, skew: 0, near: 1, at: 0 };
      // (what of it can be seen is gathered first: where he cuts it, no pixel of it is left alone)
      const dots: { x: number; y: number; c: string; a: number }[] = [];
      const at = new Set<number>();
      const seen: Smith3Dot = (px, py, c, aa, w = 1, h = 1) => {
        for (let yy = py; yy < py + h; yy++) {
          for (let xx = px; xx < px + w; xx++) {
            if (xx < 0 || yy < 0 || xx >= W || yy >= LIP - 9) continue;
            if (front ? Math.abs(xx - CX) < FACE_HALF + 4 && yy > FACE_AT[1] - 2 && yy < FACE_AT[1] + 54 : scene.before[yy * W + xx] === 1) continue;
            dots.push({ x: xx, y: yy, c, a: aa });
            at.add(yy * W + xx);
          }
        }
      };
      // (going fast, whipped round or flung out, each leaves a smear of itself along its way from where it was the frame before)
      const was = smith3Letter(k, t - 1 / 30);
      const far = Math.hypot(x - was.x, y - was.y);
      const smears = Math.min(6, Math.floor(far / 6));
      for (let i = 1; i <= smears; i++) {
        const f = i / (smears + 1);
        runeDots(seen, { ...r, x: Math.round(x + (was.x - x) * f) - 3, y: Math.round(y + (was.y - y) * f) - 4 }, 0, 0, WORD[2], a * (0.6 - f * 0.4));
      }
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) runeDots(seen, r, ox, oy, WORD[3], a * 0.35);
      runeDots(seen, r, 0, 0, front ? WORD[0] : WORD[1], a);
      for (const p of dots) {
        let n = 0;
        for (let dy = -1; dy <= 1 && !n; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && at.has((p.y + dy) * W + p.x + dx)) n++;
        if (n) put(p.x, p.y, p.c, p.a);
      }
    }
  }

  // --- THE COLUMN OF LIGHT standing up off his slab, from the word (art/ring3.ts), runes climbing in it; it fades before his face ---
  {
    const top = FACE_AT[1] + 54;
    const flare = dc >= 0 && dc < 0.5 ? 1 - dc / 0.5 : 0;
    for (let y = wy - 9; y > top; y--) {
      const u = (wy - 9 - y) / (wy - 9 - top);
      const half = (6 + u * 4) * (1 - 0.45 * gather + 1.4 * flare);
      // (in flat steps of light, rippling up it: no soft fade)
      const raw = (0.14 + pulse * 0.22 + gather * 0.2) * (1 - u) ** 1.1 * (0.8 + 0.2 * Math.sin(t * 5 - y * 0.3));
      const a = Math.round(raw / 0.07) * 0.07;
      if (a <= 0) continue;
      put(Math.round(wx - half), y, WORD[2], a * 0.6, Math.round(half * 2) + 1, 1);
      put(wx - 2, y, WORD[1], a, 5, 1);
    }
    for (let k = 0; k < 3; k++) {
      const age = t / 2.4 + k / 3;
      const u = frac(age);
      const y = Math.round(wy - 16 - u * (wy - 22 - top));
      const r: CutRune = { x: wx - 3, y: y - 4, k: Math.floor(age) * 7 + k * 4, s: 1.5, fat: 1, skew: 0, near: 1, at: 0 };
      runeDots(put, r, 0, 0, u < 0.45 ? WORD[0] : WORD[1], swell(u) * 0.95);
    }
  }

  // --- the table's lit edge: the light along it swells with the word's breath; and when the top pulses the whole of it shines, and thickens ---
  const breath = 0.5 + 0.5 * Math.sin(t * 2.1);
  {
    const bar = (row: number, half: number, c: string, a: number): void => {
      if (a <= 0.02) return;
      for (const [x0, x1] of scene.brim[row]) {
        const from = Math.max(x0, wx - half);
        const to = Math.min(x1, wx + half);
        if (to - from >= 2) put(from, arris - row, c, a, to - from, 1);
      }
    };
    const whole = Math.round(pulse ** 0.5 * 200);
    bar(0, Math.round(34 + breath * 26) + whole, WORD[0], 0.5 + pulse * 0.5);
    bar(1, Math.round((34 + breath * 26) * 0.6) + whole, WORD[1], 0.35 + breath * 0.3 + pulse * 0.35);
    bar(2, whole, WORD[1], pulse * 0.9);
    bar(3, whole, WORD[2], (pulse - 0.3) * 1.1);
  }

  // --- the word: it breathes, and it flares with the top ---
  {
    const above = (fn: (x: number, y: number) => void) => (x: number, y: number): void => {
      if (y < arris) fn(x, y);
    };
    word3Strokes(above((x, y) => put(x, y, WORD[3], 0.18 + breath * 0.3 + pulse * 0.5)), 5);
    word3Strokes(above((x, y) => put(x, y, WORD[4], 1)), 3);
    word3Strokes(above((x, y) => put(x, y, pulse > 0.3 ? WORD[2] : WORD[3], 1)), 2);
    word3Strokes(above((x, y) => put(x, y, pulse > 0.3 ? WORD[1] : WORD[2], 1)), 1);
    word3Strokes(above((x, y) => put(x, y, WORD[0], 1)), 0);
  }

  // --- sparks: they leave the word, rise through his beard's light, and go out ---
  for (let k = 0; k < 20; k++) {
    const period = 2.2 + hash2(k, 1, 77) * 2.4;
    const age = t / period + hash2(k, 2, 77);
    const turn = Math.floor(age);
    const u = age - turn;
    const x0 = wx + (hash2(turn, k, 79) - 0.5) * 30;
    const high = 60 + hash2(turn, k, 81) * 80;
    const x = Math.round(x0 + (x0 - wx) * u * 2.2 + Math.sin(u * 5 + k) * 4);
    const y = Math.round(wy - 4 - u ** 0.8 * high);
    // (they keep off his face)
    if (onFace(x, y)) continue;
    const a = (1 - u) ** 1.4 * (1 - gather);
    if (a < 0.05) continue;
    put(x, y, u < 0.18 ? WORD[0] : u < 0.5 ? WORD[1] : WORD[2], a, 1, 2);
    if (u < 0.35) put(x, y + 2, WORD[2], a * 0.5, 1, 1);
  }

  // --- his eyes: they do not blink. They burn, a little brighter and lower by turns, and when the top pulses so do they ---
  {
    const a = Math.min(1, 0.3 + 0.25 * Math.sin(t * 2.6) + pulse * 0.45 + gather * 0.4);
    const look = smith3Glance(t);
    const wide = dc >= 0 && dc < 0.3 ? 2 : gather > 0.5 ? 1 : 0;
    for (const [ex, ey] of SMITH3_EYES) {
      put(ex - 1 + look - wide, ey, WORD[0], Math.min(1, 0.55 + pulse * 0.45 + gather * 0.45), 3 + wide * 2, 2);
      put(ex - 5 + Math.sign(look), ey, WORD[1], a, 11, 2);
      put(ex - 7, ey + 1, WORD[2], a * 0.5, 15, 1);
      if (wide === 2) put(ex - 9, ey - 1, WORD[2], 0.5, 19, 1);
    }
  }

  // --- the rune on his brow: it throbs, and blazes when the top pulses ---
  {
    const [bx, by] = SMITH3_BROW;
    const a = 0.2 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.9)) + pulse * 0.6;
    put(bx - 1, by - 2, WORD[0], a, 2, 5);
    for (const [dx, dy] of [[-3, -2], [2, -2], [-2, -1], [1, -1]] as const) put(bx + dx, by + dy, WORD[1], a * 0.8);
  }

  const { look } = scene;

  // --- the braziers: three tongues of flame each, and a spark now and then ---
  if (look.braziers) {
    SMITH3_FIRES.forEach(([fx, fy], n) => {
      const f = Math.floor(t * 8 + n * 3);
      for (let k = 0; k < 3; k++) {
        const h1 = hash2(f, k, 71 + n);
        const h2 = hash2(f, k, 73 + n);
        tongue(put, fx + (k - 1) * 10 + Math.round((h1 - 0.5) * 3), fy - 2, Math.round((k === 1 ? 30 : 16) + h2 * 10), k === 1 ? 8.5 : 5, (h1 - 0.5) * 10);
      }
      for (let k = 0; k < 4; k++) {
        const u = frac(t * 0.45 + k / 4 + n * 0.41);
        if (u > 0.7) continue;
        put(Math.round(fx + (hash2(Math.floor(t * 0.45 + k / 4 + n * 0.41), k, 75) - 0.5) * 26 + Math.sin(u * 9 + k) * 3), Math.round(fy - 30 - u * 70), u < 0.3 ? FIRE_T[4] : FIRE_T[3], 1 - u / 0.7);
      }
    });
  }

  // --- the lanterns: the shard in each swells and sinks, never both together ---
  if (look.lanterns) {
    SMITH3_FIRES.forEach(([bx, by], n) => {
      const a = 0.5 + 0.5 * Math.sin(t * 1.7 + n * 2.1);
      put(bx - 1, by - 5, WORD[0], 0.4 + a * 0.6, 3, 9);
      put(bx - 3, by - 2, WORD[0], a * 0.7, 7, 4);
      put(bx - 12, by - 14, WORD[2], 0.06 + a * 0.1, 25, 26);
    });
  }

  // --- runes rising: they leave the word a mote of light, swing out past his beard and his hair, and open into runes as they climb ---
  if (look.rising) {
    const voices = 9;
    for (let k = 0; k < voices; k++) {
      const age = t / 5.6 + k / voices;
      const turn = Math.floor(age);
      const u = age - turn;
      const side = (k + turn) % 2 ? -1 : 1;
      const x = wx + side * (14 + u * 150 + Math.sin(u * 6 + k * 2) * 6);
      const y = wy - 6 - u ** 1.1 * 150;
      const a = (1 - u) ** 1.2;
      const kind = turn * voices + k * 5;
      if (u < 0.2) put(Math.round(x), Math.round(y), WORD[0], 1, 2, 2);
      else {
        const r: CutRune = { x: Math.round(x) - 4, y: Math.round(y) - 7, k: kind, s: 2, fat: 2, skew: 0, near: 1, at: 0 };
        for (const [ox, oy] of [[-2, 0], [2, 0], [0, -1], [0, 1]] as const) runeDots(put, r, ox, oy, WORD[3], a * 0.35);
        runeDots(put, r, 0, 0, u < 0.4 ? WORD[0] : u < 0.7 ? WORD[1] : WORD[2], a);
      }
    }
  }

  // --- the moon: motes drift down the shaft of its light ---
  if (look.moon) {
    for (let k = 0; k < 30; k++) {
      const age = t / (11 + hash2(k, 5, 95) * 8) + hash2(k, 6, 95);
      const turn = Math.floor(age);
      const u = age - turn;
      const y = Math.round(hash2(turn, k, 97) * (LIP - 30) + u * 14);
      const tt = y / LIP;
      const x = Math.round(150 + tt * 118 + hash2(turn, k, 99) * (86 + tt * 72) + Math.sin(u * 5 + k) * 4);
      put(x, y, '#f0f4ff', swell(u) * 0.75);
    }
  }

  // --- the veins: a pulse of the word's light runs out along each, one after another ---
  scene.veins.forEach((v, n) => {
    const u = frac(t * 0.32 - n * 0.13);
    const head = Math.floor(u * (v.length + 30));
    for (let i = Math.max(0, head - 22); i <= Math.min(v.length - 1, head); i++) {
      const [x, y] = v[i];
      if (x < 0) continue;
      const k = (i - (head - 22)) / 22; // 0 at its tail, 1 at its head
      put(x, y, k > 0.8 ? WORD[0] : k > 0.45 ? WORD[1] : WORD[2], 0.25 + k * 0.75);
      if (k > 0.6) put(x - 1, y, WORD[2], 0.35, 3, 1);
    }
  });

  // --- motes adrift in the dark, high up ---
  for (let k = 0; k < 14; k++) {
    const age = t / (9 + hash2(k, 3, 83) * 6) + hash2(k, 4, 83);
    const turn = Math.floor(age);
    const u = age - turn;
    const x = Math.round(wx + (hash2(turn, k, 85) - 0.5) * 420 + Math.sin(u * 4 + k) * 9);
    const y = Math.round(LIP - 60 - hash2(turn, k, 87) * 190 - u * 16);
    if (Math.abs(x - CX) < FACE_HALF + 16 && y > FACE_AT[1] - 4 && y < FACE_AT[1] + 60) continue;
    put(x, y, WORD[1], swell(u) * 0.4, 2, 1);
  }

  // --- AS HE GATHERS IT: motes of light pulled in to the word from all round him, faster and faster, each a streak ---
  if (gather > 0) {
    for (let k = 0; k < 36; k++) {
      const start = -SMITH3_GATHER + hash2(k, 1, 401) * 0.55;
      if (dc < start) continue;
      const at = (d: number): Pt => {
        const u = clamp01((d - start) / -start);
        const left = 1 - u * u;
        const ang = hash2(k, 2, 401) * Math.PI * 2 + u * 1.5 * (k % 2 ? 1 : -1);
        const R = 70 + hash2(k, 3, 401) * 120;
        return [wx + Math.cos(ang) * R * left, wy - 10 + Math.sin(ang) * R * 0.55 * left];
      };
      const [x, y] = at(dc);
      const [px, py] = at(dc - 1 / 30);
      const xi = Math.round(x);
      const yi = Math.round(y);
      if (yi >= arris || onFace(xi, yi)) continue;
      const u = clamp01((dc - start) / -start);
      fleck(xi, yi, x - px, y - py, u > 0.6 ? WORD[0] : WORD[1], 0.45 + 0.55 * u);
      if (u > 0.5) put(xi, yi, WORD[0], u, 2, 2);
      // (a streak back to where it was the frame before)
      const n = Math.max(1, Math.min(5, Math.round(Math.hypot(x - px, y - py) / 2.5)));
      for (let i = 1; i <= n; i++) fleck(Math.round(x + ((px - x) * i) / n), Math.round(y + ((py - y) * i) / n), x - px, y - py, WORD[2], (0.45 + 0.55 * u) * 0.4);
    }
  }

  // --- THE BURST: (the whole screen flashes, smith3Flash) and two rings of light burst out from the word over the vault, behind him, crackling ---
  for (const [late, strong] of [[0, 1], [0.09, 0.55]] as const) {
    const d = dc - late;
    if (d < 0 || d >= 0.62) continue;
    const u = d / 0.62;
    const rx = 40 + 400 * (1 - (1 - u) ** 2.4);
    const a = (1 - u) ** 1.2 * strong;
    for (const [k, c, f, size] of [[1, WORD[0], 1, 3], [0.94, WORD[1], 0.7, 2], [0.86, WORD[2], 0.45, 2]] as const) {
      const n = Math.ceil(rx * k * 1.3);
      for (let i = 0; i < n; i++) {
        if (hash2(i, Math.floor(rx / 9), 405 + size + late * 100) < 0.2) continue;
        const ang = (i / n) * Math.PI * 2;
        const x = Math.round(wx + Math.cos(ang) * rx * k);
        const y = Math.round(wy - 12 + Math.sin(ang) * rx * k * 0.5);
        if (x < 0 || x >= W - size || y < 0 || y >= arris - size || scene.before[y * W + x] === 1 || scene.before[(y + size - 1) * W + x + size - 1] === 1) continue;
        put(x, y, c, a * f, size, size);
      }
    }
  }

  // --- THE BURST: sparks spray up off the word, every way, and fall back (behind the table's edge, if they get so far) ---
  if (dc >= 0 && dc < 1.3) {
    for (let k = 0; k < 64; k++) {
      const life = 0.55 + hash2(k, 1, 409) * 0.7;
      if (dc > life) continue;
      const ang = hash2(k, 2, 409) * Math.PI * 2;
      const v = 180 + hash2(k, 3, 409) * 260;
      const vx = Math.cos(ang) * v;
      const vy = -Math.abs(Math.sin(ang)) * v * 0.85 - 60;
      const at = (d: number): Pt => [wx + vx * d, wy - 8 + vy * d + 210 * d * d];
      const [x, y] = at(dc);
      const xi = Math.round(x);
      const yi = Math.round(y);
      if (yi >= arris || onFace(xi, yi)) continue;
      const a = (1 - dc / life) ** 1.1;
      const c = dc < 0.15 ? WORD[0] : dc < 0.45 ? WORD[1] : WORD[2];
      // a streak back along its way, to where it was the frame before
      const [px, py] = at(Math.max(0, dc - 1 / 30));
      const n = Math.max(1, Math.min(6, Math.round(Math.hypot(x - px, y - py) / 2.5)));
      for (let i = n; i >= 1; i--) {
        const qx = Math.round(px + ((x - px) * (i - 1)) / n);
        const qy = Math.round(py + ((y - py) * (i - 1)) / n);
        if (qy < arris && !onFace(qx, qy)) fleck(qx, qy, x - px, y - py, WORD[2], a * 0.4);
      }
      fleck(xi, yi, x - px, y - py, c, a);
      // (the first of their flight, white-hot heads)
      if (dc < 0.3) put(xi, yi, WORD[0], a, 2, 2);
    }
  }

  // --- the blow shakes grit loose from the vault: it falls behind him (WEIGHT) ---
  if (dc > 0.05 && dc < 2.4) {
    for (let k = 0; k < 16; k++) {
      const d = dc - (0.05 + hash2(k, 1, 413) * 0.5);
      if (d < 0) continue;
      const x = Math.round(30 + hash2(k, 2, 413) * 580 + Math.sin(d * 3 + k) * 2);
      const y = Math.round(6 + hash2(k, 3, 413) * 70 + 10 * d + 115 * d * d);
      if (y >= arris - 1 || x < 0 || x >= W || scene.before[y * W + x] === 1 || scene.before[(y + 1) * W + x] === 1) continue;
      put(x, y, GRIT, 0.8, 1, 2);
    }
  }

  // --- HIS FINGERS DRUM on the table's edge (smith3Drum): as each comes down, a fleck of light flies off its end ---
  {
    const { down } = smith3Drum(t);
    if (down >= 0) {
      const [tx, ty] = drumTip(down);
      const d = (((t % SMITH3_CYCLE) + SMITH3_CYCLE) % SMITH3_CYCLE) - SMITH3_DRUM[down];
      const a = 1 - d / 0.1;
      put(tx - 3 - Math.round(d * 40), ty, WORD[1], a, 2, 1);
      put(tx + 2 + Math.round(d * 40), ty, WORD[1], a, 2, 1);
    }
  }
}

/** What of one picture is not as it is in another: each such pixel (y * W + x), and its colour in the first. */
interface Change {
  at: Int32Array;
  rgb: Uint8ClampedArray;
}
function changeFrom(a: Uint8ClampedArray, b: Uint8ClampedArray): Change {
  let n = 0;
  for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++;
  const at = new Int32Array(n);
  const rgb = new Uint8ClampedArray(n * 3);
  for (let i = 0, j = 0; i < a.length; i += 4) {
    if (a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2]) continue;
    at[j] = i >> 2;
    rgb[j * 3] = a[i];
    rgb[j * 3 + 1] = a[i + 1];
    rgb[j * 3 + 2] = a[i + 2];
    j++;
  }
  return { at, rgb };
}

/** The look the owner chose for the old skald (5 Oct 2026, 20:26: "I like 22"): every rune alight; and the new ring's runes all burn. */
export const SMITH3_CHOSEN: Partial<Smith3Look> = { runes: true };

/** The picture as the start screen shows it (every rune alight, unless another look is asked for). */
export function makeSmith3Title(look: Partial<Smith3Look> = SMITH3_CHOSEN): Smith3Title {
  const painted = paintSmith3({ ...SMITH3_PLAIN, ...look });
  const { scene } = painted;
  const still = painted.px.d;
  /** A frame of his breath (and of the blast, if it blows): what of it is not as the still picture is; and, of it with the top alight, what is not as the frame itself is. Kept as rise + blow * (SMITH3_BREATH + 1). */
  const frames: ({ moved: Change; alight: Change } | undefined)[] = [];
  const keyOf = (rise: number, blow: number): number => rise + blow * (SMITH3_BREATH + 1);
  const paintFrame = (rise: number, blow: number): void => {
    const f = rise === 0 && blow === 0 ? painted : painted.frame(rise, blow);
    frames[keyOf(rise, blow)] = { moved: changeFrom(f.px.d, still), alight: changeFrom(f.lit.d, f.px.d) };
  };
  paintFrame(0, 0);
  /** The frames still to paint, in the order they are wanted: his breath, then the blast's (only as high as his breath is while it blows). */
  const todo: [number, number][] = [];
  for (let rise = 1; rise <= SMITH3_BREATH; rise++) todo.push([rise, 0]);
  const blown = new Set<number>();
  for (let t = SMITH3_GREAT; t < SMITH3_GREAT + 1; t += 1 / 60) if (smith3Blow(t) > 0) blown.add(smith3Breath(t));
  for (let blow = 1; blow <= 2; blow++) for (const rise of [...blown].sort((a, b) => b - a)) todo.push([rise, blow]);
  const warm = (): void => {
    for (const [rise, blow] of todo.splice(0)) paintFrame(rise, blow);
  };
  /** His fingers drumming: what of the picture changes with each finger up. */
  const drum = painted.drum.map((p) => changeFrom(p.d, still));
  let sheet: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let img: ImageData | null = null;
  let seenTick = -1;
  const lay = (c: Change, d: Uint8ClampedArray): void => {
    for (let j = 0; j < c.at.length; j++) {
      const o = c.at[j] * 4;
      d[o] = c.rgb[j * 3];
      d[o + 1] = c.rgb[j * 3 + 1];
      d[o + 2] = c.rgb[j * 3 + 2];
      d[o + 3] = 255;
    }
  };
  const life = (t: number): HTMLCanvasElement => {
    if (!sheet) {
      sheet = document.createElement('canvas');
      sheet.width = W;
      sheet.height = H;
      ctx = sheet.getContext('2d') as CanvasRenderingContext2D;
      img = ctx.createImageData(W, H);
    }
    // (his breath and the blast are painted a frame each time the picture is asked for, until there are all of them)
    const next = todo.shift();
    if (next) paintFrame(next[0], next[1]);
    // (thirty times a second is as often as anything in it changes)
    const tick = Math.floor(t * 30);
    if ((tick === seenTick && !next) || !ctx || !img) return sheet;
    seenTick = tick;
    const time = tick / 30;
    const d = img.data;
    d.fill(0);
    // --- his breath, and the blast blowing his beard and mantle: what of him is not where the still picture has it ---
    let rise = smith3Breath(time);
    let blow = smith3Blow(time);
    while (blow > 0 && !frames[keyOf(rise, blow)]) blow--;
    while (!frames[keyOf(rise, blow)]) rise--;
    const { moved, alight } = frames[keyOf(rise, blow)] as { moved: Change; alight: Change };
    lay(moved, d);
    // --- the top pulses: the picture goes toward the one with the whole top alight, and comes back ---
    const pulse = smith3Pulse(time);
    if (pulse > 0.02) {
      const k = pulse > 1 ? 1 : pulse;
      for (let j = 0; j < alight.at.length; j++) {
        const o = alight.at[j] * 4;
        if (d[o + 3] === 0) {
          d[o] = alight.rgb[j * 3];
          d[o + 1] = alight.rgb[j * 3 + 1];
          d[o + 2] = alight.rgb[j * 3 + 2];
          d[o + 3] = k * 255;
        } else {
          d[o] += (alight.rgb[j * 3] - d[o]) * k;
          d[o + 1] += (alight.rgb[j * 3 + 1] - d[o + 1]) * k;
          d[o + 2] += (alight.rgb[j * 3 + 2] - d[o + 2]) * k;
        }
      }
    }
    // --- his fingers drumming ---
    const { up } = smith3Drum(time);
    if (up >= 0) lay(drum[up], d);
    // --- and everything small that moves ---
    let lastColor = '';
    let v: readonly number[] = [0, 0, 0, 0];
    smith3Life(time, scene, (x, y, color, a, w = 1, h = 1) => {
      if (a <= 0) return;
      if (color !== lastColor) {
        lastColor = color;
        v = rgba(color);
      }
      const k = a > 1 ? 1 : a;
      for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) {
        for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) {
          const o = (yy * W + xx) * 4;
          // (solid, or on nothing: it is simply set)
          if (k === 1 || d[o + 3] === 0) {
            d[o] = v[0];
            d[o + 1] = v[1];
            d[o + 2] = v[2];
            d[o + 3] = k * 255;
            continue;
          }
          const under = (d[o + 3] / 255) * (1 - k);
          const all = k + under;
          d[o] = (v[0] * k + d[o] * under) / all;
          d[o + 1] = (v[1] * k + d[o + 1] * under) / all;
          d[o + 2] = (v[2] * k + d[o + 2] * under) / all;
          d[o + 3] = all * 255;
        }
      }
    });
    ctx.putImageData(img, 0, 0);
    return sheet;
  };
  return { w: W, h: H, lip: LIP, lift: SMITH3_LIFT, headTop: SMITH3_HEAD_TOP, still: painted.px.toCanvas(), life, warm, kick: smith3Kick, flash: (t) => [SMITH3_FLASH, smith3Flash(t)] };
}
