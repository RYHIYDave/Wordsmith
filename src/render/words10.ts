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
// Step 2 (his word, 9 Nov by 16:45: “Yes, animate them (Recommended)”): every look moves at 30 a second through its beats
// (W10_BEATS), each drawn from its cause and the time since; what a held look leaves settles after its thing is gone. The film:
// docs/mockups/words10/pictures/words3_film.mp4 (tools/scenarios/words10_film.mjs, tools/words10_film.py).
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
  // a feather: its quill bare at the foot, its shaft running up to a tip that curls over; barbs off both sides of it, the vane
  // above lit, the vane below in shade, gaps in both
  fleeting: ['.....o.', '....o.o', '..oo.X.', '.o.oX.X', '.ooX.X.', '.oX.X..', 'X......'],
  // rings opening outward from a point: the bright point, a ring round it, the outer ring broken open in two arcs of lit dust,
  // a fleck thrown off it
  vast: ['.o.....', 'o.XXX..', '.X...X.', '.X.o.X.', '.X...X.', 'o.XXX.o', '.....o.'],
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
  /** ...his boost's ribbon trails this much of his path behind him (seconds at a walk: as far as he walks in it; standing, it lies along the path he walked). */
  ribbon: 1.1,
  /** Fleeting: its speed-streaks whip round this fast (radians a second); its after-images this far apart (seconds). */
  whip: 9,
  stutter: 0.05,
  /** ...its quick flares, each this long (seconds), so many at once. */
  flare: 0.09,
  /** Vast: its ring of dust, once the floor has cracked, eases out from the old edge to the new over this (most of the way in its strike), and settles over this. */
  ring: 0.34,
  ringFade: 0.3,
  /** ...its splash's ring of earth eases out over this; its dirt settles over this. */
  splash: 0.32,
  splashFade: 0.3,
  /** Fleeting: its after-images take a new place this many times a second (a stutter, not a buzz); an orb's wave bursts out in this. */
  jump: 15,
  pulse: 0.15,
};

/**
 * EACH LOOK'S BEATS (seconds), as the seven's (W7_BEATS): its build, its hit (Movement 9 where there is a strike: a held wind-up,
 * the strike itself fast and smeared, a big wind-down), and its fade. A `hit` of 0 is held: the look lies on for as long as the
 * rules keep what it is drawn from (an orb, a patch, his spin, a boost, a poison), between its build and its fade; its fade then
 * runs after the thing is gone (what it left, settling). Every look is drawn from its cause and the time since.
 */
export const W10_BEATS: Record<string, { build: number; hit: number; fade: number; is: string }> = {
  'lasting:thing': { build: 0.25, hit: 0, fade: 0.7, is: "the sand-light gathers on it as it comes (0.25); while it lasts, a band of it crawls across once in 2.6 s and a ring of its sand turns slowly round it; in the half again it gives, its sand pours out under it into a heap; as it goes, the heap is left, and blows away (0.7)" },
  'lasting:spin': { build: 0.25, hit: 0, fade: 0.7, is: "each blade's trail of sand-light draws out as the spin begins (0.25); while it spins, the trails hang, sagging, sand sifting down out of them; in the half again it gives, the sand settles in a drift round its edge; as it stops, the sand in the air falls, and the drift blows away (0.7)" },
  'lasting:patch': { build: 0.3, hit: 0, fade: 0.7, is: "the sand-light gathers over it as it is laid (0.3); a band of it crawls across; in the half again it gives, dunes drift in from its edge in rippled tongues, burying it as it ends; the dunes lie a moment after, and blow away (0.7)" },
  'lasting:boost': { build: 0.3, hit: 0, fade: 0.4, is: 'its ribbon of sand-light draws out from his back (0.3); trails along his path while it lasts, rippling and turning; frays to grains from its tail as it ends (0.4)' },
  'lasting:dot': { build: 0.25, hit: 0, fade: 0.6, is: 'his poison or burning on a monster: the sand-light gathers on it (0.25); a ring of grains turns round it, its sand pouring into a heap at its feet as the poison runs on; the heap is left as it ends, and blows away (0.6)' },
  'lasting:monster': { build: 0.25, hit: 0, fade: 0.6, is: "a monster's poison, burning or chill on him, lingering: the same, in the enemy's pink and gold" },
  'fleeting:thing': { build: 0.1, hit: 0, fade: 0.25, is: 'its after-images snap in (0.1); while it lasts they stutter to either side of it, a new place 15 times a second; streaks whip round it at 9 radians a second; at each of its waves (a third sooner) a pulse of lilac bursts out of it (0.15); as it goes, it bursts in lilac sparks (0.25)' },
  'fleeting:spin': { build: 0.08, hit: 0, fade: 0.2, is: 'a stutter of him in lilac as the spin begins; each blade traced twice behind it, streaks whipping round, while it spins; gone with a flick of sparks as it stops (0.2)' },
  'fleeting:patch': { build: 0.1, hit: 0, fade: 0.4, is: 'thin quick tongues lick up all round its edge (0.1), flickering fast, sparks shooting up and burning out; over its last 0.4 s they burn down and out, a last spray of sparks' },
  'fleeting:boost': { build: 0.06, hit: 0, fade: 0.3, is: 'lilac after-images of him a step behind him (0.06), streaks whipping round him while it lasts; they thin away as it ends (0.3)' },
  'fleeting:dot': { build: 0.03, hit: 0.06, fade: 0.27, is: 'his poison or burning on a monster, ticking fast: a little star pops on it every 0.09 s, each popping (0.03), bursting with a spark flung off (0.06), thinning away (0.27)' },
  'fleeting:monster': { build: 0.03, hit: 0.06, fade: 0.27, is: "a monster's poison or burning on him, ticking fast: the same stars, in the enemy's pink and gold" },
  'vast:front': { build: 0.06, hit: 0.14, fade: 0.5, is: 'held: the floor cracks along where its edge was, the cracks running round, dust puffing up (0.06); the strike: a bank of dust shoved out to its new edge, smeared, grit and clods flung past it (0.14); the wind-down: it rolls the last of the way, settles, the grit falling back, the cracks dimming (0.5)' },
  'vast:behind': { build: 0.06, hit: 0.16, fade: 0.55, is: 'held: the floor heaves under the one struck, rocks torn up out of it (0.06); the strike: a ring of earth runs out to its reach and a rock arcs to each one near on a trail of lit dust, smeared (0.16); the wind-down: each lands in a fountain of dirt, clods falling back, the dust settling (0.55)' },
  'vast:monster': { build: 0.2, hit: 0, fade: 0.12, is: "its warning widens out from its old reach to its new (0.2): held, the old reach a broken ring of pink, pink dust shoved outward, gold barbs on its new edge beating, for the rules' warning; it snaps out as the blow lands (0.12)" },
};
const BEAT = W10_BEATS;
/** The whole of a look made by an event: its build, its hit and its fade. */
export const w10Life = (key: string): number => BEAT[key].build + BEAT[key].hit + BEAT[key].fade;

// =============================================================================================
// What is going on.

/** One moment at work (a ring of dust, a splash, what a held look leaves as its thing goes): its own clock, where it is (world), whom it is about. */
export interface Act10 {
  id: number;
  word: W10Word;
  /** 'ring' (Vast in front: an area's edge pushed out), 'splash' (Vast behind), 'after' (what a held look leaves, settling: `what`). */
  kind: 'ring' | 'splash' | 'after';
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
  /** 'after': what is left: 'heap' (Lasting's sand under a thing or a monster), 'dunes' (on a patch), 'drift' (round a spin), 'sparks' (Fleeting's, bursting off what goes). */
  what: '' | 'heap' | 'dunes' | 'drift' | 'sparks';
  /** 'after': how far its sand had come (0..1); how high off the floor it was (pixels); 'ring': laid by a whirlwind's turn. */
  p: number;
  whirl: boolean;
  /** 'after': in the enemy's colours (a monster's on him). */
  enemy: boolean;
  /** 'after' of a spin: where its blades were (the angle of the lead, radians) as it stopped. */
  lead: number;
}

/** A held look as it was last drawn: what is left of it as its thing goes. */
interface Held {
  word: 'lasting' | 'fleeting';
  kind: 'thing' | 'patch' | 'spin';
  x: number;
  y: number;
  up: number;
  rad: number;
  r: number;
  t: number;
  p: number;
  seed: number;
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
  /** The held looks as last seen (by what made them), so that what each leaves settles after it; and when each state began (a boost, a poison). */
  held: new Map<string, Held>(),
  since: new Map<string, number>(),
  lastStates: new Map<string, { word: 'lasting' | 'fleeting'; x: number; y: number; p: number; enemy: boolean }>(),
};

export function clearW10(): void {
  W10.acts.length = 0;
  W10.trail.length = 0;
  W10.seen.length = 0;
  W10.laidTrail = null;
  W10.held.clear();
  W10.since.clear();
  W10.lastStates.clear();
}

export type W10Options = Partial<Omit<Act10, 'id' | 'word' | 'kind' | 'seed'>> & { seed?: number };

/** A moment begins. */
export function playW10(word: W10Word, kind: Act10['kind'], o: W10Options): Act10 {
  const a: Act10 = {
    id: W10.next++,
    word,
    kind,
    t: o.t ?? 0,
    dur: o.dur ?? (kind === 'ring' ? w10Life('vast:front') : kind === 'splash' ? w10Life('vast:behind') : 1),
    seed: o.seed ?? Math.floor(Math.random() * 1e6),
    x: o.x ?? 0,
    y: o.y ?? 0,
    r: o.r ?? 1,
    r0: o.r0 ?? (o.r ?? 1) / (1 + VAST.wider),
    z: o.z ?? 0,
    to: o.to ?? [],
    what: o.what ?? '',
    p: o.p ?? 0,
    whirl: o.whirl ?? false,
    enemy: o.enemy ?? false,
    lead: o.lead ?? 0,
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
/** Fast, then slow: a strike's run and its long wind-down. */
const strikeOut = (q: number): number => 1 - (1 - clamp01(q)) ** 4;

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
/**
 * The same for a grain that moves: whether grain (i, j) is in, by its own place in the look, not the screen's. So it keeps
 * its place as the look turns, runs or falls, and does not boil from one picture to the next.
 */
const grain = (i: number, j: number, a: number, seed = 91): boolean => a > hash2(Math.round(i), Math.round(j), seed);

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
    // (its tail thinned by its own steps, counted from its head, so a streak in flight keeps its shape)
    if (q < 0.3 && !grain(n - s, 1, q / 0.3 + 0.2, 7)) continue;
    if (alpha < 1 && !grain(n - s, 2, alpha, 8)) continue;
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
  cx = Math.round(cx);
  cy = Math.round(cy);
  for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++) {
      const e = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      if (e > 1) continue;
      const u = (dx / rx) * 0.72 + (dy / ry) * 0.7;
      const d = Math.abs(u - band);
      const inBand = d < 0.36 ? 1 - d / 0.36 : 0;
      // the grains: the same grains, drifting down a pixel at a time (their hash taken where they were, on the thing: they go with it)
      const h = hash2(dx, dy - fall, seed + 7);
      const p = (base + 0.85 * inBand) * amount * (1 - e * 0.35);
      if (h >= p) continue;
      dot(g, cx + dx, cy + dy, inBand > 0.7 ? C[5] : inBand > 0.25 ? C[4] : C[3]);
    }
  }
}

/** A heap of sand on the floor at (x, y), `p` of the way to its whole size: a mound, lit on its left, its foot dark, a grain glinting on its top. */
function heap(g: CanvasRenderingContext2D, x: number, y: number, p: number, C: readonly string[] = W10_RAMP.lasting, keep = 1, seed = 5): void {
  if (p <= 0.02) return;
  const w = 3 + p * 8;
  const h = 1.4 + p * 3;
  for (let row = 0; row < Math.ceil(h); row++) {
    const q = row / h;
    const half = (w / 2) * (1 - Math.pow(q, 1.5));
    for (let dx = -Math.round(half); dx <= Math.round(half); dx++) {
      // (as it blows away: its grains go from its top and its windward side first)
      if (keep < 1 && !grain(dx, row, keep * (1.25 - q * 0.5 - (dx / Math.max(1, half)) * 0.25), seed)) continue;
      const side = dx / Math.max(1, half);
      const c = row === 0 ? (side > 0.3 ? C[1] : C[2]) : side < -0.3 ? C[4] : side > 0.45 ? C[2] : C[3];
      dot(g, x + dx, y - row, c);
    }
  }
  if (keep > 0.6) dot(g, x - 1, y - Math.ceil(h) + 1, C[5]);
}

/** A heap blowing away (`out` 0..1 of its going): its grains lifted off it and carried away on the air, falling as they go. */
function blownSand(g: CanvasRenderingContext2D, x: number, y: number, p: number, out: number, seed: number, C: readonly string[] = W10_RAMP.lasting, n = 10): void {
  for (let i = 0; i < n; i++) {
    const off = hash2(i, 1, seed) * 0.5;
    const k = clamp01((out - off) / 0.5);
    if (k <= 0 || k >= 1) continue;
    const sx = x + (hash2(i, 2, seed) - 0.5) * (3 + p * 8);
    const sy = y - 1 - hash2(i, 3, seed) * (1 + p * 3);
    const gx = sx + k * (8 + hash2(i, 4, seed) * 10);
    const gy = sy - Math.sin(k * Math.PI) * (3 + hash2(i, 5, seed) * 4) + k * 2;
    dot(g, gx, gy, k < 0.5 ? C[4] : C[3]);
  }
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
      // (each grain its own, going round with the ring)
      if (!grain(i, band, amount * (0.25 + v) * (near ? 1 : 0.6), seed + band)) continue;
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
    // (the heap stays as it goes: it is left, and blows away, after it: its 'after')
    heap(g, cx, fy0, p);
  }
}

/**
 * Lasting on a patch of ground (burning ground, a cloud's floor, a frozen patch, thorns): the band of sand-light crawling over
 * it; in the time Lasting gave it, sand drifting in over it from its edge in tongues, rippled into little dunes, burying it as
 * its end comes.
 */
function lastingPatch(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, seed: number, p: number, fade: number): void {
  const C = W10_RAMP.lasting;
  sandOver(g, cx, cy - 1, r * RX * 0.92, r * RY * 0.92, t, seed, 0.85 * fade, C, 0.04);
  if (p <= 0) return;
  dunes(g, cx, cy, r, t, seed, p, 1);
}

/**
 * The dunes of Lasting's sand drifting in over a patch from its edge (`p` how far they have come), rippled, the ripples creeping
 * in as the sand drifts; `keep` (0..1) as they blow away after it, from their inner edge out.
 */
function dunes(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, seed: number, p: number, keep: number): void {
  const C = W10_RAMP.lasting;
  const rx = r * RX;
  const ry = r * RY;
  cx = Math.round(cx);
  cy = Math.round(cy);
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
      if (!grain(dx, dy, Math.min(1, 0.15 + k * 1.5) * (keep < 1 ? clamp01(keep * 1.6 - (1 - k) * 0.6) : 1), seed + 3)) continue;
      // its ripples, along its edge: the crest lit, its lee dark; creeping inward as the sand drifts in
      const ph = ((((outer - e) * Math.max(rx, 8) * 0.36 + vnoise(a * 6, 1, seed + 1) * 1.8 - t * 0.9) % 2.6) + 2.6) % 2.6;
      dot(g, cx + dx, cy + dy, ph < 0.55 ? C[4] : ph < 1.15 ? C[2] : C[3]);
    }
  }
}

/**
 * Lasting on his whirlwind: a long trail of sand-light lingering behind each of its two blades (the game's: render/fx.ts, two
 * crescents chasing each other round him with fx.clock), sagging as it hangs, sand sifting down out of it, each grain falling
 * straight from where the trail let it go; in the time Lasting gave the spin, the sand settled in a drift on the floor round its
 * edge. `age`: how long it has spun (its trails draw out over its build).
 */
function lastingSpin(g: CanvasRenderingContext2D, cam: Cam, hx: number, hy: number, r: number, t: number, clock: number, seed: number, p: number, layer: 'floor' | 'air', age = 9): void {
  const C = W10_RAMP.lasting;
  if (layer === 'floor') {
    if (p > 0) drift(g, cam, hx, hy, r, p, seed, 1);
    return;
  }
  const lead0 = clock * TAU * 2.6;
  const grown = clamp01(age / BEAT['lasting:spin'].build);
  for (const half of [0, Math.PI]) {
    for (let u = 0; u < grown; u += 0.005) {
      const behind = 1.75 + u * 2.4;
      const a = lead0 + half - behind;
      const rr = r * (0.97 + 0.05 * vnoise(u * 30, 2, seed));
      const [px, py0] = S(cam, hx + Math.cos(a) * rr, hy + Math.sin(a) * rr, 10);
      const py = py0 + u * u * 7;
      // (each grain of the trail its own, by how far behind the blade it hangs: it goes round with it)
      if (!grain(u * 200, half, Math.pow(1 - u, 0.8) * 1.1, seed + 2)) continue;
      dot(g, px, py, u < 0.22 ? C[5] : C[4]);
      if (u < 0.65) dot(g, px, py + 1, u < 0.3 ? C[4] : C[3]);
    }
    // sand sifting down out of it: each grain let go where the trail was as it fell, falling straight, then another
    for (let i = 0; i < 22; i++) {
      const P = 0.9;
      const ph = t / P + hash2(i, seed, 4);
      const k = ph - Math.floor(ph);
      const gen = Math.floor(ph);
      const u = hash2(i, gen, 3) * 0.85;
      if (u > grown || k * P > age) continue;
      const a = lead0 - k * P * TAU * 2.6 + half - (1.75 + u * 2.4);
      const [px, py] = S(cam, hx + Math.cos(a) * r, hy + Math.sin(a) * r, 10 - k * 12);
      dot(g, px, py + u * u * 7, k < 0.5 ? C[4] : C[3]);
    }
  }
}

/** Lasting's sand settled in a drift round a spin's edge (`p` how much has settled; `keep` as it blows away after). */
function drift(g: CanvasRenderingContext2D, cam: Cam, hx: number, hy: number, r: number, p: number, seed: number, keep: number): void {
  const C = W10_RAMP.lasting;
  const n = Math.round(r * RX * 7);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const thick = 1 + Math.round((1.5 + 2 * vnoise(a * 4, 0, seed)) * p);
    for (let j = 0; j < thick; j++) {
      const rr = r * (1.02 - j * 0.035);
      const [px, py] = S(cam, hx + Math.cos(a) * rr, hy + Math.sin(a) * rr);
      if (!grain(i, j, (0.35 + 0.6 * p) * (keep < 1 ? clamp01(keep * 1.5 - (j / thick) * 0.5) : 1), seed + j)) continue;
      dot(g, px, py, j === thick - 1 ? C[4] : j === 0 ? C[2] : C[3]);
    }
  }
}

/**
 * A boost Lasting gave him (Power's might, Swift's haste, Frenzy's hold, Guarding's shield): its glow drawn out behind him in a
 * long ribbon of sand-light along his path, rippling, turning as it trails (its underside darker where it turns over), fraying
 * into grains at its tail. `pts`: screen points from his back (first) to its tail.
 */
function ribbon(g: CanvasRenderingContext2D, pts: [number, number][], t: number, seed: number, grown: number, fray: number, C: readonly string[] = W10_RAMP.lasting): void {
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
      // (it draws out from his back as the boost begins)
      if (q > grown) return;
      const x = x0 + ((x1 - x0) * k) / n;
      const y = y0 + ((y1 - y0) * k) / n;
      const wave = Math.sin(at * 0.19 - t * 3.1) * 4.5 * Math.min(1, q * 2.5) + Math.sin(at * 0.07 - t * 1.3) * 2 * q;
      const twist = Math.cos(at * 0.15 - t * 2.2);
      const wide = Math.max(0, Math.round(Math.abs(twist) * 2.8 * (1 - q * 0.5)));
      const yy = y + wave;
      // (its tail thinning; as the boost ends, fraying away from its tail toward him)
      const keep = (q > 0.6 ? 1 - (q - 0.6) / 0.4 : 1) * (fray > 0 ? clamp01((1 - fray - q) / 0.3) : 1);
      const A = Math.round(at);
      // grains frayed off it, falling (more of them where it is fraying)
      const fraying = fray > 0 && keep < 0.9;
      const loose = fraying ? 0.2 : q > 0.35 ? 0.08 : 0;
      if (loose > 0 && hash2(A, 3, seed + 4) < loose) {
        // (each grain its own fall and drift, so the loose ones scatter, never a dotted line under it)
        const h1 = hash2(A, 1, seed + 5);
        const h2 = hash2(A, 7, seed + 5);
        const fallen = fraying ? clamp01(fray * 2.2 - q * 0.6 + h1 * 0.4) * (5 + h2 * 16) : ((t * 0.7 + h1) % 1) * (6 + h2 * 8);
        const drift = (h2 - 0.5) * 8 * (fraying ? fray : 0.4) + fallen * 0.3;
        if (grain(A, 2, fraying ? 1 - fray * 0.85 : keep, seed + 6)) dot(g, x + 1 + drift, yy + wide + 2 + fallen, h1 < 0.5 ? C[4] : C[3]);
      }
      if (keep <= 0 || (keep < 1 && !grain(A, 0, keep, seed))) continue;
      const top = twist > 0;
      // a face of it: the upper edge catching the light, the body, the lower edge in shade
      dot(g, x, yy - wide, top ? C[5] : C[4]);
      for (let w = -wide + 1; w <= wide; w++) {
        // (light through it: its body a little see-through, more so toward its tail)
        if (w > -wide + 1 && w < wide && !grain(A, w + 10, 0.85 - q * 0.35, seed + 9)) continue;
        dot(g, x, yy + w, w === wide ? (top ? C[3] : C[2]) : top ? (w <= -wide + 2 ? C[5] : C[4]) : C[3]);
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
function lastingOnIt(g: CanvasRenderingContext2D, cx: number, cy: number, top: number, t: number, seed: number, p: number, C: readonly string[] = W10_RAMP.lasting, amt = 1): void {
  sandOver(g, cx, cy - top * 0.5, 6, top * 0.45, t, seed, 0.9 * amt, C, 0.03);
  sandRing(g, cx, cy - top * 0.42, 4, t, seed, 0.9 * amt, C);
  pour(g, cx + 5, cy - top * 0.35, cy - Math.round(1.4 + (0.3 + 0.7 * p) * 3), t, seed, amt, C);
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
      // (each streak's grains its own, counted from its head: it whips round whole)
      if (!grain(steps - k, i, (0.15 + 0.85 * q) * fade, seed + i)) continue;
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
  // (it pops and bursts in its first quarter, W10_BEATS 'fleeting:dot' 0.03 and 0.06 of its 0.36, and thins away after)
  const r = k < 0.25 ? 2 + k * 9.6 : 4.4 * (1 - (k - 0.25) / 0.75) + 0.6;
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
function ticks(g: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, t: number, seed: number, n: number, C: readonly string[], from = -1e9): void {
  const beat = Math.floor(t / W10_TIME.flare);
  for (let i = 0; i < n; i++) {
    const b = beat - i;
    // (only the stars of this poison: none from before it began)
    if (b * W10_TIME.flare < from - W10_TIME.flare) continue;
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
function fleetingPatch(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number, seed: number, fade: number, layer: 'floor' | 'air', tall = 1): void {
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
      licks(g, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, t, seed + i, fade, tall);
    }
    return;
  }
  const n = Math.round(rx * 1.4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (hash2(i, seed, 1) - 0.5) * 0.25;
    if (Math.sin(a) <= 0) continue;
    const d = 0.86 + 0.14 * hash2(i, seed, 2);
    licks(g, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, t, seed + i, fade, tall);
  }
  // (sparks shooting up: fewer as it burns out)
  for (let i = 0; i < Math.round(16 * tall); i++) {
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
function licks(g: CanvasRenderingContext2D, x: number, y: number, t: number, seed: number, fade: number, tall = 1): void {
  const C = W10_RAMP.fleeting;
  // (`tall`: as it burns out, its tongues burn down)
  const h = Math.round((-1 + 9 * vnoise(seed * 0.7, t * 18, seed)) * tall);
  if (h < 3) return;
  const lean = (vnoise(seed * 1.3, t * 14, seed + 1) - 0.5) * 5;
  for (let s = 0; s < h; s++) {
    const q = s / h;
    const px = x + lean * q * q;
    if (!grain(s, 3, fade, seed)) continue;
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
function fleetingSpin(g: CanvasRenderingContext2D, cam: Cam, hx: number, hy: number, r: number, t: number, clock: number, seed: number, amt = 1): void {
  const C = W10_RAMP.fleeting;
  const lead0 = clock * TAU * 2.6;
  for (const half of [0, Math.PI]) {
    for (let e = 1; e <= 2; e++) {
      const at = lead0 + half - e * 0.7;
      for (let u = 0; u < 1; u += 0.012) {
        const a = at - u * 0.9;
        const [px, py] = S(cam, hx + Math.cos(a) * r, hy + Math.sin(a) * r, 10);
        // (each trace's grains its own, by how far behind its blade: it goes round whole)
        if (!grain(u * 83, e + (half ? 2 : 0), (1 - u) * (e === 1 ? 1 : 0.65) * amt, seed + e)) continue;
        dot(g, px, py, u < 0.12 ? C[5] : u < 0.3 ? C[3] : C[2]);
        if (u < 0.55) dot(g, px, py + 1, u < 0.25 ? C[2] : C[1]);
      }
    }
  }
  const [cx, cy] = S(cam, hx, hy, 10);
  whips(g, cx, cy, r * RX * 1.08, r * RY * 1.08, clock * 1.6, seed, 8, amt);
  whips(g, cx, cy + 4, r * RX * 0.72, r * RY * 0.72, clock * 1.3 + 0.4, seed + 5, 5, 0.9 * amt);
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
 * it, its lip lit; gaps between. `spread` (0..1): the cracks running round from three places as the floor gives (its build).
 */
function oldEdge(g: CanvasRenderingContext2D, cx: number, cy: number, r0: number, fade: number, seed: number, back: boolean, spread = 1): void {
  const n = Math.round(r0 * RX * 6.5);
  const from = [hash2(1, seed, 21), hash2(2, seed, 21), hash2(3, seed, 21)].map((q) => q * TAU);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    if (Math.sin(a) < 0 !== back) continue;
    // runs of crack, and gaps between them
    if (vnoise(i * 0.09, 1, seed) < 0.48) continue;
    if (spread < 1) {
      const off = Math.min(...from.map((f) => Math.abs(((a - f + TAU * 1.5) % TAU) - Math.PI)));
      if (off > spread * (Math.PI / 3 + 0.2)) continue;
    }
    const j = (vnoise(i * 0.6, 3, seed + 1) - 0.5) * 3;
    const x = cx + Math.cos(a) * (r0 * RX + j);
    const y = cy + Math.sin(a) * (r0 * RY + j * 0.5);
    if (!grain(i, 4, fade, seed)) continue;
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
 * Vast in front: a ring of dust rolled out to an area's new edge, `age` seconds in, by its beats (W10_BEATS 'vast:front'): held,
 * the floor cracking along where its edge was (`r0`, tiles), the cracks running round, dust puffing up off them; the strike, a
 * bank of churned dust shoved out to the new edge `r` (most of the way in its 0.14 s), smeared, grit and clods flung on past it;
 * the wind-down, rolling the last of the way, settling, the grit falling back, the cracks dimming. Only the half of it behind
 * the figures (`back`) or before them.
 */
function dustRing(g: CanvasRenderingContext2D, cx: number, cy: number, r0: number, r: number, age: number, fade: number, seed: number, t: number, back: boolean, z = 0, dust = 1): void {
  const B = BEAT['vast:front'];
  const C = W10_RAMP.vast;
  const crack = clamp01(age / B.build);
  const k = age < B.build ? 0 : strikeOut((age - B.build) / W10_TIME.ring);
  const rr = r0 + (r - r0) * k;
  if (z === 0 && r0 > 0.3) oldEdge(g, cx, cy, r0, Math.min(1, fade * 1.4), seed, back, crack);
  if (age < B.build) {
    // (held: dust puffing up off the cracks as they run)
    bank(g, cx, cy, r0, 0, crack * 0.75 * fade, seed, t, back, z, dust * (0.5 + 0.3 * crack), crack);
    return;
  }
  // the strike: smeared, the bank's path from the old edge out to where it is now streaked with its dust
  const smear = clamp01(1 - (age - B.build) / B.hit);
  if (smear > 0 && rr - r0 > 0.05) {
    const n = Math.max(16, Math.round(rr * 16));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + hash2(i, seed, 31) * 0.3;
      if (Math.sin(a) < 0 !== back) continue;
      if (!grain(i, 5, smear * 0.9, seed + 31)) continue;
      const d0 = r0 + (rr - r0) * (0.25 + 0.3 * hash2(i, seed, 32));
      streak(g, cx + Math.cos(a) * d0 * RX, cy + Math.sin(a) * d0 * RY - 1 - z, cx + Math.cos(a) * rr * RX * 0.97, cy + Math.sin(a) * rr * RY * 0.97 - 1 - z, [DUST[2], DUST[3], C[3], C[4]], 2, smear);
    }
  }
  bank(g, cx, cy, rr, k, fade, seed, t, back, z, dust, 1);
}

/**
 * The bank of dust at an area's edge (`rr`, tiles, `k` 0..1 how far its run has come): churned dust rolling at its front, a broken
 * edge of lit dust, streaks of it shoved outward, grit and clods flung on past it, falling back. `front` (0..1): how much of its lit
 * edge and its grit shows (none while the floor is still cracking).
 */
function bank(g: CanvasRenderingContext2D, cx: number, cy: number, rr: number, k: number, fade: number, seed: number, t: number, back: boolean, z: number, dust: number, front: number): void {
  const C = W10_RAMP.vast;
  const puffs = Math.max(10, Math.round(rr * 10));
  for (let i = 0; i < puffs; i++) {
    const a = (i / puffs) * TAU + hash2(i, seed, 1) * 0.25;
    if (Math.sin(a) < 0 !== back) continue;
    const big = 0.7 + hash2(i, seed, 2) * 0.6;
    // (settling: lower and flatter as its run ends)
    mist(g, cx + Math.cos(a) * rr * RX * 0.94, cy + Math.sin(a) * rr * RY * 0.94 - 2 - z + k * 1, (4 + rr * 1.5) * big * dust * (1 + 0.15 * k), (2 + rr * 0.7) * big * dust * (1 - 0.2 * k), [DUST[1], DUST[2], DUST[3], C[3], C[4]], (1.05 - 0.35 * k) * fade, seed + i, t, 0.35);
  }
  if (front <= 0) return;
  // its front: a broken edge of lit dust, streaks of it shoved outward
  const n = Math.max(30, Math.round(rr * RX * 7));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    if (Math.sin(a) < 0 !== back) continue;
    const v = vnoise(i * 0.15, t * 3, seed + 4);
    if (v < 0.3) continue;
    const x = cx + Math.cos(a) * rr * RX;
    const y = cy + Math.sin(a) * rr * RY - z;
    if (!grain(i, 6, fade * front, seed + 5)) continue;
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
    if (!grain(i, 7, fade * front, seed + 6)) continue;
    if (i % 4 === 0) clod(g, x, y, EARTH, i % 8 === 0);
    else streak(g, x - Math.cos(a) * 4, y - Math.sin(a) * 2 + 1, x, y, [EARTH[1], EARTH[2], EARTH[4]], 1);
  }
}

/**
 * Vast behind: a quarter of a hit splashed onto those near it, by its beats (W10_BEATS 'vast:behind'). Held: the floor heaves
 * under the one struck, cracks running out short, a rock torn up out of it for each one near. The strike: from what was struck a
 * ring of earth runs out to the splash's reach (its dust low, so as not to hide them), the floor bursting up along the way to each
 * one near, and a rock arcs to each on a trail of lit dust, smeared. The wind-down: on each, a fountain of dirt as it lands,
 * clods falling back, the dust settling.
 */
function splash(g: CanvasRenderingContext2D, cam: Cam, a: Act10, layer: 'floor' | 'air'): void {
  const B = BEAT['vast:behind'];
  const C = W10_RAMP.vast;
  const [cx, cy] = S(cam, a.x, a.y);
  const heave = clamp01(a.t / B.build);
  const k = a.t < B.build ? 0 : strikeOut((a.t - B.build) / W10_TIME.splash);
  const fly = clamp01((a.t - B.build) / B.hit);
  const fade = clamp01((a.dur - a.t) / W10_TIME.splashFade);
  const R = a.r * k;
  const back = layer === 'floor';
  if (a.t < B.build) {
    // held: the floor heaves under it, a mound of earth bulging up, cracks running out short from it
    if (back) {
      for (let i = 0; i < 6; i++) {
        const an = (i / 6) * TAU + hash2(i, a.seed, 41) * 0.6;
        const L = (3 + hash2(i, a.seed, 42) * 5) * heave;
        for (let s2 = 2; s2 < 2 + L; s2++) dot(g, cx + Math.cos(an) * s2 * 1.6 + (hash2(i, s2, a.seed) - 0.5), cy + Math.sin(an) * s2 * 0.8, EARTH[0]);
      }
    } else {
      const h = Math.round(1 + heave * 2);
      for (let row = 0; row < h; row++) {
        const half = Math.round((6 - row * 2) * (0.6 + 0.4 * heave));
        for (let dx = -half; dx <= half; dx++) dot(g, cx + dx, cy + 2 - row, row === h - 1 ? (dx < 0 ? C[5] : C[4]) : dx < -half / 2 ? EARTH[4] : EARTH[2]);
      }
    }
  }
  // the ring of earth-coloured force heaving out from it, Vast's own ring (its dust lower, so the near ones stand clear in it)
  if (a.t >= B.build) bank(g, cx, cy, Math.max(0.2, R), Math.min(1, k * 1.1), fade * (1 - 0.35 * k), a.seed, a.t, back, 0, 0.75, 1);
  // its front: a ridge of earth heaved up off the floor as it runs out, lit along its crest, clods popping up off it
  if (R > 0.2) {
    const n = Math.max(30, Math.round(R * RX * 7));
    for (let i = 0; i < n; i++) {
      const an = (i / n) * TAU;
      if (Math.sin(an) < 0 !== back) continue;
      const v = vnoise(i * 0.22, 2, a.seed + 9);
      if (v < 0.22) continue;
      const x = cx + Math.cos(an) * R * RX;
      const y = cy + Math.sin(an) * R * RY;
      if (!grain(i, 8, fade * (1 - 0.3 * k) + 0.1, a.seed + 2)) continue;
      const up = v > 0.55 ? 3 : 2;
      dot(g, x, y, EARTH[1]);
      dot(g, x, y - 1, EARTH[3]);
      if (up > 2) dot(g, x, y - 2, EARTH[4]);
      dot(g, x, y - up, v > 0.7 ? C[5] : C[4]);
    }
    for (let i = 0; i < 12; i++) {
      const an = hash2(i, a.seed, 11) * TAU;
      if (Math.sin(an) < 0 !== back) continue;
      const pop = Math.sin(clamp01(k * 1.3 - hash2(i, a.seed, 12) * 0.3) * Math.PI) * (3 + hash2(i, a.seed, 13) * 5);
      clod(g, cx + Math.cos(an) * R * RX * 1.04, cy + Math.sin(an) * R * RY * 1.04 - 2 - pop, EARTH, i % 3 === 0);
    }
  }
  if (layer === 'floor') {
    // the floor cracked out from where it was struck, and burst up along the way to each one near (as its rock flies)
    a.to.forEach((o, j) => {
      const [tx, ty] = S(cam, o.x, o.y);
      const L = Math.hypot(tx - cx, ty - cy);
      for (let s2 = 4; s2 < L * fly; s2 += 1) {
        const q = s2 / L;
        // (a crack, not a ruled line: it zigzags, a kink every few pixels, up to three off its way, and breaks now and then)
        const k0 = Math.floor(s2 / 5);
        const f = (s2 - k0 * 5) / 5;
        const off = (n: number): number => (n <= 0 ? 0 : (hash2(n, j, a.seed + 71) - 0.5) * 6);
        const wob = off(k0) + (off(k0 + 1) - off(k0)) * f;
        if (hash2(k0, j, a.seed + 72) < 0.12) continue;
        const x = cx + (tx - cx) * q - ((ty - cy) / L) * wob;
        const y = cy + (ty - cy) * q + ((tx - cx) / L) * wob * 0.5;
        if (!grain(s2, j + 20, fade, a.seed + j)) continue;
        dot(g, x, y, EARTH[0]);
        // the heave running along it: earth up at its head
        const head = L * fly - s2;
        if (head < 5 && fly < 1) {
          dot(g, x, y - 1, EARTH[3]);
          dot(g, x, y - 2, C[4]);
        } else if (hash2(Math.round(s2), j, a.seed) < 0.3) dot(g, x, y - 1, EARTH[2]);
      }
    });
    return;
  }
  // a rock thrown to each one near (held: torn up out of the floor; the strike: arcing on a trail of lit dust); a burst of dirt as it lands
  a.to.forEach((o, j) => {
    const [tx, ty] = S(cam, o.x, o.y, Math.min(10, o.top * 0.35));
    const arc = (q: number): [number, number] => [cx + (tx - cx) * q, cy - 3 + (ty - cy + 3) * q - Math.sin(q * Math.PI) * 13];
    if (a.t < B.build) {
      // (torn up out of the floor at its foot, rising)
      const [px, py] = arc(0.04);
      rock(g, px, py + 3 - heave * 3, true);
      return;
    }
    if (fly < 1) {
      // its arc: a trail of lit dust behind it, smeared, crumbs shed off it, the rock at its head
      const tail = 0.55;
      for (let q = Math.max(0, fly - tail); q < fly; q += 0.012) {
        const [px, py] = arc(q);
        const k2 = (q - (fly - tail)) / tail;
        if (!grain(Math.round((fly - q) * 200), j + 30, (0.45 + 0.55 * k2) * fade, a.seed + j)) continue;
        dot(g, px, py - 1, k2 > 0.6 ? C[5] : C[4]);
        dot(g, px, py, k2 > 0.75 ? C[5] : k2 > 0.4 ? C[4] : EARTH[4]);
        if (k2 > 0.25) dot(g, px, py + 1, k2 > 0.7 ? C[4] : EARTH[3]);
        if (k2 > 0.55) dot(g, px, py + 2, EARTH[2]);
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
    const since = a.t - B.build - B.hit;
    const kk = clamp01(since / 0.35);
    // it bursts on it: a fountain of dirt thrown up and out round it, lit, a puff of dust, clods falling back
    if (kk < 0.55) for (let i = 0; i < 9; i++) {
      const an = -Math.PI / 2 + ((i / 8) - 0.5) * 2.6 + (hash2(i, a.seed + j, 6) - 0.5) * 0.3;
      const L0 = 2 + kk * 9;
      const L1 = L0 + (6 + hash2(i, a.seed + j, 7) * 5) * (1 - kk / 0.55);
      streak(g, tx + Math.cos(an) * L0, ty + 2 + Math.sin(an) * L0 * 0.8, tx + Math.cos(an) * L1, ty + 2 + Math.sin(an) * L1 * 0.8, [EARTH[2], EARTH[4], C[4], C[5]], i % 2 ? 2 : 1, fade);
    }
    mist(g, tx, ty + 3, 5 + kk * 5, 2.5 + kk * 2, [DUST[1], DUST[2], DUST[3], C[4]], 0.9 * fade * (1 - kk), a.seed + j, a.t, 0.8);
    for (let i = 0; i < 9; i++) {
      const an = hash2(i, a.seed + j, 3) * TAU;
      const d = 2 + kk * 14 * (0.6 + 0.4 * hash2(i, a.seed + j, 4));
      const up = Math.sin(kk * Math.PI) * (4 + hash2(i, a.seed + j, 5) * 5);
      if (kk >= 1 && !grain(i, j + 40, fade, a.seed)) continue;
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
/** Each of the rules' patches its own number for as long as it lies (known by itself, not by where it lies). */
const zoneIds = new WeakMap<object, number>();
let zoneNext = 1;
const zoneId = (z: object): number => {
  let n = zoneIds.get(z);
  if (n === undefined) {
    n = zoneNext++;
    zoneIds.set(z, n);
  }
  return n;
};

/** A held look now: what Lasting or Fleeting holds of his (each thing an ability made, by its `skill`), and what of it to draw. */
interface HeldNow {
  key: string;
  word: 'lasting' | 'fleeting';
  kind: 'thing' | 'patch' | 'spin';
  x: number;
  y: number;
  up: number;
  rad: number;
  r: number;
  t: number;
  life: number;
  last: number;
  seed: number;
  /** An orb: its own number, and its waves' clock as the rules keep it (`next`, counted down from `every`). */
  orb: { id: number; next: number; every: number } | null;
}

function heldThings(game: Game): HeldNow[] {
  const out: HeldNow[] = [];
  const G = game as unknown as { orbs?: { id: number; x: number; y: number; t: number; life: number; next: number; skill: number }[]; familiars?: { id: number; x: number; y: number; t: number; life: number; skill: number }[]; contraptions?: { id: number; x: number; y: number; t: number; skill: number }[] };
  const pace = (i: number): number => (game.hero.skills[i]?.r as { pace?: number } | undefined)?.pace ?? 1;
  for (const o of G.orbs ?? []) {
    const w = timeWord(game, o.skill);
    if (w) out.push({ key: `orb:${o.id}`, word: w, kind: 'thing', x: o.x, y: o.y, up: 13, rad: 6, r: 0, t: o.t, life: o.life, last: lastOf(game, o.skill), seed: o.id * 13 + 1, orb: { id: o.id, next: o.next, every: TUNE.orbEvery / pace(o.skill) } });
  }
  for (const q of G.familiars ?? []) {
    const w = timeWord(game, q.skill);
    if (w) out.push({ key: `fam:${q.id}`, word: w, kind: 'thing', x: q.x, y: q.y, up: 14, rad: 3, r: 0, t: q.t, life: q.life, last: lastOf(game, q.skill), seed: q.id * 13 + 2, orb: null });
  }
  for (const c of G.contraptions ?? []) {
    const w = timeWord(game, c.skill);
    if (w) out.push({ key: `con:${c.id}`, word: w, kind: 'thing', x: c.x, y: c.y, up: 6, rad: 5, r: 0, t: c.t, life: 99, last: lastOf(game, c.skill), seed: c.id * 13 + 3, orb: null });
  }
  for (const raw of game.zones) {
    const z = raw as unknown as ZoneLike;
    if (z.hostile || z.skill === undefined || z.skill < 0 || z.kind === 'warn' || z.kind === 'mirror' || z.kind === 'reaper') continue;
    const w = timeWord(game, z.skill);
    if (w) out.push({ key: `zone:${zoneId(raw)}`, word: w, kind: 'patch', x: z.x, y: z.y, up: 0, rad: 0, r: z.r, t: z.t, life: z.dur, last: lastOf(game, z.skill), seed: zoneSeed(z), orb: null });
  }
  const ch = game.hero.channel;
  const s = ch ? game.hero.skills[ch.skill] : null;
  if (ch && s && SKILLS[s.id].kind === 'whirl') {
    const w = timeWord(game, ch.skill);
    const def = SKILLS[s.id];
    if (w) out.push({ key: 'spin', word: w, kind: 'spin', x: game.hero.x, y: game.hero.y, up: 10, rad: 0, r: def.radius * ((s.r as { size?: number }).size ?? 1), t: ch.t, life: (def.channel ?? 2.4) * lastOf(game, ch.skill), last: lastOf(game, ch.skill), seed: 77, orb: null });
  }
  return out;
}

/**
 * An orb as the game draws it (render.ts, its loop of orbs): it swells as its next wave gathers, shrinks in its last half second,
 * and bobs; so what is drawn on it goes with it. `rt`: the renderer's clock.
 */
function orbLook(o: { id: number; next: number }, t: number, life: number, rt: number): { scale: number; bob: number } {
  const born = Math.min(1, t / 0.12);
  const gather = 1 - clamp01(o.next / TUNE.orbEvery);
  const left = life - t;
  const dying = left < 0.5 ? Math.max(0, left / 0.5) : 1;
  return { scale: (0.5 + 0.5 * born) * (0.9 + 0.18 * gather * gather) * (0.65 + 0.35 * dying), bob: Math.sin(rt * 2.6 + o.id) * 1.5 };
}

/**
 * Fleeting on an orb: its waves come a third sooner, and each shows: as the next gathers, a rim of light tightening round it,
 * flickering, brighter as it comes; at each wave a pulse of lilac bursting out of it (W10_TIME.pulse).
 */
function pulse(g: CanvasRenderingContext2D, cx: number, cy: number, rad: number, next: number, every: number, amt: number, seed: number): void {
  const C = W10_RAMP.fleeting;
  const since = every - next;
  const q = clamp01(1 - next / every);
  if (since < W10_TIME.pulse) {
    const k = since / W10_TIME.pulse;
    const R = rad + 2 + strikeOut(k) * 16;
    const n = Math.round(R * 5);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      if (!grain(i, Math.floor(R), (1 - k) * amt * 1.1, seed + 51)) continue;
      dot(g, cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.62, k < 0.35 ? C[5] : k < 0.7 ? C[3] : C[2]);
    }
  }
  if (q > 0.55) {
    const k = (q - 0.55) / 0.45;
    const R = rad + 3 - k * 1.5;
    const n = Math.round(R * 6);
    const flick = Math.floor(W10.clock * 30);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      if (!grain(i, flick, k * 0.8 * amt, seed + 52)) continue;
      dot(g, cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.9, k > 0.7 ? C[5] : C[3]);
    }
  }
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

/** What he left on a monster, its word by the ability that last struck it, and how long since it began (W10.since). */
function dotsOn(game: Game): { m: Monster; word: 'lasting' | 'fleeting'; left: number }[] {
  const out: { m: Monster; word: 'lasting' | 'fleeting'; left: number }[] = [];
  for (const m of game.monsters) {
    if (m.dead) continue;
    const left = Math.max(m.poisonT ?? 0, m.burnT ?? 0);
    if (left <= 0) continue;
    const w = timeWord(game, (m as { lastSkill?: number }).lastSkill ?? -1);
    if (w) out.push({ m, word: w, left });
  }
  return out;
}

/** A monster's poison, burning or chill on him, lingering (Lasting) or ticking fast (Fleeting): which, and how long it has left. */
function onHim(game: Game): { word: 'lasting' | 'fleeting'; left: number } | null {
  const h = game.hero;
  const left = Math.max(h.poisonT ?? 0, h.burnT ?? 0, h.chillT ?? 0);
  if (left <= 0) return null;
  if (nearCarrier(game, 'lasting')) return { word: 'lasting', left };
  if (nearCarrier(game, 'fleeting') && Math.max(h.poisonT ?? 0, h.burnT ?? 0) > 0) return { word: 'fleeting', left: Math.max(h.poisonT ?? 0, h.burnT ?? 0) };
  return null;
}
const sinceOf = (key: string): number => W10.clock - (W10.since.get(key) ?? W10.clock);

function drawHeld(g: CanvasRenderingContext2D, cam: Cam, game: Game, layer: 'floor' | 'air', here: (x: number, y: number) => boolean, rt: number): void {
  const t = W10.clock;
  const clock = W10.fx ? (W10.fx as unknown as { clock: number }).clock : t;
  for (const it of heldThings(game)) {
    if (!here(it.x, it.y)) continue;
    const B = BEAT[`${it.word}:${it.kind}`];
    const [sx, sy] = S(cam, it.x, it.y);
    const p = it.word === 'lasting' ? lastStretch(it.t, it.life, it.last) : 0;
    // (its build, as it comes; and its own last moments, as it goes: what it leaves after is its 'after', drawn from W10.acts)
    const inA = clamp01(it.t / B.build);
    const endA = clamp01((it.life - it.t) / 0.35);
    if (it.kind === 'thing') {
      if (layer !== 'air') continue;
      let up = it.up;
      let rad = it.rad;
      if (it.orb) {
        const o = orbLook(it.orb, it.t, it.life, rt);
        up = 13 - o.bob;
        rad = 6 * o.scale;
      }
      if (it.word === 'lasting') lastingThing(g, sx, sy, up, rad, t, it.seed, p, inA * endA);
      else {
        // (Fleeting: its after-images are its own picture, thingW10; the streaks whipping round it, and its quickened pulse, here)
        whips(g, sx, sy - up, rad + 6, rad + 3, t, it.seed, 5, inA * endA);
        if (it.orb) pulse(g, sx, sy - up, rad, it.orb.next, it.orb.every, inA * endA, it.seed);
      }
    } else if (it.kind === 'patch') {
      // (Lasting's lies on the floor under the figures; Fleeting's tongues stand round its edge, behind them and before)
      if (it.word === 'lasting') {
        if (layer === 'floor') lastingPatch(g, sx, sy, it.r, t, it.seed, p, inA * endA);
      } else fleetingPatch(g, sx, sy, it.r, t, it.seed, inA, layer, clamp01((it.life - it.t) / B.fade));
    } else if (it.kind === 'spin') {
      if (it.word === 'lasting') lastingSpin(g, cam, it.x, it.y, it.r, t, clock, it.seed, p, layer, it.t);
      else if (layer === 'air') fleetingSpin(g, cam, it.x, it.y, it.r, t, clock, it.seed, inA);
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
    const B = BEAT[`${b.word}:boost`];
    const age = sinceOf('boost');
    if (b.word === 'lasting') ribbon(g, ribbonPts(cam, game), t, 31, clamp01(age / B.build), 1 - clamp01(b.left / B.fade));
    else whips(g, hx, hy - 12, 11, 14, t, 43, 4, clamp01(age / B.build) * clamp01(b.left / B.fade));
  }
  // what he left on monsters, Lasting or Fleeting by the ability that last struck each
  if (layer === 'air') {
    for (const d of dotsOn(game)) {
      const m = d.m;
      const [mx, my] = S(cam, m.x, m.y);
      if (d.word === 'lasting') {
        const amt = clamp01(sinceOf(`dot:${m.id}`) / BEAT['lasting:dot'].build) * clamp01(d.left / 0.3);
        lastingOnIt(g, mx, my, topOf(m), t, m.id * 7 + 1, clamp01(1 - d.left / (TUNE.poisonTime * (1 + LASTING.longer))), W10_RAMP.lasting, amt);
      } else ticks(g, mx, my - 3, 12, topOf(m) - 6, t, m.id * 7 + 2, 4, W10_RAMP.fleeting, W10.since.get(`dot:${m.id}`));
    }
  }
  // a monster's poison, burning or chill on him: lingering (Lasting) or ticking fast (Fleeting), in the enemy's colours
  const sick = layer === 'air' ? onHim(game) : null;
  if (sick) {
    if (sick.word === 'lasting') {
      const amt = clamp01(sinceOf('him') / BEAT['lasting:monster'].build) * clamp01(sick.left / 0.3);
      lastingOnIt(g, hx, hy, HERO_TOP, t, 51, clamp01(1 - sick.left / (TUNE.poisonTime * (1 + LASTING.monster))), W10_ENEMY, amt);
    } else ticks(g, hx, hy - 3, 13, HERO_TOP - 6, t, 53, 5, W10_ENEMY, W10.since.get('him'));
  }
  // a monster's warning drawn wider (Vast on it): widening out from its old reach over its build, held, snapping out as it lands
  for (const raw of game.zones) {
    const z = raw as unknown as ZoneLike & { half?: { words?: readonly string[] } };
    if (z.kind !== 'warn' || !(z.words ?? []).includes('vast')) continue;
    const B = BEAT['vast:monster'];
    const share = (z.half?.words ?? []).includes('vast') ? 0.5 : 1;
    const [cx, cy] = S(cam, z.x, z.y);
    const r0 = z.r / (1 + VAST.monster * share);
    const rNow = r0 + (z.r - r0) * easeOut(z.t / B.build);
    const fade = clamp01(z.t / 0.08) * clamp01((z.dur - z.t) / B.fade);
    wideWarn(g, cx, cy, r0, rNow, t + z.t, zoneSeed(z), fade, layer === 'floor');
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
  // (as much of his path as he walks in W10_TIME.ribbon: when he stops, it lies on along the way he came, not drawn in)
  const most = W10_TIME.ribbon * ((h as unknown as { d?: { speed?: number } }).d?.speed ?? 4.6);
  let len = 0;
  let walked = 0;
  let wx0 = h.x;
  let wy0 = h.y;
  for (let i = W10.trail.length - 1; i >= 0; i--) {
    const p = W10.trail[i];
    walked += Math.hypot(p.x - wx0, p.y - wy0);
    wx0 = p.x;
    wy0 = p.y;
    if (walked > most) break;
    const sp = S(cam, p.x, p.y, 13);
    const last = out[out.length - 1];
    len += Math.hypot(sp[0] - last[0], sp[1] - last[1]);
    if (Math.hypot(sp[0] - last[0], sp[1] - last[1]) >= 2) out.push(sp);
  }
  // (where he has stood still, it hangs back from him the way he faces, sagging)
  if (len < 30) {
    const [bx, by] = out[out.length - 1];
    const back = h.fx - h.fy >= 0 ? -1 : 1;
    const more = Math.round((30 - len) / 4);
    for (let i = 1; i <= more; i++) out.push([bx + back * i * 4, by + i * 1.4 + i * i * 0.08]);
  }
  return out;
}

/** Under the figures (render.ts, with the floor's patches). */
export function floorW10(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game, here: (x: number, y: number) => boolean): void {
  if (!WORDS10_LOOK.on) return;
  drawHeld(g, cam, game, 'floor', here, t);
  drawStates(g, cam, game, 'floor');
  for (const a of W10.acts) if (here(a.x, a.y)) drawAct(g, cam, a, 'floor');
}

/** Over the figures (drawn after the dark, so it glows). */
export function airW10(g: CanvasRenderingContext2D, cam: Cam, t: number, game: Game): void {
  if (!WORDS10_LOOK.on) return;
  drawHeld(g, cam, game, 'air', () => true, t);
  drawStates(g, cam, game, 'air');
  for (const a of W10.acts) drawAct(g, cam, a, 'air');
}

function drawAct(g: CanvasRenderingContext2D, cam: Cam, a: Act10, layer: 'floor' | 'air'): void {
  if (a.kind === 'splash') return splash(g, cam, a, layer);
  if (a.kind === 'after') return drawAfter(g, cam, a, layer);
  const [cx, cy] = S(cam, a.x, a.y);
  const fade = clamp01((a.dur - a.t) / W10_TIME.ringFade);
  dustRing(g, cx, cy, a.r0, a.r, a.t, fade, a.seed, a.t, layer === 'floor', a.z);
}

/** What a held look leaves as its thing goes, settling over its fade (W10_BEATS): Lasting's sand blowing away, Fleeting's last sparks. */
function drawAfter(g: CanvasRenderingContext2D, cam: Cam, a: Act10, layer: 'floor' | 'air'): void {
  const out = clamp01(a.t / a.dur);
  const keep = 1 - out;
  const [sx, sy] = S(cam, a.x, a.y);
  const L = a.enemy ? W10_ENEMY : W10_RAMP.lasting;
  if (a.what === 'heap') {
    // (r0: its place off the thing's foot, in pixels: under a thing 0, at a monster's or his feet 5)
    if (layer !== 'air') return;
    heap(g, sx + a.r0, sy + (a.r0 ? 1 : 0), a.p, L, keep, a.seed);
    blownSand(g, sx + a.r0, sy + (a.r0 ? 1 : 0), a.p, out, a.seed, L);
  } else if (a.what === 'dunes') {
    if (layer === 'floor') dunes(g, sx, sy, a.r, W10.clock, a.seed, a.p, keep);
    else for (let i = 0; i < 6; i++) {
      const an = hash2(i, a.seed, 61) * TAU;
      blownSand(g, sx + Math.cos(an) * a.r * RX * 0.9, sy + Math.sin(an) * a.r * RY * 0.9, 0.6, out, a.seed + i, L, 4);
    }
  } else if (a.what === 'drift') {
    if (layer === 'floor') drift(g, cam, a.x, a.y, a.r, Math.max(0.3, a.p), a.seed, keep);
    else {
      // the sand that hung in the blades' trails falls to the floor as the spin stops
      const C = W10_RAMP.lasting;
      for (const half of [0, Math.PI]) {
        for (let i = 0; i < 26; i++) {
          const u = hash2(i, a.seed, 62) * 0.9;
          const k = clamp01((a.t - hash2(i, a.seed, 63) * 0.1) / (0.3 + u * 0.15));
          if (k >= 1) continue;
          const an = a.lead + half - (1.75 + u * 2.4);
          const [px, py] = S(cam, a.x + Math.cos(an) * a.r, a.y + Math.sin(an) * a.r, 10 * (1 - k * k));
          dot(g, px, py + u * u * 7 * (1 - k), k < 0.5 ? C[4] : C[3]);
        }
      }
    }
  } else if (a.what === 'sparks') {
    // Fleeting's last: a flick of lilac sparks flung off it as it goes, quick, burning out
    if (layer !== 'air') return;
    const C = W10_RAMP.fleeting;
    const n = a.r > 0 ? Math.max(8, Math.round(a.r * 8)) : 8;
    for (let i = 0; i < n; i++) {
      const an = (i / n) * TAU + hash2(i, a.seed, 64) * 0.6;
      const k = strikeOut(out);
      let x0: number;
      let y0: number;
      let dx: number;
      let dy: number;
      if (a.r > 0) {
        x0 = sx + Math.cos(an) * a.r * RX;
        y0 = sy + Math.sin(an) * a.r * RY - a.z;
        dx = Math.cos(an) * 4;
        dy = -10 - hash2(i, a.seed, 65) * 8;
      } else {
        x0 = sx + Math.cos(an) * a.p;
        y0 = sy - a.z + Math.sin(an) * a.p * 0.6;
        dx = Math.cos(an) * 14;
        dy = Math.sin(an) * 9 - 3;
      }
      const hx = x0 + dx * k;
      const hy = y0 + dy * k;
      streak(g, x0 + dx * k * 0.55, y0 + dy * k * 0.55, hx, hy, [C[1], C[2], C[3], C[5]], 1, keep * 1.2);
    }
  }
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
  // (its moments: the dust of a ring or a splash lit as it goes; what a held look leaves, dimly)
  for (const a of W10.acts) {
    const [ax, ay] = S(cam, a.x, a.y);
    const fade = clamp01((a.dur - a.t) / 0.4);
    spot(ax, ay - 4, a.kind === 'after' ? 16 + a.r * 14 : 24 + a.r * 22, (a.kind === 'after' ? 0.3 : 0.55) * fade);
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
  // (his pictures as drawn over the last moments, however many a second are drawn: enough for his after-images)
  while (W10.seen.length > 240 || (W10.seen.length > 1 && W10.clock - W10.seen[0].at > 0.4)) W10.seen.shift();
  const b = game ? boosts(game) : null;
  const ch = game?.hero.channel;
  const spin = !!game && !!ch && SKILLS[game.hero.skills[ch.skill]?.id]?.kind === 'whirl' && timeWord(game, ch.skill) === 'fleeting';
  const out: { sp: Sprite; x: number; y: number; depth: number; alpha: number }[] = [];
  const C = W10_RAMP.fleeting;
  if (spin && ch) {
    // (his spin quickened: a stutter of him round where he turns, each a turn of the blade behind)
    const clock = W10.fx ? (W10.fx as unknown as { clock: number }).clock : W10.clock;
    const inA = clamp01(ch.t / BEAT['fleeting:spin'].build);
    for (let e = 1; e <= 2; e++) {
      const a = clock * TAU * 2.6 - e * 1.1;
      out.push({ sp: tinted(sp, e === 1 ? C[2] : C[1]), x: Math.round(sx + Math.cos(a) * 5), y: Math.round(sy + Math.sin(a) * 2.5), depth: h.x + h.y - 0.01 * e, alpha: (0.62 - e * 0.16) * inA });
    }
    return out;
  }
  if (!b || b.word !== 'fleeting') return out;
  const B = BEAT['fleeting:boost'];
  const amt = clamp01(sinceOf('boost') / B.build) * clamp01(b.left / B.fade);
  for (let e = 1; e <= 3; e++) {
    const was = [...W10.seen].reverse().find((q) => W10.clock - q.at >= e * W10_TIME.stutter - 1e-6);
    let x = was ? wx(cam, was.x, was.y) : sx;
    let y = was ? wy(cam, was.x, was.y) : sy;
    const d = Math.hypot(x - sx, y - sy);
    if (d < e * 2) {
      // (standing: a step back from him, the way he faces, each further)
      const back = h.fx - h.fy >= 0 ? -1 : 1;
      x = sx + back * e * 5;
      y = sy + e * 0.5;
    } else if (d < e * 9) {
      // (walking: where he was, but at least a step back along his way, each further, so that each shows clear of him)
      x = sx + ((x - sx) / d) * e * 9;
      y = sy + ((y - sy) / d) * e * 9;
    }
    out.push({ sp: tinted(was ? was.sp : sp, e === 1 ? C[2] : C[1]), x: Math.round(x), y: Math.round(y), depth: h.x + h.y - 0.01 * e, alpha: amt * (0.9 - e * 0.2) });
  }
  return out;
}

/**
 * A thing an ability made, as the renderer draws it (render.ts, the orb: its picture and where): while Fleeting is on its
 * ability, a stutter of after-images of it in its lilac, jumping to either side of it (a new place W10_TIME.jump times a
 * second), thinner each.
 */
export function thingW10(game: Game, skill: number, id: number, sp: Sprite, x: number, y: number): { sp: Sprite; x: number; y: number; alpha: number }[] {
  if (!WORDS10_LOOK.on || timeWord(game, skill) !== 'fleeting') return [];
  const C = W10_RAMP.fleeting;
  const o = ((game as unknown as { orbs?: { id: number; t: number; life: number }[] }).orbs ?? []).find((q) => q.id === id);
  const amt = o ? clamp01(o.t / BEAT['fleeting:thing'].build) * clamp01((o.life - o.t) / 0.35) : 1;
  const beat = Math.floor((W10.fx ? (W10.fx as unknown as { clock: number }).clock : W10.clock) * W10_TIME.jump);
  const out: { sp: Sprite; x: number; y: number; alpha: number }[] = [];
  for (let e = 1; e <= 2; e++) {
    const side = (beat + e + id) % 2 === 0 ? 1 : -1;
    out.push({ sp: tinted(sp, e === 1 ? C[2] : C[1]), x: Math.round(x + side * (2 + e * 2)), y: Math.round(y + (e === 1 ? 1 : -1)), alpha: (e === 1 ? 0.6 : 0.4) * amt });
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
  // (his path kept as far back as the ribbon could want it)
  let kept = 0;
  for (let i = W10.trail.length - 1; i > 0; i--) {
    kept += Math.hypot(W10.trail[i].x - W10.trail[i - 1].x, W10.trail[i].y - W10.trail[i - 1].y);
    if (kept > 12) {
      W10.trail.splice(0, i);
      break;
    }
  }
  // the held looks: what each leaves as its thing goes (its fade), and when each state began (its build)
  const now = new Map<string, Held>();
  for (const it of heldThings(game)) {
    const p = it.word === 'lasting' ? lastStretch(it.t, it.life, it.last) : 0;
    const rad = it.orb ? 6 * orbLook(it.orb, it.t, it.life, 0).scale : it.rad;
    now.set(it.key, { word: it.word, kind: it.kind, x: it.x, y: it.y, up: it.up, rad, r: it.r, t: it.t, p, seed: it.seed });
  }
  const lead = (fx as unknown as { clock: number }).clock * TAU * 2.6;
  for (const [key, was] of W10.held) {
    if (now.has(key) || was.t < 0.15) continue;
    const dur = BEAT[`${was.word}:${was.kind}`].fade;
    if (was.word === 'lasting') {
      if (was.kind === 'thing' && was.p > 0.05) playW10('lasting', 'after', { what: 'heap', x: was.x, y: was.y, p: was.p, r0: 0, dur, seed: was.seed });
      else if (was.kind === 'patch' && was.p > 0.05) playW10('lasting', 'after', { what: 'dunes', x: was.x, y: was.y, r: was.r, p: was.p, dur, seed: was.seed });
      else if (was.kind === 'spin') playW10('lasting', 'after', { what: 'drift', x: was.x, y: was.y, r: was.r, p: was.p, lead, dur, seed: was.seed });
    } else {
      playW10('fleeting', 'after', { what: 'sparks', x: was.x, y: was.y, r: was.kind === 'thing' ? 0 : was.r, p: was.rad + 2, z: was.up, dur, seed: was.seed });
    }
  }
  W10.held = now;
  // (a boost on him; his poison on each monster; a monster's on him: when each began, and what Lasting's leaves as it ends)
  const states = new Map<string, { word: 'lasting' | 'fleeting'; x: number; y: number; p: number; enemy: boolean }>();
  const b = boosts(game);
  if (b) states.set('boost', { word: b.word, x: h.x, y: h.y, p: 0, enemy: false });
  for (const d of dotsOn(game)) states.set(`dot:${d.m.id}`, { word: d.word, x: d.m.x, y: d.m.y, p: 0.3 + 0.7 * clamp01(1 - d.left / (TUNE.poisonTime * (1 + LASTING.longer))), enemy: false });
  const sick = onHim(game);
  if (sick) states.set('him', { word: sick.word, x: h.x, y: h.y, p: 0.3 + 0.7 * clamp01(1 - sick.left / (TUNE.poisonTime * (1 + LASTING.monster))), enemy: true });
  for (const [key, st] of states) if (!W10.since.has(key)) W10.since.set(key, W10.clock);
  for (const key of [...W10.since.keys()]) {
    if (states.has(key)) continue;
    const was = W10.lastStates.get(key);
    if (was && was.word === 'lasting' && key !== 'boost') playW10('lasting', 'after', { what: 'heap', x: was.x, y: was.y, p: was.p, r0: 5, enemy: was.enemy, dur: BEAT[was.enemy ? 'lasting:monster' : 'lasting:dot'].fade, seed: key.length * 31 + Math.round(was.x * 7) });
    W10.since.delete(key);
  }
  W10.lastStates = states;
}

// =============================================================================================
// What the rules said happened (main.ts, while WORDS10_LOOK.on). Everything is read gently: a field missing has a fallback,
// and an event of another shape is passed over.

type Seen = { t: string; x?: number; y?: number; r?: number; style?: string; words?: readonly string[]; kind?: string; ids?: number[] };

export function eventsW10(events: readonly unknown[], game: Game, fx: Fx): void {
  if (!WORDS10_LOOK.on) return;
  for (const raw of events) {
    const e = raw as Seen;
    if (e.t === 'burst' && e.x !== undefined && e.y !== undefined) {
      // VAST behind: the rules' splash (a 'shock' burst its reach wide, his own); or the splash by its own name, if sent
      if (e.style === 'shock' && Math.abs((e.r ?? 0) - VAST.splashR) < 1e-6 && !(e.words ?? []).length) {
        playSplash(game, e.x, e.y, e.r ?? VAST.splashR);
        continue;
      }
      // VAST in front: an area of his landing wider, its dust rolled out to its new edge (a whirlwind's turns come three or four
      // a second: a ring at a time, a new one as the last is winding down)
      if ((e.words ?? []).includes('vast') && (e.r ?? 0) > 0.3) {
        const whirl = e.style === 'whirl';
        if (whirl && W10.acts.some((a) => a.kind === 'ring' && a.whirl && a.t < 0.45)) continue;
        playW10('vast', 'ring', { x: e.x, y: e.y, r: e.r, r0: (e.r ?? 1) / (1 + VAST.wider), whirl });
      }
    } else if (e.t === 'vastSplash' && e.x !== undefined && e.y !== undefined) {
      playSplash(game, e.x, e.y, e.r ?? VAST.splashR, e.ids);
    } else if (e.t === 'zone' && e.x !== undefined && e.y !== undefined) {
      // a patch of his laid wider by Vast in front: its dust rolled out to its edge as it is laid
      const z = game.zones.find((q) => !q.hostile && Math.abs(q.x - (e.x ?? 0)) < 1e-6 && Math.abs(q.y - (e.y ?? 0)) < 1e-6);
      if (z && z.skill >= 0 && fronts(game, z.skill).includes('vast')) playW10('vast', 'ring', { x: z.x, y: z.y, r: z.r, r0: z.r / (1 + VAST.wider) });
    }
  }
  void fx;
}

function playSplash(game: Game, x: number, y: number, r: number, ids?: number[]): Act10 {
  const to = game.monsters
    .filter((m) => !m.dead && (ids ? ids.includes(m.id) : Math.hypot(m.x - x, m.y - y) > 0.3 && Math.hypot(m.x - x, m.y - y) <= r + m.r))
    .map((m) => ({ x: m.x, y: m.y, top: topOf(m) }));
  return playW10('vast', 'splash', { x, y, r, to });
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
    /** Each look's beats (seconds), for the film's notes. */
    beats: W10_BEATS,
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
