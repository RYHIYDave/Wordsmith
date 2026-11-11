# The town's lag: what a frame of the town cost, what this branch does about it, what is left

Branch `perf/town-frames`, from `main` at `012cc66` (25.3.2). Made 11 Nov 2026 by a chat he started from the queue page on his
phone ("Town lag chat", not the main chat), for the queue's item `fix-town-lag-on-phone`. Nothing in it changes how the game
plays. How it looks: the same to the eye; measured, not the same to the last pixel (below: "How near the picture is").

## His words

7 Nov 2026, 23:11 (Eastern): “Still a ton of lag in the town”. (He was on 25.2.3. 25.2.4 took out the worst stalls as a game
begins; the main chat's note of what was still to do: each frame of the town at a phone's speed, and the townsfolk's frames
painted as first shown.)

11 Nov 2026, 09:50: he sent this chat the queue's item from the queue page, to work on.

## What was found

Measured on 25.3.1 built as the release is (the heroes' baked pictures beside it), at his phone's shape (844 by 390, three
device pixels to one, the game's canvas 1014 by 468), the Warrior standing in town as a new game begins:

- **The town draws 714 pictures a frame, covering the screen 17.5 times over** (`tools/scenarios/town_draws.mjs`). A dungeon
  floor draws about 350 to 510, covering it 3 to 8 times (docs/perf_phone.md).
- **11 of those 17.5 screens are 67 glows**, 65 of them the day that fills the castle's hall (art/castle_hall.ts `dayLights`,
  `CASTLE_LIGHTS`: glows 34 to 120 game pixels round, most at a twentieth of their light or less), each a small soft picture
  stretched to its size and ADDED to the screen, every frame. Left out, a frame took 77 ms where it took 136 (the processor
  slowed six times).
- **Some 300 are the floor**: the roof behind everything (1.2 screens), a picture for each of the hall's flags on the screen
  (235), the walls' shade on the tiles at their feet (60).
- **The dark**: 54 soft holes cut in it a frame for the day's lights (under each window, at the foot of every wall, under each
  slat of sun), each stretched and smoothed, and a dozen more for his own light and the fires'.
- None of these three ever changes while he is in town.
- The page's own working time for a frame of the town (`tools/scenarios/town_cost.mjs`): 18 to 23 ms on the test machine at its
  own speed, so even that machine could not draw the town 60 times a second; 135 to 155 ms with the processor slowed six times
  (the main chat's measure of 7 Nov: 133 ms).

## What this branch does

Three pictures, each made once as the town is come into and let go as it is left (render.ts `forgetLooks`), each behind a
switch of its own that is ON. Only for a place whose look says it is steady and seen whole (`LookView.steady`, new: the
castle's hall alone says so); every other place is drawn exactly as before.

1. **The floor as one picture** (`src/render/still_floor.ts`, `STILL_FLOOR`): the roof, every flag and the walls' shade laid
   once, in the game's order, on the game's black. 300 pictures a frame become one. To lay it, a tile's own drawing was moved
   out of drawWorld's loop into `Renderer.floorTile`, which the loop and the picture both call (`Renderer.layFloor`), so the
   two cannot come to differ. Made again if a tile is seen that was not, or changes from wall to floor.
2. **The steady glows as one picture** (`src/render/still_glows.ts`, `STILL_GLOWS`): the 65 glows of the day that are steady
   (`LookLight.still`) laid once into a clear picture and that picture added. 11 screens of light a frame become one. Glows
   that flicker (a fire's) are drawn one by one as ever.
3. **The dark with the day's holes as one picture** (`src/render/still_dark.ts`, `STILL_DARK`): the veil with the 54 steady
   holes cut in it, laid down as each frame's dark begins; the holes that move or flicker (his own pool of light, the gate's,
   the braziers', the forge's, the Lexicon's) are cut after, as ever. Not used while a boss's own darkness is over a place.

Each is left to the game (nothing drawn by it, everything drawn as before) wherever its picture could not be right: a canvas
turned or scaled by a part of a pixel, a camera not on a whole pixel, a picture larger than its limit.

Room they take while he is in town: 3.3 MB, 3.2 MB and 0.6 MB (7.1 MB in all), given back as the town is left.

What making them costs: the frame that makes the three took 28 to 77 ms on the test machine at its own speed (eight tries),
against 6 to 18 ms for the frame after: some 35 ms more, once each time the town is come into (as a game begins that is under
the loading screen, which draws the world once before he plays; coming back from a floor it falls on the arrival's own frame,
with the hall's pictures being made again).

## What it gains (measured)

On 25.3.2 with this branch, one page, the switches off against on (`OFF=all`), the test machine (2 cores), 844 by 390 at 3:

| | as it was | with the three pictures |
|---|---|---|
| pictures a frame on the screen (25.3.1) | 714, covering 17.5 screens | 367, covering 6.1 screens |
| pictures a frame on other canvases (25.3.1) | 66 | 11 |
| a frame's work, standing (`town_cost.mjs`) | 18.4 ms | 8.4 ms |
| a frame's work, walking | 17.9 ms | 9.1 ms |
| the same, processor slowed 6 times, standing | 153.2 ms | 53.5 ms |
| the same, walking | 143.1 ms | 60.2 ms |
| `town_lag.mjs` (30 s, slowed 6 times): frames drawn | 193 | 449 |
| its middle frame | 150 ms | 67 ms |
| its frames over 100 ms | 188 | 4 |
| its time in frames over 100 ms | 29.7 s | 1.9 s |

(Both runs of town_lag have one long frame, about 1.6 s, as its measuring begins: the test's own.) Step by step on 25.3.1 at the
machine's own speed, standing: 22.9 ms as it was, 15.9 with the glows, 12.2 with the floor too, 10.2 with the dark too.

**Not measured on his phone, nor on any iPhone's browser: the test machine has only Chromium.** The slowed processor is the
main chat's stand-in for a phone. What is certain is what is drawn: under half the pictures and about a third of the pixels.

## How near the picture is to what it was (`tools/scenarios/town_same.mjs`)

The frame drawn at 41 places about the hall, as it was and with each picture, at one moment with the same random numbers:

- **The floor: the same to the pixel**, at all 41.
- **The glows: the same but on hairlines; no colour off by more than 5 of 255** (at most 38,941 of the screen's 1,898,208
  colour values). Why it cannot be nearer: a glow's small picture is stretched without smoothing, and where the middle of a
  screen pixel falls exactly between two of its pixels the browser takes one or the other by the last bit of its arithmetic,
  which goes by where on the screen the glow is. **The game's own picture of these glows already differs from itself on those
  hairlines whenever the camera moves a pixel**: 10,257 to 32,886 of 1.4 million values, by up to 5 of 255
  (`tools/scenarios/town_glow_ties.mjs`). Laid once, the hairlines no longer change as he walks.
- **The dark: no colour off by more than 2 of 255** (at most 89,992 values). The game cuts his own pool of light first and the
  day's holes after; this cuts the day's first. A hole takes a share of the dark that is left, so the order matters only in
  the rounding of each step, and the hall's dark is a tenth.
- **All three together: no colour off by more than 6 of 255.**

A pair at the game's own pixels, and the first with every pixel that differs at all marked pink (42,541 of 474,552):
`docs/requests/town_frames/town_before.png`, `town_after.png`, `town_marked.png`.

**For the main chat to weigh (PICTURES FIRST):** nothing here can be seen, and the floor is exact, so the switches are on. If
he or the main chat would rather have only what is the same to the pixel, set `STILL_GLOWS.on` and `STILL_DARK.on` false: the
floor alone is 300 fewer pictures a frame; the glows are most of the gain.

## Checks

- `tsc --noEmit`: clean.
- `tests/still_pictures.test.ts` (6): what each picture is laid with and where; that it is drawn where its pieces were; made
  once, made again only when what it hangs on is another; left to the game where it could not be right.
- `node tools/unit.mjs --only still_pictures,castle_hall,town_look,townart,floor_looks_game` (and the core) on `c1cab5c43f`,
  the last commit that changes the game or its tests: 28 files, 334 tests, all pass.
- The game's own town playtests on the branch's page, served: `town.mjs`, `quest_town.mjs`, `towntap.mjs`: finished clean.
- `tools/scenarios/town_same.mjs`: ALL AS THEY SHOULD BE, 41 places; each picture made once and not again in a walk.
- With the three switches OFF the game draws what it drew: `tools/scenarios/draws_hash.mjs` on 25.3.1 against 25.3.1 with this
  work: the town and floors 1 to 7, six places each, the same call for call and pixel for pixel (floors 8 and on cannot be
  compared this way: one build differs from itself run to run there).
- `git merge-tree` with `art/townsfolk` at 225e658: no conflict (it touches art/townsfolk.ts, art/townscene.ts, main.ts; this
  touches render/render.ts, render/looks.ts, render/castle.ts).

## What is left

1. **The townsfolk's frames painted as first shown** (the other half of the queue's item): NOT done here, on purpose. The
   redrawn townsfolk (queue item `bring-in-townsfolk-30fps`, branch `art/townsfolk`) are to be baked to files by the main chat
   as the heroes are, which ends it; mending the old ones would be thrown away. Measured meanwhile, the old ones: 50 pictures
   painted in play in a 30 s walk about the town, 175 ms in all at the machine's own speed (longest frame 50 ms).
2. **His phone.** Ask him how the town plays once this is live.
3. **What a frame of the town still costs** (8 to 9 ms at the machine's own speed), should more be wanted: his own pool of
   light and the fires' holes cut in the dark each frame (1.2 ms); the sun in the air before each window, four pictures added,
   a screen's worth; 117 standing pictures (the walls' faces, the trusses, the props); the HUD: about 145 small pictures a
   frame for its letters (0.5 ms) and 184 small fills for the life globe. The last two are every floor's, not the town's.

## For the main chat

- Bring in `perf/town-frames`. If `render.ts` has changed where a floor tile is drawn (drawWorld's loop, `kind === T_FLOOR`),
  the change belongs in `Renderer.floorTile` now.
- Nothing to switch on. Test what changed: `tests/still_pictures.test.ts`, `tools/scenarios/town_same.mjs`, a town playtest.
- New tools: `tools/scenarios/town_same.mjs`, `town_cost.mjs`, `town_draws.mjs`, `town_glow_ties.mjs`, `draws_hash.mjs`;
  `town_lag.mjs` takes `OFF=all`.
- Tell him it is live, and ask how the town plays on his phone.
