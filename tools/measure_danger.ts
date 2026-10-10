// HOW DANGEROUS EACH FLOOR IS FOR THE HERO WHO REACHES IT (the owner, 10 Oct 2026, 17:59: "I’m
// playing and it feels like about lvl8 you become unkillable.  Difficulty kinda goes down the drain.")
//
//   tsx tools/measure_danger.ts [class = all] [seeds = 2] [floors = 7]
//
// The playtests' own player (src/dev/bot.ts) plays a class down through the floors, the game as it
// is (words found are set, gear found is worn where nothing is), its attribute points all put into
// its class's own attribute (as a player would; the bot alone spreads them). It never dies: a hero
// whose life runs out is counted dead and made whole again where he stands.
//
// For each floor, over the seeds: the hero's level and life coming in; the damage that reached him,
// as LIVES (his life at the time) per floor and as the share of his life lost per minute of the
// floor; what came back to him (regeneration, leech, flasks) the same way; the hardest single blow
// as a share of his life; and deaths. The column to read is LOST/MIN: about the share of his life a
// minute of the floor takes. When it falls while the floors get deeper, the hero is outgrowing them.
import { botStep, newBot } from '../src/dev/bot';
import { CLASSES } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { ClassId } from '../src/game/types';

declare const process: { argv: string[] };
const ONLY = process.argv[2] && process.argv[2] !== 'all' ? [process.argv[2] as ClassId] : (['warrior', 'ranger', 'mage'] as ClassId[]);
const SEEDS = [4242, 77, 9001, 5, 123456, 31337].slice(0, Math.max(1, Number(process.argv[3] ?? 2)));
const FLOORS = Number(process.argv[4] ?? 7);

interface Row { level: number; life: number; armor: number; secs: number; lost: number; healed: number; worst: number; deaths: number; hits: number }

function run(cls: ClassId, seed: number): Row[] {
  const g = new Game(cls, seed);
  const c = emptyControls();
  const bot = newBot(true);
  const dt = 1 / 30;
  const rows: Row[] = [];
  let row: Row | null = null;
  let at = -1;
  for (let t = 0; t < 1200 * FLOORS && g.cleared < FLOORS; t += dt) {
    const h = g.hero;
    while (h.pending > 0) g.chooseAttr(CLASSES[cls].primary);
    if (!g.level.town && g.depth !== at) {
      at = g.depth;
      row = { level: h.level, life: h.d.maxLife, armor: h.d.armor, secs: 0, lost: 0, healed: 0, worst: 0, deaths: 0, hits: 0 };
      rows[g.depth - 1] = row;
    }
    botStep(g, c, bot, dt);
    const before = h.life;
    g.update(dt, c);
    if (!row || g.level.town) {
      g.events.length = 0;
      continue;
    }
    row.secs += dt;
    for (const e of g.events) {
      if (e.t === 'hit' && (e as { onHero?: boolean }).onHero) {
        const amount = (e as { amount: number }).amount;
        row.hits++;
        row.worst = Math.max(row.worst, amount / h.d.maxLife);
      }
    }
    g.events.length = 0;
    const d = h.life - before;
    if (d < 0) row.lost += -d / h.d.maxLife;
    else row.healed += d / h.d.maxLife;
    if (h.life <= 0 || g.over) {
      row.deaths++;
      g.over = false;
      h.life = h.d.maxLife;
    }
  }
  return rows;
}

const mean = (v: number[]): number => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN);
for (const cls of ONLY) {
  const all = SEEDS.map((s) => run(cls, s));
  console.log(`\n${cls.toUpperCase()} (${SEEDS.length} seeds, points into ${CLASSES[cls].primary})`);
  console.log('floor  level   life  armor   mins  lost  lost/min  healed/min  worst hit  hits/min  deaths');
  for (let f = 0; f < FLOORS; f++) {
    const rs = all.map((r) => r[f]).filter((r): r is Row => !!r);
    if (!rs.length) continue;
    const m = (k: keyof Row): number => mean(rs.map((r) => r[k] as number));
    const mins = m('secs') / 60;
    console.log(
      `${String(f + 1).padStart(5)}  ${m('level').toFixed(1).padStart(5)}  ${m('life').toFixed(0).padStart(5)}  ${m('armor').toFixed(0).padStart(5)}  ${mins.toFixed(1).padStart(5)}  ${m('lost').toFixed(2).padStart(4)}  ${(m('lost') / mins).toFixed(3).padStart(8)}  ${(m('healed') / mins).toFixed(3).padStart(10)}  ${(m('worst') * 100).toFixed(1).padStart(8)}%  ${(m('hits') / mins).toFixed(1).padStart(8)}  ${m('deaths').toFixed(1).padStart(6)}`,
    );
  }
}
