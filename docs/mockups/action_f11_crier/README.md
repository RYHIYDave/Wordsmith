# The Crier: every move done the action way (mock-up; branch `art/action-f11-crier`)

An art helper's work on `art/action-f11-crier` (from `art/action-f11` bf48311: floors 1 to 15's mobs' new moves and the bosses
before). Nothing here is in the game until the main chat puts it there, on his yes. All of it is **behind one switch that is off**,
`CRIER_ACTION = { on: false }` (art/crier_action.ts): with it off every frame the game shows of the Crier, and all it draws of his
moves on the floor, is the same, pixel for pixel (hashes below). His old moves are kept as they are (art/crier.ts,
art/crier_moves.ts, art/crier_shots.ts).

## His words

- His review of every enemy, 31 Oct 2026: offered “Shout off the walls, in place of the cone: his silent shout hits the square's
  walls and bounces back across from three sides. Find the one spot none of them reach”, he answered “Crier needs more work as
  well”. Read as: every move of his redone the action way, as the Chained One and the Amalgamation (whose answer, when told the same,
  was “Just draw it”).
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”); for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to
  compensate for the extra time the player gets to evade”); and his rulebook's Monsters 9, Action, like a movie (his yes, 1 Nov).

## The pictures (`pictures/`)

- `crier_action.mp4` (1200 × 676, 51.5 s, 30 a second, H.264 yuv420p, captioned): the trumpet swing from in front and from behind
  (twice the game's pixels); THE SHOUT OFF THE WALLS OVER THE WHOLE SQUARE FROM ABOVE (the game's own pixels, him from behind, the
  knight running round him to the one spot); the shout from in front and from behind; THE SCROLL DOWN A LANE OVER THE WHOLE SQUARE;
  the scroll from in front and from behind; HE CALLS THE CROWD OVER THE WHOLE SQUARE (the Hushed pouring in); the call from in
  front and from behind; then each of his six strikes at half speed.
- `crier_action_sheet.png` (1200 × 6805): four moments of the swing from in front and from behind; HIS OLD CONE beside THE NEW
  SHOUT over the whole square at three moments (the breath held, the one spot left plain; the wave crossing; the echoes back from
  three sides); the shout close, from in front and from behind; the scroll over the whole square and close; the crowd over the
  whole square and close.

The square is a stand-in (src/dev/crier_action_scene.ts): setts of the city's grey-violet stone, 16 tiles each way, the Gate Ward's
house fronts along its two far sides and their copings along its near two (cut away, so that it is seen), lanes running out of it.
The game's own Crier's Square is the game's.

## The moves (seconds, and frames at 30 a second; tiles from where he stood as the move began)

Every blow: a big wind-up HELD (the warning, his trumpet's throat flaring); the strike in **two frames**, smeared with after-images
of the bell (or the scroll in his hand) along the way it came (`crSmeared`: the strike's frames and the one after); a big wind-down.

### THE TRUMPET SWING, a combo (`attack`; old: one blow, its bell slammed down at 0.72 s, 2.6 tiles before him, 1.1 round)

The trumpet taken in both hands by its mouthpiece end and hauled back round to his right, his body wound away, HELD; swung round
across before him at full reach in two frames, his left foot striding in; carried on round and hauled back up over his left
shoulder, HELD; the backswing across the other way in two frames. Then THE FINISHER: raised straight up over his head, arched
back, HELD the longest; brought over the top and slammed down bell first at the end of a long stride, in two frames: the flags
crack and A RING OF SILENCE goes out over the floor (the game's own burst off the bell too). Heaved up; his left hand back to his
hip; his stand.

| | |
|---|---|
| the move | **4.2 s** (frames 0–126) |
| the swing | hauled back by 0.467 s (f14), HELD to 0.6 (f18); **strike f18–f20**, its blow **0.667 s** (`SWING_HITS[0]`) |
| the backswing | hauled back over his left shoulder by 1.333 s (f40), HELD to 1.6 (f48); **strike f48–f50**, its blow **1.667 s** |
| the finisher | raised overhead by 2.4 s (f72), HELD to 2.8 (f84); **strike f84–f86**, its blow **2.867 s**; up by 3.7, his stand by 4.2 |
| the sweeps (`SWEEP`) | the bell out **2.44** and **2.77 tiles** (its middle, as painted); for the rules **3.2** and **3.4** (the bell's size and the dead air off it), across **150 degrees** each: from 100 to his right round to 50 to his left, and back |
| the finisher's ring (`RING`) | the bell down **2.6 tiles** before him; the ring out **2.8 tiles** round it in 0.2 s (to **5.4** from him; old 3.7), lying 0.9 s |
| the warnings | each sweep marked on the floor from its haul back (f10 and f38: 0.27 and 0.33 s before its strike), the ring from f66 (0.6 s before) |

For the rules (a suggestion; damage the rules' own): `swingStrikes(i, fwd, left)` at each blow: the sweeps a hero within reach and
inside the arc, the finisher's ring a hero within 2.8 of where the bell lands.

### THE SHOUT OFF THE WALLS (`shout`, in place of the cone; old: the cone, 7.4 tiles out, 80 degrees wide)

The trumpet to his lips, its bell up, rearing back on his heels to fill his chest, HIS CHEST HEAVING, the air round the bell
RIPPLING (rings of it drawn in to the bell, faster and faster): HELD, a whole second, while THE WHOLE SQUARE IS MARKED in his pink,
its three walls lit along their feet, and ONE SPOT left plain, ringed in the Hush's pale: behind him, against the wall at his back.
Thrown into the shout in two frames, lunging, the bell levelled at the far wall, his coat thrown back: a WAVE OF SILENCE crosses the
square before him (a low wall of dead air, the floor going dark behind it), hits the walls, and COMES BACK ACROSS FROM THREE SIDES:
off the far wall back over him, off the side walls in toward his line. None of them reaches the one spot.

| | |
|---|---|
| the move | **3.333 s** (frames 0–100) |
| the breath | to his lips by 0.4 s (f12), drawn by 0.667 (f20), **HELD f20–f50 (1.0 s)**, heaving |
| the shout | **strike f50–f52**, it bursts at **1.733 s** (`SHOUT_HIT`); blowing, shaking, to 2.467 (f74); lowered by 3.333 |
| the warning | the square marked from 0.467 s (1.27 s before the shout); the one spot ringed from 0.667 s until the last echo is done |
| the wave (`WALLS`) | out from 0.6 tiles before him at **20 tiles a second**, over the half of the square before his shoulders; its front 0.45 deep |
| the echoes | back across at **16 tiles a second**, as wide as the square: the side walls' in to **1.3 tiles** of his line, the far wall's back to **1.6 tiles behind him**; the floor dark 1.2 s where any has passed |
| THE ONE SPOT | within 1.3 of his line, from 1.6 tiles behind him to the wall at his back (in the pictures, him 5 tiles from it: 2.6 by 3.4 tiles; the test finds it about 5 square tiles of the square's 256) |
| in the pictures' square | the wave at the side walls 0.37 s after the shout, at the far wall (11 tiles) 0.52 s; the side echoes done by 0.79 s, the far one by 1.31 s |

For the rules: at `SHOUT_HIT`, `wallsOf(square, him, way)` gives the walls in his frame; a hero within a front as it passes
(`shoutStrikes(s, fwd, left, walls)`) is struck; the old Hush (the hero's words dark) may go with it. Its numbers: `WALLS`,
`echoTimes`, `frontsAt`, `shoutSafe`.

### THE SCROLL DOWN A LANE (`proclaim`; old: a lane 8.6 tiles long and 2.5 wide, unrolled in 0.42 s, lying blank)

His left hand to his satchel; the decree drawn out and held up high over his hat, leaning back, its seal burning: HELD, while the
lane is marked down the square to the far wall. Flung down in two frames, his weight thrown after it: it lands and UNROLLS DOWN THE
LANE IN A SMEAR (the roll racing out, streaks of it behind, dust before); THE DECREE'S LETTERS BURN ALONG IT (made-up letters, no
real hand's, the cult's pink and gold, white where fresh), racing out from the near end and burning on; the floor under it is taken
away; then it crumbles into the Hush.

| | |
|---|---|
| the move | **2.8 s** (frames 0–84) |
| the decree | drawn f6–f11, held high by 0.6 s (f18), **HELD f18–f40 (0.73 s)**; **strike f40–f42**, flung at **1.4 s** (`PROCLAIM_HIT`) |
| the warning | the lane marked from 0.35 s (1.05 s before the fling) |
| the lane (`DECREE`) | from **1.3 tiles** before him to the far wall (at most **13.5**), **3.0 tiles wide** |
| the scroll | lands 0.1 s after the fling; unrolled to the end by 0.3 s (**in 0.2 s**); its letters lit at 40 tiles a second; burning to **4.3 s** after the fling; gone (crumbled) by 5.0 |

For the rules: the roll strikes once as it passes (`decreeFront`, as the old); then THE FLOOR TAKEN AWAY: a hero on it while its
letters burn (`decreeBurns`) is struck every 0.5 s (`DECREE.every`). He flings it only where its lane is open floor, as now.

### HE CALLS THE CROWD (`crowd`; old: three of the Hushed at a call, four once he is down to half, never more than six)

The trumpet lifted to his lips; he SINKS DOWN, the bell to the floor, his chest heaving as he draws the breath: HELD, while THE
HUSH WELLS UP in the mouths of the lanes into the square and in its doorways, pools of it, ringed in his pink, pinpoints of pink in
them. Flung upright, the bell up at the sky, in two frames: THE CALL (no sound: the game's own rings of the Hush going up out of the
bell, and rings rolling out over the square). Out of every pool the Hushed come up (the game's own, art/hushed_moves.ts) and
shuffle in at you.

| | |
|---|---|
| the move | **3.333 s** (frames 0–100) |
| the summons | lifted f6–f12, sunk down by 0.667 s (f20), **HELD f20–f46 (0.87 s)** |
| the call | **strike f46–f48**, at **1.6 s** (`CROWD_HIT`); blowing to 2.533 (f76); down by 3.333 |
| the pools | welling from 0.667 s (a second before the call); in the pictures **eight**: the four lanes' mouths and four doorways |
| the crowd (`CALL`) | out of each pool **two**, 0.35 s apart, the first 0.25 s after the call (0.08 s later each pool), each up out of it in 0.45 s: **16** in the pictures |

For the rules: the pools at the square's edges as now (`spotsFor`, the lanes' mouths first), more of them; `comesOut(i, k)` when
each comes; how many is the rules' (see "For him to decide").

## The switch, and bringing it in

- `CRIER_ACTION` (art/crier_action.ts), `{ on: false }`. Nothing of the game imports the file. `crierActionMob()` is the Crier with
  these moves: his stand, march, setting off and stopping, struck and death are the game's own (the very same moves); his
  `attack`, `shout`, `proclaim` and `crowd` these. `makeCrierActionArt(pace)` holds him as the game holds a monster (his canvas
  bigger, `CR_ACT_CANVAS` 560 × 500, for the trumpet swung round him at full reach in a long stride and raised over his head).
- What he sends out is painted by art/crier_action_fx.ts onto plain pixels through `at` (a floor point and a height to the
  picture): `paintSwing`, `paintShout`, `paintDecree`, `paintCall`; the rules' numbers by name (`SWEEP`, `RING`, `WALLS`, `DECREE`,
  `CALL`) with what strikes (`swingStrikes`, `shoutStrikes`, `shoutSafe`, `decreeFront`, `decreeBurns`, `comesOut`).
- To bring it in (the main chat's):
  - THE FIGURE: art/act1_figs/crier.ts `make: () => CRIER_ACTION.on ? makeCrierActionArt() : makeCrierArt()` (and its measure of
    him, top and half, taken again on the new canvas).
  - THE RULES (game/act1_rules/crier.ts `CRIER_ACTS`, `CRIER`), as the tables above say: swing long 4.2, its blows at 0.667, 1.667
    and 2.867 (`SWING_HITS`); shout long 3.333, hit 1.733, its fronts from the square's walls; proclaim long 2.8, hit 1.4, the lane
    to the wall, the floor taken away while it burns; crowd long 3.333, hit 1.6, more pools. Damage and cooldowns the rules' own.
  - THE FLOOR (render/act1_fx/crier.ts): the four painters onto a picture laid on the floor layer (the decree in the air while it
    flies, sorted by its floor point, as the scene here does), or their few drawing calls turned into the canvas's.
- Changed outside these files (no frame of the game's changes; hashes below): tests/crier.test.ts, its import check skips
  art/crier_action*.ts; tests/new_mobs3.test.ts, the two files added to its list of mock-ups.

## The checks

`tests/crier_action.test.ts` (6 tests):

1. the switch off; nothing of the game imports the mock-up; his stand, march, setting off and stopping, struck and death the
   game's own; the game's own moves kept;
2. **the game's frames the same**: every frame of the Crier, both ways round, and what the game draws of his moves on the floor,
   hash as on bf48311 (tools/crier_action_hash.ts): **crier `7efa5e84c62bd0c5`, his moves on the floor `74c2635fc68cedfb`**;
3. every frame of the four new moves, from in front and from behind: painted, the enemy's pink edge, crisp, no cyan, **nothing cut
   off**;
4. **THE WHOLE BOSSES' REVIEW** (art/boss_checks.ts `checkBoss`: SLIDE, FLOOR, ARM, THROUGH, JERK, JUMP, BLOW, HIPS, STRIKE),
   every frame of every new move, from in front and from behind, each blow of the swing its own, every handing over: **nothing
   found**;
5. Movement 9 and the numbers: each of the six strikes two frames, held before it, a flash, smeared then only, landing on its last
   frame; the sweeps, the ring, the lane, the crowd bigger, wider or further than the old;
6. what he sends out: crisp, no cyan, the enemy's pink, nothing cut off, nothing after; THE SHOUT OFF THE WALLS strikes every spot
   of the square (a tenth of a tile apart) at some moment but the one spot, which none reaches.

Also: `tsc` clean; `tests/crier.test.ts` and `tests/new_mobs3.test.ts` as before (see the final report for the run).

Made by: `tools/crier_action_film.ts` (the film), `tools/crier_action_sheet.ts` and `tools/crier_action_captions.py` (the sheet),
`src/dev/crier_action_scene.ts` (the scenes), `tools/crier_action_hash.ts` (the hashes), `tools/crier_action_peek.ts` and
`tools/crier_action_review.ts` (the helper's own looks while drawing).

## For him to decide (the art chat's to ask)

- THE SHOUT'S ONE SPOT is always behind him, against the wall at his back: you run round him while he holds the breath (a second
  and more). Where his back is to a wall there is no spot: the rules should let him shout only with room behind him (3 tiles or
  more), or turn him first. Or the spot somewhere else.
- The shout: each front hurts as it passes; whether it also darkens your words (the old cone's Hush) as before.
- The swing's first blow is held the least (0.13 s, after a 0.2 s haul back; the backswing 0.27 s, the finisher 0.4 s): longer if
  it is too quick to read.
- The crowd: 16 at a call in the pictures (two from each of eight pools), against the old three or four and never more than six.
- The decree's letters burn 4 seconds down the whole square: floor taken away, a hero on it struck every half second.

## 2 Nov 2026: THE TOLL FOLLOWS YOU, in place of the trumpet swing (branch `art/action-fixes`)

**Where this and the text above differ, this holds: his basic (`attack`) is now the toll; the trumpet swing combo is no longer one of his
moves** (its code and its floor painter `paintSwing` are kept, out of his set). His shout off the walls, scroll and crowd stay.

His words, 2 Nov 2026, 07:32: “Okay now I need you to look at how many enemies do a small hit, small hit, slam combo.  I feel like you over corrected to that a little too much.” Asked which keep it: “Chained One and troll (Recommended)” (offered as: the first two to get it; the Amalgamation, Crier, reapers, gardener and guard each get something new). Asked what the Crier gets in its place (answered by 07:46): “The toll follows
you”, offered as: he rings his handbell; a toll marks where you stand and bursts a beat later, again and again. Keep moving.

**HE HAD NO HANDBELL: it hangs at his belt now, at his left front (a brass bell on a turned wooden handle, hanging mouth down), in every
frame of his set: his frames change by it** (his stand, march, struck and death are the game's own moves, painted with the bell).

THE TOLL (art/crier_action.ts `TOLL`, `TOLL_HITS`, `TOLL_STRIKES`, `HANDBELL`, `tollStrikes`): his left hand takes the bell from his belt
and raises it high over his hat, arched back, HELD, shaking, its lip glinting pink; RUNG in two frames, swung down and out before him,
smeared, a ring of the Hush shaken out of its mouth: the first toll; swung back up, held again, rung again: FIVE TOLLS. Each lays a mark
where the hero stands THEN (a ring of the Hush's grey, the enemy's pink at its edge, a pale ring closing in on its middle as it counts
down), bursting a beat later in a ring of silence (a flash, the Hush boiling up out of it). Then the bell back to his belt.

| | |
|---|---|
| the move | **4.2 s** (frames 0–126) |
| the bell taken | from his belt by 0.333 s (f10); raised high by 0.6 s (f18); **HELD to 0.9 s** |
| the tolls | **strike f27–f29, f43–f45, f59–f61, f75–f77, f91–f93**: rung at **0.967, 1.5, 2.033, 2.567, 3.1 s** (`TOLL_HITS`; 0.533 s apart); each after the first swung back up in 7 frames and HELD 5 (0.17 s) |
| each mark | where the hero is at the toll, **1.6 tiles round** (`TOLL.r`: 3.2 across), **bursting 0.6 s later** (`TOLL.burst`) |
| after | the bell back at his belt by 3.6 s (f108); his stand by 4.2 s |

For the rules (a suggestion): `attack` long 4.2; at each of `TOLL_HITS` lay a mark at the hero's place; at it plus `TOLL.burst`, strike a
hero within `TOLL.r` of it (`tollStrikes(x0, y0, x, y)`). The mark and its burst are painted in the pictures by `tollFloor` in
src/dev/action_fixes2_scene.ts (to move into art/crier_action_fx.ts as the others are, when it is brought in). His figure:
`makeCrierActionArt()` as before.

Checks: `tests/crier_action.test.ts` updated: test 4 (the whole bosses' review, every new move both ways, the toll's five tolls each its own
blow, the handbell a thing in his hand): nothing found; test 5 (each toll two frames, held, smeared then only; the first held 0.3 s, each
later one 0.17 s; five tolls, marks 1.6 round bursting 0.6 s later, the bell over his hat and rung down before him). The game's frames
hash as before.
