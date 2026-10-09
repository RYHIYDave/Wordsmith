# Mock-up: THE MONSTERS' NEW ATTACKS (NOT IN THE GAME until the main chat puts them there)

**What it is.** New moves for the monsters that are in the game, drawn to the owner's monster rules
of 9 Oct (given in the main chat), each behind a switch that is off. First the trolls': the green
troll (the brute) and the red troll (the guardian). Next, the Warden's.

**Where:** the branch `art/monster-attacks`, from `main` at `e3985f9` (Version 19.6 and its handoff).

## His words

- To the main chat, 9 Oct (that chat's post of 08:30 on the board): monsters by size (tiny the bats,
  small the skeletons, medium the green trolls, large the red, and the boss); tiny and small have one
  attack, medium two, large two or three, the boss four, and always a basic single-target attack to
  use while the big ones cool down (the bigger the hit, the longer the cooldown). His yes, by 08:15:
  the green troll a club swing and its slam; the red troll a club swing, a slam, and a charge along a
  marked line; the boss a swing, his slam, his fan of bolts, and his skeleton summon. At 08:24: "Pack
  leaders that are different mobs can have an extra attack if it seems right."
- To the art chat, 9 Oct, by 09:17: "It’s not the big red circles I have a problem with, it’s that
  every attack is a big slam on the ground.  Use the same logic we do with characters, ask questions
  about the larger enemies and develop attacks that are thematic". By 09:30, asked about the trolls:
  "Club sweep and a charge (Recommended)"; and at 09:30: "I made some changes in the main chat
  regarding monsters. Please get with the other agent and apply those changes to your designs." So
  the main chat's list is followed where the two differ: the charge is the red troll's alone (he was
  told so).
- By 09:57, to `troll_swing.gif`: "Yes, keep it (Recommended)"; to `troll_charge.gif`: "Yes, keep it
  (Recommended)".

## The trolls (`src/art/monster_brute.ts`, behind `TROLL_MOVES`, off)

- **The swing** (`swing`, both trolls; the basic blow): both fists on the club, cocked back slantwise
  over his club-side shoulder and held there (the warning: not his slam's, which is the club straight
  up over his head), then swung round him level, through straight ahead (the blow, at `SWING_HIT`,
  0.6 s), and on round to his other side. The club's head leaves a streak along the oval it goes round:
  a smear of air for the green troll's plain club, the light of its burning bands for the red's.
- **The slam** stays as it is, red circle and all.
- **The red troll's charge**: `chargeWind` (a roar; his head goes down; he scrapes a foot back twice,
  kicking up the floor's dust; he sets off at `CHARGE_GO`, 0.9 s), `charge` (head down, running, the
  club hauled at his side: a loop, for as long as the rules have him run) and `chargeStop` (he digs a
  foot in and rears back, skidding, and stands).
- **The line he will run along** (`src/art/charge_lane.ts`, `drawChargeLane`): the red circle's own
  kind, in its reds: a faint lane from him to where he will stop, darkening as the moment comes, a fill
  that runs out to its far end as his wind-up runs out, chevrons along it pointing the way he will come.
  While he runs it, what he has left behind fades.

## For the main chat

- Switch on with `TROLL_MOVES.on = true` before the art is made (`makeBruteArt`, `makeGuardianArt`).
- The new moves are clips in `AnimSet.clips.moves` (new, optional: `art/actor_types.ts`), by name:
  `swing` (both), `chargeWind`, `charge` (with `loop`), `chargeStop` (the red troll). They are made as
  `attack` is (`art/kit.ts` `Moves.more`, `art/mkit.ts` `MonsterMoves.more`), and each `hit` is where
  its blow lands (the swing) or where he sets off (the charge's wind-up). Which is played when, and
  what each does, is the rules'.
- The charge's line: a zone of its own kind from the troll to the end of his run, drawn under the
  figures where render.ts draws the 'warn' zone, with `drawChargeLane(g, { x0, y0, x1, y1, half, k,
  gone }, (x, y) => [wx(cam, x, y), wy(cam, x, y)])`: `k` the wind-up's part gone (0 to 1), `gone`
  while he runs, how much of the way he has come.
- Nothing else of either troll changes: with the switch off or on, every frame they had is as it was
  (tested).

## How it is checked

- `tests/troll_moves.test.ts` (5): the switch is off, and the trolls' old frames are the same with it
  off and on; the green troll swings, the red swings and charges, each a clip (the blow, or setting
  off, on its frame; the run going round); every frame paints, has the pink edge and no cyan, nor any
  cyan light; the swing's blow leaves its streak, and its warning is not the slam's; the charge kicks
  up dust; its line is in the circle's reds, fills as the wind-up runs out, and is gone behind him as
  he runs. tsc clean.
- The pictures: `src/dev/preview_troll_moves.ts` (through `tools/preview.mjs` and `tools/page_gif.mjs`):
  `troll_moves.png` (`sheet:2`), `troll_swing.gif` (`swing:2`: each swings, then slams as today),
  `troll_charge.gif` (`charge:2`).

## Next on this branch

The Warden's swing, and a pose for his summon (the skeletons rising out of the floor), pictures first.
