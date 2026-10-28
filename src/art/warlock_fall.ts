// THE WARLOCK'S FALL (the main chat, 28 Oct 2026): the game needs one, and the art chat's moves of him have none yet. A FIRST
// PASS, MADE OF HIS OWN MOVES, TO BE SHOWN TO THE OWNER BEFORE IT GOES LIVE (his rule: pictures first).
//
// By his brief (“Pact-bound scholar”, “Hunched and pained”: always fighting the thing inside him) and the heroes' standing
// words (6 Oct: “Proud and daring or a roguish charm.”; “I want things to have weight. That's very important”): the last blow
// throws his head back and flings the demon arm up, its fire flaring (his struck-hard, dev/warlock_hits.ts); the pain folds
// him and his knees go, down onto one knee, doubled over, his right hand clutching the arm (his kneeling as he comes back
// from the demon, dev/warlock_spells.ts comeBack); he sags lower, his head hanging, and the fire in its claws gutters out.
// He does not lie down (as the brawler and the Tinkerer do not).

import type { Bones, Key3, Motion } from './skeleton';
import { FR, STANCE, T, clamp, curl, warlockPose } from '../dev/warlock_moves';
import type { WarlockMove } from '../dev/warlock_moves';
import { comeBack } from '../dev/warlock_spells';
import { WSTRUCK, warlockReel } from '../dev/warlock_hits';

/** How long it is, in frames (30 a second): the blow, his knees going, down, sagging, still. */
export const WF = { blow: WSTRUCK.snapped, buckle: 9, down: 18, sag: 30, end: 40 };

export function warlockFall(): WarlockMove {
  const reel = warlockReel();
  const back = comeBack();
  const struck = warlockPose(reel.motion, WSTRUCK.snapped * FR) as unknown as Bones;
  const kneel = warlockPose(back, 0) as unknown as Bones;
  const keys: Key3[] = [];
  const at = (f: number, pose: Partial<Bones>, ease: Key3['ease'] = 'io'): void => {
    keys.push({ at: f * FR, ease, pose });
  };
  at(0, {});
  // (the blow: a flash, his head thrown back, the arm flung up and its fire flaring)
  at(WF.blow, struck, 'out');
  // (his knees going: half way down, folding over)
  at(WF.buckle, { ...kneel, pz: (struck.pz + kneel.pz) / 2 + 2 * T, ...curl(22), faceUp: STANCE.faceUp - 6 }, 'in');
  // (down on one knee, doubled over, clutching the arm)
  at(WF.down, kneel, 'out');
  // (sagging lower, his head hanging, the arm heavy)
  const sag: Partial<Bones> = { ...kneel, pz: kneel.pz - 0.8 * T, ...curl(40), faceUp: kneel.faceUp - 10, lhz: kneel.lhz - 2 * T };
  at(WF.sag, { ...sag, ...clamp(sag) });
  at(WF.end, { ...sag, ...clamp(sag) });
  const motion: Motion = { keys };
  const long = WF.end * FR;
  return {
    name: 'His fall',
    motion,
    long,
    loops: false,
    jolt: [0, (WF.blow + 1) * FR],
    // (the fire flaring with the blow, guttering as he goes down, out)
    fire: [[0, 4.0], [WF.blow * FR, 7.2], [WF.buckle * FR, 3.4], [WF.down * FR, 1.6], [WF.sag * FR, 0.6], [long, 0]],
  };
}
