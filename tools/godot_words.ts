// THE GODOT PORT: THE WORDS (the cloud chat, 15 Nov 2026; his pick that day, asked what to build next: “The words (Recommended)”).
// What godot/scripts/words.gd needs of the game's own tables, so that no number of them is copied by hand:
//   npx tsx tools/godot_words.ts          -> godot/assets/words/words.json
//   npx tsx tools/godot_words.ts check    -> also godot/assets/words/check.json: what the game's own resolveSkill makes of the
//                                            Warrior's three moves with every word and pair of words a hero of floors 1 to 5 can
//                                            set in them, for a spread of attributes (the Godot side's check reads it: every
//                                            number and every line of text must come out the same).
// THE WORDS OF FLOORS 1 TO 5: the prison's six (types.ts PRISON_WORD_IDS: power, poison, frost, fire, lightning, swift) and
// Heavy, the armourer's reward to the Warrior (game/quests15.ts FURNACE_WORD). The others are found from floor 6.
import { mkdirSync, writeFileSync } from 'node:fs';
import { gameSwitches } from './godot_switches';
import { ARC_CHAIN, ATTR_GIVES, ATTR_SPLIT, CLASSES, FIRST_WORD, HEAVY, MOVE_OPENS, SKILLS, SLOT_OPENS, TUNE, WORDS, skillsFor } from '../src/game/defs';
import { MANA_AS_CDR } from '../src/game/items';
import { FURNACE_WORD, MELDSTONE_WORDS } from '../src/game/quests15';
import { resolveSkill, socketProblem } from '../src/game/words';
import { PRISON_WORD_IDS } from '../src/game/types';
import type { Derived } from '../src/game/state';
import type { WordId } from '../src/game/types';

gameSwitches();
const OUT = 'godot/assets/words';
mkdirSync(OUT, { recursive: true });

const OURS: WordId[] = [...PRISON_WORD_IDS, FURNACE_WORD.warrior];
const moves = skillsFor('warrior', 'greatsword');
const words = Object.fromEntries(OURS.map((w) => [w, WORDS[w]]));
const skills = Object.fromEntries(moves.map((id) => [id, SKILLS[id]]));
writeFileSync(`${OUT}/words.json`, JSON.stringify({
  // (the words a Warrior can come by on floors 1 to 5, in the game's order; each as defs.ts WORDS has it)
  ids: OURS,
  words,
  // (his three moves as defs.ts SKILLS has them: the quick attack, the slow one, the evasive one; and the attribute each grows
  // with: the Warrior's own, his Strength)
  moves,
  skills,
  grows: CLASSES.warrior.primary,
  // (the numbers the words' rules read)
  heavy: HEAVY,
  poison: { time: TUNE.poisonTime, stacks: TUNE.poisonStacks },
  arcChain: ARC_CHAIN,
  primaryDmg: ATTR_GIVES.primaryDmg,
  intCdr: ATTR_GIVES.intCdr,
  manaAsCdr: MANA_AS_CDR,
  byWeapon: ATTR_SPLIT.on ? ATTR_SPLIT.byWeapon.filter((w) => OURS.includes(w)) : [],
  // (when a move opens, and when each of its slots does: defs.ts MOVE_OPENS, SLOT_OPENS as the first levels set them)
  moveOpens: MOVE_OPENS,
  slotOpens: SLOT_OPENS,
  // (how words are come by: the wordsmith's first word, the armourer's reward, the two the Meldstone brings)
  first: FIRST_WORD.warrior,
  furnace: FURNACE_WORD.warrior,
  meldstone: MELDSTONE_WORDS,
}, null, 1));
console.log(`words: ${OURS.join(', ')}; moves ${moves.join(', ')}`);

if (process.argv[2] === 'check') {
  // (every loadout of up to two a side that the sockets allow, of the words above)
  const sides: (WordId | null)[][] = [[null]];
  for (const a of OURS) sides.push([a]);
  for (const a of OURS) for (const b of OURS) if (a < b && socketProblem([a, null], b) === null) sides.push([a, b]);
  const heroes: Pick<Derived, 'str' | 'dex' | 'int' | 'area' | 'aps' | 'cdr'>[] = [
    { str: 14, dex: 8, int: 6, area: 1, aps: 1.092, cdr: 0.015 },
    { str: 37, dex: 23, int: 31, area: 1.15, aps: 1.6, cdr: 0.2 },
    { str: 80, dex: 11, int: 77, area: 1, aps: 1.31, cdr: 0.6 },
    { str: 139, dex: 64, int: 120, area: 1.3, aps: 2.05, cdr: 0 },
  ];
  const rows: unknown[] = [];
  for (const id of moves) {
    for (const d of heroes) {
      for (const front of sides) for (const behind of sides) {
        // (the whole grid for the first hero; for the others every single word against every single word, and a sample of pairs)
        if (d !== heroes[0] && front.length + behind.length > 2 && (rows.length % 7) !== 0) continue;
        const r = resolveSkill(SKILLS[id], front, behind, 'warrior', d as Derived, 'cooldown');
        rows.push({ id, d, front, behind, r: { name: r.name, element: r.element, dmgMult: r.dmgMult, size: r.size, rate: r.rate, cooldown: r.cooldown, splash: r.splash, splashDmg: r.splashDmg, pierce: r.pierce, ignite: r.ignite, chill: r.chill, arcs: r.arcs, arcDmg: r.arcDmg, poison: r.poison, stun: r.stun, might: r.might, haste: r.haste, zone: r.zone, cloud: r.cloud, cracks: r.cracks, lines: r.lines } });
      }
    }
  }
  // (and what a socket refuses: socketProblem, for every word into every side of up to two)
  const refused: unknown[] = [];
  for (const g of sides) for (const w of OURS) for (const most of [1, 2]) refused.push({ group: g.length === 1 ? [g[0], null] : g, word: w, most, why: socketProblem(g.length === 1 ? [g[0], null] : g, w, most) });
  writeFileSync(`${OUT}/check.json`, JSON.stringify({ rows, refused }));
  console.log(`check: ${rows.length} moves resolved, ${refused.length} sockets asked`);
}
