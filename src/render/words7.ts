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
import type { Cam, Fallen, Fx } from './fx';
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
  /** Piercing: its shot's speed (tiles a second); the lance's wait (the rules' half a second, the event's `delay`) and its fall. */
  pierceSpeed: 26,
  lanceWait: 0.5,
  lanceFall: 0.06,
  /** ...and its point driven along the line, tearing the floor; the crack glowing, then gone. */
  lanceRun: 0.16,
  crack: 1.9,
  /** A monster's shot through a wall (tiles a second). */
  ghostSpeed: 11,
  /** Bleeding: the thorns burst up over this, and sink back over the last of their time; a splash of blood dries in this. */
  thornsGrow: 0.22,
  thornsSink: 0.5,
  splash: 3,
  /** Reaping: the soul's flight; the spirit's life (the rules' 6 s), its rising and its going; a body's rising. */
  soulFlight: 0.55,
  spirit: 6,
  spiritBuild: 0.45,
  spiritFade: 0.6,
  rise: 0.8,
  /** Culling: the slash sweeps through in this (two pictures at 30 a second); the hero is low under this much of his life. */
  cullSweep: 0.06,
  low: 0.35,
  /** Surging: a shockwave's run out; a monster's warning ring before its wave. */
  surge: 0.42,
  warn: 1.0,
  /** Plundering: coins in the air; the stream into his purse. */
  coins: 0.7,
  purse: 0.45,
  /** Mirroring: shards flung back; his reflection's time; a pane growing; its repeat, its cracking and its shattering. */
  shards: 0.28,
  reflection: 0.63,
  pane: 0.25,
  cast: 0.38,
  breaking: 0.3,
  shatter: 0.6,
};

/**
 * EACH LOOK'S BEATS (seconds): its quick build, its hit (Movement 9: a held wind-up where there is one, the strike itself
 * smeared in a frame or two), and its fade. `life`, when it is not their sum, is said; what lies on (a zone, a state) holds
 * between its build and its fade for as long as the rules keep it.
 */
export const W7_BEATS: Record<string, { build: number; hit: number; fade: number; is: string }> = {
  'piercing:front': { build: 0.03, hit: 0.2, fade: 0.35, is: 'the bolt kindles at his hand; flies the line at 26 tiles a second, light blowing out of each it goes through; its trail and sparks die' },
  'piercing:behind': { build: 0.5, hit: 0.22, fade: 1.9, is: "the line scratched in light, quickening, the spear gathering high over it (the rules' delay); it slams down (0.06) and tears along the line (0.16); the crack glows, cools and is gone" },
  'piercing:monster': { build: 0.1, hit: 0.15, fade: 0.45, is: 'the stone lit pink where its shot comes through; rings of light running out over it; gone' },
  'piercing:monster:pass': { build: 0.1, hit: 0.15, fade: 0.45, is: 'the same, where a shot of the game\'s goes into a wall or comes out of one' },
  'bleeding:front': { build: 0.05, hit: 0.5, fade: 0.15, is: 'the wound opens; the spurt; then drips while it bleeds, a splash where it walks (twice as many walking), each drying in 3 s' },
  'bleeding:behind': { build: 0.22, hit: 0, fade: 0.5, is: 'the briars burst up out of the floor; they stand, swaying, cutting what walks in them; they sink back' },
  'bleeding:monster': { build: 0.05, hit: 0.3, fade: 0.3, is: 'the slash across him; his blood flung off; then drips while he bleeds' },
  'reaping:front': { build: 0.15, hit: 0.55, fade: 0.25, is: 'the soul torn out of the body; it streaks to him; a flare of soul-light as he takes it in' },
  'reaping:behind': { build: 0.45, hit: 0, fade: 0.6, is: "the spirit rises out of the body; fights for him (the rules' 6 s), its edge his cyan; rises away and is gone" },
  'reaping:behind:hit': { build: 0.05, hit: 0.06, fade: 0.24, is: "the spirit's blow: a slash of soul-light" },
  'reaping:monster': { build: 0.2, hit: 0.8, fade: 0.4, is: "the enemy's fire kindles round the body; it lurches up out of its fall; the fire dies" },
  'culling:front': { build: 0.03, hit: 0.06, fade: 0.32, is: 'the blade comes round; the slash sweeps through in two pictures and it is split; the slash fades as it falls' },
  'culling:behind': { build: 0.3, hit: 0, fade: 0, is: 'the mark written on the floor, breathing, for as long as it lies' },
  'culling:behind:mark': { build: 0.05, hit: 0.2, fade: 0.4, is: 'the mark flares; a blade rises out of it through the one it takes; the mark burns out' },
  'culling:monster': { build: 0.3, hit: 0.05, fade: 0.3, is: "while he is low it kindles with the enemy's fire; its blow on him bursts; the fire dies when he is not low" },
  'culling:monster:blow': { build: 0.05, hit: 0.05, fade: 0.25, is: 'its blow while he is low: a heavy smear of fire, bursting on him' },
  'surging:front': { build: 0.05, hit: 0.42, fade: 0.13, is: 'a flash at his feet; the ring of force runs out, the dust shoved before it; it thins away' },
  'surging:behind': { build: 0.05, hit: 0.42, fade: 0.13, is: 'the same where his dodge left the floor, wind streaming along his roll (0.55)' },
  'surging:monster': { build: 1.0, hit: 0.42, fade: 0.13, is: "its warning ring, held, beating faster (the game's own, or ours: surgeWarn); then its wave" },
  'surging:monster:warn': { build: 0.15, hit: 0, fade: 0.15, is: "its warning ring burned in, held for the rules' `secs`, beating faster, the floor in it smouldering; gone as the wave goes" },
  'surging:monster:wave': { build: 0.05, hit: 0.42, fade: 0.13, is: "its shockwave, in the enemy's colours, the dust shoved before it" },
  'plundering:front': { build: 0.05, hit: 0.5, fade: 2.0, is: 'a burst of glints; coins spray up, spinning, the extra piece thrown higher; they lie and fade' },
  'plundering:behind': { build: 0.1, hit: 0.89, fade: 0.12, is: 'gold bursts from the kill; coin after coin arcs into his purse; a glint as each goes in' },
  'plundering:monster': { build: 0.04, hit: 0.58, fade: 0.15, is: 'its blow lands; his coins torn off on hooks of pink light and pulled to it; they glint at its belt till it dies' },
  'plundering:monster:drop': { build: 0.05, hit: 0.5, fade: 1.5, is: 'it dies: his coins burst out of it and scatter' },
  'mirroring:front': { build: 0.08, hit: 0.3, fade: 0.25, is: 'his reflection forms beside him; swings with him; dissolves' },
  'mirroring:behind': { build: 0.25, hit: 0, fade: 0, is: 'the pane grows up out of its glass where he stood and stands, shimmering' },
  'mirroring:behind:cast': { build: 0.05, hit: 0.33, fade: 0.9, is: 'in it he makes his attack again; it cracks (0.3) and shatters (0.6)' },
  'mirroring:monster': { build: 0.04, hit: 0.28, fade: 0.15, is: 'it cracks like a mirror where he hit it; shards of pink glass fly back into him' },
};

// =============================================================================================
// What is going on.

/** One look at work: a word's side (and a part of it), its own clock, where it is (world), whom it is about. */
export interface Act {
  id: number;
  word: W7Word;
  side: W7Side;
  /** A part of a side ('' its main look; 'hit', 'mark', 'warn', 'blow', 'drop', 'cast', 'pass'). */
  part: string;
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
  /** How far along a line each of `ids` stands (tiles), or a moment (seconds) the look keeps. */
  pts: number[];
  r: number;
  /** The lance's wait (seconds) and its width (tiles). */
  delay: number;
  width: number;
  /** Reaping on a monster: how far into its fall the corpse lay (seconds), and the corpse itself while it rises. */
  dieT: number;
  fall: Fallen | null;
}

/** A splash of blood on the floor, drying. */
interface Splash {
  x: number;
  y: number;
  age: number;
  size: number;
  seed: number;
  ex: number;
  ey: number;
  hero: boolean;
}

export const W7 = {
  clock: 0,
  acts: [] as Act[],
  next: 1,
  /** The hero's picture as last drawn, and where (for the mirror that repeats his attack). */
  heroSp: null as Sprite | null,
  /** Blood where the bleeding have walked; who bleeds (where it last dripped, and when). */
  splashes: [] as Splash[],
  bleeders: new Map<number, { x: number; y: number; since: number }>(),
  /** Those whose stolen gold has burst out of them already. */
  dropped: new Set<number>(),
  /** Each shot in flight, and whether it was last in a wall. */
  inWall: new WeakMap<object, boolean>(),
  /** The kindling of the enemy's fire on monsters with Culling while he is low (0..1 each). */
  hot: new Map<number, number>(),
};

export function clearW7(): void {
  W7.acts.length = 0;
  W7.heroSp = null;
  W7.splashes.length = 0;
  W7.bleeders.clear();
  W7.dropped.clear();
  W7.hot.clear();
}

export type W7Options = Partial<Omit<Act, 'id' | 'word' | 'side' | 'seed'>> & { seed?: number };

/** A look begins. */
export function playW7(word: W7Word, side: W7Side, o: W7Options): Act {
  const a: Act = {
    id: W7.next++,
    word,
    side,
    part: o.part ?? '',
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
    delay: o.delay ?? W7_TIME.lanceWait,
    width: o.width ?? 1,
    dieT: o.dieT ?? 0,
    fall: o.fall ?? null,
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

/** In front: a bolt of white light punching through every one in a line; at each it goes through, light blows out the far side with sparks. */
function pierceFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.piercing;
  const z = 14;
  const head = a.t * W7_TIME.pierceSpeed;
  const reach = a.r;
  const at = (s: number): [number, number] => S(cam, a.x + a.dx * s, a.y + a.dy * s, z);
  const h = Math.min(head, reach);
  const fade = head > reach ? clamp01(1 - (head - reach) / 4) : 1;
  const [hx, hy] = at(h);
  const [qx, qy] = at(h - 1);
  const ul = Math.hypot(hx - qx, hy - qy) || 1;
  const ux = (hx - qx) / ul;
  const uy = (hy - qy) / ul;
  const nx = -uy;
  const ny = ux;
  if (fade > 0) {
    // its body: drawn out behind its head and thinning to nothing, its edges flickering, a waver in its trail
    const L = Math.round(Math.min(h, 2.6) * ul);
    for (let i = 0; i <= L; i++) {
      const q = i / Math.max(1, L);
      const back = L - i;
      const wob = Math.sin(i * 0.33 + a.t * 45) * 1.8 * (1 - q) ** 1.3 + (vnoise(i * 0.4, a.t * 30, a.seed) - 0.5) * 2.2 * (1 - q);
      const cx = hx - ux * back + nx * wob;
      const cy = hy - uy * back + ny * wob;
      if (q < 0.45 && !dith(cx, cy, (q / 0.45) * fade + 0.05)) continue;
      const half = 0.3 + 2.3 * q ** 1.6 * (0.75 + 0.5 * vnoise(i * 0.6, a.t * 40, a.seed + 1));
      const reachK = Math.ceil(half) + 1;
      for (let k = -reachK; k <= reachK; k++) {
        const d = Math.abs(k) / half;
        if (d > 1) {
          // flickering at its edges: a pixel of light licking off it now and then
          if (d < 1.9 && hash2(i * 7 + k, Math.floor(a.t * 60), a.seed) < 0.14 * q) dot(g, cx + nx * k, cy + ny * k, C[3]);
          continue;
        }
        const v = q * 0.75 + (1 - d) * 0.55;
        dot(g, cx + nx * k, cy + ny * k, [C[1], C[2], C[3], C[4], C[5], C[5]][Math.min(5, Math.floor(v * 5))]);
      }
    }
    if (head <= reach) {
      // its head: a blazing teardrop of white, rimmed with light, flickering tongues of it ahead
      const prof = [1.2, 1.9, 2.4, 2.6, 2.5, 2.1, 1.6, 1, 0.5];
      prof.forEach((w, j) => {
        const along = j - 5;
        for (let k = -Math.ceil(w); k <= Math.ceil(w); k++) {
          const d = Math.abs(k) / w;
          if (d > 1.05) continue;
          dot(g, hx + ux * along + nx * k, hy + uy * along + ny * k, d < 0.55 ? C[5] : d < 0.9 ? C[4] : C[3]);
        }
      });
      for (let j = 0; j < 3; j++) {
        const sp = (j - 1) * 0.45 + (hash2(j, Math.floor(a.t * 60), a.seed) - 0.5) * 0.3;
        const len = 2 + hash2(j, Math.floor(a.t * 60) + 1, a.seed) * 3;
        const ex = ux * Math.cos(sp) - uy * Math.sin(sp);
        const ey = uy * Math.cos(sp) + ux * Math.sin(sp);
        streak(g, hx + ex * (4 + len), hy + ey * (4 + len), hx + ex * 3, hy + ey * 3, [C[3], C[4], C[5]], 1);
      }
    }
  }
  // each one it went through
  a.ids.forEach((id, i) => {
    const s = a.pts[i] ?? 0;
    const since = (head - s) / W7_TIME.pierceSpeed;
    if (since < 0 || since > 0.5) return;
    const m = game.monsters.find((q) => q.id === id);
    if (!m) return;
    // where it went in: a flare for an instant
    if (since < 0.08) {
      const [ix, iy] = at(s - 0.28);
      dot(g, ix - 1, iy - 1, C[4], 3, 3);
      dot(g, ix, iy, C[5]);
    }
    // out of the far side: light blown out in a fan of rays, ragged, fading as they lengthen
    const [ex, ey] = at(s + 0.3);
    if (since < 0.32) {
      const k = since / 0.32;
      const grow = Math.min(1, since / 0.05);
      for (let j = 0; j < 9; j++) {
        const sp = (j / 8 - 0.5) * 2.3 + (hash2(j, a.seed + i, 4) - 0.5) * 0.3;
        const ddx = ux * Math.cos(sp) - uy * Math.sin(sp);
        const ddy = uy * Math.cos(sp) + ux * Math.sin(sp);
        const len = (8 + hash2(j, a.seed + i, 5) * 13) * (1 - Math.abs(sp) * 0.3) * grow * (1 - k * 0.4);
        const from = 2 + k * 7;
        if (len > from + 1) streak(g, ex + ddx * len, ey + ddy * len * 0.8, ex + ddx * from, ey + ddy * from * 0.8, [C[1], C[2], C[3], C[4], C[5]], j % 2 === 0 ? 2 : 1, 0, 1 - k * 0.7);
      }
      if (since < 0.14) {
        // the puncture itself: a blaze of white where it tears out, rimmed with steel
        for (let yy = -4; yy <= 4; yy++) {
          for (let xx = -4; xx <= 4; xx++) {
            const d = Math.abs(xx) * 0.8 + Math.abs(yy) + (hash2(xx + 9, yy + 9, a.seed + i) - 0.5) * 1.2;
            if (d > 4.2) continue;
            dot(g, ex + xx, ey + yy, d < 1.8 ? C[5] : d < 3 ? C[4] : C[3]);
          }
        }
      }
    }
    // sparks flung on out of it, arcing down, each leaving its streak
    for (let j = 0; j < 12; j++) {
      const sp = (hash2(j, a.seed + i, 1) - 0.5) * 2.2;
      const v = 70 + hash2(j, a.seed + i, 2) * 100;
      const vx = (ux * Math.cos(sp) - uy * Math.sin(sp)) * v;
      const vy = (uy * Math.cos(sp) + ux * Math.sin(sp)) * v * 0.7 - 30 * hash2(j, a.seed + i, 3);
      const px = ex + vx * since;
      const py = ey + vy * since + 160 * since * since;
      const tx = px - vx * 0.03;
      const ty = py - (vy + 320 * since) * 0.03;
      if (py > ey + 16) continue;
      streak(g, tx, ty, px, py, [C[2], C[3], C[4], C[5]], 1, 0, clamp01(1.2 - since / 0.5));
    }
  });
}

/**
 * Behind: half a second after, a spear of light comes slamming down out of the air at a slant onto the line,
 * and its point is driven along it, tearing a narrow crack of light in the floor, chips and dust flung up
 * where it goes; it is gone, and the crack is left glowing, fading.
 */
function pierceBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.piercing;
  const [x0, y0] = S(cam, a.x, a.y);
  const [x1, y1] = S(cam, a.x1, a.y1);
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const n = Math.round(len);
  const strike = a.t - a.delay;
  const fall = W7_TIME.lanceFall;
  const run = W7_TIME.lanceRun;
  // how far along the line its point has torn (pixels), and how long since it passed a place on it
  const tip = clamp01((strike - fall) / run) * len;
  const since = (s: number): number => strike - fall - (s / len) * run;
  // the crack's path: a narrow jagged tear wandering a pixel either side of the line
  const path: [number, number][] = [];
  let wob = 0;
  for (let s = 0; s <= n; s++) {
    wob += (hash2(s, a.seed, 5) - 0.5) * 0.9;
    wob *= 0.78;
    path.push([x0 + ux * s - uy * wob, y0 + uy * s + ux * wob]);
  }
  if (layer === 'floor') {
    // waiting: the line it will come down on, a scratch of light that quickens
    if (strike < 0) {
      const k = a.t / Math.max(0.01, a.delay);
      for (let s = 0; s <= n; s++) if (dith(x0 + ux * s, y0 + uy * s, 0.3 + 0.5 * k * (0.5 + 0.5 * Math.sin(a.t * (12 + 30 * k) + s * 0.3)))) dot(g, x0 + ux * s, y0 + uy * s, C[3]);
      return;
    }
    for (let s = 0; s <= Math.min(n, tip); s++) {
      const age = since(s);
      if (age < 0) continue;
      const glow = clamp01(1 - age / 0.4);
      const gone = clamp01(1 - (age - 1.3) / 0.6);
      if (gone <= 0) continue;
      const [px, py] = path[s];
      if (gone < 1 && !dith(px, py, gone)) continue;
      // white-hot where it has just torn, cooling to steel, then dark with light down in it
      dot(g, px, py, glow > 0.6 ? C[5] : glow > 0.25 ? C[4] : glow > 0 ? C[3] : '#0c0a10');
      dot(g, px, py + 1, glow > 0.4 ? C[3] : glow > 0 ? C[2] : C[2]);
      // the stone lit either side while it is hot
      if (glow > 0.2) {
        const wd = Math.max(2, Math.round(a.width * 2));
        for (let off = -wd; off <= wd; off++) {
          if (off === 0) continue;
          const gx2 = px - uy * off;
          const gy2 = py + ux * off * 0.5;
          if (dith(gx2, gy2, glow * (Math.abs(off) === 1 ? 0.7 : 0.7 / Math.abs(off)))) dot(g, gx2, gy2, Math.abs(off) === 1 ? C[3] : C[2]);
        }
      }
      // little cracks forking off it
      if (hash2(s, a.seed, 6) < 0.1) {
        const sd = hash2(s, a.seed, 7) < 0.5 ? 1 : -1;
        let fx2 = px;
        let fy2 = py;
        for (let k = 1; k < 3 + hash2(s, a.seed, 8) * 4; k++) {
          fx2 += ux * 0.7 + (hash2(k, s, a.seed) - 0.5);
          fy2 += sd * 0.7;
          dot(g, fx2, fy2, glow > 0.4 ? C[4] : '#0c0a10');
        }
      }
    }
    return;
  }
  // in the air
  if (strike < 0) {
    // high over the line's start, the spear gathering out of the dark
    const k = a.t / Math.max(0.01, a.delay);
    if (k > 0.5) {
      const bx = x0 - ux * 30;
      const by = y0 - 90;
      spear(g, bx, by, bx + ux * 22, by + 40, C, (k - 0.5) * 1.4, a.seed, a.t);
    }
    return;
  }
  const out = strike - fall - run;
  if (out > 0.18) return;
  // where its point is: falling onto the line's start, then driven along the line, then pulled up and gone
  const fk = clamp01(strike / fall);
  let tx: number;
  let ty: number;
  if (strike < fall) {
    tx = x0 - ux * 18 * (1 - fk);
    ty = y0 - 64 * (1 - fk * fk);
  } else {
    tx = x0 + ux * tip;
    ty = y0 + uy * tip - (out > 0 ? out * 120 : 0);
  }
  // its shaft slants up and back from its point, the way it came in
  const bl = Math.hypot(ux * 0.55, 1);
  const bx = -ux * 0.55 / bl;
  const by = -1 / bl;
  const L = 60;
  const alpha = out > 0 ? clamp01(1 - out / 0.18) : 1;
  // speed lines behind it, the way it is driven
  for (let j = 1; j <= 4; j++) {
    const off = j * 5;
    const sx0 = tx - ux * off + bx * (8 + j * 3);
    const sy0 = ty - uy * off + by * (8 + j * 3);
    streak(g, sx0 + bx * (24 - j * 3), sy0 + by * (24 - j * 3), sx0, sy0, [C[1], C[2], C[3]], 1, 0, (0.75 - j * 0.12) * alpha);
  }
  spear(g, tx + bx * L, ty + by * L, tx, ty, C, alpha, a.seed, a.t);
  // where its point bites: a flare, sparks, stone chips and dust thrown up off the tear
  if (strike >= fall && out < 0.05) {
    dot(g, tx - 2, ty - 1, C[4], 5, 2);
    dot(g, tx - 1, ty - 2, C[5], 3, 2);
    for (let j = 0; j < 5; j++) {
      const sp = -Math.PI / 2 + (hash2(j, Math.floor(a.t * 60), a.seed) - 0.5) * 2.2;
      const lenS = 4 + hash2(j, Math.floor(a.t * 60) + 3, a.seed) * 6;
      streak(g, tx + Math.cos(sp) * lenS + ux * 2, ty + Math.sin(sp) * lenS, tx, ty - 1, [C[2], C[3], C[4], C[5]], 1);
    }
  }
  // chips of the floor flung up out of the tear as it passes, tumbling, falling back; dust rising behind
  const N = 26;
  for (let i = 0; i < N; i++) {
    const s = ((i + hash2(i, a.seed, 31)) / N) * len;
    if (s > tip) continue;
    const age = since(s);
    if (age < 0 || age > 0.5) continue;
    const sd = hash2(i, a.seed, 32) < 0.5 ? 1 : -1;
    const vs = (25 + hash2(i, a.seed, 33) * 45) * Math.max(0.6, Math.min(1.6, a.width));
    const vx = ux * (20 + hash2(i, a.seed, 34) * 40) - uy * sd * vs;
    const vy = uy * 20 + ux * sd * vs * 0.45 - (55 + hash2(i, a.seed, 35) * 75);
    const px = x0 + ux * s + vx * age;
    const py = y0 + uy * s + vy * age + 300 * age * age;
    if (py > y0 + uy * s + 3) continue;
    const sh = Math.floor(hash2(i, a.seed, 36) * 4);
    // its trail, then the chip itself (each a broken bit of stone, lit along its top)
    streak(g, px - vx * 0.025, py - (vy + 600 * age) * 0.025, px, py, [STONE[0], STONE[1]], 1, 0, 0.8);
    dot(g, px, py, STONE[3]);
    if (sh >= 1) dot(g, px + sd, py, STONE[2]);
    if (sh >= 2) dot(g, px, py + 1, STONE[1]);
    if (sh === 3) dot(g, px - sd, py + 1, STONE[0]);
  }
  for (let i = 0; i < 6; i++) {
    const s = ((i + 0.5) / 6) * len;
    if (s > tip) continue;
    const age = since(s);
    if (age < 0.02 || age > 0.6) continue;
    mist(g, x0 + ux * s, y0 + uy * s - 2 - age * 14, 3 + age * 10, 2 + age * 5, DUSK_DUST, 1.1 * (1 - age / 0.6), a.seed + i, a.t, 0.5);
  }
}

/** Broken stone of the floor: its shadowed side to its lit top. */
const STONE: readonly string[] = ['#2a2436', '#463e58', '#6a6080', '#9a92b0'];

/**
 * A spear of light from its butt (bx, by) to its point (px, py): a shaft tapering from one pixel at its butt to
 * three, its edges flickering, a white core; a long leaf-shaped head; `a` how much of it is there.
 */
function spear(g: CanvasRenderingContext2D, bx: number, by: number, px: number, py: number, C: readonly string[], a: number, seed: number, t: number): void {
  if (a <= 0) return;
  const dx = px - bx;
  const dy = py - by;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const n = Math.round(len);
  for (let s = 0; s <= n; s++) {
    const q = s / n;
    const cx = bx + ux * s;
    const cy = by + uy * s;
    if (q < 0.3 && !dith(cx, cy, (q / 0.3) * a + 0.05)) continue;
    if (a < 1 && !dith(cx, cy, a)) continue;
    let half: number;
    if (q < 0.74) half = 0.6 + q * 1.6;
    else {
      // the head: swelling out of the shaft, drawn to a point
      const u = (q - 0.74) / 0.26;
      half = u < 0.3 ? 1.8 + (u / 0.3) * 1.8 : 3.6 * (1 - (u - 0.3) / 0.7) ** 0.9;
    }
    const r = Math.ceil(half) + 2;
    for (let k = -r; k <= r; k++) {
      const d = Math.abs(k) / Math.max(0.3, half);
      if (d > 1) {
        // its light round it: a pixel of glow at its edge, flickering further out
        if (Math.abs(k) <= Math.ceil(half) + 1 && q > 0.2) dot(g, cx + nx * k, cy + ny * k, C[2]);
        else if (d < 2.4 && hash2(s * 5 + k, Math.floor(t * 60), seed) < 0.14) dot(g, cx + nx * k, cy + ny * k, C[3]);
        continue;
      }
      dot(g, cx + nx * k, cy + ny * k, d < 0.4 ? C[5] : d < 0.8 ? C[4] : k < 0 ? C[4] : C[3]);
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
  const since = a.part === 'pass' ? a.t - 0.1 : (head - wall) / W7_TIME.ghostSpeed;
  const [wxp, wyp] = a.part === 'pass' ? S(cam, a.x, a.y, z) : at(wall);
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
  // (a passage only: the shot itself is the game's)
  if (a.part === 'pass') return;
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

/** In front, as it is struck (bleedOn): the wound opens and its blood spurts out the way the blow went. (While it bleeds: drawBleeding.) */
function bleedFront(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const C = W7_RAMP.bleeding;
  const m = live(a, game);
  if (!m) return;
  const top = topOf(m);
  const [mx, my] = S(cam, m.x, m.y);
  const wx0 = mx;
  const wy0 = my - Math.round(top * 0.58);
  // the wound tearing open (its first pictures)
  const open = clamp01(a.t / 0.05);
  for (let k = 0; k < Math.round(2 + 4 * open); k++) {
    dot(g, wx0 - 3 + k, wy0 - 2 + Math.round(k * 0.7), C[1]);
    dot(g, wx0 - 3 + k, wy0 - 3 + Math.round(k * 0.7), C[4]);
  }
  if (a.t < 0.12) glint(g, wx0, wy0 - 1, 2, C[4], C[5]);
  // the spurt, flung on the way the blow went
  const away = a.dx - a.dy >= 0 ? 1 : -1;
  for (let i = 0; i < 9; i++) {
    const tt = a.t - 0.02 - i * 0.025;
    if (tt <= 0 || tt > 0.6) continue;
    const vx = away * (35 + hash2(i, a.seed, 2) * 45);
    const vy = -(35 + hash2(i, a.seed, 3) * 40);
    const px = wx0 + vx * tt;
    const py = wy0 + vy * tt + 170 * tt * tt;
    if (py > my + 3) continue;
    drop(g, px, py, vx, vy + 340 * tt, C, i < 4);
  }
}

/**
 * While anything bleeds (the rules' Monster.bleedT, Hero.heroBleedT): its wound, drips running off it and falling, and
 * the splashes left on the floor where it walks (twice as many walking: tickW7 lays them), drying and fading. The hero's
 * blood, a monster's doing, is dark, its wet glint the enemy's pink.
 */
function drawBleeding(g: CanvasRenderingContext2D, cam: Cam, game: Game, layer: 'floor' | 'air'): void {
  if (layer === 'floor') {
    for (const sp of W7.splashes) {
      const C = sp.hero ? ENEMY_BLOOD : W7_RAMP.bleeding;
      const [px, py] = S(cam, sp.x, sp.y);
      const dry = clamp01(sp.age / W7_TIME.splash);
      const fade = clamp01((W7_TIME.splash - sp.age) / 0.8);
      if (fade <= 0) continue;
      // fresh, it is wet and red; drying, it darkens; going, it thins to nothing
      const tone = dry > 0.5 ? ['#0a0002', C[1], C[1], C[2], C[2], C[3]] : C;
      if (fade < 1) {
        if (!dith(px, py, fade, sp.seed)) continue;
      }
      splat(g, px, py, sp.size, tone, sp.seed, sp.ex, sp.ey, 1 - dry);
    }
    return;
  }
  for (const m of game.monsters) {
    const left = (m as { bleedT?: number }).bleedT ?? 0;
    if (m.dead || left <= 0) continue;
    const C = W7_RAMP.bleeding;
    const top = topOf(m);
    const [mx, my] = S(cam, m.x, m.y);
    const wy0 = my - Math.round(top * 0.58);
    for (let k = 0; k < 6; k++) {
      dot(g, mx - 3 + k, wy0 - 2 + Math.round(k * 0.7), C[1]);
      dot(g, mx - 3 + k, wy0 - 3 + Math.round(k * 0.7), C[4]);
    }
    const b = W7.bleeders.get(m.id);
    const walking = b ? b.since < 0 : false;
    for (let i = 0; i < (walking ? 4 : 2); i++) {
      const ph = (W7.clock * (walking ? 3.4 : 1.7) + i / (walking ? 4 : 2) + (m.id % 7) * 0.13) % 1;
      const py = wy0 + 1 + ph * ph * top * 0.58;
      if (py < my) drop(g, mx - 2 + i * 1.5, py, 0, 1, C, i === 1);
    }
  }
  const h = game.hero as { x: number; y: number; heroBleedT?: number };
  if ((h.heroBleedT ?? 0) > 0) {
    const C = ENEMY_BLOOD;
    const [hx, hy] = S(cam, h.x, h.y);
    for (let k = 0; k < 6; k++) {
      dot(g, hx - 3 + k, hy - 20 + k, C[4]);
      dot(g, hx - 3 + k, hy - 19 + k, C[2]);
    }
    for (let i = 0; i < 2; i++) {
      const ph = (W7.clock * 2.2 + i * 0.5) % 1;
      drop(g, hx - 2 + i * 4, hy - 15 + ph * ph * 15, 0, 1, C, true);
    }
  }
}

/** Behind: briars burst up out of the floor, dark red and thorned, and cut whatever walks in them. Half of them stand in front of what walks there. */
function bleedBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  // (as the rules' zone 'thorns' is drawn, from the act's own clock)
  thorns(g, cam, { x: a.x, y: a.y, r: a.r, t: a.t, dur: a.dur }, a.seed, game, layer);
}

/** The briars of a patch of thorns (the rules' zone 'thorns': x, y, r, t, dur): bursting up over its first 0.22 s, swaying, sinking back over its last 0.5 s. */
function thorns(g: CanvasRenderingContext2D, cam: Cam, z: { x: number; y: number; r: number; t: number; dur: number }, seed: number, game: Game, layer: 'floor' | 'air'): void {
  const a = { x: z.x, y: z.y, r: Math.min(2.2, z.r), t: z.t, seed };
  const grow = easeOut(a.t / W7_TIME.thornsGrow) * easeOut((z.dur - z.t) / W7_TIME.thornsSink);
  const over = a.t < W7_TIME.thornsGrow ? Math.sin((a.t / W7_TIME.thornsGrow) * Math.PI) * 0.15 : 0;
  const fade = clamp01((z.dur - z.t) / 0.25);
  // whatever walks in them
  const walkers = game.monsters.filter((m) => !m.dead && Math.hypot(m.x - a.x, m.y - a.y) < a.r);
  const walker = walkers[0];
  const [cx, cy] = S(cam, a.x, a.y);
  const footY = walker ? S(cam, walker.x, walker.y)[1] : cy;
  if (layer === 'floor') {
    // the floor torn where they came up: dark earth, broken stone at the edges
    mist(g, cx, cy, a.r * RX * 0.95, a.r * RY * 0.95, ['#0c0406', '#160609', '#22080c'], 1.2 * fade * Math.min(1, a.t / 0.1), a.seed, 0, 0);
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
  if (layer === 'air' && a.t > W7_TIME.thornsGrow && fade > 0.5) {
    for (const w of walkers) {
      const [mx, my] = S(cam, w.x, w.y);
      const C = W7_RAMP.bleeding;
      for (let i = 0; i < 3; i++) {
        const lx = mx - 3 + i * 3;
        const ly = my - 5 - i * 3;
        dot(g, lx, ly, C[4], 2, 1);
        dot(g, lx + 1, ly + 1, C[3]);
        const ph = (a.t * 3 + i * 0.37 + w.id * 0.21) % 1;
        drop(g, lx + (i - 1) * ph * 7, ly - ph * 7 + ph * ph * 16, i - 1, ph * 2 - 1, C, i === 1);
      }
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

/** On a monster, its blow landing (heroBleed): it cuts him, in the enemy's colours: a slash of pink burning to gold, his blood flung off. (While he bleeds: drawBleeding.) */
function bleedMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const h = game.hero;
  const [hx, hy] = S(cam, h.x, h.y);
  const C = ENEMY_BLOOD;
  // the slash across him: a crescent of the enemy's fire, white-gold at its edge, dark pink behind it
  const away = a.dx - a.dy >= 0 ? 1 : -1;
  if (a.t < 0.35) {
    const k = clamp01(a.t / 0.05);
    const fade = clamp01(1 - (a.t - 0.08) / 0.27);
    const a0 = away > 0 ? Math.PI * 1.15 : -Math.PI * 0.15;
    const a1 = a0 + away * -Math.PI * 1.0 * k;
    smear(g, hx, hy - 17, 15, 11, a0, a1, 4, [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[3], W7_ENEMY[4], W7_ENEMY[5]], -0.25 * away, fade);
  }
  // the cut on him, opening
  const open = clamp01((a.t - 0.03) / 0.05);
  for (let k = 0; k < Math.round(6 * open); k++) {
    dot(g, hx - 3 + k, hy - 20 + k, C[4]);
    dot(g, hx - 3 + k, hy - 19 + k, C[2]);
  }
  // his blood flung off him the way the blow went
  for (let i = 0; i < 10; i++) {
    const tt = a.t - 0.04 - i * 0.012;
    if (tt <= 0 || tt > 0.6) continue;
    const vx = away * (30 + hash2(i, a.seed, 3) * 50);
    const vy = -(30 + hash2(i, a.seed, 4) * 45);
    const px = hx + vx * tt;
    const py = hy - 17 + vy * tt + 180 * tt * tt;
    if (py > hy + 2) continue;
    drop(g, px, py, vx, vy + 360 * tt, C, i < 4);
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
  const torn = 0.15;
  // torn out of the body: a column of grave-mist rising off it, thinning
  if (a.t < torn + fl + 0.3) {
    const k = clamp01(a.t / (torn + fl + 0.3));
    mist(g, cx, cy - 8 - k * 8, 7, 12, [C[2], C[3], C[4]], 0.8 * (1 - k) * Math.min(1, a.t / 0.08 + 0.3), a.seed, a.t, 1.2);
  }
  if (a.t < torn) {
    // the soul coming up out of it, a flame of soul-light swelling
    const k = a.t / torn;
    flame(g, cx, cy + 2, 3 + 8 * k, 3 + 5 * k, [C[2], C[3], C[4], C[4], C[5], C[5]], a.seed, a.t);
    return;
  }
  const q = clamp01((a.t - torn) / fl);
  if (q >= 1) {
    // taken in: a flare of soul-light round his hands
    const k = clamp01((a.t - torn - fl) / 0.25);
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

/** How far a spirit has risen (0..1) and how much of it is left as it goes (1..0). */
function spiritK(a: Act): [number, number] {
  return [clamp01(a.t / W7_TIME.spiritBuild), clamp01((a.dur - a.t) / W7_TIME.spiritFade)];
}

/**
 * Behind: a kill raises its spirit to fight for him (spirit): a pale see-through copy of the slain (lookW7 paints it), its
 * edge the friend's cyan, rising out of the body in a stream of grave-mist, its legs trailing away into mist, motes of
 * soul-light rising off it; at the end of its time it rises away and is gone. Its blows (spiritHit) are a part of their own.
 */
function reapBehind(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.reaping;
  if (a.part === 'hit') return spiritBlow(g, cam, a, game, layer);
  const sp = live(a, game, 0);
  if (!sp) return;
  const [build, going] = spiritK(a);
  const k = build * going;
  const [sx, sy] = S(cam, sp.x, sp.y);
  const [bx, by] = S(cam, a.x, a.y);
  if (layer === 'floor') {
    // a pool of pale light under it, and a thread of mist back to the body it rose from while it rises
    mist(g, sx, sy, 14, 6, [C[2], C[3]], 0.6 * k, a.seed, a.t, 0.2);
    const thread = clamp01(1 - (a.t - W7_TIME.spiritBuild) / 0.8);
    if (thread > 0) {
      for (let i = 0; i <= 12; i++) {
        const q = i / 12;
        mist(g, bx + (sx - bx) * q, by + (sy - by) * q - 2, 3, 2, [C[2], C[3]], 0.8 * thread * (1 - Math.abs(q - 0.5)), a.seed + i, a.t, 0.6);
      }
    }
    return;
  }
  // rising: soul-light streaming up off the body into it
  if (build < 1) {
    for (let i = 0; i < 10; i++) {
      const ph = (a.t * 3 + hash2(i, a.seed, 9)) % 1;
      const px = bx + (sx - bx) * ph + Math.sin(ph * 8 + i) * 2;
      const py = by - 2 + (sy - 12 - by + 2) * ph;
      dot(g, px, py, ph > 0.6 ? C[5] : C[4]);
    }
    mist(g, bx, by - 3, 8, 5, [C[2], C[3], C[4]], 1.1 * (1 - build), a.seed + 2, a.t, 1.4);
  }
  // grave-mist curling up round its feet, motes of soul-light rising off it (faster as it goes)
  mist(g, sx, sy - 4, 11, 6, [C[2], C[3], C[4]], 0.7 * k + 0.4 * (1 - going), a.seed + 1, a.t, 1.2);
  for (let i = 0; i < 7 + Math.round(8 * (1 - going)); i++) {
    const ph = (a.t * (0.8 + 1.5 * (1 - going)) + hash2(i, a.seed, 1)) % 1;
    dot(g, sx - 9 + hash2(i, a.seed, 2) * 18 + Math.sin(ph * 6 + i) * 2, sy - 4 - ph * 34, ph < 0.5 ? C[5] : C[4]);
  }
  // (a blow at a moment of its own, as the stills had it)
  const foe = live(a, game, 1);
  if (foe && a.pts.length && a.t >= a.pts[0] && a.t - a.pts[0] < 0.3) spiritSlash(g, cam, foe.x, foe.y, topOf(foe), a.t - a.pts[0]);
}

/** A spirit's blow (spiritHit): a pale slash of soul-light on what it strikes, its edge cyan (a friend's). */
function spiritBlow(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game, layer: 'floor' | 'air'): void {
  if (layer !== 'air') return;
  const foe = live(a, game, 0);
  spiritSlash(g, cam, foe ? foe.x : a.x, foe ? foe.y : a.y, foe ? topOf(foe) : 26, a.t);
}

function spiritSlash(g: CanvasRenderingContext2D, cam: Cam, x: number, y: number, top: number, since: number): void {
  const C = W7_RAMP.reaping;
  if (since >= 0.3) return;
  const [fx0, fy0] = S(cam, x, y, top * 0.5);
  const k = clamp01(since / 0.05);
  const fade = clamp01(1 - (since - 0.06) / 0.24);
  smear(g, fx0 - 2, fy0, 13, 10, -2.3, -2.3 + 2.6 * k, 4, [C[1], C[2], C[3], C[4], W7_FRIEND[3], C[5]], 0.15, fade);
}

/** On a monster: once dead it rises again, lurching up out of its fall, the enemy's fire licking up round it, its mist pink. */
function reapMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, layer: 'floor' | 'air'): void {
  const [cx, cy] = S(cam, a.x, a.y);
  const k = clamp01((a.t - 0.2) / W7_TIME.rise);
  const kindle = clamp01(a.t / 0.2);
  const dying = clamp01((a.dur - a.t) / 0.4);
  if (layer === 'floor') {
    mist(g, cx, cy, 20, 9, [W7_ENEMY[1], W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3]], 1.0 * kindle * dying, a.seed, a.t, 0.3);
    return;
  }
  // tongues of the enemy's fire up out of the floor round it, before it
  for (let i = 0; i < 6; i++) {
    const an = (i / 6) * Math.PI + 0.25 + hash2(i, a.seed, 1) * 0.3;
    const px = cx + Math.cos(an) * (8 + hash2(i, a.seed, 2) * 5);
    const py = cy + Math.sin(an) * (2 + hash2(i, a.seed, 3) * 3);
    flame(g, px, py, (9 + hash2(i, a.seed, 4) * 9) * (0.4 + 0.6 * k) * kindle * dying, (5 + hash2(i, a.seed, 5) * 3) * Math.max(0.4, dying), ENEMY_FIRE, a.seed + i, a.t);
  }
  // sparks of pink and gold rising off it
  for (let i = 0; i < Math.round(10 * kindle * dying); i++) {
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
  // (the rules' zone 'reaper' as it lies: written in over 0.3 s, and gone over its last 0.3; culled with a mark: it takes one)
  const taken = a.part === 'mark' ? a.t : a.pts.length ? a.t - a.pts[0] : -1;
  const written = a.part === 'zone' ? clamp01(a.t / 0.3) * clamp01((a.dur - a.t) / 0.3) : 1;
  const burn = (taken >= 0 ? clamp01(1 - (taken - 0.5) / 0.4) : 1) * written;
  const flare = taken >= 0 && taken < 0.5 ? 1 - taken / 0.5 : 0;
  if (layer === 'floor') {
    if (burn <= 0) return;
    // a ring of bone light written on the floor: two lines of it cut by hand (never ruled), and between them an
    // inscription, letter after letter of bone, a gap between words, the light spilling a little outside it
    const ring = (k: number, c: string, under: string): void => {
      const n = Math.round(rx * k * 7);
      for (let i = 0; i < n; i++) {
        const an = (i / n) * TAU;
        const wob = 1 + (vnoise(i * 0.09, k * 7, a.seed) - 0.5) * 0.05;
        const px = cx + Math.cos(an) * rx * k * wob;
        const py = cy + Math.sin(an) * ry * k * wob;
        if (burn < 1 && !dith(px, py, burn)) continue;
        dot(g, px, py + 1, under);
        dot(g, px, py, c);
      }
    };
    for (let i = 0; i < Math.round(rx * 9); i++) {
      const an = hash2(i, a.seed, 40) * TAU;
      const d = 1.02 + hash2(i, a.seed, 41) * 0.12;
      const px = cx + Math.cos(an) * rx * d;
      const py = cy + Math.sin(an) * ry * d;
      if (dith(px, py, burn * (1.14 - d) * 4)) dot(g, px, py, C[2]);
    }
    ring(1, flare > 0.3 ? C[5] : C[4], C[1]);
    ring(0.8, flare > 0.3 ? C[5] : C[3], C[1]);
    {
      const n = Math.round(rx * 0.9 * 6.3 / 3);
      for (let i = 0; i < n; i++) {
        if (hash2(i, a.seed, 42) < 0.15 || i % 6 === 5) continue;
        const an = (i / n) * TAU;
        const px = cx + Math.cos(an) * rx * 0.9;
        const py = cy + Math.sin(an) * ry * 0.9;
        const sh = Math.floor(hash2(i, a.seed, 43) * 4);
        const c = flare > 0 ? C[5] : C[4];
        if (burn < 1 && !dith(px, py, burn)) continue;
        dot(g, px, py - 1, c);
        if (sh !== 1) dot(g, px, py, c);
        if (sh === 2 || sh === 3) dot(g, px + 1, py - 1, c);
        if (sh === 0) dot(g, px - 1, py, c);
      }
    }
    // in it, the hooded blade, written on the floor (a little less flat than the floor is, so that it reads): a cowl,
    // its crown leaning back into a drooping peak, its face a deep hollow under a lit brim, its cloth falling in folds
    // to a ragged hem; and over it, out of it, the great curved blade of a scythe, its edge bone, its haft beside it
    const bone = flare > 0 ? C[5] : C[4];
    const S0 = rx * 0.72;
    const SQ = 0.72;
    const segD = (u: number, v: number, u0: number, v0: number, u1: number, v1: number): number => {
      const du = u1 - u0;
      const dv = v1 - v0;
      const k2 = clamp01(((u - u0) * du + (v - v0) * dv) / (du * du + dv * dv));
      return Math.hypot(u - u0 - du * k2, v - v0 - dv * k2);
    };
    const peakAt = (u: number, v: number): number => Math.min(...[0, 0.2, 0.4, 0.6, 0.8, 1].map((q) => {
      const [qu, qv] = quad(0.0, -0.66, -0.26, -0.86, -0.46, -0.6, q);
      return Math.hypot(u - qu, v - qv) - (0.09 - q * 0.07);
    }));
    for (let py = Math.floor(cy - S0 * SQ * 1.05); py <= Math.ceil(cy + S0 * SQ * 0.95); py++) {
      for (let px = Math.floor(cx - S0 * 1.05); px <= Math.ceil(cx + S0 * 1.05); px++) {
        const u = (px - cx) / S0;
        const v = (py - cy) / (S0 * SQ);
        if (burn < 1 && !dith(px, py, burn)) continue;
        // the cowl
        const cu = u - 0.04;
        let w: number;
        if (v < -0.4) {
          const e = (v + 0.4) / 0.3;
          w = e < -1 ? -1 : 0.27 * Math.sqrt(1 - e * e);
        } else w = 0.27 + 0.21 * ((v + 0.4) / 0.95) ** 1.3;
        const hem = 0.55 + 0.05 * Math.sin(u * 21 + 1) + 0.03 * Math.sin(u * 47);
        const inCowl = (w > 0 && Math.abs(cu) <= w && v <= hem) || peakAt(u, v) < 0;
        if (inCowl) {
          const face = Math.hypot((u - 0.07) / 0.13, (v + 0.12) / 0.22);
          const edge = peakAt(u, v) > -0.035 && peakAt(u, v) < 0 ? true : w - Math.abs(cu) < 0.05 || hem - v < 0.06;
          if (face < 1) {
            dot(g, px, py, face < 0.55 ? C[0] : face < 0.8 ? C[1] : C[2]);
            continue;
          }
          if (face < 1.28 && v < 0.12) {
            // the brim round its face, lit
            dot(g, px, py, bone);
            continue;
          }
          const fold = [-0.2, -0.05, 0.12, 0.27].some((f) => Math.abs(cu - f * (0.55 + 0.7 * clamp01((v - 0.1) / 0.45))) < 0.022) && v > 0.12;
          const lit = cu < -0.08 && v > -0.3 && Math.abs(cu) > w - 0.13;
          dot(g, px, py, edge ? bone : fold ? C[2] : lit ? C[4] : C[3]);
          continue;
        }
        // the blade, out over it: inside one disc and outside another, its point hooking down on the far side
        const dO = Math.hypot(u + 0.12, v - 0.14);
        const dI = Math.hypot(u - 0.06, v - 0.36);
        if (dO <= 0.98 && dI >= 0.86 && v < 0.26 && u < 0.62) {
          dot(g, px, py, dI - 0.86 < 0.07 ? (flare > 0 ? C[5] : '#fffaf0') : dI - 0.86 < 0.14 ? C[4] : 0.98 - dO < 0.06 ? C[2] : C[3]);
          continue;
        }
        // its haft, down from the blade's heel past the cowl
        const dh = segD(u, v, 0.56, -0.48, 0.88, 0.82);
        if (dh < 0.055) dot(g, px, py, dh < 0.022 ? C[4] : C[2]);
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
  const [vx, vy] = v ? S(cam, v.x, v.y) : a.part === 'mark' ? S(cam, a.x1, a.y1) : [cx, cy];
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

/** On a monster: while the hero is low its blows flare: it burns with the enemy's fire (cullAura), and its blow on him bursts. */
function cullMonster(g: CanvasRenderingContext2D, cam: Cam, a: Act, game: Game): void {
  const m = game.monsters.find((q) => q.id === a.ids[0]);
  if (!m) return;
  // (the stills' and the playtest's: it burns whatever his life; the rules' blows (cullBlow) burst only)
  if (a.part === '' && !m.dead) cullAura(g, cam, m, 1, a.t, a.seed);
  const h = game.hero;
  const [mx, my] = S(cam, m.x, m.y);
  const top = topOf(m);
  const F = [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[4], W7_ENEMY[5], '#fff2c8'];
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

/** A monster with Culling while he is low: the enemy's fire licking up round its feet and its sides, its eyes flaring; `hot` how kindled (0..1). */
function cullAura(g: CanvasRenderingContext2D, cam: Cam, m: Monster, hot: number, t: number, seed: number): void {
  if (hot <= 0) return;
  const [mx, my] = S(cam, m.x, m.y);
  const top = topOf(m);
  const F = [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[4], W7_ENEMY[5], '#fff2c8'];
  for (let i = 0; i < 5; i++) {
    const px = mx - 9 + i * 4.5;
    flame(g, px, my + 1, (8 + hash2(i, seed, 2) * 9 + (i === 0 || i === 4 ? 4 : 0)) * hot, 6 * Math.max(0.5, hot), F, seed + i, t);
  }
  if (hot > 0.5) {
    dot(g, mx - 2, my - top + 6, W7_ENEMY[5]);
    dot(g, mx + 1, my - top + 6, W7_ENEMY[5]);
    glint(g, mx - 2, my - top + 6, 1, W7_ENEMY[4], W7_ENEMY[5]);
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
  const warn = a.part === 'warn' ? a.pts[0] ?? W7_TIME.warn : W7_TIME.warn;
  const wave = a.part === 'wave' ? a.t : a.part === 'warn' ? -1 : a.t - warn;
  const ringFade = a.part === 'wave' ? 0 : wave < 0 ? (a.part === 'warn' ? clamp01((a.dur - a.t) / 0.15) : 1) : clamp01(1 - wave / 0.35);
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
  // the extra piece: a ring with a red stone, thrown higher, turning (when there is one: the stills' always)
  if (a.pts[0] !== 0) {
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
  // in it, the coins it has: glinting at its belt (the playtest's; the rules' Monster.stolen: stolenBelt)
  if (a.t > 0.3 && !((m as { stolen?: number }).stolen ?? 0)) stolenBelt(g, cam, m, a.t);
}

/** One carrying his stolen gold (the rules' Monster.stolen): his coins at its belt, clinking, glinting pink and gold. */
function stolenBelt(g: CanvasRenderingContext2D, cam: Cam, m: Monster, t: number): void {
  const C = W7_RAMP.plundering;
  const [mx, my] = S(cam, m.x, m.y, 12);
  const jig = Math.sin(t * 14 + m.id) > 0.6 ? 1 : 0;
  coin(g, mx - 2, my + 1 - jig, t * 3, C);
  coin(g, mx + 2, my + 2, 1.2 + t * 2, C);
  if (Math.sin(t * 9 + m.id) > 0.3) glint(g, mx, my - 1, 1, W7_ENEMY[4], W7_ENEMY[5]);
}

/** It dies carrying his gold: the coins burst out of it, spinning, and scatter on the floor, a flash of the enemy's pink as they go. */
function plunderDrop(g: CanvasRenderingContext2D, cam: Cam, a: Act, layer: 'floor' | 'air'): void {
  const C = W7_RAMP.plundering;
  const [cx, cy] = S(cam, a.x, a.y);
  const n = 10;
  for (let i = 0; i < n; i++) {
    const an = (i / n) * TAU + hash2(i, a.seed, 1) * 0.6;
    const sp = 16 + hash2(i, a.seed, 2) * 22;
    const vz = 70 + hash2(i, a.seed, 3) * 60;
    const tt = Math.max(0, a.t - 0.05);
    const land = (2 * vz) / 300;
    const t1 = Math.min(tt, land);
    const px = cx + Math.cos(an) * sp * t1;
    const py = cy + Math.sin(an) * sp * t1 * 0.5;
    const z = 12 + vz * t1 - 150 * t1 * t1;
    const fade = clamp01((a.dur - a.t) / 0.6);
    if (tt >= land) {
      if (layer === 'floor' && dith(px, py, fade, a.seed + i)) coin(g, px, py, 0, C, true);
    } else if (layer === 'air') coin(g, px, py - z, tt * 16 + i, C);
  }
  if (layer === 'air' && a.t < 0.15) star(g, cx, cy - 12, 4 + 8 * (1 - a.t / 0.15), [W7_ENEMY[1], W7_ENEMY[2], W7_ENEMY[3], W7_ENEMY[4], W7_ENEMY[5]], a.seed, 8);
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
  const crack = a.part === 'cast' ? a.t - W7_TIME.cast : a.pts.length ? a.t - a.pts[0] : -1;
  const shatter = crack > W7_TIME.breaking;
  if (shatter) {
    // shattered: its pieces flung out and falling, catching the light
    const since = crack - W7_TIME.breaking;
    if (since > W7_TIME.shatter) return;
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
  // (laid: it grows up out of its glass)
  const grow = a.part === 'zone' ? easeOut(a.t / W7_TIME.pane) * clamp01((a.dur - a.t) / 0.2) : 1;
  if (grow <= 0.05) return;
  const Ht = Math.max(3, Math.round(38 * grow));
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
  // its attack again: the arc of the swing coming out of it, in glass (not while it only stands)
  if (a.part !== 'zone' && a.t < 0.4) {
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
  'bleeding:front': { air: true },
  'bleeding:behind': { floor: true, air: true },
  'bleeding:monster': { air: true },
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
  'plundering:monster': { floor: true, air: true },
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
    case 'bleeding:front': return bleedFront(g, cam, a, game);
    case 'bleeding:behind': return bleedBehind(g, cam, a, game, layer);
    case 'bleeding:monster': return bleedMonster(g, cam, a, game);
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
    case 'plundering:monster': return a.part === 'drop' ? plunderDrop(g, cam, a, layer) : layer === 'air' ? plunderMonster(g, cam, a, game) : undefined;
    case 'mirroring:front': return mirrorFront(g, cam, a, game);
    case 'mirroring:behind': return mirrorBehind(g, cam, a, game);
    case 'mirroring:monster': return mirrorMonster(g, cam, a, game);
  }
}

// =============================================================================================
// What the rules lay on the floor (their zones), and what they keep on those they touch.

/** The rules' zones these words lie in: 'thorns' (Bleeding), 'reaper' (Culling), 'mirror' (Mirroring), by kind or by `look`. */
export type W7Zone = 'thorns' | 'reaper' | 'mirror';
export function zoneW7(z: { kind?: unknown; look?: unknown }): W7Zone | null {
  const k = z.look ?? z.kind;
  return k === 'thorns' || k === 'reaper' || k === 'mirror' ? k : null;
}
/** Whether the renderer leaves this patch to the looks here. */
export function ownsZoneW7(z: { kind?: unknown; look?: unknown }): boolean {
  return WORDS7_LOOK.on && zoneW7(z) !== null;
}

type ZoneLike = { x: number; y: number; r: number; t: number; dur: number; kind?: unknown; look?: unknown };
const zoneSeed = (z: ZoneLike): number => Math.floor(Math.abs(z.x * 97 + z.y * 131)) % 100000;
/** An act standing for a zone as it lies (its own clock the zone's). */
function zoneAct(z: ZoneLike, word: W7Word, side: W7Side): Act {
  return { id: -1, word, side, part: 'zone', t: z.t, dur: z.dur, seed: zoneSeed(z), x: z.x, y: z.y, x1: z.x, y1: z.y, dx: 1, dy: 0, ids: [], pts: [], r: z.r, delay: 0, width: 1, dieT: 0, fall: null };
}
/** Whether an act of this word's is already at work where a zone lies (its mark taking one, its pane casting). */
const takenOver = (z: ZoneLike, word: W7Word, part: string): boolean => W7.acts.some((a) => a.word === word && a.part === part && Math.hypot(a.x - z.x, a.y - z.y) < 0.6);

function drawZones(g: CanvasRenderingContext2D, cam: Cam, game: Game, layer: 'floor' | 'air', here: (x: number, y: number) => boolean): void {
  for (const raw of game.zones) {
    const z = raw as unknown as ZoneLike;
    const k = zoneW7(z);
    if (!k || !here(z.x, z.y)) continue;
    if (k === 'thorns') thorns(g, cam, z, zoneSeed(z), game, layer);
    else if (k === 'reaper' && !takenOver(z, 'culling', 'mark')) cullBehind(g, cam, zoneAct(z, 'culling', 'behind'), game, layer);
    else if (k === 'mirror' && layer === 'air' && !takenOver(z, 'mirroring', 'cast')) mirrorBehind(g, cam, zoneAct(z, 'mirroring', 'behind'), game);
  }
}

/** What lasts on those the words touch: the bleeding (Monster.bleedT, Hero.heroBleedT), his gold carried off (Monster.stolen), a monster with Culling while he is low. */
function drawStates(g: CanvasRenderingContext2D, cam: Cam, game: Game, layer: 'floor' | 'air'): void {
  drawBleeding(g, cam, game, layer);
  if (layer !== 'air') return;
  for (const m of game.monsters) {
    if (m.dead) continue;
    if (((m as { stolen?: number }).stolen ?? 0) > 0) stolenBelt(g, cam, m, W7.clock);
    const hot = W7.hot.get(m.id) ?? 0;
    if (hot > 0) cullAura(g, cam, m, hot, W7.clock, m.id * 7 + 3);
  }
}

/** Under the figures (render.ts, with the floor's patches). */
export function floorW7(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, here: (x: number, y: number) => boolean): void {
  if (!WORDS7_LOOK.on) return;
  drawZones(g, cam, game, 'floor', here);
  drawStates(g, cam, game, 'floor');
  for (const a of W7.acts) if (here(a.x, a.y)) drawAct(g, cam, a, game, 'floor');
  void t;
}

/** Over the figures (drawn after the dark, so it glows). */
export function airW7(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game): void {
  if (!WORDS7_LOOK.on) return;
  drawZones(g, cam, game, 'air', () => true);
  drawStates(g, cam, game, 'air');
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
    else if (a.word === 'piercing' && a.part !== 'pass') spot((x + x1) / 2, (y + y1) / 2 - 14, 60, 0.6 * fade);
    else if (a.word === 'surging' || a.word === 'culling') spot(x, y - 4, 30 + a.r * 22, 0.7 * fade);
    else spot(x, y - 10, 36, 0.6 * fade);
  }
  for (const raw of game.zones) {
    const z = raw as unknown as ZoneLike;
    const k = zoneW7(z);
    if (!k) continue;
    const fade = clamp01(z.t / 0.25) * clamp01((z.dur - z.t) / 0.4);
    spot(wx(cam, z.x, z.y), wy(cam, z.x, z.y) - (k === 'mirror' ? 18 : 4), k === 'mirror' ? 34 : 30 + z.r * 20, (k === 'thorns' ? 0.5 : 0.7) * fade);
  }
  void t;
}

/**
 * A monster's own picture changed by a word: a spirit Reaping raised (soul-light, its edge cyan, rising in and going, and
 * hovering: `lift` pixels), one Culling cut down (split along the cut), a flash as one is pierced or flashes like a mirror.
 * The rules' spirits: any monster carrying `spirit` (truthy) is drawn so, as one raised by a `spirit` event is.
 */
export function lookW7(m: Monster, sp: Sprite): { sp: Sprite; alpha: number; tint: [string, number] | null; lift: number } | null {
  if (!WORDS7_LOOK.on) return null;
  for (const a of W7.acts) {
    if (a.word === 'reaping' && a.side === 'behind' && a.part === '' && a.ids[0] === m.id) {
      const [build, going] = spiritK(a);
      const bob = Math.round(Math.sin(W7.clock * 3 + m.id) * 0.8);
      return { sp: remade(sp, 'soul'), alpha: 0.88 * build * going, tint: null, lift: Math.round(3 * build + 8 * (1 - going)) + bob };
    }
    if (a.word === 'culling' && a.side === 'front' && a.ids[0] === m.id && a.t >= W7_TIME.cullSweep * 0.5) {
      const slide = Math.min(7, Math.round(((a.t - W7_TIME.cullSweep * 0.5) / 0.2) * 5) + 3);
      return { sp: splitOf(sp, slide, a.dx >= 0 ? 1 : -1, `${m.id}:${sp.img.width}x${sp.img.height}:${sp.ax}`), alpha: 1, tint: a.t < W7_TIME.cullSweep * 0.8 ? [W7_RAMP.culling[4], 0.45] : null, lift: 0 };
    }
    if (a.word === 'culling' && a.side === 'behind' && a.ids[0] === m.id && a.pts.length && a.t - a.pts[0] >= 0 && a.t - a.pts[0] < 0.3) return { sp, alpha: 1, tint: [W7_RAMP.culling[4], 0.35], lift: 0 };
    if (a.word === 'piercing' && a.side === 'front' && a.ids.includes(m.id)) {
      const s = a.pts[a.ids.indexOf(m.id)] ?? 0;
      const since = (a.t * W7_TIME.pierceSpeed - s) / W7_TIME.pierceSpeed;
      if (since >= 0 && since < 0.05) return { sp, alpha: 1, tint: [W7_RAMP.piercing[5], 0.35], lift: 0 };
    }
    if (a.word === 'piercing' && a.side === 'behind' && a.ids.includes(m.id)) {
      // lit an instant as the spear's point tears past it
      const L = Math.hypot(a.x1 - a.x, a.y1 - a.y) || 1;
      const along = ((m.x - a.x) * (a.x1 - a.x) + (m.y - a.y) * (a.y1 - a.y)) / L;
      const passed = a.t - a.delay - W7_TIME.lanceFall - (along / L) * W7_TIME.lanceRun;
      if (passed >= 0 && passed < 0.06) return { sp, alpha: 1, tint: [W7_RAMP.piercing[5], 0.3], lift: 0 };
    }
    if (a.word === 'mirroring' && a.side === 'monster' && a.ids[0] === m.id && a.t < 0.15) return { sp, alpha: 1, tint: ['#ffd8e8', 0.4 * (1 - a.t / 0.15)], lift: 0 };
  }
  if ((m as { spirit?: unknown }).spirit) return { sp: remade(sp, 'soul'), alpha: 0.88, tint: null, lift: 3 + Math.round(Math.sin(W7.clock * 3 + m.id) * 0.8) };
  return null;
}

/** A body falling (render.ts, the fallen standing among the figures): one Culling cut down falls split along the cut. */
export function fallenW7(f: { x: number; y: number; t: number }, sp: Sprite): Sprite | null {
  if (!WORDS7_LOOK.on) return null;
  for (const a of W7.acts) {
    if (a.word !== 'culling' || a.side !== 'front' || a.t > 0.9) continue;
    if (Math.hypot(f.x - a.x, f.y - a.y) > 0.35) continue;
    const slide = Math.min(7, Math.round(clamp01((a.t - W7_TIME.cullSweep * 0.5) / 0.2) * 5) + 3);
    return splitOf(sp, slide, a.dx >= 0 ? 1 : -1, `f${a.id}:${sp.img.width}x${sp.img.height}:${sp.ax}`);
  }
  return null;
}

/**
 * The hero as drawn (render.ts, with his picture and where it stands): kept for the mirror that repeats
 * his attack; and what stands with him: his reflection in glass beside him (Mirroring in front), forming
 * over its first 0.08 s and dissolving over its last 0.25.
 */
export function heroW7(sp: Sprite, h: { x: number; y: number; fx: number; fy: number }, cam: Cam): { sp: Sprite; x: number; y: number; depth: number; alpha: number }[] {
  if (!WORDS7_LOOK.on) return [];
  W7.heroSp = sp;
  const out: { sp: Sprite; x: number; y: number; depth: number; alpha: number }[] = [];
  for (const a of W7.acts) {
    if (a.word !== 'mirroring' || a.side !== 'front') continue;
    const [ox, oy] = mirrorOffset(h);
    out.push({ sp: remade(sp, 'glass'), x: wx(cam, h.x + ox, h.y + oy), y: wy(cam, h.x + ox, h.y + oy), depth: h.x + ox + h.y + oy, alpha: 0.86 * clamp01(a.t / 0.08) * clamp01((a.dur - a.t) / 0.25) });
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
    // (Reaping on a monster: its fall played backwards, held on the game's own pictures of it; at the top of it the body is
    // the risen monster's again, and the fallen one is let go)
    if (a.word === 'reaping' && a.side === 'monster' && a.fall) {
      const k = clamp01((a.t - 0.2) / W7_TIME.rise);
      a.fall.t = a.dieT * (1 - k);
      if (k >= 1) {
        const at = fx.fallen.indexOf(a.fall);
        if (at >= 0) fx.fallen.splice(at, 1);
        a.fall = null;
      }
    }
    if (a.t >= a.dur) W7.acts.splice(i, 1);
  }
  // the bleeding: where they walk, a splash every so far (twice as often walking), and one now and then where they stand
  for (const sp of W7.splashes) sp.age += dt;
  while (W7.splashes.length && W7.splashes[0].age > W7_TIME.splash) W7.splashes.shift();
  const bleeders: { id: number; x: number; y: number; hero: boolean }[] = [];
  for (const m of game.monsters) if (!m.dead && ((m as { bleedT?: number }).bleedT ?? 0) > 0) bleeders.push({ id: m.id, x: m.x, y: m.y, hero: false });
  const h = game.hero as { x: number; y: number; heroBleedT?: number };
  if ((h.heroBleedT ?? 0) > 0) bleeders.push({ id: -1, x: h.x, y: h.y, hero: true });
  const now = new Set<number>();
  for (const b of bleeders) {
    now.add(b.id);
    const was = W7.bleeders.get(b.id);
    if (!was) {
      W7.bleeders.set(b.id, { x: b.x, y: b.y, since: 0 });
      continue;
    }
    const moved = Math.hypot(b.x - was.x, b.y - was.y);
    if (moved >= 0.2) {
      // walking: a splash every fifth of a tile, drawn out the way it went
      const ex = (b.x - was.x - (b.y - was.y)) / moved;
      const ey = (b.x - was.x + (b.y - was.y)) / moved;
      const el = Math.hypot(ex, ey) || 1;
      W7.splashes.push({ x: b.x, y: b.y, age: 0, size: 1 + Math.random() * 1.2, seed: Math.floor(Math.random() * 1e5), ex: ex / el, ey: ey / el, hero: b.hero });
      W7.bleeders.set(b.id, { x: b.x, y: b.y, since: -0.4 });
    } else {
      was.since += dt;
      if (was.since >= 0.8) {
        W7.splashes.push({ x: b.x + (Math.random() - 0.5) * 0.25, y: b.y + (Math.random() - 0.5) * 0.25, age: 0, size: 0.8 + Math.random(), seed: Math.floor(Math.random() * 1e5), ex: 1, ey: 0, hero: b.hero });
        was.since = 0;
      }
    }
  }
  for (const id of [...W7.bleeders.keys()]) if (!now.has(id)) W7.bleeders.delete(id);
  if (W7.splashes.length > 80) W7.splashes.splice(0, W7.splashes.length - 80);
  // his gold carried off: when one carrying it dies, it bursts out of it
  for (const m of game.monsters) {
    const stolen = (m as { stolen?: number }).stolen ?? 0;
    if (m.dead && stolen > 0 && !W7.dropped.has(m.id)) {
      W7.dropped.add(m.id);
      playW7('plundering', 'monster', { part: 'drop', x: m.x, y: m.y, dur: 2.05 });
    }
  }
  // a monster with Culling, while he is low: its fire kindles over 0.3 s, and dies down over 0.3 when he is not
  const hero = game.hero as { life?: number; d?: { maxLife?: number } };
  const low = (hero.life ?? 1) / Math.max(1, hero.d?.maxLife ?? 1) < W7_TIME.low;
  for (const m of game.monsters) {
    const culls = !m.dead && ((m.words ?? []) as readonly string[]).includes('culling');
    const was = W7.hot.get(m.id) ?? 0;
    const k = Math.max(0, Math.min(1, was + (culls && low ? dt : -dt) / 0.3));
    if (k > 0) W7.hot.set(m.id, k);
    else W7.hot.delete(m.id);
  }
  // a monster's shot through a wall (Piercing on a monster): where it goes into the stone and where it comes out, a passage of light
  const L = game.level as unknown as { open?: ArrayLike<number>; floor?: { w: number } };
  if (L.open && L.floor) {
    for (const p of game.projectiles as unknown as { x: number; y: number; vx: number; vy: number; hostile: boolean }[]) {
      if (!p.hostile) continue;
      const inWall = L.open[Math.floor(p.y) * L.floor.w + Math.floor(p.x)] !== 1;
      const was = W7.inWall.get(p);
      W7.inWall.set(p, inWall);
      if (was === undefined || was === inWall) continue;
      const sp = Math.hypot(p.vx, p.vy) || 1;
      playW7('piercing', 'monster', { part: 'pass', x: p.x, y: p.y, dx: p.vx / sp, dy: p.vy / sp, dur: 0.7 });
    }
  }
}

// =============================================================================================
// What the rules said happened (main.ts, while WORDS7_LOOK.on): the events of the main chat's branch words7, by the names
// of its board post of 8 Nov 07:55. Everything is read gently: a field missing has a fallback, and an event of another
// shape is passed over.

type Pt = { x: number; y: number } | [number, number] | undefined;
const ptOf = (p: Pt, fx: number, fy: number): [number, number] => (Array.isArray(p) ? [p[0], p[1]] : p ? [p.x, p.y] : [fx, fy]);
type Seen = {
  t: string;
  id?: number;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x0?: number;
  y0?: number;
  from?: Pt;
  to?: Pt;
  width?: number;
  delay?: number;
  secs?: number;
  r?: number;
  ids?: number[];
  target?: number;
  mark?: boolean | { x: number; y: number };
  dodge?: boolean;
  item?: boolean;
  n?: number;
};

export function eventsW7(events: readonly unknown[], game: Game, fx: Fx): void {
  if (!WORDS7_LOOK.on) return;
  const h = game.hero;
  const mon = (id?: number): Monster | undefined => (id === undefined ? undefined : game.monsters.find((m) => m.id === id));
  for (const raw of events) {
    const e = raw as Seen;
    switch (e.t) {
      case 'pierceLine': {
        // a shot or blow through a line: from where it began (or him) to where it ends
        const [x, y] = ptOf(e.from, e.x ?? h.x, e.y ?? h.y);
        const [x1, y1] = ptOf(e.to, e.x1 ?? x + h.fx * 6, e.y1 ?? y + h.fy * 6);
        const L = Math.hypot(x1 - x, y1 - y) || 1;
        const dx = (x1 - x) / L;
        const dy = (y1 - y) / L;
        // those along it, in order, and how far along each stands
        const on = game.monsters
          .filter((m) => !m.dead && (e.ids ? e.ids.includes(m.id) : true))
          .map((m) => ({ m, s: (m.x - x) * dx + (m.y - y) * dy, off: Math.abs(-(m.x - x) * dy + (m.y - y) * dx) }))
          .filter((q) => q.s > 0 && q.s <= L + 0.5 && q.off < 0.7)
          .sort((p, q) => p.s - q.s);
        playW7('piercing', 'front', { x, y, x1, y1, dx, dy, r: L, ids: on.map((q) => q.m.id), pts: on.map((q) => q.s), dur: L / W7_TIME.pierceSpeed + 0.55 });
        break;
      }
      case 'lance': {
        const [x, y] = ptOf(e.from, e.x ?? h.x, e.y ?? h.y);
        const [x1, y1] = ptOf(e.to, e.x1 ?? x, e.y1 ?? y);
        const delay = e.delay ?? W7_TIME.lanceWait;
        const L = Math.hypot(x1 - x, y1 - y) || 1;
        const ids = game.monsters.filter((m) => !m.dead && Math.abs(-(m.x - x) * (y1 - y) + (m.y - y) * (x1 - x)) / L < (e.width ?? 1)).map((m) => m.id);
        playW7('piercing', 'behind', { x, y, x1, y1, delay, width: e.width ?? 1, ids, dur: delay + W7_TIME.lanceFall + W7_TIME.lanceRun + W7_TIME.crack });
        break;
      }
      case 'bleedOn': {
        const m = mon(e.id);
        if (m) playW7('bleeding', 'front', { x: m.x, y: m.y, ids: [m.id], dx: m.x - h.x, dy: m.y - h.y, dur: 0.7 });
        break;
      }
      case 'heroBleed': {
        // (cut by a monster: `id` it, or where it stood)
        const m = mon(e.id);
        const fx0 = m ? m.x : e.x ?? h.x - 1;
        const fy0 = m ? m.y : e.y ?? h.y;
        playW7('bleeding', 'monster', { x: h.x, y: h.y, dx: h.x - fx0, dy: h.y - fy0, dur: 0.65 });
        break;
      }
      case 'reapSoul':
        playW7('reaping', 'front', { x: e.x ?? h.x, y: e.y ?? h.y, dur: 0.15 + W7_TIME.soulFlight + 0.3 });
        break;
      case 'spirit': {
        const m = mon(e.id);
        playW7('reaping', 'behind', { x: e.x ?? m?.x ?? h.x, y: e.y ?? m?.y ?? h.y, ids: e.id !== undefined ? [e.id] : [], dur: e.secs ?? W7_TIME.spirit });
        break;
      }
      case 'spiritHit': {
        const m = mon(e.target);
        playW7('reaping', 'behind', { part: 'hit', x: m?.x ?? e.x ?? h.x, y: m?.y ?? e.y ?? h.y, ids: m ? [m.id] : [], dur: 0.32 });
        break;
      }
      case 'rise': {
        // its body lurches up out of its fall: the fallen nearest where it lies, played back
        const x = e.x ?? mon(e.id)?.x ?? h.x;
        const y = e.y ?? mon(e.id)?.y ?? h.y;
        let best: Fallen | null = null;
        let bd = 0.8;
        for (const f of fx.fallen) {
          const d = Math.hypot(f.x - x, f.y - y);
          if (d < bd) {
            bd = d;
            best = f;
          }
        }
        playW7('reaping', 'monster', { x, y, fall: best, dieT: best ? Math.min(best.t, 1.0) : 0, dur: 0.2 + W7_TIME.rise + 0.4 });
        break;
      }
      case 'culled': {
        const m = mon(e.id);
        const x = e.x ?? m?.x ?? h.x;
        const y = e.y ?? m?.y ?? h.y;
        if (e.mark) {
          // taken by the reaper's mark: where it lies (the mark's place, or the zone nearest it)
          let mx = x;
          let my = y;
          let mr = 1.1;
          if (typeof e.mark === 'object') [mx, my] = [e.mark.x, e.mark.y];
          else {
            let bd = 3;
            for (const raw of game.zones) {
              const z = raw as unknown as ZoneLike;
              if (zoneW7(z) !== 'reaper') continue;
              const d = Math.hypot(z.x - x, z.y - y);
              if (d < bd) {
                bd = d;
                [mx, my, mr] = [z.x, z.y, z.r];
              }
            }
          }
          playW7('culling', 'behind', { part: 'mark', x: mx, y: my, r: Math.min(1.6, mr), x1: x, y1: y, ids: e.id !== undefined ? [e.id] : [], dur: 0.95 });
        } else playW7('culling', 'front', { x, y, ids: e.id !== undefined ? [e.id] : [], dx: x - h.x, dy: y - h.y, dur: 0.95 });
        break;
      }
      case 'cullBlow': {
        const m = mon(e.id);
        if (m) playW7('culling', 'monster', { part: 'blow', x: m.x, y: m.y, ids: [m.id], dur: 0.36 });
        break;
      }
      case 'surge': {
        const m = mon(e.id);
        if (m && e.id !== undefined && e.id >= 0) {
          // a monster's shockwave, in the enemy's colours
          playW7('surging', 'monster', { part: 'wave', x: m.x, y: m.y, ids: [m.id], r: e.r ?? 2.3, dur: W7_TIME.surge * 1.3 });
        } else if (e.dodge) {
          // let out by his dodge, where it began
          const mv = (h as { move?: { x0: number; y0: number } | null }).move;
          const x0 = e.x0 ?? mv?.x0 ?? e.x ?? h.x;
          const y0 = e.y0 ?? mv?.y0 ?? e.y ?? h.y;
          playW7('surging', 'behind', { x: x0, y: y0, x1: h.x, y1: h.y, r: e.r ?? 1.5, dur: 0.6 });
        } else playW7('surging', 'front', { x: e.x ?? h.x, y: e.y ?? h.y, r: e.r ?? 2.2, dur: W7_TIME.surge * 1.3 });
        break;
      }
      case 'surgeWarn': {
        const m = mon(e.id);
        if (m) playW7('surging', 'monster', { part: 'warn', x: m.x, y: m.y, ids: [m.id], r: e.r ?? 2.3, pts: [e.secs ?? W7_TIME.warn], dur: e.secs ?? W7_TIME.warn });
        break;
      }
      case 'goldSpray':
        playW7('plundering', 'front', { x: e.x ?? h.x, y: e.y ?? h.y, pts: [e.item ? 1 : 0], dur: 2.55 });
        break;
      case 'goldBurst':
        playW7('plundering', 'behind', { x: e.x ?? h.x, y: e.y ?? h.y, dur: 1.15 });
        break;
      case 'goldStolen': {
        const m = mon(e.id);
        if (m) playW7('plundering', 'monster', { x: m.x, y: m.y, ids: [m.id], dur: 0.8 });
        break;
      }
      case 'reflection':
        playW7('mirroring', 'front', { x: h.x, y: h.y, dur: e.secs ?? W7_TIME.reflection });
        break;
      case 'mirrorCast': {
        // the pane where it stands (the event's place, or the mirror nearest him) makes his attack again, cracks and shatters
        let x = e.x ?? h.x;
        let y = e.y ?? h.y;
        if (e.x === undefined) {
          let bd = 99;
          for (const raw of game.zones) {
            const z = raw as unknown as ZoneLike;
            if (zoneW7(z) !== 'mirror') continue;
            const d = Math.hypot(z.x - h.x, z.y - h.y);
            if (d < bd) {
              bd = d;
              [x, y] = [z.x, z.y];
            }
          }
        }
        playW7('mirroring', 'behind', { part: 'cast', x, y, dx: h.fx, dy: h.fy, dur: W7_TIME.cast + W7_TIME.breaking + W7_TIME.shatter });
        break;
      }
      case 'mirrorBack': {
        const m = mon(e.id);
        if (m) playW7('mirroring', 'monster', { x: m.x, y: m.y, ids: [m.id], dur: 0.47 });
        break;
      }
    }
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
    beats: W7_BEATS,
    clear: () => {
      clearW7();
      joinedLevel = getGame()?.level ?? null;
    },
    /** A word's rune stone as a picture (for the sheet): its PNG, as a data URL. */
    runePng: (word: W7Word): string => w7Rune(word).img.toDataURL('image/png'),
    /** A look begins (a fallen body given by its place in fx.fallen). */
    play: (word: W7Word, side: W7Side, o: W7Options & { fallAt?: number }): number => {
      const f = o.fallAt !== undefined ? fx.fallen[o.fallAt] ?? null : o.fall ?? null;
      return playW7(word, side, { ...o, fall: f }).id;
    },
    /** What the rules will one day say happened: their events, as they are sent. */
    send: (...events: unknown[]) => eventsW7(events, G(), fx),
    /** A zone of the rules' laid by hand ('thorns', 'reaper', 'mirror'): a patch that hurts nothing, carrying its look. */
    lay: (look: W7Zone, x: number, y: number, r: number, secs = 9999) => {
      // (of its own kind, as the rules' will be: the rules here pass over a kind they do not know but to cut what stands in it now
      // and then, which the thorns do; the mark and the mirror do not)
      G().zones.push({ x, y, r, t: 0, dur: secs, kind: look, element: 'phys', dmg: 0, slow: 0, tick: look === 'thorns' ? 0.5 : 1e9, hostile: false, skill: -1, words: [], from: '', look } as unknown as Game['zones'][number]);
    },
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
