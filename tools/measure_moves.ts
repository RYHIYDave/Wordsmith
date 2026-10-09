// THE MONSTERS' ATTACKS (Version 19.8): how hard each monster that has moves hits a hero who stands
// and takes it, with the switch off and on. A practice room; the monster beside the warrior (or six
// tiles off, which the red troll charges from); 40 seconds; the hero's life put back after every step;
// what the dead the Warden calls do left out (with the switch off he calls them only as his life
// runs down, and here it never does).
//   tsx tools/measure_moves.ts [seconds=40] [rng=9] [bare]
// (`bare`: the monster's words taken off it, so that the moves alone are weighed.)
// It prints, for each, the harm a second, off and on, and the moves made.
import { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { MONSTER_ATTACKS, movesOf } from '../src/game/defs';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import type { MonsterKind } from '../src/game/types';

const args = (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);
const SECONDS = Number(args[0]) || 40;
const SEED = Number(args[1]) || 9;
const BARE = args[2] === 'bare';

function fight(on: boolean, which: 'brute' | 'guardian' | 'warden', far: number): { perSecond: number; moves: Record<string, number> } {
  MONSTER_ATTACKS.on = on;
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as { waveT: number; spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster; wakeUp(m: Monster): void };
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  const m = hooks.spawn(which === 'warden' ? 'warden' : 'brute', h.x - far, h.y, 1, which === 'guardian' ? 2 : 0, which === 'warden', new RNG(SEED));
  hooks.wakeUp(m);
  m.life = m.maxLife = 1e9;
  if (BARE) {
    m.words = [];
    m.shield = 0;
  }
  const c = emptyControls();
  const dt = 1 / 60;
  let lost = 0;
  const moves: Record<string, number> = {};
  let was = '';
  for (let k = 0; k < SECONDS * 60; k++) {
    const before = h.life;
    g.update(dt, c);
    if (before > h.life && !/Skeleton/.test(g.slainBy)) lost += before - h.life;
    h.life = h.d.maxLife;
    const list = movesOf(m);
    const now = m.state === 'windup' ? (list && m.move !== undefined && m.move >= 0 ? list[m.move].id : m.atk === 1 ? 'bolts' : 'attack') : '';
    if (now && now !== was) moves[now] = (moves[now] ?? 0) + 1;
    was = now;
  }
  MONSTER_ATTACKS.on = false;
  return { perSecond: lost / SECONDS, moves };
}

for (const [which, far, label] of [['brute', 1, 'the green troll, beside him'], ['guardian', 1, 'the red troll, beside him'], ['guardian', 6, 'the red troll, six tiles off'], ['warden', 2.4, 'the Warden, beside him'], ['warden', 6, 'the Warden, six tiles off']] as const) {
  const off = fight(false, which, far);
  const on = fight(true, which, far);
  const pct = Math.round((on.perSecond / off.perSecond - 1) * 100);
  console.log(`${label}: off ${off.perSecond.toFixed(2)} a second (${JSON.stringify(off.moves)}); on ${on.perSecond.toFixed(2)} (${JSON.stringify(on.moves)}): ${pct >= 0 ? '+' : ''}${pct}%`);
}
