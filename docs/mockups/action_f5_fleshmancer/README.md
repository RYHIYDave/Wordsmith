# The Fleshmancer: every move done the action way (mock-up; branch `art/action-f5`)

An art helper's work on `art/action-f5` (from `art/action-f4` b993034: the game's high-city with floors 1 to 4's new moves).
Nothing here is in the game until the main chat puts it there, on his yes. All of it is **behind one switch that is off**,
`FLESH_ACTION = { on: false }` (art/fleshmancer_action.ts): with it off every frame the game shows of the Fleshmancer, of the hands
of his rings and of the mini fleshmancer is the same, pixel for pixel (hashes below). His old moves are kept as they are
(art/fleshmancer.ts), the mini fleshmancer's too (art/cultists.ts).

## His words

- His review of every enemy for more action, 31 Oct 2026: the Fleshmancer was offered as "Keep: rings of hands, fire sweeping round
  him, teleports: already fills his lair".
- His art rulebook's Monsters 9, Action, like a movie (his yes, 1 Nov): every enemy, every attack Movement 9 with bigger areas,
  bosses filling the arena with things to dance around.
- Of the last two bosses' first passes: “He needs some work.  I think the action really needs to be applied to his moves” and “add
  the action to all his moves cause he is not intimidating at all”; and of a plain blow, “pretty lackluster”, “The rakes are
  lackluster”. So from the first pass: every move hugely readable, fast, big, frightening.
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger
  AOE to compensate for the extra time the player gets to evade”).

## The pictures (`pictures/`)

- `fleshmancer_action.mp4` (1200 × 676, 55.7 s, 30 a second, H.264, captioned): each move in his lair with the knight for size
  (twice the game's pixels), from in front and from behind; THE RINGS AND THE FIRE OVER THE WHOLE LAIR FROM ABOVE (the arena whole,
  him from behind, the knight dodging); then each strike at half speed (three times the game's pixels); the mini fleshmancer's fire,
  from in front and from behind.
- `fleshmancer_action_sheet.png` (1200 wide): three moments of each move from in front and from behind, with the knight; HIS OLD
  SHARDS BESIDE THE NEW (the old seven drawn by the game's own code); the rings and the fire over the whole lair; the mini
  fleshmancer's fire.

## The moves (seconds, and frames at 30 a second; tiles from his middle)

Every blow: a big wind-up HELD (the warning), trembling; the strike in **two frames**, smeared with after-images of what strikes
along the way it came (`fmSmeared`: the strike's frames and the one after); a big wind-down.

### THE BONE SHARDS, a combo (`attack`; old: 1.4 s, its spit at 0.8, seven shards 12 degrees apart, 9 tiles a second)

He rises and rears back, his staff hauled back over his right shoulder, his claw thrust out at you, and the bone is DRAGGED UP OUT
OF THE FLOOR before him into a fan of shards HANGING IN THE AIR (each 30 picture pixels long, pointed along its way, pink-lit and
trembling), each one's LANE MARKED ON THE FLOOR in his pink, beating faster as the hit comes: HELD. The staff hammered over and
down in two frames until the skull points at you, and the fan FLIES, a streak of fire behind each shard. Then THE FINISHER: the
staff hauled back again, a SECOND FAN drawn up in the first one's gaps, held, hammered.

| | |
|---|---|
| the move | **2.667 s** (frames 0–80) |
| the first fan | drawn up f3–f14, HELD f14–f24; **strike f24–f26**, it flies at **0.867 s** (`SHARD_HITS[0]`) |
| the second fan | drawn up f34–f44 as the staff is hauled back, HELD f44–f50; **strike f50–f52**, it flies at **1.733 s** (`SHARD_HITS[1]`); settled by f80 |
| the fans (`SHARDS`) | **9, then 8 in the first one's gaps**, 12 degrees apart (96 degrees across); each hangs **1.6 tiles** out round his middle along its way, 40 up |
| their flight | **15 tiles a second** (old 9) for **10 tiles** (old 9); its lane marked out to 6.5 tiles while it hangs |

For the rules (a suggestion; damage the rules' own): long 2.667; at each fan's start (f3, f34) aim it at the hero; at its hit, a
shard from each hanging point along its way at 15 a second; a hero within **0.3** of one is struck (old 0.42: the gaps between them
are the point; at 0.42 the first fan is a wall out to five tiles). Dodge: stand in a gap of the first, then step into where the
first one went.

### THE RINGS OF HANDS (`rings`; old: 2.2 s, the slam at 0.86, three rings, 1.5, 2.9 and 4.3 tiles, a wave out at 3.6 a second)

His staff leant out, he rises high, both arms up, the skull roaring, and THE FLOOR'S CRACKS LIGHT IN THE RINGS' SHAPES, two
pixels wide, their gaps dark: the rings of the first slam hot (gold-white, beating), the others dim pink: HELD. The staff driven
down in two frames: every other ring's hands BURST UP at once (the game's own hands, art/fleshmancer.ts makeRingHandArt), the floor
flashing round each ring; he presses down. His claw raised again: HELD; slammed down in two frames: the rings between burst up, the
first ones' hands sinking. Five rings, out to his lair's walls.

| | |
|---|---|
| the move | **3.067 s** (frames 0–92) |
| the cracks | lit from 0.2 s (f6): the first slam's rings a second's warning, the others 1.8 s |
| the first slam | up by f16, HELD f16–f34; **strike f34–f36**, at **1.2 s** (`RING_HITS[0]`): **rings 1, 3 and 5** (1.4, 3.8, 6.2 tiles) burst up, each a frame after the one inside it |
| the second slam | his claw up by f52, HELD f52–f58; **strike f58–f60**, at **2.0 s** (`RING_HITS[1]`): **rings 2 and 4** (2.6, 5.0) |
| the rings (`RINGS`) | **five**, 1.4, 2.6, 3.8, 5.0, 6.2 tiles (old: three, to 4.3); a hand every 0.62 tiles: **8, 20, 33, 45, 57** hands (163; old: 8, 14 and 20 places, 33 hands); **two gaps in each**, opposite, three hands wide (1.9 tiles on the first), each ring's turned 66 degrees on from the last, so the way out winds |
| a hand strikes | a hero within **0.5** of it as it comes up (as the game's) |

Dodge: stand between two rings at the first slam, then step into the ring whose hands are sinking as the next ones burst; or out
through the gaps.

### THE FIRE SWEEP (`fire`; old: 4.6 s, bursting at 0.56, once round in 3.3 s, out to 4.8 tiles)

He rears back, the staff hauled back over his head, the fire gathering in the skull's jaws: HELD. Thrown forward in two frames,
and the stream bursts out of the jaws, arcs down onto the floor and runs out along it, A RIVER OF FLAME, and he WHIPS IT ROUND,
once and more, fastest at first, its last two frames' ways left as dull streaks behind it; the floor LEFT BURNING IN LANES where it
gouted (as the cultist's sigil burns on), each dying back from its end, then scorched.

| | |
|---|---|
| the move | **3.4 s** (frames 0–102) |
| the wind-up | reared by f14, HELD f14–f30; **strike f30–f32**, it bursts at **1.067 s** (`FIRE_HIT`) |
| the whip (`WHIP`) | from 43 degrees to his right, round **385 degrees** in **1.2 s** (to 2.267 s, `FIRE_STOP`), thrown fastest at first; settled by f102 |
| the stream (`FIRE`) | down **0.9 tiles** from him (old 1.0), out to **7.0** (old 4.8), **0.5** to either side (old 0.45) |
| the lanes | **every 40 degrees of the whip: ten**, 0.3 to either side, from 0.9 to 7.0 tiles, each burning **3.0 s** from when the stream passed it (dying back over its last 0.8), then scorched 1.2 s |

Dodge: in close under him (inside 0.9) as it whips, or roll through it; then stand between the lanes.

### RAISE THE DEAD (`raise`; old: 2.6 s, the shriek at 0.72)

Bowed, staff and claw drawn down to the floor; both arms FLUNG UP, the skull shrieking, his light pulled up out of the floor: HELD,
shaking, while THE BONE HEAPS OF HIS LAIR SHAKE, bones hopping off them, the floor round each cracking and lit from under in his
pink, a ring of his light round it, beating faster. Both flung down at the heaps in two frames: the dead BURST UP out of them, a
flash, bone and grave dirt thrown.

| | |
|---|---|
| the move | **2.8 s** (frames 0–84) |
| the summoning | bowed by f10, arms up by f22, **HELD f22–f40** (the heaps shaking and lit) |
| the call | **strike f40–f42**, at **1.4 s** (`RAISE_HIT`) |
| the dead | one out of each heap, **0.05 s** apart (`RAISE`), thrown up out of it (its death played back in three frames), standing a third of a second later; bone and dirt thrown **1.4 tiles** |

For the rules: as now (`raiseFromHeaps`), at 1.4 s.

### THE TELEPORT (`sink`, `rise`; old: going 1.0 s, out of reach from 0.72; coming back 1.2 s, up from 0.3)

Seized by his dead, arms flung up, fighting them: HELD; YANKED DOWN into a pit of his dead (a dark plum mass knotted with bone,
his fire in its cracks: never blood) in two frames. Where he will rise is MARKED ON THE FLOOR FIRST: a ring of his fire, its dashes
filling in round it, cracks running out to it, the pit churning in its middle and swelling. He ERUPTS up out of it in two frames, a
burst all round: a ring of white fire thrown out to the mark, his dead's flesh and bone flung.

| | |
|---|---|
| going (`sink`) | **1.0 s** (f0–f30): seized by f10, HELD to f18; **strike f18–f20**: under the floor, **out of reach from 0.667 s** (`SINK_GONE`); the pit (`PIT`) **0.85 tiles** round, open f4–f28 |
| the mark (`RISE_MARK`) | from **1.0 s** before he erupts (the rules' pause, 0.4, and the rise's first 0.6): a ring **2.0 tiles** round |
| coming back (`rise`) | **1.4 s** (f0–f42): under to f18; **strike f18–f20**: he erupts at **0.667 s** (`RISE_HIT`), thrown on up to f27, settled by f42 |
| the burst | out to **2.0 tiles** in 0.16 s: a hero within 2.0 of where he comes up, as he erupts, is struck |

For the rules: `FLESH_BLINK` sink 1.0, gone 0.667, pause 0.4, rise 1.4, up 0.667; at `rise` 0.667 a blow within 2.0 tiles; the
mark drawn from the pause's start.

### THE MINI FLESHMANCER'S FIRE (`miniActionMob().attack`; old: 2.8 s, bursting at 0.567, across 126 degrees in 1.5 s, out to 2.6)

The same way, smaller: both claws cocked back to his right, the fire in them swelling, turned away: HELD; thrust out in two frames,
and his fire whipped across before him, the floor left burning in lanes. His call stays as it is.

| | |
|---|---|
| the move | **2.267 s** (frames 0–68) |
| the wind-up | cocked by f12, HELD f12–f24; **strike f24–f26**, bursting at **0.867 s** (`MINI_HIT`) |
| the whip (`MINI_WHIP`) | from 74 degrees to his right across **149 degrees** in **0.6 s** (to 1.467 s), fastest at first |
| the stream (`MINI_FIRE`) | down 0.5 before him, out to **3.6** (old 2.6), 0.38 to either side; **five lanes** (every 32 degrees), burning **2.0 s** |

## The checks

`tests/fleshmancer_action.test.ts` (6 tests, all passing, about 40 s):

1. the switch off; nothing of the game imports the mock-up; his stand, glide, setting off and stopping, struck and death the game's
   own; the game's own moves kept; the mini fleshmancer: only his fire new;
2. **the game's frames the same**: every frame of the Fleshmancer, of the mini fleshmancer and of his ring's hands hashes as on
   b993034 (tools/action_f5_fm_hash.ts): **fleshmancer `1ce4c1881a2b2fbd`, mini `7ad1f87dba37b42c`, hands `3d68e732d33a9315`**;
3. every frame of the six new moves and the mini fleshmancer's fire, from in front and from behind: painted, the enemy's pink edge,
   crisp, no cyan, **nothing cut off** (under the floor in his teleport: nothing of him);
4. **THE WHOLE BOSSES' REVIEW** (art/boss_checks.ts `checkBoss`: SLIDE, FLOOR, ARM, THROUGH, JERK, JUMP, BLOW, HIPS, STRIKE),
   every frame of every new move, from in front and from behind, each fan and each slam its own blow, every handing over:
   **nothing found** (the teleport as the game's is reviewed, dragged through the floor: `FM_ACT_SHAPE_UNDER`). The mini
   fleshmancer has no shape of his own for the checks in the game; under his master's at his size, his new fire shows nothing his
   game's fire does not (his forearms pass the stand-in hood's solid in both), and none of the old one's jerks or its weak blow;
5. Movement 9 and the numbers: each of the nine strikes two frames, held before it, a flash, smeared then only, landing on its
   last frame; the fans, the rings and their gaps, the whip and its lanes, the mark and the burst, the mini's whip, each bigger,
   faster or further than the old;
6. what he sends out: the shards, the rings' cracks, the fire and its lanes (and the mini's), the heaps and their burst, the pit,
   the mark and the eruption: crisp, no cyan, the enemy's pink, nothing cut off, nothing left after.

Also passing: `tests/fleshmancer.test.ts`, `tests/cultists.test.ts` (33), `tests/new_mobs3.test.ts`, `tests/bosses.test.ts` (22
between them), `tests/palace_hands.test.ts`, `tests/action_f4_amalgam.test.ts`; `tsc` clean.

## The switch, and bringing it in

- `FLESH_ACTION` (art/fleshmancer_action.ts), `{ on: false }`. Nothing of the game imports the file. `fleshmancerActionMob()` is
  the Fleshmancer with these moves (his look `FM_ACT_LOOK`: the master's, told these moves' moments); `makeFleshmancerActionArt(pace)`
  holds him as the game holds a monster (his canvas a little bigger, 340 × 330, for him risen higher and the smear).
  `miniActionMob()` and `makeMiniActionArt(pace)` the mini fleshmancer with the new fire.
- What he sends out is painted by art/fleshmancer_action_fx.ts onto plain pixels through `at` (a floor point and a height to the
  picture): `paintShards`, `paintRingCracks`, `paintFire`, `paintHeap`, `paintSinkPit`, `paintRiseMark`; the ring's hands are the
  game's own. The rules' numbers are there by name (`SHARDS`, `RINGS`, `FIRE`, `MINI_FIRE`, `RAISE`, `PIT`, `RISE_MARK`) with what
  strikes (`shardsAt`, `ringStrikes`, `fireStrikes`, `fireLanes`).
- To bring it in (the main chat's):
  - THE BESTIARY: `fleshmancer` → `FLESH_ACTION.on ? makeFleshmancerActionArt(...) : makeFleshmancerArt3(...)`; `minifm` →
    `FLESH_ACTION.on ? makeMiniActionArt(...) : makeMiniFleshmancerArt3(...)`.
  - THE RULES (`ACTS.fleshmancer`, `FLESHMANCER`, `FLESH_BLINK`, `ACTS.minifm`, `MINIFM`), each as its table above says: shards long
    2.667, two fans at 0.867 and 1.733; rings long 3.067, slams at 1.2 and 2.0, `RINGS` in place of `rings.laid` (no wave: each
    ring at its slam, a frame apart); fire long 3.4, burst 1.067, stop 2.267, `fireWay` in place of `fireAt`, reach 7.0, the lanes
    (`fireLanes`, `fireStrikes`) in place of `scorch`; raise long 2.8, hit 1.4; the teleport as above; the mini's fire long 2.267,
    burst 0.867, stop 1.467, `miniWay`, reach 3.6, its lanes.
  - THE FLOOR (render/bossfx.ts): the painters above, onto a picture of their own laid on the floor layer (and their 'air' layer
    sorted by floor point, as the scene here does), or their few drawing calls turned into the canvas's.
- Changed outside these files (no frame of the game's changes; hashes above):
  - art/fleshmancer.ts: a look's `timing` may give the moments its shards spit and its slams land (`shardHits`, `ringHits`: two
    of each here); the painter's spit and slam fire loop over them (the master's one moment by default).
  - tests/fleshmancer.test.ts, tests/cultists.test.ts: their "only the bestiary draws him" import checks skip
    art/fleshmancer_action*.ts; tests/new_mobs3.test.ts: the two files added to its list of mock-ups.

Made by: `tools/action_f5_fm_film.ts` (the film), `tools/action_f5_fm_sheet.ts` and `tools/action_f5_fm_captions.py` (the sheet),
`src/dev/action_f5_fm_scene.ts` (the scenes, on floor 1's stand-in floor; the heaps are the game's skeleton's own bones),
`tools/action_f5_fm_hash.ts` (the hashes).

## For him to decide (the art chat's to ask)

- The shards: the fans' width (96 degrees, 17 shards) and a shard's reach for the rules (0.3 tiles, so the gaps are real).
- The rings: five rings out to the walls, two slams; or the old wave out from his slam, faster.
- The fire: a turn and more in 1.2 s is too fast to outrun: you dodge it in close or by rolling through, then stand between the
  lanes. Or one turn in 1.6 s, outrunnable at the lair's edge.
- The teleport's burst: 2.0 tiles round where he comes up, marked a second before.
- The pit of his dead is plum and bone, never red (his brief: “Nothing gory (Recommended)”).
