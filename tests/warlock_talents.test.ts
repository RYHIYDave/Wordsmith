// HIS TREE AT WORK (game/talents.ts, the Warlock's claw; game/game.ts, "HIS TREE"): the owner's “Yes, keep it (Recommended)”, 28
// Oct 2026, to the tree as drawn; each talent here doing what its card says.
//   run: tsx --test tests/warlock_talents.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { WARLOCK_TUNE } from '../src/game/warlock';
import { TREES } from '../src/game/talents';
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

/** Talents taken (the switch is on in the game: TALENTS). */
function take(g: Game, ...ids: string[]): Game {
  g.hero.talents = ids;
  g.refresh();
  return g;
}
/** As the demon, its pact full. */
function demon(g: Game): Game {
  g.hero.form = 'demon';
  g.hero.pact = WARLOCK_TUNE.pact.full;
  g.refresh();
  return g;
}
/** One made to die at the next touch. */
function weak(m: Monster): Monster {
  m.life = 1;
  return m;
}
/** His tap at it and on till the bolt has flown, or the demon's rake. */
function bolt(g: Game, dx: number, dy: number, after = 0.8): GameEvent[] {
  ready(g);
  return attack(g, 0, dx, dy).concat(wait(g, after));
}
const T = WARLOCK_TUNE.talents;
const P = WARLOCK_TUNE.pact;

test('his tree: all fifteen talents made to work', () => {
  assert.deepEqual(TREES.warlock.talents.filter((t) => !t.works).map((t) => t.id), []);
});

test('PHANTOM STEP: his Smoke Step leaves his shadow where he stood: for two seconds the enemies go after it instead of him', () => {
  const g = take(room(), 'phantomstep');
  const m = dummy(g, 2.5, 1.5);
  m.speed = 2;
  m.cd = 0.4;
  m.state = 'chase';
  const x0 = g.hero.x;
  const y0 = g.hero.y;
  const ev = swipe(g, -5, 0);
  assert.ok(ev.some((e) => e.t === 'phantom'), 'his shadow');
  assert.equal(g.decoys.length, 1);
  const life = g.hero.life;
  const ev2 = wait(g, 1.2);
  assert.ok(Math.hypot(m.x - x0, m.y - y0) < Math.hypot(m.x - g.hero.x, m.y - g.hero.y), 'it goes to the shadow, not to him');
  assert.equal(g.hero.life, life, 'nothing reaches him');
  assert.ok(ev2.some((e) => e.t === 'decoyStruck'), 'it swings at the shadow');
  wait(g, 1);
  assert.equal(g.decoys.length, 0, 'two seconds, and it is gone');
  // (without it: no shadow)
  const n = room();
  dummy(n, 2.5, 1.5);
  assert.ok(!swipe(n, -5, 0).some((e) => e.t === 'phantom'));
});

test('HUNGER: every kill the demon makes puts two seconds back on its pact', () => {
  const g = demon(take(room(), 'hunger'));
  weak(dummy(g, 1.2, 0));
  g.hero.pact = 10;
  bolt(g, 1.2, 0, 0.05);
  const per = P.full / P.demonSecs;
  assert.ok(Math.abs((g.hero.pact ?? 0) - (10 + T.hunger.secs * per)) < per * 0.3, `pact ${g.hero.pact}`);
  // (without it: only the drain)
  const n = demon(room());
  weak(dummy(n, 1.2, 0));
  n.hero.pact = 10;
  bolt(n, 1.2, 0, 0.05);
  assert.ok((n.hero.pact ?? 0) < 10.5);
});

test('TERRIBLE ROAR: the change\'s roar curses all it throws back, and they run from him for two seconds', () => {
  const g = take(room(), 'terribleroar');
  const m = dummy(g, 1.5, 0);
  m.speed = 2;
  const far = dummy(g, 6, 0);
  g.hero.pact = P.full;
  tapHim(g);
  wait(g, WARLOCK_TUNE.change.secs + 0.05);
  assert.equal(g.hero.form, 'demon');
  assert.ok((m.curseT ?? 0) > 0, 'cursed');
  assert.ok((m.fleeT ?? 0) > 1.5, 'running');
  assert.equal(far.curseT ?? 0, 0, 'not one out of its reach');
  const d0 = Math.hypot(m.x - g.hero.x, m.y - g.hero.y);
  wait(g, 0.5);
  assert.ok(Math.hypot(m.x - g.hero.x, m.y - g.hero.y) > d0 + 0.3, 'away from him');
  wait(g, 2);
  assert.equal(m.fleeT, 0, 'two seconds');
});

test('FEAST: every kill the demon makes heals him a tenth of his life', () => {
  const g = demon(take(room(), 'feast'));
  weak(dummy(g, 1.2, 0));
  g.hero.life = 10;
  bolt(g, 1.2, 0, 0.05);
  assert.ok(Math.abs(g.hero.life - (10 + g.hero.d.maxLife * T.feast.share)) < 2, `life ${g.hero.life}`);
});

test('BLOODLUST: every kill makes the demon\'s rakes quicker, up to twice as quick, till it burns out', () => {
  const g = demon(take(room(), 'bloodlust'));
  const post = dummy(g, 1.2, 0);
  // (the time to his next rake, as a press of his tap sets it)
  const gap = (): number => {
    ready(g);
    const c = emptyControls();
    c.aimX = g.hero.x + 1.2;
    c.aimY = g.hero.y;
    c.fire = true;
    g.update(DT, c);
    const t = g.hero.swingT;
    wait(g, 0.8);
    return t;
  };
  const at0 = gap();
  g.monsters.splice(g.monsters.indexOf(post), 1);
  for (let k = 0; k < 3; k++) weak(dummy(g, 1.2, 0));
  for (let k = 0; k < 5; k++) bolt(g, 1.2, 0, 0.3);
  const n = g.hero.lust ?? 0;
  assert.ok(n >= 3, `kills ${n}`);
  g.monsters.push(post);
  const atN = gap();
  assert.ok(Math.abs(at0 / atN - (1 + n * T.bloodlust.each)) < 0.05, `quicker by a tenth a kill: ${at0} to ${atN}`);
  g.hero.lust = 50;
  assert.ok(Math.abs(at0 / gap() - T.bloodlust.most) < 0.05, 'no more than twice as quick');
  // (the demon burnt out and called up again: begun again)
  g.hero.pact = 0.01;
  wait(g, WARLOCK_TUNE.burnOut.secs + 0.5);
  assert.equal(g.hero.lust ?? 0, 0);
});

test('HELLWAVE: every third rake throws a wave of hellfire on ahead, through everything in its way, setting it burning', () => {
  const g = demon(take(room(), 'hellwave'));
  dummy(g, 1.2, 0);
  const a = dummy(g, 3.4, 0);
  const b = dummy(g, 4.6, 0.2);
  let ev: GameEvent[] = [];
  for (let k = 0; k < 2; k++) ev = ev.concat(bolt(g, 1.2, 0, 0.05));
  assert.ok(!ev.some((e) => e.t === 'hellwave'), 'not the first two');
  ev = bolt(g, 1.2, 0, 0.8);
  assert.ok(ev.some((e) => e.t === 'hellwave'), 'the third');
  assert.ok(hurt(a) > 0 && hurt(b) > 0, 'through both');
  assert.ok((a.hellT ?? 0) > 0 && (b.hellT ?? 0) > 0, 'burning');
});

test('DAMNED SOULS: every enemy the demon kills rises as a burning soul that flies into the nearest enemy, cursing it and setting it alight', () => {
  const g = demon(take(room(), 'damnedsouls'));
  weak(dummy(g, 1.2, 0));
  const next = dummy(g, 4, 1);
  dummy(g, 9, -3);
  const ev = bolt(g, 1.2, 0, 1.2);
  assert.ok(ev.some((e) => e.t === 'soul' && e.id === next.id), 'it goes for the nearest');
  assert.ok(ev.some((e) => e.t === 'soulIn'));
  assert.ok((next.curseT ?? 0) > 0 && (next.hellT ?? 0) > 0, 'cursed and burning');
});

test('BRANDED: every Hellfire Bolt curses what it hits', () => {
  const g = take(room(), 'branded');
  const m = dummy(g, 4, 0);
  bolt(g, 4, 0);
  assert.ok((m.curseT ?? 0) > 0 && (m.hellT ?? 0) > 0);
  const n = room();
  const m2 = dummy(n, 4, 0);
  bolt(n, 4, 0);
  assert.equal(m2.curseT ?? 0, 0, 'without it, not');
});

test('HEX CHAIN: a bolt that hits a cursed enemy leaps on to the next cursed one near it, up to three times, burning each', () => {
  const g = take(room(), 'hexchain');
  const first = dummy(g, 4, 0);
  const ring = [dummy(g, 6, 0.5), dummy(g, 7.5, -0.5), dummy(g, 9, 0.4), dummy(g, 10.5, 0)];
  const clean = dummy(g, 4.5, 2.5);
  for (const m of [first, ...ring]) m.curseT = 5;
  const ev = bolt(g, 4, 0, 1.2);
  assert.equal(ev.filter((e) => e.t === 'hexLeap').length, 3, 'three leaps');
  for (const m of ring.slice(0, 3)) assert.ok(hurt(m) > 0 && (m.hellT ?? 0) > 0, 'each struck and burning');
  assert.equal(hurt(ring[3]), 0, 'no fourth');
  assert.equal(hurt(clean), 0, 'never to one not cursed');
});

test('WITHERING: cursed enemies move and strike at half speed', () => {
  const g = take(room(), 'withering');
  const m = dummy(g, 6, 0);
  m.speed = 2;
  m.cd = 2;
  m.curseT = 30;
  const x0 = m.x;
  wait(g, 0.5);
  const went = x0 - m.x;
  const cd = m.cd;
  const n = room();
  const o = dummy(n, 6, 0);
  o.speed = 2;
  o.cd = 2;
  o.curseT = 30;
  const y0 = o.x;
  wait(n, 0.5);
  assert.ok(went > 0 && Math.abs(went - (y0 - o.x) / 2) < 0.08, `half the way: ${went} to ${y0 - o.x}`);
  assert.ok(Math.abs((2 - cd) - (2 - o.cd) / 2) < 0.05, 'and half as soon ready to strike');
});

test('PYRE: a cursed enemy that dies bursts in hellfire, striking everything near it', () => {
  const g = take(room(), 'pyre');
  const m = weak(dummy(g, 4, 0));
  m.curseT = 5;
  const near = dummy(g, 4.8, 0.6);
  const far = dummy(g, 8, 0);
  const ev = bolt(g, 4, 0, 1);
  assert.ok(ev.some((e) => e.t === 'pyre'));
  assert.ok(hurt(near) > 0, 'the one by it');
  assert.equal(hurt(far), 0, 'not one far off');
});

test('BOUND DEMON: his pact full, a tap on him tears the demon out at his side; he stays a man; it rakes and curses what is near till the pact runs dry, then burns out', () => {
  const g = take(room(), 'bounddemon');
  const m = dummy(g, 2.5, 0);
  g.hero.pact = P.full;
  const ev = tapHim(g);
  assert.ok(g.bound, 'out');
  assert.ok(ev.some((e) => e.t === 'bound'));
  assert.equal(g.hero.form ?? 'man', 'man');
  assert.equal(g.hero.change ?? null, null, 'no change');
  const ev2 = wait(g, 3);
  assert.ok(ev2.some((e) => e.t === 'boundRake'), 'it rakes');
  assert.ok(hurt(m) > 0 && (m.curseT ?? 0) > 0, 'struck and cursed');
  assert.ok((g.hero.pact ?? 0) < P.full - 1, 'the pact running dry');
  // (he fights on: his bolts do not fill it meanwhile)
  const p = g.hero.pact ?? 0;
  bolt(g, 2.5, 0);
  assert.ok((g.hero.pact ?? 0) <= p + 0.3);
  const ev3 = wait(g, P.demonSecs + 2);
  assert.ok(ev3.some((e) => e.t === 'boundOut'), 'burns out');
  assert.equal(g.bound, null);
  assert.equal(g.hero.pact, 0);
});

test('BLAZING ARM: while his pact is full and he has not changed, every Hellfire Bolt bursts, cursing and burning all near it', () => {
  const g = take(room(), 'blazingarm');
  const m = dummy(g, 4, 0);
  const near = dummy(g, 4.6, 0.8);
  g.hero.pact = P.full;
  const ev = bolt(g, 4, 0);
  assert.ok(ev.some((e) => e.t === 'blaze'));
  assert.ok(hurt(near) > 0 && (near.curseT ?? 0) > 0 && (near.hellT ?? 0) > 0);
  assert.ok(hurt(m) > 0);
  // (not full: no burst)
  const n = take(room(), 'blazingarm');
  dummy(n, 4, 0);
  const near2 = dummy(n, 4.6, 0.8);
  n.hero.pact = 5;
  bolt(n, 4, 0);
  assert.equal(hurt(near2), 0);
});

test('SOUL DEBT: every cursed enemy that dies fills a tenth of his pact', () => {
  const g = take(room(), 'souldebt');
  const m = weak(dummy(g, 4, 0));
  m.curseT = 5;
  g.hero.pact = 0;
  bolt(g, 4, 0);
  // (the bolt's own hit fills one; the death of a cursed one three)
  assert.ok(Math.abs((g.hero.pact ?? 0) - (P.hit + P.full * T.soulDebt.share)) < 0.01, `pact ${g.hero.pact}`);
});

test('LAST RITES: as the demon burns out, Damning goes off by itself on every cursed or burning enemy near him', () => {
  const g = demon(take(room(), 'lastrites'));
  const m = dummy(g, 2, 0);
  m.curseT = 5;
  m.curseDps = 3;
  const clean = dummy(g, -2, 0);
  g.hero.pact = 0.01;
  const ev = wait(g, 0.3);
  assert.ok(ev.some((e) => e.t === 'change' && e.to === 'man'));
  const d = ev.find((e) => e.t === 'damning');
  assert.ok(d && d.t === 'damning' && d.at.some((a) => a.id === m.id), 'it erupts under the cursed one');
  assert.ok(hurt(m) > 0);
  assert.equal(hurt(clean), 0, 'not the one with no burn on it');
});
