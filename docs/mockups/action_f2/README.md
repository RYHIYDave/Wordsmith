# Floor 2: more action, and the Headsman's axe mended (mock-ups and a mend; branch `art/action-f2`)

An art helper's branch, from `art/action-f1` at 3c7ec44 (the game's `high-city` with floor 1's new moves). Nothing here is in the
game until the main chat puts it there, on his yes. The cultist's and the Shade's new moves are **behind switches that are off**:
with them off every frame the game shows of the cultist and the Shade is the same, pixel for pixel (hashes below). The Headsman's
mend is **not** behind a switch that is off: it is a fix to his live frames, and changes exactly the moves listed below.

## His words

- His review of every enemy for more action, 31 Oct 2026 (the floor 1 README has his words on it).
- THE CULTIST (floors 2 to 10): offered "Fire sigil: draws a burning circle on the floor under you. It erupts in a pillar of fire a
  second later and burns on for a few seconds."; his pick “Yes (Recommended)”.
- THE SHADE (floors 2 to 5): his picks “Keep the rake”, and for FROST, the Shade (offered as: “The grave's cold: its rake chills you
  and leaves rime on the floor that slows”).
- THE HEADSMAN (floor 2's boss): “His axe is still spinning around and kinda wonky”; asked when, “His axe wheel,Walking or
  standing,His flurry or lunge”.
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger
  AOE to compensate for the extra time the player gets to evade”).

## The pictures (`pictures/`)

- `action_f2.mp4` (1200 × 676, 38 s, captioned): the cultist's fire sigil with the knight, from in front and from behind (twice
  the game's pixels), then at half speed; the Shade's cold rake and its rime from in front (four times) and from behind, then the
  rake at half speed (six times); the Headsman BEFORE (left) and AFTER (right), side by side: setting off, walking and stopping
  (twice); his lunge, from in front and from behind; its wind-down at half speed; his flurry; his axe wheel.
- `action_f2_sheet.png` (1200 wide): the cultist's six key moments from in front and from behind; the sigil traced, burning, the
  eruption's two frames, the floor burning on; the cold Shade's five key moments both ways; the rime spreading, lying (the knight in
  it), melting; the Headsman before and after: setting off and walking, the lunge's wind-down, the flurry, the wheel.

## THE FIRE SIGIL (the cultist's attack, in place of its fire bolt)

**What it is.** The cultist raises its flame high before its cowl, then TRACES A RING IN THE AIR with it, round once, the ring
burning where its fire has been (pink at its edge, gold inside, white where it is newest); the fire swells as it goes. In step with
its hand THE SAME RING IS DRAWN ON THE FLOOR UNDER THE HERO, a fuse of white fire going round; then its inner ring, six marks of
flame between the two, and the cult's three-pointed sign inside, all burning brighter, the enemy's pink at the ring's edge pulsing
faster, sparks rising (the warning). It HOLDS its fire up, a ball of fire, leaning back, trembling. Its body is thrown forward, and
in ONE frame it flings its hand down to the floor before it, the fire gone out of the hand in a streak; and the sigil ERUPTS in two
frames: a streak of fire shooting up, then THE PILLAR, a column of flame as wide as the ring and twice the knight's height. The
pillar roars a moment and falls back into the floor, which BURNS ON, scorched black, low flames and embers over it, the fire
shrinking in to the middle and gone. The cultist stays bent over its hand a moment, then straightens, the flame kindling again in
its palm.

**Its numbers** (all checked in `tests/action_f2.test.ts`):

| | |
|---|---|
| the cast (`clips.attack` with the switch on) | 1.95 s, 60 frames at 30 a second |
| the wind-up | the fire raised by 0.16 s; the ring traced in the air 0.16 to 0.56 s (`SIGIL_TRACE`); **held** to 1.13 s (the hand still over half a second) |
| the strike (`SIGIL_SLAM`, the clip's `hit`) | **1.2 s, frame 36: one frame** (the body goes first, 1.13 to 1.17 s) |
| the wind-down | pressed on down to 1.32 s; held bent over to 1.45 s; up, the flame kindling, at rest 1.95 s |
| the ring (`SIGIL.radius`) | **1.75 tiles** round its middle (drawn and tested from 1.5 to 2.0: the main chat may set it) |
| when it appears (`SIGIL.delay`) | **1.04 s before the eruption**, as the cultist begins its ring in the air (0.16 s into the cast); traced round in 0.4 s (`SIGIL.trace`), the rest of it drawn in 0.25 s more |
| the eruption (`SIGIL.strike`) | two frames: at the slam (a streak) and the frame after (the pillar); what is struck: a hero whose middle is inside the ring at the slam |
| the pillar | `PILLAR_TALL` 196 picture pixels (the knight is about 100); stands 0.3 s (`SIGIL.pillar`), falls over 0.2 s (`SIGIL.fall`) |
| the burning floor (`SIGIL.burn`) | **3.0 s** after the pillar has fallen; `burnRadius(t)` shrinks from the ring's radius to nothing; nothing left 3.5 s after the eruption (`SIGIL_LONG`) |

**How the game can lay it** (art/action_f2_fx.ts; picture pixels, two to a game pixel): `sigilPainted(t, 'floor' | 'air', radius,
side)` on `SIGIL_CANVAS` (236 × 318), anchored at the ring's middle (where the hero stood when the cultist began its ring). `t` is
seconds from the eruption (from `-SIGIL.delay` to `SIGIL_LONG`). The floor layer goes under the figures; the air layer (the sparks,
the pillar, the flames it leaves) by halves, `'behind'` before a figure at the ring's middle and `'before'` after it.
`sigilStrikes(x, y)` and `burnRadius(t)` say who is struck and who burns.

## THE SHADE'S RAKE, COLD, AND ITS RIME

**What it is.** The rake is the game's own, every frame of its motion as it was (“Keep the rake”). As its claws go up, FROST
GATHERS ON THEM: crystals at their tips and a pale glow; THE COLD FALLS OFF THEM like breath, drifting down and spreading. As it
rakes, frost streaks with its claws beside its own pale streaks, and bursts off them; after, the cold drifts down off them and is
gone by the rake's end. Where it rakes, RIME spreads over the floor in a fifth of a second: a crust of frost, darker at its very
edge, feathered with crystals running out from its middle, glittering, a fleck of the enemy's pink here and there in its edge. It
lies, slowing whoever stands in it; then it melts in from its edge, breaks up, and is gone.

**The frost's colours** (`FROST`): `#4e5878`, `#7c88aa`, `#aab2d2`, `#d4d9ee`, `#eff1fb`: a pale grey-blue, hue 224 to 230
degrees, 5 to 35 percent saturated. The friend's cyan (art/kit.ts `CYAN`) is `#0c6a80` (hue 192), `#22d0e0` (hue 186, 85 percent)
and `#b8fff8` (hue 174, green over blue): every frost colour is at least 30 degrees of hue from all of them, and far paler than the
first two (tested). The Shade's own violet-grey (`PALLOR`, hue about 250) is a step the other way.

**Its numbers:**

| | |
|---|---|
| the rake | the game's own: 0.85 s, its blow at 0.5 s (`SHADE_HIT`) |
| the frost on its claws | gathering over its first 0.17 s; the cold falling off them all through the wind-up; streaks and a burst at the blow (0.2 s); gone 0.32 s after the blow |
| the rime (`RIME.radius`) | **1.2 tiles** round its middle (its edge ragged, 0.86 to 1 of it; drawn and tested 1.0 to 1.25) |
| where (`RIME.ahead`) | its middle **1.0 tile** before the Shade, the way it faces (its claws come down 0.6 tiles before it; it reaches 1.1) |
| its time | spreads over **0.2 s** from the blow (`RIME.form`); lies **4.0 s** from the blow (`RIME.lie`), melting from its edge over the last **1.0 s** (`RIME.melt`) |
| the slow (`RIME.slow`) | **0.4** (40 percent slower: a suggestion, the rules'); `rimeHolds(t, x, y)` says who is in it |

**How the game can lay it:** `rimePainted(t, radius)` on `RIME_CANVAS` (132 × 72), anchored at the rime's middle, under the
figures; `t` is seconds from the blow. The cold Shade is `FROST_SHADE` (the game's `SHADE` with `frostBits` added to its painting),
and `makeFrostShadeArt(pace)` makes it as the game holds a monster (as art/new_mobs3.ts `makeShadeArt3`).

## THE HEADSMAN'S FAULT, AND ITS MEND

**What was wrong.** His long axe is two ways at every key of a move: the way its haft runs and the way its blade's edge faces.
Between two keys each was mixed by itself, as two pairs of angles, and the edge then squared to the haft. So the blade was not held:

- **Walking or standing:** in his stand the blade faces out to his right; in his walk it faced down and behind him. Every time he
  set off or stopped (0.34 s and 0.41 s), the blade turned over 70 degrees round the haft in his hand, and he sets off and stops all
  fight long.
- **His lunge:** its wind-down whipped the axe up over his head and down behind his right shoulder in a fifth of a second, and the
  blade flipped round the haft on the way, 48 and 60 degrees in two frames (and 142 degrees in all from the follow-through to his
  guard).
- **His flurry:** its edge, mixed apart from the haft, turned round it 15 to 21 degrees a frame for four or five frames at a time,
  into the cock and between the cuts (it is brought round to lead each cut of its figure of eight).
- **His axe wheel:** each frame is right, but the haft's way was said as the way it points, which goes over the top and comes back
  from the other side twice a turn; between two frames the haft swung 17 degrees out of the wheel, toward him and away, and the
  wheel of fire (the streak, drawn through those moments between) wobbled.
- (And his vault: 37 and 43 degrees in a frame as he wrenched the axe out of the floor, 38 in the air.)

**The mend** (art/headsman2.ts, art/headsman2_moves.ts; the switch `AXE_HELD`, ON: off, he is every frame as he was):

- THE BLADE IS CARRIED WITH THE HAFT as one thing held in his hands: between two keys the one key's edge is carried along the way
  the haft truly goes, step by step, and what is left between the two keys' edges (how far he turns the axe in his grip) is turned
  evenly, the short way (`carriedEdge`, `edgeAlong`). His quick moves made as one smooth sweep (`sweep`) do the same along their own
  curve. (In the flurry this changes little: its turns are its own, the edge brought round to lead each cut, and they stay: 15 to
  21 degrees a frame, four to six frames at a time, smooth, never a flip. See "For him to decide".)
- His walk carries the axe as his guard holds it (its edge his guard's, carried to the way he carries it walking).
- His lunge's wind-down: he brings the axe back the way it came, flat and low before him, round to his right, and up onto his
  shoulder (two new keys; the move's length, its blow and its footwork as they were): turned in his grip 3 degrees in all.
- His vault: wrenched up out of the floor and out to his right, rising, then onto his shoulder; in the air the blade turns from out
  to his right to before him over the whole flip, not in four frames.
- His wheel: its ways said as going on round the wheel, so that between two frames the haft stays in it. Its frames are the same.

**What it changes** (every frame hashed before and after, tools/action_f2_hash.ts; both ways round): his **walk** (all 10 frames),
**setting off** (10 of 11) and **stopping** (all 13); his **lunge** (35 of 46 frames from in front, 34 from behind, and 2 of the
3 still picks of it); his **flurry** (54 of 72 from in front, 53 from behind); his **wheel** (51 and 52 of 72: its start and end,
and its streak in the spin); his **vault** (28 of 76). The whole of him hashes `db03f3f98f7bd9af` (was `0793fd1d4dd562fb`). **Not changed:** his stand, his dashes, struck, his death. Now no move of his turns the blade more than 21
degrees round its haft in a frame (it was 60), and as he stands, sets off, walks and stops not at all (it was 11 a frame, 70 each
time).

**One game number follows the pictures** (src/game/bosses.ts, `HEADSMAN2_FIGHT.flurry.cuts`, where his blade is at each of the
flurry's three cuts, held to his pictures by tests/headsman2_rules.test.ts): the second cut's moved 0.012 tiles (under a game
pixel). Now `[0.62, 3.421, 2.165]`, `[1.08, 4.022, -2.123]`, `[1.54, 5.513, -0.021]` (were 3.419, 2.17; 4.029, -2.111; 5.513,
-0.019).

## The switches, and bringing it in

- `CULTIST_SIGIL` (art/monster_cultist.ts) and `SHADE_FROST` (art/action_f2_fx.ts), both `{ on: false }`. With `CULTIST_SIGIL`
  on, `makeCultistArt()` has the cast as its `clips.attack` (its `hit` the slam) in place of the bolt; the bolt's timelines are kept
  in `cultMoves`, out of its set. The cultist's rig paints the ring in the air only for a pose with `gale`, the slam's streak only
  for one with `sweep` (no live frame has either), and reports its joints only when a review sets `CULTIST_SEEN.see` (null).
- `AXE_HELD` (art/headsman2.ts) is ON: the mend is live on this branch (the point of it). Off, he is as he was.
- Hashes (tools/action_f2_hash.ts), on 3c7ec44 and on this branch, the game's switches: cultist `6ded30fb72da833b` (the same),
  Shade `b8c04708fc808129` (the same), Headsman `0793fd1d4dd562fb` before, and the same with `AXE_HELD` off; with it on
  `db03f3f98f7bd9af`, his moves as listed above.
- To bring it in (the main chat's): the cultist: `CULTIST_SIGIL.on`; its windup in `MONSTERS.cultist` to the cast's slam, 1.2 s
  (the game plays a wind-up by how much of it is done); at the cast's start put the sigil where the hero stands, strike within
  `SIGIL.radius` at the slam, burn within `burnRadius(t)` after (so much a second); a cooldown a little longer than the bolt's.
  Lay the pictures as above. The Shade: in the bestiary, `figure === 'shade' ? (SHADE_FROST.on ? makeFrostShadeArt(...) :
  makeShadeArt3(...))` (the file is a mock-up: move what it needs into the game's own files as the art chat's work is brought in);
  at its blow lay the rime `RIME.ahead` before it, slow by `RIME.slow` within `rimeHolds`. The Headsman: merge as it is (his tests
  pass; the one flurry number above goes with it).

## The checks

`tests/action_f2.test.ts` (7 tests, all pass):

1. the switches off; nothing of the game imports the mock-up; with them on, every frame the cultist and the Shade had is the same
   but the cultist's attack (now the cast, its slam on frame 36; the bolt with the switch off) and the Shade's rake (cold);
2. every frame of the cast and of the cold rake paints, wears the enemy's pink edge, is crisp, has no cyan, nothing cut off by its
   canvas; the frost's colours well clear of the cyan;
3. **the cast through the bosses' review** (art/action_f1_checks.ts `checkKit`, the older 2D rig: SLIDE, FLOOR, JERK, JUMP from
   every stand frame and back, BLOW, HIPS, STRIKE), from in front and from behind: nothing found; Movement 9 (the fire held over
   0.45 s, the slam one frame, smeared), its hand round its ring in the air;
4. **the cold Shade through the bosses' review** (art/boss_checks.ts `checkBoss`, on the heroes' bones), from in front and from
   behind: it finds exactly what it finds of the game's own Shade, the frost changing nothing of how it moves. What it finds of the
   game's own (kept as it is, his word): its claws set off at their fastest in the rake's first frame (its first key is eased
   'out'), and standing, it floats, so no weight to shift (see below);
5. the sigil: its numbers; traced in step with the hand; the pink edge; the eruption a streak then the pillar; the pillar as tall as
   said; it falls; the floor burns on, shrinking; nothing after; at 1.5, 1.75 and 2 tiles nothing cut off, crisp, no cyan;
6. the rime: its numbers; it spreads, lies, melts from its edge, is gone; at 1.0, 1.2 and 1.25 tiles nothing cut off, crisp, no
   cyan, only the frost's colours and the enemy's pink;
7. **the Headsman's mend:** with `AXE_HELD` off every frame as he was (`0793fd1d4dd562fb`); his stand, dashes, struck and death the
   same with it on; with it on the blade turns no more than 22 degrees round its haft a frame in any move (it was over 50), not at
   all as he stands, sets off, walks and stops; the lunge's wind-down turns it in his grip under 15 degrees in all; the wheel's haft
   in its wheel at every moment of its spin.

Also passing: `tests/headsman2.test.ts` (**every move of his through every boss check**, from in front and from behind, nothing
cut off, nothing in the floor), `tests/headsman2_rules.test.ts`, `tests/palace_hands.test.ts`, `tests/bosses.test.ts`; `tsc`
clean. One line changed in `tests/new_mobs3.test.ts` (its list of the mock-ups allowed to import the new monsters' file):
`action_f2_fx` added, as every mock-up built on them before it. (`tests/first5_bosses.test.ts` test 10, the royal shadow's size,
and `tests/monster_attacks.test.ts`'s rule of how many attacks each size has, fail on this branch and on 3c7ec44 before it alike:
not this branch's.)

Made by: `tools/action_f2_film.ts` (the film), `tools/action_f2_sheet.ts` and `tools/action_f2_captions.py` (the sheet),
`src/dev/action_f2_scene.ts` (the scenes, on floor 1's stand-in floor), `tools/action_f2_hash.ts` (the hashes).

## His word on the pictures

Shown `action_f2.mp4` and `action_f2_sheet.png`, 31 Oct 2026 (about 17:55), and asked of each:

- The cultist's fire sigil (raised, traced under you, held, slammed; the pillar a second later; the floor burning 3 s), offered
  with a bigger ring (2 tiles) or a change: “Yes, that's it (Recommended)”. So the ring stays at 1.75 tiles.
- The Shade's frost rake and its rime (4 s, slowing), offered with a smaller rime or a change: “Yes, that's it (Recommended)”.
  So the rime stays at 1.2 tiles and 4 s; the rake's motion stays as it was.
- The Headsman's axe held firm (walk, stop, lunge, wheel; the lunge's wind-down round low and onto his shoulder; the flurry
  still turning the blade a little between cuts), offered with holding it still in the flurry too, or still wonky: “Yes, that's
  fixed (Recommended)”. So `AXE_HELD` is his yes, as drawn, and the flurry keeps its turn between cuts.

All three are his yes: the main chat may bring them in (the sigil and the frost behind their switches, turned on).

## For him to decide (the art chat's to ask) — asked and settled above

- The sigil's ring at 1.75 tiles, or 2.0 (bigger, his "bigger AOE"; the cultists come several at a time).
- The rime at 1.2 tiles and 4 s, slowing by 40 percent: the Shades come in threes, so three rakes can lay a good deal of it.
- The Shade's rake as it is (his “Keep the rake”): the review finds its claws set off at their fastest (its wind-up begins with no
  ease-in). Easing its first key would change its motion a little; left as he said.
- The Headsman's lunge now brings the axe back round low before him rather than over his head: a new path for the wind-down (the
  only way to bring it to his shoulder without turning it over in his hands).
- The Headsman's flurry still turns the blade in his hands between its cuts (smoothly: 60 to 90 degrees over four to six frames,
  five times, so that the edge leads each cut). If that is the "wonky" he sees in the flurry, it can be held fixed in his grip
  all through it (the edge then not leading every cut: a heavy blade swung partly flat). The art chat's to ask.
