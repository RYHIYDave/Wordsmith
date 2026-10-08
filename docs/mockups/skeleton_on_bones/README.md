# Mock-up: the skeleton on the heroes' bones (NOT IN THE GAME)

**What it is.** Today's skeleton monster set beside THE SAME MONSTER REBUILT ON THE HEROES' 3D
SKELETON AND PAINTER (the ones the heroes have stood on since Version 16), as pictures and a film
for the owner. It stands, plods, strikes and is killed, facing you and facing away. NOTHING OF IT
IS IN THE GAME: the game's skeleton is today's, unchanged, and the new one is behind a switch that
is off.

**State of this branch (`mockup/skeleton-on-bones`, on top of Version 18.8, `4e052cc`):** made by
a helper of THE ART CHAT, 8 Oct 2026. The art chat shows him the pictures; he had not seen them
when this was written.

## His words

- 4 Oct 2026, 16:25: "Also we need the dungeons and mobs brought up to the level of the character
  models".
- 6 Oct 2026, 00:31, after seeing the skeleton with its sword raised and lowered: "Trap looks great.
  Skeleton looks better down. I want enemies to look natural. An undead skeleton is plodding and
  brittle. and the heroes to be very stylized and cool. Proud and daring or a roguish charm. A very
  powerful wizard wielding crazy magics."
- 6 Oct 2026, 00:32: "Like the mage fires his beam and it blows his cloak back. I want things to
  have weight. That's very important"

(As `docs/NEXT_VERSION.md` records them. Version 14 brought the monsters up to the heroes as the
heroes were painted THEN; the heroes have since moved onto bones and the monsters have not. This
is the first monster moved onto them, to compare.)

## The pictures (not in the repository: `previews/` is ignored)

- **`previews/skeleton_on_bones_sheet.png`** (1266 x 1492). At the top, THE GAME'S OWN PICTURES AT A
  PHONE'S SIZE (a screen of 844 x 390 points at 3 pixels to a point; one pixel of the phone to one
  pixel of the sheet): today's skeletons on the left, the new on the right, the one up the screen facing
  you and the one down it facing away, the knight between them for size. Below, the four standing
  figures enlarged (12 screen pixels to a game pixel).
- **`previews/skeleton_on_bones_film.gif`** (630 x 674, 5.8 seconds, 25 frames a second, loops).
  Today's and the new side by side, each facing you and facing away: standing, walking for two
  seconds, one strike, killed. AT THE GAME'S OWN SPEED: every frame is picked as the game picks it
  (the walk at its own pace, the strike by the rules' wind-up of 0.4 s, the death at 20 frames a
  second), the floor sliding under them at the skeleton's speed (3 tiles a second), with the pink
  pool of light the game puts behind a monster and the light of its eyes.

## The new skeleton

THE HEROES' BONES AND PAINTER, UNCHANGED (`src/art/skeleton.ts`, `src/art/skin.ts`): a body from
the heroes' table of lengths, made gaunt and given a big skull; posed by keys on the heroes'
numbers, its knees and elbows finding themselves and its arms kept out of its ribs; dressed in rods
and balls in the heroes' one light (from the upper left) and flat tones, at the heroes' grain (an
art pixel is half a game pixel); the indigo seam where one bone passes in front of another; and
round it all THE ENEMY'S PINK EDGE (the heroes' is cyan). Nothing on it glows but its eyes, pink.

THE SAME MONSTER AS TODAY'S: the big skull of pale lavender bone with a point of hot pink in each
socket, the crack in its crown from behind, the jaw that hangs and clacks, a rib cage, a knob at
every joint, thin limbs, three finger bones on the hand that hangs, the scrap of teal cloth at the
hips knotted at the back, the notched rusted sword held low ("Skeleton looks better down"). It
holds the sword in its LEFT hand, so that the sword is on the side it faces in both views, as
today's is. It stands as tall as today's and covers about as much of the screen (standing, 32 x 55
picture pixels to today's 34 x 55).

ITS OWN MOVES. No hero's move fitted the dead (no hero plods, and none comes apart), so all four
are its own, written in the heroes' keys (`Key3`, `bonesAt`, `solve`):

- **Stands:** hunched, the head hanging forward and lolling; it creaks: the skull settles a beat
  after the body, the jaw clacks, it sways.
- **Plods** (8 frames at 12 a second, one heavy footfall to a cycle: slower than today's 16): one
  leg steps long and the whole frame falls onto it, the knee locked; the skull lolls over a beat
  late and the jaw is jolted open; the bones rattle on their pins; the other leg is dragged stiff,
  swung out from a hitched hip, its toe scraping the floor.
- **Strikes** (22 frames at 30 a second): the arm creaks up and the sword is raised beside the
  skull, the frame leaning back and the jaw wide, held trembling through the wind-up (the
  player's warning); it comes down IN THE FRAME THE RULES LAND THE BLOW (0.4 s), the whole frame
  thrown after it and the jaw snapping shut, a pale streak behind the blade for that one frame (as
  today's has); it ends low and hauls itself back over 0.3 s.
- **Is killed** (21 frames at 20 a second, about a second): the light flares in the sockets and
  goes out; the knees go and the frame drops; then IT COMES APART: the sword first, the jaw off the
  skull, then every bone (each rib by itself) falls and turns in three dimensions to lie on the
  floor, the skull last, rolling toward the eye; the rag drapes over the pelvis. A bone turned a
  few degrees is painted afresh at that angle, so it stays a crisp bone (today's death can turn its
  pieces only by quarter turns). It ends a heap of bones, skull, rag and sword, with no pink left
  on it.

## What is in the code, and the switch

- **`src/art/monster_bones3.ts`** (new): the body, the bones as solids, the painter, the four moves,
  the coming apart, and `makeSkeletonArt3()`, which makes the monster's pictures as the game wants
  them (an `ActorArt`, painted frame by frame the first time each is shown, as every monster's are).
- **`src/art/bestiary.ts`: `export const SKELETON3 = { on: false }`: THE SWITCH, OFF.** While it is
  off the bestiary gives the game today's skeleton (`src/art/monster_bones.ts`, NOT TOUCHED) exactly
  as before. With it on, the bestiary makes the new one once and every skeleton shares it; the
  list of frames painted ahead of need is made again if the switch is thrown.
- **`src/main.ts`:** `window.__dbg.skeleton3` is the switch, for a playtest that photographs the new
  one to throw for itself. Nothing in the game sets it.
- **`tests/skeleton3.test.ts`** (9 tests): WITH THE SWITCH OFF NOTHING CHANGES: the switch is off;
  the game's skeleton is today's frame for frame (every frame's size, anchor and every pixel, its
  lights, its pool of light, its paces, the moment of its blow); its frames are painted ahead of
  need in the same order as before; the switch thrown and put back gives today's again. And the
  mock-up's own contract: frame counts and paces; the blow on the frame where the rules land it,
  beginning and ending as it stands; a pink edge all round and pink eyes; a death that begins as
  it stood, lies on the floor and leaves no lights, glow or edge; as tall as the game takes a
  skeleton to be (`FIGURE_SIZE`).
- For pictures only: `src/dev/preview_skeleton3.ts` (strips, the film, the enlarged sheet),
  `src/dev/measure_skeleton3.ts` (paint time), `tools/scenarios/skeleton3.mjs` (the game's own
  pictures and films, `BONES=1` for the new one), `tools/skeleton3_sheet.py` (the sheet).

THE MOCK-UP'S CODE IS IN THE GAME'S SCRIPT even with the switch off, because the bestiary names it:
about 21 KB of the minified script, which comes to about 873 KB with it (`Play.html` is 852 KB at
18.8). It never runs unless the switch is on.

## How to see it

```
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node node_modules/tsx/dist/cli.mjs --test tests/skeleton3.test.ts

# the film: today's and the new, side by side, at the game's speed ("film:4:slow" for three times slower)
node tools/page_gif.mjs src/dev/preview_skeleton3.ts "film:4" previews/skeleton_on_bones_film.gif

# the sheet: the game's own pictures at a phone's size, and the four figures enlarged
node tools/build_to.mjs dist/sk3.html
node tools/playtest.mjs --file dist/sk3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/skeleton3.mjs --out shots/sk3/game_now
BONES=1 node tools/playtest.mjs --file dist/sk3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/skeleton3.mjs --out shots/sk3/game_bones
node tools/preview.mjs src/dev/preview_skeleton3.ts shots/sk3/sheet_big.png 1266 900 "sheet:12"
python3 tools/skeleton3_sheet.py previews/skeleton_on_bones_sheet.png shots/sk3/game_now_still.png shots/sk3/game_now_where.json shots/sk3/game_bones_still.png shots/sk3/game_bones_where.json shots/sk3/sheet_big.png

# every frame of one move in a row, big: strip:<now|bones>:<idle|walk|attack|die>:<front|back>[:scale[:every]]
node tools/preview.mjs src/dev/preview_skeleton3.ts shots/sk3/strip.png 1800 900 "strip:bones:walk:front:6"

# in the game, acting, at a phone's size (DO = stand | walk | strike | die; FILM = how many pictures)
BONES=1 DO=die FILM=34 WHO='a@-40,-24;c@-40,24' node tools/playtest.mjs --file dist/sk3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/skeleton3.mjs --out shots/sk3/gf_die

# paint time (the number: how many times every frame is painted afresh)
node tools/preview.mjs src/dev/measure_skeleton3.ts shots/sk3/measure.png 900 300 "5"
```

## Paint time

Every frame of today's skeleton and of the new one, and every frame of the knight on the bones,
painted afresh five times over and timed one by one as the game pays for it the first time a frame
is shown (painting, trimming, putting it on a canvas); headless Chromium on this machine (2 cores,
load 0.4 to 1.1), four runs:

| | frames (both views) | mean a frame | median | 90th | all its frames |
|---|---|---|---|---|---|
| today's skeleton | 118 | 1.57 to 1.72 ms | 1.4 to 1.6 ms | 2.0 to 2.4 ms | about 0.2 s |
| on the bones | 126 | 2.88 to 3.15 ms | 2.7 to 2.9 ms | 3.5 to 4.3 ms | about 0.38 s |
| the knight (bones) | 244 | 3.71 to 3.83 ms | 3.3 to 3.5 ms | 4.8 to 5.2 ms | about 0.92 s |

So A FRAME OF THE NEW SKELETON COSTS ABOUT 1.8 TO 2 TIMES TODAY'S AND ABOUT FOUR FIFTHS OF A
HERO'S (the heroes' "about 4 ms" holds here). Every skeleton shares one set of pictures, so it is
paid once a game, a few frames at a time, ahead of need (`Bestiary.warm`). Not measured on a phone,
where every one of these will be slower in proportion.

## Checked on this branch

`tsc --noEmit` clean; THE UNIT SUITE WITH THE SWITCH OFF, 622 OF 622; `Play.html` not rebuilt (the
pages looked at were built to `dist/`).

## What was looked at

Every picture, cut and enlarged: every frame of every move in both views at 5 to 6 screen pixels
to a game pixel; the standing figures at 12; the film frame by frame (contact strips of the walk,
the strike and the death, both views); and IN THE GAME at a phone's size, the four standing and a
strike and a death beside the knight, 30 and 34 pictures a thirtieth of a second apart, with the
heap it leaves enlarged two times. It reads at the size of the phone: pink eyes, the grin, ribs,
rag and sword facing you; the round back of the skull with its crack, the spine and ribs facing
away. The motion was judged from frames side by side (a GIF cannot be watched playing here).

## For the main chat, to build it for real (on his yes)

1. Bring in `src/art/monster_bones3.ts` and the switch, and turn it on (or put
   `makeSkeletonArt3()` in the bestiary's table for the skeleton and take the switch out). Today's
   `src/art/monster_bones.ts` stays: the bone archer and the Shieldbearer are painted by it.
2. THE UNIT SUITE WITH THE SWITCH ON (tried here, the switch thrown before each test file):
   617 of 622 pass. The five that fail: the first four of `tests/skeleton3.test.ts`, which say
   that the game's skeleton is today's (they become the opposite); and in `tests/monsters.test.ts`
   "no frame of any of them runs off the canvas it was painted on", whose table of canvases
   (`CANVAS`) says the skeleton is painted on the kit's 112 x 112: the new one is painted on the
   heroes' 176 x 176 (`CANVAS3`), and its blow, with the streak, reaches 56 picture pixels before
   its feet. That table wants `CANVAS3` for the skeleton.
3. THE SKELETON'S PACE IS A RULE, AND THIS DOES NOT TOUCH IT (`MONSTERS.skeleton.speed`, 3 tiles a
   second). The plod is slower in its steps than today's walk, so the feet slide more under it. If
   "plodding" is to mean slower to come at you, that is gameplay and his to say; the walk's pace
   (`PLOD_FPS`) would then be set to match the speed.
4. Measure the paint time on his phone; and weigh the 21 KB.
5. Next on the same body and painter, if he wants it: the bone archer (the same bones with a bow),
   then the other monsters on bodies of their own.

## Not sure, or left open

- The skull is tipped toward the eye as the heroes' headgear is (`wornOn`), so that its face reads
  from the game's height; as it turns, its crown shows more than a real skull's would.
- Left-handed, to keep the sword on the side it faces as today's does (the heroes hold theirs in
  the right hand).
- What carries "brittle" while it walks (the bones knocked a pixel sideways on their pins, the jaw
  jolted open) is small at the size of a phone; the coming apart carries it best.
- The game's own death bits (the white squares it throws when anything dies) still fly over its
  coming apart; it might want fewer of them on a skeleton now that its bones fall.

## Sent to the owner (8 Oct 2026, 02:55, by the art chat)

previews/skeleton_on_bones_sheet.png and previews/skeleton_on_bones_film.gif, with these words: "2 of 4: the skeleton rebuilt on the heroes' bones, beside today's. The film shows both plod, strike and fall apart. Should the new skeleton replace today's?" **HIS ANSWER: NOT YET IN.**  Before these went, at 00:53 on 8 Oct he wrote "If I’m not around to test phone speed continue on.  Keep going down the list", read as: leave the phone test until he is around and carry on down the art chat's list (decorations, the skeleton on the heroes' bones, true left-facing heroes, the two films of weight). He was told so at 00:54. Nothing of this is in the game; the main chat builds whatever he says yes to.
