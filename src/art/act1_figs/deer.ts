// ACT 1: THE TWISTED DEER (FLOOR 9): its pictures as the game holds a monster (art/act1_figs/types.ts): the art chat's
// (art/twisted_deer.ts, his yes to each), as handed over: makeDeerArt(), its stand, its limp (walk), its gore (attack),
// its rearing stomp (clips.moves.stomp), struck (reel) and its death.

import { TWISTED_DEER_ON, makeDeerArt } from '../twisted_deer';
import { CLUMP_CANVAS, DEER_BRAMBLE, HEDGE, HEDGE_AT, HEDGE_GONE, hedgeClumpPainted, hedgeUp, makeBrambleDeerArt } from '../action_f9_pinewood';
import { toSprite } from '../kit';
import type { GameView } from '../skin';
import type { Sprite } from '../../engine/px';
import type { Act1Fig } from './types';

export const FIG: Act1Fig | null = {
  // (and its bramble charge, behind DEER_BRAMBLE: art/action_f9_pinewood.ts, his yes, with his fix of 2 Nov 2026)
  make: () => (DEER_BRAMBLE.on ? makeBrambleDeerArt() : makeDeerArt()),
  // (measured off its stand as tests/act1_deer.test.ts measures it, over its floor point: its back is 27 up, its head and
  // antlers stand higher before it, to 34)
  size: { top: 30, half: 15 },
  switches: [TWISTED_DEER_ON],
};

// ITS HEDGE OF BRAMBLE (DEER_BRAMBLE), as the game draws it: each clump's moments, painted ahead (art/films.ts things:deer) or,
// before they are, a frame at a time as it is first wanted (render/act1_fx/deer.ts). Every charge's hedge keeps the same clock (the
// charge's), so each clump `j` (HEDGE_AT[j]) is the same at the same moment of it: CLUMP_FRAMES.rise frames of its bursting up,
// CLUMP_FRAMES.stand of its writhing (one round of it: the art's writhe goes round in WRITHE seconds), CLUMP_FRAMES.wither of its
// withering; and the torn earth at its foot, one.
export const CLUMP_FRAMES = { rise: 4, stand: 12, wither: 6 } as const;
const CLUMP_N = CLUMP_FRAMES.rise + CLUMP_FRAMES.stand + CLUMP_FRAMES.wither;
/** The hedge's writhing goes round once in this long (art/action_f9_pinewood.ts brambleStem: sin(t * 2.4 ...)). */
const WRITHE = (2 * Math.PI) / 2.4;
/** Which of clump `j`'s frames is seen `t` seconds into the charge (-1: none). */
export function clumpFrame(j: number, t: number): number {
  const d = HEDGE_AT[j];
  const s = t - hedgeUp(d);
  const left = HEDGE_GONE - t;
  if (s < 0 || left <= 0) return -1;
  const F = CLUMP_FRAMES;
  if (s < HEDGE.rise) return Math.min(F.rise - 1, Math.floor((s / HEDGE.rise) * F.rise));
  if (left < HEDGE.fade) return F.rise + F.stand + Math.min(F.wither - 1, Math.floor(((HEDGE.fade - left) / HEDGE.fade) * F.wither));
  const u = (((t / WRITHE) % 1) + 1) % 1;
  return F.rise + Math.min(F.stand - 1, Math.floor(u * F.stand));
}
/** The moment of the charge clump `j`'s frame `i` is painted at. */
function clumpTime(j: number, i: number): number {
  const F = CLUMP_FRAMES;
  const up = hedgeUp(HEDGE_AT[j]);
  if (i < F.rise) return up + ((i + 1) / F.rise) * HEDGE.rise * 0.999;
  if (i >= F.rise + F.stand) return HEDGE_GONE - HEDGE.fade * (1 - (i - F.rise - F.stand + 0.5) / F.wither);
  // (the same turn of its writhing, while it stands)
  const base = up + HEDGE.rise;
  const want = ((i - F.rise + 0.5) / F.stand) * WRITHE;
  return base + ((((want - base) % WRITHE) + WRITHE) % WRITHE);
}
/** Clump `j`'s frame `i` ('air': the bramble, sorted among the figures at its foot; 'floor': the torn earth under it, `i` not used). */
export function clumpSprite(j: number, i: number, view: GameView, layer: 'air' | 'floor'): Sprite {
  const t = layer === 'floor' ? hedgeUp(HEDGE_AT[j]) + 0.2 : clumpTime(j, i);
  return toSprite(hedgeClumpPainted(HEDGE_AT[j], t, view, layer), null, CLUMP_CANVAS.ax, CLUMP_CANVAS.ay);
}
/** ITS HEDGE, painted ahead (art/films.ts things:deer): `air:<view>:<j>` each clump's frames, `floor:<view>:<j>` its earth. */
export function deerThings(): Record<string, Sprite[]> {
  const out: Record<string, Sprite[]> = {};
  for (const view of ['front', 'back'] as const) {
    for (let j = 0; j < HEDGE_AT.length; j++) {
      out[`air:${view}:${j}`] = Array.from({ length: CLUMP_N }, (_, i) => clumpSprite(j, i, view, 'air'));
      out[`floor:${view}:${j}`] = [clumpSprite(j, 0, view, 'floor')];
    }
  }
  return out;
}
