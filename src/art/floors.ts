// THE FIRST FIVE FLOORS: where the game gets each floor's own look. The Crypt's four floors (art/crypt.ts)
// and the fifth, the Fleshmancer's lair (art/lair.ts: the owner's yes to it, as shown, by 16:42 on 11 Oct
// 2026: "Yes, on to the cultists (Recommended)", offered as "Floor 5 goes to the main chat to build in").
// Until the fifth was put in, a floor deeper than the fourth looked as the fourth (cryptFloor); it still
// does past the fifth, and with FIRST5 off (game/ways.ts) the fifth does too.

import { CHAPEL, chapelSteps, makeChapelArt } from './chapel';
import { TOMB, makeTombArt, tombSteps, tombStairwell } from './tomb';
import { LAIR_TEMPLE, makeLairTempleArt } from './lair_temple';
import { PRISON, makePrisonArt } from './prison';
import { GROUNDS, makeGroundsArt } from './grounds';
import { FIRST5 } from '../game/ways';
import { cryptFloor, cryptGround, cryptGroundSteps, cryptProps, cryptWaySteps, cryptWays } from './crypt';
import { Ahead } from '../engine/steps';
import type { LoadStep } from '../engine/steps';
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
/** (LOAD_SLICE) The same as steps of the loading screen's: the Crypt's floors' a picture a step (art/crypt.ts cryptGroundSteps), the lair's at once. */
export function lookGroundSteps(k: number): LoadStep[] {
  return k === 5 ? [() => void lairGround()] : cryptGroundSteps(k);
}

/** What stands and lies in look `k` (1 to 5): the game's braziers, chests, barrels and the rest, in its stone. */
export function lookProps(k: number): DungeonProps {
  return k === 5 ? lairProps() : cryptProps(k);
}

/**
 * FLOOR 1'S STAIRWELL, made once and kept (25.2.4: till then it was made again every frame floor 1 was drawn, and every frame
 * of the town as it was first drawn, some 40% of floor 1's frame on this machine; render.ts waysOf).
 */
let tombStair: Record<'x' | 'y', Sprite> | null = null;
/** The stairwell (each way down) of look `k` alone (the town's are floor 1's), without making the rest of that floor's pictures. */
export function lookStairs(k: number): Record<'x' | 'y', Sprite> {
  if (k === 1 && TOMB.on) return (tombStair ??= { x: STAIRS_AHEAD.take('x', () => tombStairwell('x')), y: STAIRS_AHEAD.take('y', () => tombStairwell('y')) });
  return lookWays(k).stair;
}
/** (THE LOADING SCREEN'S WORK IN SLICES, main.ts LOAD_SLICE) Floor 1's two stairwells, made ahead a step each. */
const STAIRS_AHEAD = new Ahead();
/** The steps that make look `k`'s stairwells alone, a way a step (none where they are made), then them. */
export function lookStairSteps(k: number): LoadStep[] {
  if (!(k === 1 && TOMB.on)) return [() => void lookStairs(k)];
  if (tombStair) return [];
  return [STAIRS_AHEAD.step('x', () => tombStairwell('x')), STAIRS_AHEAD.step('y', () => tombStairwell('y')), () => void lookStairs(1)];
}

/** The stairwell (each way down) and the waypoint of look `k` (1 to 5; the lair has no stairwell of its own: its way out is the mine shaft). */
export function lookWays(k: number): { stair: Record<'x' | 'y', Sprite>; way: WaypointArt } {
  // (FLOOR 1, THE KING'S TOMB, behind TOMB: its stairwell in the tomb's stone; its waypoint the Crypt's)
  if (k === 1 && TOMB.on) {
    makeTombArt();
    return { stair: lookStairs(1), way: cryptWays(1).way };
  }
  if (k !== 5) return cryptWays(Math.max(1, k));
  return { stair: cryptWays(4).stair, way: lairWaypoint() };
}

/**
 * (THE LOADING SCREEN'S WORK IN SLICES, main.ts LOAD_SLICE) Look `k`'s ways made as steps, a part a step where they are the
 * Crypt's (art/crypt.ts cryptWaySteps), then as lookWays makes them. None where they are made.
 */
export function lookWaySteps(k: number): LoadStep[] {
  const crypt = k === 1 && TOMB.on ? 1 : k !== 5 ? Math.max(1, k) : 4;
  return [...cryptWaySteps(crypt), ...(k === 1 && TOMB.on ? lookStairSteps(1) : []), () => void lookWays(k)];
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
    // (FLOOR 3, THE BLACK IRON PRISON, behind PRISON: floor 3's own pieces in look B's colours, and the prison's chains: art/prison.ts)
    // (FLOOR 4, THE BURIED CHAPEL, behind CHAPEL: floor 4's own pieces in look A's colours, and the chapel's own: art/chapel.ts;
    // FLOOR 5, THE MINE AND THE TEMPLE, behind LAIR_TEMPLE: floor 5's own in look A's colours, and the place's own: art/lair_temple.ts)
    // (FLOOR 1, THE KING'S TOMB, behind TOMB: floor 1's own pieces in look B's colours, and the place's own: art/tomb.ts)
    // (FLOOR 2, THE PRISON'S GROUNDS, behind GROUNDS: floor 2's own pieces in the night's colours, and the grounds' own: art/grounds.ts)
    const list = k === 1 ? (TOMB.on ? makeTombArt().pieces : wardenPieces()) : k === 2 ? (GROUNDS.on ? makeGroundsArt().pieces : headsmanPieces()) : k === 3 ? (PRISON.on ? makePrisonArt().pieces : chainedPieces()) : k === 4 ? (CHAPEL.on ? makeChapelArt().pieces : ossuaryPieces()) : LAIR_TEMPLE.on ? makeLairTempleArt().pieces : lairPieces();
    PIECES.set(k, (m = new Map(list.map((p) => [p.name, p]))));
  }
  return m;
}
/**
 * (THE LOADING SCREEN'S WORK IN SLICES, main.ts LOAD_SLICE) Look `k`'s pieces made as steps: its builder first (it makes them
 * all at once), then the pieces by name. None where they are made.
 */
export function lookPieceSteps(k: number): LoadStep[] {
  if (PIECES.has(k)) return [];
  // (FLOOR 1'S TOMB and FLOOR 4'S CHAPEL, the two slowest, their builders a part a step (each 1.1 to 1.5 s made at once under the
  // loading screen, measured in Chrome by the Loading-frames chat); the queue's make-floors-look-builders-in-parts: art/tomb.ts
  // tombSteps, art/chapel.ts chapelSteps. The others as one step, as before)
  const parts = k === 1 && TOMB.on ? tombSteps() : k === 4 && CHAPEL.on ? chapelSteps() : [];
  return [...parts, () => void lookPieces(k)];
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
  // (the floor's own pieces looked up the first time a hole, a plate or a slot is drawn, and held from then on, not as the art is
  // made: FLOORS 6 TO 20 take floor 4's traps for their spikes rising (main.ts placeFrame: floorLook of a deeper floor is 4), and
  // draw their holes with Act 1's own pictures, never these: made here, floor 4's pieces cost them about 1.4 s for nothing. The
  // same pictures wherever one is drawn: render/pieces.ts has made the floor's pieces already on floors 1 to 5)
  let own: { holes?: Sprite[]; plate?: Sprite[]; slot?: Piece } | null = null;
  const P = (): NonNullable<typeof own> => {
    if (!own) {
      const m = lookPieces(k);
      own = { holes: m.get(traps.holes)?.frames, plate: m.get(traps.plate)?.frames, slot: m.get(traps.slot) };
    }
    return own;
  };
  h = {
    holes: (glint) => {
      const holes = P().holes;
      return holes ? holes[glint && holes[1] ? 1 : 0] : base.holes(glint);
    },
    spike: (n) => base.spike(n),
    plate: (pressed) => {
      const plate = P().plate;
      return plate ? plate[pressed && plate[1] ? 1 : 0] : base.plate(pressed);
    },
    slot: (alongX) => {
      const slot = P().slot;
      const s = slot ? (alongX ? slot.left : slot.right) : null;
      return s && s[0] ? s[0] : base.slot(alongX);
    },
  };
  HAZARDS.set(k, h);
  return h;
}
