// THE MELDED WORDS AT WORK: how the ten melded words LOOK (their rules are game/melds.ts and the
// twists in game/game.ts). His words to the planning chat, 16 Oct 2026, 14:21: “I need designs and
// animations for all the new melded damage words”. Read as: each of the ten gets a rune stone and
// a colour of its own, in place of the placeholders of meld/words, and a look at work, in front
// (the hit and its twist) and behind (what it leaves, and its twist), big and wild by his art
// rulebook (Animations 1: “as big and wild and kinetic and weighty as possible”). Drawn the way
// the art chat drew the new words (render/words3.ts): a ramp and a glyph for each word, and the
// looks called up by what the rules say happened.
//
// Everything here takes only where, how big and how far along: no game rules. The renderer, the
// effects and main.ts call it only while MELD3.on, which is false: with it off, the game draws
// exactly as before. The playtest tools/scenarios/meld_looks.mjs switches it on for its own page.
//
// A melded word's look stands in for its two words' looks on what it hits (meldLookWords): an
// Eruption hit is a volcano's, not Power's and Flame's side by side. The shape of the attack (the
// cut, the shot, the blast) keeps its element's colours, and the word's own look is laid on it.

import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { hash2 } from '../engine/rng';
import type { Game } from '../game/game';
import { MELD_TUNE } from '../game/melds';
import type { GameEvent, Monster, Zone } from '../game/state';
import { MELD_IDS, MELD_OF } from '../game/types';
import type { MeldId, WordId } from '../game/types';
import type { Cam, Fx } from './fx';

/** The switch. Off: nothing here is drawn or called, and the game is as it was. */
export const MELD3 = { on: false };

/**
 * Each melded word's colours, darkest to brightest (the last is its white-hot). Index 3 is the
 * word's own colour (WORD_COLOR, WORD_HUE), index 4 its glow (WORD_GLOW). Each chosen to look like
 * the two words in it and to be told apart from every other word, the friend's cyan and the
 * enemy's pink and gold: the nearest any of the ten comes to another colour, as the eye sees colour
 * (CIEDE2000), is 11.7, where Swift and Poison, the nearest two of today's words, are 10.5.
 */
export const MELD_RAMP: Record<MeldId, readonly string[]> = {
  // molten rock: a basalt crust, glowing seams, white-hot
  eruption: ['#1c0806', '#4a1208', '#8a2c0c', '#c25a12', '#ffb43a', '#fff0b0'],
  // snow in shadow, packed ice, powder
  avalanche: ['#1a2430', '#34485c', '#6a8aa2', '#a5c6d7', '#e2f0f8', '#ffffff'],
  // a storm's violet, the bolt's white
  thunder: ['#1c1038', '#3a2070', '#6c48c0', '#bc84ff', '#f0e4ff', '#ffffff'],
  // rot: black-green, olive, sick pale
  blight: ['#161c0a', '#2e3a12', '#52661e', '#7e9a3a', '#b8cc7a', '#e8f0c8'],
  // steam: warm white, wet grey
  scald: ['#2a2024', '#5a4446', '#a08884', '#f2dccc', '#fff4ec', '#ffffff'],
  // fire with lightning in it: red, amber, white-gold
  wildfire: ['#3a1004', '#8a2a06', '#e06a10', '#ffb81c', '#fff4c0', '#ffffff'],
  // sulphur smoke: soot, mustard, sour pale
  fumes: ['#1c1806', '#3e3610', '#76681c', '#b4a02c', '#e0d07a', '#fbf4cc'],
  // a hail cloud's slate, ice-white
  hailstorm: ['#141a34', '#2c3a6a', '#6878b8', '#cad6ff', '#eef2ff', '#ffffff'],
  // a cold bruise blue
  frostbite: ['#0a1428', '#142a50', '#22508a', '#3a78b8', '#8cc0ec', '#e4f4ff'],
  // a sick electric green
  contagion: ['#08240c', '#105a1a', '#22a02c', '#62ff5a', '#c4ffb0', '#f4fff0'],
};
export const MELD_COLOR = Object.fromEntries(MELD_IDS.map((w) => [w, MELD_RAMP[w][3]])) as Record<MeldId, string>;
export const MELD_GLOW = Object.fromEntries(MELD_IDS.map((w) => [w, MELD_RAMP[w][4]])) as Record<MeldId, string>;

/**
 * The words' glyphs, cut in the rune stone as the others are (art/icons.ts, GLYPH): 7x7, 'X' the
 * word's colour, 'o' its glowing core. Strokes run along rows and columns, or two pixels thick on a
 * slant: the stone's carving shades the top and left of every cut, and a slant one pixel thick
 * comes out as a chequer.
 */
export const MELD_GLYPH: Record<MeldId, readonly string[]> = {
  // a mountain blowing its top
  eruption: ['o..o..o', '.o.o.o.', '...o...', '..XoX..', '.XXoXX.', '.XXXXX.', 'XXXXXXX'],
  // a mountainside shedding its snow
  avalanche: ['X......', 'XX..o..', 'XXX...o', 'XXXX.o.', 'XXXXX..', 'XXXXXXo', 'XXXXXXX'],
  // a storm cloud and its one great bolt
  thunder: ['.XX.XX.', 'XXXXXXX', '.......', '...oo..', '..oo...', '...oo..', '..o....'],
  // a dead tree standing in rot
  blight: ['X..X..X', '.X.X.X.', '..XXX..', '...X...', '...X...', '.ooXoo.', 'ooooooo'],
  // steam rising off scalding water
  scald: ['.XX.XX.', 'XX.XX..', '.XX.XX.', '..XX.XX', '.......', 'XoooooX', '.XXXXX.'],
  // a flame with lightning at its heart
  wildfire: ['...X...', '..XX...', '.XXXX.X', '.XooXXX', 'XXXooXX', 'XXooXXX', '.XXXXX.'],
  // a cloud of fumes billowing up off a fire
  fumes: ['.XX.XX.', 'XXXXXXX', '.XXXXX.', '..XXX..', '..XoX..', '.ooooo.', 'ooooooo'],
  // a storm cloud and its hail
  hailstorm: ['.XXXXX.', 'XXXXXXX', '.XXXXX.', '.......', 'o.o..o.', '..o.o..', 'o....o.'],
  // jaws of ice, and a drop of venom
  frostbite: ['XXXXXXX', 'XXX.XXX', '.X...X.', '.X...X.', '.......', '...o...', '..ooo..'],
  // the sick, each passing it on to the next
  contagion: ['oo...oo', 'oo...oo', '..X.X..', '...o...', '..X.X..', 'oo...oo', 'oo...oo'],
};

/** What each glyph is, for the pictures' labels. */
export const MELD_GLYPH_IS: Record<MeldId, string> = {
  eruption: 'a mountain blowing its top',
  avalanche: 'a mountainside shedding its snow',
  thunder: 'a storm cloud and its one great bolt',
  blight: 'a dead tree standing in rot',
  scald: 'steam rising off scalding water',
  wildfire: 'a flame with lightning at its heart',
  fumes: 'fumes billowing up off a fire',
  hailstorm: 'a storm cloud and its hail',
  frostbite: 'jaws of ice and a drop of venom',
  contagion: 'the sick, each passing it on',
};

const isMeldId = (w: WordId): w is MeldId => (MELD_IDS as readonly WordId[]).includes(w);

/** The melded words among `w`, if any. */
export function meldsIn(w: readonly WordId[] | undefined): MeldId[] {
  return w ? w.filter(isMeldId) : [];
}

/**
 * The words whose own marks the effects draw on what an attack hits (fx.ts): with the switch on, a
 * melded word's two words are left out, its own look takes their place. Off, the words as they are.
 */
export function meldLookWords(w: readonly WordId[] | undefined): readonly WordId[] | undefined {
  if (!MELD3.on || !w) return w;
  const m = meldsIn(w);
  if (!m.length) return w;
  const parts = new Set<WordId>(m.flatMap((x) => MELD_OF[x]));
  return w.filter((x) => !parts.has(x));
}

/** Whether the effects should leave this event to the melded words' looks (fx.ts): a bolt, a blast or a patch laid by a melded word's twist. */
export function meldOwnsEvent(e: GameEvent): boolean {
  if (!MELD3.on) return false;
  return (e.t === 'arc' || e.t === 'burst' || e.t === 'zone') && e.meld !== undefined && !!lookOfKind(e.meld, e.t === 'zone' ? e.kind : null, e.t);
}

// =============================================================================================
// What is going on.

/** A bolt along the ground (or a short crawl of lightning), world points x0, y0, x1, y1 ... */
interface Bolt3 {
  pts: number[];
  t: number;
  dur: number;
  C: readonly string[];
  /** 1, 2 or 3 pixels thick at its core. */
  w: number;
  /** Ice: crystals along it. Fire: flames along it. */
  kind: 'plain' | 'ice' | 'fire';
  z: number;
}

/** A bolt from the sky onto (x, y): its joints' sideways steps on the screen, and its forks. */
interface Sky3 {
  x: number;
  y: number;
  top: number;
  offs: number[];
  forks: { at: number; offs: number[] }[];
  t: number;
  dur: number;
  C: readonly string[];
  w: number;
}

/** A lava bomb (Eruption), a hailstone or a glob thrown up and coming down at (x1, y1). */
interface Bomb {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  dur: number;
  h: number;
  word: MeldId;
}

/** A mark left on the floor: a burnt star (Thunder), a fissure (Eruption), a furrow of snow (Avalanche). */
interface Scar {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  kind: 'star' | 'fissure' | 'furrow';
  seed: number;
  /** Lines, world offsets from (x, y): x0, y0, x1, y1 ... (a furrow: its far end at x1, y1 as an offset). */
  lines: number[][];
  word: MeldId;
}

/** A column standing up off the floor for a moment: Eruption's lava, Scald's geysers. */
interface Column {
  x: number;
  y: number;
  t: number;
  dur: number;
  h: number;
  w: number;
  word: MeldId;
}

/** Frostbite's jaws closing on monster `id`. */
interface Clamp {
  id: number;
  t: number;
  dur: number;
  big: boolean;
  /** Where it was drawn this frame, on the screen: x, the middle of the figure, its half-width. */
  at?: [number, number, number];
}

/** Avalanche's shove: the picture of monster `id` slides from (x0, y0) to (x1, y1), where the rules have already put it. */
interface Slide {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  dur: number;
  frozen: boolean;
}

/** What a melded word has done to one monster. */
interface Mark {
  /** Thunder's stun: seconds left, seconds since. */
  thunder: number;
  thunder0: number;
  /** Blight in front has struck it: its poison bites harder as its life runs out, and it rots. */
  blight: boolean;
  /** Avalanche behind's crush: seconds since. */
  crush: number;
  /** Frostbite: the half-second step of its last bite. */
  bite: number;
}

export const M3 = {
  clock: 0,
  dt: 0,
  later: [] as { t: number; fn: () => void }[],
  bolts: [] as Bolt3[],
  skies: [] as Sky3[],
  bombs: [] as Bomb[],
  scars: [] as Scar[],
  columns: [] as Column[],
  clamps: [] as Clamp[],
  slides: [] as Slide[],
  marks: new Map<number, Mark>(),
  /** A flash over the whole screen (Thunder's bolt and clap): seconds since, how long, colour, strength. */
  flash: { t: 9, dur: 0.1, color: '#ffffff', a: 0 },
  /** The hero's own: Eruption's heat (0 to full) and Thunder's count toward the clap. */
  heat: 0,
  heatFull: MELD_TUNE.eruption.heat,
  claps: -1,
  clapEvery: MELD_TUNE.thunder.every,
  /** The hero stands hidden in Scald's steam. */
  hidden: false,
};

const MAX_PARTICLES = 900;
const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
const pick = (list: readonly string[]): string => list[Math.floor(Math.random() * list.length)];
const smooth = (q: number): number => q * q * (3 - 2 * q);

function markOf(id: number): Mark {
  let m = M3.marks.get(id);
  if (!m) {
    m = { thunder: 0, thunder0: 0, blight: false, crush: 9, bite: -1 };
    M3.marks.set(id, m);
  }
  return m;
}

/** Forget everything (a new level, or the page starts again). */
export function clearM3(): void {
  M3.later.length = 0;
  M3.bolts.length = 0;
  M3.skies.length = 0;
  M3.bombs.length = 0;
  M3.scars.length = 0;
  M3.columns.length = 0;
  M3.clamps.length = 0;
  M3.slides.length = 0;
  M3.marks.clear();
  M3.flash.t = 9;
  M3.heat = 0;
  M3.claps = -1;
  M3.hidden = false;
}

// =============================================================================================
// Bits the looks are made of.

// (the screen's own sums, as fx.ts has them: copied, so that fx.ts can call this file without the two leaning on each other)
const wx = (c: Cam, x: number, y: number): number => c.ox + (x - y) * 16;
const wy = (c: Cam, x: number, y: number): number => c.oy + (x + y) * 8 - (c.lift ? c.lift(x, y) : 0);

/** A one-pixel line (fx.ts, pline). */
function pline(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  g.fillStyle = color;
  for (let n = 0; n < 500; n++) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/** A line `w` pixels thick (each row of it a one-pixel line). */
function thick(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, w: number): void {
  for (let i = 0; i < w; i++) {
    const o = i - Math.floor((w - 1) / 2);
    pline(g, x0 + o, y0, x1 + o, y1, color);
  }
}

type P3 = Fx['particles'][number];
function add(fx: Fx, p: P3): void {
  if (fx.particles.length < MAX_PARTICLES) fx.particles.push(p);
}

/** Things flung out from (x, y): along (dx, dy) if given, otherwise all round. */
function fling(fx: Fx, x: number, y: number, n: number, colors: readonly string[], o: { speed: number; up?: number; grav?: number; life?: number; z?: number; size?: number; r?: number; dx?: number; dy?: number; spread?: number; streak?: number; ramp?: readonly string[] }): void {
  const base = o.dx !== undefined && o.dy !== undefined ? Math.atan2(o.dy, o.dx) : null;
  for (let i = 0; i < n; i++) {
    const a = base === null ? Math.random() * Math.PI * 2 : base + rnd(-1, 1) * (o.spread ?? 0.5);
    const s = rnd(0.45, 1) * o.speed;
    const d = rnd(0, o.r ?? 0.15);
    const life = rnd(0.6, 1) * (o.life ?? 0.5);
    add(fx, {
      x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: (o.z ?? 8) + rnd(-2, 2), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(0.5, 1) * (o.up ?? 0),
      life, life0: o.ramp ? life : undefined, ramp: o.ramp, color: pick(colors), size: o.size ?? (Math.random() < 0.35 ? 2 : 1), grav: o.grav ?? 0, streak: o.streak,
    });
  }
}

/** Soft puffs that rise and darken (smoke, steam, snow cloud, rot), from (x, y) within `r`. */
function puffs(fx: Fx, x: number, y: number, r: number, n: number, ramp: readonly string[], o: { up?: number; z?: number; life?: number; drift?: number; dx?: number; dy?: number } = {}): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random()) * r;
    const life = rnd(0.7, 1.2) * (o.life ?? 0.9);
    add(fx, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: (o.z ?? 4) + rnd(0, 6), vx: (o.dx ?? 0) + rnd(-1, 1) * (o.drift ?? 0.3), vy: (o.dy ?? 0) + rnd(-1, 1) * (o.drift ?? 0.3), vz: rnd(0.5, 1) * (o.up ?? 26), life, life0: life, ramp, color: ramp[0], size: 3, grav: -4 });
  }
}

function ring(fx: Fx, x: number, y: number, r: number, dur: number, colors: readonly string[], o: { fill?: boolean; heavy?: boolean; closing?: boolean; jag?: boolean; delay?: number; double?: boolean; swirl?: boolean } = {}): void {
  fx.rings.push({ x, y, r, t: 0, dur, colors, fill: !!o.fill, heavy: o.heavy, closing: o.closing, jag: o.jag, delay: o.delay, double: o.double, swirl: o.swirl });
}

function flash(fx: Fx, x: number, y: number, z: number, r: number, dur: number, colors: readonly string[]): void {
  fx.flashes.push({ x, y, z, r, t: 0, dur, colors });
}

function glow(fx: Fx, x: number, y: number, r: number, dur: number): void {
  if (fx.glows.length < 24) fx.glows.push({ x, y, r, t: 0, dur });
}

function later(t: number, fn: () => void): void {
  M3.later.push({ t, fn });
}

/** The whole screen lit for an instant. */
function screenFlash(color: string, a: number, dur = 0.09): void {
  if (M3.flash.t < M3.flash.dur && M3.flash.a > a) return;
  M3.flash = { t: 0, dur, color, a };
}

/** A jagged way from (x0, y0) to (x1, y1), world points. */
function jagged(x0: number, y0: number, x1: number, y1: number, wob = 0.3): number[] {
  const pts: number[] = [x0, y0];
  const segs = Math.max(3, Math.min(9, Math.round(Math.hypot(x1 - x0, y1 - y0) * 2)));
  for (let i = 1; i < segs; i++) {
    const k = i / segs;
    pts.push(x0 + (x1 - x0) * k + rnd(-wob, wob), y0 + (y1 - y0) * k + rnd(-wob, wob));
  }
  pts.push(x1, y1);
  return pts;
}

/** A bolt along the ground from (x0, y0) to (x1, y1). */
function bolt(x0: number, y0: number, x1: number, y1: number, C: readonly string[], o: { w?: number; dur?: number; kind?: Bolt3['kind']; wob?: number; z?: number } = {}): void {
  M3.bolts.push({ pts: jagged(x0, y0, x1, y1, o.wob ?? 0.3), t: 0, dur: o.dur ?? 0.18, C, w: o.w ?? 1, kind: o.kind ?? 'plain', z: o.z ?? 10 });
  if (M3.bolts.length > 60) M3.bolts.shift();
}

/** A bolt from the sky onto (x, y), `top` pixels high, `w` thick, with `forks`. */
function skyBolt(x: number, y: number, C: readonly string[], o: { top?: number; w?: number; dur?: number; forks?: number; wild?: number } = {}): void {
  const top = o.top ?? 150;
  const joints = Math.max(6, Math.round(top / 18));
  const offs: number[] = [];
  let drift = 0;
  const wild = o.wild ?? 9;
  for (let i = 0; i < joints; i++) {
    drift += rnd(-wild, wild);
    drift *= 0.75;
    offs.push(drift);
  }
  // (it comes down onto the point: the last joint is over it)
  offs[0] = 0;
  const forks: Sky3['forks'] = [];
  for (let f = 0; f < (o.forks ?? 2); f++) {
    const at = 1 + Math.floor(Math.random() * (joints - 2));
    const side = Math.random() < 0.5 ? -1 : 1;
    const fo: number[] = [];
    let fx0 = offs[at];
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      fx0 += side * rnd(3, 10);
      fo.push(fx0);
    }
    forks.push({ at, offs: fo });
  }
  M3.skies.push({ x, y, top, offs, forks, t: 0, dur: o.dur ?? 0.22, C, w: o.w ?? 2 });
  if (M3.skies.length > 16) M3.skies.shift();
}

/** A scar on the floor: a burnt star of `n` rays, or a fissure's web. */
function scar(word: MeldId, kind: Scar['kind'], x: number, y: number, r: number, dur: number, n = 7): Scar {
  const seed = Math.floor(Math.random() * 1e6);
  const lines: number[][] = [];
  const a0 = Math.random() * Math.PI * 2;
  for (let k = 0; k < n; k++) {
    const a = a0 + (k / n) * Math.PI * 2 + (hash2(seed, k, 1) - 0.5) * 0.6;
    const len = r * (0.55 + hash2(seed, k, 2) * 0.5);
    const segs = 3;
    const pts = [Math.cos(a) * r * 0.08, Math.sin(a) * r * 0.08];
    for (let i = 1; i <= segs; i++) {
      const d = (len * i) / segs;
      const j = (hash2(seed, k * 4 + i, 3) - 0.5) * r * 0.25;
      pts.push(Math.cos(a) * d - Math.sin(a) * j, Math.sin(a) * d + Math.cos(a) * j);
    }
    lines.push(pts);
  }
  const s: Scar = { x, y, r, t: 0, dur, kind, seed, lines, word };
  M3.scars.push(s);
  if (M3.scars.length > 40) M3.scars.shift();
  return s;
}

/** A monster near (x, y), the nearest within `r`. */
function struckAt(game: Game, x: number, y: number, r = 0.35): Monster | undefined {
  let best: Monster | undefined;
  let bd = r;
  for (const m of game.monsters) {
    if (m.dead) continue;
    const d = Math.hypot(m.x - x, m.y - y);
    if (d <= bd) {
      bd = d;
      best = m;
    }
  }
  return best;
}

// =============================================================================================
// IN FRONT: each word on what it hits. `big`: an area ability's blast, out to `r`; otherwise one hit.

/**
 * ERUPTION (Power and Flame): the hit is a volcano's. The game holds its breath; white-hot light;
 * molten rock bursts up and comes down cooling to black, stone is thrown, a ring of lava runs out
 * and a column of smoke stands up off it. (The pool it leaves is the rules': its look is below.)
 */
function eruptionHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = MELD_RAMP.eruption;
  fx.hold(big ? 0.09 : 0.06);
  fx.shake = Math.max(fx.shake, big ? 6.5 : 4.2);
  flash(fx, x, y, big ? 4 : 10, big ? Math.min(1.6, r * 0.55) : 0.6, 0.12, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 1.0, 0.3, [C[5], C[4], C[3], C[2]], { heavy: true, fill: big });
  ring(fx, x, y, (big ? r : 1.0) * 1.3, 0.42, ['#5a4a44', '#3e322e', '#2a2220'], { delay: 0.05 });
  // molten rock flung high, cooling from white to black as it flies
  const lava = [C[5], C[4], C[4], C[3], C[2], C[1]];
  for (let i = 0; i < (big ? 22 : 12); i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rnd(0.8, big ? 4.2 : 2.8);
    const life = rnd(0.55, 0.95);
    add(fx, { x: x + Math.cos(a) * 0.1, y: y + Math.sin(a) * 0.1, z: rnd(4, 10), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(110, big ? 230 : 190), life, life0: life, ramp: lava, color: C[4], size: Math.random() < 0.55 ? 3 : 2, grav: 430 });
  }
  // black stone
  fling(fx, x, y, big ? 12 : 6, [C[0], C[1], '#2c2420'], { speed: big ? 3.6 : 2.6, up: 140, grav: 520, life: 0.7, z: 4, size: 2 });
  // sparks streaking out
  fling(fx, x, y, big ? 14 : 8, [C[5], C[4], '#ffffff'], { speed: 6, up: 60, grav: 200, life: 0.3, z: 10, streak: 3, size: 1 });
  // a column of smoke stands up off it
  puffs(fx, x, y, 0.3, big ? 9 : 5, ['#6a5048', '#4a3a36', '#33282a', '#221c1e'], { up: 46, z: 10, life: 1.2, drift: 0.2 });
  glow(fx, x, y, big ? 60 + r * 20 : 50, 0.35);
  // an area blow: the ground bursts in jets all round the ring, never on the hero himself
  if (big) {
    const n = 4 + Math.round(r);
    const a0 = Math.random() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2 + rnd(-0.2, 0.2);
      const d = r * rnd(0.7, 0.95);
      M3.columns.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, t: -i * 0.03, dur: 0.4, h: rnd(30, 46), w: 2, word: 'eruption' });
    }
  }
}

/**
 * AVALANCHE (Power and Frost): the hit is a slab of snow and ice smashing down. A white flash, a
 * heavy ring, snow blown out the way the blow went in a cone, blocks of ice tumbling after it, a
 * cloud of powder hanging. (The shove is the rules'; the picture slides it: `shoved`.)
 */
function avalancheHit(fx: Fx, x: number, y: number, dx: number, dy: number, r: number, big: boolean): void {
  const C = MELD_RAMP.avalanche;
  fx.hold(big ? 0.08 : 0.05);
  fx.shake = Math.max(fx.shake, big ? 6 : 4);
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  flash(fx, x, y, 10, big ? Math.min(1.4, r * 0.5) : 0.55, 0.12, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 1.0, 0.28, [C[5], C[4], C[3]], { heavy: true });
  // a cone of snow blown out along the blow (all round, for a blast)
  const snow = [C[5], C[5], C[4], C[3]];
  if (big) fling(fx, x, y, 34, snow, { speed: 5, up: 40, grav: 90, life: 0.6, z: 3, r: r * 0.3 });
  else fling(fx, x, y, 26, snow, { speed: 5.5, up: 40, grav: 90, life: 0.55, z: 6, dx: ux, dy: uy, spread: 0.7 });
  // blocks of ice tumbling after it, falling hard
  for (let i = 0; i < (big ? 14 : 8); i++) {
    const a = big ? Math.random() * Math.PI * 2 : Math.atan2(uy, ux) + rnd(-0.6, 0.6);
    const s = rnd(1.5, 3.8);
    add(fx, { x, y, z: rnd(6, 14), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(60, 130), life: rnd(0.5, 0.8), color: pick([C[4], C[3], C[2]]), size: 3, grav: 520 });
  }
  // a cloud of powder hangs where it struck, drifting on
  puffs(fx, x, y, big ? r * 0.6 : 0.4, big ? 12 : 7, [C[5], C[4], C[4], C[3]], { up: 14, z: 2, life: 1.1, dx: big ? 0 : ux * 0.8, dy: big ? 0 : uy * 0.8, drift: 0.4 });
  glow(fx, x, y, 44, 0.25);
}

/**
 * THUNDER (Power and Lightning), on each hit: what it strikes crackles violet. (The one great bolt
 * out of the sky is its arc: `thunderBolt`.)
 */
function thunderHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = MELD_RAMP.thunder;
  flash(fx, x, y, 12, big ? 0.9 : 0.45, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.8, 0.2, [C[5], C[4], C[3]], { jag: true, heavy: true });
  fling(fx, x, y, big ? 16 : 10, [C[5], C[4], C[3]], { speed: 5.5, up: 40, grav: 120, life: 0.25, z: 12, streak: 3, size: 1 });
  for (let i = 0; i < (big ? 6 : 3); i++) {
    const a = Math.random() * Math.PI * 2;
    const d = big ? r * rnd(0.5, 1) : rnd(0.5, 0.9);
    bolt(x, y, x + Math.cos(a) * d, y + Math.sin(a) * d, C, { w: 1, dur: 0.14, wob: 0.15 });
  }
  if (big) thunderBolt(fx, x, y, true);
}

/**
 * THUNDER in front: ONE GREAT BOLT out of the sky in place of the arcs. Thick, white at its heart
 * and violet round it, forking, flickering; the screen goes white; the game holds; the ground
 * where it strikes is blasted into a burnt star that glows and cools; dust and stone are thrown.
 */
function thunderBolt(fx: Fx, x: number, y: number, big: boolean): void {
  const C = MELD_RAMP.thunder;
  skyBolt(x, y, C, { top: big ? 230 : 200, w: 3, dur: 0.3, forks: 3, wild: 11 });
  // (a second, thinner, a breath after: the bolt strikes twice)
  later(0.07, () => skyBolt(x + rnd(-0.15, 0.15), y + rnd(-0.15, 0.15), C, { top: 180, w: 1, dur: 0.16, forks: 1 }));
  fx.hold(0.1);
  fx.shake = Math.max(fx.shake, big ? 7 : 5.5);
  screenFlash(C[4], 0.24, 0.07);
  flash(fx, x, y, 6, 0.9, 0.14, [C[5], C[5], C[4], C[3]]);
  ring(fx, x, y, 1.5, 0.32, [C[5], C[4], C[3], C[2]], { jag: true, heavy: true });
  ring(fx, x, y, 2.1, 0.45, ['#6a6070', '#4a4250', '#2e2a36'], { delay: 0.04 });
  fling(fx, x, y, 14, ['#8a7c90', '#5a5060', C[2]], { speed: 3.4, up: 150, grav: 480, life: 0.6, z: 2, size: 2 });
  fling(fx, x, y, 18, [C[5], C[4]], { speed: 7, up: 30, grav: 100, life: 0.22, z: 4, streak: 4, size: 1 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + rnd(-0.3, 0.3);
    bolt(x, y, x + Math.cos(a) * rnd(1.2, 2.0), y + Math.sin(a) * rnd(1.2, 2.0), C, { w: 2, dur: 0.2, wob: 0.25, z: 2 });
  }
  scar('thunder', 'star', x, y, 1.3, 2.4, 8);
  glow(fx, x, y, 110, 0.25);
}

/**
 * BLIGHT (Power and Poison): the hit is rot. A dark spatter thrown down hard, a ring of it closing
 * in, ash rising. What it strikes is marked: while the poison works in it, it rots, the worse the
 * lower its life (`rotting`).
 */
function blightHit(fx: Fx, x: number, y: number, r: number, big: boolean, m?: Monster): void {
  const C = MELD_RAMP.blight;
  fx.hold(big ? 0.06 : 0.04);
  fx.shake = Math.max(fx.shake, big ? 4.5 : 3);
  flash(fx, x, y, 10, big ? 0.9 : 0.55, 0.14, [C[3], C[2], C[1], C[0]]);
  ring(fx, x, y, big ? r : 0.9, 0.3, [C[4], C[3], C[2], C[1]], { closing: true, heavy: true });
  // a wave of dark rot running out low over the floor
  ring(fx, x, y, big ? r * 1.3 : 1.4, 0.4, [C[1], C[0], '#0a0c06'], { heavy: true, delay: 0.04 });
  ring(fx, x, y, big ? r * 1.1 : 1.1, 0.26, [C[2], C[1], C[0]], { fill: true });
  // a spatter of rot, heavy, falling and sticking
  fling(fx, x, y, big ? 26 : 14, [C[1], C[2], C[3], '#1a1408'], { speed: big ? 4 : 2.8, up: 80, grav: 380, life: 0.6, z: 10, size: 2 });
  // ash and spores rising off it, slow
  for (let i = 0; i < (big ? 16 : 9); i++) {
    const life = rnd(0.7, 1.3);
    add(fx, { x: x + rnd(-0.3, 0.3), y: y + rnd(-0.3, 0.3), z: rnd(6, 18), vx: rnd(-0.25, 0.25), vy: rnd(-0.25, 0.25), vz: rnd(8, 22), life, life0: life, ramp: [C[4], C[3], C[2], C[1]], color: C[3], size: 1, grav: -2 });
  }
  if (m) markOf(m.id).blight = true;
  glow(fx, x, y, 30, 0.2);
}

/**
 * SCALD (Flame and Frost), on each hit: fire and ice twist round each other and boil. Embers and
 * splinters of ice spiral up round the point the opposite ways, steam hisses out of the middle.
 */
function scaldHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = MELD_RAMP.scald;
  const R = big ? r * 0.7 : 0.45;
  flash(fx, x, y, 12, big ? 0.8 : 0.42, 0.1, [C[5], C[4], '#ffc24a']);
  ring(fx, x, y, big ? r : 0.75, 0.22, ['#ffffff', '#ffc24a', '#58a8f0'], { swirl: true, heavy: true });
  const n = big ? 14 : 8;
  for (let i = 0; i < n; i++) {
    for (const side of [1, -1]) {
      const a = (i / n) * Math.PI * 2;
      const sp = rnd(1.4, 2.4);
      // (each goes round as it climbs: across the way out, one way for the fire, the other for the ice)
      add(fx, {
        x: x + Math.cos(a) * R * 0.3, y: y + Math.sin(a) * R * 0.3, z: rnd(4, 10),
        vx: Math.cos(a) * sp * 0.5 - Math.sin(a) * sp * side, vy: Math.sin(a) * sp * 0.5 + Math.cos(a) * sp * side, vz: rnd(40, 80),
        life: rnd(0.35, 0.55), color: side > 0 ? pick(['#fff0a0', '#ffc24a', '#ff8a2a']) : pick(['#ffffff', '#b0e0ff', '#58a8f0']), size: 2, grav: 60,
      });
    }
  }
  puffs(fx, x, y, big ? r * 0.5 : 0.25, big ? 12 : 6, [C[5], C[4], C[3], C[2]], { up: 50, z: 8, life: 0.9, drift: 0.5 });
  fling(fx, x, y, big ? 10 : 6, [C[5], '#ffffff'], { speed: 4.5, up: 70, grav: -20, life: 0.3, z: 10, streak: 4, size: 1 });
}

/**
 * SCALD's twist in front: a burning enemy chilled, or a chilled one set burning, CRACKS. Its shell
 * of ice bursts outward, jets of steam blast out all round, scalding drops rain down, a white flash.
 */
function scaldCrack(fx: Fx, x: number, y: number, r: number): void {
  const C = MELD_RAMP.scald;
  fx.hold(0.08);
  fx.shake = Math.max(fx.shake, 4.5);
  flash(fx, x, y, 12, 0.9, 0.14, ['#ffffff', C[4], '#ffc24a', '#ff8a2a']);
  ring(fx, x, y, r * 1.4, 0.3, ['#ffffff', C[4], C[3]], { heavy: true, fill: true });
  ring(fx, x, y, r * 1.9, 0.38, ['#b0e0ff', '#58a8f0', '#2e6cc8'], { jag: true, delay: 0.04 });
  // the shell of ice bursts
  fling(fx, x, y, 22, ['#ffffff', '#b0e0ff', '#58a8f0'], { speed: 6, up: 120, grav: 420, life: 0.6, z: 12, streak: 3, size: 1 });
  // jets of steam blasting out all round
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + rnd(-0.2, 0.2);
    for (let i = 0; i < 4; i++) {
      const life = rnd(0.4, 0.7);
      add(fx, { x, y, z: rnd(8, 14), vx: Math.cos(a) * rnd(3, 5.5), vy: Math.sin(a) * rnd(3, 5.5), vz: rnd(20, 50), life, life0: life, ramp: [C[5], C[5], C[4], C[3]], color: C[5], size: 3, grav: -30 });
    }
  }
  // scalding drops raining down
  fling(fx, x, y, 14, ['#ffc24a', '#ff8a2a', C[4]], { speed: 2.6, up: 160, grav: 460, life: 0.75, z: 14, size: 1 });
  puffs(fx, x, y, 0.6, 12, [C[5], C[4], C[3], C[2]], { up: 60, z: 10, life: 1.2, drift: 0.6 });
  glow(fx, x, y, 60, 0.3);
}

/**
 * WILDFIRE (Flame and Lightning), on each hit: fire that crackles like lightning. Flames burst up,
 * short forks of burning lightning leap out from it, embers spark.
 */
function wildfireHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = MELD_RAMP.wildfire;
  flash(fx, x, y, 10, big ? 0.9 : 0.5, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.85, 0.22, [C[5], C[4], C[3], C[2]], { jag: true, heavy: big });
  fx.flames(x, y, big ? r * 0.7 : 0.3, big ? 18 : 8, 1.3);
  for (let i = 0; i < (big ? 7 : 4); i++) {
    const a = Math.random() * Math.PI * 2;
    const d = big ? r * rnd(0.6, 1.1) : rnd(0.7, 1.2);
    bolt(x, y, x + Math.cos(a) * d, y + Math.sin(a) * d, C, { w: 2, dur: 0.2, kind: 'fire', wob: 0.2 });
  }
  fling(fx, x, y, big ? 16 : 9, [C[5], C[4], C[3]], { speed: 5, up: 100, grav: 180, life: 0.45, z: 10, streak: 2, size: 1 });
  glow(fx, x, y, big ? 70 : 40, 0.25);
}

/**
 * FUMES (Flame and Poison), on each hit: it smokes. A dark sour smoke bursts off what it strikes,
 * embers glowing in it, a sick yellow ring.
 */
function fumesHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = MELD_RAMP.fumes;
  flash(fx, x, y, 10, big ? 0.7 : 0.4, 0.1, [C[5], C[4], '#ff8a2a']);
  ring(fx, x, y, big ? r : 0.8, 0.28, [C[4], C[3], C[2]], { fill: true });
  puffs(fx, x, y, big ? r * 0.6 : 0.3, big ? 16 : 8, [C[3], C[2], C[1], '#2a2418'], { up: 36, z: 8, life: 1.1, drift: 0.5 });
  fling(fx, x, y, big ? 10 : 6, ['#ffc24a', '#ff8a2a', C[4]], { speed: 3, up: 70, grav: 100, life: 0.5, z: 10, size: 1 });
  fling(fx, x, y, big ? 12 : 6, [C[4], C[3]], { speed: 2.2, up: 60, grav: 300, life: 0.5, z: 10, size: 2 });
}

/**
 * FUMES' twist in front: a burning, poisoned enemy gives off a toxic cloud. It billows up out of it,
 * a sour column of smoke with embers in it (the cloud itself is the rules', drawn below).
 */
function fumesCloud(fx: Fx, x: number, y: number, r: number): void {
  const C = MELD_RAMP.fumes;
  ring(fx, x, y, r, 0.45, [C[4], C[3], C[2], C[1]], { fill: true, heavy: true });
  puffs(fx, x, y, 0.3, 14, [C[4], C[3], C[2], C[1]], { up: 70, z: 10, life: 1.3, drift: 0.3 });
  puffs(fx, x, y, r * 0.8, 10, [C[3], C[2], C[1], '#221c10'], { up: 20, z: 2, life: 1.4, drift: 0.6 });
  fling(fx, x, y, 8, ['#ffc24a', '#ff8a2a'], { speed: 1.5, up: 90, grav: 40, life: 0.8, z: 8, size: 1 });
}

/**
 * HAILSTORM (Frost and Lightning), on each hit: ice-white lightning and hail. A jagged pale ring,
 * hailstones hammering down and bouncing, splinters of ice.
 */
function hailHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = MELD_RAMP.hailstorm;
  flash(fx, x, y, 12, big ? 0.8 : 0.45, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.8, 0.22, [C[5], C[4], C[3]], { jag: true, heavy: true });
  hailDown(x, y, big ? r * 0.8 : 0.5, big ? 12 : 6);
  fling(fx, x, y, big ? 14 : 8, ['#ffffff', C[4], '#b0e0ff'], { speed: 4.5, up: 110, grav: 400, life: 0.5, z: 12, streak: 3, size: 1 });
  for (let i = 0; i < (big ? 4 : 2); i++) {
    const a = Math.random() * Math.PI * 2;
    bolt(x, y, x + Math.cos(a) * rnd(0.6, 1.1), y + Math.sin(a) * rnd(0.6, 1.1), C, { w: 1, dur: 0.15, kind: 'ice' });
  }
}

/** Hailstones coming down round (x, y) within `r`: each falls from high up, strikes and bounces. */
function hailDown(x: number, y: number, r: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random()) * r;
    const x1 = x + Math.cos(a) * d;
    const y1 = y + Math.sin(a) * d;
    M3.bombs.push({ x0: x1 + rnd(-0.1, 0.1), y0: y1 + rnd(-0.1, 0.1), x1, y1, t: -rnd(0, 0.15), dur: rnd(0.16, 0.24), h: rnd(50, 80), word: 'hailstorm' });
  }
  if (M3.bombs.length > 120) M3.bombs.splice(0, M3.bombs.length - 120);
}

/**
 * FROSTBITE (Frost and Poison), on each hit: jaws of ice close on what it strikes and bite, a
 * crunch, a puff of cold, sick mist, drops of venom.
 */
function frostbiteHit(fx: Fx, x: number, y: number, r: number, big: boolean, m?: Monster): void {
  const C = MELD_RAMP.frostbite;
  flash(fx, x, y, 12, big ? 0.7 : 0.4, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.7, 0.24, [C[5], C[4], C[3]], { closing: true, heavy: true });
  if (m) M3.clamps.push({ id: m.id, t: 0, dur: 0.42, big: true });
  fling(fx, x, y, big ? 12 : 7, ['#ffffff', C[4], C[3]], { speed: 3.5, up: 90, grav: 380, life: 0.45, z: 12, streak: 2, size: 1 });
  puffs(fx, x, y, big ? r * 0.5 : 0.3, big ? 8 : 3, [C[4], '#9ad0c0', '#6aa890', C[2]], { up: 12, z: 6, life: 1.0, drift: 0.4 });
  fling(fx, x, y, big ? 8 : 4, ['#b4cc24', '#7c9416'], { speed: 1.2, up: 20, grav: 300, life: 0.5, z: 12, size: 1 });
}

/**
 * CONTAGION (Lightning and Poison), on each hit: sick green lightning. A green crackle, spores
 * bursting off what it strikes.
 */
function contagionHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = MELD_RAMP.contagion;
  flash(fx, x, y, 12, big ? 0.8 : 0.45, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.8, 0.22, [C[4], C[3], C[2]], { jag: true, heavy: true });
  spores(fx, x, y, big ? r * 0.6 : 0.3, big ? 14 : 8);
  fling(fx, x, y, big ? 12 : 8, [C[5], C[4], C[3]], { speed: 5, up: 40, grav: 120, life: 0.25, z: 12, streak: 3, size: 1 });
  for (let i = 0; i < (big ? 5 : 2); i++) {
    const a = Math.random() * Math.PI * 2;
    bolt(x, y, x + Math.cos(a) * rnd(0.6, 1.0), y + Math.sin(a) * rnd(0.6, 1.0), C, { w: 1, dur: 0.14 });
  }
}

/** Contagion's spores: green bubbles that swell as they rise and pop. */
function spores(fx: Fx, x: number, y: number, r: number, n: number): void {
  const C = MELD_RAMP.contagion;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random()) * r;
    const life = rnd(0.5, 1.0);
    add(fx, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: rnd(4, 14), vx: rnd(-0.4, 0.4), vy: rnd(-0.4, 0.4), vz: rnd(10, 30), life, life0: life, ramp: [C[4], C[3], C[3], C[2]], color: C[3], size: Math.random() < 0.4 ? 3 : 2, grav: -6 });
  }
}

/** Each word's hit. */
function hitLook(word: MeldId, fx: Fx, game: Game, x: number, y: number, r: number, big: boolean): void {
  const h = game.hero;
  const m = big ? undefined : struckAt(game, x, y);
  if (word === 'eruption') eruptionHit(fx, x, y, r, big);
  else if (word === 'avalanche') avalancheHit(fx, x, y, x - h.x, y - h.y, r, big);
  else if (word === 'thunder') thunderHit(fx, x, y, r, big);
  else if (word === 'blight') blightHit(fx, x, y, r, big, m);
  else if (word === 'scald') scaldHit(fx, x, y, r, big);
  else if (word === 'wildfire') wildfireHit(fx, x, y, r, big);
  else if (word === 'fumes') fumesHit(fx, x, y, r, big);
  else if (word === 'hailstorm') hailHit(fx, x, y, r, big);
  else if (word === 'frostbite') frostbiteHit(fx, x, y, r, big, m);
  else contagionHit(fx, x, y, r, big);
}

// =============================================================================================
// THE TWISTS: the bolts and blasts the rules call up.

/** A melded word's arc: Thunder's bolt from the sky; Wildfire's, Hailstorm's and Contagion's arcs; the sparks and strikes of what they leave. */
function arcLook(word: MeldId, fx: Fx, e: Extract<GameEvent, { t: 'arc' }>, fromZone: boolean): void {
  const C = MELD_RAMP[word];
  if (word === 'thunder') {
    if (fromZone) {
      // the thunderhead strikes: a heavy violet bolt, a burnt star
      skyBolt(e.x1, e.y1, C, { top: 70, w: 2, dur: 0.2, forks: 2 });
      flash(fx, e.x1, e.y1, 6, 0.55, 0.1, [C[5], C[4], C[3]]);
      ring(fx, e.x1, e.y1, 0.8, 0.2, [C[5], C[4], C[3]], { jag: true });
      fling(fx, e.x1, e.y1, 8, [C[5], C[4]], { speed: 4, up: 40, grav: 140, life: 0.25, z: 4, streak: 3, size: 1 });
      scar('thunder', 'star', e.x1, e.y1, 0.6, 1.4, 6);
      fx.shake = Math.max(fx.shake, 2.5);
      glow(fx, e.x1, e.y1, 60, 0.18);
    } else thunderBolt(fx, e.x1, e.y1, false);
    return;
  }
  if (e.sky) {
    // (an arcing word's first bolt comes down on the one it hits, in its own colours)
    skyBolt(e.x1, e.y1, C, { top: 130, w: 2, dur: 0.2, forks: 2 });
    flash(fx, e.x1, e.y1, 6, 0.5, 0.1, [C[5], C[4], C[3]]);
    if (word === 'hailstorm') {
      hailDown(e.x1, e.y1, 0.6, 7);
      if (fromZone) ring(fx, e.x1, e.y1, 0.7, 0.2, [C[5], C[4]], { jag: true });
    }
    if (word === 'wildfire') fx.flames(e.x1, e.y1, 0.3, 6, 1.2);
    if (word === 'contagion') spores(fx, e.x1, e.y1, 0.3, 6);
    glow(fx, e.x1, e.y1, 50, 0.18);
    return;
  }
  if (word === 'wildfire') {
    // burning lightning: thick, and fire left along its way
    bolt(e.x0, e.y0, e.x1, e.y1, C, { w: 2, dur: 0.26, kind: 'fire', wob: 0.35 });
    const n = Math.max(3, Math.round(Math.hypot(e.x1 - e.x0, e.y1 - e.y0) * 2.5));
    for (let i = 1; i <= n; i++) {
      const k = i / (n + 1);
      later(k * 0.12, () => fx.flames(e.x0 + (e.x1 - e.x0) * k, e.y0 + (e.y1 - e.y0) * k, 0.12, 2, 1.1));
    }
    flash(fx, e.x1, e.y1, 10, 0.4, 0.1, [C[5], C[4], C[3]]);
    fx.flames(e.x1, e.y1, 0.3, 6, 1.3);
    fling(fx, e.x1, e.y1, 8, [C[5], C[4]], { speed: 4, up: 80, grav: 180, life: 0.35, z: 10, streak: 2, size: 1 });
    glow(fx, e.x1, e.y1, 44, 0.2);
  } else if (word === 'hailstorm') {
    // ice-white lightning, crystals along it, hail where it lands
    bolt(e.x0, e.y0, e.x1, e.y1, C, { w: 2, dur: 0.24, kind: 'ice', wob: 0.3 });
    flash(fx, e.x1, e.y1, 10, 0.45, 0.1, [C[5], C[4], C[3]]);
    hailDown(e.x1, e.y1, 0.45, 5);
    fling(fx, e.x1, e.y1, 8, ['#ffffff', C[4]], { speed: 3.5, up: 90, grav: 380, life: 0.4, z: 10, streak: 2, size: 1 });
  } else if (word === 'contagion') {
    // sick green lightning; spores burst where it lands, and a ring closes on it: it has caught it
    bolt(e.x0, e.y0, e.x1, e.y1, C, { w: 2, dur: 0.24, wob: 0.35 });
    flash(fx, e.x1, e.y1, 10, 0.45, 0.1, [C[5], C[4], C[3]]);
    ring(fx, e.x1, e.y1, 0.7, 0.3, [C[4], C[3], C[2]], { closing: true });
    spores(fx, e.x1, e.y1, 0.3, 8);
  } else {
    bolt(e.x0, e.y0, e.x1, e.y1, C, { w: 1, dur: 0.18 });
  }
}

/**
 * ERUPTION behind, at full heat: the next hit ERUPTS. The ground splits in a web of glowing
 * fissures, a column of lava blasts up out of it, lava bombs are flung high all round and come down
 * burning, a ring of fire and a ring of dust run out, the screen kicks hard.
 */
function eruptionBlast(fx: Fx, x: number, y: number, r: number): void {
  const C = MELD_RAMP.eruption;
  fx.hold(0.12);
  fx.shake = Math.max(fx.shake, 8);
  screenFlash(C[4], 0.16, 0.07);
  flash(fx, x, y, 4, 1.6, 0.16, [C[5], C[5], C[4], C[3]]);
  ring(fx, x, y, r, 0.36, [C[5], C[4], C[3], C[2]], { heavy: true, fill: true });
  ring(fx, x, y, r * 1.35, 0.5, ['#6a5048', '#4a3a36', '#2a2220'], { heavy: true, delay: 0.06 });
  scar('eruption', 'fissure', x, y, r * 0.95, 3.2, 9);
  M3.columns.push({ x, y, t: 0, dur: 0.6, h: 110, w: 6, word: 'eruption' });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + rnd(-0.25, 0.25);
    const d = r * rnd(0.5, 1.15);
    M3.bombs.push({ x0: x, y0: y, x1: x + Math.cos(a) * d, y1: y + Math.sin(a) * d, t: -rnd(0, 0.12), dur: rnd(0.55, 0.85), h: rnd(60, 110), word: 'eruption' });
  }
  const lava = [C[5], C[4], C[4], C[3], C[2], C[1]];
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rnd(1, 5);
    const life = rnd(0.6, 1.0);
    add(fx, { x, y, z: rnd(4, 14), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(150, 280), life, life0: life, ramp: lava, color: C[4], size: Math.random() < 0.5 ? 3 : 2, grav: 420 });
  }
  fling(fx, x, y, 16, [C[0], C[1], '#2c2420'], { speed: 4.5, up: 160, grav: 520, life: 0.8, z: 4, size: 3 });
  puffs(fx, x, y, r * 0.4, 16, ['#7a5a50', '#55403a', '#3a2c2a', '#241c1e'], { up: 60, z: 14, life: 1.6, drift: 0.4 });
  glow(fx, x, y, 140, 0.5);
}

/**
 * THUNDER behind: every few hits a THUNDERCLAP round the hero. The air cracks white; rings of
 * lightning tear out from the hero; bolts come down all round the ring; the floor is blasted with
 * burnt stars; dust is thrown up in a ring.
 */
function thunderClap(fx: Fx, x: number, y: number, r: number): void {
  const C = MELD_RAMP.thunder;
  fx.hold(0.1);
  fx.shake = Math.max(fx.shake, 7);
  screenFlash(C[5], 0.24, 0.08);
  flash(fx, x, y, 16, 1.3, 0.14, [C[5], C[5], C[4], C[3]]);
  ring(fx, x, y, r, 0.3, [C[5], C[4], C[3], C[2]], { jag: true, heavy: true });
  ring(fx, x, y, r * 0.7, 0.26, [C[5], C[4], C[3]], { jag: true, delay: 0.05 });
  ring(fx, x, y, r * 1.2, 0.42, ['#8a7c90', '#5a5060', '#3a3444'], { delay: 0.08 });
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd(-0.2, 0.2);
    const bx = x + Math.cos(a) * r * rnd(0.65, 0.95);
    const by = y + Math.sin(a) * r * rnd(0.65, 0.95);
    later(i * 0.025, () => {
      skyBolt(bx, by, C, { top: 140, w: 2, dur: 0.2, forks: 1 });
      flash(fx, bx, by, 4, 0.4, 0.1, [C[5], C[4]]);
      fling(fx, bx, by, 5, ['#8a7c90', '#5a5060', C[3]], { speed: 2.5, up: 110, grav: 460, life: 0.5, z: 2, size: 2 });
      scar('thunder', 'star', bx, by, 0.55, 1.6, 5);
    });
    bolt(x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, C, { w: 2, dur: 0.22, wob: 0.3, z: 6 });
  }
  glow(fx, x, y, 130, 0.35);
}

/**
 * FUMES behind: the cloud EXPLODES when anything burning comes into it. A fireball rolls up out of
 * it into a black-and-mustard mushroom of smoke, a shockwave, burning embers everywhere.
 */
function fumesBlast(fx: Fx, x: number, y: number, r: number): void {
  const C = MELD_RAMP.fumes;
  fx.hold(0.1);
  fx.shake = Math.max(fx.shake, 6.5);
  screenFlash('#ffc24a', 0.16, 0.08);
  flash(fx, x, y, 8, Math.min(1.8, r * 0.7), 0.16, ['#ffffff', '#fff0a0', '#ffc24a', '#ff8a2a']);
  ring(fx, x, y, r, 0.34, ['#fff0a0', '#ffc24a', '#ff8a2a', '#a82810'], { heavy: true, fill: true });
  ring(fx, x, y, r * 1.4, 0.45, [C[3], C[2], C[1]], { heavy: true, delay: 0.05 });
  fx.flames(x, y, r * 0.8, 30, 1.6);
  // the fireball rolls up into a mushroom of smoke: a column, then a cap spreading at the top
  puffs(fx, x, y, 0.4, 14, ['#ffc24a', '#ff8a2a', C[2], C[1], '#221c10'], { up: 90, z: 12, life: 1.2, drift: 0.2 });
  later(0.35, () => {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const life = rnd(1.0, 1.5);
      add(fx, { x: x + Math.cos(a) * 0.3, y: y + Math.sin(a) * 0.3, z: rnd(50, 62), vx: Math.cos(a) * rnd(0.8, 1.4), vy: Math.sin(a) * rnd(0.8, 1.4), vz: rnd(4, 12), life, life0: life, ramp: [C[3], C[2], C[1], '#221c10'], color: C[2], size: 3, grav: -2 });
    }
  });
  fling(fx, x, y, 24, ['#fff0a0', '#ffc24a', '#ff8a2a'], { speed: 5.5, up: 130, grav: 260, life: 0.8, z: 10, size: 1 });
  glow(fx, x, y, 120, 0.4);
}

/** What a melded word behind (or a twist in front) lays on the ground, the moment it is laid. */
function laidLook(look: ZoneLook, fx: Fx, x: number, y: number, r: number): void {
  const small = r < 1.2;
  const k = small ? 0.5 : 1;
  const n = (v: number): number => Math.max(1, Math.round(v * k * (small ? fx.room() : 1)));
  if (look === 'molten') {
    const C = MELD_RAMP.eruption;
    ring(fx, x, y, r, 0.35, [C[5], C[4], C[3]], { fill: true });
    fling(fx, x, y, n(10), [C[5], C[4], C[3]], { speed: 1.6, up: 90, grav: 380, life: 0.5, z: 2, size: 2 });
    puffs(fx, x, y, r * 0.6, n(5), ['#6a5048', '#4a3a36', '#33282a'], { up: 30, z: 4, life: 1.0 });
  } else if (look === 'snow') {
    const C = MELD_RAMP.avalanche;
    ring(fx, x, y, r, 0.3, [C[5], C[4], C[3]], { fill: true });
    puffs(fx, x, y, r * 0.8, n(10), [C[5], C[4], C[4], C[3]], { up: 12, z: 2, life: 1.0, drift: 0.5 });
    for (let i = 0; i < n(6); i++) {
      const a = Math.random() * Math.PI * 2;
      fx.spikes.push({ x0: x + Math.cos(a) * r * 0.3, y0: y + Math.sin(a) * r * 0.3, x1: x + Math.cos(a) * r * rnd(0.8, 1), y1: y + Math.sin(a) * r * rnd(0.8, 1), tall: rnd(3, 7), t: 0, dur: rnd(0.5, 0.8) });
    }
  } else if (look === 'thunderhead' || look === 'hail' || look === 'greenstorm') {
    const word: MeldId = look === 'thunderhead' ? 'thunder' : look === 'hail' ? 'hailstorm' : 'contagion';
    const C = MELD_RAMP[word];
    flash(fx, x, y, small ? 36 : 50, small ? 0.4 : 0.7, 0.1, [C[5], C[4], C[3]]);
    ring(fx, x, y, r, 0.3, [C[4], C[3], C[2]], { jag: true });
    if (look === 'hail') hailDown(x, y, r * 0.8, n(8));
  } else if (look === 'rot') {
    const C = MELD_RAMP.blight;
    ring(fx, x, y, r, 0.45, [C[3], C[2], C[1]], { fill: true });
    ring(fx, x, y, r * 0.8, 0.4, [C[4], C[3]], { closing: true, delay: 0.05 });
    puffs(fx, x, y, r * 0.7, n(8), [C[3], C[2], C[1], C[0]], { up: 10, z: 2, life: 1.2 });
  } else if (look === 'boil') {
    const C = MELD_RAMP.scald;
    ring(fx, x, y, r, 0.35, [C[5], C[4], C[3]], { fill: true, heavy: !small });
    puffs(fx, x, y, r * 0.7, n(14), [C[5], C[4], C[3], C[2]], { up: 70, z: 2, life: 1.0, drift: 0.5 });
    fling(fx, x, y, n(10), ['#ffffff', C[4]], { speed: 3, up: 100, grav: -30, life: 0.4, z: 2, streak: 4, size: 1 });
  } else if (look === 'wildfire') {
    const C = MELD_RAMP.wildfire;
    fx.flames(x, y, r * 0.8, n(12), 1.3);
    for (let i = 0; i < n(4); i++) {
      const a = Math.random() * Math.PI * 2;
      const b = a + rnd(1.5, 3);
      bolt(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, x + Math.cos(b) * r * 0.8, y + Math.sin(b) * r * 0.8, C, { w: 1, dur: 0.18, kind: 'fire', z: 4 });
    }
  } else if (look === 'smoulder') {
    const C = MELD_RAMP.fumes;
    fx.flames(x, y, r * 0.7, n(6), 0.8);
    puffs(fx, x, y, r * 0.7, n(8), [C[2], C[1], '#2a2418', '#1a160e'], { up: 30, z: 4, life: 1.2 });
  } else if (look === 'fumes') {
    fumesCloud(fx, x, y, r);
  } else if (look === 'toxicice') {
    const C = MELD_RAMP.frostbite;
    ring(fx, x, y, r, 0.3, [C[5], C[4], '#9ad23a'], { fill: true });
    for (let i = 0; i < n(7); i++) {
      const a = Math.random() * Math.PI * 2;
      fx.spikes.push({ x0: x + Math.cos(a) * r * 0.4, y0: y + Math.sin(a) * r * 0.4, x1: x + Math.cos(a) * r * rnd(0.85, 1.05), y1: y + Math.sin(a) * r * rnd(0.85, 1.05), tall: rnd(4, 8), t: 0, dur: rnd(0.5, 0.8) });
    }
    puffs(fx, x, y, r * 0.6, n(6), ['#9ad0c0', '#6aa890', C[2]], { up: 8, z: 2, life: 1.0 });
  } else if (look === 'coldmist') {
    const C = MELD_RAMP.frostbite;
    ring(fx, x, y, r, 0.4, [C[4], '#9ad0c0', C[3]], { fill: true });
    puffs(fx, x, y, r * 0.8, n(10), ['#cfe8e8', '#9ad0c0', '#6aa890', C[2]], { up: 6, z: 2, life: 1.3, drift: 0.6 });
  } else if (look === 'crackle') {
    const C = MELD_RAMP.contagion;
    ring(fx, x, y, r, 0.35, [C[4], C[3], C[2]], { fill: true, jag: true });
    spores(fx, x, y, r * 0.8, n(10));
    for (let i = 0; i < n(4); i++) {
      const a = Math.random() * Math.PI * 2;
      const b = a + rnd(1.5, 3);
      bolt(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, x + Math.cos(b) * r * 0.7, y + Math.sin(b) * r * 0.7, C, { w: 1, dur: 0.16, z: 8 });
    }
  }
}

/** Avalanche in front: the picture of what it shoved slides to where the rules put it, leaving a furrow of snow; one stopped short freezes with a crash. */
function shoved(fx: Fx, e: Extract<GameEvent, { t: 'meldFx' }>): void {
  const C = MELD_RAMP.avalanche;
  const d = Math.hypot(e.x1 - e.x, e.y1 - e.y);
  const dur = 0.2 + d * 0.06;
  M3.slides.push({ id: e.id, x0: e.x, y0: e.y, x1: e.x1, y1: e.y1, t: 0, dur, frozen: !!e.frozen });
  if (d > 0.15) {
    const s = scar('avalanche', 'furrow', e.x, e.y, d, 2.4, 0);
    s.lines = [[e.x1 - e.x, e.y1 - e.y]];
  }
  if (e.frozen) {
    later(dur, () => {
      // it comes up against something and freezes where it stands, with a crash
      fx.shake = Math.max(fx.shake, 4);
      flash(fx, e.x1, e.y1, 12, 0.7, 0.12, [C[5], C[4], '#b0e0ff']);
      ring(fx, e.x1, e.y1, 1.0, 0.26, [C[5], C[4], C[3]], { heavy: true });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + rnd(-0.2, 0.2);
        fx.spikes.push({ x0: e.x1 + Math.cos(a) * 0.2, y0: e.y1 + Math.sin(a) * 0.2, x1: e.x1 + Math.cos(a) * rnd(0.7, 1.0), y1: e.y1 + Math.sin(a) * rnd(0.7, 1.0), tall: rnd(5, 10), t: 0, dur: rnd(0.6, 0.9) });
      }
      fling(fx, e.x1, e.y1, 14, ['#ffffff', C[4], C[3]], { speed: 4, up: 110, grav: 420, life: 0.5, z: 10, streak: 3, size: 1 });
      puffs(fx, e.x1, e.y1, 0.4, 8, [C[5], C[4], C[3]], { up: 16, z: 4, life: 0.9 });
    });
  }
}

/** Avalanche behind: a hit on a chilled enemy crushes it, harder: ice cracks in on it, a heavy white crunch. */
function crushed(fx: Fx, e: Extract<GameEvent, { t: 'meldFx' }>): void {
  const C = MELD_RAMP.avalanche;
  const k = markOf(e.id);
  if (k.crush < 0.12) return;
  k.crush = 0;
  fx.hold(0.05);
  fx.shake = Math.max(fx.shake, 3);
  flash(fx, e.x, e.y, 12, 0.55, 0.1, [C[5], C[4], C[3]]);
  ring(fx, e.x, e.y, 0.9, 0.22, [C[5], C[4], C[3]], { closing: true, heavy: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rnd(-0.3, 0.3);
    fx.spikes.push({ x0: e.x + Math.cos(a) * 0.9, y0: e.y + Math.sin(a) * 0.9, x1: e.x + Math.cos(a) * 0.3, y1: e.y + Math.sin(a) * 0.3, tall: rnd(4, 8), t: 0, dur: rnd(0.4, 0.6) });
  }
  fling(fx, e.x, e.y, 10, ['#ffffff', C[4]], { speed: 3.5, up: 90, grav: 420, life: 0.45, z: 12, streak: 2, size: 1 });
}

/** Each word on the blade or the hand as an ability leaves the hero: a little of what it will be. */
function carryLook(word: MeldId, fx: Fx, x: number, y: number, dx: number, dy: number): void {
  const C = MELD_RAMP[word];
  const o = { speed: 2.4, up: 50, grav: 160, life: 0.4, z: 12, dx, dy, spread: 1.0, r: 0.2 };
  if (word === 'eruption') fling(fx, x, y, 7, [C[5], C[4], C[3]], { ...o, grav: 380, up: 80, size: 2 });
  else if (word === 'avalanche') fling(fx, x, y, 8, [C[5], C[4]], { ...o, grav: 60, up: 20 });
  else if (word === 'thunder') fling(fx, x, y, 7, [C[5], C[4], C[3]], { ...o, speed: 5, streak: 3, grav: 0, life: 0.2 });
  else if (word === 'blight') fling(fx, x, y, 6, [C[3], C[2], C[1]], { ...o, grav: 300 });
  else if (word === 'scald') puffs(fx, x, y, 0.2, 4, [C[5], C[4], C[3]], { up: 40, z: 12, life: 0.6 });
  else if (word === 'wildfire') {
    fx.flames(x, y, 0.15, 3, 1.2);
    fling(fx, x, y, 5, [C[5], C[4]], { ...o, speed: 4, streak: 2, grav: 60, life: 0.25 });
  } else if (word === 'fumes') puffs(fx, x, y, 0.2, 4, [C[3], C[2], C[1]], { up: 30, z: 12, life: 0.7 });
  else if (word === 'hailstorm') fling(fx, x, y, 7, ['#ffffff', C[4], C[3]], { ...o, grav: 420, up: 60, streak: 2 });
  else if (word === 'frostbite') puffs(fx, x, y, 0.2, 4, [C[4], '#9ad0c0', C[2]], { up: 10, z: 12, life: 0.6 });
  else spores(fx, x, y, 0.2, 5);
}

/** What a melded shot sheds as it flies (one call a frame, `k` how much). */
function trailLook(word: MeldId, fx: Fx, x: number, y: number, vx: number, vy: number, k: number): void {
  if (Math.random() > k) return;
  const C = MELD_RAMP[word];
  const sp = Math.hypot(vx, vy) || 1;
  const bx = -vx / sp;
  const by = -vy / sp;
  if (word === 'eruption') add(fx, { x, y, z: 10, vx: bx * 0.5, vy: by * 0.5, vz: rnd(10, 40), life: 0.5, life0: 0.5, ramp: [C[5], C[4], C[3], C[2], C[1]], color: C[4], size: 2, grav: 300 });
  else if (word === 'avalanche') add(fx, { x, y, z: 10, vx: bx + rnd(-0.5, 0.5), vy: by + rnd(-0.5, 0.5), vz: rnd(-5, 10), life: 0.5, color: pick([C[5], C[4]]), size: 1, grav: 30 });
  else if (word === 'thunder') add(fx, { x: x + rnd(-0.1, 0.1), y: y + rnd(-0.1, 0.1), z: 10 + rnd(-3, 3), vx: rnd(-2, 2), vy: rnd(-2, 2), vz: 0, life: 0.1, color: pick([C[5], C[4]]), size: 1, grav: 0, streak: 3 });
  else if (word === 'blight') add(fx, { x, y, z: 10, vx: bx * 0.3, vy: by * 0.3, vz: -10, life: 0.6, color: pick([C[3], C[2]]), size: 1, grav: 120 });
  else if (word === 'scald') add(fx, { x, y, z: 10, vx: bx * 0.3, vy: by * 0.3, vz: 30, life: 0.5, life0: 0.5, ramp: [C[5], C[4], C[3]], color: C[4], size: 2, grav: -10 });
  else if (word === 'wildfire') {
    fx.flames(x, y, 0.05, 1, 0.8);
    if (Math.random() < 0.4) add(fx, { x, y, z: 10, vx: rnd(-2, 2), vy: rnd(-2, 2), vz: 0, life: 0.1, color: C[5], size: 1, grav: 0, streak: 3 });
  } else if (word === 'fumes') add(fx, { x, y, z: 10, vx: bx * 0.3, vy: by * 0.3, vz: 20, life: 0.7, life0: 0.7, ramp: [C[3], C[2], C[1], '#221c10'], color: C[2], size: 2, grav: -4 });
  else if (word === 'hailstorm') add(fx, { x, y, z: 10, vx: bx, vy: by, vz: 20, life: 0.4, color: pick(['#ffffff', C[4]]), size: 1, grav: 400 });
  else if (word === 'frostbite') add(fx, { x, y, z: 10, vx: bx * 0.2, vy: by * 0.2, vz: 6, life: 0.6, life0: 0.6, ramp: [C[4], '#9ad0c0', C[2]], color: C[4], size: 2, grav: 0 });
  else add(fx, { x, y, z: 10, vx: bx * 0.3, vy: by * 0.3, vz: 14, life: 0.5, life0: 0.5, ramp: [C[4], C[3], C[2]], color: C[3], size: 2, grav: -4 });
}

// =============================================================================================
// BEHIND: what each word leaves on the floor.

type ZoneLook = 'molten' | 'snow' | 'thunderhead' | 'rot' | 'boil' | 'wildfire' | 'smoulder' | 'fumes' | 'hail' | 'toxicice' | 'coldmist' | 'greenstorm' | 'crackle';

/** The look a melded word gives a patch of this kind, or none (then it is drawn as its words' are). */
function lookOfKind(word: MeldId, kind: string | null, t: 'arc' | 'burst' | 'zone'): ZoneLook | true | null {
  if (t !== 'zone') return true;
  const table: Partial<Record<MeldId, Partial<Record<string, ZoneLook>>>> = {
    eruption: { burn: 'molten' },
    avalanche: { ice: 'snow' },
    thunder: { storm: 'thunderhead' },
    blight: { venom: 'rot' },
    scald: { steam: 'boil' },
    wildfire: { burn: 'wildfire' },
    fumes: { burn: 'smoulder', venom: 'fumes' },
    hailstorm: { storm: 'hail' },
    frostbite: { ice: 'toxicice', venom: 'coldmist' },
    contagion: { storm: 'greenstorm', venom: 'crackle' },
  };
  return (kind && table[word]?.[kind]) || null;
}

function lookOf(z: Zone): ZoneLook | null {
  const w = z.look ?? z.meld;
  if (!w) return null;
  const l = lookOfKind(w, z.kind, 'zone');
  return l === true ? null : l;
}

/** Whether this patch is drawn here, not as its words' are (render.ts leaves it out). */
export function ownsZone(z: Zone): boolean {
  return MELD3.on && lookOf(z) !== null;
}

/** Things worked out once for a patch (where its cracks run, where its drifts lie). */
const shapes = new WeakMap<Zone, { seed: number; lines: number[][]; spots: number[] }>();
function shapeOf(z: Zone): { seed: number; lines: number[][]; spots: number[] } {
  let s = shapes.get(z);
  if (!s) {
    const seed = Math.floor(Math.random() * 1e6);
    const lines: number[][] = [];
    const n = z.r < 1.2 ? 4 : 7;
    const a0 = hash2(seed, 1) * Math.PI * 2;
    for (let k = 0; k < n; k++) {
      const a = a0 + (k / n) * Math.PI * 2 + (hash2(seed, k, 2) - 0.5) * 0.6;
      const pts = [Math.cos(a) * z.r * 0.15, Math.sin(a) * z.r * 0.15];
      for (let i = 1; i <= 3; i++) {
        const d = z.r * (0.15 + 0.27 * i) * (0.85 + hash2(seed, k, i + 3) * 0.2);
        const j = (hash2(seed, k * 5 + i, 4) - 0.5) * z.r * 0.25;
        pts.push(Math.cos(a) * d - Math.sin(a) * j, Math.sin(a) * d + Math.cos(a) * j);
      }
      lines.push(pts);
    }
    const spots: number[] = [];
    const m = z.r < 1.2 ? 4 : 9;
    for (let i = 0; i < m; i++) {
      const a = hash2(seed, i, 7) * Math.PI * 2;
      const d = Math.sqrt(hash2(seed, i, 8)) * z.r * 0.82;
      spots.push(Math.cos(a) * d, Math.sin(a) * d);
    }
    s = { seed, lines, spots };
    shapes.set(z, s);
  }
  return s;
}

function ellipse(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number, squash = 1): void {
  if (alpha <= 0) return;
  g.globalAlpha = Math.min(1, alpha);
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(cx, cy, Math.max(0.5, r * 22.6), Math.max(0.5, r * 11.3 * squash), 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
}

/** Dots round a ring of radius r tiles (a patch's rim). */
function rim(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, gap = 2, from = 0, sweep = Math.PI * 2): void {
  const n = Math.max(8, Math.round(r * 46));
  g.fillStyle = color;
  for (let i = 0; i < n; i += gap) {
    const a = from + (i / n) * sweep;
    g.fillRect(Math.round(cx + Math.cos(a) * r * 22.6), Math.round(cy + Math.sin(a) * r * 11.3), 1, 1);
  }
}

/** A web of lines on the floor (world offsets from the patch's middle), `lit` 0..1 how far they glow. */
function web(g: CanvasRenderingContext2D, cam: Cam, x: number, y: number, lines: number[][], dark: string, hot: string, lit: number, alpha: number): void {
  g.globalAlpha = alpha;
  for (const pts of lines) {
    for (let i = 0; i + 3 < pts.length; i += 2) {
      const x0 = wx(cam, x + pts[i], y + pts[i + 1]);
      const y0 = wy(cam, x + pts[i], y + pts[i + 1]);
      const x1 = wx(cam, x + pts[i + 2], y + pts[i + 3]);
      const y1 = wy(cam, x + pts[i + 2], y + pts[i + 3]);
      pline(g, x0, y0 + 1, x1, y1 + 1, dark);
      if (lit > 0 && i / 2 < (pts.length / 2 - 1) * lit + 0.5) pline(g, x0, y0, x1, y1, hot);
    }
  }
  g.globalAlpha = 1;
}

const fadeOf = (z: Zone): number => Math.min(1, z.t / 0.2, (z.dur - z.t) * 2);

/**
 * ON THE FLOOR (drawn with the floor, under everything that stands): each melded patch, the scars,
 * Blight's brand under what it marked, Eruption's heat at the hero's feet. `here`: whether a place
 * is on the ground the renderer's pass draws.
 */
export function floorM3(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, here: (x: number, y: number) => boolean): void {
  for (const z of game.zones) {
    const look = lookOf(z);
    if (!look || !here(z.x, z.y)) continue;
    const cx = wx(cam, z.x, z.y);
    const cy = wy(cam, z.x, z.y);
    const fade = fadeOf(z);
    const s = shapeOf(z);
    const small = z.r < 1.2;
    const R = z.r * (0.7 + 0.3 * Math.min(1, z.t / 0.25));
    if (look === 'molten') {
      // a pool of lava: bright and moving at its heart, a black crust broken into plates floating on
      // it, glowing seams between them, a cooled rim; bubbles that swell and burst
      const C = MELD_RAMP.eruption;
      const beat = 0.5 + 0.5 * Math.sin(t * 5 + s.seed);
      ellipse(g, cx, cy, R, C[1], 0.9 * fade);
      ellipse(g, cx, cy, R * 0.9, C[2], 0.95 * fade);
      ellipse(g, cx, cy, R * 0.74, C[3], 0.95 * fade);
      ellipse(g, cx, cy, R * 0.48, C[4], (0.75 + 0.25 * beat) * fade);
      ellipse(g, cx, cy, R * 0.2, C[5], (0.5 + 0.4 * beat) * fade);
      // the crust: plates drifting slowly round the heart, each lit along its upper left edge
      for (let i = 0; i + 1 < s.spots.length; i += 2) {
        const drift = t * 0.12 * (i % 4 === 0 ? 1 : -1);
        const ox = s.spots[i] * Math.cos(drift) - s.spots[i + 1] * Math.sin(drift);
        const oy = s.spots[i] * Math.sin(drift) + s.spots[i + 1] * Math.cos(drift);
        if (Math.hypot(ox, oy) < z.r * 0.3) continue;
        const px = Math.round(wx(cam, z.x + ox, z.y + oy));
        const py = Math.round(wy(cam, z.x + ox, z.y + oy));
        const w = 2 + Math.round(hash2(s.seed, i, 9) * 3);
        g.globalAlpha = fade;
        g.fillStyle = C[0];
        g.fillRect(px - w, py - 1, w * 2, 2);
        g.fillRect(px - w + 1, py + 1, w * 2 - 2, 1);
        g.fillStyle = C[1];
        g.fillRect(px - w, py - 1, w * 2 - 1, 1);
        g.fillStyle = C[2];
        g.fillRect(px - w, py - 1, 1, 1);
      }
      // the seams glow white-hot, flickering
      web(g, cam, z.x, z.y, s.lines, C[2], Math.sin(t * 9 + s.seed) > -0.2 ? C[5] : C[4], 1, 0.9 * fade);
      // the cooled rim
      g.globalAlpha = fade;
      rim(g, cx, cy, R * 0.98, C[1], 1);
      rim(g, cx, cy, R * 0.98, C[3], 4, Math.PI * 1.05, Math.PI * 0.5);
      // bubbles: each swells, then bursts in a spatter
      for (let i = 0; i < (small ? 2 : 4); i++) {
        const q = (t * 0.9 + hash2(s.seed, i, 11)) % 1;
        const a = hash2(s.seed, i, 12) * Math.PI * 2;
        const d = Math.sqrt(hash2(s.seed, i, 13)) * z.r * 0.6;
        const px = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
        const py = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
        g.globalAlpha = fade;
        if (q < 0.85) {
          const b = 1 + Math.round(q * 3);
          g.fillStyle = C[3];
          g.fillRect(px - b, py - b, b * 2 + 1, b + 1);
          g.fillStyle = C[4];
          g.fillRect(px - b + 1, py - b, b * 2 - 1, b);
          g.fillStyle = C[5];
          g.fillRect(px - b + 1, py - b, 1, 1);
        } else {
          g.fillStyle = C[5];
          g.fillRect(px - 3, py - 2, 1, 1);
          g.fillRect(px + 3, py - 3, 1, 1);
          g.fillRect(px, py - 5, 1, 1);
          g.fillStyle = C[4];
          g.fillRect(px - 1, py - 1, 3, 1);
        }
      }
      g.globalAlpha = 1;
    } else if (look === 'snow') {
      // packed snow fallen off the mountain: a crust of it with blue in its shadow, drifts heaped up
      // and lit at their upper left, blocks of ice standing in it, powder, a frosted rim, glints
      const C = MELD_RAMP.avalanche;
      ellipse(g, cx, cy, R, C[1], 0.45 * fade);
      ellipse(g, cx, cy, R * 0.92, C[3], 0.7 * fade);
      ellipse(g, cx - 2, cy - 1, R * 0.7, C[4], 0.55 * fade);
      g.globalAlpha = fade;
      rim(g, cx, cy, R * 0.97, C[5], 2, Math.PI * 0.95, Math.PI * 0.75);
      rim(g, cx, cy, R * 0.97, C[2], 2, Math.PI * 1.7, Math.PI * 1.2);
      // powder: single grains
      for (let i = 0; i < (small ? 10 : 24); i++) {
        const a = hash2(s.seed, i, 16) * Math.PI * 2;
        const d = Math.sqrt(hash2(s.seed, i, 17)) * z.r * 0.9;
        g.fillStyle = i % 3 === 0 ? C[2] : C[5];
        g.fillRect(Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)), Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)), 1, 1);
      }
      for (let i = 0; i + 1 < s.spots.length; i += 2) {
        const px = Math.round(wx(cam, z.x + s.spots[i], z.y + s.spots[i + 1]));
        const py = Math.round(wy(cam, z.x + s.spots[i], z.y + s.spots[i + 1]));
        const block = hash2(s.seed, i, 14) < 0.3 && !small;
        if (block) {
          // a block of ice: lit top and left face, dark right face, its shadow on the snow
          const bw = 3 + Math.round(hash2(s.seed, i, 18) * 2);
          const bh = 4 + Math.round(hash2(s.seed, i, 19) * 4);
          g.fillStyle = C[2];
          g.fillRect(px - bw + 2, py, bw * 2, 1);
          g.fillStyle = C[2];
          g.fillRect(px, py - bh, bw, bh);
          g.fillStyle = C[4];
          g.fillRect(px - bw, py - bh, bw, bh);
          g.fillStyle = C[5];
          g.fillRect(px - bw, py - bh - 1, bw * 2 - 1, 1);
          g.fillRect(px - bw, py - bh, 1, bh - 1);
        } else {
          // a drift: a mound, widest at its foot, its shadow to the lower right
          const w = 3 + Math.round(hash2(s.seed, i, 15) * 4);
          g.fillStyle = C[2];
          g.fillRect(px - w + 2, py + 1, w * 2, 1);
          g.fillStyle = C[3];
          g.fillRect(px - w, py, w * 2 + 1, 1);
          g.fillStyle = C[4];
          g.fillRect(px - w + 1, py - 1, w * 2 - 1, 1);
          g.fillStyle = C[5];
          g.fillRect(px - w + 2, py - 2, w * 2 - 4, 1);
          g.fillRect(px - w + 1, py - 1, 2, 1);
        }
      }
      g.fillStyle = '#ffffff';
      for (let i = 0; i < (small ? 2 : 4); i++) {
        if (hash2(i, s.seed, Math.floor(t * 5)) > 0.35) continue;
        const a = hash2(i, s.seed, 6) * Math.PI * 2;
        const d = hash2(i, s.seed, 7) * z.r * 0.8;
        const gx = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
        const gy = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - 1;
        g.fillRect(gx - 1, gy, 3, 1);
        g.fillRect(gx, gy - 1, 1, 3);
      }
      g.globalAlpha = 1;
    } else if (look === 'thunderhead' || look === 'hail' || look === 'greenstorm') {
      // the ground under the cloud: its shadow, scorched; a rim that flickers in the word's colour
      const C = MELD_RAMP[look === 'thunderhead' ? 'thunder' : look === 'hail' ? 'hailstorm' : 'contagion'];
      const lit = Math.floor(t * 14 + s.seed) % 3 === 0;
      ellipse(g, cx, cy, R, '#06040c', 0.45 * fade);
      ellipse(g, cx, cy, R * 0.7, C[0], 0.35 * fade);
      g.globalAlpha = fade;
      rim(g, cx, cy, R, lit ? C[4] : C[2], 2);
      if (look === 'hail') {
        // hail lying about, frost round it
        for (let i = 0; i + 1 < s.spots.length; i += 2) {
          const px = Math.round(wx(cam, z.x + s.spots[i], z.y + s.spots[i + 1]));
          const py = Math.round(wy(cam, z.x + s.spots[i], z.y + s.spots[i + 1]));
          g.fillStyle = C[2];
          g.fillRect(px - 1, py + 1, 3, 1);
          g.fillStyle = C[4];
          g.fillRect(px - 1, py, 2, 1);
          g.fillStyle = '#ffffff';
          g.fillRect(px - 1, py - 1, 1, 1);
        }
      } else web(g, cam, z.x, z.y, s.lines, '#05030a', lit ? C[4] : C[2], 0.7, 0.8 * fade);
      g.globalAlpha = 1;
    } else if (look === 'rot') {
      // the floor withers under it: a black-green stain, dead veins creeping out from its heart
      const C = MELD_RAMP.blight;
      ellipse(g, cx, cy, R, C[1], 0.55 * fade);
      ellipse(g, cx, cy, R * 0.6, C[0], 0.6 * fade);
      const grow = Math.min(1, z.t / 1.2);
      web(g, cam, z.x, z.y, s.lines, C[0], C[2], grow, 0.95 * fade);
      for (let i = 0; i + 1 < s.spots.length; i += 2) {
        const px = Math.round(wx(cam, z.x + s.spots[i], z.y + s.spots[i + 1]));
        const py = Math.round(wy(cam, z.x + s.spots[i], z.y + s.spots[i + 1]));
        g.globalAlpha = fade * (0.6 + 0.4 * Math.sin(t * 3 + i));
        g.fillStyle = i % 4 === 0 ? C[4] : C[3];
        g.fillRect(px, py, 1, 1);
      }
      g.globalAlpha = 1;
    } else if (look === 'boil') {
      // a wet floor, hot: dark and shining, hot at its heart and cold at its rim, bubbles boiling up all over it
      const C = MELD_RAMP.scald;
      ellipse(g, cx, cy, R, '#1e2a36', 0.55 * fade);
      ellipse(g, cx, cy, R * 0.75, '#2a3846', 0.5 * fade);
      ellipse(g, cx, cy, R * 0.35, '#ff8a2a', (0.12 + 0.08 * Math.sin(t * 6 + s.seed)) * fade);
      g.globalAlpha = fade;
      rim(g, cx, cy, R * 0.95, '#58a8f0', 3);
      rim(g, cx, cy, R * 0.9, C[4], 4, Math.PI * 1.05, Math.PI * 0.45);
      for (let i = 0; i < (small ? 3 : 7); i++) {
        const q = (t * 1.6 + hash2(s.seed, i, 21)) % 1;
        const a = hash2(s.seed, i, 22) * Math.PI * 2;
        const d = Math.sqrt(hash2(s.seed, i, 23)) * z.r * 0.8;
        const px = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
        const py = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
        const b = Math.round(1 + q * 3);
        g.globalAlpha = fade * (q < 0.8 ? 1 : (1 - q) * 5);
        g.fillStyle = C[4];
        g.fillRect(px - b, py - 1, 1, 1);
        g.fillRect(px + b, py - 1, 1, 1);
        g.fillRect(px - b + 1, py - 2, b * 2 - 1, 1);
        g.fillStyle = '#ffffff';
        g.fillRect(px - 1, py - 2, 1, 1);
      }
      g.globalAlpha = 1;
    } else if (look === 'wildfire' || look === 'smoulder') {
      // the ground burns: a glowing bed (Wildfire's bright and crackling; Fumes' low, sooty, smouldering)
      const C = look === 'wildfire' ? MELD_RAMP.wildfire : MELD_RAMP.fumes;
      if (look === 'wildfire') {
        ellipse(g, cx, cy, R, C[1], 0.5 * fade);
        ellipse(g, cx, cy, R * 0.65, C[2], 0.45 * fade);
        ellipse(g, cx, cy, R * 0.32, C[3], (0.35 + 0.2 * Math.sin(t * 11 + s.seed)) * fade);
      } else {
        ellipse(g, cx, cy, R, '#14100a', 0.6 * fade);
        ellipse(g, cx, cy, R * 0.7, C[1], 0.4 * fade);
        for (let i = 0; i + 1 < s.spots.length; i += 2) {
          const px = Math.round(wx(cam, z.x + s.spots[i], z.y + s.spots[i + 1]));
          const py = Math.round(wy(cam, z.x + s.spots[i], z.y + s.spots[i + 1]));
          const on = Math.sin(t * 4 + i * 1.7 + s.seed) > 0;
          g.globalAlpha = fade;
          g.fillStyle = on ? '#ffc24a' : '#ff8a2a';
          g.fillRect(px, py, 2, 1);
          if (on) {
            g.fillStyle = '#fff0a0';
            g.fillRect(px, py, 1, 1);
          }
        }
        g.globalAlpha = 1;
      }
    } else if (look === 'fumes' || look === 'coldmist' || look === 'crackle') {
      // the slick under a cloud: Fumes' sooty yellow, Frostbite's frosted green, Contagion's sick green
      const C = MELD_RAMP[look === 'fumes' ? 'fumes' : look === 'coldmist' ? 'frostbite' : 'contagion'];
      ellipse(g, cx, cy, R, look === 'coldmist' ? '#3a6a62' : C[1], 0.4 * fade);
      ellipse(g, cx, cy, R * 0.65, look === 'coldmist' ? C[2] : C[2], 0.25 * fade);
      g.globalAlpha = fade;
      rim(g, cx, cy, R, look === 'coldmist' ? C[4] : C[3], 3);
      g.globalAlpha = 1;
    } else if (look === 'toxicice') {
      // ice with venom frozen in it: pale blue ice, green veins glowing under it, crystals round its edge tipped green
      const C = MELD_RAMP.frostbite;
      ellipse(g, cx, cy, R, C[3], 0.45 * fade);
      ellipse(g, cx, cy, R * 0.72, C[4], 0.3 * fade);
      const pulse = 0.5 + 0.5 * Math.sin(t * 3 + s.seed);
      web(g, cam, z.x, z.y, s.lines, '#3a5a2a', pulse > 0.5 ? '#c6e85a' : '#9ad23a', 1, 0.9 * fade);
      const n = small ? 5 : 10;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + hash2(s.seed, i, 31) * 0.5;
        const d = z.r * (0.86 + hash2(s.seed, i, 32) * 0.12);
        const qx = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
        const qy = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
        const tall = Math.round(3 + hash2(s.seed, i, 33) * 6);
        g.globalAlpha = fade;
        g.fillStyle = C[3];
        g.fillRect(qx + 1, qy - tall + 1, 1, tall);
        g.fillStyle = C[5];
        g.fillRect(qx, qy - tall, 1, tall);
        g.fillStyle = '#b4cc24';
        g.fillRect(qx, qy - tall, 1, 1);
      }
      g.globalAlpha = 1;
    }
  }
  // the scars: a burnt star that glows and cools; a fissure that glows and cools; a furrow of snow
  for (const sc of M3.scars) {
    if (!here(sc.x, sc.y)) continue;
    const C = MELD_RAMP[sc.word];
    const fade = Math.min(1, (sc.dur - sc.t) / 0.6);
    const hot = Math.max(0, 1 - sc.t / (sc.kind === 'fissure' ? 1.8 : 0.7));
    const cx = wx(cam, sc.x, sc.y);
    const cy = wy(cam, sc.x, sc.y);
    if (sc.kind === 'furrow') {
      const [ex, ey] = sc.lines[0];
      const n = Math.max(2, Math.round(Math.hypot(ex, ey) * 8));
      for (let i = 0; i <= n; i++) {
        const k = i / n;
        const px = Math.round(wx(cam, sc.x + ex * k, sc.y + ey * k));
        const py = Math.round(wy(cam, sc.x + ex * k, sc.y + ey * k));
        const w = 2 + Math.round(2 * Math.sin(k * Math.PI));
        g.globalAlpha = fade * 0.9;
        g.fillStyle = C[2];
        g.fillRect(px - w, py + 1, w * 2, 1);
        g.fillStyle = C[4];
        g.fillRect(px - w, py - 1, w, 2);
        g.fillStyle = C[5];
        g.fillRect(px + w - 1, py - 2, 2, 2);
      }
      g.globalAlpha = 1;
      continue;
    }
    ellipse(g, cx, cy, sc.r * 0.45, '#0a0608', 0.5 * fade);
    web(g, cam, sc.x, sc.y, sc.lines, '#0a0608', hot > 0.5 ? C[5] : hot > 0 ? C[4] : C[1], hot > 0 ? 1 : 0, fade);
  }
  // Blight behind: a thorned brand of rot under each monster it has touched, turning slowly
  for (const m of game.monsters) {
    if (m.dead || !m.seen || !here(m.x, m.y)) continue;
    if (!(m.blightT && m.blightT > 0 && m.poisonT > 0)) continue;
    const C = MELD_RAMP.blight;
    const cx = wx(cam, m.x, m.y);
    const cy = wy(cam, m.x, m.y);
    const go = Math.min(1, m.blightT / 0.4);
    const beat = 0.75 + 0.25 * Math.sin(t * 4 + m.id);
    // a stain of rot under it, ringed, with hooked thorns turning round it
    ellipse(g, cx, cy, 0.62, C[0], 0.7 * go);
    ellipse(g, cx, cy, 0.42, C[1], 0.6 * go);
    g.globalAlpha = go;
    rim(g, cx, cy, 0.62, C[2], 1);
    g.globalAlpha = go * beat;
    rim(g, cx, cy, 0.6, C[3], 2);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + t * 0.8;
      const x0 = cx + Math.cos(a) * 0.6 * 22.6;
      const y0 = cy + Math.sin(a) * 0.6 * 11.3;
      const x1 = cx + Math.cos(a + 0.3) * 0.82 * 22.6;
      const y1 = cy + Math.sin(a + 0.3) * 0.82 * 11.3;
      pline(g, x0, y0 + 1, x1, y1 + 1, C[1]);
      pline(g, x0, y0, x1, y1, C[3]);
      g.fillStyle = C[5];
      g.fillRect(Math.round(x1), Math.round(y1), 1, 1);
    }
    g.globalAlpha = 1;
  }
  // Eruption behind: the hero's heat glows in the ground at their feet, cracks of lava opening as it builds
  if (M3.heat > 0 && here(game.hero.x, game.hero.y)) {
    const C = MELD_RAMP.eruption;
    const h = game.hero;
    const k = M3.heat / M3.heatFull;
    const full = M3.heat >= M3.heatFull;
    const cx = wx(cam, h.x, h.y);
    const cy = wy(cam, h.x, h.y);
    ellipse(g, cx, cy, 0.35 + 0.35 * k, full ? C[3] : C[2], (0.25 + 0.3 * k) * (full ? 0.75 + 0.25 * Math.sin(t * 12) : 1));
    const n = Math.round(2 + 5 * k);
    g.globalAlpha = 1;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.4;
      const len = 0.35 + 0.45 * k;
      const x1 = h.x + Math.cos(a) * len;
      const y1 = h.y + Math.sin(a) * len;
      pline(g, wx(cam, h.x + Math.cos(a) * 0.15, h.y + Math.sin(a) * 0.15), wy(cam, h.x + Math.cos(a) * 0.15, h.y + Math.sin(a) * 0.15), wx(cam, x1, y1), wy(cam, x1, y1), full && Math.sin(t * 14 + i) > 0 ? C[5] : C[4]);
    }
  }
}

// =============================================================================================
// IN THE AIR (drawn after the darkness, so it glows). `airM3` under the effects' sparks, `overM3` over them.

/** A cloud of puffs over a patch: `cols` [belly, mid, top], lit from inside in `lit` now and then. */
function cloud(g: CanvasRenderingContext2D, cam: Cam, z: Zone, t: number, cols: readonly string[], lit: readonly string[] | null, o: { high: number; puffs: number; size: number; alpha: number; flick?: number }): void {
  const s = shapeOf(z);
  const fade = fadeOf(z);
  const born = Math.min(1, z.t / 0.35);
  const going = Math.max(0, Math.min(1, (z.dur - z.t) / 0.5));
  const cx = Math.round(wx(cam, z.x, z.y) + Math.sin(t * 0.8 + s.seed) * 2);
  const cy = Math.round(wy(cam, z.x, z.y)) - o.high - Math.round((1 - going) * 6);
  const wide = Math.min(1.6, z.r) * 17;
  const beat = Math.floor(t * (o.flick ?? 12));
  const struck = lit && hash2(s.seed, beat, 4) < 0.45 ? Math.floor(hash2(s.seed, beat, 5) * o.puffs) : -1;
  g.globalAlpha = o.alpha * fade;
  for (let i = 0; i < o.puffs; i++) {
    const churn = t * (0.7 + hash2(i, s.seed, 6) * 0.6) + i * 2.1;
    const ox = ((hash2(i, s.seed, 1) - 0.5) * wide * 2 + Math.sin(churn) * 2.5) * (0.35 + 0.65 * born);
    const oy = (hash2(i, s.seed, 2) - 0.5) * 7 + Math.cos(churn * 0.8) * 1.4;
    const r = Math.max(1, (o.size + hash2(i, s.seed, 3) * o.size * 0.8 + Math.sin(churn * 1.3) * 0.9) * (0.4 + 0.6 * born) * (0.5 + 0.5 * going));
    const px = Math.round(cx + ox);
    const py = Math.round(cy + oy);
    g.fillStyle = cols[2];
    g.beginPath();
    g.ellipse(px, py - 2, r, r * 0.55, 0, 0, Math.PI * 2);
    g.fill();
    const near = struck >= 0 ? Math.abs(i - struck) : 9;
    g.fillStyle = lit && near === 0 ? lit[1] : lit && near === 1 ? lit[0] : i % 2 === 0 ? cols[0] : cols[1];
    g.beginPath();
    g.ellipse(px, py, r, r * 0.55, 0, 0, Math.PI * 2);
    g.fill();
    if (lit && near === 0) {
      g.fillStyle = lit[2];
      g.beginPath();
      g.ellipse(px, py + 1, r * 0.5, r * 0.22, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  if (struck >= 0 && lit) {
    g.fillStyle = lit[1];
    g.fillRect(Math.round(cx - wide * 0.7), Math.round(cy + 5), Math.round(wide * 1.4), 1);
  }
  g.globalAlpha = 1;
}

/**
 * Low puffs turning over a patch (a cloud that hangs on the floor: rot, fumes, mist): each a body,
 * a darker belly and a cap lit at its upper left, so that it has weight. `cols`: belly, body, cap.
 * `clear`: a place on the screen (the hero) the cloud thins round, so that what stands in it is seen.
 */
function fog(g: CanvasRenderingContext2D, cam: Cam, z: Zone, t: number, cols: readonly string[], o: { n: number; size: number; alpha: number; rise?: number; clear?: [number, number] }): void {
  const s = shapeOf(z);
  const fade = Math.min(1, z.t / 0.25, (z.dur - z.t) * 2);
  for (let i = 0; i < o.n; i++) {
    const a = (i / o.n) * Math.PI * 2 + t * (0.25 + hash2(i, s.seed, 1) * 0.3) * (i % 2 === 0 ? 1 : -1);
    const d = z.r * (0.2 + hash2(i, s.seed, 2) * 0.6);
    const life = o.rise ? (t * o.rise + hash2(i, s.seed, 6)) % 1 : 0;
    const px = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
    const py = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - 6 - Math.round(hash2(i, s.seed, 3) * 8 + Math.sin(t * 1.3 + i) * 2) - Math.round(life * 26);
    const rr = o.size + hash2(i, s.seed, 4) * o.size + life * 6;
    let alpha = (o.alpha + hash2(i, s.seed, 5) * 0.12) * fade * (o.rise ? Math.min(1, (1 - life) * 2.5, life * 6) : 1);
    // (a cloud thins round the hero standing in it: the player must never lose sight of them)
    if (o.clear && Math.hypot(px - o.clear[0], (py - o.clear[1]) * 1.6) < 30) alpha *= 0.3;
    g.globalAlpha = alpha;
    g.fillStyle = cols[0];
    g.beginPath();
    g.ellipse(px + 1, py + 2, rr * 1.5, rr * 0.75, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = cols[1];
    g.beginPath();
    g.ellipse(px, py, rr * 1.4, rr * 0.75, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = cols[2];
    g.beginPath();
    g.ellipse(px - rr * 0.35, py - rr * 0.3, rr * 0.8, rr * 0.4, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
}

export function airM3(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game): void {
  const hx = Math.round(wx(cam, game.hero.x, game.hero.y));
  const hy = Math.round(wy(cam, game.hero.x, game.hero.y));
  // (the small patches a shot leaves along its way share one cloud between those near each other)
  const shared: number[] = [];
  for (const z of game.zones) {
    const look = lookOf(z);
    if (!look) continue;
    const small = z.r < 1.2;
    if (small && (look === 'thunderhead' || look === 'hail' || look === 'greenstorm' || look === 'fumes' || look === 'rot' || look === 'coldmist' || look === 'crackle' || look === 'boil')) {
      let near = false;
      for (let i = 0; i < shared.length && !near; i += 2) near = Math.abs(shared[i] - z.x) < 1.3 && Math.abs(shared[i + 1] - z.y) < 1.3;
      if (near) continue;
      shared.push(z.x, z.y);
    }
    const s = shapeOf(z);
    if (look === 'thunderhead') {
      // a heavy thunderhead, low and dark, violet lightning moving inside it
      const C = MELD_RAMP.thunder;
      cloud(g, cam, z, t, ['#2c2444', '#382e52', '#5e527c'], [C[2], C[3], C[4]], { high: small ? 38 : 46, puffs: small ? 5 : 12, size: small ? 6 : 8, alpha: 0.95, flick: 14 });
      // lightning crawling along its belly
      if (hash2(s.seed, Math.floor(t * 10), 9) < 0.3) {
        const cx = wx(cam, z.x, z.y);
        const cy = wy(cam, z.x, z.y) - (small ? 34 : 42);
        let px = cx - 14;
        for (let i = 0; i < 6; i++) {
          const nx = px + 5;
          const ny = cy + Math.round(hash2(s.seed, Math.floor(t * 10) * 7 + i, 10) * 6 - 3);
          pline(g, px, cy + (i % 2), nx, ny, C[4]);
          px = nx;
        }
      }
    } else if (look === 'hail') {
      // a pale, icy cloud, and hail driving down out of it all the time, bouncing where it strikes
      const C = MELD_RAMP.hailstorm;
      cloud(g, cam, z, t, [C[1], C[2], C[3]], [C[3], C[4], C[5]], { high: small ? 40 : 50, puffs: small ? 4 : 10, size: small ? 5 : 7, alpha: 0.9, flick: 10 });
      const fade = fadeOf(z);
      const n = small ? 5 : 14;
      for (let i = 0; i < n; i++) {
        const q = (t * 1.8 + hash2(s.seed, i, 41)) % 1;
        const a = hash2(s.seed, i, 42) * Math.PI * 2;
        const d = Math.sqrt(hash2(s.seed, i, 43)) * z.r * 0.85;
        const fx0 = z.x + Math.cos(a) * d;
        const fy0 = z.y + Math.sin(a) * d;
        const px = Math.round(wx(cam, fx0, fy0));
        const py = Math.round(wy(cam, fx0, fy0));
        g.globalAlpha = fade;
        if (q < 0.7) {
          // falling: a streak
          const up = Math.round((1 - q / 0.7) * (small ? 38 : 48));
          g.fillStyle = C[4];
          g.fillRect(px, py - up - 3, 1, 3);
          g.fillStyle = '#ffffff';
          g.fillRect(px, py - up, 1, 1);
        } else {
          // bounced: a little hop
          const b = (q - 0.7) / 0.3;
          const hop = Math.round(Math.sin(b * Math.PI) * 4);
          g.fillStyle = '#ffffff';
          g.fillRect(px + Math.round(b * 3), py - hop, 1, 1);
        }
      }
      g.globalAlpha = 1;
    } else if (look === 'greenstorm') {
      const C = MELD_RAMP.contagion;
      cloud(g, cam, z, t, ['#16301c', '#1e3a24', '#3a5c40'], [C[2], C[3], C[4]], { high: small ? 38 : 48, puffs: small ? 4 : 10, size: small ? 5 : 7, alpha: 0.9, flick: 12 });
    } else if (look === 'rot') {
      const C = MELD_RAMP.blight;
      fog(g, cam, z, t, [C[1], C[2], C[3]], { n: Math.round(6 + z.r * 3), size: 5, alpha: 0.3, clear: [hx, hy - 14] });
      // spores drifting down through it
      const fade = fadeOf(z);
      for (let i = 0; i < (small ? 5 : 14); i++) {
        const q = (t * 0.35 + hash2(s.seed, i, 51)) % 1;
        const a = hash2(s.seed, i, 52) * Math.PI * 2;
        const d = Math.sqrt(hash2(s.seed, i, 53)) * z.r * 0.8;
        g.globalAlpha = fade * Math.min(1, q * 5, (1 - q) * 3);
        g.fillStyle = i % 3 === 0 ? C[5] : C[4];
        g.fillRect(Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d) + Math.sin(t * 2 + i) * 2), Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - Math.round(26 * (1 - q)), 1, i % 4 === 0 ? 2 : 1);
      }
      g.globalAlpha = 1;
    } else if (look === 'boil') {
      // steam rolling up thick off it, warm white and cold blue together
      const C = MELD_RAMP.scald;
      const fade = fadeOf(z);
      const n = Math.round((small ? 6 : 12) + z.r * 5);
      for (let i = 0; i < n; i++) {
        const life = (t * (0.4 + hash2(i, s.seed, 1) * 0.3) + hash2(i, s.seed, 6)) % 1;
        const a = hash2(i, s.seed, 7) * Math.PI * 2;
        const d = z.r * (0.1 + hash2(i, s.seed, 2) * 0.8);
        const px = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d) + Math.sin(t * 1.1 + i) * 3);
        const py = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - 3 - Math.round(life * 40);
        const rr = 5 + hash2(i, s.seed, 4) * 6 + life * 10;
        // (it thins round the hero standing in it: hidden from the monsters, never from the player)
        const nearHero = Math.hypot(px - hx, (py - hy + 16) * 1.6) < 30;
        g.globalAlpha = (0.34 + hash2(i, s.seed, 5) * 0.18) * fade * Math.min(1, (1 - life) * 2.5, life * 6) * (nearHero ? 0.3 : 1);
        g.fillStyle = i % 4 === 0 ? '#ffffff' : i % 4 === 1 ? '#d8ecf8' : i % 4 === 2 ? C[4] : C[3];
        g.beginPath();
        g.ellipse(px, py, rr * 1.3, rr, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    } else if (look === 'fumes') {
      // thick sour smoke rolling over itself, embers glowing in it; it flickers as if about to go up
      const C = MELD_RAMP.fumes;
      fog(g, cam, z, t, ['#2a2412', C[2], C[3]], { n: Math.round(6 + z.r * 4), size: 6, alpha: 0.34, rise: 0.35, clear: [hx, hy - 14] });
      const fade = fadeOf(z);
      for (let i = 0; i < (small ? 3 : 7); i++) {
        const on = Math.sin(t * (5 + i) + s.seed + i * 2) > 0.6;
        if (!on) continue;
        const a = hash2(s.seed, i, 61) * Math.PI * 2;
        const d = Math.sqrt(hash2(s.seed, i, 62)) * z.r * 0.7;
        g.globalAlpha = fade;
        g.fillStyle = i % 2 === 0 ? '#ffc24a' : '#ff8a2a';
        g.fillRect(Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)), Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - 8 - Math.round(hash2(s.seed, i, 63) * 14), 1, 1);
      }
      g.globalAlpha = 1;
    } else if (look === 'coldmist') {
      const C = MELD_RAMP.frostbite;
      fog(g, cam, z, t, ['#4a8a7c', '#9ad0c0', '#e4f8f4'], { n: Math.round(6 + z.r * 3), size: 6, alpha: 0.22, clear: [hx, hy - 14] });
      const fade = fadeOf(z);
      g.fillStyle = '#ffffff';
      for (let i = 0; i < (small ? 2 : 5); i++) {
        if (hash2(i, s.seed, Math.floor(t * 6)) > 0.4) continue;
        const a = hash2(s.seed, i, 71) * Math.PI * 2;
        const d = Math.sqrt(hash2(s.seed, i, 72)) * z.r * 0.8;
        g.globalAlpha = fade;
        g.fillRect(Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)), Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - 6 - (i % 3) * 3, 1, 1);
      }
      g.globalAlpha = 1;
    } else if (look === 'crackle') {
      // a sick green cloud with lightning crawling through it
      const C = MELD_RAMP.contagion;
      fog(g, cam, z, t, [C[0], C[2], C[3]], { n: Math.round(5 + z.r * 3), size: 5, alpha: 0.26, clear: [hx, hy - 14] });
      const beat = Math.floor(t * 9);
      for (let k = 0; k < (small ? 1 : 3); k++) {
        if (hash2(s.seed, beat, 80 + k) > 0.55) continue;
        const a = hash2(s.seed, beat * 3 + k, 81) * Math.PI * 2;
        const b = a + 1.4 + hash2(s.seed, beat * 3 + k, 82) * 2;
        const d0 = z.r * 0.7;
        let px = wx(cam, z.x + Math.cos(a) * d0, z.y + Math.sin(a) * d0);
        let py = wy(cam, z.x + Math.cos(a) * d0, z.y + Math.sin(a) * d0) - 10;
        const ex = wx(cam, z.x + Math.cos(b) * d0, z.y + Math.sin(b) * d0);
        const ey = wy(cam, z.x + Math.cos(b) * d0, z.y + Math.sin(b) * d0) - 10;
        g.globalAlpha = fadeOf(z);
        for (let i = 1; i <= 4; i++) {
          const nx = px + (ex - px) / (5 - i) + (i < 4 ? hash2(beat, k, i) * 6 - 3 : 0);
          const ny = py + (ey - py) / (5 - i) + (i < 4 ? hash2(beat, k, i + 9) * 6 - 3 : 0);
          pline(g, px, py, nx, ny, i % 2 ? C[4] : C[5]);
          px = nx;
          py = ny;
        }
        g.globalAlpha = 1;
      }
    } else if (look === 'toxicice') {
      const C = MELD_RAMP.frostbite;
      fog(g, cam, z, t, ['#4a8a7c', '#9ad0c0', '#e4f8f4'], { n: Math.round(3 + z.r * 2), size: 4, alpha: 0.14, clear: [hx, hy - 14] });
    } else if (look === 'molten') {
      // heat shimmering up off it
      const C = MELD_RAMP.eruption;
      const fade = fadeOf(z);
      for (let i = 0; i < (small ? 2 : 5); i++) {
        const q = (t * 0.8 + hash2(s.seed, i, 91)) % 1;
        const a = hash2(s.seed, i, 92) * Math.PI * 2;
        const d = Math.sqrt(hash2(s.seed, i, 93)) * z.r * 0.6;
        const px = wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d);
        const py = wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d) - 4 - q * 30;
        g.globalAlpha = fade * 0.4 * Math.min(1, q * 4, (1 - q) * 2);
        for (let j = 0; j < 6; j++) {
          g.fillStyle = C[4];
          g.fillRect(Math.round(px + Math.sin(t * 6 + j + i) * 2), Math.round(py - j * 2), 1, 1);
        }
      }
      g.globalAlpha = 1;
    }
  }
  // monsters: Thunder's stun crackling over the head, Blight's rot, Frostbite's jaws
  for (const m of game.monsters) {
    if (m.dead || !m.seen) continue;
    const k = M3.marks.get(m.id);
    const [ox, oy] = shiftM3(m);
    const sx = Math.round(wx(cam, m.x, m.y)) + ox;
    const sy = Math.round(wy(cam, m.x, m.y)) + oy;
    const top = FIGURE_SIZE[figureOf(m)].top;
    if (k && k.thunder > 0 && m.stunT > 0) drawThunderStun(g, sx, sy - top - 11, t, k);
    if (k && k.blight && m.poisonT > 0) drawRot(g, sx, sy, top, FIGURE_SIZE[figureOf(m)].half, t, m);
  }
  // Frostbite's jaws are drawn over the hit's own sparks (in overM3), where they can be seen: here
  // only where each one is this frame
  for (const c of M3.clamps) {
    const m = game.monsters.find((q) => q.id === c.id && !q.dead);
    c.at = undefined;
    if (!m) continue;
    const [ox, oy] = shiftM3(m);
    c.at = [Math.round(wx(cam, m.x, m.y)) + ox, Math.round(wy(cam, m.x, m.y)) + oy - Math.round(FIGURE_SIZE[figureOf(m)].top * 0.5), FIGURE_SIZE[figureOf(m)].half];
  }
  // the hero: Eruption's heat as embers circling low; Thunder's charge as sparks circling high
  if (M3.heat > 0) drawHeat(g, hx, hy, t);
  if (M3.claps > 0) drawCharge(g, hx, hy, t);
}

/** Over the effects' sparks: the bolts, the lava bombs and hail, the columns, the screen's flash. */
export function overM3(g: CanvasRenderingContext2D, cam: Cam, t: number): void {
  for (const c of M3.clamps) if (c.at) drawJaws(g, c.at[0], c.at[1], c, c.at[2]);
  for (const c of M3.columns) {
    // a jet standing up off the floor: it shoots up in the first quarter of its time, ragged at its
    // edges, white at its heart, thinning toward its head, then falls back, its foot going first
    const C = MELD_RAMP[c.word];
    const steam = c.word === 'scald';
    const k = c.t / c.dur;
    const cx = Math.round(wx(cam, c.x, c.y));
    const cy = Math.round(wy(cam, c.x, c.y));
    const top = Math.round(c.h * Math.min(1, k / 0.22) * (k > 0.6 ? 1 - (k - 0.6) * 0.5 : 1));
    const foot = k > 0.55 ? Math.round(top * ((k - 0.55) / 0.45)) : 0;
    const seed = Math.round(c.x * 97 + c.y * 31);
    for (let j = foot; j < top; j++) {
      const q = j / Math.max(1, top);
      const wob = Math.sin(j * 0.45 + seed + c.t * 26) * 0.6 + Math.sin(j * 1.1 - c.t * 17 + seed * 0.3) * 0.4;
      const half = Math.max(0, Math.round(c.w * Math.pow(1 - q, 0.6) + wob * 2));
      const sway = Math.round(Math.sin(j * 0.15 + c.t * 20) * q * 2);
      g.globalAlpha = steam ? 0.7 * (1 - q * 0.6) : 1;
      g.fillStyle = steam ? C[3] : C[2];
      g.fillRect(cx + sway - half - 1, cy - j, half * 2 + 3, 1);
      g.fillStyle = steam ? C[4] : C[3];
      g.fillRect(cx + sway - half, cy - j, half * 2 + 1, 1);
      if (half > 1) {
        g.fillStyle = steam ? '#ffffff' : C[4];
        g.fillRect(cx + sway - Math.ceil(half / 2), cy - j, Math.ceil(half / 2) * 2 + 1, 1);
      }
      if (q < 0.7 && half > 0) {
        g.fillStyle = C[5];
        g.fillRect(cx + sway, cy - j, 1, 1);
      }
    }
    // its head boils over: globs thrown off it
    if (k < 0.8 && top > 4) {
      for (let i = 0; i < 6; i++) {
        const a = c.t * 11 + i * 1.05;
        const r = 2 + c.w * 0.5 + ((i * 3 + Math.floor(c.t * 30)) % 3);
        g.globalAlpha = steam ? 0.6 : 1;
        g.fillStyle = i % 2 ? C[4] : C[5];
        g.fillRect(cx + Math.round(Math.cos(a) * r), cy - top + Math.round(Math.sin(a) * r * 0.5), 2, 2);
      }
    }
    g.globalAlpha = 1;
  }
  for (const b of M3.bombs) {
    if (b.t < 0) continue;
    const k = Math.min(1, b.t / b.dur);
    const x = b.x0 + (b.x1 - b.x0) * k;
    const y = b.y0 + (b.y1 - b.y0) * k;
    const px = Math.round(wx(cam, x, y));
    const py = Math.round(wy(cam, x, y) - b.h * 4 * k * (1 - k) * (b.word === 'hailstorm' ? 0 : 1) - (b.word === 'hailstorm' ? b.h * (1 - k) : 0));
    const C = MELD_RAMP[b.word];
    if (b.word === 'eruption') {
      // a lava bomb: a glowing heart, a black crust, a tail of sparks
      const q = Math.max(0, k - 0.08);
      const tx = Math.round(wx(cam, b.x0 + (b.x1 - b.x0) * q, b.y0 + (b.y1 - b.y0) * q));
      const ty = Math.round(wy(cam, b.x0 + (b.x1 - b.x0) * q, b.y0 + (b.y1 - b.y0) * q) - b.h * 4 * q * (1 - q));
      pline(g, px, py, tx, ty, C[4]);
      g.fillStyle = C[1];
      g.fillRect(px - 2, py - 1, 4, 3);
      g.fillStyle = C[4];
      g.fillRect(px - 1, py - 1, 2, 2);
      g.fillStyle = C[5];
      g.fillRect(px - 1, py - 1, 1, 1);
    } else {
      // a hailstone streaking down
      g.fillStyle = C[4];
      g.fillRect(px, py - 4, 1, 4);
      g.fillStyle = '#ffffff';
      g.fillRect(px, py, 2, 2);
    }
  }
  for (const b of M3.bolts) {
    const k = b.t / b.dur;
    // (it flickers: on, a beat off, on again, then gone)
    if (k > 0.3 && k < 0.42) continue;
    const C = b.C;
    const core = k < 0.25 ? C[5] : k < 0.6 ? C[4] : C[3];
    for (let i = 0; i + 3 < b.pts.length; i += 2) {
      const x0 = wx(cam, b.pts[i], b.pts[i + 1]);
      const y0 = wy(cam, b.pts[i], b.pts[i + 1]) - b.z;
      const x1 = wx(cam, b.pts[i + 2], b.pts[i + 3]);
      const y1 = wy(cam, b.pts[i + 2], b.pts[i + 3]) - b.z;
      if (k < 0.6) thick(g, x0, y0 + 1, x1, y1 + 1, C[2], b.w + 1);
      thick(g, x0, y0, x1, y1, core, b.w);
      if (b.kind === 'ice' && k < 0.7) {
        // crystals standing off it
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        pline(g, mx, my, mx + 2, my - 3, C[5]);
        pline(g, mx, my, mx - 2, my + 2, C[4]);
      }
      if (b.kind === 'fire' && k < 0.8 && i % 4 === 0) {
        g.fillStyle = k < 0.4 ? '#fff0a0' : '#ffc24a';
        g.fillRect(Math.round(x1), Math.round(y1) - 2, 1, 2);
      }
    }
  }
  for (const s of M3.skies) {
    const k = s.t / s.dur;
    if (k > 0.35 && k < 0.45) continue;
    const C = s.C;
    const bx = wx(cam, s.x, s.y);
    const by = wy(cam, s.x, s.y) - 2;
    const step = s.top / s.offs.length;
    const core = k < 0.3 ? C[5] : k < 0.65 ? C[4] : C[3];
    const w = k < 0.5 ? s.w : Math.max(1, s.w - 1);
    let px = bx;
    let py = by;
    for (let i = 0; i < s.offs.length; i++) {
      const nx = bx + s.offs[i];
      const ny = by - (i + 1) * step;
      if (k < 0.6) {
        thick(g, px - w, py, nx - w, ny, C[3], 1);
        thick(g, px + w, py, nx + w, ny, C[2], 1);
      }
      thick(g, px, py, nx, ny, core, w);
      px = nx;
      py = ny;
    }
    if (k < 0.7) {
      for (const f of s.forks) {
        let fx0 = bx + s.offs[f.at];
        let fy0 = by - (f.at + 1) * step;
        for (let i = 0; i < f.offs.length; i++) {
          const nx = bx + f.offs[i];
          const ny = fy0 + step * 0.6;
          pline(g, fx0, fy0, nx, ny, i === 0 ? C[4] : C[3]);
          fx0 = nx;
          fy0 = ny;
        }
      }
    }
    // where it strikes, a splash of light on the floor
    if (k < 0.5) {
      g.globalAlpha = 0.8 * (1 - k * 2);
      g.fillStyle = C[5];
      g.beginPath();
      g.ellipse(bx, by + 2, 9 + s.w * 3, 4 + s.w, 0, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    }
  }
  if (M3.flash.t < M3.flash.dur) {
    g.globalAlpha = M3.flash.a * (1 - M3.flash.t / M3.flash.dur);
    g.fillStyle = M3.flash.color;
    g.fillRect(0, 0, g.canvas.width, g.canvas.height);
    g.globalAlpha = 1;
  }
  void t;
}

/** Thunder's stun: violet sparks over the head, little bolts jumping between them. */
function drawThunderStun(g: CanvasRenderingContext2D, sx: number, cy: number, t: number, k: Mark): void {
  const C = MELD_RAMP.thunder;
  const grow = Math.min(1, k.thunder0 / 0.12);
  const pts: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    const a = t * 7 + (i / 3) * Math.PI * 2;
    pts.push([Math.round(sx + Math.cos(a) * 9 * grow), Math.round(cy + Math.sin(a) * 3 * grow)]);
  }
  const beat = Math.floor(t * 16);
  for (let i = 0; i < 3; i++) {
    if (hash2(beat, i, 3) > 0.6) continue;
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % 3];
    const mx = (x0 + x1) / 2 + (hash2(beat, i, 4) - 0.5) * 6;
    const my = (y0 + y1) / 2 - 2 - hash2(beat, i, 5) * 3;
    pline(g, x0, y0, mx, my, C[4]);
    pline(g, mx, my, x1, y1, C[5]);
  }
  for (const [px, py] of pts) {
    g.fillStyle = C[3];
    g.fillRect(px - 1, py, 3, 1);
    g.fillRect(px, py - 1, 1, 3);
    g.fillStyle = C[5];
    g.fillRect(px, py, 1, 1);
  }
}

/** Blight's rot on what it struck: sick veins climbing its body and drips of black rot off it, more and higher the lower its life. */
function drawRot(g: CanvasRenderingContext2D, sx: number, sy: number, top: number, half: number, t: number, m: Monster): void {
  const C = MELD_RAMP.blight;
  const lost = 1 - Math.max(0, m.life) / Math.max(1, m.maxLife);
  const n = 3 + Math.round(lost * 6);
  for (let i = 0; i < n; i++) {
    const x0 = sx + Math.round((hash2(m.id, i, 1) - 0.5) * half * 1.5);
    const len = Math.round(top * (0.3 + 0.55 * lost) * (0.5 + hash2(m.id, i, 2) * 0.5));
    // (it creeps: each vein's tip a little higher with every beat)
    const grow = 0.75 + 0.25 * ((t * 0.7 + hash2(m.id, i, 4)) % 1);
    let px = x0;
    let py = sy - 1;
    for (let j = 0; j < len * grow; j += 2) {
      const nx = px + (hash2(m.id, i * 13 + j, 3) < 0.5 ? -1 : 1);
      const ny = py - 2;
      pline(g, px, py, nx, ny, j % 4 === 0 ? C[2] : C[3]);
      px = nx;
      py = ny;
    }
    g.fillStyle = C[4];
    g.fillRect(px, py, 1, 1);
  }
  // drips of black rot falling off it
  const drips = 1 + Math.round(lost * 4);
  for (let i = 0; i < drips; i++) {
    const q = (t * (0.9 + hash2(m.id, i, 5) * 0.6) + hash2(m.id, i, 6)) % 1;
    const px = sx + Math.round((hash2(m.id, i, 7) - 0.5) * half * 1.2);
    const py = sy - Math.round(top * (0.3 + hash2(m.id, i, 8) * 0.5) * (1 - q));
    g.globalAlpha = Math.min(1, (1 - q) * 3);
    g.fillStyle = i % 2 ? C[1] : C[0];
    g.fillRect(px, py, 1, 2);
    g.fillStyle = C[2];
    g.fillRect(px, py, 1, 1);
  }
  g.globalAlpha = 1;
}

/**
 * Frostbite's jaws: two curved jaws of ice, fanged, above and below what it struck, that snap
 * shut on it into a ring of fangs round its middle; a crunch, venom squeezed out.
 */
function drawJaws(g: CanvasRenderingContext2D, sx: number, cy: number, c: Clamp, half: number): void {
  const C = MELD_RAMP.frostbite;
  const k = c.t / c.dur;
  const shut = k < 0.4 ? smooth(k / 0.4) : 1;
  const gape = Math.round((1 - shut) * (c.big ? 18 : 11));
  const rx = Math.max(11, half + (c.big ? 10 : 6));
  const ry = c.big ? 8 : 6;
  const long = c.big ? 5 : 3;
  g.globalAlpha = (k < 0.7 ? 1 : (1 - k) / 0.3) * (c.big ? 1 : 0.85);
  for (const side of [-1, 1]) {
    // the upper jaw is the top of an oval, its fangs pointing down; the lower the bottom, pointing up
    const jy = cy + side * gape;
    const steps = 26;
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI * (i / steps);
      const px = Math.round(sx - Math.cos(a) * rx);
      const py = Math.round(jy + side * Math.sin(a) * ry);
      g.fillStyle = C[1];
      g.fillRect(px, py + side * 2, 1, 1);
      g.fillStyle = C[3];
      g.fillRect(px, py + side, 1, 1);
      g.fillStyle = side < 0 ? C[5] : C[4];
      g.fillRect(px, py, 1, 1);
      if (i % 4 === 2) {
        // a fang, white at its root, narrowing toward the other jaw
        for (let f = 1; f <= long; f++) {
          g.fillStyle = f <= 1 ? '#ffffff' : f <= long / 2 + 1 ? C[5] : C[4];
          g.fillRect(px, py - side * f, f <= long / 2 ? 2 : 1, 1);
        }
      }
    }
  }
  if (k > 0.38 && k < 0.52) {
    // the crunch: a white line across where they met, venom squeezed out
    g.fillStyle = '#ffffff';
    g.fillRect(sx - rx - 4, cy, rx * 2 + 9, 1);
    g.fillStyle = '#b4cc24';
    g.fillRect(sx - rx + 2, cy + 1, 1, 2);
    g.fillRect(sx + rx - 3, cy + 1, 1, 3);
    g.fillRect(sx, cy + 2, 1, 2);
  }
  g.globalAlpha = 1;
}

/** Eruption behind: an ember for each heat, circling the hero's feet; at full heat they blaze and smoke. */
function drawHeat(g: CanvasRenderingContext2D, hx: number, hy: number, t: number): void {
  const C = MELD_RAMP.eruption;
  const n = M3.heat;
  const full = n >= M3.heatFull;
  for (let i = 0; i < n; i++) {
    const a = t * (full ? 5 : 2.6) + (i / n) * Math.PI * 2;
    const px = Math.round(hx + Math.cos(a) * 15);
    const py = Math.round(hy - 3 + Math.sin(a) * 6);
    g.fillStyle = C[2];
    g.fillRect(px - 1, py - 1, 3, 3);
    g.fillStyle = full ? C[5] : C[4];
    g.fillRect(px, py - 1, 1, 2);
    if (full) {
      g.fillStyle = C[4];
      g.fillRect(px, py - 4 - Math.round((t * 20 + i * 3) % 4), 1, 1);
    }
  }
}

/**
 * Thunder behind: a ball of violet lightning for each hit toward the clap, circling the hero's
 * chest with a tail of where it has been; one hit short of the clap they go faster and bolts
 * jump between them.
 */
function drawCharge(g: CanvasRenderingContext2D, hx: number, hy: number, t: number): void {
  const C = MELD_RAMP.thunder;
  const n = M3.claps;
  const ready = n >= M3.clapEvery - 1;
  const spin = t * (ready ? 7 : 4);
  const at = (a: number): [number, number] => [Math.round(hx + Math.cos(a) * 15), Math.round(hy - 16 + Math.sin(a) * 5)];
  const pts: [number, number][] = [];
  for (const pass of [0, 1]) {
    for (let i = 0; i < n; i++) {
      const a = spin + (i / n) * Math.PI * 2;
      // (the ones beyond the hero, up the screen, small and dim: they pass behind and come round in front)
      const far = Math.sin(a) < 0;
      if ((pass === 0) !== far) continue;
      const [px, py] = at(a);
      if (pass === 1) pts.push([px, py]);
      let qx = px;
      let qy = py;
      for (let k = 1; k <= (far ? 3 : 6); k++) {
        const [tx, ty] = at(a - k * 0.16);
        pline(g, qx, qy, tx, ty, far ? C[2] : k <= 2 ? C[4] : C[3]);
        qx = tx;
        qy = ty;
      }
      if (far) {
        g.fillStyle = C[3];
        g.fillRect(px - 1, py - 1, 3, 3);
      } else {
        g.fillStyle = C[3];
        g.fillRect(px - 2, py - 1, 5, 3);
        g.fillRect(px - 1, py - 2, 3, 5);
        g.fillStyle = C[4];
        g.fillRect(px - 1, py - 1, 3, 3);
        g.fillStyle = C[5];
        g.fillRect(px, py, 1, 1);
        // (it crackles: a spark off it now and then)
        if (hash2(i, Math.floor(t * 20), 7) < 0.4) pline(g, px, py, px + Math.round((hash2(i, Math.floor(t * 20), 8) - 0.5) * 10), py - 2 - Math.round(hash2(i, Math.floor(t * 20), 9) * 6), C[5]);
      }
    }
  }
  if (ready && pts.length > 1) {
    const beat = Math.floor(t * 18);
    for (let i = 0; i < pts.length; i++) {
      if (hash2(beat, i, 1) > 0.7) continue;
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      const mx = (x0 + x1) / 2 + (hash2(beat, i, 2) - 0.5) * 8;
      const my = (y0 + y1) / 2 + (hash2(beat, i, 3) - 0.5) * 6;
      pline(g, x0, y0, mx, my, C[4]);
      pline(g, mx, my, x1, y1, C[5]);
    }
  }
}

// =============================================================================================
// The renderer's hooks.

/** Where a monster's picture is moved to, in game pixels: Avalanche's shove, sliding to where it now is. */
export function shiftM3(m: Monster): [number, number] {
  for (const s of M3.slides) {
    if (s.id !== m.id) continue;
    const k = Math.min(1, s.t / s.dur);
    const e = 1 - (1 - k) * (1 - k) * (1 - k);
    // (it is drawn where the slide has got to: behind where the rules have it, by what is left)
    const bx = (s.x1 - s.x0) * (1 - e);
    const by = (s.y1 - s.y0) * (1 - e);
    return [Math.round(-(bx - by) * 16), Math.round(-(bx + by) * 8)];
  }
  return [0, 0];
}

/** A colour laid over a monster's picture: Blight's rot, Frostbite's bite, Thunder's stun, a crush. */
export function tintM3(m: Monster, t: number): [string, number] | null {
  const k = M3.marks.get(m.id);
  if (k && k.crush < 0.12) return ['#ffffff', 0.7];
  if (k && k.thunder > 0 && m.stunT > 0) return [Math.floor(t * 20) % 3 === 0 ? MELD_RAMP.thunder[5] : MELD_RAMP.thunder[3], Math.floor(t * 20) % 3 === 0 ? 0.55 : 0.28];
  if (m.biteDps && (m.chillT > 0 || m.frozenT > 0)) return [Math.floor(t * 4 + m.id) % 2 === 0 ? MELD_RAMP.frostbite[3] : '#7c9416', 0.38];
  if (k && k.blight && m.poisonT > 0) return [MELD_RAMP.blight[1], 0.25 + 0.4 * (1 - Math.max(0, m.life) / Math.max(1, m.maxLife))];
  return null;
}

/** Whether a monster rots by Blight (the renderer leaves out Poison's bubbles on it: the rot is its sickness). */
export function rotting(m: Monster): boolean {
  if (!MELD3.on || m.poisonT <= 0) return false;
  const k = M3.marks.get(m.id);
  return !!k && k.blight;
}

/** How solid the hero is drawn (1: as always): Scald's steam hides them. */
export function heroAlphaM3(t: number): number {
  return M3.hidden ? 0.6 + 0.08 * Math.sin(t * 5) : 1;
}

/** Light: the renderer's `spot` (screen x, y, radius, strength). */
export function lightsM3(spot: (x: number, y: number, r: number, a: number) => void, cam: Cam, game: Game, t: number): void {
  const lit: number[] = [];
  for (const z of game.zones) {
    const look = lookOf(z);
    if (!look) continue;
    const small = z.r < 1.2;
    if (small) {
      let near = false;
      for (let i = 0; i < lit.length && !near; i += 2) near = Math.abs(lit[i] - z.x) < 1.0 && Math.abs(lit[i + 1] - z.y) < 1.0;
      if (near) continue;
      lit.push(z.x, z.y);
    }
    const fade = Math.min(1, (z.dur - z.t) * 2);
    const x = wx(cam, z.x, z.y);
    const y = wy(cam, z.x, z.y);
    const base = (small ? 30 : 18) + z.r * 16;
    if (look === 'molten') spot(x, y - 2, base + 10, 0.85 * fade);
    else if (look === 'wildfire') spot(x, y - 4, base + 6, (0.7 + 0.15 * Math.sin(t * 13 + z.x)) * fade);
    else if (look === 'smoulder' || look === 'fumes') spot(x, y - 4, base, 0.45 * fade);
    else if (look === 'thunderhead' || look === 'hail' || look === 'greenstorm' || look === 'crackle') spot(x, y - 6, base, (0.5 + 0.25 * (Math.floor(t * 12 + z.y) % 3 === 0 ? 1 : 0)) * fade);
    else if (look === 'boil' || look === 'snow' || look === 'toxicice' || look === 'coldmist') spot(x, y - 2, base, 0.55 * fade);
    else spot(x, y - 2, base, 0.4 * fade);
  }
  for (const sc of M3.scars) {
    const hot = Math.max(0, 1 - sc.t / (sc.kind === 'fissure' ? 1.8 : 0.7));
    if (hot > 0 && sc.kind !== 'furrow') spot(wx(cam, sc.x, sc.y), wy(cam, sc.x, sc.y) - 2, 20 + sc.r * 18, 0.8 * hot);
  }
  for (const c of M3.columns) if (c.t >= 0) spot(wx(cam, c.x, c.y), wy(cam, c.x, c.y) - c.h * 0.4, 60, 0.9 * (1 - c.t / c.dur));
  for (const b of M3.bombs) if (b.word === 'eruption' && b.t > 0) spot(wx(cam, b.x0 + (b.x1 - b.x0) * (b.t / b.dur), b.y0 + (b.y1 - b.y0) * (b.t / b.dur)), wy(cam, b.x0 + (b.x1 - b.x0) * (b.t / b.dur), b.y0 + (b.y1 - b.y0) * (b.t / b.dur)) - 20, 16, 0.6);
  if (M3.heat > 0) spot(wx(cam, game.hero.x, game.hero.y), wy(cam, game.hero.x, game.hero.y) - 4, 20 + M3.heat * 5, 0.5 + 0.08 * M3.heat);
  for (const m of game.monsters) {
    if (m.dead || !m.seen) continue;
    const k = M3.marks.get(m.id);
    if (k && k.thunder > 0 && m.stunT > 0) spot(wx(cam, m.x, m.y), wy(cam, m.x, m.y) - FIGURE_SIZE[figureOf(m)].top - 8, 20, 0.6);
  }
}

// =============================================================================================
// The clock, and what the rules said happened.

let joinedLevel: unknown = null;

/** Age everything; and what goes on all the time (the hero's meters, the patches' own life, the melded shots' trails). */
export function tickM3(dt: number, game: Game, fx: Fx): void {
  if (game.level !== joinedLevel) {
    joinedLevel = game.level;
    clearM3();
  }
  M3.clock += dt;
  M3.dt = dt;
  for (let i = M3.later.length - 1; i >= 0; i--) {
    M3.later[i].t -= dt;
    if (M3.later[i].t <= 0) {
      const fn = M3.later[i].fn;
      M3.later.splice(i, 1);
      fn();
    }
  }
  const age = <T extends { t: number; dur: number }>(list: T[], gone?: (x: T) => void): void => {
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].t += dt;
      if (list[i].t >= list[i].dur) {
        const x = list[i];
        list.splice(i, 1);
        gone?.(x);
      }
    }
  };
  age(M3.bolts);
  age(M3.skies);
  age(M3.scars);
  age(M3.columns);
  age(M3.clamps);
  age(M3.slides);
  age(M3.bombs, (b) => {
    // it lands: a lava bomb splashes and burns; a hailstone cracks
    if (b.word === 'eruption') {
      const C = MELD_RAMP.eruption;
      fx.flames(b.x1, b.y1, 0.15, 3, 1);
      fling(fx, b.x1, b.y1, 5, [C[5], C[4], C[3]], { speed: 1.6, up: 60, grav: 380, life: 0.4, z: 2, size: 2 });
      ring(fx, b.x1, b.y1, 0.35, 0.18, [C[5], C[4], C[3]]);
    } else if (Math.random() < 0.5) fling(fx, b.x1, b.y1, 2, ['#ffffff', MELD_RAMP.hailstorm[4]], { speed: 1.2, up: 50, grav: 400, life: 0.25, z: 1, size: 1 });
  });
  if (M3.flash.t < 9) M3.flash.t += dt;
  // (a pool of lava or a burning patch is its own fire: the scorch the hit's flame leaves on the floor
  // is drawn over the floor's patches, so none is kept under one, where it would dull it)
  for (const z of game.zones) {
    const look = lookOf(z);
    if (look !== 'molten' && look !== 'wildfire' && look !== 'smoulder') continue;
    for (let i = fx.decals.length - 1; i >= 0; i--) {
      const d = fx.decals[i];
      if (d.kind === 'scorch' && Math.hypot(d.x - z.x, d.y - z.y) < z.r * 0.8) fx.decals.splice(i, 1);
    }
  }
  for (const [id, k] of M3.marks) {
    if (k.thunder > 0) {
      k.thunder -= dt;
      k.thunder0 += dt;
    }
    k.crush += dt;
    const m = game.monsters.find((q) => q.id === id);
    if (!m || m.dead) M3.marks.delete(id);
  }
  // the hero's meters, as the rules hold them
  const h = game.hero;
  let heat = 0;
  let claps = -1;
  for (let i = 0; i < h.skills.length; i++) {
    const r = h.skills[i]?.r;
    if (!r) continue;
    if (r.meldBehind === 'eruption') heat = Math.max(heat, game.meldHeat[i] ?? 0);
    if (r.meldBehind === 'thunder') claps = Math.max(claps, game.meldHits[i] ?? 0);
  }
  M3.heat = heat;
  M3.claps = claps;
  M3.hidden = game.zones.some((z) => z.kind === 'steam' && !z.hostile && Math.hypot(h.x - z.x, h.y - z.y) <= z.r);
  const room = fx.room();
  // at full heat the hero smokes, and sparks fly up off their feet
  if (M3.heat >= M3.heatFull && Math.random() < 14 * dt * room) {
    const C = MELD_RAMP.eruption;
    add(fx, { x: h.x + rnd(-0.3, 0.3), y: h.y + rnd(-0.3, 0.3), z: rnd(0, 4), vx: 0, vy: 0, vz: rnd(30, 60), life: 0.5, life0: 0.5, ramp: [C[5], C[4], C[3], '#4a3a36'], color: C[4], size: 1, grav: -10 });
  }
  // what the patches do all the time
  for (const z of game.zones) {
    const look = lookOf(z);
    if (!look) continue;
    const r = z.r;
    const at = (): [number, number] => {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(Math.random()) * r * 0.85;
      return [z.x + Math.cos(a) * d, z.y + Math.sin(a) * d];
    };
    const rate = (n: number): boolean => Math.random() < n * dt * room * Math.min(1.6, 0.5 + r * 0.6);
    if (look === 'molten') {
      if (rate(3)) {
        const [x, y] = at();
        const C = MELD_RAMP.eruption;
        add(fx, { x, y, z: 1, vx: rnd(-0.4, 0.4), vy: rnd(-0.4, 0.4), vz: rnd(40, 80), life: 0.45, life0: 0.45, ramp: [C[5], C[4], C[3], C[1]], color: C[4], size: 2, grav: 300 });
      }
      if (rate(1.2)) {
        const [x, y] = at();
        puffs(fx, x, y, 0.1, 1, ['#6a5048', '#4a3a36', '#2a2220'], { up: 22, z: 4, life: 1.0 });
      }
    } else if (look === 'wildfire') {
      if (rate(3)) {
        const [x, y] = at();
        fx.flames(x, y, 0.1, 1, 1.1);
      }
      if (rate(2.4)) {
        const [x0, y0] = at();
        const [x1, y1] = at();
        bolt(x0, y0, x1, y1, MELD_RAMP.wildfire, { w: 1, dur: 0.14, kind: 'fire', z: 4, wob: 0.15 });
      }
    } else if (look === 'smoulder') {
      if (rate(2)) {
        const [x, y] = at();
        const C = MELD_RAMP.fumes;
        puffs(fx, x, y, 0.05, 1, [C[2], C[1], '#2a2418', '#1a160e'], { up: 24, z: 2, life: 1.2 });
      }
    } else if (look === 'boil') {
      // geysers: a jet of steam bursting up out of it now and then
      if (rate(1.1)) {
        const [x, y] = at();
        const C = MELD_RAMP.scald;
        M3.columns.push({ x, y, t: 0, dur: 0.32, h: 34, w: 2, word: 'scald' });
        puffs(fx, x, y, 0.1, 4, [C[5], C[4], C[3]], { up: 80, z: 4, life: 0.7, drift: 0.3 });
        fling(fx, x, y, 4, ['#ffffff', C[4]], { speed: 1.2, up: 120, grav: 420, life: 0.5, z: 20, size: 1 });
      }
    } else if (look === 'snow') {
      // powder blown across it
      if (rate(4)) {
        const [x, y] = at();
        const C = MELD_RAMP.avalanche;
        add(fx, { x, y, z: rnd(1, 6), vx: 1.4, vy: -0.4, vz: rnd(-2, 4), life: 0.6, color: pick([C[5], C[4]]), size: 1, grav: 0 });
      }
    } else if (look === 'toxicice' || look === 'coldmist') {
      if (rate(1.5)) {
        const [x, y] = at();
        const C = MELD_RAMP.frostbite;
        add(fx, { x, y, z: rnd(2, 8), vx: 0, vy: 0, vz: rnd(4, 10), life: 0.8, color: pick([C[5], '#b4cc24', C[4]]), size: 1, grav: 0 });
      }
    } else if (look === 'rot' || look === 'fumes' || look === 'crackle') {
      if (rate(1.5)) {
        const [x, y] = at();
        if (look === 'crackle') spores(fx, x, y, 0.1, 1);
        else {
          const C = MELD_RAMP[look === 'rot' ? 'blight' : 'fumes'];
          const life = rnd(0.5, 0.9);
          add(fx, { x, y, z: rnd(1, 6), vx: rnd(-0.2, 0.2), vy: rnd(-0.2, 0.2), vz: rnd(8, 18), life, life0: life, ramp: [C[4], C[3], C[3], C[2]], color: C[3], size: Math.random() < 0.35 ? 3 : 2, grav: -6 });
        }
      }
    }
  }
  // the melded shots' trails
  const k = Math.min(1, 60 * dt) * room;
  for (const q of game.projectiles) {
    if (q.hostile) continue;
    const r = h.skills[q.skill]?.r;
    if (!r || !r.meld) continue;
    trailLook(r.meld, fx, q.x, q.y, q.vx, q.vy, k);
  }
  // Frostbite's bite: every half second the jaws close again on each chilled one it holds
  const step = Math.floor(game.time * 2);
  for (const m of game.monsters) {
    if (m.dead || !m.biteDps || !(m.chillT > 0 || m.frozenT > 0)) continue;
    const mk = markOf(m.id);
    if (mk.bite === step) continue;
    mk.bite = step;
    M3.clamps.push({ id: m.id, t: 0, dur: 0.24, big: false });
    if (room > 0.3) {
      fling(fx, m.x, m.y, 3, ['#b4cc24', '#7c9416'], { speed: 0.8, up: 10, grav: 300, life: 0.4, z: 12, size: 1 });
      puffs(fx, m.x, m.y, 0.2, 2, ['#cfe8e8', '#9ad0c0', '#6aa890'], { up: 8, z: 10, life: 0.6 });
    }
  }
  // Blight's rot: spores and ash off what it rots, the more the lower its life
  for (const m of game.monsters) {
    if (m.dead) continue;
    const mk = M3.marks.get(m.id);
    if (!mk || !mk.blight || m.poisonT <= 0) continue;
    const lost = 1 - Math.max(0, m.life) / Math.max(1, m.maxLife);
    if (Math.random() < (2 + lost * 10) * dt * room) {
      const C = MELD_RAMP.blight;
      add(fx, { x: m.x + rnd(-0.25, 0.25), y: m.y + rnd(-0.25, 0.25), z: rnd(6, 20), vx: rnd(-0.2, 0.2), vy: rnd(-0.2, 0.2), vz: rnd(6, 16), life: 0.9, life0: 0.9, ramp: [C[4], C[3], C[2], C[1]], color: C[3], size: 1, grav: -2 });
    }
  }
}

/** The looks, called up by what the rules say happened this frame (main.ts, while MELD3.on, before the effects take the same events). */
export function eventsM3(events: readonly GameEvent[], game: Game, fx: Fx): void {
  if (!MELD3.on) return;
  const zoneAt = (x: number, y: number): boolean => game.zones.some((z) => Math.abs(z.x - x) < 0.01 && Math.abs(z.y - y) < 0.01);
  for (const e of events) {
    if (e.t === 'hit' && !e.onHero && !e.poison) {
      for (const w of meldsIn(e.words)) hitLook(w, fx, game, e.x, e.y, 0.8, false);
    } else if (e.t === 'burst') {
      if (e.meld) {
        if (e.meld === 'scald') scaldCrack(fx, e.x, e.y, e.r);
        else if (e.meld === 'eruption') eruptionBlast(fx, e.x, e.y, e.r);
        else if (e.meld === 'thunder') thunderClap(fx, e.x, e.y, e.r);
        else if (e.meld === 'fumes') fumesBlast(fx, e.x, e.y, e.r);
        continue;
      }
      // an area ability carrying a melded word: its look over the whole blast (a whirlwind's turns, small)
      for (const w of meldsIn(e.words)) {
        if (e.echo) continue;
        // (a hit's own splash, 'blast' or 'shock', is the hit's: its look is already on the hit)
        if (e.style === 'whirl') hitLook(w, fx, game, e.x + rnd(-0.5, 0.5) * e.r, e.y + rnd(-0.5, 0.5) * e.r, 0.6, false);
        else if (e.style === 'slam' || e.style === 'nova' || e.style === 'land') hitLook(w, fx, game, e.x, e.y, e.r, true);
      }
    } else if (e.t === 'arc' && e.meld) {
      arcLook(e.meld, fx, e, zoneAt(e.x0, e.y0));
    } else if (e.t === 'zone' && e.meld) {
      const look = lookOfKind(e.meld, e.kind, 'zone');
      if (look && look !== true) laidLook(look, fx, e.x, e.y, e.r);
    } else if (e.t === 'stun' && e.meld === 'thunder') {
      const k = markOf(e.id);
      if (k.thunder <= 0) k.thunder0 = 0;
      k.thunder = Math.max(k.thunder, e.secs);
    } else if (e.t === 'meldFx') {
      if (e.what === 'shove') shoved(fx, e);
      else crushed(fx, e);
    } else if (e.t === 'swing' && !e.echo && (e.n ?? 0) === 0) {
      for (const w of meldsIn(e.words)) carryLook(w, fx, e.x + e.dx * e.reach * 0.8, e.y + e.dy * e.reach * 0.8, e.dx, e.dy);
    } else if (e.t === 'cast' && !e.echo) {
      for (const w of meldsIn(e.words)) carryLook(w, fx, e.x + e.dx * 0.5, e.y + e.dy * 0.5, e.dx, e.dy);
    } else if (e.t === 'text' && e.text === 'HEAT') {
      // full heat: the hero's feet flare
      const C = MELD_RAMP.eruption;
      ring(fx, e.x, e.y, 0.9, 0.3, [C[5], C[4], C[3]], { closing: true, heavy: true });
      fling(fx, e.x, e.y, 10, [C[5], C[4]], { speed: 1.5, up: 90, grav: 100, life: 0.5, z: 2, size: 1 });
    }
  }
}

/** The playtest's hands: `window.__dbg.melds3` (main.ts). Nothing here runs unless a playtest calls it. */
export function demoM3(fx: Fx, getGame: () => Game | null, paint: () => void) {
  return {
    switch: MELD3,
    state: M3,
    clear: clearM3,
    /** The melded words' colours and runes as drawn here, in place of the placeholders (for this page only). */
    paint,
    /** A word's hit at (x, y), as if it had struck there (`big`: an area ability's, out to `r`). */
    hit: (word: MeldId, x: number, y: number, r = 1.4, big = false) => {
      const g = getGame();
      if (g) hitLook(word, fx, g, x, y, r, big);
    },
  };
}
