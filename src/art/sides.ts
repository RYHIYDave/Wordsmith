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

/**
 * The way a class card's hero faces (ui/panels.ts): DOWN AND TO THE RIGHT, every hero the same way, a hero painted from eight
 * sides seen from his front (art/heroes3.ts cardLists), as the Brawler and the Tinkerer, who have two, are seen. His words, 13 Nov
 * 2026, 20:53 (Eastern): “The idle animations on the character selection screen snap the sprites to the side.  All the sprites
 * should be facing the same way.  Probably down right like the brawler”. (Till then the Warrior, the Ranger, the Mage and the
 * Warlock faced down the screen, `toward`, and turned to their front for what they do left standing and for making ready,
 * which are painted from the front only: the snap.)
 */
export const CARD_FACING = { fx: 1, fy: 0 } as const;

/** A hero's sides as the game numbers them: two, or eight. */
export function heroSides(a: ActorArt): AnimSet[] {
  return isEight(a) ? EIGHT_ORDER.map((k) => a[k]) : [a.front, a.back];
}
