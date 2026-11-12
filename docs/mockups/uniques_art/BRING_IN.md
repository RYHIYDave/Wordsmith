# The unique items' own bag pictures: brought in on a branch, for the main chat

Branch `bring-in/uniques-art`: main at 9f3cf44 (25.3.7) with `art/uniques` 3081f14 merged in. Queue item
`bring-in-unique-item-pictures`. The art itself, and his yes to all 62: README.md beside this note (the Uniques art chat's).

**His words to this chat, 11 Nov 2026, 20:36:** “Work on this task from the Wordsmith Queue: “Bring in the unique items' own
bag pictures (branch art/uniques), dark, with the unique items” (queue item bring-in-unique-item-pictures).”

The item is the main chat's by its own note and he did not name this chat main, so it worked on a branch, as the townsfolk's,
the Endless town's and the eight sides' chats did. **Nothing is published; main is untouched.**

## What is on the branch

- Everything of `art/uniques`: `src/art/items_unique.ts` (the 62 painters, behind `UNIQUE_ART`), the kit shared from
  `src/art/items_a.ts`, `itemPic`'s fourth argument in `src/art/icons.ts`, the five calls that pass a piece's `unique`
  (`src/ui/inventory.ts` two, `src/ui/town.ts` two, `src/render/render.ts` one), `__dbg.uniqueArt` in `src/main.ts`, its
  tests and tools, his four sheets.
- **Both switches off**: `UNIQUE_ART.on` false (this branch), `UNIQUES.on` false (main's, since 25.3.6). With them off
  the game is as main has it.
- **One conflict, mended:** the foot of `src/art/items_a.ts`. 25.3.6 added the Warrior's weapons' exports there
  (`paintItemParts` and its pieces) and `art/uniques` added `ITEM_A_KIT`: both kept, main's first.
- **New, this chat's:** `tools/scenarios/uniques_floor_look.mjs`: a unique lying on the floor as loot, which the art chat's
  note left as not looked at. Ten uniques laid round the practice room's Warrior among three of the game's own pieces: a
  picture with `UNIQUE_ART` on, the same floor with it off, then he steps onto one and it is taken.
- What it adds to main in `src`: seven files (icons.ts, items_a.ts, items_unique.ts, main.ts, render.ts, ui/inventory.ts,
  ui/town.ts); in `tests`: items_unique.test.ts (new), items_a.test.ts and items_a_game.test.ts (brought along).

## How it came here

1. At 21:20, this chat's copy of main was at 95eefb7 (25.3.5) and did not have the uniques' build: `art/uniques` (which carries `uniques`
   db0622f) merged onto it clean. Unit `--only` the uniques' five, items_unique, items_a, items_a_game, inventory, words,
   item_words, runes_on_gear, binding, trades, flat_damage, colossus_sounds, scene_sounds, companions, veteran_rules and the
   core, on bc6716c5aa: 42 files, 484 tests, all passed. That commit is not kept: main moved.
2. Main had moved to a8d9111 (25.3.6, with `uniques` in it, dark): the merge made again on it (842e0656, 21:43, the one
   conflict above).
3. Main had moved to 9f3cf44 (25.3.7): main merged in (42cee854, 21:59), no conflicts.

## Checked, on 42cee854 (main 9f3cf44 and the pictures)

- `tsc --noEmit`: only the error main already has (tests/relief.test.ts 378).
- `node tools/unit.mjs --only items_unique,items_a,items_a_game,inventory,uniques_drops,warrior_weapons` (the six and the
  core 23) on 42cee85418: 29 files, 341 tests, all passed. (warrior_weapons is there because the conflict was in the kit it
  paints with.) The same 29 on 842e0656e0 before it: all passed.
- **The bakes' marks are unchanged**, worked out on main 9f3cf44 and on the branch without baking: the heroes'
  0ed837378e63, the townsfolk's d4c898fe370d. No file of assets/sound is touched. So no bake, and nothing new beside the page.
- A page built from the branch (`node tools/build_to.mjs dist/uniques_in.html`, opened as a file), **both switches on**:
  - the bag with all 62 in it, in four goes, on a phone's screen (852 by 393, three dots to a point;
    `tools/scenarios/uniques_art_look.mjs`): finished clean each time, 62 given; pictures looked at;
  - a fight with several at work (`tools/scenarios/uniques_look.mjs`), at 960 by 540 and on a phone's screen: finished clean;
  - **the floor** (`tools/scenarios/uniques_floor_look.mjs`), on a phone's screen and at 960 by 540: finished clean. Each
    unique lying as loot shows its own picture, at the size of the game's own pieces beside it; with `UNIQUE_ART` off each
    shows its base's orange look, as the build has it; stepped onto, The Clockwork Songbird left the floor and was in his
    bag as itself. Pictures looked at.
- The same page, **both switches off** (`tools/preflight.sh`, as the regression runs them): save, touch_wide, look2_phone,
  guide_phone_warrior finished clean; towntap_phone was flagged once, run beside another playtest (its line: “touching the
  mystic did not open its panel”), and finished clean alone, twice.

## Not checked

- A phone.
- The release build and the published page's own playtests (the page here was built with build_to and opened as a file:
  no townsfolk baked, the heroes painted as they are played).
- The whole suite; the regression.
- A unique in the stash, on a keeper's shelf, or carried by a finger: not looked at in a picture. They are the same call,
  and tests/items_a_game.test.ts holds all five calls to their fourth argument.

## What is left, main chat

1. Merge the branch into main (a fast-forward while main is at 9f3cf44).
2. Nothing to publish for it alone: both switches off, the marks unchanged. It rides the next version.
3. When `UNIQUES` goes on, on his yes to the numbers: `UNIQUE_ART.on` true with it; test 1 of
   tests/items_unique.test.ts asserts it off: change it then.
4. His test build for tuning the numbers (the queue's build-unique-items, step 2): both switches on in it, so he can tell
   the pieces apart in his bag (`__dbg.uniques.on = true`, `__dbg.uniqueArt.on = true`, or the two lines).

## To know

- On the floor a unique's label reads its kind (“HELMET”, “BOOTS”) in orange, as every piece's label reads its kind in
  its rarity's colour. The picture is its own.
- What the uniques show in play is still to draw (the queue's draw-unique-items, held by the Uniques in-play chat). The
  card's look still waits for his yes. The names are still his placeholders.
