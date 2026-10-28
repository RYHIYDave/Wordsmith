// THE BRAWLER'S TREE (game/talents.ts BRAWLER_TREE, the owner's tree as drawn, 28 Oct 2026): each talent does what its card
// says, by the rules in game/game.ts ("THE BRAWLER'S TREE") and the numbers in game/brawler.ts (BRAWL_TUNE.talents). One test
// or more for every talent; his punches without talents: tests/brawler.test.ts.
//   run: tsx --test tests/brawler_talents.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { BRAWL_TUNE } from '../src/game/brawler';
import type { PunchName } from '../src/game/brawler';
import { HEAVY } from '../src/game/defs';
import { TREES } from '../src/game/talents';

const DT = 1 / 60;
const T = BRAWL_TUNE.talents;
type Inner = {
  rng: RNG;
  waveT: number;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  landPunch: (i: number, name: PunchName, ox: number, oy: number, dx: number, dy: number, frac: number) => number;
  tenderOf: (m: Monster) => number;
};
const inner = (g: Game): Inner => g as unknown as Inner;

/** The practice room, emptied, the hero at (14.5, 15.5) facing +x, with these talents (and words, ability and side), his blows always as hard (no criticals) and nothing blocked. */
function room(talents: string[] = [], words: [number, 'front' | 'behind', string][] = [], seed = 3): Game {
  const g = Game.forPractice('brawler', seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  for (const [i, side, w] of words) {
    h.words[w as 'heavy'] = (h.words[w as 'heavy'] ?? 0) + 1;
    assert.equal(g.socket(i, side, w as 'heavy'), null, `${w} goes ${side} of ability ${i}`);
  }
  h.talents = [...talents];
  g.refresh();
  steady(g);
  h.life = h.d.maxLife;
  h.invuln = 0;
  g.events.length = 0;
  return g;
}
/** His blows always the same (for comparing them), never a critical; nothing blocked. */
function steady(g: Game): void {
  const d = g.hero.d;
  d.dmgMin = d.dmgMax = 100;
  d.critChance = 0;
  d.stats.blockChance = 0;
  d.stats.stunChance = 0;
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
    c.fire = false;
    c.cast = false;
    c.evade = false;
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  }
  return ev;
}
/** A press, tap (false) or hold (true), at the one in front; then the time to see it land (long enough for the next to come in the same combo). */
function press(g: Game, hold: boolean, at: Monster | null, seconds = hold ? 0.75 : 0.62): GameEvent[] {
  const c = emptyControls();
  c.aimX = c.castX = at ? at.x : g.hero.x + 1;
  c.aimY = c.castY = at ? at.y : g.hero.y;
  if (hold) c.cast = true;
  else c.fire = true;
  return wait(g, seconds, c);
}
/** His slip, `dx` tiles along x, and the time to come up with his counter. */
function slip(g: Game, dx: number): GameEvent[] {
  const c = emptyControls();
  c.evade = true;
  c.evadeX = g.hero.x + dx;
  c.evadeY = g.hero.y;
  return wait(g, BRAWL_TUNE.slip.secs + 0.15, c);
}
const punches = (ev: GameEvent[]): string[] => ev.flatMap((e) => (e.t === 'punch' && e.n === 0 && !e.echo ? [e.name] : []));
/** The harm in each hit on monsters, in order. */
const blows = (ev: readonly GameEvent[]): number[] => ev.flatMap((e) => (e.t === 'hit' && !e.onHero ? [e.amount] : []));
/** A punch thrown straight from where he stands, at +x; the harm of each hit it made. */
function throwPunch(g: Game, name: PunchName): number[] {
  g.events.length = 0;
  inner(g).landPunch(name === 'cross' || name === 'body blow' || name === 'overhand' || name === 'haymaker' ? 1 : 0, name, g.hero.x, g.hero.y, 1, 0, 1);
  const b = blows(g.events);
  g.events.length = 0;
  return b;
}
const near = (a: number, b: number, within: number): boolean => Math.abs(a - b) <= within;

test('every talent of his tree is made to work; the tree is still a draft', () => {
  const tree = TREES.brawler;
  assert.equal(tree.talents.length, 15);
  for (const t of tree.talents) assert.equal(t.works, true, `${t.name} works`);
  assert.equal(tree.draft, true);
});

// ---- SPEED ----------------------------------------------------------------------------------------------------------

test('Double Jab: his jab is two quick jabs, and the combo goes on from the second', () => {
  const plain = room();
  const a = dummy(plain, 1.3, 0);
  const one = press(plain, false, a);
  assert.deepEqual(punches(one), ['jab']);
  const g = room(['doublejab']);
  const m = dummy(g, 1.3, 0);
  const ev = press(g, false, m);
  assert.deepEqual(punches(ev), ['jab', 'jab'], 'two jabs from one tap');
  assert.equal(blows(ev).length, 2, 'both land');
  assert.equal(blows(one).length, 1);
  assert.deepEqual(punches(press(g, false, m)), ['hook'], 'then the hook');
});

test('Tenderize: every punch he lands on the same enemy makes it take 5% more from him, up to 50%, until he hits another', () => {
  const g = room(['tenderize']);
  const a = dummy(g, 1.3, 0);
  const amounts = [0, 1, 2, 3].map(() => throwPunch(g, 'jab')[0]);
  for (let k = 1; k < 4; k++) assert.ok(near(amounts[k], amounts[0] * (1 + T.tenderize.each * k), 1), `punch ${k + 1}: ${amounts[k]} of ${amounts[0]}`);
  for (let k = 0; k < 20; k++) throwPunch(g, 'jab');
  assert.ok(near(inner(g).tenderOf(a), 1 + T.tenderize.most, 1e-9), 'no more than 50%');
  // (he hits another: it begins again on that one, and the first is as it was)
  a.x += 10;
  const b = dummy(g, 1.3, 0);
  const onB = throwPunch(g, 'jab')[0];
  assert.ok(near(onB, amounts[0], 1));
  assert.equal(inner(g).tenderOf(a), 1);
  assert.ok(near(inner(g).tenderOf(b), 1 + T.tenderize.each, 1e-9));
  // (without the talent, nothing grows)
  const p = room();
  dummy(p, 1.3, 0);
  const flat = [0, 1, 2].map(() => throwPunch(p, 'jab')[0]);
  assert.equal(flat[2], flat[0]);
});

test('Heavy Hands: Heavy no longer slows his taps (it still hits harder)', () => {
  const windOf = (g: Game): number => {
    const c = emptyControls();
    c.fire = true;
    c.aimX = g.hero.x + 1;
    c.aimY = g.hero.y;
    g.update(DT, c);
    return g.hero.attackWind;
  };
  const plain = windOf(room());
  const heavy = windOf(room([], [[0, 'front', 'heavy']]));
  const hands = room(['heavyhands'], [[0, 'front', 'heavy']]);
  const handsWind = windOf(hands);
  assert.ok(near(heavy, plain * HEAVY.slower, 1e-6), `Heavy slows the jab without it (${heavy} against ${plain})`);
  assert.ok(near(handsWind, plain, 1e-6), `with Heavy Hands, as quick as without Heavy (${handsWind})`);
  // (and Heavy still hits harder)
  const g0 = room();
  dummy(g0, 1.3, 0);
  const g1 = room(['heavyhands'], [[0, 'front', 'heavy']]);
  dummy(g1, 1.3, 0);
  assert.ok(throwPunch(g1, 'jab')[0] > throwPunch(g0, 'jab')[0]);
});

test('Big Uppercut: his uppercut hits twice as hard and throws the enemy up; it comes down stunned for two seconds', () => {
  const p = room();
  dummy(p, 1.3, 0);
  const plain = throwPunch(p, 'uppercut')[0];
  const g = room(['biguppercut']);
  const m = dummy(g, 1.3, 0);
  const big = throwPunch(g, 'uppercut')[0];
  assert.ok(near(big, plain * T.bigUppercut.mult, 1), `twice as hard: ${big} against ${plain}`);
  wait(g, T.bigUppercut.up / 2);
  assert.ok(g.upOf(m) > 0.5, 'up in the air');
  assert.ok(m.stunT > 0);
  const ev = wait(g, T.bigUppercut.up / 2 + 0.05);
  assert.equal(g.upOf(m), 0, 'come down');
  const down = ev.find((e) => e.t === 'comeDown');
  assert.ok(down, 'it comes down');
  assert.ok(near(m.stunT, T.bigUppercut.stun, 0.1), `stunned two seconds from then: ${m.stunT}`);
  wait(g, T.bigUppercut.stun + 0.1);
  assert.equal(m.stunT, 0);
  // (played: tap, tap, tap)
  const h = room(['biguppercut']);
  const n = dummy(h, 1.3, 0);
  const seen = [...press(h, false, n), ...press(h, false, n), ...press(h, false, n, 0.3)];
  assert.deepEqual(punches(seen), ['jab', 'hook', 'uppercut']);
  assert.ok(seen.some((e) => e.t === 'popUp'));
  assert.ok(h.upOf(n) > 0);
});

test('Flurry: after the uppercut lands, his next tap is a hook again: hook, uppercut, hook, uppercut, without a break', () => {
  const run = (talents: string[]): string[] => {
    const g = room(talents);
    const m = dummy(g, 1.3, 0);
    const ev: GameEvent[] = [];
    for (let k = 0; k < 7; k++) ev.push(...press(g, false, m));
    return punches(ev);
  };
  assert.deepEqual(run([]), ['jab', 'hook', 'uppercut', 'jab', 'hook', 'uppercut', 'jab']);
  assert.deepEqual(run(['flurry']), ['jab', 'hook', 'uppercut', 'hook', 'uppercut', 'hook', 'uppercut']);
  // (a hold after the uppercut is the start of a new combo, as ever)
  const g = room(['flurry']);
  const m = dummy(g, 1.3, 0);
  const ev = [...press(g, false, m), ...press(g, false, m), ...press(g, false, m), ...press(g, true, m)];
  assert.deepEqual(punches(ev), ['jab', 'hook', 'uppercut', 'cross']);
});

test('Knockout: his uppercut knocks out any enemy below a fifth of its life; a boss is stunned three seconds', () => {
  const g = room(['knockout']);
  const low = dummy(g, 1.3, 0, 1e6);
  low.life = low.maxLife * 0.18;
  throwPunch(g, 'uppercut');
  assert.ok(low.dead, 'knocked out');
  const high = dummy(g, 1.3, 0, 1e6);
  high.life = high.maxLife * 0.5;
  throwPunch(g, 'uppercut');
  assert.ok(!high.dead, 'above a fifth, only struck');
  high.x += 10;
  const boss = dummy(g, 1.3, 0, 1e6);
  boss.boss = true;
  boss.life = boss.maxLife * 0.15;
  g.events.length = 0;
  inner(g).landPunch(0, 'uppercut', g.hero.x, g.hero.y, 1, 0, 1);
  assert.ok(!boss.dead, 'a boss is not knocked out');
  assert.ok(near(boss.stunT, T.knockout.boss, 1e-9), `a boss stunned three seconds: ${boss.stunT}`);
  assert.ok(g.events.some((e) => e.t === 'knockout' && e.boss));
  // (without the talent, the same uppercut does not)
  const p = room();
  const m = dummy(p, 1.3, 0, 1e6);
  m.life = m.maxLife * 0.18;
  throwPunch(p, 'uppercut');
  assert.ok(!m.dead);
});

// ---- POWER ----------------------------------------------------------------------------------------------------------

test('Wide Cross: his cross strikes every enemy in front of him, not only the first', () => {
  const lay = (g: Game): Monster[] => [dummy(g, 1.2, 0), dummy(g, 1.6, 0.6), dummy(g, 1.6, -0.6)];
  const p = room();
  const before = lay(p);
  press(p, true, before[0]);
  assert.equal(before.filter((m) => hurt(m) > 0).length, 1, 'without it, only the first');
  const g = room(['widecross']);
  const all = lay(g);
  const behind = dummy(g, -1.5, 0);
  const ev = press(g, true, all[0]);
  assert.deepEqual(punches(ev), ['cross']);
  for (const m of all) assert.ok(hurt(m) > 0, 'every one in front struck');
  assert.equal(hurt(behind), 0, 'not the one behind him');
});

test('Bleeders: body blows always make them bleed: each one it hits loses half the blow again over three seconds', () => {
  const g = room(['bleeders']);
  const front = dummy(g, 1.3, 0);
  const sides = [dummy(g, 0.3, 1.5), dummy(g, 0.3, -1.5)];
  press(g, true, front);
  const ev = press(g, true, front, 0.6);
  assert.deepEqual(punches(ev), ['body blow']);
  const struck = sides.map((m) => ({ m, blow: hurt(m), was: m.life }));
  for (const { m, blow } of struck) {
    assert.ok(blow > 0);
    assert.ok(near(m.bleedT ?? 0, T.bleeders.secs, 0.5), 'bleeding three seconds');
  }
  wait(g, T.bleeders.secs + 0.6);
  for (const { m, blow, was } of struck) {
    const bled = was - m.life;
    // (half the blow, give or take a tick of it: bleeding is paid twice a second)
    assert.ok(near(bled, blow * T.bleeders.share, (blow * T.bleeders.share) / 4), `bled ${bled} of a blow of ${blow}`);
    assert.equal(m.bleedT, 0, 'and no more');
  }
  // (a cross does not; nor does a body blow without the talent)
  const p = room();
  const f2 = dummy(p, 1.3, 0);
  const s2 = dummy(p, 0.3, 1.5);
  press(p, true, f2);
  press(p, true, f2, 0.6);
  assert.ok(hurt(s2) > 0);
  assert.ok(!((s2.bleedT ?? 0) > 0));
});

test('Iron Chin: winding up a hold, nothing can knock him back, and he takes a third less harm', () => {
  const windUp = (g: Game): void => {
    const c = emptyControls();
    c.cast = true;
    c.castX = g.hero.x + 1;
    c.castY = g.hero.y;
    g.update(DT, c);
    assert.ok(g.hero.windup && g.hero.windup.skill === 1, 'winding up the hold');
  };
  const harm = (talents: string[], winding: boolean): { lost: number; knocked: boolean; pulled: boolean } => {
    const g = room(talents);
    const m = dummy(g, 1.3, 0);
    if (winding) windUp(g);
    const h = g.hero;
    const was = h.life;
    g.hurtHero(200, 'phys', [], m);
    const lost = was - h.life;
    h.step = null;
    g.knockHero(m.x, m.y, 1);
    const knocked = h.step !== null;
    h.step = null;
    g.pullHero(h.x + 3, h.y, 1);
    return { lost, knocked, pulled: h.step !== null };
  };
  const plain = harm([], true);
  const chin = harm(['ironchin'], true);
  const idle = harm(['ironchin'], false);
  assert.ok(plain.knocked && plain.pulled, 'without it, a blow knocks him about');
  assert.ok(!chin.knocked, 'not knocked back');
  assert.ok(!chin.pulled, 'not dragged off his feet either');
  assert.ok(near(chin.lost, plain.lost * (1 - T.ironChin.less), 1), `a third less: ${chin.lost} of ${plain.lost}`);
  assert.ok(near(idle.lost, plain.lost, 1) && idle.knocked, 'not winding up a hold: as ever');
});

test('Ten Pins: every enemy the haymaker’s cannonball bowls over is launched too, and bowls over more down the line', () => {
  const run = (talents: string[]): { far: Monster; pin: Monster; ev: GameEvent[] } => {
    const g = room(talents);
    const front = dummy(g, 1.3, 0);
    const pin = dummy(g, 2.8, 0.1);
    // (off the haymaker's line, but where the pin is launched)
    const far = dummy(g, 5.0, 1.6);
    const ev = [...press(g, true, front), ...press(g, true, front), ...press(g, true, front, 1.6)];
    assert.deepEqual(punches(ev), ['cross', 'body blow', 'haymaker']);
    return { far, pin, ev };
  };
  const plain = run([]);
  assert.ok(hurt(plain.pin) > 0, 'the pin bowled over');
  assert.equal(hurt(plain.far), 0, 'without it, the one off the line is untouched');
  const pins = run(['tenpins']);
  assert.ok(pins.ev.filter((e) => e.t === 'cannonball').length >= 2, 'the one bowled over is launched');
  assert.ok(pins.ev.some((e) => e.t === 'cannonball' && e.id === pins.pin.id));
  assert.ok(hurt(pins.far) > 0, 'and bowls over more down the line');
});

test('Pinball: an enemy he knocks back hurts what it is knocked into, and knocks that back too', () => {
  const run = (talents: string[]): { line: Monster[]; at: number[] } => {
    const g = room(talents);
    const line = [dummy(g, 1.3, 0), dummy(g, 2.15, 0), dummy(g, 3.4, 0)];
    const at = line.map((m) => m.x);
    const ev = press(g, true, line[0], 1.0);
    assert.deepEqual(punches(ev), ['cross']);
    assert.ok(line[0].x > at[0] + 0.3, 'the cross knocks the first back');
    return { line, at };
  };
  const plain = run([]);
  assert.equal(hurt(plain.line[1]), 0, 'without it, what is behind is not hurt');
  const pin = run(['pinball']);
  assert.ok(hurt(pin.line[1]) > 0, 'the one it is knocked into is hurt');
  assert.ok(pin.line[1].x > pin.at[1] + 0.3, 'and knocked back');
  assert.ok(hurt(pin.line[2]) > 0, 'and that one knocks the next');
});

test('Shockwave: his holds send a wave of air on ahead: it strikes everything in a line three tiles long', () => {
  const lay = (g: Game): { inLine: Monster; beyond: Monster; aside: Monster } => ({
    inLine: dummy(g, 2.7, 0),
    beyond: dummy(g, T.shockwave.far + 0.9, 0),
    aside: dummy(g, 2.0, 2.0),
  });
  const p = room();
  const a = lay(p);
  press(p, true, null);
  assert.equal(hurt(a.inLine), 0, 'without it, out of the cross’s reach');
  const g = room(['shockwave']);
  const b = lay(g);
  const ev = press(g, true, null);
  assert.ok(ev.some((e) => e.t === 'shockwave'));
  assert.ok(hurt(b.inLine) > 0, 'struck by the wave');
  assert.equal(hurt(b.beyond), 0, 'not past three tiles');
  assert.equal(hurt(b.aside), 0, 'not off its line');
  // (its blow: half the hold's)
  const p2 = room();
  dummy(p2, 1.3, 0);
  const cross = throwPunch(p2, 'cross')[0];
  const h = room(['shockwave']);
  const c = dummy(h, 2.7, 0);
  inner(h).landPunch(1, 'cross', h.hero.x, h.hero.y, 1, 0, 1);
  wait(h, T.shockwave.far / T.shockwave.speed + 0.1);
  assert.ok(near(hurt(c), cross * T.shockwave.share, 1), `half the cross: ${hurt(c)} of ${cross}`);
  // (every hold: the haymaker's too)
  const k = room(['shockwave']);
  const d = dummy(k, 2.7, 0);
  inner(k).landPunch(1, 'haymaker', k.hero.x, k.hero.y, 1, 0, 1);
  wait(k, 0.4);
  assert.ok(hurt(d) > 0);
});

// ---- the thumb: his slip and counter -------------------------------------------------------------------------------

test('Bob and Weave: when his counter lands, his slip is ready again at once', () => {
  const run = (talents: string[], into: boolean): number => {
    const g = room(talents);
    if (into) dummy(g, -5.8, 0);
    const ev = slip(g, -5);
    assert.ok(!into || ev.some((e) => e.t === 'punch' && e.name === 'counter' && e.hit), 'the counter lands');
    return g.hero.skills[2].charges;
  };
  assert.equal(run([], true), 0, 'without it, the slip waits');
  assert.equal(run(['bobweave'], false), 0, 'a counter into nothing: the slip waits');
  assert.equal(run(['bobweave'], true), 1, 'ready again at once');
});

test('Slip Reflex: once every six seconds, a blow that would hit him is slipped by itself, and he counters', () => {
  const g = room(['slipreflex']);
  const m = dummy(g, 1.2, 0);
  const h = g.hero;
  const was = h.life;
  g.hurtHero(200, 'phys', [], m);
  assert.equal(h.life, was, 'slipped');
  assert.ok(h.move && h.move.kind === 'slip', 'he slips');
  const ev = wait(g, BRAWL_TUNE.slip.secs + 0.2);
  assert.ok(ev.some((e) => e.t === 'punch' && e.name === 'counter' && e.hit), 'and counters');
  assert.ok(hurt(m) > 0);
  assert.equal(h.skills[2].charges, 1, 'his own slip untouched');
  h.invuln = 0;
  g.hurtHero(200, 'phys', [], m);
  assert.ok(h.life < was, 'not again within six seconds');
  wait(g, T.slipReflex.every);
  h.invuln = 0;
  const now = h.life;
  g.hurtHero(200, 'phys', [], m);
  assert.equal(h.life, now, 'six seconds on, slipped again');
  // (without the talent, struck)
  const p = room();
  const q = dummy(p, 1.2, 0);
  const life = p.hero.life;
  p.hurtHero(200, 'phys', [], q);
  assert.ok(p.hero.life < life);
});

test('Set-Up: after a counter lands, his next press is the combo’s last punch: a tap the uppercut, a hold the haymaker', () => {
  const after = (talents: string[], hold: boolean): string[] => {
    const g = room(talents);
    const m = dummy(g, -5.8, 0);
    slip(g, -5);
    assert.ok(hurt(m) > 0, 'the counter landed');
    return punches(press(g, hold, m, 1.2));
  };
  assert.deepEqual(after([], false), ['jab']);
  assert.deepEqual(after([], true), ['cross']);
  assert.deepEqual(after(['setup'], false), ['uppercut']);
  assert.deepEqual(after(['setup'], true), ['haymaker']);
  // (once: the press after it is the start of a combo again)
  const g = room(['setup']);
  const m = dummy(g, -5.8, 0);
  slip(g, -5);
  const ev = [...press(g, false, m, 1.4), ...press(g, false, m)];
  assert.deepEqual(punches(ev), ['uppercut', 'jab']);
  // (a counter into nothing sets nothing up)
  const e = room(['setup']);
  slip(e, -5);
  assert.deepEqual(punches(press(e, false, null)), ['jab']);
});
