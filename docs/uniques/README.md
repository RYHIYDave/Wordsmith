# Unique items: the build, for the main chat

Branch `uniques`, cut from main at 9d3501b (11 Nov). Queue item `build-unique-items`. Nothing here is live: it is all behind
`UNIQUES` (game/uniques.ts), which is **off**. With it off no unique drops, none can be gambled for, and one in a save does
nothing but carry its ordinary stats.

His doc is “Wordsmith: Unique Items” (https://claude.ai/artifact/TLDCXZF1LNUS7VJHzATsAB). The 62 are built as it has them.
Every number is a proposal for his yes: docs/uniques/NUMBERS.md (made by `tsx tools/unique_numbers.ts`), and the same as a doc
of his own to read on his phone, “Wordsmith: Unique Items, the Numbers”.

## What is where

- **src/game/uniques.ts** (new): the switch `UNIQUES`; every special number in `UNIQUE_TUNE`; the drop odds `UNIQUE_DROPS`;
  the two rules still his to say in `UNIQUE_RULES`; the 62 in `UNIQUE_DEFS`; `bendWords()`, which works out what a hero's
  words are once the word-bending uniques have had their say.
- **src/game/items.ts**: `makeUniqueItem()`; a unique has no room for crafting and takes no word.
- **src/game/words.ts**: `resolveSkill(…, bent?)` takes a strength for the words (“half as strong again”). With nothing passed
  the answer is the same to the bit (tests/words.test.ts, 29 pass).
- **src/game/game.ts**: a section “UNIQUE ITEMS” before `has()`, and a line or two at each place a unique reaches into
  (each marked with the unique's name). `Game.wears(id)` is the one question asked everywhere; it is false with the switch off.
- **src/game/state.ts, types.ts**: `Item.unique`, and the few fields the above need.
- **src/ui/panels.ts, inventory.ts, hud.ts**: the card (what it does in orange, its price in red), four orange pips, a third
  front slot on the attacks page, attack names read from the bent words.
- **src/main.ts**: `dbg.uniques` (the switch, for a look in the page).
- **tests/**: uniques.test.ts (the list), uniques_words (the word-bending ones), uniques_game (any hero's), uniques_heroes
  (each hero's own), uniques_drops (where they drop, the stranger, a save, the card), uniques_helpers.ts. 67 tests.
- **tools/**: unique_odds.ts (counts real floors), unique_numbers.ts (writes NUMBERS.md), scenarios/uniques_look.mjs (a look).

## Checked

- The five test files: 67 pass.
- `node tools/unit.mjs --only` the five, their neighbours and the core set, on commit d5a96cd: 46 files, 650 tests, 0 failed.
  Again on 8c6b718 (after the ordinary stats, two UI files and one test changed), the five, the inventory and the core set:
  29 files, 363 tests, 0 failed.
- `tsc --noEmit`: only the error main already has (tests/relief.test.ts 378).
- The page builds, and tools/scenarios/uniques_look.mjs runs clean at 960x540 and at phone size.
- The drop odds, counted on the fifteen floors there are: about two pool uniques and one or two bosses' own a run.

## To see one

`node tools/build_to.mjs dist/uniques.html`, then in the page's console: `__dbg.uniques.on = true`, `__dbg.practice('warrior', 7)`,
and `__dbg.game().giveUnique('windcutter', 12)` (any id from UNIQUE_DEFS) puts one in the bag.

## What is not done, and why

1. **His yes on the numbers.** All of them: NUMBERS.md. Nothing goes live before it.
2. **Three wait on the ten new words** (queue item put-ten-new-words-live; branch words10): The Headsman's Hood (Culling),
   The Queen's Glass (Mirroring), The Long Echo (Lasting). They are built and add the word by id ('culling', 'mirroring',
   'lasting'); until those ids are words in the game they add nothing. Check the ids when the two branches meet.
3. **Two wait on the endless final boss**: The Third Word and The Ghostwriter work when worn. `finalUniques()` and
   `UNIQUE_DROPS.final` are there for him and wired to nothing.
4. **Pictures** (the art chat's, queue item draw-unique-items): an icon each; and what is seen in play. The build shows
   plain stand-ins (a burst, a spark) and sends an event `{ t: 'unique', id, what, … }` at each moment a picture would hang
   on. The risen elite of The Fleshmancer's Brand and the book of The Restless Tome have no picture of their own.
5. **The Fourth Globe**: works; the globes over his head (src/dev/veteran_globes.ts) are painted as three, so the fourth is
   not shown.
6. **The Pack Collar**: the second companion is the next in the same list after his pick. It wants a way to pick, in town.
7. **Names** are his placeholders.

## What was taken as read

Listed for him in NUMBERS.md under “What I took as read where you had not said”: each is his to change. The two with a
switch of their own are in `UNIQUE_RULES`: `othersWear` (another hero can wear a hero-only piece; its rule does nothing for
him) and `ownOnly` (the pool gives a hero only the ten for everyone and his own five).

## Bringing it in

It touches game.ts in many small places, so it wants bringing in soon after main moves, not long after. Nothing it adds
runs with the switch off, and the words' sums are unchanged without a unique (tested), so it can sit on main dark, the way
the other switched things do.
