// ACT 2, THE HUSH (floors 11 to 15, game/act1.ts ACT2): WHAT ONLY ITS FLOORS HAVE, beyond what every floor laid as open
// ground has (game/act1_layout.ts, Land). Each floor's map-maker (game/act2/<its ground>.ts) fills what its painter (the art
// chat's look: art/gateward.ts, undercity.ts, millrace.ts, housequiet.ts, library.ts) and its rules need. All of it plain
// numbers and arrays, for the Land goes to the painter's worker as it is (render/painter.ts): what a look asks as a
// function (`zone(x, y)`, `water(x, y)`, `river(x, y)`...) is made from these by render/outdoor.ts, landLook.

/**
 * A HOUSE OF THE GATE WARD THAT CAN BE WALKED INTO (the art chat's GWHouse, art/gateward.ts, by its words): its room
 * (x0, y0, x1, y1, tiles; x1, y1 not in it), walkable; its front toward the eye, a row along x at y = `at` (the room behind
 * it at smaller y, the street at at + 1) or a column along y at x = `at`, not walkable but for its doorway (`door`: the
 * tiles along it from the first and not including the second). His rule (art rulebook, Places 9): from the street it
 * stands whole; once the hero steps inside, its whole front and roof fade to clear.
 */
export interface HouseLaid {
  room: [number, number, number, number];
  front: { along: 'x' | 'y'; at: number; door: [number, number] };
}

/**
 * THE BELLS (game/bells.ts), the Hush's event in place of the strongholds (his design, 18 Oct 2026, 05:27 to 05:41, in his
 * doc): where its map-maker has put its bells. Every place a tile's middle (world), standing on whole floor reached from the
 * start, kept clear of the main way's narrows.
 */
export interface BellsPlan {
  /** The Muffled Bell, off the main way: struck, the Hush pours out of it. */
  muffled: { x: number; y: number };
  /** The bells to ring, four to seven of them, about the map, every one inside the Hush. */
  bells: { x: number; y: number }[];
  /** The Hush's fixed area (his 05:40, "Fixed area"): every walkable tile whose middle is within `r` of (x, y). Each bell rung chips the Hush back round it (game/bells.ts). */
  hush: { x: number; y: number; r: number };
}

/** A rectangle of tiles: x0, y0, x1, y1 (world; x1 and y1 not in it). */
export type Rect = [number, number, number, number];

/**
 * (THE HIGH CITY, FLOOR 16: THE SWAN GARDENS, game/act2/swangardens.ts) HOW ITS GARDENS ARE LAID, for its dresser, its painter
 * (render/outdoor.ts landLook: the art chat's SwanLand, art/swangardens.ts) and its rules (game/act2/garden_rules.ts): plain
 * numbers and arrays, as the rest of the Land.
 */
export interface GardenPlan {
  /** The terraces up the hill, the lowest first (where he comes in) to the top (the lake): each its floor (Rect), what it is, and its room. */
  terraces: { r: Rect; role: 'forecourt' | 'parterre' | 'maze' | 'roses' | 'lake'; room: number }[];
  /** THE TERRACES' WALLS, each a row of tiles along x (floor, `a terrace wall` on each, its face toward +y): its row, from x0 to x1 (x1 not in it), and its stair (`tx`: the stair's feet on (tx, y + 1) and (tx + 1, y + 1), the row open from tx - 1 to tx + 1). */
  walls: { y: number; x0: number; x1: number; tx: number }[];
  /** THE HEDGE MAZE: its corner (the hedge's), its cells across and deep, their pitch (a corridor pitch - 1 wide, a hedge one), where it is gone into and come out of (a tile each, in its hedge), and its dead ends' cells (tile middles). */
  maze: { x0: number; y0: number; nx: number; ny: number; pitch: number; gin: [number, number]; gout: [number, number]; ends: [number, number][] };
  /** THE LAKE (its tiles: Land.lake), its rectangle; the Swan Pavilion's middle on its island in it. */
  lake: Rect;
  pavilion: { x: number; y: number };
  /** The still fountains (their middles, a tile's; three tiles across), and the fountain of the four royals (its middle, a tile's corner; two across). */
  fountains: { x: number; y: number }[];
  royals: { x: number; y: number } | null;
  /** The parterre's beds of roses (each edged in box), and the beds gone over to nettles (Rects). */
  roses: Rect[];
  nettles: Rect[];
  /** The side gardens off the terraces, each its floor (Rect), its room, and its gap in the hedge (three tiles of a column along y: x, y0). */
  sides: { r: Rect; role: 'gardeners' | 'lair' | 'treasure'; room: number; gap: [number, number] }[];
  /** The garden gates: the one he came in by (its tile in the hedge, and the way back through it), and the way on (its tile in the hedge, and the way on through it). */
  gates: { start: { x: number; y: number; dir: 'x+' | 'x-' | 'y+' | 'y-' }; on: { x: number; y: number; dir: 'x+' | 'x-' | 'y+' | 'y-' } };
  /** THE DRIVE through the forecourt (Rects), the gravel walks, the flags, the beds of bare earth (Rects); paving round a fountain (x, y, r). */
  walks: Rect[];
  paved: Rect[];
  rounds: [number, number, number][];
  beds: Rect[];
  /** Where the garden party was left out (its card table's tile), on the rose terrace. */
  party: { x: number; y: number } | null;
}

export interface Act2Land {
  /** What each walkable tile is, a tile each (its floor's own zones: GW_ZONE, UC_ZONE, HQ_ZONE, LB_ZONE); 0 where not said. */
  zones?: Uint8Array;
  /** THE UNDERCITY: 1 for each tile that is not floor and is water (the channels, the cisterns' pools, the outflow). */
  water?: Uint8Array;
  /** THE GATE WARD: its squares (for their rings of setts), and its houses that can be walked into. */
  squares?: { x: number; y: number; r: number }[];
  houses?: HouseLaid[];
  /** THE MILLRACE (with Land.river for its river's middle line): the mill race's middle line, running toward the wheel; the cart tracks' middle lines; the mill yard's paved rectangles (x0, y0, x1, y1). */
  race?: [number, number][];
  tracks?: [number, number][][];
  yards?: [number, number, number, number][];
  /** THE BELLS, where they are on this floor. */
  bells?: BellsPlan;
  /** THE GREAT LIBRARY: 1 for each tile of the stacks' rows of shelves (game/act2/library.ts shelve; art/low_stacks.ts paints them low). */
  shelves?: Uint8Array;
  /** (THE CAMP, game/camp.ts: the Gate Ward's ground as the city's people keep it, art/gateward.ts GateWardLand.swept) */
  swept?: boolean;
  /** (THE HIGH CITY, FLOOR 16: THE SWAN GARDENS) 1 for each tile of the lake (not floor: its deep water, the ground's drop); and how its gardens are laid. */
  lake?: Uint8Array;
  garden?: GardenPlan;
  /** (THE HIGH CITY, FLOOR 16: where the way on leads and the way back is, as its map-maker laid its gates: game/ways.ts placeOnward; else from where the boss stands) */
  wayDirs?: { on: 'x+' | 'x-' | 'y+' | 'y-'; back: 'x+' | 'x-' | 'y+' | 'y-' };
}
