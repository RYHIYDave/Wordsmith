// THE EIGHT MELDS' MOMENTS, SENT TO THEIR LOOKS (game.ts, { t: 'meld8' }; render/melds8.ts M8Event; docs/mockups/melds8/README.md,
// “For the main chat”): on since Version 25.3.17, his take of all eight (8 Nov 2026) and his yes to their looks (12 Nov). Held:
// each meld's moment goes out as it happens, with what its look needs; Forking's arc and Implode's burst are marked as theirs, so
// their own looks draw them; Implode pulls those near where it struck; Sunder's 'hit' on a blow on one sundered and stunned.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { MELD } from '../src/game/melds';
import { MELDS8, MELD8_TUNE } from '../src/game/melds8';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import type { WordId } from '../src/game/types';
import { MELDS8_LOOK } from '../src/render/melds8';
import { land } from './helpers';

const DT = 1 / 30;
type Ev = { t: string; id?: string; what?: string; on?: number; meld?: string; [k: string]: unknown };
interface Inner {
  waveT: number;
  rng: RNG;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  hurtHero: (raw: number, el: string, words: readonly WordId[], src: Monster | null) => void;
}
function arena(front: WordId, spots: readonly [number, number][] = [[1.1, 0]]): { g: Game; a: Inner; mons: Monster[]; events: Ev[] } {
  const g = Game.forPractice('warrior', 5);
  const a = g as unknown as Inner;
  a.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = 1;
  h.fy = 0;
  assert.equal(g.socket(0, 'front', front), null, `${front} goes in front`);
  const mons = spots.map(([dx, dy]) => {
    const m = a.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, a.rng);
    a.wakeUp(m);
    m.speed = 0;
    m.cd = 1e9;
    m.life = m.maxLife = 1e7;
    return m;
  });
  g.events.length = 0;
  return { g, a, mons, events: [] };
}
function strike(s: ReturnType<typeof arena>): void {
  const { g } = s;
  const h = g.hero;
  h.skills[0].cd = 0;
  h.swingT = 0;
  h.mana = h.d.maxMana;
  const c = emptyControls();
  c.aimX = h.x + 1.1;
  c.aimY = h.y;
  c.castX = c.aimX;
  c.castY = c.aimY;
  c.fire = true;
  g.update(DT, c);
  c.fire = false;
  const keep = (): void => {
    s.events.push(...(g.events as unknown as Ev[]));
    g.events.length = 0;
  };
  keep();
  land(g, c, DT, keep);
}
function wait(s: ReturnType<typeof arena>, secs: number): void {
  const c = emptyControls();
  for (let t = 0; t < secs; t += DT) {
    s.g.update(DT, c);
    s.events.push(...(s.g.events as unknown as Ev[]));
    s.g.events.length = 0;
  }
}
const moment = (s: { events: Ev[] }, id: string): Ev | undefined => s.events.find((e) => e.t === 'meld8' && e.id === id && !e.what);

test('0. on in the game: the eight and their looks', () => {
  assert.equal(MELDS8.on, true);
  assert.equal(MELDS8_LOOK.on, true);
  assert.equal(MELD.on, true);
});

test('1. Forking: its moment from the one struck to the other, the arc marked as its own', () => {
  const f = arena('forking', [[1.1, 0], [2.4, 0.6]]);
  strike(f);
  const e = moment(f, 'forking');
  if (!e) throw new Error('its moment');
  assert.equal(e.x1, f.mons[1].x);
  assert.equal(e.y1, f.mons[1].y);
  assert.equal(e.k, 1, 'in front: full');
  const arc = f.events.find((q) => q.t === 'arc');
  assert.equal(arc?.meld, 'forking', 'the game\'s arc, marked as Forking\'s');
});

test('2. Implode: those near where it struck pulled toward it; its moment; its burst marked as its own', () => {
  const i = arena('implode', [[1.1, 0], [2.6, 1.2]]);
  const far = i.mons[1];
  const before = { x: far.x, y: far.y };
  strike(i);
  const e = moment(i, 'implode');
  if (!e) throw new Error('its moment');
  assert.deepEqual([e.reach, e.r, e.wait], [MELD8_TUNE.implode.reach, MELD8_TUNE.implode.r, MELD8_TUNE.implode.wait]);
  const ex = e.x as number;
  const ey = e.y as number;
  assert.ok(Math.hypot(far.x - ex, far.y - ey) < Math.hypot(before.x - ex, before.y - ey) - 0.3, 'drawn in toward it');
  wait(i, MELD8_TUNE.implode.wait + 0.2);
  const burst = i.events.find((q) => q.t === 'burst' && q.meld === 'implode');
  assert.ok(burst, 'its burst, marked as Implode\'s');
});

test('3. Shiver on a critical hit; Sunder on one stunned, then its \'hit\' on the next blow', () => {
  const s = arena('shiver');
  s.g.hero.d.critChance = 100;
  strike(s);
  assert.equal(moment(s, 'shiver')?.on, s.mons[0].id);
  const u = arena('sunder');
  u.mons[0].stunT = 3;
  strike(u);
  const e = moment(u, 'sunder');
  assert.equal(e?.on, u.mons[0].id, 'its crack on the stunned one');
  assert.ok((e?.secs as number) > 0, 'as long as the stun');
  u.events.length = 0;
  u.mons[0].stunT = 3;
  strike(u);
  assert.ok(u.events.some((q) => q.t === 'meld8' && q.id === 'sunder' && q.what === 'hit'), 'a blow on it: the crack flares');
  assert.ok(!moment(u, 'sunder'), 'and no second crack while the first lasts');
});

test('4. Cauterize and Fervor at a kill; Siphon as its poison eats; Rime Ward on a block', () => {
  const c = arena('cauterize');
  c.mons[0].life = 3;
  c.mons[0].burnT = 30;
  c.mons[0].burnDps = 0;
  strike(c);
  assert.ok(c.mons[0].dead);
  assert.ok(moment(c, 'cauterize'), 'Cauterize');
  const v = arena('fervor');
  v.mons[0].life = 1;
  strike(v);
  const fe = moment(v, 'fervor');
  assert.ok(fe, 'Fervor');
  assert.deepEqual([fe?.n, fe?.most, fe?.secs], [1, MELD8_TUNE.fervor.most, MELD8_TUNE.fervor.secs]);
  const p = arena('siphon');
  strike(p);
  p.g.hero.life = p.g.hero.d.maxLife / 2;
  wait(p, 1.2);
  assert.equal(moment(p, 'siphon')?.on, p.mons[0].id, 'Siphon, on the poisoned one');
  const r = arena('rimeward');
  r.g.hero.d.stats.blockChance = 100;
  for (let k = 0; k < 60 && !(r.mons[0].chillT > 0); k++) {
    r.g.hero.invuln = 0;
    r.g.hero.life = r.g.hero.d.maxLife;
    r.a.hurtHero(10, 'phys', [], r.mons[0]);
    r.events.push(...(r.g.events as unknown as Ev[]));
    r.g.events.length = 0;
  }
  assert.equal(moment(r, 'rimeward')?.on, r.mons[0].id, 'Rime Ward, on the one who struck');
});
