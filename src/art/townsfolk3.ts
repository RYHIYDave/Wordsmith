// THE TOWN'S PEOPLE, SCULPTED AND MOVING AT THIRTY A SECOND (the townsfolk chat, 11 Nov 2026). ON, with his yes of 11 Nov
// 2026, shown them in the game's own town: “Yes, hand them to main (Recommended)”; and his words to the main chat that day,
// 16:56: “The redrawn townfolks should be done”. With TOWNSFOLK3.on off the town's people are the ones painted in
// art/townsfolk.ts (and art/smith3.ts).
//
// His words, 8 Nov 2026, 06:25: “And I think the townsfolk need look update and a 30fps makeover”. The four are the art in
// src/dev/sculpt_townsfolk.ts (who each is, kept; how each is made, the Brawler's) and src/dev/townsfolk_moves.ts (their
// loops and what each does now and then, a pose at every thirtieth of a second). This file only turns those into the frames
// the town shows (art/townsfolk.ts Townsman).
//
// THEIR FRAMES COME FROM FILES (the townsfolk bake chat, 11 Nov 2026): a frame of theirs is a tenth to a third of a second to
// paint and there are 2,584 of them, so they are painted once, as the game is built (tools/bake_townsfolk.mjs), and taken in
// from files beside the page as the town is come into (render/townsfolk_baked.ts). WHERE THOSE FILES ARE NOT TO BE HAD (a page
// opened from a file, a page built without them, the unit tests, a sheet that will not load) THE TOWN'S PEOPLE ARE AS THEY
// WERE, the ones of art/townsfolk.ts: townsfolk3Shown(). Nothing paints them where the game is played.
//
// TRULY TURNED: each of the four ways along the grid is the figure turned round, never its picture flipped (the hammer
// stays in the hand that holds it, the light still falls from the upper left). The stranger never leaves his wall: turned
// to someone, only his eyes go to them.

import type { Light, Sprite } from '../engine/px';
import { lazyFrames, toSprite } from './kit';
import type { Facing, Townsfolk, Townsman } from './townsfolk';
import { TOWN_CANVAS, paintFigure, sculptArmourer, sculptMystic, sculptStranger, sculptWordsmith } from '../dev/sculpt_townsfolk';
import type { TownFigure } from '../dev/sculpt_townsfolk';
import { ARMOURER_MOVES, MYSTIC_MOVES, STRANGER_MOVES, TFPS, WORDSMITH_MOVES, strangerWatching } from '../dev/townsfolk_moves';
import type { TownMoves } from '../dev/townsfolk_moves';

/** The switch: the town's four people sculpted, at thirty a second; or as they were. ON at his yes (above). */
export const TOWNSFOLK3 = { on: true };
/**
 * Whether their frames are left to the files where the game is played (art/kit.ts HEAVY: a frame not come yet is shown as the
 * nearest of its list that has): on, as the game needs; off for the bake and for the pictures and films made of them (every
 * frame painted when first asked for, so each picture is the true moment).
 */
export const TOWNSFOLK3_HEAVY = { on: true };
/**
 * Whether their frames baked to files are to be had here (render/townsfolk_baked.ts; main.ts says so as the game starts, and
 * says no again if they will not load).
 */
export const TOWNSFOLK3_FILES = { had: false };

/**
 * ARE THE SCULPTED FOUR THE TOWN'S PEOPLE HERE? With the switch on, where their frames can be had: from the files, or painted
 * as they are asked for (TOWNSFOLK3_HEAVY off: the bake itself, the pictures and films). Elsewhere the town's people are as
 * they were (art/townsfolk.ts makeTownsfolk).
 */
export function townsfolk3Shown(): boolean {
  return TOWNSFOLK3.on && (TOWNSFOLK3_FILES.had || !TOWNSFOLK3_HEAVY.on);
}

/** How far each way along the grid is turned from facing down the screen to the right. */
export const FACING_TURN3: Record<Facing, number> = { se: 0, sw: -90, ne: 90, nw: 180 };

/** Their pool of light: the friend's cyan, as the town's people have always had (the stranger has none: he keeps to the dark). */
const AURA: Light = { x: TOWN_CANVAS.ax - 4, y: TOWN_CANVAS.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
/** The wordsmith's: a little wider (he is bigger, and he burns); and a dim one while his ring is dark. */
const AURA_SMITH: Light = { x: TOWN_CANVAS.ax - 4, y: TOWN_CANVAS.ay - 34, r: 56, color: '#28dcf0', a: 0.24 };
const AURA_DARK: Light = { ...AURA_SMITH, r: 36, a: 0.1 };

const spriteOf = (fig: TownFigure, aura: Light | null): Sprite => toSprite(paintFigure(fig), aura, TOWN_CANVAS.ax, TOWN_CANVAS.ay);

/**
 * WHEN EACH ONE'S SOUND IS HEARD, in seconds into what he does now and then (render/render.ts folkSound; the sounds are the
 * sound chat's fourth batch, each a blow, a flare, a ring that begins at once): the anvil as the hammer LANDS (frame 26, 0.87 s),
 * the crystal as it BLAZES (frame 34, 1.13 s), the coin as it is FLICKED (frame 16, 0.53 s; caught at 1.53 s, which has no
 * sound of its own). The wordsmith's are as they were: his rune written as he begins, driven in half way through.
 */
const SOUND_BEAT = ['lands', 'blaze', 'flick'] as const;
function soundAt(moves: TownMoves<unknown>): number {
  // (the wordsmith's beats have a `lands` of their own, the rune into the slab: his sounds are not moved)
  if (moves === (WORDSMITH_MOVES as unknown)) return 0;
  for (const b of SOUND_BEAT) if (typeof moves.beats[b] === 'number') return moves.beats[b] / TFPS;
  return 0;
}

/** One of them as the town has its people: the loop facing their work, what they do now and then, and the loop turned to whoever comes up. */
function townsman<P>(moves: TownMoves<P>, work: Facing, sculpt: (p: P, turn: number) => TownFigure, aura: Light | null): Townsman {
  // (`stand`, art/kit.ts lazyFrames: until a frame of the act or of a turned loop has come from the files, the loop at their
  // work is shown in its place, and nothing is painted where the game is played: the loops at work come first, under the
  // loading screen, and the rest a moment after: render/townsfolk_baked.ts)
  const loop = (to: Facing, stand?: () => Sprite[]): Sprite[] => lazyFrames(moves.idleLong, (i) => spriteOf(sculpt(moves.idle(i), FACING_TURN3[to]), aura), TOWNSFOLK3_HEAVY.on, stand);
  const idle = loop(work);
  const act = lazyFrames(moves.actLong + 1, (i) => spriteOf(sculpt(moves.act(i), FACING_TURN3[work]), aura), TOWNSFOLK3_HEAVY.on, () => idle);
  const turned = {} as Record<Facing, Sprite[]>;
  for (const to of ['se', 'sw', 'ne', 'nw'] as const) turned[to] = to === work ? idle : loop(to, () => idle);
  return { idle, act, loops: moves.loops, work, turned, fps: TFPS, actFps: TFPS, soundAt: soundAt(moves) };
}

/** The town's four people, sculpted. */
export function makeTownsfolk3(): Townsfolk {
  const armourer = townsman(ARMOURER_MOVES, 'sw', sculptArmourer, AURA);
  const mystic = townsman(MYSTIC_MOVES, 'sw', sculptMystic, AURA);
  const wordsmith = townsman(WORDSMITH_MOVES, 'sw', sculptWordsmith, AURA_SMITH);
  // (the stranger: against his wall, facing down the screen to the right; turned to someone, his eyes stay on them)
  const sIdle = lazyFrames(STRANGER_MOVES.idleLong, (i) => spriteOf(sculptStranger(STRANGER_MOVES.idle(i), 0), null), TOWNSFOLK3_HEAVY.on);
  const sAct = lazyFrames(STRANGER_MOVES.actLong + 1, (i) => spriteOf(sculptStranger(STRANGER_MOVES.act(i), 0), null), TOWNSFOLK3_HEAVY.on, () => sIdle);
  const watching = (to: -1 | 1): Sprite[] => lazyFrames(STRANGER_MOVES.idleLong, (i) => spriteOf(sculptStranger(strangerWatching(i, to), 0), null), TOWNSFOLK3_HEAVY.on, () => sIdle);
  const right = watching(-1);
  const left = watching(1);
  const stranger: Townsman = { idle: sIdle, act: sAct, loops: STRANGER_MOVES.loops, work: 'se', turned: { se: left, ne: left, sw: right, nw: right }, fps: TFPS, actFps: TFPS, soundAt: soundAt(STRANGER_MOVES) };
  return { armourer, mystic, wordsmith, stranger };
}

/** The wordsmith while his ring is dark (art/quest3.ts): the same loop with the runes on him cold, and no work. */
export function makeSmithDark3(): Townsman {
  const loop = (to: Facing, stand?: () => Sprite[]): Sprite[] => lazyFrames(WORDSMITH_MOVES.idleLong, (i) => spriteOf(sculptWordsmith({ ...WORDSMITH_MOVES.idle(i), dark: true }, FACING_TURN3[to]), AURA_DARK), TOWNSFOLK3_HEAVY.on, stand);
  const idle = loop('sw');
  const still = (): Sprite[] => idle;
  return { idle, act: [], loops: 1, work: 'sw', turned: { sw: idle, se: loop('se', still), ne: loop('ne', still), nw: loop('nw', still) }, fps: TFPS, actFps: TFPS };
}

let dark3: Townsman | null = null;
/**
 * The sculpted wordsmith's frames while his ring is dark, as the town shows them (art/townscene.ts): one set, made the first
 * time it is asked for (the files' pictures are given into these very lists: render/townsfolk_baked.ts).
 */
export function smithDark3(): Townsman {
  return (dark3 ??= makeSmithDark3());
}

/** One list of frames of one of them, by its name. `first`: one of the loops the town shows as it is come into, which the loading screen waits for. */
export interface FolkList {
  name: string;
  list: Sprite[];
  first: boolean;
}

const WHO = ['armourer', 'mystic', 'wordsmith', 'stranger'] as const;
const WAYS = ['se', 'sw', 'ne', 'nw'] as const;

/**
 * THE LISTS THE BAKE FILLS (tools/bake_townsfolk.mjs, render/townsfolk_baked.ts), each once, in the order they are wanted: FIRST
 * the loops the town shows as it is come into (the four at their work, and the wordsmith with his ring dark, as a new hero's
 * town has him); then what each does now and then; then the loops turned to whoever comes up (a list that is another's, as a
 * loop turned the way of its work is the loop itself, is not named twice). The bake's page and the game both go by this.
 */
export function folkLists(folk: Townsfolk, dark: Townsman): FolkList[] {
  const out: FolkList[] = [];
  const seen = new Set<Sprite[]>();
  const add = (name: string, list: Sprite[], first = false): void => {
    if (seen.has(list)) return;
    seen.add(list);
    out.push({ name, list, first });
  };
  for (const w of WHO) add(`${w}:idle`, folk[w].idle, true);
  add('smithDark:idle', dark.idle, true);
  for (const w of WHO) add(`${w}:act`, folk[w].act);
  for (const w of WHO) for (const to of WAYS) add(`${w}:${to}`, folk[w].turned[to]);
  for (const to of WAYS) add(`smithDark:${to}`, dark.turned[to]);
  return out;
}
