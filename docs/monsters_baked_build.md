# THE FLOORS' MONSTERS MADE BEFORE PLAY: THE BUILD (on a branch; not on `main`, not published)

The queue's `make-floors-monsters-before-play`, pulled by a chat of its own ("Monsters-before-play chat") at his word,
11 Nov 2026, 22:09 (Eastern): “Work on this task from the Wordsmith Queue: “Make each floor's monsters before play, so none
is painted as he fights (the lag on every new floor)” (queue item make-floors-monsters-before-play).”

Branch `build/monsters-before-play`, cut from `main` at 9f3cf44 (25.3.7): a fast-forward for `main` while it stands there.
`MONSTERS_BAKED.on` is ON on the branch (`src/render/monsters_baked.ts`): it changes nothing he sees but a loading screen a
little longer. Off, or on a page without the files, the game is as it was. The main chat brings it in, bakes, tests the
game as one piece and publishes.

## His words

- To the eight-sides bring-in chat, 11 Nov 2026, 21:30: “Explain to me why the game lags at literally every new screen
  regardless of introducing loading screens?” That chat measured it and told him what would mend it (the queue item: “told
  him as what would mend it; not yet his yes”). His word to this chat (above) is his go-ahead for the build.
- To the eight-sides merge chat, 11 Nov 2026, 22:10 to 22:23, of the eight-sides test page ON HIS PHONE (the queue's
  `measure-lag-on-his-phone`): “60 SECOND LOAD TIME to enter THE TOWN”; “THE LOADING SCREEN LAGS”. That chat's lead: an
  iPhone's browser is slow at making a picture for every baked frame (`createImageBitmap`), as the heroes' bake does. THIS
  BUILD WAS CHANGED FOR IT (below: "How the pictures are taken in").

## What it is

Every figure the bestiary has pictures for is painted once when the game is built and kept in files beside the page, a
group a figure: `monsters/<mark>/<figure>.json` and its sheets (`<figure>-<n>.png`). As a floor is come into, under its
loading screen, the floor's own figures are taken in from those files (and what they will call up or become:
`bringsOf`); the loading screen waits for them; they are let go of with the floor, by the bestiary, as its monsters'
pictures always were. A figure whose pictures are the bake's is nobody's to paint: not the painter's worker's, not the
game's. Where the files are not to be had (no bake, a page opened as a file, a file missing, a figure not as it was
baked, no room), that figure is painted as before.

- `src/render/monsters_bake_list.ts`: which figures are baked (`bakedFigures`), the file's shape. Kept apart so that the
  bake's mark does not change when the taking in does.
- `src/render/monsters_baked.ts`: the taking in (`BakedMonsters`), the switches, `bringsOf`.
- `src/dev/bake_monsters_page.ts`, `tools/bake_monsters.mjs`: the bake. A fresh page a figure; kept as it goes (stopped,
  it goes on where it stopped); each sheet read back the game's way and checked against the painting, pixel by pixel.
- `src/main.ts`: `bakedMobs`, `mobPictures` (the loading screen waits), `__dbg.bakedMobs`, `monstersBaked`,
  `bakedMobsCheck`. `src/render/render.ts`: a baked figure left out of the painting ahead; one still coming shown as the
  nearest frame that has come. `src/art/bestiary.ts`: `Bestiary.made` (a figure's pictures if made, never making them).
- `tools/build.mjs`, `tools/build_to.mjs`, `tools/make_site.mjs`: the bake carried beside the page (below).
- `tests/monsters_baked.test.ts` (13), `tools/scenarios/monsters_baked.mjs`, `tools/scenarios/new_screen.mjs` (the
  eight-sides chat's measure, the same file as on `bring-in/eight-sides` dee43f3).

NOT BAKED: the Drowned Eye while the Swamp Colossus is floor 10's boss (his own pictures are never shown); the Moth
(as it was baked on the first try: 1,304 frames of up to 832 by 824, 1,984 MB were they all held; `TOO_BIG`).

## How the pictures are taken in (changed for his phone, 11 Nov, late)

As first built, each frame was made a picture by the browser (`createImageBitmap(sheet, x, y, w, h)`), as the heroes'
bake does: next to nothing in Chrome. His words from his phone and the merge chat's lead (WebKit bugs 280601, 234920) say
an iPhone may be slow at exactly that, and a floor has 1,000 to 10,000 frames. So:

- EACH FRAME IS CUT FROM ITS SHEET INTO A CANVAS OF ITS OWN (`openSheet`: the file read as a picture, `drawImage` into a
  new canvas): what the game itself does for every frame it paints and every mirror image (`engine/px.ts`). No picture is
  made by the browser for a frame.
- A FEW AT A TIME: 8 ms a turn under the loading screen, 2 ms a turn in play (`CUT_MS`), the page given back to draw
  between. Measured here: 0.07 to 0.17 ms a frame (0.47 a boss's), 0.1 to 0.35 s of cutting for a floor's kinds.
- THE LOADING SCREEN WAITS 8 s AT THE MOST, by the clock on the wall (`MONSTERS_BAKED.waitMost`); what has not come goes
  on coming as he plays.
- ON A PHONE (`small`, a touch screen, as the painter has it) A BOSS'S PICTURES ARE NOT TAKEN IN: they are up to 537 MB,
  an iPhone gives a page only so much room for canvases (384 MB has been its limit), and a canvas refused breaks whatever
  asked for it. They are the painter's, as before. And no more than 64 MB of the others at once (`SMALL_MOST_MB`): a
  floor's kinds but its boss are 16 to 54 MB (floor 17's, with its twelve dancers, 152: eight are left out there, as
  before). If a canvas is ever refused, nothing more is taken in on that page.
- ON A DESK'S SCREEN every figure of the bake's is taken in, bosses too.
- Every frame of the kept bake was read both ways, the way it was checked as it was baked and the way the game now cuts
  it: 110 figures, 288 sheets, 60,167 frames, no value differs.

THE HEROES' BAKE STILL MAKES A PICTURE FOR EVERY FRAME (`render/baked.ts`): not touched here. If his phone proves slow at
that, it could take its frames in this same way (the cutting and its turns are in `BakedMonsters`), or from sheets kept
whole (the merge chat's lead).

## Measured (a browser on a two-core cloud machine, a phone's screen with a finger, the Warrior; NOT A PHONE)

THE LAG, the eight-sides chat's own measure (`tools/scenarios/new_screen.mjs`): 15 s of the bot's play at the game's own
speed, on a readable baked build of the branch, without and with the monsters' files.

| floor | before: frames over 33 ms / over 50 ms, time lost, painted by the game itself | after |
|---|---|---|
| 1 | 16 / 0, 0.26 s, nothing | 9 / 0, 0.15 s, nothing |
| 2 | 47 / 2, 1.00 s, nothing | 37 / 1, 0.74 s, nothing |
| 6 | 146 / 30, 3.95 s, 507 pictures in 5.59 s | 22 / 1, 0.46 s, 6 pictures in 0.04 s (an effect's, not a monster's) |
| 11 | 236 / 57, 6.79 s, 580 pictures in 6.24 s | 31 / 3, 0.67 s, nothing |

THE LOADING SCREEN, from the floor being asked for until the screen lifts, each of the 20 floors in turn: 42.1 and 42.5 s
in all before (two runs); 49.7 s after on the last build (47.8 and 48.1 s on the two builds before it, their turns 10 and
6 ms): 0.3 to 0.4 s a floor longer; floor by floor from 0.3 s shorter to 1.2 s longer. On a desk's screen, where the bosses come too: floors 2, 3, 6, 7, 13, 17 were 1.9, 1.0,
4.0, 3.6, 5.0, 2.3 s and are 3.2, 4.8, 6.1, 6.6, 6.9, 6.3 s.

EVERY FLOOR (`tools/scenarios/monsters_baked.mjs`, floors 1 to 20, a phone's screen): 77 figures taken in, 27,783
pictures, none failed; 1,492 places painted afresh on the page and held against the pictures in hand: the same, every
pixel; in 5 s of play a floor the game painted 22 pictures in all, none a monster's. On a desk's screen, floors 3, 6, 7,
13, 17: 50 figures, 26,078 pictures, 566 places the same, none a monster's painted.

THE MEMORY (`tools/scenarios/mem_floors.mjs`, floors 5 to 8 in one sitting, 45 s of play a floor at six steps a frame, a
phone's screen): canvases and browser pictures held, and the browser's own memory for the page:

| | before: canvases + pictures, MB | after | before: browser, MB | after |
|---|---|---|---|---|
| floor 5 come into | 51 + 48 | 105 + 43 | 835 | 1,021 |
| floor 5 played | 88 + 122 | 136 + 113 | 1,400 | 1,035 |
| floor 6 come into | 75 + 74 | 115 + 63 | 1,294 | 1,191 |
| floor 6 played | 217 + 180 | 152 + 212 | 1,636 | 1,447 |
| floor 7 come into | 85 + 76 | 121 + 64 | 1,561 | 1,486 |
| floor 7 played | 196 + 255 | 144 + 278 | 2,052 | 1,743 |
| floor 8 come into | 81 + 63 | 132 + 46 | 1,534 | 1,378 |
| floor 8 played | 126 + 133 | 196 + 113 | 1,802 | 1,796 |

Read as: as a floor is come into, 23 to 49 MB more is held at once (its kinds whole, as canvases); after play from 33 MB
less to 50 MB more (the game painted them into canvases itself before). The most canvases held at any row: 217 MB before,
196 MB after. (This sitting was run on the build before the last: its turns 6 ms where they are 8.)

A FIGURE CALLED UP IN PLAY THAT THE FLOOR NEVER HAD (four wolves called up beside him on floor 1, on the build before the
last): its files came in 1.1 s at 2 ms a turn, shown meanwhile as the nearest frame that had come; every place of it then
held its picture.

NOT MEASURED: HIS PHONE; the other heroes; a whole run; the release build and the published page's playtests; a page on
the web over a poor line (the 8 s is for that).

## The bake (for the main chat)

- `node tools/bake_monsters.mjs` (and `tools/build.mjs`, which calls it): 110 figures, 60,167 frames for 62,002 places,
  288 sheets, 398 files, 93.85 MB; 1,200 s of painting, about 21 minutes by the clock here, two figures at a time. Kept in
  `.bake/monsters/<mark>/`; made again only when the mark changes.
- THE MARK is the hash of the bake's page as bundled: about 400 files of the art and the rules it reads. A change to any
  of them is a new mark and a new bake; comments do not change it; `src/main.ts`, `src/render/render.ts` and
  `src/render/monsters_baked.ts` are not in it. THE HEROES' AND THE TOWNSFOLK'S MARKS ARE MAIN'S (0ed837378e63,
  d4c898fe370d): no new bake of those.
- `--from <mark>`: a kept bake's figures taken as the new mark's, not painted again. Only for one who knows the art did
  not change between the two. Never for a release.
- A figure over 600 MB in hand stops the bake, to be named in `TOO_BIG` (`HOLD_MOST_MB`; the Carrion Queen is 537, the
  Flame Unfinished 380; the 31 bosses are 70.5 MB of the files, the 79 others 23.3 MB).
- THE SWITCHES THE GAME PUTS ON AS IT STARTS (the last lines of `src/main.ts`) ARE PUT ON IN THE BAKE'S PAGE TOO, in the
  same words: the first bake here was painted without them, and on floors 6 and 11 seven of the sixteen figures came out
  "not as baked".
  `tests/monsters_baked.test.ts` test 2 holds the two files to each other: a new switch there fails it until it is in
  `src/dev/bake_monsters_page.ts` too.
- BESIDE THE PAGE: `dist/monsters/<mark>/` (`tools/build.mjs`; `--no-monsters` or `--no-bake` for none);
  `tools/make_site.mjs` takes it as its seventh folder and the offline helper keeps it; the claude.ai page needs the 398
  files at `monsters/<mark>/` beside it.
- A PLAYTEST THAT THROWS THE ART'S OWN SWITCHES on a served page with the bake puts `__dbg.monstersBaked.on = false` first
  (the files are the release's pictures). Pages opened as files take in nothing, as ever.

## Found in passing

- FLOOR 10, MENDED HERE (commit 26b0003; `Act1Fx.noFigure`, `render/act1_fx/colossus.ts`, `render/render.ts`): the Swamp
  Colossus and his arms are monsters of the Drowned Eye's kind, drawn from his own baked pictures, and the painter's
  worker was painting the Drowned Eye's own for them all the same: 1,352 places, 330.8 MB held whole, never drawn (30
  handed over in the first 6 s here). Now none. He has not asked for it; it changes nothing he sees.
- THE MOTH, FLOOR 20, NOT TOUCHED: the painter's worker paints and hands over every frame of a boss and nothing lets one
  go before the floor is left. The Moth's were 1,984 MB whole as first baked (25 handed over in the first 6 s here). Queued: `keep-moths-pictures-from-filling-memory`.
- A BOSS REACHED BEFORE THE PAINTER HAS DONE is painted by the game as he is shown (floors 6 and 7 after 45 s of the bot's
  play: the game's own frame 44 and 80 ms in the middle). On a desk's screen the bake ends that. On a phone it is as
  before, for want of room: the way to mend it there is fewer or smaller pictures for a boss, not this.
- The bosses' frames are tight already: cut down to what is painted in each, the six biggest would be 1% smaller.

## Checked

- `tsc`: as main (tests/relief.test.ts 378 only).
- `node tools/unit.mjs --only monsters_baked,enemy_moves,floor_looks_game,loading_ring,level_select,first5_bosses,
  colossus_fight,act1_eye` and the core on a005da942b: 30 files, 344 tests, all passed; then `--only monsters_baked` and
  the core on f097cc1396 (two numbers changed): 24 files, 295 tests, all passed.
- The playtests above, on pages built from the branch (`node tools/build.mjs --dev`, served from `dist/`): all finished
  clean, no problems.

## Left, main chat

1. Bring the branch in (a fast-forward while `main` is at 9f3cf44). It meets `bring-in/eight-sides` dee43f3 in one file,
   `tools/scenarios/new_screen.mjs`, the same on both.
2. The release build bakes the monsters (about 21 minutes here); publish `monsters/<mark>/` beside the page.
3. The published page's playtests, with `tools/scenarios/monsters_baked.mjs` among them.
4. HIS PHONE IS THE TEST: nobody has run this on one. If the phone check (`measure-lag-on-his-phone`) shows an iPhone slow
   at something this build does, `MONSTERS_BAKED.on = false` is the game as it was.
