// THE NEW WORDS AT WORK (since Version 19.3, four of them in the game: see WORDS3, and events3 at
// the foot of this file; the rest of what follows was the mock-up). The owner chose eight new words on 8 Oct 2026
// at 12:26 ("Let the other agent know which words I’ve chosen and to add them to the game", 12:27):
// Pulling, Splitting, Heavy, Precise, Hexing, Stilling, Frenzied and Guarding. Their rules are the
// words chat's to write; this is how each one LOOKS at work, in front (on the hit) and behind (what
// it leaves), drawn by the art chat for pictures to go to him first (docs/requests/new_words_art.md).
//
// Everything here takes only where, how big and how far along: no game rules. The renderer calls
// it only while WORDS3.on, which is false: with it off, the game draws exactly as before. The
// playtest tools/scenarios/words3.mjs switches it on for its own page and plays the words by
// hand (`demo3`, at the foot of this file), moving monsters as the rules one day will.

import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { GLYPH } from '../art/icons';
import { P } from '../art/palette';
import { hash2 } from '../engine/rng';
import type { Game } from '../game/game';
import type { Bomb, GameEvent, Monster } from '../game/state';
import type { Cam, Fx } from './fx';
import { pline, wx, wy } from './fx';

/**
 * The switch. Off: nothing here is drawn or called, and the game is as it was. ON SINCE VERSION
 * 19.3, for the four of the eight that are in the game (Heavy, Precise, Frenzied, Guarding: their
 * looks called up by the rules, `events3`), on the owner's yes to pictures of them at work in the
 * game (8 Oct 2026, 18:23: "Yes, as they are (Recommended)"). The other four are not in the game:
 * their looks are still the demo's, for the playtest's page alone.
 */
export const WORDS3 = { on: true };

/**
 * The eight he chose at 12:26, and MYSTICAL: his own word, 8 Oct 2026, 10:54: "I’d like to add a
 * word MYSTICAL, which increases spell damage in the same vein as PHYSICAL for attack damage" (and
 * 10:58: "Sorry keep power’s name the same.  I meant power"). The main chat writes its rules (a
 * damage word for spells, as Power is for attacks, growing with Intelligence); its colour and rune
 * are drawn here by the art chat, behind the same switch, pictures to him first.
 */
export type NewWord = 'pulling' | 'splitting' | 'heavy' | 'precise' | 'hexing' | 'stilling' | 'frenzied' | 'guarding' | 'mystical';
export const NEW_WORDS: readonly NewWord[] = ['pulling', 'splitting', 'heavy', 'precise', 'hexing', 'stilling', 'frenzied', 'guarding', 'mystical'];

/**
 * Each word's colours, darkest to brightest (the last is its white-hot). Index 3 is the word's
 * own colour (WORD_COLOR, WORD_HUE), index 4 its glow (WORD_GLOW). Chosen to be told apart from the
 * nine words' colours and from the friend's cyan and the enemy's pink and gold (the note says how).
 * Mystical's is the pale blue of moonlight: of all the colours bright enough to read on the game's
 * deep blue, the one furthest from every word's, from the friend's cyan and the enemy's pink and
 * gold, from the purple the game draws arcane magic in (the spells it will most often ride on) and
 * from the blue of a magic item's name (tests/words3.test.ts measures it). The open magentas were
 * further still from the words, but are the enemy's hot pink to the eye.
 */
export const NEW_RAMP: Record<NewWord, readonly string[]> = {
  pulling: ['#16123e', '#2a2672', '#4844ae', '#7a76e0', '#c4c2ff', '#f4f2ff'],
  splitting: ['#2e1844', '#5a347c', '#9466c0', '#dcaaf6', '#f2dcff', '#ffffff'],
  heavy: ['#22140a', '#462c16', '#76522c', '#ac8753', '#e0c08c', '#fff2dc'],
  precise: ['#262c3a', '#4e5870', '#94a2bc', '#eef4fa', '#ffffff', '#ffffff'],
  hexing: ['#14101c', '#2c2436', '#5c566c', '#b8b4c8', '#e6e2ee', '#ffffff'],
  stilling: ['#0c3024', '#1a5e46', '#3ea27a', '#86eaae', '#d0fce4', '#ffffff'],
  frenzied: ['#380a06', '#7c1a0c', '#c03616', '#ff5c33', '#ff9670', '#fff0e8'],
  guarding: ['#0a2a1c', '#124e32', '#1e8048', '#30a868', '#8ae4ac', '#eafff2'],
  mystical: ['#141a3e', '#283672', '#5262b4', '#acbcfe', '#e2e8ff', '#ffffff'],
};
export const NEW_COLOR = Object.fromEntries(NEW_WORDS.map((w) => [w, NEW_RAMP[w][3]])) as Record<NewWord, string>;
export const NEW_GLOW = Object.fromEntries(NEW_WORDS.map((w) => [w, NEW_RAMP[w][4]])) as Record<NewWord, string>;

/**
 * The words' glyphs, cut in the rune stone as the nine are (art/icons.ts, GLYPH): 6x6, or 7x7 for
 * one with a middle pixel. 'X' = the word's colour, 'o' = its glowing core.
 */
export const NEW_GLYPH: Record<NewWord, readonly string[]> = {
  // a whirl drawn in to its middle
  pulling: ['.XXXX..', 'X....X.', 'X.XX..X', 'X.Xo..X', 'X..XXX.', '.X.....', '..XXXX.'],
  // one stroke that forks into three
  splitting: ['X..X..X', '.X.X.X.', '..XXX..', '...o...', '...X...', '...X...', '...X...'],
  // a weight with a ring to lift it by
  heavy: ['..XX..', '.X..X.', '.XXXX.', 'XXXXXX', 'XXooXX', 'XXXXXX'],
  // the sight of a bow: four ticks round a point
  precise: ['...X...', '...X...', '.......', 'XX.o.XX', '.......', '...X...', '...X...'],
  // an eye that weeps a hook
  hexing: ['..XXX..', '.X...X.', 'X..o..X', '.X...X.', '..XXX..', '...X...', '..X....'],
  // an hourglass
  stilling: ['XXXXXX', '.X..X.', '..oo..', '..oo..', '.X..X.', 'XXXXXX'],
  // three claw marks
  frenzied: ['X..X..', 'X..X..', '.X..X.', '.X..X.', '..X..X', '..o..o'],
  // a shield
  guarding: ['XXXXXX', 'X.oo.X', 'X.oo.X', 'X....X', '.X..X.', '..XX..'],
  // a crescent moon and a star
  mystical: ['...XX..', '..XX.o.', '.XXX...', '.XXX...', '.XXX...', '..XXX..', '...XXX.'],
};

// =============================================================================================
// What is going on: the marks on monsters, what lies on the floor, the frenzy on the hero.

/** What a word has left on the floor. */
interface Patch {
  kind: 'vortex' | 'cracks' | 'hex' | 'shards' | 'bubble' | 'ward';
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  seed: number;
  /** Cracks: the lines of them, world offsets from the middle, x0, y0, x1, y1 ... (the first of each is a spoke). */
  lines?: number[][];
  /** Shards: where each one came to rest, world offsets from the middle, x, y ... */
  pts?: number[];
}

/** What a word has done to one monster, in seconds left (or since). */
interface Marked {
  stun: number;
  /** How long it has been stunned for in all (the pips come in, then turn). */
  stun0: number;
  hex: number;
  hex0: number;
  /** A flare of its sigil when a cursed monster is struck. */
  flare: number;
  /** The stagger: seconds since it began (-1: none), and the way it was knocked, on screen. */
  stag: number;
  sx: number;
  sy: number;
  /** The cracked ground that last staggered it (it staggers once for each patch it walks into). */
  cracked: number;
  /** Precise behind: the sight on it (seconds left, seconds since it came), and the moment it snaps shut on the critical hit. */
  aim: number;
  aim0: number;
  shut: number;
  /** Stilling: seconds of slowed time left, and since it began. */
  still: number;
  still0: number;
}

/** Splitting: one of the three smaller copies an attack breaks into, flying on (the rules make the real ones). */
interface Copy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  t: number;
  dur: number;
}

/** Precise: the needle of light through what it hits, and the star where it hits; `crit`: the star of a certain critical. */
interface Pin {
  x: number;
  y: number;
  dx: number;
  dy: number;
  t: number;
  dur: number;
  crit: boolean;
}

interface Drag {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  dur: number;
}

/** A thing that flies from one place to another and is gone (a frenzy fed by a kill). */
interface Flight {
  x0: number;
  y0: number;
  t: number;
  dur: number;
  bend: number;
}

/** The sigil of a hex coming down on its monster. */
interface Snap {
  id: number;
  t: number;
  dur: number;
}

/** Mystical in front: a crescent of moonlight sweeping round what a spell struck (`a0`: where its head starts, `dir`: which way round). */
interface Sweep {
  x: number;
  y: number;
  t: number;
  dur: number;
  a0: number;
  dir: number;
}

/** Mystical in front: a line of a constellation from what a spell struck to what its splash struck. */
interface Link {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  dur: number;
}

export const W3 = {
  patches: [] as Patch[],
  marks: new Map<number, Marked>(),
  drags: [] as Drag[],
  flights: [] as Flight[],
  snaps: [] as Snap[],
  later: [] as { t: number; fn: () => void }[],
  /** Frenzied: stacks held (0 to 5), seconds they have left, seconds since the last was gained. */
  frenzy: { n: 0, t: 0, since: 9 },
  copies: [] as Copy[],
  pins: [] as Pin[],
  /** Where each slowed monster has just been (Stilling's echoes of it), newest last. */
  trails: new Map<number, { x: number; y: number }[]>(),
  /** Guarding: the shield on the hero (seconds left, and how long it was given), and the last blow it turned (seconds since, and from where). */
  guard: { t: 0, dur: 0, struck: 9, fx: 0, fy: 0 },
  /** Mystical in front: crescents sweeping round what spells struck, and the lines of their splash. */
  sweeps: [] as Sweep[],
  links: [] as Link[],
  /**
   * Mystical behind: the stacks the hero holds (0 to 5, as the rules say), how many the moon at their
   * shoulder shows (it waxes as each star reaches it), seconds they have left, seconds since the moon
   * last grew; and the stars flying to it from what was struck.
   */
  mystic: { n: 0, shown: 0, t: 0, since: 9 },
  stars: [] as Flight[],
  /** The clock these are drawn by (game seconds), and its last step (what is given off is given off at so many a second, not so many a frame). */
  clock: 0,
  dt: 0,
  /** The demo: the words the hero's attacks are taken to carry, in front and behind (`demo3`). */
  front: [] as NewWord[],
  behind: [] as NewWord[],
  /** The demo is listening (a playtest's page): only then does `tick3` do the rules' share by hand. */
  demo: false,
  /** The demo: the hero's spells are taken to strike one enemy each (Mystical's splash goes from their hits). */
  single: false,
};

const MAX_PARTICLES = 900;
const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
const pick = (list: readonly string[]): string => list[Math.floor(Math.random() * list.length)];

function markOf(id: number): Marked {
  let m = W3.marks.get(id);
  if (!m) {
    m = { stun: 0, stun0: 0, hex: 0, hex0: 0, flare: 0, stag: -1, sx: 0, sy: 0, cracked: -1, aim: 0, aim0: 0, shut: 0, still: 0, still0: 0 };
    W3.marks.set(id, m);
  }
  return m;
}

/** Forget everything (a new level, or the demo starts again). */
export function clear3(): void {
  W3.patches.length = 0;
  W3.marks.clear();
  W3.drags.length = 0;
  W3.flights.length = 0;
  W3.snaps.length = 0;
  W3.later.length = 0;
  W3.frenzy.n = 0;
  W3.frenzy.t = 0;
  W3.frenzy.since = 9;
  W3.copies.length = 0;
  W3.pins.length = 0;
  W3.trails.clear();
  W3.guard.t = 0;
  W3.guard.dur = 0;
  W3.guard.struck = 9;
  W3.sweeps.length = 0;
  W3.links.length = 0;
  W3.mystic.n = 0;
  W3.mystic.shown = 0;
  W3.mystic.t = 0;
  W3.mystic.since = 9;
  W3.stars.length = 0;
  mysticNote = null;
}

// =============================================================================================
// Bits the effects are made of, put into the effects' own lists (fx.ts draws them).

type P3 = Fx['particles'][number];
function add(fx: Fx, p: P3): void {
  if (fx.particles.length < MAX_PARTICLES) fx.particles.push(p);
}

/** Lines that fly: along (dx, dy) if given, otherwise straight out from (x, y). */
function streaks(fx: Fx, x: number, y: number, n: number, colors: readonly string[], speed: number, len: number, o: { dx?: number; dy?: number; spread?: number; z?: number; up?: number; grav?: number; life?: number; r?: number } = {}): void {
  const base = o.dx !== undefined && o.dy !== undefined ? Math.atan2(o.dy, o.dx) : null;
  for (let i = 0; i < n; i++) {
    const a = base === null ? Math.random() * Math.PI * 2 : base + rnd(-1, 1) * (o.spread ?? 0.4);
    const s = rnd(0.6, 1) * speed;
    const d = rnd(0, o.r ?? 0.2);
    add(fx, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: (o.z ?? 9) + rnd(-3, 3), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(0.3, 1) * (o.up ?? 0), life: rnd(0.6, 1) * (o.life ?? 0.22), color: pick(colors), size: 1, grav: o.grav ?? 0, streak: len });
  }
}

/** Dust: big soft grains that roll out low over the floor and settle (Heavy). */
const DUST: readonly string[] = ['#a89a86', '#8a7c6a', '#6a5e50', '#4a4038'];
function dust(fx: Fx, x: number, y: number, n: number, speed: number, r = 0.2): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rnd(0.45, 1) * speed;
    const life = rnd(0.4, 0.7);
    add(fx, { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r, z: rnd(0.5, 2.5), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(4, 12), life, life0: life, ramp: DUST, color: DUST[1], size: Math.random() < 0.5 ? 3 : 2, grav: 30 });
  }
}

/** Grit kicked up from broken ground. */
function grit(fx: Fx, x: number, y: number, n: number): void {
  const H = NEW_RAMP.heavy;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rnd(0.4, 1.6);
    add(fx, { x: x + rnd(-0.15, 0.15), y: y + rnd(-0.15, 0.15), z: 1, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(40, 90), life: rnd(0.3, 0.55), color: pick([H[1], H[2], '#5e5244', H[3]]), size: Math.random() < 0.3 ? 2 : 1, grav: 380 });
  }
}

// =============================================================================================
// IN FRONT: the hit.

/**
 * PULLING, on the hit at (x, y): what it hits is hauled in toward the point (the rules move them;
 * `demo3` does it for the pictures). A ring closes on the point, streaks are drawn in from all
 * round, and the middle goes dark for an instant, then lets go with a pale flash.
 */
export function pullHit(fx: Fx, x: number, y: number, r: number): void {
  const C = NEW_RAMP.pulling;
  fx.rings.push({ x, y, r: r * 1.05, t: 0, dur: 0.28, colors: [C[3], C[4], C[5]], fill: false, heavy: true, closing: true });
  fx.rings.push({ x, y, r: r * 0.8, t: 0, dur: 0.26, colors: [C[2], C[3], C[4]], fill: false, closing: true, swirl: true, delay: 0.05 });
  // streaks from round the edge, flying in to the middle (they live as long as the flight takes)
  const n = Math.min(26, Math.round(10 + r * 6));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd(-0.15, 0.15);
    const d = r * rnd(0.75, 1.15);
    const sp = d / rnd(0.18, 0.26);
    add(fx, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: rnd(3, 12), vx: -Math.cos(a) * sp, vy: -Math.sin(a) * sp, vz: 0, life: (d * 0.92) / sp, color: pick([C[3], C[4], C[4], C[5]]), size: 1, grav: 0, streak: 6 });
  }
  W3.patches.push({ kind: 'vortex', x, y, r: Math.min(0.9, r * 0.45), t: 0, dur: 0.34, seed: Math.floor(Math.random() * 1e6) });
  W3.later.push({
    t: 0.24,
    fn: () => {
      fx.flashes.push({ x, y, z: 6, r: 0.5, t: 0, dur: 0.12, colors: [C[5], C[4], C[3]] });
      streaks(fx, x, y, 8, [C[4], C[5]], 3, 3, { z: 6, life: 0.2 });
    },
  });
  if (fx.glows.length < 24) fx.glows.push({ x, y, r: 30 + r * 14, t: 0, dur: 0.35 });
}

/**
 * HEAVY, on the hit at (x, y): everything holds for a tenth of a second (Movement 7 of the art
 * rulebook: "Heavy blows land with a freeze"), a low ring of shock runs out along the floor, dust
 * rolls out behind it, stone is thrown up, short cracks open in the word's bronze, and the screen
 * kicks. `big`: an area ability's (cracks out to its edge); otherwise the knock of one hit.
 */
export function heavyHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = NEW_RAMP.heavy;
  // (through the effects' own hold, which keeps quick blows from making the game stutter)
  fx.hold(0.1);
  fx.shake = Math.max(fx.shake, big ? 6 : 4.5);
  const rr = big ? r : Math.max(0.9, r);
  fx.rings.push({ x, y, r: rr * 1.15, t: 0, dur: 0.3, colors: [C[5], C[4], C[3], C[2]], fill: false, heavy: true });
  fx.rings.push({ x, y, r: rr * 1.5, t: 0, dur: 0.42, colors: [DUST[0], DUST[1], DUST[2]], fill: false, delay: 0.05 });
  fx.flashes.push({ x, y, z: 3, r: big ? 0.9 : 0.6, t: 0, dur: 0.1, colors: [C[5], C[4], C[3]] });
  // (the dust bursts out once the freeze lets go: the freeze is the instant of the blow)
  W3.later.push({ t: 0.02, fn: () => dust(fx, x, y, big ? 20 : 12, big ? 3.8 : 3, 0.25) });
  // stone thrown up: it falls fast
  for (let i = 0; i < (big ? 14 : 8); i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rnd(1, big ? 3.6 : 2.6);
    add(fx, { x: x + Math.cos(a) * 0.15, y: y + Math.sin(a) * 0.15, z: 1, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(90, 170), life: rnd(0.4, 0.7), color: pick(['#8a7862', '#5e5244', C[2], C[3]]), size: Math.random() < 0.5 ? 3 : 2, grav: 520 });
  }
  W3.patches.push(cracks(x, y, big ? rr : rr * 0.85, big ? 1.6 : 1.1, big));
  if (fx.glows.length < 24) fx.glows.push({ x, y, r: 34 + rr * 16, t: 0, dur: 0.3 });
}

/**
 * HEXING, on the hit: the curse comes down on what it struck. Six signs close in round it and
 * become the sigil that hangs over its head; ash falls from it.
 */
export function hexHit(fx: Fx, m: Monster, dur = 6): void {
  const C = NEW_RAMP.hexing;
  W3.snaps.push({ id: m.id, t: 0, dur: 0.3 });
  const k = markOf(m.id);
  k.hex = Math.max(k.hex, dur);
  k.hex0 = 0;
  fx.flashes.push({ x: m.x, y: m.y, z: 14, r: 0.38, t: 0, dur: 0.12, colors: [C[5], C[4], C[3]] });
  for (let i = 0; i < 10; i++) add(fx, { x: m.x + rnd(-0.3, 0.3), y: m.y + rnd(-0.3, 0.3), z: rnd(20, 30), vx: rnd(-0.2, 0.2), vy: rnd(-0.2, 0.2), vz: rnd(-30, -14), life: rnd(0.5, 0.9), color: pick([C[3], C[4], C[2]]), size: 1, grav: 0 });
}

/** A cursed monster is struck: its sigil flares and ash bursts from it. */
export function hexFlare(fx: Fx, m: Monster): void {
  const k = W3.marks.get(m.id);
  if (!k || k.hex <= 0) return;
  k.flare = 0.22;
  const C = NEW_RAMP.hexing;
  streaks(fx, m.x, m.y, 6, [C[4], C[5], C[3]], 2.4, 3, { z: 14, life: 0.22 });
}

/**
 * FRENZIED, on each use: the frenzy grows by one, up to five. A ring beats out from the hero's feet
 * and sparks are thrown back off them; the ring of five at their feet lights one more.
 */
export function frenzyHit(fx: Fx, hx: number, hy: number, dx: number, dy: number): void {
  const C = NEW_RAMP.frenzied;
  const f = W3.frenzy;
  f.n = Math.min(5, f.n + 1);
  f.t = 4;
  f.since = 0;
  fx.rings.push({ x: hx, y: hy, r: 0.75 + f.n * 0.05, t: 0, dur: 0.2, colors: [C[4], C[3], C[2]], fill: f.n >= 5, heavy: f.n >= 3 });
  streaks(fx, hx, hy, 4 + f.n * 2, [C[3], C[4], C[5]], 3.2, 4, { dx: -dx, dy: -dy, spread: 0.9, z: 10, life: 0.2, r: 0.3 });
}

/** FRENZIED behind: a kill keeps the frenzy going. A spark of it leaps from the fallen to the hero. */
export function frenzyFed(x: number, y: number): void {
  W3.flights.push({ x0: x, y0: y, t: 0, dur: 0.38, bend: Math.random() < 0.5 ? -0.8 : 0.8 });
}

/** How far a Splitting copy flies, in tiles, and for how long (a guess for the pictures: the rules will say). */
const SPLIT_REACH = 3.2;
const SPLIT_TIME = 0.36;

/**
 * SPLITTING, on its first hit at (x, y), going along (dx, dy): the attack cracks like a crystal
 * and breaks into three smaller copies that fly on, fanned out (the rules make the real copies; for
 * the pictures, `copies` draws three). Splinters fall where it broke.
 */
export function splitHit(fx: Fx, x: number, y: number, dx: number, dy: number, copies = true): void {
  const C = NEW_RAMP.splitting;
  const len = Math.hypot(dx, dy) || 1;
  const a0 = Math.atan2(dy / len, dx / len);
  fx.flashes.push({ x, y, z: 10, r: 0.42, t: 0, dur: 0.1, colors: [C[5], C[4], C[3]] });
  fx.rings.push({ x, y, r: 0.55, t: 0, dur: 0.16, colors: [C[5], C[4], C[3]], fill: false, double: true });
  for (let i = 0; i < 7; i++) {
    const a = a0 + rnd(-1.4, 1.4);
    const s = rnd(1.2, 2.6);
    add(fx, { x, y, z: rnd(8, 13), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(30, 70), life: rnd(0.35, 0.55), color: pick([C[3], C[4], C[5]]), size: 1, grav: 300, streak: 2 });
  }
  if (!copies) return;
  for (const k of [-1, 0, 1]) {
    const a = a0 + k * 0.42;
    W3.copies.push({ x, y, vx: (Math.cos(a) * SPLIT_REACH) / SPLIT_TIME, vy: (Math.sin(a) * SPLIT_REACH) / SPLIT_TIME, t: 0, dur: SPLIT_TIME * (k === 0 ? 1 : 0.9) });
  }
}

/** SPLITTING behind: where it ends, shards scatter in every direction and lie glinting a moment. */
export function shards(fx: Fx, x: number, y: number, r = 1.1): void {
  const C = NEW_RAMP.splitting;
  const seed = Math.floor(Math.random() * 1e6);
  const n = 9;
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (hash2(seed, i, 1) - 0.5) * 0.5;
    const d = r * (0.45 + hash2(seed, i, 2) * 0.55);
    pts.push(Math.cos(a) * d, Math.sin(a) * d);
    // each flies out to where it will lie: up, over and down
    const life = 0.3;
    add(fx, { x, y, z: 6, vx: (Math.cos(a) * d) / life, vy: (Math.sin(a) * d) / life, vz: 55, life, color: pick([C[4], C[5], C[3]]), size: 1, grav: 360, streak: 3 });
  }
  fx.flashes.push({ x, y, z: 6, r: 0.3, t: 0, dur: 0.08, colors: [C[5], C[4]] });
  W3.patches.push({ kind: 'shards', x, y, r, t: 0, dur: 1.7, seed, pts });
}

/**
 * PRECISE, on the hit at (x, y), from the way (dx, dy): narrow and exact. A needle of white light
 * through the point, a small star with long thin rays where it struck, a tight ring. No dust, no
 * kick: the opposite of Heavy.
 */
export function preciseHit(fx: Fx, x: number, y: number, dx: number, dy: number): void {
  const C = NEW_RAMP.precise;
  const len = Math.hypot(dx, dy) || 1;
  W3.pins.push({ x, y, dx: dx / len, dy: dy / len, t: 0, dur: 0.16, crit: false });
  fx.rings.push({ x, y, r: 0.32, t: 0, dur: 0.14, colors: [C[5], C[3], C[2]], fill: false });
  streaks(fx, x, y, 4, [C[4], C[3]], 2.2, 2, { dx: dx / len, dy: dy / len, spread: 0.25, z: 11, life: 0.12 });
}

/** PRECISE behind: a sight closes on the enemy it marks; the next hit on it will be a certain critical. */
export function preciseMark(m: Monster, secs = 5): void {
  const k = markOf(m.id);
  k.aim = secs;
  k.aim0 = 0;
}

/** The marked enemy is struck: the sight snaps shut on it and a critical star bursts. */
export function preciseCrit(fx: Fx, m: Monster, dx = 1, dy = 0): void {
  const C = NEW_RAMP.precise;
  const k = markOf(m.id);
  k.aim = 0;
  k.shut = 0.2;
  const len = Math.hypot(dx, dy) || 1;
  W3.pins.push({ x: m.x, y: m.y, dx: dx / len, dy: dy / len, t: 0, dur: 0.26, crit: true });
  fx.flashes.push({ x: m.x, y: m.y, z: 13, r: 0.55, t: 0, dur: 0.12, colors: [C[5], C[4], C[3]] });
  fx.rings.push({ x: m.x, y: m.y, r: 0.7, t: 0, dur: 0.2, colors: [C[5], C[4], C[3]], fill: false, heavy: true });
  streaks(fx, m.x, m.y, 10, [C[4], C[5]], 3.5, 3, { z: 13, life: 0.16 });
  if (fx.glows.length < 24) fx.glows.push({ x: m.x, y: m.y, r: 36, t: 0, dur: 0.2 });
}

/**
 * STILLING, on the hit: time slows for what it struck. A ripple runs out from its feet as from a
 * drop in still water; a ring of ticks like a clock's face stands round its feet, its hand creeping;
 * it is tinged the word's mint, and as it moves, the moments it has just left linger after it.
 */
export function stillHit(fx: Fx, m: Monster, secs = 3): void {
  const C = NEW_RAMP.stilling;
  const k = markOf(m.id);
  if (k.still <= 0) k.still0 = 0;
  k.still = Math.max(k.still, secs);
  fx.rings.push({ x: m.x, y: m.y, r: 1.1, t: 0, dur: 0.6, colors: [C[4], C[3], C[2]], fill: false });
  fx.rings.push({ x: m.x, y: m.y, r: 0.8, t: 0, dur: 0.6, colors: [C[4], C[3], C[2]], fill: false, delay: 0.16 });
  fx.flashes.push({ x: m.x, y: m.y, z: 12, r: 0.32, t: 0, dur: 0.12, colors: [C[5], C[4], C[3]] });
}

/**
 * GUARDING, on use: a brief shield on the hero, a shell of the word's emerald round them, lit from
 * the upper left; it snaps on with a ring at their feet.
 */
export function guardOn(fx: Fx, hx: number, hy: number, secs = 2.2): void {
  const C = NEW_RAMP.guarding;
  W3.guard.t = secs;
  W3.guard.dur = secs;
  fx.rings.push({ x: hx, y: hy, r: 0.8, t: 0, dur: 0.22, colors: [C[5], C[4], C[3]], fill: false, heavy: true });
}

/** A blow from (fromX, fromY) is turned by the shield, or softened by a ward: the side it struck flares and sparks fly off. */
export function guardStruck(fx: Fx, hx: number, hy: number, fromX: number, fromY: number): void {
  const C = NEW_RAMP.guarding;
  const dx = fromX - hx;
  const dy = fromY - hy;
  const len = Math.hypot(dx, dy) || 1;
  W3.guard.struck = 0;
  W3.guard.fx = dx / len;
  W3.guard.fy = dy / len;
  streaks(fx, hx + (dx / len) * 0.35, hy + (dy / len) * 0.35, 9, [C[4], C[5], C[3]], 3, 3, { dx: dx / len, dy: dy / len, spread: 1.1, z: 14, life: 0.2 });
}

/**
 * MYSTICAL, on a spell's hit at (x, y): a bigger hit, in moonlight. A crescent of it sweeps round
 * the struck (the word's rune is a crescent moon), with a flash and a soft ring, and stardust is
 * thrown up that drifts and dims.
 */
export function mysticHit(fx: Fx, x: number, y: number): void {
  const C = NEW_RAMP.mystical;
  W3.sweeps.push({ x, y, t: 0, dur: 0.3, a0: rnd(0, Math.PI * 2), dir: Math.random() < 0.5 ? -1 : 1 });
  fx.flashes.push({ x, y, z: 12, r: 0.46, t: 0, dur: 0.1, colors: [C[5], C[4], C[3]] });
  fx.rings.push({ x, y, r: 0.8, t: 0, dur: 0.24, colors: [C[5], C[4], C[3], C[2]], fill: false });
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rnd(0.4, 1.3);
    const life = rnd(0.5, 0.9);
    add(fx, { x: x + Math.cos(a) * 0.15, y: y + Math.sin(a) * 0.15, z: rnd(8, 16), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(10, 35), life, life0: life, ramp: [C[5], C[4], C[3], C[2]], color: C[4], size: i % 4 === 0 ? 2 : 1, grav: -6 });
  }
  if (fx.glows.length < 24) fx.glows.push({ x, y, r: 30, t: 0, dur: 0.3 });
}

/**
 * MYSTICAL, the splash of a spell that strikes one enemy (the main chat's page: "single-target
 * spells splash nearby enemies"): lines of a constellation run out from the struck to each enemy the
 * splash reaches, a star at each end, and each of them is struck with a small burst of moonlight.
 */
export function mysticSplash(fx: Fx, x: number, y: number, to: readonly { x: number; y: number }[]): void {
  const C = NEW_RAMP.mystical;
  for (const p of to) {
    W3.links.push({ x0: x, y0: y, x1: p.x, y1: p.y, t: 0, dur: 0.45 });
    // (it reaches them as its line does)
    W3.later.push({
      t: 0.07,
      fn: () => {
        fx.flashes.push({ x: p.x, y: p.y, z: 12, r: 0.28, t: 0, dur: 0.08, colors: [C[5], C[4], C[3]] });
        streaks(fx, p.x, p.y, 5, [C[4], C[5], C[3]], 1.6, 2, { z: 12, life: 0.2 });
      },
    });
  }
}

// =============================================================================================
// VOLATILE'S HIDDEN BOMB (WORDS4; drawn by this chat after the art chat's way here, Volatile's own
// colour and rune: pictures to him first). Its burst is Volatile's blast as the game has it.

/** Volatile's colours: deep to white (its word colour is P.pu4). */
const VOLATILE_RAMP: readonly string[] = ['#0a0612', P.pu2, P.pu3, P.pu4, P.pu5, P.white];

/** A charge is stuck on a monster at (x, y): a spark of Volatile's violet where it bites in. */
export function bombStuck(fx: Fx, x: number, y: number): void {
  const C = VOLATILE_RAMP;
  fx.flashes.push({ x, y, z: 10, r: 0.24, t: 0, dur: 0.08, colors: [C[5], C[4], C[3]] });
  streaks(fx, x, y, 5, [C[4], C[5], C[3]], 1.4, 2, { z: 10, life: 0.16 });
}

/**
 * The charge on its monster (or where it fell, if the monster died first): Volatile's rune, small,
 * dark-edged, stuck on the body; its heart beats violet, faster and faster as the burst comes, and
 * sparks crackle off it; in its last moment it burns white.
 */
function drawBomb(g: CanvasRenderingContext2D, cam: Cam, game: Game, b: Bomb, t: number, fx: Fx): void {
  const C = VOLATILE_RAMP;
  const m = game.monsters.find((q) => q.id === b.id && !q.dead);
  const sx = Math.round(wx(cam, b.x, b.y)) + (m ? shift3(m, t)[0] : 0);
  const base = Math.round(wy(cam, b.x, b.y)) + (m ? shift3(m, t)[1] : 0);
  // (on the body, a little above its middle; on the floor if what carried it has fallen)
  const cy = m ? base - Math.round(FIGURE_SIZE[figureOf(m)].top * 0.55) : base - 3;
  const left = Math.max(0, b.t);
  const k = 1 - left / Math.max(0.01, b.dur);
  // (the beat: slow at first, quickening to a flicker; white at the very end)
  const rate = 3 + 22 * k * k;
  const on = Math.sin(t * Math.PI * 2 * rate) > 0;
  const hot = left < 0.22;
  const rows = GLYPH.volatile;
  const n = rows.length;
  const x0 = sx - Math.floor(n / 2);
  const y0 = cy - Math.floor(n / 2);
  g.fillStyle = C[0];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] === '.') continue;
      g.fillRect(x0 + c - 1, y0 + r, 3, 1);
      g.fillRect(x0 + c, y0 + r - 1, 1, 3);
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === '.') continue;
      g.fillStyle = hot ? C[5] : ch === 'o' ? (on ? C[5] : C[4]) : r < 2 ? C[4] : C[3];
      g.fillRect(x0 + c, y0 + r, 1, 1);
    }
  }
  // each beat throws a ring out from it, quicker as the burst comes (a ticking charge, read at a glance)
  const beat = (t * rate) % 1;
  const rr = 3 + beat * 6;
  g.globalAlpha = (1 - beat) * (hot ? 1 : 0.85);
  g.fillStyle = hot ? C[5] : C[4];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    g.fillRect(Math.round(sx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr * 0.6), 1, 1);
  }
  g.globalAlpha = 1;
  // sparks crackle off it, more as it nears its burst (so many a second, not so many a frame)
  if (Math.random() < (4 + 30 * k) * W3.dt * fx.room()) {
    const a = Math.random() * Math.PI * 2;
    const len = 2 + Math.round(Math.random() * 3);
    g.fillStyle = Math.random() < 0.5 ? C[5] : C[4];
    for (let i = 1; i <= len; i++) g.fillRect(Math.round(sx + Math.cos(a) * (3 + i)), Math.round(cy + Math.sin(a) * (2 + i * 0.7)), 1, 1);
  }
}

// =============================================================================================
// BEHIND: what is left.

/** PULLING behind: a vortex at (x, y) that keeps pulling. */
export function vortex(x: number, y: number, r: number, dur = 3.5): void {
  W3.patches.push({ kind: 'vortex', x, y, r, t: 0, dur, seed: Math.floor(Math.random() * 1e6) });
}

/** HEAVY behind: cracked ground at (x, y) that staggers what steps in it. */
export function crackedGround(x: number, y: number, r: number, dur = 4): void {
  W3.patches.push(cracks(x, y, r, dur, true));
}

/** HEXING behind: a hex circle at (x, y) that weakens what stands in it. */
export function hexCircle(x: number, y: number, r: number, dur = 4.5): void {
  W3.patches.push({ kind: 'hex', x, y, r, t: 0, dur, seed: Math.floor(Math.random() * 1e6) });
}

/** STILLING behind: a bubble at (x, y) where enemies and their shots crawl. */
export function bubble(x: number, y: number, r: number, dur = 4): void {
  W3.patches.push({ kind: 'bubble', x, y, r, t: 0, dur, seed: Math.floor(Math.random() * 1e6) });
}

/** GUARDING behind: a ward circle at (x, y); the hero takes less damage inside it. */
export function ward(x: number, y: number, r: number, dur = 4.5): void {
  W3.patches.push({ kind: 'ward', x, y, r, t: 0, dur, seed: Math.floor(Math.random() * 1e6) });
}

/** What the line over the hero calls Mystical's stacks, as Power's are MIGHT: his answer in the main chat at 18:23, “Arcana (Recommended)”. */
export const MYSTIC_NAME = 'ARCANA';
/** How long Mystical's stacks last, and how many there may be (the main chat's page: 5 seconds, up to 5). */
export const MYSTIC_SECS = 5;
export const MYSTIC_MAX = 5;
/** How long a star takes to fly from the struck to the hero's moon. */
const STAR_TIME = 0.34;

/**
 * MYSTICAL behind: a spell's hit has landed at (x, y), and the hero's spells grow stronger for a
 * while, up to five times. A star flies from the struck to the little moon at the hero's shoulder,
 * and as it gets there the moon waxes: a crescent (the word's rune) at one, full at five, with a line
 * over the hero as Power's might has ("ARCANA 2", "FULL ARCANA"). `n`: the stacks the rules say the
 * hero now holds (otherwise one more than before).
 */
export function mysticStack(x: number, y: number, n?: number): void {
  const M = W3.mystic;
  M.n = Math.max(1, Math.min(MYSTIC_MAX, n ?? M.n + 1));
  M.t = MYSTIC_SECS;
  // (a stack only kept up flies no star: the moon already says how much there is; at most one in
  // the air for each the moon has still to show)
  if (W3.stars.length < M.n - M.shown) W3.stars.push({ x0: x, y0: y, t: 0, dur: STAR_TIME, bend: Math.random() < 0.5 ? -0.7 : 0.7 });
}

/** The line that last told of Mystical's stacks: counted up in place while it is fresh, as Power's is. */
let mysticNote: Fx['floaters'][number] | null = null;

/** The moon has grown: it brightens for a moment, and the line over the hero says how much there is. */
function moonGrows(fx: Fx, game: Game): void {
  const M = W3.mystic;
  const C = NEW_RAMP.mystical;
  M.shown = Math.min(M.n, M.shown + 1);
  M.since = 0;
  const full = M.shown >= MYSTIC_MAX;
  const text = full ? `FULL ${MYSTIC_NAME}` : `${MYSTIC_NAME} ${M.shown}`;
  const last = mysticNote;
  if (last && last.t < 0.45 && fx.floaters.includes(last)) {
    last.text = text;
    last.color = full ? C[5] : C[4];
    last.big = full;
  } else {
    fx.float(game.hero.x, game.hero.y, text, full ? C[5] : C[4], full, 40);
    mysticNote = fx.floaters[fx.floaters.length - 1] ?? null;
  }
}

/** Whether (x, y) is inside a patch of this kind now. */
export function inside3(kind: Patch['kind'], x: number, y: number): boolean {
  return W3.patches.some((p) => p.kind === kind && Math.hypot(x - p.x, y - p.y) < p.r);
}

/** The lines of a web of cracks: spokes from the middle out to the edge, and breaks across them. */
function cracks(x: number, y: number, r: number, dur: number, big: boolean): Patch {
  const seed = Math.floor(Math.random() * 1e6);
  const lines: number[][] = [];
  const n = big ? 7 : 5;
  const a0 = hash2(seed, 1) * Math.PI * 2;
  const spokes: number[][] = [];
  for (let k = 0; k < n; k++) {
    const a = a0 + (k / n) * Math.PI * 2 + (hash2(seed, k, 2) - 0.5) * 0.5;
    const len = r * (0.72 + hash2(seed, k, 3) * 0.34);
    const segs = 4;
    const pts = [Math.cos(a) * r * 0.1, Math.sin(a) * r * 0.1];
    for (let i = 1; i <= segs; i++) {
      const d = (len * i) / segs;
      const j = (hash2(seed, k * 8 + i, 4) - 0.5) * r * 0.22 * (i < segs ? 1 : 0.4);
      pts.push(Math.cos(a) * d - Math.sin(a) * j, Math.sin(a) * d + Math.cos(a) * j);
    }
    spokes.push(pts);
    lines.push(pts);
    // a short fork off the far half of some
    if (hash2(seed, k, 5) < 0.5) {
      const b = a + (hash2(seed, k, 6) < 0.5 ? 0.7 : -0.7);
      const fx0 = pts[6];
      const fy0 = pts[7];
      const fl = r * (0.18 + hash2(seed, k, 7) * 0.16);
      lines.push([fx0, fy0, fx0 + Math.cos(b) * fl * 0.55, fy0 + Math.sin(b) * fl * 0.55 + (hash2(seed, k, 8) - 0.5) * 0.05, fx0 + Math.cos(b) * fl, fy0 + Math.sin(b) * fl]);
    }
  }
  // breaks across between neighbouring spokes, part way out: the ring of a crater
  if (big) {
    for (let k = 0; k < n; k++) {
      if (hash2(seed, k, 9) < 0.35) continue;
      const p = spokes[k];
      const q = spokes[(k + 1) % n];
      const at = 2 + (hash2(seed, k, 10) < 0.5 ? 2 : 0);
      const mx = (p[at] + q[at]) / 2;
      const my = (p[at + 1] + q[at + 1]) / 2;
      const out = 1.12;
      lines.push([p[at], p[at + 1], mx * out, my * out, q[at], q[at + 1]]);
    }
  }
  return { kind: 'cracks', x, y, r, t: 0, dur, seed, lines };
}

// =============================================================================================
// The clock: what goes on between frames (the renderer calls it with the game's time step).

/**
 * Age everything. In the demo, also do what the rules one day will: drag, pull, stagger and stun.
 * (`game` is only touched while WORDS3.on, which the game never sets.)
 */
export function tick3(dt: number, game: Game, fx: Fx): void {
  W3.clock += dt;
  W3.dt = dt;
  for (let i = W3.later.length - 1; i >= 0; i--) {
    W3.later[i].t -= dt;
    if (W3.later[i].t <= 0) {
      const fn = W3.later[i].fn;
      W3.later.splice(i, 1);
      fn();
    }
  }
  for (let i = W3.patches.length - 1; i >= 0; i--) {
    const p = W3.patches[i];
    p.t += dt;
    if (p.t >= p.dur) W3.patches.splice(i, 1);
  }
  for (const [id, k] of W3.marks) {
    if (k.stun > 0) {
      k.stun -= dt;
      k.stun0 += dt;
    }
    if (k.hex > 0) {
      k.hex -= dt;
      k.hex0 += dt;
    }
    if (k.flare > 0) k.flare -= dt;
    if (k.stag >= 0) {
      k.stag += dt;
      if (k.stag > STAGGER) k.stag = -1;
    }
    if (k.aim > 0) {
      k.aim -= dt;
      k.aim0 += dt;
    }
    if (k.shut > 0) k.shut -= dt;
    if (k.still > 0) {
      k.still -= dt;
      k.still0 += dt;
    }
    if (k.stun <= 0 && k.hex <= 0 && k.flare <= 0 && k.stag < 0 && k.aim <= 0 && k.shut <= 0 && k.still <= 0 && !W3.patches.some((p) => p.seed === k.cracked)) W3.marks.delete(id);
  }
  for (let i = W3.snaps.length - 1; i >= 0; i--) {
    W3.snaps[i].t += dt;
    if (W3.snaps[i].t >= W3.snaps[i].dur) W3.snaps.splice(i, 1);
  }
  for (let i = W3.flights.length - 1; i >= 0; i--) {
    const f = W3.flights[i];
    f.t += dt;
    if (f.t >= f.dur) {
      W3.flights.splice(i, 1);
      // it arrives: the frenzy is kept going
      const h = game.hero;
      W3.frenzy.t = 4;
      W3.frenzy.since = 0;
      const C = NEW_RAMP.frenzied;
      fx.rings.push({ x: h.x, y: h.y, r: 0.8, t: 0, dur: 0.22, colors: [C[4], C[3], C[2]], fill: true });
    }
  }
  const f = W3.frenzy;
  f.since += dt;
  if (f.t > 0) {
    f.t -= dt;
    if (f.t <= 0) f.n = 0;
  }
  // Mystical: the crescents and the constellation's lines fade; the stars reach the moon, and it waxes
  for (const list of [W3.sweeps, W3.links]) {
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].t += dt;
      if (list[i].t >= list[i].dur) list.splice(i, 1);
    }
  }
  for (let i = W3.stars.length - 1; i >= 0; i--) {
    const s = W3.stars[i];
    s.t += dt;
    if (s.t >= s.dur) {
      W3.stars.splice(i, 1);
      if (W3.mystic.shown < W3.mystic.n) moonGrows(fx, game);
    }
  }
  const M = W3.mystic;
  M.since += dt;
  if (M.t > 0) {
    M.t -= dt;
    if (M.t <= 0) {
      M.n = 0;
      M.shown = 0;
      W3.stars.length = 0;
    }
  }
  for (let i = W3.copies.length - 1; i >= 0; i--) {
    const c = W3.copies[i];
    c.t += dt;
    c.x += c.vx * dt;
    c.y += c.vy * dt;
    if (c.t >= c.dur) {
      W3.copies.splice(i, 1);
      // (the demo: a copy that ends, with Splitting behind, scatters its shards)
      if (W3.behind.includes('splitting')) shards(fx, c.x, c.y, 0.9);
    }
  }
  for (let i = W3.pins.length - 1; i >= 0; i--) {
    W3.pins[i].t += dt;
    if (W3.pins[i].t >= W3.pins[i].dur) W3.pins.splice(i, 1);
  }
  const gd = W3.guard;
  if (gd.t > 0) gd.t = Math.max(0, gd.t - dt);
  gd.struck += dt;
  // (the demo: the rules' share, done by hand)
  const byId = new Map<number, Monster>();
  for (const m of game.monsters) if (!m.dead) byId.set(m.id, m);
  // Stilling: where each slowed monster has just been, for the echoes of it that linger
  for (const m of byId.values()) {
    const k = W3.marks.get(m.id);
    const slowed = (k !== undefined && k.still > 0) || inside3('bubble', m.x, m.y);
    let tr = W3.trails.get(m.id);
    if (!slowed) {
      if (tr) W3.trails.delete(m.id);
      continue;
    }
    if (!tr) W3.trails.set(m.id, (tr = []));
    const last = tr[tr.length - 1];
    if (!last || Math.hypot(m.x - last.x, m.y - last.y) > 0.05) {
      tr.push({ x: m.x, y: m.y });
      if (tr.length > 12) tr.shift();
    }
  }
  for (const id of W3.trails.keys()) if (!byId.has(id)) W3.trails.delete(id);
  // (the demo: enemy shots crawl in a bubble)
  for (const q of W3.demo ? game.projectiles : []) {
    if (!q.hostile) continue;
    const isIn = inside3('bubble', q.x, q.y);
    const was = slowedShots.has(q);
    if (isIn && !was) {
      slowedShots.add(q);
      q.vx *= 0.22;
      q.vy *= 0.22;
    } else if (!isIn && was) {
      slowedShots.delete(q);
      q.vx /= 0.22;
      q.vy /= 0.22;
    }
  }
  for (let i = W3.drags.length - 1; i >= 0; i--) {
    const d = W3.drags[i];
    d.t += dt;
    const m = byId.get(d.id);
    const k = Math.min(1, d.t / d.dur);
    if (m) {
      const e = 1 - (1 - k) * (1 - k) * (1 - k);
      const nx = d.x0 + (d.x1 - d.x0) * e;
      const ny = d.y0 + (d.y1 - d.y0) * e;
      // (lines of its going trail behind it, and dust where its feet scrape)
      if (k < 0.85) {
        const C = NEW_RAMP.pulling;
        const len = Math.hypot(d.x1 - d.x0, d.y1 - d.y0) || 1;
        const ux = (d.x1 - d.x0) / len;
        const uy = (d.y1 - d.y0) / len;
        if (Math.random() < 45 * dt) add(fx, { x: m.x - ux * 0.1 + rnd(-0.12, 0.12), y: m.y - uy * 0.1 + rnd(-0.12, 0.12), z: rnd(5, 17), vx: ux * 2, vy: uy * 2, vz: 0, life: 0.07, color: pick([C[3], C[4]]), size: 1, grav: 0, streak: 6 });
        if (Math.random() < 30 * dt) add(fx, { x: m.x + rnd(-0.1, 0.1), y: m.y + rnd(-0.1, 0.1), z: 0.5, vx: -ux * 0.4 + rnd(-0.3, 0.3), vy: -uy * 0.4 + rnd(-0.3, 0.3), vz: rnd(6, 14), life: 0.35, life0: 0.35, ramp: DUST, color: DUST[1], size: 2, grav: 20 });
      }
      m.x = nx;
      m.y = ny;
    }
    if (k >= 1) W3.drags.splice(i, 1);
  }
  // (the demo: a vortex pulls, cracked ground staggers; in the game, the rules do: events3)
  for (const p of W3.demo ? W3.patches : []) {
    if (p.kind === 'vortex' && p.dur > 1) {
      // it keeps pulling: what stands in it creeps in toward the middle
      for (const m of byId.values()) {
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        if (d > p.r * 1.1 || d < 0.45 || m.boss) continue;
        const s = Math.min(d - 0.45, 0.9 * dt);
        m.x -= ((m.x - p.x) / d) * s;
        m.y -= ((m.y - p.y) / d) * s;
        if (Math.random() < 8 * dt) add(fx, { x: m.x, y: m.y, z: 0.5, vx: rnd(-0.3, 0.3), vy: rnd(-0.3, 0.3), vz: rnd(5, 10), life: 0.35, life0: 0.35, ramp: DUST, color: DUST[1], size: 2, grav: 20 });
      }
    } else if (p.kind === 'cracks' && p.dur > 2) {
      // it staggers what steps in it, and grit is kicked up
      for (const m of byId.values()) {
        const d = Math.hypot(m.x - p.x, m.y - p.y);
        if (d > p.r) continue;
        if (m.anim === 'walk' && Math.random() < 12 * dt) grit(fx, m.x, m.y, 2);
        const k = markOf(m.id);
        if (k.stag < 0 && k.cracked !== p.seed) {
          k.cracked = p.seed;
          stagger(m, p.x, p.y, game);
          grit(fx, m.x, m.y, 6);
        }
      }
    }
  }
}

/** The enemy shots slowed by a bubble, in the demo. */
const slowedShots = new WeakSet<object>();

/** How long a stagger lasts, in seconds: knocked back, a moment off balance, and back. */
export const STAGGER = 0.55;
/** How far it is knocked, in game pixels. */
const STAGGER_PX = 7;

/** A monster is staggered by a blow from (fromX, fromY): knocked back a step, as every hit shows, but more. */
export function stagger(m: Monster, fromX: number, fromY: number, game?: Game): void {
  const k = markOf(m.id);
  let dx = (m.x - fromX - (m.y - fromY)) * 16;
  let dy = (m.x - fromX + (m.y - fromY)) * 8;
  if (Math.hypot(dx, dy) < 0.01 && game) {
    dx = (m.x - game.hero.x - (m.y - game.hero.y)) * 16;
    dy = (m.x - game.hero.x + (m.y - game.hero.y)) * 8;
  }
  const len = Math.hypot(dx, dy) || 1;
  k.sx = dx / len;
  k.sy = dy / len;
  k.stag = 0;
}

/** A monster is stunned for `secs`. */
export function stun(m: Monster, secs: number): void {
  const k = markOf(m.id);
  if (k.stun <= 0) k.stun0 = 0;
  k.stun = Math.max(k.stun, secs);
}

// =============================================================================================
// Drawing. Each is called by the renderer only while WORDS3.on.

/** Where a monster's picture is moved to, in game pixels: knocked back by a stagger, swaying while stunned. */
export function shift3(m: Monster, t: number): [number, number] {
  const k = W3.marks.get(m.id);
  if (!k) return [0, 0];
  let x = 0;
  let y = 0;
  if (k.stag >= 0) {
    const q = k.stag / STAGGER;
    // knocked back fast, a moment off balance (it dips a pixel), and back slow
    const out = q < 0.15 ? 1 - (1 - q / 0.15) * (1 - q / 0.15) : q < 0.42 ? 1 : 1 - smooth((q - 0.42) / 0.58);
    x += k.sx * STAGGER_PX * out;
    y += k.sy * STAGGER_PX * out + (q > 0.1 && q < 0.5 ? 1 : 0);
  }
  if (k.stun > 0) {
    // dazed: it sways, slowly, a pixel each way
    x += Math.round(Math.sin(t * 4.2 + m.id) * 1.2);
  }
  return [Math.round(x), Math.round(y)];
}

const smooth = (q: number): number => q * q * (3 - 2 * q);

/** A colour laid over a monster's picture, and how strongly: the cursed and the hexed are drained grey. */
export function tint3(m: Monster, t: number): [string, number] | null {
  const k = W3.marks.get(m.id);
  const C = NEW_RAMP.hexing;
  let a = 0;
  if (k && k.hex > 0) a = 0.26 + 0.08 * Math.sin(t * 4 + m.id);
  for (const p of W3.patches) if (p.kind === 'hex' && Math.hypot(m.x - p.x, m.y - p.y) < p.r) a = Math.max(a, 0.5 * fadeOf(p));
  if (k && k.flare > 0) return [C[5], 0.55];
  if (a > 0) return [C[3], a];
  const still = (k !== undefined && k.still > 0) || inside3('bubble', m.x, m.y);
  return still ? [NEW_RAMP.stilling[3], 0.24 + 0.05 * Math.sin(t * 2 + m.id)] : null;
}

/**
 * Stilling's echoes of a slowed monster: where it was a moment ago, lingering after it in the
 * word's mint, the older the fainter (the renderer draws its picture there).
 */
export function echoes3(m: Monster): { x: number; y: number; alpha: number; color: string }[] {
  const tr = W3.trails.get(m.id);
  if (!tr || tr.length < 2) return [];
  const out: { x: number; y: number; alpha: number; color: string }[] = [];
  const C = NEW_RAMP.stilling;
  for (const [back, alpha] of [[3, 0.32], [6, 0.18]] as const) {
    const q = tr[tr.length - 1 - back];
    if (q && Math.hypot(q.x - m.x, q.y - m.y) > 0.12) out.push({ x: q.x, y: q.y, alpha, color: C[3] });
  }
  return out;
}

function fadeOf(p: Patch): number {
  return Math.min(1, p.t / 0.18, (p.dur - p.t) / 0.5);
}

function ellipse(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number): void {
  if (alpha <= 0) return;
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(cx, cy, r * 22.6, r * 11.3, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
}

/** One pixel at a world point (its screen place rounded), `up` pixels over the floor. */
function dot(g: CanvasRenderingContext2D, cam: Cam, x: number, y: number, color: string, up = 0, w = 1, h = 1): void {
  g.fillStyle = color;
  g.fillRect(Math.round(wx(cam, x, y)), Math.round(wy(cam, x, y)) - up, w, h);
}

/**
 * ON THE FLOOR (drawn with the floor, under everything that stands): the vortex, the cracked
 * ground, the hex circle, the ring of the frenzy at the hero's feet. `here`: whether a place is on
 * the ground the renderer's pass draws.
 */
export function floor3(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, here: (x: number, y: number) => boolean): void {
  for (const p of W3.patches) {
    if (!here(p.x, p.y)) continue;
    if (p.kind === 'vortex') drawVortex(g, cam, p, t);
    else if (p.kind === 'cracks') drawCracks(g, cam, p);
    else if (p.kind === 'hex') drawHexCircle(g, cam, p, t);
    else if (p.kind === 'shards') drawShards(g, cam, p, t);
    else if (p.kind === 'bubble') drawBubble(g, cam, p, t);
    else drawWard(g, cam, p, t, game);
  }
  for (const m of game.monsters) {
    if (m.dead || !m.seen || !here(m.x, m.y)) continue;
    const k = W3.marks.get(m.id);
    if (k && k.still > 0) drawClock(g, wx(cam, m.x, m.y), wy(cam, m.x, m.y), 0.42, t, Math.min(1, k.still0 / 0.2, k.still / 0.3), NEW_RAMP.stilling);
  }
  const f = W3.frenzy;
  if (f.n > 0 && here(game.hero.x, game.hero.y)) drawFrenzyRing(g, cam, game.hero.x, game.hero.y, t);
}

function drawVortex(g: CanvasRenderingContext2D, cam: Cam, p: Patch, t: number): void {
  const C = NEW_RAMP.pulling;
  const short = p.dur < 1;
  const fade = fadeOf(p);
  const born = Math.min(1, p.t / (short ? 0.08 : 0.3));
  const R = p.r * (short ? 1 - 0.5 * (p.t / p.dur) : 0.6 + 0.4 * born);
  const cx = wx(cam, p.x, p.y);
  const cy = wy(cam, p.x, p.y);
  // the floor is stained the word's colour, darkest in the middle, where it falls away
  ellipse(g, cx, cy, R, C[1], 0.34 * fade);
  ellipse(g, cx, cy, R * 0.66, C[0], 0.4 * fade);
  ellipse(g, cx, cy, R * 0.32, '#05040e', 0.75 * fade);
  // arms that wind in to the middle, turning; each is dashed, and the dashes run inward
  const arms = short ? 4 : 3;
  const spin = -t * (short ? 6 : 1.7);
  g.globalAlpha = fade;
  for (let a = 0; a < arms; a++) {
    const steps = Math.max(24, Math.round(R * 70));
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      if (((u * 4 - t * (short ? 4 : 1.25) + a * 0.37) % 1 + 1) % 1 > 0.72) continue;
      const rho = R * (1 - 0.7 * u);
      const th = (a / arms) * Math.PI * 2 + spin + u * 3.1;
      const col = u > 0.8 ? C[5] : u > 0.45 ? C[4] : u > 0.15 ? C[3] : C[2];
      const x = p.x + Math.cos(th) * rho;
      const y = p.y + Math.sin(th) * rho;
      dot(g, cam, x, y, col, 0, u > 0.15 ? 2 : 1, 1);
    }
  }
  // the lip of the well, and the rim of the whole
  g.globalAlpha = fade;
  ringOf(g, cx, cy, R * 0.32, Math.sin(t * 9 + p.seed) > 0 ? C[5] : C[4], 1);
  g.globalAlpha = fade * 0.8;
  ringOf(g, cx, cy, R, C[3], 3);
  g.globalAlpha = 1;
}

/** Shards lying where they fell: small crystals, white at the top, with a dark pixel under; now and then one glints. */
function drawShards(g: CanvasRenderingContext2D, cam: Cam, p: Patch, t: number): void {
  const C = NEW_RAMP.splitting;
  const pts = p.pts ?? [];
  // (they land a moment after they are thrown)
  if (p.t < 0.28) return;
  const fade = Math.min(1, (p.dur - p.t) / 0.5);
  g.globalAlpha = fade;
  for (let i = 0; i + 1 < pts.length; i += 2) {
    const x = Math.round(wx(cam, p.x + pts[i], p.y + pts[i + 1]));
    const y = Math.round(wy(cam, p.x + pts[i], p.y + pts[i + 1]));
    g.fillStyle = '#0c0614';
    g.fillRect(x - 1, y + 1, 3, 1);
    g.fillStyle = C[2];
    g.fillRect(x + 1, y - 1, 1, 2);
    g.fillStyle = C[3];
    g.fillRect(x, y - 2, 1, 3);
    g.fillStyle = C[5];
    g.fillRect(x, y - 2, 1, 1);
    if (hash2(p.seed + i, Math.floor(t * 8), 3) < 0.12) {
      g.fillStyle = C[5];
      g.fillRect(x - 1, y - 3, 3, 1);
      g.fillRect(x, y - 4, 1, 3);
    }
  }
  g.globalAlpha = 1;
}

/** A ring of twelve ticks like a clock's face round (cx, cy), radius r tiles, its hand creeping round a step at a time (Stilling). */
function drawClock(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, alpha: number, C: readonly string[], step = 0.55): void {
  const hand = Math.floor(t / step) % 12;
  g.globalAlpha = alpha;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI * 0.75;
    const px = Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * r);
    const py = Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * r);
    g.fillStyle = i === hand ? C[5] : i % 3 === 0 ? C[4] : C[3];
    g.fillRect(px, py, i === hand || i % 3 === 0 ? 2 : 1, 1);
  }
  g.globalAlpha = 1;
}

/** Stilling behind: the floor of the bubble, its rim lit at the upper left, slow ripples, the clock's ticks round its edge. */
function drawBubble(g: CanvasRenderingContext2D, cam: Cam, p: Patch, t: number): void {
  const C = NEW_RAMP.stilling;
  const fade = fadeOf(p);
  const born = Math.min(1, p.t / 0.25);
  const R = p.r * (0.55 + 0.45 * born);
  const cx = wx(cam, p.x, p.y);
  const cy = wy(cam, p.x, p.y);
  ellipse(g, cx, cy, R, C[1], 0.2 * fade);
  // ripples, slow, as on still water
  for (let i = 0; i < 2; i++) {
    const q = (p.t / 2.6 + i * 0.5) % 1;
    g.globalAlpha = fade * 0.6 * (1 - q);
    ringOf(g, cx, cy, R * (0.15 + 0.8 * q), C[3], 2);
  }
  g.globalAlpha = fade;
  ringOf(g, cx, cy, R, C[3], 1);
  // the rim catches the light at the upper left
  ringOf(g, cx, cy, R, C[5], 1, Math.PI * 1.05, Math.PI * 0.45);
  g.globalAlpha = 1;
  drawClock(g, cx, cy, R * 0.86, t, fade, C, 0.7);
}

/** Guarding behind: the ward circle, its ring doubled, a shield cut at each quarter, brighter while the hero stands in it. */
function drawWard(g: CanvasRenderingContext2D, cam: Cam, p: Patch, t: number, game: Game): void {
  const C = NEW_RAMP.guarding;
  const fade = fadeOf(p);
  const drawn = Math.min(1, p.t / 0.3);
  const cx = wx(cam, p.x, p.y);
  const cy = wy(cam, p.x, p.y);
  const inIt = Math.hypot(game.hero.x - p.x, game.hero.y - p.y) < p.r;
  ellipse(g, cx, cy, p.r, C[1], (inIt ? 0.24 : 0.16) * fade);
  g.globalAlpha = fade;
  ringOf(g, cx, cy, p.r, inIt ? C[4] : C[3], 1, -Math.PI / 2, Math.PI * 2 * drawn);
  ringOf(g, cx, cy, p.r * 0.96, C[2], 1, -Math.PI / 2, Math.PI * 2 * drawn);
  ringOf(g, cx, cy, p.r * 0.7, C[2], 3, -Math.PI / 2, Math.PI * 2 * drawn);
  // a shield at each quarter, on the ring
  const rows = NEW_GLYPH.guarding;
  for (let q = 0; q < 4; q++) {
    const a = (q / 4) * Math.PI * 2 + Math.PI / 4;
    if (q / 4 > drawn) continue;
    const px = Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * p.r) - 3;
    const py = Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * p.r) - 3;
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === '.') continue;
        g.fillStyle = '#06140c';
        g.fillRect(px + c, py + r + 1, 1, 1);
      }
    }
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        const ch = rows[r][c];
        if (ch === '.') continue;
        g.fillStyle = ch === 'o' ? (inIt && Math.sin(t * 4 + q) > 0 ? C[5] : C[4]) : r === 0 ? C[4] : C[3];
        g.fillRect(px + c, py + r, 1, 1);
      }
    }
  }
  g.globalAlpha = 1;
}

function ringOf(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, gap = 1, from = 0, sweep = Math.PI * 2): void {
  g.fillStyle = color;
  const n = Math.max(16, Math.round(r * 44));
  for (let i = 0; i < n; i += gap) {
    const a = from + (i / n) * sweep;
    g.fillRect(Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * r), Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * r), 1, 1);
  }
}

function drawCracks(g: CanvasRenderingContext2D, cam: Cam, p: Patch): void {
  const C = NEW_RAMP.heavy;
  const lines = p.lines ?? [];
  const fade = Math.min(1, (p.dur - p.t) / 0.6);
  const open = Math.min(1, p.t / 0.07);
  const cx = wx(cam, p.x, p.y);
  const cy = wy(cam, p.x, p.y);
  // the ground is beaten down where it was struck
  ellipse(g, cx, cy, p.r * 0.95, C[0], 0.16 * fade);
  ellipse(g, cx, cy, p.r * 0.32, '#0a0602', 0.34 * fade);
  // the glow in the cracks: white-hot as they open, then bronze that breathes slowly
  const hot = p.t < 0.12 ? C[5] : p.t < 0.35 ? C[4] : Math.sin(p.t * 3 + p.seed) > 0.2 ? C[3] : C[2];
  // grit and chips lying about
  for (let i = 0; i < Math.round(6 + p.r * 8); i++) {
    const a = hash2(p.seed, i, 21) * Math.PI * 2;
    const d = Math.sqrt(hash2(p.seed, i, 22)) * p.r;
    g.globalAlpha = fade * 0.8;
    dot(g, cam, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, hash2(p.seed, i, 23) < 0.7 ? '#140c06' : C[2], 0, hash2(p.seed, i, 24) < 0.3 ? 2 : 1);
  }
  // slabs between the spokes, tipped by the blow: each a little lighter or darker than the floor
  const spokes = lines.filter((q) => q.length >= 10);
  if (spokes.length >= 3 && open >= 1) {
    for (let k = 0; k < spokes.length; k++) {
      const a = spokes[k];
      const b = spokes[(k + 1) % spokes.length];
      g.globalAlpha = fade * (hash2(p.seed, k, 30) < 0.5 ? 0.1 : 0.16);
      g.fillStyle = hash2(p.seed, k, 30) < 0.5 ? C[4] : '#000000';
      g.beginPath();
      g.moveTo(wx(cam, p.x + a[2], p.y + a[3]), wy(cam, p.x + a[2], p.y + a[3]));
      g.lineTo(wx(cam, p.x + a[6], p.y + a[7]), wy(cam, p.x + a[6], p.y + a[7]));
      g.lineTo(wx(cam, p.x + b[6], p.y + b[7]), wy(cam, p.x + b[6], p.y + b[7]));
      g.lineTo(wx(cam, p.x + b[2], p.y + b[3]), wy(cam, p.x + b[2], p.y + b[3]));
      g.closePath();
      g.fill();
    }
  }
  lines.forEach((pts) => {
    const segs = pts.length / 2 - 1;
    const upto = Math.max(1, Math.ceil(segs * open));
    for (let i = 0; i < upto; i++) {
      const x0 = wx(cam, p.x + pts[i * 2], p.y + pts[i * 2 + 1]);
      const y0 = wy(cam, p.x + pts[i * 2], p.y + pts[i * 2 + 1]);
      const x1 = wx(cam, p.x + pts[i * 2 + 2], p.y + pts[i * 2 + 3]);
      const y1 = wy(cam, p.x + pts[i * 2 + 2], p.y + pts[i * 2 + 3]);
      const near = segs > 2 && i < 2;
      // the lifted edge of the slab above the crack catches the light (upper left)
      g.globalAlpha = fade * 0.4;
      pline(g, x0 - 1, y0 - 1, x1 - 1, y1 - 1, C[4]);
      // the gap: dark, two pixels wide near the middle
      g.globalAlpha = fade;
      pline(g, x0, y0 + 1, x1, y1 + 1, '#080402');
      if (near) pline(g, x0 + 1, y0 + 1, x1 + 1, y1 + 1, '#080402');
      // and the light down in it, brightest toward the middle; the far ends are dark
      if (i < segs - 1 || p.t < 0.35) pline(g, x0, y0, x1, y1, i === 0 || p.t < 0.35 ? hot : i < 2 ? C[3] : C[2]);
      else pline(g, x0, y0, x1, y1, '#140a04');
    }
  });
  g.globalAlpha = 1;
}

function drawHexCircle(g: CanvasRenderingContext2D, cam: Cam, p: Patch, t: number): void {
  const C = NEW_RAMP.hexing;
  const fade = fadeOf(p);
  const drawn = Math.min(1, p.t / 0.3);
  const cx = wx(cam, p.x, p.y);
  const cy = wy(cam, p.x, p.y);
  const R = p.r;
  // what lies in it is drained: a cold shadow over the floor
  ellipse(g, cx, cy, R, '#08060c', 0.45 * fade);
  ellipse(g, cx, cy, R * 0.55, C[1], 0.2 * fade);
  // the ring is written round as it is cast: two rings, the signs between them
  const from = -Math.PI / 2;
  g.globalAlpha = fade;
  ringOf(g, cx, cy, R * 1.015, C[2], 1, from, Math.PI * 2 * drawn);
  ringOf(g, cx, cy, R, C[4], 1, from, Math.PI * 2 * drawn);
  ringOf(g, cx, cy, R * 0.84, C[3], 2, from, Math.PI * 2 * drawn);
  const signs = 8;
  const turn = t * 0.35;
  for (let i = 0; i < signs; i++) {
    const a = turn + (i / signs) * Math.PI * 2;
    if ((((a - from) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) > Math.PI * 2 * drawn) continue;
    const px = Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * R * 0.92);
    const py = Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * R * 0.92);
    sign(g, px, py, i % 3, C);
  }
  // inside: four hooks that turn the other way
  const hooks = 4;
  for (let i = 0; i < hooks; i++) {
    const a0 = -t * 0.5 + (i / hooks) * Math.PI * 2;
    for (let s = 0; s <= 14; s++) {
      const u = s / 14;
      if (u > drawn) break;
      const rho = R * (0.2 + 0.42 * u);
      const a = a0 + u * 1.1;
      dot(g, cam, p.x + Math.cos(a) * rho, p.y + Math.sin(a) * rho, u > 0.8 ? C[4] : C[3], 0, 2, 1);
    }
  }
  g.globalAlpha = 1;
}

/** One of the small signs round a hex circle: three shapes, each 3x3, with a dark pixel under. */
function sign(g: CanvasRenderingContext2D, x: number, y: number, which: number, C: readonly string[]): void {
  const shapes = [
    ['X.X', '.X.', 'X.X'],
    ['XXX', '..X', '.X.'],
    ['.X.', 'XXX', 'X..'],
  ];
  const s = shapes[which % shapes.length];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (s[r][c] !== 'X') continue;
      g.fillStyle = '#05040a';
      g.fillRect(x - 1 + c, y - 1 + r + 1, 1, 1);
    }
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (s[r][c] !== 'X') continue;
      g.fillStyle = r === 0 ? C[4] : C[3];
      g.fillRect(x - 1 + c, y - 1 + r, 1, 1);
    }
  }
}

function drawFrenzyRing(g: CanvasRenderingContext2D, cam: Cam, x: number, y: number, t: number): void {
  const f = W3.frenzy;
  const C = NEW_RAMP.frenzied;
  const cx = wx(cam, x, y);
  const cy = wy(cam, x, y);
  const R = 0.56;
  const fading = f.t < 1 && Math.floor(t * 12) % 2 === 0;
  const turn = t * (1.2 + f.n * 0.7);
  const n = Math.max(20, Math.round(R * 60));
  // (under it, a faint heat on the floor that grows with the frenzy)
  ellipse(g, cx, cy, R * 0.95, C[2], (0.05 + f.n * 0.035) * (fading ? 0.5 : 1));
  for (let i = 0; i < n; i++) {
    const a = turn + (i / n) * Math.PI * 2;
    const into = ((i / n) * 5) % 1;
    const which = Math.floor((i / n) * 5);
    if (into < 0.1 || into > 0.9) continue;
    const lit = which < f.n;
    if (!lit && i % 2 === 1) continue;
    const fresh = which === f.n - 1 && f.since < 0.14;
    const col = !lit ? C[1] : fresh ? C[5] : into > 0.7 ? C[4] : C[3];
    if (fading && lit) continue;
    const px = Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * R);
    const py = Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * R);
    g.fillStyle = col;
    g.fillRect(px, py, lit ? 2 : 1, 1);
  }
}

/** The frenzy's copies of the hero: drawn by the renderer beside the hero, in the word's colour. */
export function heroCopies3(t: number): { color: string; alpha: number; dx: number[] } | null {
  const f = W3.frenzy;
  if (f.n < 3) return null;
  // (they shiver: on every other frame, one pixel further out)
  const out = (f.n >= 5 ? 2 : 1) + (Math.floor(t * 30) % 2);
  return { color: NEW_RAMP.frenzied[3], alpha: f.n >= 5 ? 0.34 : 0.24, dx: [-out, out] };
}

/**
 * IN THE AIR (drawn after the darkness, so it glows): the motes of a vortex, ash falling in a hex
 * circle, the stun turning over a head, the sigil of a curse, a hex coming down, the spark of a
 * frenzy fed by a kill, heat off a hero in a full frenzy.
 */
export function air3(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, fx: Fx): void {
  for (const p of W3.patches) {
    const fade = fadeOf(p);
    if (p.kind === 'vortex' && p.dur > 1) {
      const C = NEW_RAMP.pulling;
      const n = Math.round(8 + p.r * 6);
      const at = (q: number, u: number): [number, number] => {
        const th = q * Math.PI * 2 + u * 3.4 - t * 1.7;
        const rho = p.r * (1 - u) * 0.98;
        return [wx(cam, p.x + Math.cos(th) * rho, p.y + Math.sin(th) * rho), wy(cam, p.x + Math.cos(th) * rho, p.y + Math.sin(th) * rho)];
      };
      for (let i = 0; i < n; i++) {
        const q = hash2(p.seed, i, 31);
        const u = (t * 0.42 + q) % 1;
        const up = Math.round(1 + 7 * (1 - u) * hash2(p.seed, i, 32));
        const [x0, y0] = at(q, u);
        const [x1, y1] = at(q, Math.max(0, u - 0.05));
        g.globalAlpha = fade * (u < 0.15 ? u / 0.15 : 1);
        pline(g, x0, y0 - up, x1, y1 - up, u > 0.7 ? C[5] : C[4]);
      }
      g.globalAlpha = 1;
    } else if (p.kind === 'hex') {
      const C = NEW_RAMP.hexing;
      const n = Math.round(6 + p.r * 5);
      for (let i = 0; i < n; i++) {
        const q = hash2(p.seed, i, 41);
        const u = (t * 0.7 + q) % 1;
        const a = hash2(p.seed, i, 42) * Math.PI * 2;
        const d = Math.sqrt(hash2(p.seed, i, 43)) * p.r * 0.85;
        g.globalAlpha = fade * (u < 0.2 ? u / 0.2 : 1 - (u - 0.2) * 0.5);
        dot(g, cam, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, i % 3 === 0 ? C[4] : C[3], Math.round(22 * (1 - u)));
      }
      g.globalAlpha = 1;
    }
  }
  for (const m of game.monsters) {
    if (m.dead || !m.seen) continue;
    const k = W3.marks.get(m.id);
    if (!k) continue;
    const [ox, oy] = shift3(m, t);
    const sx = Math.round(wx(cam, m.x, m.y)) + ox;
    const top = Math.round(wy(cam, m.x, m.y)) + oy - FIGURE_SIZE[figureOf(m)].top;
    if (k.stun > 0) drawStun(g, sx, top, t, k);
    if (k.hex > 0 || k.flare > 0) drawSigil(g, sx, top - 13 + Math.round(Math.sin(t * 2.6 + m.id) * 1.2), k, t);
  }
  // VOLATILE'S HIDDEN BOMB (WORDS4): each charge the rules hold
  for (const b of game.bombs ?? []) drawBomb(g, cam, game, b, t, fx);
  for (const s of W3.snaps) {
    const m = game.monsters.find((q) => q.id === s.id);
    if (!m) continue;
    const C = NEW_RAMP.hexing;
    const k = s.t / s.dur;
    const R = 1.05 * (1 - k) + 0.22;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + k * 2.4;
      const px = Math.round(wx(cam, m.x + Math.cos(a) * R, m.y + Math.sin(a) * R));
      const py = Math.round(wy(cam, m.x + Math.cos(a) * R, m.y + Math.sin(a) * R)) - Math.round(8 + 18 * k);
      sign(g, px, py, i % 3, k > 0.7 ? [C[5], C[5], C[5], C[5], C[5], C[5]] : C);
    }
  }
  const h = game.hero;
  for (const f of W3.flights) {
    const C = NEW_RAMP.frenzied;
    const at = (q: number): [number, number] => {
      const e = q * q * (3 - 2 * q);
      const dx = h.x - f.x0;
      const dy = h.y - f.y0;
      const side = Math.sin(Math.PI * q) * f.bend * 0.5;
      const x = f.x0 + dx * e - dy * side;
      const y = f.y0 + dy * e + dx * side;
      return [wx(cam, x, y), wy(cam, x, y) - 12 - Math.sin(Math.PI * q) * 14];
    };
    const q1 = f.t / f.dur;
    let [px, py] = at(q1);
    for (let tail = 1; tail <= 5; tail++) {
      const q = q1 - tail * 0.06;
      if (q < 0) break;
      const [qx, qy] = at(q);
      pline(g, px, py, qx, qy, tail < 2 ? C[4] : tail < 4 ? C[3] : C[2]);
      px = qx;
      py = qy;
    }
    const [hx, hy] = at(q1);
    g.fillStyle = C[3];
    g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3);
    g.fillStyle = C[5];
    g.fillRect(Math.round(hx), Math.round(hy), 1, 1);
  }
  // Splitting: the three copies flying on, each a small bright shard of the attack with a tail
  for (const c of W3.copies) {
    const C = NEW_RAMP.splitting;
    const sp = Math.hypot(c.vx, c.vy) || 1;
    const ux = c.vx / sp;
    const uy = c.vy / sp;
    const x0 = wx(cam, c.x, c.y);
    const y0 = wy(cam, c.x, c.y) - 10;
    const x1 = wx(cam, c.x - ux * 0.55, c.y - uy * 0.55);
    const y1 = wy(cam, c.x - ux * 0.55, c.y - uy * 0.55) - 10;
    const x2 = wx(cam, c.x - ux * 0.25, c.y - uy * 0.25);
    const y2 = wy(cam, c.x - ux * 0.25, c.y - uy * 0.25) - 10;
    pline(g, x1, y1 + 1, x0, y0 + 1, C[1]);
    pline(g, x1, y1, x0, y0, C[2]);
    pline(g, x2, y2, x0, y0, C[3]);
    pline(g, x2, y2 + 1, x0, y0 + 1, C[2]);
    g.fillStyle = C[5];
    g.fillRect(Math.round(x0) - 1, Math.round(y0), 3, 2);
  }
  // Precise: the needle of light through the struck, and the star where it struck
  for (const q of W3.pins) {
    const C = NEW_RAMP.precise;
    const k = q.t / q.dur;
    const x = Math.round(wx(cam, q.x, q.y));
    const y = Math.round(wy(cam, q.x, q.y)) - 12;
    if (!q.crit && k < 0.6) {
      const bx = wx(cam, q.x - q.dx * 1.1, q.y - q.dy * 1.1);
      const by = wy(cam, q.x - q.dx * 1.1, q.y - q.dy * 1.1) - 12;
      const fx2 = wx(cam, q.x + q.dx * 0.7, q.y + q.dy * 0.7);
      const fy2 = wy(cam, q.x + q.dx * 0.7, q.y + q.dy * 0.7) - 12;
      g.globalAlpha = 1 - k / 0.6;
      pline(g, bx, by, fx2, fy2, k < 0.25 ? C[5] : C[3]);
      g.globalAlpha = 1;
    }
    const grow = q.crit ? 1 : 1 - k;
    const h = Math.round((q.crit ? 18 : 11) * grow);
    const v = Math.round((q.crit ? 11 : 6) * grow);
    if (h <= 0) continue;
    g.fillStyle = C[2];
    g.fillRect(x - h, y, h * 2 + 1, 1);
    g.fillRect(x, y - v, 1, v * 2 + 1);
    g.fillStyle = C[4];
    g.fillRect(x - Math.round(h * 0.6), y, Math.round(h * 1.2) + 1, 1);
    g.fillRect(x, y - Math.round(v * 0.6), 1, Math.round(v * 1.2) + 1);
    if (q.crit) {
      // a certain critical: the star has eight rays, and a white heart
      const d = Math.round(6 * (1 - k * 0.5));
      for (let i = 1; i <= d; i++) {
        g.fillStyle = i < d * 0.6 ? C[4] : C[2];
        g.fillRect(x - i, y - i, 1, 1);
        g.fillRect(x + i, y - i, 1, 1);
        g.fillRect(x - i, y + i, 1, 1);
        g.fillRect(x + i, y + i, 1, 1);
      }
    }
    g.fillStyle = C[5];
    g.fillRect(x - 1, y - 1, 3, 3);
  }
  // Precise behind: the sight on a marked enemy (four corners that close in on it, and hold, breathing)
  for (const m of game.monsters) {
    if (m.dead || !m.seen) continue;
    const k = W3.marks.get(m.id);
    if (!k || (k.aim <= 0 && k.shut <= 0)) continue;
    const [ox, oy] = shift3(m, t);
    const sx = Math.round(wx(cam, m.x, m.y)) + ox;
    const sy = Math.round(wy(cam, m.x, m.y)) + oy;
    const fs = FIGURE_SIZE[figureOf(m)];
    const shut = k.shut > 0;
    const close = shut ? -2 : Math.round(9 * Math.max(0, 1 - k.aim0 / 0.25)) + (Math.sin(t * 7) > 0 ? 1 : 0);
    const going = shut ? Math.min(1, k.shut / 0.12) : Math.min(1, k.aim / 0.25);
    drawSight(g, sx - fs.half - 2 - close, sy - fs.top - 3 - close, sx + fs.half + 2 + close, sy + 2 + close, shut ? NEW_RAMP.precise[5] : NEW_RAMP.precise[3], going);
  }
  // Stilling behind: the dome of the bubble, a thin glass over it, glinting at the upper left
  for (const p of W3.patches) {
    if (p.kind !== 'bubble') continue;
    const C = NEW_RAMP.stilling;
    const fade = fadeOf(p);
    const born = Math.min(1, p.t / 0.25);
    const R = p.r * (0.55 + 0.45 * born);
    const cx = wx(cam, p.x, p.y);
    const cy = wy(cam, p.x, p.y);
    const n = Math.round(R * 40);
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI;
      const lit = a > Math.PI * 0.55 && a < Math.PI * 0.86;
      if (!lit && i % 3 !== 0) continue;
      g.globalAlpha = fade * (lit ? 0.75 : 0.35);
      g.fillStyle = lit ? C[5] : C[4];
      g.fillRect(Math.round(cx + Math.cos(a) * R * 22.6), Math.round(cy - Math.sin(a) * R * 17), 1, 1);
    }
    g.globalAlpha = 1;
  }
  // Guarding behind: motes of emerald rising from the ward, more while the hero stands in it
  for (const p of W3.patches) {
    if (p.kind !== 'ward') continue;
    const C = NEW_RAMP.guarding;
    const fade = fadeOf(p);
    const inIt = Math.hypot(game.hero.x - p.x, game.hero.y - p.y) < p.r;
    const n = inIt ? 12 : 6;
    for (let i = 0; i < n; i++) {
      const q = (t * 0.6 + hash2(p.seed, i, 51)) % 1;
      const a = hash2(p.seed, i, 52) * Math.PI * 2;
      const d = Math.sqrt(hash2(p.seed, i, 53)) * p.r * 0.9;
      g.globalAlpha = fade * (q < 0.2 ? q / 0.2 : 1 - (q - 0.2) / 0.8);
      dot(g, cam, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, i % 3 === 0 ? C[5] : C[4], Math.round(2 + q * 22));
    }
    g.globalAlpha = 1;
  }
  // Guarding in front: the shell of the shield round the hero
  if (W3.guard.t > 0) drawShell(g, cam, game, fx, t);
  // Mystical in front: crescents of moonlight sweeping round what spells struck, and the
  // constellation's lines out to what their splash struck
  for (const s of W3.sweeps) drawSweep(g, cam, s);
  for (const l of W3.links) drawLink(g, cam, l, t);
  // Mystical behind: the stars flying to the moon at the hero's shoulder, and the moon
  const [mx, my] = moonAt(cam, game, fx, t);
  for (const s of W3.stars) {
    const C = NEW_RAMP.mystical;
    const sx0 = wx(cam, s.x0, s.y0);
    const sy0 = wy(cam, s.x0, s.y0) - 12;
    const at = (q: number): [number, number] => {
      const e = q * q * (3 - 2 * q);
      const bx = mx - sx0;
      const by = my - sy0;
      const side = Math.sin(Math.PI * q) * s.bend * 0.35;
      return [sx0 + bx * e - by * side, sy0 + by * e + bx * side - Math.sin(Math.PI * q) * 10];
    };
    const q1 = s.t / s.dur;
    let [px, py] = at(q1);
    for (let tail = 1; tail <= 4; tail++) {
      const q = q1 - tail * 0.035;
      if (q < 0) break;
      const [qx, qy] = at(q);
      pline(g, Math.round(px), Math.round(py), Math.round(qx), Math.round(qy), tail < 2 ? C[4] : tail < 3 ? C[3] : C[2]);
      px = qx;
      py = qy;
    }
    const [hx, hy] = at(q1);
    starAt(g, Math.round(hx), Math.round(hy), C, 1);
  }
  moonWas = [mx, my];
  if (W3.mystic.shown > 0) drawMoon(g, mx, my, t);
  // a full moon sheds its light: motes of it drift down round the hero
  if (W3.mystic.shown >= MYSTIC_MAX && Math.random() < 14 * W3.dt * fx.room()) {
    const C = NEW_RAMP.mystical;
    add(fx, { x: h.x + rnd(-0.45, 0.45), y: h.y + rnd(-0.45, 0.45), z: rnd(18, 30), vx: 0, vy: 0, vz: rnd(-14, -6), life: rnd(0.6, 1), color: pick([C[3], C[4], C[4], C[5]]), size: 1, grav: 0 });
  }
  // a full frenzy gives off heat
  if (W3.frenzy.n >= 5 && Math.random() < 30 * W3.dt * fx.room()) {
    const C = NEW_RAMP.frenzied;
    add(fx, { x: h.x + rnd(-0.35, 0.35), y: h.y + rnd(-0.35, 0.35), z: rnd(4, 20), vx: 0, vy: 0, vz: rnd(30, 55), life: rnd(0.15, 0.3), color: pick([C[3], C[4]]), size: 1, grav: 0, streak: 3 });
  }
}

/** A small star of moonlight at a screen point: a white heart, four short rays (`big`: longer rays). */
function starAt(g: CanvasRenderingContext2D, x: number, y: number, C: readonly string[], big: number): void {
  g.fillStyle = C[3];
  for (let i = 1; i <= 1 + big; i++) {
    g.fillRect(x - i, y, 1, 1);
    g.fillRect(x + i, y, 1, 1);
    g.fillRect(x, y - i, 1, 1);
    g.fillRect(x, y + i, 1, 1);
  }
  g.fillStyle = C[4];
  g.fillRect(x - 1, y, 3, 1);
  g.fillRect(x, y - 1, 1, 3);
  g.fillStyle = C[5];
  g.fillRect(x, y, 1, 1);
}

/**
 * Mystical in front: a crescent of moonlight sweeping round the struck, at its middle: an arc of a
 * ring seen at the floor's slant, thickest in its middle and thin at both ends like the moon's, its
 * leading end white. It sweeps half way round and more, and is gone.
 */
function drawSweep(g: CanvasRenderingContext2D, cam: Cam, s: Sweep): void {
  const C = NEW_RAMP.mystical;
  const k = s.t / s.dur;
  const cx = wx(cam, s.x, s.y);
  const cy = wy(cam, s.x, s.y) - 12;
  const rx = 13;
  const ry = 7;
  const head = s.a0 + s.dir * smooth(Math.min(1, k * 1.4)) * Math.PI * 1.15;
  const len = Math.PI * (0.35 + 0.55 * Math.min(1, k * 3));
  g.globalAlpha = k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45;
  const n = 30;
  for (let i = 0; i <= n; i++) {
    const q = i / n;
    const a = head - s.dir * q * len;
    const thick = Math.sin(Math.PI * q);
    const ox = Math.cos(a);
    const oy = Math.sin(a);
    g.fillStyle = q < 0.1 ? C[5] : q < 0.6 ? C[4] : C[3];
    g.fillRect(Math.round(cx + ox * rx), Math.round(cy + oy * ry), 1, 1);
    if (thick > 0.45) {
      g.fillStyle = q < 0.5 ? C[4] : C[3];
      g.fillRect(Math.round(cx + ox * (rx - 1.1)), Math.round(cy + oy * (ry - 0.7)), 1, 1);
    }
    if (thick > 0.85) {
      g.fillStyle = C[2];
      g.fillRect(Math.round(cx + ox * (rx - 2.2)), Math.round(cy + oy * (ry - 1.4)), 1, 1);
    }
  }
  g.globalAlpha = 1;
}

/**
 * Mystical's splash: a line of a constellation from the struck to what the splash struck, drawn
 * out from the struck in an instant: dim, with brighter points along it, a star at each end. It
 * holds a moment and fades.
 */
function drawLink(g: CanvasRenderingContext2D, cam: Cam, l: Link, t: number): void {
  const C = NEW_RAMP.mystical;
  const k = l.t / l.dur;
  const x0 = Math.round(wx(cam, l.x0, l.y0));
  const y0 = Math.round(wy(cam, l.x0, l.y0)) - 12;
  const X1 = Math.round(wx(cam, l.x1, l.y1));
  const Y1 = Math.round(wy(cam, l.x1, l.y1)) - 12;
  const grow = Math.min(1, k / 0.16);
  const x1 = Math.round(x0 + (X1 - x0) * grow);
  const y1 = Math.round(y0 + (Y1 - y0) * grow);
  const fade = k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5;
  g.globalAlpha = fade;
  pline(g, x0, y0, x1, y1, C[3]);
  // (brighter points along it, every few pixels, running out along the line)
  const d = Math.hypot(x1 - x0, y1 - y0);
  const run = Math.floor(t * 40) % 4;
  for (let s = run; s < d; s += 4) {
    g.fillStyle = C[5];
    g.fillRect(Math.round(x0 + ((x1 - x0) * s) / (d || 1)), Math.round(y0 + ((y1 - y0) * s) / (d || 1)), 1, 1);
  }
  starAt(g, x0, y0, C, 1);
  if (grow >= 1) starAt(g, X1, Y1, C, k < 0.3 ? 2 : 1);
  g.globalAlpha = 1;
}

/** Where the moon was last drawn, on the screen (for its light, `lights3`). */
let moonWas: [number, number] = [0, 0];

/** Where the little moon of Mystical behind floats: at the hero's shoulder, to the left of the head, bobbing. */
function moonAt(cam: Cam, game: Game, fx: Fx, t: number): [number, number] {
  const h = game.hero;
  return [Math.round(wx(cam, h.x, h.y)) - 13, Math.round(wy(cam, h.x, h.y)) - fx.headroom + 3 + Math.round(Math.sin(t * 2.2) * 1.5)];
}

/**
 * Mystical behind: the little moon, seven pixels round, waxing with the stacks: a crescent lit on
 * its left at one (as the rune's), half at three, full at five. The rest of its round is faint. It
 * brightens as it grows, and blinks in its last second, as Power's might does.
 */
function drawMoon(g: CanvasRenderingContext2D, cx: number, cy: number, t: number): void {
  const C = NEW_RAMP.mystical;
  const M = W3.mystic;
  if (M.t < 1 && Math.floor(t * 12) % 2 === 0) return;
  const R = 3.5;
  // (the edge between light and dark, as a share of the half-width at each row: lit where -dx >= k * half)
  const k = [1, 0.55, 0.22, 0, -0.45, -1][Math.min(MYSTIC_MAX, M.shown)];
  const fresh = M.since < 0.12;
  const full = M.shown >= MYSTIC_MAX;
  const x0 = cx - 3;
  const y0 = cy - 3;
  if (full) {
    // a full moon's halo: a faint ring of light round it
    g.globalAlpha = 0.45;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + t * 0.6;
      g.fillStyle = i % 4 === 0 ? C[4] : C[3];
      g.fillRect(Math.round(cx + Math.cos(a) * 6), Math.round(cy + Math.sin(a) * 6), 1, 1);
    }
    g.globalAlpha = 1;
  }
  for (let py = 0; py < 7; py++) {
    for (let px = 0; px < 7; px++) {
      const dx = px + 0.5 - R;
      const dy = py + 0.5 - R;
      if (dx * dx + dy * dy > R * R + 0.3) continue;
      const half = Math.sqrt(Math.max(0, R * R - dy * dy));
      const lit = -dx >= k * half - 0.01;
      if (!lit) {
        g.globalAlpha = 0.55;
        g.fillStyle = C[1];
        g.fillRect(x0 + px, y0 + py, 1, 1);
        g.globalAlpha = 1;
        continue;
      }
      // light from the upper left: its rim there is brightest; on a full moon, two darker seas
      const rim = dx * dx + dy * dy > (R - 1.1) * (R - 1.1) && dx + dy < 0.5;
      const sea = full && ((px === 4 && py === 3) || (px === 3 && py === 4) || (px === 4 && py === 4));
      g.fillStyle = fresh ? C[5] : rim ? C[5] : sea ? C[3] : C[4];
      g.fillRect(x0 + px, y0 + py, 1, 1);
    }
  }
}

/** Four corners of a sight round (x0, y0) to (x1, y1), with a dark pixel outside each (Precise). */
function drawSight(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, alpha: number): void {
  const L = 4;
  g.globalAlpha = alpha;
  for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]] as const) {
    g.fillStyle = '#0a0c14';
    g.fillRect(Math.min(cx - sx, cx - sx + sx * L), cy - sy, L + 1, 1);
    g.fillRect(cx - sx, Math.min(cy - sy, cy - sy + sy * L), 1, L + 1);
    g.fillStyle = color;
    g.fillRect(Math.min(cx, cx + sx * (L - 1)), cy, L, 1);
    g.fillRect(cx, Math.min(cy, cy + sy * (L - 1)), 1, L);
  }
  g.globalAlpha = 1;
}

/** The shield on the hero: a shell of emerald points round them, lit at the upper left; it flares on the side a blow strikes. */
function drawShell(g: CanvasRenderingContext2D, cam: Cam, game: Game, fx: Fx, t: number): void {
  const C = NEW_RAMP.guarding;
  const gd = W3.guard;
  const h = game.hero;
  const cx = wx(cam, h.x, h.y);
  const top = fx.headroom || 32;
  const cy = wy(cam, h.x, h.y) - top * 0.52;
  const rx = 13;
  const ry = Math.round(top * 0.62);
  const age = gd.dur - gd.t;
  const fade = Math.min(1, gd.t / 0.4) * (gd.t < 0.4 && Math.floor(t * 14) % 2 === 0 ? 0.5 : 1);
  const snap = age < 0.12;
  const struck = gd.struck < 0.25;
  // the way the blow came, on screen
  const bx = (gd.fx - gd.fy) * 16;
  const by = (gd.fx + gd.fy) * 8;
  const bl = Math.hypot(bx, by) || 1;
  g.globalAlpha = 0.14 * fade;
  g.fillStyle = C[3];
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
  const n = 52;
  const run = Math.floor(t * 30) % n;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ex = Math.cos(a);
    const ey = Math.sin(a);
    const lit = ex < -0.15 && ey < -0.15;
    const hit = struck && (ex * bx + ey * by) / bl > 0.55;
    g.globalAlpha = fade * (hit || snap || lit ? 1 : 0.8);
    g.fillStyle = hit || snap || i === run || i === (run + n / 2) % n ? C[5] : lit ? C[4] : C[3];
    const push = hit ? 1 : 0;
    g.fillRect(Math.round(cx + ex * (rx + push)), Math.round(cy + ey * (ry + push)), hit || lit ? 2 : 1, 1);
  }
  g.globalAlpha = 1;
}

/** The stun: three bronze sparks going round over the head, the near ones bright, the far ones dim. */
function drawStun(g: CanvasRenderingContext2D, sx: number, top: number, t: number, k: Marked): void {
  const C = NEW_RAMP.heavy;
  const grow = Math.min(1, k.stun0 / 0.15);
  const going = Math.min(1, k.stun / 0.2);
  // (over the bar of its life, which hangs at the top of its head)
  const cy = top - 11;
  for (const pass of [0, 1]) {
    for (let i = 0; i < 3; i++) {
      const a = t * 6.5 + (i / 3) * Math.PI * 2;
      const far = Math.sin(a) < 0;
      if ((pass === 0) !== far) continue;
      const px = Math.round(sx + Math.cos(a) * 9 * grow);
      const py = Math.round(cy + Math.sin(a) * 3 * grow);
      g.globalAlpha = going;
      if (far) {
        g.fillStyle = C[2];
        g.fillRect(px - 1, py, 3, 1);
        g.fillRect(px, py - 1, 1, 3);
      } else {
        // a four-pointed spark, white at its heart, with a dark pixel under each arm's end
        g.fillStyle = '#140c06';
        g.fillRect(px - 2, py + 1, 5, 1);
        g.fillRect(px - 1, py + 3, 3, 1);
        g.fillStyle = C[3];
        g.fillRect(px - 2, py, 5, 1);
        g.fillRect(px, py - 2, 1, 5);
        g.fillStyle = C[4];
        g.fillRect(px - 1, py, 3, 1);
        g.fillRect(px, py - 1, 1, 3);
        g.fillStyle = C[5];
        g.fillRect(px, py, 1, 1);
      }
    }
  }
  g.globalAlpha = 1;
}

/** The sigil of a curse over a head: the Hexing glyph, ash with a pale eye, dark round its edge. On a hit, it flares white. */
function drawSigil(g: CanvasRenderingContext2D, sx: number, cy: number, k: Marked, t: number): void {
  const C = NEW_RAMP.hexing;
  const rows = NEW_GLYPH.hexing;
  const n = rows.length;
  const x0 = sx - Math.floor(n / 2);
  const y0 = cy - Math.floor(n / 2);
  const flare = k.flare > 0;
  const going = k.hex > 0 ? Math.min(1, k.hex / 0.3, k.hex0 / 0.12) : 1;
  g.globalAlpha = going;
  g.fillStyle = '#05040a';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] === '.') continue;
      g.fillRect(x0 + c - 1, y0 + r, 3, 1);
      g.fillRect(x0 + c, y0 + r - 1, 1, 3);
    }
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const ch = rows[r][c];
      if (ch === '.') continue;
      g.fillStyle = flare ? C[5] : ch === 'o' ? (Math.sin(t * 5) > -0.3 ? C[5] : C[4]) : r < 2 ? C[4] : C[3];
      g.fillRect(x0 + c, y0 + r, 1, 1);
    }
  }
  if (flare) {
    // a ring of ash thrown off it
    const q = 1 - k.flare / 0.22;
    g.fillStyle = C[4];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      g.fillRect(Math.round(sx + Math.cos(a) * (4 + q * 8)), Math.round(cy + Math.sin(a) * (3 + q * 5)), 1, 1);
    }
  }
  g.globalAlpha = 1;
}

/** Light: the renderer's `spot` (screen x, y, radius, strength) for what glows. */
export function lights3(spot: (x: number, y: number, r: number, a: number) => void, cam: Cam, game: Game, t: number): void {
  for (const p of W3.patches) {
    const fade = fadeOf(p);
    const x = wx(cam, p.x, p.y);
    const y = wy(cam, p.x, p.y);
    if (p.kind === 'vortex') spot(x, y - 4, 20 + p.r * 16, 0.65 * fade);
    else if (p.kind === 'cracks') spot(x, y - 2, 18 + p.r * 14, (p.t < 0.4 ? 0.8 : 0.5) * Math.min(1, (p.dur - p.t) / 0.6));
    else if (p.kind === 'shards') spot(x, y - 2, 16 + p.r * 10, 0.4 * Math.min(1, (p.dur - p.t) / 0.5));
    else spot(x, y - 4, 20 + p.r * 14, 0.7 * fade);
  }
  for (const m of game.monsters) {
    if (m.dead || !m.seen) continue;
    const k = W3.marks.get(m.id);
    if (!k || (k.stun <= 0 && k.hex <= 0 && k.aim <= 0 && k.still <= 0)) continue;
    spot(wx(cam, m.x, m.y), wy(cam, m.x, m.y) - (k.stun > 0 || k.hex > 0 ? FIGURE_SIZE[figureOf(m)].top + 6 : 10), k.aim > 0 ? 26 : 16, 0.55);
  }
  if (W3.guard.t > 0) spot(wx(cam, game.hero.x, game.hero.y), wy(cam, game.hero.x, game.hero.y) - 16, 34, 0.6);
  // Mystical: moonlight where a spell struck, and from the moon at the hero's shoulder
  for (const s of W3.sweeps) spot(wx(cam, s.x, s.y), wy(cam, s.x, s.y) - 12, 24, 0.6 * (1 - s.t / s.dur));
  const M = W3.mystic;
  if (M.shown > 0) spot(moonWas[0], moonWas[1], 12 + M.shown * 3, 0.3 + M.shown * 0.08);
  // Volatile's hidden bomb (WORDS4): a small violet light where each charge sits, brighter as it nears its burst
  for (const b of game.bombs ?? []) {
    const m = game.monsters.find((q) => q.id === b.id && !q.dead);
    const k = 1 - Math.max(0, b.t) / Math.max(0.01, b.dur);
    spot(wx(cam, b.x, b.y), wy(cam, b.x, b.y) - (m ? Math.round(FIGURE_SIZE[figureOf(m)].top * 0.55) : 3), 10 + 8 * k, 0.35 + 0.3 * k);
  }
  void t;
}

// =============================================================================================
// THE DEMO: the playtest's hands (window.__dbg.words3). With WORDS3.on and words set in
// `W3.front` / `W3.behind`, the hero's real attacks call up the words' looks from the game's own
// events, and the demo does the rules' share by hand (it drags, stuns, curses and staggers).

// =============================================================================================
// THE GAME'S OWN WORDS AT WORK (Version 19.3): Heavy, Precise, Frenzied and Guarding, called up by
// what the rules say happened (game.ts: the events 'heavy', 'stun', 'stagger', 'markOn',
// 'markSpent', 'frenzy', 'frenzyFed', 'shield', 'guarded', 'blocked', and the 'zone' of cracks and
// wards). main.ts calls it every frame, with that frame's events, while WORDS3.on. WORDS4 (game/defs.ts):
// Mystical's 'hit' words, 'mysticSplash' and 'buff' of 'arcana'; Volatile's hidden bomb, 'bomb' (and
// its charge drawn from the rules' Game.bombs, `drawBomb`). The other four words (Pulling, Splitting,
// Hexing, Stilling) are still the demo's, below, until their rules are in.

let joinedLevel: unknown = null;
/** The patches the rules laid (not a Heavy blow's own short cracks): one laid again where it lies lasts longer. */
const laid = new WeakSet<Patch>();

export function events3(events: readonly GameEvent[], game: Game, fx: Fx): void {
  if (!WORDS3.on) return;
  const h = game.hero;
  // (a new level: what was left on the last floor is gone)
  if (game.level !== joinedLevel) {
    joinedLevel = game.level;
    if (!W3.demo) clear3();
  }
  const byId = (id: number): Monster | undefined => game.monsters.find((m) => m.id === id && !m.dead);
  // (a hit that spends a mark shows the critical, not the plain Precise hit)
  const spent = new Set<string>();
  for (const e of events) if (e.t === 'markSpent') spent.add(`${e.x},${e.y}`);
  for (const e of events) {
    if (e.t === 'heavy') heavyHit(fx, e.x, e.y, e.r, e.big);
    else if (e.t === 'stun') {
      const m = byId(e.id);
      if (m) stun(m, e.secs);
    } else if (e.t === 'stagger') {
      const m = byId(e.id);
      if (m) {
        stagger(m, e.fromX, e.fromY, game);
        grit(fx, m.x, m.y, 6);
      }
    } else if (e.t === 'markOn') {
      const m = byId(e.id);
      if (m) preciseMark(m, e.secs);
    } else if (e.t === 'markSpent') {
      const m = byId(e.id) ?? game.monsters.find((q) => q.id === e.id);
      if (m) preciseCrit(fx, m, e.dx, e.dy);
    } else if (e.t === 'hit') {
      if (!e.onHero && e.words && e.words.includes('precise') && !spent.has(`${e.x},${e.y}`)) preciseHit(fx, e.x, e.y, e.x - h.x, e.y - h.y);
      // MYSTICAL in front (WORDS4): a spell's hit, in moonlight (the rules leave a word that does nothing there out of `words`)
      if (!e.onHero && e.words && e.words.includes('mystical')) mysticHit(fx, e.x, e.y);
    } else if (e.t === 'mysticSplash') mysticSplash(fx, e.x, e.y, e.to);
    else if (e.t === 'buff' && e.kind === 'arcana') mysticStack(e.x, e.y, e.stacks);
    else if (e.t === 'bomb') bombStuck(fx, e.x, e.y);
    else if (e.t === 'frenzy') frenzyHit(fx, e.x, e.y, e.dx, e.dy);
    else if (e.t === 'frenzyFed') frenzyFed(e.x, e.y);
    else if (e.t === 'shield') guardOn(fx, e.x, e.y, e.secs);
    else if (e.t === 'guarded' || e.t === 'blocked') guardStruck(fx, e.x, e.y, e.fromX, e.fromY);
    else if (e.t === 'zone' && (e.kind === 'cracks' || e.kind === 'ward')) {
      // (laid again where one already lies, that one lasts as long again: they do not pile up)
      const dur = e.dur ?? 4;
      const old = W3.patches.find((p) => laid.has(p) && p.kind === e.kind && Math.hypot(p.x - e.x, p.y - e.y) < 0.6 && p.r >= e.r - 0.1);
      if (old) old.dur = old.t + dur;
      else {
        if (e.kind === 'cracks') crackedGround(e.x, e.y, e.r, dur);
        else ward(e.x, e.y, e.r, dur);
        laid.add(W3.patches[W3.patches.length - 1]);
      }
    }
  }
  // (the frenzy and the shield are shown as the hero has them)
  if (!W3.demo) {
    W3.frenzy.n = h.frenzy;
    W3.frenzy.t = h.frenzyT;
    W3.guard.t = h.shieldT;
  }
}

/** How far a Pulling hit reaches, in tiles (a guess for the pictures: the rules will say). */
const PULL_REACH = 2.2;
/** How far Mystical's splash reaches from what a single-target spell struck, in tiles (a guess for the pictures: the rules will say). */
const MYSTIC_SPLASH = 1.8;

export function demoEvents3(events: readonly GameEvent[], game: Game, fx: Fx): void {
  if (!WORDS3.on) return;
  const h = game.hero;
  const near = (x: number, y: number, r: number): Monster[] => game.monsters.filter((m) => !m.dead && Math.hypot(m.x - x, m.y - y) <= r);
  for (const e of events) {
    if (e.t === 'hit' && e.onHero) {
      // a blow on the hero, turned by the shield or softened by a ward
      if (W3.guard.t > 0 || inside3('ward', h.x, h.y)) {
        const from = near(h.x, h.y, 2.5).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
        guardStruck(fx, h.x, h.y, from ? from.x : h.x + h.fx, from ? from.y : h.y + h.fy);
      }
      continue;
    }
    if (e.t === 'cast' && !e.echo) {
      if (W3.front.includes('guarding')) guardOn(fx, h.x, h.y);
      continue;
    }
    if (e.t === 'hit' && !e.onHero) {
      const struck = near(e.x, e.y, 0.35)[0];
      const dx = e.x - h.x;
      const dy = e.y - h.y;
      if (W3.front.includes('splitting') && W3.clock - lastSplit > 0.3) {
        lastSplit = W3.clock;
        splitHit(fx, e.x, e.y, dx, dy);
      }
      if (W3.front.includes('precise') || W3.behind.includes('precise')) {
        const k = struck ? W3.marks.get(struck.id) : undefined;
        if (struck && k && k.aim > 0) preciseCrit(fx, struck, dx, dy);
        else {
          if (W3.front.includes('precise')) preciseHit(fx, e.x, e.y, dx, dy);
          if (struck && W3.behind.includes('precise')) preciseMark(struck);
        }
      }
      if (W3.front.includes('stilling') && struck) stillHit(fx, struck);
      if (W3.front.includes('heavy')) {
        heavyHit(fx, e.x, e.y, 1.1, false);
        if (struck) {
          stun(struck, 1.6);
          stagger(struck, h.x, h.y, game);
        }
      }
      if (W3.front.includes('pulling')) {
        pullHit(fx, e.x, e.y, PULL_REACH);
        for (const m of near(e.x, e.y, PULL_REACH)) {
          if (m === struck || m.boss) continue;
          const d = Math.hypot(m.x - e.x, m.y - e.y) || 1;
          const stop = 0.62;
          if (d <= stop) continue;
          W3.drags.push({ id: m.id, x0: m.x, y0: m.y, x1: e.x + ((m.x - e.x) / d) * stop, y1: e.y + ((m.y - e.y) / d) * stop, t: 0, dur: 0.24 });
        }
      }
      if (W3.front.includes('hexing') && struck) {
        const k = W3.marks.get(struck.id);
        if (k && k.hex > 0.5) hexFlare(fx, struck);
        else hexHit(fx, struck);
      } else if (struck) hexFlare(fx, struck);
      if (W3.front.includes('mystical')) {
        mysticHit(fx, e.x, e.y);
        // (a spell that strikes one enemy splashes those about it: the demo only shows it, it hurts no one)
        if (W3.single) mysticSplash(fx, e.x, e.y, near(e.x, e.y, MYSTIC_SPLASH).filter((m) => m !== struck));
      }
      if (W3.behind.includes('mystical')) mysticStack(e.x, e.y);
    } else if (e.t === 'swing' && !e.echo && (e.n ?? 0) === 0) {
      if (W3.front.includes('frenzied')) frenzyHit(fx, h.x, h.y, e.dx, e.dy);
      // (a sword's swing is an ability used: a cast is only told of when the ability carries words of the game's own)
      if (W3.front.includes('guarding')) guardOn(fx, h.x, h.y);
      const ax = e.x + e.dx * e.reach * 0.75;
      const ay = e.y + e.dy * e.reach * 0.75;
      leaveBehind(ax, ay, 1.5);
    } else if (e.t === 'burst' && (e.style === 'slam' || e.style === 'land') && !e.echo) {
      leaveBehind(e.x, e.y, Math.max(1.4, e.r));
    } else if (e.t === 'die' && W3.behind.includes('frenzied') && W3.frenzy.n > 0) {
      frenzyFed(e.x, e.y);
    }
  }
}

let lastSplit = -9;

function leaveBehind(x: number, y: number, r: number): void {
  if (W3.behind.includes('pulling')) vortex(x, y, r);
  if (W3.behind.includes('heavy')) crackedGround(x, y, r);
  if (W3.behind.includes('hexing')) hexCircle(x, y, r);
  if (W3.behind.includes('stilling')) bubble(x, y, r);
  if (W3.behind.includes('guarding')) ward(x, y, r);
}

/** The playtest's hands: `window.__dbg.words3` (main.ts). Nothing here runs unless a playtest calls it. */
export function demo3(fx: Fx, getGame: () => Game | null) {
  let listening = false;
  const monster = (id: number): Monster | undefined => getGame()?.monsters.find((m) => m.id === id && !m.dead);
  return {
    switch: WORDS3,
    state: W3,
    clear: clear3,
    /** From now on the hero's attacks show the words in `state.front` and `state.behind` (the game's own events call them up). */
    listen(): void {
      if (listening) return;
      listening = true;
      W3.demo = true;
      const run = fx.handle.bind(fx);
      fx.handle = (events, play) => {
        const g = getGame();
        if (g) demoEvents3(events, g, fx);
        run(events, play);
      };
    },
    pullHit: (x: number, y: number, r: number) => pullHit(fx, x, y, r),
    heavyHit: (x: number, y: number, r: number, big: boolean) => heavyHit(fx, x, y, r, big),
    hexHit: (id: number, secs?: number) => {
      const m = monster(id);
      if (m) hexHit(fx, m, secs);
    },
    hexFlare: (id: number) => {
      const m = monster(id);
      if (m) hexFlare(fx, m);
    },
    frenzyHit: (dx: number, dy: number) => {
      const g = getGame();
      if (g) frenzyHit(fx, g.hero.x, g.hero.y, dx, dy);
    },
    frenzyFed: (x: number, y: number) => frenzyFed(x, y),
    vortex,
    crackedGround,
    hexCircle,
    stun: (id: number, secs: number) => {
      const m = monster(id);
      if (m) stun(m, secs);
    },
    stagger: (id: number, fromX: number, fromY: number) => {
      const m = monster(id);
      if (m) stagger(m, fromX, fromY, getGame() ?? undefined);
    },
    drag: (id: number, x1: number, y1: number, dur = 0.24) => {
      const m = monster(id);
      if (m) W3.drags.push({ id, x0: m.x, y0: m.y, x1, y1, t: 0, dur });
    },
    splitHit: (x: number, y: number, dx: number, dy: number) => splitHit(fx, x, y, dx, dy),
    shards: (x: number, y: number, r?: number) => shards(fx, x, y, r),
    preciseHit: (x: number, y: number, dx: number, dy: number) => preciseHit(fx, x, y, dx, dy),
    preciseMark: (id: number, secs?: number) => {
      const m = monster(id);
      if (m) preciseMark(m, secs);
    },
    stillHit: (id: number, secs?: number) => {
      const m = monster(id);
      if (m) stillHit(fx, m, secs);
    },
    bubble,
    ward,
    guardOn: (secs?: number) => {
      const g = getGame();
      if (g) guardOn(fx, g.hero.x, g.hero.y, secs);
    },
    mysticHit: (x: number, y: number) => mysticHit(fx, x, y),
    mysticSplash: (x: number, y: number, to: { x: number; y: number }[]) => mysticSplash(fx, x, y, to),
    mysticStack: (x: number, y: number, n?: number) => mysticStack(x, y, n),
    /** How fast a monster may move now, for the playtest's walkers: slowed by Stilling. */
    pace: (id: number) => {
      const m = monster(id);
      if (!m) return 1;
      const k = W3.marks.get(id);
      return (k && k.still > 0) || inside3('bubble', m.x, m.y) ? 0.3 : 1;
    },
  };
}
