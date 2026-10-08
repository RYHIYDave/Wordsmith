// What a dungeon earns: an immortal bot clears dungeons with each class over several seeds, and
// for each dungeon the gold it dropped is counted, and what the pieces it dropped would fetch at
// a vendor's. For pricing what is sold for gold (the wordsmith's words, the gamble).
//   tsx tools/count_gold.ts [dungeons = 4] [seeds = 4]
// Counted at the drop, not at the pocket: the bot does not pick everything up, a player mostly does.
import { botStep, newBot } from '../src/dev/bot';
import { Game } from '../src/game/game';
import { itemValue } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';
import type { Item, WordId } from '../src/game/types';
import { TUNE } from '../src/game/defs';

declare const process: { argv: string[] };
const WANT = Number(process.argv[2] ?? 4);
const SEEDS = [4242, 77, 9001, 5, 123456, 31337].slice(0, Math.max(1, Number(process.argv[3] ?? 4)));

interface Tally { gold: number; sale: number; items: number; words: number }
const by: Tally[][] = Array.from({ length: WANT }, () => []);
for (const cls of CLASS_IDS) {
  for (const seed of SEEDS) {
    const g = new Game(cls, seed);
    const c = emptyControls();
    const bot = newBot(true);
    const dt = 1 / 30;
    let tally: Tally = { gold: 0, sale: 0, items: 0, words: 0 };
    const inner = g as unknown as { addDrop: (kind: string, x: number, y: number, gold: number, item: Item | null, word: WordId | null) => void };
    const real = inner.addDrop.bind(g);
    inner.addDrop = (kind, x, y, gold, item, word) => {
      if (kind === 'item' && item) {
        tally.items++;
        tally.sale += Math.max(1, Math.floor(itemValue(item) * TUNE.sellRate));
      } else if (kind === 'gold') tally.gold += gold;
      else if (kind === 'word') tally.words++;
      real(kind, x, y, gold, item, word);
    };
    let cleared = 0;
    for (let t = 0; t < 1500 * WANT && cleared < WANT; t += dt) {
      g.hero.life = g.hero.d.maxLife;
      botStep(g, c, bot, dt);
      g.update(dt, c);
      g.events.length = 0;
      if (g.cleared > cleared) {
        by[cleared].push(tally);
        cleared = g.cleared;
        tally = { gold: 0, sale: 0, items: 0, words: 0 };
      }
    }
  }
}
const stat = (xs: number[]): string => {
  if (!xs.length) return '-';
  const s = [...xs].sort((a, b) => a - b);
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  return `${Math.round(mean)} (${s[0]} to ${s[s.length - 1]})`;
};
console.log('dungeon | runs | gold dropped | pieces dropped | what they sell for | gold + sales | words');
by.forEach((ts, i) => {
  console.log(`${String(i + 1).padStart(7)} | ${String(ts.length).padStart(4)} | ${stat(ts.map((t) => t.gold))} | ${stat(ts.map((t) => t.items))} | ${stat(ts.map((t) => t.sale))} | ${stat(ts.map((t) => t.gold + t.sale))} | ${stat(ts.map((t) => t.words))}`);
});
