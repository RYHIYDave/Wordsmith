// ACT 1, THE DESCENT: A FLOOR OF IT AS THE GAME HOLDS A LEVEL. Its open ground laid (game/act1_layout.ts), the
// level made of it as a dungeon's is (game/level.ts, `finish`: what can be walked, seen, shot through), and its
// ways: the waypoint where the hero comes in (as on every floor from the second), and THE WAY ON at the far end
// of the boss's ground, asleep until the boss dies (game/ways.ts, `Ways.onward`); no stairwell, no gate. Then the
// floor laid with its own pieces, last, by dice of its own (game/act1_dress.ts).

import { act2Floor } from './act1';
import { generateAct1 } from './act1_layout';
import { generateAct2 } from './act2_layout';
import { dressAct1 } from './act1_dress';
import { finish } from './level';
import type { Level } from './state';
import { EXITS, layOnward, placeWay } from './ways';
import { LEAP_WATER, markWater } from './water';

export function makeAct1Level(depth: number, seed: number): Level {
  // (ACT 2, THE HUSH: floors 11 to 15 by map-makers of their own, game/act2/)
  const { floor, land } = act2Floor(depth) ? generateAct2(depth, seed) : generateAct1(depth, seed);
  const level = finish(floor, false, null);
  level.land = land;
  // (LEAP_WATER: the rivers and the mill race flat water, seen across and leapt over: game/water.ts)
  if (LEAP_WATER.on) markWater(level, land);
  const solidAt = new Uint8Array(floor.w * floor.h);
  for (const p of level.props) if (p.solid) solidAt[p.ty * floor.w + p.tx] = 1;
  // (EXITS, floors 6 to 10: the way on and the start as the art chat painted them, their pieces' tiles solid, before the
  // waypoint is put by the start: game/ways.ts, `layOnward`)
  const a1 = EXITS.on ? layOnward(floor, land.exit, level.walk) : null;
  const way = placeWay(floor, (i) => level.walk[i] === 1 && solidAt[i] === 0);
  const onward = { x: land.exit.x, y: land.exit.y, awake: false, warpAt: null };
  level.ways = { stair: null, stairs: [], way, gate: -1, shaft: null, onward, ...(a1 ? { a1 } : {}) };
  level.act1 = dressAct1(level, depth, seed) ?? undefined;
  return level;
}
