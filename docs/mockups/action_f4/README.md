# Floor 4: more action (mock-ups; branch `art/action-f4`)

An art helper's branch, from `art/action-f3` at 8b4acbb (the game's `high-city` with floors 1 to 3's new moves). Nothing here is in
the game until the main chat puts it there, on his yes. Both new things are **behind switches that are off**: with them off every
frame the game shows of the Ossuary Golem and the dagger cultist is the same, pixel for pixel (hashes below). The Amalgamation,
floor 4's boss, is not in this branch (another helper's, after this one).

## His words

- His review of every enemy for more action, 31 Oct 2026, 10:41, of the Ossuary Golem: “Like, yes, there are enemies that throw
  things, but, like, look at the, like, the ossuary golems. Like, they throw a skull, and it's, like, the tiniest little projectile.
  When it lands, it does nothing. And it's so slow that you'll never, ever get hit by it. So, like, why don't they throw, like, a
  full... You know, they throw, like, a whole entire skeleton. And then when it lands, it blows apart. And you can get hit by the
  shrapnel, you know, of, like, a bone or something. You know what I mean? Like, that kind of thing.”
- THE OSSUARY GOLEM (large, floors 4 and 5): offered back to him "Skeleton hurl: picks up a whole skeleton and hurls it, big in the
  air, its shadow on the floor showing where. It bursts apart when it lands and bones fly out all round as shrapnel."; his pick
  “Yes (Recommended)”.
- THE DAGGER CULTIST (small, floors 4 to 10 and the cult): offered "Frenzy: four stabs in a blur, stepping in with each, then it
  stands winded a moment. That's your opening."; his pick “Yes (Recommended)”.
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger
  AOE to compensate for the extra time the player gets to evade”).

## The pictures (`pictures/`)

- `action_f4.mp4` (1200 × 676, 31 s, captioned): the golem's skeleton hurl with the knight, from in front and from behind (twice the
  game's pixels): it reaches down and hauls a skeleton up out of the floor, swings it up and holds it aloft (the burst's reach marked
  on the floor round the knight from then), hurls it in two frames; the skeleton cartwheels through the air over its growing shadow,
  lands and bursts, bones flung out all round, lying, crumbling; the knight runs out of the mark. The hurl at half speed. The dagger
  cultist's frenzy with the knight, from in front and from behind (three times the game's pixels): he runs in, coils, four stabs
  stepping in (the knight giving ground), then stands winded, bent over and heaving, and the knight takes his opening. The stabs at
  half speed. A pack of five at the game's size, running in at the knight from all round, each frenzying in his turn.
- `action_f4_sheet.png` (1200 wide): the hurl's six key moments from in front and from behind; the skeleton in flight (four moments
  of its cartwheel, over its shadow); the burst (marked, coming down, landing, flung out, lying, crumbling); THE OLD SKULL LOB BESIDE
  THE NEW HURL at the same scale (its skull cocked, the skull in flight; the skeleton held aloft, the skeleton in flight); the club
  swing made by Movement 9; the frenzy's seven key moments both ways; the frenzy with the knight.

## THE SKELETON HURL (the golem's second attack, in place of its skull lob)

**What it is.** It reaches down to the floor at its right, its body bent over its knees, and its fist goes into the bones underfoot
(bone dust and chips thrown up). It HAULS UP A WHOLE SKELETON by the neck, out of the floor: the game's own skeleton's look (the
big lavender skull with the pink in its sockets and its jaw hanging open, the rib cage, every vertebra and joint a knob, three
finger bones to a hand, long feet, the teal rag round its hips), skull lolling over the fist, dangling, limbs swinging as it is
hauled (it hangs from the fist as a weight on a stiff line swings: flung out by the fist's going, swinging back, settling). It
swings it up and out and holds it ALOFT at its right side, HELD, trembling with the weight of it, its fire flaring (the warning:
it has taken its aim, and the reach of the burst is marked on the floor where the hero stood). In TWO FRAMES it hurls it overarm:
over the top, the skeleton whipped out straight behind its fist, and loosed before it, smeared (after-images of the skeleton's skull,
neck, pelvis and feet along the way they came, the newest near white, the enemy's pink at its leading edge). It folds over after
the throw, heaving, and straightens. THE SKELETON FLIES fast on a low arc, CARTWHEELING (its front to the eye, so that it is always
seen whole), arms flung wide and legs splayed, flailing, the enemy's pink edge round it; its shadow on the floor under it grows and
darkens as it comes down. It LANDS AND BURSTS: a flash (white, the enemy's gold and pink), its bones (skull, jaw, pelvis, four
ribs, its long bones, two lengths of spine, its hands and feet) flung out all round and up, turning over and over, landing within
the burst's reach; chips of bone; a band of bone dust going out over the floor to the reach's edge, its leading edge the enemy's
pink; a cloud of bone dust settling; pink embers rising (the golem's fire). The bones lie where they fell, then crumble to dust one
by one and are gone.

**Its numbers** (all checked in `tests/action_f4.test.ts`; art/action_f4_fx.ts `HURL`, `hurlFly`, `hurlArc`, `hurlAt`):

| | |
|---|---|
| the move (`clips.moves.throw` with the switch on) | 2.5 s, 76 frames at 30 a second; its `hit` the loosing, **1.433 s** (frame 43) |
| the wind-up | its fist to the floor by 0.36 s, closed on the skeleton's neck at 0.44 s; hauled up dangling by 0.78 s; swung up and out by 1.08 s; **HELD** aloft, trembling, to 1.367 s (0.29 s) |
| the strike (`HURL_STRIKE`) | **two frames**, smeared: over the top (frame 42), loosed (frame 43) |
| the wind-down | bent over after it to 1.95 s; at rest 2.5 s |
| its aim (`HURL.aim`) | where the hero stands at **1.08 s** (as it begins to hold it): the reach is marked on the floor from then |
| from (`HURL_FROM`) | its fist: 1.31 tiles before it, 0.54 to its right, 58 picture pixels up |
| its flight (`hurlFly(d)`) | **0.34 + 0.045 d seconds**: 0.45 s at 2.5 tiles, 0.57 at 5, 0.79 at 10 (the skull's: 1.1 s every time). So the mark is down 0.8 s before the burst at 2.5 tiles, 0.92 at 5, 1.14 at 10; the knight runs 4.6 tiles a second |
| its arc (`hurlArc(d)`) | rises **10 + 3.2 d** picture pixels over the straight way down (26 at 5 tiles; the skull went up 200); its middle lands 16 up as it bursts |
| its tumble (`HURL.spin`) | **1.6** times round a second, 12 frames once round (`makeHurledArt`) |
| THE BURST (`HURL.r`) | a hero within **2.25 tiles** of where it lands is struck, as it lands (`burstStrikes`) (drawn and tested 2.0 to 2.5: the main chat may set it) (the skull's: 1.1) |
| the bones (`HURL.wave`, `lie`, `long`) | the dust out to the edge in 0.2 s; the bones land within it 0.24 to 0.46 s after; they lie and crumble from 1.0 s to 1.6 s; nothing left at **1.8 s** |
| near, far | thrown at a hero from 2.5 to 10 tiles off (as the skull was) |

## ITS CLUB SWING, BY MOVEMENT 9 (its basic blow, kept)

Its old swing was held a sixth of a second (0.38 to 0.54 s) and its blow smeared for one frame; the review found it starting at its
fastest and its left arm passing into its hulk as it went round. Now: the club dragged up off the floor by 0.3 s, cocked high
behind its left shoulder by 0.5 s, **HELD**, trembling, the fire flaring, to 0.8 s; round in **two frames**, smeared (after-images
of the club's head, the enemy's pink at its edge), its blow at **0.867 s** (frame 26); on round past its right, held there bent to
1.32 s; dragged back to rest by 1.6 s. Its reach (`SWING.reach`) **2.2 tiles** in the half of the floor before it (the game's: 1.8).

## THE FRENZY (the dagger cultist's one attack, in place of his leap and plunge)

**What it is.** A short coil: he sinks into a crouch, his weight back, his chest turned away and the knife drawn back low by his
right hip, its point at you, his clawed left hand out before him, **HELD**, trembling, the light caught on the blade and his eyes
flaring gold (the warning). Then four times: his right foot comes up and on (the frame before), and in **ONE FRAME** he lunges, his
hips and then his chest coming round and the knife driven out at your middle as his foot lands a step on, smeared (after-images of
the blade and his fist along the way they came, the newest near white, the enemy's pink along it); the knife goes on a little, and
is snatched back to his hip over three frames as his left foot is drawn up after him; a moment held, and the next. After the fourth,
the deepest, he sags **WINDED**: bent over, his knife hanging from his fist, his back heaving and his cowl bobbing, a clear moment
(your opening); then he straightens and draws the knife up beside his cowl, a step and more on from where he began.

**Its numbers** (art/cultists.ts `FRENZY`, `FRENZY_HITS`, `FRENZY_STRIKES`, `frenzyTravel`):

| | |
|---|---|
| the move (`clips.attack` with the switch on) | **2.7 s**, 82 frames; its `hit` the last stab |
| the coil | crouched, the knife back, by 0.2 s; **HELD** to 0.467 s |
| the stabs (`FRENZY_HITS`) | **0.5, 0.733, 0.967, 1.2 s**: a stab every seven frames (0.233 s) |
| each strike (`FRENZY_STRIKES`) | **one frame**, smeared (and thinning on the frame after) |
| its reach (`FRENZY.reach`, `arc`) | each stab strikes a hero within **1.2 tiles** before him (90 degrees), from where his steps have taken him by then (the game's: 1.1) |
| the steps (`FRENZY.step`, `travel`, `frenzyTravel(t)`) | **0.3 tiles** with each stab, **1.2 tiles** in all; the move ends at rest where they have taken him (the game moves him there as it ends; `frenzyCame(t)` is how far his pictures have carried him at each moment, for his shadow and his place in the sort, as the film lays them) |
| winded (`FRENZY.winded`) | bent over, heaving, from **1.4 s to 2.33 s** (0.93 s; 1.13 s from his last stab); straight again by 2.7 s |
| from his run (`FRENZY.fromRun`) | the game begins it as his run's round comes to frame 0, 1, 4, 5 or 6 (not 2, 3 or 7, where his feet are furthest from his crouch: a frame or two more of the run, 0.15 s at most) |

## The switches, and bringing it in

- `GOLEM_HURL` (art/action_f4_fx.ts) and `DAGGER_FRENZY` (art/cultists.ts), both `{ on: false }`.
  - With `DAGGER_FRENZY` on, `makeDaggerCultistArt3()` (what the bestiary calls) has the frenzy as his `clips.attack`; his stand,
    run, struck and death are his own, frame for frame (tested). The leap and plunge stays in the file (`DAGGER_CULTIST.attack`).
  - The hurling golem is `HURL_GOLEM` (art/action_f4_fx.ts, a mock-up file), made as the game holds a monster by
    `makeHurlGolemArt(pace)`: the game's golem's own pictures for all it keeps (stand, walk, struck, death, slam: frame for frame,
    tested), its new swing as `clips.attack`, the hurl as `clips.moves.throw`, and the skeleton in flight as `clips.moves.hurled` (as
    the skull's are `skull`). The old skull lob stays in art/new_mobs3.ts (`GOLEM.more.throw`), out of this one's set.
- Hashes of every frame (tools/action_f4_hash.ts), on 8b4acbb and on this branch, the same: golem `c0fdfe695b6aa166`, dagger
  cultist `1cb0d0e2234ca695` (with the game's switches; and the same with the monsters' moves off).
- To bring it in (the main chat's):
  - THE GOLEM: in the bestiary, `figure === 'golem' ? (GOLEM_HURL.on ? makeHurlGolemArt(MONSTERS.golem.speed) :
    withSkulls(makeGolemArt3(...)))` (move what it needs into the game's own files as the art chat's work is brought in).
    `MONSTER_MOVES.golem`: the swing's windup `SWING_HIT` (0.867 s), its reach `SWING.reach`; the throw's windup `HURL_HIT` (1.433 s).
    At `HURL.aim` into the throw take the hero's place and mark the reach there (`burstPainted(t, 'floor', HURL.r, ...)` for `t` before
    it lands: it draws the mark); at the throw's hit, loose it from `HURL_FROM`: in flight `hurlFly(d)` seconds along `hurlAt(u, d)`,
    drawn with the `hurled` frames (`HURL.spin` times round a second) over `hurlShadowPainted(u)` (in place of the skull's zone and
    its drawing in game.ts and render.ts); as it lands, strike within `HURL.r` and lay `burstPainted(t, 'floor' | 'air', ...)` for
    `BURST_LONG`, the air by halves, `'behind'` before a figure there and `'before'` after it. Damage and cooldown are the rules' (a
    suggestion: a little more than the skull's 1.1, the burst being bigger and dodgeable; its cooldown 5 s as it was).
  - THE DAGGER CULTIST: `DAGGER_FRENZY.on` (it goes with the cult's own switch); in the rules, his attack's windup to the first
    stab, 0.5 s; strike at each of `FRENZY_HITS` a hero within `FRENZY.reach` before him (from his place plus `frenzyTravel(t)` the
    way he faces); move him `FRENZY.travel` as the move ends (and lay his shadow at his place plus `frenzyCame(t)` meanwhile); his recover is the rest of the clip (the winded moment): struck then,
    he reels as usual; begin it from his run only on its frames `FRENZY.fromRun`. Cooldown the rules' (his was 1.6 s).

## The checks

`tests/action_f4.test.ts` (5 tests, all pass):

1. the switches off; nothing of the game imports the mock-up; the dagger cultist the game's own with his switch off, and with it on
   every list the same but his attack (the frenzy); the hurling golem the game's golem in all it keeps, frame for frame, its moves
   the hurl, the slam and the skeleton in flight, no skull lob; the old lob kept in the game's golem;
2. every frame of the new moves (the swing, the hurl, the frenzy) paints, wears the enemy's pink edge, is crisp, has no cyan, nothing
   cut off, both ways round;
3. **the golem through the bosses' review** (art/boss_checks.ts `checkBoss`, on the heroes' bones; its shape in
   tests/action_f4_shapes.ts: its bundles of bone, its hulk, shoulders and skull as solids, its club and the skeleton in its fist as
   things carried), from in front and from behind, with every handing over (from its stand at every frame, from its walk at every
   step, into its swing, its hurl and struck, and back): its new moves find nothing; what it keeps finds only what the game's own
   golem's does (its stand barely breathing, its death's and slam's feet: see below); Movement 9; the skeleton in its fist only from
   its grip to its throw, held clear of the floor, and nothing of it through the golem but its neck, skull and shoulders in the fist
   that holds it (`HELD_IN`, 7 lengths of where it grips);
4. **the frenzy through the review** (its shape likewise), its four stabs each reviewed as a blow of its own (drawn back, held, one
   frame, smeared, carried through, the hips first), from his stand at every frame, from his run's frames of `FRENZY.fromRun`, and
   ending where his steps have taken him: nothing found; its numbers; winded, bent over, his knife low, his back heaving;
5. the flight and the burst: faster and lower than the skull, a bigger burst; the tumble crisp, pink-edged, no cyan, not cut off;
   its shadow growing; the mark in the enemy's pink before it lands; the burst at 2.0, 2.25 and 2.5 tiles crisp, no cyan, not cut
   off; the flash; the bones lying out to its reach; nothing left at its end.

**The review had never been run on the golem or the dagger cultist.** Of the game's own golem it finds: its stand barely breathing;
its slam starting at its fastest and its feet sliding; its death's toes sliding and in the floor; its old swing starting at its
fastest and its left arm passing into its hulk; its old skull lob starting at its fastest and its forearm in its shoulder. Of the
game's dagger cultist: his leap and plunge's feet sliding and in the floor, his hands and dagger into his legs, no follow-through;
his death's feet sliding and his knees, hand and elbow in the floor; his stand barely breathing; his run's toes a little in the
floor and sliding; and jumps of 3.5 to 3.9 game pixels from his run into his stand (and from his stand into his run). Only the
golem's swing and throw and the cultist's attack are new here; the rest are as the game has them (see "For him to decide").

Also passing: `tests/action_f1.test.ts`, `action_f2`, `action_f3`, `action_f3_chained`, `palace_hands`, `bosses`, `new_mobs3`,
`cultists`; `tsc` clean. Changed outside this floor's own files:

- art/boss_checks.ts (the bosses' review, a mock-up tool), one line: in a move of more than one blow (`blows`), a blow's strike is
  measured against its wind-up and wind-down **not counting the other blows' strikes** (the frenzy's four stabs come seven frames
  apart, so each one's ±10-frame window held the others' one-frame thrusts as if they were its wind-up). Moves of one blow are
  reviewed as before; the Chained One's combos' strikes are further apart than that, and its tests pass.
- art/cultists.ts: the frenzy added at its end, behind `DAGGER_FRENZY` (and `makeDaggerCultistArt3` reads it); in his painter, the
  dagger laid as near the eye as its blade's middle **in the frenzy only** (held out at his side it went behind his robe).
- tests/new_mobs3.test.ts: `action_f4_fx` added to its list of the mock-ups built on the new monsters, as floors 2 and 3's were.
- tests/action_f1.test.ts, test 1: the Chained One's mock-ups (art/chained_action.ts, art/chained_action_fx.ts) may import floor 1's.
  **It failed on 8b4acbb already** (for art/chained_action_fx.ts); it passes now.

Made by: `tools/action_f4_film.ts` (the film), `tools/action_f4_sheet.ts` and `tools/action_f4_captions.py` (the sheet),
`src/dev/action_f4_scene.ts` (the scenes, on floor 1's stand-in floor), `tools/action_f4_hash.ts` (the hashes).

## His word on the pictures

Shown `action_f4.mp4` and `action_f4_sheet.png`, 1 Nov 2026 (answered by 10:27 his time), and asked of each:

- The skeleton hurl (hauled up out of the floor, held high at its side, hurled fast, cartwheeling in over its shadow on a pink
  mark, bursting 2.25 tiles round; the bones lying a moment, then crumbling), offered with a bigger burst (2.5) or a change:
  “Yes, that's it (Recommended)”. So it is held at its side (not overhead), aims as the hold begins, and bursts at 2.25 tiles.
- Its club swing by Movement 9 (held longer, whipped round in two smeared frames, a little more reach): “Yes, that's it
  (Recommended)”.
- The dagger cultist's frenzy (coiled; four stabs in a blur, stepping in with each; bent over, winded, about a second):
  “Yes, that's it (Recommended)”.

All three are his yes: the main chat may bring them in (`GOLEM_HURL` and `DAGGER_FRENZY` turned on).

## For him to decide (the art chat's to ask) — asked and settled above

- The burst at 2.25 tiles (or 2.5); the flight 0.45 to 0.79 s; aimed as it holds the skeleton up (1.08 s), the mark down 0.8 to 1.1
  s before it bursts. (Aimed only as it lets go, it would be as good as unavoidable at 5 tiles: the mark would be down 0.57 s.)
- The skeleton held aloft out at its side (as drawn) rather than right back over its head: held over its head, its body hung down
  through the golem's own arm and shoulders, and from behind it was hidden.
- The frenzy's winded moment, 0.93 s (1.13 s from his last stab); its stabs a step of 0.3 tiles each, 1.2 in all.
- The swing's reach, 2.2 tiles, and its wind-up held 0.3 s (its blow now at 0.87 s, was 0.6).
- What the review finds of the game's own golem and dagger cultist (above): a later pass, under his "every enemy is going to need
  that change eventually".
