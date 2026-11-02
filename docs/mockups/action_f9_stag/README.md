# The Hollow Stag done the action way: the wood closes in, and he bounds round the clearing (mock-up; branch `art/action-f9-stag`)

An art helper's work on `art/action-f9-stag` (from `art/action-f7-queen` 5a3d9fc: the game with floors 1 to 10's new moves and the
Carrion Queen's). Nothing here is in the game until the main chat puts it there, on his yes. All of it is **behind one switch that is
off**, `STAG_ACTION = { on: false }` (art/stag_action.ts): with it off every frame the game shows of the Hollow Stag and of its roots
is the same, pixel for pixel (hashes below). His old moves are kept as they are (art/hollow_stag.ts: only its insides now exported, so
that the new moves are painted by its own painter).

## His words

- 31 Oct 2026, offered “The wood closes in, in place of the root lines: roots burst up from the clearing's edge in rings, closing
  inward until little safe ground is left, then sink away”: “I love this.  It shrinks at 3/4, 1/2, and 1/4.  And I’d like him to
  move around the arena like the horse does in the princess fight.  Really explore the space.  Not EXACTLY like the horse but
  similar”. Read as (told him so): the ring of roots closes in and STAYS at three quarters, half and a quarter of his life, the
  clearing smaller each time; and he bounds all round the arena between blows, using the whole space, like the Princess's steed but
  his own.
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE
  to compensate for the extra time the player gets to evade”); his rulebook's Monsters 9, Action, like a movie (his yes, 1 Nov).

## The pictures (`pictures/`)

- `stag_action.mp4` (1200 × 676, 54.7 s, 30 a second, H.264 yuv420p, captioned): THE WHOLE CLEARING FROM ABOVE (the game's own
  picture pixels, the arena whole, a bar of his life over it marked at 3/4, 1/2 and 1/4): him bounding all round it and stopping to
  stare; the wood closing in at 3/4 (to 80% across), his gore at the knight, who steps back out of its sweep; closing in at 1/2
  (60%), the wall inside sinking as the new one rises; his charge down the clearing's length into the wall, splintering it; closing
  in at 1/4 (40%), the knight caught by it, struck and thrown in; him bounding on in what is left. Then each move close (twice as
  big): his bounds and a stare, the gore and the charge from in front and from behind, the wood closing in; then each strike at half
  speed (three times as big).
- `stag_action_sheet.png` (1200 × 6450): the clearing from above at full, 3/4, 1/2 and 1/4, his bounds in each drawn as a path
  (gold: each bound in the air; pink crosses: where he lands); his bounds and his stare; three moments of the gore, the charge and the
  wood closing in, from in front and from behind, with the knight; HIS OLD ROOT LINES BESIDE THE NEW (drawn by the game's own code).

The pinewood floor in them is a stand-in in floor 9's own colours (its earth, needles, moss and grass), the wood's dark beyond the
clearing; the knight is the game's.

## The moves (seconds, and frames at 30 a second; tiles from his floor point)

Every blow: a big wind-up HELD (the warning), trembling; the strike in **two frames**, smeared with after-images (of his antlers; of
his muzzle, antlers and forefeet as he crashes down out of his bellow; running, of his body); a big wind-down.

### THE WOOD CLOSES IN (`moves.close`, in place of his roots; at 3/4, 1/2 and 1/4 of his life)

He draws in his breath, his ribs swelling, and REARS UP on his hind legs, his head thrown up, his jaw wide, BELLOWING (rings of fog
rolling from his mouth), his forelegs pawing the air: HELD, shaking, while THE NEW EDGE IS MARKED ON THE FLOOR in his pink (two
dashed lines either side of where the wall will stand, chevrons inside them pointing in, beating faster). He crashes down onto his
forefeet in two frames, his head flung down: A WALL OF ROOTS AND THORNY TRUNKS BURSTS UP all round the new edge (thick dark trunks
barbed all over, their points black, the swamp's violet roots arched between them, moss on them; earth thrown up), rippling round
from the side nearest him, over the knight's head; and STAYS. The wall inside it sinks away as a smaller one rises.

| | |
|---|---|
| the move | **3.0 s** (frames 0–90) |
| the warning | the new edge marked from **0 s** (`CLOSE.mark`: 1.4 s before it rises); breath drawn by 0.35, bellowing from 0.55, reared by 0.7, **HELD f21–f40** (0.63 s) |
| the strike | **f40–f42**, the wall bursts up at **1.4 s** (`CLOSE_HIT`); each clump up in 0.16 s, the last of them 0.14 s after the first (`WALL.rise`, `WALL.ripple`) |
| the wind-down | glaring, heaving, the fog pouring out over the ground; on his stand by 3.0 |
| the clearing (`CLEARING`, `clearingAt`) | an ellipse **17 by 20** tiles; from 3/4 of his life **80%** across (13.6 by 16), from 1/2 **60%** (10.2 by 12), from 1/4 **40%** (6.8 by 8) |
| the wall (`WALL`, `wallAt`) | a clump every **0.8** tiles round the edge, **0.5** to either side of it, **76** of his lengths high (the knight 58, his shoulder 68); the wall inside sinks 0.3 s after the new one is up, over 0.7 s |
| caught | whoever is in its band or outside the new edge as it rises is struck and **thrown in**, to **1.0** tile inside the wall along the way to the middle (`thrownIn`) |

### HE BOUNDS ROUND THE ARENA (`walk`, the great stot) AND STANDS TO STARE (`moves.stare`)

Great stotting bounds on stiff legs, all four hoofs landing together and springing off together, his back arched, his head high; as
he lands he JINKS (his body twisted one way, his head whipped the other, shoved aside), and leaves, needles and earth fly up round
his hoofs and lie where they were thrown. Between his blows he bounds all round the clearing: round it the way he is going, swinging
in toward the middle and out toward the edge, jinking as he lands, now and then cutting sharply across; and now and then he lands
HEAVY and STANDS TO STARE: run on over his planted hoofs, sinking deep (a ring of dust: it knocks), then up, stiff, head high, ears
pricked, his eye flaring, still; a stamp, a snort; and off again.

| | |
|---|---|
| the walk (`STOT9`) | **5.5 tiles a second** (old 3); a bound every **0.6 s**, **3.3 tiles** a bound (old 1.1), **46** of his lengths high (old 16); landed **0.13 s** of each; his body twisted **16°** as he lands |
| its frames | **36 at 30 a second**, a round of 1.2 s (two bounds, jinking one way then the other); frame 0 the middle of a landing; he lands at 0.535 and 1.135 s of each round |
| his way (`boundRun`, the pictures' model) | round the clearing, swinging between 45 and 80 hundredths of the way out; jinks of 10° to 28° by turns; a cut of 60° to 100° across now and then; never within 1.3 tiles of the edge; turning only as he lands |
| the stare | **1.8 s**: it begins on a landing (the game stopping him there: carried 0.36 tiles more over the landing, `stareCarry`); deepest at 0.1, up by 0.45, **still 0.5 to 1.3**, a stamp at 1.16, a snort at 1.24; the heavy landing's ring of dust out to **1.2 tiles** |

### THE GORE (`attack`; old: 1.6 s, its blow at 0.8, a strip 2.17 tiles long, 0.9 to either side)

His head dropped low, his antlers cocked to his right, crouched back on his haunches, his right forefoot pawing once, snorting:
HELD, trembling. In two frames he lunges, his forefeet thrown a stride forward, and HOOKS his antlers up and across to his left,
smeared: a sweep before him, its arc marked on the floor in his pink while it is held, three gouges of his gold torn along it as it
lands, earth flung out over it. His head flung up high after; his forefeet stepped back.

| | |
|---|---|
| the move | **2.0 s** (frames 0–60) |
| the wind-up | head down by f9 (0.3 s); his paw lifted f9–f12, struck down f15; **HELD f15–f25** (0.33 s); the sweep marked from 0.1 s |
| the strike | **f25–f27**, the blow at **0.9 s** (`GORE9_HIT`); his forefeet thrown **0.45 tiles** forward |
| the wind-down | flung high to 1.1 s, held to 1.4, forefeet stepped back 1.42–1.8, on his stand by 2.0 |
| its area | a sweep before him from **0.3 to 3.0 tiles**, **150°** across (old: a strip to 2.17, 0.9 to either side); thrown back (a suggestion: 1.4 tiles) |

### THE CHARGE (`moves.charge`; old: 2.7 s, 6 tiles a second from 0.84 to its crash at 1.74, 5.4 tiles)

The lane is marked on the floor from him through where you stood (the red troll's lane, his pink, chevrons down it); his head
dropped, his antlers low, he paws twice, snorting: HELD, trembling. In two frames he bursts off, smeared, earth flung back off his
hind hoofs, and GALLOPS down the lane, his hoofs each down on their own spot as the floor goes by, earth and needles off each; at its
end his antlers SMASH into the wall of roots: held, the trunks there splintered, wood, bark and root flying; he is rocked back,
shakes the splinters off his antlers and steps his hoofs back under him. The wall where he hit it is splintered to stumps and grows
back.

| | |
|---|---|
| the move | **2.8 s** (frames 0–84) |
| the lane | marked from **0.2 s** (0.87 s before he bursts off), **9.6 tiles** long, **0.9** to either side of its middle (old 0.8) |
| the wind-up | head down by 0.25; paws struck down at 0.44 and 0.66; **HELD 0.69 to f30** (0.31 s) |
| the strike | **f30–f32**: carried **1.1** tiles (f31), **2.3** (f32, **1.067 s**: `CHARGE9_HIT`) |
| the run | **12 tiles a second** (old 6) for 0.47 s (`charge9Carry`) |
| the crash | at **1.537 s**, carried **7.94 tiles** (old 5.4), held **0.12 s**; the wall's clumps within 1.3 tiles of where his antlers meet it splintered, growing back over **2.4 s** (`WALL.regrow`) |
| the wind-down | rocked back, shaking his head 1.9–2.4, hoofs stepped back, on his stand by 2.8 |

### THE BELLOW, STRUCK, HIS DEATH, HIS STAND

The game's own, frame for frame (the wolves still answer his bellow).

## The checks

`tests/stag_action.test.ts` (5 tests, all passing, about 2.5 minutes):

1. the switch off; nothing of the game imports the mock-up; **the game's own frames the same**: every frame of the Stag, both ways
   round, and a run of its roots' stretches hash as on 5a3d9fc (tools/stag_action_hash.ts): **stag `f060c17f773e5221`, roots
   `d2069c9f30276b52`**; with the new art his stand, his bellow, struck and his death the game's own, frame for frame; his roots gone,
   the wood closing in and standing to stare in their place;
2. every frame of his new moves, from in front and from behind: painted, the enemy's pink edge, crisp, no cyan, **nothing cut off**
   (his canvas for these 520 × 440, the game's 420 × 400);
3. **THE REVIEW FOR THE OLD RIGS** (art/action_f1_checks.ts `checkKit`: SLIDE, FLOOR, JERK, JUMP, BLOW, HIPS, STRIKE; he is not on
   the heroes' bones, so as the twisted deer was reviewed), every frame of every new move, from in front and from behind, each pair
   of his hoofs as his soles, where the game carries him over the floor and all, every handing over to and from his stand (the stare
   from his walk's landing): **nothing found**; Movement 9: each strike two frames, its blow at its end, held before it, a wind-down
   of a second or more; the stare begins on the very pose his walk lands on;
4. the wall (every kind of clump: rising, standing, sinking, splintered, and the earth at its foot) and the marks (the new edge, the
   gore's sweep and its gouges, the lane): crisp, no cyan, not cut off; the wall standing over the knight's head;
5. the numbers: the clearing at 3/4, 1/2 and 1/4; inside it, clear of the wall; thrown in when caught; the wall with no gap; his
   bounds fast, long and high, all four hoofs down at a landing; the gore's sweep 1.38 times further than the old strip and 150°
   across; the charge twice as fast and half again as far, its lane marked well before.

Also passing: `tests/hollow_stag.test.ts`, `tests/act1_stag.test.ts`, `tests/twisted_deer.test.ts`, `tests/action_f6.test.ts`,
`tests/new_mobs3.test.ts`; `tsc` clean. `tools/stag_action_review.ts` prints the review's findings (none).

## The switch, and bringing it in (the main chat's)

- `STAG_ACTION` (art/stag_action.ts), `{ on: false }`. Nothing of the game imports the files. `makeStagActionArt()` is the Stag as
  the game holds a monster with these moves: `walk` the great stot (36 frames at 30 a second, `walkFps` 30), `attack` the gore,
  `moves.charge`, `moves.close`, `moves.stare`; `moves.bellow`, `idle`, `reel`, `die` the game's own; no `moves.roots`.
- What he makes of the clearing is painted by art/stag_action_fx.ts: `wallClumpPainted(kind, s, layer, gone, broken)` (a clump of
  the wall, 'air' sorted with the figures by its floor point, 'floor' the torn earth under it; each moment painted once and kept),
  `wallAt(k)` (where the clumps stand round the arena's middle), `wallUp` (each one's moment after the blow), `paintEdgeMark`,
  `paintGoreMark`; the lane is the game's own. The numbers are there by name (`CLEARING`, `WALL`, `CLOSE`, `GORE9`, `CHARGE9`,
  `STOT9`, `STARE`) with `clearingAt`, `inClearing`, `thrownIn`, `charge9Carry`, `stareCarry`, `boundRun` (dev/stag_action_scene.ts:
  his way round, as the pictures have it).
- To bring it in:
  - THE BESTIARY (art/act1_figs/stag.ts): `STAG_ACTION.on ? makeStagActionArt() : makeStagArt()`; its size as now.
  - **THE CLEARING'S SHRINKING EDGE MUST BLOCK MOVEMENT** (the rules', game/act1_rules/stag.ts with the floor's walk): from each wall's
    rise to the end of the fight, everything outside `inClearing(x - cx, y - cy, k)` (the arena's middle at cx, cy; `k` 0.8, 0.6,
    0.4) is not floor, for the hero, for the Stag and for the wolves he calls: the game's `free` test (or the level's walk) asked
    that as well. As it rises, whoever is outside it (the hero; a wolf) is struck and thrown in to `thrownIn(...)`. The wolves his
    bellow calls must come out of the wood INSIDE the current clearing (`callWolves` picks its spots: they must pass `inClearing`).
    His charge's clear run (`can`) and his bounds (`clear`) must count the wall as not clear. The wall stays solid where his charge
    splinters it (the stumps are the pictures').
  - THE RULES: `close` in place of `stag:roots`, long 3.0, hit 1.4, played once at each of 3/4, 1/2 and 1/4 of his life (as soon as he
    is free: from his stand, or as a bound lands); the new edge's mark from its start. The gore long 2.0, hit 0.9, its area the
    sweep (0.3 to 3.0 tiles, 150°). The charge long 2.8, its lane marked at 0.2 (9.6 by 0.9), bursting off at 1.067 (carried 1.1 at
    f31, 2.3 at f32), 12 tiles a second to the crash at 1.537 (7.94 tiles); where the wall is nearer than that, the run is cut where
    his antlers meet it (1.5 tiles before his floor point) and the crash's frames (from frame 46) play there; run down in the lane,
    struck at the crash. The stare long 1.8, begun as a bound lands, its heavy landing knocking within 1.2 tiles at its first frame.
    The bellow as it is.
  - HIS WALK: `STAG_GAIT` pace **5.5**, cycle **1.2**; turning and stopping only as he lands (at 0.535 and 1.135 s of each round); his
    way round the clearing as `boundRun` has it (round it, in and out, jinking, cutting across now and then, clear of the wall by
    1.3 tiles), stopping to stare every six to eight bounds, coming at the hero for his blows.
  - THE FLOOR (render/act1_fx/stag.ts): the wall's clumps at `wallAt(k)` round the arena's middle (each `CLUMP9_CANVAS`, its anchor its
    foot), as props sorted by their floor points; the earth at their feet on the floor layer; the marks drawn onto the floor layer.
    The ring at the arena's own edge (`k` 1) is the wood's (in the pictures, the same wall standing from the start).
- Changed outside these files (no frame of the game's changes; hashes above):
  - art/hollow_stag.ts: its colours, its poses' helpers and its painter exported (`export` added; nothing else).
  - tests/hollow_stag.test.ts, tests/twisted_deer.test.ts, tests/action_f6.test.ts: their "only the game's figure imports it"
    checks skip art/stag_action*.ts; tests/new_mobs3.test.ts: the two files added to its list of mock-ups.

Made by: `tools/stag_action_film.ts` (the film), `tools/stag_action_sheet.ts` and `tools/stag_action_captions.py` (the sheet),
`src/dev/stag_action_scene.ts` (the scenes: the clearing, his way round it, the fight's shape), `tools/stag_action_hash.ts` (the
hashes), `tools/stag_action_peek.ts` and `tools/stag_action_review.ts` (the helper's own looks), `tests/stag_action_shapes.ts`
(the review's view of him).

## For him to decide (the art chat's to ask)

- The clearing's sizes: 80%, 60% and 40% across (at 40%, 6.8 by 8 tiles: little safe ground, his bounds of 3.3 tiles cross it in
  two).
- The wall inside sinking as the next rises (the pictures), or every wall staying (the wood thicker each time).
- His bounds: 5.5 tiles a second, 3.3 a bound, as fast as the Princess's steed (4.5 a leap); how often he stops to stare.
- The gore's sweep (150°, out to 3 tiles) and the charge (12 tiles a second, 8 tiles long); the heavy landing's knock (1.2 tiles).
- The charge's crash splinters the wall to stumps that grow back, the wall still solid; or a real gap for a few seconds (a way out).
