# The floors' look builders a part at a time (12 Nov 2026)

The Look-builders chat (session ...VetztYx), a chat of his working from the queue: his words, 12 Nov 2026, 12:55 Eastern, “Work
on the next queue item”. The queue's `make-floors-look-builders-in-parts`. Branch `build/look-builders-in-parts`, CUT FROM
`build/smooth-loading-frames` 713b305 (the item waits on it, and it is not in main yet): it merges after that branch. Main is
untouched; nothing is published. He has not been asked anything: NOTHING HE SEES CHANGES (no switch).

## What it is

1. **FLOORS 6 TO 20 NO LONGER MAKE FLOOR 4'S PIECES.** The item asked the main chat to look first whether those floors show any
   of them. Looked at here: every floor 6 to 20 (three seeds each, the High City's too) is dressed by Act 1 (`L.act1`), has no
   floor 1-to-5 dressing (`L.dress`), no doors, no levers, and lays only spikes, whose holes are drawn with Act 1's own pictures
   (render.ts: the `act1Dressed` branch `continue`s before `art.hazards.holes`); the spikes rising are the base hazard art's, not
   the pieces'. The chapel's look needs `L.dress`. So nothing of floor 4's pieces is drawn there, and making them cost
   **1.6 s** on floor 6 here. Now:
   - `art/floors.ts` `lookHazards`: the floor's pieces are taken the first time a hole, a plate or a slot is drawn (and held from
     then), not as the trap art is made.
   - `main.ts` `placeSteps`: no `lookPieceSteps` for a level dressed by Act 1.
   `art.gates` (the chapel's gate art, made in a millisecond) and `lookGround(4)` / `lookProps(4)` are as before.
2. **FLOOR 1'S TOMB AND FLOOR 4'S CHAPEL A PART A STEP** (`art/tomb.ts` `tombSteps`, `art/chapel.ts` `chapelSteps`, taken by
   `art/floors.ts` `lookPieceSteps`), as the castle hall's are: each wall face, tile, frame and piece a part (`Ahead`), the builder
   taking them; floor 1's and floor 4's own lists (`art/floor1.ts` `wardenPieceSteps`, `art/floor4.ts` `ossuaryPieceSteps`) a piece
   a step first, each graded into the look's colours a part.
3. **ACT 1'S AND ACT 2'S LISTS A PIECE A STEP** (`render/act1_pieces.ts` `act1PieceSteps`, `listPieceSteps`): 17 lists (the camp's,
   the Quarry's, Echo Canyon's, the redoubt's, the Hush's set, floors 11 to 20's own, the High City's set, the hub's) are each a
   list of makers, one a piece (`xMakers`, `xPieceSteps`, `xPieceCount`, `xPiecesHeld`): the list made at once as before, or a
   piece a step. Left as they were (laid out otherwise, and light: 0.04 to 0.22 s in node): the Ledge's, the Pinewood's, the
   Fen's, her vines.

THE PICTURES ARE THE SAME: every picture of the tomb, the chapel, floors 1's and 4's lists (1,525) and of the 17 lists (1,013
pictures, and every other field of every piece) hashed on the code before (713b305) and after, made at once: the same, line for
line. Made a part a step, the tomb's and the chapel's are the very pictures made at once, pixel for pixel (the tests).

## Then, the last heavy pictures (his word, 12 Nov 2026, 13:38)

Shown that what was left had been queued, he wrote: “Why throw something in the queue when your task is done and you could just
start working on it immediately.  Ask if you should start on a new task, then do it.  I’m trying to clear the queue not add to
it”. Asked by pop-up, his picks: start on it now, “Yes, start it now (Recommended)”; and that every chat should work so, “Yes, add
it for all chats (Recommended)” (put in the queue's rules, its document meta/protocol, and in CLAUDE.md on this branch). So, here:

4. **A PICTURE PAINTED IN STAGES** (`engine/steps.ts` `Stages`, `finish`, `stagesStep`, `Ahead.staged`): a painter written as a
   generator, yielding between stages; run through, it is the painter as it was; under the loading screen, 25 ms of its stages a
   step. `art/chapel.ts` `Deep.marchRows`: a solid marched a few rows a stage (each pixel reads and writes only its own depth and
   colour, so the picture is the very one `march` makes; `march` runs it through). In stages: the chapel's two piles of rock
   (`rockSpillStages`, 0.6 s each in node) and the break-in's base, its rock and props (`breakBaseStages`, its frame 0 0.9 to 1.4 s
   in Chrome), the base first in `chapelStretchSteps`.
5. **FLOOR 13'S WATER WHEEL a frame a step** (`art/floor13.ts` `wheelFrameSteps`, 32 frames, 0.75 s at once in node).
6. **A FLOOR'S GROUND a picture a step** (`art/ground.ts` `makeGroundArt` takes a `part`; `art/crypt.ts` `cryptGroundSteps`;
   `art/floors.ts` `lookGroundSteps`, in `main.ts` `placeSteps`): about 70 pictures, 0.35 to 0.56 s at once.
7. **THE OPEN GROUND'S TERRAIN AHEAD of the floor's first drawing** (`render/outdoor.ts` `terrainAhead`, `Outdoor.aheadSteps`, in
   `render.ts` `prepareSteps`): its look made with its grids (`gridField`) left to fill, then the grids two rows a stage; a grid
   asked of before it is filled fills itself at once. The same values cell by cell. The Millrace's seven grids took 1.3 s of
   floor 13's first drawing on the game's own thread (the painter's worker works out its own, off it, as before).

THE PICTURES ARE THE SAME: floors 1 to 4's ground art, the break-in's and way-in's frames (384 pictures) hashed on 713b305 and
after: the same; everything fingerprinted before, again the same. The ground painted from a terrain worked out ahead is the
ground painted from one made at once, pixel for pixel (the tests, floors 9 and 13).

## Measured (Chrome on a two-core cloud machine, a phone's screen, `tools/scenarios/loading_frames.mjs`, no bakes beside the page; NOT A PHONE)

The longest wait the browser showed under each loading screen:

| loading screen | before (713b305) | after |
|---|---|---|
| floor 1 | 1,233 ms; 1,217 ms | 250 ms; 400 ms |
| floor 4 | 1,517 ms; 1,700 ms | 750 ms; 1,417 ms; 967 ms |
| floor 6 (alone) | 1,600 ms (floor 4's pieces, 1,595) | 767 ms (with the lists still whole), then 367 ms |
| floor 11 | 783 ms | 667 ms; 550 ms |
| floor 13 | 1,733 ms (the first drawing) | 2,033 ms; 1,500 ms (the first drawing) |
| into town | 617 ms | 467 ms (not changed by this) |

AFTER THE LAST HEAVY PICTURES (the same machine and way):

| loading screen | before (713b305) | after all of this |
|---|---|---|
| floor 1 | 1,233 ms; 1,217 ms | 350 ms |
| floor 4 | 1,517 ms; 1,700 ms | 250 ms |
| floor 6 | 1,433 ms | 333 ms; 500 ms |
| floor 9 | 1,600 ms (the first drawing) | 433 ms |
| floor 11 | 783 ms | 283 ms |
| floor 13 | 2,033 ms (the first drawing) | 567 ms (and one wait of 533 to 750 ms as the floor is made, before the loading screen's work: the game's own, not a picture) |

What is left over 250 ms: single pieces of 0.2 to 0.3 s (the redoubt's gatehouse, the Gate Ward's broken gate); on open ground,
the first drawing painting a piece or two of the ground on the game's thread while the painter's worker is still working out its
own terrain; and, on this page with no bakes, the monsters' frames painted as they are first shown (the bakes beside the release
take that away).

BEFORE THE LAST HEAVY PICTURES, these were still long, each ONE picture of its own:
- FLOOR 4: one or two steps of 0.9 to 1.4 s: most likely the chapel's break-in, its first frame (`chapelStretchSteps`, a frame a
  step already: in node its frame 0 alone takes 1.5 s); and its two piles of rock from the break (`rockSpill`, 0.6 s each in node:
  seven solids marched into one picture). And `lookGround(4)`, 0.35 to 0.56 s (the ground's art, one step).
- FLOOR 13: the water wheel (0.75 s in node, one piece); and the world's first drawing, 1.5 to 2 s (render.ts, not the loading
  screen's steps).
- The next heaviest pieces in node: the redoubt's gatehouse 0.26 s, the Gate Ward's broken city gate 0.21, the Undercity's
  bursting sluice 0.20; everything else under 0.2.
To go further: a picture made in stages (a generator a step) for those few, or baked into files as the heroes are.

## Checked

tsc clean. Unit `--only` look_parts, load_slice, tomb, chapel, floor1, floor4, floor6, floor11, floor13, hub2, floor_looks_game
and the core on f71ed72747: 34 files, 30 passed, 4 failed: chapel, floor1, floor4 and tomb, each on its “Colour 4” check (its
places darker than the darkest word); THE SAME FOUR FAIL THE SAME WAY ON 713b305 (run here alone): not of this build (the
Loading-frames chat found chapel's and tomb's so on main e1b3274). Playtests on a page of the branch, served, a phone's screen:
`loading_frames.mjs` (floors 1, 4, 6, 11, 13), `guide.mjs` (a new player's first dungeon), `floor_loading.mjs`: finished clean;
the floors looked at after their loading screens against the same before. `tests/look_parts.test.ts` (new, 6): floors 1's and 4's lists a piece a step the same as at once, nothing left put
by; the tomb and the chapel a part a step the same as at once, every picture, nothing left put by, no step but the last making
the whole; `lookPieceSteps(1)` and `(4)` in parts; floors 6 to 20's traps' art makes no floor 4 pieces until a hole, a plate or
a slot is drawn, then the floor's own; Act 1's and 2's floors a step a piece, nothing left put by. `tests/load_slice.test.ts`
(7) passes. Unit: see the foot. The fingerprints: two scripts run on both trees (not kept: they were one-off checks).
`loading_frames.mjs` floors 1, 4, 6, 11, 13 finished clean on both.

NOT CHECKED: his phone; a release build with the bakes; the published page's playtests; the whole suite.

## For the main chat

Bring in `build/smooth-loading-frames` first, then merge this (it is that branch and its own commits; it touches 24 files under
`src/art`, `src/render/act1_pieces.ts` and `src/main.ts` `placeSteps`, one line). Nothing to switch on.

THE MARKS: the heroes' (1fdc8d09059a) and the townsfolk's (d4c898fe370d) are unchanged. THE MONSTERS' MARK CHANGES, the same
pictures: 1b2f6c2fbd50 on 713b305, 2bb4f2030010 at 249ae53. Their bake page's bundle, diffed before and after, differs ONLY by
the modules' holders kept for their side effect (`var OSSUARY_AHEAD = new Ahead()`, `CHAPEL_AHEAD`, `WARDEN_AHEAD`, `TOMB_AHEAD`,
`GROUND_AHEAD`), engine/steps.ts's new `staged`, `stagesStep` and `STAGE_MS`, and one local name esbuild renamed (`finish` to
`finish2`, in the gaits' GRIP_RUNS, for the new export's name): no painting code. So no painting is needed: `node tools/bake_monsters.mjs --from <the mark before>` takes the
kept bake's figures as the new mark's. (TO KNOW: 713b305's own monsters' mark, 1b2f6c2fbd50, is not main's 4f510caa1c9d:
`build/smooth-loading-frames` changes it by itself; its note says main's bakes go with it. Worth a look as it is brought in.)

The published page's playtests, `loading_frames.mjs` with `FLOORS=1,4,6,11` among them.

After the last heavy pictures, `node tools/unit.mjs --only` look_parts, load_slice, chapel, tomb, floor4, floor13, ground, crypt,
terrain, millrace, pinewood, outdoor_shadows, act2_walls and the core on 249ae53e18: 36 files, 32 passed, 4 failed: chapel, floor4
and tomb on their “Colour 4” checks, and crypt on its two (its dungeons “as at aaa8310”, and a place darker than any word's
colour): THE SAME FAIL THE SAME WAY ON 713b305 (crypt run alone there: the same two). `tests/look_parts.test.ts` now 9, all pass.
Playtests on a page of 249ae53: `loading_frames.mjs` (floors 1, 4, 6, 9, 11, 13), `guide.mjs`, `floor_loading.mjs`: finished
clean; floors 9 and 13 looked at after their loading screens.
