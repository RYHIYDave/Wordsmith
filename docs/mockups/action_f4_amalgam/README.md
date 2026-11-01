# The Ossuary Amalgamation: every move done the action way (mock-up; branch `art/action-f4`)

An art helper's work on `art/action-f4` (from 9358b65: the game's `high-city` with floors 1 to 4's mobs' new moves and the Chained
One's). Nothing here is in the game until the main chat puts it there, on his yes. All of it is **behind one switch that is off**,
`AMALGAM_ACTION = { on: false }` (art/amalgam_action.ts): with it off every frame the game shows of the Amalgamation, and of what it
sends out, is the same, pixel for pixel (hashes below). Its old moves are kept as they are (art/bosses3.ts), the skull swarm too.

## His words

- His review of every enemy for more action, 31 Oct 2026, offered "Bone rain, in place of the skull fan: the ossuary's niches shed
  skulls over the whole floor, shadows first, leaving bone piles that slow you": “Let’s make the change plus add the action to all
  his moves cause he is not intimidating at all”.
- Told it would get every move redone the action way (a huge held wind-up, a lightning-fast blow, bigger areas, a combo finisher
  where it fits): “Just draw it”.
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger
  AOE to compensate for the extra time the player gets to evade”); and Monsters 9, Action, like a movie (his yes, 1 Nov).

## The pictures (`pictures/`)

- `amalgam_action.mp4` (1200 × 676, 48.6 s, captioned): each move in its ossuary with the knight for size (twice the game's pixels):
  the swipe combo from in front and from behind; the bone rain close, from in front; THE BONE RAIN OVER THE WHOLE FLOOR FROM ABOVE
  (the arena whole, a stand-in wall of niches round its back, the Amalgamation seen from behind, the knight dodging: the shadows, the
  three waves, the bursts, the piles); the floor arms from in front and from behind; the devour from in front and from behind. Then
  each of its seven strikes at half speed. The floor shakes as its weight lands (a few pixels, as the game's own shake).
- `amalgam_action_sheet.png` (1200 wide): five key moments of each move from in front and from behind, with the knight; ITS OLD
  SWIPE BESIDE THE NEW; the bone rain over the whole floor at three moments.

## It looms (his “not intimidating at all”)

Before each big move it **REARS UP TO ITS FULL HEIGHT ON ITS ARMS**: its hind hands drawn in under it and gripping, the heap heaved
up off the floor (14 of its lengths), tipped back (22 degrees) and SWELLING (three tenths bigger), what was its underside seen and no
less the dead's (bones and skulls packed in it, the dead's arms hanging from it, swaying); its four foremost arms raised, claws
spread (the right front one reaching out over you, the left up and wide); its maw gaping wider than it ever opens lying down; the
fire in its cracks flaring; every skull's eyes burning. **Its heap stands 95 of its lengths high** (one is a picture pixel: lying,
47; the game's own rear, 65), about twice its height and well over the knight. It HOLDS there, trembling. Then it comes down **in two
frames** and lands with a weight that **shakes the floor**: sparks and dust where its hands strike, a ring of cracks out over the
floor (the Chained One's ring, art/chained_action_fx.ts, at its sizes), squashed flat, shuddering, and only then up.

The rear is art/bosses3.ts `amFrameReared`, from two of its bones' fields no move of the game's sets (`faceUp`, how high; `faceTilt`,
how far tipped; it has no head for them to turn): tested 0 in every frame of the game's moves.

## The moves (seconds, and frames at 30 a second; tiles from its middle as the move began)

Every blow: a big wind-up HELD (the warning); its body leans in or turns a frame or two before it; the strike in **two frames**,
smeared with after-images of its claws along the way they came (`amSmeared`: on the strike's frames and the one after); a big
wind-down.

### THE SWIPE, a combo (`attack`; old: one arm, its blow at 0.82 s, reach 2.45)

Its right front arm drawn up and back, high at its right, claws spread, the heap twisted away and rising: HELD; it turns; RAKED in
two frames across the floor before it, low, to its middle. Its left the same, the other way. Then THE FINISHER: it rears up to its
full height, both great arms raised: HELD the longest; all four foremost arms slammed down together in two frames, the heap crashing
down behind them: A RING of cracks out over the floor before it.

| | |
|---|---|
| the move | **4.0 s** (frames 0–120) |
| the right | drawn back by 0.333 s (f10), HELD to 0.667 (f20), it turns f20–f22; **strike f22–f24**, its blow **0.8 s** (`SWIPE_HITS[0]`) |
| the left | drawn back by 1.267 s (f38), HELD to 1.6 (f48), it turns f48–f50; **strike f50–f52**, its blow **1.733 s** |
| the finisher | rearing from 1.933 s (f58), reared by 2.4 (f72), HELD to 2.867 (f86), it leans in f86–f88; **strike f88–f90**, its blow **3.0 s**; squashed by 3.233 (f97), shuddering to 3.5, up by 4.0 |
| the rakes' reach | the claws' hands sweep out to **1.87 tiles** (the right, across its right and front) and **1.94** (the left) from its middle, the claws a fifth of a tile beyond |
| the finisher's ring (`SLAM_RING.finisher`) | **2.6 tiles** round a point **1.71 tiles** before it (where its hands come down, 0.6 to either side): reaching 4.3 tiles out |

### THE BONE RAIN (`rain`, in place of the skull swarm, which stays in art/bosses3.ts out of this one's set)

It rears up to its full height and ROARS, its maw at its widest, every skull on it burning: HELD; leans in; ALL FOUR ARMS SLAMMED
DOWN in two frames; it presses there shuddering while the ossuary shakes and its walls' niches SHED THEIR SKULLS over the whole floor
(art/amalgam_action_fx.ts `RAIN`, `rainDrops`): each skull thrown out of its niche high over the floor and coming down steep, rolling
over and over, its eyes burning pink, a streak of dust and fire behind it. ITS SHADOW IS ON THE FLOOR FIRST, from when it leaves its
niche, small and faint and growing and darkening as it comes, the reach of its burst ringed round it in the enemy's pink dashes,
filling in. It BURSTS where it lands (a flash, bits of skull and teeth flung up, a band of bone dust out to its reach, the enemy's
pink at its edge) and leaves A PILE OF ITS BONES lying there, a drift of bone dust round it as far as it slows you; then it crumbles
away.

| | |
|---|---|
| the move | **3.0 s** (frames 0–90) |
| the rear and roar | reared by 0.667 s (f20), HELD roaring to 1.333 (f40), leans in f40–f42; **strike f42–f44**, the slam **1.467 s** (`RAIN_HIT`); pressed, shuddering, to 2.267 (f68); up by 3.0 |
| the waves | three, every third point of a lattice of triangles **2.1 tiles** apart laid over the whole floor (`RAIN.spacing`): so a wave's skulls are 3.6 tiles apart, with gaps between them, and **where the wave before burst, nothing more comes down** (step into the last burst) |
| when (seconds after the slam) | each wave's skulls leave their niches **0.15, 0.75 and 1.35 s** after it (each up to 0.12 s later: a ripple), and **land 1.0 s later** (`RAIN.fly`): **1.15–1.27, 1.75–1.87, 2.35–2.47 s**. Its shadow is on the floor that whole second |
| the burst (`RAIN.r`) | a hero within **0.9 tiles** of where it lands is struck as it bursts (`rainStrikes`) |
| the pile (`RAIN.pile`) | **0.75 tiles** round; lies **6 s**, crumbles over 0.6; a hero in it goes at **55%** of his pace (`pileSlows`) |
| where | none within 0.9 tiles of the wall (`edge`) nor 1.8 of it (`clear`); on the arena of the pictures (8.5 by 10 tiles), **58 skulls** (18, 20, 20) |
| the ring (`SLAM_RING.rain`) | its weight landing: 3.2 tiles round a point 1.71 before it (the floor shaking: what strikes is the skulls) |

### THE FLOOR ARMS (`floorArms`; old: reared 0.45–0.76, slam 1.0; five arms, 0.62 round, 1.2–2.8 tiles off, warned 0.5 s)

It rears up higher and HOLDS longer, trembling; leans in; slammed down flat in two frames, the floor cracking out round it; it
presses there on its hands, shuddering, while the arms of the dead burst up under you and round you (art/amalgam_action_fx.ts
`bigArmsPainted`: **four arms to a hole, half as big again**, clawing, swaying, sinking back as the game's do).

| | |
|---|---|
| the move | **2.8 s** (frames 0–84) |
| the rear | reared by 0.6 s (f18), HELD to 1.2 (f36), leans in f36–f38; **strike f38–f40**, the slam **1.333 s** (`ARMS_HIT`); pressed, shuddering, to 2.067 (f62); up by 2.8 |
| the arms (`ARMS`) | **8 holes**: the first under the hero, the others round where he stood **1.4 to 3.2 tiles** off (in the pictures a gap left the way away from it: the way out, if he is quick); each bursting up **0.5 to 1.1 s** after the slam, its crack glowing **0.6 s** before (the game's `drawArmCrack`); a hero within **0.9 tiles** of one as it comes up (0.12 s on) is struck; up 1.3 s |
| the ring (`SLAM_RING.arms`) | 2.8 tiles round a point 1.71 before it |

### DEVOUR (`devour`; old: maw opening 0.05–0.9, raked in 0.92–1.56, the snap 1.6; cone 3.6 tiles, 1.7 wide, dragged at 3.1 a second)

It rears, its maw gaping wide, its front arms flung out wide to its sides: HELD (the cone marked on the floor); it leans in; THE
RAKE, in two frames: the heap thrown forward over its arms and both claws driven into the floor at the end of their reach; THE DRAG:
it hauls itself back on them, raking them in along the floor (gouges, the game's `drawClawRake`), all that lies there torn up and
dragged in to its maw, and you with it; the maw held wide, waiting; THE BITE, snapped shut in two frames, its brow thrown down on
you; the gulp, swelling, its skulls burning bright.

| | |
|---|---|
| the move | **3.2 s** (frames 0–96) |
| the rear | reared, gaping, arms wide by 0.6 s (f18), HELD to 1.133 (f34), leans in f34–f36 |
| THE RAKE | **strike f36–f38**, its blow **1.267 s** (`DEVOUR_HITS[0]`): its claws in the floor **2.04 and 2.09 tiles** before it, 0.9 and 1.0 to either side; the heap lunged on 0.6 tiles |
| THE DRAG (`DRAG`) | **1.267 to 1.933 s**: raked in to 1.45 tiles before it; the maw held wide to 2.133 |
| THE BITE | **strike f64–f66**, its blow **2.2 s** (`DEVOUR_HITS[1]`); the gulp to 2.6; up by 3.2 |
| the cone (the pictures', `CONE` in dev/action_f4_amalgam_scene.ts) | **4.2 tiles** long, from 1.0 out, **2.0 to either side** at its end; dragged at **3.6 tiles a second** from the rake to the bite (0.93 s: 3.4 tiles); the bite as the game's, 1.3 round its maw |

### Its crawl

Kept at **0.8 tiles a second** (the game's own walk, frame for frame). It no longer plods in its fights (it rears, lunges, slams),
but it may read slow between them: see "For him to decide".

## The switch, and bringing it in

- `AMALGAM_ACTION` (art/amalgam_action.ts), `{ on: false }`. Nothing of the game imports the file. `amalgamActionMob()` is the
  Amalgamation with these moves: its stand, crawl, setting off and stopping, struck, death and a beast bursting out of it are the
  game's own (the very same moves); its `attack`, `rain`, `floorArms` and `devour` these; no `swarm`. `makeAmalgamActionArt(pace)`
  holds it as the game holds a monster (a canvas of its own, 460 × 370, for it reared, its rake and the sparks of its slams).
- Hashes of every frame the game shows of it and of what it sends out (tools/action_f4_amalgam_hash.ts), on 9358b65 and on this
  branch, the same: **amalgam `10c790b90047d8ec`, what it sends out `e70f6e48ff516687`**.
- Changed outside these files (no frame of the game's changes; hashes above):
  - art/bosses3.ts: its heap may be REARED (`amFrameReared`, from `faceUp` and `faceTilt`, 0 in all the game's moves: the old path
    untouched when they are 0): lifted, tipped and swelling; its lumps then each turned with it (`ax`), its maw and the crowd of
    skulls over it tipped with its brow and its maw wider, its underside dressed with bones, skulls and the dead's hanging arms;
    the checks' solids turned with it (`AM_SHAPE.body`). `AM_KIT`: what these moves are built on said again by name.
  - tests/bosses.test.ts and tests/new_mobs3.test.ts: `amalgam_action` added to their lists of mock-ups (as the Chained One's);
    tests/action_f3_chained.test.ts: its import check skips art/amalgam_action*.ts (the slams' rings are the Chained One's ring,
    drawn by art/chained_action_fx.ts: a mock-up importing a mock-up).
- To bring it in (the main chat's):
  - THE BESTIARY: `figure === 'amalgam'` → `AMALGAM_ACTION.on ? makeAmalgamActionArt(MONSTERS.amalgam.speed) : makeAmalgamArt3(...)`.
  - THE RULES (`ACTS.amalgam`, `AMALGAM`), a suggestion (damage and cooldowns the rules' own; as now unless said):
    - `swipe`: long 4.0, its blows at `SWIPE_HITS` (0.8, 1.733, 3.0). The two rakes: a hero within 2.7 tiles in the half before it
      (the right's from its right round to its middle, the left's from its left; the game's was 2.45). The finisher: within
      `SLAM_RING.finisher` (2.6) of the point 1.71 before it, as the ring goes out (`ringReach`); mark it from 1.933 s (its rear):
      a second's warning.
    - `rain` (in place of `swarm`, its cooldown 7 s or more): long 3.0, the slam at `RAIN_HIT` (1.467); the skulls by
      `rainDrops(arena, its place)` (tiles from the arena's middle): at `RAIN_HIT + leave` lay each one's shadow (`dropPainted(t,
      'floor', seed)` for `t` from -1 to 0: shadow and mark) and fly it from its niche (`dropAt(d, u)`, its picture
      `makeRainSkullArt`); at `RAIN_HIT + land` it bursts: strike within `RAIN.r`, and the pile lies `RAIN.pile.lie` s, slowing
      (`pileSlows`) to `RAIN.pile.slow`; `dropPainted(t, 'floor' | 'air', ...)` after, the air by halves.
    - `floorArms`: long 2.8, the slam at `ARMS_HIT` (1.333); `ARMS` in place of `AMALGAM.arms` (n 8, near 1.4, far 3.2, first 0.5,
      last 1.1, warn 0.6, r 0.9), the arms' picture `makeBigArmArt` (`BIG_ARM_CANVAS`).
    - `devour`: long 3.2, its rake at 1.267 (`DEVOUR_HITS[0]`): from then to the bite at 2.2 (`DEVOUR_HITS[1]`), drag what is in
      the cone (4.2 tiles, 2.0 to either side) at 3.6 tiles a second; the bite as now (1.3 round its maw); mark the cone from
      0.5 s.
    - THE FLOOR (render/bossfx.ts): at each slam (`SWIPE_HITS[2]`, `RAIN_HIT`, `ARMS_HIT`) a ring, `slamRingPainted(t, layer,
      radius)` on `slamRingCanvas(radius)` anchored `SLAM_RING.ahead` before it; and the game's shake (5 at the slams, 1 at the
      rakes).

## The checks

`tests/action_f4_amalgam.test.ts` (5 tests):

1. the switch off; nothing of the game imports the mock-up; its stand, crawl, struck, death, setting off, stopping and bursting are
   the game's own; the game's own moves kept (the skull swarm too); none of the game's moves rears it;
2. every frame of the four new moves, from in front and from behind, on its whole canvas: painted, the enemy's pink edge, crisp, no
   cyan, **nothing cut off**;
3. **THE WHOLE BOSSES' REVIEW** (art/boss_checks.ts `checkBoss`: SLIDE, FLOOR, ARM, THROUGH, JERK, JUMP, BLOW, HIPS, ALIVE,
   STRIKE), **every frame of every move of it, from in front and from behind**, each blow of each combo its own (the swipe's three,
   the devour's two, through the optional `blows`), with every handing over (from its stand at every frame into each move and back;
   into its crawl and out of it): **nothing found**;
4. Movement 9: each of the seven blows held before it and struck in two frames (four times faster and more), smeared on its frames
   and only then, landing on its last; reared to near twice its height before the swipe's finisher, the rain and the arms (its
   heap 95 high, at rest 47), and for the devour; the rakes out near two tiles; the finisher reaching past the old swipe by more
   than a tile and a half; more arms, bigger, further, warned longer; the devour's claws two tiles out;
5. the floor: the bone rain over the whole floor (three waves, every third point, room between a wave's skulls, none on it nor past
   the wall, the whole floor reached, their times; each out of a niche high and down on its spot), the falling skull, its shadow
   growing and its reach ringed in pink before it lands, the burst, the pile lying and gone after; the bigger arms; the slam's
   rings: crisp, no cyan, nothing cut off, nothing after.

All 5 pass (about 80 s). Also passing: `tests/floor4.test.ts` (20), `tests/bosses.test.ts` (14), `tests/new_mobs3.test.ts` (8),
`tests/action_f3_chained.test.ts` (5), `tests/action_f4.test.ts` (5); `tsc` clean. Failing as on 9358b65, the same way, none of
them this branch's: `tests/first5_bosses.test.ts` test 10 (“the rshadow: 10 to either side; the picture reaches 8”),
`tests/princess.test.ts` test 1 (game/act1_rules/rshadow.ts and render/act1_fx/rshadow.ts import her) and
`tests/monster_attacks.test.ts` test 2 (“rshadow, medium: 8 attacks”).

Made by: `tools/action_f4_amalgam_film.ts` (the film), `tools/action_f4_amalgam_sheet.ts` and `tools/action_f4_amalgam_captions.py`
(the sheet), `src/dev/action_f4_amalgam_scene.ts` (the scenes, on floor 1's stand-in floor; the game's warnings, its arms' cracks
and its claws' gouges drawn by the game's own code through a stand-in canvas), `tools/action_f4_amalgam_hash.ts` (the hashes).

## His word on the pictures (the first round)

Shown `amalgam_action.mp4` and `amalgam_action_sheet.png`, 1 Nov 2026 (answered by 13:40 his time), and asked of each:

- Its looming (rearing up on its arms before each big move, maw gaping, fire flaring, crashing down): “His regular arm swipe is
  pretty lackluster”.
- The bone rain: “Love the bone rain, can they all become little bone monsters.  Super easy to kill, but there’s a ton of them”.
  Read as: every skull that comes down bursts and its bones pull together into a little bone monster; one blow kills one, but
  there are dozens of them (in place of the slowing piles).
- The swipe as a combo (two rakes, then the rearing slam): “The rakes are lackluster”. So the two rakes are to be redone, much
  bigger, faster and wilder (they reach less than its old swipe did: 1.87 and 1.94 tiles against 2.45).
- The floor arms and the devour: “Yes, both (Recommended)”.

So: the floor arms, the devour and its rearing stand; the rakes and the rain's piles are redrawn (the second round).

## For him to decide (the art chat's to ask)

- The swipe as its every basic attack (4.0 s: two rakes and the slam), or a single quick rake kept between combos (his rule of 9
  Oct: "They should always have a basic, single target attack").
- The bone rain: three waves 0.6 s apart, a second of shadow each; the piles 6 s at 55% speed (the floor fills fast: 58 piles at
  once by 2.5 s after the slam).
- Its rear: 95 high, about twice its height lying (the pictures); higher would need its arms longer than they are.
- Its crawl at 0.8 tiles a second (kept), or quicker between fights (say 1.1, the Chained One's: a rules number only, its crawl's
  frames shown faster).
