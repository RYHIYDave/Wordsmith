// FLOOR 9'S TWO SIDE BOSSES, their pictures as the game holds a monster (art/act1_figs/types.ts): art/f9_bosses_art.ts, sculpted
// (art/f9_bosses_sculpt.ts), his “Yes, build them in (Recommended)”, 14 Nov 2026. THE TROLL CHIEFTAIN'S clips: stand, walk, attack (the
// club smash), reel, die (turned to stone), and in clips.moves the slam, the war cry and the bull rush. THE MIST WOLF'S: stand, walk,
// attack (the bite), reel, die (coming apart into mist), and in clips.moves the claw sweep, the howl, the lunge and the cloud. Heavy to
// paint (each frame sculpted): painted for their floor. Behind game/f9_lairs.ts F9_LAIRS (off): its switch is not held here, as
// useAct1Figs (art/bestiary.ts) throws every figure's with the descent's; nothing makes either while it is off.

import { makeMistWolfArt, makeWarchiefArt } from '../f9_bosses_art';
import type { Act1Fig } from './types';

export const FIG_CHIEF: Act1Fig = {
  make: () => makeWarchiefArt(),
  // (half again a prison troll's height, as the game measures him over his floor point: his hump, his head thrust out before it,
  // his antlers over that; his body broad)
  size: { top: 70, half: 24 },
  heavy: true,
};
export const FIG_WOLF: Act1Fig = {
  make: () => makeMistWolfArt(),
  // (its back over its floor point a head over the knight's; long and low)
  size: { top: 35, half: 26 },
  heavy: true,
};
