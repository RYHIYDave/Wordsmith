# THE PHONE CHECK: WHY THE GAME LAGS FROM ITS TITLE SCREEN ON, MEASURED (11 Nov 2026)

The Eight-sides merge chat (a new chat of his, working from the queue). The queue's `measure-lag-on-his-phone`. Tools on the
branch `test/phone-check` (not for `main`): `tools/phone_check/recorder.js`, `tools/phone_check_page.mjs`,
`tools/scenarios/phone_check_try.mjs`, `tools/scenarios/title_profile.mjs`.

## His words

To this chat, 11 Nov 2026, asked by pop-up how the Brawler ran on the eight-sides test page on his phone; he wrote his own
answer (between 22:10 and 22:23, Eastern):

> “First of all the title screen lags.  It’s the first thing you see.  How can it lag?  Then, character screen lags.  Selecting a character lags.  60 SECOND LOAD TIME to enter THE TOWN.  There’s not even a single enemy in the town why in gods name would I take that long to load”

And at 22:23: “THE LOADING SCREEN LAGS”. Asked by pop-up whether to make a page that times itself on his phone and sends the
numbers: “Yes, make it (Recommended)” (by 22:36).

## The page for his phone

https://claude.ai/artifact/7Wu15vuPMZHJb2ZsbSBZ65 (“Wordsmith phone check”; his alone; a save of its own). It is the
eight-sides test page's build again (`bring-in/eight-sides` at 0925c57: 25.3.5 with the Tinkerer and the Brawler from eight
sides, bake e0ac1c19738f, the stamp PHONE CHECK 2026-11-11) with the recorder's script put in before the game's own. 95 files:
`index.html`, `heroes/e0ac1c19738f/` (45) and `sounds/3c87436f2f66/` (49); the Colossus's files are left out (he is not met on
the way to town). The sounds are the live site's own byte for byte; the heroes' files the bake branch's byte for byte; the
thirteen sheets of the Brawler that are not live were looked at.

TOLD HIM: open it, NEW GAME, pick the Brawler, CONFIRM, stand in town; after about 8 seconds a box at the top says it is
measuring, then PHONE CHECK DONE.

**EVERY VISIT WRITES ONE DOCUMENT to the page's own database: `runs/<id>`** (read with the ArtifactData tool, collection
`runs`, on that page). In it: `device`; `segs`, one for each screen in turn (`title, N taps`, `title: a hero picked`,
`loading: town`, `town`, then the trial's steps), each with how long it was up, the frames drawn, the longest wait between
two frames (`gapMax`), a count of waits by length (`gaps`: under 20, 34, 50, 100, 200, 500, 1000 ms, and over), the time in
the game's own frame (`workSum`, `workMax`), the pictures made (`made`, of them cut from a sheet `cut`, the time each waited
`madeWait`), what the workers handed over (`fromWorkers`, `msgMs`), sounds decoded, canvases made, images drawn, pixels read
and put, how late a tenth-of-a-second clock rang (`late`), and the loading screen's own clock (`gameT`); `baked` (the game's
own count: frames given, and how long each group took); `long` (every wait over 150 ms, and when); `ticks` (every 2 s);
`files` (the browser's own record of what was fetched); and `trial`.

THE TRIAL, once he has stood in town 8 seconds (480 frames of 64 by 72 from one sheet, the browser's own doors):
`cutMs`, a picture made for every frame, 48 at once, as `render/baked.ts` makes the heroes'; `oneMs`, 60 of them one at a
time; `drawCut` and `drawSheet`, the 480 drawn from the cut pictures and straight out of the sheet (the middle and the worst
of six goes, each made to finish); `canvasMs` and `drawCanvas`, a small canvas a frame instead; `worker`, 240 pictures made in
a worker and handed over, as the side painter hands its own.

## WHAT WAS FOUND HERE BEFORE HIS PHONE SAID ANYTHING (Chrome on a two-core cloud machine; a phone's screen, 844 by 390 at 3)

`tools/scenarios/phone_check_try.mjs`: the page played as he is asked to play it, with real touches. THE SAME ON THE LIVE
GAME'S OWN PAGE (25.3.7, the files of `gh-pages` f30b0404 served from a folder, the recorder put before it with `--init`).

| screen | the test page (both from eight sides) | the live game, 25.3.7 |
|---|---|---|
| before the first frame | 3.3 s | 3.1 s |
| the title | 4.2 s, 59 frames a second, the game's frame 7.2 ms | 4.2 s, 58 a second, 8.0 ms |
| THE HERO CARDS | 5.7 s, **3 frames a second**, the game's frame **366 ms**, the worst 1,008 ms | 6 s, **3 a second**, **365 ms**, the worst 953 ms |
| A HERO PICKED | 1.5 s, 3 a second, 288 ms | 1.6 s, 3 a second, 316 ms |
| the loading screen into town | 4.5 s, the worst wait 1,426 ms; 9,679 pictures made; its own clock 1.4 s | 3.4 s, the worst wait 1,501 ms; 4,856 pictures made |
| the town | 116 frames a second, the game's frame 2.8 ms | 118 a second, 2.0 ms |

1. **THE HERO CARDS: THE GAME SCULPTS HEROES ON ITS OWN THREAD WHILE IT SHOWS THEM, AND IT NEVER STOPS.** The browser's own
   profiler (`tools/scenarios/title_profile.mjs`, a readable build): of 14.7 s on the cards, 14.8 s were spent painting:
   `drawTitle` > the card's `frame` > `standingFrame` > the lazy frame's `get` > `muSprite` (the Mage, 9.3 s), `ruSprite` (the
   Ranger, 2.8 s), `wuSprite` (the Warrior, 0.8 s): `src/dev/sculpt.ts`. Two things:
   - the three older heroes are sculpted since they were redrawn, and `main.ts` leaves only the Warlock, the Tinkerer and
     the Brawler to the painter on the cards (`if (k !== 'warlock' && k !== 'tinkerer' && k !== 'brawler') continue;`), so
     until the bake's cards group has come, every standing frame of the other three is painted as it is shown; and the
     group comes late because the thread is busy painting (3.6 to 4.2 s here);
   - THE BAKE'S CARDS GROUP HOLDS ONLY STANDING AND RUNNING (`render/baked.ts` bakedPlaces, `card`). The heroes' standing
     gestures (`idleA`, `idleB`: they begin 5 to 9 s after a hero stands, `render/figure.ts` GESTURE_GAP) and the
     make-ready clip of the hero picked (`clips.ready`) are not in it: they are painted frame by frame as they play, about a
     third of a second a frame for the Mage here.
   A HERO PICKED is the same: the others' gestures already begun, and the picked hero's make-ready clip (the Mage's: 2.3 s
   of 4.7 s in `paintMageUp`).
2. THE LOADING SCREEN: one wait of about 1.5 s (the level's own pictures made in one frame: 1,274 to 1,313 canvases, some
   1,250 `putImageData`), and the hero's frames cut one by one beside it (9,666 for the Brawler from eight sides: 3.1 s for
   his group; live, his 2,369 and the townsfolk's 2,481).
3. THE 60 SECONDS, FROM THE CODE: the loading screen waits for the hero's group, or for `LOADING.most`, 15 s of the game's
   own clock; a frame's `dt` is never over 0.05 s; so 15 s is 300 frames at the least, and at 5 frames a second 60 s.
4. THE TRIAL HERE (Chrome): `cutMs` 14.4 to 19.3 for 480; `oneMs` 2.1 to 2.7 for 60; `drawCut` 3.8 to 4.4, `drawSheet` 4.8
   to 5.2; `canvasMs` 50; the worker's 240 in 43 to 45 ms. In Chrome none of it costs anything. WebKit's own bug reports say
   an iPhone's browser is slow at making and handing over ImageBitmaps (bugs 280601, 234920): his phone's run will say.

## HIS PHONE, MEASURED FOR THE FIRST TIME (12 Nov 2026, 05:38 to 05:41 Eastern)

His word, 12 Nov, 05:42: “Ran it”. An iPhone, iOS 18.7, in the Claude app (`Claude/1.261030.19`), the page in a frame, 3
screen pixels to one; LOW POWER MODE ON (asked by pop-up: “Yes, it was on”). Four documents in the page's `runs`:

| run | what it holds |
|---|---|
| `rmwdezp7zehs` | the page opened: 2.9 s before the first frame, and no more |
| `rmwdezy3w777` | held upright. The title, NEW GAME, the hero cards, the Brawler picked, 21 s of the loading screen; then nothing more: THE PAGE RESTARTED ITSELF (asked by pop-up: “It restarted itself”) |
| `rmwdf0wjhvl8` | held sideways. The title, CONTINUE, 19 s of the loading screen; then the page restarted itself again |
| `rmwdf1s8danp` | held sideways. The title, CONTINUE, the loading screen to its end, the town, the trial. THE WHOLE RUN |

**THE LOAD INTO TOWN, the Brawler from eight sides (`rmwdf1s8danp`): 74.4 s.** His group, by the game's own count: 9,666
frames in 73.8 s. **68.5 s OF IT INSIDE `createImageBitmap` ITSELF, ON THE GAME'S OWN THREAD**: 9,679 calls (9,666 of them a
frame cut from its sheet), 7.1 ms a call. 100 frames were drawn in those 74 s; thirteen waits between two frames were over
a second; the longest 9.1 s, then 7.9, 7.7, 7.6, 6.9, 6.9, 7.8, 5.5: a sheet's frames go through in one go (the batches of 48
give no frame a turn between them). The loading screen's own clock had counted 3.1 s when it lifted: it did not give up at
its 15 s; it waited for the group, and the group took that long. (So the reading above, 5 frames a second for 60 s, was
wrong in its detail and right in its cause.) The same group on the cloud machine: 3.1 s.

The two runs that ended in the loading screen: 2,256 frames cut (the first two sheets, 1,114 and 1,142), 8.2 and 7.7 ms a
call, waits of 10.0 and 8.8 s, and of 9.4 and 8.2 s; then the page restarted itself.

**THE HERO CARDS** (`rmwdezy3w777`): 6 frames in 3.3 s, the game's own frame 283 ms and 611 ms at worst; the cards group's 471
frames 2.9 ms a call; the title's music decoded meanwhile (3.3 MB, 1.6 s). A HERO PICKED: 10 frames in 2.1 s, the game's
own frame 203 ms. As found here: the heroes sculpted on the game's own thread as their cards are shown.

**THE TITLE AND THE TOWN: EXACTLY 30 FRAMES A SECOND** (the waits between frames 33 and 34 ms, two of one to one of the
other, as a clock of a thirtieth of a second read to the millisecond gives), the game's own frame 1 ms on the title and 3.5 ms
in town. An iPhone's browser holds a page to 30 a second in Low Power Mode, and a page in another site's frame until it is
touched (WebKit bugs 168837, 170534): not the game's. Before the first frame: 2.9 s, the clock 2.7 s late.

**THE TRIAL ON HIS PHONE** (480 frames of 64 by 72 from one sheet; Chrome on the cloud machine beside it):

| | his phone | Chrome here |
|---|---|---|
| a picture made for every frame, 48 at once (`cutMs`) | 650 ms | 14 to 19 ms |
| 60 of them, one at a time (`oneMs`) | 109 ms | 2.1 to 2.7 ms |
| the 480 drawn from the cut pictures (`drawCut`) | 10 ms | 3.8 to 4.4 ms |
| the 480 drawn straight from the sheet (`drawSheet`) | 10 ms | 4.8 to 5.2 ms |
| a small canvas cut for each of the 480, two frames waited for in it (`canvasMs`) | 66 ms | 50 ms |
| the 480 drawn from those canvases (`drawCanvas`) | 11 ms | 3.7 to 4.7 ms |
| 240 pictures made in a worker and handed over (`worker.ms`) | 257 ms, 220 of it the worker's own making | 43 to 45 ms |

SO: making an ImageBitmap for every baked frame is what his phone cannot do (and the real sheets cost five times the
trial's: 7.1 ms a frame against 1.4). Drawing from the sheet, or from a small canvas cut from it, costs it nothing more.

FOR THE LIVE GAME, WORKED OUT at 7 to 8 ms a frame, NOT MEASURED: the Warrior's 2,504 frames about 18 s, the Ranger's 7,253
about 50 s, and the townsfolk's 2,481 with any of them (`render/townsfolk_baked.ts` cut them the same way, live since
25.3.7).

## THE MEND: THE BAKED FRAMES KEPT IN THEIR SHEETS (the branch `fix/frames-from-sheets`, de6fea61, from `main` 9f3cf44)

His word, 12 Nov, by 05:47, asked by pop-up whether to build it: “Yes, build it (Recommended)”. The queue's
`keep-baked-frames-in-their-sheets`.

`engine/px.ts` sheetSprite: a baked frame's Sprite knows its sheet and where it is on it; its `img` is cut from the sheet (a
small canvas, as a painted frame's is) the first time something asks for it; the cut ones in hand are kept to 24 MB, the
least lately asked for let go of and cut again when asked for. `render/baked.ts` and `render/townsfolk_baked.ts` hold the
sheets whole: the only pictures the browser is asked for are the sheets. Nothing that draws a Sprite is changed. NO PICTURE
CHANGES, NO NEW BAKE (the heroes' mark and the townsfolk's are `main`'s, each made from the branch's code).

CHECKED HERE (Chrome): tsc clean; unit --only baked, figure, memory_floors, sheet_sprite, townsfolk3, townsfolk_baked and the
core on de6fea61dc: 28 files, 331 tests, all passed. On the release build of the branch with the live site's own bakes
(heroes 0ed837378e63, townsfolk d4c898fe370d), served, a phone's screen: `tools/scenarios/sheet_frames.mjs` for each of the six
heroes, 10 checks each, none flagged: EVERY PIXEL of a frame as it is given now against the picture made the old way, 307 to
361 frames of each hero and 310 of the townsfolk's, none unlike; the browser asked for a picture only for each sheet; every
frame asked for in turn, never more than 24 MB cut in hand. `townsfolk_baked.mjs` (they come from the files, are let go of
as he goes down, come again), `baked.mjs` (the Warlock), `veteran_play.mjs`, `guide.mjs` (the Warrior's first dungeon):
finished clean. WHAT THE SHEETS HOLD (their pixels, four bytes each): the Warrior 48 MB, the Ranger 109, the Mage 74, the
Warlock 105, the Tinkerer 30, the Brawler 53 (from eight sides, 13 sheets: about 200), the cards 7; and up to 24 MB of
frames cut. A hero's frames cut one by one were the sum of the frames: the sheets are more, for the room between frames on
a sheet (the Ranger 109 MB against 97, the Tinkerer 30 against 26, the Brawler 53 against 38: 13% to 41% more; the others'
sums were not to hand).

**THE SECOND PHONE CHECK**: the same page (his link and his save there are the same), the same test build with the mend
(`bring-in/eight-sides` 0925c57 with the branch's `engine/px.ts` and `render/baked.ts`; the bake's mark still e0ac1c19738f),
the stamp PHONE CHECK 2; the recorder `v` 2 also asks, of the hero's own frames on his phone: every pixel against the old
way, what the old way costs on the real sheets, and what frames not yet cut cost to be asked for. HIS RUN CAME 12 Nov, 06:40
(the next section).

## HIS PHONE WITH THE MEND (12 Nov 2026, 06:40 Eastern): THE LOAD INTO TOWN 6.7 s WHERE 74.4 s

His word, 06:40: “Ran it”. The run: `runs/rmwdh7eupd67` on the phone check's page (`v` 2, `fix` true; begun 11:40:04 UTC,
34.5 s long; a visit of 4 seconds before it, `rmwdh6t5b3f`). The same iPhone (iOS 18.7, in the Claude app, the page framed,
four cores, 393 by 852 at 3), the same hero (the Brawler from eight sides), the same test build, with the mend. Low Power
Mode was on at the first run by his word; he was not asked again (the title and the town ran at 30 frames a second, as
iOS holds a page in Low Power Mode).

| | the first run (`rmwdf1s8danp`) | with the mend (`rmwdh7eupd67`) |
|---|---|---|
| the loading screen into town | 74.4 s | 6.7 s (106 frames) |
| pictures the browser made in it | 9,679 | 13 (the sheets), none cut from a sheet |
| time inside the calls that make them | 68.5 s | 4 ms |
| waits over a second in it | thirteen, the longest 9.1 s | two: 1,718 ms and 1,413 ms |
| the page | restarted itself twice before | no restart; no error |

- THE HERO'S OWN FRAMES ON HIS PHONE (`trial.real`): 9,665 frames in his lists; 121 of them, as given now, against the
  picture made the old way from the same sheet: NONE UNLIKE, every pixel. The old way cost 1,317 ms for those 121 (10.9 ms a
  frame on the real sheets). 400 frames not yet cut, asked for and drawn: 275 ms (0.7 ms a frame).
- THE TOWN AFTER IT, 8 s: 242 frames (30 a second), no wait over 52 ms, the game's own frame 6.8 ms a frame
  (1,634 ms over 242), 33 ms at worst. 705 frames cut and in hand (2,312,380 pixels, 9 MB), none let go of.
- WHAT IS HELD: 14 sheets (the Brawler's 13 and the cards'), 52,241,916 pixels, four bytes each: 209 million bytes.
- The group's own clock (`baked.ms`): the Brawler 5,284 ms (of it `brawler.json` 1,977 ms in coming), the cards 2,361 ms.
  The loading screen's own clock read 3.2 s.
- The trial as before, for the record: a picture for each of 480 frames, 48 at once, 836 ms; 60 one at a time, 100 ms;
  drawn from cut pictures 6 ms a round (78 at worst), straight from the sheet 5 (6), from small canvases 7 (14); a small
  canvas cut for each, 131 ms; 240 made in a worker and handed over, 254 ms.

STILL SLOW IN THAT RUN, NOT OF THE MEND:

- THE HERO CARDS, 9.2 s in all, 38 frames, from his first touch on the title to the fourth, which began the load: after
  the first, 4.8 s and 15 frames (the game's own frame 302 ms a frame, 1,012 ms at worst; one wait of 1,160 ms); after the
  second, 1.2 s and 6 frames (195 ms a frame); after the third, 3.2 s and 17 frames (183 ms a frame). 3 to 5 frames a
  second, as measured here in Chrome and for the same cause (the next section; the queue's
  `stop-hero-cards-sculpting-heroes`). The title before the first touch: 40 frames in 1.3 s, no wait over 98 ms.
- TWO LONG FRAMES UNDER THE LOADING SCREEN (the queue's `smooth-the-loading-screens-long-frames`): 1,718 ms, the game's own
  frame 1,692 ms of it: the level's own pictures made in one frame (in that screen 1,359 canvases made, 1,311 putImageData
  taking 1,036 ms, 233 getImageData taking 157 ms); and 1,413 ms as the screen lifts, NOT in the game's own frame and NOT
  PINNED DOWN (to look at first: the hero's frames given into his lists a sheet at a go).
- Before the title's first frame: 2.9 s (519 canvases made, 501 putImageData taking 282 ms).

TOLD HIM (by 06:44): fixed on his phone, 74 seconds to under 7; the hero cards and the two hitches still slow; the fix handed
to the main chat to bring in and publish. HANDED TO MAIN: the queue's `keep-baked-frames-in-their-sheets`, put back waiting,
and the chat board.

## THE HERO CARDS MEND (the branch `fix/hero-cards-from-bake`, 4f49c885: on `fix/frames-from-sheets` de6fea61)

His word, 12 Nov, by 06:48, asked by pop-up whether to build it next: “Yes, build it (Recommended)”; and at 07:41: “Go”.

WHY THE CARDS WERE SLOW, found as it was built: the bake's cards group held only each hero's FRONT standing and running, and
a hero painted from eight sides (the Warrior, the Ranger, the Mage) is seen on his card from the side for the way he faces
there (`toward`), not his front: so NOTHING their cards showed was in the bake; every frame of theirs was painted where the
game is drawn, as it was shown. And of every hero, what he does left standing, his coming to a stand out of his run and his
making ready were in no bake.

WHAT IT IS: `art/heroes3.ts` cardLists, everything a card shows; `render/baked.ts` bakedPlaces bakes it all for a card (1,261
frames for 1,278 places on 2 sheets, 4,793,320 pixels, where 471 frames on one); his making ready a list of its own
(READY_LIST, the last: every other keeps its place), a card's only; the cards' group asked for as the game starts, all six
heroes left to it on their cards, their gestures held until it has come. Where there is no bake, as before. NO PICTURE
CHANGES. THE NEW BAKE, 50c0ea6dc501 (on GitHub as `bake/50c0ea6dc501`, 37 files, 17.11 MB): every hero's own sheets the same
as main's byte for byte; only the cards' are new.

CHECKED HERE (Chrome): tsc clean; unit --only baked, hero_cards_baked (new), class_cards_paint, figure, heroes3, heroes,
reflections, sheet_sprite, sides_more, veteran_art, title, cheap_heroes and the core on db26d64ce0: 33 files, 371 tests, all
passed. On the release build, served, a phone's screen: `tools/scenarios/hero_cards_baked.mjs`: the cards' group came in 639 ms
with nothing pressed; the cards up 14 s, 53 frames a second, no wait over 83 ms, NOTHING PAINTED, nothing stood in for; every
card chosen in turn, nothing; the Mage made ready, nothing. With the cards' file held back 6 s (SLOW=6): one frame of each hero
painted while it was awaited (6, 1,383 ms), nothing after. `phone_check_try.mjs` on the third page, the Mage: the title and the
cards, 0 painted on every screen; her group whole; 122 of her frames every pixel the same.

**THE THIRD PHONE CHECK** (12 Nov, 12:58 UTC): the same page and link, `PHONE CHECK 3`, the recorder `v` 3 (each screen also
counts what the game painted on its own thread: `painted`, `paintMs`, `stoodIn`). THE GAME AS IT WOULD GO LIVE: the release
build of `fix/hero-cards-from-bake`, its bake beside it, the townsfolk's (d4c898fe370d) and the sounds (90 files). Told him to
pick the Mage. HIS RUN IS AWAITED.

## WHAT WOULD MEND THE HERO CARDS (as first written, before it was built)

- The cards asked for from the bake as the title comes up, not as the cards are shown; all six heroes left to the bake where
  the page has it. No picture changes.
- The cards' gestures and make-ready clips put into the bake's cards group (a new bake: the mark changes), so that nothing
  on the title is painted where the game is drawn. No picture changes. OR, with his yes, since it changes what the cards
  show: no gestures on the cards.
- Whether more baked pictures at the title are cheap on his phone is what the phone check's trial answers: if making a
  picture a frame is slow there, the sheets are to be kept whole and drawn from first (a change to how a Sprite is drawn),
  and then baking more costs nothing. ANSWERED, 12 Nov: it was slow, the sheets are kept whole (the mend above), and on his
  phone the cards' group with the mend made one picture, its sheet: more frames in that group cost him a bigger sheet and
  nothing a frame.
