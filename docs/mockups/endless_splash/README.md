# Endless mode's splash, painted: the stair with no bottom (his pick), and the hall of gates

Branch `art/endless-splash`, cut from `main` at 797f2e4 (25.3.1). The art chat (the queue chat that pulled the item "Paint the endless mode splash screen"), 11 Nov 2026. **A MOCK-UP BEHIND A SWITCH THAT IS OFF**: `ENDLESS_SPLASH.on` (src/art/endless_splash.ts); `ENDLESS_SPLASH.picture` says which of the two painted pictures it shows: `'stair'`, his pick, or `'hall'`. With it off the game is as it was: the splash painted in code by the main chat (25.2.8).

Asked for by the main chat on the chat board, 8 Nov 2026, 08:40: “PLEASE DRAW IT: the whole screen of a phone held sideways (it must also fill a wider screen), its moment as the splash comes up (1 to 2 s of it moving is welcome: the game plays what you hand back), the word ENDLESS in it or left to the game to letter over it (say which).” The owner's words for the fanfare, 7 Nov 2026, 14:54: “I’d like a little more fanfare for endless mode.  Like a big splash screen and a pop up description of what endless mode is.” His answer to the main chat's pictures of the splash painted in code, 8 Nov by 08:36: “Yes, art chat splash later (Recommended)”.

## His word on it

Shown him on 11 Nov 2026, about 08:05 (Eastern): `pictures/endless_splash.png` and `pictures/endless_splash.mp4`, and asked whether it was right. **His answer, by 08:17: “Gimme 10 options”.** Read as with the start screen's ten (21 Oct, `src/dev/title_options.ts`): ten stills, each a different direction, painted small and not yet moving, each with a line of what would move in it; the one he picks is painted full size and given its moment. The hall of gates is the first of the ten, as it is painted.

**THE TEN** (`src/dev/endless_options.ts`; `options/option_01.png` to `option_10.png`, sent him about 08:20). **HIS PICK, by 08:30: “2 The stair with no bottom”.** It is painted full size with its moment (below, "The stair with no bottom"): `pictures/endless_stair.png` and `pictures/endless_stair.mp4`, shown him about 08:40. **His yes to it: not yet given.**

1. THE HALL OF GATES (the one painted here).
2. THE STAIR WITH NO BOTTOM: straight down a round shaft, ring under ring of every floor's stone, a stair winding down its wall, the enemy's fire at the bottom.
3. THE ROAD GOES ON: night, the start screen's hills, a road of flags from the waypoint through gate after gate to a pass in the mountains, the enemy's light behind it like a wrong dawn.
4. THE TOWER OF EVERY FLOOR: a tower with no top, each storey another floor's stone, up through the clouds.
5. EVERY FLOOR AT ONCE: the game's own view from above, room after room of every floor to every edge, the waypoint in the middle, eyes in the far rooms.
6. THE SERPENT THAT EATS ITS TAIL: a ring of old stone, a serpent swallowing itself, the word inside it.
7. THE BOOK WITH NO LAST PAGE: the book he fell asleep over, its pages lifting off and winding away into the dark, each a floor.
8. THE HORDE WITHOUT END: the dark full of the enemy's eyes, row behind row to the horizon; one blade alight before them.
9. THE WHEEL OF FLOORS: a great stone wheel, a floor to every spoke, a pointer over it.
10. THE SHAFT THROUGH THE WORLD: the ground cut open from the side, floor under floor, the mine's cage going down through them all.

The hall of gates stays on this branch, painted, behind the same switch (`picture: 'hall'`), not shown. Nothing here goes live before his yes.

## The stair with no bottom (his pick)

`src/art/endless_stair.ts`. **The picture:** we stand on the brink of a round shaft and look straight down it. Storey under storey, each of another floor's own stone (the town's at the top, then the prison's, the canyon's, the fen's, the High City's, the quarry's, and round again), each with its doorway (the prison's barred) and a torch by it; a stair winds down the wall, a storey and a half to a turn, past every door. At its head, on a round landing, lies the town's waypoint, awake, seen from straight above (its eight wedges, ring, eight marks, small ring and disc, its light going round). At the bottom, where the storeys close to a point, the enemy's pink burns to gold. No one is in it.

**The word is lettered by the game**, across the top of the shaft; the picture is made quieter under it (the dark laid over its top in flat bands as the game draws it). **Its moment** is the hall's, second for second (`ES_MOMENT`): the torches take storey under storey, down and down, faster and faster, each with a warm flash, a kick and dust falling away down the shaft; the fire at the bottom flares; ENDLESS lands; THE WAY GOES ON; HARDCORE.

**Every screen:** the same 720 x 360 game pixels at the fine grain, the shaft's middle at the middle of the screen across and 0.62 of the way down. On a screen much narrower than a phone held sideways (a tablet, 394 x 274) the waypoint's landing is cut by the left edge.

Pictures: `pictures/endless_stair.png` (his phone), `endless_stair.mp4` (its 3.2 s), `endless_stair_waking.png` (0.43 s in), `endless_stair_wide.png` (688 x 288).

## The hall of gates (painted first; kept, not shown)

## The pictures

- `pictures/endless_splash.png`: the splash whole, on his phone held sideways (507 x 234 game pixels, every picture pixel two across).
- `pictures/endless_splash.mp4`: its 3.2 s as the game plays it, 30 frames a second, the same size.
- `pictures/endless_splash_waking.png`: a moment of the gates waking (0.43 s in).
- `pictures/endless_splash_wide.png`: on a very wide screen (688 x 288 game pixels).

## What it is

**The picture.** A great gateway seen from just outside it: its lintel, one slab of the standing stones' violet, across the top of the screen; a torch on each pier (honest orange fire). Through it a hall runs straight away from us for ever, gate after gate, each of another floor's own stone, taken from that floor's own file: the prison's (its portcullis drawn up, a chain and an empty shackle on each wall), the canyon's (rough rock), the fen's (moss and hanging roots), the High City's (marble, a blue band laid in), the quarry's (one hewn stone across two), and round again, never the same twice running. Just inside lies the town's waypoint, awake, as the game draws it (eight wedges, the ring, the eight marks, the small ring, the disc): its cyan lights the first gates. Far down, where the gates close to a point, the enemy's pink burns to gold, and lies on the wet floor. No one is in it.

**THE WORD IS LETTERED BY THE GAME, NOT PAINTED.** ENDLESS, in the game's own letters and the colours the splash has now (the stone's pale violet, its dark edge), on the lintel; under it on one line THE WAY GOES ON and HARDCORE (HARDCORE in the enemy's pink). So the word is whole and sharp on every screen, and nothing of the picture is under the letters but the lintel's dark stone. `endlessLettering(w, h, ...)` says where and how big: as big as 6, smaller where the lintel or the screen's width leave less room (3 on a screen 320 x 200).

**Its moment**, about 1.75 s (`ES_MOMENT`), then it lives quietly until the splash's 3.2 s are up:

| from | what |
| --- | --- |
| 0 | the dark comes up over the game (0.1 s) |
| 0.10 s | the first gate's torches take: a warm flash, a kick, dust off the lintel |
| 0.25 s to 0.86 s | the gates wake one after another, away from us, each sooner after the last (0.25, 0.37, 0.48, 0.56, 0.63, ...): each flashes in the waypoint's light, the screen kicks, dust falls from its crown; what is beyond it is still dark |
| 0.86 s | the far fire takes: a burst of its light out over the hall, a pink flash, the biggest kick |
| 0.94 s to 1.08 s | ENDLESS falls from above the screen, smeared, and lands on the lintel: it sinks 3 pixels and comes back, the screen is knocked down 6 and settles, the lintel sheds its dust, a pale flash |
| 1.32 s | THE WAY GOES ON comes up |
| 1.50 s | HARDCORE strikes, gold for a blink, then pink |
| after | the torches flicker, the waypoint's light goes round its ring (as the game's waypoint does), motes rise off it, the far fire licks and breathes |

Checked against Animations 1 (as big, wild, kinetic and weighty as it will go) and Movement 9 (a big wind-up, the strike in a blink: the gates' run is the wind-up, the word's fall 0.14 s).

**Every screen.** Painted once at 720 x 360 game pixels, at the game's fine grain (two picture pixels to a game pixel: 1440 x 720), bigger than any screen the game is laid out on, as the start screen's picture is. The screen shows the part that fits: the vanishing point at the middle across and 0.7 of the way down. A wider screen sees more wall to either side; a taller one more wall above the slab. Looked at on 507 x 234 (his phone), 480 x 270, 688 x 288, 394 x 274 and 320 x 200.

**Held to the measure.** His word of 9 Nov: the Gate Ward and the Brawler are the measure for new art. Looked at beside them at the game's own size (a shot of the Brawler on floor 11 and the splash, the same 190 x 100 game pixels of each, enlarged alike): the same grain, flat tones with a seam of one pixel, light in bands with a dither only where two bands meet. No finer, no rougher. Nothing soft: the lights added over the picture are painted at the picture's own grain, never stretched or smoothed.

## For the main chat

- **Nothing in main.ts changes.** `ui/endless_fanfare.ts` `drawEndlessSplash(g, t, w, h)` sends the same call to `ui/endless_splash_draw.ts` `drawEndlessSplashArt` while the switch is on. The switch is reached as `ENDLESS_FANFARE.painted` (so `dbg.fanfare.painted.on = true`). The card after the splash is as it was.
- **To put it live** (on his yes): `ENDLESS_SPLASH.on = true` in src/art/endless_splash.ts.
- **The picture is painted the first time it is wanted: about 0.9 s for the stair** (931 ms in the film page's browser on this machine, 685 ms for the hall; not measured on his phone). Left alone, that wait falls in the dark as the splash comes up. Better: call `readyEndlessSplash()` ahead, under a loading screen (as the last floor loads, say). `releaseEndlessSplash()` lets go of it after (some 5 MB: one canvas 1440 x 720 and small pieces). Or bake the picture to a file, since files may go into the game: `paintEndlessStair()` and `paintEndlessSplash()` are plain numbers (tools/endless_splash_pics.ts writes the hall as a PNG).
- **`ENDLESS_FANFARE.skip` is 0.8 s, and the word lands at 1.08 s**: a tap between the two goes on to the card before the word has landed. Yours and his to settle (1.2 s would let it land). Not changed here.
- Every moment is drawn from `t` alone: nothing is kept between frames.
- A frame costs one picture laid down, four small pieces over it, five lights added, and a few hundred half-pixel rows filled while the gates wake and the far fire bursts.

## Files

- `src/art/endless_splash.ts`: the switch; the hall of gates (`paintEndlessSplash`), its small moving pieces, which gate's waking shows each pixel, the moment's numbers, where the letters go; the painting kit both pictures share; `EndlessScene`, a picture as the splash plays one.
- `src/art/endless_stair.ts`: the stair with no bottom (`paintEndlessStair`, `STAIR_SCENE`).
- `src/ui/endless_splash_draw.ts`: the splash as the game plays it.
- `src/ui/endless_fanfare.ts`: `painted` on `ENDLESS_FANFARE`, and the hand-over at the top of `drawEndlessSplash` (5 lines).
- `tests/endless_splash.test.ts` (6; the sixth is the stair's: its size, checksum, colours, waking, letters): the switch off; the picture's size, the same each time, its checksum; cyan and pink in their places; the waking in order; the letters whole and on the lintel on eight screens.
- `tools/scenarios/endless_splash_look.mjs`: the splash in the game itself, the switch on for that page only, then off again.
- `tools/endless_splash_film.mjs` and `src/dev/endless_splash_page.ts`: the film and stills (a page of its own with the same drawing, any moment asked for by its time).
- `tools/endless_splash_pics.ts`: the picture as PNGs without a browser.
- `src/dev/endless_options.ts`, `src/dev/endless_options_page.ts`, `tools/endless_options.mjs`: the ten sketches (concept art, not in the game) and their pictures.

## Checks, 11 Nov 2026

- `tsc --noEmit -p tsconfig.json`: clean but for `tests/relief.test.ts(378,16)`, which is on `main` too.
- `tsx --test tests/endless_splash.test.ts`: 6 of 6. `tsx --test tests/endless.test.ts`: 8 of 8. The whole suite was not run (only what the change is about).
- `node tools/build_to.mjs dist/endless_splash.html`, then `tools/scenarios/endless_splash_look.mjs` at 844x390, dpr 3, run for the hall and again for the stair: the painted splash comes up, the card after it, GO ON closes it, the switch off gives the old splash; 0 errors.
- The film page: 96 frames of each, 0 errors (`PIC=hall` for the hall).
