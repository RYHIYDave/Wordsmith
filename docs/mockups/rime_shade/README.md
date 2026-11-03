# Floor 20, the Quiet Tower: the Rime Shade (a mock-up; branch `art/rime-shade`)

Made for the art chat, from `origin/work-f4` (68b2920, the main chat's release branch, with floor 20 and its enemies). NOTHING
HERE IS IN THE GAME: nothing of the game imports it (its test proves it), and it is behind `RIME_SHADE_ON`
(src/art/rime_shade.ts), off.

## His words

- 31 Oct 2026, asked where FROST should go: “The Shade, 2–5 (Recommended),The Drowned, 10,The Quiet Tower, 20” (offered: the
  Shade's rake chills you and leaves rime on the floor that slows; the Drowned's grab freezes you in place a moment; a frost
  kind for the top of the tower, where the Hush is coldest).
- 3 Nov 2026, asked which frost creature for the Quiet Tower: “Rime Shade (Recommended)”, offered as: a hunched figure of frost
  and fog, icicles for fingers. Its breath sends a creeping line of rime along the floor that freezes you in place if it
  reaches you.
- His rulebook's Monsters 9, “Action, like a movie” (every attack a big held wind-up, a 1–2 frame smeared strike, a big
  wind-down, bigger areas), and Animations 1 (“as big and wild and kinetic and weighty as possible.  I’d rather it be a notch
  too high than a notch too low.”).
- Floor 20's palette, his doc: “Grey fog, bone white, no colour at all.”
- Under his rules already given: Movement 9, 24 Oct (“Like the wind up and wind down are big but the actual punch is lightning
  quick”), and for the enemies, 28 Oct (“Start from now on, but every enemy is going to need that change eventually.  And bigger
  AOE to compensate for the extra time the player gets to evade”). A small mob: ONE attack (his rule of 9 Oct).

## What it is (src/art/rime_shade.ts)

The Hush in its own shape, made cold: never undead, never gory; when it dies it comes apart into fog and frost, nothing left
lying. On the heroes' bones (`RS_BODY`: 80 tall to the knight's 58, long arms 1.35 a man's).

- A HUNCHED FIGURE OF DENSE GREY FOG (`RS_FOG`; its arms and legs the same fog deeper, `RS_FOG_DEEP`): a narrow waist, ribs, the
  upper back curled high between broad shoulders into a bowed hump, its shoulder blades standing out of the fog of its back.
  Hunched, its crown is 1.25 of the knight's height; straightened, 1.45; spent, 0.96.
- FROST FORMING OVER IT IN PLATES (`RS_FROST`, the game's frost: the Drowned's grab's and the Shade's rime): a crust of plates
  over each shoulder with three spikes of ice standing up and out of it, four shards of ice along its bowed back, a crust on
  its hump and its shoulder blades, two plates under its collar, cuffs of ice over its forearms, rime round the edge of its
  hood. MORE as it draws in its breath (the plates swell, the spikes grow, the crust spreads); thin when it is spent.
- A HOOD OF FOG, a deep cowl drooping over its brow, its point hanging down its back; within it NO FACE, only a dull dark
  hollow where it breathes (`RS_HOLLOW`), the enemy's dull pink eyes deep in it (`RS_EYE`, the Hushed's). As it draws in its
  breath the cold gathers pale in the hollow's heart. From behind, the hood only.
- ICICLES FOR FINGERS (`RS_ICE`): four to a hand from a knot of ice, long (15 of its lengths, a quarter of the knight's
  height), clear ice, a crack in each (`RS_CRACK`), a glint flickering at their points; hanging, splayed wide as it rises,
  flung back as it breathes out.
- A SHROUD OF FOG from its hips to a hand over the floor, going to mist below its knees (`RS_MIST`, every other pixel gone),
  ragged at its hem; its legs inside it go to mist too: it drifts low, half walking, its feet never on the floor.
- FOG TRAILING OFF IT: rising off its crown, hump, shoulders, elbows and hem; lying low along the floor behind its legs. ITS
  COLD BREATH sinking out of its hollow as it breathes out.
- The dark seam where one part ends before another; the enemy's pink rim round it while it lives. NOTHING CYAN: every colour
  of it is grey or bone white or the frost's faint blue (hue 210 to 230, saturation 0.18 at most: tested), the only other
  colour the enemy's pink.

## Its moves (src/art/rime_shade_moves.ts), and their numbers

- ITS STAND (2.4 s, 24 frames at 10): hunched, breathing: its back lifting and bowing, its chest and shoulders rising and
  falling 3.2 high, its fog streaming harder and softer with each breath, its cold breath puffing out of its hollow and sinking
  as it breathes out; its arms hanging and stirring, its icicles clinking (spread and curled by turns), its hood turning slowly.
- ITS DRIFT (its walk, `RS_PACE` **1.8 tiles a second**, 12 frames at 10, two steps a round): low, half walking: its legs of fog
  stepping under its shroud (each foot swung 7 forward and back, lifted, never down), bobbing twice a round, leaning into its
  way, its arms swinging long against its steps, its shroud's hem and its low fog trailing behind it.
- THE RIME BREATH, its one attack (`RS_BREATH`, **2.5 s**, 76 frames; its `hit` **0.833 s**, frame 25):

| | |
|---|---|
| it gathers | sinks lower, its arms drawn in, by 0.16 s |
| IT STRAIGHTENS | up to its full height (its crown 1.45 of the knight's), leaning back, its arms flung out wide and back (2.1 tiles hand to hand), by 0.4 s |
| HELD, drawing in | to **0.733 s** (0.33 s), shivering: the fog round it drawn in to its hollow in streaks, the frost forming thick over it, the cold gathering pale in its hollow (its warning, full from 0.5 s) |
| THE MARK | from **0.25 s** (0.58 s before it breathes out): the line it will send laid out on the floor before it, toward you (`markPainted`) |
| hips first | 0.733 to 0.767 s, its head still thrown back |
| THE STRIKE (`RS_STRIKES`) | **two frames**, frames 23 to 25, smeared (after-images of its hood and its arms): it throws itself forward and down and breathes out |
| breathing out | its breath billows out of its hollow onto the floor before it and rolls out along the line, to 1.3 s (`breathAt().pour`) |
| the wind-down | it sags; SPENT by 1.75 s, hunched deeper than it stands (its crown 0.96 of the knight's), its arms hanging limp, fog pouring off it, its frost gone thin; rising back to its stand by 2.5 s |

- STRUCK (`RS_REEL`, 0.4 s): jolted back 4.5, its arms flung out, its frost cracking and shards of it flung off, glinting and gone
  before they reach the floor, a gash torn through its fog that closes again.
- ITS DEATH (`RS_DIES`, 2.2 s): struck, it arches back, its hollow to the sky, a last cold breath going out of it; its frost
  cracks and is flung off in shards and flakes, every one gone before it reaches the floor; it rises 15 and comes apart into
  fog, strands of it drawn up off every part of it (0.4 to 1.75 s), until nothing is left (no frost, no ice: tested).

## Its breath on the floor, and on the hero (src/art/rime_shade_fx.ts), and their numbers

| | |
|---|---|
| THE LINE (`RIME_LINE`) | from **0.45** tiles before it, **6 tiles** long (to 6.45), **1 tile** wide (`half` 0.5), straight at where you stood as it was marked |
| THE CREEP (`pace`) | its front creeps down it at **3.5 tiles a second** (the game's hero runs 4.6: you can outrun it, or step a half tile out of it); to its end in **1.71 s** after the hit |
| as it creeps (`linePainted`) | ICE CRYSTALS SPIKING UP at its front, full height (12 to 28 picture pixels, the knight is 58) in two frames (0.06 s), settling to a quarter of that by 0.6 s into a crust of feathered rime, its edges flecked with the enemy's pink; a bright edge of new frost across its front, frost-smoke rising off it |
| FROZEN IN PLACE (`FROZEN`, `freezesAt`, `frozenPainted`) | where its front reaches the hero, frost closes over his feet and legs in **two frames**: jagged plates of ice shoot up round them, leaning in over his shins, rime on the floor under him; he is held **0.8 s** (as the Drowned's grab); the ice cracks, then shatters, its pieces flung and gone in 0.32 s |
| THE RIME LIES (`lies`, `melt`, `rimeLeft`) | each stretch of it lies **3 s** after the front passed it, then melts away over its last **0.8 s**: it melts from where it began; all gone **4.71 s** after the hit (`LINE_GONE`) |

Its frost is the game's frost, never the friend's cyan: grey-white with a little blue in it, its saturation 0.18 at most; the
enemy's pink in the mark, flecked along the rime's edges and at the foot of the tall crystals and of the ice round the hero.

## How the main chat brings it in

- `makeRimeShadeArt3()` gives `{ front, back }` as the game holds a monster (`stand`, `walk`, the attack's clip with its `hit`,
  `reel`, `die`), its picture `RS_CANVAS` 320 by 280, its floor point at 150, 206; `RIME_SHADE.pace` 1.8.
- ITS RULES (a small mob, one act): the breath's `long` 2.5, `hit` `RS_BREATH.hit`; begun at a hero from about 2 to 6 tiles off
  (a suggestion). At `RS_BREATH.mark` take the way to the hero and keep it: lay `markPainted(t, view, turn)` at its floor point
  (`FX_CANVAS`, its anchor there; `turn` the angle of that way off the way its picture faces, so that the line goes straight at
  where the hero stood), under the figures.
- From the hit: lay `linePainted(t - hit, view, 'floor', 'all', 0, turn)` under the figures, and its crystals
  (`'air'`, split `'behind'`/`'before'` a figure on it at `at` tiles along it) sorted with them, until `LINE_GONE`.
- FROZEN: a hero standing in it (`inLine(fwd, side)`, tiles along it and to its side) when its front reaches him
  (`reachesAt(fwd)`; `freezesAt` says when) is frozen in place `FROZEN.hold` (no moving, no dodging); draw
  `frozenPainted(t, view, 'far')` under him and `'near'` over him at his floor point (`FROZEN_CANVAS`), from that moment.
  How the hero himself looks frozen is the main chat's (the film whitens him from the feet up as a stand-in, as floor 10's film
  did).
- Whether the lying rime slows whoever stands in it (as the Shade's rime does, 0.4) is his to say: see below.
- Its death: `die` as the game plays any monster's; nothing is left lying, so nothing to clear.

## The checks (tests/rime_shade.test.ts, 12; all pass)

1. the switch off; nothing of the game imports it;
2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`: it is on the heroes' bones), every frame, from in
   front and from behind (truly from behind), and every handover (its stand into each move and back; its drift from any step
   into its stand, its breath, struck and struck down; its breath and struck back into its drift): **nothing found**;
3. HIS LIGHTNING STRIKE: two frames, landing on the second; smeared then and only then;
4. every frame both ways round: nothing cyan, the pink rim while it lives and none as it dies, every pixel whole or empty (crisp);
5. nothing cut off; 6. nothing of it in the floor (its fog, its breath and its flakes too);
7. its hollow and its dull pink eyes from in front (as it stands, drifts, is struck, and its hollow as it draws in), no face
   from behind; its icicles, its frost and its fog in every living frame; its fog streaming off it;
8. its colours: grey, bone white and the frost's faint blue only, but the enemy's pink;
9. struck, torn and closing, shards flung; its death coming apart to nothing, no frost or ice left lying;
10. its sizes: hunched about the knight's height, straightened taller by far, spent lower; its feet never down;
11. the breath: held a third of a second, the cold full in its hollow, the frost forming, drawn in then poured out, the mark half
    a second and more before it comes; the line's numbers (6 tiles, 1 wide, 3.5 a second, slower than the game's hero runs;
    frozen 0.8 s; lying 3 s, melting over 0.8 s); stepped out of it, never frozen; running away down it, never reached;
12. the mark, the line (also turned up to 45 degrees off its picture's way) and the frost over the hero, painted, every frame
    of their lives, both ways round: crisp, no cyan, the frost's colours, nothing cut off; the crystals spiking up at the front,
    settling, melting; the line gone when it has melted; the ice closing in two frames, held, shattering, gone.

Also passing: `tests/hush_shapes.test.ts`, `tests/palace_hands.test.ts`, `tests/princess.test.ts`, `tests/bosses.test.ts`,
`tests/new_mobs3.test.ts`; `tsc --noEmit` clean. Changed outside its own files, only two import checks:
`tests/bosses.test.ts` (test 12: it takes the checks' types) and `tests/new_mobs3.test.ts` (it is built on the new monsters), each
told of its three files as of every mock-up before it. No shared engine file touched.

## The pictures (docs/mockups/rime_shade/pictures/)

- `rime_shade_sheet.png` (1200 wide): it standing from in front and from behind beside the knight, three times as big;
  straightened at its full height; a crowd of them at the game's size on the Tower Top (one phone screen across), one breathing
  its line at the knight; the breath's key moments from in front and from behind; the line marked, creeping, reaching the
  knight (frozen), lying and melting; the knight frozen close up, the ice cracking and shattered.
- `rime_shade.mp4` (1200 by 862, 30 fps, H.264, captioned): its stand and its drift from in front and from behind; the rime
  breath from in front and from behind, the knight on the line frozen where it reaches him, the rime lying and melting; the
  breath at half speed (the knight frozen close to it); the knight outrunning it; struck; its death; all on floor 20's own
  ground (the Tower Top's flags, art/quiettower.ts, laid as src/dev/tower_level.ts lays it).

## Tools

- `npx tsx tools/rime_shade_pics.ts look|big|close <dir> [...]`: frames to look at; `film <dir> [parts]` then `python3
  tools/hush_shapes_film.py <dir> rime_shade.mp4`: the film; `sheet <dir>` then `python3 tools/rime_shade_sheet.py <dir>
  rime_shade_sheet.png`: the sheet.
- `src/dev/preview_rime_shade.ts` (in a browser, tools/preview.mjs): `sheet`, `big:<move>:<t>`, `line:<t>`.

## For him to decide (the art chat's to ask)

- THE LYING RIME: the brief says it lingers and melts; whether it also SLOWS whoever stands in it (as the Shade's rime on floors
  2 to 5 does, 40 percent) is his call. Suggested: yes, the Shade's 0.4, so the line also takes floor away.
- THE CREEP'S SPEED: 3.5 tiles a second (three quarters of the hero's 4.6). Faster makes it harder to outrun; it is the number
  that sets how hard it is.
- FROZEN 0.8 s, as the Drowned's grab; with several Rime Shades on the floor (the crowd in the sheet) two lines can catch him
  one after the other.
- The knight's frozen look in the pictures (his colours whitened from the feet up) is a stand-in: how a hero looks frozen is
  the main chat's to make.
