// Version 12.2: "of Power" is built by blows that land, not by uses.
//
// The owner, 4 Oct 2026, 22:06: ""Of power" should only stack when an enemy is hit. Not when the
// ability is used". And, of the one-handed sword's combo that is to come, 21:42: "let's have the
// three hits count for things like "of power" to quickly get to max power".
//
// Read back to him: one stack for each blow that lands, however many enemies that one blow
// catches (a slam into five skeletons is one stack, not five); so what hits many times builds it
// fast (each turn of a whirlwind, each bite of a beam, each arrow of a volley that lands on
// something); five stacks at the most, five seconds, kept up by every blow that lands. "of
// Swiftness" is left as it was: a burst of speed after each use, hit or miss.
//
// Until then it was a stack for each use: a hero could swing at the air before a fight and walk
// in at full might, and an attack used once every five seconds never got past the first stack.
//   run: tsx --test tests/power.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { CLASSES, SKILLS, TUNE, WORDS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import type { ClassId, WeaponKind, WordId } from '../src/game/types';

const DT = 1 / 60;

type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The practice room, empty, the hero in the middle facing +x, carrying a weapon of that kind. Level 10: two word slots a side. */
function room(cls: ClassId, weapon: WeaponKind = CLASSES[cls].starts, seed = 3): Game {
  const g = Game.forPractice(cls, seed);
  if (g.weapon() !== weapon) {
    const i = g.hero.bag.findIndex((it) => it !== null && it.weapon === weapon);
    assert.ok(i >= 0, `a ${weapon} is in the bag`);
    assert.equal(g.equipFromBag(i), null, `the ${cls} puts on the ${weapon}`);
  }
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.level.props.length = 0;
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

/** Put words behind ability `i`. */
function behind(g: Game, i: number, ...words: WordId[]): void {
  for (const w of words) assert.equal(g.socket(i, 'behind', w), null, `${w} goes behind ${g.hero.skills[i].r.name}`);
}

/** How many stacks of might the hero holds, counted in the stacks ability `i` gives. */
const stacks = (g: Game, i: number): number => Math.round(g.hero.might / g.hero.skills[i].r.might);

/** Everything the game said while it ran for `seconds` with these controls (buttons are let go after the first step). */
function run(g: Game, c: Controls, seconds: number, each?: () => void): GameEvent[] {
  const out: GameEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    c.fire = false;
    c.cast = false;
    c.evade = false;
    for (const e of g.events) out.push(e);
    g.events.length = 0;
    each?.();
  }
  return out;
}

/**
 * One use of ability `i` (0 the quick attack, 1 the slow one, 2 the evasive move), aimed `dx`, `dy`
 * from the hero: the button is held until the use is made (a weapon has its rhythm: a swing asked
 * for too soon after the last waits its turn), and then `seconds` are given for it to do what it does.
 */
function use(g: Game, i: number, dx: number, dy: number, seconds = 0.9): GameEvent[] {
  const h = g.hero;
  const c = emptyControls();
  c.aimX = c.castX = c.evadeX = h.x + dx;
  c.aimY = c.castY = c.evadeY = h.y + dy;
  const before = h.skills[i].uses;
  const out: GameEvent[] = [];
  for (let k = 0; k < 120 && h.skills[i].uses === before; k++) {
    if (i === 0) c.fire = true;
    else if (i === 1) c.cast = true;
    else c.evade = true;
    g.update(DT, c);
    for (const e of g.events) out.push(e);
    g.events.length = 0;
  }
  assert.equal(h.skills[i].uses, before + 1, `${h.skills[i].r.name} was used`);
  c.fire = false;
  c.cast = false;
  c.evade = false;
  for (const e of run(g, c, seconds)) out.push(e);
  return out;
}

const mights = (ev: GameEvent[]): number[] => ev.filter((e): e is Extract<GameEvent, { t: 'buff' }> => e.t === 'buff' && e.kind === 'might').map((e) => e.stacks);
const hurt = (m: Monster): boolean => m.life < m.maxLife;

test('what the game says of the word: built by hits that land', () => {
  const g = room('warrior');
  behind(g, 0, 'power');
  assert.match(g.hero.skills[0].r.lines.join('\n'), /of Power: each hit that lands adds \+\d+% damage for 5 s \(up to 5 times\)\./);
  assert.match(WORDS.power.behindText, /hit that lands/);
});

test('a swing at the air builds nothing; a swing that lands builds a stack; five at the most', () => {
  const g = room('warrior');
  const h = g.hero;
  behind(g, 0, 'power');
  assert.equal(h.skills[0].r.name, 'Strike of Power');
  // three swings at nothing
  for (let k = 0; k < 3; k++) {
    const ev = use(g, 0, 2, 0);
    assert.ok(ev.some((e) => e.t === 'swing'), 'the swing was made');
    assert.deepEqual(mights(ev), [], 'and gave no might');
  }
  assert.equal(h.skills[0].uses, 3);
  assert.equal(h.might, 0, 'nothing was hit, nothing was built');
  // now there is something to hit
  const m = dummy(g, 1.2, 0);
  const seenStacks: number[] = [];
  for (let k = 0; k < 7; k++) {
    use(g, 0, 1.2, 0);
    seenStacks.push(stacks(g, 0));
  }
  assert.ok(hurt(m));
  assert.deepEqual(seenStacks, [1, 2, 3, 4, 5, 5, 5], 'a stack for each swing that lands, five at the most');
  assert.ok(Math.abs(h.might - h.skills[0].r.might * 5) < 1e-9, 'five stacks of what the word gives');
});

test('one blow that catches several enemies is one stack', () => {
  // (a slam: the one-handed sword's slow attack)
  const g = room('warrior', 'sword');
  const h = g.hero;
  assert.equal(SKILLS[h.skills[1].id].kind, 'burst');
  behind(g, 1, 'power');
  const pack = [dummy(g, 1.3, 0), dummy(g, 1.7, 0.7), dummy(g, 1.7, -0.7), dummy(g, 0.9, 0.9), dummy(g, 0.9, -0.9)];
  const ev = use(g, 1, 1.4, 0);
  assert.ok(pack.every(hurt), 'all five were caught by it');
  assert.deepEqual(mights(ev), [1], 'one blow, one stack');
  assert.equal(stacks(g, 1), 1);
});

test('a wave that goes through several enemies is one stack, and the next wave is another', () => {
  const g = room('mage', 'staff');
  const h = g.hero;
  assert.equal(SKILLS[h.skills[0].id].kind, 'wave');
  behind(g, 0, 'power');
  const row = [dummy(g, 2, 0), dummy(g, 3.4, 0), dummy(g, 4.8, 0)];
  let ev = use(g, 0, 3, 0, 1.4);
  assert.ok(row.every(hurt), 'it went through all three');
  assert.deepEqual(mights(ev), [1], 'one wave, one stack');
  ev = use(g, 0, 3, 0, 1.4);
  assert.deepEqual(mights(ev), [2], 'the second wave, the second stack');
  // a wave sent the other way, at nothing
  ev = use(g, 0, -3, 0, 1.4);
  assert.deepEqual(mights(ev), [], 'a wave that meets nothing gives none');
  assert.equal(stacks(g, 0), 2);
});

test('a shot gives its stack when it lands, not when it is loosed', () => {
  const g = room('ranger');
  const h = g.hero;
  behind(g, 0, 'power');
  const m = dummy(g, 8, 0);
  const c = emptyControls();
  c.aimX = h.x + 8;
  c.aimY = h.y;
  c.fire = true;
  let loosedAt = -1;
  let builtAt = -1;
  let step = 0;
  run(g, c, 1.5, () => {
    step++;
    if (loosedAt < 0 && g.projectiles.some((p) => !p.hostile)) loosedAt = step;
    if (builtAt < 0 && h.might > 0) builtAt = step;
  });
  assert.ok(hurt(m));
  assert.ok(loosedAt > 0 && builtAt > loosedAt + 10, `the arrow was in the air for a while before the might came (loosed at step ${loosedAt}, might at step ${builtAt})`);
  assert.equal(stacks(g, 0), 1);
});

for (const [cls, weapon, kind] of [['mage', 'wand', 'beam'], ['warrior', 'greatsword', 'whirl']] as const) {
  test(`held, a ${kind === 'beam' ? 'beam' : 'whirlwind'} builds a stack with every ${kind === 'beam' ? 'bite' : 'turn'} that lands, and none while it meets nothing`, () => {
    // nothing in reach: it goes on, and builds nothing
    let g = room(cls, weapon);
    let h = g.hero;
    assert.equal(SKILLS[h.skills[1].id].kind, kind);
    behind(g, 1, 'power');
    const c = emptyControls();
    c.castX = h.x + 3;
    c.castY = h.y;
    c.cast = true;
    c.hold = true;
    let bites = 0;
    run(g, c, 1.2, () => { if (h.channel) bites = Math.max(bites, h.channel.bites); });
    assert.ok(bites >= 3, `it went on (${bites} ${kind === 'beam' ? 'bites' : 'turns'})`);
    assert.equal(h.might, 0, 'and built nothing: there was nothing to hit');
    // something in reach: a stack for every one that lands, until there are five
    g = room(cls, weapon);
    h = g.hero;
    behind(g, 1, 'power');
    const m = dummy(g, kind === 'beam' ? 3 : 1.2, 0);
    const c2 = emptyControls();
    c2.castX = h.x + 3;
    c2.castY = h.y;
    c2.cast = true;
    c2.hold = true;
    const seen: [number, number][] = [];
    run(g, c2, 1.6, () => { if (h.channel) seen.push([h.channel.bites, stacks(g, 1)]); });
    assert.ok(hurt(m));
    assert.ok(seen.length > 0 && seen[seen.length - 1][0] >= 5, `it bit at least five times (${seen.length ? seen[seen.length - 1][0] : 0})`);
    for (const [n, st] of seen) assert.equal(st, Math.min(5, n), `after ${n} that landed, ${Math.min(5, n)} stacks`);
  });
}

test('a volley: the arrows that land on an enemy each build a stack; before they come down, and where they land on nothing, there is none', () => {
  // on an enemy
  let g = room('ranger');
  let h = g.hero;
  assert.equal(SKILLS[h.skills[1].id].kind, 'volley');
  behind(g, 1, 'power');
  const m = dummy(g, 5, 0);
  const c = emptyControls();
  c.castX = h.x + 5;
  c.castY = h.y;
  c.cast = true;
  let most = 0;
  let firstFall = -1;
  let firstMight = -1;
  let t = 0;
  const ev = run(g, c, SKILLS.volley.windup + TUNE.volleyDelay + TUNE.volleyLife + 0.5, () => {
    t += DT;
    most = Math.max(most, stacks(g, 1));
    if (firstMight < 0 && h.might > 0) firstMight = t;
  });
  const falls = ev.filter((e): e is Extract<GameEvent, { t: 'volleyFall' }> => e.t === 'volleyFall');
  const landed = falls.filter((e) => e.hits > 0).length;
  firstFall = SKILLS.volley.windup + TUNE.volleyDelay;
  assert.ok(hurt(m) && landed >= 3, `several arrows landed on it (${landed})`);
  assert.ok(falls.length > landed, 'and several on the floor beside it');
  // (the game says so for every blow that lands: 1, 2, 3, 4, 5, and 5 again for each that keeps it up)
  assert.deepEqual(mights(ev), Array.from({ length: landed }, (_, k) => Math.min(5, k + 1)), 'a stack for each arrow that landed on it, until there were five');
  assert.equal(most, Math.min(5, landed));
  assert.ok(firstMight >= firstFall - DT, `no might while the arrows were still in the air (the first at ${firstMight.toFixed(2)} s; they come down from ${firstFall.toFixed(2)} s)`);
  // on empty floor
  g = room('ranger');
  h = g.hero;
  behind(g, 1, 'power');
  const far = dummy(g, -6, 0);
  const c2 = emptyControls();
  c2.castX = h.x + 5;
  c2.castY = h.y;
  c2.cast = true;
  const ev2 = run(g, c2, SKILLS.volley.windup + TUNE.volleyDelay + TUNE.volleyLife + 0.5);
  assert.ok(ev2.some((e) => e.t === 'volleyFall') && !hurt(far));
  assert.deepEqual(mights(ev2), [], 'a rain on empty floor builds nothing');
  assert.equal(h.might, 0);
});

test('the swipes: a trap gives its stack when it bursts on something; a warp, when it arrives beside something', () => {
  // the ranger's roll leaves a trap: laying it is not a hit
  const g = room('ranger');
  const h = g.hero;
  behind(g, 2, 'power');
  let ev = use(g, 2, -3, 0, 0.6);
  assert.equal(g.traps.length, 1, 'a trap lies where the ranger stood');
  assert.deepEqual(mights(ev), [], 'laying it builds nothing');
  // something steps on it
  const m = dummy(g, 0, 0);
  m.x = g.traps[0].x + 0.4;
  m.y = g.traps[0].y;
  ev = run(g, emptyControls(), 0.5);
  assert.ok(hurt(m) && g.traps.length === 0, 'it bursts');
  assert.deepEqual(mights(ev), [1], 'and that is the blow that lands');
  // the mage's warp: into empty floor, nothing; beside an enemy, a stack
  const w = room('mage');
  behind(w, 2, 'power');
  ev = use(w, 2, 4, 0, 0.5);
  assert.equal(w.hero.skills[2].uses, 1);
  assert.deepEqual(mights(ev), [], 'a warp onto empty floor builds nothing');
  for (const k of w.hero.skills) {
    k.charges = k.maxCharges;
    k.cd = 0;
  }
  const beside = dummy(w, 4.8, 0);
  ev = use(w, 2, 4, 0, 0.5);
  assert.ok(hurt(beside));
  assert.deepEqual(mights(ev), [1], 'a warp that arrives beside an enemy hits it, and builds a stack');
});

test('it lasts five seconds from the last blow that landed, and a swing at the air does not keep it up', () => {
  const g = room('warrior');
  const h = g.hero;
  behind(g, 0, 'power');
  const m = dummy(g, 1.2, 0);
  // (the swing that lands: the moment it does is the moment the five seconds begin)
  const c = emptyControls();
  c.aimX = h.x + 1.2;
  c.aimY = h.y;
  c.fire = true;
  let t = 0;
  let landedAt = -1;
  run(g, c, 0.6, () => {
    t += DT;
    if (landedAt < 0 && h.might > 0) landedAt = t;
  });
  assert.ok(landedAt > 0 && stacks(g, 0) === 1, 'the swing landed, and built a stack');
  // the enemy is gone; the warrior goes on swinging at the air, as fast as the sword allows
  m.dead = true;
  let gone = -1;
  c.fire = true;
  for (let k = 0; k < 420 && gone < 0; k++) {
    c.fire = true;
    g.update(DT, c);
    g.events.length = 0;
    t += DT;
    if (h.might === 0) gone = t;
  }
  assert.ok(h.skills[0].uses >= 5, `they swung on (${h.skills[0].uses} swings)`);
  assert.ok(gone > 0 && Math.abs(gone - landedAt - 5) < 0.05, `the might ran out five seconds after the blow that landed (${(gone - landedAt).toFixed(2)} s)`);
});

test('"of Echoes" beside it: the echo\'s blow lands too, and builds a stack of its own', () => {
  const g = room('warrior');
  behind(g, 0, 'power', 'twin');
  assert.equal(g.hero.skills[0].r.name, 'Strike of Power and Echoes');
  dummy(g, 1.2, 0);
  const ev = use(g, 0, 1.2, 0, 1.6);
  assert.ok(ev.some((e) => e.t === 'swing' && e.echo === true), 'the echo cut');
  assert.deepEqual(mights(ev), [1, 2], 'the blow, and its echo');
});

test('"of Swiftness" is as it was: a burst of speed after each use, hit or miss', () => {
  const g = room('warrior');
  const h = g.hero;
  behind(g, 0, 'swift');
  const ev = use(g, 0, 2, 0, 0.5);
  assert.ok(ev.some((e) => e.t === 'buff' && e.kind === 'haste'), 'a swing at the air still gives the speed');
  assert.ok(h.hasteT > 0 && h.haste > 0);
});
