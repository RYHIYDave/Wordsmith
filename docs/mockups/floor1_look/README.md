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
