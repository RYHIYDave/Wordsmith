# THE LOADING SCREEN'S WORK IN SLICES (12 Nov 2026)

The Loading-frames chat (a new chat of his, working from the queue). The queue's `smooth-the-loading-screens-long-frames`.
Branch `build/smooth-loading-frames`, from `main` e1b3274 (25.3.8) with `fix/frames-from-sheets` (de6fea61) merged in, as the
item said to build on. Main is untouched; nothing is published.

## His words

To the eight-sides chat, 11 Nov 2026, 22:23: “THE LOADING SCREEN LAGS”. His phone (the phone check's run `rmwdh7eupd67`,
12 Nov, 06:40, with the sheets fix): two waits under the loading screen into town, 1,718 ms and 1,413 ms. He has not been
asked anything about this build.

## What the two waits were (measured here, Chrome on a two-core cloud machine, a phone's screen, the Brawler)

`tools/scenarios/loading_tree.mjs` (the browser's profiler under the loading screen's own work, as a tree):

1. **1.42 s, frame 2: the new place's pictures made in one frame** (`placeFrame` and `renderer.prepare`): the castle hall's
   own pieces (its air 283 ms, pots, trusses, ivy), the town's things in its stone (`castleTown`: it asks for every frame of
   the ring's lazy lists at once), the waypoint, floor 1's stairwells, the roof.
2. **1.05 s, as the screen lifts: the world's first drawing**, which made the rest: the hall's stairs down (185 ms), the day
   beyond its gate (143), the shaft's head (164), its floor's tiles, faces and sun; and **the Tinkerer's and the Warlock's
   effect lists, painted whole on every first drawing whoever the hero** (about 0.5 s: their draws ask for them every frame,
   `render/tinkerer_fx.ts`, `warlock_fx.ts`). NOT the hero's frames handed over: 52 ms a sheet at most here.

Between floors the same: floor 1, 1.58 s; floor 6, 2.09 s and 2.48 s; floor 11, 3.78 s.

## The mend (`LOAD_SLICE` in `src/main.ts`, on; off is the game as before)

What the loading screen waits for is made **a step at a time, 50 ms of the game's own work a frame** (at least one step):
about the ring's own rate (it turns at 10 frames a second), so it looks as it does at full speed and the screen is up little
longer. **No picture changes**: each step calls the same builder the game calls later, and every builder keeps what it
makes, so the later call finds it made.

- `src/engine/steps.ts`: `LoadStep` (a step may give back more steps, done next); `Ahead` (parts put by for a builder that
  makes all at once, each taken once, let go of with the builder's own forgetting).
- `main.ts`: `loadSteps`, `placeSteps` (each builder `placeFrame` calls, a step ahead of it), `runSteps`; then the world drawn
  under the screen, again each frame until the open ground's pieces have come.
- `render/render.ts` `prepareSteps` (what `prepare` did, as steps, and ahead of the first drawing: the effects' lists, Act 1's
  pieces, the shaft's head, the hall's and the chapel's own), `groundComing`, `underLoading`.
- In parts: the castle hall (`art/castle_hall.ts` `castleHallSteps`; `render/castle.ts` `steps`, `drawSteps`); a floor's two
  stairwells and waypoint (`art/crypt.ts` `cryptWaySteps`; `art/crypt_ways.ts` `makeWaypointArt` takes a `part`); floor 1's
  stairwells (`art/floors.ts` `lookStairSteps`); the chapel's break-in and way in, a frame a step (`art/chapel.ts`
  `chapelStretchSteps`; a look may have `steps(L)`, `render/looks.ts`); Act 1's pieces a list a step (`render/act1_pieces.ts`
  `act1PieceSteps`); the effects' lists a frame a step (`render/fx_lists.ts`).
- `render/outdoor.ts` `asking`: under the loading screen the open ground's pieces are asked of the ground's worker, never
  painted all at once (with no worker, a few a frame); `missing` says how many the screen still lacks.
- `render/baked.ts`: the hero's frames handed over 6 ms at a time (`HAND_MS`), a frame let in between; and his art for each
  place set up in a go of its own (`stats.artMax`, the longest).

For measuring: `__dbg.loadingLog()` (each loading screen's frames, the game's own work in each, what it did, its steps over
80 ms by their code), the bake's `stats.handMax`; `tools/scenarios/loading_frames.mjs` (into town as he does it, then
`FLOORS=...`), `loading_tree.mjs`, `loading_profile.mjs`.

## Measured after (the same machine and way)

| loading screen | the longest wait before | after |
|---|---|---|
| into town (the Brawler) | 1,433 ms and 1,050 ms | 217 ms (frames mostly 50 to 90 ms) |
| floor 1 | 1,583 ms | 1,083 to 1,417 ms (the tomb's builder, one step) |
| floor 4 | (not measured before) | 1,467 ms (the chapel's builder, one step) |
| floor 6 | 2,083 ms and 2,483 ms | 633 ms |
| floor 11 | 3,783 ms | 667 to 933 ms |

Into town as the other heroes, after: the Warlock, the longest wait 167 ms (his art for a place set up in 50 ms at most); the
Tinkerer, the game's own frames 166 ms at most, BUT ONE WAIT OF 2.35 s that is not the loading screen's work: her art set up as
her baked group comes in (`render/baked.ts` load, `art.of`: `makeTinkererArt` > `herSet` > `tinkerHold` > `steadied` >
`steadyElbows`, her held move's poses solved, 2.3 s in one go; `stats.artMax`). It was there before this build; it is queued.

What is still over 150 ms into town is single pictures: the hall's roof (~140 to 200 ms), its stairs down (~170), the shaft's
head (~100), the day beyond the gate (~90).

NOT CHECKED: HIS PHONE. The phone check's recorder on the page would say (`test/phone-check`: `tools/phone_check_page.mjs`).

## Checked

tsc clean. `tests/load_slice.test.ts` (new, 7): the castle hall, a floor's ways, floor 1's stairwells, the chapel's break-in
and an Act 1 floor's pieces made a step at a time are the very pictures made at once, pixel for pixel, and nothing is left
put by; an effect's list made a frame a step is the list made whole. Unit `--only` load_slice, castle_hall, chapel, crypt, tomb, ways, ways_art, floor_looks_game, baked, sheet_sprite,
stairwell_open, act2_walls, act2_moments and the core, on 7a7efa9258: 35 files, 31 passed, 4 failed: castle_hall, chapel, crypt
and tomb, each on its colour check (its floor and walls “brighter than the darkest word”) and crypt on its dungeons' mark “as at
aaa8310”; THE SAME FOUR FAIL THE SAME WAY ON `main` e1b3274 (run here alone): not of this build. Then, the art set up a place at a
time: baked and load_slice again (below, the last commit). Playtests on a build of the
branch with the live site's heroes' and townsfolk's bakes, served, a phone's screen: `loading_frames.mjs` into town (the
Brawler, the Tinkerer, the Warlock) and floors 1, 4, 6 and 11, finished clean; the screens after it looked at against the same
before; `floor_loading.mjs` (into floor 1, down to floor 2), `guide.mjs` (a new player's first dungeon, 8 steps), `baked.mjs`
(the Warlock from the bake): finished clean.

## Left, for another chat (queued)

- THE TINKERER'S ART SET UP IN ONE GO (2.3 s here, above): her held move's poses solved all at once as her art is made.

- THE FLOORS' LOOK BUILDERS STILL MAKE ALL THEIR PIECES AT ONCE: the tomb's (`art/tomb.ts` `makeTombArt`, ~1.1 to 1.4 s here)
  and the chapel's (`art/chapel.ts` `makeChapelArt`, ~1.4 s; its `ossuaryPieces` alone ~0.75 s), the Quarry's and the Gate
  Ward's lists (~0.6 and ~0.9 s). Each is now one step; cut into parts as the castle hall's are (`part`), or baked into files as
  the heroes are, they would go.
- TO ASK THE MAIN CHAT: floors 6 to 20 make floor 4's chapel pieces (`placeFrame`: `floorLook` of a deeper floor is 4, so
  `lookHazards(4)` and `lookPieces(4)`), about 1.4 s the first time; whether those floors show any of them was not looked at.
