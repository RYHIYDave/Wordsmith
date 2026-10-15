# Floor 9, the Pinewood: the art chat's mock-ups (branch `mockup/act1-pinewood`)

His word, 15 Oct, by 10:28, to "Floor 8 is done. On to floor 9, the Pinewood?": "Yes, floor 9 go (Recommended)",
offered as: in the same order as before: its ground, its pieces, the Hollow Stag, then the Twisted Deer and Fog
Wolves, each shown to you first. This branch starts from `mockup/act1-canyon` at 5a7122a (floor 8, all of it with
his yes). Nothing here is in the game.

## Its ground (src/art/pinewood.ts, painted by src/art/terrain.ts; for his yes)

The measure is the planning chat's Pinewood he said yes to (13 Oct, by 08:23, "Yes, this is it (Recommended)";
src/dev/preview_act1.ts, hash `pine`, on `mockup/act1-levels`), and his words: 13 Oct, 08:19, "I’d like the forest
to be very open.  Really big open areas that cross the river on little bridges"; 12 Oct, 18:56, "The forest and the
swamp don’t really have walls".

- THE MEADOWS (the walkable floor): grass in slow patches of tone, its blades lit at their tips with their shade
  under them, tufts of three to five blades; wildflowers (cream, dull gold, dull lilac) scattered, thick in drifts;
  bare earth worn through; the trails of packed earth with pebbles and a few blades through; toward the wood's edge
  the grass darker in its shade, strewn with fallen needles and cones.
- NO WALLS (his word): the forest floor goes on at the meadow's height (`rise` 0): a litter of brown needles lying
  flat, moss in patches, ferns, fallen twigs; darker the further under the trees; at the wood's edge a ragged fringe
  of long grass and ferns. The dark patches in the meadow, and the band along its far edge, are the forest floor
  where the groves and the wood stand: the trees come with the pieces.
- THE RIVER, out of the canyon: dark slate water (its hue clear of cyan), deepest along its middle, ripples streaming
  along its flow, glints, a line of light where it meets its banks; banks of wet mud with river stones; lush grass
  and reeds by the water. Under a footbridge (walkable tiles) the water runs on under where the bridge will be.
- THE SWAMP'S SICKNESS, creeping in from the east: the grass drained grey, veins of dull violet through the ground.

FOR THE MAIN CHAT: `pinewoodLook({ river, trail, sick })` makes the look for a level from what only the level knows,
each optional: how far a place is from its river's middle (tiles; the water `RIVER_HALF` 0.55 either side, its bank
0.2 more), from its nearest trail's middle, and how sick its ground is (0 to 1, toward the swamp). Give them cheap
(the dev page holds them as grids, eight cells to a tile: a 256 by 256 piece then costs 38 to 106 ms, under the
canyon's 66 to 142; computed afresh from curves each pixel it cost 434 to 686). The dev page lays the tiles by hand
in the mock-up's shape (`PINE_SHAPE`); how the real Pinewood is laid is the main chat's.

    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_ground.png 1014 468 shot
    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_close.png 1014 936 close
    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_tiles.png 1014 468 tiles
    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_cost.png 1014 200 cost

`tests/pinewood.test.ts` (8): nothing of the game imports it; every walkable tile's middle floor and no other's; no
walls (only floor and the forest floor painted, a pixel floor exactly where the ground is); the water where the
level puts it, under the bridge too; two pieces one picture, the same every time; opaque; no cyan, no pink, every
colour duller than the dullest word's (Colour 3 and 4); every blade and tuft lit at its top, its shade under it.
