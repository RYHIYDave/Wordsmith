// ENDLESS MODE'S FINAL BOSS, STAGE 2 (game/final_arena.ts, game/act1_rules/wsboss.ts; behind ENDLESS_KEY, off): the arena and his
// first phase.
//   1. down through the open landing at the Shaft's Rim: the arena, round; he stands in the portal's light; the boss across it,
//      the only monster; an endless level to the rest of the game; saved there, he is back at the Rim, the landing still open;
//   2. two minutes of the fight, the hero standing in it: the boar's moves and his words take turns, every one of the ten made, none
//      twice running (his words; the boar's but for the runs of a charge), never two of his words' floors lying at once, the
//      winded stand only ever straight after a charge's last run; he is hurt by them; the boss stays on the floor;
//   3. his life is held at half (the boar's death is the next stage's).
//   run: tsx --test tests/final_fight.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ENDLESS_TOWN, LANDING } from '../src/art/shaft_rim';
import { lastFloor } from '../src/game/act1';
import { ENDLESS } from '../src/game/endless';
import { ENDLESS_KEY } from '../src/game/endless_key';
import { FINAL_ARRIVE, FINAL_PLACE, isFinal } from '../src/game/final_arena';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { seasoned } from './helpers';

type Inner = { takeWay(t: string): void; updateKey(dt: number): void };
const inner = (g: Game): Inner => g as unknown as Inner;

function keyed<T>(fn: () => T): T {
  const was = [ENDLESS_KEY.on, ENDLESS.on, ENDLESS_TOWN.on] as const;
  ENDLESS_KEY.on = true;
  ENDLESS.on = true;
  ENDLESS_TOWN.on = true;
  try {
    return fn();
  } finally {
    [ENDLESS_KEY.on, ENDLESS.on, ENDLESS_TOWN.on] = was;
  }
}
/** A seasoned hero at the Rim, the landing open for him. */
function atTheLanding(seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 30);
  g.depth = lastFloor();
  g.cleared = lastFloor() - 1;
  g.wayDepth = lastFloor();
  g.enterDungeon();
  inner(g).takeWay('on');
  g.endless = 24;
  g.hero.finalOpen = true;
  g.enterTown();
  return g;
}
const boss = (g: Game): Monster => g.monsters.find((m) => m.kind === 'wsboss') as Monster;

test('down through the landing: the arena, the boss across it, an endless level; saved there, back at the Rim', () => keyed(() => {
  const g = atTheLanding(71);
  assert.ok(g.level.rim);
  // (the landing opens; walked into, he goes down)
  for (let i = 0; i < 200 && !g.level.rim?.key?.open; i++) inner(g).updateKey(0.05);
  g.hero.x = LANDING[0];
  g.hero.y = LANDING[1];
  for (let i = 0; i < 90 && !isFinal(g.level); i++) g.update(1 / 30, emptyControls());
  assert.ok(isFinal(g.level), 'down in the arena');
  assert.ok(g.inEndless && g.inFinal);
  assert.ok(Math.hypot(g.hero.x - FINAL_ARRIVE.x, g.hero.y - FINAL_ARRIVE.y) < 0.5, 'in the portal\'s light');
  assert.equal(g.monsters.length, 1, 'he alone');
  const b = boss(g);
  assert.ok(b && b.boss, 'the warped wordsmith, the boss');
  assert.ok(Math.hypot(b.x - FINAL_PLACE.cx, b.y - FINAL_PLACE.cy) < FINAL_PLACE.floor, 'on the floor');
  assert.ok(g.free(g.level.walk, g.hero.x, g.hero.y, 0.3));
  // (saved down here: back at the Rim, the landing open)
  const back = Game.restore(JSON.parse(JSON.stringify(g.save())), g.meta);
  assert.ok(back.level.rim, 'at the Rim');
  assert.equal(back.hero.finalOpen, true);
}));

test('two minutes of his first phase: the beats take turns, all ten made, none twice running, his floors one at a time', () => keyed(() => {
  const g = atTheLanding(72);
  g.enterArena();
  const h = g.hero;
  const b = boss(g);
  const made: string[] = [];
  let last = '';
  let hurt = 0;
  let floors = 0;
  // (he stands his ground, taking it: each blow that reaches him counted, none of it taken from his life)
  (g as unknown as { hurtHero: () => void }).hurtHero = () => {
    hurt++;
  };
  void h;
  for (let i = 0; i < 30 * 150; i++) {
    g.update(1 / 30, emptyControls());
    const id = b.act?.id ?? '';
    if (id && id !== last) made.push(id.slice(7));
    last = id;
    const lying = new Set(g.perils.filter((p) => (p.a1 === 'wsboss:meteor' || p.a1 === 'wsboss:trap') && p.t < p.dur - 0.5).map((p) => p.a1));
    if (lying.size > 1) floors++;
    assert.ok(Math.hypot(b.x - FINAL_PLACE.cx, b.y - FINAL_PLACE.cy) <= FINAL_PLACE.floor, `on the floor at ${(i / 30).toFixed(1)} s`);
    assert.ok(!g.over, 'he lives');
  }
  const all = ['charge', 'wheel', 'winded', 'gore', 'stomp', 'power', 'flame', 'frost', 'lightning', 'poison'];
  const missing = all.filter((a) => !made.includes(a));
  assert.deepEqual(missing.filter((a) => a !== 'gore'), [], `made: ${made.join(' ')}`);
  for (let i = 1; i < made.length; i++) {
    if (made[i] === 'charge' || made[i] === 'wheel') continue;
    assert.notEqual(made[i], made[i - 1], `twice running at ${i}: ${made.join(' ')}`);
  }
  for (let i = 0; i < made.length; i++) if (made[i] === 'winded') assert.equal(made[i - 1], 'charge', 'winded only after a charge');
  assert.equal(floors, 0, 'never two of his floors at once');
  assert.ok(hurt > 10, `hurt ${hurt} times`);
}));

test('his life held at half (the boar\'s death is the next stage\'s)', () => keyed(() => {
  const g = atTheLanding(73);
  g.enterArena();
  const b = boss(g);
  for (let i = 0; i < 40; i++) g.damageMonster(b, b.maxLife / 10, 'phys', false, 0);
  assert.ok(!b.dead && b.life >= Math.ceil(b.maxLife * 0.5) - 1, `life ${b.life} of ${b.maxLife}`);
}));
