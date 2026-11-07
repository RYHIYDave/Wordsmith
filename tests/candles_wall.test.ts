// FLOOR 1'S GUTTERING CANDLES AGAINST A WALL (game/first5.ts CANDLES_BY_WALL). His words, 7 Nov 2026, 12:38: “I like the
// guttering candles but they kinda stick out like a sore thumb in a big pile in the middle of the floor”; shown them against a
// wall, by 13:35: “Yes, put it in (Recommended)”. On every floor 1 laid, the candles' moment stands against a wall the eye sees
// (the wall behind it along x or y), the floor round it plain and walked; off, anywhere in a room, as before.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { CANDLES_BY_WALL } from '../src/game/first5';
import { Game } from '../src/game/game';
import { T_WALL } from '../src/game/types';
import { seasoned } from './helpers';

function floor1(seed: number): Game {
  const g = seasoned(new Game('warrior', seed), 3);
  g.depth = 1;
  g.cleared = 0;
  g.enterDungeon();
  return g;
}

test('the switch is on, at his word', () => {
  assert.equal(CANDLES_BY_WALL.on, true);
});

test('on every floor 1 laid, the candles stand against a wall the eye sees, the floor before them walked', () => {
  let n = 0;
  let corners = 0;
  for (let seed = 1; seed <= 14; seed++) {
    const g = floor1(seed);
    const host = g.level.dress?.moments.find((m) => m.n === 2);
    if (!host) continue;
    n++;
    const f = g.level.floor;
    const x = Math.floor(host.x);
    const y = Math.floor(host.y);
    const backY = f.tiles[(y - 1) * f.w + x] === T_WALL;
    const backX = f.tiles[y * f.w + x - 1] === T_WALL;
    assert.ok(backY || backX, `seed ${seed}: the candles at ${x}, ${y} have a wall behind them`);
    if (backX && backY) corners++;
    const prop = g.level.props.find((p) => p.name === 'candles' && Math.floor(p.x) === x && Math.floor(p.y) === y);
    assert.ok(prop, `seed ${seed}: the candles laid there`);
    // (the tile out before them walked: nothing is shut in behind them)
    assert.equal(g.level.walk[(y + (backY ? 1 : 0)) * f.w + x + (backX ? 1 : 0)], 1, `seed ${seed}: the floor before them walked`);
  }
  assert.ok(n >= 10, `${n} floors with the candles`);
  assert.ok(corners >= 1, `${corners} in a corner`);
});

test('off, as before: anywhere in a room (not kept from the middle of it)', () => {
  CANDLES_BY_WALL.on = false;
  try {
    let open = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const g = floor1(seed);
      const host = g.level.dress?.moments.find((m) => m.n === 2);
      if (!host) continue;
      const f = g.level.floor;
      const x = Math.floor(host.x);
      const y = Math.floor(host.y);
      if (f.tiles[(y - 1) * f.w + x] !== T_WALL && f.tiles[y * f.w + x - 1] !== T_WALL) open++;
    }
    assert.ok(open >= 4, `${open} of them out in the open`);
  } finally {
    CANDLES_BY_WALL.on = true;
  }
});
