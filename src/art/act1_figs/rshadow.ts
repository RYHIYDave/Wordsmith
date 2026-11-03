// ACT 2, PART TWO, THE HIGH CITY: FLOOR 20, THE QUIET TOWER: THE SHADOWS OF THE FOUR ROYALS: their pictures as the game holds a
// monster (art/act1_figs/types.ts), from the art chat's (art/royal_shadows.ts, royal_shadows_fx.ts; his pick “Each with one boss
// move (Recommended)”, and his yes, “Yes, that's them (Recommended)”; docs/mockups/royal_shadows/README.md). Each shadow its
// royal's own moves, painted by its boss's own painter, as fog, smaller (`shadowFrame`): its stand, its walk, its basic blow
// (attack), its big move (clips.moves: the Princess's snare, the Prince's masks, the Queen's blink into her hand mirror and out of
// it, the King's crown), struck, and its death, blown apart like smoke, its playing card hanging a moment (`deathFrame`).
// Monster.form: 0 the Princess's (its own pictures), 1 the Prince's, 2 the Queen's, 3 the King's (game/act1_rules/rshadow.ts).
// Each from the knight's height to a head over it. Heavy: made for its floor (each frame its boss's painter at work).
import type { ActorArt, AnimSet, Clip } from '../actor_types';
import { lazyFrames, toSprite } from '../kit';
import { DEATH_FPS } from '../mkit';
import { BLINK, ROYALS, SHADOWS_ON, longOf, shadowFrame } from '../royal_shadows';
import type { Frame, Royal, RoyalId } from '../royal_shadows';
import { DEATH, blinkFrame, deathFrame } from '../royal_shadows_fx';
import type { GameView } from '../skin';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

const FPS = 30;
const spriteOf = (f: Frame): Sprite => toSprite({ px: f.px, lights: f.lights }, null, f.ax, f.ay);

/** One shadow seen one way, as the game holds a monster's pictures. */
function shadowSet(r: Royal, view: GameView): AnimSet {
  const mob = r.mob;
  const fr = (move: string, t: number): Sprite => spriteOf(shadowFrame(r, move, t, view));
  const clipOf = (move: string, hit?: number): Clip => {
    const n = Math.round(longOf(r, move) * FPS) + 1;
    const c: Clip = { frames: lazyFrames(n, (i) => fr(move, i / FPS), true), fps: FPS };
    if (hit !== undefined) c.hit = hit;
    return c;
  };
  const attack = clipOf('attack', r.strikes.attack[1]);
  const n = attack.frames.length;
  const pick = (s: number): number => Math.max(0, Math.min(n - 1, Math.round(s * FPS)));
  const hit = r.strikes.attack[1];
  const picks = [pick(hit * 0.7), pick(hit + 0.035), pick(((n - 1) / FPS + hit) / 2)];
  const dieN = Math.round(DEATH.long * DEATH_FPS) + 1;
  const die: Clip = { frames: lazyFrames(dieN, (i) => spriteOf(deathFrame(r, i / DEATH_FPS, view)), true), fps: DEATH_FPS };
  const reel = clipOf('reel');
  const moves: Record<string, Clip> = {};
  if (r.big === 'blink') {
    // (the Queen's: into her hand mirror, and out of it)
    const nIn = Math.round(BLINK.into * FPS) + 1;
    const nOut = Math.round(BLINK.out * FPS) + 1;
    moves.blinkIn = { frames: lazyFrames(nIn, (i) => spriteOf(blinkFrame('into', i / FPS, view)), true), fps: FPS, hit: BLINK.strikeIn[1] };
    moves.blinkOut = { frames: lazyFrames(nOut, (i) => spriteOf(blinkFrame('out', i / FPS, view)), true), fps: FPS, hit: BLINK.strikeOut[1] };
  } else moves[r.big] = clipOf(r.big, r.strikes[r.big][1]);
  return {
    idle: lazyFrames(mob.idleFrames, (i) => fr('stand', i / mob.idleFps), true),
    walk: lazyFrames(mob.walkFrames, (i) => fr('walk', i / mob.walkFps), true),
    attack: lazyFrames(3, (i) => attack.frames[picks[i]]),
    idleFps: mob.idleFps,
    walkFps: mob.walkFps,
    clips: { attack, die, reel, moves },
  };
}
/** One royal's shadow, as the game holds a monster. */
export function makeShadowArt(id: RoyalId): ActorArt {
  const r = ROYALS[id];
  return { front: shadowSet(r, 'front'), back: shadowSet(r, 'back') };
}

/** Each royal's shadow's height and half its width (game pixels: the art's README, the knight 57 picture pixels high). */
const SIZE: Readonly<Record<RoyalId, { top: number; half: number }>> = {
  princess: { top: 30, half: 9 },
  prince: { top: 31, half: 10 },
  queen: { top: 32, half: 10 },
  king: { top: 34, half: 12 },
};
const look = (id: RoyalId): Act1Fig => ({ make: () => makeShadowArt(id), size: SIZE[id], heavy: true, switches: [SHADOWS_ON] });

export const FIG: Act1Fig | null = {
  ...look('princess'),
  // (Monster.form 1 the Prince's, 2 the Queen's, 3 the King's)
  looks: [look('prince'), look('queen'), look('king')],
};
