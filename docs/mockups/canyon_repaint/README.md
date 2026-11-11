# Floor 8, Echo Canyon, repainted against the 3D model

A chat working from his queue, on the branch `art/canyon-repaint` (from `main` at 797f2e4d, the game as released, 25.3.1).
BEHIND A SWITCH THAT IS OFF (`CANYON_RIM`, src/art/canyon.ts). HE HAS SEEN THE PICTURES AND SAID YES (11 Nov 2026, below): the
main chat brings it in and sets the switch on.

## What began it

His word, Wed 11 Nov 2026, 07:03 (Eastern): "Work on the queue". The first waiting item in his order was the art chat's
"Repaint the canyon against the main chat's 3D model" (queue id `repaint-canyon-against-model`): the plateau tops and the canyon
floor are hard to tell apart; a first fix (darker tops, a lighter riverbed, longer shadows) went live in 25.2.10; the main chat's
grey 3D model of a canyon at the game's camera is on `main` (tools/canyon_model.py, tools/scenarios/canyon_model.mjs).

## What the model shows

The model was rendered here for six places on floor 8 (seed 9), each beside the game's own picture of it
(pictures/model_across.png is one). Read against it:

- THE WALLS ARE WHERE THE MODEL PUTS THEM. Every face that looks toward the eye is drawn, down to the bed (floors 8 and 9's mend
  of 4 Nov). Nothing to change there.
- A NEAR CLIFF HAS NO EDGE. The model's near cliff stands 75 game pixels over the bed and would hide it, so the game cuts it away
  (his rule: nothing stands over the walkable floor). What is left beside the bed's near edge is the top from 75 game pixels
  further back, where it has no rim. So the top began with no edge at all: shaded bed ran into olive top, and the two read as one
  level. Every far cliff has its pale caprock rim; no near one had.
- THE WALLS THROW NO SHADOW. In the model the walls stand 75 game pixels, nearly three heroes high. Lit from the upper left (his rulebook), the walls
  whose faces are in shade would throw a long shadow down the screen to the right across the bed. The game had only 7 picture
  pixels of shade at a wall's foot, so nothing on the bed said how tall the walls are.

## What is repainted (with the switch on)

1. THE RIM WHERE A NEAR CLIFF IS CUT (`cutRim`, src/art/terrain.ts): the top is given its rim where it is cut, along the bed's
   own edge on the picture. It is the canyon's own caprock (`C_CAP`, its cracks), nothing new painted; 1.7 times as wide as a far
   rim, since a near edge has no face under it to set it off (`CANYON_RIM.rim`).
2. THE WALLS' CAST SHADOW (`shade`, src/art/terrain.ts): the walls in shade throw their shadow along the world's x (down the
   screen to the right), 2.3 tiles long, three tenths dark, half that along its last quarter tile: crisp steps, as the near
   cliff's shadow is (`CANYON_RIM.shade`). A wall whose face is lit throws none.
3. A SHADOW'S EDGE IS THE WALL'S OWN LINE (his words to the first pictures, below). The near cliff's shadow reached a different
   way up each column (its reach wandered from three quarters to five quarters, a column at a time), which gave its edge teeth
   where the cliff's own edge is smooth. Now it reaches the same 2.1 tiles everywhere (`nearShadow.even`), so its edge is the
   cliff's edge moved up the picture. The cast shadow is the same length all along too, thrown by the bed's edge as it is painted.
4. KEPT AS IT IS: how deep and how dark the near cliff's shadow is (his yes of 8 Nov, 25.2.10), the tops' olive and the lighter
   bed (`CANYON_APART`), every wall, the bed, the tops, and everything that stands on them. No texture is repainted, so the level
   of the art is the game's own (his measure, 9 Nov: no finer, no rougher).

`shade` can also darken the bed where the rock shuts out the sky (`dark`, `at`, `wide`). That was tried in place of the near
cliff's shadow and looked flatter at the near edges, so it is set to nothing (`dark: 0`) and the near shadow is kept
(`near: true`).

Nothing painted stands over the walkable floor: every pixel shows the kind of ground it did (tests/canyon_rim.test.ts).

## Pictures (pictures/)

- edge.png: a near edge close up, the game now beside the repaint.
- wide.png: the canyon from far out, now beside the repaint.
- across_now.png, across_repaint.png: the game at his phone's size (852 by 393, three to a point) where the canyon runs across
  the screen; along_now.png, along_repaint.png: where it runs up the screen.
- model_across.png: the 3D model of the first place, under the game's picture of it.
- shadow_edge.png: the shadow he circled, the first repaint beside this one.

HIS WORDS, 11 Nov 2026. Shown edge.png, wide.png, across_now.png and across_repaint.png (the first repaint: the rim and the cast
shadow, the near shadow's reach still wandering), asked "Is this right?": "Closer, not there yet". Asked what still looks off:
"The shadow is spikey when the wall is not", and by 07:40 across_repaint.png sent back with the near cliff's shadow circled in
red, its toothed edge above the smooth rim. Read as: a shadow's edge should run as the wall that throws it runs. Done (3 above);
the pictures here are of that. Shown shadow_edge.png and across_repaint.png and asked "Is the repainted canyon right now?", by
07:55: "Yes, hand it to main (Recommended)".

## How to see it

    sed -i 's/export const CANYON_RIM = { on: false,/export const CANYON_RIM = { on: true,/' src/art/canyon.ts
    node tools/build_to.mjs dist/canyon_repaint.html
    sed -i 's/export const CANYON_RIM = { on: true,/export const CANYON_RIM = { on: false,/' src/art/canyon.ts
    node tools/playtest.mjs --file dist/canyon_repaint.html --touch --size 852x393 --dpr 3 --scenario tools/scenarios/canyon_repaint.mjs --out shots/canyon_repaint/repaint

(The switch is flipped in the file for the build, since nothing of the game but render/outdoor.ts may import art/canyon.ts, and
the ground is painted in the painter's worker too.)

## What it costs

Five pieces of 256 by 256 picture pixels, the best of three, on this machine: 331 and 339 ms with the switch off, 381 and 368 ms
with it on (two runs each way): about an eighth more. The field, worked out once a floor: 24 and 48 ms off, 49 and 38 ms on.

## Checked

`tsc --noEmit` clean. tests/canyon_rim.test.ts 6 of 6 (off, the look is the game's; on, every pixel the kind it was; the rim
along the near edges; the shaded wall's shadow three tenths dark, the lit wall's none, the open bed as it was; the near shadow
as deep and as dark; its edge with no teeth: 67 picture pixels up from the cliff's edge in every column). tests/canyon.test.ts 9 of 9, tests/terrain.test.ts 10 of 10, tests/f8f9.test.ts 7 of 7. The game played to the six places
and to a stronghold's door on floor 8 with the switch on: no errors.

## For the main chat

- Merge `art/canyon-repaint`; with his yes, set `CANYON_RIM.on` to true. Nothing else is needed: the look reads it
  (`cutRim`, `shade`, `nearShadow`), and the painter's worker paints by the same look.
- `cutRim`, `shade` and `nearShadow.even` are new and optional; no other floor's look has them, so no other floor changes.
- THE SAME TEETH ARE ON EVERY OTHER FLOOR WITH A NEAR SHADOW (the Quarry, the Ledge Road, the city's floors: each look's
  `nearShadow` wanders the same way). `even: true` on a look takes them out. Not asked of him yet.
- Floor 6 (the Quarry) is painted by the same painter and could take the rim and the cast shadow too. Not asked.
