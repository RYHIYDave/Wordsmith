# The Carrion Queen: her moves done the action way, and the Eclipse (mock-up; branch `art/action-f7-queen`)

An art helper's work on `art/action-f7-queen` (from `art/action-f9` a8d862a: the game with floors 1 to 10's mobs' new moves).
Nothing here is in the game until the main chat puts it there, on his yes. All of it is **behind one switch that is off**,
`QUEEN_ACTION = { on: false }` (art/carrion_queen_action.ts): with it off every frame the game shows of the Carrion Queen is the same,
pixel for pixel (hash below). Her old moves are kept as they are (art/carrion_queen2.ts, art/carrion_queen2_moves.ts, untouched).

## His words

- 31 Oct 2026, offered a Gale pushing toward the drop: “I hesitate to have any move push or something cause I don’t want any player
  to get one shot cause they fell off a cliff or whatever”; then “I don’t want too much of the same thing.  So can we do something we
  haven’t done yet?”
- Asked to take the drop out: “Yes, no drop-pushes (Recommended)” (offered as: her gust shoves you away from her, never toward the
  edge; the crawler drags you to itself).
- Asked for something no other fight has: “Eclipse (Recommended)” (offered as: her flock blots out the sun; the ledge dark but for a
  few pools of light drifting across it; vultures dive at anything outside the light).
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE
  to compensate for the extra time the player gets to evade”); and of a boss's first pass, “His regular arm swipe is pretty
  lackluster”, “The rakes are lackluster”: so her plain blows are big and fierce from the first pass.

## The pictures (`pictures/`)

- `queen_action.mp4` (1200 × 676, 44.7 s, 30 a second, H.264, captioned): her rake, her gust and her dive on her eyrie with the
  knight for size (twice the picture's pixels), from in front and from behind; the Eclipse close up, from in front and from behind
  (the game's own picture pixels); THE ECLIPSE OVER THE WHOLE LEDGE FROM ABOVE (the knight running for a pool as the light goes, a
  vulture's line marked at him and missing; crossing the dark, stopping, and the next one finding him; on into the light; the flock
  scattering and the light coming back); then each strike at half speed, and a vulture's dive out of the dark at half speed.
- `queen_action_sheet.png` (1200 wide): three moments of each move from in front and from behind, with the knight; HER OLD GUST
  BESIDE THE NEW (drawn by the game's own code); the Eclipse over the whole ledge at three moments.

The eyrie in them is a stand-in in the Ledge Road's own colours (its rock, its pale lip, the drop past it); her flock is the game's
own vultures (art/ledge_vultures.ts), unchanged.

## The moves (seconds, and frames at 30 a second; tiles from her middle)

Every blow: a big wind-up HELD (the warning), trembling; the strike in **two frames**, smeared with after-images of what strikes
along the way it came (`qaSmeared`: the strike's frames and the one after); a big wind-down.

### HER RAKE (`attack`; old: 1.45 s, its blow at 0.72, from 0.2 to 2.5 tiles, 0.9 to either side)

She bursts up off the rock in one hard wingbeat and HANGS HIGH, her talons cocked up and forward, her wings flung wide, trembling,
while the wedge she will rake is marked on the rock in her pink, its three claw lanes lit inside it and beating faster. Dropped and
raked down and through in two frames, her talons into the rock 1.6 tiles on: three GOUGES OF THE CULT'S FIRE torn along the lanes
out to the wedge's end, burning, then scorched. Mantled over the spot, her head stabbing; a hop back.

| | |
|---|---|
| the move | **1.867 s** (frames 0–56) |
| the wind-up | gathered by f6, up by f12, hung by f18, HELD **f18–f30**; its wedge marked from f14 |
| the strike | **f30–f32**, her blow at **1.067 s** (`QA_RAKE.hit`); she lands 56 of her lengths (1.6 tiles) on |
| the wind-down | driven on into the rock to f36, mantled to f44, hops back f44–f52, her stand at f56 |
| what it rakes | a wedge from **0.2 to 3.4 tiles** before her, **0.65 to either side and 0.25 more a tile** (0.7 at her feet, 1.5 at its end): `rakeStrikes` |

### HER GUST, NO DROP-PUSH (`gust`; old: 1.45 s, its clap at 0.68, out to 5.5, 1.2 and 0.45 more a tile; 3.4 tiles' shove)

Reared to her full height, her wings drawn far back and up, trembling, hissing; its cone marked on the rock in **nine rays running
straight out from her**, big chevrons along them pointing away from her, marching outward, beating faster. Clapped forward in two
frames: the blast races straight out along every ray (grit, her torn feathers and the cult's embers, each along its own ray, never
sideways); she is rocked back by her own blow. So it is seen to shove you straight away from her.

| | |
|---|---|
| the move | **2.0 s** (frames 0–60) |
| the wind-up | drawn back by f14, HELD **f14–f30**; its cone marked from f8 |
| the strike | **f30–f32**, the clap at **1.067 s** (`QA_GUST.hit`) |
| the wind-down | rocked back to f40, settled by f60 |
| what it strikes | before her from -0.3 out to **7.0 tiles**, **1.6 to either side and 0.6 more a tile**: `gustStrikes` |
| the shove | **straight away from her** (along the line from her through the hero), **4.0 tiles** at her feet and less further out (`4.0 × (1 − d / 9)`), never less than **1.5**, over **0.4 s**: `gustShove` |

The main chat makes the push never toward an edge (his “Yes, no drop-pushes”): the game's push is already straight away from her
(game/act1_rules/queen.ts, `queen:gust`); where that would carry the hero toward the drop, the art chat's suggestion is to slide him
along the edge instead (or not shove him at all), so that no gust can ever put him nearer the drop than he was.

### HER DIVE (`dive`; old: 2.2 s, her strike at 1.08, 2.86 tiles out, within 1.1, her line 0.6 to either side)

Up off the rock and out of sight; up there she turns over and HANGS NOSE DOWN, her wings swept back, trembling, while her line is
marked on the rock (its edges, chevrons down it, a ring where she will strike closing in, her shadow growing in it). Down her line in
two frames, talons first, into the rock 4 tiles out, her wings flung open to brake: held a tenth in the crater (cracks thrown out,
lit from under, then scorched). She rips free and beats home.

| | |
|---|---|
| the move | **2.8 s** (frames 0–84) |
| the wind-up | crouched by f9, off the rock at f10, a hard wingbeat up to f15, **up out of sight and out of reach f14–f46**, HELD nose down **f29–f46**; her line marked from f10 |
| the strike | **f46–f48**, her talons in the rock at **1.6 s** (`QA_DIVE.hit`), held to f51 |
| the wind-down | ripped free by f57, beating home to f78, her stand at f84 |
| what it strikes | within **1.6** of where her talons strike, **4.0 tiles** out (140 of her lengths: her body 132 on, her talons 8 more), and on her line from 1.0 to there, **0.9 to either side**: `diveStrikes` |

### HER CALL (`call`): the game's own, kept as it is.

### THE ECLIPSE (`eclipse`, new)

Bowed low, her wings drawn in; then flung up, reared to her full height, her wings spread to their widest, her beak to the sky,
SCREAMING: HELD, shaking, while her flock gathers and the light dims. Her wings swept down in two frames: her flock POURS OVER THE
LEDGE from the drop behind her and the light goes in a few frames. The ledge is dark but for **three pools of light drifting slowly
across it**; out of the dark, a vulture dives at the hero whenever he is outside every pool, each dive's line marked on the rock
first (a line from where it comes in to where he stood, chevrons down it, a ring at its end, beating faster), then down it in two
frames, smeared, held a tenth, pulled out up into the dark. Then her flock scatters and the light comes back.

| | |
|---|---|
| her summoning | **3.0 s** (frames 0–90): bowed by f8, flung up by f17, HELD screaming **f24–f50** (the light dimming to 82%) |
| the strike | **f50–f52**, at **1.733 s** (`QA_ECLIPSE.hit`) the flock pours over; the light goes over **0.2 s** (six frames) |
| the dark | **8.0 s** from her strike; the light back over 0.3 s as the flock scatters |
| readable | the rock darkened to **34%** (`DARK_FLOOR`) under the flock's violet, never black; her fire and eyes, her pink edge and the knight's cyan kept; the figures darkened less than the floor; the lip of the drop still pale |
| the pools | **3**, **1.7 tiles** round, drifting **0.4 tiles a second**, all the same way round (never meeting), opening over 0.3 s: `poolsAt`, `lightAt`, `inPool` |
| the dives | while he is outside every pool, one every **1.4 s** (the first 0.8 s after the dark falls); its line marked **0.7 s** first, from **4.5 tiles** off to where he stood; down it in two frames; it strikes within **0.9** of that spot, and along the last **1.6 tiles** of its line **0.45 to either side**. A pool is never dived at; a dive already marked still lands on its spot |

For the rules (a suggestion; damage the rules' own): a fifth act, `queen:eclipse` (clip `eclipse`, long 3.0, hit 1.733, a long
cooldown, never twice in a row); in the dark she keeps to her spot and her rake (no gust, dive or call in it), so that the fight is
the pools and the dives; the dives are effects, not monsters (they cannot be struck), each a vulture of the game's own drawn along
its line (`paintVultureLine` for its mark; the vulture's own dive frames, `vultureFrame('attack', ...)`, down it, as the scene does).

### THE CRAWLER'S LEAP-DRAG: a note for the main chat (no art changed)

His pick has “the crawler drags you to itself”. Its pictures already show that: its leap comes down on the hero and HOPS BACK TO
WHERE IT STOOD (art/ledge_crawlers.ts); no picture of it shows the drop. Only its rules drag toward the drop
(game/act1_rules/crawler.ts, `crawler:leap`: `dropNear`, “toward the drop (the nearest edge of the Ledge Road)”). So: drop the
`dropNear` way and always drag back with it (`-m.fx, -m.fy`, the way it hops), as its pictures have it.

## The checks

`tests/queen_action.test.ts` (13 tests, all passing):

1. the switch off; nothing of the game imports the mock-up; her stand, hop, call, struck and death the game's own (the very same
   poses); her pictures as the game holds a monster (`makeQueenActionArt`);
2. **the game's frames the same**: every frame the game shows of her, both ways round (art/carrion_queen2_moves.ts `makeQueen2Art`,
   as art/act1_figs/queen.ts hands her over), hashes as on a8d862a (tools/action_f7_queen_hash.ts): **`d41a8cbde1d948d1`**;
3. every frame of her four new moves, from in front and from behind: crisp, her pink edge, no cyan, every light the cult's fire,
   **nothing cut off** at her canvas's edge;
4. THE BOSSES' REVIEW, written out for her as tests/carrion_queen2.test.ts writes it (she is a bird on her own skeleton, not on the
   heroes' bones, so art/boss_checks.ts `checkBoss` cannot take her: the same rules, rule by rule): **FLOOR** (nothing under the rock),
   **SLIDE** (a foot down stays where it came down), **THROUGH** (no leg through the other, no wing's bones through her body), **JERK**
   (outside the strikes, nothing leaps in a frame), **JUMP** (her stand, from any of its frames, into each new move and back: under the
   review's 3 game pixels), **BLOW** and **ALIVE** (held, trembling, never still; followed through), and his **STRIKE** (two frames,
   more than 2.2 times faster than anything else of the move, landing on its last frame, smeared then only);
5. the numbers: every area bigger than her old one, her dive further, her talons landing where the numbers say;
6. what her moves do to her eyrie: marked in her pink while she winds up, struck, then gone; crisp; no cyan; her gust's rays straight
   out from her and its shove straight away from her, harder the nearer; the Eclipse's dark coming in six frames and going, readable
   (darkened, never black), its pools lit, drifting at their pace, never meeting.

Changed outside these files (no frame of the game's changes): tests/carrion_queen2.test.ts, its “only her figure imports her”
check skips art/carrion_queen_action*.ts.

## The switch, and bringing it in

- `QUEEN_ACTION` (art/carrion_queen_action.ts), `{ on: false }`. Nothing of the game imports the file. `makeQueenActionArt()` is her
  pictures with these moves, as the game holds a monster (as `makeQueen2Art`: her rake the `attack` clip, `gust`, `dive`, `call` and
  the new `eclipse` among her moves, her death and struck the game's own). `queenActionPose`, `queenActionPainted` her frames.
- What her moves do to her eyrie is painted by art/carrion_queen_action_fx.ts onto plain pixels through `at` (a floor point and a
  height to the picture): `paintRakeMarks`, `paintGustMarks`, `paintDiveMarks`; the Eclipse: `eclipseDark`, `poolsAt`, `lightAt`,
  `darkened` (a pixel darkened, its glows kept), `paintPoolRims`, `paintVultureLine`. The rules' numbers are there by name
  (`QA_RAKE`, `QA_GUST`, `QA_DIVE`, `QA_ECLIPSE`) with what strikes (`rakeStrikes`, `gustStrikes`, `gustShove`, `diveStrikes`, `inPool`).
- To bring it in (the main chat's):
  - HER FIGURE (art/act1_figs/queen.ts): `make: () => (QUEEN_ACTION.on ? makeQueenActionArt() : makeQueen2Art())`, the same wrapping
    after it (her death among her moves as `fall`, `reel` among them); `QUEEN_ACTION` among its switches.
  - HER RULES (game/act1_rules/queen.ts `QN`, `QN_ACTS`), each as its table says: rake long 1.867, hit 1.067, the wedge
    (`rakeStrikes`), she lands 1.6 tiles on; gust long 2.0, hit 1.067, far 7.0, wide 1.6, spread 0.6, push 4.0 (least 1.5, over 0.4 s),
    straight away from her and never toward the drop; dive long 2.8, hit 1.6, up out of reach 0.467–1.533, at 4.0, r 1.6, line 1.0,
    half 0.9; `queen:home` the new dive too (its HOME_AT within her time up out of sight); the Eclipse a new act, as above.
  - HER EFFECTS (render/act1_fx/queen.ts): the painters above onto a picture laid on the floor layer; for the Eclipse, the scene
    darkened point by point by `lightAt` (the floor more, the figures less, glows kept: `darkened`), the pools' rims, the flock
    pouring over and wheeling high (the game's vultures, darkened), the dives (their lines and the vultures down them).

Made by: `tools/action_f7_queen_film.ts` (the film), `tools/action_f7_queen_sheet.ts` and `tools/action_f7_queen_captions.py` (the
sheet), `src/dev/action_f7_queen_scene.ts` (the scenes, on a stand-in eyrie), `tools/action_f7_queen_hash.ts` (the hash).

## For him to decide (the art chat's to ask)

- The Eclipse's dark: the rock at a third of its light (readable, as the brief asks), or darker still for more dread.
- How long the dark lasts (8 s) and how often she can call it.
- The pools: three, 1.7 tiles round, drifting 0.4 tiles a second; or fewer and smaller, moving faster, for a harder dance.
- The gust: shoved straight away from her, 4 tiles at her feet; where that would be toward the drop, slid along the edge (the art
  chat's suggestion) or not shoved at all.
- The rake's gouges of fire out to 3.4 tiles (her talons land at 1.6): bigger than her body, for Movement 9's bigger areas.
