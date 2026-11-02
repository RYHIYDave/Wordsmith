# Floors 6 to 8: more action (mock-ups; branch `art/action-f6`)

An art helper's branch, from `art/action-f5` at 9c54eff (floors 1 to 5's new moves). Nothing here is in the game until the main
chat puts it there, on his yes. All five new things are **behind switches that are off**: with them off every frame the game shows
of the Firepot Thrower, the Chanter, the quarry golem, the canyon scorpion and the dust devil is the same, pixel for pixel (hashes
below).

## His words

His review of every enemy for more action, 31 Oct 2026; each offered as below and answered “Yes (Recommended)”:

- THE FIREPOT THROWER (cult, floors 6–10): “Keep it; make the burst and the fire bigger, as your area rule asks.”
- THE CHANTER (cult, floors 6–10), his pick for LIGHTNING: “The Chanter, 6–10 (Recommended)” (offered as: the Chanter's cursed bolt
  becomes chain lightning that jumps from you to anyone near you). Its ward is kept.
- THE QUARRY GOLEM (floor 6): “Boulder roll, in place of the throw: tears a boulder off the quarry wall and sends it rolling down a
  marked lane. It bounces and smashes on whatever it hits.”
- THE CANYON SCORPION (floor 8): “Acid spit, in place of the sting: arcs its venom high. It splashes down on where you stood into a
  hissing acid pool that stays several seconds.” (his ask: “something that, like, takes away space”)
- THE DUST DEVIL (floor 8): “Twister: spins up into a sand twister that wanders the floor for a few seconds, dragging you in and
  scouring you while you're in it.” and, his pick for LIGHTNING: “The Dust Devil, 8” (offered as: the twister crackles with static
  and throws lightning out of it).
- Under his rules already given: his rulebook's Monsters 9, Action, like a movie; Movement 9, 24 Oct (“Like the wind up and wind
  down are big but the actual punch is lightning quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going
  to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”). Small mobs keep one
  attack, medium two (his rule of 9 Oct): the golem keeps its hammer and the scorpion its snap, each made by Movement 9.

## The pictures (`pictures/`)

- `action_f6.mp4` (1200 × 676, 60 s, 30 fps, H.264, captioned): each new move with the knight, from in front and from behind, then its
  strike at half speed: the Firepot Thrower's lob and the Chanter's chain lightning on a stand-in for floor 6's quarry floor (the
  lightning strikes the knight and jumps to two stand-ins near him, the game's mage and ranger: the knight fights alone, so they
  stand for anyone near him); the golem's boulder roll and its hammer on the quarry; the scorpion's spit and its snap and the dust
  devil's twister on a stand-in for floor 8's canyon sand.
- `action_f6_sheet.png` (1200 wide): each move's six key moments from in front and from behind; each in its scene with the knight
  (the burst and the burning floor; the ring, the strike and the jump; the lane, the roll and the smash; the hammer's ring; the glob
  and the pool; the drag and the lightning); and EACH OLD MOVE BESIDE ITS NEW at the same scale.

## THE FIREPOT THROWER: THE LOB MADE BIG (`FIREPOT_BLAZE`, art/action_f6_cult.ts)

**What it is.** It hauls the sling up over its head and whirls the lit pot round it, faster and faster, its body wound back and away,
its left hand out for balance, and HOLDS so as the pot whirls, the fuse flaring (the warning). In TWO FRAMES its hips and chest come
round and its arm whips over the top, and the pot is slung, smeared (after-images of the pot and its fist along the way they came).
It is thrown on over after it and stays bent, then reaches back over its shoulder to its rack for another. The pot goes up HIGH, its
shadow on the floor under it and the reach of its burst marked where it will come down, filling as it comes. It bursts in a great
WHOOSH of the cult's fire (a flash, a ball of fire rolling up and out to the burst's edge, darkening to smoke, shards of clay
flung), and THE FLOOR BURNS: scorched black, a carpet of the cult's fire licking up off it, taller at its edge, embers rising, its
edge dotted with the enemy's pink; dying down over its last 0.8 s.

| | |
|---|---|
| the move (`clips.attack` with the switch on) | **2.2 s**, 67 frames; its `hit` the slinging, **1.0 s** (frame 30) |
| the wind-up | the sling up by 0.2 s; wound back by 0.55 s; **HELD**, whirling (five times a second), trembling, to 0.933 s (0.38 s) |
| the strike (`LOB_STRIKE`) | **two frames**, smeared: over the top (frame 29), slung (frame 30) |
| the wind-down | bent after it to 1.45 s; another pot in the sling by 1.9 s; at rest 2.2 s |
| from (`lobFrom()`) | the pot in the sling: 0.69 tiles before it, 0.32 to its right, 27 game pixels up |
| its flight (`blazeFly(d)`) | **0.55 + 0.06 d s**: 0.67 s at 2 tiles, 0.85 at 5, 1.03 at 8; aimed where the hero stands as it is slung |
| its arc (`blazeArc(d)`) | **46 + 5 d game pixels** over the straight way (71 at 5 tiles; the knight is about 30 tall; the old lob's 25) |
| THE BURST (`BLAZE.r`) | a hero within **1.6 tiles** is struck as it lands (the game's: 0.65); the whoosh seen 0.6 s |
| THE FIRE (`BLAZE.fire`, `burn`, `fade`) | **1.4 tiles** round (the game's: 0.42), for **5 s** (the game's: 4), dying down over its last 0.8 s |
| near, far | slung from 2 to 8 tiles (the game's: up to 7.5) |

## THE CHANTER: CHAIN LIGHTNING (`CHANTER_LIGHTNING`, art/action_f6_cult.ts)

**What it is.** It heaves its book up high over its head in both hands, its head thrown back, and HOLDS it there, trembling,
lightning crawling over the book and between its hands and down its arms, sparks spat off it, the script blazing. A RING crackles
on the floor where you stood (the cult's violet and white, sparks running round it, closing in: the warning; get out of it). In TWO
FRAMES it brings the book down at you, smeared, and THE LIGHTNING leaps from its pages to the ring: a jagged bolt, white at its
heart, the cult's violet about it, forks and flecks of the enemy's pink, crackling (a new way every frame), a flash where it
strikes. Whoever it strikes, it JUMPS from to the nearest other within 2.5 tiles, and on from that one to another. The book smokes
after. Never the friend's cyan. Its ward on the cult near it is the game's own, kept.

| | |
|---|---|
| the move (`clips.attack` with the switch on) | **1.8 s**, 55 frames; its `hit` the strike, **0.967 s** (frame 29) |
| the wind-up | the book up over its head by 0.35 s; **HELD**, crackling, to 0.9 s (0.55 s) |
| the strike (`CAST_STRIKE`) | **two frames**, smeared: brought down (frame 28), thrust at you (frame 29) |
| the wind-down | rocked over after it, smoking, to 1.35 s; at rest 1.8 s |
| its aim (`CHAIN.aim`) | where the hero stands at **0.4 s**: the ring is down **0.57 s** before it strikes (`ringPainted`) |
| THE RING (`CHAIN.r`) | a hero within **1.0 tile** of its middle as it strikes is struck (the bolt's reach: 0.4) |
| THE JUMPS (`CHAIN.jump`, `jumps`, `every`, `share`) | from whoever it strikes to the nearest other within **2.5 tiles**, **twice**, **0.1 s** apart (`chainOf`); each jumped to struck by a share of the blow (a suggestion: 0.6) |
| each bolt (`CHAIN.seen`, `layChainBolt`, `chainBoltPainted`) | crackles **0.22 s**, fading; the strike's flash and sparks 0.3 s |
| from (`castFrom()`) | its pages: 0.63 tiles before it, 16 game pixels up |
| near, far | cast at a hero from 2 to 7 tiles (the bolt's: up to 7) |

## THE QUARRY GOLEM: THE BOULDER ROLL (`GOLEM_BOULDER`, art/action_f6_golem.ts)

**What it is.** It bends and drives both fists down into the quarry's rock before it, and TEARS A BOULDER UP OUT OF IT (a great rough
lump of the quarry's own rock, knobbed and cracked, darker and warmer than its dressed blocks, never a ball), the rock cracking open
round it and rubble and chips thrown up; swings it up at arm's length, out before its chest and up over its head, and HOLDS it
there, trembling, its mark flaring (the warning: THE LANE is marked on the floor from it, through where you stood, to its end: dashed
edges and chevrons of the enemy's pink). In TWO FRAMES it bowls it down onto the floor before it, smeared, and stays bent over after
it, heaving. The boulder ROLLS down the lane, fast, turning over, hopping as it comes out of its fists and twice more, and SMASHES on
whatever it hits, or at the lane's end: a flash, its rock flung out in chunks, tumbling, lying and crumbling, the floor cracked, a
ring of dust going out with the enemy's pink at its edge.

| | |
|---|---|
| the move (`clips.moves.throw` with the switch on) | **2.7 s**, 82 frames; its `hit` the bowling, **1.6 s** (frame 48) |
| the wind-up | fists into the rock by 0.42 s; torn up by 0.5 s; swung up by 1.2 s; **HELD** overhead to 1.533 s (0.33 s) |
| the strike (`ROLL_STRIKE`) | **two frames**, smeared: over and down (frame 47), bowled (frame 48) |
| the wind-down | bent over after it to 2.15 s; at rest 2.7 s |
| its aim (`BOULDER.aim`) | where the hero stands at **0.85 s**: the lane is marked from then, **0.75 s** before it is bowled |
| THE LANE (`BOULDER.half`, `long`; `lanePainted`) | **1.5 tiles wide**, **9 tiles** long from the golem (or to a wall) |
| the boulder | **1.0 tile** across (`BOULDER_R`); bowled onto the floor **1.1 tiles** before it (`BOULDER.from`) |
| its roll (`BOULDER.pace`, `boulderGone`, `boulderHop`) | **7 tiles a second**; hops of 18, 9 and 4 game pixels, landing 0.4, 2.6 and 4.6 tiles on; once round in 0.46 s (`ROLL_ROUND`, `moves.rolling`, 12 frames) |
| struck (`boulderStrikes`) | a hero in the lane as it comes by is struck, and it SMASHES on him |
| THE SMASH (`BOULDER.r`, `smashPainted`) | a hero within **1.5 tiles** is struck and knocked back; its rock lies and is gone by 1.6 s |
| near, far | bowled at a hero from 2.5 to 8 tiles (the old chunk's: 2.6 to 8) |

**ITS HAMMER, BY MOVEMENT 9** (its basic blow, kept): both fists raised over its head by 0.45 s, **HELD**, trembling, leaning back,
its mark flaring, to 0.9 s; down in **two frames**, smeared (frames 28 and 29), on the floor at **0.967 s** (was 0.95, its
wind-up then hardly held and its blow four frames); crouched over its fists, heaving, to 1.45 s; at rest 2.0 s. Its fists strike
**1.3 tiles** before it (`HAMMER.at`); a hero within **1.5 tiles** of there (`HAMMER.r`; the game's: 0.8) is struck and knocked
back; the floor cracks and a ring of dust goes out (`smashPainted(t, layer, HAMMER.r, true)`), its reach marked as it holds its
fists up.

## THE CANYON SCORPION: THE ACID SPIT (`SCORPION_SPIT`, art/action_f6_canyon.ts)

**What it is.** It crouches and cocks its tail up high, its pincers raised and open, and HOLDS it, the tail rattling, the venom
welling out of its sting, a bead of it at the barb and drops falling to the rock (acid green-yellow). In TWO FRAMES its tail flings
over its head and the venom is spat, smeared; the tail goes on down before it and it settles. The glob goes up HIGH (a quivering
ball of the acid, the enemy's edge round it) over its growing shadow and comes down where you stood, the reach of its splash marked
in the enemy's pink; it SPLASHES (a crown of acid thrown up and out) and spreads into A POOL OF ACID: lobed, eating at the rock, dark
at its rim and green-yellow in it, bubbles rising and popping, fumes curling up off it, the enemy's pink dotted round its edge;
shrinking over its last 0.8 s. Floor taken away. Never cyan.

| | |
|---|---|
| the move (`clips.moves.spit` with the switch on, in place of `sting`) | **1.6 s**, 49 frames; its `hit` the spit, **0.867 s** (frame 26) |
| the wind-up | cocked by 0.3 s; **HELD**, dripping, to 0.8 s (0.5 s) |
| the strike (`SPIT_STRIKE`) | **two frames**, smeared: flung over (frame 25), spat (frame 26) |
| the wind-down | its tail on down to 1.15 s; on its stand by 1.6 s |
| its flight (`spitFly(d)`, `globAt`, `moves.glob`) | **0.45 + 0.07 d s** (0.56 s at 1.5 tiles, 0.66 at 3, 0.87 at 6); aimed where the hero stands as it spits; from its sting, 0.54 tiles before it, 12 game pixels up |
| its arc (`spitArc(d)`) | **40 + 6 d game pixels** (58 at 3 tiles) |
| THE SPLASH (`SPIT.splash`) | a hero within **1.2 tiles** as it lands is struck |
| THE POOL (`SPIT.pool`, `stays`, `fade`; `poolPainted`) | **1.4 tiles** round, for **4.5 s**, shrinking over its last 0.8 s; a hero in it burned by the acid tick by tick (the rules') |
| near, far | spat from 1.5 to 6 tiles (the tail strike's: 1.3 to 2.6) |

**ITS SNAP, BY MOVEMENT 9** (its basic blow, kept): reared, pincers spread wide and back by 0.25 s, **HELD**, trembling, to 0.5 s;
shut in **two frames** as it lunges, smeared (frames 16 and 17, its blow at **0.567 s**; was 0.3, its wind-up held 0.06 s);
squeezing on to 0.75 s; on its stand by 1.0 s. Its reach (`SNAP9.fwd`, `half`): a strip **0.2 to 2.0 tiles** before it, **0.8**
to either side (the game's: 0.2 to 1.7, 0.55). The game's scorpion's darting is kept.

## THE DUST DEVIL: THE TWISTER (`DEVIL_TWISTER`, art/action_f6_canyon.ts)

**What it is.** It spins faster and faster, squatting and fattening, sand sucked in off the floor round it in a closing ring, and
HOLDS, trembling, static crackling over it (the warning). In TWO FRAMES it bursts up into A SAND TWISTER (streaks of sand up the way
it went), taller than the knight, its sand wound in more and thicker bands, its bell burning in its heart, its top swaying wide,
lightning crawling up it. For 3.5 s it spins on the floor (the game carries it as it wanders at you); the sand swirling in over the
floor round it shows how far it DRAGS you, and it THROWS LIGHTNING out of it onto the floor round it, each place crackling a moment
first (violet and white), then struck (a bolt from it to there, a flash, sparks). Then it collapses, its sand pouring out of it,
back into the little dust devil, which spins on.

| | |
|---|---|
| the move (`clips.attack` with the switch on) | **5.2 s**, 157 frames (one clip); its `hit` the burst up, **0.867 s** (frame 26) |
| the wind-up | spinning up by 0.5 s; **HELD**, crackling, to 0.8 s (0.3 s) |
| the strike (`TW_STRIKE`) | **two frames**, smeared: bursting up (frame 25), the twister (frame 26) |
| the twister | from 0.867 s to **4.4 s** (3.5 s): **108 tall** (the knight 58; the dust devil 32), `TW_CANVAS` 260 × 230 |
| the wind-down | collapsing, 4.4 to 5.0 s; on its stand by 5.2 s |
| its wander (`TW.pace`) | the game carries it at **1.4 tiles a second** toward the hero (he runs 4.6) |
| THE DRAG (`TW.pull`, `drag`; `swirlPainted`) | a hero within **2.6 tiles** of its foot is dragged toward it at **1.6 tiles a second** |
| THE SCOUR (`TW.r`, `tick`) | a hero within **0.8 tiles** of its foot is scoured every **0.3 s** |
| ITS LIGHTNING (`TW_BOLTS`, `TW.every`, `out`, `warn`, `bolt`; `layTwisterBolts`) | a bolt every **0.45 s** through the twister (seven), each **1.2 to 2.2 tiles** from its foot, crackling there **0.3 s** first; a hero within **0.6 tiles** as it strikes is struck (the film's pattern; the game's to turn them at the hero) |
| its reach before (the lash's) | 1.28 tiles |

## The switches, and bringing it in

- `FIREPOT_BLAZE`, `CHANTER_LIGHTNING` (art/action_f6_cult.ts), `GOLEM_BOULDER` (art/action_f6_golem.ts), `SCORPION_SPIT`,
  `DEVIL_TWISTER` (art/action_f6_canyon.ts), all `{ on: false }`. The makers: `makeBlazeThrowerArt`, `makeLightningChanterArt`,
  `makeBoulderGolemArt`, `makeSpitScorpionArt`, `makeTwisterDevilArt`: each the game's own figure's pictures (from its own maker)
  with only its new moves put in (tested frame for frame). The old moves stay in their own files, out of the new sets.
- Hashes of every frame the game shows of the five (tools/action_f6_hash.ts, through art/act1_figs/), on 9c54eff and on this
  branch, the same: firepot `3e929f4d0c7ea056`, chanter `ad617cb4114228b9`, qgolem `0f4c1703d6945977`, scorpion
  `2cc541277cc10f8f`, devil `48654659352a42ac` (tested).
- To bring it in (the main chat's; the files are mock-ups: move what each needs into the game's own as the art chat's work is
  brought in):
  - THE FIREPOT THROWER: art/act1_figs/firepot.ts `make: FIREPOT_BLAZE.on ? makeBlazeThrowerArt : makeFirepotThrowerArt3`; in
    game/act1_rules/firepot.ts its act's `long` 2.2, `hit` `LOB_HIT`, `far` 8; the pot from `lobFrom()`, `fly0`/`flyPer` 0.55/0.06,
    `arc0`/`arcPer` 46/5; `burst.r` 1.6, `burst.long` 0.6; `fire.r` 1.4, `burn` 5, `fade` 0.8; drawn by `makeFlyingPotArt`,
    `potShadowPainted(u)` under it, the burst's reach marked as it comes, and `blazePainted(t, 'floor' | 'air', side)` (in place
    of `firepotFire`; the air by halves, `'behind'` before a figure there and `'before'` after).
  - THE CHANTER: art/act1_figs/chanter.ts as above with `makeLightningChanterArt`; in game/act1_rules/chanter.ts its act's `long`
    1.8, `hit` `CAST_HIT`; at `CHAIN.aim` take the hero's place and lay `ringPainted(t)` there; at the hit strike within
    `CHAIN.r` and lay `chainBoltPainted` from `castFrom()` to it; then `chainOf` (whoever is near: his companions, the ranger's
    animals) every `CHAIN.every`, each struck by `CHAIN.share`. The ward (`CHANTER.ward`) is unchanged.
  - THE QUARRY GOLEM: art/act1_figs/qgolem.ts `make: GOLEM_BOULDER.on ? makeBoulderGolemArt(QG_PACE) : ...`; in
    game/act1_rules/qgolem.ts the hammer's `hit` `HAMMER_HIT`, `long` 2.0, `at` 1.3, `r` 1.5, knock `HAMMER.knock`; the throw's
    `long` 2.7, `hit` `ROLL_HIT`: at `BOULDER.aim` take the hero's place, lay `lanePainted` along the way to it; at the hit loose
    the boulder from `BOULDER.from` down the lane at `BOULDER.pace` (drawn with `moves.rolling`, lifted `boulderHop`), strike and
    smash on a hero it meets (`boulderStrikes`) or at a wall or the lane's end, `smashPainted` there, `smashStrikes` within
    `BOULDER.r`. Its old chunk (`chunkShatter`, render/act1_fx/qgolem.ts) is not used by it.
  - THE CANYON SCORPION: art/act1_figs/scorpion.ts `make: SCORPION_SPIT.on ? makeSpitScorpionArt : makeScorpionArt`; in
    game/act1_rules/scorpion.ts the snap's `long` 1.0, `hit` `SNAP_HIT`, strip `SNAP9.fwd`/`half`; the sting's act becomes the
    spit, clip `spit`, `long` 1.6, `hit` `SPIT_HIT`, `near`/`far` 1.5/6: the glob aimed where the hero stands then, from
    `spitFrom()`, `spitFly`, `globAt`, drawn with `moves.glob` over `globShadowPainted`, `poolPainted(t, ...)` marked before it
    lands; struck within `SPIT.splash` as it lands; the pool a peril `SPIT.pool` round for `SPIT.stays` (as the firepot's floor
    burns: tick by tick; the poison may be kept). Its darting back to range is kept.
  - THE DUST DEVIL: art/act1_figs/devil.ts `make: DEVIL_TWISTER.on ? makeTwisterDevilArt : makeDevilArt`; in game/act1_rules/devil.ts
    its act's `long` 5.2, `hit` `TW_HIT`; from the hit to `TW.until` carry it at `TW.pace` toward the hero, drag him within
    `TW.pull` at `TW.drag`, scour within `TW.r` every `TW.tick`; lay `swirlPainted(t)` under it; its bolts at `TW_BOLTS`' times
    (turned toward the hero), each struck within `TW.bolt`, drawn by `layTwisterBolts`. Its scatter after is kept. Damage and
    cooldowns are the rules'.

## The checks

`tests/action_f6.test.ts` (5 tests, all pass):

1. the switches off; nothing of the game imports the mock-ups; the game's frames of the five hash as on 9c54eff; with the new art,
   every list the game's own but the new moves; the spit in place of the sting, the roll in place of the chunk;
2. every frame of every new move paints, wears the enemy's pink edge, is crisp, has no cyan, both ways round; nothing cut off on
   the cult's two's and the golem's own canvases;
3. **the Firepot Thrower, the Chanter and the golem through the bosses' review** (art/boss_checks.ts `checkBoss`, on the heroes'
   bones; their shapes in tests/action_f6_shapes.ts, the game's own with their strikes, smears and the boulder they carry), from
   in front and from behind, from every frame of their stand and back: **nothing found**; Movement 9 (two-frame strikes, held 0.3 s
   and more, big wind-downs); the boulder in its fists only from its tearing up to its bowling, held up over its head, never through
   it (only its fists and forearms may touch it);
4. **the scorpion and the dust devil through the review for the old rigs** (art/action_f1_checks.ts `checkKit`, their own solids not
   being on the heroes' bones: SLIDE, FLOOR, JERK, JUMP, BLOW, HIPS, STRIKE; the scorpion with each pair of its eight feet as its
   soles), from in front and from behind: **nothing found**; the twister's wind-up held (its height still 0.3 s), 108 tall, and
   the dust devil again at its end. (The twister has no end it strikes with that is drawn back as a blow is: it bursts up out of
   its spin; so its STRIKE is reviewed and not BLOW and HIPS, and its held wind-up is asked here.)
5. what they send and leave (the burst and the fire, the pot and its shadow, the ring, the bolts, the smash and the hammer's ring,
   the rolling boulder, the lane, the glob and its shadow, the pool, the swirl): crisp, no cyan, not cut off; and the numbers above
   (bigger than the game's own, from its rules' own files).

Also passing: the five figures' own tests (`canyon_scorpions`, `dust_devils`, `act1_cultists`, `floor6_mobs`, `act1_firepot`,
`act1_chanter`, `act1_qgolem`, `act1_scorpion`, `act1_devil`), `bosses`, `new_mobs3`, `palace_hands`; `tsc` clean. Two of the models'
tests fail on 9c54eff already and fail the same here, for files this branch does not touch: `tests/princess.test.ts` 1 (it finds
game/act1_rules/rshadow.ts and render/act1_fx/rshadow.ts importing her) and `tests/action_f1.test.ts` 1 (it finds
art/amalgam_action_fx.ts importing floor 1's mock-up). Changed outside this branch's own files:

- art/canyon_scorpions.ts, art/dust_devils.ts, art/act1_cultists.ts, art/floor6_mobs.ts: only `export` added to a few names (their
  poses and painters, for the mock-ups to build on): no frame of theirs changes (the hashes).
- tests/canyon_scorpions.test.ts, tests/dust_devils.test.ts, tests/act1_cultists.test.ts, tests/floor6_mobs.test.ts: their check that
  nothing else imports them lets through art/action_f6_*.ts (mock-ups nothing of the game imports: tests/action_f6.test.ts 1);
  tests/new_mobs3.test.ts: the four added to its list of the mock-ups built on the new monsters, as floors 2 to 5's were.

Made by: `tools/action_f6_film.ts` (the film), `tools/action_f6_sheet.ts` and `tools/action_f6_captions.py` (the sheet),
`src/dev/action_f6_scene.ts` (the scenes, on stand-ins for floors 6 and 8's grounds in their own colours), `tools/action_f6_hash.ts`
(the hashes), `tools/action_f6_peek.ts` (strips of frames, while drawing).

## For him to decide (the art chat's to ask)

- THE BOULDER is torn up out of the quarry's rock at the golem's feet, not off the quarry WALL (his words): a golem fights out on the
  floor more often than by a wall. Off the wall when it stands by one is the main chat's to add, if he wants it so.
- The chain lightning's ring (1.0 tile, down 0.57 s before it strikes) and its jumps (2.5 tiles, twice): the knight fights alone,
  so near him there is only the ranger's animal; whether it may also jump to other monsters near him (hurting them) is his call.
- The firepot's burst 1.6 tiles and its fire 1.4 for 5 s; the boulder's lane 1.5 wide and 9 long at 7 tiles a second; the acid
  pool 1.4 for 4.5 s; the twister 3.5 s, dragging from 2.6 tiles.
- The dust devil's twister is its one attack in place of its lash (his rule for small mobs); a quick lash kept between twisters
  would be a second attack.

## 2 Nov 2026: THE CHANTER'S LIGHTNING JUMPS ONLY TO OTHER PLAYERS (branch `art/action-fixes`)

**Where this and the text above differ, this holds.** The rest of the Chanter (the wind-up, the ring, the strike, its numbers) as
approved; the firepot thrower, the golem, the scorpion and the dust devil as they were.

His words, 2 Nov 2026, going through the night's films with the art chat. Asked whom the chain lightning may jump to: “I don’t really
want the rangers animals to have HP bars so it doesn’t really matter to jump to them”. Asked whether it should jump on to monsters near
you and hurt them, his pick: “No jumps” (offered as: it just strikes you, one bolt with a crackle round you). Then, at 07:56: “If we
have multiplayer, the lightningwould jump to other players”.

So: THE BOLT JUMPS ONLY TO OTHER HEROES (players) near the one it strikes, never to companions (the ranger's animals) or to monsters.
With one hero (as the game is now): ONE BOLT down onto him (its ring marked first, as before) and A CRACKLE OF STATIC round him a moment:
little jagged arcs crawling over him and jumping off him into the air, a new place every frame (white at their heart, the cult's
violet beside, flecks of its pink), sparks running round his feet on the floor and spitting off him, the cult's violet light on him,
strong at first and dying away. With another player within reach, the jump is drawn as before, on to them (the film shows it once,
with a second knight, captioned "with another player"), and they crackle too.

| | |
|---|---|
| THE JUMPS (`CHAIN.jump`, `jumps`, `every`, `share`; `chainOf(heroes, first)`) | to the nearest OTHER HERO within **2.5 tiles**, at most **twice**, **0.1 s** apart; never a companion or a monster: the rules pass `chainOf` the heroes only. Alone: `[first]`, no jump |
| THE CRACKLE (`CHAIN.crackle`, `staticPainted(t, seed)`, `STATIC_CANVAS`) | round each hero it strikes, from the moment the bolt reaches him, **0.8 s**, strong at first and dying away; a picture of its own, **96 × 112**, its anchor **(48, 94)** at his feet, laid OVER him (a knight's height) |
| the rest | as approved: the ring 1.0 tile, down 0.57 s before; the strike in two frames; each bolt crackling 0.22 s |

**Bringing it in** (the main chat's), in place of the line above about the jumps: in game/act1_rules/chanter.ts at the hit, strike the
hero within `CHAIN.r` of the ring and lay `chainBoltPainted` from `castFrom()` to him and `staticPainted(t)` over him (`STATIC_CANVAS`,
anchored at his feet) for `CHAIN.crackle`; then `chainOf(heroes, i)` over THE HEROES ONLY (the players: in a game alone, just him), each
jumped to `CHAIN.every` later, struck by `CHAIN.share`, a bolt between them and the crackle on them. Nothing jumps to companions or
monsters.

The checks (`tests/action_f6.test.ts`, 5 tests, passing): test 5 adds every frame of the crackle (both seeds, 1/30 s apart, to
`CHAIN.crackle`): painted, crisp, no cyan, not cut off; gone after; and the jumps: alone, or the other player out of reach, one bolt and
no jump (`chainOf([[0, 0]], 0)` is `[0]`). The game's own frames hash as before (test 1). The scene (src/dev/action_f6_scene.ts
`chainScene(view, t, base, cx, cy, others)`) is the knight alone, or with one other player (a second knight); the stand-ins (the mage
and the ranger) are gone from it.

Pictures: docs/mockups/action_fixes/pictures/action_fixes3.mp4 and action_fixes3_sheet.png.
