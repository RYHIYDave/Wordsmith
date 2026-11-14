// FLOOR 5: THE TEMPLE DOOR'S TWO KEY-BEARERS, their pictures as the game holds a monster (art/act1_figs/types.ts): art/key_bearers.ts,
// held as art/new_mobs3.ts holds its mobs on the heroes' bones (`mobSet`, from in front and from behind, each walk at the pace it is
// painted for). The Knife's clips: stand, walk (his run), attack (his stab, the frenzy), reel, die (his key torn off as he falls), and in
// clips.moves his leap and his throw. The Flame's: stand, walk (his procession), attack (his great sigil), reel, die (his fire going
// out), and in clips.moves his fan and his ring. Behind art/temple_door.ts TEMPLE_DOOR (on at his yes, 13 Nov 2026): its switch is not held here, as
// useAct1Figs (art/bestiary.ts) throws every figure's with the descent's; nothing makes a key-bearer while it is off.

import { KEY_BLADE, KEY_FLAME } from '../key_bearers';
import { mobSet } from '../new_mobs3';
import type { Act1Fig } from './types';

export const FIG_BLADE: Act1Fig = {
  make: () => ({ front: mobSet(KEY_BLADE, 'front', KEY_BLADE.pace), back: mobSet(KEY_BLADE, 'back', KEY_BLADE.pace) }),
  // (the dagger cultist's, 28 and 9, a head taller: KEY_K)
  size: { top: 35, half: 11 },
};
export const FIG_FLAME: Act1Fig = {
  make: () => ({ front: mobSet(KEY_FLAME, 'front', KEY_FLAME.pace), back: mobSet(KEY_FLAME, 'back', KEY_FLAME.pace) }),
  // (as tall, and his crown of fire over him)
  size: { top: 40, half: 11 },
};
