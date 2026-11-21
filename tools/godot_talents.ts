// THE GODOT PORT: THE SKILL TREES (game/talents.ts), as the released game has them, with its switches as they stand (TALENTS,
// TALENTS2: the remade talents' new words; SWAP_MOVES, the Mage's and the Ranger's moves to swap; WARRIOR_TREE2, his three
// weapons; the Veteran's tree; BOTH_WAYS, the lines both ways; COMPANIONS off, as it is but on a page built to show them):
//   talents.json   every class's tree: its shape, its paths (name, colour, where the name is written), its talents (each's name,
//                  card words and word as they read now, big or a step, its path, where it sits, the talents before it and every
//                  one joined to it by a line, what it adds to his numbers where that is all it does, a pick of two), the place
//                  the paths begin, the faint pictures behind it, laid square or stretched, the room its shape needs; the points
//                  (one every TALENT_EVERY levels, TALENT_MAX in all); the price of undoing one; the Warrior's weapons and their
//                  three moves; and every word's rune and colours, for the stones that work with a word (ui/talents.ts).
//   npx tsx tools/godot_talents.ts   -> godot/assets/talents.json
import { writeFileSync } from 'node:fs';
import { gameSwitches } from './godot_switches';
import { GLYPH, WORD_COLOR, WORD_GLOW } from '../src/art/icons';
import {
  BOTH_WAYS,
  COMPANIONS,
  SWAP_MOVES,
  TALENTS,
  TALENTS2,
  TALENT_EVERY,
  TALENT_MAX,
  TALENT_TUNE,
  TREES,
  WARRIOR_KITS,
  WARRIOR_TUNE,
  WARRIOR_TREE2,
  joinedTo,
  remadeNow,
  talentName,
  talentText,
  talentWord,
} from '../src/game/talents';
import type { ClassId } from '../src/game/types';
import { VET_TALENTS } from '../src/game/veteran';

gameSwitches();

const CLASSES: ClassId[] = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];
const trees: Record<string, unknown> = {};
for (const cls of CLASSES) {
  const tree = TREES[cls];
  trees[cls] = {
    shape: tree.shape,
    paths: tree.paths.map((p) => ({ id: p.id, name: p.name, color: p.color, label: p.label })),
    talents: tree.talents.map((t) => ({
      id: t.id,
      name: talentName(t),
      text: talentText(t),
      word: talentWord(t) ?? null,
      big: t.big,
      path: t.path,
      at: t.at,
      from: t.from,
      joined: joinedTo(cls, t),
      mods: t.mods && !remadeNow(t.id) ? t.mods : [],
      remade: remadeNow(t.id),
      pick: t.pick ?? null,
      works: t.works ?? null,
    })),
    root: tree.root ?? null,
    figures: tree.figures ?? [],
    square: !!tree.square,
    room: tree.room ?? null,
    draft: !!tree.draft,
  };
}

const words: Record<string, { rows: readonly string[]; color: string; glow: string }> = {};
for (const w of Object.keys(GLYPH)) words[w] = { rows: GLYPH[w as keyof typeof GLYPH], color: WORD_COLOR[w as keyof typeof WORD_COLOR], glow: WORD_GLOW[w as keyof typeof WORD_GLOW] };

writeFileSync(
  'godot/assets/talents.json',
  JSON.stringify({
    switches: { talents: TALENTS.on, talents2: TALENTS2.on, swapMoves: SWAP_MOVES.on, warriorTree2: WARRIOR_TREE2.on, bothWays: BOTH_WAYS.on, companions: COMPANIONS.on },
    every: TALENT_EVERY,
    max: TALENT_MAX,
    unlearnPerLevel: TALENT_TUNE.unlearnPerLevel,
    tune: TALENT_TUNE,
    warriorTune: WARRIOR_TUNE,
    vetTalents: VET_TALENTS,
    weapons: { picks: ['greatsword', 'battleaxe', 'warhammer'], kits: WARRIOR_KITS, paths: { axe: 'battleaxe', gsword: 'greatsword', hammer: 'warhammer' } },
    trees,
    words,
  }),
);
const n = CLASSES.reduce((a, c) => a + TREES[c].talents.length, 0);
console.log(`talents.json: ${CLASSES.length} trees, ${n} talents`);
