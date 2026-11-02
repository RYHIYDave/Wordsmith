# THE FIRST TOWN, REDONE TO GO WITH FLOOR 1'S NEW LOOK (PICTURES FIRST; NOT IN THE GAME)

Branch `art/town-look`, from `art/floor1-look` at b2f2338 (floor 1's look B made game-ready: the style matched). The three
looks for him to pick from: `src/dev/town_look_paint.ts` (the place), `src/dev/town_look_life.ts` (the owl and the tree) and
`src/dev/preview_town_look.ts` (the page that lays the pictures out), checked by `tests/town_look.test.ts`. Nothing of the
game imports any of it, and nothing of the game is changed: no switch is needed until his pick is made game-ready.

## His words

- 2 Nov 2026, 15:37, after picking floor 1's look B (“B, roots break in”: thick tree roots through the vaults, moss on the
  tombs, green-gold light, dripping water): “Unfortunately that means the first town is going to have to be redone as well.
  In sort of the same style as the wardens.  Maybe more sun, and more plants.  An owl in the rafters.  Hastily barricaded
  windows”.
- Read as (and he was told so): the town's hall in the same style as floor 1 (pale carved stone, roots, moss, green-gold
  light), but MORE SUN (it is above ground: broad warm daylight, the brightest place in the act) and MORE PLANTS (ivy and vines
  on the stone, flowers, potted herbs, a tree's roots and branches coming in), AN OWL IN THE RAFTERS (the hall roofed with
  timber rafters seen above, an owl perched on one, alive: blinking, turning its head, ruffling now and then), and HASTILY
  BARRICADED WINDOWS (tall windows boarded over in a hurry with odd planks, nailed crooked, a cart wheel or a door wedged
  against one, sunlight knifing through the gaps in bright slats onto the floor: the town is holding out against what comes up
  from the crypt).

## What is drawn

The town's hall exactly as the game lays it (game/level.ts `TOWN`, game/ways.ts): its floor x 6 to 21, y 6 to 19; its two back
walls (along x lit, along y in shade), 80 high as floor 1's; the two toward the eye cut low with a coping, as the game leaves
them. EVERYTHING KEEPS ITS PLACE AND IS THE GAME'S OWN PICTURE: the smithy (forge, anvil, rack, trough, the armourer), the bazaar
(the tent, the table of wares, the rug, the mystic), the wordsmith's ring (the circle, the slab, the six stones, the
wordsmith), the Lexicon, the stash, the waypoint's dais, the stranger in the top corner, the braziers, barrels and urn; the
shaft's head with its cage in the near corner (art/town_ways.ts `townShaft`); the knight among the vendors (in town, his sword
on his back). The town's own things are painted in each look's stone (art/town.ts `makeTownProps(theme)`), their purple iron
turned to grey steel and their plum wood to the look's timber; the town's own teal-to-cyan kept just where it is now (the
Lexicon's script, the stash's stone, the ring's runes, the tent's stripes and the mystic's wares); the people as they are, but
a pink in the mystic's turned an honest red (nothing pink in the town).

New in all three:

- **The walls**: pale dressed stone in courses on a moulded plinth, A PILASTER every two tiles (floor 1's), moss low down and in
  the joints, IVY climbing from the foot and hanging from the top, a flower in it here and there; along their tops a TIMBER
  WALL PLATE (80 to 90).
- **THE BARRICADED WINDOWS**: five tall round-headed windows down the left wall (the sun's side) and three in the right, each
  boarded over in a hurry: a handful of ODD PLANKS of two woods nailed across crooked, overhanging onto the stone, their nails,
  splits and shadows on the stone; A CART WHEEL wedged against one (its iron tyre, spokes and hub), A DOOR off its hinges
  against two others (its boards, ledges and ring). The day shows through the gaps, and THE SUN COMES IN THROUGH THEM: each gap
  throws a slat of light on the floor (worked out ray by ray, so the slats are the gaps' own shapes), and in A the slats are
  seen in the dusty air too.
- **THE ROOF**: a steep timber roof over the hall, its ridge along x over the middle. Over the left wall its GABLE, half-timbered
  (posts, rails and braces of the roof's timber, lime plaster between, fallen in places to the wattle), a round window high in
  it, boarded. Over the right wall the ROOF'S UNDERSIDE: rafters, purlins and boards, a chink of day between them here and
  there; and HAMMER-BEAM TRUSSES on the right wall: a wall post on a carved stone corbel, a brace, a hammer beam jutting out
  from the plate, a post standing up from its end. The roof is drawn only where the game shows nothing (above the back walls),
  so it never hides the floor.
- **THE OWL** (`town_look_life.ts`, an original drawing at the heroes' grain): a barn owl, a pale heart-shaped face with dark
  eyes, a buff and grey back and wings, a white flecked breast, feathered legs and dark talons, on a hammer beam over the
  smithy (in every phone screen). Its moments (`OWL_MOMENTS`): sitting and breathing (its breast rising), blinking (the lids
  down), its head turned (the face swung round out of sight), ruffled (its feathers lifted all over).
- **THE PLANTS**: potted herbs, flowers, ferns and little clipped bay trees in terracotta pots along the walls' feet (under the
  pilasters, clear of the windows) and by every vendor's place; grass and little flowers up through the floor's joints; ivy
  winding up the two pillars; the tree's roots through the left wall's foot across the floor (the roots that break into floor
  1's vaults below), its boughs over the gable.
- **THE STAIRS DOWN TO FLOOR 1** where the game opens them (three tiles by two, by the stash), a low parapet of the hall's stone
  round three sides, open at the top of the steps: down them the hall's pale stone turns to floor 1's (moss in the joints,
  damp, a root through the side wall) and at the foot floor 1's green-gold light. It leads into floor 1 B's stairs up.
- **THE GATE OUT TO THE QUARRY** in the right wall where the game has it: a round-headed way under a ring of voussoirs, a
  cornice, its portcullis down, and through its bars the bright day outside (a pale road, grass).
- **The floor**: pale flags a tile each with a carved border (floor 1's), worn lighter where they walk, moss in the joints.

## The three looks

- **A, MORNING THROUGH THE BOARDS** (`a_morning_through_the_boards.png`, `a_phone.png`): the hall whole under its timber roof; a
  low warm morning sun through the boarded windows of the left wall, long gold slats across the floor round the ring and the
  pillars, dust in them; a honey limestone; the most plants.
- **B, THE ROOF FALLEN IN** (`b_the_roof_fallen_in.png`, `b_phone.png`): the roof fallen in over the back corner, the gable's top
  broken; an OLD TREE outside the corner leaning in through the hole, its boughs and leaves over the hall, a bough hanging in;
  its ROOTS thick across the floor from the corner; the sun pouring down through the hole in a great dappled shaft onto the
  floor before the gate, the waypoint and the Lexicon; floor 1 B's greener, mossier stone, the light green-gold. The rafters,
  the hammer beams and the owl over the rest.
- **C, BARE RAFTERS AT NOON** (`c_bare_rafters_at_noon.png`, `c_phone.png`): the roof's boards gone, its rafters bare to the sky
  and grown over with vines; the noon sun through them in a LATTICE of light and shade over the whole floor; a pale near-white
  stone, grass and flowers thickest in the joints. The brightest of the three.

`town_look_sheet.png` (1200 x 5344) has the three, each with its phone screen, labelled A, B, C with a line each; the owl three
times as big at its four moments, from below; and two barricaded windows close (A), the cart wheel against one, the slats on
the floor. `the_owl.png` (1000 x 300) is the owl alone.

The art chat's lean: **A, morning through the boards**. It answers every word of his most plainly (the hall roofed, the owl
in the rafters, the windows boarded with the sun knifing through them in slats) and it is the warmest, most homely place to
come back to; the slats fall round the ring and leave the vendors' places clear to read. B is the most striking and ties the
town to floor 1's roots best, but its great shaft of light washes over the middle of the hall; C is the sunniest, but its
lattice of shade makes the floor busy under the knight.

## How the pictures are made

```
node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/a_morning_through_the_boards.png 1200 840 "overview:boards"
node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/a_phone.png 1014 468 "phone:boards"
  (and "overview:fallen" b_the_roof_fallen_in.png, "phone:fallen" b_phone.png, "overview:rafters" c_bare_rafters_at_noon.png, "phone:rafters" c_phone.png)
node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/the_owl.png 1000 300 "owl"
PREVIEW_TIMEOUT=600000 node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/town_look_sheet.png 1200 5344 "sheet"
  ("window:<look>" at 880 x 560 shows the windows close on their own)
```

The whole hall is 600 x 420 game pixels at two picture pixels each (the game's own size); a phone screen is 507 x 234 game
pixels with the camera on the knight (the same spot in all three, to compare). The place is painted in picture pixels on the
game's grid, WITH A DEPTH FOR EVERY PIXEL (x + y of the world point seen there), as floor 1's looks were: for every pixel its
line of sight is followed into the hall and the nearest of the floor, the stairwell, the back walls with their windows, the
gate, the gable and the roof's underside is painted (`paintPlace`); the pillars, pots, trusses and the stairwell's parapet are
found by following each pixel's line of sight into them (`march`). THE SUN is worked out, not painted on: a point is in the sun
if the line from it toward the sun passes through a gap in a window's boards (all three), the hole in the roof and between the
tree's leaves (B), or between the bare rafters and their vines (C) (`sunAt`); A's and B's light in the air is followed along
each pixel's line of sight (`paintAir`). The game's own pictures are drawn at their size and depth, with the game's soft
shadow under them.

## What making his pick game-ready will need

As floor 1's look was (docs/mockups/floor1_look/README.md, "Made game-ready"), in files of their own behind switches that are
off, nothing of the game importing them until the main chat puts them in:

- **The floor** (`floor(tx, ty)`): the look's flags, with tiles laid over them: the tree's roots (straight, bending, ending, as
  floor 1's), grass in the joints, (B) the dappled pool where the hole's sun falls.
- **Faces** (a tile at a time, 80 high, along x lit, along y in shade): the stone with its pilasters and ivy, the timber wall
  plate along the top; THE BARRICADED WINDOW as a face of its own (planks, wheel, door), its gaps the day's colour; the hammer
  beam's wall post on its corbel at every truss.
- **The roof**: a picture to stand over the dark above the back walls, the gable over the left and the roof's underside over the
  right (A: boards; B: broken, the tree in its hole; C: bare rafters, vines, sky), drawn behind everything as the game's dark
  is; the hammer beams as pieces standing on the right wall's tiles.
- **The owl**: a piece on its hammer beam, its moments as a loop (sitting, breathing all the time; a blink every few seconds;
  its head turned now and then and back; a ruffle seldom), never in anyone's way.
- **The light**: the renderer's (render.ts: its dark with holes where a light burns), the town's dark lighter still than floor
  1's; THE SLATS (A) as pictures of light added (`'lighter'`) on the floor and in the air under each window, worked out once
  from the windows (they do not move); B's shaft as floor 1's shafts of daylight, large, dappled; C's lattice as a picture of
  light over the whole floor.
- **The town's own things**: made with `makeTownProps(theme)` in the look's stone (as here), their iron and wood recoloured; the
  stairs down (art/town_ways.ts `townStairs`) repainted in the look's stone turning to floor 1's, same size and anchor; the gate
  (its arch and pillars) in the look's stone, its portcullis and its barring and unbarring as now; the waypoint's dais in the
  look's stone.
- **The plants**: the pots as pieces (each blocking its tile, or set where nothing walks), the ivy in the faces.

### What differs from the game as it would be (so he is not surprised)

- The walls the game leaves out are as the game has them (the two toward the eye cut low); the roof is new: the game shows dark
  above the back walls now.
- The light will be the game's: a little darker away from the sun and the hero, the slats and the shaft drawn added.
- The stash, the trough and the tent's poles are in the look's timber, the anvil and the rack's iron grey steel; the mystic's
  pink is red.

## Checks

`tests/town_look.test.ts`, 5 of 5: nothing of the game imports the dev pages; every picture there at the size asked for (1200 x
840, 1014 x 468, the owl 1000 x 300, the sheet 1200 wide and under 7500 high); in each picture nothing pink but the knight's own
deep red, and the teal-to-cyan only round the town's own things where it is now (the Lexicon, the stash, the ring, the waypoint,
the bazaar, the smithy) and the knight; no pink or cyan in the owl; on each phone screen the knight standing out of the floor
round him, lighter and darker both; and each look well brighter in its lit places than floor 1 B (they come to 101, 106 and 118 of 255; floor 1 B's to 69). `tsc` is clean.

## THE CASTLE HALL: his pick, A, carried right inside the castle (pictures first; not in the game)

### His words

- Shown the three looks: “Well it’s still supposed to be in the castle.  Like right inside.  The barred door in the back leads
  out of the prison to the quarry”. Told him: redrawn as a hall right inside the castle, in the castle's own dressed stone, no
  half-timbered barn gable, the barred gate in the back leading out of the prison to the quarry; the owl, the plants and the
  boarded windows stay.
- Asked which of the three to carry into the castle hall: “A's sun through boards (Recommended)” (offered as: a great hall's
  timber roof over stone walls, the owl on a beam, low sun in gold slats through the boarded castle windows).

### What changed from A

The hall, its floor, its people and everything in it keep their places and are the game's own pictures, as in A; A's low
morning sun through the boards, worked out ray by ray, the gold slats on the floor and the dust in the air, as in A. What is new
(`town_look_paint.ts`, the look `castle`; the owl in `town_look_life.ts`; the pictures from `preview_town_look.ts`):

- **The walls are the castle's own thick dressed stone**, standing whole to 140 (the game's walls are 80: above that is what
  the game shows dark): deep courses of big blocks (18 high, 36 to 58 long), each dressed with a drafted margin, some tooled,
  a few a shade apart, a putlog hole here and there; a chamfered plinth; moss low down and in the joints; along the top A CORBEL
  TABLE (a row of little stone corbels under a projecting course) carrying the roof. No timber framing, NO GABLE END: A's
  half-timbered gable over the left wall is gone. A's fluted pilasters (floor 1's tomb) are gone too: this is the castle, not
  the tomb.
- **The windows are tall, deep-set castle windows**: two lights under round heads with a stone mullion between, set in a
  splayed embrasure (the wall's thickness seen in its jambs and sloping sill) under one round arch, a little round opening in
  the tympanum; four in the left wall (the sun's side), two in the right. HASTILY BOARDED as A's were (odd planks of two woods
  nailed crooked, overhanging onto the stone, one nailed up and down over the rest), as high as they could reach: the two round
  heads left open. A cart wheel wedged against one, a door off its hinges against two others. The sun knifes through the gaps
  in long gold slats across the floor round the ring and the pillars.
- **The roof is a great hall's timber roof**, HIPPED so there is no gable: it slopes up from the tops of both back walls, its
  hip rafter over the back corner, its wall plate on the corbel table, principal rafters over the trusses, purlins, common
  rafters, boards, a chink of day here and there. Drawn only where the game shows dark above the back walls, never over the
  floor.
- **The trusses spring from carved stone corbels** (three steps): a wall post up the wall to the plate, an arch brace curving
  out from it; on the right wall a hammer beam jutting out at the brace's head and a hammer post standing on it up to the roof
  (four of them, none over the gate); on the left wall, between its windows, the posts and their braces only (three), so that
  nothing crosses the windows.
- **THE OWL, second pass**: a real barn owl's shape at the game's size (36 x 42 picture pixels, a picture pixel each): a round,
  flat-topped head with no neck, the HEART-SHAPED PALE FACE in a thin ochre ruff (notched at the top, pointed at the chin, a soft
  ridge down to the little pale beak), the DARK EYES set in it with a brown smudge before each, the crown golden-buff washed with
  grey and peppered with white; a white breast with a few dark specks, buff at its shoulders; THE WINGS FOLDED soft along its
  sides in rows of golden-buff and grey feathers, white-dotted, their long barred tips reaching down past the belly either side;
  long feathered legs, a little knock-kneed; THE FEET GRIPPING THE BEAM, three toes each, the dark talons curled over its edge.
  Lit from the upper left, outlined. It sits on the end of the hammer beam over the rack and the forge, before its hammer post
  (in the phone screen). Its moments (`OWL_MOMENTS`): breathing in and out (its breast and wings swelling), blinking (the lids
  down), its head turned (the face swung round and narrowed, the far eye going), looking behind (its back of head to us, a
  sliver of the face at its side), ruffled (fluffed out all over, its edges ragged).
- **The barred gate in the back wall** where the game has it (the way x 13 to 16), plainly the way out of the prison to the
  Quarry: the castle's stone round it (big quoins up its jambs, long and short in turn; a ring of thirteen voussoirs with a
  keystone; a hood mould over them); its PORTCULLIS DOWN as the game draws it (art/gates.ts `makePortcullis`: an upright every
  quarter of a tile ending in a spike, a cross bar every 14) in the town's grey steel; through the bars the passage through the
  thick wall, lit from its far end, and the bright day beyond: the road out, pale dust with a cart's ruts, grass either side, a
  quarried block by it.
- **The plants**: ivy climbing higher on the taller walls and hanging in tongues from the corbel table, flowers in it; moss in
  the joints; the pots along the left wall moved onto the piers between its windows; grass and flowers in the floor's joints.
  The tree is gone (no gable for its boughs, and it is inside the castle's walls), and with it A's two little roots on the floor.
- **The stone**: a warm grey (the prison's dressed stone by day, the tomb's pale stone under it) in place of A's honey limestone.
- **The people are exactly as he said yes to them**: in A the mystic's pink stones were turned red; here nothing of any
  townsperson is recoloured (only the sun on them where it falls, as the game's light would be). So the mystic's two little pink
  stones (on his chain and his turban) are pink, as in the game: the one pink in the hall (14 pixels; the knight's own 3 beside
  it). His to decide. The town's own things (art/town.ts) are in the castle's stone, their iron grey steel and their plum wood
  the hall's timber, as in A.

### The pictures

- `castle_hall.png` (1200 x 840): the whole town as the castle's hall, the knight among the vendors.
- `castle_phone.png` (1014 x 468): one phone screen at the game's size, the knight among the vendors, the owl over the smithy.
- `castle_sheet.png` (1200 x 3569): the castle hall and its phone screen; A as he saw it (small, from its own picture) beside the
  castle hall; the owl close, three times the game's size, on its beam from a little below, at its six moments; a boarded castle
  window close (two times), the cart wheel against it, the light through it; the barred gate close (three times).

```
node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/castle_hall.png 1200 840 "overview:castle"
node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/castle_phone.png 1014 468 "phone:castle"
PREVIEW_TIMEOUT=600000 node tools/preview.mjs src/dev/preview_town_look.ts docs/mockups/town_look/pictures/castle_sheet.png 1200 3569 "castlesheet"
  (the viewport must be the sheet's full height, or only its first screen is painted; "owlclose", "cwindow" and "cgate" alone)
```

### What making it game-ready will add to the list above

As above for A, with: the castle's faces (a tile at a time: the dressed stone, the corbel table, the castle window as a face of
its own, its planks, wheel and door); the stone above the game's 80 and the hipped roof as one picture over the dark above the
back walls; the trusses as pieces on the walls' tiles (their corbels in the faces); the gate's quoins, voussoirs and hood in the
castle's stone round the game's own portcullis, its day beyond as a picture behind the bars; the owl a piece on its hammer beam
with its moments as a loop (breathing always; a blink every few seconds; its head turned now and then, looking behind seldom; a
ruffle seldom).

### Checks

`tests/town_look.test.ts`, 9 of 9 (the five above, and four for the castle hall): its three pictures there at the sizes asked
for (the sheet 1200 wide, under 7500 high); nothing pink in the hall or its phone screen but the mystic's own two stones (left as
he approved them) and the knight's own, the town's teal-to-cyan only round the town's own things where it is now and on the
knight; on the phone screen the knight standing out of the floor round him, lighter and darker both, and the owl seen there
over the smithy (its pale face and breast, its dark eyes); the hall as bright in its lit places as A (97 of 255; A's 101,
floor 1 B's 69). `tsc` is clean.

## Made game-ready (the castle hall, his “Yes, make it game-ready (Recommended)”)

His words that began it, 2 Nov 2026, 15:37: “Unfortunately that means the first town is going to have to be redone as well.  In
sort of the same style as the wardens.  Maybe more sun, and more plants.  An owl in the rafters.  Hastily barricaded windows”. To
the first three looks: “Well it’s still supposed to be in the castle.  Like right inside.  The barred door in the back leads out
of the prison to the quarry”. Which to carry over: “A's sun through boards (Recommended)”. Shown the castle hall: “Yes, make it
game-ready (Recommended)”, offered as: built the game's way, shown to you beside this picture, then handed to the main chat.

Made ready for the game as floor 1's look was (docs/mockups/floor1_look/README.md, "Made game-ready"), in files of their own behind
a switch that is off; nothing of the game imports them (a test proves it) and no game file is changed:

- `src/art/castle_hall.ts`, `makeCastleHallArt()`, behind `CASTLE_HALL = { on: false }` (the name was free);
- `src/art/hall_owl.ts`, the owl: its frames (`owlFrames()`), its loop (`OWL_LOOP`, `owlFrameAt(t)`);
- checked by `tests/castle_hall.test.ts`; laid and lit the game's way by `src/dev/preview_castle_hall_game.ts`.

Every picture is in the game's measures (picture pixels, two to a game pixel, `density` 2), anchored as the game's own are, laid on
the town as game/level.ts makes it. The colours are the castle hall's as he saw it (`STONE`, `FLAGS`, `WOOD`, `PLANK`, `PLANK2`,
`MOSS`, `LEAF`, `POT`, `BOARDS` in art/castle_hall.ts), brought down under the darkest word (his Colour 4: at the 99th of their
pixels the floor, its tiles, the walls, the roof, the gate's stone, the stairs and the hall's own pieces are darker than the word
"power", 95 of 255; the day seen through a gap and the flowers apart); the light makes it bright. No light is painted into the
place: the sun's own pictures are light, drawn added.

### The pieces and their anchors

- `floor(tx, ty)`: THE HALL'S FLAGS, pale flags a tile each, a carved border (its edges toward the light lit), worn lighter where
  they walk, moss in the joints and creeping out from the back walls' feet. Each tile its own (the town is one place), the gate's
  doorway (13 to 15, 5) too. 64 x 32, anchored at the tile's top corner, as the game's floor.
- `tiles` (laid over the flags, each 64 x 32 at its top corner): `moss`, `moss, a little`, `grass and flowers in the joints`,
  `grass in the joints` (tufts a few pixels high up through a tile's near joints).
- `sun(tx, ty)`: THE SUN'S SLATS on the floor, LIGHT: the low gold morning sun through the gaps in the boards of the four windows in
  the wall along y, worked out ray by ray (`sunAt`: a point is in the sun if the line from it toward the sun passes through a gap),
  so each slat is its gap's own shape; a rim and a core (`SUN.slat`, dim: the brightest 97 of 255, because it is ADDED), in whole
  game pixels; 64 x 32 at the tile's top corner, or null where no sun falls (44 tiles have some).
- `face(alongX, tx, ty)`: THE CASTLE'S WALL a tile at a time, as the game lays walls (render.ts: along x, the wall at y 5, its face
  turned to screen-left and lit; along y, the wall at x 5, to screen-right, a tone down). 80 high, the town's walls' height
  (`WALL_LOOK.tall` 40 game pixels); 64 x 112, anchored at the floor point of the tile's top corner, column by column on the
  game's own town walls' line (a test lays them on `makeGroundArt()`'s). Two differences from the game's walls, both because the
  castle's stone goes on up behind the roof: its top does NOT fade (the stone carries on in `roof`), and the joint column between
  two tiles is filled (the stone is laid on along the wall, the windows across two tiles). In it: the castle's thick dressed stone
  in deep courses of big blocks (a drafted margin, some tooled, a putlog hole here and there), a chamfered plinth, moss low down,
  IVY climbing and flowering; THE TALL WINDOWS OF TWO LIGHTS deep in the wall (`WINDOWS`: four in the wall along y at y 8.5, 11.5,
  14.5, 17.5; two in the wall along x at x 8.7, 18.75), HASTILY BOARDED as high as they could reach (odd planks of two woods
  nailed crooked and overhanging, one nailed up and down over the rest; A CART WHEEL wedged against the one at 11.5, A DOOR off its
  hinges against 17.5 and 8.7), the day through the gaps (`DAY.gap`); the quoins of the gate's jambs either side of the gate.
- `roof`: THE STONE ABOVE THE GAME'S 80 AND THE GREAT HALL'S ROOF, one picture (1000 x 536, anchored at the floor point of the
  hall's back corner (6, 6), at (476, 352)) over the dark above the back walls: the walls going on up from 80 to 140 (the
  windows' round heads open, a little boarded round opening in each tympanum), THE CORBEL TABLE along their top, ivy hanging from
  it; the HIPPED TIMBER ROOF over it (no gable end), its wall plate, hip rafter over the back corner, principal rafters over the
  trusses, purlins, common rafters and boards, a chink of day here and there, drawn 7 tiles in from each wall. Nothing of it lies
  below the faces' tops (a test holds it), so it is never over the walls the game lays nor over the floor.
- `gate`: THE BARRED GATE OUT TO THE QUARRY, the town's gate as it works today (game/ways.ts `townGate`, a 'waygate' in the wall
  along x, doorway 13 to 15; render.ts `standDoors`): `gate.pillar` (the jamb's quoins, long and short in turn, on the game's
  pillar's footprint: art/gates.ts `makePillar`'s size, anchor and shape), `gate.arch(alongX)` (strips from u 0 to ARCH_WIDE +
  16, as the game's arch: the GAME'S OWN WAY and ring (`ARCH`) so the portcullis, the town's bars, their chains and their rings
  sit exactly as today (a test: no more of them hidden under it than under the game's arch), a ring of thirteen voussoirs with a
  keystone, a HOOD MOULD over its upper part stopping on a carved stop each side above the bars' rings, the castle's wall over
  the doorway up to 80), and `gate.beyond(alongX)`: THE PASSAGE AND THE DAY THROUGH IT (the wall's thickness, a tile deep: its
  worn flags, its sides and vault in shade, lit from the far end; past it the morning outside: the road out to the Quarry, its
  ruts, grass either side, a quarried block), 128 x 184, anchored at (4, 112) along x (ARCH_WIDE + 4 along y), as floor 1's
  stairs up (art/town_ways.ts `floorStairsUp`). THE PORTCULLIS IS THE GAME'S OWN (`makeGateArt().portcullis`) and THE BARS, THEIR
  UNBARRING AND WHAT IS LEFT OF THEM ARE THE TOWN'S OWN (art/town_ways.ts), unchanged.
- `stairs(way)`: THE STAIRS DOWN TO FLOOR 1, in place of art/town_ways.ts `townStairs(way)`: its size, anchor and shape pixel for
  pixel (a test holds it); its parapet and top steps the hall's stone, and down the flight floor 1's mossy stone (look B's, his
  yes) taking over the deeper it goes, moss on the deep treads: it leads into floor 1's `stairsUp` (art/tomb.ts) unchanged.
- `owl` (art/hall_owl.ts): THE BARN OWL ON ITS HAMMER BEAM over the rack and the forge (`CASTLE_OWL_AT`, (17.5, 6.98), its beam's
  top 102 over the floor), its 14 frames (`OWL_POSES`: breathing in four steps, blinking half and shut, its head turned a little
  and well round to the right, to the left and on round to looking behind, ruffling and ruffled), each 40 x 144, ANCHORED AT THE
  FLOOR POINT UNDER IT (20, 142); `OWL_LOOP`, its life as frames and how long each holds, 28.06 seconds round: it breathes all the
  time (2.4 seconds a breath), blinks every few seconds, turns its head to the right and back, looks right round behind it to the
  left and back, ruffles once; every turn through a frame between, never a jump. `owlFrameAt(t, from)` gives the frame to show.
- `pieces` (each anchored at its floor point, in whole game pixels):
  - `a hammer-beam truss` (64 x 216 at (50, 212): the floor point at the wall's foot under it): on the wall along x, a CARVED STONE
    CORBEL (40 to 56), the wall post up to the plate, a curved ARCH BRACE, the HAMMER BEAM (92 to 102, 1.1 tiles out), the hammer
    post up to the principal rafter. At x 7.5, 10.5, 17.5, 20.5 (`TRUSSES_X`; none over the gate).
  - `a wall post and brace` (64 x 216 at (14, 212)): on the wall along y between its windows, the corbel, the post, the brace to the
    plate. At y 10, 13, 16 (`TRUSSES_Y`).
  - `the sun in the air, window 1` to `4`: LIGHT, four frames (motes of dust turning in it): the sun's slats seen in the dusty air
    between each window in the wall along y and the floor (`SUN.air`, dim), anchored at the floor point at the window's middle at
    the wall's foot (6, 8.5), (6, 11.5), (6, 14.5), (6, 17.5).
  - THE PLANTS: `potted herbs`, `potted flowers`, `a bay tree in a pot`, `a fern in a pot` (terracotta, moss at the foot; 64 x 96 at
    (32, 80), the pot's middle on the floor; shadow 0.25 to 0.28); `ivy at the foot of a wall, along x` / `along y` (a mound against
    the wall's foot, climbing a little: 72 x 64 at (36, 46), the middle of the wall's foot on the tile).
  - `a pillar of the hall`: a round column of the castle's stone, ivy winding up it, moss at its foot, the game's pillar's size and
    anchor (art/props.ts: 40 x 100 at (20, 84)), in place of the vault's pillar at (10, 9) and (7, 10).

What is not changed (the brief: the game's own pictures, in their places, NOT recoloured): every townsperson, the smithy, the bazaar,
the ring, the Lexicon, the stash, the waypoint's dais, the shaft's head and its cage, the braziers, barrels and urn, the
portcullis and the town's bars. The town is made as now (game/level.ts); only its pictures are new.

### The lights, for the main chat to place

Nothing of the light is painted in: the renderer lays the town's own dark and cuts a hole where each light burns (render.ts
`light`, `spot(x, y, r, strength)`), and what gives light is drawn over it (`drawLights`, `drawGlow`). `CASTLE_LIGHTS` holds these
numbers; `src/dev/preview_castle_hall_game.ts` lays them exactly so. In game pixels:

- THE TOWN'S OWN DARK, AS IT IS: `rgba(8, 5, 14, 0.45)`, its vignette 0.4, the hero's pool 170 at 1 (render.ts, unchanged).
- THE SUN'S PICTURES, ADDED (the renderer change floor 1's README asks for: drawn with `globalCompositeOperation = 'lighter'`, as a
  glow is): `sun(tx, ty)` over each floor tile after the floor's own tiles and what lies flat (the rug, the ring, the dais, the
  stairs); `the sun in the air, window k` stood at the depth of its anchor + `AIR_DEPTH` (2.5: after the faces of the wall it lies
  over, before most of what stands in the hall), its frame `floor(t * 4) % 4`.
- THE SLATS: a hole for each tile well in the sun, `slatLights()` (19 holes: at the tile's middle, radius 29 to 43, 0.49 to 0.75, by
  how much of the tile is in the sun).
- EACH WINDOW IN THE WALL ALONG Y (`SUN_WINDOWS`): a hole at its middle, 26 up from the floor point (6, c), radius 40, 0.7, and its
  glow (`#ffdf9a`, 26, 0.16); and the room's daylight before it: a hole on the floor 2.6 tiles in from the wall (at (8.6, c + 0.78)),
  radius 100, 0.55, a faint glow over it (`#ffdf9a`, 64, 0.1).
- EVERY TILE OF WALL THAT STANDS (as floor 1's): a low hole at the foot of its face under its middle, 26 up, radius 36, 0.4.
- THE GATE: the floor before it lit as now (render.ts: 84 at 0.9, 14 up from TOWN.gate); the day's glow in its way (`#ffe9b8`, 46,
  0.2, 30 up from (14.5, 6)).
- THE BRAZIERS, THE FORGE, THE LEXICON, THE TABLE OF WARES, THE WORDSMITH'S SLAB: as now.

### How to bring it in (the main chat; not done here)

1. THE SWITCH: on with his yes to it in play: the town (not the camp) is the castle hall while `CASTLE_HALL` is on.
2. THE FLOOR: every floor tile of the town drawn with `floor(tx, ty)` in place of `art.ground.floor`; the walls' shadows over it and
   the edges toward the eye from `makeGroundArt(CASTLE_THEME)` (its `shadeLeft`, `shadeRight`, `shadeCorner`, `edgeLeft`,
   `edgeRight`) in place of the vault's. Over the flags: `moss`, `moss, a little` and the grass tiles a tile in eight or ten, out
   of the ways people walk (the preview's `layTiles` has a laying); then `sun(tx, ty)` added, after what lies flat.
3. THE WALLS: the town's back walls drawn with `face(alongX, tx, ty)` (along x the faces of the wall tiles (tx, 5), along y of
   (5, ty)) in place of `art.ground.faceLeft` / `faceRight`; the walls toward the eye stay out, as now.
4. THE ROOF: `roof` drawn at the floor point (6, 6) before the floor, behind everything (the dark above the back walls is all it
   covers).
5. THE TRUSSES AND THE OWL: `a hammer-beam truss` stood at (x, 6) for each of `TRUSSES_X` and `a wall post and brace` at (6, y) for
   each of `TRUSSES_Y`, each at the depth of its anchor + `TRUSS_DEPTH` (0.05); the owl at `CASTLE_OWL_AT` (17.5, 6.98), depth its
   x + y, frame `owl.frameAt(game.time)`. It is in nobody's way: nothing stands on its beam.
6. THE GATE: in render.ts `standDoors`, for the town's gate, `gate.pillar` in place of `A.pillar(false)` and `gate.arch(alongX)` in
   place of `A.arch(...)`; the portcullis and the town's bars as now. In `flatWays`, with the floor, `gate.beyond(alongX)` at the
   arch's first strip's point (as floor 1's stairs up are drawn: `[s.a - wide, face]`).
7. THE STAIRS: where `flatWays` draws the town's stairs (`dress.townWays(game).stairs`), `stairs(st.way)`: the same size, anchor and
   shape.
8. THE PLANTS AND THE PILLARS: the pillars' picture `a pillar of the hall` in place of `art.props.pillar` in town; the pots and the
   ivy as pieces where the preview has them (`POTS`, `IVY` in src/dev/preview_castle_hall_game.ts: along the walls' feet between
   the windows, by every vendor's place), each on a tile nobody walks or blocking its tile, as the main chat likes.
9. THE LIGHT, as above.

### What differs from the castle hall as he saw it (so he is not surprised)

- The light is the game's: the town's own dark over everything with holes where the lights are, the vignette at the corners; the
  hall's stone a step darker in its own colours (under the darkest word), and the sun's slats and the windows bring it up where
  they fall. So the hall is darker away from the knight and the windows than in the picture he said yes to (as floor 1's was).
- The town's own things are the game's own pictures as they are today (as the brief asks): the stash, the ring's stones and
  slab, the Lexicon, the forge, the rack and the waypoint's dais in the vault's indigo stone and plum wood, where in the picture he
  saw they were in the castle's stone and timber. (His to decide: they could be given the castle's stone.)
- The walls toward the eye are not drawn (the game leaves them out); the floor ends in its line of light against the dark.
- The gate keeps the game's own way, its portcullis and the town's bars exactly as they work; its arch is a little lower than
  in the picture (the game's way, 82 to its crown, where the picture's was 98).
- The sun is not painted on what stands in it (the people, the stones): the slats lie on the floor and in the air.

### The picture

- `pictures/game_ready.png` (1200 x 2237): the town built from these pieces the game's way, the knight among the vendors, beside the
  castle hall as he saw it; one phone screen (1014 x 468) at the game's own size; the owl on its beam at the game's size and close,
  and six of its moments three times as big; the gate close, three times as big, barred (as a new game finds it) and open (its
  portcullis up, the bars struck off, the road out in the sun).

```
PREVIEW_TIMEOUT=600000 node tools/preview.mjs src/dev/preview_castle_hall_game.ts docs/mockups/town_look/pictures/game_ready.png 1200 2237 "sheet"
  ("town" at 1200 x 840, "flat" (no dark) at 1200 x 840, "phone" at 1014 x 468, "owl" at 1200 x 604, "gate" at 1200 x 462 alone)
```

### Checks

`tests/castle_hall.test.ts`, 12 of 12: off, and nothing of the game imports either file; every piece the brief asks for painted;
every picture at its size and anchored where the game lays it (the floor tiles at their top corner; the faces 80 high, every
column whole, on the game's own town walls' line column by column; the roof never below the faces' tops; the pieces at their
floor points; the owl on its beam; the pillar the game's pillar's size and anchor; everything of the place's own in whole game
pixels, nothing cut off); crisp (every pixel all there or not at all; a floor tile covering its whole diamond; no pixel alone);
nothing cyan and nothing pink in the place, its owl, its gate, its stairs and the day through the gate, the sun a warm gold;
its floor, walls, roof, gate, stairs and its own pieces darker than the darkest word, the town's own dark, vignette and pool as
they are; light from the upper left; the sun's slats only before the windows, the gaps' own shapes, light to add (dim), its air in
four frames, its motes moving; the owl alive (every frame played, no jump between frames, a blink at least every 9 seconds,
breathing in wider than out, ruffled bigger, its turns and blinks seen, its pale face and dark eyes); the gate: the way as clear as
the game's, a hero's breadth under it, the portcullis and the town's bars no more hidden than under the game's own arch, the hood
mould, the wall over the doorway, the pillar the game's shape, the passage and the day through it the size of floor 1's stairs
up; the stairs down townStairs' size, anchor and shape pixel for pixel, the hall's stone at the parapet and floor 1's down the
flight; and in `game_ready.png`, on its phone screen, nothing pink but in the game's own pictures (the mystic's, the smithy's,
the seal on the bars) and the knight's, and the knight standing out of the floor round him. With them `tests/town_look.test.ts`,
`tests/tomb.test.ts` and `tests/bosses.test.ts` pass, and `tsc` is clean.
