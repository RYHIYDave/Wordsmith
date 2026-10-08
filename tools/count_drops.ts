// How much loot a whole dungeon drops: an immortal bot clears dungeons with each class and every
// thing that falls is counted.
//   tsx tools/count_drops.ts [dungeons per class = 3]
// Prints, for each dungeon cleared: items dropped (and how many of them rare), gold piles, words.
import { botStep, newBot } from '../src/dev/bot';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';
import type { Item, WordId } from '../src/game/types';

declare const process: { argv: string[] };
const want = Number(process.argv[2] ?? 3);

interface Tally {
  items: number;
  rare: number;
  gold: number;
  words: number;
  orbs: number;
}
const all: Tally[] = [];
for (const cls of CLASS_IDS) {
  const g = new Game(cls, 4242);
  const c = emptyControls();
  const bot = newBot(true);
  const dt = 1 / 30;
  let tally: Tally = { items: 0, rare: 0, gold: 0, words: 0, orbs: 0 };
  // every drop goes through addDrop: count there
  const inner = g as unknown as { addDrop: (kind: string, x: number, y: number, gold: number, item: Item | null, word: WordId | null) => void };
  const real = inner.addDrop.bind(g);
  inner.addDrop = (kind, x, y, gold, item, word) => {
    if (kind === 'item' && item) {
      tally.items++;
      if (item.rarity >= 2) tally.rare++;
    } else if (kind === 'gold') tally.gold++;
    else if (kind === 'word') tally.words++;
    else if (kind === 'orb') tally.orbs++;
    real(kind, x, y, gold, item, word);
  };
  let cleared = 0;
  for (let t = 0; t < 4000 && cleared < want; t += dt) {
    g.hero.life = g.hero.d.maxLife;
    botStep(g, c, bot, dt);
    g.update(dt, c);
    g.events.length = 0;
    if (g.cleared > cleared) {
      cleared = g.cleared;
      console.log(`${cls.padEnd(8)} dungeon ${cleared}: ${String(tally.items).padStart(3)} items (${tally.rare} rare), ${String(tally.gold).padStart(3)} gold piles, ${tally.words} words, ${tally.orbs} life orbs`);
      all.push(tally);
      tally = { items: 0, rare: 0, gold: 0, words: 0, orbs: 0 };
    }
  }
}
const mean = (f: (t: Tally) => number): string => (all.reduce((a, t) => a + f(t), 0) / Math.max(1, all.length)).toFixed(1);
console.log(`\na dungeon, on average over ${all.length}: ${mean((t) => t.items)} items (${mean((t) => t.rare)} rare), ${mean((t) => t.gold)} gold piles, ${mean((t) => t.words)} words, ${mean((t) => t.orbs)} life orbs`);
