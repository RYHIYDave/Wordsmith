# The Rat King done the action way: his roll back and bigger, the sluices the cistern's own, and every move by Movement 9 (mock-up; branch `art/action-f12-ratking`, fixed on `art/action-fixes`)

An art helper's work on `art/action-f12-ratking` (from `art/action-f11-crier` 8ddc04c: the game with floors 1 to 15's new moves and
the bosses before). Nothing here is in the game until the main chat puts it there, on his yes. All of it is **behind one switch that
is off**, `RATKING_ACTION = { on: false }` (art/ratking_action.ts): with it off every frame the game shows of the Rat King, and all it
draws of his moves, is the same, pixel for pixel (hashes below). His old moves are kept as they are (art/rat_king.ts: only its insides
now exported, so that the new moves are painted by its own painter; art/rat_king_shots.ts untouched).

## His words

- His review, 31 Oct 2026, offered “The sluices open, in place of the roll: water floods across the cistern in lanes, carrying rats
  with it. Stand on the dry ledges between”: “Yes (Recommended)”.
- His rulebook's Monsters 9, Action, like a movie: every attack Movement 9 with bigger areas. Under his rules already given: Movement
  9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning quick”), and for the enemies, 28 Oct (“Start
  from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player
  gets to evade”).

## The pictures (`pictures/`)

- `ratking_action.mp4` (1200 × 676, 48.4 s, 30 a second, H.264 yuv420p, captioned): THE SLUICES OVER THE WHOLE CISTERN FROM ABOVE
  (the game's own picture pixels): he rears up as a heap, the lanes marked, the gates grinding open, the knight getting onto a dry
  ledge; the gates burst and the lanes flood, full of rats, three seconds, and drain; AGAIN, the knight too late off a lane: struck
  as the water hits, carried with it, scrambling out onto the ledge. Then each move close (twice as big), from in front and from
  behind, with the knight: the sluices, the bite, stolen words, unknot. Then each strike at half speed (three times as big).
- `ratking_action_sheet.png` (1200 × 6190): the sluices over the whole cistern at three moments (held; the gates bursting; the
  flood); the sluices and the bite close, from in front and from behind (held, and the strike); stolen words and unknot, three
  moments each, from in front and from behind; HIS OLD ROLL BESIDE THE NEW (the old drawn by the game's own pictures and the game's own
  lane).

The cistern in them is a stand-in (src/dev/ratking_action_scene.ts) in the Undercity's own colours (art/undercity.ts): 16 tiles each
way, wet brick walls on its two far sides (the three sluice gates in the one to the left), its floor flagged in the three lanes the
water runs down and brick-paved on the dry ledges between them, pale coping stones along their edges, the drain's grating along its
near right edge. The knight is the game's.

## The moves (seconds, and frames at 30 a second; tiles from his floor point)

Every blow: a big wind-up HELD (the warning), trembling; the strike in **two frames**, smeared with after-images of what strikes
(`smeared9`: the strike's frames and the one after); a big wind-down.

### HIS FIX, 2 Nov 2026 (on branch `art/action-fixes`; its film and sheet: docs/mockups/action_fixes/pictures/)

His words, 07:32: “The sluice gates should just open periodically in the rat king fight, I don’t think it needs to be one of his
moves.  Just an arena hazard.” And, asked what goes in its place among his moves, his pick by 07:36: “His roll, back and bigger
(Recommended)” (offered as: he curls into a ball, a big held wind-up, then barrels down a wider marked lane, fast). So his rearing
summons is gone from his moves; THE SLUICES are the cistern's own, opening on their own; and HIS ROLL is back, by Movement 9.

### THE SLUICES, AN ARENA HAZARD (art/ratking_action_fx.ts `SLUICES`, `sluiceAt`; drawn by itself, nothing of his)

Every so often, whatever he is doing (biting, spitting a word, rolling), THE LANES ARE MARKED on the floor first in his pink (each
lane's edges dashed, chevrons down it the way the water will run, the floor in it hatched; beating faster); THE SLUICE GATES IN
THE CISTERN'S WALL GRIND OPEN, a third of the way, water spurting white under each; then THE GATES BURST. Water floods down every
lane from the gates to the drain in a few frames, white and black, its front a churning wall of foam with spray over it, FULL OF
TUMBLING RATS (belly up and over, the enemy's pink in their eyes), foam lipping the ledges' edges; it parts round him if he stands
in it. The DRY LEDGES between the lanes, and along the walls, stay dry. It runs three seconds; the gates drop and it drains away
down the lanes from them, the wet floor showing behind it.

| | |
|---|---|
| its clock (seconds from when it begins) | the lanes marked from **0** (`SLUICES.mark`); the gates grinding from **0.6** (`SLUICES.gates`), up 30% by the burst; **BURST at 2.0** (`SLUICES.burst`): two seconds of warning |
| how often (a suggestion: the main chat's to set) | **every 14 s** of his fight, **the first 9 s in** (`SLUICES.every`, `SLUICES.first`; `sluiceAt(fight)` gives how far into an opening the fight is, or null): dry 8 s between floods |
| the lanes (`LANE`, `lanesFor`) | lanes **3.0 tiles** wide running across the cistern from the gate wall to the drain, as many as fit with a dry ledge of at least **1.75** between each and along each wall: in the pictures' 16 tiles three lanes, ledges 1.75; in the game's 22 four lanes, ledges 2.0; in 26 five, ledges 1.83 |
| the flood (`FLOOD`, `floodSpan`, `flooded`) | its front races down each lane at **80 tiles a second** (16 tiles in 0.2 s: **6 frames**), each lane 0.033 s after the one before; it runs **3.0 s** from the burst; then the gates drop and its tail drains away down the lanes in **0.8 s**. Its current 7 tiles a second; the rats in it go at 6 |
| struck (a suggestion; the rules' own) | whoever is in a lane as its front passes is struck; then carried with the water at **5 tiles a second** while they are in it, struck again every **0.5 s**. Out on a ledge, safe. He is not struck by it (the water parts round him) |

### HIS ROLL, BACK AND BIGGER (`moves.roll`; old: curled 0.7 s, one or two turns of 0.8 s at 6.45 tiles a second down a lane 1.5 wide, uncurled 0.6)

His lane is marked on the floor (its edges dashed in his pink, chevrons marching down it, the floor in it hatched, A RING AT ITS
END where he will burst open; beating faster) while he CURLS UP into a ball of rats, tails in, every rat up off the floor, rocks back
half a tile and HOLDS there, SPINNING UP IN PLACE faster and faster, grit sprayed back off the floor from under it, trembling. In two
frames he is OFF THE LINE, 2.2 tiles, smeared; he BARRELS DOWN THE LANE at twice his old pace, thinly smeared all the way, dust
behind him, the lane gone behind him and the floor scored where the ball ground along it; he skids to a stop at its end and BURSTS
OPEN there, the rats flung out of the ball in a ring of dust and grit, the ring on the floor flashing; they land in a heap, heaving,
and he is on his stand. (The game carries him down the lane, `roll9Along`, as it carried the old roll; his pictures are painted where
he stands.)

| | |
|---|---|
| the move | **3.2 s** (frames 0–96), one clip |
| the wind-up | his lane marked from **0.1 s** (`ROLL9.mark`); curled up by **0.5 s** (`ROLL9.curl`); rocked back **0.5 tiles** by 0.8 s; **HELD f15–f39** (0.8 s), spinning up |
| the strike | **f39–f41**, off the line at **1.367 s** (`ROLL9_HIT`): **2.2 tiles in two frames** (1.1 a frame, against 0.43 rolling) |
| the run | **13 tiles a second** (`ROLL9.pace`; old 6.45) to 2.0 s, skidding to a stop by **2.2 s** (`ROLL9.stop`), **11.1 tiles** from where he curled up (`ROLL9_FAR`; old 5.2 or 10.3) |
| its end | BURST OPEN at **2.2 s**, the rats landed by 2.67 s; on his stand by 3.2 |
| his lane | **2.4 tiles** wide (`ROLL9.half` 1.2 to either side; old 1.5), out to where he stops, its end a ring **2.2** round (`ROLL9.endR`): `paintRollLane` |
| struck (a suggestion; the rules' own) | whoever the ball passes over in its lane (within 1.2 of its middle) as it comes by; and at its end, whoever is within **2.2** of where it stops as he bursts open |

### THE BITE (`attack`; old: 1.36 s, the snap at 0.66, the heap surging under half a tile, out to 2.5 tiles and 54° to either side)

The heap rears, bunched back, the FRONT THREE RATS up on their hind legs, jaws wide, eyes flaring, forefeet clawing: HELD,
trembling, squealing, the WEDGE MARKED on the floor in his pink. In two frames they LEAP OUT to the end of their knotted tails (their
tails stretched taut from the knot like leashes) and SNAP SHUT, smeared, the heap surging after them; the wedge flashes; where each
struck, the floor is scored and dust thrown. They bite down and shake, and are HAULED BACK by their tails, off their feet, squealing.

| | |
|---|---|
| the move | **2.2 s** (frames 0–66) |
| the wind-up | reared by **0.4 s**; **HELD f12–f27** (0.5 s); the wedge marked from 0.1 s |
| the strike | **f27–f29**, the snap at **0.967 s** (`BITE9_HIT`): the front three leap **1.4 tiles**, the heap surges 0.3 |
| the wind-down | biting down and shaking to 1.1 s; hauled back by 1.47 s; settled by 2.2 |
| its area (`BITE9`) | a WEDGE before him from **0.6 to 3.4 tiles**, **130°** across (old: to 2.5, 108°) |

### STOLEN WORDS (`moves.words`; old: 1.6 s, flies at 0.86, its line following until 0.6, 7 tiles a second, bursting 1.0 round)

The King rears, every mouth opens, A WORD GATHERS before his mouth (twice the old, the voices drawn into it from every mouth); ITS LINE
on the floor (two dashed lines of his pink) FOLLOWS YOU, and then LOCKS (solid, bright, the ring where it will burst marked at its
end): HELD, trembling. In two frames he THRUSTS HIS HEAD DOWN AND SPITS IT, smeared: a word of your own kind (fire, frost, lightning or
poison, as the game's own), twice the old size, in the enemy's pink burning to gold, streaking down the locked line; it bursts on
whoever it meets, or where it ends, twice as wide.

| | |
|---|---|
| the move | **2.6 s** (frames 0–78) |
| the wind-up | reared by **0.4 s**; the word gathering and its line from **0.2 s**; **LOCKED at 1.0 s**; **HELD f18–f39** (0.7 s) |
| the strike | **f39–f41**, spat at **1.367 s** (`WORDS9_HIT`), 0.37 s after the line locks |
| the wind-down | his head driven on, recoiling, shaking; down by 2.6 |
| the word (`WORDS9`) | **14 tiles a second** (old 7), as far as **12** (old 10); bursting on a hero it passes within **0.7** (old 0.5), or where it ends; its burst **2.0 tiles** round (old 1.0), seen **0.7 s** (old 0.5) |

### UNKNOT (`moves.unknot`; old: coming loose and gone in 0.9 s, the swarm 0.9 s, 18 rats a tile wide, knotted again in 0.95)

The heap SWELLS AND TENSES, bellies swollen, eyes flaring, the tails slipping loose from the knot, the King snatching the Order's cord
in his teeth: HELD, trembling harder and harder. In two frames THEY BURST OUTWARD, every rat flung leaping out from the heap, smeared, a
ring of dust and flung grit racing out round him; they land, run on and are gone into the cracks. Then THE SWARM, twice as many and
twice as wide, streams past you (pink-edged rats, pink eyes, dust behind) to your far side, and they knot again there (the game's own
`knot`, kept).

| | |
|---|---|
| the move | **1.6 s** (frames 0–48), then the swarm 1.0 s and the knot 0.95 s |
| the wind-up | swollen by **0.4 s**; the tails loose from 0.47 s, the cord in his teeth at 0.67 s; **HELD f12–f30** (0.6 s) |
| the strike | **f30–f32**, the burst at **1.067 s** (`UNKNOT9_HIT`): every rat **1.3 tiles** out in two frames, landed **1.6** out by 1.2 s; gone by **1.6 s** |
| its area | the burst's ring out to **2.6 tiles** from him (`UNKNOT9.ring`; old: none) |
| the swarm (`SWARM9`) | **36 rats** (old 18), **1.5 tiles** to either side of its line (old 1.0 across 2), in **1.0 s** (old 0.9), each up to 0.3 s late |

### HIS STAND, HIS SCUTTLE, STRUCK, KNOTTING AGAIN, HIS DEATH

The game's own, frame for frame.

## The checks

`tests/ratking_action.test.ts` (5 tests):

1. the switch off; nothing of the game imports the mock-up; **the game's own frames the same**: every frame of the Rat King, both
   ways round, and what the game draws of his moves (his word's line, the word in flight and its burst, his swarm, his roll's lane)
   hash as on 8ddc04c (tools/ratking_action_hash.ts): **ratking `e0df474ef6b3a1cb`, his moves drawn `45bc53ab47f551ee`**; with the new art
   his stand, his scuttle, struck, knotting again and his death the game's own, frame for frame; his roll one clip (`moves.roll`),
   no `curl`, `uncurl` or `sluice` among his moves (his fix, 2 Nov);
2. every frame of the four new moves, from in front and from behind: painted, the enemy's pink edge, crisp, no cyan, **nothing cut
   off** (his canvas for these 700 × 520, the game's 600 × 430);
3. **THE REVIEW FOR THE OLD RIGS** (art/action_f1_checks.ts `checkKit`: SLIDE, FLOOR, JERK, JUMP, BLOW, HIPS, STRIKE; he is not on the
   heroes' bones), every frame of every new move, from in front and from behind, six pairs of feet in turn as his soles (the front
   rat's fore and hind, the two beside it, two at the back), the King's head, the knot, the front rat's and a back rat's heads
   followed: **nothing found**; and the whole-figure checks the game's own test of him makes: FLOOR (nothing of any rat under the
   floor), SLIDE (every rat's every foot, at 600 a second), JUMP (from every frame of his stand into each move, and back): **nothing
   found**. Movement 9: each strike two frames, its blow at its end, held 0.5 to 1.0 s before it, a wind-down of 1.2 s or more;
   HIS ROLL (his fix, 2 Nov) seen where the game carries him down his lane (`pose9World`, handing back to his stand where he stops):
   curled up off the floor the whole way, off the line in two frames at more than twice the pace he then rolls at, stopped where
   `ROLL9_FAR` says; the front rats out their lunge and home again; the burst out;
4. the gates, the lanes' marks, the flood, the wedge, the word's line, the word in flight and its burst, the burst's ring, the swarm,
   HIS ROLL'S LANE (marked from its mark to the strike, scored behind him, gone after): crisp, no cyan, the enemy's pink; THE FLOOD
   NEVER ON A DRY LEDGE, every lane flooded;
5. the numbers: the lanes and ledges (16, 22, 26 across); THE SLUICES ON THEIR OWN CLOCK (`sluiceAt`: every 14 s from 9 s in, dry a
   good while between), the lanes marked two seconds before the burst, the gates grinding; the flood across in a few frames, three
   seconds, then drained; HIS ROLL twice as fast as the old, its lane wider, a ring at its end, held long enough to read; the wedge,
   the word and the swarm bigger and faster than the game's own.

Also: `tsc` clean; `tests/rat_king.test.ts`, `tests/act2_ratking.test.ts`, `tests/new_mobs3.test.ts` as before (see the final
report for the run). `tools/ratking_action_review.ts` prints the review's findings (none).

## The switch, and bringing it in (the main chat's)

- `RATKING_ACTION` (art/ratking_action.ts), `{ on: false }`. Nothing of the game imports the files. `makeRatKingActionArt()` is the
  Rat King as the game holds a monster with these moves: `idle`, `walk`, `reel`, `die`, `moves.knot` the game's own; `attack` the bite;
  `moves.roll` (one clip, 3.2 s, in place of the old `curl`, `roll`, `uncurl`), `moves.words`, `moves.unknot` these; no `moves.sluice`
  (his fix: the sluices are the cistern's). His canvas for the new moves is bigger (`RK9_CANVAS` 700 × 520) for the front rats' leap,
  the heap reared high and the dust behind his ball.
- What he does to the cistern and sends across it is painted by art/ratking_action_fx.ts onto plain pixels through `at` (a floor point
  and a height to the picture) or the cistern's middle on the picture (`Iso`): `paintGate`, `paintLaneMarks`, `paintFlood` (the
  sluices, by their own clock), `paintRollLane`, `paintWedge`, `paintWordLine`, `paintWord`, `paintWordBurst`, `paintBurstRing`,
  `paintSwarm9`; the numbers by name (`LANE`, `FLOOD`, `SLUICES`, `BITE9`, `ROLL9`, `WORDS9`, `UNKNOT9`, `SWARM9`) with `lanesFor`,
  `laneOf`, `floodSpan`, `flooded`, `gateUp`, `sluiceAt`, `roll9Along`, `ROLL9_FAR`, `swarm9Span`.
- To bring it in:
  - THE FIGURE (art/act1_figs/ratking.ts): `make: () => RATKING_ACTION.on ? makeRatKingActionArt() : makeRatKingArt()`; its size as
    now (his stand is the same).
  - THE KING'S CISTERN (game/act2/undercity.ts, its ground art/undercity.ts): **sluice gates in one of its walls and the lanes across
    its floor**, laid by `lanesFor(across)` (the cistern 26 × 22 or 22 × 26: the gates in the wall the lanes run away from, the lanes
    3 tiles wide, the ledges 2.0 or 1.83 between them and along the walls); the lanes flagged and the ledges brick-paved with coping
    edges, as the stand-in has them, so that the ledges read before the water comes (that is a change to how the floor looks: his
    picture first). The King's nest, the jar and what lies about kept on the ledges or off the lanes' run; the cistern's pool, in
    its corner, either on a ledge or the lanes laid clear of it.
  - THE SLUICES AS A HAZARD (his fix): what the rules need to run them is a clock of the fight's own, not an act of his. While he is
    alive and the fight is on, every `SLUICES.every` seconds from `SLUICES.first` (14 and 9, a suggestion), an opening begins; with
    `h` the seconds into it (`sluiceAt(fightTime)`): from `SLUICES.burst` the flood per `floodSpan` (80 tiles a second down each lane,
    3.0 s, draining 0.8 s); a hero in a lane as its front passes is struck, then carried down the lane at 5 tiles a second and struck
    every 0.5 s while in it (`flooded(x, y, h)`); his rats and the hero's companions the same; he himself is not (the water parts
    round him). It needs: the fight's start time (or a running clock kept on the room while the boss lives), the cistern's lanes and
    the gate wall (from the room), and nothing of his acts, so that it runs while he bites, casts or rolls. Its sound: the gates'
    grinding at `SLUICES.gates`, a gush at the burst (the old `ratking:roll` cue in game/boss_calls.ts is the roll's again).
  - THE RULES (game/act1_rules/ratking.ts `RK_ACTS`, `RK`): `ratking:roll` back, one clip: long 3.2, hit 1.367 (off the line); the game
    carries him along the way he faces by `roll9Along(t)` (back 0.5, then 13 tiles a second, stopping at 11.1, or at a wall: as the
    old, it is only made with a clear run, and a shorter one where the floor is not clear); a hero within `ROLL9.half` (1.2) of his
    middle as the ball comes by is struck and thrown aside; at `ROLL9.stop` (2.2) whoever is within `ROLL9.endR` (2.2) of where he
    stopped is struck as he bursts open. The bite: long 2.2, hit 0.967, its area the wedge (0.6 to 3.4 tiles, 65° to either side).
    Stolen words: long 2.6, hit 1.367, its aim following until 1.0 then held; 14 tiles a second, reach 12, struck within 0.7, its
    burst 2.0 round for 0.7 s. Unknot: out 1.6, the burst at 1.067 striking within 2.6 tiles, gone (out of reach) from 1.2; the swarm
    1.0 s, 1.5 to either side of its line (`swarm9Span` for its stream), then the knot 0.95 as now. Damage and cooldowns the rules'.
  - THE FLOOR (render/act1_fx/ratking.ts): the gates painted on the wall where they stand (shut but while an opening runs), the lanes'
    marks and the flood on the floor layer under the figures (the flood parted round him), his roll's lane (`paintRollLane`, in
    place of the old `drawChargeLane`), the wedge on the floor; the word's line, the word in flight over what stands, its burst; the
    burst's ring and the swarm on the floor, in place of the game's own (`drawWordAim`, `drawStolenWord`, `drawWordBurst`,
    `drawSwarm`, kept for the switch off). The painters take plain pixels: the game's canvas wants their few dots turned into its own
    `fillRect`s, as the Crier's did.
- Changed outside these files (no frame of the game's changes; hashes above):
  - art/rat_king.ts: its colours (`FUR`, `BELLY`, `SKIN`, `TEETH`), its aura, its rats at rest (`RATS`, `RatRest`, `SC`, `KNOT`,
    `KNOT_R`) and its pose and painting helpers (`placed`, `standPose`, `seepOf`, `mixRat`, `running`, `knotPose`, `eyeOf`,
    `crownBits`, `knotBits`) exported (`export` added; nothing else); and on `art/action-fixes` its ball (`BALL_R`, `BALL_Z`,
    `ballPose`) the same way, for the new roll.
  - tests/rat_king.test.ts: its "only the game's figure imports it" check skips art/ratking_action*.ts; tests/new_mobs3.test.ts:
    the two files added to its list of mock-ups.

Made by: `tools/ratking_action_film.ts` (the film), `tools/ratking_action_sheet.ts` and `tools/ratking_action_captions.py` (the sheet),
`src/dev/ratking_action_scene.ts` (the scenes: the stand-in cistern, the fight from above, each move close), `tools/ratking_action_hash.ts`
(the hashes), `tools/ratking_action_peek.ts` and `tools/ratking_action_review.ts` (the helper's own looks), `tests/ratking_action_shapes.ts`
(the review's view of him, and its run).

## For him to decide (the art chat's to ask)

- How often the sluices open: every 14 s, the first 9 s into the fight (dry 8 s between floods), or more or less often.
- The lanes: 3 tiles wide with ledges of 1.75 to 2 between (three, four or five lanes, by the cistern); fewer and wider ledges if
  it is too tight to dance on.
- The flood: three seconds and draining in under one; whether a hero caught in it is carried (5 tiles a second, struck every half
  second) or only struck once as its front hits.
- The floor showing its lanes all fight long (flagged lanes, brick ledges), or the floor plain until the lanes are marked.
- His roll: 13 tiles a second down a lane 2.4 wide, 11 tiles long, bursting open in a ring 2.2 round at its end; held 0.8 s
  spinning up before it goes.
- The bite's leap: the front three out 1.4 tiles on their tails to 3.4 tiles; the wedge 130° across.
- The stolen word at 14 tiles a second with its line locked 0.37 s before it flies: hard but fair, or a little slower.
- The swarm: 36 rats, 3 tiles wide, biting as it runs over you; the burst's ring out to 2.6 tiles.
