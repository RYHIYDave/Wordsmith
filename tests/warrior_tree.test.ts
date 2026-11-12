// THE WARRIOR'S THREE WEAPONS (game/talents.ts WARRIOR_TREE2, off until his yes to it in play; turned on here). His words to the
// main chat, 7 Nov 2026, 21:11: “I want his skill tree to start with a three branch option to go to Battle Ax, Warhammer, or (insert
// two handed sword name).  Then he’ll need tap and holds, probably swipes for the three weapons.  These will change his current
// weapon drops as well.  Swords become hammers become axes.”; his picks after: the Greatsword; the weapon at the first point,
// level 5; “Yes, his weapons change too (Recommended)”; swipes “Each its own (Recommended)”; Whirl to start, Whirlwind by the tree;
// and to the third draft of the tree, “Yes, build it (Recommended)”. These tests hold:
//   1. his moves by his weapon: the greatsword's (Strike, Whirl, Lunge) till he picks; each pick's three; Whirlwind by its talent;
//   2. the moves at work: Whirl round him; Cleave's arc; the axe that comes back; Smash's stagger; Earthquake's stun; the
//      Shoulder Charge striking what is in his way;
//   3. his weapons: found and carried, made his pick's;
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

test('1. his moves by his weapon: the greatsword\'s till he picks, each pick\'s three, Whirlwind by its talent', () => treeOn(() => {
  assert.ok(TALENTS.on);
  assert.deepEqual(warriorKit([]), ['strike', 'whirl', 'leap']);
  assert.equal(warriorWeapon([]), 'greatsword');
  for (const w of ['greatsword', 'battleaxe', 'warhammer'] as const) {
    const { g } = warrior([w]);
    assert.deepEqual(g.hero.skills.map((s) => s.id), [...WARRIOR_KITS[w]], `${w}'s three`);
  }
  const { g } = warrior(['greatsword', 'gswhirlwind']);
  assert.deepEqual(g.hero.skills.map((s) => s.id), ['strike', 'whirlwind', 'leap'], 'Whirl becomes Whirlwind');
  assert.ok(SKILLS.whirl.dmg > SKILLS.strike.dmg, 'Whirl harder than Strike (his words: “higher base damage than strike”)');
  // (and a new Warrior, before any point, has the greatsword's)
  const fresh = new Game('warrior', 3);
  assert.deepEqual(fresh.hero.skills.map((s) => s.id), ['strike', 'whirl', 'leap']);
}));

test('2. the moves at work', () => treeOn(() => {
  // Whirl: everything round him
  {
    const { g, a, seen } = warrior(['greatsword']);
    const ms = [put(g, a, 'skeleton', 1.2, 0), put(g, a, 'skeleton', -1.2, 0), put(g, a, 'skeleton', 0, 1.3)];
    use(g, seen, 1, g.hero.x + 1, g.hero.y);
    assert.ok(ms.every(hurt), 'Whirl cuts all round him');
  }
  // Cleave: every enemy in its arc
  {
    const { g, a, seen } = warrior(['battleaxe']);
    const front = put(g, a, 'skeleton', 1.3, 0);
    const side = put(g, a, 'skeleton', 1.0, 0.9);
    const behind = put(g, a, 'skeleton', -1.5, 0);
    use(g, seen, 0, front.x, front.y);
    assert.ok(hurt(front) && hurt(side), 'Cleave strikes the arc');
    assert.ok(!hurt(behind), 'not behind him');
  }
  // the axe that comes back: out through one, back through it again
  {
    const { g, a, seen } = warrior(['battleaxe']);
    const m = put(g, a, 'skeleton', 3, 0);
    const before = m.life;
    use(g, seen, 1, m.x, m.y);
    const out = before - m.life;
    run(g, seen, 2);
    assert.ok(out > 0 && before - m.life > out * 1.5, `struck going and coming (${out} then ${before - m.life})`);
    assert.ok(seen.some((e) => e.t === 'axeTurn'), 'it turned for home');
    assert.equal(g.projectiles.filter((p) => !p.hostile).length, 0, 'and was caught');
  }
  // Smash staggers; Earthquake stuns, in its ring round a spot 1.4 tiles before him (the art's: docs/warrior_tree_build.md, step 3),
  // and not what is behind him
  {
    const { g, a, seen } = warrior(['warhammer']);
    const m = put(g, a, 'skeleton', 1.3, 0);
    use(g, seen, 0, m.x, m.y);
    assert.ok(seen.some((e) => e.t === 'stagger' && e.id === m.id), 'Smash staggers');
    const q = put(g, a, 'skeleton', 2.6, 1);
    const back = put(g, a, 'skeleton', -1.6, 0);
    use(g, seen, 1, g.hero.x + 3, g.hero.y);
    assert.ok(seen.some((e) => e.t === 'stun' && e.id === q.id), 'Earthquake stuns');
    assert.ok(!seen.some((e) => e.t === 'stun' && e.id === back.id), 'not behind him');
  }
  // Shoulder Charge strikes what is in his way
  {
    const { g, a, seen } = warrior(['warhammer']);
    const inWay = put(g, a, 'skeleton', 2, 0);
    use(g, seen, 2, g.hero.x + 4.5, g.hero.y);
    assert.ok(hurt(inWay), 'struck on the way');
  }
}));

test('3. his weapons: what he finds, and what he carries when he picks', () => treeOn(() => {
  const it = rollItem(10, new Dice(5), { slot: 'mainhand', rarity: 1, forWeapon: 'greatsword', weapons: ['greatsword'] });
  assert.equal(it.weapon, 'greatsword');
  const name = it.name;
  asWarriorWeapon(it, 'battleaxe');
  assert.equal(it.weapon, 'battleaxe');
  assert.equal(it.icon, 'battleaxe');
  assert.ok(it.name !== name && /Axe/.test(it.name), `renamed: ${it.name}`);
  asWarriorWeapon(it, 'warhammer');
  assert.ok(it.weapon === 'warhammer' && /Warhammer|Maul/.test(it.name), it.name);
  const bow = rollItem(10, new Dice(6), { slot: 'mainhand', rarity: 1, weapons: ['bow'] });
  asWarriorWeapon(bow, 'battleaxe');
  assert.equal(bow.weapon, 'bow', 'a bow stays a bow');
  // picked: what he wears and carries is made his weapon; what he finds is his weapon
  const { g, a } = warrior();
  const h = g.hero;
  h.bag[0] = rollItem(10, new Dice(7), { slot: 'mainhand', rarity: 1, weapons: ['greatsword'] });
  assert.equal(g.takeTalent('warhammer'), null);
  assert.equal(h.bag[0]?.weapon, 'warhammer', 'the one in his bag');
  if (h.gear.mainhand && (h.gear.mainhand.weapon === 'warhammer' || h.gear.mainhand.weapon === 'greatsword')) assert.equal(h.gear.mainhand.weapon, 'warhammer', 'the one in his hand');
  let found = 0;
  for (let k = 0; k < 400; k++) {
    const piece = a.rollGear();
    assert.ok(piece.weapon !== 'greatsword' && piece.weapon !== 'battleaxe', `never another of the three: ${piece.weapon}`);
    if (piece.weapon === 'warhammer') found++;
  }
  assert.ok(found > 0, 'warhammers found');
}));

test('4. the new talents at work', () => treeOn(() => {
  // Twin Axes: two thrown
  {
    const { g, a, seen } = warrior(['battleaxe', 'twinaxes']);
    const m = put(g, a, 'skeleton', 4, 0);
    const h = g.hero;
    h.swingT = 0;
    for (const s of h.skills) { s.cd = 0; s.charges = s.maxCharges; }
    const c = emptyControls();
    c.aimX = m.x; c.aimY = m.y; c.cast = true; c.castX = m.x; c.castY = m.y;
    g.update(DT, c);
    land(g, (() => { const o = emptyControls(); o.aimX = m.x; o.aimY = m.y; return o; })(), DT, () => { seen.push(...g.events); g.events.length = 0; });
    assert.equal(g.projectiles.filter((p) => p.look === 'axe').length, 2, 'two axes');
  }
  // Rend: Cleave bleeds
  {
    const { g, a, seen } = warrior(['battleaxe', 'rend']);
    const m = put(g, a, 'skeleton', 1.3, 0);
    use(g, seen, 0, m.x, m.y);
    assert.ok((m.bleedT ?? 0) > 0 && (m.bleedDps ?? 0) > 0, 'bleeding');
  }
  // Red Mist and Headlong: kills make him quicker, and Leaping Chop ready
  {
    const { g, a, seen } = warrior(['battleaxe', 'rend', 'redmist', 'headlong']);
    const h = g.hero;
    const pace = g.frenzyPace();
    const m = put(g, a, 'skeleton', 1.3, 0, 1);
    h.skills[2].cd = 3;
    h.skills[2].charges = 0;
    a.kill(m);
    assert.ok(g.frenzyPace() > pace, 'quicker');
    assert.equal(h.skills[2].charges, h.skills[2].maxCharges, 'Leaping Chop ready');
    void seen;
  }
  // Tremors: three shakes
  {
    const { g, a, seen } = warrior(['warhammer', 'tremors']);
    put(g, a, 'skeleton', 1.2, 0);
    use(g, seen, 1, g.hero.x, g.hero.y);
    run(g, seen, 1.2);
    assert.ok(seen.filter((e) => e.t === 'burst').length >= WARRIOR_TUNE.tremors.n, 'three shakes');
  }
  // Heavy Head: Smash stuns
  {
    const { g, a, seen } = warrior(['warhammer', 'heavyhead']);
    const m = put(g, a, 'skeleton', 1.3, 0);
    use(g, seen, 0, m.x, m.y);
    assert.ok(seen.some((e) => e.t === 'stun' && e.id === m.id), 'stunned');
  }
  // Wide Swing: Smash strikes the half circle
  {
    const { g, a, seen } = warrior(['warhammer', 'heavyhead', 'bulldozer', 'wideswing']);
    const front = put(g, a, 'skeleton', 1.3, 0);
    const side = put(g, a, 'skeleton', 0.9, 1.0);
    use(g, seen, 0, front.x, front.y);
    assert.ok(hurt(front) && hurt(side), 'both');
  }
  // Bulldozer: carried, and stunned where he stops
  {
    const { g, a, seen } = warrior(['warhammer', 'heavyhead', 'bulldozer']);
    const m = put(g, a, 'skeleton', 1.5, 0);
    const x0 = m.x;
    use(g, seen, 2, g.hero.x + 4.5, g.hero.y);
    assert.ok(m.x > x0 + 1, `carried (${x0.toFixed(2)} to ${m.x.toFixed(2)})`);
    assert.ok(seen.some((e) => e.t === 'stun' && e.id === m.id), 'stunned where he stops');
  }
}));
