// A HERO'S SIDES, as the game numbers them (the bake, render/baked.ts; the painter's worker, render/painter.ts; HeroArt.give and
// warm, art/heroes3.ts). Every hero has two, `front` (0) and `back` (1), the game mirroring them for the other two ways. A hero
// brought up from all EIGHT SIDES (the Warrior, art/warrior_up_art.ts; the Ranger, art/ranger_up_art.ts) has six more, each
// truly painted and never mirrored (docs/mockups/warrior_up/README.md, "His eight facings"): numbered after the two, so that
// what is numbered of every other hero is as it was.

import type { ActorArt, AnimSet } from './actor_types';
import type { WuSide } from './warrior_up';

/** A hero painted from all eight sides. */
export type EightArt = ActorArt & Record<WuSide, AnimSet>;

/** The eight in the order the game numbers them: the two every hero has first. */
export const EIGHT_ORDER: readonly WuSide[] = ['front', 'back', 'toward', 'frontL', 'sideL', 'backL', 'away', 'side'];

/** Whether a hero's art is painted from all eight sides (its sides made when first asked for: asking whether it has one makes none). */
export function isEight(a: ActorArt): a is EightArt {
  return Object.prototype.hasOwnProperty.call(a, 'toward');
}

/** A hero's sides as the game numbers them: two, or eight. */
export function heroSides(a: ActorArt): AnimSet[] {
  return isEight(a) ? EIGHT_ORDER.map((k) => a[k]) : [a.front, a.back];
}
