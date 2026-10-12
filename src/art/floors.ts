// THE FIRST FIVE FLOORS: where the game gets each floor's own look. The Crypt's four floors (art/crypt.ts)
// and the fifth, the Fleshmancer's lair (art/lair.ts: the owner's yes to it, as shown, by 16:42 on 11 Oct
// 2026: "Yes, on to the cultists (Recommended)", offered as "Floor 5 goes to the main chat to build in").
// Until the fifth was put in, a floor deeper than the fourth looked as the fourth (cryptFloor); it still
// does past the fifth, and with FIRST5 off (game/ways.ts) the fifth does too.

import { FIRST5 } from '../game/ways';
import { cryptFloor, cryptGround, cryptProps, cryptWays } from './crypt';
import type { WaypointArt } from './crypt_ways';
import type { GroundArt } from './ground';
import { lairGround, lairProps, lairWaypoint } from './lair';
import type { DungeonProps } from './props';
import type { Sprite } from '../engine/px';

/** Which look a dungeon of this depth has: 1 to 4 the Crypt's floors (a deeper one as the fourth), 5 the lair; 0 none (the town). */
export function floorLook(depth: number): number {
  return FIRST5.on && Math.floor(depth) === 5 ? 5 : cryptFloor(depth);
}

/** The floor and walls of look `k` (1 to 5). */
export function lookGround(k: number): GroundArt {
  return k === 5 ? lairGround() : cryptGround(k);
}

/** What stands and lies in look `k` (1 to 5): the game's braziers, chests, barrels and the rest, in its stone. */
export function lookProps(k: number): DungeonProps {
  return k === 5 ? lairProps() : cryptProps(k);
}

/** The stairwell (each way down) and the waypoint of look `k` (1 to 5; the lair has no stairwell of its own: its way out is the mine shaft). */
export function lookWays(k: number): { stair: Record<'x' | 'y', Sprite>; way: WaypointArt } {
  if (k !== 5) return cryptWays(Math.max(1, k));
  return { stair: cryptWays(4).stair, way: lairWaypoint() };
}
