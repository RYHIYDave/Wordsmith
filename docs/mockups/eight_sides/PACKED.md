# THE BRAWLER'S EIGHT SIDES MADE TO FIT IN MEMORY: HIS MOVES KEPT PACKED (ON A BRANCH; NOT LIVE; `main` IS UNTOUCHED)

Branch `build/brawler-packed`, cut from `main` at 9f3cf44 (25.3.7) with `bring-in/eight-sides` merged in (first at 67a8ce0, then
as it is now, dee43f3). The chat that pulled the queue's `make-brawlers-eight-sides-fit-in-memory`, 11 Nov 2026 (a new chat of
his, working from the queue: the Brawler memory chat). It is not the main chat: it worked on a branch, and switching him on in
`main` and publishing are the main chat's.

**ON THIS BRANCH THE BRAWLER'S SWITCH IS ON (`EIGHT_MORE = { tinkerer: true, brawler: true }`), SO THAT HE CAN BE BAKED, PLAYED
AND PUT BEFORE HIM ON A TEST PAGE. IN `main` IT IS OFF, AT HIS WORD FROM THE PHONE (below), AND IT GOES ON THERE ONLY AT HIS
WORD: DO NOT MERGE THIS BRANCH INTO `main` BEFORE HE HAS SAID SO.**

**THIS BRANCH HAS ALL OF `bring-in/eight-sides`** (its tests, which hold whichever way the switches stand, `sides_more_fight.mjs`,
`veteran_play` mended, its notes), with this build on top: when he goes on, the main chat merges this one, and that one need not
be merged besides. What the eight sides are and his yes to them: `README.md` beside this file; how they were brought in, baked
and weighed, and what he said of them from his phone: `BRING_IN.md` beside it. This file is what came after.

## His words

- To the main chat, 11 Nov 2026, 19:54: “How do we make the brawler so he’s playable without crashing the game?”
- To this chat, 11 Nov 2026, 22:10 (Eastern): “Work on this task from the Wordsmith Queue: “Make the Brawler's eight sides fit in
  memory, then switch him on” (queue item make-brawlers-eight-sides-fit-in-memory).” and to read the queue's rules, pull the item
  and start.
- OF THE TEST PAGE THAT HAD HIM FROM EIGHT SIDES WITH NOTHING PACKED (https://claude.ai/artifact/EPxkp4u3wkrbWwRnD593iW), FROM HIS
  PHONE, to the eight-sides merge chat, 11 Nov 2026, between 22:10 and 22:23 (`BRING_IN.md`, its foot, has it whole): “First of
  all the title screen lags.  It’s the first thing you see.  How can it lag?  Then, character screen lags.  Selecting a character
  lags.  60 SECOND LOAD TIME to enter THE TOWN.  There’s not even a single enemy in the town why in gods name would I take that
  long to load” and, at 22:23, “THE LOADING SCREEN LAGS”. This chat did not know of it as it built this (that branch was
  looked at again on 12 Nov, 05:40).
- To this chat, by pop-up, asked on 12 Nov 2026 after 00:40 when this was built and checked, his picks by 05:36: of that test
  page, how it ran on his phone, “It stuttered or lagged” (offered beside “It froze or crashed”, “It ran fine” and “Haven't
  tried it yet”); of sending this branch to GitHub for the main chat, “Yes, send it to GitHub (Recommended)”.

## WHAT THIS DOES ABOUT WHAT HE SAW ON HIS PHONE, AND WHAT IT DOES NOT

- THE MINUTE TO COME INTO TOWN, AND THE LOADING SCREEN LAGGING. `BRING_IN.md` reads them as one thing: his 9,666 pictures being
  cut from their sheets one by one under the loading screen, the phone drawing a few frames a second meanwhile, until the screen
  gave up at its cap. WITH HIS MOVES KEPT PACKED, 989 PICTURES ARE CUT AS HE IS TAKEN IN, WHERE 9,666 WERE: a tenth of that work
  (fewer than any hero live but the Tinkerer: the Ranger's 7,253 are cut under the same screen today). His packs' 96 small files
  are fetched with him and not opened. Here his group comes whole in 0.68 s where it took 1.3 to 1.4.
- THE MEMORY: he holds 50 MB at most where he held 143 (below).
- NOT THIS: THE TITLE SCREEN, THE HERO SCREEN AND PICKING A HERO LAGGING. They come before any of his pictures are taken in, so
  his eight sides are not their cause and this build does not touch them (`BRING_IN.md`: “NOT LOOKED INTO YET”). That test page
  was also the first he saw of 25.3.2 to 25.3.5 inside the Claude app (its page there still shows 25.3.1): whether the game's
  own page of 25.3.7 lags there the same way on his phone is not known.
- SO: WHETHER HE RUNS WELL ON HIS PHONE NOW IS NOT KNOWN UNTIL HE HAS TRIED IT. A test page of this build is the way (as he
  picked for the first: “A test page first”); if the title screen lags on it too, that is a fault of its own to find.

## What it is (it changes nothing he sees)

From all eight sides the Brawler is 9,666 pictures, 142 MB held from the moment he is first shown (`BRING_IN.md`), where he holds
36 from two sides and the Ranger, the heaviest hero live, 92. A side at a time does not suit him (in a fight he turns to all
eight within seconds). So, the way the eight-sides chat's note set out:

- HE ALWAYS HOLDS only what he shows all the time: his stance, his run, struck (it cannot be seen coming), and the first frame of
  every move and of his fall. 9.7 MB, 744 pictures, on one sheet.
- EVERY MOVE, FROM EACH SIDE, IS A PACK: one small sheet of its own with the move's frames, its strike's half-frames and its
  action lines from that side. His eleven moves and his fall, from eight sides: 96 packs, 133.6 MB unpacked in all, 0.45 to
  4.33 MB each (47 to 135 pictures), 22 to 66 KB each as files. They are fetched with him under the loading screen and KEPT
  PACKED, as the files' own bytes (3.69 MB in all).
- A PACK IS UNPACKED AS ITS MOVE IS THROWN, and where it can be known, a moment before: his drawing asks each frame for the move
  a tap, a hold or a swipe would make next, from the side he faces and from the side of the nearest enemy, and for the presses
  already made and waiting their turn (`render/veteran_fx.ts` askAhead). What cannot be known ahead is asked for as its first
  frame is shown (`art/asked.ts`): until its pictures come, a few hundredths of a second, the move shows its first frame, which is
  his stance, and its lines are not shown.
- HOW A PACK IS UNPACKED (`PACKS.cut`): its sheet is read as a picture by the browser, beside the game, and each frame is
  drawn out of it into a canvas of its own on the game's own thread, 2 ms of it a frame, as the game's own painted frames are
  canvases and as the floors' monsters' bake cuts its own (build/monsters-before-play). NOT a picture made by the browser for
  each frame (createImageBitmap), which is how his 9,666 were taken in on the test page that took a minute on his phone, and
  which the eight-sides merge chat's lead says an iPhone is slow at (the queue's measure-lag-on-his-phone); that way is kept as
  the other setting, `'bitmap'`. NEITHER HAS BEEN MEASURED ON A PHONE. What he always holds is taken in as every hero's
  pictures are today.
- UNPACKED PICTURES ARE KEPT UP TO A BUDGET, 40 MB (`render/baked.ts` PACKS.budget); past it THE LEAST LATELY THROWN ARE LET GO:
  their places put back as they were, their room given back by hand three seconds on (`engine/px.ts` retireSprite, as 25.3.2
  gives canvases back), the after-images made from them with them (`render/veteran_fx.ts` forget). Never one asked for in the
  last second and a half. Thrown again, a pack is unpacked again.
- In a town nothing is asked for ahead. Another hero played, his packs in hand are let go.
- WHICH HERO IS PACKED IS DECIDED AS HE IS BAKED (`render/baked.ts` packsOf: the Brawler as the Veteran from eight sides, never
  his class card). Every other hero is baked and taken in exactly as before: their files have the same layout as they had.
  With `EIGHT_MORE.brawler` off he is not packed either (two sides, taken in whole, as live).
- `PACKS.on` off: every pack is unpacked as he is taken in and none is let go (he holds everything, as on `bring-in/eight-sides`).
  ONE NUMBER TO TUNE if his phone says so: `PACKS.budget`.

## THE NUMBERS (in a browser here; NOT ON A PHONE)

### The bake (`node tools/bake_heroes.mjs`: every sheet as written read back as the game reads it and checked against every frame on it as painted; none differed)

| group | frames | for places | sheets | packed | to paint |
|---|---|---|---|---|---|
| cards | 471 | 471 | 1 | 0.18 MB | 41 s |
| warrior | 2,504 | 4,217 | 3 | 1.20 MB | 86 s |
| ranger | 7,253 | 8,668 | 7 | 3.24 MB | 456 s |
| mage | 4,110 | 5,222 | 5 | 1.77 MB | 820 s |
| warlock | 1,441 | 2,646 | 7 | 3.09 MB | 276 s |
| tinkerer | 2,459 | 5,088 | 2 | 0.85 MB | 106 s |
| **brawler** | **9,666** | 42,992 | **97: one always held, 96 packs** | **4.26 MB** | 424 s |

Mark `06fe582c8126` (the code at c0194e1): 129 files, 20.78 MB, 2,261 s here. Every other hero's row is what `BRING_IN.md`'s
bake had, frame for frame: their files are laid out as before. THE BRAWLER: 744 pictures always held (9.7 MB, `brawler-0.png`,
0.40 MB) and 96 packs (133.6 MB unpacked, `brawler-<move>-<side>.png`, 3.69 MB of files in all); `brawler.json` 1.15 MB. His
9,666 pictures are 4.26 MB of sheets where they were 4.06 on thirteen: a picture that more than one pack shows is on each of
their sheets (208 more on the sheets than he has).

THE MARK IS NOW `d7fec6fa0251` (372c5e2: the budget written as a plain number, which takes PACKS out of the bake's page so
that tuning it makes no new bake; no picture and no layout changed). BAKED AGAIN FOR IT, 12 Nov, every sheet read back: 129
files, 20.78 MB, 2,718 s (with other work beside it). All 122 sheets are the same bytes as the bake above, and the seven group
files the same but for the mark. IT IS ON GITHUB AS THE BRANCH `bake/d7fec6fa0251`.

### His own pictures

| | held |
|---|---|
| from two sides (live; `BRING_IN.md`) | 36 MB, always |
| from eight sides, none let go (`BRING_IN.md`: 142 weighed; here 9.7 + 133.6) | 143 MB, always |
| the Ranger, the heaviest hero live (`BRING_IN.md`) | 92 MB, always |
| **FROM EIGHT SIDES, HIS MOVES KEPT PACKED** | **9.7 MB always; with what is unpacked, 11 MB in town, 14 as a floor is come into, 49 to 50 in a fight (the budget's 40 and his 9.7; for a moment up to 54)** |

### The same sitting as `BRING_IN.md`'s, on the built, baked page (`tools/brawler_packed_play.sh`)

`tools/scenarios/mem_floors.mjs` with `tools/mem_probe.js`: the Brawler in town, then floors 1 to 3 played by the bot
(`CLS=brawler FROM=1 TO=3 PLAY=40 SPEED=6`, a phone held sideways, 844 by 390 at 3), each sitting alone on the machine. What the
page holds, MB of 1,048,576 bytes: canvases + pictures handed over (ImageBitmaps: the heroes' baked frames, the side painter's,
the townsfolk's) + decoded sound + the script's heap. Both columns are this branch's page (25.3.7 with the eight sides). The
first is the game as it is on this branch (his packs in hand are canvases: up to 40 MB of that column's first number). The
second is the same pictures with `PACKS=0`, every pack unpacked and none let go (weighed with each frame a picture made by the
browser, so his are in its second number).

| as it is come into | HIS MOVES KEPT PACKED | every pack unpacked, none let go | his packs in hand (packed) |
|---|---|---|---|
| town | 61 + 38 + 6 + 49 = **153** | 59 + 159 + 6 + 52 = 276 (86 of the 96 in hand as it was weighed) | 2, 1.6 MB |
| floor 1 | 54 + 18 + 14 + 53 = **139** | 50 + 153 + 14 + 54 = 271 | 5, 4.0 MB |
| floor 1, played | 99 + 92 + 21 + 57 = **269** | 61 + 226 + 20 + 58 = 366 | 44, 39.1 MB |
| floor 2 | 104 + 45 + 26 + 59 = **234** | 66 + 179 + 26 + 60 = 330 | 44, 39.1 MB |
| floor 2, played | 132 + 90 + 28 + 62 = **312** | 102 + 229 + 28 + 63 = 422 | 44, 39.5 MB |
| floor 3 | 124 + 50 + 33 + 62 = **269** | 94 + 186 + 33 + 63 = 377 | 44, 39.5 MB |
| floor 3, played | 154 + 114 + 34 + 66 = **368** | 102 + 247 + 34 + 66 = 449 | 44, 39.8 MB |

(Each sum is of the unrounded figures: 153.4, 138.8, 269.2, 233.7, 312.2, 268.7, 368.1; and 276.0, 271.3, 365.5, 330.1, 422.2,
376.5, 448.6.)

What it says:

- THE WHOLE PAGE HOLDS 81 TO 133 MB LESS at every row (123, 133, 96, 96, 110, 108, 81): about half as he comes into floor 1
  (139 where 271), a sixth to three tenths less from then on.
- AGAINST `BRING_IN.md`'s live Brawler from two sides (25.3.5, another version, so only roughly): its page held 147, 163, 259,
  227, 344, 279 and 341 MB at the same rows; here 153, 139, 269, 234, 312, 269 and 368. From eight sides with his moves packed
  the page holds within 32 MB of what it held with him from two.
- HIS PACKS IN HAND ARE CANVASES NOW, and an iPhone gives a page only so much room for canvases (384 MB has been its limit:
  `BRING_IN.md`). The most canvases at any row here: 154 MB (floor 3, played). THEY ARE GIVEN BACK BY HAND as they are let go:
  floors 1 and 2 played with each way of cutting (`CUT=bitmap` for the other), the canvases left for the browser's collector
  to find were 45 MB (1,770 of them) this way and 45 MB (1,778) the other: none of them his.
- OVER THE WHOLE SITTING (twelve minutes of the game's time fought, at six times its speed): a pack was unpacked 119 times and
  let go 75. 108 of the 119 were asked for ahead of need; 11 as their first frame was shown (at the game's own speed a moment
  ahead is six times as long: in the fight with a thumb, below, none). ON THE GAME'S OWN THREAD the cutting took 1.2 s in all
  over the sitting, about 10 ms a pack, 2 ms at a time; 36 ms at worst in one go, once (the first sheet as it was first drawn
  from, in town).
- A FRAME'S WORK WHILE THE BOT FOUGHT, in the middle: 7.8, 7.9 and 8.0 ms on floors 1, 2 and 3 packed; 7.2, 7.6 and 7.2 with
  none let go. Frames of over 50 ms: 3, 27 and 45 packed; 2, 23 and 4 with none let go. FLOOR 3 PLAYED AGAIN ALONE, TWICE EACH
  WAY, because of that count (then with the browser-made cut: 46): 32 and 38 packed (the longest 181 and 231 ms), 38 and 64
  with none let go (232 and 404 ms). As `BRING_IN.md` found, floor 3 differs from one sitting to the next more than the pages
  do (the floor's monsters painted as they are first shown: the queue's bring-in-monsters-before-play mends that); nothing in
  it points at the packs.
- THE BUDGET, tried on floor 2 alone (four minutes of the game's time fought; the browser-made cut): at 26 MB a pack was
  unpacked 161 times and let go 131; at 40, 72 and 29; at 56, the 54 packs that fight used all stayed in hand (48 MB) and none
  was let go. A frame's work was the same at all three (7.0, 7.3 and 7.3 ms in the middle; 33, 27 and 27 frames over 50 ms).
  40 is the game's: about half the Ranger. At 26 he would hold what he holds today from two sides, with packs coming and going
  twice as often.
- THE TWO WAYS OF CUTTING, the same sitting (floors 1 to 3) with each: the page held about the same in all (154, 142, 273, 239,
  352, 281 and 371 MB with the browser-made cut; one sitting differs from the next by as much); on the game's own thread 0.4 s
  in all that way where 1.2 this way; unpacked 109 times and let go 65 where 119 and 75.

### Played with a thumb (`tools/scenarios/sides_more_fight.mjs`, BAKED=1, alone on the machine): 124 checks, all as they should be

- His pictures are the bake's: 989 frames taken in as he is first shown (where 9,666 were), HIS GROUP COME WHOLE IN 0.57 s, his
  96 packs' files with it (`BRING_IN.md`: 1.3 to 1.4 s to cut his 9,666).
- What he always holds is in hand before he fights: 832 places with their picture, none without (his stance, his run, struck,
  the first frame of every move, from eight sides).
- HIS BLOWS AND HIS JUMPS THE EIGHT WAYS, as `BRING_IN.md` has them (a jab at an enemy off each of his eight ways; the three
  punches and the held kick straight down, left, up and right; his dodge the eight ways; an urn and a barrel broken): every
  check as before. AFTER IT: 26 of his 96 packs in hand, 35.8 MB (the most at once 44.0); a pack unpacked 72 times, let go 46;
  EVERY ONE OF THE 72 ASKED FOR AHEAD OF NEED, NONE WITH NOTHING OF IT TO SHOW YET: no move of his stood on his stance.
  On the game's own thread the cutting took 0.5 s in all, 6.6 ms at worst in one go.
- A frame while he fights: 16.7 ms in the middle, 23 ms at worst (`BRING_IN.md`, none packed: 16.7 and 22).

Also played, two at a time, all finished clean: `veteran_play` (the regression's own of him); `baked.mjs` with the Ranger and
the Warlock (each taken in whole from this bake, none failed, none painted by the worker: the other heroes come from it as
before); `guide.mjs`, a new player's first dungeon with the Warrior.

### The unit tests (his rules: only what the change is about, and the core)

`node tools/unit.mjs --only baked_packs,veteran_packs,sides_more,veteran_art,veteran_rules,veteran,vet_props,veteran_icons,veteran_talents,veteran_words`
on 00ec33d6b4, run once, alone on the machine: 33 files, 447 tests, all passed (the ten named and the core's 23).
AFTER IT the code changed (a pack's frames cut a few at a time, then as canvases; the budget as a plain number;
`bring-in/eight-sides` as it is now, with its tests), so the files that test what changed were run once on the last of it:
`--only baked_packs,veteran_packs,sides_more,veteran_art,veteran_rules,veteran,vet_props` on bc539fc691, alone:
**30 files, 426 tests, all passed** (the seven named and the core's 23; 407 files not run). `tsc --noEmit`: clean.

## What is on the branch

- `src/render/baked.ts`: PACKS (the switch, the budget), packsOf (which list is in which pack), the file's `packs`, and in
  BakedHeroes: the packs fetched and kept packed (takePacks), `want` (asked ahead), unpack, trim (the budget), letGo; its stats
  (`__dbg.baked().packs`), and for the measures `__dbg.packs`.
- `src/art/asked.ts`, NEW: a list that tells when a frame of it is asked for and not there. A file of its own and not a line in
  `art/kit.ts`: the townsfolk's bake is marked by the code it is made of, kit.ts in it, and this way its mark is still
  d4c898fe370d (nothing of theirs to bake or publish again).
- `src/art/veteran_art.ts` (his moves' and half-frames' lists tell), `src/art/veteran_fx_art.ts` (his lines' lists tell).
- `src/render/veteran_fx.ts`: askAhead, forget. `src/main.ts`: the two wired where the heroes are baked.
- `src/dev/bake_heroes_page.ts`, `tools/bake_heroes.mjs`: a packed hero laid out so (what he always holds on sheets as before,
  then each pack on one sheet of its own, `<group>-<move>-<side>.png`); every sheet, the packs' too, read back as the game reads
  it and checked against every frame on it as painted.
- `tests/baked_packs.test.ts` (9), `tests/veteran_packs.test.ts` (5), NEW.
- `tools/scenarios/sides_more_fight.mjs`: where his moves are kept packed it checks what he always holds, his 96 packs and the
  budget, and says how often a move was asked for with nothing of it to show yet. `tools/scenarios/mem_floors.mjs`: says the
  packs at every row; `PACKS=0` (none let go), `BUDGET=<MB>`, `CUT=bitmap`. `tools/brawler_packed_play.sh`: the playtests and
  the two sittings of this change on the built, baked page. `tools/brawler_packed_try_page.mjs`: a test page of this build
  for his phone (as `tools/eight_sides_try_page.mjs` made the first).
- No rule of the game is changed, and no picture.

## FOR THE MAIN CHAT

0. NOT BEFORE HIS WORD. The Brawler's switch is on on this branch; in `main` he stays off until he has tried this build on his
   phone and said so (the top of this file).
1. THEN MERGE `build/brawler-packed` INTO `main`. It is `main` at 9f3cf44 (25.3.7) with `bring-in/eight-sides` (dee43f3) and
   this build on top: a fast-forward if `main` has not moved. THE SWITCH AND THE THREE LINES THAT SAY SO ARE ON HERE
   (`src/art/sides_more.ts`; `tests/sides_more.test.ts` test 2; `tests/veteran_art.test.ts`'s `was`;
   `tests/veteran_rules.test.ts`'s `eightWas`): if `main` has `bring-in/eight-sides` in it already, with them off, the merge
   meets those four places: keep this branch's. `bring-in/eight-sides` need not be merged besides.
2. THE BAKE IS MADE: mark `d7fec6fa0251`, on the branch `bake/d7fec6fa0251` (the files of `.bake/d7fec6fa0251/` at its root,
   `done.json` with them; its README says how: put them in `.bake/d7fec6fa0251/` and `tools/build.mjs` takes them as baked,
   WHILE THE MARK IS STILL THIS ONE; anything merged into `main` first that the bake's page is made of, the heroes' art among
   it, makes a new mark, and then it is baked again, 38 to 45 minutes here). In `heroes/<mark>/` beside the page: 129 files
   where the live site has 36.
3. NOTHING ELSE TO PUBLISH AGAIN FOR IT: the townsfolk's mark is still d4c898fe370d, the sounds' 3c87436f2f66, the Colossus's
   7cf0996e564d (this page's build gave all three).
4. The version's name, the release build, the published page's own playtests (`tools/brawler_packed_play.sh` plays those of
   this change on the wrapped, served page, MEM=0 for the playtests alone: copy its list into the version's wrap script),
   `gh-pages`, the records; the handoff's THE LIST has him as NOT LIVE.
5. HIS WORD: the foot of this file. His yes to the art stands (`README.md`); what is awaited is how this build runs on his
   phone.
6. TO TUNE, once his phone has been tried: `PACKS.budget` in `src/render/baked.ts`, one number, and `PACKS.cut`, one word
   (neither makes a new bake). To have him hold everything again:
   `PACKS.on` false. To have him from two sides again: `EIGHT_MORE.brawler` false and the three places `BRING_IN.md` names,
   and a new bake.

## NOT CHECKED

- A PHONE. Nobody has played him from eight sides on one with this, and an iPhone's browser is not this machine's: how fast it
  reads a small sheet and draws a hundred frames out of it is not known. If a move thrown shows his stance for a moment too
  long there, the budget is the first thing to raise; if canvases run short there, `PACKS.cut` is the word to change.
- A whole run; the whole suite; the regression.

## His word from the phone on THIS build

NOT YET. To be asked of him with a test page of this build.
