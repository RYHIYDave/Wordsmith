# The Chained One's new look: the gaunt chain-wraith (mock-up; branch `art/chained-look`)

An art helper's work on `art/chained-look`, from `origin/art/action-f5` (9c54eff: floors 1 to 5 done the action way, the Chained
One's approved moves in `src/art/chained_action.ts`). Nothing here is in the game until the main chat puts it there, on his yes. All
of it is **behind one switch that is off**, `CHAINED_LOOK = { on: false }` (`src/art/chained_look.ts`). With it off, every frame the
game shows of the Chained One, in all three of his states, is as it was (hashes below). No file of the game is changed.

## His words

- 1 Nov 2026, at 21:29: “The chained one is very much just shapes and probably needs more help with his look”.
- Asked which look, answered by 21:31: “Gaunt chain-wraith” (offered as: very tall and thin, skin drawn tight, wrapped in his own
  chains like bandages, chains dragging behind).
- He was told: a real body in place of the tube-and-ball figure; his moves as approved stay the same; a picture first.
- His first brief (9 Oct, `src/art/bosses3.ts`'s header): “A starved giant, muzzled (Recommended)” (grey skin over bone, rags, an iron
  cage bolted over his face; chains from his wrists, an iron ball dragged behind); he grows wilder as his chains break (at 66% and 33%
  of his life); “His chains drag him down (Recommended)” (his death). Kept: the muzzle cage, the wrist chains, the ball and the chains
  breaking.
- His floor is getting a new look, “Black iron prison (Recommended)”. The pictures here are on the pit's old stand-in floor (the one
  the action films used): that floor is not on this branch.

## What he looks like

A gaunt giant, **1.2 times as tall as before** (his head 128 of his lengths off the floor as he stands, the old 107; about two and a
half times the knight) and **much thinner**: his chest about two thirds as wide as the old's made as big, every limb thinner.

- **A real body, not tubes and balls.** Each limb, his trunk and his neck are one skin drawn from ring to ring (`art/skin.ts`
  `cloth`, as the Headsman made new's coat): lean thighs narrowing to bony knees with a kneecap; shins with the bone's edge catching
  the light down the front, the calf a knot of sinew behind, thin knobbed ankles; long thin arms under bony shoulders, a sharp elbow,
  a sinewy forearm wasted to a thin wrist; big bony hands with long knuckled fingers hooked like claws; long bony feet, the toes
  splayed and gripping the floor.
- **Skin drawn tight over bone**, pale grey: a narrow pelvis with the hip bones standing out; a waist wasted to nothing, the belly sunk
  under the ribs; five ribs a side grooved in the skin, three showing on his back too; a breastbone; collarbones like bars; shoulder
  blades and the knobs of his spine standing out of his hunched back; a long corded neck.
- **Wrapped in his own chains like bandages**: black iron chain wound up each forearm from the cuff and once round each upper arm,
  round each shin from the ankle iron and once round each thigh, and round his body from over his left shoulder blade down round his
  ribs and his waist. The links are a little bigger than the old chains' and lit at their edges, the flat ones showing their holes.
- **Rag strips**: a short torn clout bound with a strip, and five rag strips hanging from it that swing after him.
- **The iron cage bolted over his face**, black iron: a band round his brow, one under his jaw, one across his mouth; five bars bowed
  out over his face like a muzzle, a bolt where each crosses a band; straps over his crown; a lock on his left. Inside it, dark, and
  the pink burning there: his two eyes (flaring as he holds a blow) and embers deeper in. His lank black hair behind it.
- **His chains as before**, worked out through every move: from each wrist cuff to the floor and trailing (the right one's end a
  hook); from the ring at the back of his iron collar down his back to the iron ball dragged behind him; his ankle irons with broken
  stubs. The enemy's pink edge round all of him; nothing cyan.

## The pictures (`pictures/`)

- `chained_look_sheet.png` (1200 × 2271): him standing, from in front and from behind, three times as big, beside the knight; before
  (as he is in the game now) beside now; his face cage close (in front, roaring as a chain breaks, from behind); at the game's size in
  his pit (his lash, his whirl, the ball held high); as his chains break (whole; the first: his left chain snapping under his foot;
  the second: the ball's chain torn from his collar).
- `chained_look.mp4` (1200 × 676, 30 a second, H.264, 39.8 s, captioned): standing and walking; the lash from in front and from
  behind; the whirl from in front and from behind; the hook; the ball; struck; his death; his first chain breaking. All in his pit
  with the knight for size, twice the game's pixels.

## His moves: the approved ones, on the new body

Every move is the approved one, every key, every ease, every timing (`art/chained_action.ts`: the lash combo, the whirl, the hook, the
ball; the game's own `art/bosses3.ts`: his stand, walk, setting off and stopping, struck, his death, his chains breaking), and his
chains are the ones worked out through them. **All of it is made `LOOK_K` = 1.2 times as big**: his bones, every length of every
pose, his footwork and his chains (tests/chained_look.test.ts checks every key and every frame). So the same moves are a taller
figure's, exactly, and **his reach is 1.2 times as long**. The numbers the game uses that change with that (the main chat's, with his
yes; the rest are as approved):

| | approved | in the new look |
|---|---|---|
| the lash carries him (`LOOK_TRAVEL`) | 1.02 tiles (40 of the old lengths) | **1.22 tiles** (48) |
| the lash's reach (`LASH_REACH`): forehand, backhand, finisher | 3.42, 3.51, 4.32 | **4.11, 4.22, 5.19** (the crack still runs 2.4 to 6.4) |
| the whirl: his chains out | 2.94 tiles | **3.53** (its slam's ring is 3.5: see below) |
| the whirl: his chains' ends, half of them under | 30 game pixels (most 38) | 36 (most 45) |
| the hook's blow waiting: his fists come down | 2.07 tiles before him | 2.49 (inside its ring, 1.5 round 2.0) |
| his walk | 8 frames at 8 a second at 1.1 tiles a second | the same frames, a longer stride: at the game's 1.1 tiles a second they are shown at 6.67 a second (`walkFpsAt`) |
| the hook and the ball out across the room | from his hand | from his hand where it now is (`lookHookPath`, `lookBallPath`): the same ways and moments, to the same 4.5 tiles |

His canvas is made as much bigger: **504 × 408**, his floor point at (252, 283) (the old 420 × 340 at 210, 236).

## The switch, and bringing him in (the main chat's)

- `CHAINED_LOOK` (`art/chained_look.ts`), `{ on: false }`. Nothing of the game imports the file (the test checks it).
  `chainedLookMob(freed)` is the Chained One in his new look, as free as he is, with the moves of `chainedActionMob(freed)`;
  `makeChainedLookArt(pace, freed)` holds him as the game holds a monster (at the game's pace, 1.1).
- THE BESTIARY: `figure === 'chained' | 'chained1' | 'chained2'` → `CHAINED_LOOK.on ? makeChainedLookArt(undefined, freed) : …` (it
  needs `CHAINED_ACTION`'s moves: bring those in first, or with it).
- THE RULES: as `CHAINED_ACTION`'s (docs/mockups/action_f3_chained/README.md), with the numbers above that grow with him: move him
  `LOOK_TRAVEL` at the lash's end; the lash's and the whirl's reach 1.2 times; draw the hook and the ball out from `lookHookPath` and
  `lookBallPath`; his canvas `LOOK_CANVAS`. What he leaves on the floor when a chain breaks (`makeLeftBehindArt`) is still the old
  size: to be painted as big when he comes in.
- Scenes and tools: `src/dev/chained_look_scene.ts` (the action scenes with him in his new look, and his walk, struck, death and
  chains breaking), `tools/chained_look_sheet.ts` and `tools/chained_look_captions.py` (the sheet), `tools/chained_look_film.ts` (the
  film), `tools/chained_look_check.ts` (the review, either size), `tools/chained_look_peek.ts` (frames old beside new).

## The checks

`tests/chained_look.test.ts` (5 tests):

1. the switch off; nothing of the game imports the new look; **every frame the game shows of the Chained One hashes as before**, in all
   three states: chained `18277bbf16b90de0`, chained1 `f251451c0351c34f`, chained2 `28ae6fad9aaf4e04` (as recorded on 76b444b);
2. his moves are the approved ones, every key, ease and timing, made 1.2 times as big; his bones and his chains at every frame the
   game shows are the old ones made 1.2 times as big;
3. every frame of every move of his (stand, walk, the lash, struck, his death, setting off, stopping, the whirl, the hook, the ball,
   his chains breaking), from in front and from behind, in each of his three states, on his whole canvas: painted, the enemy's pink
   edge while he lives, crisp, no cyan, nothing cut off;
4. **THE WHOLE BOSSES' REVIEW** (`art/boss_checks.ts` `checkBoss`: SLIDE, FLOOR, ARM, THROUGH, JERK, JUMP, BLOW, HIPS, ALIVE,
   STRIKE), every frame of every move, from in front and from behind, in each of his three states, with every handing over, with his
   new body's solids (`lookSolids`; nothing goes through his new body): **on his bones at the size his moves were approved at, nothing
   found.** At his new size, the review finds five things and only these, each a step of the approved moves themselves that is just
   over one of the review's lines because the lines are in the game's pixels and he is 1.2 times as big (each is under its line at
   the approved size): the finisher, the step as his hips go just before the strike (4.04 game pixels; the line 4); the whirl, the
   gathering ending as the spin begins (stalls: either side 2.73 and 5.79, the line 2.5); the ball, his look round before he wheels to
   it; his walk, his head nodding as he lurches (3.3; the line 3); the ball's chain breaking, his hands taking hold of his collar.
   None was touched, so that every key and timing stays as he approved them;
5. taller and thinner: his head 1.2 times as high; every limb no thicker than the old's made as big, his chest under 85% as wide.

Also: `tsc` clean.

## For him to decide (the art chat's to ask)

- **His size**: 1.2 times as tall makes his reach 1.2 times as long (above). The whirl's chains now reach 3.53 tiles against its
  slam's ring of 3.5: the ring could grow to 4.0 to stay wider than his chains (a rules number; his rule is bigger areas), or he could
  be made a little less tall.
- His floor: the pictures are on the old stand-in floor; he is drawn pale grey, black iron and the enemy's pink to read on the black
  iron prison floor when it comes.
