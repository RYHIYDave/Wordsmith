// How fast, and at what cost in life, a bot clears its first three dungeons with a given class and
// weapon. Since Version 12 any character can use any weapon and both attacks come with it, so
// "is the staff better than the bow, whoever holds it?" is a question with a number for an answer.
//
//   tsx tools/pace_weapons.ts [seeds = 8] [dungeons = 3] [only = every pair]
//
// `only`: a word that the pair's name must hold ("bow", "ranger"), to measure a few of them while
// a number is being tried. The whole table is the thing to publish.
//
// It prints two tables: WITHOUT WORDS (the attacks themselves; a new character's first half
// dungeon) and WITH WORDS (the bot sets each word it finds in the first free place). Each line is
// one class with one weapon over several seeds: the MEDIAN number of minutes, the mean, the lives
// it would have lost (the bot never dies: its life is made whole every step and what it lost is
// counted), and every seed's minutes.
//
// READ IT LIKE THIS, learnt the hard way with Version 12.1:
// - ONE SEED IS WORTH NOTHING. Which words fall, and where a crude bot puts them, moves a run by
//   a quarter: Version 12's table was one seed each and called the wand the equal of the others
//   when over eight seeds it was the slowest in every hand.
// - 60.0 means the bot ran out of time (20 minutes a dungeon): something it could not kill faster
//   than it mended. That is why the median is the number to read, not the mean.
// - The bot is a crude player. It holds a held attack for as long as anything is in reach, never
//   steps out of a fight, and puts every level into the class's own attribute. Differences under
//   a minute are none.
import { botStep, newBot } from '../src/dev/bot';
import { Game } from '../src/game/game';
import { plainWeapon } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import type { ClassId, WeaponKind } from '../src/game/types';

declare const process: { argv: string[] };
const SEEDS = [4242, 77, 9001, 5, 123456, 31337, 808, 2718, 1001, 64, 99999, 20261004].slice(0, Math.max(1, Number(process.argv[2] ?? 8)));
const WANT = Number(process.argv[3] ?? 3);
const ONLY = process.argv[4] ?? '';
const ALL: [ClassId, WeaponKind][] = [
  ['warrior', 'greatsword'], ['ranger', 'bow'], ['mage', 'staff'],
  ['warrior', 'sword'], ['mage', 'wand'],
  ['warrior', 'bow'], ['warrior', 'staff'], ['warrior', 'wand'],
  ['ranger', 'greatsword'], ['ranger', 'staff'], ['ranger', 'wand'],
  ['mage', 'greatsword'], ['mage', 'bow'],
];
const COMBOS = ALL.filter(([cls, weapon]) => `${cls} + ${weapon}`.includes(ONLY));

/** One bot, one seed: minutes to clear `WANT` dungeons, and lives lost on the way. */
function run(cls: ClassId, weapon: WeaponKind, seed: number, words: boolean): [number, number] {
  const g = new Game(cls, seed);
  if (g.weapon() !== weapon) {
    g.hero.gear.mainhand = plainWeapon(weapon, 1);
    g.refresh();
  }
  const c = emptyControls();
  const bot = newBot(true);
  const dt = 1 / 30;
  let lost = 0;
  let t = 0;
  for (; t < 1200 * WANT && g.cleared < WANT; t += dt) {
    lost += (g.hero.d.maxLife - g.hero.life) / g.hero.d.maxLife;
    g.hero.life = g.hero.d.maxLife;
    if (!words) for (const k of Object.keys(g.hero.words)) (g.hero.words as Record<string, number>)[k] = 0;
    botStep(g, c, bot, dt);
    g.update(dt, c);
    g.events.length = 0;
  }
  return [t / 60, lost];
}

const median = (v: number[]): number => {
  const s = [...v].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const mean = (v: number[]): number => v.reduce((a, b) => a + b, 0) / v.length;

for (const words of [false, true]) {
  console.log(`\n${words ? 'WITH WORDS' : 'WITHOUT WORDS'}: ${WANT} dungeons, ${SEEDS.length} seeds`);
  console.log(`${'who, with what'.padEnd(22)} median   mean  lives   each seed`);
  for (const [cls, weapon] of COMBOS) {
    const out = SEEDS.map((seed) => run(cls, weapon, seed, words));
    const mins = out.map((o) => o[0]);
    console.log(`${`${cls} + ${weapon}`.padEnd(22)} ${median(mins).toFixed(1).padStart(6)} ${mean(mins).toFixed(1).padStart(6)} ${median(out.map((o) => o[1])).toFixed(1).padStart(6)}   ${mins.map((m) => m.toFixed(1)).join(' ')}`);
  }
}
