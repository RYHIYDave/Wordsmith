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
// THE MEND: the same crouch, as low (his hips where they were), his body and arms as they were; but his front foot a little further
// forward (11, where it was 6.8) with its knee bent out over it to his left (40 degrees, where it was 12), and his back foot
// further back (12, where it was 5.2) with its leg longer and its knee turned a little to his left (20, where it was -20); each foot
// turned with its knee. Neither shin now slants along the eye's line. His near leg reads 8.3 game pixels from hip to knee and 9.1
// from knee to floor (1.10 times); his far leg never less than 1.07 times; through every frame of his breathing (a test holds
// both at 1 or more).

import { MOVES3 } from './moves3';
import type { Move3 } from './moves3';
import type { Bones, Motion } from './skeleton';

/** His crouch, mended (the game's own is moves3.ts BATTLE, his rest in a fight). */
export const RU_BATTLE: Bones = { ...MOVES3.rstand.rest, lfx: 11, lk: 40, lft: 24, rfx: -12, rk: 20, rft: -20 };

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
