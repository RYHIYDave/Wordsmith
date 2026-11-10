# The art review's small tweaks (9 Nov 2026)

Branch `mockup/art-tweaks`, from `main` at 1eeecea8 (25.3.1). From a chat the owner opened to look at the game's art as a
whole. FOR THE MAIN CHAT TO BRING IN: he has said yes to all of it (below).

## What he asked

His words, 9 Nov 2026, 19:05: “I like the style, but it seems like every time I want to redo something, the quality of the
drawing increases by a magnitude that makes the rest of the game look bad in comparison, and makes me need to redo
EVERYTHING.  I don’t want to keep redoing everything so I want to find a good level of quality and have the little things
be better instead of just improved paintings”.

## His yes

- Shown the review, asked what to do with it next: “More test pictures (Recommended)”.
- Shown the four tests (pictures 4 to 7), asked which to hand to the main chat to put in the game:
  “Health bars,Blocks and shadows,Quieter field,Life globe” (all four).
- Shown floor 3 lifted (picture 2), asked “Floor 3's stone lifted ... (57% near-black down to 35%)?”:
  “Yes, as shown (Recommended)”.

## What is on the branch

1. `src/art/tweaks.ts` ART_TWEAKS: five switches, ALL OFF. With them off the game is as it was (floors 6 and 13 pictured
   against Play.html: the same but for a small box round the hero). Turn each on to put it in.
   - `bars`: one of a pack that carries a word shows its life bar only once it is hurt, hit or locked onto; the pack's name
     is written as before. `render/render.ts` drawBars. Picture 4.
   - `cast`: under each prop that has a shadow, a second soft shadow falling to one side. A cut block's shadow sat wholly
     under it, so none was seen. Floors 1 to 5 (`render/pieces.ts`) and 6 to 10 (`render/render.ts`). PROPS ONLY: heroes and
     monsters keep theirs straight underneath. FLOORS 11 TO 20 WERE NOT LOOKED AT. Picture 5.
   - `blocks`: floor 6's cut blocks as hewn stone (`art/floor6.ts` hewn, hewnBlock, hewnStack, finishOwn): a little longer
     one way, turned a little, a corner knocked off; the seam round the outside in the deep shade of what it borders, not
     the ink. The sledge's block and the crane's with them. Painted as the floor is made: turn it on before. Picture 5.
   - `field`: floor 13's corn quieter (`art/millrace.ts` stalkAt, stubble): a fifth fewer clumps, each over two tones and
     not four, the stubble a tone lower. By a rough measure the open ground is a third quieter (11.5 down to 7.4). Painted
     as the floor is made. Picture 6.
   - `globe`: the life and mana globes as glass in an iron band (`ui/hud.ts` globeGlass): a shaded side, a glint, four
     rivets; the ring that tells what ails the hero kept. One game pixel wider each way. Picture 7.
2. FLOOR 3'S STONE LIFTED, NOT BEHIND A SWITCH (the look he said yes to): `art/prison.ts` STONE and FLAGS, and
   PRISON_LIGHTS.dark 0.8 to 0.65; the same stone said again in `art/stoker_room.ts` ROOM_STONE and `art/chapel.ts`
   PRISON_STONE, lifted with it. The old values are in the comment above STONE. Its biggest room 56.8% near-black to 35.3%;
   the Chained One's hall 46.4% to 28.9%. Thinning the dark alone did little (57% to 50% at 0.5): the stone itself was
   painted nearly black.

## Not done, and why

- THE REST OF THE DARK FLOORS. Near-black share of the play area, one big room each, the map shown: floor 5 55%, floor 12
  40%, floors 2, 4 and 15 about a third. Floor 5 looks like floor 3's case. Not tried.
- UNEVEN PIXELS. `engine/screen.ts` picks a whole number of screen pixels to a game pixel, and the picture holds two
  picture pixels to a game pixel. When that number is odd (5 at 844x390 x3, the size the project's phone pictures are taken
  at) each picture pixel is 2.5 screen pixels: 2 and 3 by turns (picture 3). His iPhone 16 held sideways is on the edge
  (4 with the home bar's strip left out, 5 without). To be looked at on his phone first.
- (A LEVEL TO HOLD NEW ART TO is now his rule: `docs/art/RULEBOOK.md`, How art is made and approved 10, “Yes, add it (Recommended)”, 9 Nov. His living doc is still to be given it. Picture 1 is why: the Warrior before and after his last redo, three times as big and at the game's size.)

## Checked

`tsc` clean (it needs NODE_OPTIONS=--max-old-space-size=4096 or more). Pictures at 844x390 x3 of everything above, as it is
and as tried. `node tools/unit.mjs --only prison,prison_way,stoker,new_mobs3,chapel,floor6,millrace,act2_millrace,floor13,terrain,lifebar`
(and the core) on b6f3d06e: UNIT DONE b6f3d06ebf: 34 files, 34 passed, 0 failed (0 passed alone); 396 tests. The other 378
test files were not run.
