# FLOOR 4, THE AMALGAMATION'S FLOOR: THE BURIED CHAPEL OF BONES (PICTURES FIRST; NOT IN THE GAME)

Branch `art/floor4-look`, from `high-city` at f6688d9. The three looks for him to pick from: `src/dev/floor4_look_paint.ts`
(the painting) and `src/dev/preview_floor4_look.ts` (the page that lays the pictures out), checked by
`tests/floor4_look.test.ts`. Nothing of the game imports any of it, and nothing of the game is changed: no switch is needed
until his pick is made game-ready.

## His words

- 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and 2 are
  probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. Read (and he was told
  so) as: floors 3, 4 and 5 each get a place of their own (floor, walls, colours, light) built round its boss, and the pieces
  he already said yes to come along.
- His pick for floor 4: “Buried chapel of bones”, offered as: a sunken church turned ossuary: pillars and vaults, the dead
  stacked in its niches. (Not picked: walls built of bone, in ivory, ash and candle gold.)
- Of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”.

## What is drawn

Floor 4 laid as the main chat lays it, COMBO (game/dungeon.ts, `CRYPT_KINDS`: “Combo would be something like the library.
It has a bunch of rooms, but they’re fairly tight and you find your way through them.”): FOUR SMALL CHAPELS in a square, five
tiles each way, each opening on two others through a round arch three tiles wide, so that from the way in (bottom left,
running on off the picture) there are two ways round to the boss's door: the first chapel (D), the side chapel (C) and the
nave bay (B), and the chapel before the gate (A). In the far wall of A, the boss's doorway with HIS GATE in it; beyond it THE
AMALGAMATION'S HALL, the old church's choir (ten tiles each way, flat, as the game's boss hall is), its dais of two steps at
the back with the cult's altar on it, and the Amalgamation as the game has him now (`makeAmalgamActionArt`, his stand).

- **The walls**: the chapel's stone in courses on a plinth, 80 high, the top fading into the dark as the game's walls do; along
  x lit, along y in shade; the walls toward the eye cut low, as the game leaves them. Every two tiles A PILASTER (a half-round
  shaft on a moulded base, its capital carved with a band of knuckle bones) and from its capital THE RIBS OF THE VAULT
  springing up and out into the dark. Between the pilasters TWO TIERS OF NICHES, two to a bay, round-headed, THE DEAD STACKED
  IN THEM: the ends of their long bones out in rows, their skulls in a row on top (never gory). The arches between the
  chapels: round, springing at 18, their crown at 66 (a hero is 56), a ring of voussoirs, dressed jambs.
- **The floors**: big worn flags; GRAVE SLABS let into them, each with a raised border and a carved roundel at its head (no
  words, no cross: floor 4's own rule); bone dust drifted at the walls' feet; chips of bone scattered.
- **Pillars and vaults**: in the hall, two piers at its back corners (fluted, on square plinths, their capitals carved with
  knuckle bones), the ribs springing from them over the hall and lost in the dark. In look C the piers stand in every
  chapel's far corner too, taller.
- **The stretch of the hall's back wall where the dead are stacked floor to top** (three tiles of floor 4's own skull wall,
  on its left back wall): where it gives way to THE CAVE TO FLOOR 5 once he falls (art/cave4.ts, his yes). The cave's film
  starts from exactly these three tiles of the skull wall (`caveFilm(alongX).before`), so the new walls take it as it is: it
  stands between the chapel's niched stone as one more bay of the stacked dead, in the look's colours.
- **The floor's own pieces** (art/floor4.ts, his yes already), brought into each look's light, their colours and not their
  shapes: the cult's altar on the dais in every look; the skull wall; and look by look the cult's candles, garlands of skulls,
  the cult's daub, the dead's arm, ribs on a spike, the miners' lanterns, pick, tools, ladder, seam of ore, shored rock and
  breach; bone-paved floor, the drag, raked earth, earth and bones, the rails, spilled ore; pyramids and heaps of skulls, the
  charnel heap, the bone column, the reliquary, rib cage, arm from a heap, the cultist's robe, oil jug, the eldest skull; the
  mine cart, ore sack and tub, drill steels, broken ladder, empty boots, timber crib, the boulder, a snapped prop.
- **HIS GATE**, an original design, built as the game's boss gates are: the three tiles of the way between two pillars 12 wide
  (art/gates.ts, `SPAN`, `PILLAR`). CLUSTERED PILLARS (three round shafts) on moulded bases, a band, and a skull carved on each
  capital, up to the spring at 64; A POINTED ARCH over the way (its crown 123), its ring set with THE DEAD'S SKULLS, one to
  each voussoir, upright; a cornice at 140 and over it A GABLE to 192, its slopes coped with long bones, a skull on its peak;
  in the gable a roundel with HIS MARK, THE MAW (floor 4's own, as he said yes to it on its boss gate: a mouth roaring open,
  its corners cut square, three fangs of every size all hanging from the top, the enemy's fire dull and lowest in it, in
  embers, never in rings); THE DROP at the back of the arch, drawn up, its points hanging at 88: a grille of the dead's long
  bones bound with two straps of riveted iron, their ends cut to points. The same gate in all three looks, in each look's
  light.

## The three looks

Each a different take within his pick, each its own light:

- **A, CANDLELIT CHAPEL** (`a_candlelit.png`, `a_phone.png`): a cool grey stone, so that the warmth is the candles'; a stub or
  two of candle on every niche's sill and clusters of them, every height, standing in pools of their
  own wax on the floors, at the gate's feet and round the dais; warm candle gold (an honest flame: white-yellow at its heart,
  gold, orange at its foot) on pale ivory bone.
- **B, THE EARTH BREAKING IN** (`b_earth_breaking_in.png`, `b_phone.png`): a darker stone dirtied with earth bled down it and
  cracked; THE MINE'S ROCK bursting through three walls (the first chapel's, the side chapel's back wall, the hall's back
  wall), great faceted lumps of it and earth and rubble spilled out over the floor; TIMBER PROPS and their caps shoring it, a
  brace; lanterns hung on the props and the miners' own on the walls, in pools of orange light; PEWS broken and thrown down
  (one standing askew, one on its back, one on its side, one snapped in two); the slabs heaved, earth across the floors; the
  miners' rails, cart and gear (floor 4's own). Some niches broken open, their dead fallen out.
- **C, COLD AND GRAND** (`c_cold_and_grand.png`, `c_phone.png`): a cold blue-grey stone; TALL PIERS in every chapel's far
  corner and the hall's, their capitals at 150, the ribs of the vaults springing from them and lost in the dark above; GREY
  LIGHT falling down a broken shaft from somewhere far above into three pools (the hall, where he is; the nave bay, where the
  knight is; the side chapel), seen in the air as a haze leaning from the upper left; THE DEAD STACKED IN ROWS: the niches
  full of skulls to their heads, and long stacks of bone ends banded with skulls along the walls; the only fire the cult's,
  the altar's candles and two braziers in the hall.

In all three: fire an honest orange-gold; nothing cyan but the knight's own; nothing pink but the Amalgamation's own and the
maw on his gate. `floor4_look_sheet.png` has the three, each with its phone screen, labelled A, B, C with a line each, and the
gate close beside the knight in each, twice as big.

The art chat's lean: **C, cold and grand**. It is the farthest from floor 3's fire and black iron and from floor 5's mine and
temple; the Amalgamation's pink and the words read best on its cold grey, and floor 4's own bone (the boss's lavender grey)
sits in it as it was made. A is the warmest and the richest at a glance, but its gold is nearer floor 3's firelight; B is the
most eventful, but its rock and timber come nearest floor 5's mine.

## How the pictures are made

```
node tools/preview.mjs src/dev/preview_floor4_look.ts docs/mockups/floor4_look/pictures/a_candlelit.png 1200 840 "overview:candle"
node tools/preview.mjs src/dev/preview_floor4_look.ts docs/mockups/floor4_look/pictures/a_phone.png 1014 468 "phone:candle"
  (and "overview:breach" b_earth_breaking_in.png, "phone:breach" b_phone.png, "overview:cold" c_cold_and_grand.png, "phone:cold" c_phone.png)
node tools/preview.mjs src/dev/preview_floor4_look.ts docs/mockups/floor4_look/pictures/floor4_look_sheet.png 1200 5000 "sheet"
  (PREVIEW_TIMEOUT=200000 for the sheet; "gate:<look>" at 400 x 600 shows the gate close on its own)
```

The whole run is 600 x 420 game pixels at two picture pixels each (the game's own size); a phone screen is 507 x 234 game
pixels with the camera on the knight in the chapel before the gate. The place is painted in picture pixels on the game's grid
(art/isokit.ts), WITH A DEPTH FOR EVERY PIXEL (x + y of the world point seen there), so that the walls between the chapels,
the piers, the rock, the props, the pews and the figures stand in front of one another as they do in the world; the round and
leaning things (the piers, the rock, the timber, the pews, the arches' ribs) are found by following each pixel's line of sight
into them (`march`). The pieces and figures are the game's own sprites, drawn at their size and depth. THE LIGHT IS PAINTED IN
here, in three bands round each flame and each pool of grey light, their edges a checker of two-pixel squares (no soft
gradient); the knight carries a small pool of his own.

## What making his pick game-ready will need

As floor 3's prison was (docs/mockups/floor3_look/README.md: src/art/prison.ts, src/art/prison_gate.ts), in files of their own
behind switches that are off, nothing of the game importing them until the main chat puts them in:

- **The floor**: `floor(tx, ty)`, the flags laid on the world so they run on across tiles; tiles over them: grave slabs (one
  and two tiles long, both ways), bone dust at a wall's foot, chips; for B earth spilled and heaved slabs; for C a pool of the
  shaft's light (or the renderer's light alone).
- **Faces**: `faceLeft` / `faceRight`, the wall a tile at a time, 80 high, fading as the game's: the bay is two tiles, so
  [0] carries the pilaster and the first niche of each tier, [1] the second (`face(alongX, tx, ty)` picks them so the
  pilasters fall every two tiles); the ribs springing from each pilaster into the fade; for A a candle or two on each sill
  (frames, so the flames move) with their lights; for B niches broken open, earth bled down.
- **The arches between the chapels**: the floor's own doorways in the chapel's stone (the game's doorways are three tiles):
  a round arch's strips and jambs as a `GateArt`'s plain gate, with floor 4's own door and gate looks in them where the level
  wants a door.
- **The gate**: a `GateArt` (art/gates.ts) as the prison's: its pillar, its arch's strips both ways (lit, and alight: the
  maw's fire burning the enemy's pink to gold once he has fallen, then giving the enemy's light), the bone drop at every raise,
  its slam (bone dust and chips thrown off the floor) and its drop timed by Movement 9 (held, juddering, then down in a frame).
- **The hall**: its two piers as obstacles rising into the dark (pictures that stand taller than the screen), the dais (two
  steps, a raised piece the game would need to walk up or keep clear: the altar's place), and the three tiles of the skull wall
  where the cave opens: art/cave4.ts painted in the picked look's colours (its skull wall, rubble and dust graded as the pieces
  are here), laid where `placeInBackWall` (game/ways.ts) already lays it. The cave keeps its shape and its film.
- **Look B's own**: the rock breaks (three or four wall-and-floor sets: the lumps, the spill, the props and their caps, the
  hung lanterns with their lights), the pews (standing, on its back, on its side, snapped) as obstacles and breakables.
- **Look C's own**: the tall piers as obstacles in the chapels' far corners, their ribs; the stacks of the dead as long
  obstacles along walls; the shafts' light as the renderer's (a hole in the dark and a cold glow, never cyan); the braziers.
- **The light**: the dark and the light are the renderer's (render.ts: its darkness with a hole where each light burns), as
  floor 3's: the candles (A), lanterns (B) or shafts and braziers (C) each a hole and a glow; the floor's dark set to match the
  picture he picks. The light painted into these pictures is the guide, not the game's.
- **The pieces**: floor 4's own, recoloured into the look he picks (their colours, not their shapes), as here (`graded` in the
  page).
- **Where floor 3's door comes out** (not drawn now): floor 3 now ends with a door out the back of the Chained One's hall onto a
  passage going down. Floor 4 could begin where that passage arrives: its way in (bottom left here) a short stair coming down
  through a round arch into the first chapel, the prison's black iron and dark stone giving way to the chapel's stone on its
  last steps, a fire basket of floor 3's burning low at its head behind, so the way down reads as the same passage.

## Checks

`tests/floor4_look.test.ts`, 4 of 4: nothing of the game imports the dev pages; every picture there at the size asked for
(1200 x 840, 1014 x 468, the sheet 1200 wide and 5039 high); in each picture nothing cyan but round the knight and nothing pink
but on the Amalgamation, on the maw on his gate, or the knight's own deep red, and in the sheet the cyan in no more patches than
it has knights; on each phone screen the floor round the knight lighter than the dark and the knight standing out of the floor.
`tsc` is clean.
