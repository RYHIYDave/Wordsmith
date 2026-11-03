# The Physician: every move done the action way (mock-up; branch `art/action-f14-physician`)

An art helper's work on `art/action-f14-physician` (from `art/action-f12-ratking` 71e08ef: all the action work before). Nothing here
is in the game until the main chat puts it there, on his yes. All of it is **behind one switch that is off**,
`PHYSICIAN_ACTION = { on: false }` (art/physician_action.ts): with it off every frame the game shows of the Physician, and all it
draws of his moves, is the same, pixel for pixel (hashes below). His old moves are kept as they are (art/physician.ts,
art/physician_moves.ts, art/physician_shots.ts).

## His words

- His review of every enemy, 31 Oct 2026: offered Ether, he asked “Anything unique we can do?”; offered Diagnosis (a brass lens's
  light tracking you, filling a mark; break its line behind beds and pillars; full, he operates, one huge strike) or Stitches, he
  answered “Diagnosis (Recommended)”.
- His rulebook's Monsters 9, Action, like a movie (his yes, 1 Nov): every attack Movement 9 with bigger areas. Under his rules
  already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning quick”), and for the
  enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for
  the extra time the player gets to evade”).

## The pictures (`pictures/`)

- `physician_action.mp4` (1200 × 676, 55.0 s, 30 a second, H.264 yuv420p, captioned): THE DIAGNOSIS OVER THE WHOLE THEATRE FROM
  ABOVE (the game's own pixels, him from behind: the knight in the open, ducking behind a bed as the mark nears full, out, behind a
  pillar as it drains, caught in the open; full: the field marked, he winds up, the knight runs out of it, the strike burns it);
  the Diagnosis and the operation close, from in front and from behind; the rap, the draw and the rounds, from in front and from
  behind (twice the game's pixels); then the strikes at half speed (the operation, the rap, the lunge, the three raps).
- `physician_action_sheet.png` (1200 × 7380): the Diagnosis over the whole theatre at four moments (found, hid, full, the strike);
  HIS OLD TONIC beside it; the Diagnosis and the operation close, from in front and from behind; key moments of the rap, the draw
  (and the word taken), the rounds from in front, and the whole ring of the rounds from behind.

The theatre is a stand-in (src/dev/physician_action_scene.ts): 17 tiles each way, the theatre's dark oak boards and sawdust, oak
panelling and limewash on its two far walls; the game's own iron ward beds and operating table (art/floor14.ts); and **five
cast-iron pillars, painted in the scene file only: the game's theatre has no pillars yet** (see "For him to decide").

## The moves (seconds, and frames at 30 a second; tiles from where he stood as the move began)

Every blow: a big wind-up HELD (the warning, the cane's ferrule or the quill glinting pink); the strike in **two frames**, smeared
with after-images along the way it came (`phSmeared`: the strike's frames and the one after); a big wind-down.

### DIAGNOSIS (`diagnose`, in place of the tonic; old tonic: three phials flung, clouds of the Hush 1.25 tiles round lying 4 s)

The syringe thrust through his belt; a great brass lens drawn from his coat and raised before his beak at arm's length; he peers
through it, his beaked head cocking as a bird's. Its BEAM OF PALE LIGHT (a cone, warm, gold at its edges) finds you and follows you
across the theatre a breath behind; A MARK fills while you stand in its light: a ring and reticle on the floor round you, and a
little brass dial over your head, filling round in his pink to gold. BEDS, THE OPERATING TABLE AND PILLARS throw hard shadows down
the beam: behind them its line is broken and the mark drains.

| | |
|---|---|
| the move | syringe to belt by 0.2 s (f6); the lens out of his coat at 0.4 (f12); raised by **0.733** (f22) |
| the look | the frames **f22–f70 (0.733–2.333 s) loop** (1.6 s round, both ends the same): the game holds him peering as long as it likes |
| lowered | if the mark never fills: the lens back in his coat at 2.667 (f80), the syringe taken up at 2.933 (f88), his stand by 3.267 (f98) |
| the beam (`BEAM`) | from the lens (0.84 tiles before him, 0.31 to his left, 2 up); **30 degrees across**, out to **18 tiles**; its middle swings after you with a lag of **0.22 s** |
| the mark | fills in **2.2 s** standing in the light; drains in **1.6 s** out of it; its ring 0.85 tiles round you |
| the line | broken by any bed's or the table's footprint (a box) or a pillar (a circle, 0.32 round): `blocked`, `inLight` |
| in the film | full at 7.48 s into the Diagnosis (the knight hid twice) |

### HE OPERATES (`operate`: the Diagnosis's end once the mark is full)

From the look's own pose: the lens flung up over his head, FLARING (gathering its light, burning white-gold), his instruments
FANNED OUT of his right fist round the cane (scalpels, lancets, a bone saw), his arm hauled back, the whole of him trembling ever
harder: HELD. THE FIELD round where you stood as the mark came full is marked like a surgeon's cuts (a ring and a cross, stippled,
beating faster). Slashed down across before him in two frames, the lens snapped down at the field: ONE HUGE STRIKE, the light through
the lens burns the cuts into the floor, the field blinding white two frames, the scorched cuts glowing and smoking after.

| | |
|---|---|
| the move | **3.667 s** (frames 0–110), from the look's pose (never from his stand) |
| the wind-up | the fan open f3–f12; flung up by 0.4 s (f12), **HELD f12–f40 (0.933 s)** |
| the strike | **f40–f42**, its blow **1.4 s** (`OP_HIT`); bent over it to f64, the fan shut f62–f70, up by f78, the lens away f86, the syringe back f94 |
| the field (`FIELD`) | **2.5 tiles round** where you stood when the mark came full; marked from then (**1.4 s** before the strike); the scorch lies 1.4 s |

### THE RAP (`attack`; old: 1.5 s, its blow at 0.6, the ferrule 1.22 tiles before him, a line 0.55 to either side)

The cane hauled up high over his right shoulder, up on his toes, arched back, trembling: HELD. Brought over and down in two frames at
the end of a long step (his left foot out 0.77 tiles): the ferrule cracks the boards far before him, a star of cracks runs out round
it, chips and dust thrown up, a ring of dust rolling out.

| | |
|---|---|
| the move | **2.2 s** (frames 0–66) |
| the wind-up | hauled up by 0.4 s (f12), **HELD f12–f26 (0.467 s)** |
| the strike | **f26–f28**, its blow **0.933 s** (`RAP9_HIT`); pressed down to f38, up by f50, his stand by f66 |
| where (`RAP`) | the ferrule **1.9 tiles** before him, 0.15 to his right; THE STAR **1.5 tiles** round it; the line to it 0.6 to either side: out to **3.4 tiles** (old 1.57) |
| the warning | the line and the star marked from 0.25 s (0.68 s before the blow) |

### THE DRAW (`draw`; old: 2.9 s, its blow at 0.9, the quill at 1.87 tiles, the lane to 2.2, 0.5 to either side)

Side-on, sunk low en garde, the syringe levelled, the quill glinting: HELD. The fencer's lunge in two frames, a long one (his left
foot out 1.2 tiles), the quill thrust its whole reach and A NEEDLE OF PINK LIGHT thrust on down the lane past it; held while the
plunger is drawn and the barrel fills (the word's light pulled back up the lane to him); sprung back, the syringe lifted over his
head, the plunger pushed home: YOUR WORD HANGS OVER HIS HEAD until you beat it out of him (the game's own, kept: drawHeldWord).

| | |
|---|---|
| the move | **3.333 s** (frames 0–100) |
| the wind-up | en garde by 0.333 s (f10), **HELD f10–f30 (0.667 s)** |
| the strike | **f30–f32**, its blow **1.067 s** (`DRAW9_HIT`); the quill out to **2.13 tiles** (old 1.87) |
| the lane (`LUNGE`) | to **3.6 tiles**, **0.65** to either side (old 2.2 and 0.5); marked from 0.133 s (0.93 s before); the needle lasts 0.25 s |
| the word | drawn f34–f48; sprung back by f58, held high by f66; pushed home **f68–f76: it hangs from 2.267 s** (`DRAW9.push[0]`; old 2.02) |

### ROUNDS (`rounds`; old: 2.4 s, three raps at 0.62, 0.92 and 1.22, rings of the Hush out to 3.5 tiles in 0.9 s, doing nothing)

Drawn up tall, the cane hoisted high in his fist, slanting before him, his head up: HELD. Rammed down on the boards in two frames,
the body dipping with it; hoisted again (a third of a second), held a breath, rammed again; the third hardest. A GREAT RING OF THE
HUSH rolls out from each rap, thick, pink motes in it. Then the cane swept round the room, pointing: the patients rise (the game's
own, kept: as now, one with each rap in turn).

| | |
|---|---|
| the move | **3.867 s** (frames 0–116) |
| the wind-up | hoisted by 0.333 s (f10), **HELD f10–f26 (0.533 s)**; between raps hoisted over 10 frames and held 4 |
| the raps | strikes **f26–f28, f44–f46, f62–f64**; blows **0.933, 1.533, 2.133 s** (`ROUNDS9_HITS`) |
| the rings (`RINGS`) | from where the ferrule strikes (0.8 tiles before him, 0.38 to his right) out to **6.5 tiles in 0.6 s**, a band **0.55** thick; their reach marked from 0.133 s |
| the sweep | f76–f100, from his right round to his left |

## The switch, and bringing it in

- `PHYSICIAN_ACTION` (art/physician_action.ts), `{ on: false }`. Nothing of the game imports the file. `physicianActionMob()` is
  the Physician with these moves: his stand, walk, struck and death are the game's own (the very same moves); his `attack`,
  `draw`, `rounds` these; `tonic` gone, `diagnose` and `operate` in its place. `makePhysicianActionArt(pace)` holds him as the game
  holds a monster (his canvas bigger, `PH_ACT_CANVAS` 560 × 480, for the cane hauled up over his head, the long lunge, the lens
  flung up and the fan).
- What he sends out is painted by art/physician_action_fx.ts onto plain pixels through `at` (a floor point and a height to the
  picture): `paintRap`, `paintDraw`, `paintBeam` (through `iso`, the floor's diamond, every pixel of the floor lit or shadowed by
  its own line to the lens), `paintMark`, `paintDial` (over the hero's head), `paintShaft`, `paintField`, `paintBurnLine`,
  `paintRounds`; the rules' numbers by name (`RAP`, `LUNGE`, `BEAM`, `FIELD`, `RINGS`) with what strikes (`rapStrikes`,
  `drawStrikes`, `inLight`, `blocked`, `diagnosis`, `fieldStrikes`, `ringAt`, `ringStrikes`).
- To bring it in (the main chat's):
  - THE FIGURE: art/act1_figs/physician.ts `make: () => PHYSICIAN_ACTION.on ? makePhysicianActionArt() : makePhysicianArt()` (and
    its measure of him, top and half, taken again on the new canvas).
  - THE RULES (game/act1_rules/physician.ts `PHYSICIAN_ACTS`, `PHYSICIAN`), as the tables above say: rap long 2.2, hit 0.933, the
    ferrule's mark at the hit (no longer a moment after it), struck as `rapStrikes`; draw long 3.333, hit 1.067, struck as
    `drawStrikes`, the word up at 2.267; rounds long 3.867, raps at `ROUNDS9_HITS` (the patients raised with them, as now), each
    ring hushing whoever it passes (`ringStrikes`: the act's own Hush, as the tonic's clouds did); damage and cooldowns the rules'.
  - THE DIAGNOSIS IN THE RULES (in place of `physician:tonic`; **the beam's line of sight against the beds and pillars is the main
    chat's to run**). What it needs:
    1. Start the `diagnose` clip; from `DIAG.up` (0.733 s) loop its frames `DIAG.loop` while he looks.
    2. Every step: the beam's middle swings toward the hero (`1 - exp(-dt / BEAM.lag)` of the way); the hero is in the light when
       he is within the cone and his line to the lens (0.84 tiles before him, 0.31 to his left) is unbroken (`inLight`); the mark
       fills by `dt / BEAM.fill` in the light and drains by `dt / BEAM.drain` out of it (`diagnosis` does exactly this, for a
       path). THE COVER: every bed's and the operating table's footprint on the floor (their prop tiles will do: a box each), and
       every pillar (a circle 0.32 round) — the theatre has no pillars yet (below). `blocked(a, b, cover)` is a plain test of a
       line against boxes and circles; a cast along the walk grid against the props' tiles would do the same at tile size.
    3. Full: hand over to `operate` at its frame 0, from whatever frame of the look he is at (the review shows no leap from any of
       them), the field locked where the hero stands then; at `OP_HIT` strike whoever is within `FIELD.r` (`fieldStrikes`).
    4. Not full after a while (a suggestion: 8 s of looking), lower it: the rest of the `diagnose` clip from `DIAG.loop[1]`.
  - THE FLOOR (render/act1_fx/physician.ts): the painters above onto a picture laid on the floor layer (the beam, the mark, the
    field, the cracks, the lane, the rings), the dial and the shaft and the burn line over what stands; or their few drawing calls
    turned into the canvas's. `paintBeam` goes pixel by pixel (a test of the line for each): at the game's size it may want doing
    at half size, or as the cone less each cover's shadow wedge.
  - THE THEATRE'S PILLARS: a piece of floor 14's (art/floor14.ts) and their places in the theatre (game/act2/housequiet.ts
    `dressTheatre`), on his yes to their picture: here they are only the scene's stand-in.
- Changed outside these files (no frame of the game's changes; hashes below): tests/physician.test.ts, its import check counts
  art/physician_action*.ts as his own; tests/new_mobs3.test.ts, the two files added to its list of mock-ups.

## The checks

`tests/physician_action.test.ts` (6 tests):

1. the switch off; nothing of the game imports the mock-up; his stand, walk, struck and death the game's own; the tonic gone for the
   Diagnosis (the game's own kept); the game's own moves kept;
2. **the game's frames the same**: every frame of the Physician, both ways round, and what the game draws of his moves, hash as on
   71e08ef (tools/physician_action_hash.ts, run on 71e08ef's own files and on this branch): **physician `a760e8052487ba6c`, his
   moves drawn `0b3243670d124c61`**;
3. every frame of the five new moves, from in front and from behind: painted, the enemy's pink edge, crisp, no cyan, **nothing cut
   off**;
4. **THE WHOLE BOSSES' REVIEW** (art/boss_checks.ts `checkBoss`: SLIDE, FLOOR, ARM, THROUGH, JERK, JUMP, BLOW, HIPS, STRIKE),
   every frame of every new move, from in front and from behind, each rap of the rounds its own, every handing over (his stand into
   each and back; **from every frame of the look into his operation**): **nothing found**;
5. Movement 9 and the numbers: each of the six strikes two frames, held before it, a flash, smeared then only, landing on its last
   frame; each wind-up held, his operation's near a second; the ferrule, the quill, the lane, the rings and the field bigger and
   further than the old;
6. what he sends out: crisp, no cyan, the enemy's pink, nothing cut off, nothing after; THE DIAGNOSIS: the line broken by a pillar
   and a bed and only by them; in the light only in the cone with the line whole; the mark full in 2.2 s in the light, drained
   behind a pillar, the beam following a running hero.

Also: `tsc` clean; `tests/physician.test.ts`, `tests/new_mobs3.test.ts`, `tests/act2_physician.test.ts` and
`tests/crier_action.test.ts` as before (see the final report for the run).

Made by: `tools/physician_action_film.ts` (the film), `tools/physician_action_sheet.ts` and `tools/physician_action_captions.py`
(the sheet), `src/dev/physician_action_scene.ts` (the scenes), `tools/physician_action_hash.ts` (the hashes),
`tools/physician_action_peek.ts` and `tools/physician_action_review.ts` (the helper's own looks while drawing).

## For him to decide (the art chat's to ask)

- THE PILLARS: the game's theatre has beds and the operating table about it but no pillars; the Diagnosis wants both. The pillars
  here (cream-painted cast iron holding up the gallery) are the scene's stand-in: a piece for the floor, drawn properly, on his yes.
- The Diagnosis's numbers: the mark full in 2.2 s of standing in the light, draining in 1.6 s; the beam 30 degrees across; how long
  he looks before giving up (8 s suggested); how hard the operation hits (one huge strike: a heavy blow, 2.5 tiles round).
- ROUNDS' RINGS now do something (the old did nothing): each hushes whoever it passes, out to 6.5 tiles; or harm too.
- THE DRAW reaches further (a needle of light down the lane to 3.6 tiles): a word is taken from further away than before.

## 2 Nov 2026: THE MARK FILLS FASTER, AND A BIGGER OPERATION (branch `art/action-fixes`)

**Where this and the text above differ, this holds.** His rap, draw, rounds, the Diagnosis's look and his body through the operation
are as approved (none of his own frames changes: only what he sends out); the pillars stay as drawn (his “Yes, pillars (Recommended)”).

His words, 2 Nov 2026, going through the night's films with the art chat, asked about him: “It needs a little more excitement, and the
meter needs to fill faster”. Told him the mark fills in about 1.4 s (was 2.2); it drains as before. For the excitement, his pick:
“Bigger operation” (offered as: when the mark fills, the room goes dark but a spotlight on you, and his instruments close in round
you).

**THE MARK** fills in **1.4 s** standing in the light (`BEAM.fill`; was 2.2, `BEAM_FILL_WAS`); drains in 1.6 s hid (as before).

**THE OPERATION, BIGGER** (`OPERATION`, `ESCAPE`, `opDark`, `opLight`, `litRGB`, `paintSpotEdge`, `paintSpotCone`, `toolsAt`,
`paintTools`, `layTool`, `TOOL_KINDS`; art/physician_action_fx.ts). The moment the mark is full THE THEATRE PLUNGES DARK (three
frames: sudden, as the Queen's Eclipse darkens but all at once; what glows keeps its glow: his eyes, the lens, the enemy's pink), and
ONE HARD SURGICAL SPOTLIGHT falls on where you stood, from his lens flung up over his head: a cone of its white down through the dark,
the field lit hard, a crisp white edge round it, the surgeon's marks (the ring and the cross) on it, everything else dark. HIS
INSTRUMENTS are flung out of his coat, spinning, over in an arc to the edge of the light, and ring you there, a dozen of them, each a
real one drawn crisp in steel, ebony and brass (scalpels, bone saws, forceps, curved needles threaded, amputation knives), pointing in
at you, trembling ever harder, glints of his pink and gold running along their blades, their dark edge the enemy's deep pink: HELD
(the warning: GET OUT OF THE LIGHT). Drawn back a moment; then in TWO FRAMES they close in on the middle from all round, smeared (lines
of his pink, gold and the light's white from where each was): THE ONE HUGE STRIKE (the field blinding white, the cuts burnt in, a burst
where they meet, the game's shake 8); slammed point-down into the boards round the middle, quivering; plucked out and flown back into
his coat as the fan in his fist shuts; the light back. Never cyan.

| (seconds from when the mark came full: his `operate` clip's time) | |
|---|---|
| THE DARK (`OPERATION.fall`, `low`, `rise`; `opDark(t)`) | falls **0.033–0.133 s** (three frames) to **0.2** of the light; held dark through the strike; the light back **1.85–2.2 s** |
| THE SPOTLIGHT (`FIELD.r`; `opLight`) | **2.5 tiles round** where you stood as the mark came full (the field, as before), lit hard (`litRGB` over 1), its edge a thin band a step down, the rest dark |
| HOW LONG TO GET OUT (`ESCAPE`) | **1.2 s** from the dark falling to the close (a hero at the game's 4.6 tiles a second is out from the middle in 0.55 s) |
| THE RING (`OPERATION.count`, `out`, `high`, `size`, `fly`) | **12** instruments, five kinds, flung out **0.1–0.45 s**, each at **2.62 tiles** from the middle (the light's edge and 0.12), **30** picture pixels up, **51** long (1.35 times their 38) |
| HELD (`OPERATION.draw`, `back`) | **0.88 s** round you (0.45 to 1.333 s), trembling harder; drawn back **0.3 tiles** from 1.0 s |
| THE CLOSE (`OP_STRIKE`, `OPERATION.meet`) | **two frames**, 40 to 42 (1.333 to 1.4 s), smeared, to **0.3 tiles** from the middle: `OP_HIT`, **1.4 s**, struck: whoever is within `FIELD.r` (`fieldStrikes`, as before) |
| AFTER (`OPERATION.stuck`, `sink`, `pull`, `home`) | point-down in the boards **0.62 tiles** round the middle by 0.1 s after, quivering; plucked out at **2.0 s** (frame 60), back in his coat by **2.333 s** (frame 70) |
| his body | as approved: the lens flung up flaring, the fan in his fist, his arm hauled back, HELD f12–f40, slashed down f40–f42 |

**Bringing it in** (the main chat's), in place of step 3 above's look: full, hand over to `operate` as before, the field locked where the
hero stands; then
- THE DARK: a dark over the whole room at `opDark(t)` (to `OPERATION.low` of its light, the glows kept), with the spotlight's hole
  `FIELD.r` round the field: as the Queen's Eclipse darkens, its pools one fixed spotlight here (`opLight(dx, dy, t)` gives how lit any
  floor point is; `litRGB` a pixel at it). Things standing in the dark are darkened by their own floor point (the scene does exactly
  this: src/dev/physician_action_scene.ts `diagScene`, `litLaid`).
- THE LIGHT: `paintSpotEdge` on the floor, `paintSpotCone` from the lens (`lensAt('operate', t)`) over what stands.
- THE INSTRUMENTS: `paintTools(p, at, x, y, t, coat, coatFloor, keep)`, twice (those behind the hero before what stands, those before
  him after: `keep` by the picture row of each one's floor point); `toolsAt` says where each is. At `OP_HIT` strike as before.

**The checks** (`tests/physician_action.test.ts`, now 7 tests, passing): tests 1 to 6 as before (his frames hash as before:
`a760e8052487ba6c`, his moves drawn `0b3243670d124c61`; the whole bosses' review of every frame of every move, both ways round, every
handing over: nothing found; the mark full in `BEAM.fill`); **7 (new)**: the mark fills in 1.4 s; the dark sudden, held through the
strike, the light back after; lit hard in the spotlight, dark outside it; out of it in 1.2 s; a dozen instruments of every kind at the
light's edge pointing in; closed in on the middle in two frames, smeared then only; out of his coat after the dark, back in it by the
end; held 0.88 s; and EVERY FRAME of the operation (1/30 s apart, 0 to 2.37 s), the instruments, the spotlight's edge and its cone:
crisp, no cyan, nothing cut off, painted with his pink while they are out; nothing after.

The scenes: src/dev/physician_action_scene.ts (`diagScene`: the dark, each figure lit by its floor point; `diagClose(view, caught)`:
the knight runs out of the light, or is caught in it); the whole theatre's path retimed for the faster mark (he ducks behind the bed
as it nears full, behind a pillar as it drains, caught in the open: full 5.43 s into the Diagnosis; the close ones 4.6 s).

Pictures: docs/mockups/action_fixes/pictures/action_fixes3.mp4 and action_fixes3_sheet.png.

For him to decide (the art chat's to ask): how dark (0.2 of the light; the theatre's walls and beds still faintly seen); the
instruments' size (51 pixels, bigger than life, to read at phone size); whether a hero caught is also thrown or bleeds (the rules').
