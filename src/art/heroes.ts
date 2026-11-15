// The three playable heroes, as the owner chose them from thirty designs (4 Oct 2026): the Scarf
// Knight, the Feather-cap Scout, and the mage of the wide brim and long scarf. Each has a rig of
// its own (hero_warrior.ts, hero_ranger.ts, hero_mage.ts), painted with the kit at twice the grain
// of the first builds' art. Frames are painted the first time they are shown.

import type { HeavyWeapon } from './warrior_up_heavy_art';
import type { Sprite } from '../engine/px';
import type { TailDef } from '../engine/tails';
import type { ClassId } from '../game/types';
import type { ActorArt, AnimSet } from './actor_types';
import { MAGE_TAILS, makeMageArt } from './hero_mage';
import { RANGER_TAILS, makeRangerArt } from './hero_ranger';
import { WARRIOR_TAILS, makeWarriorArt } from './hero_warrior';

/** Everything that flies from a hero (scarves, feathers): how each behaves and looks. A frame names the ones it carries. */
export const HERO_TAILS: Readonly<Record<string, TailDef>> = { ...WARRIOR_TAILS, ...RANGER_TAILS, ...MAGE_TAILS };

/** What of a hero's gear shows on the figure. */
export interface HeroLook {
  /** The weapon in the main hand takes both hands (a great sword, a maul). */
  twoHanded: boolean;
  /**
   * The hero is in town (or on a class card): the heroes painted over the bones (art/heroes3.ts)
   * have their weapons on their backs there. The first heroes' art takes no notice of it.
   */
  town?: boolean;
  /**
   * The hero is ON A CLASS CARD: as in town, but they do not pass the time there by drawing their
   * weapon (the owner, 6 Oct 2026, 22:58: "lets not have the battle stance be an idle animation
   * during the character select screen.  that way its something different when you select them").
   */
  card?: boolean;
  /** THE WARLOCK (art/warlock_art.ts): he is the demon; his pact is full (his arm blazes). */
  demon?: boolean;
  blaze?: boolean;
  /**
   * THE BRAWLER AS THE VETERAN (art/veteran_art.ts): given, whether he is (the painter's worker, which has no switch of its
   * own, says so); absent, as game/veteran.ts VETERAN is.
   */
  vet?: boolean;
  /**
   * THE WARRIOR'S WEAPON (game/talents.ts WARRIOR_TREE2: his tree's first point picks it): the war axe or the maul, each drawn in
   * his hands from his eight sides (art/warrior_up_heavy_art.ts); absent, the great sword, as ever.
   */
  weapon?: HeavyWeapon;
  /**
   * THE MAGE'S STAFF (art/staff_skins.ts STAFF_SKINS): the skin of the unique staff she holds, drawn in her hands from her eight
   * sides; absent, her own staff, as ever.
   */
  staff?: StaffId;
}

/** (THE MAGE'S STAFF, art/staff_skins.ts) The unique staves drawn in her hands, each a skin of her staff. */
export type StaffId = 'crook' | 'ebb' | 'resonance' | 'rod';
export const STAFF_IDS: readonly StaffId[] = ['crook', 'ebb', 'resonance', 'rod'];

/**
 * WHICH OF A HERO'S PICTURES the side painter paints ahead (render/painter.ts): in town, in a dungeon; and the warlock's
 * others (art/warlock_art.ts): the demon's, and his with his arm blazing; and (28 Oct 2026) the new classes on their class
 * cards, too heavy for the start screen to paint as it draws them (`card`).
 */
export type HeroPlace = 'town' | 'dungeon' | 'demon' | 'blaze' | 'card' | 'axe' | 'axeTown' | 'hammer' | 'hammerTown' | 'crook' | 'crookTown' | 'ebb' | 'ebbTown' | 'resonance' | 'resonanceTown' | 'rod' | 'rodTown';
/** (THE WARRIOR'S WEAPON, WARRIOR_TREE2) His places with the war axe and the maul: in a dungeon, and in town. */
export const HEAVY_PLACES: Readonly<Record<HeavyWeapon, { dungeon: HeroPlace; town: HeroPlace }>> = { axe: { dungeon: 'axe', town: 'axeTown' }, hammer: { dungeon: 'hammer', town: 'hammerTown' } };
/** (THE MAGE'S STAFF, art/staff_skins.ts) Her places with each unique staff: in a dungeon, and in town. */
export const STAFF_PLACES: Readonly<Record<StaffId, { dungeon: HeroPlace; town: HeroPlace }>> = {
  crook: { dungeon: 'crook', town: 'crookTown' },
  ebb: { dungeon: 'ebb', town: 'ebbTown' },
  resonance: { dungeon: 'resonance', town: 'resonanceTown' },
  rod: { dungeon: 'rod', town: 'rodTown' },
};
/** Is a place one of a staff's (and which). */
export function staffOfPlace(place: HeroPlace): StaffId | null {
  for (const id of STAFF_IDS) if (STAFF_PLACES[id].dungeon === place || STAFF_PLACES[id].town === place) return id;
  return null;
}
/** Is a place a town's (in town, or a staff's place in town). */
export const isTownPlace = (place: HeroPlace): boolean => place === 'town' || place === 'axeTown' || place === 'hammerTown' || (staffOfPlace(place) !== null && STAFF_PLACES[staffOfPlace(place)!].town === place);
/** The look each of those is. */
export function lookOfPlace(place: HeroPlace): HeroLook {
  if (place === 'card') return { twoHanded: true, town: true, card: true };
  const staff = staffOfPlace(place);
  if (staff) return { twoHanded: true, town: STAFF_PLACES[staff].town === place, staff };
  if (place === 'axe' || place === 'axeTown') return { twoHanded: true, town: place === 'axeTown', weapon: 'axe' };
  if (place === 'hammer' || place === 'hammerTown') return { twoHanded: true, town: place === 'hammerTown', weapon: 'hammer' };
  return { twoHanded: true, town: place === 'town', ...(place === 'demon' ? { demon: true } : place === 'blaze' ? { blaze: true } : {}) };
}

export interface HeroArt {
  /** The pictures of a hero of this class, carrying what `look` says. */
  of(cls: ClassId, look: HeroLook): ActorArt;
  /**
   * Paint one more frame of that hero that has not been painted yet. Frames are painted when first
   * shown; calling this once a frame while a run is under way gets them all done in its first
   * second, a few thousandths of a second at a time, instead of in the middle of the first fight.
   * False when there was nothing left to paint (the monsters' frames then take their turn:
   * art/bestiary.ts).
   */
  warm(cls: ClassId, look: HeroLook): boolean;
  /** (The heroes painted over the bones: a frame painted by the painter's worker, taken in: art/heroes3.ts.) */
  give?(cls: ClassId, place: HeroPlace, v: number, l: number, i: number, s: Sprite, vet?: boolean): boolean;
}

export const PLAIN: HeroLook = { twoHanded: false };

/** The last frame painted ahead of need. Kept only so that the reading of it cannot be optimised away. */
export let painted: Sprite | undefined;

export function makeHeroArt(): HeroArt {
  const made = new Map<string, ActorArt>();
  /** For each figure, the frames still to be painted ahead of need: standing and walking first. */
  const todo = new Map<ActorArt, (() => Sprite)[]>();
  const of = (cls: ClassId, look: HeroLook): ActorArt => {
    // only the warrior's figure changes with the weapon so far
    const two = cls === 'warrior' && look.twoHanded;
    const key = `${cls}:${two ? 2 : 1}`;
    let art = made.get(key);
    if (!art) {
      art = cls === 'warrior' ? makeWarriorArt({ twoHanded: two }) : cls === 'ranger' ? makeRangerArt() : makeMageArt();
      made.set(key, art);
    }
    return art;
  };
  return {
    of,
    warm(cls: ClassId, look: HeroLook): boolean {
      const art = of(cls, look);
      let list = todo.get(art);
      if (!list) {
        list = [];
        // (standing and walking first, then the attacks from start to finish; what a hero does
        // when left standing is painted as it is shown, which is slowly enough)
        for (const pick of [(a: AnimSet) => a.idle, (a: AnimSet) => a.walk, (a: AnimSet) => a.clips?.attack?.frames ?? a.attack, (a: AnimSet) => a.clips?.heavy?.frames ?? a.heavy ?? [], (a: AnimSet) => a.clips?.leap?.frames ?? a.leap ?? [],
          // (from Version 15.1: what is shown while an attack is held and when it is let go, and a leap's landing)
          (a: AnimSet) => a.clips?.hold?.frames ?? [], (a: AnimSet) => a.clips?.release?.frames ?? [], (a: AnimSet) => a.clips?.whirl?.frames ?? [], (a: AnimSet) => a.clips?.whirlEnd?.frames ?? [], (a: AnimSet) => a.clips?.land?.frames ?? [], (a: AnimSet) => a.clips?.roll?.frames ?? []]) {
          for (const set of [art.front, art.back]) {
            const frames = pick(set);
            // (reading a frame is what paints it: see lazyFrames in kit.ts)
            for (let i = 0; i < frames.length; i++) list.push(() => (painted = frames[i]));
          }
        }
        list.reverse();
        todo.set(art, list);
      }
      const next = list.pop();
      if (!next) return false;
      next();
      return true;
    },
  };
}
