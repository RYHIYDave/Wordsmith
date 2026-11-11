# THE MAGE BROUGHT UP TO THE BRAWLER'S LEVEL: THE WHOLE OF HER (NOT IN THE GAME UNTIL THE MAIN CHAT PUTS IT THERE, ON HIS YES)

Branch `art/mage-up2`, from `main` at 9d3501b (25.3.3). The Mage chat, 11 Nov 2026, a new chat of his. It finishes what the art
chat's helper began on 7 Nov (branch `art/mage-up`, 56ee5c4: her look sculpted and one still of her; that branch was cut from
an old `art/ranger-up`, so its Mage files were carried onto today's `main` and it is left where it is). Everything is behind one
switch, `MAGE_UP` (`src/art/mage_up.ts`), OFF: with it off the game's Mage is exactly as she is, every frame the same picture
by hash (`tests/mage_up.test.ts`). With it on, `art/heroes3.ts` gives her new lists in the very shape it gave the old, as it
does the Warrior's and the Ranger's.

THE QUEUE: this is the Mage's half of `finish-mage-and-warlock-eight-sides` (the art chat's item). The Warlock's half is not
touched here.

## His words

- **11 Nov 2026, 13:38, to this chat: “The mage needs to be visually updated to the new standard”.** Read as, and told him so
  at once: she is the last of the first three heroes still drawn the old way; she is redrawn as the Brawler is, as the Warrior
  and the Ranger were; her look kept; eight true sides; 30 a second; her legs mended in her bones and nothing re-posed; nothing
  live until he has seen pictures and a film.
- 6 Nov 2026, on bringing the heroes up: “Like is yes I’d like everything brought up to the same 30 drawings a second for all
  the character models, but I’d also like the first three Warrior Ranger and mage updated to the level of the brawler in terms
  of the rules that we have set for the rest of the drawings I don’t want them to lose the aesthetic or the flavor that they
  currently have but I think like the shapes rule the action rule we kind of want all that updated to a certain level certain
  benchmark as the rest of the characters so that they’re all at the same level.”
- 6 Nov 2026, 15:18: “Everything drawn should not just look like shapes.  That’s the rule”
- Of the Ranger's still: “Can you make sure his leg ratio is correct cause it seems like all these guys have long upper legs
  and short legs below the knee”; on mending every hero: “Yes, every hero (Recommended)”.
- “Are you actually painting 8 drawings or flipping some?”; his pick: “Paint all 8 (Recommended)”.
- 7 Nov 2026, of the Warrior's re-posed run: “all that time and you screwed up his run.  why is he high stepping with his knees
  up?”
- 7 Nov 2026, of the Ranger's stance re-posed for a leg measure: “Cmon.  He’s not a gunfighter why is he so bow legged.  Just
  please do it right, I don’t want to have to correct every single one of these because we made a minuscule change to the leg
  length”. THE RULE SINCE (the Ranger's README; the queue's item): only the look, the legs (by the length of the bones) and the
  eight true sides change; how a hero stands, runs, holds the weapon and carries it in town stays the game's; a check that fails
  on the game's own motion is REPORTED with its numbers and the motion left alone.
- 9 Nov 2026, his measure for new art: the Gate Ward (floor 11) and the Brawler; new art is checked beside them at the game's
  own size, and what is finer is sent back the same as what is rougher (his pick: “Yes, add it (Recommended)”). And that day:
  “I don’t want to keep redoing everything so I want to find a good level of quality and have the little things be better
  instead of just improved paintings”.
- Kept from before, of her (art/hero3_mage.ts): 7 Oct 2026, 00:24, “its going to be the battle mage i can already tell”; and
  “no need to do the other mage”. And of the Wave made big and wild, 8 Oct: “Just right (Recommended)”: his measure of big and
  wild, so her casts are not touched.

**HIS YES IS NOT GIVEN YET.** He has been sent the film and the three pictures below; his answer goes at the foot of this file.

## What was taken out of the 7 Nov still, and why

The 7 Nov still was made the night before he said “He’s not a gunfighter”. Two things in it broke the rule he then made, and
are GONE:

- HER GUARD RE-POSED for the leg measure (her feet set 28 apart front to back where the game has 14.5, her knees turned): out.
  Her guard is the game's own. What he asked of the legs is in her bones (below).
- HER STAFF CARRIED OUT AT HER SIDE so that it showed from every side: out. Her staff is held as the game holds it, level in
  both hands across her front. What that costs from toward the camera is reported below, not mended.
- (and its one-off held cast, made only to pose the still: out; her casts are the game's.)

## Which look is kept: THE BATTLE MAGE, as the game paints her

(The 7 Nov helper's finding, still true.) The game paints the battle mage (`paintMage3`'s look when none is named;
`docs/handoff.md`, Version 16.0: “THE BATTLE MAGE, a woman: pointed hat, pink braids, ragged teal cape, short robe, belt, a long
crystal on her staff”), not the Mage in robes he chose first and set aside. She is the battle mage here.

KEPT: the tall pointed purple hat, its tip fallen over backward, its wide brim, its band of light; her face bare and in the
light, her eyes dark; her pink braids over her shoulders, their ends the game's own (they move: `engine/tails.ts`, the same
two roots, `m-braid-a` and `m-braid-b`); the ragged teal cape; the purple bodice closed down the front on a line of light; the
short purple robe with its hem of light; the broad brown belt, its cyan buckle, the pouch at her right hip; steel on her
forearms, plum gloves; dark hose and tall plum boots with a turned cuff; her staff of indigo wood, a long crystal at its head
over a bar of steel. Every glow on her the friend's cyan.

MADE NEW (the same pieces, drawn as the Brawler is: `src/dev/sculpt.ts`, one body with a real outline, inked only where one
stuff meets another; her colours her own three tones with a tone between):
- HER FACE warm and lit (the sculpted heroes' skin; the game's cool grey read as a pale mask), her head 1.22 times the build's,
  two dark eyes with a brow and a lash, a touch of rose for her mouth; her hat set higher so its brim is off her eyes.
- HER HAT a felt cone that truly bends over near its tip, a crease where it folds; its brim a soft plate, its edge lit.
- HER HAIR from behind parted and drawn in strands to two woven plaits that begin behind her ears; her nape under it.
- HER CAPE real cloth in folds, its hem cut into ragged points, OPEN DOWN THE FRONT from a clasp at her throat, so her bodice
  and its line of light show.
- HER ROBE one sheet of cloth hung from her hips in folds, to her knee, its last band her hem of light.
- HER STAFF'S HEAD: the bar curved up into two horns that cradle the crystal; the crystal cut, six-sided, with facets and an
  edge, so it reads as a stone and not a blot of light.

NEW ON 11 NOV, in the painter:
- HER ROBE LAID OVER A LIFTED THIGH. In her run her lifted knee came THROUGH her robe (the cloth was a bell hung from her hips
  that only its hem moved for a leg): against his rule, Clean bodies. Now the cloth is laid on a thigh that would pass through
  it, up and out from the thigh's middle, and where a thigh is truly lifted its hem is carried up with it by what is left of
  the cloth's length; in her guard and standing it hangs as it did (155 picture pixels of her stance's two front views differ
  from the 7 Nov painter's). `tests/mage_up.test.ts` 5 holds it in both her runs from all eight sides: one picture pixel of leg
  through cloth at the most in any picture (before, her lifted knee showed whole on her robe from most sides: the sheets).
- THE STREAK OF HER SWUNG CRYSTAL, as the game's Mage has it in the Wave (`art/hero3_mage.ts`, the same fan of light from the
  same eight moments of the last frame): the 7 Nov painter had none.

## Her moves: THE GAME'S OWN, every one (`src/art/mage_up_moves.ts`)

`MU_MOVES` is each of the game's seventeen moves of hers (`art/moves3.ts`: her guard, her run, the Wave, the Orb, the Beam
begun, held and let go, struck from in front and from behind, her fall, the mage light, the power getting away from her, her
town stance and run, the light and her reading in town, making ready) with only its body changed to hers: the same motion, the
same stance, the same length, the same moment its spell goes. Coming to a stand and setting off are the game's own
(`settlesOf`, `startsOf`) on them. NOTHING IS RE-POSED AND NOTHING RE-TIMED: the Wave still goes at 0.167 s and the Orb at
0.267 s, so nothing in the rules, the sounds or where her spells start needs touching.

## Her legs: in her bones (`MU_BODY`)

As the Ranger's (`RU_BODY`): her knee joint raised 0.79 of a unit (four tenths of a game pixel), the thigh shorter and the shin
longer by as much, the whole leg as long. Standing straight her shin is 1.30 times her thigh (the game's 1.16). Her hips, feet,
head and staff are where the game has them at every sixtieth of a second of every move (the test holds them to a millionth of
a unit); only where the knee bends moves, by 2 units at most (a hand that rests on a leg follows it by under 0.2).

Knee to floor over hip to knee on the screen, the least of either leg through every frame, from each of her eight sides
(`npx tsx tools/mage_up_numbers.ts legs`):

| | front | toward | frontL | sideL | backL | away | back | side |
|---|---|---|---|---|---|---|---|---|
| her guard, the game's bones | 0.71 | 0.61 | 0.91 | 1.09 | 1.62 | 1.34 | 1.19 | 1.02 |
| her guard, her bones now | 0.81 | 0.69 | 1.04 | 1.21 | 1.81 | 1.52 | 1.33 | 1.14 |
| her town stance, the game's bones | 0.96 | 0.83 | 0.92 | 1.15 | 1.22 | 1.22 | 1.18 | 1.10 |
| her town stance, her bones now | 1.07 | 0.94 | 1.03 | 1.28 | 1.36 | 1.36 | 1.32 | 1.23 |

REPORTED, NOT MENDED (the rule of 7 Nov): in her guard, from in front and from toward the camera, her shins still read shorter
than her thighs on the screen (0.81 and 0.69). That is the game's own crouch, low and side-on, its knees bent toward the
camera, each shin seen end-on; the same is true of the Ranger's (0.51 from toward the camera). Changing it is a re-pose, his to
ask for.

## Her staff, as the game holds it

How much of it is seen in her guard from each side, the least of four moments, in game pixels
(`npx tsx tools/mage_up_numbers.ts staff`):

| | front | toward | frontL | sideL | backL | away | back | side |
|---|---|---|---|---|---|---|---|---|
| its pole | 32 | 6 | 19 | 35 | 22 | 33 | 33 | 47 |
| its crystal | 20 | 9 | 19 | 23 | 24 | 10 | 25 | 23 |

REPORTED, NOT MENDED: facing straight down the screen (`toward`) her staff points at the eye, so only its crystal and 6 pixels
of its pole show, in front of her hands (`mage_eight_sides.png`, "toward you"). The game never drew her from there before (it
flipped the down-right picture), so this is new to see, but it is the game's own hold seen truly. The 7 Nov still moved the
staff out to her side to show it; that is a weapon moved, which the rule forbids. HIS TO ASK FOR if he wants it carried
otherwise (told to him with the pictures).

## Her lists (`src/art/mage_up_art.ts` `makeMageUpArt`, in the game's shape)

From ALL EIGHT SIDES, each truly painted, none mirrored (`art/warrior_up.ts` WuSide; `art/sides.ts`; the game's figure chooses
among them as it does for the Warrior and the Ranger: `render/figure.ts`): her staff in her right hand, her pouch at her right
hip and her braid 'a' over her right shoulder whichever way she faces.

| list | now | it was |
|---|---|---|
| idle (her guard; in town and on her card her town stance) | 72 pictures at 30 a second | 24 at 10 |
| walk (her run, gripping) | 23 at 60 | the same |
| stops (8), start | 9 each, at 30 and 60 | the same |
| attack, heavy (the Wave, the Orb) | 15 and 21 at 30 | the same |
| hold, holdStart, release (the Beam) | 17, 5, 8 at 30 | the same |
| reel, lurch, fall | 8, 8, 47 at 30 | the same |
| idleA, idleB (from in front: the light, the power getting away; in town the light, her reading) | 109 and 55 (in town 109 and 109) at 30 | 73 and 37 at 20 |
| ready (from in front, in town and on her card) | at 30 | the same |

No `walkWays` and no casts made walking, as the game's Mage has none. A list the same in two places is one list, painted once.

THE COUNT (`npx tsx tools/mage_up_measure.ts lists up eight`): 8 sides, 496 lists, 8,046 frames as the game counts them over
its three places; 4,261 held, 4,140 different pictures; 67.9 MB decoded at the game's grain; about 5.3 MB packed as picture
files. The game's Mage today: 2 sides, 130 lists, 2,022 frames, 997 different pictures, 30.3 MB, about 2.0 MB packed. Each
frame takes about 165 ms to paint here (207 with the machine busy): FAR TOO HEAVY TO PAINT IN PLAY, so she comes in with the
bake, as the Warrior and the Ranger did.

## The pictures (`docs/mockups/mage_up/pictures/`), all of her IN THE GAME

Made to be read on a phone held sideways: each wider than tall, eight (or six) screen pixels to a game pixel, a few panels each
(his word of a tall sheet, 9 Nov; and no GIFs: films are MP4).

- `mage_now_and_redrawn.mp4`: as she is now beside redrawn, the same moments, on floor 11's Crier's Square: she stands in her
  guard, turns through her eight sides, runs three ways, casts the Wave twice and the Orb once. 15.3 s at 30 a second,
  1452 x 716; the frames are the game's own, a picture every thirtieth of a second of the game's time.
- `mage_now_redrawn_and_the_brawler.png`: THE MEASURE. As she is now, redrawn, and the Brawler, each on the same spot of the
  Gate Ward's ground, eight screen pixels to a game pixel (1624 x 712).
- `mage_eight_sides.png`: redrawn, standing in her guard facing each of the eight ways (1632 x 984).
- `mage_in_town.png`: in town, her staff her walking stick as it was: as she is now and redrawn, from in front and from
  behind (2168 x 768).
- `stage1_mage_look_7nov.png`: the 7 Nov still, kept for the record. ITS GUARD AND ITS STAFF ARE NOT AS SHE NOW IS (above).

The white sparks about her crystal in the pictures are the game's own crackle (`render/fx.ts`, from the charge her frames hand
back), as on the Mage today.

Made with:

```
node tools/mage_up_page.mjs dist/mage_new.html on      # a page of the game with MAGE_UP on, in the page and its worker alike
node tools/mage_up_page.mjs dist/mage_old.html off
export AT=40,57 WAIT=14000
MODE=film CLIP=120x100 UP=26 OUT=shots/mage_up/film_new node tools/playtest.mjs --file dist/mage_new.html --touch --size 1126x520 --dpr 3 --scenario tools/scenarios/mage_up_look.mjs
MODE=film CLIP=120x100 UP=26 OUT=shots/mage_up/film_old node tools/playtest.mjs --file dist/mage_old.html --touch --size 1126x520 --dpr 3 --scenario tools/scenarios/mage_up_look.mjs
python3 tools/mage_up_film.py film shots/mage_up/film_old_frames shots/mage_up/film_new_frames docs/mockups/mage_up/pictures/mage_now_and_redrawn.mp4
MODE=still CLIP=67x84 UP=20 OUT=shots/mage_up/s NAME=new node tools/playtest.mjs --file dist/mage_new.html --touch --size 1126x520 --dpr 4 --scenario tools/scenarios/mage_up_look.mjs
   (the same with NAME=old on mage_old.html, and CLS=brawler NAME=brawler on mage_new.html)
python3 tools/mage_up_film.py three shots/mage_up/s_old.png shots/mage_up/s_new.png shots/mage_up/s_brawler.png docs/mockups/mage_up/pictures/mage_now_redrawn_and_the_brawler.png
MODE=sides CLIP=67x70 UP=22 OUT=shots/mage_up/n node tools/playtest.mjs --file dist/mage_new.html --touch --size 1126x520 --dpr 3 --scenario tools/scenarios/mage_up_look.mjs
python3 tools/mage_up_film.py sides shots/mage_up/n docs/mockups/mage_up/pictures/mage_eight_sides.png
   (in town: PLACE=town WAIT=9000 MODE=still CLIP=67x84 UP=22 WAY=0 and WAY=6, then mage_up_film.py row)
```

(1126 x 520 gives the game's 563 x 260 picture two whole screen pixels a game pixel. `tools/mage_up_page.mjs` is needed because
the side painter's worker is the page's own script and has no switch of its own: MAGE_UP turned on in the page alone would have
the worker paint the old Mage's frames into the new one's lists. A hero left standing turns to the camera for her habits; the
scenario holds them off, `renderer.figure.wait`.)

Every move was also looked at from every side outside the game, as sheets (a row a side, a column a moment, her braids hung and
moved as the game moves them): `npx tsx tools/mage_up_sheet.ts sheet <move> <out.png> [moments] [now|before] [sides] [scale]`.

## His art rulebook, and the measure

- THE GATE WARD AND THE BRAWLER ARE THE MEASURE (How art is made and approved, 10): `mage_now_redrawn_and_the_brawler.png`.
  On the Gate Ward's own ground, at the game's own size, she is drawn by the painter that draws him, at his grain (two picture
  pixels to a game pixel), her fine marks only where the eye should go: her face, her plaits, her crystal. Looked at beside
  him: neither finer nor rougher than he is, and a step bolder than the ground under her, as Places 2 asks.
- REAL SHAPES, NOT CIRCLES AND SQUARES (rule 9): the reason for the job; the old painter's balls and rods are gone.
- TRULY TURNED, EIGHT WAYS (Heroes 7): all eight painted, none flipped.
- CLEAN BODIES (Heroes 6): her knee under her robe in her runs (above).
- CLOTH MOVES (Heroes 5): her cape, her robe's hem and her hat's tip follow a few frames behind and stir in the wind; her
  braids are the game's own.
- FRIEND CYAN (Pillar 4): every light of hers is the friend's cyan; her edge of light is the Warrior's (`WU_RIM`).
- MOVEMENT: untouched, the game's own. NOT DONE, AND NOT ASKED: Movement 9 (a big held wind-up, a lightning strike) on her
  casts, which the Warrior and the Ranger were given with his yes. Her Wave is his own measure of big and wild; giving it a
  held wind-up would make it go later, as theirs do. HIS TO ASK FOR.

## The checks

- `tsc --noEmit -p tsconfig.json`: nothing from this branch (`tests/relief.test.ts` line 378 is main's own).
- `tests/mage_up.test.ts`, 8 tests: (1) the switch off, only `art/heroes3.ts` imports the new files and only through the
  switch; every frame the game paints of her the same by hash (`tests/mage_up.hashes.json`, made from her on main at 9d3501b;
  its 130 lists are hash for hash the 7 Nov file's: the game's Mage has not changed since); (2) her moves the game's own, only
  her knee joint raised; (3) her lists in the game's shape, eight sides, standing and her habits at 30, her casts as long and
  going at the game's moments; (4) 130 pictures from every side crisp, cyan-edged, nothing cut off, her braids fixed, her
  charge handed back, her lights cyan; (5) her knee never through her robe in her runs; (6) two dark eyes on her lit face at
  the game's size; (7) the Wave's streak.
- `tests/warrior_up.test.ts`, its first test (what imports the Warrior's files) now lets `art/mage_up*.ts` build on them, as
  it lets the Ranger's; nothing else of it changed.
- `node tools/unit.mjs --only mage_up,warrior_up,ranger_up` on 8c15c469cb (the art and its tests as handed over; only this
  file and the records changed after): 26 files (the three named and the core's 23, `heroes3` and `baked` among them), 321
  tests, all passed.
- In the game (the pages above, floor 11 and town, her switch on and off): no errors; her eight sides chosen by the figure;
  her crystal's light and crackle where her crystal is from every side; the Wave and the Orb cast by the game's own rules.

## For the main chat: how she comes in (ON HIS YES)

1. Bring in `art/mage-up2`. Of the game's files only `src/art/heroes3.ts` is touched (16 lines: the imports, `mageShare`, and
   `if (cls === 'mage' && MAGE_UP.on)` beside the Warrior's and the Ranger's).
2. `src/art/mage_up.ts`: `MAGE_UP = { on: true }`. `tests/mage_up.test.ts` test 1 asserts it off: change it then, and make its
   second test turn the switch off around itself as `tests/warrior_up.test.ts` does (`WARRIOR_UP.on = false` in a try).
3. BAKE (`tools/bake_heroes.mjs`): the heroes' mark changes, so a new `heroes/<mark>/` ships. She adds about 4,140 pictures,
   some 5 MB packed; her frames take a sixth of a second each to paint, so allow a quarter of an hour more for the bake. The
   bake already takes a hero's eight sides (`heroSides`). Nothing new is asked of the game, the side painter or the bake.
4. Play her on the built, baked page: all eight ways, the Wave, the Orb, the Beam with a wand, struck, her fall, town, her
   class card. Nothing in the rules changed, so no timing, sound or spell start needs touching.
5. FLOOR 18'S REFLECTIONS (`art/reflections.ts`) are made from the old heroes' painters, hers among them: her glass copy will
   show the old Mage until it is made again. The queue's `make-floor-18-reflections` (the art chat's) names the Warrior, the
   Ranger, the Warlock, the Tinkerer and the Brawler: SHE BELONGS ON IT NOW (added to its notes).
6. The title screen and the opening have their own pictures of her, untouched here.

## Not settled: his to say

- HER STAFF FROM STRAIGHT TOWARD THE CAMERA (above): as the game holds it, mostly hidden. Told to him.
- MOVEMENT 9 ON HER CASTS (above): not done, not asked.
- HER FALL goes down her staff to her knees, the game's own. The 7 Nov helper noted it "to be held against his rule on falls";
  it is not changed here.
- Her cape open in front, her robe to her knee, her staff's head with horns and a cut crystal, her skin warm: each a small
  change to the look he knows, all in the pictures.

## His answer

(to come)
