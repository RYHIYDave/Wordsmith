// THE RANGER BROUGHT UP: HIS MOVES (the art chat's helper, 7 Nov 2026; docs/mockups/ranger_up/README.md). Behind art/ranger_up.ts
// RANGER_UP, off; nothing of the game imports it.
//
// So far only his stance, made so that HIS LEGS READ TRUE. The owner, seeing him sculpted: “Can you make sure his leg ratio is
// correct cause it seems like all these guys have long upper legs and short legs below the knee”.
//
// WHY THEY READ SHORT BELOW THE KNEE (tools/legs_measure.ts): the bones are a real person's (art/skeleton.ts buildOf: the knee
// at 0.285 of his height, the hip at 0.53), and standing straight his lower leg reads 1.14 times his thigh on the screen. But
// the game's camera looks down on him from in front (art/skin.ts stage), and in his crouch (moves3.ts CROUCH) both knees are
// bent toward it: each thigh lies square to the eye and is seen at its whole length, while each shin slants back from the knee
// along the eye's own line and is foreshortened. His near leg read 8.4 game pixels from hip to knee and 5.5 from knee to the
// floor.
//
// THE MEND (made again for all eight sides: the first mend, his front knee out, read true from in front but 0.45 from toward the
// camera): a longer, wider archer's guard, as low (his hips where they were), his body and arms as they were: his front foot
// forward 14.1 and out to his left 8.4, its knee bent out over it (37.7 degrees to his left); his back foot back 19.7, its knee
// a little in (-10.8), the foot turned out (-36.7). From every one of his eight sides each leg now reads at least 1.06 from knee
// to floor to hip to knee, through every frame of his breathing (tools/legs_measure.ts; the test holds it).

import { MOVES3 } from './moves3';
import type { Move3 } from './moves3';
import type { Bones, Motion } from './skeleton';

/** His crouch, mended (the game's own is moves3.ts BATTLE, his rest in a fight). */
export const RU_BATTLE: Bones = { ...MOVES3.rstand.rest, lfx: 14.1, lfy: 8.4, lk: 37.7, lft: 2.2, rfx: -19.7, rfy: -0.4, rk: -10.8, rft: -36.7 };

/**
 * A STANCE THAT IS ALIVE (as moves3.ts `alive`): two breaths, and the weight going over onto the front foot and back between
 * them. Two and four tenths of a second round, as the game's.
 */
function alive(from: Bones, shift: Partial<Bones>): Motion {
  const breath = (k: number): Partial<Bones> => ({ pz: from.pz - 0.5 * k, bend: from.bend + 1.4 * k });
  const over: Partial<Bones> = {};
  const half: Partial<Bones> = {};
  for (const [key, v] of Object.entries(shift)) {
    (over as Record<string, number>)[key] = (from as unknown as Record<string, number>)[key] + (v as number);
    (half as Record<string, number>)[key] = (from as unknown as Record<string, number>)[key] + (v as number) / 2;
  }
  return {
    keys: [
      { at: 0, pose: {} },
      { at: 0.6, pose: { ...half, ...breath(1) }, ease: 'io' },
      { at: 1.2, pose: { ...over }, ease: 'io' },
      { at: 1.8, pose: { ...half, ...breath(1) }, ease: 'io' },
      { at: 2.4, pose: {}, ease: 'io' },
    ],
    loop: 0,
  };
}

/** HIS STANCE IN A FIGHT, his knees out: as the game's (moves3.ts RANGER_STAND3 with RANGER_STANCES), on his mended crouch. */
export const RU_STAND3: Move3 = { ...MOVES3.rstand, name: 'The ranger, standing (brought up)', rest: RU_BATTLE, motion: alive(RU_BATTLE, { px: 0.7, py: 0.5, roll: -1.5, side: 1.5 }) };

/** His moves brought up, by the game's short names (only his stance, so far). */
export const RU_MOVES: Record<string, Move3> = { rstand: RU_STAND3 };
