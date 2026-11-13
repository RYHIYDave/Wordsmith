// THE EIGHT MELDS ACROSS THE GROUPS (game/melds8.ts, MELDS8 off until their looks are drawn and he has seen them at work): his
// picks of 8 Nov 2026. Off, none is made or kept; on, each is made from its two words, does the work of both, and its twist:
// Siphon's poison heals, Cauterize heals on a burning kill, Forking arcs to a second, Shiver's critical hits freeze, Sunder's stunned
// take more, Fervor's kills burn hotter, Rime Ward's blocks chill, Implode bursts where it struck.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { MELD, meldOf, meldProblem, savedWords, wordIds } from '../src/game/melds';
import { MELDS8, MELD8_TUNE } from '../src/game/melds8';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { MELD8_IDS, MELD_OF } from '../src/game/types';
import type { WordId } from '../src/game/types';
import { land } from './helpers';

const DT = 1 / 30;
function on<T>(fn: () => T): T {
  const was = [MELD.on, MELDS8.on];
  MELD.on = true;
  MELDS8.on = true;
  try {
    return fn();
  } finally {
    [MELD.on, MELDS8.on] = was;
  }
}
interface Inner {
  waveT: number;
  rng: RNG;
  spawn: (k: string, x: number, y: number, pack: number, rank: number, boss: boolean, rng: RNG) => Monster;
  wakeUp: (m: Monster) => void;
  fervorPct: () => number;
  hurtHero: (raw: number, el: string, words: readonly WordId[], src: Monster | null) => void;
}
function arena(front: WordId, spots: readonly [number, number][] = [[1.1, 0]]): { g: Game; a: Inner; mons: Monster[]; events: { t: string }[] } {
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
    s.events.push(...(g.events as { t: string }[]));
    g.events.length = 0;
  };
  keep();
  land(g, c, DT, keep);
}
function wait(s: ReturnType<typeof arena>, secs: number): void {
  const c = emptyControls();
  for (let t = 0; t < secs; t += DT) {
    s.g.update(DT, c);
    s.events.push(...(s.g.events as { t: string }[]));
    s.g.events.length = 0;
  }
}

test('off, none of the eight is made or kept; on, each is made from its two words, either way round', () => {
  const was = [MELD.on, MELDS8.on];
  MELD.on = true;
  MELDS8.on = false;
  try {
    for (const m of MELD8_IDS) {
      const [x, y] = MELD_OF[m];
      assert.notEqual(meldOf(x, y), m, `${m} off`);
      assert.ok(!wordIds().includes(m));
    }
    const rec = Object.fromEntries(MELD8_IDS.map((m) => [m, 1])) as Record<WordId, number>;
    assert.deepEqual(Object.keys(savedWords(rec)).filter((k) => (MELD8_IDS as readonly string[]).includes(k)), []);
  } finally {
    [MELD.on, MELDS8.on] = was;
  }
  on(() => {
    for (const m of MELD8_IDS) {
      const [x, y] = MELD_OF[m];
      assert.equal(meldOf(x, y), m);
      assert.equal(meldOf(y, x), m);
      assert.equal(meldProblem(x, y), null, m);
      assert.ok(wordIds().includes(m));
    }
  });
});

test('Forking: the hit arcs to the nearest other; Implode: a burst where it struck, a moment after', () =>
  on(() => {
    const f = arena('forking', [[1.1, 0], [2.4, 0.6]]);
    strike(f);
    assert.ok(f.mons[1].life < f.mons[1].maxLife, 'the second struck by the fork');
    assert.ok(f.events.some((e) => e.t === 'arc'));
    const i = arena('implode', [[1.1, 0], [1.9, 0.9]]);
    strike(i);
    const before = i.mons[1].life;
    wait(i, MELD8_TUNE.implode.wait + 0.2);
    assert.ok(i.events.some((e) => e.t === 'burst'), 'the burst');
    assert.ok(i.mons[1].life < before, 'those near it struck');
  }));

test('Shiver: a critical hit freezes; Sunder: one struck takes more while stunned', () =>
  on(() => {
    const s = arena('shiver');
    s.g.hero.d.critChance = 100;
    strike(s);
    assert.ok(s.mons[0].frozenT > 0, 'frozen');
    const u = arena('sunder');
    strike(u);
    assert.equal(u.mons[0].sunder, MELD8_TUNE.sunder.more);
  }));

test('Cauterize heals on a burning kill; Fervor burns hotter after a kill; Siphon heals as its poison eats', () =>
  on(() => {
    const c = arena('cauterize');
    const h = c.g.hero;
    // (life enough that its burning does not kill it before the blow lands)
    c.mons[0].life = 3;
    c.mons[0].burnT = 30;
    c.mons[0].burnDps = 0;
    h.life = h.d.maxLife / 2;
    const was = h.life;
    strike(c);
    assert.ok(c.mons[0].dead);
    assert.ok(h.life >= was + h.d.maxLife * MELD8_TUNE.cauterize.heal - 1, `healed a chunk: ${was} to ${h.life} of ${h.d.maxLife}, burnT ${c.mons[0].burnT}`);
    const v = arena('fervor');
    v.mons[0].life = 1;
    strike(v);
    assert.ok(v.a.fervorPct() > 0, 'hotter');
    const p = arena('siphon');
    const hp = p.g.hero;
    strike(p);
    assert.ok(p.mons[0].poisonT > 0, 'poisoned');
    hp.life = hp.d.maxLife / 2;
    const low = hp.life;
    wait(p, 1.2);
    assert.ok(hp.life > low, 'its poison healed him');
  }));

test('Rime Ward: a blow he blocks chills the one who struck it', () =>
  on(() => {
    const r = arena('rimeward');
    r.g.hero.d.stats.blockChance = 100;
    // (a block is a chance, its most GUARD.blockCap: blows until one is blocked)
    for (let k = 0; k < 60 && !(r.mons[0].chillT > 0); k++) {
      r.g.hero.invuln = 0;
      r.g.hero.life = r.g.hero.d.maxLife;
      r.a.hurtHero(10, 'phys', [], r.mons[0]);
    }
    assert.ok(r.mons[0].chillT > 0);
  }));
