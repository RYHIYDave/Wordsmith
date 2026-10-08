// How far does the test bot get? Plays each class over several seeds and reports where runs end.
//   tsx tools/balance.ts [seeds=6] [seconds=2400]
// The bot is far cruder than a person (it never dodges on purpose), so read the numbers as a
// comparison between versions and classes, not as how hard the game is.
import { botStep, newBot } from '../src/dev/bot';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';

const args = (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);
const SEEDS = Number(args[0]) || 6;
const SECONDS = Number(args[1]) || 2400;

for (const cls of CLASS_IDS) {
  let clearedSum = 0;
  const lines: string[] = [];
  for (let k = 0; k < SEEDS; k++) {
    const seed = 1000 + k * 77;
    const g = new Game(cls, seed);
    const c = emptyControls();
    const bot = newBot(true);
    const dt = 1 / 30;
    const clears: string[] = [];
    let last = 0;
    for (let t = 0; t < SECONDS && !g.over; t += dt) {
      botStep(g, c, bot, dt);
      const before = g.cleared;
      g.update(dt, c);
      if (g.cleared > before) {
        clears.push(`${Math.round(g.runTime - last)}s L${g.hero.level}`);
        last = g.runTime;
      }
      g.events.length = 0;
    }
    clearedSum += g.cleared;
    lines.push(`  seed ${seed}: cleared ${g.cleared} [${clears.join(', ')}] ${g.over ? `died in dungeon ${g.depth} at level ${g.hero.level} to ${g.slainBy || '?'}` : `alive in dungeon ${g.depth} at level ${g.hero.level}`}`);
  }
  console.log(`${cls}: ${(clearedSum / SEEDS).toFixed(1)} dungeons cleared on average`);
  for (const l of lines) console.log(l);
}
