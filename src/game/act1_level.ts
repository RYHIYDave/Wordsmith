// ACT 1, THE DESCENT: A FLOOR OF IT AS THE GAME HOLDS A LEVEL. Its open ground laid (game/act1_layout.ts), the
// level made of it as a dungeon's is (game/level.ts, `finish`: what can be walked, seen, shot through), and its
// ways: the waypoint where the hero comes in (as on every floor from the second), and THE WAY ON at the far end
// of the boss's ground, asleep until the boss dies (game/ways.ts, `Ways.onward`); no stairwell, no gate. Then the
// floor laid with its own pieces, last, by dice of its own (game/act1_dress.ts).

import { generateAct1 } from './act1_layout';
import { dressAct1 } from './act1_dress';
import { finish } from './level';
import type { Level } from './state';
import { placeWay } from './ways';

export function makeAct1Level(depth: number, seed: number): Level {
  const { floor, land } = generateAct1(depth, seed);
  const level = finish(floor, false, null);
  level.land = land;
  const solidAt = new Uint8Array(floor.w * floor.h);
  for (const p of level.props) if (p.solid) solidAt[p.ty * floor.w + p.tx] = 1;
  const way = placeWay(floor, (i) => level.walk[i] === 1 && solidAt[i] === 0);
  const onward = { x: land.exit.x, y: land.exit.y, awake: false, warpAt: null };
  level.ways = { stair: null, stairs: [], way, gate: -1, shaft: null, onward };
  level.act1 = dressAct1(level, depth, seed) ?? undefined;
  return level;
}
