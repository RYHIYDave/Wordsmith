// THE BRAWLER'S RULES (game/brawler.ts): his design, the owner's, 24 Oct 2026 (in the art chat): combos by position, tap and
// hold, three hits, eight in all (“By position (Recommended)”); “Hold, hold, hold should be a massive slow combo that ends
// with some crazy punch that like sends whatever it hits out like a projectile or something.  I need a three tap combo to be
// much different than a three hold combo”; “One target vs a crowd (Recommended)”; the names floating over him; his swipe,
// “Slip and counter (Recommended)”, “Weaving dash, same reach (Recommended)”.
//   run: tsx --test tests/brawler.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, GameEvent, Monster } from '../src/game/state';
import { BRAWLER, BRAWL_TUNE, PUNCHES, punchFor } from '../src/game/brawler';
import { playableClasses } from '../src/game/warlock';

const DT = 1 / 60;
type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
const inner = (g: Game): Inner => g as unknown as Inner;

function room(seed = 3): Game {
  const g = Game.forPractice('brawler', seed);
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
    c.fire = false;
    c.cast = false;
    c.evade = false;
    for (const e of g.events) ev.push(e);
    g.events.length = 0;
  }
  return ev;
}
/** A press, tap (false) or hold (true), at the one in front; then the time to see it land. */
function press(g: Game, hold: boolean, at: Monster | null, seconds = hold ? 0.75 : 0.42): GameEvent[] {
  const c = emptyControls();
  c.aimX = c.castX = at ? at.x : g.hero.x + 1;
  c.aimY = c.castY = at ? at.y : g.hero.y;
  if (hold) c.cast = true;
  else c.fire = true;
  return wait(g, seconds, c);
}
const punches = (ev: GameEvent[]): string[] => ev.flatMap((e) => (e.t === 'punch' && e.n === 0 && !e.echo ? [e.name] : []));

test('he is not offered yet: the class cards hold the others until his switch is on', () => {
  assert.equal(BRAWLER.on, false);
  assert.ok(!playableClasses().includes('brawler'));
  BRAWLER.on = true;
  assert.ok(playableClasses().includes('brawler'));
  BRAWLER.on = false;
});

test('a new Brawler: the Jab, the Cross and the Slip and Counter', () => {
  const g = room();
  assert.deepEqual(g.hero.skills.map((s) => s.id), ['jab', 'cross', 'slip']);
});

test('the punch a press makes is by its place in the combo: eight combos, the haymaker only after two holds', () => {
  const made: Record<string, string> = {};
  for (const run of ['TTT', 'TTH', 'THT', 'THH', 'HTT', 'HTH', 'HHT', 'HHH']) {
    let holds = 0;
    made[run] = [...run].map((c, i) => {
      const p = punchFor(i, c === 'H', holds);
      if (c === 'H') holds++;
      return p;
    }).join(', ');
  }
  assert.equal(made.TTT, 'jab, hook, uppercut');
  assert.equal(made.HHH, 'cross, body blow, haymaker');
  assert.equal(made.THT, 'jab, body blow, uppercut');
  assert.equal(made.THH, 'jab, body blow, overhand');
  assert.equal(made.HTH, 'cross, hook, overhand');
  assert.equal(new Set(Object.values(made)).size, 8, 'eight different combos');
});

test('tap, tap, tap: jab, hook, uppercut on the one in front, quick; the uppercut stuns it', () => {
  const g = room();
  const m = dummy(g, 1.3, 0);
  const ev = [...press(g, false, m), ...press(g, false, m), ...press(g, false, m)];
  assert.deepEqual(punches(ev), ['jab', 'hook', 'uppercut']);
  assert.ok(hurt(m) > 0);
  assert.ok(m.stunT > 0, 'popped up stunned');
});

test('hold, hold, hold: cross, body blow, haymaker; the body blow strikes all round him; the haymaker fires the one in front down the line, bowling over each it meets', () => {
  const g = room();
  const front = dummy(g, 1.3, 0);
  const line = [dummy(g, 2.8, 0.1), dummy(g, 4.2, -0.1)];
  const sides = [dummy(g, 0.3, 1.5), dummy(g, 0.3, -1.5)];
  const ev = [...press(g, true, front), ...press(g, true, front), ...press(g, true, front, 1.4)];
  assert.deepEqual(punches(ev), ['cross', 'body blow', 'haymaker']);
  for (const m of sides) assert.ok(hurt(m) > 0, 'the body blow struck those at his sides');
  assert.ok(ev.some((e) => e.t === 'cannonball'), 'the one in front launched');
  for (const m of line) assert.ok(hurt(m) > 0, 'those down the line bowled over');
  assert.ok(ev.filter((e) => e.t === 'bowled').length >= 2);
});

test('a combo begins again when a press comes too late after the last punch', () => {
  const g = room();
  const m = dummy(g, 1.3, 0);
  const a = press(g, false, m);
  wait(g, PUNCHES.jab.follow + 1.5);
  const b = press(g, false, m);
  assert.deepEqual([...punches(a), ...punches(b)], ['jab', 'jab']);
});

test('his slip carries him to the spot untouchable, and he comes up with a counter hook into whatever is there', () => {
  const g = room();
  const there = dummy(g, -5.8, 0);
  const h = g.hero;
  const from = h.x;
  const c = emptyControls();
  c.evade = true;
  c.evadeX = h.x - 5;
  c.evadeY = h.y;
  g.update(DT, c);
  assert.ok(h.invuln > 0, 'untouchable as he weaves');
  const ev = wait(g, BRAWL_TUNE.slip.secs + 0.3);
  assert.ok(Math.abs(h.x - (from - 5)) < 0.3);
  assert.ok(ev.some((e) => e.t === 'punch' && e.name === 'counter' && e.hit), 'the counter hook lands');
  assert.ok(hurt(there) > 0);
});

test('a tap can be broken off into the slip', () => {
  const g = room();
  const m = dummy(g, 1.3, 0);
  const c = emptyControls();
  c.fire = true;
  c.aimX = m.x;
  c.aimY = m.y;
  g.update(DT, c);
  assert.ok(g.hero.windup, 'winding up the jab');
  const e = emptyControls();
  e.evade = true;
  e.evadeX = g.hero.x - 4;
  e.evadeY = g.hero.y;
  g.update(DT, e);
  assert.equal(g.hero.windup, null, 'the jab broken off');
  assert.ok(g.hero.move && g.hero.move.kind === 'slip');
});
