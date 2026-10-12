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

// ---------------------------------------------------------------------------------------------------
// EACH FLOOR'S OWN PIECES (game/first5.ts lays them; render/dress.ts draws them)

import { wardenGates, wardenPieces } from './floor1';
import { headsmanGates, headsmanPieces } from './floor2';
import { chainedGates, chainedPieces } from './floor3';
import { ossuaryGates, ossuaryPieces } from './floor4';
import { lairGates, lairPieces } from './floor5';
import type { Piece } from './floor1';
import type { GateArt } from './gates';
import { makeHazardArt } from './hazards';
import type { HazardArt } from './hazards';
import { CRYPT_FLOORS } from './crypt';
import { LAIR } from './lair';

const PIECES = new Map<number, Map<string, Piece>>();
/** The pieces of look `k` (1 to 5) by name, made the first time they are asked for (a quarter to half a second), and kept until `forgetPieces`. */
export function lookPieces(k: number): Map<string, Piece> {
  let m = PIECES.get(k);
  if (!m) {
    const list = k === 1 ? wardenPieces() : k === 2 ? headsmanPieces() : k === 3 ? chainedPieces() : k === 4 ? ossuaryPieces() : lairPieces();
    PIECES.set(k, (m = new Map(list.map((p) => [p.name, p]))));
  }
  return m;
}
/** Let go of every floor's pieces but this one's (they are made again if they are wanted). */
export function forgetPieces(keep: number): void {
  for (const k of [...PIECES.keys()]) if (k !== keep) PIECES.delete(k);
}

/** The doors and gates of look `k` (1 to 5): its stone, the marks over its gates, its doors' leaves. */
export function lookGates(k: number): GateArt {
  return k === 1 ? wardenGates() : k === 2 ? headsmanGates() : k === 3 ? chainedGates() : k === 4 ? ossuaryGates() : lairGates();
}

const HAZARDS = new Map<number, HazardArt>();
/**
 * The traps of look `k` (1 to 5), as the game draws them (art/hazards.ts): a spike floor's holes and the
 * dart trap's plate and its slot the floor's own pieces (game/first5.ts FLOOR_SETS, `traps`); the spikes
 * that come up out of the holes the game's, in the floor's stone.
 */
export function lookHazards(k: number, traps: { holes: string; plate: string; slot: string }): HazardArt {
  let h = HAZARDS.get(k);
  if (h) return h;
  const base = makeHazardArt(k === 5 ? LAIR : CRYPT_FLOORS[Math.max(1, Math.min(4, k)) - 1]);
  const P = lookPieces(k);
  const holes = P.get(traps.holes)?.frames;
  const plate = P.get(traps.plate)?.frames;
  const slot = P.get(traps.slot);
  h = {
    holes: (glint) => (holes ? holes[glint && holes[1] ? 1 : 0] : base.holes(glint)),
    spike: (n) => base.spike(n),
    plate: (pressed) => (plate ? plate[pressed && plate[1] ? 1 : 0] : base.plate(pressed)),
    slot: (alongX) => {
      const s = slot ? (alongX ? slot.left : slot.right) : null;
      return s && s[0] ? s[0] : base.slot(alongX);
    },
  };
  HAZARDS.set(k, h);
  return h;
}
