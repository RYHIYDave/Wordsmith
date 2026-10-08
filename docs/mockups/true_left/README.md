# True left-facing heroes: a mock-up, NOT IN THE GAME

Made by the art chat on 8 Oct 2026 on the branch `mockup/true-left`, from `main` at Version 18.8
(`4e052cc`). It is a question for the owner, not a change: everything it adds to the game's code is
behind a switch that is OFF (`TRUE_LEFT = { on: false }` in `src/art/heroes3.ts`), and with the switch
off the game paints exactly what it painted before (checked frame by frame: below).

## What it is

Today a hero who faces screen-left is his right-facing picture turned over (`flipSprite` in
`src/engine/px.ts`; `Figure.frame` in `src/render/figure.ts`). So facing left his weapon changes
sides, and his painted light, which the painter lays on from the upper left (`LX`, `LY`, `LZ` in
`src/art/skin.ts`), falls from the upper RIGHT. The heroes are a 3D skeleton dressed in solids, so a
true left-facing picture can be painted: the same figure turned on the spot, seen by the game's own
camera, lit from the upper left, the weapon in the hand it is always in. These pictures put the two
side by side for the knight (the warrior), standing, in one frame of his run and at the blow of his
Strike, at about the size the game shows him and enlarged; and a film of him turning through eight
views beside the game's four.

## His words it answers

- 5 Oct 2026, 14:45: "I'd like the character models to move and turn in those four cardinal
  directions as well."
- 6 Oct 2026: he was sent, at about 21:22, "From behind you now see the warrior's broad back instead
  of his side. To get that he is shown over his other shoulder, so facing away the sword is in his
  other hand. Say if that bothers you." His only answer, 21:31: "mage and warrior look great"
  (`docs/NEXT_VERSION.md`). The handoff records the mage and the warrior as right as they look, not to
  be changed without his asking: hence pictures only.
- The film is for the turning question. 4 Oct 2026, 16:23: "The animations look really good but I
  think we could get more on the turning. The characters snap to a direction and if that could be
  smoother I'd like it." In-between views were offered then and never built; the quick turn made
  instead was taken out at his word on 5 Oct, 15:53: "Can you remove the flip we added a long time
  ago. I'd like to see them now with the correct alignment".

## The pictures (copies are in this folder)

1. `knight_true_left.png`, THE SHEET (1302 x 2368): the knight facing all four ways, NOW and TRUE,
   standing, running and striking, at about game size (4 screen pixels to a game pixel; the pictures
   that change are framed in cyan); then the two left-facing ways enlarged (6 to a game pixel), with a
   small sun in the corner of each where its light falls from. A key at the foot says what is what.
2. `knight_turning_4_and_8.gif` (776 x 415, 160 frames at 25 a second, 0.6 MB): the knight standing
   and turning on the spot, round once in 6.4 s, an arrow on the floor for the way he faces. Left:
   the game's four views as now. Right: eight views, each the figure itself turned (so his sword is
   always on his right side, and facing up-right and down-left he is side-on).
3. `knight_down_left_turned_a_little.png` (supporting): his stance and run facing down-left, and the
   figure turned 22 and 45 degrees either way of it.

The working copies are in the worktree's `previews/true_left/` (not in the repository).

## What the pictures show

- UP-LEFT IS ALREADY THE TRUE FIGURE TODAY. The view from behind is drawn over his left shoulder and
  turned over (`project` in `src/art/skeleton.ts`); turning that over again for up-left gives back
  the knight the right way round, sword on his right side. TRUE changes only the light. Measured on
  his stance: 99.5% of his pixels are where today's are (turned over), and about 39% change tone.
  At game size the difference is hard to see.
- DOWN-LEFT, TRUE, HE SHOWS HIS SHOULDER AND HIDES HIS SWORD when he stands and runs: his rear stance
  turns his chest about 70 degrees toward his right hand and trails the blade behind him, and from
  in front of his left side that puts the whole blade behind his body. His Strike reads well that
  way (he turns into the cut, toward you). It is the same trouble the true view from behind had on
  6 Oct, when he came out side-on and narrow (the note above `View` in `skeleton.ts`). The best
  honest picture is the true one: turning the figure toward you shows only the hilt and a finger of
  the blade (picture 3), and the blade comes out only as he turns to face nearly straight left, more
  than 20 degrees off the grid's diagonal, which would undo the four grid directions he asked for on
  5 Oct.
- UP-RIGHT IS THE SAME IN BOTH: his sword is on his left side there (the over-the-shoulder view of
  6 Oct). So with true left frames his sword is on his right side three ways and on his left one way
  (today: two and two). A true up-right is the side-on view tried on 6 Oct (it is in the film's
  eight).
- LIGHT: every true frame is lit from the upper left like the walls and the floor. Today a
  left-facing hero (and every monster facing left) is lit from the upper right.
- EIGHT VIEWS: the turn goes in steps half as big, and walking straight across or up the screen he
  would face the way he goes; but in true views two of the eight are side-on (up-right: sword across
  his legs; down-left: sword hidden).

## What is in the code, behind which switch

THE SWITCH: `TRUE_LEFT = { on: false }` in `src/art/heroes3.ts`, read when a hero's figure is first
made (`makeHeroArt3`'s `of`). OFF, no figure has true-left frames and nothing else in the game is
different. ON, each figure gets two more sets of frames (`ActorArt.left`), shown for a hero facing
left in place of the right-facing frames turned over.

- `src/art/skeleton.ts`: `View` gains `frontL` (the figure turned a quarter of the way round to its
  right: facing down-left), `backL` (half way: facing up-left) and `turn<deg>` (any turn, only for
  pictures of the in-between views); `project` handles them. `front` and `back` are worked out by the
  very same arithmetic as before.
- `src/art/skin.ts`: `GameView` is every view but `side`. The painters needed nothing else: the light
  is laid on as the eye sees it, so it falls from the upper left in any view.
- `src/art/heroes3.ts`: `TRUE_LEFT`; the left sets; what a hero does when left standing is painted
  for `frontL` too; the left views have no Whirlwind (it is always seen from the front); their pool of
  light lies where it does behind today's frames turned over; `warm` paints the left sets ahead of
  need as well, when there are any.
- `src/art/actor_types.ts`: `ActorArt.left?`.
- `src/render/figure.ts`, `Figure.frame`: a figure facing left that has `left` frames shows them as
  they are; one without (every figure, with the switch off) is turned over as before. The scarf is
  tied where the frame says and blown behind him, as before.
- `src/render/render.ts`, `actorSprite` (the hero's phantoms, and the monsters, which never have
  `left`): the same.
- `src/art/hero3_knight.ts`: in the new views only, a light of the blade shines only as much as
  there is of the blade to be seen round it (`bladeSeen`): from in front of his left side the blade
  can be wholly behind him, which the game's two views never show, and its glow came through his
  body. The game's two views are untouched by it.
- `src/main.ts`: `__dbg.trueLeft(on)` sets the switch and makes the heroes afresh, for playtests.
- Dev pages and tools (nothing of the game imports them): `src/dev/preview_true_left.ts` (the
  pictures), `src/dev/preview_true_left_look.ts` (bare paintings from every side, for looking),
  `tools/sheet_true_left.py` (lays out the sheet), `tools/true_left_gif.mjs` (the film),
  `tools/scenarios/true_left.mjs` (the knight in the game itself, switch off and on),
  `tools/hero_fingerprint.mts` (a fingerprint of every hero frame), and `src/dev/measure_paint.ts`
  learned `warrior:trueleft`. `src/dev/preview_skin.ts` and `preview_wire.ts` only had their types
  narrowed to the views they draw.
- `tests/true_left.test.ts` (4 tests): the switch is off, no figure has left frames and a hero facing
  left is his right-facing frame turned over; the frames of the two views are the same pictures,
  pixel for pixel, with the switch off and on (it only adds); `front` and `back` see every point as
  before; switched on, a hero facing left shows his own left frames, and up-left is the view from
  behind turned over in shape (under 2% of pixels not) and lit from the other side (over 20% change).

WITH THE SWITCH OFF NOTHING CHANGES: `tools/hero_fingerprint.mts` on this branch and on `main` at
18.8 gives the same 4,082 frame entries (all three heroes, dungeon, town and class card, both views,
every list and clip: pixels, anchors, lights, pool of light, tails), total
`9e68e304a6cc2142d3edd041`. The whole unit suite: 617 of 617 (613 before, and the 4 new).
`tsc --noEmit`: clean.

## How to see it

    mkdir -p node_modules && for p in esbuild @esbuild typescript tsx playwright playwright-core; do ln -sfn /opt/npm-tools/node_modules/$p node_modules/$p; done
    # the sheet
    node tools/preview.mjs src/dev/preview_true_left.ts shots/true_left/cells4.png 1100 1400 "cells:4" | grep CELLS > shots/true_left/cells4.json
    node tools/preview.mjs src/dev/preview_true_left.ts shots/true_left/cells6.png 1600 2100 "cells:6" | grep CELLS > shots/true_left/cells6.json
    python3 tools/sheet_true_left.py shots/true_left previews/true_left/knight_true_left.png
    # the film (and a contact sheet of every 20th frame)
    node tools/true_left_gif.mjs previews/true_left/knight_turning_4_and_8.gif 5 20
    # down-left turned a little either way
    node tools/preview.mjs src/dev/preview_true_left.ts previews/true_left/knight_down_left_turned_a_little.png 1520 578 "tries:5"
    # bare, from every side (any move, any moment; a list of views to compare)
    node tools/preview.mjs src/dev/preview_true_left_look.ts shots/tl_look.png 2900 1000 "rear:0:3"
    # in the game itself, switch off and on (it puts the switch back)
    node tools/build_to.mjs dist/true_left.html
    node tools/playtest.mjs --file dist/true_left.html --size 960x540 --scenario tools/scenarios/true_left.mjs --out shots/true_left/game
    # paint time, switch off and on
    node tools/preview.mjs src/dev/measure_paint.ts shots/measure.png 100 100 "warrior"
    node tools/preview.mjs src/dev/measure_paint.ts shots/measure.png 100 100 "warrior:trueleft"
    # nothing changes with the switch off: run in this tree and in main's, and compare
    node node_modules/tsx/dist/cli.mjs tools/hero_fingerprint.mts > shots/fingerprint.txt
    node node_modules/tsx/dist/cli.mjs --test tests/true_left.test.ts

## Frames and paint time

Counted by `art.of` with the switch off and on (every list, each frame once; the falls, the idle
habits and the making-ready are painted when first shown, the rest ahead of need):

| Figure | Today (front + back) | With true left | More | Pixels held, all painted |
| --- | --- | --- | --- | --- |
| knight, dungeon | 338 (169 + 169) | 658 (+ 160 + 160) | +320 | 5.0 MB to 9.1 MB |
| knight, town | 436 (275 + 161) | 854 (+ 266 + 152) | +418 | 5.8 MB to 10.9 MB |
| all three heroes, dungeon and town | 2,583 | 5,130 | +2,547 | 32.3 MB to 61.9 MB |

(The left views have no Whirlwind frames, 9 a view: it is always seen from the front.)

A frame takes about 4 ms to paint on this machine: measured in headless Chromium, two runs each, a
mean of 3.9 to 4.6 ms and a median of 3.5 to 4.0 ms for the knight's dungeon figure (his town
figure: 3.2 to 3.6 and 2.9 to 3.4). So true left facings add about 1.3 s of
painting for the knight's dungeon figure and 1.7 s for his town figure, a few milliseconds at a time.
What the game paints ahead of need for the knight in a dungeon went from 244 frames in 1.07 to 1.13 s
to 470 frames in 1.83 to 1.99 s; in town from 228 frames in 0.73 to 0.82 s to 438 in 1.40 to 1.57 s.
Not measured: a phone.

## What I looked at

Every picture above, at full size and cut out and enlarged: the eight true views of his stance, a
run frame and the Strike's blow; the down-left from 45 degrees toward you to straight left; each
left-facing pair side by side, for the sword's side and the light; every frame of the film's contact
sheet and two frames decoded from the GIF itself; and the knight in the game itself (the practice
room, `tools/scenarios/true_left.mjs`), walking and standing all four ways, switch off and on. What
that found and mended: the blade's glow showed through his body when the blade was behind him in the
true down-left (now it shines only as much of the blade as is seen); the film's arrow was cut off at
the foot of its pane.

## If he says yes: what the main chat would need to do

1. Decide up-right with him: keep today's over-the-shoulder view (his sword on his left side that
   one way), or the true one (side-on, the sword across his legs: tried and set aside on 6 Oct).
2. Look at the ranger and the mage facing left first: the switch is one for all three heroes, and
   only the knight was looked at here. Their painters add lights too (the bow, the staff's crystal):
   `bladeSeen` is the knight's alone.
3. Look at what a hero does when left standing (the knight looking about him in town, `klook`) and
   at the class card's making ready, which get `frontL` frames with the switch on and were not looked
   at.
4. Switch `TRUE_LEFT` on, run the whole unit suite and the full regression with it on, look at the
   game on a phone for the painting (twice the frames for each figure), and release as ever. Drop the
   switch from `__dbg` and the tests' "it is off" when it is on for good.
5. If he says no: delete `TRUE_LEFT`, `frontL`/`backL`/`turn<deg>` in `project`, `ActorArt.left`
   and its two uses, `bladeSeen`, `__dbg.trueLeft`, and this branch's dev files and test. Nothing
   else depends on them.

## Sent to the owner (8 Oct 2026, 02:55, by the art chat)

previews/true_left/knight_true_left.png (a copy is in this folder), with these words: "3 of 4: the knight facing left, as now (his picture turned over, so his sword swaps sides) and turned round for real. Turned for real, walking down-left he shows you his shoulder and his sword is hidden behind him. I'd keep him as he is now. Agree?" **HIS ANSWER, 8 Oct 2026, 08:23: "I like the true left, the skeleton, and the door".** Read as YES TO THE TRUE LEFT-FACING HEROES (the figure turned round for real, the weapon in its own hand, lit from the upper left), over the art chat's suggestion to keep him as he is. He was told at 08:25: "**True left: yes.** Heroes turn round for real instead of being flipped, so the sword stays in the same hand and the light falls from the upper left like everything else. Noted, over my suggestion to keep him as he is." and that it goes to the main chat to put in the game. It is also rule 7 of the heroes in the art rulebook he approved the same morning (branch `art/rulebook`, `docs/art/RULEBOOK.md`). SO THIS IS NOW THE MAIN CHAT'S TO BUILD FOR REAL (`TRUE_LEFT.on`), with the tests of section 8. The film of the knight turning through eight views beside four was NOT sent: it is a second question, for after his answer to this one. Before these went, at 00:53 on 8 Oct he wrote "If I’m not around to test phone speed continue on.  Keep going down the list", read as: leave the phone test until he is around and carry on down the art chat's list (decorations, the skeleton on the heroes' bones, true left-facing heroes, the two films of weight). He was told so at 00:54. Nothing of this is in the game; the main chat builds whatever he says yes to.

## The second question: eight directions (8 Oct 2026, 08:32 to 08:34, by the art chat)

After his yes to true left, the turning film was made again with its left half the four views TURNED FOR REAL (the game with `TRUE_LEFT.on`, as he chose) instead of the four as now: `knight_turning_true_4_and_8.gif` in this folder (`node tools/true_left_gif.mjs <out.gif> 5 20 true4`; the page takes `turn:<scale>:true4`). Sent at 08:32 with "Mock-up, not in the game. The knight turning on the spot. Left: four directions, turned for real, as you chose. Right: eight directions." Asked at 08:33: "Watch the turning film. Should the heroes turn through eight directions, or stay with four?" (eight was recommended, with "Twice the pictures, so a phone speed test comes first."). **HIS ANSWER, 08:34: "Eight (Recommended)".** So: EIGHT DIRECTIONS, EACH THE FIGURE TURNED FOR REAL, AFTER A SPEED TEST ON HIS PHONE (twice the pictures to paint and keep). Not built here: today the game knows four ways a figure faces (`render/figure.ts`); eight is the main chat's to build, behind a switch, once the phone test says it can afford it. It is rule 7 of the heroes in the art rulebook (branch `art/rulebook`).
