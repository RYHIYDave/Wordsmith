// Version 12.1: barrels and urns are broken by what the hero sends flying.
//
// The owner, 4 Oct 2026: "The random barrels and vases in the dungeon can't be broken by projectile
// attacks. That needs to be fixed".
//
// Until then a barrel was broken by a sword's cut, a blast (slam, trap, orb), a beam and burning
// ground; an arrow, a wave and a familiar's bolt flew over it as if it were not there.
//   run: tsx --test tests/props.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, Monster, Projectile, PropInst } from '../src/game/state';
import type { ClassId, WeaponKind } from '../src/game/types';

const DT = 1 / 60;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The practice room, empty of monsters and of props, the hero in the middle facing +x, carrying a weapon of that kind. */
function room(cls: ClassId, weapon: WeaponKind, seed = 3): Game {
  const g = Game.forPractice(cls, seed);
  if (g.weapon() !== weapon) {
    const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
    assert.ok(i >= 0, `a ${weapon} is in the bag`);
    assert.equal(g.equipFromBag(i), null, `the ${cls} puts on the ${weapon}`);
  }
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}

/** A monster that stands still, never strikes, and can take anything. */
function dummy(g: Game, dx: number, dy: number): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e7;
  return m;
}

/** A barrel (or an urn) on the tile `dx`, `dy` tiles from the hero's, as the dungeon would have put it. */
function barrel(g: Game, dx: number, dy: number, kind: 'barrel' | 'urn' = 'barrel'): PropInst {
  const f = g.level.floor;
  const tx = Math.floor(g.hero.x) + dx;
  const ty = Math.floor(g.hero.y) + dy;
  assert.equal(g.level.walk[ty * f.w + tx], 1, `tile ${tx},${ty} is open floor`);
  const p: PropInst = { kind, tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant: 0 };
  g.level.props.push(p);
  g.level.walk[ty * f.w + tx] = 0;
  return p;
}

function step(g: Game, c: Controls, seconds: number): void {
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    c.fire = false;
    c.cast = false;
  }
}

/** One quick attack, aimed at a place `dx`, `dy` from the hero, and time enough for it to fly. */
function tap(g: Game, dx: number, dy: number, seconds = 1.5): void {
  const c = emptyControls();
  c.fire = true;
  c.aimX = g.hero.x + dx;
  c.aimY = g.hero.y + dy;
  step(g, c, seconds);
}

const broken = (g: Game, p: PropInst): boolean => p.state === 1 && !p.solid && g.level.walk[p.ty * g.level.floor.w + p.tx] === 1;

test('an arrow breaks the barrel it passes, and still reaches the monster behind it', () => {
  const g = room('ranger', 'bow');
  const near = barrel(g, 3, 0);
  const m = dummy(g, 7, 0);
  tap(g, 7, 0);
  assert.ok(broken(g, near), 'the barrel in the arrow\'s way is broken, and its tile can be walked on');
  assert.ok(m.life < m.maxLife, 'the arrow was not spent on the barrel: the monster behind it is hurt');
});

test('an arrow breaks an urn too, and leaves alone what it does not pass', () => {
  const g = room('ranger', 'bow');
  const inWay = barrel(g, 4, 0, 'urn');
  const aside = barrel(g, 4, 2);
  const behind = barrel(g, -3, 0);
  dummy(g, 8, 0);
  tap(g, 8, 0);
  assert.ok(broken(g, inWay), 'the urn in the way is broken');
  assert.equal(aside.state, 0, 'a barrel two tiles to the side is whole');
  assert.equal(behind.state, 0, 'a barrel behind the ranger is whole');
});

test('an arrow that meets nothing but barrels breaks every one along its flight', () => {
  const g = room('ranger', 'bow');
  const a = barrel(g, 2, 0);
  const b = barrel(g, 5, 0);
  tap(g, 6, 0);
  assert.ok(broken(g, a) && broken(g, b), 'both barrels along the arrow\'s flight are broken');
});

test('a wave breaks every barrel in its path, as wide as it is', () => {
  const g = room('mage', 'staff');
  const a = barrel(g, 2, 0);
  const b = barrel(g, 4, 1);
  const far = barrel(g, 4, 4);
  tap(g, 6, 0);
  assert.ok(broken(g, a), 'the barrel straight ahead is broken');
  assert.ok(broken(g, b), 'the barrel a tile off the middle of the wave is broken');
  assert.equal(far.state, 0, 'a barrel four tiles to the side is whole');
});

test('a familiar\'s bolt breaks the urn between it and what it shoots at', () => {
  const g = room('mage', 'wand');
  const m = dummy(g, 6, 0);
  const urn = barrel(g, 5, 0, 'urn');
  // (the urn stands right in front of the monster, so a bolt from anywhere near the hero passes it)
  tap(g, 6, 0, 4);
  assert.ok(m.life < m.maxLife, 'the familiar shot the monster');
  assert.ok(broken(g, urn), 'and its bolt broke the urn on the way');
});

test('a monster\'s shot does not break barrels', () => {
  const g = room('ranger', 'bow');
  const p = barrel(g, 3, 0);
  const shot: Projectile = {
    x: g.hero.x + 8, y: g.hero.y, vx: -14, vy: 0, r: 0.2, dist: 6, hostile: true, dmg: 0, element: 'phys', look: 'arrow', pierce: false,
    hit: [], volley: false, skill: -1, trail: 0, words: [], runed: false, clouded: false, age: 0, from: 'a test', n: 0,
  };
  g.projectiles.push(shot);
  step(g, emptyControls(), 1);
  assert.equal(g.projectiles.includes(shot), false, 'the shot has flown its length');
  assert.equal(p.state, 0, 'the barrel it flew over is whole');
});

test('breaking a barrel with an arrow can drop what a broken barrel drops', () => {
  // (the same breakProps as a sword's cut: over many barrels some gold falls)
  const g = room('ranger', 'bow');
  let gold = 0;
  for (let n = 0; n < 12; n++) {
    barrel(g, 2 + (n % 6), 0);
    if (n % 6 === 5) {
      tap(g, 9, 0);
      gold = g.drops.filter((d) => d.kind === 'gold').length;
      g.level.props = g.level.props.filter((p) => p.state === 0);
    }
  }
  assert.ok(gold > 0, 'at least one of twelve barrels broken by arrows dropped gold');
});
