// ACT 2, THE BELLS (game/bells.ts; Game's "ACT 2: THE BELLS"), behind ACT2 (off). His design, 18 Oct 2026, 05:27 Pacific: "I like
// the bells.  So you activate the hush somehow, then there are 4-7 bells that spawn around the map, you have a limited time to
// run around and activate those bells.  Enemies constantly spawn in the hush, ramping up difficulty.  They drop loot, but if you
// get all the bells before the time runs out you get a big loot explosion at the end."; 05:28 "Or they just spawn whatever
// enemies, but when you activate a bell, a tough enemy spawns"; 05:40 "Fixed area, and the bells start to chip that area down
// so the density of enemies ramps as well."
// The plan is laid here by hand on a floor of the Hush (its map-makers lay their own: each floor's own test holds them to it).
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ACT2 } from '../src/game/act1';
import { BELLS_TUNE, gapAt, makeBells, sizeAt } from '../src/game/bells';
import type { BellsState } from '../src/game/bells';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Level } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';
import { seasoned } from './helpers';

interface Inside {
  bellsStruck(x: number, y: number, rad: number): void;
  bellsMade(): void;
}

/** A hero on floor 11 (its stand-in floor if its map-maker is not in yet), and a plan of five bells laid by hand round its start's far side. */
function withBells(): { g: Game; L: Level; B: BellsState } {
  const g = seasoned(new Game('warrior', 11), 30);
  (g as unknown as { god: boolean }).god = true;
  g.depth = 11;
  g.cleared = 10;
  g.enterDungeon();
  const L = g.level;
  const f = L.floor;
  // (five whole floor tiles in a ring round a middle 16 tiles from the start, the Muffled Bell at the middle)
  const floorNear = (x: number, y: number): { x: number; y: number } => {
    let best = { x: f.start.x, y: f.start.y };
    let bd = Infinity;
    for (let ty = 1; ty < f.h - 1; ty++) for (let tx = 1; tx < f.w - 1; tx++) {
      if (f.tiles[ty * f.w + tx] !== T_FLOOR || L.walk[ty * f.w + tx] !== 1) continue;
      const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
      if (d < bd) {
        bd = d;
        best = { x: tx + 0.5, y: ty + 0.5 };
      }
    }
    return best;
  };
  const mid = floorNear(f.start.x + 14, f.start.y + 6);
  const bells = [0, 1, 2, 3, 4].map((k) => floorNear(mid.x + Math.cos(k * 1.256) * 9, mid.y + Math.sin(k * 1.256) * 9));
  L.land!.bells = { muffled: mid, bells, hush: { x: mid.x, y: mid.y, r: 14 } };
  const put = (name: string, at: { x: number; y: number }): void => {
    L.props.push({ kind: 'piece', name, tx: Math.floor(at.x), ty: Math.floor(at.y), x: at.x, y: at.y, solid: true, state: 0, variant: 0 });
  };
  put('the market bell (the Muffled Bell)', mid);
  for (const b of bells) put("a wayside shrine's bell", b);
  (g as unknown as Inside).bellsMade();
  assert.ok(L.bells, 'the Bells are made');
  g.monsters.length = 0;
  return { g, L, B: L.bells! };
}

function act2<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}

const step = (g: Game, secs: number): void => {
  for (let i = 0; i < Math.round(secs / 0.05); i++) {
    g.hero.life = g.hero.d.maxLife;
    g.update(0.05, emptyControls());
  }
};

test('asleep until the Muffled Bell is struck: then the Hush is on, the clock 15 seconds a bell, every bell awake', () => act2(() => {
  const { g, L, B } = withBells();
  assert.equal(B.phase, 'asleep');
  assert.equal(B.limit, 5 * BELLS_TUNE.perBell);
  assert.ok(B.first > 100, `the Hush lies on ${B.first} tiles`);
  // (a hit nowhere near does nothing)
  (g as unknown as Inside).bellsStruck(B.plan.muffled.x + 6, B.plan.muffled.y, 0.5);
  assert.equal(B.phase, 'asleep');
  (g as unknown as Inside).bellsStruck(B.plan.muffled.x + 0.6, B.plan.muffled.y, 0.5);
  assert.equal(B.phase, 'on');
  assert.equal(L.props[B.muffled].state, 1, 'the Muffled Bell swinging');
  for (const k of B.props) assert.equal(L.props[k].state, 1, 'awake');
}));

test('the Hush raises the floor\'s own, more and more the longer it lasts, inside it and awake; never more than its most', () => act2(() => {
  const { g, B } = withBells();
  g.hero.x = B.plan.muffled.x;
  g.hero.y = B.plan.muffled.y + 1.2;
  (g as unknown as Inside).bellsStruck(B.plan.muffled.x, B.plan.muffled.y, 0.5);
  assert.ok(gapAt(60) < gapAt(0) && sizeAt(60) > sizeAt(0), 'the ramp');
  step(g, 20);
  assert.ok(B.risen > 0, 'some have risen');
  for (const m of g.monsters) if (B.ids.includes(m.id)) assert.notEqual(m.state, 'sleep');
  assert.ok(B.ids.length <= BELLS_TUNE.most);
}));

test('each bell rung chips the Hush back, calls a tough one (a leader, tougher each time), and the last shatters it: the explosion', () => act2(() => {
  const { g, L, B } = withBells();
  (g as unknown as Inside).bellsStruck(B.plan.muffled.x, B.plan.muffled.y, 0.5);
  const lifeOf: number[] = [];
  for (let i = 0; i < B.plan.bells.length; i++) {
    const left = B.left;
    const before = g.monsters.length;
    const b = B.plan.bells[i];
    (g as unknown as Inside).bellsStruck(b.x, b.y, 0.6);
    assert.ok(B.rung[i]);
    assert.equal(L.props[B.props[i]].state, 2, 'rung');
    assert.ok(B.left <= left, 'the Hush chipped back');
    assert.equal(B.mask[Math.floor(b.y) * L.floor.w + Math.floor(b.x)], 0, 'none of it left at the bell');
    if (i < B.plan.bells.length - 1) {
      const tough = g.monsters.slice(before).find((m) => m.elite);
      assert.ok(tough, `a tough one at bell ${i + 1}`);
      lifeOf.push(tough!.maxLife);
    }
  }
  for (let k = 1; k < lifeOf.length; k++) assert.ok(lifeOf[k] > lifeOf[k - 1] * 1.1, 'each tougher than the last');
  assert.ok(B.left < B.first * 0.8, `the Hush chipped well back (${B.left} of ${B.first})`);
  assert.equal(B.phase, 'won');
  const drops = g.drops.map((d) => d.kind);
  assert.ok(drops.filter((k) => k === 'item').length >= B.plan.bells.length, 'gear');
  assert.ok(drops.includes('gold'), 'gold');
  for (const id of B.ids) assert.ok(!g.monsters.some((m) => m.id === id && !m.dead), 'what the Hush raised falls with it');
}));

test('time out: the Hush lifts, no explosion; the bells still to ring fall quiet', () => act2(() => {
  const { g, L, B } = withBells();
  (g as unknown as Inside).bellsStruck(B.plan.muffled.x, B.plan.muffled.y, 0.5);
  const b = B.plan.bells[0];
  (g as unknown as Inside).bellsStruck(b.x, b.y, 0.6);
  g.drops.length = 0;
  step(g, B.limit + 1);
  assert.equal(B.phase, 'lost');
  assert.ok(!g.drops.some((d) => d.kind === 'item' && Math.hypot(d.x - B.plan.muffled.x, d.y - B.plan.muffled.y) < 2), 'no explosion');
  assert.equal(L.props[B.props[1]].state, 0);
  assert.equal(L.props[B.props[0]].state, 2, 'the one rung stays rung');
}));

test('with ACT2 off there are no Bells', () => {
  const g = seasoned(new Game('warrior', 12), 30);
  g.depth = 11;
  g.enterDungeon();
  assert.equal(g.level.bells, undefined);
  void makeBells;
});
