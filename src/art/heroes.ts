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
  /**
   * THE RANGER'S BOW (art/bow_skins.ts, BOW_SKINS): the skin of the unique bow he holds, drawn in his hand from his eight sides;
   * absent, his own bow, as ever.
   */
  bow?: BowId;
  /**
   * THE TINKERER'S WRENCH (art/wrench_skins.ts, WRENCH_SKINS): the skin of the unique wrench she holds, drawn in her hand from her
   * eight sides; absent, her own wrench, as ever.
   */
  wrench?: WrenchId;
  /**
   * THE WARRIOR'S UNIQUE WEAPON (art/sword_skins.ts, art/heavy_skins.ts; WARRIOR_SKINS): the unique great sword, battle axe or
   * warhammer in his hands, of the kind he is drawn with (his great sword, or the war axe or maul his tree has given him: `weapon`);
   * absent, his own, as ever.
   */
  warriorSkin?: WarriorSkinId;
  /**
   * THE BRAWLER'S WRAPS (art/wrap_skins.ts, WRAP_SKINS): the skin of the unique wraps on his fists, the Veteran from his eight
   * sides; absent, his own, as ever.
   */
  wraps?: WrapId;
  /**
   * THE WARLOCK'S BOOK (art/tome_skins.ts, TOME_SKINS): the skin of the unique tome at his hip, the man brought up from his eight
   * sides (the demon is as ever); absent, his own red book.
   */
  tome?: TomeId;
}

/** (THE MAGE'S STAFF, art/staff_skins.ts) The unique staves drawn in her hands, each a skin of her staff. */
export type StaffId = 'crook' | 'ebb' | 'resonance' | 'rod';
export const STAFF_IDS: readonly StaffId[] = ['crook', 'ebb', 'resonance', 'rod'];

/** (THE RANGER'S BOW, art/bow_skins.ts) The unique bows drawn in his hand, each a skin of his bow. */
export type BowId = 'rainwalker' | 'threefold' | 'poachers' | 'fledgling';
export const BOW_IDS: readonly BowId[] = ['rainwalker', 'threefold', 'poachers', 'fledgling'];

/** (THE TINKERER'S WRENCH, art/wrench_skins.ts) The unique wrenches drawn in her hand, each a skin of her wrench. */
export type WrenchId = 'secondwhistle' | 'stickywrench' | 'foremanswrench' | 'borrowedspanner';
export const WRENCH_IDS: readonly WrenchId[] = ['secondwhistle', 'stickywrench', 'foremanswrench', 'borrowedspanner'];

/** (THE BRAWLER'S WRAPS, art/wrap_skins.ts) The unique wraps drawn on his fists, each a skin of his own. */
export type WrapId = 'lastround' | 'fourthglobe' | 'winningstreak' | 'tapedknuckles';
export const WRAP_IDS: readonly WrapId[] = ['lastround', 'fourthglobe', 'winningstreak', 'tapedknuckles'];

/** (THE WARLOCK'S BOOK, art/tome_skins.ts) The unique tomes drawn at his hip, each a skin of his own book. */
export type TomeId = 'ledgerofdebts' | 'restlesstome' | 'burningverse' | 'hornbook';
export const TOME_IDS: readonly TomeId[] = ['ledgerofdebts', 'restlesstome', 'burningverse', 'hornbook'];

/** (THE WARRIOR'S UNIQUE WEAPONS) His unique great swords, battle axes and warhammers, each a skin of the one he is drawn with. */
export type WarriorSkinId = 'millstone' | 'windcutter' | 'undertow' | 'gyre' | 'redtithe' | 'widowfall' | 'rotaxe' | 'deathknell' | 'deadweight' | 'starbreaker';
export const WARRIOR_SKIN_IDS: readonly WarriorSkinId[] = ['millstone', 'windcutter', 'undertow', 'gyre', 'redtithe', 'widowfall', 'rotaxe', 'deathknell', 'deadweight', 'starbreaker'];
/** Which of his weapons each is a skin of: his great sword (null), or the war axe or the maul. */
export const WARRIOR_SKIN_KIND: Readonly<Record<WarriorSkinId, HeavyWeapon | null>> = {
  millstone: null, windcutter: null, undertow: null,
  gyre: 'axe', redtithe: 'axe', widowfall: 'axe', rotaxe: 'axe',
  deathknell: 'hammer', deadweight: 'hammer', starbreaker: 'hammer',
};

/**
 * WHICH OF A HERO'S PICTURES the side painter paints ahead (render/painter.ts): in town, in a dungeon; and the warlock's
 * others (art/warlock_art.ts): the demon's, and his with his arm blazing; and (28 Oct 2026) the new classes on their class
 * cards, too heavy for the start screen to paint as it draws them (`card`).
 */
export type HeroPlace = 'town' | 'dungeon' | 'demon' | 'blaze' | 'card' | 'axe' | 'axeTown' | 'hammer' | 'hammerTown' | 'crook' | 'crookTown' | 'ebb' | 'ebbTown' | 'resonance' | 'resonanceTown' | 'rod' | 'rodTown' | 'rainwalker' | 'rainwalkerTown' | 'threefold' | 'threefoldTown' | 'poachers' | 'poachersTown' | 'fledgling' | 'fledglingTown' | 'secondwhistle' | 'secondwhistleTown' | 'stickywrench' | 'stickywrenchTown' | 'foremanswrench' | 'foremanswrenchTown' | 'borrowedspanner' | 'borrowedspannerTown' | 'millstone' | 'millstoneTown' | 'windcutter' | 'windcutterTown' | 'undertow' | 'undertowTown' | 'gyre' | 'gyreTown' | 'redtithe' | 'redtitheTown' | 'widowfall' | 'widowfallTown' | 'rotaxe' | 'rotaxeTown' | 'deathknell' | 'deathknellTown' | 'deadweight' | 'deadweightTown' | 'starbreaker' | 'starbreakerTown' | 'lastround' | 'lastroundTown' | 'fourthglobe' | 'fourthglobeTown' | 'winningstreak' | 'winningstreakTown' | 'tapedknuckles' | 'tapedknucklesTown' | 'ledgerofdebts' | 'ledgerofdebtsTown' | 'ledgerofdebtsBlaze' | 'restlesstome' | 'restlesstomeTown' | 'restlesstomeBlaze' | 'burningverse' | 'burningverseTown' | 'burningverseBlaze' | 'hornbook' | 'hornbookTown' | 'hornbookBlaze';
/** (THE WARRIOR'S WEAPON, WARRIOR_TREE2) His places with the war axe and the maul: in a dungeon, and in town. */
export const HEAVY_PLACES: Readonly<Record<HeavyWeapon, { dungeon: HeroPlace; town: HeroPlace }>> = { axe: { dungeon: 'axe', town: 'axeTown' }, hammer: { dungeon: 'hammer', town: 'hammerTown' } };
/** (THE MAGE'S STAFF, art/staff_skins.ts) Her places with each unique staff: in a dungeon, and in town. */
export const STAFF_PLACES: Readonly<Record<StaffId, { dungeon: HeroPlace; town: HeroPlace }>> = {
  crook: { dungeon: 'crook', town: 'crookTown' },
  ebb: { dungeon: 'ebb', town: 'ebbTown' },
  resonance: { dungeon: 'resonance', town: 'resonanceTown' },
  rod: { dungeon: 'rod', town: 'rodTown' },
};
/**
 * THE SWITCH: ON, at his yes, 14 Nov 2026 (by 16:11 Eastern), shown her in the game with each staff
 * (docs/mockups/staff_skins/pictures/staves_in_game.mp4) and asked whether to turn them on: “Yes, switch them on (Recommended)”.
 * On, the Mage holding a unique staff is drawn holding it (render/render.ts heroArt: her place with that staff,
 * STAFF_PLACES; the staves themselves art/staff_skins.ts), its pictures baked whole, a group of their own for each staff (render/baked.ts bakeGroups), as the
 * Warrior's axe and maul are: his pick, 14 Nov 2026, told the split layers would cost about an eighth more memory while she is
 * played and each staff baked whole about 2 MB of download and none: “Bake each staff whole (Recommended)”.
 */
export const STAFF_SKINS = { on: true };
/** The unique staves of the game (game/uniques.ts) that are drawn in her hands, and the skin each is. */
export const STAFF_OF_UNIQUE: Readonly<Record<string, StaffId>> = { shepherdscrook: 'crook', tide: 'ebb', tuningstaff: 'resonance', kindlingrod: 'rod' };
/** The skin of the staff an item is, if it is one of those (and the switch is on); null: her own staff. */
export function staffWorn(item: { unique?: string; rarity?: number } | null | undefined): StaffId | null {
  if (!STAFF_SKINS.on || !item || item.rarity !== 3 || !item.unique) return null;
  return STAFF_OF_UNIQUE[item.unique] ?? null;
}
/**
 * THE RANGER'S BOWS' SWITCH: ON, at his yes, 14 Nov 2026 (by 20:06 Eastern), shown the Ranger in the game with each bow
 * (docs/mockups/bow_skins/pictures/bows_in_game.mp4) and asked whether to turn them on: “Yes, switch them on (Recommended)”.
 * (His yes to their pictures before, shown bows_moves.mp4: “Yes, all four (Recommended)”.) On, the Ranger holding a
 * unique bow is drawn holding it (render/render.ts heroArt: his places with that bow, BOW_PLACES; the bows art/bow_skins.ts),
 * each bow's pictures a bake group of its own (render/baked.ts), as the Mage's staves are.
 */
export const BOW_SKINS = { on: true };
/** The unique bows of the game (game/uniques.ts) that are drawn in his hand, and the skin each is. */
export const BOW_OF_UNIQUE: Readonly<Record<string, BowId>> = { rainwalker: 'rainwalker', fan: 'threefold', poachersbow: 'poachers', fledgling: 'fledgling' };
/** The skin of the bow an item is, if it is one of those (and the switch is on); null: his own bow. */
export function bowWorn(item: { unique?: string; rarity?: number } | null | undefined): BowId | null {
  if (!BOW_SKINS.on || !item || item.rarity !== 3 || !item.unique) return null;
  return BOW_OF_UNIQUE[item.unique] ?? null;
}
/** (THE RANGER'S BOW) His places with each unique bow: in a dungeon, and in town. */
export const BOW_PLACES: Readonly<Record<BowId, { dungeon: HeroPlace; town: HeroPlace }>> = {
  rainwalker: { dungeon: 'rainwalker', town: 'rainwalkerTown' },
  threefold: { dungeon: 'threefold', town: 'threefoldTown' },
  poachers: { dungeon: 'poachers', town: 'poachersTown' },
  fledgling: { dungeon: 'fledgling', town: 'fledglingTown' },
};
/** Is a place one of a bow's (and which). */
export function bowOfPlace(place: HeroPlace): BowId | null {
  for (const id of BOW_IDS) if (BOW_PLACES[id].dungeon === place || BOW_PLACES[id].town === place) return id;
  return null;
}
/**
 * THE TINKERER'S WRENCHES' SWITCH: ON, at his yes, 14 Nov 2026 (by 21:25 Eastern), shown the Tinkerer in the game with each wrench
 * (docs/mockups/wrench_skins/pictures/wrenches_in_game.mp4) and asked whether to turn them on: “Yes, switch them on
 * (Recommended)”. (His yes to their pictures before, shown wrenches_moves.mp4: “Yes, all four (Recommended)”.) On, the Tinkerer
 * holding a unique wrench is drawn holding it (her places with it, WRENCH_PLACES; the wrenches art/wrench_skins.ts), each
 * wrench's pictures a bake group of its own (render/baked.ts), as the Mage's staves and the Ranger's bows are.
 */
export const WRENCH_SKINS = { on: true };
/** The unique wrenches of the game (game/uniques.ts) that are drawn in her hand: each is its own skin's id. */
export const WRENCH_OF_UNIQUE: Readonly<Record<string, WrenchId>> = { secondwhistle: 'secondwhistle', stickywrench: 'stickywrench', foremanswrench: 'foremanswrench', borrowedspanner: 'borrowedspanner' };
/** The skin of the wrench an item is, if it is one of those (and the switch is on); null: her own wrench. */
export function wrenchWorn(item: { unique?: string; rarity?: number } | null | undefined): WrenchId | null {
  if (!WRENCH_SKINS.on || !item || item.rarity !== 3 || !item.unique) return null;
  return WRENCH_OF_UNIQUE[item.unique] ?? null;
}
/** (THE TINKERER'S WRENCH) Her places with each unique wrench: in a dungeon, and in town (one set of her for both, as her own). */
export const WRENCH_PLACES: Readonly<Record<WrenchId, { dungeon: HeroPlace; town: HeroPlace }>> = {
  secondwhistle: { dungeon: 'secondwhistle', town: 'secondwhistleTown' },
  stickywrench: { dungeon: 'stickywrench', town: 'stickywrenchTown' },
  foremanswrench: { dungeon: 'foremanswrench', town: 'foremanswrenchTown' },
  borrowedspanner: { dungeon: 'borrowedspanner', town: 'borrowedspannerTown' },
};
/** Is a place one of a wrench's (and which). */
export function wrenchOfPlace(place: HeroPlace): WrenchId | null {
  for (const id of WRENCH_IDS) if (WRENCH_PLACES[id].dungeon === place || WRENCH_PLACES[id].town === place) return id;
  return null;
}

/**
 * THE WARRIOR'S UNIQUE WEAPONS' SWITCH: ON, at his yes, 14 Nov 2026 (by 23:15 Eastern), shown the Warrior in the game holding each
 * (docs/mockups/warrior_skins/pictures/swords_in_game.mp4, axes_in_game.mp4, hammers_in_game.mp4) and asked whether to turn them on:
 * “Yes, switch them on (Recommended)”. (His yes to their pictures before: the great swords, shown swords_moves.mp4, “Yes, all three
 * (Recommended)”; the axes and hammers, shown axes_moves.mp4 and hammers_moves.mp4, “Yes, all seven (Recommended)”.) On, the
 * Warrior holding a unique great sword, battle axe or warhammer of the kind he is drawn with is drawn holding it (his places with
 * it, WARRIOR_SKIN_PLACES), each a bake group of its own (render/baked.ts), as the Mage's staves are.
 */
export const WARRIOR_SKINS = { on: true };
/** The skin of the unique weapon an item is, if it is one of his and of the kind he is drawn with (`arms`: his tree's war axe or maul; null, his great sword), and the switch is on. */
export function warriorWorn(item: { unique?: string; rarity?: number } | null | undefined, arms: HeavyWeapon | null): WarriorSkinId | null {
  if (!WARRIOR_SKINS.on || !item || item.rarity !== 3 || !item.unique) return null;
  const id = item.unique as WarriorSkinId;
  if (!(WARRIOR_SKIN_IDS as readonly string[]).includes(id)) return null;
  return WARRIOR_SKIN_KIND[id] === arms ? id : null;
}
/** (THE WARRIOR'S UNIQUE WEAPONS) His places with each: in a dungeon, and in town. */
export const WARRIOR_SKIN_PLACES: Readonly<Record<WarriorSkinId, { dungeon: HeroPlace; town: HeroPlace }>> = Object.fromEntries(
  WARRIOR_SKIN_IDS.map((id) => [id, { dungeon: id as HeroPlace, town: `${id}Town` as HeroPlace }]),
) as Record<WarriorSkinId, { dungeon: HeroPlace; town: HeroPlace }>;
/**
 * THE BRAWLER'S WRAPS' SWITCH: ON, at his yes, 15 Nov 2026 (by 09:16 Eastern), shown the Brawler in the game wearing each
 * (docs/mockups/wrap_skins/pictures/wraps_in_game.mp4) and asked whether to turn them on: “Yes, switch them on (Recommended)”.
 * (His yes to their pictures before, shown wraps_moves.mp4: “Yes, all four (Recommended)”.) On, the Brawler (the Veteran) wearing
 * unique wraps is drawn with them on his fists (his places with them, WRAP_PLACES; the wraps art/wrap_skins.ts), each a bake group
 * of its own (render/baked.ts), as the Mage's staves are; kept in packs as his own pictures are.
 */
export const WRAP_SKINS = { on: true };
/** The unique wraps of the game (game/uniques.ts) that are drawn on his fists: each is its own skin's id. */
export const WRAP_OF_UNIQUE: Readonly<Record<string, WrapId>> = { lastround: 'lastround', fourthglobe: 'fourthglobe', winningstreak: 'winningstreak', tapedknuckles: 'tapedknuckles' };
/** The skin of the wraps an item is, if it is one of those (and the switch is on); null: his own. */
export function wrapWorn(item: { unique?: string; rarity?: number } | null | undefined): WrapId | null {
  if (!WRAP_SKINS.on || !item || item.rarity !== 3 || !item.unique) return null;
  return WRAP_OF_UNIQUE[item.unique] ?? null;
}
/** (THE BRAWLER'S WRAPS) His places with each: in a dungeon, and in town (one set of him for both, as his own). */
export const WRAP_PLACES: Readonly<Record<WrapId, { dungeon: HeroPlace; town: HeroPlace }>> = Object.fromEntries(
  WRAP_IDS.map((id) => [id, { dungeon: id as HeroPlace, town: `${id}Town` as HeroPlace }]),
) as Record<WrapId, { dungeon: HeroPlace; town: HeroPlace }>;
/** Is a place one of his wraps' (and which). */
export function wrapOfPlace(place: HeroPlace): WrapId | null {
  for (const id of WRAP_IDS) if (WRAP_PLACES[id].dungeon === place || WRAP_PLACES[id].town === place) return id;
  return null;
}

/**
 * THE WARLOCK'S TOMES' SWITCH: ON, at his yes, 15 Nov 2026 (by 09:16 Eastern), shown the Warlock in the game with each
 * (docs/mockups/tome_skins/pictures/tomes_in_game.mp4) and asked whether to turn them on: “Yes, switch them on (Recommended)”.
 * (His yes to their pictures before, shown tomes_moves.mp4: “Yes, all four (Recommended)”.) On, the Warlock wearing a unique tome is drawn with it at his hip (the man brought
 * up; his places with it, TOME_PLACES: in a dungeon, in town and his arm blazing; the demon as ever), each a bake group of its own
 * (render/baked.ts), kept in packs as his own pictures are; his demon a group of its own, kept whatever book he wears.
 */
export const TOME_SKINS = { on: true };
/** The unique tomes of the game (game/uniques.ts) that are drawn at his hip: each is its own skin's id. */
export const TOME_OF_UNIQUE: Readonly<Record<string, TomeId>> = { ledgerofdebts: 'ledgerofdebts', restlesstome: 'restlesstome', burningverse: 'burningverse', hornbook: 'hornbook' };
/** The skin of the tome an item is, if it is one of those (and the switch is on); null: his own book. */
export function tomeWorn(item: { unique?: string; rarity?: number } | null | undefined): TomeId | null {
  if (!TOME_SKINS.on || !item || item.rarity !== 3 || !item.unique) return null;
  return TOME_OF_UNIQUE[item.unique] ?? null;
}
/** (THE WARLOCK'S BOOK) His places with each: in a dungeon, in town, and in a dungeon with his arm blazing. */
export const TOME_PLACES: Readonly<Record<TomeId, { dungeon: HeroPlace; town: HeroPlace; blaze: HeroPlace }>> = Object.fromEntries(
  TOME_IDS.map((id) => [id, { dungeon: id as HeroPlace, town: `${id}Town` as HeroPlace, blaze: `${id}Blaze` as HeroPlace }]),
) as Record<TomeId, { dungeon: HeroPlace; town: HeroPlace; blaze: HeroPlace }>;
/** Is a place one of his tomes' (and which). */
export function tomeOfPlace(place: HeroPlace): TomeId | null {
  for (const id of TOME_IDS) if (TOME_PLACES[id].dungeon === place || TOME_PLACES[id].town === place || TOME_PLACES[id].blaze === place) return id;
  return null;
}

/** Is a place one of his unique weapons' (and which). */
export function warriorSkinOfPlace(place: HeroPlace): WarriorSkinId | null {
  for (const id of WARRIOR_SKIN_IDS) if (WARRIOR_SKIN_PLACES[id].dungeon === place || WARRIOR_SKIN_PLACES[id].town === place) return id;
  return null;
}

/**
 * THE UNIQUE WEAPON A HERO HOLDS, DRAWN IN HIS HAND (the Mage's staves, art/staff_skins.ts; the Ranger's bows, art/bow_skins.ts):
 * the look it is and his places with it, in a dungeon and in town; null: his own weapon, as ever (or its switch is off).
 */
export function wornSkin(cls: ClassId, item: { unique?: string; rarity?: number } | null | undefined, arms: HeavyWeapon | null = null): { look: Pick<HeroLook, 'staff' | 'bow' | 'wrench' | 'warriorSkin' | 'wraps' | 'tome'>; places: { dungeon: HeroPlace; town: HeroPlace; blaze?: HeroPlace } } | null {
  if (cls === 'mage') {
    const staff = staffWorn(item);
    if (staff) return { look: { staff }, places: STAFF_PLACES[staff] };
  }
  if (cls === 'ranger') {
    const bow = bowWorn(item);
    if (bow) return { look: { bow }, places: BOW_PLACES[bow] };
  }
  if (cls === 'tinkerer') {
    const wrench = wrenchWorn(item);
    if (wrench) return { look: { wrench }, places: WRENCH_PLACES[wrench] };
  }
  // (THE WARRIOR: a unique of the kind he is drawn with, `arms`)
  if (cls === 'warrior') {
    const warriorSkin = warriorWorn(item, arms);
    if (warriorSkin) return { look: { warriorSkin }, places: WARRIOR_SKIN_PLACES[warriorSkin] };
  }
  // (THE BRAWLER'S WRAPS: the Veteran's; THE WARLOCK'S BOOK: his places with it, his arm blazing too)
  if (cls === 'brawler') {
    const wraps = wrapWorn(item);
    if (wraps) return { look: { wraps }, places: WRAP_PLACES[wraps] };
  }
  if (cls === 'warlock') {
    const tome = tomeWorn(item);
    if (tome) return { look: { tome }, places: TOME_PLACES[tome] };
  }
  return null;
}
/** Is a place one of a staff's (and which). */
export function staffOfPlace(place: HeroPlace): StaffId | null {
  for (const id of STAFF_IDS) if (STAFF_PLACES[id].dungeon === place || STAFF_PLACES[id].town === place) return id;
  return null;
}
/** Is a place a town's (in town, or a staff's or a bow's place in town). */
export const isTownPlace = (place: HeroPlace): boolean =>
  place === 'town' ||
  place === 'axeTown' ||
  place === 'hammerTown' ||
  (staffOfPlace(place) !== null && STAFF_PLACES[staffOfPlace(place)!].town === place) ||
  (bowOfPlace(place) !== null && BOW_PLACES[bowOfPlace(place)!].town === place) ||
  (wrenchOfPlace(place) !== null && WRENCH_PLACES[wrenchOfPlace(place)!].town === place) ||
  (warriorSkinOfPlace(place) !== null && WARRIOR_SKIN_PLACES[warriorSkinOfPlace(place)!].town === place) ||
  (wrapOfPlace(place) !== null && WRAP_PLACES[wrapOfPlace(place)!].town === place) ||
  (tomeOfPlace(place) !== null && TOME_PLACES[tomeOfPlace(place)!].town === place);
/** Is a place a skin's (a staff's, a bow's, a wrench's or one of the Warrior's), in a dungeon or in town. */
export const isSkinPlace = (place: HeroPlace): boolean => staffOfPlace(place) !== null || bowOfPlace(place) !== null || wrenchOfPlace(place) !== null || warriorSkinOfPlace(place) !== null || wrapOfPlace(place) !== null || tomeOfPlace(place) !== null;
/** The look each of those is. */
export function lookOfPlace(place: HeroPlace): HeroLook {
  if (place === 'card') return { twoHanded: true, town: true, card: true };
  const staff = staffOfPlace(place);
  if (staff) return { twoHanded: true, town: STAFF_PLACES[staff].town === place, staff };
  const bow = bowOfPlace(place);
  if (bow) return { twoHanded: true, town: BOW_PLACES[bow].town === place, bow };
  const wrench = wrenchOfPlace(place);
  if (wrench) return { twoHanded: true, town: WRENCH_PLACES[wrench].town === place, wrench };
  const warriorSkin = warriorSkinOfPlace(place);
  if (warriorSkin) {
    const kind = WARRIOR_SKIN_KIND[warriorSkin];
    return { twoHanded: true, town: WARRIOR_SKIN_PLACES[warriorSkin].town === place, ...(kind ? { weapon: kind } : {}), warriorSkin };
  }
  const wraps = wrapOfPlace(place);
  if (wraps) return { twoHanded: true, town: WRAP_PLACES[wraps].town === place, wraps };
  const tome = tomeOfPlace(place);
  if (tome) return { twoHanded: true, town: TOME_PLACES[tome].town === place, ...(TOME_PLACES[tome].blaze === place ? { blaze: true } : {}), tome };
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
