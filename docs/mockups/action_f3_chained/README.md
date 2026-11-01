# The Chained One: his moves done the action way (mock-up; branch `art/action-f3`)

An art helper's work on `art/action-f3` (from 76b444b: the game's `high-city` with floors 1, 2 and 3's mobs' new moves). Nothing
here is in the game until the main chat puts it there, on his yes. All of it is **behind one switch that is off**,
`CHAINED_ACTION = { on: false }` (art/chained_action.ts): with it off every frame the game shows of the Chained One, in all three of
his states, is the same, pixel for pixel (hashes below). His old moves are kept as they are (art/bosses3.ts).

## His words

- His review of every enemy for more action, 31 Oct 2026 (offered for him: the ball swung wide round the whole pit on its full
  chain): “He needs some work.  I think the action really needs to be applied to his moves”.
- Told he and the Amalgamation would get every move redone the action way (a huge held wind-up, a lightning-fast blow, bigger areas,
  a combo finisher where it fits) and offered a plan first: “Just draw it”.
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger
  AOE to compensate for the extra time the player gets to evade”).
- The ball swung wide round the pit was offered and he did not take it: it is not here.

## The pictures (`pictures/`)

- `chained_action.mp4` (1200 × 676, 48.5 s, captioned): each move in his pit with the knight for size, from in front and from behind
  (twice the game's pixels): the lash combo and its crack; the whirl (the game's loop played once more, walking him after the knight)
  and its ring; the hook, the drag and the blow waiting; the ball held high, whipped down, its ring. Then each of the seven strikes at
  half speed (three times the game's pixels; the finisher at twice, to show its crack running out). Then his lash once more at his third state, free of the ball and of his left chain.
- `chained_action_sheet.png` (1200 × 3640): five key moments of each move from in front and from behind; his old lash beside the new;
  the crack and the three rings in his pit.

## The moves (seconds, and frames at 30 a second; tiles from where he stood as the move began)

Every blow: a big wind-up HELD (his eyes flaring in the cage: the warning); his hips go a frame or two before it; the strike in
**two frames**, smeared with after-images of his arms and his chains (`coSmeared`); a big wind-down. His chains swing as chains do,
worked out through every move (art/boss_chains.ts), in each of his three states.

### THE LASH, a combo (`attack`; old: one lash, its blow at 0.86 s, reach 3.2)

He cocks his fist behind his head, the chain hanging down his back, and HOLDS; his hips go; the FOREHAND cracks the chain down
before him as his left foot strides in. He brings the fist up across him to over his left shoulder, HOLDS; the BACKHAND whips it
down across to his right as his right foot strides through. Then THE FINISHER: both fists up over his head, arched back, HELD the
longest; brought down together before him, his left foot stamping in, his chains slammed on the floor, and THE CRACK splits the
floor on out along the way he faces. Folded over his fists, heaving; up.

| | |
|---|---|
| the move | **3.6 s** (frames 0–108) |
| the forehand | cocked by 0.433 s (f13), HELD to 0.733 (f22), hips go to f24; **strike f24–f26 (0.8–0.867 s)**, its blow 0.867 |
| the backhand | up over his left shoulder by 1.4 s (f42), HELD to 1.6 (f48), hips go to f50; **strike f50–f52**, its blow 1.733 |
| the finisher | fists up by 2.333 s (f70), HELD to 2.8 (f84), hips go to f86; **strike f86–f88**, its blow **2.933** |
| reach (`LASH_REACH`: his chains below a man's waist, in the third of a second after each blow) | forehand **3.42**, backhand **3.51** (across to his right), finisher's chains **4.05** (4.32 with both chains) |
| THE CRACK (art/chained_action_fx.ts `CRACK`) | from **2.4 to 6.4 tiles** before where he began, **1.6 wide** (half 0.8); runs out in 0.15 s (`crackReach`, `crackStrikes`); its lips cool, it closes by 1.8 s |
| its warning | the lane marked (as the game marks a lane) from his fists going up, 2.333 s: 0.6 s before the finisher |
| he steps in | **1.02 tiles** in all (`LASH_TRAVEL`, 40 of his lengths): the game moves him there as it ends (`shift`, as the Headsman made new's moves) |

### THE WHIRL (`whirl`; old: three turns in 1.05 s, 1028 degrees a second, his chains out 2.83 tiles)

Crouched and wound round to his right, his arms out low, his hands swinging his chains round in loops beside him, his body HELD:
the chains GATHERED. Then he spins on the ball of his left foot, his right foot off the floor and carried round, his chains flat out
round him at a man's height, a streak of fire behind their ends; the game walks him after you as before (1.7 tiles a second). As he
slows his fists come up over his head, his chains swirling up round him; HELD; slammed down before him: A RING goes out round him.

| | |
|---|---|
| the move | **3.4 s** (frames 0–102), and the game's loop |
| the gathering | crouched by 0.3 s, wound by 0.567, HELD (the chains swung round beside him) to **1.0 s** |
| the spin | from 1.0 s; full speed **1440 degrees a second, four turns a second**, from 1.15 s; slowing from 2.203 s; still at 2.483 s; five turns in all |
| the loop (`WHIRL_LOOP`) | **from 1.567 s, 0.5 s long (two turns)**: the game may play it round and round as long as it likes; his chains are drawn to close on themselves there (`closedSpin`), so nothing leaps, played round or straight on |
| his chains | out **2.94 tiles** as he spins (old 2.83), their ends at a man's height (21 to 38 game pixels; half under 30) |
| the finisher | fists up from 2.2 s; HELD to 2.7 (f81); **strike f82–f84 (2.733–2.8 s)**, its blow **2.8** |
| THE RING (`RING.whirl`) | **3.5 tiles** round him; marked from 2.2 s (his fists going up): 0.6 s before the slam |

### THE HOOK (`hook`; old: let at 1.2, it bit at 1.52 at 4.5 tiles, back at 2.6, 3.15 s)

Whirled over his head; drawn back behind his shoulder, his left arm pointing at you: AIMED, HELD; his hips go; FLUNG in two frames,
and the hook flies out low and lightning fast (the game's to draw, as now: `actHookPath`); it catches you and he drags you in, two
hands on the chain, two hauls; then THE BLOW WAITING: the chain let fall, his fists up over his head, HELD, and hammered down
before him where you lie.

| | |
|---|---|
| the move | **3.7 s** (frames 0–111) |
| the aim | whirled 0.3–0.9 s; aimed by 1.1 (f33), **HELD to 1.5** (f45), hips go to f47 |
| the fling | **strike f47–f49 (1.567–1.633 s)**: it leaves his hand at **1.633** (`HOOK_LET`) |
| it bites | **1.733 s, three frames later, however far it flies** (`HOOK_BITE`): as far as 7.5 tiles in a tenth of a second |
| the drag | two hauls, 1.933–2.1 s and 2.267–2.467 s (`HOOK_PULLS`); in at his feet at **2.467** (`HOOK_BACK`) |
| the blow waiting | fists up by 2.733 (f82), HELD to 2.933 (f88), hips go to f90; **strike f90–f92 (3.0–3.067 s)**, its blow **3.067** |
| its ring (`RING.hammer`) | **1.5 tiles** round where his fists come down, **2.0 tiles** before him; marked from 2.567 s: you are free 0.6 s before it lands |

### THE BALL (`ball`, while he has it; old: hurled at 1.78, it landed at 2.22 at 4.0 tiles, 1.5 round)

Turned round to it, taken up and heaved to his chest as before; pressed up over his head and HELD HIGH, trembling; drawn back behind
his head, arched, HELD; his hips go; WHIPPED over the top and down in two frames: it flies low and fast and crashes down ahead, A BIG
RING where it lands. Folded after it; hauled back and dragged round behind him as before.

| | |
|---|---|
| the move | **4.483 s** |
| held high | 1.5 to 1.9 s (f45–f57); drawn back by 2.1 (f63), HELD to 2.2 (f66), hips go to f67 |
| the whip | **strike f67–f69 (2.233–2.3 s)**: it leaves his hands at **2.3** (`BALL_LET`) |
| it lands | **2.467 s, five frames later** (`BALL_LAND`), **4.5 tiles** before him (`BALL_REACH`; old 4.0) |
| THE RING (`RING.ball`) | **2.5 tiles** round where it lands (old 1.5); marked from 1.5 s (held high): about a second to get out |
| back | at his feet at 3.633 s (`BALL_BACK`), dragged round behind him by the end (as the old, 0.373 s later) |

### His walk

Kept at **1.1 tiles a second**, as it is: he is 1.5 and 2.2 times as quick as his chains break (1.65 and 2.42), and his attacks are
now quick and wide. If he reads plodding beside them, the game can quicken him by its own numbers alone (his walk's frames are
shown faster at a faster pace, as they are at his later states): see "For him to decide".

## The switch, and bringing it in

- `CHAINED_ACTION` (art/chained_action.ts), `{ on: false }`. Nothing of the game imports the file. `chainedActionMob(freed)` is the
  Chained One as free as he is with these moves: his stand, walk, setting off and stopping, struck, his death and his chains breaking
  are the game's own (the very same moves); his `attack`, `whirl`, `hook` and `ball` these. `makeChainedActionArt(pace, freed)` holds
  him as the game holds a monster. Made the first time asked for (his chains for these moves are worked out then, as his others are).
- Hashes of every frame the game shows of him (tools/action_f3_chained_hash.ts), on 76b444b and on this branch, the same:
  **chained `18277bbf16b90de0`, chained1 `f251451c0351c34f`, chained2 `28ae6fad9aaf4e04`**.
- Changed outside these files (no frame of the game's changes; hashes above):
  - art/bosses3.ts: `CO_KIT`, what these moves are built on said again by name (his body, chains, poses, helpers), and
    `CoChainPlan` exported. Nothing else.
  - art/boss_checks.ts: an optional `blows` for a move of more than one blow (a combo): each blow reviewed as one is (STRIKE,
    BLOW, HIPS) within its own stretch of the move, every strike the flash JERK does not hold to its rules. A move it does not name
    is reviewed exactly as before (the same code path; every boss's test passes as before).
  - tests/new_mobs3.test.ts: `chained_action` added to its list of the mock-ups built on the new monsters, as floors 2 and 3's were.
- To bring it in (the main chat's):
  - THE BESTIARY: `figure === 'chained' | 'chained1' | 'chained2'` → `CHAINED_ACTION.on ? makeChainedActionArt(undefined, freed) :
    makeChainedArt3(undefined, freed)` (or move the file's moves into art/bosses3.ts as the art chat's work is brought in).
  - THE RULES (`ACTS.chained`, `CHAINED`): `lash` long 3.6, its blows at `LASH_HITS` (0.867, 1.733, 2.933): the forehand and
    backhand a line before him to `LASH_REACH` (3.4; the backhand sweeping across to his right, 3.5), the finisher the crack's lane
    (`crackStrikes`, from 0.5 tiles out to `crackReach(t)`, half 0.8) as it runs; move him `LASH_TRAVEL` (1.02 tiles) as it ends
    (`shift`, as `HEADSMAN2_FIGHT.shift`); mark the lane from 2.333 s. `whirl`: its pictures 3.4 s; harm from 1.15 s (full speed)
    to 2.2 s within 2.94 tiles (his right chain's bearing turning at 25.13 radians a second; `chainEndAt` gives it at any moment);
    `loop: { at: 1.567, span: 0.5 }`; walk him after the hero as now (`CHAINED_SPIN`); the ring at 2.8 s, 3.5 tiles round him,
    marked from 2.2 s. `hook`: long 3.7, `let` 1.633, `bite` 1.733, `back` 2.467, `pulls` as `HOOK_PULLS`, its path `actHookPath(t,
    reach)` (from 2.06 tiles before him, 0.69 to his right, 39.6 game pixels up; home 0.08 before him); the blow waiting at 3.067,
    1.5 round a point 2.0 before him, marked from 2.567. `ball`: long 4.483, `let` 2.3, `land` 2.467, `back` 3.633, `reach` 4.5,
    `r` 2.5, `warnFrom` 1.5; its path `actBallPath(t)`. Damage and cooldowns are the rules' (a suggestion: as now).
  - THE FLOOR (render/bossfx.ts): `crackPainted(t, layer, way)` on `CRACK_CANVAS` anchored `CRACK_MID` (4.4 tiles) before where he
    began, `way` the way he faced (a few ways each frame, or by sixteen ways round, kept); `ringPainted(t, layer, radius)` on
    `ringCanvas(radius)` anchored at the ring's middle. The floor layer under the figures; the air layer by halves, `'behind'` before
    a figure at the anchor and `'before'` after it. `t` is seconds from the blow; nothing after `CRACK.long` and `RING.long`.

## The checks

`tests/action_f3_chained.test.ts` (5 tests, all pass, about 70 s):

1. the switch off; nothing of the game imports the mock-up; his stand, walk, struck, death, setting off, stopping and chains
   breaking are the game's own in all three states; the game's own four moves kept;
2. every frame of the four new moves, in each of his three states, from in front and from behind, on his whole canvas: painted, the
   enemy's pink edge, crisp, no cyan, **nothing cut off**;
3. **THE WHOLE BOSSES' REVIEW** (art/boss_checks.ts `checkBoss`, on the heroes' bones: SLIDE, FLOOR, ARM, THROUGH, JERK, JUMP,
   BLOW, HIPS, ALIVE, STRIKE), **every frame of every move of his, from in front and from behind, in each of his three states**,
   each blow of each combo its own, with every handing over (from his stand at every frame into each move and back; the lash ending
   where his steps have taken him; into his walk and out of it; his chains breaking into his next state; the whirl's loop closing
   on itself): **nothing found**;
4. Movement 9: each of the seven blows held before it and struck in two frames (four times faster and more), smeared on its frames
   and only then, landing on its last; the forehand further than the old lash, the finisher's chains past 4 tiles, the crack to
   6.4; the whirl four turns a second (the old: under three), as wide or wider, at a man's height, its ring wider still; its loop
   closed; the hook biting three frames after it leaves his hand, half way to 7.5 tiles in a twentieth of a second, back at his
   feet, the blow waiting half a second and more after the drag; the ball further, faster, its ring bigger;
5. the floor: the crack and the three rings, their numbers; at every frame, eight ways round for the crack: nothing cut off, crisp,
   no cyan, the enemy's pink at their leading edges, nothing after.

Also passing: `tests/floor3.test.ts`, `tests/bosses.test.ts`, `tests/new_mobs3.test.ts`, `tests/action_f2.test.ts`,
`tests/action_f3.test.ts`; `tsc` clean. `tests/first5_bosses.test.ts`: all pass but its test 10 (the royal shadow's size, “the
rshadow: 10 to either side; the picture reaches 8”), which fails on 76b444b the same way: not this branch's.

Made by: `tools/action_f3_chained_film.ts` (the film), `tools/action_f3_chained_sheet.ts` and `tools/action_f3_chained_captions.py`
(the sheet), `src/dev/action_f3_chained_scene.ts` (the scenes, on floor 1's stand-in floor; the game's red circle and lane drawn by
the game's own code through a stand-in canvas), `tools/action_f3_chained_hash.ts` (the hashes).

## For him to decide (the art chat's to ask)

- The lash as his every basic attack (3.6 s, three blows and the crack), or a quick single lash kept between combos (his rule of
  9 Oct: "They should always have a basic, single target attack").
- The whirl's spin at four turns a second for five turns (and the game's loop), on one foot; its ring 3.5 tiles.
- The blow waiting at the end of the hook: whether he should be able to roll out from under it (as drawn: free 0.6 s before it).
- The ball's ring at 2.5 tiles, 4.5 tiles off, a second's warning.
- His walk at 1.1 tiles a second (kept), or quicker to go with his new speed (say 1.4: a rules number only).
