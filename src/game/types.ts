// Shared data shapes. Game rules, dungeon generation, items and art all agree on these.

export interface Vec {
  x: number;
  y: number;
}

// ---------------------------------------------------------------------------------------------
// Classes, attributes, abilities, power words

export type ClassId = 'warrior' | 'ranger' | 'mage';
export const CLASS_IDS: readonly ClassId[] = ['warrior', 'ranger', 'mage'];

/** The three attributes. Every class uses all three. */
export type Attr = 'str' | 'dex' | 'int';
export const ATTRS: readonly Attr[] = ['str', 'dex', 'int'];

/** The pictures the attacks are shown by: one for each attack a weapon or a class gives, plus the universal dodge. */
export type AbilityId = 'strike' | 'slam' | 'whirl' | 'leap' | 'shot' | 'volley' | 'trap' | 'wave' | 'orb' | 'beam' | 'familiar' | 'warp';

/** Power words: dropped by enemies, slotted into an ability to change it. */
export type WordId = 'power' | 'swift' | 'twin' | 'fire' | 'frost' | 'lightning' | 'leech' | 'volatile' | 'poison' | 'heavy' | 'precise' | 'frenzied' | 'guarding';
// (THE NEW WORDS, his choice of 8 Oct 2026, 12:26, as his doc "Wordsmith: The New Words" plays them (his yes, 16:53): the first four, Heavy,
// Precise, Frenzied and Guarding, from Version 19.3; their looks are the art chat's, render/words3.ts)
export const WORD_IDS: readonly WordId[] = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile', 'poison', 'heavy', 'precise', 'frenzied', 'guarding'];

/** Damage types. An ability with no element word deals physical damage. */
export type Element = 'phys' | 'fire' | 'frost' | 'lightning';

/**
 * 'warden' is the boss that ends a dungeon. THE NEW MONSTERS (Version 19.9, game/defs.ts NEW_MONSTERS):
 * 'shade', 'boneward' and 'golem'; and the yellow packs' leaders, each a kind of its own and never a
 * pack of its own (game/defs.ts LEADERS): 'champion', the skeleton champion, who leads skeletons (not
 * the `champion` of a Monster, which is a guardian); 'marksman', the bone marksman, bone archers;
 * 'priest', the high priest, cultists; and 'chieftain', the troll chieftain, green trolls.
 */
export type MonsterKind = 'skeleton' | 'archer' | 'cultist' | 'bat' | 'brute' | 'warden' | 'shade' | 'boneward' | 'golem' | 'champion' | 'marksman' | 'priest' | 'chieftain';
/** The monsters of Version 14 (the figures the tests of their pictures go through). */
export const MONSTER_KINDS: readonly MonsterKind[] = ['skeleton', 'archer', 'cultist', 'bat', 'brute', 'warden'];
/** THE NEW MONSTERS (Version 19.9): the art chat's, painted on the heroes' bones. */
export const NEW_KINDS: readonly MonsterKind[] = ['shade', 'boneward', 'golem', 'champion', 'marksman', 'priest', 'chieftain'];

// ---------------------------------------------------------------------------------------------
// Stats. Every number a character has is one of these keys. Percentages are whole numbers
// (12 means 12%). Gear, attributes and power words all add into the same table.

export type StatKey =
  | 'str'
  | 'dex'
  | 'int'
  | 'dmgMin' // flat weapon damage (a weapon's own damage, and "adds X-Y damage" affixes)
  | 'dmgMax'
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
  | 'blockChance'; // % chance to block a blow (Guarding, burned into gear)

export const STAT_KEYS: readonly StatKey[] = [
  'str', 'dex', 'int', 'dmgMin', 'dmgMax', 'dmgPct', 'physPct', 'firePct', 'frostPct', 'lightPct', 'atkSpeed',
  'critChance', 'critMult', 'maxLife', 'lifeRegen', 'lifeOnHit', 'lifeOnKill', 'maxMana', 'manaRegen',
  'armor', 'fireRes', 'frostRes', 'lightRes', 'moveSpeed', 'cdr', 'areaPct', 'goldFind', 'magicFind', 'stunChance', 'blockChance',
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
 */
export type WeaponKind = 'sword' | 'greatsword' | 'bow' | 'wand' | 'staff';
export const WEAPONS: readonly WeaponKind[] = ['sword', 'greatsword', 'bow', 'wand', 'staff'];

/** Weapons that were in the game until Version 12. A saved item of one of these becomes the kind that took its place (items.ts, migrateItem). */
export type OldWeaponKind = 'axe' | 'mace' | 'maul' | 'longbow';

/** Off-hand pieces: a shield goes with a one-handed sword, a quiver with a bow, a focus with a wand. */
export type OffhandKind = 'shield' | 'quiver' | 'focus';

/** Which 16x16 picture an item uses. (The old weapons keep their pictures: an old save may still show one for a moment.) */
export type IconKey = WeaponKind | OldWeaponKind | OffhandKind | 'helm' | 'hood' | 'armor' | 'robe' | 'gloves' | 'belt' | 'boots' | 'ring' | 'amulet';
export const ICON_KEYS: readonly IconKey[] = [
  'sword', 'axe', 'mace', 'greatsword', 'maul', 'bow', 'longbow', 'wand', 'staff', 'shield', 'quiver', 'focus',
  'helm', 'hood', 'armor', 'robe', 'gloves', 'belt', 'boots', 'ring', 'amulet',
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
export type DoorKind = 'door' | 'bossgate' | 'gate' | 'trapgate' | 'worddoor';

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
