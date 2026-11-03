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

## Made game-ready (his “A with B's break-in (Recommended)”)

His words that began it, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.
Floor 1 and 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. Asked which
of the three looks, 2 Nov 2026: “I feel like it needs to be B for the story, but A is so good I’m torn”. Offered both, his pick by
12:29: “A with B's break-in (Recommended)”, offered as: candles in the niches all through; near the way in, one or two walls burst
open with the mine's rock, timber props and a miner's lantern. The story told where you enter.

Made ready for the game as floor 3's prison was (docs/mockups/floor3_look/README.md, on `art/floor3-look`), in files of their own
behind switches that are off; nothing of the game imports them (a test proves it) and no game file is changed:

- `src/art/chapel.ts`, `makeChapelArt()`, behind `CHAPEL = { on: false }`;
- `src/art/chapel_gate.ts`, `makeChapelGateArt()` (a GateArt), behind `CHAPEL_GATE = { on: false }`;
- checked by `tests/chapel.test.ts`; laid and lit the game's way by `src/dev/preview_chapel_game.ts`.

Every picture is in the game's measures (picture pixels, two to a game pixel, `density` 2), anchored as the game's own are. The
colours are look A's (a cool grey stone so that the warmth is the candles'; the bone pale ivory; `STONE`, `FLAGS`, `SLAB`, `BONE`,
`WOOD`, `ROCK` in art/chapel.ts); no light is painted in.

### The pieces and their anchors

- `floor(tx, ty)`: THE WORN FLAGS, laid on the world so the stones run on across tiles (sixteen pictures, repeating every four
  tiles each way), in place of the Crypt's floor 4. 64 x 32, anchored at the tile's top corner, as the game's floor tiles.
- `tiles` (floor tiles, laid over the flags; each 64 x 32 at its top corner):
  - GRAVE SLABS (a raised border, a carved roundel at the head; no words, no cross): `a grave slab` (one tile), `a grave slab
    along x, its head` / `…, its foot` and `a grave slab along y, its head` / `…, its foot` (two tiles long, the head the tile
    with the lower x, or the lower y);
  - BONE DUST: `bone dust` (a drift in the open), `bone dust at a wall along x` (thick at the tile's far edge along x, at a wall's
    foot), `bone dust at a wall along y`; `bone chips`;
  - WHERE THE MINE BROKE IN: `rubble from the break, along x` / `along y` (the raw rock's stones and grit, thickest at the far
    edge, toward the break), `earth spilled from the break, along x` / `along y` (in tongues, for the next row out).
- `faceLeft` / `faceRight`: THE CHAPEL'S WALL a tile at a time, as the game lays walls (along x turned to screen-left and lit,
  along y to screen-right in shade). 80 high, as floor 4's walls are (`WALL_LOOK.tall` 40 game pixels), its top 24 fading out in
  the game's own four steps; the columns at the tile's two ends left empty as the game's (a test lays them column by column on
  the game's own walls: the same top, the same foot). 64 x 112, anchored at the floor point of the tile's top corner. A BAY is two
  tiles: [0] and [2] carry A PILASTER at their start (a half-round shaft on a moulded base, its capital carved with knuckle bones,
  THE RIBS OF THE VAULT springing from it into the dark) and a niche in each of two tiers; [1] and [3] a niche in each tier. In
  every niche THE DEAD STACKED (their long bones' ends in rows, a row of skulls on top: never gory) and CANDLES on its sill, two
  below and one or two above. Each is FOUR FRAMES (`faceLeft[k][f]`): the flames move. `face(alongX, tx, ty, f)` picks them so that
  the pilasters fall every two tiles along a wall (on even x along x, even y along y).
- `breakIn(alongX).frames[f]` (four frames: the lantern's flame): THE BREAK-IN, three tiles of a wall as one picture, in place of
  those three wall tiles: a ragged hole burst through the chapel's stone (its rim chipped and lit, cracks running out from it,
  earth bled down the stone under it), THE MINE'S RAW ROCK pushed through it in great faceted lumps, bulging out over the plinth;
  TIMBER PROPS shoring it (a post at either end, a cap across, a wedge over each post) and A MINER'S LANTERN hung on a nail in the
  cap, its orange flame. 160 x 200, anchored at the foot of the face under the middle of its middle tile (the game's doorway
  anchor, render/dress.ts `anchorOf`, as the cave's): along x at (92, 136), along y at (68, 136). Its wall lies exactly where the
  three wall tiles would (a test lays them), its fading top theirs; the props and the lantern stand whole over the fade.
- `wayIn(alongX).frames[f]` (four frames: the firelight up the stair): THE WAY IN FROM FLOOR 3, where the prison's passage comes
  out (floor 3 ends with a door out the back of the Chained One's hall onto a passage going down: art/prison_exit.ts on
  `art/floor3-look`). Three tiles of the chapel's wall as one picture with A ROUND ARCH two tiles across in its middle (`WAY_ARCH`:
  it springs at 36, its crown 68, a ring of voussoirs 10 deep, dressed jambs; the ring and the jambs stand whole over the wall's
  fading top), and through it A SHORT STAIR coming down into the chapel (`WAY_STAIR`: six steps, each three eighths of a tile deep
  and 8 up), its lowest steps the chapel's stone, those more than two tiles back the prison's charcoal stone nosed with its black
  iron, the passage's side wall going up with it, the dark beyond; floor 3's fire basket burning at its head is out of sight up the
  stair, and gives its light (below). Same size and anchor as the break-in. Nobody walks into it: it is the floor's start.
- `hall` (THE BOSS HALL, FLAT):
  - `hall.faceLeft[k][f]` / `hall.faceRight[k][f]` (k the tile's place along the wall mod 4; four frames): the hall's walls,
    the chapel's but fuller: three candles to each lower niche, and over them, between string courses, A BAND OF THE DEAD stacked
    along the whole wall (bone ends, a row of skulls), so that the cave's stretch of the skull wall stands in it as one more bay of
    the stacked dead. As the faces.
  - `hall.cave(alongX)`: THE CAVE TO FLOOR 5, art/cave4.ts's film (his yes) with its shape, its size, its anchor, its 126 frames
    and its jolts unchanged, in look A's colours (graded as floor 4's pieces are, below; the Fleshmancer's far pink kept):
    `before` (the skull wall standing), `frame(f)` (from his fall), `under` and `over` (the cave open, its two layers), `jolts`.
    Each frame is graded the first time it is asked for. A test lays it on the chapel's wall line: its foot where the three wall
    tiles' would be (in every other column a bone's end a pixel proud, as it stands among the game's walls today), 80 high.
- `pieces`:
  - the chapel's own (`CHAPEL_OWN`): `candles on the floor, a few` and `…, many` (clusters in a pool of their own wax, every
    height, four frames, each with its own `lights`; 64 x 64 at the floor point at their middle; on the floor, nobody blocked);
    `rock spilled from the break, along x` / `along y` (lumps of the raw rock on a low heap of earth before a break-in, a tile and
    a half along the wall and half a tile out: an obstacle, 120 x 96 at the floor point under its middle, at the wall's foot);
    `a broken pew` (snapped in two, its halves down on the floor) and `a pew thrown down` (on its back, its legs up), obstacles,
    96 x 72 at the floor point under their middle; `a dropped pick` (on the floor, 80 x 48); `a pier of the hall, its ribs toward
    x` / `…, away from x` (fluted, on a square plinth, its capital carved with knuckle bones at 100, the ribs of the vault springing
    from it over the hall and lost in the dark in the game's four steps: obstacles for the hall's back corners, 220 x 260 at the
    floor point under them, standing over the screen's top);
  - and every one of FLOOR 4'S OWN PIECES (art/floor4.ts, his yes already), under the same names and kinds, at the same sizes and
    anchors and with the same lights, in look A's colours (`gradedA`: their colours drawn toward the grey stone and the ivory bone,
    a third of their colour kept, warmed; fire as it was): the cult's altar (the hall's, flat: no dais), the cult's candles,
    garlands of skulls, the daub, the dead's arm, heaps and pyramids of skulls, the reliquary, the charnel heap, the eldest skull,
    and the miners' things (the rails' end the break-in wants: “a cart rail end”, the rails, lanterns, the cart, sacks, boots…).

### His gate (`src/art/chapel_gate.ts`)

A GateArt, as the prison's: everything but the boss's pillar, arch and drop is floor 4's own (`ossuaryGates()`), in look A's
colours.

- `pillar(true)`: CLUSTERED, three round shafts (one at its front corner, one along each face) on a moulded base and a square plinth,
  an annulet half way up, a square capital with a skull carved on each face, up to the spring at 64 (`CG_SPRING`); its footprint
  the game's pillar (`PILLAR`). One picture for a gate either way, 40 x 94, anchored at its front corner on the floor.
- `arch(alongX, true, lit)`: strips (art/gates.ts `Flat`) from the outer edge of one pillar to the other: A POINTED ARCH over the
  three tiles of the way (two arcs of radius 60, its crown 123), its ring SET WITH SKULLS, one to each voussoir, upright; the
  ashlar face to a cornice at 140 (`CG_CORNICE`); A GABLE over it to 192 (`CG_PEAK`), its slopes coped with long bones (their top a
  pillar's thickness back), a skull on its peak; in the gable a roundel with HIS MAW (`MAW_Z` 164): a mouth roaring open, its
  corners cut square, three fangs of every size all hanging from the top, the enemy's fire dull and lowest in it (never in rings);
  or `lit` (the drop down behind the hero, the fight on) the maw ALIGHT, pink at its rim burning to gold at its heart, and then it
  gives the enemy's light (FLAME[2], 26, 0.34). Through the way, the arch's underside. Its stone is the chapel's a tone lifted: it
  is the way on, seen from across the dark.
- `portcullis(alongX, true, raise)`: THE DROP at the back of the arch: the dead's long bones every twelve (`CG_BONES`), five across,
  a knob where each passes a strap, their ends cut to points, bound with straps of riveted iron; the game's raise 0 to `GATE_UP`
  drawn up 0 to 88 (`chapelLift`; `CG_LIFT` 88: its points under the crown, a hero 56).
- THE DROP'S FALL, Movement 9 (`CHAPEL_GATE_DROP`, at 30 a second from the moment the fight begins): 60 60 56 60 60 54 60 58 52 60
  (held, juddering), 24 (the drop), 0 (the landing, frame 11, `CHAPEL_SLAM_AT`: the slam begins, the maw lights), 0 6 8 2 0 0 (a
  bounce, then down). `chapelGateDropAt(frame)` gives `{ raise, slam, lit }`.
- THE SLAM, `chapelGateSlam(alongX, f)`, f 0 to 15: bone dust thrown off the flags both ways and rolling out low, thinning; chips of
  bone struck off the points flying out and falling (no sparks: bone on stone). 280 x 180, anchored at the middle of the gate's
  foot.

### The light, for the main chat to place

Nothing of the light is painted in: as everywhere in the game the renderer lays its dark and cuts a hole where each light burns
(render.ts `light`, `spot(x, y, r, strength)`), and what gives light is drawn over it (`drawLights`, `drawGlow`, colour added).
`CHAPEL_LIGHTS` (art/chapel.ts) holds these numbers; `src/dev/preview_chapel_game.ts` lays them exactly so, with the game's own
pools round the hero (380 at 0.36, 165 at 1), the boss's own light (56 at 0.7) and its vignette (0.62). In game pixels:

- THE DARK on floor 4: `rgba(6, 4, 14, 0.76)` in place of `FAR_DARK` 0.88 (look A's candlelit dark: at 0.88 the niches' gold is lost).
- THE NICHES' CANDLES, one light to EVERY TILE OF WALL that is drawn (the chapel's): a hole at the foot of its face under the tile's
  middle (render/pieces.ts's `px ∓ 8, py + 12`), 14 up, radius 42, strength 0.72; and a glow there, radius 22, `#dca44a` (candle
  gold, `CANDLE_GOLD`), 0.3. The hall's walls (`hallNiche`): 9 up, radius 44, strength 0.76; glow 22, 0.32.
- CANDLES ON THE FLOOR (the pieces): a hole 12 up from the piece's anchor, radius 56, strength 0.88; their glow is on the pieces'
  own `lights` (candle gold, 0.4).
- A MINER'S LANTERN on a break-in's prop: a hole at the picture's own light's point (its `lights[0]`), radius 60, strength 0.88; its
  glow is on the picture (`#ff8a2a`, EMBER[2]: the miners' honest orange, not the chapel's gold).
- THE WAY IN: a hole at its picture's light's point (in the arch's head), radius 44, strength 0.6; its glow is on the picture (the
  firelight of floor 3's fire basket, up the stair, out of sight: `#ff8a2a`, 0.3, flickering with the frames).
- THE CULT'S ALTAR in his hall (floor 4's own piece, its candles) lit as a brazier is (render.ts: 14 up, 62, 0.9); the cult's candles
  on the walls give their own little glow as they do now.

### How to bring it in (the main chat; not done here)

1. THE SWITCH: on with his yes to it in play, as the prison's: floor 4 (look 4) is the chapel while `CHAPEL` is on.
2. THE FLOOR: every floor tile of floor 4 drawn with `floor(tx, ty)` in place of the Crypt's; the chapel's tiles laid where the level
   lays its floor tiles (grave slabs in the rooms, two tiles long down the middle of the bigger ones; bone dust at the feet of the
   walls that stand; chips here and there), and floor 4's own tiles (in look A's colours) where they are laid now.
3. THE WALLS: every wall face of floor 4 `face(alongX, tx, ty, f)` in place of `art.ground.faceLeft/Right`, its frame by time
   (about 6 a second, as a fire's); his hall's ring of wall `hall.faceLeft[tx mod 4][f]` / `hall.faceRight[ty mod 4][f]`. The walls
   the game leaves out (render/walls.ts, `wallsAway`) stay out: the pictures he saw had the walls between the chapels standing; the
   game's chapels show their floors' edges there, and their back walls.
4. THE WAY IN FROM FLOOR 3: in the floor's first room (where the hero comes in from floor 3's door), three tiles of a back wall
   that stands, as `placeInBackWall` (game/ways.ts) chooses the cave's (nothing standing on the two rows before it): those three
   wall tiles' faces not drawn; `wayIn(alongX).frames[f]` stood at their anchor (along x the floor point (a + 1.5, row + 1), along y
   (row + 1, a + 1.5)), sorted at the face's line, its frame by time. The hero comes in standing a tile and a half inside it, as
   floor 5 has him come in at the cave's mouth. Nobody walks into it: its tiles stay wall.
5. THE BREAK-IN: one or two stretches of three wall tiles that stand, in the room of the way in and the room next to it (in the
   pictures: the first chapel's back wall beside the way in, and the side chapel's left wall), not where a door or the way in is:
   `breakIn(alongX).frames[f]` stood as the way in is; `rock spilled from the break, along x` / `along y` stood at the wall's foot
   under the stretch's middle, a third of a tile out (an obstacle: its tile is not walked on); `rubble from the break` on the three
   floor tiles at the wall's foot and `earth spilled from the break` on the row out from them; near it a broken pew, a pew thrown
   down, a dropped pick and floor 4's own `the rails' end` (and its rails) stood as things.
6. THE PIECES: with `CHAPEL` on, floor 4's pieces (`lookPieces(4)`, art/floors.ts) are `pieces` (the same names, look A's colours),
   the chapel's own candles on the floor stood among them in every room (three to six to a room, more before the gate and round the
   altar); in his hall the two piers in its back corners (`…, its ribs toward x` in the corner of the low x, `…, away from x` in the
   other), the cult's altar against its back wall, candles either side of it.
7. HIS GATE: with `CHAPEL_GATE` on, floor 4's gates are `makeChapelGateArt()` (wherever `lookGates(4)` / main.ts choose them), stood
   by render.ts `standDoors` as any boss gate (no change there). For its drop, as the prison's: drive the boss gate's raise from
   `chapelGateDropAt((game.time - d.fell) * 30)` in place of `d.open * GATE_UP` while it falls, light the maw from `CHAPEL_SLAM_AT`,
   stand `chapelGateSlam(s.alongX, f)` at `at(1.5, PILLAR / 32)` (depth x + y + 0.3) for its 16 frames, a small shake of 2 for 4
   frames. Its gable rises to 192 (its skull to 200) over walls 80 high that fade: it stands whole over the dark, as in the pictures.
8. THE CAVE: where game/ways.ts already lays floor 4's cave, `hall.cave(alongX)` in place of `caveFilm(alongX)` (render/dress.ts
   `caveFilm`), the same frames, the same anchor, the same jolts; nothing else of it changes.
9. THE LIGHT, as above.

### What differs from A as he saw it (so he is not surprised)

- The light is the game's: its dark with holes and soft glows, not the painted bands of the pictures; a little darker away from the
  candles and the hero.
- The walls the game leaves out (any wall that would hide floor behind it) are not drawn: the walls between the chapels, and those
  toward the eye. Only the back walls stand, so the candlelit niches are on the rooms' far walls.
- His hall is flat (the main chat's word): no dais; the cult's altar stands on the hall's floor against its back wall, candles round
  it.
- The break-in (B's) is in the rooms near the way in only, and the way in from floor 3 is drawn: the stair coming down through its
  arch into the first chapel.

### Pictures

- `pictures/game_ready.png` (1200 x 2400): floor 4's rooms built from these pieces the game's way, the knight in them, beside A as he
  saw it; where you come in, twice as big (the stair down from floor 3 through its arch, the mine broken through the wall beside
  it and in the next room's wall); one phone screen (1014 x 468) at the game's own size, the knight in the first chapel; and the gate
  close with the knight, twice as big, its bone grille up as he comes to it and then down behind him with the maw alight.

```
PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_chapel_game.ts docs/mockups/floor4_look/pictures/game_ready.png 1200 2400 "sheet"
  ("run" at 1200 x 840, "phone" at 1014 x 468, "close" at 1200 x 664 and "gate" at 1120 x 600 give those alone)
```

### Checks

`tests/chapel.test.ts`, 16 of 16: off, and nothing of the game imports either file; every piece the brief asks for painted (and
every one of floor 4's own); every picture at its size and anchored where the game lays it (the walls as high as `WALL_LOOK.tall`
and fading as far down as its `fade`, every column of a face 80 high, the ends empty, the foot on the tile's near edge, column by
column the game's own walls' top and foot); crisp (every pixel whole or empty but a wall's fading top, in the game's own four steps;
a floor tile covering its whole diamond; no pixel alone; nothing cut off at a picture's edge); nothing cyan, nothing pink (floor 4's
own pieces: the enemy's fire only where it was; the lights candle gold and orange); the floor and walls darker than the darkest word;
light from the upper left and the pilasters every two tiles; the candles in every tile of wall and on the floor, their flames moving
in four frames, their light; the lantern's flame and orange light; floor 4's own pieces with their shapes, anchors, lights and fire
as they were and their colours greyer; the break-in and the way in on the wall's line exactly where their three tiles would be; the
cave (art/cave4.ts) its shape, size, anchor, frames and jolts unchanged, in look A's colours, on the wall's line and as high as the
walls; and the gate: floor 4's own for all but the boss's, crisp, nothing cyan, pink only in his maw, the way exactly three tiles
with its middle clear to 110, pointed (its crown 123), the same shape both ways and lit along x, the maw in embers and alight giving
the enemy's light only alight, the drop of bone and iron from up (its points at 88) down step by step to the floor on its points,
the drop's timing and the slam's dust and chips. With them `tests/floor4.test.ts`, `tests/floor4_look.test.ts`, `tests/gates.test.ts`
and `tests/bosses.test.ts` pass, and `tsc` is clean.
