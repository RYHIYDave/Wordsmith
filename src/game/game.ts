// The rules of the game: one Game object holds a run (one character's life) and advances it
// frame by frame. It knows nothing about drawing or input; it reads Controls and emits GameEvents.

import type { Sfx } from '../engine/audio';
import { RNG } from '../engine/rng';
import { CLASSES, COMBO, FIRST_DUNGEON, FIRST_LEVELS, FIRST_WORD, FRENZY, GAMBLE_KINDS, GUARD, GUIDE, HEAVY, LIMITS, MANA_MODE, MONSTERS, MOVE_OPENS, MSG, PRACTICE, PRECISE, QUEST_ITEM, QUIPS, SKILLS, TAGS, TOWN_FOLK, TUNE, VENDORS, VENDOR_IDS, WORDS, firstWordSkill, scaleDmg, scaleLife, skillsFor, socketCount, weaponAttr, xpToNext } from './defs';
import type { Limit, MonsterDef } from './defs';
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
import { TALENTS, TALENT_TUNE, cleanTalents, takeProblem, talentMods, talentPoints, unlearnProblem } from './talents';
import type { HazardInst } from './traps';
import { LANE_HELP, STAIR_HELP, mayOverlap } from './height';
import { UNREACHABLE, flowDir, flowField, lineOfSight, scatter } from './nav';
import { armorReduction, derive } from './stats';
import { AIM_MODES } from './state';
import type { AimMode, Channel, Controls, Drop, Familiar, GameEvent, Guide, GuideRow, GuideStep, Hero, Level, Meta, Monster, OrbInst, Projectile, PropInst, SkillState, SlotRef, Station, TownVoice, Trap, VendorId, Volley, WordLore, Zone } from './state';
import { ATTRS, CLASS_IDS, EQUIP_SLOTS, RARITY_NAMES, T_FLOOR, VOICE_IDS, WEAPONS, WORD_IDS } from './types';
import type { Attr, ClassId, Element, EquipSlot, Item, MonsterKind, Rarity, VoiceId, WeaponKind, WordId } from './types';
import { resolveSkill, socketProblem } from './words';

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
  for (const w of WORD_IDS) {
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
  for (const w of WORD_IDS) {
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
  out.taught = m.taught === true;
  // (THE FIRST LEVELS: the ring is lit on a device the first time a hero brings the MASTER RUNE-STONE. A
  // device that saved before Version 19.5 has never had it lit: its next new hero goes for it, as
  // the owner saw in the pictures, and it stays lit for the heroes after. A hero saved before then
  // keeps his own ring, and his words, whatever the device's: see `restore`.)
  out.ring = m.ring === true;
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
  /** The orb set down by the staff's quick attack (one at a time), and the mage's familiars. */
  orbs: OrbInst[] = [];
  familiars: Familiar[] = [];
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
  private waveT = 0;
  private waveN = 0;
  /** The first dungeon's prompts, while a new player is being shown the game (see Guide in state.ts). */
  guide: Guide | null = null;
  /** The fallen wordsmith of this character's first dungeon has been searched. */
  bodySearched = false;
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
  private nextId = 1;
  /** Ids for orbs and familiars (the pictures tell them apart by it). */
  private nextThing = 1;
  private bagFullT = 0;
  private denyT = 0;
  /** Precise behind: for each ability, the use (its count of uses) that has already marked an enemy. */
  private marked: number[] = [-1, -1, -1];
  /**
   * THE SKILL TREES (game/talents.ts): seconds the hero has stood still (Steady Aim); seconds left
   * of Momentum's and Windrunner's speed; seconds to Stormcaller's next bolt; Unbreakable spent in
   * this dungeon; shots of the bow since the last split (Split Shot).
   */
  private stillT = 0;
  private momentumT = 0;
  private windT = 0;
  private stormT = 0;
  private unbroken = false;
  private shots = 0;
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
    g.enterDungeon();
    return g;
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
    if (WORD_IDS.some((w) => h.words[w] > 0)) return 'smith';
    if (this.drops.some((d) => d.kind === 'word' && Math.hypot(d.x - h.x, d.y - h.y) < GUIDE.sight)) return 'take';
    if (fight) return null;
    // (THE FIRST LEVELS: the quest item, to be taken to town and to the wordsmith)
    if (FIRST_LEVELS.on && h.quest) return L.town ? 'ring' : 'carry';
    const b = L.body;
    if (b && b.state === 0 && Math.hypot(b.x - h.x, b.y - h.y) < GUIDE.sight && L.visible[b.ty * L.floor.w + b.tx] === 1) return 'body';
    if (G.walked < GUIDE.steps) return 'move';
    return null;
  }

  /** The average hit of the character's quick attack with no word on it: what the guide's soft monsters are measured against. */
  private bareHit(): number {
    const h = this.hero;
    const r = resolveSkill(SKILLS[h.skills[0].id], [], [], weaponAttr(this.weapon()), h.d, this.meta.limit);
    const st = h.d.stats;
    return ((h.d.dmgMin + h.d.dmgMax) / 2) * r.dmgMult * (1 + (st.dmgPct + st.physPct) / 100);
  }

  private updateGuide(dt: number, moved: number): void {
    const G = this.guide;
    if (!G) return;
    const h = this.hero;
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
    return {
      v: 1, cls: h.cls, seed: this.seed, level: h.level, xp: h.xp, pending: h.pending, attrs: { ...h.attrs },
      gear: { ...h.gear }, bag: [...h.bag], words: { ...h.words },
      sockets: h.skills.map((s) => ({ front: [...s.front], behind: [...s.behind] })),
      gold: h.gold, potionKills: h.potionKills, depth: this.depth, cleared: this.cleared, kills: this.kills, runTime: this.runTime, maxUid,
      plan: [...this.plan],
      body: this.bodySearched,
      voice: this.voice,
      guide: this.guide ? { ...this.guide, set: this.guide.set ? { ...this.guide.set } : null } : null,
      wordsBought: this.wordStock.flatMap((w, i) => (w === null ? [i] : [])),
      // (nothing of the modes is written while their switch is off: a hero made before then is MODE_BEFORE)
      ...(MODES.on ? { mode: this.mode } : {}),
      // (nor of the first levels while theirs is: a hero saved before them has the ring lit)
      ...(FIRST_LEVELS.on ? { ring: h.ring, quest: h.quest } : {}),
      // (THE SKILL TREES: none can be taken while their switch is off, so nothing is written then)
      ...(h.talents.length ? { talents: [...h.talents] } : {}),
    };
  }

  /** Rebuild a run from a save. Throws if the save is not one this version understands. */
  static restore(s: RunSave, meta?: Meta): Game {
    if (!s || s.v !== 1 || !CLASS_IDS.includes(s.cls)) throw new Error('unreadable save');
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
    for (const w of WORD_IDS) h.words[w] = Math.max(0, Math.floor(num(s.words?.[w], 0)));
    h.skills.forEach((sk, i) => {
      const so = s.sockets?.[i];
      const clean = (a: unknown): (WordId | null)[] => (Array.isArray(a) ? a.map((w) => (WORD_IDS.includes(w as WordId) ? (w as WordId) : null)) : []);
      sk.front = SKILLS[sk.id].sockets ? clean(so?.front) : [];
      sk.behind = SKILLS[sk.id].sockets ? clean(so?.behind) : [];
    });
    h.gold = Math.max(0, Math.floor(num(s.gold, 0)));
    h.potionKills = Math.max(0, num(s.potionKills, 0));
    g.depth = Math.max(1, Math.floor(num(s.depth, 1)));
    g.cleared = Math.max(0, Math.floor(num(s.cleared, 0)));
    g.kills = Math.max(0, Math.floor(num(s.kills, 0)));
    if (VOICE_IDS.includes(s.voice as VoiceId)) g.voice = s.voice as VoiceId;
    g.mode = HERO_MODES.includes(s.mode as HeroMode) ? (s.mode as HeroMode) : MODE_BEFORE;
    g.runTime = Math.max(0, num(s.runTime, 0));
    if (Array.isArray(s.plan)) {
      for (const w of s.plan) if (WORD_IDS.includes(w) && g.plan.length < TUNE.planMax && !g.plan.includes(w)) g.plan.push(w);
    }
    g.bodySearched = s.body === true;
    // (THE FIRST LEVELS: a save from before them, or made with them off, has the ring lit)
    h.ring = !FIRST_LEVELS.on || s.ring !== false;
    h.quest = s.quest === 'heart' ? 'heart' : null;
    // (THE SKILL TREES: only this class's talents, each once, in an order that could have been taken)
    h.talents = cleanTalents(h.cls, h.level, s.talents);
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
    for (const w of WORD_IDS) words[w] = 0;
    const attrs: Record<Attr, number> = { ...c.attrs };
    const d = derive(cls, 1, attrs, gear, this.meta.limit);
    // both attacks are the weapon's; the evasive move is the character's own
    const weapon = gear.mainhand ? gear.mainhand.weapon : null;
    const skills = skillsFor(cls, weapon).map((id, i): SkillState => ({
      id, front: [], behind: [], cd: 0, charges: 1, maxCharges: 1, uses: 0,
      r: resolveSkill(SKILLS[id], [], [], i < 2 ? weaponAttr(weapon) : c.primary, d),
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
      talents: [],
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
   * THE QUEST ITEM BROUGHT TO THE WORDSMITH: his ring is lit (for this hero and on this device), he
   * gives the hero's first word, and the slots open. Called when the hero comes up to him with it.
   */
  private lightRing(x: number, y: number): void {
    const h = this.hero;
    h.quest = null;
    h.ring = true;
    this.meta.ring = true;
    const w = FIRST_WORD[h.cls].word;
    h.words[w]++;
    this.refresh();
    if (!this.practice) this.meta.known[w].found = true;
    this.emit({ t: 'ring', x, y });
    this.emit({ t: 'wordGot', word: w });
    this.sfx('rare');
    this.msg(`The ring is lit. The wordsmith gives you a word: ${WORDS[w].name.toUpperCase()}.`, MSG.word);
    // (as a first word found is: the inventory opens for it at once, and the lesson shows where it goes)
    if (!this.wordAtWork() && this.placeable(w)) this.offer = w;
  }

  /** Rebuild everything derived from level, attributes, gear and socketed words. */
  refresh(): void {
    const h = this.hero;
    h.d = derive(h.cls, h.level, h.attrs, h.gear, this.meta.limit, talentMods(h.cls, h.talents));
    // (THE SKILL TREES: Thick Skin)
    if (this.has('thickskin')) h.d.maxLife = Math.round(h.d.maxLife * TALENT_TUNE.thickSkin);
    // The weapon in hand decides both attacks. Their words stay where they are: they belong to the
    // place, not to the attack ("Power Strike becomes Power Shot when a bow is equipped"). What
    // the old attack had set going is gone with it. An attack that was waiting to be ready hands
    // its wait on to the one that takes its place: changing weapon is no way round a cooldown.
    const weapon = this.weapon();
    const want = skillsFor(h.cls, weapon);
    const waiting = [false, false];
    const changed = [false, false];
    for (let i = 0; i < 2; i++) {
      const s = h.skills[i];
      if (s.id === want[i]) continue;
      // (an attack that was being held ends here, and its wait begins: see endChannel)
      if (h.channel && h.channel.skill === i) this.endChannel(false);
      changed[i] = true;
      waiting[i] = SKILLS[s.id].cooldown > 0 && s.charges < 1;
      s.id = want[i];
      if (i === 0) h.swingT = 0;
      else h.queued = null;
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
          if (!w || WORDS[w].kind !== 'damage') continue;
          if (damage) {
            side[k] = null;
            h.words[w]++;
          } else damage = true;
        }
      }
      s.r = resolveSkill(def, s.front, s.behind, i < 2 ? weaponAttr(weapon) : CLASSES[h.cls].primary, h.d, this.meta.limit);
      // (THE SKILL TREES: Battle Rush, the leap ready sooner)
      if (def.kind === 'leap' && this.has('battlerush')) s.r.cooldown *= TALENT_TUNE.battleRush;
      // (the roll's two charges are a thing of cooldowns: when mana is the limit, mana is; Light Step, three)
      s.maxCharges = def.kind === 'roll' && this.meta.limit === 'cooldown' ? (this.has('lightstep') ? TALENT_TUNE.lightStep.charges : 2) : 1;
      if (i < 2 && changed[i]) {
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
    this.monsters = [];
    this.projectiles = [];
    this.zones = [];
    this.traps = [];
    this.volleys = [];
    this.orbs = [];
    this.familiars = [];
    this.drops = [];
    this.later = [];
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
    for (const s of h.skills) {
      s.cd = 0;
      s.charges = s.maxCharges;
    }
  }

  enterTown(): void {
    this.clearLevel();
    this.level = makeTown(this.seed);
    this.inDungeon = false;
    this.dungeonWords = [];
    const h = this.hero;
    const f = this.level.floor;
    h.x = f.start.x;
    h.y = f.start.y;
    h.fx = -0.7071;
    h.fy = -0.7071;
    h.life = h.d.maxLife;
    h.mana = h.d.maxMana;
    h.potions = TUNE.potionMax;
    this.flow = new Uint16Array(f.w * f.h);
    this.rollShop();
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
    const level = Math.max(1, this.depth);
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
    const pool = [...WORD_IDS];
    this.wordStock = [];
    while (this.wordStock.length < TUNE.wordStock && pool.length > 0) this.wordStock.push(pool.splice(lot.int(0, pool.length - 1), 1)[0]);
    this.wordsSold = [];
    this.won = -1;
  }

  enterDungeon(): void {
    this.clearLevel();
    // (THE SKILL TREES: Unbreakable once in each dungeon)
    this.unbroken = false;
    // the words laid on the gate are burned into this dungeon: used up, for good
    this.dungeonWords = this.plan;
    this.plan = [];
    for (const w of this.dungeonWords) this.learn(w, 'dungeon');
    const seed = (Math.imul(this.seed, 7919) + this.depth * 104729 + this.cleared * 31) >>> 0;
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
    this.flow = new Uint16Array(f.w * f.h);
    this.spawnMonsters(seed);
    if (this.depth === 1 && this.cleared === 0) {
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
    this.msg(`Dungeon ${this.depth}`, MSG.head);
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
    const kinds = Object.values(MONSTERS).filter((m) => m.weight > 0 && m.minDepth <= this.depth);
    f.packs.forEach((p, pi) => {
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
    // The boss waits a little in front of the dark portal.
    let bx = f.boss.x + 1;
    let by = f.boss.y + 2;
    if (!this.free(this.level.walk, bx, by, 0.42)) {
      bx = f.boss.x;
      by = f.boss.y;
    }
    this.boss = this.spawn('warden', bx, by, -2, 0, true, rng, lot);
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
   */
  private spawn(kind: MonsterKind, x: number, y: number, packId: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG, lot: RNG | null = null): Monster {
    const def = MONSTERS[kind];
    const elite = rank > 0;
    const champion = rank === 2;
    const words: WordId[] = [];
    // (THE FIRST LEVELS, 21:05: "That also means no words on monsters for dungeon 1")
    const bare = FIRST_LEVELS.on && !this.practice && this.depth <= 1;
    const want = bare ? 0 : boss ? (this.depth % 5 === 0 ? 3 : 2) : champion ? (this.depth >= 10 ? 3 : this.depth >= 3 ? 2 : 1) : elite ? (this.depth >= 6 ? 2 : 1) : 0;
    while (words.length < want) {
      const w = rng.pick(WORD_IDS);
      if (words.includes(w)) continue;
      if (ELEMENT_WORDS.includes(w) && words.some((o) => ELEMENT_WORDS.includes(o))) continue;
      words.push(w);
    }
    // What it gives up when it dies (the rune stones over its head). Words are scarce. A guardian or
    // a named monster gives up one of its own only sometimes. The boss always gives up one, and the
    // chance of more grows with how deep the dungeon is and with every word burned into it (the
    // owner: "let the boss have a guaranteed drop of at least 1 word. we can have the chance of
    // dropping more words increase with difficulty and rarity modifiers on dungeons"). A word
    // burned into a dungeon is spent: the boss does not hand it back.
    const greater = boss && this.depth % 5 === 0;
    let carries: WordId[] = [];
    if (boss && words.length) {
      carries = [lot ? lot.pick(words) : words[0]];
      if (lot) {
        let p = TUNE.bossExtraPerDepth * (this.depth - 1) + TUNE.bossExtraPerWord * this.dungeonWords.length + (greater ? TUNE.bossExtraGreater : 0);
        while (carries.length < 3 && p > 0 && lot.chance(Math.min(0.95, p))) {
          const spare = WORD_IDS.filter((w) => !carries.includes(w));
          carries.push(lot.pick(spare));
          p -= TUNE.bossThird;
        }
      }
    } else if (lot && words.length) {
      const p = champion ? TUNE.guardianCarry : TUNE.eliteCarry;
      // (the more words are burned into the dungeon, the likelier: that is what burning them buys)
      if (lot.chance(Math.min(1, p * (1 + 0.3 * this.dungeonWords.length)))) carries = [lot.pick(words)];
    }
    // (THE FIRST LEVELS: before the ring is lit nothing gives up a word)
    if (!this.wordsFall()) carries = [];
    if (!bare) for (const w of this.dungeonWords) if (!words.includes(w)) words.push(w);
    let life = def.life * (boss ? 1 + 0.4 * (this.depth - 1) : scaleLife(this.depth));
    let dm = scaleDmg(this.depth);
    let xp = def.xp * (1 + 0.25 * (this.depth - 1));
    if (champion) {
      life *= TUNE.guardianLife;
      dm *= TUNE.guardianDmg;
      xp *= 6;
    } else if (elite) {
      life *= TUNE.eliteLife;
      dm *= TUNE.eliteDmg;
      xp *= 4;
    }
    if (greater) life *= 2;
    if (words.includes('power')) {
      life *= 1.3;
      dm *= 1.4;
    }
    let name = def.name;
    if (elite || boss) name = [...words.slice(0, want).map((w) => WORDS[w].front), champion ? 'Guardian' : def.name].join(' ');
    if (greater) name = 'Greater ' + name;
    const m: Monster = {
      id: this.nextId++, kind, name, x, y, r: def.radius * (champion ? TUNE.guardianSize : elite ? 1.12 : 1), fx: 0.7071, fy: 0.7071,
      life: Math.round(life), maxLife: Math.round(life), dmgMin: def.dmgMin * dm, dmgMax: def.dmgMax * dm,
      speed: def.speed * (words.includes('swift') ? 1.35 : 1), elite, champion, boss, words, carries,
      state: 'sleep', t: 0, cd: 0, packId, anim: 'idle', animT: rng.range(0, 3), flash: 0,
      burnT: 0, burnDps: 0, chillT: 0, chill: 0, frozenT: 0, freezeImmune: 0, poisonT: 0, poisonDps: 0, poisonN: 0,
      stunT: 0, staggerT: 0, staggerCd: 0, markT: 0, shockT: 0, shield: words.includes('guarding') ? Math.round(Math.round(life) * GUARD.monster) : 0,
      lastSkill: -1, seen: false, barT: 0, phase: 0, atk: 0, dead: false, xp: Math.round(xp), seed: rng.next(),
    };
    this.monsters.push(m);
    return m;
  }

  // ===========================================================================================
  // Frame update

  update(dt: number, c: Controls): void {
    if (this.over) return;
    dt = Math.min(dt, 0.05);
    this.time += dt;
    if (this.inDungeon) this.runTime += dt;
    this.bagFullT -= dt;
    this.denyT -= dt;
    this.runLater(dt);
    const px = this.hero.x;
    const py = this.hero.y;
    this.updateHero(dt, c);
    if (this.over) return;
    // (a leap or a warp is not walking)
    const walked = this.hero.move ? 0 : Math.min(0.5, Math.hypot(this.hero.x - px, this.hero.y - py));
    if (TALENTS.on) this.updateTalents(dt, walked);
    this.updateVision(dt);
    this.updateDoors(dt);
    this.updateHazards(dt);
    this.updateFlow(dt);
    this.updateMonsters(dt);
    this.updateProjectiles(dt);
    this.updateTraps(dt);
    this.updateVolleys(dt);
    this.updateOrbs(dt);
    this.updateFamiliars(dt);
    this.updateZones(dt);
    this.updateDots(dt);
    this.updateDrops(dt);
    this.updateProps(c);
    if (this.practice) this.updatePractice(dt);
    if (this.level.town) this.updateTags();
    if (this.monsters.some((m) => m.dead)) this.monsters = this.monsters.filter((m) => !m.dead);
    if (this.guide) this.updateGuide(dt, walked);
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
      if (d.want === 1 && alive && this.wellInside(d, h.x, h.y)) this.dropGate(d);
      else if (d.want === 0 && !alive) this.raiseGate(d);
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

  private emit(e: GameEvent): void {
    this.events.push(e);
  }

  msg(text: string, color: string = MSG.plain): void {
    this.emit({ t: 'msg', text, color });
  }

  private sfx(name: Sfx, vol?: number): void {
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
  private free(grid: Uint8Array, x: number, y: number, r: number, flat = false, held = false): boolean {
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
  private slide(b: { x: number; y: number }, r: number, dx: number, dy: number, grid: Uint8Array, held = false): void {
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

  private isOpen(x: number, y: number): boolean {
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
    // (mana only matters when it is what limits the slow abilities: then it also comes back faster)
    h.mana = Math.min(d.maxMana, h.mana + d.manaRegen * (this.meta.limit === 'mana' ? MANA_MODE.regen : 1) * dt);
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
    // (Frenzied: the frenzy makes every cooldown come round faster)
    const pace = this.frenzyPace();
    for (const s of h.skills) {
      if (s.charges < s.maxCharges) {
        s.cd -= dt * pace;
        if (s.cd <= 0) {
          s.charges++;
          s.cd = s.charges < s.maxCharges ? s.r.cooldown : 0;
        }
      }
    }

    // A leap or roll in progress carries the hero and nothing else happens.
    if (h.move) {
      const mv = h.move;
      mv.t += dt;
      const k = Math.min(1, mv.t / mv.dur);
      h.x = mv.x0 + (mv.x1 - mv.x0) * k;
      h.y = mv.y0 + (mv.y1 - mv.y0) * k;
      h.invuln = Math.max(h.invuln, 0.06);
      h.anim = 'walk';
      h.animT += dt * 2;
      if (k >= 1) {
        h.move = null;
        if (mv.kind === 'leap') this.land();
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
      // (an attack slows the hero for a moment from when it is begun, as it always has; one that is
      // being held slows them for as long as it is: a beam to a walk, a whirlwind hardly at all)
      if (h.channel) sp *= SKILLS[h.skills[h.channel.skill].id].kind === 'whirl' ? TUNE.whirlWalk : TUNE.beamWalk;
      else if (h.attackT > 0 && h.attackAge < TUNE.attackSlowTime) sp *= TUNE.attackSlow;
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
    this.healHero(h.d.maxLife * TUNE.potionHeal * (this.has('secondwind') ? TALENT_TUNE.secondWind : 1));
    this.sfx('potion');
    this.emit({ t: 'spark', x: h.x, y: h.y, el: 'fire', n: 10 });
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
    h.attackSkill = i;
    h.attackAge = 0;
    h.attackWind = wind;
    h.attackT = wind + SKILLS[h.skills[i].id].follow;
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
      // (the quick attack goes the way the hero faces, from wherever they have got to)
      this.deliver(0, h.x, h.y, h.x + h.fx, h.y + h.fy, 1, true);
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
        this.leavePatches(i, wx, wy, 1.0);
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
    h.might = Math.min(r.might * (this.has('fury') ? TALENT_TUNE.fury : 5), h.might + r.might);
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
      h.shield = Math.max(h.shield, Math.round(h.d.maxLife * r.shield * (this.has('shieldwall') ? TALENT_TUNE.shieldwall : 1)));
      h.shieldT = GUARD.shieldTime;
      this.emit({ t: 'shield', x: h.x, y: h.y, secs: GUARD.shieldTime });
    }
  }

  /** How much faster the frenzy makes the hero's attacks and cooldowns (1: no frenzy). */
  frenzyPace(): number {
    // (THE SKILL TREES: Berserk, below half his life, faster still)
    return (1 + FRENZY.each * this.hero.frenzy) * (this.berserking() ? TALENT_TUNE.berserk.speed : 1);
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
    if (def.kind === 'warp' || def.kind === 'leap') {
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
    // roll: travel along the floor, stopping at the first obstacle (THE SKILL TREES: Light Step, further)
    const rollRange = def.range * (this.has('lightstep') ? TALENT_TUNE.lightStep.roll : 1);
    const end = { x: h.x, y: h.y };
    for (let dgo = 0; dgo < rollRange; dgo += 0.15) this.slide(end, TUNE.heroRadius, dx * 0.15, dy * 0.15, this.level.walk);
    // LEDGES AND PITS (the owner, 5 and 7 Oct 2026: "the swipe moves need to be able to traverse
    // the different levels as well"; "Gaps and pits to use the swipe ability over"): a roll that a
    // ledge or a pit would stop short goes OVER it, a dive, to the farthest place in its range where
    // the hero can stand. (A wall still stops it, and so does a pillar or a barrel.)
    let over = false;
    if (this.level.step) {
      const far = this.overPoint(dx, dy, rollRange);
      if (far && Math.hypot(far.x - h.x, far.y - h.y) > Math.hypot(end.x - h.x, end.y - h.y) + 0.3) {
        end.x = far.x;
        end.y = far.y;
        over = true;
      }
    }
    h.move = { kind: 'roll', t: 0, dur: over ? 0.3 : 0.24, x0: h.x, y0: h.y, x1: end.x, y1: end.y, over };
    // (THE SKILL TREES: Windrunner, faster after a roll)
    if (this.has('windrunner')) this.windT = TALENT_TUNE.windrunner.secs;
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
    const x = h.x;
    const y = h.y;
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
    return s ? s.front.filter((w): w is WordId => w !== null) : [];
  }

  /** The words behind ability `i`. */
  private behinds(i: number): WordId[] {
    const s = this.hero.skills[i];
    return s ? s.behind.filter((w): w is WordId => w !== null) : [];
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
      const long = this.has('longshot') ? TALENT_TUNE.longShot : 1;
      const split = primary && this.has('splitshot') && ++this.shots % TALENT_TUNE.splitShot.every === 0;
      const fan = split ? [-TALENT_TUNE.splitShot.fan, 0, TALENT_TUNE.splitShot.fan] : [0];
      for (let k = 0; k < r.count; k++) {
        for (const f of fan) {
          const a = base + (r.count === 1 ? 0 : (k - (r.count - 1) / 2) * 0.16) + f;
          this.projectiles.push({
            x: ox + Math.cos(a) * 0.4, y: oy + Math.sin(a) * 0.4, vx: Math.cos(a) * r.projSpeed * long, vy: Math.sin(a) * r.projSpeed * long,
            r: Math.min(0.6, def.radius * r.size * (r.splash >= 1.5 ? 1.5 : 1)), dist: def.range * long, hostile: false, dmg: each, element: r.element,
            look: 'arrow', pierce: r.pierce, pierceN: this.has('piercing') ? TALENT_TUNE.piercing : 0, hit, volley: r.count > 1 || split, skill: i, trail: 0, words, runed: false, clouded: false, age: 0, from: '', n: k,
          });
        }
      }
    } else if (def.kind === 'volley') {
      // The arrows go up from the bow, and a moment later begin to come down round the spot that
      // was aimed at: as near to there as the hero can see, within the bow's reach. (The echo is a
      // second, weaker rain on the same spot.)
      const p = this.reachPoint(tx, ty, def.range);
      // (THE SKILL TREES: Hail, longer and wider)
      const hail = this.has('hail');
      const rad = def.radius * r.size * (hail ? TALENT_TUNE.hail.area : 1);
      this.sfx('volley', echo ? 0.5 : 0.9);
      this.emit({ t: 'volleyUp', x: ox, y: oy, tx: p.x, ty: p.y, r: rad, el: r.element, words, echo });
      this.volleys.push({
        id: this.nextThing++, x: p.x, y: p.y, r: rad, t: -TUNE.volleyDelay, n: 0, total: Math.max(1, Math.round((TUNE.volleyLife * (hail ? TALENT_TUNE.hail.life : 1)) / TUNE.volleyEvery)), told: 0, next: 0,
        skill: i, frac: each, count: r.count, element: r.element, echo, wake: primary,
      });
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
    for (const m of this.monsters) {
      if (m.dead) continue;
      const mx = m.x - ox;
      const my = m.y - oy;
      const dist = Math.hypot(mx, my);
      if (dist > reach + m.r) continue;
      // in front of the hero, or close enough that facing does not matter
      const dot = dist > 0.01 ? (mx * dx + my * dy) / dist : 1;
      if (dot < 0.35 && dist > 0.9 + m.r) continue;
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
    this.landed(i);
    this.sfx(power ? 'power' : 'hit', 0.7);
    if (words.includes('heavy')) this.emit({ t: 'heavy', x: tx, y: ty, r: 1.1, big: false });
    if (r.splash > 0) {
      // (THE SKILL TREES: Fuel, Flame's blast wider)
      const rad = r.splash * r.size * (r.element === 'fire' && this.has('fuel') ? TALENT_TUNE.fuel : 1);
      // a full-strength splash is an explosion; Power's is a shock through the ground
      this.emit({ t: 'burst', x: tx, y: ty, r: rad, el: r.element, style: r.splashDmg >= 1 ? 'blast' : 'shock', words, n, echo });
      for (const o of this.monsters) {
        if (o.dead || o === best) continue;
        if (Math.hypot(o.x - tx, o.y - ty) <= rad + o.r && !this.shutIn(o)) this.hitMonster(o, i, frac * r.splashDmg, true);
      }
    }
    // (THE SKILL TREES: Cleave, a melee hit splashes on the enemies beside)
    if (this.has('cleave')) {
      const C = TALENT_TUNE.cleave;
      for (const o of this.monsters) {
        if (o.dead || o === best || this.shutIn(o)) continue;
        if (Math.hypot(o.x - tx, o.y - ty) <= C.reach + o.r) this.hitMonster(o, i, frac * C.share, true);
      }
    }
    this.wake(i, tx, ty, 1.0, frac);
  }

  /** An area hit: everything within `rad` of (cx, cy). */
  /** `leaves`: false for a blast that leaves nothing behind it (an orb's later waves: what the orb leaves, it left as it landed). */
  private blast(i: number, cx: number, cy: number, rad: number, frac: number, style: 'slam' | 'nova' | 'blast' | 'land' | 'whirl', n = 0, echo = false, leaves = true): void {
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
    this.leavePatches(i, x, y, rad);
  }

  /** What Heavy and Guarding behind leave where ability `i` lands: cracked ground, a ward circle. */
  private leavePatches(i: number, x: number, y: number, rad: number): void {
    const r = this.hero.skills[i].r;
    if (r.cracks > 0) this.addPatch(i, 'cracks', x, y, Math.max(1.0, rad), r.cracks, 0);
    if (r.ward > 0) this.addPatch(i, 'ward', x, y, Math.max(1.5, rad), GUARD.wardTime, r.ward);
  }

  /**
   * Cracked ground or a ward circle, for `dur` seconds (`share`: what a ward takes off the harm).
   * Laid again where one already is, that one lasts as long again from now: they do not pile up.
   */
  private addPatch(i: number, kind: 'cracks' | 'ward', x: number, y: number, rad: number, dur: number, share: number): void {
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
    if (z.kind === 'ice' && this.has('rime')) rad *= TALENT_TUNE.rime;
    // refresh a patch that is already there rather than stacking another
    for (const o of this.zones) {
      if (o.kind === z.kind && !o.hostile && Math.hypot(o.x - x, o.y - y) < 0.45 && o.r >= rad - 0.1) {
        o.t = 0;
        return;
      }
    }
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    this.zones.push({ x, y, r: rad, t: 0, dur: z.dur, kind: z.kind, element: z.element, dmg: this.avgHit(i, frac) * z.dps, slow: z.slow, tick: 0.2, hostile: false, skill: i, words: [], from: '' });
    this.emit({ t: 'zone', kind: z.kind, x, y, r: rad, el: z.element });
  }

  /** "of Venom": a cloud of poison hangs where the ability hit. */
  private addCloud(i: number, x: number, y: number, rad: number, frac: number): void {
    const r = this.hero.skills[i].r;
    for (const o of this.zones) {
      if (o.kind === 'venom' && Math.hypot(o.x - x, o.y - y) < 0.6 && o.r >= rad - 0.1) {
        o.t = 0;
        return;
      }
    }
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    this.zones.push({ x, y, r: rad, t: 0, dur: 5, kind: 'venom', element: 'phys', dmg: this.avgHit(i, frac) * r.cloud, slow: 0, tick: 0.2, hostile: false, skill: i, words: [], from: '' });
    this.emit({ t: 'zone', kind: 'venom', x, y, r: rad, el: 'phys' });
  }

  private addRune(i: number, x: number, y: number, frac: number): void {
    const r = this.hero.skills[i].r;
    if (!this.roomForZone() || !this.onFloor(x, y)) return;
    this.zones.push({ x, y, r: 2.0 * r.size, t: 0, dur: 1.2, kind: 'rune', element: r.element, dmg: this.avgHit(i, frac) * r.rune, slow: 0, tick: 0, hostile: false, skill: i, words: [], from: '' });
    this.emit({ t: 'zone', kind: 'rune', x, y, r: 2.0 * r.size, el: r.element });
    this.sfx('rune', 0.7);
  }

  private addWarn(x: number, y: number, rad: number, dur: number, dmg: number, el: Element, words: WordId[], from: string, src?: number): void {
    // (a warning is never left out: if the floor is full, the oldest of the hero's own patches gives way to it)
    this.roomForZone();
    this.zones.push({ x, y, r: rad, t: 0, dur, kind: 'warn', element: el, dmg, slow: 0, tick: 0, hostile: true, skill: -1, words, from, src });
  }

  /** One hit of ability `i` on a monster, with everything a word in front adds to it. */
  private hitMonster(m: Monster, i: number, frac: number, quiet: boolean): void {
    // (what is shut in a room is out of reach: `shutIn`)
    if (m.dead || this.shutIn(m)) return;
    const h = this.hero;
    const d = h.d;
    const r = h.skills[i].r;
    const st = d.stats;
    const el = r.element === 'fire' ? st.firePct : r.element === 'frost' ? st.frostPct : r.element === 'lightning' ? st.lightPct : st.physPct;
    let dmg = this.rng.range(d.dmgMin, d.dmgMax) * r.dmgMult * frac * (1 + (st.dmgPct + el + h.might) / 100);
    // (THE SKILL TREES: what the talents make of a hit)
    if (TALENTS.on) dmg *= this.talentHitMult(m);
    let crit = this.rng.chance(d.critChance / 100);
    // PRECISE behind: the hero's next hit on a marked enemy is a certain critical, and spends the mark
    const spent = m.markT > 0;
    if (spent) {
      crit = true;
      m.markT = 0;
    }
    // (Hunter's Mark: the mark's critical is a triple one)
    if (crit) dmg *= 1 + (d.critMult / 100) * (spent && this.has('huntersmark') ? TALENT_TUNE.huntersMark : 1);
    dmg = Math.max(1, Math.round(dmg));
    const x = m.x;
    const y = m.y;
    if (r.ignite > 0) {
      // (Searing: it burns longer, and harder)
      const sear = this.has('searing');
      const dps = ((dmg * r.ignite) / 3) * (sear ? TALENT_TUNE.searing.mult : 1);
      if (m.burnT <= 0) this.emit({ t: 'ignite', x, y });
      if (m.burnT <= 0 || dps > m.burnDps) m.burnDps = dps;
      m.burnT = 3 + (sear ? TALENT_TUNE.searing.secs : 0);
    }
    if (r.chill > 0) {
      if (m.chillT > 0 && m.freezeImmune <= 0 && !m.boss) {
        // (Deep Freeze: frozen half as long again, and frozen again sooner)
        const deep = this.has('deepfreeze');
        m.frozenT = (m.elite ? 0.6 : 1.1) * (deep ? TALENT_TUNE.deepFreeze.frozen : 1);
        m.freezeImmune = deep ? TALENT_TUNE.deepFreeze.again : 4;
        this.emit({ t: 'freeze', x, y });
        this.sfx('frost', 0.7);
      }
      m.chill = Math.max(m.chillT > 0 ? m.chill : 0, r.chill);
      m.chillT = 2.5;
    }
    const front = quiet ? undefined : this.fronts(i);
    if (r.orbChance > 0 && !quiet) this.emit({ t: 'mark', x, y });
    // lightning comes down on the one it hits before it jumps to the others
    if (r.arcs > 0 && !quiet) this.emit({ t: 'arc', x0: x, y0: y, x1: x, y1: y, sky: true });
    // (THE SKILL TREES: a lightning hit leaves it shocked, which Overload works on)
    if (TALENTS.on && (r.element === 'lightning' || r.arcs > 0)) m.shockT = TALENT_TUNE.shockSecs;
    if (spent) this.emit({ t: 'markSpent', id: m.id, x, y, dx: x - h.x, dy: y - h.y });
    this.damageMonster(m, dmg, r.element, crit, i, !quiet && h.skills[i].front.includes('power'), front);
    if (r.poison > 0) this.poisonMonster(m, dmg * r.poison, i);
    if (!m.dead) {
      // HEAVY in front stuns what it hits; gear with Heavy burned into it may stun too
      if (r.stun > 0) this.stunMonster(m, r.stun);
      else {
        const chance = Math.min(HEAVY.stunCap, st.stunChance);
        if (chance > 0 && this.rng.chance(chance / 100)) this.stunMonster(m, HEAVY.stun);
      }
      // PRECISE behind marks the first enemy each use hits (not one whose mark this very hit spent)
      if (r.mark && !spent && this.marked[i] !== h.skills[i].uses) {
        this.marked[i] = h.skills[i].uses;
        m.markT = PRECISE.markTime;
        this.emit({ t: 'markOn', id: m.id, x, y, secs: PRECISE.markTime });
      }
    }
    if (r.leech > 0) {
      this.healHero(r.leech);
      this.emit({ t: 'leech', x, y, n: r.leech });
    }
    if (st.lifeOnHit > 0) this.healHero(st.lifeOnHit);
    if (r.arcs > 0 && !quiet) {
      // jump to the nearest other enemies
      const near = this.monsters
        .filter((o) => !o.dead && o !== m && Math.hypot(o.x - x, o.y - y) <= 3.5)
        .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))
        .slice(0, r.arcs + (this.has('forking') ? TALENT_TUNE.forking : 0));
      for (const o of near) {
        this.emit({ t: 'arc', x0: x, y0: y, x1: o.x, y1: o.y });
        if (TALENTS.on) o.shockT = TALENT_TUNE.shockSecs;
        this.damageMonster(o, Math.max(1, Math.round(dmg * r.arcDmg)), 'lightning', false, i);
      }
      if (near.length) this.sfx('zap', 0.6);
    }
  }

  /** THE SKILL TREES: what the talents make of the hero's hit on `m` (1: nothing). */
  private talentHitMult(m: Monster): number {
    const h = this.hero;
    const T = TALENT_TUNE;
    let k = 1;
    if (this.has('wrath') && (m.elite || m.boss)) k *= T.wrath;
    if (this.has('steadyaim') && this.stillT >= T.steadyAim.still) k *= T.steadyAim.mult;
    if (this.has('farsight')) k *= 1 + T.farSight.most * Math.min(1, Math.hypot(m.x - h.x, m.y - h.y) / T.farSight.at);
    if (this.berserking()) k *= T.berserk.mult;
    if (this.has('shatter') && m.frozenT > 0) k *= T.shatter;
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
    const most = TUNE.poisonStacks * (this.has('venom') ? TALENT_TUNE.venom : 1);
    if (m.poisonN < most) {
      m.poisonDps += dps;
      m.poisonN++;
    } else m.poisonDps = Math.max(m.poisonDps, dps * most);
    m.poisonT = TUNE.poisonTime;
    if (skill >= 0) m.lastSkill = skill;
  }

  /**
   * HEAVY: monster `m` is stunned for `secs`: it cannot move or attack, and what it was winding up
   * is broken off. An elite (a guardian too) for half as long; a boss never.
   */
  private stunMonster(m: Monster, secs: number): void {
    if (m.dead || m.boss) return;
    const t = m.elite ? secs / 2 : secs;
    if (t <= m.stunT) return;
    m.stunT = t;
    this.breakOff(m);
    this.emit({ t: 'stun', id: m.id, x: m.x, y: m.y, secs: t });
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
    if (m.state !== 'windup') return;
    m.state = 'chase';
    m.anim = 'idle';
    for (let k = this.zones.length - 1; k >= 0; k--) {
      const z = this.zones[k];
      if (z.kind === 'warn' && z.src === m.id) this.zones.splice(k, 1);
    }
  }

  /** Heavy on a monster: its blow, from (fromX, fromY), knocks the hero back a step (walls stop it). */
  private knockHero(fromX: number, fromY: number): void {
    const h = this.hero;
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
    h.step = { dx: dx * HEAVY.knock, dy: dy * HEAVY.knock, t: 0.12 };
  }

  /** `poison`: the harm is poison working (its number is drawn in poison's colour, and it does not flash the monster). */
  private damageMonster(m: Monster, dmg: number, el: Element, crit: boolean, skill: number, heavy = false, words?: readonly WordId[], poison = false): void {
    // (what is shut in a room is out of reach, of an arc of lightning and of what burns on the ground too: `shutIn`)
    if (m.dead || this.shutIn(m)) return;
    // (THE SKILL TREES: Overload, a shocked enemy takes more from everything)
    if (m.shockT > 0 && this.has('overload')) dmg = Math.max(1, Math.round(dmg * TALENT_TUNE.overload));
    // (GUARDING, on a monster: its shield takes the harm first)
    if (m.shield > 0) {
      const soak = Math.min(m.shield, dmg);
      m.shield -= soak;
      m.life -= dmg - soak;
    } else m.life -= dmg;
    if (!poison) m.flash = heavy ? 0.2 : 0.12;
    m.barT = 4;
    if (skill >= 0) m.lastSkill = skill;
    if (m.state === 'sleep') this.wakeUp(m);
    this.emit({ t: 'hit', x: m.x, y: m.y, amount: dmg, crit, el, onHero: false, heavy, words: words && words.length ? words : undefined, poison: poison || undefined });
    if (m.life <= 0) this.kill(m);
  }

  private kill(m: Monster): void {
    if (m.dead) return;
    m.dead = true;
    this.kills++;
    const h = this.hero;
    this.emit({ t: 'die', x: m.x, y: m.y, kind: m.kind, elite: m.elite, champion: m.champion, boss: m.boss, fx: m.fx, fy: m.fy });
    if (m.frozenT > 0) {
      this.emit({ t: 'shatter', x: m.x, y: m.y });
      this.sfx('shatter', 0.8);
    }
    if (TALENTS.on) this.talentKill(m);
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
    if (r && r.volatile > 0) {
      const x = m.x;
      const y = m.y;
      const boom = Math.max(1, Math.round(m.maxLife * r.volatile));
      const skill = m.lastSkill;
      this.after(0.12, () => {
        this.emit({ t: 'burst', x, y, r: 1.8, el: r.element, style: 'blast', words: VOLATILE_ONLY });
        this.sfx('explode', 0.6);
        for (const o of this.monsters) {
          if (!o.dead && Math.hypot(o.x - x, o.y - y) <= 1.8 + o.r) this.damageMonster(o, boom, r.element, false, skill);
        }
      });
    }
    if (r && r.orbChance > 0 && this.rng.chance(r.orbChance)) {
      this.addDrop('orb', m.x, m.y, 0, null, null);
      this.emit({ t: 'orb', x: m.x, y: m.y });
      this.sfx('leech', 0.7);
    }
    // a monster carrying Volatile goes off after a short warning
    if (m.words.includes('volatile')) {
      this.addWarn(m.x, m.y, 1.8, 0.7, ((m.dmgMin + m.dmgMax) / 2) * 1.5, this.monsterElement(m), [], `${m.name}'s dying blast`);
    }
    this.dropLoot(m);
    this.gainXp(m.xp);
    this.quip(m);
    if (m.boss) {
      this.boss = null;
      this.emit({ t: 'shake', amount: 6 });
      const p = this.level.portal;
      if (p) p.state = 1;
      this.msg('The way back to town is open', MSG.good);
      this.sfx('portal');
    }
  }

  /** THE SKILL TREES: what a kill does with the talents: Momentum's speed; Inferno's blast for one that dies burning; Shatter's burst of cold for one that dies frozen. */
  private talentKill(m: Monster): void {
    const T = TALENT_TUNE;
    if (this.has('momentum')) this.momentumT = T.momentum.secs;
    const x = m.x;
    const y = m.y;
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
      if (words.length) lists.push({ w: W.word, lines: QUIPS.word[q.pick(words)] });
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

  private monsterElement(m: Monster): Element {
    for (const w of m.words) {
      if (w === 'fire' || w === 'frost' || w === 'lightning') return w;
    }
    return MONSTERS[m.kind].element;
  }

  private rollMonsterDmg(m: Monster): number {
    return this.rng.range(m.dmgMin, m.dmgMax);
  }

  /** (ox, oy): where a blow that has no monster behind it (a shot, a warning) came from: the way a Heavy one knocks the hero. */
  hurtHero(raw: number, el: Element, words: readonly WordId[], src: Monster | null, from = '', ox?: number, oy?: number): void {
    const h = this.hero;
    if (this.over || h.invuln > 0 || h.move) return;
    this.slainBy = src ? src.name : from;
    const d = h.d;
    const fromX = src ? src.x : ox ?? h.x + h.fx;
    const fromY = src ? src.y : oy ?? h.y + h.fy;
    // GUARDING burned into gear: a chance to block the blow, which then does nothing at all
    const block = Math.min(GUARD.blockCap, d.stats.blockChance);
    if (block > 0 && this.rng.chance(block / 100)) {
      this.emit({ t: 'blocked', x: h.x, y: h.y, fromX, fromY });
      this.emit({ t: 'text', x: h.x, y: h.y, text: 'Blocked', color: '#9fe8c0' });
      this.sfx('hit', 0.5);
      return;
    }
    let dmg = raw;
    // (PRECISE, on a monster: its blows find the gaps in the hero's armour)
    if (el === 'phys') dmg *= 1 - armorReduction(words.includes('precise') ? d.armor * (1 - PRECISE.armourIgnored) : d.armor, Math.max(1, this.depth));
    else dmg *= 1 - (el === 'fire' ? d.resFire : el === 'frost' ? d.resFrost : d.resLight) / 100;
    if (h.shockT > 0) dmg *= 1.2;
    // GUARDING behind: inside a ward the hero takes less (the strongest ward they stand in)
    let ward = 0;
    for (const z of this.zones) if (z.kind === 'ward' && Math.hypot(h.x - z.x, h.y - z.y) <= z.r) ward = Math.max(ward, z.dmg);
    if (ward > 0) dmg *= 1 - ward;
    // (THE SKILL TREES: Bulwark)
    if (this.has('bulwark')) dmg *= TALENT_TUNE.bulwark;
    dmg = Math.max(1, Math.round(dmg));
    // (THE SKILL TREES: Thorns, what strikes him up close takes some of the blow back)
    if (src && !src.dead && this.has('thorns') && Math.hypot(src.x - h.x, src.y - h.y) <= src.r + TALENT_TUNE.thorns.reach) {
      this.damageMonster(src, Math.max(1, Math.round(raw * TALENT_TUNE.thorns.share)), 'phys', false, -1);
    }
    // HEAVY, on a monster: its blows knock the hero back a step
    if (words.includes('heavy')) this.knockHero(fromX, fromY);
    // GUARDING in front: the shield takes the blow first
    let soaked = 0;
    if (h.shield > 0) {
      soaked = Math.min(h.shield, dmg);
      h.shield -= soaked;
      dmg -= soaked;
      if (h.shield <= 0) {
        h.shield = 0;
        h.shieldT = 0;
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
    if (words.includes('poison')) {
      // a monster with Poison: most of the blow again, over the next few seconds
      h.poisonDps = Math.max(h.poisonT > 0 ? h.poisonDps : 0, (dmg * 0.6) / TUNE.poisonTime);
      h.poisonT = TUNE.poisonTime;
    }
    if (el === 'fire') {
      h.burnDps = Math.max(h.burnT > 0 ? h.burnDps : 0, (dmg * 0.3) / 3);
      h.burnT = 3;
    } else if (el === 'frost') {
      h.chill = 0.3;
      h.chillT = 2;
    } else if (el === 'lightning') {
      h.shockT = 3;
    }
    if (src && !src.dead && words.includes('leech')) {
      src.life = Math.min(src.maxLife, src.life + src.maxLife * 0.15);
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
    return MODES.on && this.mode === 'normal' && this.inDungeon && !this.practice && this.entry !== null;
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
    for (const w of WORD_IDS) words += Math.max(0, count(h.words, nowSockets, w) - count(e.words, e.sockets, w));
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
      this.msg(m.name, MSG.foe);
    }
  }

  private updateMonsters(dt: number): void {
    const h = this.hero;
    const L = this.level;
    const f = L.floor;
    const act: Monster[] = [];
    for (const m of this.monsters) {
      if (m.dead) continue;
      m.flash = Math.max(0, m.flash - dt);
      m.barT = Math.max(0, m.barT - dt);
      m.seen = L.visible[Math.floor(m.y) * f.w + Math.floor(m.x)] === 1;
      const dx = h.x - m.x;
      const dy = h.y - m.y;
      const dist = Math.hypot(dx, dy);
      m.animT += dt;
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
      act.push(m);
      if (m.burnT > 0) m.burnT -= dt;
      if (m.chillT > 0) m.chillT -= dt;
      if (m.freezeImmune > 0) m.freezeImmune -= dt;
      if (m.markT > 0) m.markT -= dt;
      if (m.shockT > 0) m.shockT -= dt;
      if (m.staggerCd > 0) m.staggerCd -= dt;
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
      // HEAVY: stunned or staggered, it does nothing (what it was winding up was broken off then)
      if (m.stunT > 0 || m.staggerT > 0) {
        m.stunT = Math.max(0, m.stunT - dt);
        m.staggerT = Math.max(0, m.staggerT - dt);
        m.anim = 'idle';
        continue;
      }
      // FRENZIED, on a monster: the more it is hurt, the faster it moves and the sooner it attacks again
      const rage = m.words.includes('frenzied') ? 1 + FRENZY.monster * (1 - Math.max(0, m.life) / m.maxLife) : 1;
      m.cd -= dt * rage;
      const def = MONSTERS[m.kind];
      const slow = m.chillT > 0 ? 1 - m.chill : 1;

      if (m.state === 'windup') {
        m.t -= dt * (0.6 + 0.4 * slow);
        if (m.t <= 0) this.monsterAttack(m, def);
        continue;
      }
      if (m.state === 'recover') {
        m.t -= dt;
        if (m.t <= 0) {
          m.state = 'chase';
          m.anim = 'idle';
        }
        continue;
      }

      const los = dist < 15 && this.sees(m.x, m.y, h.x, h.y);
      if (m.boss) {
        this.bossThink(m, def, dist, los);
        if (m.state !== 'chase') continue;
      }
      let mvx = 0;
      let mvy = 0;
      let moving = true;
      const reach = def.range + (m.r - 0.32);
      if (def.ranged) {
        if (los && dist <= def.range && m.cd <= 0) {
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
        if (!m.boss && los && dist <= reach + TUNE.heroRadius && m.cd <= 0) {
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
        const sp = m.speed * slow * rage * dt;
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
    for (let i = 0; i < act.length; i++) {
      const a = act[i];
      const ga = a.kind === 'bat' ? L.open : L.walk;
      for (let j = i + 1; j < act.length; j++) {
        const b = act[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const min = (a.r + b.r) * 0.85;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2);
        const nx = d > 1e-4 ? dx / d : 1;
        const ny = d > 1e-4 ? dy / d : 0;
        const push = (min - d) * 0.5;
        this.slide(a, Math.min(a.r, 0.42), -nx * push, -ny * push, ga, true);
        this.slide(b, Math.min(b.r, 0.42), nx * push, ny * push, b.kind === 'bat' ? L.open : L.walk, true);
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
      this.addWarn(m.x + m.fx * reach, m.y + m.fy * reach, def.aoe, def.windup, this.rollMonsterDmg(m), this.monsterElement(m), m.words, m.name, m.id);
    }
  }

  private monsterAttack(m: Monster, def: MonsterDef): void {
    const h = this.hero;
    m.state = 'recover';
    m.t = TUNE.monsterRecover;
    m.cd = def.cooldown * (m.words.includes('swift') ? 0.7 : 1) * this.rng.range(0.9, 1.2);
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.hypot(dx, dy) || 1;
    const el = this.monsterElement(m);
    const twin = m.words.includes('twin');
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
      if (twin) this.addWarn(h.x, h.y, def.aoe * 0.8, 0.6, this.rollMonsterDmg(m), el, m.words, m.name);
      return;
    }
    if (def.ranged) {
      const base = Math.atan2(dy, dx);
      const look = m.kind === 'archer' ? 'arrow' : 'bolt';
      if (twin) {
        this.shootAt(m, base - 0.12, def.projSpeed, this.rollMonsterDmg(m), el, look, def.range + 3);
        this.shootAt(m, base + 0.12, def.projSpeed, this.rollMonsterDmg(m), el, look, def.range + 3);
      } else this.shootAt(m, base, def.projSpeed, this.rollMonsterDmg(m), el, look, def.range + 3);
      this.sfx(m.kind === 'archer' ? 'shot' : 'fire', 0.5);
      return;
    }
    const reach = def.range + (m.r - 0.32) + 0.45 + TUNE.heroRadius;
    if (dist <= reach) this.hurtHero(this.rollMonsterDmg(m), el, m.words, m);
    this.sfx('swing', 0.4);
    if (twin) {
      this.after(0.28, () => {
        if (m.dead) return;
        if (Math.hypot(this.hero.x - m.x, this.hero.y - m.y) <= reach) this.hurtHero(this.rollMonsterDmg(m), el, m.words, m);
      });
    }
  }

  private shootAt(m: Monster, angle: number, speed: number, dmg: number, el: Element, look: 'arrow' | 'bolt', range: number): void {
    this.projectiles.push({
      x: m.x + Math.cos(angle) * 0.4, y: m.y + Math.sin(angle) * 0.4, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      r: look === 'bolt' ? 0.3 : 0.2, dist: range, hostile: true, dmg, element: el, look, pierce: false, hit: [], volley: false, skill: -1,
      trail: 0, words: m.words, runed: false, clouded: false, age: 0, from: m.name, n: 0,
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
  // Projectiles, traps, ground

  private updateProjectiles(dt: number): void {
    const L = this.level;
    const f = L.floor;
    const h = this.hero;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.age += dt;
      const sp = Math.hypot(p.vx, p.vy) || 1;
      let travel = sp * dt;
      let dead = false;
      while (travel > 0 && !dead) {
        const step = Math.min(0.25, travel);
        travel -= step;
        const nx = p.x + (p.vx / sp) * step;
        const ny = p.y + (p.vy / sp) * step;
        if (!this.isOpen(nx, ny)) {
          // (THE TRAPS: what the hero shoots may meet a sealed door, and open it)
          if (!p.hostile) this.unseal(p.skill, nx, ny, 0.1);
          this.endProjectile(p);
          dead = true;
          break;
        }
        p.x = nx;
        p.y = ny;
        p.dist -= step;
        if (p.hostile) {
          if (!h.move && h.invuln <= 0 && Math.hypot(h.x - p.x, h.y - p.y) <= p.r + TUNE.heroRadius) {
            // (THE TRAPS: a dart's harm is a share of the life of what it meets)
            this.hurtHero(p.trap ? h.d.maxLife * p.dmg : p.dmg, p.element, p.words, null, p.from, p.x - p.vx, p.y - p.vy);
            this.emit({ t: 'spark', x: p.x, y: p.y, el: p.element, n: 5 });
            dead = true;
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
      if (dead) this.projectiles.splice(i, 1);
    }
  }

  private projectileHit(p: Projectile, m: Monster): void {
    const r = this.hero.skills[p.skill].r;
    const x = m.x;
    const y = m.y;
    this.hitMonster(m, p.skill, p.dmg, false);
    // (an arrow or a wave that goes through several is still one blow)
    if (!p.mighted) {
      p.mighted = true;
      this.landed(p.skill);
      if (p.words.includes('heavy')) this.emit({ t: 'heavy', x, y, r: 1.1, big: false });
    }
    const power = p.words.includes('power');
    this.sfx(power ? 'power' : 'hit', 0.6);
    if (r.splash > 0) {
      const rad = r.splash * r.size * (r.element === 'fire' && this.has('fuel') ? TALENT_TUNE.fuel : 1);
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
    if ((r.cracks > 0 || r.ward > 0) && !p.left) {
      p.left = true;
      this.leavePatches(p.skill, x, y, 1.0);
    }
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
      if ((r.cracks > 0 || r.ward > 0) && !p.left && this.isOpen(p.x, p.y)) {
        p.left = true;
        this.leavePatches(p.skill, p.x, p.y, 1.0);
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
        this.blast(t.skill, t.x, t.y, SKILLS[s.id].radius * s.r.size * (this.has('widetraps') ? TALENT_TUNE.wideTraps : 1), t.frac, 'blast');
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
      // (the effects are told a moment ahead, so that each arrow is seen coming down before it lands)
      while (v.told < v.total && v.t >= v.told * TUNE.volleyEvery - VOLLEY_SEEN) {
        for (let c = 0; c < v.count; c++) {
          const at = this.volleySpot(v, v.told, c);
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
          const at = this.volleySpot(v, v.n, c);
          const ax = at.x;
          const ay = at.y;
          let hits = 0;
          for (const m of this.monsters) {
            if (m.dead || Math.hypot(m.x - ax, m.y - ay) > reach + m.r || this.shutIn(m)) continue;
            this.hitMonster(m, v.skill, v.frac, hits >= 3);
            hits++;
          }
          if (hits > 0) this.landed(v.skill);
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
          if (Math.hypot(h.x - z.x, h.y - z.y) <= z.r + 0.1) this.hurtHero(z.dmg, z.element, z.words, null, z.from, z.x, z.y);
        }
        continue;
      }
      if (z.kind === 'rune') {
        if (z.t >= z.dur) {
          this.zones.splice(i, 1);
          this.emit({ t: 'burst', x: z.x, y: z.y, r: z.r, el: z.element, style: 'ruin', words: VOLATILE_ONLY });
          this.emit({ t: 'shake', amount: 3 });
          this.sfx('explode', 0.8);
          for (const m of this.monsters) {
            if (!m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r) this.damageMonster(m, Math.max(1, Math.round(z.dmg)), z.element, false, z.skill);
          }
          this.breakProps(z.x, z.y, z.r, z.skill);
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
      if (z.kind === 'ward') {
        // Guarding behind: it does its work in hurtHero, for as long as it lasts
        if (z.t >= z.dur) this.zones.splice(i, 1);
        continue;
      }
      z.tick -= dt;
      if (z.tick <= 0) {
        z.tick += 0.5;
        const inside = this.monsters.filter((m) => !m.dead && Math.hypot(m.x - z.x, m.y - z.y) <= z.r + m.r * 0.5);
        if (z.kind === 'storm') {
          if (inside.length) {
            const m = this.rng.pick(inside);
            this.emit({ t: 'arc', x0: z.x, y0: z.y, x1: m.x, y1: m.y, sky: true });
            this.damageMonster(m, Math.max(1, Math.round(z.dmg)), 'lightning', false, z.skill);
            this.sfx('thunder', 0.5);
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
        } else {
          for (const m of inside) {
            if (z.kind === 'ice') {
              m.chill = Math.max(m.chillT > 0 ? m.chill : 0, z.slow);
              m.chillT = 0.7;
            }
            this.damageMonster(m, Math.max(1, Math.round(z.dmg * 0.5)), z.element, false, z.skill);
          }
        }
      }
      if (z.t >= z.dur) this.zones.splice(i, 1);
    }
  }

  /** Burning, twice a second. */
  private updateDots(dt: number): void {
    this.dotT -= dt;
    if (this.dotT > 0) return;
    this.dotT += 0.5;
    for (const m of this.monsters) {
      if (!m.dead && m.burnT > 0) this.damageMonster(m, Math.max(1, Math.round(m.burnDps * 0.5)), 'fire', false, m.lastSkill);
      if (!m.dead && m.poisonT > 0 && m.poisonDps > 0) this.damageMonster(m, Math.max(1, Math.round(m.poisonDps * 0.5)), 'phys', false, m.lastSkill, false, undefined, true);
    }
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
  private rollGear(quality: 0 | 1 | 2 | 3 = 0): Item {
    const mf = this.hero.d.stats.magicFind + 25 * this.dungeonWords.length;
    const opts: RollOpts = { forWeapon: this.weapon(), magicFind: mf };
    if (quality === 1) opts.luck = TUNE.betterLuck;
    if (quality >= 2) opts.luck = TUNE.hoardLuck;
    if (quality === 3) opts.atLeast = 1;
    return rollItem(Math.max(1, this.depth), this.rng, opts);
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
    const goldBase = Math.max(1, this.depth);
    if (m.boss) {
      this.addDrop('gold', m.x, m.y, rng.int(25, 45) * goldBase, null, null);
      const n = TUNE.bossItems + (this.depth % 5 === 0 ? TUNE.bossItemsFifth : 0);
      for (let i = 0; i < n; i++) this.addDrop('item', m.x, m.y, 0, this.rollGear(i === 0 ? 3 : 1), null);
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
      this.addDrop('item', m.x, m.y, 0, this.rollGear(2), null);
      this.addDrop('orb', m.x, m.y, 0, null, null);
      return;
    }
    if (m.elite) {
      this.addDrop('gold', m.x, m.y, rng.int(8, 16) * goldBase, null, null);
      if (rng.chance(TUNE.eliteItem)) this.addDrop('item', m.x, m.y, 0, this.rollGear(1), null);
      return;
    }
    if (rng.chance(TUNE.dropGold)) this.addDrop('gold', m.x, m.y, rng.int(TUNE.goldMin, TUNE.goldMax) * goldBase, null, null);
    if (rng.chance(TUNE.dropItem * bonus)) this.addDrop('item', m.x, m.y, 0, this.rollGear(), null);
    if (rng.chance(TUNE.dropOrb)) this.addDrop('orb', m.x, m.y, 0, null, null);
    // (THE FIRST LEVELS: no word falls before the ring is lit, nor in the first dungeon)
    if (rng.chance(TUNE.dropWord * bonus) && this.wordsFall()) this.addDrop('word', m.x, m.y, 0, null, rng.pick(WORD_IDS));
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
      if (dr.age < (dr.kind === 'word' ? TUNE.wordStands : 0.4)) continue;
      const dx = h.x - dr.x;
      const dy = h.y - dr.y;
      const dist = Math.hypot(dx, dy);
      if (dr.kind !== 'item' && dist < TUNE.dropPull && dist > 0.01) {
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
      if (rng.chance(0.4)) this.addDrop('gold', p.x, p.y, rng.int(1, 5) * Math.max(1, this.depth), null, null);
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
        this.addDrop('gold', p.x, p.y + 0.6, this.rng.int(10, 20) * Math.max(1, this.depth) * (room ? 2 : 1), null, null);
        if (this.rng.chance(firstInVault ? TUNE.vaultWord : TUNE.chestWord) && this.wordsFall()) this.addDrop('word', p.x, p.y + 0.6, 0, null, this.rng.pick(WORD_IDS));
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
    if (h.quest && this.level.town) {
      const st = this.level.stations.find((s) => s.kind === 'wordsmith');
      if (st && Math.hypot(st.x - h.x, st.y - h.y) < TUNE.useRange) this.lightRing(st.x, st.y);
    }
    if (c.interact) {
      if (this.level.town) {
        // In town the rules only say which service was asked for; the interface opens its panel.
        const st = this.stationNear();
        if (st) this.emit({ t: 'station', kind: st });
      } else if (this.interactHint() !== null) this.leaveDungeon();
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
      this.hero.potions = TUNE.potionMax;
      this.emit({ t: 'quest', x: b.x, y: b.y });
      // (since Version 19.6 the stone lies by his hand, the art chat's: art/quest3.ts)
      this.msg(`A fallen wordsmith. In his satchel, full flasks; by his hand, ${QUEST_ITEM.the}. Bring it to the wordsmith in town.`, MSG.word);
      return;
    }
    this.drops.push({ x: b.x, y: b.y, kind: 'word', gold: 0, item: null, word: w, age: 0 });
    this.emit({ t: 'wordDrop', word: w, x: b.x, y: b.y });
    // (and their flasks: the second half of the dungeon is met fresh)
    this.hero.potions = TUNE.potionMax;
    this.msg('A fallen wordsmith. In the satchel: full flasks, and a WORD.', MSG.word);
  }

  /** The town service within reach of the hero, if any (the nearest when several are). */
  stationNear(): Station | null {
    const h = this.hero;
    let best: Station | null = null;
    let bd = TUNE.useRange;
    for (const s of this.level.stations) {
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
    if (this.level.town) {
      const st = this.stationNear();
      if (!st) return null;
      return st === 'gate' ? `Gate: dungeon ${this.depth}` : st === 'wordsmith' ? 'Wordsmith' : st === 'armourer' ? 'Armourer' : st === 'mystic' ? 'Mystic' : st === 'lexicon' ? 'Lexicon' : st === 'stranger' ? 'Stranger' : 'Stash';
    }
    const p = this.level.portal;
    const h = this.hero;
    if (!p || p.state !== 1 || Math.hypot(p.x - h.x, p.y - h.y) > 1.8) return null;
    return 'Return to town';
  }

  /** Step through the portal the boss leaves behind. */
  private leaveDungeon(): void {
    this.meta.bestDepth = Math.max(this.meta.bestDepth, this.depth);
    this.cleared++;
    this.depth++;
    this.enterTown();
    this.sfx('portal');
    this.msg(`Dungeon ${this.depth - 1} cleared`, MSG.good);
    // the first time back, say what the town is for
    if (this.cleared === 1) this.msg('Sell to the armourer or the mystic. The gate burns words into the next dungeon. The Lexicon is the book of what you know.', MSG.plain);
  }

  // ===========================================================================================
  // The town's services. Each returns a reason (to show the player) when it cannot be done.

  /** Why a word cannot be laid on the gate, or null if it can. */
  planProblem(word: WordId): string | null {
    if (this.hero.words[word] <= 0) return 'No spare word';
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
    if (h.words[word] <= 0) return 'No spare word';
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
    return kind ? Math.max(1, Math.round(plainValue(kind.slot, Math.max(1, this.depth)) * TUNE.gambleMult)) : 0;
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
    const it = rollItem(Math.max(1, this.depth), this.rng, { slot: kind.slot, rarity, weapons: kind.weapon ? [kind.weapon] : undefined });
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
    if (h.words[word] <= 0) return 'No spare word';
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

  /** A hit a talent makes by itself (Storm Warp, Stormcaller): `share` of the hero's weapon hit, of element `el`. */
  private talentHit(el: Element, share: number): number {
    const h = this.hero;
    const st = h.d.stats;
    const pct = el === 'fire' ? st.firePct : el === 'frost' ? st.frostPct : el === 'lightning' ? st.lightPct : st.physPct;
    return Math.max(1, Math.round(((h.d.dmgMin + h.d.dmgMax) / 2) * share * (1 + (st.dmgPct + pct) / 100)));
  }

  /** Berserk: below half his life. */
  berserking(): boolean {
    const h = this.hero;
    return this.has('berserk') && h.life < h.d.maxLife * TALENT_TUNE.berserk.below;
  }

  /** How high Power's and Frenzied's stacks go: five, eight with Fury. */
  private stackMax(): number {
    return this.has('fury') ? TALENT_TUNE.fury : FRENZY.max;
  }

  /** What the talents add to the hero's speed now (%): Momentum after a kill, Windrunner after a roll. */
  private talentSpeed(): number {
    return (this.momentumT > 0 ? TALENT_TUNE.momentum.speed : 0) + (this.windT > 0 ? TALENT_TUNE.windrunner.speed : 0);
  }

  /** The talents' own clocks, each frame: standing still, the speeds wearing off, Stormcaller's bolts. */
  private updateTalents(dt: number, walked: number): void {
    const h = this.hero;
    this.stillT = walked > 0.001 || h.move ? 0 : this.stillT + dt;
    if (this.momentumT > 0) this.momentumT -= dt;
    if (this.windT > 0) this.windT -= dt;
    if (this.has('stormcaller') && !this.level.town && !this.over) {
      this.stormT -= dt;
      if (this.stormT <= 0) {
        const T = TALENT_TUNE.stormcaller;
        let best: Monster | null = null;
        let bd = T.reach;
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
    if (this.hero.words[word] <= 0) return 'No spare word';
    if (g[to.idx] === word) return 'Already there';
    // what the side would hold with the word in that place (whatever was there has gone back to the pouch)
    const after = g.slice();
    after[to.idx] = word;
    const ws = after.filter((w): w is WordId => w !== null);
    if (new Set(ws).size !== ws.length) return 'Already there';
    // (ONE DAMAGE WORD A SIDE: his answer, 8 Oct 2026, 16:53; before Version 19.3, one element a side)
    if (ws.filter((w) => WORDS[w].kind === 'damage').length > 1) return 'One damage word per side';
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
    if (!s || h.words[word] <= 0) return 'No spare word';
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
