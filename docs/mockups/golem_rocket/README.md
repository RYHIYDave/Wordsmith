# The Golem's rocket jump, and its run (the art chat's helper, 2 Nov 2026)

Branch `art/golem-rocket`, from `origin/art/golem-shots` at 19a4661 (the Golem's charged shots made game-ready). PICTURES
AND GAME-READY PIECES, BEHIND A SWITCH THAT IS OFF (`GOLEM_ROCKET.on`, `src/art/golem_rocket_fx.ts`): nothing of the game
imports any of it (a test proves it). The main chat brings it in, on his yes.

## His words (exact)

- 2 Nov 2026, 21:29, to the main chat: “And the golem is gonna need that rocket jump for positioning, and probably more
  movespeed”
- His rulebook's Animations 1: “as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high
  than a notch too low.”
- And his word tonight on another hero: “I’d rather have to pull back from a 10 then build up from a 1”

The main chat's request on the board, 2 Nov 2026, 21:35: “PLEASE DRAW THE GOLEM'S ROCKET JUMP (from its stacks: the
take-off, the flight, the landing), from in front and behind, to those numbers or yours, pictures to him first, then
game-ready pieces as golem_shots_fx were.” Its stand-in in the game (work-f4): further than 5 tiles from where it is going,
seeing it, the Golem blasts off and comes down there, at most 8 tiles on, 0.7 s in the air, 46 game pixels up at the top,
striking nothing, 3.5 s between jumps; its pace 5.5 tiles a second (was 4.6). Drawn to those numbers, and then twice as high
at his answer below.

His answer on the first pictures, 3 Nov 2026, asked whether the rocket jump was good (it flew about one and a half times its
own height), offered as the same jump flying about twice as high so it reads bigger: “Yes, but higher (Recommended)”. So
its top is now 92 game pixels (was 46), about three times its own height; the take-off, the 0.7 s in the air and the
landing as they were; its shadow shrinking and fading further as it rises; its trail and the jump across the arena
redrawn to match. THE STAND-IN'S 46 (game/tinkerer.ts `golem.jump.high`) BECOMES 92.

## The pictures (`pictures/`)

- `golem_rocket.mp4` (1200 wide, 30 frames a second, about 18 s, captioned): the rocket jump at the game's size from in
  front and from behind, the Tinkerer beside it and a cultist where it lands; a jump across the arena, its whole reach of 8
  tiles; its run at 5.5 tiles a second from in front and from behind; then the take-off and the landing at half speed,
  three times as big, from in front and from behind.
- `golem_rocket_sheet.png` (1200 wide): the take-off, the flight and the landing, key moments from in front and from
  behind; the jump across the arena at the game's size; its run.
- IN THE GAME (the main chat's helper, 3 Nov 2026, branch `golem-rocket-in`: brought in as “Bringing it in” says, behind the
  switch, turned on for the film only): `golem_rocket_in_game.mp4` (1200 wide, 30 frames a second, 12 s, captioned, at the
  game's own speed), in the practice room on a phone's screen: its rocket jump at skeletons from in front, then back from
  behind, then its gallop up the screen and down it; and three moments of it, `golem_rocket_in_game_blast.png`,
  `golem_rocket_in_game_behind.png`, `golem_rocket_in_game_slam.png`. Made with tools/scenarios/golem_rocket_film.mjs.

## What it does (frames are 30 a second; `src/dev/golem_rocket.ts` ROCKET)

On its own sculpted body (`src/dev/sculpt_golem.ts`), never its stand lifted. Its two stacks are its rocket: for the jump
they swing back and down on their feet like a rocket's nozzles, splayed out a little each to its own side so they point
down past its boiler, and swing back up when it has landed (new: `GOLEM_POSE.stacks`, `splay`, `flare`, and `hips`, its
hips going with its body so its knees bend; each left out, the Golem is drawn exactly as before, to the pixel: a test).

1. THE TAKE-OFF (frames 0 to 15; the game holds it where it stands). It sinks into a deep crouch, its knees bent under it,
   its giant fist braced on the floor before it; its stacks swing back and down and lock with a clank (kicking past and
   settling, a burst of steam and sparks at their feet, frame 8); held there, shuddering harder and harder, steam venting,
   the fire in their mouths flaring from the friend's dark cyan to white-hot, licking out longer, a pool of its light on the
   floor, grit hopping round its feet; a flash at their mouths (frame 14). THE BLAST, frame 15, a flash of two frames: a
   column of white-hot fire out of its stacks driven into the floor, a white flash, fire splashed over the floor, a ring of
   dust blown out 1.8 tiles, stone flung up, a column of smoke rolling up, the floor scorched with glowing cracks; it is
   flung up, its legs thrown straight, an after-image of it where it crouched (its outline in the friend's cyan, then darker, two frames).
2. THE FLIGHT (frames 15 to 36: 21 frames, 0.7 s). Up 22 game pixels in its first frame, 92 at the top (at 55% of its
   flight), riding its stacks, long flames streaming back and down out of them, embers shed, a trail of smoke puffs
   hanging where it passed; leaning into its flight, its legs tucked and braced under it, its giant fist thrust out ahead.
   Over the top its fire sputters out (frames 27 to 31) and smoke wisps off its stacks; it hauls its fist up over its
   shoulder, its legs reach down, and it falls like a stone, faster every frame (19 game pixels in its last frame).
3. THE LANDING (frame 36, a flash of two frames): its feet and its giant fist SLAM down together, its body crushed down into
   its knees; the floor cracked open in a crater (0.75 tiles round, its cracks running out 1.5), a ring of dust blown out 2
   tiles, stone flung up, dust billowing; it takes the blow (deepest at 39), heaves itself back up (48), its stacks swing
   back up and lock (51), steam hissing out of them, and it stands as it was (52). Done at 56. The crater fades away over
   its last half second (gone 2 s after the slam).
4. ITS SHADOW, all the way: the main chat's soft shadow, shrinking and fading as it rises, further than the stand-in's as it
   flies twice as high (`rocketShadow`: at its top 0.76 of its size and 0.4 of its strength, the stand-in's 0.82 and 0.55; the stand-in's
   own sizes and strength).
5. ITS RUN at 5.5 tiles a second (`GRUN`, `golemRun`). Its walk shown at that pace would be six rounds a second (a scurry;
   and, as the game shows it now, its stride 22% longer than its feet cover). So a run of its own, A GALLOP: a round of 16
   frames (just under 2 strides a second), 2.93 tiles a round: its giant fist planted far out ahead, its body vaulting over
   it, its feet swung under it to land one and the other and drive it off the floor into a bound, its fist flung out ahead
   again. Its fist and feet grip the floor while down (checked: none slides more than half a unit a frame at 5.5 tiles a
   second).

## The game-ready pieces (`src/art/golem_rocket_fx.ts`, behind `GOLEM_ROCKET`, off)

Every list is lazyFrames (painted when first asked for). `view` is the Golem's picture's ('back' when `g.fx + g.fy < -0.2`),
`flip` render.ts's `turned` (`g.fx - g.fy < 0`). The film and the sheet are these very pieces laid as below.

| Piece | Frames | Anchor and how to lay it |
|---|---|---|
| `golemRocketFrames(view, gun)` | 0 to 56 by `f` | ITS PICTURE, at its floor point, lifted `rocketUp(f - 15)` game pixels in the air (as the stand-in lifts its stand); turned over with `turned`. |
| `golemRocketFx(view)` → `{ floor, behind, over }` | 0 to 56 by `f` | EVERYTHING AT IT, at its floor point, turned over with it. `floor` under what stands (only while it crouches); `behind` just before its picture and `over` just after it, both lifted with it. (From in front its stacks' fire is behind it; from behind, over it.) |
| `golemLaunchFx(view, gun)` → `{ floor, air }` | `LAUNCH_N` = 42 from the blast | WHERE IT TOOK OFF (the stand-in's `jx, jy`), turned over as it was. `floor` under what stands; `air` as a thing standing there (depth a hair behind the take-off point from in front, a hair before it from behind, so that the Golem flying at the eye is over it and flying away is under it). |
| `rocketPuffFx()` and `rocketTrail(view, flip, dx, dy, k)` | puffs `PUFF_LIFE` = 22 frames each; the trail from `k` 1 to 37 | ITS TRAIL: `rocketTrail` lists the puffs to lay `k` frames after it left the floor (dx, dy = `ax - jx`, `ay - jy`): lay `rocketPuffFx()[p.v][p.age]` at `(jx + p.x, jy + p.y)` lifted `p.up` game pixels, over what stands. |
| `golemLandFx(view)` → `{ floor, air }` | `LAND_N` = 60 from the slam | WHERE IT LANDS (`ax, ay`), turned over with it. `floor` (the crater, fading over the last 16) under what stands; `air` (dust, stone) as a thing standing there, a hair before it. |
| `golemRunFrames(view, gun)` and `RUN_STRIDE` | 16 | ITS RUN in place of its walk: `set.walk` these, `walkStride` `RUN_STRIDE` (2.93 tiles), shown by the floor it covers as now. |
| `rocketShadow(k)` | | its shadow's size and strength in the air: `GOLEM_SHADOW * grow * r`, `min(1, SHADOW * 1.2) * a`. |

Also: `rocketUp(k)` (game pixels), `rocketAlong(k)` (0 to 1, steady as the stand-in), `rocketStacks(view, f, flip)` (its
stacks' mouths from its floor point, for anything more), `paintRocketAhead(lists, ms)`, and the `...Piece` painters.
Where its stacks, feet and fist are at each frame is baked into `src/art/golem_rocket_points.ts` by
`tools/bake_golem_rocket.ts` (the test sculpts them again; if its moves change, run `npx tsx tools/bake_golem_rocket.ts`).

### Bringing it in (the main chat): its stand-in's numbers drive it

- When it decides to jump (game.ts, where `g.act = 'jump'`): keep `jx, jy, ax, ay` as now, but hold it where it stands
  for the take-off: `f = Math.floor(g.actT * 30)`; while `f < ROCKET.blast` (15, half a second) it does not move. Its blast
  (the stand-in's `bombsAway` and shake 1.5, its 'explode' sound) at `f = 15`, not as it decides.
- In the air from `f` 15 to 36: `u = rocketAlong(f - 15)` (the stand-in's `actT / J.long`, 0.7 s = 21 frames); its floor
  point `jx + (ax - jx) * u` as now. Its landing (golemArrive, shake 2, 'slam') at `f = ROCKET.land` (36).
- Landed, it stands up till `ROCKET.end` (56, 0.67 s after it lands); it may be let go into a punch from about frame 44 if
  that is wanted (it is crouched over its braced fist then). Its wait of 3.5 s from when it lands, as now.
- render.ts: its picture `golemRocketFrames(view, gun)[f]` in place of `set.idle[0]`, lifted
  `rocketUp(f - ROCKET.blast)` in place of `Math.sin(...) * J.high` (up fast, down like a stone; 92 at the top, the stand-in's 46 made twice as high, and the same
  0.7 s); `golemRocketFx(view)`: `behind[f]` and `over[f]` with it, `floor[f]` under it; its shadow with `rocketShadow`.
- tinkerer_fx.ts: on its blast, `golemLaunchFx(view, gun)` at `jx, jy` and the trail; on its landing `golemLandFx(view)` at
  `ax, ay` (in place of its drop-in's burst and ring).
- Its run: `golemRunFrames` and `RUN_STRIDE` for its walk (its pace stays the game's, 5.5).
- PAINTING COST (node, one CPU): its picture about 50 thousandths of a second a frame (57 frames: some 3 s for a view and
  an arm); everything at it 5 to 25 a frame; the take-off and the landing some 10 to 40 a frame; the puffs 1 or 2. Paint
  them ahead (`paintRocketAhead`) once she has the Golem out, so that none is painted as it is shown.

## The checks (`tests/golem_rocket.test.ts`)

- Every frame of the jump, from in front and behind, turned eight ways: crisp, the friend's cyan edge, no pixel alone,
  nothing pink, nothing cut off; nothing sunk into the floor and standing on it (in the air: nothing under the floor beneath
  it); its giant arm and its stacks, swung down, clear of the rest of it.
- Slick (its fist and its eye never leap, stall or turn straight back at speed, as they go up and down with it) but for the
  blast and the slam; its fist braced still through its crouch and as it takes the blow; still at its start and its end.
- Its numbers: 21 frames in the air, 92 game pixels at the top, at least 20 up in its first frame, falling faster every
  frame from its top; it starts and ends standing as it stands; with its new numbers naught it is the Golem it was, to the
  pixel.
- Its run: every frame through the checks (in a bound it may be a little off the floor), eight turns, both views; its fist
  and feet grip the floor at 5.5 tiles a second; its fist and eye slick round and round as the floor sees them; under 2.5
  rounds a second.
- Its pieces, every frame, from in front and behind: crisp, no pink, no gold, nothing cut off, nothing alone; the friend's
  cyan at its blast and its flames as it flies; all gone when done. Its trail only where it has been.
- The baked points the sculpture's own; its switch off; nothing of the game imports it.

## For him to decide

- Its stacks swinging down to be its rocket (and back up after): the read of “from its stacks”.
- The half second's crouch before it blasts off (a big held wind-up, his Movement 9) and the two thirds of a second it takes
  to stand up after: the jump is now 1.2 s from deciding to landing for 8 tiles (6.8 tiles a second, faster than its run).
- The gallop for its run.
