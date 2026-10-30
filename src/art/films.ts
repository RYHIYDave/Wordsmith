// THE FIRST FIVE FLOORS: THE FILMS OF A FLOOR, BY NAME, for whoever paints them: the painter's worker
// (render/painter.ts), or the game itself where there is no worker.
//
// A film is seconds of painting in one call, and tens of megabytes of pictures: a floor's moments
// (art/floor1.ts to floor5_moments.ts), the stairwell breaking open as its boss dies
// (art/stairwell_open.ts), the cage coming down the mine shaft and the ride up (art/shaft.ts). The art
// chat's makers make each the first time it is asked for and keep it. Here each has a key:
//   moments:<floor>            floors 1 to 3: all three of the floor's moments (they are made together)
//   moment:<floor>:<n>         floors 4 and 5: one of the floor's moments; ACT 2, THE HUSH: floors 11 to 15, their one
//                              moment each (art/floor11_moments.ts to floor15_moments.ts), n 0: where game/act2_moments.ts
//                              lays it, played by render/act1_pieces.ts
//   stair:<floor>:<way>:<x>:<y>  the stairwell's opening on that floor, its steps going down toward +x
//                              or +y, its anchor on tile (x, y)
//   shaft:down, shaft:up       the cage coming down as the Fleshmancer dies; the ride up to town
//   cave:<x|y>                 EXITS: floor 4's wall giving way to the cave, in a face along x or y (art/cave4.ts); with
//                              the wall standing before it and the cave after, in its two layers
//   mouth:<x|y>                EXITS: floor 5's mouth, the cave's other end (art/cave4.ts), in its two layers
//   town:ways:<x|y>            EXITS: the town's stairs down, the shaft's head with its cage, the gate's bars, their
//                              unbarring and what is left of them, the gate in a plane along x or y (art/town_ways.ts)
//   town:arrive                EXITS: the cage coming up into the town with him in it (art/town_ways.ts)
//   up:1:<x|y>                 EXITS: floor 1's stairs up to the town, in its gate's arch (art/town_ways.ts)
//   onward:<floor>:<dir>       EXITS: floors 6 to 10's way on (art/act1_ways.ts), leading on toward x+, x-, y+ or y-:
//                              shut, its film as the boss dies, open, each in its two layers (art/ways_kit.ts WayArt)
//   start:<floor>:<dir>        EXITS: where floors 6 to 10 begin, the piece he came out of behind him, the way back
//                              toward x+, x-, y+ or y- (art/ways_kit.ts StartArt)
//   things:unfinished          ACT 1: what floor 6's boss throws and leaves (its hurled block tumbling and lying, its
//                              rockslide's boulders rolling, the terrace cracked under its stomp), painted ahead so
//                              that none of it is painted in its fight (17 Oct: his "serious slowdown" in the rock throw)
//   things:princess            (THE HIGH CITY, FLOOR 16) what the Princess casts and sends (her snare's cage, her Vow's
//                              ring, her swans circling and diving: art/act1_figs/princess.ts princessThings)
// and comes as plain things and pictures (no functions), so that it can be handed from the worker to
// the page.

import type { Sprite } from '../engine/px';
import { CRYPT_FLOORS } from './crypt';
import { wardenMoments } from './floor1';
import { headsmanMoments } from './floor2';
import { chainedMoments } from './floor3';
import { ossuaryMoment } from './floor4';
import { lairMoment } from './floor5_moments';
import { gateWardMoments } from './floor11_moments';
import { undercityMoments } from './floor12_moments';
import { millraceMoments } from './floor13_moments';
import { houseOfQuietMoments } from './floor14_moments';
import { greatLibraryMoments } from './floor15_moments';
import type { Moment } from './floorkit';
import { LAIR } from './lair';
import { cageDown, cageUp } from './shaft';
import { stairwellKicks, stairwellOpens } from './stairwell_open';
import { boulderRolling, hurledBlock, stompCracks } from './unfinished';
// (THE HIGH CITY, FLOOR 16: the Princess's things)
import { princessThings } from './act1_figs/princess';
import { caveFilm, lairMouth } from './cave4';
import { floorStairsUp, gateBars, gateLeft, townArrives, townShaft, townStairs, unbarFilm } from './town_ways';
import type { Strip } from './gates';
import { canyonStart, canyonWay, fenStart, fenWay, ledgeStart, ledgeWay, pinewoodStart, pinewoodWay, quarryStart, quarryWay } from './act1_ways';
import { gateWardStart, gateWardWay, houseOfQuietStart, houseOfQuietWay, libraryStart, libraryWay, millraceStart, millraceWay, undercityStart, undercityWay } from './act2_ways';
import type { StartArt, WayArt, WayDir } from './ways_kit';
export type { StartArt, WayArt };
// (THE HIGH CITY, FLOOR 16: its garden gates, the art's own piece: art/floor16.ts)
import { swanGardensPieces } from './floor16';
import { Px } from '../engine/px';
import { GARDEN_GATE } from '../game/ways';

/** Where a piece in a wall stands (tiles), and the room's zone before it. */
type At = { x: number; y: number } | undefined;
/** (EXITS) Floors 6 to 15's ways on and starts, by floor (the art chat's, art/act1_ways.ts and art/act2_ways.ts). */
const ONWARD_ART: Record<number, { way: (d: WayDir, at: At, zone: number | undefined) => WayArt; start: (d: WayDir, at: At, zone: number | undefined) => StartArt }> = {
  6: { way: (d) => quarryWay(d), start: (d) => quarryStart(d) },
  7: { way: (d) => ledgeWay(d), start: (d) => ledgeStart(d) },
  8: { way: (d) => canyonWay(d), start: (d) => canyonStart(d) },
  9: { way: (d) => pinewoodWay(d), start: (d) => pinewoodStart(d) },
  10: { way: (d) => fenWay(d), start: (d) => fenStart(d) },
  11: { way: (d) => gateWardWay(d), start: (d) => gateWardStart(d) },
  12: { way: (d, at) => undercityWay(d, at), start: (d) => undercityStart(d) },
  13: { way: (d) => millraceWay(d), start: (d) => millraceStart(d) },
  14: { way: (d, at, zone) => houseOfQuietWay(d, at, zone), start: (d, at, zone) => houseOfQuietStart(d, at, zone) },
  15: { way: (d, at, zone) => libraryWay(d, at, zone), start: (d, at, zone) => libraryStart(d, at, zone) },
  // (THE HIGH CITY, FLOOR 16: the art chat drew no film for its ways; its own `a garden gate` stands in the hedge at each)
  16: { way: (d) => gardenGateWay(d), start: (d) => gardenGateStart(d) },
};

/**
 * (THE HIGH CITY, FLOOR 16: THE SWAN GARDENS' GATES, game/act2/swangardens.ts) The art's `a garden gate` (art/floor16.ts: its
 * frames shut and open across x, shut and open across y), standing in the yew at the way on and where he came in: across
 * the way through it (a way along x is crossed by a gate across y). THE WAY ON: shut while the Princess lives; as she falls,
 * GARDEN_GATE.shut frames shut and then open, its leaves swinging back with a jolt (game/ways.ts ONWARD[16]); open after.
 * WHERE HE CAME IN: shut behind him. Nothing of either lies on the floor (its `under` an empty picture).
 */
function gardenGate(d: WayDir): { shut: Sprite; open: Sprite; none: Sprite } {
  const fr = swanGardensPieces().find((p) => p.name === 'a garden gate')!.frames!;
  const k = d === 'x+' || d === 'x-' ? 1 : 0;
  return { shut: fr[2 * k], open: fr[2 * k + 1], none: new Px(2, 2).sprite(1, 1, 2) };
}
function gardenGateWay(d: WayDir): WayArt {
  const g = gardenGate(d);
  const frames = [...new Array<Sprite>(GARDEN_GATE.shut).fill(g.shut), ...new Array<Sprite>(GARDEN_GATE.open).fill(g.open)];
  return { shut: { under: g.none, over: g.shut }, film: { frames, fps: 30, jolts: [GARDEN_GATE.shut], kicks: [2] }, open: { under: g.none, over: g.open }, back: 0 };
}
function gardenGateStart(d: WayDir): StartArt {
  const g = gardenGate(d);
  return { under: g.none, over: g.shut, back: 2 };
}
const asDir = (d: string | undefined): WayDir => (d === 'x-' || d === 'y+' || d === 'y-' ? d : 'x+');

/** One of a floor's moments, as the game plays it. */
export interface MomentFilm {
  name: string;
  fps: number;
  /** The frames on which the screen is kicked and a blow is heard. */
  jolts: number[];
  frames: Sprite[];
  /** What is there before it plays (a loop or a still; none: nothing is), and what is left after. */
  before: Sprite[] | null;
  after: Sprite[] | null;
  /** The same for a wall's face turned to screen-right, where it plays in a wall. */
  right?: { frames: Sprite[]; before: Sprite[] | null; after: Sprite[] | null };
}
/** The stairwell's opening: its frames (drawn in depth at the opening's middle), the screen's kick at each jolt (game pixels). */
export interface StairFilm {
  fps: number;
  jolts: number[];
  kicks: number[];
  frames: Sprite[];
}
/** EXITS, FLOOR 4: the wall giving way to the cave (the art chat's, art/cave4.ts), anchored at the foot of the wall's face under the middle of the doorway: its frames, the screen's kick at each jolt; the wall standing before; the cave after, under what stands and at the face. */
export interface CaveWayFilm {
  fps: number;
  jolts: number[];
  kicks: number[];
  frames: Sprite[];
  before: Sprite;
  under: Sprite;
  over: Sprite;
}
/** EXITS, FLOOR 5: the cave's other end, its two layers. */
export interface MouthWay {
  under: Sprite;
  over: Sprite;
}
/** EXITS, THE TOWN (art/town_ways.ts): its stairs down; the shaft's head, the cage standing in it, in two layers; the gate's bars, their unbarring frame by frame (30 a second, the screen kicked at each jolt) and what is left. */
export interface TownWaysArt {
  stairs: Sprite;
  head: { back: Sprite; front: Sprite };
  bars: Strip[];
  unbar: Strip[][];
  unbarJolts: number[];
  left: Strip[];
}
/** What an Act 1 boss throws and leaves, painted ahead (`things:<kind>`): each of its things' frames, by name. */
export interface ThingsFilm {
  [thing: string]: Sprite[];
}
/** A film of the mine shaft's cage, in two layers frame by frame (a hero is drawn between them); the ride's `lift`: how far up the cage's floor is, frame by frame, in picture pixels. */
export interface ShaftFilm {
  fps: number;
  jolts: number[];
  back: Sprite[];
  front: Sprite[];
  lift?: number[];
}

const plain = (m: Moment): MomentFilm => ({
  name: m.name, fps: m.fps, jolts: [...m.jolts], frames: m.frames, before: m.before, after: m.after,
  ...(m.right ? { right: { frames: m.right.frames, before: m.right.before, after: m.right.after } } : {}),
});

/** The moments of a floor that are made together (floors 1 to 3), or null for a floor whose moments are made one by one. */
function momentsOf(floor: number): Moment[] | null {
  return floor === 1 ? wardenMoments() : floor === 2 ? headsmanMoments() : floor === 3 ? chainedMoments() : null;
}

/** The keys of a floor's moments' films: one for all three (floors 1 to 3), or one each (4 and 5); (ACT 2, THE HUSH) floors 11 to 15 their one. */
export function momentKeys(floor: number): string[] {
  if (floor >= 1 && floor <= 3) return [`moments:${floor}`];
  if (floor === 4 || floor === 5) return [0, 1, 2].map((n) => `moment:${floor}:${n}`);
  if (floor >= 11 && floor <= 15) return [`moment:${floor}:0`];
  return [];
}

/** (ACT 2, THE HUSH) Floor 11 to 15's moment: the one the art chat made for it (its maker keeps it once made). */
function hushMoment(floor: number): Moment | null {
  const list = floor === 11 ? gateWardMoments() : floor === 12 ? undercityMoments() : floor === 13 ? millraceMoments() : floor === 14 ? houseOfQuietMoments() : floor === 15 ? greatLibraryMoments() : null;
  return list?.[0] ?? null;
}

/**
 * How much room a film takes while it is being made, in megabytes (its frames whole, before each is
 * cut down to what is painted in it), measured 11 Oct 2026 (src/dev/measure_first5.ts): a small device
 * makes only the films it has room for (render/painter.ts).
 */
export function filmRoom(key: string): number {
  const [kind, a, b] = key.split(':');
  if (kind === 'moments') return a === '1' ? 57 : a === '2' ? 71 : 16;
  // (ACT 2, THE HUSH: floors 11 to 15's, measured 19 Oct 2026, every picture of the film as it is kept, its width by its height
  // by four, as src/dev/measure_first5.ts measures (here in node, tests/helpers.ts paintWithoutCanvas): the pigeons 46.1 MB, the
  // surge 25.1, the whirl of pages 47.2, the screen 3.7, the chandelier 13.6 (each frame is cut down as it is made, so near what it
  // takes while it is made); each a little over; all under a phone's 100, render/painter.ts SMALL_ROOM)
  if (kind === 'moment' && Number(a) >= 11) return [47, 26, 48, 4, 14][Number(a) - 11] ?? 50;
  if (kind === 'moment') return a === '4' ? [147, 154, 63][Number(b)] ?? 150 : [88, 48, 52][Number(b)] ?? 90;
  if (kind === 'stair') return 26;
  // (EXITS: the art chat's ways, measured 22 Oct 2026 in node as the others are, every picture whole: the cave 61.4, the mouth 1.0,
  // the town's 7.4, the cage coming up 31.0, the stairs up 0.1)
  if (kind === 'cave') return CAVE_ROOM;
  if (kind === 'mouth') return 2;
  if (kind === 'town') return a === 'arrive' ? TOWN_ARRIVE_ROOM : 8;
  if (kind === 'up') return 1;
  // (EXITS, floors 6 to 10: the art chat's measures, every picture cut down to what is painted in it: the quarry 27.3, the ledge
  // 68.9 (the flock flies wide), the canyon 44.9, the pinewood 26.2, the fen 22.3; a start under 2)
  // (and floors 11 to 15's: 8.3, 27.6, 18.4, 9.3, 14.8)
  if (kind === 'onward') return [28, 70, 46, 27, 23, 9, 28, 19, 10, 15][Number(a) - 6] ?? 70;
  if (kind === 'start') return 2;
  // (THE HIGH CITY, FLOOR 16: the Princess's things, measured 30 Oct 2026 as the others are: 20.8, art/act1_figs/princess.ts THINGS_COST)
  if (kind === 'things' && a === 'princess') return 22;
  if (kind === 'things') return 12;
  return 57;
}

/** The key of the film of a stairwell's opening: on floor `floor` (its look, 1 to 4), its steps going down `way`, its anchor on tile (x, y). */
export function stairKey(floor: number, s: { x: number; y: number; way: 'x' | 'y' }): string {
  return `stair:${floor}:${s.way}:${s.x}:${s.y}`;
}

/** (EXITS) The cave's film's room and the cage's coming up's, in megabytes: see filmRoom. */
const CAVE_ROOM = 62;
const TOWN_ARRIVE_ROOM = 32;

/** Make the film of that name. Throws for a name that is none. (Seconds of work: not where the game is being played.) */
export function makeFilm(key: string): MomentFilm[] | MomentFilm | StairFilm | ShaftFilm | ThingsFilm | CaveWayFilm | MouthWay | TownWaysArt | WayArt | StartArt | Sprite {
  const [kind, a, b, c, d] = key.split(':');
  if (kind === 'moments') {
    const list = momentsOf(Number(a));
    if (!list) throw new Error(`no film ${key}`);
    return list.map(plain);
  }
  if (kind === 'moment') {
    const floor = Number(a);
    const n = Number(b);
    if (floor === 4) return plain(ossuaryMoment(n));
    if (floor === 5) return plain(lairMoment(n));
    // (ACT 2, THE HUSH: floors 11 to 15, their one moment each)
    const hush = n === 0 ? hushMoment(floor) : null;
    if (hush) return plain(hush);
    throw new Error(`no film ${key}`);
  }
  if (kind === 'stair') {
    const floor = Number(a);
    const theme = floor === 5 ? LAIR : CRYPT_FLOORS[Math.max(1, Math.min(4, floor)) - 1];
    const m = stairwellOpens(theme, b === 'y' ? 'y' : 'x', [Number(c) || 0, Number(d) || 0]);
    return { fps: m.fps, jolts: [...m.jolts], kicks: [...stairwellKicks(m)], frames: m.frames };
  }
  // (EXITS: the art chat's ways between the floors)
  if (kind === 'cave') {
    const f = caveFilm(a !== 'y');
    return { fps: 30, jolts: [...f.jolts], kicks: f.jolts.map((_, i) => (i === 0 ? 6 : 4)), frames: f.frames, before: f.before, under: f.under, over: f.over } satisfies CaveWayFilm;
  }
  if (kind === 'mouth') {
    const m = lairMouth(a !== 'y');
    return { under: m.under, over: m.over } satisfies MouthWay;
  }
  if (kind === 'town' && a === 'ways') {
    const alongX = b !== 'y';
    const head = townShaft();
    const u = unbarFilm(alongX);
    return { stairs: townStairs('x'), head: { back: head.back, front: head.front }, bars: gateBars(alongX), unbar: u.frames, unbarJolts: [...u.jolts], left: gateLeft(alongX) } satisfies TownWaysArt;
  }
  if (kind === 'town' && a === 'arrive') {
    const f = townArrives();
    return { fps: f.fps, jolts: [...f.jolts], back: f.back, front: f.front, lift: [...f.lift] } satisfies ShaftFilm;
  }
  if (kind === 'up') return floorStairsUp(CRYPT_FLOORS[0], b !== 'y');
  // (a piece in a wall: where it stands and the room's zone, onward:<floor>:<dir>:<x>:<y>:<zone>)
  const [, , , ax, ay, az] = key.split(':');
  const at = ax !== undefined && ay !== undefined ? { x: Number(ax), y: Number(ay) } : undefined;
  const zone = az !== undefined && az !== '' ? Number(az) : undefined;
  if (kind === 'onward' && ONWARD_ART[Number(a)]) return ONWARD_ART[Number(a)].way(asDir(b), at, zone);
  if (kind === 'start' && ONWARD_ART[Number(a)]) return ONWARD_ART[Number(a)].start(asDir(b), at, zone);
  if (kind === 'things' && a === 'unfinished') {
    // (its block's four tumbling frames and the one lying; its boulder's eight; its stomp's four cracks: as render/act1_fx/unfinished.ts asks for them)
    return { blocks: [0, 1, 2, 3, 4].map(hurledBlock), boulders: [0, 1, 2, 3, 4, 5, 6, 7].map(boulderRolling), cracks: [0, 1, 2, 3].map(stompCracks) };
  }
  // (THE HIGH CITY, FLOOR 16: what the Princess casts and sends, as render/act1_fx/princess.ts asks for it)
  if (kind === 'things' && a === 'princess') return princessThings();
  if (kind === 'shaft') {
    if (a === 'down') {
      const f = cageDown();
      return { fps: f.m.fps, jolts: [...f.m.jolts], back: f.layers.back, front: f.layers.front };
    }
    const f = cageUp();
    return { fps: f.m.fps, jolts: [...f.m.jolts], back: f.layers.back, front: f.layers.front, lift: [...f.layers.lift] };
  }
  throw new Error(`no film ${key}`);
}
