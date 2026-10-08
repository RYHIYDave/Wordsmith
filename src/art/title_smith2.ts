// The picture behind the start screen: THE OLD SKALD SEEN FROM THE FLOOR.
//
// The owner asked (5 Oct 2026, 18:09) for "just the wordsmith in the starting screen. At his forge
// table, same angle from below looking up. Same sort of living style. And I'd like it to be the
// full screen with the menus along the bottom". A first painting (title_smith.ts: a bust behind a
// strip of table, in four moments) he was "still not sold" on. Of the rough sketches that
// followed (dev/sketch_smith.ts) he said of number 6: "6 is fantastic". THIS IS NUMBER 6, PAINTED
// PROPERLY:
//
//   We are on the floor in front of his table, looking steeply up. The front of the table rises
//   over us; his fists are on its edge over our heads; above them his chest, the white beard
//   hanging down toward us, and far up, small, his face looking down, his eyes alight. The
//   standing stones of his ring lean in over us, and the vault is dark above them. The word he
//   is making stands on the table behind the edge: it is the only light, and it is under
//   everything.
//
// EVERYTHING UPRIGHT LEANS IN. There is one rule of perspective in the picture: whatever stands
// upright is drawn leaning toward a point far above the top of the picture (`up`). The stones, the
// joints of the table, his stave: all of them. That is what says "from the floor".
//
// THE WHOLE SCREEN, ON EVERY SCREEN (as title_smith.ts): painted once at SMITH_W x SMITH_H, bigger
// than any screen the game is laid out on; the screen shows the part that fits: its middle column
// is the screen's, and the row SMITH_LIP (the table's edge) is SMITH_LIFT above the bottom of the
// screen, where the menu is. Toward its edges and its top the picture sinks into the dark.
//
// One light: the word. Big surfaces are shaded by how far they are from it, in flat bands; the
// under side of everything is what is bright. What glows of his is cyan.

import { Px, mix, rgba } from '../engine/px';
import { hash2 } from '../engine/rng';
import { VAULT } from './ground';
import { CYAN, INK, SPARK } from './kit';
import type { Ramp } from './kit';

/** The picture's size, in game pixels. */
export const SMITH2_W = 640;
export const SMITH2_H = 360;
const W = SMITH2_W;
const H = SMITH2_H;
/** Everything is arranged about this column. */
const CX = 320;
/** The row of the table's edge: the under side of its lip, where his fists are. */
export const SMITH2_LIP = 280;
const LIP = SMITH2_LIP;
/** How far above the bottom of the screen that row is put: the front of the table shows over the menu's buttons. */
export const SMITH2_LIFT = 74;

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
export const SMITH2_WORD: Pt = [LX, LY];

// ---------------------------------------------------------------------------------------------
// Colours

/** The dark the picture sinks into. */
const NIGHT = '#05040f';
/** The vault overhead: the vault's own stone (ground.ts). */
const WALL = VAULT.lit;
/** A standing stone: paler and bluer than the vault, so that it stands off it. */
const MENHIR: Ramp = ['#191a44', '#262a62', '#3a4088', '#5660ac', '#7e8ad0'];
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

/** Put a part on the picture with an ink line round it, so that overlapping parts stay separate. `line` null: no line. */
function over(dst: Px, part: Px, line: string | null = INK, box: Box = ALL): void {
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
      } else if (ink && ((x > 0 && a[i - 1] > 0) || (x < W - 1 && a[i + 7] > 0) || (y > 0 && a[i + 3 - row] > 0) || (y < H - 1 && a[i + 3 + row] > 0))) {
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
export interface Smith2Rune {
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
type CutRune = Omit<Smith2Rune, 'dots' | 'edge' | 'halo'>;

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

/** The row above which the picture sinks into the dark: a stone's runes are counted from the floor up to here (Smith2Rune.at). */
const STONE_DARK = 64;

/**
 * One standing stone. It stands on the floor from column x0 to x1 and rises to row `top`, leaning
 * in with everything else; its head is cut on a slant. `near`: 0..1, how near us it stands (the
 * nearer ones are darker: they are between us and the light). The runes cut in it go on `runes`.
 */
function menhir(p: Px, x0: number, x1: number, top: number, seed: number, near: number, runes: CutRune[]): void {
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
  let y = top + 30;
  for (let n = 0; y < H - 20; n++) {
    const s = Math.max(1, Math.round(lean(y) * (x1 - x0) * 0.064 * 2) / 2);
    const k = (seed * 3 + n * 5) % RUNES.length;
    const skew = (up(mid, y) - up(mid, y + 6 * s)) / (6 * s);
    const x = Math.round(up(mid, y + 6 * s) - 2 * s);
    const fat = s >= 2 ? 2 : 1;
    if (y > 0) {
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
export function word2Strokes(put: (x: number, y: number) => void, grow: number): void {
  const [wx, wy] = SMITH2_WORD;
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
  for (const [grow, c] of [[3, WORD[4]], [2, WORD[3]], [1, WORD[2]]] as const) word2Strokes((x, y) => (y < LIP - 8 ? p.set(x, y, c) : p), grow);
  word2Strokes((x, y) => (y < LIP - 8 ? p.set(x, y, WORD[0]) : p), 0);
}

// ---------------------------------------------------------------------------------------------
// THE OLD SKALD (number 12 of the wordsmiths he was shown: "12 for sure"), from under his table.
//
// He is foreshortened: what is low on him is near us and big (his fists, his forearms, the hang
// of his beard), and his head is far up and small. The light is under all of it, so the under
// side of everything is what is bright: the hem of the pelt, the tip of the beard, the under side
// of his nose and of his brow.

const SKIN_T: Tones = ['#2a2056', '#40336f', '#5a4a8a', '#7868a6', '#9a8cc6', '#b8ace4', '#d8d0f8', '#dff6fc'];
const HAIR_T: Tones = ['#2c2460', '#3e3478', '#554a92', '#7468ae', '#9a8ecc', '#bcb2e6', '#dcd4f8', '#f0e8ff', '#e9fdff'];
const PELT_T: Tones = ['#24142f', '#371f45', '#4d2d5a', '#683f70', '#825a84', '#a0728e', '#be89a2'];
const CLOAK_T: Tones = ['#06202f', '#0a3044', '#0c4258', '#105a70', '#157a8c', '#28a0a8', '#3cc4c0'];
const MAIL_T: Tones = ['#161436', '#1b1840', '#201d4a', '#262255', '#2c2860', '#332f6c', '#3a3678', '#423e84', '#4a4690', '#57539c', '#6460a8', '#716db4'];
const HIDE_T: Tones = ['#1f0e27', '#301637', '#44204a', '#592c54', '#6e3a5c', '#8b4d6b', '#a8607a'];
const STEEL_T: Tones = ['#1e1a48', '#2e2a66', '#46408a', '#625cac', '#8a84d0', '#b4aeee', '#d6d0ff', '#f2f8ff'];

/** How big he is: 1 is sketch 6. His measures are taken from the table's edge, so he grows up and outward from it. */
const SIZE = 1;
const X = (dx: number): number => CX + dx * SIZE;
const Y = (row: number): number => LIP - (LIP - row) * SIZE;
/** How far the light reaches up him. */
const FAR = 205 * SIZE;
/** The part of the picture he is in, all of him above the table, however he breathes (his hands are not of it: they are painted with the table). */
const HIM: Box = { x0: Math.floor(X(-128)), y0: Math.floor(Y(150)), x1: Math.ceil(X(128)) + 1, y1: LIP + 2 };

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

/**
 * HE BREATHES (the owner, 5 Oct 2026, 20:29: "we want to see him breathing with shoulders kinda
 * raising up every breath"). Everything of him that hangs from his shoulders is painted for a
 * `rise`: how many rows his breath has lifted them, 0 (breathed out) to SMITH2_BREATH (breathed
 * in). His fists stay where they are on the table and his head stays where it is, looking down at
 * us: it is his shoulders that come up behind it, and his elbows a little with them. What is
 * painted ON a part that rises (the links of his mail, the fur of the pelt) rises with it.
 */
export const SMITH2_BREATH = 4;

function cloak(rise: number): Px {
  const l = layer();
  l.poly([[X(-108), LIP], [X(-62 - rise * 0.3), Y(182) - rise], [X(62 + rise * 0.3), Y(182) - rise], [X(108), LIP]], CLOAK_T[3]);
  // (its folds hang with the lean of everything)
  underlit(l, CLOAK_T, FAR, (x, y) => -0.3 + (Math.floor(((x - CX) / lean(y)) / 9) % 2 ? 0.08 : 0));
  return l;
}

function chest(rise: number): Px {
  const l = layer();
  const top = Y(186) - rise;
  l.poly([[X(-76), LIP], [X(-52 - rise * 0.25), top], [X(52 + rise * 0.25), top], [X(76), LIP]], MAIL_T[4]);
  // mail: rows of links, every other row set off by half a link (it is drawn up with his chest: all of the rise at his collar, none at the table)
  underlit(l, MAIL_T, FAR * 0.8, (x, y) => -0.16 + mail(x, y + Math.round(rise * clamp01((LIP - y) / (LIP - Y(186))))) - ((x - CX) / (76 * SIZE)) ** 2 * 0.3);
  return l;
}

/** Where his arms are: shoulder, elbow, wrist; for the side s (-1: his right, our left). */
const shoulder = (s: number, rise = 0): Pt => [X(s * (54 + rise * 0.35)), Y(196) - rise];
const elbow = (s: number, rise = 0): Pt => [X(s * (101 + rise * 0.5)), Y(229) - rise * 0.45];
const wrist = (s: number): Pt => [X(s * 93), LIP - 16 * SIZE];
/** The middle of each fist, on the table's edge. */
const fistAt = (s: number): Pt => [X(s * 92), LIP - 5];

/** How much a pixel of the limb from a to b is turned to the light: -1 (its far side) to 1 (the side the light is on). */
function turned(a: Pt, b: Pt, r: number, x: number, y: number): number {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  const d = ((x + 0.5 - a[0]) * nx + (y + 0.5 - a[1]) * ny) / r;
  const side = (LX - a[0]) * nx + (LY - a[1]) * ny >= 0 ? 1 : -1;
  return Math.max(-1, Math.min(1, d * side));
}

/** The links of his mail: rows of them, every other row set off by half a link. */
const mail = (x: number, y: number): number => {
  const row = Math.floor(y / 3);
  const link = (x + (row % 2) * 2) % 4;
  return y % 3 === 0 ? -0.07 : link < 2 ? 0.05 : 0;
};

function upperArm(s: number, rise: number): Px {
  const l = layer();
  const a = shoulder(s, rise);
  const b = elbow(s, rise);
  capsule(l, a, b, 12 * SIZE, 14.5 * SIZE, MAIL_T[4]);
  const drawn = Math.round(rise * 0.75);
  underlit(l, MAIL_T, FAR * 0.9, (x, y) => -0.3 + mail(x, y + drawn) + turned(a, b, 13 * SIZE, x, y) * 0.16);
  return l;
}

function foreArm(s: number, rise: number): Px {
  const l = layer();
  const a = elbow(s, rise);
  const b = wrist(s);
  capsule(l, a, b, 14.5 * SIZE, 17.5 * SIZE, HIDE_T[3]);
  // a bracer of hide: two straps across it, a stud on each
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  underlit(l, HIDE_T, FAR * 0.9, (x, y) => {
    const t = ((x - a[0]) * ux + (y - a[1]) * uy) / len;
    const strap = Math.abs(t - 0.3) < 0.07 || Math.abs(t - 0.78) < 0.07;
    const edge = Math.abs(Math.abs(t - 0.3) - 0.07) < 0.025 || Math.abs(Math.abs(t - 0.78) - 0.07) < 0.025;
    return -0.2 + (edge ? -0.2 : strap ? 0.16 : 0) + (hash2(x >> 1, y >> 1, 71) - 0.5) * 0.06 + turned(a, b, 16 * SIZE, x, y) * 0.3;
  });
  for (const t of [0.3, 0.78]) {
    const sx = Math.round(a[0] + ux * len * t + uy * 4 * s);
    const sy = Math.round(a[1] + uy * len * t - ux * 4 * s);
    l.set(sx, sy, STEEL_T[6]).set(sx + 1, sy, STEEL_T[5]).set(sx, sy + 1, STEEL_T[4]).set(sx + 1, sy + 1, STEEL_T[3]);
  }
  return l;
}

/** The pelt across his shoulders, seen from under it: its hem hangs in tufts, and the tufts are what the light finds. */
function pelt(rise: number): Px {
  const l = layer();
  // (it lies on his shoulders, and goes up with them, hem and all)
  const R = (row: number): number => Y(row) - rise;
  const pts: Pt[] = [[X(-68), R(207)], [X(-62), R(189)], [X(-34), R(174)], [X(0), R(178)], [X(34), R(174)], [X(62), R(189)], [X(68), R(207)]];
  // the hem, right to left: tufts of uneven depth
  for (let i = 0, x = 62; x >= -62; i++) {
    const w = 6 + Math.floor(hash2(i, 3, 81) * 5);
    const d = 5 + Math.floor(hash2(i, 5, 83) * 8);
    const base = 209 + Math.abs(x) * 0.02 + (Math.abs(x) < 30 ? 6 : 0);
    pts.push([X(x), R(base + d)], [X(x - w * 0.6), R(base - 1)]);
    x -= w;
  }
  l.poly(pts, PELT_T[3]);
  underlit(l, PELT_T, FAR * 0.86, (x, y0) => {
    // fur: short strokes that lie down and outward from the middle of his chest
    const y = y0 + rise;
    const lie = Math.floor((y * 2 + Math.abs(x - CX)) / 5);
    return (hash2(x >> 1, lie, 85) - 0.5) * 0.3 + ((y + (x >> 1)) % 4 === 0 ? -0.08 : 0) + (y - Y(196)) * 0.006;
  });
  return l;
}

/** How far each side of the hair or the beard is from the middle at row y: they are drawn lock by lock from these. */
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
// His head comes down toward us and is bigger for it: it is in front of his shoulders now, his
// hair hangs straight down past it, and his beard hangs to the table. Leaning over and looking
// down at us, he shows us his face nearly square on.

/** How much further than sketch 12 he leans: his head is that many rows lower. */
const LEAN_DROP = 0;

/**
 * His face: the left half, from the crown of his head down to his lower lip. The right half is
 * its mirror image. (Drawn first as a picture, in the scratchpad's face/face3.py, where a face
 * can be looked at while it is drawn.) Light from below: his brow is the dark of his face, and
 * the under side of his cheeks, of his nose and of his moustache the bright.
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
  '..kssssssssssssssssssssg',
  '..kSSSSSSSSSSSSSSSSSSsgG',
  '..kSSSSSSSSSSSSSSSSSSsGW',
  '..kSSSSSSSSSSSSSSSSSSsGG',
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
  a: HAIR_T[1], b: HAIR_T[2],
  s: STEEL_T[1], S: STEEL_T[2], t: STEEL_T[4],
  g: CYAN[2], G: SPARK[3], W: '#ffffff',
  '2': SKIN_T[1], '3': SKIN_T[2], '4': SKIN_T[3], '5': SKIN_T[4], '6': SKIN_T[5], '7': SKIN_T[6],
  e: '#161234', k: INK, n: SKIN_T[0],
  i: CYAN[2], I: SPARK[3],
  m: HAIR_T[4], M: HAIR_T[6], N: HAIR_T[8],
  o: HAIR_T[5], O: HAIR_T[8],
};
/** Half the face's width, and where its top left corner is. */
const FACE_HALF = 24;
const FACE_AT: Pt = [CX - FACE_HALF, 158 + LEAN_DROP];
/** Where his eyes are (the middle of each), and the stone on his brow: for the life. */
export const SMITH2_EYES: ReadonlyArray<Pt> = [
  [FACE_AT[0] + 12, FACE_AT[1] + 28],
  [FACE_AT[0] + 2 * FACE_HALF - 13, FACE_AT[1] + 28],
];
export const SMITH2_STONE: Pt = [CX, FACE_AT[1] + 14];
/** The row of the top of his head: the name of the game goes over it. */
export const SMITH2_HEAD_TOP = FACE_AT[1];

function face(): Px {
  const l = layer();
  stamp(l, FACE_AT[0], FACE_AT[1], FACE, FACE_KEY);
  stamp(l, FACE_AT[0] + FACE_HALF, FACE_AT[1], FACE, FACE_KEY, true);
  // the hair on the crown of his head: combed up and back from the band, a parting down the middle
  const crown = new Set<string>([FACE_KEY.a, FACE_KEY.b]);
  const bandY = FACE_AT[1] + 12;
  scan(l, (x, y) => {
    const was = l.get(x, y) ?? '';
    if (y >= bandY || !crown.has(was)) return undefined;
    if (Math.abs(x + 0.5 - CX) < 1) return HAIR_T[0];
    const a = Math.atan2(y - (bandY + 6), x + 0.5 - CX);
    const strand = Math.floor((a + Math.PI) * 11);
    return HAIR_T[(was === FACE_KEY.a ? 1 : 2) + (strand % 3 === 0 ? 1 : strand % 3 === 1 ? 0 : -1) + (y > bandY - 4 ? 1 : 0)];
  });
  return l;
}

/** His long hair, hanging straight down on either side of his face as he leans: lock by lock. */
function hair(): Px {
  const l = layer();
  for (const s of [-1, 1]) {
    const top = FACE_AT[1] + 13;
    const bottom = Math.min(LIP - 20, FACE_AT[1] + 106);
    locks(
      l,
      HAIR_T,
      top,
      bottom,
      (y) => {
        const t = (y - top) / (bottom - top);
        // (full at his cheek, thinning to a point)
        return t < 0.7 ? 7 + 4.5 * Math.sin(Math.min(1, t / 0.35) * Math.PI * 0.5) : 11.5 * (1 - ((t - 0.7) / 0.3) ** 1.4) + 0.8;
      },
      (y) => CX + s * (FACE_HALF + 3 + 13 * Math.sin((((y - top) / (bottom - top)) * Math.PI) / 2)),
      3,
      FAR * 0.82,
      0.12,
      s * 2,
      9,
      0.3,
    );
  }
  return l;
}

/** The row his beard comes down to: the table's edge. He leans so far that it lies on the table. */
const BEARD_END = LIP - 8;

function beard(): Px {
  const l = layer();
  const top = FACE_AT[1] + 44;
  const end = BEARD_END;
  locks(
    l,
    HAIR_T,
    top,
    end,
    (y) => {
      const t = (y - top) / (end - top);
      // it widens from his jaw, hangs full, and is drawn in a little where it comes to the table
      return t < 0.34 ? 20 + (t / 0.34) * 17 : t < 0.7 ? 37 + Math.sin(((t - 0.34) / 0.36) * Math.PI) * 1.5 : 37 - ((t - 0.7) / 0.3) ** 1.6 * 9;
    },
    () => CX,
    13,
    FAR * 0.62,
    0.3,
    0,
    0,
    0.42,
  );
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
 * A hand on the table's edge, seen from under and in front: the back of it up on the table, the
 * four fingers come over the edge and down its front toward us, a nail on each; the thumb lies
 * along the edge toward the middle. They are the nearest things in the picture, and the biggest
 * of him. The light is behind and above them: it is along their tops.
 */
function hand(s: number): Px {
  const l = layer();
  const [fx, fy] = fistAt(s);
  const u = SIZE;
  const top = LIP - 9; // the arris they bend over
  // the back of the hand, up on the table: we see it end on, a low mound behind the knuckles
  l.ellipse(fx + s * 1.5 * u, top - 3 * u, 23 * u, 9.5 * u, SKIN_T[4]);
  // the thumb, lying along the edge toward the middle
  capsule(l, [fx - s * 21 * u, top - 4.5 * u], [fx - s * 33 * u, top - 1.5 * u], 5.2 * u, 4 * u, SKIN_T[4]);
  // the fingers, from the one nearest the middle outward: first, middle, ring, little
  const widths = [12, 12, 11, 9].map((w) => w * u);
  const lengths = [25, 30, 28, 20].map((n) => n * u);
  const fingers: { x0: number; w: number; tip: number }[] = [];
  let edge = fx - s * 22.5 * u;
  widths.forEach((w, f) => {
    // (his right hand is on our left: its fingers run on to the left; his left hand's to the right)
    fingers.push({ x0: s < 0 ? edge - w : edge, w, tip: top - 2 * u + lengths[f] });
    edge += s * (w + 1);
  });
  for (const f of fingers) {
    l.rect(Math.round(f.x0), Math.round(top - 4 * u), Math.round(f.w), Math.round(f.tip - (top - 4 * u) - 3 * u), SKIN_T[4]);
    l.ellipse(f.x0 + f.w / 2, f.tip - 3.5 * u, f.w / 2, 4 * u, SKIN_T[4]);
    l.ellipse(f.x0 + f.w / 2, top - 4 * u, f.w / 2, 4.5 * u, SKIN_T[4]);
  }
  // light: the knuckles and the mound behind them are lit; the fronts of the fingers are turned away from it
  scan(l, (x, y) => {
    const near = 1 - Math.min(1, Math.abs(x - LX) / 150); // the hand's inner side is nearer the word
    if (y < top - 9 * u) return SKIN_T[near > 0.35 ? 5 : 4];
    if (y < top - 1 * u) return SKIN_T[4];
    if (y < top + 2 * u) return SKIN_T[3];
    return SKIN_T[2];
  });
  // the knuckles: four of them along the edge, each catching the light on its top, a dip between each two
  for (const f of fingers) {
    const cx = f.x0 + f.w / 2;
    l.ellipse(cx, top - 4.5 * u, f.w / 2 - 0.4, 3.8 * u, SKIN_T[5]);
    l.ellipse(cx, top - 5.6 * u, f.w / 2 - 1.6, 2 * u, SKIN_T[6]);
  }
  for (let f = 1; f < fingers.length; f++) {
    const x = Math.round(s < 0 ? fingers[f].x0 + fingers[f].w : fingers[f].x0 - 1);
    for (let y = Math.round(top - 7 * u); y < top; y++) if (l.has(x, y)) l.set(x, y, SKIN_T[3]);
  }
  for (const f of fingers) {
    const xa = Math.round(f.x0);
    const xb = Math.round(f.x0 + f.w) - 1;
    // the side of each finger turned from the middle is in shade, the other catches a little
    for (let y = Math.round(top - 1 * u); y < f.tip; y++) {
      const dark = s < 0 ? xa : xb;
      const lit = s < 0 ? xb : xa;
      if (l.has(dark, y)) l.set(dark, y, SKIN_T[0]);
      if (l.has(dark + (s < 0 ? 1 : -1), y)) l.set(dark + (s < 0 ? 1 : -1), y, SKIN_T[1]);
      if (l.has(lit, y) && y < f.tip - 3 * u) l.set(lit, y, SKIN_T[3]);
    }
    // the crease where it folds over the edge, and the one at its last joint
    for (let x = xa + 1; x < xb; x++) {
      if (l.has(x, Math.round(top + 2 * u))) l.set(x, Math.round(top + 2 * u), SKIN_T[1]);
      const j = Math.round(top + (f.tip - top) * 0.52);
      if (x > xa + 1 && x < xb - 1 && l.has(x, j)) l.set(x, j, SKIN_T[1]);
    }
    // its nail
    const nw = Math.max(3, Math.round(f.w - 5 * u));
    const nx = Math.round(f.x0 + (f.w - nw) / 2);
    const ny = Math.round(f.tip - 8 * u);
    for (let y = ny; y < ny + Math.round(4.5 * u); y++) for (let x = nx; x < nx + nw; x++) if (l.has(x, y)) l.set(x, y, y === ny ? SKIN_T[1] : SKIN_T[4]);
    for (let x = nx + 1; x < nx + nw - 1; x++) if (l.has(x, ny + Math.round(4.5 * u))) l.set(x, ny + Math.round(4.5 * u), SKIN_T[5]);
  }
  return l;
}

/** What of him his breath moves, back to front, for a `rise` of his shoulders: his cloak, his chest, his upper arms, the pelt, his forearms. */
function heaving(rise: number): Px[] {
  const parts: Px[] = [cloak(rise), chest(rise)];
  for (const s of [-1, 1]) parts.push(upperArm(s, rise));
  parts.push(pelt(rise));
  for (const s of [-1, 1]) parts.push(foreArm(s, rise));
  return parts;
}

/** ... and what it does not, which is in front of all that: his hair, his beard, his face. (The last is his face.) */
function head(): Px[] {
  return [hair(), beard(), face()];
}

/** Only where the parts his breath moves are, for a `rise`, and not what they look like (for knowing what he hides, however he breathes). */
function heavingShape(rise: number, into: Uint8Array): void {
  const l = layer();
  l.poly([[X(-108), LIP], [X(-62 - rise * 0.3), Y(182) - rise], [X(62 + rise * 0.3), Y(182) - rise], [X(108), LIP]], INK);
  for (const s of [-1, 1]) {
    capsule(l, shoulder(s, rise), elbow(s, rise), 12 * SIZE, 14.5 * SIZE, INK);
    capsule(l, elbow(s, rise), wrist(s), 14.5 * SIZE, 17.5 * SIZE, INK);
  }
  // (the pelt lies inside a box from its collar to the longest tuft of its hem; a rune that near him is as good as hidden)
  l.rect(X(-70), Y(172) - rise, X(70) - X(-70) + 1, Y(232) - Y(172), INK);
  for (let i = 0; i < W * H; i++) if (l.d[i * 4 + 3] > 0) into[i] = 1;
}

// ---------------------------------------------------------------------------------------------
// The whole picture

export interface Smith2Scene {
  /** Every rune cut in the stones and along the table, for the life. */
  runes: Smith2Rune[];
  /** What else glows in this picture. */
  look: Smith2Look;
  /** The veins of light, if it has them: a pulse runs out along each. (A point of one that cannot be seen is [-1, -1].) */
  veins: Pt[][];
  /**
   * The lit edge of the table's top, row by row from the arris up: the stretches of each row
   * (from a column, to before a column) that his hands are not on. When the top pulses, the whole
   * of it shines.
   */
  brim: ReadonlyArray<ReadonlyArray<readonly [number, number]>>;
}

/** What paintSmith2 gives. */
export interface Smith2Painted {
  /** The picture with his breath out, and nothing moving in it. */
  px: Px;
  /** The same with the whole top of the table alight: the life fades from the one to the other as the top pulses. */
  lit: Px;
  scene: Smith2Scene;
  /** The picture with his shoulders lifted `rise` rows by his breath (0..SMITH2_BREATH), and the same with the top alight. */
  frame(rise: number): { px: Px; lit: Px };
}

/** What the start screen needs of the picture behind it (ui/panels.ts lays the screen out from this). */
export interface Smith2Title {
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
}

/**
 * WHAT ELSE GLOWS. The word is always the light under him. The owner was shown the lean with a
 * brazier at either hand and without (sketches 16 to 21), and with five other lights (22 to 26:
 * "and maybe some other luminescent options"); these are those, to be switched on as he chooses.
 * What glows of his is the word's colour; the braziers are an honest fire.
 */
export interface Smith2Look {
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
export const SMITH2_PLAIN: Smith2Look = { braziers: false, runes: false, lanterns: false, rising: false, moon: false, veins: false };

/** Where the two braziers (or the two lanterns) are: the middle of the bowl's rim, and the column its post stands at on the floor. */
const HANG_FOOT = 192;
const HANG_ROW = 198;
export const SMITH2_FIRES: ReadonlyArray<Pt> = [
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
  const [bx, by] = SMITH2_FIRES[n];
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
  const [bx, by] = SMITH2_FIRES[n];
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
export function smith2Veins(): Pt[][] {
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
  const ramps: ReadonlyArray<readonly [Tones, number]> = [[SKIN_T, 2], [HAIR_T, 1], [PELT_T, 2], [CLOAK_T, 2], [MAIL_T, 3], [HIDE_T, 2], [STEEL_T, 2]];
  for (const [ramp, steps] of ramps) ramp.forEach((c, i) => LIT.set(pack(c), pack(ramp[Math.min(ramp.length - 1, i + steps)])));
}

/** Every rune of a list alight: each burns where it is cut, and the stone round it is lit by it. */
function alight(p: Px, runes: readonly CutRune[]): void {
  for (const r of runes) {
    const at = (ox: number, oy: number, c: string): void => runeAt(p, r.k, r.x + ox, r.y + oy, r.s, c, r.fat, r.skew);
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) at(ox * r.fat, oy, WORD[3]);
    // (they burn low: it is the power going through them that makes them blaze)
    at(0, 0, WORD[2]);
  }
  for (const r of runes) glow(p, r.x + 2 * r.s, r.y + 3 * r.s, 9 + r.s * 5, WORD[2], 0.24, 4);
}

/**
 * What of a rune can be seen: its strokes, the stone at their very edge and the stone a little
 * further off, each as a list of pixels. `hidden` marks what stands in front of it; `ground`, the
 * stone it is cut in (its light does not leave its stone). `mark` is a sheet to work on, left as
 * empty as it was found.
 */
function seen(r: CutRune, hidden: Uint8Array, ground: Uint8Array, mark: Px, reach: number): Smith2Rune {
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
  return { ...r, dots: Int32Array.from(dots), edge: Int32Array.from(edge), halo: Int32Array.from(halo) };
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

export function paintSmith2(look: Smith2Look = SMITH2_PLAIN): Smith2Painted {
  const cut: CutRune[] = [];
  const arris = LIP - 8;

  // --- BEHIND HIM: the vault, and the stones of the ring ---
  const bg = layer();
  vault(bg);
  gloom(bg, LX, LY - 20, 24, 250, NIGHT, 0.96, 18);
  const stones = layer();
  // (the two that stand behind the table's ends, in the word's light; then the two near us, great and dark)
  menhir(stones, 146, 188, 44, 1, 0.25, cut);
  menhir(stones, W - 188, W - 146, 60, 2, 0.25, cut);
  menhir(stones, 56, 118, -40, 0, 0.8, cut);
  menhir(stones, W - 118, W - 56, -60, 3, 0.8, cut);
  glow(stones, LX, LY, 200, CYAN[2], 0.16);
  gloom(stones, LX, LY - 10, 60, 330, NIGHT, look.braziers || look.lanterns ? 0.8 : 0.88, 16);
  over(bg, stones, null);
  /** How many of the runes are the stones' (they come first in the list; the table's follow). */
  const stoneCount = cut.length;
  if (look.runes) alight(bg, cut);
  // (veins: cut in the stone as fine dark-and-cyan lines; it is the life that sends the light out along them)
  const veins = look.veins ? smith2Veins() : [];
  const cutVein = (p: Px, v: readonly Pt[]): void => {
    v.forEach(([x, y], i) => {
      if (p.d[(y * W + x) * 4 + 3] === 0) return;
      p.set(x, y, i < v.length * 0.25 ? WORD[2] : WORD[3]);
      // a twig off it here and there
      if (i % 13 === 6) for (let j = 1; j <= 3 + (i % 3); j++) if (p.has(x + (i % 2 ? j : -j), y + (v[0][1] < v[v.length - 1][1] ? j : -j))) p.set(x + (i % 2 ? j : -j), y + (v[0][1] < v[v.length - 1][1] ? j : -j), WORD[4]);
    });
  };
  /** (smith2Veins: the first seven run down the table's front; the rest climb the stones) */
  const TABLE_VEINS = 7;
  veins.slice(TABLE_VEINS).forEach((v) => cutVein(bg, v));
  // the other lights, on what is behind him
  if (look.braziers) for (const [bx, by] of SMITH2_FIRES) glow(bg, bx, by - 14, 130, FIRE_T[2], 0.4, 8);
  if (look.lanterns) for (const [bx, by] of SMITH2_FIRES) glow(bg, bx, by, 120, WORD[2], 0.42, 8);
  if (look.moon) {
    const c = rgba(MOON);
    for (let y = 0; y < arris; y++) for (let x = 0; x < W; x++) if (inBeam(x, y)) toward(bg.d, (y * W + x) * 4, c, (x + y) % 2 === 0 ? 0.24 : 0.13);
  }

  // --- HIM: the other lights catch his edges (his face and all on it keep their own light) ---
  const catchLight = (part: Px, flesh: boolean): Px => {
    for (const s of [-1, 1]) {
      const [bx, by] = SMITH2_FIRES[s < 0 ? 0 : 1];
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
  // (what his breath does not move is painted once)
  const fixed = head().map((part, i, all) => catchLight(part, i === all.length - 1));

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
  for (const s of [-1, 1]) {
    const h = hand(s);
    const [bx, by] = SMITH2_FIRES[s < 0 ? 0 : 1];
    const near = (x: number, y: number): number => 1.3 - Math.hypot(x - bx, (y - by) * 0.8) / 150;
    if (look.braziers) rim(h, s, 0, FIRE_T[2], 0.6, 2, near);
    if (look.lanterns) rim(h, s, 0, WORD[1], 0.55, 2, near);
    if (look.moon && s < 0) rim(h, -1, 0, MOON, 0.7, 2);
    over(fg, h);
    shapeOf(h, hands);
  }

  // --- WHAT HIDES WHAT, for the life: it draws over the picture, and must not draw a rune's light on his arm ---
  // behind him: whatever he may stand in front of, however he breathes, and whatever is in front of him
  const hidden = new Uint8Array(W * H);
  for (const part of fixed) shapeOf(part, hidden);
  {
    const reach = new Uint8Array(W * H);
    for (let rise = 0; rise <= SMITH2_BREATH; rise++) heavingShape(rise, reach);
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
  const sink = (p: Px): Px => {
    for (let y = 0, i = 0; y < H; y++) {
      for (let x = 0; x < W; x++, i += 4) {
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

  const frame = (rise: number): { px: Px; lit: Px } => {
    const parts = [...heaving(rise).map((part) => catchLight(part, false)), ...fixed];
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
  return { px: first.px, lit: first.lit, scene: { runes, look, veins: seenVeins, brim }, frame };
}

// ---------------------------------------------------------------------------------------------
// The life of the picture: everything that moves, drawn over it each frame. Nothing is carried
// from one frame to the next: every dot is worked out from the time alone, and most of it moves
// in steps of about a tenth of a second, like drawn animation (title_smith.ts, title.ts).

/** Draws one dot of the life: the pixel (x, y) of the picture, or a block `w` wide and `h` high from there, in one colour, as strongly as `a` says (1 = solid). */
export type Smith2Dot = (x: number, y: number, color: string, a: number, w?: number, h?: number) => void;

const frac = (v: number): number => v - Math.floor(v);
/** 0 at the ends of 0..1 and 1 in the middle, eased. */
const swell = (u: number): number => Math.sin(clamp01(u) * Math.PI) ** 2;

/** One tongue of flame, as dots: a teardrop standing on `base`, its tip leaning. */
function tongue(put: Smith2Dot, cx: number, base: number, h: number, w: number, leanTo: number): void {
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

/** The strokes of a rune, as dots (one that is not cut in the stone: the runes that rise). */
function runeDots(put: Smith2Dot, r: CutRune, ox: number, oy: number, c: string, a: number): void {
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
// It goes round in four runs of SMITH2_BEAT seconds each:
//   1  along the table from our left to our right     up the stones      he breathes in
//   2  back from our right to our left                down them          he breathes out
//   3  in from both ends, to meet in the middle       up                 in
//   4  from the middle back out to both ends          down               out
// A run is on its way for RUN seconds of its beat. As it arrives the whole top of the table pulses
// (THE TOP PULSES); when the two meet in the middle, at the top of his breath, it pulses its
// brightest and his face is lit by it.

/** How long each of the four runs has, start to start, and the whole round, in seconds. */
export const SMITH2_BEAT = 2;
export const SMITH2_CYCLE = 4 * SMITH2_BEAT;
/** How long of its beat a run is on its way: it arrives this long after it sets out. */
export const SMITH2_RUN = 1.6;

/** A time in the round, as the time from `at` in it: the nearest way round, before (-) or after (+). */
function since(t: number, at: number): number {
  const d = (((t - at) % SMITH2_CYCLE) + SMITH2_CYCLE) % SMITH2_CYCLE;
  return d > SMITH2_CYCLE / 2 ? d - SMITH2_CYCLE : d;
}

/** How brightly the power burns in a rune it passed `dt` seconds ago: white as it passes, dying away behind it in steps. */
function wake(dt: number): number {
  return dt < 0 ? 0 : dt < 0.1 ? 1 : dt < 0.2 ? 0.72 : dt < 0.32 ? 0.48 : dt < 0.48 ? 0.28 : dt < 0.7 ? 0.14 : 0;
}

/** How far along its run (Smith2Rune.at) a rune is from where run number `run` (0..3) of the round sets out: of the table's, or of a stone's. */
function runOrder(table: boolean, at: number, run: number): number {
  if (!table) return run % 2 === 0 ? at : 1 - at;
  return run === 0 ? at : run === 1 ? 1 - at : run === 2 ? 1 - Math.abs(2 * at - 1) : Math.abs(2 * at - 1);
}

/** How brightly the power burns, at time t, in a rune `at` along its run: of the table's (`table`), or of a stone's. 0..1. */
export function smith2Power(table: boolean, at: number, t: number): number {
  let best = 0;
  for (let run = 0; run < 4; run++) best = Math.max(best, wake(since(t, run * SMITH2_BEAT + runOrder(table, at, run) * SMITH2_RUN)));
  return best;
}

/**
 * THE TOP PULSES. How brightly the whole top of the table is alight at time t, 0..1: it comes up
 * as each run arrives and dies away after it, and the one where the two meet in the middle is the
 * great one.
 */
export function smith2Pulse(t: number): number {
  let best = 0;
  for (let run = 0; run < 4; run++) {
    const dt = since(t, run * SMITH2_BEAT + SMITH2_RUN);
    const v = dt < -0.1 ? 0 : dt < 0 ? 1 + dt / 0.1 : dt < 0.14 ? 1 : dt < 0.74 ? (1 - (dt - 0.14) / 0.6) ** 1.6 : 0;
    best = Math.max(best, v * (run === 2 ? 1 : 0.45));
  }
  return best;
}

/** How far his breath has lifted his shoulders at time t: 0..SMITH2_BREATH, in whole rows. He is at the top of a breath as runs 1 and 3 arrive, and has let it out as 2 and 4 do. */
export function smith2Breath(t: number): number {
  return Math.round((0.5 + 0.5 * Math.cos(((t - SMITH2_RUN) / (2 * SMITH2_BEAT)) * Math.PI * 2)) * SMITH2_BREATH);
}

export function smith2Life(t: number, scene: Smith2Scene, put: Smith2Dot): void {
  const [wx, wy] = SMITH2_WORD;
  const arris = LIP - 8;
  const pulse = smith2Pulse(t);

  // --- the runes cut in the stones and along the table: the power runs through them (THE POWER) ---
  for (const r of scene.runes) {
    // (where the stones go up into the dark, so does the power)
    const a = smith2Power(r.table === true, r.at, t) * (r.table ? 1 : clamp01(1.15 - (r.at - 1) * 4));
    if (a < 0.05) continue;
    for (let i = 0; i < r.halo.length; i++) put(r.halo[i] % W, Math.floor(r.halo[i] / W), WORD[2], a * 0.42);
    for (let i = 0; i < r.edge.length; i++) put(r.edge[i] % W, Math.floor(r.edge[i] / W), WORD[1], a * 0.72);
    for (let i = 0; i < r.dots.length; i++) put(r.dots[i] % W, Math.floor(r.dots[i] / W), WORD[0], Math.min(1, a * 1.3));
  }

  // --- the table's lit edge: the light along it swells with the word's breath; and when the top pulses the whole of it shines, and thickens ---
  const breath = 0.5 + 0.5 * Math.sin(t * 2.1);
  {
    const bar = (row: number, half: number, c: string, a: number): void => {
      if (a <= 0.02) return;
      for (const [x0, x1] of scene.brim[row]) {
        const from = Math.max(x0, wx - half);
        const to = Math.min(x1, wx + half);
        if (to > from) put(from, arris - row, c, a, to - from, 1);
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
    word2Strokes(above((x, y) => put(x, y, WORD[3], 0.18 + breath * 0.3 + pulse * 0.5)), 5);
    word2Strokes(above((x, y) => put(x, y, WORD[4], 1)), 3);
    word2Strokes(above((x, y) => put(x, y, pulse > 0.3 ? WORD[2] : WORD[3], 1)), 2);
    word2Strokes(above((x, y) => put(x, y, pulse > 0.3 ? WORD[1] : WORD[2], 1)), 1);
    word2Strokes(above((x, y) => put(x, y, WORD[0], 1)), 0);
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
    if (y < FACE_AT[1] + 50 && Math.abs(x - CX) < FACE_HALF + 2) continue;
    const a = (1 - u) ** 1.4;
    put(x, y, u < 0.18 ? WORD[0] : u < 0.5 ? WORD[1] : WORD[2], a);
    if (u < 0.35) put(x, y + 1, WORD[2], a * 0.5);
  }

  // --- his eyes: they do not blink. They burn, a little brighter and lower by turns, and when the top pulses so do they ---
  {
    const a = 0.3 + 0.25 * Math.sin(t * 2.6) + pulse * 0.45;
    for (const [ex, ey] of SMITH2_EYES) {
      put(ex - 1, ey, WORD[0], 0.55 + pulse * 0.45, 3, 2);
      put(ex - 5, ey, WORD[1], a, 11, 2);
      put(ex - 7, ey + 1, WORD[2], a * 0.5, 15, 1);
    }
  }

  // --- the stone on his brow: a star of light crosses it ---
  {
    const [sx, sy] = SMITH2_STONE;
    const u = frac(t / 4.4);
    if (u < 0.12) {
      const arm = u < 0.03 ? 2 : u < 0.07 ? 4 : u < 0.1 ? 3 : 1;
      put(sx - arm, sy, WORD[0], 1, 2 * arm + 1, 1);
      put(sx, sy - arm, WORD[0], 1, 1, 2 * arm + 1);
    }
  }

  const { look } = scene;

  // --- the braziers: three tongues of flame each, and a spark now and then ---
  if (look.braziers) {
    SMITH2_FIRES.forEach(([fx, fy], n) => {
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
    SMITH2_FIRES.forEach(([bx, by], n) => {
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
    put(x, y, WORD[1], swell(u) * 0.4);
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

/** The look the owner chose (5 Oct 2026, 20:26: "I like 22"): every rune alight. */
export const SMITH2_CHOSEN: Partial<Smith2Look> = { runes: true };

export function makeSmith2Title(look: Partial<Smith2Look> = {}): Smith2Title {
  const painted = paintSmith2({ ...SMITH2_PLAIN, ...look });
  const { scene } = painted;
  const still = painted.px.d;
  /** A frame of his breath: what of it is not as the still picture is; and, of it with the top alight, what is not as the frame itself is. */
  const frames: ({ moved: Change; alight: Change } | undefined)[] = [];
  const paintFrame = (rise: number): void => {
    const f = rise === 0 ? painted : painted.frame(rise);
    frames[rise] = { moved: changeFrom(f.px.d, still), alight: changeFrom(f.lit.d, f.px.d) };
  };
  paintFrame(0);
  const warm = (): void => {
    for (let rise = 1; rise <= SMITH2_BREATH; rise++) if (!frames[rise]) paintFrame(rise);
  };
  let sheet: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let img: ImageData | null = null;
  let seenTick = -1;
  const life = (t: number): HTMLCanvasElement => {
    if (!sheet) {
      sheet = document.createElement('canvas');
      sheet.width = W;
      sheet.height = H;
      ctx = sheet.getContext('2d') as CanvasRenderingContext2D;
      img = ctx.createImageData(W, H);
    }
    // (his breath is painted a frame each time the picture is asked for, until there are all of them)
    const todo = frames.length <= SMITH2_BREATH ? frames.length : -1;
    if (todo > 0) paintFrame(todo);
    // (thirty times a second is as often as anything in it changes)
    const tick = Math.floor(t * 30);
    if ((tick === seenTick && todo < 0) || !ctx || !img) return sheet;
    seenTick = tick;
    const time = tick / 30;
    const d = img.data;
    d.fill(0);
    // --- his breath: what of him is not where the still picture has it ---
    let rise = smith2Breath(time);
    while (!frames[rise]) rise--;
    const { moved, alight } = frames[rise] as { moved: Change; alight: Change };
    for (let j = 0; j < moved.at.length; j++) {
      const o = moved.at[j] * 4;
      d[o] = moved.rgb[j * 3];
      d[o + 1] = moved.rgb[j * 3 + 1];
      d[o + 2] = moved.rgb[j * 3 + 2];
      d[o + 3] = 255;
    }
    // --- the top pulses: the picture goes toward the one with the whole top alight, and comes back ---
    const pulse = smith2Pulse(time);
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
    // --- and everything small that moves ---
    smith2Life(time, scene, (x, y, color, a, w = 1, h = 1) => {
      if (a <= 0) return;
      const v = rgba(color);
      const k = a > 1 ? 1 : a;
      for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) {
        for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) {
          const o = (yy * W + xx) * 4;
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
  return { w: W, h: H, lip: LIP, lift: SMITH2_LIFT, headTop: SMITH2_HEAD_TOP, still: painted.px.toCanvas(), life, warm };
}
