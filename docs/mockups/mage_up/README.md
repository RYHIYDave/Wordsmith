# The Mage brought up to the Brawler's level: stage 1, a first look (the art chat's helper, 7 Nov 2026)

Branch `art/mage-up`, from `origin/art/ranger-up` (46584c7c: the Ranger brought up, with the Warrior's newest in it). A mock-up
behind a switch that is off, `MAGE_UP` (in `src/art/mage_up.ts`). Nothing of the game imports the new files: the game's Mage is
exactly as she is, every frame the same picture, by hash (`tests/mage_up.test.ts`).

STAGE 1 ONLY: her look sculpted and shown in one still. As with the Ranger, the owner asked to see a still before the whole job;
stage 2 (every list at 30 a second, Movement 9 for her casts, her runs, her eight sides for every list, the film, the measures)
waits for his yes.

## His words

- 6 Nov 2026, on bringing the heroes up: “Like is yes I’d like everything brought up to the same 30 drawings a second for all
  the character models, but I’d also like the first three Warrior Ranger and mage updated to the level of the brawler in terms
  of the rules that we have set for the rest of the drawings I don’t want them to lose the aesthetic or the flavor that they
  currently have but I think like the shapes rule the action rule we kind of want all that updated to a certain level certain
  benchmark as the rest of the characters so that they’re all at the same level.”
- 6 Nov 2026, 15:18: “Everything drawn should not just look like shapes.  That’s the rule”
- 6 Nov 2026, 19:21, of the Ranger: “Can you show me the ranger redone before you go too crazy with the drawings?”; then “Just a
  still of him”. The Mage the same.
- On the Ranger's still: “Can you make sure his leg ratio is correct cause it seems like all these guys have long upper legs
  and short legs below the knee”; on mending every hero: “Yes, every hero (Recommended)”.
- “Are you actually painting 8 drawings or flipping some?”; his pick: “Paint all 8 (Recommended)”.
- 7 Nov 2026, on the Warrior's re-posed run: “all that time and you screwed up his run.  why is he high stepping with his knees
  up?” (for stage 2: her run is not re-posed in stage 1).
- Kept from before, of her (art/hero3_mage.ts): 7 Oct 2026, 00:24, “its going to be the battle mage i can already tell”; and
  “no need to do the other mage”.

## Which look is kept: THE BATTLE MAGE, as the game paints her

The brief for this job described her from the head of `src/art/hero3_mage.ts`: brown hair, a near-black cape, a long purple
skirt, a plum belt, a silver crescent on her staff. That is the Mage in robes whom the owner chose first and then set aside
(that file keeps her, painted only when asked for). THE GAME PAINTS THE BATTLE MAGE (`paintMage3`'s look when none is named;
`docs/handoff.md`, Version 16.0: “THE BATTLE MAGE, a woman: pointed hat, pink braids, ragged teal cape, short robe, belt, a long
crystal on her staff”), and the art rulebook's mage has “cape and braids flying”. His order is not to lose the look she has, so
she is the battle mage here. The two share her hat, her face and her purple; the crescent of the one in robes is remembered in
the horns of her staff's new cross-bar (below). The art chat should say if the one in robes was meant.

## The picture (`pictures/mage_look.png`, 1200 by 3474)

1. Standing in a fight, three times as big: before beside now, in front and from behind (one moment of her breathing stance).
2. Her head six times as big, before and now, in front, side-on and toward you. (The game only ever drew her from in front and
   from behind, flipped for the left: before, side-on and toward you, is the old drawing turned to that side, to compare.)
3. Her staff raised in a held cast, now, in front; beside it her legs measured (below).
4. Now from all eight sides, standing, three times as big, each laid as she faces on the screen.
5. At the game's own size: before and now, in front and from behind; then her eight sides.

Looked at close beside the Ranger's sheet (`docs/mockups/ranger_up/pictures/ranger_look.png`, `ranger_up_sheet2.png`): drawn
the same way and with the same care, one body with a real outline, inked only where one stuff meets another.

## The audit: where she falls short (before)

- DRAWN AS SHAPES: balls and rods each on a sheet of its own, ringed in ink (`hero3_mage.ts`): her head a ball with hair painted
  on its back; her braids two rods; her brim a flat disc; her robe a bell; her cape a ring of cloth; the crystal a diamond of
  flat colour with no edge; from behind, the back of her head a pink ball.
- HER LEGS SHORT BELOW THE KNEE: her guard is low and side-on, its knees bent toward the camera, so each shin is seen end-on.
  Knee to floor over hip to knee, the least of either leg through her breathing (`tools/legs_measure.ts`, `wuLegs`):
  from in front 0.71, toward the camera 0.61, from down and to the left 0.91 (table below). Her town stance the same, less
  (0.96, 0.83, 0.92; stage 2). HER ROBE AND THE KNEE THE EYE SEES: her short robe ends 5 picture pixels above her front knee, a
  band of dark hose shows under it, and the top of her boot sits 0.9 game pixels above the joint: the eye takes the boot top
  for her knee.
- MIRRORED: two sides only, in front and from behind; for the left she is flipped, so her staff changes hands, her pouch changes
  hips and her braids change shoulders.
- WHERE THE STAFF HIDES: the old drawing has no other sides to hide it from; from her eight true sides (now) her staff in her
  guard points at whoever looks from toward the camera, its pole end-on (3 to 5 game pixels of it), its crystal clear (23 or
  more). Stage 2 should look at whether to cant it in her guard as the Ranger's bow was.
- HER FRAME RATES: her stance 24 pictures at 10 a second (2.4 s); her two habits at 20 a second (her light 73 pictures, the power
  getting away 37); her casts, struck and her fall at 30; her run gripping at 60 (23 pictures).
- HER CASTS, for stage 2: the Wave goes on its sixth frame after a coil of three and a half, never held (Movement 9 asks a big
  held wind-up); the Orb at its ninth; her fall goes down her staff to her knees (to be held against his rule on falls).

## What is kept, and what is made new (`src/art/mage_up.ts` `paintMageUp`)

SCULPTED as the Warrior, the Ranger and the Veteran are (`src/dev/sculpt.ts`), on her own body (`MAGE_BODY`), in her own
colours (each of her three tones with a tone between), her darkest and lightest exactly hers. Every glow on her the friend's
cyan (a test holds it).

KEPT: the tall pointed purple hat, its tip fallen over backward, its wide brim, its band of light; her face bare and in the
light, her eyes dark; her pink braids brought forward from behind her ears over her shoulders, their ends the game's own (they
move); the ragged teal cape over her shoulders; the purple bodice closed down the front on a line of light; the short purple
robe with its hem of light; the broad brown belt, its cyan buckle, the pouch at her right hip; steel on her forearms, plum
gloves; dark hose and tall plum boots with a turned cuff; her staff of indigo wood, a long crystal at its head over a bar of
steel. Her stance, breath and staff are the game's own.

MADE NEW (the same pieces, better drawn):
- HER FACE POPS: her head 1.22 times the build's and set a little up her neck, lit a tone, her hair drawn back off her brow;
  her hat set higher on it, so its brim is off her eyes and its lit top is seen (tipped 18 degrees from the eye; it was 22,
  and sat low enough to hide them); two dark eyes, each two pixels tall, a dark pink brow a pixel above each and a lash at its
  outer corner; a touch of rose for her mouth. A test holds two eyes on her lit face from in front,
  toward you and from down and to the left, one side-on.
- HER HAT: a felt cone that truly bends over near its top, a darker crease where it folds, its tip fallen back and a little to
  her left (left behind as she moves, nodding in the wind); its brim a soft felt plate drooping a little at the sides, its edge
  turned and lit; the band of light round its foot.
- HER HAIR: parted down the back of her head, drawn out to each side in strands; her braids plaited (each crossing lit on its
  crown, dark in its seam), coming down from behind her ears round the side of her neck to the front of her shoulders, where the
  game's own braids hang on from.
- HER CAPE: real cloth from the root of her neck over her shoulders and round her back, in folds that open out as they fall, its
  hem cut into ragged points each its own length, hanging longer down her back than over her arms; OPEN DOWN THE FRONT from a
  clasp at her throat (a cord and a boss of steel), so that her bodice and its line of light show (it went all round her and hid
  them). Her arms come out from under it; an arm raised lifts it.
- HER ROBE: one sheet of cloth hung from her hips, in folds gathered at the belt that open out and break the hem where they end,
  pushed out where a thigh comes against it; its last band her hem of light; a little longer than before, to her knee (the knee
  the eye sees is now the top of her boot, under the hem).
- HER BODICE: a woman's chest drawn in to a small waist, out over her hips; its seams; the line of light down its front.
- HER ARMS: sleeves turned back below the elbow; the steel on her forearms a vambrace with a lit ridge down its outside and a
  rolled edge at the wrist.
- HER STAFF: the pole with a knot or two in the wood and a leather wrap where she holds it; THE CROSS-BAR CURVED UP INTO TWO
  HORNS that cradle the crystal (the crescent of her first sketch, kept in the battle mage's steel); THE CRYSTAL CUT: a long
  six-sided stone with a point at each end, its lit facets nearly white, its far facets her cyan, a white ridge down it, a dark
  cyan edge round it, so it reads as a stone and not a blot of light (it was a flat diamond with no edge). It swells and whitens
  as it burns, as before; its light and its charge (the crackle) as before.

## Her eight sides

As the Warrior's and the Ranger's (`WU_SPIN`; `wuFacing` chooses among them): each truly painted, none mirrored. Her staff in her
right hand, her pouch at her right hip, her braid 'a' over her right shoulder from every side. Her braids hang over her where
their roots are in front of her chest as seen, behind her otherwise. The three left sides are painted with her floor point 98
across her canvas, as theirs.

## Her legs, made true (`src/art/mage_up_moves.ts` `MU_GUARD`)

Her body, arms, staff and the depth of her crouch as the game has them (a test holds them); only her feet and knees placed
again: her front foot further forward (14.5; it was 7) and a little out (2.5), its knee over it; her back foot further back
(-13.5; it was -7.5) and a little out (-4.5), its knee less turned in (-23; it was -32), the foot less turned out (-18; it was
-46). A longer guard, as low. Her breathing is the game's own (it moves her hips, back and crystal only).

Knee to floor over hip to knee on the screen, the least of either leg through every frame of her breathing stance, from each of
her eight sides (bones; the test also measures them as painted, each leg whose shin is seen):

| | front | toward | frontL | sideL | backL | away | back | side |
|---|---|---|---|---|---|---|---|---|
| her guard, before | 0.71 | 0.61 | 0.91 | 1.09 | 1.62 | 1.34 | 1.19 | 1.02 |
| her guard, now | **1.08** | **1.14** | **1.12** | **1.13** | **1.17** | **1.14** | **1.14** | **1.07** |

As the eye reads her near leg from in front (`tools/legs_measure.ts`, game pixels): before, 2.2 of dark hose between her hem and
her boot top, 9.6 from there to the sole; now 0.4 and 9.7, the hem at her knee and her boot's top just under it.

## The checks (`tests/mage_up.test.ts`, 7 of 7 passing)

1. The switch is off; nothing of the game imports `mage_up.ts`, `mage_up_moves.ts` or `mage_up_art.ts`. With it off, every frame
   the game paints of her (130 lists, 2,022 frames) the same picture, by hash (`tests/mage_up.hashes.json`, made from her as she
   is at 46584c7c; `MAGE_UP_ALL=1` for every frame).
2. Her legs: every frame of her breathing guard from all eight sides at 1.05 or more (bones), and as painted; the game's guard
   short (under 0.75 from in front, 0.65 toward); her body, arms and staff the game's.
3. Every picture of the still (six moments of her stance and the held cast, from all eight sides): crisp, the friend's cyan edge,
   nothing of the enemy's rim, nothing cut off, both braids fixed, her crystal's charge handed back, every light of hers cyan.
4. Her staff seen from every side in her stance: at least 20 game pixels of it, 12 of them its crystal (the least of all of it,
   28, toward the camera, where its pole is end-on; of its crystal, 12, from straight behind her, where her hat is before it).
5. Her face at the game's size (above).

tsc clean (the whole project). Of what was there, two files changed, no file of the game:
- `tools/legs_measure.ts`: her, brought up, added to its heroes (`mage-now`), and where the hem and the eye's knee are on the
  picture added to its measure (for the legs panel).
- `tests/warrior_up.test.ts`, its first test (what imports the Warrior's files): it ALREADY FAILED at 46584c7c, because the
  Ranger's files (`ranger_up_art.ts`, `_moves.ts`, `_review.ts`) are built on the Warrior's; the Mage's painter is too. Now it
  holds the game's files only (`art/heroes3.ts`, through its switch), the heroes' mock-ups being held by their own tests; and it
  lets `art/heroes3.ts` reach the Ranger's through RANGER_UP, and the Ranger's review build on the Warrior's. Its other tests
  are as they were.

Made with: `npx tsx tools/mage_up_pics.ts look <dir>` and `python3 tools/mage_up_pics.py look <dir> <out.png>`; the hashes with
`npx tsx tools/mage_up_measure.ts hash tests/mage_up.hashes.json`.

## For the owner or the art chat to decide

- WHICH LOOK: the battle mage, as the game has her, is kept (above). If the one in robes was meant, say so before stage 2.
- HER CAPE OPEN IN FRONT from a clasp at her throat, so her bodice and its line of light show: a change to how it falls.
- HER ROBE A LITTLE LONGER, to her knee.
- HER STAFF'S HEAD: the bar curved up into horns round the crystal, the crystal cut.
- HER GUARD IS LONGER (her legs true): her feet further apart front to back.
- Stage 2, on his yes: every list at 30 a second from all eight sides, the Wave and the Orb by Movement 9, her run checked
  against the prance check, her town stance's legs, her fall, the film and the measures.
