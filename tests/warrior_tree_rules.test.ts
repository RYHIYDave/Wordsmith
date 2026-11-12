// THE WARRIOR'S WEAPONS' RULES TO THE ART'S FRAMES (docs/warrior_tree_build.md, step 3; the art chat's README of
// docs/mockups/warrior_weapons, “What the main chat needs”), with game/talents.ts WARRIOR_TREE2 on. His words for these, 11 Nov
// 2026: “Tap should have a small knockback and high stun buildup/chance” (09:41, of the Smash). Held here:
//   1. each move's wind-up the art's blow: Cleave 0.333 s, the thrown axe 0.367 s, Smash 0.433 s, Earthquake 0.633 s;
//   2. Cleave's arc, 75 degrees either side of his aim, 1.7 tiles;
//   3. Smash on a spot 1.4 tiles before him, 0.4 round: what is on it struck, what is beside him not; it is pushed back a little;
//      a second Smash soon after stuns it; a second long after does not (the daze fades);
//   4. the Earthquake's ring round a spot 1.4 tiles before him, 2.0 round; Tremors three quakes, each wider and weaker;
//   5. Leaping Chop's blow 1.5 tiles before where he lands, 1.6 round.
//   4. the new talents at work.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { SKILLS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { asWarriorWeapon, rollItem } from '../src/game/items';
import { RNG as Dice } from '../src/engine/rng';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { TALENTS, WARRIOR_KITS, WARRIOR_TREE2, WARRIOR_TUNE, warriorKit, warriorWeapon } from '../src/game/talents';
import type { MonsterKind } from '../src/game/types';
import { land, seasoned } from './helpers';

const DT = 1 / 30;

interface Inside {
  rng: RNG;
  waveT: number;
  spawn(kind: MonsterKind, x: number, y: number, pack: number, rank: 0 | 1 | 2, boss: boolean, rng: RNG): Monster;
  wakeUp(m: Monster): void;
  kill(m: Monster): void;
  rollGear(q?: number): import('../src/game/types').Item;
}

function treeOn<T>(fn: () => T): T {
  const was = WARRIOR_TREE2.on;
  WARRIOR_TREE2.on = true;
  try {
    return fn();
  } finally {
    WARRIOR_TREE2.on = was;
  }
}

/** A Warrior of `level` in a quiet practice room, his talents those given. */
function warrior(talents: string[] = [], level = 30): { g: Game; a: Inside; seen: GameEvent[] } {
  const g = Game.forPractice('warrior', 5);
  const a = g as unknown as Inside;
  a.waveT = 1e9;
  g.monsters.length = 0;
  seasoned(g, level);
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const t of talents) assert.equal(g.takeTalent(t), null, `takes ${t}`);
  g.events.length = 0;
  return { g, a, seen: [] };
}

function put(g: Game, a: Inside, kind: MonsterKind, dx: number, dy: number, life = 1e6): Monster {
  const h = g.hero;
  const m = a.spawn(kind, h.x + dx, h.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  return m;
}

function run(g: Game, seen: GameEvent[], secs: number): void {
  for (let t = 0; t < secs - 1e-9; t += DT) {
    g.update(DT, emptyControls());
    seen.push(...g.events);
    g.events.length = 0;
  }
}

/** Ability `i` used at (x, y): a tap (0), a hold (1, let go once it lands), a swipe (2). */
function use(g: Game, seen: GameEvent[], i: 0 | 1 | 2, x: number, y: number): void {
  const h = g.hero;
  h.swingT = 0;
  for (const s of h.skills) {
    s.cd = 0;
    s.charges = s.maxCharges;
  }
  const c = emptyControls();
  c.aimX = x;
  c.aimY = y;
  if (i === 0) c.fire = true;
  else if (i === 1) {
    c.cast = true;
    c.castX = x;
    c.castY = y;
  }
  else {
    c.evade = true;
    c.evadeX = x;
    c.evadeY = y;
  }
  g.update(DT, c);
  seen.push(...g.events);
  g.events.length = 0;
  const off = emptyControls();
  off.aimX = x;
  off.aimY = y;
  land(g, off, DT, () => {
    seen.push(...g.events);
    g.events.length = 0;
  });
  run(g, seen, 0.6);
}

const hurt = (m: Monster): boolean => m.life < m.maxLife;
const near = (a: number, b: number, d = 1e-6): boolean => Math.abs(a - b) <= d;

test('1. each move\'s wind-up is the art\'s blow', () => {
  assert.ok(near(SKILLS.cleave.windup ?? 0, 10 / 30, 1e-3), 'Cleave');
  assert.ok(near(SKILLS.axethrow.windup ?? 0, 11 / 30, 1e-3), 'the thrown axe');
  assert.ok(near(SKILLS.smash.windup ?? 0, 13 / 30, 1e-3), 'Smash');
  assert.ok(near(SKILLS.quake.windup ?? 0, 19 / 30, 1e-3), 'Earthquake');
});

test('2. Cleave\'s arc: 75 degrees either side of his aim, 1.7 tiles', () => treeOn(() => {
  const { g, a, seen } = warrior(['battleaxe']);
  // (the swing is from where his step forward brings him, a third of a tile on: measured from there)
  const STEP = 0.33;
  const at = (deg: number, d: number): Monster => put(g, a, 'skeleton', STEP + Math.cos((deg * Math.PI) / 180) * d, Math.sin((deg * Math.PI) / 180) * d);
  const front = at(0, 1.1);
  const in70 = at(70, 1.5);
  const out85 = at(-85, 1.5);
  const far = at(20, 2.5);
  use(g, seen, 0, g.hero.x + 2, g.hero.y);
  assert.ok(hurt(front), 'the one before him struck');
  assert.ok(hurt(in70), 'at 70 degrees: struck');
  assert.ok(!hurt(out85), 'at 85 degrees: not');
  assert.ok(!hurt(far), 'past its reach: not');
}));

test('3. Smash: a spot 1.4 tiles before him; knocked back; a second blow soon after stuns, one long after does not', () => treeOn(() => {
  const { g, a, seen } = warrior(['warhammer']);
  const m = put(g, a, 'skeleton', 1.4, 0);
  const beside = put(g, a, 'skeleton', 0.3, 1.0);
  const x0 = m.x;
  use(g, seen, 0, g.hero.x + 2, g.hero.y);
  assert.ok(hurt(m), 'on the spot: struck');
  assert.ok(!hurt(beside), 'beside him: not');
  assert.ok(m.x > x0 + 0.2, `pushed back (${(m.x - x0).toFixed(2)} tiles)`);
  assert.ok(!seen.some((e) => e.t === 'stun' && e.id === m.id), 'one blow: not stunned');
  // (the second blow as soon as a press brings it: the first's press ran its blow and 0.6 s after)
  m.x = g.hero.x + 1.4;
  m.staggerT = 0;
  use(g, seen, 0, g.hero.x + 2, g.hero.y);
  assert.ok(seen.some((e) => e.t === 'stun' && e.id === m.id), 'the second, soon after: stunned');
  const { g: g2, a: a2, seen: seen2 } = warrior(['warhammer']);
  const n = put(g2, a2, 'skeleton', 1.4, 0);
  const n0 = n.x;
  use(g2, seen2, 0, g2.hero.x + 2, g2.hero.y);
  run(g2, seen2, 4);
  n.x = g2.hero.x + 1.4;
  void n0;
  use(g2, seen2, 0, g2.hero.x + 2, g2.hero.y);
  assert.ok(!seen2.some((e) => e.t === 'stun' && e.id === n.id), 'the second, long after: the daze had faded');
}));

test('4. the Earthquake round a spot 1.4 before him, 2.0 round; Tremors three, each wider and weaker', () => treeOn(() => {
  const { g, a, seen } = warrior(['warhammer']);
  put(g, a, 'skeleton', 1.4, 0);
  use(g, seen, 1, g.hero.x + 3, g.hero.y);
  run(g, seen, 1.5);
  const one = seen.filter((e): e is Extract<GameEvent, { t: 'burst' }> => e.t === 'burst' && e.style === 'slam');
  assert.equal(one.length, 1, 'one quake');
  assert.ok(near(one[0].x, g.hero.x + 1.4, 0.05) && near(one[0].y, g.hero.y, 0.05), `before him (${(one[0].x - g.hero.x).toFixed(2)})`);
  assert.ok(near(one[0].r, 2.0, 0.05), `2.0 round (${one[0].r})`);
  const t = warrior(['warhammer', 'tremors']);
  put(t.g, t.a, 'skeleton', 1.4, 0);
  use(t.g, t.seen, 1, t.g.hero.x + 3, t.g.hero.y);
  run(t.g, t.seen, 1.5);
  const three = t.seen.filter((e): e is Extract<GameEvent, { t: 'burst' }> => e.t === 'burst' && e.style === 'slam').map((e) => e.r);
  assert.deepEqual(three.map((r) => Math.round(r * 10) / 10), [2.0, 2.6, 3.2], 'three, each wider');
  assert.deepEqual(WARRIOR_TUNE.tremors.shares, [1, 0.6, 0.35], 'each weaker');
}));

test('5. Leaping Chop: the blow 1.5 tiles before where he lands, 1.6 round', () => treeOn(() => {
  const { g, a, seen } = warrior(['battleaxe']);
  use(g, seen, 2, g.hero.x + 4, g.hero.y);
  run(g, seen, 1.2);
  const blow = seen.find((e): e is Extract<GameEvent, { t: 'burst' }> => e.t === 'burst' && e.style === 'land');
  if (!blow) throw new Error('it came down');
  assert.ok(near(blow.x - g.hero.x, 1.5, 0.05) && near(blow.r, 1.6, 0.05), `${(blow.x - g.hero.x).toFixed(2)} before him, ${blow.r} round`);
  void a;
}));

// THE THROWN AXE AND HIS HANDS (the art chat's README, step 3b; his words of 11 Nov 2026, 09:03: “I want to make sure you can still
// do the tap attack while the axe hold is still flying”, and 09:07: “I understand that the axe is going to kind of materialize to
// keep fighting but I do need that to work that way”)
test('6. thrown, his hands are empty; it comes back to them, caught', () => treeOn(() => {
  const { g, seen } = warrior(['battleaxe']);
  use(g, seen, 1, g.hero.x + 4, g.hero.y);
  assert.equal(g.hero.handsEmpty, true, 'empty while it flies');
  run(g, seen, 3);
  assert.ok(seen.some((e) => e.t === 'axeCatch'), 'caught');
  assert.ok(!seen.some((e) => e.t === 'axeGlint'), 'no glint');
  assert.equal(g.hero.handsEmpty, false, 'in his hands again');
}));

test('7. a tap while it flies: an axe appears and he Cleaves; the thrown one, back, is gone into it with a glint', () => treeOn(() => {
  const { g, a, seen } = warrior(['battleaxe']);
  const m = put(g, a, 'skeleton', 1.3, 0.2);
  use(g, seen, 1, g.hero.x + 4, g.hero.y - 3);
  assert.equal(g.hero.handsEmpty, true);
  const life = m.life;
  use(g, seen, 0, m.x, m.y);
  assert.equal(g.hero.appear, true, 'the tap began with the axe appearing');
  assert.ok(m.life < life, 'and it Cleaved');
  run(g, seen, 3);
  assert.ok(seen.some((e) => e.t === 'axeGlint'), 'the glint');
  assert.ok(!seen.some((e) => e.t === 'axeCatch'), 'no catch');
}));

test('8. a throw broken off leaves the axe in his hands', () => treeOn(() => {
  const { g, seen } = warrior(['battleaxe']);
  const h = g.hero;
  for (const s of h.skills) s.cd = 0;
  const c = emptyControls();
  c.cast = true;
  c.castX = h.x + 4;
  c.castY = h.y;
  c.aimX = c.castX;
  c.aimY = c.castY;
  g.update(DT, c);
  assert.equal(h.handsEmpty, true, 'winding up the throw');
  // (a swipe breaks it off)
  const d = emptyControls();
  d.evade = true;
  d.evadeX = h.x - 3;
  d.evadeY = h.y;
  g.update(DT, d);
  run(g, seen, 0.5);
  assert.equal(g.projectiles.filter((p) => p.returns).length, 0, 'none thrown');
  assert.equal(h.handsEmpty, false, 'in his hands');
}));
