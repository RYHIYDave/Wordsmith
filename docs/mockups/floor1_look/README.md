# FLOOR 1, THE WARDEN'S FLOOR: THE KING'S TOMB WITH DAYLIGHT (PICTURES FIRST; NOT IN THE GAME)

Branch `art/floor1-look`, from `high-city` at f6688d9. The three looks for him to pick from: `src/dev/floor1_look_paint.ts`
(the painting) and `src/dev/preview_floor1_look.ts` (the page that lays the pictures out), checked by
`tests/floor1_look.test.ts`. Nothing of the game imports any of it, and nothing of the game is changed: no switch is needed
until his pick is made game-ready.

## His words

- 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and 2 are
  probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”.
- 2 Nov 2026, 10:13: “We may as well redo the first level as well.  Why not, we just did every other level right?” Read (and he
  was told so) as: floor 1 gets a place of its own built round the Warden.
- His pick: “Tomb with daylight (Recommended)”, offered as: the king's grand tomb just under the town: pale carved stone,
  effigies, faded banners, roots breaking through, shafts of daylight from cracks above, the Warden's iron locks. The brightest
  floor, before it gets dark. (Not picked: the same tomb sealed in the dark by candlelight.)
- Of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”.

## What is drawn

Floor 1 laid as the main chat lays it, COMBO (game/dungeon.ts, `CRYPT_KINDS`: tight rooms you find your way through), in the
same frame as floors 3 to 5's looks: you come down THE TOWN'S STAIRS into THE STAIR HALL (bottom left): the stairs stand in
its back wall, in the game's gate arch (art/gates.ts `ARCH`: 40 to its spring, 42 its rise), as art/town_ways.ts
`floorStairsUp` has them (his yes, 22 Oct): a flight of the floor's own stone going up away from the room under a vault, and
at its head the town's daylight, here pouring down the flight onto the hall's floor. From the stair hall two ways round, each
through a tight room: THE EFFIGY HALL (bottom middle) or THE KING'S COURT (left, up); both come to THE ANTECHAMBER before his
gate. In the antechamber's far wall the boss's doorway with HIS GATE; beyond it HIS HALL, ten tiles each way, flat (the main
chat's word), the Warden as the game has him (`makeWardenArt`, standing) in its middle and its middle kept open for his
Lockdown (the rows of bars come down across the whole room: nothing stands in it but the king's runner on the floor); at its
back the king's throne between two cressets and two tombs of his court in chains. The stairwell down that opens in his
hall's floor when he dies (art/crypt_ways.ts, art/stairwell_open.ts, his yes) is not drawn: it is not there while he lives.

- **The walls**: dressed stone in courses on a moulded plinth, A PILASTER every two tiles (fluted, a capital of carved leaves),
  and between them, bay by bay: a FADED BANNER of the king's (on an iron rod, swallowtailed, a border and the king's crown in
  faded gold), A WALL TOMB (an arched niche, a chest with a little arcade carved on it and an effigy lying on it, head on a
  pillow, hands folded, feet up), A BURIAL CELL barred with THE WARDEN'S IRON (an arched opening, bars every six, crossbars, a
  lock plate; a skull and bones on the shelf in the dark behind), or THE KING'S CROWN carved in a panel. Along x lit, along y
  in shade; their tops fading into the dark in the game's four steps; the walls toward the eye cut low with a coping.
- **The ways between the rooms**: round-headed, under a ring of voussoirs.
- **The floor**: great flags a tile each, a carved border round each; BRASS inlaid in a band round every room and in a star at
  the flags' corners in his hall; THE GRAVE SLABS OF THE KING'S COURT let into it (two tiles long, a knight cut in each, his
  sword down his middle; brass edges), most in the king's court; THE KING'S RUNNER (floor 1's own) from his gate to his throne.
- **The tombs**: chests of the tomb's stone on a plinth, a little arcade carved round their sides, the lid overhanging, an
  EFFIGY lying on each; BOUND IN THE WARDEN'S IRON: two straps round each, over the effigy, and a lock hung on its side.
- **The shafts of daylight**: each a column of light leaning from the upper left down from a crack in the vault above to a pool
  on the floor; seen as the air in it lit, streaked along its length, motes of dust in it, brightest low down and giving out
  in steps up into the dark; laid over what is behind it, never over what stands in front of it, nor over a figure stood in
  it (so the knight stays crisp in it); the pool on the floor in three bands, and a soft fill round it.
- **The floor's own pieces** (art/floor1.ts, his yes already), brought into each look's light, their colours and not their
  shapes (`graded`: each colour sorted into its family by the nearest of floor 1's own colours, the dressed stone, the old
  iron, the timber, the Warden's wine, bone, gold, and put at the same place in that family in the look's own): the king's
  throne, cressets, horned knights, the rack of mauls, the king's coffer, sarcophagi, an open sarcophagus, urns, the skull
  jar, the bone box, candles, the statue's head, the fallen banner, a chain, dropped keys; on bare bays of the walls keys on
  a hook, shackles, a shield, a horned helm on a peg, crossed mauls; in the floor the king's runner, ledger stones, the crown
  in the floor, the grave slab and ring, the sunken grave slab, the drain.
- **HIS GATE**, an original design, in the tomb's carved stone with his iron, built as the game's boss gates are (the three
  tiles of the way between two pillars 12 wide: art/gates.ts `SPAN`, `PILLAR`): FLUTED PILLARS of the pale stone to a spring at
  46; a ROUND-HEADED WAY (its crown at 86) under A RING OF VOUSSOIRS; the stone squared over it to A CORNICE (108 to 116) and A
  GABLE like a tomb's front, a hand's breadth thick, rising to 170, THE KING'S CROWN carved great in it; and on it THE WARDEN'S
  IRON: A BAND riveted across under the cornice, CHAINS from rings on the pillars to A GREAT LOCK hung over the keystone (84 to
  100), the enemy's fire dull and low in its keyhole (the only pink on the floor but the Warden), SPIKES along the gable's
  raking edges, and at its peak HIS HORNS in black iron (to 214), his helm's; THE DROP at the back of the way, drawn up (its
  points at 80; a hero is 56): square bars of black iron every twelve, pointed, a strap across, as his Lockdown's bars. The same
  gate in all three looks, in each look's light.

## The three looks

Each a different take within his pick, each its own light:

- **A, MORNING LIGHT** (`a_morning_light.png`, `a_phone.png`): a warm pale limestone, FADED BLUE AND GOLD BANNERS, brass
  bright in the floor; long WARM GOLD SHAFTS slanting in from the upper left, dust turning in them; a root here and there come
  down the walls from the cracks with IVY round its head; water stains under the cracks.
- **B, THE ROOTS BREAK IN** (`b_the_roots_break_in.png`, `b_phone.png`): the town's TREE ROOTS through the vaults everywhere,
  thick down the walls and across the floor, the flags heaved round them; MOSS on the tombs, the effigies, the plinths and in
  the joints; the banners rotted green-gold and eaten through; many small GREEN-GOLD SHAFTS through the roots' holes; water
  DRIPPING into puddles that catch the light.
- **C, COOL MARBLE AT NOON** (`c_cool_marble_at_noon.png`, `c_phone.png`): WHITE MARBLE, its veins, GREY-BLUE SHADE, the floor a
  checker of white and grey-blue marble, black marble grave slabs; A FEW SHARP BEAMS of noon light, near upright, hard-edged
  pools; THE WARDEN'S BLACK IRON stark against it: his chains hung pilaster to pilaster over the cells and wall tombs, every
  tomb strapped and locked, more of the bays barred.

In all three: daylight warm and honest, the cressets an honest fire; nothing cyan but the knight's own; the enemy's pink only
in the Warden and the lock of his gate. It looks nothing like floors 2 to 5: no blood, no black iron prison, no candlelit bones,
no mine; and it is the brightest of them (its lit places come to 69 to 75 of 255, floor 4's to 55, floor 5's to 44).
`floor1_look_sheet.png` has the three, each with its phone screen, labelled A, B, C with a line each, and the gate close beside
the knight in each, twice as big.

The art chat's lean: **A, morning light**. It is the plainest answer to his pick and the most inviting first room after the
town: warm, gold, the king's blue banners, the light falling in long shafts, with the Warden's iron and the cells showing the
danger. B is the richest but its roots and moss make the rooms busier and the floor harder to read under a fight; C is the
grandest and shows the Warden's iron best, but its grey reads colder than a first floor wants.

## How the pictures are made

```
node tools/preview.mjs src/dev/preview_floor1_look.ts docs/mockups/floor1_look/pictures/a_morning_light.png 1200 840 "overview:morning"
node tools/preview.mjs src/dev/preview_floor1_look.ts docs/mockups/floor1_look/pictures/a_phone.png 1014 468 "phone:morning"
  (and "overview:roots" b_the_roots_break_in.png, "phone:roots" b_phone.png, "overview:noon" c_cool_marble_at_noon.png, "phone:noon" c_phone.png)
PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_floor1_look.ts docs/mockups/floor1_look/pictures/floor1_look_sheet.png 1200 5057 "sheet"
  ("gate:<look>" at 400 x 628 shows the gate close on its own)
```

The whole run is 600 x 420 game pixels at two picture pixels each (the game's own size); a phone screen is 507 x 234 game
pixels with the camera on the knight, in the effigy hall in a shaft of light (the same spot in all three, to compare). The
place is painted in picture pixels on the game's grid (art/isokit.ts), WITH A DEPTH FOR EVERY PIXEL (x + y of the world point
seen there), so that walls, tombs, the gate and figures stand in front of one another as they do in the world; the round
things (the tombs and their effigies, the stairs up seen through their arch) are found by following each pixel's line of sight
into them (`march`). THE LIGHT IS PAINTED IN here: the pools in three bands round each shaft's middle at every height, their
edges a checker of two-pixel squares (no soft gradient); the air of each shaft over what is behind it (`paintBeams`). The
pieces and figures are the game's own sprites, drawn at their size and depth. The page draws after it has loaded.

## What making his pick game-ready will need

As floors 3, 4 and 5 were (docs/mockups/floor5_look/README.md on `art/floor5-look`, "Made game-ready"), in files of their own
behind switches that are off, nothing of the game importing them until the main chat puts them in:

- **The floor**: `floor(tx, ty)`, the look's flags (C: its marble checker), with the brass band and the grave slabs as floor
  tiles (a slab two tiles long, along x and along y, its knight cut in it), and for B the roots' tiles and puddles.
- **Faces**: the tomb's face a tile at a time (pilaster on even tiles; a banner, a wall tomb, a barred cell or the crown carved
  at each bay's middle), 80 high and fading as the game's; for A the roots and ivy as tiles of their own; for B the roots, the
  moss, the rotted banners; for C the chains hung bay to bay. The ways between the rooms round-headed, as a `GateArt`'s plain gate.
- **The stairs up**: art/town_ways.ts `floorStairsUp` repainted in the look's stone, with the town's daylight down the flight
  (its arch, anchor, size and shape unchanged); the game already stands it in the first room's back wall.
- **The tombs**: the chest with its effigy, bound in iron and locked (an obstacle, along x and along y), and unbound.
- **The gate**: a `GateArt` (art/gates.ts) as the prison's, the chapel's and the temple's: its pillar, its arch's strips both
  ways (the lock's keyhole in embers, and alight once the drop is down: pink at its rim burning to gold, giving the enemy's
  light), the iron drop at every raise, its slam (dust shaken off the cornice, the chains swinging) and its drop timed by
  Movement 9 (held, juddering, then down in a frame).
- **The hall**: flat, its middle open for the Lockdown; the stairwell where it opens now (art/crypt_ways.ts, art/stairwell_open.ts,
  unchanged in shape and timing), in the look's stone.
- **The light**: the renderer's (render.ts: its dark with a hole where each light burns). Here the place's own colours are
  painted a little over the darkest word (Colour 4, 95 of 255: the stone's body about 80, its lit tone about 105, its lit edge 120
  to 130)
  to show it as it will look lit; made ready, the stone's own colours go back under the darkest word and the daylight comes
  from the renderer: floor 1's dark set much lighter than the Crypt's below it, A SHAFT OF DAYLIGHT as a light of its own kind
  (a strong pool where it falls, warm gold in A, green-gold in B, white in C, and its column of lit air drawn over the floor as
  a glow, leaning from the upper left), the town's daylight down the stairs, the cressets as fire.
- **The pieces**: floor 1's own (`wardenPieces`), recoloured into the look he picks (their colours, not their shapes).

### What differs from the game as it would be (so he is not surprised)

- The walls the game leaves out (any wall that would hide floor behind it) are standing in these pictures, as on floors 3, 4
  and 5's; in the game only the rooms' back walls stand, so the banners, tombs and cells show on the rooms' far walls.
- The light will be the game's: a little darker away from the shafts and the hero, the shafts a soft glow.

## Checks

`tests/floor1_look.test.ts`, 5 of 5: nothing of the game imports the dev pages; every picture there at the size asked for
(1200 x 840, 1014 x 468, the sheet 1200 wide and 5057 high); in each picture nothing cyan but round the knight, and nothing
pink but the enemy's own (the Warden, the lock on his gate) or the knight's own deep red, and in the sheet the cyan in no more
patches than it has knights; on each phone screen the floor round the knight well lit out of the dark and the knight standing
out of it, darker and lighter both; and each look brighter in its lit places than floors 4 and 5's looks were. `tsc` is clean.

## Made game-ready (his “B, roots break in”)

His words that began it, 2 Nov 2026, 10:13: “We may as well redo the first level as well.  Why not, we just did every other level
right?”; his pick of the way, “Tomb with daylight (Recommended)” (the king's grand tomb just under the town: pale carved stone,
effigies, faded banners, roots breaking through, shafts of daylight from cracks above, the Warden's iron locks; the brightest
floor, before it gets dark). His pick of the three looks, 2 Nov 2026: “B, roots break in”, offered as: thick tree roots through
the vaults, moss on the tombs, green-gold light, dripping water. Busier underfoot.

Made ready for the game as floors 3, 4 and 5 were (docs/mockups/floor5_look/README.md on `art/floor5-look`, "Made game-ready"), in
files of their own behind switches that are off; nothing of the game imports them (a test proves it) and no game file is changed:

- `src/art/tomb.ts`, `makeTombArt()`, behind `TOMB = { on: false }` (the names were free);
- `src/art/tomb_gate.ts`, `makeTombGateArt()` (a GateArt), behind `TOMB_GATE = { on: false }`;
- checked by `tests/tomb.test.ts`; laid and lit the game's way by `src/dev/preview_tomb_game.ts`.

Every picture is in the game's measures (picture pixels, two to a game pixel, `density` 2), anchored as the game's own are. The
colours are look B's (`STONE`, `FLAGS`, `SLAB`, `MOSS`, `ROOT`, `CLOTH`, `TRIM`, `IRON`, `WATER` ... in art/tomb.ts), brought down
under the darkest word (his Colour 4: at the 99th of their pixels the floors, tiles, walls and the ways between rooms are darker
than the word "power", 95 of 255); the light makes it bright. No light is painted into the place; the daylight's own pictures
are light, drawn added (below).

### The pieces and their anchors

- `floor(tx, ty)`: THE TOMB'S FLAGS, pale carved flags a tile each, a carved border round each with its edge toward the light lit,
  moss in the joints and creeping out of them, a crack across some, damp stains (sixteen pictures, repeating every four tiles).
  64 x 32, anchored at the tile's top corner, as the game's floor.
- `tiles` (floor tiles, laid over the flags; each 64 x 32 at its top corner):
  - THE ROOTS lying across the floor, thick and round (lit along their tops toward the light, bark streaks, moss on them), their
    shadow and the flags heaved and cracked round them: `a root along x`, `a root along y`; the four quarter turns `a root bending,
    low x to low y`, `..., low x to high y`, `..., high x to low y`, `..., high x to high y` (from the middle of one edge to the
    middle of the other); the four ends `a root's end, from low x`, `..., from high x`, `..., from low y`, `..., from high y` (from
    that edge to the tile's middle, thinning to a point). Each meets the next tile's at the edge (a test holds it). They are flat on
    the floor: whether any of them blocks is the main chat's to decide.
  - `a puddle` (four frames: the rings of the drips spreading; the vault's light caught in it in a streak);
  - `moss` (a cushion of it over the flags); `fallen leaves and earth` (a heap of earth fallen through a crack in the vault, leaves
    on and round it); `fallen leaves` (scattered, green-gold and gone brown);
  - THE GRAVE SLABS OF THE KING'S COURT, two tiles long, a knight cut in each, moss in the cut: `a grave slab along x, its head` and
    `..., its foot` (head at the lower x), `a grave slab along y, its head` and `..., its foot`.
- `faceLeft` / `faceRight` (`[k][f]`, 12 each way, four frames each, all the same picture): THE TOMB'S WALL a tile at a time, as
  the game lays walls (along x turned to screen-left and lit, along y to screen-right in shade, a tone down). 80 high, as floor 1's
  walls are (`WALL_LOOK.tall` 40 game pixels), its top 24 fading out in the game's own four steps; the joint between two tiles'
  faces left empty, as floor 1's own walls leave it (a test lays them column by column on the game's own floor-1 walls: the same
  top, the same foot). 64 x 112, anchored at the floor point of the tile's top corner. Pale dressed stone in courses on a moulded
  plinth, mossed low down and in the joints; A BAY is two tiles (`TOMB_BAYS`, `[2b]` its first tile, `[2b + 1]` its second): A
  PILASTER (fluted, a capital of carved leaves at 60 to 70) straddling the joint at every bay's start, and in the bay A ROTTED
  BANNER of the king's (green-gold, eaten through, its hem rotted ragged, a faded gold border and his crown, on an iron rod at 70),
  A WALL TOMB (an arched niche, a chest with a little arcade carved on it, an effigy lying on it mossed), A BURIAL CELL barred with
  the Warden's iron (bars every six, crossbars, a lock plate, bones in the dark behind), THE KING'S CROWN carved in a panel, or bare
  stone; and in every bay THE TOWN'S ROOTS come down through the vault (from over the wall's fading top), two of them to the floor.
  `face(alongX, tx, ty, f)` picks them so that the pilasters fall every two tiles (on even x along x, even y along y) and the bays
  vary along a wall.
- `hall.faceLeft` / `hall.faceRight` (`[k][f]`, k the tile's place along the wall mod 8): HIS HALL'S WALL in order, `HALL_BAYS`: a
  banner, a barred cell, the crown with a great root to the floor, a banner.
- `archway(alongX)`: THE WAY BETWEEN TWO ROOMS, as strips (art/gates.ts `Flat`, eight wide each, like a gate's arch): 20 strips, u
  -32 to 128 (`t` -1 to 3.75 from the doorway's first tile): the tile of wall before the doorway, its three tiles, the tile after.
  A round-headed way (`ARCHWAY`: 92 across to its spring at 40, its head at 68) under a ring of voussoirs (8), moss on them; the
  tomb's wall either side, fading at its top as the walls do; a root down it. The way is open across the doorway; the same shape
  both ways, lit along x.
- `stairsUp(alongX)`: THE TOWN'S STAIRS COMING DOWN, in place of art/town_ways.ts `floorStairsUp(CRYPT_FLOORS[0], alongX)`: its
  size (128 x 184), its anchor (4 or 124, 112: where the arch's first strip begins, at the wall's face) and its shape pixel for
  pixel (a test holds it), seen through the plain gate's arch where the game stands it: a flight of the tomb's flags going up away
  from the room under a vault, the risers in their own shade, moss at the steps' ends, and THE TOWN'S DAYLIGHT pouring down it,
  brighter the higher, the day at its head.
- `stairwell(way)` and `stairwellOpens(way, at)`: THE STAIRWELL DOWN where art/crypt_ways.ts puts it, and its opening as he dies
  (art/stairwell_open.ts): the game's own painters given the tomb's stone (`TOMB_THEME`, floor 1's own theme in look B's colours).
  The stairwell's shape and anchor pixel for pixel the game's; the opening the same moment, its jolts on the same frames, ending
  on the stairwell to the pixel (99 frames to floor 1's 101: its last two frames of thinning dust are the same picture in the
  tomb's colours, and the moment drops still frames at its end).
- `pieces`:
  - the place's own (`TOMB_OWN`): `a chained tomb, along x` / `along y` (a tomb of the king's court: a chest of the pale stone, its
    arcade, its lid, an effigy lying on it, moss on it; bound in THE WARDEN'S IRON, two straps and a plain iron lock: no pink; an
    obstacle, two tiles by one, 112 x 108 at (56, 78), the floor point under its middle; shadow 0.55); `a tomb of the court, along x`
    / `along y` (the same, unbound); the daylight's own (below); `water dripping` (eight frames: a drop falling from the vault into
    a puddle, faster as it goes, its splash; 16 x 184 at (8, 176), the floor point it strikes: stand it over `a puddle`, at the
    puddle's middle).
  - THE SHAFTS OF DAYLIGHT, three sizes (`SHAFTS`: small 0.4, middle 0.52, large 0.66 tiles across at the floor), each two pictures
    of LIGHT: `daylight on the floor, <size>` (the pool where it falls: three bands, their edges a checker of two-pixel squares;
    52 x 32 at (26, 16), 64 x 36 at (32, 18), 80 x 44 at (40, 22), at its middle) and `a shaft of daylight, <size>` (the column of
    lit air, four frames: leaning from the upper left (`SHAFT_LEAN`), streaked along its length, brightest low down and giving out
    in steps 300 up into the dark, motes of dust turning in it; anchored at the pool's middle on the floor). Their colours are dim
    (`SUN.pool`, `SUN.air`: the brightest 93 of 255) because they are ADDED to what is under them (`TOMB_ADDED`): drawn with
    `globalCompositeOperation = 'lighter'`, as the renderer draws a glow, so that they brighten the floor and what stands behind
    them and are never a solid shape.
  - every one of FLOOR 1'S OWN PIECES (art/floor1.ts `wardenPieces`, his yes already), under the same names and kinds, at the same
    sizes and anchors, with the same lights and the same fire, in look B's colours (their colours, not their shapes: `gradeColour`,
    each colour sorted into its family by the nearest of floor 1's own, the dressed stone, the old iron, the timber, the Warden's
    wine, bone, gold, and put at the same place in look B's; their stone a step lighter than the walls', so that a piece stands off
    them): the king's throne, the cressets, the horned knights, the rack of mauls, the king's coffer, sarcophagi, the king's tomb,
    urns, the skull jar, the bone box, candles, the statue's head, the fallen banner, the chain, dropped keys, the wall pieces, the
    king's runner, ledger stones, the crown in the floor, the drain, the slabs, the traps, the Warden's horn.

### His gate (`src/art/tomb_gate.ts`)

A GateArt, as floors 3 to 5's: everything but the boss's pillar, arch and drop is floor 1's own (`wardenGates()`: its doors of old
timber bound in iron, its plain gates with the king's crown over them, its levers and seals), in look B's colours. The town's
stairs stand in a plain gate's arch, as now.

- `pillar(true)`: A FLUTED PILLAR of the pale stone (a tone lifted, as the look had it), square, two flutes down each face, on a base
  (10), a capital band carved with leaves, to the way's spring at 46 (`TG_WAY`); its footprint the game's pillar (`PILLAR`). One
  picture for a gate either way, 40 x 76, anchored at its front corner on the floor.
- `arch(alongX, true, lit)`: strips from the outer edge of one pillar to the other: A ROUND-HEADED WAY (96 across, its crown at 86)
  under A RING OF VOUSSOIRS (12); the stone squared over it, a root down its left shoulder, moss; THE WARDEN'S BAND of iron riveted
  across under the cornice (100 to 108); THE CORNICE (108 to 116); THE GABLE, a hand's breadth thick, rising to 170, THE KING'S
  CROWN carved great in it (its middle at 138); SPIKES of his iron along its raking edges; HIS HORNS in black iron at its peak (to
  214); CHAINS sagging from rings on the voussoirs (54 out, 64 up) to THE GREAT LOCK hung over the keystone (84 to 100), the enemy's
  fire dull and low in its keyhole (FLAME[0] and [1], in embers, never in rings); or `lit` (the drop down behind the hero, the fight
  on) the keyhole ALIGHT, pink at its rim burning to gold, the iron round it catching it, and then it gives the enemy's light
  (FLAME[2], 26, 0.34). What is seen of its thickness: the head's underside where it turns toward the eye, the block's end over the
  far pillar, the gable's raking top going back.
- `portcullis(alongX, true, raise)`: THE DROP at the back of the way: square bars of black iron every twelve (`TG_BARS`, 18 to 102),
  each to a point, as his Lockdown's bars; straps across every 22, riveted; the game's raise 0 to `GATE_UP` drawn up 0 to 70
  (`tombLift`; `TG_LIFT` 70: up, its points peep under the way's head, a hero is 56). What is behind the gate's thickness is not
  drawn.
- THE DROP'S FALL, Movement 9 (`TOMB_GATE_DROP`, at 30 a second from the moment the fight begins): 60 60 56 60 60 54 60 58 52 60
  (held, juddering), 26 (the drop), 0 (the landing, frame 11, `TOMB_SLAM_AT`: the slam begins, the lock lights), 0 6 8 2 0 0 (a
  bounce, then down). `tombGateDropAt(frame)` gives `{ raise, slam, lit }`.
- THE SLAM, `tombGateSlam(alongX, f)`, f 0 to 15: chips of the pale stone and moss shaken off the cornice and the gable, falling
  before the gate, striking the floor with a hop and lying; the tomb's pale dust thrown off the floor both ways, rolling out low,
  thinning (no fire, no pink). 280 x 240, anchored at the middle of the gate's foot.

### The light and floor 1's darkness, for the main chat to place

Nothing of the light is painted into the place: as everywhere in the game the renderer lays its dark and cuts a hole where each
light burns (render.ts `light`, `spot(x, y, r, strength)`), and what gives light is drawn over it (`drawLights`, `drawGlow`).
`TOMB_LIGHTS` (art/tomb.ts) holds these numbers; `src/dev/preview_tomb_game.ts` lays them exactly so, with the game's own pools
round the hero (380 at 0.36, 165 at 1), the boss's own (56 at 0.7) and its vignette (0.62). In game pixels:

- THE DARK on floor 1, the brightest floor: `rgba(6, 8, 10, 0.5)` in place of `FAR_DARK` 0.88 (floor 4's look 0.76, floor 5's 0.8,
  the town 0.45): a cool dark, so the daylight reads as daylight.
- A SHAFT OF DAYLIGHT, where its pool lies: a hole at the pool's middle, by its size (small 52 at 0.88, middle 62 at 0.92, large
  74 at 0.96); a second, fainter hole up its column (50 up, 10 to the left, radius 44, 0.42), so the air reads; a green-gold glow at
  its foot (`#c8d078`, 30, 0.24, 4 up). Its two pictures added (`'lighter'`): the pool with the floor (after the floor tiles, before
  anything stands), the column stood at the depth of its foot less 0.7 (so that whatever stands in it, the hero too, is drawn over
  it and stays crisp). LOOK B'S MANY SMALL SHAFTS: one to every eight to twelve tiles of floor, in every room, mostly small and
  middle, a large one or two; and in his hall three or four, kept off his Lockdown's lanes as the main chat likes; a `fallen leaves
  and earth` tile under some of them (the crack it comes through).
- THE TOWN'S STAIRS: the town's daylight down the flight onto the first room's floor: a hole 0.6 of a tile into the room from the
  middle of the doorway, 6 up, radius 84, 0.95, its glow (`#d8dca0`, 40, 0.26); and `daylight on the floor, large` there, added, as
  the pool the flight throws.
- A CRESSET (floor 1's own, its fire honest orange, its glow on its picture): a hole 18 up from its anchor, 66, 0.9 (as render.ts
  lights a brazier).
- EVERY TILE OF WALL THAT STANDS: a low hole at the foot of its face under its tile's middle, 26 up, radius 34, 0.36, so the stone
  reads in the rooms' daylight.
- HIS GATE'S LOCK, alight: its light is on its arch's strip (the enemy's, FLAME[2], 26, 0.34).

### How to bring it in (the main chat; not done here)

1. THE SWITCHES: on with his yes to it in play: floor 1 (look 1) is the tomb while `TOMB` is on; its gates are `makeTombGateArt()`
   while `TOMB_GATE` is on.
2. THE FLOOR: every floor tile of floor 1 drawn with `floor(tx, ty)` in place of `cryptGround(1)`'s; the walls' shadows and the
   floor's edges as now. Over it: THE ROOTS out from the feet of the walls that stand (a run of `a root along ...` tiles, a bend
   or two, closed by `a root's end ...`), two or three runs a room, more in his hall but out of the middle; `a puddle` here and
   there with `water dripping` stood over it; `moss` on a tile in ten; `fallen leaves and earth` under some shafts, `fallen leaves`
   about; THE GRAVE SLABS in pairs, most in the rooms the game makes the king's court; THE KING'S RUNNER (floor 1's own) from his
   gate to his throne, as now.
3. THE WALLS: every wall face drawn with `face(alongX, tx, ty, f)` (along x its face at y + 1, along y at x + 1); his hall's ring of
   wall with `hall.faceLeft[tx mod 8][f]` / `hall.faceRight[ty mod 8][f]`. The walls the game leaves out (render/walls.ts,
   `wallsAway`) stay out. Floor 1's own wall pieces stand in them as now (in look B's colours).
4. THE WAYS BETWEEN THE ROOMS: at every doorway left open (no door in it), stand `archway(spot.alongX)`'s strips as render.ts
   `standDoors` stands a gate's arch: `strips(list, 0, 0)` (each at `at(q.t, 0)` from the doorway's first tile, depth
   `x + y + STRIP / 64`), whether the wall it is in stands or is left out (it stands alone then, as a gate does). Where that wall
   stands, the faces of its tile before the doorway and its tile after (`a - 1`, `a + 3`) are not drawn: the archway covers them.
5. HIS GATE: with `TOMB_GATE` on, floor 1's gates are `makeTombGateArt()` (main.ts, where `lookGates(1)` is chosen now), stood by
   render.ts `standDoors` as any boss gate. For its drop, as the yard's: drive the boss gate's raise from
   `tombGateDropAt((game.time - d.fell) * 30)` in place of `d.open * GATE_UP` while it falls, light the lock from `TOMB_SLAM_AT`,
   stand `tombGateSlam(s.alongX, f)` at `at(1.5, PILLAR / 32)` (depth x + y + 0.3) for its 16 frames, a small shake of 2 for 4
   frames. Its gable and horns rise to 214 over walls 80 high that fade: it stands whole over the dark.
6. THE WAY IN FROM THE TOWN: where render.ts draws floor 1's stairs up now (`dress.stairsUp`, the film `up:1:x|y`), `stairsUp(alongX)`
   in place of `floorStairsUp(CRYPT_FLOORS[0], alongX)`: the same size, anchor and shape, drawn as now with the floor and anchored
   as the arch's strips are; its arch and pillars the plain gate's (`makeTombGateArt()`'s, floor 1's own in look B's colours), no
   portcullis, as now. Its light, above.
7. THE STAIRWELL: `lookWays(1).stair[way]` → `stairwell(way)`; the film `stair:1:...` → `stairwellOpens(way, [x, y])` (or
   `stairwellOpens(TOMB_THEME, way, at)`), in place of floor 1's `CRYPT_FLOORS[0]`: where crypt_ways.ts puts it, opening when he
   dies, its shape and timing unchanged.
8. THE PIECES: with `TOMB` on, floor 1's pieces (`lookPieces(1)`, art/floors.ts) are `pieces` (the same names, look B's colours),
   laid as now; and the place's own: `a chained tomb` two to four in his hall (at its back, by the throne and the cressets) and in the
   room the game makes the effigy hall, `a tomb of the court` here and there in the others; the shafts as above.
9. THE LIGHT, as above; the shafts' pictures added.

### What differs from B as he saw it (so he is not surprised)

- The light is the game's: its dark with holes and soft glows, not the painted bands of the pictures; a little darker away from the
  shafts and the hero. The shafts' pools and columns are pictures of light added over it, so they keep look B's bands and steps.
- The walls the game leaves out (any wall that would hide floor behind it) are not drawn: the walls between the rooms, and those
  toward the eye. Only the rooms' far walls stand, so the banners, tombs, cells and roots are on the far walls; THE ARCHWAYS stand
  where the walls between the rooms would be, on their own, as a gate does.
- The roots across the floor are tiles of their own, a tile at a time, so they run along the tiles' lines and bend a quarter turn at
  a time, not in free curves; the main chat decides which, if any, block.
- The stone is a step darker in its own colours than in B's pictures (under the darkest word, his Colour 4), and the daylight brings
  it up where it falls.

### Pictures

- `pictures/game_ready.png` (1200 x 2396): floor 1's rooms built from these pieces the game's way, the knight in the effigy hall in
  a shaft of light, beside B as he saw it; where you come down from the town, twice as big (the stairs in the stair hall's wall, the
  daylight down them, roots through the walls); one phone screen (1014 x 468) at the game's own size, the knight in a shaft of
  daylight among the chained tombs; and the gate close with the knight, twice as big, its bars up as he comes to it and then down
  behind him with the lock alight.

```
PREVIEW_TIMEOUT=400000 node tools/preview.mjs src/dev/preview_tomb_game.ts docs/mockups/floor1_look/pictures/game_ready.png 1200 2396 "sheet"
  ("run" at 1200 x 840, "close" at 1200 x 664, "phone" at 1014 x 468 and "gate" at 1120 x 600 give those alone)
```

### Checks

`tests/tomb.test.ts`: off, and nothing of the game imports either file; every piece the brief asks for painted (and every one of
floor 1's own); every picture at its size and anchored where the game lays it (the walls as high as `WALL_LOOK.tall` and fading as
far down as its `fade`, every column of a face 80 high but the empty joint, column by column the game's own floor-1 walls' top and
foot; the archway's strips a quarter of a tile from t -1; the pieces' anchors; every picture of the place's own in whole game
pixels); crisp (every pixel whole or empty but a wall's fading top, in the game's own four steps; a floor tile covering its whole
diamond; no pixel alone; nothing cut off); nothing cyan; no pink anywhere in the place (only his gate's lock and floor 1's own
fire); the daylight green-gold; the floors, tiles, walls, archways and tombs darker than the darkest word, the dark lighter than
the deeper floors'; light from the upper left and the pilasters every two tiles, the bays varying; the roots round and lit,
straight, bending and ending, meeting at every edge; the puddle's rings and the drip falling faster, its splash; the daylight's
pools in three bands, its columns brightest low and their motes moving, all drawn added and dim; floor 1's own pieces with their
shapes, anchors, lights and fire as they were, in look B's colours; the town's stairs floorStairsUp's size, anchor and shape pixel
for pixel, brighter up the flight; the stairwell makeStairwell's shape, its opening the same moment; the archway open with a hero's
room, the same both ways and lit along x; and the gate: floor 1's own for all but the boss's, crisp, nothing cyan, pink only in the
lock, the way exactly three tiles, round-headed, the gable, the crown and his horns, the same shape both ways and lit along x, the
lock in embers and alight giving the enemy's light only alight, the drop from up (its points at 70) down step by step to the
floor, the drop's timing and the slam's falling chips and thinning dust. With them `tests/floor1.test.ts`,
`tests/floor1_look.test.ts`, `tests/gates.test.ts`, `tests/crypt.test.ts`, `tests/stairwell_open.test.ts` and
`tests/bosses.test.ts` pass, and `tsc` is clean.
