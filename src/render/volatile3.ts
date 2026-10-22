// THE FIVE VOLATILE MELDS AT WORK: how Demolition, Powderkeg, Shatter, Chain Reaction and Rupture
// LOOK. A mock-up of the art chat's, behind VOLATILE3, which is off: with it off nothing here is
// drawn or called, and the game is as it was.
//
// His words to the main chat, 21 Oct 2026 (Pacific): 19:29, “Can you also add the volatile melds”;
// 19:30, “We have info on them but I’d like them to be in the game”. To the art chat, 19:31: “I’ll
// need animations for the volatile melds I’m adding to the damage melds”. Read as: the five melds of
// Volatile on his page "Wordsmith: Word Combinations" (left out on 13 Oct by his pick “Only damage
// words meld”), each with a rune stone and a colour of its own and its look at work, in front and
// behind, drawn as the other ten are (render/melds3.ts: a ramp and a glyph for each word, the looks
// called up by what the rules say happened), big and wild by his art rulebook (Animations 1: “as big
// and wild and kinetic and weighty as possible”). Their rules are the main chat's. Shown their stones,
// colours and a film of each, by 20:35: “Yes, send to main (Recommended)”.
//
// What each does, as his page has them:
//   DEMOLITION (Power + Volatile): bigger explosions; elites and bosses also explode once, at half
//     life. Behind: one huge rune, slow to go off.
//   POWDERKEG (Flame + Volatile): burning enemies explode when killed, and the blast sets others
//     burning. Behind: the rune leaves burning ground when it goes off.
//   SHATTER (Frost + Volatile): frozen enemies burst into shards that hit those around them. Behind:
//     the rune freezes what is near, then bursts.
//   CHAIN REACTION (Lightning + Volatile): an exploding enemy sends arcs to the nearest enemies; those
//     it kills explode too. Behind: runes are linked; one going off sets off the rest.
//   RUPTURE (Poison + Volatile): poisoned enemies burst when killed, splashing their poison on those
//     around. Behind: the rune bursts into a poison cloud.
//
// Everything here takes only where, how big and how far along: no game rules. HOW THE RULES CALL IT
// (eventsV3, from main.ts with the frame's events, while VOLATILE3.on):
//   - a kill's explosion: a 'burst' (style 'blast') with `meld` one of the five;
//   - a rune going off: a 'burst' (style 'ruin') with `meld`;
//   - a rune or a patch laid: a 'zone' with `meld` (the zone itself carrying `meld` or `look`, so that
//     floorV3 and airV3 draw it, and render.ts leaves it to them: ownsZoneV3);
//   - the moments of their own, a 'volFx' (VolFx below): Demolition's half-life blast, Powderkeg's
//     catch, Shatter's shards and its rune's freeze, Chain Reaction's arcs and its runes' links,
//     Rupture's splash;
//   - a hit carrying one of them: the 'hit' event's `words` (hitV3), as the ten.

import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import { P } from '../art/palette';
import { Px } from '../engine/px';
import type { Sprite } from '../engine/px';
import { hash2 } from '../engine/rng';
import type { Game } from '../game/game';
import type { Monster, Zone } from '../game/state';
import type { Cam, Fx } from './fx';

/** The switch. Off: nothing here is drawn or called, and the game is as it was. */
export const VOLATILE3 = { on: false };

/** The five, in the order of his page. (The main chat's ids for them are its own; these are the looks'.) */
export const VMELD_IDS = ['demolition', 'powderkeg', 'shatter', 'chainreaction', 'rupture'] as const;
export type VMeldId = (typeof VMELD_IDS)[number];
export const isVMeld = (w: unknown): w is VMeldId => typeof w === 'string' && (VMELD_IDS as readonly string[]).includes(w);

export const VMELD_NAME: Record<VMeldId, string> = { demolition: 'Demolition', powderkeg: 'Powderkeg', shatter: 'Shatter', chainreaction: 'Chain Reaction', rupture: 'Rupture' };
/** Each one's two words, as his page names them. */
export const VMELD_OF: Record<VMeldId, readonly [string, string]> = {
  demolition: ['power', 'volatile'],
  powderkeg: ['fire', 'volatile'],
  shatter: ['frost', 'volatile'],
  chainreaction: ['lightning', 'volatile'],
  rupture: ['poison', 'volatile'],
};

/**
 * Each one's colours, darkest to brightest (the last its white-hot). Index 3 is the word's own colour,
 * index 4 its glow, as MELD_RAMP's are. Each looks like its two words, and is told apart from every
 * other word (the city's four among them), the ten melds, Binding, the friend's cyan and the enemy's
 * pink and gold: the nearest any of the five comes to another colour, as the eye sees colour
 * (CIEDE2000), is 12.9 (Powderkeg and Power; Rupture and Volatile). Shatter and Chain Reaction were
 * given new colours on 21 Oct (Pacific), once the city's words were in the game, his yes by 00:14, 22 Oct:
 * “Yes, send to main (Recommended)”. Shatter's nearest is now 13.5 (Pulling), Chain Reaction's 15.4
 * (Thunder; the enemy's pink is 20.4 from it).
 */
export const VMELD_RAMP: Record<VMeldId, readonly string[]> = {
  // rubble and blast dust, white-hot at its heart
  demolition: ['#120c16', '#2c2232', '#5a4a64', '#a08ab4', '#e2d6f0', '#ffffff'],
  // black powder, its ember, its flame
  powderkeg: ['#140806', '#3a1410', '#6e2418', '#a83c28', '#ff9a50', '#fff0b0'],
  // sapphire ice, deep blue, splintering white (21 Oct: was ice gone violet, #7c7cf0, too near Pulling)
  shatter: ['#060a2c', '#0e1c70', '#1838c0', '#2054fc', '#9cbcff', '#ffffff'],
  // Volatile's violet charged white-hot: magenta bolts, violet-white sparks (21 Oct: was lilac,
  // #e8b8ff, too near Splitting; its sparks no longer yellow, so that nothing of it burns pink to gold)
  chainreaction: ['#200420', '#540a56', '#a808aa', '#fc00f8', '#f4d4ff', '#ffffff'],
  // a plum skin, the bile-green poison inside it
  rupture: ['#160818', '#3c1440', '#6c2a68', '#9c4890', '#d4ec7a', '#f6ffd0'],
};
export const VMELD_COLOR = Object.fromEntries(VMELD_IDS.map((w) => [w, VMELD_RAMP[w][3]])) as Record<VMeldId, string>;
export const VMELD_GLOW = Object.fromEntries(VMELD_IDS.map((w) => [w, VMELD_RAMP[w][4]])) as Record<VMeldId, string>;

/**
 * Their glyphs, cut in the rune stone as the others are (art/icons.ts, GLYPH; render/melds3.ts,
 * MELD_GLYPH): 7x7, 'X' the word's colour, 'o' its glowing core.
 */
export const VMELD_GLYPH: Record<VMeldId, readonly string[]> = {
  // a wall blown through
  demolition: ['XXX.XXX', '.......', 'XX.o.XX', '..ooo..', 'XX.o.XX', '.......', 'XXX.XXX'],
  // a keg, its fuse lit
  powderkeg: ['.....oo', '....Xo.', '.XXXX..', 'X....X.', 'XXXXXX.', 'X....X.', '.XXXX..'],
  // a crystal of ice split open, its pieces flying
  shatter: ['o..X...', '..XXX..', '.XoX.X.', 'XXX.XXX', '.X.XoX.', '..XXX..', '...X..o'],
  // three bursts, the bolts between them
  chainreaction: ['oo.....', 'ooXX...', '...XX..', '....Xoo', '...XXoo', '..XX...', 'oo.....'],
  // a sac of poison burst open, its spray flying up
  rupture: ['o..o..o', '.o.o.o.', '.X...X.', 'X.....X', 'XoooooX', 'XoooooX', '.XXXXX.'],
};

/** What each glyph is, for the pictures' labels. */
export const VMELD_GLYPH_IS: Record<VMeldId, string> = {
  demolition: 'a wall blown through',
  powderkeg: 'a keg, its fuse lit',
  shatter: 'a crystal of ice split open, its pieces flying',
  chainreaction: 'three bursts, the bolts between them',
  rupture: 'a sac of poison burst open, its spray flying up',
};

/**
 * How long each one's rune waits before it goes off, as the pictures want it (the rules' own, the
 * main chat's: Volatile's rune waits 1.2 s). Demolition's is slow, as his page says; Shatter's
 * freezes what is near at `freezeAt` of its wait, then bursts; Chain Reaction's linked runes go off
 * one after another, `linkGap` apart.
 */
export const VRUNE = { wait: { demolition: 2.4, powderkeg: 1.4, shatter: 1.4, chainreaction: 1.2, rupture: 1.3 } as Record<VMeldId, number>, freezeAt: 0.4, linkGap: 0.12, linkReach: 6 };

/** The rune stone of one of the five, as the others are cut (art/icons.ts, runeSprite): its two words' colours along its foot. */
export function vmeldRune(word: VMeldId, partColor: (w: string) => string): Sprite {
  const rows = [
    '............',
    '..11111111..',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '.1222222223.',
    '..33333333..',
    '............',
  ];
  const p = new Px(12, 12);
  const tone: Record<string, string> = { '1': P.st6, '2': P.st5, '3': P.st3 };
  rows.forEach((row, y) => [...row].forEach((ch, x) => tone[ch] && p.set(x, y, tone[ch])));
  const g = VMELD_GLYPH[word];
  const on = (gx: number, gy: number): boolean => gy >= 0 && gy < 7 && gx >= 0 && gx < 7 && g[gy].charAt(gx) !== '.';
  for (let gy = 0; gy < 7; gy++) {
    for (let gx = 0; gx < 7; gx++) {
      if (!on(gx, gy)) continue;
      if (!on(gx, gy - 1)) p.set(3 + gx, 2 + gy, P.st3);
      if (!on(gx - 1, gy)) p.set(2 + gx, 3 + gy, P.st3);
    }
  }
  for (let gy = 0; gy < 7; gy++) for (let gx = 0; gx < 7; gx++) if (on(gx, gy)) p.set(3 + gx, 3 + gy, g[gy].charAt(gx) === 'o' ? VMELD_GLOW[word] : VMELD_COLOR[word]);
  const [a, b] = VMELD_OF[word];
  for (const x of [2, 3, 4]) p.set(x, 10, partColor(a));
  for (const x of [7, 8, 9]) p.set(x, 10, partColor(b));
  return p.outline(P.ink).sprite(6, 10);
}

// =============================================================================================
// What the rules may say (besides 'burst', 'zone' and 'hit', as the ten).

/** The moments of their own: one event kind, `volFx`, `what` saying which. */
export type VolFx =
  /** DEMOLITION: an elite or a boss goes off at half its life (it lives on). */
  | { t: 'volFx'; meld: VMeldId; what: 'half'; id: number; x: number; y: number; r: number }
  /** POWDERKEG: the blast at (x0, y0) sets monster `id` at (x1, y1) burning. */
  | { t: 'volFx'; meld: VMeldId; what: 'catch'; id: number; x0: number; y0: number; x1: number; y1: number }
  /** SHATTER: a shard from the one burst at (x0, y0) strikes monster `id` at (x1, y1). */
  | { t: 'volFx'; meld: VMeldId; what: 'shard'; id: number; x0: number; y0: number; x1: number; y1: number }
  /** SHATTER behind: the rune at (x, y) freezes what is within `r` (monsters `ids`). */
  | { t: 'volFx'; meld: VMeldId; what: 'freeze'; x: number; y: number; r: number; ids: readonly number[] }
  /** CHAIN REACTION: an arc from the explosion at (x0, y0) to monster `id` at (x1, y1). */
  | { t: 'volFx'; meld: VMeldId; what: 'arc'; id: number; x0: number; y0: number; x1: number; y1: number }
  /** CHAIN REACTION behind: the rune at (x0, y0), going off, sets off the one at (x1, y1). */
  | { t: 'volFx'; meld: VMeldId; what: 'link'; x0: number; y0: number; x1: number; y1: number }
  /** RUPTURE: the burst at (x0, y0) splashes its poison on monster `id` at (x1, y1). */
  | { t: 'volFx'; meld: VMeldId; what: 'splash'; id: number; x0: number; y0: number; x1: number; y1: number };

/** What eventsV3 reads of the game's own events: a 'burst', a 'zone', a 'hit', a 'die' (only what is used). */
type Seen = { t: string; x?: number; y?: number; r?: number; style?: string; meld?: unknown; words?: readonly unknown[]; onHero?: boolean; poison?: boolean; echo?: boolean; kind?: string };

// =============================================================================================
// What is going on.

/** Something thrown in an arc from (x0, y0) to (x1, y1), `h` pixels high at the top. */
interface Lob {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
  dur: number;
  h: number;
  kind: 'rubble' | 'ember' | 'glob' | 'shard';
  /** Its turn as it tumbles (rubble), its size. */
  spin: number;
  size: number;
  word: VMeldId;
  /** On landing, the look the rules asked for (a catch, a splash), at the one it strikes. */
  hit?: () => void;
}

/** A blast's dome of light, a fireball, a wet pop: swelling from (x, y) over `dur`. */
interface Dome {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  kind: 'blast' | 'fireball' | 'pop' | 'storm';
  word: VMeldId;
  /** Pixels it rises as it goes (a fireball). */
  rise: number;
}

/** A bolt along the ground, growing from its first point to its last over `grow`, then flickering. */
interface Arc {
  pts: number[];
  t: number;
  dur: number;
  grow: number;
  w: number;
  z: number;
  C: readonly string[];
  /** Small forks off it: from point `at` (an index into pts / 2), its own points. */
  forks: { at: number; pts: number[] }[];
}

/** A line lying along the floor out from (x, y): a spear of ice from a burst, growing out then breaking. */
interface Spear {
  x: number;
  y: number;
  dx: number;
  dy: number;
  len: number;
  t: number;
  dur: number;
  word: VMeldId;
}

/** Ice standing up out of the floor (Shatter's rune going off): it shoots up, stands, and breaks. */
interface Spike {
  x: number;
  y: number;
  tall: number;
  w: number;
  t: number;
  dur: number;
}

/** A mark on the floor: a crater (Demolition), a scorch (Powderkeg), a star of frost (Shatter), a burnt star (Chain Reaction), a splat of poison (Rupture). */
interface Scar {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  kind: 'crater' | 'scorch' | 'frost' | 'star' | 'splat';
  seed: number;
  lines: number[][];
  word: VMeldId;
}

/** A shake of one monster's picture (a blast going off by it): away from (fx, fy), dying back. */
interface Jolt {
  id: number;
  dx: number;
  dy: number;
  t: number;
  dur: number;
  px: number;
}

/** What one of the five has done to one monster: lit white for a moment, crackling. */
interface Mark {
  white: number;
  crackle: number;
}

export const V3 = {
  clock: 0,
  later: [] as { t: number; fn: () => void }[],
  lobs: [] as Lob[],
  domes: [] as Dome[],
  arcs: [] as Arc[],
  spears: [] as Spear[],
  spikes: [] as Spike[],
  scars: [] as Scar[],
  jolts: [] as Jolt[],
  marks: new Map<number, Mark>(),
  /** Light thrown up for a moment (a pillar off a rune going off): x, y, how wide, seconds since, how long. */
  pillars: [] as { x: number; y: number; w: number; t: number; dur: number; word: VMeldId }[],
  /** Shatter's rune: the ice it has laid on the floor, swept out from its middle. */
  freezes: [] as { x: number; y: number; r: number; t: number; dur: number; seed: number }[],
  flash: { t: 9, dur: 0.1, color: '#ffffff', a: 0 },
  /** The playtest's own runes (no rules lay them yet): each zone's own wait, in place of its `dur`. */
  waits: new Map<Zone, number>(),
  /**
   * The playtest's hands (no rules for the five yet): the word its hero's hits carry, for their look;
   * the monsters that go off as that word's kills when they die; and whether its runes do as the
   * rules will (go off when their time is up, and what then follows). Nothing sets these but demoV3.
   */
  demo: { carry: null as VMeldId | null, primed: new Map<number, VMeldId>(), runes: false, frozen: new Set<Zone>() },
};

const MAX_PARTICLES = 900;
const rnd = (a: number, b: number): number => a + Math.random() * (b - a);
const pick = (list: readonly string[]): string => list[Math.floor(Math.random() * list.length)];
const smooth = (q: number): number => q * q * (3 - 2 * q);
const easeOut = (q: number): number => 1 - (1 - q) * (1 - q) * (1 - q);
const TAU = Math.PI * 2;

function markOf(id: number): Mark {
  let m = V3.marks.get(id);
  if (!m) {
    m = { white: 9, crackle: 0 };
    V3.marks.set(id, m);
  }
  return m;
}

/** Forget everything (a new level, or the page starts again). */
export function clearV3(): void {
  V3.later.length = 0;
  V3.lobs.length = 0;
  V3.domes.length = 0;
  V3.arcs.length = 0;
  V3.spears.length = 0;
  V3.spikes.length = 0;
  V3.scars.length = 0;
  V3.jolts.length = 0;
  V3.pillars.length = 0;
  V3.freezes.length = 0;
  V3.marks.clear();
  V3.waits.clear();
  V3.demo.primed.clear();
  V3.demo.frozen.clear();
  V3.flash.t = 9;
}

// =============================================================================================
// Bits the looks are made of (fx.ts and melds3.ts have the same: copied, so that nothing leans on this file).

const wx = (c: Cam, x: number, y: number): number => c.ox + (x - y) * 16;
const wy = (c: Cam, x: number, y: number): number => c.oy + (x + y) * 8 - (c.lift ? c.lift(x, y) : 0);

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
  for (let n = 0; n < 600; n++) {
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

function thick(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, w: number): void {
  for (let i = 0; i < w; i++) {
    const o = i - Math.floor((w - 1) / 2);
    pline(g, x0 + o, y0, x1 + o, y1, color);
  }
}

/** A flat ellipse on the floor, r in tiles (squash < 1: flatter). */
function ellipse(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number, squash = 1): void {
  if (alpha <= 0 || r <= 0) return;
  oval(g, cx, cy, Math.max(1, r * 22.6), Math.max(1, r * 11.3 * squash), color, alpha);
}

/**
 * A filled oval, crisp (a row of whole pixels at a time, no smoothing), `rx` by `ry` screen pixels.
 * `rag`: pixels its edge is torn by, row by row (a blast's ragged edge); `hole`: the part of it, 0 to
 * 1, cut out of its middle (a shell of light, hollowing out as it goes).
 */
function oval(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string, alpha = 1, rag = 0, seed = 0, hole = 0): void {
  if (alpha <= 0 || rx < 0.5 || ry < 0.5) return;
  g.globalAlpha = Math.min(1, alpha);
  g.fillStyle = color;
  const x0 = Math.round(cx);
  const y0 = Math.round(cy);
  const h = Math.ceil(ry);
  for (let dy = -h; dy <= h; dy++) {
    const q = dy / ry;
    if (q * q > 1) continue;
    const torn = rag ? (hash2(seed, dy + 999, 5) - 0.5) * 2 * rag : 0;
    const half = Math.round(rx * Math.sqrt(1 - q * q) + torn);
    if (half < 0) continue;
    const ih = hole > 0 && (q / hole) * (q / hole) < 1 ? Math.round(rx * hole * Math.sqrt(1 - (q / hole) * (q / hole)) + (rag ? (hash2(seed, dy + 333, 6) - 0.5) * rag : 0)) : -1;
    if (ih < 0) g.fillRect(x0 - half, y0 + dy, half * 2 + 1, 1);
    else if (ih < half) {
      g.fillRect(x0 - half, y0 + dy, half - ih, 1);
      g.fillRect(x0 + ih + 1, y0 + dy, half - ih, 1);
    }
  }
  g.globalAlpha = 1;
}

/** Dots round a ring of radius r tiles on the floor. */
function rim(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, gap = 2, from = 0, sweep = TAU, size = 1): void {
  const n = Math.max(8, Math.round((r * 22.6 * TAU) / (gap + 1)));
  g.fillStyle = color;
  for (let i = 0; i <= n * (sweep / TAU); i++) {
    const a = from + (i / n) * TAU;
    g.fillRect(Math.round(cx + Math.cos(a) * r * 22.6), Math.round(cy + Math.sin(a) * r * 11.3), size, size);
  }
}

/** A point on the floor at angle a, radius r tiles, from a screen centre. */
const onFloor = (cx: number, cy: number, a: number, r: number): [number, number] => [cx + Math.cos(a) * r * 22.6, cy + Math.sin(a) * r * 11.3];

type P3 = Fx['particles'][number];
function add(fx: Fx, p: P3): void {
  if (fx.particles.length < MAX_PARTICLES) fx.particles.push(p);
}

/** Things flung out from (x, y): along (dx, dy) if given, otherwise all round. */
function fling(fx: Fx, x: number, y: number, n: number, colors: readonly string[], o: { speed: number; up?: number; grav?: number; life?: number; z?: number; size?: number; r?: number; dx?: number; dy?: number; spread?: number; streak?: number; ramp?: readonly string[] }): void {
  const base = o.dx !== undefined && o.dy !== undefined ? Math.atan2(o.dy, o.dx) : null;
  for (let i = 0; i < n; i++) {
    const a = base === null ? Math.random() * TAU : base + rnd(-1, 1) * (o.spread ?? 0.5);
    const s = rnd(0.45, 1) * o.speed;
    const d = rnd(0, o.r ?? 0.15);
    const life = rnd(0.6, 1) * (o.life ?? 0.5);
    add(fx, {
      x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: (o.z ?? 8) + rnd(-2, 2), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(0.5, 1) * (o.up ?? 0),
      life, life0: o.ramp ? life : undefined, ramp: o.ramp, color: pick(colors), size: o.size ?? (Math.random() < 0.35 ? 2 : 1), grav: o.grav ?? 0, streak: o.streak,
    });
  }
}

/** Soft puffs that rise and darken (dust, smoke, gas), from (x, y) within `r`; `out` pushes them outward from the middle. */
function puffs(fx: Fx, x: number, y: number, r: number, n: number, ramp: readonly string[], o: { up?: number; z?: number; life?: number; drift?: number; out?: number; size?: number } = {}): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const d = Math.sqrt(Math.random()) * r;
    const life = rnd(0.7, 1.2) * (o.life ?? 0.9);
    const out = (o.out ?? 0) * rnd(0.6, 1.1);
    add(fx, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, z: (o.z ?? 4) + rnd(0, 6), vx: Math.cos(a) * out + rnd(-1, 1) * (o.drift ?? 0.3), vy: Math.sin(a) * out + rnd(-1, 1) * (o.drift ?? 0.3), vz: rnd(0.5, 1) * (o.up ?? 26), life, life0: life, ramp, color: ramp[0], size: o.size ?? 3, grav: -4 });
  }
}

function ring(fx: Fx, x: number, y: number, r: number, dur: number, colors: readonly string[], o: { fill?: boolean; heavy?: boolean; closing?: boolean; jag?: boolean; delay?: number; double?: boolean } = {}): void {
  fx.rings.push({ x, y, r, t: 0, dur, colors, fill: !!o.fill, heavy: o.heavy, closing: o.closing, jag: o.jag, delay: o.delay, double: o.double });
}

function flash(fx: Fx, x: number, y: number, z: number, r: number, dur: number, colors: readonly string[]): void {
  fx.flashes.push({ x, y, z, r, t: 0, dur, colors });
}

function glow(fx: Fx, x: number, y: number, r: number, dur: number): void {
  if (fx.glows.length < 24) fx.glows.push({ x, y, r, t: 0, dur });
}

function later(t: number, fn: () => void): void {
  V3.later.push({ t, fn });
}

/** The whole screen lit for an instant. */
function screenFlash(color: string, a: number, dur = 0.09): void {
  if (V3.flash.t < V3.flash.dur && V3.flash.a > a) return;
  V3.flash = { t: 0, dur, color, a };
}

/** A jagged way from (x0, y0) to (x1, y1), world points. */
function jagged(x0: number, y0: number, x1: number, y1: number, wob = 0.3): number[] {
  const pts: number[] = [x0, y0];
  const segs = Math.max(3, Math.min(10, Math.round(Math.hypot(x1 - x0, y1 - y0) * 2.2)));
  for (let i = 1; i < segs; i++) {
    const k = i / segs;
    pts.push(x0 + (x1 - x0) * k + rnd(-wob, wob), y0 + (y1 - y0) * k + rnd(-wob, wob));
  }
  pts.push(x1, y1);
  return pts;
}

/** A bolt along the ground from (x0, y0) to (x1, y1), growing out along it over `grow` seconds. */
function arc(x0: number, y0: number, x1: number, y1: number, C: readonly string[], o: { w?: number; dur?: number; grow?: number; wob?: number; z?: number; forks?: number } = {}): void {
  const pts = jagged(x0, y0, x1, y1, o.wob ?? 0.3);
  const forks: Arc['forks'] = [];
  const n = pts.length / 2;
  for (let f = 0; f < (o.forks ?? 0); f++) {
    const at = 1 + Math.floor(Math.random() * Math.max(1, n - 2));
    const a = Math.atan2(y1 - y0, x1 - x0) + (Math.random() < 0.5 ? -1 : 1) * rnd(0.6, 1.3);
    const len = rnd(0.4, 0.9);
    forks.push({ at, pts: jagged(pts[at * 2], pts[at * 2 + 1], pts[at * 2] + Math.cos(a) * len, pts[at * 2 + 1] + Math.sin(a) * len, 0.12) });
  }
  V3.arcs.push({ pts, t: 0, dur: o.dur ?? 0.22, grow: o.grow ?? 0, w: o.w ?? 1, z: o.z ?? 10, C, forks });
  if (V3.arcs.length > 60) V3.arcs.shift();
}

function lob(word: VMeldId, kind: Lob['kind'], x0: number, y0: number, x1: number, y1: number, dur: number, h: number, size: number, hit?: () => void, delay = 0): void {
  V3.lobs.push({ x0, y0, x1, y1, t: -delay, dur, h, kind, spin: Math.random() * 4, size, word, hit });
  if (V3.lobs.length > 120) V3.lobs.shift();
}

function scar(word: VMeldId, kind: Scar['kind'], x: number, y: number, r: number, dur: number, n = 7): Scar {
  const seed = Math.floor(Math.random() * 1e6);
  const lines: number[][] = [];
  const a0 = Math.random() * TAU;
  for (let k = 0; k < n; k++) {
    const a = a0 + (k / n) * TAU + (hash2(seed, k, 1) - 0.5) * 0.6;
    const len = r * (0.6 + hash2(seed, k, 2) * 0.5);
    const pts = [Math.cos(a) * r * 0.1, Math.sin(a) * r * 0.1];
    for (let i = 1; i <= 3; i++) {
      const d = (len * i) / 3;
      const j = (hash2(seed, k * 4 + i, 3) - 0.5) * r * 0.25;
      pts.push(Math.cos(a) * d - Math.sin(a) * j, Math.sin(a) * d + Math.cos(a) * j);
    }
    lines.push(pts);
  }
  const s: Scar = { x, y, r, t: 0, dur, kind, seed, lines, word };
  V3.scars.push(s);
  if (V3.scars.length > 40) V3.scars.shift();
  return s;
}

/** Every monster within `r` of (x, y) jolts away from it, its picture only. */
function joltRound(game: Game, x: number, y: number, r: number, px: number): void {
  for (const m of game.monsters) {
    if (m.dead) continue;
    const d = Math.hypot(m.x - x, m.y - y);
    if (d > r || d < 0.05) continue;
    V3.jolts.push({ id: m.id, dx: (m.x - x) / d, dy: (m.y - y) / d, t: 0, dur: 0.32, px: px * (1 - (d / r) * 0.6) });
  }
  if (V3.jolts.length > 40) V3.jolts.splice(0, V3.jolts.length - 40);
}

const VIOLET = [P.white, P.pu5, P.pu4, P.pu3];

/** Volatile's own: violet crackle jumping about the place, popping, and popping again a moment later. */
function crackle(fx: Fx, x: number, y: number, r: number, n: number): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const d = Math.sqrt(Math.random()) * r;
    const b = a + rnd(1.2, 2.6);
    arc(x + Math.cos(a) * d, y + Math.sin(a) * d, x + Math.cos(b) * d * rnd(0.4, 1), y + Math.sin(b) * d * rnd(0.4, 1), VIOLET, { w: 1, dur: 0.12, wob: 0.12, z: rnd(4, 14) });
  }
  fling(fx, x, y, n * 2, [P.white, P.pu5, P.pu4], { speed: 3, up: 30, grav: 60, life: 0.22, z: 10, r: r * 0.8, size: 1, streak: 2 });
}

function popLater(fx: Fx, x: number, y: number, r: number, n: number): void {
  for (let k = 1; k <= n; k++) {
    later(0.08 * k + rnd(0, 0.06), () => {
      const a = Math.random() * TAU;
      const d = Math.sqrt(Math.random()) * r;
      flash(fx, x + Math.cos(a) * d, y + Math.sin(a) * d, 8, 0.25, 0.07, VIOLET);
      crackle(fx, x + Math.cos(a) * d, y + Math.sin(a) * d, 0.25, 1);
    });
  }
}

// =============================================================================================
// DEMOLITION (Power + Volatile): the biggest blast there is. A dome of white light, a shockwave
// rolling out over the floor, flagstones and rubble thrown high and coming down hard, a mushroom of
// dust standing up, red-hot sparks, and a crater left smoking.

function demolitionBlast(fx: Fx, game: Game, x: number, y: number, r: number, scale = 1): void {
  const C = VMELD_RAMP.demolition;
  const big = scale > 1.1;
  fx.hold(big ? 0.13 : 0.09);
  fx.shake = Math.max(fx.shake, big ? 11 : 8);
  screenFlash(C[4], big ? 0.34 : 0.24, big ? 0.12 : 0.09);
  flash(fx, x, y, 10, Math.min(2, r * 0.45), 0.14, [C[5], C[5], C[4], C[3]]);
  V3.domes.push({ x, y, r: r * 0.72, t: 0, dur: big ? 0.42 : 0.34, kind: 'blast', word: 'demolition', rise: 0 });
  // the shockwave: a white ring racing out over the floor, a ring of dust rolling after it
  ring(fx, x, y, r * 1.15, 0.3, [C[5], C[4], C[3], C[2]], { heavy: true });
  ring(fx, x, y, r * 1.45, 0.48, [C[3], C[2], C[1]], { delay: 0.06, heavy: true });
  const rollers = Math.round(14 * scale);
  for (let i = 0; i < rollers; i++) {
    const a = (i / rollers) * TAU + rnd(-0.15, 0.15);
    add(fx, { x: x + Math.cos(a) * r * 0.3, y: y + Math.sin(a) * r * 0.3, z: 2, vx: Math.cos(a) * r * 2.6, vy: Math.sin(a) * r * 2.6, vz: rnd(4, 14), life: 0.6, life0: 0.6, ramp: [C[4], C[3], C[2], C[1]], color: C[3], size: 3, grav: -4 });
  }
  // rubble: flagstones and stones thrown high, tumbling, coming down hard
  const chunks = Math.round(13 * scale);
  for (let i = 0; i < chunks; i++) {
    const a = Math.random() * TAU;
    const d = r * rnd(0.6, 1.5);
    lob('demolition', 'rubble', x, y, x + Math.cos(a) * d, y + Math.sin(a) * d, rnd(0.5, 0.85), rnd(40, 95) * Math.sqrt(scale), Math.random() < 0.4 ? 3 : 2, undefined, rnd(0, 0.04));
  }
  // grit, and red-hot sparks (Power's red) streaking out
  fling(fx, x, y, Math.round(16 * scale), [C[2], C[1], '#3a2e44'], { speed: 4.5, up: 120, grav: 520, life: 0.7, z: 4, size: 2 });
  fling(fx, x, y, Math.round(20 * scale), [P.white, P.bl5, P.bl4], { speed: 8, up: 50, grav: 160, life: 0.32, z: 10, streak: 4, size: 1 });
  // the violet crackle of Volatile through it, and it pops again
  crackle(fx, x, y, r * 0.7, Math.round(4 * scale));
  popLater(fx, x, y, r * 0.8, big ? 4 : 2);
  // the mushroom of dust standing up off it, the low cloud rolling out
  later(0.08, () => {
    puffs(fx, x, y, 0.35, Math.round(12 * scale), [C[4], C[3], C[3], C[2], C[1]], { up: 70 * Math.sqrt(scale), z: 8, life: 1.5, drift: 0.25, size: 3 });
    puffs(fx, x, y, r * 0.5, Math.round(12 * scale), [C[3], C[2], C[2], C[1]], { up: 8, z: 1, life: 1.2, out: 1.6, drift: 0.2 });
  });
  scar('demolition', 'crater', x, y, r * 0.5 * Math.sqrt(scale), big ? 5 : 3.5, 9);
  joltRound(game, x, y, r * 1.6, big ? 5 : 3.5);
  glow(fx, x, y, 80 + r * 22 * scale, 0.4);
}

/** DEMOLITION's hit: heavy, a thud of dust, a little violet crackle (the blast is for the kill). */
function demolitionHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = VMELD_RAMP.demolition;
  fx.shake = Math.max(fx.shake, big ? 4.5 : 3);
  flash(fx, x, y, 10, big ? Math.min(1.2, r * 0.4) : 0.5, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.85, 0.24, [C[5], C[4], C[3]], { heavy: true });
  fling(fx, x, y, big ? 12 : 7, [C[3], C[2], '#3a2e44'], { speed: 2.6, up: 90, grav: 480, life: 0.5, z: 6, size: 2 });
  fling(fx, x, y, big ? 10 : 6, [P.white, P.bl5, P.bl4], { speed: 6, up: 40, grav: 160, life: 0.24, z: 10, streak: 3, size: 1 });
  puffs(fx, x, y, big ? r * 0.5 : 0.3, big ? 7 : 4, [C[3], C[2], C[1]], { up: 18, z: 2, life: 0.8, out: 0.8 });
  crackle(fx, x, y, 0.4, 2);
}

/** DEMOLITION: an elite or a boss goes off at half its life: light bursts out of it in rays, then the blast, bigger still. */
function demolitionHalf(fx: Fx, game: Game, e: Extract<VolFx, { what: 'half' }>): void {
  const mk = markOf(e.id);
  mk.white = 0;
  mk.crackle = 0.5;
  const C = VMELD_RAMP.demolition;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + rnd(-0.2, 0.2);
    V3.spears.push({ x: e.x, y: e.y, dx: Math.cos(a), dy: Math.sin(a), len: e.r * rnd(0.9, 1.3), t: 0, dur: 0.3, word: 'demolition' });
  }
  V3.pillars.push({ x: e.x, y: e.y, w: 10, t: 0, dur: 0.36, word: 'demolition' });
  demolitionBlast(fx, game, e.x, e.y, e.r, 1.25);
  fling(fx, e.x, e.y, 10, [C[5], C[4]], { speed: 1.2, up: 160, grav: 200, life: 0.6, z: 20, size: 2 });
}

// =============================================================================================
// POWDERKEG (Flame + Volatile): a fireball. White at its heart, orange and red round it, violet
// flickering at its edge, rising as it swells and rolling over into black smoke; burning pieces
// thrown out that land and burn; powder spitting sparks; and it pops again, and again.

function powderkegBlast(fx: Fx, x: number, y: number, r: number, scale = 1): void {
  const C = VMELD_RAMP.powderkeg;
  fx.hold(0.07 * scale);
  fx.shake = Math.max(fx.shake, 6.5 * scale);
  screenFlash('#ffb060', 0.2 * scale, 0.09);
  flash(fx, x, y, 12, Math.min(1.8, r * 0.5), 0.13, [C[5], C[5], C[4], '#ff8a2a']);
  V3.domes.push({ x, y, r: r * 0.62 * scale, t: 0, dur: 0.62 * Math.sqrt(scale), kind: 'fireball', word: 'powderkeg', rise: 26 * scale });
  ring(fx, x, y, r * 1.1, 0.3, [C[5], C[4], '#ff8a2a', C[3]], { heavy: true });
  ring(fx, x, y, r * 1.35, 0.42, ['#3a2a2a', '#2a1e1e', '#1a1212'], { delay: 0.06 });
  // burning pieces of the keg thrown out, landing and burning
  const n = Math.round(9 * scale);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const d = r * rnd(0.5, 1.4);
    const ex = x + Math.cos(a) * d;
    const ey = y + Math.sin(a) * d;
    lob('powderkeg', 'ember', x, y, ex, ey, rnd(0.4, 0.7), rnd(36, 70), 2, () => {
      fx.flames(ex, ey, 0.12, 2, 0.9);
      fling(fx, ex, ey, 3, [C[5], C[4]], { speed: 1.2, up: 50, grav: 300, life: 0.3, z: 2, size: 1 });
    });
  }
  // the powder spits: sparks of white, gold and violet streaking out
  fling(fx, x, y, Math.round(26 * scale), [P.white, C[5], C[4], P.pu5, P.pu4], { speed: 8, up: 70, grav: 200, life: 0.34, z: 10, streak: 3, size: 1 });
  fx.flames(x, y, r * 0.5, Math.round(10 * scale), 1.6);
  crackle(fx, x, y, r * 0.6, 3);
  // and it pops again: little blasts of powder about it, one after another
  for (let k = 1; k <= Math.round(3 * scale); k++) {
    later(0.1 * k + rnd(0, 0.07), () => {
      const a = Math.random() * TAU;
      const d = r * rnd(0.3, 0.8);
      const px = x + Math.cos(a) * d;
      const py = y + Math.sin(a) * d;
      V3.domes.push({ x: px, y: py, r: 0.38, t: 0, dur: 0.3, kind: 'fireball', word: 'powderkeg', rise: 8 });
      flash(fx, px, py, 8, 0.3, 0.07, [C[5], C[4], P.pu5]);
      fling(fx, px, py, 6, [C[5], C[4], P.pu5], { speed: 4, up: 40, grav: 160, life: 0.25, z: 8, streak: 2, size: 1 });
    });
  }
  scar('powderkeg', 'scorch', x, y, r * 0.55, 3.2, 9);
  glow(fx, x, y, 70 + r * 20, 0.45);
}

function powderkegHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = VMELD_RAMP.powderkeg;
  flash(fx, x, y, 10, big ? Math.min(1.1, r * 0.4) : 0.45, 0.1, [C[5], C[4], '#ff8a2a']);
  ring(fx, x, y, big ? r : 0.75, 0.22, [C[5], C[4], C[3]], { heavy: big });
  fx.flames(x, y, big ? r * 0.5 : 0.2, big ? 6 : 3, 1.1);
  fling(fx, x, y, big ? 14 : 8, [P.white, C[5], C[4], P.pu5], { speed: 6, up: 50, grav: 180, life: 0.26, z: 10, streak: 2, size: 1 });
  puffs(fx, x, y, 0.2, big ? 4 : 2, ['#4a3a36', '#33282a', '#221c1e'], { up: 24, z: 10, life: 0.8 });
  crackle(fx, x, y, 0.35, 1);
}

/** POWDERKEG: the blast sets one alight: a burning piece flies at it and bursts into flame on it. */
function powderkegCatch(fx: Fx, e: Extract<VolFx, { what: 'catch' }>): void {
  const C = VMELD_RAMP.powderkeg;
  const d = Math.hypot(e.x1 - e.x0, e.y1 - e.y0);
  lob('powderkeg', 'ember', e.x0, e.y0, e.x1, e.y1, 0.12 + d * 0.06, 18 + d * 6, 3, () => {
    flash(fx, e.x1, e.y1, 12, 0.5, 0.1, [C[5], C[4], '#ff8a2a']);
    fx.flames(e.x1, e.y1, 0.3, 7, 1.5);
    ring(fx, e.x1, e.y1, 0.7, 0.24, [C[5], C[4], '#ff8a2a', C[3]]);
    fling(fx, e.x1, e.y1, 8, [C[5], C[4], P.pu5], { speed: 3.5, up: 70, grav: 200, life: 0.3, z: 12, streak: 2, size: 1 });
    const mk = markOf(e.id);
    mk.white = 0.05;
  });
}

// =============================================================================================
// SHATTER (Frost + Volatile): the frozen one bursts. A white flash; spears of ice racing out over
// the floor; shards flung every way, chunks of ice coming down; a star of frost left on the floor.

function shatterBlast(fx: Fx, x: number, y: number, r: number, scale = 1): void {
  const C = VMELD_RAMP.shatter;
  fx.hold(0.08 * scale);
  fx.shake = Math.max(fx.shake, 6 * scale);
  screenFlash(C[4], 0.22 * scale, 0.08);
  flash(fx, x, y, 12, Math.min(1.6, r * 0.45), 0.12, [C[5], C[5], C[4], C[3]]);
  V3.domes.push({ x, y, r: r * 0.5 * scale, t: 0, dur: 0.24, kind: 'pop', word: 'shatter', rise: 0 });
  ring(fx, x, y, r * 1.1, 0.28, [C[5], C[4], C[3]], { heavy: true, jag: true });
  ring(fx, x, y, r * 1.3, 0.4, [C[4], C[3], C[2]], { delay: 0.05 });
  // spears of ice racing out over the floor
  const n = Math.round(9 * scale);
  const a0 = Math.random() * TAU;
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * TAU + rnd(-0.18, 0.18);
    V3.spears.push({ x, y, dx: Math.cos(a), dy: Math.sin(a), len: r * rnd(0.7, 1.15) * scale, t: 0, dur: 0.5, word: 'shatter' });
  }
  // shards flung every way, glinting; chunks of ice coming down hard
  fling(fx, x, y, Math.round(30 * scale), [P.white, C[5], C[4], C[4], C[3]], { speed: 8.5, up: 70, grav: 260, life: 0.42, z: 12, streak: 5, size: 1 });
  for (let i = 0; i < Math.round(12 * scale); i++) {
    const a = Math.random() * TAU;
    const s = rnd(1.4, 4.2);
    add(fx, { x, y, z: rnd(10, 20), vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: rnd(90, 170), life: rnd(0.5, 0.8), color: pick([C[5], C[4], C[3]]), size: Math.random() < 0.5 ? 3 : 2, grav: 560 });
  }
  puffs(fx, x, y, r * 0.5, Math.round(10 * scale), [C[5], C[4], C[4], C[3]], { up: 10, z: 2, life: 0.9, out: 1.2, drift: 0.2 });
  crackle(fx, x, y, r * 0.6, 3);
  popLater(fx, x, y, r * 0.6, 2);
  scar('shatter', 'frost', x, y, r * 0.75 * scale, 3, 8);
  glow(fx, x, y, 60 + r * 20, 0.3);
}

function shatterHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = VMELD_RAMP.shatter;
  flash(fx, x, y, 12, big ? Math.min(1.1, r * 0.4) : 0.45, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.75, 0.22, [C[5], C[4], C[3]], { jag: true });
  fling(fx, x, y, big ? 16 : 9, [P.white, C[5], C[4]], { speed: 6, up: 50, grav: 220, life: 0.3, z: 12, streak: 3, size: 1 });
  fling(fx, x, y, big ? 6 : 3, [C[4], C[3]], { speed: 2, up: 90, grav: 520, life: 0.5, z: 12, size: 2 });
  crackle(fx, x, y, 0.35, 1);
}

/** SHATTER: a shard from the burst flies straight at one near it and bursts on it. */
function shatterShard(fx: Fx, e: Extract<VolFx, { what: 'shard' }>): void {
  const C = VMELD_RAMP.shatter;
  const d = Math.hypot(e.x1 - e.x0, e.y1 - e.y0);
  lob('shatter', 'shard', e.x0, e.y0, e.x1, e.y1, 0.06 + d * 0.035, 0, 3, () => {
    flash(fx, e.x1, e.y1, 14, 0.45, 0.09, [C[5], C[4], C[3]]);
    ring(fx, e.x1, e.y1, 0.6, 0.2, [C[5], C[4], C[3]], { jag: true });
    fling(fx, e.x1, e.y1, 10, [P.white, C[5], C[4]], { speed: 4.5, up: 60, grav: 240, life: 0.3, z: 14, streak: 3, size: 1, dx: e.x1 - e.x0, dy: e.y1 - e.y0, spread: 0.9 });
    const mk = markOf(e.id);
    mk.white = 0;
    const s = markOf(e.id);
    s.crackle = Math.max(s.crackle, 0.25);
  });
}

/** SHATTER behind: its rune freezes what is near: a sheet of ice sweeps out over the floor, crystals stand up out of it, and what it reaches is lit white. */
function shatterFreeze(fx: Fx, game: Game, e: Extract<VolFx, { what: 'freeze' }>): void {
  const C = VMELD_RAMP.shatter;
  V3.freezes.push({ x: e.x, y: e.y, r: e.r, t: 0, dur: 9, seed: Math.floor(Math.random() * 1e6) });
  ring(fx, e.x, e.y, e.r, 0.32, [C[5], C[4], C[3]], { heavy: true, fill: true });
  flash(fx, e.x, e.y, 4, Math.min(1.6, e.r * 0.45), 0.1, [C[5], C[4], C[3]]);
  puffs(fx, e.x, e.y, e.r * 0.8, 14, [C[5], C[4], C[3]], { up: 8, z: 1, life: 1.0, out: 0.6 });
  for (const id of e.ids) {
    const m = game.monsters.find((q) => q.id === id);
    if (!m) continue;
    markOf(id).white = 0;
    later(Math.hypot(m.x - e.x, m.y - e.y) * 0.05, () => {
      flash(fx, m.x, m.y, 14, 0.5, 0.1, [C[5], C[4]]);
      fling(fx, m.x, m.y, 8, [P.white, C[5], C[4]], { speed: 1.5, up: 60, grav: 120, life: 0.4, z: 8, size: 1 });
    });
  }
  glow(fx, e.x, e.y, 50 + e.r * 20, 0.3);
}

/** SHATTER behind, going off: ice spikes burst up out of the floor all over the rune, stand a moment, and break into shards. */
function shatterRuneGo(fx: Fx, x: number, y: number, r: number): void {
  const C = VMELD_RAMP.shatter;
  const n = Math.round(10 + r * 6);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const d = Math.sqrt(Math.random()) * r * 0.95;
    const sx = x + Math.cos(a) * d;
    const sy = y + Math.sin(a) * d;
    const delay = (d / Math.max(0.1, r)) * 0.12;
    const tall = rnd(14, 30) * (1 - (d / r) * 0.35);
    V3.spikes.push({ x: sx, y: sy, tall, w: tall > 22 ? 3 : 2, t: -delay, dur: 0.55 });
    later(delay + 0.4, () => {
      fling(fx, sx, sy, 5, [P.white, C[5], C[4], C[3]], { speed: 3.5, up: 80, grav: 300, life: 0.4, z: tall * 0.5, streak: 3, size: 1 });
      add(fx, { x: sx, y: sy, z: tall * 0.6, vx: rnd(-1, 1), vy: rnd(-1, 1), vz: rnd(40, 90), life: 0.5, color: C[4], size: 2, grav: 520 });
    });
  }
  later(0.4, () => {
    shatterBlast(fx, x, y, r * 0.8, 1.15);
    V3.pillars.push({ x, y, w: 8, t: 0, dur: 0.26, word: 'shatter' });
  });
  fx.shake = Math.max(fx.shake, 5);
  flash(fx, x, y, 4, Math.min(1.6, r * 0.5), 0.1, [C[5], C[4], C[3]]);
  glow(fx, x, y, 60 + r * 20, 0.6);
}

// =============================================================================================
// CHAIN REACTION (Lightning + Volatile): an explosion of lightning. A ball of bolts bursting out over
// the floor, white and lilac, crackling; then arcs, thick and forking, racing out from it to the
// nearest, each landing with a crack; and what they kill goes off in turn.

function chainBlast(fx: Fx, x: number, y: number, r: number, scale = 1): void {
  const C = VMELD_RAMP.chainreaction;
  fx.hold(0.06 * scale);
  fx.shake = Math.max(fx.shake, 5.5 * scale);
  screenFlash(C[3], 0.2 * scale, 0.07);
  flash(fx, x, y, 12, Math.min(1.6, r * 0.45), 0.12, [C[5], C[4], C[3]]);
  V3.domes.push({ x, y, r: r * 0.55 * scale, t: 0, dur: 0.3, kind: 'storm', word: 'chainreaction', rise: 0 });
  ring(fx, x, y, r * 1.1, 0.26, [C[5], C[4], C[3], C[2]], { heavy: true, jag: true });
  ring(fx, x, y, r * 0.7, 0.2, [C[5], C[4], C[3]], { jag: true, delay: 0.08 });
  const n = Math.round(9 * scale);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rnd(-0.25, 0.25);
    const d = r * rnd(0.7, 1.15) * scale;
    arc(x, y, x + Math.cos(a) * d, y + Math.sin(a) * d, C, { w: 2, dur: 0.24, grow: 0.06, wob: 0.22, z: 4, forks: 1 });
  }
  // a second crack a breath after: it goes off twice
  later(0.09, () => {
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * TAU;
      arc(x, y, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, C, { w: 1, dur: 0.16, wob: 0.2, z: 6 });
    }
    flash(fx, x, y, 10, 0.6, 0.07, [C[5], C[4]]);
  });
  fling(fx, x, y, Math.round(26 * scale), [P.white, C[4], C[4], C[3]], { speed: 8, up: 40, grav: 120, life: 0.3, z: 10, streak: 4, size: 1 });
  crackle(fx, x, y, r * 0.7, 3);
  scar('chainreaction', 'star', x, y, r * 0.75, 2.6, 9);
  glow(fx, x, y, 80 + r * 20, 0.3);
}

function chainHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = VMELD_RAMP.chainreaction;
  flash(fx, x, y, 12, big ? Math.min(1.1, r * 0.4) : 0.45, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.75, 0.2, [C[5], C[4], C[3]], { jag: true, heavy: big });
  for (let i = 0; i < (big ? 5 : 3); i++) {
    const a = Math.random() * TAU;
    const d = big ? r * rnd(0.5, 1) : rnd(0.5, 0.9);
    arc(x, y, x + Math.cos(a) * d, y + Math.sin(a) * d, C, { w: 1, dur: 0.14, wob: 0.15 });
  }
  fling(fx, x, y, big ? 14 : 8, [P.white, C[4], C[3]], { speed: 5.5, up: 40, grav: 120, life: 0.24, z: 12, streak: 3, size: 1 });
}

/** CHAIN REACTION: an arc from the explosion races out to one near it and strikes with a crack; it crackles after. */
function chainArc(fx: Fx, e: Extract<VolFx, { what: 'arc' }>): void {
  const C = VMELD_RAMP.chainreaction;
  const d = Math.hypot(e.x1 - e.x0, e.y1 - e.y0);
  const grow = 0.05 + d * 0.012;
  arc(e.x0, e.y0, e.x1, e.y1, C, { w: 3, dur: 0.34, grow, wob: 0.35, z: 12, forks: 2 });
  later(grow * 0.5, () => arc(e.x0, e.y0, e.x1, e.y1, C, { w: 1, dur: 0.2, grow: grow * 0.5, wob: 0.45, z: 14 }));
  later(grow, () => {
    flash(fx, e.x1, e.y1, 14, 0.55, 0.1, [C[5], C[4], C[3]]);
    ring(fx, e.x1, e.y1, 0.7, 0.2, [C[5], C[4], C[3]], { jag: true, heavy: true });
    fling(fx, e.x1, e.y1, 12, [P.white, C[4], C[3]], { speed: 5, up: 50, grav: 140, life: 0.26, z: 14, streak: 3, size: 1 });
    fx.shake = Math.max(fx.shake, 3);
    const mk = markOf(e.id);
    mk.white = 0;
    mk.crackle = Math.max(mk.crackle, 0.6);
  });
}

/** CHAIN REACTION behind: a rune going off sends a bolt along its link to the next, which flares as it is struck. */
function chainLink(fx: Fx, e: Extract<VolFx, { what: 'link' }>): void {
  const C = VMELD_RAMP.chainreaction;
  arc(e.x0, e.y0, e.x1, e.y1, C, { w: 2, dur: 0.24, grow: VRUNE.linkGap * 0.8, wob: 0.25, z: 3, forks: 2 });
  later(VRUNE.linkGap * 0.8, () => flash(fx, e.x1, e.y1, 6, 0.7, 0.08, [C[5], C[4], C[3]]));
}

// =============================================================================================
// RUPTURE (Poison + Volatile): the poisoned one bursts like a sac. A wet violet pop; a gout of bile
// flung up and out, globs coming down and splashing where they land; a breath of sick gas; and
// globs of it flying onto those about it.

function ruptureBlast(fx: Fx, x: number, y: number, r: number, scale = 1): void {
  const C = VMELD_RAMP.rupture;
  fx.hold(0.06 * scale);
  fx.shake = Math.max(fx.shake, 5 * scale);
  flash(fx, x, y, 12, Math.min(1.5, r * 0.45), 0.12, [C[5], C[4], C[3]]);
  V3.domes.push({ x, y, r: r * 0.5 * scale, t: 0, dur: 0.28, kind: 'pop', word: 'rupture', rise: 4 });
  ring(fx, x, y, r * 1.05, 0.32, [C[4], C[3], C[2]], { heavy: true, fill: true });
  ring(fx, x, y, r * 0.6, 0.24, [C[5], C[4], '#b4cc24'], { delay: 0.05 });
  // the gout: bile flung high, falling back
  fling(fx, x, y, Math.round(24 * scale), [C[5], C[4], C[4], '#b4cc24', C[3]], { speed: 3, up: 200, grav: 520, life: 0.8, z: 10, size: 2, r: 0.2 });
  // globs flung out, splashing where they land
  const n = Math.round(9 * scale);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU;
    const d = r * rnd(0.4, 1.2);
    const gx = x + Math.cos(a) * d;
    const gy = y + Math.sin(a) * d;
    lob('rupture', 'glob', x, y, gx, gy, rnd(0.4, 0.7), rnd(30, 70), Math.random() < 0.5 ? 3 : 2, () => {
      scar('rupture', 'splat', gx, gy, rnd(0.25, 0.42), 2.6, 5);
      fling(fx, gx, gy, 4, [C[4], '#b4cc24'], { speed: 1.4, up: 40, grav: 320, life: 0.3, z: 1, size: 1 });
      fx.bubbles(gx, gy, 0.15, 2);
    });
  }
  // a breath of sick gas, plum and bile, and bubbles
  puffs(fx, x, y, r * 0.45, Math.round(12 * scale), [C[4], C[3], C[3], C[2], C[1]], { up: 22, z: 4, life: 1.1, out: 0.8, drift: 0.25 });
  fx.bubbles(x, y, r * 0.5, Math.round(8 * scale));
  crackle(fx, x, y, r * 0.5, 2);
  popLater(fx, x, y, r * 0.6, 2);
  scar('rupture', 'splat', x, y, r * 0.55 * scale, 3, 8);
  glow(fx, x, y, 50 + r * 18, 0.3);
}

function ruptureHit(fx: Fx, x: number, y: number, r: number, big: boolean): void {
  const C = VMELD_RAMP.rupture;
  flash(fx, x, y, 10, big ? Math.min(1.1, r * 0.4) : 0.45, 0.1, [C[5], C[4], C[3]]);
  ring(fx, x, y, big ? r : 0.75, 0.24, [C[4], C[3], C[2]], { fill: big });
  fling(fx, x, y, big ? 12 : 7, [C[5], C[4], '#b4cc24', C[3]], { speed: 2.4, up: 90, grav: 420, life: 0.5, z: 10, size: 2 });
  fx.bubbles(x, y, big ? r * 0.6 : 0.3, big ? 6 : 3);
  crackle(fx, x, y, 0.35, 1);
}

/** RUPTURE: a glob of the burst's poison flies onto one near it and splashes over it. */
function ruptureSplash(fx: Fx, e: Extract<VolFx, { what: 'splash' }>): void {
  const C = VMELD_RAMP.rupture;
  const d = Math.hypot(e.x1 - e.x0, e.y1 - e.y0);
  lob('rupture', 'glob', e.x0, e.y0, e.x1, e.y1, 0.16 + d * 0.06, 24 + d * 8, 3, () => {
    flash(fx, e.x1, e.y1, 14, 0.45, 0.1, [C[5], C[4], C[3]]);
    ring(fx, e.x1, e.y1, 0.6, 0.26, [C[4], C[3], C[2]], { fill: true });
    fling(fx, e.x1, e.y1, 12, [C[5], C[4], '#b4cc24'], { speed: 2.5, up: 70, grav: 380, life: 0.45, z: 18, size: 2 });
    fx.bubbles(e.x1, e.y1, 0.3, 5);
    scar('rupture', 'splat', e.x1, e.y1, 0.4, 2.4, 5);
    markOf(e.id).white = 0.04;
  });
}

/** RUPTURE behind, going off: the blister bursts, and the cloud boils up out of it (the cloud itself is the rules' patch, drawn in the air). */
function ruptureRuneGo(fx: Fx, x: number, y: number, r: number): void {
  const C = VMELD_RAMP.rupture;
  ruptureBlast(fx, x, y, r * 0.75, 1.2);
  puffs(fx, x, y, r * 0.5, 22, [C[4], C[3], C[3], C[2], C[1]], { up: 30, z: 4, life: 1.4, out: 1.4, drift: 0.3 });
}

// =============================================================================================
// THE RUNES, going off.

function demolitionRuneGo(fx: Fx, game: Game, x: number, y: number, r: number): void {
  V3.pillars.push({ x, y, w: 16, t: 0, dur: 0.42, word: 'demolition' });
  demolitionBlast(fx, game, x, y, r * 0.85, 1.6);
  // every stone of the ring goes up with it
  const C = VMELD_RAMP.demolition;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    later(0.03 * i, () => {
      const sx = x + Math.cos(a) * r * 0.9;
      const sy = y + Math.sin(a) * r * 0.9;
      flash(fx, sx, sy, 6, 0.35, 0.08, [C[5], C[4]]);
      lob('demolition', 'rubble', sx, sy, sx + Math.cos(a) * rnd(0.6, 1.4), sy + Math.sin(a) * rnd(0.6, 1.4), rnd(0.4, 0.6), rnd(30, 60), 2);
    });
  }
}

function powderkegRuneGo(fx: Fx, x: number, y: number, r: number): void {
  powderkegBlast(fx, x, y, r * 0.8, 1.35);
  // a column of smoke and fire standing up off it
  puffs(fx, x, y, 0.3, 14, ['#ff9a50', '#a83c28', '#4a3a36', '#33282a', '#221c1e'], { up: 80, z: 10, life: 1.4, drift: 0.2 });
}

function chainRuneGo(fx: Fx, x: number, y: number, r: number): void {
  chainBlast(fx, x, y, r * 0.75, 1.25);
  // a bolt out of the sky onto it
  V3.pillars.push({ x, y, w: 3, t: 0, dur: 0.26, word: 'chainreaction' });
}

/** The look of one of the five going off: a kill's explosion (`rune` false) or a rune's. */
function blastLook(word: VMeldId, fx: Fx, game: Game, x: number, y: number, r: number, rune: boolean): void {
  if (word === 'demolition') rune ? demolitionRuneGo(fx, game, x, y, r) : demolitionBlast(fx, game, x, y, r);
  else if (word === 'powderkeg') rune ? powderkegRuneGo(fx, x, y, r) : powderkegBlast(fx, x, y, r);
  else if (word === 'shatter') rune ? shatterRuneGo(fx, x, y, r) : shatterBlast(fx, x, y, r);
  else if (word === 'chainreaction') rune ? chainRuneGo(fx, x, y, r) : chainBlast(fx, x, y, r);
  else rune ? ruptureRuneGo(fx, x, y, r) : ruptureBlast(fx, x, y, r);
  if (!rune && word !== 'demolition') joltRound(game, x, y, r * 1.3, 2.5);
}

/** Each one's hit (an attack carrying it striking something): a little of what its blast will be. */
export function hitV3(word: VMeldId, fx: Fx, x: number, y: number, r: number, big: boolean): void {
  if (word === 'demolition') demolitionHit(fx, x, y, r, big);
  else if (word === 'powderkeg') powderkegHit(fx, x, y, r, big);
  else if (word === 'shatter') shatterHit(fx, x, y, r, big);
  else if (word === 'chainreaction') chainHit(fx, x, y, r, big);
  else ruptureHit(fx, x, y, r, big);
}

// =============================================================================================
// ON THE FLOOR: the runes as they wait, the patches they leave, the marks of the blasts.

/** Which of the five a patch belongs to, if any (its `look`, its `meld`, or its words). */
export function vmeldOf(z: Zone): VMeldId | null {
  const w = z as { look?: unknown; meld?: unknown };
  if (isVMeld(w.look)) return w.look;
  if (isVMeld(w.meld)) return w.meld;
  for (const x of z.words) if (isVMeld(x)) return x;
  return null;
}

/** Whether render.ts should leave this patch to the looks here (a rune of the five, Powderkeg's burning ground, Rupture's cloud). */
export function ownsZoneV3(z: Zone): boolean {
  if (!VOLATILE3.on) return false;
  const w = vmeldOf(z);
  if (!w) return false;
  return z.kind === 'rune' || (w === 'powderkeg' && z.kind === 'burn') || (w === 'rupture' && z.kind === 'venom');
}

/** How far a rune has got toward going off, 0 to 1. */
function runeK(z: Zone): number {
  const wait = V3.waits.get(z) ?? z.dur;
  return Math.max(0, Math.min(1, z.t / Math.max(0.01, wait)));
}

const shapes = new WeakMap<Zone, { seed: number; lines: number[][] }>();
function shapeOf(z: Zone): { seed: number; lines: number[][] } {
  let s = shapes.get(z);
  if (!s) {
    const seed = Math.floor(z.x * 131 + z.y * 71) & 0xffff;
    const lines: number[][] = [];
    const n = 10;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + (hash2(seed, k, 1) - 0.5) * 0.5;
      const pts = [0, 0];
      for (let i = 1; i <= 4; i++) {
        const d = (z.r * 0.95 * i) / 4;
        const j = (hash2(seed, k * 5 + i, 2) - 0.5) * z.r * 0.18;
        pts.push(Math.cos(a) * d - Math.sin(a) * j, Math.sin(a) * d + Math.cos(a) * j);
      }
      lines.push(pts);
    }
    s = { seed, lines };
    shapes.set(z, s);
  }
  return s;
}

/** A line of the rune's own drawing, world offsets from its middle, drawn `upTo` of its way (0..1). */
function strokeOn(g: CanvasRenderingContext2D, cam: Cam, x: number, y: number, pts: number[], color: string, upTo = 1, w = 1): void {
  const n = pts.length / 2 - 1;
  const stop = upTo * n;
  for (let i = 0; i < n && i < stop; i++) {
    const q = Math.min(1, stop - i);
    const x0 = wx(cam, x + pts[i * 2], y + pts[i * 2 + 1]);
    const y0 = wy(cam, x + pts[i * 2], y + pts[i * 2 + 1]);
    const x1 = wx(cam, x + pts[i * 2] + (pts[i * 2 + 2] - pts[i * 2]) * q, y + pts[i * 2 + 1] + (pts[i * 2 + 3] - pts[i * 2 + 1]) * q);
    const y1 = wy(cam, x + pts[i * 2] + (pts[i * 2 + 2] - pts[i * 2]) * q, y + pts[i * 2 + 1] + (pts[i * 2 + 3] - pts[i * 2 + 1]) * q);
    thick(g, x0, y0, x1, y1, color, w);
  }
}

/** A polygon of `n` corners round the middle at radius r tiles, turned by `a0`, as world offsets. */
function poly(n: number, r: number, a0: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i <= n; i++) pts.push(Math.cos(a0 + (i / n) * TAU) * r, Math.sin(a0 + (i / n) * TAU) * r);
  return pts;
}

/** A circle as world offsets (to be written on stroke by stroke). */
const circle = (r: number, a0 = -Math.PI / 2): number[] => poly(40, r, a0);

/** The beat of a rune near going off: on and off, faster and faster. */
const beatOf = (k: number, t: number): boolean => Math.sin(t * (8 + k * k * 46)) > 0;

function drawRune(g: CanvasRenderingContext2D, cam: Cam, t: number, z: Zone, word: VMeldId, game: Game): void {
  const C = VMELD_RAMP[word];
  const cx = wx(cam, z.x, z.y);
  const cy = wy(cam, z.x, z.y);
  const k = runeK(z);
  const write = Math.min(1, z.t / 0.3);
  const beat = beatOf(k, t);
  const hot = k > 0.75;
  const lit = hot ? (beat ? C[5] : C[4]) : beat ? C[4] : C[3];
  const R = z.r;
  const s = shapeOf(z);
  if (word === 'demolition') {
    // ONE HUGE RUNE, SLOW TO GO OFF: a great double ring, a square set in it like a stone laid in a
    // wall, the floor inside cracking out from its heart as its time runs down; round the rim ten
    // charges set like a fuse, lit one after another, the last white; dust trickling up.
    ellipse(g, cx, cy, R, C[0], 0.3 + 0.25 * k);
    ellipse(g, cx, cy, R * 0.55, C[1], 0.2 + 0.3 * k);
    strokeOn(g, cam, z.x, z.y, circle(R * 0.98), C[2], write, 2);
    strokeOn(g, cam, z.x, z.y, circle(R * 0.9), lit, write);
    strokeOn(g, cam, z.x, z.y, poly(4, R * 0.62, Math.PI / 4 + t * 0.15), lit, Math.max(0, write * 1.3 - 0.3));
    strokeOn(g, cam, z.x, z.y, poly(4, R * 0.62, t * 0.15), C[2], Math.max(0, write * 1.3 - 0.3));
    strokeOn(g, cam, z.x, z.y, circle(R * 0.3), lit, Math.max(0, write * 1.5 - 0.5));
    // the floor cracking out from its heart, red-hot at the cracks' ends as they go
    for (const ln of s.lines) {
      strokeOn(g, cam, z.x, z.y, ln, C[1], Math.min(1, k * 1.3), 2);
      strokeOn(g, cam, z.x, z.y, ln, hot && beat ? P.bl5 : C[3], Math.min(1, k * 1.3));
    }
    // the ten charges round the rim, lit in turn
    const charges = 10;
    for (let i = 0; i < charges; i++) {
      const a = -Math.PI / 2 + (i / charges) * TAU;
      const [px, py] = onFloor(cx, cy, a, R * 0.9);
      const on = k * charges > i + 0.0001;
      const fresh = on && k * charges < i + 1;
      g.fillStyle = C[1];
      g.fillRect(Math.round(px) - 2, Math.round(py) - 2, 5, 4);
      g.fillStyle = on ? (fresh || hot ? (beat ? P.white : C[4]) : P.bl4) : C[2];
      g.fillRect(Math.round(px) - 1, Math.round(py) - 1, 3, 2);
      if (on) {
        g.fillStyle = P.white;
        g.fillRect(Math.round(px), Math.round(py) - 1, 1, 1);
      }
    }
    // the heart: a diamond, burning
    g.fillStyle = C[2];
    g.fillRect(Math.round(cx) - 3, Math.round(cy) - 1, 7, 3);
    g.fillRect(Math.round(cx) - 1, Math.round(cy) - 2, 3, 5);
    g.fillStyle = lit;
    g.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 3);
    // closing in at the end: a ring from its edge to its heart
    if (k > 0.8) rim(g, cx, cy, R * (1 - (k - 0.8) / 0.2), beat ? P.white : C[4], 1);
  } else if (word === 'powderkeg') {
    // A RING OF BLACK POWDER and a FUSE BURNING ROUND IT: a spark runs round the ring from the top;
    // behind it the powder is burnt to embers, then black; within, the keg's sigil glows hotter as
    // the spark comes round.
    ellipse(g, cx, cy, R, '#1a1210', 0.35);
    rim(g, cx, cy, R * 0.92, '#2a2020', 1, 0, TAU, 2);
    const head = -Math.PI / 2 + k * TAU;
    const steps = 64;
    for (let i = 0; i < steps; i++) {
      const a = -Math.PI / 2 + (i / steps) * TAU;
      if (a > head) break;
      const [px, py] = onFloor(cx, cy, a, R * 0.92);
      const ago = (head - a) / TAU;
      g.fillStyle = ago < 0.06 ? C[5] : ago < 0.16 ? C[4] : ago < 0.3 ? C[3] : C[1];
      g.fillRect(Math.round(px), Math.round(py), 2, 2);
    }
    // the keg's sigil: a flame in a ring, three strokes
    strokeOn(g, cam, z.x, z.y, circle(R * 0.55), C[2], write, 2);
    strokeOn(g, cam, z.x, z.y, circle(R * 0.55), lit, write);
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i / 3) * TAU + t * 0.6;
      strokeOn(g, cam, z.x, z.y, [Math.cos(a) * R * 0.55, Math.sin(a) * R * 0.55, Math.cos(a + 2.2) * R * 0.2, Math.sin(a + 2.2) * R * 0.2], i === 0 && hot ? P.pu5 : lit, write);
    }
    g.fillStyle = hot && beat ? P.white : C[4];
    g.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 2);
    // the spark itself, fizzing
    const [hx, hy] = onFloor(cx, cy, head, R * 0.92);
    g.fillStyle = P.white;
    g.fillRect(Math.round(hx) - 1, Math.round(hy) - 2, 3, 3);
    g.fillStyle = C[5];
    g.fillRect(Math.round(hx) - 2, Math.round(hy) - 1, 5, 1);
  } else if (word === 'shatter') {
    // A SIX-POINTED STAR OF ICE, frost creeping out over the floor from its points; after it has
    // frozen what is near, cracks run through it, more and more, and it beats white.
    ellipse(g, cx, cy, R, C[1], 0.22 + 0.2 * k);
    strokeOn(g, cam, z.x, z.y, circle(R * 0.95), C[2], write);
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i / 6) * TAU;
      const arm = [0, 0, Math.cos(a) * R * 0.8, Math.sin(a) * R * 0.8];
      strokeOn(g, cam, z.x, z.y, arm, C[2], write, 2);
      strokeOn(g, cam, z.x, z.y, arm, lit, write);
      // barbs on each arm
      for (const f of [0.45, 0.65]) {
        const bx = Math.cos(a) * R * 0.8 * f;
        const by = Math.sin(a) * R * 0.8 * f;
        for (const side of [-1, 1]) {
          const b = a + side * 0.7;
          strokeOn(g, cam, z.x, z.y, [bx, by, bx + Math.cos(b) * R * 0.16, by + Math.sin(b) * R * 0.16], lit, Math.max(0, write * 1.4 - 0.4));
        }
      }
    }
    strokeOn(g, cam, z.x, z.y, poly(6, R * 0.32, -Math.PI / 2), lit, Math.max(0, write * 1.5 - 0.5));
    // cracks running through it once it has frozen what is near
    const after = Math.max(0, (k - VRUNE.freezeAt) / (1 - VRUNE.freezeAt));
    if (after > 0) for (const ln of s.lines.slice(0, 7)) strokeOn(g, cam, z.x, z.y, ln, beat ? P.white : C[4], after);
    g.fillStyle = hot && beat ? P.white : C[4];
    g.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 3);
  } else if (word === 'chainreaction') {
    // A RING WITH A BOLT ACROSS IT, crackling; and to each of its kind in reach, a crackling line
    // over the floor: the link along which one going off sets off the next.
    ellipse(g, cx, cy, R, C[1], 0.2 + 0.15 * k);
    strokeOn(g, cam, z.x, z.y, circle(R * 0.85), C[2], write, 2);
    strokeOn(g, cam, z.x, z.y, circle(R * 0.85), lit, write);
    const bolt = [-R * 0.55, -R * 0.35, -R * 0.05, -R * 0.12, -R * 0.15, R * 0.12, R * 0.55, R * 0.35];
    strokeOn(g, cam, z.x, z.y, bolt, C[2], Math.max(0, write * 1.4 - 0.4), 3);
    strokeOn(g, cam, z.x, z.y, bolt, hot && beat ? P.white : C[4], Math.max(0, write * 1.4 - 0.4));
    // little bolts jumping round its ring
    if (Math.floor(t * 14 + z.x * 3) % 3 === 0) {
      const a = Math.random() * TAU;
      const [ax, ay] = onFloor(cx, cy, a, R * 0.85);
      const [bx, by] = onFloor(cx, cy, a + rnd(0.4, 0.9), R * 0.85);
      pline(g, ax, ay, (ax + bx) / 2 + rnd(-3, 3), (ay + by) / 2 + rnd(-3, 3), C[4]);
      pline(g, (ax + bx) / 2, (ay + by) / 2, bx, by, C[5]);
    }
    // the links, to every other of its kind in reach (drawn once, from the first of the two)
    for (const o of game.zones) {
      if (o === z || o.kind !== 'rune' || vmeldOf(o) !== 'chainreaction') continue;
      const d = Math.hypot(o.x - z.x, o.y - z.y);
      if (d > VRUNE.linkReach || game.zones.indexOf(o) < game.zones.indexOf(z)) continue;
      const ox = wx(cam, o.x, o.y);
      const oy = wy(cam, o.x, o.y);
      const segs = Math.max(4, Math.round(d * 3));
      const tick = Math.floor(t * 12);
      let px = cx;
      let py = cy;
      for (let i = 1; i <= segs; i++) {
        const q = i / segs;
        const jx = i === segs ? 0 : (hash2(tick, i, 7) - 0.5) * 7;
        const jy = i === segs ? 0 : (hash2(tick, i, 8) - 0.5) * 4;
        const nx = cx + (ox - cx) * q + jx;
        const ny = cy + (oy - cy) * q + jy;
        g.globalAlpha = 0.55 + 0.3 * Math.min(k, runeK(o));
        pline(g, px, py, nx, ny, C[3]);
        g.globalAlpha = 1;
        px = nx;
        py = ny;
      }
      // a spark running along it, there and back
      const run = (Math.sin(t * 5 + z.x) + 1) / 2;
      g.fillStyle = P.white;
      g.fillRect(Math.round(cx + (ox - cx) * run) - 1, Math.round(cy + (oy - cy) * run) - 1, 2, 2);
    }
    g.fillStyle = hot && beat ? P.white : C[4];
    g.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 2);
  } else {
    // A BLISTER ON THE FLOOR: a plum ring, and in its middle a swelling of poison, glossy, veined,
    // growing and trembling as its time runs out; bubbles rising off it.
    ellipse(g, cx, cy, R, C[1], 0.3);
    strokeOn(g, cam, z.x, z.y, circle(R * 0.9), C[2], write, 2);
    strokeOn(g, cam, z.x, z.y, circle(R * 0.9), lit, write);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i / 5) * TAU;
      strokeOn(g, cam, z.x, z.y, [Math.cos(a) * R * 0.9, Math.sin(a) * R * 0.9, Math.cos(a + 0.4) * R * 0.45, Math.sin(a + 0.4) * R * 0.45], C[3], Math.max(0, write * 1.4 - 0.4));
    }
    const swell = 0.12 + 0.24 * smooth(k);
    const shake = k > 0.6 ? Math.round(Math.sin(t * 60) * (k - 0.6) * 4) : 0;
    const bx = Math.round(cx) + shake;
    const by = Math.round(cy);
    const rw = Math.round(swell * R * 22.6);
    const rh = Math.round(swell * R * 11.3);
    const up = Math.round(rh * 1.6 + 2);
    oval(g, bx, by - up + 1, rw + 1, rh + up * 0.6 + 1, C[1]);
    oval(g, bx, by - up, rw, rh + up * 0.6, C[3]);
    oval(g, bx, by - up + 1, Math.max(1, rw - 3), Math.max(1, rh + up * 0.6 - 3), hot && beat ? C[5] : C[4]);
    // its veins, and the shine on it
    g.fillStyle = C[2];
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + 0.4;
      pline(g, bx, by - up, bx + Math.cos(a) * (rw - 1), by - up + Math.sin(a) * (rh + up * 0.5 - 1), C[2]);
    }
    g.fillStyle = P.white;
    g.fillRect(bx - Math.round(rw * 0.4), by - up - Math.round((rh + up * 0.6) * 0.5), 2, 1);
  }
  void game;
}

function drawScar(g: CanvasRenderingContext2D, cam: Cam, s: Scar): void {
  const C = VMELD_RAMP[s.word];
  const cx = wx(cam, s.x, s.y);
  const cy = wy(cam, s.x, s.y);
  const fade = Math.min(1, (s.dur - s.t) / 0.8);
  const grow = Math.min(1, s.t / 0.1);
  if (s.kind === 'crater') {
    // a crater: a dark bowl, a lip of rubble, cracks out from it red-hot and cooling
    ellipse(g, cx, cy, s.r * grow * 1.15, C[2], 0.55 * fade);
    ellipse(g, cx, cy, s.r * grow, C[0], 0.75 * fade);
    ellipse(g, cx, cy + 1, s.r * grow * 0.6, '#06040a', 0.6 * fade);
    const hot = Math.max(0, 1 - s.t / 1.4);
    for (const ln of s.lines) {
      g.globalAlpha = fade;
      const pts = ln.map((v) => v * 1.7);
      for (let i = 0; i + 3 < pts.length; i += 2) {
        pline(g, wx(cam, s.x + pts[i], s.y + pts[i + 1]), wy(cam, s.x + pts[i], s.y + pts[i + 1]), wx(cam, s.x + pts[i + 2], s.y + pts[i + 3]), wy(cam, s.x + pts[i + 2], s.y + pts[i + 3]), hot > 0.5 ? P.bl5 : hot > 0.15 ? P.bl4 : C[1]);
      }
    }
    g.globalAlpha = fade;
    rim(g, cx, cy, s.r * grow * 1.1, C[3], 3, s.seed, TAU, 2);
    g.globalAlpha = 1;
  } else if (s.kind === 'scorch') {
    ellipse(g, cx, cy, s.r * grow, '#140c0a', 0.7 * fade);
    const hot = Math.max(0, 1 - s.t / 1.6);
    for (const ln of s.lines) {
      g.globalAlpha = fade;
      for (let i = 0; i + 3 < ln.length; i += 2) {
        pline(g, wx(cam, s.x + ln[i] * 1.4, s.y + ln[i + 1] * 1.4), wy(cam, s.x + ln[i] * 1.4, s.y + ln[i + 1] * 1.4), wx(cam, s.x + ln[i + 2] * 1.4, s.y + ln[i + 3] * 1.4), wy(cam, s.x + ln[i + 2] * 1.4, s.y + ln[i + 3] * 1.4), hot > 0.5 ? C[4] : hot > 0.1 ? C[3] : '#2a1a14');
      }
    }
    g.globalAlpha = 1;
    // embers glowing in it
    if (hot > 0.05) {
      g.fillStyle = C[4];
      for (let i = 0; i < 6; i++) {
        if (hash2(s.seed, i, Math.floor(s.t * 6)) > 0.6 + (1 - hot) * 0.3) continue;
        const [ex, ey] = onFloor(cx, cy, hash2(s.seed, i, 4) * TAU, s.r * hash2(s.seed, i, 5) * 0.8);
        g.fillRect(Math.round(ex), Math.round(ey), 1, 1);
      }
    }
  } else if (s.kind === 'frost') {
    // a star of frost: white lines out from its heart, crystals at their ends
    ellipse(g, cx, cy, s.r * grow * 0.6, C[3], 0.25 * fade);
    for (const ln of s.lines) {
      g.globalAlpha = 0.85 * fade;
      for (let i = 0; i + 3 < ln.length; i += 2) {
        pline(g, wx(cam, s.x + ln[i] * grow, s.y + ln[i + 1] * grow), wy(cam, s.x + ln[i] * grow, s.y + ln[i + 1] * grow), wx(cam, s.x + ln[i + 2] * grow, s.y + ln[i + 3] * grow), wy(cam, s.x + ln[i + 2] * grow, s.y + ln[i + 3] * grow), i === 0 ? P.white : C[4]);
      }
      const ex = wx(cam, s.x + ln[ln.length - 2] * grow, s.y + ln[ln.length - 1] * grow);
      const ey = wy(cam, s.x + ln[ln.length - 2] * grow, s.y + ln[ln.length - 1] * grow);
      g.fillStyle = C[5];
      g.fillRect(Math.round(ex) - 1, Math.round(ey), 3, 1);
      g.fillRect(Math.round(ex), Math.round(ey) - 1, 1, 3);
    }
    g.globalAlpha = 1;
  } else if (s.kind === 'star') {
    // a burnt star, its lines glowing lilac, then black
    const hot = Math.max(0, 1 - s.t / 0.8);
    ellipse(g, cx, cy, s.r * 0.4 * grow, '#100a14', 0.6 * fade);
    for (const ln of s.lines) {
      g.globalAlpha = fade;
      for (let i = 0; i + 3 < ln.length; i += 2) {
        pline(g, wx(cam, s.x + ln[i], s.y + ln[i + 1]), wy(cam, s.x + ln[i], s.y + ln[i + 1]), wx(cam, s.x + ln[i + 2], s.y + ln[i + 3]), wy(cam, s.x + ln[i + 2], s.y + ln[i + 3]), hot > 0.4 ? C[4] : hot > 0.05 ? C[3] : '#1a1220');
      }
    }
    g.globalAlpha = 1;
  } else {
    // a splat of poison: a wet patch, plum at its edge, bile in it, a bubble now and then
    ellipse(g, cx, cy, s.r * grow * 1.1, C[2], 0.5 * fade);
    ellipse(g, cx, cy, s.r * grow * 0.85, '#7c9416', 0.55 * fade);
    ellipse(g, cx, cy - 1, s.r * grow * 0.5, C[4], 0.45 * fade);
    g.globalAlpha = fade;
    for (const ln of s.lines) {
      const ex = wx(cam, s.x + ln[ln.length - 2] * 1.1, s.y + ln[ln.length - 1] * 1.1);
      const ey = wy(cam, s.x + ln[ln.length - 2] * 1.1, s.y + ln[ln.length - 1] * 1.1);
      g.fillStyle = C[3];
      g.fillRect(Math.round(ex), Math.round(ey), 2, 1);
    }
    g.globalAlpha = 1;
  }
}

/** Powderkeg's burning ground: the floor scorched black, cracked and glowing, little flames on it, the powder in it popping. */
function drawPowderGround(g: CanvasRenderingContext2D, cam: Cam, t: number, z: Zone): void {
  const C = VMELD_RAMP.powderkeg;
  const cx = wx(cam, z.x, z.y);
  const cy = wy(cam, z.x, z.y);
  const fade = Math.min(1, z.t / 0.15, (z.dur - z.t) * 1.5);
  const s = shapeOf(z);
  ellipse(g, cx, cy, z.r, '#120a08', 0.55 * fade);
  ellipse(g, cx, cy, z.r * 0.75, C[1], 0.35 * fade);
  for (const ln of s.lines) {
    g.globalAlpha = fade;
    for (let i = 0; i + 3 < ln.length; i += 2) {
      const glowing = Math.sin(t * 6 + i + s.seed) > -0.2;
      pline(g, wx(cam, z.x + ln[i] * 0.9, z.y + ln[i + 1] * 0.9), wy(cam, z.x + ln[i] * 0.9, z.y + ln[i + 1] * 0.9), wx(cam, z.x + ln[i + 2] * 0.9, z.y + ln[i + 3] * 0.9), wy(cam, z.x + ln[i + 2] * 0.9, z.y + ln[i + 3] * 0.9), glowing ? C[4] : C[3]);
    }
  }
  g.globalAlpha = fade;
  rim(g, cx, cy, z.r, C[3], 3, s.seed, TAU, 1);
  g.globalAlpha = 1;
}

/** Shatter's sheet of ice, laid by its rune as it freezes what is near: swept out from the middle, then cracking and melting away. */
function drawFreeze(g: CanvasRenderingContext2D, cam: Cam, f: (typeof V3.freezes)[number]): void {
  const C = VMELD_RAMP.shatter;
  const cx = wx(cam, f.x, f.y);
  const cy = wy(cam, f.x, f.y);
  const out = easeOut(Math.min(1, f.t / 0.25));
  const fade = Math.min(1, (f.dur - f.t) / 1);
  ellipse(g, cx, cy, f.r * out, C[3], 0.28 * fade);
  ellipse(g, cx, cy, f.r * out * 0.7, C[4], 0.14 * fade);
  g.globalAlpha = 0.8 * fade;
  rim(g, cx, cy, f.r * out, C[5], 2, f.seed, TAU, 1);
  // crystals standing up out of it
  for (let i = 0; i < 14; i++) {
    const a = hash2(f.seed, i, 1) * TAU;
    const d = Math.sqrt(hash2(f.seed, i, 2)) * f.r * out * 0.95;
    const [px, py] = onFloor(cx, cy, a, d);
    const tall = 2 + Math.floor(hash2(f.seed, i, 3) * 5);
    g.fillStyle = C[4];
    g.fillRect(Math.round(px), Math.round(py) - tall, 1, tall);
    g.fillStyle = P.white;
    g.fillRect(Math.round(px), Math.round(py) - tall, 1, 1);
  }
  g.globalAlpha = 1;
}

/** Under the figures (render.ts, after the floor's own patches): the five's runes, their patches, the marks of their blasts. */
export function floorV3(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, here: (x: number, y: number) => boolean): void {
  if (!VOLATILE3.on) return;
  for (const s of V3.scars) if (here(s.x, s.y)) drawScar(g, cam, s);
  for (const f of V3.freezes) if (here(f.x, f.y)) drawFreeze(g, cam, f);
  for (const z of game.zones) {
    const w = vmeldOf(z);
    if (!w || !here(z.x, z.y)) continue;
    if (z.kind === 'rune') drawRune(g, cam, t, z, w, game);
    else if (w === 'powderkeg' && z.kind === 'burn') drawPowderGround(g, cam, t, z);
    else if (w === 'rupture' && z.kind === 'venom') {
      // the slick under Rupture's cloud
      const C = VMELD_RAMP.rupture;
      const fade = Math.min(1, z.t / 0.3, (z.dur - z.t) * 1.5);
      ellipse(g, wx(cam, z.x, z.y), wy(cam, z.x, z.y), z.r, C[2], 0.35 * fade);
      ellipse(g, wx(cam, z.x, z.y), wy(cam, z.x, z.y), z.r * 0.7, '#4c5e10', 0.3 * fade);
    }
  }
  // the spears of ice and the rays of light lying out over the floor from a burst
  for (const sp of V3.spears) {
    if (!here(sp.x, sp.y)) continue;
    const C = VMELD_RAMP[sp.word];
    const k = sp.t / sp.dur;
    const out = easeOut(Math.min(1, k / 0.25)) * sp.len;
    const back = k > 0.55 ? ((k - 0.55) / 0.45) * sp.len : 0;
    const x0 = wx(cam, sp.x + sp.dx * back, sp.y + sp.dy * back);
    const y0 = wy(cam, sp.x + sp.dx * back, sp.y + sp.dy * back);
    const x1 = wx(cam, sp.x + sp.dx * out, sp.y + sp.dy * out);
    const y1 = wy(cam, sp.x + sp.dx * out, sp.y + sp.dy * out);
    if (back >= out) continue;
    if (sp.word === 'shatter') {
      thick(g, x0, y0 + 1, x1, y1 + 1, C[2], 3);
      thick(g, x0, y0, x1, y1, C[4], 2);
      pline(g, x0, y0 - 1, x1, y1 - 1, P.white);
      // its point: a crystal standing up
      g.fillStyle = P.white;
      g.fillRect(Math.round(x1), Math.round(y1) - 4, 1, 4);
      g.fillStyle = C[5];
      g.fillRect(Math.round(x1) - 1, Math.round(y1) - 2, 3, 2);
    } else {
      // light breaking out of a thing about to go off, laid along the floor
      thick(g, x0, y0, x1, y1, C[4], 2);
      pline(g, x0, y0, x1, y1, P.white);
    }
  }
}

// =============================================================================================
// IN THE AIR (after the darkness, so it glows): Rupture's cloud, the domes, the pillars.

/**
 * Rupture's cloud: puffs of gas turning slowly over the slick, each with a dark belly, a body and a cap
 * lit at its upper left (so that it has weight), plum and bile in turn; some rising off it as others
 * sink back; thin round the hero, so that he and what strikes at him are always seen.
 */
function drawCloud(g: CanvasRenderingContext2D, cam: Cam, t: number, z: Zone, game: Game): void {
  const C = VMELD_RAMP.rupture;
  const fade = Math.min(1, z.t / 0.3, (z.dur - z.t) * 1.2);
  const born = easeOut(Math.min(1, z.t / 0.5));
  const s = shapeOf(z);
  const n = Math.round(14 + z.r * 9);
  const hx = wx(cam, game.hero.x, game.hero.y);
  const hy = wy(cam, game.hero.x, game.hero.y) - 12;
  const looks = [
    [C[1], C[3], C[4]],
    [C[0], C[2], C[3]],
    ['#26300c', '#7c9416', C[4]],
  ];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + t * (0.2 + hash2(i, s.seed, 1) * 0.3) * (i % 2 === 0 ? 1 : -1);
    const d = z.r * (0.15 + hash2(i, s.seed, 2) * 0.7) * (0.4 + 0.6 * born);
    const rise = (t * 0.35 + hash2(i, s.seed, 6)) % 1;
    const px = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
    const py = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - 6 - Math.round(hash2(i, s.seed, 3) * 10 + Math.sin(t * 1.4 + i) * 2 + rise * 18);
    const rr = (4 + hash2(i, s.seed, 4) * 5 + rise * 4) * (0.5 + 0.5 * born);
    let alpha = (0.55 + hash2(i, s.seed, 5) * 0.2) * fade * Math.min(1, (1 - rise) * 2.5, 0.35 + rise * 4);
    if (Math.hypot(px - hx, (py - hy) * 1.6) < 30) alpha *= 0.3;
    const [belly, body, cap] = looks[i % 3];
    oval(g, px + 1, py + 2, rr * 1.5, rr * 0.75, belly, alpha, 0.8, s.seed + i);
    oval(g, px, py, rr * 1.4, rr * 0.75, body, alpha, 0.8, s.seed + i + 40);
    oval(g, px - rr * 0.35, py - rr * 0.3, rr * 0.8, rr * 0.4, cap, alpha, 0.5, s.seed + i + 80);
  }
}

function drawDome(g: CanvasRenderingContext2D, cam: Cam, d: Dome): void {
  const C = VMELD_RAMP[d.word];
  const k = d.t / d.dur;
  const cx = Math.round(wx(cam, d.x, d.y));
  const cy = Math.round(wy(cam, d.x, d.y));
  const seed = Math.round(d.x * 977 + d.y * 313) + Math.floor(d.t * 24);
  if (d.kind === 'blast') {
    // A DOME OF LIGHT swelling over the floor: white at first, its edge torn; then hollowing out from
    // the middle into a shell that thins to a ring of dust and is gone
    const q = easeOut(Math.min(1, k / 0.4));
    const rw = d.r * 22.6 * q;
    const rh = d.r * 11.3 * q + d.r * 14 * q;
    const y = cy - Math.round(d.r * 7 * q);
    const hole = k < 0.22 ? 0 : Math.min(0.96, smooth((k - 0.22) / 0.78) * 1.05);
    const fade = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
    oval(g, cx, y, rw + 2, rh + 2, C[1], 0.9 * fade, 2.5, seed, hole * 0.98);
    oval(g, cx, y, rw, rh, C[2], fade, 2, seed + 1, hole);
    oval(g, cx, y, rw - 2, rh - 2, k < 0.35 ? C[4] : C[3], fade, 1.5, seed + 2, Math.min(0.99, hole * 1.04));
    if (k < 0.5) oval(g, cx, y, (rw - 3) * (1 - hole), (rh - 3) * (1 - hole), k < 0.18 ? P.white : C[5], 1 - k / 0.5, 1, seed + 3, hole > 0 ? 0.4 : 0);
    // dust in it: dark specks torn off its edge
    g.fillStyle = C[1];
    for (let i = 0; i < 18 * fade; i++) {
      const a = hash2(seed, i, 7) * TAU;
      const rr = 0.85 + hash2(seed, i, 8) * 0.25;
      g.fillRect(Math.round(cx + Math.cos(a) * rw * rr), Math.round(y + Math.sin(a) * rh * rr), 2, 1);
    }
  } else if (d.kind === 'fireball') {
    // A BALL OF FIRE rising as it swells: white at its heart, gold, orange, red, violet flickering
    // at its edge, its edge torn by flame; it rolls over into black smoke from the outside in
    const q = easeOut(Math.min(1, k / 0.3));
    const r = d.r * 16 * q * (1 + k * 0.35);
    const y = Math.round(cy - 6 - d.rise * smooth(k));
    const smoke = smooth(Math.max(0, (k - 0.35) / 0.65));
    const shrink = 1 - smoke;
    oval(g, cx, y, r + 2, r * 0.85 + 2, smoke > 0.4 ? '#1e1616' : C[1], Math.min(1, 0.7 + smoke) * (1 - Math.max(0, (k - 0.82) / 0.18)), 2, seed);
    if (smoke > 0.2) oval(g, cx, y - 2, r * 0.9, r * 0.7, '#3a2e2e', smoke * 0.8 * (1 - Math.max(0, (k - 0.82) / 0.18)), 2, seed + 9);
    oval(g, cx, y, (r + 1) * shrink, (r * 0.85 + 1) * shrink, Math.floor(d.t * 30) % 2 ? P.pu4 : C[3], 1, 2, seed + 1);
    oval(g, cx, y, r * 0.86 * shrink, r * 0.72 * shrink, '#ff8a2a', 1, 1.5, seed + 2);
    oval(g, cx, y + 1, r * 0.62 * shrink, r * 0.52 * shrink, C[4], 1, 1, seed + 3);
    oval(g, cx, y + 1, r * 0.34 * shrink, r * 0.28 * shrink, k < 0.25 ? P.white : C[5], 1, 0.5, seed + 4);
  } else if (d.kind === 'storm') {
    // A BALL OF LIGHTNING: a white heart, a lilac glow, bolts thrashing out of it
    const q = easeOut(Math.min(1, k / 0.3));
    const r = d.r * 18 * q;
    const y = cy - 8;
    const fade = 1 - Math.max(0, (k - 0.5) / 0.5);
    oval(g, cx, y, r, r * 0.75, C[2], 0.4 * fade, 2, seed, 0.5);
    oval(g, cx, y, r * 0.6, r * 0.45, C[3], 0.55 * fade, 1.5, seed + 1);
    oval(g, cx, y, r * 0.32, r * 0.26, P.white, fade, 0.5, seed + 2);
    g.globalAlpha = fade;
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * TAU;
      let px = cx;
      let py = y;
      for (let j = 1; j <= 3; j++) {
        const nx = cx + Math.cos(a) * r * 1.1 * (j / 3) + rnd(-3, 3);
        const ny = y + Math.sin(a) * r * 0.8 * (j / 3) + rnd(-3, 3);
        pline(g, px, py, nx, ny, j === 1 ? P.white : C[4]);
        px = nx;
        py = ny;
      }
    }
    g.globalAlpha = 1;
  } else {
    // A WET POP: a skin swelling and bursting, torn open from the middle, its pieces thrown out
    const q = easeOut(Math.min(1, k / 0.4));
    const r = d.r * 16 * q;
    const y = Math.round(cy - 8 - d.rise * k);
    const hole = k < 0.3 ? 0 : Math.min(0.95, (k - 0.3) / 0.6);
    const fade = 1 - Math.max(0, (k - 0.55) / 0.45);
    oval(g, cx, y, r + 1, r * 0.8 + 1, C[2], fade, 2, seed, hole);
    oval(g, cx, y, r, r * 0.8, C[3], fade, 2, seed + 1, hole);
    oval(g, cx, y, r * 0.7, r * 0.56, C[4], fade, 1.5, seed + 2, hole);
    if (hole < 0.5) oval(g, cx, y, r * 0.3, r * 0.24, P.white, fade, 0.5, seed + 3);
  }
}

export function airV3(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game): void {
  if (!VOLATILE3.on) return;
  for (const z of game.zones) if (z.kind === 'venom' && vmeldOf(z) === 'rupture') drawCloud(g, cam, t, z, game);
  for (const d of V3.domes) if (d.t >= 0) drawDome(g, cam, d);
  for (const p of V3.pillars) {
    // light thrown straight up off a rune going off (or out of an elite going off): it shoots up,
    // narrows and fades from its head down; its edges flicker
    const C = VMELD_RAMP[p.word];
    const k = p.t / p.dur;
    const cx = Math.round(wx(cam, p.x, p.y));
    const cy = Math.round(wy(cam, p.x, p.y));
    if (p.word === 'chainreaction') {
      // a bolt out of the sky: jagged, white at its heart, lilac round it, flickering
      if (k > 0.35 && k < 0.45) continue;
      const seed = Math.round(p.x * 31 + p.y * 17);
      let px = cx;
      let py = cy;
      for (let j = 1; j <= 12; j++) {
        const nx = cx + Math.round((hash2(seed, j, 3) - 0.5) * 22 * Math.min(1, j / 3));
        const ny = cy - j * 18;
        thick(g, px, py, nx, ny, C[2], 5);
        thick(g, px, py, nx, ny, C[4], 3);
        pline(g, px, py, nx, ny, P.white);
        px = nx;
        py = ny;
      }
      continue;
    }
    const w = Math.max(1, Math.round(p.w * (1 - k * 0.75)));
    const top = Math.round(220 * Math.min(1, k / 0.12));
    const band = 6;
    for (let j = 0; j < top; j += band) {
      const q = j / 220;
      const a = (1 - k) * (1 - q * 0.85);
      const wob = Math.floor(p.t * 40 + j * 0.3) % 2;
      const ww = Math.max(1, Math.round(w * (1 - q * 0.5)));
      g.globalAlpha = 0.55 * a;
      g.fillStyle = C[2];
      g.fillRect(cx - ww - 2 - wob, cy - j - band, ww * 2 + 5 + wob * 2, band);
      g.globalAlpha = 0.9 * a;
      g.fillStyle = C[4];
      g.fillRect(cx - ww, cy - j - band, ww * 2 + 1, band);
      g.globalAlpha = a;
      g.fillStyle = P.white;
      g.fillRect(cx - Math.floor(ww / 2), cy - j - band, Math.floor(ww / 2) * 2 + 1, band);
    }
    g.globalAlpha = 1;
  }
}

/** Over the effects' sparks: what flies (rubble, embers, globs, shards), the bolts, the spikes of ice, the screen's flash. */
export function overV3(g: CanvasRenderingContext2D, cam: Cam, t: number): void {
  if (!VOLATILE3.on) return;
  for (const s of V3.spikes) {
    if (s.t < 0) continue;
    const C = VMELD_RAMP.shatter;
    const k = s.t / s.dur;
    const cx = Math.round(wx(cam, s.x, s.y));
    const cy = Math.round(wy(cam, s.x, s.y));
    const up = Math.round(s.tall * easeOut(Math.min(1, k / 0.18)));
    if (k > 0.72) continue;
    // a spike of ice, its lit face, its shade, a white edge
    for (let j = 0; j < up; j++) {
      const half = Math.max(0, Math.round(s.w * (1 - j / Math.max(1, up))));
      g.fillStyle = C[2];
      g.fillRect(cx - half - 1, cy - j, 1, 1);
      g.fillStyle = C[3];
      g.fillRect(cx - half, cy - j, half + 1, 1);
      g.fillStyle = C[4];
      g.fillRect(cx + 1, cy - j, half, 1);
    }
    g.fillStyle = P.white;
    g.fillRect(cx, cy - up, 1, Math.max(1, Math.round(up * 0.6)));
  }
  for (const b of V3.lobs) {
    if (b.t < 0) continue;
    const C = VMELD_RAMP[b.word];
    const k = Math.min(1, b.t / b.dur);
    const x = b.x0 + (b.x1 - b.x0) * k;
    const y = b.y0 + (b.y1 - b.y0) * k;
    const lift = b.kind === 'shard' ? 14 : b.h * 4 * k * (1 - k) + 8 * (1 - k);
    const px = Math.round(wx(cam, x, y));
    const py = Math.round(wy(cam, x, y) - lift);
    const q = Math.max(0, k - 0.1);
    const tx = Math.round(wx(cam, b.x0 + (b.x1 - b.x0) * q, b.y0 + (b.y1 - b.y0) * q));
    const ty = Math.round(wy(cam, b.x0 + (b.x1 - b.x0) * q, b.y0 + (b.y1 - b.y0) * q) - (b.kind === 'shard' ? 14 : b.h * 4 * q * (1 - q) + 8 * (1 - q)));
    if (b.kind === 'rubble') {
      // a stone tumbling: its face turning lit and dark as it goes
      const turn = Math.floor(b.spin + b.t * 14) % 4;
      g.fillStyle = C[0];
      g.fillRect(px - 2, py - 1, b.size + 2, b.size + 1);
      g.fillStyle = turn < 2 ? C[3] : C[2];
      g.fillRect(px - 1, py - 1, b.size, b.size - (turn % 2));
      g.fillStyle = turn === 0 ? C[4] : C[2];
      g.fillRect(px - 1, py - 1, 1, 1);
    } else if (b.kind === 'ember') {
      pline(g, px, py, tx, ty, C[4]);
      g.fillStyle = C[1];
      g.fillRect(px - 1, py - 1, b.size + 1, b.size);
      g.fillStyle = Math.floor(b.t * 30) % 2 ? C[5] : C[4];
      g.fillRect(px, py - 1, b.size - 1, b.size - 1);
    } else if (b.kind === 'glob') {
      pline(g, px, py, tx, ty, C[3]);
      g.fillStyle = C[2];
      g.fillRect(px - 1, py - 1, b.size + 1, b.size + 1);
      g.fillStyle = C[4];
      g.fillRect(px - 1, py - 1, b.size, b.size);
      g.fillStyle = C[5];
      g.fillRect(px - 1, py - 1, 1, 1);
    } else {
      // a shard of ice in flight: long, pointed along its way, a white edge, a trail of glints
      const ex = Math.round(wx(cam, b.x1, b.y1)) - px;
      const ey = Math.round(wy(cam, b.x1, b.y1) - 14) - py;
      const len = Math.hypot(ex, ey) || 1;
      const ux = ex / len;
      const uy = ey / len;
      thick(g, px - ux * 9, py - uy * 9, px, py, C[3], 3);
      thick(g, px - ux * 8, py - uy * 8, px + ux * 2, py + uy * 2, C[4], 2);
      pline(g, px - ux * 6, py - uy * 6 - 1, px + ux * 3, py + uy * 3 - 1, P.white);
      g.fillStyle = C[5];
      g.fillRect(Math.round(px - ux * 14), Math.round(py - uy * 14), 1, 1);
      g.fillRect(Math.round(px - ux * 18), Math.round(py - uy * 18), 1, 1);
    }
  }
  for (const a of V3.arcs) {
    const k = a.t / a.dur;
    // (it flickers: on, a beat off, on again, then gone)
    if (a.t > a.grow && k > 0.45 && k < 0.55) continue;
    const C = a.C;
    const n = a.pts.length / 2 - 1;
    const upTo = a.grow > 0 ? Math.min(1, a.t / a.grow) * n : n;
    const core = k < 0.3 ? C[5] : k < 0.65 ? C[4] : C[3];
    for (let i = 0; i < n && i < upTo; i++) {
      const q = Math.min(1, upTo - i);
      const x0 = wx(cam, a.pts[i * 2], a.pts[i * 2 + 1]);
      const y0 = wy(cam, a.pts[i * 2], a.pts[i * 2 + 1]) - a.z;
      const x1 = wx(cam, a.pts[i * 2] + (a.pts[i * 2 + 2] - a.pts[i * 2]) * q, a.pts[i * 2 + 1] + (a.pts[i * 2 + 3] - a.pts[i * 2 + 1]) * q);
      const y1 = wy(cam, a.pts[i * 2] + (a.pts[i * 2 + 2] - a.pts[i * 2]) * q, a.pts[i * 2 + 1] + (a.pts[i * 2 + 3] - a.pts[i * 2 + 1]) * q) - a.z;
      if (k < 0.65) thick(g, x0, y0 + 1, x1, y1 + 1, C[2], a.w + 1);
      thick(g, x0, y0, x1, y1, core, a.w);
      if (a.w > 1 && k < 0.5) pline(g, x0, y0, x1, y1, P.white);
    }
    // its head, while it races out: a ball of white
    if (a.grow > 0 && a.t < a.grow) {
      const i = Math.min(n, Math.floor(upTo));
      const hx = wx(cam, a.pts[i * 2], a.pts[i * 2 + 1]);
      const hy = wy(cam, a.pts[i * 2], a.pts[i * 2 + 1]) - a.z;
      g.fillStyle = C[4];
      g.fillRect(Math.round(hx) - 2, Math.round(hy) - 2, 5, 5);
      g.fillStyle = P.white;
      g.fillRect(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3);
    }
    if (k < 0.7 && upTo >= n) {
      for (const f of a.forks) {
        for (let i = 0; i + 3 < f.pts.length; i += 2) {
          pline(g, wx(cam, f.pts[i], f.pts[i + 1]), wy(cam, f.pts[i], f.pts[i + 1]) - a.z, wx(cam, f.pts[i + 2], f.pts[i + 3]), wy(cam, f.pts[i + 2], f.pts[i + 3]) - a.z, i === 0 ? C[4] : C[3]);
        }
      }
    }
  }
  if (V3.flash.t < V3.flash.dur) {
    g.globalAlpha = V3.flash.a * (1 - V3.flash.t / V3.flash.dur);
    g.fillStyle = V3.flash.color;
    g.fillRect(0, 0, g.canvas.width, g.canvas.height);
    g.globalAlpha = 1;
  }
  void t;
}

// =============================================================================================
// The renderer's hooks.

/** Where a monster's picture is moved to, in game pixels: a blast going off beside it jolts it away, and it settles back. */
export function shiftV3(m: Monster): [number, number] {
  if (!VOLATILE3.on) return [0, 0];
  let ox = 0;
  let oy = 0;
  for (const j of V3.jolts) {
    if (j.id !== m.id) continue;
    const k = j.t / j.dur;
    const amt = j.px * (k < 0.15 ? k / 0.15 : Math.max(0, 1 - (k - 0.15) / 0.85)) * (k > 0.15 ? Math.cos((k - 0.15) * 18) : 1);
    ox += (j.dx - j.dy) * amt;
    oy += (j.dx + j.dy) * amt * 0.5;
  }
  return [Math.round(ox), Math.round(oy)];
}

/** A colour laid over a monster's picture: white for a moment as a blast, a shard or an arc strikes it. */
export function tintV3(m: Monster, t: number): [string, number] | null {
  if (!VOLATILE3.on) return null;
  const k = V3.marks.get(m.id);
  if (!k) return null;
  if (k.white < 0.1) return ['#ffffff', 0.75 * (1 - k.white / 0.1)];
  if (k.crackle > 0) return [Math.floor(t * 20) % 3 === 0 ? VMELD_RAMP.chainreaction[5] : VMELD_RAMP.chainreaction[3], Math.floor(t * 20) % 3 === 0 ? 0.5 : 0.22];
  return null;
}

/** Light: the renderer's `spot` (screen x, y, radius, strength). */
export function lightsV3(spot: (x: number, y: number, r: number, a: number) => void, cam: Cam, game: Game, t: number): void {
  if (!VOLATILE3.on) return;
  for (const z of game.zones) {
    const w = vmeldOf(z);
    if (!w) continue;
    const x = wx(cam, z.x, z.y);
    const y = wy(cam, z.x, z.y);
    if (z.kind === 'rune') {
      const k = runeK(z);
      spot(x, y - 2, 24 + z.r * 16, (0.4 + 0.45 * k) * (beatOf(k, t) ? 1 : 0.75));
    } else if (z.kind === 'burn') spot(x, y - 4, 20 + z.r * 16, (0.6 + 0.15 * Math.sin(t * 11 + z.x)) * Math.min(1, (z.dur - z.t) * 2));
    else spot(x, y - 6, 18 + z.r * 14, 0.35 * Math.min(1, (z.dur - z.t) * 2));
  }
  for (const d of V3.domes) if (d.t >= 0) spot(wx(cam, d.x, d.y), wy(cam, d.x, d.y) - 10, 40 + d.r * 40, Math.max(0, 1 - d.t / d.dur));
  for (const p of V3.pillars) spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 30, 70, 1 - p.t / p.dur);
  for (const s of V3.scars) {
    const hot = Math.max(0, 1 - s.t / (s.kind === 'crater' || s.kind === 'scorch' ? 1.4 : 0.6));
    if (hot > 0 && s.kind !== 'splat') spot(wx(cam, s.x, s.y), wy(cam, s.x, s.y) - 2, 20 + s.r * 18, 0.7 * hot);
  }
  for (const b of V3.lobs) {
    if (b.t < 0 || b.kind === 'rubble') continue;
    const k = Math.min(1, b.t / b.dur);
    spot(wx(cam, b.x0 + (b.x1 - b.x0) * k, b.y0 + (b.y1 - b.y0) * k), wy(cam, b.x0 + (b.x1 - b.x0) * k, b.y0 + (b.y1 - b.y0) * k) - 16, 14, 0.5);
  }
  for (const m of game.monsters) {
    if (m.dead) continue;
    const k = V3.marks.get(m.id);
    if (k && (k.white < 0.1 || k.crackle > 0)) spot(wx(cam, m.x, m.y), wy(cam, m.x, m.y) - FIGURE_SIZE[figureOf(m)].top * 0.5, 22, 0.55);
  }
}

// =============================================================================================
// The clock, and what the rules said happened.

let joinedLevel: unknown = null;

export function tickV3(dt: number, game: Game, fx: Fx): void {
  if (!VOLATILE3.on) return;
  if (game.level !== joinedLevel) {
    joinedLevel = game.level;
    clearV3();
  }
  V3.clock += dt;
  for (let i = V3.later.length - 1; i >= 0; i--) {
    V3.later[i].t -= dt;
    if (V3.later[i].t <= 0) {
      const fn = V3.later[i].fn;
      V3.later.splice(i, 1);
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
  age(V3.domes);
  age(V3.arcs);
  age(V3.spears);
  age(V3.spikes);
  age(V3.scars);
  age(V3.jolts);
  age(V3.pillars);
  age(V3.freezes);
  age(V3.lobs, (b) => {
    if (b.hit) b.hit();
    else if (b.kind === 'rubble') {
      // a stone comes down hard: a puff of dust, a chip off it
      const C = VMELD_RAMP.demolition;
      fling(fx, b.x1, b.y1, 3, [C[3], C[2]], { speed: 1.2, up: 40, grav: 400, life: 0.3, z: 1, size: 1 });
      puffs(fx, b.x1, b.y1, 0.05, 1, [C[3], C[2], C[1]], { up: 10, z: 1, life: 0.6 });
    }
  });
  if (V3.flash.t < 9) V3.flash.t += dt;
  for (const [id, k] of V3.marks) {
    k.white += dt;
    if (k.crackle > 0) k.crackle -= dt;
    const m = game.monsters.find((q) => q.id === id);
    if (!m || m.dead) V3.marks.delete(id);
    else if (k.crackle > 0 && Math.random() < 20 * dt) {
      const top = FIGURE_SIZE[figureOf(m)].top;
      const C = VMELD_RAMP.chainreaction;
      const z = rnd(4, top * 0.8);
      arc(m.x + rnd(-0.25, 0.25), m.y + rnd(-0.25, 0.25), m.x + rnd(-0.25, 0.25), m.y + rnd(-0.25, 0.25), C, { w: 1, dur: 0.08, wob: 0.1, z });
    }
  }
  if (V3.demo.primed.size || V3.demo.runes) demoTick(game, fx);
  const room = fx.room();
  const rate = (n: number, r: number): boolean => Math.random() < n * dt * room * Math.min(1.6, 0.5 + r * 0.6);
  for (const z of game.zones) {
    const w = vmeldOf(z);
    if (!w) continue;
    const at = (f = 0.85): [number, number] => {
      const a = Math.random() * TAU;
      const d = Math.sqrt(Math.random()) * z.r * f;
      return [z.x + Math.cos(a) * d, z.y + Math.sin(a) * d];
    };
    if (z.kind === 'rune') {
      const k = runeK(z);
      const C = VMELD_RAMP[w];
      if (w === 'demolition') {
        // dust trickling up off it, grit hopping on the floor, more as its time runs out
        if (rate(3 + k * 14, z.r)) {
          const [x, y] = at(0.9);
          add(fx, { x, y, z: 1, vx: 0, vy: 0, vz: rnd(10, 30) * (0.5 + k), life: 0.6, life0: 0.6, ramp: [C[4], C[3], C[2]], color: C[3], size: 1, grav: k > 0.6 ? 200 : -10 });
        }
        if (k > 0.5 && rate(4 * k, z.r)) {
          const [x, y] = at(0.6);
          crackle(fx, x, y, 0.3, 1);
        }
      } else if (w === 'powderkeg') {
        // the fuse's spark throwing sparks and a wisp of smoke
        const fxp = fuseAt(z, k);
        if (rate(18, 1)) add(fx, { x: fxp[0], y: fxp[1], z: 2, vx: rnd(-1.6, 1.6), vy: rnd(-1.6, 1.6), vz: rnd(40, 90), life: 0.25, color: pick([P.white, C[5], C[4], P.pu5]), size: 1, grav: 300 });
        if (rate(4, 1)) puffs(fx, fxp[0], fxp[1], 0.02, 1, ['#6a5a5a', '#4a3e3e', '#2a2222'], { up: 20, z: 3, life: 0.7 });
      } else if (w === 'shatter') {
        if (rate(2.5, z.r)) {
          const [x, y] = at(0.9);
          add(fx, { x, y, z: rnd(1, 6), vx: 0, vy: 0, vz: rnd(4, 12), life: 0.7, color: pick([C[5], C[4], P.white]), size: 1, grav: 0 });
        }
      } else if (w === 'chainreaction') {
        if (rate(3 + k * 6, z.r)) {
          const [x, y] = at(0.8);
          arc(x, y, x + rnd(-0.5, 0.5), y + rnd(-0.5, 0.5), C, { w: 1, dur: 0.1, wob: 0.15, z: rnd(2, 8) });
        }
      } else if (rate(3 + k * 10, z.r)) {
        const [x, y] = at(0.4);
        fx.bubbles(x, y, 0.1, 1);
      }
    } else if (w === 'powderkeg' && z.kind === 'burn') {
      // little flames all over it; the powder in it popping, orange and violet
      if (rate(3.2, z.r)) {
        const [x, y] = at();
        fx.flames(x, y, 0.1, 1, 1.1);
      }
      if (rate(2.6, z.r)) {
        const [x, y] = at();
        const C = VMELD_RAMP.powderkeg;
        V3.domes.push({ x, y, r: 0.18, t: 0, dur: 0.18, kind: 'fireball', word: 'powderkeg', rise: 4 });
        fling(fx, x, y, 4, [P.white, C[5], P.pu5], { speed: 2.6, up: 50, grav: 200, life: 0.2, z: 3, streak: 2, size: 1 });
      }
    } else if (w === 'rupture' && z.kind === 'venom') {
      if (rate(1.2, z.r)) {
        const [x, y] = at();
        fx.bubbles(x, y, 0.1, 1);
      }
      if (rate(0.8, z.r)) {
        const [x, y] = at(0.7);
        flash(fx, x, y, rnd(8, 18), 0.2, 0.06, [VMELD_RAMP.rupture[5], VMELD_RAMP.rupture[4], P.pu5]);
      }
    }
  }
}

/** The point on Powderkeg's ring where its fuse's spark has got to, world (x, y): the ring as drawn, round on the screen. */
function fuseAt(z: Zone, k: number): [number, number] {
  const a = -Math.PI / 2 + k * TAU;
  // (a point drawn at screen offset (cos a * r * 22.6, sin a * r * 11.3) is, in the world, (sx/32 + sy/16, sy/16 - sx/32))
  const sx = Math.cos(a) * z.r * 0.92 * 22.6;
  const sy = Math.sin(a) * z.r * 0.92 * 11.3;
  return [z.x + sx / 32 + sy / 16, z.y + sy / 16 - sx / 32];
}

/** The looks, called up by what the rules say happened this frame (main.ts, while VOLATILE3.on, before the effects take the same events). */
export function eventsV3(events: readonly unknown[], game: Game, fx: Fx): void {
  if (!VOLATILE3.on) return;
  for (const raw of events) {
    const e = raw as Seen;
    if (e.t === 'volFx') {
      const v = raw as VolFx;
      if (v.what === 'half') demolitionHalf(fx, game, v);
      else if (v.what === 'catch') powderkegCatch(fx, v);
      else if (v.what === 'shard') shatterShard(fx, v);
      else if (v.what === 'freeze') shatterFreeze(fx, game, v);
      else if (v.what === 'arc') chainArc(fx, v);
      else if (v.what === 'link') chainLink(fx, v);
      else if (v.what === 'splash') ruptureSplash(fx, v);
    } else if (e.t === 'burst' && isVMeld(e.meld)) {
      blastLook(e.meld, fx, game, e.x ?? 0, e.y ?? 0, e.r ?? 1.8, e.style === 'ruin');
    } else if (e.t === 'hit' && !e.onHero && !e.poison) {
      for (const w of e.words ?? []) if (isVMeld(w)) hitV3(w, fx, e.x ?? 0, e.y ?? 0, 0.8, false);
      if (V3.demo.carry) hitV3(V3.demo.carry, fx, e.x ?? 0, e.y ?? 0, 0.8, false);
    } else if (e.t === 'burst' && !e.echo && (e.style === 'slam' || e.style === 'nova' || e.style === 'land')) {
      for (const w of e.words ?? []) if (isVMeld(w)) hitV3(w, fx, e.x ?? 0, e.y ?? 0, e.r ?? 1, true);
    }
  }
}

/** Whether the effects should leave this event to the looks here (fx.ts): a blast or a rune going off of one of the five. */
export function ownsEventV3(e: unknown): boolean {
  if (!VOLATILE3.on) return false;
  const x = e as Seen;
  return x.t === 'burst' && isVMeld(x.meld);
}

// =============================================================================================
// What the rules will do, done by hand for the playtest's films (only while it asks: V3.demo).

/** One with `word` in front has killed a monster at (x, y): it goes off, and the word's twist follows, as his page has it. */
function demoGoOff(word: VMeldId, x: number, y: number, game: Game, fx: Fx): void {
  const r = word === 'demolition' ? 2.4 : 1.8;
  blastLook(word, fx, game, x, y, r, false);
  const near = game.monsters.filter((m) => !m.dead && Math.hypot(m.x - x, m.y - y) <= (word === 'chainreaction' ? 4.5 : r + 0.6)).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
  const fire = (what: 'catch' | 'shard' | 'arc' | 'splash', m: Monster): void => eventsV3([{ t: 'volFx', meld: word, what, id: m.id, x0: x, y0: y, x1: m.x, y1: m.y }], game, fx);
  if (word === 'powderkeg') {
    for (const m of near.slice(0, 4)) {
      fire('catch', m);
      later(0.12 + Math.hypot(m.x - x, m.y - y) * 0.06, () => {
        m.burnT = 5;
        m.burnDps = 0;
      });
    }
  } else if (word === 'shatter') {
    for (const m of near.slice(0, 5)) fire('shard', m);
  } else if (word === 'chainreaction') {
    for (const m of near.slice(0, 3)) {
      fire('arc', m);
      // (those it kills go off too)
      if (V3.demo.primed.get(m.id) === 'chainreaction') later(0.05 + Math.hypot(m.x - x, m.y - y) * 0.012, () => game.kill(m));
    }
  } else if (word === 'rupture') {
    for (const m of near.slice(0, 4)) {
      fire('splash', m);
      later(0.16 + Math.hypot(m.x - x, m.y - y) * 0.06, () => {
        m.poisonT = 5;
        m.poisonDps = 0;
        m.poisonN = 1;
      });
    }
  }
}

/** A rune of the playtest's has had its time: it goes off, and what follows follows. */
function demoRuneGo(z: Zone, word: VMeldId, game: Game, fx: Fx, chain = true): void {
  const i = game.zones.indexOf(z);
  if (i < 0) return;
  game.zones.splice(i, 1);
  V3.waits.delete(z);
  blastLook(word, fx, game, z.x, z.y, z.r, true);
  const lay = (kind: 'burn' | 'venom', r: number, secs: number): void => {
    game.zones.push({ x: z.x, y: z.y, r, t: 0, dur: secs, kind, element: 'phys', dmg: 0, slow: 0, tick: 0, hostile: false, skill: -1, words: [], from: '', look: word } as unknown as Zone);
  };
  if (word === 'powderkeg') later(0.1, () => lay('burn', z.r * 0.9, 4));
  else if (word === 'rupture') later(0.05, () => lay('venom', z.r * 1.1, 4));
  else if (word === 'shatter') {
    for (const m of game.monsters) if (!m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r) later(0.42, () => (m.frozenT = Math.min(m.frozenT, 0.05)));
  } else if (word === 'chainreaction' && chain) {
    // every rune linked to it goes off in turn, along its link
    let at = 0;
    let from = z;
    const left = game.zones.filter((o) => o.kind === 'rune' && vmeldOf(o) === 'chainreaction');
    while (left.length) {
      left.sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y));
      const next = left.shift() as Zone;
      if (Math.hypot(next.x - from.x, next.y - from.y) > VRUNE.linkReach) break;
      const f = from;
      later(at, () => eventsV3([{ t: 'volFx', meld: 'chainreaction', what: 'link', x0: f.x, y0: f.y, x1: next.x, y1: next.y }], game, fx));
      at += VRUNE.linkGap;
      later(at, () => demoRuneGo(next, 'chainreaction', game, fx, false));
      from = next;
    }
  }
}

const lastAt = new Map<number, number[]>();

function demoTick(game: Game, fx: Fx): void {
  for (const [id, word] of V3.demo.primed) {
    const m = game.monsters.find((q) => q.id === id);
    if (m && !m.dead) {
      lastAt.set(id, [m.x, m.y]);
      continue;
    }
    // (a monster killed is taken out of the game's list at once: where it was last seen)
    V3.demo.primed.delete(id);
    const at = m ? [m.x, m.y] : lastAt.get(id);
    if (!at) continue;
    later(0.12, () => demoGoOff(word, at[0], at[1], game, fx));
  }
  if (!V3.demo.runes) return;
  for (const z of [...game.zones]) {
    const wait = V3.waits.get(z);
    const word = vmeldOf(z);
    if (wait === undefined || !word || z.kind !== 'rune') continue;
    if (word === 'shatter' && z.t >= wait * VRUNE.freezeAt && !V3.demo.frozen.has(z)) {
      V3.demo.frozen.add(z);
      const ids = game.monsters.filter((m) => !m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r).map((m) => m.id);
      for (const id of ids) {
        const m = game.monsters.find((q) => q.id === id) as Monster;
        m.frozenT = wait * (1 - VRUNE.freezeAt) + 0.6;
      }
      eventsV3([{ t: 'volFx', meld: 'shatter', what: 'freeze', x: z.x, y: z.y, r: z.r, ids }], game, fx);
    }
    if (z.t >= wait) demoRuneGo(z, word, game, fx);
  }
}

// =============================================================================================
// The playtest's hands: `window.__dbg.volatile3` (main.ts). Nothing here runs unless a playtest
// calls it. With no rules for the five yet, the playtest does by hand what the rules will do: it
// lays the runes, says what went off and where, and the looks answer as they will to the rules.

export function demoV3(fx: Fx, getGame: () => Game | null) {
  const G = (): Game => {
    const g = getGame();
    if (!g) throw new Error('no game');
    return g;
  };
  return {
    switch: VOLATILE3,
    state: V3,
    /** Forget everything, for the level the game is on now (so that what is laid next is kept). */
    clear: () => {
      clearV3();
      joinedLevel = getGame()?.level ?? null;
    },
    /** Their stones, for a page's pictures. */
    rune: vmeldRune,
    /** One of the five's hit at (x, y). */
    hit: (word: VMeldId, x: number, y: number, r = 0.8, big = false) => hitV3(word, fx, x, y, r, big),
    /** A kill's explosion (or a rune's, `rune` true) at (x, y), as the rules' 'burst' will call it. */
    blast: (word: VMeldId, x: number, y: number, r = 1.8, rune = false) => blastLook(word, fx, G(), x, y, r, rune),
    /** One of the moments of their own, as the rules' 'volFx' will call it. */
    fx: (e: VolFx) => eventsV3([e], G(), fx),
    /** A rune laid at (x, y), drawn as it waits for `wait` seconds (it does nothing: no rules lay it), or a patch (`kind` 'burn' or 'venom') for `secs`. */
    lay: (word: VMeldId, kind: 'rune' | 'burn' | 'venom', x: number, y: number, r: number, secs: number) => {
      const g = G();
      const z = { x, y, r, t: 0, dur: kind === 'rune' ? 9999 : secs, kind, element: 'phys', dmg: 0, slow: 0, tick: 0, hostile: false, skill: -1, words: [], from: '', look: word } as unknown as Zone;
      g.zones.push(z);
      if (kind === 'rune') V3.waits.set(z, secs);
      return g.zones.length - 1;
    },
    /** The playtest's hands: the hero's hits carry `word` (their look); monster `id` goes off as `word`'s kill when it dies; the runes laid go off as the rules will have them. */
    carry: (word: VMeldId | null) => {
      V3.demo.carry = word;
    },
    prime: (id: number, word: VMeldId) => {
      V3.demo.primed.set(id, word);
    },
    rules: (on: boolean) => {
      V3.demo.runes = on;
    },
    /** Take the rune nearest (x, y) away (it has gone off). */
    unlay: (x: number, y: number) => {
      const g = G();
      let best = -1;
      let bd = 0.5;
      g.zones.forEach((z, i) => {
        const d = Math.hypot(z.x - x, z.y - y);
        if (z.kind === 'rune' && d < bd) {
          bd = d;
          best = i;
        }
      });
      if (best >= 0) {
        V3.waits.delete(g.zones[best]);
        g.zones.splice(best, 1);
      }
    },
  };
}
