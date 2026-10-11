# Mock-up: the Amalgamation's floor, the Crypt's fourth floor themed after its boss (NOT IN THE GAME)

**What it is.** Floor 4's own set of pieces, by his rule of 10 Oct (his art rulebook, Places 7: each
floor themed after its boss, between 40 and 50 pieces made for it alone), and three moments that
play around the hero there (his idea of 07:52; his rulebook's Places 8). Pictures for him first.
Nothing of the game imports `src/art/floor4.ts`; where each piece stands, when it is laid and what it
does (what breaks, what blocks, what hurts, what a quest asks, when a moment plays) are the main
chat's, once he has said yes.

**State of this branch (`mockup/floor4-ossuary`):** from `mockup/floor2-headsman` as it was at
590af58 (floor 2 as he said yes to it, its moment helpers exported). Made by THE ART CHAT, 10 Oct
2026; mended after the first fresh look the same day and after the second on 11 Oct (see Looks).
**Not yet seen by him.**

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
(and a step quieter again in the big things that stand in the room, and darker still in the walls,
darker than any word); its rust a dull grey-brown, never red; no gold anywhere.

Its marks, chosen with care: on its own gate THE MAW, a mouth roaring open, its corners cut square
(never the almond of an eye), smaller than its roundel so that its shape shows in the stone, three
fangs of every size in it, never up and down by turns (the first fresh look read the first maw's row
of fangs as "WAW"), its fire pink and hottest low in it, never in rings; on its other gates ONE SKULL,
face on, carved big enough to read as one (the three small skulls before it read as a ball). Never a
skull over crossed bones, never a cross (the robe's second sleeve is folded under it for that). No
carved words.

## What is in it (`ossuaryPieces()`, 49 pieces; `ossuaryMoments()`, 3)

- Wall tiles (7): the skull wall (the wall's height and its whole width: courses of knuckled bone ends and bands of skulls, the dead packed further in behind; the first moment's own), bone-lined niche, the miners' breach (the wall's height: a ragged hole knocked through the stone well above the floor, packed with the dead and earth, cracks run out from it; no timber, nothing that reads as a doorway; its heap of rubble, bones and skulls is its `frames[0]`, to be drawn on the floor tile before it, before the wall), shored rock (the wall's height: great lumps of raw rock bulging out between two boards askew and two round props, one leaning), the dead's arm (a small dark hole, and out of it a pale bony forearm, its hand spread flat on the stone), seam of ore (a jagged pale vein slanting across hacked rock, forking, nuggets of dull metal in it), the charnel layer (where the stone has fallen away: earth, long bones lying straight along it, three skulls half sunk).
- On the walls (8): miner's lantern (a cage of iron round its glass, the flame inside, a peaked cap, hung by its ring from an iron bracket straight out from the wall; 4 frames, with its light), pick in the wall (its iron head lighter than the stone, one point in a crack it split), the cult's candle (4 frames, with its light), garland of skulls, the miners' ladder (the wall's height), the miners' tools, the cult's daub (the maw drawn in pale chalk strokes, broken here and there, its three fangs drawn in, a smear under it; nothing filled in black), ribs on a spike (an iron spike, the spine on it, four pairs of ribs curving and drooping).
- Floor tiles (6): the rails (along x and along y), earth and bones (bones scattered every way, a skull off to one side), raked earth (four long furrows together, ridges lit, ends ragged, clods kicked out), bone-paved floor (big bones, each a little curved, laid flat every way, packed), the drag (a trough gouged where it gripped, banks pushed up, bits of bone trailing), spilled ore (rough lumps in a fan, lit on their upper left, a glint of metal on some, each with its shadow).
- Traps (3): bone spikes (and the warning), rotten boards (and giving), jaw slot (a black slot in a stone plate, three great pale fangs into it, two from above and one from below at its end; a wall piece).
- Breakables (4), each whole and then broken (`frames[1]`): ore sack, heap of skulls, oil jug (broken: great curved shards, its neck whole with its plug and handle, the oil pooled), ore tub.
- On the floor (7): empty boots (a pair, in profile, their tops folded over), rib cage (on its back, its ribs arching, its skull rolled from it face up), broken ladder, drill steels (three thick bars with flared bits, a square-headed hammer), arm from a heap (thick, its hand splayed and clawing), a cultist's robe (dropped and crumpled, not even: its hood round with a dark opening, one sleeve trailing out, its hem fanned and ragged, folds from its neck, a cord round it with two tasselled ends, a candle stub by it), snapped prop (a squared post broken in two, long splinters at the break).
- Obstacles (10): the mine cart (a deep iron tub banded and riveted, small solid flanged wheels under it, ore and three skulls heaped in it), the rails' end (the rails curling up out of a mound of earth, two posts and a crossbeam across them at the rails' height, iron-faced), the windlass (low and broad over a square shaft: two posts on sills, the drum waist high with its rope wound in slanting bands, a crank, the bucket of ore hanging over the shaft), pyramid of skulls, the charnel heap (the third moment's own), timber crib, the cult's altar (a great block of stone under a wine-dark cloth hanging to a ragged hem, a skull in the middle, black candles at each end; 4 frames, with its light), the boulder (dark, all facets, cracked; the prop it broke under it), the bone column (its skulls turned to the eye, their sockets and nose set on the picture's pixels as separate dark marks; up into the dark), the reliquary (a small casket with a high peaked lid, its wood a step brighter than the room's, trimmed in iron; open, a skull and the bones of a hand in it; no gold).
- Doors and gates (3): the door (the miners' planks), the gate (a skull carved over it), the boss's gate (the maw, its fire pink). As `Piece.gates`, made by `makeGateArt(theme, look)` (`ossuaryGates()`).
- Quest (1): the eldest skull (cracked, the fire gone out of it; no glint of gold).

Anchors, shadows (`Piece.shadow`), lights (`Sprite.lights`) and wall pieces' places (`Piece.spots`:
three each, low to high and across; never the same piece on two neighbouring tiles of a wall) are as
on floors 1 and 2. The skull wall, the miners' breach and the jaw slot have one place each; the skull
wall is meant to be laid along a stretch of wall, one tile after another.

**Round things are painted in depth.** Skulls, bones, the cart, the heap, the dust and much else are
built in the world and painted pixel by pixel as the eye sees them (`Scene` in floor4.ts: ellipsoids,
rods, boxes and planes in a depth buffer, a seam of ink where one thing ends in front of another, none
round the dust), lit from the upper left; in a wall's face turned to screen-right, lit as that face is
seen and a shade darker, as floorkit paints a flat picture into it (`inFaceLight`).

## The moments (each at 30 frames a second; `before`, the frames, `after`)

`before` is what is there before it plays, its first frame the moment's first; `after` what is left,
the moment's last frame. Swap the one for the other. `jolts` are the frames for the screen's kick and
the sound. The films show a longer, harder kick than before, at every jolt: 2 of the game's pixels
across and 5 down, then back and forth over six frames ((2, 5), (-2, -4), (2, 3), (-1, -2), (1, 1),
(0, -1)).

THE DUST, everywhere (the first fresh look found it a flat grey patch wearing away into specks): a few
big clouds, each grown out of where something struck over its first three frames, shaded (its top lit,
its belly dark), lumpy as a cloud is; blown out fast, then hanging and drifting up; then settling,
sinking onto the floor and flattening into a low sheet that shrinks away as one. Painted in depth, it
hides only what is behind it; kept off the key action (blown along the wall's foot, along the buffer).
No grit, no single pixels.

- **The skull wall spills** (168 frames, 5.6 s; in the skull wall, both faces, `right` for the face to
  screen-right; anchored at the foot of the face under the middle of its tile, as the piece; its
  `before` is the skull wall). From frame 1 its face swells out, the whole height of it, up to 13 of
  the world's pixels at its middle, shuddering harder and harder, the gaps between the dead opening;
  dust spurts from its joints; skulls pop loose from the bulge and fall (14, 20, 25). At 32 (1.07 s,
  the first jolt) the foot of its middle bursts out: skulls and long bones thrown out and up in arcs,
  tumbling, two clouds blown along the wall's foot; from 36 the top courses of its middle drop in one
  block, a plume of dust rising over the wall's top (37), and at 43 (1.43 s, the second jolt) break on
  the heap, skulls and bones thrown every way; at 50 (1.67 s, the third) its sides give and slump out,
  their tops dropping (54, 56, two more plumes over the top) and breaking (61, 2.03 s, the fourth; and
  63). What comes down heaps against the wall in a deep cone, its own dead rising with it out of it;
  the spill (11 skulls and 24 bones) bounces and rolls toward the hero and comes to rest within about
  four tiles of the wall (the farthest 4.4 tiles from the anchor, most within 3.5), each skull rocking to
  rest with its face to the room; all at rest by 97, the last dust settling dark into the floor and gone
  on the last frame. What is left: a great ragged cavity, the dead packed further in going dark in it,
  a few of its face left at its rim and in its dark top; the cone; the spill.
- **The cart runs** (190 frames, 6.3 s; on the cart's own anchor, the middle of its tile; frames 600 x
  352, the anchor at (76, 116); they hold the cart and the rails' end six tiles on along x: lay the
  rails between them, along x, past where the hero may stand, and the moment takes the place of both
  while it plays). From frame 0 it rocks hard on its wheels, nose and tail and side to side, hopping,
  rust flaking off it, lurching at 10 to 13; from 22 it rolls by itself, faster every frame, bucking at
  every joint of the rails, a skull and a lump of ore bounced off on the way; sparks streak from its
  wheels. At 66 (2.2 s, the first jolt) it strikes the rails' end going nearly 8 picture pixels across a
  frame: the crossbeam splits, nine splinters fly, sparks spray, two clouds blown out along it; the cart
  pitches over nose first, its load flung on ahead, and flies on through the air (rising 31 pixels),
  turning right over; at 82 (2.73 s, the second jolt) it lands on its back, three clouds along it, and
  bounces hard and again lower; a wheel breaks off, its rim and hub pale against the dark, rolls away in a
  wobbling curve, slower and slower, tips and falls flat, rattling (flat by 147); its load (ten lumps of
  ore, five skulls, a bone) bounces and rolls on three and four tiles, kept on the floor before the rails'
  end; its last wheels turn on in the air to the end.
- **The bones stir** (172 frames, 5.7 s; the charnel heap, on its own anchor; frames 352 x 272, the
  anchor at (176, 164); its `before` is the heap). It breathes from frame 1, three times, deeper each
  time (its top rising and falling 12 pixels at the last), skulls rolling off it and down its sides,
  fingers of bone poking up out of it and drawing back. At 42 (1.4 s, the first jolt) a great arm bursts
  out of a ragged dark hole in its top, its hand up 44 pixels in four frames, bones and skulls thrown up in
  a fountain and raining down all round. The arm is of bones, thick at the shoulder and thinner to the
  wrist, a knob at the shoulder, the elbow and the wrist, its hand plain to see. It rakes: it slams down
  on its left at 55 (the second jolt), drags across the front, swings up and over and slams down on its
  right at 79 (the third), and drags back toward the hero, its fingers clawing the ground (its hand from
  54 pixels left of the anchor to 40 right); its claws leave grooves in the earth. From 93 the sockets of
  a skull at the heap's front right kindle, deep magenta first, then pink, its eyes great, burning by 100,
  steady. From 94 the arm comes apart a piece at a time, fingers, hand, the forearm's two bones, its upper
  arm landing at 106 (3.53 s, the fourth jolt). The heap slumps; from 114 three bones slide down over the
  burning skull from above, one after another, never up across it: the first across its eyes, covering
  them from the top down (119 to 130), the pink haze on the bones about it shrinking with them a little
  each frame; then one over its brow, and one higher. A sliver of its eyes glows on, steady, through a
  gap (130 to 139); the skull sinks into the heap a whole pixel at a time, the bones on it with it, and
  the last of the glow is gone by 142. A last breath of dust at the heap's foot settles and is gone on
  the last frame. What is left: the heap, lower and changed, the arm's bones on it, the flung bones about
  it, the earth raked.

## For the main chat, when he has said yes

- Floor 4 is built on `src/art/floorkit.ts` and floor 2's exported moment helpers, as floors 2 and 3
  (it no longer uses floor 2's puffs or grit). New here and worth sharing: the depth painter (`Scene`,
  `skull`, `knuckleBone`, `longBone`, `ribCage`, `wheel`, `inFaceLight`), the loose-things stepper
  (`stepBodies`: falling, tumbling, bouncing, rolling and sliding down slopes, round things knocking
  into one another, at rest; a `fence` slows what crosses it, to keep a spill on the floor near where it
  fell), and the dust (`Cloud`, `cloudAt`, `paintClouds`).
- `ossuaryMoment(n)` paints one moment; `ossuaryFilm(n)` one film (the skull wall's two faces apart),
  for a page that need not paint them all. Painting all four films takes about 30 s here: paint them
  ahead, or when the floor is first reached, one at a time.
- The cart's moment needs the rails laid along x from the cart's tile to the rails' end, six tiles on;
  the heap's light is the enemy's pink (Colour 3: his eyes in the dark), on its frames only.

## Looks, and what was mended

**The first fresh look** (a subagent who had not seen the code, run by the art chat on 10 Oct) found a
great deal; the art chat ruled on each finding, and each was mended:

- Letters and symbols: the charnel layer's curled bones read as "3" and "C" (now straight bones along
  it and three skulls); the windlass's rope as stamped lettering and its beam as a sign, the whole a
  gallows or a well (now low and broad, its rope in slanting bands, a crank, the bucket over the shaft);
  the boss's gate's maw as pink "WAW" (now the mouth above); the bone column's skulls a dark "+" (now
  turned to the eye, fewer to a ring); the reliquary's sparkles plus signs and the altar's two skulls
  with a bone behind each a skull and crossbones (both remade, below); the daub "VVV" (three fangs
  now); the lantern's hook a "2" (now a bracket straight out, the lantern on it).
- Gold: the reliquary was full of glowing gold (now a small peaked casket of dark wood and iron with a
  skull and the bones of a hand in it); the eldest skull's gold glint is gone.
- The heap's eyes flickered pink and red-orange by turns (they took the mages' flame ramp): one steady
  pink now, never orange or red.
- The miners' breach read as a doorway: now a ragged hole above the floor, the dead packed in it, no
  timber frame.
- Brightness: the column, the pyramid, the heap and the boulder as bright as the hero's armour: their
  bone a step quieter (`BIG_BONE`), the boulder dark rock; all bone a little quieter.
- Timber: the Crypt's ramp is kept as he said yes to it; its lit tones are no longer pushed past it
  (`TIMBER_DIM` where light falls), and the lanterns stand in the room picture away from the heap and
  the column.
- Pieces that did not read, each remade as the fresh look asked: shored rock, seam of ore, jaw slot, the
  dead's arm, ribs on a spike, pick in the wall, miner's lantern, bone-paved floor, raked earth, the drag,
  spilled ore, earth and bones, mine cart, rails' end, altar, boulder, the gate's badge, arm from a heap,
  cultist's robe, rib cage, snapped prop, empty boots, drill steels, the broken oil jug (all as above).
  The bones' knobs are smaller beside their shafts, so that a skull by a bone end no longer reads as a
  lollipop.
- The moments: all three made anew to the fresh look's asks (above), and the dust everywhere. A
  steel-blue glint it saw on a skull is gone: every film is now checked for anything near cyan.
- The room: the lantern's flame sat over the charnel heap, so that it looked on fire: moved.
- The 1-pixel sideways twitch every 10 frames seen in floor 3's films: checked in these: the frames'
  anchors never move, and in the films the picture moves only at the jolts, by the kick.
- Not mended here (shared): the black triangular cracks in the wall blocks, read as black pennants, are
  in the Crypt's own walls (art/crypt.ts), not in floor 4's pieces.

**The second fresh look** (11 Oct) found it a big step up (gold, crossbones, letters, the breach and the
brightness all mended; the cart's crash meets his rule), and asked for these, each mended:

- The skull wall's films: a pop at their last frames (157 to 166, 158 to 167 in the other face), then
  black. It was the page's, not the moment's: the film's grid was taller than the page and was cut. The
  films are now made on a page big enough, and checked frame by frame.
- Debris left the floor: the wall's spill now comes to rest within about four tiles of it, the cart's
  load (a skull and two lumps of ore went far) on the floor before the rails' end.
- The heap's arm after the slam a stiff angle with no hand: now tapered bones, knobs at the shoulder,
  elbow and wrist, the hand plain to see clawing the ground; a kick at each slam (55, 79).
- The cult's daub read as a black hole or a bat: now pale chalk strokes, nothing filled in black.
- The rails' end read as a treasure chest: now two posts and a crossbeam at the rails' height, the rails
  curling up; the reliquary a peaked casket, a step brighter, never gold.
- The robe read as a purple mitten: now a dropped robe, uneven, with a hood and its dark opening, one
  sleeve trailing, its hem fanned, a cord with tassels.
- The bone-paved floor read as runes: its bones now each a little curved.
- The heap's burning skull popped out at 141 and 142: now bones slide over it one after another, its
  glow showing through the gaps, then covered.
- The settled dust read as puddles of milk: it now settles darker than it hangs, broken in tone, and
  shrinks away.
- The heap's eyes were blood red as they kindled: they now start from deep magenta.
- Smaller: the charnel heap's bottom skull read as a "+" (turned); the spill mound's pale speckles
  (darkened); the windlass rope read as a barcode (fewer, softer bands); the seam of ore read as a crack;
  the dead's arm read as a "Z" (its elbow and wrist bent softly, its hand flat); the drag and the spilled
  ore too faint (stronger); the lilac balls at the breach's foot (now rock).
- And as much of the raises as time allowed: the skull wall swells further, its top courses drop, dust
  plumes over its top; the cart rocks hard from the start, carries five skulls, its runaway wheel pale at
  rim and hub, its landing bounces twice; the heap breathes deeper, the arm slams twice and rakes the
  earth.

**The last look** (11 Oct) found it clear of rule breaks, and asked for two small touches, both made:

- The bones stir: the buried skull's eyes went almost out and came back, and the pink haze went in one
  frame. The bones now come down over it from above and never cross its eyes on the way, it sinks a whole
  pixel at a time so that what shows between the bones holds steady, and the haze shrinks a little each
  frame as they cover it.
- The bone column: the right-hand skull of each band had a small dark cross where its eye met its nose.
  Its skulls' sockets and noses are now set on the picture's own pixels as separate marks, two blocks and
  a dot (`SkullPose.snap`), and the skulls are turned a little more to the eye.

Not done in the second round: bigger skulls and bones in the wall's spill (as before), the arm dragging the
heap itself with it (it rakes the earth only). Not mended here (shared): the Crypt's own black wall
cracks, as above.

## The checks (`tests/floor4.test.ts`, 20)

Every check floors 1 and 2 went through (`tests/floor_checks.ts`: Places 7; Pixels 1, crisp, no
loose pixels; Colour 3; Colour 4; Pixels 4; Pixels 7; his notes: every wall piece in three places, low
to high and across, within its tile, nothing in the fade, no band of the wall holding more than a
third; the moments crisp, 30 a second, nothing popping in or out at the start, the end or the middle,
nothing jumping, always moving, no frame with more than 4 loose pixels), and its own: three moments,
none held. The skull wall, in both faces: four jolts in turn; ten skulls and more and twenty bones;
it bows out before it bursts and skulls pop loose; every one goes a long way and lies still at the end;
a third and more bounce; out a long way toward the hero, but none at rest more than about four and a half tiles out; its top comes down; a cavity is left. The
cart: it shivers plain to see; it starts by itself after 20 frames, goes faster every frame, a long way,
strikes going six picture pixels across a frame and more; it rises going over; some of its load spills
on the way, more flung on far with a skull among it, all at rest; the buffer splinters; the wheel
rolls away and lies still; the strike shows; something still turns at the end. The heap: it breathes
deep and often; skulls roll off it; a fountain of six and more thrown high; the hand rises high and
rakes wide; the eyes dark, then kindled and steady, then going under bit by bit, lower as they go, and
gone at the end; the arm comes apart in pieces; all at rest; the heap is changed.

## Pictures (not in the repository)

`node tools/preview.mjs src/dev/preview_floor4.ts <out.png> 6000 6000 "sheet:4"` (every piece by
kind), `"spots:4"` (every wall piece at its three places), `"room:3"` (a room laid with them; n after
the scale, the frame of what moves), `"moment:2:<n>"` (n: 0 the skull wall, 3 the skull wall in the
other face, 1 the cart, 2 the heap; every frame in a grid, the page logs the grid), `"strip:4:<n>"`
(twelve frames close), `"look:8:<n>"` (n: 0 to 5, a few pieces close), `"pick:8:<name>|<name>|..."`
(the pieces named). The page must be bigger than the picture.
