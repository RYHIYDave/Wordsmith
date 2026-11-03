// THE WARLOCK'S RULES (game/warlock.ts): his design, the owner's, 25 Oct 2026 (in the art chat): “I was thinking tap does a
// single target shot that hits an enemy and does a relatively strong DOT.  The tap and hold is an AOE that curses all enemies
// with a smaller DOT.  If a cursed enemy dies, it spreads all DOTs to other enemies in range.  So the play pattern is: try to
// get the tap DOT to spread via the curse.”; “I like smoke step, and we can have that apply the curse as well”; the pact
// meter, full, “then you tap on the warlock and he transforms”; the demon's claw rakes cursing, Damning cashing in every
// burn, its violent smoke step; “Meter runs dry (Recommended)”, “Burns out (Recommended)”.
//   run: tsx --test tests/warlock.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { SKILLS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { DEMON_KIT, WARLOCK, WARLOCK_TUNE, playableClasses } from '../src/game/warlock';
import { land } from './helpers';

const DT = 1 / 60;
type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

function room(seed = 3): Game {
  const g = Game.forPractice('warlock', seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
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
const hurt = (m: Monster): number => m.maxLife - m.life;
function wait(g: Game, seconds: number, c: Controls = emptyControls()): GameEvent[] {
  const ev: GameEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  }
  return ev;
}
function attack(g: Game, skill: 0 | 1, dx: number, dy: number): GameEvent[] {
  const h = g.hero;
  const c = emptyControls();
  c.aimX = c.castX = h.x + dx;
  c.aimY = c.castY = h.y + dy;
  if (skill === 0) c.fire = true;
  else c.cast = true;
  const ev: GameEvent[] = [];
  const take = (): void => {
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  };
  g.update(DT, c);
  c.fire = false;
  c.cast = false;
  take();
  land(g, c, DT, take);
  return ev;
}
function ready(g: Game): void {
  for (const s of g.hero.skills) {
    s.charges = s.maxCharges;
    s.cd = 0;
  }
  g.hero.swingT = 0;
  g.hero.mana = g.hero.d.maxMana;
}
function swipe(g: Game, dx: number, dy: number): GameEvent[] {
  const c = emptyControls();
  c.evade = true;
  c.evadeX = g.hero.x + dx;
  c.evadeY = g.hero.y + dy;
  g.update(DT, c);
  const ev = [...g.events];
  g.events.length = 0;
  return ev.concat(wait(g, 0.6));
}
function fillPact(g: Game): void {
  g.hero.pact = WARLOCK_TUNE.pact.full;
}
function tapHim(g: Game): GameEvent[] {
  const c = emptyControls();
  c.change = true;
  g.update(DT, c);
  const ev = [...g.events];
  g.events.length = 0;
  return ev;
}

test('he is not offered yet: the class cards hold the three until the switch is on', () => {
  assert.equal(WARLOCK.on, false);
  assert.deepEqual([...playableClasses()], ['warrior', 'ranger', 'mage']);
  WARLOCK.on = true;
  assert.deepEqual([...playableClasses()], ['warrior', 'ranger', 'mage', 'warlock']);
  WARLOCK.on = false;
});

test('a new warlock: a man, his pact empty, the Hellfire Bolt, the Curse and the Smoke Step', () => {
  const g = room();
  assert.equal(g.hero.form, 'man');
  assert.equal(g.hero.pact, 0);
  assert.deepEqual(g.hero.skills.map((s) => s.id), ['hellbolt', 'curse', 'smokestep']);
});

test('his attacks grow with Strength and Intelligence alike', () => {
  const g = room();
  const r0 = g.hero.skills[0].r.dmgMult;
  g.hero.attrs.str += 10;
  g.refresh();
  const r1 = g.hero.skills[0].r.dmgMult;
  g.hero.attrs.int += 10;
  g.refresh();
  const r2 = g.hero.skills[0].r.dmgMult;
  assert.ok(r1 > r0 && r2 > r1);
  assert.ok(Math.abs(r1 - r0 - (r2 - r1)) < 1e-9, 'a point of either is as good as a point of the other');
});

test('the Hellfire Bolt sets what it hits burning in his hellfire, which goes on hurting it', () => {
  const g = room();
  const m = dummy(g, 4, 0);
  const ev = attack(g, 0, 4, 0);
  wait(g, 0.5);
  assert.ok((m.hellT ?? 0) > 0, 'it burns');
  assert.ok(ev.some((e) => e.t === 'hellOn') || hurt(m) > 0);
  const after = hurt(m);
  wait(g, 2);
  assert.ok(hurt(m) > after, 'and goes on burning');
  wait(g, WARLOCK_TUNE.hell.secs + 1);
  const done = hurt(m);
  wait(g, 1);
  assert.equal(hurt(m), done, 'until its time is up');
});

test('the Curse strikes and curses every enemy near him he can see, and none further off', () => {
  const g = room();
  const near = [dummy(g, 2, 0), dummy(g, -2, 1), dummy(g, 0, -3)];
  const far = dummy(g, 0, SKILLS.curse.radius + 2);
  const ev = attack(g, 1, 1, 0);
  for (const m of near) assert.ok((m.curseT ?? 0) > 0 && hurt(m) > 0, 'cursed and struck');
  assert.ok(!((far.curseT ?? 0) > 0), 'out of reach');
  const cast = ev.find((e) => e.t === 'curse');
  assert.ok(cast && cast.t === 'curse' && cast.to.length === 3, 'its chains go to the three');
  const before = near.map(hurt);
  wait(g, 2);
  near.forEach((m, k) => assert.ok(hurt(m) > before[k], 'the cursed smoulder'));
});

test('a cursed one that dies spreads every burn on it to those near it', () => {
  const g = room();
  const a = dummy(g, 3, 0);
  const b = dummy(g, 4.5, 1);
  attack(g, 1, 1, 0); // cursed, both
  wait(g, 0.5); // (the curse's follow-through seen out)
  ready(g);
  attack(g, 0, 3, 0); // a burns in hellfire
  wait(g, 0.3);
  assert.ok(!a.dead && (a.hellT ?? 0) > 0 && (a.curseT ?? 0) > 0, 'cursed and burning');
  assert.ok(!((b.hellT ?? 0) > 0), 'the other has no hellfire on it yet');
  const ev: GameEvent[] = [];
  a.life = 1;
  ev.push(...wait(g, 1));
  assert.ok(a.dead, 'it dies');
  assert.ok((b.hellT ?? 0) > 0, 'and its hellfire has leapt to the other');
  assert.ok(ev.some((e) => e.t === 'spread'));
});

test('the Smoke Step streaks him to the spot, nothing harms him on the way, and whoever he passes through is cursed', () => {
  const g = room();
  const m = dummy(g, 3, 0);
  const x0 = g.hero.x;
  const ev = swipe(g, 6, 0);
  assert.ok(ev.some((e) => e.t === 'smoke'));
  assert.ok(g.hero.x > x0 + 5, 'he is over there');
  assert.ok((m.curseT ?? 0) > 0, 'what he passed through is cursed');
});

test('his hits fill his pact; full, it is said once, and a tap on him changes him into the demon', () => {
  const g = room();
  dummy(g, 3, 0);
  let told = 0;
  for (let k = 0; k < WARLOCK_TUNE.pact.full + 5; k++) {
    ready(g);
    told += attack(g, 0, 3, 0).filter((e) => e.t === 'pactFull').length;
    told += wait(g, 0.6).filter((e) => e.t === 'pactFull').length;
  }
  assert.equal(g.hero.pact, WARLOCK_TUNE.pact.full);
  assert.equal(told, 1, 'said once');
  const ev = tapHim(g);
  assert.ok(ev.some((e) => e.t === 'change' && e.to === 'demon'));
  assert.ok(g.hero.change, 'changing');
});

test('a tap on him with his pact short of full does nothing', () => {
  const g = room();
  g.hero.pact = WARLOCK_TUNE.pact.full - 1;
  tapHim(g);
  assert.ok(!g.hero.change);
  assert.equal(g.hero.form, 'man');
});

test('changing, nothing harms him and he does nothing else; then he is the demon, with the demon\'s three, and it roars', () => {
  const g = room();
  const m = dummy(g, 1.5, 0);
  fillPact(g);
  tapHim(g);
  const life = g.hero.life;
  g.hurtHero(1000, 'phys', [], m);
  assert.equal(g.hero.life, life, 'nothing harms him');
  const c = emptyControls();
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  const ev = wait(g, WARLOCK_TUNE.change.secs + 0.1, c);
  assert.equal(g.hero.form, 'demon');
  assert.deepEqual(g.hero.skills.map((s) => s.id), [...DEMON_KIT]);
  assert.ok(ev.some((e) => e.t === 'roar'));
});

test('the words stay in their places: what was on the bolt is on the rakes', () => {
  const g = room();
  g.hero.skills[0].front[0] = 'power';
  g.refresh();
  fillPact(g);
  tapHim(g);
  wait(g, WARLOCK_TUNE.change.secs + 0.1);
  assert.equal(g.hero.skills[0].id, 'rake');
  assert.equal(g.hero.skills[0].front[0], 'power');
});

test('the demon\'s rakes curse what they tear', () => {
  const g = room();
  fillPact(g);
  tapHim(g);
  wait(g, WARLOCK_TUNE.change.secs + 0.1);
  const m = dummy(g, 1.5, 0);
  ready(g);
  attack(g, 0, 1.5, 0);
  assert.ok(hurt(m) > 0 && (m.curseT ?? 0) > 0);
});

test('Damning: every cursed or burning enemy near it is struck, every burn on it paid at once; one that burns not, untouched', () => {
  const g = room();
  const cursed = dummy(g, 2, 0);
  const plain = dummy(g, -4, 0);
  fillPact(g);
  tapHim(g);
  wait(g, WARLOCK_TUNE.change.secs + 0.1);
  cursed.curseT = 6;
  cursed.curseDps = 50;
  plain.curseT = 0;
  plain.hellT = 0;
  plain.burnT = 0;
  const before = hurt(cursed);
  ready(g);
  const ev = attack(g, 1, 1, 0);
  assert.ok(ev.some((e) => e.t === 'damning'));
  assert.ok(hurt(cursed) - before >= 50 * 5, 'the curse still to come, paid now');
  assert.ok(!((cursed.curseT ?? 0) > 0), 'and spent');
  assert.equal(hurt(plain), 0, 'the one that burns not is untouched');
});

test('as the demon the pact runs dry, and empty, it burns out and he is a man again', () => {
  const g = room();
  fillPact(g);
  tapHim(g);
  wait(g, WARLOCK_TUNE.change.secs + 0.1);
  assert.equal(g.hero.form, 'demon');
  const ev = wait(g, WARLOCK_TUNE.pact.demonSecs + 0.5);
  assert.ok(ev.some((e) => e.t === 'change' && e.to === 'man'), 'it burns out');
  wait(g, WARLOCK_TUNE.burnOut.secs + 0.1);
  assert.equal(g.hero.form, 'man');
  assert.equal(g.hero.pact, 0);
  assert.deepEqual(g.hero.skills.map((s) => s.id), ['hellbolt', 'curse', 'smokestep']);
});

test('the demon\'s smoke step rakes and curses whoever it passes through and bursts out at the end', () => {
  const g = room();
  fillPact(g);
  tapHim(g);
  wait(g, WARLOCK_TUNE.change.secs + 0.1);
  const m = dummy(g, 3, 0.2);
  const end = dummy(g, 6.6, 0);
  ready(g);
  swipe(g, 6, 0);
  assert.ok(hurt(m) > 0 && (m.curseT ?? 0) > 0, 'the one passed through');
  assert.ok(hurt(end) > 0, 'the one where it bursts out');
});
