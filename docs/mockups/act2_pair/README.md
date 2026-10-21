# Floor 13's double boss, the Scraper and the Quill, in place of the Palimpsest (a mock-up, handed back to the main chat)

The art chat's branch `mockup/act2-palimpsest`, from `v23` at d9c0bcb (23.2 as live). Nothing here is in the game: the
switch `PAIR_ON` (src/art/scraper.ts) is off and nothing of the game imports these files. No file of the game's is
touched; only the pair's own files, their dev page (src/dev/preview_pair.ts), their test (tests/pair.test.ts), and
tests/new_mobs3.test.ts's list of the art chat's mock-ups (the four new files added to it).

## What he asked, in his words

To the art chat, 20 Oct 2026, 14:14 Pacific: “I’d like the palimpsest to be something different.  There’s too many
humanoid looking enemies”. Asked as pop-ups, his answers: “I’d like a double boss.  What ideas do you have for two bosses
at the same time”; offered four pairs, “Scraper and Quill (Recommended)”; at 14:46, “New attacks for sure tho” and “And
have them team up for a combo attack as well”; to the moves offered (below), “Sounds good.  But make the hit boxes on the
attacks, and the attacks themselves big”; shown their look standing beside the knight, “Yes, animate them
(Recommended)”. Their moves were then sent him as videos (MP4).

**THE HIT AREAS: HIS WORD IS THAT THEY BE BIG.** Every floor mark in src/art/pair_shots.ts is drawn as big as its blow,
and the game's hit area for each should be its mark: where the mark is, the blow lands. The sizes are below.

## The two

- **THE SCRAPER** (src/art/scraper.ts): a giant crayfish of sodden, layered pages, about four tiles from its claws' tips to
  its tail fan, its back under the knight's head. Its shell plate on plate of wet grey paper written over in the Order's
  ink, the old writing under it where the plates part, the stolen words burning pink in it; two great claws of the
  Order's ink; long antennae; eyes on stalks burning pink. It scrapes a page clean.
- **THE QUILL** (src/art/quill.ts): a great heron of clean white pages, its head well over the knight's, its body at his
  head; page over page of white vellum written fresh in a fine black hand; long legs and crest of the Order's ink; its
  beak a long steel pen nib, dripping ink; its eyes burning pink. It writes over what the Scraper scrapes.
- What they are made of: src/art/pair_skins.ts. Both painted from their own solids (not the heroes' bones), in the same
  painter as the canyon scorpion (art/new_mobs3.ts paintBits). Nothing on them glows but the enemy's pink and gold.

## How the game holds them

`makeScraperArt()` and `makeQuillArt()`, as the game holds a monster's pictures (art/actor_types.ts `ActorArt`), from in
front and behind. `scraperLong(move)` and `quillLong(move)` say each move's length. Canvases: the Scraper SR_CANVAS 780 by
560, its floor point at (390, 350); the Quill QL_CANVAS 760 by 760, its floor point at (380, 560). Times are seconds from
the move's start; clips at 30 frames a second unless said. Tiles are the floor's; "ahead" is along the way it faces, "its
left" its own left (on the floor's grid, facing (dx, dy), its left is (dy, -dx)).

### The Scraper

| move | clip | long | the warning | the blow | what is yours |
|---|---|---|---|---|---|
| stand | idle, 24 frames at 10 (SR_STAND) | 2.4 s loop | | | |
| walk | walk, 12 frames at 12 (SR_WALK) | 1.0 s loop | | | carried at SR_PACE 1.0 tiles a second |
| CLAW SNAP (basic) | attack (SR_SNAP) | 1.0 s | 0.16 to 0.36 | **0.5 s** | its fingers' tips about 3.9 tiles ahead |
| THE SCOUR | moves.scour (SR_SCOUR) | 2.6 s | 0.32 to 0.82 | the slam at **1.0 s**; the claws sweep in 1.0 to 1.5 | |
| THE BACKWARD RUSH | moves.rush (SR_RUSH) | 1.9 s | 0.18 to 0.54 | the tail flips at 0.66; **carry it back RUSH_TILES 5 tiles between 0.7 and 1.2 s** | who is in its lane |
| THE PALIMPSEST, its half | moves.strip (SR_STRIP) | 2.6 s | 0.3 to 0.82 | the slam at **1.0 s**; the strip runs out 1.0 to 1.5 | when the Quill swoops |
| struck | reel (SR_REEL) | 0.55 s | | | |
| death | die (SR_DIE) | 3.2 s | | claws drop by 0.4; sags 0.3 to 1.0; its plates peel off and fly 0.8 to 2.6, the stolen words going free; still by 2.9 | |

Every move but the walk begins and ends as it stands; the rush ends where the game has carried it.

### The Quill

| move | clip | long | the warning | the blow | what is yours |
|---|---|---|---|---|---|
| stand | idle, 30 frames at 10 (QL_STAND) | 3.0 s loop | | | |
| wade | walk, 12 frames at 8 (QL_WALK) | 1.5 s loop | | | carried at QL_PACE 1.1 tiles a second |
| THE NIB STAB (basic) | attack (QL_STAB) | 1.3 s | 0.16 to 0.44 | **0.6 s**, the nib in the floor STAB_AT 2.4 tiles ahead; held to 0.82 | |
| INK LINES | moves.lines (QL_LINES) | 2.6 s | 0.2 to 0.54 | three strokes, **0.7 to 0.92, 1.02 to 1.24, 1.34 to 1.56**, each writing a line; each line bursts 0.6 s after its stroke ends | |
| OVERWRITE: taking off | moves.takeoff (QL_TAKEOFF) | 0.9 s | | springs at 0.34; up at the end as its flight begins | |
| flying | moves.fly, 12 frames at 24 (QL_FLY), a loop | 0.5 s a beat | | | carried at QL_FLY_PACE 4.5 tiles a second; its body QL_FLY_Z 100 up |
| landing | moves.land (QL_LAND) | 0.8 s | | feet on the floor at 0.45 | |
| writing | moves.write, 30 frames at 30 (QL_WRITE), a loop | 1.0 s a round | | | **heal the Scraper while it plays**; stop it when the Quill is struck (play its reel) or the writing burns |
| THE PALIMPSEST, its half | moves.swoop (QL_SWOOP) | 2.6 s | 0.2 to 0.5 | springs at 0.55; **carry it SWOOP_TILES 8 tiles along its facing between 0.7 and 1.8 s**; its nib on the floor SWOOP_NIB 1.79 tiles ahead from about 0.78 to 1.62; lands at 2.0 | |
| struck | reel (QL_REEL) | 0.5 s | | | |
| death | die (QL_DIE) | 3.4 s | | a shriek with no sound, its wings flung open, 0 to 0.36; sinks, its legs folding, 0.36 to 1.5; its neck falls across the floor 1.1 to 2.0; its pages peel off and blow away 0.7 to 2.7, the stolen words going free; still by 3.0 | |

Every move but its flight begins and ends as it stands: taking off ends as its flight begins, its flight begins as its
landing does, and its landing ends as it stands.

## What they do to the floor: src/art/pair_shots.ts (the hit areas)

Drawn in the game's own pixels, as art/censor_shots.ts: `at` a point of the floor on the screen (from tiles); (x, y) the
monster's floor point; (dx, dy) its facing. Each warning takes `k` from 0 to 1 over its warning.

- **CLAW SNAP**: `drawSnapWarn` through the warning, `drawSnap` from the blow (SNAP_FOR 0.9 s). THE HIT AREA: a circle
  SNAP_R **1.15 tiles** round SNAP_AT, **3.4 tiles ahead and 0.3 to its right** (its left claw snaps shut across before
  it).
- **THE SCOUR**: `drawScourWarn` through the warning, `drawScour` from the slam (SCOUR_FOR 1.8 s). THE HIT AREA: the whole
  fan before it, out to SCOUR_REACH **4.0 tiles**, SCOUR_HALF **82 degrees** either side of its facing; its claws come
  down at the fan's two edges at the slam and sweep in to its middle by 0.5 s after (strike as each claw passes, or the
  whole fan at once: yours).
- **THE BACKWARD RUSH**: `drawRushWarn` through the warning, `drawRushWake(…, t, gone)` from 0.7 s (its wake, RUSH_WAKE_FOR
  1.4 s). THE HIT AREA: the lane behind it, RUSH_LANE **7.4 tiles** back from where it set off (the 5 tiles it goes and its
  tail past them), RUSH_HALF **1.3 tiles** either side.
- **THE NIB STAB**: `drawStabWarn(…, STAB_AT, k)`, `drawStab(…, STAB_AT, t)` (STAB_FOR 1.0 s). THE HIT AREA: a circle STAB_R
  **1.05 tiles** round where the nib goes in, **2.4 tiles ahead**.
- **INK LINES**: `drawInkLine(…, i, t)` for each line `i` from its stroke's start: written across the floor (line 0 and 2
  from its right to its left, line 1 back) in its stroke's 0.22 s, lying wet and burning pink (the warning) for
  LINE_BURST_AFTER **0.6 s**, then BURSTING for LINE_BURST_FOR 0.5 s; its stain gone LINE_STAIN_FOR 1.4 s after. THE HIT
  AREAS: three bands across its facing, LINES_AT **1.8, 3.3 and 4.8 tiles ahead**, each LINE_LONG **5.2 tiles** long (its
  middle on its facing; a little slanted, 0.25 tiles from end to end for the first and last), LINE_HALF **0.45 tiles**
  either side; each strikes as it bursts. Between them about 0.6 tiles of floor to stand in.
- **OVERWRITE**: `drawOverwriting(g, sx, sy, t)`, in screen pixels over the Scraper's back while the Quill writes: the
  Order's fresh writing in pink crawling over it and sinking in. No hit area: it heals.
- **THE PALIMPSEST (THE COMBO)**: `drawStripWarn` through the Scraper's warning; `drawStrip(…, t, written)` from its slam
  (the strip runs out over STRIP_RUN 0.5 s, then lies bare; `written` 0 to 1 how far the Quill has written down it, from
  its far end); `drawStripBurst(…, t)` from the burst. THE HIT AREA: the strip, from STRIP_FROM **3.0 tiles** before the
  Scraper for STRIP_TILES **6 tiles**, STRIP_HALF **0.85 tiles** either side; it bursts STRIP_BURST_AFTER 0.45 s after
  the Quill's swoop is carried home (its `stop`), the burst running along it as it was written, from its far end to its
  near end, in STRIP_BURST_RUN 0.35 s, each place bursting for STRIP_BURST_FOR 0.5 s (strike as it passes); its stain
  gone STRIP_STAIN_FOR 1.6 s after.

## The combo and the Overwrite, laid out (as the film shows them: src/dev/preview_pair.ts `film:floor`)

- **THE PALIMPSEST**: the Scraper plays `strip` where it stands. The Quill must be beyond the strip's far end, facing back
  down it toward the Scraper, its floor point **11.4 tiles** before the Scraper on its facing (3.4 + SWOOP_TILES), before
  it swoops: fly it there first (takeoff, fly, land) or have it waiting. Start its `swoop` so that its `go` (0.7 s) comes
  after the strip has run out (the Scraper's 1.5 s): in the film, 0.9 s after the Scraper begins. Carried 8 tiles toward
  the Scraper between 0.7 and 1.8 s, its nib writes the whole strip from its far end (9.0 tiles) to its near end (3.0)
  and lifts; it lands **3.4 tiles** before the Scraper, short of its claws. The strip bursts 0.45 s later.
- **OVERWRITE**: fly the Quill (takeoff, fly, land) to stand **WRITE_AT 1.85 tiles** from the Scraper's middle, beside it,
  facing it; it writes with its nib on the Scraper's back, about 30 picture units up (WRITE_AT.up). In the film it comes
  from behind the Scraper and faces toward the eye, so it looms over the Scraper's back. Heal while `write` plays; a hit
  on the Quill stops it (play its `reel`); and what the hero's fire does to the fresh writing (it burns, his doc's “Fire
  words shine here”) is yours.

## What is yours

How hard each blow hits; when each of them uses which move and how often; who is struck by what and when (each mark is
its hit area); the Overwrite's healing (how much, how fast), and what stops it; where the Quill goes for the Palimpsest and
when; how the two share the fight (their lives, one dying first: each has its own death); their room (measure it,
tools/scenarios/act1_room.mjs); and taking the Palimpsest out of floor 13 (art/act1_figs/palimpsest.ts,
render/act1_fx/palimpsest.ts, game/act1_rules/palimpsest.ts) for these two.

## Checks

tests/pair.test.ts: (1) a mock-up, nothing of the game imports it; (2) every other frame of every move of both, from in
front and behind: crisp, their pink edge while they live and none dead, nothing cyan, every light the enemy's, their eyes,
nothing cut off; (3) their sizes; (4) FLOOR: nothing of either under the floor in any frame (their tail, antennae and
claws kept off it: art/scraper.ts `offTheFloor`, `posed`); (5) JERK: nothing leaps but in a blow, the loops close; (6) JUMP:
every move begins and ends as it stands, or hands over as it should; (7) the blows land where their marks are, and the
marks are big; (8) the marks drawn, never cyan; (9) as the game holds them.

Dev page: src/dev/preview_pair.ts: `look` (the two standing beside the knight), `film:scraper` and `film:quill` (every move,
from in front and behind), `film:floor` (every attack on the floor with its mark, the knight for scale, the Overwrite and
the Palimpsest), `poses:<who>:<move>@<t>,…` (for checking).
