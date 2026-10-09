// THE SKILL TREES (not in the game: a mock-up behind TALENTS, off, until he has seen pictures and
// said yes).
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
//   WARRIOR   two swords crossed: RAGE and IRON, each from its pommel on the left through its guard
//             (with a quillon each side) to the crossing in the middle, which is both swords', and
//             on to its tip; past the crossing either sword's tip may be reached.

import type { ClassId, StatKey, WordId } from './types';

/** THE SWITCH: off, there are no talents and no page for them (the game as it was). */
export const TALENTS = { on: false };

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
}

export interface TalentPath {
  id: string;
  name: string;
  color: string;
  /** Where its name is written: beside which of its talents, and on which side. */
  label: { node: string; side: 'left' | 'right' | 'above' | 'below' };
}

/** A faint picture behind a tree, so that its shape reads: a patch filled between talents, or a sword drawn through them. */
export type TalentFigure =
  | { kind: 'fill'; path: string; ids: readonly string[] }
  | { kind: 'sword'; path: string; pommel: string; guard: string; tip: string; quillons: readonly [string, string] };

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
    { id: 'kindling', name: 'Kindling', big: false, path: 'fire', at: [1, 0], from: [], text: 'Fire damage +25%.', mods: [{ stat: 'firePct', value: 25 }] },
    { id: 'searing', name: 'Searing', big: false, path: 'fire', at: [2, 0], from: ['kindling'], text: 'Burning lasts a second longer and hurts half as much again.' },
    { id: 'flamewarp', name: 'Flame Warp', big: true, path: 'fire', at: [3, 0], from: ['searing'], text: 'Warp leaves a trail of fire behind you.' },
    { id: 'fuel', name: 'Fuel', big: false, path: 'fire', at: [4, 0], from: ['flamewarp'], text: 'Flame in front explodes a third wider.', word: 'fire' },
    { id: 'inferno', name: 'Inferno', big: true, path: 'fire', at: [5, 0], from: ['fuel'], text: 'Enemies that die burning explode in flame.' },
    { id: 'charged', name: 'Charged', big: false, path: 'lightning', at: [1, 2], from: [], text: 'Lightning damage +25%.', mods: [{ stat: 'lightPct', value: 25 }] },
    { id: 'forking', name: 'Forking', big: false, path: 'lightning', at: [2, 2], from: ['charged'], text: 'Lightning arcs to two more enemies.', word: 'lightning' },
    { id: 'stormwarp', name: 'Storm Warp', big: true, path: 'lightning', at: [3, 2], from: ['forking'], text: 'Where you warp to, lightning strikes up to four enemies.' },
    { id: 'overload', name: 'Overload', big: false, path: 'lightning', at: [4, 2], from: ['stormwarp'], text: 'Shocked enemies take 15% more damage from everything.' },
    { id: 'stormcaller', name: 'Stormcaller', big: true, path: 'lightning', at: [5, 2], from: ['overload'], text: 'Every two seconds, lightning strikes an enemy near you.' },
    { id: 'bittercold', name: 'Bitter Cold', big: false, path: 'frost', at: [1, 4], from: [], text: 'Frost damage +25%.', mods: [{ stat: 'frostPct', value: 25 }] },
    { id: 'deepfreeze', name: 'Deep Freeze', big: false, path: 'frost', at: [2, 4], from: ['bittercold'], text: 'Enemies freeze sooner and stay frozen half as long again.' },
    { id: 'frostwarp', name: 'Frost Warp', big: true, path: 'frost', at: [3, 4], from: ['deepfreeze'], text: 'Where you warp from, a burst of cold freezes the enemies near.' },
    { id: 'rime', name: 'Rime', big: false, path: 'frost', at: [4, 4], from: ['frostwarp'], text: 'The ice that Frost leaves behind is twice as big.', word: 'frost' },
    { id: 'shatter', name: 'Shatter', big: true, path: 'frost', at: [5, 4], from: ['rime'], text: 'Frozen enemies take double damage; one that dies bursts, chilling those near.' },
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
    { id: 'fleet', name: 'Fleet', big: false, path: 'wind', at: [0, 0.5], from: [], text: 'Move 10% faster.', mods: [{ stat: 'moveSpeed', value: 10 }] },
    { id: 'windrunner', name: 'Windrunner', big: false, path: 'wind', at: [0.9, 1.25], from: ['fleet'], text: 'After a roll, run 30% faster for two seconds.' },
    { id: 'keeneye', name: 'Keen Eye', big: false, path: 'eye', at: [0, 3.5], from: [], text: 'Critical chance +8%.', mods: [{ stat: 'critChance', value: 8 }] },
    { id: 'venom', name: 'Venom', big: false, path: 'eye', at: [0.9, 2.75], from: ['keeneye'], text: 'Poison stacks twice as high.', word: 'poison' },
    // the shaft
    { id: 'quickdraw', name: 'Quick Draw', big: false, path: 'shaft', at: [1.9, 2], from: ['windrunner', 'venom', 'steadyaim'], text: 'Attacks 10% faster.', mods: [{ stat: 'atkSpeed', value: 10 }] },
    { id: 'longshot', name: 'Long Shot', big: false, path: 'shaft', at: [3, 2], from: ['quickdraw'], text: 'Arrows fly a third further and faster.' },
    { id: 'lightstep', name: 'Light Step', big: true, path: 'shaft', at: [4.1, 2], from: ['longshot'], text: 'Trap holds three charges, and you roll a third further.' },
    { id: 'huntersmark', name: "Hunter's Mark", big: false, path: 'shaft', at: [5.2, 2], from: ['lightstep'], text: "Precise's mark makes a triple critical.", word: 'precise' },
    // the head: two barbs and the middle, meeting at the point
    { id: 'widetraps', name: 'Wide Traps', big: false, path: 'traps', at: [6, 0.5], from: ['huntersmark'], text: 'Traps burst a third wider.' },
    { id: 'minefield', name: 'Minefield', big: true, path: 'traps', at: [6.9, 1.25], from: ['widetraps'], text: 'Each roll lays three traps in a fan.' },
    { id: 'splitshot', name: 'Split Shot', big: false, path: 'arrows', at: [6, 3.5], from: ['huntersmark'], text: 'Every third arrow splits into three.' },
    { id: 'hail', name: 'Hail', big: true, path: 'arrows', at: [6.9, 2.75], from: ['splitshot'], text: 'Volley rains twice as long, and half again as wide.' },
    { id: 'piercing', name: 'Piercing', big: false, path: 'shaft', at: [6.45, 2], from: ['huntersmark'], text: 'Arrows pass through one more enemy.' },
    { id: 'farsight', name: 'Far Sight', big: true, path: 'shaft', at: [7.8, 2], from: ['minefield', 'hail', 'piercing'], text: 'The further the enemy, the harder you hit: up to +50% at eight tiles.' },
    // the nock, between the feathers: a third way onto the shaft
    { id: 'steadyaim', name: 'Steady Aim', big: false, path: 'shaft', at: [0.15, 2], from: ['fleet', 'keeneye'], text: 'Standing still, your attacks hit 15% harder.' },
  ],
  figures: [
    { kind: 'fill', path: 'wind', ids: ['fleet', 'windrunner', 'quickdraw', 'steadyaim'] },
    { kind: 'fill', path: 'eye', ids: ['keeneye', 'venom', 'quickdraw', 'steadyaim'] },
    { kind: 'fill', path: 'shaft', ids: ['huntersmark', 'widetraps', 'minefield', 'farsight', 'hail', 'splitshot'] },
  ],
};

// ---- the warrior: two swords crossed --------------------------------------------------------------
const RAGE = '#ff6a50';
const IRON = '#a8c0d8';
const CROSS = '#ac8753';

const WARRIOR: TalentTree = {
  cls: 'warrior',
  shape: 'two swords crossed',
  paths: [
    { id: 'rage', name: 'RAGE', color: RAGE, label: { node: 'bloodlust', side: 'right' } },
    { id: 'iron', name: 'IRON', color: IRON, label: { node: 'thickskin', side: 'right' } },
    { id: 'cross', name: '', color: CROSS, label: { node: 'earthshaker', side: 'above' } },
  ],
  talents: [
    // RAGE: from its pommel low on the left up to its tip high on the right
    { id: 'bloodlust', name: 'Bloodlust', big: false, path: 'rage', at: [0, 4], from: [], text: 'All damage +15%.', mods: [{ stat: 'dmgPct', value: 15 }] },
    { id: 'fury', name: 'Fury', big: true, path: 'rage', at: [1, 3.33], from: ['bloodlust'], text: 'Power and Frenzied stack to eight, not five.', word: 'frenzied' },
    { id: 'cleave', name: 'Cleave', big: false, path: 'rage', at: [1.55, 4.15], from: ['fury'], text: 'A melee hit splashes 30% of itself on the enemies beside.' },
    { id: 'momentum', name: 'Momentum', big: false, path: 'rage', at: [0.45, 2.5], from: ['fury'], text: 'Each kill: run 25% faster for a second.' },
    { id: 'battlerush', name: 'Battle Rush', big: false, path: 'rage', at: [2, 2.67], from: ['fury'], text: 'Leap is ready again 30% sooner.' },
    { id: 'wrath', name: 'Wrath', big: false, path: 'rage', at: [4.5, 1], from: ['earthshaker'], text: 'Elites and bosses take 25% more from you.' },
    { id: 'berserk', name: 'Berserk', big: true, path: 'rage', at: [6, 0], from: ['wrath'], text: 'Below half your life, you attack 30% faster and hit 30% harder.' },
    // IRON: from its pommel high on the left down to its tip low on the right
    { id: 'thickskin', name: 'Thick Skin', big: false, path: 'iron', at: [0, 0], from: [], text: 'Life +15%.' },
    { id: 'shieldwall', name: 'Shieldwall', big: true, path: 'iron', at: [1, 0.67], from: ['thickskin'], text: "Guarding's shield is twice as strong.", word: 'guarding' },
    { id: 'resolute', name: 'Resolute', big: false, path: 'iron', at: [1.55, -0.15], from: ['shieldwall'], text: 'Fire, frost and lightning resistance +15%.', mods: [{ stat: 'fireRes', value: 15 }, { stat: 'frostRes', value: 15 }, { stat: 'lightRes', value: 15 }] },
    { id: 'secondwind', name: 'Second Wind', big: false, path: 'iron', at: [0.45, 1.5], from: ['shieldwall'], text: 'Flasks heal 30% more.' },
    { id: 'bulwark', name: 'Bulwark', big: false, path: 'iron', at: [2, 1.33], from: ['shieldwall'], text: 'You take 10% less damage.' },
    { id: 'thorns', name: 'Thorns', big: false, path: 'iron', at: [4.5, 3], from: ['earthshaker'], text: 'Enemies that strike you up close take 30% of the blow back.' },
    { id: 'unbreakable', name: 'Unbreakable', big: true, path: 'iron', at: [6, 4], from: ['thorns'], text: 'Once a dungeon, a killing blow leaves you at 1 life, shielded for three seconds.' },
    // the crossing: both swords'
    { id: 'earthshaker', name: 'Earthshaker', big: true, path: 'cross', at: [3, 2], from: ['battlerush', 'bulwark'], text: 'Leap lands with a quake that stuns everything near for a second.' },
  ],
  figures: [
    { kind: 'sword', path: 'rage', pommel: 'bloodlust', guard: 'fury', tip: 'berserk', quillons: ['cleave', 'momentum'] },
    { kind: 'sword', path: 'iron', pommel: 'thickskin', guard: 'shieldwall', tip: 'unbreakable', quillons: ['resolute', 'secondwind'] },
  ],
};

export const TREES: Record<ClassId, TalentTree> = { warrior: WARRIOR, ranger: RANGER, mage: MAGE };

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
    if (t?.mods) out.push(...t.mods);
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
