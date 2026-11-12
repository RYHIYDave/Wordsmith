# The unique items' test page

For him to try the unique items' numbers in play before anything goes live. Queue item `build-unique-items`, step 2.
Branch `try/uniques` (cut from `bring-in/uniques-art` 1fe078b: main 9f3cf44, 25.3.7, with the uniques' own bag pictures).
Made by the Unique pictures bring-in chat, 11 Nov 2026, a new chat of his that is not the main chat. **Nothing is live: the
game's own page and his save are untouched.**

## His words

- On the numbers, 11 Nov 2026, by pop-up, to the Uniques build chat: “Start with these, tune in play (Recommended)”.
- To this chat, 11 Nov 2026, by 22:24, asked whether to make his test page now, with the items switched on and each showing
  its own picture: “Yes, make my test page (Recommended)”.
- To the Uniques bring-in chat, 12 Nov 2026, by 05:44, asked whether to put the three pictures he approved (the Tome, the
  risen elite, the fourth globe) onto this test page: “Yes, put them on (Recommended)”.

## The page

**https://claude.ai/artifact/TDTUvbr5FhjV56vrCu3Tbs** (“Wordsmith test page: unique items”, version `1794455239-92b4`;
his alone; a page of its own, NOT the game's page, and it keeps a save of its own). 202 files, 179.9 MB, sent in five
publishes: `index.html` (sha256 begins f8b311f388f41938, 7,636,045 bytes; the stamp TEST UNIQUES 2026-11-11 in the corner
of the starting screen) and beside it `heroes/0ed837378e63/` (36 files), `townsfolk/d4c898fe370d/` (3),
`sounds/3c87436f2f66/` (49) and `colossus/7cf0996e564d/` (113). The four folders are the live site's own files, byte for
byte (the first three taken from the branch `gh-pages` at f30b040, 25.3.7; the Colossus's from the repository, all 113
compared the same as the site's): nothing was baked again.

**Since 12 Nov 2026, 06:02 (the Uniques bring-in chat, at his word above): version `1794481326-9db9`.** `index.html`
alone was published again (sha256 begins e2c9d567b1aeb292, 7,652,894 bytes; the stamp TEST UNIQUES 2026-11-12), with what
three unique items show in play switched on (below). The four folders are as they were: the marks are unchanged.

## What it is

The game as it is on this branch, built as the release is, but begun as `try=uniques` (src/main.ts). For this page only:

- `UNIQUES` on: they drop at the odds as built (docs/uniques/NUMBERS.md), the stranger may sell one, each does what it does.
- `UNIQUE_ART` on: each of the 62 shows its own bag picture.
- `UNIQUE_PLAY` tome, risen and fourth on (since 12 Nov; src/render/unique_play.ts): The Restless Tome's book flies round
  the Warlock with its fire, The Fleshmancer's Brand's elite rises grey and cyan with the brand under it, and four globes
  are over the Brawler's head with The Fourth Globe worn. Each has his yes to its picture (docs/mockups/uniques_play). The
  branch carries `bring-in/uniques-play` e58fde6 for them (its note: docs/mockups/uniques_play/BRING_IN.md).
- **A test hero of the level select** (the starting screen's Options, Level select, a floor, a hero) **is handed every unique
  he could find** (`Game.giftUniques`, src/game/game.ts): the pool's fifteen for his hero (the ten for everyone, his weapon's
  three, his own two) in his bag; the twenty bosses' own and the final boss's two in his stash in town. Made for the floor he
  stands on and no higher than his level, as the level select's gear is, so he can wear all of them. Rolled by dice of their
  own: the floor is laid as it would be without them. The game says so as he arrives: “Test page. Your unique items are in
  your bag; the bosses' own are in the stash in town.”
- **The practice room's hero** is handed his fifteen in his bag (there is no town there).
- A hero begun the ordinary way finds them only as the game gives them.

This is this chat's reading of what a test build for tuning needs, not something he picked: said to him with the page.
One line each to change (`giftUniques`, and the two calls in main.ts).

## How it is made again

`node tools/uniques_try_page.mjs` writes `dist/try_uniques/`. It takes each folder of the mark this tree's build gives: a
release build's own where one was made here, else the live site's files of that very mark (`SITE=origin/gh-pages`; fetch
that branch first). If the heroes' or the townsfolk's art has changed since the site's bake it says so and stops: bake
first (`node tools/build.mjs`). Publish `dist/try_uniques/` to the page's own link, never a new page: his test save lives
there. The files' batches for publishing (each under 64 MiB): the page with the heroes and the townsfolk; the sounds; the
Colossus's in three parts.

## Checked

- `tsc --noEmit`: only the error main already has (tests/relief.test.ts 378).
- `node tools/unit.mjs --only uniques_try,uniques_drops,uniques_game` (the three and the core 23) on d4bf9d74c8: 26 files,
  313 tests, all passed. tests/uniques_try.test.ts is new (3): off, nothing handed and nothing said; on, every hero's
  fifteen in his bag and the twenty-two in his stash, each once, each one he can wear; the floor laid the same with and
  without them; floor 1 and the practice room handed theirs.
- **Played as it is published**, served from its folder with the four folders beside it, a finger on a phone's screen (852
  by 393, three dots to a point), `tools/scenarios/uniques_try.mjs` (new): the starting screen with its stamp; Options, the
  level select, a floor, a hero; the test hero with 15 uniques in his bag and 22 in his stash, none he cannot wear; the bag
  photographed, one read, his weapon's put on and counted as worn; the waypoint touched, the town, the stash touched and
  photographed with the bosses' own on its shelves. As the Warrior on floor 8, the Brawler on floor 12 and the Mage on floor
  17: finished clean. (Its first runs on floors 12 and 17 were flagged, the playtest's fault: in the High City's town the
  stash is out of view from the waypoint; it now sets him down beside it and says so.)
- On the same served page, the game's main ways with the switches on: guide_phone_warrior (a new player's first dungeon),
  save, touch_wide, towntap_phone: finished clean.
- The published files read back (list_files): 202; index.html, the four indexes and five others compared the same as built,
  by size and sha256.
- **12 Nov, with the three in-play pictures on** (368875b: `try/uniques` 87894d7 with `bring-in/uniques-play` e58fde6
  merged in, no conflicts, and the three switches set where `try=uniques` sets the others):
  - `tsc --noEmit` with the project's TypeScript: clean. The bakes' marks worked out on it: the heroes' 0ed837378e63, the
    townsfolk's d4c898fe370d, as before: nothing baked, the folders the same.
  - `node tools/unit.mjs --only uniques_try,unique_play,uniques_game,uniques_drops,veteran` (the five and the core 23) on
    368875b5e5: 28 files, 415 tests, all passed.
  - Played as it is published, served from its folder, a finger on a phone's screen (852 by 393, three dots to a point):
    `tools/scenarios/uniques_try.mjs` as the Brawler on floor 12 (it now also checks the three are on as the page is
    built); the art's three looks in the practice room (`tools/scenarios/uniques_play_look.mjs`, `LOOK=tome`, `risen`,
    `globe`); and **on floors of the game**, which nobody had looked at (`tools/scenarios/uniques_try_play.mjs`, new: the
    level select with a finger, then the unique put on): the Tome round the Warlock on floor 8 (its fire in the air), an
    elite of the floor's own (a scorpion) risen beside the Warrior on floor 8, four globes over the Brawler on floor 12
    after four blows. All finished clean; pictures looked at.
  - The published files read back (list_files): 202; index.html the same as built, by size and sha256; the other 201 as
    they were.

## Not checked

- His phone. The page as claude.ai serves it in the app (it was played served from its folder here).
- A whole run with uniques dropping; each unique's own rule in the page (their tests are the uniques' five files).
- The whole suite; the regression.

## To know, and told to him

- Three add a word that is not in the game yet (The Headsman's Hood, The Queen's Glass, The Long Echo: Culling, Mirroring,
  Lasting, which wait on put-ten-new-words-live): their cards say so, and they add nothing yet.
- The Fourth Globe works, and since 12 Nov four globes are painted over the Brawler's head (before, three).
- What the other uniques show in play is plain stand-ins: the art is being drawn (draw-unique-items). The Tome, the risen
  elite and the fourth globe show their own pictures since 12 Nov.
- The card's look (orange for what it does, red for its price) has not had his yes; the names are his placeholders.
- Floor 1 has no waypoint beside where he comes in: for the stash, a floor from 2 on.

## What is left

His word from the phone on the numbers, in this chat: each change is one line in `UNIQUE_TUNE`, `UNIQUE_DROPS`,
`UNIQUE_RULES` or a unique's `stats` (src/game/uniques.ts), the test page made and published again to the same link.
Nothing goes live with the switch on before his yes. For the main chat: `try/uniques` adds to `bring-in/uniques-art` only
the hook (off in the game), its test, its tool and its playtest; merge it or leave it, as you see fit.

# 12 Nov 2026, evening: the page brought up to today's game

The Uniques tuning chat (a chat of his working the queue item `build-unique-items`, not the main chat). **Nothing is live:
main is untouched; only his test page changed.**

## Why

The page was made from main 9f3cf44 (25.3.7). Since then main has had, behind the uniques' switch: THE DROWNED ARM EVERY 3
SECONDS, STUNNING WHAT IT SLAMS 0.6 s (his pick to the Queue chat, 12 Nov: “Every 3s, and it stuns (Recommended)”, after “It
doesn’t seem very good if that’s all it does every 5 seconds”), its slam and the Queen's Talons' bird as ally damage, and the
pictures of the Drowned Arm, the Queen's Talons and the Sticky Wrench in play (25.3.13). The last pictures (the Windcutter's
blade, the Moth's Wing's grey word, the Crier's Hush, a beam on every unique dropped) and the Tow Line's ride with the Golem's
slimmer body are on the ship list (`art/uniques-play3` d2153de). On the old page he would have tried the arm at 5 seconds.

## What changed

- Branch **`try/uniques2`**: main d39dcde (25.3.13) with `art/uniques-play3` d2153de merged in (no conflicts), then
  `try=uniques` sets EVERY switch of `UNIQUE_PLAY` (src/main.ts; ten, each with his yes to its picture), as the three were set
  at his word of 12 Nov, 05:44. Off in the game. Its playtests check all ten are on, and wait out the loading screen between
  floors (they were older than it).
- **The same link, https://claude.ai/artifact/TDTUvbr5FhjV56vrCu3Tbs, version `1794520229-440d`**: 228 files, 198.8 MB, in
  five publishes (the first replacing the page's own files: the old folders of 25.3.7 taken off). `index.html` (sha256 begins
  143932d505dfd67a, 7,929,591 bytes; the stamp TEST UNIQUES 2026-11-12) and beside it the live site's own folders of the same
  marks as 25.3.13: `heroes/433864008c88/` (49), `townsfolk/d4c898fe370d/` (3), `sounds/b151ec214bc7/` (53),
  `colossus/f133999cbf23/` (122). Nothing baked. No monsters' folder (as on the game's claude.ai page: the floors' monsters
  are painted in play there). His test save is the page's own and stays.

## Checked

- `tsc --noEmit`: only the error main already has (tests/relief.test.ts 378).
- `node tools/unit.mjs --only uniques_try,unique_play,unique_play2,unique_play2_talons,unique_play2_wrench,unique_play3_wind,
  unique_play3_moth,unique_play3_hush,unique_play3_drop,uniques_heroes,uniques_game,golem_rocket,tinkerer` and the core on
  c4a27de263: 36 files, 375 tests, all passed.
- Played as published, served from its folder, a finger on a phone's screen (852 by 393, three dots to a point):
  `uniques_try.mjs` as the Brawler on floor 12 and the Tinkerer on floor 8 (all ten in-play switches on; 15 in the bag, 22 in
  the stash, none he cannot wear; one put on; the town and the stash); `uniques_try_play.mjs` LOOK=tome on floor 8 (the book's
  fire in the air). All finished clean; pictures looked at.
- The published files read back: 228; index.html and five others the same as built, by size and sha256.

## Not checked

His phone; the page as the app serves it; a whole run with uniques dropping.
