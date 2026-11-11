// ENDLESS MODE'S SPLASH, PAINTED: THE HALL OF GATES (the art chat, 11 Nov 2026). A MOCK-UP BEHIND A SWITCH THAT IS OFF:
// ENDLESS_SPLASH.on. With it off the splash is as it has been (ui/endless_fanfare.ts, painted in code by the main chat).
//
// Asked for by the main chat (the chat board, 8 Nov 2026, 08:40): “PLEASE DRAW IT: the whole screen of a phone held sideways (it
// must also fill a wider screen), its moment as the splash comes up (1 to 2 s of it moving is welcome: the game plays what you
// hand back), the word ENDLESS in it or left to the game to letter over it (say which).” The owner's words for the fanfare,
// 7 Nov 2026, 14:54: “I’d like a little more fanfare for endless mode.  Like a big splash screen and a pop up description of
// what endless mode is.”
//
// THE PICTURE: a great gateway seen from just outside it, its lintel across the top of the screen, a torch on each pier. Through
// it a hall runs straight away from us for ever, gate after gate, each built of another floor's stone (the prison's, the canyon's,
// the fen's, the High City's, the quarry's: “Each level is one of the floors, chosen at random”). Just inside, the town's
// waypoint lies awake in the floor, and its cyan lights the first gates; far down, where the gates close to a point, the enemy's
// pink burns to gold. No one is in it.
//
// THE WORD IS LETTERED BY THE GAME, on the lintel: ENDLESS, and under it THE WAY GOES ON and HARDCORE (endlessLettering says
// where and how big on any screen). Nothing of the picture is under the letters but the lintel's dark stone.
//
// THE WHOLE SCREEN, ON EVERY SCREEN (as the start screen's picture, art/title_ring.ts): painted once at ES_W x ES_H game pixels,
// at the game's fine grain (two picture pixels to a game pixel), bigger than any screen the game is laid out on; the screen shows
// the part that fits, the picture's vanishing point at the middle of the screen across and ES_VY_AT of the way down it.
//
// ITS MOMENT (endlessMoment; drawn by ui/endless_splash_draw.ts): out of the dark the gates wake one after another, away from us,
// faster and faster, each with a kick and dust off its crown; the far end takes fire; the word lands on the lintel with its
// whole weight. About 1.75 s; then it lives quietly (the torches, the waypoint's light going round, the far fire breathing).
//
// How it is painted: every picture pixel is a line of sight into the hall. What it meets first (a gate's face, the inside of its
// arch, the floor, a wall) is found by its numbers, and painted as stone: flat tones, a seam of one pixel, light cut into bands
// with a dither only where two bands meet. No soft gradients, nothing smoothed.

import { hash2 } from '../engine/rng';

/**
 * THE SWITCH: the splash shows the painted picture only while it is on. Off until his yes to pictures of it. `picture`: which of
 * the two painted: 'stair', THE STAIR WITH NO BOTTOM (art/endless_stair.ts), his pick of the ten sketches (dev/endless_options.ts),
 * 11 Nov 2026, by 08:30: “2 The stair with no bottom”; or 'hall', the hall of gates painted here first, kept.
 */
export const ENDLESS_SPLASH: { on: boolean; picture: 'stair' | 'hall' } = { on: false, picture: 'stair' };

/** The picture's size in game pixels, and its vanishing point. */
export const ES_W = 720;
export const ES_H = 360;
export const ES_VX = 360;
export const ES_VY = 252;
/** How far down the screen the vanishing point is put. */
export const ES_VY_AT = 0.7;
/** The lintel's lower edge above the vanishing point, in game pixels: the letters go above it. */
export const ES_LINTEL = 92;

// ---------------------------------------------------------------------------------------------
// The kit: colours as 0xRRGGBB numbers, flat bands, a 4 x 4 ordered dither where two bands meet.

export type C = number;
export const hx = (s: string): C => parseInt(s.slice(1), 16);
export const cR = (c: C): number => (c >> 16) & 255;
export const cG = (c: C): number => (c >> 8) & 255;
export const cB = (c: C): number => c & 255;
export const pack = (r: number, g: number, b: number): C =>
  (Math.max(0, Math.min(255, Math.round(r))) << 16) | (Math.max(0, Math.min(255, Math.round(g))) << 8) | Math.max(0, Math.min(255, Math.round(b)));
export const mixc = (a: C, b: C, t: number): C => pack(cR(a) + (cR(b) - cR(a)) * t, cG(a) + (cG(b) - cG(a)) * t, cB(a) + (cB(b) - cB(a)) * t);
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export const bay = (x: number, y: number): number => BAYER4[((y & 3) << 2) | (x & 3)];
export const rnd = (x: number, y: number, seed = 0): number => hash2(x, y, seed);
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Picture pixels to a game pixel. */
const D = 2;
const W = ES_W * D;
const H = ES_H * D;
const VX = ES_VX * D;
const VY = ES_VY * D;
/** Picture pixels to one eye-height, one eye-height away. */
const F = 600;

// ---------------------------------------------------------------------------------------------
// The hall, in eye-heights: the eye at (0, 0, 0) looking along z; X to the right, Y DOWN (the floor at Y = 1).

const HALL = 3.2;
const CEIL = 2.4;
const Z0 = 4;
const DZ = 3.6;
/** How many gates are drawn before the far fire. */
export const ES_GATES = 12;

/** The waypoint's dais in the floor: its middle and how far it reaches. */
const WAY_Z = 5.75;
const WAY_R = 0.98;
/** Its light, as a lamp a little above it. */
const WAY_LAMP: readonly [number, number, number] = [0, 0.72, WAY_Z];
/** The torches on the first gate's piers. */
const TORCH_X = 2.9;
const TORCH_Y = -0.42;
const TORCH_Z = Z0 - 0.3;

type Kind = 'flat' | 'round' | 'point';
export interface Theme {
  name: string;
  /** Its stone, dark to light (four tones). */
  stone: readonly C[];
  /** Its floor's flags, dark to light (three). */
  flag: readonly C[];
  /** A course's height and a block's length. */
  hc: number;
  bl: number;
  /** How deep its arch stones are. */
  vw: number;
  kind: Kind;
  /** Moss on what faces up. */
  moss?: boolean;
  /** A portcullis hung in it, its teeth down. */
  teeth?: boolean;
  /** Roots hanging in it. */
  roots?: boolean;
  /** Rough rock: its arch not true. */
  rough?: boolean;
  /** A dark band laid into its arch stones. */
  inlay?: C;
}
const T = (name: string, stone: string[], flag: string[], hc: number, bl: number, vw: number, kind: Kind, more: Partial<Theme> = {}): Theme => ({ name, stone: stone.map(hx), flag: flag.map(hx), hc, bl, vw, kind, ...more });
// (each floor's own stone, from its own file: art/gateward.ts, prison.ts, canyon.ts, fen.ts, high_city_set.ts, quarry.ts)
export const TOWN = T('town', ['#52444c', '#857567', '#958474', '#ae9a88'], ['#554c55', '#62585e', '#7a6d6b'], 0.38, 0.86, 0.55, 'flat');
export const PRISON = T('prison', ['#3a3844', '#4e4a5a', '#625c70', '#7c7690'], ['#3c3a48', '#4c4858', '#5e586c'], 0.3, 0.64, 0.4, 'round', { teeth: true });
export const CANYON = T('canyon', ['#6c463a', '#9c6656', '#be8262', '#d69870'], ['#82504a', '#a46c54', '#b67c5e'], 0.46, 1.0, 0.46, 'round', { rough: true });
export const FEN = T('fen', ['#38353e', '#5a5661', '#6e6974', '#837e88'], ['#3a3630', '#48444f', '#5a5661'], 0.32, 0.6, 0.38, 'point', { moss: true, roots: true });
export const HIGH = T('high', ['#64606c', '#9a949a', '#c4bebc', '#e2dcd4'], ['#555060', '#9a928e', '#c2b8ae'], 0.56, 1.2, 0.34, 'point', { inlay: hx('#283464') });
export const QUARRY = T('quarry', ['#4d465c', '#70677b', '#8a8094', '#aaa1a6'], ['#4d465c', '#6a6078', '#7e7489'], 0.5, 1.3, 0.5, 'flat');
export const MOSS = ['#2e3a22', '#3c4b2b', '#4c5e35'].map(hx);
export const IRON = ['#16161b', '#323039', '#55505e'].map(hx);

interface Gate {
  k: number;
  z: number;
  th: number;
  theme: Theme;
  /** Half the opening's width; the height of its springing above the eye. */
  ow: number;
  ys: number;
  /** A round or pointed arch: the middle of its circle, c to the side and d under the springing; its radius squared. */
  c: number;
  d: number;
  R2: number;
  /** The height of its top above the eye. */
  top: number;
}
const ORDER: readonly Theme[] = [TOWN, PRISON, CANYON, FEN, HIGH, QUARRY, PRISON, FEN, CANYON, HIGH, PRISON, QUARRY];
const GATES: readonly Gate[] = ORDER.slice(0, ES_GATES).map((theme, k) => {
  const z = Z0 + DZ * k;
  const g: Gate = { k, z, th: k === 0 ? 0.6 : 0.7, theme, ow: 2.35, ys: 0.5, c: 0, d: 0, R2: 0, top: 0 };
  if (k === 0) {
    g.ow = 2.55;
    g.ys = 1.23;
    g.top = 1.23;
  } else if (theme.kind === 'flat') {
    g.ow = 2.25;
    g.ys = 1.5;
    g.top = 1.5;
  } else if (theme.kind === 'round') {
    // (a low round arch: 1.1 high over its springing)
    g.ow = theme.rough ? 2.3 : 2.35;
    g.ys = theme.rough ? 0.5 : 0.57;
    const rise = theme.rough ? 1.14 : 1.1;
    g.d = (g.ow * g.ow - rise * rise) / (2 * rise);
    g.R2 = g.ow * g.ow + g.d * g.d;
    g.top = g.ys + rise;
  } else {
    // (a low pointed arch, of two circles)
    g.ow = theme.inlay ? 2.2 : 2.35;
    g.ys = theme.inlay ? 0.45 : 0.4;
    g.c = 1.6;
    g.d = 4.5;
    g.R2 = (g.ow + g.c) * (g.ow + g.c) + g.d * g.d;
    g.top = g.ys + Math.sqrt(g.R2 - g.c * g.c) - g.d;
  }
  return g;
});

/** A rough arch's edge moved in and out along it. */
function roughAt(g: Gate, X: number, Y: number): number {
  if (!g.theme.rough) return 0;
  const a = Math.atan2(Y + g.ys - g.d, X);
  const i = Math.floor(a * 9);
  const f = a * 9 - i;
  const u = f * f * (3 - 2 * f);
  return (rnd(i, g.k, 91) * (1 - u) + rnd(i + 1, g.k, 91) * u - 0.5) * 0.3;
}

/** How far a point of a gate's plane is outside its opening (below 0: in the opening). */
function outside(g: Gate, X: number, Y: number): number {
  const ax = Math.abs(X);
  if (Y > -g.ys) return ax - g.ow;
  if (g.theme.kind === 'flat') return ax < g.ow ? -g.ys - Y : Math.hypot(ax - g.ow, -g.ys - Y);
  const e = Math.hypot(ax + g.c, Y + g.ys - g.d) - Math.sqrt(g.R2) + roughAt(g, X, Y);
  return Math.max(e, ax - g.ow);
}
const isOpen = (g: Gate, X: number, Y: number): boolean => outside(g, X, Y) < 0;

// ---------------------------------------------------------------------------------------------
// Light: cut into bands. Three lights and the dark's own.

/** The bands a light is cut into. */
const LEVELS = [0, 0.06, 0.14, 0.27, 0.46, 0.72, 1.05];
export function band(v: number, px: number, py: number): number {
  if (v <= 0) return 0;
  let i = 0;
  while (i < LEVELS.length - 2 && v >= LEVELS[i + 1]) i++;
  const lo = LEVELS[i];
  const hi = LEVELS[i + 1];
  const t = (v - lo) / (hi - lo);
  // (a dither only in the last seventh before the next band)
  return t > 0.86 + 0.14 * bay(px, py) ? hi : lo;
}
/** The dark's own light, the waypoint's cyan, a torch's orange, the far fire's pink: each as what it does to red, green and blue. */
const L_DARK = [0.2, 0.19, 0.36];
const L_CYAN = [0.2, 0.98, 1.08];
const L_TORCH = [1.25, 0.66, 0.24];
const L_PINK = [1.3, 0.36, 0.66];
/** A stone of colour `alb` under so much of each light. */
export function lit(alb: C, lc: number, lt: number, lp: number): C {
  const r = L_DARK[0] + L_CYAN[0] * lc + L_TORCH[0] * lt + L_PINK[0] * lp;
  const g = L_DARK[1] + L_CYAN[1] * lc + L_TORCH[1] * lt + L_PINK[1] * lp;
  const b = L_DARK[2] + L_CYAN[2] * lc + L_TORCH[2] * lt + L_PINK[2] * lp;
  return pack(cR(alb) * r, cG(alb) * g, cB(alb) * b);
}
export const DEEP = hx('#07061a');
export const NIGHT = hx('#05040f');
const HAZE = hx('#6a1052');
/** The far fire, from its heart out (art/mkit.ts FLAME, the enemy's). */
export const FIRE = ['#fff0a0', '#ffb070', '#ff4f8a', '#c0206a', '#7a1058'].map(hx);
/** The waypoint's light (art/kit.ts CYAN). */
export const CY_HI = hx('#b8fff8');
export const CY = hx('#22d0e0');
export const CY_LO = hx('#0c6a80');
/** The waypoint's stone: the standing stones' violet (art/title_ring.ts STONE). */
export const WAYSTONE = ['#262a62', '#3a4088', '#5660ac', '#7e8ad0'].map(hx);

/** The waypoint's light on a point with normal n. */
function cyanOn(X: number, Y: number, z: number, nx: number, ny: number, nz: number): number {
  const vx = WAY_LAMP[0] - X;
  const vy = WAY_LAMP[1] - Y;
  const vz = WAY_LAMP[2] - z;
  const d2 = vx * vx + vy * vy + vz * vz;
  const d = Math.sqrt(d2);
  const lam = (vx * nx + vy * ny + vz * nz) / d;
  if (lam <= 0) return 0;
  return (1.5 * lam) / (1 + d2 / 9);
}
/** The two torches' light on a point with normal n. */
function torchOn(X: number, Y: number, z: number, nx: number, ny: number, nz: number): number {
  let s = 0;
  for (const sx of [-1, 1]) {
    const vx = sx * TORCH_X - X;
    const vy = TORCH_Y - 0.2 - Y;
    const vz = TORCH_Z - z;
    const d2 = vx * vx + vy * vy + vz * vz;
    const d = Math.sqrt(d2);
    const lam = (vx * nx + vy * ny + vz * nz) / d;
    if (lam > 0) s += (1.5 * (0.35 + 0.65 * lam)) / (1 + d2 / 0.55);
  }
  return s;
}
/** The far fire's light on what faces the hall's middle, so far along. */
const Z_FAR = Z0 + DZ * ES_GATES;
const pinkAt = (z: number): number => 0.9 * Math.exp(-(Z_FAR - z) / 20);

/** The air between: what is far sinks into the dark, and past the middle gates takes the far fire's haze. */
export function air(c: C, z: number, px: number, py: number): C {
  const k = clamp01((z - 9) / 30);
  const kb = Math.min(1, (Math.floor(k * 7 + bay(px, py) * 0.9) / 7) * 0.9);
  let out = mixc(c, DEEP, kb);
  const h = clamp01((z - 22) / 34);
  const hb = Math.floor(h * 5 + bay(px + 2, py + 1) * 0.9) / 5;
  if (hb > 0) out = mixc(out, HAZE, hb * 0.6);
  return out;
}

// ---------------------------------------------------------------------------------------------
// Stone.

/** A wall of coursed blocks at (u along it, v down it), one picture pixel being q of its units: which tone (0 to 3), or -1 on a seam. */
function blocks(th: Theme, u: number, v: number, q: number, seed: number, px: number, py: number): number {
  const hc = th.hc;
  const row = Math.floor(v / hc);
  const shift = (r: number): number => (r & 1 ? th.bl / 2 : 0) + (rnd(r, seed, 5) - 0.5) * th.bl * 0.3;
  const col = Math.floor((u + shift(row)) / th.bl);
  const small = hc / q < 4.5;
  if (!small) {
    // (a seam of one pixel: where the pixel above, or the one to the left, is in another block)
    if (Math.floor((v - q) / hc) !== row) return -1;
    if (Math.floor((u - q + shift(row)) / th.bl) !== col) return -1;
  }
  let tone = 1;
  const hsh = rnd(col, row, seed);
  if (hsh < 0.24) tone = 0;
  else if (hsh > 0.8) tone = 2;
  if (!small) {
    // (light from the upper left: a block's top and left edges catch it, its bottom and right edges lose it)
    const top = Math.floor((v - 2 * q) / hc) !== row;
    const left = Math.floor((u - 2 * q + shift(row)) / th.bl) !== col;
    const bottom = Math.floor((v + q) / hc) !== row;
    const right = Math.floor((u + q + shift(row)) / th.bl) !== col;
    if (top || left) tone++;
    else if (bottom || right) tone--;
    // (pitted and chipped)
    tone += wear(px, py);
    // (a crack down some blocks)
    if (hsh > 0.55 && hsh < 0.63) {
      const cu = (u + shift(row)) / th.bl - col;
      const cv = v / hc - row;
      const line = 0.3 + 0.4 * rnd(col, row, seed + 3) + (rnd(Math.floor(cv * 5), col * 7 + row, 9) - 0.5) * 0.16;
      if (Math.abs(cu - line) < (q / th.bl) * 0.75) tone = -1;
    }
  }
  return Math.max(-1, Math.min(3, tone));
}

/**
 * WHAT MOVES IN IT, for the small pieces painted over the picture as it lives (paintEndlessPatch): the torches' fire (0 to 1 round
 * its flicker), the waypoint's light going round its ring (0 to 1 round it; below 0, as the picture has it: all of it alight),
 * the far fire (which of its shapes).
 */
const NOW = { flame: 0, way: -1, fire: 0 };

/** What a picture pixel shows. */
interface Hit {
  c: C;
  /** Which gate's waking shows it (0: the first gate and what is nearer; ES_GATES: the far fire). */
  stage: number;
}

/** A speck of wear on a stone: now and then a pit, seldom a chip of light. -1, 0 or 1. */
export function wear(px: number, py: number): number {
  const p = rnd(px >> 1, py >> 1, 17);
  if (p < 0.02 && rnd(px, py, 19) < 0.7) return -1;
  return p > 0.993 ? 1 : 0;
}

/** THE LINTEL of the first gate: one great slab of the standing stones' violet, the letters' place. How high it is. */
const SLAB = 0.9;
const SLAB_OVER = 0.5;

/** A gate's face. */
function faceAt(g: Gate, X: number, Y: number, px: number, py: number): C {
  const th = g.theme;
  const q = g.z / F;
  const e = outside(g, X, Y);
  const ax = Math.abs(X);
  let tone: number;
  let alb: C | null = null;
  let stone: readonly C[] = th.stone;
  if (g.k === 0) {
    // THE TORCHES, on the first gate's piers: an iron cup on a stem, its fire painted as it stands (the game lays its flicker over it)
    const tx = ax - TORCH_X;
    const ty = Y - TORCH_Y;
    const fy = -ty - 0.02;
    const ph = NOW.flame * Math.PI * 2;
    const tall = 0.46 * (0.9 + 0.13 * Math.sin(ph + (X < 0 ? 0 : 2.1)));
    if (fy > 0 && fy < tall) {
      const wd = 0.12 * Math.sin(Math.min(1, fy / tall) * Math.PI) ** 0.7 * (1 - fy * 0.6) + 0.012;
      const fx = Math.abs(tx - (0.03 + fy * 0.05) * Math.sin(fy * 14 - ph + (X < 0 ? 0 : 1.3)));
      if (fx < wd) return fx < wd * 0.34 && fy < 0.3 ? hx('#fff0a0') : fx < wd * 0.68 ? hx('#ffc24a') : hx('#ff8a2a');
    }
    if (ty >= -0.02 && ty < 0.1 && Math.abs(tx) < 0.17 - ty * 0.6) return ty < 0.02 ? hx('#7a5a4a') : tx < -0.04 ? IRON[2] : IRON[1];
    if (ty >= 0.1 && ty < 0.5 && Math.abs(tx) < 0.035) return tx < 0 ? IRON[2] : IRON[1];
    if (ty >= 0.44 && ty < 0.52 && Math.abs(tx) < 0.1) return IRON[1];
  }
  const up = -g.ys - Y;
  if (g.k === 0 && up >= 0 && up < SLAB && ax < g.ow + SLAB_OVER) {
    // THE SLAB: dressed, its edges worn, a crack or two; it lies on the piers
    stone = WAYSTONE;
    const in0 = Math.min(up, SLAB - up, g.ow + SLAB_OVER - ax);
    if (in0 < q * 1.01) tone = -1;
    else if (up > SLAB - q * 3.01 || (X < 0 && g.ow + SLAB_OVER - ax < q * 3.01)) tone = 2;
    else if (up < q * 3.01 || (X > 0 && g.ow + SLAB_OVER - ax < q * 3.01)) tone = 0;
    else if (Math.abs(in0 - 0.085) < q * 0.51) tone = 0;
    else if (Math.abs(in0 - 0.085 - q) < q * 0.51) tone = 2;
    else {
      tone = 1 + wear(px, py);
      // (two cracks, from its top and from its foot)
      for (const [cx, from, len, lean, sd] of [[-1.34, 1, 0.5, 0.22, 3], [1.72, 0, 0.36, -0.3, 5], [0.42, 1, 0.2, 0.1, 7]] as const) {
        const along = from ? SLAB - up : up;
        if (along < len) {
          const at = cx + along * lean + (rnd(Math.floor(along * 16), sd, 9) - 0.5) * 0.045;
          if (Math.abs(X - at) < q * 0.8) tone = -1;
        }
      }
    }
  } else if (g.k === 0 && Y > -g.ys && Y < -g.ys + 0.2 && ax < g.ow + SLAB_OVER + 0.12) {
    // (the stone the slab lies on, at the head of each pier)
    tone = Y < -g.ys + q * 1.01 || Y > -g.ys + 0.2 - q * 1.01 || ax > g.ow + SLAB_OVER + 0.12 - q * 1.01 ? -1 : Y < -g.ys + q * 3.01 ? 3 : 2 + wear(px, py);
  } else if (e < th.vw && (th.kind !== 'flat' || Y > -g.ys)) {
    // THE ARCH STONES round the opening: long and short up the sides, fanned over the top
    let joint = false;
    let idx = 0;
    let deep = th.vw;
    if (Y > -g.ys && ax >= g.ow) {
      const hq = th.hc * 1.5;
      idx = Math.floor((Y - 1) / hq);
      deep = idx & 1 ? th.vw : th.vw * 0.62;
      joint = Math.floor((Y - 1 - q) / hq) !== idx;
    } else {
      const cx = X < 0 ? g.c : -g.c;
      const step = Math.PI / 26;
      const a = Math.atan2(-(Y + g.ys - g.d), X - cx);
      idx = Math.floor(a / step);
      joint = Math.floor(Math.atan2(-(Y - q + g.ys - g.d), X - cx) / step) !== idx || Math.floor(Math.atan2(-(Y + g.ys - g.d), X - q - cx) / step) !== idx;
    }
    if (e < deep) {
      const fine = q < th.vw / 5;
      if (joint && fine) tone = -1;
      else if (e > deep - q * 1.01 && fine) tone = -1;
      else {
        tone = 2 + (rnd(idx, g.k, 23) > 0.7 ? 1 : 0) - (rnd(idx, g.k, 29) < 0.25 ? 1 : 0);
        if (e < q * 1.5 && fine) tone = Math.min(3, tone + 1);
        tone += wear(px, py);
        if (th.inlay !== undefined && e > deep * 0.4 && e < deep * 0.62) alb = th.inlay;
      }
    } else tone = blocks(th, X, Y - 1, q, g.k * 13 + 1, px, py);
  } else if (th.kind === 'flat' && g.k > 0 && up >= 0 && up < th.vw * 1.1 && ax < g.ow + 0.4) {
    // (the quarry's gate: one hewn stone across two)
    tone = up < q * 1.01 || up > th.vw * 1.1 - q * 1.01 || g.ow + 0.4 - ax < q * 1.01 ? -1 : up > th.vw * 1.1 - q * 3.01 ? 3 : 2 + wear(px, py);
  } else tone = blocks(th, X, Y - 1, q, g.k * 13 + 1, px, py);
  // (moss on the fen's stone: along the tops of its blocks, and thick near the floor)
  if (th.moss && tone >= 0) {
    const row = Math.floor((Y - 1) / th.hc);
    const inRow = (Y - 1) / th.hc - row;
    const clump = rnd(Math.floor(X / 0.21), row, 41) + (Y > 0.35 ? 0.3 : 0);
    if (clump > 0.62 && inRow < 0.16 + (clump - 0.62) * 0.9) alb = MOSS[clump > 0.9 ? 2 : 1];
  }
  const base = tone < 0 ? mixc(stone[0], 0, 0.55) : alb ?? stone[Math.max(0, Math.min(3, tone))];
  const lc = band(cyanOn(X, Y, g.z, 0, 0, -1), px, py);
  const lt = g.k === 0 ? band(torchOn(X, Y, g.z, 0, 0, -1), px, py) : 0;
  return air(lit(base, lc, lt, 0), g.z, px, py);
}

/** The far fire's light laid on a stone that is already in the air's dark: so much of it. */
export function rim(c: C, lp: number): C {
  if (lp <= 0) return c;
  return mixc(c, lp > 0.5 ? FIRE[2] : FIRE[3], Math.min(1, lp * 1.25));
}

/** The inside of a gate's opening (its jambs, the underside of its arch), `along` of the way through it. */
function revealAt(g: Gate, X: number, Y: number, z: number, along: number, px: number, py: number): C {
  const th = g.theme;
  const q = z / F;
  let nx = X < 0 ? 1 : -1;
  let ny = 0;
  let idx: number;
  let joint: boolean;
  let stone: readonly C[] = th.stone;
  let bevel = 0;
  if (Y > -g.ys + 0.02 && Math.abs(X) > g.ow - 0.06) {
    const hq = th.hc * 1.5;
    idx = Math.floor((Y - 1) / hq);
    joint = Math.floor((Y - 1 - q) / hq) !== idx;
    if (!joint && Math.floor((Y - 1 - 2 * q) / hq) !== idx) bevel = 1;
    else if (Math.floor((Y - 1 + q) / hq) !== idx) bevel = -1;
  } else if (th.kind === 'flat') {
    // (the underside of one stone)
    nx = 0;
    ny = 1;
    idx = 0;
    joint = false;
    if (g.k === 0) stone = WAYSTONE;
  } else {
    const cx = X < 0 ? g.c : -g.c;
    const vx = cx - X;
    const vy = -(g.ys - g.d) - Y;
    const l = Math.hypot(vx, vy) || 1;
    nx = vx / l;
    ny = vy / l;
    const step = Math.PI / 26;
    const a = Math.atan2(-(Y + g.ys - g.d), X - cx);
    idx = Math.floor(a / step);
    joint = Math.floor(Math.atan2(-(Y - q + g.ys - g.d), X - q * (X < 0 ? -1 : 1) - cx) / step) !== idx;
  }
  let tone = Math.min(3, Math.floor(rnd(idx, g.k, 31) * 3.4));
  const fine = q < th.vw / 5;
  if (joint && fine) tone = -1;
  else if (fine && (along < 0.05 || along > 0.95)) tone = Math.min(3, tone + 1);
  else tone += bevel + wear(px, py);
  let alb: C | null = null;
  if (th.moss && tone >= 0 && rnd(Math.floor(along * 5), idx, 43) > 0.6) alb = MOSS[1];
  const base = tone < 0 ? mixc(stone[0], 0, 0.5) : alb ?? stone[Math.max(0, Math.min(3, tone))];
  const lc = band(cyanOn(X, Y, z, nx, ny, 0), px, py);
  const lt = g.k === 0 ? band(torchOn(X, Y, z, nx, ny, 0) * 0.5, px, py) : 0;
  return rim(air(lit(base, lc, lt, 0), z, px, py), g.k === 0 ? 0 : band(pinkAt(z), px, py));
}

/** What hangs in a gate's opening, half way through it (the prison's teeth, the fen's roots), or null. */
function hangingAt(g: Gate, X: number, Y: number, z: number, px: number, py: number): C | null {
  const th = g.theme;
  const q = z / F;
  if (th.teeth) {
    // A PORTCULLIS, drawn up: its bars down out of the arch, a cross bar, each bar ending in a tooth
    const tip = -1.1;
    if (Y < tip) {
      const pitch = 0.4;
      const i = Math.round(X / pitch);
      const off = X - i * pitch;
      const bx = Math.abs(off);
      const upT = tip - Y;
      const wide = upT < 0.2 ? 0.006 + (upT / 0.2) * 0.058 : 0.064;
      const cross = Math.abs(Y - (tip - 0.31)) < 0.055;
      if (bx < wide || cross) {
        const lc = band(cyanOn(X, Y, z, 0, 0, -1) * 0.9, px, py);
        // (iron: its left edge and the cross bar's top catch the light)
        const hiEdge = cross ? Y < tip - 0.31 - 0.055 + q * 1.5 : off < -wide + q * 1.3;
        const loEdge = cross ? Y > tip - 0.31 + 0.055 - q * 1.2 : off > wide - q * 1.2;
        return air(lit(hiEdge ? hx('#8a8498') : loEdge ? IRON[0] : IRON[1], lc + 0.1, 0, 0), z, px, py);
      }
    }
  }
  if (th.roots) {
    // ROOTS, hanging from the arch, each its own length
    const pitch = 0.27;
    const i = Math.round(X / pitch);
    const r = rnd(i, g.k, 61);
    if (r > 0.34) {
      const len = 0.25 + r * 0.75;
      const topY = -g.top + ((X * X) / (g.ow * g.ow)) * (g.top - g.ys) * 0.9;
      const down = Y - topY;
      if (down > 0 && down < len) {
        const sway = Math.sin(down * 7 + i) * 0.05 * (down / len);
        if (Math.abs(X - i * pitch - (r - 0.5) * 0.12 - sway) < q * (down < len * 0.5 ? 1.1 : 0.6)) {
          const lc = band(cyanOn(X, Y, z, 0, 0, -1), px, py);
          return air(lit(hx('#56504a'), lc, 0, 0), z, px, py);
        }
      }
    }
  }
  return null;
}

/** The waypoint's cuts at a point of its top, `x` and `y` in its radius: 0 none, 1 the ring, 2 a mark, 3 the small ring, 4 the disc (art/crypt_ways.ts cutAt). */
export function wayCut(x: number, y: number, q: number): 0 | 1 | 2 | 3 | 4 {
  const r = Math.hypot(x, y);
  if (Math.abs(r - 0.73) < Math.max(0.04, q * 0.9)) return 1;
  if (r < 0.14) return 4;
  if (Math.abs(r - 0.24) < Math.max(0.03, q * 0.8)) return 3;
  if (r < 0.3 || r > 0.62) return 0;
  const k = Math.round((Math.atan2(y, x) / Math.PI) * 4);
  const ux = Math.cos((k * Math.PI) / 4);
  const uy = Math.sin((k * Math.PI) / 4);
  const al = x * ux + y * uy;
  const ac = Math.abs(-x * uy + y * ux);
  const w = Math.max(0.035, q * 0.9);
  if (al > 0.33 && al < 0.56 && ac < w) return 2;
  if (Math.abs(al - 0.56) < w && ac < 0.085) return 2;
  return 0;
}

/** The floor. */
function floorAt(X: number, z: number, th: Theme, px: number, py: number, dyAbove: number): C {
  const q = z / F;
  const rx = X / WAY_R;
  const rz = (z - WAY_Z) / WAY_R;
  const rho = Math.hypot(rx, rz);
  // (how far the pixel above this one is along the floor: the floor's rows are seen very flat)
  const zUp = 1 / dyAbove;
  const lcPool = 1.5 / (1 + (rho * WAY_R * rho * WAY_R) / 2.6);
  const lt = band(torchOn(X, 1, z, 0, -1, 0) * 0.8, px, py);
  // (the far fire lying on the wet stone, down the middle of the way)
  const wet = 0.35 + 0.65 * rnd(Math.floor(z / (th.hc * 2.6)), Math.floor((X + 9) / 0.27), 83);
  const gloss = 0.95 * wet * Math.exp(-((X / (0.2 + z * 0.011)) ** 2)) * clamp01((z - 7) / 26) ** 0.6;
  const lp = band(gloss + pinkAt(z) * 0.25, px, py);
  if (rho < 1) {
    // THE WAYPOINT, AWAKE: dressed stone in eight wedges, a lip round it, its cuts alight
    const cut = wayCut(rx, rz, q / WAY_R);
    if (cut !== 0) {
      if (NOW.way < 0) return cut === 4 || cut === 2 ? CY_HI : cut === 3 ? CY : rnd(px >> 1, py, 71) > 0.3 ? CY : CY_HI;
      // (awake, as the game's waypoint is: a brighter light going round the ring, each mark lighting as it passes, the middle swelling)
      const head = NOW.way * Math.PI * 2;
      let da = Math.abs(Math.atan2(rz, rx) - head) % (Math.PI * 2);
      if (da > Math.PI) da = Math.PI * 2 - da;
      if (cut === 4) return Math.sin(head) > -0.3 ? CY_HI : CY;
      if (cut === 3) return Math.sin(head) > 0.4 ? CY_HI : CY;
      if (cut === 1) return da < 0.7 ? CY_HI : da < 1.6 ? CY : mixc(CY, CY_LO, 0.45);
      return da < 0.9 ? CY_HI : mixc(CY, CY_LO, 0.3);
    }
    const wedge = Math.floor((Math.atan2(rz, rx) / Math.PI) * 4 + 8);
    const joint = Math.floor((Math.atan2(rz, rx - q / WAY_R) / Math.PI) * 4 + 8) !== wedge || Math.floor((Math.atan2((zUp - WAY_Z) / WAY_R, rx) / Math.PI) * 4 + 8) !== wedge;
    let tone = 1 + (wedge & 1);
    if (rho > 0.9) tone = rz > 0 ? 3 : 0;
    else if (joint && rho > 0.14) tone = 0;
    else tone += wear(px, py);
    // (lit by its own cuts: brightest by the ring and the middle)
    const near = Math.min(Math.abs(rho - 0.73), Math.abs(rho - 0.24) + 0.08, rho);
    const own = band(0.95 - near * 2.2, px, py);
    return lit(WAYSTONE[Math.max(0, tone)], own, 0, 0);
  }
  if (rho < 1.07 && rz < 0.2) return lit(WAYSTONE[0], band(0.35, px, py), lt, 0);
  // FLAGS: rows across the way, a runner of longer stones down its middle
  const bz = th.hc * 2.6;
  const bx = th.bl * 1.25;
  const runner = Math.abs(X) < 0.82;
  const row = Math.floor(z / bz);
  const shift = runner ? 0 : (row & 1 ? bx / 2 : 0) + (rnd(row, 3, 7) - 0.5) * 0.2;
  const col = runner ? 9999 + (X < -0.02 ? 0 : 1) * 0 : Math.floor((X + shift) / bx);
  let tone = 1;
  const hsh = rnd(col, row, 77 + (runner ? 5 : 0));
  if (hsh < 0.3) tone = 0;
  else if (hsh > 0.78) tone = 2;
  if (runner) tone = Math.min(2, tone + 1);
  const rowPx = bz / (zUp - z + 1e-9);
  if (rowPx > 2.2) {
    if (Math.floor(zUp / bz) !== row) tone = -1;
    else if (!runner && Math.floor((X - q + shift) / bx) !== col) tone = -1;
    else if (Math.abs(Math.abs(X) - 0.82) < q * 0.6) tone = -1;
    else tone += wear(px, py);
  }
  const base = tone < 0 ? mixc(th.flag[0], 0, 0.55) : th.flag[Math.max(0, Math.min(2, tone))];
  return rim(air(lit(base, band(lcPool, px, py), lt, 0), z, px, py), lp);
}

/** A side wall of the hall. */
function wallAt(side: number, Y: number, z: number, th: Theme, px: number, py: number, zLeft: number): C {
  const q = z / F;
  const row = Math.floor((Y - 1) / th.hc);
  const shift = row & 1 ? th.bl / 2 : 0;
  const col = Math.floor((z + shift) / th.bl);
  let tone = 1;
  const hsh = rnd(col, row, 131 + side);
  if (hsh < 0.26) tone = 0;
  else if (hsh > 0.8) tone = 2;
  if (th.hc / q > 4.5) {
    if (Math.floor((Y - 1 - q) / th.hc) !== row) tone = -1;
    else if (Math.floor((zLeft + shift) / th.bl) !== col) tone = -1;
    else if (Math.floor((Y - 1 - 2 * q) / th.hc) !== row) tone++;
    else tone += wear(px, py);
  }
  let base = tone < 0 ? mixc(th.stone[0], 0, 0.55) : th.stone[Math.max(0, Math.min(3, tone))];
  if (th.teeth) {
    // (the prison's: a ring in the wall, a chain down from it, an empty shackle)
    for (const [cz, top, len] of [[5.5, -0.75, 0.95], [6.55, -0.55, 0.62]] as const) {
      const dzc = Math.abs(z - cz);
      const down = Y - top;
      if (down > 0 && down < len && dzc < Math.abs(z - zLeft) * 0.75) base = Math.floor(down / (q * 2.2)) & 1 ? IRON[2] : IRON[0];
      const rr = Math.hypot((z - cz) * 0.6, Y - (top + len + 0.07));
      if (rr < 0.075 && rr > 0.075 - q * 1.6) base = IRON[2];
      if (Math.hypot((z - cz) * 0.6, Y - top) < 0.05) base = IRON[1];
    }
  }
  const lc = band(cyanOn(side * HALL, Y, z, -side, 0, 0), px, py);
  const lt = band(torchOn(side * HALL, Y, z, -side, 0, 0), px, py);
  return rim(air(lit(base, lc, lt, 0), z, px, py), band(pinkAt(z) * 0.5, px, py));
}

/** THE FAR FIRE: the shape of the last arch, hottest low in its middle, its edge licking. */
function fireAt(dx: number, dy: number, px: number, py: number): C {
  const g = GATES[ES_GATES - 1];
  const zl = g.z + g.th;
  const X = dx * zl;
  const Y = dy * zl;
  const inside = -outside(g, X, Y);
  const a = Math.atan2(Y - 0.5, X);
  const lick = (rnd(Math.floor(a * 5), 3 + NOW.fire * 7, 97) - 0.5) * 0.22 + (rnd(Math.floor(a * 11), 5 + NOW.fire * 3, 97) - 0.5) * 0.1;
  const heart = 1 - Math.hypot(X / (g.ow * 0.95), (Y - 0.45) / 1.5);
  const v = Math.min(1, inside * 1.6 + 0.25) * clamp01(heart + 0.2) + lick;
  const i = v > 0.74 ? 0 : v > 0.56 ? 1 : v > 0.34 ? 2 : v > 0.16 ? 3 : 4;
  return FIRE[i];
}

/** What the picture pixel (px, py) shows. */
function hitAt(px: number, py: number): Hit {
  const dx = (px + 0.5 - VX) / F;
  const dy = (py + 0.5 - VY) / F;
  // (where the line of sight meets the hall itself: its floor, its roof, a side wall)
  // (the hall's side walls begin at the first gate: nearer, we stand in the open before it, and its face goes on to either side)
  const zHall = HALL / Math.max(1e-6, Math.abs(dx));
  const zWall = zHall >= Z0 ? zHall : 1e9;
  const zRoof = CEIL / Math.max(1e-6, -dy);
  const zFlat = dy > 0 ? 1 / dy : zRoof >= Z0 ? zRoof : 1e9;
  const zc = Math.min(zWall, zFlat);
  let stage = ES_GATES;
  for (const g of GATES) {
    if (g.z > zc) {
      stage = g.k;
      break;
    }
    const X = dx * g.z;
    const Y = dy * g.z;
    if (!isOpen(g, X, Y)) return { c: faceAt(g, X, Y, px, py), stage: g.k };
    const zb = g.z + g.th;
    // (what hangs in it)
    const zm = g.z + g.th * 0.5;
    if (zm < zc && (g.theme.teeth || g.theme.roots)) {
      const hc = hangingAt(g, dx * zm, dy * zm, zm, px, py);
      if (hc !== null) return { c: hc, stage: g.k };
    }
    if (zb > zc) {
      stage = g.k;
      break;
    }
    if (!isOpen(g, dx * zb, dy * zb)) {
      let lo = g.z;
      let hi = zb;
      for (let i = 0; i < 10; i++) {
        const m = (lo + hi) / 2;
        if (isOpen(g, dx * m, dy * m)) lo = m;
        else hi = m;
      }
      return { c: revealAt(g, dx * lo, dy * lo, lo, (lo - g.z) / g.th, px, py), stage: g.k };
    }
  }
  if (stage >= ES_GATES) {
    // THE FAR FIRE, where the gates close to a point
    return { c: fireAt(dx, dy, px, py), stage: ES_GATES };
  }
  const th = GATES[stage].theme;
  if (zc === zFlat && dy > 0) return { c: floorAt(dx * zc, zc, th, px, py, dy - 1 / F), stage };
  if (zc === zFlat) {
    // (the roof: dark, a beam across it now and then)
    const beam = Math.floor(zc / 1.2) % 2 === 0;
    return { c: air(lit(beam ? th.stone[0] : mixc(th.stone[0], 0, 0.4), band(cyanOn(dx * zc, -CEIL, zc, 0, 1, 0), px, py), 0, 0), zc, px, py), stage };
  }
  const side = dx < 0 ? -1 : 1;
  const zLeft = HALL / Math.max(1e-6, Math.abs(dx - 1 / F));
  return { c: wallAt(side, dy * zc, zc, th, px, py, zLeft), stage };
}

/** The picture, as plain numbers: its colours (0xRRGGBB), and for each pixel which gate's waking shows it. */
export interface EndlessPainting {
  /** In picture pixels: ES_W * 2 by ES_H * 2. */
  w: number;
  h: number;
  c: Int32Array;
  stage: Uint8Array;
}

/** THE PICTURE, painted (about a second: once, before the splash is wanted). */
export function paintEndlessSplash(): EndlessPainting {
  const c = new Int32Array(W * H);
  const stage = new Uint8Array(W * H);
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const hit = hitAt(px, py);
      let col = hit.c;
      // (the picture's sides sink into the screen's own dark, for a screen wider than it)
      const edge = Math.min(px, W - 1 - px);
      if (edge < 96 && (96 - edge) / 96 > bay(px, py)) col = NIGHT;
      if (py < 72 && (72 - py) / 72 > bay(px, py)) col = NIGHT;
      c[py * W + px] = col;
      stage[py * W + px] = hit.stage;
    }
  }
  return { w: W, h: H, c, stage };
}

// ---------------------------------------------------------------------------------------------
// The small pieces that move, and where they are (all in picture pixels of the whole picture).

export interface EndlessPatch {
  x: number;
  y: number;
  w: number;
  h: number;
  c: Int32Array;
}
/** A piece of the picture painted again with its fire, its waypoint or its far fire at another moment. */
function patch(x: number, y: number, w: number, h: number): EndlessPatch {
  const c = new Int32Array(w * h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) c[j * w + i] = hitAt(x + i, y + j).c;
  return { x, y, w, h, c };
}
/** How many moments of each are painted. */
export const ES_FLAMES = 6;
export const ES_WAYS = 12;
export const ES_FIRES = 4;
const scr = (X: number, Y: number, z: number): [number, number] => [VX + (X * F) / z, VY + (Y * F) / z];
/** Where the torches' fires are (the middle of each), the waypoint's middle, the far fire's. */
export const ES_TORCH_AT: readonly (readonly [number, number])[] = [scr(-TORCH_X, TORCH_Y - 0.22, Z0), scr(TORCH_X, TORCH_Y - 0.22, Z0)];
export const ES_WAY_AT: readonly [number, number] = scr(0, 1, WAY_Z);
export const ES_FIRE_AT: readonly [number, number] = [VX, VY + 2];

/** A torch's fire (side 0 the left, 1 the right) at moment i of ES_FLAMES. */
export function paintEndlessFlame(side: number, i: number): EndlessPatch {
  NOW.flame = i / ES_FLAMES;
  const [cx, cy] = ES_TORCH_AT[side];
  const out = patch(Math.round(cx) - 34, Math.round(cy) - 52, 68, 92);
  NOW.flame = 0;
  return out;
}
/** The waypoint with its light at moment i of ES_WAYS round its ring. */
export function paintEndlessWay(i: number): EndlessPatch {
  NOW.way = i / ES_WAYS;
  const [x0] = scr(-WAY_R, 1, WAY_Z - WAY_R);
  const [, y0] = scr(0, 1, WAY_Z + WAY_R);
  const [x1, y1] = scr(WAY_R, 1, WAY_Z - WAY_R);
  const out = patch(Math.floor(x0) - 2, Math.floor(y0) - 2, Math.ceil(x1 - x0) + 4, Math.ceil(y1 - y0) + 4);
  NOW.way = -1;
  return out;
}
/** The far fire in shape i of ES_FIRES. */
export function paintEndlessFire(i: number): EndlessPatch {
  NOW.fire = i;
  const g = GATES[ES_GATES - 1];
  const hw = Math.ceil((g.ow * F) / g.z) + 2;
  const up = Math.ceil((g.top * F) / g.z) + 2;
  const dn = Math.ceil(F / g.z) + 2;
  const out = patch(VX - hw, VY - up, hw * 2, up + dn);
  // (only the fire itself: the stone round it is left as the picture has it)
  for (let j = 0; j < out.h; j++) for (let k = 0; k < out.w; k++) if (hitAt(out.x + k, out.y + j).stage < ES_GATES) out.c[j * out.w + k] = -1;
  NOW.fire = 0;
  return out;
}

/** A point on the crown of gate k's opening, `u` of the way across it (-1 its left, 1 its right). */
export function endlessCrown(k: number, u: number): [number, number] {
  const g = GATES[k];
  const X = u * g.ow * 0.94;
  let up = g.ys;
  if (g.theme.kind !== 'flat') up = g.ys - g.d + Math.sqrt(Math.max(0, g.R2 - (Math.abs(X) + g.c) ** 2));
  return scr(X, -up, g.z);
}
/** How big gate k is on the screen beside the first (1). */
export const endlessNear = (k: number): number => Z0 / (Z0 + DZ * k);

/**
 * THE WAKING, as rows to be covered: for each gate j, the runs of the picture still asleep when gates 0 to j - 1 are awake (what
 * is seen through gate j - 1). Each run is three numbers: its row, its first pixel, the pixel after its last.
 */
export function endlessAsleep(p: EndlessPainting): Int16Array[] {
  const out: Int16Array[] = [];
  for (let j = 0; j <= ES_GATES; j++) {
    const runs: number[] = [];
    for (let y = 0; y < p.h; y++) {
      let from = -1;
      for (let x = 0; x <= p.w; x++) {
        const in1 = x < p.w && p.stage[y * p.w + x] >= j;
        if (in1 && from < 0) from = x;
        else if (!in1 && from >= 0) {
          runs.push(y, from, x);
          from = -1;
        }
      }
    }
    out.push(Int16Array.from(runs));
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// ITS MOMENT, and the letters.

/**
 * THE MOMENT, in seconds from the splash coming up: the dark; the first gate's torches take (`wake`); the gates wake one after
 * another away from us, each sooner after the last, the last at `far`, where the far fire takes; the word falls from `drop` and
 * lands on the lintel at `land`; THE WAY GOES ON comes up at `way` and HARDCORE strikes at `hard`. All of it over by `done`.
 */
export const ES_MOMENT = { wake: 0.1, far: 0.86, drop: 0.94, land: 1.08, way: 1.32, hard: 1.5, done: 1.75 };
/** When gate j wakes (j = ES_GATES: the far fire). */
export function endlessWake(j: number): number {
  const r = 0.82;
  return ES_MOMENT.wake + ((ES_MOMENT.far - ES_MOMENT.wake) * (1 - r ** j)) / (1 - r ** ES_GATES);
}
/** How many gates are awake at time t (0 to ES_GATES + 1: the last is the far fire). */
export function endlessAwake(t: number): number {
  let n = 0;
  while (n <= ES_GATES && t >= endlessWake(n)) n++;
  return n;
}

/** Where the letters go on a screen of w by h game pixels. */
export interface EndlessLettering {
  /** The picture's top left corner on the screen. */
  ox: number;
  oy: number;
  /** The lintel's lower edge. */
  lintel: number;
  /** ENDLESS: its size (font pixels to game pixels), the row of its top. */
  scale: number;
  wordY: number;
  /** THE WAY GOES ON and HARDCORE: the row of their top; on one line, or (a narrow screen) HARDCORE under. */
  subY: number;
  oneLine: boolean;
}
/** `wordW`: how wide ENDLESS is at size 1; `subW`: how wide the line under it is. */
export function endlessLettering(w: number, h: number, wordW: number, subW: number): EndlessLettering {
  const vy = Math.round(h * ES_VY_AT);
  const ox = Math.floor(w / 2) - ES_VX;
  const oy = vy - ES_VY;
  const lintel = vy - ES_LINTEL;
  const oneLine = subW <= w - 16;
  const subH = oneLine ? 7 : 16;
  // (as big as the lintel and the screen's width leave room for; never over 6)
  let scale = 6;
  while (scale > 2 && (wordW * scale > w * 0.66 || 7 * scale + scale + 3 + subH + 8 > lintel)) scale--;
  const block = 7 * scale + scale + 3 + subH;
  const slabTop = Math.max(0, lintel - Math.round(SLAB * 75));
  const wordY = Math.max(scale + 2, Math.round(slabTop + (lintel - slabTop - block) / 2) + (scale >> 1));
  return { ox, oy, lintel, scale, wordY, subY: wordY + 7 * scale + scale + 3, oneLine };
}

// ---------------------------------------------------------------------------------------------
// A PICTURE AS THE SPLASH PLAYS ONE (ui/endless_splash_draw.ts): the hall of gates, and the stair with no bottom
// (art/endless_stair.ts), are each handed over as one of these.

export interface EndlessScene {
  /** How many stages wake before the far fire. */
  gates: number;
  moment: typeof ES_MOMENT;
  /** When stage j wakes (j = gates: the far fire). */
  wake(j: number): number;
  /** How big stage k is on the screen beside the first (1). */
  near(k: number): number;
  paint(): EndlessPainting;
  /** The torches: where (picture pixels), the stage that lights each, how far its light reaches (0 far, 1, 2 near). */
  torches: readonly (readonly [number, number, number, number])[];
  /** How many of them (the first) are painted flickering, and each at moment i of ES_FLAMES. */
  flames: number;
  paintFlame(site: number, i: number): EndlessPatch;
  /** The waypoint: its middle, the stage that wakes it, how far its light reaches across and down (game pixels). */
  wayAt: readonly [number, number];
  wayStage: number;
  wayGlow: readonly [number, number];
  paintWay(i: number): EndlessPatch;
  fireAt: readonly [number, number];
  paintFire(i: number): EndlessPatch;
  /** Grain i of the dust off stage k, `a` seconds after it wakes (`land`: after the word lands): where, how big (picture pixels), how much of it is left (0 to 1); null when it is gone. */
  dust(k: number, i: number, a: number, land: boolean): readonly [number, number, number, number] | null;
  dustN(k: number, land: boolean): number;
  lettering(w: number, h: number, wordW: number, subW: number): EndlessLettering;
}

/** THE HALL OF GATES as the splash plays it. */
export const HALL_SCENE: EndlessScene = {
  gates: ES_GATES,
  moment: ES_MOMENT,
  wake: endlessWake,
  near: endlessNear,
  paint: paintEndlessSplash,
  torches: ES_TORCH_AT.map(([x, y]) => [x, y, 0, 2] as const),
  flames: 2,
  paintFlame: paintEndlessFlame,
  wayAt: ES_WAY_AT,
  wayStage: 1,
  wayGlow: [84, 24],
  paintWay: paintEndlessWay,
  fireAt: ES_FIRE_AT,
  paintFire: paintEndlessFire,
  dustN: (k, land) => (land ? 34 : Math.round(4 + 12 * endlessNear(k))),
  dust: (k, i, a, land) => {
    const s = land ? 977 : 0;
    const life = 0.55 + rnd(i, k, 307 + s) * 0.45;
    const age = a - rnd(i, k, 301 + s) * 0.07;
    if (age < 0 || age > life) return null;
    const big = endlessNear(k);
    const [cx, cy] = endlessCrown(k, (rnd(i, k, 311 + s) * 2 - 1) * (land ? 0.68 : 1));
    return [cx + (rnd(i, k, 313 + s) - 0.5) * 34 * big * age, cy + (26 * age + 300 * (land ? 1.5 : 1) * age * age) * big + 1, big > 0.45 && rnd(i, k, 317 + s) > 0.5 ? 2 : 1, Math.ceil((1 - age / life) * 4) / 4];
  },
  lettering: endlessLettering,
};
