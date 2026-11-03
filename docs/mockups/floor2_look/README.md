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
