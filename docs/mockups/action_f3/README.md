# Floor 3: more action (mock-ups; branch `art/action-f3`)

An art helper's branch, from `art/action-f2` at e6b7915 (the game's `high-city` with floors 1 and 2's new moves). Nothing here is in
the game until the main chat puts it there, on his yes. Both new things are **behind switches that are off**: with them off every
frame the game shows of the green troll, the red troll, the troll chieftain and the Boneward is the same, pixel for pixel (hashes
below). The Chained One, floor 3's boss, is not in this branch (another helper's, after this one).

## His words

- His review of every enemy for more action, 31 Oct 2026 (the floor 1 README has his words on it).
- THE BRUTE, the green troll (floors 3 to 5): offered "Rampage: two stepping club swings, then a leaping two-fisted slam with a
  shockwave ring. Bull rush as its second: lowers its head and charges down a marked lane."; his pick “Yes (Recommended)”.
- THE BONEWARD (floors 3 to 5): offered "Keep the spear throw. Shield wall: while it comes at you behind its shield, hits from in
  front glance off. Get round it, or wait for it to throw."; his pick “Yes (Recommended)”.
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger
  AOE to compensate for the extra time the player gets to evade”).

## The pictures (`pictures/`)

- `action_f3.mp4` (1200 × 676, 40 s, captioned): the green troll's rampage with the knight, from in front and from behind (twice
  the game's pixels): he steps in at the knight with two swings, raises the club as the slam's ring is marked, leaps and slams; the
  knight gets out of the ring; the ring goes out over the floor. The rampage at half speed. His bull rush down its lane, from in
  front and from behind (the knight steps out of the lane), then at half speed. The Boneward's shield wall from in front and from
  behind (three times): it comes on behind its shield; the knight's blow from in front glances off; from its side his blow lands;
  it lowers its shield and throws its spear. The glance at half speed (four times).
- `action_f3_sheet.png` (1200 wide): the rampage's six key moments from in front and from behind; the ring, marked, struck, going
  out, and its cracks after; the bull rush's six key moments both ways; its lane, marked and run; the Boneward's six key moments
  both ways (braced, advancing, the glance, struck from the side, lowering its shield to throw); the glance and the blow from the
  side with the knight.

## THE RAMPAGE (the green troll's attack, in place of his swing and his slam)

**What it is.** Both fists come onto the club and it goes round on his club side, wound back, and HELD as he coils (the warning);
his body goes, and in TWO FRAMES the club comes round in front of him level, smeared; on round to his other side, and **a step in**.
Wound back the other way, HELD; the backhand in two frames; on round, and **a step in**. Then he brings the club round before him
and RAISES IT UP OVER HIS HEAD in both fists as he CROUCHES on bent legs, HELD, the biggest of his warnings (the ring is marked on
the floor from here, the game's red circle); he LEAPS, the club tipped right back over his head in the air (his shadow stays on the
floor under him); and as he lands, in TWO FRAMES, the club comes down before him with both fists, smeared over the top, its head on
the floor: the **shockwave ring** goes out from it. He stays folded over the club, shoulders heaving; then hauls it up and lets it
down to his side.

**Its numbers** (all checked in `tests/action_f3.test.ts`; art/monster_brute.ts `rampageTimeline`, art/action_f3_fx.ts `RAMPAGE`,
`RING`):

| | |
|---|---|
| the move (`clips.attack` with the switch on) | 3.1 s, 94 frames at 30 a second; its `hit` the slam |
| the blows (`RAMPAGE_HITS`) | the swing **0.6 s** (frame 18), the backhand **1.167 s** (frame 35), the slam **2.367 s** (frame 71) |
| each strike (`RAMPAGE_STRIKES`) | **two frames**, smeared (frames 16 to 18, 33 to 35, 69 to 71) |
| the wind-ups | the swing: gathered by 0.2 s, wound by 0.38, held coiling to 0.53; the backhand: wound by 0.92, held to 1.1; the slam: the club before him from 1.27, over his head and crouched by 1.75, **held** to 2.0, the leap 2.067 to 2.367 (15 picture pixels up) |
| the wind-down | folded over the club, heaving, to 2.62 s; hauled up by 2.85; at rest 3.1 |
| the swings' reach (`RAMPAGE.reach`, `arc`) | **2.1 tiles**, the half of the floor before him (180 degrees) (his old swing: 1.7) |
| how far the game carries him (`rampageTravel(t)`) | **2.0 tiles** the way he faces: 0.45 in each step (0.7 to 0.92 s, 1.27 to 1.49 s), 1.1 in the leap (2.067 to 2.367 s); his feet are where they are on the floor all the while (they grip) |
| the ring (`RING.radius`) | **2.5 tiles** round its middle (drawn and tested 2.25 to 2.75: the main chat may set it) (his old slam: 1.7) |
| where (`RING.ahead`) | its middle **1.25 tiles** before where he lands (where his club comes down), so 3.25 tiles from where he began |
| its warning (`RAMPAGE.raise`) | marked from **1.4 s** (the club going up over his head): 0.97 s before the slam |
| the ring going out (`RING.wave`, `fade`, `long`) | out to its edge in **0.2 s**, breaking up over 0.25 s more; its cracks lie and are gone by 1.6 s |

**The ring** (art/action_f3_fx.ts `ringPainted(t, 'floor' | 'air', radius, side)` on `RING_CANVAS` 280 × 196, anchored at its
middle; `t` seconds from the slam): on the floor, a dent where the club came down and the cracks it opens, red-hot at their lips at
first, then dark, then gone, and the ring itself going out over the floor, a band of the floor's own dust with the enemy's pink
dotted at its leading edge; in the air, the flash of the blow (white and the enemy's pink, a moment), the dust thrown up along the
ring as it goes, chips of stone flung up and falling, and the dust settling. The air layer by halves, `'behind'` before a figure at
its middle and `'before'` after it. `ringStrikes(x, y)` says who is struck.

## THE BULL RUSH (his second, played as the red troll's charge is: `chargeWind`, `charge`, `chargeStop`)

**What it is.** His head goes DOWN before his chest, BROW FIRST (his face seen from above: his crown, the heavy brow, the eyes slits
under it, the tusks jutting), his shoulders hunched, and his free fist goes down to the floor before him, KNUCKLES TO IT; HELD so,
rocking, he paws the floor twice with a foot, dust kicked back (the warning, while the lane is marked: the red troll's lane, in the
game's own look). He is off: head first, leaning hard into it, BOUNDING, each foot down two frames of six and off the floor between,
his free fist pumping, the club at his side. Past where you stood he plants a foot hard, stumbles a step and another, rocks back off
balance and shakes his head; and stands. (The red troll's charge: a roar, scraping, running upright-ish with the club hauled, a
skid. The green troll's is his own.)

| | |
|---|---|
| its warning (`chargeWind`, its `hit` `RUSH_GO`) | **1.0 s**: head down by 0.3 s, paws at 0.46 and 0.76, held to 0.86, off at 1.0 |
| the run (`charge`, `RUSH.pace`) | **11 tiles a second** (the red troll's: 10); six frames round (0.2 s, 2.2 tiles); its feet grip at that pace |
| the stop (`chargeStop`, `RUSH.recover`) | **1.0 s**; the game carries him **1.2 tiles** more over its first 0.4 s (`rushStopTravel(t)`), from his run's pace down |
| the lane (`RUSH.half`, `past`, `stop`) | **1.8 tiles wide** (the red troll's: 1.5); from where he stands, through where you stood, **2.5 tiles** past you (1.3 run, 1.2 stop): `rushLane(from, hero, k, gone)` gives it as art/charge_lane.ts draws it |
| used | from **3 to 8 tiles** off (`RUSH.near`, `far`) |
| into the stop (`RUSH.endOn`) | the game ends his run as its round comes to frame 3, 4, 5 or 0 (not 1 or 2: a frame or two more of the run, a fifteenth of a second at most), so the stop takes him from his stride without a jump |

## THE BONEWARD'S SHIELD WALL

**What it is.** It keeps the spear throw as it is, and comes at you BEHIND ITS SHIELD: crouched behind it, the shield raised square
to its front, its top at the skull's jaw so that the horned helm and the burning eyes look over it, the spear held overhand by its
right shoulder, ready over the shield's rim, its point to the front; the left foot forward, the knees bent. It ADVANCES so, braced:
the left foot steps out and the right is drawn up after it, the shield kept square and the spear over its rim, each step lowering
it onto its front knee. Struck FROM IN FRONT, the blow GLANCES OFF: a white star where it struck, high on the shield's face over its
rune; a ring going out over the face from there, white and then the enemy's pink, as the iron rings; sparks thrown off it, white,
the enemy's gold and pink, falling; and it holds its ground, barely rocked (`glance`). Struck from the SIDE or from BEHIND, it is
rocked back as the game's Boneward is, the shield knocked out of line (`reel`, from the wall). It LOWERS ITS SHIELD TO THROW: its
throw is the game's own but that it begins from the wall, the shield coming down and out as the spear goes up (the opening); with
its spear gone it fights and walks as the game's does; it picks its spear up as the game's does, and raises its shield again.

| | |
|---|---|
| the front that glances (`WALL.arc`, `glances(from)`) | **120 degrees**: a blow from within 60 degrees of straight before it |
| the wall up | while it stands or walks with its spear in hand; and through its thrust's wind-up to **0.6 s** (`WALL.thrustOpen`: it lunges out past the shield's edge then, open to the thrust's end, 1.25 s) |
| the wall down | from the **start of its throw** (it lowers the shield to hurl), all the while its spear is gone (its bash, fetching it), until the end of its picking it up (**1.0 s**, `WALL.raisedAgain`) |
| the glance (`glance`) | **0.3 s**, in place of `reel`; the blow does nothing |
| its advance (`walk`) | eight frames at eleven a second, painted for a tile a second (the game shows it at its pace, 1.5, as it does the plod) |
| its thrust | the game's own (its blow at 0.7 s), from the wall and back to it; its throw the game's own (its loose at 0.75 s), from the wall; its pick-up the game's own (in hand at 0.5 s), back into the wall at its end |

**How the game can have it:** `WALL_BONEWARD` (art/action_f3_fx.ts) is the game's Boneward with these moves; `makeWallBonewardArt(pace)`
makes it as the game holds a monster (as art/new_mobs3.ts `makeBonewardArt3`). Its moves by name: `stand`, `walk` (the wall),
`attack` (the thrust), `reel` (struck from the side), and `throw`, `bash`, `pickUp`, `standBare`, `walkBare`, as the game has them,
and `glance`.

## The switches, and bringing it in

- `BRUTE_RAMPAGE` (art/monster_brute.ts) and `BONEWARD_WALL` (art/action_f3_fx.ts), both `{ on: false }`. With `BRUTE_RAMPAGE` on,
  `makeBruteArt()` has the rampage as its `clips.attack` and the bull rush as `clips.moves.chargeWind`, `charge`, `chargeStop`; his
  old swing (`moves.swing`) and slam (`smash`) are kept in the file, out of his set. The red troll and the chieftain are not touched.
  The rig paints the new things only for poses with `prop` 3, 4 or 5 (no live frame has them), and reports its joints only when a
  review sets `BRUTE_SEEN.see` (null).
- Hashes of every frame (tools/action_f3_hash.ts), on e6b7915 and on this branch, the same: green troll `325e4f9f0ff0a97f`, red
  troll `7a58d3543f6dcab6`, Boneward `d5c7243a4da09b35`, chieftain `747cbbe64380bc81` (the game's switches); the trolls with their
  moves off: `a1bd83df35eeb5c3`, `103fc10e6116065d`.
- To bring it in (the main chat's):
  - THE GREEN TROLL: `BRUTE_RAMPAGE.on`; `MONSTER_MOVES.brute`: the rampage (played as `clips.attack`: its windup the slam's,
    2.367 s; strike at each of `RAMPAGE_HITS`: the swings a hero within `RAMPAGE.reach` in the half before him, the slam within
    `RING.radius` of the point `RING.ahead` before where he lands; carry him `rampageTravel(t)`; mark the ring as a slam's red circle
    from `RAMPAGE.raise`) and the bull rush as the red troll's `charge` (its windup `RUSH.windup`; with the green troll's own
    `RUSH.pace`, `RUSH.half`, `RUSH.past`; carry him `rushStopTravel` through his stop, its recover `RUSH.recover`; end the run on a
    frame of `RUSH.endOn`; the lane by `rushLane`). Cooldowns and damage are the rules': a suggestion, the rush about 7 s, used from
    3 to 8 tiles.
  - THE BONEWARD: in the bestiary, `figure === 'boneward' ? (BONEWARD_WALL.on ? makeWallBonewardArt(...) : makeBonewardArt3(...))`
    (the file is a mock-up: move what it needs into the game's own files as the art chat's work is brought in); in the rules, a blow
    on it from within `WALL.arc` of its front while the wall is up (above) does nothing and it plays `glance`.

## The checks

`tests/action_f3.test.ts` (7 tests, all pass):

1. the switches off; nothing of the game imports the mock-up; with `BRUTE_RAMPAGE` on, the red troll and the chieftain every frame
   the same, the green troll's stand, walk and death the same, his attack the rampage, his moves the bull rush, his old swing gone;
2. every frame of the rampage and the bull rush paints, wears the enemy's pink edge, is crisp, has no cyan, nothing cut off;
3. **the rampage through the bosses' review for the old rigs** (art/action_f1_checks.ts `checkKit`: SLIDE, FLOOR, JERK, JUMP from
   every stand frame and back, BLOW, HIPS, STRIKE), from in front and from behind, as the game shows it, carried over the floor, its
   three blows each reviewed: nothing found; Movement 9: each wind-up held, each strike two frames and smeared, the slam's warning
   the biggest; the club's head on the floor 1.25 tiles before him as it lands;
4. **the bull rush through the review**, its wind-up, two rounds of its run and its stop as the game plays them, from in front and
   from behind: nothing found; its run round and round: nothing; into its stop from the frames of `RUSH.endOn`: no jump; its head
   down brow first, its fist on the floor; faster, wider and further than the red troll's;
5. the ring: its numbers; it goes out fast, breaks up, the cracks fade, nothing after; at 2.25, 2.5 and 2.75 tiles nothing cut off,
   crisp, no cyan; the enemy's pink at its leading edge; the flash;
6. **the Boneward's wall through the bosses' review** (art/boss_checks.ts `checkBoss`, on the heroes' bones), from in front and from
   behind: its new moves (`stand`, `walk`, `glance`, `reel`) and every handing over between its moves (its stand and walk in and
   out at every step, into the glance and struck from its walk, into and out of each move, its throw into its bare stand, its pick-up
   back into the wall) find nothing; its inherited moves (the thrust, the throw, the pick-up, the bash, its bare stand and walk, its
   death) find only what the review finds of the game's own Boneward (see below);
7. the wall's numbers; the glance white, gold and pink, no cyan, gone when done; every frame of the new moves painted, pink-edged,
   crisp, no cyan, nothing cut off.

**The review had never been run on the Boneward.** Of the game's own it finds: its thrust's and throw's and pick-up's feet sliding as
they move from its rest, its thrust's strike not yet a flash of Movement 9 (its step a frame before it), its thrust's hips coming
after its chest, its death's feet in the floor. The wall's thrust and throw are the game's own between their new ends (and slide
less, from the wall's braced stance); they are not mended here: see "For him to decide".

Also passing: `tests/action_f1.test.ts`, `tests/action_f2.test.ts`, `tests/palace_hands.test.ts`, `tests/bosses.test.ts`,
`tests/new_mobs3.test.ts`; `tsc` clean. Changed outside this floor's own files:

- art/action_f1_checks.ts (floor 1's review for the old rigs, a mock-up tool): three optional fields, `blows` (a combo: each of its
  blows reviewed, every strike a flash JERK does not hold), `shift` (where the game has carried him by a move's end) and `heights`
  (each sole's height over the floor, for one carried over it). Without them it reviews as before (floors 1 and 2's tests pass).
- tests/action_f1.test.ts, test 1: the later floors' action mock-ups (art/action_f2_fx.ts, art/action_f3_fx.ts) may import floor 1's
  (they are mock-ups too). It failed on e6b7915 for floor 2's file; it passes now.
- tests/new_mobs3.test.ts: `action_f3_fx` added to its list of the mock-ups built on the new monsters, as floor 2's was.

Made by: `tools/action_f3_film.ts` (the film), `tools/action_f3_sheet.ts` and `tools/action_f3_captions.py` (the sheet),
`src/dev/action_f3_scene.ts` (the scenes, on floor 1's stand-in floor; the game's own red circle, charge lane and thrown spear drawn
through a stand-in canvas), `tools/action_f3_hash.ts` (the hashes).

## His word on the pictures

Shown `action_f3.mp4` and `action_f3_sheet.png`, 31 Oct 2026 (answered by 19:59), and asked of each:

- The rampage (swing, backhand, the club held up in a crouch, the leap and the slam; the ring 2.5 tiles round; in place of the
  old single swing), offered with keeping a quick single swing too, or a change: “Yes, that's it (Recommended)”. So the rampage
  is his every attack beside the rush, as drawn; the old swing stays out of the set; the ring stays at 2.5 tiles.
- The bull rush (head down, pawing, held; the lane 1.8 tiles wide; 11 tiles a second, on past where you stood; rocked back to a
  stop): “Yes, that's it (Recommended)”.
- The Boneward's shield wall (braced advance; blows from the front glance off; from the side or behind they land; the shield
  dropped to throw), offered with redoing its spear thrust too, or a change: “Yes, that's it (Recommended)”. So the wall is as
  drawn (up while it stands and walks), and its thrust stays the game's own for now.

All three are his yes: the main chat may bring them in (`BRUTE_RAMPAGE` and `BONEWARD_WALL` turned on).

## For him to decide (the art chat's to ask) — asked and settled above

- The rampage as his every attack (his offer's two: the rampage and the rush), or his old level swing kept as a quick basic blow
  between rampages (his rule of 9 Oct: "They should always have a basic, single target attack"). The rampage's two swings are
  single blows at 0.6 and 1.17 s; the whole of it is 3.1 s.
- The ring at 2.5 tiles (or 2.75); the swings' reach 2.1.
- The rush at 11 tiles a second down a lane 1.8 wide, on 2.5 tiles past you.
- The wall held while it stands as well as while it walks (as drawn: up whenever it has its spear and is not lunging or throwing).
- Seen from behind, the glance is on the far face of the shield: only the star's rays and the sparks that fly out over and wide of
  it are seen.
- The Boneward's thrust itself (the game's, kept): the review finds its strike not yet a Movement 9 flash and its feet sliding as it
  coils. A later pass, under his "every enemy is going to need that change eventually".
