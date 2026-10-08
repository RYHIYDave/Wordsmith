// The picture behind the start screen, as the owner asked for it on 5 Oct 2026 (18:09):
//
//   "I want just the wordsmith in the starting screen. At his forge table, same angle from below
//    looking up. Same sort of living style. And I'd like it to be the full screen with the menus
//    along the bottom"
//
// So: ONE picture, the whole screen. The wordsmith alone, behind his forge table (the slab of his
// ring in the town: stone, its top alight with the word he is making), seen from low down and
// looking up at him, as the child looked up at the librarian in the picture this replaces
// (title.ts). The standing stones of his ring are behind him, and the hall's wall, and a brazier
// at either hand. Like everything else it is painted in code, in the game's own colours (kit.ts):
// what glows of his is cyan; the only warm thing is the honest fire of the braziers.
//
// THE WHOLE SCREEN, ON EVERY SCREEN. The picture is painted once, bigger than any screen the game
// is laid out on (SMITH_W x SMITH_H game pixels), and the screen shows the part of it that fits:
// its middle column is the screen's, and the row SMITH_LIP (the front edge of the table top) is
// put a fixed way above the bottom of the screen, where the menu is. So everything that matters
// is near the middle and between the top of his head and the table: SMITH_SAFE says where. Toward
// its edges and its top the picture sinks into black, so that a screen wider or taller than it
// shows no edge.
//
// How it is built: back to front in layers (the wall, the stones, the braziers, the figure, the
// table, what is on it, his hands), each shaded by ONE light, low in the middle: the word on the
// table. He is lit from under the chin, his shadow is thrown up the wall behind him, and the
// corners fall into the dark. Big surfaces are shaded by how far they are from that light, cut
// into flat bands so that it stays pixel art; the falloff is never a smooth gradient.
//
// The small life of it (the word's pulse, sparks, runes rising, the flames, his eyes) is drawn over
// the picture each frame: `life`.

import { Px, mix, rgba } from '../engine/px';
import { hash2 } from '../engine/rng';
import { VAULT } from './ground';
import { CYAN, INK, SPARK } from './kit';
import type { Ramp } from './kit';
import { IRON } from './mkit';
import { COAL, EMBER } from './props';

/** The picture's size, in game pixels. */
export const SMITH_W = 640;
export const SMITH_H = 360;
/** Everything is arranged about this column. */
const CX = 320;
/** First row of the table's top, and of its front edge. */
const TOP = 290;
export const SMITH_LIP = 300;
const LIP = SMITH_LIP;
/** What must stay on the screen: the columns either side of the middle, and the rows from the top of his head to the table. */
export const SMITH_SAFE = { halfW: 170, top: 134, bottom: LIP + 14 } as const;

/** The light: the word on the table. */
const LX = CX;
const LY = TOP - 14;

type Pt = readonly [number, number];

// ---------------------------------------------------------------------------------------------
// Colours

/** The dark the picture sinks into. */
const NIGHT = '#05040f';
/** The hall's wall: the vault's own stone (ground.ts), joint to lit lip. */
const WALL = VAULT.lit;
/** A standing stone: paler and bluer than the wall, so that it stands off it. */
const MENHIR: Ramp = ['#191a44', '#262a62', '#3a4088', '#5660ac', '#7e8ad0'];
/** The table: the darkest dressed stone in the room, so that its light is the brightest thing. */
const SLAB: Ramp = ['#12102e', '#1c1a48', '#2a2866', '#3c3a86', '#5a58ac'];
/** The light of the word, from its white heart outward. */
const WORD: readonly string[] = ['#ffffff', SPARK[3], CYAN[2], '#1898b4', CYAN[0]];

// ---------------------------------------------------------------------------------------------
// Small helpers (as title.ts has them, for a canvas of this size)

const W = SMITH_W;
const H = SMITH_H;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function layer(): Px {
  return new Px(W, H);
}

/** Put a part on the picture with an ink line round it, so that overlapping parts stay separate. */
function over(dst: Px, part: Px, line: string = INK): void {
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
  const ink = rgba(line);
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

/** Mix the pixel at byte offset i toward the colour c. */
function toward(d: Uint8ClampedArray, i: number, c: readonly number[], t: number): void {
  d[i] = Math.round(d[i] + (c[0] - d[i]) * t);
  d[i + 1] = Math.round(d[i + 1] + (c[1] - d[i + 1]) * t);
  d[i + 2] = Math.round(d[i + 2] + (c[2] - d[i + 2]) * t);
}

/** Visit every painted pixel of a layer; return a colour to repaint it, or undefined to leave it. */
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

/**
 * Sink a layer into the dark: each pixel is mixed toward `dark`, more the further it is from the
 * light. The falloff is cut into flat bands.
 */
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

/** The figure's shadow on the wall behind him: the light is low and in front of him, so his outline is thrown up and outward, bigger than he is. */
function wallShadow(p: Px, figure: readonly Px[], lx: number, ly: number, grow: number, dark: string, amount: number): void {
  const c = rgba(dark);
  const mask = new Uint8Array(W * H);
  for (const part of figure) {
    for (let i = 0; i < W * H; i++) if (part.d[i * 4 + 3] > 0) mask[i] = 1;
  }
  for (let y = 0; y < TOP; y++) {
    const fy = Math.round(ly + (y - ly) / grow);
    if (fy < 0 || fy >= H) continue;
    for (let x = 0; x < W; x++) {
      const fx = Math.round(lx + (x - lx) / grow);
      if (fx < 0 || fx >= W) continue;
      if (mask[fy * W + fx] === 1 && p.d[(y * W + x) * 4 + 3] > 0) toward(p.d, (y * W + x) * 4, c, amount);
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The wall behind. We look up at it from low down, so its uprights lean toward a point far above
// the picture and its courses get shallower as they climb.

const VANISH = -1500;

/** How much narrower the wall is drawn at row y than at the table. */
function lean(y: number): number {
  return (y - VANISH) / (TOP - VANISH);
}

/** Screen column of the wall line that meets the table at column u. */
function wallX(u: number, y: number): number {
  return CX + (u - CX) * lean(y);
}

/** The first row of each course of stone, from the top of the picture down: they deepen as they come down toward the eye. */
const COURSES: readonly number[] = (() => {
  const rows: number[] = [];
  let y = TOP + 6;
  let h = 36;
  while (y > -h) {
    y -= Math.round(h);
    rows.unshift(y);
    h = Math.max(15, h * 0.93);
  }
  return rows;
})();

function wall(p: Px): void {
  for (let k = 0; k < COURSES.length; k++) {
    const top = COURSES[k];
    const bottom = k + 1 < COURSES.length ? COURSES[k + 1] - 1 : TOP + 5;
    // (stones of uneven length, each course set off from the one under it)
    const len = 58;
    const off = (k % 2) * 29 + Math.floor(hash2(k, 7, 31) * 14);
    for (let n = -1; n * len + off - len < W + 80; n++) {
      const u0 = n * len + off - 40 + Math.floor(hash2(n, k, 33) * 10);
      const u1 = (n + 1) * len + off - 40 + Math.floor(hash2(n + 1, k, 33) * 10);
      const odd = hash2(n, k, 35) < 0.28;
      for (let y = Math.max(0, top); y <= Math.min(H - 1, bottom); y++) {
        const x0 = Math.round(wallX(u0, y));
        const x1 = Math.round(wallX(u1, y)) - 1;
        for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) {
          // the joint; under it the stone's upper edge in shade; its lower edge, turned down to the light, bright
          const c = x === x0 || y === top ? WALL[0] : y === top + 1 ? WALL[1] : y >= bottom - 1 ? WALL[4] : x === x0 + 1 ? WALL[1] : odd ? WALL[3] : WALL[2];
          p.set(x, y, c);
        }
      }
      // (a worn stone here and there: a chip out of its lower edge, a crack)
      if (hash2(n, k, 37) < 0.2) {
        const cx = Math.round(wallX((u0 + u1) / 2 + (hash2(n, k, 39) - 0.5) * 30, bottom));
        p.set(cx, bottom, WALL[1]).set(cx + 1, bottom, WALL[1]).set(cx, bottom - 1, WALL[2]);
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The standing stones of his ring

/**
 * Small runes: a few strokes each on a 5 x 7 grid. They are the old northern ones (an arrow, a
 * stem with branches, a diamond, a bolt), and none of them is a letter anyone reads today: a
 * stone that said "HXY" would be a stone with writing on it, not a rune stone.
 */
const RUNES: ReadonlyArray<ReadonlyArray<readonly [number, number, number, number]>> = [
  // an arrow; a stem with two branches rising; a stem with two branches falling
  [[2, 0, 2, 6], [0, 2, 2, 0], [4, 2, 2, 0]],
  [[1, 0, 1, 6], [1, 3, 4, 0], [1, 5, 4, 2]],
  [[1, 0, 1, 6], [1, 0, 4, 2], [1, 2, 4, 4]],
  // a stem crossed on a slant; a stem hooked at both ends; a bolt
  [[2, 0, 2, 6], [0, 2, 4, 4]],
  [[2, 0, 2, 6], [2, 0, 4, 2], [2, 6, 0, 4]],
  [[3, 0, 1, 2], [1, 2, 3, 4], [3, 4, 1, 6]],
  // a diamond on two legs; a diamond; an hourglass
  [[2, 0, 0, 2], [2, 0, 4, 2], [0, 2, 4, 6], [4, 2, 0, 6]],
  [[2, 1, 0, 3], [0, 3, 2, 5], [2, 5, 4, 3], [4, 3, 2, 1]],
  [[0, 0, 4, 0], [4, 0, 0, 6], [0, 6, 4, 6], [0, 0, 4, 6]],
  // a stem with one branch; a stem crossed twice on a slant; a thorn
  [[1, 0, 1, 6], [1, 0, 4, 3]],
  [[2, 0, 2, 6], [0, 1, 4, 3], [0, 3, 4, 5]],
  [[1, 0, 1, 6], [1, 2, 4, 3], [4, 3, 1, 5]],
];

/** The strokes of rune `k`, each `s` times the size, its top left corner at (x, y). */
function runeAt(p: Px, k: number, x: number, y: number, s: number, c: string, fat = 1): void {
  for (const [a, b, e, f] of RUNES[((k % RUNES.length) + RUNES.length) % RUNES.length]) {
    for (let w = 0; w < fat; w++) p.line(Math.round(x + a * s) + w, Math.round(y + b * s), Math.round(x + e * s) + w, Math.round(y + f * s), c);
  }
}

/** Where the runes cut in the stones are (for the life of the picture: they light in turn): the middle of each, and which stone it is on. */
export interface SmithRune {
  x: number;
  y: number;
  k: number;
  s: number;
  /** 0..1: how near the light the stone is (the further ones are fainter). */
  near: number;
}

/**
 * One standing stone: `u` is the column it stands at, `top` its highest row, `half` half its
 * width at the table. It tapers, leans a little, and its head is cut on a slant. `side` is which
 * way the light comes from (+1: from its right).
 */
function menhir(p: Px, u: number, top: number, half: number, tilt: number, side: number, seed: number, near: number, runes: SmithRune[]): void {
  const l = layer();
  const base = TOP + 4;
  const xAt = (y: number): number => u + ((base - y) / (base - top)) * tilt;
  const halfAt = (y: number): number => half * (0.66 + 0.34 * ((y - top) / (base - top)) ** 0.8);
  for (let y = top; y <= base; y++) {
    const t = y - top;
    // (the head: cut on a slant, its corners knocked off)
    const cut = Math.max(0, 10 - t) * 0.9;
    const cx = xAt(y);
    const h = halfAt(y);
    const x0 = Math.round(cx - h + (side > 0 ? cut * 1.5 : cut * 0.4) + (hash2(y >> 3, seed, 41) - 0.5) * 2);
    const x1 = Math.round(cx + h - (side > 0 ? cut * 0.4 : cut * 1.5) + (hash2(y >> 3, seed, 43) - 0.5) * 2);
    for (let x = x0; x <= x1; x++) {
      // across it: the face turned to the light, the broad front, the side turned away
      const f = side > 0 ? (x - x0) / Math.max(1, x1 - x0) : (x1 - x) / Math.max(1, x1 - x0);
      const tone = f > 0.86 ? 4 : f > 0.62 ? 3 : f > 0.2 ? 2 : 1;
      l.set(x, y, MENHIR[tone]);
    }
  }
  // its grain: short cracks, and pits
  for (let n = 0; n < 9; n++) {
    const y = top + 14 + Math.floor(hash2(n, seed, 45) * (base - top - 30));
    const x = Math.round(xAt(y) + (hash2(n, seed, 47) - 0.5) * halfAt(y) * 1.4);
    const long = 3 + Math.floor(hash2(n, seed, 49) * 7);
    for (let i = 0; i < long; i++) {
      const xx = x + Math.round(Math.sin(i * 0.9 + n) * 1.2);
      if (l.has(xx, y + i) && l.has(xx + 1, y + i)) l.set(xx, y + i, MENHIR[1]);
    }
  }
  over(p, l);
  // the runes cut in it, one under another: dark where they are cut, the light in them is the life's
  const count = 3;
  const s = half > 22 ? 2 : 1.4;
  for (let n = 0; n < count; n++) {
    const y = top + 26 + n * Math.round(13 * s);
    const x = Math.round(xAt(y) - 2 * s - side * half * 0.08);
    const k = (seed * 3 + n * 5) % RUNES.length;
    runeAt(p, k, x + 1, y + 1, s, MENHIR[0], s >= 2 ? 2 : 1);
    runeAt(p, k, x, y, s, mix(CYAN[2], MENHIR[2], 0.45 - near * 0.2), s >= 2 ? 2 : 1);
    runes.push({ x: x + 2 * s, y: y + 3 * s, k, s, near });
  }
}

// ---------------------------------------------------------------------------------------------
// A brazier: an iron dish on a tall stand, a bed of coals. (Its flames are the life's.)

/** Where the fire of each brazier stands: the middle of its bed of coals. */
export const SMITH_FIRES: ReadonlyArray<Pt> = [
  [CX - 230, 226],
  [CX + 229, 226],
];

function brazier(p: Px, cx: number, cy: number, burning = true): void {
  const l = layer();
  // the stand: one stem, a knot in it, three feet out of sight behind the table
  for (let y = cy + 9; y <= TOP + 3; y++) {
    l.set(cx - 1, y, IRON[2]).set(cx, y, IRON[3]).set(cx + 1, y, IRON[1]);
  }
  for (const y of [cy + 30, cy + 31]) l.hline(cx - 3, y, 7, y === cy + 30 ? IRON[3] : IRON[1]);
  // the dish: wide at the rim, drawn in under it
  for (let y = cy; y <= cy + 9; y++) {
    const t = (y - cy) / 9;
    const half = Math.round(17 - 12 * t ** 1.5);
    for (let x = cx - half; x <= cx + half; x++) {
      const f = (x - cx) / half;
      // (warm underneath, where the coals heat it)
      l.set(x, y, y === cy ? IRON[3] : f < -0.6 ? IRON[3] : f > 0.5 ? IRON[1] : t > 0.5 && burning ? mix(IRON[2], COAL[3], 0.35) : IRON[2]);
    }
  }
  // the coals, seen over the rim
  for (let x = cx - 14; x <= cx + 14; x++) {
    const n = hash2(x, cy, 51);
    // (a brazier that is out: cold coals, one of them still red)
    l.set(x, cy - 1, !burning ? (n < 0.06 ? COAL[3] : n < 0.6 ? COAL[1] : COAL[2]) : n < 0.35 ? EMBER[2] : n < 0.7 ? COAL[3] : COAL[2]);
    if (Math.abs(x - cx) < 11 && n > 0.25) l.set(x, cy - 2, !burning ? COAL[1] : n > 0.75 ? EMBER[1] : COAL[2]);
  }
  over(p, l);
}

// ---------------------------------------------------------------------------------------------
// The forge table: a slab of dark stone on a block, its top alight.

/** The table's ends, at the row of its front edge. */
const TABLE_L = 46;
const TABLE_R = W - 46;

function table(): Px {
  const l = layer();
  // the top: seen from only a little above, so it is a few rows deep; its far edge is shorter than its near one
  for (let y = TOP; y < LIP; y++) {
    const t = (y - TOP) / (LIP - TOP);
    const x0 = Math.round(TABLE_L + 14 * (1 - t));
    const x1 = Math.round(TABLE_R - 14 * (1 - t));
    for (let x = x0; x <= x1; x++) l.set(x, y, SLAB[2]);
  }
  // its front edge: a thick slab, the upper arris catching the light of what lies on it
  for (let y = LIP; y < LIP + 14; y++) {
    for (let x = TABLE_L; x <= TABLE_R; x++) {
      const c = y === LIP ? SLAB[4] : y === LIP + 1 ? SLAB[3] : y >= LIP + 12 ? SLAB[0] : SLAB[2];
      l.set(x, y, c);
    }
  }
  // (the ends of the slab are knocked off)
  for (const [x, dir] of [[TABLE_L, 1], [TABLE_R, -1]] as const) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++) l.erase(x + dir * i, LIP + j).erase(x + dir * i, LIP + 13 - j);
  }
  // the block it lies on: set back under the slab, in its shadow; big stones
  for (let y = LIP + 14; y < H; y++) {
    for (let x = TABLE_L + 16; x <= TABLE_R - 16; x++) {
      const joint = (x - CX + 2000) % 74 === 0 || (y - LIP - 14) % 30 === 29;
      l.set(x, y, y < LIP + 18 ? SLAB[0] : joint ? SLAB[0] : (Math.floor((x - CX + 2000) / 74) + Math.floor((y - LIP - 14) / 30)) % 2 ? SLAB[1] : mix(SLAB[1], SLAB[2], 0.45));
    }
  }
  return l;
}

/** The runes cut along the front edge of the slab: where each is, for the life. */
function edgeRunes(p: Px, runes: SmithRune[]): void {
  for (let n = -11; n <= 11; n++) {
    if (n === 0) continue;
    const x = CX + n * 22 - 2;
    const y = LIP + 4;
    const k = (n + 40) * 3;
    runeAt(p, k, x, y, 1, mix(CYAN[2], SLAB[2], 0.5));
    runes.push({ x: x + 2, y: y + 3, k, s: 1, near: 1 - Math.abs(n) / 14 });
  }
  // (and a diamond between two lines in the middle, under the word)
  p.line(CX - 5, LIP + 7, CX, LIP + 3, CYAN[2]).line(CX, LIP + 3, CX + 5, LIP + 7, CYAN[2]).line(CX - 5, LIP + 7, CX, LIP + 11, CYAN[2]).line(CX, LIP + 11, CX + 5, LIP + 7, CYAN[2]);
}

/** The light in the table's top: rings cut round where the word stands, seen almost edge on. */
function tableLight(p: Px): void {
  for (const [rx, ry, c] of [[214, 4.2, WORD[3]], [150, 3.4, WORD[2]], [92, 2.6, WORD[2]], [44, 1.8, WORD[1]]] as const) {
    for (let a = 0; a < 720; a++) {
      const t = (a / 720) * Math.PI * 2;
      // (broken rings: cut as strokes, not drawn as a line)
      if (Math.floor(a / 9) % 5 === 4) continue;
      const x = Math.round(CX + Math.cos(t) * rx);
      const y = Math.round(TOP + 5 + Math.sin(t) * ry);
      if (p.has(x, y) && y < LIP) p.set(x, y, c);
    }
  }
  // the pool the word stands in
  for (let y = TOP + 2; y < LIP - 1; y++) {
    const half = Math.round(22 - Math.abs(y - (TOP + 5)) * 5);
    for (let x = CX - half; x <= CX + half; x++) if (p.has(x, y)) p.set(x, y, Math.abs(x - CX) < half - 6 ? WORD[0] : WORD[1]);
  }
}

// ---------------------------------------------------------------------------------------------
// The word he is making: one great rune, standing in the air over the table.

/** Where the word stands: its middle. */
export const SMITH_WORD: Pt = [CX, TOP - 17];

/**
 * The word itself: a rune of his own making, bound of three (an arrow, a diamond, two feet), on a
 * grid 6 wide and 10 high.
 */
const BOUND: ReadonlyArray<readonly [number, number, number, number]> = [
  [3, 0, 3, 10],
  [3, 0, 1, 2], [3, 0, 5, 2],
  [3, 3, 0.5, 5.5], [0.5, 5.5, 3, 8], [3, 8, 5.5, 5.5], [5.5, 5.5, 3, 3],
  [3, 10, 1, 8.6], [3, 10, 5, 8.6],
];
const BOUND_S = 2.6;

/** The strokes of the word, each grown by `grow` pixels all round: on a layer, or dot by dot for the life. */
export function wordStrokes(put: (x: number, y: number) => void, grow: number): void {
  const [wx, wy] = SMITH_WORD;
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
  // its halo, then its strokes: cyan, then white at the heart
  for (const [grow, c] of [[3, WORD[4]], [2, WORD[3]], [1, WORD[2]]] as const) wordStrokes((x, y) => p.set(x, y, c), grow);
  wordStrokes((x, y) => p.set(x, y, WORD[0]), 0);
}

/** The rune in the ring at the head of his stave: which one, and how big. */
const RING_RUNE = { k: 6, s: 2 } as const;
/** The rune on the face of his hammer. */
const HAMMER_RUNE = { k: 0, s: 2 } as const;

// ---------------------------------------------------------------------------------------------
// The figure: THE OLD SKALD, number 12 of the wordsmiths he was shown ("12 for sure", 5 Oct 2026,
// 18:25; dev/options_wordsmith2.ts): white hair to his shoulders under a band of steel with a
// stone in it, a white beard down his chest, a brown pelt across his shoulders, a teal cloak, a
// tunic the blue of mail with leather on the forearms, and a stave cut with runes, a ring at its
// head with a rune alight in it.
//
// He is seen from low down and from in front, as the librarian was: his chin and his beard are
// nearer than his brow, what runs across him (the band, his brows) arches, and the light of the
// word is under him: it is the underside of everything that is bright.

type Tones = readonly string[];
const SKIN_T: Tones = ['#2a2056', '#40336f', '#5a4a8a', '#7868a6', '#9a8cc6', '#b8ace4', '#d8d0f8', '#dff6fc'];
const HAIR_T: Tones = ['#2c2460', '#3e3478', '#554a92', '#7468ae', '#9a8ecc', '#bcb2e6', '#dcd4f8', '#f0e8ff', '#e9fdff'];
const PELT_T: Tones = ['#24142f', '#371f45', '#4d2d5a', '#683f70', '#825a84', '#a0728e', '#be89a2'];
const CLOAK_T: Tones = ['#06202f', '#0a3044', '#0c4258', '#105a70', '#157a8c', '#28a0a8', '#3cc4c0'];
const MAIL_T: Tones = ['#161436', '#1b1840', '#201d4a', '#262255', '#2c2860', '#332f6c', '#3a3678', '#423e84', '#4a4690', '#57539c', '#6460a8', '#716db4'];
const HIDE_T: Tones = ['#1f0e27', '#301637', '#44204a', '#592c54', '#6e3a5c', '#8b4d6b', '#a8607a'];
const STEEL_T: Tones = ['#1e1a48', '#2e2a66', '#46408a', '#625cac', '#8a84d0', '#b4aeee', '#d6d0ff', '#f2f8ff'];

/** Shade a filled shape from tones that run dark to light: by how near the light each pixel is, and by whatever else `extra` says. */
function underlit(l: Px, tones: Tones, far: number, extra?: (x: number, y: number) => number): void {
  const n = tones.length;
  scan(l, (x, y) => {
    const v = 1 - reach(x, y, LX, LY) / far + (extra ? extra(x, y) : 0);
    return tones[Math.max(0, Math.min(n - 1, Math.floor(v * n)))];
  });
}

/** A limb: a thick line from one point to another, of one width at each end. */
function capsule(l: Px, x0: number, y0: number, x1: number, y1: number, r0: number, r1: number, c: string): void {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n;
    l.ellipse(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r0 + (r1 - r0) * t, r0 + (r1 - r0) * t, c);
  }
}

/**
 * THE FOUR MOMENTS. The owner, on seeing the first still (5 Oct 2026, 18:48): "can i get a few
 * more still options for the title screen first?". The same man at the same table from the same
 * low place, at four moments:
 *   keeper    the first one: his stave in one hand, the other on the table; he speaks, and the runes rise
 *   smith     a hammer raised over the word on the table; the fires burn higher and warm one side of him
 *   looming   both hands planted on the table, his shoulders up round his ears, leaning in over
 *             whoever looks up at him; the braziers are out and the word is the only light
 *   singer    the stave lifted, his other arm thrown wide, his mouth open: the word blazes, and
 *             the runes pour out of him
 */
export type SmithTake = 'keeper' | 'smith' | 'looming' | 'singer';
export const SMITH_TAKES: readonly SmithTake[] = ['keeper', 'smith', 'looming', 'singer'];

/** How he stands in a take, and how the room is lit for it. */
interface Rig {
  take: SmithTake;
  /** The row of his eyes: his head is hung from it. */
  ey: number;
  /** How far his shoulders are raised (hunched over the table). */
  rise: number;
  /** The ring at the head of the stave (its middle), and where its shaft meets the table: it leans if that is not under the ring. */
  ring: Pt;
  foot: Pt;
  /** The row of the fist that holds the stave; null if it only leans against his shoulder. */
  held: number | null;
  /** His other hand: planted on the table, a hammer raised in it, or flung out wide and open. */
  right: 'planted' | 'hammer' | 'out';
  /** His mouth is open. */
  open: boolean;
  /** The braziers: 0 = out, 1 = as they burn in the first picture. */
  fire: number;
  /** How much nearer the dark comes (0 = as in the first picture), and how much further the word's light reaches (1 = as there). */
  dark: number;
  bright: number;
}

const RIGS: Record<SmithTake, Rig> = {
  keeper: { take: 'keeper', ey: 165, rise: 0, ring: [CX - 106, 130], foot: [CX - 106, TOP + 3], held: 252, right: 'planted', open: false, fire: 1, dark: 0, bright: 1 },
  smith: { take: 'smith', ey: 165, rise: 0, ring: [CX - 106, 130], foot: [CX - 106, TOP + 3], held: 252, right: 'hammer', open: false, fire: 1.5, dark: 0, bright: 1 },
  looming: { take: 'looming', ey: 175, rise: 10, ring: [CX - 116, 128], foot: [CX - 102, TOP + 3], held: null, right: 'planted', open: false, fire: 0, dark: 1, bright: 0.8 },
  singer: { take: 'singer', ey: 162, rise: 0, ring: [CX - 124, 118], foot: [CX - 98, TOP + 3], held: 238, right: 'out', open: true, fire: 0.8, dark: 0, bright: 1.4 },
};

/** Where things of him are, for the life of the picture. */
export interface SmithMarks {
  take: SmithTake;
  /** His eyes: the middle of each. */
  eyes: readonly [Pt, Pt];
  /** The stone in the band on his brow. */
  stone: Pt;
  /** The ring at the head of the stave: its middle. */
  ring: Pt;
  /** His mouth, where the runes of the song leave him; and whether it is open in the picture already. */
  mouth: Pt;
  open: boolean;
  /** The palm of the hand flung out (the singer), and the face of the hammer (the smith): null where there is none. */
  palm: Pt | null;
  hammer: Pt | null;
  /** The middle of each brazier's bed of coals, and how high they burn (0 = out). */
  fires: ReadonlyArray<Pt>;
  fire: number;
}

/** Where the hammer is: the fist that holds it, and the middle of its head. */
const HAMMER_FIST: Pt = [CX + 112, 188];
const HAMMER_HEAD: Pt = [CX + 98, 136];
/** The hand flung out wide: the middle of its palm. */
const OUT_PALM: Pt = [CX + 132, 236];
/** Where a hand planted on the table is: the middle of its knuckles (on the side `s`). */
const plantedAt = (s: number): Pt => [CX + s * 80, TOP - 4];

function marksOf(r: Rig): SmithMarks {
  return {
    take: r.take,
    eyes: [[CX - 13, r.ey], [CX + 13, r.ey]],
    stone: [CX, r.ey - 16],
    ring: r.ring,
    mouth: [CX, r.ey + 28],
    open: r.open,
    palm: r.right === 'out' ? OUT_PALM : null,
    hammer: r.right === 'hammer' ? HAMMER_HEAD : null,
    fires: SMITH_FIRES,
    fire: r.fire,
  };
}

/** The column of the stave at a row. */
function staveX(r: Rig, y: number): number {
  const [rx, ry] = r.ring;
  const [fx, fy] = r.foot;
  return rx + ((fx - rx) * (y - ry)) / (fy - ry);
}

/** The cloak: behind all the rest of him, from his shoulders down past the table. */
function cloak(r: Rig): Px {
  const l = layer();
  const top = 224 - r.rise;
  l.poly([[CX - 96, top], [CX + 96, top], [CX + 124, TOP + 3], [CX - 124, TOP + 3]], INK);
  underlit(l, CLOAK_T, 250, (x, y) => {
    // (its folds fan out from the shoulders)
    const f = (x - CX) / (1 + (y - top) / 260);
    return Math.sin(f * 0.55) > 0.72 ? -0.16 : Math.sin(f * 0.55) < -0.86 ? 0.08 : 0;
  });
  return l;
}

/** The tunic over his chest. */
function tunic(r: Rig): Px {
  const l = layer();
  const top = 222 - r.rise;
  l.poly([[CX - 70, top], [CX + 70, top], [CX + 62, TOP + 3], [CX - 62, TOP + 3]], INK);
  underlit(l, MAIL_T, 215, (x, y) => (Math.abs(x - CX) > 54 ? -0.1 : 0) + (hash2(x >> 1, y >> 1, 69) < 0.1 ? -0.07 : 0));
  return l;
}

/** The pelt across his shoulders: thick fur, ragged below. */
function pelt(r: Rig): Px {
  const l = layer();
  const half = 100;
  for (let x = CX - half; x <= CX + half; x++) {
    const e = Math.abs(x - CX) / half;
    const top = Math.round(206 - r.rise + e * e * (20 + r.rise * 0.5));
    // (the lower edge hangs in tufts that come to points)
    const saw = Math.abs(((x + 400) % 11) - 5.5);
    const tuft = (5.5 - saw) * 1.3 + (hash2(Math.floor((x + 400) / 11), 3, 61) - 0.5) * 6;
    const bottom = Math.round(243 - e * e * 5 + tuft);
    for (let y = top; y <= bottom; y++) l.set(x, y, INK);
  }
  underlit(l, PELT_T, 215, (x, y) => {
    // (the lie of the fur: short strokes, dark and light, slanting away from the middle)
    const k = hash2((x + (x < CX ? y : -y) * 0.5) >> 1, y >> 2, 63);
    return (k < 0.22 ? -0.14 : k > 0.8 ? 0.11 : 0) - clamp01((216 - r.rise - y) / 12) * 0.12;
  });
  return l;
}

/** His hair: over the crown and down both sides of his face, onto the pelt, in locks that come to points. */
function hair(r: Rig): Px {
  const l = layer();
  const EY = r.ey;
  l.ellipse(CX, EY - 1, 36, 31, INK);
  for (let y = EY - 3; y <= EY + 86; y++) {
    const outer = 35 + (y - EY + 3) * 0.13 + Math.sin(y * 0.21) * 1.6;
    for (let x = Math.round(CX - outer); x <= Math.round(CX + outer); x++) {
      // (each lock is seven pixels wide, of a length of its own, and narrows to its end)
      const lock = Math.floor((x - CX + 700) / 7);
      const mid = lock * 7 + 3 - 700 + CX;
      const end = EY + 62 + hash2(lock, 5, 65) * 20 - Math.abs(x - mid) * 2.4;
      if (y > end) continue;
      l.set(x, y, INK);
    }
  }
  underlit(l, HAIR_T, 250, (x, y) => {
    let k: number;
    if (y < EY - 8) {
      // (over the crown it is combed back from a parting: the strands fan out from the middle of his brow)
      const a = Math.atan2(y - (EY + 2), x - CX);
      k = Math.floor((a + Math.PI) * 14 + 400);
    } else {
      // (down the sides it falls in strands that wave)
      k = x + Math.round(Math.sin(y * 0.1 + x * 0.25) * 1.6) + 400;
    }
    const strand = k % 5 === 0 ? -0.15 : k % 5 === 2 ? 0.05 : 0;
    // (the top of his head is turned away from the light)
    return strand - clamp01((EY - 6 - y) / 30) * 0.24;
  });
  // the parting
  for (let y = EY - 30; y < EY - 16; y++) if (l.has(CX, y)) l.set(CX, y, HAIR_T[1]);
  return l;
}

/** His face: what of it shows between the band and the beard. */
function face(r: Rig): Px {
  const l = layer();
  const EY = r.ey;
  l.ellipse(CX, EY + 8, 26, 30, INK);
  underlit(l, SKIN_T, 270, (x, y) => {
    const dx = Math.abs(x - CX);
    let v = 0;
    // the brow, above his eyes, is turned away from the light; the hollows of his eyes are not
    if (y < EY - 5) v -= 0.14;
    // the apples of his cheeks
    const cheek = Math.hypot((dx - 16) * 0.85, y - (EY + 11));
    if (cheek < 7.5) v += 0.22 - cheek * 0.02;
    // the shadow each cheek throws up toward the temple
    if (dx > 19 && y < EY + 5) v -= 0.12;
    return v;
  });
  // --- the nose: long, broad at the nostrils, and we see under it ---
  for (let y = EY - 5; y <= EY + 17; y++) {
    const t = (y - EY + 5) / 22;
    const half = Math.round(2.8 + t * 5.4);
    for (let x = CX - half; x <= CX + half; x++) {
      const side = Math.abs(x - CX) >= half;
      l.set(x, y, y >= EY + 16 ? SKIN_T[7] : side ? SKIN_T[t > 0.5 ? 3 : 2] : Math.abs(x - CX) <= 1 && t > 0.3 ? SKIN_T[6] : SKIN_T[t > 0.6 ? 6 : 5]);
    }
  }
  l.rect(CX - 7, EY + 14, 4, 3, SKIN_T[0]).rect(CX + 4, EY + 14, 4, 3, SKIN_T[0]);
  l.hline(CX - 8, EY + 18, 17, SKIN_T[2]);
  // --- the hollows of the eyes, and the eyes: two lights ---
  for (const ex of [CX - 13, CX + 13]) {
    const ey = EY;
    const s = ex < CX ? -1 : 1;
    l.rect(ex - 7, ey - 3, 14, 7, SKIN_T[1]);
    l.rect(ex - 6, ey - 2, 12, 5, INK);
    l.rect(ex - 3, ey - 1, 6, 3, CYAN[2]).rect(ex - 2, ey - 2, 4, 5, CYAN[2]);
    l.rect(ex - 2, ey - 1, 4, 3, SPARK[3]);
    l.rect(ex - 1, ey - 1, 2, 2, SPARK[4]);
    // (the lower lid, lit from below; the crow's foot at the corner)
    l.hline(ex - 6, ey + 3, 12, SKIN_T[5]).hline(ex - 4, ey + 4, 8, SKIN_T[4]);
    l.set(ex + s * 8, ey + 1, SKIN_T[1]).set(ex + s * 9, ey + 2, SKIN_T[1]).set(ex + s * 9, ey - 1, SKIN_T[1]);
  }
  // --- the lines of his face: between the brows, and down from the nose past the mouth ---
  l.vline(CX - 2, EY - 9, 5, SKIN_T[1]).vline(CX + 2, EY - 9, 5, SKIN_T[1]);
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) l.set(CX + s * (10 + i), EY + 15 + i, SKIN_T[2]);
  return l;
}

/** His brows: white, heavy, drawn down in the middle (and lower still when he leans in over you). */
function brows(r: Rig): Px {
  const l = layer();
  const stern = r.take === 'looming' ? 0.34 : r.take === 'singer' ? 0.08 : 0.2;
  for (const s of [-1, 1]) {
    for (let i = 0; i <= 19; i++) {
      const x = CX + s * (4 + i);
      const y = Math.round(r.ey - 4.5 + (r.take === 'looming' ? 1.5 : 0) - i * stern + (i > 14 ? (i - 14) * 0.9 : 0));
      l.set(x, y, HAIR_T[8]).set(x, y - 1, HAIR_T[i % 3 === 0 ? 5 : 7]).set(x, y - 2, HAIR_T[i % 4 === 1 ? 6 : 5]);
      if (i > 2 && i < 15) l.set(x, y - 3, HAIR_T[4]);
    }
  }
  return l;
}

/** The band of steel on his brow, and the stone in it. */
function circlet(r: Rig): Px {
  const l = layer();
  const EY = r.ey;
  for (let x = CX - 34; x <= CX + 34; x++) {
    const e = (x - CX) / 34;
    // (seen from below it arches: its middle is the nearest part of it)
    const y0 = Math.round(EY - 12 - 5.5 * (1 - e * e));
    for (let j = 0; j < 7; j++) l.set(x, y0 + j, STEEL_T[j === 0 ? 1 : j === 6 ? 7 : j === 5 ? 5 : Math.abs(e) > 0.78 ? 2 : j === 1 ? 4 : 3]);
    // (studs along it)
    if (Math.abs(x - CX) > 9 && (x - CX + 60) % 9 === 0) l.rect(x, y0 + 2, 2, 2, STEEL_T[6]).set(x + 1, y0 + 4, STEEL_T[1]);
  }
  const sx = CX;
  const sy = EY - 16;
  l.rect(sx - 6, sy - 5, 13, 12, STEEL_T[1]);
  l.rect(sx - 5, sy - 4, 11, 10, STEEL_T[5]);
  l.rect(sx - 4, sy - 3, 9, 8, CYAN[0]);
  l.rect(sx - 3, sy - 2, 7, 6, CYAN[2]);
  l.rect(sx - 2, sy - 2, 3, 3, SPARK[3]).set(sx - 2, sy - 2, SPARK[4]);
  return l;
}

/** The last row of his beard: its point, over the word. */
const BEARD_TIP = TOP - 32;

/** His beard: from his cheeks down his chest to a point, in long strands; and the moustache over it. */
function beard(r: Rig): Px {
  const l = layer();
  const EY = r.ey;
  const top = EY + 13;
  const full = EY + 44;
  /** How wide it is, either side of the middle, at a row. */
  const halfAt = (y: number): number => (y < full ? 28 + ((y - top) / (full - top)) * 8 : Math.max(0, 36 * (1 - ((y - full) / (BEARD_TIP - full)) ** 1.3)));
  for (let y = top; y <= BEARD_TIP; y++) {
    const half = halfAt(y);
    for (let x = Math.round(CX - half); x <= Math.round(CX + half); x++) {
      // (under the nose and between the cheeks it begins lower: the face shows there)
      if (y < top + 8 && Math.abs(x - CX) < 17 - (y - top) * 1.2) continue;
      l.set(x, y, INK);
    }
  }
  underlit(l, HAIR_T, 200, (x, y) => {
    const half = Math.max(1, halfAt(y));
    const u = (x - CX) / half;
    // (strands that run together toward the point; its edges turn away from the light)
    const k = (u + 1) * 6.5 + Math.sin(y * 0.07) * 0.3;
    const f = k - Math.floor(k);
    const strand = f < 0.15 ? -0.16 : f > 0.8 ? 0.07 : 0;
    return strand - Math.abs(u) ** 3 * 0.2 - clamp01((full - 6 - y) / 26) * 0.12;
  });
  const mx = CX;
  const my = EY + 28;
  if (r.open) {
    // his mouth is open: the dark of it, his lower teeth, and the lip under them catching the light
    l.rect(mx - 8, my - 1, 16, 9, HAIR_T[0]);
    l.rect(mx - 7, my, 14, 7, INK);
    l.hline(mx - 5, my + 6, 10, SKIN_T[6]);
    l.hline(mx - 6, my + 8, 12, SKIN_T[5]);
  } else {
    // the mouth: a dark line under the moustache, and the lower lip catching the light
    l.rect(mx - 7, my - 1, 14, 3, HAIR_T[0]);
    l.hline(mx - 5, my + 2, 10, SKIN_T[5]);
  }
  // the moustache: two wings from under the nose, drooping past the corners of the mouth
  for (const s of [-1, 1]) {
    for (let i = 0; i <= 31; i++) {
      const t = i / 31;
      const x = CX + s * (1 + i * 0.95);
      const y = EY + 21 + t * t * 18;
      const w = 4.4 - t * 2.7;
      for (let j = -Math.ceil(w); j <= Math.ceil(w); j++) {
        if (Math.abs(j) > w) continue;
        l.set(Math.round(x), Math.round(y + j), j > w - 1.3 ? HAIR_T[8] : j < -w + 1.3 ? HAIR_T[4] : HAIR_T[i % 4 === 3 ? 5 : 6]);
      }
    }
  }
  return l;
}

/** The stave: a shaft cut with runes, and at its head a ring of steel. (The rune in the ring is the life's.) */
function stave(r: Rig): Px {
  const l = layer();
  const [rx, ry] = r.ring;
  for (let y = ry + 13; y <= r.foot[1]; y++) {
    const cx = Math.round(staveX(r, y));
    for (let i = -3; i <= 3; i++) l.set(cx + i, y, HIDE_T[i === 3 ? 6 : i === -3 ? 1 : i >= 1 ? 5 : i === -2 ? 2 : 4]);
    // (bands of steel under the ring; rune marks cut down it)
    if (y < ry + 26 && (y - ry) % 5 < 2) l.hline(cx - 4, y, 9, STEEL_T[(y - ry) % 5 === 0 ? 6 : 3]);
    if (y > ry + 32 && (y - ry) % 15 === 0) l.set(cx - 1, y, CYAN[2]).set(cx, y + 1, CYAN[2]).set(cx + 1, y + 2, CYAN[2]).set(cx - 1, y + 4, CYAN[2]).set(cx, y + 4, CYAN[2]);
  }
  // the ring: seen from below, its lower limb is the brighter
  for (let y = ry - 17; y <= ry + 17; y++) {
    for (let x = rx - 17; x <= rx + 17; x++) {
      const d = Math.hypot(x + 0.5 - rx, y + 0.5 - ry);
      if (d > 16 || d < 9.5) continue;
      const a = (y - ry) / 16;
      l.set(x, y, STEEL_T[d > 14.8 ? (a > 0.3 ? 6 : 3) : d < 10.8 ? (a < -0.3 ? 5 : 2) : a > 0.5 ? 5 : a < -0.5 ? 2 : 4]);
    }
  }
  return l;
}

/** One arm: from the shoulder to the elbow in the tunic's sleeve, from the elbow to the wrist in leather. */
function arm(sh: Pt, el: Pt, wr: Pt): Px {
  const l = layer();
  capsule(l, sh[0], sh[1], el[0], el[1], 15, 13, INK);
  underlit(l, MAIL_T, 210, (x, y) => (hash2(x >> 1, y >> 1, 67) < 0.14 ? -0.1 : 0));
  const f = layer();
  capsule(f, el[0], el[1], wr[0], wr[1], 12.5, 9, INK);
  underlit(f, HIDE_T, 185);
  // (the straps of the bracer)
  const d = Math.hypot(wr[0] - el[0], wr[1] - el[1]) || 1;
  const ux = (wr[0] - el[0]) / d;
  const uy = (wr[1] - el[1]) / d;
  for (const at of [0.3, 0.58, 0.86]) {
    for (let k = -14; k <= 14; k++) {
      for (const w of [0, 1]) {
        const x = Math.round(el[0] + ux * (d * at + w) - uy * k);
        const y = Math.round(el[1] + uy * (d * at + w) + ux * k);
        if (f.has(x, y)) f.set(x, y, HIDE_T[w ? 1 : 5]);
      }
    }
  }
  over(l, f);
  return l;
}

/** A fist round a shaft at (x, y): four fingers lying across it, the thumb beside them. */
function fist(x: number, y: number): Px {
  const l = layer();
  for (let i = 0; i < 4; i++) {
    const fy = y - 9 + i * 6;
    l.rect(x - 9, fy, 18, 5, INK);
    l.set(x - 9, fy, null).set(x + 8, fy, null).set(x - 9, fy + 4, null).set(x + 8, fy + 4, null);
  }
  l.rect(x - 11, y - 6, 4, 18, INK);
  underlit(l, SKIN_T, 175);
  for (let i = 1; i < 4; i++) l.hline(x - 8, y - 10 + i * 6, 17, SKIN_T[1]);
  // (the knuckles, toward us, catch the light from under them)
  for (let i = 0; i < 4; i++) l.hline(x - 6, y - 5 + i * 6, 12, SKIN_T[6]);
  return l;
}

/**
 * A hand planted on the table: its fingers come toward us and hang over the edge, as the
 * librarian's did on her desk. It is in the full light of the table's top. `s`: which side of him
 * it is on (its thumb is toward the word).
 */
function planted(s: number): Px {
  const l = layer();
  const [hx, hy] = plantedAt(s);
  // the back of the hand
  l.poly([[hx - 14, hy - 12], [hx + 14, hy - 13], [hx + 17, hy + 1], [hx - 16, hy + 1]], INK);
  // four fingers, the outer ones shorter; the thumb, out to the side nearer the word
  for (const [dx, len] of [[-12, 9], [-4, 12], [4, 12], [12, 9]] as const) {
    l.rect(hx + dx - 3, hy - 1, 7, len, INK);
    l.rect(hx + dx - 2, hy + len - 1, 5, 1, INK);
  }
  capsule(l, hx - s * 15, hy - 8, hx - s * 25, hy + 3, 4, 3.2, INK);
  underlit(l, SKIN_T, 150, (x, y) => (y < hy - 6 ? -0.12 : 0));
  // (the knuckles; the gaps between the fingers; the nails)
  for (const dx of [-12, -4, 4, 12]) {
    l.hline(hx + dx - 2, hy, 5, SKIN_T[7]);
    l.rect(hx + dx - 1, hy + (Math.abs(dx) > 8 ? 5 : 8), 3, 2, SKIN_T[6]);
  }
  for (const dx of [-8, 0, 8]) l.vline(hx + dx, hy - 1, 9, SKIN_T[1]);
  return l;
}

/** The hammer, raised: a short thick handle from his fist to a block of a head, a rune cut in the face it shows us. */
function hammer(): Px {
  const l = layer();
  const [fx, fy] = HAMMER_FIST;
  const [hx, hy] = HAMMER_HEAD;
  const d = Math.hypot(hx - fx, hy - fy);
  const ux = (hx - fx) / d;
  const uy = (hy - fy) / d;
  // the handle: from a little under the fist to the head
  const handle = layer();
  capsule(handle, fx - ux * 12, fy - uy * 12, hx, hy, 3.4, 3.2, INK);
  underlit(handle, HIDE_T, 260, (x) => (x - (fx + hx) / 2 > 1 ? 0.1 : -0.06));
  over(l, handle);
  // the head: a block across the handle, longer than it is thick; we see its face, and from below, its underside
  const head = layer();
  const nx = -uy;
  const ny = ux;
  const corner = (a: number, b: number): Pt => [hx + nx * a + ux * b, hy + ny * a + uy * b];
  head.poly([corner(-24, -13), corner(24, -13), corner(24, 13), corner(-24, 13)], INK);
  scan(head, (x, y) => {
    const a = (x - hx) * nx + (y - hy) * ny;
    const b = (x - hx) * ux + (y - hy) * uy;
    // (its two striking faces are worn bright; the side turned down to the word is the lightest)
    if (Math.abs(a) > 19) return STEEL_T[b < -7 ? 7 : b < 5 ? 6 : 4];
    return STEEL_T[b < -10 ? 6 : b < -5 ? 5 : b > 9 ? 2 : Math.abs(a) > 17 ? 2 : 3];
  });
  over(l, head);
  return l;
}

/**
 * The hand held out wide, palm up, as a man holds out a thing he has made: we are under it, so it
 * is the back of the hand we see, the fingers reaching away from him and curling up at their ends.
 */
function flung(): Px {
  const l = layer();
  const [px, py] = OUT_PALM;
  for (const [deg, len, w] of [[52, 12, 2.8], [30, 16, 3.1], [10, 17, 3.1], [-10, 14, 2.8]] as const) {
    const a = (deg * Math.PI) / 180;
    const kx = px + Math.cos(a) * (8 + len);
    const ky = py - Math.sin(a) * (8 + len) * 0.7;
    capsule(l, px + Math.cos(a) * 6, py - Math.sin(a) * 4, kx, ky, w + 0.4, w, INK);
    // (the last joint of each finger curls up)
    capsule(l, kx, ky, kx + 2, ky - 6, w, w - 0.8, INK);
  }
  capsule(l, px - 6, py - 3, px - 12, py - 13, 3.4, 2.6, INK);
  l.ellipse(px, py, 11, 7, INK);
  underlit(l, SKIN_T, 200, (x, y) => (y > py + 1 ? 0.16 : y < py - 6 ? -0.08 : 0));
  // (the knuckles, in a row across the back of it)
  for (const dx of [3, 7, 11]) l.set(px + dx, py - 2, SKIN_T[2]).set(px + dx, py - 1, SKIN_T[2]);
  return l;
}

/**
 * All of him: `body` is the figure, behind the table; `shade` is the parts whose shadow falls on
 * the wall behind him; `front` is what comes over the table's edge (a hand, or both).
 */
function skald(r: Rig): { body: Px; shade: Px[]; front: Px } {
  const body = layer();
  const front = layer();
  const shade: Px[] = [];
  const put = (part: Px, shadow = true): void => {
    over(body, part);
    if (shadow) shade.push(part);
  };
  const shY = 236 - r.rise;
  // (a stave he is not holding stands behind him and leans on his shoulder)
  if (r.held === null) put(stave(r), false);
  put(cloak(r));
  put(tunic(r));
  // --- his arms ---
  if (r.held !== null) {
    // the arm that holds the stave: down from the shoulder and up again to the fist
    const fx = staveX(r, r.held);
    put(arm([CX - 80, shY], [fx + 34, Math.max(r.held + 30, 280)], [fx + 5, r.held + 6]));
  } else {
    put(arm([CX - 80, shY], [CX - 104, 264], [plantedAt(-1)[0] - 2, plantedAt(-1)[1] - 12]));
  }
  if (r.right === 'planted') put(arm([CX + 80, shY], [CX + 104, 264], [plantedAt(1)[0] + 2, plantedAt(1)[1] - 12]));
  else if (r.right === 'hammer') put(arm([CX + 82, shY - 2], [CX + 126, 222], [HAMMER_FIST[0] + 2, HAMMER_FIST[1] + 6]));
  else put(arm([CX + 82, shY - 2], [CX + 104, 262], [OUT_PALM[0] - 12, OUT_PALM[1] + 4]));
  put(pelt(r));
  put(hair(r));
  put(face(r));
  put(brows(r));
  put(circlet(r));
  put(beard(r));
  if (r.held !== null) {
    put(stave(r), false);
    put(fist(Math.round(staveX(r, r.held)), r.held));
  }
  if (r.right === 'hammer') {
    put(hammer(), false);
    put(fist(HAMMER_FIST[0], HAMMER_FIST[1]));
  } else if (r.right === 'out') put(flung());
  // --- what comes over the table's edge ---
  if (r.held === null) over(front, planted(-1));
  if (r.right === 'planted') over(front, planted(1));
  return { body, shade, front };
}

/** A warm edge on the side of him a fire is on: the outermost pixels of the figure there are mixed toward the fire's colour. */
function rimWarm(l: Px, side: number, amount: number): void {
  if (amount <= 0) return;
  const to = rgba(EMBER[2]);
  const d = l.d;
  for (let y = 150; y < TOP; y++) {
    let seen = 0;
    for (let k = 0; k < W && seen < 3; k++) {
      const x = side < 0 ? k : W - 1 - k;
      const i = (y * W + x) * 4;
      if (d[i + 3] === 0) continue;
      // (only where the figure's own edge is: not through the middle of him)
      if (Math.abs(x - CX) < 60) break;
      toward(d, i, to, amount * (seen === 0 ? 1 : seen === 1 ? 0.6 : 0.3));
      seen++;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The picture

export interface SmithTitle {
  w: number;
  h: number;
  /** The row of the table's edge; how far above the bottom of the screen that row is put; the row of the top of his head (ui/panels.ts lays the screen out from these). */
  lip: number;
  lift: number;
  headTop: number;
  /** Which of the four moments it is. */
  take: SmithTake;
  /** The picture, with nothing moving in it. */
  still: HTMLCanvasElement;
  /**
   * The small life of the picture at time `t` (seconds), on a see-through sheet as big as the
   * picture, to be drawn over it. The sheet is the same one each call: draw it before asking again.
   */
  life(t: number): HTMLCanvasElement;
}

/** What the life needs to know of a picture. */
export interface SmithScene {
  runes: SmithRune[];
  marks: SmithMarks;
}

export function paintSmith(take: SmithTake = 'keeper'): { px: Px; scene: SmithScene } {
  const r = RIGS[take];
  const runes: SmithRune[] = [];
  const pic = layer();
  // --- the wall, and what stands against it ---
  const back = layer();
  wall(back);
  const stones = layer();
  menhir(stones, 30, 138, 22, 5, 1, 3, 0.25, runes);
  menhir(stones, W - 30, 132, 23, -4, -1, 5, 0.25, runes);
  menhir(stones, CX - 160, 70, 29, 7, 1, 7, 0.7, runes);
  menhir(stones, CX + 158, 78, 30, -6, -1, 11, 0.7, runes);
  for (const [fx, fy] of SMITH_FIRES) brazier(stones, fx, fy, r.fire > 0);
  // --- the figure ---
  const { body: figure, shade, front } = skald(r);
  // --- the light on all that ---
  gloom(back, LX, LY, 40 - r.dark * 22, 330 - r.dark * 110, NIGHT, 0.97 + r.dark * 0.02, 16);
  glow(back, LX, LY, 210 * r.bright, CYAN[0], 0.42 * Math.min(1.3, r.bright), 7);
  wallShadow(back, shade, LX, LY + 40, 1.36, NIGHT, 0.5);
  if (r.fire > 0) for (const [fx, fy] of SMITH_FIRES) glow(back, fx, fy - 10, 92 + (r.fire - 1) * 50, EMBER[0], Math.min(0.62, 0.46 * r.fire), 9);
  gloom(stones, LX, LY, 110 - r.dark * 50, 400 - r.dark * 130, NIGHT, 0.9 + r.dark * 0.06, 14);
  glow(stones, LX, LY, 260 * r.bright, CYAN[2], 0.2 * r.bright, 6);
  if (r.fire > 0) for (const [fx, fy] of SMITH_FIRES) glow(stones, fx, fy - 6, 64 + (r.fire - 1) * 40, EMBER[1], Math.min(0.55, 0.4 * r.fire), 7);
  if (r.dark > 0) gloom(figure, LX, LY, 60, 250, NIGHT, 0.5 * r.dark, 10);
  if (r.bright > 1) glow(figure, LX, LY, 150, WORD[1], 0.16 * (r.bright - 1) * 2.5, 5);
  // (the fires warm the side of him each is on: both a little, and the smith's nearer one a good deal)
  rimWarm(figure, -1, 0.3 * r.fire + (take === 'smith' ? 0.25 : 0));
  rimWarm(figure, 1, 0.3 * r.fire);
  pic.blit(back, 0, 0);
  over(pic, stones);
  pic.blit(figure, 0, 0);
  // --- the table, and the word ---
  const slab = table();
  gloom(slab, LX, LIP - 6, 60 - r.dark * 20, 330 - r.dark * 90, NIGHT, 0.9, 12);
  tableLight(slab);
  edgeRunes(slab, runes);
  over(pic, slab);
  if (r.dark > 0) gloom(front, LX, LY, 80, 260, NIGHT, 0.3 * r.dark, 8);
  over(pic, front);
  const lit = layer();
  word(lit);
  // (the rune in the ring of his stave, and on his hammer: alight, not blazing, when nothing moves)
  runeAt(lit, RING_RUNE.k, r.ring[0] - 2 * RING_RUNE.s, r.ring[1] - 3 * RING_RUNE.s, RING_RUNE.s, WORD[2], 2);
  if (r.right === 'hammer') runeAt(lit, HAMMER_RUNE.k, HAMMER_HEAD[0] - 2 * HAMMER_RUNE.s - 1, HAMMER_HEAD[1] - 3 * HAMMER_RUNE.s, HAMMER_RUNE.s, WORD[2], 2);
  pic.blit(lit, 0, 0);
  // --- the edges of the picture go to black: a screen wider or taller than it shows no edge ---
  const night = rgba(NIGHT);
  for (let y = 0, i = 0; y < H; y++) {
    for (let x = 0; x < W; x++, i += 4) {
      const ex = Math.min(x, W - 1 - x);
      const t = Math.max(clamp01(1 - ex / 26), clamp01(1 - y / 30));
      const q = band(t, 6) / 6;
      if (q > 0) toward(pic.d, i, night, q);
    }
  }
  return { px: pic, scene: { runes, marks: marksOf(r) } };
}

// ---------------------------------------------------------------------------------------------
// The life in the picture
//
// (The owner: "Same sort of living style.") Small things that move, drawn over the still picture:
// the word on the table breathes and throws sparks; runes leave his mouth and rise, as they do
// from the skald he chose; the runes cut in the stones and along the table's edge light one after
// another; the rune in the ring of his stave burns up and dies down; his eyes blink; the stone on
// his brow catches the light; the braziers burn; motes drift through the light.
//
// As in the picture this replaces (title.ts, "The life in the pictures"), nothing is remembered
// from one frame to the next: every dot is worked out from the time alone, so the life cannot
// drift or pile up, and most of it moves in steps of about a tenth of a second, like hand-drawn
// animation: a pixel that changes sixty times a second is noise, not a flame.

/** Draws one dot of the life: the pixel (x, y) of the picture, or a block `w` wide and `h` high from there, in one colour, as strongly as `a` says (1 = solid). */
export type SmithDot = (x: number, y: number, color: string, a: number, w?: number, h?: number) => void;

const frac = (v: number): number => v - Math.floor(v);
/** 0 at the ends of 0..1 and 1 in the middle, eased. */
const swell = (u: number): number => Math.sin(clamp01(u) * Math.PI) ** 2;

/** One tongue of flame, as dots: a teardrop standing on `base`, its tip leaning. */
function tongue(put: SmithDot, cx: number, base: number, h: number, w: number, leanTo: number): void {
  for (let i = 0; i < h; i++) {
    const t = i / Math.max(1, h - 1);
    const hw = Math.max(0.5, w * Math.sin(Math.PI * (0.25 + t * 0.75)) ** 0.8 * (1 - t * 0.3));
    const m = cx + leanTo * t * t;
    for (let x = Math.floor(m - hw); x < Math.ceil(m + hw); x++) {
      const d = Math.abs(x + 0.5 - m) / hw;
      if (d > 1) continue;
      put(x, base - i, d < 0.45 && t < 0.45 ? EMBER[4] : d < 0.75 && t < 0.72 ? EMBER[3] : t < 0.9 ? EMBER[2] : EMBER[1], 1);
    }
  }
}

/** The strokes of a small rune, as dots. */
function runeDots(put: SmithDot, k: number, x: number, y: number, s: number, c: string, a: number, fat = 1): void {
  for (const [p0, q0, p1, q1] of RUNES[((k % RUNES.length) + RUNES.length) % RUNES.length]) {
    const n = Math.ceil(Math.max(Math.abs(p1 - p0), Math.abs(q1 - q0)) * s);
    for (let i = 0; i <= n; i++) put(Math.round(x + (p0 + ((p1 - p0) * i) / Math.max(1, n)) * s), Math.round(y + (q0 + ((q1 - q0) * i) / Math.max(1, n)) * s), c, a, fat, 1);
  }
}

/** Everything that moves, at time `t`, as dots. */
export function smithLife(t: number, scene: SmithScene, put: SmithDot): void {
  const { runes, marks } = scene;
  const take = marks.take;
  // (time in steps of a tenth of a second, for what should move like drawn animation)
  const step = Math.floor(t * 10);
  const [wx, wy] = SMITH_WORD;

  // --- the braziers: three tongues each, and a spark now and then ---
  if (marks.fire > 0) {
    marks.fires.forEach(([fx, fy], n) => {
      const f = Math.floor(t * 8 + n * 3);
      const high = 0.7 + 0.3 * marks.fire;
      for (let k = 0; k < 3; k++) {
        const h1 = hash2(f, k, 71 + n);
        const h2 = hash2(f, k, 73 + n);
        tongue(put, fx + (k - 1) * 8 + Math.round((h1 - 0.5) * 3), fy - 2, Math.round(((k === 1 ? 24 : 13) + h2 * 8) * high), (k === 1 ? 7 : 4.2) * Math.min(1.2, high), (h1 - 0.5) * 9);
      }
      for (let k = 0; k < 3; k++) {
        const u = frac(t * 0.5 + k / 3 + n * 0.41);
        if (u > 0.7) continue;
        put(Math.round(fx + (hash2(Math.floor(t * 0.5 + k / 3 + n * 0.41), k, 75) - 0.5) * 22 + Math.sin(u * 9 + k) * 3), Math.round(fy - 26 - u * 60), u < 0.3 ? EMBER[4] : EMBER[3], 1 - u / 0.7);
      }
    });
  }

  // --- the runes cut in the stones and the table: a light runs through them, one after another ---
  // (while he sings, all of them burn, and the light that runs through them is white)
  runes.forEach((r, j) => {
    const fat = r.s >= 2 ? 2 : 1;
    if (take === 'singer') runeDots(put, r.k, r.x - 2 * r.s, r.y - 3 * r.s, r.s, WORD[2], 0.5 + 0.3 * r.near, fat);
    const u = frac(t * 0.16 - j * 0.047);
    if (u > 0.18) return;
    const a = swell(u / 0.18) * (0.55 + 0.45 * r.near);
    runeDots(put, r.k, r.x - 2 * r.s, r.y - 3 * r.s, r.s, take === 'singer' ? WORD[0] : WORD[1], a, fat);
    // (and the stone round it glows)
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) runeDots(put, r.k, r.x - 2 * r.s + ox * fat, r.y - 3 * r.s + oy, r.s, WORD[2], a * 0.25, fat);
  });

  // --- the rune in the ring of his stave (and on his hammer): it burns up and dies down ---
  {
    const [rx, ry] = marks.ring;
    const { k, s } = RING_RUNE;
    const a = take === 'singer' ? 1 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.3));
    runeDots(put, k, rx - 2 * s, ry - 3 * s, s, WORD[0], a * 0.9, 2);
    for (const [ox, oy] of [[-1, 0], [2, 0], [0, -1], [0, 1]] as const) runeDots(put, k, rx - 2 * s + ox, ry - 3 * s + oy, s, WORD[2], a * 0.3, 1);
    if (marks.hammer) {
      const [hx, hy] = marks.hammer;
      const b = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.9 + 1));
      runeDots(put, HAMMER_RUNE.k, hx - 2 * HAMMER_RUNE.s - 1, hy - 3 * HAMMER_RUNE.s, HAMMER_RUNE.s, WORD[0], b, 2);
    }
  }

  // --- the word: it breathes, and every so often it flares (under the hammer, often) ---
  {
    const breath = 0.5 + 0.5 * Math.sin(t * 2.1);
    const flare = take === 'smith' ? swell(frac(t / 2.6) / 0.16) : take === 'singer' ? 0.6 + 0.4 * breath : swell(frac(t / 7.5) / 0.09);
    // (its halo swells and sinks round it; the rune itself is laid over that again, so that it stays a rune)
    wordStrokes((x, y) => put(x, y, WORD[3], 0.2 + breath * 0.3 + flare * 0.5), 5);
    wordStrokes((x, y) => put(x, y, WORD[4], 1), 3);
    wordStrokes((x, y) => put(x, y, flare > 0.3 ? WORD[2] : WORD[3], 1), 2);
    wordStrokes((x, y) => put(x, y, flare > 0.3 ? WORD[1] : WORD[2], 1), 1);
    wordStrokes((x, y) => put(x, y, WORD[0], 1), 0);
    // sparks: they leave the word and the table round it, rise, and go out
    const many = take === 'smith' ? 26 : take === 'singer' ? 22 : take === 'looming' ? 9 : 16;
    for (let k = 0; k < many; k++) {
      const period = (take === 'smith' ? 1.3 : 2.4) + hash2(k, 1, 77) * 2.2;
      const age = t / period + hash2(k, 2, 77);
      const turn = Math.floor(age);
      const u = age - turn;
      const x0 = wx + (hash2(turn, k, 79) - 0.5) * (take === 'smith' ? 70 : 120);
      const high = 70 + hash2(turn, k, 81) * 90;
      // (struck sparks fly out sideways as well as up)
      const out = take === 'smith' ? (x0 - wx) * u * 1.6 : (x0 - wx) * u * 0.25;
      const x = Math.round(x0 + Math.sin(u * 5 + k) * 5 + out);
      const y = Math.round(TOP - 2 - u ** 0.8 * high * (take === 'smith' ? 0.75 : 1));
      const a = (1 - u) ** 1.4;
      put(x, y, u < 0.18 ? WORD[0] : u < 0.5 ? WORD[1] : WORD[2], a);
      if (u < 0.35) put(x, y + 1, WORD[2], a * 0.5);
    }
  }

  // --- the song: runes leave his mouth one after another and rise, each fainter as it goes ---
  if (take === 'keeper' || take === 'singer') {
    const [mx, my] = marks.mouth;
    const SONG = take === 'singer' ? 3.6 : 5.2;
    const voices = take === 'singer' ? 7 : 4;
    for (let k = 0; k < voices; k++) {
      const age = t / SONG + k / voices;
      const turn = Math.floor(age);
      const u = age - turn;
      // (it comes out of his mouth a mote of light, swings out past his beard and his hair, and opens into a rune as it climbs)
      const side = take === 'singer' && k % 2 === 1 ? -1 : 1;
      const x = mx + side * (10 + u * 100 + Math.sin(u * 6 + k * 2) * 4);
      const y = my - u ** 1.1 * (take === 'singer' ? 104 : 90) + (take === 'singer' ? 4 : 0);
      const a = (1 - u) ** 1.2;
      const kind = turn * voices + k * 5;
      if (u < 0.36) put(Math.round(x), Math.round(y) + 2, WORD[0], 1, 2, 2);
      else runeDots(put, kind, Math.round(x) - (side < 0 ? 8 : 0), Math.round(y), 2, u < 0.5 ? WORD[0] : u < 0.75 ? WORD[1] : WORD[2], a, 2);
      // (as each leaves him his mouth is open on the dark)
      if (u < 0.06 && !marks.open) put(mx - 6, my - 1, HAIR_T[0], 1, 12, 5);
    }
    // (and from the palm of the hand he has flung out, a rune stands and turns over)
    if (marks.palm) {
      const [px, py] = marks.palm;
      const u = frac(t / 2.4);
      const ry = py - 38 - Math.round(Math.sin(u * Math.PI * 2) * 2);
      const kind = Math.floor(t / 2.4) * 3 + 2;
      for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, 1], [-1, 1], [1, -1]] as const) runeDots(put, kind, px + 2 + ox, ry + oy, 3, WORD[3], 0.5, 2);
      runeDots(put, kind, px + 2, ry, 3, WORD[0], 1, 2);
    }
  }

  // --- his eyes: they burn a little brighter and lower by turns, and now and then he blinks ---
  {
    const blink = take !== 'looming' && (frac(t / 6.3) > 0.975 || (frac(t / 6.3) > 0.93 && frac(t / 6.3) < 0.945));
    for (const [ex, ey] of marks.eyes) {
      if (blink) {
        put(ex - 6, ey - 2, SKIN_T[3], 1, 12, 5);
        put(ex - 6, ey + 2, SKIN_T[0], 1, 12, 1);
      } else if (take === 'looming') {
        // (leaning in over you, he does not blink: his eyes burn, and the light of them spills)
        const a = 0.35 + 0.3 * Math.sin(t * 3.1);
        put(ex - 2, ey - 2, WORD[0], 1, 4, 5);
        put(ex - 5, ey - 1, WORD[1], a, 10, 3);
        put(ex - 8, ey, WORD[2], a * 0.6, 16, 1);
      } else if (step % 7 < 3) {
        put(ex - 1, ey - 1, WORD[0], 1, 3, 2);
      }
    }
  }

  // --- the stone on his brow: a star of light crosses it ---
  {
    const [sx, sy] = marks.stone;
    const u = frac(t / 4.4);
    if (u < 0.12) {
      const reach2 = u < 0.03 ? 2 : u < 0.07 ? 4 : u < 0.1 ? 3 : 1;
      put(sx - reach2, sy, WORD[0], 1, 2 * reach2 + 1, 1);
      put(sx, sy - reach2, WORD[0], 1, 1, 2 * reach2 + 1);
    }
  }

  // --- motes in the light over the table ---
  for (let k = 0; k < 12; k++) {
    const age = t / (9 + hash2(k, 3, 83) * 6) + hash2(k, 4, 83);
    const turn = Math.floor(age);
    const u = age - turn;
    const x = Math.round(wx + (hash2(turn, k, 85) - 0.5) * 300 + Math.sin(u * 4 + k) * 9);
    const y = Math.round(TOP - 20 - hash2(turn, k, 87) * 120 - u * 16);
    put(x, y, WORD[1], swell(u) * 0.45);
  }
  // (kept: where the word is, for whoever lights the picture from it)
  void wy;
}

export function makeSmithTitle(take: SmithTake = 'keeper'): SmithTitle {
  const { px, scene } = paintSmith(take);
  let sheet: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let img: ImageData | null = null;
  let seen = -1;
  const life = (t: number): HTMLCanvasElement => {
    if (!sheet) {
      sheet = document.createElement('canvas');
      sheet.width = W;
      sheet.height = H;
      ctx = sheet.getContext('2d') as CanvasRenderingContext2D;
      img = ctx.createImageData(W, H);
    }
    // (thirty times a second is as often as anything in it changes)
    const tick = Math.floor(t * 30);
    if (tick === seen || !ctx || !img) return sheet;
    seen = tick;
    const d = img.data;
    d.fill(0);
    smithLife(tick / 30, scene, (x, y, color, a, w = 1, h = 1) => {
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
  return { w: W, h: H, lip: SMITH_LIP, lift: 38, headTop: SMITH_SAFE.top, take, still: px.toCanvas(), life };
}
