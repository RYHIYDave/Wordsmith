// How fast a character levels: an immortal bot clears dungeons with each class, and the level
// (and the minutes of play) at the end of each dungeon are printed, with the moment each level
// was reached.
//   tsx tools/count_levels.ts [dungeons per class = 3]
// (The bot kills everything it meets and never dies, so this is the most a careful player gets.)
import { botStep, newBot } from '../src/dev/bot';
import { SLOT_LEVELS, TUNE, xpToNext } from '../src/game/defs';
import { Game } from '../src/game/game';
import { reqLevelFor } from '../src/game/items';
import { emptyControls } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';

declare const process: { argv: string[] };
const want = Number(process.argv[2] ?? 3);
// (a second argument tries another pace without touching the game: tsx tools/count_levels.ts 6 4)
if (process.argv[3]) TUNE.xpScale = Number(process.argv[3]);
console.log(`experience a level takes: ${TUNE.xpScale} x the old amount (level 1 to 2: ${xpToNext(1)}, 4 to 5: ${xpToNext(4)}, 7 to 8: ${xpToNext(7)}); second slot in front at level ${SLOT_LEVELS.front}, behind at ${SLOT_LEVELS.behind}`);
const ends: number[][] = [];
for (const cls of CLASS_IDS) {
  const g = new Game(cls, 4242);
  const c = emptyControls();
  const bot = newBot(true);
  const dt = 1 / 30;
  let cleared = 0;
  let level = g.hero.level;
  const at: string[] = [];
  let t = 0;
  const row: number[] = [];
  // all the experience earned, to say what level it would have made at the old pace (XP_SCALE 1)
  let earned = 0;
  const inner = g as unknown as { gainXp: (n: number) => void };
  const real = inner.gainXp.bind(g);
  inner.gainXp = (n) => {
    const before = g.hero.xp + [...Array(g.hero.level - 1).keys()].reduce((a, l) => a + xpToNext(l + 1), 0);
    real(n);
    const after = g.hero.xp + [...Array(g.hero.level - 1).keys()].reduce((a, l) => a + xpToNext(l + 1), 0);
    earned += after - before;
  };
  const oldLevel = (xp: number): number => {
    let l = 1;
    while (xp >= Math.round(45 + 33 * l + 9 * l * l)) {
      xp -= Math.round(45 + 33 * l + 9 * l * l);
      l++;
    }
    return l;
  };
  for (; t < 6000 && cleared < want; t += dt) {
    g.hero.life = g.hero.d.maxLife;
    // (levels are spent as they come: the bot puts every point into the class's own attribute)
    botStep(g, c, bot, dt);
    g.update(dt, c);
    g.events.length = 0;
    if (g.hero.level > level) {
      level = g.hero.level;
      at.push(`L${level} at ${(t / 60).toFixed(1)} min (dungeon ${g.cleared + 1})`);
    }
    if (g.cleared > cleared) {
      cleared = g.cleared;
      row.push(g.hero.level);
      console.log(`${cls.padEnd(8)} dungeon ${cleared} cleared at level ${g.hero.level} (${Math.round((100 * g.hero.xp) / xpToNext(g.hero.level))}% toward the next), after ${(t / 60).toFixed(1)} minutes of play; ${earned} experience so far (level ${oldLevel(earned)} at the pace before Version 11.1); what falls in the next dungeon needs level ${reqLevelFor(cleared + 1)}${g.hero.level < reqLevelFor(cleared + 1) ? ': TOO HIGH FOR THIS CHARACTER' : ''}`);
    }
  }
  console.log(`         ${at.join('; ')}`);
  ends.push(row);
}
const mean = (i: number): string => (ends.reduce((a, r) => a + (r[i] ?? 0), 0) / ends.length).toFixed(1);
console.log(`\nat the end of each dungeon, on average: ${Array.from({ length: want }, (_, i) => `dungeon ${i + 1}: level ${mean(i)}`).join(', ')}`);
