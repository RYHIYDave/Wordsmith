// THE RIVERS ARE FLAT WATER: SEEN ACROSS, AND THE SWIPE MOVE GOES OVER THEM (behind LEAP_WATER, off until his yes to the game's
// film of it). The owner, 23 Oct 2026, 11:42 (Pacific), of floor 13's river and mill race: “I would love to be able to swipe
// move over rivers or flat paths”. Up to now a river's water (and the mill race's) is laid as wall, as a forest's edge is:
// it stops a body, and sight and shots and the swipe moves with it. So (LEAP_WATER) its tiles, the Pinewood's river and the
// Millrace's river and race (game/act1_layout.ts Land.river, Land.race), are WATER (`Level.water`): open to sight, so that
// what is across it is seen and shot at, and the Lunge and the Warp land across it where there is ground in reach; the
// ranger's roll goes over it as over a pit (game.ts overPoint). Still nobody walks into it.

import { laneDist } from './act1_layout';
import type { Land } from './act1_layout';
import type { Level } from './state';

/** THE SWITCH. */
export const LEAP_WATER = { on: true };

/** How far from a river's middle line, and from a race's, a tile's middle may be and its tile be water (tiles): the open ground stops at 0.95 and 0.5 (act2/millrace.ts MR_WET, the Pinewood's the same), and the bank's tile beyond it is water's too. */
export const WATER_REACH = { river: 1.5, race: 1.0 };

/** Mark a floor's river and race tiles as water: open to sight, and over them the swipe moves go. Returns how many. */
export function markWater(L: Level, land: Land): number {
  const f = L.floor;
  const river = land.river && land.river.length > 1 ? { pts: land.river, w: 0 } : null;
  const race = land.race && land.race.length > 1 ? { pts: land.race, w: 0 } : null;
  if (!river && !race) return 0;
  const water = new Uint8Array(f.w * f.h);
  let n = 0;
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; x++) {
      const i = y * f.w + x;
      if (L.walk[i] === 1) continue;
      const cx = x + 0.5;
      const cy = y + 0.5;
      if ((river && laneDist(river, cx, cy) < WATER_REACH.river) || (race && laneDist(race, cx, cy) < WATER_REACH.race)) {
        water[i] = 1;
        L.open[i] = 1;
        n++;
      }
    }
  }
  L.water = water;
  return n;
}
