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
- tsc clean. NOT RUN: the regression; a real phone; the pieces in the game with your rules.
