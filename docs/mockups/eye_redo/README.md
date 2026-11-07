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
- His answer on 7910b3e9, 7 Nov, asked the same: “He’s a little too rectangular.  Less floating island and more eldritch horror.  And there’s a line on the tentacle that kinda cuts it in the middle.”
- Shown 3e7b6844, 7 Nov: “Eh.  Still not quite it.  Let’s keep the tentacles, they’re still split up into sections.  But let’s scrap the body.  I want the eye as the end of the tongue and the whole head to split open down the center for the maw.  Spittle and goo all over the place.  And have him like constantly melting and dripping”
- 11:17: “And the eye waves around like its own tentacle”

## How that was read (as he was told)

1. The body is gone. In its place a huge head rising out of the black water across the top of the screen, ancient and gross,
   an eldritch horror, never a cartoon; no face of the old kind: the head itself is the creature.
2. The whole head splits open down its centre into the maw: shut, a seam from crown to chin, wet and leaking drool; open, the
   two halves part sideways like great jaws hinged at the back of the skull, rows of hooked teeth along both inner edges top
   to bottom, the wet ribbed throat between them glowing faintly pink-gold deep inside, strings of spittle across the gap.
3. His eye is on the end of his tongue: a long, thick, slimy tongue, its tip swollen into the huge bloodshot eye (the iris the
   enemy's pink burning to gold, a black slit). As supple as a tentacle, the eye on its tip swaying, curling and weaving through
   the air, always moving: in the stills reared and curling in an S, the eye up at its tip looking at you. Shut, it snakes out
   through the seam low on the head; open, it rises out of the throat, waving above the split. Smooth flesh, wet, no sections.
4. Spittle and goo everywhere: drool in strings and ropes, goo sheeting down him, bubbles, slime webbed across every gap, foam
   where it hits the water.
5. Constantly melting and dripping: his flesh sags and runs like wax, gobs of it drooping and falling off into the water, drips
   everywhere, the outline always running down. The stills show him mid-melt.
6. The tentacles kept, but each made one continuous smooth taper from root to tip, no bands, no joints, no steps; the colour
   shading smoothly along it and round it; the suckers on the underside.
7. Kept as they were: the arena (17 by 11, the water, his place 7.9 tiles out, the tentacles' roots, the pillar spots), the
   camera's lean, the colours of the swamp, the enemy's pink and gold for his glows, nothing cyan.

## The pictures (`pictures/`)

- `eye_look.png`: his look, at the game's size, the Warrior on the stone before him twice (from behind and from in front) for
  scale: his head shut; his head split open, the tongue risen with the eye on its tip; each at twice the size (their middles:
  the seam and the tongue; the split, the teeth and the throat); the tongue-eye close (three times the size); one tentacle
  (twice the size); under the water (phase 1); from behind (half size).
- `eye_arena.png`: the new arena as the player sees it, a phone held sideways (the game's own 507 x 234 game pixels, two
  picture pixels to each), the camera leaned toward him as before. Phase 1: the black water across the top, his eye's fire
  under it, two tentacles up out of it, the hero on the stone below. Phase 2: his head risen, filling the top of the screen,
  shut, his tongue out of his seam and the eye on it watching the hero, three tentacles. Each again at twice the size, in two
  halves. Then, small: today's fight from the game itself, and the new one beside it. Then the camera as the game sets it when
  the hero stands in the middle of the stone (no lean). Last, a plan of the arena from above.

Everything round him is the game's own: the fen's paving and black water from the fen's terrain painter (`art/fen.ts`,
`art/terrain.ts`), the fen's pieces (`art/floor10.ts`), and the Warrior as the game paints him (`art/heroes3.ts`).

## What he is now

HIS HEAD. A huge dome of rotting grey-green flesh risen out of the black water, the head itself the creature: two great
swollen lobes of crown either side of the seam, the left heaved higher, the right slumped lower; tumours swelling out of
the crown; the mass of the head sagging below, jowls drooping toward the water, the neck going down into it, flesh that has
run off him slumped at the waterline in heaps crusted with barnacles. Wrinkled and lumpy all over, ancient; dark veins;
boils and open sores; bruising in soft gradients; darker toward his edges.

MELTING AND DRIPPING. Two sheets of his flesh have slid down over him like melting wax, the upper the thicker, each sheet's
edge running down in drips of every length (74 of them round him, the longest 196 of his lengths, 5 tiles), each drip necked
where it leaves the sheet and swelling to a fat end; thin runs of goo down him between; drips hanging off his overhangs (27 of
them, placed where the air is under him), gobs of him let go and falling (10), a splash on the water where each lands and where
each rope of drool meets it (13 in all); little drips with fat
beads off every lower edge; goo sheeting down him in slick streaks, bubbles in it. His outline runs downward everywhere.

THE SEAM AND THE SPLIT. Shut, a seam runs down his middle from crown to chin, wandering a little: swollen wet lips rounding
into a deep dark crack running with drool, slime webbed across it every so often, his fangs locked away inside it; low on
it a slit where his tongue comes out, its lips round the tongue, slime strung across, drool in ropes off its lower lip to the
water. Split open (the halves swing 0.56 radians, 32 degrees, each, on a hinge at the back of his skull, 176 of his lengths
behind his middle), the two halves stand 356 of his lengths apart at his front (9 tiles): along both inner edges, top to bottom, two
rows of hooked fangs set in raw red gums (crooked, of every size, some long, some broken, each hooked back toward his
throat); the hollow of each half wet and ribbed across; between them the back of his throat, a wall of wet ribbed flesh, his
gullet a hole in it glowing pink burning to gold deep inside; strings of spittle stretched across the gap, some snapped and
hanging; drool in ropes off the halves' lower edges into the water.

THE EYE ON HIS TONGUE. His tongue: one smooth tube, sampled close like the tentacles (no sections), thick at his throat (24 of
his lengths) and tapering (to 13) before its tip swells round the eye, slick and paler beneath, a groove down its back,
its skin rough with papillae, veined where it swells. The eye: 50 of his lengths in radius (100 across: 58 game pixels, twice
the knight's height), yellowed and bloodshot, its iris the enemy's pink burning to gold round a black slit, in a cup of the
tongue's flesh whose raw lids part in an almond round where it looks; the brightest thing on him, its glow on what is near it.
Shut, the tongue snakes out of the slit low on his seam, down and aside, and rears up in an S, the eye at its tip watching
you. Open, it rises out of his gullet in an S between the halves, the eye high over the split. Under the water (phase 1), it
rears up the front of him, the eye's fire between his two arms.

HIS TENTACLES. As they were (where they rise, their lie), each now ONE CONTINUOUS TAPER: its spine sampled at 120 points,
its thickness one smooth taper by its length (from one sample to the next it changes at most 0.9 of his lengths), dark along
its back shading smoothly to pale beneath by a dither; its underside carried along it without a twist (at most 12 degrees
from one sample to the next), turned smoothly from aside at the root to the inside of the tip's curl, so that its suckers run
in two rows down one side all the way, never jumping; the suckers counted along it so that they shrink evenly toward the tip;
no scars across it, no broken glints, no line where a part of it runs on over itself (only where it truly crosses over itself).

An enemy: the pink edge round him; pink and gold his only glow; nothing cyan.

## How he will move (for the next stage)

- His melting never stops: the sheets of him always sliding down, slowly; the drips always running, each down its own path,
  swelling at its end until it lets go; gobs falling and splashing into the water, the splash's ring spreading; new flesh
  welling up out of him at the top as the old runs off, so that he never runs out; drool always dripping off his lips and
  teeth; the goo on him always sheeting down.
- His tongue never still: always weaving, swaying and curling like a tentacle, the eye on its tip turning to keep watching the
  hero wherever the hero goes; it rears back before it strikes.
- His head splitting: the seam parting from the bottom up, spittle stretching between the halves and snapping, the halves
  swinging apart on the hinge at the back of his skull, the tongue rising out of the throat; and closing again, the teeth
  locking.

## For the main chat

- The stone: 17 tiles across the screen by 11 deep, its far long edge open on the water. As before.
- His distance out: his middle at the water 7.9 tiles out from the stone's edge (310 of his lengths). As before.
- The tentacles' roots: as before (in the water 1.4 tiles out from the stone's edge; phase 1 at a third and two thirds along
  it; phases 2 and 3 left, middle and right). Each is clear of all of him (his head, his tongue, his eye, his drool) by at least
  17 of his lengths shut and 12 split open, and 10 clear of the stone.
- His head: about 15 tiles across, the front of his head 3.9 tiles back from the stone's edge; split open, the halves swing
  back and out to about 18 tiles across.
- His tongue and eye are an enemy's weapon of their own when the moves are drawn (the eye can be struck, or can strike). Shut,
  the eye sits 1.3 tiles before the front of his seam and 5.6 tiles over the water; the tongue and eye out over the water reach
  to 1.2 tiles short of the stone's edge.
- The three pillars of phase 3: where they were (on the plan).
- The slam's area (a tentacle's slam toward the hero): as before, yours to say.

## His numbers

- The phone's screen: 507 x 234 game pixels (`engine/screen.ts`; the game's own playtest logs it on a phone held
  sideways). That is 15.8 tiles across and 14.6 tiles top to bottom (a tile 32 x 16 game pixels).
- His head alone, shut, at the game's size: 347 game pixels across and 242 over the water (295 top to bottom with what is
  under the water's edge), the knight standing 29: eight knights tall. With his tentacles: 395 x 345. Split open, his head 420
  game pixels across and 259 over the water, his eye on its tongue high over the split.
- His eye: 58 game pixels across (the knight 29).
- In the leaned arena view (phase 2) his crown runs 156 game pixels off the top of the screen: the seam below it, his
  tongue and his eye are on it.
- Under the water (phase 1) he lies 452 of his lengths down and 330 further back than risen, his crown 22 of his lengths under
  the surface (his crown stands 430 over the water risen); his tongue reared up the front of him under the water, the eye on it
  156 of his lengths down, its fire seen in the water before the stone between his two arms.

## Why the fight today is not scary (the audit)

1. His size: about 127 x 61 game pixels on a 507 x 234 screen, his eye about 32 across: about the hero's own height.
2. Where he sits: flat in a pool in the middle of a round ring, seen from above, with the hero right beside him; nothing of him looms over the hero.
3. How he moves: he never moves or turns (`game/act1_rules/eye.ts`); risen he only sits higher in his pool; his arms come up from cracks round the ring.
4. His frame rate: his frames are up to 860 x 790 picture pixels, so he is held at 15 frames a second and his surfacing and death at 10 (`EYE_MOVES`; `EYE_COST`, 676 frames, 320 MB): his biggest moments are his choppiest.
5. His entrance: a 4.2-second surfacing at 10 frames a second; the screen shakes twice (7 at the break, 5 at the roar) with a slam, a wave and his roar; the camera does not move and the screen does not darken.

## An epic entrance, within the game as it is (choices to put to him)

- What rises first: the water goes still and black; rings spread; his eye's fire swells under the water; his tongue breaks the
  surface first, the eye on its tip, and rears, looking at you; then his crown breaks the surface, melting, muck pouring off
  him, and he rises; last, his head splits open down its seam in the roar.
- The screen darkens: the fen's dusk drops to near night for the rise, so that his eye's fire and the hero's own light are
  all that is lit; it comes back as he roars.
- The screen shakes: a low rumble growing all through the rise, a big shake as he breaks the water, another at the roar.
- The camera: glides up toward the water as he rises and settles leaned toward him (the Moth's lean), so the hero drops to the
  foot of the screen and he fills the rest.
- The water: a wave rolls off him over the stone's edge as he comes up; muck and goo rain down.
- The sound's cue (for the sound chat): the music cuts to silence; a deep rumble; a wet tearing groan as he rises; his roar as
  his head splits; then his music.

## What he costs

- A frame of him risen, his arms with him: about 960 x 680 picture pixels, at 4 bytes a pixel 2,611,200 bytes (2.49 MB).
  Split open, with his tongue risen, about 1,000 x 900.
- Baked at 30 frames a second: 74.7 MB for each second of him. Too much to hold whole. Ways to afford him (for the main chat):
  his head painted once a few times a second and only what moves (his tongue and eye, his drips, his arms, each a small
  picture of its own) at 30; or baked to files and read as they are needed (his word of 6 Nov: the game may carry files).
- Painting a frame, here without a browser: about 70 seconds shut, about 2 minutes split open, 45 seconds under the water
  (this container, two jobs at once). Not to be painted while the game runs: baked.

## How to make the pictures again

```
node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/eye_today.mjs --out shots/eye_today/x
npx tsx tools/eye_redo_pics.ts look shots/eye_redo/look
npx tsx tools/eye_redo_pics.ts arena shots/eye_redo/arena
python3 tools/eye_redo_sheet.py look shots/eye_redo/look docs/mockups/eye_redo/pictures/eye_look.png
python3 tools/eye_redo_sheet.py arena shots/eye_redo/arena shots/eye_today/x_risen.png docs/mockups/eye_redo/pictures/eye_arena.png
```

(`eye_redo_pics.ts` keeps each painting of him in `shots/eye_redo/cache`, so the arena does not paint again what the look
painted; a change to `eye_colossus.ts` makes them all again.)

## Before: the body (the art chat's notes)

The first pass broke his rule of 6 Nov, 15:18 (“Everything drawn should not just look like shapes.  That’s the rule”); the
second redrew it; the third (3e7b6844) made the body a towering, hunched, lopsided mass, less island, more horror, and took
the line off the tentacles. On 3e7b6844 he scrapped the body (above): its hill, brow, eye socket, maw, spines, horns, bones,
stones, moss and tendrils are gone from the file; the tentacles, the arena and the water stayed.

## Checks

`tests/eye_colossus.test.ts`: (1) the switch off and nothing of the game importing him, nothing of the old Eye in him; (2) his
pictures (his head shut from in front and from behind, split open, under the water, a tentacle alone) with nothing cyan, the
pink edge round him, his iris pink burning to gold (shut and open); (3) his lengths the game's, his eye huge, a frame's cost;
(4) his arms clear of all of him (head, tongue, eye, drool) and of the stone, their roots under the water before it, where the
main chat's layout puts them, shut, split open and under the water; (5) his head splits: shut no tooth shows and his eye is
out on his tongue low before him; split open, his halves far apart, rows of teeth, his throat, spittle across the gap, the
eye high over the split, the tongue running from his throat into the eye; under the water, nothing of his head above it; (6) every tentacle and his tongue one smooth taper:
sampled close, no step in its thickness, no twist, the suckers in order; (7) he melts: drips, gobs, splashes, the sheets
running off him in drips, goo on him. `tsc --noEmit` clean. Stage 1 only: no moves, so the boss checks
(`art/boss_checks.ts`) come with his moves.
