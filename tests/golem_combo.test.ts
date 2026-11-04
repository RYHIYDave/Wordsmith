// HER GOLEM'S COMBO, AND HER HOLD'S ROCKET JUMP (game/tinkerer.ts GOLEM_COMBO). His words, 3 Nov 2026, 22:07: “He still can’t make
// it close in the fight.  I think he needs a basic melee hit combo that includes the slam, and the rocket jump on the hold button.”;
// “Yes, that's it (Recommended)”. And THE WAY ROUND (game.ts wayRound): “So is the golem” (stuck on things).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { COMBO_TUNE, GOLEM_COMBO, TINKER_TUNE } from '../src/game/tinkerer';
import { land } from './helpers';

const DT = 1 / 60;
type Inner = { rng: RNG; waveT: number; spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster; wakeUp: (m: Monster) => void };
const inner = (g: Game): Inner => g as unknown as Inner;
const G = TINKER_TUNE.golem;

function room(seed = 3): Game {
  const g = Game.forPractice('tinkerer', seed);
  inner(g).waveT = 1e9;
  g.monsters.length = 0;
  g.hero.x = 14.5;
  g.hero.y = 15.5;
  g.hero.fx = 1;
  g.hero.fy = 0;
  g.hero.invuln = 1e9;
  g.events.length = 0;
  return g;
}
function dummy(g: Game, x: number, y: number): Monster {
  const a = inner(g);
  const m = a.spawn('skeleton', x, y, 1, 0, false, a.rng);
  a.wakeUp(m);
  m.speed = 0;
  m.cd = 1e9;
  m.life = m.maxLife = 1e7;
  return m;
}
function hold(g: Game, x: number, y: number): GameEvent[] {
  for (const s of g.hero.skills) {
    s.charges = s.maxCharges;
    s.cd = 0;
  }
  g.hero.mana = g.hero.d.maxMana;
  const c = emptyControls();
  c.aimX = c.castX = x;
  c.aimY = c.castY = y;
  c.cast = true;
  const ev: GameEvent[] = [];
  const take = (): void => {
    ev.push(...g.events);
    g.events.length = 0;
  };
  g.update(DT, c);
  c.cast = false;
  take();
  land(g, c, DT, take);
  return ev;
}
function run(g: Game, secs: number, each?: () => void): GameEvent[] {
  const ev: GameEvent[] = [];
  for (let t = 0; t < secs; t += DT) {
    g.update(DT, emptyControls());
    ev.push(...g.events);
    g.events.length = 0;
    each?.();
  }
  return ev;
}

test('the switch is on', () => assert.equal(GOLEM_COMBO.on, true));

test('in a fight its blows go punch, punch, SLAM, and again: the slam its pound in a smaller ring', () => {
  const g = room();
  hold(g, g.hero.x + 2, g.hero.y);
  run(g, G.arrive + 0.2);
  const gm = g.golem!;
  dummy(g, gm.x + 1.2, gm.y);
  const acts: string[] = [];
  let last = '';
  const ev = run(g, 9, () => {
    const a = g.golem!.act;
    if (a !== last && (a === 'punch' || a === 'pound')) acts.push(a);
    last = a;
  });
  assert.deepEqual(acts.slice(0, 6), ['punch', 'punch', 'pound', 'punch', 'punch', 'pound'], acts.join(' '));
  const pounds = ev.filter((e) => e.t === 'golemPound') as Extract<GameEvent, { t: 'golemPound' }>[];
  assert.ok(pounds.length >= 2, 'its slams strike');
  const full = g.hero.skills.find((s) => s.id === 'golem')!;
  assert.ok(pounds.every((p) => p.r < 2.4 * full.r.size * COMBO_TUNE.slam.size + 1e-6), 'in the smaller ring');
});

test('her hold, the Golem out: it rocket-jumps onto where she points, and lands as its pound', () => {
  const g = room();
  hold(g, g.hero.x + 2, g.hero.y);
  run(g, G.arrive + 1.5);
  const gm = g.golem!;
  const tx = gm.x + 6;
  const ty = gm.y;
  assert.ok(g.isOpen(tx, ty), 'open floor there');
  hold(g, tx, ty);
  assert.equal(gm.act, 'jump', 'it jumps');
  // (watched until it is down: no enemy about, it goes back to her side after)
  let down: { x: number; y: number } | null = null;
  const ev = run(g, 3, () => {
    if (!down && gm.act !== 'jump') down = { x: gm.x, y: gm.y };
  });
  assert.ok(down && Math.hypot(down.x - tx, down.y - ty) < 1, `it came down where she pointed (${JSON.stringify(down)})`);
  assert.ok(ev.some((e) => e.t === 'golemArrive'), 'it lands');
});

test('her hold close by: it pounds where it stands, as before', () => {
  const g = room();
  hold(g, g.hero.x + 2, g.hero.y);
  run(g, G.arrive + 1.5);
  const gm = g.golem!;
  // (kept where it stands while she turns to her hold: it would follow her side)
  const was = G.speed;
  G.speed = 0;
  try {
    hold(g, gm.x + 1, gm.y);
  } finally {
    G.speed = was;
  }
  assert.equal(gm.act, 'pound');
});

test('THE WAY ROUND: what it fights behind a wall, it walks round to it, not into the wall', () => {
  const g = room();
  hold(g, g.hero.x + 2, g.hero.y);
  run(g, G.arrive + 0.2);
  const gm = g.golem!;
  const L = g.level;
  const f = L.floor;
  // (a wall three tiles long between it and what it fights)
  const wx = Math.floor(gm.x) + 2;
  const wy = Math.floor(gm.y);
  for (const y of [wy - 1, wy, wy + 1]) L.walk[y * f.w + wx] = 0;
  const m = dummy(g, wx + 2.5, wy + 0.5);
  m.seen = true;
  g.hero.x = gm.x;
  g.hero.y = gm.y + 3;
  let near = false;
  run(g, 6, () => {
    if (Math.hypot(gm.x - m.x, gm.y - m.y) < 2.2) near = true;
  });
  assert.ok(near, `it got to it (${gm.x.toFixed(2)}, ${gm.y.toFixed(2)})`);
});
