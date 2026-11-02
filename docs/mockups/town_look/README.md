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
