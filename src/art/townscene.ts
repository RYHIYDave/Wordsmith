// Which picture each of the town's own things shows at a moment. One place says it, for the game
// (render/render.ts) and for the dev page that makes the town's moving pictures
// (dev/preview_town_gif.ts): so the two cannot come to differ.

import type { Sprite } from '../engine/px';
import { COLUMN_FRAMES, FLOOR_FRAMES, flareOf, stoneBlaze } from './ring3';
import { SMITH3 } from './smith3';
import type { TownProps } from './town';
import { actAt, townFrame } from './townsfolk';
import type { Facing, Townsfolk } from './townsfolk';

export interface TownArt {
  /** The town's own things (art/town.ts). */
  town: TownProps;
  /** Its people (art/townsfolk.ts). */
  folk: Townsfolk;
}

/** The town's things that lie flat on its floor and are walked over: drawn with the floor, under everything that stands. */
export function isTownFlat(kind: string): boolean {
  return kind === 'rug' || kind === 'runeRing';
}

/**
 * THEY TURN TO FACE YOU (the owner, 5 Oct 2026, 21:20: "Let's have them face their tables or
 * anvils, but turn to face you when you get very close"). One of the town's people turns to the
 * hero when the hero comes within TURN_TO tiles of them, and turns back to their work when the
 * hero has gone TURN_BACK away again (further, so that someone standing at the edge does not set
 * them turning to and fro).
 */
export const TURN_TO = 1.45;
export const TURN_BACK = 1.95;

/**
 * Which of the four ways along the grid someone at (px, py) faces to face (hx, hy). `was`: the
 * way they are turned already: near the line between two ways they keep it, so that a hero who
 * shifts a little does not flick them from one to the other.
 */
export function facingToward(px: number, py: number, hx: number, hy: number, was: Facing | null = null): Facing {
  const dx = hx - px;
  const dy = hy - py;
  if (was) {
    const along = was === 'se' ? dx : was === 'nw' ? -dx : was === 'sw' ? dy : -dy;
    const across = was === 'se' || was === 'nw' ? Math.abs(dy) : Math.abs(dx);
    if (along > 0 && along >= across - 0.35) return was;
  }
  // (the grid's x runs down the screen and to the right, its y down and to the left)
  return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'se' : 'nw') : dy >= 0 ? 'sw' : 'ne';
}

/**
 * The way one of the town's people at (px, py) is turned, with the hero at (hx, hy): toward the
 * hero if the hero is very close, otherwise null (they face their work). `was`: what this gave
 * the last time it was asked about them.
 */
export function turnedTo(px: number, py: number, hx: number, hy: number, was: Facing | null): Facing | null {
  const far = Math.hypot(hx - px, hy - py);
  return far < (was === null ? TURN_TO : TURN_BACK) ? facingToward(px, py, hx, hy, was) : null;
}

/** Is `kind` one of the town's people? */
export function isTownsperson(kind: string): boolean {
  return kind === 'armourer' || kind === 'mystic' || kind === 'wordsmith' || kind === 'stranger';
}

/**
 * The picture of one of the town's own things at time `t` (seconds), or null if `kind` is not
 * one of them. `variant`: which of the standing stones it is. `to`: for one of the people, the
 * way they are turned to someone who has come right up to them (turnedTo), or null.
 *
 * The people each have their own clock: the loop they stand in, and now and then what each does
 * (townFrame). The clocks are set apart, so that the town does not move in step.
 */
export function townSprite(art: TownArt, kind: string, variant: number, t: number, to: Facing | null = null): Sprite | null {
  const town = art.town;
  switch (kind) {
    case 'lexicon': return town.lexicon[Math.floor(t * 5) % town.lexicon.length];
    case 'stash': return town.stash;
    // the smithy
    case 'anvil': return town.anvil;
    case 'forge': return town.forge[Math.floor(t * 8) % town.forge.length];
    case 'rack': return town.rack;
    case 'trough': return town.trough;
    case 'armourer': return townFrame(art.folk.armourer, t, 0, to);
    // the bazaar
    case 'rug': return town.rug;
    case 'tentBack': return town.tentBack;
    case 'tentTable': return town.tentTable;
    case 'mystic': return townFrame(art.folk.mystic, t, 3.1, to);
    // the wordsmith's ring (made new, big and wild, with the wordsmith on bones: art/ring3.ts)
    case 'runeRing':
      if (SMITH3.on && town.ring3) return town.ring3.floor[Math.floor(t * (10 + 14 * flareOf(smithAct(art, t)))) % FLOOR_FRAMES];
      return town.runeRing[Math.floor(t * 4) % town.runeRing.length];
    case 'runeSlab': return town.runeSlab[Math.floor(t * 5) % town.runeSlab.length];
    case 'runeStone': {
      if (SMITH3.on && town.ring3) {
        const ways = town.ring3.stones[variant % town.ring3.stones.length][stoneBlaze(variant, t, smithAct(art, t))];
        return ways[Math.floor(t * 9 + variant * 1.7) % ways.length];
      }
      // (a pulse of light goes round the ring, from stone to stone)
      const stone = town.runeStone[variant % town.runeStone.length];
      return Math.floor(t * 1.6) % 6 === variant % 6 ? stone.alight : stone.dim;
    }
    case 'wordsmith':
      smithTo = to;
      return townFrame(art.folk.wordsmith, t, SMITH_PHASE, to);
    case 'stranger': return townFrame(art.folk.stranger, t, 4.7, to);
    default: return null;
  }
}

/** The wordsmith's clock is set this far apart from the others'. */
const SMITH_PHASE = 6.4;
/** Which way the wordsmith was last turned to someone (townSprite is told each frame he is drawn). */
let smithTo: Facing | null = null;

/** Where the wordsmith is in his work at time `t` (art/townsfolk.ts, actAt): seconds into it, or -1 (and -1 while he is turned to someone: his work waits). */
export function smithAct(art: TownArt, t: number): number {
  const m = art.folk.wordsmith;
  if (smithTo !== null && m.turned[smithTo] !== m.idle) return -1;
  return actAt(m, t, SMITH_PHASE);
}

/** The column of light over the slab at time `t` (the new ring only), and how strongly it shows. */
export function columnSprite(art: TownArt, t: number): { s: Sprite; alpha: number } | null {
  const r = art.town.ring3;
  if (!SMITH3.on || !r) return null;
  const f = flareOf(smithAct(art, t));
  return { s: r.column[Math.floor(t * (12 + 12 * f)) % COLUMN_FRAMES], alpha: Math.min(1, 0.42 + 0.58 * f) };
}
