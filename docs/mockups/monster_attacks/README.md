# Mock-up: THE MONSTERS' NEW ATTACKS (NOT IN THE GAME until the main chat puts them there)

**What it is.** New moves for the monsters that are in the game, drawn to the owner's monster rules
of 9 Oct (given in the main chat), each behind a switch that is off: the trolls' (the green troll, the
brute; the red troll, the guardian) and the Warden's, with the dead he calls crawling out of the
ground. All of it has his yes.

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

- `tests/warden_moves.test.ts` (5): the switch is off, and his old frames are the same with it off
  and on; he swings and calls the dead, each a clip (the blow, or the rising, on its frame); every frame
  paints, has the pink edge and no cyan; the swing's blow leaves its fire's streak, and its warning is
  not the slam's; calling the dead, his hand goes up over his helm and embers rise round his feet; the
  skeleton has no crawl with its switch off, and with it on comes up out of a pit and stands.
- `tests/troll_moves.test.ts` (5): the switch is off, and the trolls' old frames are the same with it
  off and on; the green troll swings, the red swings and charges, each a clip (the blow, or setting
  off, on its frame; the run going round); every frame paints, has the pink edge and no cyan, nor any
  cyan light; the swing's blow leaves its streak, and its warning is not the slam's; the charge kicks
  up dust; its line is in the circle's reds, fills as the wind-up runs out, and is gone behind him as
  he runs. tsc clean.
- The pictures: `src/dev/preview_troll_moves.ts` (through `tools/preview.mjs` and `tools/page_gif.mjs`):
  `troll_moves.png` (`sheet:2`), `troll_swing.gif` (`swing:2`: each swings, then slams as today),
  `troll_charge.gif` (`charge:2`); `warden_moves.png` (`warden:2`), `warden_swing.gif` (`wswing:2`),
  `warden_summon.gif` (`summon:2`).

## The Warden (`src/art/monster_warden.ts`, behind `WARDEN_MOVES`, off)

- His words to the art chat, by 09:30, of his slam: "He can keep the slam.  I just don’t want it
  overused". By 10:18, to `warden_swing.gif`: "Yes, keep it (Recommended)"; to the first
  `warden_summon.gif` (the skeletons putting themselves back together out of their bones): "I’d like
  them to crawl out of the ground when summoned". By 10:23, to the second (they crawl out): "Yes, keep it
  (Recommended)".
- **His swing** (`swing`, prop 2; the basic blow, `WARDEN_SWING_HIT` 0.7 s): both hands on the shaft,
  the maul cocked back slantwise over his further shoulder and held (the warning: not the slam's, the
  maul hoisted straight up and back over the helm), then swung round him level at his belt, through
  the blow, and on round, its head leaving a streak of its fire.
- **His slam and his fan of bolts** stay as they are.
- **Calling the dead** (`summon`, prop 1 with `pt` below 0; the dead come at `SUMMON_RISE`, 1.1 s): the
  maul planted as for the volley, his free hand low, palm up; it comes up slowly, fingers clawed, his
  head going back and every fire in him flaring; embers rise off the floor round his feet.
- **The dead he calls crawl out of the ground** (`src/art/mkit.ts`, `crawlOut`, behind `CRAWL_OUT`, off;
  the skeleton's `MonsterMoves.crawl` in `src/art/monster_bones.ts`): the floor breaks open into a pit;
  its clawing hand comes up first, then its skull; it hauls itself onto the rim and heaves the rest of
  itself out, a foot stepping up onto the floor; it settles into its standing pose, and the pit closes.
  Stone is thrown up as it breaks through, and pink motes rise out of the dark. Its clip is
  `AnimSet.clips.moves.crawl` (`CRAWL_TIME`, 1.4 s), in place of the frost flash a called skeleton
  appears in today (game.ts, `summon`: a 'warp' burst).

## For the main chat, the Warden

- Switch on with `WARDEN_MOVES.on = true` and `CRAWL_OUT.on = true` before the art is made.
- His `moves.swing` and `moves.summon`; the skeleton's `moves.crawl`, played by a skeleton he calls as it
  appears (it is not to be hit or to move until it is out, which is the rules').
- Nothing else of him or of the skeleton changes: with the switches off or on, every frame they had is
  as it was (tested, and against main's frames).
