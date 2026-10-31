// The rules of the game: one Game object holds a run (one character's life) and advances it
// frame by frame. It knows nothing about drawing or input; it reads Controls and emits GameEvents.

import type { Sfx } from '../engine/audio';
import { RNG } from '../engine/rng';
import { AIM, BIND, BOSS_LIFE, HUSH_FOR, CHARGE, LUNGE, CLASSES, LOOT2, COMBO, FIRST_DUNGEON, FIRST_LEVELS, BOSS_INTRO, BOSS_LINES, FIRST_WORD, FLOOR_NAMES, FRENZY, GAMBLE_KINDS, LEECH, floorTitle, GATE_TWIN_PACKS, packGrowth, wordGrowth, GUARD, GUIDE, HAND_IN, HEAVY, LIMITS, MANA_MODE, MONSTERS, MONSTER_PACKS, MOVE_OPENS, MSG, NEW_MONSTERS, PACKS, PRACTICE, LEVEL_SELECT, PRECISE, QUEST_ITEM, QUIPS, RALLY, SKILLS, SKULL, SMOKE, SPEAR, SUMMON, TAGS, TOWN_FOLK, TUNE, VENDORS, VENDOR_IDS, WORDS, firstWordSkill, leaderKind, movesOf, packKinds, packRarity, scaleDmg, scaleLife, skillsFor, socketCount, attackGrows, wordShare, xpToNext, wordsAt, PULL, SPLIT, HEX, STILL } from './defs';
import type { Limit, MonsterDef, MonsterMove, SkillId } from './defs';
import { canPair, imbueItem, imbueOptionsFor, imbueProblem, itemValue, kindName, migrateItem, modLines, plainValue, plainWeapon, reserveUids, rollItem, starterWeapon } from './items';
import type { ImbueOption, RollOpts } from './items';
import { ARENA, SHAPES, makeArena, makeDungeon, makeLedgeHall, makeMixHall, makeShapeRoom, makeStepHall, makeTown, makeTrapHall } from './level';
import type { Hall } from './level';
import { alongCut, bodyInWall, inWall } from './cut';
import { DOOR_HELP, GATE_INSIDE, LEVER_NEAR, LOCK_CLEAR, PIER_HOLD, doorMiddle, doorTiles, doorWay, insideBy, stepDoors } from './doors';
import type { DoorInst } from './doors';
import { DART, SPIKE, onHazard, slotMouth, spikeAt } from './traps';
import { HERO_MODES, MODES, MODE_BEFORE, NORMAL } from './modes';
import type { HeroMode } from './modes';
import { COMPANIONS, TALENTS, TALENTS2, TALENT_TUNE, cleanTalents, remadeNow, takeProblem, talentMods, talentPoints, unlearnProblem } from './talents';
import { COMPANION_GROUPS, COMPANION_GROUP_IDS, COMPANION_TUNE, cleanPicks, pickedIn } from './companions';
import type { CompanionGroup, CompanionKind } from './companions';
import type { HazardInst } from './traps';
import { LANE_HELP, STAIR_HELP, mayOverlap } from './height';
import { UNREACHABLE, flowDir, flowField, lineOfSight, scatter } from './nav';
import { armorReduction, derive } from './stats';
import { BOSSES5, BossRules, H2_GAIT, HEADSMAN2_FIGHT, blinkedAway, bossKind, gaitOf } from './bosses';
import { ACT1, act2Floor, lastFloor } from './act1';
import { ENDLESS, ENDLESS_OPENS, ENDLESS_WARN, endlessFloorFor, endlessName, endlessPower, endlessTough } from './endless';
import { ACT2_GUARD, act2Pack } from './act2_mobs';
import { BELLS_PACK_ID, BELLS_TOUGH_ID, BELLS_TUNE, BELL_STILL, chipAt, gapAt, inHush, makeBells, riseSpot, sizeAt } from './bells';
import type { BellsState } from './bells';
import { act1Rules, act1Ward } from './act1_rules/index';
import { PAIR, partnerOf } from './act1_rules/pair';
// (ACT 2, THE HUSH: a word the Physician has drawn out of the hero is never lost: given back as a level is left or the hero falls, and written into the save)
import { giveBackAll, inTheSave } from './act1_rules/physician';
import { blobDist } from './act1_layout';
import { ALTAR_GOES, HOLD_GUARDS, HOLD_GUARD_ID, HOLD_PACK, HOLD_PACK_ID, HOLD_TUNE, HOLD_WAVES, WAVE_MAKE } from './act1_holds';
import { act1Pack, act1Ready } from './act1_mobs';
import { HOLD } from './act1_dress';
import { AIM_MODES, emptyControls } from './state';
import { CAVE_OPENING, CURTAIN_SECS, EXITS, UNBAR_SECS, UNBAR_SEEN, GATE_FALL_AT, GATE_RISE_AT, SHAFT, STAIR_LONG, STAIR_OPENING, STAIR_WIDE, TOWN_ARRIVE, TOWN_GATE, WARP_SECS, WAYS, WAY_USE, WAY_WAKE, ONWARD, onTakes, onTopStep, stairFor, takesTiles, stairMiddle, stairTiles, thrownTiles, topStep } from './ways';
import type { StairWay } from './ways';
import { CAMP, makeCamp } from './camp';
import type { AimMode, BoundDemon, Channel, Contraption, Controls, Corpse, Drop, Familiar, GameEvent, Golem, Guide, GuideRow, GuideStep, HalfWords, HellWave, Hero, Level, Meta, Monster, OrbInst, Peril, Pet, Projectile, PropInst, Resolved, Riser, SkillState, SlotRef, Soul, Spear, Station, TownVoice, Trap, VendorId, Vial, Volley, WordLore, Zone } from './state';
import { ALL_CLASS_IDS, ALL_WORD_IDS, ATTRS, CLASS_IDS, EQUIP_SLOTS, MELD_IDS, RANK_IDS, RARITY_NAMES, VOLT_MELD_IDS, T_FLOOR, T_PIT, VOICE_IDS, WEAPONS, WORD_IDS } from './types';
import { MELD, MELD_DUST_COLOR, MELD_HAND_IN, MELD_TUNE, RANK2, STONE_RISE, VOLT_MELDS, isDamageWord, meldOf, meldProblem, rankBase, savedWords, withParts, wordIds } from './melds';
import type { Attr, ClassId, Element, EquipSlot, Item, MeldId, MonsterKind, RankId, Rarity, VoiceId, WeaponKind, WordId } from './types';
import { resolveSkill, socketProblem } from './words';
import { BRAWL_TUNE, COMBO_GAP, PUNCHES, newBrawl, punchFor } from './brawler';
import type { BrawlState, PunchName } from './brawler';
import { GOLEM_CANNON, TINKER_TUNE, golemBlow } from './tinkerer';
import type { Brew, Decoy, Tar } from './state';
import { DEMON_KIT, WARLOCK_TUNE } from './warlock';

const ELEMENT_WORDS: readonly WordId[] = ['fire', 'frost', 'lightning'];
/** Seconds before "of Echoes" repeats an ability. */
const ECHO_DELAY = 0.8;
/** A volley's arrows are announced to the effects this long before each lands, so that it is seen falling. */
const VOLLEY_SEEN = 0.3;
/** "of Echoes" behind an attack that is held: the phantom's beam or whirl bites this many times. */
const ECHO_BITES = 3;
/** While an attack is held the hero's picture stays this far past the moment of the blow. */
const CHANNEL_POSE = 0.05;
/** What the effects are told about a blast that the Volatile word made. */
const VOLATILE_ONLY: readonly WordId[] = ['volatile'];
/** The pack number of the dead that rise when a new player sets their first word. */
const RISEN_PACK = -7;

/** THE WAYS (ways.ts): where a way out of a level goes: down the stairwell; through the gate into the first floor, or out of it to town; by a waypoint to town, or back from town. */
type WayTo = 'down' | 'gateIn' | 'gateOut' | 'warpTown' | 'warpBack' | 'up' | 'on' | 'holdIn' | 'holdOut' | 'stairsIn' | 'quarry';

/**
 * What survives closing the game in the middle of a run: the character and how far they have got.
 * The dungeon itself is not kept; a restored run starts in town, facing the same dungeon.
 */
export interface RunSave {
  v: 1;
  cls: ClassId;
  seed: number;
  level: number;
  xp: number;
  pending: number;
  attrs: Record<Attr, number>;
  gear: Record<EquipSlot, Item | null>;
  bag: (Item | null)[];
  words: Record<WordId, number>;
  sockets: { front: (WordId | null)[]; behind: (WordId | null)[] }[];
  gold: number;
  potionKills: number;
  depth: number;
  cleared: number;
  kills: number;
  runTime: number;
  maxUid: number;
  /** Words laid on the gate for the next dungeon but not yet burned (absent in older saves). */
  plan?: WordId[];
  /** The fallen wordsmith of the first dungeon has been searched. */
  body?: boolean;
  /** EXITS: the wordsmith has given the quest for the master rune-stone (game/ways.ts). */
  asked?: boolean;
  /** The voice chosen for this character. */
  voice?: VoiceId;
  /** How far the first dungeon's prompts have got (absent once they are over). */
  guide?: Guide | null;
  /** Which of the wordsmith's words for sale on this visit have been bought (their places on his shelf; absent in older saves). */
  wordsBought?: number[];
  /** NORMAL OR HARDCORE (game/modes.ts), kept for life. Absent in a save from before there were modes (MODE_BEFORE), and while MODES.on is false. */
  mode?: HeroMode;
  /** THE FIRST LEVELS (defs.ts): the ring lit for this hero (absent in a save from before: lit), and the quest item carried. */
  ring?: boolean;
  quest?: 'heart' | null;
  /** THE SKILL TREES (game/talents.ts): the talents taken, in the order taken (absent when none). */
  talents?: string[];
  /** THE RANGER'S COMPANIONS (game/companions.ts): the animal picked for each of his companion talents (absent while COMPANIONS is off, or none picked). */
  pets?: Partial<Record<CompanionGroup, CompanionKind>>;
  /** WORDMELDING (game/melds.ts): the runedust carried, and melding at the wordsmith (absent while MELD is off). */
  dust?: number;
  meld?: 'stone' | 'open' | null;
  /** THE WAYS (game/ways.ts): the deepest floor whose waypoint the hero has reached (absent while WAYS is off). */
  way?: number;
  /** ENDLESS MODE (game/endless.ts): the endless level the hero has reached, and the floor it is (absent until it is open to him, and while ENDLESS is off). */
  endless?: number;
  endlessFloor?: number;
}

/** THE FIRST LEVELS: what the wordsmith says while his ring is dark. */
export const DARK_RING = 'The runes are dark';
/** THE FIRST LEVELS: what the gate says of a word laid on it before the first dungeon, which takes none. */
export const FIRST_GATE = 'Not in the first dungeon';

/** Nothing known of a word yet. */
function noLore(): WordLore {
  return { found: false, front: false, behind: false, gear: false, dungeon: false };
}

/** An empty Lexicon and stash: what a first-ever character starts with. */
export function newMeta(): Meta {
  const lexicon = {} as Record<WordId, number>;
  const known = {} as Record<WordId, WordLore>;
  for (const w of wordIds()) {
    lexicon[w] = 0;
    known[w] = noLore();
  }
  const stash: (Item | null)[] = [];
  for (let i = 0; i < TUNE.stashSize; i++) stash.push(null);
  return { lexicon, known, stash, deaths: 0, bestDepth: 0, taught: false, limit: 'cooldown', voice: 'male', aim: 'auto', aimChosen: false, mode: 'normal', ring: false };
}

/** A new player's place in the first dungeon's prompts. */
export function newGuide(): Guide {
  return { walked: 0, met: false, hits: 0, low: false, quick: false, slow: false, evade: false, flask: false, set: null, risen: false, doneT: -1 };
}

/** Make a loaded Meta safe to use whatever it contains (old versions, damaged saves). */
export function cleanMeta(m: Partial<Meta> | null | undefined): Meta {
  const out = newMeta();
  if (!m || typeof m !== 'object') return out;
  for (const w of wordIds()) {
    const n = m.lexicon ? m.lexicon[w] : 0;
    out.lexicon[w] = typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    const k = m.known ? m.known[w] : undefined;
    if (k && typeof k === 'object') {
      const lore = out.known[w];
      lore.front = k.front === true;
      lore.behind = k.behind === true;
      lore.gear = k.gear === true;
      lore.dungeon = k.dungeon === true;
      lore.found = k.found === true || lore.front || lore.behind || lore.gear || lore.dungeon;
    }
    // (a word kept in the Lexicon has plainly been found, whatever an older save says)
    if (out.lexicon[w] > 0) out.known[w].found = true;
  }
  // (gear put by before Version 12 may be of a kind that has gone, or marked as one class's own)
  if (Array.isArray(m.stash)) for (let i = 0; i < TUNE.stashSize; i++) out.stash[i] = m.stash[i] ? migrateItem(m.stash[i] as Item) : null;
  out.deaths = typeof m.deaths === 'number' && Number.isFinite(m.deaths) ? Math.max(0, Math.floor(m.deaths)) : 0;
  out.bestDepth = typeof m.bestDepth === 'number' && Number.isFinite(m.bestDepth) ? Math.max(0, Math.floor(m.bestDepth)) : 0;
  if (typeof m.bestEndless === 'number' && Number.isFinite(m.bestEndless) && m.bestEndless > 0) out.bestEndless = Math.floor(m.bestEndless);
  out.taught = m.taught === true;
  // (THE FIRST LEVELS: the ring is lit on a device the first time a hero brings the MASTER RUNE-STONE. A
  // device that saved before Version 19.5 has never had it lit: its next new hero goes for it, as
  // the owner saw in the pictures, and it stays lit for the heroes after. A hero saved before then
  // keeps his own ring, and his words, whatever the device's: see `restore`.)
  out.ring = m.ring === true;
  // (WORDMELDING: nothing of it is kept while MELD is off)
  if (MELD.on && m.meld === true) out.meld = true;
  out.limit = LIMITS.includes(m.limit as Limit) ? (m.limit as Limit) : 'cooldown';
  out.voice = VOICE_IDS.includes(m.voice as VoiceId) ? (m.voice as VoiceId) : 'male';
  out.mode = HERO_MODES.includes(m.mode as HeroMode) ? (m.mode as HeroMode) : 'normal';
  // Attacks are aimed for the player (auto aim) unless they have switched to another way, and
  // the switch leaves its mark (`aimChosen`). A device that saved before Version 12.2.1 has no
  // mark either way: it holds 'tap' whether that was chosen or not (it was the default, and is
  // written with everything else), so there an unmarked 'tap' counts as never chosen, while
  // 'face' or 'auto', which were never the default, were choices.
  const stored = AIM_MODES.includes(m.aim as AimMode) ? (m.aim as AimMode) : null;
  const marked = typeof m.aimChosen === 'boolean';
  out.aimChosen = stored !== null && (marked ? m.aimChosen === true : stored !== 'tap');
  out.aim = out.aimChosen && stored ? stored : 'auto';
  return out;
}

/** Which piece of the hero's gear something is done to: a worn piece or a bag slot. */
export type ItemRef = { kind: 'gear'; slot: EquipSlot } | { kind: 'bag'; i: number };

export class Game {
  readonly rng: RNG;
  readonly seed: number;
  hero: Hero;
  level!: Level;
  /** The dungeon the gate leads to next (or the one being fought through). */
  depth = 1;
  cleared = 0;
  inDungeon = false;
  /** Seconds since this level was entered. */
  time = 0;
  /** Seconds spent in dungeons this run. */
  runTime = 0;
  kills = 0;
  over = false;
  /** What dealt the killing blow, for the death screen. */
  slainBy = '';
  /** How this character sounds when they speak: chosen on the class cards, and kept with the character. */
  voice: VoiceId = 'male';
  /**
   * NORMAL OR HARDCORE (game/modes.ts): picked on the class cards, kept for life. A hero made any
   * other way (the playtests' runs, the practice room) is Hardcore, the game's old rule; and while
   * MODES.on is false nobody is anything else.
   */
  mode: HeroMode = 'hardcore';
  /**
   * The hero as they went into this dungeon (a save, `save()`, taken as they stepped in, after the
   * gate's words were burned): what a Normal death goes back to. Null in town before the first
   * dungeon, and in the practice room.
   */
  entry: RunSave | null = null;
  /** The hero's lines on big kills: the ones said so far, when the last was said, and dice of their own. */
  private quipSaid = new Set<string>();
  private quipAt = -1e9;
  private flair: RNG;
  monsters: Monster[] = [];
  projectiles: Projectile[] = [];
  zones: Zone[] = [];
  traps: Trap[] = [];
  volleys: Volley[] = [];
  /** THE MONSTERS' ATTACKS: the dead the Warden has called, still crawling out of the ground (game/defs.ts SUMMON). */
  risers: Riser[] = [];
  /** THE FIRST FIVE FLOORS (game/bosses.ts): what the bosses of floors 2 to 5 leave on the floor and send across it; the cult's bodies where they fell; and the rules of them all. */
  perils: Peril[] = [];
  corpses: Corpse[] = [];
  readonly bosses: BossRules = new BossRules(this);
  /** THE NEW MONSTERS (game/defs.ts SPEAR): the Bonewards' spears lying on the floor, each until its Boneward picks it up. */
  spears: Spear[] = [];
  /** The orb set down by the staff's quick attack (one at a time), and the mage's familiars. */
  orbs: OrbInst[] = [];
  familiars: Familiar[] = [];
  /**
   * THE TINKERER (game/tinkerer.ts): her Contraptions standing, her vials in the air, her Golems once whistled out (one; two
   * with her tree's Mark II, by their seats), the puddles her tree's Tar leaves.
   */
  contraptions: Contraption[] = [];
  vials: Vial[] = [];
  golems: Golem[] = [];
  /** THE RANGER'S COMPANIONS (game/companions.ts): his animals out, one for each companion talent taken (COMPANIONS). */
  pets: Pet[] = [];
  tars: Tar[] = [];
  /** Her first Golem, null until it is whistled out. */
  get golem(): Golem | null {
    return this.golems[0] ?? null;
  }
  /** (her tree's The Big One) her vials thrown since she took it; (Alchemy) one of her vials bursting this moment. */
  private vialsThrown = 0;
  private brewing = false;
  /** DECOYS (THE TINKERER's Lightning Rod): what the enemies near one go after in place of the hero (drawnToDecoy); and who is swinging at one. */
  decoys: Decoy[] = [];
  private decoySwings = new Set<number>();
  /** THE WARLOCK's tree (game/talents.ts): Hellwave's waves going on ahead, Damned Souls' souls in the air, the Bound Demon at his side. */
  hellwaves: HellWave[] = [];
  souls: Soul[] = [];
  bound: BoundDemon | null = null;
  /** (THE WARLOCK's tree: whose hit of his is being struck now: the Bound Demon's rake, a Hellwave's, a Hex Chain's leap, a Blazing Arm's burst.) */
  private warlockBy: null | 'bound' | 'wave' | 'chain' | 'blaze' = null;
  /** THE BRAWLER (game/brawler.ts): what his haymaker has launched, flying down the line (the monster's id, its way, how far it has left to go, whom it has bowled over). */
  cannonballs: { id: number; dx: number; dy: number; left: number; skill: number; frac: number; hit: number[] }[] = [];
  /** THE BRAWLER'S TREE (game/talents.ts BRAWLER_TREE): what his talents keep going. */
  brawl: BrawlState = newBrawl();
  drops: Drop[] = [];
  events: GameEvent[] = [];
  boss: Monster | null = null;
  /** Power words burned into the current dungeon: every monster in it carries them. */
  dungeonWords: WordId[] = [];
  /** Words laid on the gate for the next dungeon. They are burned (used up) on entering. */
  plan: WordId[] = [];
  /** What each of the town's two vendors offers on this visit to town. A piece that is bought leaves a gap. */
  shops: Record<VendorId, (Item | null)[]> = { armourer: [], mystic: [] };
  /** The vendor the hero is dealing with: the one whose shelf `shop` and `buy` mean. (Set when a vendor's screen is opened.) */
  vendor: VendorId = 'armourer';
  /**
   * What the hero has sold the vendor on this visit to town, oldest first: each can be had back
   * for what was paid for it (Version 14.3: a piece sold by a slip of the finger is not lost).
   */
  sold: Item[] = [];
  /**
   * The wordsmith's trade (Version 14.5): the words he has for sale on this visit to town (a gap
   * where one has been bought), and the words the hero has sold him on it, oldest first, each to
   * be had back for what he paid.
   */
  wordStock: (WordId | null)[] = [];
  wordsSold: WordId[] = [];
  /** The stranger's gamble: where in the bag the piece last won lies (-1: nothing won on this visit). The screen shows it to the player. */
  won = -1;
  /**
   * The town's people and their lines (TAGS): for each, the lines said so far, when the last was
   * said and whether the hero was near them at the last look; and when anybody last spoke.
   */
  private tagSaid = new Map<TownVoice, Set<string>>();
  private tagAt = new Map<TownVoice, number>();
  private tagNear = new Map<TownVoice, boolean>();
  private tagAllAt = -1e9;
  /** The Lexicon and the stash: they outlast this character. */
  meta: Meta;
  /** The practice room: every word to hand, monsters that keep coming, no death, nothing saved. */
  practice = false;
  /** THE LEVEL SELECT (defs.ts LEVEL_SELECT): a test hero, made ready for the floor he was sent to (Game.forTrial). Played as any hero is, but never saved: main.ts leaves the saved run as it was. */
  trial = false;
  private waveT = 0;
  private waveN = 0;
  /** The first dungeon's prompts, while a new player is being shown the game (see Guide in state.ts). */
  guide: Guide | null = null;
  /** The fallen wordsmith of this character's first dungeon has been searched. */
  bodySearched = false;
  /** EXITS (game/ways.ts): the wordsmith has given this hero the quest for the master rune-stone. */
  questGiven = false;
  /** EXITS: the barred gate has been spoken of on this visit to town. */
  private toldBarred = false;
  /** THE WAYS (ways.ts, behind WAYS): the deepest floor whose waypoint the hero has reached, the town's waypoint warping him back to its start (0: none yet). */
  wayDepth = 0;
  /**
   * ENDLESS MODE (game/endless.ts, behind ENDLESS): the endless level the hero has reached (0: not open to him yet; it opens
   * as he beats the last floor built), and the floor it is; and whether the floor he is on is it. On it `depth` is that floor
   * (all that is the floor's own is as it is there), its strength and finds `power` and `tough`.
   */
  endless = 0;
  endlessFloor = 0;
  inEndless = false;
  /**
   * ACT 2, THE HUSH: THE HUSH ON THE HERO (his doc, "New for the act": "a status that darkens your words for a few seconds. Your
   * attacks still land, without what the words add"; brought by the Crier's Silent Shout, the Physician's Tonic and the Censor):
   * how many seconds more his words are dark (0: not hushed). While it lasts every attack is as it would be with no word in it
   * (refresh); the words stay where they are. Laid on by `hush`.
   */
  hushT = 0;
  /** (BOSS_INTRO) how much longer the boss stands saying his line */
  introT = 0;
  /** (ACT 1) the stronghold whose door he is going through (game/act1_holds.ts), or -1. */
  holdGoing = -1;
  /** (BOSS_INTRO, ACT 1) out on the open ground there is no gate to fall behind the hero: whether he has come into the boss's ground on this level yet (his line said then). */
  bossMet = false;
  /** (BOSS_INTRO) when a blow at a waiting boss was last told of ("Not yet") */
  private waitTold = -1;
  /** (LEECH.cap) when the second Leech is counted in began, and what it has given back in it */
  private leechFrom = -1;
  private leechGiven = 0;
  /** THE WAYS: on his way out of this level (down the stairwell, through a gate, or by a waypoint), and how long since it began. Nothing he does meanwhile. */
  leaving: { to: WayTo; t: number } | null = null;
  /** THE WAYS: how long since he came into this level down a stairwell or through a gate (the screen lightens over CURTAIN_SECS). */
  cameT = 99;
  /**
   * A word just picked up that has somewhere to go. The interface offers the inventory for it at
   * the next quiet moment, and clears this when it has.
   */
  offer: WordId | null = null;

  /** The first word-carrier of a character's first dungeon has been pointed out. */
  private toldCarrier = false;
  /** The prompt last announced, so each is announced once. */
  private guideWas: GuideStep | null = null;
  private later: { t: number; fn: () => void }[] = [];
  private flow: Uint16Array = new Uint16Array(0);
  private flowT = 0;
  private visionT = 0;
  private dotT = 0;
  /** THE FIRST LEVELS: seconds the quest's line still shows at the top (QUEST_ITEM.promptSecs). */
  private questPromptT = 0;
  /** The word the wordsmith gives once his ring has powered up, and the seconds till then (QUEST_ITEM.ringSecs). */
  private ringWord: { word: WordId; t: number } | null = null;
  private nextId = 1;
  /** Ids for orbs and familiars (the pictures tell them apart by it). */
  private nextThing = 1;
  private bagFullT = 0;
  private denyT = 0;
  /** Precise behind: for each ability, the use (its count of uses) that has already marked an enemy. */
  private marked: number[] = [-1, -1, -1];
  /**
   * THE CITY'S WORDS (Version 23.8): the use of each ability whose first hit last broke into copies (Splitting in front); when
   * each last threw its shards and showed its pull (Splitting and Pulling: a whirlwind's turns are many); true while a copy or a
   * shard strikes (it breaks no further); the monster whose shot or warning is landing on the hero (a hex circle it stands in
   * weakens it).
   */
  private splitUse: number[] = [-1, -1, -1];
  private shardsAt: number[] = [-9, -9, -9];
  /** BINDING behind: when each ability last laid a snare (game/defs.ts BIND.every). */
  private snareAt: number[] = [-9, -9, -9];
  private pullShown: number[] = [-9, -9, -9];
  private copying = false;
  private blowBy: number | undefined = undefined;
  /**
   * THE SKILL TREES (game/talents.ts): seconds the hero has stood still (Steady Aim); seconds left
   * of Momentum's and Windrunner's speed; seconds to Stormcaller's next bolt; Unbreakable spent in
   * this dungeon; shots of the bow since the last split (Split Shot).
   */
  private stillT = 0;
  private footworkT = 0;
  /** THE SKILL TREES (Master Stroke): hits landed since the last certain critical. */
  private strokes = 0;
  /** WORDMELDING: each ability's heat (Eruption behind) and hits counted to the next thunderclap (Thunder behind). */
  /** WORDMELDING: each ability's heat (Eruption behind) and hits toward its thunderclap (Thunder behind); the looks read them (render/melds3.ts). */
  meldHeat: number[] = [0, 0, 0];
  meldHits: number[] = [0, 0, 0];
  /** WORDMELDING: the last word the wordsmith melded, and whether it was the first of its kind (his half shows it). */
  melded: { word: MeldId | RankId; first: boolean } | null = null;
  private windT = 0;
  private stormT = 0;
  private unbroken = false;
  private shots = 0;
  /** THE SKILL TREES REMADE (TALENTS2): Charged's charge (1: full), and its sparks' clock; arrows loosed toward Quick Draw's double. */
  private charge = 0;
  private sparkT = 0;
  private draws = 0;
  private visList: number[] = [];
  private tmp = { x: 0, y: 0 };

  constructor(cls: ClassId, seed: number, meta?: Meta) {
    this.seed = seed >>> 0;
    this.rng = new RNG(this.seed);
    // (a line said or not said must never change what happens next in the dungeon: it has its own dice)
    this.flair = new RNG((this.seed ^ 0x51ed270b) >>> 0);
    this.meta = meta ?? newMeta();
    this.voice = this.meta.voice;
    // gear already in the stash keeps its ids; anything made from now on must not reuse them
    for (const it of this.meta.stash) if (it) reserveUids(it.uid);
    this.hero = this.newHero(cls);
    this.refresh();
    this.hero.life = this.hero.d.maxLife;
    this.hero.mana = this.hero.d.maxMana;
    this.enterTown();
  }

  /**
   * A new player's first character: no town yet. They wake in the first dungeon, and it teaches
   * as they go (see the guide, below).
   */
  static forFirstRun(cls: ClassId, seed: number, meta?: Meta): Game {
    const g = new Game(cls, seed, meta);
    g.guide = newGuide();
    // (EXITS: a new game begins in town, a new player's too: the wordsmith gives the quest, and the stairs lead down)
    if (!(EXITS.on && WAYS.on)) g.enterDungeon();
    return g;
  }

  /**
   * THE TRY-OUT PAGE ONLY (main.ts): the practice room's seasoned hero taken straight to floor `n` of the
   * Crypt, as if the floors before it were cleared: no longer the practice room (its waves, its arena).
   */
  tryFloor(n: number): void {
    this.practice = false;
    this.depth = Math.max(1, Math.min(10, Math.floor(n)));
    this.cleared = this.depth - 1;
    this.wayDepth = this.depth;
    // (the practice room's lines are not true here: on a floor of the Crypt the hero can fall)
    this.events = this.events.filter((e) => e.t !== 'msg');
    this.enterDungeon();
    this.msg('Try-out. Every word is yours: open the INVENTORY.', MSG.word);
  }

  /**
   * THE LEVEL SELECT (defs.ts LEVEL_SELECT): a test hero of class `cls` made ready for floor `floor` and sent straight to it,
   * as if the floors before it were cleared. On floor 1, a new hero as any begins (nothing to make ready). From floor 2: the
   * level a hero comes there at (LEVEL_SELECT.level), the points of those levels spent (two of every three on his class's own
   * attribute), the wordsmith's ring lit, a full set of magic gear of the floor's item level, and in the pouch every word that
   * can be found down to that floor, with the melds, as many of each as the practice room gives. Played as any hero is, a
   * Normal one (he can fall, and wakes in town); never saved (main.ts). `meta`: the device's choices (limit, voice) are taken from it,
   * nothing else: the run has a Lexicon and stash of its own.
   */
  static forTrial(cls: ClassId, seed: number, floor: number, meta?: Meta): Game {
    const own = newMeta();
    if (meta) {
      own.limit = meta.limit;
      own.voice = meta.voice;
      own.aim = meta.aim;
      own.aimChosen = meta.aimChosen;
    }
    const g = new Game(cls, seed, own);
    g.trial = true;
    // (Normal: he falls and wakes in town, as a hero does; so as he was told, 22 Oct 2026, with the pictures)
    if (MODES.on) g.mode = 'normal';
    g.readyFor(floor);
    return g;
  }

  /** The floors the level select offers: the first to the last built. */
  static trialFloors(): number {
    return lastFloor();
  }

  private readyFor(floor: number): void {
    const h = this.hero;
    const d = Math.max(1, Math.min(lastFloor(), Math.floor(floor)));
    if (d >= 2) {
      const level = LEVEL_SELECT.level[d - 1] ?? LEVEL_SELECT.level[LEVEL_SELECT.level.length - 1];
      h.level = level;
      h.xp = 0;
      h.pending = 0;
      const primary = CLASSES[h.cls].primary;
      const others = ATTRS.filter((a) => a !== primary);
      let other = 0;
      for (let k = 0; k < level - 1; k++) {
        const a = k % 3 < LEVEL_SELECT.ownOfThree ? primary : others[other++ % others.length];
        h.attrs[a] += TUNE.attrPerLevel;
      }
      h.ring = true;
      this.refresh();
      // a full set of magic gear of the floor's item level (as much as his level lets him wear): the weapon first (the kind his class starts with), so the off hand suits it
      const ilvl = Math.min(d, level);
      const rng = new RNG((this.seed ^ 0x6a09e667) >>> 0);
      const kind = CLASSES[h.cls].starts;
      for (const slot of EQUIP_SLOTS) {
        for (let k = 0; k < 24; k++) {
          const it = rollItem(ilvl, rng, { slot: slot === 'ring1' || slot === 'ring2' ? 'ring' : slot, rarity: 1, forWeapon: kind });
          if (this.useProblem(it) !== null) continue;
          if (slot === 'mainhand' && it.weapon !== kind) continue;
          if (slot === 'offhand' && !canPair(h.gear.mainhand, it)) continue;
          h.gear[slot] = it;
          break;
        }
      }
      for (const w of wordsAt(d)) h.words[w] = PRACTICE.words;
      if (MELD.on) for (const w of MELD_IDS) h.words[w] = PRACTICE.words;
      if (MELD.on && VOLT_MELDS.on) for (const w of VOLT_MELD_IDS) h.words[w] = PRACTICE.words;
      if (MELD.on && RANK2.on) for (const w of RANK_IDS) h.words[w] = PRACTICE.words;
      this.refresh();
      h.life = h.d.maxLife;
      h.mana = h.d.maxMana;
    }
    this.depth = d;
    this.cleared = d - 1;
    this.wayDepth = d;
    this.enterDungeon();
    this.msg(d >= 2 ? `Test hero, level ${h.level}. Not saved. Your words are in the INVENTORY.` : 'Test hero. Not saved.', MSG.word);
  }

  // ===========================================================================================
  // The practice room

  /** A throwaway character for trying power words: seasoned, geared, with every word in the pouch. */
  static forPractice(cls: ClassId, seed: number, hall: Hall = 'arena'): Game {
    const g = new Game(cls, seed, newMeta());
    g.beginPractice(hall);
    return g;
  }

  /** `hall`: the plain practice room, or the hall with a terrace, stairs, a pit and a gap (level.ts, makeLedgeHall). */
  private beginPractice(hall: Hall = 'arena'): void {
    const h = this.hero;
    this.practice = true;
    this.offer = null;
    this.depth = PRACTICE.depth;
    // the level at which both attacks have two sockets in front and two behind
    h.level = PRACTICE.level;
    h.pending = 0;
    // (THE FIRST LEVELS: a seasoned throwaway has the wordsmith's ring lit, as any hero has who has been down before)
    h.ring = true;
    const primary = CLASSES[h.cls].primary;
    for (const a of ATTRS) h.attrs[a] += a === primary ? 15 : 3;
    const rng = new RNG((this.seed ^ 0x9e3779b9) >>> 0);
    // a full set of magic gear: the weapon first (the kind the class starts with), so the off hand suits it
    const own = CLASSES[h.cls].starts;
    for (const slot of EQUIP_SLOTS) {
      for (let k = 0; k < 24; k++) {
        const it = rollItem(PRACTICE.ilvl, rng, { slot: slot === 'ring1' || slot === 'ring2' ? 'ring' : slot, rarity: 1, forWeapon: own });
        if (this.useProblem(it) !== null) continue;
        if (slot === 'mainhand' && it.weapon !== own) continue;
        if (slot === 'offhand' && !canPair(h.gear.mainhand, it)) continue;
        h.gear[slot] = it;
        break;
      }
    }
    // and one of every other weapon in the bag: any character can use any of them, and each
    // brings its own quick attack (a one-handed one comes with the piece for the other hand)
    let spot = 0;
    const stow = (it: Item): void => {
      if (spot < h.bag.length) h.bag[spot++] = it;
    };
    for (const kind of WEAPONS) {
      if (kind === own) continue;
      let weapon: Item | null = null;
      for (let k = 0; k < 40 && !weapon; k++) {
        const it = rollItem(PRACTICE.ilvl, rng, { slot: 'mainhand', rarity: 1, forWeapon: kind });
        if (it.weapon === kind) weapon = it;
      }
      weapon = weapon ?? plainWeapon(kind, PRACTICE.ilvl);
      stow(weapon);
      for (let k = 0; k < 40; k++) {
        const it = rollItem(PRACTICE.ilvl, rng, { slot: 'offhand', rarity: 1, forWeapon: kind });
        if (!canPair(weapon, it)) continue;
        stow(it);
        break;
      }
    }
    for (const w of WORD_IDS) h.words[w] = PRACTICE.words;
    // (WORDMELDING: the melded words too, to try)
    if (MELD.on) for (const w of MELD_IDS) h.words[w] = PRACTICE.words;
    // (VOLATILE'S MELDS, behind VOLT_MELDS)
    if (MELD.on && VOLT_MELDS.on) for (const w of VOLT_MELD_IDS) h.words[w] = PRACTICE.words;
    // (RANK II: and the ranked words)
    if (MELD.on && RANK2.on) for (const w of RANK_IDS) h.words[w] = PRACTICE.words;
    this.refresh();
    this.clearLevel();
    const shape = SHAPES.find((k) => hall === `shape:${k}`);
    this.level = shape ? makeShapeRoom(shape, this.seed) : hall === 'ledges' ? makeLedgeHall(this.seed) : hall === 'steps' ? makeStepHall(this.seed) : hall === 'mix' ? makeMixHall(this.seed) : hall === 'traps' ? makeTrapHall(this.seed) : makeArena(this.seed);
    this.inDungeon = true;
    this.dungeonWords = [];
    const f = this.level.floor;
    h.x = f.start.x;
    h.y = f.start.y;
    h.life = h.d.maxLife;
    h.mana = h.d.maxMana;
    this.flow = new Uint16Array(f.w * f.h);
    this.updateVision(1);
    this.waveT = 1.2;
    this.msg('Nothing here can kill you, and nothing is saved.', MSG.plain);
    this.msg('Practice room. Every word is yours: open the INVENTORY.', MSG.word);
  }

  /** Keep the room stocked: when few monsters are left, another pack walks in from across the hall. */
  private updatePractice(dt: number): void {
    const h = this.hero;
    this.waveT -= dt;
    let alive = 0;
    for (const m of this.monsters) if (!m.dead) alive++;
    if (alive <= PRACTICE.refillAt && this.waveT <= 0) {
      this.spawnWave();
      this.waveT = 2.5;
    }
    // mana comes back fast, so the slow ability can be tried again and again
    h.mana = Math.min(h.d.maxMana, h.mana + h.d.maxMana * 0.25 * dt);
  }

  private spawnWave(): void {
    const f = this.level.floor;
    const rng = this.rng;
    const h = this.hero;
    let cx = ARENA.start.x;
    let cy = ARENA.start.y;
    for (let k = 0; k < 40; k++) {
      cx = rng.range(ARENA.x0 + 2, ARENA.x1 - 1);
      cy = rng.range(ARENA.y0 + 2, ARENA.y1 - 1);
      const d = Math.hypot(cx - h.x, cy - h.y);
      if (d > 6.5 && d < 11 && this.isOpen(cx, cy)) break;
    }
    const n = this.waveN++;
    const kinds: MonsterKind[] = ['skeleton', 'skeleton', 'skeleton', 'archer', 'cultist', 'bat'];
    const spots = scatter(this.level.walk, f.w, f.h, cx, cy, PRACTICE.packSize, rng);
    spots.forEach((s, i) => {
      // every third pack is led by a brute, every other one by an elite carrying a word
      const brute = n % 3 === 2 && i === 0;
      const elite = n % 2 === 1 && i === 0 && !brute;
      const m = this.spawn(brute ? 'brute' : rng.pick(kinds), s.x, s.y, 1000 + n, elite ? 1 : 0, false, rng);
      m.xp = 0;
      this.wakeUp(m);
    });
  }

  // ===========================================================================================
  // The guide: the first dungeon teaches as it goes
  //
  // The owner's order: "a fresh game should start with a prompt on how to move. then as you
  // approach the first mobs you get a prompt 'tap to ..., tap+hold to ...'. when you take a couple
  // hits, it should prompt you with 'swipe to ...' and indicate the dodge function. halfway
  // through the first dungeon in a scripted event, maybe a lootable corpse with a guaranteed drop,
  // or once you drop a word of power from a rare mob, you get the prompt to socket the word."
  // And: "i need the word+skill interaction in the tutorial a big focal point."
  //
  // The rules keep what has been done (Guide) and say which prompt is due (guideStep); the
  // interface says it (ui/guide.ts, ui/hud.ts, ui/inventory.ts). Nothing waits on the player: the
  // dungeon is a real one, and a prompt is only ever a line on the screen.

  /** Is there a fight on: something awake within reach of the hero? (What is shut in a room behind its door is not within reach, awake or not: `shutIn`.) */
  inFight(): boolean {
    const h = this.hero;
    for (const m of this.monsters) if (!m.dead && m.state !== 'sleep' && Math.hypot(m.x - h.x, m.y - h.y) < GUIDE.near && !this.shutIn(m)) return true;
    return false;
  }

  /** The lines of the fight prompt that are showing, and which of them have been done. */
  guideRows(): GuideRow[] {
    const G = this.guide;
    if (!G || !G.met) return [];
    // (THE FIRST LEVELS: only the moves that are open, each as it opens; the swipe with its level, not after a couple of blows)
    if (FIRST_LEVELS.on) {
      const open: GuideRow[] = [{ id: 'quick', done: G.quick }];
      if (this.moveOpen(1)) open.push({ id: 'slow', done: G.slow });
      if (this.moveOpen(2)) open.push({ id: 'evade', done: G.evade });
      if (G.low) open.push({ id: 'flask', done: G.flask });
      return open;
    }
    const rows: GuideRow[] = [{ id: 'quick', done: G.quick }, { id: 'slow', done: G.slow }];
    if (G.hits >= GUIDE.hits) rows.push({ id: 'evade', done: G.evade });
    if (G.low) rows.push({ id: 'flask', done: G.flask });
    return rows;
  }

  /** Which prompt is due now, or null for none. */
  guideStep(): GuideStep | null {
    const G = this.guide;
    if (!G || this.over) return null;
    const h = this.hero;
    const L = this.level;
    // (the word is only lent to its attack: if the player has taken it out again, there is nothing to try yet)
    const worded = G.set ? h.skills[G.set.skill] : null;
    if (worded && (worded.front.some((w) => w !== null) || worded.behind.some((w) => w !== null))) return 'use';
    const fight = this.inFight();
    if (fight && this.guideRows().some((r) => !r.done)) return 'fight';
    if (wordIds().some((w) => h.words[w] > 0)) return 'smith';
    if (this.drops.some((d) => d.kind === 'word' && Math.hypot(d.x - h.x, d.y - h.y) < GUIDE.sight)) return 'take';
    if (fight) return null;
    // (THE FIRST LEVELS: the quest item, to be taken to town and to the wordsmith)
    // (for a few seconds on finding it and on reaching town with it, then not: QUEST_ITEM.promptSecs)
    if (FIRST_LEVELS.on && h.quest) return this.questPromptT > 0 ? (L.town ? 'ring' : 'carry') : null;
    // (EXITS: a new game begins in town: first walking, then the wordsmith's quest, then the stairs down)
    if (EXITS.on && L.town && FIRST_LEVELS.on && !h.ring) return G.walked < GUIDE.steps ? 'move' : this.questGiven ? 'stairs' : 'quest';
    const b = L.body;
    if (b && b.state === 0 && Math.hypot(b.x - h.x, b.y - h.y) < GUIDE.sight && L.visible[b.ty * L.floor.w + b.tx] === 1) return 'body';
    if (G.walked < GUIDE.steps) return 'move';
    return null;
  }

  /** The average hit of the character's quick attack with no word on it: what the guide's soft monsters are measured against. */
  private bareHit(): number {
    const h = this.hero;
    const r = resolveSkill(SKILLS[h.skills[0].id], [], [], attackGrows(h.cls, this.weapon()), h.d, this.meta.limit);
    const st = h.d.stats;
    return ((h.d.dmgMin + h.d.dmgMax) / 2) * r.dmgMult * (1 + (st.dmgPct + st.physPct) / 100);
  }

  private updateGuide(dt: number, moved: number): void {
    const G = this.guide;
    if (!G) return;
    const h = this.hero;
    if (this.questPromptT > 0) this.questPromptT = Math.max(0, this.questPromptT - dt);
    G.walked += moved;
    if (h.skills[0].uses > 0) G.quick = true;
    if (h.skills[1].uses > 0) G.slow = true;
    if (h.skills[2].uses > 0) G.evade = true;
    if (!G.low && h.life < h.d.maxLife * GUIDE.lowLife && h.potions > 0) G.low = true;
    if (!G.met && this.monsters.some((m) => !m.dead && m.seen && Math.hypot(m.x - h.x, m.y - h.y) < TUNE.aggroRadius + 1.5)) G.met = true;
    const step = this.guideStep();
    if (step !== this.guideWas) {
      this.guideWas = step;
      if (step) this.emit({ t: 'guide', step });
    }
    // The end: the word is on, the attack that has it has been used, and the dead that rose for it are down.
    if (G.set && (G.risen || !this.inDungeon)) {
      const used = h.skills[G.set.skill].uses > G.set.uses;
      const left = this.monsters.some((m) => !m.dead && m.packId === RISEN_PACK);
      if (used && !left) {
        G.doneT = G.doneT < 0 ? 0 : G.doneT + dt;
        if (G.doneT > 1.5) this.endGuide();
      }
    }
  }

  /**
   * The first word has just been set. So that it is felt at once, the dead rise round the hero:
   * soft ones, measured against the attack as it was without the word (before, and after).
   */
  private rise(): void {
    const G = this.guide;
    if (!G || G.risen || !this.inDungeon || this.over) return;
    G.risen = true;
    const h = this.hero;
    const f = this.level.floor;
    // a spot a few steps off that the hero can see: in front of them if there is room there
    let cx = h.x;
    let cy = h.y;
    let best = -Infinity;
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      for (const d of [5.5, 4.5, 3.5]) {
        const x = h.x + Math.cos(a) * d;
        const y = h.y + Math.sin(a) * d;
        if (!this.free(this.level.walk, x, y, 0.45) || !this.sees(h.x, h.y, x, y)) continue;
        const score = d + (Math.cos(a) * h.fx + Math.sin(a) * h.fy);
        if (score > best) {
          best = score;
          cx = x;
          cy = y;
        }
        break;
      }
    }
    const life = Math.max(2, Math.round(this.bareHit() * GUIDE.risenHits));
    const def = MONSTERS.skeleton;
    // (DOORS: THEY RISE WHERE THEY CAN COME AT THE HERO, not beyond a door that is still shut. The
    // spots are found by spreading over the ground that can be walked, and a shut door can be
    // walked by the hero: so two of the six rose behind one, were held there since no monster
    // opens a door, and the lesson waited on them out of sight. A shut door's tile is no ground
    // for this.)
    let ground = this.level.walk;
    const shut = this.level.shut;
    if (shut && shut.includes(1)) {
      ground = ground.slice();
      for (let i = 0; i < ground.length; i++) if (shut[i] === 1) ground[i] = 0;
    }
    for (const spot of scatter(ground, f.w, f.h, cx, cy, GUIDE.risen, this.rng)) {
      const m = this.spawn('skeleton', spot.x, spot.y, RISEN_PACK, 0, false, this.rng);
      m.speed = GUIDE.risenSpeed;
      m.maxLife = life;
      m.life = life;
      m.dmgMin = def.dmgMin * GUIDE.risenDmg;
      m.dmgMax = def.dmgMax * GUIDE.risenDmg;
      m.xp = 0;
      m.state = 'chase';
      m.cd = this.rng.range(0.9, 1.6);
      this.emit({ t: 'burst', x: spot.x, y: spot.y, r: 0.7, el: 'frost', style: 'warp' });
    }
    this.sfx('bossRoar', 0.5);
    this.msg('The dead stir.', MSG.omen);
  }

  /** The prompts are over (seen through, or switched off): the player has been shown the game. */
  endGuide(): void {
    if (!this.guide) return;
    this.guide = null;
    this.meta.taught = true;
    this.emit({ t: 'guide', step: 'done' });
  }

  // ===========================================================================================
  // Saving

  save(): RunSave {
    const h = this.hero;
    let maxUid = 0;
    for (const it of [...EQUIP_SLOTS.map((s) => h.gear[s]), ...h.bag, ...this.meta.stash, ...this.shops.armourer, ...this.shops.mystic]) if (it) maxUid = Math.max(maxUid, it.uid);
    const run: RunSave = {
      v: 1, cls: h.cls, seed: this.seed, level: h.level, xp: h.xp, pending: h.pending, attrs: { ...h.attrs },
      gear: { ...h.gear }, bag: [...h.bag], words: savedWords(this.ringWord ? { ...h.words, [this.ringWord.word]: h.words[this.ringWord.word] + 1 } : { ...h.words }),
      sockets: h.skills.map((s) => ({ front: [...s.front], behind: [...s.behind] })),
      gold: h.gold, potionKills: h.potionKills, depth: this.depth, cleared: this.cleared, kills: this.kills, runTime: this.runTime, maxUid,
      plan: [...this.plan],
      body: this.bodySearched,
      // (EXITS: nor whether the wordsmith has given his quest, while theirs is off)
      ...(EXITS.on && this.questGiven ? { asked: true } : {}),
      voice: this.voice,
      guide: this.guide ? { ...this.guide, set: this.guide.set ? { ...this.guide.set } : null } : null,
      wordsBought: this.wordStock.flatMap((w, i) => (w === null ? [i] : [])),
      // (nothing of the modes is written while their switch is off: a hero made before then is MODE_BEFORE)
      ...(MODES.on ? { mode: this.mode } : {}),
      // (nor of the first levels while theirs is: a hero saved before them has the ring lit)
      ...(FIRST_LEVELS.on ? { ring: h.ring, quest: h.quest } : {}),
      // (THE SKILL TREES: none can be taken while their switch is off, so nothing is written then)
      ...(h.talents.length ? { talents: [...h.talents] } : {}),
      // (THE RANGER'S COMPANIONS: nor the picks while theirs is off)
      ...(COMPANIONS.on && h.pets && Object.keys(h.pets).length ? { pets: { ...h.pets } } : {}),
      // (THE WAYS: nor the waypoint reached while theirs is off)
      ...(WAYS.on ? { way: this.wayDepth } : {}),
      // (ENDLESS MODE: nor the endless level reached, until it is open to him)
      ...(ENDLESS.on && this.endless > 0 ? { endless: this.endless, endlessFloor: this.endlessFloor } : {}),
      // (WORDMELDING: nor its runedust and its Meldstone while MELD is off)
      ...(MELD.on ? { dust: h.dust, meld: h.meld } : {}),
    };
    // (ACT 2, THE HUSH: a word the Physician holds is the hero's in the save, where it would go back to: game/act1_rules/physician.ts)
    inTheSave(run, this.monsters);
    return run;
  }

  /** Rebuild a run from a save. Throws if the save is not one this version understands. */
  static restore(s: RunSave, meta?: Meta): Game {
    if (!s || s.v !== 1 || !ALL_CLASS_IDS.includes(s.cls)) throw new Error('unreadable save');
    const g = new Game(s.cls, s.seed, meta);
    const h = g.hero;
    const num = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);
    h.level = Math.max(1, Math.floor(num(s.level, 1)));
    h.xp = Math.max(0, num(s.xp, 0));
    h.pending = Math.max(0, Math.floor(num(s.pending, 0)));
    h.attrs = { str: num(s.attrs?.str, h.attrs.str), dex: num(s.attrs?.dex, h.attrs.dex), int: num(s.attrs?.int, h.attrs.int) };
    // (a save from before Version 12 may hold weapons of kinds that have gone, or marked as one class's own)
    for (const slot of EQUIP_SLOTS) h.gear[slot] = s.gear?.[slot] ? migrateItem(s.gear[slot] as Item) : null;
    h.bag = Array.isArray(s.bag) ? s.bag.slice(0, TUNE.bagSize).map((it) => (it ? migrateItem(it) : null)) : [];
    while (h.bag.length < TUNE.bagSize) h.bag.push(null);
    for (const w of wordIds()) h.words[w] = Math.max(0, Math.floor(num(s.words?.[w], 0)));
    h.skills.forEach((sk, i) => {
      const so = s.sockets?.[i];
      const clean = (a: unknown): (WordId | null)[] => (Array.isArray(a) ? a.map((w) => (wordIds().includes(w as WordId) ? (w as WordId) : null)) : []);
      sk.front = SKILLS[sk.id].sockets ? clean(so?.front) : [];
      sk.behind = SKILLS[sk.id].sockets ? clean(so?.behind) : [];
    });
    h.gold = Math.max(0, Math.floor(num(s.gold, 0)));
    h.potionKills = Math.max(0, num(s.potionKills, 0));
    g.depth = Math.max(1, Math.floor(num(s.depth, 1)));
    g.cleared = Math.max(0, Math.floor(num(s.cleared, 0)));
    g.wayDepth = Math.max(0, Math.floor(num(s.way, 0)));
    // (ENDLESS MODE: the endless level reached and the floor it is; a floor past the last built is not one)
    if (ENDLESS.on) {
      g.endless = Math.max(0, Math.floor(num(s.endless, 0)));
      const ef = Math.floor(num(s.endlessFloor, 0));
      g.endlessFloor = g.endless > 0 ? (ef >= 1 && ef <= lastFloor() ? ef : endlessFloorFor(g.seed, g.endless, 0)) : 0;
    }
    // (EXITS: the town made again by the way he has come: the gate barred or not; the camp from floor 10 on)
    if (EXITS.on) g.enterTown();
    // (THE WAYS: the town's waypoint, awake once there is a floor to warp back to)
    const tw = g.level.ways?.way;
    if (tw) tw.awake = g.wayDepth >= 2;
    g.kills = Math.max(0, Math.floor(num(s.kills, 0)));
    if (VOICE_IDS.includes(s.voice as VoiceId)) g.voice = s.voice as VoiceId;
    g.mode = HERO_MODES.includes(s.mode as HeroMode) ? (s.mode as HeroMode) : MODE_BEFORE;
    g.runTime = Math.max(0, num(s.runTime, 0));
    if (Array.isArray(s.plan)) {
      for (const w of s.plan) if (WORD_IDS.includes(w) && g.plan.length < TUNE.planMax && !g.plan.includes(w)) g.plan.push(w);
    }
    g.bodySearched = s.body === true;
    g.questGiven = EXITS.on && s.asked === true;
    // (THE FIRST LEVELS: a save from before them, or made with them off, has the ring lit)
    h.ring = !FIRST_LEVELS.on || s.ring !== false;
    h.quest = s.quest === 'heart' ? 'heart' : null;
    // (WORDMELDING: nothing of it in a save made with MELD off)
    h.dust = Math.max(0, Math.floor(num(s.dust, 0)));
    h.meld = s.meld === 'stone' || s.meld === 'open' ? s.meld : null;
    // (THE SKILL TREES: only this class's talents, each once, in an order that could have been taken)
    h.talents = cleanTalents(h.cls, h.level, s.talents);
    // (THE RANGER'S COMPANIONS: the picks, only of their own groups)
    if (COMPANIONS.on && s.pets) h.pets = cleanPicks(s.pets);
    if (s.guide && typeof s.guide === 'object') {
      // (the prompts carry on from where they were; what was set stays set)
      const q = s.guide;
      const G = newGuide();
      G.walked = Math.max(0, num(q.walked, 0));
      G.met = q.met === true;
      G.hits = Math.max(0, Math.floor(num(q.hits, 0)));
      G.low = q.low === true;
      G.quick = q.quick === true;
      G.slow = q.slow === true;
      G.evade = q.evade === true;
      G.flask = q.flask === true;
      // (if the word was already on, there is nothing left to show)
      if (q.set) g.meta.taught = true;
      else g.guide = G;
    }
    let maxUid = Math.floor(num(s.maxUid, 0));
    for (const it of [...EQUIP_SLOTS.map((slot) => h.gear[slot]), ...h.bag]) if (it) maxUid = Math.max(maxUid, num(it.uid, 0));
    reserveUids(maxUid);
    // the vendor's stock depends on how far the run has got, so roll it again now that we know
    g.rollShop();
    // (a word bought from the wordsmith on this visit is not on his shelf again)
    if (Array.isArray(s.wordsBought)) for (const i of s.wordsBought) if (Number.isInteger(i) && i >= 0 && i < g.wordStock.length) g.wordStock[i] = null;
    g.refresh();
    h.life = h.d.maxLife;
    h.mana = h.d.maxMana;
    g.events.length = 0;
    // (a character carried on with is not a new one: nothing is pressed on them, unless the first
    // dungeon's prompts were still running and their word is waiting for a place)
    g.offer = null;
    if (g.guide) {
      const spare = WORD_IDS.find((w) => h.words[w] > 0 && g.placeable(w));
      if (spare) g.offer = spare;
    }
    return g;
  }

  // ===========================================================================================
  // Setup

  private newHero(cls: ClassId): Hero {
    const c = CLASSES[cls];
    const gear = {} as Record<EquipSlot, Item | null>;
    for (const s of EQUIP_SLOTS) gear[s] = null;
    gear.mainhand = starterWeapon(cls);
    const words = {} as Record<WordId, number>;
    // (no word to begin with: the first lies in a satchel, half way through the first dungeon)
    for (const w of wordIds()) words[w] = 0;
    const attrs: Record<Attr, number> = { ...c.attrs };
    const d = derive(cls, 1, attrs, gear, this.meta.limit);
    // both attacks are the class's own (defs.ts OWN_MOVES; with it off, the weapon's); the evasive move is the character's own
    const weapon = gear.mainhand ? gear.mainhand.weapon : null;
    const skills = skillsFor(cls, weapon).map((id, i): SkillState => ({
      id, front: [], behind: [], cd: 0, charges: 1, maxCharges: 1, uses: 0,
      r: resolveSkill(SKILLS[id], [], [], i < 2 ? attackGrows(cls, weapon) : c.primary, d),
    }));
    const bag: (Item | null)[] = [];
    for (let i = 0; i < TUNE.bagSize; i++) bag.push(null);
    return {
      cls, level: 1, xp: 0, pending: 0, attrs, life: d.maxLife, mana: d.maxMana,
      x: 0, y: 0, fx: 0.7071, fy: 0.7071, anim: 'idle', animT: 0, attackT: 0, attackSkill: 0, combo: 0, comboT: 0, step: null, attackAge: 0, attackWind: 0, windup: null, channel: null, queued: null, swingT: 0, flash: 0, invuln: 0,
      gear, bag, words, skills, gold: 0, potions: TUNE.potionMax, potionKills: 0,
      might: 0, mightT: 0, haste: 0, hasteT: 0, frenzy: 0, frenzyT: 0, shield: 0, shieldT: 0, burnT: 0, burnDps: 0, chillT: 0, chill: 0, shockT: 0, poisonT: 0, poisonDps: 0,
      move: null,
      // (THE FIRST LEVELS: the ring is lit for him if it ever was on this device; with the switch off, always)
      ring: !FIRST_LEVELS.on || this.meta.ring,
      quest: null,
      dust: 0,
      // (WORDMELDING: melding is open for him if the Meldstone was ever brought on this device, as the ring is)
      meld: MELD.on && this.meta.meld ? 'open' : null,
      talents: [],
      // (THE WARLOCK, game/warlock.ts: a man, his pact empty)
      ...(cls === 'warlock' ? { form: 'man' as const, pact: 0, change: null } : {}),
      d,
    };
  }

  // ===========================================================================================
  // THE FIRST LEVELS (defs.ts, FIRST_LEVELS): the abilities open by level, and wordsmithing with the ring

  /** Is ability `i` open to the hero: always with the switch off and in the practice room; otherwise from its level (MOVE_OPENS). */
  moveOpen(i: number): boolean {
    return !FIRST_LEVELS.on || this.practice || this.hero.level >= (MOVE_OPENS[i] ?? 1);
  }

  /** The word slots an open ability has now, in front and behind: none before the ring is lit; then by level. */
  slots(level = this.hero.level): [number, number] {
    if (!this.hero.ring && !this.practice) return [0, 0];
    // (the practice room is for trying every combination: every slot is open there, whatever the level)
    if (this.practice) return socketCount(999);
    return socketCount(level);
  }

  /**
   * What the master rune-stone's pictures show (art/quest3.ts, QUEST3; main.ts sets them from this
   * each frame): the wordsmith's ring dark (this hero's ring is not lit); the stone carried; the
   * stone lying by the fallen wordsmith (here, unsearched, and the ring dark).
   */
  questView(): { dark: boolean; carried: boolean; lying: boolean } {
    const live = FIRST_LEVELS.on && !this.practice;
    const dark = live && !this.hero.ring;
    const carried = live && this.hero.quest === 'heart';
    const b = this.level.town ? null : this.level.body;
    return { dark, carried, lying: dark && !carried && !!b && b.state === 0 };
  }

  /** Do words fall, and do monsters carry them, here and now: not before the ring is lit, and (21:05) not in the first dungeon. */
  wordsFall(): boolean {
    if (!FIRST_LEVELS.on || this.practice) return true;
    return this.hero.ring && this.depth > 1;
  }

  /**
   * THE QUEST ITEM BROUGHT TO THE WORDSMITH: his ring is lit (for this hero and on this device), and
   * once it has powered up he gives the hero's first word and the slots open with it (giveRingWord,
   * since Version 20.0). Called when the hero comes up to him with it.
   */
  private lightRing(x: number, y: number): void {
    const h = this.hero;
    h.quest = null;
    h.ring = true;
    this.meta.ring = true;
    const w = FIRST_WORD[h.cls].word;
    if (!this.practice) this.meta.known[w].found = true;
    this.emit({ t: 'ring', x, y });
    this.sfx('rare');
    this.msg('The ring is lit.', MSG.word);
    // (the word once the ring has powered up: the owner, 9 Oct 2026, 22:12)
    this.ringWord = { word: w, t: QUEST_ITEM.ringSecs };
  }

  /** The wordsmith gives the hero's first word, the ring powered up. */
  private giveRingWord(): void {
    const p = this.ringWord;
    if (!p) return;
    this.ringWord = null;
    const h = this.hero;
    const w = p.word;
    h.words[w]++;
    this.refresh();
    this.emit({ t: 'wordGot', word: w });
    this.sfx('rare');
    this.msg(`The wordsmith gives you a word: ${WORDS[w].name.toUpperCase()}.`, MSG.word);
    // (as a first word found is: the inventory opens for it at once, and the lesson shows where it goes)
    if (!this.wordAtWork() && this.placeable(w)) this.offer = w;
  }

  /** Rebuild everything derived from level, attributes, gear and socketed words. */
  /**
   * ACT 2, THE HUSH: hush the hero's words for `secs` seconds (the longer of this and what is left of one already on him). His doc:
   * the Crier's Silent Shout, the Physician's Tonic, the Censor's; got out of by moving out of what brought it. HUSH_FOR is the
   * planning chat's pick, told him: about 4 seconds, every word dark.
   */
  hush(secs: number = HUSH_FOR): void {
    if (this.over || secs <= 0) return;
    const was = this.hushT;
    this.hushT = Math.max(this.hushT, secs);
    if (was <= 0) {
      this.refresh();
      this.emit({ t: 'hushed', on: true });
    }
  }

  refresh(): void {
    const h = this.hero;
    h.d = derive(h.cls, h.level, h.attrs, h.gear, this.meta.limit, talentMods(h.cls, h.talents));
    // (THE SKILL TREES: Thick Skin)
    if (this.was('thickskin')) h.d.maxLife = Math.round(h.d.maxLife * TALENT_TUNE.thickSkin);
    // The weapon in hand decides both attacks (with defs.ts OWN_MOVES off; on, they are the class's own and this changes
    // nothing). Their words stay where they are: they belong to the
    // place, not to the attack ("Power Strike becomes Power Shot when a bow is equipped"). What
    // the old attack had set going is gone with it. An attack that was waiting to be ready hands
    // its wait on to the one that takes its place: changing weapon is no way round a cooldown.
    const weapon = this.weapon();
    // (THE WARLOCK, game/warlock.ts: as the demon, the demon's three in the places of his)
    const want: SkillId[] = [...(h.cls === 'warlock' && h.form === 'demon' ? DEMON_KIT : skillsFor(h.cls, weapon))];
    // (THE TINKERER's tree: CONTRAPTION, his idea, swaps her Vial Toss for the Contraption)
    if (h.cls === 'tinkerer' && this.has('contraptions')) want[0] = 'contraption';
    const waiting = [false, false, false];
    const changed = [false, false, false];
    for (let i = 0; i < 3; i++) {
      const s = h.skills[i];
      if (s.id === want[i]) continue;
      // (an attack that was being held ends here, and its wait begins: see endChannel)
      if (h.channel && h.channel.skill === i) this.endChannel(false);
      changed[i] = true;
      waiting[i] = SKILLS[s.id].cooldown > 0 && s.charges < 1;
      s.id = want[i];
      if (i === 0) h.swingT = 0;
      else if (i === 1) h.queued = null;
      if (h.windup && h.windup.skill === i) {
        h.windup = null;
        h.attackT = 0;
      }
      this.projectiles = this.projectiles.filter((p) => p.hostile || p.skill !== i);
      this.traps = this.traps.filter((t) => t.skill !== i);
      this.volleys = this.volleys.filter((v) => v.skill !== i);
      this.orbs = this.orbs.filter((o) => o.skill !== i);
      this.familiars = this.familiars.filter((q) => q.skill !== i);
    }
    const [nf, nb] = this.slots();
    for (let i = 0; i < h.skills.length; i++) {
      const s = h.skills[i];
      const def = SKILLS[s.id];
      // (THE FIRST LEVELS: an ability not yet open has no slots)
      const open = this.moveOpen(i);
      const wantF = def.sockets && open ? nf : 0;
      const wantB = def.sockets && open ? nb : 0;
      while (s.front.length < wantF) s.front.push(null);
      while (s.behind.length < wantB) s.behind.push(null);
      // (a character saved when a slot opened at a lower level than it does now: the slot closes,
      // and the word that was in it goes back to the pouch rather than working on unseen)
      for (const side of [s.front, s.behind]) {
        const want = side === s.front ? wantF : wantB;
        while (side.length > want) {
          const w = side.pop();
          if (w) h.words[w]++;
        }
        // (ONE DAMAGE WORD A SIDE, since Version 19.3: a character saved with two keeps the first,
        // and the other goes back to the pouch)
        let damage = false;
        for (let k = 0; k < side.length; k++) {
          const w = side[k];
          if (!w || !isDamageWord(w)) continue;
          if (damage) {
            side[k] = null;
            h.words[w]++;
          } else damage = true;
        }
      }
      // (ACT 2, THE HUSH: hushed, as if no word were in it)
      const dark = this.hushT > 0;
      s.r = resolveSkill(def, dark ? s.front.map(() => null) : s.front, dark ? s.behind.map(() => null) : s.behind, i < 2 ? attackGrows(h.cls, weapon) : h.cls, h.d, this.meta.limit);
      // (THE SKILL TREES: Battle Rush, the leap ready sooner)
      if (def.kind === 'leap' && this.was('drilledleap')) s.r.cooldown *= TALENT_TUNE.drilledLeap;
      // (the roll's two charges are a thing of cooldowns: when mana is the limit, mana is; Light Step, three)
      s.maxCharges = def.kind === 'roll' && this.meta.limit === 'cooldown' ? (this.has('lightstep') ? TALENT_TUNE.lightStep.charges : 2) : 1;
      if (changed[i]) {
        s.charges = waiting[i] && s.r.cooldown > 0 ? 0 : 1;
        s.cd = s.charges < 1 ? s.r.cooldown : 0;
      }
      if (s.charges > s.maxCharges) s.charges = s.maxCharges;
    }
    h.life = Math.min(h.life, h.d.maxLife);
    h.mana = Math.min(h.mana, h.d.maxMana);
  }

  /** The kind of weapon in the hero's hand, or null with empty hands. */
  weapon(): WeaponKind | null {
    const it = this.hero.gear.mainhand;
    return it ? it.weapon : null;
  }

  private clearLevel(): void {
    this.bossMet = false;
    // (ACT 2, THE HUSH: no Hush carries off the level; his words are his again)
    if (this.hushT > 0) {
      this.hushT = 0;
      this.refresh();
    }
    // (ACT 1: words laid on a stronghold's altar and not burned go back to the hero)
    for (const q of this.level?.holds ?? []) if (!q.open) for (const w of q.words.splice(0)) this.hero.words[w] = (this.hero.words[w] ?? 0) + 1;
    this.holdGoing = -1;
    // (a word the wordsmith was about to give is given now, not lost with the level)
    if (this.ringWord) this.giveRingWord();
    // (ACT 2, THE HUSH: nor a word the Physician has drawn out of the hero: it is his again)
    giveBackAll(this);
    this.monsters = [];
    this.projectiles = [];
    this.zones = [];
    this.traps = [];
    this.volleys = [];
    this.risers = [];
    this.perils = [];
    this.corpses = [];
    this.spears = [];
    this.orbs = [];
    this.familiars = [];
    this.contraptions = [];
    this.vials = [];
    // (THE TINKERER's tree: her Tar dries up, and the decoys are gone, with the level)
    this.tars = [];
    this.decoys = [];
    this.decoySwings.clear();
    this.cannonballs = [];
    this.hellwaves = [];
    this.souls = [];
    this.brawl = newBrawl();
    this.drops = [];
    this.later = [];
    // (THE CITY'S WORDS: the clock starts again with the level, and so do the times the shards and the pull were last shown)
    this.shardsAt = [-9, -9, -9];
    this.pullShown = [-9, -9, -9];
    this.snareAt = [-9, -9, -9];
    // (BINDING, on a monster: what roots the hero stays on its own level)
    this.hero.rootT = 0;
    this.hero.rootAgain = 0;
    this.boss = null;
    this.visList = [];
    this.time = 0;
    this.flowT = 0;
    this.visionT = 0;
    const h = this.hero;
    h.move = null;
    h.burnT = 0;
    h.chillT = 0;
    h.shockT = 0;
    h.poisonT = 0;
    h.might = 0;
    h.mightT = 0;
    h.haste = 0;
    h.hasteT = 0;
    h.frenzy = 0;
    h.frenzyT = 0;
    h.shield = 0;
    h.shieldT = 0;
    h.attackT = 0;
    h.windup = null;
    h.channel = null;
    h.queued = null;
    h.combo = 0;
    h.comboT = 0;
    h.step = null;
    h.held = 0;
    for (const s of h.skills) {
      s.cd = 0;
      s.charges = s.maxCharges;
    }
  }

  /** `by` (THE WAYS): come back through the gate from the first floor (standing just inside it), or by the waypoint (standing on the town's). */
  enterTown(by: 'gate' | 'way' | 'stairs' | 'cage' | null = null): void {
    this.clearLevel();
    // (EXITS, game/camp.ts: from floor 10 on, his town is the camp inside Vellum's gate: his pick, “Yes, the camp from then on (Recommended)”)
    const camp = this.campTown();
    this.level = camp ? makeCamp(this.seed, TUNE.tradesOpen) : makeTown(this.seed);
    this.inDungeon = false;
    // (ENDLESS MODE: in town he is on no endless level; the waypoint takes him back to the one he reached)
    this.inEndless = false;
    this.dungeonWords = [];
    const h = this.hero;
    const f = this.level.floor;
    h.x = f.start.x;
    h.y = f.start.y;
    h.fx = -0.7071;
    h.fy = -0.7071;
    const W = this.level.ways;
    if (W && W.way) W.way.awake = this.wayDepth >= 2;
    // (EXITS: the gate in the back wall barred until the Fleshmancer is beaten: the Prison cleared, his way is on to floor 6)
    this.toldBarred = false;
    if (W && EXITS.on) W.barred = this.wayDepth < 6;
    if (camp && by === 'gate') {
      // (in from floor 10, through the city gate: at its mouth, looking into the camp)
      h.x = CAMP.arrive.x;
      h.y = CAMP.arrive.y;
      h.fx = 1;
      h.fy = 0;
    } else if (W && EXITS.on && by === 'stairs' && W.stair) {
      // (up the stairs from floor 1: he comes up out of them, standing before their top step, looking into the hall)
      const top = topStep(W.stair);
      h.x = W.stair.way === 'x' ? top.x - 1.1 : top.x;
      h.y = W.stair.way === 'x' ? top.y : top.y - 1.1;
      h.fx = W.stair.way === 'x' ? -1 : 0;
      h.fy = W.stair.way === 'x' ? 0 : -1;
    } else if (W && EXITS.on && by === 'cage' && W.shaft) {
      // (up the shaft from floor 5: the cage comes up into the hall's corner with him in it, and opens: `updateWays`)
      h.x = W.shaft.x + 0.5;
      h.y = W.shaft.y + 0.5;
      h.fx = -0.7071;
      h.fy = -0.7071;
      W.shaft.state = 'arriving';
      W.shaft.t = 0;
    } else if (W && by === 'gate') {
      // (just inside the gate, which is up behind him as he comes through it, and falls once he has walked off: `updateWays`)
      h.x = TOWN_GATE.a + 1.5;
      h.y = TOWN_GATE.line + 2.2;
      h.fx = 0.7071;
      h.fy = 0.7071;
      if (W.gate >= 0) {
        const d = this.level.doors[W.gate];
        d.open = 1;
        d.want = 1;
        for (const i of doorTiles(f, d.spot)) {
          this.level.walk[i] = 1;
          this.level.open[i] = 1;
        }
      }
    } else if (W && W.way && by === 'way') {
      h.x = W.way.x;
      h.y = W.way.y;
      h.fx = 0.7071;
      h.fy = 0.7071;
      // (he comes out of the column of light, the second half of a warp: art/crypt_ways.ts)
      W.way.warpAt = -WARP_SECS;
    }
    h.life = h.d.maxLife;
    h.mana = h.d.maxMana;
    h.potions = TUNE.potionMax;
    this.flow = new Uint16Array(f.w * f.h);
    this.rollShop();
    if (FIRST_LEVELS.on && h.quest) this.questPromptT = QUEST_ITEM.promptSecs;
  }

  /** The shelf of the vendor the hero is dealing with. */
  get shop(): (Item | null)[] {
    return this.shops[this.vendor];
  }

  /**
   * Stock the two vendors for this visit. The same run at the same point always gets the same
   * stock. Each has, first, a plain weapon of each of its kinds (always: a character can always
   * change to another weapon), and then a rolled piece for each slot it deals in (VENDORS).
   */
  rollShop(): void {
    const rng = new RNG((Math.imul(this.seed, 40503) ^ (this.depth * 9973 + this.cleared * 613)) >>> 0);
    const held = this.weapon();
    // (ENDLESS MODE: once its levels are open to him, what the vendors have grows on with the one he has reached)
    const level = Math.max(1, this.power);
    this.sold = [];
    for (const id of VENDOR_IDS) {
      const v = VENDORS[id];
      const stock: (Item | null)[] = v.weapons.map((kind) => plainWeapon(kind, level));
      v.slots.forEach((slot, i) => {
        // (what a vendor has grows with the dungeons as what drops does: plain and magic early, a
        // rare piece now and then; the last two on each shelf are a level better)
        stock.push(rollItem(level + (i >= v.slots.length - 2 ? 1 : 0), rng, { luck: TUNE.shopLuck, slot, forWeapon: held, weapons: v.weapons }));
      });
      this.shops[id] = stock;
    }
    // The wordsmith's words: a few, no two the same, drawn from a lot of their own (so that the
    // vendors' stock is what it always was). And nobody has anything of the hero's yet.
    const lot = new RNG((Math.imul(this.seed, 69069) ^ (this.depth * 7919 + this.cleared * 104729 + 0x57a1)) >>> 0);
    // (THE CITY'S WORDS, Version 23.8: what may be found at this depth, `wordsAt`)
    const pool = [...wordsAt(this.power)];
    this.wordStock = [];
    while (this.wordStock.length < TUNE.wordStock && pool.length > 0) this.wordStock.push(pool.splice(lot.int(0, pool.length - 1), 1)[0]);
    this.wordsSold = [];
    this.won = -1;
  }

  /** `by` (THE WAYS): come back by the waypoint from town (standing on the floor's), or through the gate from town (just inside the first floor's). Otherwise where the floor begins. */
  enterDungeon(by: 'way' | 'gate' | null = null): void {
    this.clearLevel();
    // (THE SKILL TREES: Unbreakable once in each dungeon)
    this.unbroken = false;
    // the words laid on the gate are burned into this dungeon: used up, for good
    this.dungeonWords = this.plan;
    this.plan = [];
    for (const w of this.dungeonWords) this.learn(w, 'dungeon');
    // (ENDLESS MODE: an endless level laid fresh for its level, though its floor came before)
    const seed = (Math.imul(this.seed, 7919) + this.depth * 104729 + this.cleared * 31 + (this.inEndless ? this.endless * 15485863 : 0)) >>> 0;
    this.level = makeDungeon(this.depth, seed);
    this.inDungeon = true;
    const h = this.hero;
    const f = this.level.floor;
    h.x = f.start.x;
    h.y = f.start.y;
    // A hero comes into a dungeon LOOKING DOWN THE SCREEN AND TO THE RIGHT, their face to the one
    // playing (the owner, 6 Oct 2026, 23:02: "always have the come down into the dungeon looking
    // down right"). Up to then they came in facing whichever way they had last faced in town, and
    // from the title that was up and to the left, their back to the camera. (+x in the world is
    // down and to the right on the screen: engine/iso.ts.)
    h.fx = 1;
    h.fy = 0;
    // (THE WAYS: a floor's waypoint is reached as he comes into the floor beside it; back by it, he comes out of its light)
    const W = this.level.ways;
    if (W && W.way) {
      this.wayDepth = Math.max(this.wayDepth, this.depth);
      if (by === 'way') {
        h.x = W.way.x;
        h.y = W.way.y;
        W.way.awake = true;
        W.way.warpAt = -WARP_SECS;
      }
    }
    if (W && by === 'gate' && W.gate >= 0) {
      // (through the gate from town he comes in just inside the first floor's, looking into its first room)
      const s = this.level.doors[W.gate].spot;
      const m = doorMiddle(s);
      h.x = s.alongX ? m.x : m.x - s.out * 1.7;
      h.y = s.alongX ? m.y - s.out * 1.7 : m.y;
      h.fx = s.alongX ? 0 : -s.out;
      h.fy = s.alongX ? -s.out : 0;
    }
    this.flow = new Uint16Array(f.w * f.h);
    this.spawnMonsters(seed);
    // (ACT 1: the strongholds, and their guards before their doors)
    this.holdsMade(seed);
    // (ACT 2, THE HUSH: its Bells, asleep, where its map-maker laid them)
    this.bellsMade();
    if (this.depth === 1 && this.cleared === 0) {
      // (THE WAYS: the first floor may be come back to before it is cleared, through its gate from
      // town; the fallen wordsmith, once searched, is laid there searched: nothing more comes of him)
      this.placeBody();
      this.softenFirstHalf();
      if (FIRST_LEVELS.on) this.softball();
    } else if (FIRST_LEVELS.on && !this.practice && !this.hero.ring && !this.hero.quest && !this.bodySearched) {
      // (THE FIRST LEVELS: without the MASTER RUNE-STONE there is no wordsmithing. A hero who left the
      // first dungeon without searching the fallen wordsmith finds him again in the next, half way
      // along its main path, and so on until he is found.)
      this.placeBody();
    }
    this.updateVision(1);
    // (FLOOR_NAMES: the floor's own name comes up across the screen, its level under it, in place of the line)
    // (ENDLESS MODE: on an endless level, the floor's own name, the level under it, and the warning: his pick, a death here is the hero's end)
    if (FLOOR_NAMES.on && !this.practice) this.emit({ t: 'floorName', ...floorTitle(this.depth), ...(ENDLESS.on && this.inEndless ? { level: endlessName(this.endless), warn: ENDLESS_WARN } : {}) });
    else this.msg(ENDLESS.on && this.inEndless ? `${endlessName(this.endless)}: ${ENDLESS_WARN}` : `Dungeon ${this.depth}`, MSG.head);
    if (this.dungeonWords.length) this.msg(`Burned in: ${this.dungeonWords.map((w) => WORDS[w].name).join(', ')}`, MSG.word);
    this.sfx('portal');
    // NORMAL MODE (game/modes.ts): the hero as they came in, for a death to go back to. (A copy
    // through JSON: nothing found or changed in here can reach it.)
    this.entry = JSON.parse(JSON.stringify(this.save())) as RunSave;
  }

  private spawnMonsters(seed: number): void {
    const f = this.level.floor;
    const rng = new RNG(seed ^ 0x5bd1e995);
    // Which monsters carry a word to give up is drawn from a lot of its own, so that changing how
    // scarce words are never changes the dungeon itself.
    const lot = new RNG(seed ^ 0x2c1b3c6d);
    // (THE NEW MONSTERS among them only while their switch is on: packKinds)
    const kinds = packKinds(this.depth);
    // (MONSTER PACKS: which packs are blue and which yellow, and their words, from a lot of its own)
    const tiers = new RNG((seed ^ 0x7f4a7c15) >>> 0);
    // (PACKS GROW WITH THE LEVELS: which way a pack's growth rounds, from a lot of its own, so that the rest of the floor is drawn as it was)
    const grow = new RNG((seed ^ 0x1b873593) >>> 0);
    f.packs.forEach((p, pi) => {
      if (MONSTER_PACKS.on && p.kind) {
        this.fillPack(p.kind, p.x, p.y, p.size, p.tier, pi, rng, lot, tiers, grow);
        return;
      }
      const main = rng.weighted(kinds, (k) => k.weight);
      let size = p.size;
      if (main.kind === 'bat') size += 2;
      if (main.kind === 'brute') size = Math.max(2, Math.ceil(size / 2));
      if (p.tier === 'champion') size = p.size; // a guardian's followers are counted as they are
      const spots = scatter(this.level.walk, f.w, f.h, p.x, p.y, size, rng);
      spots.forEach((s, i) => {
        if (p.tier === 'champion' && i === 0) {
          // the guardian itself stands at the centre of the pack
          this.spawn('brute', s.x, s.y, pi, 2, false, rng, lot);
          return;
        }
        let def = main;
        if (i > 0 && main.kind === 'brute') def = MONSTERS.skeleton;
        else if (i > 0 && rng.chance(0.3)) def = rng.weighted(kinds, (k) => k.weight);
        this.spawn(def.kind, s.x, s.y, pi, p.tier === 'elite' && i === 0 ? 1 : 0, false, rng, lot);
      });
    });
    // The boss waits a little in front of the dark portal (BOSS_INTRO: at the back of his hall, far
    // from its way in: the owner, 21:49, "Makes sure the boss spawns far enough back so it can’t be hit
    // before your character enters the gate").
    let bx = f.boss.x + 1;
    let by = f.boss.y + 2;
    if (!this.free(this.level.walk, bx, by, 0.42)) {
      bx = f.boss.x;
      by = f.boss.y;
    }
    const back = BOSS_INTRO.on ? this.backOfHall() : null;
    if (back) {
      bx = back.x;
      by = back.y;
    }
    // (ACT 1: where a boss of the descent's own stands, as his rules have it: the eyrie's edge, the Eye's pool)
    const bk = bossKind(this.depth);
    const placed = ACT1.on ? act1Rules(bk)?.bossAt?.(this.level) ?? null : null;
    if (placed) {
      bx = placed.x;
      by = placed.y;
    }
    // (THE FIRST FIVE FLOORS: each floor's own boss, game/bosses.ts; the Warden on the first, and past the fifth)
    this.boss = this.spawn(bk, bx, by, -2, 0, true, rng, lot);
    if (placed) {
      this.boss.fx = placed.fx;
      this.boss.fy = placed.fy;
    }
    // (FLOOR 13'S DOUBLE BOSS: the Quill beside the Scraper, a boss too, of the same pack: game/act1_rules/pair.ts)
    if (bk === 'scraper' && PAIR.on) {
      const b = this.boss;
      const at = this.besideBoss(b, 2.6);
      const q = this.spawn('quill', at.x, at.y, -2, 0, true, rng, lot);
      q.fx = b.fx;
      q.fy = b.fy;
    }
  }

  /** Where one stands beside the boss `b`, `d` tiles to its side (or behind, or before it), on floor with room: where the Quill comes into the world. */
  private besideBoss(b: Monster, d: number): { x: number; y: number } {
    const L = this.level;
    for (const [f, s] of [[0, 1], [0, -1], [-0.7, 0.7], [-0.7, -0.7], [-1, 0], [0.7, 0.7], [0.7, -0.7], [1, 0]]) {
      const x = b.x + (b.fx * f + b.fy * s) * d;
      const y = b.y + (b.fy * f - b.fx * s) * d;
      if (this.free(L.walk, x, y, 0.5)) return { x, y };
    }
    return { x: b.x, y: b.y };
  }

  /**
   * MONSTER PACKS (defs.ts): a pack of one kind, `size` of it (50% increased with Twin burned in at
   * the gate), around (x, y). A guardian's pack is guardians alone. Any other is plain, blue or
   * yellow (PACKS): an elite room's always yellow. A blue pack's one word is on every one of it; a
   * yellow pack's leader has an elite's words, and the others, its minions, have those words at half
   * strength. PACKS GROW WITH THE LEVELS (defs.ts PACK_GROWTH, since Version 23.5): then as many times as big as its
   * level has them (`power`: the floor's depth, an endless level's), the part of one over rounded up as often as it is
   * (`grow`: a pack 4.6 big is 5 three times in five, 4 twice).
   */
  private fillPack(kind: MonsterKind, x: number, y: number, size: number, tier: 'normal' | 'elite' | 'champion', pi: number, rng: RNG, lot: RNG, tiers: RNG, grow: RNG | null = null): void {
    const f = this.level.floor;
    const twin = this.dungeonWords.includes('twin') ? Math.round(size * GATE_TWIN_PACKS) : size;
    const big = twin * packGrowth(this.power);
    const n = big > twin && grow ? Math.floor(big) + (grow.next() < big - Math.floor(big) ? 1 : 0) : twin;
    const spots = scatter(this.level.walk, f.w, f.h, x, y, n, rng);
    if (tier === 'champion') {
      // (a lair gives up a word as one guardian did: only the first of them may carry one; words are scarce)
      // (ACT 2, THE HUSH: nothing of the old floors fights there, his "let’s keep the acts separate": a lair's guardians are the
      // floor's own medium kind, game/act2_mobs.ts ACT2_GUARD, as the pack's kind says)
      const guard: MonsterKind = act2Floor(this.depth) ? kind : 'brute';
      spots.forEach((s, i) => this.spawn(guard, s.x, s.y, pi, 2, false, rng, i === 0 ? lot : null));
      return;
    }
    const rarity = packRarity(tier === 'elite', this.depth, tiers.next(), kind);
    if (rarity === 'plain') {
      for (const s of spots) this.spawn(kind, s.x, s.y, pi, 0, false, rng, lot);
      return;
    }
    // (THE FIRST LEVELS: nothing has a word in the first dungeon; a yellow pack's leader is only the tougher)
    const words = this.bareDungeon() ? [] : this.drawWords(tiers, rarity === 'blue' ? 1 : this.power >= 6 ? 2 : 1);
    if (rarity === 'blue') for (const s of spots) this.spawn(kind, s.x, s.y, pi, 0, false, rng, null, { rarity: 'blue', words });
    // (words are scarce: as before, an elite room's leader may carry one of its words to give up; the
    // leader of any other yellow pack carries none, and neither does a minion nor one of a blue pack)
    // (THE NEW MONSTERS: a yellow pack of skeletons is led by the skeleton champion, a monster of his own)
    else spots.forEach((s, i) => this.spawn(i === 0 ? this.leaderOf(kind) : kind, s.x, s.y, pi, i === 0 ? 1 : 0, false, rng, i === 0 && tier === 'elite' ? lot : null, { rarity: i === 0 ? 'leader' : 'minion', words }));
  }

  /** What leads a yellow pack of `kind`: one of them (an elite), or a leader of his own (THE NEW MONSTERS: defs.ts LEADERS). */
  private leaderOf(kind: MonsterKind): MonsterKind {
    return leaderKind(kind);
  }

  /** THE FIRST LEVELS (21:05): "That also means no words on monsters for dungeon 1". */
  private bareDungeon(): boolean {
    // (ENDLESS MODE: floor 1 as an endless level is without the lesson, his pick: its monsters carry words as any floor's)
    return FIRST_LEVELS.on && !this.practice && this.depth <= 1 && !(ENDLESS.on && this.inEndless);
  }

  /** `n` different words for a monster, never two of Flame, Frost and Lightning. */
  private drawWords(rng: RNG, n: number): WordId[] {
    const words: WordId[] = [];
    while (words.length < n) {
      // (THE CITY'S WORDS, Version 23.8: what may be found at this depth, `wordsAt`)
      const w = rng.pick(wordsAt(this.power));
      if (words.includes(w)) continue;
      if (ELEMENT_WORDS.includes(w) && words.some((o) => ELEMENT_WORDS.includes(o))) continue;
      words.push(w);
    }
    return words;
  }

  /**
   * A character's first dungeon: someone has fallen in a room half way along the main path, and
   * their satchel holds the character's first word. The owner's "scripted event, maybe a lootable
   * corpse with a guaranteed drop".
   */
  private placeBody(): void {
    const L = this.level;
    const f = L.floor;
    const path = f.rooms.filter((r) => r.path > 0 && r.kind !== 'boss');
    if (!path.length) return;
    const last = f.rooms.reduce((n, r) => Math.max(n, r.path), 0);
    const want = Math.max(1, Math.round(last / 2));
    let room = path[0];
    for (const r of path) if (Math.abs(r.path - want) < Math.abs(room.path - want)) room = r;
    // the open tile nearest the middle of the room with nothing standing or lying on it
    const cx = room.x + (room.w - 1) / 2;
    const cy = room.y + (room.h - 1) / 2;
    let tx = -1;
    let ty = -1;
    let bd = Infinity;
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        if (L.walk[y * f.w + x] !== 1 || L.props.some((p) => p.tx === x && p.ty === y)) continue;
        // (nobody lies on a flight of stairs; and the body lies on the room's own floor, not on a
        // terrace and not down in sunken floor: a new player is not sent to look for the stairs)
        if (f.stair && f.stair[y * f.w + x] !== 0) continue;
        if (f.height && f.height[y * f.w + x] !== 0) continue;
        const d = Math.hypot(x - cx, y - cy);
        if (d < bd) {
          bd = d;
          tx = x;
          ty = y;
        }
      }
    }
    if (tx < 0) return;
    const body: PropInst = { kind: 'body', tx, ty, x: tx + 0.5, y: ty + 0.5, solid: false, state: this.bodySearched ? 1 : 0, variant: 0 };
    L.props.push(body);
    L.body = body;
  }

  /**
   * A character's first dungeon: until they reach the fallen wordsmith they have no word. So
   * whatever stands nearer the way in than the body does (by the way one walks) hits softer. It is
   * still slow to kill with a bare attack: the need for a word is felt, not paid for in lives.
   */
  private softenFirstHalf(): void {
    const b = this.level.body;
    if (!b) return;
    const f = this.level.floor;
    const dist = flowField(this.level.walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, this.level.step);
    // (ten steps to a tile: the body's own room counts as the first half; THE FIRST LEVELS: the whole of the first dungeon, defs.ts FIRST_DUNGEON)
    const upTo = FIRST_LEVELS.on ? Infinity : dist[b.ty * f.w + b.tx] + 80;
    for (const m of this.monsters) {
      if (m.boss || dist[Math.floor(m.y) * f.w + Math.floor(m.x)] > upTo) continue;
      m.dmgMin *= GUIDE.softDmg;
      m.dmgMax *= GUIDE.softDmg;
    }
  }

  /**
   * THE FIRST LEVELS: THE FIRST PACK IS A SOFTBALL (the owner, 22:25; defs.ts, FIRST_DUNGEON.softball).
   * The pack nearest the way in, by the way one walks, gives way to a few slow skeletons that
   * barely hurt and fall to a tap or two of the bare quick attack: the movement and the tap are
   * learnt on them.
   */
  private softball(): void {
    const f = this.level.floor;
    const dist = flowField(this.level.walk, f.w, f.h, f.start.x, f.start.y, Infinity, undefined, this.level.step);
    let best = -1;
    let bd = Infinity;
    for (const m of this.monsters) {
      if (m.boss || m.packId < 0) continue;
      const d = dist[Math.floor(m.y) * f.w + Math.floor(m.x)];
      if (d < bd) {
        bd = d;
        best = m.packId;
      }
    }
    if (best < 0) return;
    const pack = this.monsters.filter((m) => m.packId === best);
    const cx = pack.reduce((a, m) => a + m.x, 0) / pack.length;
    const cy = pack.reduce((a, m) => a + m.y, 0) / pack.length;
    this.monsters = this.monsters.filter((m) => m.packId !== best);
    const S = FIRST_DUNGEON.softball;
    const life = Math.max(2, Math.round(this.bareHit() * S.hits));
    const def = MONSTERS.skeleton;
    const rng = new RNG((this.seed ^ 0x50f7ba11) >>> 0);
    for (const spot of scatter(this.level.walk, f.w, f.h, cx, cy, S.size, rng)) {
      const m = this.spawn('skeleton', spot.x, spot.y, best, 0, false, rng);
      m.maxLife = life;
      m.life = life;
      m.dmgMin = def.dmgMin * S.dmg;
      m.dmgMax = def.dmgMax * S.dmg;
      m.speed = S.speed;
    }
  }

  /**
   * `rank`: 0 an ordinary monster, 1 an elite (it has a word's power, and its name), 2 a guardian (the powerful one at the end of a side branch).
   * `lot`: the draw that decides whether it gives up a word when it dies (none: it does not).
   * `pack`: MONSTER PACKS, one of a blue or a yellow pack (fillPack), with the pack's words: then its
   * words are those, at full strength or (a minion) at half; a leader is of rank 1.
   */
  spawn(kind: MonsterKind, x: number, y: number, packId: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG, lot: RNG | null = null, pack: { rarity: 'blue' | 'leader' | 'minion'; words: readonly WordId[] } | null = null): Monster {
    const def = MONSTERS[kind];
    const elite = rank > 0;
    const champion = rank === 2;
    // (THE FIRST LEVELS, 21:05: "That also means no words on monsters for dungeon 1")
    const bare = this.bareDungeon();
    // (ENDLESS MODE: how many words a monster carries goes by its strength's depth, `power`; a lair boss's three by its floor)
    const P = this.power;
    const want = pack ? pack.words.length : bare ? 0 : boss ? (this.depth % 5 === 0 ? 3 : 2) : champion ? (P >= 10 ? 3 : P >= 3 ? 2 : 1) : elite ? (P >= 6 ? 2 : 1) : 0;
    const words: WordId[] = pack ? [...pack.words] : this.drawWords(rng, want);
    // (MONSTER PACKS: a minion has its leader's words at half strength)
    let half: WordId[] = pack && pack.rarity === 'minion' ? [...pack.words] : [];
    // What it gives up when it dies (the rune stones over its head). Words are scarce. A guardian or
    // a named monster gives up one of its own only sometimes. The boss always gives up one, and the
    // chance of more grows with how deep the dungeon is and with every word burned into it (the
    // owner: "let the boss have a guaranteed drop of at least 1 word. we can have the chance of
    // dropping more words increase with difficulty and rarity modifiers on dungeons"). A word
    // burned into a dungeon is spent: the boss does not hand it back. (MONSTER PACKS: of a blue or a
    // yellow pack, only the leader, as an elite; the others give up none.)
    const greater = boss && this.depth % 5 === 0;
    let carries: WordId[] = [];
    if (boss && words.length) {
      carries = [lot ? lot.pick(words) : words[0]];
      if (lot) {
        let p = TUNE.bossExtraPerDepth * (P - 1) + TUNE.bossExtraPerWord * this.dungeonWords.length + (greater ? TUNE.bossExtraGreater : 0);
        while (carries.length < 3 && p > 0 && lot.chance(Math.min(0.95, p))) {
          const spare = wordsAt(P).filter((w) => !carries.includes(w));
          carries.push(lot.pick(spare));
          p -= TUNE.bossThird;
        }
      }
    } else if (lot && words.length && (!pack || pack.rarity === 'leader')) {
      // (WORDS GROW WITH THE LEVELS, defs.ts WORD_GROWTH: the likelier the deeper)
      const p = (champion ? TUNE.guardianCarry : TUNE.eliteCarry) * wordGrowth(P);
      // (the more words are burned into the dungeon, the likelier: that is what burning them buys)
      if (lot.chance(Math.min(1, p * (1 + 0.3 * this.dungeonWords.length)))) carries = [lot.pick(words)];
    }
    // (THE FIRST LEVELS: before the ring is lit nothing gives up a word)
    if (!this.wordsFall()) carries = [];
    if (!bare) {
      for (const w of this.dungeonWords) if (!words.includes(w)) words.push(w);
      // (a word burned in at the gate is every monster's, a minion's at full strength too)
      half = half.filter((w) => !this.dungeonWords.includes(w));
    }
    const has = { words, half };
    // (ENDLESS MODE: on an endless level as strong as its depth, `power`, and 10% more for each endless level before it, `tough`)
    let life = def.life * (boss ? 1 + 0.4 * (P - 1) : scaleLife(P)) * this.tough;
    let dm = scaleDmg(P) * this.tough;
    let xp = def.xp * (1 + 0.25 * (P - 1));
    if (champion) {
      life *= TUNE.guardianLife;
      dm *= TUNE.guardianDmg;
      xp *= 6;
    } else if (elite) {
      life *= pack ? PACKS.leaderLife : TUNE.eliteLife;
      dm *= TUNE.eliteDmg;
      xp *= 4;
    } else if (pack && pack.rarity === 'blue') {
      life *= PACKS.blueLife;
      xp *= PACKS.blueLife;
    }
    if (greater) life *= 2;
    // (THE BOSSES' LIFE PAST THE WARDEN, his word of 17 Oct: each times his own)
    if (boss && BOSS_LIFE.on) life *= BOSS_LIFE.times[kind] ?? 1;
    const power = wordShare(has, 'power');
    if (power > 0) {
      life *= 1 + 0.3 * power;
      dm *= 1 + 0.4 * power;
    }
    let name = def.name;
    if (elite || boss || (pack && pack.rarity === 'blue')) {
      // (ACT 1: a boss whose name begins "The" keeps it first: "The Flame Unfinished", not "Flame The Unfinished")
      const base = champion ? 'Guardian' : def.name;
      const the = base.startsWith('The ') ? 'The ' : '';
      name = the + [...words.slice(0, want).map((w) => WORDS[w].front), base.slice(the.length)].join(' ');
    }
    // (THE FIRST FIVE FLOORS: the Fleshmancer, the Crypt's lair boss, is himself: only a Warden of a fifth floor is a "Greater" one)
    if (greater && kind === 'warden') name = 'Greater ' + name;
    const m: Monster = {
      id: this.nextId++, kind, name, x, y, r: def.radius * (champion ? TUNE.guardianSize : elite ? 1.12 : 1), fx: 0.7071, fy: 0.7071,
      life: Math.round(life), maxLife: Math.round(life), dmgMin: def.dmgMin * dm, dmgMax: def.dmgMax * dm,
      // (THE HEADSMAN MADE NEW: at his pictures' own pace, quick: HEADSMAN2_FIGHT)
      speed: (kind === 'headsman' && HEADSMAN2_FIGHT.on ? H2_GAIT.pace : def.speed) * (1 + 0.35 * wordShare(has, 'swift')), elite, champion, boss, words, carries,
      state: 'sleep', t: 0, cd: 0, packId, anim: 'idle', animT: rng.range(0, 3), flash: 0,
      burnT: 0, burnDps: 0, chillT: 0, chill: 0, frozenT: 0, freezeImmune: 0, poisonT: 0, poisonDps: 0, poisonN: 0,
      stunT: 0, staggerT: 0, staggerCd: 0, markT: 0, shockT: 0, shield: Math.round(Math.round(life) * GUARD.monster * wordShare(has, 'guarding')),
      lastSkill: -1, seen: false, barT: 0, phase: 0, atk: 0, dead: false, xp: Math.round(xp), seed: rng.next(),
    };
    if (pack) m.rarity = pack.rarity;
    if (half.length) m.half = half;
    this.monsters.push(m);
    // (ACT 1: as one of the descent's own comes into the world: rising out of the water, out of a rock pile)
    const r1 = ACT1.on ? act1Rules(kind) : null;
    if (r1 && r1.spawned) r1.spawned(this.bosses, m);
    return m;
  }

  /** MONSTER PACKS: what a minion's blow carries of its leader's words, to be weighed where it lands (hurtHero). None for any other. */
  halfOf(m: Monster): HalfWords | undefined {
    // (THE NEW MONSTERS: rallied by the skeleton champion's cry, its leader's words are whole for a while: RALLY)
    if (m.rallyT !== undefined && m.rallyT > 0) return undefined;
    return m.half && m.half.length ? { words: m.half, base: MONSTERS[m.kind].element } : undefined;
  }

  // ===========================================================================================
  // Frame update

  update(dt: number, c: Controls): void {
    if (this.over) return;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    if (this.introT > 0) this.introT = Math.max(0, this.introT - dt);
    // (ACT 2, THE HUSH: his words come back as it runs out)
    if (this.hushT > 0) {
      this.hushT = Math.max(0, this.hushT - dt);
      if (this.hushT === 0) {
        this.refresh();
        this.emit({ t: 'hushed', on: false });
      }
    }
    if (this.inDungeon) this.runTime += dt;
    this.bagFullT -= dt;
    this.denyT -= dt;
    this.runLater(dt);
    const px = this.hero.x;
    const py = this.hero.y;
    // (THE WAYS: on his way out of the level he does nothing more in it)
    if (this.leaving || this.arriving()) c = emptyControls();
    this.cameT += dt;
    this.updateHero(dt, c);
    if (this.over) return;
    // (a leap or a warp is not walking)
    const walked = this.hero.move ? 0 : Math.min(0.5, Math.hypot(this.hero.x - px, this.hero.y - py));
    if (TALENTS.on) this.updateTalents(dt, walked);
    this.updateVision(dt);
    this.updateDoors(dt);
    this.meetOutdoorBoss();
    if (this.level.holds) this.updateHolds();
    if (this.level.bells) this.updateBells(dt);
    // (THE WAYS: and where a way out of it has been taken, the rest is the next level's, from its next step)
    if (this.level.ways && this.updateWays(dt)) return;
    this.updateHazards(dt);
    this.updateFlow(dt);
    // (BINDING: what is held stands where it stood, whatever its own steps, a charge or a leap would have done; it strikes still)
    const pins = this.monsters.filter((m) => !m.dead && (m.bindT ?? 0) > 0).map((m) => [m, m.x, m.y] as const);
    this.updateMonsters(dt);
    for (const [m, x, y] of pins) {
      m.x = x;
      m.y = y;
      if (m.anim === 'walk') m.anim = 'idle';
    }
    if (this.risers.length) this.updateRisers(dt);
    this.updateProjectiles(dt);
    this.updateTraps(dt);
    this.updateVolleys(dt);
    this.updateOrbs(dt);
    this.updateFamiliars(dt);
    // (THE RANGER'S COMPANIONS: game/companions.ts)
    if (COMPANIONS.on && (this.hero.cls === 'ranger' || this.pets.length)) this.updatePets(dt);
    if (this.hero.cls === 'tinkerer' || this.golems.length || this.contraptions.length || this.vials.length || this.tars.length) this.updateTinkerer(dt);
    if (this.cannonballs.length) this.updateCannonballs(dt);
    if (this.hellwaves.length || this.souls.length || this.bound) this.updateWarlockTree(dt);
    if (this.hero.cls === 'brawler') this.updateBrawl(dt);
    this.updateZones(dt);
    if (this.perils.length || this.corpses.length) this.bosses.stepPerils(dt);
    this.updateDots(dt);
    if (this.ringWord) {
      this.ringWord.t -= dt;
      if (this.ringWord.t <= 0) this.giveRingWord();
    }
    this.updateDrops(dt);
    this.updateProps(c);
    if (this.practice) this.updatePractice(dt);
    if (this.level.town) this.updateTags();
    if (this.monsters.some((m) => m.dead)) this.monsters = this.monsters.filter((m) => !m.dead);
    if (this.guide) this.updateGuide(dt, walked);
  }

  // ===========================================================================================
  // THE WAYS THROUGH THE CRYPT (game/ways.ts, behind WAYS): the gate in town and the first floor's,
  // the stairwell down, the waypoints.

  /** A step of the ways of the level he is on. Returns true if he has gone out of it into another. */
  private updateWays(dt: number): boolean {
    const L = this.level;
    const W = L.ways;
    if (!W) return false;
    const h = this.hero;
    if (W.shaft) this.stepShaft(dt);
    if (this.leaving) {
      this.leaving.t += dt;
      const warp = this.leaving.to === 'warpTown' || this.leaving.to === 'warpBack';
      if (this.leaving.t < (this.leaving.to === 'up' ? SHAFT.up : warp ? WARP_SECS : CURTAIN_SECS)) return false;
      this.takeWay(this.leaving.to);
      return true;
    }
    // THE GATE OF THE WAY. In town it rises as he comes and falls as he goes off (no shake: it is
    // nothing to fear); on the first floor it stands open. Walking into its doorway while it is up
    // takes him through.
    if (W.gate >= 0) {
      const d = L.doors[W.gate];
      const at = doorMiddle(d.spot);
      const far = Math.hypot(at.x - h.x, at.y - h.y);
      // (EXITS: the first time after the Fleshmancer is beaten, its bars are struck off as he comes in sight of it (the
      // art chat's film, art/town_ways.ts unbarFilm), the gate staying shut until they are down)
      if (L.town && W.unbar !== undefined && W.unbar !== null) {
        if (W.unbar < 0 && far < UNBAR_SEEN) {
          W.unbar = 0;
          this.emit({ t: 'gateUnbarred' });
          this.msg('The gate is unbarred. Beyond it, the mountain road.', MSG.good);
        } else if (W.unbar >= 0) {
          W.unbar += dt;
          if (W.unbar >= UNBAR_SECS) {
            W.unbar = null;
            W.barred = false;
          }
        }
      }
      // (EXITS: barred, it does not rise; once, as he comes near, a line says so)
      if (L.town && W.barred) {
        if (!this.toldBarred && far < GATE_RISE_AT - 2) {
          this.toldBarred = true;
          this.msg('The gate is barred.', MSG.plain);
        }
      } else if (L.town && d.want === 0 && far < GATE_RISE_AT) this.raiseGate(d);
      else if (L.town && d.want === 1 && far > GATE_FALL_AT) {
        d.want = 0;
        for (const i of doorTiles(L.floor, d.spot)) {
          L.walk[i] = 0;
          L.open[i] = 0;
        }
        this.sfx('gateFall', 0.35);
      }
      const here = Math.floor(h.y) * L.floor.w + Math.floor(h.x);
      if (d.open > 0.85 && doorTiles(L.floor, d.spot).includes(here)) {
        // (EXITS: in town the gate leads out to the Quarry; the first floor's gate is the stairs up)
        this.leave(L.town ? (EXITS.on ? 'quarry' : 'gateIn') : 'gateOut');
        return false;
      }
    }
    // THE STAIRWELL, once open: stepping onto its top step takes him down (once it has broken open).
    if (W.stair && W.stair.open && W.stair.t !== undefined && W.stair.t < STAIR_OPENING) W.stair.t += dt;
    if (W.stair && W.stair.open && (W.stair.t ?? STAIR_OPENING) >= STAIR_OPENING && onTopStep(W.stair, h.x, h.y)) {
      // (EXITS: in town, the stairs down to floor 1)
      this.leave(L.town ? 'stairsIn' : 'down');
      return false;
    }
    // EXITS, FLOOR 4: the wall over the cave's mouth crumbling, then gone: walking into the mouth takes him down.
    const cv = W.cave;
    if (cv && cv.state === 'falling') {
      cv.t += dt;
      if (cv.t >= CAVE_OPENING) {
        cv.state = 'open';
        for (const i of doorTiles(L.floor, cv.spot)) {
          L.walk[i] = 1;
          L.open[i] = 1;
        }
        this.msg('A cave behind the wall. The way down.', MSG.good);
      }
    }
    if (cv && cv.state === 'open' && doorTiles(L.floor, cv.spot).includes(Math.floor(h.y) * L.floor.w + Math.floor(h.x))) {
      this.leave('down');
      return false;
    }
    // EXITS, IN TOWN: the cage coming up into the hall's corner with him, then opening: he walks out of it.
    if (W.shaft && W.shaft.state === 'arriving') {
      W.shaft.t += dt;
      if (W.shaft.t >= TOWN_ARRIVE) W.shaft.state = 'still';
    }
    // THE MINE SHAFT, once its cage is down: walking into the cage takes him up to town. He stands in
    // the middle of it, looking out of its gate, and nothing touches him on the way up.
    const sh = W.shaft;
    if (sh && sh.state === 'down' && Math.floor(h.x) === sh.x && Math.floor(h.y) === sh.y) {
      this.leave('up');
      sh.state = 'going';
      sh.t = 0;
      h.x = sh.x + 0.5;
      h.y = sh.y + 0.5;
      h.fx = Math.SQRT1_2;
      h.fy = Math.SQRT1_2;
      h.invuln = Math.max(h.invuln, SHAFT.up + 1);
      return false;
    }
    // ACT 1: THE WAY ON, once awake: walking into its light takes him on (game/ways.ts, Ways.onward).
    const on = W.onward;
    // (EXITS, FLOORS 6 TO 10: the art chat's: its film plays from the boss's death; then it is open, what it threw out
    // lying where it fell, and stepping onto its way in takes him on: game/ways.ts, ONWARD)
    const a1 = W.a1;
    if (on && on.awake && a1) {
      if (!a1.open && (on.warpAt === null || this.time - on.warpAt >= (ONWARD[a1.floor]?.secs ?? 0))) {
        a1.open = true;
        const taken = new Set<number>([Math.floor(h.y) * L.floor.w + Math.floor(h.x)]);
        for (const m of this.monsters) if (!m.dead) taken.add(Math.floor(m.y) * L.floor.w + Math.floor(m.x));
        for (const i of thrownTiles(L.floor, a1)) if (!taken.has(i)) L.walk[i] = 0;
        // (a door, a grille: its way in walked into once it is open)
        if (ONWARD[a1.floor]?.shutTakes) for (const i of takesTiles(L.floor, a1)) if (!L.props.some((p) => p.solid && p.ty * L.floor.w + p.tx === i)) L.walk[i] = 1;
        this.msg(this.depth >= 10 && !(ENDLESS.on && this.inEndless) ? 'The siege magic falters. The way home is open.' : 'The way on is open.', MSG.good);
      }
      if (a1.open && onTakes(L.floor, a1, h.x, h.y)) {
        this.leave('on');
        return false;
      }
    } else if (on && on.awake && Math.hypot(on.x - h.x, on.y - h.y) < WAY_USE) {
      this.leave('on');
      return false;
    }
    // THE WAYPOINT wakes the first time he comes near it (the town's is awake while there is a floor to warp back to).
    if (W.way && L.town) W.way.awake = this.wayDepth >= 2;
    else if (W.way && !W.way.awake && Math.hypot(W.way.x - h.x, W.way.y - h.y) < WAY_WAKE) {
      W.way.awake = true;
      this.sfx('power', 0.5);
    }
    return false;
  }

  /** THE WAYS: he is on his way out of the level. Whatever attack he was making is let go of, and costs nothing (as a dodge breaks one off): he does nothing more here. */
  private leave(to: WayTo): void {
    const h = this.hero;
    this.leaving = { to, t: 0 };
    if (h.channel) this.endChannel(true);
    h.windup = null;
    h.channel = null;
    h.queued = null;
    h.attackT = 0;
    h.combo = 0;
    h.comboT = 0;
  }

  /**
   * THE MINE SHAFT, a step of its cage: coming down (the screen kicked as it strikes the catches, and
   * again as it bounces), then down, its gate open, its middle the way in; going up with him (the gate
   * slamming shut, the cable snapping taut). The times are the films' own (ways.ts, SHAFT).
   */
  private stepShaft(dt: number): void {
    const L = this.level;
    const sh = L.ways?.shaft;
    if (!sh || (sh.state !== 'coming' && sh.state !== 'going')) return;
    const was = sh.t;
    sh.t += dt;
    const jolts = sh.state === 'coming' ? SHAFT.downJolts : SHAFT.upJolts;
    jolts.forEach((j, k) => {
      if (was < j && sh.t >= j) {
        this.emit({ t: 'shake', amount: sh.state === 'coming' ? (k === 0 ? 7 : 4) : k === 0 ? 2 : 4 });
        this.sfx(sh.state === 'going' && k === 0 ? 'gateFall' : 'slam', sh.state === 'coming' && k === 0 ? 1 : 0.6);
      }
    });
    if (sh.state === 'coming' && sh.t >= SHAFT.down) {
      sh.state = 'down';
      const i = sh.y * L.floor.w + sh.x;
      L.walk[i] = 1;
      // (the cage is the hero's way out: no monster steps into it, as none passes a shut door: game/doors.ts)
      if (!L.shut) L.shut = new Uint8Array(L.floor.w * L.floor.h);
      L.shut[i] = 1;
      // (what fell into it as he died is put out before its gate)
      for (const d of this.drops) if (Math.floor(d.x) === sh.x && Math.floor(d.y) === sh.y) d.y = sh.y + 1.5;
      this.msg('The cage has come down the shaft. The way up.', MSG.good);
    }
  }

  /** THE FIRST FIVE FLOORS: a tile that something stood on and has gone from (a moment's cart, run off down its rails: render/pieces.ts) is walked on now. */
  freeTile(i: number): void {
    const L = this.level;
    if (i < 0 || i >= L.walk.length || L.floor.tiles[i] !== T_FLOOR) return;
    for (const p of L.props) if (p.kind === 'piece' && p.ty * L.floor.w + p.tx === i) p.solid = false;
    if (!L.props.some((p) => p.solid && p.ty * L.floor.w + p.tx === i)) L.walk[i] = 1;
  }

  /** THE WAYS: what lies at the end of the way he has taken. */
  private takeWay(to: WayTo): void {
    this.leaving = null;
    if (to === 'holdIn' || to === 'holdOut') {
      this.throughHoldDoor(to === 'holdIn');
      return;
    }
    // (ENDLESS MODE: from an endless level, every way on, the stairwell, the mine shaft and the way on alike, to the next)
    if (ENDLESS.on && this.inEndless && (to === 'up' || to === 'on' || to === 'down')) {
      this.nextEndless();
      return;
    }
    if (to === 'up') {
      // (THE FIRST FIVE FLOORS: up the mine shaft from the fifth floor, out to town: the Crypt cleared)
      this.meta.bestDepth = Math.max(this.meta.bestDepth, this.depth);
      this.cleared++;
      const from = this.depth;
      // (ACT 1, THE DESCENT: the Prison cleared, the town's waypoint takes him on to the first floor of the descent)
      const wasBarred = this.wayDepth < 6;
      if (ACT1.on && from === 5) this.wayDepth = Math.max(this.wayDepth, 6);
      // (EXITS: up into the hall's corner, in the cage; the gate in the back wall unbarred, the way out to the Quarry)
      this.enterTown(EXITS.on ? 'cage' : null);
      this.cameT = 0;
      // (its bars struck off the first time he comes in sight of it: updateWays)
      const W = this.level.ways;
      if (EXITS.on && wasBarred && this.wayDepth >= 6 && W) {
        W.barred = true;
        W.unbar = -1;
        this.toldBarred = true;
      }
      this.msg(FLOOR_NAMES.on ? `${floorTitle(from).level} cleared` : `Dungeon ${from} cleared`, MSG.good);
      return;
    }
    if (to === 'on' && this.level.town) {
      // (EXITS, game/camp.ts: out of the camp by its barricaded street, into the city: floor 11)
      this.depth = 11;
      this.inEndless = false;
      this.enterDungeon();
      this.cameT = 0;
      return;
    }
    if (to === 'on') {
      // (ACT 1, THE DESCENT: on down the mountain to the next floor; from the tenth, the Fen, home to town: the siege broken)
      this.meta.bestDepth = Math.max(this.meta.bestDepth, this.depth);
      this.cleared++;
      if (this.depth === 10 || this.depth >= lastFloor()) {
        const from = this.depth;
        // (ACT 2, THE HUSH: the siege broken, the town's waypoint takes him on into the city, floor 11; from the fifteenth, the
        // library, home: his doc's payoff, the words flying home and the High City's gates shut)
        if (act2Floor(from + 1)) this.wayDepth = Math.max(this.wayDepth, from + 1);
        // (ENDLESS MODE: the last floor built beaten, the endless levels are open to him: the town's waypoint takes him on into the first)
        const opens = ENDLESS.on && from >= lastFloor() && this.endless === 0;
        if (opens) {
          this.endless = 1;
          this.endlessFloor = endlessFloorFor(this.seed, 1, from);
        }
        // (EXITS: from the Fen, down into the city: in through the camp's gate)
        this.enterTown(EXITS.on && from === 10 ? 'gate' : null);
        this.cameT = 0;
        this.sfx('portal');
        this.msg(from === 10 ? `${floorTitle(from).level} cleared. The siege is broken.` : `${floorTitle(from).level} cleared. The stolen words fly home. High above, the gates of the High City swing shut.`, MSG.good);
        if (opens) this.msg(ENDLESS_OPENS, MSG.word);
        return;
      }
      this.depth++;
      this.enterDungeon();
      this.cameT = 0;
      return;
    }
    // (coming into a floor sounds as it always has: `enterDungeon`; coming into town, as a portal home)
    if (to === 'down') {
      // (a floor cleared, as a dungeon was when its portal was taken: `leaveDungeon`)
      this.meta.bestDepth = Math.max(this.meta.bestDepth, this.depth);
      this.cleared++;
      this.depth++;
      this.enterDungeon();
      this.cameT = 0;
    } else if (to === 'gateIn') {
      this.depth = 1;
      this.inEndless = false;
      this.enterDungeon('gate');
      this.cameT = 0;
    } else if (to === 'stairsIn') {
      // (EXITS: down the town's stairs, to the first floor, in at its doorway, the stairs up)
      this.depth = 1;
      this.inEndless = false;
      this.enterDungeon('gate');
      this.cameT = 0;
    } else if (to === 'quarry') {
      // (EXITS: out of the town's gate, onto the mountain: the Quarry, the first floor of the descent)
      this.depth = 6;
      this.inEndless = false;
      this.enterDungeon();
      this.cameT = 0;
    } else if (to === 'gateOut') {
      // (EXITS: the first floor's doorway is the stairs up: he comes up out of the town's)
      this.enterTown(EXITS.on ? 'stairs' : 'gate');
      this.cameT = 0;
      this.sfx('portal');
    } else if (to === 'warpTown') {
      this.enterTown('way');
      this.sfx('portal');
    } else if (ENDLESS.on && this.endless > 0) {
      // (ENDLESS MODE: the town's waypoint takes him back to the endless level he reached: his pick, “Pick up where you left off”)
      this.depth = this.endlessFloor;
      this.inEndless = true;
      this.enterDungeon('way');
    } else {
      this.depth = Math.max(2, this.wayDepth);
      this.enterDungeon('way');
    }
  }

  /** ENDLESS MODE: an endless level's boss beaten, on down to the next: another floor, at random, never the one just beaten; 10% harder. */
  private nextEndless(): void {
    const was = this.endless;
    this.meta.bestEndless = Math.max(this.meta.bestEndless ?? 0, was);
    this.cleared++;
    this.endless = was + 1;
    this.endlessFloor = endlessFloorFor(this.seed, this.endless, this.depth);
    this.depth = this.endlessFloor;
    this.inEndless = true;
    this.enterDungeon();
    this.cameT = 0;
    this.msg(`${endlessName(was)} cleared`, MSG.good);
  }

  /** THE WAYS: the boss is dead, and the stairwell opens in the floor of his hall. Nobody and nothing is left on its opening. */
  private openStair(st: StairWay): void {
    const L = this.level;
    st.open = true;
    for (const i of stairTiles(L.floor, st)) L.walk[i] = 0;
    // (Whoever and whatever is on its opening, its top step with it, is put aside to the nearer of
    // its long sides: the boss's hoard, which falls where he fell, the middle of his hall, is not
    // lost down it, nor left where the hero must step to take it; and he is not taken down by
    // standing where it opened. The ground a tile round it is plain floor: ways.ts, `stairSpots`.)
    const along = (x: number, y: number): number => (st.way === 'x' ? x - st.x : y - st.y);
    const across = (x: number, y: number): number => (st.way === 'x' ? y - st.y : x - st.x);
    const on = (x: number, y: number): boolean => along(x, y) > -0.35 && along(x, y) < STAIR_LONG + 0.1 && across(x, y) > -0.3 && across(x, y) < STAIR_WIDE + 0.3;
    const aside = (p: { x: number; y: number }): void => {
      if (!on(p.x, p.y)) return;
      const a = Math.max(-0.4, Math.min(STAIR_LONG + 0.4, along(p.x, p.y)));
      const c = across(p.x, p.y) < STAIR_WIDE / 2 ? -0.5 : STAIR_WIDE + 0.5;
      p.x = st.way === 'x' ? st.x + a : st.x + c;
      p.y = st.way === 'x' ? st.y + c : st.y + a;
    };
    aside(this.hero);
    for (const d of this.drops) aside(d);
    for (const m of this.monsters) if (!m.dead) aside(m);
    // (and what lay flat there, bones and rubble, is gone down it)
    L.props = L.props.filter((p) => p.solid || !on(p.x, p.y));
    // (the floor breaking open: THE FIRST FIVE FLOORS, the art chat's film of it, its flagstones dropping
    // into the dark one after another and the dust bursting up, the screen kicked at each: render/dress.ts.
    // Where there is no film of it, the placeholder it had before: a burst of stone and dust, a shake: main.ts)
    const mid = stairMiddle(st);
    st.t = 0;
    this.emit({ t: 'stairOpens', x: mid.x, y: mid.y });
    this.msg('A stairwell opens in the floor. The way down.', MSG.good);
  }

  /** THE WAYS: how dark the screen is, 0 to 1: darkening as he goes down a stairwell or through a gate, lightening as he comes into the next level. (A warp needs none: its column of light hides him.) */
  curtain(): number {
    const l = this.leaving;
    if (l && (l.to === 'down' || l.to === 'on' || l.to === 'holdIn' || l.to === 'holdOut' || l.to === 'gateIn' || l.to === 'gateOut' || l.to === 'stairsIn' || l.to === 'quarry')) return Math.min(1, l.t / CURTAIN_SECS);
    // (up the shaft: the cage goes up into the dark, and over the ride's last moments the screen darkens)
    if (l && l.to === 'up') return Math.max(0, Math.min(1, (l.t - (SHAFT.up - CURTAIN_SECS)) / CURTAIN_SECS));
    return Math.max(0, 1 - this.cameT / CURTAIN_SECS);
  }

  /** EXITS (game/camp.ts): his town is the camp inside Vellum's gate: he has come down into the city from floor 10. */
  campTown(): boolean {
    return EXITS.on && WAYS.on && ACT1.on && !this.practice && this.wayDepth >= 11;
  }

  /** EXITS: he is coming up into town in the cage (he does nothing until it has opened). */
  arriving(): boolean {
    return this.level.town && this.level.ways?.shaft?.state === 'arriving';
  }

  /** THE WAYS: the waypoint he is standing on, awake, if any. */
  private wayHere(): boolean {
    const W = this.level.ways;
    const h = this.hero;
    return !!W && !!W.way && W.way.awake && Math.hypot(W.way.x - h.x, W.way.y - h.y) < WAY_USE;
  }

  // ===========================================================================================
  // Doors and gates (game/doors.ts). A level has none unless the map-maker laid them (DOORS.on).

  private updateDoors(dt: number): void {
    const L = this.level;
    if (L.doors.length === 0) return;
    const h = this.hero;
    // (A DOOR OPENS FOR THE HERO when he comes near, and for nobody else. Until Version 18.6 it opened
    // for a monster that was awake too; the owner, 7 Oct 2026, 20:16: "I don’t want monsters to open
    // doors". As it begins to open it holds monsters no longer, and sight and shots pass it.)
    for (const d of stepDoors(L.doors, [h], dt)) {
      if (L.shut) {
        for (const i of doorWay(L.floor, d.spot)) {
          L.shut[i] = 0;
          L.open[i] = 1;
        }
        // (and what lies beyond it is seen at once, not at the next look round)
        this.visionT = 0;
      }
      const at = doorMiddle(d.spot);
      this.emit({ t: 'door', x: at.x, y: at.y, kind: 'open' });
      this.sfx('door', 0.5);
    }
    // THE BOSS'S GATE: up until the hero is well inside the hall with the boss alive; then down, until the boss is dead
    for (const d of L.doors) {
      if (d.spot.kind !== 'bossgate') continue;
      const alive = this.boss !== null && !this.boss.dead;
      if (d.want === 1 && alive && this.wellInside(d, h.x, h.y)) {
        this.dropGate(d);
        if (BOSS_INTRO.on && this.boss) this.bossIntro(this.boss);
      } else if (d.want === 0 && !alive) this.raiseGate(d);
    }
    // (THE MIX) A LEVER'S GATE, DOWN: the first time one is seen from near, a line says what it is
    for (const d of L.doors) {
      if (d.spot.kind !== 'gate' || d.want !== 0 || d.told) continue;
      const at = doorMiddle(d.spot);
      if (Math.hypot(at.x - h.x, at.y - h.y) > TUNE.aggroRadius || !doorTiles(L.floor, d.spot).some((i) => L.visible[i] === 1)) continue;
      d.told = true;
      this.msg('A gate bars the way. Its lever is near.', MSG.omen);
    }
    // (THE TRAPS) A SEALED DOOR: the first time one is seen from near, a line says what it wants
    for (const d of L.doors) {
      if (d.spot.kind !== 'worddoor' || d.want !== 0 || d.told || !d.spot.word) continue;
      const at = doorMiddle(d.spot);
      if (Math.hypot(at.x - h.x, at.y - h.y) > TUNE.aggroRadius || !doorTiles(L.floor, d.spot).some((i) => L.visible[i] === 1)) continue;
      d.told = true;
      this.msg(`A sealed door. It wants ${WORDS[d.spot.word].name.toUpperCase()}.`, MSG.omen);
    }
    this.updateLocks();
  }

  /**
   * (THE TRAPS) A HIT FROM ABILITY `skill` reaches everything within `rad` of (x, y): A SEALED DOOR
   * in its reach opens if the ability carries the door's word, in front or behind. (Called where
   * a blow, a blast, a shot or what burns on the ground breaks barrels and urns: `breakProps`; and
   * where a shot of the hero's meets a wall.) It swings open as a door does, and stays open; from
   * then on its tile is open to whatever walks, flies, is shot or looks.
   */
  private unseal(skill: number, x: number, y: number, rad: number): void {
    const L = this.level;
    if (L.doors.length === 0 || skill < 0) return;
    for (const d of L.doors) {
      const w = d.spot.word;
      if (d.spot.kind !== 'worddoor' || d.want !== 0 || !w) continue;
      const at = doorMiddle(d.spot);
      // (the door's tile: a tile across, so a hit that reaches within half a tile of its middle, and a little more, is on it)
      if (Math.hypot(at.x - x, at.y - y) > rad + 0.65) continue;
      if (!this.fronts(skill).includes(w) && !this.behinds(skill).includes(w)) continue;
      d.want = 1;
      d.told = true;
      for (const i of doorWay(L.floor, d.spot)) {
        L.walk[i] = 1;
        L.open[i] = 1;
      }
      this.visionT = 0;
      this.emit({ t: 'door', x: at.x, y: at.y, kind: 'open' });
      this.emit({ t: 'spark', x: at.x, y: at.y, el: WORDS[w].element ?? 'phys', n: 10 });
      this.sfx('door', 0.8);
      this.sfx('word', 0.6);
      this.msg(`The ${WORDS[w].name.toUpperCase()} seal breaks.`, MSG.word);
    }
  }

  // ===========================================================================================
  // (THE TRAPS, game/traps.ts) Spike floors and dart walls. A level has none unless they were laid.

  private updateHazards(dt: number): void {
    const L = this.level;
    if (L.hazards.length === 0) return;
    const h = this.hero;
    for (const z of L.hazards) {
      if (z.spot.kind === 'spikes') this.stepSpikes(z, h);
      else this.stepDarts(z, h, dt);
    }
  }

  /**
   * A SPIKE FLOOR: up, its spikes hurt whatever walks on the patch, once each time they rise: the
   * hero (a share of their life, before armour; not while leaping or rolling, nor while nothing
   * can hurt them), and every monster but a bat, which flies over (a share of its own life). A
   * boss is never hurt by one: none is laid in a boss's hall.
   */
  private stepSpikes(z: HazardInst, h: Hero): void {
    const up = spikeAt(z.spot, this.time).at === 'up';
    if (up && !z.wasUp) {
      z.hit.length = 0;
      const tx = z.spot.x + z.spot.w / 2;
      const ty = z.spot.y + z.spot.h / 2;
      if (Math.hypot(tx - h.x, ty - h.y) < 9) this.sfx('trapSet', 0.35);
    }
    z.wasUp = up;
    if (!up || this.over) return;
    if (!z.hit.includes(-1) && !h.move && h.invuln <= 0 && onHazard(z.spot, h.x, h.y)) {
      z.hit.push(-1);
      this.hurtHero(h.d.maxLife * SPIKE.share, 'phys', [], null, 'spikes');
    }
    for (const m of this.monsters) {
      if (m.dead || m.kind === 'bat' || m.boss || z.hit.includes(m.id) || !onHazard(z.spot, m.x, m.y)) continue;
      z.hit.push(m.id);
      this.damageMonster(m, Math.max(1, Math.round(m.maxLife * SPIKE.share)), 'phys', false, -1);
    }
  }

  /**
   * A DART WALL: the hero steps on the plate, and if it is ready it clicks; a moment later the
   * first of three darts leaves the slot, all of them at the place where the hero stood as it
   * clicked (the click is the warning: who moves at once is missed). Ready again `DART.rearm`
   * seconds after the click. (A monster on the plate does not set it off.)
   */
  private stepDarts(z: HazardInst, h: Hero, dt: number): void {
    z.ready = Math.max(0, z.ready - dt);
    z.pressed = Math.max(0, z.pressed - dt);
    if (z.left > 0) {
      z.next -= dt;
      if (z.next <= 0) {
        this.fireDart(z);
        z.left--;
        z.next = DART.gap;
      }
    }
    if (this.over || z.ready > 0 || z.left > 0 || !onHazard(z.spot, h.x, h.y)) return;
    z.left = DART.count;
    z.next = DART.first;
    z.ready = DART.rearm;
    z.pressed = 0.6;
    z.aimX = h.x;
    z.aimY = h.y;
    this.sfx('click', 0.9);
  }

  /** One dart leaves a dart wall's slot, at the place the hero stood as the plate clicked. */
  private fireDart(z: HazardInst): void {
    const o = slotMouth(z.spot);
    let dx = z.aimX - o.x;
    let dy = z.aimY - o.y;
    const n = Math.hypot(dx, dy) || 1;
    dx /= n;
    dy /= n;
    this.projectiles.push({
      x: o.x, y: o.y, vx: dx * DART.speed, vy: dy * DART.speed, r: DART.r, dist: DART.reach,
      hostile: true, trap: true, dmg: DART.share, element: 'phys', look: 'dart', pierce: false, hit: [],
      volley: false, skill: -1, trail: 0, words: [], runed: false, clouded: false, age: 0, from: 'a dart', n: 0,
    });
    this.sfx('shot', 0.5);
  }

  /**
   * (THE MIX) THE ROOMS THAT LOCK. A gate hangs in every doorway of such a room, up. THEY FALL when
   * the hero is inside the room, `LOCK_CLEAR` tiles and more from the middle of every one of its
   * doorways, and a living monster of the room's own packs is inside it with him; THEY RISE when
   * no living monster of the room's own packs is inside the room. (Clear of the doorways, not
   * "so far past each wall that has one": a hero who kept to the walls could then walk from the
   * way in to a way on and never be far enough from both walls at once.) Only those of the pack
   * that are INSIDE are counted, so that one which was drawn out of the room before the gates
   * fell cannot keep them down for good (it cannot come back in, and he cannot go out to it).
   */
  private updateLocks(): void {
    const L = this.level;
    const f = L.floor;
    const h = this.hero;
    for (const r of f.rooms) {
      if (!r.locks) continue;
      const gates = L.doors.filter((d) => d.spot.kind === 'trapgate' && d.spot.room === r.id);
      if (gates.length === 0) continue;
      const within = (m: { x: number; y: number }): boolean => m.x >= r.x && m.y >= r.y && m.x < r.x + r.w && m.y < r.y + r.h;
      const pack = this.monsters.some((m) => !m.dead && m.packId >= 0 && m.packId < f.packs.length && f.packs[m.packId].roomId === r.id && within(m));
      const down = gates.some((d) => d.want === 0);
      if (!down) {
        const clear = (d: DoorInst): boolean => {
          const at = doorMiddle(d.spot);
          return Math.hypot(at.x - h.x, at.y - h.y) >= LOCK_CLEAR;
        };
        if (!pack || this.over || !within(h) || !gates.every(clear)) continue;
        for (const d of gates) this.dropGate(d);
        this.msg('The gates fall.', MSG.omen);
      } else if (!pack) {
        for (const d of gates) if (d.want === 0) this.raiseGate(d);
        this.msg('The gates rise.', MSG.good);
      }
    }
  }

  /**
   * (THE MIX) THE HERO PULLS A LEVER, by walking up to it: its gate rises, and stays up. (The lever
   * knows its gate by the room the gate bars: `Floor.levers`. One that knows none raises every
   * lever's gate of the level.)
   */
  private pullLever(p: PropInst): void {
    const L = this.level;
    p.state = 1;
    const spot = (L.floor.levers ?? []).find((q) => q.x === p.tx && q.y === p.ty);
    let raised = 0;
    for (const d of L.doors) {
      if (d.spot.kind !== 'gate' || d.want !== 0 || (spot && d.spot.room !== spot.room)) continue;
      this.raiseGate(d);
      raised++;
    }
    this.emit({ t: 'spark', x: p.x, y: p.y, el: 'phys', n: 6 });
    this.sfx('door', 0.8);
    if (raised > 0) this.msg('A gate rises.', MSG.good);
    // (what the gate hid is seen at once from wherever it can be)
    this.visionT = 0;
  }

  /**
   * IS THIS MONSTER SHUT IN: inside a room whose door is still shut, with the hero outside that
   * room? THEN NOTHING OF THE HERO'S REACHES IT: no blow, no blast, no arc of lightning, nothing
   * that burns on the ground. (Since Version 18.7. A shut door stops a shot and sight because its
   * tile is shut in the level's `open` grid: but a blast goes by its radius and asks no wall's
   * leave, and one set off against the door, a rain of arrows or an orb's wave, reached what
   * stood just behind it. Struck, the pack woke, came to the door, was held there, and could be
   * killed where it stood: the very thing a shut door is shut to prevent.) So nothing in a room
   * is hurt or woken until its door is opened.
   *   A room has ONE WAY IN, and its door stands in it: what is in a room whose door is shut
   *   cannot come at the hero, and he cannot have come in. SHOULD A ROOM EVER HAVE A SECOND WAY
   *   IN, THIS ASKS THE WRONG THING (a monster that can come at him must be one he can hurt):
   *   tests/doors.test.ts holds the two together, and will say so.
   */
  private shutIn(m: { x: number; y: number }): boolean {
    const L = this.level;
    if (L.doors.length === 0) return false;
    const h = this.hero;
    for (const d of L.doors) {
      // (a door that is shut; and THE MIX: a lever's gate that is down. Not the boss's gate, nor a locking room's: when those are down the hero is inside)
      if ((d.spot.kind !== 'door' && d.spot.kind !== 'gate' && d.spot.kind !== 'worddoor') || d.want !== 0) continue;
      const r = L.floor.rooms.find((q) => q.id === d.spot.room);
      if (!r || m.x < r.x || m.y < r.y || m.x >= r.x + r.w || m.y >= r.y + r.h) continue;
      if (h.x < r.x || h.y < r.y || h.x >= r.x + r.w || h.y >= r.y + r.h) return true;
    }
    return false;
  }

  /** Is this place in the room a gate is the doorway of, and far enough past the gate's line that it may fall behind whoever stands there? */
  private wellInside(d: DoorInst, x: number, y: number): boolean {
    const r = this.level.floor.rooms.find((q) => q.id === d.spot.room);
    if (!r || x < r.x || y < r.y || x >= r.x + r.w || y >= r.y + r.h) return false;
    return insideBy(d.spot, x, y) >= GATE_INSIDE;
  }

  /** A gate falls (the boss's; THE MIX: a locking room's): from now on its doorway is wall to whatever walks, flies or is shot. A monster caught in the doorway is put down just inside. */
  private dropGate(d: DoorInst): void {
    const L = this.level;
    const f = L.floor;
    d.want = 0;
    const tiles = doorTiles(f, d.spot);
    for (const i of tiles) {
      L.walk[i] = 0;
      L.open[i] = 0;
    }
    for (const m of this.monsters) {
      if (m.dead || !tiles.includes(Math.floor(m.y) * f.w + Math.floor(m.x))) continue;
      const nx = d.spot.alongX ? m.x : d.spot.plane - d.spot.out * (0.5 + m.r);
      const ny = d.spot.alongX ? d.spot.plane - d.spot.out * (0.5 + m.r) : m.y;
      if (this.free(L.walk, nx, ny, m.r)) {
        m.x = nx;
        m.y = ny;
      }
    }
    const at = doorMiddle(d.spot);
    this.emit({ t: 'door', x: at.x, y: at.y, kind: 'fall' });
    this.emit({ t: 'shake', amount: 3 });
    this.sfx('gateFall');
  }

  /**
   * (BOSS_INTRO) WHERE THE BOSS WAITS: the open floor of his hall furthest in from its gate, a tile and
   * more clear of its walls and of what stands there, near the line straight in from the gate. Null
   * where the hall has no gate.
   */
  private backOfHall(): { x: number; y: number } | null {
    const L = this.level;
    const f = L.floor;
    const gate = L.doors.find((d) => d.spot.kind === 'bossgate');
    const hall = f.rooms.find((r) => r.kind === 'boss');
    if (!gate || !hall) return null;
    const s = gate.spot;
    const mid = s.a + 1.5;
    let best: { x: number; y: number } | null = null;
    let bs = -Infinity;
    for (let y = hall.y; y < hall.y + hall.h; y++) {
      for (let x = hall.x; x < hall.x + hall.w; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        if (!this.free(L.walk, px, py, 1.3)) continue;
        const score = insideBy(s, px, py) - 0.35 * Math.abs((s.alongX ? px : py) - mid);
        if (score > bs) {
          bs = score;
          best = { x: px, y: py };
        }
      }
    }
    return best;
  }

  /**
   * (BOSS_INTRO) THE BOSS WAITS: until his gate has fallen behind the hero and his line is said, he
   * stands where he is, and nothing harms him.
   */
  bossWaits(m: Monster): boolean {
    if (!BOSS_INTRO.on || !m.boss) return false;
    if (this.introT > 0) return true;
    // (ACT 1: out on the open ground, until the hero has come into his ground)
    if (this.level.land) return !this.bossMet;
    return this.level.doors.some((d) => d.spot.kind === 'bossgate' && d.want === 1);
  }

  /**
   * (BOSS_INTRO, ACT 1: game/act1_layout.ts) OUT ON THE OPEN GROUND THE BOSS WAITS for the hero to come into
   * his ground (its area: well inside it, or within a few tiles of him), and then says his line as a boss
   * whose gate has fallen does; he is woken by it.
   */
  private meetOutdoorBoss(): void {
    const L = this.level;
    const b = this.boss;
    if (this.bossMet || !L.land || !b || b.dead) return;
    const h = this.hero;
    const area = L.land.areas.find((a) => a.role === 'boss');
    const inside = area ? blobDist(area.blob, h.x, h.y) < 0.8 : false;
    if (!inside && Math.hypot(b.x - h.x, b.y - h.y) > 6) return;
    this.bossMet = true;
    if (b.state === 'sleep') this.wakeUp(b);
    // (FLOOR 13'S DOUBLE BOSS: the two wake together)
    const other = partnerOf(this, b);
    if (other && other.state === 'sleep') this.wakeUp(other);
    if (BOSS_INTRO.on) this.bossIntro(b);
  }

  // ===========================================================================================
  // ACT 2, THE HUSH: THE BELLS (game/bells.ts: his design, the planning chat's picks, and their numbers)

  /** (ACT 2, THE BELLS) While the Hush raises its own: what rises comes up awake and at him (none of floor 14's patients lies down in a bed). */
  risingInHush = false;

  /** (ACT 2, THE BELLS) Everything that came into the world since `from` (Game.monsters' length then) is the Hush's: awake, at him, and counted as its own (a sergeant's brace of hounds with him). */
  private hushOwns(B: BellsState, from: number): void {
    for (let i = from; i < this.monsters.length; i++) {
      const m = this.monsters[i];
      m.state = 'chase';
      if (!B.ids.includes(m.id)) B.ids.push(m.id);
    }
  }

  /** The level's Bells as they stand at first, asleep, where its map-maker and dresser laid them (none: no Bells here). */
  private bellsMade(): void {
    const L = this.level;
    const B = act2Floor(this.depth) ? makeBells(L) : null;
    if (B) L.bells = B;
    else delete L.bells;
  }

  /** A hit of the hero's at (x, y), `rad` its reach: struck, the Muffled Bell starts the Hush; a bell awake rings. */
  private bellsStruck(x: number, y: number, rad: number): void {
    const B = this.level.bells;
    if (!B || B.phase === 'won' || B.phase === 'lost') return;
    const near = (p: { x: number; y: number }): boolean => Math.hypot(p.x - x, p.y - y) <= rad + BELLS_TUNE.strike;
    if (B.phase === 'asleep') {
      if (near(B.plan.muffled)) this.bellsStart();
      return;
    }
    for (let i = 0; i < B.plan.bells.length; i++) if (!B.rung[i] && near(B.plan.bells[i])) this.bellRung(i);
  }

  /** The Muffled Bell struck: its gag torn off, the Hush pours out of it over its ground, and every bell wakes. The clock begins. */
  private bellsStart(): void {
    const L = this.level;
    const B = L.bells;
    if (!B || B.phase !== 'asleep') return;
    B.phase = 'on';
    B.t = 0;
    B.next = 1.5;
    if (B.muffled >= 0) L.props[B.muffled].state = 1;
    for (const k of B.props) if (k >= 0) L.props[k].state = 1;
    const n = B.plan.bells.length;
    this.emit({ t: 'bells', what: 'start', x: B.plan.muffled.x, y: B.plan.muffled.y, n });
    this.sfx('bossRoar', 0.5);
    this.msg(`The Hush pours out of the Muffled Bell. Ring the ${n} bells before it is too late!`, MSG.omen);
  }

  /** Bell `i` rung: it knocks back what is near it, chips the Hush back round it, and a tough one comes at it (or, the last, the Hush shatters). */
  private bellRung(i: number): void {
    const L = this.level;
    const B = L.bells;
    if (!B || B.phase !== 'on' || B.rung[i]) return;
    B.rung[i] = true;
    const b = B.plan.bells[i];
    if (B.props[i] >= 0) L.props[B.props[i]].state = 2;
    const k = B.rung.filter(Boolean).length;
    const n = B.rung.length;
    // (the ring knocks back what is near it: shoved out from the bell, a moment staggered)
    for (const m of this.monsters) {
      if (m.dead || m.boss) continue;
      const dx = m.x - b.x;
      const dy = m.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d > BELLS_TUNE.knockR) continue;
      const ux = d > 0.01 ? dx / d : 1;
      const uy = d > 0.01 ? dy / d : 0;
      const grid = m.kind === 'bat' ? L.open : L.walk;
      for (let s = 0; s < 6; s++) this.slide(m, Math.min(m.r, 0.42), (ux * BELLS_TUNE.knock) / 6, (uy * BELLS_TUNE.knock) / 6, grid);
      m.staggerT = Math.max(m.staggerT, 0.45);
    }
    chipAt(B, L, b.x, b.y);
    this.emit({ t: 'bells', what: 'ring', x: b.x, y: b.y, k, n });
    this.sfx('portal', 0.7);
    if (k >= n) {
      this.bellsWon();
      return;
    }
    this.msg(`A bell rings: ${k} of ${n}.`, MSG.word);
    this.bellTough(b.x, b.y, k);
  }

  /** The tough one a bell's ringing calls (his 05:28): a yellow pack's leader of the floor's medium kind, tougher for each bell rung before. */
  private bellTough(x: number, y: number, k: number): void {
    const L = this.level;
    const B = L.bells;
    if (!B) return;
    const rng = new RNG((Math.imul(this.seed, 31) + k * 7919 + this.depth * 104729 + B.risen) >>> 0);
    const own = ACT2_GUARD[act2Floor(this.depth)] ?? 'watch';
    const kind: MonsterKind = act1Ready(own) ? own : act1Ready('hushed') ? 'hushed' : 'dagger';
    const at = scatter(L.walk, L.floor.w, L.floor.h, x, y + 1, 1, rng)[0] ?? { x, y: y + 1 };
    const words = this.bareDungeon() ? [] : this.drawWords(rng, k >= 3 ? 2 : 1);
    const from = this.monsters.length;
    this.risingInHush = true;
    const m = this.spawn(this.leaderOf(kind), at.x, at.y, BELLS_TOUGH_ID(k), 1, false, rng, null, { rarity: 'leader', words });
    this.risingInHush = false;
    m.life = m.maxLife = Math.round(m.maxLife * (1 + BELLS_TUNE.tough * (k - 1)));
    this.hushOwns(B, from);
    this.emit({ t: 'bells', what: 'rise', x: m.x, y: m.y });
  }

  /** All rung in time: every bell peals at once, the Hush shatters (what it raised falls), and the Muffled Bell bursts in a big loot explosion. */
  private bellsWon(): void {
    const L = this.level;
    const B = L.bells;
    if (!B) return;
    B.phase = 'won';
    B.since = 0;
    for (const k of B.props) if (k >= 0) L.props[k].state = 2;
    // (what the Hush raised goes down with it: the Hush leaves them, and what each would drop it drops)
    for (const id of B.ids) {
      const m = this.monsters.find((o) => o.id === id && !o.dead);
      if (m) this.damageMonster(m, m.life + m.shield + 1, 'phys', false, -1);
    }
    const at = { x: B.plan.muffled.x, y: B.plan.muffled.y + 1 };
    const n = B.plan.bells.length;
    if (MELD.on) this.addDrop('dust', at.x, at.y, Math.round((BELLS_TUNE.dust + Math.floor(n / 2)) * (LOOT2.on ? LOOT2.dust : 1)), null, null);
    for (let i = 0; i < n; i++) this.addDrop('item', at.x, at.y, 0, this.rollGear(i < 2 ? 4 : 2), null);
    this.addDrop('gold', at.x, at.y, this.rng.int(BELLS_TUNE.gold, BELLS_TUNE.gold * 2) * Math.max(1, this.power) * n * (LOOT2.on ? LOOT2.gold : 1), null, null);
    if (this.wordsFall() && this.rng.chance(BELLS_TUNE.word * wordGrowth(this.power))) this.addDrop('word', at.x, at.y, 0, null, this.rng.pick(wordsAt(this.power)));
    this.emit({ t: 'bells', what: 'won', x: B.plan.muffled.x, y: B.plan.muffled.y, n });
    this.sfx('rare');
    this.msg('Every bell peals at once. The Hush shatters!', MSG.good);
  }

  /** The clock run out: the Hush lifts with no explosion; what the enemies dropped is kept, and those still up fight on. */
  private bellsLost(): void {
    const L = this.level;
    const B = L.bells;
    if (!B) return;
    B.phase = 'lost';
    B.since = 0;
    B.plan.bells.forEach((_, i) => {
      if (!B.rung[i] && B.props[i] >= 0) L.props[B.props[i]].state = 0;
    });
    this.emit({ t: 'bells', what: 'lost', x: B.plan.muffled.x, y: B.plan.muffled.y });
    this.msg('The Hush lifts. The bells fall silent.', MSG.foe);
  }

  /** The Bells, a step: the clock, and the Hush raising more and more of the floor's own the longer it lasts (his 05:27 and 05:31). */
  private updateBells(dt: number): void {
    const L = this.level;
    const B = L.bells;
    if (!B) return;
    if (B.phase === 'won' || B.phase === 'lost') {
      const was = B.since;
      B.since += dt;
      // (and a while after, the bells ring out and hang still: render/act1_pieces.ts bellFrame, BELL_STILL)
      if (was < BELLS_TUNE.ringOut && B.since >= BELLS_TUNE.ringOut) {
        for (const k of B.props) if (k >= 0 && L.props[k].state === 2) L.props[k].state = BELL_STILL;
        if (B.muffled >= 0 && L.props[B.muffled].state === 1) L.props[B.muffled].state = BELL_STILL;
      }
      return;
    }
    if (B.phase !== 'on' || this.over) return;
    B.t += dt;
    if (B.t >= B.limit) {
      this.bellsLost();
      return;
    }
    if (B.t < B.next) return;
    B.next = B.t + gapAt(B.t);
    B.ids = B.ids.filter((id) => this.monsters.some((m) => m.id === id && !m.dead));
    const room = BELLS_TUNE.most - B.ids.length;
    if (room <= 0) return;
    const rng = new RNG((Math.imul(this.seed, 131) + Math.floor(B.t * 10) * 7919 + B.risen * 104729) >>> 0);
    const h = this.hero;
    const at = riseSpot(B, L, h.x, h.y, rng);
    if (!at) return;
    const want = Math.min(room, sizeAt(B.t));
    const kind = act2Pack(this.depth, rng, 'normal').kind;
    const spots = scatter(L.walk, L.floor.w, L.floor.h, at.x, at.y, want, rng);
    const more = 1 + BELLS_TUNE.lifeRamp * B.t;
    const pack = BELLS_PACK_ID(B.risen);
    for (const s of spots) {
      if (!inHush(B, L.floor.w, s.x, s.y)) continue;
      const from = this.monsters.length;
      this.risingInHush = true;
      const m = this.spawn(kind, s.x, s.y, pack, 0, false, rng);
      this.risingInHush = false;
      m.life = m.maxLife = Math.round(m.maxLife * more);
      this.hushOwns(B, from);
      B.risen++;
      this.emit({ t: 'bells', what: 'rise', x: m.x, y: m.y });
    }
  }

  // ===========================================================================================
  // ACT 1: THE CULT'S STRONGHOLDS (game/act1_holds.ts)

  /** The level's strongholds as they stand at first, and their two guards each before its door. */
  private holdsMade(seed: number): void {
    const L = this.level;
    const land = L.land;
    if (!land || !land.holds.length) return;
    L.holds = land.holds.map((q) => ({ words: [], open: false, entered: false, won: false, pack: HOLD_PACK_ID(q.n) }));
    const rng = new RNG((seed ^ 0x51ed270b) >>> 0);
    const lot = new RNG((seed ^ 0x1b873593) >>> 0);
    for (const q of land.holds) {
      // (one of the two always carries a word: the word the door asks for can be won at its foot)
      const carrier = rng.int(0, 1);
      q.guards.forEach((at, k) => {
        const kind = HOLD_GUARDS[k % HOLD_GUARDS.length];
        const words = this.bareDungeon() ? [] : this.drawWords(rng, this.power >= 6 ? 2 : 1);
        // (where the mock-up stood it, or the nearest place a body may stand: the altar, the braziers and banners are about it)
        const spot = this.free(L.walk, at.x, at.y, 0.42) ? at : scatter(L.walk, L.floor.w, L.floor.h, at.x, at.y, 1, rng)[0] ?? at;
        const m = this.spawn(kind, spot.x, spot.y, HOLD_GUARD_ID(q.n, k), 1, false, rng, null, { rarity: 'leader', words });
        if (k === carrier && words.length && this.wordsFall()) m.carries = [lot.pick(words)];
        // (they stand facing the way up to the door)
        m.fx = Math.SQRT1_2;
        m.fy = Math.SQRT1_2;
      });
    }
  }

  /** The stronghold whose altar the hero stands at, its door shut; -1: none. */
  altarNear(): number {
    const L = this.level;
    const land = L.land;
    if (!land || !L.holds || L.town) return -1;
    const h = this.hero;
    for (const q of land.holds) {
      const st = L.holds[q.n];
      if (st && !st.open && Math.hypot(q.altar.x - h.x, q.altar.y - h.y) < HOLD_TUNE.near) return q.n;
    }
    return -1;
  }

  /** Why `word` may not be laid on stronghold `n`'s altar, or null. */
  altarProblem(n: number, word: WordId): string | null {
    const st = this.level.holds?.[n];
    if (!st || st.open) return 'The door is open';
    if (!(this.hero.words[word] > 0)) return 'No spare word';
    if (WORDS[word].kind === 'meld') return 'A melded word goes on attacks only';
    if (WORDS[word].kind === 'rank') return 'A ranked word goes on attacks only';
    if (st.words.length >= HOLD_TUNE.most) return `At most ${HOLD_TUNE.most} words`;
    if (st.words.includes(word)) return 'Already on the altar';
    if (WORDS[word].element && st.words.some((w) => WORDS[w].element)) return 'One element per stronghold';
    return null;
  }

  /** Lay a spare word on stronghold `n`'s altar (it is burned when its door is opened; until then it may be taken back). */
  altarWord(n: number, word: WordId): string | null {
    const why = this.altarProblem(n, word);
    if (why) return why;
    this.hero.words[word]--;
    this.level.holds![n].words.push(word);
    this.sfx('word');
    return null;
  }

  /** Take word `i` back off stronghold `n`'s altar. */
  unaltarWord(n: number, i: number): void {
    const st = this.level.holds?.[n];
    const w = st?.words[i];
    if (!st || !w || st.open) return;
    st.words.splice(i, 1);
    this.hero.words[w] = (this.hero.words[w] ?? 0) + 1;
    this.sfx('click');
  }

  /** OPEN THE DOOR of stronghold `n`: the words on its altar are burned, its seal breaks, and its door stands open. False: none was given. */
  openHold(n: number): boolean {
    const L = this.level;
    const st = L.holds?.[n];
    const q = L.land?.holds.find((o) => o.n === n);
    if (!st || !q || st.open || st.words.length === 0) return false;
    st.open = true;
    for (const p of L.props) if (p.kind === 'piece' && p.name === HOLD.gate(L.act1?.floor ?? 6) && p.tx === q.gx && p.ty === q.gy) p.state = 1;
    // (ALTAR_GOES: the altar is gone, its tile floor again)
    if (ALTAR_GOES.on) {
      const k = L.props.findIndex((p) => p.kind === 'piece' && p.name === HOLD.altar && p.tx === q.gx && p.ty === q.gy + 1);
      if (k >= 0) {
        const p = L.props[k];
        L.props.splice(k, 1);
        // (it stands over the corner of two tiles, both its own (game/act1_dress.ts): both are floor again. The owner, 23 Oct
        // 2026, 11:38 (Pacific): “The altars are still on the way of the entrance to the strongholds after you unlock the
        // door”: the second was left solid, unseen, before the door)
        for (const tx of [p.tx, p.tx - 1]) if (!L.props.some((o) => o.solid && o.tx === tx && o.ty === p.ty)) L.walk[p.ty * L.floor.w + tx] = 1;
        this.emit({ t: 'burst', x: q.altar.x, y: q.altar.y, r: 1.2, el: 'fire', style: 'shock' });
      }
    }
    this.emit({ t: 'burst', x: q.gx, y: q.gy + 0.2, r: 1.6, el: 'fire', style: 'shock' });
    this.emit({ t: 'shake', amount: 4 });
    this.sfx('power', 0.9);
    this.msg(`The altar takes ${st.words.length === 1 ? 'the word' : `${st.words.length} words`}. The door's seal breaks.`, MSG.word);
    return true;
  }

  /** A step of the strongholds: through an open door into the hall, out of the hall by its threshold; its last fight won. */
  private updateHolds(): void {
    const L = this.level;
    const land = L.land;
    if (!land || !L.holds || this.leaving) return;
    const h = this.hero;
    for (const q of land.holds) {
      const st = L.holds[q.n];
      if (!st) continue;
      // (into the door: the two tiles of its doorway)
      if (st.open && Math.floor(h.y) === q.gy && (Math.floor(h.x) === q.gx - 1 || Math.floor(h.x) === q.gx) && h.y < q.gy + 0.6) {
        this.holdGoing = q.n;
        this.leave('holdIn');
        this.sfx('door', 0.6);
        return;
      }
      // (out by the hall's threshold, the middle of its near side)
      const r = q.inside;
      if (h.x >= r.x && h.x < r.x + r.w && h.y >= r.y && h.y < r.y + r.h && h.y > r.y + r.h - HOLD_TUNE.out && Math.abs(h.x - (r.x + r.w / 2)) < 1.3) {
        this.holdGoing = q.n;
        this.leave('holdOut');
        this.sfx('door', 0.5);
        return;
      }
      // (HOLD_WAVES: a wave dead, the next comes; the last dead, it is won)
      if (HOLD_WAVES.on && st.entered && !st.won && st.wave) {
        const packs = st.packs ?? [];
        if (st.coming || this.monsters.some((m) => !m.dead && packs.includes(m.packId))) continue;
        if (st.wave < HOLD_WAVES.n) {
          st.coming = true;
          const n = q.n;
          this.after(HOLD_WAVES.gap, () => this.holdWave(n, (st.wave ?? 0) + 1));
          continue;
        }
      }
      // (its last fight won: the reward)
      if (st.entered && !st.won && !(HOLD_WAVES.on && st.wave && st.wave < HOLD_WAVES.n) && !this.monsters.some((m) => !m.dead && (m.packId === st.pack || (st.packs ?? []).includes(m.packId)))) {
        st.won = true;
        const n = st.words.length;
        const at = q.fight;
        if (MELD.on && HOLD_TUNE.dust[n] > 0) this.addDrop('dust', at.x, at.y, Math.round(HOLD_TUNE.dust[n] * (LOOT2.on ? LOOT2.dust : 1)), null, null);
        const items = LOOT2.on ? LOOT2.hold[n] : HOLD_TUNE.items[n];
        for (let i = 0; i < items; i++) this.addDrop('item', at.x, at.y, 0, this.rollGear(LOOT2.on ? (i < 2 ? 4 : 2) : i === 0 ? 2 : 1), null);
        this.addDrop('gold', at.x, at.y, this.rng.int(15, 30) * Math.max(1, this.power) * n * (LOOT2.on ? LOOT2.gold : 1), null, null);
        this.sfx('rare');
        this.msg('The stronghold falls.', MSG.good);
      }
    }
  }

  /** Through a stronghold's door (the screen dark): into its hall, its last fight met the first time; or out of it, before its door. */
  private throughHoldDoor(inward: boolean): void {
    const L = this.level;
    const q = L.land?.holds.find((o) => o.n === this.holdGoing);
    const st = L.holds?.[this.holdGoing];
    this.holdGoing = -1;
    if (!q || !st) return;
    const h = this.hero;
    this.cameT = 0;
    if (inward) {
      h.x = q.entry.x;
      h.y = q.entry.y;
      h.fx = -Math.SQRT1_2;
      h.fy = -Math.SQRT1_2;
      if (!st.entered) {
        st.entered = true;
        this.holdFight(q.n);
      }
    } else {
      h.x = q.gx - 1.5;
      h.y = q.gy + 1.5;
      h.fx = Math.SQRT1_2;
      h.fy = Math.SQRT1_2;
    }
    // (what is beyond is seen at once)
    this.visionT = 0;
  }

  /** A stronghold's last room: a yellow pack of the floor's own medium kind round its obelisk, every one with the words burned at its door, harder for each past the first. (HOLD_WAVES: its first wave.) */
  private holdFight(n: number): void {
    if (HOLD_WAVES.on) {
      this.holdWave(n, 1);
      return;
    }
    const L = this.level;
    const q = L.land?.holds.find((o) => o.n === n);
    const st = L.holds?.[n];
    if (!q || !st) return;
    const own = HOLD_PACK[L.act1?.floor ?? 6] ?? 'brute';
    const kind: MonsterKind = act1Ready(own) ? own : 'brute';
    const rng = new RNG((Math.imul(this.seed, 31) + n * 7919 + this.depth) >>> 0);
    const f = L.floor;
    const spots = scatter(L.walk, f.w, f.h, q.fight.x, q.fight.y + 1.2, HOLD_TUNE.pack, rng);
    const lead = this.bareDungeon() ? [] : this.drawWords(rng, 2).filter((w) => !st.words.includes(w));
    const more = 1 + HOLD_TUNE.life * Math.max(0, st.words.length - 1);
    spots.forEach((s, i) => {
      const m = this.spawn(i === 0 ? this.leaderOf(kind) : kind, s.x, s.y, st.pack, i === 0 ? 1 : 0, false, rng, null, { rarity: i === 0 ? 'leader' : 'minion', words: lead });
      // (the words burned at the door are every one's, whole, as a word burned into a dungeon at the gate is)
      for (const w of st.words) if (!m.words.includes(w)) m.words.push(w);
      if (m.half) m.half = m.half.filter((w) => !st.words.includes(w));
      m.life = m.maxLife = Math.round(m.maxLife * more);
      m.state = 'chase';
    });
  }

  /**
   * (HOLD_WAVES) A wave of a stronghold's hall comes: its packs (WAVE_MAKE), of the floor's own creatures and the cult, each
   * spread round the hall's far side, every monster with the words burned at the door, harder for each word past the first
   * and for each wave on.
   */
  private holdWave(n: number, k: number): void {
    const L = this.level;
    const q = L.land?.holds.find((o) => o.n === n);
    const st = L.holds?.[n];
    if (!q || !st || st.won) return;
    st.wave = k;
    st.coming = false;
    st.packs = [];
    const rng = new RNG((Math.imul(this.seed, 31) + n * 7919 + k * 104729 + this.depth) >>> 0);
    const f = L.floor;
    const more = (1 + HOLD_TUNE.life * Math.max(0, st.words.length - 1)) * (1 + HOLD_WAVES.life * (k - 1));
    const make = WAVE_MAKE[Math.min(k, WAVE_MAKE.length) - 1];
    if (k > 1) {
      this.msg(`Wave ${k} of ${HOLD_WAVES.n}`, MSG.foe);
      this.sfx('bossRoar', 0.5);
    }
    make.forEach((pk, j) => {
      const pid = st.pack * 100 + k * 10 + j;
      st.packs!.push(pid);
      let kind: MonsterKind;
      let size: number;
      if (pk.own) {
        const own = HOLD_PACK[L.act1?.floor ?? 6] ?? 'brute';
        kind = act1Ready(own) ? own : 'brute';
        size = HOLD_TUNE.pack;
      } else {
        const p = act1Pack(this.depth, rng, 'normal');
        kind = p.kind;
        size = p.size;
      }
      // (each pack its own side of the hall's fight, spread round it)
      const a = (j / make.length) * Math.PI * 2 + rng.range(-0.4, 0.4);
      const spots = scatter(L.walk, f.w, f.h, q.fight.x + Math.cos(a) * 1.6, q.fight.y + 1.2 + Math.sin(a) * 1.2, size, rng);
      const rarity = pk.rarity;
      const words = this.bareDungeon() ? [] : rarity === 'yellow' ? this.drawWords(rng, 2).filter((w) => !st.words.includes(w)) : rarity === 'blue' ? this.drawWords(rng, 1).filter((w) => !st.words.includes(w)) : [];
      spots.forEach((s, i) => {
        const lead = rarity === 'yellow' && i === 0;
        const m = this.spawn(lead ? this.leaderOf(kind) : kind, s.x, s.y, pid, lead ? 1 : 0, false, rng, null, rarity === 'plain' ? null : { rarity: rarity === 'blue' ? 'blue' : lead ? 'leader' : 'minion', words });
        // (the words burned at the door are every one's, whole, as a word burned into a dungeon at the gate is)
        for (const w of st.words) if (!m.words.includes(w)) m.words.push(w);
        if (m.half) m.half = m.half.filter((w) => !st.words.includes(w));
        m.life = m.maxLife = Math.round(m.maxLife * more);
        m.state = 'chase';
        m.cd = 0.5 + 0.15 * i;
      });
    });
  }

  /** (BOSS_INTRO) For tests and playtests that strike the boss down by hand: his wait over, as if the hero had walked into his hall and heard him out (his gate down, his line said). */
  bossReady(): void {
    this.bossMet = true;
    for (const d of this.level.doors) if (d.spot.kind === 'bossgate' && d.want === 1 && this.boss && !this.boss.dead) this.dropGate(d);
    this.introT = 0;
  }

  /** (BOSS_INTRO) His gate down behind the hero, the boss stands and says his line, and his name comes up. */
  private bossIntro(m: Monster): void {
    this.introT = BOSS_INTRO.secs;
    const lines = BOSS_LINES[m.kind];
    const line = lines && lines.length ? lines[Math.floor(this.rng.next() * lines.length)] : null;
    // (FLOOR 13'S DOUBLE BOSS: both their names come up across the screen)
    const other = partnerOf(this, m);
    const name = other ? `${m.name} and ${other.name.replace(/^The /, 'the ')}` : m.name;
    this.emit({ t: 'bossIntro', name, line, x: m.x, y: m.y, secs: BOSS_INTRO.secs });
  }

  /** A gate goes up, and its doorway is floor again (the boss is dead; THE MIX: a lever is pulled, a locking room's pack is dead). */
  private raiseGate(d: DoorInst): void {
    const L = this.level;
    d.want = 1;
    for (const i of doorTiles(L.floor, d.spot)) {
      L.walk[i] = 1;
      L.open[i] = 1;
    }
    const at = doorMiddle(d.spot);
    this.emit({ t: 'door', x: at.x, y: at.y, kind: 'rise' });
    this.sfx('gateRise', 0.8);
  }

  private after(t: number, fn: () => void): void {
    this.later.push({ t, fn });
  }

  private runLater(dt: number): void {
    if (this.later.length === 0) return;
    const due: (() => void)[] = [];
    for (const l of this.later) {
      l.t -= dt;
      if (l.t <= 0) due.push(l.fn);
    }
    if (due.length) {
      this.later = this.later.filter((l) => l.t > 0);
      for (const fn of due) fn();
    }
  }

  // ===========================================================================================
  // Small helpers

  emit(e: GameEvent): void {
    this.events.push(e);
  }

  msg(text: string, color: string = MSG.plain): void {
    this.emit({ t: 'msg', text, color });
  }

  sfx(name: Sfx, vol?: number): void {
    this.emit({ t: 'sfx', name, vol });
  }

  /**
   * True when a body of radius r fits at (x, y) on the given grid.
   *
   * LEDGES AND STAIRS (height.ts): on a level that has them, a body that walks lies over ground
   * of one height only: every tile under it must be one it could step to from the tile its middle
   * is on. So a ledge is as solid to it as a wall, and a flight of stairs is entered at its ends.
   * Whatever flies goes by the open grid, and is not asked.
   */
  free(grid: Uint8Array, x: number, y: number, r: number, flat = false, held = false): boolean {
    const f = this.level.floor;
    // (DOORS: `held` is a monster's step. A shut door holds a monster, walking or flying; nobody else. game/doors.ts)
    const shut = held ? this.level.shut : null;
    const x0 = Math.floor(x - r);
    const x1 = Math.floor(x + r);
    const y0 = Math.floor(y - r);
    const y1 = Math.floor(y + r);
    // (`flat`: the walls and the things alone, as if the floor were all of one height)
    const step = flat || grid === this.level.open ? null : this.level.step;
    const hx = Math.floor(x);
    const hy = Math.floor(y);
    const cut = f.cut;
    // (DOORS: the stone on either side of a door holds a body off by no more than PIER_HOLD of a
    // tile, however big the body: a door is as wide for a brute as for anybody. game/doors.ts)
    const pier = r > PIER_HOLD ? this.level.pier : null;
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return false;
        const i = ty * f.w + tx;
        if (shut && shut[i] === 1) return false;
        if (pier && pier[i] === 1 && (tx < Math.floor(x - PIER_HOLD) || tx > Math.floor(x + PIER_HOLD) || ty < Math.floor(y - PIER_HOLD) || ty > Math.floor(y + PIER_HOLD))) continue;
        // (a tile cut corner to corner: its floor half may be stood on, though the walk grid has
        // it shut; its wall half holds a body off by the body's own half width: game/cut.ts)
        if (cut && cut[i] !== 0) {
          if (bodyInWall(cut[i], tx, ty, x, y, r)) return false;
          if (f.tiles[i] !== T_FLOOR) {
            // (a cut WALL tile is nothing in its other half: nobody's middle is ever in one)
            if (tx === hx && ty === hy) return false;
            // (and its shape alone holds a body off: the rule of height is not asked of it. It is
            // no floor, so no step leads to it, and a body whose corner reached over the back of
            // a slanting wall would be refused on every level that has heights, and catch at each
            // tile as it slid along the wall.)
            continue;
          }
        } else if (grid[i] === 0) return false;
        if (step && !mayOverlap(step, f.w, hx, hy, tx, ty)) {
          // (DOORS: a big body in a door lies over the floor beyond the corners of the stone beside it.
          // The rule of height would refuse that, as it refuses a body round the corner of a ledge:
          // of the two ways round to that tile, one is through the stone. There is no ledge at a
          // door, and the stone holds the body off by its own rule above.)
          if (!(pier && tx !== hx && ty !== hy && (pier[hy * f.w + tx] === 1 || pier[ty * f.w + hx] === 1))) return false;
        }
      }
    }
    return true;
  }

  /** Is this place a pit (a hole, the Ledge Road's drop, the Fen's water: what flies goes over it, nobody stands in it)? */
  private pitAt(x: number, y: number): boolean {
    const f = this.level.floor;
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && f.tiles[ty * f.w + tx] === T_PIT;
  }

  /** Is this place floor that can be stood on (not a pit, not a wall)? */
  private onFloor(x: number, y: number): boolean {
    const f = this.level.floor;
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h || f.tiles[ty * f.w + tx] !== T_FLOOR) return false;
    // (the wall half of a tile cut corner to corner is not floor)
    return !(f.cut && inWall(f, x, y));
  }

  /**
   * On a level with ledges: could a body walk straight from one place to the other (no ledge, no
   * pit, nothing that stands in the way)? Asked before a monster makes straight for the hero: where
   * it could not, it goes round by the way the flow field knows.
   */
  walksStraight(x0: number, y0: number, x1: number, y1: number): boolean {
    const L = this.level;
    const step = L.step;
    if (!step) return true;
    const f = L.floor;
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(dist / 0.2));
    let ax = Math.floor(x0);
    let ay = Math.floor(y0);
    for (let k = 1; k <= n; k++) {
      const bx = Math.floor(x0 + ((x1 - x0) * k) / n);
      const by = Math.floor(y0 + ((y1 - y0) * k) / n);
      if (bx === ax && by === ay) continue;
      if (bx < 0 || by < 0 || bx >= f.w || by >= f.h || L.walk[by * f.w + bx] === 0) return false;
      if (Math.abs(bx - ax) > 1 || Math.abs(by - ay) > 1 || !mayOverlap(step, f.w, ax, ay, bx, by)) return false;
      ax = bx;
      ay = by;
    }
    return true;
  }

  /**
   * LEDGES AND PITS: where a move that goes OVER them ends: the farthest place along a straight
   * line, within `range`, where the hero can stand, whatever its height. It flies over pits and
   * up and down ledges; a wall stops it, and so does a thing that stands on the floor. null if
   * there is nowhere to stand along it.
   */
  private overPoint(dx: number, dy: number, range: number): { x: number; y: number } | null {
    const h = this.hero;
    const L = this.level;
    const f = L.floor;
    let best: { x: number; y: number } | null = null;
    for (let d = 0.15; d <= range + 1e-6; d += 0.15) {
      const x = h.x + dx * d;
      const y = h.y + dy * d;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) break;
      const i = ty * f.w + tx;
      // (a wall, the wall half of a cut tile, or something solid that stands on the floor)
      if (!this.isOpen(x, y) || (f.tiles[i] === T_FLOOR && L.walk[i] === 0 && !(f.cut && f.cut[i] !== 0))) break;
      if (this.free(L.walk, x, y, TUNE.heroRadius)) best = { x, y };
    }
    return best;
  }

  /**
   * The step (dx, dy), which a wall has refused: if a tile cut corner to corner is what the body
   * would have run into, the part of the step that runs along its cut is taken instead.
   */
  private slideAlongCut(b: { x: number; y: number }, r: number, dx: number, dy: number, grid: Uint8Array, held = false): void {
    const f = this.level.floor;
    const cut = f.cut;
    if (!cut) return;
    const nx = b.x + dx;
    const ny = b.y + dy;
    // the cut tile the body would have reached into, of those it would lie over
    let c = 0;
    for (let ty = Math.floor(ny - r); ty <= Math.floor(ny + r) && c === 0; ty++) {
      for (let tx = Math.floor(nx - r); tx <= Math.floor(nx + r); tx++) {
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
        const i = ty * f.w + tx;
        if (cut[i] !== 0 && bodyInWall(cut[i], tx, ty, nx, ny, r)) {
          c = cut[i];
          break;
        }
      }
    }
    if (c === 0) return;
    const a = alongCut(c);
    const along = dx * a.x + dy * a.y;
    if (Math.abs(along) < 1e-9) return;
    const sx = a.x * along;
    const sy = a.y * along;
    if (this.free(grid, b.x + sx, b.y + sy, r, false, held)) {
      b.x += sx;
      b.y += sy;
    }
  }

  /** DOORS: does a body lie over the tile of a door that is shut? */
  private overShut(shut: Uint8Array, x: number, y: number, r: number): boolean {
    const f = this.level.floor;
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) {
      for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
        if (tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && shut[ty * f.w + tx] === 1) return true;
      }
    }
    return false;
  }

  /**
   * Move a body, sliding along walls. `held`: the body is a monster, which a shut door holds (the
   * hero, and whatever else is moved, is not held by one: a door opens before he reaches it). A
   * monster that already lies over a shut door's tile, set down there by the dice, is not held:
   * it walks out of it, either way.
   */
  slide(b: { x: number; y: number }, r: number, dx: number, dy: number, grid: Uint8Array, held = false): void {
    if (held) {
      const shut = this.level.shut;
      held = shut !== null && !this.overShut(shut, b.x, b.y, r);
    }
    const okX = dx !== 0 && this.free(grid, b.x + dx, b.y, r, false, held);
    if (okX) b.x += dx;
    const okY = dy !== 0 && this.free(grid, b.x, b.y + dy, r, false, held);
    if (okY) b.y += dy;
    if ((okX || dx === 0) && (okY || dy === 0)) return;
    // A WALL THAT SLANTS (a tile cut corner to corner) IS SLID ALONG: the step it refused is taken
    // along the cut instead, at the pace the step had along it (a wall that runs along the grid
    // needs none of this: the other half of the step slides along it by itself).
    if (this.level.floor.cut) {
      if (dx !== 0 && !okX) this.slideAlongCut(b, r, dx, 0, grid, held);
      if (dy !== 0 && !okY) this.slideAlongCut(b, r, 0, dy, grid, held);
    }
    // A BODY ASTRIDE A LEDGE IS NOT HELD THERE. Nothing in the game puts one there (a body walks
    // onto ground of one height, a swipe lands on it, a monster is put down on the middle of a
    // tile): but one that is (set down by a test, or by a mistake not yet made) could take no
    // step at all, every step from there being astride still. It walks as if the floor were all
    // of one height until it is on ground of one height again.
    if (!this.level.step || grid === this.level.open || this.free(grid, b.x, b.y, r) || !this.free(grid, b.x, b.y, r, true)) return;
    if (dx !== 0 && !okX && this.free(grid, b.x + dx, b.y, r, true, held)) b.x += dx;
    if (dy !== 0 && !okY && this.free(grid, b.x, b.y + dy, r, true, held)) b.y += dy;
  }

  /**
   * DOORS: A HERO WHO WALKS AT THE STONE BESIDE A DOOR IS EASED INTO THE DOOR. A door is one tile
   * wide in a hallway of three, and the keys walk a hero in eight directions of the screen, none of
   * which runs along a hallway: without this he would stop against the stone and have to feel for
   * the opening. If his step along x (or y) was refused, and it was the stone beside a door that
   * refused it, he is moved sideways, at the pace of that step, toward the nearest place within
   * DOOR_HELP from which the step can be taken: into line with the opening. (Only the hero: a
   * monster finds its way by the middles of the tiles.)
   */
  private intoDoor(b: { x: number; y: number }, r: number, dx: number, dy: number, wasX: number, wasY: number): void {
    const L = this.level;
    const pier = L.pier;
    if (!pier) return;
    const f = L.floor;
    const ease = (alongX: boolean): void => {
      const want = alongX ? dx : dy;
      if (want === 0 || (alongX ? b.x !== wasX : b.y !== wasY)) return;
      const ax = alongX ? b.x + want : b.x;
      const ay = alongX ? b.y : b.y + want;
      // (was it the stone beside a door that the step ran into?)
      let stone = false;
      for (let ty = Math.floor(ay - r); ty <= Math.floor(ay + r) && !stone; ty++) {
        for (let tx = Math.floor(ax - r); tx <= Math.floor(ax + r) && !stone; tx++) stone = tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && pier[ty * f.w + tx] === 1;
      }
      if (!stone) return;
      let best = 0;
      let bestS = Infinity;
      for (const side of [1, -1]) {
        for (let s = 0.05; s <= DOOR_HELP + 1e-9; s += 0.05) {
          if (!this.free(L.walk, ax + (alongX ? 0 : side * s), ay + (alongX ? side * s : 0), r)) continue;
          if (s < bestS) {
            bestS = s;
            best = side * Math.min(Math.abs(want), s);
          }
          break;
        }
      }
      if (best === 0) return;
      const nx = b.x + (alongX ? 0 : best);
      const ny = b.y + (alongX ? best : 0);
      if (this.free(L.walk, nx, ny, r)) {
        b.x = nx;
        b.y = ny;
      }
    };
    ease(true);
    ease(false);
  }

  /**
   * On a level with ledges, after a hero's step: where the rules of height (and nothing else)
   * refused the way they were walking, and a place a little to one side would have let them
   * through, they are moved toward it. So a hero walking at a flight of stairs a little out of
   * line with it climbs it, and one who clips the corner of a ledge goes round it (height.ts,
   * LANE_HELP and STAIR_HELP). `dx`, `dy`: the step that was wanted; `wasX`, `wasY`: where they
   * stood before it. A wall stops a hero as it always has: this is no help against one.
   */
  private intoLine(b: { x: number; y: number }, r: number, dx: number, dy: number, wasX: number, wasY: number): void {
    const L = this.level;
    if (!L.step) return;
    const f = L.floor;
    const walk = L.walk;
    const ease = (alongX: boolean): void => {
      const want = alongX ? dx : dy;
      if (want === 0 || (alongX ? b.x !== wasX : b.y !== wasY)) return;
      const ax = alongX ? b.x + want : b.x;
      const ay = alongX ? b.y : b.y + want;
      if (!this.free(walk, ax, ay, r, true)) return;
      // The nearest place to each side from which the step could be taken. One that leads onto
      // stairs is looked for further off, and is taken before one that does not.
      let best = 0;
      let bestS = Infinity;
      let bestStairs = false;
      for (const side of [1, -1]) {
        for (let s = 0.05; s <= STAIR_HELP + 1e-9; s += 0.05) {
          const px = ax + (alongX ? 0 : side * s);
          const py = ay + (alongX ? side * s : 0);
          if (!this.free(walk, px, py, r)) continue;
          // (the tile the body's leading edge would be on)
          const tx = Math.floor(px + (alongX ? Math.sign(want) * r : 0));
          const ty = Math.floor(py + (alongX ? 0 : Math.sign(want) * r));
          const stairs = f.stair !== undefined && f.stair[ty * f.w + tx] !== 0;
          if (!stairs && s > LANE_HELP + 1e-9) break;
          if (stairs === bestStairs ? s < bestS : stairs) {
            bestS = s;
            bestStairs = stairs;
            best = side * Math.min(Math.abs(want), s);
          }
          break;
        }
      }
      if (best === 0) return;
      const nx = b.x + (alongX ? 0 : best);
      const ny = b.y + (alongX ? best : 0);
      if (this.free(walk, nx, ny, r)) {
        b.x = nx;
        b.y = ny;
      }
    };
    ease(true);
    ease(false);
  }

  isOpen(x: number, y: number): boolean {
    const f = this.level.floor;
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h || this.level.open[ty * f.w + tx] !== 1) return false;
    // (the wall half of a tile cut corner to corner is wall)
    return !(f.cut && inWall(f, x, y));
  }

  /** Is there a clear line from one point to the other (nothing a shot would stop at)? */
  sees(x0: number, y0: number, x1: number, y1: number): boolean {
    const f = this.level.floor;
    return lineOfSight(this.level.open, f.w, f.h, x0, y0, x1, y1, f.cut ?? null);
  }

  /** The farthest point toward (tx, ty), at most `range` away, that the hero can stand on and see. */
  private reachPoint(tx: number, ty: number, range: number): { x: number; y: number } {
    const h = this.hero;
    let dx = tx - h.x;
    let dy = ty - h.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) return { x: h.x, y: h.y };
    const want = Math.min(len, range);
    dx /= len;
    dy /= len;
    for (let d = want; d > 0.2; d -= 0.2) {
      const x = h.x + dx * d;
      const y = h.y + dy * d;
      if (this.free(this.level.walk, x, y, TUNE.heroRadius) && this.sees(h.x, h.y, x, y)) return { x, y };
    }
    return { x: h.x, y: h.y };
  }

  /** The nearest visible living monster within `rad` of a point, if any. */
  monsterNear(x: number, y: number, rad: number): Monster | null {
    let best: Monster | null = null;
    let bd = rad;
    for (const m of this.monsters) {
      if (m.dead || !m.seen) continue;
      const d = Math.hypot(m.x - x, m.y - y) - m.r;
      if (d < bd) {
        bd = d;
        best = m;
      }
    }
    return best;
  }

  /** Would the quick attack, made from where the hero stands, reach this monster? (A blade must be near enough; a shot needs a clear line.) */
  quickReaches(m: Monster): boolean {
    const h = this.hero;
    const s0 = h.skills[0];
    const def = SKILLS[s0.id];
    const dist = Math.hypot(m.x - h.x, m.y - h.y);
    const need = def.kind === 'melee' ? def.range * s0.r.size * 0.9 + m.r : def.range * 0.85;
    return dist <= need && this.sees(h.x, h.y, m.x, m.y);
  }

  /**
   * Aim help for a blow struck beside the hero (the sword, the slam), where what matters is who is
   * near, not which way the thumb points: of the monsters that can be seen within `reach` tiles
   * (measured to their edge), the one being fought already (`last`, its id) if it is one of them,
   * else the nearest, one that is awake before one that is not. Null if none is that near.
   * (The owner, of the warrior: "Just give the same targeting that the mage has to the melee
   * attacks as well." The orb finds its enemy wherever the thumb lands; so must the sword.)
   */
  nearAssist(reach: number, last: number | null = null): Monster | null {
    const h = this.hero;
    let best: Monster | null = null;
    let bs = Infinity;
    for (const m of this.monsters) {
      if (m.dead || !m.seen) continue;
      const d = Math.hypot(m.x - h.x, m.y - h.y) - m.r;
      if (d > reach || !this.sees(h.x, h.y, m.x, m.y)) continue;
      if (m.id === last) return m;
      const score = d + (m.state === 'sleep' ? 2 : 0);
      if (score < bs) {
        bs = score;
        best = m;
      }
    }
    return best;
  }

  /**
   * Aim help for touch, where a thumb is a blunt pointer: the visible monster that best matches
   * aiming from the hero toward (ax, ay). A monster roughly in that direction wins; failing that,
   * the nearest monster that is already fighting; failing that, nothing.
   */
  aimAssist(ax: number, ay: number): Monster | null {
    const h = this.hero;
    let dx = ax - h.x;
    let dy = ay - h.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.01) {
      dx /= len;
      dy /= len;
    } else {
      dx = h.fx;
      dy = h.fy;
    }
    let best: Monster | null = null;
    let bs = Infinity;
    for (const m of this.monsters) {
      if (m.dead || !m.seen) continue;
      const mx = m.x - h.x;
      const my = m.y - h.y;
      const dist = Math.hypot(mx, my);
      if (dist > 12 || !this.sees(h.x, h.y, m.x, m.y)) continue;
      const cos = dist > 0.01 ? (mx * dx + my * dy) / dist : 1;
      const awake = m.state !== 'sleep';
      let score: number;
      if (cos > 0.8) score = dist * (awake ? 1 : 1.6);
      else if (awake && dist < 9) score = 100 + dist;
      else continue;
      if (score < bs) {
        bs = score;
        best = m;
      }
    }
    return best;
  }

  private healHero(n: number): void {
    const h = this.hero;
    h.life = Math.min(h.d.maxLife, h.life + n);
  }

  /**
   * One hit of ability `i`, lowest to highest, as the inventory's ATTACKS page gives it: with all
   * that gear and attributes add, without what comes and goes in a fight (the might that "of
   * Power" builds) and before a critical hit.
   */
  hitRange(i: number): [number, number] {
    const h = this.hero;
    const r = h.skills[i].r;
    const st = h.d.stats;
    const el = r.element === 'fire' ? st.firePct : r.element === 'frost' ? st.frostPct : r.element === 'lightning' ? st.lightPct : st.physPct;
    const k = r.dmgMult * (1 + (st.dmgPct + el) / 100);
    return [Math.max(1, Math.round(h.d.dmgMin * k)), Math.max(1, Math.round(h.d.dmgMax * k))];
  }

  /** Average damage of one hit with an ability, used to size ground patches and runes. */
  private avgHit(i: number, frac: number): number {
    const h = this.hero;
    const r = h.skills[i].r;
    const st = h.d.stats;
    const el = r.element === 'fire' ? st.firePct : r.element === 'frost' ? st.frostPct : r.element === 'lightning' ? st.lightPct : st.physPct;
    return ((h.d.dmgMin + h.d.dmgMax) / 2) * r.dmgMult * frac * (1 + (st.dmgPct + el + h.might) / 100);
  }

  // ===========================================================================================
  // Hero

  private updateHero(dt: number, c: Controls): void {
    const h = this.hero;
    const d = h.d;
    h.life = Math.min(d.maxLife, h.life + d.lifeRegen * dt);
    // (THE SKILL TREES REMADE: Resolute, nothing slows him; Hearth, in his own fire nothing burns him and his mana comes back faster)
    if (this.now('resolute')) h.chillT = 0;
    const hearth = this.now('fuel') && this.inOwnFire();
    if (hearth) h.burnT = 0;
    // (mana only matters when it is what limits the slow abilities: then it also comes back faster)
    h.mana = Math.min(d.maxMana, h.mana + d.manaRegen * (this.meta.limit === 'mana' ? MANA_MODE.regen : 1) * (hearth ? TALENT_TUNE.hearth.mana : 1) * dt);
    h.flash = Math.max(0, h.flash - dt);
    h.invuln = Math.max(0, h.invuln - dt);
    h.swingT = Math.max(0, h.swingT - dt);
    // (Strike's combo: the time in which the next swing may still be the second runs out; then the next is the first)
    if (h.comboT > 0) {
      h.comboT = Math.max(0, h.comboT - dt);
      if (h.comboT <= 0) h.combo = 0;
    }
    if (h.attackT > 0) {
      h.attackAge += dt;
      h.attackT = Math.max(0, h.attackT - dt);
      // (the attack is over: whatever the hero does next, standing or walking, starts from its first frame)
      if (h.attackT <= 0) h.animT = 0;
    }
    if (h.mightT > 0) {
      h.mightT -= dt;
      if (h.mightT <= 0) h.might = 0;
    }
    if (h.hasteT > 0) {
      h.hasteT -= dt;
      if (h.hasteT <= 0) h.haste = 0;
    }
    if (h.frenzyT > 0) {
      h.frenzyT -= dt;
      if (h.frenzyT <= 0) {
        h.frenzyT = 0;
        h.frenzy = 0;
      }
    }
    if (h.shieldT > 0) {
      h.shieldT -= dt;
      if (h.shieldT <= 0) {
        h.shieldT = 0;
        h.shield = 0;
      }
    }
    if (h.chillT > 0) h.chillT -= dt;
    if (h.shockT > 0) h.shockT -= dt;
    if (h.burnT > 0) h.burnT -= dt;
    if (h.poisonT > 0) h.poisonT -= dt;
    // (THE CITY'S WORDS, on monsters: a curse on him and his cooldowns slowed run out)
    if (h.hexT) h.hexT = Math.max(0, h.hexT - dt);
    if (h.stillT) h.stillT = Math.max(0, h.stillT - dt);
    // (BINDING, on monsters: rooted, and the time before he may be rooted again)
    if (h.rootT) h.rootT = Math.max(0, h.rootT - dt);
    if (h.rootAgain) h.rootAgain = Math.max(0, h.rootAgain - dt);
    // (Frenzied: the frenzy makes every cooldown come round faster; STILLING, on a monster, slower)
    const pace = this.frenzyPace() * ((h.stillT ?? 0) > 0 ? 1 - (h.stillK ?? 0) : 1);
    for (const s of h.skills) {
      if (s.charges < s.maxCharges) {
        s.cd -= dt * pace;
        if (s.cd <= 0) {
          s.charges++;
          s.cd = s.charges < s.maxCharges ? s.r.cooldown : 0;
        }
      }
    }

    // (THE FIRST FIVE FLOORS: hooked by the Chained One, he cannot walk or dodge: he goes where he is dragged. game/bosses.ts)
    if (h.held && h.held > 0) {
      h.held = Math.max(0, h.held - dt);
      c = { ...c, mx: 0, my: 0, evade: false };
    }
    // (THE WARLOCK, game/warlock.ts: changing, into the demon or back, he does nothing else and nothing harms him)
    if (h.change) {
      this.stepChange(dt);
      return;
    }
    if (h.cls === 'warlock') this.stepPact(dt, c);
    if (h.change) return;
    // A leap or roll in progress carries the hero and nothing else happens.
    if (h.move) {
      const mv = h.move;
      mv.t += dt;
      const k = Math.min(1, mv.t / mv.dur);
      h.x = mv.x0 + (mv.x1 - mv.x0) * k;
      h.y = mv.y0 + (mv.y1 - mv.y0) * k;
      // (THE SKILL TREES REMADE: Drilled Lunge, every enemy he passes on the way struck)
      if (mv.kind === 'leap' && this.now('drilledleap')) this.lungeThrough(mv);
      // (THE WARLOCK: a smoke step curses, the demon's rakes too, whoever it passes through)
      if (mv.kind === 'smoke') this.smokeThrough(mv);
      h.invuln = Math.max(h.invuln, 0.06);
      h.anim = 'walk';
      h.animT += dt * 2;
      if (k >= 1) {
        h.move = null;
        if (mv.kind === 'leap') this.land();
        else if (mv.kind === 'smoke' && mv.demon) this.demonLands();
        else if (mv.kind === 'blast') this.blastLands();
        else if (mv.kind === 'slip') this.brawlerComesUp(mv.x0, mv.y0);
      }
      return;
    }

    if (c.potion) this.usePotion();
    if (c.evade) this.useEvasive(c.evadeX, c.evadeY, c);
    if (h.move) return;
    // an attack that was begun lands when its wind-up is over
    if (h.windup) {
      h.windup.t -= dt;
      if (h.windup.t <= 0) this.release();
    }
    if (h.channel) this.updateChannel(dt, c);
    if (c.cast) this.useSkill(1, c.castX, c.castY);
    else if (h.queued) {
      // a slow attack asked for in the middle of another follows as soon as that one has landed
      h.queued.t -= dt;
      if (h.queued.t <= 0) h.queued = null;
      else if (!h.windup) {
        const q = h.queued;
        h.queued = null;
        this.useSkill(1, q.tx, q.ty);
      }
    }

    // (a swing's step forward: walls stop it, and monsters part from him after it as after any step)
    if (h.step) {
      const st = h.step;
      const k = Math.min(1, dt / Math.max(1e-6, st.t));
      const sx = st.dx * k;
      const sy = st.dy * k;
      this.slide(h, TUNE.heroRadius, sx, sy, this.level.walk);
      st.dx -= sx;
      st.dy -= sy;
      st.t -= dt;
      if (st.t <= 0) h.step = null;
    }

    let mx = c.mx;
    let my = c.my;
    if (c.fire) {
      const s0 = h.skills[0];
      const def = SKILLS[s0.id];
      let canFire = true;
      if (c.approach && mx === 0 && my === 0) {
        // The player clicked a monster: walk into range (and into view) before attacking.
        const t = this.monsterNear(c.aimX, c.aimY, 1.4);
        if (t && !this.quickReaches(t)) {
          const dist = Math.hypot(t.x - h.x, t.y - h.y);
          mx = (t.x - h.x) / dist;
          my = (t.y - h.y) / dist;
          canFire = false;
        }
      }
      // (not in the middle of another attack's wind-up, and not on top of a slow attack that has
      // only just landed: its follow-through is seen out, all but the last moment of it)
      const busy = h.windup !== null || h.channel !== null || (h.attackSkill !== 0 && h.attackT > TUNE.attackCut);
      if (canFire && h.swingT <= 0 && !busy) this.useBasic(c.aimX, c.aimY);
    }

    const len = Math.hypot(mx, my);
    if (len > 0.01) {
      let sp = d.moveSpeed * (1 + h.haste / 100) * (1 + this.talentSpeed() / 100);
      if (h.chillT > 0) sp *= 1 - h.chill;
      // (BINDING, on a monster: rooted, he walks nowhere; his evade still takes him away)
      if ((h.rootT ?? 0) > 0) sp = 0;
      // (an attack slows the hero for a moment from when it is begun, as it always has; one that is
      // being held slows them for as long as it is: a beam to a walk, a whirlwind hardly at all)
      if (h.channel) sp *= SKILLS[h.skills[h.channel.skill].id].kind === 'whirl' ? TUNE.whirlWalk : TUNE.beamWalk;
      // (THE SKILL TREES REMADE: Fleet, an arrow loosed slows him no longer)
      else if (h.attackT > 0 && h.attackAge < TUNE.attackSlowTime && !(this.now('fleet') && this.arrowSkill(h.attackSkill))) sp *= TUNE.attackSlow;
      const k = Math.min(1, len);
      const wasX = h.x;
      const wasY = h.y;
      this.slide(h, TUNE.heroRadius, (mx / len) * sp * k * dt, (my / len) * sp * k * dt, this.level.walk);
      this.intoLine(h, TUNE.heroRadius, (mx / len) * sp * k * dt, (my / len) * sp * k * dt, wasX, wasY);
      this.intoDoor(h, TUNE.heroRadius, (mx / len) * sp * k * dt, (my / len) * sp * k * dt, wasX, wasY);
      if (h.attackT <= 0 && !c.face) {
        h.fx = mx / len;
        h.fy = my / len;
      }
      h.anim = h.attackT > 0 ? 'attack' : 'walk';
    } else {
      h.anim = h.attackT > 0 ? 'attack' : 'idle';
    }
    // Locked onto an enemy, the hero stays turned toward it: walking away from it, standing, and
    // through an attack's wind-up (so the blow goes where the enemy has got to, not where it was).
    if (c.face) this.face(c.aimX, c.aimY);
    h.animT += dt;

    // Monsters block the way (bats fly overhead). Not the way of a hero in a whirlwind: the owner,
    // "a channel that passes through like the Bull stampede". (When the spin ends inside one, this
    // is what parts them again.)
    const through = this.whirling();
    for (const m of this.monsters) {
      if (through) break;
      if (m.dead || m.state === 'sleep' || m.kind === 'bat') continue;
      const dx = h.x - m.x;
      const dy = h.y - m.y;
      const min = TUNE.heroRadius + m.r * 0.8;
      const dist = Math.hypot(dx, dy);
      if (dist < min && dist > 1e-4) {
        const push = min - dist;
        this.slide(h, TUNE.heroRadius, (dx / dist) * push, (dy / dist) * push, this.level.walk);
      }
    }
  }

  private face(tx: number, ty: number): void {
    const h = this.hero;
    const dx = tx - h.x;
    const dy = ty - h.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.05) {
      h.fx = dx / len;
      h.fy = dy / len;
    }
  }

  usePotion(): void {
    const h = this.hero;
    if (h.potions <= 0 || h.life >= h.d.maxLife) return;
    h.potions--;
    if (this.guide) this.guide.flask = true;
    this.healHero(h.d.maxLife * TUNE.potionHeal * (this.was('secondwind') ? TALENT_TUNE.secondWind : 1));
    this.sfx('potion');
    this.emit({ t: 'spark', x: h.x, y: h.y, el: 'fire', n: 10 });
    // (THE SKILL TREES REMADE: Second Wind, a flask throws back what is near, and nothing hurts him for a second)
    if (this.now('secondwind')) {
      const W = TALENT_TUNE.secondWind2;
      h.invuln = Math.max(h.invuln, W.secs);
      this.emit({ t: 'shield', x: h.x, y: h.y, secs: W.secs });
      this.emit({ t: 'burst', x: h.x, y: h.y, r: W.r, el: 'phys', style: 'shock' });
      for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - h.x, m.y - h.y) <= W.r + m.r) this.throwMonster(m, h.x, h.y, W.far);
    }
  }

  private useBasic(tx: number, ty: number): void {
    const h = this.hero;
    const s = h.skills[0];
    const def = SKILLS[s.id];
    if (def.cooldown > 0) {
      // A quick attack that waits between uses (the familiar): held back by its cooldown or by
      // mana as a slow attack is, not by the weapon's speed. It is paid for when it lands.
      if (s.charges < 1) return;
      if (h.mana < s.r.mana) {
        this.noMana();
        return;
      }
      h.swingT = def.windup;
      this.face(tx, ty);
      this.begin(0, tx, ty, def.windup);
      return;
    }
    // (Frenzied: the frenzy makes the quick attack faster)
    let rate = Math.max(0.3, s.r.rate) * this.frenzyPace();
    if (h.chillT > 0) rate *= 1 - h.chill * 0.5;
    // (THE WARLOCK's tree: Bloodlust, every kill the demon makes its rakes the quicker, up to twice as quick)
    if (h.form === 'demon' && this.has('bloodlust')) rate *= Math.min(WARLOCK_TUNE.talents.bloodlust.most, 1 + (h.lust ?? 0) * WARLOCK_TUNE.talents.bloodlust.each);
    h.swingT = 1 / rate;
    this.face(tx, ty);
    // (a fast weapon's wind-up is never more than two fifths of the time between its blows)
    const wind = Math.min(def.windup, 0.4 / rate);
    // STRIKE, A TWO-HIT COMBO (defs.ts, COMBO): the second swing if this one comes soon enough
    // after a first, else the first; and a small step forward with either.
    if (COMBO.on && def.kind === 'melee') {
      h.combo = h.combo === 0 && h.comboT > 0 ? 1 : 0;
      h.comboT = 1 / rate + TUNE.comboWindow;
      h.step = { dx: h.fx * TUNE.swingStep, dy: h.fy * TUNE.swingStep, t: TUNE.swingStepTime };
    } else h.combo = 0;
    this.begin(0, tx, ty, wind);
  }

  /** Is the hero in a whirlwind (which passes through enemies, and they through the hero)? */
  whirling(): boolean {
    const ch = this.hero.channel;
    return ch !== null && SKILLS[this.hero.skills[ch.skill].id].kind === 'whirl';
  }

  /** What ability `i` must have in mana to be begun: all it costs, or for one that is held, its first bite's worth. */
  private manaToBegin(i: number): number {
    const s = this.hero.skills[i];
    const def = SKILLS[s.id];
    return def.channel && def.tick ? (s.r.mana * def.tick) / def.channel : s.r.mana;
  }

  private useSkill(i: number, tx: number, ty: number): void {
    const h = this.hero;
    const s = h.skills[i];
    // (THE FIRST LEVELS: not before its level)
    if (!this.moveOpen(i)) return;
    // (one that is being held is already being made: the button held down does not ask for another)
    if (h.channel) return;
    if (s.charges < 1) return;
    if (h.mana < this.manaToBegin(i)) {
      this.noMana();
      return;
    }
    if (h.windup) {
      // another attack is being made: this one waits its turn (briefly), it is not lost
      h.queued = { tx, ty, t: 0.4 };
      return;
    }
    this.face(tx, ty);
    this.begin(i, tx, ty, SKILLS[s.id].windup);
  }

  /**
   * Begin an attack: the hero winds up, and it lands `wind` seconds from now (see release). What
   * it costs is paid when it lands, so an attack broken off by an evasive move costs nothing.
   */
  private begin(i: number, tx: number, ty: number, wind: number): void {
    const h = this.hero;
    // (Strike's combo, defs.ts COMBO: anything but Strike between two Strikes makes the second the first swing again)
    if (i !== 0) {
      h.combo = 0;
      h.comboT = 0;
    }
    // (THE BRAWLER, game/brawler.ts: the punch this press makes, by its place in his combo; its own wind-up and follow-through)
    let follow = SKILLS[h.skills[i].id].follow;
    if (h.cls === 'brawler' && i < 2 && SKILLS[h.skills[i].id].kind === 'punch') {
      const p = h.punch;
      const soon = !!p && this.time - p.at <= PUNCHES[p.name].follow + COMBO_GAP;
      const goOn = soon && !!p && p.run.length < 3;
      // (THE BRAWLER'S TREE: Flurry, a tap soon after the uppercut is a hook again, as the second of a combo; Set-Up, after a
      // counter has landed, his next press is the combo's last punch, a tap the uppercut and a hold the haymaker)
      const flurry = i === 0 && soon && !!p && p.name === 'uppercut' && this.has('flurry');
      const setUp = this.brawl.setUp;
      this.brawl.setUp = false;
      const run = setUp ? (i === 0 ? 'TTT' : 'HHH') : flurry ? 'TT' : (goOn && p ? p.run : '') + (i === 0 ? 'T' : 'H');
      const holds = [...run.slice(0, -1)].filter((c) => c === 'H').length;
      const name = punchFor(run.length - 1, i === 1, holds);
      const P = PUNCHES[name];
      // (Swiftness and the frenzy quicken his punches as they quicken any quick attack; THE BRAWLER'S TREE: Heavy Hands, Heavy
      // in front of his taps no longer slows them)
      const unslowed = i === 0 && this.has('heavyhands') && this.hushT <= 0 && this.fronts(0).includes('heavy') ? HEAVY.slower : 1;
      const pace = i === 0 ? Math.max(0.5, Math.min(2, (h.skills[0].r.rate * unslowed) / Math.max(0.3, this.weaponRate()))) * this.frenzyPace() : 1;
      wind = P.windup / pace;
      follow = P.follow / pace;
      // (THE BRAWLER'S TREE: Double Jab, the jab is two: the second lands a moment after the first, and the combo goes on from it)
      const two = name === 'jab' && this.has('doublejab') ? BRAWL_TUNE.talents.doubleJab.gap : 0;
      h.punch = { run, name, at: this.time + wind + two };
      if (i === 0) h.swingT = wind + two + follow * 0.55;
    }
    h.attackSkill = i;
    h.attackAge = 0;
    h.attackWind = wind;
    h.attackT = wind + follow;
    h.animT = 0;
    h.windup = { skill: i, tx, ty, t: wind };
    if (wind <= 0) this.release();
  }

  /** The attack that was begun lands: the blow is struck, the arrow leaves, the spell goes off. */
  private release(): void {
    const h = this.hero;
    const w = h.windup;
    if (!w) return;
    h.windup = null;
    const i = w.skill;
    const s = h.skills[i];
    const def = SKILLS[s.id];
    if (i === 0 && def.cooldown <= 0) {
      s.uses++;
      if (def.kind === 'melee') this.sfx('swing', 0.8);
      else if (def.kind === 'projectile') this.sfx('shot', 0.8);
      else if (def.kind === 'wave') this.sfx('wave', 0.8);
      // (the quick attack goes the way the hero faces, from wherever they have got to; THE TINKERER's vial and Contraption,
      // thrown, to where it was aimed)
      if (def.kind === 'contraption' || def.kind === 'vialtoss') this.deliver(0, h.x, h.y, w.tx, w.ty, 1, true);
      else this.deliver(0, h.x, h.y, h.x + h.fx, h.y + h.fy, 1, true);
      // (THE WARLOCK's tree: the demon's rakes counted, every third a Hellwave)
      if (s.id === 'rake') this.rakeDone(h.x, h.y, h.fx, h.fy, 1);
      return;
    }
    // (what it needs may have gone in the meantime: then nothing happens, and nothing is paid)
    if (s.charges < 1 || h.mana < this.manaToBegin(i)) return;
    if (def.channel) {
      // an attack that goes on while it is held begins here: it is paid for as it goes
      this.beginChannel(i, w.tx, w.ty);
      return;
    }
    h.mana -= s.r.mana;
    s.charges--;
    s.uses++;
    if (s.cd <= 0) s.cd = s.r.cooldown;
    this.deliver(i, h.x, h.y, w.tx, w.ty, 1, true);
  }

  // ---- attacks that go on while they are held (Whirlwind, Beam) -------------------------------

  /**
   * Such an attack begins: from now on updateChannel keeps it going, and its first bite comes in
   * this same step. It counts as used now. What it costs is taken as it goes (mana) or when it
   * ends (its wait): see endChannel.
   */
  private beginChannel(i: number, tx: number, ty: number): void {
    const h = this.hero;
    const s = h.skills[i];
    const def = SKILLS[s.id];
    const r = s.r;
    s.uses++;
    h.channel = { skill: i, t: 0, next: 0, bites: 0, tx, ty, wake: 0 };
    let dx = tx - h.x;
    let dy = ty - h.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) {
      dx = h.fx;
      dy = h.fy;
    } else {
      dx /= len;
      dy /= len;
    }
    const words = this.fronts(i);
    const behind = this.behinds(i);
    if (words.length || behind.length) this.emit({ t: 'cast', x: h.x, y: h.y, dx, dy, kind: def.kind, el: r.element, words, behind, echo: false });
    this.emit({ t: 'channel', kind: def.kind, x: h.x, y: h.y, el: r.element });
    if (def.kind === 'beam') this.sfx('beam', 0.8);
    // (what a use gives the hero, it gives once: at the start)
    this.boons(i);
  }

  /**
   * Keep the attack that is being held going. In order: is it over (let go, run its length, out
   * of mana)? then its bite, if one is due; then time passes. So an attack let go the moment it
   * began has still bitten once: one press is one attack, as with any other.
   */
  private updateChannel(dt: number, c: Controls): void {
    const h = this.hero;
    const ch = h.channel;
    if (!ch) return;
    const s = h.skills[ch.skill];
    const def = SKILLS[s.id];
    const length = def.channel ?? 0;
    const tick = def.tick ?? 0.25;
    const byMana = s.r.mana > 0;
    if (ch.bites > 0) {
      const spent = byMana ? h.mana <= 0 : ch.t >= length - 1e-6;
      if (!c.hold || spent) {
        this.endChannel(true);
        return;
      }
    }
    if (def.kind === 'beam') {
      // it follows the finger
      if (c.hold) {
        ch.tx = c.castX;
        ch.ty = c.castY;
      }
      this.face(ch.tx, ch.ty);
    } else {
      // the hero turns on the spot, whichever way they walk
      const a = Math.atan2(h.fy, h.fx) + TUNE.whirlSpin * Math.PI * 2 * dt;
      h.fx = Math.cos(a);
      h.fy = Math.sin(a);
    }
    if (ch.next <= 1e-9) {
      // (what the words behind it leave, it leaves as it begins and now and then as it goes on)
      const leaves = ch.t >= ch.wake - 1e-9;
      if (leaves) ch.wake += TUNE.channelWake;
      this.channelBite(ch.skill, h.x, h.y, h.fx, h.fy, 1, false, leaves, ch.bites === 0);
      ch.next += tick;
      ch.bites++;
    }
    ch.t += dt;
    ch.next -= dt;
    if (byMana && length > 0) h.mana = Math.max(0, h.mana - (s.r.mana / length) * dt);
    // (the picture: the hero holds the pose of the blow for as long as it goes on)
    h.attackSkill = ch.skill;
    h.attackT = Math.max(h.attackT, def.follow);
    h.attackAge = h.attackWind + CHANNEL_POSE;
  }

  /**
   * The attack that was being held is over. Its wait begins: all of it after a whole length, less
   * after a shorter one (but never less than TUNE.channelMinCool of it). `echoes`: false when it
   * was cut off by something other than the player's letting go or its running out (the weapon
   * was changed): then nothing follows it.
   */
  private endChannel(echoes: boolean): void {
    const h = this.hero;
    const ch = h.channel;
    if (!ch) return;
    h.channel = null;
    const s = h.skills[ch.skill];
    const def = SKILLS[s.id];
    const r = s.r;
    const length = def.channel ?? 0;
    const part = length > 0 ? Math.max(0, Math.min(1, ch.t / length)) : 1;
    if (s.charges > 0) s.charges--;
    // (when mana is the limit the wait is only a moment, whatever the length)
    s.cd = r.mana > 0 ? r.cooldown : r.cooldown * Math.max(TUNE.channelMinCool, part);
    h.attackT = def.follow;
    this.emit({ t: 'channelEnd', kind: def.kind, x: h.x, y: h.y, el: r.element, part });
    if (echoes && r.echo > 0 && ch.bites > 0) {
      // "of Echoes": a phantom carries it on for a moment from where it stopped, weaker
      const i = ch.skill;
      const ox = h.x;
      const oy = h.y;
      const dx = h.fx;
      const dy = h.fy;
      const words = this.fronts(i);
      const behind = this.behinds(i);
      this.emit({ t: 'echo', x: ox, y: oy, dx, dy, kind: def.kind, delay: ECHO_DELAY });
      this.after(ECHO_DELAY, () => this.emit({ t: 'cast', x: ox, y: oy, dx, dy, kind: def.kind, el: this.hero.skills[i].r.element, words, behind, echo: true }));
      for (let k = 0; k < ECHO_BITES; k++) {
        this.after(ECHO_DELAY + k * (def.tick ?? 0.25), () => {
          // (the weapon may have been changed since: an echo of an attack that is gone is not made)
          if (this.hero.skills[i].id === def.id) this.channelBite(i, ox, oy, dx, dy, this.hero.skills[i].r.echo, true, false, k === 0);
        });
      }
    }
  }

  /**
   * One bite of an attack that is being held, made from (ox, oy) the way (dx, dy): everything
   * along the beam, or everything round the hero. `leaves`: this bite leaves what the words behind
   * the attack leave.
   */
  private channelBite(i: number, ox: number, oy: number, dx: number, dy: number, frac: number, echo: boolean, leaves: boolean, first: boolean): void {
    const s = this.hero.skills[i];
    const r = s.r;
    const def = SKILLS[s.id];
    const each = frac * r.countDmg;
    if (def.kind === 'beam') {
      this.beamLine(i, ox, oy, dx, dy, each, echo, leaves, first);
      return;
    }
    const rad = def.radius * r.size;
    this.sfx('whirl', echo ? 0.35 : 0.6);
    for (let k = 0; k < r.count; k++) {
      if (k === 0) this.blast(i, ox, oy, rad, each, 'whirl', 0, echo, leaves);
      // (Twin: every turn cuts twice, the second a moment after the first, from wherever the hero has got to)
      else this.after(0.12 * k, () => this.blast(i, echo ? ox : this.hero.x, echo ? oy : this.hero.y, rad, each, 'whirl', k, echo, false));
    }
  }

  /**
   * A beam's bite: a line from (ox, oy) to the first wall (or the end of its range), and
   * everything along it is hit, the nearest first. A Twin pair runs side by side, and one enemy
   * takes only one of them.
   */
  private beamLine(i: number, ox: number, oy: number, dx: number, dy: number, each: number, echo: boolean, leaves: boolean, first: boolean): void {
    const s = this.hero.skills[i];
    const r = s.r;
    const def = SKILLS[s.id];
    const words = this.fronts(i);
    const behind = this.behinds(i);
    const half = def.radius * r.size;
    const taken: number[] = [];
    let hits = 0;
    this.sfx('beamHum', echo ? 0.3 : 0.5);
    for (let k = 0; k < r.count; k++) {
      const off = r.count === 1 ? 0 : (k - (r.count - 1) / 2) * (half * 2 + 0.3);
      // (the second of a pair starts beside the hero, unless a wall is there)
      let sx = ox - dy * off;
      let sy = oy + dx * off;
      if (off !== 0 && !this.isOpen(sx, sy)) {
        sx = ox;
        sy = oy;
      }
      const end = this.beamEnd(sx, sy, dx, dy, def.range);
      const line: { m: Monster; at: number }[] = [];
      for (const m of this.monsters) {
        if (m.dead || taken.includes(m.id)) continue;
        const at = (m.x - sx) * dx + (m.y - sy) * dy;
        if (at < -m.r || at > end.len + m.r) continue;
        if (Math.abs((m.y - sy) * dx - (m.x - sx) * dy) > half + m.r) continue;
        line.push({ m, at });
      }
      line.sort((a, b) => a.at - b.at);
      // (the echo is a phantom's beam, drawn for itself; the one being held is drawn from Hero.channel)
      if (echo) this.emit({ t: 'beam', x0: sx, y0: sy, x1: end.x, y1: end.y, w: half, el: r.element, words, behind, n: k, echo });
      else this.emit({ t: 'beamBite', x0: sx, y0: sy, x1: end.x, y1: end.y, w: half, el: r.element, words, n: k, hits: line.length, first });
      for (const q of line) {
        taken.push(q.m.id);
        this.hitMonster(q.m, i, each, hits >= 3);
        hits++;
      }
      if (line.length) this.landed(i);
      // (THE CITY'S WORDS: Pulling in front, the beam drags what is round the first it strikes in to it)
      if (line.length && r.pull > 0) this.pullIn(i, line[0].m.x, line[0].m.y, 0, true);
      for (let d = 0.5; d < end.len; d += 1) this.breakProps(sx + dx * d, sy + dy * d, half + 0.25, i);
      if (k === 0 && leaves) {
        // what it leaves: ground along the line; a rune and a cloud where it first struck, or
        // failing that near its far end
        const far = Math.max(0, end.len - 0.8);
        const wx = line.length ? line[0].m.x : sx + dx * far;
        const wy = line.length ? line[0].m.y : sy + dy * far;
        if (r.rune > 0) this.addRune(i, wx, wy, each);
        if (r.cloud > 0) this.addCloud(i, wx, wy, 1.5, each);
        // (cracked ground and a ward, as a rune: where it first struck)
        this.leavePatches(i, wx, wy, 1.0, each);
        if (r.zone) for (let n = 0, d = 1.3; n < TUNE.beamPatches && d < end.len; n++, d += TUNE.beamPatchGap) this.addGround(i, sx + dx * d, sy + dy * d, 1.0, each);
      }
    }
    if (hits > 0) this.sfx(r.element === 'fire' ? 'fire' : r.element === 'frost' ? 'frost' : r.element === 'lightning' ? 'zap' : 'hit', 0.6);
  }

  /**
   * "of Power" behind ability `i`: a blow of it has landed on an enemy, and the hero's might grows
   * by a stack (five at the most) or is kept up. Once for each blow that lands, however many
   * enemies that blow catches: a slam into five skeletons is one stack, and each cut of a combo,
   * each turn of a whirlwind, each bite of a beam, each arrow of a volley that lands on something
   * is one. The owner, 4 Oct 2026: ""Of power" should only stack when an enemy is hit. Not when
   * the ability is used". (Until Version 12.2 it was a stack for each use, hit or miss: a hero
   * could swing at the air before a fight and walk in at full might; and an attack held or set
   * down, used once every five seconds, never got past the first stack.)
   */
  private landed(i: number): void {
    const h = this.hero;
    const s = h.skills[i];
    if (!s || s.r.might <= 0) return;
    const r = s.r;
    h.might = Math.min(r.might * (this.has('cadence') ? TALENT_TUNE.cadence : 5), h.might + r.might);
    h.mightT = 5;
    this.emit({ t: 'buff', kind: 'might', x: h.x, y: h.y, stacks: Math.max(1, Math.round(h.might / r.might)) });
  }

  /** What a use of ability `i` gives the hero, from the words behind it: haste. Once a use. ("of Power" is given by what lands: see `landed`.) */
  private boons(i: number): void {
    const h = this.hero;
    const r = h.skills[i].r;
    if (r.haste > 0) {
      h.haste = r.haste;
      h.hasteT = 3;
      this.emit({ t: 'buff', kind: 'haste', x: h.x, y: h.y, stacks: 1 });
    }
    // FRENZIED in front: each use adds to the frenzy, up to its most, and holds it a while longer
    if (r.frenzy) {
      h.frenzy = Math.min(this.stackMax(), h.frenzy + 1);
      h.frenzyT = Math.max(h.frenzyT, FRENZY.hold);
      this.emit({ t: 'frenzy', x: h.x, y: h.y, dx: h.fx, dy: h.fy, n: h.frenzy });
    }
    // GUARDING in front: each use gives a shield (a new one is never weaker than what is left of the last)
    if (r.shield > 0) {
      h.shield = Math.max(h.shield, Math.round(h.d.maxLife * r.shield * (this.was('shieldwall') ? TALENT_TUNE.shieldwall : 1)));
      h.shieldT = GUARD.shieldTime;
      this.emit({ t: 'shield', x: h.x, y: h.y, secs: GUARD.shieldTime });
    }
  }

  /** How much faster the frenzy makes the hero's attacks and cooldowns (1: no frenzy). */
  frenzyPace(): number {
    // (THE SKILL TREES: Berserk, below half his life, faster still)
    return 1 + FRENZY.each * this.hero.frenzy;
  }

  private noMana(): void {
    if (this.denyT > 0) return;
    const h = this.hero;
    this.denyT = 0.8;
    this.sfx('deny');
    this.emit({ t: 'text', x: h.x, y: h.y, text: 'No mana', color: '#58a8f0' });
  }

  private useEvasive(tx: number, ty: number, c: Controls): void {
    const h = this.hero;
    const s = h.skills[2];
    // (THE FIRST LEVELS: not before its level)
    if (!this.moveOpen(2)) return;
    if (s.charges < 1) return;
    if (h.mana < s.r.mana) {
      this.noMana();
      return;
    }
    const def = SKILLS[s.id];
    // With no clear target (the pointer is on the hero, or right beside them), go the way the hero
    // is moving or facing: a dodge asked for must never fizzle because of where the pointer rests.
    if (Math.hypot(tx - h.x, ty - h.y) < 0.9) {
      const ml = Math.hypot(c.mx, c.my);
      const dx = ml > 0.01 ? c.mx / ml : h.fx;
      const dy = ml > 0.01 ? c.my / ml : h.fy;
      tx = h.x + dx * def.range;
      ty = h.y + dy * def.range;
    }
    // Warp and Leap go to a point. Straight into a wall there is nowhere to go: refuse, rather
    // than spend the ability on standing still.
    let land: { x: number; y: number } | null = null;
    if (def.kind === 'warp' || def.kind === 'leap' || def.kind === 'smoke' || def.kind === 'blastjump' || def.kind === 'slip') {
      land = this.reachPoint(tx, ty, def.range);
      if (Math.hypot(land.x - h.x, land.y - h.y) < 0.5) {
        if (this.denyT <= 0) {
          this.denyT = 0.8;
          this.sfx('deny');
          this.emit({ t: 'text', x: h.x, y: h.y, text: 'No room', color: '#8c8090' });
        }
        return;
      }
    }
    h.mana -= s.r.mana;
    s.charges--;
    s.uses++;
    if (s.cd <= 0) s.cd = s.r.cooldown;
    // (an attack that was being made is broken off, and costs nothing: not even its turn. One that
    // was being held ends here, and its wait begins.)
    if (h.channel) this.endChannel(true);
    if (h.windup && h.windup.skill === 0) h.swingT = 0;
    h.windup = null;
    h.channel = null;
    h.queued = null;
    h.attackT = 0;
    // (and Strike's combo with it: the next Strike is the first swing; a swing's step is over)
    h.combo = 0;
    h.comboT = 0;
    h.step = null;
    this.face(tx, ty);
    this.sfx('dodge');
    // The words on it (Version 12.2: the evasive moves take words as the attacks do). In front
    // they change the hit: a leap's landing, the burst of the trap a roll leaves, the burst a warp
    // arrives in. Behind they change what is left: where the leap lands, where the trap bursts,
    // where the mage vanished from. What a use gives the hero (Swiftness, Power behind it), it
    // gives as the move begins.
    const r = s.r;
    const x0 = h.x;
    const y0 = h.y;
    const front = this.fronts(2);
    const behind = this.behinds(2);
    let dx = tx - h.x;
    let dy = ty - h.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    if (front.length || behind.length) this.emit({ t: 'cast', x: x0, y: y0, dx, dy, kind: def.kind, el: r.element, words: front, behind, echo: false });
    this.boons(2);
    if (def.kind === 'warp' && land) {
      this.emit({ t: 'burst', x: h.x, y: h.y, r: 0.8, el: 'frost', style: 'warp' });
      // (THE SKILL TREES: Frost Warp, Flame Warp; Storm Warp where she arrives, below)
      if (TALENTS.on) this.talentWarp(x0, y0, land.x, land.y);
      h.x = land.x;
      h.y = land.y;
      h.invuln = Math.max(h.invuln, 0.3);
      this.emit({ t: 'burst', x: h.x, y: h.y, r: 0.8, el: 'frost', style: 'warp' });
      // behind: left where the mage vanished from
      const rad = def.radius * r.size;
      this.wake(2, x0, y0, rad, r.countDmg);
      // the mage arrives in a burst. Twin: a second a moment later. "of Echoes": a weaker one after that.
      const ax = h.x;
      const ay = h.y;
      for (let k = 0; k < r.count; k++) {
        if (k === 0) this.blast(2, ax, ay, rad, r.countDmg, 'nova', 0, false, false);
        else this.after(0.22 * k, () => this.blast(2, ax, ay, rad, r.countDmg, 'nova', k, false, false));
      }
      if (r.echo > 0) this.echoOf(2, ax, ay, dx, dy, () => this.blast(2, ax, ay, rad, r.countDmg * r.echo, 'nova', 0, true, false));
      return;
    }
    if (def.kind === 'leap' && land) {
      const dist = Math.hypot(land.x - h.x, land.y - h.y);
      h.move = { kind: 'leap', t: 0, dur: 0.26 + dist * 0.03, x0: h.x, y0: h.y, x1: land.x, y1: land.y };
      return;
    }
    // (THE BRAWLER, game/brawler.ts: the slip. He weaves to the spot, nothing hurting him, and comes up with a counter hook:
    // brawlerComesUp. Behind: what its words leave, it leaves where he set off, as he comes up.)
    if (def.kind === 'slip' && land) {
      h.move = { kind: 'slip', t: 0, dur: BRAWL_TUNE.slip.secs, x0: h.x, y0: h.y, x1: land.x, y1: land.y };
      h.invuln = Math.max(h.invuln, BRAWL_TUNE.slip.secs + 0.15);
      h.punch = null;
      this.emit({ t: 'slip', x0: h.x, y0: h.y, x1: land.x, y1: land.y });
      return;
    }
    // (THE TINKERER, game/tinkerer.ts: the blast jump. The bomb goes off at her feet: what is by her is hurt and blown away
    // (Twin, a second bomb a moment later where she was); she rides it to the spot, nothing hurting her in the air.)
    if (def.kind === 'blastjump' && land) {
      const rad = def.radius * r.size;
      this.emit({ t: 'blastJump', x0, y0, x1: land.x, y1: land.y, r: rad });
      this.emit({ t: 'shake', amount: 3 });
      this.sfx('slam', 0.9);
      const bomb = (k: number, share: number, echoed: boolean): void => {
        this.blast(2, x0, y0, rad, share, 'bomb', k, echoed, k === 0 && !echoed);
        for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - x0, m.y - y0) <= rad + m.r) this.throwMonster(m, x0, y0, TINKER_TUNE.blast.throw, 0.25);
      };
      for (let k = 0; k < r.count; k++) {
        if (k === 0) bomb(0, r.countDmg, false);
        else this.after(0.22 * k, () => bomb(k, r.countDmg, false));
      }
      if (r.echo > 0) this.echoOf(2, x0, y0, dx, dy, () => bomb(0, r.countDmg * r.echo, true));
      h.move = { kind: 'blast', t: 0, dur: TINKER_TUNE.blast.secs, x0: h.x, y0: h.y, x1: land.x, y1: land.y };
      h.invuln = Math.max(h.invuln, TINKER_TUNE.blast.secs + 0.1);
      return;
    }
    // (THE WARLOCK, game/warlock.ts: the smoke step, his or the demon's)
    if (def.kind === 'smoke' && land) {
      const demon = s.id === 'demonstep';
      h.move = { kind: 'smoke', t: 0, dur: demon ? WARLOCK_TUNE.step.demonSecs : WARLOCK_TUNE.step.secs, x0: h.x, y0: h.y, x1: land.x, y1: land.y, hit: [], demon };
      this.emit({ t: 'smoke', x0: h.x, y0: h.y, x1: land.x, y1: land.y, demon });
      this.sfx(demon ? 'slam' : 'dodge', 0.6);
      // behind: left where he went up in smoke (the demon's, where it bursts out: demonLands)
      if (!demon) this.wake(2, x0, y0, def.radius * r.size, r.countDmg);
      // (HIS TREE: Phantom Step, his shadow left where he stood: the enemies near go after it, not him, a while: the decoys)
      if (!demon && this.has('phantomstep')) {
        const P = WARLOCK_TUNE.talents.phantom;
        this.decoys.push({ x: x0, y: y0, t: P.secs, r: P.reach, size: TUNE.heroRadius });
        this.emit({ t: 'phantom', x: x0, y: y0, secs: P.secs });
      }
      // "of Echoes": a moment later the smoke streaks along the same way again, weaker
      if (r.echo > 0) {
        const x1 = land.x;
        const y1 = land.y;
        this.echoOf(2, x0, y0, dx, dy, () => this.smokeEcho(x0, y0, x1, y1, r.countDmg * r.echo));
      }
      return;
    }
    // roll: travel along the floor, stopping at the first obstacle (THE SKILL TREES: Light Step, further)
    const rollRange = def.range * (this.was('lightstep') ? TALENT_TUNE.lightStep.roll : 1);
    const end = { x: h.x, y: h.y };
    for (let dgo = 0; dgo < rollRange; dgo += 0.15) this.slide(end, TUNE.heroRadius, dx * 0.15, dy * 0.15, this.level.walk);
    // LEDGES AND PITS (the owner, 5 and 7 Oct 2026: "the swipe moves need to be able to traverse
    // the different levels as well"; "Gaps and pits to use the swipe ability over"): a roll that a
    // ledge or a pit would stop short goes OVER it, a dive, to the farthest place in its range where
    // the hero can stand. (A wall still stops it, and so does a pillar or a barrel.)
    let over = false;
    // (LEAP_WATER: and over a river's water, game/water.ts)
    if (this.level.step || this.level.water) {
      const far = this.overPoint(dx, dy, rollRange);
      if (far && Math.hypot(far.x - h.x, far.y - h.y) > Math.hypot(end.x - h.x, end.y - h.y) + 0.3) {
        end.x = far.x;
        end.y = far.y;
        over = true;
      }
    }
    h.move = { kind: 'roll', t: 0, dur: over ? 0.3 : 0.24, x0: h.x, y0: h.y, x1: end.x, y1: end.y, over };
    // (THE SKILL TREES: Windrunner, faster after a roll)
    if (this.was('windrunner')) this.windT = TALENT_TUNE.windrunner.secs;
    // The ranger's: a trap is left where the roll began, so that what chases them runs onto it
    // (the owner: "When you tumble you lay a trap"). Twin: a second, where the roll ends. "of
    // Echoes": a weaker one where the first was, a moment later.
    if (def.dmg > 0) {
      this.layTrap(2, x0, y0, r.countDmg);
      // (THE SKILL TREES: Minefield, two more in a fan behind where the roll began)
      if (this.has('minefield')) {
        const M = TALENT_TUNE.minefield;
        for (const a of [-0.7, 0.7]) {
          const bx = x0 + (-dx * Math.cos(a) - dy * Math.sin(a)) * M.spread;
          const by = y0 + (-dy * Math.cos(a) + dx * Math.sin(a)) * M.spread;
          if (this.isOpen(bx, by)) this.layTrap(2, bx, by, r.countDmg);
        }
      }
      if (r.count > 1 && Math.hypot(end.x - x0, end.y - y0) > 1) this.layTrap(2, end.x, end.y, r.countDmg);
      if (r.echo > 0) this.echoOf(2, x0, y0, dx, dy, () => this.layTrap(2, x0, y0, r.countDmg * r.echo));
    }
  }

  // ===========================================================================================
  // THE WARLOCK (game/warlock.ts)

  /** What a hit of his sets going: his hellfire (the bolt), the curse (the Curse, the smoke steps, the rakes); and his pact. */
  private warlockHit(m: Monster, i: number, dmg: number): void {
    const h = this.hero;
    const id = h.skills[i]?.id;
    const W = WARLOCK_TUNE;
    // (HIS TREE: the Bound Demon's rakes are struck as the hits of his first place, and curse as the demon's do; a Hellwave burns)
    const by = this.warlockBy;
    const bolt = id === 'hellbolt' && by !== 'bound';
    const wasCursed = (m.curseT ?? 0) > 0;
    if (!m.dead && (bolt || by === 'wave')) this.hellOnIt(m, dmg);
    if (!m.dead && (by === 'bound' || id === 'curse' || id === 'smokestep' || id === 'rake' || id === 'demonstep')) this.curseOne(m, dmg);
    // (HIS TREE: Branded, every Hellfire Bolt curses what it hits)
    if (!m.dead && bolt && this.has('branded')) this.curseOne(m, dmg);
    // (HIS TREE: Hex Chain, a bolt on one cursed leaps on to the next; Blazing Arm, with his pact full his bolt bursts)
    if (bolt && by === null && wasCursed && this.has('hexchain')) this.hexChain(m, i);
    if (bolt && (by === null || by === 'chain') && h.form !== 'demon' && !this.bound && (h.pact ?? 0) >= W.pact.full && this.has('blazingarm')) this.blaze(m, i, dmg);
    // the pact: filled by his hits as a man, a little put back by the demon's (and, out beside him, by the Bound Demon's)
    const full = W.pact.full;
    const was = h.pact ?? 0;
    if (h.form === 'demon' || by === 'bound') h.pact = Math.min(full, was + W.pact.demonHit);
    else if (!h.change && !this.bound) {
      h.pact = Math.min(full, was + W.pact.hit);
      if (was < full && h.pact >= full) {
        this.emit({ t: 'pactFull', x: h.x, y: h.y });
        this.sfx('power', 0.8);
      }
    }
  }

  /** Curse one: it smoulders (a share of the hit that cursed it, each second); a stronger curse takes the place of a weaker. */
  private curseOne(m: Monster, dmg: number): void {
    const W = WARLOCK_TUNE.curse;
    const dps = dmg * W.share;
    if ((m.curseT ?? 0) <= 0 || dps > (m.curseDps ?? 0)) m.curseDps = dps;
    m.curseT = W.secs;
  }

  /** His hellfire on one: it burns, hard (a share of the hit that set it, each second); a stronger burn takes the place of a weaker. */
  private hellOnIt(m: Monster, dmg: number): void {
    const W = WARLOCK_TUNE.hell;
    const dps = dmg * W.share;
    if ((m.hellT ?? 0) <= 0) this.emit({ t: 'hellOn', id: m.id, x: m.x, y: m.y });
    if ((m.hellT ?? 0) <= 0 || dps > (m.hellDps ?? 0)) m.hellDps = dps;
    m.hellT = W.secs;
  }

  // ---- HIS TREE (game/talents.ts, the claw: the owner's “Yes, keep it (Recommended)”, 28 Oct 2026) -------------------------

  /** Some of his pact filled (Soul Debt): as a man, full, his arm blazes; the demon's, or the Bound Demon's, it lasts the longer. */
  private fillPact(n: number): void {
    const h = this.hero;
    const full = WARLOCK_TUNE.pact.full;
    const was = h.pact ?? 0;
    if (h.change) return;
    h.pact = Math.min(full, was + n);
    if (h.form !== 'demon' && !this.bound && was < full && h.pact >= full) {
      this.emit({ t: 'pactFull', x: h.x, y: h.y });
      this.sfx('power', 0.8);
    }
  }

  /** HEX CHAIN: his bolt, having struck one cursed, leaps on to the next cursed one near the last, each a moment after, up to three times. */
  private hexChain(from: Monster, i: number): void {
    const T = WARLOCK_TUNE.talents.hexChain;
    const hit: number[] = [from.id];
    const leap = (m: Monster, k: number): void => {
      if (k >= T.leaps) return;
      let best: Monster | null = null;
      let bd: number = T.reach;
      for (const q of this.monsters) {
        if (q.dead || hit.includes(q.id) || (q.curseT ?? 0) <= 0 || this.shutIn(q)) continue;
        const d = Math.hypot(q.x - m.x, q.y - m.y) - q.r;
        if (d < bd) {
          bd = d;
          best = q;
        }
      }
      if (!best) return;
      const to = best;
      hit.push(to.id);
      const x0 = m.x;
      const y0 = m.y;
      this.after(T.gap, () => {
        if (to.dead || this.hero.skills[i]?.id !== 'hellbolt') return;
        this.emit({ t: 'hexLeap', x0, y0, x1: to.x, y1: to.y });
        this.sfx('fire', 0.4);
        this.warlockBy = 'chain';
        try {
          this.hitMonster(to, i, T.share, true);
        } finally {
          this.warlockBy = null;
        }
        leap(to, k + 1);
      });
    };
    leap(from, 0);
  }

  /** BLAZING ARM: his bolt, his pact full and he not changed, bursts where it bites: all near it struck, cursed and set burning. */
  private blaze(m: Monster, i: number, dmg: number): void {
    const T = WARLOCK_TUNE.talents.blazing;
    this.emit({ t: 'blaze', x: m.x, y: m.y, r: T.r });
    this.sfx('fire', 0.7);
    const was = this.warlockBy;
    this.warlockBy = 'blaze';
    try {
      let n = 0;
      for (const o of this.monsters) {
        if (o === m || o.dead || this.shutIn(o) || Math.hypot(o.x - m.x, o.y - m.y) > T.r + o.r) continue;
        this.hitMonster(o, i, T.share, n++ >= 3);
        if (!o.dead) this.curseOne(o, dmg);
      }
    } finally {
      this.warlockBy = was;
    }
  }

  /** What a kill of his sets going (his tree): the demon's (Hunger, Feast, Bloodlust, Damned Souls); a cursed one's (Soul Debt, Pyre). */
  private warlockKill(m: Monster, cursed: boolean): void {
    const h = this.hero;
    const W = WARLOCK_TUNE;
    const T = W.talents;
    const P = W.pact;
    // (the demon's kills: everything that dies while he is the demon, and what the Bound Demon's own rakes kill)
    if (h.form === 'demon' || this.warlockBy === 'bound') {
      if (this.has('hunger')) h.pact = Math.min(P.full, (h.pact ?? 0) + T.hunger.secs * (P.full / P.demonSecs));
      if (this.has('feast')) {
        const n = h.d.maxLife * T.feast.share;
        this.healHero(n);
        this.emit({ t: 'heal', amount: Math.round(n) });
      }
      if (this.has('bloodlust')) h.lust = (h.lust ?? 0) + 1;
      if (this.has('damnedsouls')) this.raiseSoul(m);
    }
    if (cursed) {
      if (this.has('souldebt')) this.fillPact(P.full * T.soulDebt.share);
      if (this.has('pyre')) {
        const x = m.x;
        const y = m.y;
        this.after(0.05, () => this.pyre(x, y));
      }
    }
  }

  /** PYRE: a cursed one bursts in his hellfire as it dies: everything near struck, as his Curse strikes (the demon's: Damning's place). */
  private pyre(x: number, y: number): void {
    const h = this.hero;
    if (h.cls !== 'warlock') return;
    const T = WARLOCK_TUNE.talents.pyre;
    this.emit({ t: 'pyre', x, y, r: T.r });
    this.sfx('fire', 0.6);
    let n = 0;
    for (const o of this.monsters) {
      if (o.dead || this.shutIn(o) || Math.hypot(o.x - x, o.y - y) > T.r + o.r) continue;
      this.hitMonster(o, 1, T.share, n++ >= 3);
    }
  }

  /** DAMNED SOULS: one the demon killed rises as a burning soul, and goes for the nearest enemy left. */
  private raiseSoul(d: Monster): void {
    const T = WARLOCK_TUNE.talents.souls;
    const to = this.nearestTo(d.x, d.y, T.reach, d);
    if (!to) return;
    // (its burns made of the demon's rake: as the demon, his first place's hit; the Bound Demon's, his first place's made a rake)
    const h = this.hero;
    const rake = h.form === 'demon' ? 1 : SKILLS.rake.dmg / SKILLS[h.skills[0].id].dmg;
    this.souls.push({ x: d.x, y: d.y, id: to.id, t: 0, dmg: this.avgHit(0, rake * T.share) });
    this.emit({ t: 'soul', x: d.x, y: d.y, id: to.id });
  }

  /** The nearest enemy to (x, y) within `reach` (to its edge), alive and not shut in; not `not`. */
  private nearestTo(x: number, y: number, reach: number, not: Monster | null = null): Monster | null {
    let best: Monster | null = null;
    let bd = reach;
    for (const q of this.monsters) {
      if (q === not || q.dead || this.shutIn(q)) continue;
      const d = Math.hypot(q.x - x, q.y - y) - q.r;
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
    return best;
  }

  /** TERRIBLE ROAR: the demon's roar (or the Bound Demon's, torn out) curses all it throws back, and they run from him. */
  private terribleRoar(x: number, y: number, r: number): void {
    if (!this.has('terribleroar')) return;
    const h = this.hero;
    const dmg = this.avgHit(0, h.form === 'demon' ? 1 : SKILLS.rake.dmg / SKILLS[h.skills[0].id].dmg);
    for (const m of this.monsters) {
      if (m.dead || this.shutIn(m) || Math.hypot(m.x - x, m.y - y) > r + m.r) continue;
      this.curseOne(m, dmg);
      if (!m.boss) m.fleeT = WARLOCK_TUNE.talents.roar.flee;
    }
  }

  /** (TERRIBLE ROAR) One running from him: straight away from him at its own pace, as far as the floor lets it; what it was winding up is broken off. */
  private runFrom(m: Monster, dt: number): void {
    const h = this.hero;
    this.breakOff(m);
    const dx = m.x - h.x;
    const dy = m.y - h.y;
    const d = Math.hypot(dx, dy) || 1;
    const sp = m.speed * dt;
    this.slide(m, Math.min(m.r, 0.42), (dx / d) * sp, (dy / d) * sp, m.kind === 'bat' ? this.level.open : this.level.walk, true);
    m.fx = dx / d;
    m.fy = dy / d;
    m.anim = sp > 0 ? 'walk' : 'idle';
  }

  /** LAST RITES: Damning goes off by itself at (x, y), as the demon burns out (its place `i`; `k`, its hit made Damning's). */
  private lastRites(x: number, y: number, i: number, k: number): void {
    const s = this.hero.skills[i];
    if (!s) return;
    this.damningAll(i, x, y, SKILLS.damning.radius * s.r.size, s.r.countDmg * k);
  }

  /** A rake of the demon's (or the Bound Demon's): every third, with Hellwave, throws a wave of hellfire on ahead. */
  private rakeDone(x: number, y: number, fx: number, fy: number, frac: number): void {
    const h = this.hero;
    h.rakes = (h.rakes ?? 0) + 1;
    const T = WARLOCK_TUNE.talents.hellwave;
    if (!this.has('hellwave') || h.rakes % T.every !== 0) return;
    this.hellwaves.push({ x: x + fx * 0.6, y: y + fy * 0.6, dx: fx, dy: fy, left: T.far, hit: [], frac: frac * T.share });
    this.emit({ t: 'hellwave', x: x + fx * 0.6, y: y + fy * 0.6, dx: fx, dy: fy, far: T.far, speed: T.speed });
    this.sfx('fire', 0.8);
  }

  /** BOUND DEMON: with his pact full, a tap on him tears the demon out beside him, roaring; he stays a man. */
  private tearOut(): void {
    const h = this.hero;
    const T = WARLOCK_TUNE.talents.bound;
    const sx = h.x + h.fy * 1.3 + h.fx * 0.4;
    const sy = h.y - h.fx * 1.3 + h.fy * 0.4;
    const p = this.isOpen(sx, sy) ? { x: sx, y: sy } : { x: h.x, y: h.y };
    this.bound = { x: p.x, y: p.y, fx: h.fx, fy: h.fy, act: 'arrive', actT: 0, target: -1, did: false, walked: 0, rakeCd: T.arrive };
    h.lust = 0;
    h.rakes = 0;
    this.emit({ t: 'bound', x: p.x, y: p.y });
    const R = WARLOCK_TUNE.change.roar;
    this.emit({ t: 'roar', x: p.x, y: p.y, r: R });
    this.emit({ t: 'shake', amount: 4 });
    this.sfx('explode', 0.7);
    for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - p.x, m.y - p.y) <= R + m.r) this.throwMonster(m, p.x, p.y, 1.5, 0.25);
    this.terribleRoar(p.x, p.y, R);
  }

  /** The Bound Demon's pact run dry: it burns out where it stands (Last Rites: Damning goes off round it). */
  private boundBurnsOut(): void {
    const b = this.bound;
    const h = this.hero;
    if (!b || b.act === 'out') return;
    b.act = 'out';
    b.actT = 0;
    h.pact = 0;
    this.emit({ t: 'boundOut', x: b.x, y: b.y });
    this.sfx('deny', 0.8);
    // (Damning's hit, from his second place: as a man that is the Curse's, made Damning's)
    if (this.has('lastrites')) this.lastRites(b.x, b.y, 1, SKILLS.damning.dmg / SKILLS[h.skills[1].id].dmg);
    h.lust = 0;
    h.rakes = 0;
  }

  /** His tree's things that go on by themselves: Hellwave's waves, Damned Souls' souls, the Bound Demon. */
  private updateWarlockTree(dt: number): void {
    const h = this.hero;
    const T = WARLOCK_TUNE.talents;
    // (HELLWAVE: each wave's front goes on, striking and setting burning what it comes to, each once, till a wall or its end)
    for (let k = this.hellwaves.length - 1; k >= 0; k--) {
      const w = this.hellwaves[k];
      const step = Math.min(w.left, T.hellwave.speed * dt);
      w.x += w.dx * step;
      w.y += w.dy * step;
      w.left -= step;
      this.warlockBy = 'wave';
      try {
        for (const m of this.monsters) {
          if (m.dead || w.hit.includes(m.id) || this.shutIn(m)) continue;
          if (Math.hypot(m.x - w.x, m.y - w.y) > T.hellwave.width + m.r) continue;
          w.hit.push(m.id);
          this.hitMonster(m, 0, w.frac, w.hit.length > 3);
        }
      } finally {
        this.warlockBy = null;
      }
      if (w.left <= 0 || !this.isOpen(w.x, w.y)) this.hellwaves.splice(k, 1);
    }
    // (DAMNED SOULS: each flies to the one it goes for; if that one is gone, to the nearest left; in, it curses it and sets it burning)
    for (let k = this.souls.length - 1; k >= 0; k--) {
      const s = this.souls[k];
      s.t += dt;
      let to = this.monsters.find((q) => q.id === s.id && !q.dead) ?? null;
      if (!to) {
        to = this.nearestTo(s.x, s.y, T.souls.reach);
        if (!to || s.t > 4) {
          this.souls.splice(k, 1);
          continue;
        }
        s.id = to.id;
      }
      const d = Math.hypot(to.x - s.x, to.y - s.y);
      const step = T.souls.speed * dt;
      if (d <= step + to.r * 0.5) {
        this.souls.splice(k, 1);
        this.emit({ t: 'soulIn', x: to.x, y: to.y });
        this.sfx('fire', 0.5);
        this.curseOne(to, s.dmg);
        this.hellOnIt(to, s.dmg);
        continue;
      }
      s.x += ((to.x - s.x) / d) * step;
      s.y += ((to.y - s.y) / d) * step;
    }
    // (THE BOUND DEMON)
    const b = this.bound;
    if (!b) return;
    const B = T.bound;
    b.actT += dt;
    const lust = this.has('bloodlust') ? Math.min(T.bloodlust.most, 1 + (h.lust ?? 0) * T.bloodlust.each) : 1;
    b.rakeCd -= dt * lust;
    if (h.cls !== 'warlock' || this.over) {
      this.bound = null;
      return;
    }
    if (b.act === 'out') {
      if (b.actT >= B.out) this.bound = null;
      return;
    }
    if (b.act === 'arrive') {
      if (b.actT >= B.arrive) {
        b.act = 'stand';
        b.actT = 0;
      }
      return;
    }
    // (left far behind, or in another place: torn out beside him again)
    if (Math.hypot(b.x - h.x, b.y - h.y) > 12 || !this.isOpen(b.x, b.y)) {
      b.x = h.x + h.fy * 1.3;
      b.y = h.y - h.fx * 1.3;
      if (!this.isOpen(b.x, b.y)) {
        b.x = h.x;
        b.y = h.y;
      }
      b.act = 'arrive';
      b.actT = B.arrive * 0.5;
      this.emit({ t: 'bound', x: b.x, y: b.y });
      return;
    }
    const face = (x: number, y: number): void => {
      const d = Math.hypot(x - b.x, y - b.y);
      if (d > 0.05) {
        b.fx = (x - b.x) / d;
        b.fy = (y - b.y) / d;
      }
    };
    if (b.act === 'rake') {
      if (!b.did && b.actT >= B.hit / lust) {
        b.did = true;
        const m = this.monsters.find((q) => q.id === b.target && !q.dead);
        if (m && Math.hypot(m.x - b.x, m.y - b.y) <= B.reach + m.r + 0.6) {
          const frac = SKILLS.rake.dmg / SKILLS[h.skills[0].id].dmg;
          this.emit({ t: 'boundRake', x: m.x, y: m.y, dx: b.fx, dy: b.fy });
          this.sfx('swing', 0.8);
          this.warlockBy = 'bound';
          try {
            this.hitMonster(m, 0, frac, false);
          } finally {
            this.warlockBy = null;
          }
          this.rakeDone(b.x, b.y, b.fx, b.fy, frac);
        }
      }
      if (b.actT >= (B.hit + 0.35) / lust) {
        b.act = 'stand';
        b.actT = 0;
      }
      return;
    }
    // (what to go for: the nearest awake enemy near him that it can see)
    let best: Monster | null = null;
    let bd = 1e9;
    for (const m of this.monsters) {
      if (m.dead || !m.seen || m.state === 'sleep' || this.shutIn(m)) continue;
      if (Math.hypot(m.x - h.x, m.y - h.y) > B.hunt) continue;
      const d = Math.hypot(m.x - b.x, m.y - b.y) - m.r;
      if (d < bd && this.sees(b.x, b.y, m.x, m.y)) {
        bd = d;
        best = m;
      }
    }
    if (best && bd <= B.reach && b.rakeCd <= 0) {
      face(best.x, best.y);
      b.act = 'rake';
      b.actT = 0;
      b.did = false;
      b.target = best.id;
      b.rakeCd = B.every;
      return;
    }
    let gx: number;
    let gy: number;
    let stop: number;
    if (best && bd > B.reach * 0.8) {
      gx = best.x;
      gy = best.y;
      stop = B.reach * 0.7 + best.r;
    } else if (best) {
      face(best.x, best.y);
      gx = b.x;
      gy = b.y;
      stop = 1;
    } else {
      gx = h.x + h.fy * B.near - h.fx * 0.4;
      gy = h.y - h.fx * B.near - h.fy * 0.4;
      stop = 0.5;
    }
    const d = Math.hypot(gx - b.x, gy - b.y);
    if (d > stop) {
      const step = Math.min(d - stop, B.speed * dt);
      const was = { x: b.x, y: b.y };
      this.slide(b, 0.45, ((gx - b.x) / d) * step, ((gy - b.y) / d) * step, this.level.walk);
      const went = Math.hypot(b.x - was.x, b.y - was.y);
      b.walked += went;
      if (went > 1e-4) face(gx, gy);
      if (b.act !== 'walk') {
        b.act = 'walk';
        b.actT = 0;
      }
    } else if (b.act !== 'stand') {
      b.act = 'stand';
      b.actT = 0;
    }
  }

  // ---- THE BRAWLER (game/brawler.ts) -----------------------------------------------------------

  /** The pace of the hero's weapon's quick attack, as the weapon gives it (his punches' Swiftness is read against it). */
  private weaponRate(): number {
    const w = this.hero.gear.mainhand;
    return w && w.aps ? w.aps : 1;
  }

  /**
   * A punch of his landing: the one in front within its reach (the body blow, all round him), struck for its share of the
   * hit; the uppercut stuns it, the holds knock it back, the haymaker launches it down the line. Its name floats over him.
   * How many it struck. (THE BRAWLER'S TREE: what his talents make of it, each where it happens.)
   */
  private landPunch(i: number, name: PunchName, ox: number, oy: number, dx: number, dy: number, frac: number, n = 0, echo = false, wakes = true): number {
    const h = this.hero;
    const P = PUNCHES[name];
    const r = h.skills[i].r;
    const reach = P.reach * r.size;
    const hits: Monster[] = [];
    if (P.round) {
      for (const m of this.monsters) {
        if (m.dead || this.shutIn(m)) continue;
        if (Math.hypot(m.x - ox, m.y - oy) <= P.round * r.size + m.r) hits.push(m);
      }
    } else {
      // (the one in front: the nearest the way he punches. THE BRAWLER'S TREE: Wide Cross, the cross strikes every enemy in
      // front of him, not only the first)
      const front: { m: Monster; sc: number }[] = [];
      for (const m of this.monsters) {
        if (m.dead || this.shutIn(m)) continue;
        const mx = m.x - ox;
        const my = m.y - oy;
        const dist = Math.hypot(mx, my);
        if (dist > reach + m.r) continue;
        const dot = dist > 0.01 ? (mx * dx + my * dy) / dist : 1;
        if (dot < 0.35 && dist > 0.9 + m.r) continue;
        front.push({ m, sc: dist - dot * 0.5 });
      }
      front.sort((a, b) => a.sc - b.sc);
      const wide = name === 'cross' && this.has('widecross');
      for (const f of wide ? front : front.slice(0, 1)) hits.push(f.m);
    }
    this.emit({ t: 'punch', name, x: ox, y: oy, dx, dy, big: P.big, n, echo: echo || undefined, hit: hits.length > 0 });
    const words = this.fronts(i);
    this.sfx(words.includes('power') ? 'power' : P.big ? 'slam' : 'hit', P.big ? 0.8 : 0.6);
    if (P.big) this.emit({ t: 'shake', amount: P.big === 2 ? 5 : 2.5 });
    const first = hits[0];
    if (first && words.includes('heavy')) this.emit({ t: 'heavy', x: first.x, y: first.y, r: P.round ? P.round * r.size : 1.1, big: !!P.round });
    // (THE BRAWLER'S TREE: Big Uppercut, his uppercut twice as hard)
    const big = name === 'uppercut' && this.has('biguppercut');
    const share = P.share * (big ? BRAWL_TUNE.talents.bigUppercut.mult : 1);
    // (Pinball: whom the knocks this blow begins have struck, one list for them all: those it struck itself to begin with)
    const knocked = hits.map((m) => m.id);
    let k = 0;
    for (const m of hits) {
      // (Tenderize: the one his punches have been on takes more)
      const before = m.life + m.shield;
      this.hitMonster(m, i, frac * share * this.tenderOf(m), k++ >= 3);
      if (m.dead) continue;
      // (Bleeders: a body blow makes each it hits bleed half the blow again)
      if (name === 'body blow' && this.has('bleeders')) this.bleed(m, before - (m.life + m.shield));
      // (Knockout: his uppercut knocks out one below a fifth of its life; a boss, stunned)
      if (name === 'uppercut' && this.has('knockout') && this.knockOut(m, i)) continue;
      // (Big Uppercut: thrown up, it comes down stunned)
      if (P.stun && !(big && this.popUp(m))) m.stunT = Math.max(m.stunT, P.stun);
      if (P.stagger) m.staggerT = Math.max(m.staggerT, P.stagger);
      if (P.launch && !m.boss && n === 0 && !echo) {
        const far = Math.hypot(m.x - ox, m.y - oy) || 1;
        const lx = far > 0.05 ? (m.x - ox) / far : dx;
        const ly = far > 0.05 ? (m.y - oy) / far : dy;
        this.cannonballs.push({ id: m.id, dx: lx, dy: ly, left: BRAWL_TUNE.cannonball.far, skill: i, frac: frac * P.share * BRAWL_TUNE.cannonball.share, hit: [m.id] });
        this.emit({ t: 'cannonball', id: m.id, x: m.x, y: m.y, dx: lx, dy: ly });
      } else if (P.throw) {
        this.throwMonster(m, ox, oy, P.throw, 0.18);
        // (Pinball: knocked back, it hurts what it is knocked into)
        if (this.has('pinball')) this.pinball(m, i, frac * share, knocked);
      }
    }
    this.tenderized(hits);
    if (first) {
      this.landed(i);
      // (a splash off the one it struck, as a sword's: Flame's explosion, Power's shock through the ground)
      if (r.splash > 0) {
        const rad = r.splash * r.size;
        this.emit({ t: 'burst', x: first.x, y: first.y, r: rad, el: r.element, style: r.splashDmg >= 1 ? 'blast' : 'shock', words, n, echo });
        for (const o of this.monsters) {
          if (o.dead || hits.includes(o) || this.shutIn(o)) continue;
          if (Math.hypot(o.x - first.x, o.y - first.y) <= rad + o.r) this.hitMonster(o, i, frac * P.share * r.splashDmg, true);
        }
      }
      if (r.pull > 0) this.pullIn(i, first.x, first.y, r.splash > 0 ? r.splash * r.size : 0, true);
    }
    this.breakProps(ox + dx * reach * 0.6, oy + dy * reach * 0.6, 0.9, i);
    // (what the words behind it leave, a punch leaves where it lands, once a press)
    if (wakes && n === 0 && !echo) this.wake(i, hits.length ? hits[0].x : ox + dx * reach * 0.7, hits.length ? hits[0].y : oy + dy * reach * 0.7, Math.max(1, P.round ?? reach * 0.6), frac);
    // (THE BRAWLER'S TREE: Shockwave, a hold of his sends a wave of air on ahead, once a press)
    if (i === 1 && n === 0 && !echo && this.has('shockwave')) this.sendWave(i, ox, oy, dx, dy, frac * share);
    return hits.length;
  }

  /** What his haymaker launched flies down the line; each it meets is bowled over and struck. Stopped by a wall, it stops. */
  private updateCannonballs(dt: number): void {
    const C = BRAWL_TUNE.cannonball;
    for (let k = this.cannonballs.length - 1; k >= 0; k--) {
      const b = this.cannonballs[k];
      const m = this.monsters.find((q) => q.id === b.id);
      if (!m || m.dead || b.left <= 0) {
        this.cannonballs.splice(k, 1);
        continue;
      }
      const step = Math.min(b.left, C.speed * dt);
      const x0 = m.x;
      const y0 = m.y;
      this.slide(m, Math.min(m.r, 0.42), b.dx * step, b.dy * step, this.level.walk);
      const went = Math.hypot(m.x - x0, m.y - y0);
      b.left -= step;
      if (went < step * 0.3) b.left = 0;
      for (const o of this.monsters) {
        if (o.dead || b.hit.includes(o.id) || this.shutIn(o)) continue;
        if (Math.hypot(o.x - m.x, o.y - m.y) > C.near + o.r) continue;
        b.hit.push(o.id);
        this.emit({ t: 'bowled', x: o.x, y: o.y });
        this.hitMonster(o, b.skill, b.frac * this.tenderOf(o), false);
        if (o.dead) continue;
        // (THE BRAWLER'S TREE: Ten Pins, one bowled over is launched too, on down the line, and bowls over more)
        if (this.has('tenpins') && this.launchPin(o, m, b)) continue;
        // (bowled over: thrown aside, off the line; THE BRAWLER'S TREE: Pinball, it hurts what it is knocked into)
        this.throwMonster(o, m.x - b.dy * 0.3, m.y + b.dx * 0.3, 1.2, 0.2);
        if (this.has('pinball')) this.pinball(o, b.skill, b.frac, b.hit);
      }
    }
  }

  /** His slip over: he comes up with a counter hook into whatever is there (the nearest within its reach); Twin, a second; "of Echoes", a weaker one after. What its words behind it leave, it leaves where he set off, (x0, y0). */
  private brawlerComesUp(x0: number, y0: number): void {
    const h = this.hero;
    const s = h.skills[2];
    if (!s) return;
    const r = s.r;
    const hook = (k: number, frac: number, echo: boolean): void => {
      // (turned to the nearest within its reach, and the hook thrown at it, as a punch of his: landPunch)
      let best: Monster | null = null;
      let bd = 1e9;
      for (const m of this.monsters) {
        if (m.dead || this.shutIn(m)) continue;
        const d = Math.hypot(m.x - h.x, m.y - h.y) - m.r;
        if (d <= PUNCHES.counter.reach * r.size && d < bd) {
          bd = d;
          best = m;
        }
      }
      if (best) this.face(best.x, best.y);
      // (THE BRAWLER'S TREE: a counter that lands, for Bob and Weave and Set-Up)
      if (this.landPunch(2, 'counter', h.x, h.y, h.fx, h.fy, frac * BRAWL_TUNE.slip.share, k, echo, false) > 0) this.counterLanded();
    };
    for (let k = 0; k < r.count; k++) {
      if (k === 0) hook(0, r.countDmg, false);
      else this.after(0.12 * k, () => hook(k, r.countDmg, false));
    }
    this.wake(2, x0, y0, SKILLS[s.id].radius * r.size, r.countDmg);
    if (r.echo > 0) this.echoOf(2, h.x, h.y, h.fx, h.fy, () => hook(0, r.countDmg * r.echo, true));
  }

  // ---- THE BRAWLER'S TREE (game/talents.ts BRAWLER_TREE; its numbers, BRAWL_TUNE.talents) --------------------------
  // The owner approved the tree as drawn (28 Oct 2026); each card's words are what its talent does here. Each is asked after
  // where it happens: Double Jab, Flurry, Set-Up and Heavy Hands in `begin` and `deliver`; Tenderize, Big Uppercut, Knockout,
  // Wide Cross, Bleeders, Pinball and Shockwave in `landPunch`; Ten Pins in `updateCannonballs`; Bob and Weave and Set-Up as
  // his counter lands; Iron Chin and Slip Reflex in `hurtHero` (and `knockHero`, `pullHero`).

  /** His talents' doings, each step: what his uppercut threw up comes down; what he knocked back hurts what it is knocked into; his waves of air go on ahead. */
  private updateBrawl(dt: number): void {
    const B = this.brawl;
    if (B.up.length) this.comeDown(dt);
    if (B.pins.length) this.updatePins();
    if (B.waves.length) this.updateWaves(dt);
  }

  /** (Double Jab) The jab's second, a moment after the first, thrown from where he is then the way the first went (Twin, two again), and his picture throws the jab again. Not if he has slipped or begun another punch meanwhile. */
  private secondJab(i: number, dx: number, dy: number, each: number, count: number): void {
    const h = this.hero;
    const gap = BRAWL_TUNE.talents.doubleJab.gap;
    const p = h.punch;
    h.attackAge = 0;
    h.attackWind = gap;
    h.attackT += gap;
    this.after(gap, () => {
      const hh = this.hero;
      if (!p || hh.punch !== p || hh.move || this.over) return;
      for (let k = 0; k < count; k++) {
        if (k === 0) this.landPunch(i, 'jab', hh.x, hh.y, dx, dy, each, 0, false, false);
        else this.after(0.12 * k, () => this.landPunch(i, 'jab', this.hero.x, this.hero.y, dx, dy, each, k, false, false));
      }
    });
  }

  /** (Tenderize) How much more `m` takes from him: 5% for every punch he has landed on it in a row, up to 50%. */
  private tenderOf(m: Monster): number {
    const t = this.brawl.tender;
    if (!t || t.id !== m.id || !this.has('tenderize')) return 1;
    const T = BRAWL_TUNE.talents.tenderize;
    return 1 + Math.min(T.most, T.each * t.n);
  }

  /** (Tenderize) A punch of his has landed on `hits`: on the one his punches were on, one more; on another, they begin again on it. */
  private tenderized(hits: readonly Monster[]): void {
    if (!hits.length || !this.has('tenderize')) return;
    const t = this.brawl.tender;
    if (t && hits.some((m) => m.id === t.id)) t.n++;
    else this.brawl.tender = { id: hits[0].id, n: 1 };
  }

  /** (Bleeders) `m` bleeds the blow it has just taken again, half of it, over three seconds, on top of what it bleeds still. */
  private bleed(m: Monster, blow: number): void {
    if (m.dead || blow <= 0) return;
    const B = BRAWL_TUNE.talents.bleeders;
    const owed = ((m.bleedT ?? 0) > 0 ? (m.bleedDps ?? 0) * (m.bleedT ?? 0) : 0) + blow * B.share;
    m.bleedT = B.secs;
    m.bleedDps = owed / B.secs;
  }

  /** (Knockout) His uppercut has landed on `m`: below a fifth of its life, it is knocked out (all its life struck off); a boss is stunned three seconds instead. Whether it was. */
  private knockOut(m: Monster, i: number): boolean {
    const K = BRAWL_TUNE.talents.knockout;
    if (m.dead || m.life >= m.maxLife * K.below) return false;
    if (m.boss) {
      m.stunT = Math.max(m.stunT, K.boss);
      this.breakOff(m);
      this.emit({ t: 'knockout', id: m.id, x: m.x, y: m.y, boss: true });
      return true;
    }
    const x = m.x;
    const y = m.y;
    this.damageMonster(m, Math.ceil(m.life + m.shield), 'phys', true, i, true);
    // (one its own rules hold up, as a boss's are, is not knocked out: it is stunned by the uppercut as ever)
    if (!m.dead) return false;
    this.emit({ t: 'knockout', id: m.id, x, y, boss: false });
    this.emit({ t: 'shake', amount: 4 });
    return true;
  }

  /** (Big Uppercut) `m` thrown up: up for a moment, it then comes down stunned for two seconds (stunned all the while). A boss stands his ground. Whether it was thrown. */
  private popUp(m: Monster): boolean {
    if (m.dead || m.boss || m.state === 'act' || this.shutIn(m)) return false;
    const B = BRAWL_TUNE.talents.bigUppercut;
    const was = this.brawl.up.find((u) => u.id === m.id);
    if (was) was.t = 0;
    else this.brawl.up.push({ id: m.id, t: 0 });
    m.thrown = undefined;
    m.stunT = Math.max(m.stunT, B.up + B.stun);
    this.breakOff(m);
    this.emit({ t: 'popUp', id: m.id, x: m.x, y: m.y });
    return true;
  }

  /** (Big Uppercut) What is up comes down, stunned two seconds from then. */
  private comeDown(dt: number): void {
    const B = BRAWL_TUNE.talents.bigUppercut;
    const up = this.brawl.up;
    for (let k = up.length - 1; k >= 0; k--) {
      const u = up[k];
      const m = this.monsters.find((q) => q.id === u.id);
      u.t += dt;
      if (!m || m.dead) {
        up.splice(k, 1);
        continue;
      }
      if (u.t < B.up) continue;
      up.splice(k, 1);
      m.stunT = Math.max(m.stunT, B.stun);
      this.emit({ t: 'comeDown', id: m.id, x: m.x, y: m.y, secs: B.stun });
      this.emit({ t: 'shake', amount: 1.5 });
    }
  }

  /** (Big Uppercut) How far up `m` is, 0 to 1 of the way to the top (0 on the floor): for its picture. */
  upOf(m: Monster): number {
    const u = this.brawl.up.length ? this.brawl.up.find((q) => q.id === m.id) : undefined;
    if (!u) return 0;
    const k = Math.min(1, u.t / BRAWL_TUNE.talents.bigUppercut.up);
    return 4 * k * (1 - k);
  }

  /** (Pinball) `m`, knocked back by a blow of his (ability `skill`, the blow's share `frac`), will hurt what it is knocked into; `hit`: whom the knocks that blow began have struck. */
  private pinball(m: Monster, skill: number, frac: number, hit: number[]): void {
    if (m.dead || !m.thrown) return;
    const pins = this.brawl.pins;
    const pin = { id: m.id, skill, frac, hit };
    const k = pins.findIndex((q) => q.id === m.id);
    if (k >= 0) pins[k] = pin;
    else pins.push(pin);
  }

  /** (Pinball) What he knocked back, as it flies: what it is knocked into (ahead of it) is hurt and knocked back in its turn. */
  private updatePins(): void {
    const P = BRAWL_TUNE.talents.pinball;
    const pins = this.brawl.pins;
    for (const q of [...pins]) {
      const m = this.monsters.find((o) => o.id === q.id);
      const T = m ? m.thrown : undefined;
      if (m && !m.dead && T) {
        for (const o of this.monsters) {
          if (o === m || o.dead || q.hit.includes(o.id) || this.shutIn(o)) continue;
          const ox = o.x - m.x;
          const oy = o.y - m.y;
          if (Math.hypot(ox, oy) > o.r + m.r + P.touch || ox * T.vx + oy * T.vy <= 0) continue;
          q.hit.push(o.id);
          this.emit({ t: 'pinball', x: (o.x + m.x) / 2, y: (o.y + m.y) / 2 });
          this.hitMonster(o, q.skill, q.frac * P.share * this.tenderOf(o), true);
          if (o.dead) continue;
          this.throwMonster(o, m.x, m.y, P.far);
          this.pinball(o, q.skill, q.frac, q.hit);
        }
      }
      if (!m || m.dead || !m.thrown) {
        const at = pins.indexOf(q);
        if (at >= 0) pins.splice(at, 1);
      }
    }
  }

  /** (Ten Pins) `o`, bowled over by the cannonball `b` (the monster `m`), is launched in its turn: on down the line, veering off it to its own side. A boss, or one in an act of its own, is not. Whether it was. */
  private launchPin(o: Monster, m: Monster, b: { dx: number; dy: number; skill: number; frac: number; hit: number[] }): boolean {
    if (o.boss || o.state === 'act') return false;
    const T = BRAWL_TUNE.talents.tenPins;
    const side = (o.x - m.x) * -b.dy + (o.y - m.y) * b.dx >= 0 ? 1 : -1;
    let lx = b.dx - b.dy * side * T.veer;
    let ly = b.dy + b.dx * side * T.veer;
    const l = Math.hypot(lx, ly) || 1;
    lx /= l;
    ly /= l;
    o.thrown = undefined;
    this.cannonballs.push({ id: o.id, dx: lx, dy: ly, left: T.far, skill: b.skill, frac: b.frac, hit: b.hit });
    this.emit({ t: 'cannonball', id: o.id, x: o.x, y: o.y, dx: lx, dy: ly });
    return true;
  }

  /** (Shockwave) A wave of air sent on ahead from (ox, oy), the way (dx, dy), three tiles or to a wall, striking for its share of the blow (`frac`). */
  private sendWave(i: number, ox: number, oy: number, dx: number, dy: number, frac: number): void {
    const S = BRAWL_TUNE.talents.shockwave;
    let far = 0;
    while (far < S.far && this.isOpen(ox + dx * Math.min(S.far, far + 0.1), oy + dy * Math.min(S.far, far + 0.1))) far = Math.min(S.far, far + 0.1);
    this.brawl.waves.push({ x: ox, y: oy, dx, dy, gone: 0, far, skill: i, frac: frac * S.share, hit: [] });
    this.emit({ t: 'shockwave', x: ox, y: oy, dx, dy, far, speed: S.speed });
  }

  /** (Shockwave) The waves go on: what the line they have swept takes in (its width either side) is struck, each once. */
  private updateWaves(dt: number): void {
    const S = BRAWL_TUNE.talents.shockwave;
    const waves = this.brawl.waves;
    for (let k = waves.length - 1; k >= 0; k--) {
      const w = waves[k];
      w.gone = Math.min(w.far, w.gone + S.speed * dt);
      for (const m of this.monsters) {
        if (m.dead || w.hit.includes(m.id) || this.shutIn(m)) continue;
        const along = (m.x - w.x) * w.dx + (m.y - w.y) * w.dy;
        const off = Math.abs((m.y - w.y) * w.dx - (m.x - w.x) * w.dy);
        if (along < -m.r || along > w.gone + m.r || off > S.wide + m.r) continue;
        w.hit.push(m.id);
        this.hitMonster(m, w.skill, w.frac * this.tenderOf(m), true);
      }
      if (w.gone >= w.far) waves.splice(k, 1);
    }
  }

  /** (Bob and Weave, Set-Up) A counter of his has landed: his slip is ready again at once; his next press is the combo's last punch. */
  private counterLanded(): void {
    const h = this.hero;
    const s = h.skills[2];
    if (this.has('bobweave') && s && s.charges < s.maxCharges) {
      s.charges = s.maxCharges;
      s.cd = 0;
      this.emit({ t: 'slipReady', x: h.x, y: h.y });
    }
    if (this.has('setup') && !this.brawl.setUp) {
      this.brawl.setUp = true;
      this.emit({ t: 'setUp', x: h.x, y: h.y });
    }
  }

  /** (Iron Chin) He is winding up a hold. */
  private ironChin(): boolean {
    const w = this.hero.windup;
    return !!w && w.skill === 1 && this.has('ironchin');
  }

  /**
   * (Slip Reflex) A blow from (fromX, fromY) would hit him: once every six seconds it is slipped by itself. He weaves a step
   * aside (the side there is room on; none, where he stands), whatever he was making broken off as his slip breaks it off, and
   * comes up with his counter (brawlerComesUp). His slip's own wait is not touched. Whether it was slipped.
   */
  private slipReflex(fromX: number, fromY: number): boolean {
    const R = BRAWL_TUNE.talents.slipReflex;
    const h = this.hero;
    if (!this.has('slipreflex') || this.time - this.brawl.reflexAt < R.every) return false;
    this.brawl.reflexAt = this.time;
    let ax = h.x - fromX;
    let ay = h.y - fromY;
    const len = Math.hypot(ax, ay);
    if (len < 0.01) {
      ax = -h.fx;
      ay = -h.fy;
    } else {
      ax /= len;
      ay /= len;
    }
    let land = { x: h.x, y: h.y };
    for (const side of [1, -1]) {
      const at = this.reachPoint(h.x - ay * side * R.far, h.y + ax * side * R.far, R.far);
      if (Math.hypot(at.x - h.x, at.y - h.y) >= 0.5) {
        land = at;
        break;
      }
    }
    if (h.channel) this.endChannel(true);
    if (h.windup && h.windup.skill === 0) h.swingT = 0;
    h.windup = null;
    h.channel = null;
    h.queued = null;
    h.attackT = 0;
    h.step = null;
    h.punch = null;
    h.move = { kind: 'slip', t: 0, dur: BRAWL_TUNE.slip.secs, x0: h.x, y0: h.y, x1: land.x, y1: land.y };
    h.invuln = Math.max(h.invuln, BRAWL_TUNE.slip.secs + 0.15);
    this.sfx('dodge');
    this.emit({ t: 'slip', x0: h.x, y0: h.y, x1: land.x, y1: land.y });
    this.emit({ t: 'slipReflex', x: h.x, y: h.y });
    return true;
  }

  // ---- THE TINKERER (game/tinkerer.ts) ---------------------------------------------------------

  /** Her Contraption thrown from (ox, oy) toward (tx, ty): where it comes to rest; a fourth puts the oldest out of action. */
  private throwContraption(i: number, ox: number, oy: number, tx: number, ty: number, frac: number): void {
    const C = TINKER_TUNE.contraption;
    const def = SKILLS[this.hero.skills[i].id];
    const p = Math.hypot(tx - ox, ty - oy) < 0.6 ? this.reachPoint(ox + this.hero.fx * 2, oy + this.hero.fy * 2, def.range) : this.reachPoint(tx, ty, def.range);
    const standing = this.contraptions.filter((q) => q.broke < 0);
    while (standing.length >= C.most) {
      const old = standing.shift() as Contraption;
      this.breakContraption(old);
    }
    const c: Contraption = { id: this.nextThing++, x0: ox, y0: oy, x: p.x, y: p.y, t: 0, next: C.first, shotAge: 9, fx: this.hero.fx, fy: this.hero.fy, broke: -1, echo: 0, woke: false, skill: i, frac };
    this.contraptions.push(c);
    this.emit({ t: 'contraption', id: c.id, x0: ox, y0: oy, x: p.x, y: p.y });
    this.sfx('trapSet', 0.6);
  }

  /**
   * HER VIAL TOSS: a vial lobbed from her hand at (ox, oy) to where she aimed (`n` the how-manyth of Twin's, each further to
   * one side); it bursts where it comes down (the vials' step, updateTinkerer). Aimed at her feet (one at her very side), it
   * comes down at her feet: it bursts on what is on her, and never on her.
   */
  private tossVial(i: number, ox: number, oy: number, tx: number, ty: number, frac: number, n: number, echo: boolean): void {
    const h = this.hero;
    const T = TINKER_TUNE.toss;
    const def = SKILLS[h.skills[i].id];
    const p = this.reachPoint(tx, ty, def.range);
    // (Twin's: the second lands beside the first, across the way she threw)
    const far = Math.hypot(p.x - ox, p.y - oy) || 1;
    const side = n === 0 ? 0 : (n % 2 ? 1 : -1) * Math.ceil(n / 2) * T.twin;
    const x1 = p.x - ((p.y - oy) / far) * side;
    const y1 = p.y + ((p.x - ox) / far) * side;
    const v: Vial = { x0: ox, y0: oy, x1, y1, t: 0, flight: T.flight, skill: i, frac, wake: n === 0 && !echo };
    this.brewVial(v);
    this.vials.push(v);
    this.emit({ t: 'vial', id: -1, x0: ox, y0: oy, x1, y1, flight: T.flight, n, echo: echo || undefined, ...(v.big ? { big: true } : {}) });
    if (n === 0) this.sfx('shot', echo ? 0.3 : 0.5);
  }

  /**
   * A vial of hers leaving her hand or a Contraption's mouth: what her tree puts in it. (THE BIG ONE: every fifth vial a big
   * one. MAD MIXTURE: a brew at random, burning, freezing or poisoning.)
   */
  private brewVial(v: Vial): void {
    if (this.has('thebigone') && ++this.vialsThrown % TINKER_TUNE.talents.bigOne.every === 0) v.big = true;
    if (this.has('madmixture')) v.brew = this.rng.pick<Brew>(['burn', 'freeze', 'poison']);
  }

  /** A Contraption put out of action: it falls apart where it stands. */
  private breakContraption(c: Contraption): void {
    if (c.broke >= 0) return;
    c.broke = 0;
    this.emit({ t: 'contraptionEnd', id: c.id, x: c.x, y: c.y });
  }

  /** A vial lobbed out of a Contraption at the nearest enemy awake within its reach (as many as Twin says, at as many). */
  private lobVial(c: Contraption, frac: number, echo = false): boolean {
    const C = TINKER_TUNE.contraption;
    const s = this.hero.skills[c.skill];
    const count = s ? s.r.count : 1;
    const near = this.monsters
      .filter((m) => !m.dead && m.seen && m.state !== 'sleep' && !this.shutIn(m) && Math.hypot(m.x - c.x, m.y - c.y) <= C.reach && this.sees(c.x, c.y, m.x, m.y))
      .sort((a, b) => Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y));
    if (!near.length) return false;
    for (let n = 0; n < (echo ? 1 : count); n++) {
      const m = near[Math.min(n, near.length - 1)];
      // (aimed where it is going, as a player soon learns to lob)
      const lead = m.speed > 0 && m.state === 'chase' ? 0.35 : 0;
      const x1 = m.x + m.fx * lead;
      const y1 = m.y + m.fy * lead;
      const v: Vial = { x0: c.x, y0: c.y, x1, y1, t: 0, flight: C.flight, skill: c.skill, frac, wake: !c.woke && !echo && n === 0 };
      if (v.wake) c.woke = true;
      this.brewVial(v);
      this.vials.push(v);
      this.emit({ t: 'vial', id: c.id, x0: c.x, y0: c.y, x1, y1, flight: C.flight, n, echo: echo || undefined, ...(v.big ? { big: true } : {}) });
      const far = Math.hypot(x1 - c.x, y1 - c.y) || 1;
      c.fx = (x1 - c.x) / far;
      c.fy = (y1 - c.y) / far;
    }
    c.shotAge = 0;
    this.sfx('trapSet', echo ? 0.3 : 0.5);
    return true;
  }

  /**
   * A vial of hers bursting where it comes down, hurting all within the ability's radius; and what her tree adds to it:
   * Cluster Vials, Tar, Mad Mixture, Alchemy, The Big One, Growth Serum.
   */
  private vialBursts(v: Vial): void {
    const T = TINKER_TUNE.talents;
    const s = this.hero.skills[v.skill];
    if (!s) return;
    let rad = SKILLS[s.id].radius * s.r.size;
    // (CLUSTER VIALS: a little one bursts smaller; THE BIG ONE, three times as wide)
    if (v.little) rad *= T.cluster.size;
    if (v.big) rad *= T.bigOne.wide;
    const x = v.x1;
    const y = v.y1;
    this.emit({ t: 'vialBurst', x, y, r: rad, ...(v.little ? { little: true } : {}), ...(v.big ? { big: true } : {}), ...(v.brew ? { brew: v.brew } : {}) });
    this.sfx('shatter', v.little ? 0.2 : 0.35);
    if (v.big) {
      this.emit({ t: 'shake', amount: 4 });
      this.sfx('slam', 0.8);
    }
    // (what it bursts on, for what her tree does to them after)
    const caught = v.brew || v.big ? this.monsters.filter((m) => !m.dead && !this.shutIn(m) && Math.hypot(m.x - x, m.y - y) <= rad + m.r) : [];
    // (its first vial leaves, where it bursts, what the words behind it leave: once a Contraption. ALCHEMY: what it kills
    // drops gold, `brewing`, dropLoot)
    this.brewing = true;
    this.blast(v.skill, x, y, rad, v.frac, 'vial', 0, false, v.wake);
    this.brewing = false;
    // (MAD MIXTURE: its brew on top of its own words, on what it burst on)
    if (v.brew) this.brewOn(caught, v.brew, v.skill, v.frac);
    // (THE BIG ONE: everything it burst on knocked down)
    if (v.big) {
      for (const m of caught) {
        if (m.dead) continue;
        this.throwMonster(m, x, y, T.bigOne.far, 0.2);
        this.stunMonster(m, T.bigOne.down);
      }
    }
    // (TAR: a puddle of it left where it burst)
    if (!v.little && this.has('tar')) {
      const r = rad * T.tar.size;
      this.tars.push({ x, y, r, t: 0 });
      this.emit({ t: 'tar', x, y, r, secs: T.tar.secs });
    }
    // (GROWTH SERUM: bursting by her Golem, it makes it grow)
    if (this.has('growthserum')) {
      for (const g of this.golemsUp()) if (Math.hypot(g.x - x, g.y - y) <= rad + this.golemBody(g) + T.growth.near) this.growGolem(g);
    }
    // (CLUSTER VIALS: it bursts into three little ones that bounce out and burst again)
    if (!v.little && this.has('clustervials')) this.clusterOf(v);
  }

  /** Her tree's CLUSTER VIALS: vial `v`, bursting, breaks into little ones that bounce out round it (a wall stops one short). */
  private clusterOf(v: Vial): void {
    const K = TINKER_TUNE.talents.cluster;
    const a0 = this.rng.range(0, Math.PI * 2);
    for (let n = 0; n < K.n; n++) {
      const a = a0 + (n / K.n) * Math.PI * 2;
      let far = K.far;
      while (far > 0 && !this.isOpen(v.x1 + Math.cos(a) * far, v.y1 + Math.sin(a) * far)) far = Math.max(0, far - 0.25);
      const x1 = v.x1 + Math.cos(a) * far;
      const y1 = v.y1 + Math.sin(a) * far;
      const l: Vial = { x0: v.x1, y0: v.y1, x1, y1, t: 0, flight: K.flight, skill: v.skill, frac: v.frac * K.share, wake: false, little: true, ...(v.brew ? { brew: v.brew } : {}) };
      this.vials.push(l);
      this.emit({ t: 'vial', id: -1, x0: v.x1, y0: v.y1, x1, y1, flight: K.flight, n, little: true });
    }
  }

  /**
   * Her tree's MAD MIXTURE: a vial's brew on those it burst on, on top of its own words: burning (a burn of `burn` of the
   * vial's hit over a burn's three seconds), freezing (a chill: on one chilled already, frozen, as frost does) or poisoning
   * (a dose of `poison` of the vial's hit over the poison's time).
   */
  private brewOn(ms: readonly Monster[], brew: Brew, i: number, frac: number): void {
    const X = TINKER_TUNE.talents.mixture;
    const d = this.hero.d;
    const s = this.hero.skills[i];
    const hit = ((d.dmgMin + d.dmgMax) / 2) * (s ? s.r.dmgMult : 1) * frac;
    for (const m of ms) {
      if (m.dead) continue;
      if (brew === 'burn') {
        const dps = (hit * X.burn) / 3;
        if (m.burnT <= 0) this.emit({ t: 'ignite', x: m.x, y: m.y });
        if (m.burnT <= 0 || dps > m.burnDps) m.burnDps = dps;
        m.burnT = Math.max(m.burnT, 3);
        m.lastSkill = i;
      } else if (brew === 'freeze') this.chillMonster(m, X.chill);
      else this.poisonMonster(m, (hit * X.poison) / TUNE.poisonTime, i);
    }
  }

  /** Her tree's TAR: what walks in a puddle of it moves at a crawl (this share of its speed; 1, in none). A bat flies over it. */
  private inTar(m: Monster): number {
    if (m.kind === 'bat') return 1;
    for (const p of this.tars) if (Math.hypot(m.x - p.x, m.y - p.y) <= p.r + m.r * 0.5) return TINKER_TUNE.talents.tar.crawl;
    return 1;
  }

  /** She comes down from her blast jump. (Her tree's BOMBS AWAY: a second bomb goes off where she lands.) */
  private blastLands(): void {
    const h = this.hero;
    this.emit({ t: 'blastLand', x: h.x, y: h.y });
    const s = h.skills[2];
    if (!this.has('bombsaway') || !s || SKILLS[s.id].kind !== 'blastjump') return;
    const B = TINKER_TUNE.talents.bombsAway;
    const rad = SKILLS[s.id].radius * s.r.size * B.size;
    const x = h.x;
    const y = h.y;
    this.emit({ t: 'bombsAway', x, y, r: rad });
    this.emit({ t: 'shake', amount: 3 });
    this.sfx('slam', 0.9);
    this.blast(2, x, y, rad, s.r.countDmg * B.share, 'bomb', 0, false, false);
    for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - x, m.y - y) <= rad + m.r) this.throwMonster(m, x, y, TINKER_TUNE.blast.throw, 0.25);
  }

  /** How many Golems she may have out at once: one; two with her tree's MARK II. */
  private golemsMost(): number {
    return this.has('markii') ? TINKER_TUNE.talents.markII : 1;
  }

  /** Her Golems out and not winding down. */
  private golemsUp(): Golem[] {
    return this.golems.filter((g) => g.act !== 'down');
  }

  /** Where Golem `seat` keeps by her, `back` behind her: the first at her one side, Mark II's second at her other. */
  private golemSpot(seat: number, back: number): { x: number; y: number } {
    const h = this.hero;
    const side = seat === 0 ? 1.2 : -1.2;
    return { x: h.x - h.fy * side - h.fx * back, y: h.y + h.fx * side - h.fy * back };
  }

  /** Golem `g` winds down where it stands. */
  private windDown(g: Golem): void {
    g.act = 'down';
    g.actT = 0;
    this.emit({ t: 'golemDown', x: g.x, y: g.y });
  }

  /**
   * Her tap and hold: a Golem whistled out beside her (with her tree's MARK II, a second, at her other side); or, all she
   * may have out already, each set on to ground pound where it stands. (OVERDRIVE: and each sent into overdrive.)
   */
  private whistle(i: number, tx: number, ty: number, frac: number, count: number): void {
    const h = this.hero;
    const G = TINKER_TUNE.golem;
    const up = this.golemsUp();
    if (up.length < this.golemsMost()) {
      const seat = up.some((q) => q.seat === 0) ? 1 : 0;
      const s = this.golemSpot(seat, 0.6);
      const p = this.isOpen(s.x, s.y) ? s : { x: h.x, y: h.y };
      // (one winding down is gone as a new one comes)
      this.golems = up;
      this.golems.push({ x: p.x, y: p.y, fx: h.fx, fy: h.fy, act: 'arrive', actT: 0, did: false, target: -1, ax: p.x, ay: p.y, punchCd: 0, cannonCd: 0, walked: 0, skill: i, seat, overT: 0, growT: 0, zapT: TINKER_TUNE.talents.tesla.every });
      this.golems.sort((a, b) => a.seat - b.seat);
      this.emit({ t: 'golemArrive', x: p.x, y: p.y });
      this.emit({ t: 'shake', amount: 2 });
      this.sfx('slam', 0.6);
      this.overdrive();
      return;
    }
    // (each turns to where she pointed and pounds the floor before it; Twin, a second pound after)
    for (const g of up) {
      const d = Math.hypot(tx - g.x, ty - g.y);
      if (d > 0.3) {
        g.fx = (tx - g.x) / d;
        g.fy = (ty - g.y) / d;
      }
      g.act = 'pound';
      g.actT = -G.pound.lead;
      g.did = false;
      g.skill = i;
      for (let k = 1; k < count; k++) this.after(G.pound.long * k, () => g.act !== 'down' && this.golems.includes(g) && this.golemPounds(i, g.x, g.y, frac, k, false, g));
    }
    this.overdrive();
  }

  /** Her tree's OVERDRIVE: her whistle sends her Golems into overdrive, moving and striking twice as fast. */
  private overdrive(): void {
    if (!this.has('overdrive')) return;
    for (const g of this.golemsUp()) {
      if (g.overT <= 0) this.emit({ t: 'overdrive', x: g.x, y: g.y });
      g.overT = TINKER_TUNE.talents.overdrive.secs;
    }
  }

  /** A Golem's ground pound landing at (x, y): everything within the ability's radius struck and thrown (`g`, the Golem's). */
  private golemPounds(i: number, x: number, y: number, frac: number, n: number, echo: boolean, g?: Golem): void {
    const s = this.hero.skills[i];
    if (!s) return;
    const rad = SKILLS[s.id].radius * s.r.size;
    this.emit({ t: 'golemPound', x, y, r: rad, n, echo: echo || undefined });
    this.emit({ t: 'shake', amount: n > 0 || echo ? 2.5 : 5 });
    this.sfx('slam', n > 0 || echo ? 0.6 : 1);
    // (GROWTH SERUM: grown, it strikes twice as hard)
    this.blast(i, x, y, rad, frac * (g ? this.golemMight(g) : 1), 'pound', n, echo, n === 0 && !echo);
    for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - x, m.y - y) <= rad + m.r) this.throwMonster(m, x, y, 1.2, 0.2);
    // (her tree's LIGHTNING ROD: for a while after, every enemy near the Golem goes after it instead of her)
    if (g && this.has('lightningrod')) this.lightningRod(g);
    // (PROSPECTOR: it digs up a handful of gold)
    if (this.has('prospector')) this.digGold(x, y, g);
  }

  /** Her tree's LIGHTNING ROD: Golem `g` a decoy for a while, every enemy near it going after it instead of her. */
  private lightningRod(g: Golem): void {
    const R = TINKER_TUNE.talents.rod;
    const d = this.decoys.find((q) => q.golem === g);
    if (d) d.t = R.secs;
    else this.decoys.push({ x: g.x, y: g.y, t: R.secs, r: R.near, size: this.golemBody(g), golem: g });
  }

  /**
   * Her tree's PROSPECTOR: a ground pound at (x, y) digs up a handful of gold, between them about one ordinary gold drop of
   * the floor (TUNE.dropGold's). None in the practice room, where nothing drops.
   */
  private digGold(x: number, y: number, g?: Golem): void {
    if (this.practice) return;
    const n = TINKER_TUNE.talents.prospector.n;
    const all = this.rng.int(TUNE.goldMin, TUNE.goldMax) * Math.max(1, this.power);
    // (where its fist came down, or, against a wall, where it stands)
    const at = this.isOpen(x, y) || !g ? { x, y } : { x: g.x, y: g.y };
    for (let k = 0; k < n; k++) {
      const share = Math.floor(all / n) + (k < all % n ? 1 : 0);
      if (share > 0) this.addDrop('gold', at.x, at.y, share, null, null);
    }
  }

  /** Her tree's GROWTH SERUM: Golem `g` grows, twice as big and twice as strong, for a while. */
  private growGolem(g: Golem): void {
    if (g.growT <= 0) this.emit({ t: 'golemGrow', x: g.x, y: g.y });
    g.growT = TINKER_TUNE.talents.growth.secs;
  }

  /** How far Golem `g`'s body reaches from its middle (GROWTH SERUM: grown, twice as far). */
  private golemBody(g: Golem): number {
    return 0.5 * (g.growT > 0 ? TINKER_TUNE.talents.growth.big : 1);
  }

  /** How many times as strong Golem `g` is (GROWTH SERUM: grown, twice). */
  private golemMight(g: Golem): number {
    return g.growT > 0 ? TINKER_TUNE.talents.growth.strong : 1;
  }

  /** Her Contraptions, her vials, her tar and her Golems, each step. */
  private updateTinkerer(dt: number): void {
    const h = this.hero;
    const C = TINKER_TUNE.contraption;
    // (HER CONTRAPTIONS: set up, they lob; their time up, they fall apart)
    for (let k = this.contraptions.length - 1; k >= 0; k--) {
      const c = this.contraptions[k];
      c.t += dt;
      c.shotAge += dt;
      if (c.broke >= 0) {
        c.broke += dt;
        if (c.broke >= C.broke) this.contraptions.splice(k, 1);
        continue;
      }
      const s = h.skills[c.skill];
      if (!s || SKILLS[s.id].kind !== 'contraption' || c.t >= C.set + C.life || this.over) {
        this.breakContraption(c);
        continue;
      }
      if (c.t < C.set) continue;
      c.next -= dt;
      if (c.next > 0) continue;
      const shot = this.lobVial(c, c.frac);
      if (shot && c.echo > 0) {
        // ("of Echoes": with its first shot, a weaker vial after it)
        const share = c.echo;
        c.echo = 0;
        this.after(0.2, () => c.broke < 0 && this.lobVial(c, share, true));
      }
      c.next = shot ? C.every : 0.2;
    }
    // (HER VIALS: each bursts where it comes down; Cluster Vials' little ones, thrown out as one bursts, come down after)
    for (let k = this.vials.length - 1; k >= 0; k--) {
      const v = this.vials[k];
      v.t += dt;
      if (v.t < v.flight) continue;
      this.vials.splice(k, 1);
      this.vialBursts(v);
    }
    // (HER TAR: each puddle dries up when its time is up)
    for (let k = this.tars.length - 1; k >= 0; k--) {
      const p = this.tars[k];
      p.t += dt;
      if (p.t >= TINKER_TUNE.talents.tar.secs) this.tars.splice(k, 1);
    }
    // (HER GOLEMS: more out than she may have, her tree's Mark II undone, the second winds down)
    for (const g of this.golemsUp().slice(this.golemsMost())) this.windDown(g);
    for (const g of [...this.golems]) this.stepGolem(g, dt);
  }

  /** Her Golem `g`, each step. */
  private stepGolem(g: Golem, dt: number): void {
    const h = this.hero;
    const G = TINKER_TUNE.golem;
    const gone = (): void => {
      this.golems = this.golems.filter((q) => q !== g);
    };
    // (her tree's OVERDRIVE: it moves and strikes twice as fast, its time `gdt`; and GROWTH SERUM runs out)
    const fast = g.overT > 0 && g.act !== 'down' ? TINKER_TUNE.talents.overdrive.fast : 1;
    const gdt = dt * fast;
    g.overT = Math.max(0, g.overT - dt);
    g.growT = Math.max(0, g.growT - dt);
    g.actT += gdt;
    g.punchCd = Math.max(0, g.punchCd - gdt);
    g.cannonCd = Math.max(0, g.cannonCd - gdt);
    if (g.act === 'down') {
      if (g.actT >= G.down && !this.over) gone();
      return;
    }
    if (h.cls !== 'tinkerer') {
      gone();
      return;
    }
    // (left far behind, or in another place: whistled up beside her again)
    if (Math.hypot(g.x - h.x, g.y - h.y) > G.lost || !this.isOpen(g.x, g.y)) {
      const p = this.golemSpot(g.seat, 0);
      g.x = p.x;
      g.y = p.y;
      if (!this.isOpen(g.x, g.y)) {
        g.x = h.x;
        g.y = h.y;
      }
      g.act = 'arrive';
      g.actT = 0;
      this.emit({ t: 'golemArrive', x: g.x, y: g.y });
      return;
    }
    if (g.act === 'arrive') {
      if (g.actT >= G.arrive) this.golemIdle(g);
      return;
    }
    // (her tree's TESLA COIL: on its back, zapping the enemy nearest it every second)
    if (this.has('teslacoil')) this.teslaCoil(g, gdt);
    // (GROWTH SERUM: grown, its fist reaches twice as far)
    const reach = G.punch.reach * (g.growT > 0 ? TINKER_TUNE.talents.growth.big : 1);
    if (g.act === 'punch') {
      // (its punch, or its uppercut: golemBlow)
      const blow = golemBlow();
      if (!g.did && g.actT >= blow.hit) {
        g.did = true;
        const m = this.monsters.find((q) => q.id === g.target && !q.dead);
        if (m && Math.hypot(m.x - g.x, m.y - g.y) <= reach + m.r + 0.6) {
          const s = h.skills[g.skill];
          this.emit({ t: 'golemPunch', x: m.x, y: m.y, dx: g.fx, dy: g.fy });
          this.sfx('hit', 0.8);
          const frac = (s ? this.golemFrac(g) : 1) * this.golemMight(g) * G.punch.share;
          this.hitMonster(m, g.skill, frac, false);
          // (her tree's SHRAPNEL, while its cannon is off: its punch bursts where it lands, striking everything near)
          if (!GOLEM_CANNON.on && this.has('shrapnel')) this.shrapnel(g.skill, m.x, m.y, frac, m.id);
          if (!m.dead) this.throwMonster(m, g.x, g.y, 0.8, 0.15);
        }
      }
      if (g.actT >= blow.long) {
        g.punchCd = G.punch.wait;
        this.golemIdle(g);
      }
      return;
    }
    if (g.act === 'cannon') {
      if (!g.did && g.actT >= G.cannon.hit) {
        g.did = true;
        const m = this.monsters.find((q) => q.id === g.target && !q.dead);
        const x1 = m ? m.x : g.ax;
        const y1 = m ? m.y : g.ay;
        const flight = Math.hypot(x1 - g.x, y1 - g.y) / G.cannon.speed;
        this.emit({ t: 'golemShot', x0: g.x, y0: g.y, x1, y1, flight });
        this.emit({ t: 'shake', amount: 1.5 });
        this.sfx('slam', 0.5);
        const id = g.target;
        const frac = this.golemFrac(g) * this.golemMight(g) * G.cannon.share;
        const skill = g.skill;
        this.after(flight, () => {
          const t = this.monsters.find((q) => q.id === id && !q.dead);
          const lx = t ? t.x : x1;
          const ly = t ? t.y : y1;
          if (t) this.hitMonster(t, skill, frac, false);
          // (her tree's SHRAPNEL: the shot bursts where it lands, striking everything near)
          if (this.has('shrapnel')) this.shrapnel(skill, lx, ly, frac, id);
        });
      }
      if (g.actT >= G.cannon.long) {
        g.cannonCd = G.cannon.wait;
        this.golemIdle(g);
      }
      return;
    }
    if (g.act === 'pound') {
      if (!g.did && g.actT >= G.pound.hit) {
        g.did = true;
        // (the fist comes down a pace before it)
        this.golemPounds(g.skill, g.x + g.fx * 0.9, g.y + g.fy * 0.9, this.golemFrac(g), 0, false, g);
      }
      if (g.actT >= G.pound.long) this.golemIdle(g);
      return;
    }
    // STANDING OR WALKING: what to go for, if anything (awake, near her, seen by it)
    let best: Monster | null = null;
    let bd = 1e9;
    for (const m of this.monsters) {
      if (m.dead || !m.seen || m.state === 'sleep' || this.shutIn(m)) continue;
      if (Math.hypot(m.x - h.x, m.y - h.y) > G.leash) continue;
      const d = Math.hypot(m.x - g.x, m.y - g.y) - m.r;
      if (d < bd && this.sees(g.x, g.y, m.x, m.y)) {
        bd = d;
        best = m;
      }
    }
    const face = (x: number, y: number): void => {
      const d = Math.hypot(x - g.x, y - g.y);
      if (d > 0.05) {
        g.fx = (x - g.x) / d;
        g.fy = (y - g.y) / d;
      }
    };
    if (best && bd <= reach && g.punchCd <= 0) {
      face(best.x, best.y);
      g.act = 'punch';
      g.actT = 0;
      g.did = false;
      g.target = best.id;
      return;
    }
    // (its cannon off for now, his word: it closes on what it fights, always: GOLEM_CANNON)
    if (GOLEM_CANNON.on && best && bd >= G.cannon.near && bd <= G.cannon.far && g.cannonCd <= 0) {
      face(best.x, best.y);
      g.act = 'cannon';
      g.actT = 0;
      g.did = false;
      g.target = best.id;
      g.ax = best.x;
      g.ay = best.y;
      return;
    }
    // (where it goes: up to what it fights; else to her side, a little behind her: Mark II's second at her other side)
    let gx: number;
    let gy: number;
    let stop: number;
    if (best && bd > reach * 0.8) {
      gx = best.x;
      gy = best.y;
      stop = reach * 0.7 + best.r;
    } else if (best) {
      face(best.x, best.y);
      gx = g.x;
      gy = g.y;
      stop = 1;
    } else {
      const side = g.seat === 0 ? 1 : -1;
      gx = h.x - h.fx * 0.8 - h.fy * G.near * side;
      gy = h.y - h.fy * 0.8 + h.fx * G.near * side;
      stop = 0.5;
    }
    const d = Math.hypot(gx - g.x, gy - g.y);
    if (d > stop) {
      const step = Math.min(d - stop, G.speed * gdt);
      const was = { x: g.x, y: g.y };
      this.slide(g, 0.45, ((gx - g.x) / d) * step, ((gy - g.y) / d) * step, this.level.walk);
      const went = Math.hypot(g.x - was.x, g.y - was.y);
      g.walked += went;
      if (went > 1e-4) face(gx, gy);
      if (g.act !== 'walk') {
        g.act = 'walk';
        g.actT = 0;
      }
    } else if (g.act !== 'stand') {
      g.act = 'stand';
      g.actT = 0;
    }
  }

  /** Her tree's SHRAPNEL: the Golem's shot bursting at (x, y), striking everything near but the one it hit (`not`). */
  private shrapnel(i: number, x: number, y: number, frac: number, not: number): void {
    const S = TINKER_TUNE.talents.shrapnel;
    this.emit({ t: 'shrapnel', x, y, r: S.r });
    this.sfx('hit', 0.5);
    let hits = 0;
    for (const m of this.monsters) {
      if (m.dead || m.id === not || this.shutIn(m) || Math.hypot(m.x - x, m.y - y) > S.r + m.r) continue;
      this.hitMonster(m, i, frac * S.share, hits++ >= 3);
    }
  }

  /**
   * Her tree's TESLA COIL on Golem `g`'s back: every second it zaps the enemy nearest it (awake, seen), the spark leaping on
   * to two more, each the nearest to the last.
   */
  private teslaCoil(g: Golem, gdt: number): void {
    const Z = TINKER_TUNE.talents.tesla;
    g.zapT -= gdt;
    if (g.zapT > 0) return;
    const hit: Monster[] = [];
    let from: { x: number; y: number } = g;
    let reach = Z.reach;
    for (let n = 0; n <= Z.leaps; n++) {
      let best: Monster | null = null;
      let bd = reach;
      for (const m of this.monsters) {
        if (m.dead || !m.seen || m.state === 'sleep' || this.shutIn(m) || hit.includes(m)) continue;
        const d = Math.hypot(m.x - from.x, m.y - from.y);
        if (d <= bd && this.sees(from.x, from.y, m.x, m.y)) {
          bd = d;
          best = m;
        }
      }
      if (!best) break;
      hit.push(best);
      from = best;
      reach = Z.jump;
    }
    // (nothing near: it looks again shortly)
    if (!hit.length) {
      g.zapT = 0.2;
      return;
    }
    g.zapT = Z.every;
    this.emit({ t: 'teslaZap', x: g.x, y: g.y, to: hit.map((m) => ({ x: m.x, y: m.y })), ...(g.growT > 0 ? { grown: true } : {}) });
    this.sfx('zap', 0.4);
    // (a zap of lightning, her hit as the Golem's punches share it, and as her talents make it; not her words, which are its
    // punches', shots' and pounds')
    const h = this.hero;
    const st = h.d.stats;
    const s = h.skills[g.skill];
    const frac = this.golemFrac(g) * this.golemMight(g) * Z.share;
    for (const m of hit) {
      let dmg = this.rng.range(h.d.dmgMin, h.d.dmgMax) * (s ? s.r.dmgMult : 1) * frac * (1 + (st.dmgPct + st.lightPct + h.might) / 100);
      if (TALENTS.on) dmg *= this.talentHitMult(m);
      this.damageMonster(m, Math.max(1, Math.round(dmg)), 'lightning', false, g.skill);
    }
  }

  /** The Golem back to standing, ready for its next act. */
  private golemIdle(g: Golem): void {
    g.act = 'stand';
    g.actT = 0;
    g.did = false;
  }

  /** What a Golem's hits come to: her tap and hold's hit, as its punches and shots share it (resolveSkill's, with its words). */
  private golemFrac(g: Golem | null = this.golem): number {
    const s = g ? this.hero.skills[g.skill] : null;
    return s ? s.r.countDmg : 1;
  }

  // ---- THE RANGER'S COMPANIONS (game/companions.ts) ------------------------------------------------------------------------
  //   One for each of his companion talents taken: the one picked of its three (in town: pickCompanion). It keeps by him, bites
  //   an enemy awake near him, and its bite does what one of his words does. Nothing fights it.

  /** The kinds he should have out now: one for each companion talent taken. */
  private petsWanted(): { group: CompanionGroup; kind: CompanionKind }[] {
    if (!COMPANIONS.on || this.hero.cls !== 'ranger') return [];
    return COMPANION_GROUP_IDS.filter((g) => this.has(COMPANION_GROUPS[g].talent)).map((g) => ({ group: g, kind: pickedIn(this.hero.pets, g) }));
  }

  /** Where companion `seat` keeps by him, `back` behind him: the hunting one at his right hand, the wild one at his left. */
  private petSpot(seat: number, back: number): { x: number; y: number } {
    const h = this.hero;
    const side = (seat === 0 ? 1 : -1) * COMPANION_TUNE.near;
    return { x: h.x - h.fy * side - h.fx * back, y: h.y + h.fx * side - h.fy * back };
  }

  /** A companion at his side (where it may stand; else at his feet). */
  private petBeside(kind: CompanionKind, group: CompanionGroup): Pet {
    const h = this.hero;
    const seat = group === 'hunt' ? 0 : 1;
    const s = this.petSpot(seat, 0.4);
    const p = this.isOpen(s.x, s.y) ? s : { x: h.x, y: h.y };
    this.emit({ t: 'petArrive', kind, x: p.x, y: p.y });
    return { kind, group, x: p.x, y: p.y, fx: h.fx, fy: h.fy, act: 'arrive', actT: 0, did: false, target: -1, cd: 0, walked: 0, seat };
  }

  /**
   * THE RANGER'S COMPANIONS: pick `kind` for its group (in town only, the talent that brings that group taken). The one out
   * of that group goes, and the one picked is at his side. True if it was picked.
   */
  pickCompanion(kind: CompanionKind): boolean {
    const h = this.hero;
    if (!COMPANIONS.on || h.cls !== 'ranger' || !this.level.town) return false;
    const group = COMPANION_GROUP_IDS.find((g) => COMPANION_GROUPS[g].kinds.includes(kind));
    if (!group || !this.has(COMPANION_GROUPS[group].talent)) return false;
    h.pets = { ...(h.pets ?? {}), [group]: kind };
    this.pets = this.pets.filter((p) => p.group !== group);
    this.pets.push(this.petBeside(kind, group));
    this.sfx('trapSet', 0.4);
    return true;
  }

  /** His companions, each step: out as his talents and picks say, and each about its business. */
  private updatePets(dt: number): void {
    const want = this.petsWanted();
    this.pets = this.pets.filter((p) => want.some((w) => w.group === p.group && w.kind === p.kind));
    for (const w of want) if (!this.pets.some((p) => p.group === w.group)) this.pets.push(this.petBeside(w.kind, w.group));
    for (const p of this.pets) this.stepPet(p, dt);
  }

  /** Companion `p`, each step. */
  private stepPet(p: Pet, dt: number): void {
    const h = this.hero;
    const C = COMPANION_TUNE;
    const K = C.kinds[p.kind];
    p.actT += dt;
    p.cd = Math.max(0, p.cd - dt);
    // (left far behind, or somewhere it may not stand: at his side again)
    if (Math.hypot(p.x - h.x, p.y - h.y) > C.lost || !this.isOpen(p.x, p.y)) {
      const q = this.petBeside(p.kind, p.group);
      p.x = q.x;
      p.y = q.y;
      p.act = 'arrive';
      p.actT = 0;
      return;
    }
    if (p.act === 'arrive') {
      if (p.actT >= 0.3) p.act = 'stand';
      return;
    }
    if (p.act === 'bite') {
      if (!p.did && p.actT >= C.bite.hit) {
        p.did = true;
        const m = this.monsters.find((q) => q.id === p.target && !q.dead);
        if (m && Math.hypot(m.x - p.x, m.y - p.y) <= K.reach + m.r + 0.6) this.petBite(p, m);
      }
      if (p.actT >= C.bite.long) {
        p.act = 'stand';
        p.actT = 0;
        p.cd = K.every;
      }
      return;
    }
    // STANDING OR GOING: what to go for, if anything (awake, near him, seen by it; the tortoise only what is near him)
    const leash = p.kind === 'tortoise' ? C.tortoiseLeash : C.leash;
    let best: Monster | null = null;
    let bd = 1e9;
    for (const m of this.monsters) {
      if (m.dead || !m.seen || m.state === 'sleep' || this.shutIn(m)) continue;
      if (Math.hypot(m.x - h.x, m.y - h.y) > leash) continue;
      const d = Math.hypot(m.x - p.x, m.y - p.y) - m.r;
      if (d < bd && this.sees(p.x, p.y, m.x, m.y)) {
        bd = d;
        best = m;
      }
    }
    const face = (x: number, y: number): void => {
      const d = Math.hypot(x - p.x, y - p.y);
      if (d > 0.05) {
        p.fx = (x - p.x) / d;
        p.fy = (y - p.y) / d;
      }
    };
    if (best && bd <= K.reach && p.cd <= 0) {
      face(best.x, best.y);
      p.act = 'bite';
      p.actT = 0;
      p.did = false;
      p.target = best.id;
      return;
    }
    // (where it goes: up to what it bites; else to his side, a little behind him)
    let gx: number;
    let gy: number;
    let stop: number;
    if (best && bd > K.reach * 0.8) {
      gx = best.x;
      gy = best.y;
      stop = K.reach * 0.6 + best.r;
    } else if (best) {
      face(best.x, best.y);
      gx = p.x;
      gy = p.y;
      stop = 1;
    } else {
      const s = this.petSpot(p.seat, 0.5);
      gx = s.x;
      gy = s.y;
      stop = 0.35;
    }
    const d = Math.hypot(gx - p.x, gy - p.y);
    if (d > stop) {
      const step = Math.min(d - stop, C.speed * dt);
      const was = { x: p.x, y: p.y };
      this.slide(p, 0.25, ((gx - p.x) / d) * step, ((gy - p.y) / d) * step, this.level.walk);
      const moved = Math.hypot(p.x - was.x, p.y - was.y);
      p.walked += moved;
      if (moved > 0.001) {
        p.fx = (p.x - was.x) / moved;
        p.fy = (p.y - was.y) / moved;
      }
      p.act = moved > 0.001 ? 'walk' : 'stand';
    } else {
      p.act = 'stand';
      if (!best) {
        p.fx = h.fx;
        p.fy = h.fy;
      }
    }
  }

  /**
   * A companion's bite landing on `m`: a share of his own hit (none of his words), and what its kind's word does: the hawk's
   * mark (Precise behind), the snake's poison (Poison in front), the wolf's hold (Binding in front), the bat's healing
   * (Leeching), the fox's burst of speed (Swift behind), the tortoise's shield (Guarding in front).
   */
  private petBite(p: Pet, m: Monster): void {
    const h = this.hero;
    const d = h.d;
    const st = d.stats;
    const K = COMPANION_TUNE.kinds;
    const share = K[p.kind].share;
    let dmg = this.rng.range(d.dmgMin, d.dmgMax) * share * (1 + (st.dmgPct + st.physPct + h.might) / 100);
    const crit = this.rng.chance(d.critChance / 100);
    if (crit) dmg *= 1 + d.critMult / 100;
    dmg = Math.max(1, Math.round(dmg));
    this.emit({ t: 'petBite', kind: p.kind, id: m.id, x: m.x, y: m.y, dx: p.fx, dy: p.fy });
    this.sfx('hit', 0.45);
    this.damageMonster(m, dmg, 'phys', crit, 0);
    if (p.kind === 'hawk') {
      if (!m.dead) {
        m.markT = PRECISE.markTime;
        this.emit({ t: 'markOn', id: m.id, x: m.x, y: m.y, secs: PRECISE.markTime });
      }
    } else if (p.kind === 'snake') {
      this.poisonMonster(m, dmg * K.snake.dose, 0);
    } else if (p.kind === 'wolf') {
      const held = this.bindMonster(m, K.wolf.hold);
      if (held > 0) this.emit({ t: 'bind', id: m.id, secs: held });
    } else if (p.kind === 'bat') {
      const n = dmg * K.bat.heal;
      this.healHero(n);
      this.emit({ t: 'leech', x: m.x, y: m.y, n });
    } else if (p.kind === 'fox') {
      h.haste = Math.max(h.hasteT > 0 ? h.haste : 0, K.fox.haste);
      h.hasteT = Math.max(h.hasteT, K.fox.secs);
      this.emit({ t: 'buff', kind: 'haste', x: h.x, y: h.y, stacks: 1 });
    } else {
      h.shield = Math.max(h.shield, Math.round(d.maxLife * K.tortoise.shield));
      h.shieldT = Math.max(h.shieldT, GUARD.shieldTime);
      this.emit({ t: 'shield', x: h.x, y: h.y, secs: GUARD.shieldTime });
    }
  }

  // ---- DECOYS (THE TINKERER's Lightning Rod; for anything else that would draw the enemies off the hero) ----------------
  //   A decoy (state.ts Decoy) is put in Game.decoys: a spot, or a Golem of the Tinkerer's it goes with; for `t` seconds every
  //   enemy within `r` of it goes after it in place of the hero, in the one place in updateMonsters (drawnToDecoy).

  /** Each step: a decoy that goes with a Golem is where the Golem is (and ends as it winds down); each runs out. */
  private updateDecoys(dt: number): void {
    for (let k = this.decoys.length - 1; k >= 0; k--) {
      const d = this.decoys[k];
      d.t -= dt;
      const g = d.golem;
      if (g && (g.act === 'down' || !this.golems.includes(g))) d.t = 0;
      else if (g) {
        d.x = g.x;
        d.y = g.y;
        d.size = this.golemBody(g);
      }
      if (d.t <= 0) this.decoys.splice(k, 1);
    }
  }

  /** The decoy monster `m` goes after (the nearest of those whose reach it is within), or null: it goes after the hero. */
  decoyFor(m: { x: number; y: number; r: number }): Decoy | null {
    let best: Decoy | null = null;
    let bd = Infinity;
    for (const d of this.decoys) {
      const dist = Math.hypot(d.x - m.x, d.y - m.y);
      if (d.t > 0 && dist <= d.r + m.r && dist < bd) {
        best = d;
        bd = dist;
      }
    }
    return best;
  }

  /**
   * A MONSTER DRAWN BY A DECOY (the one place, in updateMonsters): within a live decoy's reach, monster `m` takes the decoy's
   * spot in place of the hero's. It walks to it, and when its blow is ready it swings at it (a ranged one goes up to it and
   * bashes it), the blow doing nothing. Returns whether it did (its step is then over). One already winding up a blow at
   * the hero, charging or the like, goes on with it; a boss with acts of its own (game/bosses.ts) is never drawn.
   */
  private drawnToDecoy(m: Monster, def: MonsterDef, mdt: number, slow: number, rage: number): boolean {
    if (this.decoySwings.has(m.id) && m.state !== 'windup') this.decoySwings.delete(m.id);
    const swinging = this.decoySwings.has(m.id);
    if (!swinging && m.state !== 'chase') return false;
    const d = this.decoyFor(m);
    if (!d) {
      // (its decoy gone in the middle of a swing at it: the swing broken off)
      if (swinging) {
        this.decoySwings.delete(m.id);
        m.state = 'chase';
        m.anim = 'idle';
      }
      return false;
    }
    const dx = d.x - m.x;
    const dy = d.y - m.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.01) {
      m.fx = dx / dist;
      m.fy = dy / dist;
    }
    if (swinging) {
      m.t -= mdt * (0.6 + 0.4 * slow);
      if (m.t <= 0) {
        // (its blow lands on the decoy, and does nothing)
        this.decoySwings.delete(m.id);
        m.state = 'recover';
        m.t = TUNE.monsterRecover;
        m.cd = def.cooldown * this.rng.range(0.9, 1.2);
        this.emit({ t: 'decoyStruck', x: d.x, y: d.y, golem: !!d.golem });
        this.sfx('swing', 0.4);
      }
      return true;
    }
    const reach = (def.ranged ? Math.min(1.2, this.reachOf(m, def)) : this.reachOf(m, def)) + d.size;
    if (dist <= reach + 0.2 && m.cd <= 0) {
      m.state = 'windup';
      m.t = def.windup;
      m.anim = 'attack';
      m.animT = 0;
      if (m.move !== undefined) m.move = -1;
      this.decoySwings.add(m.id);
      return true;
    }
    if (dist > reach * 0.8) {
      const sp = m.speed * slow * rage * mdt;
      this.slide(m, Math.min(m.r, 0.42), (dx / dist) * sp, (dy / dist) * sp, m.kind === 'bat' ? this.level.open : this.level.walk, true);
      m.anim = 'walk';
    } else m.anim = 'idle';
    return true;
  }

  private curseAll(i: number, x: number, y: number, rad: number, frac: number, n = 0, echo = false): void {
    const to: { id: number; x: number; y: number }[] = [];
    for (const m of this.monsters) {
      if (m.dead || this.shutIn(m) || Math.hypot(m.x - x, m.y - y) > rad + m.r || !this.sees(x, y, m.x, m.y)) continue;
      to.push({ id: m.id, x: m.x, y: m.y });
    }
    this.emit({ t: 'curse', x, y, r: rad, to, n, echo });
    this.sfx('rune', n > 0 || echo ? 0.5 : 0.8);
    const words = this.fronts(i);
    if (words.includes('power')) this.sfx('power', 0.9);
    // (Heavy lands out to the curse's edge, as a slam's)
    if (words.includes('heavy')) this.emit({ t: 'heavy', x, y, r: rad, big: true });
    let hits = 0;
    for (const t of to) {
      const m = this.monsters.find((q) => q.id === t.id);
      if (m) this.hitMonster(m, i, frac, hits++ >= 3);
    }
    if (hits > 0) {
      this.landed(i);
      // (THE CITY'S WORDS: Pulling in front drags what it cursed in to him)
      if (this.hero.skills[i].r.pull > 0) this.pullIn(i, x, y, rad, false);
    }
    // (what the words behind it leave, it leaves once a use, where it was cast)
    if (n === 0) this.wake(i, x, y, rad, frac);
  }

  /** DAMNING: every enemy within `rad` that is cursed or burning: the ground erupts under it, it is struck, every burn on it is paid out at once, and it is thrown. */
  private damningAll(i: number, x: number, y: number, rad: number, frac: number, n = 0, echo = false): void {
    const W = WARLOCK_TUNE.damning;
    const at: { id: number; x: number; y: number }[] = [];
    for (const m of this.monsters) {
      if (m.dead || this.shutIn(m) || Math.hypot(m.x - x, m.y - y) > rad + m.r) continue;
      const burning = (m.curseT ?? 0) > 0 || (m.hellT ?? 0) > 0 || m.burnT > 0;
      if (burning) at.push({ id: m.id, x: m.x, y: m.y });
    }
    this.emit({ t: 'damning', x, y, at, n, echo });
    if (this.fronts(i).includes('heavy')) this.emit({ t: 'heavy', x, y, r: rad, big: true });
    this.emit({ t: 'shake', amount: n > 0 || echo ? 2 : 4 });
    this.sfx('slam', n > 0 || echo ? 0.6 : 1);
    let hits = 0;
    for (const a of at) {
      const m = this.monsters.find((q) => q.id === a.id);
      if (!m || m.dead) continue;
      // every burn still to come, paid now
      const owed = ((m.hellT ?? 0) > 0 ? (m.hellDps ?? 0) * (m.hellT ?? 0) : 0) + ((m.curseT ?? 0) > 0 ? (m.curseDps ?? 0) * (m.curseT ?? 0) : 0) + (m.burnT > 0 ? m.burnDps * m.burnT : 0) + (m.poisonT > 0 ? m.poisonDps * m.poisonT : 0) + ((m.bleedT ?? 0) > 0 ? (m.bleedDps ?? 0) * (m.bleedT ?? 0) : 0);
      m.hellT = 0;
      m.curseT = 0;
      m.burnT = 0;
      m.poisonT = 0;
      m.bleedT = 0;
      this.hitMonster(m, i, frac, hits++ >= 3);
      if (!m.dead && owed * W.pay >= 1) this.damageMonster(m, Math.round(owed * W.pay), 'fire', false, i, true);
      if (!m.dead) this.throwMonster(m, x, y, W.throw, 0.25);
    }
    if (hits > 0) {
      this.landed(i);
      if (this.hero.skills[i].r.pull > 0) this.pullIn(i, x, y, rad, false);
    }
    if (n === 0) this.wake(i, x, y, rad, frac);
  }

  /** A cursed one has died: every burn on it leaps to each enemy within reach, and burns there as on it (a stronger one taking the place of a weaker). */
  private spreadBurns(d: Monster): void {
    const R = WARLOCK_TUNE.spread.r;
    const to: { id: number; x: number; y: number }[] = [];
    for (const m of this.monsters) {
      if (m === d || m.dead || this.shutIn(m) || Math.hypot(m.x - d.x, m.y - d.y) > R + m.r) continue;
      to.push({ id: m.id, x: m.x, y: m.y });
      const take = (t: number | undefined, dps: number | undefined, set: (t: number, dps: number) => void, have: number | undefined, haveDps: number | undefined): void => {
        if (!t || t <= 0 || !dps) return;
        if ((have ?? 0) <= 0 || dps > (haveDps ?? 0)) set(Math.max(t, have ?? 0), dps);
        else set(Math.max(t, have ?? 0), haveDps ?? dps);
      };
      take(d.hellT, d.hellDps, (t, v) => { m.hellT = t; m.hellDps = v; }, m.hellT, m.hellDps);
      take(d.curseT, d.curseDps, (t, v) => { m.curseT = t; m.curseDps = v; }, m.curseT, m.curseDps);
      take(d.burnT, d.burnDps, (t, v) => { m.burnT = t; m.burnDps = v; }, m.burnT, m.burnDps);
      take(d.poisonT, d.poisonDps, (t, v) => { m.poisonT = t; m.poisonDps = v; }, m.poisonT, m.poisonDps);
      take(d.bleedT, d.bleedDps, (t, v) => { m.bleedT = t; m.bleedDps = v; }, m.bleedT, m.bleedDps);
      if (m.lastSkill < 0) m.lastSkill = d.lastSkill;
    }
    if (to.length) {
      this.emit({ t: 'spread', x: d.x, y: d.y, to });
      this.sfx('fire', 0.7);
    }
  }

  /** A smoke step goes on: whoever it passes through is struck (the demon's rakes them and knocks them aside) and cursed, each once. */
  private smokeThrough(mv: NonNullable<Hero['move']>): void {
    const h = this.hero;
    const s = h.skills[2];
    if (!s || (s.id !== 'smokestep' && s.id !== 'demonstep')) return;
    const def = SKILLS[s.id];
    const hit = mv.hit ?? (mv.hit = []);
    for (const m of this.monsters) {
      if (m.dead || hit.includes(m.id) || this.shutIn(m)) continue;
      if (Math.hypot(m.x - h.x, m.y - h.y) > def.radius * s.r.size + m.r) continue;
      hit.push(m.id);
      this.emit({ t: 'smokeHit', id: m.id, x: m.x, y: m.y, n: 0, echo: false });
      this.hitMonster(m, 2, s.r.countDmg, hit.length > 3);
      // (the step's blow has landed, once a use, as a leap's landing does: of Power's might; Heavy's weight where it first strikes)
      if (hit.length === 1) {
        this.landed(2);
        if (this.fronts(2).includes('heavy')) this.emit({ t: 'heavy', x: m.x, y: m.y, r: def.radius * s.r.size, big: false });
        // (Pulling in front: what is near the first it strikes is dragged in to it)
        if (s.r.pull > 0) this.pullIn(2, m.x, m.y, def.radius * s.r.size * 2, false);
      }
      // (Twin: each struck again a moment later)
      for (let k = 1; k < s.r.count; k++) {
        const id = s.id;
        this.after(0.13 * k, () => {
          if (m.dead || this.hero.skills[2]?.id !== id) return;
          this.emit({ t: 'smokeHit', id: m.id, x: m.x, y: m.y, n: k, echo: false });
          this.hitMonster(m, 2, this.hero.skills[2].r.countDmg, true);
        });
      }
      if (mv.demon && !m.dead) {
        // knocked aside, off its line
        const lx = mv.x1 - mv.x0;
        const ly = mv.y1 - mv.y0;
        const side = (m.x - h.x) * ly - (m.y - h.y) * lx >= 0 ? 1 : -1;
        const len = Math.hypot(lx, ly) || 1;
        this.throwMonster(m, m.x - (ly / len) * side, m.y + (lx / len) * side, WARLOCK_TUNE.step.aside, 0.2);
      }
    }
  }

  /** "of Echoes" on a smoke step: the smoke streaks along its way again, striking and cursing whoever it passes through. */
  private smokeEcho(x0: number, y0: number, x1: number, y1: number, frac: number): void {
    const h = this.hero;
    const s = h.skills[2];
    if (!s) return;
    const def = SKILLS[s.id];
    this.emit({ t: 'smoke', x0, y0, x1, y1, demon: s.id === 'demonstep', echo: true });
    const lx = x1 - x0;
    const ly = y1 - y0;
    const L2 = lx * lx + ly * ly || 1;
    let hits = 0;
    for (const m of this.monsters) {
      if (m.dead || this.shutIn(m)) continue;
      const k = Math.max(0, Math.min(1, ((m.x - x0) * lx + (m.y - y0) * ly) / L2));
      // (the demon's knocked aside what it passed through: the echo reaches as far)
      const reach = def.radius * s.r.size + (s.id === 'demonstep' ? WARLOCK_TUNE.step.aside : 0);
      if (Math.hypot(m.x - (x0 + lx * k), m.y - (y0 + ly * k)) > reach + m.r) continue;
      this.emit({ t: 'smokeHit', id: m.id, x: m.x, y: m.y, n: 0, echo: true });
      this.hitMonster(m, 2, frac, hits++ >= 3);
    }
    if (hits > 0) this.landed(2);
  }

  /** The demon's smoke step ends: it bursts out of the smoke, its claws slammed down, knocking back whoever is there. */
  private demonLands(): void {
    const h = this.hero;
    const s = h.skills[2];
    if (!s || s.id !== 'demonstep') return;
    const W = WARLOCK_TUNE.step;
    this.emit({ t: 'shake', amount: 3 });
    this.blast(2, h.x + h.fx * 0.6, h.y + h.fy * 0.6, W.burst * s.r.size, s.r.countDmg * W.burstShare, 'land', 0, false, false);
    for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - h.x, m.y - h.y) <= W.burst + m.r) this.throwMonster(m, h.x, h.y, 1.2, 0.2);
    // behind: left where it bursts out, as far as it throws them
    this.wake(2, h.x, h.y, W.burst * s.r.size + 1.2, s.r.countDmg);
  }

  /** His pact: tapped with it full, he begins to change; as the demon it runs dry, and empty, the demon burns out. */
  private stepPact(dt: number, c: Controls): void {
    const h = this.hero;
    const P = WARLOCK_TUNE.pact;
    if (h.form === 'demon') {
      h.pact = Math.max(0, (h.pact ?? 0) - (P.full / P.demonSecs) * dt);
      if ((h.pact ?? 0) <= 0) this.beginChange('man');
      return;
    }
    // (HIS TREE: Bound Demon: while it is out, the pact runs dry as the demon's would; empty, it burns out)
    if (this.bound) {
      if (this.bound.act !== 'out') {
        h.pact = Math.max(0, (h.pact ?? 0) - (P.full / P.demonSecs) * dt);
        if ((h.pact ?? 0) <= 0) this.boundBurnsOut();
      }
      return;
    }
    if (c.change && (h.pact ?? 0) >= P.full && !h.move) {
      if (this.has('bounddemon')) this.tearOut();
      else this.beginChange('demon');
    }
  }

  /** He begins to change, into the demon or back: whatever he was doing is broken off. */
  private beginChange(to: 'demon' | 'man'): void {
    const h = this.hero;
    if (h.channel) this.endChannel(true);
    h.windup = null;
    h.channel = null;
    h.queued = null;
    h.attackT = 0;
    h.step = null;
    h.move = null;
    h.combo = 0;
    h.comboT = 0;
    const dur = to === 'demon' ? WARLOCK_TUNE.change.secs : WARLOCK_TUNE.burnOut.secs;
    // (HIS TREE: Last Rites, as the demon burns out Damning goes off by itself; Bloodlust's kills begun again with each demon)
    if (to === 'man' && h.form === 'demon' && this.has('lastrites')) this.lastRites(h.x, h.y, 1, 1);
    h.lust = 0;
    h.rakes = 0;
    h.change = { to, t: 0, dur };
    h.invuln = Math.max(h.invuln, dur);
    h.animT = 0;
    this.emit({ t: 'change', to, x: h.x, y: h.y });
    this.sfx(to === 'demon' ? 'power' : 'deny', 0.9);
  }

  /** The change goes on; at its end he is the demon (it roars, throwing back what is near) or a man again. */
  private stepChange(dt: number): void {
    const h = this.hero;
    const ch = h.change;
    if (!ch) return;
    ch.t += dt;
    h.invuln = Math.max(h.invuln, 0.06);
    h.anim = 'idle';
    h.animT += dt;
    if (ch.t < ch.dur) return;
    h.change = null;
    h.animT = 0;
    if (ch.to === 'demon') {
      h.form = 'demon';
      h.pact = WARLOCK_TUNE.pact.full;
      this.refresh();
      const R = WARLOCK_TUNE.change.roar;
      this.emit({ t: 'roar', x: h.x, y: h.y, r: R });
      this.emit({ t: 'shake', amount: 5 });
      this.sfx('explode', 0.8);
      for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - h.x, m.y - h.y) <= R + m.r) this.throwMonster(m, h.x, h.y, 1.5, 0.25);
      this.terribleRoar(h.x, h.y, R);
    } else {
      h.form = 'man';
      h.pact = 0;
      this.refresh();
    }
  }

  /** THE SKILL TREES: the mage's Warp from (x0, y0) to (x1, y1), with her talents: Frost Warp's burst of cold where she leaves; Flame Warp's fire along the way; Storm Warp's lightning where she arrives. */
  private talentWarp(x0: number, y0: number, x1: number, y1: number): void {
    const T = TALENT_TUNE;
    if (this.has('frostwarp')) {
      this.emit({ t: 'burst', x: x0, y: y0, r: T.frostWarp.r, el: 'frost', style: 'nova' });
      this.sfx('frost', 0.8);
      for (const m of this.monsters) {
        if (m.dead || m.boss || this.shutIn(m) || Math.hypot(m.x - x0, m.y - y0) > T.frostWarp.r + m.r) continue;
        m.frozenT = Math.max(m.frozenT, m.elite ? 0.6 : 1.1);
        m.freezeImmune = 4;
        m.chill = Math.max(m.chillT > 0 ? m.chill : 0, 0.3);
        m.chillT = 2.5;
        this.emit({ t: 'freeze', x: m.x, y: m.y });
      }
    }
    if (this.has('flamewarp')) {
      const F = T.flameWarp;
      const len = Math.hypot(x1 - x0, y1 - y0);
      for (let d = 0; d <= len + 0.01; d += F.every) {
        const x = x0 + ((x1 - x0) * d) / Math.max(0.01, len);
        const y = y0 + ((y1 - y0) * d) / Math.max(0.01, len);
        if (!this.roomForZone() || !this.onFloor(x, y)) continue;
        this.zones.push({ x, y, r: F.r, t: 0, dur: F.secs, kind: 'burn', element: 'fire', dmg: this.talentHit('fire', F.share), slow: 0, tick: 0.2, hostile: false, skill: -1, words: [], from: '' });
        this.emit({ t: 'zone', kind: 'burn', x, y, r: F.r, el: 'fire' });
      }
    }
    if (this.has('stormwarp')) {
      const S = T.stormWarp;
      const near = this.monsters
        .filter((m) => !m.dead && !this.shutIn(m) && Math.hypot(m.x - x1, m.y - y1) <= S.reach)
        .sort((a, b) => Math.hypot(a.x - x1, a.y - y1) - Math.hypot(b.x - x1, b.y - y1))
        .slice(0, S.n);
      for (const m of near) {
        this.emit({ t: 'arc', x0: m.x, y0: m.y, x1: m.x, y1: m.y, sky: true });
        m.shockT = T.shockSecs;
        this.damageMonster(m, this.talentHit('lightning', S.share), 'lightning', false, 2);
      }
      if (near.length) this.sfx('thunder', 0.7);
    }
  }

  /**
   * "of Echoes" on an evasive move: it is announced now, and `again` is done a moment later (if the
   * move is still the hero's). The effects are told of the repeat as they are of an attack's.
   */
  private echoOf(i: number, x: number, y: number, dx: number, dy: number, again: () => void): void {
    const s = this.hero.skills[i];
    const id = s.id;
    const kind = SKILLS[id].kind;
    this.emit({ t: 'echo', x, y, dx, dy, kind, delay: ECHO_DELAY });
    this.after(ECHO_DELAY, () => {
      const now = this.hero.skills[i];
      if (now.id !== id) return;
      this.emit({ t: 'cast', x, y, dx, dy, kind, el: now.r.element, words: this.fronts(i), behind: this.behinds(i), echo: true });
      again();
    });
  }

  /**
   * The Warrior comes down from a Leap: a shock where they land. Twin: a second shock a moment
   * later. "of Echoes": a weaker one a moment after that. What the words behind it leave, the
   * first shock leaves.
   */
  private land(): void {
    const h = this.hero;
    const s = h.skills[2];
    const def = SKILLS[s.id];
    const r = s.r;
    // (LUNGE: the warrior's lands at his sword's point, before him)
    const fwd = LUNGE.on && h.cls === 'warrior' ? LUNGE.ahead : 0;
    const x = h.x + h.fx * fwd;
    const y = h.y + h.fy * fwd;
    const rad = def.radius * r.size;
    this.sfx('slam', 0.7);
    this.emit({ t: 'shake', amount: 2 });
    // (THE SKILL TREES: Earthshaker, a quake that stuns everything near)
    if (this.has('earthshaker')) {
      const E = TALENT_TUNE.earthshaker;
      this.emit({ t: 'heavy', x, y, r: E.r, big: true });
      this.emit({ t: 'shake', amount: 4 });
      for (const m of this.monsters) {
        if (!m.dead && !this.shutIn(m) && Math.hypot(m.x - x, m.y - y) <= E.r + m.r) this.stunMonster(m, E.secs);
      }
    }
    for (let k = 0; k < r.count; k++) {
      if (k === 0) this.blast(2, x, y, rad, r.countDmg, 'land');
      else this.after(0.28 * k, () => this.blast(2, x, y, rad * 1.15, r.countDmg, 'land', k, false, false));
    }
    if (r.echo > 0) this.echoOf(2, x, y, h.fx, h.fy, () => this.blast(2, x, y, rad, r.countDmg * r.echo, 'land', 0, true, false));
  }

  // ===========================================================================================
  // Delivering abilities

  /** The words in front of ability `i`: what the effects show. */
  private fronts(i: number): WordId[] {
    const s = this.hero.skills[i];
    return s ? withParts(s.front) : [];
  }

  /** The words behind ability `i`. */
  private behinds(i: number): WordId[] {
    const s = this.hero.skills[i];
    return s ? withParts(s.behind) : [];
  }

  /**
   * Carry out ability `i` from (ox, oy) toward (tx, ty). `frac` scales its damage (an echo is a
   * weaker copy). `primary` is false for echoes, so they do not echo again or stack buffs.
   */
  private deliver(i: number, ox: number, oy: number, tx: number, ty: number, frac: number, primary: boolean): void {
    const h = this.hero;
    const s = h.skills[i];
    const r = s.r;
    const def = SKILLS[s.id];
    // (an attack that goes on while held is not made here: beginChannel and channelBite)
    if (def.channel) return;
    let dx = tx - ox;
    let dy = ty - oy;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) {
      dx = h.fx;
      dy = h.fy;
    } else {
      dx /= len;
      dy /= len;
    }
    const each = frac * r.countDmg;
    const words = this.fronts(i);
    const behind = this.behinds(i);
    const echo = !primary;
    if (words.length || behind.length || echo) this.emit({ t: 'cast', x: ox, y: oy, dx, dy, kind: def.kind, el: r.element, words, behind, echo });

    if (def.kind === 'melee') {
      for (let k = 0; k < r.count; k++) {
        if (k === 0) this.strike(i, ox, oy, dx, dy, each, 0, echo);
        else this.after(0.13 * k, () => this.strike(i, echo ? ox : this.hero.x, echo ? oy : this.hero.y, dx, dy, each, k, echo));
      }
    } else if (def.kind === 'burst') {
      // centre it ahead of the hero, pulled back if a wall is in the way
      let reach = Math.min(def.range, Math.max(len, 0.8));
      while (reach > 0.2 && !this.isOpen(ox + dx * reach, oy + dy * reach)) reach -= 0.2;
      const cx = ox + dx * reach;
      const cy = oy + dy * reach;
      const rad = def.radius * r.size;
      this.sfx('slam');
      this.emit({ t: 'shake', amount: 2.5 });
      for (let k = 0; k < r.count; k++) {
        if (k === 0) this.blast(i, cx, cy, rad, each, 'slam', 0, echo);
        else this.after(0.28 * k, () => this.blast(i, cx, cy, rad * 1.15, each, 'slam', k, echo));
      }
    } else if (def.kind === 'orb') {
      const rad = def.radius * r.size;
      if (primary) {
        // Set down where it was aimed: as near to there as the hero can see, within its range. It
        // sends out a wave the moment it lands. (No more than a couple at once: one more takes
        // the place of the oldest.)
        const p = this.reachPoint(tx, ty, def.range);
        this.sfx('orbSet', 0.9);
        const mine = this.orbs.filter((o) => o.skill === i);
        while (mine.length >= TUNE.orbMax) {
          const old = mine.shift() as OrbInst;
          this.emit({ t: 'orbEnd', x: old.x, y: old.y, el: old.element });
          this.orbs.splice(this.orbs.indexOf(old), 1);
        }
        this.orbs.push({ id: this.nextThing++, x: p.x, y: p.y, t: 0, life: TUNE.orbLife, next: TUNE.orbEvery, waves: 1, skill: i, frac: each, element: r.element });
        this.emit({ t: 'orbSet', x: p.x, y: p.y, r: rad, el: r.element, words });
        this.orbWave(i, p.x, p.y, rad, each, false, true);
      } else {
        // "of Echoes": the orb that was set sends one more wave, a weaker one
        const mine = this.orbs.filter((q) => q.skill === i);
        const o = mine[mine.length - 1];
        if (o) this.orbWave(i, o.x, o.y, rad, each, true, false);
      }
    } else if (def.kind === 'summon') {
      // A familiar appears at the hero's shoulder. No more than a few at once: one more takes the
      // place of the oldest. ("of Echoes" calls a second, weaker one a moment later.)
      this.sfx('familiar', echo ? 0.5 : 0.9);
      const mine = this.familiars.filter((q) => q.skill === i);
      while (mine.length >= TUNE.familiarMax) {
        const old = mine.shift() as Familiar;
        this.emit({ t: 'familiarEnd', x: old.x, y: old.y, el: old.element });
        this.familiars.splice(this.familiars.indexOf(old), 1);
      }
      let seat = 0;
      while (mine.some((q) => q.seat === seat)) seat++;
      this.familiars.push({ id: this.nextThing++, x: h.x, y: h.y, t: 0, life: TUNE.familiarLife, next: 0.3, seat, skill: i, frac, element: r.element, echo, fx: dx, fy: dy, shotAge: 9 });
      this.emit({ t: 'familiar', x: h.x, y: h.y, el: r.element, echo });
    } else if (def.kind === 'wave') {
      // A wide front of force: it travels a short way and goes through everything it meets, each
      // enemy hit once. A Twin pair fans apart, and one enemy takes only one of them.
      const base = Math.atan2(dy, dx);
      const hit: number[] = [];
      for (let k = 0; k < r.count; k++) {
        const a = base + (r.count === 1 ? 0 : (k - (r.count - 1) / 2) * 2 * TUNE.waveFan);
        this.projectiles.push({
          x: ox + Math.cos(a) * 0.5, y: oy + Math.sin(a) * 0.5, vx: Math.cos(a) * r.projSpeed, vy: Math.sin(a) * r.projSpeed,
          r: def.radius * r.size, dist: def.range, hostile: false, dmg: each, element: r.element,
          look: 'wave', pierce: true, hit, volley: r.count > 1, skill: i, trail: 0, words, runed: false, clouded: false, age: 0, from: '', n: k,
        });
      }
      this.emit({ t: 'wave', x: ox, y: oy, dx, dy, w: def.radius * r.size, el: r.element, words, echo });
    } else if (def.kind === 'projectile') {
      const base = Math.atan2(dy, dx);
      // The shots of one use keep one list of who they have hit between them: an enemy standing
      // in front of the bow takes one of a Twin pair, not both (the other flies on past).
      const hit: number[] = [];
      // (THE SKILL TREES: Long Shot, further and faster; Piercing, through one more; Split Shot, every third in three)
      const long = this.was('longshot') ? TALENT_TUNE.longShot : 1;
      const split = primary && this.was('splitshot') && ++this.shots % TALENT_TUNE.splitShot.every === 0;
      const fan = split ? [-TALENT_TUNE.splitShot.fan, 0, TALENT_TUNE.splitShot.fan] : [0];
      // (THE SKILL TREES REMADE: Steady Aim, a second stood still and the next arrow goes through every enemy in its line)
      const steady = primary && this.now('steadyaim') && this.stillT >= TALENT_TUNE.steadyAim2.still;
      if (steady) this.stillT = 0;
      const loose = (sx: number, sy: number, own: number[]): void => {
        for (let k = 0; k < r.count; k++) {
          for (const f of fan) {
            const a = base + (r.count === 1 ? 0 : (k - (r.count - 1) / 2) * 0.16) + f;
            this.projectiles.push({
              x: sx + Math.cos(a) * 0.4, y: sy + Math.sin(a) * 0.4, vx: Math.cos(a) * r.projSpeed * long, vy: Math.sin(a) * r.projSpeed * long,
              r: Math.min(0.6, def.radius * r.size * (r.splash >= 1.5 ? 1.5 : 1)), dist: def.range * long, hostile: false, dmg: each, element: r.element,
              look: s.id === 'hellbolt' ? 'hellbolt' : 'arrow', pierce: r.pierce || steady, pierceN: this.was('piercing') ? TALENT_TUNE.piercing : 0, hit: own, volley: r.count > 1 || split, skill: i, trail: 0, words, runed: false, clouded: false, age: 0, from: '', n: k, flown: 0,
            });
          }
        }
      };
      loose(ox, oy, hit);
      // (THE SKILL TREES REMADE: Quick Draw, every fifth arrow fires twice: the second a moment after, from where he is then)
      if (primary && this.now('quickdraw') && ++this.draws % TALENT_TUNE.quickDraw2.every === 0) {
        const id = s.id;
        this.after(TALENT_TUNE.quickDraw2.gap, () => {
          const hh = this.hero;
          if (hh.skills[i]?.id === id && !this.over) loose(hh.x, hh.y, []);
        });
      }
    } else if (def.kind === 'curse') {
      // (THE WARLOCK, game/warlock.ts: every enemy near him struck and cursed; Twin, a second a moment later)
      const rad = def.radius * r.size;
      for (let k = 0; k < r.count; k++) {
        if (k === 0) this.curseAll(i, ox, oy, rad, each, 0, echo);
        else this.after(0.28 * k, () => this.curseAll(i, this.hero.x, this.hero.y, rad, each, k, echo));
      }
    } else if (def.kind === 'punch') {
      // (THE BRAWLER: the punch his combo has come to; Twin, a second blow of it at once; "of Echoes", a weaker one after)
      const name = h.punch ? h.punch.name : i === 0 ? 'jab' : 'cross';
      for (let k = 0; k < r.count; k++) {
        if (k === 0) this.landPunch(i, name, ox, oy, dx, dy, each, 0, echo);
        else this.after(0.12 * k, () => this.landPunch(i, name, this.hero.x, this.hero.y, dx, dy, each, k, echo));
      }
      // (THE BRAWLER'S TREE: Double Jab, his jab is two quick jabs)
      if (name === 'jab' && primary && this.has('doublejab')) this.secondJab(i, dx, dy, each, r.count);
    } else if (def.kind === 'vialtoss') {
      // (THE TINKERER, game/tinkerer.ts: her vial lobbed where she aimed, no further than its range; Twin, a second beside it;
      // "of Echoes", a weaker one after)
      for (let k = 0; k < (echo ? 1 : r.count); k++) this.tossVial(i, ox, oy, tx, ty, each, k, echo);
    } else if (def.kind === 'contraption') {
      // (THE TINKERER, game/tinkerer.ts: a Contraption thrown down where she aimed, no further than its range; "of Echoes",
      // the newest one lobs a weaker vial with its first shot)
      if (echo) {
        const c = this.contraptions.filter((q) => q.broke < 0).pop();
        if (c) c.echo = each;
      } else this.throwContraption(i, ox, oy, tx, ty, each);
    } else if (def.kind === 'golem') {
      // (THE TINKERER: the first whistle brings her Golem out; each after sets it on to ground pound. Twin, a second pound
      // after the first; "of Echoes", a weaker one after that)
      if (!echo) this.whistle(i, tx, ty, each, r.count);
      else for (const g0 of this.golemsUp()) this.after(TINKER_TUNE.golem.pound.long, () => this.golemPounds(i, g0.x, g0.y, each, 0, true, g0));
    } else if (def.kind === 'damning') {
      // (THE WARLOCK's demon: every cursed or burning enemy near it struck, and all its burns paid out at once; Twin, a
      // second eruption a moment later under every one still burning)
      const rad = def.radius * r.size;
      for (let k = 0; k < r.count; k++) {
        if (k === 0) this.damningAll(i, ox, oy, rad, each, 0, echo);
        else this.after(0.28 * k, () => this.damningAll(i, this.hero.x, this.hero.y, rad, each, k, echo));
      }
    } else if (def.kind === 'volley') {
      // The arrows go up from the bow, and a moment later begin to come down round the spot that
      // was aimed at: as near to there as the hero can see, within the bow's reach. (The echo is a
      // second, weaker rain on the same spot.)
      const p = this.reachPoint(tx, ty, def.range);
      // (THE SKILL TREES: Hail, longer and wider)
      const hail = this.was('hail');
      const rad = def.radius * r.size * (hail ? TALENT_TUNE.hail.area : 1);
      this.sfx('volley', echo ? 0.5 : 0.9);
      this.emit({ t: 'volleyUp', x: ox, y: oy, tx: p.x, ty: p.y, r: rad, el: r.element, words, echo });
      const v: Volley = {
        id: this.nextThing++, x: p.x, y: p.y, r: rad, t: -TUNE.volleyDelay, n: 0, total: Math.max(1, Math.round((TUNE.volleyLife * (hail ? TALENT_TUNE.hail.life : 1)) / TUNE.volleyEvery)), told: 0, next: 0,
        skill: i, frac: each, count: r.count, element: r.element, echo, wake: primary,
      };
      // (THE SKILL TREES REMADE: Hail, the rain follows the enemy it was aimed at)
      if (this.now('hail')) {
        let bd = TALENT_TUNE.hail2.pick;
        for (const m of this.monsters) {
          const dd = Math.hypot(m.x - p.x, m.y - p.y);
          if (!m.dead && !this.shutIn(m) && dd < bd) {
            bd = dd;
            v.follow = m.id;
          }
        }
      }
      this.volleys.push(v);
    }

    if (primary) {
      this.boons(i);
      if (r.echo > 0) {
        this.emit({ t: 'echo', x: ox, y: oy, dx, dy, kind: def.kind, delay: ECHO_DELAY });
        this.after(ECHO_DELAY, () => this.deliver(i, ox, oy, tx, ty, frac * r.echo, false));
      }
    }
  }

  /** One melee hit from (ox, oy) in direction (dx, dy). */
  private strike(i: number, ox: number, oy: number, dx: number, dy: number, frac: number, n = 0, echo = false): void {
    const r = this.hero.skills[i].r;
    const def = SKILLS[r.id];
    const reach = def.range * r.size;
    const words = this.fronts(i);
    const power = words.includes('power');
    this.emit({ t: 'swing', x: ox, y: oy, dx, dy, reach, el: r.element, words, n, echo });
    let best: Monster | null = null;
    let bd = Infinity;
    const cleave = this.now('sweepingcut');
    const arc: Monster[] = [];
    for (const m of this.monsters) {
      if (m.dead) continue;
      const mx = m.x - ox;
      const my = m.y - oy;
      const dist = Math.hypot(mx, my);
      if (dist > reach + m.r) continue;
      // in front of the hero, or close enough that facing does not matter
      const dot = dist > 0.01 ? (mx * dx + my * dy) / dist : 1;
      if (dot < 0.35 && dist > 0.9 + m.r) continue;
      if (cleave) arc.push(m);
      const score = dist - dot * 0.5;
      if (score < bd) {
        bd = score;
        best = m;
      }
    }
    this.breakProps(ox + dx * reach * 0.6, oy + dy * reach * 0.6, 0.9, i);
    if (!best) {
      // a swing that meets nothing still leaves its wake where the blade passed, as a shot does where it ends
      const wx = ox + dx * reach * 0.75;
      const wy = oy + dy * reach * 0.75;
      if (this.isOpen(wx, wy)) this.wake(i, wx, wy, 1.0, frac);
      return;
    }
    const tx = best.x;
    const ty = best.y;
    this.hitMonster(best, i, frac, false);
    // (THE SKILL TREES REMADE: Sweeping Cut, the swing cleaves: every enemy in its arc is struck as hard)
    for (const o of arc) if (o !== best && !o.dead) this.hitMonster(o, i, frac, true);
    this.landed(i);
    this.sfx(power ? 'power' : 'hit', 0.7);
    if (words.includes('heavy')) this.emit({ t: 'heavy', x: tx, y: ty, r: 1.1, big: false });
    if (r.splash > 0) {
      // (THE SKILL TREES: Fuel, Flame's blast wider)
      const rad = r.splash * r.size * (r.element === 'fire' && this.was('fuel') ? TALENT_TUNE.fuel : 1);
      // a full-strength splash is an explosion; Power's is a shock through the ground
      this.emit({ t: 'burst', x: tx, y: ty, r: rad, el: r.element, style: r.splashDmg >= 1 ? 'blast' : 'shock', words, n, echo });
      for (const o of this.monsters) {
        if (o.dead || o === best) continue;
        if (Math.hypot(o.x - tx, o.y - ty) <= rad + o.r && !this.shutIn(o)) this.hitMonster(o, i, frac * r.splashDmg, true);
      }
    }
    // (THE SKILL TREES: Sweeping Cut, a melee hit splashes on the enemies beside)
    if (this.was('sweepingcut')) {
      const C = TALENT_TUNE.sweepingCut;
      for (const o of this.monsters) {
        if (o.dead || o === best || this.shutIn(o)) continue;
        if (Math.hypot(o.x - tx, o.y - ty) <= C.reach + o.r) this.hitMonster(o, i, frac * C.share, true);
      }
    }
    // (THE CITY'S WORDS: Pulling in front drags in what is round the one it struck)
    if (r.pull > 0) this.pullIn(i, tx, ty, r.splash > 0 ? r.splash * r.size : 0, true);
    this.wake(i, tx, ty, 1.0, frac);
  }

  /** An area hit: everything within `rad` of (cx, cy). */
  /** `leaves`: false for a blast that leaves nothing behind it (an orb's later waves: what the orb leaves, it left as it landed). */
  private blast(i: number, cx: number, cy: number, rad: number, frac: number, style: 'slam' | 'nova' | 'blast' | 'land' | 'whirl' | 'vial' | 'pound' | 'bomb', n = 0, echo = false, leaves = true): void {
    const r = this.hero.skills[i].r;
    const words = this.fronts(i);
    this.emit({ t: 'burst', x: cx, y: cy, r: rad, el: r.element, style, words, n, echo });
    if (words.includes('power')) this.sfx('power', 0.9);
    // (Heavy lands out to the blast's edge; a whirlwind's turns are too many for that, its stuns show it)
    if (words.includes('heavy') && style !== 'whirl') this.emit({ t: 'heavy', x: cx, y: cy, r: rad, big: true });
    let hits = 0;
    for (const m of this.monsters) {
      if (m.dead) continue;
      // (what is shut in a room is out of a blast's reach, and is not counted as hit: `shutIn`)
      if (Math.hypot(m.x - cx, m.y - cy) <= rad + m.r && !this.shutIn(m)) {
        this.hitMonster(m, i, frac, hits >= 3);
        hits++;
      }
    }
    if (hits > 0) {
      this.landed(i);
      this.sfx(r.element === 'fire' ? 'fire' : r.element === 'frost' ? 'frost' : r.element === 'lightning' ? 'zap' : 'hit', 0.8);
      // (THE CITY'S WORDS: Pulling in front drags what it hit in to its middle)
      if (r.pull > 0) this.pullIn(i, cx, cy, rad, false);
    }
    this.breakProps(cx, cy, rad, i);
    if (leaves) this.wake(i, cx, cy, rad, frac);
  }

  /**
   * One wave from an orb (two, with Twin in front: the second a moment after the first).
   * `leaves`: this is the wave it sends as it lands, which leaves what the words behind it leave.
   */
  private orbWave(i: number, x: number, y: number, rad: number, frac: number, echo: boolean, leaves: boolean): void {
    const count = this.hero.skills[i].r.count;
    this.sfx('nova', echo ? 0.3 : 0.5);
    for (let k = 0; k < count; k++) {
      if (k === 0) this.blast(i, x, y, rad, frac, 'nova', 0, echo, leaves);
      else this.after(0.22 * k, () => this.blast(i, x, y, rad, frac, 'nova', k, echo, false));
    }
  }

  /**
   * Where a beam from (ox, oy) along (dx, dy) ends: at the first wall, or `range` tiles out.
   * (The renderer asks too, for the ghost line that comes before the beam.)
   */
  beamEnd(ox: number, oy: number, dx: number, dy: number, range: number): { x: number; y: number; len: number } {
    const L = this.level;
    const f = L.floor;
    let len = 0;
    for (let d = 0.2; d <= range + 1e-6; d += 0.2) {
      if (!this.isOpen(ox + dx * d, oy + dy * d)) break;
      len = d;
    }
    return { x: ox + dx * len, y: oy + dy * len, len };
  }

  /** Every orb that is out sends its waves, and goes when its time is up. */
  private updateOrbs(dt: number): void {
    for (let k = this.orbs.length - 1; k >= 0; k--) {
      const o = this.orbs[k];
      const s = this.hero.skills[o.skill];
      o.t += dt;
      // (its time is up a hair early, so that a wave due at that very moment is not sent after all)
      if (o.t >= o.life - 1e-6 || !s || SKILLS[s.id].kind !== 'orb') {
        this.emit({ t: 'orbEnd', x: o.x, y: o.y, el: o.element });
        this.orbs.splice(k, 1);
        continue;
      }
      o.next -= dt;
      if (o.next <= 0) {
        o.next += TUNE.orbEvery;
        o.waves++;
        this.orbWave(o.skill, o.x, o.y, SKILLS[s.id].radius * s.r.size, o.frac, false, false);
      }
    }
  }

  /**
   * Familiars keep their places round the hero, and each shoots at the nearest enemy it can see
   * that is awake. (Not at sleepers: a familiar must not start a fight the player has not chosen.)
   */
  private updateFamiliars(dt: number): void {
    const h = this.hero;
    for (let k = this.familiars.length - 1; k >= 0; k--) {
      const q = this.familiars[k];
      const s = h.skills[q.skill];
      q.t += dt;
      q.shotAge += dt;
      if (q.t >= q.life || !s || SKILLS[s.id].kind !== 'summon') {
        this.emit({ t: 'familiarEnd', x: q.x, y: q.y, el: q.element });
        this.familiars.splice(k, 1);
        continue;
      }
      // its place: one of three round the hero, turning slowly; it drifts there, it does not snap
      const a = this.time * 0.9 + (q.seat * Math.PI * 2) / TUNE.familiarMax;
      const k1 = Math.min(1, dt * 7);
      q.x += (h.x + Math.cos(a) * 0.85 - q.x) * k1;
      q.y += (h.y + Math.sin(a) * 0.85 - q.y) * k1;
      q.next -= dt;
      if (q.next > 0) continue;
      const def = SKILLS[s.id];
      const r = s.r;
      let best: Monster | null = null;
      let bd = def.range;
      for (const m of this.monsters) {
        if (m.dead || !m.seen || m.state === 'sleep') continue;
        const d = Math.hypot(m.x - q.x, m.y - q.y);
        if (d < bd && this.sees(q.x, q.y, m.x, m.y)) {
          bd = d;
          best = m;
        }
      }
      if (!best) {
        // nothing to shoot at: it looks again shortly
        q.next = 0.15;
        continue;
      }
      q.next = TUNE.familiarEvery;
      const base = Math.atan2(best.y - q.y, best.x - q.x);
      q.fx = Math.cos(base);
      q.fy = Math.sin(base);
      q.shotAge = 0;
      const words = this.fronts(q.skill);
      // (the bolts of one shot keep one list of who they have hit between them: a Twin pair does not both land on one enemy)
      const hit: number[] = [];
      for (let n = 0; n < r.count; n++) {
        const ang = base + (r.count === 1 ? 0 : (n - (r.count - 1) / 2) * 0.2);
        this.projectiles.push({
          x: q.x + Math.cos(ang) * 0.2, y: q.y + Math.sin(ang) * 0.2, vx: Math.cos(ang) * r.projSpeed, vy: Math.sin(ang) * r.projSpeed,
          r: Math.min(0.5, def.radius * r.size * (r.splash >= 1.5 ? 1.5 : 1)), dist: def.range + 2, hostile: false, dmg: q.frac * r.countDmg, element: r.element,
          look: 'mote', pierce: r.pierce, hit, volley: r.count > 1, skill: q.skill, trail: 0, words, runed: false, clouded: false, age: 0, from: '', n,
        });
      }
      this.emit({ t: 'familiarShot', x: q.x, y: q.y, dx: q.fx, dy: q.fy, el: r.element });
      this.sfx('familiarShot', 0.5);
    }
  }

  /** What an ability leaves behind where it hit: a ground patch, a cloud, a rune. */
  private wake(i: number, x: number, y: number, rad: number, frac: number): void {
    const r = this.hero.skills[i].r;
    if (r.zone) this.addGround(i, x, y, Math.max(1.0, rad), frac);
    if (r.cloud > 0) this.addCloud(i, x, y, Math.max(1.5, rad), frac);
    if (r.rune > 0) this.addRune(i, x, y, frac);
    this.leavePatches(i, x, y, rad, frac);
  }

  /**
   * What Heavy and Guarding behind leave where ability `i` lands: cracked ground, a ward circle. (THE CITY'S WORDS, Version 23.8:
   * and Pulling's vortex, Hexing's circle, Stilling's bubble, and Splitting's shards, `frac` the hit's share.)
   */
  private leavePatches(i: number, x: number, y: number, rad: number, frac = 1): void {
    const r = this.hero.skills[i].r;
    if (r.cracks > 0) this.addPatch(i, 'cracks', x, y, Math.max(1.0, rad), r.cracks, 0);
    if (r.ward > 0) this.addPatch(i, 'ward', x, y, Math.max(1.5, rad), GUARD.wardTime, r.ward);
    if (r.vortex > 0) this.addPatch(i, 'vortex', x, y, Math.max(1.5, rad), r.vortex, 0);
    if (r.hexCircle > 0) this.addPatch(i, 'hex', x, y, Math.max(1.5, rad), HEX.circle, r.hexCircle);
    if (r.bubble > 0) this.addPatch(i, 'bubble', x, y, Math.max(1.5, rad), STILL.bubble, r.bubble);
    if (r.shards > 0) this.throwShards(i, x, y, frac);
    // (BINDING behind: a snare where it ends)
    if (r.snare > 0) this.addSnare(i, x, y, r.snare);
  }

  /** Whether the ability leaves any of the patches `leavePatches` lays (or throws shards). */
  private leaves(r: { cracks: number; ward: number; vortex: number; hexCircle: number; bubble: number; shards: number; snare: number }): boolean {
    return r.cracks > 0 || r.ward > 0 || r.vortex > 0 || r.hexCircle > 0 || r.bubble > 0 || r.shards > 0 || r.snare > 0;
  }

  /**
   * BINDING behind: a snare at (x, y), lying BIND.snareLife seconds, for the next enemy to cross (`secs` it holds it); at most one
   * each BIND.every seconds for ability `i`. Laid again where one lies, that one lies as long again from now. It carries the word in
   * its `words`, which is how Binding's looks know it (render/binding3.ts).
   */
  private addSnare(i: number, x: number, y: number, secs: number): void {
    if (this.time - this.snareAt[i] < BIND.every) return;
    this.snareAt[i] = this.time;
    for (const o of this.zones) {
      if (o.kind === 'snare' && Math.hypot(o.x - x, o.y - y) < 0.6) {
        o.t = 0;
        o.dmg = Math.max(o.dmg, secs);
        return;
      }
    }
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    // (it waits for the next to cross it: what stands on it as it is laid, the one just struck, is let be until it steps off)
    const onIt = this.monsters.filter((m) => !m.dead && Math.hypot(m.x - x, m.y - y) <= BIND.reach + m.r * 0.5).map((m) => m.id);
    this.zones.push({ x, y, r: BIND.reach, t: 0, dur: BIND.snareLife, kind: 'snare', element: 'phys', dmg: secs, slow: 0, tick: 0, hostile: false, skill: i, words: ['binding'], from: '', onIt });
    this.emit({ t: 'zone', kind: 'snare', x, y, r: BIND.reach, el: 'phys', dur: BIND.snareLife });
  }

  /**
   * BINDING: holds `m` where it stands for `secs` (an elite half as long; a boss never; nor one held not long since), and says how
   * long it is held (0: not). It strikes still, but goes nowhere (`updateMonsters`' pins).
   */
  private bindMonster(m: Monster, secs: number): number {
    if (m.dead || m.boss || (m.bindAgain ?? 0) > 0 || this.shutIn(m)) return 0;
    const t = secs * (m.elite || m.champion ? BIND.elite : 1);
    m.bindT = t;
    m.bindAgain = t + BIND.again;
    if (m.state === 'charge') this.endCharge(m);
    return t;
  }

  /**
   * PULLING in front (Version 23.8): what ability `i` hit about (x, y) is dragged toward it, up to its pull's length and no nearer
   * than PULL.stop (an elite half as far, a boss not at all; what sleeps wakes). An area's hit drags what is within `rad`; a blow
   * on one enemy (`single`), what is within PULL.reach of it.
   */
  private pullIn(i: number, x: number, y: number, rad: number, single: boolean): void {
    const r = this.hero.skills[i].r;
    if (r.pull <= 0) return;
    const reach = single ? Math.max(rad, PULL.reach) : rad;
    for (const o of this.monsters) {
      if (o.dead || o.boss || this.shutIn(o)) continue;
      const d = Math.hypot(o.x - x, o.y - y);
      if (d > reach + o.r || d <= PULL.stop) continue;
      const far = Math.min(r.pull * (o.elite ? 0.5 : 1), d - PULL.stop);
      if (far < 0.05) continue;
      if (o.state === 'sleep') this.wakeUp(o);
      this.throwMonster(o, x, y, -far, PULL.secs);
    }
    // (its look, a ring closing in, at most every quarter second for one ability: a whirlwind's turns are many)
    if (this.time - this.pullShown[i] >= 0.25) {
      this.pullShown[i] = this.time;
      this.emit({ t: 'pull', x, y, r: reach });
    }
  }

  /**
   * SPLITTING in front (Version 23.8): ability `i`'s first hit, on `m` at (x, y), breaks into copies, each `f` of a hit, flying on
   * to the nearest other enemies (as far as SPLIT.reach); each strikes as it lands. Where there is none, they fly off to nothing.
   */
  private splitOff(m: Monster, i: number, f: number, x: number, y: number): void {
    const h = this.hero;
    const near = this.monsters
      .filter((o) => !o.dead && o !== m && !this.shutIn(o) && Math.hypot(o.x - x, o.y - y) <= SPLIT.reach + o.r)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
      .slice(0, SPLIT.copies);
    const to = near.map((o) => ({ x: o.x, y: o.y, secs: Math.max(0.06, Math.hypot(o.x - x, o.y - y) / SPLIT.speed) }));
    this.emit({ t: 'split', x, y, dx: x - h.x, dy: y - h.y, to, fly: to.length === 0 });
    near.forEach((o, k) => this.after(to[k].secs, () => this.copyHit(o, i, f)));
  }

  /** A copy or a shard of ability `i` strikes `o` for `f` of a hit (it breaks no further). */
  private copyHit(o: Monster, i: number, f: number): void {
    if (o.dead) return;
    this.copying = true;
    this.hitMonster(o, i, f, true);
    this.copying = false;
  }

  /**
   * SPLITTING behind (Version 23.8): where ability `i` ends, at (x, y), shards fly out in every direction, each `frac` times the
   * word's share of a hit: each strikes the first enemy on its line, as far as SPLIT.shardReach. At most once each SPLIT.every
   * seconds for one ability (a whirlwind's turns are many).
   */
  private throwShards(i: number, x: number, y: number, frac: number): void {
    const r = this.hero.skills[i].r;
    if (this.copying || this.time - this.shardsAt[i] < SPLIT.every) return;
    this.shardsAt[i] = this.time;
    const share = frac * r.shards;
    this.emit({ t: 'shards', x, y, r: SPLIT.shardReach * 0.5 });
    const a0 = (this.time * 2.399) % (Math.PI * 2);
    for (let k = 0; k < SPLIT.shards; k++) {
      const a = a0 + (k / SPLIT.shards) * Math.PI * 2;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      let best: Monster | null = null;
      let along = Infinity;
      for (const o of this.monsters) {
        if (o.dead || this.shutIn(o)) continue;
        const ox = o.x - x;
        const oy = o.y - y;
        const t = ox * ux + oy * uy;
        // (it flies out from where the ability ended: what stands there, the one it struck, it leaves)
        if (t < 0.35 || t > SPLIT.shardReach + o.r || t >= along) continue;
        if (Math.abs(ox * uy - oy * ux) > SPLIT.shardWidth + o.r) continue;
        best = o;
        along = t;
      }
      if (best) {
        const o = best;
        this.after(Math.max(0.05, along / SPLIT.speed), () => this.copyHit(o, i, share));
      }
    }
  }

  /** STILLING (Version 23.8): how fast `m`'s time runs now: slowed by a Stilling hit, and in a bubble (a boss half as much). */
  private timeOf(m: Monster): number {
    let k = 1;
    const b = m.boss ? STILL.boss : 1;
    if ((m.stillT ?? 0) > 0) k *= 1 - (m.stillK ?? 0) * b;
    const z = this.patchAt('bubble', m.x, m.y);
    if (z) k *= 1 - z.dmg * b;
    return k;
  }

  /** The strongest of the hero's patches of `kind` that (x, y) is inside, if any (its `dmg` is its share). */
  private patchAt(kind: 'hex' | 'bubble' | 'vortex', x: number, y: number): Zone | null {
    let best: Zone | null = null;
    for (const z of this.zones) if (z.kind === kind && !z.hostile && Math.hypot(x - z.x, y - z.y) <= z.r && (!best || z.dmg > best.dmg)) best = z;
    return best;
  }

  /**
   * VOLATILE in front: what ability `skill` kills explodes a moment after, for its share of the dead one's life (`share` of
   * it: Demolition's half-life burst), harming what is round it. (VOLATILE'S MELDS, behind VOLT_MELDS: Demolition's bigger;
   * Powderkeg's harder for a burning one, and setting what it strikes burning; Chain Reaction's arcing on to the nearest.)
   */
  private explodeKill(m: Monster, r: Resolved, skill: number, share = 1): void {
    const T = MELD_TUNE;
    const x = m.x;
    const y = m.y;
    let rad = 1.8;
    let boom = m.maxLife * r.volatile * share;
    if (r.meld === 'demolition') {
      rad *= T.demolition.bigger;
      boom *= T.demolition.bigger;
    }
    const keg = r.meld === 'powderkeg';
    if (keg && m.burnT > 0) boom *= T.powderkeg.burning;
    const hurt = Math.max(1, Math.round(boom));
    const meld = r.meld && VOLT_MELD_IDS.includes(r.meld) ? r.meld : undefined;
    this.after(0.12, () => {
      this.emit({ t: 'burst', x, y, r: rad, el: r.element, style: 'blast', words: VOLATILE_ONLY, ...(meld ? { meld } : {}) });
      this.sfx('explode', 0.6);
      const struck: Monster[] = [];
      for (const o of this.monsters) {
        if (!o.dead && o !== m && Math.hypot(o.x - x, o.y - y) <= rad + o.r) {
          this.damageMonster(o, hurt, r.element, false, skill);
          struck.push(o);
        }
      }
      if (keg) {
        for (const o of struck) {
          if (o.dead) continue;
          // (a burning piece of the keg thrown onto it: its look, render/volatile3.ts)
          this.emit({ t: 'volFx', meld: 'powderkeg', what: 'catch', id: o.id, x0: x, y0: y, x1: o.x, y1: o.y });
          o.burnDps = Math.max(o.burnT > 0 ? o.burnDps : 0, hurt * T.powderkeg.burn);
          o.burnT = Math.max(o.burnT, T.powderkeg.burnSecs);
          if (skill >= 0) o.lastSkill = skill;
        }
      }
      if (r.meld === 'chainreaction') this.chainArcs(x, y, hurt * T.chainreaction.share, skill);
    });
  }

  /** CHAIN REACTION in front (behind VOLT_MELDS): an explosion at (x, y) sends arcs to the nearest; what they kill explodes in its turn (it was killed by the ability). */
  private chainArcs(x: number, y: number, dmg: number, skill: number): void {
    const T = MELD_TUNE.chainreaction;
    const near = this.monsters
      .filter((o) => !o.dead && !this.shutIn(o) && Math.hypot(o.x - x, o.y - y) <= T.reach)
      .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
      .slice(0, T.arcs);
    for (const o of near) {
      this.emit({ t: 'volFx', meld: 'chainreaction', what: 'arc', id: o.id, x0: x, y0: y, x1: o.x, y1: o.y });
      this.damageMonster(o, Math.max(1, Math.round(dmg)), 'lightning', false, skill);
    }
    if (near.length) this.sfx('zap', 0.6);
  }

  /** SHATTER in front (behind VOLT_MELDS): a frozen one killed bursts into shards of ice as it goes off, a share of its life to each one near it, chilling them. */
  private shatterKill(m: Monster, skill: number): void {
    const T = MELD_TUNE.shatter;
    const dmg = Math.max(1, Math.round(m.maxLife * T.share));
    const x = m.x;
    const y = m.y;
    // (with its explosion, Volatile's: explodeKill)
    this.after(0.12, () => {
      for (const o of this.monsters) {
        if (o.dead || o === m || this.shutIn(o) || Math.hypot(o.x - x, o.y - y) > T.reach + o.r) continue;
        this.emit({ t: 'volFx', meld: 'shatter', what: 'shard', id: o.id, x0: x, y0: y, x1: o.x, y1: o.y });
        this.damageMonster(o, dmg, 'frost', false, skill);
        if (!o.dead) this.chillMonster(o, 0.3);
      }
    });
  }

  /** RUPTURE in front (behind VOLT_MELDS): a poisoned one killed bursts, its poison splashed on each one near it. */
  private ruptureKill(m: Monster, skill: number): void {
    const T = MELD_TUNE.rupture;
    const x = m.x;
    const y = m.y;
    const dps = m.poisonDps * T.share;
    // (with its explosion, Volatile's: explodeKill)
    this.after(0.12, () => {
      for (const o of this.monsters) {
        if (o.dead || o === m || this.shutIn(o) || Math.hypot(o.x - x, o.y - y) > T.reach + o.r) continue;
        this.emit({ t: 'volFx', meld: 'rupture', what: 'splash', id: o.id, x0: x, y0: y, x1: o.x, y1: o.y });
        this.poisonMonster(o, dps, skill);
      }
    });
  }

  /** SPLITTING, on a monster (Version 23.8): dying, it splits into two of its kind at half its life, ordinary, with no word (they split no more). */
  private splitMonster(m: Monster): void {
    const L = this.level;
    const rng = new RNG((Math.imul(this.seed, 131) + m.id * 7919 + this.kills * 31) >>> 0);
    const spots = scatter(L.walk, L.floor.w, L.floor.h, m.x, m.y, 2, rng);
    for (let k = 0; k < 2; k++) {
      const at = spots[k] ?? { x: m.x, y: m.y };
      const o = this.spawn(m.kind, at.x, at.y, m.packId, 0, false, rng);
      o.maxLife = o.life = Math.max(1, Math.round(m.maxLife * SPLIT.life));
      o.words = [];
      o.split = true;
      o.r *= SPLIT.look;
      this.wakeUp(o);
    }
    this.emit({ t: 'split', x: m.x, y: m.y, dx: m.fx, dy: m.fy, to: [] });
  }

  /**
   * Cracked ground or a ward circle, for `dur` seconds (`share`: what a ward takes off the harm).
   * Laid again where one already is, that one lasts as long again from now: they do not pile up.
   */
  private addPatch(i: number, kind: 'cracks' | 'ward' | 'vortex' | 'hex' | 'bubble', x: number, y: number, rad: number, dur: number, share: number): void {
    for (const o of this.zones) {
      if (o.kind === kind && Math.hypot(o.x - x, o.y - y) < 0.6 && o.r >= rad - 0.1) {
        o.t = 0;
        o.dur = dur;
        o.dmg = Math.max(o.dmg, share);
        this.emit({ t: 'zone', kind, x: o.x, y: o.y, r: o.r, el: 'phys', dur });
        return;
      }
    }
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    this.zones.push({ x, y, r: rad, t: 0, dur, kind, element: 'phys', dmg: share, slow: 0, tick: 0, hostile: false, skill: i, words: [], from: '' });
    this.emit({ t: 'zone', kind, x, y, r: rad, el: 'phys', dur });
  }

  /**
   * Is there room for one more thing on the ground? When the cap is reached, the hero's ground
   * patch nearest the end of its time gives way to the new one, so that what was just done always
   * shows. (Runes and the monsters' own warnings are never taken away.)
   */
  private roomForZone(): boolean {
    if (this.zones.length < TUNE.maxZones) return true;
    let oldest = -1;
    let left = Infinity;
    for (let k = 0; k < this.zones.length; k++) {
      const o = this.zones[k];
      if (o.hostile || o.kind === 'rune' || o.kind === 'warn') continue;
      if (o.dur - o.t < left) {
        left = o.dur - o.t;
        oldest = k;
      }
    }
    if (oldest < 0) return false;
    this.zones.splice(oldest, 1);
    return true;
  }

  private addGround(i: number, x: number, y: number, rad: number, frac: number): void {
    const r = this.hero.skills[i].r;
    const z = r.zone;
    if (!z) return;
    // (THE SKILL TREES: Rime, Frost's ice twice as big)
    if (z.kind === 'ice' && this.was('rime')) rad *= TALENT_TUNE.rime;
    // refresh a patch that is already there rather than stacking another
    for (const o of this.zones) {
      if (o.kind === z.kind && !o.hostile && Math.hypot(o.x - x, o.y - y) < 0.45 && o.r >= rad - 0.1) {
        o.t = 0;
        // (WORDMELDING: laid again by a melded word behind, it is that word's patch from now, its twist and all)
        if (r.meldBehind) o.meld = r.meldBehind;
        return;
      }
    }
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    const nz: Zone = { x, y, r: rad, t: 0, dur: z.dur, kind: z.kind, element: z.element, dmg: this.avgHit(i, frac) * z.dps, slow: z.slow, tick: 0.2, hostile: false, skill: i, words: [], from: '' };
    if (r.meldBehind) nz.meld = r.meldBehind;
    this.zones.push(nz);
    this.emit({ t: 'zone', kind: z.kind, x, y, r: rad, el: z.element, ...(r.meldBehind ? { meld: r.meldBehind } : {}) });
  }

  /** "of Venom": a cloud of poison hangs where the ability hit. */
  private addCloud(i: number, x: number, y: number, rad: number, frac: number): void {
    const r = this.hero.skills[i].r;
    for (const o of this.zones) {
      if (o.kind === 'venom' && Math.hypot(o.x - x, o.y - y) < 0.6 && o.r >= rad - 0.1) {
        o.t = 0;
        // (WORDMELDING: as for the ground: a cloud laid again by Fumes behind is Fumes' cloud, and goes up in fire)
        if (r.meldBehind) o.meld = r.meldBehind;
        return;
      }
    }
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    const nz: Zone = { x, y, r: rad, t: 0, dur: 5, kind: 'venom', element: 'phys', dmg: this.avgHit(i, frac) * r.cloud, slow: 0, tick: 0.2, hostile: false, skill: i, words: [], from: '' };
    if (r.meldBehind) nz.meld = r.meldBehind;
    this.zones.push(nz);
    this.emit({ t: 'zone', kind: 'venom', x, y, r: rad, el: 'phys', ...(r.meldBehind ? { meld: r.meldBehind } : {}) });
  }

  private addRune(i: number, x: number, y: number, frac: number): void {
    const r = this.hero.skills[i].r;
    // (VOLATILE'S MELDS, behind VOLT_MELDS: the melded word behind, whose twist the rune carries; Demolition's one huge, slow rune at a time)
    const meld = r.meldBehind && VOLT_MELD_IDS.includes(r.meldBehind) ? r.meldBehind : undefined;
    const D = MELD_TUNE.demolition;
    const huge = meld === 'demolition';
    if (huge && this.zones.some((z) => z.kind === 'rune' && z.skill === i && z.meld === 'demolition')) return;
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    const rad = 2.0 * r.size * (huge ? D.runeWide : 1);
    const wait = meld ? MELD_TUNE[meld as 'demolition'].wait : 1.2;
    const nz: Zone = { x, y, r: rad, t: 0, dur: wait, kind: 'rune', element: r.element, dmg: this.avgHit(i, frac) * r.rune * (huge ? D.runeHard : 1), slow: 0, tick: 0, hostile: false, skill: i, words: [], from: '' };
    if (meld) nz.meld = meld;
    this.zones.push(nz);
    this.emit({ t: 'zone', kind: 'rune', x, y, r: rad, el: r.element, ...(meld ? { meld } : {}) });
    this.sfx('rune', 0.7);
  }

  addWarn(x: number, y: number, rad: number, dur: number, dmg: number, el: Element, words: WordId[], from: string, src?: number, half?: HalfWords): void {
    // (a warning is never left out: if the floor is full, the oldest of the hero's own patches gives way to it)
    this.roomForZone();
    const z: Zone = { x, y, r: rad, t: 0, dur, kind: 'warn', element: el, dmg, slow: 0, tick: 0, hostile: true, skill: -1, words, from, src };
    if (half) z.half = half;
    this.zones.push(z);
  }

  /** One hit of ability `i` on a monster, with everything a word in front adds to it. `sure`: a certain critical (THE SKILL TREES REMADE: Far Sight). */
  private hitMonster(m: Monster, i: number, frac: number, quiet: boolean, sure = false): void {
    // (what is shut in a room is out of reach: `shutIn`)
    if (m.dead || this.shutIn(m)) return;
    const h = this.hero;
    const d = h.d;
    const r = h.skills[i].r;
    // (THE SKILL TREES REMADE: how it was before the hit: Keen Eye's unnoticed, Deep Freeze's frozen)
    const unaware = m.state === 'sleep';
    const wasFrozen = m.frozenT > 0;
    const st = d.stats;
    const el = r.element === 'fire' ? st.firePct : r.element === 'frost' ? st.frostPct : r.element === 'lightning' ? st.lightPct : st.physPct;
    let dmg = this.rng.range(d.dmgMin, d.dmgMax) * r.dmgMult * frac * (1 + (st.dmgPct + el + h.might) / 100);
    // (THE SKILL TREES: what the talents make of a hit)
    if (TALENTS.on) dmg *= this.talentHitMult(m);
    let crit = this.rng.chance(d.critChance / 100) || sure;
    // (THE SKILL TREES REMADE: Keen Eye, the first arrow at an enemy that has not noticed him a certain critical)
    if (unaware && this.now('keeneye') && this.arrowSkill(i)) crit = true;
    // (THE SKILL TREES: Master Stroke, every fourth hit landed on its own target a certain critical)
    if (!quiet && this.has('masterstroke') && ++this.strokes >= TALENT_TUNE.masterStroke.every) {
      this.strokes = 0;
      crit = true;
    }
    // PRECISE behind: the hero's next hit on a marked enemy is a certain critical, and spends the mark
    const spent = m.markT > 0;
    if (spent) {
      crit = true;
      m.markT = 0;
    }
    // (Hunter's Mark: the mark's critical is a triple one)
    if (crit) dmg *= 1 + (d.critMult / 100) * (spent && this.has('huntersmark') ? TALENT_TUNE.huntersMark : 1);
    // (WORDMELDING: Avalanche behind, a hit on a chilled enemy hits harder)
    if (r.meldBehind === 'avalanche' && m.chillT > 0) {
      dmg *= 1 + MELD_TUNE.avalanche.chilled;
      if (!quiet) this.emit({ t: 'meldFx', what: 'crush', id: m.id, x: m.x, y: m.y, x1: m.x, y1: m.y });
    }
    dmg = Math.max(1, Math.round(dmg));
    const x = m.x;
    const y = m.y;
    // (WORDMELDING: what it was before this hit, for Scald's crack)
    const wasBurning = m.burnT > 0;
    const wasChilled = m.chillT > 0;
    if (r.ignite > 0) {
      // (Searing: it burns longer, and harder)
      const sear = this.was('searing');
      const dps = ((dmg * r.ignite) / 3) * (sear ? TALENT_TUNE.searing.mult : 1);
      if (m.burnT <= 0) this.emit({ t: 'ignite', x, y });
      if (m.burnT <= 0 || dps > m.burnDps) m.burnDps = dps;
      m.burnT = 3 + (sear ? TALENT_TUNE.searing.secs : 0);
    }
    if (r.chill > 0) this.chillMonster(m, r.chill);
    // (WORDMELDING: Thunder in front, one big bolt out of the sky in place of the arcs)
    if (r.meld === 'thunder' && !quiet) {
      this.emit({ t: 'arc', x0: x, y0: y, x1: x, y1: y, sky: true, meld: 'thunder' });
      this.sfx('thunder', 0.6);
    }
    const front = quiet ? undefined : this.fronts(i);
    if (r.orbChance > 0 && !quiet) this.emit({ t: 'mark', x, y });
    // lightning comes down on the one it hits before it jumps to the others
    if (r.arcs > 0 && !quiet) this.emit({ t: 'arc', x0: x, y0: y, x1: x, y1: y, sky: true, ...(r.meld ? { meld: r.meld } : {}) });
    // (THE SKILL TREES: a lightning hit leaves it shocked, which Overload works on)
    if (TALENTS.on && (r.element === 'lightning' || r.arcs > 0)) m.shockT = TALENT_TUNE.shockSecs;
    if (spent) this.emit({ t: 'markSpent', id: m.id, x, y, dx: x - h.x, dy: y - h.y });
    // (THE SKILL TREES REMADE: Honed Edge, a critical hit makes it bleed half the hit again over three seconds)
    if (crit && this.now('honededge')) {
      const B = TALENT_TUNE.honedEdge2;
      m.bleedDps = Math.max(m.bleedT ? m.bleedDps ?? 0 : 0, (dmg * B.share) / B.secs);
      m.bleedT = B.secs;
    }
    // (THE CITY'S WORDS: a cursed one struck, its curse flares)
    if (!quiet && (m.hexT ?? 0) > 0) this.emit({ t: 'hexFlare', id: m.id });
    this.damageMonster(m, dmg, r.element, crit, i, !quiet && this.fronts(i).includes('power'), front);
    // (THE WARLOCK, game/warlock.ts: his bolt sets it burning in his hellfire; the curse, the smoke steps and the rakes curse it; and every hit feeds his pact)
    if (h.cls === 'warlock') this.warlockHit(m, i, dmg);
    // (THE CITY'S WORDS: SPLITTING in front, its first hit each use breaks into copies that fly on)
    if (r.split > 0 && !quiet && !this.copying && this.splitUse[i] !== h.skills[i].uses) {
      this.splitUse[i] = h.skills[i].uses;
      this.splitOff(m, i, frac * r.split, x, y);
    }
    // (THE SKILL TREES REMADE: Giant Slayer, each hit on an elite or a boss cracks its guard)
    if (!m.dead && (m.elite || m.boss) && this.now('giantslayer')) m.cracks = Math.min(TALENT_TUNE.giantSlayer2.most, (m.cracks ?? 0) + 1);
    // (Kindling, his fire leaves the ground burning where it hits; Deep Freeze, a frozen one struck slides away, freezing what it meets)
    if (r.element === 'fire' && this.now('kindling')) this.kindle(x, y);
    if (wasFrozen && !m.dead && !m.boss && this.now('deepfreeze')) this.throwMonster(m, h.x, h.y, TALENT_TUNE.deepFreeze2.far, TALENT_TUNE.deepFreeze2.secs, true);
    // (WORDMELDING: Blight in front, its poison biting harder the lower the enemy's life)
    const blight = r.meld === 'blight' && !m.dead ? 1 + (MELD_TUNE.blight.most - 1) * (1 - Math.max(0, m.life) / m.maxLife) : 1;
    if (r.poison > 0) this.poisonMonster(m, dmg * r.poison * blight, i);
    if (r.meld || r.meldBehind) this.meldHit(m, i, dmg, x, y, quiet, wasBurning, wasChilled);
    if (!m.dead) {
      // HEAVY in front stuns what it hits; gear with Heavy burned into it may stun too
      if (r.stun > 0) this.stunMonster(m, r.stun, r.meld === 'thunder' ? 'thunder' : undefined);
      else {
        const chance = Math.min(HEAVY.stunCap, st.stunChance);
        if (chance > 0 && this.rng.chance(chance / 100)) this.stunMonster(m, HEAVY.stun);
      }
      // THE CITY'S WORDS (Version 23.8): HEXING in front curses what it hits; STILLING in front slows it in time
      if (r.hex > 0) {
        const fresh = (m.hexT ?? 0) < 0.5;
        m.hexMore = Math.max((m.hexT ?? 0) > 0 ? m.hexMore ?? 0 : 0, r.hex);
        m.hexT = HEX.secs;
        if (fresh) this.emit({ t: 'hexOn', id: m.id, x, y, secs: HEX.secs });
      }
      if (r.still > 0) {
        const fresh = (m.stillT ?? 0) < 0.5;
        m.stillK = Math.max((m.stillT ?? 0) > 0 ? m.stillK ?? 0 : 0, r.still);
        m.stillT = STILL.secs;
        if (fresh) this.emit({ t: 'stillOn', id: m.id, x, y, secs: STILL.secs });
      }
      // BINDING in front holds what it hits in place
      if (r.bind > 0) {
        const held = this.bindMonster(m, r.bind);
        if (held > 0) this.emit({ t: 'bind', id: m.id, secs: held });
      }
      // PRECISE behind marks the first enemy each use hits (not one whose mark this very hit spent)
      if (r.mark && !spent && this.marked[i] !== h.skills[i].uses) {
        this.marked[i] = h.skills[i].uses;
        m.markT = PRECISE.markTime;
        this.emit({ t: 'markOn', id: m.id, x, y, secs: PRECISE.markTime });
      }
    }
    if (r.leech > 0) {
      // (LEECH.cap: no more than that share of his life back from Leech in any one second)
      let n = r.leech;
      if (LEECH.cap !== Infinity) {
        if (this.time - this.leechFrom >= 1) {
          this.leechFrom = this.time;
          this.leechGiven = 0;
        }
        n = Math.max(0, Math.min(n, LEECH.cap * h.d.maxLife - this.leechGiven));
        this.leechGiven += n;
      }
      if (n > 0) {
        this.healHero(n);
        this.emit({ t: 'leech', x, y, n });
      }
    }
    if (st.lifeOnHit > 0) this.healHero(st.lifeOnHit);
    if (r.arcs > 0 && !quiet) {
      // jump to the nearest other enemies
      const near = this.monsters
        .filter((o) => !o.dead && o !== m && Math.hypot(o.x - x, o.y - y) <= 3.5)
        .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
        .slice(0, r.arcs + (this.has('forking') ? TALENT_TUNE.forking : 0));
      for (const o of near) {
        this.emit({ t: 'arc', x0: x, y0: y, x1: o.x, y1: o.y, ...(r.meld ? { meld: r.meld } : {}) });
        if (TALENTS.on) o.shockT = TALENT_TUNE.shockSecs;
        const arc = Math.max(1, Math.round(dmg * r.arcDmg));
        this.damageMonster(o, arc, 'lightning', false, i);
        // (WORDMELDING: what an arc carries with it)
        if (r.meld) this.meldArc(o, m, i, arc, near);
      }
      if (near.length) this.sfx('zap', 0.6);
    }
    // (THE SKILL TREES REMADE: Charged, the charge gathered as he moved goes off with this hit)
    if (!quiet && this.charge >= 1 && this.now('charged')) this.releaseCharge(m, x, y);
  }

  /** THE SKILL TREES: what the talents make of the hero's hit on `m` (1: nothing). */
  private talentHitMult(m: Monster): number {
    const h = this.hero;
    const T = TALENT_TUNE;
    let k = 1;
    if (this.was('giantslayer') && (m.elite || m.boss)) k *= T.giantSlayer;
    if (this.was('steadyaim') && this.stillT >= T.steadyAim.still) k *= T.steadyAim.mult;
    if (this.was('farsight')) k *= 1 + T.farSight.most * Math.min(1, Math.hypot(m.x - h.x, m.y - h.y) / T.farSight.at);
    if (this.has('shatter') && m.frozenT > 0) k *= T.shatter;
    // (THE TINKERER's tree: Fortune, she hits harder the more gold she carries: 1% of her gold, as a percent)
    if (this.has('fortune')) k *= 1 + h.gold * TINKER_TUNE.talents.fortune;
    return k;
  }

  /**
   * A dose of poison: `dps` damage a second for as long as the poison lasts. Doses add up (to a
   * limit), and each new one starts the time again, so a thing that keeps being hit sickens fast.
   */
  private poisonMonster(m: Monster, dps: number, skill: number): void {
    if (m.dead) return;
    if (m.poisonT <= 0) {
      m.poisonDps = 0;
      m.poisonN = 0;
      this.emit({ t: 'poisoned', x: m.x, y: m.y });
    }
    // (THE SKILL TREES: Venom, twice as many doses)
    const most = TUNE.poisonStacks * (this.was('venom') ? TALENT_TUNE.venom : 1);
    if (m.poisonN < most) {
      m.poisonDps += dps;
      m.poisonN++;
    } else m.poisonDps = Math.max(m.poisonDps, dps * most);
    m.poisonT = TUNE.poisonTime;
    if (skill >= 0) m.lastSkill = skill;
  }

  /** A chilling hit on `m`, slowing it by `slow`: a second one on a chilled enemy freezes it (not a boss). */
  private chillMonster(m: Monster, slow: number): void {
    if (m.chillT > 0 && m.freezeImmune <= 0 && !m.boss) {
      // (Deep Freeze: frozen half as long again, and frozen again sooner)
      const deep = this.was('deepfreeze');
      m.frozenT = (m.elite ? 0.6 : 1.1) * (deep ? TALENT_TUNE.deepFreeze.frozen : 1);
      m.freezeImmune = deep ? TALENT_TUNE.deepFreeze.again : 4;
      // (THE MONSTERS' ATTACKS: a red troll frozen as he runs his charge is stopped in it)
      if (m.state === 'charge') this.endCharge(m);
      this.emit({ t: 'freeze', x: m.x, y: m.y });
      this.sfx('frost', 0.7);
    }
    m.chill = Math.max(m.chillT > 0 ? m.chill : 0, slow);
    m.chillT = 2.5;
  }

  /**
   * WORDMELDING (game/melds.ts): the twist of a melded word on one hit of ability `i`, which did
   * `dmg` to `m` at (x, y): in front, what the hit does; behind, its heat and its thunderclaps.
   * `wasBurning` and `wasChilled`: how it was before the hit.
   */
  private meldHit(m: Monster, i: number, dmg: number, x: number, y: number, quiet: boolean, wasBurning: boolean, wasChilled: boolean): void {
    const h = this.hero;
    const r = h.skills[i].r;
    const T = MELD_TUNE;
    const mf = r.meld;
    if (mf === 'eruption' && !quiet) {
      // the blast leaves a pool of molten ground
      this.meldPatch(i, 'burn', x, y, T.eruption.pool, T.eruption.poolDur, dmg * T.eruption.poolDps, 'fire');
    } else if (mf === 'avalanche' && !m.dead && !m.boss) {
      // shoved back from the hero; one stopped short by a wall or another is frozen where it stands
      let dx = m.x - h.x;
      let dy = m.y - h.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const grid = m.kind === 'bat' ? this.level.open : this.level.walk;
      const x0 = m.x;
      const y0 = m.y;
      const steps = 6;
      for (let k = 0; k < steps; k++) this.slide(m, Math.min(m.r, 0.42), (dx * T.avalanche.shove) / steps, (dy * T.avalanche.shove) / steps, grid);
      const went = Math.hypot(m.x - x0, m.y - y0);
      const crowded = this.monsters.some((o) => o !== m && !o.dead && Math.hypot(o.x - m.x, o.y - m.y) < o.r + m.r);
      if (went < T.avalanche.shove * 0.8 || crowded) {
        m.chillT = Math.max(m.chillT, 0.01);
        this.chillMonster(m, Math.max(m.chill, 0.3));
      }
      if (!quiet) this.emit({ t: 'meldFx', what: 'shove', id: m.id, x: x0, y: y0, x1: m.x, y1: m.y, ...(m.frozenT > 0 ? { frozen: true } : {}) });
    } else if (mf === 'scald' && !m.dead && !m.scaldCd && ((wasBurning && r.chill > 0) || (wasChilled && r.ignite > 0))) {
      // fire meets ice in it: it cracks
      m.scaldCd = T.scald.again;
      this.emit({ t: 'burst', x, y, r: 0.9, el: 'frost', style: 'blast', meld: 'scald' });
      this.sfx('shatter', 0.7);
      this.damageMonster(m, Math.max(1, Math.round(dmg * T.scald.crack)), r.element, false, i);
    } else if (mf === 'fumes' && !m.dead && !m.fumesCd && m.burnT > 0 && m.poisonT > 0) {
      // burning and poisoned, it gives off a toxic cloud
      m.fumesCd = T.fumes.again;
      this.meldPatch(i, 'venom', x, y, T.fumes.cloud, T.fumes.dur, m.poisonDps, 'phys');
    } else if (mf === 'frostbite' && !m.dead && (m.chillT > 0 || m.frozenT > 0)) {
      m.biteDps = Math.max(m.biteDps ?? 0, dmg * T.frostbite.bite);
    }
    if (quiet) return;
    const mb = r.meldBehind;
    if (mb === 'eruption') {
      // heat builds a hit at a time; at full heat, the next hit erupts round what it strikes
      if (this.meldHeat[i] >= T.eruption.heat) {
        this.meldHeat[i] = 0;
        const blast = Math.max(1, Math.round(dmg * T.eruption.blast));
        this.emit({ t: 'burst', x, y, r: T.eruption.blastR, el: 'fire', style: 'blast', meld: 'eruption' });
        this.emit({ t: 'shake', amount: 3 });
        this.sfx('explode', 0.8);
        for (const o of this.monsters) if (!o.dead && Math.hypot(o.x - x, o.y - y) <= T.eruption.blastR + o.r) this.damageMonster(o, blast, 'fire', false, i);
      } else if (++this.meldHeat[i] >= T.eruption.heat) this.emit({ t: 'text', x: h.x, y: h.y, text: 'HEAT', color: '#ff9a5a' }); // (Eruption's colour, art/icons.ts)
    } else if (mb === 'thunder') {
      // every few hits, a thunderclap round the hero
      if (++this.meldHits[i] >= T.thunder.every) {
        this.meldHits[i] = 0;
        const clap = Math.max(1, Math.round(dmg * T.thunder.clap));
        this.emit({ t: 'burst', x: h.x, y: h.y, r: T.thunder.clapR, el: 'lightning', style: 'blast', meld: 'thunder' });
        this.emit({ t: 'shake', amount: 3 });
        this.sfx('thunder', 0.8);
        for (const o of this.monsters) if (!o.dead && Math.hypot(o.x - h.x, o.y - h.y) <= T.thunder.clapR + o.r) this.damageMonster(o, clap, 'lightning', false, i);
      }
    } else if (mb === 'blight' && !m.dead) m.blightT = T.blight.secs;
  }

  /** WORDMELDING: what an arc of ability `i` carries to `o` (struck for `arc`) from `from`, by the melded word in front. */
  private meldArc(o: Monster, from: Monster, i: number, arc: number, struck: readonly Monster[]): void {
    const r = this.hero.skills[i].r;
    if (o.dead) return;
    if (r.meld === 'wildfire') {
      // burning jumps along the arc
      const dps = (arc * Math.max(r.ignite, 0.3)) / 3;
      if (o.burnT <= 0) this.emit({ t: 'ignite', x: o.x, y: o.y });
      if (o.burnT <= 0 || dps > o.burnDps) o.burnDps = dps;
      o.burnT = 3;
    } else if (r.meld === 'contagion') {
      this.poisonMonster(o, arc * Math.max(r.poison, 0.2), i);
    } else if (r.meld === 'hailstorm') {
      // the arc chills; a frozen one passes it on
      this.chillMonster(o, Math.max(r.chill, 0.3));
      if (o.frozenT > 0) {
        const next = this.monsters
          .filter((n) => !n.dead && n !== o && n !== from && !struck.includes(n) && Math.hypot(n.x - o.x, n.y - o.y) <= 3.5)
          .sort((a, b) => Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y))
          .slice(0, MELD_TUNE.hailstorm.passOn);
        for (const n of next) {
          this.emit({ t: 'arc', x0: o.x, y0: o.y, x1: n.x, y1: n.y, meld: 'hailstorm' });
          this.damageMonster(n, arc, 'lightning', false, i);
          this.chillMonster(n, Math.max(r.chill, 0.3));
        }
      }
    }
  }

  /** WORDMELDING: a patch a melded word's twist leaves (Eruption's molten pool, Fumes' cloud), for `dur` seconds, harming for `dps` a second. */
  private meldPatch(i: number, kind: 'burn' | 'venom', x: number, y: number, rad: number, dur: number, dps: number, el: Element): void {
    for (const o of this.zones) {
      if (o.kind === kind && !o.hostile && Math.hypot(o.x - x, o.y - y) < 0.6 && o.r >= rad - 0.1) {
        o.t = 0;
        o.dmg = Math.max(o.dmg, dps);
        // (and it looks like the pool or cloud it now is: the look only)
        const look = this.hero.skills[i].r.meld;
        if (look && !o.meld) o.look = look;
        return;
      }
    }
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    const look = this.hero.skills[i].r.meld;
    this.zones.push({ x, y, r: rad, t: 0, dur, kind, element: el, dmg: dps, slow: 0, tick: 0.2, hostile: false, skill: i, words: [], from: '', ...(look ? { look } : {}) });
    this.emit({ t: 'zone', kind, x, y, r: rad, el, ...(look ? { meld: look } : {}) });
  }

  /**
   * HEAVY: monster `m` is stunned for `secs`: it cannot move or attack, and what it was winding up
   * is broken off. An elite (a guardian too) for half as long; a boss never.
   */
  private stunMonster(m: Monster, secs: number, meld?: MeldId): void {
    if (m.dead || m.boss) return;
    const t = m.elite ? secs / 2 : secs;
    if (t <= m.stunT) return;
    m.stunT = t;
    this.breakOff(m);
    this.emit({ t: 'stun', id: m.id, x: m.x, y: m.y, secs: t, ...(meld ? { meld } : {}) });
  }

  /**
   * HEAVY behind: monster `m` walks onto cracked ground (at (fromX, fromY)) and is staggered: its
   * attack broken off, it reels for a moment, and the same ground lets it be a while before it can
   * stagger it again. Not a boss.
   */
  private staggerMonster(m: Monster, fromX: number, fromY: number): void {
    if (m.dead || m.boss || m.staggerCd > 0) return;
    m.staggerT = HEAVY.stagger;
    m.staggerCd = HEAVY.stagger + HEAVY.staggerAgain;
    this.breakOff(m);
    this.emit({ t: 'stagger', id: m.id, x: m.x, y: m.y, fromX, fromY });
  }

  /** An attack `m` was winding up is broken off, with the warning of a blow it was about to bring down. */
  private breakOff(m: Monster): void {
    // (THE FIRST FIVE FLOORS: an act of its own, game/bosses.ts)
    if (m.state === 'act') {
      this.bosses.breakOff(m);
      return;
    }
    if (m.state !== 'windup' && m.state !== 'charge' && m.state !== 'pickup') return;
    m.state = 'chase';
    m.anim = 'idle';
    m.charge = undefined;
    for (let k = this.zones.length - 1; k >= 0; k--) {
      const z = this.zones[k];
      if ((z.kind === 'warn' || z.kind === 'lane' || z.kind === 'aim') && z.src === m.id) this.zones.splice(k, 1);
    }
  }

  /** Heavy on a monster: its blow, from (fromX, fromY), knocks the hero back a step (walls stop it); `share`, a minion's half a step (MONSTER PACKS). */
  knockHero(fromX: number, fromY: number, share = 1): void {
    const h = this.hero;
    // (THE SKILL TREES REMADE: Resolute, nothing knocks him back)
    if (this.now('resolute')) return;
    // (THE BRAWLER'S TREE: Iron Chin, nothing knocks him back while he winds up a hold)
    if (this.ironChin()) return;
    let dx = h.x - fromX;
    let dy = h.y - fromY;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) {
      dx = -h.fx;
      dy = -h.fy;
    } else {
      dx /= len;
      dy /= len;
    }
    h.step = { dx: dx * HEAVY.knock * share, dy: dy * HEAVY.knock * share, t: 0.12 };
  }

  /**
   * VOLATILE'S MELDS behind (behind VOLT_MELDS), as a rune `z` goes off: Powderkeg's leaves burning ground; Rupture's bursts
   * into a poison cloud; Chain Reaction's sets off the hero's other linked runes, one after another.
   */
  private runeTwist(z: Zone): void {
    const T = MELD_TUNE;
    if (z.meld === 'powderkeg' && this.roomForZone() && this.onFloor(z.x, z.y)) {
      this.zones.push({ x: z.x, y: z.y, r: z.r * 0.7, t: 0, dur: T.powderkeg.groundSecs, kind: 'burn', element: 'fire', dmg: z.dmg * T.powderkeg.ground * 0.2, slow: 0, tick: 0.2, hostile: false, skill: z.skill, words: [], from: '', meld: 'powderkeg' });
      this.emit({ t: 'zone', kind: 'burn', x: z.x, y: z.y, r: z.r * 0.7, el: 'fire', meld: 'powderkeg' });
    } else if (z.meld === 'rupture' && this.roomForZone() && this.onFloor(z.x, z.y)) {
      this.zones.push({ x: z.x, y: z.y, r: z.r * 0.75, t: 0, dur: 5, kind: 'venom', element: 'phys', dmg: z.dmg * T.rupture.cloud * 0.2, slow: 0, tick: 0.2, hostile: false, skill: z.skill, words: [], from: '', meld: 'rupture' });
      this.emit({ t: 'zone', kind: 'venom', x: z.x, y: z.y, r: z.r * 0.75, el: 'phys', meld: 'rupture' });
    } else if (z.meld === 'chainreaction') {
      // (the nearest of the hero's own in reach, not yet set off, goes off a moment after; it in its turn sets off the next)
      const C = T.chainreaction;
      let next: Zone | null = null;
      let best = C.linkReach;
      for (const o of this.zones) {
        if (o === z || o.kind !== 'rune' || o.hostile || o.meld !== 'chainreaction' || o.linked || o.t >= o.dur) continue;
        const d = Math.hypot(o.x - z.x, o.y - z.y);
        if (d <= best) {
          best = d;
          next = o;
        }
      }
      if (next) {
        next.linked = true;
        next.dur = Math.min(next.dur, next.t + C.next);
        this.emit({ t: 'volFx', meld: 'chainreaction', what: 'link', x0: z.x, y0: z.y, x1: next.x, y1: next.y });
      }
    }
  }

  /** A monster's warning or lane lands on the hero (THE CITY'S WORDS: by the monster that laid it, for Hexing's circle). */
  private hurtFrom(z: Zone): void {
    this.blowBy = z.src;
    this.hurtHero(z.dmg, z.element, z.words, null, z.from, z.x, z.y, z.half);
    this.blowBy = undefined;
  }

  /** PULLING, on a monster (Version 23.8): its blow from (fromX, fromY) drags the hero a step toward it (`share` of PULL.monster), never into it. */
  pullHero(fromX: number, fromY: number, share = 1): void {
    const h = this.hero;
    if (this.now('resolute')) return;
    // (THE BRAWLER'S TREE: Iron Chin, nor drags him off his feet while he winds up a hold)
    if (this.ironChin()) return;
    const dx = fromX - h.x;
    const dy = fromY - h.y;
    const len = Math.hypot(dx, dy);
    const far = Math.min(PULL.monster * share, len - 0.8);
    if (len < 0.01 || far <= 0.05) return;
    h.step = { dx: (dx / len) * far, dy: (dy / len) * far, t: 0.12 };
    this.emit({ t: 'heroPulled', x: h.x, y: h.y, fromX, fromY });
  }

  /** `poison`: the harm is poison working (its number is drawn in poison's colour, and it does not flash the monster). */
  /** `dot`: harm over time (burning, fire or ice on the ground): no flash (9 Oct 2026, 22:12, "mobs shouldn’t flash white when taking dot damage"). */
  private damageMonster(m: Monster, dmg: number, el: Element, crit: boolean, skill: number, heavy = false, words?: readonly WordId[], poison = false, dot = false): void {
    // (what is shut in a room is out of reach, of an arc of lightning and of what burns on the ground too: `shutIn`)
    if (m.dead || this.shutIn(m)) return;
    // (BOSS_INTRO: nor is a boss who waits, until his gate has fallen and his line is said: `bossWaits`)
    if (this.bossWaits(m)) {
      if (this.time - this.waitTold > 0.7) {
        this.waitTold = this.time;
        this.emit({ t: 'text', x: m.x, y: m.y, text: 'Not yet', color: '#ffd27a' });
      }
      return;
    }
    // (ACT 1: nor is one up in the air, or under the water, as its kind's rules have it)
    const r1 = ACT1.on ? act1Rules(m.kind) : null;
    if (r1 && r1.reachable && !r1.reachable(m)) return;
    // (FLESH_BLINK: nor the Fleshmancer while he is gone)
    if (m.kind === 'fleshmancer' && blinkedAway(m)) return;
    // (nor one that cannot be hurt now, and says so: a boss as he changes into his next phase)
    if (r1 && r1.invulnerable && r1.invulnerable(m)) {
      if (this.time - this.waitTold > 0.7) {
        this.waitTold = this.time;
        this.emit({ t: 'text', x: m.x, y: m.y, text: 'Invulnerable', color: '#ffd27a' });
      }
      return;
    }
    // (ACT 1: one shielded by another standing by it takes less: the chanter's ward over the cult near it, game/act1_rules/)
    if (ACT1.on) {
      const ward = act1Ward(this.bosses, m);
      if (ward > 0) dmg = Math.max(1, Math.round(dmg * (1 - ward)));
    }
    // (THE SKILL TREES: Overload, a shocked enemy takes more from everything)
    if (m.shockT > 0 && this.was('overload')) dmg = Math.max(1, Math.round(dmg * TALENT_TUNE.overload));
    // (THE SKILL TREES REMADE: Giant Slayer's cracks in its guard: more from everything)
    if (m.cracks && TALENTS2.on) dmg = Math.max(1, Math.round(dmg * (1 + TALENT_TUNE.giantSlayer2.each * m.cracks)));
    // (WORDMELDING: Blight behind, a poisoned enemy it has touched takes more from everything)
    if (m.blightT && m.poisonT > 0) dmg = Math.max(1, Math.round(dmg * (1 + MELD_TUNE.blight.more)));
    // (THE CITY'S WORDS: Hexing in front's curse, more from everything)
    if ((m.hexT ?? 0) > 0 && m.hexMore) dmg = Math.max(1, Math.round(dmg * (1 + m.hexMore)));
    // (GUARDING, on a monster: its shield takes the harm first)
    if (m.shield > 0) {
      const soak = Math.min(m.shield, dmg);
      m.shield -= soak;
      m.life -= dmg - soak;
    } else m.life -= dmg;
    // (VOLATILE'S MELDS, behind VOLT_MELDS: Demolition in front, an elite or a boss bursts once at half its life)
    if (skill >= 0 && (m.elite || m.boss) && !m.demolished && m.life > 0 && m.life <= m.maxLife * 0.5) {
      const rr = this.hero.skills[skill]?.r;
      if (rr && rr.meld === 'demolition' && rr.volatile > 0) {
        m.demolished = true;
        this.emit({ t: 'volFx', meld: 'demolition', what: 'half', id: m.id, x: m.x, y: m.y, r: 1.8 * MELD_TUNE.demolition.bigger });
        this.explodeKill(m, rr, skill, MELD_TUNE.demolition.half);
      }
    }
    if (!poison && !dot) m.flash = heavy ? 0.2 : 0.12;
    // (ACT 1: struck, it reels, as its picture has it: render/figure.ts gaitFrame)
    if (!poison && !dot && r1) m.struckT = 0;
    m.barT = 4;
    if (skill >= 0) m.lastSkill = skill;
    if (m.state === 'sleep') this.wakeUp(m);
    this.emit({ t: 'hit', x: m.x, y: m.y, amount: dmg, crit, el, onHero: false, heavy, words: words && words.length ? words : undefined, poison: poison || undefined });
    // (ACT 1: one whose rules hold its life up is kept there: a boss with another life bar to come, or one who must first be where his death was drawn)
    if (r1 && r1.lifeFloor) {
      const least = r1.lifeFloor(this.bosses, m);
      if (least > 0 && m.life < least) m.life = least;
    }
    if (m.life <= 0) this.kill(m);
  }

  kill(m: Monster): void {
    if (m.dead) return;
    m.dead = true;
    this.kills++;
    // (THE MONSTERS' ATTACKS: the line of a charge it was making goes with it)
    if (m.charge || m.state === 'windup') this.dropLane(m);
    const h = this.hero;
    // (ACT 1: one killed up in the air falls from where it was, a vulture overhead (Version 23.5): over the drop, it falls
    // away into it, `away`, and what it leaves lands on the nearest floor)
    const r1 = ACT1.on ? act1Rules(m.kind) : null;
    const lift = r1 && r1.height ? Math.max(0, r1.height(m)) : 0;
    const away = lift > 0 && this.pitAt(m.x, m.y);
    this.emit({ t: 'die', x: m.x, y: m.y, kind: m.kind, elite: m.elite, champion: m.champion, boss: m.boss, fx: m.fx, fy: m.fy, ...(m.form ? { form: m.form } : {}), ...(lift > 0 ? { lift } : {}), ...(away ? { away } : {}) });
    // (THE FIRST FIVE FLOORS: a cultist's body lies where it fell; an amalgamation's beasts fall apart with it)
    if (BOSSES5.on || this.corpses.length) this.bosses.died(m);
    if (away) {
      const at = this.floorNear(m.x, m.y);
      m.x = at.x;
      m.y = at.y;
    }
    if (m.frozenT > 0) {
      this.emit({ t: 'shatter', x: m.x, y: m.y });
      this.sfx('shatter', 0.8);
    }
    if (TALENTS.on) this.talentKill(m);
    // (THE WARLOCK, game/warlock.ts: a cursed one dying spreads every burn on it to those near it; and what his tree makes of a kill)
    const cursed = (m.curseT ?? 0) > 0;
    if (cursed) this.spreadBurns(m);
    if (h.cls === 'warlock' && TALENTS.on) this.warlockKill(m, cursed);
    this.sfx(m.boss || m.champion ? 'explode' : 'monsterDie', m.boss ? 1 : 0.7);
    if (m.champion) this.emit({ t: 'shake', amount: 4 });
    const st = h.d.stats;
    if (st.lifeOnKill > 0) this.healHero(st.lifeOnKill);
    h.potionKills++;
    if (h.potionKills >= TUNE.potionKills) {
      h.potionKills = 0;
      if (h.potions < TUNE.potionMax) h.potions++;
    }
    // what the killing ability's words add
    const r = m.lastSkill >= 0 ? h.skills[m.lastSkill].r : null;
    if (r && r.frenzyFeed) {
      // FRENZIED behind: a kill adds to the frenzy and holds it longer (to three times its usual hold)
      h.frenzy = Math.min(this.stackMax(), h.frenzy + 1);
      h.frenzyT = Math.min(FRENZY.hold * 3, h.frenzyT + FRENZY.hold);
      this.emit({ t: 'frenzyFed', x: m.x, y: m.y });
    }
    if (r && r.volatile > 0) this.explodeKill(m, r, m.lastSkill);
    // (VOLATILE'S MELDS, behind VOLT_MELDS: Shatter in front, a frozen one bursts into shards; Rupture, a poisoned one bursts its poison over those round it)
    if (r && r.meld === 'shatter' && m.frozenT > 0) this.shatterKill(m, m.lastSkill);
    if (r && r.meld === 'rupture' && m.poisonT > 0 && m.poisonDps > 0) this.ruptureKill(m, m.lastSkill);
    if (r && r.orbChance > 0 && this.rng.chance(r.orbChance)) {
      this.addDrop('orb', m.x, m.y, 0, null, null);
      this.emit({ t: 'orb', x: m.x, y: m.y });
      this.sfx('leech', 0.7);
    }
    // a monster carrying Volatile goes off after a short warning (a minion, of its leader's Volatile, at half strength)
    const blast = wordShare(m, 'volatile');
    if (blast > 0) {
      this.addWarn(m.x, m.y, 1.8, 0.7, ((m.dmgMin + m.dmgMax) / 2) * 1.5 * blast, this.monsterElement(m), [], `${m.name}'s dying blast`, undefined, this.halfOf(m));
    }
    // THE CITY'S WORDS (Version 23.8): one carrying Splitting splits in two at half its life (a minion, of its leader's, too)
    if (wordShare(m, 'splitting') > 0 && !m.split && !m.boss) this.splitMonster(m);
    this.dropLoot(m);
    this.gainXp(m.xp);
    this.quip(m);
    if (m.boss) {
      // (FLOOR 13'S DOUBLE BOSS: one of the pair fallen, the other fights on, the floor's boss now; the way opens when both have fallen)
      const other = partnerOf(this, m);
      if (other) {
        this.boss = other;
        this.emit({ t: 'shake', amount: 5 });
        this.msg(`${m.name} falls. ${other.name} fights on alone.`, MSG.foe);
        return;
      }
      this.boss = null;
      this.emit({ t: 'shake', amount: 6 });
      // (THE WAYS: the stairwell down opens in his hall, clear of where he fell; where the floor has none, the portal home as before)
      const W = this.level.ways;
      const st = W ? stairFor(W.stairs, m.x, m.y, this.hero.x, this.hero.y) : null;
      if (W && W.onward) {
        // (ACT 1, THE DESCENT: the way on wakes at the far end of his ground: down the mountain, or from the Fen, home)
        W.onward.awake = true;
        W.onward.warpAt = this.time;
        // (EXITS, floors 6 to 10: its film plays, and the line comes as it is open: updateWays)
        if (!W.a1) {
          this.sfx('power', 0.8);
          this.msg(this.depth >= 10 && !(ENDLESS.on && this.inEndless) ? 'The siege magic falters. The way home is open.' : 'The way on is open.', MSG.good);
        }
      } else if (W && W.shaft) {
        // (THE FIRST FIVE FLOORS: on the fifth floor the cage comes crashing down the mine shaft at the back of his hall)
        W.shaft.state = 'coming';
        W.shaft.t = 0;
        this.sfx('thunder', 0.35);
      } else if (W && W.cave && W.cave.state === 'wall') {
        // (EXITS, FLOOR 4: a wall of his hall crumbles, and behind it, a cave: the way down to the Fleshmancer's lair)
        W.cave.state = 'falling';
        W.cave.t = 0;
        const m = doorMiddle(W.cave.spot);
        this.emit({ t: 'caveOpens', x: m.x, y: m.y });
        this.emit({ t: 'shake', amount: 5 });
        this.sfx('thunder', 0.35);
      } else if (W && st) {
        W.stair = st;
        this.openStair(st);
      } else {
        const p = this.level.portal;
        if (p) p.state = 1;
        this.msg('The way back to town is open', MSG.good);
        this.sfx('portal');
      }
    }
  }

  /** THE SKILL TREES: what a kill does with the talents: Momentum's speed; Inferno's blast for one that dies burning; Shatter's burst of cold for one that dies frozen. */
  private talentKill(m: Monster): void {
    const T = TALENT_TUNE;
    if (this.was('footwork')) this.footworkT = T.footwork.secs;
    const x = m.x;
    const y = m.y;
    // (THE SKILL TREES REMADE: Footwork, Lunge ready again; Windrunner, a roll back; Venom's cloud; Overload's shock passed on; Rime's ice shattering)
    if (this.now('footwork')) this.readyAgain('leap');
    if (this.now('windrunner')) this.readyAgain('roll');
    if (this.now('venom') && m.poisonT > 0 && m.poisonDps > 0) this.venomCloud(m);
    if (this.now('overload') && m.shockT > 0) this.passShock(m);
    if (this.now('rime')) this.rimeShatter(m);
    if (this.has('inferno') && m.burnT > 0) {
      const boom = Math.max(1, Math.round(m.maxLife * T.inferno));
      this.after(0.1, () => {
        this.emit({ t: 'burst', x, y, r: T.burstR, el: 'fire', style: 'blast' });
        this.sfx('explode', 0.6);
        for (const o of this.monsters) {
          if (o.dead || this.shutIn(o) || Math.hypot(o.x - x, o.y - y) > T.burstR + o.r) continue;
          this.damageMonster(o, boom, 'fire', false, -1);
          if (o.dead) continue;
          // (and what it reaches catches fire)
          if (o.burnT <= 0) this.emit({ t: 'ignite', x: o.x, y: o.y });
          o.burnDps = Math.max(o.burnT > 0 ? o.burnDps : 0, boom / 3);
          o.burnT = 3;
        }
      });
    }
    if (this.has('shatter') && m.frozenT > 0) {
      this.emit({ t: 'burst', x, y, r: T.burstR, el: 'frost', style: 'shock' });
      for (const o of this.monsters) {
        if (o.dead || o === m || this.shutIn(o) || Math.hypot(o.x - x, o.y - y) > T.burstR + o.r) continue;
        o.chill = Math.max(o.chillT > 0 ? o.chill : 0, T.shatterChill);
        o.chillT = 2.5;
      }
    }
  }

  /** The hero's highest attribute, gear counted. On a tie, the class's own; failing that, in the order Strength, Dexterity, Intelligence. */
  topAttr(): Attr {
    const d = this.hero.d;
    const best = Math.max(d.str, d.dex, d.int);
    const own = CLASSES[this.hero.cls].primary;
    if (d[own] === best) return own;
    return d.str === best ? 'str' : d.dex === best ? 'dex' : 'int';
  }

  /**
   * The hero's line on killing something big (see QUIPS). Sparse: a boss always earns one, an
   * elite now and then and never soon after the last; and no line twice until all have been said.
   */
  private quip(m: Monster): void {
    if (!m.boss && !m.elite && !m.champion) return;
    const q = this.flair;
    const now = this.runTime;
    if (!m.boss && (now - this.quipAt < QUIPS.gap || !q.chance(QUIPS.chance))) return;
    // the lists that fit this kill: the boss's own, a word on the attack that did it, the attack, the weapon, the top attribute, the class, any
    const h = this.hero;
    const W = QUIPS.weight;
    const lists: { w: number; lines: readonly string[] }[] = [];
    if (m.boss) lists.push({ w: W.boss, lines: QUIPS.boss });
    const s = m.lastSkill >= 0 ? h.skills[m.lastSkill] : null;
    if (s) {
      const words = [...s.front, ...s.behind].filter((w): w is WordId => w !== null);
      // (RANK II: a ranked word speaks its word's lines)
      if (words.length) lists.push({ w: W.word, lines: QUIPS.word[rankBase(q.pick(words))] });
      lists.push({ w: W.skill, lines: QUIPS.skill[s.id] });
    }
    const weapon = h.gear.mainhand ? h.gear.mainhand.weapon : null;
    if (weapon) lists.push({ w: W.weapon, lines: QUIPS.weapon[weapon] });
    lists.push({ w: W.attr, lines: QUIPS.attr[this.topAttr()] });
    lists.push({ w: W.cls, lines: QUIPS.cls[h.cls] });
    lists.push({ w: W.any, lines: QUIPS.any });
    let open = lists.map((l) => ({ w: l.w, lines: l.lines.filter((t) => !this.quipSaid.has(t)) })).filter((l) => l.lines.length > 0);
    if (!open.length) {
      // every line that fits has been said: they may all be said again
      for (const l of lists) for (const t of l.lines) this.quipSaid.delete(t);
      open = lists.filter((l) => l.lines.length > 0).map((l) => ({ w: l.w, lines: [...l.lines] }));
    }
    if (!open.length) return;
    const line = q.pick(open[q.weightedIndex(open.map((l) => l.w))].lines);
    this.quipSaid.add(line);
    this.quipAt = now;
    this.emit({ t: 'quip', text: line, boss: m.boss });
  }

  // ===========================================================================================
  // Being hurt

  monsterElement(m: Monster): Element {
    for (const w of m.words) {
      if (w === 'fire' || w === 'frost' || w === 'lightning') return w;
    }
    return MONSTERS[m.kind].element;
  }

  rollMonsterDmg(m: Monster): number {
    return this.rng.range(m.dmgMin, m.dmgMax);
  }

  /**
   * (ox, oy): where a blow that has no monster behind it (a shot, a warning) came from: the way a Heavy one knocks the hero.
   * `half`: MONSTER PACKS, a minion's shot or warning: those of `words` it has at half strength
   * (for a blow of the minion itself, read off `src`).
   */
  hurtHero(raw: number, el: Element, words: readonly WordId[], src: Monster | null, from = '', ox?: number, oy?: number, half?: HalfWords): void {
    const h = this.hero;
    if (this.over || h.invuln > 0 || h.move) return;
    this.slainBy = src ? src.name : from;
    const d = h.d;
    const fromX = src ? src.x : ox ?? h.x + h.fx;
    const fromY = src ? src.y : oy ?? h.y + h.fy;
    // (THE BRAWLER'S TREE: Slip Reflex, once every six seconds a blow that would hit him is slipped by itself, and he counters)
    if (this.slipReflex(fromX, fromY)) return;
    // MONSTER PACKS: how much of each word's power the blow has (a minion's, of its leader's words,
    // half); and when the word that made it Flame, Frost or Lightning is one of those, only half of
    // the blow is of that element, the rest of the minion's own
    const hv = half ?? (src ? this.halfOf(src) : undefined);
    const k = (w: WordId): number => wordShare({ words, half: hv ? hv.words : undefined }, w);
    const elK = hv && el !== hv.base && hv.words.includes(el as WordId) ? PACKS.minion : 1;
    const parts: [Element, number][] = elK < 1 && hv ? [[el, elK], [hv.base, 1 - elK]] : [[el, 1]];
    // GUARDING burned into gear: a chance to block the blow, which then does nothing at all
    const block = Math.min(GUARD.blockCap, d.stats.blockChance);
    if (block > 0 && this.rng.chance(block / 100)) {
      this.emit({ t: 'blocked', x: h.x, y: h.y, fromX, fromY });
      this.emit({ t: 'text', x: h.x, y: h.y, text: 'Blocked', color: '#9fe8c0' });
      this.sfx('hit', 0.5);
      return;
    }
    let dmg = 0;
    for (const [e, share] of parts) {
      // (PRECISE, on a monster: its blows find the gaps in the hero's armour)
      if (e === 'phys') dmg += raw * share * (1 - armorReduction(k('precise') > 0 ? d.armor * (1 - PRECISE.armourIgnored * k('precise')) : d.armor, Math.max(1, this.power)));
      else dmg += raw * share * (1 - (e === 'fire' ? d.resFire : e === 'frost' ? d.resFrost : d.resLight) / 100);
    }
    if (h.shockT > 0) dmg *= 1.2;
    // THE CITY'S WORDS (Version 23.8): HEXING behind, a blow from one standing in a hex circle is weaker (a shot or a warning, from
    // the one that made it: `blowBy`); HEXING on a monster, a hero cursed by it takes more
    const by = src ?? (this.blowBy !== undefined ? this.monsters.find((o) => o.id === this.blowBy && !o.dead) ?? null : null);
    const hexed = by ? this.patchAt('hex', by.x, by.y) : null;
    if (hexed) dmg *= 1 - hexed.dmg;
    if ((h.hexT ?? 0) > 0 && h.hexMore) dmg *= 1 + h.hexMore;
    // GUARDING behind: inside a ward the hero takes less (the strongest ward they stand in)
    let ward = 0;
    for (const z of this.zones) if (z.kind === 'ward' && Math.hypot(h.x - z.x, h.y - z.y) <= z.r) ward = Math.max(ward, z.dmg);
    if (ward > 0) dmg *= 1 - ward;
    // (THE SKILL TREES: Bulwark)
    if (this.was('bulwark')) dmg *= TALENT_TUNE.bulwark;
    // (THE SKILL TREES REMADE: Bulwark, the more close round him the less each blow; Thick Skin, below half his life, less)
    if (this.now('bulwark')) {
      const B = TALENT_TUNE.bulwark2;
      let n = 0;
      for (const m of this.monsters) if (!m.dead && m.state !== 'sleep' && Math.hypot(m.x - h.x, m.y - h.y) <= m.r + TUNE.heroRadius + B.near) n++;
      dmg *= 1 - Math.min(B.most, B.each * n);
    }
    if (this.now('thickskin') && h.life < h.d.maxLife * TALENT_TUNE.thickSkin2.below) dmg *= 1 - TALENT_TUNE.thickSkin2.less;
    // (THE BRAWLER'S TREE: Iron Chin, winding up a hold he takes a third less)
    if (this.ironChin()) dmg *= 1 - BRAWL_TUNE.talents.ironChin.less;
    dmg = Math.max(1, Math.round(dmg));
    // (Bitter Cold: what strikes him is chilled)
    if (src && !src.dead && this.now('bittercold')) {
      src.chill = Math.max(src.chillT > 0 ? src.chill : 0, TALENT_TUNE.bitterCold2.slow);
      src.chillT = Math.max(src.chillT, TALENT_TUNE.bitterCold2.secs);
    }
    // (THE SKILL TREES: Thorns, what strikes him up close takes some of the blow back)
    if (src && !src.dead && this.has('thorns') && Math.hypot(src.x - h.x, src.y - h.y) <= src.r + TALENT_TUNE.thorns.reach) {
      // (TALENTS2: half the blow back, and thrown back)
      const remade = this.now('thorns');
      this.damageMonster(src, Math.max(1, Math.round(raw * (remade ? TALENT_TUNE.thorns2.share : TALENT_TUNE.thorns.share))), 'phys', false, -1);
      if (remade && !src.dead) this.throwMonster(src, h.x, h.y, TALENT_TUNE.thorns2.far);
    }
    // HEAVY, on a monster: its blows knock the hero back a step
    if (k('heavy') > 0) this.knockHero(fromX, fromY, k('heavy'));
    // THE CITY'S WORDS, on a monster (Version 23.8): PULLING drags him a step toward it; HEXING curses him, he takes more for a
    // while; STILLING makes his cooldowns run slower for a while (a minion, of its leader's words, at half)
    if (k('pulling') > 0) this.pullHero(fromX, fromY, k('pulling'));
    if (k('hexing') > 0) {
      if ((h.hexT ?? 0) <= 0) {
        this.emit({ t: 'heroHexed', x: h.x, y: h.y, secs: HEX.monsterSecs });
        this.emit({ t: 'text', x: h.x, y: h.y, text: 'Hexed', color: '#ff8a80' });
      }
      h.hexMore = Math.max((h.hexT ?? 0) > 0 ? h.hexMore ?? 0 : 0, HEX.monster * k('hexing'));
      h.hexT = HEX.monsterSecs;
    }
    if (k('stilling') > 0) {
      if ((h.stillT ?? 0) <= 0) {
        this.emit({ t: 'heroStilled', x: h.x, y: h.y, secs: STILL.monsterSecs });
        this.emit({ t: 'text', x: h.x, y: h.y, text: 'Slowed', color: '#ff8a80' });
      }
      h.stillK = Math.max((h.stillT ?? 0) > 0 ? h.stillK ?? 0 : 0, STILL.cooldowns * k('stilling'));
      h.stillT = STILL.monsterSecs;
    }
    // BINDING, on a monster: its blow roots him where he stands (a minion's for less), then not again for a while
    if (k('binding') > 0 && (h.rootAgain ?? 0) <= 0 && !this.now('resolute')) {
      const secs = BIND.rootSecs * k('binding');
      h.rootT = secs;
      h.rootAgain = secs + BIND.rootAgain;
      this.emit({ t: 'rooted', x: fromX, y: fromY, secs });
      this.emit({ t: 'text', x: h.x, y: h.y, text: 'Rooted', color: '#ff8a80' });
    }
    // GUARDING in front: the shield takes the blow first
    let soaked = 0;
    if (h.shield > 0) {
      soaked = Math.min(h.shield, dmg);
      h.shield -= soaked;
      dmg -= soaked;
      if (h.shield <= 0) {
        h.shield = 0;
        h.shieldT = 0;
        // (THE SKILL TREES REMADE: Shieldwall, the shield breaking bursts outward)
        if (this.now('shieldwall')) this.shieldBurst();
      }
    }
    if (soaked > 0 || ward > 0) this.emit({ t: 'guarded', x: h.x, y: h.y, fromX, fromY });
    // (all of it taken by the shield: nothing reaches the hero)
    if (dmg <= 0) return;
    h.life -= dmg;
    h.flash = 0.15;
    if (this.guide) this.guide.hits++;
    this.emit({ t: 'hit', x: h.x, y: h.y, amount: dmg, crit: false, el, onHero: true });
    this.emit({ t: 'shake', amount: Math.min(5, 1 + dmg / 8) });
    this.sfx('hurt', 0.8);
    if (k('poison') > 0) {
      // a monster with Poison: most of the blow again, over the next few seconds
      h.poisonDps = Math.max(h.poisonT > 0 ? h.poisonDps : 0, (dmg * 0.6 * k('poison')) / TUNE.poisonTime);
      h.poisonT = TUNE.poisonTime;
    }
    // (what each element of the blow leaves: a minion's half of Flame burns half as hard)
    for (const [e, share] of parts) {
      if (e === 'fire') {
        h.burnDps = Math.max(h.burnT > 0 ? h.burnDps : 0, (dmg * 0.3 * share) / 3);
        h.burnT = 3;
      } else if (e === 'frost') {
        h.chill = Math.max(h.chillT > 0 ? h.chill : 0, 0.3 * share);
        h.chillT = 2;
      } else if (e === 'lightning') {
        h.shockT = Math.max(h.shockT, 3 * share);
      }
    }
    // (LEECH on a monster heals what its blow takes: 9 Oct 2026, 22:12, "bosses with leech are very hard to kill"; asked,
    // "What its blow takes (Recommended)". Until then, 15% of its whole life a blow.)
    if (src && !src.dead && k('leech') > 0) {
      src.life = Math.min(src.maxLife, src.life + dmg * k('leech'));
      this.emit({ t: 'text', x: src.x, y: src.y, text: 'heals', color: '#ff8a80' });
    }
    // (THE SKILL TREES: Unbreakable, once in each dungeon a killing blow leaves him at 1 life, shielded)
    if (h.life <= 0 && this.has('unbreakable') && !this.unbroken && !this.practice) {
      this.unbroken = true;
      h.life = 1;
      h.invuln = Math.max(h.invuln, TALENT_TUNE.unbreakable.secs);
      this.emit({ t: 'shield', x: h.x, y: h.y, secs: TALENT_TUNE.unbreakable.secs });
      this.emit({ t: 'text', x: h.x, y: h.y, text: 'Unbreakable', color: '#7af8f0' });
      this.sfx('power', 0.9);
    }
    if (h.life <= 0) {
      this.die();
      if (this.over) this.emit({ t: 'shake', amount: 6 });
    }
  }

  /** The run ends. Only the Lexicon and the stash (this.meta) go on to the next character. */
  private die(): void {
    if (this.over) return;
    if (this.practice || (this.guide && this.depth === 1 && this.cleared === 0)) {
      // The practice room only knocks the wind out of you. So does the first dungeon, for as long
      // as its prompts are running: nobody should lose their first character before they have
      // set their first word.
      this.hero.life = this.hero.d.maxLife;
      this.hero.invuln = 1.5;
      this.emit({ t: 'text', x: this.hero.x, y: this.hero.y, text: 'UP AGAIN', color: '#ffe070' });
      return;
    }
    this.hero.life = 0;
    // (THE WARLOCK: the demon falls as the man it was, its pact gone)
    if (this.hero.cls === 'warlock' && (this.hero.form === 'demon' || this.hero.change)) {
      this.hero.change = null;
      this.hero.form = 'man';
      this.hero.pact = 0;
      this.refresh();
      this.hero.life = 0;
    }
    // (THE TINKERER: her Golems wind down where they stand)
    for (const g of this.golemsUp()) this.windDown(g);
    // (ACT 2, THE HUSH: a word the Physician holds is the fallen hero's again)
    giveBackAll(this);
    this.over = true;
    // (a fallen hero holds nothing: a beam or a whirlwind that was being held ends with them. The
    // rules stop here, so nothing else would end it, and the picture of it would stand over
    // them as they fall.)
    this.hero.channel = null;
    // (a Normal hero is not lost: they will wake in town, `wakeSave`. The Lexicon counts the lost.)
    if (!this.wakes) this.meta.deaths++;
    this.sfx('death');
  }

  /**
   * NORMAL MODE (game/modes.ts): this hero, fallen or not, would wake in town from a death here.
   * Only with the switch on, for a Normal hero, in a dungeon gone into (not the practice room).
   */
  get wakes(): boolean {
    // (ENDLESS MODE: a death on an endless level is the hero's end, Normal or Hardcore: his pick, “The hero too”)
    return MODES.on && this.mode === 'normal' && this.inDungeon && !this.practice && this.entry !== null && !(ENDLESS.on && this.inEndless);
  }

  /**
   * ENDLESS MODE (game/endless.ts): the depth the strength of this floor's monsters and what it gives up are of. The floor's own
   * depth, but on an endless level that level's (one past the last floor built, and one more for each after it), and in town,
   * once the endless levels are open to him, the one he has reached (what the vendors have grows on with it).
   */
  get power(): number {
    if (ENDLESS.on && this.endless > 0 && (this.inEndless || (this.level && this.level.town))) return endlessPower(this.endless);
    return this.depth;
  }

  /** ENDLESS MODE: how much more life and damage this floor's monsters have than its depth gives: on an endless level 10% more for each before it (his pick), else none. */
  get tough(): number {
    return ENDLESS.on && this.inEndless ? endlessTough(this.endless) : 1;
  }

  /** What the floor he is on is called (the line under its name): on an endless level, that level. */
  get floorLevel(): string {
    if (ENDLESS.on && this.inEndless) return endlessName(this.endless);
    return FLOOR_NAMES.on ? floorTitle(this.depth).level : `Dungeon ${this.depth}`;
  }

  /**
   * NORMAL MODE: the hero as they wake in town after a death in this dungeon, as a save to be
   * brought back (`Game.restore`): as they went in (the gear worn in, the bag, the words and where
   * they were set, the gold, the fallen wordsmith's satchel), less a share of the gold carried in
   * (NORMAL.goldShare); with all that was found in the dungeon gone; but with the level, the
   * points and what they were spent on, the kills and the time as they are now. Facing the same
   * dungeon (the depth and the dungeons cleared are as they were). Null where nobody wakes.
   */
  wakeSave(): RunSave | null {
    if (!this.wakes || !this.entry) return null;
    const now = this.save();
    const e = JSON.parse(JSON.stringify(this.entry)) as RunSave;
    e.level = now.level;
    e.xp = now.xp;
    e.pending = now.pending;
    e.attrs = { ...now.attrs };
    e.kills = now.kills;
    e.runTime = now.runTime;
    e.potionKills = now.potionKills;
    e.voice = now.voice;
    // (the first dungeon's prompts as they are now: they are not begun again)
    e.guide = now.guide;
    e.gold = Math.max(0, e.gold - this.goldShare());
    e.maxUid = Math.max(e.maxUid, now.maxUid);
    e.mode = 'normal';
    return e;
  }

  /** The part of the gold carried into this dungeon that a Normal death costs. */
  private goldShare(): number {
    return this.entry ? Math.floor(Math.max(0, this.entry.gold) * NORMAL.goldShare) : 0;
  }

  /**
   * NORMAL MODE: what a death here costs, for the death screen and the line in town: the pieces
   * of gear, the words and the gold found in this dungeon, and the share of the gold carried in.
   * Null where nobody wakes.
   */
  losses(): { items: number; words: number; gold: number; share: number } | null {
    if (!this.wakes || !this.entry) return null;
    const e = this.entry;
    const h = this.hero;
    const had = new Set<number>();
    for (const it of [...EQUIP_SLOTS.map((s) => e.gear[s]), ...e.bag]) if (it) had.add(it.uid);
    const items = [...EQUIP_SLOTS.map((s) => h.gear[s]), ...h.bag].filter((it) => it && !had.has(it.uid)).length;
    // (a word is counted wherever it is: in the pouch, or set in an attack)
    const count = (words: Record<WordId, number>, sockets: { front: (WordId | null)[]; behind: (WordId | null)[] }[], w: WordId): number =>
      (words[w] ?? 0) + sockets.reduce((n, so) => n + [...so.front, ...so.behind].filter((x) => x === w).length, 0);
    const nowSockets = h.skills.map((sk) => ({ front: sk.front, behind: sk.behind }));
    let words = 0;
    for (const w of wordIds()) words += Math.max(0, count(h.words, nowSockets, w) - count(e.words, e.sockets, w));
    return { items, words, gold: Math.max(0, h.gold - e.gold), share: this.goldShare() };
  }

  // ===========================================================================================
  // Sight and pathfinding

  private updateVision(dt: number): void {
    const L = this.level;
    if (L.town) return;
    this.visionT -= dt;
    if (this.visionT > 0) return;
    this.visionT = 0.1;
    const f = L.floor;
    const h = this.hero;
    for (const i of this.visList) L.visible[i] = 0;
    this.visList.length = 0;
    const R = TUNE.sightRadius;
    const rays = 180;
    for (let k = 0; k < rays; k++) {
      const a = (k / rays) * Math.PI * 2;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      for (let s = 0; s <= R; s += 0.3) {
        const tx = Math.floor(h.x + dx * s);
        const ty = Math.floor(h.y + dy * s);
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) break;
        const idx = ty * f.w + tx;
        if (L.visible[idx] === 0) {
          L.visible[idx] = 1;
          L.explored[idx] = 1;
          this.visList.push(idx);
        }
        if (L.open[idx] === 0) break;
        // (the wall half of a tile cut corner to corner stops the eye as a wall does)
        if (f.cut && f.cut[idx] !== 0 && inWall(f, h.x + dx * s, h.y + dy * s)) break;
      }
    }
  }

  private updateFlow(dt: number): void {
    this.flowT -= dt;
    if (this.flowT > 0) return;
    this.flowT = 0.25;
    const f = this.level.floor;
    const h = this.hero;
    this.flow = flowField(this.level.walk, f.w, f.h, Math.floor(h.x), Math.floor(h.y), 28, this.flow, this.level.step);
  }

  // ===========================================================================================
  // Monsters

  /** (game/bosses.ts) The way a monster at `m` should step to come at the hero: by the flow of the floor, or straight at him (`straight`: he is near and in its sight). */
  wayTo(m: { x: number; y: number }, straight = false): { x: number; y: number } {
    const L = this.level;
    const f = L.floor;
    const h = this.hero;
    if (straight) {
      const dx = h.x - m.x;
      const dy = h.y - m.y;
      const d = Math.hypot(dx, dy);
      if (d > 0.01 && (!L.step || this.walksStraight(m.x, m.y, h.x, h.y))) return { x: dx / d, y: dy / d };
    }
    const v = flowDir(this.flow, L.walk, f.w, f.h, m.x, m.y, this.tmp, L.step);
    return { x: v.x, y: v.y };
  }

  /** (game/bosses.ts) As many as `n` places to stand round (x, y), the nearest first (the first is (x, y)'s own tile, if it is free). */
  spotsRound(x: number, y: number, n: number): { x: number; y: number }[] {
    const f = this.level.floor;
    return scatter(this.level.walk, f.w, f.h, x, y, n, this.rng);
  }

  private wakeUp(m: Monster): void {
    if (m.state !== 'sleep') return;
    const pack = m.packId;
    for (const o of this.monsters) {
      if (o.dead || o.state !== 'sleep') continue;
      if (o !== m && (o.packId !== pack || Math.hypot(o.x - m.x, o.y - m.y) > 14)) continue;
      o.state = 'chase';
      o.cd = this.rng.range(0.2, 0.9);
      if (o.champion) {
        // the player is told what they have walked in on
        this.sfx('bossRoar', 0.6);
        this.msg(`${o.name} guards this place`, MSG.omen);
      }
      if (o.carries.length && !o.boss && !this.practice && this.depth === 1 && this.cleared === 0 && !this.toldCarrier) {
        // a character's first dungeon: say what the rune over its head means, once
        this.toldCarrier = true;
        this.msg(`${o.name} carries a WORD. Kill it and the word is yours.`, MSG.word);
      }
    }
    if (m.boss) {
      this.sfx('bossRoar');
      // (BOSS_INTRO: his name comes up across the screen as his gate falls, in place of the line)
      if (!BOSS_INTRO.on) this.msg(m.name, MSG.foe);
    }
  }

  private updateMonsters(dt: number): void {
    const h = this.hero;
    // (DECOYS: each runs out; one that goes with a Golem of the Tinkerer's is where it is)
    if (this.decoys.length) this.updateDecoys(dt);
    const L = this.level;
    const f = L.floor;
    const act: Monster[] = [];
    // (WORDMELDING: standing in the steam Scald behind leaves, the hero is hidden)
    const hidden = this.zones.some((z) => z.kind === 'steam' && !z.hostile && Math.hypot(h.x - z.x, h.y - z.y) <= z.r);
    for (const m of this.monsters) {
      if (m.dead) continue;
      m.flash = Math.max(0, m.flash - dt);
      m.barT = Math.max(0, m.barT - dt);
      m.seen = L.visible[Math.floor(m.y) * f.w + Math.floor(m.x)] === 1;
      // (ACT 1: a body bigger than its middle tile, seen where any of it is, as its kind's rules have it: the Drowned Eye's pool)
      if (!m.seen && ACT1.on) {
        const r1 = act1Rules(m.kind);
        if (r1 && r1.seenBy) m.seen = r1.seenBy(m, (tx, ty) => tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.visible[ty * f.w + tx] === 1);
      }
      const dx = h.x - m.x;
      const dy = h.y - m.y;
      const dist = Math.hypot(dx, dy);
      // (THE CITY'S WORDS, Version 23.8: STILLING, its time slowed by a hit or in a bubble: it moves, attacks and is drawn slower,
      // `mdt`; what is done to it, burning, chill, stun and the rest, runs out as ever, by `dt`)
      const mdt = dt * this.timeOf(m);
      m.animT += mdt;
      if (m.struckT !== undefined) m.struckT += dt;
      if (m.state === 'sleep') {
        // In a new player's first dungeon nothing wakes by itself until the lesson in walking is
        // done. (About seven such dungeons in four hundred put a pack in sight of where the hero
        // arrives: the first prompt was then the fight, with monsters already coming. A sleeper
        // that is struck still wakes.)
        const lesson = this.guide !== null && this.guide.walked < GUIDE.steps;
        if (m.seen && dist <= TUNE.aggroRadius && !lesson) this.wakeUp(m);
        continue;
      }
      if (dist > 32) continue;
      // (BOSS_INTRO: until his gate has fallen and his line is said, the boss stands and looks at the hero)
      if (m.boss && this.bossWaits(m)) {
        if (dist > 0.01) {
          m.fx = dx / dist;
          m.fy = dy / dist;
        }
        continue;
      }
      act.push(m);
      if (m.burnT > 0) m.burnT -= dt;
      if (m.chillT > 0) m.chillT -= dt;
      if (m.freezeImmune > 0) m.freezeImmune -= dt;
      if (m.markT > 0) m.markT = Math.max(0, m.markT - dt);
      if (m.shockT > 0) m.shockT -= dt;
      if (m.staggerCd > 0) m.staggerCd -= dt;
      // (THE SKILL TREES REMADE: Honed Edge's bleeding runs out; thrown across the floor by a talent, frozen or not)
      if (m.bleedT) m.bleedT = Math.max(0, m.bleedT - dt);
      // (THE WARLOCK: his hellfire and the curse run out)
      if (m.hellT) m.hellT = Math.max(0, m.hellT - dt);
      if (m.curseT) m.curseT = Math.max(0, m.curseT - dt);
      if (m.thrown) this.flyThrown(m, dt);
      // (WORDMELDING)
      if (m.scaldCd) m.scaldCd = Math.max(0, m.scaldCd - dt);
      if (m.fumesCd) m.fumesCd = Math.max(0, m.fumesCd - dt);
      if (m.blightT) m.blightT = Math.max(0, m.blightT - dt);
      if (m.biteDps && m.chillT <= 0 && m.frozenT <= 0) m.biteDps = 0;
      // (THE NEW MONSTERS: a minion's leader's words, whole since the skeleton champion's cry, for so long: RALLY)
      if (m.rallyT !== undefined && m.rallyT > 0) m.rallyT = Math.max(0, m.rallyT - dt);
      // (THE CITY'S WORDS: Hexing's curse and Stilling's slowing run out)
      if (m.hexT) m.hexT = Math.max(0, m.hexT - dt);
      if (m.stillT) m.stillT = Math.max(0, m.stillT - dt);
      // (BINDING: a hold runs out, and the time before it may be held again)
      if (m.bindT) m.bindT = Math.max(0, m.bindT - dt);
      if (m.bindAgain) m.bindAgain = Math.max(0, m.bindAgain - dt);
      if (m.poisonT > 0) {
        m.poisonT -= dt;
        if (m.poisonT <= 0) {
          m.poisonDps = 0;
          m.poisonN = 0;
        }
      }
      if (m.frozenT > 0) {
        m.frozenT -= dt;
        if (m.frozenT <= 0) {
          this.emit({ t: 'shatter', x: m.x, y: m.y });
          this.sfx('shatter', 0.5);
        }
        continue;
      }
      // (THE WARLOCK's tree: Terrible Roar, it runs from him, and does nothing else)
      if ((m.fleeT ?? 0) > 0) {
        m.fleeT = Math.max(0, (m.fleeT ?? 0) - dt);
        this.runFrom(m, mdt);
        continue;
      }
      // HEAVY: stunned or staggered, it does nothing (what it was winding up was broken off then)
      if (m.stunT > 0 || m.staggerT > 0) {
        m.stunT = Math.max(0, m.stunT - dt);
        m.staggerT = Math.max(0, m.staggerT - dt);
        m.anim = 'idle';
        continue;
      }
      // FRENZIED, on a monster: the more it is hurt, the faster it moves and the sooner it attacks again
      const rage = 1 + FRENZY.monster * wordShare(m, 'frenzied') * (1 - Math.max(0, m.life) / m.maxLife);
      // (THE WARLOCK's tree: Withering, cursed it moves and strikes at half speed)
      const wither = (m.curseT ?? 0) > 0 && h.cls === 'warlock' && this.has('withering') ? WARLOCK_TUNE.talents.withering.pace : 1;
      m.cd -= mdt * rage * wither;
      const def = MONSTERS[m.kind];
      // (THE TINKERER's tree: Tar, what walks in her tar is slowed to a crawl)
      const slow = (m.chillT > 0 ? 1 - m.chill : 1) * wither * (this.tars.length ? this.inTar(m) : 1);
      // (THE FIRST FIVE FLOORS: one with a gait and acts of its own, a boss of floors 2 to 5, a bone beast, a mini fleshmancer, is run by game/bosses.ts)
      if (gaitOf(m.kind)) {
        this.bosses.step(m, def, mdt, slow, rage, dx, dy, dist);
        continue;
      }
      // (THE MONSTERS' ATTACKS: its big moves cool down too)
      const moves = movesOf(m);
      if (moves && m.moveCd) for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= mdt * rage;
      // (DECOYS: within reach of one, it goes after it in place of the hero, its blows on it doing nothing: drawnToDecoy)
      if (this.decoys.length && this.drawnToDecoy(m, def, mdt, slow, rage)) continue;

      if (m.state === 'windup') {
        m.t -= mdt * (0.6 + 0.4 * slow);
        // (the line a charge will run along fills as his wind-up runs out)
        if (moves && m.move !== undefined && m.move >= 0 && moves[m.move].id === 'charge') this.laneOf(m, (z) => (z.t = Math.max(0, z.dur - m.t)));
        // (THE NEW MONSTERS: the marksman's line of aim runs out as he draws, and follows the hero till it holds still: AIM)
        if (moves && m.move !== undefined && m.move >= 0 && moves[m.move].id === 'pierce') this.holdAim(m);
        if (m.t <= 0) this.monsterAttack(m, def);
        continue;
      }
      if (m.state === 'charge') {
        this.runCharge(m, def, mdt, slow);
        continue;
      }
      if (m.state === 'pickup') {
        this.stoop(m, mdt);
        continue;
      }
      if (m.state === 'recover') {
        m.t -= mdt;
        if (m.t <= 0) {
          m.state = 'chase';
          m.anim = 'idle';
        }
        continue;
      }

      // (WORDMELDING: Scald behind's steam hides the hero standing in it: nothing sees him to attack)
      const los = dist < 15 && !hidden && this.sees(m.x, m.y, h.x, h.y);
      if (moves) {
        // THE MONSTERS' ATTACKS: the biggest of its moves that is ready and in reach, else its basic blow
        if (m.cd <= 0) {
          const i = this.pickMove(m, def, moves, dist, los);
          if (i >= 0) {
            this.startMove(m, def, moves, i);
            continue;
          }
        }
      } else if (m.boss) {
        this.bossThink(m, def, dist, los);
        if (m.state !== 'chase') continue;
      }
      let mvx = 0;
      let mvy = 0;
      let moving = true;
      const reach = this.reachOf(m, def);
      // (THE NEW MONSTERS: a Boneward whose spear is gone goes for it, unless the hero is near and the spear is not: SPEAR)
      const toSpear = m.bare && (dist > SPEAR.near || this.spearWithin(m, SPEAR.close)) ? this.spearWay(m) : null;
      if (toSpear === 'here') {
        this.beginStoop(m);
        continue;
      }
      if (toSpear) {
        mvx = toSpear.x;
        mvy = toSpear.y;
      } else if (def.ranged) {
        // (THE NEW MONSTERS: one with moves of its own, the marksman and the high priest, shoots by them)
        if (!moves && los && dist <= def.range && m.cd <= 0) {
          this.startWindup(m, def);
          continue;
        }
        // (A RANGED MONSTER HOLDS ITS GROUND, since Version 18.6: it comes within `keepMax` of a
        // hero it can see, and there it stands and shoots, however near the hero comes. Until
        // then it backed straight away from a hero nearer than its `keepMin`. The owner, 7 Oct
        // 2026, 19:13: "I need the ranged enemies to not run away from you".)
        if (!los || dist > def.keepMax) {
          const v = flowDir(this.flow, L.walk, f.w, f.h, m.x, m.y, this.tmp, L.step);
          mvx = v.x;
          mvy = v.y;
        } else moving = false;
      } else {
        if (!moves && !m.boss && los && dist <= reach + TUNE.heroRadius && m.cd <= 0) {
          this.startWindup(m, def);
          continue;
        }
        if (dist <= reach * 0.8 + TUNE.heroRadius) moving = false;
        // (LEDGES AND PITS: a bat flies straight at what it sees, over a pit and up a ledge; a
        // walker makes straight for the hero only where it could walk straight there)
        else if (los && (L.step ? m.kind === 'bat' || (dist < 2.5 && this.walksStraight(m.x, m.y, h.x, h.y)) : dist < 2.5)) {
          mvx = dx / dist;
          mvy = dy / dist;
        } else {
          const v = flowDir(this.flow, L.walk, f.w, f.h, m.x, m.y, this.tmp, L.step);
          mvx = v.x;
          mvy = v.y;
          // (a hero on an island, or across a gap: there is no way round. It comes as near as it can, to the edge.)
          if (L.step && mvx === 0 && mvy === 0 && dist > 0.01 && this.flow[Math.floor(m.y) * f.w + Math.floor(m.x)] === UNREACHABLE) {
            mvx = dx / dist;
            mvy = dy / dist;
          }
        }
        if (m.kind === 'bat' && dist > 1.3 && moving) {
          // bats weave from side to side as they come
          const w = Math.sin(this.time * 5 + m.seed * 20) * 0.7;
          const px = -mvy;
          const py = mvx;
          mvx += px * w;
          mvy += py * w;
          const l = Math.hypot(mvx, mvy) || 1;
          mvx /= l;
          mvy /= l;
        }
      }
      if (moving && (mvx !== 0 || mvy !== 0)) {
        const sp = m.speed * slow * rage * mdt;
        const atX = m.x;
        const atY = m.y;
        this.slide(m, Math.min(m.r, 0.42), mvx * sp, mvy * sp, m.kind === 'bat' ? L.open : L.walk, true);
        m.fx = mvx;
        m.fy = mvy;
        // (DOORS: a monster that a shut door holds stands at it; it does not walk on the spot)
        m.anim = m.x === atX && m.y === atY && L.shut !== null && this.overShut(L.shut, m.x + mvx * 0.5, m.y + mvy * 0.5, Math.min(m.r, 0.42)) ? 'idle' : 'walk';
      } else {
        m.anim = 'idle';
        if (dist > 0.01) {
          m.fx = dx / dist;
          m.fy = dy / dist;
        }
      }
    }

    // keep bodies from stacking, and out of the hero
    // (ACT 1: not one up in the air, under the water or below the lip, as its kind's rules have it: a vulture
    // overhead does not jostle what is on the ground under it, nor is it jostled)
    const away = (m: Monster): boolean => {
      const r1 = ACT1.on ? act1Rules(m.kind) : null;
      return !!(r1 && ((r1.reachable && !r1.reachable(m)) || (r1.aloft && r1.aloft(m))));
    };
    for (let i = 0; i < act.length; i++) {
      const a = act[i];
      if (away(a)) continue;
      const ga = a.kind === 'bat' ? L.open : L.walk;
      for (let j = i + 1; j < act.length; j++) {
        const b = act[j];
        if (away(b)) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const min = (a.r + b.r) * 0.85;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2);
        const nx = d > 1e-4 ? dx / d : 1;
        const ny = d > 1e-4 ? dy / d : 0;
        // (a boss is not jostled by the small fry about him: the other gives way, the whole way)
        const sa = a.boss && !b.boss ? 0 : b.boss && !a.boss ? 1 : 0.5;
        const push = min - d;
        if (sa > 0) this.slide(a, Math.min(a.r, 0.42), -nx * push * sa, -ny * push * sa, ga, true);
        if (sa < 1) this.slide(b, Math.min(b.r, 0.42), nx * push * (1 - sa), ny * push * (1 - sa), b.kind === 'bat' ? L.open : L.walk, true);
      }
      // (not while the hero leaps or rolls over them, nor while a whirlwind carries the hero through)
      if (a.kind !== 'bat' && !h.move && !this.whirling()) {
        const dx = a.x - h.x;
        const dy = a.y - h.y;
        const min = a.r * 0.8 + TUNE.heroRadius;
        const d = Math.hypot(dx, dy);
        if (d < min && d > 1e-4) this.slide(a, Math.min(a.r, 0.42), (dx / d) * (min - d), (dy / d) * (min - d), ga, true);
      }
    }
  }

  private startWindup(m: Monster, def: MonsterDef): void {
    const h = this.hero;
    m.state = 'windup';
    m.t = def.windup;
    m.anim = 'attack';
    m.animT = 0;
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.hypot(dx, dy) || 1;
    m.fx = dx / dist;
    m.fy = dy / dist;
    if (def.aoe > 0 && !(m.boss && m.atk === 1)) {
      // a ground attack: show where it will land
      const reach = Math.min(dist, def.range);
      this.addWarn(m.x + m.fx * reach, m.y + m.fy * reach, def.aoe, def.windup, this.rollMonsterDmg(m), this.monsterElement(m), m.words, m.name, m.id, this.halfOf(m));
    }
  }

  private monsterAttack(m: Monster, def: MonsterDef): void {
    const moves = movesOf(m);
    if (moves && m.move !== undefined && m.move >= 0) {
      this.landMove(m, def, moves, m.move);
      return;
    }
    const h = this.hero;
    m.state = 'recover';
    m.t = TUNE.monsterRecover;
    m.cd = def.cooldown * (1 - 0.3 * wordShare(m, 'swift')) * this.rng.range(0.9, 1.2);
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.hypot(dx, dy) || 1;
    const el = this.monsterElement(m);
    // (TWIN: its second blow; a minion's, of its leader's Twin, at half strength: MONSTER PACKS)
    const twin = wordShare(m, 'twin');
    if (m.boss && m.atk === 1) {
      // volley: a fan of bolts
      const base = Math.atan2(dy, dx);
      for (let k = -3; k <= 3; k++) this.shootAt(m, base + k * 0.2, def.projSpeed, this.rollMonsterDmg(m) * 0.5, el, 'bolt', 13);
      this.sfx('fire', 0.8);
      return;
    }
    if (def.aoe > 0) {
      // the warning circle does the damage; a Twin monster follows it with a second, quicker one
      this.sfx('slam', 0.8);
      if (twin > 0) this.addWarn(h.x, h.y, def.aoe * 0.8, 0.6, this.rollMonsterDmg(m) * twin, el, m.words, m.name, undefined, this.halfOf(m));
      return;
    }
    if (def.ranged) {
      const base = Math.atan2(dy, dx);
      const look = m.kind === 'archer' ? 'arrow' : 'bolt';
      if (twin > 0) {
        this.shootAt(m, base - 0.12, def.projSpeed, this.rollMonsterDmg(m), el, look, def.range + 3);
        this.shootAt(m, base + 0.12, def.projSpeed, this.rollMonsterDmg(m) * twin, el, look, def.range + 3);
      } else this.shootAt(m, base, def.projSpeed, this.rollMonsterDmg(m), el, look, def.range + 3);
      this.sfx(m.kind === 'archer' ? 'shot' : 'fire', 0.5);
      return;
    }
    const reach = def.range + (m.r - 0.32) + 0.45 + TUNE.heroRadius;
    if (dist <= reach) this.hurtHero(this.rollMonsterDmg(m), el, m.words, m);
    this.sfx('swing', 0.4);
    if (twin > 0) {
      this.after(0.28, () => {
        if (m.dead) return;
        if (Math.hypot(this.hero.x - m.x, this.hero.y - m.y) <= reach) this.hurtHero(this.rollMonsterDmg(m) * twin, el, m.words, m);
      });
    }
  }

  private shootAt(m: Monster, angle: number, speed: number, dmg: number, el: Element, look: 'arrow' | 'bolt', range: number): void {
    this.projectiles.push({
      x: m.x + Math.cos(angle) * 0.4, y: m.y + Math.sin(angle) * 0.4, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: look === 'bolt' ? 0.3 : 0.2, dist: range, hostile: true, dmg, element: el, look, pierce: false, hit: [], volley: false, skill: -1,
      trail: 0, words: m.words, half: this.halfOf(m), runed: false, clouded: false, age: 0, from: m.name, n: 0, by: m.id,
    });
  }

  private bossThink(m: Monster, def: MonsterDef, dist: number, los: boolean): void {
    const frac = m.life / m.maxLife;
    if ((m.phase === 0 && frac < 0.66) || (m.phase === 1 && frac < 0.33)) {
      m.phase++;
      this.summon(m);
    }
    if (m.cd > 0) return;
    if (dist <= 3.4) {
      m.atk = 0;
      this.startWindup(m, def);
    } else if (los && dist <= 12) {
      m.atk = 1;
      this.startWindup(m, def);
      m.t = TUNE.wardenVolleyWindup;
    }
  }

  private summon(m: Monster): void {
    const f = this.level.floor;
    const spots = scatter(this.level.walk, f.w, f.h, m.x, m.y, 5, this.rng).slice(1);
    for (const s of spots) {
      const add = this.spawn('skeleton', s.x, s.y, m.packId, 0, false, this.rng);
      add.state = 'chase';
      add.cd = 0.8;
      this.emit({ t: 'burst', x: s.x, y: s.y, r: 0.7, el: 'frost', style: 'warp' });
    }
    this.sfx('bossRoar');
    this.msg(`${m.name} calls the dead`, MSG.foe);
  }

  // ===========================================================================================
  // THE MONSTERS' ATTACKS (Version 19.8; game/defs.ts MONSTER_ATTACKS, MONSTER_MOVES)

  /**
   * Which of its moves monster `m` makes now: the biggest that is ready (its own cooldown run out)
   * and that the hero is in reach of; else its basic blow, if the hero is in reach of that; else
   * none (-1), and it comes on. (Its moves' first cooldowns are set the first time it is asked.)
   */
  private pickMove(m: Monster, def: MonsterDef, moves: readonly MonsterMove[], dist: number, los: boolean): number {
    // (from half its `first` to half as much again: so a pack does not bring its slams down together)
    if (!m.moveCd || m.moveCd.length !== moves.length) m.moveCd = moves.map((mv) => mv.first * this.rng.range(0.5, 1.5));
    // (one that shoots, as far as it shoots: THE NEW MONSTERS, the marksman's and the high priest's shot)
    const reach = def.ranged ? def.range : this.reachOf(m, def) + TUNE.heroRadius;
    for (let i = moves.length - 1; i >= 0; i--) {
      const mv = moves[i];
      if (m.moveCd[i] > 0) continue;
      // (THE NEW MONSTERS: the Boneward's thrust and its throw want its spear in hand; its shield, the spear gone)
      if (m.kind === 'boneward' && (mv.id === 'bash') !== !!m.bare) continue;
      if (dist < mv.near || dist > (mv.far > 0 ? mv.far : reach)) continue;
      if (mv.id === 'summon') {
        if (this.called(m) >= SUMMON.most) continue;
      } else if (!los) continue;
      if (mv.id === 'rally' && !this.hearsCry(m)) continue;
      if (mv.id === 'charge' && !this.chargeLane(m, dist)) continue;
      return i;
    }
    return -1;
  }

  /** How many of the dead the Warden has called still stand (or are coming up out of the ground). */
  private called(m: Monster): number {
    let n = this.risers.length;
    for (const o of this.monsters) if (!o.dead && o !== m && o.packId === m.packId && o.kind === 'skeleton') n++;
    return n;
  }

  /** Monster `m` begins move `i`: it winds up, and what it is about to do is shown (a slam's circle, a charge's line). */
  private startMove(m: Monster, def: MonsterDef, moves: readonly MonsterMove[], i: number): void {
    const h = this.hero;
    const mv = moves[i];
    m.state = 'windup';
    m.t = mv.windup;
    m.anim = 'attack';
    m.animT = 0;
    m.move = i;
    m.atk = mv.id === 'bolts' ? 1 : 0;
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.hypot(dx, dy) || 1;
    m.fx = dx / dist;
    m.fy = dy / dist;
    if (mv.id === 'slam') {
      // the red circle where it will land, as it has always been
      const reach = Math.min(dist, def.range);
      this.addWarn(m.x + m.fx * reach, m.y + m.fy * reach, def.aoe, mv.windup, this.rollMonsterDmg(m) * mv.dmg, this.monsterElement(m), m.words, m.name, m.id, this.halfOf(m));
    } else if (mv.id === 'charge') {
      // the line he will run along, on the floor: from him, through where the hero stands, and on
      const lane = this.chargeLane(m, dist);
      if (!lane) {
        m.state = 'chase';
        m.anim = 'idle';
        m.move = -1;
        return;
      }
      m.charge = { ...lane, hit: false };
      this.zones.push({ x: lane.x0, y: lane.y0, x1: lane.x1, y1: lane.y1, r: CHARGE.half, t: 0, dur: mv.windup, kind: 'lane', element: this.monsterElement(m), dmg: 0, slow: 0, tick: 0, hostile: true, skill: -1, words: m.words, from: m.name, src: m.id, gone: 0 });
      this.sfx('bossRoar', 0.45);
    } else if (mv.id === 'summon') {
      this.sfx('bossRoar');
      this.msg(`${m.name} calls the dead`, MSG.foe);
    } else if (mv.id === 'pierce') {
      // (THE NEW MONSTERS: the marksman's line of aim, from him toward the hero: AIM)
      const end = this.aimEnd(m.x, m.y, m.fx, m.fy);
      this.zones.push({ x: m.x, y: m.y, x1: end.x, y1: end.y, r: AIM.r, t: 0, dur: mv.windup, kind: 'aim', element: this.monsterElement(m), dmg: 0, slow: 0, tick: 0, hostile: true, skill: -1, words: m.words, from: m.name, src: m.id });
    }
  }

  /** Monster `m`'s move `i` lands (the end of its wind-up). */
  private landMove(m: Monster, def: MonsterDef, moves: readonly MonsterMove[], i: number): void {
    const h = this.hero;
    const mv = moves[i];
    const swift = 1 - 0.3 * wordShare(m, 'swift');
    m.state = 'recover';
    m.t = mv.recover;
    m.cd = mv.after * swift * this.rng.range(0.9, 1.2);
    if (m.moveCd && mv.cooldown > 0) m.moveCd[i] = mv.cooldown * swift;
    const el = this.monsterElement(m);
    const twin = wordShare(m, 'twin');
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (mv.id === 'swing' || mv.id === 'bash') {
      // the basic blow: whoever is in its reach when it lands (a Twin monster swings again); the
      // Boneward's shield, while its spear is gone, shoves the hero back too (THE NEW MONSTERS)
      const reach = this.reachOf(m, def) + 0.45 + TUNE.heroRadius;
      const bash = mv.id === 'bash';
      if (dist <= reach) {
        this.hurtHero(this.rollMonsterDmg(m) * mv.dmg, el, m.words, m);
        if (bash) this.knockHero(m.x, m.y, 0.8);
      }
      this.sfx(bash ? 'hit' : 'swing', bash ? 0.6 : 0.5);
      if (twin > 0) {
        this.after(0.28, () => {
          if (m.dead) return;
          if (Math.hypot(this.hero.x - m.x, this.hero.y - m.y) <= reach) this.hurtHero(this.rollMonsterDmg(m) * mv.dmg * twin, el, m.words, m);
        });
      }
    } else if (mv.id === 'throw') {
      // THE NEW MONSTERS: the Golem's skull, or the Boneward's spear
      if (m.kind === 'golem') {
        this.hurlSkull(m, mv, 1);
        if (twin > 0) {
          this.after(0.35, () => {
            if (!m.dead) this.hurlSkull(m, mv, twin);
          });
        }
      } else this.throwSpear(m, mv);
    } else if (mv.id === 'rally') {
      this.rally(m);
    } else if (mv.id === 'shoot') {
      // THE NEW MONSTERS: a leader who shoots, as those he leads shoot (a Twin one, two at once)
      const base = Math.atan2(dy, dx);
      const look = m.kind === 'marksman' ? 'arrow' : 'bolt';
      if (twin > 0) {
        this.shootAt(m, base - 0.12, def.projSpeed, this.rollMonsterDmg(m) * mv.dmg, el, look, def.range + 3);
        this.shootAt(m, base + 0.12, def.projSpeed, this.rollMonsterDmg(m) * mv.dmg * twin, el, look, def.range + 3);
      } else this.shootAt(m, base, def.projSpeed, this.rollMonsterDmg(m) * mv.dmg, el, look, def.range + 3);
      this.sfx(look === 'arrow' ? 'shot' : 'fire', 0.5);
    } else if (mv.id === 'pierce') {
      this.greatShot(m, mv);
    } else if (mv.id === 'censer') {
      this.swingCenser(m, mv, dist);
    } else if (mv.id === 'slam') {
      // the red circle does the harm; a Twin monster follows it with a second, quicker one
      this.sfx('slam', 0.8);
      if (twin > 0) this.addWarn(h.x, h.y, def.aoe * 0.8, 0.6, this.rollMonsterDmg(m) * mv.dmg * twin, el, m.words, m.name, undefined, this.halfOf(m));
    } else if (mv.id === 'bolts') {
      // the fan of bolts
      const base = Math.atan2(dy, dx);
      for (let k = -3; k <= 3; k++) this.shootAt(m, base + k * 0.2, def.projSpeed, this.rollMonsterDmg(m) * mv.dmg, el, 'bolt', 13);
      this.sfx('fire', 0.8);
    } else if (mv.id === 'summon') {
      this.callDead(m);
    } else if (mv.id === 'charge' && m.charge) {
      // he is off, down the line he marked
      m.state = 'charge';
      const c = m.charge;
      m.t = Math.hypot(c.x1 - c.x0, c.y1 - c.y0) / CHARGE.speed + 0.5;
      m.animT = 0;
      this.sfx('slam', 0.5);
    }
  }

  /** The line of monster `m`'s charge, if it is marked: `fn` is given it. */
  private laneOf(m: Monster, fn: (z: Zone) => void): void {
    for (const z of this.zones) if (z.kind === 'lane' && z.src === m.id) fn(z);
  }

  private dropLane(m: Monster): void {
    for (let k = this.zones.length - 1; k >= 0; k--) {
      const z = this.zones[k];
      if (z.kind === 'lane' && z.src === m.id) this.zones.splice(k, 1);
    }
  }

  /**
   * THE RED TROLL'S CHARGE: the line he would run along to run the hero down, from where he stands
   * through where the hero stands and CHARGE.past on; or null if he has no clear run there (a wall, a
   * shut door, a pit or a ledge between, or too short a run to get past the hero).
   */
  private chargeLane(m: Monster, dist: number): { x0: number; y0: number; x1: number; y1: number } | null {
    const h = this.hero;
    const L = this.level;
    if (dist < 0.01) return null;
    const fx = (h.x - m.x) / dist;
    const fy = (h.y - m.y) / dist;
    const r = Math.min(m.r, 0.42);
    const held = L.shut !== null;
    let len = 0;
    for (let a = 0.2; a <= dist + CHARGE.past + 1e-6; a += 0.2) {
      if (!this.free(L.walk, m.x + fx * a, m.y + fy * a, r, false, held)) break;
      len = a;
    }
    if (len < dist + 0.4) return null;
    const x1 = m.x + fx * len;
    const y1 = m.y + fy * len;
    if (!this.walksStraight(m.x, m.y, x1, y1)) return null;
    return { x0: m.x, y0: m.y, x1, y1 };
  }

  /** The red troll runs his line: what he meets of the hero on it is run down and knocked out of his way, once; at its end, or at anything that stops him, he pulls up. */
  private runCharge(m: Monster, def: MonsterDef, dt: number, slow: number): void {
    const c = m.charge;
    if (!c) {
      m.state = 'chase';
      return;
    }
    const h = this.hero;
    const len = Math.hypot(c.x1 - c.x0, c.y1 - c.y0) || 1;
    const fx = (c.x1 - c.x0) / len;
    const fy = (c.y1 - c.y0) / len;
    const step = CHARGE.speed * (m.speed / def.speed) * slow * dt;
    const ax = m.x;
    const ay = m.y;
    this.slide(m, Math.min(m.r, 0.42), fx * step, fy * step, this.level.walk, true);
    m.fx = fx;
    m.fy = fy;
    m.t -= dt;
    const along = (m.x - c.x0) * fx + (m.y - c.y0) * fy;
    this.laneOf(m, (z) => (z.gone = Math.max(0, Math.min(1, along / len))));
    if (!c.hit && !h.move && h.invuln <= 0 && Math.hypot(h.x - m.x, h.y - m.y) <= m.r + TUNE.heroRadius + 0.15) {
      c.hit = true;
      const moves = movesOf(m);
      const mv = moves && m.move !== undefined && m.move >= 0 ? moves[m.move] : null;
      this.hurtHero(this.rollMonsterDmg(m) * (mv ? mv.dmg : 1), this.monsterElement(m), m.words, m);
      // (knocked aside, out of the line: away from the middle of it, or to one side if square in it)
      const ox = c.x0 + fx * along;
      const oy = c.y0 + fy * along;
      const side = (h.x - ox) * -fy + (h.y - oy) * fx >= 0 ? 1 : -1;
      this.knockHero(h.x + fy * side, h.y - fx * side, CHARGE.knock);
      this.emit({ t: 'shake', amount: 3 });
      this.sfx('slam', 0.9);
    }
    if (along >= len - 0.05 || Math.hypot(m.x - ax, m.y - ay) < step * 0.3 || m.t <= 0) this.endCharge(m);
  }

  /** The charge is over: he pulls up, skidding, and stands for a moment (a moment to hit him). */
  private endCharge(m: Monster): void {
    const moves = movesOf(m);
    const mv = moves && m.move !== undefined && m.move >= 0 ? moves[m.move] : null;
    m.state = 'recover';
    m.t = mv ? mv.recover : TUNE.monsterRecover;
    m.charge = undefined;
    this.dropLane(m);
  }

  /** THE WARDEN CALLS THE DEAD (his fourth move): they crawl out of the ground round him, a little after one another, and join the fight when they are out. */
  private callDead(m: Monster): void {
    const f = this.level.floor;
    const spots = scatter(this.level.walk, f.w, f.h, m.x, m.y, SUMMON.count + 1, this.rng).slice(1);
    spots.forEach((s, k) => {
      const add = this.spawn('skeleton', s.x, s.y, m.packId, 0, false, this.rng);
      // (not among the monsters till it is out)
      this.monsters.splice(this.monsters.indexOf(add), 1);
      add.state = 'chase';
      add.cd = 0.8;
      const dx = this.hero.x - s.x;
      const dy = this.hero.y - s.y;
      const d = Math.hypot(dx, dy) || 1;
      add.fx = dx / d;
      add.fy = dy / d;
      this.risers.push({ m: add, age: -k * SUMMON.apart });
      this.emit({ t: 'shake', amount: 1 });
    });
  }

  /** The dead crawling out of the ground: each, once it is out, is one of the monsters. */
  private updateRisers(dt: number): void {
    for (let k = this.risers.length - 1; k >= 0; k--) {
      const r = this.risers[k];
      r.age += dt;
      if (r.age < SUMMON.rise) continue;
      this.risers.splice(k, 1);
      r.m.animT = 0;
      this.monsters.push(r.m);
    }
  }

  // ===========================================================================================
  // THE NEW MONSTERS (Version 19.9; game/defs.ts NEW_MONSTERS, SPEAR, SKULL, RALLY)

  /** How far a monster's blow reaches beyond its body (tiles): a Boneward whose spear is gone, its shield's. */
  private reachOf(m: Monster, def: MonsterDef): number {
    return (m.bare ? SPEAR.bash : def.range) + (m.r - 0.32);
  }

  /** THE BONEWARD THROWS ITS SPEAR at where the hero stands: from its hand, and its hand is empty till it picks the spear up again. */
  private throwSpear(m: Monster, mv: MonsterMove): void {
    const h = this.hero;
    let x0 = m.x + m.fx * SPEAR.hand;
    let y0 = m.y + m.fy * SPEAR.hand;
    if (!this.isOpen(x0, y0)) {
      x0 = m.x;
      y0 = m.y;
    }
    const dx = h.x - x0;
    const dy = h.y - y0;
    const d = Math.hypot(dx, dy) || 1;
    this.projectiles.push({
      x: x0, y: y0, vx: (dx / d) * SPEAR.speed, vy: (dy / d) * SPEAR.speed, r: 0.22, dist: d, hostile: true,
      dmg: this.rollMonsterDmg(m) * mv.dmg, element: this.monsterElement(m), look: 'spear', pierce: false, hit: [], volley: false, skill: -1,
      trail: 0, words: m.words, half: this.halfOf(m), runed: false, clouded: false, age: 0, from: m.name, n: 0, src: m.id, way: d, z0: SPEAR.z,
    });
    m.bare = true;
    this.sfx('swing', 0.6);
  }

  /** A spear has come down (on the hero, at a wall, or where it was aimed): it lies there, on the nearest floor one could walk to, till its Boneward picks it up. */
  private laySpear(p: Projectile): void {
    if (p.src === undefined) return;
    const L = this.level;
    const f = L.floor;
    const ok = (x: number, y: number): boolean => {
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.walk[ty * f.w + tx] === 1 && this.onFloor(x, y);
    };
    let x = p.x;
    let y = p.y;
    if (!ok(x, y)) {
      let bd = Infinity;
      for (let r = 1; r <= 2 && bd === Infinity; r++) {
        for (let oy = -r; oy <= r; oy++) {
          for (let ox = -r; ox <= r; ox++) {
            const cx = Math.floor(p.x) + ox + 0.5;
            const cy = Math.floor(p.y) + oy + 0.5;
            const d = Math.hypot(cx - p.x, cy - p.y);
            if (d < bd && ok(cx, cy)) {
              bd = d;
              x = cx;
              y = cy;
            }
          }
        }
      }
    }
    const sp = Math.hypot(p.vx, p.vy) || 1;
    const flow = flowField(L.walk, f.w, f.h, x, y, 28, undefined, L.step);
    this.spears.push({ x, y, fx: p.vx / sp, fy: p.vy / sp, owner: p.src, flow });
  }

  /** Which way a Boneward goes for its spear: 'here', near enough to stoop for it; null, none lying, or no way to it. */
  private spearWay(m: Monster): { x: number; y: number } | 'here' | null {
    const sp = this.spears.find((s) => s.owner === m.id);
    if (!sp) return null;
    const dx = sp.x - m.x;
    const dy = sp.y - m.y;
    const d = Math.hypot(dx, dy);
    if (d <= SPEAR.pick) return 'here';
    const L = this.level;
    const f = L.floor;
    if (d < 2.5 && this.walksStraight(m.x, m.y, sp.x, sp.y)) return { x: dx / d, y: dy / d };
    if (!sp.flow || sp.flow[Math.floor(m.y) * f.w + Math.floor(m.x)] === UNREACHABLE) return null;
    const v = flowDir(sp.flow, L.walk, f.w, f.h, m.x, m.y, undefined, L.step);
    return v.x === 0 && v.y === 0 ? null : { x: v.x, y: v.y };
  }

  /** Whether a Boneward's spear lies within `d` tiles of it. */
  private spearWithin(m: Monster, d: number): boolean {
    return this.spears.some((s) => s.owner === m.id && Math.hypot(s.x - m.x, s.y - m.y) <= d);
  }

  /** It stoops for its spear, facing it (SPEAR.stoop seconds; the spear in its hand at SPEAR.grab). */
  private beginStoop(m: Monster): void {
    const sp = this.spears.find((s) => s.owner === m.id);
    if (sp) {
      const d = Math.hypot(sp.x - m.x, sp.y - m.y);
      if (d > 0.01) {
        m.fx = (sp.x - m.x) / d;
        m.fy = (sp.y - m.y) / d;
      }
    }
    m.state = 'pickup';
    m.t = SPEAR.stoop;
    m.anim = 'idle';
    m.animT = 0;
  }

  private stoop(m: Monster, dt: number): void {
    m.t -= dt;
    if (m.bare && SPEAR.stoop - m.t >= SPEAR.grab) {
      const k = this.spears.findIndex((s) => s.owner === m.id);
      if (k >= 0) this.spears.splice(k, 1);
      m.bare = false;
    }
    if (m.t <= 0) {
      m.state = 'chase';
      m.anim = 'idle';
    }
  }

  /** THE GOLEM HURLS A SKULL at where the hero stands: it comes down there SKULL.fly seconds later, its shadow showing where; `share` of its blow (a Twin Golem's second skull, of its Twin). */
  private hurlSkull(m: Monster, mv: MonsterMove, share: number): void {
    const h = this.hero;
    this.zones.push({
      x: h.x, y: h.y, x1: m.x + m.fx * SKULL.hand, y1: m.y + m.fy * SKULL.hand, r: SKULL.r, t: 0, dur: SKULL.fly, kind: 'skull', element: this.monsterElement(m),
      dmg: this.rollMonsterDmg(m) * mv.dmg * share, slow: 0, tick: 0, hostile: true, skill: -1, words: m.words, from: m.name, src: m.id, half: this.halfOf(m), gone: 0,
    });
    this.sfx('swing', 0.45);
  }

  /** THE SKELETON CHAMPION CRIES OUT: his minions within RALLY.reach of him have his words whole for RALLY.dur seconds. */
  private rally(m: Monster): void {
    for (const o of this.monsters) {
      if (o.dead || o === m || o.packId !== m.packId || o.rarity !== 'minion') continue;
      if (Math.hypot(o.x - m.x, o.y - m.y) <= RALLY.reach) o.rallyT = RALLY.dur;
    }
    this.sfx('bossRoar', 0.5);
    this.emit({ t: 'shake', amount: 1 });
    this.msg(`${m.name} rallies his pack`, MSG.foe);
  }

  /** Where a line of aim from (x, y) the way (fx, fy) ends: AIM.range tiles on, or at the first wall. */
  private aimEnd(x: number, y: number, fx: number, fy: number): { x: number; y: number } {
    let len = 0;
    for (let a = 0.25; a <= AIM.range + 1e-6; a += 0.25) {
      if (!this.isOpen(x + fx * a, y + fy * a)) break;
      len = a;
    }
    return { x: x + fx * len, y: y + fy * len };
  }

  /** THE MARKSMAN DRAWS: his line of aim runs out (its `t`, how far he has drawn) and follows the hero until AIM.lock seconds before he looses; then it holds still. */
  private holdAim(m: Monster): void {
    for (const z of this.zones) {
      if (z.kind !== 'aim' || z.src !== m.id) continue;
      z.t = Math.max(0, z.dur - m.t);
      if (m.t <= AIM.lock) continue;
      const h = this.hero;
      const d = Math.hypot(h.x - m.x, h.y - m.y);
      if (d < 0.01) continue;
      m.fx = (h.x - m.x) / d;
      m.fy = (h.y - m.y) / d;
      const end = this.aimEnd(m.x, m.y, m.fx, m.fy);
      z.x = m.x;
      z.y = m.y;
      z.x1 = end.x;
      z.y1 = end.y;
    }
  }

  /** THE MARKSMAN LOOSES HIS GREAT ARROW along his line of aim: it pierces whoever it meets, and flies on to its end. */
  private greatShot(m: Monster, mv: MonsterMove): void {
    let fx = m.fx;
    let fy = m.fy;
    for (const z of this.zones) {
      if (z.kind !== 'aim' || z.src !== m.id) continue;
      const len = Math.hypot((z.x1 ?? z.x) - z.x, (z.y1 ?? z.y) - z.y);
      if (len > 0.01) {
        fx = ((z.x1 ?? z.x) - z.x) / len;
        fy = ((z.y1 ?? z.y) - z.y) / len;
      }
    }
    for (let k = this.zones.length - 1; k >= 0; k--) if (this.zones[k].kind === 'aim' && this.zones[k].src === m.id) this.zones.splice(k, 1);
    this.projectiles.push({
      x: m.x + fx * 0.4, y: m.y + fy * 0.4, vx: fx * AIM.speed, vy: fy * AIM.speed, r: AIM.r, dist: AIM.range, hostile: true, dmg: this.rollMonsterDmg(m) * mv.dmg,
      element: this.monsterElement(m), look: 'great', pierce: true, hit: [], volley: false, skill: -1, trail: 0, words: m.words, half: this.halfOf(m),
      runed: false, clouded: false, age: 0, from: m.name, n: 0, src: m.id,
    });
    this.emit({ t: 'shake', amount: 1 });
    this.sfx('shot', 0.9);
  }

  /** THE HIGH PRIEST SWINGS HIS CENSER: its burning smoke settles before him (as far as SMOKE.at, or where the hero stands if nearer), and burns whoever is in it. */
  private swingCenser(m: Monster, mv: MonsterMove, dist: number): void {
    const at = Math.max(SMOKE.near, Math.min(SMOKE.at, dist));
    let x = m.x + m.fx * at;
    let y = m.y + m.fy * at;
    if (!this.isOpen(x, y)) {
      x = m.x + m.fx * SMOKE.near;
      y = m.y + m.fy * SMOKE.near;
    }
    const ticks = Math.max(1, Math.round(SMOKE.dur / SMOKE.tick));
    this.zones.push({
      x, y, r: SMOKE.r, t: 0, dur: SMOKE.dur, kind: 'smoke', element: 'fire', dmg: (this.rollMonsterDmg(m) * mv.dmg) / ticks, slow: 0, tick: 0, hostile: true,
      skill: -1, words: m.words, from: m.name, src: m.id, half: this.halfOf(m),
    });
    this.sfx('fire', 0.7);
  }

  /** Whether one of the champion's minions would hear his cry: near enough, with words of his at half, and not rallied but now. */
  private hearsCry(m: Monster): boolean {
    return this.monsters.some(
      (o) => !o.dead && o !== m && o.packId === m.packId && o.rarity === 'minion' && !!o.half && o.half.length > 0 && !(o.rallyT !== undefined && o.rallyT > 1) && Math.hypot(o.x - m.x, o.y - m.y) <= RALLY.reach,
    );
  }

  // ===========================================================================================
  // Projectiles, traps, ground

  private updateProjectiles(dt: number): void {
    const L = this.level;
    const f = L.floor;
    const h = this.hero;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.age += dt;
      const sp = Math.hypot(p.vx, p.vy) || 1;
      // (THE CITY'S WORDS, Version 23.8: a monster's shot in Stilling's bubble crawls)
      const crawl = p.hostile && !p.trap ? this.patchAt('bubble', p.x, p.y) : null;
      let travel = sp * dt * (crawl ? 1 - crawl.dmg : 1);
      let dead = false;
      while (travel > 0 && !dead) {
        const step = Math.min(0.25, travel);
        travel -= step;
        const nx = p.x + (p.vx / sp) * step;
        const ny = p.y + (p.vy / sp) * step;
        if (!this.isOpen(nx, ny)) {
          // (THE TRAPS: what the hero shoots may meet a sealed door, and open it)
          if (!p.hostile) this.unseal(p.skill, nx, ny, 0.1);
          // (THE SKILL TREES REMADE: Ricochet, a hero's arrow bounces off the wall, and flies on)
          if (!p.hostile && p.look === 'arrow' && !p.bounced && this.now('piercing')) {
            p.bounced = true;
            const bx = !this.isOpen(nx, p.y);
            const by = !this.isOpen(p.x, ny);
            const corner = !bx && !by;
            if (bx || corner) p.vx = -p.vx;
            if (by || corner) p.vy = -p.vy;
            this.emit({ t: 'spark', x: p.x, y: p.y, el: p.element, n: 4 });
            continue;
          }
          this.endProjectile(p);
          dead = true;
          break;
        }
        p.x = nx;
        p.y = ny;
        p.dist -= step;
        if (p.flown !== undefined) p.flown += step;
        if (p.hostile) {
          if (!p.struck && !h.move && h.invuln <= 0 && Math.hypot(h.x - p.x, h.y - p.y) <= p.r + TUNE.heroRadius) {
            // (THE TRAPS: a dart's harm is a share of the life of what it meets)
            this.blowBy = p.by;
            this.hurtHero(p.trap ? h.d.maxLife * p.dmg : p.dmg, p.element, p.words, null, p.from, p.x - p.vx, p.y - p.vy, p.half);
            this.blowBy = undefined;
            this.emit({ t: 'spark', x: p.x, y: p.y, el: p.element, n: 5 });
            // (THE NEW MONSTERS: the marksman's great arrow pierces: it flies on)
            if (p.pierce) p.struck = true;
            else dead = true;
          }
          // (THE TRAPS: a dart is the dungeon's, and hurts a monster it meets as it would the hero)
          if (!dead && p.trap) {
            for (const m of this.monsters) {
              if (m.dead || m.boss || Math.hypot(m.x - p.x, m.y - p.y) > p.r + m.r) continue;
              this.damageMonster(m, Math.max(1, Math.round(m.maxLife * p.dmg)), 'phys', false, -1);
              this.emit({ t: 'spark', x: p.x, y: p.y, el: 'phys', n: 5 });
              dead = true;
              break;
            }
          }
        } else {
          const r = h.skills[p.skill].r;
          // Whatever the hero sends flying breaks the barrels and urns it passes, and flies on: it
          // is not spent on one, so a shot aimed at a monster still gets there. (The owner, with
          // Version 12: "can't be broken by projectile attacks. That needs to be fixed".)
          this.breakProps(p.x, p.y, p.r, p.skill);
          for (const m of this.monsters) {
            if (m.dead || p.hit.includes(m.id)) continue;
            if (Math.hypot(m.x - p.x, m.y - p.y) > p.r + m.r) continue;
            p.hit.push(m.id);
            this.projectileHit(p, m);
            if (!p.pierce) {
              // (THE SKILL TREES: Piercing, on through one more)
              if (p.pierceN && p.pierceN > 0) {
                p.pierceN--;
                continue;
              }
              dead = true;
              break;
            }
          }
          if (!dead && r.zone) {
            p.trail += step;
            if (p.trail >= 0.8) {
              p.trail = 0;
              this.addGround(p.skill, p.x, p.y, 0.8, p.dmg);
            }
          }
        }
        if (!dead && p.dist <= 0) {
          this.endProjectile(p);
          dead = true;
        }
      }
      if (dead) {
        this.projectiles.splice(i, 1);
        // (THE NEW MONSTERS: a Boneward's spear lies where it came down)
        if (p.look === 'spear') this.laySpear(p);
      }
    }
  }

  private projectileHit(p: Projectile, m: Monster): void {
    const r = this.hero.skills[p.skill].r;
    const x = m.x;
    const y = m.y;
    // (THE SKILL TREES REMADE: Far Sight, an arrow flown past eight tiles a certain critical)
    const arrow = p.look === 'arrow';
    const far = arrow && (p.flown ?? 0) > TALENT_TUNE.farSight2.at && this.now('farsight');
    this.hitMonster(m, p.skill, p.dmg, false, far);
    // (Long Shot, the arrow knocks back what it hits; Split Shot, one that kills splits into three, flying on)
    if (arrow && !m.dead && this.now('longshot')) this.throwMonster(m, m.x - p.vx, m.y - p.vy, TALENT_TUNE.longShot2.far);
    if (arrow && m.dead && !p.split && this.now('splitshot')) this.splitArrow(p, m);
    // (an arrow or a wave that goes through several is still one blow)
    if (!p.mighted) {
      p.mighted = true;
      this.landed(p.skill);
      if (p.words.includes('heavy')) this.emit({ t: 'heavy', x, y, r: 1.1, big: false });
    }
    const power = p.words.includes('power');
    this.sfx(power ? 'power' : 'hit', 0.6);
    if (r.splash > 0) {
      const rad = r.splash * r.size * (r.element === 'fire' && this.was('fuel') ? TALENT_TUNE.fuel : 1);
      this.emit({ t: 'burst', x, y, r: rad, el: r.element, style: r.splashDmg >= 1 ? 'blast' : 'shock', words: p.words });
      if (r.splashDmg >= 1) this.sfx(r.element === 'frost' ? 'frost' : 'explode', 0.6);
      for (const o of this.monsters) {
        if (o.dead || o === m) continue;
        // (one of a volley: what another shot of it has already hurt is left alone, and what this
        // one's blast hurts, the others will leave alone)
        if (p.volley && p.hit.includes(o.id)) continue;
        if (Math.hypot(o.x - x, o.y - y) > rad + o.r || this.shutIn(o)) continue;
        if (p.volley) p.hit.push(o.id);
        this.hitMonster(o, p.skill, p.dmg * r.splashDmg, true);
      }
      this.breakProps(x, y, rad, p.skill);
    }
    if (r.rune > 0 && !p.runed) {
      p.runed = true;
      this.addRune(p.skill, x, y, p.dmg);
    }
    if (r.cloud > 0 && !p.clouded) {
      p.clouded = true;
      this.addCloud(p.skill, x, y, 1.5, p.dmg);
    }
    if (this.leaves(r) && !p.left) {
      p.left = true;
      this.leavePatches(p.skill, x, y, 1.0, p.dmg);
    }
    // (THE CITY'S WORDS: Pulling in front drags in what is round where it struck)
    if (r.pull > 0) this.pullIn(p.skill, x, y, r.splash > 0 ? r.splash * r.size : 0, true);
    this.emit({ t: 'spark', x, y, el: r.element, n: 6 });
  }

  private endProjectile(p: Projectile): void {
    this.emit({ t: 'spark', x: p.x, y: p.y, el: p.element, n: 4 });
    if (!p.hostile) {
      const r = this.hero.skills[p.skill].r;
      if (r.rune > 0 && !p.runed) {
        p.runed = true;
        this.addRune(p.skill, p.x, p.y, p.dmg);
      }
      if (r.cloud > 0 && !p.clouded) {
        p.clouded = true;
        this.addCloud(p.skill, p.x, p.y, 1.5, p.dmg);
      }
      if (this.leaves(r) && !p.left && this.isOpen(p.x, p.y)) {
        p.left = true;
        this.leavePatches(p.skill, p.x, p.y, 1.0, p.dmg);
      }
    }
  }

  private updateTraps(dt: number): void {
    for (let i = this.traps.length - 1; i >= 0; i--) {
      const t = this.traps[i];
      t.life -= dt;
      if (t.arm > 0) t.arm -= dt;
      let go = false;
      if (t.arm <= 0) {
        for (const m of this.monsters) {
          if (!m.dead && Math.hypot(m.x - t.x, m.y - t.y) <= TUNE.trapTrigger + m.r) {
            go = true;
            break;
          }
        }
      }
      if (go) {
        const s = this.hero.skills[t.skill];
        this.traps.splice(i, 1);
        this.sfx('trapBoom');
        this.emit({ t: 'shake', amount: 2 });
        const rad = SKILLS[s.id].radius * s.r.size * (this.was('widetraps') ? TALENT_TUNE.wideTraps : 1);
        // (THE SKILL TREES REMADE: Wide Traps, what is near is pulled in, and then it bursts)
        if (this.now('widetraps')) {
          const W = TALENT_TUNE.wideTraps2;
          for (const m of this.monsters) {
            const dd = Math.hypot(m.x - t.x, m.y - t.y);
            if (m.dead || dd > rad + W.reach + m.r || dd <= W.to) continue;
            this.throwMonster(m, t.x, t.y, -(dd - W.to), W.secs);
          }
          const { skill, x, y, frac } = t;
          this.after(W.secs, () => this.blast(skill, x, y, rad, frac, 'blast'));
        } else this.blast(t.skill, t.x, t.y, rad, t.frac, 'blast');
      } else if (t.life <= 0) this.traps.splice(i, 1);
    }
  }

  /**
   * A trap is laid at (x, y) by ability `i`, to burst for `frac` of that ability's damage. No more
   * than a few lie at once: one more takes the place of the oldest.
   */
  private layTrap(i: number, x: number, y: number, frac: number): void {
    const r = this.hero.skills[i].r;
    this.traps.push({ x, y, arm: TUNE.trapArm, life: TUNE.trapLife, skill: i, frac, element: r.element });
    while (this.traps.length > TUNE.trapMax * r.count * (this.has('minefield') ? TALENT_TUNE.minefield.n : 1)) this.traps.shift();
    this.sfx('trapSet');
    this.emit({ t: 'trapSet', x, y, el: r.element });
  }

  /**
   * Where arrow `n` of a volley comes down (`c`: 1 for the second of a Twin pair, which lands on
   * the far side of the patch from the first).
   */
  private volleySpot(v: Volley, n: number, c: number): { x: number; y: number } {
    // (the seeds are taken five apart, or by the next prime that the count is not a multiple of:
    // every seed is then taken once, and one after another they land far from each other)
    const step = [5, 7, 11, 13].find((p) => v.total % p !== 0) ?? 1;
    const far = v.r * Math.sqrt((((n * step) % v.total) + 0.5) / v.total);
    const a = n * 2.39996 + c * Math.PI;
    return { x: v.x + Math.cos(a) * far, y: v.y + Math.sin(a) * far };
  }

  /**
   * The arrows of a volley come down, one after another, here and there inside its patch of
   * ground: each hurts whatever stands within TUNE.volleyHit of where it lands. Where they land
   * is not left to chance (a sunflower's seeds, taken out of order): every part of the patch gets
   * its share, so standing in the rain always costs about the same.
   */
  private updateVolleys(dt: number): void {
    for (let k = this.volleys.length - 1; k >= 0; k--) {
      const v = this.volleys[k];
      const s = this.hero.skills[v.skill];
      if (!s || SKILLS[s.id].kind !== 'volley') {
        this.volleys.splice(k, 1);
        continue;
      }
      v.t += dt;
      const r = s.r;
      const words = this.fronts(v.skill);
      const reach = TUNE.volleyHit * r.size;
      // (THE SKILL TREES REMADE: Hail, the rain goes after the enemy it was aimed at)
      if (v.follow !== undefined) {
        const m = this.monsters.find((q) => q.id === v.follow && !q.dead);
        if (!m) v.follow = undefined;
        else {
          const dd = Math.hypot(m.x - v.x, m.y - v.y);
          const go = Math.min(dd, TALENT_TUNE.hail2.speed * dt);
          if (dd > 0.01) {
            v.x += ((m.x - v.x) / dd) * go;
            v.y += ((m.y - v.y) / dd) * go;
          }
        }
      }
      // (the effects are told a moment ahead, so that each arrow is seen coming down before it lands)
      while (v.told < v.total && v.t >= v.told * TUNE.volleyEvery - VOLLEY_SEEN) {
        for (let c = 0; c < v.count; c++) {
          const at = this.volleySpot(v, v.told, c);
          // (Hail: where it was told it comes down is where it comes down, the rain moving meanwhile)
          if (v.follow !== undefined || v.at) (v.at ??= [])[v.told * v.count + c] = at;
          this.emit({ t: 'volleyDrop', x: at.x, y: at.y, el: v.element, words, n: c, echo: v.echo, in: Math.max(0, v.told * TUNE.volleyEvery - v.t) });
        }
        v.told++;
      }
      while (v.n < v.total && v.t >= v.next - 1e-9) {
        if (v.wake) {
          // what the words behind it leave, it leaves once, as the first arrow lands
          v.wake = false;
          this.wake(v.skill, v.x, v.y, v.r, v.frac);
        }
        for (let c = 0; c < v.count; c++) {
          const at = v.at?.[v.n * v.count + c] ?? this.volleySpot(v, v.n, c);
          const ax = at.x;
          const ay = at.y;
          let hits = 0;
          for (const m of this.monsters) {
            if (m.dead || Math.hypot(m.x - ax, m.y - ay) > reach + m.r || this.shutIn(m)) continue;
            this.hitMonster(m, v.skill, v.frac, hits >= 3);
            hits++;
          }
          if (hits > 0) this.landed(v.skill);
          // (THE CITY'S WORDS: Pulling in front, each arrow drags what it struck in to where it fell)
          if (hits > 0 && this.hero.skills[v.skill].r.pull > 0) this.pullIn(v.skill, ax, ay, reach, false);
          this.breakProps(ax, ay, reach * 0.6, v.skill);
          this.emit({ t: 'volleyFall', x: ax, y: ay, el: v.element, words, n: c, echo: v.echo, hits });
          // (ten arrows a second: the ones that hit are heard, and every other one that does not)
          if (hits > 0) this.sfx('hit', 0.45);
          else if (c === 0 && v.n % 2 === 0) this.sfx('arrowLand', 0.3);
        }
        v.n++;
        v.next += TUNE.volleyEvery;
      }
      if (v.n >= v.total) {
        this.emit({ t: 'volleyEnd', x: v.x, y: v.y, el: v.element });
        this.volleys.splice(k, 1);
      }
    }
  }

  private updateZones(dt: number): void {
    const h = this.hero;
    for (let i = this.zones.length - 1; i >= 0; i--) {
      const z = this.zones[i];
      z.t += dt;
      if (z.kind === 'warn') {
        if (z.t >= z.dur) {
          this.zones.splice(i, 1);
          this.emit({ t: 'burst', x: z.x, y: z.y, r: z.r, el: z.element, style: 'blast' });
          this.emit({ t: 'shake', amount: 2 });
          if (Math.hypot(h.x - z.x, h.y - z.y) <= z.r + 0.1) this.hurtFrom(z);
        }
        continue;
      }
      if (z.kind === 'skull') {
        // (THE NEW MONSTERS: a Golem's skull comes down where it was aimed, and bursts)
        if (!z.gone && z.t >= z.dur) {
          z.gone = 1;
          this.emit({ t: 'shake', amount: 2 });
          this.sfx('slam', 0.6);
          if (Math.hypot(h.x - z.x, h.y - z.y) <= z.r + 0.1) this.hurtFrom(z);
        }
        if (z.t >= z.dur + SKULL.burst) this.zones.splice(i, 1);
        continue;
      }
      if (z.kind === 'aim') {
        // (THE NEW MONSTERS: the marksman's line of aim has no clock of its own: his draw moves it on, and it goes with it)
        if (!this.monsters.some((m) => m.id === z.src && !m.dead && m.state === 'windup')) this.zones.splice(i, 1);
        else z.t -= dt;
        continue;
      }
      if (z.kind === 'smoke') {
        // (THE NEW MONSTERS: the high priest's burning smoke burns whoever is in it, now and then: SMOKE)
        z.tick -= dt;
        if (z.tick <= 0) {
          z.tick += SMOKE.tick;
          if (Math.hypot(h.x - z.x, h.y - z.y) <= z.r + TUNE.heroRadius * 0.5) this.hurtFrom(z);
        }
        if (z.t >= z.dur) this.zones.splice(i, 1);
        continue;
      }
      if (z.kind === 'lane') {
        // (THE MONSTERS' ATTACKS: a charge's line has no clock of its own: its troll's wind-up and run move it on, and it goes with him)
        if (!this.monsters.some((m) => m.id === z.src && !m.dead && (m.state === 'windup' || m.state === 'charge'))) this.zones.splice(i, 1);
        continue;
      }
      if (z.kind === 'rune') {
        // (VOLATILE'S MELDS, behind VOLT_MELDS: Shatter's rune freezes what is in it, part way through its wait)
        if (z.meld === 'shatter' && !z.froze && z.t >= z.dur * MELD_TUNE.shatter.freezeAt) {
          z.froze = true;
          const ids: number[] = [];
          for (const m of this.monsters) {
            if (m.dead || this.shutIn(m) || Math.hypot(m.x - z.x, m.y - z.y) > z.r + m.r) continue;
            this.freezeMonster(m);
            if (m.frozenT > 0) ids.push(m.id);
          }
          this.emit({ t: 'volFx', meld: 'shatter', what: 'freeze', x: z.x, y: z.y, r: z.r, ids });
        }
        if (z.t >= z.dur) {
          this.zones.splice(i, 1);
          this.emit({ t: 'burst', x: z.x, y: z.y, r: z.r, el: z.element, style: 'ruin', words: VOLATILE_ONLY, ...(z.meld ? { meld: z.meld } : {}) });
          this.emit({ t: 'shake', amount: z.meld === 'demolition' ? 6 : 3 });
          this.sfx('explode', 0.8);
          for (const m of this.monsters) {
            if (!m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r) this.damageMonster(m, Math.max(1, Math.round(z.dmg)), z.element, false, z.skill);
          }
          this.breakProps(z.x, z.y, z.r, z.skill);
          if (z.meld) this.runeTwist(z);
        }
        continue;
      }
      if (z.kind === 'cracks') {
        // Heavy behind: what walks onto the cracked ground is staggered (bats fly over it)
        for (const m of this.monsters) {
          if (m.dead || m.state === 'sleep' || m.kind === 'bat') continue;
          if (Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r * 0.5) this.staggerMonster(m, z.x, z.y);
        }
        if (z.t >= z.dur) this.zones.splice(i, 1);
        continue;
      }
      if (z.kind === 'snare') {
        // BINDING behind: the first enemy to come onto the snare is held, and the snare is spent (bats fly over it; a boss, or
        // one held not long since, crosses it as if it were not there)
        const on = (o: Monster): boolean => Math.hypot(o.x - z.x, o.y - z.y) <= z.r + o.r * 0.5;
        if (z.onIt?.length) z.onIt = z.onIt.filter((id) => this.monsters.some((o) => o.id === id && !o.dead && on(o)));
        const m = this.monsters.find((o) => !o.dead && o.state !== 'sleep' && o.kind !== 'bat' && !o.boss && (o.bindAgain ?? 0) <= 0 && on(o) && !z.onIt?.includes(o.id));
        const held = m ? this.bindMonster(m, z.dmg) : 0;
        if (m && held > 0) {
          this.emit({ t: 'snareSprung', id: m.id, x: z.x, y: z.y, secs: held });
          this.zones.splice(i, 1);
          continue;
        }
        if (z.t >= z.dur) this.zones.splice(i, 1);
        continue;
      }
      if (z.kind === 'ward' || z.kind === 'hex' || z.kind === 'bubble') {
        // Guarding behind: it does its work in hurtHero, for as long as it lasts. (THE CITY'S WORDS, Version 23.8: so do Hexing's
        // circle, in hurtHero, and Stilling's bubble, in the monsters' and their shots' time: `timeOf`, updateProjectiles)
        if (z.t >= z.dur) this.zones.splice(i, 1);
        continue;
      }
      if (z.kind === 'vortex') {
        // (THE CITY'S WORDS: Pulling behind, the vortex keeps drawing what is in it in to its middle; a boss stands firm)
        for (const m of this.monsters) {
          if (m.dead || m.boss || m.state === 'sleep' || m.state === 'act' || this.shutIn(m)) continue;
          const d = Math.hypot(m.x - z.x, m.y - z.y);
          if (d > z.r + m.r * 0.5 || d <= PULL.middle) continue;
          const step = Math.min(d - PULL.middle, PULL.pace * (m.elite ? 0.5 : 1) * dt);
          this.slide(m, Math.min(m.r, 0.42), ((z.x - m.x) / d) * step, ((z.y - m.y) / d) * step, m.kind === 'bat' ? this.level.open : this.level.walk);
        }
        if (z.t >= z.dur) this.zones.splice(i, 1);
        continue;
      }
      // (WORDMELDING: the twists of what a melded word behind leaves, game/melds.ts)
      if (z.meld && this.meldZone(z, i, dt)) continue;
      z.tick -= dt;
      if (z.tick <= 0) {
        z.tick += 0.5;
        const inside = this.monsters.filter((m) => !m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r * 0.5);
        if (z.kind === 'storm') {
          if (inside.length) {
            const m = this.rng.pick(inside);
            this.emit({ t: 'arc', x0: z.x, y0: z.y, x1: m.x, y1: m.y, sky: true, ...(z.meld ? { meld: z.meld } : {}) });
            this.damageMonster(m, Math.max(1, Math.round(z.dmg)), 'lightning', false, z.skill);
            this.sfx('thunder', 0.5);
          }
          // (WORDMELDING: Hailstorm's storm of ice slows what is in it)
          if (z.slow > 0) {
            for (const m of inside) {
              m.chill = Math.max(m.chillT > 0 ? m.chill : 0, z.slow);
              m.chillT = Math.max(m.chillT, 0.7);
            }
          }
        } else if (z.kind === 'venom') {
          // the cloud poisons whatever stands in it, and they carry it out with them
          for (const m of inside) {
            if (m.poisonT <= 0) {
              m.poisonN = 1;
              m.poisonDps = 0;
              this.emit({ t: 'poisoned', x: m.x, y: m.y });
            }
            m.poisonDps = Math.max(m.poisonDps, z.dmg);
            m.poisonT = Math.max(m.poisonT, 2);
            if (z.skill >= 0) m.lastSkill = z.skill;
          }
        } else if (z.from === 'kindling') {
          // (THE SKILL TREES REMADE: Kindling's burning ground sets alight whatever stands in it)
          for (const m of inside) {
            if (m.burnT <= 0) this.emit({ t: 'ignite', x: m.x, y: m.y });
            m.burnDps = Math.max(m.burnT > 0 ? m.burnDps : 0, z.dmg);
            m.burnT = Math.max(m.burnT, 1);
          }
        } else {
          for (const m of inside) {
            // (WORDMELDING: Scald behind's steam slows as ice does)
            if (z.kind === 'ice' || z.kind === 'steam') {
              m.chill = Math.max(m.chillT > 0 ? m.chill : 0, z.slow);
              m.chillT = 0.7;
            }
            this.damageMonster(m, Math.max(1, Math.round(z.dmg * 0.5)), z.element, false, z.skill, false, undefined, false, true);
          }
        }
      }
      if (z.t >= z.dur) this.zones.splice(i, 1);
    }
  }

  /**
   * WORDMELDING: zone `z` (at `k` among the zones) does its melded word's twist. True if it is gone
   * by it (Fumes' cloud, exploding): then nothing else is done with it.
   */
  private meldZone(z: Zone, k: number, dt: number): boolean {
    const T = MELD_TUNE;
    if (z.meld === 'wildfire' && z.kind === 'burn') {
      // the burning ground throws a spark at an enemy near it, every so often
      z.meldT = (z.meldT ?? 0) - dt;
      if (z.meldT <= 0) {
        z.meldT = T.wildfire.every;
        const near = this.monsters.filter((m) => !m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + T.wildfire.reach);
        if (near.length) {
          const m = this.rng.pick(near);
          this.emit({ t: 'arc', x0: z.x, y0: z.y, x1: m.x, y1: m.y, meld: 'wildfire' });
          this.damageMonster(m, Math.max(1, Math.round(z.dmg * (T.wildfire.spark / 0.25))), 'fire', false, z.skill);
          this.sfx('zap', 0.4);
        }
      }
    } else if (z.meld === 'fumes' && z.kind === 'venom') {
      // anything burning that comes into the cloud sets it off
      if (this.monsters.some((m) => !m.dead && m.burnT > 0 && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r * 0.5)) {
        this.zones.splice(k, 1);
        const boom = Math.max(1, Math.round(z.dmg * T.fumes.blast));
        this.emit({ t: 'burst', x: z.x, y: z.y, r: z.r + 0.5, el: 'fire', style: 'blast', meld: 'fumes' });
        this.emit({ t: 'shake', amount: 3 });
        this.sfx('explode', 0.7);
        for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + 0.5 + m.r) this.damageMonster(m, boom, 'fire', false, z.skill);
        return true;
      }
    } else if (z.meld === 'frostbite' && z.kind === 'ice' && z.tick - dt <= 0) {
      // the ice poisons what crosses it
      for (const m of this.monsters) if (!m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r * 0.5) this.poisonMonster(m, z.dmg, z.skill);
    } else if (z.meld === 'contagion' && z.kind === 'venom' && z.tick - dt <= 0) {
      // the cloud shocks one that stands in it
      const inside = this.monsters.filter((m) => !m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r * 0.5);
      if (inside.length) {
        const m = this.rng.pick(inside);
        this.emit({ t: 'arc', x0: z.x, y0: z.y, x1: m.x, y1: m.y, meld: 'contagion' });
        this.damageMonster(m, Math.max(1, Math.round(z.dmg * T.contagion.shock)), 'lightning', false, z.skill);
        this.sfx('zap', 0.4);
      }
    }
    return false;
  }

  /** Burning, twice a second. */
  private updateDots(dt: number): void {
    this.dotT -= dt;
    if (this.dotT > 0) return;
    this.dotT += 0.5;
    for (const m of this.monsters) {
      if (!m.dead && m.burnT > 0) this.damageMonster(m, Math.max(1, Math.round(m.burnDps * 0.5)), 'fire', false, m.lastSkill, false, undefined, false, true);
      if (!m.dead && m.poisonT > 0 && m.poisonDps > 0) this.damageMonster(m, Math.max(1, Math.round(m.poisonDps * 0.5)), 'phys', false, m.lastSkill, false, undefined, true);
      // (WORDMELDING: Frostbite in front, a chilled enemy loses life, a frozen one twice as fast)
      if (!m.dead && m.biteDps && (m.chillT > 0 || m.frozenT > 0)) this.damageMonster(m, Math.max(1, Math.round(m.biteDps * 0.5 * (m.frozenT > 0 ? 2 : 1))), 'frost', false, m.lastSkill, false, undefined, false, true);
      // (THE SKILL TREES REMADE: Honed Edge's bleeding)
      if (!m.dead && m.bleedT && m.bleedDps) this.damageMonster(m, Math.max(1, Math.round(m.bleedDps * 0.5)), 'phys', false, m.lastSkill, false, undefined, false, true);
      // (THE WARLOCK: his hellfire, and the curse's smoulder)
      if (!m.dead && (m.hellT ?? 0) > 0 && m.hellDps) this.damageMonster(m, Math.max(1, Math.round(m.hellDps * 0.5)), 'fire', false, m.lastSkill, false, undefined, false, true);
      if (!m.dead && (m.curseT ?? 0) > 0 && m.curseDps) this.damageMonster(m, Math.max(1, Math.round(m.curseDps * 0.5)), 'phys', false, m.lastSkill, false, undefined, false, true);
    }
    // (Searing: fire spreads from a burning enemy to any it touches)
    if (this.now('searing')) this.spreadFire();
    const h = this.hero;
    if (h.burnT > 0 && !this.over) {
      const dmg = Math.max(1, Math.round(h.burnDps * 0.5));
      h.life -= dmg;
      this.emit({ t: 'hit', x: h.x, y: h.y, amount: dmg, crit: false, el: 'fire', onHero: true });
      if (h.life <= 0) {
        this.slainBy = 'the flames';
        this.die();
      }
    }
    if (h.poisonT > 0 && !this.over) {
      const dmg = Math.max(1, Math.round(h.poisonDps * 0.5));
      h.life -= dmg;
      this.emit({ t: 'hit', x: h.x, y: h.y, amount: dmg, crit: false, el: 'phys', onHero: true, poison: true });
      if (h.life <= 0) {
        this.slainBy = 'poison';
        this.die();
      }
    }
  }

  // ===========================================================================================
  // Loot, pickups, experience

  /** The middle of the floor tile nearest a place (for a place over a pit); the place itself if no floor is near. */
  private floorNear(x: number, y: number): { x: number; y: number } {
    const f = this.level.floor;
    const cx = Math.floor(x);
    const cy = Math.floor(y);
    let best = { x, y };
    let bd = Infinity;
    for (let ty = cy - 4; ty <= cy + 4; ty++) {
      for (let tx = cx - 4; tx <= cx + 4; tx++) {
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h || this.level.walk[ty * f.w + tx] !== 1) continue;
        const d = (tx + 0.5 - x) * (tx + 0.5 - x) + (ty + 0.5 - y) * (ty + 0.5 - y);
        if (d < bd) {
          bd = d;
          best = { x: tx + 0.5, y: ty + 0.5 };
        }
      }
    }
    return best;
  }

  private addDrop(kind: Drop['kind'], x: number, y: number, gold: number, item: Item | null, word: WordId | null): void {
    let px = x + this.rng.range(-0.7, 0.7);
    let py = y + this.rng.range(-0.7, 0.7);
    if (!this.isOpen(px, py)) {
      px = x;
      py = y;
    }
    // (PITS: what a bat drops as it dies over one lands on the nearest floor, not in the hole)
    if (this.level.step && !this.onFloor(px, py)) {
      const at = this.onFloor(x, y) ? { x, y } : this.floorNear(x, y);
      px = at.x;
      py = at.y;
    }
    this.drops.push({ x: px, y: py, kind, gold, item, word, age: 0 });
    if (kind === 'word' && word) this.emit({ t: 'wordDrop', word, x: px, y: py });
  }

  /**
   * A piece of gear for this dungeon. Its rarity is rolled by how deep the dungeon is (items.ts).
   * `quality` 1 = from something better than an ordinary monster (a named one, a chest): likelier
   * to be magic or rare. 2 = from a hoard (a guardian, a vault): likelier still. 3 = the first
   * piece of a boss's hoard: as 2, and never plain. Nothing is rare for certain any more: gear is
   * meant to be made good with words.
   */
  private rollGear(quality: 0 | 1 | 2 | 3 | 4 = 0): Item {
    const mf = this.hero.d.stats.magicFind + 25 * this.dungeonWords.length;
    const opts: RollOpts = { forWeapon: this.weapon(), magicFind: mf };
    if (quality === 1) opts.luck = TUNE.betterLuck;
    if (quality >= 2) opts.luck = TUNE.hoardLuck;
    if (quality === 3) opts.atLeast = 1;
    // (LOOT2: 4, the first of a boss's or a guardian's: never plain; from floor LOOT2.from, a rare at the least)
    if (quality === 4) opts.atLeast = this.power >= LOOT2.from ? 2 : 1;
    // (LOOT2: in the descent every roll the luckier)
    if (LOOT2.on && this.power >= LOOT2.from) opts.luck = [(opts.luck?.[0] ?? 1) * LOOT2.deep, (opts.luck?.[1] ?? 1) * LOOT2.deep];
    // (ENDLESS MODE: what drops grows on as the floors' depth would, `power`)
    return rollItem(Math.max(1, this.power), this.rng, opts);
  }

  /** The words a monster will drop when it dies: what hangs over its head. For most monsters, none. */
  wordsCarried(m: Monster): readonly WordId[] {
    return m.carries;
  }

  private dropLoot(m: Monster): void {
    const rng = this.rng;
    if (this.practice) {
      // nothing to collect here but the odd life orb
      if (rng.chance(TUNE.dropOrb)) this.addDrop('orb', m.x, m.y, 0, null, null);
      return;
    }
    // whatever else it leaves, a monster that carried a word gives it up
    for (const w of m.carries) this.addDrop('word', m.x, m.y, 0, null, w);
    // (the dead that rise for a new player's first word leave nothing: they are there to be felled)
    if (m.packId === RISEN_PACK) return;
    const bonus = 1 + 0.3 * this.dungeonWords.length;
    const goldBase = Math.max(1, this.power);
    if (m.boss) {
      // (WORDMELDING: the Fleshmancer drops runedust, the only one who does for now, his pick; and the
      // Meldstone, which opens melding at the wordsmith, until it has been brought to him)
      if (MELD.on && m.kind === 'fleshmancer') {
        this.addDrop('dust', m.x, m.y, MELD_TUNE.fleshmancerDust, null, null);
        // (STONE_RISE: the runedust waits under the floor while his pit closes)
        if (STONE_RISE.on) this.drops[this.drops.length - 1].age = -STONE_RISE.dustWait;
        if (this.hero.meld === null && !this.drops.some((d) => d.kind === 'stone')) {
          this.addDrop('stone', m.x, m.y, 0, null, null);
          // (STONE_RISE: and the Meldstone bursts up out of it, just where he went down)
          if (STONE_RISE.on) {
            const st = this.drops[this.drops.length - 1];
            st.age = -STONE_RISE.wait;
            if (this.isOpen(m.x, m.y)) {
              st.x = m.x;
              st.y = m.y;
            }
          }
        }
      }
      // (FLOOR 13'S DOUBLE BOSS: the first of the pair to fall leaves part of a boss's hoard, the last the whole of it)
      if (partnerOf(this, m)) {
        this.addDrop('gold', m.x, m.y, rng.int(12, 22) * goldBase, null, null);
        this.addDrop('item', m.x, m.y, 0, this.rollGear(LOOT2.on ? 4 : 3), null);
        this.addDrop('orb', m.x, m.y, 0, null, null);
        return;
      }
      this.addDrop('gold', m.x, m.y, rng.int(25, 45) * goldBase, null, null);
      const n = (LOOT2.on ? LOOT2.boss : TUNE.bossItems) + (this.depth % 5 === 0 ? TUNE.bossItemsFifth : 0);
      // (LOOT2: the first never plain, and rare from floor LOOT2.from; the others with a hoard's luck there, as before above it)
      for (let i = 0; i < n; i++) this.addDrop('item', m.x, m.y, 0, this.rollGear(LOOT2.on ? (i === 0 ? 4 : this.power >= LOOT2.from ? 2 : 1) : i === 0 ? 3 : 1), null);
      this.addDrop('orb', m.x, m.y, 0, null, null);
      return;
    }
    if (m.champion) {
      // a guardian always pays: full flasks, gold, a good piece, a life orb (and its word, if it carried one)
      if (this.hero.potions < TUNE.potionMax) {
        this.hero.potions = TUNE.potionMax;
        this.msg('Flasks refilled', MSG.life);
      }
      this.addDrop('gold', m.x, m.y, rng.int(15, 25) * goldBase, null, null);
      // (LOOT2: more pieces; above floor LOOT2.from only the first with a hoard's luck, his "yellow items should be pretty rare" early on)
      for (let i = 0; i < (LOOT2.on ? LOOT2.champion : 1); i++) this.addDrop('item', m.x, m.y, 0, this.rollGear(i === 0 || this.power >= LOOT2.from ? 2 : 0), null);
      this.addDrop('orb', m.x, m.y, 0, null, null);
      return;
    }
    if (m.elite) {
      this.addDrop('gold', m.x, m.y, rng.int(8, 16) * goldBase, null, null);
      if (rng.chance(LOOT2.on ? LOOT2.elite : TUNE.eliteItem)) this.addDrop('item', m.x, m.y, 0, this.rollGear(1), null);
      return;
    }
    // (THE TINKERER's tree: Alchemy, an enemy her vials kill always drops gold)
    if (rng.chance(TUNE.dropGold) || (this.brewing && this.has('alchemy'))) this.addDrop('gold', m.x, m.y, rng.int(TUNE.goldMin, TUNE.goldMax) * goldBase, null, null);
    if (rng.chance((LOOT2.on ? LOOT2.item : TUNE.dropItem) * bonus)) this.addDrop('item', m.x, m.y, 0, this.rollGear(), null);
    if (rng.chance(TUNE.dropOrb)) this.addDrop('orb', m.x, m.y, 0, null, null);
    // (THE FIRST LEVELS: no word falls before the ring is lit, nor in the first dungeon)
    if (rng.chance(TUNE.dropWord * bonus * wordGrowth(this.power)) && this.wordsFall()) this.addDrop('word', m.x, m.y, 0, null, rng.pick(wordsAt(this.power)));
  }

  private gainXp(n: number): void {
    const h = this.hero;
    if (this.practice) return;
    h.xp += Math.round(n * (1 + 0.1 * this.dungeonWords.length));
    while (h.xp >= xpToNext(h.level)) {
      h.xp -= xpToNext(h.level);
      h.level++;
      h.pending++;
      this.refresh();
      h.life = h.d.maxLife;
      h.mana = h.d.maxMana;
      this.emit({ t: 'levelup' });
      this.sfx('levelUp');
      this.msg(`Level ${h.level}`, MSG.head);
      // THE FIRST LEVELS: an ability opens with this level
      if (FIRST_LEVELS.on) {
        for (let i = 1; i < MOVE_OPENS.length; i++) {
          if (MOVE_OPENS[i] !== h.level) continue;
          this.emit({ t: 'moveOpen', skill: i });
          this.msg(`A new move: ${SKILLS[h.skills[i].id].name.toUpperCase()}.`, MSG.word);
        }
      }
      // a new socket has opened on both attacks: say so, and if a spare word fits it, offer it a place
      const [f0, b0] = this.slots(h.level - 1);
      const [f1, b1] = this.slots(h.level);
      if (f1 > f0 || b1 > b0) {
        const nth = ['A', 'A second', 'A third'][(f1 > f0 ? f1 : b1) - 1] ?? 'Another';
        this.msg(`${nth} word slot has opened ${f1 > f0 ? 'IN FRONT of' : 'BEHIND'} your attacks.`, MSG.word);
        const spare = WORD_IDS.find((w) => h.words[w] > 0 && this.placeable(w));
        if (spare) this.offer = spare;
      }
    }
  }

  private updateDrops(dt: number): void {
    const h = this.hero;
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const dr = this.drops[i];
      dr.age += dt;
      // (a word stands in its light for a moment before it can be taken: it is an event, not a coin)
      // (STONE_RISE: the Meldstone, while it bursts up and comes down to hang)
      if (dr.age < (dr.kind === 'word' ? TUNE.wordStands : dr.kind === 'stone' && STONE_RISE.on ? STONE_RISE.stands : 0.4)) continue;
      const dx = h.x - dr.x;
      const dy = h.y - dr.y;
      const dist = Math.hypot(dx, dy);
      // (THE CITY'S WORDS: Pulling burned into gear, from further)
      if (dr.kind !== 'item' && dist < TUNE.dropPull * (1 + h.d.stats.pickupPct / 100) && dist > 0.01) {
        const sp = Math.min(dist, 9 * dt);
        dr.x += (dx / dist) * sp;
        dr.y += (dy / dist) * sp;
      }
      if (dist > (dr.kind === 'item' ? TUNE.gearTake : TUNE.dropTake)) continue;
      if (dr.kind === 'gold') {
        const got = Math.round(dr.gold * (1 + h.d.stats.goldFind / 100));
        h.gold += got;
        this.sfx('gold', 0.6);
        this.emit({ t: 'text', x: h.x, y: h.y, text: `+${got}`, color: '#ffe070' });
      } else if (dr.kind === 'orb') {
        this.healHero(h.d.maxLife * 0.15);
        this.emit({ t: 'heal', amount: Math.round(h.d.maxLife * 0.15) });
        this.sfx('pickup');
      } else if (dr.kind === 'word' && dr.word) {
        h.words[dr.word]++;
        if (!this.practice) this.meta.known[dr.word].found = true;
        this.sfx('word');
        this.emit({ t: 'wordGot', word: dr.word });
        // A character's FIRST word is pressed on them: if it has somewhere to go, the interface
        // stops the game at the next quiet moment and opens the inventory for it (and a new
        // player's guide shows where it goes). Once a word is at work on the character, a word
        // found is only picked up: it is among the hero's words, the screen says WORD FOUND, and
        // the game goes on. (The owner, 5 Oct 2026, 22:51: "After you get your first power word
        // and equip it, the game doesn't need to stop and open the inventory again whenever a
        // word is picked up". Until then every word that had somewhere to go was offered.)
        if (!this.wordAtWork() && this.placeable(dr.word)) this.offer = dr.word;
      } else if (dr.kind === 'item' && dr.item) {
        if (!this.takeItem(dr.item)) continue;
      } else if (dr.kind === 'dust') {
        // (WORDMELDING) runedust
        h.dust += dr.gold;
        this.emit({ t: 'dustGot', x: dr.x, y: dr.y, n: dr.gold });
        this.sfx('word', 0.7);
        this.emit({ t: 'text', x: h.x, y: h.y, text: `+${dr.gold} RUNEDUST`, color: MELD_DUST_COLOR });
      } else if (dr.kind === 'stone') {
        // (WORDMELDING) the Meldstone, to be brought to the wordsmith
        if (h.meld === null) h.meld = 'stone';
        this.emit({ t: 'stoneGot', x: dr.x, y: dr.y });
        this.sfx('rare');
        this.msg('You take the MELDSTONE. Bring it to the wordsmith.', MSG.word);
      }
      this.drops.splice(i, 1);
    }
  }

  /** Put a picked-up item on the hero: straight into an empty slot it fits, otherwise into the bag. */
  private takeItem(it: Item): boolean {
    const h = this.hero;
    const slot = this.slotFor(it);
    if (slot && !h.gear[slot] && this.useProblem(it) === null && (it.slot !== 'offhand' || canPair(h.gear.mainhand, it))) {
      h.gear[slot] = it;
      this.refresh();
      this.sfx('equip');
      // (as on the floor, a pickup is told by its kind alone: the name is for the inventory)
      this.msg(`${kindName(it)} equipped`, rarityColor(it.rarity));
      return true;
    }
    const free = h.bag.indexOf(null);
    if (free < 0) {
      if (this.bagFullT <= 0) {
        this.bagFullT = 2.5;
        this.msg('Your bag is full', MSG.bad);
        this.sfx('deny');
      }
      return false;
    }
    h.bag[free] = it;
    this.sfx(it.rarity >= 2 ? 'rare' : 'pickup');
    this.msg(kindName(it), rarityColor(it.rarity));
    return true;
  }

  // ===========================================================================================
  // Props and the portal

  /** `skill`: the ability whose hit it is (THE TRAPS: a sealed door in reach opens to one that carries its word: `unseal`). */
  private breakProps(x: number, y: number, rad: number, skill = -1): void {
    this.unseal(skill, x, y, rad);
    // (ACT 2, THE BELLS: a hit at a bell rings it; at the Muffled Bell, it starts the Hush)
    if (this.level.bells) this.bellsStruck(x, y, rad);
    // (ACT 2, THE HUSH: what a kind of its own has lying on the floor there takes his blow too: the Palimpsest's pages
    // burn under his fire, game/act1_rules/palimpsest.ts; his doc, "Fire words shine here")
    if (this.perils.length) this.bosses.floorBlow(x, y, rad, skill >= 0 ? this.hero.skills[skill]?.r.element ?? 'phys' : 'phys');
    const f = this.level.floor;
    for (const p of this.level.props) {
      if (p.state !== 0 || (p.kind !== 'barrel' && p.kind !== 'urn')) continue;
      if (Math.hypot(p.x - x, p.y - y) > rad + 0.4) continue;
      p.state = 1;
      p.solid = false;
      this.level.walk[p.ty * f.w + p.tx] = 1;
      this.emit({ t: 'spark', x: p.x, y: p.y, el: 'phys', n: 8 });
      this.sfx('hit', 0.5);
      const rng = this.rng;
      if (rng.chance(0.4)) this.addDrop('gold', p.x, p.y, rng.int(1, 5) * Math.max(1, this.power), null, null);
      if (rng.chance(0.08)) this.addDrop('orb', p.x, p.y, 0, null, null);
      if (rng.chance(0.04)) this.addDrop('item', p.x, p.y, 0, this.rollGear(), null);
    }
  }

  private updateProps(c: Controls): void {
    const h = this.hero;
    for (const p of this.level.props) {
      if (p.kind === 'chest' && p.state === 0 && Math.hypot(p.x - h.x, p.y - h.y) < 1.5) {
        p.state = 1;
        this.sfx('rare');
        // A chest in a treasure vault (the end of a side branch) is richer than one found along the way,
        // and the first chest opened in each vault is the likeliest place in a dungeon to find a power word.
        const room = this.level.floor.rooms.find((r) => r.kind === 'treasure' && p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h);
        const firstInVault = !!room && !this.level.props.some((o) => o !== p && o.kind === 'chest' && o.state === 1 && o.tx >= room.x && o.ty >= room.y && o.tx < room.x + room.w && o.ty < room.y + room.h);
        // (one piece; a vault's chest may hold a second, and the first piece out of a vault's chest is a hoard's)
        const n = TUNE.chestItems + (room && this.rng.chance(0.5) ? 1 : 0);
        for (let i = 0; i < n; i++) this.addDrop('item', p.x, p.y + 0.6, 0, this.rollGear(room && i === 0 ? 2 : 1), null);
        this.addDrop('gold', p.x, p.y + 0.6, this.rng.int(10, 20) * Math.max(1, this.power) * (room ? 2 : 1), null, null);
        if (this.rng.chance((firstInVault ? TUNE.vaultWord : TUNE.chestWord) * wordGrowth(this.power)) && this.wordsFall()) this.addDrop('word', p.x, p.y + 0.6, 0, null, this.rng.pick(wordsAt(this.power)));
      }
    }
    // (THE MIX) a lever: walk up, and it is pulled
    for (const p of this.level.props) {
      if (p.kind === 'lever' && p.state === 0 && Math.hypot(p.x - h.x, p.y - h.y) < LEVER_NEAR) this.pullLever(p);
    }
    // the fallen wordsmith: walk up, and the satchel is searched
    const b = this.level.body;
    if (b && b.state === 0 && Math.hypot(b.x - h.x, b.y - h.y) < 1.3) this.searchBody(b);
    // THE FIRST LEVELS: the quest item brought to the wordsmith in town: walk up to him, and his ring is lit
    // (HAND_IN: no longer by walking up; by using him, below)
    if (h.quest && this.level.town && !HAND_IN.on) {
      const st = this.level.stations.find((s) => s.kind === 'wordsmith');
      if (st && Math.hypot(st.x - h.x, st.y - h.y) < TUNE.useRange) this.lightRing(st.x, st.y);
    }
    // WORDMELDING: the Meldstone brought to the wordsmith: walk up to him, and he can meld
    // (HAND_IN: no longer by walking up; by using him)
    if (h.meld === 'stone' && this.level.town && !HAND_IN.on) {
      const st = this.level.stations.find((s) => s.kind === 'wordsmith');
      if (st && Math.hypot(st.x - h.x, st.y - h.y) < TUNE.useRange) this.takeMeldstone(st.x, st.y);
    }
    if (c.interact) {
      // (THE WAYS: standing on an awake waypoint, the use button warps him: to town, or from town back down)
      if (this.wayHere() && !this.leaving) {
        const W = this.level.ways;
        if (W && W.way && (!this.level.town || this.wayDepth >= 2)) {
          W.way.warpAt = this.time;
          this.leave(this.level.town ? 'warpBack' : 'warpTown');
          this.sfx('power', 0.7);
          return;
        }
      }
      // (ACT 1: at a stronghold's altar, while its door is shut, the use button opens it: the interface's)
      const hn = this.altarNear();
      if (hn >= 0) {
        this.emit({ t: 'altar', n: hn });
        return;
      }
      if (this.level.town) {
        // In town the rules only say which service was asked for; the interface opens its panel.
        // (HAND_IN: beside the one a quest item is for, using him gives it, in place of his panel)
        const st = this.stationNear();
        if (st && !this.handIn()) this.emit({ t: 'station', kind: st });
      } else if (!this.wayHere() && this.interactHint() !== null) this.leaveDungeon();
    }
  }

  /** The body in a character's first dungeon gives up its word: the character's first. */
  private searchBody(b: PropInst): void {
    b.state = 1;
    this.bodySearched = true;
    const w = FIRST_WORD[this.hero.cls].word;
    this.emit({ t: 'search', x: b.x, y: b.y });
    this.sfx('rare');
    // THE FIRST LEVELS: before the ring is lit, the satchel holds the quest item, not a word (the owner, 20:39)
    if (FIRST_LEVELS.on && !this.hero.ring) {
      this.hero.quest = 'heart';
      this.questPromptT = QUEST_ITEM.promptSecs;
      this.hero.potions = TUNE.potionMax;
      this.emit({ t: 'quest', x: b.x, y: b.y });
      // (since Version 19.6 the stone lies by his hand, the art chat's: art/quest3.ts)
      // (short: the line at the top says where it goes, for a few seconds; 9 Oct 2026, 22:12, "too in your face with all the text")
      this.msg(`You take ${QUEST_ITEM.the}. Bring it to the wordsmith.`, MSG.word);
      return;
    }
    this.drops.push({ x: b.x, y: b.y, kind: 'word', gold: 0, item: null, word: w, age: 0 });
    this.emit({ t: 'wordDrop', word: w, x: b.x, y: b.y });
    // (and their flasks: the second half of the dungeon is met fresh)
    this.hero.potions = TUNE.potionMax;
    this.msg('A fallen wordsmith. In the satchel: full flasks, and a WORD.', MSG.word);
  }

  /**
   * HAND_IN (game/defs.ts): what the hero would give the one he stands beside in town, if anything:
   * the master rune-stone, to the wordsmith. Null with HAND_IN off (then it is given by walking up).
   */
  handInNear(): 'stone' | 'meldstone' | 'quest' | null {
    if (!HAND_IN.on || !this.level.town || this.stationNear() !== 'wordsmith') return null;
    // (WORDMELDING: the Meldstone, to the wordsmith too)
    // (EXITS: and while his ring is dark, used, he gives the quest for the master rune-stone, once)
    return this.hero.quest ? 'stone' : this.hero.meld === 'stone' ? 'meldstone' : this.questDue() ? 'quest' : null;
  }

  /** EXITS: the wordsmith has a quest to give this hero: his ring is dark, the stone not found, the quest not yet given. */
  questDue(): boolean {
    return EXITS.on && FIRST_LEVELS.on && !this.practice && !this.hero.ring && !this.hero.quest && !this.questGiven;
  }

  /** EXITS: the wordsmith, at (x, y), gives the quest for the master rune-stone. */
  private giveQuest(x: number, y: number): void {
    this.questGiven = true;
    this.emit({ t: 'questGiven', x, y });
    this.sfx('power', 0.6);
    this.msg(QUEST_ITEM.ask, MSG.word);
  }

  /** HAND_IN: give what `handInNear` says, if anything. True if something was given. */
  private handIn(): boolean {
    const what = this.handInNear();
    const st = this.level.stations.find((s) => s.kind === 'wordsmith');
    if (!what || !st) return false;
    if (what === 'meldstone') this.takeMeldstone(st.x, st.y);
    else if (what === 'quest') this.giveQuest(st.x, st.y);
    else this.lightRing(st.x, st.y);
    return true;
  }

  /** WORDMELDING: the wordsmith, at (x, y), takes the Meldstone: he can meld from now on (and for every hero after, on this device). */
  private takeMeldstone(x: number, y: number): void {
    const h = this.hero;
    h.meld = 'open';
    if (!this.practice) this.meta.meld = true;
    this.emit({ t: 'stoneGiven', x, y });
    this.emit({ t: 'text', x, y, text: 'MELDING', color: MELD_DUST_COLOR });
    this.sfx('rare');
    this.msg('The wordsmith takes the MELDSTONE. He can meld words now.', MSG.word);
  }

  /** The town service within reach of the hero, if any (the nearest when several are). */
  stationNear(): Station | null {
    const h = this.hero;
    let best: Station | null = null;
    let bd = TUNE.useRange;
    for (const s of this.level.stations) {
      // (THE WAYS: the gate is walked through, not used)
      if (s.kind === 'gate' && this.level.ways) continue;
      const d = Math.hypot(s.x - h.x, s.y - h.y);
      if (d < bd) {
        bd = d;
        best = s.kind;
      }
    }
    return best;
  }

  /** What pressing "interact" would do right now, or null if nothing is in reach. */
  interactHint(): string | null {
    // (ACT 1: at a stronghold's altar)
    if (this.altarNear() >= 0) return 'Altar: give words to open the door';
    // (THE WAYS: on an awake waypoint)
    if (this.wayHere()) {
      if (!this.level.town) return 'Waypoint: to town';
      if (ENDLESS.on && this.endless > 0) return `Waypoint: to ${endlessName(this.endless)}`;
      if (this.wayDepth >= 2) return this.wayDepth >= 6 && FLOOR_NAMES.on ? `Waypoint: to ${floorTitle(this.wayDepth).level}` : `Waypoint: to dungeon ${this.wayDepth}`;
    }
    if (this.level.town) {
      const st = this.stationNear();
      if (!st) return null;
      // (HAND_IN: beside the one a quest item is for, his prompt says it is given)
      const giving = this.handInNear();
      if (giving) return giving === 'meldstone' ? MELD_HAND_IN : giving === 'quest' ? QUEST_ITEM.askPrompt : HAND_IN.prompt;
      return st === 'gate' ? `Gate: dungeon ${this.depth}` : st === 'wordsmith' ? 'Wordsmith' : st === 'armourer' ? 'Armourer' : st === 'mystic' ? 'Mystic' : st === 'lexicon' ? 'Lexicon' : st === 'stranger' ? 'Stranger' : 'Stash';
    }
    const p = this.level.portal;
    const h = this.hero;
    if (!p || p.state !== 1 || Math.hypot(p.x - h.x, p.y - h.y) > 1.8) return null;
    return 'Return to town';
  }

  /** Step through the portal the boss leaves behind. */
  private leaveDungeon(): void {
    // (ENDLESS MODE: from an endless level, on to the next)
    if (ENDLESS.on && this.inEndless) {
      this.nextEndless();
      return;
    }
    this.meta.bestDepth = Math.max(this.meta.bestDepth, this.depth);
    this.cleared++;
    this.depth++;
    this.enterTown();
    this.sfx('portal');
    this.msg(FLOOR_NAMES.on ? `${floorTitle(this.depth - 1).level} cleared` : `Dungeon ${this.depth - 1} cleared`, MSG.good);
    // the first time back, say what the town is for
    if (this.cleared === 1) this.msg('Sell to the armourer or the mystic. The gate burns words into the next dungeon. The Lexicon is the book of what you know.', MSG.plain);
  }

  // ===========================================================================================
  // The town's services. Each returns a reason (to show the player) when it cannot be done.

  /** Why a word cannot be laid on the gate, or null if it can. */
  planProblem(word: WordId): string | null {
    if (!(this.hero.words[word] > 0)) return 'No spare word';
    // (WORDMELDING: a melded word is for attacks only, for now, his words; RANK II likewise, as read)
    if (WORDS[word].kind === 'meld') return 'A melded word goes on attacks only';
    if (WORDS[word].kind === 'rank') return 'A ranked word goes on attacks only';
    // (THE FIRST LEVELS: no words on the first dungeon's monsters, his note of 21:05: a word laid
    // on its gate would be burned for nothing. A later hero may carry one from the Lexicon.)
    if (FIRST_LEVELS.on && !this.practice && this.depth <= 1) return FIRST_GATE;
    if (this.plan.length >= TUNE.planMax) return `At most ${TUNE.planMax} words`;
    if (this.plan.includes(word)) return 'Already burning';
    if (WORDS[word].element && this.plan.some((w) => WORDS[w].element)) return 'One element per dungeon';
    return null;
  }

  /** Gate: lay a spare word on the next dungeon. It is used up when the hero steps in (its boss does not hand it back). */
  planWord(word: WordId): string | null {
    const why = this.planProblem(word);
    if (why) return why;
    this.hero.words[word]--;
    this.plan.push(word);
    this.sfx('word');
    return null;
  }

  /** Gate: take a word back off the plan (free until the dungeon is entered). */
  unplanWord(i: number): void {
    const w = this.plan[i];
    if (!w) return;
    this.plan.splice(i, 1);
    this.hero.words[w]++;
    this.sfx('click');
  }

  private itemAt(ref: ItemRef): Item | null {
    return ref.kind === 'gear' ? this.hero.gear[ref.slot] : this.hero.bag[ref.i] ?? null;
  }

  /**
   * What burning `word` into this item could give: one or two outcomes, each with the range it
   * rolls in. Never something the piece already carries; none at all if it has no room left.
   */
  imbueChoices(ref: ItemRef, word: WordId): ImbueOption[] {
    const it = this.itemAt(ref);
    return it ? imbueOptionsFor(it, word) : [];
  }

  /** Why `word` cannot be burned into this item, or null if it can: nothing there, no room left on it, or it has what the word gives already. */
  imbueProblem(ref: ItemRef, word: WordId): string | null {
    // (THE FIRST LEVELS: nothing is wordsmithed before the ring is lit)
    if (!this.hero.ring && !this.practice) return DARK_RING;
    const it = this.itemAt(ref);
    return it ? imbueProblem(it, word) : 'Nothing there';
  }

  /**
   * Burn a spare word into a piece of gear. The word is used up, and what it becomes there is
   * rolled: which of its outcomes, and how strong. (The owner: "i dont want it to say exactly what
   * would happen, but maybe show the range of outcomes on gear".) A piece has room for four
   * properties, the ones it was found with and the words burned in since ("All items have room
   * for 4 mods. White starts with 0, blue 1-2, yellow 3-4"), so a word is added to what is there,
   * where until Version 13.2 it took the place of the one before. It can be done anywhere, from
   * the inventory.
   */
  imbue(ref: ItemRef, word: WordId): string | null {
    const h = this.hero;
    if (!h.ring && !this.practice) return DARK_RING;
    const it = this.itemAt(ref);
    if (!it) return 'Nothing there';
    if (!(h.words[word] > 0)) return 'No spare word';
    const why = imbueProblem(it, word);
    if (why) return why;
    const made = imbueItem(it, word, this.rng);
    if (!made) return 'That piece is full';
    h.words[word]--;
    if (ref.kind === 'gear') this.refresh();
    this.learn(word, 'gear');
    this.sfx('imbue');
    this.emit({ t: 'burned', word, item: it.name, text: modLines(made.mods, this.meta.limit).join(', ') });
    return null;
  }

  /** Something has been learned about a word by using it: the Lexicon keeps it. (Not in the practice room.) */
  private learn(word: WordId, use: 'front' | 'behind' | 'gear' | 'dungeon'): void {
    if (this.practice) return;
    const k = this.meta.known[word];
    // (WORDMELDING: a Lexicon made with MELD off has no page for a melded word: nothing to learn there)
    if (!k) return;
    k.found = true;
    k[use] = true;
  }

  /** Vendor: what an item sells for. */
  sellValue(it: Item): number {
    return Math.max(1, Math.floor(itemValue(it) * TUNE.sellRate));
  }

  /** Vendor: sell bag item `i`. The vendor keeps it for the rest of this visit (see `buyBack`). */
  sell(i: number): string | null {
    const h = this.hero;
    const it = h.bag[i];
    if (!it) return 'Nothing there';
    h.gold += this.sellValue(it);
    h.bag[i] = null;
    this.sold.push(it);
    // (the vendor has room for so many: the oldest goes for good)
    if (this.sold.length > TUNE.soldKept) this.sold.shift();
    this.sfx('gold');
    return null;
  }

  /** Vendor: take back piece `i` of what was sold on this visit, for what was paid for it. */
  buyBack(i: number): string | null {
    const h = this.hero;
    const it = this.sold[i];
    if (!it) return 'Nothing there';
    const price = this.sellValue(it);
    if (h.gold < price) return 'Not enough gold';
    const free = h.bag.indexOf(null);
    if (free < 0) return 'Bag is full';
    h.gold -= price;
    h.bag[free] = it;
    this.sold.splice(i, 1);
    this.sfx('buy');
    return null;
  }

  /** Vendor: buy shop item `i` into the bag. */
  buy(i: number): string | null {
    const h = this.hero;
    const it = this.shop[i];
    if (!it) return 'Sold';
    const price = itemValue(it);
    if (h.gold < price) return 'Not enough gold';
    const free = h.bag.indexOf(null);
    if (free < 0) return 'Bag is full';
    h.gold -= price;
    h.bag[free] = it;
    this.shop[i] = null;
    this.sfx('buy');
    return null;
  }

  // ---- the wordsmith's trade in words (Version 14.5: "The wordsmith should buy and sell words") ----

  /** Wordsmith: what one of his words costs on this visit: about what the last dungeon dropped in gold (TUNE.wordPrice). */
  wordPrice(): number {
    return TUNE.wordPrice * Math.max(1, this.cleared);
  }

  /** Wordsmith: what he pays for a word. */
  wordSellValue(): number {
    return Math.max(1, Math.floor(this.wordPrice() * TUNE.wordSellRate));
  }

  /** Wordsmith: buy the word in place `i` of his shelf. It joins the hero's spare words. */
  buyWord(i: number): string | null {
    const h = this.hero;
    if (!h.ring) return DARK_RING;
    const w = this.wordStock[i];
    if (!w) return 'Sold';
    const price = this.wordPrice();
    if (h.gold < price) return 'Not enough gold';
    h.gold -= price;
    h.words[w]++;
    this.wordStock[i] = null;
    if (!this.practice) this.meta.known[w].found = true;
    this.sfx('word');
    return null;
  }

  /**
   * WORDMELDING (game/melds.ts): why the wordsmith cannot meld these two spare words just now, or
   * null if he can: melding not open (the Meldstone not yet brought to him), not two damage words
   * of the hero's, or not the runedust it takes. (The practice room melds for nothing.)
   */
  meldProblem(a: WordId | null, b: WordId | null): string | null {
    const h = this.hero;
    if (!MELD.on) return 'Not yet';
    if (!h.ring) return DARK_RING;
    if (h.meld !== 'open' && !this.practice) return h.meld === 'stone' ? 'Give him the MELDSTONE first' : 'He needs the MELDSTONE to meld';
    const why = meldProblem(a, b);
    if (why || !a || !b) return why ?? 'Two words go in';
    if (h.words[a] <= 0 || h.words[b] <= 0) return 'No spare word';
    // (RANK II: two of the same word take two of it)
    if (a === b && h.words[a] < 2) return 'Two of the word go in';
    if (!this.practice && h.dust < MELD_TUNE.cost) return `Needs ${MELD_TUNE.cost} runedust`;
    return null;
  }

  /**
   * WORDMELDING: the wordsmith melds two spare words into one, for runedust. Both words are used
   * up; the melded word joins the hero's spare words, and the Lexicon knows it from now on. What
   * came of it is `melded` (for the wordsmith's half to show); `first` if it had not been made before.
   */
  meldWords(a: WordId | null, b: WordId | null): string | null {
    const why = this.meldProblem(a, b);
    if (why || !a || !b) return why ?? 'Two words go in';
    const m = meldOf(a, b);
    if (!m) return 'These do not meld';
    const h = this.hero;
    h.words[a]--;
    h.words[b]--;
    h.words[m] = (h.words[m] ?? 0) + 1;
    if (!this.practice) h.dust -= MELD_TUNE.cost;
    // (a Lexicon made before MELD was switched on has no page for it yet: one is made)
    if (!this.meta.known[m]) {
      this.meta.known[m] = { found: false, front: false, behind: false, gear: false, dungeon: false };
      this.meta.lexicon[m] = 0;
    }
    const first = !this.meta.known[m].found;
    // (found by making it: what it does in front and behind is known from now on)
    if (!this.practice) {
      const k = this.meta.known[m];
      k.found = true;
      k.front = true;
      k.behind = true;
    }
    this.melded = { word: m, first };
    this.sfx('rare');
    return null;
  }

  /** Wordsmith: sell him a spare word. He keeps it for the rest of this visit (see `buyBackWord`). */
  sellWord(word: WordId): string | null {
    const h = this.hero;
    if (!h.ring) return DARK_RING;
    if (!(h.words[word] > 0)) return 'No spare word';
    h.words[word]--;
    h.gold += this.wordSellValue();
    this.wordsSold.push(word);
    // (he has room for so many: the oldest goes for good)
    if (this.wordsSold.length > TUNE.wordsSoldKept) this.wordsSold.shift();
    this.sfx('gold');
    return null;
  }

  /** Wordsmith: take back word `i` of those sold to him on this visit, for what he paid for it. */
  buyBackWord(i: number): string | null {
    const h = this.hero;
    if (!h.ring) return DARK_RING;
    const w = this.wordsSold[i];
    if (!w) return 'Nothing there';
    const price = this.wordSellValue();
    if (h.gold < price) return 'Not enough gold';
    h.gold -= price;
    h.words[w]++;
    this.wordsSold.splice(i, 1);
    this.sfx('word');
    return null;
  }

  // ---- the stranger's gamble (Version 14.5: "a shady guy in the corner that will let you gamble for a random item") ----

  /** Stranger: what a throw for kind `k` (GAMBLE_KINDS) costs: so many times a plain piece of that kind at the vendors'. */
  gamblePrice(k: number): number {
    const kind = GAMBLE_KINDS[k];
    return kind ? Math.max(1, Math.round(plainValue(kind.slot, Math.max(1, this.power)) * TUNE.gambleMult)) : 0;
  }

  /**
   * Stranger: pay, and get a piece of kind `k` whose quality is the gamble: usually plain,
   * sometimes magic, now and then rare (TUNE.gambleOdds). It goes into the bag, and `won` says
   * where. The price is the same whatever comes out.
   */
  gamble(k: number): string | null {
    const h = this.hero;
    const kind = GAMBLE_KINDS[k];
    if (!kind) return 'Nothing there';
    const price = this.gamblePrice(k);
    if (h.gold < price) return 'Not enough gold';
    const free = h.bag.indexOf(null);
    if (free < 0) return 'Bag is full';
    const roll = this.rng.next();
    const odds = TUNE.gambleOdds;
    const rarity: Rarity = roll < odds.rare ? 2 : roll < odds.rare + odds.magic ? 1 : 0;
    const it = rollItem(Math.max(1, this.power), this.rng, { slot: kind.slot, rarity, weapons: kind.weapon ? [kind.weapon] : undefined });
    h.gold -= price;
    h.bag[free] = it;
    this.won = free;
    this.sfx(rarity >= 2 ? 'rare' : 'buy');
    return null;
  }

  // ---- what the town's people say (Version 14.5: "tag lines when you move close to them. Very sparsely") ----

  /**
   * One of the town's people speaks as the hero comes up to them: now and then, and never two in
   * a row (TAGS has the numbers). The dice are the ones the hero's own lines use, so that a line
   * said or not said changes nothing else.
   */
  private updateTags(): void {
    if (!TUNE.tradesOpen) return;
    const h = this.hero;
    for (const who of TOWN_FOLK) {
      const p = this.level.props.find((q) => q.kind === who);
      if (!p) continue;
      const near = Math.hypot(p.x - h.x, p.y - h.y) < TAGS.near;
      const was = this.tagNear.get(who) ?? false;
      this.tagNear.set(who, near);
      if (!near || was) continue;
      if (this.time - this.tagAllAt < TAGS.gapAll || this.time - (this.tagAt.get(who) ?? -1e9) < TAGS.gapOne) continue;
      if (!this.flair.chance(TAGS.chance)) continue;
      let said = this.tagSaid.get(who);
      if (!said) this.tagSaid.set(who, (said = new Set<string>()));
      let open = TAGS.lines[who].filter((l) => !said.has(l));
      if (!open.length) {
        // (every line of theirs has been said: they may all be said again, but not the last one first)
        const last = [...said].pop();
        said.clear();
        open = TAGS.lines[who].filter((l) => l !== last || TAGS.lines[who].length === 1);
      }
      if (!open.length) continue;
      const line = this.flair.pick(open);
      said.add(line);
      this.tagAt.set(who, this.time);
      this.tagAllAt = this.time;
      this.emit({ t: 'tag', who, text: line, x: p.x, y: p.y });
    }
  }

  /**
   * Lexicon: what keeping one more word there costs. Keeping words between characters is a
   * premium (the owner: "unused words stay. but i want that to be a premium"): the price doubles
   * with every word already kept.
   */
  keepCost(): number {
    let kept = 0;
    for (const w of WORD_IDS) kept += this.meta.lexicon[w];
    return TUNE.keepCost * 2 ** Math.min(20, kept);
  }

  /** Lexicon: put a spare word away, for gold. It will still be there after this character dies. */
  depositWord(word: WordId): string | null {
    const h = this.hero;
    if (!(h.words[word] > 0)) return 'No spare word';
    // (WORDMELDING: the Lexicon keeps the words as they are found; a melded word is not kept there, for now)
    if (WORDS[word].kind === 'meld') return 'The Lexicon keeps no melded word';
    if (WORDS[word].kind === 'rank') return 'The Lexicon keeps no ranked word';
    const cost = this.keepCost();
    if (h.gold < cost) return `Needs ${cost} gold`;
    h.gold -= cost;
    h.words[word]--;
    this.meta.lexicon[word]++;
    this.sfx('word');
    return null;
  }

  /** Lexicon: take a word out to carry (free). */
  withdrawWord(word: WordId): string | null {
    if (this.meta.lexicon[word] <= 0) return 'None in the Lexicon';
    this.meta.lexicon[word]--;
    this.hero.words[word]++;
    this.meta.known[word].found = true;
    this.sfx('word');
    return null;
  }

  /** Stash: put bag item `i` away for this or a later character. */
  stashItem(i: number): string | null {
    const it = this.hero.bag[i];
    if (!it) return 'Nothing there';
    const free = this.meta.stash.indexOf(null);
    if (free < 0) return 'Stash is full';
    this.meta.stash[free] = it;
    this.hero.bag[i] = null;
    this.sfx('equip');
    return null;
  }

  /** Stash: take item `i` out into the bag. */
  unstashItem(i: number): string | null {
    const it = this.meta.stash[i];
    if (!it) return 'Nothing there';
    const free = this.hero.bag.indexOf(null);
    if (free < 0) return 'Bag is full';
    this.hero.bag[free] = it;
    this.meta.stash[i] = null;
    this.sfx('equip');
    return null;
  }

  // ===========================================================================================
  // Things the player does in the panels

  /** THE SKILL TREES (game/talents.ts): why this talent cannot be taken now, or null if it can. */
  talentProblem(id: string): string | null {
    if (!TALENTS.on) return 'No talents yet';
    return takeProblem(this.hero.cls, this.hero.level, this.hero.talents, id);
  }

  /** Take a talent with a point: why not, or null when it is taken. */
  takeTalent(id: string): string | null {
    const why = this.talentProblem(id);
    if (why) return why;
    const h = this.hero;
    h.talents.push(id);
    this.refresh();
    this.emit({ t: 'talent', id });
    this.sfx('equip');
    return null;
  }

  /** What undoing a talent costs now: gold for each of the hero's levels (in town only). */
  unlearnPrice(): number {
    return TALENT_TUNE.unlearnPerLevel * this.hero.level;
  }

  /** Why talent `id` cannot be undone now, or null if it can: in town, for gold, and nothing taken may hang on it alone. */
  unlearnProblemNow(id: string): string | null {
    if (!TALENTS.on) return 'No talents yet';
    const why = unlearnProblem(this.hero.cls, this.hero.talents, id);
    if (why) return why;
    if (!this.level.town) return 'Undone in town only';
    if (this.hero.gold < this.unlearnPrice()) return `Needs ${this.unlearnPrice()} gold`;
    return null;
  }

  /** Undo talent `id`, for gold, giving its point back: why not, or null when it is done. */
  unlearnTalent(id: string): string | null {
    const why = this.unlearnProblemNow(id);
    if (why) return why;
    const h = this.hero;
    h.gold -= this.unlearnPrice();
    h.talents = h.talents.filter((t) => t !== id);
    this.refresh();
    this.sfx('gold');
    return null;
  }

  /** How many talent points are waiting to be spent. */
  talentsLeft(): number {
    return TALENTS.on ? Math.max(0, talentPoints(this.hero.level) - this.hero.talents.length) : 0;
  }

  /** THE SKILL TREES: whether this hero has taken talent `id` (never while their switch is off). */
  has(id: string): boolean {
    return TALENTS.on && this.hero.talents.includes(id);
  }

  /** (TALENTS2) Talent `id` taken, and doing what it did before it was remade: the switch off, or a talent that was kept. */
  private was(id: string): boolean {
    return this.has(id) && !remadeNow(id);
  }

  /** (TALENTS2) Talent `id` taken, remade, doing what its new card says. */
  private now(id: string): boolean {
    return this.has(id) && remadeNow(id);
  }

  // ---- THE SKILL TREES REMADE (game/talents.ts TALENTS2): what the new cards do ---------------------------------

  /** Whether ability `i` looses arrows (the bow's: a shot, a volley). */
  private arrowSkill(i: number): boolean {
    const s = this.hero.skills[i];
    const kind = s ? SKILLS[s.id].kind : null;
    return kind === 'projectile' || kind === 'volley';
  }

  /**
   * `m` thrown across the floor, away from (fromX, fromY) (toward it, `far` below 0), `far` tiles over `secs`; walls stop
   * it. A boss stands his ground, and so does one in the middle of an act of its own. `ice`: Deep Freeze's slide, frozen,
   * freezing what it slides into.
   */
  private throwMonster(m: Monster, fromX: number, fromY: number, far: number, secs = 0.2, ice = false): void {
    if (m.dead || m.boss || m.state === 'act' || this.shutIn(m)) return;
    let dx = m.x - fromX;
    let dy = m.y - fromY;
    const len = Math.hypot(dx, dy);
    if (len < 0.01) {
      dx = -m.fx || 1;
      dy = -m.fy;
    } else {
      dx /= len;
      dy /= len;
    }
    m.thrown = { vx: (dx * far) / secs, vy: (dy * far) / secs, t: secs, ...(ice ? { ice: true } : {}) };
  }

  /** A thrown monster goes on its way this frame; stopped by a wall, it stops. Deep Freeze's frozen one freezes what it touches. */
  private flyThrown(m: Monster, dt: number): void {
    const T = m.thrown;
    if (!T) return;
    const k = Math.min(dt, Math.max(0, T.t));
    const x0 = m.x;
    const y0 = m.y;
    this.slide(m, Math.min(m.r, 0.42), T.vx * k, T.vy * k, m.kind === 'bat' ? this.level.open : this.level.walk);
    T.t -= dt;
    if (T.ice) {
      for (const o of this.monsters) {
        if (o === m || o.dead || o.boss || o.frozenT > 0 || this.shutIn(o)) continue;
        if (Math.hypot(o.x - m.x, o.y - m.y) <= o.r + m.r) this.freezeMonster(o);
      }
    }
    const meant = Math.hypot(T.vx, T.vy) * k;
    if (T.t <= 0 || (meant > 0.01 && Math.hypot(m.x - x0, m.y - y0) < meant * 0.3)) m.thrown = undefined;
  }

  /** Frozen where it stands (never a boss), as a second chilling hit freezes it. */
  private freezeMonster(m: Monster): void {
    if (m.dead || m.boss) return;
    m.frozenT = Math.max(m.frozenT, m.elite ? 0.6 : 1.1);
    m.freezeImmune = 4;
    m.chill = Math.max(m.chillT > 0 ? m.chill : 0, 0.3);
    m.chillT = 2.5;
    if (m.state === 'charge') this.endCharge(m);
    this.emit({ t: 'freeze', x: m.x, y: m.y });
  }

  /** (Hearth) He stands in fire of his own making: a patch of burning ground of his. */
  private inOwnFire(): boolean {
    const h = this.hero;
    return this.zones.some((z) => z.kind === 'burn' && !z.hostile && Math.hypot(h.x - z.x, h.y - z.y) <= z.r);
  }

  /** (Drilled Lunge) What the lunge passes now is struck, each once: as hard as the landing's blow. */
  private lungeThrough(mv: { hit?: number[] }): void {
    const h = this.hero;
    const D = TALENT_TUNE.drilledLunge;
    const hit = mv.hit ?? (mv.hit = []);
    const r = h.skills[2].r;
    for (const m of this.monsters) {
      if (m.dead || hit.includes(m.id) || this.shutIn(m)) continue;
      if (Math.hypot(m.x - h.x, m.y - h.y) > m.r + TUNE.heroRadius + D.reach) continue;
      hit.push(m.id);
      this.hitMonster(m, 2, r.countDmg * D.share, hit.length > 1);
    }
  }

  /** (Kindling) The ground at (x, y) set burning a while, unless a patch of it burns close by already. */
  private kindle(x: number, y: number): void {
    const K = TALENT_TUNE.kindling2;
    if (this.zones.some((z) => z.from === 'kindling' && Math.hypot(z.x - x, z.y - y) < K.apart)) return;
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    this.zones.push({ x, y, r: K.r, t: 0, dur: K.secs, kind: 'burn', element: 'fire', dmg: this.talentHit('fire', K.share), slow: 0, tick: 0.2, hostile: false, skill: -1, words: [], from: 'kindling' });
    this.emit({ t: 'zone', kind: 'burn', x, y, r: K.r, el: 'fire' });
  }

  /** (Charged) The charge goes off: a bolt from the enemy struck at (x, y), leaping between up to five. */
  private releaseCharge(m: Monster, x: number, y: number): void {
    const C = TALENT_TUNE.charged2;
    this.charge = 0;
    const hit = this.talentHit('lightning', C.share);
    const done = new Set<number>([m.id]);
    let px = x;
    let py = y;
    this.emit({ t: 'arc', x0: x, y0: y, x1: x, y1: y, sky: true });
    if (!m.dead) {
      m.shockT = TALENT_TUNE.shockSecs;
      this.damageMonster(m, hit, 'lightning', false, -1);
    }
    for (let n = 1; n < C.n; n++) {
      let best: Monster | null = null;
      let bd = C.reach;
      for (const o of this.monsters) {
        if (o.dead || done.has(o.id) || this.shutIn(o)) continue;
        const dd = Math.hypot(o.x - px, o.y - py);
        if (dd < bd) {
          bd = dd;
          best = o;
        }
      }
      if (!best) break;
      done.add(best.id);
      this.emit({ t: 'arc', x0: px, y0: py, x1: best.x, y1: best.y });
      px = best.x;
      py = best.y;
      best.shockT = TALENT_TUNE.shockSecs;
      this.damageMonster(best, hit, 'lightning', false, -1);
    }
    this.sfx('thunder', 0.6);
  }

  /** (Footwork, Windrunner) His move, a lunge or a roll, ready again: a charge of it back. */
  private readyAgain(kind: 'leap' | 'roll'): void {
    const s = this.hero.skills[2];
    if (!s || SKILLS[s.id].kind !== kind || s.charges >= s.maxCharges) return;
    s.charges++;
    s.cd = s.charges < s.maxCharges ? s.r.cooldown : 0;
  }

  /** (Venom) A poisoned enemy dies in a cloud of its poison, that poisons those near as it was poisoned. */
  private venomCloud(m: Monster): void {
    const V = TALENT_TUNE.venom2;
    if (!this.roomForZone() || !this.onFloor(m.x, m.y)) return;
    this.zones.push({ x: m.x, y: m.y, r: V.r, t: 0, dur: V.dur, kind: 'venom', element: 'phys', dmg: m.poisonDps, slow: 0, tick: 0.2, hostile: false, skill: m.lastSkill, words: [], from: '' });
    this.emit({ t: 'zone', kind: 'venom', x: m.x, y: m.y, r: V.r, el: 'phys' });
  }

  /** (Overload) A shocked enemy's shock passes on as it dies: a jolt to the three nearest. */
  private passShock(m: Monster): void {
    const O = TALENT_TUNE.overload2;
    const near = this.monsters
      .filter((o) => !o.dead && o !== m && !this.shutIn(o) && Math.hypot(o.x - m.x, o.y - m.y) <= O.reach)
      .sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y))
      .slice(0, O.n);
    const jolt = this.talentHit('lightning', O.share);
    for (const o of near) {
      this.emit({ t: 'arc', x0: m.x, y0: m.y, x1: o.x, y1: o.y });
      o.shockT = TALENT_TUNE.shockSecs;
    }
    for (const o of near) this.damageMonster(o, jolt, 'lightning', false, -1);
    if (near.length) this.sfx('zap', 0.6);
  }

  /** (Rime) An enemy dying on Frost's ice: the whole patch shatters, freezing every enemy on it. */
  private rimeShatter(m: Monster): void {
    const k = this.zones.findIndex((z) => z.kind === 'ice' && !z.hostile && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r * 0.5);
    if (k < 0) return;
    const z = this.zones[k];
    this.zones.splice(k, 1);
    this.emit({ t: 'burst', x: z.x, y: z.y, r: z.r, el: 'frost', style: 'nova' });
    this.sfx('shatter', 0.8);
    for (const o of this.monsters) if (!o.dead && o !== m && !this.shutIn(o) && Math.hypot(o.x - z.x, o.y - z.y) <= z.r + o.r * 0.5) this.freezeMonster(o);
  }

  /** (Shieldwall) Guarding's shield breaks outward: everything near thrown back, and stunned. */
  private shieldBurst(): void {
    const h = this.hero;
    const S = TALENT_TUNE.shieldwall2;
    this.emit({ t: 'burst', x: h.x, y: h.y, r: S.r, el: 'phys', style: 'shock' });
    this.emit({ t: 'shake', amount: 3 });
    this.sfx('slam', 0.7);
    for (const m of this.monsters) {
      if (m.dead || this.shutIn(m) || Math.hypot(m.x - h.x, m.y - h.y) > S.r + m.r) continue;
      this.stunMonster(m, S.secs);
      this.throwMonster(m, h.x, h.y, S.far);
    }
  }

  /** (Split Shot) An arrow that killed `m` splits into three where it fell, flying on in a fan; they split no more. */
  private splitArrow(p: Projectile, m: Monster): void {
    const S = TALENT_TUNE.splitShot2;
    const base = Math.atan2(p.vy, p.vx);
    const sp = Math.hypot(p.vx, p.vy);
    for (let k = 0; k < S.n; k++) {
      const a = base + (k - (S.n - 1) / 2) * S.fan;
      this.projectiles.push({
        x: m.x + Math.cos(a) * (m.r + 0.15), y: m.y + Math.sin(a) * (m.r + 0.15), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: p.r, dist: S.far, hostile: false, dmg: p.dmg, element: p.element, look: 'arrow', pierce: false, hit: [m.id], volley: true,
        skill: p.skill, trail: 0, words: p.words, runed: true, clouded: true, mighted: true, left: true, age: 0, from: '', n: 0, split: true, flown: p.flown ?? 0,
      });
    }
  }

  /** (Searing) Fire spreads: every enemy touching a burning one is set alight, as hard. */
  private spreadFire(): void {
    const S = TALENT_TUNE.searing2;
    const burning = this.monsters.filter((m) => !m.dead && m.burnT > 0);
    for (const b of burning) {
      for (const o of this.monsters) {
        if (o === b || o.dead || o.burnT > 0 || this.shutIn(o)) continue;
        if (Math.hypot(o.x - b.x, o.y - b.y) > b.r + o.r + S.touch) continue;
        this.emit({ t: 'ignite', x: o.x, y: o.y });
        o.burnDps = b.burnDps;
        o.burnT = 3;
        o.lastSkill = b.lastSkill;
      }
    }
  }

  /** A hit a talent makes by itself (Storm Warp, Stormcaller): `share` of the hero's weapon hit, of element `el`. */
  private talentHit(el: Element, share: number): number {
    const h = this.hero;
    const st = h.d.stats;
    const pct = el === 'fire' ? st.firePct : el === 'frost' ? st.frostPct : el === 'lightning' ? st.lightPct : st.physPct;
    return Math.max(1, Math.round(((h.d.dmgMin + h.d.dmgMax) / 2) * share * (1 + (st.dmgPct + pct) / 100)));
  }

  /** How high Power's and Frenzied's stacks go: five, eight with Cadence. */
  private stackMax(): number {
    return this.has('cadence') ? TALENT_TUNE.cadence : FRENZY.max;
  }

  /** What the talents add to the hero's speed now (%): Momentum after a kill, Windrunner after a roll. */
  private talentSpeed(): number {
    return (this.footworkT > 0 ? TALENT_TUNE.footwork.speed : 0) + (this.windT > 0 ? TALENT_TUNE.windrunner.speed : 0);
  }

  /** The talents' own clocks, each frame: standing still, the speeds wearing off, Stormcaller's bolts. */
  private updateTalents(dt: number, walked: number): void {
    const h = this.hero;
    this.stillT = walked > 0.001 || h.move ? 0 : this.stillT + dt;
    if (this.footworkT > 0) this.footworkT -= dt;
    if (this.windT > 0) this.windT -= dt;
    // (THE SKILL TREES REMADE: Charged, a charge gathered as he moves; full, it sparks round him)
    if (this.now('charged') && !this.level.town && !this.over) {
      const C = TALENT_TUNE.charged2;
      if (this.charge < 1) {
        this.charge = Math.min(1, this.charge + walked / C.full);
        this.sparkT = 0;
      } else {
        this.sparkT -= dt;
        if (this.sparkT <= 0) {
          this.sparkT = C.spark;
          this.emit({ t: 'spark', x: h.x, y: h.y, el: 'lightning', n: 3 });
        }
      }
    }
    if (this.has('stormcaller') && !this.level.town && !this.over) {
      this.stormT -= dt;
      if (this.stormT <= 0) {
        const T = TALENT_TUNE.stormcaller;
        let best: Monster | null = null;
        let bd: number = T.reach;
        for (const m of this.monsters) {
          if (m.dead || m.state === 'sleep' || this.shutIn(m)) continue;
          const dd = Math.hypot(m.x - h.x, m.y - h.y);
          if (dd < bd && this.sees(h.x, h.y, m.x, m.y)) {
            bd = dd;
            best = m;
          }
        }
        if (best) {
          this.emit({ t: 'arc', x0: best.x, y0: best.y, x1: best.x, y1: best.y, sky: true });
          this.sfx('thunder', 0.5);
          best.shockT = TALENT_TUNE.shockSecs;
          this.damageMonster(best, this.talentHit('lightning', T.share), 'lightning', false, -1);
          this.stormT = T.every;
        } else this.stormT = 0.3;
      }
    }
  }

  chooseAttr(a: Attr): void {
    const h = this.hero;
    if (h.pending <= 0) return;
    h.pending--;
    h.attrs[a] += TUNE.attrPerLevel;
    this.refresh();
    h.life = h.d.maxLife;
    h.mana = h.d.maxMana;
  }

  /** Why the hero cannot use an item, or null if they can. */
  useProblem(it: Item): string | null {
    // (no weapon is any one class's own: the owner, "I need all weapons to be able to be equipped on all characters")
    const h = this.hero;
    if (it.reqLevel > h.level) return `Needs level ${it.reqLevel}`;
    return null;
  }

  /** Where an item would be worn. A ring takes the first empty ring slot, else the first. */
  slotFor(it: Item): EquipSlot | null {
    if (it.slot === 'ring') return !this.hero.gear.ring1 ? 'ring1' : !this.hero.gear.ring2 ? 'ring2' : 'ring1';
    return it.slot;
  }

  /**
   * Equip bag item `i`. Returns a reason if it cannot be done. `want`: for a ring, the finger it
   * was put on (a ring dragged onto one of the two ring slots goes on that one).
   */
  equipFromBag(i: number, want: EquipSlot | null = null): string | null {
    const h = this.hero;
    const it = h.bag[i];
    if (!it) return null;
    const why = this.useProblem(it);
    if (why) return why;
    const slot = it.slot === 'ring' && (want === 'ring1' || want === 'ring2') ? want : this.slotFor(it);
    if (!slot) return 'Cannot be worn';
    if (it.slot === 'offhand' && !canPair(h.gear.mainhand, it)) {
      return it.offhand === 'shield' ? 'Needs a one-handed sword' : it.offhand === 'quiver' ? 'Needs a bow' : 'Needs a wand';
    }
    const old = h.gear[slot];
    // A new main hand may not suit the current off hand: that piece goes back to the bag.
    if (it.slot === 'mainhand' && h.gear.offhand && !canPair(it, h.gear.offhand)) {
      const spare = h.bag.findIndex((b, k) => b === null && k !== i);
      if (spare < 0) return 'Bag is full';
      h.bag[spare] = h.gear.offhand;
      h.gear.offhand = null;
    }
    h.gear[slot] = it;
    h.bag[i] = old;
    this.refresh();
    this.sfx('equip');
    return null;
  }

  /** Take off what is worn in `slot`. `to`: the cell of the bag it was dragged to (it goes there if that cell is empty, else to the first empty one). */
  unequip(slot: EquipSlot, to = -1): string | null {
    const h = this.hero;
    const it = h.gear[slot];
    if (!it) return null;
    const needs = slot === 'mainhand' && h.gear.offhand ? 2 : 1;
    if (h.bag.filter((b) => b === null).length < needs) return 'Bag is full';
    h.bag[to >= 0 && to < h.bag.length && h.bag[to] === null ? to : h.bag.indexOf(null)] = it;
    h.gear[slot] = null;
    if (needs === 2 && h.gear.offhand) {
      h.bag[h.bag.indexOf(null)] = h.gear.offhand;
      h.gear.offhand = null;
    }
    this.refresh();
    this.sfx('equip');
    return null;
  }

  /** Move bag item `i` to cell `j` of the bag; if something lies there, the two change places. */
  moveInBag(i: number, j: number): void {
    const b = this.hero.bag;
    if (i === j || i < 0 || j < 0 || i >= b.length || j >= b.length) return;
    const it = b[i];
    b[i] = b[j];
    b[j] = it;
  }

  /** Drop bag item `i` on the floor a little ahead of the hero. */
  dropFromBag(i: number): void {
    const h = this.hero;
    const it = h.bag[i];
    if (!it) return;
    h.bag[i] = null;
    let x = h.x + h.fx * 1.4;
    let y = h.y + h.fy * 1.4;
    if (!this.isOpen(x, y)) {
      x = h.x;
      y = h.y;
    }
    this.drops.push({ x, y, kind: 'item', gold: 0, item: it, word: null, age: -2.5 });
    this.sfx('pickup', 0.5);
  }

  // ===========================================================================================
  // Words on attacks
  //
  // The owner first had every word used up wherever it went ("any word you socket is used up"),
  // then thought again: "i think you were right about the words being able to be removed from the
  // skills. if skills are going to change with gear and weapons, the word should be removable.
  // using a word to modify a stat on an item should still use up the word".
  // So a word on an attack is only lent to it: it can be taken out and put somewhere else, and a
  // word set in its place sends it back to the pouch. Gear and dungeons are where words are spent.

  private group(r: SlotRef): (WordId | null)[] | null {
    const s = this.hero.skills[r.skill];
    if (!s || !SKILLS[s.id].sockets) return null;
    const g = r.side === 'front' ? s.front : s.behind;
    return r.idx >= 0 && r.idx < g.length ? g : null;
  }

  /** Why this spare word cannot be set into that exact socket, or null if it can. */
  placeProblem(to: SlotRef, word: WordId): string | null {
    const g = this.group(to);
    if (!g) return 'No socket there';
    if (!(this.hero.words[word] > 0)) return 'No spare word';
    if (g[to.idx] === word) return 'Already there';
    // what the side would hold with the word in that place (whatever was there has gone back to the pouch)
    const after = g.slice();
    after[to.idx] = word;
    const ws = after.filter((w): w is WordId => w !== null);
    if (new Set(ws).size !== ws.length) return 'Already there';
    // (ONE DAMAGE WORD A SIDE: his answer, 8 Oct 2026, 16:53; before Version 19.3, one element a side)
    // (WORDMELDING: a melded word takes that place)
    if (ws.filter((w) => isDamageWord(w)).length > 1) return 'One damage word per side';
    return null;
  }

  /** The word that setting another into this socket would send back to the pouch (none if the socket is empty). */
  displaced(to: SlotRef): WordId | null {
    const g = this.group(to);
    return g ? g[to.idx] ?? null : null;
  }

  /**
   * Set a spare word into an exact socket. A word that was there goes back to the pouch.
   * Returns a reason if it cannot be done.
   */
  placeWord(to: SlotRef, word: WordId): string | null {
    const why = this.placeProblem(to, word);
    if (why) return why;
    const h = this.hero;
    const g = this.group(to) as (WordId | null)[];
    const back = g[to.idx];
    g[to.idx] = word;
    h.words[word]--;
    if (back) h.words[back]++;
    this.refresh();
    this.sfx('word');
    this.learn(word, to.side);
    this.emit({ t: 'worded', word, name: h.skills[to.skill].r.name, skill: to.skill, side: to.side });
    const G = this.guide;
    if (G) {
      const firstWord = !G.set;
      // (the prompt follows the word: moved to the other attack, that is the one to try)
      G.set = { skill: to.skill, uses: h.skills[to.skill].uses };
      if (firstWord) {
        // A new player's first word is on. In a dungeon, the dead rise for it; anywhere else there is nothing more to show.
        // (THE FIRST LEVELS: it is set in town, at the wordsmith's, and that is the end of the lesson: his answer, 22:19, "No special moment")
        if (this.inDungeon) this.after(0.9, () => this.rise());
        else this.endGuide();
      }
    }
    return null;
  }

  /** Set a spare word into the first free socket on that side of an attack. Returns a reason if it cannot be done. */
  socket(skill: number, side: 'front' | 'behind', word: WordId): string | null {
    const h = this.hero;
    const s = h.skills[skill];
    if (!s || !(h.words[word] > 0)) return 'No spare word';
    const group = side === 'front' ? s.front : s.behind;
    const why = socketProblem(group, word);
    if (why) return why;
    return this.placeWord({ skill, side, idx: group.indexOf(null) }, word);
  }

  /** Take a word back out of an attack: it is a spare word again. Returns a reason if there is nothing to take. */
  unsocket(skill: number, side: 'front' | 'behind', idx: number): string | null {
    const h = this.hero;
    const g = this.group({ skill, side, idx });
    const w = g ? g[idx] : null;
    if (!g || !w) return 'Nothing there';
    g[idx] = null;
    h.words[w]++;
    this.refresh();
    this.sfx('equip');
    return null;
  }

  /**
   * Has this character put a word to work yet: is one set in an attack, or burned into a piece
   * that is worn or carried? (Until then the first word found is offered a place: updateDrops.)
   */
  wordAtWork(): boolean {
    const h = this.hero;
    if (h.skills.some((s) => s.front.some((w) => w !== null) || s.behind.some((w) => w !== null))) return true;
    return [...EQUIP_SLOTS.map((slot) => h.gear[slot]), ...h.bag].some((it) => !!it && it.imbues.length > 0);
  }

  /** Is there a free socket somewhere that this word may go into? */
  placeable(word: WordId): boolean {
    for (const s of this.hero.skills) {
      if (!SKILLS[s.id].sockets) continue;
      if (socketProblem(s.front, word) === null || socketProblem(s.behind, word) === null) return true;
    }
    return false;
  }

  /** The owner is trying both: switch between cooldowns and mana as the limit on the slow abilities. */
  setLimit(limit: Limit): void {
    this.meta.limit = limit;
    this.refresh();
    const h = this.hero;
    h.mana = h.d.maxMana;
    for (const s of h.skills) {
      s.cd = 0;
      s.charges = s.maxCharges;
    }
  }
}

const RARITY_HEX = ['#cfc6bc', '#6f8cff', '#ffe070', '#ff8a3a'] as const;

export function rarityColor(r: Rarity): string {
  return RARITY_HEX[r];
}

export function rarityName(r: Rarity): string {
  return RARITY_NAMES[r];
}

export type { PropInst, Trap };
