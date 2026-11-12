# The floors' monsters in packs: one file a figure (branch build/monsters-packed)

Built 12 Nov 2026 by a chat of his working from the Wordsmith Queue (his words: “Work on a queue item”; the item:
publish-25-3-2-to-claude-page, “Put the floors' monsters on the game's claude.ai page too (their bake packed into fewer files:
the page may hold 511)”). Not the main chat: main is untouched, nothing is published. He has not been asked anything:
NOTHING HE SEES CHANGES, and there is no switch.

## Why

The game's page on claude.ai holds at most 511 files a version. 25.3.9's page there is 203 files (the page; heroes 36; sounds 50;
townsfolk 3; Colossus 113). The monsters' bake, monsters/4f510caa1c9d/, was 398 files (110 figures: each `<name>.json` and its
288 sheets between them): 601 in all. So it was left off, and on that page the floors' monsters are painted as they are first
shown, as before 25.3.8.

NOW IT IS 110 FILES, ONE A FIGURE: the page with it would be 313 files, 198 to spare. (With the Brawler's packed bake when it
comes, heroes/ at 129 files where 36, it would be 406; with the Colossus's aimed gaze, colossus/ at 122 where 113, 415.)

## What a pack is (tools/monster_packs.mjs)

`<name>-pack.png`:
1. the figure's sheets, each a PNG whole, one after another, in the order of its file's `sheets` (so the file is a PNG by its
   first bytes: the page serves only the kinds of file it knows, as the sounds' packs found, tools/sound_packs.mjs);
2. then the figure's file (its JSON, UTF-8) as the bake made it, with one field more, `packed`: where each sheet lies,
   `[start, length]` in bytes;
3. then 12 bytes: `WSMB` and the JSON's length in bytes, 8 hex digits.

## What changed

- tools/monster_packs.mjs (new; its types tools/monster_packs.d.mts, for the tests): packFigure, readPack, packFromBake (a pack
  made from a kept bake, read back and checked: its file and every sheet the very bytes it was made of).
- tools/bake_monsters.mjs: shipMonsters writes the packs into dist/monsters/<mark>/ (tools/build.mjs and tools/build_to.mjs call
  it, unchanged). THE BAKE ITSELF IS UNCHANGED: kept in .bake/monsters/<mark>/ as before (a file and its sheets), made the same
  way, and only what is carried beside the page is packed, in seconds. monsterBakeFiles still lists the kept bake's files.
- src/render/monsters_baked.ts: a figure's pack fetched (one request where 1 + its sheets), its file read from the end
  (readPack), each sheet opened from its own part of the pack (a slice of it, not a copy). A sheet is opened with
  createImageBitmap(bytes), AS THE HEROES', THE TOWNSFOLK'S AND THE COLOSSUS'S SHEETS ARE (render/baked.ts), which is proven on
  his iPhone and on the claude.ai page; before, the monsters' sheets were opened as an Image from their address. Still ONE
  picture made by the browser a sheet, never one a frame: each frame is cut into a canvas of its own, as before. Where a browser
  has no createImageBitmap, the bytes are opened as an Image from a blob address. Everything else (the loading screen's wait, a
  phone's room, a figure called up in a fight, stand-ins, letting go) is as it was.
- src/render/monsters_bake_list.ts: the file's type has `packed` (types and comments only).
- tests/monsters_baked.test.ts: its stand-ins fetch a pack and open each sheet from its bytes (each checked to be its own and
  nothing more); a pack that did not come whole fails as a missing file does (painted as before); a new test: a pack made by the
  tool and read by the game, file and sheets the same byte for byte, a letter that is not ASCII in it, and what is not a pack
  refused.
- tools/scenarios/monsters_baked.mjs: counts packs, and marks as a problem any file asked for that is not one.

## THE BAKE'S MARK IS THE SAME: NO NEW BAKE

The mark is taken from the bake page's code (src/dev/bake_monsters_page.ts and what it imports): 4f510caa1c9d on main and on this
branch, worked out both ways here. The bake page's own read-back check still opens each sheet as an Image (changing it would
change the mark); the game's new way is checked in play against the game's own painting (below).

## Checked (Chrome on a two-core cloud machine; NOT A PHONE)

- tsc clean.
- `node tools/unit.mjs --only monsters_baked` on 705eae25: 24 files (it and the core), all passed.
- Packs made from THE LIVE SITE'S OWN BAKE of this mark (gh-pages monsters/4f510caa1c9d, 398 files, fetched alone; this session
  had no kept bake, so its .bake/monsters/4f510caa1c9d/ was those files with a done.json listing their 110 figures, not baked
  here): 110 packs, 90 MB, the largest the Amalgamation's 10.2 MB.
- PLAYTESTS, tools/scenarios/monsters_baked.mjs on a readable build (`node tools/build_to.mjs dist/mobs_packed.html`), served as
  the published page is, floors 1, 2, 6, 11 and 16 as the Warrior, the bot playing 15 s each: BOTH FINISHED CLEAN.
  - A phone's screen (`--touch --size 844x390 --dpr 3`): every floor's figures came whole from their packs as the loading screen
    lifted, ONE FILE A FIGURE; the bosses not taken in, as before on a phone; 9,162 pictures given, none failed; every place
    checked against the game's own painting the same, every pixel (369 checked); in play, NOT ONE MONSTER'S FRAME PAINTED.
  - A desk's screen (`--size 1280x720`), the bosses' packs too (the Flame Unfinished's 7.6 MB in 3.0 s): 13,482 pictures
    given, none failed; every pixel the same (412 checked); none painted in play.
  - MAIN AS IT IS (10161fc, the 398 files), the same phone run, for against: the same 9,162 pictures, the same pixels.

  | floor (phone's screen) | 1 | 2 | 6 | 11 | 16 |
  |---|---|---|---|---|---|
  | files asked for, main | 13 | 8 | 15 | 14 | 10 |
  | files asked for, packed | 6 | 4 | 7 | 7 | 5 |
  | loading screen up, main | 2.98 s | 1.52 s | 3.81 s | 4.04 s | 3.73 s |
  | loading screen up, packed | 3.15 s | 1.73 s | 3.64 s | 3.52 s | 3.67 s |

  The same within what a busy two-core machine varies by. Served from this machine: over the web, half the requests a floor
  can only help. (A pack comes whole before its first sheet opens, where a figure's sheets used to come three at a time: that
  matters only for a big boss's, and on a phone the bosses are not taken in.)

## Not checked

His phone; the claude.ai page itself (the packs have never been sent there); a release build (node tools/build.mjs) with the
other bakes beside it; the published page's own playtests.

## WHAT IS LEFT, FOR THE MAIN CHAT

0. FIRST, AS THE QUEUE ITEM SAYS: 25.3.10's page alone on the claude.ai page (publish/25.3.10, dcec8ec2). Untouched here.
1. Merge build/monsters-packed. None of the other ready branches (build/moth-packed, build/smooth-loading-frames,
   bring-in/hero-cards, build/brawler-packed, fix/boss-death-stall-rime-shade, build/colossus-gaze2, build/warrior-tree,
   try/uniques) touches its files.
2. The release build as ever: dist/monsters/<mark>/ is now 110 packs. If the monsters' mark changes with what else comes in,
   the bake is made again as ever; the packs are made from it the same way.
3. The published page's playtests, monsters_baked.mjs among them (`--serve`, a phone's screen and a desk's).
4. Publish: the page with monsters/<mark>/ beside it. 90 MB, so at least two calls (64 MB a call); no file over 20 MB.
   On gh-pages the folder's old 398 files can go: a page from before this asks for `<name>.json`, is told it is not there, and
   paints its monsters as before.
5. The records.
