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
}
