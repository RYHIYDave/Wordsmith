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

## Made game-ready (his “A, through the threshold (Recommended)”)

His words that began it, 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.
Floor 1 and 2 are probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”; for floor
5: “I like the temple but I need the mine to be a prominent part of it.  Like you start in the mine then it becomes a temple
further on”. His pick, 2 Nov 2026: “A, through the threshold (Recommended)”, offered as: lantern-lit mine, then carved black
doorways into the temple, lit pink by the rift.

Made ready for the game as floors 3 and 4 were (docs/mockups/floor4_look/README.md on `art/floor4-look`), in files of their own
behind switches that are off; nothing of the game imports them (a test proves it) and no game file is changed:

- `src/art/lair_temple.ts`, `makeLairTempleArt()`, behind `LAIR_TEMPLE = { on: false }`. (Not `art/lair.ts`, `LAIR`: those names
  are taken by the game's own floor 5 look today, `art/lair.ts`'s Theme, which the game imports; it stays as it is.)
- `src/art/lair_gate.ts`, `makeLairGateArt()` (a GateArt), behind `LAIR_GATE = { on: false }`;
- checked by `tests/lair_temple.test.ts`; laid and lit the game's way by `src/dev/preview_lair_game.ts`.

Every picture is in the game's measures (picture pixels, two to a game pixel, `density` 2), anchored as the game's own are. The
colours are look A's (`ROCK`, `WOOD`, `EARTH` for the mine; `STONE`, `FLAGS`, `CLOTH` for the temple, in art/lair_temple.ts; the
hangings' oxblood turned a step toward brown, so that it is never read as the enemy's pink); no light is painted in.

### The pieces and their anchors

Two parts, `mine` and `temple`, each with its floor, its floor tiles and its walls, and the same calls:

- `mine.floor(tx, ty)`: THE MINE'S FLOOR, packed earth and grit, little stones lit on their upper left, laid on the world (sixteen
  pictures, repeating every four tiles). `temple.floor(tx, ty)`: THE TEMPLE'S FLAGS, great black flags a tile each, a carved border
  round each, its edge toward the light lit, a crack across some. 64 x 32, anchored at the tile's top corner, as the game's floor.
- `mine.tiles` (floor tiles, laid over the mine's floor; each 64 x 32 at its top corner):
  - THE RAILS on their sleepers (two rails a third of a tile apart, three sleepers to a tile), through the middle of the tile:
    `rails along x`, `rails along y`; the four quarter turns `rails bending, low x to low y`, `…, low x to high y`, `…, high x to
    low y`, `…, high x to high y` (from the middle of one edge to the middle of the other); the four ends `rails' end, from low x`,
    `…, from high x`, `…, from low y`, `…, from high y` (from that edge to the tile's middle). Each rail meets the next tile's at
    the edge (a test holds it).
  - `grit and stones`; `grit at a wall along x` / `grit at a wall along y` (thick at the tile's far edge, at a wall's foot).
- `temple.tiles`: THE RIFT'S CRACKS through the flags, the enemy's pink at their heart, the stone round them stained a dark wine:
  `a crack of the rift along x` / `along y` (dull: one frame), `…, glowing` (four frames: a pulse runs along it, as the rift
  breathes; its own glow, `LAIR_LIGHTS.crack`), `a crack of the rift ending, from low x` / `high x` / `low y` / `high y`
  (thinning to nothing at the tile's middle); `bones on the flags`.
- `mine.faceLeft` / `faceRight` (`[k][f]`): THE MINE'S WALL a tile at a time, as the game lays walls (along x turned to screen-left
  and lit, along y to screen-right in shade). 80 high, as floor 5's walls are (`WALL_LOOK.tall` 40 game pixels), its top 24
  fading out in the game's own four steps; the column between two tiles' faces filled, as floor 5's own walls fill it (its earth
  `dug`; a test lays them column by column on the game's own floor-5 walls: the same top, the same foot). 64 x 112, anchored at
  the floor point of the tile's top corner. RAW ROCK broken in facets, the scores of the picks, a seam of ore; A BAY is two tiles:
  [0] and [2] carry A TIMBER SET's post at their start (squared, 10 across, its edge toward the light lit), THE CAP runs along the
  wall over both tiles (50 to 58 up), a wedge over each post. Bay [0]+[1] has A MINER'S LANTERN on a nail in its post (its foot
  29 up; its flame moves in four frames; its light on the picture, `lights[0]`) and LAGGING BOARDS between the posts' tops (34 to
  50); bay [2]+[3] is raw rock with a bare post. `mine.face(alongX, tx, ty, f)` picks them so that the posts fall every two tiles
  along a wall (on even x along x, even y along y) and about half the bays have a lantern.
- `temple.faceLeft` / `faceRight` (`[k][f]`, the same measures): THE TEMPLE'S WALL, black dressed stone in courses 16 high on a
  moulded plinth (12): [0] and [2] A PILASTER at their start (14 across, a groove down it, a capital band at 60); [1] A HANGING
  (oxblood, on an iron rod at 70, ragged at its hem, the cult's mark in chalk at its middle); [3] A CARVED PANEL (22 to 61) with
  THE SHRIEKING SKULL in relief (art/floor5.ts `shriekAt`). One frame each (the four `f` are the same picture).
  `temple.face(alongX, tx, ty, f)` picks them so that the pilasters fall every two tiles.
- `threshold(alongX)`: THE THRESHOLD, where the mine meets the temple: a broad front of the black stone (a tone lifted, as the gate's,
  so that it reads across the dark) cut into the raw rock round a doorway, as strips (art/gates.ts `Flat`, eight wide each, like a
  gate's arch): 20 strips, from u -32 to 128, i.e. `t` -1 to 3.75 from the doorway's first tile: the tile of wall before the
  doorway, its three tiles, the tile after. Measures (`THRESHOLD`, from the way's middle): the way open from the floor, 92 across
  to 42 up, then corbelled in (76 across to 50, 60 to 58, 40 to its head at 66); A BAND 10 broad round it, its inner half carved in
  a row of teeth; PILASTERS 58 to 72 out from the middle, the mark carved on their capitals (52 to 65); the front up to 80 (the
  walls' height), standing whole over the walls' fading top, and over the way A STEPPED CROWN to 104; at its head THE MARK (88 up,
  9 to a side) in a roundel, the enemy's pink dull in its eyes and its mouth (FLAME[0] and [1], never bright); beyond the pilasters
  to the strip's end the raw rock it is cut from, fading as the wall does.
- `mouth(alongX)`: THE CAVE'S MOUTH FROM FLOOR 4 (art/cave4.ts `lairMouth`, his yes): `under`, `over`, `whole`, `ax`, `ay`, the
  same pictures' size, anchor and shape pixel for pixel (a test holds it); its cave, its rim and the earth fallen before it in the
  mine's colours, and the three tiles of wall round it the mine's own face (where floor 5's face was, fading at its top as the walls
  do). Stood exactly where the game stands `lairMouth` today.
- `hall.faceLeft` / `hall.faceRight` (`[k][f]`, k the tile's place along the wall mod 4): HIS HALL'S WALL, the temple at its
  fullest: [0] a pilaster with A CRACK OF THE RIFT up the stone beside it (its heart the enemy's pink, a pulse rising up it in four
  frames), [1] a hanging, [2] a pilaster, [3] the skull panel: every bay a hanging or the mark.
- `pieces`:
  - the place's own (`LAIR_OWN`, each with its part, `LAIR_OWN_PART`): `the rails' stop, along x` / `along y` (a beam across the
    rails' end on two blocks; on the floor, 64 x 48 at (32, 30), the floor point under its middle), `a cart on the rails, along x` /
    `along y` (floor 4's cart, upright, heaped with ore; an obstacle, 96 x 88 at (48, 60)), `a lantern post` (a squared post on a
    sill, an arm, a miner's lantern hung from it; four frames, its light; an obstacle, 64 x 128 at (32, 112)): the mine's; `a
    brazier` (black iron, the mark on its bowl, an honest fire; four frames, its light; an obstacle, 64 x 96 at (32, 84)): the
    temple's.
  - every one of FLOOR 5'S OWN PIECES (art/floor5.ts, his yes already), under the same names and kinds, at the same sizes and
    anchors and with the same lights, in look A's colours for its part (`LAIR_PART`: the mine's warmed toward its rock and timber,
    the temple's cooled toward its black stone, two fifths of their own colour kept; fire and the enemy's pink as they were):
    the mine's the lagged wall, the cave-in, the drilled face, the boarded adit, a miner's candle, rope and pulley, the hung
    kibble, the trodden way, the rails' bend, the plank walk, spoil, the grasping earth, the charge, powder keg, basket of ore,
    the cart on its side, a miner's bones, a dropped lantern, the spilled kibble, the winding drum, the sump pump, the pile of
    props, the door; the temple's everything of the cult's (the priest in the stone, the shrine, black glass, the banners, the
    robe, the candle ledge, the daubed mark, bones on cords, the ring, the slab, the shrieking skull, box of candles, offering
    jar, skulls given to him, the effigy, the skull standard, the two bone heaps, the rift, the coffer, the gates, his book).
  - THE MINE SHAFT is the game's own, unchanged (`LAIR_UNCHANGED`): art/shaft.ts's stills, films and ride up keep their colours
    with their shape and timing.

### His gate (`src/art/lair_gate.ts`)

A GateArt, as the chapel's: everything but the boss's pillar, arch and drop is floor 5's own (`lairGates()`), in look A's colours
(its log doors, their posts and lintels, its levers and seals the mine's; its plain gates of the cult's stone the temple's).

- `pillar(true)`: A BATTERED PYLON of the black worked stone (the temple's, a tone lifted), on a plinth (10), its faces leaning in
  as they rise to the lintel at 92 (`LG_UNDER`), a channel cut down each face, courses every 18; its footprint the game's pillar
  (`PILLAR`). One picture for a gate either way, 40 x 122, anchored at its front corner on the floor.
- `arch(alongX, true, lit)`: strips from the outer edge of one pillar to the other: THE LINTEL, one slab from 92 to 112, its band
  notched, ITS UNDERSIDE CUT INTO A ROW OF FANGS over the way (eight, long and short by turns, the long to 82: `LG_SPRING`, the
  lowest of it); over it a ragged course of the dressed stone giving out to THE MINE'S RAW ROCK, rising to a ragged crest (about
  198 at its middle, the same either side so the gate is one shape both ways), its lip going back; and carved out of the rock THE
  SHRIEKING SKULL (60 across, its middle at 148: `LG_SKULL`), its jaw dropped wide, the enemy's fire dull and low in its sockets and
  its mouth (FLAME[0] and [1]), in embers, never in rings; or `lit` (the drop down behind the hero, the fight on) its sockets and
  mouth ALIGHT, pink at their rims burning to gold, and then it gives the enemy's light (FLAME[2], 30, 0.36).
- `portcullis(alongX, true, raise)`: THE DROP at the back of the way: bars of black iron every twelve (`LG_BARS`, 18 to 102), their
  ends HOOKED toward the way's middle like a jaw's teeth (six long), straps across every 24, riveted; the game's raise 0 to
  `GATE_UP` drawn up 0 to 72 (`lairLift`; `LG_LIFT` 72: its hooks under the fangs, a hero 56). What is behind the gate's thickness
  is not drawn, as the chapel's.
- THE DROP'S FALL, Movement 9 (`LAIR_GATE_DROP`, at 30 a second from the moment the fight begins): 60 60 56 60 60 54 60 58 52 60
  (held, juddering), 24 (the drop), 0 (the landing, frame 11, `LAIR_SLAM_AT`: the slam begins, the skull lights), 0 6 8 2 0 0 (a
  bounce, then down). `lairGateDropAt(frame)` gives `{ raise, slam, lit }`.
- THE SLAM, `lairGateSlam(alongX, f)`, f 0 to 15: stones and grit shaken off the rock over the lintel, falling before the gate,
  striking the floor with a hop and lying; the mine's dust thrown off the floor both ways and rolling out low, thinning (no fire,
  no pink). 280 x 240, anchored at the middle of the gate's foot.

### The light, for the main chat to place

Nothing of the light is painted in: as everywhere in the game the renderer lays its dark and cuts a hole where each light burns
(render.ts `light`, `spot(x, y, r, strength)`), and what gives light is drawn over it (`drawLights`, `drawGlow`). `LAIR_LIGHTS`
(art/lair_temple.ts) holds these numbers; `src/dev/preview_lair_game.ts` lays them exactly so, with the game's own pools round the
hero (380 at 0.36, 165 at 1), the boss's own (56 at 0.7) and its vignette (0.62). In game pixels:

- THE DARK on floor 5: `rgba(6, 4, 14, 0.8)` in place of `FAR_DARK` 0.88 (look A's lantern-lit dark).
- A MINER'S LANTERN on a post of the mine's wall (the tiles of a lantern bay that carry one: their picture has `lights`): a hole at
  the picture's light's point, radius 64, strength 0.9; its glow is on the picture (`#ff8a2a`, EMBER[2], the miners' honest
  orange, 24, 0.42).
- EVERY OTHER TILE OF THE MINE'S WALL: a low hole at the foot of its face under the tile's middle, 26 up, radius 30, strength
  0.32, so that the rock reads where the lanterns' light would reach it.
- A LANTERN POST: a hole at its picture's light's point, radius 72, strength 0.92; its glow on the picture.
- A BRAZIER: a hole 18 up from its anchor, radius 66, strength 0.9 (render.ts lights a brazier so: 14, 62, 0.9); its glow on the
  picture (EMBER[2]).
- A GLOWING CRACK OF THE RIFT in the flags: a hole at the tile's middle, radius 34, strength 0.42; its glow on the tile's picture
  (FLAME[1], 16, 0.16: the enemy's pink, dim).
- THE RIFT in his hall (floor 5's own piece, its own glow on its picture): a hole 4 up from its anchor, radius 84, strength 0.62.
- HIS HALL'S CRACKED WALL TILES (`hall.faceLeft[0]`, `faceRight[0]`): a hole at the foot of the face under the tile's middle, 16
  up, radius 36, strength 0.4, and a glow there (FLAME[1], 18, 0.18).
- HIS GATE, alight: its light is on its arch's strip (the enemy's, FLAME[2], 30, 0.36).
- The shaft's onsetter's candle, as the game lights it now.

### How to bring it in (the main chat; not done here)

1. THE SWITCHES: on with his yes to it in play: floor 5 (look 5) is the mine and the temple while `LAIR_TEMPLE` is on; its gates are
   `makeLairGateArt()` while `LAIR_GATE` is on.
2. WHICH ROOMS ARE WHICH: the temple is his hall and the room his doorway opens from (the antechamber), and any room only reached
   through them; every other room, and the first (where he comes out of the cave), is the mine. Look A's story: you start in the
   mine, and cross into the temple at a carved doorway, a room or two before his gate. The corridors take the part of the room
   they lead from, toward the start.
3. THE FLOOR: every floor tile drawn with `mine.floor(tx, ty)` or `temple.floor(tx, ty)` by its room's part; over the mine's, THE
   RAILS along the way the floor leads through the mine rooms (straight and bending tiles, a `rails' end` at each end), their last
   end a tile before a threshold with `the rails' stop` stood on it (along x or y as the rails run), a `cart on the rails` on them
   somewhere; `grit at a wall along x / y` at the feet of the mine's walls that stand, `grit and stones` here and there; over the
   temple's, THE RIFT'S CRACKS out from the rift in his hall (glowing within two tiles of it, dull further, each run closed by an
   `ending` tile), a short one in the antechamber, `bones on the flags` here and there.
4. THE WALLS: every wall face drawn with `mine.face(alongX, tx, ty, f)` or `temple.face(alongX, tx, ty, f)` by the part of the
   floor before it (along x: the tile at y + 1; along y: at x + 1); his hall's ring of wall `hall.faceLeft[tx mod 4][f]` /
   `hall.faceRight[ty mod 4][f]`; the frame by time (about 6 a second, as a fire's). The walls the game leaves out
   (render/walls.ts, `wallsAway`) stay out.
5. THE THRESHOLDS: at every doorway between a mine room and a temple room (left open: no door in it), stand
   `threshold(spot.alongX)`'s strips as render.ts `standDoors` stands a gate's arch: `strips(list, 0, 0)` (each at `at(q.t, 0)`
   from the doorway's first tile, depth `x + y + STRIP / 64`), whether the wall it is in stands or is left out (it stands alone
   then, as a gate does). Where that wall stands, the faces of its tile before the doorway and its tile after (`a - 1`, `a + 3`)
   are not drawn: the threshold covers them. Two braziers just inside the temple, either side of the way (a quarter of a tile in
   from its ends, half a tile into the room): look A's “two braziers burn in its way”.
6. HIS GATE: with `LAIR_GATE` on, floor 5's gates are `makeLairGateArt()` (wherever `lookGates(5)` / main.ts choose them), stood by
   render.ts `standDoors` as any boss gate (no change there). For its drop, as the yard's and the chapel's: drive the boss gate's
   raise from `lairGateDropAt((game.time - d.fell) * 30)` in place of `d.open * GATE_UP` while it falls, light the skull from
   `LAIR_SLAM_AT`, stand `lairGateSlam(s.alongX, f)` at `at(1.5, PILLAR / 32)` (depth x + y + 0.3) for its 16 frames, a small
   shake of 2 for 4 frames. Its rock rises to about 200 over walls 80 high that fade: it stands whole over the dark.
7. THE WAY IN FROM FLOOR 4: where game/ways.ts already lays floor 5's mouth (`Ways.mouth`), `mouth(alongX)` in place of
   art/cave4.ts `lairMouth(alongX)` (render/dress.ts draws `under` flat with the floor and stands `over` at the doorway's anchor:
   the same, unchanged); the three wall tiles of the mouth are not drawn, as now.
8. THE SHAFT: as it is: where `placeShaft` puts it, its stills and films unchanged.
9. THE PIECES: with `LAIR_TEMPLE` on, floor 5's pieces (`lookPieces(5)`, art/floors.ts) are `pieces` (the same names, look A's
   colours), the mine's (`LAIR_PART`, `LAIR_OWN_PART` 'mine') stood in the mine's rooms and the temple's in the temple's; one or two
   `a lantern post` in each mine room; `a brazier` two to four in each temple room and two by his gate.
10. THE LIGHT, as above.

### What differs from A as he saw it (so he is not surprised)

- The light is the game's: its dark with holes and soft glows, not the painted bands of the pictures; a little darker away from
  the lanterns, the braziers and the hero.
- The walls the game leaves out (any wall that would hide floor behind it) are not drawn: the walls between the rooms, and those
  toward the eye. Only the rooms' far walls stand, so the mine's timbered rock and lanterns are on the far walls of the mine's
  rooms; the THRESHOLDS stand where the walls between the mine and the temple would be, on their own, as a gate does.
- The free-standing timber sets across the rooms in A are lantern posts here (one post, a lantern on its arm): a set two posts
  wide across a room would be a wall the game has no place for.
- The rails end on their stop a tile before the threshold, not in its way (its way is clear to walk); its two braziers stand just
  inside the temple, either side of it.

### Pictures

- `pictures/game_ready.png` (1200 x 2396): floor 5's rooms built from these pieces the game's way, the knight in the drift, beside
  A as he saw it; the crossing, twice as big (the rails ending at the carved doorway, the braziers burning in its way, the black
  temple past it); one phone screen (1014 x 468) at the game's own size, the knight in the mine at the threshold; and the gate close
  with the knight, twice as big, its hooked bars up as he comes to it and then down behind him with the skull alight.

```
PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_lair_game.ts docs/mockups/floor5_look/pictures/game_ready.png 1200 2396 "sheet"
  ("run" at 1200 x 840, "close" at 1200 x 664, "phone" at 1014 x 468 and "gate" at 1120 x 600 give those alone)
```

### Checks

`tests/lair_temple.test.ts`, 18 of 18: off, and nothing of the game imports either file; every piece the brief asks for painted
(and every one of floor 5's own, each in a part); every picture at its size and anchored where the game lays it (the walls as high
as `WALL_LOOK.tall` and fading as far down as its `fade`, every column of a face 80 high, column by column the game's own floor-5
walls' top and foot; the threshold's strips a quarter of a tile from t -1; the pieces' anchors); crisp (every pixel whole or empty
but a wall's fading top, in the game's own four steps; a floor tile covering its whole diamond; no pixel alone; nothing cut off);
nothing cyan; the enemy's pink only in the rift's cracks, the cracked tile of his hall's wall, the threshold's mark (dull) and floor
5's own fire, none at all in the mine; the lights an honest orange, the cracks' the enemy's pink; the floors and walls darker than
the darkest word; light from the upper left and the posts and pilasters every two tiles; the lanterns on some posts, their flames
moving in four frames, their light; the lantern post and the brazier; the cracks dull or breathing; the rails meeting at every
edge; floor 5's own pieces with their shapes, anchors, lights and fire as they were, the mine's warmer than the temple's, the shaft
the game's own; the cave's mouth its size, anchor and shape pixel for pixel, in the mine's colours, its wall fading as the walls'
do; the threshold's way open across the doorway with a hero's room, the front to the tiles either side, its crown over the walls'
top, the same shape both ways and lit along x; and the gate: floor 5's own for all but the boss's, crisp, nothing cyan, pink only
in the skull, the way exactly three tiles with its middle clear to the lintel, the fangs, the same shape both ways and lit along x,
the skull in embers and alight giving the enemy's light only alight, the iron drop from up (its hooks at 72) down step by step to
the floor, the drop's timing and the slam's falling stones and thinning dust. With them `tests/floor5.test.ts`,
`tests/floor5_look.test.ts`, `tests/gates.test.ts` and `tests/bosses.test.ts` pass, and `tsc` is clean.
