# Mock-up: the bone archer on the heroes' bones (NOT IN THE GAME)

**What it is.** Today's bone archer set beside THE SAME MONSTER REBUILT ON THE BONES AND PAINTER
OF THE NEW SKELETON (the heroes' bones, which the skeleton was put on in `mockup/skeleton-on-bones`
and which the owner said yes to on 8 Oct 2026), as pictures and a film for the owner. It stands,
walks, shoots and is killed, facing you and facing away. NOTHING OF IT IS IN THE GAME: the game's
bone archer is today's, unchanged, and the new one is behind a switch that is off.

**State of this branch (`mockup/archer-on-bones`):** on top of `mockup/skeleton-on-bones`
(`5d81df8`, itself on Version 18.8, `4e052cc`), because the archer is painted by the skeleton's
painter. Made by THE ART CHAT, 8 Oct 2026, from 09:28. The art chat shows him the pictures.

## His words

- 8 Oct 2026, asked at 09:27 what the art chat should take up next, with three choices ("Bone
  archer on bones (Recommended)", offered as "He's a skeleton too. Same new bones, so he matches
  the new skeleton."; "A place's own colours"; "Phone speed test"), he answered at 09:28: **"Bone
  archer on bones (Recommended)"**. He was told at 09:28: "Bone archer it is. I'll put him on the
  same new bones as the skeleton, bow in hand, and send you pictures of him beside today's archer."
- The skeleton on the bones, 8 Oct 2026, 08:23: "I like the true left, the skeleton, and the door".
  The art rulebook he approved that morning (branch `art/rulebook`, `docs/art/RULEBOOK.md`),
  monsters, rule 8, "Built on bones": "other monsters follow one at a time, each shown to you first."
- 4 Oct 2026, 16:25: "Also we need the dungeons and mobs brought up to the level of the character
  models". 6 Oct 2026, 00:31: "I want enemies to look natural. An undead skeleton is plodding and
  brittle."
- 6 Oct 2026, 21:06, of the ranger reaching back to his quiver after a shot: "i appreciate trying to
  make it look like he's reaching for the quiver but i think just pulling the string back and having
  the arrow appear is totally fine". The new archer does the same (today's archer reaches back to
  its quiver).

(As `docs/NEXT_VERSION.md` and `docs/handoff.md` record them, and the art chat's own record of 8 Oct.)

## The pictures (not in the repository: `previews/` is ignored)

- **`previews/archer_on_bones_sheet.png`** (1266 x 2064). At the top, THE GAME'S OWN PICTURES AT A
  PHONE'S SIZE (a screen of 844 x 390 points at 3 pixels to a point; one pixel of the phone to one
  pixel of the sheet), in two rows: today's archers and skeletons, then the new archers beside THE
  NEW SKELETONS (so that he sees the two dead on the same bones together); the ones up the screen
  facing you, the ones down it facing away, the knight between them for size. Below, the four
  standing archers enlarged (12 screen pixels to a game pixel).
- **`previews/archer_on_bones_film.gif`** (630 x 634, 5.8 seconds, 25 frames a second, loops).
  Today's and the new side by side, each facing you and facing away: standing, walking for two
  seconds, one shot, killed. AT THE GAME'S OWN SPEED: every frame picked as the game picks it (the
  walk at its own pace, the shot by the rules' wind-up of 0.55 s, the death at 20 frames a second),
  the floor sliding under them at the archer's speed (2.8 tiles a second), with the pink pool of
  light the game puts behind a monster and the lights it gives off.

## The new archer

THE SKELETON'S BODY AND PAINTER (`src/art/monster_bones3.ts`), the same bones, skull, sockets,
teeth, jaw, rib cage and pink edge, DRESSED AND ARMED AS TODAY'S ARCHER IS (`DeadKit`: the
skeleton is `SWORDSMAN`, the archer `BOWMAN`):

- A RAGGED HOOD OF THE RED OF OLD BLOOD over the skull, a little bigger than it and turned with it,
  open in front from the brow down. Its rim shades the brow and the face under it is in shadow, so
  the pink in the sockets burns out of the dark; torn in the crown, a seam down the back; from
  behind the hood is all there is to see of the head, as today's.
- A RAGGED RED MANTLE on the shoulders, short over the breast and a little longer down the back,
  torn into tongues at its hem; it trails as it moves. The ribs show below it, front and back.
- A QUIVER ON ITS BACK, UNDER THE MANTLE: its mouth and THREE PINK FLETCHINGS stand up behind the
  right shoulder (from in front, over the shoulder, as today's do), and its foot shows on the bare
  back below the mantle. Dark plum leather (today's is the bow's indigo; on these bones, from behind,
  an indigo quiver read as a second bow, and laid over the mantle it split the mantle in two).
- A TALL DARK BOW IN ITS LEFT HAND (the side it faces in both views, as today's archer's, the new
  skeleton's sword and the ranger's bow are): two limbs bent from the grip to the tips (the
  ranger's bow, a little longer, in today's indigo wood), drawn back as the string comes; a pale
  string, to the fingers when they are on it; an arrow on it with a plum shaft, pink fletching and a
  rusted head that TURNS TO A SPARK OF THE ENEMY'S PINK, BURNING TO GOLD, AS THE BOW IS DRAWN, and
  spits at full draw, with a pink light of its own (today's does the same). No rag at its hips, as
  today's has none.

ITS OWN MOVES, written on the same keys (`Key3`, `bonesAt`, `solve`):

- **Stands** (12 frames at 10 a second): the bow low in front of its left hip, out from the body so
  that the whole of it shows, an arrow on the string under the fingers of the right hand, pointing
  at the floor ahead (WEAPONS REST LOW). IT LISTENS: it sways on its pins, the skull turns slowly
  away to its right as if at a sound, holds there while the jaw clacks, and comes back a beat after
  the body.
- **Walks** (8 frames at 12 a second): THE SKELETON'S PLOD, LESS OF IT, as today's archer has the
  skeleton's lurch, less of it ("lighter on its feet, and carries a bow it must not jolt"): the same
  long step it falls onto and stiff leg dragged after, the body dropping and tipping less, the skull
  lolling less, the jaw jolted open on the step; both hands stay on the bow, carried low.
- **Shoots** (27 frames at 30 a second): the skull turns to the mark; the bow comes up as the body
  turns side-on to it (its chest to the eye from in front, its back from behind), and the string
  comes back under the jaw in one pull, the jaw clenched, the light in the sockets burning up, the
  arrowhead a spark; DRAWN BY HALF THE WIND-UP AND HELD, the bony arms trembling and the spark
  spitting (the warning is a pose). ON THE SEVENTEENTH FRAME THE STRING GOES (the rules' 0.55 s on
  the nearest frame, as every monster's blow is put: `onGrid` in `art/mkit.ts`; the game plays a
  wind-up by how much of it is done, so the arrow still goes when the rules say): the hand flies
  back and down past the skull, the bow kicks on and rocks forward, the string flung and quivering,
  THE ARROW GONE from the bow on the frame the game's own arrow appears; the jaw drops open. It
  watches it go; then the hand comes back to the string, on which a fresh arrow is (his word of
  6 Oct, 21:06), and the bow comes down, 0.3 s after the arrow went (the rules' rest).
- **Is killed** (21 frames at 20 a second, a second): as the skeleton is (`deathOf3`, now given
  what comes apart: `Undoing`): the light flares in the sockets and the string hand is thrown off
  the string; THE BOW DROPS FIRST and lies flat; the knees go and the frame drops; every bone
  comes apart and falls by itself; the quiver comes off its back; THE MANTLE COMES DOWN AND LIES
  SPREAD OVER THE BONES; and the skull goes last WITH THE HOOD STILL ON IT, rolling toward the eye
  (today's archer: its red hood on the heap). It ends a heap with no pink left in it.

## What is in the code, and the switch

- **`src/art/monster_bones3.ts`:** the skeleton's painter, now told what each of the dead wears
  and carries (`DeadKit`: `SWORDSMAN`, `BOWMAN`): the hood, the mantle (`mantleOn`; `mantleDown`
  as it comes down), the quiver, the bow, its string and arrow (`bowBits`; a one-pixel line is a
  new solid, `thread`); the archer's stance and its hands on the bow (`ARCHER3_BASE`, `lowBow`,
  `drawnBow`, `loosedBow`), its moves (`ASTAND3`, `AWALK3`, `ASHOT3`, `SHOT3_HIT`; its jaw is the
  move's own, `SkMove.jaw`, because its `draw` is its bow's), its death (`Undoing`, `BOW_FALLS`,
  `ARCHER_UNDOING`), and `makeArcherArt3()`. `archerHolding` is for pictures only (ways of holding
  the bow, compared on the dev page). **THE SKELETON IS PAINTED EXACTLY AS IT WAS, FRAME FOR FRAME**:
  every frame of it, both ways, fingerprinted before the archer was put on the painter and after
  (`tools/bones3_prints.ts`; the fingerprints are in `tests/archer3.test.ts`).
- **`src/art/bestiary.ts`: `export const ARCHER3 = { on: false }`: THE SWITCH, OFF.** While it is
  off the bestiary gives the game today's bone archer (`src/art/monster_bones.ts`, NOT TOUCHED)
  exactly as before. With it on, the bestiary makes the new one once and every archer shares it.
  It is a switch of its own: the skeleton's (`SKELETON3`) is not touched by it.
- **`src/main.ts`:** `window.__dbg.archer3` is the switch, for a playtest that photographs the new
  one to throw for itself. Nothing in the game sets it.
- **`tests/archer3.test.ts`** (10 tests): WITH THE SWITCH OFF NOTHING CHANGES (the switch is off;
  the game's archer is today's frame for frame, its lights, its pool of light, its paces, the moment
  of its shot; its frames are painted ahead of need in the same order as before; thrown and put
  back gives today's again, and leaves the skeleton's switch alone); THE SKELETON HE SAID YES TO IS
  AS IT WAS, every frame; and the mock-up's own contract: frame counts and paces; the arrow going on
  the frame where the rules have it, the draw held, the spark lit drawn and gone with the arrow, it
  beginning and ending as it stands; a pink edge all round, pink lights and NO PIXEL OF A FRIEND'S
  CYAN; a death that begins as it stood, lies on the floor and leaves no lights, glow or edge; as
  tall as the game takes an archer to be (`FIGURE_SIZE`).
- For pictures only: `src/dev/preview_archer3.ts` (strips, the film, the enlarged sheet, `try`:
  ways of holding the bow, `hero`: a hero's move for comparison), `src/dev/measure_archer3.ts`
  (paint time), `tools/scenarios/archer3.mjs` (the game's own pictures and films, `BONES=1` for the
  new ones, `WHO` for archers and skeletons), `tools/archer3_sheet.py` (the sheet).

THE MOCK-UP'S CODE IS IN THE GAME'S SCRIPT even with the switch off, because the bestiary names it:
the minified script is 884,100 bytes on this branch and 872,529 on `mockup/skeleton-on-bones`, so the
archer adds about 11.6 KB. It never runs unless the switch is on.

## How to see it

```
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node node_modules/tsx/dist/cli.mjs --test tests/archer3.test.ts

# the film: today's and the new, side by side, at the game's speed ("film:4:slow" for three times slower)
node tools/page_gif.mjs src/dev/preview_archer3.ts "film:4" previews/archer_on_bones_film.gif

# the sheet: the game's own pictures at a phone's size (the archers on the left, the skeletons on the right), and the four archers enlarged
node tools/build_to.mjs dist/ar3.html
WAIT=9500 WHO='archer@-58,-34;skeleton@58,-34;archer@-58,34;skeleton@58,34' node tools/playtest.mjs --file dist/ar3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/archer3.mjs --out shots/ar3/game_0
WAIT=9500 BONES=1 WHO='archer@-58,-34;skeleton@58,-34;archer@-58,34;skeleton@58,34' node tools/playtest.mjs --file dist/ar3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/archer3.mjs --out shots/ar3/game_1
node tools/preview.mjs src/dev/preview_archer3.ts shots/ar3/sheet_big.png 1266 900 "sheet:12"
python3 tools/archer3_sheet.py previews/archer_on_bones_sheet.png shots/ar3/game_0_still.png shots/ar3/game_0_where.json shots/ar3/game_1_still.png shots/ar3/game_1_where.json shots/ar3/sheet_big.png

# every frame of one move, big: strip:<now|bones>:<idle|walk|attack|die>:<front|back>[:scale[:every[:per row]]]
node tools/preview.mjs src/dev/preview_archer3.ts shots/ar3/strip.png 1800 1400 "strip:bones:attack:front:8:1:7"

# ways of holding the bow (grip from the left shoulder along the chest; the arrow's heading, elevation; the bow's roll), both views
node tools/preview.mjs src/dev/preview_archer3.ts shots/ar3/try.png 2400 1400 "try:4,6,-14,20,-30,-30;3,7,-13,15,-15,-20@8"

# in the game, acting, at a phone's size (DO = stand | walk | strike | die; FILM = how many pictures)
BONES=1 DO=strike FILM=34 node tools/playtest.mjs --file dist/ar3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/archer3.mjs --out shots/ar3/gf_shot

# paint time (the number: how many times every frame is painted afresh)
node tools/preview.mjs src/dev/measure_archer3.ts shots/ar3/measure.png 1000 360 "5"

# the skeleton's fingerprints (compare with SKELETON_PRINTS in tests/archer3.test.ts)
node node_modules/tsx/dist/cli.mjs tools/bones3_prints.ts skeleton
```

## Paint time

Every frame of today's archer and of the new one, of the skeleton on the bones and of the knight on
the bones, painted afresh five times over and timed one by one as the game pays for it the first
time a frame is shown (painting, trimming, putting it on a canvas); headless Chromium on this
machine (2 cores, load about 1.1), three runs:

| | frames (both views) | mean a frame | median | 90th |
|---|---|---|---|---|
| today's bone archer | 128 | 2.45 to 2.61 ms | 2.2 to 2.3 ms | 3.5 to 4.1 ms |
| the archer on the bones | 136 | 4.54 to 5.37 ms | 4.2 to 5.1 ms | 6.3 to 7.4 ms |
| the skeleton on the bones | 126 | 4.36 to 4.78 ms | 3.6 to 4.5 ms | 6.0 to 6.6 ms |
| the knight (bones) | 244 | 5.76 to 6.47 ms | 4.8 to 6.5 ms | 8.2 to 8.7 ms |

So A FRAME OF THE NEW ARCHER COSTS ABOUT TWICE TODAY'S (1.9 to 2.1 times), ABOUT AS MUCH AS THE NEW
SKELETON'S (up to a fifth more) AND ABOUT FOUR FIFTHS OF A HERO'S; all its frames together about
0.6 to 0.7 s. Every archer shares one set of pictures, so it is paid once a game, a few frames at a
time, ahead of need (`Bestiary.warm`). This machine was slower today than when the skeleton was
measured (its README has the skeleton at 2.88 to 3.15 ms a frame; here 4.36 to 4.78): compare within
one table, not across them. Not measured on a phone, where every one of these will be slower in
proportion.

## Checked on this branch

`tsc --noEmit` clean; THE UNIT SUITE WITH BOTH SWITCHES OFF, 632 OF 632 (622 before, and the
archer's 10); the skeleton on the bones unchanged frame for frame; `Play.html` not rebuilt (the
pages looked at were built to `dist/`).

## What was looked at

Every picture, cut and enlarged: every frame of the stand, the walk and the shot in both views at 6
to 10 screen pixels to a game pixel; the death every other frame in both views; six and then six
more ways of holding the bow at rest, in both views, before choosing (the bow out at the left hip,
arrow 30 degrees down, the bow rolled 30 degrees: it shows its curve beside the skull from in front
and a crescent from behind); the ranger's own Shot (moves3.ts) beside the archer's draw; and IN THE
GAME at a phone's size, the new archers beside the new skeletons and today's beside today's. Changed
on the way, after looking: the bow thicker and a little longer; the quiver up behind the shoulder
with longer fletchings (they were hidden behind the hood from in front); the string hand anchored
under the corner of the jaw, not at the cheek (from in front the forearm lay across the hood like a
stick); the released hand flung back and down (it stuck up past the skull); the mantle tried as a
cape to the waist (from behind the archer became a red sack and hid its bones) and settled short,
with the quiver under it and no folds down the middle of its back (laid over the mantle, the quiver
split it into two puffs). The motion was judged from frames side by side (a GIF cannot be watched
playing here).

## For the main chat, to build it for real (on his yes)

1. It sits on the skeleton's branch: bring in `mockup/skeleton-on-bones` first (he said yes to it at
   08:23), then this. Then turn `ARCHER3.on` (or put `makeArcherArt3()` in the bestiary's table for
   the archer and take the switch out). Today's `src/art/monster_bones.ts` stays: the Shieldbearer
   is painted by it (in no dungeon), and the pictures of before.
2. THE UNIT SUITE WITH THE SWITCH ON (tried here, the switch's default flipped for one run and put
   back): 627 of 632 pass. The five that fail: the first four of `tests/archer3.test.ts`, which say
   that the game's archer is today's (they become the opposite); and in `tests/monsters.test.ts`
   "no frame of any of them runs off the canvas it was painted on", whose table of canvases
   (`CANVAS`) says the archer is painted on the kit's 112 x 112: the new one is painted on the
   heroes' 176 x 176 (`CANVAS3`). That table wants `CANVAS3` for the archer (as for the skeleton).
3. THE ARCHER'S PACE IS A RULE, AND THIS DOES NOT TOUCH IT (`MONSTERS.archer.speed`, 2.8 tiles a
   second; its wind-up, 0.55 s; its rest after, 0.3 s). Its walk is the skeleton's plod at the
   skeleton's pace (eight frames at twelve a second), so its feet slide over the floor as the
   skeleton's do. "Feet grip the floor" (rule 8 of movement in the rulebook, chosen 8 Oct) was built
   for the heroes' runs (`STRIDE`, `mockup/weight-films`); for the dead the same (frames by the ground
   covered) or a pace matched to the speed would serve the skeleton and the archer together.
4. The flying arrow is the game's own, as today (render.ts: a pale shaft); the art's arrow leaves
   the bow on the frame the game's appears. THE GAME DRAWS ITS ARROW LOWER THAN THE BOW IS HELD
   (its shadow 10 game pixels under it): filmed in the game (`DO=strike`), the arrow leaves the bow at
   the height of the archer's chest and appears at the height of its knees, a little ahead of it.
   Today's archer has the same jump. Drawing a monster's arrow higher would be the game's to change.
5. Measure the paint time on his phone; and weigh the 11.6 KB.

## Not sure, or left open

- The string and the arrow are one-pixel lines with the style's indigo seam round them, as the
  ranger's are; today's archer's had no seam. Close up they are a beaded line; at a phone's size a
  thin dark line.
- From in front, at full draw, the arrow points nearly at the eye and is short; the spark shows where
  its head is (the ranger's Shot reads the same way).
- From behind, at rest and walking, the bow is held low across the legs.
- As it dies the quiver stands upright for a moment (a tenth of a second) as it comes off the back.
- The face in the hood's shade is a tone or two darker than the skeleton's bare skull: on purpose
  (the hood), but it makes the archer's face less bony than the skeleton's at a glance.
