// ACT 2, THE HUSH: FLOOR 11 (and the city's own): THE HUSHED TOWNSFOLK: its rules (game/act1_rules/types.ts).
//
// His picks for floor 11's monsters (to the art chat, 18 Oct 2026): "The Hushed townsfolk (Recommended),The Hushed watch
// (Recommended),Silent Order scribes,Mute watch hounds"; of the townsfolk, how they fight, "Shuffle, then lunge and grab
// (Recommended)" (offered as: slow shuffling crowds that suddenly lunge to grab and claw at you), and how they go down,
// "The Hush leaves them (Recommended)". The art chat's pictures, each with his yes (art/hushed.ts, art/hushed_moves.ts; to
// their four films, "Yes, as shown (Recommended)"): THE SHUFFLE, painted for 0.9 tiles a second (HU_PACE), ten frames at
// eight a second; THE LUNGE AND GRAB (HU_GRAB, 1.4 s): all at once they rear up, the arms up and out, the hands spread as
// claws, the mouth gaping, held trembling from 0.22 to 0.42 s (THE WARNING); then a long step in, both hands driven at
// you and clutching shut at 0.6 s (frame 18 of 30): THE BLOW, a short reach before them, where its picture's hands are
// then (a little short of a tile, at the chest); they claw down at what they caught, step back and slump again. Struck,
// 0.4 s; their death, THE HUSH LEAVING THEM (2.2 s: the gasp, the grey breath pouring up out of them, the knees giving,
// and down: people again), all in its pictures. Small: one attack (his rule of 9 Oct, 08:15: "They should always have a
// basic, single target attack").
//
// THE ACT'S COMMON MOB: on every floor of the Hush (game/act2_mobs.ts; his word of 18 Oct, 15:47 Pacific: "So some of the
// new enemies can be used throughout the next 10 levels."), and the Crier calls them in from the alleys (his rules call
// `R.g.spawn('hushed', ...)`: one spawned plain shuffles in and fights as any, nothing more asked of it).
//
// A CROWD OF THREE LOOKS (the art's three, makeHushedArt3(mob): a porter, a goodwife, a baker): each one is given its
// look as it comes into the world, in turn by its number in the game (Monster.form 0 the porter, 1 the goodwife, 2 the
// baker), so that a pack laid together is a mixed crowd, and those the Crier calls come one of each in turn. The
// goodwife and the baker are figures of their own, 'hushed:1' and 'hushed:2', as the Chained One's forms are
// (art/act1_figs/hushed.ts `looks`, art/bestiary.ts figureOf); their death is theirs too (the 'die' event carries the
// form). The three are one kind in the rules: the same body, the same shuffle and grab.
//
// Every number here that is a picture's is written down here; tests/act2_hushed.test.ts holds it to the art.

import { TUNE } from '../defs';
import type { ActDef, GaitDef } from '../bosses';
import type { Act1Rules } from './types';

/** THE HUSHED TOWNSFOLK'S NUMBERS (tiles, seconds of their pictures). */
export const HUSHED = {
  /**
   * THE GRAB: their hands clutch shut at `hit` (HU_GRAB.hit, frame 18 of 30), `reach` tiles before them (where the
   * picture's hands are then, the further of the two: handAt), in a strip `half` to either side of them.
   */
  grab: { hit: 18 / 30, reach: 0.944, half: 0.55 },
  /** How many looks they come in (the porter, the goodwife, the baker: Monster.form 0 to 2). */
  looks: 3,
};

/** Their shuffle, painted for 0.9 tiles a second; they stop at any frame of it (the feet barely lifted), as the Drowned do. */
const GAIT: GaitDef = { pace: 0.9, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 0.85, slack: 0.2, trueBack: true };

const ACTS: readonly ActDef[] = [
  // (made from no further than its hands reach a hero's near side: so wherever it stops, its grab reaches him)
  { id: 'hushed:grab', clip: 'attack', long: 1.4, hit: HUSHED.grab.hit, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 0, far: 1.05 },
];

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  spawned(_R, m) {
    // (a porter, a goodwife or a baker, in turn: a mixed crowd)
    m.form = m.id % HUSHED.looks;
  },
  acting(R, m, a, t0, t1) {
    if (a.id !== 'hushed:grab' || !(t0 < a.hit && t1 >= a.hit)) return;
    // (their hands clutch shut before them: whoever they close on is caught)
    const g = R.g;
    const G = HUSHED.grab;
    const r = R.rel(m);
    if (r.fwd > -0.2 && r.fwd <= G.reach + TUNE.heroRadius * 0.5 && Math.abs(r.left) <= G.half) R.blow(m, a.dmg);
    // (the lunge's rush of cloth and air: no sound out of their mouths, which make none)
    g.sfx('swing', 0.35);
  },
};
