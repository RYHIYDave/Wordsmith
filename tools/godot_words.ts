// THE GODOT PORT: THE WORDS (the cloud chat, 15 Nov 2026; his pick that day, asked what to build next: “The words (Recommended)”).
// What godot/scripts/words.gd needs of the game's own tables, so that no number of them is copied by hand:
//   npx tsx tools/godot_words.ts          -> godot/assets/words/words.json
//   npx tsx tools/godot_words.ts check    -> also godot/assets/words/check.json: what the game's own resolveSkill makes of the
//                                            Warrior's three moves with every word and pair of words a hero of floors 1 to 10 can
//                                            set in them, for a spread of attributes (the Godot side's check reads it: every
//                                            number and every line of text must come out the same).
// THE WORDS OF FLOORS 1 TO 5: the prison's six (types.ts PRISON_WORD_IDS: power, poison, frost, fire, lightning, swift) and
// Heavy, the armourer's reward to the Warrior (game/quests15.ts FURNACE_WORD).
// THE WORDS OF FLOORS 6 TO 10 (the words' port of the descent, 15 Nov 2026): the rest of what may be found there (types.ts wordsAt:
// Twin, Leech, Volatile, Precise, Frenzied, Guarding, Lasting, Fleeting, Vast), after them in the game's order (types.ts WORD_IDS).
// The city's words and the last words are found only from floor 11 and 16; the melded and ranked words are made, never found.
import { mkdirSync, writeFileSync } from 'node:fs';
import { gameSwitches } from './godot_switches';
import { readFileSync } from 'node:fs';
import { ARC_CHAIN, ATTR_GIVES, ATTR_SPLIT, CLASSES, FIRST_WORD, FLEETING, FRENZY, GUARD, HEAVY, LASTING, LEECH, MOVE_OPENS, PRECISE, SKILLS, SLOT_OPENS, TUNE, VAST, WORDS, skillsFor, wordsAt } from '../src/game/defs';
import { MANA_AS_CDR } from '../src/game/items';
import { FURNACE_WORD, MELDSTONE_WORDS } from '../src/game/quests15';
import { resolveSkill, socketProblem } from '../src/game/words';
import { PRISON_WORD_IDS, WORD_IDS } from '../src/game/types';
import { NEW_GLYPH, NEW_RAMP } from '../src/render/words3';
import { W10_RAMP } from '../src/render/words10';
import type { Derived } from '../src/game/state';
import type { WordId } from '../src/game/types';

gameSwitches();
const OUT = 'godot/assets/words';
mkdirSync(OUT, { recursive: true });

const PRISON: WordId[] = [...PRISON_WORD_IDS, FURNACE_WORD.warrior];
// (floors 6 to 10's: what may be found on any of them, not already among the prison's, in the game's order)
const WILDS: WordId[] = WORD_IDS.filter((w) => !PRISON.includes(w) && [6, 7, 8, 9, 10].some((d) => wordsAt(d).includes(w)));
const OURS: WordId[] = [...PRISON, ...WILDS];
// (game.ts's own seconds for "of Echoes", kept in it unexported: read out of its source, not copied by hand)
const GAME_TS = readFileSync('src/game/game.ts', 'utf8');
const gameConst = (name: string): number => {
  const m = new RegExp(`const ${name} = ([0-9.]+);`).exec(GAME_TS);
  if (!m) throw new Error(`game.ts has no ${name}`);
  return Number(m[1]);
};
// (the first colour a function of the game's renderer writes straight into what it draws)
const hexIn = (file: string, fn: string): string => {
  const text = readFileSync(file, 'utf8');
  const at = text.search(new RegExp(`^(?:export )?function ${fn}\\(`, 'm'));
  const m = at < 0 ? null : /'(#[0-9a-fA-F]{6})'/.exec(text.slice(at, text.indexOf('\n}\n', at)));
  if (!m) throw new Error(`no colour in ${fn}`);
  return m[1];
};
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
  // (floors 6 to 10's words' numbers: defs.ts PRECISE, FRENZY, GUARD, LASTING, FLEETING, VAST, LEECH (its cap a second, null for
  // none); "of Echoes"' wait and a held move's echoed turns, game.ts ECHO_DELAY, ECHO_BITES; the first floor they are found on)
  precise: PRECISE,
  frenzy: FRENZY,
  guard: GUARD,
  lasting: LASTING,
  fleeting: FLEETING,
  vast: VAST,
  leechCap: Number.isFinite(LEECH.cap) ? LEECH.cap : null,
  echo: { delay: gameConst('ECHO_DELAY'), bites: gameConst('ECHO_BITES') },
  wilds: WILDS,
  // (THEIR LOOKS' COLOURS, for godot/scripts/fx_words610.gd: Precise's, Frenzied's and Guarding's ramps, darkest to brightest,
  // and Guarding's shield as the ward draws it (render/words3.ts NEW_RAMP, NEW_GLYPH); Lasting's, Fleeting's and Vast's
  // (render/words10.ts W10_RAMP); and the dark the ward's shields and Precise's sight are edged in, read out of the functions
  // that draw them)
  looks: {
    ramp: { precise: NEW_RAMP.precise, frenzied: NEW_RAMP.frenzied, guarding: NEW_RAMP.guarding, ...W10_RAMP },
    guardGlyph: NEW_GLYPH.guarding,
    wardDark: hexIn('src/render/words3.ts', 'drawWard'),
    sightDark: hexIn('src/render/words3.ts', 'drawSight'),
  },
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
  // (with floors 6 to 10's words the whole grid of pairs is too many to keep: every side of one word or none against every other
  // for every hero; a pair against none or one word for the first, every third of those for the others; pair against pair a
  // sample)
  const keep = (d: unknown, front: (WordId | null)[], behind: (WordId | null)[], n: number): boolean => {
    const many = front.length + behind.length;
    if (many <= 2) return true;
    if (many === 3) return d === heroes[0] || n % 3 === 0;
    return n % (d === heroes[0] ? 11 : 37) === 0;
  };
  const heroes: Pick<Derived, 'str' | 'dex' | 'int' | 'area' | 'aps' | 'cdr'>[] = [
    { str: 14, dex: 8, int: 6, area: 1, aps: 1.092, cdr: 0.015 },
    { str: 37, dex: 23, int: 31, area: 1.15, aps: 1.6, cdr: 0.2 },
    { str: 80, dex: 11, int: 77, area: 1, aps: 1.31, cdr: 0.6 },
    { str: 139, dex: 64, int: 120, area: 1.3, aps: 2.05, cdr: 0 },
  ];
  const rows: unknown[] = [];
  for (const id of moves) {
    for (const d of heroes) {
      let n = 0;
      for (const front of sides) for (const behind of sides) {
        if (!keep(d, front, behind, n++)) continue;
        const r = resolveSkill(SKILLS[id], front, behind, 'warrior', d as Derived, 'cooldown');
        rows.push({ id, d, front, behind, r: { name: r.name, element: r.element, dmgMult: r.dmgMult, size: r.size, rate: r.rate, cooldown: r.cooldown, splash: r.splash, splashDmg: r.splashDmg, pierce: r.pierce, ignite: r.ignite, chill: r.chill, arcs: r.arcs, arcDmg: r.arcDmg, poison: r.poison, stun: r.stun, might: r.might, haste: r.haste, zone: r.zone, cloud: r.cloud, cracks: r.cracks, lines: r.lines,
          // (floors 6 to 10's words)
          count: r.count, countDmg: r.countDmg, echo: r.echo, leech: r.leech, orbChance: r.orbChance, volatile: r.volatile, rune: r.rune, precise: r.precise, mark: r.mark,
          frenzy: r.frenzy, frenzyFeed: r.frenzyFeed, shield: r.shield, ward: r.ward, last: r.last, pace: r.pace, boost: r.boost, vast: r.vast, wide: r.wide } });
      }
    }
  }
  // (and what a socket refuses: socketProblem, for every word into every side of up to two)
  const refused: unknown[] = [];
  for (const g of sides) for (const w of OURS) for (const most of [1, 2]) refused.push({ group: g.length === 1 ? [g[0], null] : g, word: w, most, why: socketProblem(g.length === 1 ? [g[0], null] : g, w, most) });
  writeFileSync(`${OUT}/check.json`, JSON.stringify({ rows, refused }));
  console.log(`check: ${rows.length} moves resolved, ${refused.length} sockets asked`);
}
