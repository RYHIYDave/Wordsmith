# Floor 9, the Pinewood: the art chat's mock-ups (branch `mockup/act1-pinewood`)

His word, 15 Oct, by 10:28, to "Floor 8 is done. On to floor 9, the Pinewood?": "Yes, floor 9 go (Recommended)",
offered as: in the same order as before: its ground, its pieces, the Hollow Stag, then the Twisted Deer and Fog
Wolves, each shown to you first. This branch starts from `mockup/act1-canyon` at 5a7122a (floor 8, all of it with
his yes). Nothing here is in the game.

## Its ground (src/art/pinewood.ts, painted by src/art/terrain.ts; HIS YES)

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

Shown `shots/pine_ground.png` and `shots/pine_close.png` and asked "Is this the Pinewood's ground?" (offered: "Yes, on
to its pieces (Recommended)", next: the pines, groves, footbridges, the hunter's cabin, the cult's camp, twisted trees
toward the swamp; "Not yet"), his answer, 15 Oct, by 11:04 (the clock read 11:04:15 just after): "Yes, on to its
pieces (Recommended)".

NEXT: its pieces (25, his rule of 10 Oct: “Going forward, let's do 25 that are the theme of the 5 levels, then 25
for each boss.”), themed after the Pinewood and the Hollow Stag.

## Its 25 pieces (src/art/floor9.ts, `pinewoodPieces()`; HIS YES)

The first 13, the wood's own, shown as `shots/pine_pieces.png` and asked "Are these the Pinewood's own pieces?"
(offered: "Yes, on to the rest (Recommended)"; "Not yet"), his answer, 15 Oct, by 11:13 (the clock read 11:13:17
just after): "Yes, on to the rest (Recommended)".

- THE WOOD'S OWN (13): old pine (3 sizes; flat-painted as floor 6's are, a trunk of red-brown plated bark, a crown
  in lopsided tiers lit at their upper left, a spire), young pine (2), pine snag (dead, grey, broken top, woodpecker
  holes), fallen pine (a trunk torn up by its roots, moss along it, its broken end splintered), stump (the hunter's,
  its rings, the axe's last step), mossy boulder (2), ferns (2), bilberries (blue-black, never red), toadstools (a
  ring, pale caps, never the fly agaric's red), a stag's skull and antlers, twisted pine (2; toward the swamp, bent,
  dead bark, drooping tufts, the sickness's dull violet in them), cattails, river stones. The tall ones (pines, snag,
  twisted pines) are seen through while someone stands behind them.
- THE HUNTER'S (6): the footbridge (a floor tile, along x and along y: planks nailed across two logs; the water runs
  on under it, painted by the ground), the hunter's cabin (round logs, a mossy shingle roof, a stone chimney, its door
  ajar, antlers over it, a bench), his woodpile and chopping block (a breakable: stacked, then knocked about), his
  drying rack (hides stretched on poles), his snare (THE TRAP: 4 frames, hidden under needles, its jaws seen, it
  springs, shut), his journal (THE QUEST PIECE: open in the grass, a stag drawn on its leaf).
- THE CULT'S CAMP IN THE WOOD (5): the cult's siege tent (a great violet bell tent, the mark on it), siege ladders
  (made from the wood's pines, on trestles, one half finished), a battering ram, half built (a pine trunk slung in a
  wheeled frame, its head iron-bound, the cult's violet on it), barrels of pitch (a breakable), felled pines, stacked.
  Read as, not asked: the siege of the town is fed from this wood; the cult fells its pines for ladders and a ram.
- THE STAG'S (1): the Stag's shrine: a post of dead pine, a stag's antlers lashed to its top with the cult's violet,
  the mark daubed on it, a ring of stones, bones, the sickness in the grass round it.

The cult's fire (art/act1_cult.ts `pinkBrazier`) and banner (`cultBanner`) are the cult's own, as on every floor.

    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_pieces.png 1014 2610 pieces
    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_dressed.png 1014 468 dressed

`tests/floor9.test.ts` (7): nothing of the game imports them; each has pictures and its own name, none gives light;
crisp, no loose pixels; no cyan, no pink or red, duller than every word; what stands stands on its foot, a floor
tile's and the trap's inside the diamond; nothing cut off; 25 of them.

All 25, with the screen dressed with them (`shots/pine_dressed.png`, `shots/pine_pieces.png`), asked "Are these the rest
of the Pinewood's pieces?" (offered: "Yes, on to the Hollow Stag (Recommended)", next the boss's brief as a few quick
questions, then his look; "Not yet"), his answer, 15 Oct, by 11:24 (the clock read 11:24:10 just after): "Yes, on to
the Hollow Stag (Recommended)".

## The Hollow Stag, floor 9's boss

His design doc ("Wordsmith Act 1: The Descent (Levels 6–10)", the planning chat's, with his yes of 12 Oct, 18:07):
"A great stag hollowed out by the swamp's influence, with a blinking eye visible through its ribs. It foreshadows
the Drowned Eye." Its floor is the Hollow Wood. "Moves: an antler gore (its basic attack); a charge that splinters
trees; lines of roots bursting toward you; a bellow that wolves answer from the fog."
