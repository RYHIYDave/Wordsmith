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

## WHAT WOULD MEND THE HERO CARDS (not built: a build of its own, with a new bake)

- The cards asked for from the bake as the title comes up, not as the cards are shown; all six heroes left to the bake where
  the page has it. No picture changes.
- The cards' gestures and make-ready clips put into the bake's cards group (a new bake: the mark changes), so that nothing
  on the title is painted where the game is drawn. No picture changes. OR, with his yes, since it changes what the cards
  show: no gestures on the cards.
- Whether more baked pictures at the title are cheap on his phone is what the phone check's trial answers: if making a
  picture a frame is slow there, the sheets are to be kept whole and drawn from first (a change to how a Sprite is drawn),
  and then baking more costs nothing.
