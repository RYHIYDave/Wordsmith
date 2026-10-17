// HOW LONG EACH BOSS TAKES TO KILL (his word, 17 Oct: "Bosses need more HP past the warden.  TTK is much too short."):
// the test bot plays each class from a new game, never falling (god), and every boss fight is timed, from the first
// blow it takes to its death, with the hero's level then. The bot is cruder than a person (it fights standing, it
// dodges only what is marked), so read it as a comparison: BOSS_LIFE on against off, one version against another.
//   tsx tools/ttk.ts [seconds=5400] [seed=1000] [off]     (off: BOSS_LIFE switched off, as 22.1 has them)
import { botStep, newBot } from '../src/dev/bot';
import { BOSS_LIFE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';

const args = (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);
const SECONDS = Number(args[0]) || 5400;
const SEED = Number(args[1]) || 1000;
if (args.includes('off')) BOSS_LIFE.on = false;
const only = args.find((a) => (CLASS_IDS as readonly string[]).includes(a));

for (const cls of CLASS_IDS) {
  if (only && cls !== only) continue;
  const g = new Game(cls, SEED);
  const c = emptyControls();
  const bot = newBot(true);
  const dt = 1 / 30;
  const fights: string[] = [];
  let boss: Monster | null = null;
  let from = -1;
  let depths = '';
  let lastDepth = -1;
  let downAt = -1;
  for (let t = 0; t < SECONDS && !g.over; t += dt) {
    g.hero.life = g.hero.d.maxLife;
    // (the bot does not find its way down into the descent: 20 s after the fifth floor's boss is dead, or any of the descent's, it is sent down to the next)
    if (downAt >= 0 && t - downAt > 20 && g.depth >= 5 && g.depth < 10) {
      const next = g.depth + 1;
      g.cleared = Math.max(g.cleared, g.depth);
      g.depth = next;
      g.enterDungeon();
      downAt = -1;
    }
    botStep(g, c, bot, dt);
    g.update(dt, c);
    g.events.length = 0;
    if (g.depth !== lastDepth) {
      lastDepth = g.depth;
      downAt = -1;
      depths += ` ${g.inDungeon ? g.depth : 'town'}@${Math.round(t)}`;
    }
    const b = g.boss && !g.boss.dead ? g.boss : null;
    if (b && b !== boss) {
      boss = b;
      from = -1;
    }
    if (boss && from < 0 && boss.life < boss.maxLife) from = t;
    if (boss && boss.dead) {
      downAt = g.depth >= 5 ? t : -1;
      if (from < 0) fights.push(`  floor ${g.depth} ${boss.kind}: dead at ${Math.round(t)} s untouched (life ${Math.round(boss.life)} of ${Math.round(boss.maxLife)})`);
      if (from >= 0) fights.push(`  floor ${g.depth} ${boss.kind}: ${Math.round(t - from)} s (life ${Math.round(boss.maxLife)}, hero level ${g.hero.level})`);
      boss = null;
    }
  }
  console.log(`${cls} (BOSS_LIFE ${BOSS_LIFE.on ? 'on' : 'off'}, ${SECONDS} s, seed ${SEED}): reached${depths}`);
  for (const f of fights) console.log(f);
}
