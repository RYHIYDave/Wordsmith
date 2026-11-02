# FLOOR 5, THE FLESHMANCER'S FLOOR: THE MINE THAT BECOMES HIS TEMPLE (PICTURES FIRST; NOT IN THE GAME)

Branch `art/floor5-look`, from `high-city` at f6688d9. The three looks for him to pick from: `src/dev/floor5_look_paint.ts`
(the painting) and `src/dev/preview_floor5_look.ts` (the page that lays the pictures out), checked by
`tests/floor5_look.test.ts`. Nothing of the game imports any of it, and nothing of the game is changed: no switch is needed
until his pick is made game-ready.

## His words

- 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and 2 are
  probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. Read (and he was told
  so) as: floors 3, 4 and 5 each get a place of their own (floor, walls, colours, light) built round its boss, and the pieces
  he already said yes to come along.
- Offered for floor 5: the cult's black temple (the deep mine carved into their temple, black rock, hangings, the
  shrieking-skull mark, the rift's deep pink cracks), or a mine, cult-dressed. His answer: “I like the temple but I need the
  mine to be a prominent part of it.  Like you start in the mine then it becomes a temple further on”.
- Of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”.

## What is drawn

Floor 5 laid as the main chat lays it, COMBO (game/dungeon.ts, `CRYPT_KINDS`: tight rooms you find your way through): you
come out of FLOOR 4'S CAVE into THE LANDING (bottom left), its mouth cut through the landing's left wall (art/cave4.ts's
`lairMouth`, its shape and anchor: the cave seen through it is its own `under`, its throat climbing away; round it a rim of
the mine's rock and earth fallen before it). From the landing two ways round, each through a tight room: THE DRIFT (bottom
middle, the rails running through it) or THE SHRINE GALLERY (left, up); both come to THE ANTECHAMBER before his gate. In the
antechamber's far wall the boss's doorway with HIS GATE; beyond it HIS HALL, the temple at its fullest (ten tiles each way,
flat, as the game's boss hall is), with the Fleshmancer as the game has him (`makeFleshmancerArt3`, standing), THE RIFT on
its floor, and at its far corner THE MINERS' SHAFT that rides up to town (art/shaft.ts `shaftStill().empty`, the floor's own
piece; where game/ways.ts `placeShaft` puts it: the hall's far corner, a tile off its back walls).

- **The mine** (where you start): the walls RAW ROCK, broken in facets lit from the upper left, the scores of the picks in
  it, a seam of ore slanting through; TIMBER SETS every two tiles (a squared post against the rock, a cap along the wall over
  the posts, a wedge over each post) and the miners' lagging boards between the tops of some; free-standing sets across the
  rooms (two posts and a cap); the miners' LANTERNS hung on them; the floor packed earth and grit, stones, the trodden way down
  the middle of each room; THE RAILS on their sleepers from the landing along the drift; the ways between the rooms framed in
  timber.
- **The temple** (where it ends): the walls BLACK WORKED STONE in great courses on a moulded plinth, a square PILASTER every
  two tiles, and between them HANGINGS (an old oxblood cloth on a rod, ragged at the hem, the cult's mark painted on it in
  chalk) or CARVED PANELS with THE SHRIEKING SKULL in relief (art/floor5.ts `shriekAt`, the cult's own mark); the floor great
  black flags laid square, a carved border round each; BRAZIERS of black iron (the mark on the bowl, an honest fire); the
  RIFT'S DEEP PINK CRACKS through the floor from where the rift lies, and up the hall's walls; the ways between rooms cut with
  corbelled heads (their sides stepping in toward the top), a carved band round them and the mark over them.
- **The floor's own pieces** (art/floor5.ts, his yes already), brought into each look's light, their colours and not their
  shapes (`graded`: the mine's warmed toward its rock and timber, the temple's cooled toward its black stone): the pile of
  props, powder keg, baskets of ore, the spilled kibble, the cart on its side, a dropped lantern, the winding drum, the sump
  pump, a miner's bones, rope and pulley, the hung kibble, a miner's candle, the plank walk, spoil; the skull standards, the
  effigy, offering jars, boxes of candles, skulls given to him, the cult's banners, the candle ledges, the daubed mark, a
  cultist's robe, bones on cords, the cult's slab and ring; in his hall the rift, the mine shaft, the great and the long bone
  heaps, the cult's coffer (open).
- **HIS GATE**, an original design in the temple's own dress, built as the game's boss gates are (the three tiles of the way
  between two pillars 12 wide: art/gates.ts `SPAN`, `PILLAR`): BATTERED PYLONS of the black worked stone (their outer edges
  leaning in as they rise), a channel cut down each; A LINTEL, one great slab (92 to 112), its band notched, ITS UNDERSIDE CUT
  INTO A ROW OF FANGS, long and short, hanging over the way; over it the dressed stone gives out to THE MINE'S RAW ROCK,
  unhewn, rising to a ragged crest at about 200, and carved out of the rock THE SHRIEKING SKULL, the cult's mark, great (about
  46 across, its middle at 148), its jaw dropped wide, the enemy's fire dull and low in its sockets and its mouth, in embers
  (never in rings); THE DROP at the back of the way, drawn up (its points at 80; a hero is 56): bars of black iron every
  twelve, a strap across, their ends hooked toward the middle like a jaw's teeth. The same gate in all three looks, in each
  look's light: the temple cut out of the mine, at its door.

## The three looks

Each a different take within his answer, each its own light:

- **A, THROUGH THE THRESHOLD** (`a_through_the_threshold.png`, `a_phone.png`): the landing, the drift and the shrine gallery
  are all the mine, warm brown rock under the miners' lanterns. The change comes all at once, at TWO CARVED THRESHOLDS (the
  ways into the antechamber, from the drift and from the gallery): a broad front of black worked stone cut into the raw rock,
  pilasters either side with the mark on their capitals, a band carved like a row of teeth round a corbelled way, the mark at
  its head with the enemy's pink dull in its eyes; the rails end at the drift's threshold on a timber stop, two braziers burn in
  its way. Past it the black temple, lit by braziers and by the rift's deep pink in its cracks.
- **B, THE CULT CREEPING IN** (`b_the_cult_creeping_in.png`, `b_phone.png`): no line where it changes. The landing is the
  raw mine; in the drift and the gallery the cult's work has begun on the rock (the mark daubed in chalk, hangings nailed up
  between the timber sets, black candles in clusters on the floor, skulls given to him, black flags laid over the earth here
  and there, the rails going under them); in the antechamber the rock is mostly carved away to black stone with only patches
  of the raw rock left; his hall is all temple. The light is candle and lantern all through; the rift's pink only in his hall.
- **C, THE OPEN PIT** (`c_the_open_pit.png`, `c_phone.png`): the mine's fires and the rift together. Beside the rooms
  (beyond the shrine gallery's back and along his hall's left side), where the walls would stand, a parapet of rough rock with
  a timber rail, and over it A VAST OPEN PIT of the mine, its far sides cut in benches stepping down into the dark: the
  topmost raw rock and timber sets rising into the dark, the miners' fire baskets on the upper ledges; below, THE TEMPLE CUT
  INTO THE BENCHES (black stone fronts, hangings, tall doorways into the dark, fire baskets on the ledges); and from far below THE
  RIFT'S GLOW coming up the faces, pinker the deeper. The rooms on this side the mine, the antechamber and his hall the
  temple; the miners' shaft stands near the pit's brink.

In all three: lantern and fire an honest warm; nothing cyan but the knight's own; the enemy's pink only in the rift and its
cracks, the mark on his gate and over A's thresholds, and the Fleshmancer himself. It looks nothing like floor 3's black iron
prison (no iron cladding, no grates, no chains) nor floor 4's candlelit chapel of bones (no niches, no flags with grave slabs,
no candle gold on ivory). `floor5_look_sheet.png` has the three, each with its phone screen, labelled A, B, C with a line each,
and the gate close beside the knight in each, twice as big.

The art chat's lean: **A, through the threshold**. It answers his words most plainly (“you start in the mine then it becomes a
temple further on”): the mine is unmistakable and fills the first rooms, and the moment you cross into the temple is a moment
you feel, the rift's pink waiting past the carved doorway. B tells the same story more slowly but its middle rooms read busier
and muddier; C is the most spectacular, but its pit takes a back wall from the rooms and asks the game for something new (a
parapet with a deep backdrop beyond it).

## How the pictures are made

```
node tools/preview.mjs src/dev/preview_floor5_look.ts docs/mockups/floor5_look/pictures/a_through_the_threshold.png 1200 840 "overview:threshold"
node tools/preview.mjs src/dev/preview_floor5_look.ts docs/mockups/floor5_look/pictures/a_phone.png 1014 468 "phone:threshold"
  (and "overview:creep" b_the_cult_creeping_in.png, "phone:creep" b_phone.png, "overview:pit" c_the_open_pit.png, "phone:pit" c_phone.png)
PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_floor5_look.ts docs/mockups/floor5_look/pictures/floor5_look_sheet.png 1200 5037 "sheet"
  ("gate:<look>" at 400 x 608 shows the gate close on its own)
```

The whole run is 600 x 420 game pixels at two picture pixels each (the game's own size); a phone screen is 507 x 234 game
pixels with the camera on the knight where the mine turns to temple (A: in the drift before the threshold; B: in the drift
where the flags begin; C: in the shrine gallery at the pit's edge). The place is painted in picture pixels on the game's grid
(art/isokit.ts), WITH A DEPTH FOR EVERY PIXEL (x + y of the world point seen there), so that walls, sets, rock, figures and the
pit stand in front of one another as they do in the world; the round and leaning things (the timber, the rock round the cave's
mouth, the parapet's rail) are found by following each pixel's line of sight into them (`march`), and the pit's faces are
seen only where their line of sight leaves the pit through its open mouth (`pitSeen`). How much a point is the temple's is one
number, look by look (`templeK`): A sharp at the thresholds, B rising along the way from the cave to the gate with a ragged
edge, C the mine this side and the temple from the antechamber on. The pieces and figures are the game's own sprites, drawn at
their size and depth. THE LIGHT IS PAINTED IN here, in three bands round each flame and the rift, their edges a checker of
two-pixel squares (no soft gradient); the knight carries a small pool of his own. The page draws after it has loaded (the
sheet takes about a minute).

## What making his pick game-ready will need

As floors 3 and 4 were (docs/mockups/floor3_look/README.md on `art/floor3-look`: src/art/prison.ts, prison_gate.ts;
docs/mockups/floor4_look/README.md on `art/floor4-look`: src/art/chapel.ts, chapel_gate.ts), in files of their own behind
switches that are off, nothing of the game importing them until the main chat puts them in:

- **The floor**: `floor(tx, ty)` in two kinds, the mine's packed earth and the temple's black flags (laid on the tiles' lines,
  their border carved), chosen by how far the tile is along the way (A: by room; B: by its distance along the path from the
  cave to the gate, with a ragged edge where the flags give out over the earth); tiles over them: the rails (straight both
  ways, the bend, the stop), the rift's cracks (from the rift's tile, frames so they breathe with it), stones and grit.
- **Faces**: the mine's face (raw rock, the timber set's post on even tiles, the cap and lagging on every tile) and the
  temple's (pilaster on even tiles, a hanging or a carved panel at each bay's middle); for B the stages between (daubed rock,
  rock with hangings nailed to the sets, rock carved into in blocks); the rift's cracks up some temple walls. 80 high, fading as
  the game's.
- **The ways between rooms**: the mine's framed in timber, the temple's corbelled and carved, as a `GateArt`'s plain gate; for
  A the two CARVED THRESHOLDS as three-tile wall pictures in place of the doorways' faces (the front cut into the rock, the
  mark at its head, standing whole to the wall's top), and two braziers in each.
- **The cave's mouth**: where game/ways.ts already lays floor 5's mouth (`Ways.mouth`), art/cave4.ts `lairMouth` repainted
  in the picked look's rock (its wall faces the mine's raw rock with timber sets in place of the lair's dug earth; its cave,
  rim, anchor and shape unchanged).
- **The gate**: a `GateArt` (art/gates.ts) as the prison's and the chapel's: its battered pylon, its arch's strips both ways
  (lit, and alight: the skull's sockets and mouth burning the enemy's pink to gold once he has fallen, then giving the enemy's
  light), the hooked iron drop at every raise, its slam (grit and stones shaken off the rock over it) and its drop timed by
  Movement 9 (held, juddering, then down in a frame).
- **The hall**: flat (the main chat's word); its walls the temple's at its fullest, every bay a hanging or the mark; the
  rift (the floor's own piece) and its cracks; the shaft where `placeShaft` puts it (unchanged: its pictures, films and the
  ride up keep their shape and timing); braziers and skull standards.
- **Look C's own**: the pit as a backdrop beyond a back wall cut to a parapet (a new kind of wall for the game: low, with a
  timber rail, and beyond it a picture of the pit's benches drawn under everything, as the cave is), its fires and the rift's
  glow as the renderer's lights; where it may stand (a room's back wall with nothing behind it on the map).
- **The light**: the renderer's (render.ts: its dark with a hole where each light burns): lanterns on the sets in the mine,
  braziers and black candles in the temple, the rift's light the enemy's deep pink, dulled (never cyan); the floor's dark set
  to match the picture he picks. The light painted into these pictures is the guide, not the game's.
- **The pieces**: floor 5's own (`lairPieces`), recoloured into the look he picks (their colours, not their shapes), the
  mine's in the mine's rooms and the cult's in the temple's.

### What differs from the game as it would be (so he is not surprised)

- The walls the game leaves out (any wall that would hide floor behind it) are standing in these pictures, as on floors 3 and
  4's; in the game only the rooms' back walls stand, so the mine and the temple show on the rooms' far walls.
- The light will be the game's: a little darker away from the fires and the hero.

## Checks

`tests/floor5_look.test.ts`, 4 of 4: nothing of the game imports the dev pages; every picture there at the size asked for
(1200 x 840, 1014 x 468, the sheet 1200 wide and 5037 high); in each picture nothing cyan but round the knight, and nothing
pink but the enemy's own (the rift and its cracks in the floor and the walls, the skull on his gate, the marks over A's
thresholds, the Fleshmancer) or the knight's own deep red, and in the sheet the cyan in no more patches than it has knights; on
each phone screen the floor round the knight lighter than the dark and the knight standing out of the floor. `tsc` is clean.
