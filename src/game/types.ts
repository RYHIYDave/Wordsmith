// Shared data shapes. Game rules, dungeon generation, items and art all agree on these.

import type { YardPlan } from './yard';
export interface Vec {
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------------------------
// Classes, attributes, abilities, power words

/** The first three classes, painted over the bones (art/heroes3.ts). */
export type FirstClass = 'warrior' | 'ranger' | 'mage';
/** Every class: the first three, and the new ones as they come (THE WARLOCK: game/warlock.ts, behind WARLOCK; THE TINKERER: game/tinkerer.ts, behind TINKERER). */
export type ClassId = FirstClass | 'warlock' | 'tinkerer' | 'brawler';
/** The classes a new hero may be made as, always (the warlock is offered beside them while WARLOCK is on: game/warlock.ts, playableClasses). */
export const CLASS_IDS: readonly FirstClass[] = ['warrior', 'ranger', 'mage'];
/** Every class there is (a save of any of them is read back). */
export const ALL_CLASS_IDS: readonly ClassId[] = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];

/** The three attributes. Every class uses all three. */
export type Attr = 'str' | 'dex' | 'int';
export const ATTRS: readonly Attr[] = ['str', 'dex', 'int'];

/** The pictures the attacks are shown by: one for each attack a weapon or a class gives, plus the universal dodge. */
export type AbilityId = 'strike' | 'slam' | 'whirl' | 'leap' | 'shot' | 'volley' | 'trap' | 'wave' | 'orb' | 'beam' | 'familiar' | 'warp'
  // (THE WARLOCK, game/warlock.ts: his three as a man and the demon's three)
  | 'hellbolt' | 'curse' | 'smokestep' | 'rake' | 'damning' | 'demonstep'
  // (THE TINKERER, game/tinkerer.ts: her Vial Toss, her Contraption, her Golem and her blast jump)
  | 'vialtoss' | 'contraption' | 'golem' | 'blastjump'
  // (THE BRAWLER, game/brawler.ts: his tap, his tap and hold, his slip and counter)
  | 'jab' | 'cross' | 'slip'
  // (THE VETERAN, behind VETERAN: his Punch (a tap), his Kick (a hold), his Jump (a swipe); art/veteran_icons.ts, a first pass
  // to show him)
  | 'vetpunch' | 'vetkick' | 'vetjump';

/** Power words: dropped by enemies, slotted into an ability to change it. */
export type BaseWordId = 'power' | 'swift' | 'twin' | 'fire' | 'frost' | 'lightning' | 'leech' | 'volatile' | 'poison' | 'heavy' | 'precise' | 'frenzied' | 'guarding' | 'pulling' | 'splitting' | 'hexing' | 'stilling' | 'binding'
  // (THE LAST WORDS: his seven of 8 Nov 2026, found from floor 16 down: LAST_WORD_IDS below)
  | 'piercing' | 'bleeding' | 'reaping' | 'culling' | 'surging' | 'plundering' | 'mirroring'
  // (HIS THREE NEW WORDS, 9 Nov 2026: Lasting, Fleeting and Vast, found from floor 6 like Precise and Heavy: game/defs.ts LASTING)
  | 'lasting' | 'fleeting' | 'vast';
/**
 * WORDMELDING (behind MELD, game/melds.ts): the melded words, each made at the wordsmith from two
 * damage words. They never drop: WORD_IDS, which every random draw of a word uses, holds none of them.
 */
export type MeldId = 'eruption' | 'avalanche' | 'thunder' | 'blight' | 'scald' | 'wildfire' | 'fumes' | 'hailstorm' | 'frostbite' | 'contagion'
  // (VOLATILE'S MELDS, behind VOLT_MELDS, game/melds.ts: the five of his page left out on 13 Oct, put in at his word of 21 Oct 2026)
  | 'demolition' | 'powderkeg' | 'shatter' | 'chainreaction' | 'rupture';
/**
 * RANK II (behind RANK2, game/melds.ts): a damage word at its second rank, made at the wordsmith by
 * melding two of the word. The owner, 18 Oct 2026, 08:49: "Please add the second level (poison+poison)
 * melding into the game". They never drop either: WORD_IDS holds none of them.
 */
export type RankId = 'power2' | 'fire2' | 'frost2' | 'lightning2' | 'poison2';
/** A word as a hero holds it and sets it in a socket: a power word, a melded one, or a ranked one. */
export type WordId = BaseWordId | MeldId | RankId;
// (THE NEW WORDS, his choice of 8 Oct 2026, 12:26, as his doc "Wordsmith: The New Words" plays them (his yes, 16:53): the first four, Heavy,
// Precise, Frenzied and Guarding, from Version 19.3; their looks are the art chat's, render/words3.ts)
// (THE CITY'S WORDS, Version 23.8: the other four, Pulling, Splitting, Hexing and Stilling, found only from floor 11 down: his words
// to the main chat, 21 Oct 2026, 18:25 Pacific, “And let’s add some words to levels 11-15”, and his picks of the four after it.
// Every list of words has them; what may drop on a floor is game/defs.ts `wordsAt`.)
export const WORD_IDS: readonly WordId[] = [
  'power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison', 'heavy', 'precise', 'frenzied', 'guarding', 'pulling', 'splitting', 'hexing', 'stilling', 'binding',
  'piercing', 'bleeding', 'reaping', 'culling', 'surging', 'plundering', 'mirroring',
  'lasting', 'fleeting', 'vast',
];
/** The city's words (the four of Version 23.8, and Binding), and the first level they are found on (game/defs.ts `wordsAt`; here for the map-maker, which reads no defs). */
export const DEEP_WORD_IDS: readonly WordId[] = ['pulling', 'splitting', 'hexing', 'stilling', 'binding'];
export const DEEP_WORDS_FROM = 11;
/**
 * WORDS BY FLOOR (his 4 Nov 2026, 19:07: “we should maybe keep just the main damage words for 1-5, then words like leech and twin and
 * precise and heavy come in 6-10.  Then we get stilling and pulling and all those in 11-15.  Then we need more in 16-20”; offered the
 * tiers, 8 Nov, by 12:09: “They aren’t perfect but I like that idea.  We need 6 in the prison because we have 6 characters and they
 * should each get a different word”, and of each hero's first: “I want frost for the mage and fire for the warlock.”). WORD_TIERS:
 * on `on`, the prison's six (each hero's first word one of them: game/defs.ts FIRST_WORD) on floors 1 to 5; from `mid` the rest of
 * the first thirteen; from DEEP_WORDS_FROM the city's; from LAST_WORDS_FROM the last words.
 */
export const PRISON_WORD_IDS: readonly WordId[] = ['power', 'poison', 'frost', 'fire', 'lightning', 'swift'];
export const WORD_TIERS = { on: true, mid: 6 };
/**
 * THE LAST WORDS (his words to the main chat, 8 Nov 2026, 06:44: “I want 6 more words for the last levels”, “At least 6”; 06:50,
 * “Add mirroring as well”; his picks of those offered: Piercing, Bleeding, Reaping, Culling, Surging, Plundering, Mirroring), found
 * only from floor 16 down, and on every endless level.
 */
export const LAST_WORD_IDS: readonly WordId[] = ['piercing', 'bleeding', 'reaping', 'culling', 'surging', 'plundering', 'mirroring'];
export const LAST_WORDS_FROM = 16;
/** The words that may be found at this level (its depth, or an endless level's power), in their order: the prison's six before floor 6 (WORD_TIERS), the thirteen before floor 11, the eighteen before 16, then all. */
export function wordsAt(power: number): readonly WordId[] {
  if (power >= LAST_WORDS_FROM) return WORD_IDS;
  if (WORD_TIERS.on && power < WORD_TIERS.mid) return WORD_IDS.filter((w) => PRISON_WORD_IDS.includes(w));
  return WORD_IDS.filter((w) => !LAST_WORD_IDS.includes(w) && (power >= DEEP_WORDS_FROM || !DEEP_WORD_IDS.includes(w)));
}
/** The melded words, in the order of his page "Wordsmith: Word Combinations" (Volatile's five left out, his pick of 13 Oct 2026, 12:36). */
export const MELD_IDS: readonly MeldId[] = ['eruption', 'avalanche', 'thunder', 'blight', 'scald', 'wildfire', 'fumes', 'hailstorm', 'frostbite', 'contagion'];
/** Each melded word's two words, in the order his page names them. */
export const MELD_OF: Readonly<Record<MeldId, readonly [BaseWordId, BaseWordId]>> = {
  eruption: ['power', 'fire'],
  avalanche: ['power', 'frost'],
  thunder: ['power', 'lightning'],
  blight: ['power', 'poison'],
  scald: ['fire', 'frost'],
  wildfire: ['fire', 'lightning'],
  fumes: ['fire', 'poison'],
  hailstorm: ['frost', 'lightning'],
  frostbite: ['frost', 'poison'],
  contagion: ['lightning', 'poison'],
  // (Volatile's five, as his page names them: "Power + Volatile", "Flame + Volatile" ...)
  demolition: ['power', 'volatile'],
  powderkeg: ['fire', 'volatile'],
  shatter: ['frost', 'volatile'],
  chainreaction: ['lightning', 'volatile'],
  rupture: ['poison', 'volatile'],
};
/**
 * VOLATILE'S MELDS (behind VOLT_MELDS, game/melds.ts): a damage word and Volatile, melded. MELD_IDS stays the ten, whose looks
 * are drawn (render/melds3.ts); these five are apart until theirs are.
 */
export const VOLT_MELD_IDS: readonly MeldId[] = ['demolition', 'powderkeg', 'shatter', 'chainreaction', 'rupture'];
/** RANK II: the five damage words' second ranks. */
export const RANK_IDS: readonly RankId[] = ['power2', 'fire2', 'frost2', 'lightning2', 'poison2'];
/** Each ranked word's word and rank. */
export const RANK_OF: Readonly<Record<RankId, { word: BaseWordId; rank: number }>> = {
  power2: { word: 'power', rank: 2 },
  fire2: { word: 'fire', rank: 2 },
  frost2: { word: 'frost', rank: 2 },
  lightning2: { word: 'lightning', rank: 2 },
  poison2: { word: 'poison', rank: 2 },
};
/** The words and the melded ones (RANK II's ranked words are apart: RANK_IDS; game/melds.ts, `wordIds`, is what a hero's words are kept over, switches and all). */
export const ALL_WORD_IDS: readonly WordId[] = [...WORD_IDS, ...MELD_IDS];
/** Every word a socket may hold, switches aside: the words, all the melds, the ranked words. The Physician keeps the word he
 *  draws by its place in this list (game/act1_rules/physician.ts); before Version 23.8 that list was ALL_WORD_IDS, and a
 *  ranked word drawn out of a socket was lost. */
export const HELD_WORD_IDS: readonly WordId[] = [...WORD_IDS, ...MELD_IDS, ...VOLT_MELD_IDS, ...RANK_IDS];

/** Damage types. An ability with no element word deals physical damage. */
export type Element = 'phys' | 'fire' | 'frost' | 'lightning';

/**
 * 'warden' is the boss that ends a dungeon. THE NEW MONSTERS (Version 19.9, game/defs.ts NEW_MONSTERS):
 * 'shade', 'boneward' and 'golem'; and the yellow packs' leaders, each a kind of its own and never a
 * pack of its own (game/defs.ts LEADERS): 'champion', the skeleton champion, who leads skeletons (not
 * the `champion` of a Monster, which is a guardian); 'marksman', the bone marksman, bone archers;
 * 'priest', the high priest, cultists; and 'chieftain', the troll chieftain, green trolls.
 */
export type MonsterKind =
  | 'skeleton' | 'archer' | 'cultist' | 'bat' | 'brute' | 'warden' | 'shade' | 'boneward' | 'golem' | 'champion' | 'marksman' | 'priest' | 'chieftain'
  // THE FIRST FIVE FLOORS (game/bosses.ts): the bosses of floors 2 to 5, the amalgamation's bone beast, and the cult's two fighters
  | 'headsman' | 'chained' | 'amalgam' | 'beast' | 'fleshmancer' | 'dagger' | 'minifm'
  // (the Amalgamation's bone mites, done the action way: its rain's skulls pulled together where they burst, game/bosses.ts AM_ACTION)
  | 'mite'
  // ACT 1, THE DESCENT (game/act1.ts): the cult's two new kinds; each floor's own creatures; the five bosses
  | 'chanter' | 'firepot'
  | 'qgolem' | 'rubbling' | 'vulture' | 'crawler' | 'scorpion' | 'devil' | 'deer' | 'wolf' | 'drowned' | 'leech' | 'spawn'
  | 'unfinished' | 'queen' | 'cantor' | 'stag' | 'eye'
  // ACT 2, THE HUSH (game/act1.ts ACT2; floors 11 to 15): the city's own (the Hushed townsfolk, the Hushed watch, the
  // Silent Order's scribes, the mute watch hounds), each floor's own, and the five bosses; the art chat's
  | 'hushed' | 'watch' | 'scribe' | 'hound'
  | 'rat' | 'dredger' | 'fieldhand' | 'carter' | 'patient' | 'orderly' | 'inkling' | 'bookwarden'
  | 'crier' | 'ratking' | 'palimpsest' | 'physician' | 'censor'
  // ACT 2, THE HUSH: floor 13's double boss in place of the Palimpsest, the Scraper and the Quill (game/act1_rules/pair.ts)
  | 'scraper' | 'quill'
  // ACT 2, PART TWO, THE HIGH CITY (game/act1.ts HIGH_CITY): floor 16's own (the swans, the Hushed gardeners and grooms, the
  // palace guard) and its boss, the Princess; the art chat's
  | 'swan' | 'gardener' | 'groom' | 'pguard' | 'princess'
  // (floor 17, the Masque: the footmen, the masked dancers, the Silent Order; the Prince)
  | 'footman' | 'dancer' | 'order' | 'prince'
  // (floor 18, the Glass Gallery: the ladies-in-waiting, the queen's guard, your own reflections; the Queen (floor 5's Carrion Queen is 'queen'))
  | 'lady' | 'qguard' | 'reflection' | 'gqueen'
  // (floor 19, the Keep: the king's knights, the crossbowmen on the walls (the Silent Order's armed last is 'order'); the King)
  | 'kknight' | 'xbow' | 'gking'
  // (floor 20, the Quiet Tower: the Hush in its own shapes, the shadows of the four royals (the Silent Order's last masks are
  // 'order'); the Moth)
  | 'hshape' | 'rshadow' | 'moth'
  // (floor 20's frost creature, the art chat's, behind RIME_SHADE_ON: game/act1_rules/rshade.ts)
  | 'rshade'
  // (floor 3's side boss, the furnace's keeper, the art chat's: game/act1_rules/stoker.ts, the quest line's, game/quests15.ts)
  | 'stoker';
/** The monsters of Version 14 (the figures the tests of their pictures go through). */
export const MONSTER_KINDS: readonly MonsterKind[] = ['skeleton', 'archer', 'cultist', 'bat', 'brute', 'warden'];
/** THE NEW MONSTERS (Version 19.9): the art chat's, painted on the heroes' bones. */
export const NEW_KINDS: readonly MonsterKind[] = ['shade', 'boneward', 'golem', 'champion', 'marksman', 'priest', 'chieftain'];
/**
 * THE FIRST FIVE FLOORS (game/bosses.ts): the art chat's bosses of floors 2 to 5 (the Headsman, the
 * Chained One, the ossuary amalgamation with the bone beasts that break off it, and the Fleshmancer),
 * and the cult's two fighters of floors 4 and 5 (the dagger cultist and the mini fleshmancer).
 */
export const FIRST5_KINDS: readonly MonsterKind[] = ['headsman', 'chained', 'amalgam', 'beast', 'fleshmancer', 'dagger', 'minifm'];
/** ACT 1, THE DESCENT (game/act1.ts): the cult's two new kinds, the floors' own creatures and the five bosses, the art chat's. */
export const ACT1_KINDS: readonly MonsterKind[] = ['chanter', 'firepot', 'qgolem', 'rubbling', 'vulture', 'crawler', 'scorpion', 'devil', 'deer', 'wolf', 'drowned', 'leech', 'spawn', 'unfinished', 'queen', 'cantor', 'stag', 'eye', 'stoker'];
/** ACT 2, THE HUSH (game/act1.ts ACT2): floors 11 to 15's own mobs and their five bosses, the art chat's (its branches mockup/act2-gateward to mockup/act2-library). */
export const ACT2_MOBS: readonly MonsterKind[] = ['hushed', 'watch', 'scribe', 'hound', 'rat', 'dredger', 'fieldhand', 'carter', 'patient', 'orderly', 'inkling', 'bookwarden'];
export const ACT2_BOSSES: readonly MonsterKind[] = ['crier', 'ratking', 'palimpsest', 'physician', 'censor', 'scraper', 'quill'];
export const ACT2_KINDS: readonly MonsterKind[] = [...ACT2_MOBS, ...ACT2_BOSSES];
/** ACT 2, PART TWO, THE HIGH CITY (game/act1.ts HIGH_CITY): its floors' own mobs and their bosses, the art chat's (mockup/high-city-all). */
export const HIGH_MOBS: readonly MonsterKind[] = ['swan', 'gardener', 'groom', 'pguard', 'footman', 'dancer', 'order', 'lady', 'qguard', 'reflection', 'kknight', 'xbow', 'hshape', 'rshadow', 'rshade'];
export const HIGH_BOSSES: readonly MonsterKind[] = ['princess', 'prince', 'gqueen', 'gking', 'moth'];
export const HIGH_KINDS: readonly MonsterKind[] = [...HIGH_MOBS, ...HIGH_BOSSES];

// ---------------------------------------------------------------------------------------------
// Stats. Every number a character has is one of these keys. Percentages are whole numbers
// (12 means 12%). Gear, attributes and power words all add into the same table.

export type StatKey =
  | 'str'
  | 'dex'
  | 'int'
  | 'dmgMin' // flat weapon damage (a weapon's own damage, and "adds X-Y damage" affixes)
  | 'dmgMax'
  // (FLAT DAMAGE, his 8 Nov 2026 “Craftabke on weapons and gloves and rings”: “adds X-Y fire damage”, to the hero's fire hits; frost's and lightning's the same)
  | 'fireMin'
  | 'fireMax'
  | 'frostMin'
  | 'frostMax'
  | 'lightMin'
  | 'lightMax'
  | 'dmgPct' // % increased damage, all sources
  | 'physPct' // % increased physical damage
  | 'firePct' // % increased fire damage
  | 'frostPct'
  | 'lightPct'
  | 'atkSpeed' // % increased attack and cast speed
  | 'critChance' // percentage points
  | 'critMult' // extra % damage on a critical hit (base 50 -> crits deal 150%)
  | 'maxLife'
  | 'lifeRegen' // life per second
  | 'lifeOnHit'
  | 'lifeOnKill'
  | 'maxMana'
  | 'manaRegen' // mana per second
  | 'armor' // reduces physical damage taken
  | 'fireRes' // % less fire damage taken (capped at 75)
  | 'frostRes'
  | 'lightRes'
  | 'moveSpeed' // % increased
  | 'cdr' // % cooldown recovery
  | 'areaPct' // % increased area of effect
  | 'goldFind' // % increased gold
  | 'magicFind' // % increased item rarity
  | 'stunChance' // % chance that a hit stuns (Heavy, burned into gear)
  | 'blockChance' // % chance to block a blow (Guarding, burned into gear)
  | 'pickupPct' // % further that gold and orbs fly to the hero from (Pulling, burned into gear: Version 23.8)
  // POISON DAMAGE (his words, 12 Nov 2026: “There really should be poison damage in the game”; his picks, “Over a few seconds,
  // stacking (Recommended)” and “On all gear, like fire (Recommended)”): items.ts POISON_DMG. Poison lands over the poison's
  // time and stacks, as the Poison word's does; the hero's poison of every kind is poison damage.
  | 'poisonMin' // "Adds X-Y Poison Damage to Poison Hits": more poison, over its time, on a hit that poisons
  | 'poisonMax'
  | 'poisonPct' // % increased poison damage (all the hero's poison)
  | 'poisonRes' // % less poison taken (capped as the others)
  // (THE LEVELING UNIQUES, game/uniques.ts LEVEL_DEFS: The Lantern Cap's price, his “Gimme -10% max life”)
  | 'maxLifePct'; // % more (or less) max life

export const STAT_KEYS: readonly StatKey[] = [
  'str', 'dex', 'int', 'dmgMin', 'dmgMax', 'fireMin', 'fireMax', 'frostMin', 'frostMax', 'lightMin', 'lightMax', 'dmgPct', 'physPct', 'firePct', 'frostPct', 'lightPct', 'atkSpeed',
  'critChance', 'critMult', 'maxLife', 'lifeRegen', 'lifeOnHit', 'lifeOnKill', 'maxMana', 'manaRegen',
  'armor', 'fireRes', 'frostRes', 'lightRes', 'moveSpeed', 'cdr', 'areaPct', 'goldFind', 'magicFind', 'stunChance', 'blockChance', 'pickupPct',
  'poisonMin', 'poisonMax', 'poisonPct', 'poisonRes', 'maxLifePct',
];

export type Stats = Record<StatKey, number>;

export interface StatMod {
  stat: StatKey;
  value: number;
}

// ---------------------------------------------------------------------------------------------
// Items

/** The kind of slot an item fits. A ring fits either ring slot. */
export type Slot = 'mainhand' | 'offhand' | 'helm' | 'chest' | 'gloves' | 'belt' | 'boots' | 'amulet' | 'ring';
export const SLOTS: readonly Slot[] = ['mainhand', 'offhand', 'helm', 'chest', 'gloves', 'belt', 'boots', 'amulet', 'ring'];

/** Where a piece is actually worn. */
export type EquipSlot = 'mainhand' | 'offhand' | 'helm' | 'chest' | 'gloves' | 'belt' | 'boots' | 'amulet' | 'ring1' | 'ring2';
export const EQUIP_SLOTS: readonly EquipSlot[] = [
  'mainhand', 'offhand', 'helm', 'chest', 'gloves', 'belt', 'boots', 'amulet', 'ring1', 'ring2',
];

/** 0 Normal, 1 Magic, 2 Rare, 3 Unique. */
export type Rarity = 0 | 1 | 2 | 3;
export const RARITY_NAMES = ['Normal', 'Magic', 'Rare', 'Unique'] as const;

/**
 * The weapons, since Version 12 (the owner: "boil the melee weapons down to just sword", "slower
 * harder hitting variants is good", "just a regular bow with a quiver off hand works fine"):
 * a sword (one-handed) and its two-handed variant; a bow (two-handed, but it takes a quiver); a
 * wand (one-handed) and its two-handed variant, the staff. Any character can use any of them, and
 * the weapon decides the quick attack (defs.ts, WEAPON_TAP).
 * THE NEW CLASSES' WEAPONS (behind NEW_WEAPONS, game/defs.ts, off): each new class's own, found only by a hero of that
 * class (ClassWeaponKind).
 */
export type WeaponKind = 'sword' | 'greatsword' | 'bow' | 'wand' | 'staff' | ClassWeaponKind | WarriorWeaponKind;
/** The five any hero may find (every list of weapons the game had before the new classes' own). */
export const WEAPONS: readonly WeaponKind[] = ['sword', 'greatsword', 'bow', 'wand', 'staff'];
/**
 * THE NEW CLASSES' WEAPONS (game/defs.ts NEW_WEAPONS, CLASS_WEAPON): the Veteran's brawler's wraps (two hands, nothing in
 * the other), the Warlock's demonic tome (one hand, a focus beside it), the Tinkerer's wrench (one hand, a shield beside it).
 * (The tome was the 'grimoire' until the art came: a saved piece of one loads as the tome, items.ts migrateItem.)
 */
export type ClassWeaponKind = 'wraps' | 'tome' | 'wrench';
export const CLASS_WEAPONS: readonly ClassWeaponKind[] = ['wraps', 'tome', 'wrench'];
/** Every kind of weapon there is: the five, and the new classes' own (a saved piece of any of them loads back as itself). */
/**
 * THE WARRIOR'S THREE WEAPONS (game/talents.ts WARRIOR_TREE2): his battle axe and his warhammer, the greatsword's numbers under their
 * own names; found only by a Warrior who has picked one (his greatswords found become it: items.ts asWarriorWeapon).
 */
export type WarriorWeaponKind = 'battleaxe' | 'warhammer';
export const WARRIOR_WEAPONS: readonly WarriorWeaponKind[] = ['battleaxe', 'warhammer'];
export const ALL_WEAPONS: readonly WeaponKind[] = [...WEAPONS, ...CLASS_WEAPONS, ...WARRIOR_WEAPONS];

/** Weapons that were in the game until Version 12. A saved item of one of these becomes the kind that took its place (items.ts, migrateItem). */
export type OldWeaponKind = 'axe' | 'mace' | 'maul' | 'longbow';

/** Off-hand pieces: a shield goes with a one-handed sword, a quiver with a bow, a focus with a wand. */
export type OffhandKind = 'shield' | 'quiver' | 'focus';

/**
 * Which 16x16 picture an item uses. (The old weapons keep their pictures: an old save may still show one for a moment.)
 * The new classes' weapons ('wraps', 'tome', 'wrench') have stand-in pictures in art/icons.ts, shown while ITEMS_A is off; with it
 * on, every item's picture is the art chat's (art/items_a.ts, asked for through art/icons.ts itemPic).
 */
export type IconKey = WeaponKind | OldWeaponKind | OffhandKind | 'helm' | 'hood' | 'armor' | 'robe' | 'gloves' | 'belt' | 'boots' | 'ring' | 'amulet';
export const ICON_KEYS: readonly IconKey[] = [
  'sword', 'axe', 'mace', 'greatsword', 'maul', 'bow', 'longbow', 'wand', 'staff', 'shield', 'quiver', 'focus',
  'helm', 'hood', 'armor', 'robe', 'gloves', 'belt', 'boots', 'ring', 'amulet',
  'wraps', 'tome', 'wrench',
];

export interface Affix {
  /** Stable id, e.g. 'life3'. */
  id: string;
  kind: 'prefix' | 'suffix';
  /** 1 = weakest tier. */
  tier: number;
  /** The name fragment this affix contributes: "Sturdy" (prefix) or "of the Bear" (suffix). */
  label: string;
  /** What it grants. Usually one entry; "adds X-Y damage" has two (dmgMin and dmgMax). */
  mods: StatMod[];
}

/** A power word burned into a gear piece: one modifier decided by the word and the slot. */
export interface Imbue {
  word: WordId;
  kind: 'prefix' | 'suffix';
  mods: StatMod[];
}

export interface Item {
  uid: number;
  baseId: string;
  /** e.g. "Short Sword". */
  baseName: string;
  /** Full display name, e.g. "Sturdy Short Sword of the Bear" or "Grim Fang". */
  name: string;
  slot: Slot;
  rarity: Rarity;
  /** Item level: the dungeon depth it was rolled for. */
  ilvl: number;
  icon: IconKey;
  /** Always null since Version 12 (any character can use any weapon). Kept so that older saves read. */
  cls: ClassId | null;
  /** Main-hand pieces: the weapon kind. null for everything else. */
  weapon: WeaponKind | null;
  /** Off-hand pieces: the kind. null for everything else. */
  offhand: OffhandKind | null;
  /** Weapons: 1 or 2 hands. 0 for everything else. A two-handed weapon leaves no room for an off-hand, except a bow's quiver. */
  hands: 0 | 1 | 2;
  /** Weapons only: attacks per second. 0 for everything else. */
  aps: number;
  /** Character level needed to equip it. */
  reqLevel: number;
  /** Built into the base type (a weapon's damage, a helm's armour). */
  implicit: StatMod[];
  /** Random modifiers. */
  affixes: Affix[];
  /**
   * The power words burned into this piece, in the order they were burned (Version 13.2: until
   * then a piece held one, `imbue`, and a new word took its place). A piece has room for four
   * properties in all, its affixes and these together (items.ts, ITEM_ROOM), and never carries
   * the same one twice.
   */
  imbues: Imbue[];
  /**
   * UNIQUE ITEMS (game/uniques.ts, behind UNIQUES): which unique it is (its id there). A unique is rarity 3, orange; its
   * `affixes` are its fixed list of ordinary stats, only their numbers rolled; no word is burned into it, and it will not
   * split or bind. Absent on every other piece.
   */
  unique?: string;
  /**
   * THE LEVELING UNIQUES (game/uniques.ts LEVEL_DEFS): what its own rule's numbers rolled to, by name (his words, 12 Nov 2026:
   * “If one has a roll, they all have to have a roll.  And I think we want rolls”). Absent on every other piece.
   */
  uroll?: Record<string, number>;
}

// ---------------------------------------------------------------------------------------------
// Dungeon levels. One dungeon is one large generated level: a long main path of rooms from the
// start to the boss hall, with dead-end side branches that end in a reward.

export const T_VOID = 0; // nothing (outside the dungeon)
export const T_FLOOR = 1; // walkable
export const T_WALL = 2; // solid
/**
 * A PIT: a hole in the floor (the owner, 7 Oct 2026: "Gaps and pits to use the swipe ability
 * over"). Nobody stands in one and nobody walks over one; shots, sight, bats and the swipe moves
 * cross it. (game/height.ts has the rules of height.)
 */
export const T_PIT = 3;

/**
 * TRIANGLES (the owner, 7 Oct 2026, of the stills of rooms with them: "Triangles look pretty good
 * I like it"). A tile may be CUT corner to corner: one half of it is wall, and the code says which
 * (`Floor.cut`). FAR / NEAR: the tile is cut along the line that runs ACROSS the screen (from its
 * left corner to its right one), and the wall is over the half further up the screen (its face is
 * seen head-on) or the half nearer the eye. LEFT / RIGHT: cut along the line that runs UP AND
 * DOWN the screen (from its top corner to its bottom one), the wall over the half to that side.
 * The LOW ones are drawn cut down, like any wall with floor behind it. (game/cut.ts has what
 * follows from a cut: where a body may stand, what a shot meets.)
 */
export const CUT_FAR = 1;
export const CUT_NEAR = 2;
export const CUT_LEFT = 3;
export const CUT_RIGHT = 4;
export const CUT_FAR_LOW = 5;
export const CUT_NEAR_LOW = 6;
export const CUT_LEFT_LOW = 7;
export const CUT_RIGHT_LOW = 8;

/**
 * 'treasure' and 'guardian' rooms are the rewards at the end of side branches: a vault of chests,
 * or the lair of one powerful monster.
 */
export type RoomKind = 'start' | 'normal' | 'treasure' | 'elite' | 'guardian' | 'boss';

export interface Room {
  id: number;
  /** Floor-area rectangle in tiles. Walls lie outside it. */
  x: number;
  y: number;
  w: number;
  h: number;
  kind: RoomKind;
  /** Place along the main path: 0 is the start room, the highest is the boss hall. -1 on a side branch. */
  path: number;
  /**
   * THE MIX (game/dungeon.ts, MIX; absent on every room where the map-maker does not mix):
   * `gated`: a gate stands in its way in, down until its lever is pulled. `locks`: a gate hangs
   * in every one of its doorways, and they fall while the hero is inside with its pack.
   * `nook`: the small room at a dead end where a lever stands. `nextDoor`: set down next door to
   * the room before it, with only a door between them: that door is always there, whatever the
   * share of rooms with a door (doors.ts, `hasDoor`).
   */
  gated?: boolean;
  locks?: boolean;
  nook?: boolean;
  nextDoor?: boolean;
  /**
   * THE CRYPT (game/dungeon.ts, CRYPT_LAYOUT; absent where its layout is off): `block`: a cell
   * block, a long hall of the main path with a row of cells along its back wall. `cell`: one of
   * those cells, a small room at a dead end with its door (and `nextDoor` set: the door is always
   * there).
   */
  block?: boolean;
  cell?: boolean;
  /** FLOOR 2 AS THE PRISON'S GROUNDS (game/grounds_way.ts, behind GROUNDS; absent where it is off): a courtyard of its grid, under the sky. */
  court?: boolean;
  /**
   * (THE TRAPS, game/traps.ts) A SEALED DOOR stands in its way in, a rune of this word on it: it
   * opens only to a hit from an attack that carries the word (`DoorSpot.word`).
   */
  sealed?: WordId;
}

export type PropKind = 'brazier' | 'chest' | 'barrel' | 'urn' | 'pillar' | 'bones' | 'rubble' | 'lever';

/** Props that block movement. 'bones' and 'rubble' are flat decoration. */
export const SOLID_PROPS: readonly PropKind[] = ['brazier', 'chest', 'barrel', 'urn', 'pillar', 'lever'];

export interface PropSpot {
  kind: PropKind;
  /** Integer tile coordinates; the prop stands at the tile centre. */
  x: number;
  y: number;
}

export interface PackSpot {
  /** Pack centre (a tile centre, e.g. 14.5, 9.5). */
  x: number;
  y: number;
  roomId: number;
  /** Number of monsters in the pack. */
  size: number;
  /**
   * 'elite' packs are led by one word-bearing elite monster. A 'champion' pack is a guardian (the
   * powerful monster at the end of a side branch) and its followers.
   */
  tier: 'normal' | 'elite' | 'champion';
  /**
   * MONSTER PACKS (defs.ts): what the pack is of (every one of it that kind, a guardian's pack all
   * guardians), its `size` by the kind's size. Absent with the switch off: the pack's kinds are mixed
   * when it is filled, as before.
   */
  kind?: MonsterKind;
}

/**
 * DOORS AND GATES (the owner, 7 Oct 2026, 14:01: "wrought iron jail style bar doors that swing
 * open, and that same bar style for gates going up and down with the spikes on the bottom [...]
 * Dungeon Boss always has a big gate that locks you in with him once you pass through the opening
 * [...] Doors are always unlocked and open as you get near them."). What stands in a DOORWAY: the
 * three tiles of floor in a wall's row through which a corridor comes into a room. (game/doors.ts
 * finds the doorways and has the rules; in the game since Version 18.5.)
 *   'door'      one tile wide, the middle of the three, the tile on either side of it wall: one
 *               leaf of iron bars in a frame of stone. It swings open for the hero when he
 *               comes near, and stays open; shut, it holds monsters and stops sight and
 *               shots (Version 18.7: no monster opens a door).
 *   'bossgate'  the portcullis of the boss's hall, the whole doorway wide under its arch: up
 *               until the hero is well inside, then down, and nothing passes it (nor a shot)
 *               until the boss is dead.
 *   'gate'      (THE MIX) a portcullis under a plain arch across the way in of a room: DOWN,
 *               and nothing passes it, until its lever is pulled (the owner, 7 Oct 2026, 14:01:
 *               "They can be closed with levers or switches nearby to open them."). The lever
 *               stands in a small room at a dead end nearby: `Floor.levers`.
 *   'trapgate'  (THE MIX) the same gate in EVERY doorway of a room that locks: up, until the
 *               hero is well inside with the room's pack; then down, until none of that pack
 *               is left alive in the room.
 *   'worddoor'  (THE TRAPS, game/traps.ts) A SEALED DOOR: a door's frame and size, its leaf a
 *               slab with the rune of a word on it (`word`). It opens to nobody who comes near:
 *               only to a hit from an attack that carries its word; then it swings open as a
 *               door does, and stays open. Sealed, nothing passes it, nor a shot, nor sight.
 */
/** (THE WAYS, game/ways.ts, behind WAYS: 'waygate', the gate of the way between town and the first floor.) */
export type DoorKind = 'door' | 'bossgate' | 'gate' | 'trapgate' | 'worddoor' | 'waygate';

/** (THE MIX) A LEVER: the tile it stands on (a prop of kind 'lever' stands there), and the room whose way in its gate bars. */
export interface LeverSpot {
  x: number;
  y: number;
  room: number;
}

export interface DoorSpot {
  kind: DoorKind;
  /** The room it is a doorway of (Room.id). */
  room: number;
  /**
   * True if the doorway's three tiles run along x: it is in a wall that runs down the screen to
   * the right (the room's far-right side, or its near-left one). False: along y.
   */
  alongX: boolean;
  /** True on a side of the room that is toward the eye (no wall is drawn there: it stands between posts). */
  near: boolean;
  /** The first of its three tiles along the wall: an x if `alongX`, else a y. */
  a: number;
  /** The line it stands on, where the room's floor ends on that side: y = plane if `alongX`, else x = plane. */
  plane: number;
  /** Which way the corridor lies from that line, and so which way its leaves swing: +1 toward greater y (or x), -1 toward lesser. */
  out: 1 | -1;
  /** (THE TRAPS) A sealed door's word: the one an attack must carry to open it. */
  word?: WordId;
}

/**
 * (THE TRAPS, game/traps.ts) WHAT THE DUNGEON ITSELF HAS LAID FOR THE HERO.
 *   'spikes'  A PATCH OF FLOOR whose spikes come up on a beat (`x`, `y`, `w`, `h`: its tiles;
 *             `phase`: seconds into its beat as the level begins). Up, they hurt whatever
 *             walks on the patch, hero and monster alike, once each time they rise.
 *   'darts'   A PLATE in a corridor's floor (the tile `x`, `y`; `w` = `h` = 1) and a SLOT in the
 *             wall at the end of the corridor (`slot`: the wall's tile, and the way the darts
 *             leave it, `dx`, `dy`: a step along x or along y). The hero steps on the plate:
 *             it clicks, and three darts leave the slot one after another, all at the place the
 *             hero stood as it clicked; they hurt what they meet, hero or monster. The plate is
 *             ready again a few seconds later.
 */
export type HazardKind = 'spikes' | 'darts';

export interface HazardSpot {
  kind: HazardKind;
  x: number;
  y: number;
  w: number;
  h: number;
  phase?: number;
  slot?: { x: number; y: number; dx: number; dy: number };
}

export interface Floor {
  depth: number;
  seed: number;
  w: number;
  h: number;
  /** w*h tile ids (T_VOID / T_FLOOR / T_WALL / T_PIT), index = y * w + x. */
  tiles: Uint8Array;
  /**
   * LEDGES AND STAIRS (the owner, 7 Oct 2026: "Then work on ledges and stairs"; "Stairs should go
   * down as well"). `height`: how many levels up each floor tile stands: 0 for the floor of the
   * room, 1 for raised floor, -1 for SUNKEN floor; absent where a level is all of one height.
   * `stair`: for a floor tile that is a flight of stairs, which way is up (STAIR_N, STAIR_W in
   * game/height.ts; 0 for any other tile): it joins the floor at its foot, `height` levels up, to
   * the floor at its head, one level higher. (So a flight down into sunken floor stands in it:
   * its own `height` is -1, and its head is the room's floor.)
   */
  height?: Int8Array;
  stair?: Uint8Array;
  /**
   * TRIANGLES. For a tile that is cut corner to corner, which half of it is wall (CUT_* above); 0
   * for a whole tile; absent where a level has none. A cut FLOOR tile is floor in its other half:
   * a body may stand there (game/cut.ts), though way-finding leaves it alone (the walk grid has it
   * shut). A cut WALL tile is nothing in its other half: it is the back of the same slanting wall,
   * which is thus a whole tile thick.
   */
  cut?: Uint8Array;
  /** w*h random bytes for picking art variants per tile. */
  variant: Uint8Array;
  rooms: Room[];
  /** Hero spawn point (a tile centre). */
  start: Vec;
  /** Where the dungeon's boss waits, and where the way home opens once it dies (a tile centre). */
  boss: Vec;
  packs: PackSpot[];
  props: PropSpot[];
  /** DOORS AND GATES: what stands in the doorways; absent where the map-maker lays none (game/doors.ts, DOORS). */
  doors?: DoorSpot[];
  /** (THE MIX) The levers of the level's gates; absent where there are none. */
  levers?: LeverSpot[];
  /** (THE TRAPS) The spike floors and dart walls of the level; absent where there are none (game/traps.ts). */
  hazards?: HazardSpot[];
  /** (THE FIRST FIVE FLOORS) The bone heaps of the Fleshmancer's hall, where he raises his dead (game/bosses.ts); absent where there are none. */
  heaps?: Vec[];
  /** (THE HEADSMAN'S YARD) Floor 2's boss hall laid as the yard, outdoors (game/yard.ts); absent where it is not. */
  yard?: YardPlan;
}

/**
 * What limits the slow abilities. The owner is trying both, and wants to feel which is better:
 * a cooldown and no mana at all, or mana and no cooldown ("both is overkill").
 */
export type Limit = 'cooldown' | 'mana';

/**
 * How the hero sounds when they speak (see QUIPS, and speak() in engine/audio.ts). The owner:
 * "give me male and female voices and an option at the beginning of a run when you select your class".
 */
export type VoiceId = 'male' | 'female';
export const VOICE_IDS: readonly VoiceId[] = ['male', 'female'];
