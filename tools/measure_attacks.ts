// THE MONSTERS' ATTACKS (Version 19.8): what they do to the test bot's runs, with the switch off and on.
//   tsx tools/measure_attacks.ts [seeds=4] [seconds=1800]
// For each class and seed, the bot plays from the start; reported: the dungeons cleared, deaths, and
// the harm the hero took from each kind of monster (the green trolls, the red, the Warden, the dead he
// calls, the rest), and the boss fights: how long, how many of the dead were called. The bot never
// dodges on purpose but for stepping out of a red circle (and, with the switch on, out of a charge's
// line), so read the numbers as a comparison, not as how hard the game is.
import { botStep, newBot } from '../src/dev/bot';
import { Game } from '../src/game/game';
import { MONSTER_ATTACKS } from '../src/game/defs';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';

const args = (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);
const SEEDS = Number(args[0]) || 4;
const SECONDS = Number(args[1]) || 1800;

type Tally = { cleared: number; deaths: number; harm: Record<string, number>; bossT: number[]; called: number[]; charges: number; chargeHits: number };
const proto = Game.prototype as unknown as {
  hurtHero: (this: Game, ...a: unknown[]) => void;
  landMove?: (this: Game, m: Monster, ...a: unknown[]) => void;
  callDead?: (this: Game, m: Monster) => void;
  summon: (this: Game, m: Monster) => void;
};
let cur: Tally | null = null;
let calledNow = 0;
const plainHurt = proto.hurtHero;
proto.hurtHero = function (this: Game, ...a: unknown[]): void {
  const h = this.hero;
  const before = h.life;
  const src = a[3] as Monster | null;
  plainHurt.apply(this, a);
  const lost = Math.max(0, before - h.life);
  if (!cur || lost <= 0) return;
  const name = src ? (src.boss ? 'warden' : src.champion ? 'red troll' : src.kind === 'brute' ? 'green troll' : src.packId === -2 ? 'called dead' : 'others') : String(a[4] ?? '');
  const key = /Warden/.test(name) ? 'warden' : /Guardian/.test(name) ? 'red troll' : /Brute/.test(name) ? 'green troll' : ['warden', 'red troll', 'green troll', 'called dead'].includes(name) ? name : 'others';
  cur.harm[key] = (cur.harm[key] ?? 0) + lost;
};
const plainCall = proto.callDead;
if (plainCall) proto.callDead = function (this: Game, m: Monster): void { calledNow += 4; plainCall.call(this, m); };
const plainSummon = proto.summon;
proto.summon = function (this: Game, m: Monster): void { calledNow += 4; plainSummon.call(this, m); };

for (const on of [false, true]) {
  MONSTER_ATTACKS.on = on;
  console.log(`\n=== the monsters' attacks ${on ? 'ON' : 'OFF'} ===`);
  for (const cls of CLASS_IDS) {
    const t: Tally = { cleared: 0, deaths: 0, harm: {}, bossT: [], called: [], charges: 0, chargeHits: 0 };
    cur = t;
    for (let k = 0; k < SEEDS; k++) {
      const seed = 1000 + k * 77;
      const g = new Game(cls, seed);
      const c = emptyControls();
      const bot = newBot(true);
      const dt = 1 / 30;
      let bossAt = -1;
      let bossDepth = -1;
      for (let s = 0; s < SECONDS && !g.over; s += dt) {
        botStep(g, c, bot, dt);
        const before = g.cleared;
        const boss = g.boss;
        if (boss && !boss.dead && boss.state !== 'sleep' && bossAt < 0) {
          bossAt = g.runTime;
          bossDepth = g.depth;
          calledNow = 0;
        }
        g.update(dt, c);
        if (bossAt >= 0 && (!g.boss || g.boss.dead || g.depth !== bossDepth)) {
          t.bossT.push(g.runTime - bossAt);
          t.called.push(calledNow);
          bossAt = -1;
        }
        if (g.cleared > before) t.cleared++;
        g.events.length = 0;
      }
      if (g.over) t.deaths++;
    }
    const avg = (a: number[]): string => (a.length ? (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : '-');
    const harm = Object.entries(t.harm).sort((a, b) => b[1] - a[1]).map(([k2, v]) => `${k2} ${Math.round(v)}`).join(', ');
    console.log(`${cls}: cleared ${t.cleared} in ${SEEDS} runs, ${t.deaths} died; harm: ${harm}; boss fights ${t.bossT.length}, ${avg(t.bossT)} s on average, the dead called ${avg(t.called)} a fight`);
  }
}
