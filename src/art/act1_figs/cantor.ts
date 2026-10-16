// ACT 1: THE CANTOR, FLOOR 8'S BOSS: his pictures as the game holds a monster (art/act1_figs/types.ts). The art
// chat's (art/cantor.ts, every move with his yes as shown, 15 Oct by 07:35), held as art/new_mobs3.ts holds its
// mobs on the heroes' bones (`mobSet`, from in front and from behind, his walk at the pace it is painted for):
// stand, walk (his procession), attack (his staff strike), reel, die (his last note tearing him apart), and in
// clips.moves his shout, his sound-copies and his rockfall.
//
// HIS SOUND-COPIES AS FIGURES OF THEIR OWN (the art chat: "what they do after is yours (cantorEchoPainted(move, t,
// view) paints one as a see-through pink figure of its own)"): once torn away from him they repeat his last move
// (game/act1_rules/cantor.ts), so the moves they can repeat are kept with his pictures as copies, `echo...`, at
// ECHO_FPS (each is painted ahead with the rest of him, by the painter, as his own moves are); and the end of his
// sound-copies move as each copy plays it a beat behind him (`echoCopies`, from ECHO_FROM).

import { CANTOR, CANTOR_CANVAS, CANTOR_COPIES, CANTOR_ON, CANTOR_PACE, CANTOR_ROCKFALL, CANTOR_SHOUT, CANTOR_STRIKE, cantorEchoPainted } from '../cantor';
import type { ActorArt, AnimSet, Clip } from '../actor_types';
import { lazyFrames, toSprite } from '../kit';
import { mobSet } from '../new_mobs3';
import type { GameView } from '../skin';
import type { Act1Fig } from './types';

/** Frames a second of his copies' pictures (see-through and flickering: half his own thirty). */
export const ECHO_FPS = 15;
/** Where the copies' own picture of the end of his sound-copies move begins (seconds into it): each copy is still in it, a beat behind him, as he ends it. */
export const ECHO_FROM = 1.8;

/** One of his copies in one of his moves, from `from` seconds into it to its end `long`, as the game holds a figure (no pool of light: it is sound). */
function echoClip(which: string, from: number, long: number, view: GameView, hit?: number): Clip {
  const n = Math.round((long - from) * ECHO_FPS) + 1;
  const c: Clip = { frames: lazyFrames(n, (i) => toSprite(cantorEchoPainted(which, from + i / ECHO_FPS, view), null, CANTOR_CANVAS.ax, CANTOR_CANVAS.ay)), fps: ECHO_FPS };
  if (hit !== undefined) c.hit = hit - from;
  return c;
}

function cantorSet(view: GameView): AnimSet {
  const set = mobSet(CANTOR, view, CANTOR_PACE);
  const clips = set.clips!;
  clips.moves = {
    ...(clips.moves ?? {}),
    echoAttack: echoClip('attack', 0, CANTOR_STRIKE.long, view, CANTOR_STRIKE.hit),
    echoShout: echoClip('shout', 0, CANTOR_SHOUT.long, view, CANTOR_SHOUT.hit),
    echoRockfall: echoClip('rockfall', 0, CANTOR_ROCKFALL.long, view),
    echoCopies: echoClip('copies', ECHO_FROM, CANTOR_COPIES.long, view),
  };
  return set;
}

/** THE CANTOR, as the game holds a monster's pictures. */
export function makeCantorArt(): ActorArt {
  return { front: cantorSet('front'), back: cantorSet('back') };
}

export const FIG: Act1Fig | null = {
  make: makeCantorArt,
  // (measured off his stand as tests/act1_cantor.test.ts measures it: the top of him over his floor point, his pipes behind his head; half his width at the body)
  size: { top: 58, half: 12 },
  heavy: true,
  switches: [CANTOR_ON],
};
