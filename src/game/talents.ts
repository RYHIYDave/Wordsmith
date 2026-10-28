// THE SKILL TREES (in the game since Version 20.1, behind TALENTS; REMADE in the next version, behind
// TALENTS2: below).
//
// The owner, 4 Oct 2026, when both attacks came to be the weapon's: "Later we can have skill trees
// that will give a character its uniqueness". 8 Oct, 15:16, his answers to four questions: "10, one
// every 5 levels (Recommended)"; of what a talent should do, "A mix of both" (big changes to how a
// move works, with smaller steps between); of the shape, "I’d like them to be in a different shape.
// Make the mage three paths for fire lightning and frost, the ranger a path with forks like a arrow,
// and the warrior, well I don’t have a cool idea for the warrior so I guess that’s on you to figure
// out"; and of talents that work with words, "Yes, a few (Recommended)". Of Frenzied, in his notes
// on the words: "I like the idea of skill trees in the future and having a node that adds extra
// stacks to of power and frenzy so it goes crazy if you're building into it". 9 Oct, 00:22: "K add
// the art, then work on our skill trees, then I’d like controller support.  Dual stick aiming."
// His rulebook (approved 8 Oct): a small tree where every pick counts; points with levels; picks
// undone in town, for gold.
//
// So each class has fifteen talents in a shape of its own, read from left to right, and ten points
// to spend, one at every fifth level. A talent can be taken once the one before it on the shape is
// taken (any one, where two lines meet). The weapon gives the attacks, whoever holds it (4 Oct), so
// a talent works on a kind of thing (fire, arrows, the class's own move), never on one weapon's
// attack. A BIG talent changes how a move works; the others are steps.
//   MAGE      three paths from her rune: FIRE, LIGHTNING, FROST, each five long.
//   RANGER    an arrow flying right: two feathers to start from, the shaft, and a head whose two
//             barbs (TRAPS above, ARROWS below) and middle all meet at the point.
//   WARRIOR   two swords crossed: TECHNIQUE and IRON, each from its pommel on the left through its
//             guard (with a quillon each side) to the crossing in the middle, which is both swords',
//             and on to its tip; past the crossing either sword's tip may be reached. (The first
//             sword was RAGE until the owner, 9 Oct 2026, 08:06: "One issue I’m seeing with the
//             warrior tree is rage.  He’s not a barbarian, he’s all about power and technique."; his
//             yes to TECHNIQUE as this chat listed it: "Yes, as listed (Recommended)".)

import type { ClassId, StatKey, WordId } from './types';

/**
 * THE SWITCH: off, there are no talents and no page for them (the game as it was). ON since Version
 * 20.1: the owner, 10 Oct 2026, 01:40, "Show me the skill trees" (the doc and its pictures opened
 * for him), and at 01:55: "Go ahead and ship it".
 */
export const TALENTS = { on: true };

/**
 * THE TREES REMADE. The owner, 17 Oct 2026, 11:37 (Eastern), of the trees: "And we need to work on the skill trees.  If you
 * only get one point every five levels, we want them to be more significant than “25% increased _______”". So every talent
 * that was a plain step (a number up, "33% increased") now changes how you play: its card's words, and its name or its word
 * where those change, are its `now`; the shapes are as they were. Shown to him as a page, "The Skill Trees, Revised"
 * (https://claude.ai/artifact/5AJ1pMMU4qqpkTemjSKSjc, its source docs/talents/trees_revised.html), and his words to it and
 * to the page of four looks beside it, 17 Oct, 19:42 (16:42 his time): "Everything looks good". ON. Off, every talent does
 * what it did before (its `text`); the kept ones are the same either way.
 */
export const TALENTS2 = { on: true };

/** A point at every fifth level: ten by level 50 (his answer, 8 Oct 15:16). */
export const TALENT_EVERY = 5;
export const TALENT_MAX = 10;

/** How many talent points a hero of this level has had. */
export function talentPoints(level: number): number {
  return Math.min(TALENT_MAX, Math.floor(Math.max(0, level) / TALENT_EVERY));
}

/** The level at which the next point comes, or null when all ten have come. */
export function nextTalentLevel(level: number): number | null {
  const n = talentPoints(level);
  return n >= TALENT_MAX ? null : (n + 1) * TALENT_EVERY;
}

export interface TalentDef {
  id: string;
  name: string;
  /** A big change to how something works (drawn larger); otherwise a step. */
  big: boolean;
  /** Which part of the shape it is on (its colour and its caption). */
  path: string;
  /** Where it sits, in the shape's own units: x to the right, y down. */
  at: readonly [number, number];
  /** The talents that lead to it: it can be taken once any one of them is. None: a place to start. */
  from: readonly string[];
  /** What it does, as the card says it. */
  text: string;
  /** The word it works with, if any (a few: his "Yes, a few"). */
  word?: WordId;
  /** What it adds to the hero's numbers, where that is all it does. */
  mods?: readonly { stat: StatKey; value: number }[];
  /**
   * (TALENTS2) The talent remade: what its card says now, and its new name and word where they change (`word: null`: it
   * no longer works with a word). What it does is in game/game.ts, under TALENTS2; its old `text` and `mods` are for the
   * switch off.
   */
  now?: { text: string; name?: string; word?: WordId | null };
  /** (on a drafted tree, `draft`) this one is made to work already. */
  works?: boolean;
}

export interface TalentPath {
  id: string;
  name: string;
  color: string;
  /** Where its name is written: beside which of its talents, and on which side. */
  label: { node: string; side: 'left' | 'right' | 'above' | 'below' };
}

/**
 * A faint picture behind a tree, so that its shape reads: a patch filled between talents, or a sword drawn through them; (the
 * new classes' trees, 28 Oct 2026) a talon drawn along talents to a hooked point past the last; a gear's ring and teeth through
 * talents round a hub talent; a rounded block round talents (the fist's fingers, its back, its thumb).
 */
export type TalentFigure =
  | { kind: 'fill'; path: string; ids: readonly string[] }
  | { kind: 'sword'; path: string; pommel: string; guard: string; tip: string; quillons: readonly [string, string] }
  | { kind: 'talon'; path: string; ids: readonly string[]; width: number; hook: number }
  | { kind: 'gear'; path: string; hub: string; ring: readonly string[]; spokes: number }
  | { kind: 'round'; path: string; ids: readonly string[]; pad: number /* in the shape's own units */ };

export interface TalentTree {
  cls: ClassId;
  /** The shape, as it would be said. */
  shape: string;
  paths: readonly TalentPath[];
  talents: readonly TalentDef[];
  /** A place drawn where the paths begin (the mage's rune), not a talent. */
  root?: readonly [number, number];
  /** The faint pictures behind it (the arrow's feathers and head, the two swords). */
  figures?: readonly TalentFigure[];
  /** Laid out as round as it is drawn (the gear, the fist), not stretched to the page's room. */
  square?: boolean;
  /** The box its shape is laid out in (left, top, right, bottom, in its own units), where that is more than its talents span (room for the claw's points). */
  room?: readonly [number, number, number, number];
  /** Its talents' cards say what they will do, but none of them does it yet (a tree drafted, shown to the owner first). */
  draft?: boolean;
}

// ---- the mage: three paths ---------------------------------------------------------------------
const FIRE = '#ff8a3c';
const LIGHT = '#f8e060';
const FROST = '#8ad0ff';

const MAGE: TalentTree = {
  cls: 'mage',
  shape: 'three paths from her rune',
  root: [0, 2],
  paths: [
    { id: 'fire', name: 'FIRE', color: FIRE, label: { node: 'kindling', side: 'above' } },
    { id: 'lightning', name: 'LIGHTNING', color: LIGHT, label: { node: 'charged', side: 'above' } },
    { id: 'frost', name: 'FROST', color: FROST, label: { node: 'bittercold', side: 'above' } },
  ],
  talents: [
    { id: 'kindling', name: 'Kindling', big: false, path: 'fire', at: [1, 0], from: [], text: 'Fire damage +25%.', mods: [{ stat: 'firePct', value: 25 }], now: { text: 'Your fire leaves the ground burning for two seconds where it hits: whatever stands in it burns.' } },
    { id: 'searing', name: 'Searing', big: false, path: 'fire', at: [2, 0], from: ['kindling'], text: 'Burning lasts a second longer, and its damage is 50% increased.', now: { text: 'Fire spreads: a burning enemy sets alight any enemy it touches.' } },
    { id: 'flamewarp', name: 'Flame Warp', big: true, path: 'fire', at: [3, 0], from: ['searing'], text: 'Warp leaves a trail of fire behind you.' },
    { id: 'fuel', name: 'Fuel', big: false, path: 'fire', at: [4, 0], from: ['flamewarp'], text: 'Flame in front explodes with 33% increased size.', word: 'fire', now: { text: 'Standing in fire you made, nothing burns you, and your mana comes back three times as fast.', name: 'Hearth', word: null } },
    { id: 'inferno', name: 'Inferno', big: true, path: 'fire', at: [5, 0], from: ['fuel'], text: 'Enemies that die burning explode in flame.' },
    { id: 'charged', name: 'Charged', big: false, path: 'lightning', at: [1, 2], from: [], text: 'Lightning damage +25%.', mods: [{ stat: 'lightPct', value: 25 }], now: { text: 'As you move you gather a charge, sparks round you; your next hit lets it go, a bolt that leaps between up to five enemies.' } },
    { id: 'forking', name: 'Forking', big: false, path: 'lightning', at: [2, 2], from: ['charged'], text: 'Lightning arcs to two more enemies.', word: 'lightning' },
    { id: 'stormwarp', name: 'Storm Warp', big: true, path: 'lightning', at: [3, 2], from: ['forking'], text: 'Where you warp to, lightning strikes up to four enemies.' },
    { id: 'overload', name: 'Overload', big: false, path: 'lightning', at: [4, 2], from: ['stormwarp'], text: 'Shocked enemies take 15% more damage from everything.', now: { text: 'A shocked enemy that dies passes its shock on to the three nearest.' } },
    { id: 'stormcaller', name: 'Stormcaller', big: true, path: 'lightning', at: [5, 2], from: ['overload'], text: 'Every two seconds, lightning strikes an enemy near you.' },
    { id: 'bittercold', name: 'Bitter Cold', big: false, path: 'frost', at: [1, 4], from: [], text: 'Frost damage +25%.', mods: [{ stat: 'frostPct', value: 25 }], now: { text: 'Any enemy that strikes you is chilled to half its speed for two seconds.' } },
    { id: 'deepfreeze', name: 'Deep Freeze', big: false, path: 'frost', at: [2, 4], from: ['bittercold'], text: 'Enemies freeze sooner, with 50% increased freeze time.', now: { text: 'Your hits send a frozen enemy sliding across the floor, and it freezes whatever it slides into.' } },
    { id: 'frostwarp', name: 'Frost Warp', big: true, path: 'frost', at: [3, 4], from: ['deepfreeze'], text: 'Where you warp from, a burst of cold freezes the enemies near.' },
    { id: 'rime', name: 'Rime', big: false, path: 'frost', at: [4, 4], from: ['frostwarp'], text: 'The ice that Frost leaves behind has 100% increased size.', word: 'frost', now: { text: 'When an enemy dies on the ice Frost leaves behind, the whole patch shatters and freezes every enemy on it.' } },
    { id: 'shatter', name: 'Shatter', big: true, path: 'frost', at: [5, 4], from: ['rime'], text: 'Frozen enemies take 100% increased damage; one that dies bursts, chilling those near.' },
  ],
};

// ---- the ranger: an arrow ----------------------------------------------------------------------
const WIND = '#8ae4ac';
const EYE = '#eef4fa';
const SHAFT = '#c8a070';
const TRAPS = '#b0e05a';
const ARROWS = '#9cc8ff';

const RANGER: TalentTree = {
  cls: 'ranger',
  shape: 'an arrow',
  paths: [
    { id: 'wind', name: 'WIND', color: WIND, label: { node: 'fleet', side: 'right' } },
    { id: 'eye', name: 'EYE', color: EYE, label: { node: 'keeneye', side: 'right' } },
    { id: 'shaft', name: '', color: SHAFT, label: { node: 'quickdraw', side: 'above' } },
    { id: 'traps', name: 'TRAPS', color: TRAPS, label: { node: 'widetraps', side: 'left' } },
    { id: 'arrows', name: 'ARROWS', color: ARROWS, label: { node: 'splitshot', side: 'left' } },
  ],
  talents: [
    // the two feathers: either is a place to start
    { id: 'fleet', name: 'Fleet', big: false, path: 'wind', at: [0, 0.5], from: [], text: 'Move 10% faster.', mods: [{ stat: 'moveSpeed', value: 10 }], now: { text: 'You shoot on the run: loosing an arrow no longer slows you.' } },
    { id: 'windrunner', name: 'Windrunner', big: false, path: 'wind', at: [0.9, 1.25], from: ['fleet'], text: 'After a roll, run 30% faster for two seconds.', now: { text: 'Every kill gives you back a roll.' } },
    { id: 'keeneye', name: 'Keen Eye', big: false, path: 'eye', at: [0, 3.5], from: [], text: 'Critical chance +8%.', mods: [{ stat: 'critChance', value: 8 }], now: { text: 'Your first arrow at an enemy that has not noticed you yet is a certain critical.' } },
    { id: 'venom', name: 'Venom', big: false, path: 'eye', at: [0.9, 2.75], from: ['keeneye'], text: 'Poison has a 100% increased stack limit.', word: 'poison', now: { text: 'A poisoned enemy that dies bursts in a cloud that poisons those near it.' } },
    // the shaft
    { id: 'quickdraw', name: 'Quick Draw', big: false, path: 'shaft', at: [1.9, 2], from: ['windrunner', 'venom', 'steadyaim'], text: 'Attacks 10% faster.', mods: [{ stat: 'atkSpeed', value: 10 }], now: { text: 'Every fifth arrow fires twice.' } },
    { id: 'longshot', name: 'Long Shot', big: false, path: 'shaft', at: [3, 2], from: ['quickdraw'], text: 'Arrows have 33% increased range and speed.', now: { text: 'Your arrows knock back what they hit.' } },
    { id: 'lightstep', name: 'Light Step', big: true, path: 'shaft', at: [4.1, 2], from: ['longshot'], text: 'Trap holds three charges, and your roll has 33% increased reach.', now: { text: 'Trap holds three charges: roll three times running, a trap at each.' } },
    { id: 'huntersmark', name: "Hunter's Mark", big: false, path: 'shaft', at: [5.2, 2], from: ['lightstep'], text: "Precise's mark makes a triple critical.", word: 'precise' },
    // the head: two barbs and the middle, meeting at the point
    { id: 'widetraps', name: 'Wide Traps', big: false, path: 'traps', at: [6, 0.5], from: ['huntersmark'], text: 'Traps burst with 33% increased size.', now: { text: 'A trap pulls the enemies near it in before it bursts.' } },
    { id: 'minefield', name: 'Minefield', big: true, path: 'traps', at: [6.9, 1.25], from: ['widetraps'], text: 'Each roll lays three traps in a fan.' },
    { id: 'splitshot', name: 'Split Shot', big: false, path: 'arrows', at: [6, 3.5], from: ['huntersmark'], text: 'Every third arrow splits into three.', now: { text: 'An arrow that kills splits into three, and they fly on.' } },
    { id: 'hail', name: 'Hail', big: true, path: 'arrows', at: [6.9, 2.75], from: ['splitshot'], text: 'Volley rains with 100% increased duration and 50% increased area.', now: { text: 'Volley follows the enemy you aimed it at.' } },
    { id: 'piercing', name: 'Piercing', big: false, path: 'shaft', at: [6.45, 2], from: ['huntersmark'], text: 'Arrows pass through one more enemy.', now: { text: 'An arrow that hits a wall bounces off it and flies on.', name: 'Ricochet' } },
    { id: 'farsight', name: 'Far Sight', big: true, path: 'shaft', at: [7.8, 2], from: ['minefield', 'hail', 'piercing'], text: 'The further the enemy, the harder you hit: up to +50% at eight tiles.', now: { text: 'An arrow that has flown past eight tiles is a certain critical.' } },
    // the nock, between the feathers: a third way onto the shaft
    { id: 'steadyaim', name: 'Steady Aim', big: false, path: 'shaft', at: [0.15, 2], from: ['fleet', 'keeneye'], text: 'Standing still, your attacks hit 15% harder.', now: { text: 'Stand still for a second, and your next arrow goes through every enemy in its line.' } },
  ],
  figures: [
    { kind: 'fill', path: 'wind', ids: ['fleet', 'windrunner', 'quickdraw', 'steadyaim'] },
    { kind: 'fill', path: 'eye', ids: ['keeneye', 'venom', 'quickdraw', 'steadyaim'] },
    { kind: 'fill', path: 'shaft', ids: ['huntersmark', 'widetraps', 'minefield', 'farsight', 'hail', 'splitshot'] },
  ],
};

// ---- the warrior: two swords crossed --------------------------------------------------------------
const TECHNIQUE = '#ff6a50';
const IRON = '#a8c0d8';
const CROSS = '#ac8753';

const WARRIOR: TalentTree = {
  cls: 'warrior',
  shape: 'two swords crossed',
  paths: [
    { id: 'technique', name: 'TECHNIQUE', color: TECHNIQUE, label: { node: 'honededge', side: 'below' } },
    { id: 'iron', name: 'IRON', color: IRON, label: { node: 'thickskin', side: 'right' } },
    { id: 'cross', name: '', color: CROSS, label: { node: 'earthshaker', side: 'above' } },
  ],
  talents: [
    // TECHNIQUE: from its pommel low on the left up to its tip high on the right
    { id: 'honededge', name: 'Honed Edge', big: false, path: 'technique', at: [0, 4], from: [], text: 'All damage +15%.', mods: [{ stat: 'dmgPct', value: 15 }], now: { text: 'Your critical hits make the enemy bleed: it loses half the hit again over three seconds.' } },
    { id: 'cadence', name: 'Cadence', big: true, path: 'technique', at: [1, 3.33], from: ['honededge'], text: 'Power and Frenzied stack to eight, not five.', word: 'power' },
    { id: 'sweepingcut', name: 'Sweeping Cut', big: false, path: 'technique', at: [1.55, 4.15], from: ['cadence'], text: 'A melee hit splashes 30% of itself on the enemies beside.', now: { text: 'Your melee swings cleave: every enemy in the arc of the swing is struck, not only the first.' } },
    { id: 'footwork', name: 'Footwork', big: false, path: 'technique', at: [0.45, 2.5], from: ['cadence'], text: 'Each kill: run 25% faster for a second.', now: { text: 'Every kill makes Lunge ready again at once.' } },
    { id: 'drilledleap', name: 'Drilled Lunge', big: false, path: 'technique', at: [2, 2.67], from: ['cadence'], text: 'Lunge is ready again 30% sooner.', now: { text: 'Lunge strikes every enemy you pass on the way, not only where you land.' } },
    { id: 'giantslayer', name: 'Giant Slayer', big: false, path: 'technique', at: [4.5, 1], from: ['earthshaker'], text: 'Elites and bosses take 25% increased damage from you.', now: { text: 'Each hit on an elite or a boss cracks its guard: it takes 3% more from everything, up to ten cracks.' } },
    { id: 'masterstroke', name: 'Master Stroke', big: true, path: 'technique', at: [6, 0], from: ['giantslayer'], text: 'Every fourth hit you land is a certain critical.' },
    // IRON: from its pommel high on the left down to its tip low on the right
    { id: 'thickskin', name: 'Thick Skin', big: false, path: 'iron', at: [0, 0], from: [], text: 'Life +15%.', now: { text: 'Below half your life, you take 30% less damage.' } },
    { id: 'shieldwall', name: 'Shieldwall', big: true, path: 'iron', at: [1, 0.67], from: ['thickskin'], text: "Guarding's shield has 100% increased strength.", word: 'guarding', now: { text: 'When Guarding\'s shield breaks, it bursts outward: everything near is thrown back and stunned for a second.' } },
    { id: 'resolute', name: 'Resolute', big: false, path: 'iron', at: [1.55, -0.15], from: ['shieldwall'], text: 'Fire, frost and lightning resistance +15%.', mods: [{ stat: 'fireRes', value: 15 }, { stat: 'frostRes', value: 15 }, { stat: 'lightRes', value: 15 }], now: { text: 'Nothing can slow you, freeze you or knock you back.' } },
    { id: 'secondwind', name: 'Second Wind', big: false, path: 'iron', at: [0.45, 1.5], from: ['shieldwall'], text: 'Flasks heal 30% more.', now: { text: 'Drinking a flask throws back everything near you, and nothing can hurt you for a second.' } },
    { id: 'bulwark', name: 'Bulwark', big: false, path: 'iron', at: [2, 1.33], from: ['shieldwall'], text: 'You take 10% less damage.', now: { text: 'The more enemies close round you, the less each blow hurts: 6% less for each one, up to 30%.' } },
    { id: 'thorns', name: 'Thorns', big: false, path: 'iron', at: [4.5, 3], from: ['earthshaker'], text: 'Enemies that strike you up close take 30% of the blow back.', now: { text: 'An enemy that strikes you up close is thrown back, and takes half the blow itself.' } },
    { id: 'unbreakable', name: 'Unbreakable', big: true, path: 'iron', at: [6, 4], from: ['thorns'], text: 'Once a dungeon, a killing blow leaves you at 1 life, shielded for three seconds.' },
    // the crossing: both swords'
    { id: 'earthshaker', name: 'Earthshaker', big: true, path: 'cross', at: [3, 2], from: ['drilledleap', 'bulwark'], text: 'Lunge lands with a quake that stuns everything near for a second.' },
  ],
  figures: [
    { kind: 'sword', path: 'technique', pommel: 'honededge', guard: 'cadence', tip: 'masterstroke', quillons: ['sweepingcut', 'footwork'] },
    { kind: 'sword', path: 'iron', pommel: 'thickskin', guard: 'shieldwall', tip: 'unbreakable', quillons: ['resolute', 'secondwind'] },
  ],
};

// ---- THE NEW CLASSES' TREES (the main chat, 28 Oct 2026; `draft`: none of their talents does anything yet, each to be made
// to work and filmed for him). Shown to him as a page, “Three New Skill Trees” (https://claude.ai/artifact/GhWB8vecSeRyHxDGQQWKHA,
// its source docs/talents/new_classes/index.html), his answers by 17:47 (Eastern): the Warlock's, “Yes, keep it
// (Recommended)”; the Tinkerer's, “Yes, keep it (Recommended)”; the Brawler's, “Keep it, except change the names of “one
// target” and “crowd””, then “Speed and Power”.
// His words to the main chat that day, asked what next with the three in the game: “Skill trees first”; the
// paths, the Warlock's, “Man and Demon”; the Tinkerer's, “I think for her I’d like her to start with golem and a vial toss.
// Then in the skill tree you can swap the vial toss to a contraption that throws the vials”, then, of her paths, “Vials and
// Golem” (offered as: two paths, with the gold talents mixed into both); the Brawler's, “One target and Crowd”; their shapes,
// “Claw, gear, fist (Recommended)”. His ideas from before, each in: the Tinkerer's gold (28 Oct, by 00:07: “For future
// reference I’d like some of her skill tree to be gold based like increased % damage based on 1% gold stash amount or
// something like that”: FORTUNE); her Golem's tesla coil (by 00:50: “Maybe put a cannon or a tesla coil on his other arm or
// whatever”: the cannon picked, the coil here); the Brawler's (24 Oct, 20:42: “once we build his skill tree, it will have
// increased uppercut or body blows always bleed, something like that”: BIG UPPERCUT, BLEEDERS; 25 Oct, 06:57: “Then let’s
// have a spot on the skill tree that after a successful counter you’re next attack is the final hit in the combo, either
// uppercut or haymaker”: SET-UP).

// ---- the warlock: a demon's claw ---------------------------------------------------------------------
//   His talents at work filmed in the game for him (warlock_tree_film.mp4), his word by 19:03 (Eastern): “Looks good”.
//   Reaching right from the wrist: the DEMON from the back of the hand (its spur up off it), the MAN from the heel of it (the
//   thumb down off it); they meet at the knuckle, the pact's, where the three talons come out: the demon's on top, the pact's
//   in the middle, the man's below, each hooking down at its point.
const MAN = '#b49cff';
const DEMON = '#ff5a3c';
const PACT = '#9a78c8';

const WARLOCK_TREE: TalentTree = {
  cls: 'warlock',
  shape: 'a demon’s claw',
  draft: true,
  room: [0, 0, 5.6, 4.2],
  paths: [
    { id: 'demon', name: 'DEMON', color: DEMON, label: { node: 'hunger', side: 'above' } },
    { id: 'man', name: 'MAN', color: MAN, label: { node: 'branded', side: 'below' } },
    { id: 'pact', name: '', color: PACT, label: { node: 'blazingarm', side: 'above' } },
  ],
  talents: [
    // THE DEMON: the back of the hand, its spur, the top talon
    { id: 'hunger', name: 'Hunger', big: false, works: true, path: 'demon', at: [0, 0.6], from: [], text: 'Every kill the demon makes puts two seconds back on its pact.' },
    { id: 'terribleroar', name: 'Terrible Roar', big: false, works: true, path: 'demon', at: [1.1, 1.0], from: ['hunger'], text: 'The change’s roar curses everything it throws back, and they run from him for two seconds.' },
    { id: 'feast', name: 'Feast', big: false, works: true, path: 'demon', at: [1.65, 0.0], from: ['terribleroar'], text: 'Every kill the demon makes heals him a tenth of his life.' },
    { id: 'bloodlust', name: 'Bloodlust', big: false, works: true, path: 'demon', at: [3.2, 0.95], from: ['blazingarm'], text: 'Every kill makes the demon’s rakes quicker, up to twice as quick, until it burns out.' },
    { id: 'hellwave', name: 'Hellwave', big: false, works: true, path: 'demon', at: [4.2, 0.8], from: ['bloodlust'], text: 'Every third rake throws a wave of hellfire on ahead, through everything in its way.' },
    { id: 'damnedsouls', name: 'Damned Souls', big: true, works: true, path: 'demon', at: [5.1, 1.35], from: ['hellwave'], text: 'Every enemy the demon kills rises as a burning soul that flies into the nearest enemy, cursing it and setting it alight.' },
    // THE MAN: the heel of the hand, the thumb, the bottom talon
    { id: 'branded', name: 'Branded', big: false, works: true, path: 'man', at: [0, 3.4], from: [], text: 'Every Hellfire Bolt curses what it hits.' },
    { id: 'hexchain', name: 'Hex Chain', big: false, works: true, path: 'man', at: [1.1, 3.0], from: ['branded'], text: 'A bolt that hits a cursed enemy leaps on to the next cursed one near it, up to three times, burning each.' },
    { id: 'phantomstep', name: 'Phantom Step', big: true, works: true, path: 'man', at: [1.65, 4.0], from: ['hexchain'], text: 'His Smoke Step leaves his shadow where he stood: for two seconds, the enemies go after it instead of him.' },
    { id: 'withering', name: 'Withering', big: false, works: true, path: 'man', at: [3.2, 3.05], from: ['blazingarm'], text: 'Cursed enemies move and strike at half speed.' },
    { id: 'pyre', name: 'Pyre', big: false, works: true, path: 'man', at: [4.2, 3.25], from: ['withering'], text: 'A cursed enemy that dies bursts in hellfire, striking everything near it.' },
    { id: 'bounddemon', name: 'Bound Demon', big: true, works: true, path: 'man', at: [5.0, 3.95], from: ['pyre'], text: 'The demon no longer takes him over: it tears out and fights at his side until the pact runs dry, while he fights on as a man.' },
    // THE PACT: the knuckle, both the demon's and the man's, and the middle talon
    { id: 'blazingarm', name: 'Blazing Arm', big: true, works: true, path: 'pact', at: [2.2, 2.0], from: ['terribleroar', 'hexchain'], text: 'While his pact is full and he has not changed, his arm blazes: every Hellfire Bolt bursts, cursing and burning all near it.' },
    { id: 'souldebt', name: 'Soul Debt', big: false, works: true, path: 'pact', at: [3.4, 2.0], from: ['blazingarm'], text: 'Every cursed enemy that dies fills a tenth of his pact.' },
    { id: 'lastrites', name: 'Last Rites', big: true, works: true, path: 'pact', at: [4.4, 2.4], from: ['souldebt'], text: 'As the demon burns out, Damning goes off by itself: every cursed or burning enemy near him pays all its burns at once.' },
  ],
  figures: [
    { kind: 'fill', path: 'pact', ids: ['hunger', 'terribleroar', 'blazingarm', 'hexchain', 'branded'] },
    { kind: 'talon', path: 'demon', ids: ['terribleroar', 'feast'], width: 3, hook: 0 },
    { kind: 'talon', path: 'man', ids: ['hexchain', 'phantomstep'], width: 3, hook: 0 },
    { kind: 'talon', path: 'demon', ids: ['blazingarm', 'bloodlust', 'hellwave', 'damnedsouls'], width: 6, hook: 0.9 },
    { kind: 'talon', path: 'pact', ids: ['blazingarm', 'souldebt', 'lastrites'], width: 6, hook: 0.9 },
    { kind: 'talon', path: 'man', ids: ['blazingarm', 'withering', 'pyre', 'bounddemon'], width: 6, hook: 0.9 },
  ],
};

// ---- the tinkerer: a gear -------------------------------------------------------------------------------
//   Twelve teeth round a hub. From the left tooth (her blast jump's, both paths') the VIALS go round over the top and the
//   GOLEM round under the bottom, to meet at the right tooth; the hub is her gold (FORTUNE, off the left tooth); the spoke
//   down from the top tooth is the swap to the CONTRAPTION (reached from the top tooth or the hub); the spoke up from the
//   bottom tooth, her second Golem.
const VIALS = '#7ae0c0';
const GOLEMS = '#e8a858';
const WORKS = '#b8c0d0';
const GOLD = '#ffd448';
const R3 = Math.sqrt(3);

const TINKERER_TREE: TalentTree = {
  cls: 'tinkerer',
  shape: 'a gear',
  draft: true,
  square: true,
  paths: [
    { id: 'vials', name: 'VIALS', color: VIALS, label: { node: 'tar', side: 'left' } },
    { id: 'golem', name: 'GOLEM', color: GOLEMS, label: { node: 'shrapnel', side: 'left' } },
    { id: 'works', name: '', color: WORKS, label: { node: 'bombsaway', side: 'left' } },
    { id: 'gold', name: '', color: GOLD, label: { node: 'fortune', side: 'below' } },
  ],
  talents: [
    // the left tooth: both paths'
    { id: 'bombsaway', name: 'Bombs Away', big: false, works: true, path: 'works', at: [-2, 0], from: [], text: 'As she comes down from her Blast Jump, a second bomb goes off where she lands.' },
    // the hub: her gold (his idea)
    { id: 'fortune', name: 'Fortune', big: false, works: true, path: 'gold', at: [0, 0], from: ['bombsaway'], text: 'She hits harder the more gold she carries: 1% of her gold, as a percent. 1,000 gold, 10% more.' },
    // THE VIALS, round over the top
    { id: 'clustervials', name: 'Cluster Vials', big: false, works: true, path: 'vials', at: [-R3, -1], from: ['bombsaway'], text: 'Every vial bursts into three little ones that bounce out and burst again.' },
    { id: 'tar', name: 'Tar', big: false, works: true, path: 'vials', at: [-1, -R3], from: ['clustervials'], text: 'Her vials leave a puddle of tar for three seconds: whatever walks in it is slowed to a crawl.' },
    { id: 'madmixture', name: 'Mad Mixture', big: true, works: true, path: 'vials', at: [0, -2], from: ['tar'], text: 'Every vial carries a brew at random, burning, freezing or poisoning, on top of its own words.' },
    { id: 'contraptions', name: 'Contraption', big: true, works: true, path: 'vials', at: [0, -1], from: ['madmixture', 'fortune'], text: 'Her tap sets down a Contraption in place of the Vial Toss: it lobs her vials for her, three at once.' },
    { id: 'alchemy', name: 'Alchemy', big: false, works: true, path: 'vials', at: [1, -R3], from: ['madmixture'], text: 'An enemy her vials kill always drops gold.' },
    { id: 'thebigone', name: 'The Big One', big: true, works: true, path: 'vials', at: [R3, -1], from: ['alchemy'], text: 'Every fifth vial is a big one: it bursts three times as wide and knocks everything down.' },
    // THE GOLEM, round under the bottom
    { id: 'lightningrod', name: 'Lightning Rod', big: false, works: true, path: 'golem', at: [-R3, 1], from: ['bombsaway'], text: 'For three seconds after its ground pound, every enemy near the Golem goes after it instead of her.' },
    { id: 'shrapnel', name: 'Shrapnel', big: false, works: true, path: 'golem', at: [-1, R3], from: ['lightningrod'], text: 'The Golem’s cannon shot bursts where it lands, striking everything near.' },
    { id: 'teslacoil', name: 'Tesla Coil', big: false, works: true, path: 'golem', at: [0, 2], from: ['shrapnel'], text: 'A coil on the Golem’s back zaps the enemy nearest it every second, the spark leaping on to two more.' },
    { id: 'markii', name: 'Mark II', big: true, works: true, path: 'golem', at: [0, 1], from: ['teslacoil'], text: 'She can whistle out a second Golem: two at once.' },
    { id: 'prospector', name: 'Prospector', big: false, works: true, path: 'golem', at: [1, R3], from: ['teslacoil'], text: 'Every ground pound digs up a handful of gold.' },
    { id: 'overdrive', name: 'Overdrive', big: true, works: true, path: 'golem', at: [R3, 1], from: ['prospector'], text: 'Her whistle sends the Golem into overdrive for five seconds: it moves and strikes twice as fast.' },
    // the right tooth: both paths'
    { id: 'growthserum', name: 'Growth Serum', big: true, works: true, path: 'works', at: [2, 0], from: ['thebigone', 'overdrive'], text: 'A vial of hers that bursts by her Golem makes it grow: twice as big and twice as strong for five seconds.' },
  ],
  figures: [
    { kind: 'gear', path: 'works', hub: 'fortune', ring: ['bombsaway', 'clustervials', 'tar', 'madmixture', 'alchemy', 'thebigone', 'growthserum', 'overdrive', 'prospector', 'teslacoil', 'shrapnel', 'lightningrod'], spokes: 4 },
  ],
};

// ---- the brawler: a fist ----------------------------------------------------------------------------------
//   Punching right, seen from the side: the wrist on the left (SPEED's start above, POWER's below), the back of the hand, the
//   four fingers curled into a column of knuckles at the front (SPEED's two on top, POWER's two below), and across the middle
//   of them the thumb, both paths' (his slip and counter), from its root where the two meet. The paths were drafted as ONE
//   TARGET and CROWD, his words; shown the tree, 28 Oct 2026, by 17:47 (Eastern): “Keep it, except change the names of “one
//   target” and “crowd””, and asked which, “Speed and Power”.
const SPEED = '#ff7a50';
const POWER = '#5ab0ff';
const COUNTER = '#e8d090';

const BRAWLER_TREE: TalentTree = {
  cls: 'brawler',
  shape: 'a fist',
  draft: true,
  square: true,
  room: [-0.35, -0.5, 4.0, 4.5],
  paths: [
    { id: 'speed', name: 'SPEED', color: SPEED, label: { node: 'doublejab', side: 'left' } },
    { id: 'power', name: 'POWER', color: POWER, label: { node: 'widecross', side: 'left' } },
    { id: 'counter', name: '', color: COUNTER, label: { node: 'bobweave', side: 'above' } },
  ],
  talents: [
    // SPEED (the taps, for one enemy): the wrist's top, the back of the hand, the top two fingers
    { id: 'doublejab', name: 'Double Jab', big: false, works: true, path: 'speed', at: [0, 1.0], from: [], text: 'His jab is two quick jabs.' },
    { id: 'tenderize', name: 'Tenderize', big: false, works: true, path: 'speed', at: [1.0, 0.7], from: ['doublejab'], text: 'Every punch he lands on the same enemy makes it take 5% more from him, up to 50%, until he hits another.' },
    { id: 'heavyhands', name: 'Heavy Hands', big: false, works: true, path: 'speed', at: [2.3, 0], from: ['tenderize'], text: 'Heavy no longer slows his taps.', word: 'heavy' },
    { id: 'biguppercut', name: 'Big Uppercut', big: true, works: true, path: 'speed', at: [3.4, 0], from: ['heavyhands'], text: 'His uppercut hits twice as hard and throws the enemy up: it comes down stunned for two seconds.' },
    { id: 'flurry', name: 'Flurry', big: false, works: true, path: 'speed', at: [2.45, 1.0], from: ['tenderize'], text: 'After the uppercut lands, his next tap is a hook again: hook, uppercut, hook, uppercut, without a break.' },
    { id: 'knockout', name: 'Knockout', big: true, works: true, path: 'speed', at: [3.55, 1.0], from: ['flurry'], text: 'His uppercut knocks out any enemy below a fifth of its life (a boss is stunned three seconds).' },
    // POWER (the holds, for a crowd): the wrist's bottom, the back of the hand, the bottom two fingers
    { id: 'widecross', name: 'Wide Cross', big: false, works: true, path: 'power', at: [0, 3.0], from: [], text: 'His cross strikes every enemy in front of him, not only the first.' },
    { id: 'bleeders', name: 'Bleeders', big: false, works: true, path: 'power', at: [1.0, 3.3], from: ['widecross'], text: 'Body blows always make them bleed: each one it hits loses half the blow again over three seconds.' },
    { id: 'ironchin', name: 'Iron Chin', big: false, works: true, path: 'power', at: [2.45, 3.0], from: ['bleeders'], text: 'Winding up a hold, nothing can knock him back or stagger him, and he takes a third less harm.' },
    { id: 'tenpins', name: 'Ten Pins', big: true, works: true, path: 'power', at: [3.55, 3.0], from: ['ironchin'], text: 'Every enemy the haymaker’s cannonball bowls over is launched too, and bowls over more down the line.' },
    { id: 'pinball', name: 'Pinball', big: false, works: true, path: 'power', at: [2.3, 4.0], from: ['bleeders'], text: 'An enemy he knocks back hurts what it is knocked into, and knocks that back too.' },
    { id: 'shockwave', name: 'Shockwave', big: true, works: true, path: 'power', at: [3.4, 4.0], from: ['pinball'], text: 'His holds send a wave of air on ahead: it strikes everything in a line three tiles long.' },
    // the thumb, from its root: both paths', his slip and counter
    { id: 'bobweave', name: 'Bob and Weave', big: false, works: true, path: 'counter', at: [1.45, 2.0], from: ['tenderize', 'bleeders'], text: 'When his counter lands, his slip is ready again at once.' },
    { id: 'slipreflex', name: 'Slip Reflex', big: false, works: true, path: 'counter', at: [2.4, 2.0], from: ['bobweave'], text: 'Once every six seconds, a blow that would hit him is slipped by itself, and he counters.' },
    { id: 'setup', name: 'Set-Up', big: true, works: true, path: 'counter', at: [3.45, 2.05], from: ['slipreflex'], text: 'After a counter lands, his next press is the combo’s last punch: a tap the uppercut, a hold the haymaker.' },
  ],
  figures: [
    { kind: 'round', path: 'counter', ids: ['doublejab', 'widecross'], pad: 0.32 },
    { kind: 'round', path: 'counter', ids: ['tenderize', 'bobweave', 'bleeders'], pad: 0.55 },
    { kind: 'round', path: 'speed', ids: ['heavyhands', 'biguppercut'], pad: 0.44 },
    { kind: 'round', path: 'speed', ids: ['flurry', 'knockout'], pad: 0.44 },
    { kind: 'round', path: 'counter', ids: ['slipreflex', 'setup'], pad: 0.4 },
    { kind: 'round', path: 'power', ids: ['ironchin', 'tenpins'], pad: 0.44 },
    { kind: 'round', path: 'power', ids: ['pinball', 'shockwave'], pad: 0.44 },
  ],
};

export const TREES: Record<ClassId, TalentTree> = { warrior: WARRIOR, ranger: RANGER, mage: MAGE, warlock: WARLOCK_TREE, tinkerer: TINKERER_TREE, brawler: BRAWLER_TREE };

/** What the talents do, in numbers: starting numbers, as their words on the cards say them (his to change). */
export const TALENT_TUNE = {
  // the mage
  searing: { secs: 1, mult: 1.5 },
  fuel: 4 / 3,
  forking: 2,
  overload: 1.15,
  /** How long a lightning hit leaves an enemy shocked (what Overload works on). */
  shockSecs: 2,
  deepFreeze: { frozen: 1.5, again: 2.5 },
  rime: 2,
  shatter: 2,
  /** Inferno's and Shatter's bursts: their reach, and Inferno's blast as a share of the dead one's life. */
  burstR: 1.8,
  inferno: 0.25,
  shatterChill: 0.4,
  /** Flame Warp: a patch of fire every tile of the way, its fire a second as a share of a hit, and how long it burns. */
  flameWarp: { every: 1, share: 0.4, secs: 3, r: 0.8 },
  stormWarp: { n: 4, reach: 3.5, share: 1 },
  frostWarp: { r: 2.2 },
  stormcaller: { every: 2, reach: 5, share: 0.8 },
  // the ranger
  windrunner: { secs: 2, speed: 30 },
  venom: 2,
  longShot: 4 / 3,
  lightStep: { charges: 3, roll: 4 / 3 },
  huntersMark: 3,
  wideTraps: 4 / 3,
  minefield: { n: 3, spread: 1.3 },
  splitShot: { every: 3, n: 3, fan: 0.26 },
  hail: { life: 2, area: 1.5 },
  piercing: 1,
  farSight: { most: 0.5, at: 8 },
  steadyAim: { mult: 1.15, still: 0.3 },
  // the warrior
  cadence: 8,
  sweepingCut: { share: 0.3, reach: 1.3 },
  footwork: { secs: 1, speed: 25 },
  drilledLeap: 0.7,
  giantSlayer: 1.25,
  /** Master Stroke: every `every`th hit the hero lands (a hit's own target; not a splash, an arc or a burn) is a certain critical. */
  masterStroke: { every: 4 },
  thickSkin: 1.15,
  shieldwall: 2,
  secondWind: 1.3,
  bulwark: 0.9,
  thorns: { share: 0.3, reach: 1.6 },
  unbreakable: { secs: 3 },
  earthshaker: { r: 2.4, secs: 1 },
  // THE TREES REMADE (TALENTS2): their numbers, as their cards say them
  /** Honed Edge: a critical hit's bleeding, `share` of the hit over `secs`. */
  honedEdge2: { share: 0.5, secs: 3 },
  /** Drilled Lunge: what he passes within `reach` of (tiles beyond its edge and his), struck with `share` of the landing's blow. */
  drilledLunge: { reach: 0.5, share: 1 },
  /** Giant Slayer: each crack, this much more harm to it from everything; at most `most`. */
  giantSlayer2: { each: 0.03, most: 10 },
  /** Thick Skin: below `below` of his life, `less` less harm. */
  thickSkin2: { below: 0.5, less: 0.3 },
  /** Shieldwall's burst as the shield breaks: its reach, the stun, how far it throws. */
  shieldwall2: { r: 2.4, secs: 1, far: 1.6 },
  /** Second Wind: a flask throws back what is within `r`, `far` tiles; nothing hurts him for `secs`. */
  secondWind2: { r: 2.4, far: 1.8, secs: 1 },
  /** Bulwark: `each` less for each enemy within `near` tiles of him (beyond its edge and his), at most `most`. */
  bulwark2: { each: 0.06, most: 0.3, near: 1.2 },
  /** Thorns: half the blow back, and thrown `far` tiles. */
  thorns2: { share: 0.5, far: 1.4 },
  /** Venom: a poisoned enemy dying leaves a cloud `r` across for `dur` seconds, poisoning as it was. */
  venom2: { r: 1.6, dur: 3 },
  /** Steady Aim: standing still this long, his next arrow goes through everything in its line. */
  steadyAim2: { still: 1 },
  /** Quick Draw: every `every`th arrow fires twice, the second `gap` seconds after. */
  quickDraw2: { every: 5, gap: 0.09 },
  /** Long Shot: an arrow throws what it hits `far` tiles. */
  longShot2: { far: 0.9 },
  /** Wide Traps: what is within `reach` tiles of the trap's burst's edge is pulled in, to `to` tiles of it, over `secs`; then it bursts. */
  wideTraps2: { reach: 2.0, to: 0.6, secs: 0.18 },
  /** Split Shot: an arrow that kills splits into `n`, `fan` apart, each flying `far` tiles more. */
  splitShot2: { n: 3, fan: 0.4, far: 6 },
  /** Hail: Volley's rain goes after the enemy nearest where it was aimed (within `pick` tiles), `speed` tiles a second. */
  hail2: { pick: 2.5, speed: 3.5 },
  /** Ricochet: an arrow bounces off a wall this many times. */
  ricochet: 1,
  /** Far Sight: flown past `at` tiles, a certain critical. */
  farSight2: { at: 8 },
  /** Kindling: his fire leaves a patch of burning ground `r` across for `secs`, burning `share` of his weapon hit a second; none closer than `apart` to another. */
  kindling2: { r: 0.8, secs: 2, share: 0.3, apart: 0.7 },
  /** Searing: a burning enemy sets alight what is within `touch` tiles of its edge. */
  searing2: { touch: 0.25 },
  /** Hearth: in his own fire, mana `mana` times as fast. */
  hearth: { mana: 3 },
  /** Charged: full after `full` tiles walked; the bolt leaps between up to `n`, `reach` tiles apart, each `share` of his weapon hit; sparks every `spark` seconds while full. */
  charged2: { full: 6, n: 5, reach: 3.5, share: 1.2, spark: 0.35 },
  /** Overload: a shocked enemy dying passes its shock to the `n` nearest within `reach`, a jolt of `share` of his weapon hit. */
  overload2: { n: 3, reach: 4, share: 0.5 },
  /** Bitter Cold: what strikes him is chilled `slow` for `secs`. */
  bitterCold2: { slow: 0.5, secs: 2 },
  /** Deep Freeze: a frozen enemy struck slides `far` tiles over `secs`, freezing what it slides into. */
  deepFreeze2: { far: 3, secs: 0.45 },
  /** Undoing a talent, in town (his rulebook: "Picks can be undone in town, for gold"): gold for each level of the hero's. His price, 9 Oct 2026, 07:28: "10 gold a level (Recommended)". */
  unlearnPerLevel: 10,
};

/** (TALENTS2) The talents remade, by id. */
const REMADE = new Set<string>(Object.values({ WARRIOR, RANGER, MAGE }).flatMap((t) => t.talents.filter((d) => d.now).map((d) => d.id)));

/** (TALENTS2) Whether talent `id` is one that has been remade (and the switch is on): its old rule is gone, its new one in place. */
export function remadeNow(id: string): boolean {
  return TALENTS2.on && REMADE.has(id);
}

/** What a talent's card says now (TALENTS2: the remade one's new words). */
export function talentText(t: TalentDef): string {
  return TALENTS2.on && t.now ? t.now.text : t.text;
}

/** A talent's name now. */
export function talentName(t: TalentDef): string {
  return TALENTS2.on && t.now?.name ? t.now.name : t.name;
}

/** The word a talent works with now, if any. */
export function talentWord(t: TalentDef): WordId | undefined {
  if (TALENTS2.on && t.now && t.now.word !== undefined) return t.now.word ?? undefined;
  return t.word;
}

/** A talent of a class's tree, by its id. */
export function talentOf(cls: ClassId, id: string): TalentDef | undefined {
  return TREES[cls].talents.find((t) => t.id === id);
}

/** Why this talent cannot be taken now, or null if it can. */
export function takeProblem(cls: ClassId, level: number, taken: readonly string[], id: string): string | null {
  const t = talentOf(cls, id);
  if (!t) return 'No such talent';
  if (taken.includes(id)) return 'Taken';
  if (taken.length >= talentPoints(level)) {
    const next = nextTalentLevel(level);
    return next === null ? 'No points left' : `Next point at level ${next}`;
  }
  if (t.from.length && !t.from.some((f) => taken.includes(f))) return 'Take the one before it first';
  return null;
}

/** Why a taken talent cannot be undone (nothing else of the tree may hang on it alone), or null if it can. */
export function unlearnProblem(cls: ClassId, taken: readonly string[], id: string): string | null {
  if (!taken.includes(id)) return 'Not taken';
  const rest = taken.filter((t) => t !== id);
  const reach = new Set<string>();
  for (let n = 0; n <= rest.length; n++) {
    for (const t of rest) {
      const def = talentOf(cls, t);
      if (def && (!def.from.length || def.from.some((f) => reach.has(f)))) reach.add(t);
    }
  }
  return reach.size === rest.length ? null : 'Undo the ones after it first';
}

/** Whether the talent could be taken were there a point to spend (its way is open). */
export function talentOpen(cls: ClassId, taken: readonly string[], id: string): boolean {
  const t = talentOf(cls, id);
  return !!t && !taken.includes(id) && (!t.from.length || t.from.some((f) => taken.includes(f)));
}

/** What the taken talents add to the hero's numbers (the talents that are numbers only). */
export function talentMods(cls: ClassId, taken: readonly string[]): { stat: StatKey; value: number }[] {
  const out: { stat: StatKey; value: number }[] = [];
  if (!TALENTS.on) return out;
  for (const id of taken) {
    const t = talentOf(cls, id);
    // (TALENTS2: a remade talent is no longer a number)
    if (t?.mods && !remadeNow(t.id)) out.push(...t.mods);
  }
  return out;
}

/** A taken list made safe (an old save, a damaged one): only this class's talents, each once, in an order that could have been taken, no more than the level gives. */
export function cleanTalents(cls: ClassId, level: number, list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  const out: string[] = [];
  for (const id of list) {
    if (typeof id !== 'string') continue;
    if (takeProblem(cls, level, out, id) === null) out.push(id);
  }
  return out;
}
