// THE TINKERER'S RULES (game/tinkerer.ts): her design, the owner's, 23 Oct 2026 (in the art chat): “She’s going to have
// minions.  I think she’ll set turrets on the ground that fire something.  Not an arrow or a bolt.  That’s the tap.  We’ll
// call those “Contraption”.  Tap and hold will be “Golem”.  And this is gonna be clockwork Automaton that follows her around
// and attacks.  It will just go around and I guess punch things or whatever but tap+hold will have him do a bigger move.”;
// “Lobbed vials (Recommended)”, “Ground pound (Recommended)”, “Cannon”, “Blast jump (Recommended)”; and to the main chat,
// 28 Oct: “Three at once (Recommended)”, “Always with her (Recommended)”; and by 16:31: “I think for her I’d like her to start
// with golem and a vial toss.  Then in the skill tree you can swap the vial toss to a contraption that throws the vials” (her
// tap the VIAL TOSS; the Contraption her tree's swap for it, CONTRAPTION, its tests here with it taken).
//   run: tsx --test tests/tinkerer.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { SKILLS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { TINKERER, TINKER_TUNE } from '../src/game/tinkerer';
import { playableClasses } from '../src/game/warlock';
import { land } from './helpers';

const DT = 1 / 60;
type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void; die: () => void };
const inner = (g: Game): Inner => g as unknown as Inner;
const C = TINKER_TUNE.contraption;
const G = TINKER_TUNE.golem;

function room(seed = 3): Game {
  const g = Game.forPractice('tinkerer', seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.events.length = 0;
  return g;
}
function dummy(g: Game, dx: number, dy: number, life = 1e7, awake = true): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', g.hero.x + dx, g.hero.y + dy, 1, 0, false, a.rng);
  if (awake) a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = life;
  return m;
}
const hurt = (m: Monster): number => m.maxLife - m.life;
/** Her tree's CONTRAPTION taken: her tap the Contraption, in place of the Vial Toss. */
function withContraption(g: Game): Game {
  g.hero.talents = ['bombsaway', 'fortune', 'contraptions'];
  g.refresh();
  return g;
}
function wait(g: Game, seconds: number, c: Controls = emptyControls()): GameEvent[] {
  const ev: GameEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += DT) {
    g.update(DT, c);
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  }
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
/** Her tap (0) or her tap and hold (1) at a spot `dx`, `dy` from her, landed. */
function use(g: Game, skill: 0 | 1, dx: number, dy: number): GameEvent[] {
  ready(g);
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
const standing = (g: Game): number => g.contraptions.filter((q) => q.broke < 0).length;

test('she is not offered yet: the class cards hold the others until her switch is on', () => {
  assert.equal(TINKERER.on, false);
  assert.ok(!playableClasses().includes('tinkerer'));
  TINKERER.on = true;
  assert.ok(playableClasses().includes('tinkerer'));
  TINKERER.on = false;
});

test('a new Tinkerer: the Vial Toss, the Golem and the Blast Jump; no Golem out yet', () => {
  const g = room();
  assert.deepEqual(g.hero.skills.map((s) => s.id), ['vialtoss', 'golem', 'blastjump']);
  assert.equal(g.golem, null);
  assert.equal(g.contraptions.length, 0);
});

test('her Vial Toss: a vial lobbed from her hand to where she aimed, no further than its throw, bursting where it comes down on all near it', () => {
  const g = room();
  const m = dummy(g, 4, 0);
  const side = dummy(g, 4, 0.8);
  const far = dummy(g, 4, 3);
  let ev = use(g, 0, 4, 0);
  const v = ev.find((e) => e.t === 'vial');
  assert.ok(v && v.t === 'vial' && v.id === -1, 'a vial, from her hand');
  assert.equal(g.contraptions.length, 0, 'no Contraption');
  ev = ev.concat(wait(g, TINKER_TUNE.toss.flight + 0.2));
  const b = ev.find((e) => e.t === 'vialBurst');
  assert.ok(b && b.t === 'vialBurst' && Math.abs(b.x - (g.hero.x + 4)) < 0.6 && Math.abs(b.y - g.hero.y) < 0.6, 'it bursts where she aimed');
  assert.ok(hurt(m) > 0 && hurt(side) > 0, 'on the one it lands on and the one beside');
  assert.equal(hurt(far), 0, 'not on one three tiles off');
  // (aimed far off, it stops at its range)
  ready(g);
  ev = use(g, 0, 20, 0);
  const v2 = ev.find((e) => e.t === 'vial');
  assert.ok(v2 && v2.t === 'vial' && Math.hypot(v2.x1 - v2.x0, v2.y1 - v2.y0) <= SKILLS.vialtoss.range + 0.01, 'no further than its throw');
});

test("her tree's CONTRAPTION swaps the Vial Toss for the Contraption; undone, she tosses vials again and her Contraptions fall apart", () => {
  const g = withContraption(room());
  assert.deepEqual(g.hero.skills.map((s) => s.id), ['contraption', 'golem', 'blastjump']);
  dummy(g, 6, 0);
  use(g, 0, 3, 0);
  assert.equal(g.contraptions.length, 1, 'her tap throws a Contraption');
  g.hero.talents = ['bombsaway', 'fortune'];
  g.refresh();
  assert.equal(g.hero.skills[0].id, 'vialtoss');
  const ev = wait(g, 0.2);
  assert.ok(ev.some((e) => e.t === 'contraptionEnd'), 'the one standing falls apart');
});

test('her abilities grow with Dexterity and Intelligence alike', () => {
  const g = room();
  const r0 = g.hero.skills[0].r.dmgMult;
  g.hero.attrs.dex += 10;
  g.refresh();
  const r1 = g.hero.skills[0].r.dmgMult;
  g.hero.attrs.int += 10;
  g.refresh();
  const r2 = g.hero.skills[0].r.dmgMult;
  assert.ok(r1 > r0 && r2 > r1);
  assert.ok(Math.abs(r1 - r0 - (r2 - r1)) < 1e-9, 'a point of either is as good as a point of the other');
});

test('her Contraption comes to rest where she aimed it, no further than its throw; set up, it lobs vials at the enemies awake within its reach, which burst on them', () => {
  const g = withContraption(room());
  const m = dummy(g, 6, 0);
  const sleeper = dummy(g, -3, 0, 1e7, false);
  use(g, 0, 3, 0);
  assert.equal(g.contraptions.length, 1);
  const c = g.contraptions[0];
  assert.ok(Math.abs(c.x - (g.hero.x + 3)) < 0.6 && Math.abs(c.y - g.hero.y) < 0.6, 'it lands where she aimed');
  let ev = wait(g, C.set - 0.1);
  assert.ok(!ev.some((e) => e.t === 'vial'), 'it does not fire before it is set up');
  ev = wait(g, 3);
  const vials = ev.filter((e) => e.t === 'vial');
  assert.ok(vials.length >= 2, 'set up, it lobs one every so often');
  assert.ok(ev.some((e) => e.t === 'vialBurst'));
  assert.ok(hurt(m) > 0, 'its vials burst on the one awake');
  assert.equal(hurt(sleeper), 0, 'and never wake a sleeper');
  // (thrown far, it stops at its range)
  ready(g);
  use(g, 0, 20, 0);
  const far = g.contraptions[g.contraptions.length - 1];
  assert.ok(Math.hypot(far.x - g.hero.x, far.y - g.hero.y) <= SKILLS.contraption.range + 0.6, 'no further than its throw');
});

test('three Contraptions at once: a fourth puts the oldest out of action, and each falls apart when its time is up', () => {
  const g = withContraption(room());
  dummy(g, 8, 0);
  for (let i = 0; i < 3; i++) use(g, 0, 2, i - 1);
  assert.equal(standing(g), 3);
  const first = g.contraptions[0].id;
  const ev = use(g, 0, 2, 2);
  assert.equal(standing(g), C.most, 'still three');
  assert.ok(ev.some((e) => e.t === 'contraptionEnd' && e.id === first), 'the oldest put out of action');
  wait(g, C.set + C.life + C.broke + 0.5);
  assert.equal(g.contraptions.length, 0, 'their time up, they fall apart and are gone');
});

test('her first tap and hold whistles her Golem out beside her; it stays with her, knuckling after her where she goes', () => {
  const g = room();
  const ev = use(g, 1, 3, 0);
  assert.ok(g.golem, 'it is out');
  assert.ok(ev.some((e) => e.t === 'golemArrive'));
  assert.ok(!ev.some((e) => e.t === 'golemPound'), 'the first whistle only brings it out');
  assert.ok(Math.hypot(g.golem!.x - g.hero.x, g.golem!.y - g.hero.y) < 2.5, 'beside her');
  // (she walks away: it follows)
  const c = emptyControls();
  c.mx = 1;
  wait(g, 2, c);
  wait(g, 2);
  assert.ok(g.golem && Math.hypot(g.golem.x - g.hero.x, g.golem.y - g.hero.y) < 3, 'it keeps near her');
  wait(g, 60);
  assert.ok(g.golem, 'always with her');
});

test('her Golem punches what is near it, and fires its cannon at what is further off', () => {
  const g = room();
  use(g, 1, 3, 0);
  wait(g, G.arrive + 0.1);
  const near = dummy(g, 1.5, 1.6);
  const ev1 = wait(g, 3);
  assert.ok(ev1.some((e) => e.t === 'golemPunch'), 'it punches');
  assert.ok(hurt(near) > 0);
  const g2 = room(5);
  use(g2, 1, 3, 0);
  wait(g2, G.arrive + 0.1);
  const far = dummy(g2, 6, 0);
  const ev2 = wait(g2, 3);
  assert.ok(ev2.some((e) => e.t === 'golemShot'), 'it fires its cannon');
  assert.ok(hurt(far) > 0);
});

test('each tap and hold after sets it on to ground pound, striking everything round its fist', () => {
  const g = room();
  use(g, 1, 3, 0);
  wait(g, G.arrive + 0.1);
  const gx = g.golem!.x;
  const gy = g.golem!.y;
  // (enemies round it that it cannot get at first: asleep, so it punches none of them before the pound)
  const round = [dummy(g, gx - g.hero.x + 1.2, gy - g.hero.y, 1e7, false), dummy(g, gx - g.hero.x, gy - g.hero.y + 1.3, 1e7, false)];
  const ev = use(g, 1, gx - g.hero.x + 1, gy - g.hero.y);
  const more = wait(g, G.pound.lead + G.pound.long);
  assert.ok(ev.concat(more).some((e) => e.t === 'golemPound'), 'it pounds');
  for (const m of round) assert.ok(hurt(m) > 0, 'what is round it is struck');
});

test('left far behind, her Golem is whistled up beside her again; when she falls, it winds down where it stands and is gone', () => {
  const g = room();
  use(g, 1, 3, 0);
  g.golem!.x = g.hero.x + G.lost + 2;
  const ev = wait(g, 0.2);
  assert.ok(ev.some((e) => e.t === 'golemArrive'));
  assert.ok(Math.hypot(g.golem!.x - g.hero.x, g.golem!.y - g.hero.y) < 2.5);
  // (the practice room only knocks the wind out of her: out of it, she falls)
  g.practice = false;
  g.hero.life = 1;
  g.hero.invuln = 0;
  inner(g).die();
  assert.equal(g.golem!.act, 'down', 'it winds down');
  assert.equal(g.over, true);
});

test('her Blast Jump carries her to the spot; what is by her is hurt and blown away, and nothing hurts her in the air', () => {
  const g = room();
  const by = dummy(g, 0.8, 0.3);
  const x0 = by.x;
  const y0 = by.y;
  const h = g.hero;
  const from = { x: h.x, y: h.y };
  const c = emptyControls();
  c.evade = true;
  c.evadeX = h.x - 5;
  c.evadeY = h.y;
  g.update(DT, c);
  const ev = [...g.events];
  g.events.length = 0;
  assert.ok(ev.some((e) => e.t === 'blastJump'));
  assert.ok(h.invuln > 0, 'nothing hurts her in the air');
  const rest = wait(g, TINKER_TUNE.blast.secs + 0.3);
  assert.ok(rest.some((e) => e.t === 'blastLand'));
  assert.ok(Math.abs(h.x - (from.x - 5)) < 0.3 && Math.abs(h.y - from.y) < 0.3, 'she comes down on the spot');
  assert.ok(hurt(by) > 0, 'what was by her is hurt');
  assert.ok(Math.hypot(by.x - x0, by.y - y0) > 0.5, 'and blown away');
});
