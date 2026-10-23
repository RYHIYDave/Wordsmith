# Mock-up: the ways between the floors (NOT IN THE GAME)

**What it is.** The art chat's pictures for the ways between the floors that he asked the main chat for on 22 Oct
2026: so far, FLOOR 4'S END (the skull wall giving way to the cave, and the cave's other end on floor 5) and THE
TOWN'S WAYS (the stairs down to floor 1 and floor 1's stairs up, the shaft's head with its cage coming up, the gate
barred and unbarred). Each has his yes, below. Floors 6 to 15 are being painted next, on this branch, pictures to him
first (his “Yes, paint them (Recommended)”, by 14:16).

**The branch:** `mockup/ways`, from v23 at 700dbd1. Nothing of the game imports `src/art/cave4.ts` or
`src/art/town_ways.ts`; each is behind its own switch, off (`CAVE4`, `TOWN_WAYS`). The game's own files were touched
only to export what these files use (no change in what they do): art/floor4.ts (its painter and bones), art/ground.ts
(`wallFacePixels`, the wall face's picture), art/crypt_ways.ts (`makeStairwellOf`, the stairwell at other measures;
`makeStairwell` calls it with the old ones), art/shaft.ts (its irons, cable, timber and `paintShaft`), art/gates.ts
(the arch's curve and measures).

## His words (Pacific time)

- To the main chat, 22 Oct, 11:21: “I’d like to fix the level exits in 4-15.  Level four should end with a wall
  crumbling down after the boss is killed and a cave entrance is exposed.  Then you enter the fleshmancer’s lair.
  Let’s put the empty elevator cage in the bottom corner of the prison town so you come up to town from beating the
  fleshmancer.  Then you head out the big gate at the top of the town to enter the quarry and head back down the
  mountain to the town.  So the gate needs to be blocked or barred up until that point.  You’ll start a new game in
  town and the wordsmith will give you a quest to find the key to turn on the altar or whatever it is I can’t
  remember.  I guess have some stairs in town also and you go down the stairs to enter level 1.  Then have exits
  that lead to the next zone in a natural way as opposed to just a waypoint being plopped down.” Asked who draws the
  new pieces, by 11:30: “The art chat (Recommended)”.
- To the art chat, 12:04, told the main chat had posted the work: “Go”.
- Shown a film of floor 4's end and stills of it and of floor 5's mouth, asked “Is floor 4's end right: the skull
  wall shaking, bursting and falling back into the cave, and floor 5's mouth?”, by 12:51: “Yes, on to the town
  (Recommended)”.
- Shown stills from the game (the stairs down, the cage, the gate barred, floor 1's start) and two films (the cage
  coming up with him in it; the gate unbarring), asked “Is the town right? The stairs down (3 tiles by 2, by the
  stash), the empty cage in the near corner, the barred gate and its unbarring, and floor 1's start with the stairs
  up behind its arch.”, by 14:01: “Yes, on to floors 6–15 (Recommended)”.
- Told what each of floors 6 to 15's ways would be (in the art chat), asked “Paint these ways on for floors 6 to 15?
  I'd show you floors 6 to 10 first, then 11 to 15.”, by 14:16: “Yes, paint them (Recommended)”.

The films and stills he saw were made in the art chat's workspace as `previews/ways/` (1 and 2 floor 4's end; 3 to 5 the town); previews are not kept in git.

## Floor 4's end: `src/art/cave4.ts` (`CAVE4`, off)

- **The wall gives way** (`caveFilm(alongX)`): three tiles of the ossuary's skull wall in a back wall of the
  amalgamation's hall (`CAVE_TILES`). It shudders and bows, bursts at the foot of its middle (skulls, bones and rock
  thrown out arcing, bouncing and rolling, a gust of dust out of the dark), the middle's top drops and breaks, then
  the sides; dust rolls out and settles. **126 frames at 30 a second: 4.2 s** (`CAVE_FRAMES`, `CAVE_OPEN_SECS`). Its
  jolts (`CAVE_JOLTS`, frames): the burst 30 (1.0 s), the middle's top dropping 35 and breaking 41, the sides going
  48, dropping 52, breaking 58 (1.93 s). The frames are whole pictures, 400 by 300 picture pixels (two to a game pixel), anchored at the foot
  of the face under the middle of the doorway's middle tile, as a wall piece is (`ax`, `ay`). Two sides:
  `alongX` true for a face whose wall runs along x (the room toward +y), false for one along y.
- **The cave as it stands** (`after`, and in two layers): `under`, the cave seen through the mouth, to lie under
  whatever stands, as the floor does; `over`, the rim, the rubble and the dead lying out on the floor, to stand at the
  wall's face as a gate's arch does, so that he walks in under the rim. The rubble lies low, a tile and a half out
  from the face: walkable. `before` is the wall standing, the floor's own skull wall.
- **Floor 5's mouth** (`lairMouth(alongX)`): the same mouth in the lair's earth and rock, its throat climbing away
  into the dark; `under` and `over` as above, `whole` both.
- **For the rules:** the film is 4.2 s; take `CAVE_OPEN_SECS` for your `CAVE_OPENING` (3.5 s now), so that he walks
  in once the wall has fallen. A kick and a blow for each of `CAVE_JOLTS`, as the stairwell's film has.

## The town: `src/art/town_ways.ts` (`TOWN_WAYS`, off)

- **The stairs down** (`townStairs(way)`): a broad flight going down under the hall's floor into the dark, a low
  parapet of the hall's dressed stone round three sides, open at the top of its steps. **3 tiles long by 2 wide**
  (`TOWN_STAIRS`), bigger than the floors' stairwells (2.4 by 1.25), drawn as theirs are, at the opening's corner,
  with the floor. Shown to him at your `TOWN_STAIR` (x 14, y 17, along x): keep it there, and take `TOWN_STAIRS`'
  long and wide for where its top step is.
- **Floor 1's stairs up** (`floorStairsUp(theme, alongX)`, theme `CRYPT_FLOORS[0]`): in the first floor's gate's
  arch, its portcullis gone (do not draw it there), a flight going up into the dark between walls, under a vault.
  Drawn with the floor, under what stands, anchored as the arch's strips are: at the doorway's `at(-wide)`, back 0
  (render.ts standDoors). The arch and pillars stand as they do.
- **The shaft's head** (`townShaft()`): the shaft come up through the hall's floor, its timber collar and four posts,
  the cage standing in it with its gate open toward −x, the onsetter's candle. Two layers, `back` and `front`, the
  hero between them; anchored at the middle of `TOWN_SHAFT`'s tile (x + 0.5, y + 0.5), stood at depth x + y + 1, back
  a hair before it and front a hair after.
- **The cage comes up** (`townArrives()`): **101 frames at 30 a second (3.37 s), as your `TOWN_ARRIVE`**. Out of the
  dark of the hole it is hauled up, slowing; it strikes the catches at frame 56 (1.87 s, a jolt), lifts and settles
  back at 62 (2.07 s, a second); dust puffs round the collar; its gate rattles open, frames 70 to 88 (2.33 to 2.93 s).
  `back` and `front` as the still's; `lift[k]`, how far the cage's floor is over the hall's (picture pixels; under it,
  less than 0). The hero rides in it: draw him lifted by lift/2 game pixels, and cut away what of him is under the
  hall's floor (`riderUnder(lift, h)`, h his height from his feet, 0 to 1).
- **The gate barred** (`gateBars(alongX)`): two squared baulks nailed across the portcullis in a cross, four chains in
  from rings on the pillars, a great padlock where they cross with the cult's seal burning the enemy's pink (its light
  on the strip that carries it). As strips, stood as the portcullis's are: from the arch's start (−wide), a hair in
  front of it (back: wide − 0.03).
- **The gate unbarred** (`unbarFilm(alongX)`): **78 frames at 30 a second (2.6 s)**. The seal flares and the beams
  tremble; the lock bursts at frame 14 (0.47 s, a jolt); the beams drop, striking the floor at 18 and 23 (0.6 and
  0.77 s), topple and lie; the upper rings snap at 30 (1.0 s) and the chains slither down into heaps; dust. Each frame
  as strips, stood as the bars are. Then **what is left** (`gateLeft(alongX)`): the beams and chains on the floor before
  the gate, out of his way. The portcullis rises as it always has once he comes near.
- **When to play the unbarring:** your rules send `gateUnbarred` as he comes up in the cage, when the gate is far out
  of sight. Best played when he first sees it: start the film the first time the gate's doorway comes on screen (or
  he comes within some tiles of it) after it is unbarred; until then draw the bars. The message "The gate is unbarred."
  can stay as he arrives.

## Floors 6 to 10: `src/art/act1_ways.ts` (`A1_WAYS`, off), with the kit `src/art/ways_kit.ts`

HIS WORDS: shown films of each from the game (the way on shut, the boss dying, the film, open) and stills of where each
floor begins, asked “Are floors 6 to 10's ways on, and where each floor begins, right as shown?”, by 17:41 Pacific,
22 Oct: “Yes, on to 11–15 (Recommended)”. And to the main chat, 17:42: “6-10 are done as well”.

Each way on is painted in its floor's own
look, in the world, in a frame of its own: it leads one of four ways along the grid (`WayDir`, `wayDirOf(dx, dy)`: from
where the boss stood toward `Ways.onward`, the nearest of the four), so that it always leads away from the floor behind
him. `xxxWay(d)` gives `WayArt`: `shut` and `open`, each `under` (with the floor, under what stands) and `over` (stood at
the way's point), and `film` (whole frames, 30 a second, its jolts and how hard each). `back` (tiles): where the picture
is anchored, back from `Ways.onward` toward the boss's ground (0 but for floor 7): its mouth, where he goes in.
`xxxStart(d)` gives `StartArt` (`under`, `over`, `back`), what he came out of at the floor's start, `d` the way from the
boss toward the start (it lies that way of him), stood `back` tiles on from the start that way.

| Floor | Way on, shut | As the boss dies (film) | Next floor begins |
|---|---|---|---|
| 6 Quarry | `quarryWay`: a stair hewn down into the bedrock under a bench of the rock, a hoist over its head; the cult's cut blocks jammed in its head and heaped on it | the Unfinished's crash: the pit shakes, the heap is thrown up and out, blocks tumbling and crashing over the floor; 112 frames | `quarryStart` (floor 6): the quarry's gate, posts, beam, the cult's board, a leaf swung open, ruts, a cairn |
| 7 Ledge | `ledgeWay`: a crack in the eyrie's rock with a stair of planks down it, driftwood posts at its head; the Queen's nest heaped over it | the flock bursts out of the nest and beats away, the nest blown apart, sticks and bones flung and falling down the crack, feathers drifting; 120 frames; `back` 2.35: the crack lies back from the eyrie's drop | `ledgeStart` (7): the stair from the quarry, cut down the face of a spur of rock |
| 8 Canyon | `canyonWay`: two fins of the banded rock, a slot between, a chockstone; rockfall jammed in it | the Cantor's echo: the fins shudder from their far end to the mouth, dust and pebbles in a wave; the plug blasted out; 124 frames | `canyonStart` (8): a plank stair pinned zigzag down a pillar of the canyon's rock |
| 9 Pinewood | `pinewoodWay`: two sick trees leaning together over a trail into the gloom; the swamp's roots across it, veins of pink | the roots thrash, their veins flaring, then wither grey and draw back down into the earth, leaving it torn; 126 frames | `pinewoodStart` (9): a cleft between mossy granite boulders, the stream out of it |
| 10 Fen | `fenWay`: an old paved causeway out over the water, sunk under it, its posts' heads showing | rings and bubbles, then it rises up out of the fen streaming water, settles with a slap; 130 frames; to the camp | `fenStart` (10): out between two of the sick trees, their roots lying dead |

THE PINK: only the sick roots' veins on floor 9 (the swamp's, the enemy's), gone as they wither. Nothing cyan.

FOR THE RULES (yours): start each film as the boss dies (`onward.awake`, `warpAt`), its frames stood at the way's
point; take him on once the film is over (the longest 130 frames, 4.3 s). Paint the films ahead with the floor (each
takes some seconds to paint).

### Piece by piece, for the rules

Every picture is cut down to what is painted in it, its anchor (`ax`, `ay`, game pixels) the point of the floor it
stands on. Tiles are counted in the way's own frame: `a` along it (on, away from the boss's ground, `+`), `b` across it
(`+` as `turnOf(d)` turns `(0, 1)`: `+y` for `x+`, `-y` for `x-`, `-x` for `y+`, `+x` for `y-`), in whole tiles from
`Ways.onward`'s tile (the ways) or the floor's start's tile (the starts). LAYERS: `under` drawn with the floor, under
everything that stands; `over` and every film frame stood among the figures at the anchor's depth (its x + y, plus
0.6 as the scratch copy stood them); the film's frames are whole (draw them alone, no `under`, while it plays).

| Way on | Anchor | Walking in takes him on | Solid | After the film | Wants behind it | Film |
|---|---|---|---|---|---|---|
| 6 `quarryWay` | at `Ways.onward` | the stair's head, (0, 0) and (1, 0) | the kerbs and the hoist's posts, (0 to 2, -1) and (0 to 2, 1); the bench of rock and its boulders, (2 to 4, -2 to 2) | the cult's blocks thrown out lie, knee high: (-1, -2), (0, -4), (0, 3), (-1, 1), (1, 2) solid from the film's end | the pit's far wall from a 2 on (else the bench stands as rock on the floor, solid as said) | 112 frames (3.73 s); jolts 24, 43, 47, 53, 57, 71, 94, 104; kicks 7, 6, 4, 6, 5, 4, 4, 4; 27.3 MB |
| 7 `ledgeWay` | 2.35 tiles back from `Ways.onward` (`back`) | the crack, any of (-2, 0), (-1, 0), (0, 0) | the driftwood posts at its head, (-3, -1) and (-3, 1) (thin) | the nest's sticks and bones lie flat: walkable | the eyrie's drop past `Ways.onward`, as now | 120 frames (4.0 s); jolt 20, kick 6; 68.9 MB (the flock flies wide) |
| 8 `canyonWay` | at `Ways.onward` | the slot, (0, 0) (and on in, (1, 0), (2, 0)) | the two fins, (0 to 2, -1) and (0 to 2, 1) | the plug's boulders lie low before it: walkable, as the cave's rubble | the canyon's end wall from a 3 on (the slot goes on into its shadow) | 124 frames (4.13 s); jolts 34, 47, 60, 65, 71, 78, 84, 97; kicks 8, 5, 5, 5, 5, 4, 5, 4; 44.9 MB |
| 9 `pinewoodWay` | at `Ways.onward` | the trail, (0, 0) and on along it, (1 to 3, 0) | the two sick trees, (0, -1) and (0, 1); the wood under their crowns, (1 to 2, -1) and (1 to 2, 1); the two beyond, (3, -1) and (3, 1) | the torn earth: walkable | the wood from a 1 on, the trail running into it | 126 frames (4.2 s); jolts 34, 56; kicks 5, 3; 26.2 MB |
| 10 `fenWay` | at `Ways.onward` | the causeway once risen, (0, 0) and on along it, (1 to 5, 0) | the fen's water either side of it, (0 to 5, -1) and (0 to 5, 1) | the causeway stands, wet: walkable | the fen's open water from a 1 on, five tiles of it: to the camp | 130 frames (4.33 s); jolts 22, 74; kicks 4, 6; 22.3 MB |

| Start | `back` | Solid (from the start's tile) | What it is |
|---|---|---|---|
| 6 `quarryStart` | 1.8 | (2 to 3, -1 to 1) | the quarry's gate, its leaf open, the cairn; the road through it leads nowhere |
| 7 `ledgeStart` | 1.5 | (2 to 4, -1 to 1) | the stair from the quarry, down the spur of rock |
| 8 `canyonStart` | 1.5 | (2 to 4, -1 to 1) | the pillar and its plank stair |
| 9 `pinewoodStart` | 1.5 | (2 to 4, -1 to 1) | the granite boulders and the cleft between |
| 10 `fenStart` | 1.5 | (2 to 3, -1 to 1) | the two sick trees, the trail between them (its dead roots low: walkable) |

Each start stands far enough back that the tile he arrives on and every tile round it are clear: nothing of it within a
tile and a half of the start. Its `under` is empty; its `over` stood at its anchor's depth. Where the way back is `x+` or
`y+` the piece stands between him and the eye: see through it while he is behind it, as the tall things are. The
floor's waypoint anywhere in the ring round him (`placeWay`'s nearest open tile is right).

ROOM: each picture cut down to what is painted in it; a floor holds one way's film, 22 to 69 MB (above), and its stills
and start under 2 MB. The film is not wanted again once played: let it go then, if room matters.

Seen in the game on the scratch copy (render.ts `a1Ways`; its lines, as a diff, `scratch_hooks_6_10.diff.txt` here, a guide
only) and filmed with tools/scenarios/_a1_film.mjs there; the
starts stood back seen there too. Checks: `tests/ways_a1.test.ts`, 4.

## Floors 11 to 15: `src/art/act2_ways.ts` (`A2_WAYS`, off), with the kit `src/art/ways_kit.ts`

HIS WORDS: shown films of each from the game (the way shut, the boss dying, the film, open), stills of where each floor
begins, and the camp's street with its cart barricade as it was and hauled aside, asked “Are floors 11 to 15's ways on,
where each floor begins, and the camp's street right as shown?”, by 11:06 Pacific, 23 Oct: “Yes, send to main
(Recommended)”; then “Go”.

As floors 6 to 10's: `xxxWay(d)` gives `WayArt` (`shut`, `film`, `open`), `xxxStart(d)` gives `StartArt` (`under`, `over`,
`back`); every picture cut down to what is painted, anchored (ax, ay) on its floor point; every colour as quiet as Act 2's
places (act2_quiet.ts), but what glows. THE WAYS IN A WALL (12, 14, 15) and THE STARTS IN A WALL (14, 15) are three tiles
of a BACK wall of the floor's own (its face toward the eye; `d` is `x-` or `y-`), anchored as floor 4's cave: at the foot
of the wall's face under the middle of the doorway's middle tile; give them `at`, that anchor's place in the world in
tiles (and the room's `zone` on 14 and 15), so that the wall's face is painted as the ground paints the floor's own
(undercity/housequiet/library's `wallFace` and `topAt`, exported for it, nothing else changed) and runs on into it.
Their `under` is what is in the opening (its jambs, its head, the threshold, the dark or the light beyond): it wants the
doorway's three tiles cut to floor (as the cave's, `openGate`), or the wall's own face would stand over it.

| Way on | Stands | Shut, and as the boss dies | Takes him on (once open) | Solid | Film |
|---|---|---|---|---|---|
| 11 `gateWardWay(d)` | THE MIDDLE OF THE CRIER'S SQUARE, its ring of setts (the Gate Ward land's `squares`, the crier's): at Ways.onward it stands behind the houses and is not seen. All of it lies flat: `under` only | the great round grate in a ring of dressed stone, sealed in the Order's ink, a rune at its heart burning the enemy's pink; it flares, the ink cracks, the seal bursts (ink flung over the flags), the grate is thrown up and drops down the shaft | the hole, (0, 0) and the four round it | none | 104 frames (3.47 s); jolts 34, 54; kicks 7, 4; 8.3 MB |
| 12 `undercityWay(d, at)` | a back wall of the King's Cistern (or a room by it) | the outfall's arch in the cistern's brick, ringed in dressed stone, its iron grille choked with the Rat King's nest; the nest seethes, his rats flood out across the floor, the grille is shoved and swings out with a clang | the doorway's middle tile | its two side tiles (the wall over them); from the film's end the grille swung out, the floor tile before the left one | 116 frames (3.87 s); jolts 26, 60; kicks 4, 6; 27.6 MB |
| 13 `millraceWay(d)` | at Ways.onward, as now (floor 13 has no walls): a stretch of the old city wall standing alone in the fields, any of the four ways | a postern in it papered over with the mill's written sheets, both its faces; they sag, peel from the top down and slough off in wet heaps, a few blown away; the door swings in | the door, (1, 0) | the wall, (1, -2 to -1) and (1, 1 to 2); its fallen stones at its ends, low | 120 frames (4.0 s); jolts 44, 98; kicks 3, 4; 18.4 MB |
| 14 `houseOfQuietWay(d, at, zone)` | a back wall of the Physician's rooms | a ward door in a dark green case in the infirmary's limewash, stitched shut with the Order's black thread; it strains, the stitches snap from the top down, the door falls open on the dark | the doorway's middle tile | its two side tiles | 110 frames (3.67 s); jolts 24, 88; kicks 2, 5; 9.3 MB |
| 15 `libraryWay(d, at, zone)` | a back wall of the Reading Room | the great doors in a walnut doorcase among the bookcases, blacked with the Censor's ink, his bars struck across it burning pink at their edges; the ink runs and drains into a pool that sinks away, the doors swing open and grey morning light pours in across the floor: home, to the camp | the doorway's middle tile | its two side tiles | 130 frames (4.33 s); jolt 106; kick 4; 14.8 MB |

Tiles as floors 6 to 10's: in the way's own frame from the anchor's tile, `a` on along the way, `b` across it; for the
ways in a wall, `a 0` is the wall's row (the doorway), `b -1, 0, 1` its three tiles.

| Start | Stands | What it is | Solid |
|---|---|---|---|
| 11 `gateWardStart(d)` | `back` 1.7 from the start | past the camp's barricade: the market cart that blocked the street, on its side, dragged over to the house fronts, its wheels up; crates and a door shoved the other way; scrapes on the setts | (2 to 3, 1), (2, -1) |
| 12 `undercityStart(d)` | `back` 1.5 | the foot of the ladder down from the Crier's grate, going up into the dark of the shaft, the moon's light falling down it onto the wet floor | (2, 0) |
| 13 `millraceStart(d)` | `back` 1.5 | the outfall's mouth: a low brick arch in a grassy bank at the fields' edge, the sewer's water trickling out through reeds | (2 to 3, -2 to 2) |
| 14 `houseOfQuietStart(d, at, zone)` | in a back wall, as floor 5's mouth: he comes in 1.7 tiles out from it (`back`) | the infirmary's back door, standing open on the dark of the yard | the doorway's three tiles |
| 15 `libraryStart(d, at, zone)` | in a back wall, as above | a side door of the library, in a walnut case among the bookcases, open on a dark passage | the doorway's three tiles |

THE CAMP'S WAY OUT TO FLOOR 11 (on mockup/act2-hub at ae89b00, src/art/hub2_camp.ts): `campPlace(all, wayOut)`; with
`wayOut` the cart barricade stands hauled aside, at `CAMP_BARRICADE_ASIDE` (38.6, 25.35), against the house fronts on the
street's far side, in place of (36.4, 26.4): the street off to the right (x 36 to 50, y 25 to 28) open on into the Gate
Ward. Solid: its own tiles there, (37 to 39, 25). Floor 15's way home comes to the camp too.

THE PINK: the grate's seal on 11 and the Censor's bars on 15, shut and going; none once open. Nothing cyan.

Seen in the game on the scratch copy (its lines, `scratch_hooks_11_15.diff.txt` here, a guide only), laid as above (the grate in the Crier's Square, the wall pieces in the nearest back
wall), and filmed there (tools/scenarios/_a1_film.mjs). Checks: `tests/ways_a2.test.ts`, 4.

## How they were seen in the game

On a scratch copy only (never pushed): your exits branch with this one merged, and a few lines in render/dress.ts,
render/render.ts and main.ts calling the pieces as above (the town's stairs in place of the stairwell in flatWays;
floor 1's stairs up in flatWays, its portcullis not drawn; the shaft's head and the cage's film in FloorDress.standing
and rider; the bars, the film and what is left in standDoors). Its scenarios: a new game in town, close on each piece;
the stairs walked down to floor 1; floor 5 cleared, the ride up and the cage coming up, slowed and filmed. Those
lines, as a diff against exits at 0093225, are `scratch_hooks.diff.txt` here: a guide only, not to be applied as is
(the unbarring there plays at once, not when he first sees the gate).

## Checks

- `tests/ways.test.ts`, 6: both switches off and nothing of the game importing either file; the cave's film both
  ways round, every frame painted, its jolts in it, its first and last frames the wall and the cave as they stand,
  nothing cyan; floor 5's mouth; the town's stairs, the shaft's head and floor 1's stairs up painted both ways with
  nothing of the enemy's pink or the friend's cyan; the cage's frames, its floor rising from out of sight to the
  hall's and staying, the rider cut under the floor and whole once up; the gate's seal the enemy's pink, gone by the
  film's end and from what is left.
- `tests/ways_a1.test.ts`, 4: floors 6 to 10 (the switch off and nothing importing the files; the ways round; each
  way's shut, film and open, its jolts, it changes, nothing cyan, the pink only in floor 9's veins; every start painted
  all four ways round, nothing cyan or pink, stood back a tile and a half).
- `tests/ways_a2.test.ts`, 4: floors 11 to 15 (the switch off and nothing importing the file; each way's shut, film and
  open, its jolts, it changes, nothing cyan, the pink only in the seals and gone open, every colour as quiet as Act 2's
  places but what glows; a way in a wall painted as the floor's own wall, its pattern running on with where it stands;
  every start painted all four ways round, nothing cyan or pink, stood back).
- tsc clean. NOT RUN: the regression; a real phone; the pieces in the game with your rules.
