# Floor 15's stacks, the shelves one block high (the art chat, 23 Oct 2026)

Branch `mockup/low-stacks`, from the main chat's `exits` at 361e997. Behind `LOW_STACKS` in `src/art/low_stacks.ts`, off:
nothing of the game imports it.

## His words (Pacific time)

- To the main chat, 23 Oct, 11:40: “The library is really hard to navigate.  The rows of shelves room needs the rows to
  maybe only be one block high, and there shouldn’t be any little doodad in the isles”. The main chat sent the shelves to
  this chat (its post of 15:05 Eastern) and kept the aisles' doodads.
- Shown pictures and a film from the game (the stacks as they are and with the rows one block high; the knight walking an
  aisle, round a row's end and back along the next), asked “Are the library's stacks right, with each row of shelves a low
  bookcase one block high? When you're behind one, it fades around you like the walls do.”, by 13:06, 23 Oct: “Yes, send to
  main (Recommended)”.

## What it is

Each row of the stacks' shelves is a low bookcase, `LOW_RISE` (42 picture pixels, a block: as tall as a tile is wide) over
the floor, a tile thick, as long as its row: a skirting; two shelves of books on each long side, the room's walls' own books,
bays and light (`art/library.ts`, its `shelves`, `bayAt` and `rowOf` exported for it, nothing else there changed); a top
board with a lit edge; a panelled end at each end with a brass plate; on top, dark planks, dust, now and then a book or two
left lying. The Order's ink slashed across a bay now and then, chained books, shelves pulled empty, as on the walls. Nothing
glows; every colour quietened as Act 2's places are (`act2_quiet.ts`). The rooms' own walls are as they were.

## For the rules (the main chat's)

The rows' tiles stay walls in the rules (walked round, the minimap as now); only how they are painted changes.

1. **Which tiles are the rows**: `game/act2/library.ts` `shelve()`'s `T_WALL` tiles, as a mask (1 a shelf's tile) on the
   land, say `Land.shelves`; `rowsOf(mask, w, h)` makes the `Rows` the art asks for.
2. **The ground** is painted from `lowStacksFloor(floor, rows)` (the rows' tiles made floor, so the ground paints no wall
   there and none of them stands whole by `ACT2_WALLS`), with the look given the floor as it is and the rows:
   `greatLibraryLook({ floor, zone, rows })` (new, optional `LibraryLand.rows`: under a row its room's floor, the stacks'
   boards; the dust along the shelves' feet kept). Both in `render/outdoor.ts` `landTerrain`/`landLook` and the painter's
   worker (`render/painter.ts`, which calls `landTerrain`).
3. **The low rows** over each piece of the ground: `paintLowStacks(rows, x0, y0, w, h)` gives a `StandingPiece` (pixels and
   each pixel's line of tiles across the screen, its row tile's x + y + 1) as `paintStanding` gives the walls;
   `withLowStacks(walls, low)` lays the two together (at each pixel whichever is nearer the eye), and `standingBits` cuts
   them into the bits drawn among the figures, SEEN THROUGH round him (and a monster in sight) as the walls are: what he
   said yes to. In both the page's `paint()` and the worker's piece.
4. **Wall pieces**: no sconce (nor any piece hung on a wall's face) on a row's foot: it would hang in the air over a low
   case. In the scratch copy, `feet()` in `dress()` skips a floor tile with a row at (x, y - 1) or (x - 1, y).
5. **The aisles' doodads**: the Order's gates swung across an aisle's mouth were left out in the pictures (your `stacksOf`).

`docs/mockups/low_stacks/scratch_hooks.diff.txt`: the lines that drew it in the scratch copy for his pictures (a guide only;
never pushed). Its `LOW_SEEN` and the `low` bits were a try at the rows NOT seen through, left off.

## Room and time

Nothing kept apart: the low rows are painted with each ground piece, as the walls standing whole are. A piece of the stacks
(128 picture pixels square, the ground with the walls standing whole and the rows) took about as long with the rows low as
with them tall: measured here, on a machine busy with other work, 127 and 76 thousandths of a second against 125 and 100.

## Checks

- `tests/low_stacks.test.ts`, 4: the switch off and nothing importing the file; the floor painted from (the rows floor,
  nothing else changed) and the look's boards under a row; the rows standing low (only where a row is seen, never more than
  a block over it, opaque, at their row tile's depth, every row's top and its faces toward the eye, both ways round, nothing
  cyan or pink, as quiet as Act 2's places; two pieces side by side one picture); laid with the walls, the nearer at each
  pixel.
- Told of `art/low_stacks.ts` (one line each, it may import them): the import checks in `tests/library.test.ts` and
  `tests/floor11.test.ts` (Act 2's quiet colours).
- tsc clean. NOT RUN: the regression; a real phone; the pieces with your rules.
