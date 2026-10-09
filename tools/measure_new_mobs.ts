// THE NEW MONSTERS (Version 19.9): how hard each hits a hero who stands and takes it, beside one of
// today's monsters of its size. A practice room; the monster beside the warrior (or six tiles off, where
// the Boneward throws its spear and the Golem its skulls); 40 seconds; the hero's life put back after
// every step; its words taken off (the moves alone weighed). And how much life each has, against the one
// beside it.
//   tsx tools/measure_new_mobs.ts [seconds=40] [rng=9]
import { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { MONSTERS, NEW_MONSTERS, movesOf } from '../src/game/defs';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import type { MonsterKind } from '../src/game/types';

const args = (globalThis as unknown as { process: { argv: string[] } }).process.argv.slice(2);
const SECONDS = Number(args[0]) || 40;
const SEED = Number(args[1]) || 9;

function fight(kind: MonsterKind, rank: 0 | 1 | 2, far: number): { perSecond: number; moves: Record<string, number>; life: number } {
  NEW_MONSTERS.on = true;
  const g = Game.forPractice('warrior', 5);
  const hooks = g as unknown as { waveT: number; spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster; wakeUp(m: Monster): void };
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  const m = hooks.spawn(kind, h.x - far, h.y, 1, rank, false, new RNG(SEED));
  hooks.wakeUp(m);
  const life = m.maxLife;
  m.life = m.maxLife = 1e9;
  m.words = [];
  m.shield = 0;
  const c = emptyControls();
  const dt = 1 / 60;
  let lost = 0;
  const moves: Record<string, number> = {};
  let was = '';
  for (let k = 0; k < SECONDS * 60; k++) {
    const before = h.life;
    g.update(dt, c);
    if (before > h.life) lost += before - h.life;
    h.life = h.d.maxLife;
    const list = movesOf(m);
    const now = m.state === 'windup' ? (list && m.move !== undefined && m.move >= 0 ? list[m.move].id : 'attack') : m.state === 'pickup' ? 'pickup' : '';
    if (now && now !== was) moves[now] = (moves[now] ?? 0) + 1;
    was = now;
  }
  NEW_MONSTERS.on = false;
  return { perSecond: lost / SECONDS, moves, life };
}

const rows: [string, MonsterKind, 0 | 1 | 2, number][] = [
  ['the skeleton, beside him', 'skeleton', 0, 0.9],
  ['THE SHADE, beside him', 'shade', 0, 0.9],
  ['the green troll, beside him', 'brute', 0, 1],
  ['THE BONEWARD, beside him', 'boneward', 0, 1],
  ['THE BONEWARD, six tiles off', 'boneward', 0, 6],
  ['the red troll, beside him', 'brute', 2, 1],
  ['the red troll, six tiles off', 'brute', 2, 6],
  ['THE GOLEM, beside him', 'golem', 0, 1.1],
  ['THE GOLEM, six tiles off', 'golem', 0, 6],
  ['a skeleton leading a yellow pack, beside him', 'skeleton', 1, 0.9],
  ['THE SKELETON CHAMPION, beside him', 'champion', 1, 1],
];
for (const [label, kind, rank, far] of rows) {
  const r = fight(kind, rank, far);
  console.log(`${label}: ${r.perSecond.toFixed(2)} a second; life ${r.life} (${MONSTERS[kind].name}); ${JSON.stringify(r.moves)}`);
}
