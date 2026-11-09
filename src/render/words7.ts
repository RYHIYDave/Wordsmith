// THE SEVEN NEW WORDS' LOOKS: Piercing, Bleeding, Reaping, Culling, Surging, Plundering and Mirroring,
// for the last levels (floor 16 down). A mock-up of the art chat's, behind WORDS7_LOOK, which is OFF:
// with it off nothing here is drawn or called, and the game is as it was. Their rules are the main
// chat's (its branch words7); this is how each LOOKS, its rune stone, its colours, and each of its three
// sides at work: in front, behind, and on a monster.
//
// His words (the main chat's board post, 8 Nov 2026, 07:55): “I want 6 more words for the last levels”,
// “At least 6”, “Add mirroring as well”; and of the new words, “And those all craftable as well”.
//
// Step 1 is a sheet of stills (docs/mockups/words7/pictures/words7_looks.png): each word's stone, its
// colours, and one key frame of each side in the practice room. Every look is drawn here as a function of
// its own clock (`Act.t`), so that a still is one moment of the same drawing the next step will animate.
//
// HOW IT IS CALLED (all of it only while WORDS7_LOOK.on): render.ts ticks it (tickW7), draws what lies on
// the floor under the figures (floorW7), what is in the air over them (airW7), its lights (lightsW7),
// a monster's own picture changed by a word (lookW7: a spirit raised by Reaping, one cut down by Culling)
// and the hero's glass reflection (heroW7, Mirroring). The playtest plays the looks by hand through
// `__dbg.words7` (demoW7, at the foot of this file); the rules will one day call `playW7`.

import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { P } from '../art/palette';
import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { hash2 } from '../engine/rng';
import type { Game } from '../game/game';
import type { Monster } from '../game/state';
import type { Cam, Fx } from './fx';
import { wx, wy } from './fx';

/** The switch. Off: nothing here is drawn or called, and the game is as it was. */
export const WORDS7_LOOK = { on: false };

export type W7Word = 'piercing' | 'bleeding' | 'reaping' | 'culling' | 'surging' | 'plundering' | 'mirroring';
export const W7_WORDS: readonly W7Word[] = ['piercing', 'bleeding', 'reaping', 'culling', 'surging', 'plundering', 'mirroring'];
export const W7_NAME: Record<W7Word, string> = { piercing: 'Piercing', bleeding: 'Bleeding', reaping: 'Reaping', culling: 'Culling', surging: 'Surging', plundering: 'Plundering', mirroring: 'Mirroring' };
export type W7Side = 'front' | 'behind' | 'monster';
export const W7_SIDES: readonly W7Side[] = ['front', 'behind', 'monster'];

/**
 * Each word's colours, darkest to brightest (the last its white-hot); index 3 its own colour (its name,
 * its rune), index 4 its glow, as every word's. Each is at least 12 from every other word, the melds,
 * the friend's cyan and the enemy's pink and gold, as the eye sees colour (CIEDE2000, Binding's check;
 * tests/words7.test.ts). The space is crowded: the words' blues, reds, golds and silvers are taken, so
 * Bleeding is a DEEP red (its glow the bright one), Surging a deep storm blue, Plundering an old dark
 * brass, Culling a grey dusk violet with a bone glow.
 */
export const W7_RAMP: Record<W7Word, readonly string[]> = {
  // polished steel, white light
  piercing: ['#14161a', '#3a3e44', '#767a7c', '#b4b4ae', '#eef0f2', '#ffffff'],
  // deep arterial red, bright where it runs fresh
  bleeding: ['#140105', '#300309', '#56060f', '#800818', '#d0182c', '#ff8a7a'],
  // the grey-green of grave moss, pale soul-light
  reaping: ['#0c1410', '#1e3026', '#3e5a4a', '#6c8a78', '#cfe6d4', '#f4fff6'],
  // dusk violet, bone
  culling: ['#100c18', '#262036', '#4a4462', '#787890', '#e6dcc8', '#fffaf0'],
  // a storm's deep blue, its white
  surging: ['#060c22', '#0e1c4a', '#1a3070', '#2a4a9a', '#a8c4ff', '#ffffff'],
  // old coin and brass, tarnished dark, bright where it is rubbed
  plundering: ['#1a1404', '#3a2e08', '#5e4c06', '#907806', '#c8c47a', '#f4f0d0'],
  // silver glass, the cool green of a mirror's edge
  mirroring: ['#0e1614', '#2a3a36', '#647c74', '#b4d2c6', '#e8f6f0', '#ffffff'],
};
export const W7_COLOR = Object.fromEntries(W7_WORDS.map((w) => [w, W7_RAMP[w][3]])) as Record<W7Word, string>;
export const W7_GLOW = Object.fromEntries(W7_WORDS.map((w) => [w, W7_RAMP[w][4]])) as Record<W7Word, string>;

/** A monster's side of every word: the enemy's own pink burning to gold (his rule: pink and gold glows are the enemy's), on dark. */
export const W7_ENEMY: readonly string[] = ['#0e050a', '#2a0c1c', '#5a1438', '#c02860', '#ff4f8a', '#ffd27a'];
/** The enemy's fire: pink, burning to gold, white-gold at its heart. */
const ENEMY_FIRE: readonly string[] = ['#2a0c1c', '#5a1438', '#c02860', '#ff4f8a', '#ffd27a', '#fff2c8'];
/** A monster's Bleeding on the hero: dark blood, its wet glint the enemy's pink. */
const ENEMY_BLOOD: readonly string[] = ['#12040a', '#34061a', '#5c0a28', '#8a0c30', '#ff4f8a', '#ffd27a'];
/** What glows on a friend: cyan (his rule). The spirit Reaping raises and Mirroring's glass show they fight for him by it. */
export const W7_FRIEND: readonly string[] = ['#0a3a46', '#127888', '#28dcf0', '#5ce8f8'];
/** Dust and grit off the floor. */
const DUST: readonly string[] = ['#4a4038', '#6a5e50', '#8a7c6a', '#a89a86'];
/** Dust raised in the dark: grey-brown, a little lit along its tops. */
const DUSK_DUST: readonly string[] = ['#2a2430', '#3a3240', '#4c4250', '#625660', '#7c6e72'];
/** Briars: dark red wood, lit along their tops; the thorns' points. */
const BRIAR: readonly string[] = ['#1c0408', '#3a0a10', '#5c1018', '#8a1c24', '#b83a3a'];
const THORN = '#e0b4a4';

/**
 * Their glyphs, cut in the rune stone as the others are (art/icons.ts, GLYPH): 7 by 7, 'X' the word's
 * colour, 'o' its glow.
 */
export const W7_GLYPH: Record<W7Word, readonly string[]> = {
  // a needle through a ring, lit where it comes out
  piercing: ['......o', '..XXXo.', '.X..oX.', '.X.o.X.', '.XX..X.', '.XXXX..', 'X......'],
  // a drop split by a cut, its cut edge running bright
  bleeding: ['...X...', '..XXX..', '.XXX.X.', 'XXX.oXX', 'XX.oXXX', '..oXXX.', '..XXX..'],
  // a sickle, its edge lit
  reaping: ['..XXXX.', '.o....X', 'o.....X', '.....X.', '....X..', '...X...', '..X....'],
  // an executioner's axe over a line, its edge bone
  culling: ['.oXX.X.', 'oXXXXX.', 'oXXXXX.', '.oXX.X.', '.....X.', '.......', 'XXXXXXX'],
  // three arcs rising
  surging: ['..XXX..', '.X...X.', 'X.ooo.X', '.o...o.', 'o.XXX.o', '.X...X.', '...o...'],
  // a coin in a grasping hand
  plundering: ['..XXX..', '.XoooX.', '.Xo.oX.', 'X.XXX.X', 'XX...XX', '.XXXXX.', '..XXX..'],
  // two facing halves, the one its reflection
  mirroring: ['..X.o..', '.XX.oo.', 'XXX.ooo', 'XXX.ooo', 'XXX.ooo', '.XX.oo.', '..X.o..'],
};
export const W7_GLYPH_IS: Record<W7Word, string> = {
  piercing: 'a needle through a ring',
  bleeding: 'a drop split by a cut',
  reaping: 'a sickle',
  culling: "an executioner's axe over a line",
  surging: 'three arcs rising',
  plundering: 'a coin in a grasping hand',
  mirroring: 'two facing halves',
};

/** Its rune stone, cut as the others are (art/icons.ts, runeSprite). */
export function w7Rune(word: W7Word): Sprite {
  const rows = ['............', '..11111111..', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '..33333333..', '............'];
  const p = new Px(12, 12);
  const tone: Record<string, string> = { '1': P.st6, '2': P.st5, '3': P.st3 };
  rows.forEach((row, y) => [...row].forEach((ch, x) => tone[ch] && p.set(x, y, tone[ch])));
  const g = W7_GLYPH[word];
  const on = (gx: number, gy: number): boolean => gy >= 0 && gy < 7 && gx >= 0 && gx < 7 && g[gy].charAt(gx) !== '.';
  for (let gy = 0; gy < 7; gy++) {
    for (let gx = 0; gx < 7; gx++) {
      if (!on(gx, gy)) continue;
      if (!on(gx, gy - 1)) p.set(3 + gx, 2 + gy, P.st3);
      if (!on(gx - 1, gy)) p.set(2 + gx, 3 + gy, P.st3);
    }
  }
  for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 7; gx++) if (on(gx, gy)) p.set(3 + gx, 3 + gy, g[gy].charAt(gx) === 'o' ? W7_GLOW[word] : W7_COLOR[word]);
  return p.outline(P.ink).sprite(6, 10);
}

/** How long each look takes, in seconds, as the pictures want it (how often and how strong are the rules'). */
export const W7_TIME = {
  /** Piercing: its shot's speed (tiles a second); the lance's wait (the rules' half a second) and its fall. */
  pierceSpeed: 26,
  lanceWait: 0.5,
  lanceFall: 0.06,
  /** A monster's shot through a wall (tiles a second). */
  ghostSpeed: 11,
  /** Bleeding: the thorns burst up over this. */
  thornsGrow: 0.22,
  /** Reaping: the soul's flight; the spirit's life (the rules' 6 s). */
  soulFlight: 0.55,
  spirit: 6,
  /** Culling: the slash sweeps through in this (two pictures at 30 a second). */
  cullSweep: 0.06,
  /** Surging: a shockwave's run out; a monster's warning ring before its wave. */
  surge: 0.42,
  warn: 1.0,
  /** Plundering: coins in the air; the stream into his purse. */
  coins: 0.7,
  purse: 0.45,
  /** Mirroring: shards flung back. */
  shards: 0.28,
};

// =============================================================================================
// What is going on.

/** One look at work: a word's side, its own clock, where it is (world), whom it is about. */
export interface Act {
  id: number;
  word: W7Word;
  side: W7Side;
  t: number;
  dur: number;
  seed: number;
  x: number;
  y: number;
  /** A second place: where a line ends, whom a soul flies to, where a roll ended. */
  x1: number;
  y1: number;
  /** A way (world, unit): a shot's, a blow's, a facing. */
  dx: number;
  dy: number;
  /** Monsters it is about, in order (the pierced, the bleeding, the spirit and the one it strikes...). */
  ids: number[];
  /** How far along a line each of `ids` stands (tiles), or a path walked (world x, y ...). */
  pts: number[];
  r: number;
  /** Reaping on a monster: how far into its fall the corpse lies (seconds), and its place in fx.fallen while it rises (-1: none). */
  dieT: number;
  fall: number;
}

export const W7 = {
  clock: 0,
  acts: [] as Act[],
  next: 1,
  /** The hero's picture as last drawn, and where (for the mirror that repeats his attack). */
  heroSp: null as Sprite | null,
};

export function clearW7(): void {
  W7.acts.length = 0;
  W7.heroSp = null;
}

export type W7Options = Partial<Omit<Act, 'id' | 'word' | 'side' | 'seed'>> & { seed?: number };

/** A look begins. */
export function playW7(word: W7Word, side: W7Side, o: W7Options): Act {
  const a: Act = {
    id: W7.next++,
    word,
    side,
    t: o.t ?? 0,
    dur: o.dur ?? 2,
    seed: o.seed ?? Math.floor(Math.random() * 1e6),
    x: o.x ?? 0,
    y: o.y ?? 0,
    x1: o.x1 ?? o.x ?? 0,
    y1: o.y1 ?? o.y ?? 0,
    dx: o.dx ?? 1,
    dy: o.dy ?? 0,
    ids: o.ids ?? [],
    pts: o.pts ?? [],
    r: o.r ?? 1,
    dieT: o.dieT ?? 0,
    fall: o.fall ?? -1,
  };
  W7.acts.push(a);
  return a;
}

const TAU = Math.PI * 2;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (q: number): number => 1 - (1 - clamp01(q)) ** 3;
const smooth = (q: number): number => {
  const k = clamp01(q);
  return k * k * (3 - 2 * k);
};
const live = (a: Act, game: Game, i = 0): Monster | undefined => game.monsters.find((m) => m.id === a.ids[i] && !m.dead);
const topOf = (m: Monster): number => FIGURE_SIZE[figureOf(m)].top;

// =============================================================================================
// The brushes: every look is painted with these, pixel by pixel, never a flat shape.

/** Whether a pixel is in, for a see-through `a` (0..1): scattered as grain is, never in a pattern. Only what thins or fades is drawn so. */
const dith = (x: number, y: number, a: number, seed = 77): boolean => a > hash2(Math.round(x), Math.round(y), seed);

function dot(g: CanvasRenderingContext2D, x: number, y: number, c: string, w = 1, h = 1): void {
  g.fillStyle = c;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/** Smooth value noise, 0..1. */
function vnoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const u = smooth(x - x0);
  const v = smooth(y - y0);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/**
 * A streak from its tail (x0, y0) to its head (x1, y1): `w` pixels across at the head, one at the
 * tail; its tones from the ramp's `from` at the tail to its brightest at the head, its edges a tone
 * darker. Solid; only its tail breaks up as it thins (and all of it, as `alpha` goes).
 */
function streak(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, C: readonly string[], w = 1, from = 0, alpha = 1): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const n = Math.max(1, Math.round(Math.max(Math.abs(dx), Math.abs(dy))));
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let s = 0; s <= n; s++) {
    const q = s / n;
    const px = x0 + dx * q;
    const py = y0 + dy * q;
    if (q < 0.25 && !dith(px, py, q / 0.25 + 0.15)) continue;
    if (alpha < 1 && !dith(px, py, alpha)) continue;
    const ci = Math.min(C.length - 1, Math.floor(from + q * (C.length - from)));
    const half = Math.round(((w - 1) / 2) * q);
    for (let k = -half; k <= half; k++) {
      const edge = half > 0 && Math.abs(k) === half;
      dot(g, px + nx * k, py + ny * k, C[Math.max(0, ci - (edge ? 1 : 0))]);
    }
  }
}

/**
 * A blade's smear: swept along an ellipse (rx, ry) from angle `a0` (its tail) to `a1` (its head), `w`
 * across at its head and one at its tail, its outer edge the brightest, its body darker in toward the
 * middle; `tilt` slants its plane. Solid, its tail breaking up as it thins.
 */
function smear(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w: number, C: readonly string[], tilt = 0, fade = 1, sheen = false): void {
  const n = Math.max(10, Math.round(Math.abs(a1 - a0) * Math.max(rx, ry) * 1.6));
  for (let i = 0; i <= n; i++) {
    const q = i / n;
    const an = a0 + (a1 - a0) * q;
    const ox = Math.cos(an);
    const oy = Math.sin(an);
    const wq = Math.max(1, Math.round(1 + (w - 1) * Math.pow(q, 0.8)));
    for (let j = 0; j < wq; j++) {
      const px = cx + ox * (rx - j);
      const py = cy + oy * (ry - (j * ry) / rx) + ox * (rx - j) * tilt;
      if (q < 0.4 && !dith(px, py, q / 0.4)) continue;
      if (fade < 1 && !dith(px, py, fade)) continue;
      let c = j === 0 ? (q > 0.75 ? C[5] : C[4]) : j === 1 ? (q > 0.55 ? C[4] : C[3]) : j < wq - 1 ? C[3] : C[2];
      if (sheen && j > 0 && (i + j * 4) % 11 < 2) c = C[5];
      dot(g, px, py, c);
    }
  }
}

/** A sharp star of light: spikes of uneven length, never a disc. */
function star(g: CanvasRenderingContext2D, x: number, y: number, r: number, C: readonly string[], seed: number, n = 6, rot = 0, flat = 0.75): void {
  for (let i = 0; i < n; i++) {
    const a = rot + (i * TAU) / n + (hash2(i, seed, 3) - 0.5) * 0.5;
    const L = r * (i % 2 === 0 ? 1 : 0.5) * (0.7 + 0.3 * hash2(i, seed, 4));
    streak(g, x + Math.cos(a) * L, y + Math.sin(a) * L * flat, x, y, C, i % 2 === 0 ? 2 : 1, Math.max(0, C.length - 4));
  }
  dot(g, x - 1, y, C[C.length - 1], 3, 1);
  dot(g, x, y - 1, C[C.length - 1], 1, 3);
}

/** A little four-pointed glint. */
function glint(g: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, core = '#ffffff'): void {
  for (let k = 1; k <= r; k++) {
    dot(g, x - k, y, c);
    dot(g, x + k, y, c);
    dot(g, x, y - k, c);
    dot(g, x, y + k, c);
  }
  dot(g, x, y, core);
}

/**
 * A tongue of fire licking up from (x, y): `h` tall, `w` wide at its root; hottest at its heart and its
 * root, its edges dark, its top torn into licks that break off.
 */
function flame(g: CanvasRenderingContext2D, x: number, y: number, h: number, w: number, C: readonly string[], seed: number, t: number): void {
  const H = Math.max(2, Math.round(h));
  for (let r = 0; r < H; r++) {
    const q = r / H;
    const sway = Math.sin(q * 3.2 + t * 8 + seed * 7) * q * 2.4 + Math.sin(t * 13 + seed + r * 0.7) * q * 0.8;
    const half = (w / 2) * Math.pow(1 - q, 0.55) * (0.8 + 0.4 * vnoise(r * 0.5, t * 6, seed));
    if (half < 0.35) continue;
    const cx = x + sway;
    for (let dx = -Math.ceil(half); dx <= Math.ceil(half); dx++) {
      const d = Math.abs(dx) / half;
      if (d > 1) continue;
      if (q > 0.45 && vnoise((cx + dx) * 0.7, r * 0.5 - t * 12, seed + 9) < (q - 0.45) * 1.5) continue;
      const heat = (1 - q) * 0.6 + (1 - d) * 0.6 - 0.15 + (vnoise(dx * 0.6 + seed, r * 0.4 - t * 10, seed + 5) - 0.5) * 0.4;
      dot(g, cx + dx, y - r, C[Math.max(0, Math.min(C.length - 1, Math.floor(heat * C.length)))]);
    }
  }
}

/** Mist, smoke or dust: a soft cloud of uneven billows, curling as it rises, thinning to scattered grains at its edge; `C` its tones, thin to thick. */
function mist(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, C: readonly string[], amount: number, seed: number, t: number, rise = 0.9): void {
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const e = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      if (e > 1) continue;
      const x = Math.round(cx + dx);
      const y = Math.round(cy + dy);
      const n = vnoise(x * 0.16 + Math.sin(y * 0.13 + t * 1.3) * 0.8, y * 0.2 + t * rise * 3, seed) * 0.7 + vnoise(x * 0.45, y * 0.5 + t * rise * 5, seed + 3) * 0.3;
      const v = Math.pow(1 - e, 0.8) * amount * n * n * 2.2;
      const cut = 0.32 + (hash2(x, y, seed + 11) - 0.5) * 0.16;
      if (v < cut) continue;
      dot(g, x, y, C[Math.max(0, Math.min(C.length - 1, Math.floor(((v - 0.32) / 0.6) * C.length)))]);
    }
  }
}

/** A splash of blood on the floor: a ragged pool, darker at its rim, a wet glint, flecks thrown on along (ex, ey). */
function splat(g: CanvasRenderingContext2D, x: number, y: number, size: number, C: readonly string[], seed: number, ex = 1, ey = 0, wet = 1): void {
  const rx = size * 1.5;
  const ry = size * 0.75;
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const e = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) + (hash2(dx + 9, dy + 9, seed) - 0.5) * 0.7;
      if (e > 1) continue;
      dot(g, x + dx, y + dy, e > 0.55 ? C[1] : C[2]);
    }
  }
  if (wet > 0.3) dot(g, x - Math.round(rx * 0.3), y - Math.round(ry * 0.3), C[4]);
  // flecks thrown on the way it was going
  for (let i = 0; i < 3; i++) {
    const d = rx + 1.5 + i * 1.6 + hash2(i, seed, 7) * 1.5;
    const s = (hash2(i, seed, 8) - 0.5) * 2.5;
    if (hash2(i, seed, 9) < 0.25) continue;
    dot(g, x + ex * d - ey * s, y + ey * d * 0.5 + ex * s * 0.5, C[1 + (i === 0 ? 1 : 0)]);
  }
}

/** A drop of blood in the air, drawn out along the way it falls, its top catching the light. */
function drop(g: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number, C: readonly string[], big = false): void {
  const sp = Math.hypot(vx, vy) || 1;
  const ux = vx / sp;
  const uy = vy / sp;
  const tail = big ? 3 : 1;
  for (let k = tail; k >= 1; k--) dot(g, x - ux * k, y - uy * k, k === tail ? C[1] : C[2]);
  dot(g, x, y, C[3]);
  if (big) {
    dot(g, x + 1, y, C[3]);
    dot(g, x, y + 1, C[2]);
    dot(g, x + 1, y + 1, C[2]);
  }
  dot(g, x, y - (big ? 0 : 1), C[4]);
}

/**
 * A coin: a disc of metal, its rim dark, its face lit, a stamp in it, seen as it turns (`spin`): face on
 * it is five across and three down (it lies under the eye on a slant), edge on one across.
 */
function coin(g: CanvasRenderingContext2D, x: number, y: number, spin: number, C: readonly string[], lying = false): void {
  x = Math.round(x);
  y = Math.round(y);
  if (lying) {
    // flat on the floor: a squat disc, its far rim lit, its near rim dark
    dot(g, x - 1, y - 1, C[4], 3, 1);
    dot(g, x - 2, y, C[3]);
    dot(g, x - 1, y, C[5]);
    dot(g, x, y, C[4], 2, 1);
    dot(g, x + 2, y, C[2]);
    dot(g, x - 1, y + 1, C[1], 3, 1);
    return;
  }
  const c = Math.abs(Math.cos(spin));
  const face = Math.cos(spin) > 0;
  if (c < 0.3) {
    // edge on: a thin bar of rim
    dot(g, x, y - 1, C[5]);
    dot(g, x, y, C[4]);
    dot(g, x, y + 1, C[2]);
    return;
  }
  if (c < 0.75) {
    dot(g, x - 1, y - 1, C[4], 2, 1);
    dot(g, x - 1, y, face ? C[5] : C[4]);
    dot(g, x, y, C[3]);
    dot(g, x - 1, y + 1, C[2], 2, 1);
    dot(g, x - 2, y, C[3]);
    dot(g, x + 1, y, C[2]);
    return;
  }
  dot(g, x - 1, y - 1, C[4], 3, 1);
  dot(g, x - 2, y, C[3]);
  dot(g, x - 1, y, face ? C[5] : C[4]);
  dot(g, x, y, C[3]);
  dot(g, x + 1, y, C[4]);
  dot(g, x + 2, y, C[2]);
  dot(g, x - 1, y + 1, C[2], 3, 1);
  dot(g, x - 1, y - 1, C[5]);
}

/** A sliver of glass, tumbling: a long splinter two across at its butt, one at its point, one edge catching the light, a dark edge on the other. */
function sliver(g: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, C: readonly string[]): void {
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  const n = Math.max(2, Math.round(len));
  for (let k = 0; k < n; k++) {
    const q = k / n;
    const px = x + ux * k;
    const py = y + uy * k;
    if (q < 0.6) {
      dot(g, px - uy, py + ux, C[1]);
      dot(g, px + uy, py - ux, C[4]);
    }
    dot(g, px, py, q > 0.7 ? C[5] : C[3]);
  }
}

/** A point on a quadratic curve. */
function quad(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, q: number): [number, number] {
  const u = 1 - q;
  return [u * u * x0 + 2 * u * q * cx + q * q * x1, u * u * y0 + 2 * u * q * cy + q * q * y1];
}

/** Screen point of a world place `z` pixels up. */
const S = (cam: Cam, x: number, y: number, z = 0): [number, number] => [wx(cam, x, y), wy(cam, x, y) - z];
/** A world radius as the screen lays it on the floor: across and down. */
const RX = 22.6;
const RY = 11.3;

// =============================================================================================
// PIERCING

/** In front: a white streak punching through every one in a line, a puncture flare at each, steel spall out the far side. */
function pierceFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.piercing;
  const z = 14;
  const head = a.t * W7_TIME.pierceSpeed;
  const reach = a.r;
  const at = (s: number): [number, number] => S(cam, a.x + a.dx * s, a.y + a.dy * s, z);
  const h = Math.min(head, reach);
  const fade = head > reach ? clamp01(1 - (head - reach) / 4) : 1;
  if (fade > 0) {
    // the long wake of it, then the bright needle, then its point of white light
    const [tx, ty] = at(Math.max(0, h - 4.5));
    const [mx, my] = at(Math.max(0, h - 1.6));
    const [hx, hy] = at(h);
    streak(g, tx, ty + 1, mx, my + 1, [C[1], C[2], C[2], C[3]], 2, 0, fade);
    streak(g, tx, ty, mx, my, [C[2], C[3], C[4]], 1, 0, fade);
    streak(g, mx, my, hx, hy, [C[3], C[4], C[5], C[5]], 3, 0, fade);
    if (head <= reach) {
      const [px, py] = at(h + 0.25);
      streak(g, hx, hy, px, py, [C[4], C[5]], 1);
      dot(g, hx - 1, hy - 1, C[4], 3, 3);
      dot(g, hx, hy, C[5]);
      glint(g, Math.round(px), Math.round(py), 2, C[4]);
    }
  }
  // each one it went through
  a.ids.forEach((id, i) => {
    const s = a.pts[i] ?? 0;
    const since = (head - s) / W7_TIME.pierceSpeed;
    if (since < 0) return;
    const m = game.monsters.find((q) => q.id === id);
    const [cx, cy] = at(s);
    // a hole of light straight through it, for an instant
    if (since < 0.1) {
      const [ax, ay] = at(s - 0.4);
      const [bx, by] = at(s + 0.4);
      streak(g, ax, ay, bx, by, [C[4], C[5]], 1);
    }
    // the puncture: a sharp star where it went in and out
    if (since < 0.3) {
      const k = 1 - since / 0.3;
      star(g, cx, cy, 4 + 8 * k, C, a.seed + i * 17, 8, i * 0.4);
    }
    // spall: steel-white splinters flung on out of the far side, falling as they go
    if (since < 0.5 && m) {
      const [ex, ey] = at(s + 0.3);
      const vx = (a.dx - a.dy) * 16;
      const vy = (a.dx + a.dy) * 8;
      const vl = Math.hypot(vx, vy) || 1;
      const ux = vx / vl;
      const uy = vy / vl;
      for (let j = 0; j < 7; j++) {
        const sp = 80 + hash2(j, a.seed + i, 1) * 80;
        const side = (hash2(j, a.seed + i, 2) - 0.5) * 1.6;
        const d = sp * since;
        const px = ex + ux * d - uy * side * d * 0.6;
        const py = ey + uy * d + ux * side * d * 0.6 + 140 * since * since - 40 * since * hash2(j, i, 3);
        streak(g, px - ux * 4 + uy * side * 2, py - uy * 4 - ux * side * 2, px, py, [C[2], C[3], C[5]], 1, 0, clamp01(1.2 - since / 0.5));
      }
    }
  });
}

/** Behind: a lance of light slams down the line half a second after, and leaves a thin crack. */
function pierceBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.piercing;
  const [x0, y0] = S(cam, a.x, a.y);
  const [x1, y1] = S(cam, a.x1, a.y1);
  const after = a.t - W7_TIME.lanceWait - W7_TIME.lanceFall;
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const n = Math.round(len);
  if (layer === 'floor') {
    // waiting: the line it will come down on, a scratch of light that quickens
    if (a.t < W7_TIME.lanceWait) {
      const k = a.t / W7_TIME.lanceWait;
      for (let s = 0; s <= n; s++) if (dith(x0 + ux * s, y0 + uy * s, 0.3 + 0.5 * k * (0.5 + 0.5 * Math.sin(a.t * (12 + 30 * k) + s * 0.3)))) dot(g, x0 + ux * s, y0 + uy * s, C[3]);
    }
    // the crack it leaves: a thin jagged split along the line, white-hot at first, then dark with light down in it
    if (after > 0) {
      const glow = clamp01(1 - after / 0.4);
      const gone = clamp01(1 - (after - 1.2) / 0.6);
      let wob = 0;
      for (let s = 0; s <= n; s++) {
        wob += (hash2(s, a.seed, 5) - 0.5) * 0.9;
        wob *= 0.8;
        const px = x0 + ux * s - uy * wob;
        const py = y0 + uy * s + ux * wob;
        if (gone < 1 && !dith(px, py, gone)) continue;
        dot(g, px, py, glow > 0.3 ? C[5] : '#0c0a10');
        dot(g, px, py + 1, glow > 0.3 ? C[3] : C[1]);
        if (hash2(s, a.seed, 6) < 0.1) {
          const sd = hash2(s, a.seed, 7) < 0.5 ? 1 : -1;
          for (let k = 1; k < 3 + hash2(s, a.seed, 8) * 4; k++) dot(g, px + k * (hash2(k, s, a.seed) < 0.5 ? 1 : 0), py + sd * k * 0.6 + 1, glow > 0.3 ? C[4] : '#0c0a10');
        }
      }
      // the stone either side of it lit by the blow, a pixel or two, fading
      if (glow > 0) {
        for (let s2 = 0; s2 <= n; s2++) {
          for (const off of [-2, 2]) {
            const px = x0 + ux * s2 - uy * off;
            const py = y0 + uy * s2 + ux * off * 0.5;
            if (dith(px, py, glow * 0.7)) dot(g, px, py, C[3]);
          }
        }
      }
    }
    return;
  }
  // in the air: high above, the lance forming; then it comes down, its fall a sheet of light behind it; then it lies along the line, burning out
  const fall = a.t - W7_TIME.lanceWait;
  if (fall < 0) {
    const k = a.t / W7_TIME.lanceWait;
    if (k > 0.4) lance(g, x0, y0 - 80, x1, y1 - 80, C, ((k - 0.4) / 0.6) * 0.7);
    return;
  }
  const k = clamp01(fall / W7_TIME.lanceFall);
  const z = 80 * (1 - k * k);
  const burn = after > 0 ? clamp01(1 - (after - 0.15) / 0.3) : 1;
  // it comes down head first and slanting, its butt the higher: its head strikes the far end and its shaft slams down along the line
  const zb = z + 12;
  const zh = z + 1;
  // the way it came down: a sheet of light smeared above it, thinning upward
  const blur = after > 0 ? clamp01(1 - after / 0.15) : 1;
  if (blur > 0) {
    for (let s2 = 0; s2 <= len; s2++) {
      const q = s2 / len;
      const top = 22 * blur * (0.5 + 0.5 * q);
      const zz = zb + (zh - zb) * q;
      for (let up = 2; up < top; up++) {
        const px = x0 + ux * s2;
        const py = y0 + uy * s2 - zz - 2 - up;
        if (dith(px, py, (1 - up / top) * 0.6 * blur, 31)) dot(g, px, py, up < top * 0.35 ? C[2] : C[1]);
      }
    }
  }
  if (burn > 0) lance(g, x0, y0 - zb - 2, x1, y1 - zh - 2, C, burn);
  if (after > 0 && after < 0.5) {
    const q = after / 0.5;
    // the blow: sparks of steel-white light flung up and out along it, falling
    for (let i = 0; i < 22; i++) {
      const s = hash2(i, a.seed, 11) * len;
      const sd = i % 2 === 0 ? 1 : -1;
      const sp = 40 + hash2(i, a.seed, 12) * 60;
      const bx = x0 + ux * s;
      const by = y0 + uy * s - 2;
      const vx = -uy * sd * sp * 1.2 + ux * (hash2(i, a.seed, 18) - 0.5) * 40;
      const vy = ux * sd * sp * 0.5 - (70 + hash2(i, a.seed, 17) * 70);
      const px = bx + vx * after;
      const py = by + vy * after + 320 * after * after;
      if (py > by + 3) continue;
      streak(g, px - vx * 0.035, py - (vy + 640 * after) * 0.035, px, py, [C[2], C[3], C[4], C[5]], 1, 0, 1 - q * 0.6);
    }
  }
}

/**
 * A lance of light along a line: a long shaft, a guard, and a broad leaf-shaped head at the far end
 * ridged down its middle, a knob at its butt; `a` how much of it is there.
 */
function lance(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, C: readonly string[], a: number): void {
  if (a <= 0) return;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const n = Math.round(len);
  const at = (s: number, k: number): [number, number] => [x0 + ux * s - uy * k, y0 + uy * s + ux * k];
  for (let s = 0; s <= n; s++) {
    const q = s / n;
    const [px, py] = at(s, 0);
    if (a < 1 && !dith(px, py, a)) continue;
    if (q < 0.03) {
      // the knob at its butt
      for (let k = -2; k <= 2; k++) dot(g, ...at(s, k), k < 0 ? C[4] : k === 0 ? C[3] : C[2]);
      continue;
    }
    if (q < 0.68) {
      // the shaft: a core of white light, lit above, dark below
      dot(g, ...at(s, -1), C[4]);
      dot(g, px, py, C[5]);
      dot(g, ...at(s, 1), C[2]);
      continue;
    }
    if (q < 0.71) {
      // the guard across it
      for (let k = -5; k <= 5; k++) dot(g, ...at(s, k), Math.abs(k) === 5 ? C[2] : k < 0 ? C[4] : k === 0 ? C[5] : C[3]);
      continue;
    }
    // the head: swelling to eleven across and drawn to a point, a ridge of white down its middle
    const u = (q - 0.71) / 0.29;
    const half = Math.max(0, Math.round(u < 0.3 ? 1.5 + (u / 0.3) * 3.6 : 5.1 * Math.pow(1 - (u - 0.3) / 0.7, 0.85)));
    for (let k = -half; k <= half; k++) {
      const edge = Math.abs(k) === half && half > 0;
      dot(g, ...at(s, k), k === 0 ? C[5] : edge ? (k < 0 ? C[3] : C[1]) : k < 0 ? C[4] : C[3]);
    }
  }
}

/** On a monster: its shot ghosts through a wall, the stone lit pink where it comes out. */
function pierceMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act): void {
  const C = W7_ENEMY;
  const z = 16;
  const head = a.t * W7_TIME.ghostSpeed;
  const wall = a.r;
  const dx = a.x1 - a.x;
  const dy = a.y1 - a.y;
  const L = Math.hypot(dx, dy) || 1;
  const at = (s: number): [number, number] => S(cam, a.x + (dx / L) * s, a.y + (dy / L) * s, z);
  // where it passes through the wall's face: the stone lit pink, rings of light running out over it, cracks of light in it
  const since = (head - wall) / W7_TIME.ghostSpeed;
  const [wxp, wyp] = at(wall);
  if (since > -0.1 && since < 0.7) {
    const k = clamp01((since + 0.1) / 0.8);
    mist(g, wxp, wyp, 14, 18, [C[1], C[2], C[2], C[3]], 0.9 * (1 - k), a.seed, a.t, 0.2);
    for (let ring = 0; ring < 3; ring++) {
      const rr = 3 + ring * 5 + k * 9;
      const n = Math.round(rr * 7);
      for (let i = 0; i < n; i++) {
        const an = (i / n) * TAU;
        if (vnoise(i * 0.5, ring * 3, a.seed) < 0.3) continue;
        const px = wxp + Math.cos(an) * rr * 0.55;
        const py = wyp + Math.sin(an) * rr;
        if (k > 0.5 && !dith(px, py, (1 - k) * 2)) continue;
        dot(g, px, py, ring === 0 ? C[5] : ring === 1 ? C[4] : C[3]);
      }
    }
    for (let i = 0; i < 6; i++) {
      let px = wxp;
      let py = wyp;
      const an = (i / 6) * TAU + hash2(i, a.seed, 2);
      for (let s = 0; s < 7 + hash2(i, a.seed, 3) * 6; s++) {
        px += Math.cos(an) * 0.55 + (hash2(s, i, a.seed) - 0.5) * 0.9;
        py += Math.sin(an) * 1.2 + (hash2(s, i, a.seed + 1) - 0.5) * 0.9;
        if (k < 0.6 || dith(px, py, (1 - k) * 2.5)) dot(g, px, py, s < 3 ? C[5] : C[4]);
      }
    }
    if (since > 0 && since < 0.15) star(g, wxp, wyp, 9, C, a.seed, 8);
  }
  // the shot: a bolt of pink fire, gold-white at its heart, its tail licking out behind it; inside the stone only a ghost of it
  const h = Math.min(head, L);
  const n = 34;
  for (let i = n; i >= 0; i--) {
    const s = h - (i / n) * 1.5;
    if (s < 0) continue;
    const [px, py] = at(s);
    const q = 1 - i / n;
    const inside = s < wall;
    const wob = (vnoise(i * 0.7, a.t * 20, a.seed) - 0.5) * 3 * (1 - q);
    if (inside && !dith(px, py, 0.45)) continue;
    const half = q > 0.8 ? 1.5 : q > 0.45 ? 1 : 0;
    for (let j = -Math.round(half); j <= Math.round(half); j++) {
      const edge = Math.abs(j) === Math.round(half) && half > 0;
      const c = inside ? C[3] : q > 0.88 ? (edge ? C[4] : C[5]) : q > 0.6 ? (edge ? C[3] : C[4]) : q > 0.3 ? C[3] : C[2];
      dot(g, px, py + j + wob, c);
    }
  }
  if (h > wall) {
    const [hx, hy] = at(h);
    dot(g, hx - 2, hy - 1, C[4], 4, 3);
    dot(g, hx - 1, hy, C[5], 3, 1);
    glint(g, Math.round(hx + 2), Math.round(hy), 2, C[4], C[5]);
  }
}

// =============================================================================================
// BLEEDING

/** In front: what it struck bleeds: a wound, a spurt of drops, drips, and drops left on the floor where it walks. */
function bleedFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.bleeding;
  const m = live(a, game);
  if (layer === 'floor') {
    // the trail: a drop every so often where it walked, the older ones darker and dry
    for (let i = 0; i + 1 < a.pts.length; i += 2) {
      const [px, py] = S(cam, a.pts[i], a.pts[i + 1]);
      const age = (a.pts.length / 2 - i / 2) / (a.pts.length / 2);
      const nx = a.pts[i + 2] ?? a.pts[i];
      const ny = a.pts[i + 3] ?? a.pts[i + 1];
      const [qx, qy] = S(cam, nx, ny);
      const l = Math.hypot(qx - px, qy - py) || 1;
      splat(g, px, py, 1.2 + hash2(i, a.seed, 1) * 1.4, age > 0.6 ? ['#0a0002', C[1], C[1], C[2], C[2]] : C, a.seed + i, (qx - px) / l || 1, (qy - py) / l, 1 - age);
    }
    if (m) {
      const [mx, my] = S(cam, m.x, m.y);
      splat(g, mx - 3, my + 1, 1.8, C, a.seed + 99, -1, 0, 1);
    }
    return;
  }
  if (!m) return;
  const top = topOf(m);
  const [mx, my] = S(cam, m.x, m.y);
  const wx0 = mx;
  const wy0 = my - Math.round(top * 0.58);
  // the wound: a gash across it, its lips lit
  for (let k = 0; k < 6; k++) {
    dot(g, wx0 - 3 + k, wy0 - 2 + Math.round(k * 0.7), C[1]);
    dot(g, wx0 - 3 + k, wy0 - 3 + Math.round(k * 0.7), C[4]);
  }
  dot(g, wx0 - 1, wy0 - 2, C[5]);
  // the spurt, flung on the way the blow went
  const away = a.dx - a.dy >= 0 ? 1 : -1;
  if (a.t < 0.7) {
    for (let i = 0; i < 9; i++) {
      const tt = a.t - i * 0.025;
      if (tt <= 0) continue;
      const vx = away * (35 + hash2(i, a.seed, 2) * 45);
      const vy = -(35 + hash2(i, a.seed, 3) * 40);
      const px = wx0 + vx * tt;
      const py = wy0 + vy * tt + 170 * tt * tt;
      if (py > my + 3) continue;
      drop(g, px, py, vx, vy + 340 * tt, C, i < 4);
    }
  }
  // drips, running down it and falling
  for (let i = 0; i < 3; i++) {
    const ph = (a.t * 2.4 + i / 3 + hash2(i, a.seed, 4)) % 1;
    const py = wy0 + 1 + ph * ph * top * 0.58;
    if (py < my) drop(g, wx0 - 2 + i * 2, py, 0, 1, C, i === 1);
  }
}

/** Behind: briars burst up out of the floor, dark red and thorned, and cut whatever walks in them. Half of them stand in front of what walks there. */
function bleedBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const grow = easeOut(a.t / W7_TIME.thornsGrow);
  const over = a.t < W7_TIME.thornsGrow ? Math.sin((a.t / W7_TIME.thornsGrow) * Math.PI) * 0.15 : 0;
  const fade = clamp01((a.dur - a.t) / 0.5);
  const walker = live(a, game);
  const [cx, cy] = S(cam, a.x, a.y);
  const footY = walker ? S(cam, walker.x, walker.y)[1] : cy;
  if (layer === 'floor') {
    // the floor torn where they came up: dark earth, broken stone at the edges
    mist(g, cx, cy, a.r * RX * 0.95, a.r * RY * 0.95, ['#0c0406', '#160609', '#22080c'], 1.2 * fade, a.seed, 0, 0);
  }
  const N = 10;
  for (let i = 0; i < N; i++) {
    const an = (i / N) * TAU + (hash2(i, a.seed, 3) - 0.5) * 0.6;
    const d = (0.25 + 0.7 * hash2(i, a.seed, 4)) * a.r;
    const bx = Math.round(cx + Math.cos(an) * d * RX);
    const by = Math.round(cy + Math.sin(an) * d * RY);
    // in front of what walks there, or behind it
    const front = by > footY;
    if ((layer === 'air') !== front) continue;
    const tall = (13 + hash2(i, a.seed, 5) * 12) * (grow + over);
    const way = Math.cos(an) >= 0 ? 1 : -1;
    const reach = (7 + hash2(i, a.seed, 7) * 9) * way;
    const sway = Math.sin(a.t * 2.2 + i) * 0.8;
    // a stem: up out of the floor, arching over, its end hooked back down
    briar(g, [bx, by], [bx + reach * 0.25 + sway, by - tall * 1.4], [bx + reach + sway * 1.5, by - tall * 0.35], a.seed + i * 31, fade);
    // a second, thinner, off its root the other way
    if (i % 2 === 0) briar(g, [bx, by], [bx - reach * 0.3, by - tall * 0.9], [bx - reach * 0.7, by - tall * 0.5], a.seed + i * 37, fade, true);
    // the stone broken round its root
    dot(g, bx - 2, by, '#2a2024');
    dot(g, bx + 1, by + 1, DUST[1]);
    dot(g, bx + 2, by, DUST[0]);
  }
  // what walks in them is cut: small slashes on its legs, blood flicked off
  if (walker && layer === 'air' && a.t > W7_TIME.thornsGrow) {
    const [mx, my] = S(cam, walker.x, walker.y);
    const C = W7_RAMP.bleeding;
    for (let i = 0; i < 3; i++) {
      const lx = mx - 3 + i * 3;
      const ly = my - 5 - i * 3;
      dot(g, lx, ly, C[4], 2, 1);
      dot(g, lx + 1, ly + 1, C[3]);
      const ph = (a.t * 3 + i * 0.37) % 1;
      drop(g, lx + (i - 1) * ph * 7, ly - ph * 7 + ph * ph * 16, i - 1, ph * 2 - 1, C, i === 1);
    }
  }
}

/** One briar: a stem up out of the floor along a curve, thick at its root, thin at its end, lit along its top; thorns on alternate sides, swept back, pale at their points. */
function briar(g: CanvasRenderingContext2D, p0: [number, number], pc: [number, number], p1: [number, number], seed: number, fade: number, thin = false): void {
  const n = Math.max(8, Math.round((Math.hypot(pc[0] - p0[0], pc[1] - p0[1]) + Math.hypot(p1[0] - pc[0], p1[1] - pc[1])) * 1.2));
  let last: [number, number] | null = null;
  for (let s = 0; s <= n; s++) {
    const q = s / n;
    const [x, y] = quad(p0[0], p0[1], pc[0], pc[1], p1[0], p1[1], q);
    if (fade < 1 && !dith(x, y, fade)) continue;
    const thick = !thin && q < 0.3;
    dot(g, x, y, q > 0.9 ? BRIAR[3] : BRIAR[2]);
    dot(g, x, y - 1, q > 0.85 ? BRIAR[4] : BRIAR[3]);
    if (thick) dot(g, x + 1, y, BRIAR[1]);
    // thorns, every four pixels, on alternate sides, swept back toward the root
    if (last && s % 4 === 2 && q > 0.12 && q < 0.95) {
      const tx = x - last[0];
      const ty = y - last[1];
      const tl = Math.hypot(tx, ty) || 1;
      const sd = s % 8 === 2 ? 1 : -1;
      const ox = (-ty / tl) * sd;
      const oy = (tx / tl) * sd;
      dot(g, x + ox, y + oy, BRIAR[3]);
      dot(g, x + ox * 2 - tx / tl, y + oy * 2 - ty / tl, hash2(s, seed, 1) < 0.7 ? THORN : BRIAR[4]);
    }
    last = [x, y];
  }
}

/** On a monster: its blow cuts the hero, and he bleeds, in the enemy's colours: a slash of pink burning to gold, dark blood, its wet glint pink. */
function bleedMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const h = game.hero;
  const [hx, hy] = S(cam, h.x, h.y);
  const C = ENEMY_BLOOD;
  if (layer === 'floor') {
    for (let i = 0; i < 4; i++) {
      const since = a.t - 0.08 - i * 0.12;
      if (since < 0) continue;
      splat(g, hx - 5 + i * 3 + hash2(i, a.seed, 1) * 3, hy + 1 + (i % 2), 1.2 + hash2(i, a.seed, 2), C, a.seed + i, -1, 0, 1);
    }
    return;
  }
  // the slash across him: a crescent of the enemy's fire, white-gold at its edge, dark pink behind it
  const away = a.dx - a.dy >= 0 ? 1 : -1;
  if (a.t < 0.35) {
    const k = clamp01(a.t / 0.05);
    const fade = clamp01(1 - (a.t - 0.08) / 0.27);
    const a0 = away > 0 ? Math.PI * 1.15 : -Math.PI * 0.15;
    const a1 = a0 + away * -Math.PI * 1.0 * k;
    smear(g, hx, hy - 17, 15, 11, a0, a1, 4, [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[3], W7_ENEMY[4], W7_ENEMY[5]], -0.25 * away, fade);
  }
  // the cut on him, lit, and the blood flung off him the way the blow went
  for (let k = 0; k < 6; k++) {
    dot(g, hx - 3 + k, hy - 20 + k, C[4]);
    dot(g, hx - 3 + k, hy - 19 + k, C[2]);
  }
  for (let i = 0; i < 10; i++) {
    const tt = a.t - i * 0.012;
    if (tt <= 0 || tt > 0.6) continue;
    const vx = away * (30 + hash2(i, a.seed, 3) * 50);
    const vy = -(30 + hash2(i, a.seed, 4) * 45);
    const px = hx + vx * tt;
    const py = hy - 17 + vy * tt + 180 * tt * tt;
    if (py > hy + 2) continue;
    drop(g, px, py, vx, vy + 360 * tt, C, i < 4);
  }
  for (let i = 0; i < 2; i++) {
    const ph = (a.t * 2.2 + i * 0.5) % 1;
    drop(g, hx - 2 + i * 4, hy - 15 + ph * ph * 15, 0, 1, C, true);
  }
}

// =============================================================================================
// REAPING

/** In front: the kill's soul is torn out of it and flies to the hero, a wisp of pale soul-light, its tail streaming. */
function reapFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.reaping;
  const h = game.hero;
  const [cx, cy] = S(cam, a.x, a.y, 6);
  const [hx, hy] = S(cam, h.x, h.y, 20);
  const mx = (cx + hx) / 2;
  const my = Math.min(cy, hy) - 30;
  const fl = W7_TIME.soulFlight;
  // torn out of the body: a column of grave-mist rising off it, thinning
  if (a.t < fl + 0.3) {
    const k = clamp01(a.t / (fl + 0.3));
    mist(g, cx, cy - 8 - k * 8, 7, 12, [C[2], C[3], C[4]], 0.8 * (1 - k), a.seed, a.t, 1.2);
  }
  const q = clamp01(a.t / fl);
  if (q >= 1) {
    // taken in: a flare of soul-light round his hands
    const k = clamp01((a.t - fl) / 0.25);
    if (k < 1) star(g, hx, hy, 4 + 7 * (1 - k), C, a.seed, 6, 0.3);
    return;
  }
  const qq = smooth(q);
  // its tail along the way it came: a ragged ribbon of soul-light, thinning and torn into motes at its end
  const n = 40;
  for (let i = n; i >= 0; i--) {
    const back = (i / n) * 0.5;
    const u = qq - back;
    if (u < 0) continue;
    const [px, py] = quad(cx, cy, mx, my, hx, hy, u);
    const k = 1 - i / n;
    const half = 0.4 + k * k * 3.2;
    const wob = (vnoise(i * 0.35, a.t * 12, a.seed) - 0.5) * 5 * (1 - k);
    for (let j = -Math.round(half); j <= Math.round(half); j++) {
      const d = Math.abs(j) / (half + 0.01);
      const v = k * 0.8 + (1 - d) * 0.45 - 0.05;
      const yy = py + j + wob;
      if (k < 0.35 && !dith(px, yy, k / 0.35 + 0.1)) continue;
      dot(g, px, yy, C[Math.max(1, Math.min(5, Math.floor(v * 5.4)))]);
    }
  }
  // its head: a flame of soul-light, two hollows of eyes in it
  const [sx, sy] = quad(cx, cy, mx, my, hx, hy, qq);
  flame(g, sx, sy + 4, 11, 8, [C[2], C[3], C[4], C[4], C[5], C[5]], a.seed, a.t);
  dot(g, sx - 2, sy - 1, C[2]);
  dot(g, sx + 1, sy - 1, C[2]);
  dot(g, sx - 1, sy + 1, C[3], 2, 1);
  // motes shed off it, drifting up
  for (let i = 0; i < 9; i++) {
    const u = qq - 0.08 - hash2(i, a.seed, 1) * 0.35;
    if (u < 0) continue;
    const [px, py] = quad(cx, cy, mx, my, hx, hy, u);
    const age = (qq - u) * 2;
    dot(g, px + (hash2(i, a.seed, 2) - 0.5) * 10, py - age * 12, age < 0.4 ? C[5] : C[4]);
  }
}

/**
 * Behind: a kill raises its spirit to fight for him: a pale see-through copy of the slain, its edge the
 * friend's cyan (lookW7 paints it), its legs trailing away into grave-mist.
 */
function reapBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.reaping;
  const sp = live(a, game, 0);
  if (!sp) return;
  const [sx, sy] = S(cam, sp.x, sp.y);
  if (layer === 'floor') {
    // a pool of pale light under it, and a thread of mist back to the body it rose from
    mist(g, sx, sy, 14, 6, [C[2], C[3]], 0.6, a.seed, a.t, 0.2);
    const [bx, by] = S(cam, a.x, a.y);
    for (let i = 0; i <= 12; i++) {
      const q = i / 12;
      mist(g, bx + (sx - bx) * q, by + (sy - by) * q - 2, 3, 2, [C[2], C[3]], 0.7 * (1 - Math.abs(q - 0.5)), a.seed + i, a.t, 0.6);
    }
    return;
  }
  // grave-mist curling up round its feet, motes of soul-light rising off it
  mist(g, sx, sy - 4, 11, 6, [C[2], C[3], C[4]], 0.7, a.seed + 1, a.t, 1.2);
  for (let i = 0; i < 7; i++) {
    const ph = (a.t * 0.8 + hash2(i, a.seed, 1)) % 1;
    dot(g, sx - 9 + hash2(i, a.seed, 2) * 18 + Math.sin(ph * 6 + i) * 2, sy - 4 - ph * 34, ph < 0.5 ? C[5] : C[4]);
  }
  // its blow on what it strikes: a pale slash of soul-light, its edge cyan (a friend's)
  const foe = live(a, game, 1);
  if (foe && a.pts.length && a.t >= a.pts[0]) {
    const since = a.t - a.pts[0];
    if (since < 0.3) {
      const [fx0, fy0] = S(cam, foe.x, foe.y, topOf(foe) * 0.5);
      const k = clamp01(since / 0.05);
      const fade = clamp01(1 - (since - 0.06) / 0.24);
      smear(g, fx0 - 2, fy0, 13, 10, -2.3, -2.3 + 2.6 * k, 4, [C[1], C[2], C[3], C[4], W7_FRIEND[3], C[5]], 0.15, fade);
    }
  }
}

/** On a monster: once dead it rises again, lurching up out of its fall, the enemy's fire licking up round it, its mist pink. */
function reapMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, layer: 'floor' | 'air'): void {
  const [cx, cy] = S(cam, a.x, a.y);
  const k = clamp01(a.t / 0.8);
  if (layer === 'floor') {
    mist(g, cx, cy, 20, 9, [W7_ENEMY[1], W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3]], 1.0, a.seed, a.t, 0.3);
    return;
  }
  // tongues of the enemy's fire up out of the floor round it, before it
  for (let i = 0; i < 6; i++) {
    const an = (i / 6) * Math.PI + 0.25 + hash2(i, a.seed, 1) * 0.3;
    const px = cx + Math.cos(an) * (8 + hash2(i, a.seed, 2) * 5);
    const py = cy + Math.sin(an) * (2 + hash2(i, a.seed, 3) * 3);
    flame(g, px, py, (9 + hash2(i, a.seed, 4) * 9) * (0.6 + 0.4 * k), 5 + hash2(i, a.seed, 5) * 3, ENEMY_FIRE, a.seed + i, a.t);
  }
  // sparks of pink and gold rising off it
  for (let i = 0; i < 10; i++) {
    const ph = (a.t * 1.2 + hash2(i, a.seed, 6)) % 1;
    dot(g, cx - 12 + hash2(i, a.seed, 7) * 24 + Math.sin(ph * 7 + i) * 2, cy - 4 - ph * 36, ph < 0.4 ? W7_ENEMY[5] : W7_ENEMY[4]);
  }
}

// =============================================================================================
// CULLING

/** In front: a clean scything slash, and the weak one cut down at once (lookW7 splits it). */
function cullFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.culling;
  const m = game.monsters.find((q) => q.id === a.ids[0]);
  const [mx, my] = m ? S(cam, m.x, m.y) : S(cam, a.x, a.y);
  const top = m ? topOf(m) : 26;
  const cy = my - Math.round(top * 0.45);
  const k = clamp01(a.t / W7_TIME.cullSweep);
  const fade = clamp01(1 - (a.t - W7_TIME.cullSweep) / 0.32);
  if (fade <= 0) return;
  const way = a.dx - a.dy >= 0 ? 1 : -1;
  // a great crescent, swept right through it: its edge white bone, its body violet, its tail thinning to nothing
  const a0 = way > 0 ? Math.PI * 1.05 : -Math.PI * 0.05;
  const a1 = a0 + way * -Math.PI * 1.15 * (0.25 + 0.75 * k);
  smear(g, mx - way * 2, cy, 30, 6, a0, a1, 6, C, -0.18 * way, fade);
  // splinters of bone-light along the cut, flung off as it goes through
  if (a.t > W7_TIME.cullSweep * 0.6) {
    const since = a.t - W7_TIME.cullSweep * 0.6;
    for (let i = 0; i < 9; i++) {
      const sp = 60 + hash2(i, a.seed, 1) * 70;
      const an = -0.35 + (hash2(i, a.seed, 2) - 0.5) * 1.2;
      const px = mx + way * (4 + Math.cos(an) * sp * since);
      const py = cy + Math.sin(an) * sp * since * 0.6 + 90 * since * since;
      streak(g, px - way * 4, py + 1, px, py, [C[2], C[3], C[4], C[5]], 1, 0, fade);
    }
  }
}

/** A crescent blade: the part of a disc (radius R about (cx, cy)) outside another a little off it, its points along `ang`; its edge bone, its body dusk, its back dark. */
function crescent(g: CanvasRenderingContext2D, cx: number, cy: number, R: number, ang: number, off: number, C: readonly string[], fade: number, squash = 1): void {
  const ox = Math.cos(ang + Math.PI / 2) * off;
  const oy = Math.sin(ang + Math.PI / 2) * off;
  for (let y = -R - 1; y <= R + 1; y++) {
    for (let x = -R - 1; x <= R + 1; x++) {
      const d1 = Math.hypot(x, y);
      const d2 = Math.hypot(x - ox, y - oy);
      if (d1 > R || d2 < R) continue;
      const px = cx + x;
      const py = cy + y * squash;
      if (fade < 1 && !dith(px, py, fade)) continue;
      // the sharp edge is the inner curve (near the second disc), the back the outer
      const toEdge = d2 - R;
      const toBack = R - d1;
      dot(g, px, py, toEdge < 1.2 ? C[5] : toEdge < 2.2 ? C[4] : toBack < 1 ? C[1] : C[3]);
    }
  }
}

/** Behind: the reaper's mark on the floor (a sigil of a hooded blade); the first weak one to cross it is taken by a blade rising out of it. */
function cullBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.culling;
  const [cx, cy] = S(cam, a.x, a.y);
  const rx = a.r * RX;
  const ry = a.r * RY;
  const taken = a.pts.length ? a.t - a.pts[0] : -1;
  const burn = taken >= 0 ? clamp01(1 - (taken - 0.5) / 0.4) : 1;
  const flare = taken >= 0 && taken < 0.5 ? 1 - taken / 0.5 : 0;
  if (layer === 'floor') {
    if (burn <= 0) return;
    // a groove burned round, cut by hand (never a ruled ring): dark, a light down in it
    const n = Math.round(rx * 7);
    for (let i = 0; i < n; i++) {
      const an = (i / n) * TAU;
      const wob = 1 + (vnoise(i * 0.08, 1, a.seed) - 0.5) * 0.07;
      const px = cx + Math.cos(an) * rx * wob;
      const py = cy + Math.sin(an) * ry * wob;
      if (burn < 1 && !dith(px, py, burn)) continue;
      dot(g, px, py - 1, C[0]);
      dot(g, px, py, flare > 0.3 ? C[5] : C[4]);
      dot(g, px, py + 1, C[2]);
    }
    // marks cut round inside it, each a little stroke of bone
    for (let i = 0; i < 16; i++) {
      const an = (i / 16) * TAU + 0.2;
      const px = cx + Math.cos(an) * rx * 0.83;
      const py = cy + Math.sin(an) * ry * 0.83;
      dot(g, px, py, C[3]);
      dot(g, px + (i % 2 ? 1 : 0), py + (i % 2 ? 0 : 1), flare > 0 ? C[5] : C[4]);
    }
    // the hooded blade, laid on the floor: a hood, its face a hollow of dusk with two points of bone in it, a scythe's
    // blade curving over it and its haft behind it. (Laid a little less flat than the floor is, so that it reads.)
    const bone = flare > 0 ? C[5] : C[4];
    const S0 = rx * 0.74;
    const SQ = 0.62;
    const segD = (u: number, v: number, u0: number, v0: number, u1: number, v1: number): number => {
      const du = u1 - u0;
      const dv = v1 - v0;
      const k2 = clamp01(((u - u0) * du + (v - v0) * dv) / (du * du + dv * dv));
      return Math.hypot(u - u0 - du * k2, v - v0 - dv * k2);
    };
    for (let py = Math.floor(cy - S0 * SQ); py <= Math.ceil(cy + S0 * SQ); py++) {
      for (let px = Math.floor(cx - S0); px <= Math.ceil(cx + S0); px++) {
        const u = (px - cx) / S0;
        const v = (py - cy) / (S0 * SQ);
        if (burn < 1 && !dith(px, py, burn)) continue;
        // the hood: a peak at its top, flaring as it falls, open at its foot
        const top = -0.62 + 2.6 * Math.abs(u) * (0.6 + Math.abs(u));
        const side = 0.3 + 0.16 * (v + 0.3);
        const inHood = v >= top && Math.abs(u) <= side && v <= 0.62;
        if (inHood) {
          const edge = v - top < 0.11 || side - Math.abs(u) < 0.07;
          // its face: a hollow of dusk, a violet light deep in it
          const face = Math.hypot(u * 1.4, v - 0.08) < 0.17;
          dot(g, px, py, edge ? bone : face ? (Math.hypot(u * 1.4, v - 0.1) < 0.07 ? C[3] : C[0]) : v > 0.48 ? C[1] : C[2]);
          continue;
        }
        // the blade: inside one disc and outside another, over the hood; its sharp edge (the inner curve) bone
        const dA = Math.hypot(u + 0.2, v - 0.3);
        const dB = Math.hypot(u + 0.02, v - 0.62);
        if (dA <= 0.95 && dB >= 0.95 && v < 0.12 && u < 0.4) {
          dot(g, px, py, dB - 0.95 < 0.1 ? bone : 0.95 - dA < 0.08 ? C[1] : C[3]);
          continue;
        }
        // the haft, behind the hood, up to the blade
        const dh = segD(u, v, 0.6, 0.9, 0.38, -0.72);
        if (dh < 0.06) dot(g, px, py, dh < 0.025 ? C[4] : C[2]);
      }
    }
    // wisps of dusk curling up off its rim
    for (let i = 0; i < 7; i++) {
      const an = (i / 7) * TAU + 0.4;
      const bx = cx + Math.cos(an) * rx;
      const by = cy + Math.sin(an) * ry;
      const ph = (a.t * 0.7 + hash2(i, a.seed, 20)) % 1;
      let px = bx;
      let py = by;
      for (let s2 = 0; s2 < 10; s2++) {
        const nx = bx + Math.sin(ph * 6 + s2 * 0.6 + i) * 2;
        const ny = by - s2 * 1.3 - ph * 4;
        if (dith(nx, ny, (1 - s2 / 10) * burn * 0.9)) dot(g, nx, ny, s2 < 3 ? C[3] : C[2]);
        px = nx;
        py = ny;
      }
      void px;
      void py;
    }
    return;
  }
  // in the air: the blade rising up out of the mark through the one it takes, sweeping up, the arc of it smeared behind
  if (taken < 0 || taken > 0.55) return;
  const v = live(a, game, 0);
  const [vx, vy] = v ? S(cam, v.x, v.y) : [cx, cy];
  const k = easeOut(taken / 0.2);
  const fade = clamp01(1 - (taken - 0.2) / 0.35);
  const ang = Math.PI * 0.62 - k * Math.PI * 0.95;
  const R = 26;
  // the arc it sweeps up through
  smear(g, vx - 4, vy - 2, R - 4, R - 4, Math.PI * 0.62, ang, 5, C, 0, fade);
  // the blade itself, at the head of its sweep
  const bx = vx - 4 + Math.cos(ang) * (R - 10);
  const by = vy - 2 + Math.sin(ang) * (R - 10);
  crescent(g, Math.round(bx), Math.round(by), 11, ang + Math.PI / 2, 5, C, fade);
}

/** On a monster: while the hero is low its blows flare: it burns with the enemy's fire, and its blow on him bursts. */
function cullMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const m = live(a, game);
  if (!m) return;
  const h = game.hero;
  const [mx, my] = S(cam, m.x, m.y);
  const top = topOf(m);
  // it burns: the enemy's fire licking up round its feet and its sides
  const F = [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[4], W7_ENEMY[5], '#fff2c8'];
  for (let i = 0; i < 5; i++) {
    const px = mx - 9 + i * 4.5;
    flame(g, px, my + 1, 8 + hash2(i, a.seed, 2) * 9 + (i === 0 || i === 4 ? 4 : 0), 6, F, a.seed + i, a.t);
  }
  // its eyes flare
  dot(g, mx - 2, my - top + 6, W7_ENEMY[5]);
  dot(g, mx + 1, my - top + 6, W7_ENEMY[5]);
  glint(g, mx - 2, my - top + 6, 1, W7_ENEMY[4], W7_ENEMY[5]);
  // its blow: a heavy smear of the enemy's fire down onto him, and the burst where it lands
  const [hx, hy] = S(cam, h.x, h.y, 16);
  const way = hx < mx ? -1 : 1;
  const since = a.t - 0.05;
  if (a.t < 0.35) {
    const fade = clamp01(1 - since / 0.3);
    const a0 = way < 0 ? -0.1 : -Math.PI + 0.1;
    const a1 = way < 0 ? -Math.PI + 0.1 : -0.1;
    smear(g, (mx + hx) / 2, Math.min(my - top * 0.6, hy) + 4, Math.abs(mx - hx) / 2 + 6, 14, a0, a1, 5, F, 0, fade);
  }
  if (since > 0 && since < 0.3) {
    const k = 1 - since / 0.3;
    star(g, hx, hy, 6 + 11 * k, F, a.seed, 10);
  }
}

// =============================================================================================
// SURGING

/**
 * A shockwave on the floor at radius r (tiles): its front a broken edge of white-blue light, a band of
 * churned dust rolling behind it, grit flung on ahead of it, crackles of the storm along it. Only the half
 * of it behind (`back`) or before the figures.
 */
function shock(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, C: readonly string[], fade: number, seed: number, t: number, back: boolean): void {
  const rx = r * RX;
  const ry = r * RY;
  // the dust churned up behind its front, rolling outward
  const puffs = Math.max(8, Math.round(r * 9));
  for (let i = 0; i < puffs; i++) {
    const an = (i / puffs) * TAU + hash2(i, seed, 1) * 0.3;
    if (Math.sin(an) < 0 !== back) continue;
    mist(g, cx + Math.cos(an) * rx * 0.84, cy + Math.sin(an) * ry * 0.84 - 3, 6 + r * 1.8, 2.5 + r * 0.9, DUSK_DUST, 1.0 * fade, seed + i, t, 0.3);
  }
  // its front: two pixels deep, white at its edge, broken where the force is less
  const n = Math.max(24, Math.round(rx * 7));
  for (let i = 0; i < n; i++) {
    const an = (i / n) * TAU;
    if (Math.sin(an) < 0 !== back) continue;
    const bright = vnoise(i * 0.12, t * 4, seed);
    if (bright < 0.22) continue;
    const px = cx + Math.cos(an) * rx;
    const py = cy + Math.sin(an) * ry;
    if (fade < 1 && !dith(px, py, fade)) continue;
    dot(g, px, py, bright > 0.5 ? C[5] : C[4]);
    dot(g, px - Math.cos(an) * 1.1, py - Math.sin(an) * 0.7, C[4]);
    dot(g, px - Math.cos(an) * 2.2, py - Math.sin(an) * 1.4, C[3]);
    if (bright > 0.6) dot(g, px, py - 1, C[5]);
  }
  // grit flung on ahead of it
  for (let i = 0; i < 22; i++) {
    const an = hash2(i, seed, 3) * TAU;
    if (Math.sin(an) < 0 !== back) continue;
    const d = r + 0.12 + hash2(i, seed, 4) * 0.4;
    const px = cx + Math.cos(an) * d * RX;
    const py = cy + Math.sin(an) * d * RY - hash2(i, seed, 5) * 5;
    streak(g, px - Math.cos(an) * 6, py - Math.sin(an) * 3, px, py, [DUST[0], DUST[1], DUST[2], DUST[3]], 1, 0, fade);
  }
  // crackles of the storm running along its front
  for (let i = 0; i < 7; i++) {
    const an0 = hash2(i, seed + Math.floor(t * 20), 6) * TAU;
    if (Math.sin(an0) < 0 !== back) continue;
    let px = cx + Math.cos(an0) * rx;
    let py = cy + Math.sin(an0) * ry - 1;
    for (let s = 1; s <= 6; s++) {
      const an = an0 + (s * 3.2) / Math.max(rx, 8);
      const nx = cx + Math.cos(an) * rx + (hash2(s, i, seed + 7) - 0.5) * 3;
      const ny = cy + Math.sin(an) * ry - 1 - hash2(s, i, seed + 8) * 3;
      streak(g, px, py, nx, ny, [C[4], C[5]], 1);
      px = nx;
      py = ny;
    }
  }
}

/** In front, every third use: a ring of force bursting out round him. */
function surgeFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air', C: readonly string[] = W7_RAMP.surging): void {
  const k = a.t / W7_TIME.surge;
  if (k >= 1.3) return;
  const [cx, cy] = S(cam, a.x, a.y);
  const r = a.r * easeOut(Math.min(1, k));
  const fade = clamp01(1.3 - k);
  shock(g, cx, cy, Math.max(0.15, r), C, fade, a.seed, a.t, layer === 'floor');
  if (layer === 'floor') {
    // the floor round his feet lit by the burst, fading: a scatter of light, thicker near him
    const rr = Math.min(r, 0.9);
    for (let i = 0; i < 90; i++) {
      const an = hash2(i, a.seed, 23) * TAU;
      const d = hash2(i, a.seed, 24) * rr;
      const px = cx + Math.cos(an) * d * RX;
      const py = cy + Math.sin(an) * d * RY;
      if (dith(px, py, (1 - k) * (1 - d / Math.max(0.01, rr)) * 0.9)) dot(g, px, py, d < rr * 0.4 ? C[4] : C[3]);
    }
    return;
  }
  // the burst at his feet: rays of the storm's light
  if (k < 0.5) {
    const q = k / 0.5;
    for (let i = 0; i < 12; i++) {
      const an = (i / 12) * TAU + hash2(i, a.seed, 11) * 0.4;
      const L0 = 5 + q * 12;
      const L1 = L0 + (5 + hash2(i, a.seed, 12) * 6) * (1 - q);
      streak(g, cx + Math.cos(an) * L0, cy - 8 + Math.sin(an) * L0 * 0.55, cx + Math.cos(an) * L1, cy - 8 + Math.sin(an) * L1 * 0.55, [C[3], C[4], C[5]], i % 2 ? 1 : 2, 0, 1 - q);
    }
  }
  void game;
}

/** Behind: his dodge lets out a surge: a burst where he left the floor, and a wake of wind along his roll. */
function surgeBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.surging;
  surgeFront(g, cam, a, game, layer, C);
  if (layer !== 'air') return;
  const [x0, y0] = S(cam, a.x, a.y);
  const [x1, y1] = S(cam, a.x1, a.y1);
  const fade = clamp01(1 - a.t / 0.55);
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  // streaks of wind along the way he rolled, curling up at their ends
  for (let i = 0; i < 6; i++) {
    const off = (i - 2.5) * 4 + (hash2(i, a.seed, 1) - 0.5) * 2;
    const z = 3 + (i % 3) * 7;
    const s0 = len * (0.02 + hash2(i, a.seed, 2) * 0.15 + (1 - fade) * 0.5);
    const s1 = len * (0.65 + hash2(i, a.seed, 3) * 0.3);
    if (s1 <= s0) continue;
    const ax = x0 + ux * s0 - uy * off;
    const ay = y0 + uy * s0 + ux * off * 0.5 - z;
    const bx = x0 + ux * s1 - uy * off;
    const by = y0 + uy * s1 + ux * off * 0.5 - z;
    streak(g, ax, ay, bx, by, [C[2], C[3], C[4], C[5]], i % 2 ? 1 : 2);
    streak(g, bx, by, bx + ux * 3, by - 3, [C[4], C[5]], 1);
  }
  // dust kicked off the floor to either side of it
  for (let i = 0; i < 8; i++) {
    const s = (0.1 + 0.8 * hash2(i, a.seed, 4)) * len;
    const sd = i % 2 === 0 ? 1 : -1;
    const px = x0 + ux * s - uy * sd * (5 + a.t * 24);
    const py = y0 + uy * s + ux * sd * (3 + a.t * 12) - 2;
    mist(g, px, py, 5, 3, DUSK_DUST, 1.0 * fade, a.seed + i, a.t, 0.4);
  }
}

/** On a monster: a warning ring on the floor, pink, filling; then its shockwave, in the enemy's colours. */
function surgeMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const m = live(a, game);
  const [cx, cy] = m ? S(cam, m.x, m.y) : S(cam, a.x, a.y);
  const C = W7_ENEMY;
  const R = a.r;
  const warn = W7_TIME.warn;
  const wave = a.t - warn;
  const ringFade = wave < 0 ? 1 : clamp01(1 - wave / 0.35);
  if (layer === 'floor' && ringFade > 0) {
    // the ring: a band of pink light burned on the floor where the wave will reach, its edge ragged, beating faster as it comes
    const k = clamp01(a.t / warn);
    const beat = 0.75 + 0.25 * Math.sin(a.t * (6 + 18 * k));
    // inside it the floor smoulders, more as it fills
    for (let i = 0; i < 220; i++) {
      const an = hash2(i, a.seed, 21) * TAU;
      const d = Math.sqrt(hash2(i, a.seed, 22)) * R * 0.97;
      const px = cx + Math.cos(an) * d * RX;
      const py = cy + Math.sin(an) * d * RY;
      if (dith(px, py, 0.55 * k * ringFade)) dot(g, px, py, d > R * 0.8 ? C[3] : C[2]);
    }
    const n = Math.round(R * RX * 7);
    for (let i = 0; i < n; i++) {
      const an = (i / n) * TAU;
      const wob = 1 + (vnoise(i * 0.1, 3, a.seed) - 0.5) * 0.05;
      const px = cx + Math.cos(an) * R * RX * wob;
      const py = cy + Math.sin(an) * R * RY * wob;
      if (ringFade * beat < 1 && !dith(px, py, ringFade * beat + 0.2)) continue;
      dot(g, px, py - 1, C[3]);
      dot(g, px, py, C[4]);
      dot(g, px, py + 1, C[2]);
      if (i % 18 === 0) {
        // barbs pointing in
        streak(g, px, py, px - Math.cos(an) * 4, py - Math.sin(an) * 2, [C[2], C[3], C[4]], 1);
      }
    }
  }
  if (wave >= 0) {
    const fake: Act = { ...a, t: wave, r: R };
    surgeFront(g, cam, fake, game, layer, [C[0], C[1], C[2], C[3], C[4], C[5]]);
  } else if (layer === 'air' && m) {
    // it gathers: sparks of pink crackling round it
    const top = topOf(m);
    for (let i = 0; i < 5; i++) {
      const an = hash2(i, a.seed + Math.floor(a.t * 15), 3) * TAU;
      let px = cx + Math.cos(an) * 9;
      let py = cy - top * 0.5 + Math.sin(an) * 11;
      for (let s = 0; s < 5; s++) {
        const nx = px + (hash2(s, i, a.seed) - 0.5) * 5;
        const ny = py + (hash2(s, i, a.seed + 1) - 0.5) * 5;
        streak(g, px, py, nx, ny, [C[4], C[5]], 1);
        px = nx;
        py = ny;
      }
    }
  }
}

// =============================================================================================
// PLUNDERING

/** In front: coins spray from the kill, spinning up and falling, an extra piece thrown with them sometimes. */
function plunderFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.plundering;
  const [cx, cy] = S(cam, a.x, a.y);
  const n = 16;
  for (let i = 0; i < n; i++) {
    const an = (i / n) * TAU + hash2(i, a.seed, 1) * 0.6;
    const sp = 22 + hash2(i, a.seed, 2) * 30;
    const vz = 80 + hash2(i, a.seed, 3) * 70;
    const tt = Math.max(0, a.t - hash2(i, a.seed, 4) * 0.06);
    const land = (2 * vz) / 300;
    const t1 = Math.min(tt, land);
    const px = cx + Math.cos(an) * sp * t1;
    const py = cy + Math.sin(an) * sp * t1 * 0.5;
    const z = 10 + vz * t1 - 150 * t1 * t1;
    if (tt >= land) {
      if (layer === 'floor') coin(g, px, py, 0, C, true);
    } else if (layer === 'air') {
      // a short trail of glints behind it
      for (let k = 1; k <= 2; k++) {
        const tb = Math.max(0, t1 - k * 0.025);
        const bz = 10 + vz * tb - 150 * tb * tb;
        dot(g, cx + Math.cos(an) * sp * tb, cy + Math.sin(an) * sp * tb * 0.5 - bz, k === 1 ? C[3] : C[2]);
      }
      coin(g, px, py - z, tt * 16 + i, C);
    }
  }
  if (layer !== 'air') return;
  // the extra piece: a ring with a red stone, thrown higher, turning
  {
    const tt = a.t;
    const vz = 130;
    const land = (2 * vz) / 300;
    const t1 = Math.min(tt, land);
    const px = Math.round(cx - 34 * t1);
    const py = cy + 8 * t1;
    const y = Math.round(py - (12 + vz * t1 - 150 * t1 * t1));
    dot(g, px - 1, y - 2, C[5], 3, 1);
    dot(g, px - 2, y - 1, C[4]);
    dot(g, px + 2, y - 1, C[3]);
    dot(g, px - 2, y, C[3]);
    dot(g, px + 2, y, C[2]);
    dot(g, px - 1, y + 1, C[2], 3, 1);
    dot(g, px - 1, y - 4, '#800818', 3, 2);
    dot(g, px, y - 4, '#d0182c');
    dot(g, px - 1, y - 4, '#ff8a7a');
    if (tt < land) glint(g, px + 3, y - 5, 2, C[4], C[5]);
  }
  // the burst as it falls: glints of brass
  if (a.t < 0.25) {
    const q = a.t / 0.25;
    for (let i = 0; i < 6; i++) {
      const an = (i / 6) * TAU + a.seed;
      glint(g, cx + Math.cos(an) * (4 + q * 12), cy - 10 + Math.sin(an) * (3 + q * 7), q < 0.5 ? 2 : 1, C[4], C[5]);
    }
  }
}

/** Behind: gold bursts from the kill and flies in a stream into his purse, glinting where it goes in. */
function plunderBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.plundering;
  const h = game.hero;
  const [cx, cy] = S(cam, a.x, a.y, 8);
  const [hx, hy] = S(cam, h.x, h.y, 12);
  const mx = (cx + hx) / 2;
  const my = Math.min(cy, hy) - 28;
  const n = 12;
  for (let i = 0; i < n; i++) {
    const t0 = i * 0.04;
    const u = (a.t - t0) / W7_TIME.purse;
    if (u < 0) continue;
    if (u >= 1) {
      // in: a glint at his belt
      const since = (u - 1) * W7_TIME.purse;
      if (since < 0.12) glint(g, hx + (i % 3) - 1, hy, 3, C[4], C[5]);
      continue;
    }
    // each coin on its own arc, a little apart, a streak of brass behind it
    const q = smooth(u);
    const spread = (hash2(i, a.seed, 1) - 0.5) * 16;
    const [px, py] = quad(cx, cy, mx + spread, my + spread * 0.5, hx, hy, q);
    const [bx, by] = quad(cx, cy, mx + spread, my + spread * 0.5, hx, hy, Math.max(0, q - 0.1));
    streak(g, bx, by, px, py, [C[1], C[2], C[3], C[4]], 1, 0, 0.9);
    coin(g, px, py, a.t * 18 + i * 1.3, C);
  }
  // the burst out of the kill
  if (a.t < 0.3) {
    const q = a.t / 0.3;
    for (let i = 0; i < 7; i++) {
      const an = (i / 7) * TAU;
      const r = 3 + q * 12;
      coin(g, cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.6 - q * 6, a.t * 20 + i, C);
    }
    star(g, cx, cy, 4 + 5 * (1 - q), [C[1], C[2], C[3], C[4], C[5]], a.seed, 6);
  }
  // his purse at his belt, swelling with it
  if (a.t > W7_TIME.purse * 0.8) {
    dot(g, hx - 2, hy - 1, C[3], 4, 3);
    dot(g, hx - 1, hy - 1, C[5], 2, 1);
    glint(g, hx + 3, hy - 3, 1, C[4], C[5]);
  }
}

/** On a monster: its blow snatches coins off the hero, pulled to it on hooks of the enemy's light; they clink in it, glinting pink and gold. */
function plunderMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.plundering;
  const m = live(a, game);
  if (!m) return;
  const h = game.hero;
  const [hx, hy] = S(cam, h.x, h.y, 14);
  const [mx, my] = S(cam, m.x, m.y, 12);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const u = (a.t - 0.04 - i * 0.025) / 0.4;
    if (u < 0) continue;
    if (u >= 1) {
      const since = (u - 1) * 0.4;
      if (since < 0.15) glint(g, mx + (i % 3) - 1, my + (i % 2), 2, W7_ENEMY[4], W7_ENEMY[5]);
      continue;
    }
    const q = smooth(u);
    const up = 22 + hash2(i, a.seed, 1) * 22;
    const side = (hash2(i, a.seed, 2) - 0.5) * 26;
    const ctlx = (hx + mx) / 2 + side;
    const ctly = Math.min(hy, my) - up;
    const [px, py] = quad(hx, hy, ctlx, ctly, mx, my, q);
    // the hook of pink light that has it: a thread trailing back the way it was torn, curled round the coin at its end
    const [bx, by] = quad(hx, hy, ctlx, ctly, mx, my, Math.max(0, q - 0.18));
    streak(g, bx, by, px, py, [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[4]], 2, 0, 0.95);
    const w = mx > hx ? 1 : -1;
    dot(g, px + w * 3, py - 2, W7_ENEMY[4]);
    dot(g, px + w * 3, py - 1, W7_ENEMY[4]);
    dot(g, px + w * 3, py, W7_ENEMY[3]);
    dot(g, px + w * 2, py + 1, W7_ENEMY[3]);
    coin(g, px, py, a.t * 20 + i, C);
  }
  // the blow on him: a burst of the enemy's light, a coin or two spilling
  if (a.t < 0.25) {
    const k = 1 - a.t / 0.25;
    star(g, hx, hy, 4 + 7 * k, [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[4], W7_ENEMY[5]], a.seed, 8);
  }
  // in it, the coins it has: glinting at its belt
  if (a.t > 0.3) {
    coin(g, mx - 2, my + 1, 0, C);
    coin(g, mx + 2, my + 2, 1.2, C);
    if (Math.sin(a.t * 9) > 0.3) glint(g, mx, my - 1, 1, W7_ENEMY[4], W7_ENEMY[5]);
  }
}

// =============================================================================================
// MIRRORING

/** The glass a sprite is remade in: its own shading carried over into silver glass, a sheen across it, its edge cyan (a friend's). */
const glassMade = new WeakMap<Sprite, Sprite>();
const soulMade = new WeakMap<Sprite, Sprite>();

/**
 * A copy of a picture remade as one of the looks here: 'glass', Mirroring's reflection; 'soul', Reaping's
 * spirit (pale soul-light, its legs trailing away). Its shading is kept, its colours replaced, its edge
 * the friend's cyan. Kept per picture.
 */
export function remade(sp: Sprite, kind: 'glass' | 'soul'): Sprite {
  const cache = kind === 'glass' ? glassMade : soulMade;
  const had = cache.get(sp);
  if (had) return had;
  const W = sp.img.width;
  const H = sp.img.height;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.drawImage(sp.img, 0, 0);
  const im = g.getImageData(0, 0, W, H);
  const d = im.data;
  const dn = Math.max(1, Math.round(sp.density ?? 1));
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 60;
  const R = kind === 'glass' ? W7_RAMP.mirroring : W7_RAMP.reaping;
  const rgb = (hex: string): [number, number, number] => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const ramp = R.map(rgb);
  const rim = rgb(W7_FRIEND[2]);
  const rim2 = rgb(W7_FRIEND[3]);
  const out = g.createImageData(W, H);
  const o = out.data;
  // the lowest of it (its feet), for the spirit's legs trailing away into mist
  let low = 0;
  for (let y = H - 1; y >= 0 && !low; y--) for (let x = 0; x < W; x++) if (solid(x, y)) {
    low = y;
    break;
  }
  let high = H;
  for (let y = 0; y < H && high === H; y++) for (let x = 0; x < W; x++) if (solid(x, y)) {
    high = y;
    break;
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!solid(x, y)) continue;
      const i = (y * W + x) * 4;
      const gx = Math.floor(x / dn);
      const gy = Math.floor(y / dn);
      const edge = !solid(x - dn, y) || !solid(x + dn, y) || !solid(x, y - dn) || !solid(x, y + dn);
      let c: [number, number, number];
      let alpha = 255;
      if (edge) c = (gx + gy) % 3 === 0 ? rim2 : rim;
      else {
        const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
        let k = Math.min(4, Math.floor(1 + lum * 4.2));
        if (kind === 'glass') {
          // a sheen: two bands of light slanting across it
          const band = (gx * 0.7 + gy * 1.0) % 13;
          if (band < 1.5) k = Math.min(5, k + 2);
          else if (band < 3) k = Math.min(5, k + 1);
        }
        c = ramp[k];
      }
      if (kind === 'soul') {
        // its legs trail away into nothing, scattered, as mist does
        const f = (y - high) / Math.max(1, low - high);
        if (f > 0.62 && !dith(gx, gy, 1 - (f - 0.62) / 0.38)) continue;
        if (!edge) alpha = 230;
      }
      o[i] = c[0];
      o[i + 1] = c[1];
      o[i + 2] = c[2];
      o[i + 3] = alpha;
    }
  }
  g.putImageData(out, 0, 0);
  const made: Sprite = { img: cv, w: sp.w, h: sp.h, ax: sp.ax, ay: sp.ay };
  if (sp.density !== undefined) made.density = sp.density;
  cache.set(sp, made);
  return made;
}

/** One cut down by Culling: its picture split along the cut, the top of it slid off along the blow, the cut lit bone. */
const splitMade = new Map<string, Sprite>();
function splitOf(sp: Sprite, slide: number, way: number, key: string): Sprite {
  const k = `${key}:${slide}:${way}`;
  const had = splitMade.get(k);
  if (had) return had;
  const dn = Math.max(1, Math.round(sp.density ?? 1));
  const W = sp.img.width;
  const H = sp.img.height;
  const pad = 6 * dn;
  const cv = document.createElement('canvas');
  cv.width = W + pad * 2;
  cv.height = H + pad;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  // the cut: a slanting line at a little under half its height (counted from its foot, its anchor)
  const cutY = (x: number): number => (sp.ay - sp.h * 0.42) * dn + (x - sp.ax * dn) * 0.35 * way;
  g.save();
  g.beginPath();
  g.moveTo(pad, pad + cutY(0));
  g.lineTo(pad + W, pad + cutY(W));
  g.lineTo(pad + W, pad + H);
  g.lineTo(pad, pad + H);
  g.closePath();
  g.clip();
  g.drawImage(sp.img, pad, pad);
  g.restore();
  g.save();
  g.beginPath();
  g.moveTo(pad, pad + cutY(0));
  g.lineTo(pad + W, pad + cutY(W));
  g.lineTo(pad + W, 0);
  g.lineTo(pad, 0);
  g.closePath();
  g.clip();
  g.drawImage(sp.img, pad + way * slide * dn, pad - Math.round(slide * 0.5) * dn);
  g.restore();
  // the cut lit: bone along both lips of it, wherever there is body
  const im = g.getImageData(0, 0, cv.width, cv.height);
  const d = im.data;
  const C = W7_RAMP.culling;
  g.fillStyle = C[4];
  for (let x = 0; x < W; x += 1) {
    const yy = Math.round(pad + cutY(x));
    for (const [ox, oy] of [[0, 0], [way * slide * dn, -Math.round(slide * 0.5) * dn - dn]]) {
      const px = pad + x + ox;
      const py = yy + oy;
      if (px < 0 || py < 0 || px >= cv.width || py >= cv.height) continue;
      const near = (q: number): boolean => q >= 0 && q < cv.height && d[(q * cv.width + px) * 4 + 3] > 60;
      if (near(py - dn) || near(py + dn)) g.fillRect(px, py, 1, dn);
    }
  }
  const made: Sprite = { img: cv, w: (W + pad * 2) / dn, h: (H + pad) / dn, ax: sp.ax + pad / dn, ay: sp.ay + pad / dn };
  if (sp.density !== undefined) made.density = sp.density;
  splitMade.set(k, made);
  if (splitMade.size > 64) splitMade.delete(splitMade.keys().next().value as string);
  return made;
}

/** In front: his reflection beside him, in glass, making the same swing (heroW7 stands it; its swing's arc here). */
function mirrorFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.mirroring;
  const h = game.hero;
  const [ox, oy] = mirrorOffset(h);
  const [sx, sy] = S(cam, h.x + ox, h.y + oy, 14);
  // the arc of its swing, in glass: a sheet of it, its edge white, a sheen running along it, cyan glints at its tip
  const k = clamp01(a.t / 0.08);
  const fade = clamp01(1 - (a.t - 0.08) / 0.25);
  const way = h.fx - h.fy >= 0 ? 1 : -1;
  glassSwing(g, sx, sy, way, k, fade);
  // glints running over the glass of it
  glint(g, sx - 3, sy - 8, 1, C[4]);
  glint(g, sx + 2, sy + 4, 1, W7_FRIEND[3]);
}

/** The arc of a swing in glass: a sheet of it, its edge white, a sheen running along it, a cyan glint at its tip (it is his). */
function glassSwing(g: CanvasRenderingContext2D, sx: number, sy: number, way: number, k: number, fade: number): void {
  const C = W7_RAMP.mirroring;
  // from over his shoulder, over the top, down across in front of him
  const a0 = way > 0 ? Math.PI * 1.2 : -Math.PI * 0.2;
  const lead = a0 + way * Math.PI * 1.1 * (0.2 + 0.8 * k);
  smear(g, sx + way * 4, sy, 19, 11, a0, lead, 5, [C[1], C[2], C[3], C[3], C[4], C[5]], 0.15 * way, fade, true);
  if (fade > 0.3) glint(g, Math.round(sx + way * 4 + Math.cos(lead) * 19), Math.round(sy + Math.sin(lead) * 11 + Math.cos(lead) * 19 * 0.15 * way), 2, W7_FRIEND[3]);
}

/** Where his reflection stands from him (world): beside him, a long step off (square to the way he faces). */
function mirrorOffset(h: { fx: number; fy: number }): [number, number] {
  const l = Math.hypot(h.fx, h.fy) || 1;
  return [(-h.fy / l) * 1.7, (h.fx / l) * 1.7];
}

/** Behind: a standing pane of mirror where he stood; in it his reflection makes his next attack again; then it cracks and shatters. */
function mirrorBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.mirroring;
  const [bx, by] = S(cam, a.x, a.y);
  const crack = a.pts.length ? a.t - a.pts[0] : -1;
  const shatter = crack > 0.3;
  if (shatter) {
    // shattered: its pieces flung out and falling, catching the light
    const since = crack - 0.3;
    if (since > 0.6) return;
    for (let i = 0; i < 16; i++) {
      const an = hash2(i, a.seed, 1) * TAU;
      const sp = 30 + hash2(i, a.seed, 2) * 40;
      const px = bx + Math.cos(an) * sp * since;
      const py = by - 18 + hash2(i, a.seed, 3) * 20 - 40 * since + 200 * since * since;
      if (py > by + 4) continue;
      sliver(g, px, py, an + since * 12, 3 + hash2(i, a.seed, 4) * 3, C);
    }
    return;
  }
  // the pane: tall, a little narrower at its top, stood on the floor on a heap of its own glass; set along the floor as he faced
  const Wd = 18;
  const Ht = 38;
  const lean = 4;
  const left = bx - Wd / 2;
  const top = by - Ht;
  const inside = (x: number, y: number): boolean => {
    const v = (y - top) / Ht;
    if (v < 0 || v > 1) return false;
    const half = Wd / 2 - (1 - v) * 1.5;
    const mid = bx + (v - 0.5) * -lean * 0.3;
    // its top cut to an arch
    if (v < 0.18) {
      const u = (x - mid) / half;
      if (u * u + ((0.18 - v) / 0.18) ** 2 > 1) return false;
    }
    return Math.abs(x - mid) <= half;
  };
  // its glass: dark in its depths, a sheen of light slanting across it
  for (let y = Math.floor(top); y <= by; y++) {
    for (let x = Math.floor(left - 2); x <= Math.ceil(left + Wd + 2); x++) {
      if (!inside(x, y)) continue;
      const v = (y - top) / Ht;
      const band = (x - left) * 0.9 + (y - top) * 0.55;
      const sheen = band % 17 < 2.2 ? 2 : band % 17 < 3.5 ? 1 : 0;
      dot(g, x, y, C[Math.min(4, (v > 0.8 ? 1 : 2) + sheen)]);
    }
  }
  // his reflection in it, making the attack again (his own picture, in glass), held within it
  if (W7.heroSp) {
    const sp = remade(W7.heroSp, 'glass');
    g.save();
    g.beginPath();
    for (let y = Math.floor(top); y <= by; y++) {
      for (let x = Math.floor(left - 2); x <= Math.ceil(left + Wd + 2); x++) if (inside(x, y)) g.rect(x, y, 1, 1);
    }
    g.clip();
    g.globalAlpha = 0.85;
    g.drawImage(sp.img, Math.round(bx - sp.ax), Math.round(by - 3 - sp.ay), sp.w, sp.h);
    g.globalAlpha = 1;
    g.restore();
  }
  // its edge: a bevel of light, and the friend's cyan glinting along it (it is his)
  for (let y = Math.floor(top); y <= by; y++) {
    for (let x = Math.floor(left - 2); x <= Math.ceil(left + Wd + 2); x++) {
      if (!inside(x, y)) continue;
      if (!inside(x - 1, y) || !inside(x, y - 1)) dot(g, x, y, (x + y) % 7 === 0 ? W7_FRIEND[3] : C[4]);
      else if (!inside(x + 1, y) || !inside(x, y + 1)) dot(g, x, y, (x + y) % 5 === 0 ? W7_FRIEND[2] : C[1]);
    }
  }
  // the heap of glass at its foot: shards standing up out of the floor
  for (let i = 0; i < 7; i++) {
    const px = bx - 9 + i * 3 + hash2(i, a.seed, 5) * 2;
    const tall = 2 + hash2(i, a.seed, 6) * 4;
    for (let k = 0; k < tall; k++) dot(g, px + (k > tall / 2 ? (i % 2 ? 1 : -1) : 0), by + 1 - k, k === Math.floor(tall) - 1 ? C[5] : C[3]);
    dot(g, px + 1, by + 1, C[1]);
  }
  // its attack again: the arc of the swing coming out of it, in glass
  if (a.t < 0.4) {
    const k = clamp01(a.t / 0.08);
    const fade = clamp01(1 - (a.t - 0.08) / 0.3);
    const way = a.dx - a.dy >= 0 ? 1 : -1;
    glassSwing(g, bx + way * 12, by - 16, way, k, fade);
  }
  // cracks running through it before it goes
  if (crack >= 0) {
    const k = clamp01(crack / 0.3);
    for (let i = 0; i < 4; i++) {
      let px = bx + (hash2(i, a.seed, 7) - 0.5) * 8;
      let py = top + Ht * (0.3 + hash2(i, a.seed, 8) * 0.4);
      for (let s = 0; s < 12 * k; s++) {
        px += (hash2(s, i, a.seed) - 0.5) * 3;
        py += (hash2(s, i, a.seed + 3) - 0.5) * 3;
        if (inside(px, py)) dot(g, px, py, C[5]);
      }
    }
  }
}

/** On a monster: part of the harm he does it comes back at him: it flashes like a mirror, and shards of the enemy's glass fly back into him. */
function mirrorMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const m = live(a, game);
  if (!m) return;
  const h = game.hero;
  const top = topOf(m);
  const [mx, my] = S(cam, m.x, m.y, top * 0.5);
  const [hx, hy] = S(cam, h.x, h.y, 16);
  const GL = ['#0e050a', '#2a0c1c', '#5a1438', '#ffc8dc', '#ff4f8a', '#ffffff'];
  // where it was struck, its body cracks like a mirror: a star of white cracks, pink along their lips
  if (a.t < 0.3) {
    const fade = clamp01(1 - (a.t - 0.12) / 0.18);
    for (let i = 0; i < 7; i++) {
      let px = mx;
      let py = my;
      const an = (i / 7) * TAU + hash2(i, a.seed, 9) * 0.5;
      const L = 4 + hash2(i, a.seed, 10) * 5;
      for (let s2 = 0; s2 < L; s2++) {
        px += Math.cos(an) + (hash2(s2, i, a.seed + 4) - 0.5) * 0.7;
        py += Math.sin(an) * 0.9 + (hash2(s2, i, a.seed + 5) - 0.5) * 0.7;
        if (fade < 1 && !dith(px, py, fade)) continue;
        dot(g, px, py, s2 < L * 0.6 ? GL[5] : GL[3]);
        dot(g, px + 1, py + 1, GL[4]);
      }
    }
  }
  const n = 11;
  for (let i = 0; i < n; i++) {
    const u = (a.t - i * 0.01) / W7_TIME.shards;
    if (u < 0) continue;
    const spread = (hash2(i, a.seed, 1) - 0.5) * 26;
    const up = (hash2(i, a.seed, 2) - 0.4) * 20;
    if (u >= 1) {
      // in him: a little burst of the enemy's light
      const since = (u - 1) * W7_TIME.shards;
      if (since < 0.1) star(g, hx + spread * 0.2, hy + up * 0.2, 4, [W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[4], W7_ENEMY[5]], a.seed + i, 6);
      continue;
    }
    const q = easeOut(u);
    const ctl: [number, number] = [(mx + hx) / 2 + spread, (my + hy) / 2 - 8 + up];
    const [px, py] = quad(mx, my, ctl[0], ctl[1], hx + spread * 0.2, hy + up * 0.2, q);
    const [bx, by] = quad(mx, my, ctl[0], ctl[1], hx + spread * 0.2, hy + up * 0.2, Math.max(0, q - 0.16));
    streak(g, bx, by, px, py, [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[4]], 1, 0, 0.8);
    sliver(g, px, py, a.seed + i * 1.7 + a.t * 18, 5 + hash2(i, a.seed, 3) * 4, GL);
  }
}

// =============================================================================================
// The hooks the renderer calls (all only while WORDS7_LOOK.on).

const LAYERS: Record<string, { floor?: boolean; air?: boolean }> = {
  'piercing:front': { air: true },
  'piercing:behind': { floor: true, air: true },
  'piercing:monster': { air: true },
  'bleeding:front': { floor: true, air: true },
  'bleeding:behind': { floor: true, air: true },
  'bleeding:monster': { floor: true, air: true },
  'reaping:front': { air: true },
  'reaping:behind': { floor: true, air: true },
  'reaping:monster': { floor: true, air: true },
  'culling:front': { air: true },
  'culling:behind': { floor: true, air: true },
  'culling:monster': { air: true },
  'surging:front': { floor: true, air: true },
  'surging:behind': { floor: true, air: true },
  'surging:monster': { floor: true, air: true },
  'plundering:front': { floor: true, air: true },
  'plundering:behind': { air: true },
  'plundering:monster': { air: true },
  'mirroring:front': { air: true },
  'mirroring:behind': { air: true },
  'mirroring:monster': { air: true },
};

function drawAct(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const key = `${a.word}:${a.side}`;
  if (!LAYERS[key]?.[layer]) return;
  switch (key) {
    case 'piercing:front': return pierceFront(g, cam, a, game);
    case 'piercing:behind': return pierceBehind(g, cam, a, layer);
    case 'piercing:monster': return pierceMonster(g, cam, a);
    case 'bleeding:front': return bleedFront(g, cam, a, game, layer);
    case 'bleeding:behind': return bleedBehind(g, cam, a, game, layer);
    case 'bleeding:monster': return bleedMonster(g, cam, a, game, layer);
    case 'reaping:front': return reapFront(g, cam, a, game);
    case 'reaping:behind': return reapBehind(g, cam, a, game, layer);
    case 'reaping:monster': return reapMonster(g, cam, a, layer);
    case 'culling:front': return cullFront(g, cam, a, game);
    case 'culling:behind': return cullBehind(g, cam, a, game, layer);
    case 'culling:monster': return cullMonster(g, cam, a, game);
    case 'surging:front': return surgeFront(g, cam, a, game, layer);
    case 'surging:behind': return surgeBehind(g, cam, a, game, layer);
    case 'surging:monster': return surgeMonster(g, cam, a, game, layer);
    case 'plundering:front': return plunderFront(g, cam, a, layer);
    case 'plundering:behind': return plunderBehind(g, cam, a, game);
    case 'plundering:monster': return plunderMonster(g, cam, a, game);
    case 'mirroring:front': return mirrorFront(g, cam, a, game);
    case 'mirroring:behind': return mirrorBehind(g, cam, a, game);
    case 'mirroring:monster': return mirrorMonster(g, cam, a, game);
  }
}

/** Under the figures (render.ts, with the floor's patches). */
export function floorW7(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, here: (x: number, y: number) => boolean): void {
  if (!WORDS7_LOOK.on) return;
  for (const a of W7.acts) if (here(a.x, a.y)) drawAct(g, cam, a, game, 'floor');
  void t;
}

/** Over the figures (drawn after the dark, so it glows). */
export function airW7(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game): void {
  if (!WORDS7_LOOK.on) return;
  for (const a of W7.acts) drawAct(g, cam, a, game, 'air');
  void t;
}

/** Light: the renderer's `spot` (screen x, y, radius, strength). */
export function lightsW7(spot: (x: number, y: number, r: number, a: number) => void, cam: Cam, game: Game, t: number): void {
  if (!WORDS7_LOOK.on) return;
  for (const a of W7.acts) {
    const [x, y] = S(cam, a.x, a.y);
    const [x1, y1] = S(cam, a.x1, a.y1);
    const fade = clamp01((a.dur - a.t) / 0.4);
    if (a.word === 'piercing' && a.side === 'behind') spot((x + x1) / 2, (y + y1) / 2, 50, 0.8 * fade);
    else if (a.word === 'piercing') spot((x + x1) / 2, (y + y1) / 2 - 14, 60, 0.6 * fade);
    else if (a.word === 'bleeding' && a.side === 'behind') spot(x, y - 6, 34, 0.55 * fade);
    else if (a.word === 'surging' || a.word === 'culling') spot(x, y - 4, 30 + a.r * 22, 0.7 * fade);
    else spot(x, y - 10, 36, 0.6 * fade);
  }
  void game;
  void t;
}

/** A monster's own picture changed by a word: a spirit Reaping raised (soul-light, its edge cyan), one Culling cut down (split along the cut). */
export function lookW7(m: Monster, sp: Sprite): { sp: Sprite; alpha: number; tint: [string, number] | null } | null {
  if (!WORDS7_LOOK.on) return null;
  for (const a of W7.acts) {
    if (a.word === 'reaping' && a.side === 'behind' && a.ids[0] === m.id) return { sp: remade(sp, 'soul'), alpha: 0.88, tint: null };
    if (a.word === 'culling' && a.side === 'front' && a.ids[0] === m.id && a.t >= W7_TIME.cullSweep * 0.5) {
      const slide = Math.min(7, Math.round(((a.t - W7_TIME.cullSweep * 0.5) / 0.2) * 5) + 3);
      return { sp: splitOf(sp, slide, a.dx >= 0 ? 1 : -1, `${m.id}:${sp.img.width}x${sp.img.height}:${sp.ax}`), alpha: 1, tint: a.t < W7_TIME.cullSweep * 0.8 ? [W7_RAMP.culling[4], 0.45] : null };
    }
    if (a.word === 'culling' && a.side === 'behind' && a.ids[0] === m.id && a.pts.length && a.t - a.pts[0] >= 0 && a.t - a.pts[0] < 0.3) return { sp, alpha: 1, tint: [W7_RAMP.culling[4], 0.35] };
    if (a.word === 'piercing' && a.side === 'front' && a.ids.includes(m.id)) {
      const s = a.pts[a.ids.indexOf(m.id)] ?? 0;
      const since = (a.t * W7_TIME.pierceSpeed - s) / W7_TIME.pierceSpeed;
      if (since >= 0 && since < 0.05) return { sp, alpha: 1, tint: [W7_RAMP.piercing[5], 0.35] };
    }
    if (a.word === 'piercing' && a.side === 'behind' && a.ids.includes(m.id)) {
      const after = a.t - W7_TIME.lanceWait - W7_TIME.lanceFall;
      if (after >= 0 && after < 0.06) return { sp, alpha: 1, tint: [W7_RAMP.piercing[5], 0.22] };
    }
    if (a.word === 'mirroring' && a.side === 'monster' && a.ids[0] === m.id && a.t < 0.15) return { sp, alpha: 1, tint: ['#ffd8e8', 0.4 * (1 - a.t / 0.15)] };
  }
  return null;
}

/**
 * The hero as drawn (render.ts, with his picture and where it stands): kept for the mirror that repeats
 * his attack; and what stands with him: his reflection in glass beside him (Mirroring in front).
 */
export function heroW7(sp: Sprite, h: { x: number; y: number; fx: number; fy: number }, cam: Cam): { sp: Sprite; x: number; y: number; depth: number; alpha: number }[] {
  if (!WORDS7_LOOK.on) return [];
  W7.heroSp = sp;
  const out: { sp: Sprite; x: number; y: number; depth: number; alpha: number }[] = [];
  for (const a of W7.acts) {
    if (a.word !== 'mirroring' || a.side !== 'front') continue;
    const [ox, oy] = mirrorOffset(h);
    out.push({ sp: remade(sp, 'glass'), x: wx(cam, h.x + ox, h.y + oy), y: wy(cam, h.x + ox, h.y + oy), depth: h.x + ox + h.y + oy, alpha: 0.86 * clamp01((a.dur - a.t) / 0.3) });
  }
  return out;
}

// =============================================================================================
// The clock.

let joinedLevel: unknown = null;

export function tickW7(dt: number, game: Game, fx: Fx): void {
  if (!WORDS7_LOOK.on) return;
  if (game.level !== joinedLevel) {
    joinedLevel = game.level;
    clearW7();
  }
  W7.clock += dt;
  for (let i = W7.acts.length - 1; i >= 0; i--) {
    const a = W7.acts[i];
    a.t += dt;
    // (Reaping on a monster: its fall played backwards, held on the game's own pictures of it)
    if (a.word === 'reaping' && a.side === 'monster' && a.fall >= 0) {
      const f = fx.fallen[a.fall];
      if (f) f.t = a.dieT * (1 - clamp01(a.t / 0.8));
    }
    if (a.t >= a.dur) W7.acts.splice(i, 1);
  }
}

/** The playtest's hands: `window.__dbg.words7` (main.ts). Nothing here runs unless a playtest calls it. */
export function demoW7(fx: Fx, getGame: () => Game | null) {
  const G = (): Game => {
    const g = getGame();
    if (!g) throw new Error('no game');
    return g;
  };
  return {
    switch: WORDS7_LOOK,
    state: W7,
    words: W7_WORDS,
    ramp: W7_RAMP,
    clear: () => {
      clearW7();
      joinedLevel = getGame()?.level ?? null;
    },
    /** A word's rune stone as a picture (for the sheet): its PNG, as a data URL. */
    runePng: (word: W7Word): string => w7Rune(word).img.toDataURL('image/png'),
    /** A look begins. */
    play: (word: W7Word, side: W7Side, o: W7Options): number => playW7(word, side, o).id,
    /** Every look's clock set to `secs` (a still of one moment). */
    at: (secs: number) => {
      for (const a of W7.acts) a.t = secs;
      tickW7(0, G(), fx);
    },
    /** A monster laid on the floor as dead, its fall `t` seconds along (its place in fx.fallen). */
    corpse: (id: number, t = 5): number => {
      const g = G();
      const m = g.monsters.find((q) => q.id === id);
      if (!m) return -1;
      fx.fallen.push({ figure: figureOf(m), x: m.x, y: m.y, back: m.fx + m.fy < -0.2, flip: m.fx - m.fy < 0, t });
      g.monsters.splice(g.monsters.indexOf(m), 1);
      return fx.fallen.length - 1;
    },
  };
}
