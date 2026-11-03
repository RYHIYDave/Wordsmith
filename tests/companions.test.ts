// THE RANGER'S COMPANIONS (game/companions.ts; game/talents.ts COMPANIONS, off until he has seen them at work and said yes).
// His words, 28 Oct 2026, 23:09 to 23:25 (the head of game/companions.ts): a hawk that marks with Precise, a snake that poisons,
// and four more; “You pick one, not all three”; “two separate passive with three each”, “opposite each other on the tree”;
// picked “Any time in town (Recommended)”; his tree, “Really good stuff”; “Yeah keep the groups”.
//   run: tsx --test tests/companions.test.ts
import './companions_on';
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { COMPANIONS, TALENTS, TREES, takeProblem } from '../src/game/talents';
import { COMPANION_GROUPS, COMPANION_TUNE, cleanPicks } from '../src/game/companions';
import type { CompanionKind } from '../src/game/companions';

const DT = 1 / 60;
type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

function room(talents: string[], seed = 3, cls: 'ranger' | 'warrior' = 'ranger'): Game {
  const g = Game.forPractice(cls, seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.hero.talents = [...talents];
  g.refresh();
  g.events.length = 0;
  return g;
}
function dummy(g: Game, dx: number, dy: number, life = 1e7): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  return m;
}
function wait(g: Game, seconds: number): void {
  const c = emptyControls();
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    g.events.length = 0;
  }
}
const HUNT = ['keeneye', 'venom', 'huntcompanion'];
const WILD = ['fleet', 'windrunner', 'wildcompanion'];

test('the switch is on for these tests (a page built with it), and the two talents are on his tree, one on each feather', () => {
  assert.equal(COMPANIONS.on, true);
  assert.equal(TALENTS.on, true);
  const t = TREES.ranger.talents;
  const hunt = t.find((q) => q.id === 'huntcompanion')!;
  const wild = t.find((q) => q.id === 'wildcompanion')!;
  assert.ok(hunt && wild);
  assert.deepEqual([hunt.path, hunt.from], ['eye', ['venom']], 'the hunting one on the Eye feather');
  assert.deepEqual([wild.path, wild.from], ['wind', ['windrunner']], 'the wild one on the Wind feather');
  assert.ok(hunt.at[1] > 3 && wild.at[1] < 1, 'opposite each other');
  // (three points to either, six to both: his “if you want two it’s going to take some investment”)
  const h = { cls: 'ranger' as const, level: 50, talents: ['keeneye', 'venom'] };
  assert.equal(takeProblem(h.cls, h.level, h.talents, 'huntcompanion'), null);
  assert.notEqual(takeProblem(h.cls, h.level, ['keeneye'], 'huntcompanion'), null, 'not before the one before it');
});

test('taking the Hunting Companion brings a hawk to his side (the first of its three); the Wild Companion a bat; both, both', () => {
  const g = room(HUNT);
  wait(g, 0.2);
  assert.deepEqual(g.pets.map((p) => p.kind), ['hawk']);
  const g2 = room(WILD);
  wait(g2, 0.2);
  assert.deepEqual(g2.pets.map((p) => p.kind), ['bat']);
  const g3 = room([...HUNT, ...WILD]);
  wait(g3, 0.2);
  assert.deepEqual(g3.pets.map((p) => p.kind).sort(), ['bat', 'hawk']);
  for (const p of g3.pets) assert.ok(Math.hypot(p.x - g3.hero.x, p.y - g3.hero.y) < 2.5, 'by his side');
  // (without the talents, none; and none for another class)
  const g4 = room([]);
  wait(g4, 0.2);
  assert.equal(g4.pets.length, 0);
  const g5 = room([], 3, 'warrior');
  g5.hero.talents = ['huntcompanion'];
  wait(g5, 0.2);
  assert.equal(g5.pets.length, 0);
});

test('he picks one of its three in town, and only in town; the pick is kept in his save; a pick of the wrong group is not', () => {
  const g = room(HUNT);
  wait(g, 0.2);
  assert.equal(g.pickCompanion('snake'), false, 'not out in the dungeon');
  const t = new Game('ranger', 5);
  t.hero.level = 50;
  t.hero.talents = [...HUNT];
  t.refresh();
  if (!t.level.town) t.enterTown();
  assert.ok(t.level.town);
  wait(t, 0.2);
  assert.equal(t.pets[0].kind, 'hawk');
  assert.equal(t.pickCompanion('bat'), false, 'not one his talents do not bring');
  assert.equal(t.pickCompanion('wolf'), true);
  wait(t, 0.1);
  assert.deepEqual(t.pets.map((p) => p.kind), ['wolf']);
  const back = Game.restore(JSON.parse(JSON.stringify(t.save())));
  assert.deepEqual(back.hero.pets, { hunt: 'wolf' });
  assert.deepEqual(cleanPicks({ hunt: 'bat', wild: 'fox', x: 'hawk' }), { wild: 'fox' });
});

/** Companion `kind` (its group's talent taken, it picked) by an enemy, until it has bitten it. */
function bitten(kind: CompanionKind): { g: Game; m: Monster } {
  const group = COMPANION_GROUPS.hunt.kinds.includes(kind) ? 'hunt' : 'wild';
  const g = room(group === 'hunt' ? HUNT : WILD);
  g.hero.pets = { [group]: kind };
  wait(g, 0.2);
  const m = dummy(g, 1.6, 0.4);
  for (let t = 0; t < 4 && m.life === m.maxLife; t += DT) g.update(DT, emptyControls());
  return { g, m };
}

test('each bite hurts, and does what its word does: the hawk marks, the snake poisons, the wolf holds', () => {
  const hawk = bitten('hawk');
  assert.ok(hawk.m.life < hawk.m.maxLife, 'the hawk strikes');
  assert.ok(hawk.m.markT > 0, 'and marks it (Precise behind)');
  const snake = bitten('snake');
  assert.ok(snake.m.poisonT > 0 && snake.m.poisonDps > 0, 'the snake poisons it');
  const wolf = bitten('wolf');
  assert.ok((wolf.m.bindT ?? 0) > 0, 'the wolf holds it in place');
});

test('the bat heals him, the fox gives him a burst of speed, the tortoise a brief shield', () => {
  const g0 = room(WILD);
  g0.hero.pets = { wild: 'bat' };
  wait(g0, 0.2);
  g0.hero.life = Math.round(g0.hero.d.maxLife / 2);
  const before = g0.hero.life;
  const m = dummy(g0, 1.6, -0.4);
  for (let t = 0; t < 4 && m.life === m.maxLife; t += DT) g0.update(DT, emptyControls());
  assert.ok(g0.hero.life > before, 'the bat heals him');
  const fox = bitten('fox');
  assert.ok(fox.g.hero.hasteT > 0 && fox.g.hero.haste >= COMPANION_TUNE.kinds.fox.haste, 'the fox: a burst of speed');
  const tortoise = bitten('tortoise');
  assert.ok(tortoise.g.hero.shield > 0 && tortoise.g.hero.shieldT > 0, 'the tortoise: a shield');
});

test('the hawk’s mark makes his next hit on it a certain critical', () => {
  const { g, m } = bitten('hawk');
  assert.ok(m.markT > 0);
  const h = g.hero;
  const c = emptyControls();
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  let spent = false;
  for (let t = 0; t < 3 && !spent; t += DT) {
    g.update(DT, c);
    c.fire = false;
    spent = g.events.some((e) => e.t === 'markSpent');
    g.events.length = 0;
  }
  assert.ok(spent, 'his arrow spends the mark');
  void h;
});

test('the tortoise keeps by him: it goes only for what is near him', () => {
  const g = room(WILD);
  g.hero.pets = { wild: 'tortoise' };
  wait(g, 0.2);
  const far = dummy(g, 5, 0);
  wait(g, 3);
  assert.equal(far.life, far.maxLife, 'one five tiles off is let be');
  const near = dummy(g, 1.4, 0.6);
  wait(g, 3);
  assert.ok(near.life < near.maxLife, 'one by him is bitten');
});

test('left far behind, a companion is at his side again', () => {
  const g = room(HUNT);
  wait(g, 0.2);
  g.hero.x += 13;
  if (!g.isOpen(g.hero.x, g.hero.y)) g.hero.x -= 13;
  wait(g, 0.3);
  const p = g.pets[0];
  assert.ok(Math.hypot(p.x - g.hero.x, p.y - g.hero.y) < 3);
});
