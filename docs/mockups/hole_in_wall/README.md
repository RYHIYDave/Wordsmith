# Mock-up: a hole knocked in a wall (NOT IN THE GAME)

**The owner, 7 Oct 2026, 17:53:** "I'd also like another doorway that is just like somebody knocked a
hole in a wall, all crumbly from one room to another." He was told at 17:54: "Noted: one more way
through. A hole knocked in the wall between two rooms that sit side by side: rough broken edges,
rubble on the floor, no door. / I'll mock it up and show you before it goes in."

**State of this branch (`mockup/hole-in-wall`, on top of Version 18.5):** written by the main chat
on paper, while its machine was taken up by playtests. IT HAS NEVER BEEN COMPILED OR SEEN. Expect
type errors and a first picture that needs work.

**The job:** make it compile, look at it, make it look right, and send the owner a sheet of
pictures marked as a mock-up, with ONE question ("Is this the hole you meant?"). Nothing of it
goes into the game from here: the main chat puts it in, behind a switch, after his yes.
`CLAUDE.md` at the root has his standing rules. Short messages; no menus.

## Why the rooms are three tiles apart

Since Version 18.4 a wall is its faces alone, and a wall block is LEFT OUT if it would hide floor:
if floor lies at (x - 1, y), (x, y - 1), (x - 1, y - 1), (x - 2, y - 1) or (x - 1, y - 2)
(`wallsAway` in `src/render/walls.ts`). So of two rooms side by side, the wall between them is
drawn only as THE NEARER ROOM'S BACK WALL, and only if the rock between the rooms is THREE tiles
thick. Then that back wall stands whole but for the two blocks after the way through, which would
hide the way: the same dark notch every doorway in a back wall has. From the further room the
same wall is on a side toward the eye, where nothing is drawn. So there is one picture of a hole,
in each of the two kinds of back wall, not four.

## What is here (every piece is marked MOCK-UP in the code)

- `src/game/types.ts`: `DoorKind` has `'hole'`.
- `src/game/level.ts`: `HOLE_HALL`, `makeHoleHall`: three rooms laid by hand in the practice
  room's place (`#hall=holes`, or `__dbg.practice(cls, seed, 'holes')`): a front room with a hole
  in each of its two back walls, a room behind each, three tiles of rock between, a way one tile
  wide through it, braziers by the holes, rubble on the floor. `Hall` has `'holes'`
  (`src/game/game.ts`, `src/main.ts`).
- `src/art/ground.ts`: `wallStone`, `wallSolid`, `wallTall`: the wall's own stonework, for
  painting a piece of wall elsewhere.
- `src/art/gates.ts`: `makeBreach(theme, alongX)`, `inHole`, `inBite`, `HOLE_HIGH`: THE PIECE OF
  WALL OVER THE HOLE'S TILE, painted as the wall is (its courses, its tones, fading out at the
  top), with a ragged hole through it (24 picture pixels wide at its widest, 54 high in a wall
  whose solid part is 56), a jamb about as wide as a door's post left standing after it, stones
  knocked out of the wall that runs on before it (painted as the dark over that wall's own
  picture), two cracks, and what fell heaped at its foot. It is cut into strips a quarter of a
  tile wide, as a door's lintel is (`Flat.strips`), and `standDoors` in `src/render/render.ts`
  stands them in the plane of the wall's face. `GateArt.breach(alongX)` keeps it.
- TWO WAYS TO SHOW THE WALL BESIDE THE HOLE, to be compared by eye (`HOLE_LOOK` in
  `src/render/walls.ts`; `__dbg.holeLook`): `whole: false`, the two blocks after the hole are left
  out, as beside any doorway (a dark notch: the hole then reads as a gap with a ragged jamb);
  `whole: true`, they stand, so that the hole is a hole in a wall that goes on to either side, and
  are drawn SEEN THROUGH while the hero is in the way behind them (`holeNotch`, `holeWay`; the
  renderer's `holeThin`). The second breaks a rule of 18.4 (no wall stands over floor) for those
  two blocks: if it looks much better, show him both and say so.
- `tools/scenarios/hole.mjs`: the stills.

## How to see it

```
tsc --noEmit -p tsconfig.json
node tools/build_to.mjs dist/hole.html
AT='15.5,17,0,-1,a_before;15.5,13.6,0,-1,b_in_the_hole;15.5,12.2,0,-1,c_in_the_way;15.5,8.5,0,1,d_beyond;12.5,18.5,-1,0,e_before_the_left_one;9.5,18.5,-1,0,f_in_the_left_one' \
  node tools/playtest.mjs --file dist/hole.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/hole.mjs --out shots/hole/a
WHOLE=1 AT=... (the same)    # the wall whole beside the hole
NOWALL=1 AT=... (the same)   # no broken piece at all: a plain gap, to compare against
python3 tools/sheet_shots.py previews/<name>.png "<title>" "<line|line>" "<shot.png>;<caption>[;x0,y0,x1,y1[;scale]]" ...
```

The front room is x 10..20, y 14..22; the right-hand hole is the tile (15, 13), the left-hand one
(9, 18). On the screen x runs down to the right and y down to the left.

## Thought about, and left for whoever builds it for real

- A hole is one tile wide. The stone on either side of the way would be marked as a door's piers
  are (`Level.pier`), so that a big body fits as it does at a door.
- It stands for an ordinary joint between two rooms to begin with, so that the level stays a tree
  and no gate can be walked round. Later it may join two rooms that are neighbours on the map and
  not on the path.
- The map-maker lays rooms at least 4 apart today (`ROOM_GAP` in `src/game/dungeon.ts`); a hole
  wants them exactly 3 apart with their facing sides overlapping.
