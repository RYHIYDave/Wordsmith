// Data shapes for a running game: the hero, monsters, projectiles and everything else in a level.
// These are plain objects (no methods) so they can be saved and inspected easily.

import type { Sfx } from '../engine/audio';
import type { Limit, SkillId, SkillKind } from './defs';
import type { DoorInst } from './doors';
import type { HazardInst } from './traps';
import type { HeroMode } from './modes';
import type { Attr, ClassId, Element, EquipSlot, Floor, Item, MeldId, MonsterKind, PropKind, Stats, VoiceId, WordId } from './types';
import type { Ways } from './ways';
import type { Dress } from './first5';
import type { Land } from './act1_layout';
import type { HoldState } from './act1_holds';
import type { BellsState } from './bells';
import type { Act1Dress } from './act1_dress';

/** Everything worked out from class, level, attributes and gear. Rebuilt whenever one of those changes. */
export interface Derived {
  /** Summed stat table (gear plus attributes). */
  stats: Stats;
  str: number;
  dex: number;
  int: number;
  maxLife: number;
  maxMana: number;
  lifeRegen: number;
  manaRegen: number;
  dmgMin: number;
  dmgMax: number;
  /** Attacks per second with the single-target ability. */
  aps: number;
  critChance: number;
  critMult: number;
  armor: number;
  resFire: number;
  resFrost: number;
  resLight: number;
  /** Tiles per second. */
  moveSpeed: number;
  /** Cooldown recovery, 0 to 0.6. */
  cdr: number;
  /** Area-of-effect multiplier. */
  area: number;
}

/** An ability with its power words applied: every number the rules need to deliver it. */
export interface Resolved {
  id: SkillId;
  /** "Twin Flame Orb of Echoes". */
  name: string;
  element: Element;
  /** Multiplier on weapon damage for one direct hit. */
  dmgMult: number;
  /** Multiplier on reach, projectile size and blast radius. */
  size: number;
  /** Uses per second for weapon-speed abilities. */
  rate: number;
  cooldown: number;
  mana: number;
  /** Deliveries per use (Twin in front = 2) and the damage fraction of each. */
  count: number;
  countDmg: number;
  /** Single-target abilities: splash radius around the hit and its damage fraction. 0 = none. */
  splash: number;
  splashDmg: number;
  /** Projectiles keep going through enemies. */
  pierce: boolean;
  projSpeed: number;
  // --- in front: the hit ---
  /** Burn: total extra damage over 3 s as a fraction of the hit. */
  ignite: number;
  /** Slow fraction applied on hit; a second hit on a chilled enemy freezes it. */
  chill: number;
  /** Extra enemies the hit arcs to, and the damage fraction of each arc. */
  arcs: number;
  arcDmg: number;
  /** Life healed per enemy hit. */
  leech: number;
  /** Enemies killed explode for this fraction of their max life. */
  volatile: number;
  /** Poison: each hit adds a dose that deals this fraction of the hit every second while it lasts. 0 = none. */
  poison: number;
  /** HEAVY in front (Version 19.3): seconds a hit stuns for (0 = none). It also hits harder and is slower: dmgMult, rate, cooldown. */
  stun: number;
  /** PRECISE in front: a narrow, exact hit (more damage, a smaller area: dmgMult, size); the flag is for its look. */
  precise: boolean;
  /** FRENZIED in front: each use adds a stack of speed (up to FRENZY.max). */
  frenzy: boolean;
  /** GUARDING in front: each use gives the hero a shield of this fraction of their life (0 = none). */
  shield: number;
  /** WORDMELDING (game/melds.ts): the melded word in front, whose twist the hit carries, or null. */
  meld: MeldId | null;
  // --- behind: the wake ---
  /** Each use adds this % damage for a few seconds (stacks). */
  might: number;
  /** Each use adds this % move speed for a few seconds. */
  haste: number;
  /** The ability repeats once at this damage fraction. 0 = no echo. */
  echo: number;
  /** Ground left where the ability hits (or along a projectile's path). */
  zone: null | { kind: 'burn' | 'ice' | 'storm' | 'steam'; element: Element; dps: number; slow: number; dur: number };
  /** Chance that an enemy it kills drops a life orb. */
  orbChance: number;
  /** A rune left at the impact that detonates for this fraction of the hit. 0 = none. */
  rune: number;
  /** A cloud of poison left at the impact: this fraction of the hit every second to whatever stands in it. 0 = none. */
  cloud: number;
  /** HEAVY behind (Version 19.3): cracked ground left where it hits, for this many seconds; an enemy walking onto it is staggered. 0 = none. */
  cracks: number;
  /** PRECISE behind: the first enemy each use hits is marked: the hero's next hit on it is a certain critical. */
  mark: boolean;
  /** FRENZIED behind: a kill by it adds a stack and holds the frenzy longer. */
  frenzyFeed: boolean;
  /** GUARDING behind: a ward circle left where it hits; inside it the hero takes this fraction less damage. 0 = none. */
  ward: number;
  /**
   * THE CITY'S WORDS (Version 23.8; game/defs.ts PULL, SPLIT, HEX, STILL), each 0 for none. In front: PULLING drags what it hits
   * this many tiles toward where it struck; SPLITTING's copies, each this share of the hit; HEXING's curse, this much more damage
   * taken; STILLING's slowing, this much slower. Behind: PULLING's vortex, for this many seconds; SPLITTING's shards, each this
   * share of the hit; HEXING's circle, enemies inside dealing this much less; STILLING's bubble, enemies in it this much slower.
   */
  pull: number;
  split: number;
  hex: number;
  still: number;
  vortex: number;
  shards: number;
  hexCircle: number;
  bubble: number;
  /** WORDMELDING: the melded word behind, whose twist what it leaves carries, or null. */
  meldBehind: MeldId | null;
  /** Plain-language lines for the character panel. */
  lines: string[];
}

export interface SkillState {
  id: SkillId;
  front: (WordId | null)[];
  behind: (WordId | null)[];
  /** Seconds until it can be used again (cooldown abilities). */
  cd: number;
  /** The ranger's roll (Trap) holds charges; everything else has one. */
  charges: number;
  maxCharges: number;
  /** How many times it has been used this run. The interface watches this to see an order carried out. */
  uses: number;
  r: Resolved;
}

export type Anim = 'idle' | 'walk' | 'attack';

/**
 * An attack that goes on while its button is held (Version 12.1: SkillDef.channel). `t` is how long
 * it has gone on; `next` the seconds to its next bite; `bites` how many it has made; (tx, ty)
 * where it is aimed now (a beam follows the finger); `wake` the moment of `t` at which it next
 * leaves what the words behind it leave.
 */
export interface Channel {
  skill: number;
  t: number;
  next: number;
  bites: number;
  tx: number;
  ty: number;
  wake: number;
}

export interface Hero {
  cls: ClassId;
  level: number;
  xp: number;
  /** Level-up choices waiting to be made. */
  pending: number;
  /** Class attributes plus every level-up choice (gear is added in Derived). */
  attrs: Record<Attr, number>;
  life: number;
  mana: number;
  x: number;
  y: number;
  /** Facing, a unit vector in world space. */
  fx: number;
  fy: number;
  anim: Anim;
  animT: number;
  /** Counts down while the attack animation plays. */
  attackT: number;
  /** Which of the hero's abilities that animation is for: 0 the quick attack, 1 the slow one. Only the picture cares. */
  attackSkill: number;
  /**
   * STRIKE'S COMBO (defs.ts, COMBO): which swing the strike being made is (0 the first, 1 the
   * second, the downward slash), and for how many seconds more the next may still be the second.
   */
  combo: number;
  comboT: number;
  /** A swing's step forward that is not yet over: how far it has still to go along x and along y, and the seconds it has left. */
  step: { dx: number; dy: number; t: number } | null;
  /** THE FIRST FIVE FLOORS (game/bosses.ts): seconds more that he is held (the Chained One's hook has him): he cannot walk or dodge, and goes where he is dragged. */
  held?: number;
  /**
   * An attack takes a moment to make (since Version 11: the owner asked that "spells have a cast
   * time even if they are really short"). `attackAge` is how long ago the one being made was
   * begun, and `attackWind` how long its wind-up is: the blow lands, the arrow leaves, the spell
   * goes off when the first reaches the second. `windup` is the attack that has been begun and has
   * not landed yet (which ability, where it was aimed, how long is left), or null.
   */
  attackAge: number;
  attackWind: number;
  windup: { skill: number; tx: number; ty: number; t: number } | null;
  /** An attack that is going on while its button is held (Whirlwind, Beam), or null. */
  channel: Channel | null;
  /** A slow attack asked for while another attack was still being made: it follows at once. */
  queued: { tx: number; ty: number; t: number } | null;
  /** Seconds until the single-target ability can be used again. */
  swingT: number;
  /** White hit-flash timer. */
  flash: number;
  /** While above zero nothing can hurt the hero. */
  invuln: number;
  gear: Record<EquipSlot, Item | null>;
  bag: (Item | null)[];
  /** Spare power words carried, by count. */
  /** (WORDMELDING: with MELD off, only the thirteen words found in the dungeon are counted here: game/melds.ts, wordIds) */
  words: Record<WordId, number>;
  /** Single target, area, evasive. */
  skills: SkillState[];
  gold: number;
  potions: number;
  potionKills: number;
  /** "of Power" stacks and their timer. */
  might: number;
  mightT: number;
  /** "of Swiftness" bonus (%) and its timer. */
  haste: number;
  hasteT: number;
  /** Frenzied (Version 19.3): stacks of frenzy, each making the hero's attacks and the recovery of their cooldowns faster (FRENZY), and the seconds before they fade. */
  frenzy: number;
  frenzyT: number;
  /** Guarding in front: what the shield will still take before the hero's life does, and its seconds left. */
  shield: number;
  shieldT: number;
  /**
   * THE CITY'S WORDS on monsters (Version 23.8), each absent until one first touches the hero: HEXING, seconds left of a monster's
   * curse on him and the share more damage he takes meanwhile; STILLING, seconds left of his cooldowns running slower, and by how much.
   */
  hexT?: number;
  hexMore?: number;
  stillT?: number;
  stillK?: number;
  /** Harm from monsters that carry element words. */
  burnT: number;
  burnDps: number;
  chillT: number;
  chill: number;
  shockT: number;
  /** Poison from monsters that carry the word: damage a second, and the seconds it has left. */
  poisonT: number;
  poisonDps: number;
  /** A leap or a roll in progress. */
  /** `over`: a roll that goes over a ledge or a pit (a dive: it leaves the floor). */
  /** (`hit`: THE SKILL TREES REMADE, Drilled Lunge: the enemies struck on the way, each once.) */
  move: null | { kind: 'leap' | 'roll'; t: number; dur: number; x0: number; y0: number; x1: number; y1: number; over?: boolean; hit?: number[] };
  /**
   * THE FIRST LEVELS (defs.ts, FIRST_LEVELS): whether the wordsmith's ring is lit for this hero,
   * so that he can wordsmith (always, with the switch off and for a hero saved before it); and the
   * quest item he carries, if any.
   */
  ring: boolean;
  quest: 'heart' | null;
  /**
   * WORDMELDING (game/melds.ts, MELD, off until his yes): the runedust carried, which melding uses;
   * and melding at the wordsmith: 'stone' while the hero carries the Meldstone to him, 'open' once
   * it is brought.
   */
  dust: number;
  meld: 'stone' | 'open' | null;
  /** THE SKILL TREES (game/talents.ts, TALENTS, off until his yes): the talents taken, in the order taken. */
  talents: string[];
  d: Derived;
}

/**
 * ('charge': THE MONSTERS' ATTACKS, the red troll running down the line he marked: game/defs.ts CHARGE.
 * 'pickup': THE NEW MONSTERS, the Boneward stooping for its spear: game/defs.ts SPEAR.)
 */
/** ('act': THE FIRST FIVE FLOORS, game/bosses.ts: it is making one of its acts, a move with a clock of its own: `Monster.act`.) */
export type MonsterState = 'sleep' | 'chase' | 'windup' | 'recover' | 'charge' | 'pickup' | 'act';

export interface Monster {
  id: number;
  kind: MonsterKind;
  name: string;
  x: number;
  y: number;
  r: number;
  fx: number;
  fy: number;
  life: number;
  maxLife: number;
  dmgMin: number;
  dmgMax: number;
  speed: number;
  elite: boolean;
  /** A guardian: the powerful monster at the end of a side branch. Guardians are elite too. */
  champion: boolean;
  boss: boolean;
  /** Power words it has the powers of (elites and bosses), plus any burned into the dungeon. */
  words: WordId[];
  /**
   * MONSTER PACKS (game/defs.ts, PACKS): what it is in a blue or a yellow pack. 'blue': one of a
   * blue pack, every one of which has the pack's word. 'leader': a yellow pack's leader, an elite.
   * 'minion': one of a yellow pack's others, with its leader's words at half strength (`half`).
   * Absent: a plain pack's, a guardian, the boss.
   */
  rarity?: 'blue' | 'leader' | 'minion';
  /** Those of its words it has at half strength (a minion: its leader's). */
  half?: WordId[];
  /** The words it will give up when it dies: the rune stones over its head. Most monsters have none. */
  carries: WordId[];
  state: MonsterState;
  /** Time left in the current state. */
  t: number;
  /** Seconds until it may attack again. */
  cd: number;
  packId: number;
  anim: Anim;
  animT: number;
  flash: number;
  burnT: number;
  burnDps: number;
  chillT: number;
  chill: number;
  frozenT: number;
  freezeImmune: number;
  /** Poison: seconds left, the damage a second of all its doses together, and how many doses that is. */
  poisonT: number;
  poisonDps: number;
  poisonN: number;
  /**
   * Heavy (Version 19.3): seconds it is stunned for (it cannot move or attack) and staggered for
   * (its attack broken off), and the seconds before cracked ground may stagger it again.
   */
  stunT: number;
  staggerT: number;
  staggerCd: number;
  /** Precise behind: seconds the mark on it has left (the hero's next hit on it is a certain critical). */
  markT: number;
  /** THE SKILL TREES: seconds left shocked by a lightning hit (Overload's mark; nothing else reads it). */
  shockT: number;
  /**
   * WORDMELDING (game/melds.ts), each absent until a melded word first touches it: seconds before
   * Scald may crack it again, and before Fumes' cloud may rise off it again; Frostbite's bite (a
   * share of a hit, a second, while it is chilled); seconds left of Blight's mark on it.
   */
  scaldCd?: number;
  fumesCd?: number;
  biteDps?: number;
  blightT?: number;
  /** Guarding: what is left of the shield it carries, which takes damage before its life does. */
  shield: number;
  /**
   * THE CITY'S WORDS (Version 23.8), each absent until one first touches it: HEXING, seconds left of the hero's curse on it and the
   * share more damage it takes meanwhile; STILLING, seconds left slowed in time and how much slower; SPLITTING, true for one of
   * the two a splitting monster split into (they split no more).
   */
  hexT?: number;
  hexMore?: number;
  stillT?: number;
  stillK?: number;
  split?: boolean;
  /** VOLATILE'S MELDS (behind VOLT_MELDS): Demolition's burst at half its life has gone off on it (once). */
  demolished?: boolean;
  /** Which hero ability last hurt it (for effects that trigger on a kill), or -1. */
  lastSkill: number;
  /** True while the hero can see it. */
  seen: boolean;
  /** Seconds the health bar stays visible. */
  barT: number;
  /** Boss only: which summon thresholds have fired. */
  phase: number;
  /** Boss only: which attack is winding up (0 = ground smash, 1 = volley). */
  atk: number;
  /**
   * THE MONSTERS' ATTACKS (game/defs.ts, MONSTER_ATTACKS; a monster that has moves, movesOf): which of
   * its moves it is making (an index into them; -1, or absent, none), and the seconds left before each
   * may be used again (set as it wakes).
   */
  move?: number;
  moveCd?: number[];
  /** The red troll's charge: the line he runs along (from where he stood to where he will stop), and whether he has run the hero down on it yet. */
  charge?: { x0: number; y0: number; x1: number; y1: number; hit: boolean };
  /** THE NEW MONSTERS (game/defs.ts SPEAR): the Boneward's spear is out of its hand (flying, or lying where it fell: Game.spears). */
  bare?: boolean;
  /** THE NEW MONSTERS (game/defs.ts RALLY): a minion's seconds left of its leader's words whole, since the skeleton champion's cry. */
  rallyT?: number;
  /**
   * THE FIRST FIVE FLOORS (game/bosses.ts). HOW IT GOES OVER THE FLOOR (`gait`), for one whose pictures
   * set off, walk and stop (the bosses of floors 2 to 5, the bone beast, the mini fleshmancer): what it
   * is doing, and how long it has been at it (`t`: seconds of its pictures; a walk's is how far round its
   * loop it is). `stop`: it means to stop as its walk next comes round.
   */
  gait?: { mode: GaitMode; t: number; stop?: boolean };
  /**
   * THE ACT IT IS MAKING (state 'act'): which (`id`), its clock (`t`, seconds of its picture), its own
   * number (`n`: what it leaves on the floor is tied to it), the hand it is drawn with (`hand`: 1, or -1
   * where its picture is turned over, so that what goes to its left in the picture goes to its left on
   * the floor), and what the act itself needs to keep (`a`, `b`, `x`, `y`: BossRules).
   */
  /** (`rate`: how fast its clock runs, its pictures with it: 1 if not said; floor 13's pair's ultimate and the Quill's flight, 2) */
  act?: { id: ActId; t: number; n: number; hand: 1 | -1; a: number; b: number; x: number; y: number; rate?: number };
  /** The Chained One: how many of his chains he has broken (0, 1 his left, 2 the ball's too). */
  form?: number;
  /**
   * ACT 1, THE DESCENT (game/act1/): what a kind's own rules keep on one of them, by name (a leech latched
   * on, a vulture up in the air, the Eye's phase): each kind's rules say what.
   */
  a1?: Record<string, number>;
  /** ACT 1: seconds since it was last struck (its `reel` picture plays from it: render/figure.ts gaitFrame). */
  struckT?: number;
  /** Set when it dies; the body is swept out of the list at the end of the frame. */
  dead: boolean;
  xp: number;
  /** A per-monster random number for small variations (bat weaving, idle timing). */
  seed: number;
  /** (game/bosses.ts FLESH_BLINK) How long the hero has been close to him; how long until he goes anyway. */
  blinkCrowd?: number;
  blinkT?: number;
  /** (FLESH_BLINK) Gone, and to come back up (rise) at once. */
  blinkRise?: number;
  /**
   * THE SKILL TREES REMADE (game/talents.ts TALENTS2): Honed Edge's bleeding (seconds left, and harm a second); Giant
   * Slayer's cracks in its guard (each, harm to it TALENT_TUNE.giantSlayer2.each more); thrown across the floor (by a
   * talent: Thorns, Long Shot, Second Wind, Shieldwall's burst, Wide Traps' pull; `ice`: Deep Freeze's slide, frozen,
   * freezing what it slides into), its speed along x and y and the seconds left of it.
   */
  bleedT?: number;
  bleedDps?: number;
  cracks?: number;
  thrown?: { vx: number; vy: number; t: number; ice?: boolean };
}

/**
 * MONSTER PACKS: what a minion's blow carries of its leader's words (game/defs.ts, PACKS): which words
 * it has at half strength, and its own element, which the rest of the blow keeps when one of them is
 * Flame, Frost or Lightning (half of its blow is then of that element).
 */
export interface HalfWords {
  words: readonly WordId[];
  base: Element;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** Tiles left to fly. */
  dist: number;
  hostile: boolean;
  /** Hostile shots: damage already rolled. Hero shots: fraction of a normal hit. */
  dmg: number;
  element: Element;
  /** 'mote': a familiar's small bolt. ('orb' was the mage's thrown orb until Version 12; nothing fires one now.) 'spear': the Boneward's, and 'great', the bone marksman's great arrow (Version 19.9). */
  look: 'arrow' | 'orb' | 'bolt' | 'mote' | 'wave' | 'dart' | 'spear' | 'great';
  pierce: boolean;
  /** THE SKILL TREES (Piercing): how many more enemies a shot that does not pierce may still pass through. */
  pierceN?: number;
  /**
   * Ids of monsters already hit, so a piercing shot hits each once. The shots of one use share one
   * list (a Twin pair): no enemy takes both of them.
   */
  hit: number[];
  /** One of several shots loosed by a single use. */
  volley: boolean;
  /** Hero shots: which ability fired it. */
  skill: number;
  /** Tiles flown since it last left a ground patch. */
  trail: number;
  /** Hostile shots: the words of the monster that fired it. */
  words: WordId[];
  /** Hostile shots: a minion's, those of the words it has at half strength (MONSTER PACKS). */
  half?: HalfWords;
  /** True once a rune (or a cloud) has been left, so an ability leaves only one. */
  runed: boolean;
  clouded: boolean;
  /** It has given its "of Power" stack (one for each shot that lands, however many it goes through). */
  mighted?: boolean;
  /** It has left its cracked ground or its ward (Heavy or Guarding behind): one for each shot, where it first hits or ends. */
  left?: boolean;
  age: number;
  /** Hostile shots: the name of the monster that fired it (for "slain by"). */
  from: string;
  /** Hero shots: 0 for the first of a cast, 1 for its twin. */
  n: number;
  /**
   * (THE TRAPS) A dart of a dart wall: the dungeon's, not a monster's. It hurts the hero and the
   * monsters alike, and `dmg` is the share of the life of whatever it meets.
   */
  trap?: boolean;
  /** (THE CITY'S WORDS, Version 23.8) A monster's shot: the monster that shot it (a hex circle it stood in weakens the shot). */
  by?: number;
  /** (THE NEW MONSTERS) The Boneward's spear: the monster that threw it, its whole way (tiles), and how high over the floor it left the hand (the game's pixels). */
  src?: number;
  way?: number;
  z0?: number;
  /** (THE NEW MONSTERS) A hostile shot that pierces (the marksman's great arrow): it has hurt the hero once, and flies on. */
  struck?: boolean;
  /** THE SKILL TREES REMADE (TALENTS2): a hero's arrow: tiles flown (Far Sight); bounced off a wall (Ricochet); one of three split off a kill (Split Shot), which split no more; a certain critical (Keen Eye's has none: that is the enemy's). */
  flown?: number;
  bounced?: boolean;
  split?: boolean;
}

/**
 * THE NEW MONSTERS (Version 19.9, game/defs.ts SPEAR): a Boneward's spear lying on the floor where it
 * fell, pointing the way it flew, until its Boneward picks it up (`owner`: that monster's id). `flow`:
 * the way to it, by the way one walks (worked out when it falls; null where nothing can walk to it).
 */
export interface Spear {
  x: number;
  y: number;
  fx: number;
  fy: number;
  owner: number;
  flow: Uint16Array | null;
}

/** 'cracks': Heavy behind, cracked ground that staggers; 'ward': Guarding behind, a circle the hero takes less harm in (Version 19.3). */
/** ('lane': THE MONSTERS' ATTACKS, the line a red troll will charge along: from (x, y) to (x1, y1), `r` half its width.) */
/** ('skull': THE NEW MONSTERS, a skull the Golem has hurled: thrown from (x1, y1), coming down on (x, y) at `dur`, bursting after: game/defs.ts SKULL.) */
/** ('aim': the bone marksman's line of aim for his great shot, from (x, y) to (x1, y1), its `t` of `dur` how far he has drawn: game/defs.ts AIM. 'smoke': the high priest's burning smoke, that burns the hero in it: SMOKE.) */
export type ZoneKind = 'burn' | 'ice' | 'storm' | 'venom' | 'rune' | 'warn' | 'cracks' | 'ward' | 'lane' | 'skull' | 'aim' | 'smoke' | 'steam' | 'vortex' | 'hex' | 'bubble';

export interface Zone {
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
  kind: ZoneKind;
  element: Element;
  /** Damage per tick (ground patches), the blast damage (rune, warn), or the share of harm a ward takes off (ward). */
  dmg: number;
  slow: number;
  tick: number;
  /** 'warn' zones are monster attacks about to land. */
  hostile: boolean;
  skill: number;
  words: WordId[];
  /** Hostile zones: the name of the monster that made it (for "slain by"). */
  from: string;
  /** A warning laid by a monster's wind-up: that monster's id (a stun or a stagger breaks the attack off, and its warning with it). */
  src?: number;
  /** A warning laid by a minion: those of its words it has at half strength (MONSTER PACKS). */
  half?: HalfWords;
  /** A charge's line ('lane'): where it ends; and while he runs it, how much of the way he has come (0 to 1). Its `t` of `dur` is how far his wind-up has gone. A Golem's skull ('skull'): where it was thrown from; `gone` 1 once it has come down. */
  x1?: number;
  y1?: number;
  gone?: number;
  /** WORDMELDING: the melded word behind the ability that left it, whose twist it carries (game/melds.ts). */
  meld?: MeldId;
  /** WORDMELDING: seconds until it may do its twist again (Wildfire's spark). */
  meldT?: number;
  /** VOLATILE'S MELDS (behind VOLT_MELDS): Shatter's rune has frozen what is in it. */
  froze?: boolean;
  /** VOLATILE'S MELDS (behind VOLT_MELDS): a Chain Reaction rune already set off by another's link. */
  linked?: boolean;
  /** WORDMELDING: the melded word whose look it has, for the pictures only (render/melds3.ts): a patch its twist in front left (Eruption's molten pool, Fumes' cloud), or what one behind left (as `meld`). */
  look?: MeldId;
}

/**
 * THE MONSTERS' ATTACKS: one of the dead the Warden has called, crawling out of the ground (game/defs.ts
 * SUMMON). Until it is out it is not among the monsters: a picture only, not to be hit, doing nothing.
 * `age`: seconds since it began to come up (below 0: not yet; it comes up a little after the one before).
 */
export interface Riser {
  m: Monster;
  age: number;
  /**
   * THE FIRST FIVE FLOORS (game/bosses.ts): how it comes. Absent, the Warden's way: it crawls out of the
   * ground (and so the mini fleshmancer's dead, out of the ground where a cultist's body lay). 'gather':
   * the Fleshmancer's way: its bones are snatched up off a heap and slam together (after `stir` seconds
   * of his fire on the heap). `rise`: seconds until it is out and one of the monsters (SUMMON.rise if absent).
   */
  way?: 'gather';
  rise?: number;
}

/** THE FIRST FIVE FLOORS (game/bosses.ts): how one with a gait of its own is going over the floor. */
export type GaitMode = 'stand' | 'raise' | 'carry' | 'setOff' | 'walk' | 'halt' | 'lower';
/** The acts of the bosses of floors 2 to 5, of the bone beast and of the mini fleshmancer (game/bosses.ts ACTS). */
export type ActId =
  | 'chop' | 'sentence' | 'sweep' | 'axe'
  | 'lash' | 'hook' | 'whirl' | 'ball' | 'breakL' | 'breakBall'
  | 'swipe' | 'floorArms' | 'swarm' | 'devour' | 'burst'
  | 'bite' | 'emerge' | 'dragged'
  | 'shards' | 'rings' | 'raise' | 'fire' | 'blink' | 'rise'
  | 'miniFire' | 'miniRaise'
  // ACT 1, THE DESCENT (game/act1/): each kind's own, by its name: 'qgolem:smash', 'queen:dive'
  | `${string}:${string}`;

/**
 * THE FIRST FIVE FLOORS (game/bosses.ts): WHAT A BOSS LEAVES ON THE FLOOR OR SENDS OUT ACROSS IT that
 * goes on by itself, whatever he does next: the crack his chop leaves, the burning split of his sentence,
 * arms of the dead bursting up, skulls and shards in flight, a ring of hands, a scorch. (What is his
 * while he makes an act, the line a blow will fall on, an axe in flight, is drawn from the act itself.)
 */
/** ('slam': THE HEADSMAN MADE NEW, his vault's slam on the floor, game/bosses.ts HEADSMAN2_FIGHT.) */
export type PerilKind = 'crack' | 'split' | 'crash' | 'left' | 'arm' | 'skull' | 'shard' | 'wave' | 'ring' | 'scorch' | 'act1' | 'slam';
export interface Peril {
  kind: PerilKind;
  /** Where (tiles), and the way it lies or flies. */
  x: number;
  y: number;
  fx: number;
  fy: number;
  /** Its clock (seconds: below 0, not yet begun), the moment its blow lands (if it has one), and when it is gone. */
  t: number;
  hit: number;
  dur: number;
  /** What its blow does (the hurt before armour), and whose it was. */
  dmg: number;
  el: Element;
  words: WordId[];
  half?: HalfWords;
  from: string;
  /** How many of its blows have landed (a split's ticks; 1 once a skull or a shard has burst). */
  done: number;
  /** Numbers of its own, by kind (BossRules says which). */
  a: number;
  b: number;
  c: number;
  d: number;
  hand: 1 | -1;
  /** ACT 1 (kind 'act1'): whose and which, by name ('qgolem:chunk'): game/act1/ steps it, render/act1_fx/ draws it. */
  a1?: string;
}

/** THE FIRST FIVE FLOORS: a cultist's body where it fell (the mini fleshmancer raises the dead out of them: game/bosses.ts). */
export interface Corpse {
  x: number;
  y: number;
  /** Seconds it has lain. */
  t: number;
  /** It is being raised out of: gone when that is done. */
  taken?: boolean;
}

/**
 * A trap on the floor: the ranger's roll leaves one where it began (Version 12.2; until then the
 * bow's slow attack tossed it). It goes off when a monster steps on it.
 */
export interface Trap {
  x: number;
  y: number;
  /** Seconds until armed. */
  arm: number;
  life: number;
  skill: number;
  frac: number;
  element: Element;
}

/**
 * A volley (the bow's slow attack, Version 12.2; the owner: "the ranger fires a bunch of arrows
 * straight up, then they rain down into the targeted area for a duration"). Arrows come down one
 * after another, here and there inside its patch of ground, and each hurts what stands where it
 * lands.
 */
export interface Volley {
  id: number;
  x: number;
  y: number;
  /** The patch of ground it rains on. */
  r: number;
  /** Seconds since the first arrow came down: below zero, they are all still in the air. */
  t: number;
  /** Arrows down so far, and how many there are to come down in all. */
  n: number;
  total: number;
  /** Arrows the effects have been told are on their way down (a moment before each lands). */
  told: number;
  /** When (in `t`) the next comes down. */
  next: number;
  /** Which ability loosed it, the share of that ability's damage each arrow deals, and how many arrows come down together (Twin: two). */
  skill: number;
  frac: number;
  count: number;
  element: Element;
  /** The weaker repeat that "of Echoes" leaves. */
  echo: boolean;
  /** True until what the words behind it leave has been left (once, as the first arrow lands). */
  wake: boolean;
  /** THE SKILL TREES REMADE (Hail): the enemy it follows, by id; and where each arrow told of comes down (`n * count + c`), as it was told while the rain moved. */
  follow?: number;
  at?: { x: number; y: number }[];
}

/**
 * The orb of the staff's quick attack (Version 12; the owner: "a large stationary ball that pulses
 * waves of damage"). It stays where it was set and sends out a wave every so often until its time
 * is up. One at a time: setting a new one takes the old one away.
 */
export interface OrbInst {
  id: number;
  x: number;
  y: number;
  /** Seconds since it was set, and the seconds it stays. */
  t: number;
  life: number;
  /** Seconds until its next wave. */
  next: number;
  /** Waves sent so far (the first as it lands). */
  waves: number;
  /** Which ability set it, and the share of that ability's damage each of its waves deals. */
  skill: number;
  frac: number;
  element: Element;
}

/**
 * A familiar, the mage's slow attack (the owner: "a small energy sprite for a few seconds that
 * shoots small projectiles"). It keeps a place beside the hero and shoots at the nearest enemy
 * that is awake and in its sight.
 */
export interface Familiar {
  id: number;
  x: number;
  y: number;
  /** Seconds since it was called, and the seconds it stays. */
  t: number;
  life: number;
  /** Seconds until its next bolt. */
  next: number;
  /** Which place round the hero it keeps (0, 1, 2). */
  seat: number;
  /** Which ability called it, and the share of that ability's damage each of its bolts deals. */
  skill: number;
  frac: number;
  element: Element;
  /** The weaker copy that "of Echoes" calls a moment after the first. */
  echo: boolean;
  /** The way it last shot, and how long ago (its picture turns that way, and flares). */
  fx: number;
  fy: number;
  shotAge: number;
}

export interface Drop {
  x: number;
  y: number;
  /** (WORDMELDING: 'dust', runedust, as much as `gold` says; 'stone', the Meldstone) */
  kind: 'gold' | 'item' | 'word' | 'orb' | 'dust' | 'stone';
  gold: number;
  item: Item | null;
  word: WordId | null;
  age: number;
}

/**
 * Dungeon props, the way home from a dungeon, and the town's furniture and people (Version 14.4:
 * each of the town's people has a place of their own).
 *   the smithy     'armourer' with 'anvil', 'forge', 'rack', 'trough'
 *   the bazaar     'mystic' between 'tentBack' and 'tentTable', on a 'rug' (flat)
 *   the ring       'wordsmith' at a 'runeSlab', among 'runeStone's, on a 'runeRing' (flat)
 *   'stranger'     the shady man, against the wall in the dark corner
 *   'lexicon', 'stash'
 */
export type PropType =
  | PropKind
  /** THE FIRST FIVE FLOORS: one of a floor's own pieces, by its name (game/first5.ts). */
  | 'piece'
  | 'portal'
  | 'body'
  | 'lexicon'
  | 'stash'
  | 'armourer'
  | 'anvil'
  | 'forge'
  | 'rack'
  | 'trough'
  | 'mystic'
  | 'tentBack'
  | 'tentTable'
  | 'rug'
  | 'wordsmith'
  | 'runeSlab'
  | 'runeStone'
  | 'runeRing'
  | 'stranger';

/** The town's two vendors (the owner, 4 Oct 2026: "two different vendors, one selling martial equipment, the other selling magical equipment"). */
export type VendorId = 'armourer' | 'mystic';

/**
 * The places in town where something can be done. ('stranger': the shady man's gamble, since
 * Version 14.5. Until then he only stood in his corner.)
 */
export type Station = 'gate' | 'wordsmith' | VendorId | 'lexicon' | 'stash' | 'stranger';

/** The town's people who speak: each has a few lines of their own (defs.ts, TAGS) and a voice (engine/audio.ts). */
export type TownVoice = 'armourer' | 'mystic' | 'wordsmith' | 'stranger';

export interface StationSpot {
  kind: Station;
  /** World position the hero must stand near. */
  x: number;
  y: number;
}

/**
 * What the first dungeon is showing the player just now (see Game.guideStep):
 *
 *   move    how to walk
 *   fight   the attacks, and (after a couple of blows) the dodge, and (when life is low) the flask
 *   body    someone has fallen here: search them
 *   take    a word lies on the floor
 *   smith   a word is in the pouch: put it on an attack
 *   use     the word is on: use that attack (the dead rise for it)
 */
/** (THE FIRST LEVELS add 'carry', the quest item to be taken to town, and 'ring', to the wordsmith with it.) */
export type GuideStep = 'move' | 'fight' | 'body' | 'take' | 'carry' | 'ring' | 'smith' | 'use';

/** One line of the fight prompt: a thing to do, and whether it has been done. */
export interface GuideRow {
  id: 'quick' | 'slow' | 'evade' | 'flask';
  done: boolean;
}

/** How far a new player has got with the first dungeon's prompts. */
export interface Guide {
  /** Tiles walked so far. */
  walked: number;
  /** The first monsters have been met. */
  met: boolean;
  /** Blows taken so far (a couple, and the dodge is pointed out). */
  hits: number;
  /** Life has been low once (the flask is pointed out). */
  low: boolean;
  /** Done at least once: the quick attack, the slow one, the evasive move, a drink from the flask. */
  quick: boolean;
  slow: boolean;
  evade: boolean;
  flask: boolean;
  /** The first word has been set: into which attack, and how often that attack had been used by then. */
  set: { skill: number; uses: number } | null;
  /** The dead have risen for it. */
  risen: boolean;
  /** Seconds since the attack with the word was first used with nothing left to fight (the guide ends a moment later). */
  doneT: number;
}

/** One exact socket: which ability, which side of it, which place on that side. */
export interface SlotRef {
  skill: number;
  side: 'front' | 'behind';
  idx: number;
}

/** What has been learned about one word: that it exists, and each use it has been put to. */
export interface WordLore {
  found: boolean;
  /** Set into an attack, in front and behind. */
  front: boolean;
  behind: boolean;
  /** Burned into a piece of gear. */
  gear: boolean;
  /** Burned into a dungeon at the gate. */
  dungeon: boolean;
}

/** What outlasts a character: the Lexicon (what is known of each word, and the words kept there) and the stash's gear. */
export interface Meta {
  /** Spare words kept in the Lexicon for a later character. Keeping one costs gold. */
  lexicon: Record<WordId, number>;
  /** The Lexicon's pages: what has been found, and what each word has been used for. */
  known: Record<WordId, WordLore>;
  stash: (Item | null)[];
  deaths: number;
  /** Deepest dungeon any character has cleared. */
  bestDepth: number;
  /** ENDLESS MODE (game/endless.ts): the deepest endless level any character has cleared (absent: none). */
  bestEndless?: number;
  /** The first dungeon's prompts have been seen through on this device: new characters begin in town. */
  taught: boolean;
  /** How the slow abilities are limited: by a cooldown, or by mana. */
  limit: Limit;
  /** The voice last chosen on the class cards: the next character speaks with it unless it is changed there. */
  voice: VoiceId;
  /** Touch: where attacks go (see AimMode). */
  aim: AimMode;
  /**
   * The player has used the ATTACKS switch on this device. Until they have, `aim` is whatever the
   * game starts out with (auto aim, since Version 12.2.1: before it, where the thumb lands, and
   * every device that had saved anything held that without having chosen it).
   */
  aimChosen: boolean;
  /** The mode last picked on the class cards (game/modes.ts): the next hero is made in it unless it is changed there. */
  mode: HeroMode;
  /** THE FIRST LEVELS: the wordsmith's ring has been lit on this device (a hero has brought him the quest item). */
  ring: boolean;
  /** WORDMELDING (game/melds.ts): the Meldstone has been brought to the wordsmith on this device, so every hero after can meld (absent while MELD is off). */
  meld?: boolean;
}

/**
 * Touch only: where the right thumb's attacks go.
 *   'tap'   at what the thumb lands on, with aim help (how the game began, and its default until
 *           Version 12.2.1). Since Version 11.1 a blow
 *           struck beside the hero (the sword, the slam) finds its own enemy among those near,
 *           as the orb always found one wherever the thumb landed.
 *   'face'  the way the hero is facing, and in a fight at the enemy the hero is locked onto. The
 *           owner asked to try it on 4 Oct 2026 ("attacking the direction the character is
 *           facing, not where you tap ... lock onto enemies so you can run backwards and
 *           attack"), and an hour later, having played the mage: "Just give the same targeting
 *           that the mage has to the melee attacks as well. The ranged combat feels really good
 *           even in the current controls." So it is built, and switched off: OPTIONS turns it on.
 *   'auto'  at an enemy the game picks, wherever the thumb lands (Version 12.1.1). The owner,
 *           4 Oct 2026, 21:10: "Can you add a third option to the attacks: option which will auto
 *           aim everything. So any ability that goes where you tap or hold will auto target an
 *           enemy". The hero walks and turns freely; a tap or a hold goes for the nearest enemy
 *           that is awake and in sight (game/lock.ts: autoTargets), and a ring marks it.
 *           THE DEFAULT since Version 12.2.1 (the owner, 4 Oct 2026, 22:26, having played it:
 *           "When playing on mobile, let's put auto-aim as the default setting").
 * A mouse always aims with its pointer.
 */
export type AimMode = 'face' | 'tap' | 'auto';
/** In the order the switch in OPTIONS goes through them: the way the game starts out first. */
export const AIM_MODES: readonly AimMode[] = ['auto', 'tap', 'face'];

export interface PropInst {
  kind: PropType;
  /** Tile it stands on. */
  tx: number;
  ty: number;
  /** World position (the tile centre). */
  x: number;
  y: number;
  solid: boolean;
  /** Chest: 1 = opened. Barrel / urn: 1 = broken. Portal: 1 = active. */
  state: number;
  variant: number;
  /** THE FIRST FIVE FLOORS: a floor's own piece's name (kind 'piece': game/first5.ts). */
  name?: string;
}

export interface Level {
  town: boolean;
  floor: Floor;
  /** 1 where the hero and monsters can walk (floor without solid props). */
  walk: Uint8Array;
  /** 1 where there is floor or a pit (ignores props): used for sight and projectiles, and by whatever flies. */
  open: Uint8Array;
  /**
   * Ledges and stairs (height.ts): for every tile, the side steps a body may take from it by the
   * rules of height. null on a level that is all of one height and has no pit: nothing is asked.
   */
  step: Uint8Array | null;
  /** 1 where a wall tile is drawn cut down low because floor lies behind it. */
  low: Uint8Array;
  explored: Uint8Array;
  visible: Uint8Array;
  props: PropInst[];
  portal: PropInst | null;
  /** A character's first dungeon: the fallen wordsmith whose satchel holds their first word. */
  body: PropInst | null;
  /** Town only: where the services are. */
  stations: StationSpot[];
  /** DOORS AND GATES (game/doors.ts): what stands in the level's doorways, and how far open each is. None unless the map-maker laid them. */
  doors: DoorInst[];
  /** (and where the stone on either side of a door stands, 1 in the grid: null on a level with no doors. For the rule that it holds a big body off no further than a small one: game.ts, `free`.) */
  pier: Uint8Array | null;
  /** (and where a door is still shut, 1 in the grid; null on a level with no door. A shut door holds monsters, and its tile is shut in `open`: game/doors.ts, `shutGrid`.) */
  shut: Uint8Array | null;
  /** (THE TRAPS, game/traps.ts) The level's spike floors and dart walls, and where each is in its beat. None unless laid. */
  hazards: HazardInst[];
  /** (THE WAYS, game/ways.ts, behind WAYS) The stairwell down, the waypoint and the gate of the way; null where they are off. */
  ways: Ways | null;
  /** THE FIRST FIVE FLOORS: what the floor is laid with in its walls and its floor, and where its moments play (game/first5.ts); absent elsewhere. */
  dress?: Dress | null;
  /**
   * ACT 1, THE DESCENT (game/act1_layout.ts): a floor of open ground, not a dungeon's rooms: what only it
   * has (the drop, the river, the boardwalks, its strongholds), for the painter of its ground and its rules;
   * and what it is laid with (game/act1_dress.ts). Absent on every other level.
   */
  land?: Land;
  act1?: Act1Dress;
  /** ACT 1: the cult's strongholds on it, as they stand now (game/act1_holds.ts), each as Land.holds has it. */
  holds?: HoldState[];
  /** ACT 2, THE HUSH: its Bells as they stand now (game/bells.ts), where Land.bells laid them. */
  bells?: BellsState;
}

/** Things that happened this frame, for the renderer and the sound system. */
export type GameEvent =
  /**
   * `heavy`: a direct hit from an ability with Power in front (the effects give it weight).
   * `words`: the words in front of the ability, on its direct hits only, so each can leave its mark on the target.
   */
  | { t: 'hit'; x: number; y: number; amount: number; crit: boolean; el: Element; onHero: boolean; heavy?: boolean; words?: readonly WordId[]; poison?: boolean }
  /**
   * `words`: the words in front of the ability that made it, so each word can show itself.
   * `n`: 0 for the first cut, 1 for the second of a Twin pair. `echo`: this is the weaker repeat left by "of Echoes".
   */
  | { t: 'swing'; x: number; y: number; dx: number; dy: number; reach: number; el: Element; words?: readonly WordId[]; n?: number; echo?: boolean }
  /**
   * 'shock' is the knock of a Power hit on the enemies around its target; 'ruin' is a rune going off.
   * `words`, `n`, `echo` as for a swing.
   */
  | { t: 'burst'; x: number; y: number; r: number; el: Element; style: 'slam' | 'nova' | 'blast' | 'land' | 'warp' | 'shock' | 'ruin' | 'whirl'; words?: readonly WordId[]; n?: number; echo?: boolean; meld?: MeldId }
  /** An ability leaves the hero: where from, which way, the words in front of it and behind it. */
  | { t: 'cast'; x: number; y: number; dx: number; dy: number; kind: SkillKind; el: Element; words: readonly WordId[]; behind: readonly WordId[]; echo: boolean }
  /** A word was set into an ability: `name` is the ability's new name. */
  | { t: 'worded'; word: WordId; name: string; skill: number; side: 'front' | 'behind' }
  /** ACT 2, THE HUSH: the hero's words go dark (`on`), or come back (Game.hush). */
  | { t: 'hushed'; on: boolean }
  /**
   * ACT 2, THE BELLS (game/bells.ts): the Muffled Bell struck, the Hush pouring out of it ('start'); a bell rung, the `k`th of
   * `n` ('ring'); one of the Hush risen out of it ('rise'); all rung in time, the Hush shattering and the Muffled Bell bursting
   * ('won'); the clock run out, the Hush lifting ('lost').
   */
  | { t: 'bells'; what: 'start' | 'ring' | 'rise' | 'won' | 'lost'; x: number; y: number; k?: number; n?: number }
  /** A word was burned into a piece of gear, and this is what it became. */
  | { t: 'burned'; word: WordId; item: string; text: string }
  /** A word has dropped on the floor / has been picked up. */
  | { t: 'wordDrop'; word: WordId; x: number; y: number }
  | { t: 'wordGot'; word: WordId }
  /** The first dungeon's prompts moved on to this step ('done' = they are over). */
  | { t: 'guide'; step: GuideStep | 'done' }
  /** The fallen wordsmith has been searched. */
  | { t: 'search'; x: number; y: number }
  /**
   * THE FIRST LEVELS (defs.ts, FIRST_LEVELS): 'moveOpen', an ability has just opened with a level
   * (1 the slow attack, 2 the evasive move); 'quest', the quest item was taken from the satchel at
   * (x, y); 'ring', it was brought to the wordsmith, whose ring at (x, y) is lit now (the art
   * chat's animation is called up by it).
   */
  | { t: 'moveOpen'; skill: number }
  /** THE SKILL TREES (game/talents.ts): a talent taken. */
  | { t: 'talent'; id: string }
  | { t: 'quest'; x: number; y: number }
  | { t: 'ring'; x: number; y: number }
  /** An orb is set down at (x, y); its waves reach `r`. / The orb that was out is gone (its time was up, or a new one took its place). */
  | { t: 'wave'; x: number; y: number; dx: number; dy: number; w: number; el: Element; words: readonly WordId[]; echo: boolean }
  | { t: 'orbSet'; x: number; y: number; r: number; el: Element; words: readonly WordId[] }
  | { t: 'orbEnd'; x: number; y: number; el: Element }
  /**
   * A beam, from (x0, y0) to (x1, y1), `w` to either side. `words`, `behind`, `n`, `echo` as for a
   * swing. (The ghost line that comes before it is drawn from the hero's wind-up, by the renderer.)
   */
  | { t: 'beam'; x0: number; y0: number; x1: number; y1: number; w: number; el: Element; words: readonly WordId[]; behind: readonly WordId[]; n: number; echo: boolean }
  /** One bite of a beam that is being held (the beam itself is drawn from Hero.channel): where it ran, and how many it hurt. */
  | { t: 'beamBite'; x0: number; y0: number; x1: number; y1: number; w: number; el: Element; words: readonly WordId[]; n: number; hits: number; first: boolean }
  /** An attack that goes on while held has begun, or is over (`part`: how much of its full length it ran, 0 to 1). */
  | { t: 'channel'; kind: SkillKind; x: number; y: number; el: Element }
  | { t: 'channelEnd'; kind: SkillKind; x: number; y: number; el: Element; part: number }
  /** A familiar appears beside the hero / shoots / is gone. */
  | { t: 'familiar'; x: number; y: number; el: Element; echo: boolean }
  | { t: 'familiarShot'; x: number; y: number; dx: number; dy: number; el: Element }
  | { t: 'familiarEnd'; x: number; y: number; el: Element }
  /** A trap is laid on the floor. */
  | { t: 'trapSet'; x: number; y: number; el: Element }
  /**
   * A volley leaves the bow for the sky, to come down round (tx, ty) / one of its arrows comes down
   * at (x, y), hurting `hits` enemies / the last of it is down. `n` as for a swing (a Twin pair).
   */
  | { t: 'volleyUp'; x: number; y: number; tx: number; ty: number; r: number; el: Element; words: readonly WordId[]; echo: boolean }
  /** (said a moment ahead, so that the arrow can be seen coming down: it lands at (x, y) in `in` seconds) */
  | { t: 'volleyDrop'; x: number; y: number; el: Element; words: readonly WordId[]; n: number; echo: boolean; in: number }
  | { t: 'volleyFall'; x: number; y: number; el: Element; words: readonly WordId[]; n: number; echo: boolean; hits: number }
  | { t: 'volleyEnd'; x: number; y: number; el: Element }
  /** A monster takes its first dose of poison. */
  | { t: 'poisoned'; x: number; y: number }
  /**
   * `sky`: the bolt comes down from above onto (x1, y1) instead of jumping along the ground.
   * `meld` (WORDMELDING, for the looks only: render/melds3.ts): the melded word whose bolt it is (Thunder's one bolt,
   * Wildfire's, Hailstorm's and Contagion's arcs, the sparks and strikes of what they leave behind).
   */
  | { t: 'arc'; x0: number; y0: number; x1: number; y1: number; sky?: boolean; meld?: MeldId }
  /** What a word behind an ability gives the hero: "of Power" stacks might, "of Swiftness" gives haste. */
  | { t: 'buff'; kind: 'might' | 'haste'; x: number; y: number; stacks: number }
  /** "of Echoes": the ability will repeat from here in `delay` seconds. */
  | { t: 'echo'; x: number; y: number; dx: number; dy: number; kind: SkillKind; delay: number }
  /** A patch of ground or a rune has just been laid. (`dur`: cracks and wards, its seconds; laid again where one already is, it lasts that long from now.) */
  | { t: 'zone'; kind: 'burn' | 'ice' | 'storm' | 'venom' | 'rune' | 'cracks' | 'ward' | 'steam' | 'vortex' | 'hex' | 'bubble'; x: number; y: number; r: number; el: Element; dur?: number; meld?: MeldId }
  /**
   * THE NEW WORDS AT WORK (Version 19.3), for their looks (render/words3.ts): a Heavy hit lands
   * (`big`: an area ability's, out to `r`); monster `id` is stunned for `secs` / staggered by a blow
   * from (fromX, fromY) / marked by Precise for `secs` / struck on its mark (a certain critical,
   * from the way (dx, dy)).
   */
  | { t: 'heavy'; x: number; y: number; r: number; big: boolean }
  /**
   * WORDMELDING, for the looks only (render/melds3.ts): Avalanche in front shoves monster `id` from (x, y) to
   * (x1, y1), and `frozen` if it was stopped short and froze; Avalanche behind, a hit on a chilled one
   * at (x, y) crushes it harder (x1, y1 the same).
   */
  | { t: 'meldFx'; what: 'shove' | 'crush'; id: number; x: number; y: number; x1: number; y1: number; frozen?: boolean }
  | { t: 'stun'; id: number; x: number; y: number; secs: number; meld?: MeldId }
  | { t: 'stagger'; id: number; x: number; y: number; fromX: number; fromY: number }
  | { t: 'markOn'; id: number; x: number; y: number; secs: number }
  | { t: 'markSpent'; id: number; x: number; y: number; dx: number; dy: number }
  /**
   * THE CITY'S WORDS (Version 23.8), for the looks (render/words3.ts): PULLING drags in what is round (x, y), out to `r`; SPLITTING
   * breaks at (x, y), going (dx, dy), its copies flying to `to` (each landing in `secs`); its shards fly out of (x, y); HEXING's
   * curse comes down on monster `id`, or flares on it as a cursed one is struck; STILLING slows monster `id` for `secs`. On the
   * hero: a monster's Pulling drags him toward (fromX, fromY); its Hexing curses him, its Stilling slows his cooldowns, for `secs`.
   */
  | { t: 'pull'; x: number; y: number; r: number }
  | { t: 'split'; x: number; y: number; dx: number; dy: number; to: { x: number; y: number; secs: number }[]; fly?: boolean }
  | { t: 'shards'; x: number; y: number; r: number }
  | { t: 'hexOn'; id: number; x: number; y: number; secs: number }
  | { t: 'hexFlare'; id: number }
  | { t: 'stillOn'; id: number; x: number; y: number; secs: number }
  | { t: 'heroPulled'; x: number; y: number; fromX: number; fromY: number }
  | { t: 'heroHexed'; x: number; y: number; secs: number }
  | { t: 'heroStilled'; x: number; y: number; secs: number }
  // VOLATILE'S MELDS' own moments (behind VOLT_MELDS), for their looks (render/volatile3.ts VolFx, the art chat's): Demolition's
  // elite or boss going off at half its life; Powderkeg's blast setting one burning; Shatter's shard to one near and its rune's
  // freeze; Chain Reaction's arc to one near and its rune's link to the next; Rupture's poison splashed on one near
  | { t: 'volFx'; meld: MeldId; what: 'half'; id: number; x: number; y: number; r: number }
  | { t: 'volFx'; meld: MeldId; what: 'catch' | 'shard' | 'arc' | 'splash'; id: number; x0: number; y0: number; x1: number; y1: number }
  | { t: 'volFx'; meld: MeldId; what: 'freeze'; x: number; y: number; r: number; ids: readonly number[] }
  | { t: 'volFx'; meld: MeldId; what: 'link'; x0: number; y0: number; x1: number; y1: number }
  /**
   * Frenzied: a use adds a stack (`n` now held), going the way (dx, dy) / a kill feeds the frenzy,
   * from (x, y). Guarding: a use gives the hero a shield for `secs` / a blow from (fromX, fromY) is
   * turned by the shield or softened by a ward. A blow is blocked (the gear's chance to block).
   */
  | { t: 'frenzy'; x: number; y: number; dx: number; dy: number; n: number }
  | { t: 'frenzyFed'; x: number; y: number }
  | { t: 'shield'; x: number; y: number; secs: number }
  | { t: 'guarded'; x: number; y: number; fromX: number; fromY: number }
  | { t: 'blocked'; x: number; y: number; fromX: number; fromY: number }
  /** Life drawn out of a monster at (x, y) and into the hero. */
  | { t: 'leech'; x: number; y: number; n: number }
  /** "of Leeching" hits something: it is marked (it will leave a life orb if this ability kills it). */
  | { t: 'mark'; x: number; y: number }
  /** "of Leeching": a life orb torn out of a kill. */
  | { t: 'orb'; x: number; y: number }
  /** The hero is healed by something picked up. */
  | { t: 'heal'; amount: number }
  /** A monster catches fire / freezes solid / its ice breaks. */
  | { t: 'ignite'; x: number; y: number }
  | { t: 'freeze'; x: number; y: number }
  | { t: 'shatter'; x: number; y: number }
  /** A monster has been killed. (`fx`, `fy`: the way it was facing: its fall is played, and its body lies, that way round.) */
  | { t: 'die'; x: number; y: number; kind: MonsterKind; elite: boolean; champion: boolean; boss: boolean; fx: number; fy: number; form?: number; carry?: boolean; quiet?: boolean; lift?: number; away?: boolean }
  /** (THE FIRST FIVE FLOORS) a cultist's body is burned away as the dead are raised out of it; a bone beast is eaten back by its maker (no body is left of either) */
  | { t: 'gone'; x: number; y: number; what: 'corpse' | 'beast' }
  /** The hero has something to say about a big kill (see QUIPS). */
  | { t: 'quip'; text: string; boss: boolean }
  /** (BOSS_INTRO) the boss's gate has fallen: he says his line (or none) and his name comes up, for `secs` */
  | { t: 'bossIntro'; name: string; line: string | null; x: number; y: number; secs: number }
  /** (FLOOR_NAMES) the hero has come into a floor: its name, and its level under it */
  /** THE FIRST FIVE FLOORS: the stairwell has begun to break open, its middle here (its film is the renderer's to play: render/dress.ts). */
  | { t: 'stairOpens'; x: number; y: number }
  | { t: 'floorName'; name: string; level: string; warn?: string }
  /** One of the town's people has something to say as the hero walks up (see TAGS): who, what, and where they stand. */
  | { t: 'tag'; who: TownVoice; text: string; x: number; y: number }
  | { t: 'text'; x: number; y: number; text: string; color: string }
  | { t: 'spark'; x: number; y: number; el: Element; n: number }
  | { t: 'msg'; text: string; color: string }
  | { t: 'sfx'; name: Sfx; vol?: number }
  /** A door has begun to swing open ('open'); the boss's gate has fallen ('fall') or begun to rise ('rise'). At the middle of its doorway. */
  | { t: 'door'; x: number; y: number; kind: 'open' | 'fall' | 'rise' }
  | { t: 'shake'; amount: number }
  | { t: 'station'; kind: Station }
  /** ACT 1: the hero uses a stronghold's altar (game/act1_holds.ts): the interface opens it beside the inventory. */
  | { t: 'altar'; n: number }
  // (WORDMELDING: runedust taken up, `n` of it; the Meldstone taken up; the Meldstone given to the wordsmith, at (x, y):
  // for their pictures, art/meld_drops.ts, render/meld_drops.ts)
  | { t: 'dustGot'; x: number; y: number; n: number }
  | { t: 'stoneGot'; x: number; y: number }
  | { t: 'stoneGiven'; x: number; y: number }
  | { t: 'levelup' };

/** What the player is asking for this frame, already converted to world space. */
export interface Controls {
  /** Movement direction in world space, length 0..1. */
  mx: number;
  my: number;
  /** The world point being aimed at. */
  aimX: number;
  aimY: number;
  /** Single-target ability held. */
  fire: boolean;
  /** Walk into range first when the target is too far (set when the player clicked a monster). */
  approach: boolean;
  /**
   * Stay turned toward the aim point whichever way the hero walks (touch: the hero is locked onto
   * an enemy, and backs away from it without turning their back on it).
   */
  face: boolean;
  /** Area ability asked for, landing at (castX, castY). */
  cast: boolean;
  castX: number;
  castY: number;
  /**
   * The slow attack's button is down now (it need not have gone down this frame): what keeps an
   * attack that goes on while held going. (castX, castY) is where it points now.
   */
  hold: boolean;
  /** Evasive ability asked for, toward (evadeX, evadeY). */
  evade: boolean;
  evadeX: number;
  evadeY: number;
  potion: boolean;
  interact: boolean;
}

export function emptyControls(): Controls {
  return { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };
}
