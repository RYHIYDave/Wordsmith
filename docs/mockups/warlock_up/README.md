# The Warlock brought up: stage 1, a first look (the art chat's helper, 7 Nov 2026)

Branch `art/warlock-up`, from `origin/art/mage-up` (56ee5c43: the Mage's stage 1, with the Ranger and the Warrior brought up in
it). A mock-up behind a switch that is off, `WARLOCK_UP` (in `src/art/warlock_up.ts`). Nothing of the game imports the new files:
the game's Warlock is exactly as he is, every frame the same picture, by hash (`tests/warlock_up.test.ts`).

STAGE 1 ONLY: as with the Ranger and the Mage, the owner sees one still before the whole job. Stage 2 (every list at 30 a second
from all eight sides, his run's legs from every side, the demon, the film, the boss checks) waits for his yes.

## His words

- 6 Nov 2026, on bringing the heroes up: “Like is yes I’d like everything brought up to the same 30 drawings a second for all
  the character models, but I’d also like the first three Warrior Ranger and mage updated to the level of the brawler in terms
  of the rules that we have set for the rest of the drawings I don’t want them to lose the aesthetic or the flavor that they
  currently have but I think like the shapes rule the action rule we kind of want all that updated to a certain level certain
  benchmark as the rest of the characters so that they’re all at the same level.”
- 6 Nov 2026, 15:18: “Everything drawn should not just look like shapes.  That’s the rule”
- On the Ranger's still: “Can you make sure his leg ratio is correct cause it seems like all these guys have long upper legs
  and short legs below the knee”; on mending every hero: “Yes, every hero (Recommended)”.
- “Are you actually painting 8 drawings or flipping some?”; his pick: “Paint all 8 (Recommended)”.
- 7 Nov 2026, on the Warrior's re-posed run: “all that time and you screwed up his run.  why is he high stepping with his knees
  up?”
- Kept from before, of the Warlock (dev/sculpt_warlock.ts, dev/warlock_moves.ts): “A with the spiked pauldron”, “Pact-bound
  scholar (Recommended)”, “Hunched and pained”, “Heavy cyan hellfire (Recommended)”; of his run, “Lurching, pained
  (Recommended)”; from behind, 25 Oct: “Isn’t from behind the wrong arm?  Isnt his left are the demonic one”.

## The picture (`pictures/warlock_look.png`, 1200 by 3359)

1. Standing, three times as big: before beside now, in front and from behind (one moment of his stand, 0.6 s in: breathing).
2. His legs: his near leg from in front, before and now, hip to knee and knee to floor marked, and where his coat's edge falls
   and his boot's top; the table of the least through his breathing, and through his whole stand, per side, before and now.
3. Now from all eight sides, standing, three times as big, each laid as he faces on the screen.
4. One stride of his run side-on, before and now, eight moments of its round, the thigh angle of the leg in the air under each.
5. At the game's own size: before and now, in front and from behind; then his eight sides.

Looked at close beside the Mage's still (`docs/mockups/mage_up/pictures/mage_look.png`): he is his own sculpture as the owner
passed it, painted by its own painter, so drawn with the same care as before; what is new on him (his boots to the knee, his
coat over the longer stance) is sculpted the same way. The boots are the newest thing seen on him (below, to decide).

## The audit: where he fell short (before)

- HIS LEGS SHORT BELOW THE KNEE: in his stance his feet were close under him (2.4 forward, 2 back) with his knees bent. Knee to
  floor over hip to knee on the screen, the least of either leg: from in front 0.97 at the still's moment; through his
  breathing 0.92 in front, 0.82 toward the camera, 0.94 down and to the left; as the pain folds him over in his spasm, 0.58
  toward the camera (table below). Standing straight his bones are true (1.14).
- HIS COAT AND THE KNEE THE EYE SEES: standing, his coat hangs closed to his ankles and hides his legs (only his feet show); in
  his run it is flung open, and the top of his boot was 6.3 game pixels below his knee (`tools/legs_measure.ts`, the median of
  eight strides from in front), so the eye took a point down his shin for his knee.
- MIRRORED: the game paints him from in front and truly from behind (his demon arm stays his left from behind, by his word of
  25 Oct), but for every facing to the left it flips those two: then his demon arm, its pauldron and his book change sides.
- HIDDEN FROM SOME SIDE: nothing he casts from. The fire in his claws is seen from every side (the least, breathing, 15 game
  pixels from up and to the right); only as the pain folds him right over it and it gutters (its smallest) does it come down to
  7, from up and to the right and from his right. His book is on his right hip and is rightly not seen from his left.
- HIS RUN A HIGH STEP: his quick right foot came through high, its thigh up to 54 degrees from hanging (the prance check fails
  past 50). From in front, toward the camera and down to the left his run's legs also read short where a foot bears him (0.87,
  0.43, 0.86): stage 2.
- HIS FRAME RATES: his stand 66 pictures at 10 a second (6.6 s), with his arm blazing the same; the demon's stand 48 at 10 (4.8
  s); the change 48 pictures over its 3.5 s (13.7 a second); the demon burning out 44 over 5.6 s (7.8 a second); his spells,
  smoke step, struck, fall and card at 30; his run and the demon's gripping at 60.

## What changed (`src/art/warlock_up.ts`, `src/art/warlock_up_moves.ts`)

HIS LOOK IS THE SAME SCULPTURE, painted by its own painter (dev/sculpt_warlock.ts `warlockSculpt`, `drawWarlockSculpt`), with:

- HIS EIGHT SIDES, each truly painted, none flipped (`paintWarlockUp`): the Warrior's eight (`WU_SPIN`; `wuFacing` chooses among
  them), his figure truly turned under the game's camera. The demon arm, its spiked pauldron and the fire in its claws on his
  left, the book at his right hip, from every side. The three sides that face left are painted with his floor point 98 across
  his canvas, as the others'. (His own two, in front and from behind, are exactly the game's two views: the game's view from
  behind is his side `back`.)
- HIS LEGS TRUE IN HIS STANCE (`WL_FEET`, `WL_STAND`): his body, arms, crouch and every key of his stand as they were; only his
  feet placed again, in every key alike: his lead foot (the left, the demon's side) further forward (12.84; it was 2.4), his
  back foot further back (-11.88; it was -2). A longer stance, as low and as hunched; his stumble step goes on from his new
  lead foot and back to it.
- HIS COAT HANGING OVER THE LONGER STANCE: standing, still closed and open down the front below the belt; its foot drawn back
  over his back leg and flared just enough that the leg is inside it, never through it, and the opening down its front widened
  to let his front leg through (a test holds his back leg inside it).
- HIS BOOTS TO THE KNEE: the same boots of hide, their tops brought up from below the middle of his shin to just under his
  knee, over his trousers. In his run, where his coat flies open, the knee the eye sees is now 1.1 game pixels below the joint
  (it was 6.3).
- HIS RUN, NO KNEE COME UP (`WL_RUN`; the stride the still shows): his limp as it was, the demon side a long heavy step that
  stays down, the other a quick hop kicked up behind as high as before; only that quick foot comes through under him lower
  (its height there 0.35 of what it was). Its thigh at most 41 degrees (it was 54). Nothing else of the run moves.

### His legs (knee to floor over hip to knee on the screen, the least of either leg, every frame at 30 a second; bones)

| | front | toward | frontL | sideL | backL | away | back | side |
|---|---|---|---|---|---|---|---|---|
| his breathing, before | 0.92 | 0.82 | 0.94 | 1.09 | 1.29 | 1.43 | 1.26 | 1.10 |
| his breathing, now | **1.14** | **1.14** | **1.14** | **1.14** | **1.17** | **1.15** | **1.15** | **1.15** |
| his whole stand (spasm and fold among it), before | 0.80 | 0.58 | 0.86 | 1.05 | 1.29 | 1.28 | 1.21 | 1.10 |
| his whole stand, now | **1.07** | **1.09** | **1.08** | **1.09** | **1.16** | **1.14** | **1.14** | **1.15** |

Near leg from in front at the still's moment: before 7.9 hip to knee, 7.7 knee to floor (0.97); now 7.9 and 9.0 (1.14).

## The checks (`tests/warlock_up.test.ts`, 7 of 7 passing)

1. The switch is off; nothing of the game imports `warlock_up.ts` or `warlock_up_moves.ts`. With it off, every frame the game
   paints of him (162 lists, 4,646 frames, 1,600 pictures: a man, his arm blazing, the demon, in a dungeon, town and on his
   card, both ways round) the same picture, by hash (`tests/warlock_up.hashes.json`, made from him as he is at 56ee5c43; each
   list's first, middle and last by default, `WARLOCK_UP_ALL=1` for every frame).
2. His legs: every frame of his whole stand from all eight sides at 1.05 or more (bones), and as painted, each leg whose shin is
   seen; the game's short; every key the game's but its feet, moved by `WL_FEET`.
3. No prancing: no thigh of a foot in the air past 50 degrees in his run (41.0; the game's 53.8); his right foot in the air when
   the game's is (none dragged); the rest of his run the game's.
4. Every picture of the still and of his run from all eight sides: crisp, the friend's cyan edge, nothing of the enemy's rim,
   nothing cut off.
5. Truly turned: the demon arm on his left from every side; the fire in its claws seen from every side (at least 8 game pixels
   as he breathes, 5 folded over it as it gutters); his back leg inside his coat.

tsc clean (the whole project); the Warrior's, the Ranger's and the Mage's import tests still pass. No file of the game changed,
nor any shared file.

Made with: `npx tsx tools/warlock_up_pics.ts look <dir>` and `python3 tools/warlock_up_pics.py look <dir> <out.png>`; the hashes
with `npx tsx tools/warlock_up_measure.ts hash tests/warlock_up.hashes.json`.

## For the owner or the art chat to decide

- HIS BOOTS TO THE KNEE, brown hide, now seen below his coat in his longer stance and in his run: the one thing new on him to
  look at. (Before, his coat hid them all but his toes.)
- HIS STANCE LONGER, his coat hanging wider over it at the back and opening wider at the front.
- Stage 2, on his yes: every list at 30 a second (his stand from 10, the demon's stand from 10, the change from 13.7, the
  burning out from 7.8) from all eight sides, the demon from all eight; his run's legs from every side where a foot bears him
  (front, toward the camera and down to the left read short, before and now); the prance check on every run and stop; the boss
  checks from all eight sides; the film.
