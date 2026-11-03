# FLOOR 2, THE HEADSMAN'S FLOOR: ITS HALLS, THE CONDEMNED'S ROAD (PICTURES FIRST; NOT IN THE GAME)

Branch `art/floor2-look`, from `high-city` at f6688d9. The three looks for him to pick from: `src/dev/floor2_look_paint.ts`
(the painting) and `src/dev/preview_floor2_look.ts` (the page that lays the pictures out), checked by
`tests/floor2_look.test.ts`. Nothing of the game imports any of it, and nothing of the game is changed: no switch is needed
until his pick is made game-ready. His yard (`src/art/yard.ts`, behind YARD, on) and its gate (`src/art/yard_gate.ts`) are drawn
in the pictures from their own game pictures, unchanged.

## His words

- 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and 2 are
  probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”.
- 2 Nov 2026, 10:13: “We may as well redo the first level as well.  Why not, we just did every other level right?”
- Asked whether floor 2's halls too (his yard is new, the halls still the Crypt), his pick: “Yes, redo the halls (Recommended)”,
  offered as: the condemned's road: holding cells, the long walk and a last-rites chapel, torchlit, leading out into his yard at
  night.

## What is drawn

Floor 2 laid as the main chat lays it, OPEN (game/dungeon.ts, `planOpen`, “the great hall”: the antechamber he comes in by, west
of a grid of great rooms whose walls are knocked through, and his yard grown off the last of them toward +y, come into straight
by its far wall along x; game/yard.ts lays the yard). The rooms are drawn smaller than the game's (as floors 1, 3, 4 and 5's
looks were) so the whole road fits one picture:

- **THE GAOLER'S ROOM** (top left), where he comes in: in its left wall, in the game's gate arch (art/gates.ts `ARCH`: 40 to
  its spring, 42 its rise), **THE STAIR DOWN FROM FLOOR 1**, a flight of the bare stone going up away from the room under a
  vault, and at its head, faint, floor 1's own light from the Warden's hall (its green-gold daylight). (The waypoint the game
  sets beside where he comes in is not drawn: it is the game's own.)
- A short way east into **THE HOLDING CELLS**: CELL DOORS along its back wall, one cell standing open (straw on its floor, a chain
  on its wall), straw in drifts before them, A GUTTER along the foot of the cells' wall.
- Through **THE BREACH** (the rock between two of the open floor's rooms knocked out, a wall's end left standing at each side)
  into **THE CHAPEL OF LAST RITES**: A PLAIN ALTAR of the bare stone on a step against its back wall, a niche behind it, its
  candles; TWO BENCHES before it, an aisle between.
- From the chapel's mouth **THE LONG WALK**, straight, nine tiles, a gutter down its middle, his hood in the floor (floor 2's
  own) where it begins, a coil of rope by its end; and at its end **HIS GATE** in **THE PRISON'S HIGH WALL** (art/yard_gate.ts,
  his yes, its pillars, its arch with his mark in embers, its portcullis drawn up, unchanged; the yard's torches either side), and
  through it **HIS YARD AT NIGHT** (art/yard.ts, unchanged, laid as game/yard.ts lays it for a doorway at the yard's end: the
  gallows against the far wall, the scaffold draped with its block, the bell, the stocks, two braziers, the beaten earth before
  the doorway, the puddles), in its own moonlit dark and torchlight. Boss halls flat; his yard is his hall and stays as it is.
  (The Headsman waits at the foot of his scaffold's steps, just out of the picture: not drawn.)

- **The walls**: rough-dressed stone in courses on a plinth of big blocks, 80 high, their tops fading into the dark in the game's
  four steps; along x lit, along y in shade; the walls toward the eye cut low with a coping of blocks, as the game leaves them.
  In their bays, look by look: CELL DOORS (planks, two iron straps from the hinges, a lock plate and ring, a grille or a hatch),
  an OPEN CELL, HIGH BARRED WINDOWS on the night, TALLY MARKS, THE CONDEMNED'S MARKS, the chapel's NICHE; floor 2's own torch (its
  caged torch, its fire, its light) in the bays marked for it, soot over it.
- **The floor**: worn flags in a running bond (rows half a tile wide, each row its own length of flag), the edges toward the light
  lit, a few cracked, corners chipped; worn pale down the walk; THE GUTTERS; STRAW in drifts and straws kicked about.
- **The floor's own pieces** (art/floor2.ts, his yes already), brought into each look's light, their colours and not their
  shapes (`graded`: each colour sorted into its family by the nearest of floor 2's own, the stone, the iron, the timber, his
  hood's red, bone, rope, sawdust, and put at the same place in that family in the look's own): the headsman's strongbox, crate,
  pail, dropped lantern, sawdust barrel, basket, kicked-over stool, the stocks, coil of rope; on the walls hoods on pegs, axe on
  hooks, chain from the dark, tools of the trade (B), the torch; in the floor the hood in the floor and a trapdoor.

## The three looks

Each a different take within his pick, each its own light:

- **A, WHITEWASHED CELLS** (`a_whitewashed_cells.png`, `a_phone.png`): old limewash gone grey over a brown-grey stone, flaked off
  in patches, grime up from the floor; wooden cell doors with grilles under flat lintels; TALLY MARKS scratched in fives by the
  doors and in bays of their own; the most straw; the most torches, warm. The palest and warmest.
- **B, THE LONG WALK** (`b_the_long_walk.png`, `b_phone.png`): a dark slate; heavy OAK DOORS STUDDED WITH IRON under round heads,
  all down the walk and along the cells; the torches few, deep shade between their pools; the plain altar with A SINGLE CANDLE;
  near the walk's end A BARRED WINDOW on the night, the moon through it striped by its bars on the floor. The darkest.
- **C, COLD NIGHT THROUGH THE SLITS** (`c_cold_night_through_the_slits.png`, `c_phone.png`): a cold blue-grey stone; HIGH BARRED
  SLITS in the walls, the moon full in them, falling in pale shafts onto the floor, each pool striped by its bar; THE CONDEMNED'S
  MARKS cut round the doors and in bays of their own (strokes, ticks, boxes and forks, each his own: never letters, his rule, no
  carved words); A CHAPLAIN'S LECTERN by the altar, a book open on it (its lines grey rules, no letters), a tall candle; the
  torches few. The coldest.

In all three: the torches an honest warm orange; nothing cyan but the knight's own (the moonlight a grey-blue, never cyan);
nothing pink but the Headsman's mark on his gate, in embers; grim and quiet, never gory (no stains, nothing hurt). It looks nothing
like floor 1's sunlit tomb of roots (no daylight, no roots, no tombs), floor 3's black iron prison over fire (stone and timber, no
grates, no fire below, no iron fronts) or the yard itself (indoors, flags not cobbles, warm or cold stone against the yard's
indigo). Its lit places come to 52 (A), 45 (B) and 48 (C) of 255: a step darker than floor 1's tomb (69 to 75), about floor 5's
(44) and under floor 4's (55), the yard's dark weighing in each.

`floor2_look_sheet.png` has the three, each with its phone screen, labelled A, B, C with a line each, and the way out into his yard
close beside the knight in each (he stands just through the gate; the long walk's end behind it), twice as big.

The art chat's lean: **A, whitewashed cells**. It reads best on a phone (the pale walls and warm torchlight make the floor and the
knight plainest), it is the most unlike the yard's indigo night, so stepping through his gate into the moonlit yard is a real
change, and its tally marks and straw tell the condemned's road without a word. B is the most dramatic but the darkest, its
studded doors hard to see at a phone's size; C is the most striking (the moon in shafts) but its cold blue sits nearest the yard's
night.

## How the pictures are made

```
node tools/preview.mjs src/dev/preview_floor2_look.ts docs/mockups/floor2_look/pictures/a_whitewashed_cells.png 1200 840 "overview:whitewash"
node tools/preview.mjs src/dev/preview_floor2_look.ts docs/mockups/floor2_look/pictures/a_phone.png 1014 468 "phone:whitewash"
  (and "overview:walk" b_the_long_walk.png, "phone:walk" b_phone.png, "overview:slits" c_cold_night_through_the_slits.png, "phone:slits" c_phone.png)
PREVIEW_TIMEOUT=600000 node tools/preview.mjs src/dev/preview_floor2_look.ts docs/mockups/floor2_look/pictures/floor2_look_sheet.png 1200 5029 "sheet"
  ("gate:<look>" at 400 x 600 shows the way out close on its own; the sheet's height must be given whole, or the page is not
  painted below the first screen)
```

The whole run is 600 x 420 game pixels at two picture pixels each (the game's own size); a phone screen is 507 x 234 game pixels
with the camera on the knight on the long walk (the same spot in all three, to compare), painted on its own. The place is painted
in picture pixels on the game's grid (art/isokit.ts), WITH A DEPTH FOR EVERY PIXEL (x + y of the world point seen there), the floor
a step back as the game draws the floor first, so that walls, the altar, the benches, the gate and figures stand in front of one
another as they do in the world; the round and sloping things (the stair up, the altar, the benches, the lectern) are found by
following each pixel's line of sight into them (`march`). THE LIGHT IS PAINTED IN here: the torches', candles' and the moon's in
three bands, their edges a checker of two-pixel squares (no soft gradient), and where no light falls a step toward the dark; the
air of each moon shaft laid over the floor and what stands low in it (`paintBeams`). The pieces and figures are the game's own
sprites, drawn at their size and depth; the yard's and its gate's in the yard's own night (its dark as the yard's picture has it,
with a hole round each of its torches and braziers, in bands); the torches' and braziers' glow drawn over, as the renderer does.

## What making his pick game-ready will need

As floors 1, 3, 4 and 5 were (docs/mockups/floor1_look/README.md on `art/floor1-look`, "Made game-ready"), in files of their own
behind switches that are off, nothing of the game importing them until the main chat puts them in:

- **The floor**: `floor(tx, ty)`, the look's flags in their running bond, worn pale down the walk; the GUTTER as floor tiles
  (along x, along y, its ends; it runs on into the yard's own gutter); STRAW as tiles (drifts, and the loose straws).
- **Faces**: the prison's face a tile at a time, 80 high and fading as the game's; its bays: the CELL DOOR (along x and along y),
  the OPEN CELL, the WINDOW (B) or SLIT (C) on the night, TALLY MARKS (A) or THE CONDEMNED'S MARKS (C), the chapel's NICHE, soot over a
  torch; `face(alongX, tx, ty, f)` choosing them so cells stand along the rooms' back walls and the walk's wall, and nothing the same
  on two tiles side by side. The ways between rooms round-headed, as a `GateArt`'s plain gate; the breach's wall-ends as wall.
- **The stair down from floor 1**: in the first room's back wall, in a plain gate's arch, where the game sets the waypoint now
  (that stays beside it): its size and anchor a gate arch's, floor 1's light faint at its head. A new piece: the game has no way in
  drawn on floor 2 today; the main chat says where it stands.
- **The chapel**: the altar on its step (an obstacle, two tiles by one, its candles and their light), the benches (obstacles, along
  x and along y), and in C the lectern and its candle; the main chat lays the chapel in one of the grid's rooms, the last before the
  yard if it can.
- **The light**: the renderer's (render.ts: its dark with a hole where each light burns). Here the place's own colours are painted
  a little over the darkest word to show it as it will look lit; made ready, they go back under it and the light comes from the
  renderer: floor 2's dark a little lighter than the Crypt's now (A) or as it is (B), the torches and candles as fire, and for B
  and C THE MOON as a light of its own kind (a cold pool under each window or slit, its bars' stripes and the shaft's air as pictures
  of light drawn added, as floor 1's daylight was); a little of the yard's moon in at the gate.
- **The pieces**: floor 2's own (`headsmanPieces`), recoloured into the look he picks (their colours, not their shapes).
- **His yard and his gate**: nothing. They stay as they are; the walk's gutter and stone simply meet them.

### What differs from the game as it would be (so he is not surprised)

- The rooms are smaller than the game's open grid lays them (12 to 15 tiles by 10 to 13), so the whole road fits a picture; the
  game's floor has many more rooms of cells between the stair and the chapel.
- The walls the game leaves out (any wall that would hide floor behind it) are standing in these pictures, as on floors 1, 3, 4 and
  5's; in the game only the rooms' back walls stand, so the cells, windows and marks are on the far walls. His yard's far wall to the
  right of the gate, which the game leaves out because it would hide the walk, stands here.
- The light will be the game's: a little darker away from the torches and the hero, the moon a soft glow.
- The sky over his yard's walls is not drawn: the game draws it only while the hero is in the yard.

## Checks

`tests/floor2_look.test.ts`, 6 of 6: nothing of the game imports the dev pages; every picture there at the size asked for (1200 x
840, 1014 x 468, the sheet 1200 wide and 5029 high); in each picture nothing cyan but round the knight, and nothing pink but the
enemy's own (the mark on his gate) or the knight's own deep red, and in the sheet the cyan in no more patches than it has knights;
on each phone screen the floor round the knight lit out of the dark and the knight standing out of it, darker and lighter both;
each look's lit places between floor 5's (44) and floor 1's (66); and each look its own (A the warmest, C the coldest, B the
darkest). `tsc` is clean.

## The prison's grounds, made game-ready

### His words

- 2 Nov 2026: asked whether to redo floor 2's halls, “Yes, redo the halls (Recommended)” (the condemned's road: holding cells, the
  long walk and a last-rites chapel, torchlit, leading out into his yard at night).
- Shown the three looks of indoor halls above, he asked: “I was looking for this level to be pretty open, is this just for the
  beginning of the level to get you to the yard then it opens up, or is this how the whole level is and only his boss area is
  outside?” Told the game lays floor 2 open (a grid of great rooms, walls knocked through), only his yard outside. Asked whether
  more of it should be outside, his pick: “Mostly outside”, offered as: the prison's grounds at night: cell blocks with open
  courtyards between, crossing under the sky to his yard.
- His yard's own words, 28 Oct (docs/mockups/headsman_yard/README.md): “And I think I want the headman’s yard to be outdoors.  Like
  you go out to a big open area like a prison yard but there’s the gallows and the chopping block where the headsman’s boss area
  is at.”; its light, “B, night (Recommended)” (moon and stars, torches and braziers).

So the three looks of indoor halls are set aside: floor 2 is now the prison's grounds at night, built on his yard's own pieces
(his already), made ready for the game in one go as floors 1, 3, 4 and 5 were ("Made game-ready" in their READMEs), in a file of
its own behind a switch that is off; nothing of the game imports it (a test proves it) and no game file is changed. His yard
(`src/art/yard.ts`) and its gate (`src/art/yard_gate.ts`) are not touched.

- `src/art/grounds.ts`, `makeGroundsArt()`, behind `GROUNDS = { on: false }` (the names were free: nothing else exports them);
- checked by `tests/grounds.test.ts`; laid and lit the game's way by `src/dev/preview_grounds_game.ts`.

Every picture is in the game's measures (picture pixels, two to a game pixel, `density` 2), anchored as the yard's pieces are, in
the yard's night colours (its stone, cobbles, earth, timber, iron, slate; seams its deep indigo), under the darkest word (his
Colour 4, at the 99th of their pixels); the light is the renderer's (below). Nothing glows cyan; nothing is pink but the
Headsman's own mark on his gate and floor 2's own where it was.

### The pieces and their anchors

- `floor(tx, ty)`: THE COURTYARDS' COBBLES, the yard's own pictures (the same sprites). 64 x 32 at the tile's top corner.
- `walk(tx, ty)`: THE LONG WALK, the condemned's road: big flags in rows half a tile wide, each its own length, worn pale in their
  middles, a crack or a chipped corner here and there, a step paler than the cobbles so the road reads under the moon; laid on the
  world (sixteen pictures, repeating every four tiles), so any run of walk tiles meets itself. 64 x 32 at the top corner.
- `tiles` (floor tiles over the cobbles, 64 x 32 at the top corner): the grounds' own `mud` and `churned mud` (wet ruts, the moon
  in the wettest), `straw` (straws lying every which way) and `a drift of straw`, `weeds along x` / `weeds along y` (tufts along
  the tile's far edge, where a wall's foot is: along x at the tile's low y edge, along y at its low x edge); and the yard's own, the
  same pictures: `a puddle`, `a long puddle`, `a little puddle`, `yard sawdust`, `beaten earth`, `gutter along x`, `gutter along y`.
  The cobbles under the grounds' own tiles are the yard's stones exactly, so they meet the cobbles round them.
- `block.faceLeft[k]` / `block.faceRight[k]` (k by `BLOCK_KINDS`): THE CELL BLOCKS a tile at a time, as the game lays walls (along
  x turned to screen-left and lit, along y to screen-right in shade): rough-dressed stone in courses on a plinth, 120 high to a
  cornice (`BLOCK_H`), a string course between two storeys, and over it A SLATE ROOF rising a tile back to its ridge (`ROOF`, 28
  more), moss on it here and there. The kinds: `cells` (a barred cell window on each storey, dark within), `lit above` / `lit
  below` (one of them lit within, an honest dim orange, its glow on the picture's `lights`), `door` (an iron-studded oak door
  through the plinth under a big lintel, three straps, a ring; a window over it), `torch` (a bay for the yard's torch, soot
  streaked up from where its fire burns, 92 up), `tallies` (scratched in fives low on the face), `corner, low end` / `corner,
  high end` (quoins at the run's end toward lower x or y / higher). 64 x 182, anchored at the floor point of the tile's top corner,
  its face down to the floor line as the yard's wall's. `block.face(alongX, tx, ty, end?)` picks the kind so that nothing is the
  same on two tiles side by side (`end`: 'low' or 'high' gives the corner at a run's two ends).
- `wall.faceLeft` / `wall.faceRight`: THE PRISON'S HIGH OUTER WALL, the yard's own (150 high, its wall-walk and battlements).
- `tower`: A WATCHTOWER, the yard's; `beyond`: THE NIGHT SKY over the walls (the moon, the stars, the clouds, the keep and its
  cell block, the hills), the yard's backdrop; both anchored at a courtyard's far corner as render/yard.ts draws them.
- `gateway(alongX, kind)`: THE WAYS BETWEEN COURTYARDS through a cell block, as strips (art/gates.ts `Flat`, eight wide each, like
  a gate's arch): 20 strips, u -32 to 128 (`t` -1 to 3.75 from the doorway's first tile): the tile before the doorway, its three
  tiles, the tile after. `open` and `barred`: A GATEHOUSE standing proud of the block, its quoins, a round arch three tiles across
  (`GATEWAY`: it springs at 64, its crown 102) under a ring of 13 wedge stones, an arrow slit over it, a coping at 151 and merlons
  to 180; `barred` with its portcullis drawn up into the arch's head (its bars' spikes at 92, two cross bars, the slot over it).
  `gaol`: THE GAOLER'S DOOR, his house's gable end (to 186 at its peak, its coping), the way three tiles across under a round arch
  (`GAOL_DOOR`: springing at 54, its crown 82), HIS TWO OAK LEAVES swung back flat against the face either side (boards, three iron
  straps studded), HIS LANTERN on its bracket over the way (a candle burning in it, its glow on the strip it hangs in), a little lit
  window of his quarters either side. The way is open across the doorway (a test holds it); the same shape both ways, lit along x.
- `chapel(alongX)`: THE LAST-RITES CHAPEL'S FRONT, three tiles of a block's face as one picture: a finer, paler stone, buttressed at
  its ends, a gable to 186 and a bell-cote over it to 212 (its bell), a round window in the gable, two lancets faintly lit, and a
  round-headed doorway lit within (the altar's dark shape at the back, its two candles); its warm glow on its `lights`. Anchored at
  the floor point under its middle on the face's line (along x `(a + 1.5, row + 1)`, along y `(row + 1, a + 1.5)`), 112 x 316
  (along y the same picture turned, a step into the shade). Nobody walks into it: its tiles stay wall.
- `wayIn(alongX)`: WHERE YOU ARRIVE, THE STAIR DOWN FROM FLOOR 1 (floor 1's stairwell comes down here): three tiles of the
  gaoler's room's wall as one picture (80 high, its top fading as the game's walls in their four steps), A ROUND ARCH two tiles
  across in its middle (`WAY_IN`: it springs at 34, its crown 58, its ring standing whole over the fading top), and through it A
  FLIGHT of ten steps of the bare stone going up away from the room (each 0.27 of a tile deep and 8 up), the passage's wall going
  up with it, the higher steps catching FLOOR 1'S LIGHT (the tomb's green-gold, faint), its glow on the picture. Anchored as the
  chapel is; 112 x 152. Nobody walks into it: it is the floor's start.
- `gaol.floor(tx, ty)`, `gaol.faceLeft[k]` / `gaol.faceRight[k]` (k by `GAOL_KINDS`), `gaol.face(alongX, tx, ty)`: THE GAOLER'S
  ROOM, inside: square worn flags; its walls the game's (80 high, the top 24 fading in four steps, the joint between two tiles'
  faces left empty, as floor 1's tomb's), rough stone, and in their bays `bare`, `keys` (a board of pegs, three rings of keys),
  `hatch` (a small barred hatch on the night, the moon's grey on its sill), `tallies`. 64 x 112 at the tile's top corner.
- `pieces`: `the well` (a drum of rough stones, the coping, dark water with the moon in it, two posts and a beam, the windlass with
  its rope wound and its crank, the bucket on the rim; an obstacle, a tile; 84 x 136 at (42, 112), the floor point under its
  middle), `the tumbril, along x` / `along y` (the condemned's cart: a plank bed on two great spoked wheels, slatted sides, its
  shafts down on the cobbles; an obstacle three tiles by one (`GROUNDS_FOOTPRINTS`); 200 x 120, at the floor point under its
  middle); EVERY ONE OF FLOOR 2'S OWN PIECES (art/floor2.ts `headsmanPieces`, his yes already) under the same names and kinds, at
  the same sizes and anchors, with the same lights and fire, in the night's colours (their colours, not their shapes: `gradeColour`,
  each colour sorted into its family by the nearest of floor 2's own, its stone, iron, timber, his hood's red, bone, rope, straw,
  and put at the same place in the yard's night; their stone a step lighter than the walls', so a piece stands off them); and the
  yard's own `the yard's torch` (four frames, its light) and `a wide puddle`, `a great puddle`.

### The light and floor 2's darkness, for the main chat to place

Nothing of the light is painted into the place: as everywhere in the game the renderer lays its dark and cuts a hole where each
light burns (render.ts `light`, `spot(x, y, r, strength)`), and what gives light is drawn over it (`drawLights`).
`GROUNDS_LIGHTS` (art/grounds.ts) holds these numbers; `src/dev/preview_grounds_game.ts` lays them exactly so, with the game's own
pools round the hero (380 at 0.36, 165 at 1). In game pixels:

- THE DARK under the open sky, in every courtyard, its ways and the walk: THE YARD'S (render/yard.ts): `rgba(6, 4, 14, 0.42)`
  (`YARD_DARK`), the sky's own light taking 0.55 of it off over what lies above the far walls (`YARD_SKY_LIFT`), the yard's
  vignette 0.4 (`YARD_VIGNETTE`).
- THE GAOLER'S ROOM: indoors, the Crypt's dark (`FAR_DARK` 0.88) and the game's own vignette; no sky.
- THE YARD'S TORCH (on a block's `torch` face, at the foot of its middle: along x `(tx + 0.5, ty + 1)`, along y `(tx + 1, ty + 0.5)`;
  and on the outer wall every six to eight tiles): a hole 36 up from the face's foot under it, 48, 0.85, flickering, as render/yard.ts
  `torchLight`; its fire's glow on its picture.
- A BRAZIER (floor 2's own `brazier of irons`, two or three to a courtyard, two before the chapel, one in the gaoler's room): as
  render.ts lights one, 14 up, 62, 0.9.
- THE GAOLER'S LANTERN over his door: a hole at it, 52 up from the doorway's middle, 54, 0.85; and the warm room through the door:
  a hole a tile and a half inside the doorway, 50, 0.6. Its glow is on the gateway's strip.
- THE CHAPEL'S LIT DOORWAY: a hole on the floor 0.6 of a tile out from its face's middle, 6 up, 56, 0.75; its glow on its picture.
- A LIT CELL WINDOW: its glow only (10, 0.3, on its face's `lights`), no hole.
- THE STAIR DOWN FROM FLOOR 1: a hole a tile into the room from its arch's middle, 8 up, 46, 0.55; floor 1's green-gold glow on
  its picture.

### What the main chat must lay (the layout is the main chat's)

Floor 2 laid by planOpen as now, a grid of great rooms, but each room A COURTYARD and the rock between them A CELL BLOCK standing
whole, joined by gateways instead of knocked through:

1. THE COURTYARDS: the grid's great rooms, a little bigger than now so each is open ground: 14 to 18 tiles by 12 to 15 (now 12 to
   15 by 10 to 13), three or four across and two or three down. The floor `floor(tx, ty)`, the walk and the tiles over it (step 6).
2. THE CELL BLOCKS between them: the gap between two neighbours SIX TILES (`OPEN_HALL.gap` 3 → 6), left standing along the whole
   side the two share (no breach), so that a block's face (60 game pixels and its roof) never hides the courtyard behind it: the
   game's own rule (render/walls.ts `wallsAway`, no wall stands over floor) then keeps every block face turned to a courtyard, and
   leaves out every side toward the eye, as on every floor. Every wall face that stands toward a courtyard is a block face,
   `block.face(alongX, tx, ty)`, with `'low'` / `'high'` at the two ends of each run (beside a gateway, at a corner).
3. THE GATEWAYS: through each block between two neighbours on the walk (and most of the others: `OPEN_HALL.wall` of them left
   without, a block to go round), A WAY THREE TILES WIDE straight through its six tiles near the middle of the side they share. At
   its mouth on the side where the block is the courtyard's back wall, `gateway(alongX, 'open')` (or `'barred'`, one in three)
   stood as render.ts `standDoors` stands a gate's arch: `strips(list, 0, 0)`, each strip at `at(q.t, 0)` from the doorway's
   first tile on the face's line, depth `x + y + STRIP / 64`; the faces of the tiles before and after the doorway (`a - 1`,
   `a + 3`) not drawn, the gateway covers them. Its other mouth is toward the eye: nothing is drawn there, as now.
4. THE OUTER WALL: the grid's outside edges (walls with no courtyard behind them) are the prison's high outer wall,
   `wall.faceLeft` / `wall.faceRight` (the yard's own), with the yard's gutter along its foot; a watchtower (`tower`) at the grid's
   far corner, drawn with the sky.
5. WHERE YOU ARRIVE, THE GAOLER'S ROOM: the antechamber he comes in by, small (six by six), INDOORS: `gaol.floor`, its walls
   `gaol.face`, the Crypt's dark, a brazier of irons in it. In its back wall, three tiles that stand as `placeInBackWall`
   (game/ways.ts) chooses the cave's, nothing standing on the two rows before it: `wayIn(alongX)` stood at their anchor (along x
   the floor point `(a + 1.5, row + 1)`, along y `(row + 1, a + 1.5)`), sorted at the face's line, those three faces not drawn;
   he comes in a tile and a half in front of it, the waypoint where the game sets it now (its tiles stay wall). ITS WAY OUT: a
   passage three wide and six long through THE GAOLER'S HOUSE (a block like the others: the antechamber six tiles from the grid,
   `first.w + 6` in planOpen) into the first courtyard; at its mouth in that courtyard's back wall (along y: the antechamber is west
   of the grid), `gateway(false, 'gaol')`, stood as the gateways are: the step from inside to out under the sky.
6. THE LONG WALK: `walk(tx, ty)` two tiles wide along the main path, from the gaoler's door through each gateway on the walk to the
   way down to his yard, in straight runs turning at a courtyard's middle. Over the cobbles elsewhere: `weeds along x` / `along y`
   on the floor row at the foot of every face that stands (every other tile or so), `straw` and `a drift of straw` by the gaoler's
   door and the block doors, `mud`, `churned mud` and the yard's puddles a tile in ten, `beaten earth` before the gateways,
   `a wide puddle` / `a great puddle` lying here and there.
7. THE LAST-RITES CHAPEL: in a back wall of the last courtyard of the walk (the one his yard grows off), three tiles of block face a
   little way from its gateway: `chapel(alongX)` stood as `wayIn` is, those faces not drawn, its tiles wall; two braziers before
   it.
8. THE PIECES: with `GROUNDS` on, floor 2's pieces (`lookPieces(2)`) are `pieces` (the same names, the night's colours), laid as now;
   and the grounds' own: `the well` one in each courtyard or two, `the tumbril` one or two on the floor (three tiles by one, along x
   or along y), braziers two or three to a courtyard, the yard's torch on every block face of the `torch` kind and along the outer
   wall.
9. HIS YARD AT THE END: unchanged, grown off the last courtyard toward +y by a short way down between two blocks (its side wall a
   block face), as game/yard.ts lays it now, its own gate (`YARD_GATE`, art/yard_gate.ts) in its doorway, its own torches either side.
10. THE SKY, as the yard's (render/yard.ts `back`, `shows`, `skyLift`): while the hero is in a courtyard or one of its gateways, the
   screen above the line of that courtyard's two far walls' tops is the sky (`beyond`, `tower`, anchored at the courtyard's far
   corner, clipped above those walls), and what lies behind them is not drawn there but for a few tiles through its gateways and
   the gaoler's door; the dark is the yard's with the sky's lift. In the gaoler's room, no sky.

### How to bring it in (the main chat; not done here)

1. THE SWITCH: on with his yes to it in play: floor 2 is the grounds while `GROUNDS` is on (YARD and YARD_GATE as they are).
2. THE LAYOUT: as above (planOpen with courtyards, six-deep blocks, gateways, the gaoler's room and its house, the chapel).
3. THE FLOOR: every floor tile of floor 2 drawn with `floor(tx, ty)`, the gaoler's room with `gaol.floor(tx, ty)`, the walk with
   `walk(tx, ty)`, the tiles over them as above (his yard's own as render/yard.ts lays them now).
4. THE WALLS: every face that stands drawn with `block.face(...)`, the outer wall with `wall.faceLeft` / `faceRight`, the gaoler's
   room with `gaol.face(...)`; the faces 182 picture pixels high (the roof's ridge 148 up), the outer wall's 176 (its merlons):
   for `wallsAway`, the blocks are six deep, so nothing need change in it.
5. THE WAYS: `gateway(...)` strips as a gate's arch, as above; the waypoint and the arrival with `wayIn(...)`; the chapel.
6. THE PIECES and THE LIGHTS, as above; THE SKY as above.

### What differs from the picture (so he is not surprised)

- The light will be the game's: its dark with soft holes, a little darker away from the torches and the hero.
- Between a block's roof and the courtyard behind it lies the game's own dark (the block's other five tiles, as every wall's depth
  is today): a dark wedge behind each block toward the eye. If he would rather see roofs there, the art chat can paint the blocks'
  tops as tiles of roof for those tiles.
- The courtyards in the picture are 14 by 12; the game's will vary, 14 to 18 by 12 to 15.

### Pictures

- `pictures/grounds.png` (1200 x 2564), built from these pieces the game's way at the game's real size (two picture pixels to a game
  pixel, not squeezed): THE GROUNDS: a courtyard under the night sky, the knight crossing it on the long walk by the well, the
  gaoler's house and its door on the left, the outer wall and its watchtower at the back, cell blocks in front and to the right
  with a barred gateway, an open gateway and the chapel's lit front, the next courtyards through them; WHERE YOU COME IN: inside
  the gaoler's room, the knight at the foot of the stair down from floor 1 (its arch, its steps, floor 1's light faint at its
  head), and out of his door into the first courtyard under the moon; THE WAY INTO HIS YARD: the knight just through his gate,
  the yard's own arch, gate and torches unchanged, the gallows and the bell where his yard lays them; and ONE PHONE SCREEN (1014 x
  468) at the game's own size, the knight in a courtyard by the well.

```
PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_grounds_game.ts docs/mockups/floor2_look/pictures/grounds.png 1200 2564 "sheet"
  ("run" at 1200 x 840, "inside" and "out" at 600 x 520, "gate" at 1200 x 600 and "phone" at 1014 x 468 give those alone)
```

### Checks

`tests/grounds.test.ts`, 13 of 13: off, and nothing of the game imports it; every piece the brief asks for painted; the yard's own
pictures (its cobbles and tiles, outer wall, tower, sky, torch) the yard's, the same sprites; crisp (every pixel whole or empty but
a wall's fading top in the game's four steps, a floor tile covering its whole diamond, no pixel alone); nothing cyan, no pink in
the place and floor 2's own pink only where it was; the floors, tiles, faces, ways, chapel and stair darker than the darkest word
(fire and lit windows apart) and the walk paler than the cobbles; light from the upper left (the faces along x lighter than along
y; the well and the tumbril lit on their left); every picture anchored where the game lays it (a wall tile's face to the floor
line, the blocks and the gaoler's walls their heights, the floor tiles at their top corner, the chapel and the stair three tiles
across about the floor point under their middle); the gateways' strips from t -1 to 3.75 and the way open three tiles; the stair
seen through its arch two tiles across, the wall beside it, its fading top, floor 1's light; floor 2's own pieces with their
names, kinds, sizes, anchors, shapes, lights and fire; the lights' numbers. With them `tests/yard.test.ts`,
`tests/yard_game.test.ts` and `tests/floor2_look.test.ts` pass, and `tsc` is clean.
