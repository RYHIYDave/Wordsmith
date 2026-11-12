# Floor 5's story pieces: the Sunken Eye and the prison's dead (A MOCK-UP: NOT IN THE GAME)

Branch `art/floor5-story`, from `main` at 012cc66. **He has said yes to them, as shown** (11 Nov 2026, by 10:46; his words
below): the main chat's to lay floor 5's rooms with. Drawn 11 Nov 2026 by a chat of his working from the queue (its item
"Draw the floor 5 story pieces", `draw-floor-5-story-pieces`). The pieces are `src/art/lair_story.ts`, behind
`LAIR_STORY = { on: false }`; nothing of the game imports it (`tests/lair_story.test.ts` holds it). Nothing of the game is
changed: three new files and this folder. The rooms are the main chat's to lay (game/first5.ts `SCENES`, floor 5 not yet
laid so).

## His words

- 7 Nov 2026, 12:00, of what floor 5 should tell: “showing the boring into the ossuary, the take over of the mines, and the
  creation of the cultist temple under the prison and the dark power the fleshmancer has gained from the sunken eye to raise
  all the dead in the prison”. Asked how it is told, his pick: “Rooms only, no text (Recommended)”. (docs/handoff.md, THE
  LIST, 6b and 6c.)
- Asked of the art (the main chat's board post of 7 Nov, 14:57, as the queue's item has it): two or three small pieces tying
  it to the Sunken Eye (an eye carved in a wall, black swamp water seeping in) and to the prison's dead (empty shackles, drag
  marks). Pictures first.
- 11 Nov 2026, 09:49, to this chat: “Work on this task from the Wordsmith Queue: “Draw the floor 5 story pieces” (queue item
  draw-floor-5-story-pieces).”
- Shown the seven pictures (below), and told two things: that the Eye has a dull pink in its slit (“Your call”), and that the
  black water is the quietest piece (it reads in the mine; in the temple it is subtle). Asked, as a pop-up, “Floor 5's story
  pieces (the seven pictures in the chat: empty shackles, drag marks, the Sunken Eye carved in the wall, black swamp water):
  are they right?”, his pick, 11 Nov 2026, by 10:46: “Yes, hand them to main (Recommended)” (offered as: the branch goes to
  the main chat to lay floor 5's rooms with, and the queue item is cleared). The other picks offered: “Yes, but no pink in the
  Eye”, “Make the black water louder”, “Close, change something”. SO: THE PIECES HAVE HIS YES AS SHOWN, the pink in the Eye's
  slit with them. Art he approved here needs no pictures again; the rooms laid with them are the main chat's to show him.

## What is drawn (`makeLairStoryArt()`: `{ mine: Piece[], temple: Piece[] }`)

Each for look A, the mine that becomes his temple (art/lair_temple.ts, his pick of 2 Nov), in its part's own colours and over
its part's own floor, measured and anchored as floor 5's own pieces are (art/floorkit.ts: a wall piece 48 x 120 at the foot of
its face under its tile's middle, on both faces at every spot; a floor tile 64 x 32 at its top corner). The same names in both
parts; the Eye in the temple's only. Nothing gives light; nothing moves; nothing blocks.

| piece | kind | where |
|---|---|---|
| `the Eye in the stone` | wall tile | the temple |
| `empty shackles` | on the wall | either part |
| `black water down the wall` | on the wall | either part |
| `black water pooled, at a wall along x` / `along y` | floor tile | either part |
| `drag marks along x` / `along y`, the four `drag marks bending, ...`, the four `drag marks' end, from ...` | floor tile | either part |

- **THE EYE IN THE STONE.** A slab of the temple's black stone, framed as its own carved panels are, and in relief in it the
  Sunken Eye as floor 10 has him (art/eye_colossus.ts): his eye lying on its side, wider than tall, drawn to a point at each
  corner, a tall slit down it; under it his tongue rising in an S out of the water, an arm curling up either side. Deep in the
  slit the enemy's pink, dull (the deep end only, never brighter than `#7a1058`; no light of its own): as the cult's marks over
  the threshold have it in their eyes. Carved exactly as the temple's shrieking-skull panels are (what stands out lit along its
  edge toward the light, what is cut in dark: two tones), so that it sits at their level.
- **EMPTY SHACKLES.** Two ring bolts, a chain down from each of its own length, the cuff at its end sprung open and empty, its
  hasp hanging; rust run down the wall under the bolts. Floor 5's own small iron (as its hung kibble's), without its brightest
  tone.
- **BLACK WATER DOWN THE WALL, AND POOLED.** A split across the stone, the swamp's water welling black along it and running
  straight down the face in runs of every length, the stone dark with the wet between them, a drop at the end of each short
  run. At the wall's foot half a round pool lying against the wall. Black; in its sheen and the line of light at its edge the
  fen's own water (art/fen.ts `C_FEN`, floor 10's), a dull dark green. (Drawn first as wavering runs with a green sheen: they
  read as a creeper. Straight down and black, they read as water.)
- **DRAG MARKS.** In the mine's earth a swath scraped smooth and dark, the furrows of two heels cut in it, the earth pushed up
  along its sides and lit on the side away from the light. Over the temple's black flags, the earth dragged in with them: a
  swath of its dust, the two heels' tracks thick with it, clods broken off. Laid in a run as the rails are (the same ten
  tiles: `DRAG_TILES`); an end is where it began, a scuffed place at the tile's middle. No blood anywhere: his rule for this
  boss is “Nothing gory (Recommended)”.

## For the main chat: laying them

- **The story as the pictures lay it** (`src/dev/preview_lair_story.ts`: the level, walls, dark and lights of
  `preview_lair_game.ts`, with these set in it): in a room of the mine, shackles along the back walls, hanging open; from
  under one the drag marks begin and run through the earth to the threshold; black water down a wall of the mine, pooled at
  its foot. Over the temple's flags the marks go on, under his gate, into his hall, and end at one of his bone heaps (the dead
  he raises). On his hall's back wall the Eye, by the rift; beside it black water down the stone, pooled.
- **In the mine** the wall pieces sit anywhere on the rock; best on a bay's second tile, clear of the post. Three spots each.
- **In the temple** every tile of wall is taken (a pilaster, then a hanging or a panel). So: THE EYE covers the hanging or the
  panel of a bay's second tile (it is 30 of the face's 32 wide and reaches from the plinth, 12 up, to 73 up): lay it there, never on
  a pilaster's tile. THE SHACKLES AND THE WATER are set over onto the bare stone beside a pilaster (a bay's first tile: its
  stone is clear for sixteen pixels), and made to fit it (the shackles' chains six and a half apart, their cuffs a little
  smaller): lay them on a pilaster's tile; their pictures for a face along y are set the other way, as the pilaster is there.
  In his hall the pilasters' tiles with the rift's crack up them (every fourth: k = 0) have no bare stone left: use the others
  (k = 2).
- **The pool** goes on the floor tile before the wall the water comes down (`at a wall along x`: the wall along the tile's far
  edge to the right, v = 0; `along y`: to the left, u = 0). Its middle is under the tile's middle.
- **The drag marks** are laid as the rails are, edge to edge; where the mine meets the temple, take each tile from its own
  part's set. They read best leading from shackles to a threshold, his gate, a bone heap or the rift.
- Nothing here stands on the floor: a hero walks over the marks and the pool. If the pool should sound wet underfoot, that is
  the sound chat's.

## His art rulebook, and the measure

Held by `tests/lair_story.test.ts` (11 of 11): off, and imported by nothing of the game; every piece painted in both parts;
sizes and anchors as the game lays them; crisp (every pixel all there or not at all; a floor tile covers its whole diamond);
nothing cyan; the enemy's pink only deep in the Eye's slit, dull, and the Eye giving no light; nothing red; the floor tiles and
the Eye darker than the darkest word, and what hangs on the walls no brighter than floor 5's own that hang there (the shackles
were brighter at first, 165 against 137 at the 99th of their pixels, and were toned down to it); the Eye wider than tall, its
slit tall, inside its slab; the water down to the floor and the pool against its wall; a run of drag marks meeting at its
tiles' edges; the temple's pieces on the bare stone. No carved words. An original design, drawn from the game's own Eye.

**The Gate Ward and the Brawler are the measure** (How art is made and approved, 10): `pictures/7_beside_the_measure.png` has
the Gate Ward above and the new pieces below at the same size, the Brawler standing by them. They are drawn with floor 5's own
painter, ramps and grain (three tones a material, two picture pixels to a game pixel), neither finer nor rougher than the
pieces beside them.

`tsc --noEmit`: nothing from this branch (tests/relief.test.ts line 378 is main's own).

## The pictures (`pictures/`; each sized to be read on a phone, none a tall sheet)

1. `1_shackles_and_drag_marks.png`: the mine, four times the game's size: three pairs of shackles, the drag marks beginning
   under one, black water at the far left.
2. `2_the_eye_and_black_water.png`: his hall, four times: the Eye in the stone; right of it the water down the wall, pooled.
3. `3_drag_marks_to_the_bone_heap.png`: his hall, four times: the marks over the flags, from his gate to his bone heap.
4. `4_shackles_in_the_temple.png`: his hall, four times: the shackles on the temple's stone.
5. `5_phone_mine.png`, `6_phone_hall.png`: one phone screen each, the game's own size (507 x 234 game pixels).
7. `7_beside_the_measure.png`: the Gate Ward, and the new pieces with the Brawler, the same size.

Made with (each then captioned):

    node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/c_shackles.png 1200 672 "shackles"
    node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/c_eye.png 1200 672 "eye"
    node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/c_heap.png 1200 672 "heap"
    node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/c_chained.png 1200 672 "chained"
    node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/mine.png 1014 468 "mine"
    node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/hall.png 1014 468 "hall"
    node tools/preview.mjs src/dev/preview_lair_story.ts shots/story/mine_brawler.png 1014 468 "mine brawler"
    node tools/preview.mjs src/dev/preview_gateward.ts shots/measure/gw_dressed.png 1014 468 dressed

(After a view's name: " before", the floor without the story's pieces; " lit", no dark laid; " brawler", the Brawler in the
knight's place.)
