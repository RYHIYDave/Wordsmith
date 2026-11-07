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
- His answer on b0b6fef2, asked whether to build the fight on this look and arena: “His mouth is bad and he needs to slide back a little so the tentacles don’t clip through him or the stage”.
- His answer on 7910b3e9, asked the same: “He’s a little too rectangular.  Less floating island and more eldritch horror.  And there’s a line on the tentacle that kinda cuts it in the middle.”
- Shown 3e7b6844: “Eh.  Still not quite it.  Let’s keep the tentacles, they’re still split up into sections.  But let’s scrap the body.  I want the eye as the end of the tongue and the whole head to split open down the center for the maw.  Spittle and goo all over the place.  And have him like constantly melting and dripping”
- 11:17: “And the eye waves around like its own tentacle”
- Shown the splitting head (bfb16ba3): “That’s pretty good, I like the direction, but I have a drawing of what I was kinda thinking”. Then he sent his drawing: `docs/ref/eye_drawing_from_owner_2026-11-07.jpg`.
- 12:45: “Not EXACTLY like that but that’s kinda what I meant about the maw splitting and the tongue eye”

## His drawing, as it was read (as he was told)

1. His body rises out of the water already split wide open in a deep V, its point down at the waterline: a vast maw opened from
   the water up. The two halves tall and pointed, like great jaws pried apart, each leaning out to a peak (the left a little lower
   and further out, the right taller and sharper). Jagged teeth down both inner edges of the V, crooked and hooked. Inside, a dark
   wet throat glowing faintly pink-gold low down, spittle strung across. The outer flanks rotting, melting flesh, drips running down
   into the water.
2. His tongue rises out of the bottom of the V and twists up in a long S, thick at the root and tapering, smooth wet flesh,
   towering over the jaws.
3. His eye on the tongue's tip, the highest of all: an almond or lens-shaped eye lying on its side (wider than tall), a tall black
   slit pupil, raw lids, the iris the enemy's pink burning to gold. It waves around like its own tentacle.
4. His tentacles curl outward from the water on both sides of him, clear of his body and of the stone.
5. The two small dots high in his drawing: nothing to draw.
6. He is drawn open, as his drawing shows him, the way he stands when risen. Whether the V closes is a question for later (below).

And, after his 12:45 word, his drawing is THE IDEA, not a shape to trace: the split from the water up in a V maw with teeth down both
inner edges; the tongue twisting up out of it, towering; the eye on its tip, the highest of all, waving like a tentacle; tentacles
curling out on both sides. The exact outline, the number of tentacles and the proportions were the art chat's to make look best.
His drawing stands beside the new still at the top of `eye_look.png`, captioned as the idea he sketched.

Kept as they were: the arena (17 by 11, the water), his place in the water (his middle 7.9 tiles out), the tentacles' roots and
their poses, the pillar spots, the melting and goo, the smooth unsectioned tentacles, the enemy's pink and gold, nothing cyan.

## The pictures (`pictures/`)

- `eye_look.png`: at the top, his drawing beside the new still, the same height; him at the game's size with the Warrior on the
  stone before him twice (from behind and from in front) for scale; twice the size (his maw, his tongue and eye); the eye on the
  tongue at three times; his jaws' teeth close (three times); under the water (phase 1); from behind (half size).
- `eye_arena.png`: the arena as the player sees it, a phone held sideways (the game's own 507 x 234 game pixels, two picture pixels
  to each), the camera leaned toward him. Phase 1: the black water across the top, his eye's fire under it, two tentacles up out of
  it. Phase 2: him risen, split open, his eye high on the screen, inside it; three tentacles. Each again at twice the size, in two
  halves. Then, small: today's fight from the game itself, and the new one beside it. Then the camera as the game sets it when the
  hero stands in the middle of the stone (no lean). Last, a plan of the arena from above.

Everything round him is the game's own: the fen's paving and black water from the fen's terrain painter (`art/fen.ts`,
`art/terrain.ts`), the fen's pieces (`art/floor10.ts`), and the Warrior as the game paints him (`art/heroes3.ts`).

## What he is now

THE V. He rises out of the black water already split wide open: two great jaws pried apart, the line their inner faces meet along
just under the water, so that the V's point is at the waterline (43 of his lengths across there at its front, a little over a
tile) and it gapes wide at the top (his peaks 281 of his lengths apart, 7.2 tiles). Each face leans out from upright, his left 44
degrees, his right 39, and is turned a little toward you.

HIS JAWS. Each rises out of the narrow trunk he stands in the water on, leaning out and tapering to a point on the edge of the V:
his left the lower (its peak 128 of his lengths over the water) and further out, heavier and sagging; his right the taller (146)
and sharper. Thinner front to back than across, slabs of a jaw rather than domes. Rotting grey-green flesh, wrinkled and lumpy,
veined, boils and sores, barnacles at the water; heaps of flesh that have run off him slumped round him at the water; a jowl of
melting flesh sagging off each outer flank over the water; tumours bulging out of them.

THE TEETH. Down both inner edges of the V from the water up to each peak, rows of crooked hooked fangs (46 in all): a front row,
the bigger, some long, some broken, and a row behind it, set in raw wet gum, each hooked back toward his throat, smaller toward the
peaks. None goes through his tongue (the nearest 10.6 of his lengths clear of it, risen or under the water).

THE INSIDE OF HIS MAW. Behind each face the jaw is hollow, wet and ribbed, inside a lumpy rim of raw gum; across the back of the V a
wall of wet ribbed throat, its top sagging between the jaws below their peaks, its foot sloping forward to the water as the floor
of his mouth; his gullet a hole in it, low down, glowing pink burning to gold, the throat round it faintly pink low down. Spittle
strung across the V at every height and slant, sagging each its own way, some snapped and hanging; drool in ropes off his jaws'
low front edges into the water. From behind, the back of his throat between his jaws is rounded hide.

HIS TONGUE. Out of his gullet at the bottom of the V and up in a long S, thick at the root (27 of his lengths) and tapering (17)
to where it swells round his eye; one smooth tube, slick, a groove down its back, rough with papillae; towering over his jaws.

HIS EYE, on the tongue's tip, the highest of all of him: lying on its side, 116 of his lengths across and 48 tall (67 game pixels
across: more than twice the knight's height), in a bulb of the tongue's flesh drawn to a point at each corner like a lens, its raw
lids parted round it in an almond with pointed corners; yellowed and bloodshot, redder toward its corners; the iris a round of the
enemy's pink burning to gold round a tall black slit; looking at you; its fire's glow on what is near it.

MELTING AND DRIPPING. Two sheets of his flesh slid down each jaw like melting wax, the upper the thicker, each sheet's edge running
down in drips of every length (122 round him, the longest 91 of his lengths), necked where they leave the sheet, swelling to fat
ends; they run straight down, as wax does, however his jaws lean. Thin runs of goo between; drips hanging off his overhangs (25), a
gob let go and falling, a splash on the water where each lands and where each rope of drool meets it (13); little drips with fat
beads off every lower edge in the picture; goo sheeting down him, bubbles in it.

HIS TENTACLES. As they were: where they rise, their lie, one continuous smooth taper each, the suckers in two rows along the
underside all the way. Left one hooking over outward like a question mark, right one curling out and over, the middle one low
and coiled aside.

An enemy: the pink edge round him; pink and gold his only glow; nothing cyan.

## How he will move (for the next stage)

- His melting never stops: the sheets sliding down, the drips running each down its own path, swelling until they let go; gobs
  falling and splashing, the rings spreading; new flesh welling up as the old runs off; drool always dripping off his teeth and
  tongue.
- His tongue never still: always weaving, swaying and curling like a tentacle, the eye on its tip turning to keep watching the
  hero; it rears back before it strikes.
- His jaws: breathing, the V working a little wider and narrower, spittle stretching and snapping across it.

## A question for later: does the V close?

His drawing shows him open, and he is drawn open. It could close and open: the jaws swinging back to upright on the line under the
water until their faces meet, the teeth meshing down the seam, the tongue drawn down into his throat and the eye hidden; then
gaping again, spittle stretching between the jaws and snapping, the tongue rearing out with the eye on it (a shut state while he
rises, say, or a guard he takes). Not drawn; his to say.

## For the main chat

- The stone: 17 tiles across the screen by 11 deep, its far long edge open on the water. As before.
- His distance out: his middle at the water 7.9 tiles out from the stone's edge (310 of his lengths). As before.
- The tentacles' roots: as before (in the water 1.4 tiles out from the stone's edge; phase 1 at a third and two thirds along it;
  phases 2 and 3 left, middle and right), and their poses as before. Risen, each is clear of all of him (his jaws, his throat, his
  tongue, his eye, his drool, his drips and gobs) by at least 37.8 of his lengths, and 10.6 clear of the stone; under the water
  228.5 clear of him.
- The three pillars of phase 3: where they were (on the plan).
- His size: him alone (his jaws, his tongue and eye) 351 game pixels across and 164 top to bottom at the game's size; his eye's top
  117 over his middle at the water.
- The camera in phase 2 (the pictures' lean, to set as the main chat likes): his middle at the water 125 game pixels down the
  234-pixel screen, so that his eye's top is 8 down from the top of the screen and its middle 26 down; his peaks 40 and 50 down;
  the hero's feet 226 down, a tile onto the stone. The camera leans 97 game pixels toward him (before: 70). With the hero further
  back on the stone, his eye leaves the top of the screen unless the lean follows.
- His tongue and eye are an enemy's weapon of their own when the moves are drawn (the eye can be struck, or can strike): risen,
  the eye is 1.2 tiles before his middle and 5.7 tiles over the water.
- The slam's area (a tentacle's slam toward the hero): as before, yours to say.

## His numbers

- The phone's screen: 507 x 234 game pixels (`engine/screen.ts`; the game's own playtest logs it on a phone held sideways). That is
  15.8 tiles across and 14.6 tiles top to bottom (a tile 32 x 16 game pixels).
- Him alone at the game's size: 351 game pixels across, 164 top to bottom, his eye's top 117 over his middle at the water: the knight
  stands 29.
- The V: his left face leans out 44 degrees, his right 39; 43 of his lengths across at the water at its front; his peaks 281 apart,
  at (-145, -22, 128) and (136, -22, 146) (across, toward you, up).
- His eye: 116 x 48 of his lengths, 67 game pixels across; its middle at (-6, 46, 224).
- Under the water (phase 1): he lies 215 of his lengths down and 330 further back than risen; his peaks 69 under the surface; his
  tongue reared forward in the water before him, the eye on it 95 down, its fire seen in the water before the stone between his two
  arms.

## Why the fight today is not scary (the audit)

1. His size: about 127 x 61 game pixels on a 507 x 234 screen, his eye about 32 across: about the hero's own height.
2. Where he sits: flat in a pool in the middle of a round ring, seen from above, with the hero right beside him; nothing of him looms over the hero.
3. How he moves: he never moves or turns (`game/act1_rules/eye.ts`); risen he only sits higher in his pool; his arms come up from cracks round the ring.
4. His frame rate: his frames are up to 860 x 790 picture pixels, so he is held at 15 frames a second and his surfacing and death at 10 (`EYE_MOVES`; `EYE_COST`, 676 frames, 320 MB): his biggest moments are his choppiest.
5. His entrance: a 4.2-second surfacing at 10 frames a second; the screen shakes twice (7 at the break, 5 at the roar) with a slam, a wave and his roar; the camera does not move and the screen does not darken.

## An epic entrance, within the game as it is (choices to put to him)

- What rises first: the water goes still and black; rings spread; his eye's fire swells under the water; his tongue breaks the
  surface first, the eye on its tip, and rears, looking at you; then the two peaks of his jaws break the surface, melting, muck
  pouring off them, and he rises, the V gaping wider as he comes up; last, his roar out of the open maw.
- The screen darkens: the fen's dusk drops to near night for the rise, so that his eye's fire and the hero's own light are
  all that is lit; it comes back as he roars.
- The screen shakes: a low rumble growing all through the rise, a big shake as he breaks the water, another at the roar.
- The camera: glides up toward the water as he rises and settles leaned toward him, so the hero drops to the foot of the screen
  and his eye is high on it.
- The water: a wave rolls off him over the stone's edge as he comes up; muck and goo rain down.
- The sound's cue (for the sound chat): the music cuts to silence; a deep rumble; a wet tearing groan as he rises; his roar out of
  the maw; then his music.

## What he costs

- A frame of him risen, his arms with him: about 800 x 480 picture pixels, at 4 bytes a pixel 1,536,000 bytes (1.46 MB).
- Baked at 30 frames a second: 43.9 MB for each second of him. Too much to hold whole. Ways to afford him (for the main chat):
  his jaws painted once a few times a second and only what moves (his tongue and eye, his drips, his arms, each a small picture of
  its own) at 30; or baked to files and read as they are needed (his word of 6 Nov: the game may carry files).
- Painting a frame, here without a browser: about 66 seconds risen, about 46 seconds under the water (this container). Not to be
  painted while the game runs: baked.

## How to make the pictures again

```
node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/eye_today.mjs --out shots/eye_today/x
npx tsx tools/eye_redo_pics.ts look shots/eye_redo/look
npx tsx tools/eye_redo_pics.ts arena shots/eye_redo/arena
python3 tools/eye_redo_sheet.py look shots/eye_redo/look docs/mockups/eye_redo/pictures/eye_look.png
python3 tools/eye_redo_sheet.py arena shots/eye_redo/arena shots/eye_today/x_risen.png docs/mockups/eye_redo/pictures/eye_arena.png
```

(`eye_redo_pics.ts` keeps each painting of him in `shots/eye_redo/cache`, so the arena does not paint again what the look
painted; a change to `eye_colossus.ts` makes them all again. Run the look and the arena one after the other, not at once. The look
sheet reads his drawing from `docs/ref/`.)

## Before (the art chat's notes)

The first pass broke his rule of 6 Nov, 15:18 (“Everything drawn should not just look like shapes.  That’s the rule”); the
second redrew it; the third (3e7b6844) made the body a towering, hunched, lopsided mass and took the line off the tentacles. On
3e7b6844 he scrapped the body; bfb16ba3 made him a huge melting head that split down its seam, its halves swinging apart on a hinge
at the back of his skull, his tongue out of a slit low on the seam when shut. On his drawing of 7 Nov the head became the V: the
shut head, its seam, its slit, the hinge and the round lobes are gone from the file; the eye, once a ball, now lies on its side.
The tentacles, the arena, the water, the melting and the colours stayed.

## Checks

`tests/eye_colossus.test.ts`: (1) the switch off and nothing of the game importing him, nothing of the old Eye in him; (2) his
pictures (risen from in front and from behind, under the water, a tentacle alone) with nothing cyan, the pink edge round him, his
iris pink burning to gold; (3) his lengths the game's, his eye huge and lying on its side, a frame's cost; (4) his arms clear of all
of him (jaws, throat, tongue, eye, drool, drips, gobs) and of the stone, their roots under the water before it, where the main
chat's layout puts them, risen and under the water; (5) his drawing: the V's point at the water and wide at the top, each face
leaning out; his jaws tall, his left the lower and further out; rows of teeth down the V, none through his tongue; his throat
inside it and spittle across it; his tongue from his throat into the eye; the eye's bottom well over his taller peak and the
highest of him in his picture, and on the screen in the phase 2 view; under the water, nothing of him above it; (6) every
tentacle and his tongue one smooth taper: sampled close, no step in its thickness, no twist, the suckers in order; (7) he melts:
drips, gobs, splashes, the sheets running off him in drips, goo on him. `tsc --noEmit` clean. Stage 1 only: no moves, so the boss
checks (`art/boss_checks.ts`) come with his moves.
