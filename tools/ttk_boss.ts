// ONE BOSS'S FIGHT, TIMED: the test bot (never falling) brought to a floor's boss with a hero of a given level, from the
// boss's first wound to its death; BOSS_LIFE on and off, each over a few seeds. For setting BOSS_LIFE by measuring
// (his word, 17 Oct: "Bosses need more HP past the warden.  TTK is much too short").
//   tsx tools/ttk_boss.ts <depth> <level> [seeds=3] [cls=warrior]
import { botStep, newBot } from '../src/dev/bot';
import { BOSS_LIFE } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ClassId } from '../src/game/types';
const a = (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);
const depth = Number(a[0] || 6);
const level = Number(a[1] || 11);
const seeds = Number(a[2] || 3);
const cls = (a[3] || 'warrior') as ClassId;
for (const on of [false, true]) {
  BOSS_LIFE.on = on;
  const times: string[] = [];
  for (let k = 0; k < seeds; k++) {
    const g = new Game(cls, 500 + k * 37);
    g.hero.level = level;
    g.refresh();
    g.depth = depth; g.cleared = depth - 1; g.enterDungeon();
    const b = g.boss!;
    // (only the boss: the hero brought 4 tiles off it, toward where he came in)
    g.monsters = g.monsters.filter((m) => m.boss);
    const sx = g.level.floor.start.x - b.x, sy = g.level.floor.start.y - b.y, sl = Math.hypot(sx, sy) || 1;
    g.hero.x = b.x + (sx / sl) * 4; g.hero.y = b.y + (sy / sl) * 4;
    const c = emptyControls();
    const bot = newBot(true);
    let from = -1;
    let t = 0;
    for (; t < 1800 && !b.dead; t += 1 / 30) {
      g.hero.life = g.hero.d.maxLife;
      botStep(g, c, bot, 1 / 30);
      g.update(1 / 30, c);
      g.events.length = 0;
      if (from < 0 && b.life < b.maxLife) from = t;
      // (the bot looks no further than a few tiles for a fight: a boss that has gone off across its ground, the Queen home to her
      // perch, is walked up to, as a person would, every three seconds)
      if (Math.round(t * 30) % 90 === 0 && Math.hypot(b.x - g.hero.x, b.y - g.hero.y) > 7) {
        const W = g.level.floor.w;
        for (const r of [3.5, 2.5, 4.5, 2]) for (let k = 0; k < 16; k++) {
          const ang = (k / 16) * Math.PI * 2;
          const x = b.x + Math.cos(ang) * r, y = b.y + Math.sin(ang) * r;
          if (g.level.walk[Math.floor(y) * W + Math.floor(x)] === 1 && Math.hypot(g.hero.x - b.x, g.hero.y - b.y) > 7) { g.hero.x = x; g.hero.y = y; }
        }
      }
    }
    times.push(b.dead ? `${Math.round(t - Math.max(0, from))}` : `not dead at 1800 (life ${Math.round(b.life)} of ${Math.round(b.maxLife)})`);
  }
  console.log(`floor ${depth} (${cls} level ${level}), BOSS_LIFE ${on ? 'on' : 'off'}: ${times.join(', ')} s`);
}
