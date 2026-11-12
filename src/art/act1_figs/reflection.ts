// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: YOUR REFLECTIONS: their pictures as the game holds a monster (art/act1_figs/types.ts),
// the art chat's (art/reflections.ts, reflections_fx.ts; his yes, “Yes, that's them (Recommended)”): makeReflectionArt(...).of(cls),
// the hero's own pictures turned to glass, every list as long and every clip as the hero's, its shattering (clips.die) and its
// stepping out of a mirror (clips.moves.stepOut). ONE LOOK FOR EACH CLASS, by the reflection's form (game/act1_rules/reflection.ts
// FORM_OF): the knight's its own (form 0); the ranger's, the mage's (1, 2). The Warlock's, the Tinkerer's and the Brawler's are
// the art chat's still to make (art/reflections.ts makes them from the first three's paintMove3): until they come, the mage's,
// the ranger's and the knight's stand in for them (3, 4, 5), as their blows do.
//
// THE HEROES AS THEY LOOK NOW, with REFLECTIONS_UP on (the rules' switch, off: the queue's wire-floor-18-new-reflections, 12 Nov
// 2026): each form the art chat's glass copy of its hero as he looks now (art/reflections_up.ts makeReflectionUpArt().ofForm; his
// yes, 12 Nov, “Yes, hand to main (Recommended)”), the Warlock, the Tinkerer and the Brawler their own at last, and the Warrior
// holding what he holds (6, his war axe; 7, his maul). Most of them are seen from EIGHT SIDES, as the heroes are (art/sides.ts):
// the game shows the side for the way it faces (render/render.ts monsterSpriteNow). Each look is made only when its figure is
// first asked for, so only the hero's own form is ever painted, baked or fetched on a run (render/monsters_baked.ts). With the
// switch off, forms 6 and 7 are the knight's, as the Warrior's copy was whatever he held.
import { REFLECTIONS_ON, makeReflectionArt } from '../reflections';
import { reflectionEffects } from '../reflections_fx';
import { REFLECTIONS_UP, makeReflectionUpArt } from '../reflections_up';
import type { ActorArt } from '../actor_types';
import type { Act1Fig } from './types';

type Old = 'warrior' | 'ranger' | 'mage';
let made: { of(cls: Old): ActorArt } | null = null;
const of = (cls: Old): ActorArt => (made ??= makeReflectionArt(reflectionEffects as never) as never).of(cls);
let madeUp: ReturnType<typeof makeReflectionUpArt> | null = null;
const ofUp = (form: number): ActorArt => (madeUp ??= makeReflectionUpArt()).ofForm(form);
/** How tall each class's copy stands (game pixels to the top of its head: the mage's hat the tallest), and half its width. */
const SIZE = { warrior: { top: 29, half: 9 }, ranger: { top: 30, half: 9 }, mage: { top: 35, half: 9 } } as const;
/** (REFLECTIONS_UP) The same of each form's copy as the heroes look now (measured from their pictures standing: tests/reflections_play.test.ts). */
export const SIZE_UP: readonly { top: number; half: number }[] = [
  { top: 29, half: 9 },
  { top: 28, half: 9 },
  { top: 35, half: 9 },
  { top: 33, half: 9 },
  { top: 32, half: 9 },
  { top: 30, half: 9 },
  { top: 29, half: 9 },
  { top: 29, half: 9 },
];
/** The first reflections' look each form took (the stand-ins for the three newer classes; the knight's whatever the Warrior held). */
const OLD_OF: readonly Old[] = ['warrior', 'ranger', 'mage', 'mage', 'ranger', 'warrior', 'warrior', 'warrior'];
/**
 * A form's look: the first reflections', or with REFLECTIONS_UP the heroes as they look now. Its size is read as the game reads
 * it (art/bestiary.ts FIGURE_SIZE holds this very object), so it follows the switch too.
 */
const look = (form: number): Act1Fig => ({
  make: () => (REFLECTIONS_UP.on ? ofUp(form) : of(OLD_OF[form])),
  size: {
    get top(): number {
      return REFLECTIONS_UP.on ? SIZE_UP[form].top : SIZE[OLD_OF[form]].top;
    },
    get half(): number {
      return REFLECTIONS_UP.on ? SIZE_UP[form].half : SIZE[OLD_OF[form]].half;
    },
  },
  switches: [REFLECTIONS_ON],
});

export const FIG: Act1Fig | null = {
  ...look(0),
  looks: [look(1), look(2), look(3), look(4), look(5), look(6), look(7)],
};
