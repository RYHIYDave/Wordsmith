# Mock-up: the Amalgamation's floor, the Crypt's fourth floor themed after its boss (NOT IN THE GAME)

**What it is.** Floor 4's own set of pieces, by his rule of 10 Oct (his art rulebook, Places 7: each
floor themed after its boss, between 40 and 50 pieces made for it alone), and three moments that
play around the hero there (his idea of 07:52; his rulebook's Places 8). Pictures for him first.
Nothing of the game imports `src/art/floor4.ts`; where each piece stands, when it is laid and what it
does (what breaks, what blocks, what hurts, what a quest asks, when a moment plays) are the main
chat's, once he has said yes.

**State of this branch (`mockup/floor4-ossuary`):** from `mockup/floor2-headsman` as it was at
590af58 (floor 2 as he said yes to it, its moment helpers exported). Made by THE ART CHAT, 10 Oct
2026. **Not yet seen by him.**

## His words

- 07:29, asked whether the Crypt's four floors were good to build as shown: "Yes.  I’d also like
  each floor to be themed after the boss.  Add this to the ruleset.  We need somewhere between 40-50
  unique assets on each floor for each boss.  That can include wall tiles, floor tiles, breakables,
  stuff on the walls, on the floor, obstacles, the looks of doors and gates, traps, and quests."
- By 07:41, offered four themes (floor 4, the Amalgamation: the ossuary the miners broke into): "Yes,
  start floor 1 (Recommended)", the four themes with it.
- 07:47: "Put in the ruleset that I want animations as big and wild and kinetic and weighty as
  possible.  I’d rather it be a notch too high than a notch too low." 07:53: "And I want all
  animations checked against this statement before I see them." (Animations 1.)
- 07:52: "I’d also like a couple environmental things happening around you for immersion unique
  for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and
  they fly off,  a root shrivels as you walk by.  That sort of stuff"
- His notes on floor 1's first pictures, kept here too: "I don’t like the wall panels all being in
  the exact same spot." "Some assets could be the full height like a large crack down the wall."
  "Or a floor tile and wall combo that’s shows a crumbled wall and the debris piled on the floor."
  "And the rats just kind of disappear.  Animations need run the checks."
- By 12:00, of floor 1: "Yes, on to floor 2 (Recommended)", offered as: floor 1 goes to the main chat
  to build in, and the art chat starts the Headsman's floor.
- By 14:13, of floor 2, asked "Floor 2's pieces and moments, as on the Headsman Floor Review page:
  good as shown?": "Yes, on to floors 3 and 4 (Recommended)", offered as: floor 2 goes to the main
  chat to build in, and the art chat starts the Chained One's and the amalgamation's floors side by
  side.
- His outline of the first five floors, 9 Oct: “By floor 4 it’s about half dirt and rocks with
  discarded and rusted mining equipment around.  There is a cult here that has found an ancient evil
  power residing under the crypt.  Floor 5 will have the Lair boss, which will be a very powerful
  cultist fleshmancer.  He is the one creating the ossuary guys and the giant amalgamation.”

## The theme

From the Ossuary Amalgamation as it is painted (art/bosses3.ts, on mockup/bosses): a heap of the dead,
low and wide: dark packed bone, the fire in its cracks, skulls all over it with the pink in their
sockets, rib cages and broken bones jutting from its hump, the dead's own arms reaching up out of it;
no face but a maw low in its front full of fangs; six great arms of bone; it hauls itself on its arms;
it eats the dead. And the Crypt's fourth floor as he said yes to it (art/crypt.ts, CRYPT_FLOORS[3]:
half the floor earth, half the walls rough rock, timber pit props, rusted mining gear). So: AN OLD
OSSUARY THE MINERS BROKE INTO. The ossuary's walls of stacked skulls and long bones, its niches and
its column faced with the dead; the miners' breach, their timber, rails and cart, windlass, ladder and
tools, all old and rusted; the cult's black candles burning on skulls, its altar, its daub; and the
amalgamation's doing: the dead dragged into heaps, the earth raked by its hands, the drag it leaves,
the dead's arms reaching up out of the heaps. Its bone is the boss's own lavender grey, a step quieter
(and darker still in the walls, darker than any word); its rust a dull grey-brown, never red.

Its marks, chosen with care: on its own gate THE MAW, a wide mouth with square-cut corners (never the
almond of an eye) and a few great crooked fangs (never a row even enough to read as a letter), the
pink of its fire inside; on its other gates three skulls heaped, one on two. Never a skull over
crossed bones, never a cross. No carved words.

## What is in it (`ossuaryPieces()`, 49 pieces; `ossuaryMoments()`, 3)

- Wall tiles (7): the skull wall (the wall's height and its whole width: courses of knuckled bone ends and bands of skulls, the dead further in behind; the first moment's own), bone-lined niche, the miners' breach (the wall's height: a hole knocked through into the dead stacked beyond, their timber set in it; its heap of rubble, bones and a skull is its `frames[0]`, to be drawn on the floor tile before it, before the wall), shored rock (the wall's height: rough rock held back by boards and two posts), the dead's arm (out of a crack, clawing the stone), seam of ore, the charnel layer (where the stone has fallen away: earth with the dead in it).
- On the walls (8): miner's lantern (4 frames, with its light), pick in the wall, the cult's candle (a black candle burning on a skull on a spike, a stub beside it; 4 frames, with its light), garland of skulls, the miners' ladder (the wall's height), the miners' tools (a shovel and a sledge on spikes), the cult's daub (the maw daubed in soot), ribs on a spike.
- Floor tiles (6): the rails (two frames: along x and along y), earth and bones, raked earth (five grooves of its hand), bone-paved floor, the drag (the furrow it hauls itself through, its hands' gouges by it), spilled ore.
- Traps (3): bone spikes (and the warning: the sharpened bones risen in their holes), rotten boards (and giving: sagging, split), jaw slot (a row of the dead's jaws round a dart slot; a wall piece).
- Breakables (4), each whole and then broken (`frames[1]`, what it leaves): ore sack, heap of skulls, oil jug, ore tub.
- On the floor (7): empty boots, rib cage, broken ladder, drill steels, arm from a heap, a cultist's robe (empty, as a cultist dies), snapped prop.
- Obstacles (10): the mine cart, the rails' end (the stop the cart strikes), the windlass over its shaft, pyramid of skulls, the charnel heap (the third moment's own), timber crib, the cult's altar (4 frames, with its light), the boulder (and the prop it broke), the bone column (up into the dark), the reliquary (the chest; closed and open).
- Doors and gates (3): the door (the miners' rough planks on two battens, iron at its hinges, a rope loop), the gate (three skulls heaped, over it), the boss's gate (the maw, its fire pink). As `Piece.gates`, made by `makeGateArt(theme, look)` (`ossuaryGates()`).
- Quest (1): the eldest skull: the first of the dead the amalgamation gathered, found where it burst apart, the fire gone out of it.

Anchors, shadows (`Piece.shadow`), lights (`Sprite.lights`) and wall pieces' places (`Piece.spots`:
three each, low to high and across; never the same piece on two neighbouring tiles of a wall) are as
on floors 1 and 2. The skull wall, the miners' breach and the jaw slot have one place each (the skull
wall is the whole face; the breach lines up with its heap; the slot with its plate); the skull wall
is meant to be laid along a stretch of wall, one tile after another.

**Round things are painted in depth.** Skulls, bones, the cart, the heap and much else are built in
the world and painted pixel by pixel as the eye sees them (`Scene` in floor4.ts: ellipsoids, rods,
boxes and planes in a depth buffer, a seam of ink where one thing ends in front of another), lit from
the upper left; in a wall's face turned to screen-right, lit as that face is seen and a shade darker,
as floorkit paints a flat picture into it (`inFaceLight`), so that the face in the light stays the
lighter of the two.

## The moments (each at 30 frames a second; `before`, the frames, `after`)

`before` is what is there before it plays, its first frame the moment's first; `after` what is left,
the moment's last frame. Swap the one for the other. `jolts` are the frames for the screen's kick and
the sound (the films show a kick: down 3 of the game's pixels and back).

- **The skull wall spills** (112 frames, 3.7 s; in the skull wall, both faces, `right` for the face
  to screen-right; anchored at the foot of the face under the middle of its tile, as the piece; its
  `before` is the skull wall itself). Grit trickles from between the dead from the first frame; the
  middle of the wall bulges out, swelling and shuddering harder and harder, the cracks round it
  opening (frames 1 to 25), dust puffing out of its joints; at frame 26 (0.87 s, the first jolt) it
  bursts: the middle first and its rim over the next five frames, an avalanche of skulls and long
  bones thrown out across the floor, a cloud of dust blown out of the hole; at frame 39 (1.3 s, the
  second jolt) the wall above slumps into the hole and pours out after them, with the dead from
  further in (to frame 47). 15 skulls and 16 bones in all: they bounce, roll, knock into one another,
  a skull come down on another rolls off it, and rocking onto its base it comes to rest with its face
  to the room; all at rest by frame 91 (3 s), grit still trickling from the dark hole to the end.
  What is left: the hole, and the spill across the floor a tile and more out from the wall. Its
  frames are wider than the piece (200 x 168), out to the side the spill goes.
- **The cart runs** (132 frames, 4.4 s; on the cart's own anchor, the middle of its tile; its frames
  hold the cart and the rails' end four tiles on along x: lay the rails between them, along x, and
  the moment takes the place of both while it plays). The cart creaks and shudders on its wheels,
  rust sifting off it, and lurches (frames 9 to 12); from frame 16 it rolls by itself, faster every
  frame, rattling over the rails' joints, sparks of an honest fire's orange flying from its wheels
  from frame 30; at frame 50 (1.67 s, the first jolt) it strikes the rails' end at 3.6 of the game's
  pixels a frame: it stops dead, the baulk jumps, sparks spray, its back end kicks up and its load
  is flung on over the stop; it goes over onto its side with a crash at frame 65 (2.17 s, the second
  jolt), the rest of its ore pouring out; the ore, a skull and a bone bounce and roll and lie still by
  frame 88; one of its wheels turns on in the air to the end, slower and slower.
- **The bones stir** (124 frames, 4.1 s; the charnel heap, on its own anchor; its `before` is the
  heap itself). Bones on the heap twitch (frames 2 to 15); a skull rolls off its top and down its side
  (from frame 9); the heap heaves twice, swelling, its bones grinding and sliding together (16 to 38);
  at frame 38 (1.27 s, the first jolt) an arm of bone bursts up out of its top, to its full height in
  four frames, flinging bones and skulls off it, and claws at the air, its elbow out, its hand
  clenching and spreading, swaying and lunging out toward the hero; the pink kindles in the sockets of
  a skull at the heap's front from frame 45, burning by 56 (its light, `Sprite.lights`, the enemy's
  glow), its face turning to the hero; at frame 78 the arm comes apart and its pieces crash down onto
  the heap (frame 84, 2.8 s, the second jolt), the heap slumping lower than it was; the burning skull
  is dragged down into it, bones sliding over it, its eyes the last of it to go under (gone at frame
  103: seen going down into the heap, never fading where it lies). At rest by frame 116. What
  is left: the heap, lower and changed, the arm's bones on it, the flung bones about it.

## For the main chat, when he has said yes

- Floor 4 is built on `src/art/floorkit.ts` and floor 2's exported moment helpers, as floors 2 and 3.
  New here and worth sharing if another floor wants it: the depth painter (`Scene`, `skull`,
  `knuckleBone`, `longBone`, `ribCage`, `wheel`, `inFaceLight`) and the loose-things stepper
  (`stepBodies`: falling, bouncing, rolling, sliding, round things knocking into one another).
- The moments' frames are bigger than the pieces' own (line them up by the anchor). Painting all
  three takes about 9 s here, once (the skull wall's twice, one for each face); a phone several times
  that: worth painting ahead, or when the floor is first reached.
- The cart's moment needs the rails laid along x from the cart's tile to the rails' end, four tiles
  on; the heap's light is the enemy's pink (Colour 3: his eyes in the dark), on its frames only.

## Looks, and what was mended

**No fresh pair of eyes yet.** The art chat's brief asks for two looks by a subagent who has not seen
the code; this branch's helper could not start one, so those two looks are still to be had, on the
pictures listed under Pictures. What was found and mended by the maker's own looks, piece by piece and
frame by frame: small skulls read as round blobs, their sockets too small to see (now the sockets are
never less than a game pixel across, set high and apart, and every skull turned a little toward the
room); the cult's daub, first a fanged almond, read as an eye with lashes and tears (now a wide mouth
with square-cut corners, a few crooked fangs, no drips), and its fangs in a regular row risked reading
as letters (now few and of every length); the three skulls over the gate read as rings (now raised
and solid); round things showed their undersides below the floor (now cut at the floor); the charnel
heap read as a pot (now a low mound covered with the dead); the timber crib read as a cabinet (now
round logs, their cut ends showing their rings); the bone column's cap read as a drum (now it goes up
into the dark); the boulder showed a face in its spots (now flat facets); rust on the tools' blades
was a mauve that could be read as blood (now a dull grey-brown); the burning eyes were hidden for a
frame by the arm falling across them (the arm now reaches and falls to the other side); the spilled
bones were dim (out in the room they take the room's brighter bone, by degrees as they leave the wall).

## The checks (`tests/floor4.test.ts`, 20)

Every check floors 1 and 2 went through (`tests/floor_checks.ts`: Places 7; Pixels 1, crisp, no
loose pixels; Colour 3; Colour 4; Pixels 4; Pixels 7; his notes: every wall piece in three places, low
to high and across, within its tile, nothing in the fade, no band of the wall holding more than a
third; the moments crisp, 30 a second, nothing popping in or out at the start, the end or the middle,
nothing jumping, always moving, no frame with more than 4 loose pixels), and its own: three moments,
none held. The skull wall: an avalanche, 14 skulls and more and 8 bones and more; it bulges and shudders
before it bursts; every one goes a long way, fast, and lies still at the end; a third of them bounce;
they spread 60 pixels and more across; the burst throws them out, the slump pours more out, each on
its jolt; its dust flies wide; a hole is left; in both faces. The cart: it starts by itself and goes
faster every frame, a long way; it strikes going five picture pixels across a frame and more, and stops dead; its
load is thrown out and lies still; the strike shows; something still turns at the end. The heap: the
arm bursts up fast and high and is up a second and more; the eyes are dark, then kindle after the
burst, then go under bit by bit, going down as they go, and are gone at the end; everything flung or
fallen lies still; what is left is changed.

## Pictures (not in the repository)

`node tools/preview.mjs src/dev/preview_floor4.ts <out.png> 6000 6000 "sheet:4"` (every piece by
kind), `"spots:4"` (every wall piece at its three places), `"room:3"` (a room laid with them; n after
the scale, the frame of what moves), `"moment:2:<n>"` (n: 0 the skull wall, 3 the skull wall in the
other face, 1 the cart, 2 the heap; every frame in a grid, the page logs the grid), `"strip:4:<n>"`
(twelve frames close), `"look:8:<n>"` (n: 0 to 5, a few pieces close). The page must be bigger than
the picture.
