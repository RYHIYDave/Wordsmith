// UNIQUE ITEMS: HOW OFTEN ONE IS SEEN, at the numbers of game/uniques.ts UNIQUE_DROPS. Real floors are laid, everything on each is
// killed and every chest opened, and the pieces of gear that drop are counted by what dropped them; from those counts, the chance
// of a pool unique on the floor, and with the boss's own, over a run of twenty floors. Nothing is rolled for a unique here: the
// chances are added up, so the answer is the average, not one lucky or unlucky run.
//   run: tsx tools/unique_odds.ts [seeds]
import { Game } from '../src/game/game';
import { TUNE } from '../src/game/defs';
import type { Monster } from '../src/game/state';
import type { Item } from '../src/game/types';
import { UNIQUE_DROPS, poolChance, UNIQUES } from '../src/game/uniques';
import { lastFloor } from '../src/game/act1';
import { useAllOfIt } from '../src/game/all_of_it';

const seeds = Number(process.argv[2] ?? 3);
type In = { rollGear: (q?: number) => Item; enterDungeon: () => void; updateProps: (c: unknown) => void; power: number };
UNIQUES.on = true;
// (the floors the game itself has: main.ts puts the High City, floors 16 to 20, on as it starts; a tool does not start the game)
useAllOfIt(true);
const rows: string[] = [];
/** Pieces dropped, by what dropped them (0 an ordinary monster, 1 an elite or a chest along the way, 2 and up a hoard), and how many came out rare. */
const by = [0, 0, 0];
let rares = 0;
let run = 0;
let runBoss = 0;
const floors = Math.min(20, lastFloor());
for (let depth = 1; depth <= floors; depth++) {
  let pieces = 0;
  let chance = 0;
  for (let s = 1; s <= seeds; s++) {
    const g = new Game('warrior', 1000 + s * 77 + depth);
    const a = g as unknown as In;
    g.depth = depth;
    g.hero.level = 30;
    try {
      a.enterDungeon();
    } catch (e) {
      console.error(`floor ${depth}: not laid here (${(e as Error).message})`);
      continue;
    }
    const roll = a.rollGear.bind(g);
    a.rollGear = (q = 0): Item => {
      pieces++;
      by[Math.min(2, q)]++;
      chance += poolChance(q, 0, a.power);
      // (the piece itself as ever, with no unique in its place: the count is of what would have been asked)
      UNIQUES.on = false;
      const it = roll(q);
      UNIQUES.on = true;
      if (it.rarity === 2) rares++;
      return it;
    };
    for (const m of [...g.monsters] as Monster[]) {
      if (m.dead) continue;
      try {
        g.kill(m);
      } catch {
        /* a boss whose death wants its own stage: its hoard is counted below by rule */
      }
    }
    // every chest opened where it stands
    for (const p of g.level.props) {
      if (p.kind !== 'chest' || p.state !== 0) continue;
      g.hero.x = p.x;
      g.hero.y = p.y + 0.6;
      try {
        a.updateProps({ interact: false });
      } catch {
        /* none */
      }
    }
  }
  pieces /= seeds;
  chance /= seeds;
  run += chance;
  runBoss += UNIQUE_DROPS.boss;
  rows.push(`floor ${String(depth).padStart(2)}: ${pieces.toFixed(1).padStart(6)} pieces of gear drop; a pool unique among them ${(chance * 100).toFixed(1).padStart(5)}% of the time`);
}
console.log(rows.join('\n'));
console.log(`\nOVER FLOORS 1 TO ${floors}, no magic find: ${run.toFixed(2)} pool uniques and ${runBoss.toFixed(2)} of the bosses' own: about ${(run + runBoss).toFixed(1)} uniques a run.`);
console.log(`Of the pieces: ${(by[0] / seeds).toFixed(0)} from ordinary monsters, ${(by[1] / seeds).toFixed(0)} from elites and chests along the way, ${(by[2] / seeds).toFixed(0)} from hoards (bosses, guardians, vaults); ${(rares / seeds).toFixed(0)} of them rare.`);
console.log(`The stranger: one throw in ${Math.round(1 / TUNE.gambleOdds.unique)}.`);
