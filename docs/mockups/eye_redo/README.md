# The Drowned Eye redone: the Swamp Colossus (stage 1: his look and the new arena, in pictures)

A MOCK-UP: NOT IN THE GAME. The art chat's, branch `art/eye-redo`. His new look is `src/art/eye_colossus.ts`, behind
`EYE2 = { on: false }`; nothing of the game imports it (`tests/eye_colossus.test.ts` holds it). Nothing of the old Eye
(`src/art/drowned_eye.ts`, `art/act1_figs/eye.ts`, `game/act1_rules/eye.ts`) is used in it. Nothing moves yet: these are
stills, for his yes before anything is animated.

## His words, 7 Nov 2026

- 00:07: “if you get time, i think the whole sunken eye fight needs to be redone.  hes just not scary or intimidating.  the arena doesnt really work, and his entrance is not epic.”
- 00:08: “maybe instead of a circle its a big rectangle and hes in the water in front of you.”
- 00:08: “well, like up on the screen above you”
- 00:10: “start with just tentacles coming up, kill both of them, then he emerges with three.  kill the three with extra attacks from the main body, final phase he uses the magic, maybe keep three tentacles.  kill the tentacles and his body.  flasks reset in between each phase for now”
- 00:11: “but lets get new art for the whole thing”
- 00:13: “just scrap his look and start fresh.  big ancient gross eldritch horror swamp monster with tentacles and a big eye.”
- Asked which take to draw first, his pick: “Swamp colossus (Recommended)”, offered as: “A rotting hill of moss-grown flesh filling the top of the screen; one huge bloodshot eye under a heavy brow; a split maw of teeth below; slime, weed and old bones on it; thick slimy tentacles.”

- His answer on b0b6fef2, 7 Nov, asked whether to build the fight on this look and arena: “His mouth is bad and he needs to slide back a little so the tentacles don’t clip through him or the stage”.

## The pictures (`pictures/`)

- `eye_look.png`: his look. Risen, from in front, at the game's size, the Warrior on the stone before him twice (from behind
  and from in front) for scale; his eye and maw at twice the size, the maw shut and torn open; one tentacle at twice the size;
  under the water (phase 1), only his eye's fire and the dark hill of him through the black water; from behind, at half size.
- `eye_arena.png`: the new arena as the player sees it, a phone held sideways (the game's own 507 x 234 game pixels, two
  picture pixels to each). Phase 1: the black water across the top, his eye's fire under it, two tentacles up out of it, the
  hero on the stone below. Phase 2: him risen, filling the top of the screen, three tentacles, the hero below. Each again at
  twice the size, in two halves. Then, small: today's fight from the game itself, and the new one beside it. Then the camera
  as the game sets it when the hero stands in the middle of the stone (no lean): mostly stone, his lower body and arms across
  the top. Last, a plan of the whole arena from above: its size in tiles, where the tentacles rise in each phase, the
  obelisks.

Everything round him is the game's own: the fen's paving and black water from the fen's terrain painter (`art/fen.ts`,
`art/terrain.ts`), the fen's pieces (`art/floor10.ts`: broken columns, cattails, sedge, mossy stones, column drums, lily
pads), and the Warrior as the game paints him (`art/heroes3.ts`).

## What he is

A hunched hill of rotting flesh risen out of black water, facing the camera always: a high back knotted along its ridge,
heavy shoulders lower either side, jowls sagging in folds into the water. Hung in folds and sagging rolls, wet and slick, his
deep creases going to a dark bruise; bruising in soft gradients, never patches; slime running down him, long wet highlights
where the light runs along it; boils and a few open sores. Moss only in clumps and mats on his crown and over his brow, dark
beneath, its tips lit. His outline broken by what has grown out of him: great horns of old bone out of his back, a tusk out of
his shoulder, dead wood grown up out of his crown, a drum of a fallen column and a broken slab of the fen's ruin; a horned
beast's skull on his left shoulder, the great ribs of something across his right, the skulls of the drowned; barnacles at the
waterline; leeches. Curtains of weed and strings of slime hang from every overhang down into the water, and drool from his
maw. Darker toward his edges; his eye the brightest thing on him, its pink-gold glow lighting the folds round it. At his heart
one huge eye under a brow that juts out over it like a cliff: yellowed, bloodshot, its iris the enemy's pink burning to gold round a black slit, set between thick
raw-rimmed lids, looking at you. Below it his maw (made again on his word of 7 Nov, “His mouth is bad”): shut, a wide ragged seam of rotten,
swollen lips, wet and dark, crooked yellowed fangs of every size hanging out over it, two long and curved, three broken, the
lower ones jutting up over it at its corners, brown at their roots, drool hanging in strings, gums showing where the lip curls
back; torn open, his lower jaw drops and his lips peel back from his gums, rows of fangs, smaller and smaller, running back
into a dark, wet throat that narrows and folds, a tongue on its floor, the throat lit faintly from within by his eye's
pink-gold, strings of slime between his jaws. Nothing even: the fangs spaced, sized, tilted and bent each its own way. His
tentacles: smooth muscle, no rings, thick at the water and tapering to a thin whip of a tip; reared in an S, leaning, the tip
curling; dark along the back shading to pale beneath, long wet highlights along their length; suckers in two rows along the
underside, each a cupped ring with a lit rim and a dark middle, smaller toward the tip; a few old scars; slime dripping off
them in strings. Each an enemy of its own, rising out of the water. The water round him dark and oily, foam and scum where he
breaks it, his ripples thin broken lines, further apart further out, catching his eye's glow. An enemy: the pink edge round him; pink and gold his only
glow; nothing cyan.

How he is painted: his own solids, smooth-joined, in his own space (his own lengths, as the game's figures', TILE3 to a
tile), looked at ray by ray as the game's camera looks (from above at 30 degrees), two picture pixels to a game pixel; lit
from the upper left in five tones a material, with the light's own shadow (his brow shades his eye) and the dark of every
fold; the indigo seam where one part ends before another; what of him is under the water seen through it, darker the deeper.

## Slid back (his word of 7 Nov)

He lies further out in the water: the stone's edge is now 310 of his lengths before his middle at the water, 7.9 tiles (it was
233, 5.9 tiles): he slid back 2 tiles. Each tentacle rises in open water between him and the stone, its root under the water
just off the stone's edge: at least 20 of his lengths clear of his body (half a tile; 30 with his maw shut) and 10 clear of the
stone, everywhere along it (`armClearances`, held by `tests/eye_colossus.test.ts`). In the leaned views the camera leans the
most it may (70 game pixels, as the Moth's) so that his brow, eye and maw are still on the screen over the hero; more of his
crown runs off the top than before (about 116 game pixels).

## For the main chat

- The stone: 17 tiles across the screen by 11 deep (your post of 7 Nov), its far long edge open on the water. Its other three
  edges lie on the fen's water too.
- His distance out: his middle at the water 7.9 tiles out from the stone's edge (310 of his lengths). You had about 3; the art
  had 5.9; his “slide back a little” needed 7.9, so that his arms rise between him and the stone without touching either. The
  front of his body is 2.9 tiles back from the stone's edge (his hill is about 19 tiles across, wider than the stone).
- The tentacles' roots: in the water 1.4 tiles out from the stone's edge (6.5 tiles before his middle). Phase 1 at a third and
  two thirds along the edge (2.8 tiles either side of the middle); phases 2 and 3 left, middle and right (5.7 tiles either side,
  and the middle). Each is 2.2 tiles thick at the water and 1 tile thick half way along, and rises about 300 of his lengths
  (7.7 tiles' length) over the water. Its root is clear of his body and of the stone, with the stone open before it to slam
  forward onto.
- A slam of 6 tiles along the stone toward the hero, 1.2 wide, is narrower than a tentacle near its root (2.2 tiles). His rule
  for enemies (28 Oct) asks for bigger areas, not smaller: I would make the slam's area 2.2 wide at its root end, narrowing to
  1.2 at its far end. Yours to say.
- The three pillars of phase 3, where they could stand (not drawn yet): one at the middle of each short side of the stone,
  just off it, half way down; one at the middle of the near long edge, just off it. On the plan in eye_arena.png.
- The arena view with the game's own camera (the hero in the middle of the stone, no lean) shows mostly stone, his arms and his
  lower body across the top. For his face to be on the screen while the hero fights near the water, the camera wants the
  Moth's lean (`render.ts` MOTH_LEAN), here at its most.

## His numbers

- The phone's screen: 507 x 234 game pixels (`engine/screen.ts`; the game's own playtest logs it on a phone held
  sideways). That is 15.8 tiles across and 14.6 tiles top to bottom (a tile 32 x 16 game pixels); along the floor, about 22
  tiles across and 21 deep.
- Him risen, with his arms, horns and hanging weed: 441 x 305 game pixels (882 x 609 picture pixels): seven eighths of the
  screen's width. Over the water, to the top of what grows out of his crown, he stands 201 game pixels; the knight stands 29. His eye 66 of his lengths in radius: about 76 game
  pixels across, two and a half times the knight's height.
- Today he is about 127 x 61 game pixels on the same screen (measured from the game, `tools/scenarios/eye_today.mjs`), his
  eye about 32 across.
- The arena (`tools/eye_redo_pics.ts` ARENA, from `STONE`): the stone 17 tiles across and 11 deep, three quarters of the
  screen's width; the black water across the top, its edge 7.9 tiles before his middle. In the leaned pictures the camera leans
  toward him 70 game pixels, as it leans toward the Moth (`render/render.ts` MOTH_LEAN: at most 0.3 of the screen, 70), so
  the hero stands low on the screen; the top of his crown and what grows out of it run off the top of the screen, about 116
  game pixels: his brow, eye and maw are on it.
- Under the water (phase 1) he lies 384 of his lengths down (what grows from his crown just under the surface) and 330
  further back than when risen, so that his eye's glow is seen in the water before the stone.

## Why the fight today is not scary (the audit)

1. His size: about 127 x 61 game pixels on a 507 x 234 screen, his eye about 32 across: about the hero's own height.
2. Where he sits: flat in a pool in the middle of a round ring, seen from above, with the hero right beside him; nothing of him looms over the hero.
3. How he moves: he never moves or turns (`game/act1_rules/eye.ts`); risen he only sits higher in his pool; his arms come up from cracks round the ring.
4. His frame rate: his frames are up to 860 x 790 picture pixels, so he is held at 15 frames a second and his surfacing and death at 10 (`EYE_MOVES`; `EYE_COST`, 676 frames, 320 MB): his biggest moments are his choppiest.
5. His entrance: a 4.2-second surfacing at 10 frames a second; the screen shakes twice (7 at the break, 5 at the roar) with a slam, a wave and his roar; the camera does not move and the screen does not darken.

## An epic entrance, within the game as it is (choices to put to him)

- What rises first: the water goes still and black; rings spread; his eye opens under the water and its fire swells; then his
  crown breaks the surface with weed and muck pouring off him, then his brow, and the eye comes up out of the water already
  looking at you; last, his maw tears open in the roar.
- The screen darkens: the fen's dusk drops to near night for the rise, so that his eye's fire and the hero's own light are
  all that is lit; it comes back as he roars.
- The screen shakes: a low rumble growing all through the rise, a big shake as he breaks the water, another at the roar.
- The camera: glides up toward the water as he rises and settles leaned toward him (the Moth's lean), so the hero drops to the
  foot of the screen and he fills the rest.
- The water: a wave rolls off him over the stone's edge as he comes up; muck and weed rain down.
- The sound's cue (for the sound chat, whose rules these are now): the music cuts to silence; a deep rumble; a wet tearing
  groan as he rises; his roar on the maw opening; then his music.
- Recommended to put to him: the eye first, then the rise in the dark, the roar, the camera leaning.

## What he costs

- A frame of him risen, his arms with him: about 900 x 610 picture pixels, at 4 bytes a pixel 2,196,000 bytes (2.09 MB).
- Baked at 30 frames a second: 62.8 MB for each second of him; a stand of 3 seconds, 188 MB; ten moves of about 3 seconds
  each, about 1.9 GB. Too much to hold whole. Ways to afford him (for the main chat): his body painted once a few times a
  second and only what moves (his eye, his maw, his arms, each a small picture of its own) at 30; or baked to files and read
  as they are needed (his word of 6 Nov: the game may carry files).
- Painting a frame, here without a browser: about 47 seconds risen, 30 under the water (this container, two jobs at once). Not to be
  painted while the game runs: baked.

## How to make the pictures again

```
node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/eye_today.mjs --out shots/eye_today/x
npx tsx tools/eye_redo_pics.ts look shots/eye_redo/look
npx tsx tools/eye_redo_pics.ts arena shots/eye_redo/arena
python3 tools/eye_redo_sheet.py look shots/eye_redo/look docs/mockups/eye_redo/pictures/eye_look.png
python3 tools/eye_redo_sheet.py arena shots/eye_redo/arena shots/eye_today/x_risen.png docs/mockups/eye_redo/pictures/eye_arena.png
```

## The second pass (the art chat's notes, before he sees it)

The first pass broke his rule of 6 Nov, 15:18 (“Everything drawn should not just look like shapes.  That’s the rule”): its
tentacles read as banded ram's horns, its moss and markings as flat camouflage, its outline as a smooth green dome, its
ripples as thick flat bands, and the arena's room was not shown. Redone: the tentacles as above (no rings, no bands, a whip of
a tip, shading from back to belly, long sheen, cupped suckers); the camouflage gone (moss only in textured clumps on his crown
and brow; rotting wet flesh with deep creases between; bruising in soft gradients; boils and sores, wet); his outline hunched,
knotted, his brow a cliff, horns and dead wood and stones breaking it, curtains of weed and strings of slime into the water;
darker and wetter, his eye the brightest thing and its glow on his folds, darkness toward his edges, drool from his maw; the
water dark and oily, his ripples thin broken lines (the fen's pool painted without its own rings: his are his); and the arena
shown at the game's own camera with the hero in the middle of the stone, and as a plan.

## Checks

`tests/eye_colossus.test.ts`: the switch off and nothing of the game importing him, nothing of the old Eye in him; his
pictures (risen from in front and from behind, his maw torn open, under the water, a tentacle alone) with nothing cyan, the
pink edge round him, his iris pink burning to gold; his lengths the game's, a frame's cost; his arms clear of him and of the
stone, their roots under the water before it, where the main chat's layout puts them. `tsc --noEmit` clean. Stage 1
only: no moves, so the boss checks (`art/boss_checks.ts`) come with his moves.
