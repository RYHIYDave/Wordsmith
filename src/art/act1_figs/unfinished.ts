// ACT 1: THE UNFINISHED, FLOOR 6'S BOSS: its pictures as the game holds a monster (art/act1_figs/types.ts).
//
// The art chat's (art/unfinished.ts, his yeses of 13 Oct by 14:00, 14:14, 14:35 and 14:56), as handed over in its
// post of 13 Oct, 17:20: two of it, UNFINISHED (free of the wall) and UNFINISHED_FUSED (still one with the wall,
// the fight's first half), each a Mob on the heroes' bones. The game holds them as ONE figure: its pictures free
// (stand, walk, setting off and stopping, the fist slam, struck, the stomp, the hurled block, the rockslide, and
// its death), and with them, by names of their own, its pictures still in the wall: its stand there (`fusedStand`),
// its fist slam, stomp, hurled block and rockslide there, struck there (`fusedReel`), and tearing itself free
// (`tearFree`, which ends on the free one's stand): those from in front only (see `setOf`). Which it is shown as is its rules' (game/act1_rules/
// unfinished.ts: Monster.form, 0 in the wall, 1 free) and its effects' (render/act1_fx/unfinished.ts).

import { UF_PACE, UNFINISHED, UNFINISHED_FUSED, UNFINISHED_ON } from '../unfinished';
import { mobSet } from '../new_mobs3';
import type { AnimSet } from '../actor_types';
import type { GameView } from '../skin';
import type { Act1Fig } from './types';

/** The names its pictures in the wall go by among its moves. */
export const UF_FUSED_CLIPS = {
  stand: 'fusedStand',
  slam: 'fusedSlam',
  stomp: 'fusedStomp',
  hurl: 'fusedHurl',
  rockslide: 'fusedRockslide',
  reel: 'fusedReel',
  tear: 'tearFree',
} as const;

/**
 * Its pictures from one side: free, and (from in front) in the wall. In the wall it is only ever seen from in front: its
 * back is to a far wall, up the screen, and it turns no further than that picture allows (game/act1_rules/
 * unfinished.ts); so its pictures in the wall from behind, each a frame to paint and as dear as the rest, are not
 * made. (Its walk at the pace it is painted for: the rules give it that pace.)
 */
function setOf(view: GameView): AnimSet {
  const free = withReel(mobSet(UNFINISHED, view, UF_PACE));
  if (view === 'back') return free;
  const fused = mobSet(UNFINISHED_FUSED, view, UF_PACE);
  const fm = fused.clips?.moves ?? {};
  const clips = free.clips ?? {};
  clips.moves = {
    ...(clips.moves ?? {}),
    [UF_FUSED_CLIPS.stand]: { frames: fused.idle, fps: fused.idleFps ?? 10, loop: 0 },
    [UF_FUSED_CLIPS.slam]: fused.clips!.attack!,
    [UF_FUSED_CLIPS.stomp]: fm.stomp,
    [UF_FUSED_CLIPS.hurl]: fm.hurl,
    [UF_FUSED_CLIPS.rockslide]: fm.rockslide,
    [UF_FUSED_CLIPS.reel]: fused.clips!.reel!,
    [UF_FUSED_CLIPS.tear]: fm.tearFree,
  };
  free.clips = clips;
  return free;
}

/**
 * Its flinch among its moves too (the same frames), so that it is painted ahead with them: the game paints a
 * figure's frames ahead of need, and the painter beside it paints a heavy one's (art/bestiary.ts warm and
 * paintOrder), its stand, walk, attacks, moves and death, but not its `reel`; struck the first time, a boss would
 * stop to paint it.
 */
function withReel(set: AnimSet): AnimSet {
  const c = set.clips;
  if (c && c.reel) c.moves = { ...(c.moves ?? {}), reel: c.reel };
  return set;
}

export const FIG: Act1Fig | null = {
  make: () => ({ front: setOf('front'), back: setOf('back') }),
  // (measured off its stand as the others are, tests/act1_unfinished.test.ts: over its floor point its picture is 100
  // high, its head bowed forward of it; half its width at the body)
  size: { top: 103, half: 38 },
  heavy: true,
  switches: [UNFINISHED_ON],
};
