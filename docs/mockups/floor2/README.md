# Mock-up: the Headsman's floor, the Crypt's second floor themed after its boss (NOT IN THE GAME)

**What it is.** Floor 2's own set of pieces, by his rule of 10 Oct (his art rulebook, Places 7: each
floor themed after its boss, between 40 and 50 pieces made for it alone), and three moments that
play around the hero there (his idea of 07:52; his rulebook's Places 8). Pictures for him first.
Nothing of the game imports `src/art/floor2.ts`; where each piece stands, when it is laid and what it
does (what breaks, what blocks, what hurts, what a quest asks, when a moment plays) are the main
chat's, once he has said yes.

**State of this branch (`mockup/floor2-headsman`):** from `mockup/floor1-warden` (6ae5589, floor 1 as
he said yes to it). Made by THE ART CHAT, 10 Oct 2026. **He has said yes to it, as shown** (by 14:13;
his words below): the main chat's to build in.

## His words

- By 07:41, offered four themes (floor 2, the Headsman: the place of execution): "Yes, start floor 1
  (Recommended)", the four themes with it.
- 07:47: "Put in the ruleset that I want animations as big and wild and kinetic and weighty as
  possible.  I’d rather it be a notch too high than a notch too low." 07:53: "And I want all
  animations checked against this statement before I see them." (Animations 1.)
- 07:52: "I’d also like a couple environmental things happening around you for immersion unique
  for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and
  they fly off,  a root shrivels as you walk by.  That sort of stuff"
- His notes on floor 1's first pictures, kept here too: "I don’t like the wall panels all being in
  the exact same spot." "Some assets could be the full height like a large crack down the wall."
  "And the rats just kind of disappear.  Animations need run the checks."
- By 12:00, of floor 1: "Yes, on to floor 2 (Recommended)", offered as: floor 1 goes to the main chat
  to build in, and the art chat starts the Headsman's floor.
- By 14:13, of floor 2, asked "Floor 2's pieces and moments, as on the Headsman Floor Review page:
  good as shown?": "Yes, on to floors 3 and 4 (Recommended)", offered as: floor 2 goes to the main
  chat to build in, and the art chat starts the Chained One's and the amalgamation's floors side by
  side.

## The theme

From the Headsman as he is painted (art/bosses3.ts, on mockup/bosses): an empty pointed hood of a
red so dark it is nearly black, on a body of leather and iron; a great axe, its crescent of black
steel with a bright edge; his sound a tolling bell. So: the place of execution. The block and the
scaffold, the gallows and the gibbet, the stocks, the great bell; his hoods, his axes, the tools of
his trade; sawdust, old dull stains (never red: grim, never gory); ravens. His marks are the empty
hood with its two eye-holes, always in his near-black red or dark stone (never pale: a pale pointed
hood with eye-holes could read as another, hateful hood), and his axe's crescent. No carved words.

## What is in it (`headsmanPieces()`, 49 pieces; `headsmanMoments()`, 3)

- Wall tiles (7): hatch, axe-scarred stone, bell niche, skull ledge, the hood carved (his hood cut into the stone and painted his red, his crescent beside it), the long stain (the wall's height), the chute (its heap of sawdust and bones: its `frames[0]`, to be drawn on the floor tile before it, before the wall).
- On the walls (9): hoods on pegs, axe on hooks, noose, torch (4 frames, with its light), his banner, branding irons, tools of the trade, black candles (4 frames, with their light), chain from the dark (the wall's height).
- Floor tiles (6): sawdust, gutter, trapdoor, the split floor, the hood in the floor, cobbles.
- Traps (3): blade slots (and their glint), crescent plate (and pressed), dart mask (its mouth the slot; a wall piece).
- Breakables (4), each whole and then broken (`frames[1]`, what it leaves): basket, sawdust barrel, pail, crate.
- On the floor (7): kicked-over stool, broken axe, coil of rope, bones in irons, dropped lantern, skulls in the sawdust, broken wheel.
- Obstacles (9): the block, the scaffold, the gallows, the gibbet, the stocks, the great bell, the grindstone, brazier of irons (4 frames, with its light), the headsman's strongbox (the chest; closed and open).
- Doors and gates (3): the door (black oak planks, heavy iron straps, a small barred window, a great ring), the gate (his crescent over it), the boss's gate (his hood, its eye-holes his embers). As `Piece.gates`, made by `makeGateArt(theme, look)` (`headsmanGates()`).
- Quest (1): the Headsman's hood, lying where it fell.

Anchors, shadows (`Piece.shadow`), lights (`Sprite.lights`) and wall pieces' places (`Piece.spots`:
three each, low to high and across; never the same piece on two neighbouring tiles of a wall) are as
on floor 1 (docs/mockups/floor1/README.md).

## The moments (each at 30 frames a second; `before`, the frames, `after`)

`before` is what is there before it plays (the ravens' a loop of 4 frames; the bell's and the
gibbet's the piece as it stands), its first frame the moment's first; `after` what is left, the
moment's last frame. Swap the one for the other. `jolts` are the frames for the screen's kick and the
sound (the films show a kick: the bell's strokes down 3 of the game's pixels and back, the gibbet's
2).

- **The ravens take flight** (80 frames, 2.7 s; on the floor, anchored at the skull they peck at).
  Five ravens peck at bones (`before`); every head snaps up at frame 5 (0.17 s), two caw, one hops;
  all five burst off the floor from frame 9 to 13 (0.3 to 0.43 s), each with a low cloud of dust and
  a puff of feathers, a bone flung end over end; one swoops low and fast out toward the hero before
  it climbs; they climb on fast beats, darker as they go up, and fly out of the top of the picture,
  200 of the game's pixels above the anchor, riding up on raised wings so that they leave it bit by
  bit. Feathers rock down and stay. **Its frames are tall and each is cut
  down to what is painted in it:** the birds leave the picture at its top, so it should play where
  that line is off the screen, or near enough to it.
- **The bell tolls** (147 frames, 4.9 s; the great bell, on its own anchor, its frames wider and
  taller for the dust). Grit sifts off the frame and the rope twitches; the bell swings by itself,
  each swing wider, nearly two seconds there and back, hanging at the top of each; after a first
  swing it strikes three times, at frames 49, 76 and 100 (1.63, 2.53 and 3.33 s), the **jolts**: the
  frame jumps off its feet, dust bursts off its tops and rains down, a ring of dust blows out across
  the floor; then it dies away and hangs still on its last frame. Painted round, in depth: swung
  toward the hero he looks into its dark mouth; swung away he sees its crown.
- **The gibbet swings** (93 frames, 3.1 s; the gibbet, on its own anchor, its frames wider and deeper
  for where the bones go). The chain slips a link and catches at frame 2 (a jolt); the man-sized cage
  is flung swinging; at the top of its first swing its foot bursts at frame 10 (0.33 s, a jolt), a
  snapped bar and rivets flying; the leg bones, the ribs and the skull pour out and strike the floor,
  the skull at frame 20 (0.67 s, a jolt), bounce and roll; the cage swings on empty and comes to the
  bottom of its swing on the last frame; rust sifts off its chain all the while. What is left: the
  empty cage, burst, and the bones where they lie.

## For the main chat, when he has said yes

- `src/art/floorkit.ts`: what floor 1 and floor 2 share, for every floor from 2 on (the wall and floor
  measures, the spots, the shadows' and lights' rules, dust, `fastBlit`). `tests/floor_checks.ts`:
  the checks every floor goes through, called by each floor's own test file.
- The gibbet is now man-sized; the great bell turns on an axle with a headstock and a rope wheel.
- The moments' frames are bigger than the pieces' own (line them up by the anchor); the ravens'
  frames differ in size from frame to frame. Painting all three takes about 4 s here, once; a phone
  several times that: worth painting ahead, or when the floor is first reached.

## Two looks by a second pair of eyes (one who had not made it), and what was mended

The first look: the ravens read as grey gulls and faded out as a speckle; the bell swung away read as
a disc, it swung too fast and its dust sat on the beam like wool; stains read as blood; his hood as a
mark read as an eye in a triangle; the bell niche read as a 4 and the branding irons as letters; the
hoods on pegs as a fringe of teeth. All mended: dark ravens with broad fingered wings that fly out of
the picture; the bell painted round in depth, slower, heavier, its dust bursting and falling fast;
stains a dull dark grey; his hood as a bust with eye-holes; a broad bell; irons on handles; two hoods
with folds. The second look: the carved hood, pale, risked reading as another, hateful hood (now dark,
his red, his crescent beside it); the tools read as a sign (now dark iron hung at angles); the bell
read as a horn (now a church bell's shape); the dust under the ravens was a ring (now a cloud); rust
by the bones read as spatter (now grey-brown). One thing is as it must be: a bell swung away from us
shows its round crown.

## The checks (`tests/floor2.test.ts`, 20)

Every check floor 1 went through (Places 7; Pixels 1, crisp, no loose pixels; Colour 3; Colour 4;
Pixels 4; Pixels 7; his notes: every wall piece in three places, low to high and across, within its
tile, nothing in the fade, no band of the wall holding more than a third; the moments crisp, 30 a
second, nothing popping in or out at the start, the end or the middle, nothing jumping, always
moving), and new: no frame of a moment with more than 4 loose pixels. The ravens: they peck, all
leap within a quarter of a second, climb high, scatter every way, leave the picture bit by bit,
fast; a bone flung; feathers fall and stay. The bell: three strokes or more, each a jolt at the top
of a swing, by turns on each side, the clapper out at the lip at each and back through the middle
between, its lip swinging wide and high, dust flying wide, the frame jumping, still again as it was.
The gibbet: the chain drops it, it swings wide, bursts at the top of its swing throwing out a bar,
every bone falls a long way and lies still, the skull falls faster every frame, strikes on a jolt,
bounces and rolls, the cage swings on empty.

## Pictures (not in the repository)

`node tools/preview.mjs src/dev/preview_floor2.ts <out.png> 6000 6000 "sheet:4"` (every piece by
kind), `"spots:2"` (every wall piece at its three places), `"room:2"` (a room laid with them),
`"moment:2:<n>"` (n: 0 the ravens, 1 the bell, 2 the gibbet; every frame in a grid, the page logs the
grid), `"strip:4:<n>"` (twelve frames close), `"look:5:<n>"` (a few pieces close). The page must be
bigger than the picture.
