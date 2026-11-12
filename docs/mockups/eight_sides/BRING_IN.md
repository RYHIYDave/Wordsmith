# THE TINKERER AND THE BRAWLER FROM EIGHT SIDES: BROUGHT IN ON A BRANCH, BAKED, WEIGHED AND PLAYED (NOT LIVE; `main` IS UNTOUCHED)

Branch `bring-in/eight-sides`, cut from `main` at 95eefb7 (25.3.5) with `art/tinkerer-brawler-eight` (8e0548c) merged in: it
merged clean. The chat that pulled the queue's `bring-in-tinkerer-brawler-eight-sides`, 11 Nov 2026 (a new chat of his,
working from the queue). What the art is, and his yes to it: `README.md` beside this file (the Tinkerer chat's).

## His words to this chat

- 11 Nov 2026, 19:21 (Eastern): “Work on this task from the Wordsmith Queue: “Bring in the Tinkerer and the Brawler from eight
  sides (bake them; weigh the Brawler's memory)” (queue item bring-in-tinkerer-brawler-eight-sides).” and to read the queue's
  rules, pull the item and start.
- His answer on the Brawler's switch: AT THE FOOT OF THIS FILE.

## Why a branch, and what is left for the main chat

The item is marked for the main chat, which alone commits to `main` and publishes (CLAUDE.md). He did not name this chat the
main chat, and in the same minutes he set other chats to work from the queue (its claims of 11 Nov, 19:11 to 19:23: the
Warlock, the townsfolk's bake, the Endless town, the uniques' art). Two chats writing `main` at once is the thing the rule is
there to stop. So everything the item asks is done HERE, and what is left is short:

1. Merge `bring-in/eight-sides` into `main` (it is `main` at 95eefb7 with this work on top: a fast-forward if `main` has not moved).
2. THE BAKE IS MADE: mark `e0ac1c19738f`, 45 files, 20.60 MB, on the branch `bake/e0ac1c19738f` (the files of `.bake/e0ac1c19738f/`
   at its root, `done.json` with them). Put them in `.bake/e0ac1c19738f/` and `tools/build.mjs` takes them as baked, IF THE MARK
   IS STILL THIS ONE: it is the hash of the bake page's bundle (`tools/bake_heroes.mjs` bakeCode), so anything merged into
   `main` first that the bake page is made of (the heroes' art, `art/kit.ts`, `render/baked.ts`) makes a new mark, and then it
   is baked again: 2,300 s here (38 minutes), on two cores, with a playtest or two beside it.
3. The version's name, the release build, the published page's own playtests (`tools/eight_sides_play.sh` plays those of this
   change on the wrapped, served page: copy its list into the version's wrap script), `gh-pages`, the records.
4. HIS WORD ON THE BRAWLER'S SWITCH decides whether both go on: the foot of this file. The branch has BOTH ON.
   For the Tinkerer alone: `EIGHT_MORE.brawler` false in `src/art/sides_more.ts`; the three places that hold it on
   (`tests/sides_more.test.ts` test 2, `tests/veteran_art.test.ts` test 4's `was`, `tests/veteran_rules.test.ts`'s `eightWas`);
   and a new bake (the mark changes).

## What is on the branch

- `art/tinkerer-brawler-eight` merged (ac9af96).
- `EIGHT_MORE = { tinkerer: true, brawler: true }` (ab4943f), and the tests of his four ways put right:
  - `tests/sides_more.test.ts`: test 2 now holds the switches ON in the game and asks what it asked of them off WITH THEM OFF
    (`asOff`); so do the tests that compared "off" with "on" (with the switch on by default they would have compared on with
    on, and passed for nothing): the Tinkerer's and the Brawler's two sides the same pictures, the pinned frames off and on,
    the fight's four ways.
  - `tests/veteran_art.test.ts` test 4: the game lays his effects as the art's film does FROM EACH OF HIS EIGHT SIDES, never
    mirrored (the side for the way he faces, the art's figure turned as that side is); and, his eight sides off, from in
    front and behind, mirrored or not, as it was written.
  - `tests/veteran_rules.test.ts` (it passed as it stood, its checks being of the blow and not of his picture): the jab at an
    enemy off the nearest of his ways is now thrown with his eight ways and with his four, 20, 25 and 40 degrees off.
- `tools/scenarios/sides_more_fight.mjs`, NEW: his eight ways in a fight with a thumb (below).
- `tools/scenarios/veteran_play.mjs`, MENDED (the regression's own of him): below.
- `tools/eight_sides_play.sh`: the playtests of this change on the built, baked page, and what the page holds.
- No file of the game's is changed by this chat but the switch's line and its comment.

## THE BAKE WITH EIGHT SIDES OF THESE TWO (the Tinkerer chat's "NOT CHECKED: the bake itself"): MADE, EVERY SHEET READ BACK

`node tools/bake_heroes.mjs`, mark `e0ac1c19738f`: every sheet as written is read back as the game reads it and checked
against every frame on it as painted (the tool stops at a pixel's difference: none).

| group | frames | for places | sheets | packed | decoded (4 bytes a pixel) | to paint | live now (7883bd8a52c6) |
|---|---|---|---|---|---|---|---|
| cards | 471 | 471 | 1 | 0.18 MB | 5.9 MB | 41 s | the same |
| warrior | 2,504 | 4,217 | 3 | 1.20 MB | 38.4 MB | 86 s | the same |
| ranger | 7,253 | 8,668 | 7 | 3.24 MB | 96.5 MB | 468 s | the same |
| mage | 4,110 | 5,222 | 5 | 1.77 MB | 68.5 MB | 808 s | the same |
| warlock | 1,441 | 2,646 | 7 | 3.09 MB | 93.3 MB | 300 s | the same |
| **tinkerer** | **2,459** | 5,088 | 2 | **0.85 MB** | **26.0 MB** | 113 s | 612 frames, 0.21 MB, 6.5 MB |
| **brawler** | **9,666** | 42,992 | 13 | **4.06 MB** | **148.9 MB** | 435 s | 2,369 frames, 1.06 MB, 37.7 MB |

(Decoded: each frame's width by its height by four, summed from the bake's own files; the live column from the files on
`gh-pages` 689618f. The Tinkerer chat's estimates were 26.3 and 144.1 MB decoded, 1.0 and 5.3 MB packed.) The whole bake is
20.60 MB where the live one is about 16 MB.

## THE BRAWLER'S MEMORY, WEIGHED (in a browser here; NOT ON A PHONE)

The same sitting on the new page and on the live one (25.3.5, `gh-pages` 689618f, served from a copy), each alone on the
machine: `tools/scenarios/mem_floors.mjs` with `tools/mem_probe.js`, the hero in town, then floors 1 to 3 played by the bot
(`CLS=<hero> FROM=1 TO=3 PLAY=40 SPEED=6`, a phone held sideways, 844 by 390 at 3). What the page holds, in MB of 1,048,576
bytes: canvases + pictures handed over (ImageBitmaps: the heroes' baked frames and the side painter's) + decoded sound + the
script's heap.

| as it is come into | THE BRAWLER, EIGHT SIDES (new) | the Brawler, two sides (live) | the Ranger (live: the heaviest hero now) |
|---|---|---|---|
| town | 60 + 142 + 7 + 45 = **254** | 60 + 36 + 7 + 44 = 147 | 60 + 92 + 7 + 46 = 205 |
| floor 1 | 51 + 155 + 15 + 50 = **269** | 51 + 49 + 15 + 48 = 163 | 51 + 102 + 17 + 51 = 220 |
| floor 1, played | 62 + 225 + 21 + 53 = **361** | 68 + 119 + 21 + 51 = 259 | 61 + 174 + 22 + 55 = 312 |
| floor 2 | 67 + 179 + 27 + 55 = **327** | 73 + 74 + 27 + 54 = 227 | 65 + 127 + 28 + 56 = 276 |
| floor 2, played | 104 + 252 + 28 + 57 = **442** | 113 + 146 + 29 + 56 = 344 | 86 + 177 + 29 + 57 = 349 |
| floor 3 | 96 + 187 + 33 + 59 = **375** | 105 + 84 + 34 + 57 = 279 | 77 + 135 + 34 + 58 = 305 |
| floor 3, played | 127 + 258 + 35 + 62 = **481** | 107 + 140 + 35 + 59 = 341 | 96 + 193 + 35 + 61 = 385 |

What it says:

- HIS OWN PICTURES: 142 MB held from the moment he is first shown (9,664 pictures), where he holds 36 today (2,368) and the
  Ranger 92 (7,239). ABOUT 106 MB MORE THAN TODAY, ABOUT 50 MORE THAN THE RANGER, at every row, and it does not grow: the
  pictures handed over rise and fall with each floor's own by the same amounts on both pages.
- THE WHOLE PAGE: about 100 MB more than with today's Brawler at every row (95 to 141): two thirds more as he comes into
  floor 1, and between a quarter and a half more from then on (39, 44, 28, 34 and 41 in the hundred). Against the Ranger, 49 to
  96 MB more: a sixth to a quarter more.
- HIS CANVASES GO DOWN A LITTLE: no picture of his is mirrored now, so the mirror images the game makes of a two-sided hero as
  he faces left (`engine/px.ts` flipSprite: canvases, the small ones kept for good) are not made: 6 to 9 MB fewer canvases on
  floors 1 to 3 (the last row's 127 against 107 is the bot's sitting, not him: the floors' own canvases). Over a long
  sitting today's Brawler can grow by up to his own 36 MB again in mirror images; from eight sides he holds what he holds.
- THE TINKERER, the same way: her own pictures 25 MB where they are 6 (2,450 where 609); the whole page 289 MB as floor 3 is
  come into where it is 271 live. Less than any hero brought up so far.
- THE PROCESS itself (the browser's renderer, `ps`): 780 to 1,339 MB over the sitting with him from eight sides, 618 to 1,123
  with him live, 673 to 1,051 with the Ranger: about 100 MB more than his own today where the rows can be compared (it is a
  noisy number: a headless browser with no graphics card keeps every picture in that process).
- HIS FIRST LOADING SCREEN IS LONGER: his 9,666 frames are cut from their sheets in 1.3 to 1.4 s here (alone on the machine),
  where the live 2,369 take 0.33 s; the loading screen (which waits for a hero's pictures, `main.ts` loadingFrame) is up 1.8
  to 2.0 s where it is up 1.1 to 1.3 s. With a second playtest running beside it, 4.4 s. The Tinkerer's is 3.7 s where it is
  3.5 (her group takes about 3 s to come in on the live page too, with 612 frames, where the Ranger's 7,253 take 0.9 s: not
  looked into, not of this change).

HOW IT WAS READ. What froze his phone this month was canvases not given back from floor to floor (25.3.2 gives back 270 MB of
them by floor 6, where it now holds 77: the handoff's sitting; so about 350 MB of canvases before the fix). An iPhone's
browser keeps a limit of its own on canvases (384 MB on its recent versions, by what is written of it: the WebKit bug 195325
and those who met it), and that is about where the game was. The heroes' baked pictures are not canvases (ImageBitmaps),
and from eight sides he makes fewer canvases, not more; whether a phone counts baked pictures against that limit was not
checked. What he adds is plain memory, about 100 MB, held from the start and not growing; with him the page holds a sixth to
a quarter more than it holds with the Ranger, who is live. Nothing here says it is too much. NOT KNOWN: his phone. Nobody has played him from eight sides
on one, and the fixes of 25.3.2 and the sounds of 25.3.5 have not had his word from the phone either (the handoff's TO ASK
HIM), so a freeze after this goes live would have three things to look at.

IF HE MUST BE LIGHTER (not built): his action lines are more than half of it and a side at a time does not suit him (in a
fight he turns to all eight within seconds, so the sides held are soon all of them, or a blow thrown at a side not held
shows his stance for the third of a second its pictures take to come). What would: his moves kept packed and unpacked a
move at a time as it begins (a move's frames and lines are about a tenth of a megabyte packed; his stance and run for the
eight sides, 7 MB, always held), with the least lately thrown let go. That is a new bake layout and a new way in for his
frames (`render/baked.ts`, `art/heroes3.ts` give): a build of its own, with its own tests.

## PLAYED ON THE BUILT, BAKED PAGE (`node tools/build.mjs`, the release build, wrapped as the site serves it and served with its files: `tools/eight_sides_play.sh`)

Ten playtests, two at a time, the two sittings alone. ALL TEN FINISHED CLEAN at the end; two were flagged on the first run,
both the playtests' own:

- `sides_fight` (`tools/scenarios/sides_more_fight.mjs`, new; 120 checks, real touches, auto aim, a phone held sideways):
  - his pictures are the bake's: the group come whole, 9,666 frames taken in, none failed; EVERY FRAME OF HIS EIGHT SIDES IN
    HAND BEFORE HE FIGHTS (20,984 places with their picture, none without): none painted in play, none stood in for;
  - HIS BLOWS THE EIGHT WAYS AGAINST ENEMIES: a skeleton stood 17 degrees off each of his eight ways in turn, a tap: his jab
    faces the nearest of the eight, its force goes straight at the skeleton, it lands, and he is carried along the way he
    faces with nothing across it; eight jabs, eight different ways. Then straight down, left, up and right of the screen
    (the ways the game never drew): three taps, the jab, the cross and the hook, each facing that way, all three landing; and
    the round kick held, facing that way, landing;
  - HIS DODGE: a swipe each of eight ways on the screen: the jump spent, he faces the nearest of his eight ways to straight
    back along the swipe and springs away; eight swipes, eight different ways, carried as far each time (1.02 tiles back, 0.31
    to the side: the art's own step);
  - PROPS BROKEN BY A BLOW THROWN STRAIGHT LEFT AND STRAIGHT RIGHT (floor 2, attacks the way he faces): he is stood to the
    right of an urn and to the left of a barrel, faced at it, a tap: his jab faces straight left, straight right; the urn and
    the barrel are broken;
  - a frame while he fights: 16.7 ms in the middle, 22 ms at worst.
  Flagged on its first run by a check of this chat's own making (the game's count of frames painted in play is of anything,
  the skeletons' among them: it now counts his own lists instead).
- `veteran_play` (the regression's own of him): FLAGGED, THE PLAYTEST'S FAULT, MENDED, CLEAN. Two things. It tapped a second
  and a half after asking for him, and his pictures from eight sides keep the loading screen up longer than that: the taps
  went nowhere (it now waits for the screen, as `save.mjs` was mended to for 25.3.2). And its head says auto aim, but nothing
  set it: it was played with the playtests' own "where the thumb taps", the thumb down straight to the right of him and the
  skeletons stood down and to the right, and his blows found them only because his picture faced the nearest of FOUR ways
  and carried him at them. From eight sides he faces and is carried where the thumb aimed, as he should. It now sets auto
  aim, as its head says.
- `look_tinkerer_sides`, `look_brawler_sides`, `look_tinkerer_moves`, `look_brawler_moves` (the Tinkerer chat's
  `sides_more_look.mjs`, on floor 11, FROM THE BAKE): each standing from the eight sides, and a move of each at its blow thrown
  the eight ways (his cross with its lines; her vial tossed): looked at, each side its own picture, his lines laid the way
  he faces. Not sent to him: he has these from the Tinkerer chat.
- `guide_phone_warrior`, `touch_wide`: the heroes' bake is a new one for every hero; a new player's first dungeon with the
  Warrior and the game's touch ways, clean.
- `mem_brawler`, `mem_tinkerer`: the sittings above, clean. A FRAME'S WORK WHILE THE BOT FOUGHT WITH HIM: 6.2, 6.4 and 6.7 ms
  in the middle on floors 1, 2 and 3 (live: 6.0, 6.5, 6.7). Frames of over 50 ms: 1, 14 and 43 (live: 0, 14 and 3), the
  longest 353 ms, on floor 3. So floor 3 was played again alone, twice on each page: 30 and 65 such frames new (the longest
  198 and 446 ms), 29 and 28 live (193 and 236 ms); in the middle 6.2 and 7.2 ms new, 6.9 and 7.1 live. The sittings differ
  from one to the next as much as the pages do: nothing in it points at his pictures, and it is not proof either.

NOT PLAYED: a phone. A whole run. The regression.

## The unit tests (his rules: only what the change is about, and the core)

`node tools/unit.mjs --only sides_more,veteran_art,veteran_rules,veteran,vet_props,veteran_talents,veteran_words,veteran_icons,brawler,brawler_moves,brawler_talents,cheap_heroes,gpu_sculpt,class_cards_paint,baked,tinkerer,tinkerer_moves,tinkerer_talents,talents,words`
on 559b2c2563 (the switches on, the tests put right, the playtests; only this file and the records came after), run once,
alone on the machine: **41 files, 625 tests, all passed** (the twenty named and the core's 23, two of them the same; 382
files not run). The named ones: the Tinkerer chat's nine, the test files that take in a file of the game's this change
touches (`unit.mjs --changed`'s own rule: brawler, brawler_moves, brawler_talents, gpu_sculpt, talents, vet_props,
veteran_talents, veteran_words, words), and veteran_icons and tinkerer_talents.

`tsc --noEmit`: clean (and `tests/relief.test.ts(378,16)`, which the Tinkerer chat met on its branch, is clean on `main` now).

## FOUND, NOT MENDED (in the queue as `aim-brawlers-held-kick-under-auto-aim`): A HELD KICK UNDER AUTO AIM GOES THE WAY HE FACES

Under auto aim a hold of his is not aimed at the enemy auto aim is locked on: `main.ts` gives a hold's place as `castX`,
`castY` and `game.ts` vetAimOf reads `aimX`, `aimY`, which under auto aim is a tile ahead of him. Played on the live page
(25.3.5), he facing down-right and one skeleton locked on: ahead of him, the round kick lands; behind him or to his left, it
is thrown at nothing. So it is with his four ways and with his eight. In play his punches have mostly turned him to the
enemy before he kicks, so it shows when a kick is the first press. `sides_more_fight.mjs` holds its kicks with him faced
at the enemy and says why.

## His answer on the Brawler's switch

ASKED OF HIM as a pop-up, 11 Nov 2026, after 21:16 (Eastern): “The Tinkerer and the Brawler from eight sides are baked, played
and ready on a branch for the main chat (nothing is live yet). The Brawler's eight sides hold about 150 MB of pictures, where
he holds about 38 today and the Ranger, the heaviest hero now, about 97. In my test browser the whole game held about 100 MB
more with him. I can't try your phone from here. Switch the Brawler on with the Tinkerer?” Offered: “Yes, switch him on
(Recommended)” (both go to the main chat switched on; if his phone stutters or freezes with him, he says so and he goes back
to two sides); “A test page first” (a private page of the game with both from eight sides; he plays the Brawler a few floors
on his phone and says how it runs before he goes live); “Tinkerer only, for now” (the Brawler stays as he is until his
pictures can be loaded a lighter way, a longer build).

**HIS PICK, by 21:25: “A test page first”.**

THE TEST PAGE, published 21:25 to 21:28: https://claude.ai/artifact/EPxkp4u3wkrbWwRnD593iW (“Wordsmith test page: eight
sides”, version `1794450514-3eb7`; his alone; a page of its own, NOT the game's page, and it keeps a save of its own: his
game and his save are untouched). Made by `node tools/eight_sides_try_page.mjs` after the release build: `dist/try_eight/`,
208 files, 182.8 MB: `index.html` (the release's page fragment built again with the stamp TEST EIGHT SIDES 2026-11-11 in the
corner of the starting screen and a title of its own, wrapped as the site serves it) and beside it `heroes/e0ac1c19738f/`
(45 files), `sounds/3c87436f2f66/` (49) and `colossus/7cf0996e564d/` (113), sent in four publishes. The sounds' and the
Colossus's files and 23 of the heroes' sheets are the live site's own, byte for byte; the fifteen new sheets (brawler-0 to
12, tinkerer-0 and 1) were looked at. Played once as it is published, served from its folder: `sides_more_fight` clean, 120
checks; its starting screen photographed, the stamp on it. The published files' sizes and hashes read back: 208, the five
compared the same as built.

TOLD HIM: the page is in the chat; on its starting screen Options, the level select, a floor and the Brawler give a test hero
there; play a few floors, turning and fighting every way, and say how it runs: smooth, stutters, or freezes; the first
loading screen with him is a little longer; nothing is live.

**HIS WORD FROM THE PHONE: NOT YET.** MAIN: until it is written here, the Brawler's switch does not go live. This chat holds
the queue's item meanwhile and puts it back when he has answered.
