// ARCS KEEP JUMPING (game/defs.ts ARC_CHAIN, off until his yes). His words, 12 Nov 2026, 19:24: “Same kind of thing with all the
// jumping lightning bolts if you focused really hard into lightning as a mage.”; his pick: “Arcs keep jumping (Recommended)”. Checks:
//   1. on, a Lightning hit's arcs each jump on, enemy to enemy, as many jumps as it has arcs, reaching further; off (the game as it
//      is), each arc strikes once.
import './companions_on';
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { ARC_CHAIN } from '../src/game/defs';
import type { GameEvent } from '../src/game/state';
import { dummy, room, steady, tap, wait, words } from './uniques_helpers';

/** The Mage with Lightning on her tap, a crowd before her in a long line; the arcs seen, and the hit's arcs. */
function crowd(): { arcs: number; seen: Extract<GameEvent, { t: 'arc' }>[] } {
  const g = room('mage');
  words(g, 0, ['lightning']);
  steady(g);
  const first = dummy(g, 2, 0);
  void first;
  for (let k = 1; k <= 30; k++) dummy(g, 2 + (k % 6) * 1.1, Math.floor(k / 6) * 1.1 - 2.2);
  const ev: GameEvent[] = tap(g, 1, 0, 0.1);
  ev.push(...wait(g, 1.5));
  const seen = ev.filter((e): e is Extract<GameEvent, { t: 'arc' }> => e.t === 'arc' && !(e as { sky?: boolean }).sky);
  return { arcs: g.hero.skills[0].r.arcs, seen };
}

test('1. on: each arc jumps on, as many jumps as the hit has arcs; off, as the game is, each arc strikes once', () => {
  const off = crowd();
  ARC_CHAIN.on = true;
  let on: ReturnType<typeof crowd>;
  try {
    on = crowd();
  } finally {
    ARC_CHAIN.on = false;
  }
  assert.ok(off.arcs >= 2, `arcs ${off.arcs}`);
  // (her bolt goes through the crowd: each of its hits arcs; switched on, each of those arcs jumps on as many times again)
  assert.ok(off.seen.length > 0 && off.seen.length % off.arcs === 0, `off: ${off.seen.length} for ${off.arcs} arcs a hit`);
  assert.equal(on.seen.length, off.seen.length * on.arcs, `on: ${on.seen.length}, off: ${off.seen.length}`);
  // (and they reach further than the first arcs can: past their 3.5 tiles from where she struck)
  const far = (e: { x1: number; y1: number }): number => Math.hypot(e.x1 - off.seen[0].x0, e.y1 - off.seen[0].y0);
  assert.ok(Math.max(...on.seen.map(far)) > Math.max(...off.seen.map(far)));
});
