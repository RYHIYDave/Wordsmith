// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: YOUR REFLECTIONS: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/reflections.ts, reflections_fx.ts; his yes, “Yes, that's them (Recommended)”): makeReflectionArt(...).of(cls),
// the hero's own pictures turned to glass, every list as long and every clip as the hero's, its shattering (clips.die) and its
// stepping out of a mirror (clips.moves.stepOut). ONE LOOK FOR EACH CLASS, by the reflection's form (game/act1_rules/reflection.ts
// FORM_OF): the knight's its own (form 0); the ranger's, the mage's (1, 2). The Warlock's, the Tinkerer's and the Brawler's are
// the art chat's still to make (art/reflections.ts makes them from the first three's paintMove3): until they come, the mage's,
// the ranger's and the knight's stand in for them (3, 4, 5), as their blows do.
import { REFLECTIONS_ON, makeReflectionArt } from '../reflections';
import { reflectionEffects } from '../reflections_fx';
import type { ActorArt } from '../actor_types';
import type { Act1Fig } from './types';

let made: { of(cls: 'warrior' | 'ranger' | 'mage'): ActorArt } | null = null;
const of = (cls: 'warrior' | 'ranger' | 'mage'): ActorArt => (made ??= makeReflectionArt(reflectionEffects as never) as never).of(cls);
const SIZE = { top: 29, half: 9 };
const look = (cls: 'warrior' | 'ranger' | 'mage'): Act1Fig => ({ make: () => of(cls), size: SIZE, switches: [REFLECTIONS_ON] });

export const FIG: Act1Fig | null = {
  ...look('warrior'),
  looks: [look('ranger'), look('mage'), look('mage'), look('ranger'), look('warrior')],
};
