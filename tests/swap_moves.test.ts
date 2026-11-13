// THE MAGE'S AND THE RANGER'S MOVES TO SWAP (game/swap_moves.ts, behind game/talents.ts SWAP_MOVES, off; his words in
// docs/mockups/swap_moves/README.md). Held here:
//   1. off, the game is as it was: the Mage Wave and Orb, the Ranger Shot and Volley, their trees the old ones;
//   2. on, the Mage sets any two of what she has learned on her tap and hold, never one in both, Beam only on her hold;
//   3. her BALL stops on what it hits and bursts there, hurting what is round it and not what is far;
//   4. her SPEAR goes through every enemy in its line;
//   5. the Ranger's SNARE in the place of his Shot, SNIPE or RALLY in his Volley's (both learned: he picks).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { SWAP_MOVES, TREES } from '../src/game/talents';
import type { ClassId, MonsterKind } from '../src/game/types';
import { land, seasoned } from './helpers';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
}

function swapOn<T>(fn: () => T): T {
  const was = SWAP_MOVES.on;
  SWAP_MOVES.on = true;
  try {
    return fn();
  } finally {
    SWAP_MOVES.on = was;
  }
}

function hero(cls: ClassId, talents: string[]): { g: Game; a: Inside } {
  const g = Game.forPractice(cls, 5);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  seasoned(g, 50);
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const t of talents) assert.equal(g.takeTalent(t), null, `takes ${t}`);
  g.events.length = 0;
  return { g, a };
}

function put(g: Game, a: Inside, dx: number, dy: number): Monster {
  const h = g.hero;
  const m = a.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e6;
  return m;
}

/** Her tap at (x, y), and a second for it to fly. */
function tap(g: Game, x: number, y: number): void {
  const h = g.hero;
  h.swingT = 0;
  for (const s of h.skills) s.cd = 0;
  const c = emptyControls();
  c.aimX = x;
  c.aimY = y;
  c.fire = true;
  g.update(DT, c);
  const off = emptyControls();
  off.aimX = x;
  off.aimY = y;
  land(g, off, DT, () => {});
  for (let t = 0; t < 1.2; t += DT) g.update(DT, emptyControls());
}

const ids = (g: Game): string[] => g.hero.skills.map((s) => s.id);
const hurt = (m: Monster): boolean => m.life < m.maxLife;

test('1. off, the game is as it was', () => {
  assert.equal(SWAP_MOVES.on, false, 'off until his yes to the moves in play');
  assert.deepEqual(ids(hero('mage', []).g).slice(0, 2), ['wave', 'orb']);
  assert.deepEqual(ids(hero('ranger', []).g).slice(0, 2), ['shot', 'volley']);
  assert.ok(!TREES.mage.talents.some((t) => t.id === 'aura'), 'her old tree');
  assert.ok(!TREES.ranger.talents.some((t) => t.id === 'snare'), 'his old tree');
});

test('2. on, she sets any two of what she has learned on her tap and hold; never one in both; Beam only held', () => swapOn(() => {
  const { g } = hero('mage', ['kindling', 'ball', 'charged', 'beam', 'bittercold', 'spear']);
  assert.deepEqual(ids(g).slice(0, 2), ['wave', 'orb'], 'Wave and Orb till she sets them');
  const taps = new Set<string>();
  for (let k = 0; k < 6; k++) {
    taps.add(g.hero.skills[0].id);
    g.changeMove(0);
    assert.notEqual(g.hero.skills[0].id, g.hero.skills[1].id, 'never one move in both places');
  }
  assert.ok(!taps.has('beam'), 'Beam never on her tap');
  for (const m of ['wave', 'ball', 'spear']) assert.ok(taps.has(m), `${m} on her tap`);
  const holds = new Set<string>();
  for (let k = 0; k < 6; k++) {
    holds.add(g.hero.skills[1].id);
    g.changeMove(1);
  }
  assert.ok(holds.has('beam'), 'Beam on her hold');
  // (unlearned, a move is gone from her places)
  const { g: g2 } = hero('mage', ['kindling']);
  assert.deepEqual(g2.moveChoicesOf(0), [], 'nothing to change to with nothing learned');
}));

test('3. her BALL stops on what it hits and bursts there: what is round it hurt, what is far not', () => swapOn(() => {
  const { g, a } = hero('mage', ['kindling', 'ball']);
  while (g.hero.skills[0].id !== 'ball') assert.ok(g.changeMove(0));
  const first = put(g, a, 4, 0);
  const beside = put(g, a, 4.8, 0.6);
  const beyond = put(g, a, 7.5, 0);
  tap(g, first.x, first.y);
  assert.ok(hurt(first), 'what it struck');
  assert.ok(hurt(beside), 'what is beside it, in the burst');
  assert.ok(!hurt(beyond), 'what is beyond it: the ball stopped');
}));

test('4. her SPEAR goes through every enemy in its line', () => swapOn(() => {
  const { g, a } = hero('mage', ['bittercold', 'spear']);
  while (g.hero.skills[0].id !== 'spear') assert.ok(g.changeMove(0));
  const line = [put(g, a, 3, 0), put(g, a, 5, 0), put(g, a, 7, 0)];
  const off = put(g, a, 5, 2.5);
  tap(g, line[2].x, line[2].y);
  for (const [k, m] of line.entries()) assert.ok(hurt(m), `the ${k + 1} in its line`);
  assert.ok(!hurt(off), 'not what is off its line');
}));

test('5. the Ranger: Snare for his Shot; Snipe or Rally for his Volley, his pick where he has both', () => swapOn(() => {
  const tree = TREES.ranger;
  const path = (id: string): string[] => {
    // (the stones on the way to `id` from where his tree begins, as takeTalent wants them)
    const out: string[] = [];
    let at = tree.talents.find((t) => t.id === id);
    while (at) {
      out.unshift(at.id);
      at = at.from.length ? tree.talents.find((t) => t.id === at!.from[0]) : undefined;
    }
    return out;
  };
  const want = [...new Set([...path('snare'), ...path('snipe')])];
  const { g } = hero('ranger', want);
  assert.deepEqual(ids(g).slice(0, 2), ['snare', 'snipe']);
  assert.deepEqual(g.moveChoicesOf(1), [], 'one hold learned: nothing to pick');
  assert.deepEqual(g.moveChoicesOf(0), [], 'his tap is Snare, no pick');
}));
