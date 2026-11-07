// ENEMIES COMING IN UP OUT OF RIFTS (game/arrivals.ts ARRIVALS, off). His words, 7 Nov 2026, 00:05 (Eastern): “make the enemies
// coming in a little more dramaitc than just spawning into thin air”. On: what the Hush raises and a stronghold's waves come up out
// of rifts, among the monsters only once they are out; a wave is not over, nor the stronghold won, while any of it is still coming.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ARRIVALS } from '../src/game/arrivals';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { GameEvent } from '../src/game/state';
import { seasoned } from './helpers';

interface Inside {
  bellsStruck(x: number, y: number, rad: number): void;
}

function withArrivals<T>(fn: () => T): T {
  const was = ARRIVALS.on;
  ARRIVALS.on = true;
  try {
    return fn();
  } finally {
    ARRIVALS.on = was;
  }
}

test('off: the Hush raises its own straight among the monsters', () => {
  const was = ARRIVALS.on;
  ARRIVALS.on = false;
  try {
  const g = seasoned(new Game('warrior', 3), 28);
  (g as unknown as { god: boolean }).god = true;
  g.depth = 11;
  g.cleared = 10;
  g.enterDungeon();
  const B = g.level.bells!;
  g.monsters = g.monsters.filter((m) => m.boss);
  g.hero.x = B.plan.muffled.x - 1.2;
  g.hero.y = B.plan.muffled.y + 1.6;
  (g as unknown as Inside).bellsStruck(B.plan.muffled.x, B.plan.muffled.y, 0.5);
  for (let k = 0; k < 60; k++) g.update(1 / 30, emptyControls());
  assert.equal(g.risers.length, 0);
  assert.ok(g.monsters.some((m) => !m.dead && !m.boss), 'the Hush has raised some');
  } finally {
    ARRIVALS.on = was;
  }
});

test('on: the Hush raises its own up out of rifts; among the monsters once out; counted toward its most meanwhile', () => {
  withArrivals(() => {
    const g = seasoned(new Game('warrior', 3), 28);
    (g as unknown as { god: boolean }).god = true;
    g.depth = 11;
    g.cleared = 10;
    g.enterDungeon();
    const B = g.level.bells!;
    g.monsters = g.monsters.filter((m) => m.boss);
    g.hero.x = B.plan.muffled.x - 1.2;
    g.hero.y = B.plan.muffled.y + 1.6;
    (g as unknown as Inside).bellsStruck(B.plan.muffled.x, B.plan.muffled.y, 0.5);
    const opened: GameEvent[] = [];
    let saw = false;
    for (let k = 0; k < 120 && !saw; k++) {
      g.update(1 / 30, emptyControls());
      for (const e of g.events) if (e.t === 'arrive' && e.what === 'open') opened.push(e);
      if (g.risers.length) saw = true;
    }
    assert.ok(saw, 'some are coming up');
    assert.ok(opened.length >= g.risers.length, 'a rift opened for each');
    const coming = g.risers.map((r) => r.m.id);
    assert.ok(coming.every((id) => !g.monsters.some((m) => m.id === id)), 'not among the monsters while coming up');
    assert.ok(coming.every((id) => B.ids.includes(id)), "the Hush's own while coming up");
    for (let k = 0; k < Math.ceil((ARRIVALS.rise + ARRIVALS.apart * 8) * 30) + 2; k++) g.update(1 / 30, emptyControls());
    assert.ok(coming.every((id) => g.monsters.some((m) => m.id === id)), 'among the monsters once out');
  });
});

test('on: a stronghold is not won while its last wave is still coming up out of the floor', () => {
  withArrivals(() => {
    const g = seasoned(new Game('warrior', 9), 14);
    (g as unknown as { god: boolean }).god = true;
    g.depth = 6;
    g.cleared = 5;
    g.enterDungeon();
    const L = g.level;
    const q = L.land!.holds[0];
    const st = L.holds![0];
    st.open = true;
    for (const m of g.monsters) if (m.packId >= 9100) m.dead = true;
    g.hero.x = q.gx - 0.5;
    g.hero.y = q.gy + 0.4;
    for (let k = 0; k < 90 && !st.entered; k++) g.update(1 / 30, emptyControls());
    assert.ok(st.entered, 'in the hall');
    assert.equal(st.wave, 1);
    assert.ok(g.risers.length > 0, 'its first wave comes up out of rifts');
    // (a few steps on: none of it out yet; the wave is not over and no second comes)
    for (let k = 0; k < 6; k++) g.update(1 / 30, emptyControls());
    assert.equal(st.wave, 1);
    assert.ok(!st.coming, 'the next wave is not called while this one is still coming up');
    assert.ok(!st.won);
  });
});
