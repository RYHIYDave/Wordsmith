# THE REDRAWN TOWNSFOLK BAKED TO FILES AND SWITCHED ON (FOR THE MAIN CHAT TO BRING IN)

Branch `townsfolk-bake`, cut from `main` at 95eefb7e (25.3.5) with `art/townsfolk` at 225e658 merged in (no conflicts). The
Wordsmith Queue's item `bring-in-townsfolk-30fps`, pulled by the townsfolk bake chat on 11 Nov 2026 at his word: “Work on this
task from the Wordsmith Queue: “Bake the redrawn townsfolk to files (on a branch), then main brings them in””. Nothing is
published and `main` is untouched: the main chat brings the branch in, makes the release, plays the published page, publishes.

## His words

- 8 Nov 2026, 06:25: “And I think the townsfolk need look update and a 30fps makeover”.
- 11 Nov 2026, shown the four in the game's own town (the townsfolk chat; `docs/mockups/townsfolk/README.md` has it all):
  “Yes, hand them to main (Recommended)”. Art he approved there needs no pictures again.
- 11 Nov 2026, 16:56, to the main chat: “The redrawn townfolks should be done”.

## What it is

**The bake.** `node tools/bake_townsfolk.mjs` paints every frame of the sculpted four and of the wordsmith with his ring dark,
once, in a browser, with the game's own code (`src/dev/bake_townsfolk_page.ts`), lays them on sheets of 2048, writes each sheet
as a PNG, reads it back as the game reads it and checks every frame on it against the frame as painted, pixel by pixel (none
may differ). In the manner of the heroes' bake; the heroes' bake page is not touched.

- 2,584 places in 23 lists (`art/townsfolk3.ts` folkLists); 2,481 frames once the same picture is kept once.
- 2 sheets (2048 x 2018 and 2046 x 1860), 303,742 bytes of PNG, and `townsfolk.json`, 462,384 bytes: 3 files, 0.77 MB.
- Painted in 115 s here (a two-core cloud machine); the whole bake is under two minutes.
- Its mark is `d4c898fe370d` (the first 12 of the sha256 of the bake page's bundle, as the heroes'); kept in
  `.bake/townsfolk/<mark>/` and not made again until their art changes.
- THE HEROES' MARK IS UNCHANGED, `7883bd8a52c6`; the sounds' `3c87436f2f66` and the Colossus's `7cf0996e564d` likewise.

**Carried beside the page** as `townsfolk/<mark>/`:

- `tools/build.mjs` bakes them if they are not baked (`--no-bake` or `--no-townsfolk`: none), copies them to
  `dist/townsfolk/<mark>/` and builds the game knowing the mark (`__TOWNSFOLK_BAKE__`).
- `tools/build_to.mjs` carries a bake that is already kept; `--townsfolk` bakes it now if it is not. (It never bakes unasked: a
  page to look at stays quick to make.) The page shows them only when it is served (`tools/playtest.mjs --serve`).
- `tools/make_site.mjs` takes a sixth folder, `dist/townsfolk`, and the phone's offline copy keeps `townsfolk/<mark>/` as it
  keeps the heroes'.

**In the game** (`src/render/townsfolk_baked.ts`, `main.ts`):

- As a place with the town's people in it is come into (the town, the castle's hall; not the camp, which has its own people),
  their pictures are fetched and given into their lists, wherever a place is still unpainted, as the baked heroes' are.
- THE LOADING SCREEN WAITS FOR THE FIRST OF THEM ONLY: the 605 frames of the loops the town shows at once (the four at their
  work, and the wordsmith with his ring dark). The rest, the acts and the loops turned to whoever comes up, come a moment
  after, as the town is played; until one has come, the loop at their work stands in for it (`art/kit.ts` lazyFrames `stand`).
- NOTHING OF THEIRS IS PAINTED WHERE THE GAME IS PLAYED.
- THEY ARE LET GO OF AS THE TOWN IS LEFT, and come again, under the loading screen, as he comes back. In hand they are 30.0 MB
  of pictures; it was memory that froze his phone (11 Nov). The switch is `TOWNSFOLK_BAKED.letGo` (`__dbg.townsfolkBaked`).
- WHERE THE FILES ARE NOT TO BE HAD (a page opened from a file, a page built without them, the unit tests, a sheet that will
  not load, lists that are not as they were baked) THE TOWN'S PEOPLE ARE AS THEY WERE, the old four of `art/townsfolk.ts`,
  moving as before. `art/townsfolk3.ts` townsfolk3Shown() says which. So a page opened as a file, and every playtest that
  opens one, plays exactly as it did; and the tests of the old townsfolk (`townart`, `smith3`, `quest3`) pass untouched: no
  helper file was needed.
- `TOWNSFOLK3.on` is true. Test 1 of `tests/townsfolk3.test.ts` says so.
- `__dbg.bakedFolk()` says what came and what failed; `__dbg.townsfolk3(on, heavy)` still makes the pictures and films
  (`heavy` off: every frame painted as it is asked for, on any page).

**Their sounds at their moments** (`render/render.ts` folkSound, `Townsman.soundAt`). The sound files each begin at once (a
blow, a flare, a ring: measured), and were played as an act began. Now:

| who | sound | heard |
| --- | --- | --- |
| armourer | `anvil` | as the hammer lands, 0.87 s into his act (frame 26) |
| mystic | `crystal` | as the crystal blazes, 1.13 s in (frame 34) |
| stranger | `coin` | as he flicks it, 0.53 s in (frame 16); the catch at 1.53 s has no sound of its own |
| wordsmith | `rune_write`, `rune_drive` | as they were: as he begins, and half way through |

The old townsfolk's, where they are shown, are as they were.

## What was checked

- `tsc --noEmit`: clean.
- `node tools/unit.mjs --only townsfolk_baked,townsfolk3,townart,smith3,quest3,castle_hall,scene_sounds,town_look,still_pictures,speak_new`
  on 97bf97ad0f: 33 files (those ten and the core), 373 tests, all passed.
  `tests/townsfolk_baked.test.ts` is new (8): the lists, where the sculpted four are shown, the sounds' moments, and the
  taking in, the first of them, the letting go, a load let go of while it is coming, and six ways it can fail.
- THE RELEASE BUILD (`node tools/build.mjs`; `Play.html` itself is not committed here: the release is the main chat's), wrapped
  as the site serves it and served with all four folders beside it, `bash tools/wrap_townsfolk.sh`, 10 playtests at his phone's
  shape: townsfolk_baked (new), town_same (41 places: ALL AS THEY SHOULD BE), towntap, quest_town, world_sounds (the anvil's
  two takes come, none failed), baked (the Mage: 4,100 given, none failed, the worker painted none), touch, guide and town_lag
  finished clean; `save` flagged two lines with two playtests running at once (a press made before the menu was up: the
  playtest's race the handoff tells of) and was clean alone, twice. The first time through, on the same code but for the
  loading screen's shorter wait, all 10 finished clean.
- `tools/scenarios/townsfolk_baked.mjs` on that page: the three files fetched once; 2,481 pictures given, none unwanted, none
  failed; every one of the four's 2,152 places from the files and none painted there; the three sounds heard at their moments;
  on floor 1 nothing in hand and every place unpainted again; back in town all of them come again. And the same page opened as
  a file (`FILE=1`): nothing fetched, the town's people as they were.
- THE TOWN'S LOADING SCREEN, coming back to town from floor 1 four times on the release page: up for 1.72, 1.58, 1.43 and
  1.25 s with the townsfolk's files; 1.42, 1.36, 1.24 and 1.44 s on the same page with the files taken away. A new game came to
  its town in 14.3 s against 14.1 s (his entrance on the card included).
- THE TOWN'S COST (`town_lag.mjs`, the test browser slowed six times, 30 s): 510 to 601 frames in five sittings with the
  townsfolk baked, 550 and 580 in two with the town's people as they were; two to seven frames over 100 ms against three and
  four. One frame of about a second in most sittings of either kind is the playtest's own profiler: with no profiler, two
  sittings, the longest frame was 117 and 133 ms.
- The pictures looked at: each of the four at his work and turned to the hero, in the town of the release page.

NOT CHECKED: a phone; how the three sounds sit on their moments to an ear (nobody has listened); a full regression (his rule:
only what the change is about).

## For the main chat

1. Bring in `townsfolk-bake`. It touches `src/main.ts` (58 lines, most of them new), `src/render/render.ts` (folkSound),
   `src/art/townsfolk.ts`, `townscene.ts`, `townsfolk3.ts`, the three build tools, and adds `src/render/townsfolk_baked.ts`,
   `src/dev/bake_townsfolk_page.ts`, `tools/bake_townsfolk.mjs`, `tools/scenarios/townsfolk_baked.mjs`,
   `tools/wrap_townsfolk.sh` and `tests/townsfolk_baked.test.ts`.
2. `node tools/build.mjs` bakes the townsfolk the first time (under two minutes here) and says
   `the townsfolk: dist/townsfolk/<mark>/ (3 files)`. If main's art has moved, the mark will not be `d4c898fe370d`: any mark is
   right so long as the build made it.
3. PUBLISH `townsfolk/<mark>/` (3 files) BESIDE THE PAGE, as the heroes' folder is: on the game's own web address through
   `tools/make_site.mjs <Play.html> <out> dist/heroes dist/sounds dist/colossus dist/townsfolk`; on the claude.ai page with
   the page's other files. Without the folder the game still plays: the town's people are then as they were.
4. Then the published page's own playtests: `tools/wrap_townsfolk.sh` is the list used here.

## Left open, his or the main chat's to weigh

- THE THREE SOUNDS' MOMENTS are by the pictures' beats, not by ear. To ask him once he has heard the town.
- LETTING THEM GO AS THE TOWN IS LEFT costs a little time each time he comes back (above) and saves 30 MB everywhere else.
  `TOWNSFOLK_BAKED.letGo` off keeps them once they have come.
- Whether the old kit rigs go once these are live is still not settled (the townsfolk chat's README): they are now also what
  is shown wherever the files are not to be had.
- `tools/scenarios/town.mjs` is still out of date (the armourer gives a task at the first E): not touched.
