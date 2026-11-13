// UNIQUE ITEMS. His design, settled with him in the Uniques chat on 11 Nov 2026 and kept in his doc “Wordsmith: Unique Items”
// (https://claude.ai/artifact/TLDCXZF1LNUS7VJHzATsAB): 62 of them, every one with his yes. His rules, in his words:
//   4 Oct 2026: “And then unique items will be orange. Those will come later but they will have 1-2 unique modifiers that can't be
//     rolled on normal gear. I like the path of exile approach where uniques aren't quite as good as a well rolled, well crafted
//     yellow item. But the unique modifier can be build enabling and you sacrifice raw stats for a cool interaction”.
//   11 Nov 2026: “They may have other stats, and those may have a range, but those will always be the same and the uniques are
//     uncraftable”; “We’ll have designated boss drops but also a regular pool of uniques that can drop from anywhere”; of drawbacks,
//     “Some may, same may not. We can take a look at them when they’re developed”; “Nah I don’t think there’s going to be any weapon
//     swapping” (a weapon unique is its hero's unique); it is “cooldown”, not “wait” (“Yes but say no cooldown”).
//   The stranger's gamble has “a very low chance to give a unique” (4 Oct); the endless final boss is where “we’ll put some really
//     strong unique drops” (7 Nov).
//
// BEHIND `UNIQUES`, OFF: with it off no unique is ever made, dropped or gambled for, and nothing a unique does is done (Game.wears
// answers no); the game is as it was. His pick, 11 Nov 2026: “Queue the build (Recommended)”: built behind a switch until his yes.
//
// WHAT IS HIS TO SAY, AND NOT YET SAID: EVERY NUMBER HERE. UNIQUE_TUNE (how much, how long), UNIQUE_DROPS (the odds, the stranger's
// among them) and each unique's ordinary stats (UNIQUE_DEFS `stats`) are this build's proposal, set out for him in
// docs/uniques/NUMBERS.md; the names are placeholders, his to change; each drawback gets his look once it can be played.
//
// What is here: the list (UNIQUE_DEFS), the numbers, how one is made (makeUnique), which may drop where (poolFor, bossUnique), and
// what the ones that bend wordsmithing do to an attack's words (bendWords: no game needed, so it is tested alone). What the rest do
// is in game/game.ts, each where it happens, under “UNIQUE ITEMS”.

import type { RNG } from '../engine/rng';
import { TUNE, WORDS } from './defs';
import { makeSetUniqueItem, makeUniqueItem, stemSlot, stemWeapon } from './items';
import { isDamageWord, isMeld, meldOf } from './melds';
import type { ClassId, EquipSlot, Item, MeldId, MonsterKind, Slot, StatKey, StatMod, WeaponKind, WordId } from './types';
import { EQUIP_SLOTS } from './types';

/**
 * UNIQUE ITEMS: ON, at his yes. Played on his test page (https://claude.ai/artifact/TDTUvbr5FhjV56vrCu3Tbs), asked whether to
 * keep them made at the level of the floor they drop on and what his word on the numbers was, 12 Nov 2026, by 18:1x Eastern:
 * “Keep it; numbers right, switch on”.
 */
export const UNIQUES = { on: true };

// =============================================================================================
// THE NUMBERS (every one a proposal, his to change: docs/uniques/NUMBERS.md)

export const UNIQUE_TUNE = {
  /** “Half as strong again”: how much stronger a word's own figure is (the Seal, the Band, the Alloy Band, the Songbird). Two of them worn add up: twice as strong, not two and a quarter. */
  half: 0.5,
  /** THE NETTLE SHIRT, her Vow: his words this much stronger for every so many seconds unhit, up to so much. A hit starts it over. */
  nettle: { each: 0.1, every: 3, most: 0.5 },
  /** THE MOTH'S WING: this much less from every hit; each hit darkens one of his words for so many seconds (one word dark at a time). */
  moth: { less: 0.3, dark: 4 },
  /** THE KING'S KNOT: the word of a monster he kills is in front of his tap attack for so many seconds. */
  knot: { secs: 6 },
  /** BLOODPRICE: a flask heals nothing; he hits this much harder for so many seconds. */
  bloodprice: { more: 0.6, secs: 6 },
  /** THE FREE HAND: with a wand or a tome and no focus, this much attack speed (%) and critical damage (%). */
  freeHand: { atkSpeed: 20, critMult: 50 },
  /** THE HALF-CARVED HAND: below this share of his life, his attacks this much faster and his feet this much faster. */
  halfHand: { below: 0.5, attack: 0.3, move: 0.2 },
  /** THE STANDING STONE: stood still this long, he takes this much less and nothing shoves him. */
  stone: { after: 0.4, less: 0.4 },
  /** THE LONG ODDS: elites and bosses struck this much harder, everything else this much softer. */
  odds: { more: 0.4, less: 0.25 },
  /** THE MISER'S PURSE: this much harder for each gold piece carried (the Tinkerer's Fortune talent's own rate: 1,000 gold, 10%); each hit he takes spills this share of his gold on the floor. */
  purse: { each: 0.0001, spill: 0.02 },
  /** THE PHYSICIAN'S COAT: a flask back for every so many hits landed on elites and bosses; none from kills. */
  coat: { hits: 12 },
  /** THE WARDEN'S KEYS: a sealed door opens when he comes this near; every chest holds this many more pieces. */
  keys: { reach: 1.7, more: 1 },
  /** THE CRIER'S HUSH: a monster this near him has its words darkened (not a boss's: his to say). */
  hush: { reach: 2.5, bosses: false },
  /**
   * THE DROWNED ARM: every so many seconds a tentacle comes up under the enemy he is fighting (one he struck within `fresh` seconds,
   * within `reach`), slamming all within `r` of it for this share of his hit, `lead` seconds after it is seen, and stunning what it
   * slams for `stun` seconds (not a boss; an elite half as long, as every stun). ALLY DAMAGE (game.ts allyDamage). His words, 12 Nov
   * 2026, of every 5 seconds: “It doesn’t seem very good if that’s all it does every 5 seconds”; his pick, “Every 3s, and it stuns
   * (Recommended)” (offered as: comes up more often, and whatever it slams is stunned for a moment). The stun's length, the main
   * chat's: a moment, 0.6 s (two quick Smashes of the Warrior's stun for 1 s).
   */
  arm: { every: 3, share: 2, r: 1.3, lead: 0.5, reach: 9, fresh: 3, stun: 0.6 },
  /** THE QUEEN'S TALONS: each critical hit calls a bird that dives on the nearest enemy for this share of his hit, `dive` seconds after; no more often than `gap`. */
  talons: { share: 0.6, dive: 0.35, gap: 0.4, reach: 7 },
  /** THE FLESHMANCER'S BRAND: an elite he kills rises and fights for him for so many seconds, each blow this share of his hit, a blow every so often. One at a time. */
  brand: { secs: 15, share: 0.6, every: 1.2, reach: 1.1, speed: 4.6, leash: 8 },
  /** THE WINDCUTTER: every so many Strikes in a row a blade of wind flies on, this share of the Strike, so far, so fast, half this wide. */
  windcutter: { every: 3, share: 1.5, range: 7, speed: 15, half: 0.8 },
  /** THE PIVOT: Lunge ends in so many cuts of Whirlwind, this far apart. */
  pivot: { cuts: 2, gap: 0.25 },
  /** THE PRESS: this much harder for each enemy within `near` tiles of him, up to so much. */
  press: { each: 0.08, most: 0.4, near: 3 },
  /** THE FAN: so many arrows, fanned this far apart (radians), each this share of a Shot. One enemy takes only one of them. */
  fan: { arrows: 3, spread: 0.2, share: 0.7 },
  /** THE POACHER'S BOW: the trap a Volley leaves bursts for this share of a Trap's. */
  poacher: { share: 1 },
  /** THE HAIR TRIGGER: an arrow crossing within this of a trap sets it off, this many times as hard. */
  trigger: { near: 0.7, mult: 2 },
  /** THE SHEPHERD'S CROOK: the Orb comes after him at this pace (tiles a second) and stops this near. */
  crook: { speed: 4.5, near: 1.6 },
  /** THE TIDE: the Wave comes back for this share of its hit. */
  tide: { share: 0.7 },
  /** THE TUNING STAFF: a Wave through the Orb makes it pulse this many times as hard. */
  tuning: { mult: 2 },
  /** THE PRISM: what the two elements a hit is not leave on it: a chill of this much, a burn of this share of the hit over three seconds. */
  prism: { chill: 0.3, burn: 0.3 },
  /** THE SHORT WAY: Warp again within so many seconds to snap back to where she started. */
  shortWay: { secs: 2 },
  /** THE LEDGER OF DEBTS: the Hellfire Bolt this much harder for each cursed enemy within `near` tiles, up to so much. */
  ledger: { each: 0.1, most: 1, near: 6 },
  /** THE RESTLESS TOME: it circles him this far out, once round in so many seconds; what it touches burns in his hellfire as from a hit of this share of his; the same enemy not again for so long. */
  tome: { r: 1.8, turn: 1.6, share: 0.5, again: 1, touch: 0.55 },
  /** THE UNSIGNED PACT: the pact dry, the demon stays and takes this share of his life each second; at this share of his life it lets him go. */
  pact: { drain: 0.03, floor: 0.1 },
  /** THE SECOND WHISTLE: so many more Golems. */
  whistle: { more: 1 },
  /** THE STICKY WRENCH: a vial sticks to what it lands on (within `grab`) and bursts this long after, this many times as wide. */
  sticky: { fuse: 0.7, wide: 2, grab: 0.9 },
  /** THE FOREMAN'S WRENCH: each Golem's vial is this share of hers. */
  foreman: { share: 0.6 },
  /** THE TOW LINE: the Golem's landing pound, this share of its ground pound. */
  tow: { share: 1 },
  /** THE COMPANY SCRIP: a whistle or a Blast Jump costs this much gold for each floor of the dungeon's depth. Not enough gold: its cooldown, as ever. */
  scrip: { gold: 3 },
  /** THE FOURTH GLOBE: his combos hold so many globes. */
  fourth: { globes: 4 },
  /** THE WINNING STREAK: each combo finished, his blows this much harder, up to so much. A hit he takes ends it. */
  streak: { each: 0.06, most: 0.6 },
  /** THE SPRUNG HEELS: so many jumps. */
  heels: { jumps: 2 },
  /** THE RECEIPT: a blow from within this of straight ahead (cosine), from within `reach`, answered with a punch of this share of his hit; no more often than `gap`. */
  receipt: { share: 1, cos: 0.5, reach: 2.6, gap: 0.4 },
};

/**
 * WHERE THEY DROP, AND HOW OFTEN (every number a proposal: docs/uniques/NUMBERS.md).
 *   `boss`: a boss drops his own unique this often, each time he dies.
 *   `pool`: each piece of gear that drops is a pool unique instead this often: from an ordinary monster (`plain`), an elite
 *     (`elite`), a hoard, which is a boss's, a guardian's or a chest's (`hoard`); magic find multiplies it, as it does a rare's
 *     chance; none before floor `from`.
 *   `gamble`: the stranger's, TUNE.gambleOdds.unique (defs.ts: 0.005, there since Version 14.5 for this): one throw in 200.
 *   `final`: the endless final boss, one of his two this often (he is not built yet: nothing asks for it).
 * WHAT THEY COME TO, counted on real floors (tools/unique_odds.ts: about 27 pieces of gear drop on a floor, nearly half of them
 * from hoards): in a run of twenty floors with no magic find, between two and three of the pool's and two of the bosses' own.
 * Rares, for scale: about sixty in the same run.
 */
export const UNIQUE_DROPS = {
  boss: 0.1,
  pool: { plain: 0.002, elite: 0.004, hoard: 0.008, from: 2 },
  final: 0.25,
  /** THE LEVELING UNIQUES (LEVEL_DEFS): a roll of their own, as often as the pool's, on any floor; the pool's odds are not touched. */
  level: { plain: 0.002, elite: 0.004, hoard: 0.008 },
};

/** How the rules read what he has not settled, each one line to change. */
export const UNIQUE_RULES = {
  /** A hero-only piece on another hero: he may wear it (its ordinary stats count) and its rule does nothing. False: he may not wear it at all. */
  othersWear: true,
  /** The pool gives a hero the ten for everyone and his own five (his weapon's three, his two): never another hero's. */
  ownOnly: true,
};

// =============================================================================================
// THE LIST

export type UniqueFrom = 'pool' | 'boss' | 'final' | 'level';

export interface UniqueDef {
  id: string;
  /** A placeholder, his to change. */
  name: string;
  /** The kind of base it is made on (game/items.ts stems: 'hood', 'lifering', 'greatsword'). */
  stem: string;
  from: UniqueFrom;
  /** A boss's: the kind (or the pair) that drops it, and his floor. */
  boss?: readonly MonsterKind[];
  floor?: number;
  /** Whose it is: a weapon unique's hero, a hero-only piece's. Absent: anyone's. */
  cls?: ClassId;
  /** A hero-only piece: it names him and works only for him. */
  only?: true;
  /** Which half of his “Half and half”: it bends wordsmithing, or the hero's rules. */
  bends: 'words' | 'hero';
  /** Its ordinary stats, always these, only their numbers rolled. None: “Nothing else on it”. */
  stats: readonly StatKey[];
  /** A word it adds that is not in every build (one of the ten new words): until that word is in, the piece adds nothing. */
  word?: string;
  /** The level it asks for, where that is not its item level's. */
  reqLevel?: number;
  /** What it does, as its card says it (with the numbers; a leveling unique's as `it` rolled them). */
  does: (it?: Item) => string[];
  /** Its price, as its card says it; absent, none. */
  price?: (it?: Item) => string;
  /** THE LEVELING UNIQUES (LEVEL_DEFS): its level, set; it drops on any floor whose level is that or past it. */
  level?: number;
  /** THE LEVELING UNIQUES: its stats, each rolled in its own range (one roll for all of `stats` where there are more). */
  rolls?: readonly LevelRoll[];
  /** THE LEVELING UNIQUES: its own rule's numbers, each rolled in its range, kept on the piece (Item.uroll). */
  specials?: Readonly<Record<string, readonly [number, number]>>;
  /**
   * How many special modifiers it has, where that is not one (his rule, 4 Oct 2026: “1-2 unique modifiers that can't be rolled
   * on normal gear”). Only The Warden's Keys has two (the doors, the chests). Not the count of `does` lines: Bloodprice's
   * second line only says how its one works. Its pips count them (ui/panels.ts drawItemPips).
   */
  powers?: number;
}

const T = UNIQUE_TUNE;
const pc = (n: number): string => `${Math.round(n * 100)}%`;
const HALF = (): string => `${pc(T.half)} stronger`;

/** The 62, in the order of his doc. */
export const UNIQUE_DEFS: readonly UniqueDef[] = [
  // ---- FIRST BATCH: THE SIX THAT BEND WORDSMITHING ----
  { id: 'twofacedmask', name: 'Two-Faced Mask', stem: 'hood', from: 'pool', bends: 'words', stats: [], does: () => ['The first word in front of your tap attack also works as if set behind it.'] },
  { id: 'censorsseal', name: "The Censor's Seal", stem: 'lifering', from: 'boss', boss: ['censor'], floor: 15, bends: 'words', stats: ['atkSpeed', 'critChance'], does: () => [`The words on your tap attack are ${HALF()}.`], price: () => 'Your hold attack takes no words.' },
  { id: 'quillsband', name: "The Quill's Band", stem: 'lifering', from: 'boss', boss: ['scraper', 'quill'], floor: 13, bends: 'words', stats: ['maxMana', 'int'], does: () => [`The words on your hold attack are ${HALF()}.`], price: () => 'Your tap attack takes no words.' },
  { id: 'polyglotsmantle', name: "Polyglot's Mantle", stem: 'robe', from: 'pool', bends: 'words', stats: [], does: () => ['Every attack takes two damage words on a side, each with its full effect.'] },
  { id: 'longecho', name: 'The Long Echo', stem: 'greaves', from: 'pool', bends: 'words', stats: ['moveSpeed', 'maxLife'], word: 'lasting', does: () => ['Adds LASTING to every attack. No slot used.'] },
  { id: 'thirdword', name: 'The Third Word', stem: 'intamulet', from: 'final', bends: 'words', stats: [], does: () => ['A third word slot in front of your tap attack.'] },

  // ---- FIRST BATCH: THE EIGHT THAT BEND THE HERO ----
  { id: 'brokenshackles', name: 'Broken Shackles', stem: 'greaves', from: 'boss', boss: ['chained'], floor: 3, bends: 'hero', stats: ['moveSpeed'], does: () => ['Your swipe move has no cooldown.'], price: () => 'You can be hit during the move.' },
  { id: 'bloodprice', name: 'Bloodprice', stem: 'heavybelt', from: 'pool', bends: 'hero', stats: ['maxLife', 'str'], does: () => [`Drinking a flask makes you hit ${pc(T.bloodprice.more)} harder for ${T.bloodprice.secs} seconds.`, 'Kills still refill them.'], price: () => 'Flasks no longer heal.' },
  { id: 'freehand', name: 'The Free Hand', stem: 'silkgloves', from: 'pool', bends: 'hero', stats: ['int', 'critChance'], does: () => [`With a wand or a tome and no focus beside it: +${T.freeHand.atkSpeed}% Attack Speed, +${T.freeHand.critMult}% Critical Damage.`], price: () => 'The focus.' },
  { id: 'millstone', name: 'The Millstone', stem: 'greatsword', from: 'pool', cls: 'warrior', bends: 'hero', stats: ['areaPct', 'lifeOnHit'], does: () => ['Whirlwind has no time limit: you spin for as long as you hold.'] },
  { id: 'rainwalker', name: 'The Rainwalker', stem: 'bow', from: 'pool', cls: 'ranger', bends: 'hero', stats: ['areaPct', 'dex'], does: () => ['Volley rains around you, and moves with you.'] },
  { id: 'shepherdscrook', name: "The Shepherd's Crook", stem: 'staff', from: 'pool', cls: 'mage', bends: 'hero', stats: ['areaPct', 'int'], does: () => ['The Orb follows you.'] },
  { id: 'secondwhistle', name: 'The Second Whistle', stem: 'wrench', from: 'pool', cls: 'tinkerer', bends: 'hero', stats: ['dmgPct', 'int'], does: () => ['One more Golem, at full strength.'] },
  { id: 'lastround', name: 'The Last Round', stem: 'wraps', from: 'pool', cls: 'brawler', bends: 'hero', stats: ['critMult', 'str'], does: () => ['The third globe of every combo sets itself in fire, the jump not spent.'] },

  // ---- SECOND BATCH: EIGHT BOSS DROPS ----
  { id: 'headsmanshood', name: "The Headsman's Hood", stem: 'hood', from: 'boss', boss: ['headsman'], floor: 2, bends: 'words', stats: [], word: 'culling', does: () => ['Adds CULLING in front of your tap attack. No slot used.'] },
  { id: 'fleshmancersbrand', name: "The Fleshmancer's Brand", stem: 'silkgloves', from: 'boss', boss: ['fleshmancer'], floor: 5, bends: 'hero', stats: ['int', 'lifeOnHit'], does: () => [`An elite you kill rises and fights for you for ${T.brand.secs} seconds. One at a time.`] },
  { id: 'cantorsecho', name: "The Cantor's Echo", stem: 'lifering', from: 'boss', boss: ['cantor'], floor: 8, bends: 'words', stats: ['critChance', 'maxMana'], does: () => ['Adds TWIN behind your hold attack. No slot used.'] },
  { id: 'drownedarm', name: 'The Drowned Arm', stem: 'stramulet', from: 'boss', boss: ['eye'], floor: 10, bends: 'hero', stats: ['maxLife', 'physPct'], does: () => [`Every ${T.arm.every} seconds a tentacle bursts up under the enemy you are fighting and slams it for ${pc(T.arm.share)} of your hit, stunning it for a moment.`] },
  { id: 'criershush', name: "The Crier's Hush", stem: 'hood', from: 'boss', boss: ['crier'], floor: 11, bends: 'words', stats: ['cdr', 'frostRes'], does: () => ['A monster standing close to you has its words darkened: they do nothing.'] },
  { id: 'kingsknot', name: "The King's Knot", stem: 'sash', from: 'boss', boss: ['ratking'], floor: 12, bends: 'words', stats: ['maxLife', 'magicFind'], does: () => [`Kill a monster that carries a word: your tap attack carries it too for ${T.knot.secs} seconds.`] },
  { id: 'physicianscoat', name: "The Physician's Coat", stem: 'robe', from: 'boss', boss: ['physician'], floor: 14, bends: 'hero', stats: ['maxLife', 'lifeRegen'], does: () => [`Flasks refill from the hits you land on elites and bosses: one for every ${T.coat.hits}.`], price: () => 'No refills from kills.' },
  { id: 'queensglass', name: "The Queen's Glass", stem: 'manaring', from: 'boss', boss: ['gqueen'], floor: 18, bends: 'words', stats: ['critChance', 'dex'], word: 'mirroring', does: () => ['Adds MIRRORING in front of your tap attack. No slot used.'] },

  // ---- THIRD BATCH: THE NINE BOSSES LEFT ----
  { id: 'wardenskeys', name: "The Warden's Keys", stem: 'heavybelt', from: 'boss', boss: ['warden'], floor: 1, bends: 'hero', stats: ['goldFind', 'magicFind'], powers: 2, does: () => ['Every sealed word door opens to you without its word.', `Every chest holds ${T.keys.more === 1 ? 'one more piece' : `${T.keys.more} more pieces`}.`] },
  { id: 'amalgamsheart', name: "The Amalgam's Heart", stem: 'intamulet', from: 'boss', boss: ['amalgam'], floor: 4, bends: 'words', stats: ['maxLife', 'areaPct'], does: () => ['When the two words in front of your tap attack can be melded, it gets their meld as well. No melding, no runedust.'] },
  { id: 'halfcarvedhand', name: 'The Half-Carved Hand', stem: 'gauntlets', from: 'boss', boss: ['unfinished'], floor: 6, bends: 'hero', stats: ['str', 'maxLife'], does: () => [`Below half life you attack ${pc(T.halfHand.attack)} faster and move ${pc(T.halfHand.move)} faster.`], price: () => 'The danger.' },
  { id: 'queenstalons', name: "The Queen's Talons", stem: 'leatherboots', from: 'boss', boss: ['queen'], floor: 7, bends: 'hero', stats: ['dex', 'maxLife'], does: () => [`Each critical hit calls one of her birds: it dives on the nearest enemy for ${pc(T.talons.share)} of your hit.`] },
  { id: 'hollowcrown', name: 'The Hollow Crown', stem: 'helm', from: 'boss', boss: ['stag'], floor: 9, bends: 'words', stats: ['maxLife', 'cdr'], does: () => ['Adds BINDING behind your swipe move: a snare left where you dodge from. No slot used.'] },
  { id: 'nettleshirt', name: 'The Nettle Shirt', stem: 'jerkin', from: 'boss', boss: ['princess'], floor: 16, bends: 'words', stats: ['dex', 'maxLife'], does: () => [`Her Vow: your words grow ${pc(T.nettle.each)} stronger for every ${T.nettle.every} seconds you go unhit, up to ${pc(T.nettle.most)}.`], price: () => 'A hit breaks the vow, and it starts over.' },
  { id: 'dancingshoes', name: 'The Dancing Shoes', stem: 'leatherboots', from: 'boss', boss: ['prince'], floor: 17, bends: 'hero', stats: ['dex', 'magicFind'], does: () => ['Nothing can slow you or hold you in place.'] },
  { id: 'clockworksongbird', name: 'The Clockwork Songbird', stem: 'dexamulet', from: 'boss', boss: ['gking'], floor: 19, bends: 'words', stats: ['maxLife', 'critMult'], does: () => [`While your life is full the bird sings, and your words are ${HALF()}.`], price: () => 'It falls silent when you are hurt.' },
  { id: 'mothswing', name: "The Moth's Wing", stem: 'robe', from: 'boss', boss: ['moth'], floor: 20, bends: 'hero', stats: ['maxLife', 'lifeRegen'], does: () => [`You take ${pc(T.moth.less)} less damage from every hit.`], price: () => `Each hit you take darkens one of your words for ${T.moth.dark} seconds. Only one word is ever dark.` },

  // ---- MORE FOR THE POOL, AND ONE MORE FOR THE FINAL BOSS ----
  { id: 'dogearedpage', name: 'The Dog-Eared Page', stem: 'intamulet', from: 'pool', bends: 'words', stats: [], reqLevel: 1, does: () => ['All your word slots are open, whatever your level.'] },
  { id: 'ghostwriter', name: 'The Ghostwriter', stem: 'lifering', from: 'final', bends: 'words', stats: ['maxMana', 'dex'], does: () => ['Your swipe move also carries every word set on your tap attack.'] },
  { id: 'miserspurse', name: "The Miser's Purse", stem: 'heavybelt', from: 'pool', bends: 'hero', stats: ['goldFind', 'maxLife'], does: () => [`The more gold you carry, the harder you hit: ${pc(T.purse.each * 1000)} for every 1,000.`], price: () => `Every hit you take spills ${pc(T.purse.spill)} of your gold.` },
  { id: 'alloyband', name: 'The Alloy Band', stem: 'lifering', from: 'pool', bends: 'words', stats: ['int', 'maxMana'], does: () => [`Melded words set in your attacks are ${HALF()}.`] },
  { id: 'longodds', name: 'The Long Odds', stem: 'helm', from: 'pool', bends: 'hero', stats: ['maxLife', 'magicFind'], does: () => [`You hit elites and bosses ${pc(T.odds.more)} harder.`], price: () => `You hit everything else ${pc(T.odds.less)} softer.` },
  { id: 'standingstone', name: 'The Standing Stone', stem: 'greaves', from: 'pool', bends: 'hero', stats: ['maxLife', 'lightRes'], does: () => [`While you stand still you take ${pc(T.stone.less)} less damage and nothing can shove you.`] },

  // ---- FOR EACH WEAPON AND EACH HERO: THE WARRIOR ----
  { id: 'windcutter', name: 'The Windcutter', stem: 'greatsword', from: 'pool', cls: 'warrior', bends: 'hero', stats: ['atkSpeed', 'critChance'], does: () => [`Every third Strike in a row sends a blade of wind on ahead, through everything in its line, for ${pc(T.windcutter.share)} of the Strike.`] },
  { id: 'undertow', name: 'The Undertow', stem: 'greatsword', from: 'pool', cls: 'warrior', bends: 'words', stats: ['areaPct', 'str'], does: () => ['Adds PULLING in front of your hold attack: Whirlwind drags in what it cuts. No slot used.'] },
  { id: 'pivot', name: 'The Pivot', stem: 'greaves', from: 'pool', cls: 'warrior', only: true, bends: 'hero', stats: ['moveSpeed', 'str'], does: () => ['Lunge ends in a free turn of Whirlwind where you land.'] },
  { id: 'press', name: 'The Press', stem: 'gauntlets', from: 'pool', cls: 'warrior', only: true, bends: 'hero', stats: ['str', 'lifeOnHit'], does: () => [`You hit ${pc(T.press.each)} harder for each enemy close round you, up to ${pc(T.press.most)}.`] },

  // ---- THE RANGER ----
  { id: 'fan', name: 'The Fan', stem: 'bow', from: 'pool', cls: 'ranger', bends: 'hero', stats: ['atkSpeed', 'critChance'], does: () => ['Each Shot looses three arrows in a fan.'], price: () => `Each arrow hits for ${pc(T.fan.share)}.` },
  { id: 'poachersbow', name: "The Poacher's Bow", stem: 'bow', from: 'pool', cls: 'ranger', bends: 'hero', stats: ['dmgPct', 'dex'], does: () => ['Where a Volley falls, it leaves one of your traps.'] },
  { id: 'packcollar', name: 'The Pack Collar', stem: 'dexamulet', from: 'pool', cls: 'ranger', only: true, bends: 'hero', stats: ['maxLife', 'lifeOnKill'], does: () => ['One more companion, at full strength: a second pick from the same list.'] },
  { id: 'hairtrigger', name: 'The Hair Trigger', stem: 'leathergloves', from: 'pool', cls: 'ranger', only: true, bends: 'hero', stats: ['critChance', 'dex'], does: () => ['An arrow of yours that crosses one of your traps sets it off at once, twice as hard.'] },

  // ---- THE MAGE ----
  { id: 'tide', name: 'The Tide', stem: 'staff', from: 'pool', cls: 'mage', bends: 'hero', stats: ['dmgPct', 'critChance'], does: () => [`The Wave comes back: it turns and passes through everything again on its way home, for ${pc(T.tide.share)}.`] },
  { id: 'tuningstaff', name: 'The Tuning Staff', stem: 'staff', from: 'pool', cls: 'mage', bends: 'hero', stats: ['atkSpeed', 'areaPct'], does: () => ['A Wave that passes through your Orb makes it pulse at once, twice as hard.'] },
  { id: 'prism', name: 'The Prism', stem: 'intamulet', from: 'pool', cls: 'mage', only: true, bends: 'hero', stats: ['dmgPct', 'maxMana'], does: () => ['Fire, frost and lightning each count as all three: what burns is chilled and shocked too.'] },
  { id: 'shortway', name: 'The Short Way', stem: 'leatherboots', from: 'pool', cls: 'mage', only: true, bends: 'hero', stats: ['maxMana', 'int'], does: () => [`Warp again within ${T.shortWay.secs} seconds to snap back to where you started.`] },

  // ---- THE WARLOCK ----
  { id: 'ledgerofdebts', name: 'The Ledger of Debts', stem: 'tome', from: 'pool', cls: 'warlock', bends: 'hero', stats: ['firePct', 'int'], does: () => [`The Hellfire Bolt hits ${pc(T.ledger.each)} harder for every cursed enemy near you, up to ${pc(T.ledger.most)}.`] },
  { id: 'restlesstome', name: 'The Restless Tome', stem: 'tome', from: 'pool', cls: 'warlock', bends: 'hero', stats: ['firePct', 'critMult'], does: () => ['The tome leaves your hand and swirls around you. It puts hellfire on any enemy it touches.'] },
  { id: 'burningverse', name: 'The Burning Verse', stem: 'tome', from: 'pool', cls: 'warlock', bends: 'hero', stats: ['dmgPct', 'lifeOnKill'], does: () => ['A burn you cause on a cursed enemy never goes out.'] },
  { id: 'unsignedpact', name: 'The Unsigned Pact', stem: 'stramulet', from: 'pool', cls: 'warlock', only: true, bends: 'hero', stats: ['maxLife', 'lifeOnKill'], does: () => ['The demon does not burn out. When the pact runs dry it stays, for as long as you can pay.'], price: () => `It feeds on your life: ${pc(T.pact.drain)} a second.` },
  { id: 'clovenboots', name: 'The Cloven Boots', stem: 'greaves', from: 'pool', cls: 'warlock', only: true, bends: 'hero', stats: ['moveSpeed', 'str'], does: () => ['While the demon has you, Smoke Step has no cooldown.'] },

  // ---- THE TINKERER ----
  { id: 'stickywrench', name: 'The Sticky Wrench', stem: 'wrench', from: 'pool', cls: 'tinkerer', bends: 'hero', stats: ['areaPct', 'dex'], does: () => ['Vials stick to what they hit and burst a moment later, twice as wide.'] },
  { id: 'foremanswrench', name: "The Foreman's Wrench", stem: 'wrench', from: 'pool', cls: 'tinkerer', bends: 'hero', stats: ['atkSpeed', 'int'], does: () => ['Whenever you toss a vial, each of your Golems lobs one as well.'] },
  { id: 'towline', name: 'The Tow Line', stem: 'heavybelt', from: 'pool', cls: 'tinkerer', only: true, bends: 'hero', stats: ['maxLife', 'dex'], does: () => ['The Golem rides the Blast Jump with you and lands with a ground pound.'] },
  { id: 'companyscrip', name: 'The Company Scrip', stem: 'lifering', from: 'pool', cls: 'tinkerer', only: true, bends: 'hero', stats: ['goldFind', 'dex'], does: () => ['The whistle and the Blast Jump have no cooldown.'], price: () => 'Each use costs gold.' },

  // ---- THE BRAWLER ----
  { id: 'fourthglobe', name: 'The Fourth Globe', stem: 'wraps', from: 'pool', cls: 'brawler', bends: 'hero', stats: ['atkSpeed', 'dex'], does: () => ['Your combos hold four globes: one more blow before the combo locks.'] },
  { id: 'winningstreak', name: 'The Winning Streak', stem: 'wraps', from: 'pool', cls: 'brawler', bends: 'hero', stats: ['physPct', 'lifeOnHit'], does: () => [`Every combo you finish makes your blows hit ${pc(T.streak.each)} harder, up to ${pc(T.streak.most)}.`], price: () => 'Getting hit ends the streak.' },
  { id: 'sprungheels', name: 'The Sprung Heels', stem: 'leatherboots', from: 'pool', cls: 'brawler', only: true, bends: 'hero', stats: ['dex', 'maxLife'], does: () => ['You can jump again in the air: a second jump before you land.'] },
  { id: 'receipt', name: 'The Receipt', stem: 'gauntlets', from: 'pool', cls: 'brawler', only: true, bends: 'hero', stats: ['str', 'maxLife'], does: () => ['A blow you take from in front is answered at once with a free punch.'] },
];

export type UniqueId = string;

// =============================================================================================
// THE LEVELING UNIQUES
//
// HIS IDEA, 12 Nov 2026, 18:19 Eastern, told the 62 are made at the level of the floor they drop on: “i like that idea,
// especially for uniques that dont have values for what their special mods do.  but i also want some uniques that are specific
// to the level and drop for leveling.  like level 1 uniques boots with nothing but 20% movement speed.  things to twink out
// your character.  or a battle axe that deals no physical damage but deals 150% poison damage and has 10-20 flat poison damage
// on it.” HIS PICKS, by pop-up, the same evening (docs/uniques/LEVELING.md has them all): where they drop, “Any level higher
// than its base level.  So some crazy endgame unique can’t drop in level 1 but a level 1 unique can drop in endless.”; who
// wears them, “Anyone, unless it's a hero's weapon (Recommended)”; how many, “About 20, spread more evenly”, “Levels 1 to 30:
// 15 on the way, 5 endgame (Recommended)”; each of the twenty one pop-up at a time, as written here; and of their numbers, “If
// one has a roll, they all have to have a roll.  And I think we want rolls” (read as, told him: each rolls from about a fifth
// under to a fifth over what was agreed; The Last Word's price 50 to 100%, his own range). AND THE ENDGAME RULE, his words of
// two of them: “Things that are going to exceed what a yellow rare item can roll without a drawback are going to be BiS.  And
// will hurt build diversity”: past level 20, past a rare's best only with a price.
// Each is its level's own: made at its level, asking for it, its numbers its own and never grown with the floor. A piece of armour
// or jewellery carries nothing of its base (“nothing but 20% movement speed”); a weapon its base's damage alone. OFF until his
// yes (LEVEL_UNIQUES), and nothing without the uniques' own switch.

/** THE SWITCH: OFF until his yes. Nothing of these drops, or is made, with it off (or with UNIQUES off). */
export const LEVEL_UNIQUES = { on: false };

/** One of a leveling unique's stats: one roll from `lo` to `hi`, for every stat of `stats` (the Lantern Cap's four resistances are one). A flat pair: `pair`, its least rolled in `lo`, its most in `hi2`. */
export interface LevelRoll {
  stats: readonly StatKey[];
  lo: number;
  hi: number;
  /** A flat pair (“Adds X-Y”): its most rolled from `lo2` to `hi2`, `stats` its least and most. */
  lo2?: number;
  hi2?: number;
}

const ALL_RES: readonly StatKey[] = ['fireRes', 'frostRes', 'lightRes', 'poisonRes'];
const R = (stats: StatKey | readonly StatKey[], lo: number, hi: number): LevelRoll => ({ stats: typeof stats === 'string' ? [stats] : stats, lo, hi });
const PAIR = (min: StatKey, max: StatKey, lo: number, hi: number, lo2: number, hi2: number): LevelRoll => ({ stats: [min, max], lo, hi, lo2, hi2 });
/** What a piece rolled for one of its own rule's numbers (its range's middle on a piece made before it had one). */
export function urollOf(it: Item | undefined, d: UniqueDef, key: string): number {
  const v = it?.uroll?.[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const r = d.specials?.[key];
  return r ? (r[0] + r[1]) / 2 : 0;
}
const U = (it: Item | undefined, d: () => UniqueDef, key: string): number => Math.round(urollOf(it, d(), key));
const lv = (id: string): UniqueDef => LEVEL_DEFS.find((d) => d.id === id)!;

/**
 * THE TWENTY, as he passed them (each a pop-up, 12 Nov 2026; his changes in his words in docs/uniques/LEVELING.md). Fifteen on
 * the way down, five from endless level 21 on. Names are placeholders, his to change.
 */
export const LEVEL_DEFS: readonly UniqueDef[] = [
  // ---- ON THE WAY: LEVELS 1 TO 18 ----
  { id: 'errandboots', name: 'The Errand Boots', stem: 'leatherboots', from: 'level', level: 1, bends: 'hero', powers: 0, stats: ['moveSpeed'], rolls: [R('moveSpeed', 16, 24)], does: () => [] },
  { id: 'tinband', name: 'The Tin Band', stem: 'lifering', from: 'level', level: 2, bends: 'hero', powers: 0, stats: ['maxLife', 'lifeOnHit'], rolls: [R('maxLife', 24, 36), R('lifeOnHit', 1.6, 2.4)], does: () => [] },
  // (his word: “Gimme -15% attack speed, and more flat damage”)
  { id: 'scrappersmitts', name: "Scrapper's Mitts", stem: 'leathergloves', from: 'level', level: 3, bends: 'hero', powers: 0, stats: ['atkSpeed', 'dmgMin'], rolls: [R('atkSpeed', -18, -12), PAIR('dmgMin', 'dmgMax', 5, 7, 8, 12)], does: () => [] },
  { id: 'coppercharm', name: 'The Copper Charm', stem: 'dexamulet', from: 'level', level: 4, bends: 'hero', powers: 0, stats: ['magicFind', 'goldFind'], rolls: [R('magicFind', 40, 60), R('goldFind', 40, 60)], does: () => [] },
  { id: 'fledgling', name: 'The Fledgling', stem: 'bow', from: 'level', level: 5, cls: 'ranger', bends: 'hero', powers: 0, stats: ['atkSpeed', 'critChance'], rolls: [R('atkSpeed', 20, 30), R('critChance', 5, 7)], does: () => [] },
  // (his word: “Gimme -10% max life or something like that”)
  { id: 'lanterncap', name: 'The Lantern Cap', stem: 'hood', from: 'level', level: 6, bends: 'hero', powers: 0, stats: ['fireRes', 'maxLifePct'], rolls: [R(ALL_RES, 20, 30), R('maxLifePct', -12, -8)], does: () => [] },
  { id: 'tapedknuckles', name: 'Taped Knuckles', stem: 'wraps', from: 'level', level: 7, cls: 'brawler', bends: 'hero', powers: 0, stats: ['critChance', 'critMult'], rolls: [R('critChance', 6, 10), R('critMult', 48, 72)], does: () => [] },
  // (his word: ““Can deal no other type of damage” would be if you wanted it to ONLY deal fire damage.  If that what you’re going
  // for.  Which I like”)
  { id: 'kindlingrod', name: 'The Kindling Rod', stem: 'staff', from: 'level', level: 8, cls: 'mage', bends: 'hero', stats: ['fireMin', 'firePct'], rolls: [PAIR('fireMin', 'fireMax', 6, 10, 11, 17), R('firePct', 32, 48)], does: () => ['Every hit is fire. Can deal no other type of damage.'] },
  // (his own, his first words of it; “Yes, level 10 (Recommended)”)
  { id: 'rotaxe', name: 'The Rot Axe', stem: 'battleaxe', from: 'level', level: 10, cls: 'warrior', bends: 'hero', stats: ['poisonMin'], rolls: [PAIR('poisonMin', 'poisonMax', 8, 12, 16, 24)], specials: { rot: [120, 180] }, does: (it) => [`Deals no physical damage. Its hits poison for ${U(it, () => lv('rotaxe'), 'rot')}% of their damage instead, over ${TUNE.poisonTime} seconds; poison stacks.`] },
  // (his words: “How about like “always gives GUARDIAN” so you always have a shield.  Comes back after a few seconds after it
  // breaks.  Nothing else.”; then “4 seconds without taking damage”)
  { id: 'packstrap', name: 'The Packstrap', stem: 'leatherbelt', from: 'level', level: 11, bends: 'hero', stats: [], specials: { size: [8, 12], back: [3.2, 4.8] }, does: (it) => [`You always have Guarding's shield: ${U(it, () => lv('packstrap'), 'size')}% of your life. Broken, it comes back after ${urollOf(it, lv('packstrap'), 'back').toFixed(1)} seconds without taking damage.`] },
  { id: 'hornbook', name: 'The Hornbook', stem: 'tome', from: 'level', level: 12, cls: 'warlock', bends: 'hero', powers: 0, stats: ['firePct', 'cdr'], rolls: [R('firePct', 40, 60), R('cdr', 12, 18)], does: () => [] },
  { id: 'borrowedspanner', name: 'The Borrowed Spanner', stem: 'wrench', from: 'level', level: 13, cls: 'tinkerer', bends: 'hero', powers: 0, stats: ['atkSpeed', 'dex'], rolls: [R('atkSpeed', 20, 30), R('dex', 16, 24)], does: () => [] },
  { id: 'quiltedcoat', name: 'The Quilted Coat', stem: 'jerkin', from: 'level', level: 14, bends: 'hero', powers: 0, stats: ['armor', 'maxLife'], rolls: [R('armor', 96, 144), R('maxLife', 64, 96)], does: () => [] },
  { id: 'poisonerslocket', name: "The Poisoner's Locket", stem: 'dexamulet', from: 'level', level: 16, bends: 'hero', powers: 0, stats: ['poisonPct', 'poisonMin'], rolls: [R('poisonPct', 32, 48), PAIR('poisonMin', 'poisonMax', 8, 12, 14, 22)], does: () => [] },
  // (his idea, typed into a pop-up: “You gotta have something that has 100% chance to crit, crits do no extra damage.  Always a
  // classic”; “Yes, level 18 ring (Recommended)”. It has no number to roll)
  { id: 'surething', name: 'The Sure Thing', stem: 'lifering', from: 'level', level: 18, bends: 'hero', stats: [], does: () => ['Every hit is a critical hit.'], price: () => 'Critical hits do no extra damage.' },

  // ---- THE ENDGAME: LEVELS 21 TO 30, FROM ENDLESS LEVEL 1 ON ----
  // (his word: “How about -25% to all resistances”)
  { id: 'longroad', name: 'The Long Road', stem: 'leatherboots', from: 'level', level: 21, bends: 'hero', powers: 0, stats: ['moveSpeed', 'cdr', 'fireRes'], rolls: [R('moveSpeed', 28, 42), R('cdr', 20, 30), R(ALL_RES, -30, -20)], does: () => [] },
  { id: 'thousandcuts', name: 'The Thousand Cuts', stem: 'leathergloves', from: 'level', level: 23, bends: 'hero', powers: 0, stats: ['atkSpeed', 'critChance', 'dmgPct'], rolls: [R('atkSpeed', 32, 48), R('critChance', 5, 7), R('dmgPct', -30, -20)], does: () => [] },
  { id: 'vaultdoor', name: 'The Vault Door', stem: 'plate', from: 'level', level: 25, bends: 'hero', powers: 0, stats: ['armor', 'maxLife', 'fireRes', 'moveSpeed'], rolls: [R('armor', 240, 360), R('maxLife', 160, 240), R(ALL_RES, 20, 30), R('moveSpeed', -24, -16)], does: () => [] },
  // (his words: “Maybe pick one element then a weakness to another.  Like 60% frost damage, take 20% more fire damage”)
  { id: 'rimecrown', name: 'The Rime Crown', stem: 'helm', from: 'level', level: 27, bends: 'hero', powers: 0, stats: ['frostPct', 'fireRes'], rolls: [R('frostPct', 48, 72), R('fireRes', -24, -16)], does: () => [] },
  // (his price: “Higher price.  50% longer.  Or give everything a roll 50-100% longer.”)
  { id: 'lastword', name: 'The Last Word', stem: 'manaring', from: 'level', level: 30, bends: 'words', stats: [], specials: { words: [40, 60], cool: [50, 100] }, does: (it) => [`Every word on your tap and hold attacks is ${U(it, () => lv('lastword'), 'words')}% stronger.`], price: (it) => `Your abilities' cooldowns are ${U(it, () => lv('lastword'), 'cool')}% longer.` },
];

const BY_ID = new Map<string, UniqueDef>([...UNIQUE_DEFS, ...LEVEL_DEFS].map((d) => [d.id, d]));

/** The unique of that id, if there is one. */
export function uniqueDef(id: string | undefined): UniqueDef | undefined {
  return id ? BY_ID.get(id) : undefined;
}

/** The unique a piece is, if it is one this build knows. */
export function uniqueOf(it: Item | null | undefined): UniqueDef | undefined {
  return it && it.rarity === 3 ? uniqueDef(it.unique) : undefined;
}

const CLASS_NAME: Record<ClassId, string> = { warrior: 'Warrior', ranger: 'Ranger', mage: 'Mage', warlock: 'Warlock', tinkerer: 'Tinkerer', brawler: 'Brawler' };

/** Its slot (its base's). */
export function uniqueSlot(d: UniqueDef): Slot {
  return stemSlot(d.stem) ?? 'ring';
}

/** Its weapon kind, if it is a weapon. */
export function uniqueWeapon(d: UniqueDef): WeaponKind | null {
  return stemWeapon(d.stem);
}

/** Is the word it adds in this build (always, if it adds none that is not)? */
export function wordIsIn(d: UniqueDef): boolean {
  return !d.word || Object.prototype.hasOwnProperty.call(WORDS, d.word);
}

/**
 * What a unique's card says under its ordinary stats: what it does, its price, whose it is. `cls`: the hero reading it (a
 * hero-only piece, or a weapon's, read by another says so).
 */
export function uniqueLines(d: UniqueDef, cls: ClassId, it?: Item): { text: string; kind: 'does' | 'price' | 'note' | 'bad' }[] {
  const out: { text: string; kind: 'does' | 'price' | 'note' | 'bad' }[] = [];
  for (const l of d.does(it)) out.push({ text: l, kind: 'does' });
  if (d.price) out.push({ text: d.price(it), kind: 'price' });
  if (d.cls) {
    const mine = d.cls === cls;
    out.push({ text: d.only ? `${CLASS_NAME[d.cls]} only` : `The ${CLASS_NAME[d.cls]}'s`, kind: mine ? 'note' : 'bad' });
  }
  if (!wordIsIn(d)) out.push({ text: 'Its word is not in the game yet.', kind: 'bad' });
  out.push({ text: 'Cannot be crafted', kind: 'note' });
  return out;
}

/** How many special modifiers it has (one, or two). */
export function uniquePowers(d: UniqueDef): number {
  return d.powers ?? 1;
}

/** Make a unique of this id at an item level: its fixed stats rolled. Null with the switch off, or for an id not known. */
export function makeUnique(id: string, ilvl: number, rng: RNG): Item | null {
  const d = uniqueDef(id);
  if (!UNIQUES.on || !d) return null;
  // (THE LEVELING UNIQUES: its own level, whatever the floor; its own numbers rolled)
  if (d.from === 'level') return makeLevelUnique(d, rng);
  return makeUniqueItem(d.id, d.stem, d.name, d.stats, ilvl, rng, d.reqLevel);
}

/** A leveling unique made: at its level, asking for it; each of its stats and its rule's numbers rolled in their ranges. Null with either switch off. */
export function makeLevelUnique(d: UniqueDef, rng: RNG): Item | null {
  if (!UNIQUES.on || !LEVEL_UNIQUES.on || d.from !== 'level') return null;
  const level = d.level ?? 1;
  const groups: StatMod[][] = [];
  for (const r of d.rolls ?? []) {
    if (r.lo2 !== undefined && r.hi2 !== undefined) {
      const lo = Math.round(rng.range(r.lo, r.hi));
      const hi = Math.max(lo + 1, Math.round(rng.range(r.lo2, r.hi2)));
      groups.push([{ stat: r.stats[0], value: lo }, { stat: r.stats[1], value: hi }]);
    } else {
      const v = rollIn(r.stats[0], r.lo, r.hi, rng);
      groups.push(r.stats.map((stat) => ({ stat, value: v })));
    }
  }
  const it = makeSetUniqueItem(d.id, d.stem, d.name, groups, level);
  if (!it) return null;
  if (d.specials) {
    it.uroll = {};
    for (const [k, [lo, hi]] of Object.entries(d.specials)) it.uroll[k] = Math.round(rng.range(lo, hi) * 10) / 10;
  }
  return it;
}

/** A value rolled from lo to hi, kept as its stat's figures are (a whole number, or one decimal for life on hit). */
function rollIn(stat: StatKey, lo: number, hi: number, rng: RNG): number {
  const v = rng.range(lo, hi);
  return stat === 'lifeOnHit' || stat === 'lifeRegen' ? Math.round(v * 10) / 10 : Math.round(v);
}

/** Does this unique's rule work for a hero of this class (a hero-only piece, a weapon's: only for him)? */
export function worksFor(d: UniqueDef, cls: ClassId): boolean {
  return !d.cls || d.cls === cls;
}

/** The ids of the uniques a hero wears whose rules work for him. Empty with the switch off. */
export function wornUniques(gear: Record<EquipSlot, Item | null>, cls: ClassId): string[] {
  if (!UNIQUES.on) return [];
  const out: string[] = [];
  for (const s of EQUIP_SLOTS) {
    const d = uniqueOf(gear[s]);
    // (a leveling unique's rule only with its switch on: its stats count as any piece's)
    if (d && d.from === 'level' && !LEVEL_UNIQUES.on) continue;
    if (d && worksFor(d, cls) && !out.includes(d.id)) out.push(d.id);
  }
  return out;
}

/** Why a hero of this class may not wear this piece, or null (UNIQUE_RULES.othersWear: with it false, another hero's piece is refused). */
export function wearProblem(it: Item, cls: ClassId): string | null {
  const d = uniqueOf(it);
  if (!d || !d.only || !d.cls || d.cls === cls || UNIQUE_RULES.othersWear) return null;
  return `${CLASS_NAME[d.cls]} only`;
}

// =============================================================================================
// WHERE THEY DROP

/** The uniques the pool may give a hero of this class: the ones for everyone, and his own (UNIQUE_RULES.ownOnly; else every hero's). */
export function poolFor(cls: ClassId): UniqueDef[] {
  return UNIQUE_DEFS.filter((d) => d.from === 'pool' && (!d.cls || d.cls === cls || !UNIQUE_RULES.ownOnly));
}

/** The unique a boss of this kind drops, if he has one. */
export function bossUnique(kind: MonsterKind): UniqueDef | undefined {
  return UNIQUE_DEFS.find((d) => d.from === 'boss' && d.boss !== undefined && d.boss.includes(kind));
}

/** The endless final boss's two. */
export function finalUniques(): UniqueDef[] {
  return UNIQUE_DEFS.filter((d) => d.from === 'final');
}

/** The chance that a piece of gear of this quality (Game.rollGear's) is a pool unique instead, with this magic find (%), at this floor's power. */
/**
 * THE LEVELING UNIQUES a hero of this class may find where the floor's level is `power`: every one of that level or below (his
 * words: “Any level higher than its base level”), never another hero's weapon. Empty with either switch off.
 */
export function levelPoolFor(cls: ClassId, power: number): UniqueDef[] {
  if (!UNIQUES.on || !LEVEL_UNIQUES.on) return [];
  return LEVEL_DEFS.filter((d) => (d.level ?? 1) <= power && (!d.cls || d.cls === cls));
}

/** How often a piece of gear that drops is one of the leveling uniques instead: as the pool's (`UNIQUE_DROPS.level`), on any floor. 0 with either switch off. */
export function levelChance(quality: number, magicFind: number): number {
  if (!UNIQUES.on || !LEVEL_UNIQUES.on) return 0;
  const P = UNIQUE_DROPS.level;
  const base = quality >= 2 ? P.hoard : quality === 1 ? P.elite : P.plain;
  return base * Math.max(0, 1 + (Number.isFinite(magicFind) ? magicFind : 0) / 100);
}

export function poolChance(quality: number, magicFind: number, power: number): number {
  if (!UNIQUES.on || power < UNIQUE_DROPS.pool.from) return 0;
  const P = UNIQUE_DROPS.pool;
  const base = quality >= 2 ? P.hoard : quality === 1 ? P.elite : P.plain;
  return base * Math.max(0, 1 + (Number.isFinite(magicFind) ? magicFind : 0) / 100);
}

// =============================================================================================
// THE ONES THAT BEND WORDSMITHING: what an attack's words are with them worn

/** What the game knows of the hero that bends his words. */
export interface BendCtx {
  /** The uniques worn that work for him (wornUniques). */
  worn: readonly string[];
  /** THE CLOCKWORK SONGBIRD: his life is full. */
  full: boolean;
  /** THE NETTLE SHIRT: how much stronger her Vow makes his words now (0 to UNIQUE_TUNE.nettle.most). */
  vow: number;
  /** THE MOTH'S WING: the word of his that is dark (which attack, which side, which place), or null. */
  dark: { skill: number; side: 'front' | 'behind'; idx: number } | null;
  /** THE KING'S KNOT: the word his tap attack has borrowed, or null. */
  borrowed: WordId | null;
  /** THE LAST WORD (a leveling unique): how much stronger every word of his tap and hold attacks is (0.4 to 0.6 as rolled); absent, none. */
  lastWord?: number;
}

export interface Bent {
  front: (WordId | null)[];
  behind: (WordId | null)[];
  /** How much stronger the words' own figures are: 1, none. (For a melded word alone, `meldBoost`.) */
  boost: number;
  meldBoost: number;
  /** THE AMALGAM'S HEART: the meld the two words in front make, given as well (their own effects stay), or null. */
  meld: MeldId | null;
}

/** May this word go on a side that holds these, as its unique adds it: one it does not hold already, and (the Polyglot's Mantle aside) not a second damage word. */
function mayAdd(side: readonly (WordId | null)[], w: WordId, two: boolean): boolean {
  if (side.includes(w)) return false;
  if (!two && isDamageWord(w) && side.some((x) => x !== null && isDamageWord(x))) return false;
  return true;
}

const known = (w: string): w is WordId => Object.prototype.hasOwnProperty.call(WORDS, w);

/**
 * The words attack `i` (0 the tap, 1 the hold, 2 the swipe) works with, the sockets being `skills`, with these uniques worn.
 * With none worn: the sockets as they are, nothing stronger.
 * In order: what is dark (the Moth's Wing); what takes no words (the Seal, the Band); words added with no slot used (the Hood,
 * the Echo, the Glass, the Crown, the Undertow, The Long Echo: a word already set there by hand is not added twice); the King's
 * Knot's borrowed word; the Two-Faced Mask's first word behind as well; the Ghostwriter's tap words on the swipe; the Amalgam's
 * Heart's meld; and how strong they are (the Seal, the Band, the Songbird, her Vow; the Alloy Band for melded words).
 */
export function bendWords(i: number, skills: readonly { front: readonly (WordId | null)[]; behind: readonly (WordId | null)[] }[], ctx: BendCtx): Bent {
  const has = (id: string): boolean => ctx.worn.includes(id);
  const s = skills[i];
  const front: (WordId | null)[] = s ? [...s.front] : [];
  const behind: (WordId | null)[] = s ? [...s.behind] : [];
  const out: Bent = { front, behind, boost: 1, meldBoost: 1, meld: null };
  if (!s || ctx.worn.length === 0) return out;
  const two = has('polyglotsmantle');
  // THE MOTH'S WING: one word dark
  if (ctx.dark && ctx.dark.skill === i) {
    const side = ctx.dark.side === 'front' ? front : behind;
    if (ctx.dark.idx >= 0 && ctx.dark.idx < side.length) side[ctx.dark.idx] = null;
  }
  // THE CENSOR'S SEAL: the hold attack takes no words. THE QUILL'S BAND: the tap attack takes none.
  const none = (i === 1 && has('censorsseal')) || (i === 0 && has('quillsband'));
  if (none) {
    out.front = front.map(() => null);
    out.behind = behind.map(() => null);
    return out;
  }
  const add = (side: (WordId | null)[], w: string): void => {
    if (known(w) && mayAdd(side, w, two)) side.push(w);
  };
  // WORDS ADDED, NO SLOT USED
  if (i === 0 && has('headsmanshood')) add(front, 'culling');
  if (i === 0 && has('queensglass')) add(front, 'mirroring');
  if (i === 1 && has('cantorsecho')) add(behind, 'twin');
  if (i === 1 && has('undertow')) add(front, 'pulling');
  if (i === 2 && has('hollowcrown')) add(behind, 'binding');
  if (has('longecho')) add(front, 'lasting');
  // THE KING'S KNOT: the word of the monster he killed, in front of the tap attack (a damage word too, beside his own: it is lent, not set)
  if (i === 0 && has('kingsknot') && ctx.borrowed && !front.includes(ctx.borrowed)) front.push(ctx.borrowed);
  // TWO-FACED MASK: the first word in front of the tap attack works behind it too
  if (i === 0 && has('twofacedmask')) {
    const first = s.front.find((w) => w !== null && !(ctx.dark && ctx.dark.skill === 0 && ctx.dark.side === 'front' && s.front.indexOf(w) === ctx.dark.idx));
    if (first) add(behind, first);
  }
  // THE GHOSTWRITER: the swipe carries every word set on the tap attack, on top of its own
  if (i === 2 && has('ghostwriter') && skills[0] && !has('quillsband')) {
    const dark0 = ctx.dark && ctx.dark.skill === 0 ? ctx.dark : null;
    skills[0].front.forEach((w, k) => void (w && !(dark0 && dark0.side === 'front' && dark0.idx === k) && !front.includes(w) && front.push(w)));
    skills[0].behind.forEach((w, k) => void (w && !(dark0 && dark0.side === 'behind' && dark0.idx === k) && !behind.includes(w) && behind.push(w)));
  }
  // THE AMALGAM'S HEART: the two words in front of the tap attack, if they meld, give their meld as well
  if (i === 0 && has('amalgamsheart') && !front.some((w) => w !== null && isMeld(w))) {
    const ws = front.filter((w): w is WordId => w !== null);
    search: for (let a = 0; a < ws.length; a++) {
      for (let b = a + 1; b < ws.length; b++) {
        const m = meldOf(ws[a], ws[b]);
        if (m && isMeld(m)) {
          out.meld = m;
          break search;
        }
      }
    }
  }
  // HOW STRONG: each “half as strong again” adds its half; her Vow adds what it has grown to
  let more = 0;
  if (i === 0 && has('censorsseal')) more += T.half;
  if (i === 1 && has('quillsband')) more += T.half;
  if (has('clockworksongbird') && ctx.full) more += T.half;
  if (has('nettleshirt')) more += Math.max(0, Math.min(T.nettle.most, ctx.vow));
  // (THE LAST WORD, a leveling unique: every word of the tap and hold attacks, melded ones too)
  const last = i < 2 && has('lastword') && ctx.lastWord ? ctx.lastWord : 0;
  out.boost = 1 + more + last;
  out.meldBoost = (has('alloyband') ? 1 + T.half : 1) + last;
  return out;
}

/** THE POLYGLOT'S MANTLE worn: a side may hold two damage words (the sockets' own rule, Game.placeProblem and refresh). */
export function damageWordsASide(worn: readonly string[]): number {
  return worn.includes('polyglotsmantle') ? 2 : 1;
}
