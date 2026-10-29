# Floor 20, the Quiet Tower: the shapes of the Hush (a mock-up; branch `mockup/hush-shapes`)

Made for the art chat, from `origin/mockup/swan-gardens` (55945b3). NOTHING HERE IS IN THE GAME: nothing of the game
imports it (its test proves it), and it is behind `HUSHSHAPES_ON` (src/art/hush_shapes.ts), off.

The measure is the floor's plan as he approved it, floor 20, THE QUIET TOWER, the lair that ends Act 2: the highest tower
of the High City, where the torn-out last chapter lies; its palette "Grey fog, bone white, no colour at all"; its enemies
"the Hush in its own shapes, the Silent Order's last masks, and shadows of the four royals." The Hush is what steals the
city's words and voices; the Moth, the floor's boss, makes it (its wing-dust is the Hush itself). Elsewhere the Hush shows
as grey breath leaking from the Hushed (art/hushed.ts); here it has taken shapes of its own.

## The brief, as he picked it

His pick for how they move: “Drifting, then darting (Recommended)”.

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
- A FACELESS HEAD under a brow of fog: no eyes, no nose; ONE OPEN MOUTH, a dark gape taller than it is wide, sagging,
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
  bobbing on nothing, its arms trailing, its plume streaming out behind it.
- THE DART (`HS_DART`, 1.0 s): it draws in on itself, sinking and leaning back, its arms drawn back along its sides, its
  mouth opening (to 0.17 s), held shivering (THE WARNING, to 0.37 s); then FOUR TILES IN TWO FRAMES (0.40 to 0.47 s: 60
  tiles a second), smeared all along the way it came (its back again and again, the streaks of its crown, hump,
  shoulders, hands and plume); it rears back as it brakes, its plume whipping on under it and past, and settles by 1.0 s.
  It goes in its own picture: AT ITS END THE GAME MOVES IT THE FOUR TILES (the checks' `shift`), and it hovers, or grips,
  from where it arrived.
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
are in their own colours. In the pictures it is one of the city's words, "pulling" (`HS_WORD`); which word, the game's.

## How to bring it in (the main chat's)

- `makeHushShapeArt3()` gives `{ front, back }` as the game holds a monster (`stand`, `walk`, the attack's clip with its
  `hit`, `dart` among its other moves, `reel`, `die`). Its picture `HS_CANVAS` is 280 by 256 (room for its dart); the game
  cuts each frame to what is in it.
- THE DART: play `more.dart`; at its end move it `HS_DART.carry` (four tiles) along the way it faces, then stand or grip.
  The game chooses when it darts (at you, from a drift) and when it grips.
- THE GRIP: its area, the game's (drawn to: 1.5 tiles before it, 0.85 tiles round that); from its `hit`, draw
  `gripPainted(t, view, 'far')` under whoever it holds and `'near'` over them, at the point `gripAt()` gives. "Darkens your
  words" is the game's to do with the word bar while it holds.
- THE WORD AS IT DIES: `HS_WORD.id` set to the word it had swallowed.
- One shared engine file touched: `src/art/new_mobs3.ts` `fallApart`: a figure that thins its own finished frame
  (`Mob.finish`) is thinned as it dies too (a fog figure unravelling). Only the Princess has a `finish` besides it, and
  hers does nothing as she dies (her steed has faded by then): every figure paints as before.
- Three import checks told of these files (as they were of floor 16's): `tests/bosses.test.ts` (test 12, it takes the
  checks' types), `tests/crier.test.ts` (it takes the Hush's colours), `tests/hushed.test.ts` (its breath's palest grey).

## The checks (tests/hush_shapes.test.ts)

1. the switch off; nothing of the game imports it;
2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`), every frame, from in front and from behind,
   and every handover (its hover into each move and back, the drift into the dart and the grip from any step of it, the
   dart into its hover and its grip four tiles on): nothing through it (its fingers too), nothing in the floor, nothing
   jerky or jumping, each blow drawn back, held and carried through, hips first, alive when still, its strikes flashes;
3. HIS LIGHTNING STRIKES: the dart and the grip each two frames, the grip landing on the second; smeared then and only
   then;
4. every frame both ways round: nothing cyan, the pink rim while it lives and none as it dies, every pixel whole or empty
   but the rim (crisp);
5. nothing cut off; 6. nothing of it in the floor (its fog too);
7. its mark: its gape with the pink in it from in front, no face from behind, no eyes; mist at its tail and fog streaming
   off it in every frame it lives;
8. struck, torn and closed; its death unravelling to nothing, the word coming out in the Hush's pink and flying in its
   own colour, gone by the end;
9. loose things follow: its plume trails as it drifts, is left behind as it darts and swings on past as it stops;
10. its sizes and speeds in tiles: its crown within 15 percent of the knight's; the drift 1.5 tiles a second; four tiles in
    two frames; its arms two tiles apart in its warning; the grip closing more than a tile before it, round an area 1.7
    tiles across; the coils snapping shut in two frames; nothing cyan in them.

## The pictures (docs/mockups/hush_shapes/pictures/)

- `sheet.png`: it hovering from in front and from behind beside the knight, three times as big; a swarm at the game's
  size round the knight.
- `swarm.png`: the swarm three times as big, as the game is on a phone.
- `film.mp4`: every move from in front and from behind, the knight in it for size, captioned; each strike again at half
  speed.

## Tools

- `npx tsx tools/hush_shapes_pics.ts sheet|film|look|big|close <dir> [...]`: the pictures, painted without a browser on a
  quiet grey floor (`src/dev/hush_floor.ts`: not floor 20's ground, which is not made yet); `python3
  tools/hush_shapes_film.py <dir> <out.mp4>` puts the film together.
- `src/dev/preview_hush_shapes.ts` (in a browser, tools/preview.mjs): `sheet`, `big:<move>:<t>`, `grid:<move>:<t>,...`,
  `grip:<t>`.
