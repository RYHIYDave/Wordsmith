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
frames cut. A hero's frames cut one by one were the sum of the frames (the Brawler 38 MB, the Ranger 97): the sheets are 3%
to 40% more, for the room between frames on a sheet.

**THE SECOND PHONE CHECK**: the same page (his link and his save there are the same), the same test build with the mend
(`bring-in/eight-sides` 0925c57 with the branch's `engine/px.ts` and `render/baked.ts`; the bake's mark still e0ac1c19738f),
the stamp PHONE CHECK 2; the recorder `v` 2 also asks, of the hero's own frames on his phone: every pixel against the old
way, what the old way costs on the real sheets, and what frames not yet cut cost to be asked for. HIS RUN IS AWAITED.

## WHAT WOULD MEND THE HERO CARDS (not built: a build of its own, with a new bake)

- The cards asked for from the bake as the title comes up, not as the cards are shown; all six heroes left to the bake where
  the page has it. No picture changes.
- The cards' gestures and make-ready clips put into the bake's cards group (a new bake: the mark changes), so that nothing
  on the title is painted where the game is drawn. No picture changes. OR, with his yes, since it changes what the cards
  show: no gestures on the cards.
- Whether more baked pictures at the title are cheap on his phone is what the phone check's trial answers: if making a
  picture a frame is slow there, the sheets are to be kept whole and drawn from first (a change to how a Sprite is drawn),
  and then baking more costs nothing.
