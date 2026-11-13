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

import type { SkillId } from './defs';
import type { ClassId, StatKey, WordId } from './types';
import { VETERAN } from './veteran';

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
  /**
   * A pick of two that comes with it (the Tinkerer's Gun Arm and Contraption, his “On the talent itself (Recommended)”, 31 Oct
   * 2026): the first is hers as she takes it; on its card, the other's button switches to it. Game.pickOf says which.
   */
  pick?: { ids: readonly string[]; names: readonly string[]; /** (the Mage's Aura: “She picks when she takes it”) picked once; unlearn to change */ lock?: boolean };
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
  | { kind: 'round'; path: string; ids: readonly string[]; pad: number /* in the shape's own units */ }
  // (the Veteran's: a globe of glass through the talents round its rim, and over it, round the talent `fire`, its flames)
  | { kind: 'globe'; path: string; ids: readonly string[]; fire?: string }
  // (the Warrior's new tree, 7 Nov 2026: a shape drawn by its corners, in the tree's own units: a greatsword's blade, an axe's bits)
  | { kind: 'outline'; path: string; pts: readonly (readonly [number, number])[] };

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

/** A page built to show the Ranger's companions says so (esbuild's define). */
declare const __COMPANIONS__: boolean | undefined;
/**
 * THE RANGER'S COMPANIONS (the main chat, from 28 Oct 2026, 23:09): the owner's words, “I’d like the ranger to have a passive
 * that summons a hawk companion that applies PRECISE on hit, a snake companion, that applies “of POISON”, and a third
 * something I need help with”; 23:10, “And that should be an Or for those companions.  You pick one, not all three”; his
 * picks, the hawk “It marks its prey (Recommended)”, “One at a time, I pick”, “Any time in town (Recommended)”; and to the
 * third, offered the wolf, the bat, the fox and the tortoise: “Okay maybe we have two separate passive with three each cause I
 * love all of these.  Let’s put them opposite each other on the tree so if you want one companion that’s fine but if you want
 * two it’s going to take some investment.  So we need 6 total”. So two talents on his tree, one on each feather, opposite
 * each other: the HUNTING COMPANION (the hawk, the snake or the wolf) and the WILD COMPANION (the bat, the fox or the
 * tortoise), each three points from where the tree begins, both six. Off until he has seen them and said yes.
 */
export const COMPANIONS = { on: typeof __COMPANIONS__ !== 'undefined' && __COMPANIONS__ === true };
const COMPANION_TALENTS: TalentDef[] = [
  { id: 'wildcompanion', name: 'Wild Companion', big: true, path: 'wind', at: [1.6, 0.3], from: ['windrunner'], text: 'A bat, a fox or a tortoise fights at your side. Pick it in town.' },
  { id: 'huntcompanion', name: 'Hunting Companion', big: true, path: 'eye', at: [1.6, 3.7], from: ['venom'], text: 'A hawk, a snake or a wolf fights at your side. Pick it in town.' },
];

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
    // (THE RANGER'S COMPANIONS: one on each feather, opposite each other; off until his yes)
    ...(COMPANIONS.on ? COMPANION_TALENTS : []),
  ],
  figures: [
    { kind: 'fill', path: 'wind', ids: COMPANIONS.on ? ['fleet', 'wildcompanion', 'quickdraw', 'steadyaim'] : ['fleet', 'windrunner', 'quickdraw', 'steadyaim'] },
    { kind: 'fill', path: 'eye', ids: COMPANIONS.on ? ['keeneye', 'huntcompanion', 'quickdraw', 'steadyaim'] : ['keeneye', 'venom', 'quickdraw', 'steadyaim'] },
    { kind: 'fill', path: 'shaft', ids: ['huntersmark', 'widetraps', 'minefield', 'farsight', 'hail', 'splitshot'] },
  ],
};

// ---- the mage's and the ranger's moves to swap (drafted, 12 Nov 2026) ---------------------------------------------------
/**
 * MOVES TO SWAP FOR THE MAGE AND THE RANGER, DRAFTED (docs/mockups/swap_moves/README.md has every word of his). His words, 4 Nov
 * 2026, 19:18: “Him and the mage and less so the ranger need some work to get up to the level of the new three classes.”; 19:19:
 * “They just need different moves to swap between.” His picks, 12 Nov 2026, by pop-up: the Mage, “No weapon pick, swaps in her
 * paths”; “beam is good for lightning, ball for tap maybe in the fire slot for fireball, blizzard is too on the nose.  and id like
 * the trees to reconnect in the middle to a tap on the hero ability called Aura and it turns on an aura around the mage.  it can do
 * something like fire DoT or send out bolts to every enemy in the aura, or shields you and chills enemies in the circle”; the frost
 * swap “Spear”; the Aura's kind “She picks when she takes it”; how long, “one, and then maybe another passive that leaves it on
 * further into the tree”. The Ranger: “i like snare, maybe something like SNIPE where the longer you hold it the more damage the
 * shot goes and it pierces through enemies”. Then, 21:48: “i dont want spear to be ice spear, i want it to be spear, same with the
 * others.  youll be able to dip into multiple trees so maybe you want spear and ball or beam and spear”; her moves, “She sets tap and
 * hold (Recommended)”; his, “i like snare to swap for shot and snipe to swap for volley”. So: her three paths meet in the middle at
 * AURA, every path through it; beside each path's first stone a new move of no element (BALL, BEAM, SPEAR), each LEARNED, and she
 * puts any two of Wave, Orb, Ball, Beam and Spear on her tap and hold (Beam held only); LASTING AURA at the far end, reached from
 * any path's last stone. His: SNARE in place of Shot, SNIPE in place of Volley, beside the first stone of each barb of his arrow's
 * head; and 21:53, “and maybe something for the companions?  like Rally or something that gives nearby allies attack speed and
 * damage or something”, “as another swap for volley”: RALLY beside his Wild Companion, Volley taking Snipe or Rally. THE TREES ONLY, TO SHOW HIM (the cards say what each will do; the new stones do nothing yet), off.
 */
export const SWAP_MOVES = { on: false };
const AURA_C = '#d8c8ff';
/** The Mage's stones moved for the drafted shape (where each sits now, and what leads to it), by id; the rest as MAGE has them. */
const MAGE2_AT: Record<string, { at: readonly [number, number]; from: readonly string[] }> = {
  flamewarp: { at: [4, 0], from: ['aura'] },
  fuel: { at: [5, 0], from: ['flamewarp'] },
  inferno: { at: [6, 0], from: ['fuel'] },
  stormwarp: { at: [4, 2], from: ['aura'] },
  overload: { at: [5, 2], from: ['stormwarp'] },
  stormcaller: { at: [6, 2], from: ['overload'] },
  frostwarp: { at: [4, 4], from: ['aura'] },
  rime: { at: [5, 4], from: ['frostwarp'] },
  shatter: { at: [6, 4], from: ['rime'] },
};
const MAGE2: TalentTree = {
  cls: 'mage',
  shape: 'three paths from her rune, meeting in the middle at her Aura',
  root: [0, 2],
  draft: true,
  paths: [
    { id: 'fire', name: 'FIRE', color: FIRE, label: { node: 'flamewarp', side: 'above' } },
    { id: 'lightning', name: 'LIGHTNING', color: LIGHT, label: { node: 'stormwarp', side: 'below' } },
    { id: 'frost', name: 'FROST', color: FROST, label: { node: 'frostwarp', side: 'below' } },
    { id: 'aura', name: 'AURA', color: AURA_C, label: { node: 'aura', side: 'above' } },
  ],
  talents: [
    ...MAGE.talents.map((t) => (MAGE2_AT[t.id] ? { ...t, works: true, ...MAGE2_AT[t.id] } : { ...t, works: true })),
    // (the swaps, beside each path's first stone)
    { id: 'ball', name: 'Ball', big: true, path: 'fire', at: [1.5, -0.9], from: ['kindling'], text: 'Learn BALL: a ball flies at the enemy and bursts where it hits. Put it on your tap or your hold (ATTACKS).' },
    { id: 'beam', name: 'Beam', big: true, path: 'lightning', at: [1.5, 1.1], from: ['charged'], text: 'Learn BEAM: it burns toward your finger for as long as you hold, steered as you move it, through everything in its line. It goes on your hold (ATTACKS).' },
    { id: 'spear', name: 'Spear', big: true, path: 'frost', at: [1.5, 4.9], from: ['bittercold'], text: 'Learn SPEAR: a spear flies where you point, through every enemy in its line. Put it on your tap or your hold (ATTACKS).' },
    // (where her paths meet, and the far end)
    { id: 'aura', name: 'Aura', big: true, path: 'aura', at: [3, 2], from: ['searing', 'forking', 'deepfreeze'], pick: { ids: ['fire', 'lightning', 'frost'], names: ['FIRE', 'LIGHTNING', 'FROST'], lock: true }, text: 'AURA: tap yourself for a circle round you, a few seconds, then a wait. Pick its kind as you take it (unlearn to change): FIRE burns every enemy in it; LIGHTNING sends bolts to every enemy in it; FROST shields you and chills the enemies in it.' },
    { id: 'lasting', name: 'Lasting Aura', big: true, path: 'aura', at: [7, 2], from: ['inferno', 'stormcaller', 'shatter'], text: 'Your Aura stays on.' },
  ],
};
const RANGER2: TalentTree = {
  ...RANGER,
  draft: true,
  talents: [
    ...RANGER.talents.map((t) => ({ ...t, works: true })),
    { id: 'snare', name: 'Snare', big: true, path: 'traps', at: [6.9, -0.25], from: ['widetraps'], text: 'Your tap becomes SNARE, in place of Shot: a snare thrown where you point; what walks into it is held fast, then it bursts.' },
    { id: 'snipe', name: 'Snipe', big: true, path: 'arrows', at: [6.9, 4.25], from: ['splitshot'], text: 'Your hold becomes SNIPE, in place of Volley: draw and hold, the longer the harder the shot, and it goes through enemies. Volley takes one: Snipe or Rally.' },
    { id: 'rally', name: 'Rally', big: true, path: 'wind', at: [2.6, 0.3], from: COMPANIONS.on ? ['wildcompanion'] : ['windrunner'], text: 'Your hold becomes RALLY, in place of Volley: a call that gives your companions and allies near you faster, harder attacks for a few seconds. Volley takes one: Snipe or Rally.' },
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

// ---- THE WARRIOR'S NEW TREE, DRAFTED (the main chat, 7 Nov 2026; behind WARRIOR_TREE2, off: a picture for him first). His words,
// 21:11: “Alright let’s figure out the warrior.  I want his skill tree to start with a three branch option to go to Battle Ax,
// Warhammer, or (insert two handed sword name).  Then he’ll need tap and holds, probably swipes for the three weapons.  These will
// change his current weapon drops as well.  Swords become hammers become axes.  I think, it seems crazy to have all three drop when
// he could only use one at any given time”. His picks after: the Greatsword; the weapon picked with the first talent point, level 5
// (the Greatsword till then); “Yes, his weapons change too (Recommended)”; swipes “Each its own (Recommended)”. Of the moves: “All
// those are good, I’d like whirlwind to start as WHIRL.  One spin, higher base damage than strike.  Then an option to change to
// whirlwind (more hits, less damage) in the passive tree”. Of the shape, through three drafts: “Let’s scrap iron tree and hit a
// defensive passive into each of the three trees.  Then center that initial node in the center”; 21:29, “And screw it, make them
// look like weapons”; then, shown that three whole weapons crowd a phone's page, “Ah I see what you’re saying about each weapon and
// filling out the tree with points.  Uhhhh I guess put the iron path back in and center the starting node between all 4”; 8 Nov
// 00:06, “Maybe have them connect at certain points on a node that works with both.  And have some nodes at the very top that they
// connect to at the end of the tree”; and of the layout, “Paths up to the top (Recommended)”. So: from the start node, low in the
// middle, four paths up side by side, each drawn as itself standing (the battle axe, the greatsword, the warhammer, IRON as a
// shield); each weapon's first stone is the weapon (one only; his first point takes one), beside it its hold's other way; between
// two paths a talent either can take; across the top three big ones, each reached from the top of the two paths under it. IRON
// opens once a weapon is his. The talents kept from the old tree keep their ids and work as they do now; the new ones work since the build
// of 8 Nov 2026, at his “Yes, build it (Recommended)” (game/game.ts; their numbers WARRIOR_TUNE below; his moves by his weapon, WARRIOR_KITS).
// ON, 12 Nov 2026, at his word to the main chat by 09:07, shown the three weapons in play with the art chat's axe and maul
// (warrior_weapons.mp4; docs/warrior_tree_build.md): “Yes, put it live (Recommended)”.
export const WARRIOR_TREE2 = { on: true };
const GSWORD = '#6fa8ff';
const AXE = '#ff6a50';
const HAMMER = '#ac8753';
/** The talents between two paths and across the top: either path's (a star). */
const JOIN = '#d8c8ff';
/** Where the four paths stand (x), their rows (y: the weapons, then up), the start node, the shared row, the top. */
const COL = { axe: 0, sword: 2, hammer: 4, iron: 6 } as const;
const ROW = { pick: 4.4, change: 3.85, a: 3.4, b: 2.4, c: 1.4, top: 0 } as const;

const WARRIOR2: TalentTree = {
  cls: 'warrior',
  shape: 'his weapons and his iron, side by side',
  root: [3, 5.5],
  room: [-1.25, -0.45, 7.0, 5.75],
  paths: [
    { id: 'axe', name: 'BATTLE AXE', color: AXE, label: { node: 'battleaxe', side: 'below' } },
    { id: 'gsword', name: 'GREATSWORD', color: GSWORD, label: { node: 'greatsword', side: 'below' } },
    { id: 'hammer', name: 'WARHAMMER', color: HAMMER, label: { node: 'warhammer', side: 'below' } },
    { id: 'iron', name: 'IRON', color: IRON, label: { node: 'thickskin', side: 'below' } },
    { id: 'join', name: '', color: JOIN, label: { node: 'mastertop', side: 'above' } },
  ],
  talents: [
    // THE BATTLE AXE
    { id: 'battleaxe', name: 'Battle Axe', big: true, works: true, path: 'axe', at: [COL.axe, ROW.pick], from: [], text: 'Your weapon: pick one of three. Every weapon you find will be a battle axe. TAP Cleave. HOLD throw your axe; it comes back to you. SWIPE Leaping Chop.' },
    { id: 'twinaxes', name: 'Twin Axes', big: true, works: true, path: 'axe', at: [COL.axe + 0.8, ROW.change], from: ['battleaxe'], text: 'Your throw becomes TWIN AXES: two axes, one to each side of your aim, each for less.' },
    { id: 'rend', name: 'Rend', big: false, works: true, path: 'axe', at: [COL.axe, ROW.a], from: ['battleaxe'], text: 'Cleave makes the enemy bleed: it loses a third of the hit again over three seconds.' },
    { id: 'redmist', name: 'Red Mist', big: false, works: true, path: 'axe', at: [COL.axe, ROW.b], from: ['rend'], text: 'Each kill: you swing 8% faster for four seconds, up to five kills.' },
    { id: 'headlong', name: 'Headlong', big: false, works: true, path: 'axe', at: [COL.axe, ROW.c], from: ['redmist'], text: 'Every kill makes Leaping Chop ready again at once.' },
    // THE GREATSWORD
    { id: 'greatsword', name: 'Greatsword', big: true, works: true, path: 'gsword', at: [COL.sword, ROW.pick], from: [], text: 'Your weapon: pick one of three. Every weapon you find will be a greatsword. TAP Strike. HOLD Whirl, one spin, harder than Strike. SWIPE Lunge.' },
    { id: 'gswhirlwind', name: 'Whirlwind', big: true, works: true, path: 'gsword', at: [COL.sword + 0.8, ROW.change], from: ['greatsword'], text: 'Whirl becomes WHIRLWIND: you spin round and round, more hits, each for less.' },
    { id: 'sweepingcut', name: 'Sweeping Cut', big: false, works: true, path: 'gsword', at: [COL.sword, ROW.a], from: ['greatsword'], text: 'A melee hit splashes 30% of itself on the enemies beside.', now: { text: 'Your melee swings cleave: every enemy in the arc of the swing is struck, not only the first.' } },
    { id: 'drilledleap', name: 'Drilled Lunge', big: false, works: true, path: 'gsword', at: [COL.sword, ROW.b], from: ['sweepingcut'], text: 'Lunge is ready again 30% sooner.', now: { text: 'Lunge strikes every enemy you pass on the way, not only where you land.' } },
    { id: 'footwork', name: 'Footwork', big: false, works: true, path: 'gsword', at: [COL.sword, ROW.c], from: ['drilledleap'], text: 'Each kill: run 25% faster for a second.', now: { text: 'Every kill makes Lunge ready again at once.' } },
    // THE WARHAMMER
    { id: 'warhammer', name: 'Warhammer', big: true, works: true, path: 'hammer', at: [COL.hammer, ROW.pick], from: [], text: 'Your weapon: pick one of three. Every weapon you find will be a warhammer. TAP Smash. HOLD Earthquake. SWIPE Shoulder Charge.' },
    { id: 'tremors', name: 'Tremors', big: true, works: true, path: 'hammer', at: [COL.hammer + 0.8, ROW.change], from: ['warhammer'], text: 'Earthquake becomes TREMORS: the ground shakes three times, each weaker.' },
    { id: 'heavyhead', name: 'Heavy Head', big: false, works: true, path: 'hammer', at: [COL.hammer, ROW.a], from: ['warhammer'], text: 'Smash stuns the enemy for half a second.' },
    { id: 'bulldozer', name: 'Bulldozer', big: false, works: true, path: 'hammer', at: [COL.hammer, ROW.b], from: ['heavyhead'], text: 'Shoulder Charge carries the enemies it hits along with you, and stuns them where you stop.' },
    { id: 'wideswing', name: 'Wide Swing', big: false, works: true, path: 'hammer', at: [COL.hammer, ROW.c], from: ['bulldozer'], text: 'Smash strikes everything in a half circle in front of you.' },
    // IRON (the old tree's, as they work now; open once a weapon is his)
    { id: 'thickskin', name: 'Thick Skin', big: false, works: true, path: 'iron', at: [COL.iron, ROW.pick], from: [], text: 'Life +15%.', now: { text: 'Below half your life, you take 30% less damage.' } },
    { id: 'shieldwall', name: 'Shieldwall', big: true, works: true, path: 'iron', at: [COL.iron, ROW.a], from: ['thickskin'], text: "Guarding's shield has 100% increased strength.", word: 'guarding', now: { text: "When Guarding's shield breaks, it bursts outward: everything near is thrown back and stunned for a second." } },
    { id: 'secondwind', name: 'Second Wind', big: false, works: true, path: 'iron', at: [COL.iron, ROW.b], from: ['shieldwall'], text: 'Flasks heal 30% more.', now: { text: 'Drinking a flask throws back everything near you, and nothing can hurt you for a second.' } },
    { id: 'bulwark', name: 'Bulwark', big: false, works: true, path: 'iron', at: [COL.iron, ROW.c], from: ['secondwind'], text: 'You take 10% less damage.', now: { text: 'The more enemies close round you, the less each blow hurts: 6% less for each one, up to 30%.' } },
    // BETWEEN TWO PATHS: a talent either can take
    { id: 'honededge', name: 'Honed Edge', big: false, works: true, path: 'join', at: [(COL.axe + COL.sword) / 2, ROW.b], from: ['redmist', 'drilledleap'], text: 'All damage +15%.', mods: [{ stat: 'dmgPct', value: 15 }], now: { text: 'Your critical hits make the enemy bleed: it loses half the hit again over three seconds.' } },
    { id: 'giantslayer', name: 'Giant Slayer', big: false, works: true, path: 'join', at: [(COL.sword + COL.hammer) / 2, ROW.b], from: ['drilledleap', 'bulldozer'], text: 'Elites and bosses take 25% increased damage from you.', now: { text: 'Each hit on an elite or a boss cracks its guard: it takes 3% more from everything, up to ten cracks.' } },
    { id: 'resolute', name: 'Resolute', big: false, works: true, path: 'join', at: [(COL.hammer + COL.iron) / 2, ROW.b], from: ['bulldozer', 'secondwind'], text: 'Fire, frost and lightning resistance +15%.', mods: [{ stat: 'fireRes', value: 15 }, { stat: 'frostRes', value: 15 }, { stat: 'lightRes', value: 15 }], now: { text: 'Nothing can slow you, freeze you or knock you back.' } },
    // ACROSS THE TOP: the ends, each reached from the top of the two paths under it
    { id: 'executioner', name: 'Executioner', big: true, works: true, path: 'join', at: [(COL.axe + COL.sword) / 2, ROW.top], from: ['headlong', 'footwork'], text: 'Enemies below a quarter of their life take double damage from you.' },
    { id: 'mastertop', name: 'Master Stroke', big: true, works: true, path: 'join', at: [(COL.sword + COL.hammer) / 2, ROW.top], from: ['footwork', 'wideswing'], text: 'Every fourth hit you land is a certain critical.' },
    { id: 'unbreakable', name: 'Unbreakable', big: true, works: true, path: 'join', at: [(COL.hammer + COL.iron) / 2, ROW.top], from: ['wideswing', 'bulwark'], text: 'Once a dungeon, a killing blow leaves you at 1 life, shielded for three seconds.' },
  ],
  // each path drawn standing, faint behind it: its hilt or haft from below the first stone, its head at the top
  figures: [
    // the battle axe: its haft, its blade out to the left at the top
    { kind: 'outline', path: 'axe', pts: [[-0.09, 4.95], [0.09, 4.95], [0.09, 0.95], [-0.09, 0.95]] },
    { kind: 'outline', path: 'axe', pts: [[-0.05, 0.95], [-0.55, 0.6], [-1.15, 0.75], [-1.05, 1.4], [-1.15, 2.05], [-0.55, 2.2], [-0.05, 1.85]] },
    // the greatsword: its grip, its crossguard at the first stone, its blade up to its point
    { kind: 'outline', path: 'gsword', pts: [[1.92, 5.0], [2.08, 5.0], [2.08, 4.7], [1.92, 4.7]] },
    { kind: 'outline', path: 'gsword', pts: [[1.35, 4.62], [2.65, 4.62], [2.65, 4.18], [1.35, 4.18]] },
    { kind: 'outline', path: 'gsword', pts: [[1.72, 4.18], [2.28, 4.18], [2.28, 1.2], [2, 0.55], [1.72, 1.2]] },
    // the warhammer: its haft, its head across the top
    { kind: 'outline', path: 'hammer', pts: [[3.91, 4.95], [4.09, 4.95], [4.09, 1.95], [3.91, 1.95]] },
    { kind: 'outline', path: 'hammer', pts: [[3.35, 1.95], [4.65, 1.95], [4.75, 1.8], [4.75, 1.0], [4.65, 0.85], [3.35, 0.85], [3.25, 1.0], [3.25, 1.8]] },
    // IRON: a shield, its point down
    { kind: 'outline', path: 'iron', pts: [[5.4, 0.95], [6.6, 0.95], [6.6, 3.4], [6.3, 4.4], [6.0, 4.95], [5.7, 4.4], [5.4, 3.4]] },
  ],
};

// ---- THE NEW CLASSES' TREES (the main chat, 28 Oct 2026; drafted, then every talent made to work and filmed for him, his
// yes to each tree in play by 19:43: the Tinkerer's, “Good, keep going (Recommended)”). Shown to him as a page, “Three New Skill Trees” (https://claude.ai/artifact/GhWB8vecSeRyHxDGQQWKHA,
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
//   His talents at work filmed in the game for him (warlock_tree_film.mp4), his word by 19:03 (Eastern): “Looks good”; Phantom
//   Step filmed (phantom_film.mp4), by 19:41: “Yes, keep it (Recommended)”.
//   Reaching right from the wrist: the DEMON from the back of the hand (its spur up off it), the MAN from the heel of it (the
//   thumb down off it); they meet at the knuckle, the pact's, where the three talons come out: the demon's on top, the pact's
//   in the middle, the man's below, each hooking down at its point.
const MAN = '#b49cff';
const DEMON = '#ff5a3c';
const PACT = '#9a78c8';

const WARLOCK_TREE: TalentTree = {
  cls: 'warlock',
  shape: 'a demon’s claw',
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
//   bottom tooth, her second Golem. Her talents at work filmed for him (tinkerer_tree_film.mp4), by 19:43: “Good, keep going
//   (Recommended)”.
const VIALS = '#7ae0c0';
const GOLEMS = '#e8a858';
const WORKS = '#b8c0d0';
const GOLD = '#ffd448';
const R3 = Math.sqrt(3);

const TINKERER_TREE: TalentTree = {
  cls: 'tinkerer',
  shape: 'a gear',
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
    // (THE CONTRAPTION'S PICK, his word to the art chat, 31 Oct, 00:04: “And have the same option when swapping vial to
    // contraption”, “Energy bolts, and let’s make the contraption throw little bombs.  She’s marketed as a demolitionist and we
    // need to fit that in better”; picked on the talent, his “On the talent itself (Recommended)”)
    { id: 'contraptions', name: 'Contraption', big: true, works: true, path: 'vials', at: [0, -1], from: ['madmixture', 'fortune'], text: 'Her tap sets down a Contraption in place of the Vial Toss, three at once. It fires her pick: little bombs (Dexterity) or energy bolts (Int).', pick: { ids: ['bombs', 'energy'], names: ['BOMBS', 'ENERGY'] } },
    { id: 'alchemy', name: 'Alchemy', big: false, works: true, path: 'vials', at: [1, -R3], from: ['madmixture'], text: 'An enemy her vials kill always drops gold.' },
    { id: 'thebigone', name: 'The Big One', big: true, works: true, path: 'vials', at: [R3, -1], from: ['alchemy'], text: 'Every fifth vial is a big one: it bursts three times as wide and knocks everything down.' },
    // THE GOLEM, round under the bottom
    { id: 'lightningrod', name: 'Lightning Rod', big: false, works: true, path: 'golem', at: [-R3, 1], from: ['bombsaway'], text: 'For three seconds after its ground pound, every enemy near the Golem goes after it instead of her.' },
    { id: 'shrapnel', name: 'Shrapnel', big: false, works: true, path: 'golem', at: [-1, R3], from: ['lightningrod'], text: 'The Golem’s blows burst where they land, striking everything near.' },
    // (THE GUN ARM in place of the Tesla Coil, his word to the art chat, 30 Oct, 23:55: “maybe we want a passive that makes him
    // ranged where his hold becomes a big charged shot”, and 31 Oct, 00:00, “I want both”: “Yes, one pick, two arms
    // (Recommended)”; to the main chat, 31 Oct: where, “Turn Tesla Coil into it (Recommended)”; let go early, “A weaker shot
    // fires”)
    { id: 'gunarm', name: 'Gun Arm', big: false, works: true, path: 'golem', at: [0, 2], from: ['shrapnel'], text: 'The Golem fights from range with a gun arm, her pick: cannon (Dexterity) or tesla coil (Int). Her hold charges a great shot.', pick: { ids: ['cannon', 'tesla'], names: ['CANNON', 'TESLA COIL'] } },
    { id: 'markii', name: 'Mark II', big: true, works: true, path: 'golem', at: [0, 1], from: ['gunarm'], text: 'She can whistle out a second Golem: two at once.' },
    { id: 'prospector', name: 'Prospector', big: false, works: true, path: 'golem', at: [1, R3], from: ['gunarm'], text: 'Every ground pound digs up a handful of gold.' },
    { id: 'overdrive', name: 'Overdrive', big: true, works: true, path: 'golem', at: [R3, 1], from: ['prospector'], text: 'Her whistle sends the Golem into overdrive for five seconds: it moves and strikes twice as fast.' },
    // the right tooth: both paths'
    { id: 'growthserum', name: 'Growth Serum', big: true, works: true, path: 'works', at: [2, 0], from: ['thebigone', 'overdrive'], text: 'A vial of hers that bursts by her Golem makes it grow: twice as big and twice as strong for five seconds.' },
  ],
  figures: [
    { kind: 'gear', path: 'works', hub: 'fortune', ring: ['bombsaway', 'clustervials', 'tar', 'madmixture', 'alchemy', 'thebigone', 'growthserum', 'overdrive', 'prospector', 'gunarm', 'shrapnel', 'lightningrod'], spokes: 4 },
  ],
};

// ---- the brawler: a fist ----------------------------------------------------------------------------------
//   Punching right, seen from the side: the wrist on the left (SPEED's start above, POWER's below), the back of the hand, the
//   four fingers curled into a column of knuckles at the front (SPEED's two on top, POWER's two below), and across the middle
//   of them the thumb, both paths' (his slip and counter), from its root where the two meet. The paths were drafted as ONE
//   TARGET and CROWD, his words; shown the tree, 28 Oct 2026, by 17:47 (Eastern): “Keep it, except change the names of “one
//   target” and “crowd””, and asked which, “Speed and Power”. His talents at work filmed for him (brawler_tree_film.mp4), by
//   19:41: “Good, keep going (Recommended)”.
const SPEED = '#ff7a50';
const POWER = '#5ab0ff';
const COUNTER = '#e8d090';

const BRAWLER_TREE: TalentTree = {
  cls: 'brawler',
  shape: 'a fist',
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

// ---- the Veteran: three globes (game/veteran.ts VETERAN; his 3 Nov 2026, 09:18: “And redo the skill tree to better match his
//   new style”) ----------------------------------------------------------------------------------------------------------
//   His three globes over his head, as they are over him in a fight: PUNCH (green, a tap), JUMP (white, a swipe)
//   and KICK (hot orange, a hold), side by side. Each globe is four talents round its rim, begun at its bottom, up either
//   side to its top; over the punch and the kick globes, their fire (a swipe then a tap, the flying uppercut; a swipe then a
//   hold, the flying knee and the spinning jump kick); over the jump globe, the lock that joins all three, reached from any
//   globe's top. Nothing of the old Brawler's. Shown to him as a draft (the page “The Veteran's Tree”, https://claude.ai/artifact/6u1Xx6DLPByUGWrPf9menQ), his
//   pick by 09:42: “Yes, build it (Recommended)”; every talent made to work as its card says (game.ts, “THE VETERAN”; numbers,
//   game/veteran.ts VET_TALENTS).
// (his punches green, his words, 3 Nov 2026, 10:44: “the brawler is Str/dex, so I think we change the color of the globe for a
// punch to green and the kicks stay orange/red”: the art chat's emerald, #18c060)
const VET_PUNCH = '#18c060';
const VET_KICK = '#e8561a';
const VET_JUMP = '#e8eef8';

const VETERAN_TREE: TalentTree = {
  cls: 'brawler',
  shape: 'three globes',
  square: true,
  room: [-1.35, -1.05, 7.95, 3.45],
  paths: [
    { id: 'punch', name: 'PUNCH', color: VET_PUNCH, label: { node: 'vstiffjab', side: 'below' } },
    { id: 'jump', name: 'JUMP', color: VET_JUMP, label: { node: 'vlightfeet', side: 'below' } },
    { id: 'kick', name: 'KICK', color: VET_KICK, label: { node: 'vswitchkick', side: 'below' } },
  ],
  talents: [
    // THE PUNCH GLOBE (his taps: the jab, the cross, the hook, the spinning elbow), and over it its fire, the flying uppercut
    { id: 'vstiffjab', name: 'Stiff Jab', big: false, works: true, path: 'punch', at: [0, 3], from: [], text: 'His jab breaks off whatever an enemy is winding up: it has to start again.' },
    // (his elemental upgrades, picked in the art chat, “Both (Recommended)”: a few in his tree, his examples a viper jab and a
    // thunder knee; swapped in at his “Swap two in (Recommended)”, 3 Nov, by 09:53: Viper Jab for One-Two, Thunder Knee for Lights Out)
    { id: 'vviperjab', name: 'Viper Jab', big: false, works: true, path: 'punch', at: [-1, 2], from: ['vstiffjab'], word: 'poison', text: 'His jab poisons whatever it hits.' },
    { id: 'vguardup', name: 'Guard Up', big: false, works: true, path: 'punch', at: [1, 2], from: ['vstiffjab'], text: 'Between blows he keeps his fists up: a blow from in front of him does half harm.' },
    { id: 'vknockdown', name: 'Knockdown', big: true, works: true, path: 'punch', at: [0, 1], from: ['vviperjab', 'vguardup'], text: 'The third punch of a combo knocks everything it hits off its feet: down for two seconds.' },
    { id: 'vlauncher', name: 'Launcher', big: true, works: true, path: 'punch', at: [0, -0.3], from: ['vknockdown'], text: 'His flying uppercut throws up everything in its cone; while they hang in the air, his blows on them land twice as hard.' },
    // THE JUMP GLOBE (his swipe: the dodge jump, and the jump spent on every fire globe)
    { id: 'vlightfeet', name: 'Light Feet', big: false, works: true, path: 'jump', at: [3.3, 3], from: [], text: 'His jump comes back a third sooner: two fire globes in a combo, more often.' },
    { id: 'vfirestarter', name: 'Fire Starter', big: false, works: true, path: 'jump', at: [2.3, 2], from: ['vlightfeet'], text: 'Landing from a dodge jump, his next tap or hold comes out in fire, the uppercut or the spin kick, and spends no jump.' },
    { id: 'vstoke', name: 'Stoke', big: false, works: true, path: 'jump', at: [4.3, 2], from: ['vlightfeet'], text: 'Each fire move that lands takes two seconds off his jump’s wait.' },
    { id: 'vhangtime', name: 'Hang Time', big: true, works: true, path: 'jump', at: [3.3, 1], from: ['vfirestarter', 'vstoke'], text: 'In the air nothing touches him: through every jump and every fire move, from take-off to landing.' },
    // (the lock that joins the three globes, from any globe's top)
    { id: 'vfullset', name: 'The Full Set', big: true, works: true, path: 'jump', at: [3.3, -0.3], from: ['vknockdown', 'vhangtime', 'vaftershock'], text: 'A combo locked with a punch, a kick and a fire globe in it ends in a finisher: its last blow lands three times as hard and throws them.' },
    // THE KICK GLOBE (his holds: the round kick, the push kick), and over it its fire, the flying knee and the spinning jump kick
    { id: 'vswitchkick', name: 'Switch Kick', big: false, works: true, path: 'kick', at: [6.6, 3], from: [], text: 'A hold straight after a tap is a switch kick: his round kick with half its wind-up.' },
    { id: 'vlonglegs', name: 'Long Legs', big: false, works: true, path: 'kick', at: [5.6, 2], from: ['vswitchkick'], text: 'His kicks reach a tile further: 3½ tiles; the push kick and the spinning jump kick 4½.' },
    { id: 'vwallslam', name: 'Wall Slam', big: false, works: true, path: 'kick', at: [7.6, 2], from: ['vswitchkick'], text: 'An enemy his kick drives into a wall, or into another enemy, is stunned for two seconds.' },
    { id: 'vaftershock', name: 'Aftershock', big: true, works: true, path: 'kick', at: [6.6, 1], from: ['vlonglegs', 'vwallslam'], text: 'Every kick that lands sends a ring of force through the floor round the one he kicked: everything within a tile and a half of it falls.' },
    { id: 'vthunderknee', name: 'Thunder Knee', big: true, works: true, path: 'kick', at: [6.6, -0.3], from: ['vaftershock'], word: 'lightning', text: 'His flying knee and spinning jump kick crack with lightning: it jumps on to three more enemies near each one they hit, and stuns them.' },
  ],
  figures: [
    { kind: 'globe', path: 'punch', ids: ['vstiffjab', 'vviperjab', 'vknockdown', 'vguardup'], fire: 'vlauncher' },
    { kind: 'globe', path: 'jump', ids: ['vlightfeet', 'vfirestarter', 'vhangtime', 'vstoke'] },
    { kind: 'globe', path: 'kick', ids: ['vswitchkick', 'vlonglegs', 'vaftershock', 'vwallslam'], fire: 'vthunderknee' },
  ],
};

export const TREES: Record<ClassId, TalentTree> = {
  // (the Warrior's new tree, drafted: while WARRIOR_TREE2 is on)
  get warrior(): TalentTree {
    return WARRIOR_TREE2.on ? WARRIOR2 : WARRIOR;
  },
  // (the Mage's and the Ranger's moves to swap, drafted: while SWAP_MOVES is on)
  get ranger(): TalentTree {
    return SWAP_MOVES.on ? RANGER2 : RANGER;
  },
  get mage(): TalentTree {
    return SWAP_MOVES.on ? MAGE2 : MAGE;
  },
  warlock: WARLOCK_TREE,
  tinkerer: TINKERER_TREE,
  // (the Brawler made again as the Veteran: his tree, while VETERAN is on)
  get brawler(): TalentTree {
    return VETERAN.on ? VETERAN_TREE : BRAWLER_TREE;
  },
};

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
  if (!wayOpen(cls, t, taken)) return 'Take one joined to it first';
  if (otherWeapon(cls, id, taken)) return 'One weapon only';
  if (notHisWeapon(cls, t, taken)) return 'Not your weapon';
  if (waitsForWeapon(cls, t, taken)) return 'Pick your weapon first';
  return null;
}

/**
 * THE LINES WORK BOTH WAYS. His words, 12 Nov 2026, 18:09 (Eastern): “i cant go from quick draw to venom in the skill tree for the
 * ranger”; asked whether to make it so on every tree, his pick: “Every tree, both ways (Recommended)” (offered as: any talent joined
 * by a line to one you have can be taken, on all six heroes). So a talent is open once one joined to it by a line is his, the one
 * before it or one after it; where the tree begins (no line before it) is open as before. Off: only the ones before it, as it was.
 */
export const BOTH_WAYS = { on: true };
/** The talents joined to `t` by a line: those before it and those it leads to. */
export function joinedTo(cls: ClassId, t: TalentDef): string[] {
  const after = TREES[cls].talents.filter((q) => q.from.includes(t.id)).map((q) => q.id);
  return BOTH_WAYS.on ? [...t.from, ...after] : [...t.from];
}
/** Whether the way to `t` is open: where the tree begins, or joined to one that is his. */
function wayOpen(cls: ClassId, t: TalentDef, taken: readonly string[]): boolean {
  return !t.from.length || joinedTo(cls, t).some((f) => taken.includes(f));
}
/** (the Warrior's new tree) the talents on a weapon's own path are that weapon's: with the lines both ways, one wielding another may not cross into them. */
const PATH_WEAPON: Readonly<Record<string, string>> = { axe: 'battleaxe', gsword: 'greatsword', hammer: 'warhammer' };
function notHisWeapon(cls: ClassId, t: TalentDef, taken: readonly string[]): boolean {
  const w = PATH_WEAPON[t.path];
  return cls === 'warrior' && WARRIOR_TREE2.on && !!w && t.id !== w && !taken.includes(w);
}

/** (the Warrior's new tree, WARRIOR_TREE2) his three weapons: only one may be his. */
const WEAPON_PICKS: readonly string[] = ['greatsword', 'battleaxe', 'warhammer'];
/** THE WARRIOR'S THREE WEAPONS (WARRIOR_TREE2): which is his, by his tree's first point; the greatsword till one is picked. */
export type WarriorWeapon = 'greatsword' | 'battleaxe' | 'warhammer';
/**
 * The new talents' numbers (the main chat's starting points): Twin Axes' two axes each `share` of one, `fan` radians each side of
 * the aim; Rend's bleed, `share` of the hit again over `secs`; Red Mist's 8% faster for `secs` a kill, up to `most`; Tremors'
 * three shakes `gap` seconds apart, each `share`; Heavy Head's stun; Bulldozer's carry, `ahead` of him, and its stun where he
 * stops; Executioner's double harm under a quarter of life.
 */
export const WARRIOR_TUNE = {
  // (Twin Axes 14 degrees either side of his aim, as the art throws them: art/warrior_up_axe_moves.ts AXE_TWIN_SPREAD)
  twinAxes: { fan: (14 * Math.PI) / 180, share: 0.65 },
  rend: { share: 1 / 3, secs: 3 },
  redMist: { each: 0.08, secs: 4, most: 5 },
  // (Tremors as the art draws them, art/warrior_up_hammer_moves.ts HAMMER_TREMORS: three quakes from the one blow, 0.35 s apart,
  // each 0.6 tiles wider round, at 1, 0.6 and 0.35 of the blow)
  tremors: { n: 3, gap: 0.35, wider: 0.6, shares: [1, 0.6, 0.35] as readonly number[] },
  // (SMASH, his words of 11 Nov 2026, 09:41: “Tap should have a small knockback and high stun buildup/chance”: what it strikes is
  // pushed `knock` tiles back, and dazed `daze` a blow, the daze fading `fade` a second; a full daze stuns it `stun` seconds)
  smash: { knock: 0.4, daze: 0.6, fade: 0.15, stun: 1.0 },
  heavyHead: { secs: 0.5 },
  bulldozer: { ahead: 0.9, stun: 0.8 },
  executioner: { under: 0.25, mult: 2 },
};
export function warriorWeapon(taken: readonly string[]): WarriorWeapon {
  return (WEAPON_PICKS.find((w) => taken.includes(w)) as WarriorWeapon | undefined) ?? 'greatsword';
}
/**
 * His weapon as it is drawn (art/heroes.ts HeroLook.weapon): the war axe, the maul, or null for the great sword (and for every hero
 * but him, and with WARRIOR_TREE2 off).
 */
export function heavyDrawn(cls: ClassId, taken: readonly string[]): 'axe' | 'hammer' | null {
  if (cls !== 'warrior' || !WARRIOR_TREE2.on) return null;
  const w = warriorWeapon(taken);
  return w === 'battleaxe' ? 'axe' : w === 'warhammer' ? 'hammer' : null;
}
/**
 * Each weapon's tap, hold and swipe (game/defs.ts SKILLS): the greatsword's Strike, Whirl and Lunge; the battle axe's Cleave, Axe
 * Throw and Leaping Chop; the warhammer's Smash, Earthquake and Shoulder Charge. His choice of 7 Nov, 21:12, “Each its own
 * (Recommended)”, of the swipe.
 */
export const WARRIOR_KITS: Readonly<Record<WarriorWeapon, readonly [SkillId, SkillId, SkillId]>> = {
  greatsword: ['strike', 'whirl', 'leap'],
  battleaxe: ['cleave', 'axethrow', 'chop'],
  warhammer: ['smash', 'quake', 'charge'],
};
/** The Warrior's three moves by his weapon, with WARRIOR_TREE2 on (null off: the class's own, as before); the greatsword's Whirl is Whirlwind once that talent is his. */
export function warriorKit(taken: readonly string[]): SkillId[] | null {
  if (!WARRIOR_TREE2.on) return null;
  const k: SkillId[] = [...WARRIOR_KITS[warriorWeapon(taken)]];
  if (k[1] === 'whirl' && taken.includes('gswhirlwind')) k[1] = 'whirlwind';
  return k;
}
function otherWeapon(cls: ClassId, id: string, taken: readonly string[]): boolean {
  return cls === 'warrior' && WARRIOR_TREE2.on && WEAPON_PICKS.includes(id) && WEAPON_PICKS.some((w) => w !== id && taken.includes(w));
}
/** (the same) his first point takes his weapon: IRON, the start node's other way, opens once one of the three is his. */
function waitsForWeapon(cls: ClassId, t: TalentDef, taken: readonly string[]): boolean {
  return cls === 'warrior' && WARRIOR_TREE2.on && t.path === 'iron' && !t.from.length && !WEAPON_PICKS.some((w) => taken.includes(w));
}

/** Why a taken talent cannot be undone (nothing else of the tree may hang on it alone), or null if it can. */
export function unlearnProblem(cls: ClassId, taken: readonly string[], id: string): string | null {
  if (!taken.includes(id)) return 'Not taken';
  const rest = taken.filter((t) => t !== id);
  const reach = new Set<string>();
  for (let n = 0; n <= rest.length; n++) {
    for (const t of rest) {
      const def = talentOf(cls, t);
      if (def && wayOpen(cls, def, [...reach]) && !notHisWeapon(cls, def, rest)) reach.add(t);
    }
  }
  return reach.size === rest.length ? null : 'Undo the ones after it first';
}

/** Whether the talent could be taken were there a point to spend (its way is open). */
export function talentOpen(cls: ClassId, taken: readonly string[], id: string): boolean {
  const t = talentOf(cls, id);
  return !!t && !taken.includes(id) && wayOpen(cls, t, taken) && !otherWeapon(cls, id, taken) && !notHisWeapon(cls, t, taken) && !waitsForWeapon(cls, t, taken);
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
/** A talent of class `cls`'s tree, by its id (undefined: none such). */
export function talentById(cls: ClassId, id: string): TalentDef | undefined {
  return TREES[cls]?.talents.find((t) => t.id === id);
}

export function cleanTalents(cls: ClassId, level: number, list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  const out: string[] = [];
  for (const id of list) {
    if (typeof id !== 'string') continue;
    if (takeProblem(cls, level, out, id) === null) out.push(id);
  }
  return out;
}
