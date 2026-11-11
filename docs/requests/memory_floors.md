# Lag and freezing after a few levels: what was found, what this branch mends, what is left

Branch `memory-floors`, from `main` at `797f2e4d` (25.3.1). Made 11 Nov 2026 by a chat on his phone (not the main chat).
Nothing in it changes how the game looks or plays: no switch, no pictures to show him.

## His words

11 Nov 2026, 06:49 (Eastern): “Please check on some lag and freezing issues after playing a few levels on my game.  Don’t know
if it’s just memory leak or if something else is going on”.

Told what was found and asked how to have it fixed, his pick (pop-up): “Fix it here (Recommended)” (the other choice was
“Queue it for main”).

## What was measured, and how

The live game (`gh-pages` 75285a5c, 25.3.1) and a readable build of `main` with the same files beside it, in headless Chromium
at a phone's size (844x390, three screen pixels to one: `--touch --size 844x390 --dpr 3`), served (`--serve`) so the heroes',
sounds' and Colossus's files load. A Warrior (seed 5, level 10, cannot die) and the test bot at six game steps a frame, 40 s a
floor, floor after floor in one page; at each floor, as it is come into and again after play, the browser's collector is run
and what the page still holds is counted. Then each floor alone in a page of its own, for comparison.

The tools are on this branch: `tools/mem_probe.js` (counts canvases by who made them, the painter's and the bake's bitmaps,
decoded sounds, sound nodes, timers, listeners, how canvases give their room back, each frame's work) and
`tools/scenarios/mem_floors.mjs` (its head says how to run it). NO WEBKIT ON THIS MACHINE: these are Chromium's numbers. What
an iPhone does with a canvas nobody holds is not measured here; WebKit is known to keep such a canvas's pixels until its
collector runs (WebKit bug 195325), which is why the game's own `releaseSprite` takes a canvas's size to nothing.

A MISTAKE IN THE FIRST NUMBERS HE WAS GIVEN: on floor 1 the bot cleared the floor and went down by itself, so every row after
it was one floor further than its label (the row called “floor 8” was floor 9). He was told so. The numbers below are by the
floor the game was really on; the scenario now comes into each floor by its number and says when the bot has gone down alone.

## What was found (25.3.1)

Megabytes held as each floor is come into, after the collector has run. “Alone”: that floor in a page of its own.

| floor | canvases, long sitting | canvases, alone | decoded sound, long | sound, alone | page (renderer RSS), long | page, alone |
|---|---|---|---|---|---|---|
| 4 | 109 | 50 | 25 | 16 | 1151 | 943 |
| 6 | 120 | 56 | 30 | 12 | 1355 | 952 |
| 8 | 136 | 56 | 36 | 12 | 1501 | 941 |
| 10 | 165 | 56 | 50 | 22 | 1819 | 1037 |

1. PICTURES DROPPED, NOT GIVEN BACK. Over floors 1 to 6, 684 MB of canvases (16,585 of them) were let go by being forgotten and
   left to the collector; 195 MB were given back by hand. The two big ones: `silhouette` (engine/px.ts: a hit's flash, a status
   tint, an afterimage), 364 MB in 11,548 canvases: when its 12 MB budget fills, the whole list is forgotten at once; and the
   big mirror images (`flipSprite`'s `bigFlips`, pushed out of their 20 MB budget), 129 MB. Chromium's collector hides this;
   on WebKit they stand until it runs.
2. LISTS NEVER EMPTIED. Each kind's effects in `render/act1_fx/*.ts` keep their pictures in a list of their own for good (about
   40 MB by floor 6); `render/act1_fx/live.ts` forgot its pictures without giving them back (72 MB over six floors); the pieces
   and gates of floors 1 to 5 that each floor's look is made from (`art/floor1.ts` to `floor5.ts` `made`, `gates`; `art/lair.ts`)
   were kept for good though the looks themselves have been let go since 25.0.5 (about 20 MB).
3. SOUNDS NEVER LET GO. `engine/audio.ts` `recorded` keeps every decoded sound while the game is open: 7 MB in town, 50 MB by
   floor 10. (All 573 decoded would be about 117 MB, the title theme 60 MB more while it is held.)
4. NOT FOUND: nothing in the game's own lists grows (monsters, perils, effects), nor timers, listeners or sound nodes; and a
   frame at rest costs the same on a floor come to after a long sitting as on that floor alone (p50, thousandths of a second:
   floor 4, 3.5 against 2.9; floor 6, 1.8 against 1.6; floor 8, 1.5 against 1.4; floor 10, 2.0 against 2.1). So what he feels
   is the phone short of room, not the game doing more each frame.

## What this branch does

- `engine/px.ts`: `retireSprite` and `reapRetired` (RETIRE_MS, 3 s): a silhouette forgotten with its list, and a big mirror
  image pushed out of its budget, are given back by hand three seconds on (by then an afterimage or a picture drawn that
  frame has done with it), `reapRetired` called each frame the world is drawn (render.ts `draw`). A mirror image is given back
  only where nobody who may keep it has had it: `flipSprite(s, passing)`, `passing` true at the world's own figures (render.ts
  actorSprite, monsterSprite, fallenSprite), which ask anew each frame; every other caller as before. `releaseSprite` now
  takes a picture that is itself a mirror image out of the lists that hold it (it left a picture of nothing in them).
- `render/act1_fx/kept.ts` (new): `keptPictures()` in place of `new Map()` for 35 lists in 31 of the kinds' files, and
  `forgetUnusedPictures()` as a new place is come into (main.ts placeFrame): a list the place just left did not touch is
  emptied, so a kind met on two floors running keeps its pictures. 20 lists whose pictures are all their own (`toSprite`, or
  the mirror image of one of theirs) are marked `owned` and given back; the other 15 are only forgotten, as their pictures may
  be another list's too. `live.ts`: its pictures given back when pushed out, replaced or done, and all of them as a new place
  is come into.
- `art/floor1.ts` to `floor5.ts`, `art/lair.ts`: `forgetMade()`, called from render.ts `forgetLooks` with each floor's look.
- `engine/audio.ts` `warmNamed`: the sounds fetched for places further back than the one just left are let go, unless this
  place has them too. Only what `warmNamed` fetched (a floor's kinds' sounds: main.ts, `soundsOf`), so one let go is fetched
  again as its floor is come into again, before it is wanted; the game's own sounds, the hero's voice, the steps, the loops and
  the world's sounds are never let go. `soundsForgotten()` counts them.

## What it comes to (same run, before and after, by the floor really played)

| floor come into | canvases held, before | after | alone | decoded sound, before | after | page (RSS), before | after |
|---|---|---|---|---|---|---|---|
| 4 | 109 | 83 | 50 | 25 | 27 | 1151 | 1003 |
| 6 | 120 | 77 | 56 | 30 | 28 | 1355 | 1160 |
| 7 | 142 | 79 | | 34 | 26 | 1699 | 1491 |
| 8 | 136 | 75 | 56 | 36 | 27 | 1501 | 1314 |
| 9 | 166 | 102 | | 39 | 29 | 1684 | 1490 |
| 10 | 165 | 106 | 56 | 50 | 39 | 1819 | 1661 |
| 11 | 164 | 95 | | 56 | 41 | 1678 | 1482 |

Canvases over the whole sitting (floors 1 to 11): 1,574 MB given back by hand, 201 MB left to the collector (before, over
floors 1 to 6 alone: 195 MB by hand, 684 MB left). Frames: no slower (at rest and in play, each floor, within the noise of two
runs); no errors; no sound failed to load (191 held at the end, where 285 were).

What is still held over a floor alone is mostly meant: the mirror images of the kinds on both floors, and the effects of the
kinds met on the floor just left (kept one floor).

## Checks

- `tsc --noEmit`: clean but for `tests/relief.test.ts(378)`, which fails the same on `main` with this machine's tsc (7.0.2).
- `tests/memory_floors.test.ts` (new, 4): silhouettes and mirror images given back a moment after they are let go; a mirror
  image given back by itself made again when asked for; a kind's list kept one floor past its last use, its own given back.
- The unit run of what the change is about (28 files, 28 passed): the foot of this note.
- The two long sittings above; and a count of pictures of nothing drawn (a sprite given back while still shown): see the foot.
- NOT DONE HERE, THE MAIN CHAT'S: the wide `--changed` run (engine/px.ts is under nearly every test), the playtests of the
  release page, and a look on his phone.

## Left, for the main chat (not done here)

1. THE LOOKS' OWN `forget` STILL ONLY FORGETS (art/tomb.ts, grounds.ts, prison.ts, chapel.ts, lair_temple.ts, yard.ts,
   castle_hall.ts and their gates; render/*.ts views): tens of MB dropped at every change of floor (the castle hall's alone 12 MB).
   Giving them back needs care: a look's art shares pictures with the vault's (`{ ...G, … }`), and a shared one given back
   shows nothing. `retireSprite` is there for it once each list's own are told from the shared.
2. THE SIDE PAINTER'S FRAMES HAVE NO BUDGET: the monsters' frames handed over as bitmaps came to 333 MB on floor 7 and 227 to
   254 MB on floor 10 in 40 s of the bot's play (given back when the floor is left). With the canvases, these two floors are
   where a phone would run out first.
3. SOME KINDS' EFFECTS STILL MAKE PICTURES AND FORGET THEM (per peril, not in a kept list): 49 MB in 573 canvases from a
   `ground` reached through another's (`X.ground!(c, m, p)`), 27 MB of it on floor 6 (the Quarry Golem's, render/act1_fx/
   qgolem.ts, most likely) and 21 MB on floor 9 (the stag's or the deer's); 16 MB in 1,120 from an `air`, on floors 9 and 10.
   All left to the collector. Which lines, not traced here.
4. FLOOR 6'S BOSS (The Unfinished Cut) had his frames painted where the game is played in three of five sittings here (611
   frames, about 83 MB; each frame of the fight 36 to 42 thousandths of a second at rest until every frame had been shown). This
   machine has two cores and so one painter; a phone with more may not show it. Worth a look with `--many`.
5. THE ACT 1 PIECES AND THE WAYS (`art/crypt.ts` WAYS, GROUNDS, PROPS keep the last crypt floor's on floors 6 and on: about 5 MB).

## Foot: the last checks

- THE UNIT RUN, 11 Nov 2026, 08:42 (Eastern), on the commit `fc2aa966c2`: `node tools/unit.mjs --only
  memory_floors,monsters,recorded_sounds,sounds2,colossus_sounds` (the five the change is about, and the core 23). Its last
  line: `UNIT DONE fc2aa966c2: 28 files, 28 passed, 0 failed (0 passed alone)` (310 tests; the other 385 files not run).
- PICTURES OF NOTHING DRAWN (a sprite given back while something still drew it would show as the 1 by 1 picture of nothing):
  floors 1 to 4 in one sitting, 40 s of the bot's play each, every `drawImage` counted. This branch: 0 of 8,583,973. `main`: 0
  of 9,069,413. No errors on either.
- SOUNDS in that same sitting. This branch: 128 loaded, none failed, 2,211 takes played. `main`: 126 loaded, none failed, 2,130.
