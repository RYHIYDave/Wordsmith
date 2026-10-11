# Mock-up: the Chained One's floor, the Crypt's third floor themed after its boss (NOT IN THE GAME)

**What it is.** Floor 3's own set of pieces, by his rule of 10 Oct (his art rulebook, Places 7: each
floor themed after its boss, between 40 and 50 pieces made for it alone), and three moments that
play around the hero there (his idea of 07:52; his rulebook's Places 8). Pictures for him first.
Nothing of the game imports `src/art/floor3.ts`; where each piece stands, when it is laid and what it
does (what breaks, what blocks, what hurts, what a quest asks, when a moment plays) are the main
chat's, once he has said yes.

**State of this branch (`mockup/floor3-chained`):** from `mockup/floor2-headsman` at 590af58 (floor 2
as he said yes to it, its moment helpers exported). Made by THE ART CHAT, 10 Oct 2026; mended the
same day after the first fresh look (below). **Not yet seen by him.**

## His words

- 9 Oct, 22:47, his outline of the Crypt: "The next floor is the prisoner".
- By 07:41, offered four themes (floor 3, the Chained One: the prison): "Yes, start floor 1
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
- Of the boss himself (9 Oct, on `mockup/bosses`): his pick, "A starved giant, muzzled (Recommended)";
  for his sound, "Chains and a muffled roar (Recommended)".

## The theme

From the Chained One as he is painted (`src/art/bosses3.ts`, on `mockup/bosses`): grey skin over
bone, rags, an iron cage bolted over his face with the pink burning behind it; a chain from each
wrist, and from the ring at the back of his collar a chain to an iron ball he drags behind him. So:
THE PRISON THAT HELD HIM. Chains everywhere, great rings bolted to the walls, cuffs and balls, a cage
of bars, grooves gouged in the flags by a dragged ball, stone torn by his fingers and bars bent and
burst where he got out; empty bowls and an empty trough (he was starved); straw and rags; the
jailers' winches, goads, fire and kettle. It stands on the Crypt's third floor as he said yes to it
(`CRYPT_FLOORS[2]`: about a third of the floor earth, the walls' stones fallen to rough rock in
places). His marks are his MUZZLE-CAGE (his "muzzled", in his own pick: one shape wherever it is,
carved in the wall, laid in the floor, over his gate, on a skull on a hook, and torn off him for the
quest: an iron cage over his jaw, the shape of a jaw, up over his cheeks to just under his eyes and
narrower than his head, three bands across it with short uprights between them drawing in toward
the chin and set so that none crosses a band, rivets where they meet; dark iron over grey skin; held
on by leather straps round his head, one each side across the cheek with a buckle, one each side up
over the temple; his eyes deep under his brow above it, pink only over his own gate and in the dark of his
cell in the moments) and the ball and its chain. No carved words. The main chat lays a cell block on
each Crypt floor; these pieces dress it as his prison (`the cell grate` is a cell's barred front, the
wall's height, and the moment with the bars plays in one).

## What is in it (`chainedPieces()`, 50 pieces; `chainedMoments()`, 3)

- Wall tiles (9): bent bars (one straight, one bowed hard, one snapped off on a slant low over the sill), claw-torn stone, the feeding slot (a wooden bowl on its lip), the cage carved (his muzzled face in relief in a sunk field), the ball's crater (a shallow dented dish, cracks all round), the bowed wall (the wall's height: a crack up it, the courses beside it curving out), the torn-out ring (its plate wrenched half out and hanging by one bolt, the ring on it bent; a breach to one side; its heap of broken stone and the chain's snapped end as its `frames[0]`, drawn on the floor tile before it, before the wall), the chain port (a low iron-framed mouth at the wall's foot, its arch's edge lit, a heavy chain running into it), the cell grate (the wall's height: a cell's barred front, three thick bars, black inside).
- On the walls (9): rings and chains (the wall's height: the chains reach the floor), balls on a rack (three dark balls apart, a highlight each), fire basket (4 frames, with its light), goad and catch-pole (a long pale spike; a rope noose hanging open; pegs), empty bowls (seen from the side and a little above: three stacked, one apart with its spoon, each mouth an oval rim round the dark inside), rags on a nail (an old grey-brown rag hung by its corners on two nails, sagging, its hem torn), the wall winch (the wall's height: its chain runs up into the dark), the jailers' lamp (an iron lantern on a bracket, 4 frames, with its light), a skull in its cage (a small pale skull, the dark iron muzzle round its jaw, its leather straps, hung by them from a hook).
- Floor tiles (6): old straw (soft grey tufts and a trodden mat, no single stalks), ball grooves, the oubliette (a grate over a pit), the smashed flags, his muzzle in the floor (his mark, as floor 2's “the hood in the floor”; it was “the cage in the floor”), a ring in the floor.
- Traps (3): the trip chain (and sprung), the mantrap (two half-moon jaws of heavy iron laid open, bright tooth tips, a dark plate in the middle, springs either side, a chain to a peg; and shut), the ball hatch (a wall piece: one square iron hatch set off to one side of its face, so that the two faces of a corner never make a pair; no shutter over it; a ball sitting low on its sill).
- Breakables (4), each whole and then broken (`frames[1]`, what it leaves): straw bale (warm grey, its stalks lying along it, two twine bands), water jug, meal sack, box of irons.
- On the floor (6): a burst cuff, ball and chain, a snapped chain, a bowl kicked over (on its side, its dark mouth to us), his pallet (a flat straw mat, a rough grey blanket over half of it), a torn-out bar (straight, one sharp kink, a jagged broken lump of mortar on its end).
- Obstacles (9): the cage (four thick pointed bars to a side, its floor dark with soft tufts of straw, its door swung wide, the lock hanging open), the chain post, the feed trough (planks on trestle feet), the great winch, the jailers' kettle (4 frames, with its light), the anvil, a heap of chains, the stone bench (a dark slab on two blocks, leg-irons on it), the jailers' chest (the chest; closed and open).
- Doors and gates (3): the door (a cell door of iron plates riveted, a grille high in it, a great bolt), the gate (the ball and chain over it), the boss's gate (his muzzled face, his eyes his embers). As `Piece.gates`, made by `makeGateArt(theme, look)` (`chainedGates()`).
- Quest (1): the Chained One's face-cage: his muzzle-cage, open thin bars of dark iron with wide gaps in the jaw's shape of his mark, torn off him and lying on the floor, a band burst and an upright snapped, its leather straps torn, one long and trailing with its buckle.

Anchors, shadows (`Piece.shadow`), lights (`Sprite.lights`) and wall pieces' places (`Piece.spots`:
three each, low to high and across; never the same piece on two neighbouring tiles of a wall) are as
on floor 1 (docs/mockups/floor1/README.md).

## The moments (each at 30 frames a second; `before`, the frames, `after`)

`before` is what is there before it plays (a still), its first frame the moment's first; `after` what
is left, the moment's last frame. Swap the one for the other. `jolts` are the frames for the screen's
kick and the sound (the films show a kick of 3 of the game's pixels and back). The two in a wall have
`right`: the same for a face turned to screen-right (the same picture laid on that wall, in its
shade, the light still from the upper left).

- **The chains pull** (66 frames, 2.2 s; a wall piece's anchor; its frames reach a tile and a half
  along the wall, where it runs on past its tile to a chain port painted in the moment, and two tiles
  out into the room). Three heavy chains hang from great rings, slack down the stone and along its
  foot into the port's dark (`before`). It begins at once: the rings shudder and mortar trickles from
  frame 1, and from frame 3 his eyes open pink deep in the port, a matched pair, steady over the
  chains. At frame 8 (0.27 s, a jolt) all
  three are hauled: snatched up off the floor, links sliding away into the port, the rings wrenched
  long on their bolts, cracks running out round the plates, dust blasting out of the port; it lets
  them out a little; at frame 17 (0.57 s, a jolt) it hauls again, harder: taut and straight they
  thrum, the rings bent further, the cracks running on, the first plate tearing out, mortar pouring;
  at frame 26 (0.87 s, a jolt) it rips out: the plate and its ring and chunks of the wall flung out
  into the room, the chunks bouncing away toward the hero, the freed chain whipping out after its
  ring in an S across the floor and slapping down at frame 34 (1.13 s, a jolt), then lashing up
  off the floor and on toward the hero and slapping down again, as hard, at frame 41 (1.37 s, a
  jolt). Whatever pulled lets go: the eyes draw back into the hole over
  eight frames (gone by frame 34), smaller, nearer each other and dimmer; the
  other two drop slack, swing out and back and hang still, the dust sinks onto the floor and is gone
  by frame 65. What is left: the torn plate, ring and chain lying out across the floor, the hole and
  the cracks, the two chains hanging, their rings bent, the chunks. On the face turned to
  screen-right the port is on the other side of the rings, toward the eye (so that the chains run
  down to it there too).
- **The ball falls** (82 frames, 2.73 s; on the floor, anchored at the middle of a tall ragged heap
  of fallen masonry, painted in the moment, the ball's chain down its side to a block at its foot).
  Grit trickles from under the ball and a pebble breaks away at frame 2; it rocks out toward the edge
  and back, several pixels, and again further; at frame 14 (0.47 s) it lurches over the edge and
  drops clear of the heap the whole of its height, falling faster every frame, five stones of the heap's top tumbling after it,
  and smashes into the
  flags at frame 23 (0.77 s, a jolt): they crack out round it and their broken pieces jump, chips fly,
  dust bursts out low; it bounces high, clear of the dust, comes down again at frame 33 (1.10 s, a
  jolt) and bounces smaller, then rolls a long heavy way toward the hero, its chain (begun a
  shackle's length off the ball, so no link lies on its face) paying out until it goes taut, snatches the block off the heap's foot and drags it, and the
  ball rocks back on its chain and is still. What is left: the ball lying whole on the floor where it
  stopped, its chain taut to the dragged block, the smashed flags, the chips and stones. Painted in
  depth (floor 2's `Deep`), so the heap, the ball, its chain and the block hide each other as they
  should.
- **The bars shake** (66 frames, 2.2 s; a wall piece's anchor: `the cell grate` at its place (0,
  0); at its other places, shift the frames as the place shifts the piece). The cell's barred front,
  black inside (`before`). The bars tremble (frame 1); two pink eyes rise into the gaps high in the
  dark from frame 2, a matched pair; from frame 5 two huge pale grey hands come up out of the black
  and, by frame 10, close round the two outer bars: the back of each in the dark beside its bar, the
  wrist under it and the forearm going down and back into the black, four fingers curled round the
  front of the bar as one mass with one dark gap, the thumb wrapped across the bar's near side. Three heaves, each harder, at frames 11, 20 and 30 (0.37, 0.67 and 1.0 s, the jolts): the
  bars flex and spring, side to side and out into the room, the mortar cracking out from the
  grate's corners and along its jambs further each time, stones popping out of the jambs and
  bouncing away across the floor, dust blasting from the joints, his eyes narrowing; at the third
  the outer bar in his hand on the side the room is seen from bows right out of the grate, both its
  ends still fast, and the pin at its head (big and bright, smeared back along its arc as it flies)
  shoots out across the floor, glinting as it pings off the flags. He holds it, trembling; his fingers open (frame 40) and his
  hands slide down and back behind the sill, the forearms first (frames 41 to 52), never darkening
  in place; his eyes go back into it, smaller and dimmer and nearer each
  other (frames 44 to 53). What is left: the grate, a bar bowed out, the cracks, the stones and the
  pin on the floor. His eyes are the enemy's pink: the boss's own mark, seen nowhere else on the
  floor but over his gate and in the port.
- **The dust**, in all three: fewer, bigger clouds, each growing out of the point it is struck
  from over three frames, blowing out fast, hanging and spreading, then settling: sinking and
  flattening together over many frames (eight or more, longer the higher it hangs), easing in and
  out, never in one frame; then the low sheet slides on along the floor as it shrinks away as one
  over ten frames. Solid, shaded as a round thing is (its top lit, its belly dark), its lobes' edges
  scalloped and broken; no see-through checker. Painted under whatever moves, so that it never hides
  a blow.

## For the main chat, when he has said yes

- `src/art/floorkit.ts` and `tests/floor_checks.ts` as for floor 2; floor 2's moment helpers are
  imported from `src/art/floor2.ts`, not copied.
- The chains' moment needs a run of wall a tile and a half long, its own tile and the next along
  (on a face turned to screen-right the port is on the near side of the rings), and floor two tiles
  out from it; the bars' moment plays in a `cell grate`. The moments' frames are bigger than the
  pieces' own (line them up by the anchor), and each is cut down to what is painted in it.
- Painting all three moments takes about 5 s here, once; a phone several times that: worth painting
  ahead, or when the floor is first reached.
- His mark here is the muzzle-cage (his "A starved giant, muzzled"). The boss as painted on
  `mockup/bosses` wears a cage of bars over his whole face; if the mark is said yes to, the boss's
  own cage may want to match it, or the mark to be the boss's: the art chat's to put to him.

## Looks, and what was mended

The helper that made the floor had no way to start a fresh look; the art chat ran the first. What it
found, most serious first, and what was mended:

- Letters and symbols: the bent bars read as "DSI"/"DSK" (now three bars bowed the same way, one
  smooth curve each, and a snapped stub; nothing crosses); the bars moment ended on "I I K" (a new
  grate, no bar across: the bowed bar bows out, both its ends fast); his mark in the floor read as a
  cross over a tombstone, a helm, "TT", over the gate as "TT" or a monogram, and was drawn four ways
  (now one muzzle-cage everywhere, no stroke crossing another).
- Faces where none was meant: the crater on a corner as a skull's weeping eyes (shallow now, no pale
  streaks, cracks all round); the torn-out ring as an angry face with a beard, no ring (the ring
  hangs there now, the breach to one side); the mantrap as an eye or an @ (nothing round: two long
  toothed jaws and a square pan); the rags as hooded figures with an eye (a wide rag on two nails, no
  hole); the ball in flight as an eyeball (dark iron, one highlight, its pits faint, its lug raised
  and lit).
- Flesh-coloured bowls read as meat (brown wood now, with a rim and a dark inside); a pink eye smeared
  into a streak like a drip (no smear on the eyes now).
- Pieces that did not read, each redrawn as asked: balls on a rack, empty bowls, goad and
  catch-pole, the jailers' lamp, the chain port, the bowed wall, the cage carved, a skull in its
  cage, straw bale, a burst cuff, his pallet, a torn-out bar, the feed trough, the stone bench, the
  cage, ball grooves and the smashed flags (stronger), the ball hatch, the heap in the ball's moment.
- The moments, all a notch or two too low, and their dust a speckle: each rebuilt bigger (above), the
  dust new; the chains begin at once, slide into the port, bend their rings, rip, whip out at the
  hero; on the face turned to screen-right they had seemed to float (the port is now on their near
  side); the ball no longer sinks into the floor at the end; the bars are the wall's height, the
  hands huge and behind them, the eyes a pair.
- A one-pixel twitch of the whole picture every tenth frame of the films: it was in the films, not
  the frames (they were made at three screen pixels to two picture pixels, so where a cell fell
  decided which pixels doubled); the films are now made at an even scale.
- The room: its walls dressed on every tile (now a few strong pieces, plain wall between); the wall
  pieces' places barely differed in height (spread up the wall now: each piece's three about twenty
  pixels apart or more, where its tile allows).

The second fresh look (the art chat's) found the letters, the cross, the twitch and the sinking ball
mended, and asked for these, all done:

- The ball hatch on a corner read as a pair of staring eyes under brows: one hatch now, off to one
  side of its face (so the two faces never match), no shutter over it, the ball low on the sill.
- The straw in the cage read as scratched runes ("Л", "Ł", "7"): soft tufts and a mat now, in the
  cage and on the old straw tile; no single stalks.
- The dust collapsed in one frame from the air to a strip on the floor, then faded where it lay, and
  its checker read as netting: solid, sinking over many frames, sliding off as it shrinks (above).
- The hands darkened in place and did not read as hands: bigger, pale grey, a thumb across the
  bar's near side, a wrist and forearm into the dark, one gap between the fingers; they slide down
  and back behind the sill.
- His mark read as a grinning skull with square teeth: grey skin, the cage up over the cheeks and
  narrower than the head, its iron dark over the skin, leather straps round the head with buckles.
  The quest item read as a catcher's mask: open thin bars now, its leather straps and a buckle. The
  floor piece is renamed “his muzzle in the floor”.
- The mantrap was a grey zig-zag at a phone's size: half-moon jaws, bright tooth tips, a dark plate,
  a chain to a peg.
- The chains' eyes were one orange and one pink pixel, covered by links: a matched pink pair, bigger,
  steady (painted over the chains), drawing back into the hole at the end.
- The ball's chain-eye read as a pupil as it rolled: its first link now starts a shackle's length off
  the ball, a pale shackle between.
- Smaller: the bent bars all bowed like ")))" (one straight, one bowed hard, one snapped on a
  slant); the torn-out bar's knob read as a drumstick (a jagged lump); the bowls as loaves (oval
  rims); the chain port's arch lit.
- Raises (each moment half a notch to a notch low): the chains throw bigger chunks, harder, and the
  whipped chain slaps down twice, each a jolt; the ball lurches off the heap's edge and falls clear
  of it, five stones of the heap come down with it, and its first bounce is higher (its chain is
  longer, so that it still rolls a long way); the bars' flying pin is bigger and brighter, smeared
  along its arc, with a bigger glint at each ping.

Not done: the ball goes off the heap's near edge, not its far one (it falls clear, but toward the
hero, as the heap is drawn); the bars' pin is still small at a phone's size (two or three of the
game's pixels); the stones from the jambs are as they were.

## The checks (`tests/floor3.test.ts`, 21)

Every check floor 2 went through, by `floorChecks` (Places 7; Pixels 1, crisp, no loose pixels;
Colour 3; Colour 4; Pixels 4; Pixels 7; his notes: every wall piece in three places, low to high and
across, within its tile, nothing in the fade, no band of the wall holding more than a third; the
moments crisp, 30 a second, nothing popping in or out at the start, the end or the middle, nothing
jumping, always moving, no speckle). Its own: the dust grows out of where it is struck over three
frames, blows out fast and slows, spreads, sinks onto the floor flat over many frames (never
dropping or flattening at once), and slides on as it shrinks away as one; the
chains begin at once with his eyes in the port, are snatched up at the first haul, the torn ring is
thrown far out toward the hero and strikes hard, bounces and strikes again (two jolts), the other two drop and swing, the
chunks fly and lie still; the ball rocks, falls far and faster every frame, strikes hard, bounces
high, rolls a long way toward the hero, drags its block, rocks back and lies whole on the floor, the
flags jump and land, stones tumble after it; the bars are the wall's height, jump at every heave and
shake to and fro, the hands come and go bit by bit and slide down as they go, the eyes are a
matched pair at every heave and go over frames, the bar bows out, the pin is shot far and bounces
and lies still, the stones pop on the heaves; and in both faces.

## Pictures (not in the repository)

`node tools/preview.mjs src/dev/preview_floor3.ts <out.png> 6000 6000 "sheet:4"` (every piece by
kind), `"spots:4"` (every wall piece at its three places), `"room:4"` (a room laid with them),
`"close:6:<n>"` (eight pieces close, n the eighth of the set), `"only:6:<name>|<name>"` (the pieces
named, each on its corner of wall or its floor), `"moment:2:<n>"` (n: 0 the chains, 3 the chains in
the other face, 1 the ball, 2 the bars, 4 the bars in the other face; every frame in a grid, the page
logs the grid; page 8000 x 8000), `"strip:4:<n>"`. Use an even scale (2, 4, 6): at an odd one a
picture pixel is not a whole number of screen pixels and the films twitch. The page must be bigger
than the picture.
