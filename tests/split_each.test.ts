// SPLITTING, EACH ARROW (game/defs.ts SPLIT_EACH). His question, 12 Nov 2026, 19:17, of Split Shot, Splitting on his tap and Threefold:
// “How many arrows should there be from all that combined?”; his pick: “Every arrow splits, 21 (Recommended)”. Checks:
//   1. the Fan with Splitting on Shot: each of its three arrows, striking its own enemy, breaks into copies (three splits, not one);
//   2. one arrow alone splits once a use, as before; and off, the Fan's three split once a use, as before.
import './companions_on';
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { SPLIT_EACH } from '../src/game/defs';
import type { Game } from '../src/game/game';
import type { GameEvent } from '../src/game/state';
import { UNIQUE_TUNE } from '../src/game/uniques';
import { dummy, on, room, steady, tap, wait, wear, words } from './uniques_helpers';

const T = UNIQUE_TUNE;
/** The Ranger with Splitting on Shot, three enemies spread before him (each with others near it to split onto); the splits seen. */
function fan(worn: boolean): number {
  const g: Game = worn ? wear(room('ranger'), 'fan') : room('ranger');
  words(g, 0, ['splitting']);
  steady(g);
  for (const k of [-1, 0, 1]) {
    const a = k * T.fan.spread;
    dummy(g, 5 * Math.cos(a), 5 * Math.sin(a));
    dummy(g, 6.4 * Math.cos(a), 6.4 * Math.sin(a));
  }
  const ev: GameEvent[] = tap(g, 1, 0, 0.1);
  ev.push(...wait(g, 0.8));
  return ev.filter((e) => e.t === 'split').length;
}

test('1. the Fan with Splitting on Shot: each of its three arrows breaks into copies', () =>
  on(() => {
    assert.equal(SPLIT_EACH.on, true);
    assert.equal(fan(true), 3);
  }));

test('2. one arrow alone splits once a use, as before; off, the Fan splits once a use', () =>
  on(() => {
    assert.equal(fan(false), 1);
    SPLIT_EACH.on = false;
    try {
      assert.equal(fan(true), 1);
    } finally {
      SPLIT_EACH.on = true;
    }
  }));
