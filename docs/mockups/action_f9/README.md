# Floors 9 and 10: more action (mock-ups; branch `art/action-f9`)

An art helper's branch, from `art/action-f6` at 0386b52 (floors 1 to 8's new moves). Nothing here is in the game until the main
chat puts it there, on his yes. All three new things are **behind switches that are off**: with them off every frame the game shows
of the twisted deer, the fog wolf and the Drowned is the same, pixel for pixel (hashes below).

## His words

His review of every enemy for more action, 31 Oct 2026; each offered as below and answered “Yes (Recommended)”:

- THE TWISTED DEER (floor 9, medium): “Bramble charge, in place of the stomp: lowers its antlers and charges down a marked lane,
  leaving a hedge of thorns along its path that stays a few seconds.” Its gore kept, tightened by Movement 9 (a medium mob: two
  attacks, his rule of 9 Oct).
- THE FOG WOLF (floor 9, small, packs): “Pack strike: the pack spreads in a ring round you, then lunges in one after another from
  every side, a beat apart.”
- THE DROWNED (floor 10, small): “Bog retch: rises and retches a gush of black bog water in a cone. It lies as a slick that slows
  and stings.” (his ask: “something that, like, takes away space”); and his pick for FROST: “The Drowned, 10” (offered as: the
  Drowned's grab freezes you in place a moment). Two attacks on a small kind, his picks (as the bone archer's two).
- Under his rules already given: his rulebook's Monsters 9, Action, like a movie; Movement 9, 24 Oct (“Like the wind up and wind
  down are big but the actual punch is lightning quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going
  to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”).

## The pictures (`pictures/`)

- `action_f9.mp4` (1200 × 676, 50.6 s, 30 fps, H.264, captioned): each new move with the knight, from in front and from behind,
  then its strike at half speed: the deer's bramble charge (and the hedge withering) and its gore on a stand-in for floor 9's
  pinewood floor; the fog wolves' pack strike (four of them round the knight, the knight seen from in front and from behind, the
  order going round one way and then the other), and the same FROM ABOVE (a plan of the floor: the ring, each leap a streak through
  him); the Drowned's bog retch and its frost grab on a stand-in for floor 10's fen.
- `action_f9_sheet.png` (1200 × 7460): each move's six key moments from in front and from behind; each in its scene with the knight
  (the lane, the charge, the hedge; the ring and the leaps, and from above; the cone, the gush, the slick; the rime and the ice); and
  EACH OLD MOVE BESIDE ITS NEW at the same scale (the stomp and the charge, the old gore and the new, the bite and the lunge, the old
  grab and the frost grab; the retch is new, in place of nothing).

## THE TWISTED DEER: THE BRAMBLE CHARGE (`DEER_BRAMBLE`, art/action_f9_pinewood.ts)

**His fix, 2 Nov 2026** (on branch `art/action-fixes`; its film and sheet: docs/mockups/action_fixes/pictures/). His words, 07:33:
“I’m not in love with the bramble charge from the deer.  Maybe it’s just the look I don’t love, not sure”; his pick by 07:36:
“Redo hedge and gallop (Recommended)” (offered as: same move; the hedge becomes dark, living brambles: leaves, hooked thorns,
writhing up; the deer stretches into a full gallop). The move, its times, its sizes and its wall are as they were; what changed is
the look:
- **THE GALLOP**: a real gallop, painted to the way it is carried: its body low and long, its neck stretched out before it, its head
  and its antlers down and forward; its legs reaching far out in front (its forefeet come down 29 of its lengths before its middle,
  three times as far as at its stand) and far back (its hind feet push off 35 behind it), GATHERING under it and STRETCHING out in
  turn, two flights a stride (stretched out after its hind feet push off, gathered under it after its forefeet do), its forelegs
  folding tight under it and its hind legs flicked up behind as they swing through; rocked onto its forefeet and back onto its
  hind, rising in each flight; each foot down on its own spot of the floor while the floor goes by under it (feet grip); MUD kicked
  up off each foot, a splash as it comes down and clods flung back as it pushes off, the hind feet most. Its stride 2.2 tiles (6
  frames a stride at its 11 tiles a second); bursting off in its two frames into the stretched flight it lands from.
- **THE HEDGE, LIVING BRAMBLE**: green-black canes, thick (half again the thickness of the knight's wrist, so that they read at the
  game's size), each rising out of the ground COILED and WRITHING OPEN as it comes up, arching over along the hedge and curling down
  at its tip into a hook; three-fingered dark leaves along them; BIG HOOKED THORNS, a dull red-brown, out from the cane and bent back
  toward its root; writhing slowly while it stands (its arch swaying, its tip curling and uncurling); withering at the end, sagging
  and sinking, gone brown-black, its leaves dropping. Its edge the enemy's pink while it stands. Still 16 clumps, 34 high, a wall
  0.4 to either side of its path, standing 4 s, withering over 0.6 s.

**What it is.** THE LANE is marked on the floor from it, through where you stood (the golem's lane: dashed edges and chevrons of the
enemy's pink). It drops its thorned antlers, drawn back on its haunches, stamps its root-gnarled forefoot twice, earth flying, and
HOLDS, trembling, its eyes flaring. In TWO FRAMES it bursts off, smeared (after-images of its antlers and its back), earth flung
back off its hind feet; it gallops down the lane, fast, its antlers low, each foot down on its own spot of the floor as the floor
goes by under it (the game carries it), and brakes at the lane's end, its forefeet dug in and earth sprayed before it, then tosses
its antlers and snorts. And behind it, all along its path, A HEDGE OF LIVING BRAMBLE writhes up out of the ground as it passes
(his fix, above), earth thrown up as each clump bursts, its edge the enemy's pink. A wall: the knight cannot cross it while it
stands. It withers after a few seconds, its canes sinking and blackening, its leaves dropping.

| | |
|---|---|
| the move (`clips.moves.charge` with the switch on, in place of `stomp`) | **2.5 s**, 76 frames; its `hit` the bursting off, **1.0 s** (frame 30) |
| its aim (`CHARGE.aim`) | where the hero stands at **0.27 s**: the lane is marked from then, **0.73 s** before it bursts off |
| THE LANE (`CHARGE.lane`, `half`) | **7.6 tiles** long from it, **1.4 wide** (drawn by art/action_f6_golem.ts `lanePainted(..., CHARGE.lane, CHARGE.half)`) |
| the wind-up | antlers down by 0.3 s; stamps at 0.45 and 0.6 s; **HELD**, trembling, to 0.933 s (0.31 s) |
| the strike (`CHARGE_STRIKE`) | **two frames**, smeared: away (frame 29, carried 0.9 tiles), gone (frame 30, 1.9 tiles) |
| the run (`CHARGE.pace`, `run`; `chargeCarry(t)`) | **11 tiles a second** (he runs 4.6) for 0.37 s; braking over its last 0.18 s; stopped at **1.55 s**, **6.96 tiles** on (`CHARGE_CARRIED`) |
| the wind-down | tossing its antlers, snorting, its feet stepped back under it, from 1.55 s; at rest 2.5 s |
| struck | a hero in the lane as it comes by (within 0.7 of its middle) is struck and thrown aside (how hard: the rules') |
| THE HEDGE (`HEDGE`, `HEDGE_AT`, `hedgeUp(d)`, `hedgeClumpPainted`, `inHedge`) | **16 clumps**, one every 0.42 tiles from 0.3 to 6.6 tiles along its path; each bursts up as the deer's hind feet pass it (the first at 1.02 s, the last at 1.6 s), full height in 0.12 s; **34 high** (the knight is 58); a wall **0.4 tiles** to either side of the lane's middle; standing **4 s** after its last clump is up (gone at 5.72 s into the charge, `HEDGE_GONE`), withering over its last 0.6 s; its thorns sting (the rules') |
| near, far | charged at a hero from 2.5 to 7 tiles off (the stomp: 1.35 round it) |

**ITS GORE, BY MOVEMENT 9** (its basic blow, kept): its head dropped low, its antlers aimed, drawn back on its haunches by 0.25 s,
**HELD**, trembling, to 0.567 s (0.32 s; was 0.16); in **two frames** it lunges, its forefeet thrown a stride forward, and hooks its
antlers up through you, smeared (frames 18 and 19, its blow at **0.633 s**; was 0.55); its head flung up high after, held to 0.95 s;
its forefeet stepped back by 1.28 s; at rest **1.6 s** (`GORE9`, `GORE_STRIKE`). Its reach (`GORE9.reach`, `half`): a strip **1.6
tiles** before it, **0.9** to either side (the game's: 1.12, 0.65), knocked back 0.8 (the game's 0.5).

## THE FOG WOLF: THE PACK STRIKE (`WOLF_PACK`, art/action_f9_pinewood.ts)

**What it is.** The pack glides in and spreads in A RING round you, each on its own place of it. Then, one after another, going
round, a beat apart, each crouches down into its fog, its eyes flaring, its jaws opening, and HOLDS, trembling; in TWO FRAMES it
leaps clean through where you stand, smeared: its fog streaming back along the way it came, its eyes' fire drawn out in two lines
(the enemy's pink and gold), its jaws snapping shut past you, fog bursting from them; it lands beyond you skidding on its fog, its
fog splashing out low, shakes its head and falls back into its fog: on the ring again, across from where it was. So the ring is
never broken: after the four you are still surrounded.

| | |
|---|---|
| the move (`clips.attack` with the switch on: the lunge, in place of the bite) | **1.5 s**, 46 frames; its `hit` the snap past you, **0.633 s** (frame 19) |
| the wind-up | crouched into its fog by 0.25 s; **HELD**, trembling, to 0.567 s (0.32 s) |
| the strike (`LEAP_STRIKE`; `leapCarry(t)`) | **two frames**, smeared: in the air (frame 18, carried 2 tiles), snapped shut (frame 19, **4.4 tiles** on) |
| the wind-down | skidding **0.8 tiles** more over 0.34 s, tugging its head; back into its fog; on its stand by 1.5 s |
| struck (`LEAP.half`; `leapStrikes`) | a hero in the strip it leaps through, from where it was to 4.4 tiles on, **0.6** to either side (the bite's: 1.225 before it, 0.5) |
| THE PACK (`PACK`, `packOf(n)`) | the ring **2.6 tiles** round the hero; each a **beat of 0.35 s** after the one before, going round; its leap and skid (5.2 tiles) twice the ring: it lands on the ring across from where it was (the film: four of them; the rules' to spread 4 or 5) |
| its canvas (`LEAP_CANVAS`) | 420 × 300, its floor point at (210, 170): its smear behind it within it |

The game's circling (game/act1_rules/wolf.ts `WOLF.circle`: each makes for its own place round the hero's back) becomes the gathering
on the ring; the beat and who goes first are the rules'.

## THE DROWNED: THE BOG RETCH AND THE FROST GRAB (`DROWNED_RETCH`, art/action_f9_fen.ts)

**THE BOG RETCH.** It rises up out of its hunch, rearing back, its chest swelling, its head thrown back, and HOLDS, heaving, black
water dribbling from its mouth and gurgling at its lips, its eyes flaring, while THE CONE it will cover is marked on the floor before
it (the enemy's pink, dashed). In TWO FRAMES it lurches forward and down, its hips and chest first and its head after, smeared, and
retches: A GUSH of black bog water thrown out of its mouth (thick, the fen's weed in it), flung in arcs out over the cone and
splashing down on it. It lies there as A SLICK: black and oily, mottled, the fen's weed in it, a dull sheen on it, bubbles rising
and popping, its ragged edge dotted with the enemy's pink; shrinking over its last 0.8 s. Whoever wades in it is slowed and stung.
Floor taken away.

| | |
|---|---|
| the move (`clips.moves.retch` with the switch on) | **2.2 s**, 67 frames; its `hit` the retch, **0.833 s** (frame 25) |
| the wind-up | risen and rearing by 0.35 s; **HELD**, heaving, to 0.767 s (0.42 s); the cone marked from 0.3 s (0.53 s before it retches) |
| the strike (`RETCH_STRIKE`) | **two frames**, smeared: lurching (frame 24), retching (frame 25) |
| the wind-down | retching on, bent double, the gush pouring, to 1.3 s; heaving to 1.6 s; hunched again by 2.2 s |
| THE GUSH (`SLICK.lands`; `gushPainted`) | comes down **0.12 s** after the retch over the cone: a hero in it then is struck |
| THE CONE (`SLICK.from`, `long`, `ang`; `inCone`) | from 0.3 to **3.2 tiles** before it, **32°** to either side of straight before it (about 3.4 tiles across at its far end) |
| THE SLICK (`SLICK.spread`, `stays`, `fade`, `slow`; `slickPainted`) | spreading out in 0.3 s; lying **5 s**, shrinking over its last 0.8 s; a hero in it slowed to **half** his pace and stung, tick by tick (the rules', as the firepot's burning floor) |
| near, far | retched at a hero from 1 to 3 tiles off |

**THE FROST GRAB, BY MOVEMENT 9** (its grab, kept, made the frost's): its arms flung up and wide, its head thrown back, by 0.3 s,
**HELD**, trembling, frost creeping white over its hands and forearms (crystals standing off its fingers, its breath smoking cold),
to 0.667 s (0.37 s; was 0.16); in **two frames** it lunges, its hips and chest first and its hands after, both hands clutching shut,
smeared (frames 21 and 22, its blow at **0.733 s**; was 0.667); ice bursts from its grip; it grips on to 1.0 s, wrenches you down
by 1.3 s, lets go and hunches again by **1.9 s** (`GRAB9`, `GRAB_STRIKE`). Its reach (`GRAB9.fwd`, `half`): a strip **0.2 to 1.7
tiles** before it, **0.8** to either side (the game's: to 1.06, 0.55). **FROZEN IN PLACE** (`FROST`; `rimePainted`): as its hands
close, a hero within **1.0 tile** of the point 1.15 tiles before it is struck and **frozen in place for 0.8 s**: rime races out over
the floor to 1.0 tile in 0.12 s, feathered crystals, its edge the enemy's pink; ice shoots up round his feet and stands while he is
held, then shatters, its shards flung, as he is let go; the rime fades by 1.6 s. (The film rimes the knight himself, his colours
whitened toward the frost's from his feet up: the hero's own frozen look is the main chat's to make.)

**HOW THE FROST IS KEPT APART FROM THE FRIEND'S CYAN.** The frost (`RIME`: `#40444e`, `#686e7c`, `#9ca6b8`, `#cdd4de`, `#eef2f6`)
is a grey-white with only a little blue in it: its hue 210 to 223 degrees (bluer than cyan, toward slate), its saturation 0.03 to
0.18. The friend's cyan (art/kit.ts `CYAN`: `#0c6a80`, `#22d0e0`, `#b8fff8`) is hue 174 to 191 degrees, its glow saturated 0.85 to
0.91. So the frost reads as cold white and grey, never as a glow, and it wears the enemy's pink: its edge on the floor, the rims of
the ice shards, flecks of pink in the frost on its hands, the pink leading edge of its smear. Tested: every frost colour's hue and
saturation (tests/action_f9.test.ts 5), and no frame or light of any of it cyan by the checks' test.

## The switches, and bringing it in

- `DEER_BRAMBLE`, `WOLF_PACK` (art/action_f9_pinewood.ts), `DROWNED_RETCH` (art/action_f9_fen.ts), all `{ on: false }`. The makers:
  `makeBrambleDeerArt`, `makePackWolfArt`, `makeFrostDrownedArt`: each the game's own figure's pictures (from its own maker) with only
  its new moves put in (tested frame for frame). The deer's stomp is gone from its new set; its old moves stay in their own files.
- Hashes of every frame the game shows of the three (tools/action_f9_hash.ts, through art/act1_figs/), on 0386b52 and on this
  branch, the same: deer `13bda852bc8fff58`, wolf `3e6b7fd0ff8d8f3b`, drowned `6d07028e30e962bb` (tested).
- To bring it in (the main chat's; the files are mock-ups: move what each needs into the game's own as the art chat's work is
  brought in):
  - THE TWISTED DEER: art/act1_figs/deer.ts `make: DEER_BRAMBLE.on ? makeBrambleDeerArt : makeDeerArt`; in game/act1_rules/deer.ts
    the gore's `long` 1.6, `hit` `GORE_HIT`, `reach` 1.6, `half` 0.9, `knock` 0.8; the stomp's act becomes the charge, clip `charge`,
    `long` 2.5, `hit` `CHARGE_HIT`, `near`/`far` 2.5/7: at `CHARGE.aim` take the way to the hero and lay `lanePainted` from the deer
    along it (`CHARGE.lane`, `CHARGE.half`); from the hit carry the deer along it by `chargeCarry(t)` (stopping at a wall), striking
    a hero within `CHARGE.half` of the lane's middle as it comes by; lay the hedge's clumps at `HEDGE_AT` along its path (to where it
    stopped), each from `hedgeUp(d)`, drawn by `hedgeClumpPainted(d, t, view, 'floor' | 'air')` (the air sorted at its own place);
    while `inHedge` holds, a wall the hero cannot walk through, its thorns stinging (the rules'). Its cooldown is the stomp's.
  - THE FOG WOLF: art/act1_figs/wolf.ts `make: WOLF_PACK.on ? makePackWolfArt : makeWolfArt`; in game/act1_rules/wolf.ts the bite's
    act becomes the lunge, `long` 1.5, `hit` `LEAP_HIT`, its reach the strip `leapStrikes` (the act begins from the ring: `far` 2.8);
    carry it along the way it faces by `leapCarry(t)` (to a wall); the circling becomes the gathering on the ring (`PACK.ring`, each
    at its own place round the hero, spread evenly), and the pack's lunges a `PACK.beat` apart, going round (`packOf(n)`).
  - THE DROWNED: art/act1_figs/drowned.ts `make: () => DROWNED_RETCH.on ? makeFrostDrownedArt() : makeDrownedArt3()`; in
    game/act1_rules/drowned.ts the grab's `long` 1.9, `hit` `GRAB_HIT`, its strip `GRAB9.fwd`/`half`; as it hits, a hero within
    `FROST.r` of the point `FROST.at` before it is frozen in place `FROST.hold` (no moving, no dodging; the game's chill on the hero
    may be kept after it), the rime laid by `rimePainted(t, 'floor' | 'air', side)` there; a second act, the retch, clip `retch`,
    `long` 2.2, `hit` `RETCH_HIT`, `near`/`far` 1/3, its cooldown the rules': the cone laid by `slickPainted(t - hit, view)` from
    0.3 s (marked, then the slick), the gush by `gushPainted(t - hit, view, side)`; a hero `inCone` as it lands (`SLICK.lands`) is
    struck; the slick a peril for `SLICK.stays`: slowed to `SLICK.slow` while in it, stung tick by tick. Its rising out of the water
    is the game's own, kept.

## The checks

`tests/action_f9.test.ts` (5 tests, all pass):

1. the switches off; nothing of the game imports the mock-ups; the game's frames of the three hash as on 0386b52; with the new art,
   every list the game's own but the new moves; the charge in place of the stomp;
2. every frame of every new move paints, wears the enemy's pink edge, is crisp, has no cyan, both ways round; nothing cut off, on
   their own canvases;
3. **the Drowned through the bosses' review** (art/boss_checks.ts `checkBoss`, on the heroes' bones; its shape the game's own,
   tests/drowned_shape.ts, with its strikes, smears and the end each strikes with: its hands, its mouth; tests/action_f9_shapes.ts),
   from in front and from behind, from every frame of its stand and back: **nothing found**; Movement 9 (two-frame strikes, held
   0.3 s and more, big wind-downs);
4. **the deer and the wolf through the review for the old rigs** (art/action_f1_checks.ts `checkKit`, their own solids not being on
   the heroes' bones: SLIDE, FLOOR, JERK, JUMP, BLOW, HIPS, STRIKE; the deer with its forefeet and then its hind feet as its soles;
   every point where the game has carried it over the floor, and the stand it hands back to there), from in front and from behind:
   **nothing found**; Movement 9; the charge's antlers held still (but for trembling) from its last stamp to its strike;
5. what they leave (the hedge, the lane, the cone and the slick, the gush, the rime and the ice): crisp, no cyan, not cut off; the
   frost's colours clear of the friend's cyan; and the numbers above (bigger than the game's own, from its rules' own files).

Also passing: the three figures' own tests (`twisted_deer`, `fog_wolves`, `drowned`, `act1_deer`, `act1_wolf`, `act1_drowned`),
`new_mobs3`, the model's `action_f6` and `palace_hands`; `tsc` clean. Changed outside this branch's own files:

- art/twisted_deer.ts, art/fog_wolves.ts: `export` added to the names the mock-up builds on (their poses, keys and painters); and
  art/fog_wolves.ts's loose fog (`grainsOf`, `stream`) takes the pose maker it follows as a last argument, its own by default, so
  that the lunge's fog streams back along its leap: no frame of theirs changes (the hashes).
- tests/twisted_deer.test.ts, tests/fog_wolves.test.ts, tests/drowned.test.ts: their check that nothing else imports them lets
  through art/action_f9_*.ts (mock-ups nothing of the game imports: tests/action_f9.test.ts 1); tests/new_mobs3.test.ts: the two added
  to its list of the mock-ups built on the new monsters, as floors 2 to 8's were; tests/action_f6.test.ts: its check that nothing
  imports floors 6 to 8's mock-ups lets through art/action_f9_*.ts (built on its art/action_f6_fx.ts; nothing of the game imports them).

Made by: `tools/action_f9_film.ts` (the film), `tools/action_f9_sheet.ts` and `tools/action_f9_captions.py` (the sheet),
`src/dev/action_f9_scene.ts` (the scenes, on stand-ins for floors 9 and 10's grounds in their own colours; the plan from above),
`tools/action_f9_hash.ts` (the hashes), `tools/action_f9_review.ts` (the reviews said), `tools/action_f9_peek.ts` (strips of frames,
while drawing).

## For him to decide (the art chat's to ask)

- THE PACK'S LEAPS go clean through where you stand and on to the ring across (4.4 tiles in two frames, then a skid), so that the
  ring is never broken; the other way would be each lunging in and falling back to its own place.
- How many in the pack (the film shows four, one from each side; the rules may spread five), the ring 2.6 tiles, the beat 0.35 s.
- THE HEDGE stands 4 s after it is all up and is a wall; whether its thorns also hurt to touch is the rules' (a suggestion: a small
  sting, as the slick's).
- FROZEN IN PLACE 0.8 s is a long time to be helpless under a second Drowned; the grab is only frost-struck within 1 tile of where
  its hands close. The knight's frozen look in the film (his colours whitened from the feet up, ice round his feet) is a stand-in:
  how a hero looks frozen is the main chat's.
- The deer's charge stops at 7 tiles (or a wall); whether it turns and charges back while the hedge stands is his call (not drawn).
