// Items: base types, random loot generation, power-word imbuing and the text shown for modifiers.
//
// How a random item is made (rollItem):
//   1. slot     which gear slot it is for                       SLOT_WEIGHTS
//   2. base     the plain item underneath, e.g. "Steel Helm"    WEAPON_KINDS / OFFHAND_KINDS / GEAR_KINDS
//   3. rarity   Normal, Magic or Rare, by how deep the dungeon is  RARITY_START, RARITY_STEP
//   4. affixes  random modifiers (Magic 1-2, Rare 3-4)          AFFIX_FAMILIES
//   5. name     base name plus affix labels, or an invented two-word name for a Rare
//
// Every piece has room for four properties (ITEM_ROOM): the affixes it was found with and the
// power words burned into it since. The owner, 4 Oct 2026: "All items have room for 4 mods.
// White starts with 0, blue 1-2, yellow 3-4". So a white piece takes four words, a blue one two
// or three, a yellow one a single word or none; the colour follows the count as a piece is
// crafted; and a piece never carries the same property twice (imbueOptionsFor).
//
// An Item is plain data: it can be saved as JSON and loaded back unchanged.
// Every tunable number sits in the tables between here and the "CODE" marker.
// tests/items.test.ts spells out the design rules a second time (slots, ranges, weights, the imbue
// table), so a deliberate rule change needs the same change there.

import type { RNG } from '../engine/rng';
import { CLASSES, WORDS4 } from './defs';
import type { Affix, ClassId, IconKey, Imbue, Item, Limit, OffhandKind, OldWeaponKind, Rarity, Slot, StatKey, StatMod, WeaponKind, WordId } from './types';
import { SLOTS } from './types';

type Range = readonly [number, number];
type Three<T> = readonly [T, T, T];
type Four<T> = readonly [T, T, T, T];

// =============================================================================================
// STAT NAMES

export interface StatInfo {
  /** Display name, e.g. "Attack Speed". */
  label: string;
  /** Shown with a % sign. */
  pct: boolean;
  /** Decimals shown, and kept when a value is rolled. */
  dp: number;
}

export const STAT_INFO: Record<StatKey, StatInfo> = {
  str: { label: 'Strength', pct: false, dp: 0 },
  dex: { label: 'Dexterity', pct: false, dp: 0 },
  int: { label: 'Intelligence', pct: false, dp: 0 },
  dmgMin: { label: 'Minimum Damage', pct: false, dp: 0 },
  dmgMax: { label: 'Maximum Damage', pct: false, dp: 0 },
  dmgPct: { label: 'Damage', pct: true, dp: 0 },
  physPct: { label: 'Physical Damage', pct: true, dp: 0 },
  firePct: { label: 'Fire Damage', pct: true, dp: 0 },
  frostPct: { label: 'Frost Damage', pct: true, dp: 0 },
  lightPct: { label: 'Lightning Damage', pct: true, dp: 0 },
  atkSpeed: { label: 'Attack Speed', pct: true, dp: 0 },
  critChance: { label: 'Critical Chance', pct: true, dp: 0 },
  critMult: { label: 'Critical Damage', pct: true, dp: 0 },
  maxLife: { label: 'Max Life', pct: false, dp: 0 },
  lifeRegen: { label: 'Life Regen', pct: false, dp: 1 },
  lifeOnHit: { label: 'Life on Hit', pct: false, dp: 1 },
  lifeOnKill: { label: 'Life on Kill', pct: false, dp: 0 },
  maxMana: { label: 'Max Mana', pct: false, dp: 0 },
  manaRegen: { label: 'Mana Regen', pct: false, dp: 1 },
  armor: { label: 'Armour', pct: false, dp: 0 },
  fireRes: { label: 'Fire Resistance', pct: true, dp: 0 },
  frostRes: { label: 'Frost Resistance', pct: true, dp: 0 },
  lightRes: { label: 'Lightning Resistance', pct: true, dp: 0 },
  moveSpeed: { label: 'Movement Speed', pct: true, dp: 0 },
  cdr: { label: 'Cooldown Recovery', pct: true, dp: 0 },
  areaPct: { label: 'Area of Effect', pct: true, dp: 0 },
  goldFind: { label: 'Gold Find', pct: true, dp: 0 },
  magicFind: { label: 'Magic Find', pct: true, dp: 0 },
  stunChance: { label: 'Chance to Stun', pct: true, dp: 0 },
  blockChance: { label: 'Chance to Block', pct: true, dp: 0 },
  spellPct: { label: 'Spell Damage', pct: true, dp: 0 },
  pickupPct: { label: 'Pick-up Reach', pct: true, dp: 0 },
};

// =============================================================================================
// TUNING: BASES

/** Average hit of the plainest sword at item level 1. All weapon damage is derived from this. */
const SWORD_HIT_AT_LEVEL_1 = 5.5;
/** Every item level adds this share of the level-1 hit (a straight line, no cap). */
const HIT_GROWTH_PER_LEVEL = 0.22;
/** A weapon's minimum damage is about this share of its maximum. */
const MIN_DAMAGE_RATIO = 0.7;
/** Damage is balanced around this attack speed (the sword's): slower weapons hit harder, faster ones softer. */
const REFERENCE_APS = 1.3;
/** Damage per second of a two-handed melee weapon compared with a one-handed sword: it gives up a shield. */
const TWO_HANDER_DPS = 1.3;
/** Damage per second of a staff compared with a wand: it gives up a focus. */
const STAFF_DPS = 1.25;

/** Every kind of base has three names, weakest first. A name can drop once the item level reaches this. */
const BASE_TIER_MIN_ILVL: Three<number> = [1, 5, 10];
/** Weapon damage multiplier for name tiers 1-3. Kept small on purpose, so damage stays close to the curve above. */
const WEAPON_TIER_BONUS: Three<number> = [1, 1.04, 1.08];
/** Multiplier for the level-scaled bonuses of everything else (armour, life, mana, attributes). */
const GEAR_TIER_BONUS: Three<number> = [1, 1.15, 1.3];
/** How often a drop uses the best name unlocked at its item level. Otherwise it is an older, weaker name. */
const TOP_TIER_CHANCE = 0.7;

/**
 * One built-in bonus of a base. Either it grows with item level (`at1` at level 1, plus `perLevel`
 * for each level after, times GEAR_TIER_BONUS), or it is one fixed number per name tier (`tiers`).
 */
type ImplicitLine = { stat: StatKey; at1: number; perLevel: number } | { stat: StatKey; tiers: Three<number> };

interface WeaponDef {
  /** Also the id stem and the icon: the three bases are kind + 1, 2, 3 (e.g. 'sword2'). */
  kind: WeaponKind;
  /** 1 = one-handed, 2 = two-handed. */
  hands: 1 | 2;
  /** Attacks per second. */
  aps: number;
  /**
   * Damage per second compared with a one-handed sword of the same level (1 = the same). Damage per hit
   * is worked out from this and aps. One-handers and bows are 1 because an off-hand piece comes on top;
   * a two-hander that leaves the off-hand empty gets more to make up for it.
   */
  dps: number;
  names: Three<string>;
  /** Built-in bonuses besides the damage itself. */
  extra: readonly ImplicitLine[];
}

// Any character can use any weapon (Version 12), and the weapon decides the quick attack
// (defs.ts, WEAPON_TAP). The owner: "boil the melee weapons down to just sword"; "slower harder
// hitting variants is good" (the two-handed ones); "just a regular bow with a quiver off hand".
// Damage per second is kept within 10% inside each of three groups: one-handers (sword, wand),
// two-handers that go without an off-hand (greatsword, staff), and the bow.
const WEAPON_KINDS: readonly WeaponDef[] = [
  // one-handed (pairs with a shield), and its two-handed variant
  { kind: 'sword', hands: 1, aps: 1.3, dps: 1, names: ['Short Sword', 'Long Sword', 'War Sword'], extra: [] },
  { kind: 'greatsword', hands: 2, aps: 1.05, dps: TWO_HANDER_DPS, names: ['Iron Greatsword', 'Steel Greatsword', 'War Greatsword'], extra: [] },
  // two-handed, but a quiver still fits
  { kind: 'bow', hands: 2, aps: 1.4, dps: 1, names: ['Short Bow', 'Hunting Bow', 'Horn Bow'], extra: [] },
  // a one-handed wand (pairs with a focus), and its two-handed variant, the staff
  { kind: 'wand', hands: 1, aps: 1.5, dps: 1, names: ['Twig Wand', 'Carved Wand', 'Runed Wand'], extra: [{ stat: 'critChance', tiers: [2, 3, 4] }] },
  { kind: 'staff', hands: 2, aps: 1.0, dps: STAFF_DPS, names: ['Walking Staff', 'Carved Staff', 'Runed Staff'], extra: [{ stat: 'maxMana', at1: 10, perLevel: 2.5 }] },
];

/**
 * Weapons that were in the game until Version 12, and the kind that took the place of each: a
 * saved item of one of these becomes that kind, keeping its level, its affixes and its word.
 */
const OLD_WEAPON: Record<OldWeaponKind, WeaponKind> = { axe: 'sword', mace: 'sword', maul: 'greatsword', longbow: 'bow' };

interface OffhandDef {
  /** Also the id stem and the icon: the three bases are kind + 1, 2, 3 (e.g. 'shield2'). */
  kind: OffhandKind;
  /** The main-hand weapon kinds it can be worn with (see canPair). */
  pairsWith: readonly WeaponKind[];
  names: Three<string>;
  implicit: readonly ImplicitLine[];
}

const OFFHAND_KINDS: readonly OffhandDef[] = [
  { kind: 'shield', pairsWith: ['sword'], names: ['Iron Buckler', 'Steel Shield', 'War Shield'], implicit: [{ stat: 'armor', at1: 7, perLevel: 4.5 }, { stat: 'maxLife', at1: 5, perLevel: 2 }] },
  { kind: 'quiver', pairsWith: ['bow'], names: ['Hide Quiver', 'Leather Quiver', 'Studded Quiver'], implicit: [{ stat: 'critChance', tiers: [3, 4, 5] }, { stat: 'atkSpeed', tiers: [2, 3, 4] }] },
  { kind: 'focus', pairsWith: ['wand'], names: ['Glass Focus', 'Crystal Focus', 'Runed Focus'], implicit: [{ stat: 'maxMana', at1: 8, perLevel: 2.5 }, { stat: 'cdr', tiers: [2, 3, 4] }] },
];

/** Gear any class can wear. */
interface GearDef {
  /** Id stem: the three bases are id + 1, 2, 3 (e.g. 'plate2'). Saved games store these, so never rename one. */
  id: string;
  slot: Slot;
  icon: IconKey;
  names: Three<string>;
  implicit: readonly ImplicitLine[];
}

// Name ladders, so a tier is recognisable at a glance: metal is Iron -> Steel -> War,
// leather is Hide -> Leather -> Studded, cloth is Linen -> Silk -> Velvet.
const GEAR_KINDS: readonly GearDef[] = [
  // helm slot
  { id: 'helm', slot: 'helm', icon: 'helm', names: ['Iron Cap', 'Steel Helm', 'War Helm'], implicit: [{ stat: 'armor', at1: 5, perLevel: 3 }] },
  { id: 'hood', slot: 'helm', icon: 'hood', names: ['Cloth Hood', 'Leather Hood', 'Mail Hood'], implicit: [{ stat: 'armor', at1: 3, perLevel: 1.8 }, { stat: 'maxLife', at1: 5, perLevel: 2 }] },
  // chest slot
  { id: 'plate', slot: 'chest', icon: 'armor', names: ['Iron Plate', 'Steel Plate', 'War Plate'], implicit: [{ stat: 'armor', at1: 8, perLevel: 5 }] },
  { id: 'jerkin', slot: 'chest', icon: 'armor', names: ['Hide Jerkin', 'Leather Jerkin', 'Studded Jerkin'], implicit: [{ stat: 'armor', at1: 5, perLevel: 3 }, { stat: 'moveSpeed', tiers: [2, 3, 4] }] },
  { id: 'robe', slot: 'chest', icon: 'robe', names: ['Linen Robe', 'Silk Robe', 'Velvet Robe'], implicit: [{ stat: 'maxMana', at1: 10, perLevel: 3 }, { stat: 'armor', at1: 2, perLevel: 1.2 }] },
  // gloves slot
  { id: 'gauntlets', slot: 'gloves', icon: 'gloves', names: ['Iron Gauntlets', 'Steel Gauntlets', 'War Gauntlets'], implicit: [{ stat: 'armor', at1: 3, perLevel: 2 }] },
  { id: 'leathergloves', slot: 'gloves', icon: 'gloves', names: ['Hide Gloves', 'Leather Gloves', 'Studded Gloves'], implicit: [{ stat: 'atkSpeed', tiers: [3, 4, 5] }] },
  { id: 'silkgloves', slot: 'gloves', icon: 'gloves', names: ['Linen Gloves', 'Silk Gloves', 'Velvet Gloves'], implicit: [{ stat: 'maxMana', at1: 5, perLevel: 1.5 }] },
  // belt slot
  { id: 'leatherbelt', slot: 'belt', icon: 'belt', names: ['Hide Belt', 'Leather Belt', 'Studded Belt'], implicit: [{ stat: 'maxLife', at1: 6, perLevel: 2 }] },
  { id: 'heavybelt', slot: 'belt', icon: 'belt', names: ['Iron Belt', 'Steel Belt', 'War Belt'], implicit: [{ stat: 'armor', at1: 3, perLevel: 2 }] },
  { id: 'sash', slot: 'belt', icon: 'belt', names: ['Linen Sash', 'Silk Sash', 'Velvet Sash'], implicit: [{ stat: 'maxMana', at1: 5, perLevel: 1.5 }] },
  // boots slot
  { id: 'greaves', slot: 'boots', icon: 'boots', names: ['Iron Greaves', 'Steel Greaves', 'War Greaves'], implicit: [{ stat: 'armor', at1: 3, perLevel: 2 }] },
  { id: 'leatherboots', slot: 'boots', icon: 'boots', names: ['Hide Boots', 'Leather Boots', 'Studded Boots'], implicit: [{ stat: 'moveSpeed', tiers: [4, 6, 8] }] },
  // ring slot: red stones give life, blue stones give mana
  { id: 'lifering', slot: 'ring', icon: 'ring', names: ['Jasper Ring', 'Garnet Ring', 'Ruby Ring'], implicit: [{ stat: 'maxLife', at1: 5, perLevel: 1.5 }] },
  { id: 'manaring', slot: 'ring', icon: 'ring', names: ['Azurite Ring', 'Topaz Ring', 'Sapphire Ring'], implicit: [{ stat: 'maxMana', at1: 4, perLevel: 1.2 }] },
  // amulet slot: one attribute each
  { id: 'stramulet', slot: 'amulet', icon: 'amulet', names: ['Flint Amulet', 'Onyx Amulet', 'Obsidian Amulet'], implicit: [{ stat: 'str', at1: 2, perLevel: 0.4 }] },
  { id: 'dexamulet', slot: 'amulet', icon: 'amulet', names: ['Jade Amulet', 'Peridot Amulet', 'Emerald Amulet'], implicit: [{ stat: 'dex', at1: 2, perLevel: 0.4 }] },
  { id: 'intamulet', slot: 'amulet', icon: 'amulet', names: ['Quartz Amulet', 'Opal Amulet', 'Amethyst Amulet'], implicit: [{ stat: 'int', at1: 2, perLevel: 0.4 }] },
];

// =============================================================================================
// TUNING: DROPS

/** Chance weights for the slot of a random drop. */
const SLOT_WEIGHTS: Record<Slot, number> = { mainhand: 18, offhand: 9, chest: 12, helm: 11, gloves: 11, belt: 9, boots: 11, ring: 12, amulet: 7 };
/**
 * With RollOpts.forWeapon set, this share of main-hand drops is the kind of weapon the hero is
 * carrying, and this share of off-hand drops the piece that goes with it; the rest is any kind.
 * (Until Version 12 four in five were pieces of the hero's own class. Now nothing is anyone's own:
 * half of what is found fits the weapon in hand, and the other half is there to tempt.)
 */
const HELD_PIECE_CHANCE = 0.5;
/**
 * Character level needed to equip an item: its item level (the dungeon it was rolled for), never
 * below 1. Until Version 11.1 it was item level x 2 - 1 (1, 3, 5, ...), which went with a pace of
 * about two levels a dungeon. Levels now come half as often (TUNE.xpScale), and a character
 * arriving in dungeon 5 at level 7 could wear nothing that fell there: tools/count_levels.ts
 * prints the level a character has at the end of each dungeon, which must stay at or above this.
 */
const REQ_LEVEL_PER_ILVL = 1;
const REQ_LEVEL_OFFSET = 0;

/** The character level an item of this item level asks for. */
export function reqLevelFor(ilvl: number): number {
  const v = Number.isFinite(ilvl) ? Math.floor(ilvl) : 1;
  return Math.max(1, REQ_LEVEL_PER_ILVL * v + REQ_LEVEL_OFFSET);
}

/**
 * Chances in 100 of Normal, Magic and Rare. Rarity grows as you play (the owner, 4 Oct 2026:
 * "early on there can be white rarity gear with only a few blue items, yellow items should be
 * pretty rare": the good things on gear are meant to be put there with words). In the first
 * dungeon they are RARITY_START; every dungeon after it moves RARITY_STEP from Normal to Magic and
 * to Rare, until those reach RARITY_CAP (Magic at dungeon 13, Rare at dungeon 11). Magic find
 * multiplies the chances of Magic and Rare by (1 + magicFind / 100).
 */
const RARITY_START: Three<number> = [89, 10, 1];
const RARITY_STEP: readonly [magic: number, rare: number] = [2.2, 0.4];
const RARITY_CAP: readonly [magic: number, rare: number] = [36, 5];
/** A Magic item has 1 affix, or with this chance 2 (one prefix and one suffix). */
const MAGIC_TWO_AFFIX_CHANCE = 0.4;
/** A Rare item has 3 affixes, or with this chance 4 (two prefixes and two suffixes). */
const RARE_FOUR_AFFIX_CHANCE = 0.4;
/** With an odd number of affixes (1 or 3), how often the odd one out is a prefix rather than a suffix. */
const ODD_AFFIX_IS_PREFIX_CHANCE = 0.5;

// =============================================================================================
// TUNING: AFFIXES

/** First item level of affix tiers 1-4: the bands are 1-3, 4-7, 8-12 and 13+. The tier picks the label word. */
const AFFIX_TIER_FROM_ILVL: Four<number> = [1, 4, 8, 13];
/** Affix ranges are written down at these two item levels. Other levels lie on the straight line through them. */
const AFFIX_LOW_ILVL = 1;
const AFFIX_HIGH_ILVL = 15;
/** An "Adds X-Y Damage" affix averages this share of a same-level plain sword hit. */
const ADDED_DAMAGE_SHARE: Range = [0.2, 0.3];
/** Every affix family is equally likely unless its row in AFFIX_FAMILIES ends with its own weight. */
const DEFAULT_AFFIX_WEIGHT = 10;

// What an affix does past AFFIX_HIGH_ILVL:
/** Plain amounts (life, armour, attributes...) keep climbing at the same pace, as monsters do. */
const GROWS = true;
/** Percentages stay at their level-15 range, so stacking them cannot run away in deep dungeons. */
const LEVELS_OFF = false;

// Slot groups used by the affix and imbue tables.
const ALL_SLOTS: readonly Slot[] = SLOTS;
const NOT_MAINHAND: readonly Slot[] = ['offhand', 'helm', 'chest', 'gloves', 'belt', 'boots', 'amulet', 'ring'];
/** Pieces that can carry armour. */
const ARMOUR_SLOTS: readonly Slot[] = ['offhand', 'helm', 'chest', 'gloves', 'belt', 'boots'];
/** The damage-dealing pieces. */
const OFFENCE_SLOTS: readonly Slot[] = ['mainhand', 'gloves', 'ring', 'amulet'];
/** The same plus the off-hand, for the damage affixes an off-hand shares with them. */
const OFFENCE_AND_OFFHAND: readonly Slot[] = ['mainhand', 'offhand', 'gloves', 'ring', 'amulet'];
/** The protective pieces. */
const DEFENCE_SLOTS: readonly Slot[] = ['offhand', 'helm', 'chest', 'belt', 'boots'];
const REGEN_SLOTS: readonly Slot[] = ['offhand', 'helm', 'chest', 'belt', 'ring', 'amulet'];
const FIND_SLOTS: readonly Slot[] = ['helm', 'belt', 'boots', 'ring', 'amulet'];

interface FamilyDef {
  /** An affix id is this plus its tier, e.g. 'life3'. Saved games store these, so never rename one. */
  id: string;
  kind: 'prefix' | 'suffix';
  /** The stat it grants. 'damage' is the special pair dmgMin + dmgMax ("Adds X-Y Damage"). */
  stat: StatKey | 'damage';
  /** The slots it may appear on. */
  slots: readonly Slot[];
  /** [lowest, highest] roll at item level 1 and at item level 15. */
  at1: Range;
  at15: Range;
  /** GROWS or LEVELS_OFF. */
  grows: boolean;
  /** Name fragment for tiers 1-4. */
  labels: Four<string>;
  /** Relative chance to be picked among the affixes allowed on the slot. */
  weight: number;
}

// One item never carries two affixes of the same family.
const AFFIX_FAMILIES: readonly FamilyDef[] = [
  //     id           stat          slots               level 1     level 15    past 15     tier 1 .. tier 4 label
  prefix('life',      'maxLife',    NOT_MAINHAND,       [8, 15],    [50, 80],   GROWS,      ['Hearty', 'Hardy', 'Stalwart', 'Undying']),
  prefix('mana',      'maxMana',    NOT_MAINHAND,       [6, 12],    [35, 60],   GROWS,      ['Glimmering', 'Flowing', 'Brimming', 'Boundless']),
  prefix('armor',     'armor',      ARMOUR_SLOTS,       [4, 8],     [40, 70],   GROWS,      ['Padded', 'Sturdy', 'Reinforced', 'Impervious']),
  prefix('dmg',       'dmgPct',     OFFENCE_AND_OFFHAND, [6, 12],   [25, 45],   LEVELS_OFF, ['Keen', 'Fierce', 'Wrathful', 'Ruinous']),
  prefix('adddmg',    'damage',     OFFENCE_SLOTS,      addedDamageAt(AFFIX_LOW_ILVL), addedDamageAt(AFFIX_HIGH_ILVL), GROWS, ['Barbed', 'Spiked', 'Serrated', 'Rending']),
  prefix('phys',      'physPct',    OFFENCE_SLOTS,      [6, 12],    [25, 45],   LEVELS_OFF, ['Heavy', 'Forceful', 'Crushing', 'Sundering']),
  prefix('fire',      'firePct',    OFFENCE_AND_OFFHAND, [6, 12],   [25, 45],   LEVELS_OFF, ['Smoky', 'Kindled', 'Blazing', 'Infernal']),
  prefix('frost',     'frostPct',   OFFENCE_AND_OFFHAND, [6, 12],   [25, 45],   LEVELS_OFF, ['Chilly', 'Frosted', 'Icebound', 'Glacial']),
  prefix('light',     'lightPct',   OFFENCE_AND_OFFHAND, [6, 12],   [25, 45],   LEVELS_OFF, ['Static', 'Crackling', 'Arcing', 'Thundering']),

  suffix('str',       'str',        ALL_SLOTS,          [2, 5],     [10, 18],   GROWS,      ['of the Ram', 'of the Boar', 'of the Bull', 'of the Bear']),
  suffix('dex',       'dex',        ALL_SLOTS,          [2, 5],     [10, 18],   GROWS,      ['of the Hare', 'of the Fox', 'of the Hawk', 'of the Lynx']),
  suffix('int',       'int',        ALL_SLOTS,          [2, 5],     [10, 18],   GROWS,      ['of the Novice', 'of the Scribe', 'of the Sage', 'of the Oracle']),
  suffix('aspd',      'atkSpeed',   ['mainhand', 'gloves', 'ring'], [4, 7], [10, 18], LEVELS_OFF, ['of Briskness', 'of Haste', 'of Zeal', 'of Frenzy']),
  suffix('crit',      'critChance', OFFENCE_AND_OFFHAND, [2, 4],    [6, 10],    LEVELS_OFF, ['of Focus', 'of Insight', 'of Precision', 'of Certainty']),
  suffix('critdmg',   'critMult',   ['mainhand', 'amulet'], [10, 18], [30, 50],   LEVELS_OFF, ['of Spite', 'of Malice', 'of Cruelty', 'of Execution']),
  suffix('move',      'moveSpeed',  ['boots'],          [5, 8],     [12, 20],   LEVELS_OFF, ['of the Path', 'of the Road', 'of the Wind', 'of the Gale']),
  suffix('liferegen', 'lifeRegen',  REGEN_SLOTS,        [0.3, 0.6], [2, 4],     GROWS,      ['of Mending', 'of Renewal', 'of Regrowth', 'of Rebirth']),
  suffix('manaregen', 'manaRegen',  REGEN_SLOTS,        [0.3, 0.6], [2, 4],     GROWS,      ['of Calm', 'of Clarity', 'of Serenity', 'of the Font']),
  suffix('loh',       'lifeOnHit',  ['mainhand', 'ring', 'gloves'], [0.5, 1], [3, 5], GROWS,  ['of Sipping', 'of Thirst', 'of Feasting', 'of Devouring']),
  suffix('lok',       'lifeOnKill', ['mainhand', 'ring', 'amulet'], [2, 4], [10, 18], GROWS,  ['of Gleaning', 'of Reaping', 'of Harvest', 'of Carnage']),
  suffix('cdr',       'cdr',        ['offhand', 'helm', 'amulet'], [3, 5],     [8, 14],    LEVELS_OFF, ['of Timing', 'of Readiness', 'of Recovery', 'of Quickening']),
  suffix('area',      'areaPct',    ['mainhand', 'amulet'], [5, 9],   [15, 25],   LEVELS_OFF, ['of Reach', 'of Breadth', 'of Expanse', 'of the Horizon']),
  suffix('fireres',   'fireRes',    NOT_MAINHAND,       [8, 14],    [25, 40],   LEVELS_OFF, ['of the Hearth', 'of the Brazier', 'of the Forge', 'of the Pyre']),
  suffix('frostres',  'frostRes',   NOT_MAINHAND,       [8, 14],    [25, 40],   LEVELS_OFF, ['of Wool', 'of Fur', 'of the Thaw', 'of Midsummer']),
  suffix('lightres',  'lightRes',   NOT_MAINHAND,       [8, 14],    [25, 40],   LEVELS_OFF, ['of Grounding', 'of Earthing', 'of the Lull', 'of Clear Skies']),
  suffix('gold',      'goldFind',   FIND_SLOTS,         [8, 15],    [30, 50],   LEVELS_OFF, ['of Pennies', 'of Coin', 'of Plenty', 'of Riches']),
  suffix('mf',        'magicFind',  FIND_SLOTS,         [8, 15],    [30, 50],   LEVELS_OFF, ['of Luck', 'of Omens', 'of Windfall', 'of Providence']),
  // (Version 19.3: two stats that come only from a word burned into gear, never rolled on a drop: weight 0. Their sizes are set here, for the imbue.)
  prefix('stun',      'stunChance', ALL_SLOTS,          [3, 5],     [8, 12],    LEVELS_OFF, ['Jarring', 'Stunning', 'Dazing', 'Shattering'], 0),
  prefix('block',     'blockChance', ALL_SLOTS,         [3, 5],     [8, 12],    LEVELS_OFF, ['Braced', 'Guarded', 'Bulwarked', 'Unbroken'], 0),
  // (WORDS4: two more of the same kind, Mystical's spell damage and Pulling's reach for gold and orbs)
  prefix('spell',     'spellPct',   OFFENCE_SLOTS,      [6, 12],    [25, 45],   LEVELS_OFF, ['Mystic', 'Arcane', 'Eldritch', 'Sorcerous'], 0),
  prefix('reach',     'pickupPct',  ALL_SLOTS,          [15, 25],   [35, 50],   LEVELS_OFF, ['Drawing', 'Beckoning', 'Luring', 'Magnetic'], 0),
];

// Row builders for the table above. An optional last argument overrides DEFAULT_AFFIX_WEIGHT for that row.
function prefix(id: string, stat: FamilyDef['stat'], slots: readonly Slot[], at1: Range, at15: Range, grows: boolean, labels: Four<string>, weight = DEFAULT_AFFIX_WEIGHT): FamilyDef {
  return { id, kind: 'prefix', stat, slots, at1, at15, grows, labels, weight };
}

function suffix(id: string, stat: FamilyDef['stat'], slots: readonly Slot[], at1: Range, at15: Range, grows: boolean, labels: Four<string>, weight = DEFAULT_AFFIX_WEIGHT): FamilyDef {
  return { id, kind: 'suffix', stat, slots, at1, at15, grows, labels, weight };
}

// =============================================================================================
// TUNING: IMBUES (a power word burned into a gear piece)

/** An imbue rolls in the range of a same-level affix of the same stat, times this. */
const IMBUE_STRENGTH = 1.2;

/** How many properties a piece holds in all: the affixes it came with and the words burned into it. */
export const ITEM_ROOM = 4;

type ImbueChoice = readonly ['prefix' | 'suffix', StatKey];
interface ImbueRule {
  slots: readonly Slot[];
  /** One or two choices. With two, imbueItem picks one at random. */
  options: readonly ImbueChoice[];
}

/**
 * Word -> what it becomes on each slot. Every word lists every slot exactly once. The main hand,
 * gloves, ring and amulet get the offensive version; off-hand, helm, chest, belt and boots the
 * protective one.
 */
const IMBUE_TABLE: Record<WordId, readonly ImbueRule[]> = {
  power: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'physPct'], ['suffix', 'str']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'armor'], ['suffix', 'str']] },
  ],
  swift: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'atkSpeed'], ['suffix', 'dex']] },
    { slots: ['boots'], options: [['prefix', 'moveSpeed'], ['suffix', 'dex']] },
    { slots: ['offhand', 'helm', 'chest', 'belt'], options: [['prefix', 'cdr'], ['suffix', 'dex']] },
  ],
  twin: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'critChance'], ['suffix', 'dex']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'critMult'], ['suffix', 'dex']] },
  ],
  fire: elementImbue('firePct', 'fireRes'),
  frost: elementImbue('frostPct', 'frostRes'),
  lightning: elementImbue('lightPct', 'lightRes'),
  leech: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'lifeOnHit'], ['suffix', 'lifeOnKill']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'maxLife'], ['suffix', 'lifeRegen']] },
  ],
  volatile: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'areaPct'], ['suffix', 'int']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'maxMana'], ['suffix', 'int']] },
  ],
  // THE NEW WORDS (his doc "Wordsmith: The New Words", his yes of 8 Oct 2026, 16:53): Heavy a chance
  // to stun, Precise critical chance, Frenzied attack speed, Guarding a chance to block (his own
  // words page's gear for three of them); each, or its attribute
  heavy: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'stunChance'], ['suffix', 'str']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'armor'], ['suffix', 'str']] },
  ],
  precise: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'critChance'], ['suffix', 'dex']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'critMult'], ['suffix', 'dex']] },
  ],
  frenzied: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'atkSpeed'], ['suffix', 'str']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'moveSpeed'], ['suffix', 'str']] },
  ],
  guarding: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'blockChance'], ['suffix', 'str']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'blockChance'], ['suffix', 'str']] },
  ],
  // (there is no poison damage or poison resistance on gear yet: poison grows with all damage, and is outlasted with life)
  poison: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'dmgPct'], ['suffix', 'dex']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'maxLife'], ['suffix', 'dex']] },
  ],
  // THE WORDS STILL TO COME (WORDS4; his doc's "On gear"): Mystical spell damage, or mana on the
  // protective pieces; Pulling gold and orbs from further; Splitting and Hexing more damage;
  // Stilling faster cooldowns; each, or its attribute
  mystical: [
    { slots: OFFENCE_SLOTS, options: [['prefix', 'spellPct'], ['suffix', 'int']] },
    { slots: DEFENCE_SLOTS, options: [['prefix', 'maxMana'], ['suffix', 'int']] },
  ],
  pulling: [{ slots: ALL_SLOTS, options: [['prefix', 'pickupPct'], ['suffix', 'int']] }],
  splitting: [{ slots: ALL_SLOTS, options: [['prefix', 'dmgPct'], ['suffix', 'dex']] }],
  hexing: [{ slots: ALL_SLOTS, options: [['prefix', 'dmgPct'], ['suffix', 'int']] }],
  stilling: [{ slots: ALL_SLOTS, options: [['prefix', 'cdr'], ['suffix', 'int']] }],
};

/** VOLATILE BY DEXTERITY (WORDS4, his words of 5 Oct): on gear too its attribute is Dexterity. */
const VOLATILE_BY_DEX: readonly ImbueRule[] = [
  { slots: OFFENCE_SLOTS, options: [['prefix', 'areaPct'], ['suffix', 'dex']] },
  { slots: DEFENCE_SLOTS, options: [['prefix', 'maxMana'], ['suffix', 'dex']] },
];
/** What a word becomes on gear, as the game has it now (Volatile's attribute follows WORDS4). */
function imbueTable(word: WordId): readonly ImbueRule[] {
  if (word === 'volatile' && WORDS4.on) return VOLATILE_BY_DEX;
  return IMBUE_TABLE[word] ?? IMBUE_TABLE.power;
}

/** The three element words share one pattern: damage on the weapon, resistance on protective pieces, either on the rest. */
function elementImbue(damage: StatKey, resistance: StatKey): ImbueRule[] {
  return [
    { slots: ['mainhand'], options: [['prefix', damage]] },
    { slots: ['gloves', 'ring', 'amulet'], options: [['prefix', damage], ['suffix', resistance]] },
    { slots: DEFENCE_SLOTS, options: [['suffix', resistance]] },
  ];
}

// =============================================================================================
// TUNING: NAMES OF RARE ITEMS ("<first word> <second word>", e.g. "Grim Fang")

const RARE_FIRST_WORDS: readonly string[] = [
  'Grim', 'Ash', 'Dusk', 'Hollow', 'Ember', 'Storm', 'Dread', 'Pale', 'Blight', 'Raven', 'Cinder', 'Gloom',
  'Thorn', 'Wraith', 'Rune', 'Bone', 'Shadow', 'Frost', 'Blood', 'Iron', 'Night', 'Bitter', 'Doom', 'Sorrow',
];

/** The second word depends on the slot (for an off-hand: on its kind), so the name suits the item. */
type RareNameGroup = Exclude<Slot, 'offhand'> | OffhandKind;
const RARE_SECOND_WORDS: Record<RareNameGroup, readonly string[]> = {
  mainhand: ['Fang', 'Bite', 'Bane', 'Thirst', 'Song', 'Sting', 'Spite', 'Wrath', 'Howl', 'Ruin', 'Call', 'Scar'],
  shield: ['Wall', 'Bulwark', 'Aegis', 'Rampart', 'Bastion', 'Barrier', 'Shelter', 'Refuge'],
  quiver: ['Flight', 'Volley', 'Nest', 'Sheaf', 'Hail', 'Barb', 'Feather', 'Flock'],
  focus: ['Orb', 'Prism', 'Lens', 'Sigil', 'Whisper', 'Dream', 'Riddle', 'Glyph'],
  helm: ['Crown', 'Brow', 'Visage', 'Gaze', 'Crest', 'Cowl', 'Mask', 'Veil'],
  chest: ['Shell', 'Hide', 'Mantle', 'Ward', 'Shroud', 'Coat', 'Guard', 'Husk'],
  gloves: ['Grasp', 'Clutch', 'Touch', 'Fist', 'Grip', 'Hold', 'Claw', 'Hand'],
  belt: ['Cinch', 'Girdle', 'Cord', 'Clasp', 'Buckle', 'Strap', 'Lash', 'Tether'],
  boots: ['Stride', 'Tread', 'Trail', 'Step', 'Spur', 'Track', 'March', 'Path'],
  ring: ['Loop', 'Coil', 'Band', 'Circle', 'Knot', 'Whorl', 'Spiral', 'Eye'],
  amulet: ['Heart', 'Tear', 'Charm', 'Token', 'Star', 'Locket', 'Beads', 'Idol'],
};

// =============================================================================================
// TUNING: SCORE AND GOLD VALUE

/** itemScore: points per point of weapon damage per second. */
const SCORE_PER_DPS = 10;
/** itemScore: "adds damage" on gear other than a weapon is scored as if swung this many times a second. */
const SCORE_ASSUMED_APS = 1.2;
/** itemScore: a class's own attribute counts this many times as much as the other two. */
const CLASS_ATTRIBUTE_BONUS = 2;
const CLASS_ATTRIBUTE: Record<ClassId, StatKey> = { warrior: 'str', ranger: 'dex', mage: 'int' };

/** itemScore: points per point of each stat. Roughly, one average affix of any kind is worth about the same. */
const SCORE_PER_POINT: Record<StatKey, number> = {
  str: 2.5,
  dex: 2.5,
  int: 2.5,
  dmgMin: 0, // damage is scored through SCORE_PER_DPS instead
  dmgMax: 0,
  dmgPct: 2,
  physPct: 1.2,
  firePct: 1.2,
  frostPct: 1.2,
  lightPct: 1.2,
  atkSpeed: 4.5,
  critChance: 7,
  critMult: 1.5,
  maxLife: 1,
  lifeRegen: 15,
  lifeOnHit: 12,
  lifeOnKill: 3,
  maxMana: 0.8,
  manaRegen: 15,
  armor: 1,
  fireRes: 1.2,
  frostRes: 1.2,
  lightRes: 1.2,
  moveSpeed: 3,
  cdr: 4,
  areaPct: 2,
  goldFind: 0.5,
  magicFind: 0.6,
  stunChance: 5,
  blockChance: 5,
  spellPct: 1.2,
  pickupPct: 0.5,
};

/** itemValue: gold for a Normal helm at item level 1, and the gold each further level adds. */
const VALUE_AT_LEVEL_1 = 12;
const VALUE_PER_LEVEL = 6;
const VALUE_BY_SLOT: Record<Slot, number> = { mainhand: 1.5, offhand: 1.2, chest: 1.3, helm: 1, gloves: 0.9, belt: 0.9, boots: 0.9, ring: 1.2, amulet: 1.4 };
/** itemValue: multiplier for Normal, Magic, Rare, Unique. */
const VALUE_BY_RARITY: Four<number> = [1, 2.5, 6, 15];
/** itemValue: multiplier for the base's name tier 1-3. */
const VALUE_BY_BASE_TIER: Three<number> = [1, 1.15, 1.3];
/** itemValue: each affix adds this share on top. */
const VALUE_PER_AFFIX = 0.15;
/** itemValue: multiplier for each word burned into a piece. */
const VALUE_IMBUED = 1.2;

// =============================================================================================
// CODE
// =============================================================================================

// ---------------------------------------------------------------------------------------------
// Text

/**
 * The two limits on abilities (see Limit) each leave one kind of stat without a job: with
 * cooldowns there is no mana to have more of, and with mana there is no cooldown to shorten.
 * So that no piece of gear carries a dead line, such a stat does the other limit's work instead:
 *   - cooldowns: mana on gear quickens cooldowns (MANA_AS_CDR; stats.ts does the sum)
 *   - mana: cooldown recovery makes abilities cheaper (words.ts already does this)
 * and it is written the way it works: "+1.2% Cooldown Recovery", "-5% Mana Cost".
 */
export const MANA_AS_CDR = {
  /** % cooldown recovery for each point of Max Mana on gear. */
  perMana: 0.1,
  /** % cooldown recovery for each point of Mana Regen on gear. */
  perRegen: 2,
};

/** How a stat is named and counted under this limit: `mult` turns its value into what is shown, `less` shows it as a reduction. */
export function statView(stat: StatKey, limit: Limit): StatInfo & { mult: number; less: boolean } {
  if (limit === 'cooldown' && stat === 'maxMana') return { label: STAT_INFO.cdr.label, pct: true, dp: 1, mult: MANA_AS_CDR.perMana, less: false };
  if (limit === 'cooldown' && stat === 'manaRegen') return { label: STAT_INFO.cdr.label, pct: true, dp: 1, mult: MANA_AS_CDR.perRegen, less: false };
  if (limit === 'mana' && stat === 'cdr') return { label: 'Mana Cost', pct: true, dp: 0, mult: 1, less: true };
  return { ...STAT_INFO[stat], mult: 1, less: false };
}

/** "+12% Attack Speed", "+8 Strength", "+0.6 Life Regen". Never empty. */
export function modText(m: StatMod, limit: Limit): string {
  const known = STAT_INFO[m.stat] as StatInfo | undefined;
  // A stat this build does not know (say, from a newer save) still gets a readable line.
  if (!known) return `${m.value < 0 ? '-' : '+'}${Math.abs(m.value)} ${m.stat}`;
  const info = statView(m.stat, limit);
  const sign = m.value < 0 !== info.less ? '-' : '+';
  return `${sign}${Math.abs(m.value * info.mult).toFixed(info.dp)}${info.pct ? '%' : ''} ${info.label}`;
}

/** Text lines for a list of mods, merging a dmgMin + dmgMax pair into one "Adds 3-7 Damage" line. */
export function modLines(mods: readonly StatMod[], limit: Limit): string[] {
  // The first dmgMin pairs with the first dmgMax, the second with the second, and so on.
  const minAt: number[] = [];
  const maxAt: number[] = [];
  mods.forEach((m, i) => {
    if (m.stat === 'dmgMin') minAt.push(i);
    else if (m.stat === 'dmgMax') maxAt.push(i);
  });
  const merged = new Map<number, string>(); // position of the pair's first half -> the combined line
  const hidden = new Set<number>(); // position of the pair's second half
  for (let k = 0; k < Math.min(minAt.length, maxAt.length); k++) {
    const lo = mods[minAt[k]].value.toFixed(STAT_INFO.dmgMin.dp);
    const hi = mods[maxAt[k]].value.toFixed(STAT_INFO.dmgMax.dp);
    merged.set(Math.min(minAt[k], maxAt[k]), `Adds ${lo}-${hi} Damage`);
    hidden.add(Math.max(minAt[k], maxAt[k]));
  }
  const lines: string[] = [];
  mods.forEach((m, i) => {
    if (!hidden.has(i)) lines.push(merged.get(i) ?? modText(m, limit));
  });
  return lines;
}

// ---------------------------------------------------------------------------------------------
// Small number helpers

/** Item levels are whole numbers from 1 up. Anything else (0, a fraction, NaN) is tidied, not rejected. */
function cleanLevel(ilvl: number): number {
  return Number.isFinite(ilvl) ? Math.max(1, Math.floor(ilvl)) : 1;
}

/** Round to the number of decimals this stat keeps (whole numbers, or one decimal for regen and life on hit). */
function roundStat(stat: StatKey, value: number): number {
  const scale = 10 ** STAT_INFO[stat].dp;
  return Math.round(value * scale) / scale;
}

/** A random value for this stat between lo and hi (both included), in the stat's own decimals. Never below one step. */
function rollStat(stat: StatKey, lo: number, hi: number, rng: RNG): number {
  const scale = 10 ** STAT_INFO[stat].dp;
  const a = Math.max(1, Math.round(lo * scale));
  const b = Math.max(a, Math.round(hi * scale));
  return rng.int(a, b) / scale;
}

/** Average hit of the plainest sword at this item level: the yardstick for all damage numbers. */
function swordHit(ilvl: number): number {
  return SWORD_HIT_AT_LEVEL_1 * (1 + HIT_GROWTH_PER_LEVEL * (ilvl - 1));
}

/** The [low, high] average of an "Adds X-Y Damage" affix at this item level. */
function addedDamageAt(ilvl: number): Range {
  return [ADDED_DAMAGE_SHARE[0] * swordHit(ilvl), ADDED_DAMAGE_SHARE[1] * swordHit(ilvl)];
}

/**
 * Whole-number [min, max] for a wanted average hit. min + max is fixed first so the average stays on
 * target (that is what keeps weapon kinds balanced); then the split nearest MIN_DAMAGE_RATIO is chosen.
 * Always 1 <= min < max.
 */
function damageRange(average: number): [number, number] {
  const sum = Math.max(3, Math.round(average * 2));
  const idealMax = sum / (1 + MIN_DAMAGE_RATIO);
  let best: [number, number] = [1, sum - 1];
  let bestError = Infinity;
  for (const max of [Math.floor(idealMax), Math.ceil(idealMax)]) {
    const min = sum - max;
    if (min < 1 || min >= max) continue;
    const error = Math.abs(min / max - MIN_DAMAGE_RATIO);
    if (error < bestError) {
      best = [min, max];
      bestError = error;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------------------------
// Bases

export interface ItemBase {
  /** Stable id stored in saves, e.g. 'sword2'. */
  id: string;
  name: string;
  slot: Slot;
  icon: IconKey;
  /** Always null since Version 12: any character can use any weapon. (Item keeps the field so that older saves read.) */
  cls: ClassId | null;
  /** Main-hand pieces: the weapon kind. Everything else: null. */
  weapon: WeaponKind | null;
  /** Off-hand pieces: the kind. Everything else: null. */
  offhand: OffhandKind | null;
  /** Weapons: 1 or 2 hands. Everything else: 0. */
  hands: 0 | 1 | 2;
  /** Weapons: attacks per second. Everything else: 0. */
  aps: number;
  /** The lowest item level this base drops at. */
  minIlvl: number;
  /** The built-in modifiers of this base at an item level. */
  implicit: (ilvl: number) => StatMod[];
}

/** One kind of base (e.g. all swords): its three names, weakest first. */
interface BaseGroup {
  slot: Slot;
  /** Main-hand groups: the weapon kind. */
  weapon: WeaponKind | null;
  /** Off-hand groups: the weapon kinds the piece goes with. */
  pairsWith: readonly WeaponKind[];
  tiers: ItemBase[];
}

/** Value of one built-in bonus for a name tier (0-2) at an item level. */
function implicitMod(line: ImplicitLine, tier: number, ilvl: number): StatMod {
  if ('tiers' in line) return { stat: line.stat, value: line.tiers[tier] };
  const plain = line.at1 + line.perLevel * (ilvl - 1);
  // Walk up the tiers so a better name is always at least one step better, even when the numbers are small.
  const step = 1 / 10 ** STAT_INFO[line.stat].dp;
  let value = 0;
  for (let t = 0; t <= tier; t++) value = Math.max(value + step, roundStat(line.stat, plain * GEAR_TIER_BONUS[t]));
  return { stat: line.stat, value: roundStat(line.stat, value) };
}

function weaponDamage(w: WeaponDef, tier: number, ilvl: number): StatMod[] {
  // A hit is worth a sword's hit times (sword speed / this speed), so damage per second comes out as a
  // sword's times the kind's dps factor, whatever the speed.
  const plain = swordHit(ilvl) * w.dps * (REFERENCE_APS / w.aps);
  // min + max, walking up the tiers so a better name is always at least one point better.
  let sum = 0;
  for (let t = 0; t <= tier; t++) sum = Math.max(sum + 1, Math.round(2 * plain * WEAPON_TIER_BONUS[t]));
  const [min, max] = damageRange(sum / 2);
  return [
    { stat: 'dmgMin', value: min },
    { stat: 'dmgMax', value: max },
  ];
}

function buildBaseGroups(): BaseGroup[] {
  const groups: BaseGroup[] = [];
  for (const w of WEAPON_KINDS) {
    const tiers = w.names.map(
      (name, tier): ItemBase => ({
        id: `${w.kind}${tier + 1}`,
        name,
        slot: 'mainhand',
        icon: w.kind,
        cls: null,
        weapon: w.kind,
        offhand: null,
        hands: w.hands,
        aps: w.aps,
        minIlvl: BASE_TIER_MIN_ILVL[tier],
        implicit: (ilvl) => {
          const level = cleanLevel(ilvl);
          return [...weaponDamage(w, tier, level), ...w.extra.map((line) => implicitMod(line, tier, level))];
        },
      }),
    );
    groups.push({ slot: 'mainhand', weapon: w.kind, pairsWith: [], tiers });
  }
  for (const o of OFFHAND_KINDS) {
    const tiers = o.names.map(
      (name, tier): ItemBase => ({
        id: `${o.kind}${tier + 1}`,
        name,
        slot: 'offhand',
        icon: o.kind,
        cls: null,
        weapon: null,
        offhand: o.kind,
        hands: 0,
        aps: 0,
        minIlvl: BASE_TIER_MIN_ILVL[tier],
        implicit: (ilvl) => o.implicit.map((line) => implicitMod(line, tier, cleanLevel(ilvl))),
      }),
    );
    groups.push({ slot: 'offhand', weapon: null, pairsWith: o.pairsWith, tiers });
  }
  for (const g of GEAR_KINDS) {
    const tiers = g.names.map(
      (name, tier): ItemBase => ({
        id: `${g.id}${tier + 1}`,
        name,
        slot: g.slot,
        icon: g.icon,
        cls: null,
        weapon: null,
        offhand: null,
        hands: 0,
        aps: 0,
        minIlvl: BASE_TIER_MIN_ILVL[tier],
        implicit: (ilvl) => g.implicit.map((line) => implicitMod(line, tier, cleanLevel(ilvl))),
      }),
    );
    groups.push({ slot: g.slot, weapon: null, pairsWith: [], tiers });
  }
  return groups;
}

const BASE_GROUPS: readonly BaseGroup[] = buildBaseGroups();

export const ITEM_BASES: readonly ItemBase[] = BASE_GROUPS.flatMap((g) => g.tiers);

/** Base id -> name tier (0, 1 or 2). */
const BASE_TIER = new Map<string, number>();
for (const g of BASE_GROUPS) g.tiers.forEach((b, tier) => BASE_TIER.set(b.id, tier));

// ---------------------------------------------------------------------------------------------
// Random generation

export interface RollOpts {
  /** Force the slot. Default: random by SLOT_WEIGHTS. */
  slot?: Slot;
  /** Force the rarity (0 Normal, 1 Magic, 2 Rare). Default: random, by the item level's chances (rarityChances) and magicFind. */
  rarity?: Rarity;
  /** When the rarity is rolled: multiply the chance of Magic and of Rare (a hoard is likelier to hold something good). Default [1, 1]. */
  luck?: readonly [magic: number, rare: number];
  /** When the rarity is rolled: the least it can be. A lower roll is raised to it. */
  atLeast?: Rarity;
  /** The weapon the hero is carrying: half the main-hand drops will then be that kind, and half the off-hand drops the piece that goes with it. */
  forWeapon?: WeaponKind | null;
  /** Main hand and off hand only: the piece is one of these weapons, or the piece that goes with one of them (what one of the town's vendors deals in). */
  weapons?: readonly WeaponKind[];
  /** The hero's magic find in %, used only when the rarity is rolled. */
  magicFind?: number;
}

let nextUid = 1;

/** Item uids come from a module counter; after loading a save call this with (largest saved uid + 1). */
export function setNextUid(n: number): void {
  if (Number.isFinite(n)) nextUid = Math.max(1, Math.floor(n));
}

/** Make sure new items get uids above `n` (never lowers the counter). */
export function reserveUids(n: number): void {
  if (Number.isFinite(n)) nextUid = Math.max(nextUid, Math.floor(n) + 1);
}

function makeItem(base: ItemBase, ilvl: number, rarity: Rarity, affixes: Affix[], name: string): Item {
  return {
    uid: nextUid++,
    baseId: base.id,
    baseName: base.name,
    name,
    slot: base.slot,
    rarity,
    ilvl,
    icon: base.icon,
    cls: base.cls,
    weapon: base.weapon,
    offhand: base.offhand,
    hands: base.hands,
    aps: base.aps,
    reqLevel: reqLevelFor(ilvl),
    implicit: base.implicit(ilvl),
    affixes,
    imbues: [],
  };
}

function rollSlot(rng: RNG): Slot {
  return rng.weighted(SLOTS, (s) => SLOT_WEIGHTS[s]);
}

/** The chances in 100 of Normal, Magic and Rare at an item level, before magic find and luck. */
export function rarityChances(ilvl: number): Three<number> {
  const n = Math.max(0, cleanLevel(ilvl) - 1);
  const magic = Math.min(RARITY_CAP[0], RARITY_START[1] + RARITY_STEP[0] * n);
  const rare = Math.min(RARITY_CAP[1], RARITY_START[2] + RARITY_STEP[1] * n);
  return [100 - magic - rare, magic, rare];
}

function rollRarity(rng: RNG, ilvl: number, magicFind: number, luck: readonly [number, number] | undefined, atLeast: Rarity | undefined): Rarity {
  const boost = Number.isFinite(magicFind) ? Math.max(0, 1 + magicFind / 100) : 1;
  const good = (v: number | undefined): number => (v !== undefined && Number.isFinite(v) && v > 0 ? v : 1);
  const w = rarityChances(ilvl);
  const i = rng.weightedIndex([w[0], w[1] * boost * good(luck?.[0]), w[2] * boost * good(luck?.[1])]);
  const rolled: Rarity = i === 2 ? 2 : i === 1 ? 1 : 0;
  const least: Rarity = atLeast === undefined ? 0 : atLeast >= 2 ? 2 : atLeast === 1 ? 1 : 0;
  return rolled < least ? least : rolled;
}

function pickBase(slot: Slot, ilvl: number, rng: RNG, forWeapon?: WeaponKind | null, weapons?: readonly WeaponKind[]): ItemBase {
  let groups = BASE_GROUPS.filter((g) => g.slot === slot);
  if ((slot === 'mainhand' || slot === 'offhand') && weapons && weapons.length > 0) {
    const own = groups.filter((g) => (g.weapon !== null && weapons.includes(g.weapon)) || g.pairsWith.some((w) => weapons.includes(w)));
    if (own.length > 0) groups = own;
  }
  // Main-hand and off-hand pieces: lean toward what goes with the weapon in the hero's hand.
  if ((slot === 'mainhand' || slot === 'offhand') && forWeapon && rng.chance(HELD_PIECE_CHANCE)) {
    const usable = groups.filter((g) => g.weapon === forWeapon || g.pairsWith.includes(forWeapon));
    if (usable.length > 0) groups = usable;
  }
  const group = rng.pick(groups);
  // Every kind has a level-1 name, so at least one is always unlocked.
  const unlocked = group.tiers.filter((b) => b.minIlvl <= ilvl);
  const best = unlocked[unlocked.length - 1];
  if (unlocked.length === 1 || rng.chance(TOP_TIER_CHANCE)) return best;
  return rng.pick(unlocked.slice(0, -1));
}

/** Affix tier (1-4) for an item level. */
function affixTier(ilvl: number): number {
  let tier = 1;
  AFFIX_TIER_FROM_ILVL.forEach((from, i) => {
    if (ilvl >= from) tier = i + 1;
  });
  return tier;
}

/** The [low, high] range of a family at an item level, before rounding. */
function familyRange(f: FamilyDef, ilvl: number): Range {
  const level = f.grows ? ilvl : Math.min(ilvl, AFFIX_HIGH_ILVL);
  const t = (level - AFFIX_LOW_ILVL) / (AFFIX_HIGH_ILVL - AFFIX_LOW_ILVL);
  return [f.at1[0] + (f.at15[0] - f.at1[0]) * t, f.at1[1] + (f.at15[1] - f.at1[1]) * t];
}

function rollAffix(f: FamilyDef, ilvl: number, rng: RNG): Affix {
  const tier = affixTier(ilvl);
  const [lo, hi] = familyRange(f, ilvl);
  let mods: StatMod[];
  if (f.stat === 'damage') {
    const [min, max] = damageRange(rng.range(lo, hi));
    mods = [
      { stat: 'dmgMin', value: min },
      { stat: 'dmgMax', value: max },
    ];
  } else {
    mods = [{ stat: f.stat, value: rollStat(f.stat, lo, hi, rng) }];
  }
  return { id: `${f.id}${tier}`, kind: f.kind, tier, label: f.labels[tier - 1], mods };
}

/** Pick `count` different families of one kind that are allowed on the slot. */
function pickFamilies(kind: 'prefix' | 'suffix', slot: Slot, count: number, rng: RNG): FamilyDef[] {
  const pool = AFFIX_FAMILIES.filter((f) => f.kind === kind && f.slots.includes(slot));
  const picked: FamilyDef[] = [];
  while (picked.length < count && pool.length > 0) {
    const i = rng.weightedIndex(pool.map((f) => f.weight));
    picked.push(pool[i]);
    pool.splice(i, 1); // taken out, so the same family cannot come up twice
  }
  return picked;
}

function rollAffixes(slot: Slot, ilvl: number, rarity: Rarity, rng: RNG): Affix[] {
  if (rarity === 0) return [];
  let prefixes: number;
  let suffixes: number;
  if (rarity === 1) {
    // Magic: one prefix, one suffix, or one of each.
    if (rng.chance(MAGIC_TWO_AFFIX_CHANCE)) [prefixes, suffixes] = [1, 1];
    else [prefixes, suffixes] = rng.chance(ODD_AFFIX_IS_PREFIX_CHANCE) ? [1, 0] : [0, 1];
  } else {
    // Rare: two of each, or two of one and one of the other.
    if (rng.chance(RARE_FOUR_AFFIX_CHANCE)) [prefixes, suffixes] = [2, 2];
    else [prefixes, suffixes] = rng.chance(ODD_AFFIX_IS_PREFIX_CHANCE) ? [2, 1] : [1, 2];
  }
  const families = [...pickFamilies('prefix', slot, prefixes, rng), ...pickFamilies('suffix', slot, suffixes, rng)];
  return families.map((f) => rollAffix(f, ilvl, rng));
}

function nameFor(base: ItemBase, rarity: Rarity, affixes: readonly Affix[], rng: RNG): string {
  if (rarity === 0) return base.name;
  if (rarity === 1) {
    const prefix = affixes.find((a) => a.kind === 'prefix');
    const suffix = affixes.find((a) => a.kind === 'suffix');
    return [prefix?.label, base.name, suffix?.label].filter((part) => part !== undefined).join(' ');
  }
  return `${rng.pick(RARE_FIRST_WORDS)} ${rng.pick(RARE_SECOND_WORDS[rareNameGroup(base)])}`;
}

function rareNameGroup(base: ItemBase): RareNameGroup {
  if (base.offhand !== null) return base.offhand;
  // Every off-hand base has a kind, so the 'shield' here is never reached; it only completes the type.
  return base.slot === 'offhand' ? 'shield' : base.slot;
}

/** A random item for a dungeon of this item level. The same rng state and arguments give the same item (bar the uid). */
export function rollItem(ilvl: number, rng: RNG, opts: RollOpts = {}): Item {
  const level = cleanLevel(ilvl);
  const slot = opts.slot !== undefined && SLOTS.includes(opts.slot) ? opts.slot : rollSlot(rng);
  const base = pickBase(slot, level, rng, opts.forWeapon, opts.weapons);
  // Unique (3) is reserved for hand-made items and is never rolled; asking for it gives a Rare.
  const rarity: Rarity = opts.rarity === undefined ? rollRarity(rng, level, opts.magicFind ?? 0, opts.luck, opts.atLeast) : opts.rarity >= 2 ? 2 : opts.rarity === 1 ? 1 : 0;
  const affixes = rollAffixes(slot, level, rarity, rng);
  return makeItem(base, level, rarity, affixes, nameFor(base, rarity, affixes, rng));
}

const WEAPON_KIND_NAME: Record<WeaponKind, string> = { sword: 'Sword', greatsword: 'Greatsword', bow: 'Bow', wand: 'Wand', staff: 'Staff' };
const OFFHAND_KIND_NAME: Record<OffhandKind, string> = { shield: 'Shield', quiver: 'Quiver', focus: 'Focus' };
const SLOT_KIND_NAME: Record<Slot, string> = { mainhand: 'Weapon', offhand: 'Off hand', helm: 'Helmet', chest: 'Armour', gloves: 'Gloves', belt: 'Belt', boots: 'Boots', amulet: 'Amulet', ring: 'Ring' };

/**
 * What kind of thing an item is, in one word: "Sword", "Amulet", "Helmet". This is all that is
 * written over a piece of loot on the floor (the owner: "we just want it to say amulet or sword
 * not the actual name of the item. It will lower screen clutter"); its name and what it does are
 * in the inventory.
 */
export function kindName(it: Item): string {
  if (it.weapon !== null) return WEAPON_KIND_NAME[it.weapon];
  if (it.offhand !== null) return OFFHAND_KIND_NAME[it.offhand];
  return SLOT_KIND_NAME[it.slot];
}

/** The plain Normal-rarity weapon a new character of this class starts with (ilvl 1). */
export function starterWeapon(cls: ClassId): Item {
  return plainWeapon((CLASSES[cls] ?? CLASSES.warrior).starts);
}

/** The plainest weapon of a kind: Normal rarity, its weakest name, item level 1. */
export function plainWeapon(kind: WeaponKind, ilvl = 1): Item {
  const base = ITEM_BASES.find((b) => b.weapon === kind && b.minIlvl === BASE_TIER_MIN_ILVL[0]) ?? ITEM_BASES[0];
  return makeItem(base, cleanLevel(ilvl), 0, [], base.name);
}

/**
 * Bring an item from an older save up to date, in place (and return it). Since Version 12 no
 * weapon belongs to a class, and the axe, the mace, the maul and the longbow are gone: one of
 * those becomes the sword, the greatsword or the bow of the same name tier and item level, with
 * that weapon's own speed and damage; its affixes, its words and its rarity stay as they were.
 * Since Version 13.2 the one word a piece could hold (`imbue`) is the first of a list (`imbues`).
 * Anything already up to date comes back unchanged.
 */
export function migrateItem(it: Item): Item {
  if (!it || typeof it !== 'object') return it;
  it.cls = null;
  // Version 13.2: a piece holds a list of words, where it held one. And the colour follows the
  // count of its properties: a white piece that carried a word is blue from now on.
  const old = it as Item & { imbue?: Imbue | null };
  if (!Array.isArray(it.imbues)) it.imbues = old.imbue && typeof old.imbue === 'object' ? [old.imbue] : [];
  it.imbues = it.imbues.filter((im) => !!im && typeof im === 'object' && Array.isArray(im.mods));
  delete old.imbue;
  if (!Array.isArray(it.affixes)) it.affixes = [];
  if (it.rarity < 3) it.rarity = Math.max(it.rarity, rarityFor(it.affixes.length + it.imbues.length)) as Rarity;
  const was = it.weapon as string | null;
  if (was !== null && Object.prototype.hasOwnProperty.call(OLD_WEAPON, was)) {
    const kind = OLD_WEAPON[was as OldWeaponKind];
    const digit = Number.parseInt(String(it.baseId).slice(-1), 10);
    const tier = Number.isFinite(digit) ? Math.max(0, Math.min(2, digit - 1)) : 0;
    const base = ITEM_BASES.find((b) => b.id === `${kind}${tier + 1}`) ?? ITEM_BASES.find((b) => b.weapon === kind);
    if (base) {
      if (typeof it.name === 'string' && typeof it.baseName === 'string' && it.name.includes(it.baseName)) it.name = it.name.replace(it.baseName, base.name);
      it.baseId = base.id;
      it.baseName = base.name;
      it.icon = base.icon;
      it.weapon = base.weapon;
      it.hands = base.hands;
      it.aps = base.aps;
      it.implicit = base.implicit(it.ilvl);
    }
  }
  return it;
}

/**
 * True when the off-hand piece can be worn together with that main-hand weapon: a shield needs a
 * one-handed sword; a quiver a bow; a focus a wand. Never with empty hands.
 */
export function canPair(main: Item | null, off: Item): boolean {
  if (main === null || main.weapon === null || off.offhand === null) return false;
  const kind = OFFHAND_KINDS.find((o) => o.kind === off.offhand);
  return kind !== undefined && kind.pairsWith.includes(main.weapon);
}

// ---------------------------------------------------------------------------------------------
// Imbuing

export interface ImbueOption {
  kind: 'prefix' | 'suffix';
  stat: StatKey;
  /** Lowest and highest value it can roll (both included). */
  min: number;
  max: number;
}

/** The affix family that sets the size of each single stat. */
const FAMILY_BY_STAT = new Map<StatKey, FamilyDef>();
for (const f of AFFIX_FAMILIES) if (f.stat !== 'damage') FAMILY_BY_STAT.set(f.stat, f);

/** What a word may become on gear, as the Lexicon tells it: for each group of slots, the stats it can turn into there. */
export function imbueRules(word: WordId): { slots: readonly Slot[]; stats: StatKey[] }[] {
  return imbueTable(word).map((r) => ({ slots: r.slots, stats: r.options.map((o) => o[1]) }));
}

/** The 1-2 modifiers this word can become on this slot at this item level. Never empty. */
export function imbueOptions(word: WordId, slot: Slot, ilvl: number): ImbueOption[] {
  const level = cleanLevel(ilvl);
  // The table covers every word and slot; the fallbacks only keep a bad save from breaking the game.
  const rules = imbueTable(word);
  const rule = rules.find((r) => r.slots.includes(slot)) ?? rules[0];
  return rule.options.map(([kind, stat]) => {
    const family = FAMILY_BY_STAT.get(stat);
    const [lo, hi] = family ? familyRange(family, level) : [1, 1];
    const step = 1 / 10 ** STAT_INFO[stat].dp;
    const min = Math.max(step, roundStat(stat, lo * IMBUE_STRENGTH));
    const max = Math.max(min, roundStat(stat, hi * IMBUE_STRENGTH));
    return { kind, stat, min, max };
  });
}

/** How many more words a piece will take: four properties in all, less the affixes it came with and the words already in it. */
export function itemRoom(item: Item): number {
  return Math.max(0, ITEM_ROOM - item.affixes.length - item.imbues.length);
}

/** The colour that goes with a count of properties: none is Normal (white), one or two Magic (blue), three or four Rare (yellow). */
export function rarityFor(count: number): Rarity {
  return count >= 3 ? 2 : count >= 1 ? 1 : 0;
}

/** The properties a piece already carries: those of its affixes and of the words burned into it. (What is built into its base does not count: an affix may repeat that too.) */
function carried(item: Item): Set<StatKey> {
  const have = new Set<StatKey>();
  for (const a of item.affixes) for (const m of a.mods) have.add(m.stat);
  for (const im of item.imbues) for (const m of im.mods) have.add(m.stat);
  return have;
}

/**
 * What this word can still become on THIS piece: imbueOptions for its slot and level, less
 * whatever the piece already carries (a piece never has the same property twice). Empty when
 * the piece has no room left, or when it already has everything the word could give it.
 */
export function imbueOptionsFor(item: Item, word: WordId): ImbueOption[] {
  if (itemRoom(item) <= 0) return [];
  const have = carried(item);
  return imbueOptions(word, item.slot, item.ilvl).filter((o) => !have.has(o.stat));
}

/** Why this word cannot be burned into this piece, or null if it can. */
export function imbueProblem(item: Item, word: WordId): string | null {
  if (itemRoom(item) <= 0) return 'That piece is full';
  if (imbueOptionsFor(item, word).length === 0) return 'It already has what this word gives';
  return null;
}

/**
 * Burn a word into an item: it is added to item.imbues (a piece has room for four properties in
 * all) and returned; null, and nothing changes, if the piece has no room or already carries
 * everything the word could become there (imbueProblem says which). `choice` picks which of
 * imbueOptionsFor() to take; left out, one is picked at random. The size is always rolled. The
 * piece's colour follows the count of its properties.
 */
export function imbueItem(item: Item, word: WordId, rng: RNG, choice?: number): Imbue | null {
  const options = imbueOptionsFor(item, word);
  if (options.length === 0) return null;
  const picked = choice !== undefined && Number.isInteger(choice) && choice >= 0 && choice < options.length ? options[choice] : undefined;
  const option = picked ?? (options.length > 1 ? rng.pick(options) : options[0]);
  const imbue: Imbue = {
    word,
    kind: option.kind,
    mods: [{ stat: option.stat, value: rollStat(option.stat, option.min, option.max, rng) }],
  };
  item.imbues.push(imbue);
  if (item.rarity < 3) item.rarity = Math.max(item.rarity, rarityFor(item.affixes.length + item.imbues.length)) as Rarity;
  return imbue;
}

// ---------------------------------------------------------------------------------------------
// Totals, score and price

/** implicit + every affix's mods + the mods of every word burned in, as one flat list. */
export function itemMods(item: Item): StatMod[] {
  const mods: StatMod[] = [];
  const add = (list: readonly StatMod[]): void => {
    for (const m of list) mods.push({ stat: m.stat, value: m.value }); // copies, so callers cannot alter the item
  };
  add(item.implicit);
  for (const a of item.affixes) add(a.mods);
  for (const im of item.imbues) add(im.mods);
  return mods;
}

/**
 * Rough power score for upgrade hints and sorting; weights attributes by class (str for warrior, dex for
 * ranger, int for mage).
 */
export function itemScore(item: Item, cls: ClassId): number {
  // Each point of dmgMin or dmgMax is half a point of average hit; hits per second turn that into dps.
  const perDamagePoint = (SCORE_PER_DPS / 2) * (item.aps > 0 ? item.aps : SCORE_ASSUMED_APS);
  let score = 0;
  for (const m of itemMods(item)) {
    if (m.stat === 'dmgMin' || m.stat === 'dmgMax') score += m.value * perDamagePoint;
    else score += m.value * (SCORE_PER_POINT[m.stat] ?? 0) * (m.stat === CLASS_ATTRIBUTE[cls] ? CLASS_ATTRIBUTE_BONUS : 1);
  }
  return Math.round(score);
}

/** Gold price to buy from a vendor. Selling pays a quarter of this. Always >= 1. */
/** What a plain piece (Normal, the weakest name of its kind, nothing on it) for this slot is worth at an item level: what the stranger's price is counted from. */
export function plainValue(slot: Slot, ilvl: number): number {
  return Math.max(1, Math.round((VALUE_AT_LEVEL_1 + VALUE_PER_LEVEL * (cleanLevel(ilvl) - 1)) * (VALUE_BY_SLOT[slot] ?? 1)));
}

export function itemValue(item: Item): number {
  const value =
    (VALUE_AT_LEVEL_1 + VALUE_PER_LEVEL * (cleanLevel(item.ilvl) - 1)) *
    (VALUE_BY_SLOT[item.slot] ?? 1) *
    (VALUE_BY_RARITY[item.rarity] ?? 1) *
    VALUE_BY_BASE_TIER[BASE_TIER.get(item.baseId) ?? 0] *
    (1 + VALUE_PER_AFFIX * item.affixes.length) *
    VALUE_IMBUED ** item.imbues.length;
  return Math.max(1, Math.round(value));
}
