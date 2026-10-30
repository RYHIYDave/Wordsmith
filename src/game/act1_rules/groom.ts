// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16, THE SWAN GARDENS: THE HUSHED GROOMS: their rules (game/act1_rules/types.ts).
//
// His answers to the art chat (28 Oct 2026, all with the gardeners': game/act1_rules/gardener.ts says them; docs/mockups/
// swan_gardens/README.md): a stable groom of the palace in its livery, a pitchfork in his hands; “Rush at you”; “Shears snap,
// fork jab (Recommended)”; “The Hush leaves them (Recommended)”. The art chat's pictures (art/palace_hands.ts,
// palace_hands_moves.ts, PALACE_GROOM): STANDING, leaning on his fork stood at his side, at his work till he sees you; THE RUSH
// as the gardener's (PH_PACE, 1.6 tiles a second), the fork carried upright; THE FORK JAB (PH_BLOW, the gardener's timing): the
// fork brought down level in both hands and drawn back, its tines glinting pink, held shaking (THE WARNING, 0.26 to 0.48 s); hips
// first, a lunge, jabbed out its whole length at 18/30 of a second (THE BLOW), the tines a tile and a half before him; carried on
// through; drawn back and stood again. Struck; and the Hush leaving him, his fork dropping clear. Small: one attack.
//
// WHAT HE DOES (the main chat's helper's): THE FORK JAB, his one blow: at its moment, whoever is in the strip along the fork, from
// his breast out past the tines (`jab.at`, measured off the picture: forkOf) and on through where they are carried (`jab.out`) by
// `jab.more`, `jab.half` to either side of its line, is struck: a long narrow strip, 2.17 tiles before him and 1.2 across (his
// rule of 28 Oct, “And bigger AOE to compensate for the extra time the player gets to evade”: longer than the Hush's like
// kinds' blows, the townsfolk's grab, about 1.1 tiles, and floor 13's sickle, about 1.4). Through his wind-up it is marked on
// the floor in the enemy's pink (render/act1_fx/groom.ts). Laid in a pack, a groom is one of a crowd of the two: gardener.ts
// mixCrowd.
//
// Every number here that is a picture's is written down in gardener.ts (PALACE); tests/act2_palace_hands.test.ts holds it to
// the art.

import type { ActDef } from '../bosses';
import { JAB_STRIP, PALACE, inStrip, mixCrowd, palaceGait } from './gardener';
import type { Act1Rules } from './types';

const ACTS: readonly ActDef[] = [
  // (made from no further than the strip reaches with half a round of his rush to spare: wherever he stops, it reaches the hero)
  { id: 'groom:jab', clip: 'attack', long: PALACE.blow.long, hit: PALACE.blow.hit, dmg: 1, cooldown: 0, first: 0, after: 0.7, near: 0, far: 1.9 },
];

export const RULES: Act1Rules | null = {
  // (he stands off a little further than a gardener: his fork is longer)
  gait: palaceGait(1.25),
  acts: ACTS,
  spawned(_R, m) {
    mixCrowd(m);
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    // (silent but their tools: the fork's rush through the air as it is jabbed out)
    if (at(PALACE.blow.hit - 0.08)) g.sfx('swing', 0.4);
    if (a.id !== 'groom:jab' || !at(a.hit)) return;
    // (the tines jabbed out their whole length: whoever is along the fork is struck)
    if (inStrip(R, m, JAB_STRIP)) R.blow(m, a.dmg);
  },
};
