# THE HEADSMAN'S YARD: ITS OWN GATE (NOT IN THE GAME until the main chat puts it there)

Branch `art/yard-gate`, from `high-city` at 5a2e280. The gate: `src/art/yard_gate.ts`, `makeYardGateArt(): GateArt`, behind
`YARD_GATE = { on: false }`, checked by `tests/yard_gate.test.ts`, shown by `src/dev/preview_yard_gate.ts`. Nothing of the game
imports any of it.

## His words

- Shown the yard in play with the Crypt's boss gate in its doorway (relayed by the main chat): “That boss gate isn’t going
  to cut it”.
- Asked what should stand there instead: “Its own arch, and we’ll need new ones for the other new levels as well”.
- Read (the main chat's reading, which the art chat took): the yard's own gate, from the arch in the yard picture, in the
  prison's dark stone and as high as the yard's wall, made as a GateArt so it stands in the game's three-tile boss doorway,
  its portcullis dropping behind the hero as the fight begins. (Floors 3 to 5's gates come later, with their new looks.)

## What it is

Everything but the boss's pillar, arch and portcullis is floor 2's own (`headsmanGates()`): its doors of black oak, its plain
gates, its levers and seals, the very same pictures.

- **THE PILLARS**: square, each face 12 (PILLAR) wide, 64 high: rough-dressed prison stone in four courses, a plinth, an
  impost the arch springs from, two iron bands round each with studs. One picture for a gate either way, as the game's.
- **THE ARCH AND THE FACE**: a half round over the three tiles, springing at 64, its crown 112 over the floor (the Crypt's
  boss arch: 44 and 92). Eleven heavy wedge stones, 12 long at the springing and 24 at the crown, a shade lighter than the
  wall so the arch reads; an iron band lining the way, a stud on each stone; a hood moulding round the ring; quoins up both
  edges, long and short; the rest the yard wall's rough stone, its coping at 150 (the yard's wall, `YARD_WALL`); over it the
  wall-walk a tile back and a merlon over each of the doorway's three tiles, where the yard wall's stand on each of its
  tiles. Through the way, the arch's underside, as far back as the portcullis's slot. Moonlit: light from the upper left,
  the face along x lit, along y in shade.
- **HIS MARK** on a tall keystone (from the ring to the top of the face): his block, its top hollowed for the neck, and his
  axe standing on it, a long haft and a tall bearded blade, cut in the stone and full of embers (the enemy's dark pink);
  `lit` (once the gate has fallen) alight, pink burning to gold, and it gives the enemy's light. It is turned along y so the
  blade is on the left on the screen both ways. An original design.
- **THE PORTCULLIS**: black iron, eight uprights 5 wide every 12, each ending in a spike 14 long; a heavy bottom rail over
  the spikes, cross bars every 19, a rivet at each crossing. It stands at the back of the arch, as the game's does; at a
  slant the last upright is behind the nearer pillar. Drawn up (the game's raise of `GATE_UP`) its spikes hang at 88 (44
  game pixels; a hero is 28) under the crown: `yardLift(raise)` turns the game's raise into this gate's.
- **THE SLAM**, `yardGateSlam(alongX, f)`, f 0 to 15 (`SLAM_FRAMES`, half a second at 30): on its own picture, anchored at the
  middle of the gate's foot. The spikes bite the floor (a flash at each), sparks fly off them both ways and fall (an honest
  orange: iron on stone, never the enemy's pink), and dust shoots out flat along the floor both ways, then billows up and
  rolls on, thinning away a game pixel at a time. It gives a little light for its first frames.
- Torches: the yard's own torch (“the yard's torch”, set 92 up the wall) on the wall either side of the doorway, as in the
  pictures. Warm; nothing of the gate glows cyan.

## The drop: its timing (Movement 9)

His rule, 24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”. `YARD_GATE_DROP`, the
game's raise (0 to `GATE_UP`) frame by frame at 30 a second from the moment the fight begins:

| frames | raise | what |
| --- | --- | --- |
| 0 to 9 | 60 60 54 60 60 56 60 50 58 60 | held at the top, juddering: the chains slip and catch (a third of a second) |
| 10 | 26 | the drop |
| 11 (`YARD_SLAM_AT`) | 0 | the landing: the slam begins (dust and sparks, frame 0), the mark lights |
| 12 to 18 | 0 8 10 4 0 2 0 | a hard bounce off the floor, and down for good |

`yardGateDropAt(frame)` gives `{ raise, slam, lit }` for a frame. Suggested beside it (not drawn here): a small shake of the
screen on the landing, 2 game pixels for 4 frames.

## How the main chat brings it in

1. The yard's boss doorway uses `makeYardGateArt()` when `YARD` and `YARD_GATE` are both on: wherever the level's gates are
   chosen for floor 2's boss hall (render.ts `this.art.gates`, from art/floors.ts `lookGates`), take `makeYardGateArt()` in
   place of `headsmanGates()`. It gives floor 2's own pictures for everything but the boss gate, so the swap can be the
   whole floor's when the yard is on.
2. render.ts `standDoors` lays it as any boss gate (a pillar at `at(0)` and `at(3 + wide)`, the portcullis at the back, the
   arch's strips): no change there. Its face reaches 150 up and its walk and merlons over that, so the yard's wall tiles
   either side meet it at the wall's height.
3. For the drop: drive the boss gate's raise from `YARD_GATE_DROP` (or `yardGateDropAt`) in place of `d.open * GATE_UP` while
   it falls; light the mark (`arch(alongX, true, true)`) from `YARD_SLAM_AT`; stand `yardGateSlam(s.alongX, f)` at
   `at(1.5, PILLAR / 32)` a little in front of the portcullis (depth `x + y + 0.3`) for its 16 frames, its lights pushed as
   any picture's.
4. Two of the yard's torches on the wall either side of the doorway (in the pictures: 0.75 of a tile out from each end).

`src/art/yard.ts` and `tests/yard.test.ts` here are the yard mock-up's (`mockup/headsman-yard`, bd8bf9f), unchanged: brought in
only so the pictures could show the gate in the yard. On merging, keep the main chat's own copy of the yard.

## Pictures

In `pictures/`:

- `yard_gate_sheet.png`: the gate in the yard at night from the game's camera with the hero before it, the Crypt's gate in
  the same doorway beside it (before and now); the portcullis up, halfway and slammed, twice as big; the arch three times
  as big; his mark in embers and alight.
- `yard_gate.mp4` (9.9 s, 30 frames a second, H.264): the hero walks out of the passage under the gate into the yard and
  the portcullis slams down behind him; then the slam again at half speed.

Made by:

```
node tools/preview.mjs src/dev/preview_yard_gate.ts docs/mockups/yard_gate/pictures/yard_gate_sheet.png 1200 1880 "sheet"
node tools/film_frames.mjs src/dev/preview_yard_gate.ts "film" shots/yard_gate/film
ffmpeg -framerate 30 -i shots/yard_gate/film/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart docs/mockups/yard_gate/pictures/yard_gate.mp4
```

(`"check"` shows the gate alone in a wall along x and one along y, and every frame of the slam both ways.) In the pictures
the yard's pieces are laid so the doorway in the middle of its far wall is seen (the gallows along the wall to its left,
the scaffold out of view in front); the dark is the yard mock-up's moonlit dark.

## Checks

`tests/yard_gate.test.ts`, 10 of 10: off, and nothing of the game imports it; every piece painted, everything but the
boss's pillar, arch and portcullis floor 2's own; crisp (every pixel whole or empty, none alone but a spark); nothing cyan,
the mark in embers and alight in the enemy's fire on the keystone and giving the enemy's light only alight, the sparks an
honest orange; nothing cut off (the face, coping, walk and merlons whole, the slam's and the pillar's pictures clear of
their edges); the way exactly the game's three tiles (96 between the pillars), only the arch's underside seen in it, its
middle clear to 100, the portcullis drawn up to 88; light from the upper left, the same shape both ways and the mark read
the same; the portcullis down to the floor on its points; the drop's timing and the slam's dust thinning; and the game's own
doors and gates for all five of the Crypt's floors hash exactly as on high-city 5a2e280. With them, `tests/gates.test.ts`
and `tests/yard.test.ts` pass, and `tsc` is clean.
