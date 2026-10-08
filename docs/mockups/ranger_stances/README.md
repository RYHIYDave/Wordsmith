# Mock-up: the ranger's battle stance, town stance and moves (NOT IN THE GAME until the main chat puts it there)

**What it is.** The ranger remade on his own battle stance, as the owner asked, behind switches that
are off: `RANGER_STANCES.on` in `src/art/moves3.ts`, and with it the game's side,
`RANGER_ARROW.on` in `src/game/defs.ts` (`useRangerStances(on)` sets both). With them off, the game
is today's exactly (tests check it).

**State of this branch (`art/ranger-stances`), 8 Oct 2026:** from `main` at `5266f5b` (Version 19.1
and the newer art rulebook), with `art/hero-moves-review` merged in (the review of every hero
animation, its measuring tools, and the gripping runs behind `GRIP`, which stays off), and then
`main` at `2f8bcf1` (Version 19.2, Strike's two swings mended) merged in, so that it goes into
`main` as it is now without a clash (two lines of imports and `__dbg` were joined by hand). **HE HAS
SAID YES TO ALL OF IT, PART BY PART (15:57, 16:28, 16:41), AND AT 17:07 TO HANDING IT ALL OVER.**

## His words

- 15:31: "Wait I need the rangers animations fixed".
- 15:38, asked which of them: "All of that, but more.  Each character should have a battle stance
  and a town stance.  When you run, the ranger is crouched, but when you stop he pops back up.  I
  want him to stay crouched when he stops in battle.  Once he’s in town he stands upright, and he’ll
  need a movement animation for town as well.  Also his shot animation is upright so when you shoot
  an arrow you pop up and down to the crouch.  I want the battle stance to have the bow out and
  arrow knocked.  And the arrow that fires in the animation for shot doesn’t match the actual
  projectile that comes out for shot.  I need all that fixed"
- 15:57, to `ranger_stances.png` and `ranger_stops.gif`: "Yes, this stance (Recommended)"; of the
  town run, "Yes, upright (Recommended)".
- 16:28, to `ranger_shot_volley.gif`: "Yes, both (Recommended)" (Shot and Volley from the crouch,
  with one arrow; the flying arrow longer).
- 16:41, to `ranger_roll_hits.gif` and `ranger_fall_habits.gif`: "Yes, all of them (Recommended)".
- 17:07, to `ranger_shoots_moving.gif`: "Yes, hand it all over (Recommended)".
- "Each character should have a battle stance and a town stance": the warrior has both; **the
  mage's battle stance of her own is still to come from the art chat**, pictures first.

## What changes, with the switch on

(Measured with `tools/review_heroes/play.ts --ranger`, the game's own rules and frame chooser at
sixty steps a second; "today" is the same run with the switch off. Game pixels unless it says.)

- **In battle he stands as low as he runs** (his head, on the mean through his breathing, 47.0
  picture px off the floor, against the run's 47.1; upright he stood at 53.7): crouched, side-on,
  the bow out in front of him and down, an arrow on the string (`BATTLE`). It breathes and shifts
  its weight (2.4 s round).
- **He comes to a stand out of the run in two steps** (`AnimSet.stops`: eight clips, by the moment
  of the run he stopped at) **and sets off from the stance into it** (`AnimSet.start`, by distance,
  leading into the run at `startAt`). No jump into or out of the run: the picture changes there by
  at most 1.3 px, the bow's end 0.7 (today 4.6 to 5.4 px, the bow's end 20). A foot moves at most
  2.7 as he sets off or stops.
- **In town he stands upright** (as today) **and runs upright** (`RANGER_TOWN_UPRIGHT`).
- **His runs grip the floor** (both of them: `GRIP`'s gripping run, for him alone; the others' wait
  for `GRIP` and the more-directions work he asked for). Running the four drawn ways, a foot on
  the floor moves at most 1.5 (today 4.8 to 4.9). Between them it still slides: across the screen
  5.2 (today 9.2); up or down the screen 7.7 to 7.8 (today 7.2 to 7.3, a little less). That is the
  four views.
- **Facing his mark while he backs away or goes across it, his run steps that way**
  (`AnimSet.walkWays`: his run's legs turned to his left, back, to his right).
- **Shot and Volley from the crouch.** Shot's feet do not move (0.0; today 2.4). Volley drops to
  his knee from the crouch and steps back up into it (a foot 1.6; today 4.1).
- **One arrow.** The arrow on his string is painted as the game draws its own (a light wood shaft a
  game pixel thick, a pale steel head two game pixels square, no light of its own); the picture of
  the moment it goes has none on the string; no streak or fan of the picture's own. The game's side
  (`RANGER_ARROW`): a hero's arrow is drawn from where the point of the one on his string was
  (`from`, 0.796 tiles ahead; not drawn before it gets there), at its height (`height`, 22.5 game
  px off the floor, where it was 10) and as long (`long`, 11 game px, where it was 6); a Volley's
  arrows go up from his bow (`volleyFrom`, `volleyHeight`). **The rules are not changed**: an arrow
  still starts 0.4 tiles ahead of him and hits what it hits.
- **Shooting on the move, his legs run under it** (`clips.attackWalk`, `clips.heavyWalk`: the
  attack's body over his run's legs, one clip for each of the four ways he may be going as he faces
  his mark; the legs as far through their turn as the game has carried him, slowed for the
  attack's first moment as the rules slow him). Today his feet glide 30.3 to 40.5 as he shoots or
  looses a Volley on the move; now a foot moves at most 2.3 while he does. **The same when a blow
  rocks him as he walks** (`clips.reelWalk`, `lurchWalk`: today 17.8, now 1.7).
- **The roll** dives off both feet from the crouch, is a ball for as long as the game carries him
  (`Move3.tumble`), and comes up into the stance after, shown as a leap's landing is (`clips.land`;
  `figure.ts` keeps the step the roll ends from showing a frame of the run). A foot still slides in
  the roll, 8.7 to 10.9 (today 16.3): the ball where it touches the floor, as the game carries him
  up to 3.4 tiles in 0.24 s.
- **Rocked, thrown forward, the fall**: from the crouch; a foot that steps is lifted (rocked or
  thrown forward as he stands, 0.0; today 2.8 and 0.6).
- **His habits in a fight**: the squirrel, as he crouches; and a new one, the arrow taken off the
  string, sighted along, and nocked again.
- **Picked on his class card**, he makes ready into the battle stance (`ready` at 26 frames).

## In the code

- `src/art/moves3.ts`: `RANGER_STANCES`; `CROUCH`, `BATTLE`; `alive()` (the stances' loops);
  `RANGER_TOWN_UPRIGHT`; `settle()`, `settlesOf()`, `SETTLES` (stops); `startOf()`, `startsOf()`;
  `shotLow()`, `volleyLow()`, `arrowTip()`, `ARROW_LONG`; `rollLow()`, `reelLow()`, `lurchLow()`,
  `fallLow()`, `sightingOnString()`, `squirrel(base)`, `rangerDrawsLow()`; `walkingMotion()`,
  `walkingOf()`, `WALKS`, `runWay()`, `runWaysOf()`; `useRangerStances(on)`. `remakeRuns()`: the
  ranger's runs grip with his stances, the others' with `GRIP`.
- `src/art/hero3_ranger.ts`: the arrow painted as the game's (with the switch on).
- `src/art/heroes3.ts`, `animSet3`: `stops`, `start`/`startAt`, `walkWays`, `attackWalk`,
  `heavyWalk`, `reelWalk`, `lurchWalk`, the roll's `land`; the warm list paints them ahead of need.
  The pictures only a fight shows (the walking ones) are made for the dungeon look alone
  (`animSet3(plan, view, fights)`): in town nothing is fought.
- `src/art/actor_types.ts`: those fields of `AnimSet` and its `clips`.
- `src/render/figure.ts`: `FigureState.moved` (how the hero walked since the last frame); `wayOf()`;
  coming to a stand, setting off, the walk the other ways, the attacks and rockings made walking,
  and the roll's coming up. With none of these in the art, as before.
- `src/render/render.ts`: `moved` passed to the figure; a hero's arrow drawn as `RANGER_ARROW` says.
- `src/render/fx.ts`: Volley's arrows from the bow (`volleyUp`).
- `src/game/defs.ts`: `RANGER_ARROW`.
- `src/main.ts`: `__dbg.rangerStances(on)`, the playtests' switch (it paints the heroes again).
- `tools/scenarios/ranger_stances.mjs`: the bot fights with him in the practice room, then he is run
  and stopped by hand, and switched off again. On a build of this branch at the phone's size
  (`--file`, `--touch --size 844x390 --dpr 3`): all passed, finished clean.
- The films: `src/dev/preview_play.ts` (as the game plays it, with the game's own arrows, effects
  and the scarf and feather), `src/dev/preview_moves.ts` (moves one after another),
  `src/dev/preview_poses.ts` (stills); `tools/review_heroes/` (the measuring: `play.ts --ranger`).
  `src/dev/measure_paint.ts` takes the hash `ranger!ranger` to time his painting with the switch on.

## Tests

`tests/ranger_stances.test.ts` (12): the switches off and his moves today's; on and off again,
today's exactly; his runs grip and the others' do not; as low as he runs; Shot's feet still, the
arrow gone from the string at the blow, no streak or fan; the game's numbers equal the picture's;
his art has the new pictures only with the switch on, and the walking ones not in town; the
figure's stops, start, walk the other ways, attacks made walking, and the roll's coming up.
`tests/grip_runs.test.ts` (7). With 19.2 merged in: the whole suite 681 of 681; tsc clean; the
game builds; the ranger's playtest all passed, and Strike's (`combo_mends.mjs`) two swings, clean.

## To make it the game's own

Switch it on (`useRangerStances(true)` once at start-up, or `RANGER_STANCES.on`/`RANGER_ARROW.on`
true and the moves made from the start), then drop the switches: `BATTLE` as `RANGER_STAND3`'s rest
and motion, `shotLow()` as `SHOT3`'s, and so on down `useRangerStances`; `RANGER_ARROW`'s numbers as
the hero arrow's; the tests' "switch off" cases go.

**The cost: more pictures to paint ahead of need.** The ranger's warm list (`HeroArt.warm`) has 958
pictures in a dungeon (today 182) and 408 in town (today 182): his stops, start, runs the other
ways, and in a dungeon the walking attacks and rockings. Timed in the browser on the art chat's
machine (`measure_paint.ts`, two runs each): 5.1 to 5.7 s of painting in a dungeon (today 0.9 to
1.1 s), 1.95 s in town (today 0.85 to 0.89 s); a picture about 5 ms (median 4.4 to 4.8 ms), the
worst one 33 to 37 ms (today 19 to 27). A phone is slower. A picture costs more than `WARM_MS`, so
`Renderer.heroArt` paints one a frame, and the hero's first each frame: in his first dungeon of a
session, 958 pictures at one a frame is about 16 s at sixty frames a second before the monsters'
pictures get their turn (today about 3 s), and a monster's picture not yet painted is painted the
first time it is shown. Once painted they are kept for the session. If that shows on the phone,
let the hero and the monsters take turns by the frame, not only within one.

## Known, and not done here

- Running between the four drawn ways his feet still slide sideways (the four views); his answer
  for the runs was "More directions, picture first (Recommended)": the art chat's, after this.
- Where an attack, or a blow, begins or ends while he runs, the picture cuts between the run's arms
  and the attack's: 3.3 to 7.2 px (today 4.6 to 5.4).
- Setting off backwards or across from standing, the start (made for running forwards) gives way
  to the run that way after a frame: a cut of 4.3 to 5.4 px, and a foot moves 2.2 (across) to 6.0
  (backwards).
- A Volley loosed standing that he walks out of mid-way changes to the walking one: a cut of 5.6.
- The roll's ball slides where it touches the floor (above); going into the roll, a cut of 3.4 to
  3.5 (today 4.2 to 4.9).
- The mage's battle stance (his "Each character should have a battle stance and a town stance").
