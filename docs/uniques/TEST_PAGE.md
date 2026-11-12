# The unique items' test page

For him to try the unique items' numbers in play before anything goes live. Queue item `build-unique-items`, step 2.
Branch `try/uniques` (cut from `bring-in/uniques-art` 1fe078b: main 9f3cf44, 25.3.7, with the uniques' own bag pictures).
Made by the Unique pictures bring-in chat, 11 Nov 2026, a new chat of his that is not the main chat. **Nothing is live: the
game's own page and his save are untouched.**

## His words

- On the numbers, 11 Nov 2026, by pop-up, to the Uniques build chat: “Start with these, tune in play (Recommended)”.
- To this chat, 11 Nov 2026, by 22:24, asked whether to make his test page now, with the items switched on and each showing
  its own picture: “Yes, make my test page (Recommended)”.

## The page

**https://claude.ai/artifact/TDTUvbr5FhjV56vrCu3Tbs** (“Wordsmith test page: unique items”, version `1794455239-92b4`;
his alone; a page of its own, NOT the game's page, and it keeps a save of its own). 202 files, 179.9 MB, sent in five
publishes: `index.html` (sha256 begins f8b311f388f41938, 7,636,045 bytes; the stamp TEST UNIQUES 2026-11-11 in the corner
of the starting screen) and beside it `heroes/0ed837378e63/` (36 files), `townsfolk/d4c898fe370d/` (3),
`sounds/3c87436f2f66/` (49) and `colossus/7cf0996e564d/` (113). The four folders are the live site's own files, byte for
byte (the first three taken from the branch `gh-pages` at f30b040, 25.3.7; the Colossus's from the repository, all 113
compared the same as the site's): nothing was baked again.

## What it is

The game as it is on this branch, built as the release is, but begun as `try=uniques` (src/main.ts). For this page only:

- `UNIQUES` on: they drop at the odds as built (docs/uniques/NUMBERS.md), the stranger may sell one, each does what it does.
- `UNIQUE_ART` on: each of the 62 shows its own bag picture.
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

## Not checked

- His phone. The page as claude.ai serves it in the app (it was played served from its folder here).
- A whole run with uniques dropping; each unique's own rule in the page (their tests are the uniques' five files).
- The whole suite; the regression.

## To know, and told to him

- Three add a word that is not in the game yet (The Headsman's Hood, The Queen's Glass, The Long Echo: Culling, Mirroring,
  Lasting, which wait on put-ten-new-words-live): their cards say so, and they add nothing yet.
- The Fourth Globe works, but the globes over the Brawler's head are painted as three.
- What the uniques show in play is plain stand-ins: the art is being drawn (draw-unique-items).
- The card's look (orange for what it does, red for its price) has not had his yes; the names are his placeholders.
- Floor 1 has no waypoint beside where he comes in: for the stash, a floor from 2 on.

## What is left

His word from the phone on the numbers, in this chat: each change is one line in `UNIQUE_TUNE`, `UNIQUE_DROPS`,
`UNIQUE_RULES` or a unique's `stats` (src/game/uniques.ts), the test page made and published again to the same link.
Nothing goes live with the switch on before his yes. For the main chat: `try/uniques` adds to `bring-in/uniques-art` only
the hook (off in the game), its test, its tool and its playtest; merge it or leave it, as you see fit.
