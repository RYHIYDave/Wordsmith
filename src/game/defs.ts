// The game's content tables: classes, abilities, power words, monsters, and the numbers that
// tune them. Change the game's feel here; the rules that read these tables live in game.ts.

import type { VendorId } from './state';
import type { AbilityId, Attr, ClassId, Element, Limit, MonsterKind, Slot, WeaponKind, WordId } from './types';

export type { Limit } from './types';

// ---------------------------------------------------------------------------------------------
// Abilities. A character has three: a quick attack, a slow attack and an evasive move.
//
// Since Version 12 BOTH ATTACKS come from the weapon in hand, whoever holds it, and the evasive move
// belongs to the character. The owner, 4 Oct 2026: "I need all weapons to be able to be equipped on
// all characters ... Remember that the tap attack is dictated by the weapon and I want the build
// diversity to be at a maximum"; and then: "Let's have both skills change with the weapon. I wanted
// to leave something to keep each character unique but the dodge being unique is enough for now.
// Later we can have skill trees that will give a character its uniqueness".
//   sword       Strike, Slam           bow    Shot, Volley
//   greatsword  Strike, Whirlwind      staff  Wave, Orb          wand  Familiar, Beam       (WEAPON_SKILLS)
//   warrior Leap    ranger Trap      mage Warp                                          (CLASSES)
// Whirlwind and Beam (Version 12.1) go on for as long as their button is held: SkillDef.channel.
// Version 12.2: the bow's slow attack is VOLLEY; the ranger's evasive move is named TRAP (the same
// roll, and it lays a trap); and the three evasive moves take power words as the attacks do.

export type SkillId = 'strike' | 'slam' | 'whirlwind' | 'leap' | 'shot' | 'volley' | 'trap' | 'wave' | 'orb' | 'beam' | 'familiar' | 'warp';

/**
 * How an ability is delivered. Power words act on the kind, never on one specific ability.
 *   wave    a wide front of force that travels a short way and passes through everything it meets
 *   orb     a ball set down at a point, which sends out waves until its time is up
 *   beam    a line from the hero toward where it is aimed, to the first wall, that bites everything
 *           along it again and again for as long as it is held
 *   whirl   the hero spins: everything round them is cut again and again for as long as it is held
 *   summon  a familiar that follows the hero for a while and shoots at enemies
 *   volley  arrows loosed at the sky, which rain on a place for a while
 *   leap, roll, warp   the evasive moves. A leap lands with a shock; a roll with any `dmg` leaves a
 *           trap where it began (the ranger's); a warp bursts where it arrives.
 */
export type SkillKind = 'melee' | 'burst' | 'whirl' | 'projectile' | 'volley' | 'wave' | 'orb' | 'beam' | 'summon' | 'leap' | 'roll' | 'warp';

export interface SkillDef {
  id: SkillId;
  name: string;
  kind: SkillKind;
  /** Which picture the skill bar shows. */
  icon: AbilityId;
  /** Damage as a multiple of weapon damage. */
  dmg: number;
  /**
   * Seconds between uses. 0 = as fast as the weapon swings. A quick attack may have one too (the
   * familiar): then it waits as a slow attack does, and costs mana when mana is the limit.
   */
  cooldown: number;
  mana: number;
  /**
   * Reach of a melee hit, flight distance of a projectile, how far the ability can be placed, the
   * length of a beam, or how far a familiar shoots (tiles).
   */
  range: number;
  /**
   * Blast radius in tiles (0 for single-target hits). For a beam or a wave: half its width. For a
   * familiar: the size of its bolts. For a volley: the patch of ground the arrows rain on. For a
   * roll: the burst of the trap it leaves.
   */
  radius: number;
  /** Projectile speed in tiles per second (a familiar's bolts too). */
  speed: number;
  /** True for abilities that take power words: all of them, since Version 12.2 gave the evasive moves their slots. */
  sockets: boolean;
  desc: string;
  /** What using it is called in a prompt: "tap to STRIKE", "swipe to LEAP". */
  verb: string;
  /**
   * Seconds between asking for it and its landing: the sword is raised, the bow drawn, the spell
   * gathered (the owner: "spells have a cast time even if they are really short"). An evasive move
   * has none. The quick attack's is cut short when the weapon is fast (see Game.useBasic).
   */
  windup: number;
  /** Seconds the hero is still busy with it after it lands: the follow-through. Only the picture and the facing care. */
  follow: number;
  /**
   * An attack that goes on for as long as its button is held (Version 12.1: the owner's "channel").
   * `channel`: the most seconds it may be held when cooldowns are the limit (when mana is, it goes
   * on until the mana is gone). `tick`: seconds between its bites; it bites the moment it begins.
   * Absent: an attack that is made once. For such an attack `dmg` is one bite, `mana` what a whole
   * length of it costs, and `cooldown` the wait after a whole length (less after a shorter one:
   * TUNE.channelMinCool).
   */
  channel?: number;
  tick?: number;
}

export const SKILLS: Record<SkillId, SkillDef> = {
  strike: { id: 'strike', name: 'Strike', kind: 'melee', icon: 'strike', dmg: 1.0, cooldown: 0, mana: 0, range: 1.7, radius: 0, speed: 0, sockets: true, desc: 'Hit one enemy in front of you.', verb: 'STRIKE', windup: 0.12, follow: 0.3 },
  slam: { id: 'slam', name: 'Slam', kind: 'burst', icon: 'slam', dmg: 1.5, cooldown: 3.0, mana: 10, range: 1.4, radius: 2.0, speed: 0, sockets: true, desc: 'Smash the ground ahead and hit everything near it.', verb: 'SLAM', windup: 0.22, follow: 0.38 },
  // WHIRLWIND, the two-handed sword's slow attack (the owner, 4 Oct 2026, 18:52): "let's have
  // greatsword have a whirlwind on tap+hold with a channel that passes through like the Bull
  // stampede". Held: the hero spins, cutting everything within `radius` every `tick` seconds, walks
  // on meanwhile and passes through enemies.
  whirlwind: { id: 'whirlwind', name: 'Whirlwind', kind: 'whirl', icon: 'whirl', dmg: 0.55, cooldown: 3.5, mana: 16, range: 0, radius: 2.0, speed: 0, sockets: true, desc: 'Hold to spin: you cut everything around you again and again, and pass through enemies.', verb: 'WHIRL', windup: 0.12, follow: 0.25, channel: 2.4, tick: 0.3 },
  // The three evasive moves take words since Version 12.2 (the owner, 18:34: "We also need to give
  // the swipe abilities the option for words"). In front: the hit. Behind: what the move leaves.
  leap: { id: 'leap', name: 'Leap', kind: 'leap', icon: 'leap', dmg: 0.5, cooldown: 4.0, mana: 0, range: 6, radius: 1.6, speed: 0, sockets: true, desc: 'Jump to a spot. Nothing can hit you in the air, and you land with a shock.', verb: 'LEAP', windup: 0, follow: 0 },
  shot: { id: 'shot', name: 'Shot', kind: 'projectile', icon: 'shot', dmg: 1.0, cooldown: 0, mana: 0, range: 11, radius: 0.25, speed: 16, sockets: true, desc: 'Loose an arrow at one enemy.', verb: 'SHOOT', windup: 0.16, follow: 0.32 },
  // VOLLEY, the bow's slow attack (the owner, 20:02): "Target an area and the ranger fires a bunch
  // of arrows straight up, then they rain down into the targeted area for a duration". `dmg` is
  // one arrow, `radius` the patch of ground; TUNE.volley* are the rest.
  volley: { id: 'volley', name: 'Volley', kind: 'volley', icon: 'volley', dmg: 0.7, cooldown: 5.0, mana: 14, range: 9, radius: 2.2, speed: 0, sockets: true, desc: 'Loose arrows at the sky: they rain on the spot you point at for a few seconds.', verb: 'RAIN ARROWS', windup: 0.2, follow: 0.36 },
  // TRAP, the ranger's evasive move (the owner, 20:02 and 20:04): "Let's move the trap on ranger to
  // the tumble. When you tumble you lay a trap"; "Let's just call tumble trap from now on. You'll
  // still tumble and lay a trap down, and it will still be a dodge, but we'll name it trap".
  // `range` is the roll, `radius` and `dmg` the trap's burst.
  trap: { id: 'trap', name: 'Trap', kind: 'roll', icon: 'trap', dmg: 1.2, cooldown: 3.0, mana: 0, range: 3.4, radius: 2.0, speed: 0, sockets: true, desc: 'A quick roll that nothing can hit, and you leave a trap where you stood: it bursts when an enemy steps on it. Holds two charges.', verb: 'ROLL AND TRAP', windup: 0, follow: 0 },
  // The staff's and the wand's attacks, as the owner described them on 4 Oct 2026
  // (docs/NEXT_VERSION.md has his words; the last of them, 18:53: "I want keep familiar and orb and
  // beam but the original ideas for the skill's properties").
  // WAVE, the staff's quick attack: his pick (18:58, "Let's try wave") from: "a swing of the staff
  // sends a wide crescent of force forward that passes through everything in its path and fades
  // after a short way". Each enemy it meets is hit once. `radius` is half its width.
  wave: { id: 'wave', name: 'Wave', kind: 'wave', icon: 'wave', dmg: 0.65, cooldown: 0, mana: 0, range: 6, radius: 1.0, speed: 9, sockets: true, desc: 'Swing the staff: a wide wave of force that passes through every enemy in its path.', verb: 'SEND A WAVE', windup: 0.16, follow: 0.32 },
  // ORB, the staff's slow attack: "a large stationary ball that pulses waves of damage"; "Slam the
  // staff down on the ground and a little pulse aura goes out around the character then the orb
  // appears where you tapped. ORB can be placed anywhere within a set radius of the character".
  // `dmg` is one wave; TUNE.orbLife and orbEvery say how long it stays and how often it pulses.
  orb: { id: 'orb', name: 'Orb', kind: 'orb', icon: 'orb', dmg: 0.6, cooldown: 5.0, mana: 14, range: 6.5, radius: 2.2, speed: 0, sockets: true, desc: 'Slam the staff down: an orb appears where you point and sends out waves of force for a few seconds.', verb: 'SET AN ORB', windup: 0.26, follow: 0.38 },
  // BEAM, the wand's slow attack, as the owner first described it (13:55, and again at 18:53: "the
  // original ideas for the skill's properties"): "Fires towards your finger and stops when you
  // release. You can move the beam around in different directions as long as you hold down";
  // "it beams constantly for a couple seconds then goes on cooldown"; with mana "it would
  // continuously drain mana"; "Have the character flick the wand out and the beam fires out the
  // end of the wand." (Version 12 had a line that struck once after a ghost line; that is gone.)
  beam: { id: 'beam', name: 'Beam', kind: 'beam', icon: 'beam', dmg: 0.5, cooldown: 4.0, mana: 16, range: 9, radius: 0.4, speed: 0, sockets: true, desc: 'Hold: a beam burns toward where you point, through everything in its way. Sweep it about.', verb: 'FIRE A BEAM', windup: 0.14, follow: 0.2, channel: 2.0, tick: 0.2 },
  // FAMILIAR, the wand's quick attack: "let's do Familiar for the tap. Summons a small energy
  // sprite for a few seconds that shoots small projectiles. Give it a cooldown and start with the
  // ability to have 3 summoned at a time. You can have 3 up, but more often than not you'll have 2
  // up until you invest into with cooldown reduction or skill effect duration". `dmg` is one bolt;
  // TUNE.familiarLife, familiarEvery and familiarMax are the rest. It is the one quick attack with
  // a cooldown (and, when mana is the limit, a cost).
  familiar: { id: 'familiar', name: 'Familiar', kind: 'summon', icon: 'familiar', dmg: 0.75, cooldown: 2.6, mana: 7, range: 8, radius: 0.22, speed: 13, sockets: true, desc: 'Call a sprite of energy that follows you for a few seconds and shoots at enemies. Up to three at once.', verb: 'CALL A FAMILIAR', windup: 0.2, follow: 0.32 },
  // (Until Version 12.2 a warp hurt nothing. It arrives in a small burst now, `dmg` and `radius`,
  // so that a word in front of it has a hit to change, as the leap's landing and the roll's trap
  // have: read back to the owner at 18:37, "Warp burst where the mage arrives", and not objected
  // to. A word that could be set there and do nothing would break his first rule for words.)
  warp: { id: 'warp', name: 'Warp', kind: 'warp', icon: 'warp', dmg: 0.5, cooldown: 5.0, mana: 0, range: 6, radius: 1.6, speed: 0, sockets: true, desc: 'Vanish and reappear at a spot, instantly, in a burst that hurts what stands there.', verb: 'WARP', windup: 0, follow: 0 },
};

// ---------------------------------------------------------------------------------------------
// Classes

export interface ClassDef {
  id: ClassId;
  name: string;
  blurb: string;
  /** The attribute that scales this class's own ability (the evasive move). */
  primary: Attr;
  /** Attributes at level 1. */
  attrs: Record<Attr, number>;
  /**
   * The evasive move (swipe, Space): the one ability that is the character's own. Both attacks are
   * the weapon's (WEAPON_SKILLS).
   */
  evade: SkillId;
  /** The weapon a new character of this class starts with. */
  starts: WeaponKind;
}

export const CLASSES: Record<ClassId, ClassDef> = {
  // (the warrior: "lets have the warrior start with the two handed sword")
  warrior: { id: 'warrior', name: 'Warrior', blurb: 'Up close and hard to kill.', primary: 'str', attrs: { str: 14, dex: 8, int: 6 }, evade: 'leap', starts: 'greatsword' },
  ranger: { id: 'ranger', name: 'Ranger', blurb: 'Fast, sharp and far away.', primary: 'dex', attrs: { str: 8, dex: 14, int: 6 }, evade: 'trap', starts: 'bow' },
  mage: { id: 'mage', name: 'Mage', blurb: 'Raw power. Handle with care.', primary: 'int', attrs: { str: 6, dex: 8, int: 14 }, evade: 'warp', starts: 'staff' },
};

/**
 * The two attacks each weapon gives, whoever holds it: the quick one (tap, left button) and the
 * slow one (hold, right button). The owner's older rule still holds: of the two, the one that
 * waits longer between uses is the slow one. A test keeps it.
 */
export const WEAPON_SKILLS: Record<WeaponKind, readonly [SkillId, SkillId]> = {
  sword: ['strike', 'slam'],
  greatsword: ['strike', 'whirlwind'],
  bow: ['shot', 'volley'],
  staff: ['wave', 'orb'],
  wand: ['familiar', 'beam'],
};
/** With empty hands: a blow of the fist, and a slam of it. */
const BARE_SKILLS: readonly [SkillId, SkillId] = ['strike', 'slam'];
/** The attribute a weapon's attacks grow with, whoever holds it: a sword with Strength, a bow with Dexterity, a staff or a wand with Intelligence. */
export const WEAPON_ATTR: Record<WeaponKind, Attr> = { sword: 'str', greatsword: 'str', bow: 'dex', staff: 'int', wand: 'int' };

/**
 * ATTACKS AND SPELLS (the doc "Wordsmith: The New Words", his yes at 16:53 on 8 Oct 2026): the
 * weapon decides, a sword, a great sword or a bow making attacks and a staff or a wand spells; the
 * evasive moves go with their class (Leap and Trap attacks, Warp a spell).
 */
export const SPELL_SKILLS: ReadonlySet<SkillId> = new Set<SkillId>(['wave', 'orb', 'familiar', 'beam', 'warp']);
export function isSpell(id: SkillId): boolean {
  return SPELL_SKILLS.has(id);
}

/** The quick attack of a hand that holds that weapon. */
export function tapSkill(weapon: WeaponKind | null): SkillId {
  return (weapon ? WEAPON_SKILLS[weapon] : BARE_SKILLS)[0];
}

/** The slow attack of a hand that holds that weapon. */
export function holdSkill(weapon: WeaponKind | null): SkillId {
  return (weapon ? WEAPON_SKILLS[weapon] : BARE_SKILLS)[1];
}

/** The attribute both of them grow with. */
export function weaponAttr(weapon: WeaponKind | null): Attr {
  return weapon ? WEAPON_ATTR[weapon] : 'str';
}

/** A character's three abilities: quick and slow (the weapon's), evasive (the class's). */
export function skillsFor(cls: ClassId, weapon: WeaponKind | null): [SkillId, SkillId, SkillId] {
  return [tapSkill(weapon), holdSkill(weapon), CLASSES[cls].evade];
}

export const ATTR_NAME: Record<Attr, string> = { str: 'Strength', dex: 'Dexterity', int: 'Intelligence' };
export const ATTR_SHORT: Record<Attr, string> = { str: 'STR', dex: 'DEX', int: 'INT' };

/** What one point of each attribute gives every class. */
export const ATTR_GIVES = {
  strLife: 3,
  dexSpeed: 0.5, // % attack and cast speed
  dexCrit: 0.1, // critical chance, percentage points
  intMana: 3,
  intManaRegen: 0.04, // mana per second
  intCdr: 0.25, // % cooldown recovery
  /**
   * % damage per point of the attribute an ability grows with: the two attacks with their weapon's
   * (WEAPON_ATTR), the evasive move with the class's (ClassDef.primary).
   */
  primaryDmg: 1,
};

// ---------------------------------------------------------------------------------------------
// Power words. The rule: a word in FRONT of an ability changes the hit; a word BEHIND it changes
// what the ability leaves behind. The exact numbers are in words.ts.

/**
 * THE TWO KINDS OF WORD (his words, 5 Oct 2026: "I really like the distinction of Shape and
 * Damage"; 8 Oct, 10:54 and 11:27: Leech, Volatile, Swift and Twin are shaping words). A DAMAGE word
 * adds damage of a kind; a SHAPING word changes the hit, or what it leaves behind. An attack takes
 * ONE DAMAGE WORD ON EACH SIDE (his answer, 8 Oct, 16:53: "Yes, one a side (Recommended)"): the doc
 * "Wordsmith: The New Words".
 */
export type WordKind = 'damage' | 'shape';

// THE NEW WORDS' NUMBERS (Version 19.3): the starting points of his doc "Wordsmith: The New Words"
// (his yes, 8 Oct 2026, 16:53: "Yes, as it is (Recommended)"), to be tuned once he has played them.
/** HEAVY: in front, 20% slower to use (cooldowns and mana 1.25 times, a quick attack's speed over 1.25), and it stuns; behind, cracked ground. */
export const HEAVY = {
  slower: 1.25,
  /** Seconds a Heavy hit stuns for: an elite for half of it, a boss never. */
  stun: 0.8,
  /** Seconds the cracked ground lasts; a stagger, and how long a monster waits before the same ground staggers it again. */
  cracks: 4,
  stagger: 0.55,
  staggerAgain: 1.5,
  /** On a monster: its blows knock the hero this far back (tiles). */
  knock: 0.6,
  /** On gear: the most that a hero's gear together gives of a chance to stun (%). */
  stunCap: 50,
};
/** PRECISE: in front, the area this much the size; behind, a mark lasts this many seconds. On a monster: its hits ignore this much of the hero's armour. */
export const PRECISE = { area: 0.7, markTime: 5, armourIgnored: 0.5 };
/** FRENZIED: each stack this much faster (attacks, and cooldowns recovering), up to `max`; the stacks fade `hold` seconds after the last use. On a monster: up to `monster` faster near death. */
export const FRENZY = { each: 0.08, max: 5, hold: 3, monster: 0.5 };
/** GUARDING: in front a shield of this fraction of life for `shieldTime` s; behind a ward that takes `ward` off the damage inside it, for `wardTime` s. On a monster: a shield of `monster` of its life. */
export const GUARD = {
  shield: 0.1,
  shieldTime: 3,
  ward: 0.3,
  wardTime: 4,
  monster: 0.2,
  /** On gear: the most that a hero's gear together gives of a chance to block (%). */
  blockCap: 50,
};

export interface WordDef {
  id: WordId;
  /** Damage or shaping (see WordKind). */
  kind: WordKind;
  /** The word itself, as it drops. */
  name: string;
  /** How it reads in front of an ability: "Flame" Orb. */
  front: string;
  /** How it reads behind an ability: Orb "of Flame". */
  behind: string;
  /** The attribute that makes this word stronger. */
  attr: Attr;
  /** Element words turn the ability's damage into that element. */
  element: Element | null;
  /** What the word is, in a line: what a player reads on touching it, before knowing what it does anywhere. */
  about: string;
  /**
   * What it may do in front of an attack and behind one, in plain words and without numbers: the
   * hint shown while the word hangs over a socket. (The numbers are on the attack once the word is in it.)
   */
  frontText: string;
  behindText: string;
  /** What the word does to a monster that carries it. */
  monsterText: string;
}

export const WORDS: Record<WordId, WordDef> = {
  power: { id: 'power', kind: 'damage', name: 'Power', front: 'Power', behind: 'of Power', attr: 'str', element: null, about: 'The word of force.', frontText: 'More damage and a bigger hit.', behindText: 'Each hit that lands builds a short damage bonus.', monsterText: 'Hits harder and has more life.' },
  leech: { id: 'leech', kind: 'shape', name: 'Leech', front: 'Leeching', behind: 'of Leeching', attr: 'str', element: null, about: 'The word of hunger. It takes life from what it touches.', frontText: 'Heals you for every enemy hit.', behindText: 'Enemies it kills drop life orbs.', monsterText: 'Heals when it hits you.' },
  swift: { id: 'swift', kind: 'shape', name: 'Swift', front: 'Swift', behind: 'of Swiftness', attr: 'dex', element: null, about: 'The word of speed.', frontText: 'Faster to use again.', behindText: 'Each use gives you a burst of speed.', monsterText: 'Moves and attacks faster.' },
  twin: { id: 'twin', kind: 'shape', name: 'Twin', front: 'Twin', behind: 'of Echoes', attr: 'dex', element: null, about: 'The word of doubling. Two of a thing, each the weaker for it.', frontText: 'Strikes, fires or bursts twice, each time weaker.', behindText: 'Repeats itself a moment later, weaker.', monsterText: 'Attacks twice.' },
  fire: { id: 'fire', kind: 'damage', name: 'Flame', front: 'Flame', behind: 'of Flame', attr: 'int', element: 'fire', about: 'The word of fire.', frontText: 'Fire damage. Explodes and sets enemies burning.', behindText: 'Passes through, hits softer, leaves burning ground.', monsterText: 'Deals fire damage and sets you burning.' },
  frost: { id: 'frost', kind: 'damage', name: 'Frost', front: 'Frost', behind: 'of Frost', attr: 'int', element: 'frost', about: 'The word of cold.', frontText: 'Frost damage. Chills, then freezes.', behindText: 'Passes through, hits softer, leaves ice that slows.', monsterText: 'Deals frost damage and slows you.' },
  lightning: { id: 'lightning', kind: 'damage', name: 'Lightning', front: 'Lightning', behind: 'of Lightning', attr: 'int', element: 'lightning', about: 'The word of storms.', frontText: 'Lightning damage. Arcs to nearby enemies.', behindText: 'Passes through, hits softer, leaves a storm that strikes.', monsterText: 'Deals lightning damage and shocks you.' },
  volatile: { id: 'volatile', kind: 'shape', name: 'Volatile', front: 'Volatile', behind: 'of Ruin', attr: 'int', element: null, about: 'The word of ruin. Things burst.', frontText: 'Enemies it kills explode.', behindText: 'Leaves a rune that detonates a moment later.', monsterText: 'Explodes when it dies.' },
  // THE NEW WORDS (his choice of 8 Oct 2026, 12:26; how they play: his doc "Wordsmith: The New Words",
  // his yes at 16:53). All are shaping words. Their looks are the art chat's (render/words3.ts).
  heavy: { id: 'heavy', kind: 'shape', name: 'Heavy', front: 'Heavy', behind: 'of Quakes', attr: 'str', element: null, about: 'The word of weight. Slow, and crushing.', frontText: 'Slower, hits much harder and stuns.', behindText: 'Leaves cracked ground that staggers enemies.', monsterText: 'Its blows knock you back.' },
  precise: { id: 'precise', kind: 'shape', name: 'Precise', front: 'Precise', behind: 'of the Mark', attr: 'dex', element: null, about: 'The word of the exact. Narrow, and deadly.', frontText: 'More damage, a smaller area.', behindText: 'Marks an enemy: your next hit on it is a certain critical.', monsterText: 'Its hits find the gaps in your armour.' },
  frenzied: { id: 'frenzied', kind: 'shape', name: 'Frenzied', front: 'Frenzied', behind: 'of Frenzy', attr: 'str', element: null, about: 'The word of rage. Faster, and faster.', frontText: 'Each use makes the next faster, up to five times.', behindText: 'Kills keep the frenzy going.', monsterText: 'Speeds up as it is hurt.' },
  guarding: { id: 'guarding', kind: 'shape', name: 'Guarding', front: 'Guarding', behind: 'of Warding', attr: 'str', element: null, about: 'The word of the shield. It keeps you.', frontText: 'Each use gives you a brief shield.', behindText: 'Leaves a ward circle: you take less damage inside it.', monsterText: 'Carries a shield that soaks damage.' },
  poison: { id: 'poison', kind: 'damage', name: 'Poison', front: 'Poison', behind: 'of Venom', attr: 'dex', element: null, about: 'The word of venom. A slow death.', frontText: 'A weaker hit that poisons. Poison stacks.', behindText: 'Leaves a cloud of poison.', monsterText: 'Poisons you.' },
};

// ---------------------------------------------------------------------------------------------
// Monsters. Numbers are for dungeon 1; scaleLife / scaleDmg grow them with depth.

export interface MonsterDef {
  kind: MonsterKind;
  name: string;
  life: number;
  dmgMin: number;
  dmgMax: number;
  /** Tiles per second. */
  speed: number;
  /** Body radius in tiles. */
  radius: number;
  /** How close it must be to attack (melee), or how far it can shoot (ranged). */
  range: number;
  /** Seconds of warning before the attack lands. */
  windup: number;
  /** Seconds between attacks. */
  cooldown: number;
  xp: number;
  ranged: boolean;
  projSpeed: number;
  /**
   * A ranged monster comes this near a hero it can see and no nearer: there it stands, and shoots
   * (0 for the others). IT DOES NOT BACK AWAY, however near the hero comes. Until Version 18.5 it
   * did, from a hero nearer than its `keepMin` (4.5 tiles for the Bone Archer, 4 for the Cultist).
   * The owner, 7 Oct 2026, 19:13: "I need the ranged enemies to not run away from you".
   */
  keepMax: number;
  element: Element;
  /** Radius of a telegraphed ground attack, or 0 for an ordinary hit. */
  aoe: number;
  /** First dungeon it appears in, and how common it is in a pack. */
  minDepth: number;
  weight: number;
}

export const MONSTERS: Record<MonsterKind, MonsterDef> = {
  skeleton: { kind: 'skeleton', name: 'Skeleton', life: 22, dmgMin: 5, dmgMax: 8, speed: 3.0, radius: 0.32, range: 1.25, windup: 0.4, cooldown: 1.2, xp: 6, ranged: false, projSpeed: 0, keepMax: 0, element: 'phys', aoe: 0, minDepth: 1, weight: 5 },
  archer: { kind: 'archer', name: 'Bone Archer', life: 16, dmgMin: 4, dmgMax: 7, speed: 2.8, radius: 0.32, range: 8, windup: 0.55, cooldown: 2.0, xp: 7, ranged: true, projSpeed: 10, keepMax: 7, element: 'phys', aoe: 0, minDepth: 1, weight: 2 },
  cultist: { kind: 'cultist', name: 'Cultist', life: 18, dmgMin: 6, dmgMax: 10, speed: 2.6, radius: 0.32, range: 7.5, windup: 0.75, cooldown: 2.7, xp: 8, ranged: true, projSpeed: 6.5, keepMax: 6.5, element: 'fire', aoe: 0, minDepth: 2, weight: 2 },
  bat: { kind: 'bat', name: 'Cave Bat', life: 9, dmgMin: 3, dmgMax: 5, speed: 4.8, radius: 0.26, range: 0.95, windup: 0.22, cooldown: 1.0, xp: 4, ranged: false, projSpeed: 0, keepMax: 0, element: 'phys', aoe: 0, minDepth: 1, weight: 3 },
  // (THE BRUTE: 49 of life since Version 18.7; 70 until then. The owner, 7 Oct 2026, of guardians, which are brutes, 19:35:
  // "just big damage sponges and could use at least a 30% reduction in HP"; and of elite brutes, 21:10: "yes, every
  // interation of that mob type". So every kind of brute, plain, elite and guardian, has 30% less life than it had.)
  brute: { kind: 'brute', name: 'Brute', life: 49, dmgMin: 14, dmgMax: 20, speed: 2.2, radius: 0.55, range: 1.7, windup: 0.85, cooldown: 2.3, xp: 18, ranged: false, projSpeed: 0, keepMax: 0, element: 'phys', aoe: 1.7, minDepth: 3, weight: 1 },
  warden: { kind: 'warden', name: 'Warden', life: 420, dmgMin: 18, dmgMax: 26, speed: 2.5, radius: 0.8, range: 2.6, windup: 0.95, cooldown: 2.4, xp: 150, ranged: false, projSpeed: 8, keepMax: 0, element: 'phys', aoe: 2.4, minDepth: 99, weight: 0 },
};

export function scaleLife(depth: number): number {
  return 1 + 0.35 * (depth - 1);
}

export function scaleDmg(depth: number): number {
  return 1 + 0.22 * (depth - 1);
}

// ---------------------------------------------------------------------------------------------
// The town's two vendors.

/**
 * What each of the town's two vendors deals in. The owner, 4 Oct 2026: "two different vendors,
 * one selling martial equipment, the other selling magical equipment". As read back to him:
 * martial is swords, two-handed swords, bows, shields, quivers and armour; magical is staffs,
 * wands, focuses, rings and amulets; and "each always stocks a plain weapon of each of its
 * kinds", so that a character can always change to another weapon.
 *
 * `weapons`: its kinds of weapon. A plain one of each is always on its shelf, first; and its
 * main-hand and off-hand pieces are those weapons and what goes with them (a shield with a
 * sword, a quiver with a bow, a focus with a wand).
 * `slots`: what else is on its shelf on a visit, one rolled piece for each entry.
 * A shelf is TUNE.shopSize pieces (tests/town.test.ts holds each vendor to it).
 */
export const VENDORS: Record<VendorId, { name: string; weapons: readonly WeaponKind[]; slots: readonly Slot[] }> = {
  armourer: { name: 'Armourer', weapons: ['sword', 'greatsword', 'bow'], slots: ['mainhand', 'offhand', 'helm', 'chest', 'gloves', 'belt', 'boots'] },
  mystic: { name: 'Mystic', weapons: ['staff', 'wand'], slots: ['mainhand', 'mainhand', 'offhand', 'offhand', 'ring', 'ring', 'amulet', 'amulet'] },
};
export const VENDOR_IDS: readonly VendorId[] = ['armourer', 'mystic'];

/**
 * What the stranger will let the hero gamble for: a kind of thing, named as loot on the floor is
 * named (items.ts, kindName). A weapon is its own kind; an off-hand piece is named by the weapon
 * it goes with (items.ts: a shield with a sword, a quiver with a bow, a focus with a wand).
 */
export interface GambleKind {
  name: string;
  slot: Slot;
  /** Main hand: the weapon. Off hand: the weapon the piece goes with. */
  weapon: WeaponKind | null;
  /** The picture it is shown by. */
  icon: 'sword' | 'greatsword' | 'bow' | 'wand' | 'staff' | 'shield' | 'quiver' | 'focus' | 'helm' | 'armor' | 'gloves' | 'belt' | 'boots' | 'ring' | 'amulet';
}
export const GAMBLE_KINDS: readonly GambleKind[] = [
  { name: 'Sword', slot: 'mainhand', weapon: 'sword', icon: 'sword' },
  { name: 'Greatsword', slot: 'mainhand', weapon: 'greatsword', icon: 'greatsword' },
  { name: 'Bow', slot: 'mainhand', weapon: 'bow', icon: 'bow' },
  { name: 'Wand', slot: 'mainhand', weapon: 'wand', icon: 'wand' },
  { name: 'Staff', slot: 'mainhand', weapon: 'staff', icon: 'staff' },
  { name: 'Shield', slot: 'offhand', weapon: 'sword', icon: 'shield' },
  { name: 'Quiver', slot: 'offhand', weapon: 'bow', icon: 'quiver' },
  { name: 'Focus', slot: 'offhand', weapon: 'wand', icon: 'focus' },
  { name: 'Helmet', slot: 'helm', weapon: null, icon: 'helm' },
  { name: 'Armour', slot: 'chest', weapon: null, icon: 'armor' },
  { name: 'Gloves', slot: 'gloves', weapon: null, icon: 'gloves' },
  { name: 'Belt', slot: 'belt', weapon: null, icon: 'belt' },
  { name: 'Boots', slot: 'boots', weapon: null, icon: 'boots' },
  { name: 'Ring', slot: 'ring', weapon: null, icon: 'ring' },
  { name: 'Amulet', slot: 'amulet', weapon: null, icon: 'amulet' },
];

/** The town's people who have something to say (state.ts, TownVoice). */
export const TOWN_FOLK: readonly ('armourer' | 'mystic' | 'wordsmith' | 'stranger')[] = ['armourer', 'mystic', 'wordsmith', 'stranger'];

/**
 * What the town's people say when the hero walks up to them (Version 14.5). The owner, 4 Oct
 * 2026: "And give the merchants some tag lines when you move close to them. Very sparsely tho
 * don't spam the lines".
 *
 * So: a line is said only as the hero COMES within `near` tiles of someone (not while they stand
 * there), only `chance` of those times, never within `gapOne` seconds of that person's last line,
 * and never within `gapAll` seconds of anybody's (walking the length of the hall past all four
 * gets one line at most). Nobody says the same line again until they have said all of theirs.
 * To add a line, add it to a list. Keep them short: they are read over a head, as a kill line is.
 */
export const TAGS: {
  chance: number;
  near: number;
  gapOne: number;
  gapAll: number;
  lines: Record<'armourer' | 'mystic' | 'wordsmith' | 'stranger', readonly string[]>;
} = {
  chance: 0.4,
  near: 3.2,
  gapOne: 90,
  gapAll: 30,
  lines: {
    armourer: ['Still in one piece?', 'Mind the sparks.', 'Good steel. Fair price.', 'Dull blade, short story.', 'Bring it back dented.', 'Hot off the anvil.'],
    mystic: ['The stars said you would come.', 'Looking is free.', 'Careful. That one bites.', 'A ring for every finger.', 'I saw this coming.', 'Something shiny?'],
    wordsmith: ['Choose your words.', 'Words have weight.', 'Mind your language.', 'Every rune remembers.', 'Well read, are we?', 'Say it. Mean it.'],
    stranger: ['Psst.', 'Feeling lucky?', 'No refunds.', 'You never saw me.', 'Fell off a cart.', 'Got coin?'],
  },
};

// ---------------------------------------------------------------------------------------------
// Tuning

/**
 * The first word of every character: it lies in a satchel half way through their first dungeon,
 * and the first dungeon suggests which attack it is for. The owner's choice: Power for the warrior
 * (on Strike), Poison for the ranger (on Trap), an element for the mage (Flame, on the staff's
 * quick attack). Every other word is found, at random. (The ranger's Trap was the bow's slow
 * attack when he chose; since Version 12.2 it is the ranger's evasive move, and the word goes with
 * it: 2.)
 */
export interface FirstWord {
  word: WordId;
  /** The ability it is suggested for: 0 the quick attack, 1 the slow one, 2 the evasive move. */
  skill: number;
}
export const FIRST_WORD: Record<ClassId, FirstWord> = {
  warrior: { word: 'power', skill: 0 },
  ranger: { word: 'poison', skill: 2 },
  mage: { word: 'fire', skill: 0 },
};

/**
 * The first dungeon teaches as it goes (the rules call it the guide). The owner's order: a prompt
 * on how to move; on meeting the first monsters, "tap to ..., tap + hold to ..."; after a couple of
 * blows, "swipe to ..." with the dodge pointed out; half way through, a body to search with a
 * word in its satchel, and the prompt to put the word on an attack.
 */
export const GUIDE = {
  /** Tiles walked before the first prompt goes. */
  steps: 3,
  /** Blows taken before the dodge is pointed out. */
  hits: 2,
  /** The flask is pointed out when life first falls below this share. */
  lowLife: 0.4,
  /** Monsters this near, and awake, are a fight. */
  near: 10,
  /** The body, or a word on the floor, is pointed out from this far off. */
  sight: 9,
  /** Until the body is reached there is no word: monsters before it deal this share of their damage. */
  softDmg: 0.5,
  /**
   * The moment the first word is set, the dead rise round the hero so that it can be felt at once:
   * how many, their life in average hits of the character's bare quick attack, their damage as a
   * share of a dungeon skeleton's, and their pace in tiles a second.
   */
  risen: 6,
  risenHits: 1.25,
  risenDmg: 0.4,
  risenSpeed: 2.2,
};

/**
 * The owner is trying two ways of limiting the slow abilities, and wants to feel both: a cooldown
 * and no mana at all, or mana and no cooldown ("both is overkill").
 */
export const LIMITS: readonly Limit[] = ['cooldown', 'mana'];
export const MANA_MODE = {
  /** What an ability costs, as a multiple of its listed mana. */
  cost: 1.4,
  /** Mana comes back this much faster. */
  regen: 1.3,
  /** The moment an ability needs between uses, so one press is one use. */
  recover: 0.5,
  /** The evasive move costs this, and needs this moment between uses. */
  evade: 6,
  evadeRecover: 0.3,
};

/** The practice room (title screen): a seasoned throwaway character, and monsters that keep coming. */
export const PRACTICE = {
  /** The level that opens the second socket behind (SLOT_LEVELS): two in front and two behind on both attacks and on the swipe. */
  level: 10,
  /** Item level of the gear handed out (usable at level 7). */
  ilvl: 4,
  /** Monsters are as tough as in this dungeon. */
  depth: 4,
  /** Copies of every word in the pouch: one for each side of each of the three abilities (the swipe takes words since Version 12.2). */
  words: 6,
  packSize: 6,
  /** A new pack walks in when this many monsters or fewer are left. */
  refillAt: 3,
};

/**
 * STRIKE, A TWO-HIT COMBO, AND A STEP FORWARD WITH EVERY SWING. The owner, 7 Oct 2026, 23:18: "I’d
 * like STRIKE to have two animations.  The first is the strike we have now.  That one always plays
 * first.  If the player taps again quickly, then the second animation, [a] downward slash, plays.
 * Back to the first if they tap again.  If it’s not tapped for a set duration, it goes back to the
 * first animation.  Like a two hit combo if you tap twice"; 23:18: "And I want him to move forward
 * a little every swing"; 23:19: "Not much, but some". ON SINCE VERSION 18.9: he saw it moving
 * (strike_combo.gif, 8 Oct 2026, 00:42, with "Put it in as it is?") and said, 07:32: "Yeah looks
 * good". The numbers are `TUNE.comboWindow`, `swingStep`, `swingStepTime`: the two swings do the
 * same harm. (Off, Strike is the one swing it was, with no step: tests/combo.test.ts.)
 */
export const COMBO = { on: true };

/**
 * THE RANGER'S ARROWS LEAVE FROM WHERE HIS PICTURE HAS THEM (the art chat, 8 Oct 2026; the owner,
 * 15:38: "the arrow that fires in the animation for shot doesn’t match the actual projectile that
 * comes out for shot"). A MOCK-UP BEHIND A SWITCH THAT IS OFF, switched with the ranger's new
 * stances (art/moves3.ts, useRangerStances). With it on, a hero's arrow is drawn from where the
 * point of the arrow on his string was the moment before it went (`from` tiles ahead of him: it is
 * not seen before it gets there, as it is still on the bow; `height` game pixels off the floor, at
 * which it flies), as long as that arrow (`long` game pixels, where it was 6); and a Volley's
 * arrows go up from where his bow is (`volleyFrom` tiles ahead of him, `volleyHeight` up). The
 * rules are not changed: an arrow still starts 0.4 tiles ahead of him and hits what it hits.
 * With it off, as before: drawn from the start, 10 pixels up, 6 long; a volley from 10 pixels to
 * the right of the feet, 27 up. (tests/ranger_stances.test.ts holds the numbers to the picture's.)
 */
export const RANGER_ARROW = { on: false, from: 0.796, height: 22.5, long: 11, volleyFrom: 0.291, volleyHeight: 27.6 };

export const TUNE = {
  heroRadius: 0.3,
  heroSpeed: 4.6, // tiles per second
  baseLife: 60,
  /**
   * Levels (Version 11.1). The owner, 4 Oct 2026: "Leveling is too fast. Let's maybe cut it in
   * half at least."
   *   xpScale       how much experience a level takes, as a multiple of what it took until then.
   *                 Twice was tried first: because the early levels are cheap, a character still
   *                 ended the first dungeon at level 4 (it had been 5). At three times it is level
   *                 3: two level-ups in the first dungeon where there were four, and 3, 5, 6, 7
   *                 at the end of the first four dungeons where it was 5, 7 or 8, 10, 11 or 12.
   *   lifePerLevel  \ what a level gives. They were 8 and 3. With fewer levels and no more from
   *   attrPerLevel  / each, a character took a quarter to two thirds more damage per dungeon
   *                 (a bot that clears everything, counted in lives). At 12 and 5 it takes what
   *                 it took before: fewer level-ups, each worth more, and the game no harder.
   * tools/count_levels.ts prints the level at the end of each dungeon; DESIGN_NOTES section 4,
   * "Levels", has the measurements.
   */
  lifePerLevel: 12,
  attrPerLevel: 5,
  xpScale: 3,
  baseMana: 40,
  baseLifeRegen: 0.6,
  baseManaRegen: 2.5,
  baseCrit: 5,
  baseCritMult: 50,
  unarmedMin: 2,
  unarmedMax: 4,
  unarmedAps: 1.2,
  /** How much the hero slows while an attack is going out. */
  attackSlow: 0.4,
  attackSlowTime: 0.18,
  /** With the quick attack held, a slow attack's follow-through is seen out until this little of it is left (seconds). */
  attackCut: 0.12,
  /**
   * STRIKE, A TWO-HIT COMBO (`COMBO`). After a strike, the next is the SECOND SWING, the downward
   * slash, if it is begun within this many seconds of the moment it could first be begun (the
   * weapon's own time between blows); otherwise the first swing again. His "set duration".
   */
  comboWindow: 0.5,
  /** And every swing of Strike steps the hero forward this far, in tiles, over this many seconds from when it is begun (walls and monsters stop it as they stop him). */
  swingStep: 0.33,
  swingStepTime: 0.12,
  bagSize: 24,
  /** The stash in town: gear kept for later characters. */
  stashSize: 36,
  /** Items the vendor offers on each visit to town. */
  shopSize: 10,
  /** How many of the pieces the hero sells on a visit the vendor keeps, to be bought back (the oldest goes for good). */
  soldKept: 30,
  /** Selling pays this share of an item's price. */
  sellRate: 0.25,
  /**
   * The wordsmith's trade in words (Version 14.5). He has `wordStock` words for sale on each visit
   * to town, never the same word twice. One costs `wordPrice` gold for each dungeon cleared so far
   * (never less than one dungeon's worth): about what the last dungeon dropped in gold (measured by
   * tools/count_gold.ts: 280, 620, 1000, 1350, 1800 for the first five), so that words stay
   * scarce and a word bought is a dungeon's whole purse. He pays `wordSellRate` of that for a
   * word he is sold, and keeps the last `wordsSoldKept` of them on that visit to be bought back
   * for the same (as the vendors do with gear).
   */
  /**
   * The trades are open since Version 15 (the owner saw their two screens on 5 Oct 2026 and said
   * at 23:08 that everything looked great). Their rules were written for Version 14.5 with this
   * false (the wordsmith's words, the stranger's gamble, the lines the town's people say); their
   * screens are ui/trades.ts. With this false the stranger has no service, the wordsmith opens
   * the inventory alone and nobody in town speaks.
   */
  tradesOpen: true,
  wordStock: 3,
  wordPrice: 300,
  wordSellRate: 0.25,
  wordsSoldKept: 9,
  /**
   * The stranger's gamble (Version 14.5; the owner: "a shady guy in the corner that will let you
   * gamble for a random item"). A throw costs `gambleMult` times what a plain piece of that kind
   * is worth at the vendors'. What comes out is of that kind, and magic `magic` of the time,
   * rare `rare` of the time, plain the rest. `unique` is his chance of a unique piece once there
   * are any ("I want the shady guy's gamble to have a very low chance to give a unique when we
   * add them"): it is not used yet, and is here so that it is one number to set.
   */
  gambleMult: 3,
  gambleOdds: { magic: 0.35, rare: 0.1, unique: 0.005 },
  /** Words that can be burned into one dungeon. */
  planMax: 3,
  /** How close the hero must stand to use something in town. */
  useRange: 1.9,
  potionMax: 3,
  potionHeal: 0.45, // fraction of max life
  potionKills: 18, // kills per refilled charge
  sightRadius: 11,
  aggroRadius: 9,
  /** Elite monsters: how much tougher than a normal one. */
  eliteLife: 4,
  eliteDmg: 1.4,
  /**
   * Guardians (the powerful monster at the end of a side branch): tougher again than an elite, and
   * bigger. Five times the life of a monster of their kind. (A guardian is a brute, and EVERY KIND
   * OF BRUTE HAS 30% LESS LIFE SINCE VERSION 18.7: 49 where it was 70, see `MONSTERS`. The owner, 7
   * Oct 2026, 19:35: "the larger guardian mobs are just big damage sponges and could use at least
   * a 30% reduction in HP"; and at 21:10, asked whether elite brutes, which Version 18.6 had left
   * with more life than a guardian, should be cut too: "yes, every interation of that mob type".
   * Version 18.6 alone had this number at 3.5, with the brute at 70: for a guardian the same life.)
   */
  guardianLife: 5,
  guardianDmg: 1.25,
  guardianSize: 1.25,
  /**
   * A monster's attack, by the clock: it winds up for its `windup` (MONSTERS), the blow lands,
   * and for this long afterwards it does nothing else. The Warden's volley of bolts winds up for
   * less than his slam does. (The pictures are timed by these: Renderer.monsterSprite.)
   */
  monsterRecover: 0.3,
  wardenVolleyWindup: 0.7,
  /**
   * Drop chances for an ordinary monster. Loot was scaled back on 4 Oct 2026 (the owner: "let's
   * scale back the drops", to lower the clutter on the floor): about half as many pieces of gear
   * from every source, and gold in fewer, bigger piles that add up to the same gold.
   */
  dropGold: 0.25,
  /** Coins in an ordinary monster's pile, before the dungeon's depth multiplies them. */
  goldMin: 3,
  goldMax: 8,
  dropItem: 0.03,
  dropOrb: 0.06,
  /** A named monster leaves a piece of gear this often. (A guardian always leaves one.) */
  eliteItem: 0.5,
  /**
   * How much likelier than an ordinary drop a better source is to give [magic, rare] gear (the
   * chances themselves grow with the dungeons: `rarityChances` in items.ts). A named monster, a
   * chest and the rest of a boss's hoard are "better"; a guardian's piece, a vault's first and
   * the boss's first are a "hoard" (and the boss's first is never plain). Nothing is rare for
   * certain: in the first dungeons a rare piece is an event, and gear is made good with words.
   */
  betterLuck: [1.5, 2] as readonly [number, number],
  hoardLuck: [3, 4] as readonly [number, number],
  /** The vendor's stock, likewise. */
  shopLuck: [3, 2] as readonly [number, number],
  /** Pieces of gear in a chest, in the boss's hoard, and extra in the hoard of every fifth boss. */
  chestItems: 1,
  bossItems: 2,
  bossItemsFifth: 1,
  /**
   * Power words are scarce, and where they turn up is luck (the owner: "I don't want too many
   * words. They should be pretty random. I don't want a ton of words left over"). The boss of a
   * dungeon always gives up one. A named monster or a guardian carries one only sometimes (the
   * rune over its head says so); an ordinary monster or a chest holds one very rarely.
   */
  dropWord: 0.003,
  eliteCarry: 0.2,
  guardianCarry: 0.4,
  /** The first chest opened in a treasure vault, and any other chest. */
  vaultWord: 0.25,
  chestWord: 0.05,
  /**
   * The boss always gives up one word. The chance of a second grows with how deep the dungeon is
   * and with each word burned into it at the gate (a Greater Warden adds more); whatever chance is
   * left over above `bossThird` is the chance of a third.
   */
  bossExtraPerDepth: 0.06,
  bossExtraPerWord: 0.25,
  bossExtraGreater: 0.25,
  bossThird: 0.75,
  /**
   * Keeping a spare word in the Lexicon for a later character is a premium: it costs this much
   * gold, doubled for every word already kept there. (Taking one out is free.)
   */
  keepCost: 150,
  /** A word on the floor stands in its light this long before it can be taken. */
  wordStands: 1.0,
  /**
   * PICKING THINGS UP, in tiles from the hero. The owner, 7 Oct 2026, 19:13: "I need the pick up
   * range increased slightly".
   *   dropPull   gold, an orb or a word this near comes to the hero (2.6 until Version 18.5);
   *   dropTake   and is taken when it has come this near (as it always was: it is seen to arrive);
   *   gearTake   a piece of gear, which lies where it fell, is taken from this near (0.75 until
   *              18.5: it had to be all but stepped on).
   */
  dropPull: 3.2,
  dropTake: 0.75,
  gearTake: 1.1,
  /**
   * A trap (the ranger's roll leaves one where it began): seconds to arm once it is down, how near
   * a monster must step to set it off (its own size added), how long it waits, and how many may
   * lie at once (a Twin pair counts as one). The reach is a melee monster's and a little more
   * (a skeleton stands 1.25 tiles off to strike): what stood striking the ranger when they rolled
   * away sets the trap off as soon as it is armed, so the roll out of a fight is a blow struck.
   * (At 0.9, the tossed trap's, a skeleton at arm's length stood a twentieth of a tile outside it,
   * and a ranger rolling in a corner laid trap after trap that nothing set off.)
   */
  trapArm: 0.12,
  trapTrigger: 1.2,
  trapLife: 25,
  trapMax: 3,
  /**
   * Volley (the bow's slow attack): seconds the arrows are in the air before the first comes down,
   * seconds the rain lasts, seconds between arrows, and how far from where it lands an arrow hurts.
   * Twenty-four arrows, ten a second: it has to look like a rain (at twelve it was a trickle, and
   * in the pictures hardly there). What stands in the middle of the patch for the whole of it is
   * hit by about six of them, at the edge by three or four: `SKILLS.volley.dmg` is one arrow's.
   */
  volleyDelay: 0.45,
  volleyLife: 2.4,
  volleyEvery: 0.1,
  volleyHit: 0.8,
  /**
   * Aimed for the player at a monster that is coming for them (auto aim, the lock, the test bot),
   * a volley is put where the monster will be this long after the first arrow lands: it then
   * walks through the middle of the rain, or meets the hero under it.
   */
  volleyLead: 0.75,
  /** Poison: seconds it lasts (every new dose starts the time again), and the most doses that add up. */
  poisonTime: 4,
  poisonStacks: 8,
  /**
   * Orb (the staff's slow attack): seconds it stays where it was set, seconds between its waves
   * (it sends one out the moment it lands), and how many can be out at once: its cooldown is as
   * long as it lasts, so a second is only ever out beside the first for a hero whose cooldowns
   * have been shortened (another one takes the place of the older).
   */
  orbLife: 5,
  orbEvery: 1.0,
  orbMax: 2,
  /**
   * Familiar (the wand's quick attack): seconds it stays, seconds between its bolts, and how many
   * can be out at once (a fourth takes the place of the oldest).
   */
  familiarLife: 6,
  familiarEvery: 0.8,
  familiarMax: 3,
  /** Wave: with Twin in front the two go out this far to either side of the aim (radians). */
  waveFan: 0.3,
  /**
   * The attacks that go on while they are held (Whirlwind, Beam).
   * channelMinCool: let go early and the wait after it is shorter, by the part not used, but
   *   never less than this part of the whole cooldown.
   * channelWake: what the words behind such an attack leave (ground, a cloud, a rune), it leaves
   *   as it begins and again every so many seconds that it goes on.
   * beamWalk, whirlWalk: how fast the hero walks meanwhile, as a part of their speed.
   * whirlSpin: turns a second.
   */
  channelMinCool: 0.35,
  channelWake: 1.0,
  beamWalk: 0.7,
  whirlWalk: 0.9,
  whirlSpin: 1.6,
  /** Beam, with an element behind it: patches of ground are left along the line, this far apart and no more than this many. */
  beamPatchGap: 2.4,
  beamPatches: 4,
  /** Resistances never go above this. */
  resCap: 75,
  /** Frame-rate independent caps. */
  maxZones: 90,
};

/** Experience needed to go from `level` to the next (see TUNE.xpScale). */
export function xpToNext(level: number): number {
  return Math.round(TUNE.xpScale * (45 + 33 * level + 9 * level * level));
}

/**
 * The hero level at which each attack gets a second word slot: in front, and behind. (The owner:
 * "I want the second word upgrade on skills to come at level 5". Read as the first of the two,
 * which the game announces as "A second word slot has opened IN FRONT of your attacks": it came
 * at level 4. Told that the one behind came at level 8, he said: "Move the second behind to 10".)
 */
/**
 * The colours of the lines the game says in the corner of the screen ("Level 5", "Your bag is
 * full"), named by what a line is. They are the interface's own colours (ui/ui.ts, THEME, since
 * Version 13: tests/theme.test.ts holds the two together); they are written out here because the
 * rules must not reach into the interface for them.
 */
export const MSG = {
  /** An ordinary line. */
  plain: '#f0e8ff',
  /** Where you are, what level you are. */
  head: '#ffffff',
  /** News about words: the game's main business. */
  word: '#7af8f0',
  /** Something dangerous has a name. */
  foe: '#ff8a3a',
  /** Something worse is coming. */
  omen: '#ffc24a',
  /** Good news: the way home, a dungeon cleared. */
  good: '#8af078',
  /** The flasks. */
  life: '#ff9aa0',
  bad: '#ff6e80',
} as const;

/**
 * The level at which each word slot of an attack opens: the first in front and the first behind
 * are there from the start, the second in front at level 5 and the second behind at level 10
 * (the owner, 4 Oct 2026: "I want the second word upgrade on skills to come at level 5", "Move the
 * second behind to 10").
 *
 * A THIRD A SIDE is his idea of the same evening, not switched on: "Depending on how crazy we
 * want to get we can add a third in front at 15 and behind at 20". Everything that draws or
 * counts slots goes by these two lists (socketCount; the inventory's ATTACKS page; the attacks
 * written on the game screen), so adding 15 and 20 here is all it takes to try it: the test
 * hook `__dbg.thirdSlots(true)` does exactly that, for pictures. What it would still need
 * before it is real: tests/words.test.ts walks every loadout of up to two words a side on
 * every attack, and three a side is some thirty times as many; nobody has measured what six
 * words on one attack do to the monsters of dungeons 11 and deeper; and a name of seven words
 * is too long for some of the places an attack's name is written.
 */
export const SLOT_OPENS: { front: number[]; behind: number[] } = { front: [1, 5], behind: [1, 10] };

/** The levels that open the second slot in front and the second behind. */
export const SLOT_LEVELS = { front: SLOT_OPENS.front[1], behind: SLOT_OPENS.behind[1] };

/** Sockets an ability has at a given hero level: [in front, behind]. */
export function socketCount(level: number): [number, number] {
  return [SLOT_OPENS.front.filter((lv) => level >= lv).length, SLOT_OPENS.behind.filter((lv) => level >= lv).length];
}

export const ELEMENT_NAME: Record<Element, string> = { phys: 'Physical', fire: 'Fire', frost: 'Frost', lightning: 'Lightning' };

/**
 * What the hero may say on killing something big. The owner: "lets have some cool tag lines when
 * you kill a big enemy. they can be generic or tied to the type or element of the attack. 'im just
 * warming up' with a fire attack or 'chill out' with a frost attack. make them sparse, i dont want
 * it to get repetitive but it would be a nice little flair". And then: "add tag lines that are
 * connected to your highest attribute. strength, int, or dex. i thought about class specific lines
 * but if you had a line about crushing your enemy into the dirt but youre a warrior focused
 * speccing into int then that doesnt really make sense. and some tag lines for each weapon type".
 * And: "give the three characters a different voice" ... "yeah give them class specific lines too"
 * (so each class has lines of its own, about who they are and not about how the kill was made;
 * and each sounds different saying them: see speak() in engine/audio.ts).
 *
 * A boss always earns a line. An elite earns one `chance` of the time, and never within `gap`
 * seconds of the last. The line comes from one of the lists that fit the kill (`weight` says how
 * often each kind is the one), and no line is said twice until every line that fits has been said.
 * To add a line, add it to a list. Keep them short: they are read in the middle of a fight.
 */
/**
 * WHAT A HERO SAYS AS THEY COME INTO THE DUNGEON AT THE START OF THEIR RUN. The owner, 6 Oct 2026,
 * 22:24: "Then maybe a tag line like “I smell foul magics” or “I must purge the evil of this
 * place”. Something thematic to each character". These six were put to him (his two among them)
 * and he answered "Perfect". In each hero's voice as he gave it (see QUIPS.cls). The screen
 * picks one, not the rules: it must not use up any of a run's own luck.
 */
export const ARRIVAL_LINES: Record<ClassId, readonly string[]> = {
  warrior: ['I must purge the evil of this place.', 'Something down here needs killing.'],
  ranger: ['Fresh tracks. Something hunts here.', "Quiet now. It's close."],
  mage: ['I smell foul magics.', 'Someone has been meddling down here.'],
};

export const QUIPS: {
  chance: number;
  gap: number;
  weight: { boss: number; word: number; skill: number; weapon: number; attr: number; cls: number; any: number };
  word: Record<WordId, readonly string[]>;
  skill: Record<SkillId, readonly string[]>;
  weapon: Record<WeaponKind, readonly string[]>;
  attr: Record<Attr, readonly string[]>;
  cls: Record<ClassId, readonly string[]>;
  any: readonly string[];
  boss: readonly string[];
} = {
  chance: 0.3,
  gap: 45,
  weight: { boss: 3, word: 3, skill: 2, weapon: 2, attr: 2, cls: 2, any: 2 },
  /** By a word on the attack that made the kill. */
  word: {
    power: ['Big words.', 'Strong language.', 'Hit like you mean it.'],
    swift: ['Too slow.', 'Keep up.', 'Blink and you miss it.'],
    twin: ['Two for one.', 'Seeing double?', 'Once more, with feeling.'],
    fire: ["I'm just warming up.", 'Too hot for you?', 'Well done.', 'Feel the heat?'],
    frost: ['Chill out.', 'Cool it.', 'Put that on ice.', 'Cold comfort.'],
    lightning: ['Shocking.', 'Lights out.', 'Struck speechless?', 'Short circuit.'],
    leech: ['Thanks for the drink.', 'I feel better already.', "What's yours is mine."],
    volatile: ['Boom.', 'Mind the mess.', 'Handle with care.'],
    poison: ['Pick your poison.', 'Something you ate?', 'Bad for your health.'],
    heavy: ['Down you go.', 'Feel that?', 'Heavy hitter.'],
    precise: ['Right there.', 'Dead centre.', 'Through the gap.'],
    frenzied: ['More!', "Can't stop now.", 'Faster.'],
    guarding: ['Not today.', 'You missed.', 'Hold the line.'],
  },
  /** By the attack that made the kill. */
  skill: {
    strike: ['Point made.', 'Cut short.'],
    slam: ['Stay down.', 'Floored.'],
    whirlwind: ['What goes around.', 'A turn for the worse.', 'Spin doctor.'],
    leap: ['Look out below.', 'Dropped in.'],
    shot: ['Bullseye.', 'Right on the mark.'],
    volley: ['Heads up.', 'Rain check?', 'Forecast: arrows.'],
    trap: ['Watch your step.', 'Walked right into it.'],
    wave: ['Swept away.', 'Making waves.', 'A sweeping statement.'],
    orb: ['Full stop.', 'Period.', 'Give me some space.'],
    beam: ['Underlined.', 'Crossed out.', 'Read between the lines.'],
    familiar: ["Teacher's pet.", 'Good help is hard to find.'],
    warp: ['Surprise.', 'Now you see me.'],
  },
  /** By the weapon in hand. */
  weapon: {
    sword: ['Sharp answer.', 'Mightier than the pen.', 'Cut and dried.'],
    greatsword: ['Cut down to size.', 'Big sword. Short story.'],
    bow: ['Nock, nock.', 'Straight to the point.', 'Loosed and lost.'],
    wand: ['Wave goodbye.', 'A flick of the wrist.', 'Spelled it out.'],
    staff: ['Staff meeting adjourned.', 'Walk softly.'],
  },
  /** By the hero's highest attribute (gear counted), whatever their class. */
  attr: {
    str: ['Into the dirt.', 'Brute force works.', 'Crushed.', 'Heavy reading.'],
    dex: ['Never saw it coming.', 'Too quick for you.', 'Light on my feet.', 'Missed me.'],
    int: ['Outsmarted.', 'I did my homework.', 'Mind over monster.', 'Knowledge is power.'],
  },
  /**
   * By who the hero is. The owner: "the warrior very deep and gruff", "the ranger stoic and laconic,
   * like a hunter in woods that doesnt want to spook anything around him", "give the mage a british
   * accent". Never about how the kill was made (a warrior may be all Intelligence).
   */
  cls: {
    warrior: ['Hmph.', 'Done.', 'Was that it?', 'Stay dead.', 'Weak.'],
    ranger: ['Clean.', 'One less.', 'Quiet now.', 'Easy.', 'Hush.'],
    mage: ['Elementary.', 'Quite.', 'Jolly good.', 'Tut, tut.', 'How dreadfully dull.', 'Class dismissed.', 'A footnote, at best.'],
  },
  /** For any kill. The library is never far away: the hero is a child dreaming in detention. */
  any: ['Overdue.', 'Shh. This is a library.', 'Next.', 'Is that all?', 'Back on the shelf.', 'Closed book.', 'Quiet, please.', 'Read it and weep.'],
  /** For the boss of a dungeon. */
  boss: ['End of chapter.', 'The end.', 'And that is the last word.', 'Story over.', 'Checked out.'],
};
