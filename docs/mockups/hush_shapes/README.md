# Floor 20, the Quiet Tower: the shapes of the Hush (a mock-up; branch `mockup/hush-shapes`)

Made for the art chat, from `origin/mockup/swan-gardens` (55945b3). NOTHING HERE IS IN THE GAME: nothing of the game
imports it (its test proves it), and it is behind `HUSHSHAPES_ON` (src/art/hush_shapes.ts), off.

The measure is the floor's plan as he approved it, floor 20, THE QUIET TOWER, the lair that ends Act 2: the highest tower
of the High City, where the torn-out last chapter lies; its palette "Grey fog, bone white, no colour at all"; its enemies
"the Hush in its own shapes, the Silent Order's last masks, and shadows of the four royals." The Hush is what steals the
city's words and voices; the Moth, the floor's boss, makes it (its wing-dust is the Hush itself). Elsewhere the Hush shows
as grey breath leaking from the Hushed (art/hushed.ts); here it has taken shapes of its own.

## The brief, as he picked it

His pick for how they move: “Drifting, then darting (Recommended)”. (Their rhythm was made new on 30 Oct, on his pick: see
"Their rhythm". Their look, their grip and their death are as they were.)

The brief as offered with it: the Hush itself, taking shape: grey fog pulled into a hunched, faceless figure with long
thin arms and one open, silent mouth; about the knight's size, in swarms; it drifts slowly, then darts in fast; its mark,
the open silent mouth and the trailing fog; one attack, it wraps you in its arms for a moment, a grey grip that darkens
your words; its death, it unravels into wisps, and a word it had swallowed flies out of it, home; never gory, never a
cartoon ghost with a sheet; no sound, the world goes quiet near them.

His rules built in from the first pass: his Movement 9 (24 Oct: “Like the wind up and wind down are big but the actual punch
is lightning quick”, for “All attacks, melee most (Recommended)”; for enemies, 28 Oct: “Start from now on, but every enemy
is going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”), and
28 Oct: “It’s all too slow and too narrow and too small.  I could dodge anything you’ve put in these moves with my eyes
closed”. So every strike is two frames, smeared with its after-images, between a big held wind-up and a big wind-down;
the dart and the grip are as fast and as big as the brief says, in tiles (TILE3 a tile).

## What it is (src/art/hush_shapes.ts)

- ONE SCULPTED BODY OF FOG, no cloth, no sheet: a hunched back swelling into a hump between its shoulder blades over narrow
  ribs and a waist; below its hips no legs: the fog pours down into a plume that trails behind it a hand over the floor,
  ragged at its edge, and comes apart in streaks into mist toward its end (`Mob.finish`, `thinHush`: as the Princess's
  steed is thinned). Its colours `HS_FOG` (the Hush's grey, dark in its hollows, bone white where the light takes it).
- LONG THIN ARMS (the build's arms 1.4 times a man's): a knob of fog at each shoulder, the elbow's knob, the forearm
  narrowing to the wrist; a narrow hand and four long bone-white fingers (`HS_PALE`), hanging, splayed, or closed round.
- A FACELESS HEAD under a brow of fog: no eyes, no nose (so the Hush's dull pink, which is in the eyes of the Hushed, is
  here deep in its throat); ONE OPEN MOUTH, a dark gape taller than it is wide, sagging,
  its upper lip bone white, the Hush's dull pink deep in its throat (`FLAME[1]`; hotter, `FLAME[2]`, through its
  warnings). The gape is drawn round toward whoever looks while its face is toward them (as the eyes of every face are,
  art/skin.ts `eyesToward`), so it is never lost on the edge of the head. From behind, no face at all.
- THE TRAILING FOG: wisps streaming off its crown, its hump, its shoulders, its elbows and all down its plume, and a thread
  of the Hush curling out of its mouth (laid after its edge: `Mob.grains`), more as it darts, most as it unravels.
- The ink seam where one part ends before another; the enemy's pink rim round it while it lives; nothing cyan; nothing
  glows but the pink in its throat and, as it dies, the word.

## Its moves (src/art/hush_shapes_moves.ts), and their numbers

- HOVERING (its stand, 2.4 s, 24 frames at 10): hunched, a hand over the floor, rising and sinking 3 high, swaying; its
  long arms hanging before it and stirring, its fingers curling and uncurling; its head turning slowly; its mouth gaping
  wider and narrower without a sound.
- THE DRIFT (its walk, `HS_PACE` 1.5 tiles a second, 12 frames at 10; the knight walks 2.5): slow, leaning into its way,
  bobbing on nothing, its arms trailing, its plume streaming out behind it. Kept as it was (every frame), as their walk; in
  their rhythm of 30 Oct they circle you instead (see "Their rhythm").
- THE DART: NO LONGER ONE OF THEIR MOVES (30 Oct, see "Their rhythm"). Its code is kept in
  `src/art/hush_shapes_moves.ts` (`dartPlan`, `HS_DART`, `dartCarry`; its smear in `smearedAt`), out of their move set:
  `HUSH_SHAPE.more` holds only their circling glides and their swoops, and nothing plays it. (It drew in on itself, held,
  went four tiles in two frames, smeared, and reared back as it braked.)
- THE CIRCLING GLIDES and THE SWOOP (30 Oct): see "Their rhythm".
- THE GRIP (its attack, `HS_GRIP`, 1.7 s): it rears up and spreads its arms wide to either side, two tiles hand to hand,
  fingers splayed, mouth gaping, the pink in its throat burning (by 0.33 s), held shivering (THE WARNING, to 0.62 s); hips
  first (to 0.67 s); THE STRIKE, two frames (to 0.73 s, its `hit`): its arms snap shut round the space before it, smeared,
  crossing over, the left over the right, closing 1.5 tiles before it; it holds whoever is there, squeezing, to 1.13 s;
  the arms uncross and let go, and it sinks back by 1.7 s.
- THE GRIP ROUND WHOEVER IT CAUGHT (`gripPainted(t, view, half)`, `GRIP_FX`, from the blow landing, 0.8 s): at the
  strike, the fog swept in across the floor from the edge of the area it shuts on (0.85 tiles out: 1.7 tiles across) and,
  in two frames, three coils of its grey fog wound round whoever stands there (0.42 tiles out); held, squeezing, turning;
  then loosening and unravelling upward. Drawn in two halves, `far` (under whoever it holds) and `near` (over them).
- STRUCK (`HS_REEL`, 0.4 s): jolted back, its arms flung out, its mouth open, a gash torn through its chest that closes
  again; its fog flung off it.
- ITS DEATH (`HS_DIES`, 2.0 s): struck, it arches back, its head thrown back, its mouth stretched wide; the word it
  swallowed comes up out of its mouth (0.3 s) in the Hush's dull pink, rising, taking its own colour again as it goes (by
  1.15 s); it rises and unravels into wisps, every part of it drawn up and away (0.35 to 1.55 s) until nothing is left;
  the word hangs, then flies away up and off, home, and is gone (1.15 to 1.75 s). No rim, no blood.

THE WORD: the game's own rune of the word (art/icons.ts `GLYPH`), a cell to a game pixel, in the word's own colour
(`WORD_COLOR`) with its glow (`WORD_GLOW`), as the Physician's freed word flies home in (art/physician_shots.ts
`drawWordFreed`: the enemy's pink going out of it, its own colour coming back). Not cyan: the floating words of the game
are in their own colours. In the pictures it is one of the city's words, "pulling" (`HS_WORD`); which word, the game's, but never the twin or
frost words, whose colours read as the hero's cyan (as with the Moth's words, on his yes to floor 20's boss): asked for
one of them, it lets go "pulling" instead (`hushWord`, `HS_WORD_NOT`).

## Their rhythm: circling, and the swoop (made new, 30 Oct)

To make Act 2's enemies differ, offered to him as a pop-up: "THE HUSH'S SHAPES never still, swirling round you in a
tightening spiral, faster as they close, then wrapping you". His pick: “Yes, these (Recommended)”.

No drift then dart: they are always moving, each going round you, the swarm spiralling in; on the near ring, one after
another, the swoop (the swirl's last fast turn the wind-up of their grip). Their look, their grip and their death are as
they were: EVERY FRAME OF THEIR HOVER, THEIR DRIFT, THEIR GRIP, STRUCK AND THEIR DEATH, AND THE GRIP'S COILS, IS PAINTED AS
BEFORE, PIXEL FOR PIXEL (388 frames, both ways round, hashed from their floor point before and after:
`tools/hush_shapes_hash.ts`).

THE CIRCLING GLIDES (`HS_GLIDES`; their walk's frames, 12 at 10 a second, 1.2 s round; `ground` 0, carried by the game to
its side). All FACING YOU (the way the picture faces: its gape on you, its head turned back to you):

| glide | the way it goes | painted for | turned into its way | leaning into the turn |
|---|---|---|---|---|
| `circleLeft` | round you, to its own left | 3.0 tiles a second, a ring 5 tiles out | 11° | 5° over, 3° in toward you |
| `circleRight` | round you, to its own right | the same | the same | the same |
| `circleLeftFast` | round you, to its own left | 6.5 tiles a second, a ring 2.5 tiles out | 18° | 9° over, 6° in toward you |
| `circleRightFast` | round you, to its own right | the same | the same | the same |

- Bobbing on nothing (twice a round), swaying; its leading hand reaching on round the ring, the trailing one dragged out
  behind; its fingers loose, stirring; its mouth open on you.
- ITS FOG TRAILS ROUND THE CURVE: its plume left behind the way it goes from (its end 0.5 tiles out to the side, slow; 0.67,
  fast) and curved in round the ring toward you (as the way it came does); its fog streaming out behind it in ribbons along
  the ring, torn into wisps flowing away from it, rippling, thinning to nothing (out to 1.1 tiles slow, 1.55 tiles fast:
  `HushSay.orbit`, `orbitOf`), curved in round the ring; what streams off behind it hidden by it. Nothing jerks, nothing
  jumps: every glide into the other pace and into the swoop, from any frame, through the checks.

THE SWOOP (`swoopLeft`, `swoopRight`: going round you to its left or to its right; `HS_SWOOP`, 1.7 s, the game's thirty
frames a second). Its grip, wound up by the swirl's last fast turn:

- 0 to 0.36 s, THE LAST FAST TURN: out of its fast glide, a burst round you, banked hard into the turn, its arms rising and
  flung wide, its mouth opening, the pink in its throat rising; braking square before you.
- 0.36 to 0.62 s, HELD (the warning, eight frames): square before you, its arms flung wide (2.1 tiles hand to hand), its mouth
  gaping, the pink in its throat at its full, shivering; its fog flung on past it round the curve as it brakes, and settling.
- From 0.62 s, ITS GRIP AS IT ALWAYS WAS (every bone, its fingers, its mouth and its warning the grip's, tested): hips
  first; THE WRAP in two frames (0.667 to 0.733 s, frames 20 to 22, smeared, landing at 0.733 s: `HS_SWOOP.hit`, the grip's
  `hit`), closing 1.5 tiles before it; the grip held, squeezing, to 1.13 s; the grip's coils round whoever it caught as
  before (`gripPainted`, from the hit, 0.8 s).
- 1.27 to 1.7 s, it lets go and SWIRLS OFF round you again, into its slow glide (its first frame), its fog streaming out
  again as it picks up speed.

THE NUMBERS FOR THE MAIN CHAT (`HS_CIRCLE`; suggested starting numbers for the game's steering, not his words; tiles and
seconds):

| | |
|---|---|
| far ring | 5 tiles out; 3.0 tiles a second round you (a round in about 10.5 s) |
| closing | the ring shrinking 0.8 tiles a second (far ring to near ring in about 3.1 s, about two thirds of a round) |
| pace as it closes | rising evenly from 3.0 at 5 tiles to 6.5 at 2.5 tiles (`circlePace(r)`); faster round you too |
| slow or fast glide | the slow glide outside 3.75 tiles (`switchAt`), the fast one inside |
| near ring | 2.5 tiles out; 6.5 tiles a second (a round in about 2.4 s) |
| the swoop's last turn | the game carries it round: 6.5 tiles a second, a burst to 8.0 (at 0.13 s), braking to nothing by 0.36 s (`swoopPace(t)`); 1.86 tiles round you, about 50 degrees; its ring closing 1.0 tile, from 2.5 to the grip's 1.5 (`swoopCarry(t)`: `round` and `inward`, tiles) |
| the grip | its arms shut 1.5 tiles before it (`gripAt`), round an area 1.7 tiles across, as before |
| swirling off | from 1.27 s the game carries it round again, from nothing to 3.0 tiles a second by 1.6 s; in the pictures its ring grows again 1.2 tiles a second, out to 4.6 tiles, and it spirals in once more |

How the game should steer them (the game's; these are only what the pictures were made with):

- Each one ON A RING ROUND YOU, its picture facing you (as the game turns any monster to face you): each frame it goes round
  by its pace over its ring (`circlePace(r) / r` radians a second), its ring closing at `closing`, down to the near ring. A
  swarm all going round the same way reads as one swirl (the film's five all go round one way).
- Play `circleLeft` or `circleRight` (and their `Fast` ones inside `switchAt`) as a walk is played, its frames at 10 a
  second, by the way it goes as its picture is turned (turned over to face left, the same pictures go the mirror way: pick
  by its left as the picture has it).
- On the near ring, one after another (the game's choice of when; the film, about one every 1.3 s), play the swoop the
  same way round, carrying it round you by `swoopCarry(t).round` and in by `swoopCarry(t).inward` as it plays. Begin it
  where its last turn will END SQUARE BEFORE YOU, facing you on one of the four ways its pictures face, so that its wrap
  closes on you (in the pictures: when it is 50 degrees short of one). Its grip lands at `HS_SWOOP.hit`: from then draw the
  grip's coils round whoever it caught, as for the grip. "Darkens your words" is the game's, as before.
- After the swoop, its slow glide from its first frame, its ring growing out again, then in once more.
- Struck, from any frame of a glide: struck (`reel`) and then a glide again from its first frame; struck down, from any
  frame of a glide: its death. Their grip (`attack`) is kept as it was, for one that is not circling.

Their picture (`HS_CANVAS`) is now 304 by 256, its floor point at 108, 166 (it was 280 by 256 at 84, 166: 24 wider to its
left, for its fog streaming as it swoops round you); the fog's churn is laid from its floor point, so that every frame
painted before is painted the same.

## How to bring it in (the main chat's)

- `makeHushShapeArt3()` gives `{ front, back }` as the game holds a monster (`stand`, `walk`, the attack's clip with its
  `hit`, `reel`, `die`; among its other moves its four circling glides, going round at the walk's frames, and its two
  swoops, each with its `hit`). Its picture `HS_CANVAS` is 304 by 256; the game cuts each frame to what is in it.
- THEIR RHYTHM: see "Their rhythm" (its glides, its swoop, and the numbers to steer them by). The dart is no longer one of
  their moves.
- THE GRIP: its area, the game's (drawn to: 1.5 tiles before it, 0.85 tiles round that); from its `hit`, draw
  `gripPainted(t, view, 'far')` under whoever it holds and `'near'` over them, at the point `gripAt()` gives. "Darkens your
  words" is the game's to do with the word bar while it holds.
- THE WORD AS IT DIES: `HS_WORD.id` set to the word it had swallowed.
- (30 Oct: no shared engine file touched.) One shared engine file touched at first: `src/art/new_mobs3.ts` `fallApart`: a figure that thins its own finished frame
  (`Mob.finish`) is thinned as it dies too (a fog figure unravelling). Only the Princess has a `finish` besides it, and
  hers does nothing as she dies (her steed has faded by then): every figure paints as before.
- Three import checks told of these files (as they were of floor 16's): `tests/bosses.test.ts` (test 12, it takes the
  checks' types), `tests/crier.test.ts` (it takes the Hush's colours), `tests/hushed.test.ts` (its breath's palest grey).

## The checks (tests/hush_shapes.test.ts)

1. the switch off; nothing of the game imports it;
2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`), every frame, from in front and from behind,
   and every handover: its hover into each move and back; the drift into the grip from any step of it; each circling glide,
   from any frame, into the other pace the same way round, into its swoop (fast), struck and struck down; its hover (the
   slow glides), its drift (the slow glides, from any step), its grip, struck and its swoop into each glide; the swoop's
   held warning into the grip: nothing through it (its fingers too), nothing in the floor, nothing jerky or jumping, each
   blow drawn back, held and carried through, hips first, alive when still, its strikes flashes;
3. HIS LIGHTNING STRIKES: the grip and both swoops each two frames, landing on the second; smeared then and only then;
4. every frame both ways round: nothing cyan, the pink rim while it lives and none as it dies, every pixel whole or empty
   but the rim (crisp);
5. nothing cut off; 6. nothing of it in the floor (its fog too);
7. its mark: its gape with the pink in it from in front, no face from behind, no eyes; mist at its tail and fog streaming
   off it in every frame it lives;
8. struck, torn and closed; its death unravelling to nothing, the word coming out in the Hush's pink and flying in its
   own colour, gone by the end;
9. loose things follow: its plume trails as it drifts; circling, its fog left behind the way it goes from, more so fast;
   swooping, its fog as its fast glide left it, flung on past as it brakes, settled by the end of its warning, and as its
   slow glide's again as it swirls off;
10. its sizes in tiles: its crown within 15 percent of the knight's; its drift kept; its arms two tiles apart in its
    warning; the grip closing more than a tile before it, round an area 1.7 tiles across; the coils snapping shut in two
    frames; nothing cyan in them;
11. THEIR RHYTHM: no dart in their moves; the four glides, each a round of the walk's frames, carried to its side, facing
    you, turned into the way it goes and leaning into the turn in every frame, more so fast; the spiral's numbers, its pace
    rising as its ring closes;
12. THE FOG ROUND THE CURVE: in every frame of every glide, its tail's end out to the side it goes from and curved round
    the ring, and its fog streaming out behind it, curved in round the ring toward you; streaming further fast than slow;
13. THE SWOOP: the game's carrying it (from the near ring's pace, a burst to 8, braking to nothing by the end of its turn,
    its ring closing to the grip's); its arms two tiles apart, the pink at its full and its mouth gaping through its held
    warning, eight frames and more; from then its grip as it always was (every bone, its fingers, its mouth, its warning,
    its hit); its end its slow glide's first pose.

## The pictures (docs/mockups/hush_shapes/pictures/)

- `sheet.png`: it hovering from in front and from behind beside the knight, three times as big; a swarm at the game's
  size round the knight.
- `swarm.png`: the swarm three times as big, as the game is on a phone.
- `film.mp4`: every move from in front and from behind, the knight in it for size, captioned; each strike again at half
  speed. (Made before the change of 30 Oct: its drift-then-dart swarm and its dart are no more as their rhythm. Not made
  again.)
- `hush_shapes_spiral.mp4` (30 Oct; 1200 by 674, 27.8 s, captioned): THEIR RHYTHM. Five of them at the game's size (a
  phone's whole view across) spiralling in round the knight, faster as they close, and one after another swooping in to
  wrap him and swirling off again (11.4 s); the four circling glides three times as big, to its left and to its right side
  by side, slow and then fast, from in front and from behind, the floor going by, the way to you and the way it goes marked
  on the floor (6.4 s); the swoop three times as big round the knight at half speed, from in front (round to its left) and
  from behind (round to its right) (10 s).
- `hush_shapes_spiral_sheet.png` (30 Oct; 1200 by 2110): the spiral from above as the game sees it, twice the game's size,
  its rings and one of them spiralling in round the knight and swooping, the swoop's last turn in pink; the four glides
  three times the game's size, from in front and from behind, arrows on the floor for the way to you and the way each goes;
  the swoop in eight moments from in front, the knight in its grip.

## Tools

- `npx tsx tools/hush_shapes_pics.ts sheet|film|look|big|close <dir> [...]`: the pictures, painted without a browser on a
  quiet grey floor (`src/dev/hush_floor.ts`: not floor 20's ground, which is not made yet); `python3
  tools/hush_shapes_film.py <dir> <out.mp4>` puts the film together.
- (30 Oct) `npx tsx tools/hush_shapes_pics.ts spiral <dir> [swarm,glides,swoop]`, then `python3 tools/hush_shapes_film.py
  <dir> hush_shapes_spiral.mp4`: the spiral film, steered as the game is asked to steer them; `npx tsx
  tools/hush_shapes_pics.ts spiralsheet <dir>`, then `python3 tools/hush_shapes_spiral_sheet.py <dir>
  hush_shapes_spiral_sheet.png`: its sheet. `npx tsx tools/hush_shapes_hash.ts <file.json> [check]`: every frame of the
  moves that did not change, hashed from its floor point (to show them unchanged).
- `src/dev/preview_hush_shapes.ts` (in a browser, tools/preview.mjs): `sheet`, `big:<move>:<t>`, `grid:<move>:<t>,...`,
  `grip:<t>`.

## His word on the pictures

The swarm, the sheet and the film (`swarm.png`, `sheet.png`, `film.mp4`), asked “The Hush's shapes (swarm.png, sheet.png
and the film): are these right?”: “Yes, that's them (Recommended)”.
