# What three unique items show in play: brought in on a branch, for the main chat

Branch `bring-in/uniques-play`: `bring-in/uniques-art` 1fe078b (main 9f3cf44, 25.3.7, with the 62 bag pictures, `art/uniques`
3081f14) with `art/uniques` abdaaa1 merged in (its three commits on from 3081f14: 0937ccb, the work; c13d2af and abdaaa1, its
note). Queue item `bring-in-unique-play-pictures`. The art itself, and his yes to all three: README.md beside this note (the
Uniques in-play chat's).

**His words to this chat, 11 Nov 2026, 22:11:** “Work on this task from the Wordsmith Queue: “Bring in what three unique items
show in play (branch art/uniques), dark, with the unique items” (queue item bring-in-unique-play-pictures).”

The item is the main chat's by its own note and he did not name this chat main, so it worked on a branch, as the unique
pictures', the eight sides' and the townsfolk's chats did. **Nothing is published; main is untouched.**

## What is on the branch

- Everything of `bring-in/uniques-art` (the 62 bag pictures brought in: BRING_IN.md in docs/mockups/uniques_art), and on it
  the three in-play pictures: `src/render/unique_play.ts` (the switches), `src/art/unique_play_art.ts` (the painters),
  `src/render/unique_fx.ts` (laid in the game), a few lines each in `src/render/fx.ts`, `src/render/render.ts`,
  `src/render/veteran_fx.ts`, `src/dev/veteran_globes.ts`, `src/main.ts` (`__dbg.uniquePlay`); `tests/unique_play.test.ts`
  (6); its tools and his four pictures. Nothing of `src/game` is changed.
- **Every switch off**: `UNIQUE_PLAY` tome, risen and fourth false; `UNIQUE_ART.on` false; `UNIQUES.on` false (main's). With
  them off the game is as main has it.
- **No conflicts.** main had moved two versions (25.3.6, 25.3.7) since the art was cut; git joined `src/main.ts`,
  `src/render/render.ts` and `src/render/veteran_fx.ts` by itself.
- **One mend, this chat's (7f7366b): the heroes' bake keeps main's mark.** As it came, the branch asked for a new bake of the
  heroes with not one picture changed: the art wrote the globes' width of three as `globesW(3)`, that line of
  `src/dev/veteran_globes.ts` is bundled into the heroes' bake page, and the bake's mark is taken from that page's code
  (tools/bake_heroes.mjs). The mark came out 6d65c86644c8 where main's is 0ed837378e63. The line is written out again as
  main has it (`globesW` stays beside it for the row of four; tests/unique_play.test.ts holds the two equal): the bake
  page's code is byte for byte the bag pictures' branch's again, and the mark is main's.

## Checked

- **The bakes' marks are main's**, worked out without baking, each tree from its own folder: main 9f3cf44, the heroes'
  0ed837378e63 and the townsfolk's d4c898fe370d; this branch at 7f7366b, the same two. The Colossus's is 7cf0996e564d as the
  build names it. No sound file is touched. So no bake, and nothing new beside the page.
- `tsc --noEmit` with the project's TypeScript (6.0.3): clean, on 8f6fe5e (the merge) and on 7f7366b (the mend). With this
  machine's own tsc (7.0.2): only tests/relief.test.ts 378, which main 9f3cf44 gives too.
- `node tools/unit.mjs --only unique_play,veteran,veteran_art,items_unique,uniques_game,sides_more` (the six and the core
  23): on 8f6fe5ee12, 29 files, 424 tests, all passed; on 7f7366b8af, 29 files, 424 tests, all passed (18 carried over, 11
  run again). sides_more is there because main's eight sides touch the Brawler since the art was cut.
- A page built from the branch (`node tools/build_to.mjs dist/uniques_play_in.html`, opened as a file), on a phone's screen
  (852 by 393, three dots to a point, touch):
  - **every in-play switch off** (on 7f7366b's page, and on 8f6fe5e's before it): the three looks with `PLAY=off` (the
    Tome, the risen elite, the globes: the build's stand-ins, as before) and tools/scenarios/uniques_look.mjs: finished
    clean; and the regression's veteran_play (the Brawler's three globes), as tools/preflight.sh runs it: finished clean.
    On 8f6fe5e's page also save, touch_wide, look2_phone and guide_phone_warrior: finished clean (5 of 5 with veteran_play);
  - **the three switches on**: the three looks (`LOOK=tome`, `risen`, `globe`): finished clean on both pages; and on
    8f6fe5e's every one of the 79 kinds of monster risen in turn (`LOOK=kinds`): 158 pictures, no error on the page.
  - Pictures looked at: four globes over the Brawler's head and the bar joining all four when locked; three with the Fourth
    Globe worn and its switch off; the Tome in flight with its tail of fire; the risen elite, grey and cyan, its brand
    under it.
- **It meets `bring-in/eight-sides` (dee43f3) clean**: tried, not kept; no file is touched by both.

## Not checked

- A phone.
- The release build and the published page's own playtests (the page here was built with build_to and opened as a file).
- The whole suite; the regression.
- A floor other than the practice room.
- The four globes with the Brawler's eight sides on (`EIGHT_MORE.brawler`, off in main).

## What is left, main chat

1. Merge the branch into main: a fast-forward while main is at 9f3cf44. **It carries `bring-in/uniques-art` whole**, so it
   settles the queue's bring-in-unique-item-pictures too: one merge for both, or that one first and then this.
2. Nothing to publish for it alone: every switch off, the marks unchanged. It rides the next version.
3. When `UNIQUES` goes on, on his yes to the numbers: `UNIQUE_PLAY` tome, risen and fourth true and `UNIQUE_ART.on` true
   with it (test 1 of tests/unique_play.test.ts and test 1 of tests/items_unique.test.ts assert them off: change them
   then); the build's two stand-ins (game.ts stepTome's spark, raise's ten sparks) can go then.
4. His test build for tuning the numbers (the queue's build-unique-items, step 2): all of them on in it
   (`__dbg.uniques.on = true`, `__dbg.uniqueArt.on = true`, `__dbg.uniquePlay.tome = true`, `.risen`, `.fourth`, or the
   lines).

## To know

- **The marks are to be worked out from the tree's own folder.** Worked out from another folder (a second copy asked from
  the first), the same code gives another mark: the bundle carries each file's path as seen from where it is run.
- `LOOK=kinds` wants its list: `KINDS=skeleton,archer,…` (the 79 of game/types.ts `MonsterKind`). Without it the look ends
  clean having risen none.
- With the Fourth Globe worn and its switch off, three globes are painted and his combos hold four: the build's own
  stand-in, as the art's note says.
- What the rest of the uniques show in play is still to draw (the queue's draw-unique-items). The names are still his
  placeholders.
