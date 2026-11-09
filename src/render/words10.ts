// HIS THREE NEW WORDS' LOOKS: Lasting, Fleeting and Vast. A mock-up of the art chat's, behind WORDS10_LOOK, which is OFF:
// with it off nothing here is drawn, lit, ticked or read, and the game is as it was (tests/words10.test.ts). Their rules are
// the main chat's (its branch words10: game/defs.ts LASTING, FLEETING, VAST); this is how each LOOKS: its rune stone, its
// colours, and each of its sides at work.
//
// His words (the main chat's board post, 9 Nov 2026, 10:45): of Lasting, “Well it makes everything connected to lasting last
// longer”; of Vast, “the opposite of precise”. Asked (13:20) whether to try the ten new words on a test page with plain looks:
// “Wait for the art”. Asked here (by 13:40) what to draw after Reaping's Shade: “The three new words (Recommended)”.
//
// Step 1 is a sheet of stills (docs/mockups/words10/pictures/words3_looks.png). Every look here is a drawing of its own clock
// and of what the rules keep (an orb's age, a patch's, his spin's, a boost's, a poison's), so a still is one moment of the
// same drawing the next step animates.
//
// WHAT IT READS (all only while WORDS10_LOOK.on), the rules' own state: each of his abilities' Resolved `last`, `pace` and
// `vast`, and its words in front; what an ability made, by its `skill`: game.orbs, game.familiars, game.contraptions, the
// patches in game.zones, his held spin (hero.channel); the boosts on him (mightT, hasteT, frenzyT, shieldT) and the abilities
// that give them; a monster's poison and burning (poisonT, burnT) and the ability that last struck it (lastSkill); his own
// poison, burning and chill (poisonT, burnT, chillT) and the monsters near him carrying Lasting or Fleeting; the warnings
// ('warn' zones) of monsters carrying Vast. And two of the rules' events: 'burst' (an area landing: its `words` in front, so
// Vast in front shows; and Vast behind's splash, style 'shock', `r` VAST.splashR) and the game's own 'zone' (a patch laid).

import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { P } from '../art/palette';
import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { hash2 } from '../engine/rng';
import { FLEETING, LASTING, SKILLS, TUNE, VAST } from '../game/defs';
import type { Game } from '../game/game';
import type { Monster } from '../game/state';
import type { WordId } from '../game/types';
import type { Cam, Fx } from './fx';
import { wx, wy } from './fx';

/** The switch. Off: nothing here is drawn, lit, ticked or read, and the game is as it was. */
export const WORDS10_LOOK = { on: false };

export type W10Word = 'lasting' | 'fleeting' | 'vast';
export const W10_WORDS: readonly W10Word[] = ['lasting', 'fleeting', 'vast'];
export const W10_NAME: Record<W10Word, string> = { lasting: 'Lasting', fleeting: 'Fleeting', vast: 'Vast' };

/**
 * Each word's colours, darkest to brightest (the last its white-hot); index 3 its own colour (its name, its rune), index 4 its
 * glow, as every word's. Each at least 12 from every other word of the 28, every meld (their art and their stand-ins), Binding,
 * the friend's cyan and the enemy's pink and gold, as the eye sees colour (CIEDE2000; tests/words10.test.ts). The space is
 * crowded: the yellow sands are Heavy's and Binding's, the pale lilacs Splitting's, Hexing's and Hailstorm's, so Lasting is an
 * old dusk sand (its glow pale amber, kept clear of the enemy's gold, as Plundering is), Fleeting a lilac so pale it is nearly
 * white (its body the deeper lilac under it), Vast a deep earth (its glow the dust off it).
 */
export const W10_RAMP: Record<W10Word, readonly string[]> = {
  // old sand at dusk, pale amber where the light is in it
  lasting: ['#1c1412', '#3e2e28', '#6e564c', '#aa8880', '#ecceb0', '#fff4e6'],
  // a lilac, so pale at its edge it is nearly white
  fleeting: ['#1e1630', '#5a4486', '#b48ce6', '#f8e4f8', '#fff4ff', '#ffffff'],
  // deep earth, and the dust off it
  vast: ['#140e08', '#2e2214', '#4a3620', '#6e4e2e', '#c4a47e', '#f0e2cc'],
};
export const W10_COLOR = Object.fromEntries(W10_WORDS.map((w) => [w, W10_RAMP[w][3]])) as Record<W10Word, string>;
export const W10_GLOW = Object.fromEntries(W10_WORDS.map((w) => [w, W10_RAMP[w][4]])) as Record<W10Word, string>;

/** A monster's side of every word: the enemy's own pink burning to gold (his rule: pink and gold glows are the enemy's), on dark. */
export const W10_ENEMY: readonly string[] = ['#0e050a', '#2a0c1c', '#5a1438', '#c02860', '#ff4f8a', '#ffd27a'];
/** Dust and earth of the floor, for Vast's rings (shadowed to lit). */
const EARTH: readonly string[] = ['#1e160e', '#34281a', '#4e3c28', '#6e563a', '#94785a', '#bca07c'];
/** Dust raised in the dark: grey-brown, a little lit along its tops. */
const DUST: readonly string[] = ['#2a2420', '#3c3430', '#52483e', '#6c6050', '#8a7c68'];
/** The enemy's dust: pink-grey, rolled up off the floor by a monster's widened blow. */
const ENEMY_DUST: readonly string[] = ['#2a1420', '#401a30', '#5a2440', '#7a3050', '#a04462'];

/**
 * Their glyphs, cut in the rune stone as the others are (art/icons.ts, GLYPH): 7 by 7, 'X' the word's colour, 'o' its glow.
 */
export const W10_GLYPH: Record<W10Word, readonly string[]> = {
  // an hourglass, its sand held: a grain left above, the thread of it, the heap below lit
  lasting: ['XXXXXXX', '.X...X.', '..XoX..', '...o...', '..X.X..', '.XoooX.', 'XXXXXXX'],
  // a feather, its vane lit, its quill trailing
  fleeting: ['.....XX', '....XoX', '...XoX.', '..XoX..', '.XoX...', '.XX....', 'X......'],
  // rings opening outward from a point: the point, a ring of light round it, the outer ring broken open
  vast: ['.XX.XX.', 'X.....X', 'X..o..X', '..oXo..', 'X..o..X', 'X.....X', '.XX.XX.'],
};
export const W10_GLYPH_IS: Record<W10Word, string> = {
  lasting: 'an hourglass, its sand held',
  fleeting: 'a feather',
  vast: 'rings opening outward from a point',
};

/** Its rune stone, cut as the others are (art/icons.ts, runeSprite; render/words7.ts, w7Rune). */
export function w10Rune(word: W10Word): Sprite {
  const rows = ['............', '..11111111..', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '.1222222223.', '..33333333..', '............'];
  const p = new Px(12, 12);
  const tone: Record<string, string> = { '1': P.st6, '2': P.st5, '3': P.st3 };
  rows.forEach((row, y) => [...row].forEach((ch, x) => tone[ch] && p.set(x, y, tone[ch])));
  const gl = W10_GLYPH[word];
  const on = (gx: number, gy: number): boolean => gy >= 0 && gy < 7 && gx >= 0 && gx < 7 && gl[gy].charAt(gx) !== '.';
  for (let gy = 0; gy < 7; gy++) {
    for (let gx = 0; gx < 7; gx++) {
      if (!on(gx, gy)) continue;
      if (!on(gx, gy - 1)) p.set(3 + gx, 2 + gy, P.st3);
      if (!on(gx - 1, gy)) p.set(2 + gx, 3 + gy, P.st3);
    }
  }
  for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 7; gx++) if (on(gx, gy)) p.set(3 + gx, 3 + gy, gl[gy].charAt(gx) === 'o' ? W10_GLOW[word] : W10_COLOR[word]);
  return p.outline(P.ink).sprite(6, 10);
}

/**
 * The numbers the looks are drawn to. How long, how wide and how strong are the rules' (game/defs.ts), read from there; the
 * rest is how the pictures want it, in seconds and pixels.
 */
export const W10_TIME = {
  /** The rules': Lasting's half again; Fleeting's third; Vast's widening, its splash's reach, and a monster's widening. */
  longer: LASTING.longer,
  shorter: FLEETING.shorter,
  wider: VAST.wider,
  splashR: VAST.splashR,
  monsterWider: VAST.monster,
  /** Lasting: the band of sand-light crawls over what it holds once in this; the grains drift down this fast (px a second). */
  crawl: 2.6,
  drift: 5,
  /** ...his boost's ribbon trails this much of his path behind him (seconds). */
  ribbon: 1.1,
  /** Fleeting: its speed-streaks whip round this fast (radians a second); its after-images this far apart (seconds). */
  whip: 9,
  stutter: 0.05,
  /** ...its quick flares, each this long (seconds), so many at once. */
  flare: 0.09,
  /** Vast: its ring of dust runs out from the old edge to the new in this, and settles over this. */
  ring: 0.34,
  ringFade: 0.3,
  /** ...its splash runs out in this, and its clods land on those near after this. */
  splash: 0.32,
  splashFade: 0.3,
};

// =============================================================================================
// What is going on.

/** One moment at work (a ring of dust, a splash): its own clock, where it is (world), whom it is about. */
export interface Act10 {
  id: number;
  word: W10Word;
  /** 'ring' (Vast in front: an area's edge pushed out), 'splash' (Vast behind). */
  kind: 'ring' | 'splash';
  t: number;
  dur: number;
  seed: number;
  x: number;
  y: number;
  /** The new edge, and where it was (tiles). */
  r: number;
  r0: number;
  /** Lifted off the floor this much (pixels): a whirlwind's cut. */
  z: number;
  /** Those it reaches (a splash: the near ones, world places). */
  to: { x: number; y: number; top: number }[];
}

export const W10 = {
  clock: 0,
  acts: [] as Act10[],
  next: 1,
  /** His path (world), newest last, for the boost's ribbon; and his pictures as drawn, for Fleeting's after-images. */
  trail: [] as { x: number; y: number; at: number }[],
  seen: [] as { sp: Sprite; x: number; y: number; at: number }[],
  /** The game's own clock for the whirlwind's blade (render/fx.ts drawAir: its lead goes round with fx.clock). */
  fx: null as Fx | null,
  /** For the stills: his path laid by hand, and the after-images' offsets laid by hand (screen px). */
  laidTrail: null as { x: number; y: number }[] | null,
};

export function clearW10(): void {
  W10.acts.length = 0;
  W10.trail.length = 0;
  W10.seen.length = 0;
  W10.laidTrail = null;
}

export type W10Options = Partial<Omit<Act10, 'id' | 'word' | 'kind' | 'seed'>> & { seed?: number };

/** A moment begins. */
export function playW10(word: W10Word, kind: Act10['kind'], o: W10Options): Act10 {
  const a: Act10 = {
    id: W10.next++,
    word,
    kind,
    t: o.t ?? 0,
    dur: o.dur ?? 1,
    seed: o.seed ?? Math.floor(Math.random() * 1e6),
    x: o.x ?? 0,
    y: o.y ?? 0,
    r: o.r ?? 1,
    r0: o.r0 ?? (o.r ?? 1) / (1 + VAST.wider),
    z: o.z ?? 0,
    to: o.to ?? [],
  };
  W10.acts.push(a);
  return a;
}

const TAU = Math.PI * 2;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (q: number): number => {
  const k = clamp01(q);
  return k * k * (3 - 2 * k);
};
const easeOut = (q: number): number => 1 - (1 - clamp01(q)) ** 3;

// =============================================================================================
// What the rules say each of his abilities carries.

/** Lasting or Fleeting on ability `i` (the rules' Resolved `last`: more than 1, Lasting; less, Fleeting), or neither. */
export function timeWord(game: Game, i: number): 'lasting' | 'fleeting' | null {
  const s = game.hero.skills[i];
  if (!s) return null;
  const last = (s.r as { last?: number }).last ?? 1;
  return last > 1.001 ? 'lasting' : last < 0.999 ? 'fleeting' : null;
}
/** How far into the time Lasting gave it a thing is (0 while still in its own time, to 1 at its end): its last stretch. */
const lastStretch = (t: number, life: number, last: number): number => {
  const own = life / Math.max(1, last);
  return life - own < 0.05 ? 0 : clamp01((t - own) / (life - own));
};
const lastOf = (game: Game, i: number): number => (game.hero.skills[i]?.r as { last?: number } | undefined)?.last ?? 1;
const fronts = (game: Game, i: number): readonly (WordId | null)[] => game.hero.skills[i]?.front ?? [];
const topOf = (m: Monster): number => FIGURE_SIZE[figureOf(m)]?.top ?? 22;
/** How tall he stands (game pixels): his head's top over his feet. */
const HERO_TOP = 24;

// =============================================================================================
// The brushes: every look is painted with these, pixel by pixel, never a flat shape.

/** Whether a pixel is in, for a see-through `a` (0..1): scattered as grain is, never in a pattern. */
const dith = (x: number, y: number, a: number, seed = 91): boolean => a > hash2(Math.round(x), Math.round(y), seed);

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

/** A streak from its tail (x0, y0) to its head (x1, y1): `w` across at its head, one at its tail, its tones from dim to bright. */
function streak(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, C: readonly string[], w = 1, alpha = 1): void {
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
    if (q < 0.3 && !dith(px, py, q / 0.3 + 0.2)) continue;
    if (alpha < 1 && !dith(px, py, alpha)) continue;
    const ci = Math.min(C.length - 1, Math.floor(q * C.length));
    const half = Math.round(((w - 1) / 2) * q);
    for (let k = -half; k <= half; k++) dot(g, px + nx * k, py + ny * k, C[Math.max(0, ci - (half > 0 && Math.abs(k) === half ? 1 : 0))]);
  }
}

/** Mist, smoke or dust: a soft cloud of uneven billows, curling as it rises, thinning to scattered grains at its edge. */
function mist(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, C: readonly string[], amount: number, seed: number, t: number, rise = 0.6): void {
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const e = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      if (e > 1) continue;
      const x = Math.round(cx + dx);
      const y = Math.round(cy + dy);
      const n = vnoise(x * 0.18 + Math.sin(y * 0.13 + t * 1.3) * 0.8, y * 0.22 + t * rise * 3, seed) * 0.7 + vnoise(x * 0.45, y * 0.5 + t * rise * 5, seed + 3) * 0.3;
      const v = Math.pow(1 - e, 0.8) * amount * n * n * 2.2;
      const cut = 0.32 + (hash2(x, y, seed + 11) - 0.5) * 0.16;
      if (v < cut) continue;
      dot(g, x, y, C[Math.max(0, Math.min(C.length - 1, Math.floor(((v - 0.32) / 0.6) * C.length)))]);
    }
  }
}

/** A clod of earth flung: two by two, its top lit, its underside dark, a crumb off it. */
function clod(g: CanvasRenderingContext2D, x: number, y: number, C: readonly string[], big: boolean): void {
  dot(g, x, y, C[4]);
  dot(g, x + 1, y, C[3]);
  dot(g, x, y + 1, C[2]);
  dot(g, x + 1, y + 1, C[1]);
  if (big) {
    dot(g, x - 1, y + 1, C[3]);
    dot(g, x + 2, y + 1, C[1]);
    dot(g, x, y + 2, C[1], 2, 1);
  }
}

/** A rock of earth torn up and thrown: four across, three down (`big`: five by four), lit on its top left, its underside dark. */
function rock(g: CanvasRenderingContext2D, x: number, y: number, big = false): void {
  const C = W10_RAMP.vast;
  x = Math.round(x) - 2;
  y = Math.round(y) - 1;
  if (big) {
    dot(g, x, y - 1, C[4], 3, 1);
    dot(g, x - 1, y, C[5]);
    dot(g, x + 3, y, EARTH[3]);
    dot(g, x + 4, y + 1, EARTH[2]);
    dot(g, x + 3, y + 2, EARTH[1]);
    dot(g, x, y + 3, EARTH[1], 3, 1);
  }
  dot(g, x + 1, y, C[5]);
  dot(g, x + 2, y, C[4]);
  dot(g, x, y + 1, C[4]);
  dot(g, x + 1, y + 1, EARTH[4]);
  dot(g, x + 2, y + 1, EARTH[3]);
  dot(g, x + 3, y + 1, EARTH[2]);
  dot(g, x + 1, y + 2, EARTH[2]);
  dot(g, x + 2, y + 2, EARTH[1]);
  dot(g, x, y + 2, EARTH[3]);
}

/** Screen point of a world place `z` pixels up. */
const S = (cam: Cam, x: number, y: number, z = 0): [number, number] => [wx(cam, x, y), wy(cam, x, y) - z];
/** A world radius as the screen lays it on the floor: across and down. */
const RX = 22.6;
const RY = 11.3;

// =============================================================================================
// LASTING: a slow, heavy shimmer of sand-light crawling over what it holds; in the time it gave, its sand running out and
// settling.

/**
 * A band of sand-light crawling slowly across an oval (`rx` by `ry` about cx, cy, on the screen), top left to bottom right:
 * grains lit in it, brightest at its middle line; a few grains drifting slowly down over the rest; `amount` how much shows.
 * `inside`, if given, says which pixels are the thing's own (the band lies only on it).
 */
function sandOver(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, t: number, seed: number, amount: number, C: readonly string[] = W10_RAMP.lasting, base = 0.07): void {
  const band = ((t / W10_TIME.crawl + hash2(seed, 1, 5)) % 1) * 3.4 - 1.7;
  const fall = Math.floor(t * W10_TIME.drift);
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const e = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      if (e > 1) continue;
      const u = (dx / rx) * 0.72 + (dy / ry) * 0.7;
      const d = Math.abs(u - band);
      const inBand = d < 0.36 ? 1 - d / 0.36 : 0;
      // the grains: the same grains, drifting down a pixel at a time (their hash taken where they were)
      const h = hash2(Math.round(cx + dx), Math.round(cy + dy) - fall, seed + 7);
      const p = (base + 0.85 * inBand) * amount * (1 - e * 0.35);
      if (h >= p) continue;
      dot(g, cx + dx, cy + dy, inBand > 0.7 ? C[5] : inBand > 0.25 ? C[4] : C[3]);
    }
  }
}

/** A heap of sand on the floor at (x, y), `p` of the way to its whole size: a mound, lit on its left, its foot dark, a grain glinting on its top. */
function heap(g: CanvasRenderingContext2D, x: number, y: number, p: number, C: readonly string[] = W10_RAMP.lasting): void {
  if (p <= 0.02) return;
  const w = 3 + p * 8;
  const h = 1.4 + p * 3;
  for (let row = 0; row < Math.ceil(h); row++) {
    const q = row / h;
    const half = (w / 2) * (1 - Math.pow(q, 1.5));
    for (let dx = -Math.round(half); dx <= Math.round(half); dx++) {
      const side = dx / Math.max(1, half);
      const c = row === 0 ? (side > 0.3 ? C[1] : C[2]) : side < -0.3 ? C[4] : side > 0.45 ? C[2] : C[3];
      dot(g, x + dx, y - row, c);
    }
  }
  dot(g, x - 1, y - Math.ceil(h) + 1, C[5]);
}

/** A thread of sand pouring from (x, y0) to the floor at (x, y1), its grains quickening as they fall, splashing at its foot. */
function pour(g: CanvasRenderingContext2D, x: number, y0: number, y1: number, t: number, seed: number, amount: number, C: readonly string[] = W10_RAMP.lasting): void {
  const L = Math.max(2, y1 - y0);
  for (let s = 0; s <= L; s++) {
    // (a running thread: whole where it leaves, breaking into grains as it falls)
    const q = s / L;
    const run = (s * 0.37 - t * 7.5 + hash2(seed, 2, 2) * 9) % 1.6;
    if (q > 0.25 && !dith(x, y0 + s + Math.floor(t * 30), (1 - q * 0.55) * amount * (run < 0.9 ? 1 : 0.35), seed)) continue;
    dot(g, x + (q > 0.6 && hash2(s, Math.floor(t * 20), seed) < 0.3 ? 1 : 0), y0 + s, q < 0.3 ? C[5] : C[4]);
  }
  // grains bouncing off the heap
  for (let i = 0; i < 4; i++) {
    const ph = (t * 2.2 + i / 4) % 1;
    const sx = x + (i % 2 ? 1 : -1) * (1 + ph * 3);
    const sy = y1 - 2 - Math.sin(ph * Math.PI) * 2;
    if (dith(sx, sy, amount * (1 - ph), seed + i)) dot(g, sx, sy, C[4]);
  }
}

/**
 * A ring of sand turning slowly round a thing hanging at (cx, cy) of radius `rad`: two bands of grains on a tilted ellipse, the
 * far half hidden behind it, the near half over it.
 */
function sandRing(g: CanvasRenderingContext2D, cx: number, cy: number, rad: number, t: number, seed: number, amount: number, C: readonly string[] = W10_RAMP.lasting): void {
  const rx = rad + 5;
  const ry = (rad + 5) * 0.36;
  const n = Math.round(rx * 9);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + t * 0.55;
    for (let band = 0; band < 2; band++) {
      const sc = band === 0 ? 1 : 0.84;
      const x = cx + Math.cos(a) * rx * sc;
      const y = cy + 1 + Math.sin(a) * ry * sc - Math.cos(a) * 1.2;
      const near = Math.sin(a) > 0;
      // (the far half passes behind it)
      if (!near && Math.hypot(x - cx, (y - cy) * 1.05) < rad + 0.5) continue;
      const v = vnoise(i * 0.4 + band * 7, 1, seed);
      if (!dith(x, y, amount * (0.25 + v) * (near ? 1 : 0.6), seed + band)) continue;
      dot(g, x, y, near ? (v > 0.6 ? C[5] : C[4]) : v > 0.6 ? C[4] : C[3]);
    }
  }
}

/**
 * Lasting on a thing that hangs or stands (an orb, a familiar, a turret): the sand-light crawling over it and a ring of its sand
 * turning slowly round it; in the time Lasting gave it (`p`, 0..1 of that time gone), its sand pouring out of its underside onto
 * the floor below, the heap there growing.
 */
function lastingThing(g: CanvasRenderingContext2D, fx0: number, fy0: number, up: number, rad: number, t: number, seed: number, p: number, fade: number): void {
  const cx = fx0;
  const cy = fy0 - up;
  sandOver(g, cx, cy, rad, rad, t, seed, 0.95 * fade);
  sandRing(g, cx, cy, rad, t, seed, fade);
  if (p > 0) {
    pour(g, cx, cy + rad + 1, fy0 - 1 - Math.round(1.4 + p * 3), t, seed, fade);
    heap(g, cx, fy0, p * fade);
  }
}

/**
 * Lasting on a patch of ground (burning ground, a cloud's floor, a frozen patch, thorns): the band of sand-light crawling over
 * it; in the time Lasting gave it, sand drifting in over it from its edge in tongues, rippled into little dunes, burying it as
 * its end comes.
 */
function lastingPatch(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, seed: number, p: number, fade: number): void {
  const C = W10_RAMP.lasting;
  const rx = r * RX;
  const ry = r * RY;
  sandOver(g, cx, cy - 1, rx * 0.92, ry * 0.92, t, seed, 0.85 * fade, C, 0.04);
  if (p <= 0) return;
  const reach = 0.1 + 0.62 * p;
  for (let dy = -Math.ceil(ry * 1.06); dy <= Math.ceil(ry * 1.06); dy++) {
    for (let dx = -Math.ceil(rx * 1.06); dx <= Math.ceil(rx * 1.06); dx++) {
      const e = Math.sqrt((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry));
      const a = Math.atan2(dy / ry, dx / rx);
      const outer = 1 + 0.05 * (vnoise(a * 5 + 11, 0, seed) - 0.5);
      if (e > outer) continue;
      // tongues of it reaching in, uneven
      const inner = outer - reach * (0.35 + 1.1 * vnoise(a * 3.1 + 7, 0.5, seed));
      if (e < inner) continue;
      const k = (e - inner) / Math.max(0.01, outer - inner);
      if (!dith(cx + dx, cy + dy, Math.min(1, 0.15 + k * 1.5) * fade, seed + 3)) continue;
      // its ripples, along its edge: the crest lit, its lee dark
      const ph = ((outer - e) * Math.max(rx, 8) * 0.36 + vnoise(a * 6, 1, seed + 1) * 1.8) % 2.6;
      dot(g, cx + dx, cy + dy, ph < 0.55 ? C[4] : ph < 1.15 ? C[2] : C[3]);
    }
  }
}

/**
 * Lasting on his whirlwind: a long trail of sand-light lingering behind each of its two blades (the game's: render/fx.ts, two
 * crescents chasing each other round him with fx.clock), sagging as it hangs, sand sifting down out of it; in the time Lasting
 * gave the spin, the sand settled in a drift on the floor round its edge.
 */
function lastingSpin(g: CanvasRenderingContext2D, cam: Cam, hx: number, hy: number, r: number, t: number, clock: number, seed: number, p: number, layer: 'floor' | 'air'): void {
  const C = W10_RAMP.lasting;
  if (layer === 'floor') {
    if (p > 0) {
      const n = Math.round(r * RX * 7);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        const thick = 1 + Math.round((1.5 + 2 * vnoise(a * 4, 0, seed)) * p);
        for (let j = 0; j < thick; j++) {
          const rr = r * (1.02 - j * 0.035);
          const [px, py] = S(cam, hx + Math.cos(a) * rr, hy + Math.sin(a) * rr);
          if (!dith(px, py, 0.35 + 0.6 * p, seed + j)) continue;
          dot(g, px, py, j === thick - 1 ? C[4] : j === 0 ? C[2] : C[3]);
        }
      }
    }
    return;
  }
  const lead0 = clock * TAU * 2.6;
  for (const half of [0, Math.PI]) {
    for (let u = 0; u < 1; u += 0.005) {
      const behind = 1.75 + u * 2.4;
      const a = lead0 + half - behind;
      const rr = r * (0.97 + 0.05 * vnoise(u * 30, 2, seed));
      const [px, py0] = S(cam, hx + Math.cos(a) * rr, hy + Math.sin(a) * rr, 10);
      const py = py0 + u * u * 7;
      if (!dith(px, py, Math.pow(1 - u, 0.8) * 1.1, seed + 2)) continue;
      dot(g, px, py, u < 0.22 ? C[5] : C[4]);
      if (u < 0.65) dot(g, px, py + 1, u < 0.3 ? C[4] : C[3]);
    }
    // sand sifting down out of it
    for (let i = 0; i < 22; i++) {
      const u = hash2(i, seed, 3) * 0.85;
      const a = lead0 + half - (1.75 + u * 2.4);
      const fall = ((t * 1.1 + hash2(i, seed, 4)) % 1) * 12;
      const [px, py] = S(cam, hx + Math.cos(a) * r, hy + Math.sin(a) * r, 10 - fall);
      dot(g, px, py + u * u * 7, fall < 6 ? C[4] : C[3]);
    }
  }
}

/**
 * A boost Lasting gave him (Power's might, Swift's haste, Frenzy's hold, Guarding's shield): its glow drawn out behind him in a
 * long ribbon of sand-light along his path, rippling, turning as it trails (its underside darker where it turns over), fraying
 * into grains at its tail. `pts`: screen points from his back (first) to its tail.
 */
function ribbon(g: CanvasRenderingContext2D, pts: [number, number][], t: number, seed: number, fade: number, C: readonly string[] = W10_RAMP.lasting): void {
  if (pts.length < 2) return;
  const L = pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  let s = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(seg));
    for (let k = 0; k < n; k++) {
      const at = s + (k / n) * seg;
      const q = at / Math.max(1, L);
      const x = x0 + ((x1 - x0) * k) / n;
      const y = y0 + ((y1 - y0) * k) / n;
      const wave = Math.sin(at * 0.19 - t * 3.1) * 4.5 * Math.min(1, q * 2.5) + Math.sin(at * 0.07 - t * 1.3) * 2 * q;
      const twist = Math.cos(at * 0.15 - t * 2.2);
      const wide = Math.max(0, Math.round(Math.abs(twist) * 2.8 * (1 - q * 0.5)));
      const yy = y + wave;
      const keep = q > 0.6 ? (1 - (q - 0.6) / 0.4) * fade : fade;
      if (keep < 1 && !dith(x, yy, keep, seed)) continue;
      const top = twist > 0;
      // a face of it: the upper edge catching the light, the body, the lower edge in shade
      dot(g, x, yy - wide, top ? C[5] : C[4]);
      for (let w = -wide + 1; w <= wide; w++) {
        // (light through it: its body a little see-through, more so toward its tail)
        if (w > -wide + 1 && w < wide && !dith(x, yy + w, 0.85 - q * 0.35, seed + 9)) continue;
        dot(g, x, yy + w, w === wide ? (top ? C[3] : C[2]) : top ? (w <= -wide + 2 ? C[5] : C[4]) : C[3]);
      }
      // grains frayed off it, falling
      if (q > 0.35 && hash2(Math.round(x), Math.round(at), seed + 4) < 0.08) {
        const fallen = ((t * 0.7 + hash2(Math.round(x), 1, seed + 5)) % 1) * 10;
        if (dith(x, yy + fallen, keep, seed + 6)) dot(g, x + 1, yy + wide + 2 + fallen, C[4]);
      }
    }
    s += seg;
  }
}

/**
 * Lasting on what was left on one (its poison, its burning, as hard, for longer; or, in the enemy's colours, a monster's on him):
 * the sand-light crawling over it, a ring of grains turning round its middle, its sand pouring out under it into a heap at its
 * feet as its time runs on.
 */
function lastingOnIt(g: CanvasRenderingContext2D, cx: number, cy: number, top: number, t: number, seed: number, p: number, C: readonly string[] = W10_RAMP.lasting): void {
  sandOver(g, cx, cy - top * 0.5, 6, top * 0.45, t, seed, 0.9, C, 0.03);
  sandRing(g, cx, cy - top * 0.42, 4, t, seed, 0.9, C);
  pour(g, cx + 5, cy - top * 0.35, cy - Math.round(1.4 + (0.3 + 0.7 * p) * 3), t, seed, 1, C);
  heap(g, cx + 5, cy + 1, 0.3 + 0.7 * p, C);
}

// =============================================================================================
// FLEETING: a quickening: speed-streaks whipping round what it makes, a stutter of after-images, its edges thin and bright,
// burning out quick.

/** Speed-streaks whipping round an oval (rx by ry about cx, cy): `n` thin arcs, each tapering from a dim tail to its bright head. */
function whips(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, t: number, seed: number, n: number, fade: number, dir = 1, C: readonly string[] = W10_RAMP.fleeting): void {
  for (let i = 0; i < n; i++) {
    const head = dir * t * W10_TIME.whip * (0.85 + 0.3 * hash2(i, seed, 1)) + (i / n) * TAU + hash2(i, seed, 2);
    const len = 0.8 + hash2(i, seed, 3) * 0.7;
    const sc = 1 + (hash2(i, seed, 4) - 0.5) * 0.3;
    const steps = Math.round(len * Math.max(rx, ry) * sc * 1.4);
    for (let k = 0; k <= steps; k++) {
      const q = k / steps;
      const a = head - dir * len * (1 - q);
      const x = cx + Math.cos(a) * rx * sc;
      const y = cy + Math.sin(a) * ry * sc;
      if (!dith(x, y, (0.15 + 0.85 * q) * fade, seed + i)) continue;
      dot(g, x, y, q > 0.9 ? C[5] : q > 0.72 ? C[3] : q > 0.35 ? C[2] : C[1]);
      if (q > 0.6) dot(g, x, y + 1, q > 0.85 ? C[2] : C[1]);
    }
  }
}

/**
 * A tick of light popping (poison or burning ticking fast): a star of uneven spikes (never a cross), its core white-hot,
 * `k` how far through its little life (it bursts, then thins and is gone).
 */
function tick(g: CanvasRenderingContext2D, x: number, y: number, k: number, seed: number, C: readonly string[]): void {
  const r = k < 0.3 ? 2 + k * 8 : 4.4 * (1 - (k - 0.3) / 0.7) + 0.6;
  const n = 5;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + hash2(i, seed, 1) * 0.7;
    const L = r * (i % 2 === 0 ? 1 : 0.55) * (0.75 + 0.25 * hash2(i, seed, 2));
    for (let s = 1; s <= Math.round(L); s++) dot(g, x + Math.cos(a) * s, y + Math.sin(a) * s * 0.8, s > L * 0.6 ? C[2] : k < 0.5 ? C[4] : C[3]);
  }
  dot(g, x, y, k < 0.5 ? C[5] : C[4]);
  if (k < 0.35) {
    dot(g, x + 1, y, C[4]);
    dot(g, x, y - 1, C[4]);
  }
}

/**
 * Quick ticks: little stars of light popping on a thing, one after another, a few at once (its poison or burning ticking fast),
 * each with a spark thrown off it; in `C` (his lilac, or the enemy's pink and gold).
 */
function ticks(g: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, t: number, seed: number, n: number, C: readonly string[]): void {
  const beat = Math.floor(t / W10_TIME.flare);
  for (let i = 0; i < n; i++) {
    const b = beat - i;
    const k = (t - b * W10_TIME.flare) / (W10_TIME.flare * n);
    if (k < 0 || k >= 1) continue;
    const x = Math.round(cx + (hash2(b, 3, seed) - 0.5) * w);
    const y = Math.round(cy - hash2(b, 4, seed) * h);
    tick(g, x, y, k, seed + b, C);
    // a spark thrown off it, quick, and a streak behind it
    const ax = (hash2(b, 5, seed) - 0.5) * 2;
    const sx = x + ax * 12 * k;
    const sy = y - 9 * k;
    if (k > 0.15) streak(g, x + ax * 12 * (k - 0.15), y - 9 * (k - 0.15), sx, sy, [C[2], C[3], C[5]], 1);
  }
}

/**
 * Fleeting on a patch of ground: little tongues of its flame licking up all round its edge, thin and bright, flickering fast;
 * sparks shooting up off it, short and quick, burning out as they go.
 */
function fleetingPatch(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, seed: number, fade: number, layer: 'floor' | 'air'): void {
  const C = W10_RAMP.fleeting;
  const rx = r * RX;
  const ry = r * RY;
  if (layer === 'floor') {
    // its edge licked up in quick thin tongues, the far half (behind the figures)
    const n = Math.round(rx * 1.4);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + (hash2(i, seed, 1) - 0.5) * 0.25;
      if (Math.sin(a) > 0) continue;
      const d = 0.86 + 0.14 * hash2(i, seed, 2);
      licks(g, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, t, seed + i, fade);
    }
    return;
  }
  const n = Math.round(rx * 1.4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (hash2(i, seed, 1) - 0.5) * 0.25;
    if (Math.sin(a) <= 0) continue;
    const d = 0.86 + 0.14 * hash2(i, seed, 2);
    licks(g, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, t, seed + i, fade);
  }
  for (let i = 0; i < 16; i++) {
    const cyc = t * 3.6 + hash2(i, seed, 1);
    const ph = cyc % 1;
    const gen = Math.floor(cyc);
    if (ph > 0.7) continue;
    const a = hash2(i, seed + gen, 2) * TAU;
    const d = Math.sqrt(hash2(i, seed + gen, 3)) * 0.85;
    const slant = (hash2(i, seed + gen, 4) - 0.5) * 6;
    const x = cx + Math.cos(a) * rx * d + slant * ph;
    const y = cy + Math.sin(a) * ry * d - 2 - ph * 20;
    streak(g, x - slant * 0.3, y + 6, x, y, [C[1], C[2], C[2], C[3], C[5]], 2, (1 - ph / 0.7) * fade);
  }
}

/**
 * One quick tongue of flame on an edge: up to 8 pixels, two across at its root and curling to a point, flickering with the quick
 * clock (its height and its lean leap from picture to picture); lilac, its heart and its tip white.
 */
function licks(g: CanvasRenderingContext2D, x: number, y: number, t: number, seed: number, fade: number): void {
  const C = W10_RAMP.fleeting;
  const h = Math.round(-1 + 9 * vnoise(seed * 0.7, t * 18, seed));
  if (h < 3) return;
  const lean = (vnoise(seed * 1.3, t * 14, seed + 1) - 0.5) * 5;
  for (let s = 0; s < h; s++) {
    const q = s / h;
    const px = x + lean * q * q;
    if (!dith(px, y - s, fade, seed)) continue;
    const wide = q < 0.45 ? 1 : 0;
    // (lilac, its heart lighter, white only at the tip of a tall one)
    dot(g, px, y - s, s === h - 1 && h > 5 ? C[5] : q > 0.7 ? C[3] : C[2]);
    if (wide) dot(g, px + 1, y - s, q < 0.2 ? C[1] : C[2]);
  }
}

/**
 * Fleeting on his whirlwind: speed-streaks whipping round ahead of its blades, and the trace of each blade's leading edge left
 * behind it twice over, a stutter, thinner each (his own after-images, spinning: heroW10).
 */
function fleetingSpin(g: CanvasRenderingContext2D, cam: Cam, hx: number, hy: number, r: number, t: number, clock: number, seed: number): void {
  const C = W10_RAMP.fleeting;
  const lead0 = clock * TAU * 2.6;
  for (const half of [0, Math.PI]) {
    for (let e = 1; e <= 2; e++) {
      const at = lead0 + half - e * 0.7;
      for (let u = 0; u < 1; u += 0.012) {
        const a = at - u * 0.9;
        const [px, py] = S(cam, hx + Math.cos(a) * r, hy + Math.sin(a) * r, 10);
        if (!dith(px, py, (1 - u) * (e === 1 ? 1 : 0.65), seed + e)) continue;
        dot(g, px, py, u < 0.12 ? C[5] : u < 0.3 ? C[3] : C[2]);
        if (u < 0.55) dot(g, px, py + 1, u < 0.25 ? C[2] : C[1]);
      }
    }
  }
  const [cx, cy] = S(cam, hx, hy, 10);
  whips(g, cx, cy, r * RX * 1.08, r * RY * 1.08, clock * 1.6, seed, 8, 1);
  whips(g, cx, cy + 4, r * RX * 0.72, r * RY * 0.72, clock * 1.3 + 0.4, seed + 5, 5, 0.9);
  void t;
}

/** A sprite in one colour (a copy of its every pixel there is, in `c`), kept: an after-image. */
const tintMade = new WeakMap<Sprite, Map<string, Sprite>>();
export function tinted(sp: Sprite, c: string): Sprite {
  let mine = tintMade.get(sp);
  if (!mine) {
    mine = new Map();
    tintMade.set(sp, mine);
  }
  const had = mine.get(c);
  if (had) return had;
  if (typeof document === 'undefined') return sp;
  const cv = document.createElement('canvas');
  cv.width = sp.img.width;
  cv.height = sp.img.height;
  const cg = cv.getContext('2d') as CanvasRenderingContext2D;
  cg.drawImage(sp.img, 0, 0);
  // (its own light and shade kept a little: the colour laid over it, the darkest of it left a tone under)
  cg.globalCompositeOperation = 'source-atop';
  cg.globalAlpha = 0.82;
  cg.fillStyle = c;
  cg.fillRect(0, 0, cv.width, cv.height);
  const made: Sprite = { img: cv, w: sp.w, h: sp.h, ax: sp.ax, ay: sp.ay };
  if (sp.density !== undefined) made.density = sp.density;
  mine.set(c, made);
  return made;
}

// =============================================================================================
// VAST: wider, a ring of dust rolled out at its edge; behind, a splash of earth from each hit to those near.

/**
 * Where an area's edge was before Vast widened it: broken cracks in the floor along it, each a short jagged run with spurs off
 * it, its lip lit; gaps between.
 */
function oldEdge(g: CanvasRenderingContext2D, cx: number, cy: number, r0: number, fade: number, seed: number, back: boolean): void {
  const n = Math.round(r0 * RX * 6.5);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    if (Math.sin(a) < 0 !== back) continue;
    // runs of crack, and gaps between them
    if (vnoise(i * 0.09, 1, seed) < 0.48) continue;
    const j = (vnoise(i * 0.6, 3, seed + 1) - 0.5) * 3;
    const x = cx + Math.cos(a) * (r0 * RX + j);
    const y = cy + Math.sin(a) * (r0 * RY + j * 0.5);
    if (!dith(x, y, fade, seed)) continue;
    dot(g, x, y, EARTH[0]);
    if (hash2(i, seed, 5) < 0.5) dot(g, x, y - 1, EARTH[3]);
    // a spur off it, now and then
    if (hash2(i, seed, 6) < 0.06) {
      const sx = Math.cos(a) * (hash2(i, seed, 7) < 0.5 ? 1 : -1);
      for (let s = 1; s <= 3; s++) dot(g, x + sx * s, y + Math.sin(a) * s * 0.5 + (s === 2 ? 1 : 0), EARTH[0]);
    }
  }
}

/**
 * A ring of dust rolled out to an area's new edge: from where its edge was (`r0`, tiles) out to `r` as `k` goes 0 to 1, the
 * floor cracked along the old edge, a bank of churned dust rolling at its front, grit and clods of earth flung on past it.
 * Only the half of it behind the figures (`back`) or before them.
 */
function dustRing(g: CanvasRenderingContext2D, cx: number, cy: number, r0: number, r: number, k: number, fade: number, seed: number, t: number, back: boolean, z = 0, dust = 1): void {
  const C = W10_RAMP.vast;
  const rr = r0 + (r - r0) * easeOut(k);
  if (z === 0 && r0 > 0.3) oldEdge(g, cx, cy, r0, fade, seed, back);
  // the bank of dust rolling at its front
  const puffs = Math.max(10, Math.round(rr * 10));
  for (let i = 0; i < puffs; i++) {
    const a = (i / puffs) * TAU + hash2(i, seed, 1) * 0.25;
    if (Math.sin(a) < 0 !== back) continue;
    const big = 0.7 + hash2(i, seed, 2) * 0.6;
    mist(g, cx + Math.cos(a) * rr * RX * 0.94, cy + Math.sin(a) * rr * RY * 0.94 - 2 - z, (4 + rr * 1.5) * big * dust, (2 + rr * 0.7) * big * dust, [DUST[1], DUST[2], DUST[3], C[3], C[4]], (1.05 - 0.35 * k) * fade, seed + i, t, 0.35);
  }
  // its front: a broken edge of lit dust, streaks of it shoved outward
  const n = Math.max(30, Math.round(rr * RX * 7));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    if (Math.sin(a) < 0 !== back) continue;
    const v = vnoise(i * 0.15, t * 3, seed + 4);
    if (v < 0.3) continue;
    const x = cx + Math.cos(a) * rr * RX;
    const y = cy + Math.sin(a) * rr * RY - z;
    if (!dith(x, y, fade, seed + 5)) continue;
    dot(g, x, y, v > 0.6 ? C[5] : C[4]);
    dot(g, x - Math.cos(a), y - Math.sin(a) * 0.5, C[3]);
    if (v > 0.72 && k < 0.85) streak(g, x, y, x + Math.cos(a) * 5, y + Math.sin(a) * 2.5, [C[2], C[3], C[4]], 1, fade);
  }
  // grit and clods flung on past it, falling back
  for (let i = 0; i < 20; i++) {
    const a = hash2(i, seed, 6) * TAU;
    if (Math.sin(a) < 0 !== back) continue;
    const d = rr + 0.1 + hash2(i, seed, 7) * 0.35 * (0.4 + k);
    const up = Math.sin(clamp01(k * 1.2 + hash2(i, seed, 8) * 0.2) * Math.PI) * (3 + hash2(i, seed, 9) * 6);
    const x = cx + Math.cos(a) * d * RX;
    const y = cy + Math.sin(a) * d * RY - up - z;
    if (!dith(x, y, fade, seed + 6)) continue;
    if (i % 4 === 0) clod(g, x, y, EARTH, i % 8 === 0);
    else streak(g, x - Math.cos(a) * 4, y - Math.sin(a) * 2 + 1, x, y, [EARTH[1], EARTH[2], EARTH[4]], 1);
  }
}

/**
 * Vast behind: a quarter of a hit splashed onto those near it. From what was struck, a ring of earth heaving out to the splash's
 * reach (its dust low, so as not to hide them); to each one near, the floor bursting up along the way in a running heave of
 * earth and a clod thrown ahead of it; on each, a burst of dirt and clods as it lands.
 */
function splash(g: CanvasRenderingContext2D, cam: Cam, a: Act10, layer: 'floor' | 'air'): void {
  const C = W10_RAMP.vast;
  const [cx, cy] = S(cam, a.x, a.y);
  const k = clamp01(a.t / W10_TIME.splash);
  const fade = clamp01((a.dur - a.t) / W10_TIME.splashFade);
  const R = a.r * easeOut(k);
  // the ring of earth-coloured force heaving out from it, Vast's own ring (its dust lower, so the near ones stand clear in it)
  const back = layer === 'floor';
  dustRing(g, cx, cy, 0.15, Math.max(0.2, R), 1, fade * (1 - 0.35 * k), a.seed, a.t, back, 0, 0.75);
  if (layer === 'floor') {
    // the floor cracked out from where it was struck, and burst up along the way to each one near
    a.to.forEach((o, j) => {
      const [tx, ty] = S(cam, o.x, o.y);
      const L = Math.hypot(tx - cx, ty - cy);
      const run = clamp01((a.t - 0.02) / (W10_TIME.splash * 0.85));
      for (let s = 4; s < L * run; s += 1) {
        const q = s / L;
        const wob = (vnoise(s * 0.3, j, a.seed) - 0.5) * 3;
        const x = cx + (tx - cx) * q - ((ty - cy) / L) * wob;
        const y = cy + (ty - cy) * q + ((tx - cx) / L) * wob * 0.5;
        if (!dith(x, y, fade, a.seed + j)) continue;
        dot(g, x, y, EARTH[0]);
        // the heave running along it: earth up at its head
        const head = L * run - s;
        if (head < 5 && run < 1) {
          dot(g, x, y - 1, EARTH[3]);
          dot(g, x, y - 2, C[4]);
        } else if (hash2(Math.round(s), j, a.seed) < 0.3) dot(g, x, y - 1, EARTH[2]);
      }
    });
    return;
  }
  // a clod thrown ahead of the heave to each one near; then a burst of dirt on it as it lands
  a.to.forEach((o, j) => {
    const [tx, ty] = S(cam, o.x, o.y, Math.min(10, o.top * 0.35));
    const fly = clamp01((a.t - 0.02) / (W10_TIME.splash * 0.85));
    const arc = (q: number): [number, number] => [cx + (tx - cx) * q, cy - 3 + (ty - cy + 3) * q - Math.sin(q * Math.PI) * 13];
    if (fly < 1) {
      // its arc: a trail of lit dust behind it, crumbs shed off it, the clod at its head
      const tail = 0.45;
      for (let q = Math.max(0, fly - tail); q < fly; q += 0.012) {
        const [px, py] = arc(q);
        const k2 = (q - (fly - tail)) / tail;
        if (!dith(px, py, (0.35 + 0.65 * k2) * fade, a.seed + j)) continue;
        dot(g, px, py - 1, k2 > 0.6 ? C[5] : C[4]);
        dot(g, px, py, k2 > 0.75 ? C[5] : k2 > 0.4 ? C[4] : EARTH[4]);
        if (k2 > 0.3) dot(g, px, py + 1, k2 > 0.7 ? C[4] : EARTH[3]);
        if (hash2(Math.round(q * 200), j, a.seed) < 0.15) dot(g, px, py + 3 + (1 - k2) * 6, EARTH[4]);
      }
      const [hx, hy] = arc(fly);
      rock(g, hx, hy, true);
      if (fly > 0.2) {
        const [qx, qy] = arc(fly - 0.16);
        rock(g, qx - 1, qy + 2, false);
      }
      return;
    }
    const since = a.t - 0.02 - W10_TIME.splash * 0.85;
    const kk = clamp01(since / 0.35);
    // it bursts on it: a flash of dust-light, dirt thrown up round it, clods falling back
    if (kk < 0.4) for (let i = 0; i < 7; i++) {
      const an = (i / 7) * TAU + hash2(i, a.seed + j, 6) * 0.5;
      const L0 = 2 + kk * 10;
      const L1 = L0 + 4 * (1 - kk / 0.4);
      streak(g, tx + Math.cos(an) * L0, ty + Math.sin(an) * L0 * 0.6, tx + Math.cos(an) * L1, ty + Math.sin(an) * L1 * 0.6, [EARTH[3], C[4], C[5]], 1, fade);
    }
    mist(g, tx, ty + 3, 4 + kk * 4, 2 + kk * 2, [DUST[1], DUST[2], DUST[3], C[4]], 0.9 * fade * (1 - kk), a.seed + j, a.t, 0.8);
    for (let i = 0; i < 7; i++) {
      const an = hash2(i, a.seed + j, 3) * TAU;
      const d = 2 + kk * 14 * (0.6 + 0.4 * hash2(i, a.seed + j, 4));
      const up = Math.sin(kk * Math.PI) * (4 + hash2(i, a.seed + j, 5) * 5);
      clod(g, tx + Math.cos(an) * d, ty + 2 + Math.sin(an) * d * 0.5 - up, EARTH, i === 0);
    }
  });
}

/**
 * Vast on a monster: its warning drawn wider. Where its blow would have reached, its old edge, a broken ring of the enemy's pink;
 * the band out from there to where it reaches now churned with pink dust rolling outward; gold grit along its new front, and barbs
 * on it pointing out, beating.
 */
function wideWarn(g: CanvasRenderingContext2D, cx: number, cy: number, r0: number, r: number, t: number, seed: number, fade: number, back: boolean): void {
  const E = W10_ENEMY;
  // its old reach: runs of bright pink, broken
  const n0 = Math.round(r0 * RX * 6.5);
  for (let i = 0; i < n0; i++) {
    const a = (i / n0) * TAU;
    if (Math.sin(a) < 0 !== back) continue;
    if (vnoise(i * 0.12, 1, seed) < 0.42) continue;
    const x = cx + Math.cos(a) * r0 * RX;
    const y = cy + Math.sin(a) * r0 * RY;
    if (!dith(x, y, fade, seed)) continue;
    dot(g, x, y, E[4]);
    dot(g, x, y + 1, E[2]);
  }
  // the band, churning outward
  const puffs = Math.max(12, Math.round(r * 11));
  for (let i = 0; i < puffs; i++) {
    const a = (i / puffs) * TAU + hash2(i, seed, 1) * 0.3;
    if (Math.sin(a) < 0 !== back) continue;
    const roll = (t * 0.9 + hash2(i, seed, 2)) % 1;
    const rr = r0 + (r - r0) * (0.2 + 0.7 * roll);
    mist(g, cx + Math.cos(a) * rr * RX, cy + Math.sin(a) * rr * RY - 1, 3 + (r - r0) * 9, 1.6 + (r - r0) * 3.5, ENEMY_DUST, 1.15 * fade * Math.sin(roll * Math.PI), seed + i, t, 0.25);
  }
  // streaks of it shoved outward across the band, from the old reach to the new
  const shoves = Math.max(12, Math.round(r * 10));
  for (let i = 0; i < shoves; i++) {
    const a = (i / shoves) * TAU + hash2(i, seed, 5) * 0.35;
    if (Math.sin(a) < 0 !== back) continue;
    const ph = (t * 1.6 + hash2(i, seed, 6)) % 1;
    const d0 = r0 + (r - r0) * ph * 0.8;
    const d1 = d0 + (r - r0) * 0.45;
    streak(g, cx + Math.cos(a) * d0 * RX, cy + Math.sin(a) * d0 * RY, cx + Math.cos(a) * d1 * RX, cy + Math.sin(a) * d1 * RY, [E[2], E[3], E[4], E[5]], 2, fade * Math.sin(ph * Math.PI) * 1.2);
  }
  // its front: gold grit; barbs pointing out, beating
  const n = Math.round(r * RX * 6.5);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    if (Math.sin(a) < 0 !== back) continue;
    const v = vnoise(i * 0.25, t * 2.5, seed + 3);
    if (v < 0.35) continue;
    const x = cx + Math.cos(a) * r * RX;
    const y = cy + Math.sin(a) * r * RY;
    if (!dith(x, y, fade, seed + 4)) continue;
    dot(g, x, y, v > 0.62 ? E[5] : E[4]);
  }
  const barbs = Math.max(8, Math.round(r * 6));
  const beat = 0.5 + 0.5 * Math.sin(t * 7);
  for (let i = 0; i < barbs; i++) {
    const a = (i / barbs) * TAU + 0.2;
    if (Math.sin(a) < 0 !== back) continue;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    // (a barb is a chevron on the floor, its point out: its arms lie along the ring's slant)
    const tipx = cx + ux * (r * RX + 3 + beat * 2);
    const tipy = cy + uy * (r * RY + 1.5 + beat);
    for (const side of [-1, 1]) {
      const bx = tipx - ux * 5 - uy * side * 4;
      const by = tipy - uy * 2.5 + ux * side * 2;
      streak(g, bx, by, tipx, tipy, [E[2], E[3], E[4], E[5]], 2, fade);
    }
    dot(g, tipx, tipy, E[5]);
    dot(g, tipx - ux, tipy - uy * 0.5, E[5]);
  }
}

// =============================================================================================
// The hooks the renderer calls (all only while WORDS10_LOOK.on).

type ZoneLike = { x: number; y: number; r: number; t: number; dur: number; kind: string; hostile?: boolean; skill?: number; words?: readonly string[] };
const zoneSeed = (z: { x: number; y: number }): number => Math.floor(Math.abs(z.x * 97 + z.y * 131)) % 100000;

/** What Lasting or Fleeting holds of his: each thing an ability made, by its `skill`, and what of it to draw. */
function heldThings(game: Game): { word: 'lasting' | 'fleeting'; kind: 'thing' | 'patch' | 'spin'; x: number; y: number; up: number; rad: number; r: number; t: number; life: number; last: number; seed: number }[] {
  const out: ReturnType<typeof heldThings> = [];
  const G = game as unknown as { orbs?: { id: number; x: number; y: number; t: number; life: number; skill: number }[]; familiars?: { id: number; x: number; y: number; t: number; life: number; skill: number }[]; contraptions?: { id: number; x: number; y: number; t: number; skill: number }[] };
  for (const o of G.orbs ?? []) {
    const w = timeWord(game, o.skill);
    if (w) out.push({ word: w, kind: 'thing', x: o.x, y: o.y, up: 13, rad: 6, r: 0, t: o.t, life: o.life, last: lastOf(game, o.skill), seed: o.id * 13 + 1 });
  }
  for (const q of G.familiars ?? []) {
    const w = timeWord(game, q.skill);
    if (w) out.push({ word: w, kind: 'thing', x: q.x, y: q.y, up: 14, rad: 3, r: 0, t: q.t, life: q.life, last: lastOf(game, q.skill), seed: q.id * 13 + 2 });
  }
  for (const c of G.contraptions ?? []) {
    const w = timeWord(game, c.skill);
    if (w) out.push({ word: w, kind: 'thing', x: c.x, y: c.y, up: 6, rad: 5, r: 0, t: c.t, life: 99, last: lastOf(game, c.skill), seed: c.id * 13 + 3 });
  }
  for (const raw of game.zones) {
    const z = raw as unknown as ZoneLike;
    if (z.hostile || z.skill === undefined || z.skill < 0 || z.kind === 'warn' || z.kind === 'mirror' || z.kind === 'reaper') continue;
    const w = timeWord(game, z.skill);
    if (w) out.push({ word: w, kind: 'patch', x: z.x, y: z.y, up: 0, rad: 0, r: z.r, t: z.t, life: z.dur, last: lastOf(game, z.skill), seed: zoneSeed(z) });
  }
  const ch = game.hero.channel;
  const s = ch ? game.hero.skills[ch.skill] : null;
  if (ch && s && SKILLS[s.id].kind === 'whirl') {
    const w = timeWord(game, ch.skill);
    const def = SKILLS[s.id];
    if (w) out.push({ word: w, kind: 'spin', x: game.hero.x, y: game.hero.y, up: 10, rad: 0, r: def.radius * ((s.r as { size?: number }).size ?? 1), t: ch.t, life: (def.channel ?? 2.4) * lastOf(game, ch.skill), last: lastOf(game, ch.skill), seed: 77 });
  }
  return out;
}

/** The boosts on him that an ability with Lasting or Fleeting gave him (the rules' might, haste, frenzy's hold, shield). */
function boosts(game: Game): { word: 'lasting' | 'fleeting'; left: number } | null {
  const h = game.hero;
  let best: { word: 'lasting' | 'fleeting'; left: number } | null = null;
  h.skills.forEach((s, i) => {
    const w = timeWord(game, i);
    if (!w || !s) return;
    const r = s.r as unknown as { might?: number; haste?: number; frenzy?: boolean; shield?: number };
    const left = Math.max(r.might ? h.mightT : 0, r.haste ? h.hasteT : 0, r.frenzy ? h.frenzyT : 0, r.shield ? h.shieldT : 0);
    if (left > 0 && (!best || left > best.left)) best = { word: w, left };
  });
  return best;
}

/** A monster carrying `w` near him (his poison, burning or chill from it): the rules do not say whose; the nearest does. */
function nearCarrier(game: Game, w: WordId): Monster | undefined {
  const h = game.hero;
  let best: Monster | undefined;
  let bd = 4.5;
  for (const m of game.monsters) {
    if (m.dead || !((m.words ?? []) as readonly string[]).includes(w)) continue;
    const d = Math.hypot(m.x - h.x, m.y - h.y);
    if (d < bd) {
      bd = d;
      best = m;
    }
  }
  return best;
}

function drawHeld(g: CanvasRenderingContext2D, cam: Cam, game: Game, layer: 'floor' | 'air', here: (x: number, y: number) => boolean): void {
  const t = W10.clock;
  const clock = W10.fx ? (W10.fx as unknown as { clock: number }).clock : t;
  for (const it of heldThings(game)) {
    if (!here(it.x, it.y)) continue;
    const [sx, sy] = S(cam, it.x, it.y);
    const p = it.word === 'lasting' ? lastStretch(it.t, it.life, it.last) : 0;
    const fade = clamp01((it.life - it.t) / 0.35) * clamp01(it.t / 0.2);
    if (it.kind === 'thing') {
      if (layer !== 'air') continue;
      if (it.word === 'lasting') lastingThing(g, sx, sy, it.up, it.rad, t, it.seed, p, fade);
      // (Fleeting: its after-images are its own picture, thingW10; the streaks whipping round it here)
      else whips(g, sx, sy - it.up, it.rad + 6, it.rad + 3, t, it.seed, 5, fade);
    } else if (it.kind === 'patch') {
      // (Lasting's lies on the floor under the figures; Fleeting's tongues stand round its edge, behind them and before)
      if (it.word === 'lasting') {
        if (layer === 'floor') lastingPatch(g, sx, sy, it.r, t, it.seed, p, fade);
      } else fleetingPatch(g, sx, sy, it.r, t, it.seed, fade, layer);
    } else if (it.kind === 'spin') {
      if (it.word === 'lasting') lastingSpin(g, cam, it.x, it.y, it.r, t, clock, it.seed, p, layer);
      else if (layer === 'air') fleetingSpin(g, cam, it.x, it.y, it.r, t, clock, it.seed);
    }
  }
}

/** Lasting's patches are drawn once, on the floor (render.ts floorW10); the rest of each look where it lies or flies. */
function drawStates(g: CanvasRenderingContext2D, cam: Cam, game: Game, layer: 'floor' | 'air'): void {
  const t = W10.clock;
  const h = game.hero;
  const [hx, hy] = S(cam, h.x, h.y);
  // his boost, drawn out behind him (Lasting), or quickened on him (Fleeting: its after-images are heroW10's)
  const b = boosts(game);
  if (b && layer === 'air') {
    if (b.word === 'lasting') ribbon(g, ribbonPts(cam, game), t, 31, clamp01(b.left / 0.4));
    else whips(g, hx, hy - 12, 11, 14, t, 43, 4, clamp01(b.left / 0.3));
  }
  // what he left on monsters, Lasting or Fleeting by the ability that last struck each
  for (const m of game.monsters) {
    if (m.dead || layer !== 'air') continue;
    const left = Math.max(m.poisonT ?? 0, m.burnT ?? 0);
    if (left <= 0) continue;
    const w = timeWord(game, (m as { lastSkill?: number }).lastSkill ?? -1);
    if (!w) continue;
    const [mx, my] = S(cam, m.x, m.y);
    if (w === 'lasting') lastingOnIt(g, mx, my, topOf(m), t, m.id * 7 + 1, clamp01(1 - left / (TUNE.poisonTime * (1 + LASTING.longer))));
    else ticks(g, mx, my - 3, 12, topOf(m) - 6, t, m.id * 7 + 2, 4, W10_RAMP.fleeting);
  }
  // a monster's poison, burning or chill on him: lingering (Lasting) or ticking fast (Fleeting), in the enemy's colours
  if (layer === 'air' && ((h.poisonT ?? 0) > 0 || (h.burnT ?? 0) > 0 || (h.chillT ?? 0) > 0)) {
    const left = Math.max(h.poisonT ?? 0, h.burnT ?? 0, h.chillT ?? 0);
    if (nearCarrier(game, 'lasting')) lastingOnIt(g, hx, hy, HERO_TOP, t, 51, clamp01(1 - left / (TUNE.poisonTime * (1 + LASTING.monster))), W10_ENEMY);
    else if (nearCarrier(game, 'fleeting')) ticks(g, hx, hy - 3, 13, HERO_TOP - 6, t, 53, 5, W10_ENEMY);
  }
  // a monster's warning drawn wider (Vast on it)
  for (const raw of game.zones) {
    const z = raw as unknown as ZoneLike & { half?: { words?: readonly string[] } };
    if (z.kind !== 'warn' || !(z.words ?? []).includes('vast')) continue;
    const share = (z.half?.words ?? []).includes('vast') ? 0.5 : 1;
    const [cx, cy] = S(cam, z.x, z.y);
    const fade = clamp01(z.t / 0.15) * clamp01((z.dur - z.t) / 0.1);
    wideWarn(g, cx, cy, z.r / (1 + VAST.monster * share), z.r, t + z.t, zoneSeed(z), fade, layer === 'floor');
  }
}

/** His back, and his path behind it (screen), for the ribbon: as he has walked it, or hanging back from him where he stands. */
function ribbonPts(cam: Cam, game: Game): [number, number][] {
  const h = game.hero;
  const out: [number, number][] = [S(cam, h.x, h.y, 13)];
  if (W10.laidTrail) {
    for (const p of W10.laidTrail) out.push(S(cam, p.x, p.y, 13 - (out.length - 1) * 0.6));
    return out;
  }
  let len = 0;
  for (let i = W10.trail.length - 1; i >= 0 && W10.clock - W10.trail[i].at < W10_TIME.ribbon; i--) {
    const p = W10.trail[i];
    const sp = S(cam, p.x, p.y, 13);
    const last = out[out.length - 1];
    len += Math.hypot(sp[0] - last[0], sp[1] - last[1]);
    if (Math.hypot(sp[0] - last[0], sp[1] - last[1]) >= 2) out.push(sp);
  }
  // (where he has stood still, it hangs back from him the way he faces, sagging)
  if (len < 30) {
    const [bx, by] = out[out.length - 1];
    const back = h.fx - h.fy >= 0 ? -1 : 1;
    for (let i = 1; i <= 8; i++) out.push([bx + back * i * 4, by + i * 1.4 + i * i * 0.08]);
  }
  return out;
}

/** Under the figures (render.ts, with the floor's patches). */
export function floorW10(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, here: (x: number, y: number) => boolean): void {
  if (!WORDS10_LOOK.on) return;
  drawHeld(g, cam, game, 'floor', here);
  drawStates(g, cam, game, 'floor');
  for (const a of W10.acts) if (here(a.x, a.y)) drawAct(g, cam, a, 'floor');
  void t;
}

/** Over the figures (drawn after the dark, so it glows). */
export function airW10(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game): void {
  if (!WORDS10_LOOK.on) return;
  drawHeld(g, cam, game, 'air', () => true);
  drawStates(g, cam, game, 'air');
  for (const a of W10.acts) drawAct(g, cam, a, 'air');
  void t;
}

function drawAct(g: CanvasRenderingContext2D, cam: Cam, a: Act10, layer: 'floor' | 'air'): void {
  if (a.kind === 'splash') return splash(g, cam, a, layer);
  const [cx, cy] = S(cam, a.x, a.y);
  const k = clamp01(a.t / W10_TIME.ring);
  const fade = clamp01((a.dur - a.t) / W10_TIME.ringFade);
  dustRing(g, cx, cy, a.r0, a.r, k, fade, a.seed, a.t, layer === 'floor', a.z);
}

/** Light: the renderer's `spot` (screen x, y, radius, strength). */
export function lightsW10(spot: (x: number, y: number, r: number, a: number) => void, cam: Cam, game: Game, t: number): void {
  if (!WORDS10_LOOK.on) return;
  for (const it of heldThings(game)) {
    const [sx, sy] = S(cam, it.x, it.y, it.up);
    spot(sx, sy, it.kind === 'patch' ? 18 + it.r * 16 : it.kind === 'spin' ? 44 : 20, it.word === 'lasting' ? 0.4 : 0.5);
  }
  const b = boosts(game);
  if (b) {
    const [hx, hy] = S(cam, game.hero.x, game.hero.y, 12);
    spot(hx, hy, 26, 0.45);
  }
  // (its moments: the dust of a ring or a splash lit as it goes)
  for (const a of W10.acts) {
    const [ax, ay] = S(cam, a.x, a.y);
    const fade = clamp01((a.dur - a.t) / 0.4);
    spot(ax, ay - 4, 24 + a.r * 22, 0.55 * fade);
  }
  void t;
}

/**
 * The hero as drawn (render.ts, with his picture and where it stands): kept for his after-images; and what stands with him:
 * while Fleeting's boost is on him, a stutter of after-images of him in its lilac, where he was a moment ago (or, standing,
 * a step back from him), thinner each.
 */
export function heroW10(sp: Sprite, h: { x: number; y: number; fx: number; fy: number }, cam: Cam, game?: Game): { sp: Sprite; x: number; y: number; depth: number; alpha: number }[] {
  if (!WORDS10_LOOK.on) return [];
  const sx = wx(cam, h.x, h.y);
  const sy = wy(cam, h.x, h.y);
  W10.seen.push({ sp, x: h.x, y: h.y, at: W10.clock });
  while (W10.seen.length > 12) W10.seen.shift();
  const b = game ? boosts(game) : null;
  const ch = game?.hero.channel;
  const spin = !!game && !!ch && SKILLS[game.hero.skills[ch.skill]?.id]?.kind === 'whirl' && timeWord(game, ch.skill) === 'fleeting';
  const out: { sp: Sprite; x: number; y: number; depth: number; alpha: number }[] = [];
  const C = W10_RAMP.fleeting;
  if (spin) {
    // (his spin quickened: a stutter of him round where he turns, each a turn of the blade behind)
    const clock = W10.fx ? (W10.fx as unknown as { clock: number }).clock : W10.clock;
    for (let e = 1; e <= 2; e++) {
      const a = clock * TAU * 2.6 - e * 1.1;
      out.push({ sp: tinted(sp, e === 1 ? C[2] : C[1]), x: Math.round(sx + Math.cos(a) * 5), y: Math.round(sy + Math.sin(a) * 2.5), depth: h.x + h.y - 0.01 * e, alpha: 0.62 - e * 0.16 });
    }
    return out;
  }
  if (!b || b.word !== 'fleeting') return out;
  for (let e = 1; e <= 3; e++) {
    const was = [...W10.seen].reverse().find((q) => W10.clock - q.at >= e * W10_TIME.stutter - 1e-6);
    let x = was ? wx(cam, was.x, was.y) : sx;
    let y = was ? wy(cam, was.x, was.y) : sy;
    if (Math.hypot(x - sx, y - sy) < e * 2) {
      // (standing: a step back from him, the way he faces, each further)
      const back = h.fx - h.fy >= 0 ? -1 : 1;
      x = sx + back * e * 5;
      y = sy + e * 0.5;
    }
    out.push({ sp: tinted(was ? was.sp : sp, e === 1 ? C[2] : C[1]), x: Math.round(x), y: Math.round(y), depth: h.x + h.y - 0.01 * e, alpha: clamp01(b.left / 0.3) * (0.9 - e * 0.2) });
  }
  return out;
}

/**
 * A thing an ability made, as the renderer draws it (render.ts, the orb: its picture and where): while Fleeting is on its
 * ability, a stutter of after-images of it in its lilac, jumping to either side of it from one picture to the next, thinner each.
 */
export function thingW10(game: Game, skill: number, id: number, sp: Sprite, x: number, y: number): { sp: Sprite; x: number; y: number; alpha: number }[] {
  if (!WORDS10_LOOK.on || timeWord(game, skill) !== 'fleeting') return [];
  const C = W10_RAMP.fleeting;
  const beat = Math.floor((W10.fx ? (W10.fx as unknown as { clock: number }).clock : W10.clock) * 30);
  const out: { sp: Sprite; x: number; y: number; alpha: number }[] = [];
  for (let e = 1; e <= 2; e++) {
    const side = (beat + e + id) % 2 === 0 ? 1 : -1;
    out.push({ sp: tinted(sp, e === 1 ? C[2] : C[1]), x: Math.round(x + side * (2 + e * 2)), y: Math.round(y + (e === 1 ? 1 : -1)), alpha: e === 1 ? 0.6 : 0.4 });
  }
  return out;
}

// =============================================================================================
// The clock.

let joinedLevel: unknown = null;

export function tickW10(dt: number, game: Game, fx: Fx): void {
  if (!WORDS10_LOOK.on) return;
  if (game.level !== joinedLevel) {
    joinedLevel = game.level;
    clearW10();
  }
  W10.fx = fx;
  W10.clock += dt;
  for (let i = W10.acts.length - 1; i >= 0; i--) {
    const a = W10.acts[i];
    a.t += dt;
    if (a.t >= a.dur) W10.acts.splice(i, 1);
  }
  const h = game.hero;
  const last = W10.trail[W10.trail.length - 1];
  if (!last || Math.hypot(h.x - last.x, h.y - last.y) > 0.04) W10.trail.push({ x: h.x, y: h.y, at: W10.clock });
  while (W10.trail.length && W10.clock - W10.trail[0].at > W10_TIME.ribbon + 0.5) W10.trail.shift();
}

// =============================================================================================
// What the rules said happened (main.ts, while WORDS10_LOOK.on). Everything is read gently: a field missing has a fallback,
// and an event of another shape is passed over.

type Seen = { t: string; x?: number; y?: number; r?: number; style?: string; words?: readonly string[]; kind?: string; ids?: number[] };

export function eventsW10(events: readonly unknown[], game: Game, fx: Fx): void {
  if (!WORDS10_LOOK.on) return;
  const h = game.hero;
  for (const raw of events) {
    const e = raw as Seen;
    if (e.t === 'burst' && e.x !== undefined && e.y !== undefined) {
      // VAST behind: the rules' splash (a 'shock' burst its reach wide, his own); or the splash by its own name, if sent
      if (e.style === 'shock' && Math.abs((e.r ?? 0) - VAST.splashR) < 1e-6 && !(e.words ?? []).length) {
        playSplash(game, e.x, e.y, e.r ?? VAST.splashR);
        continue;
      }
      // VAST in front: an area of his landing wider, its dust rolled out to its new edge
      if ((e.words ?? []).includes('vast') && (e.r ?? 0) > 0.3) {
        const whirl = e.style === 'whirl';
        playW10('vast', 'ring', { x: e.x, y: e.y, r: e.r, r0: (e.r ?? 1) / (1 + VAST.wider), z: whirl ? 0 : 0, dur: W10_TIME.ring + W10_TIME.ringFade });
      }
    } else if (e.t === 'vastSplash' && e.x !== undefined && e.y !== undefined) {
      playSplash(game, e.x, e.y, e.r ?? VAST.splashR, e.ids);
    } else if (e.t === 'zone' && e.x !== undefined && e.y !== undefined) {
      // a patch of his laid wider by Vast in front: its dust rolled out to its edge as it is laid
      const z = game.zones.find((q) => !q.hostile && Math.abs(q.x - (e.x ?? 0)) < 1e-6 && Math.abs(q.y - (e.y ?? 0)) < 1e-6);
      if (z && z.skill >= 0 && fronts(game, z.skill).includes('vast')) playW10('vast', 'ring', { x: z.x, y: z.y, r: z.r, r0: z.r / (1 + VAST.wider), dur: W10_TIME.ring + W10_TIME.ringFade });
    }
  }
  void h;
  void fx;
}

function playSplash(game: Game, x: number, y: number, r: number, ids?: number[]): Act10 {
  const to = game.monsters
    .filter((m) => !m.dead && (ids ? ids.includes(m.id) : Math.hypot(m.x - x, m.y - y) > 0.3 && Math.hypot(m.x - x, m.y - y) <= r + m.r))
    .map((m) => ({ x: m.x, y: m.y, top: topOf(m) }));
  return playW10('vast', 'splash', { x, y, r, to, dur: W10_TIME.splash + 0.45 + W10_TIME.splashFade });
}

/** The playtest's hands: `window.__dbg.words10` (main.ts). Nothing here runs unless a playtest calls it. */
export function demoW10(fx: Fx, getGame: () => Game | null) {
  const G = (): Game => {
    const g = getGame();
    if (!g) throw new Error('no game');
    return g;
  };
  return {
    switch: WORDS10_LOOK,
    state: W10,
    words: W10_WORDS,
    ramp: W10_RAMP,
    clear: () => {
      clearW10();
      joinedLevel = getGame()?.level ?? null;
    },
    /** A word's rune stone as a picture (for the sheet): its PNG, as a data URL. */
    runePng: (word: W10Word): string => w10Rune(word).img.toDataURL('image/png'),
    /** A moment begins: a ring of dust ('ring') or a splash ('splash': those near found as the rules would). */
    play: (word: W10Word, kind: Act10['kind'], o: W10Options): number => (kind === 'splash' ? playSplash(G(), o.x ?? 0, o.y ?? 0, o.r ?? VAST.splashR) : playW10(word, kind, o)).id,
    /** What the rules say happened: their events, as they are sent. */
    send: (...events: unknown[]) => eventsW10(events, G(), fx),
    /** His path laid by hand (world, from him back), for the ribbon in a still; null: as he walked it. */
    trail: (pts: { x: number; y: number }[] | null) => {
      W10.laidTrail = pts;
    },
    /** The looks' clock set (a still of one moment): every moment's own clock to `secs`, and the clock the held looks run on. */
    at: (secs: number, clock?: number) => {
      for (const a of W10.acts) a.t = secs;
      if (clock !== undefined) W10.clock = clock;
      tickW10(0, G(), fx);
    },
  };
}
