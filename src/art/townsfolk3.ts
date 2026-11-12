// THE TOWN'S PEOPLE, SCULPTED AND MOVING AT THIRTY A SECOND (the townsfolk chat, 11 Nov 2026). A MOCK-UP BEHIND A SWITCH
// THAT IS OFF: TOWNSFOLK3.on. With it off the town's people are the ones painted in art/townsfolk.ts (and art/smith3.ts).
//
// His words, 8 Nov 2026, 06:25: “And I think the townsfolk need look update and a 30fps makeover”. The four are the art in
// src/dev/sculpt_townsfolk.ts (who each is, kept; how each is made, the Brawler's) and src/dev/townsfolk_moves.ts (their
// loops and what each does now and then, a pose at every thirtieth of a second). This file only turns those into the frames
// the town shows (art/townsfolk.ts Townsman), each painted when first asked for (lazyFrames, heavy: a frame of theirs is a
// tenth of a second and more to paint, so where the game is played they are for the side painter, or baked to files as the
// heroes are: tools/bake_heroes.mjs).
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

/** The switch: the town's four people sculpted, at thirty a second; or as they were. OFF UNTIL HIS YES. */
export const TOWNSFOLK3 = { on: false };
/**
 * Whether their frames are left to the side painter where the game is played (art/kit.ts HEAVY): on, as the game needs; off
 * for the pictures and films made of them (every frame painted when first asked for, so each picture is the true moment).
 */
export const TOWNSFOLK3_HEAVY = { on: true };

/** How far each way along the grid is turned from facing down the screen to the right. */
export const FACING_TURN3: Record<Facing, number> = { se: 0, sw: -90, ne: 90, nw: 180 };

/** Their pool of light: the friend's cyan, as the town's people have always had (the stranger has none: he keeps to the dark). */
const AURA: Light = { x: TOWN_CANVAS.ax - 4, y: TOWN_CANVAS.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
/** The wordsmith's: a little wider (he is bigger, and he burns); and a dim one while his ring is dark. */
const AURA_SMITH: Light = { x: TOWN_CANVAS.ax - 4, y: TOWN_CANVAS.ay - 34, r: 56, color: '#28dcf0', a: 0.24 };
const AURA_DARK: Light = { ...AURA_SMITH, r: 36, a: 0.1 };

const spriteOf = (fig: TownFigure, aura: Light | null): Sprite => toSprite(paintFigure(fig), aura, TOWN_CANVAS.ax, TOWN_CANVAS.ay);

/** One of them as the town has its people: the loop facing their work, what they do now and then, and the loop turned to whoever comes up. */
function townsman<P>(moves: TownMoves<P>, work: Facing, sculpt: (p: P, turn: number) => TownFigure, aura: Light | null): Townsman {
  const loop = (to: Facing): Sprite[] => lazyFrames(moves.idleLong, (i) => spriteOf(sculpt(moves.idle(i), FACING_TURN3[to]), aura), TOWNSFOLK3_HEAVY.on);
  const idle = loop(work);
  const act = lazyFrames(moves.actLong + 1, (i) => spriteOf(sculpt(moves.act(i), FACING_TURN3[work]), aura), TOWNSFOLK3_HEAVY.on);
  const turned = {} as Record<Facing, Sprite[]>;
  for (const to of ['se', 'sw', 'ne', 'nw'] as const) turned[to] = to === work ? idle : loop(to);
  return { idle, act, loops: moves.loops, work, turned, fps: TFPS, actFps: TFPS };
}

/** The town's four people, sculpted. */
export function makeTownsfolk3(): Townsfolk {
  const armourer = townsman(ARMOURER_MOVES, 'sw', sculptArmourer, AURA);
  const mystic = townsman(MYSTIC_MOVES, 'sw', sculptMystic, AURA);
  const wordsmith = townsman(WORDSMITH_MOVES, 'sw', sculptWordsmith, AURA_SMITH);
  // (the stranger: against his wall, facing down the screen to the right; turned to someone, his eyes stay on them)
  const sIdle = lazyFrames(STRANGER_MOVES.idleLong, (i) => spriteOf(sculptStranger(STRANGER_MOVES.idle(i), 0), null), TOWNSFOLK3_HEAVY.on);
  const sAct = lazyFrames(STRANGER_MOVES.actLong + 1, (i) => spriteOf(sculptStranger(STRANGER_MOVES.act(i), 0), null), TOWNSFOLK3_HEAVY.on);
  const watching = (to: -1 | 1): Sprite[] => lazyFrames(STRANGER_MOVES.idleLong, (i) => spriteOf(sculptStranger(strangerWatching(i, to), 0), null), TOWNSFOLK3_HEAVY.on);
  const right = watching(-1);
  const left = watching(1);
  const stranger: Townsman = { idle: sIdle, act: sAct, loops: STRANGER_MOVES.loops, work: 'se', turned: { se: left, ne: left, sw: right, nw: right }, fps: TFPS, actFps: TFPS };
  return { armourer, mystic, wordsmith, stranger };
}

/** The wordsmith while his ring is dark (art/quest3.ts): the same loop with the runes on him cold, and no work. */
export function makeSmithDark3(): Townsman {
  const loop = (to: Facing): Sprite[] => lazyFrames(WORDSMITH_MOVES.idleLong, (i) => spriteOf(sculptWordsmith({ ...WORDSMITH_MOVES.idle(i), dark: true }, FACING_TURN3[to]), AURA_DARK), TOWNSFOLK3_HEAVY.on);
  const idle = loop('sw');
  return { idle, act: [], loops: 1, work: 'sw', turned: { sw: idle, se: loop('se'), ne: loop('ne'), nw: loop('nw') }, fps: TFPS, actFps: TFPS };
}
