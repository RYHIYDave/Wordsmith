# Mock-up: the Chained One's floor, the Crypt's third floor themed after its boss (NOT IN THE GAME)

**What it is.** Floor 3's own set of pieces, by his rule of 10 Oct (his art rulebook, Places 7: each
floor themed after its boss, between 40 and 50 pieces made for it alone), and three moments that
play around the hero there (his idea of 07:52; his rulebook's Places 8). Pictures for him first.
Nothing of the game imports `src/art/floor3.ts`; where each piece stands, when it is laid and what it
does (what breaks, what blocks, what hurts, what a quest asks, when a moment plays) are the main
chat's, once he has said yes.

**State of this branch (`mockup/floor3-chained`):** from `mockup/floor2-headsman` at 590af58 (floor 2
as he said yes to it, its moment helpers exported). Made by THE ART CHAT, 10 Oct 2026. **Not yet seen
by him.**

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
places). His marks are his iron face-cage (his long head, the band across his brow, four bars bowed
down over his face, the strap over his crown, his eyes behind the bars: pink only over his own gate)
and the ball and its chain. No carved words. The main chat lays a cell block on each Crypt floor;
these pieces dress it as his prison (`the cell window` is a cell's barred window, and the moment
with the bars plays in one).

## What is in it (`chainedPieces()`, 50 pieces; `chainedMoments()`, 3)

- Wall tiles (9): bent bars, claw-torn stone, the feeding slot, the cage carved (his caged face in relief), the ball's crater, the bowed wall (the wall's height), the torn-out ring (its heap of broken stone, the ring and its chain: its `frames[0]`, drawn on the floor tile before it, before the wall), the chain port (a low iron-framed mouth at the wall's foot), the cell window.
- On the walls (9): rings and chains (the wall's height: the chains reach the floor), balls on a rack, fire basket (4 frames, with its light), goad and catch-pole, empty bowls, rags on a nail, the wall winch (the wall's height: its chain runs up into the dark), the jailers' lamp (4 frames, with its light), a skull in its cage.
- Floor tiles (6): old straw, ball grooves, the oubliette (a grate over a pit), the smashed flags, the cage in the floor (his mark), a ring in the floor.
- Traps (3): the trip chain (and sprung), the mantrap (and shut), the ball hatch (a wall piece).
- Breakables (4), each whole and then broken (`frames[1]`, what it leaves): straw bale, water jug, meal sack, box of irons.
- On the floor (6): a burst cuff, ball and chain, a snapped chain, a bowl kicked over, his pallet, a torn-out bar.
- Obstacles (9): the cage (taller than a man, its door torn half off), the chain post, the feed trough, the great winch, the jailers' kettle (4 frames, with its light), the anvil, a heap of chains, the stone bench, the jailers' chest (the chest; closed and open).
- Doors and gates (3): the door (a cell door of iron plates riveted, a grille high in it, a great bolt), the gate (the ball and chain over it), the boss's gate (his caged face, his eyes his embers behind the bars). As `Piece.gates`, made by `makeGateArt(theme, look)` (`chainedGates()`).
- Quest (1): the Chained One's face-cage, torn off him and lying tipped on its side.

Anchors, shadows (`Piece.shadow`), lights (`Sprite.lights`) and wall pieces' places (`Piece.spots`:
three each, low to high and across; never the same piece on two neighbouring tiles of a wall) are as
on floor 1 (docs/mockups/floor1/README.md).

## The moments (each at 30 frames a second; `before`, the frames, `after`)

`before` is what is there before it plays (a still), its first frame the moment's first; `after` what
is left, the moment's last frame. Swap the one for the other. `jolts` are the frames for the screen's
kick and the sound (the films show a kick of 3 of the game's pixels and back). The two in a wall have
`right`: the same for a face turned to screen-right (the same picture laid on that wall, in its
shade, the light still from the upper left).

- **The chains pull** (57 frames, 1.9 s; a wall piece's anchor; its frames reach a tile and a half
  along the wall: it plays where the wall runs on past its tile to a chain port of its own, painted in
  the moment). Three heavy chains hang from great rings, slack down the stone and along its foot into
  the port's dark (`before`). They creep toward it (from frame 1); at frame 9 (0.3 s) all three are
  hauled at once, snatched up off the floor and snapped taut against the stone at frame 12 (0.4 s,
  a jolt), dust bursting off the wall all along them, the rings jerking on their plates; they strain
  and thrum; it heaves again at frame 21 (0.7 s, a jolt), the stone cracking round the first ring's
  plate; at frame 29 (0.97 s, a jolt) that ring rips out of the wall, chips and dust flying, and its
  chain whips out across the room and slams down onto the floor at frame 37 (1.23 s, a jolt), the
  ring and the links by it bouncing; whatever pulled lets go, and the other two drop slack, swing out
  into the room and back against the stone, and hang still. What is left: the torn-out ring and its
  chain on the floor, the hole and the cracks it left, the two chains hanging. Worked out as a
  chain of points (Verlet's way, as the boss's own chains: `Rope`), so they hang, snap, whip and
  swing with weight.
- **The ball falls** (73 frames, 2.43 s; on the floor, anchored at the middle of a heap of fallen
  stone, painted in the moment, the ball's chain down its side). Grit sifts from under the ball; a
  pebble breaks away at frame 2 and tumbles down; the ball creaks out toward the edge and back, and
  again further; at frame 14 (0.47 s) it rolls off, drops, falling faster every frame, and smashes
  into the flags at frame 20 (0.67 s, a jolt): the flags crack out round it, chips fly and bounce,
  dust bursts out low across the floor; it bounces and strikes again at frame 26 (0.87 s, a jolt), its
  chain snatched off the heap after it, and rolls on toward the hero, turning over, dragging its chain,
  and stops hard (a heavy thing stops soon). What is left: the ball where it stopped, its chain
  trailing back, the cracked flags, the chips. Painted in depth (floor 2's `Deep`), so the heap, the
  ball and its chain hide each other as they should; the ball's pits roll round with it.
- **The bars shake** (57 frames, 1.9 s; a wall piece's anchor: `the cell window` at its place (0, 0);
  at its other places, shift the frames as the place shifts the piece). The barred window, dark
  inside (`before`). The bars tremble (frame 1); two great grey hands come out of the dark (frames 3
  to 7) and close round the two outer bars; two pink eyes open high in the dark between them (frame
  8). Three heaves, each harder, at frames 11, 20 and 30 (0.37, 0.67 and 1.0 s, the jolts): the bars
  wrenched in and out and side to side, a smear behind them, rust and grit showering off, dust
  bursting from the stone's joints round the window, chips of mortar flung out, the stone cracking out
  from the window's corners further each time, his eyes flaring; at the third, a bar bends out of the
  window into the room and its rivet pops and flies, bouncing across the floor. He holds it,
  trembling; his fingers slide off (frame 40) and his hands sink back into the dark (frames 42 to 50);
  his eyes go back into it after them, nearer each other, smaller and dimmer (frames 45 to 53). What
  is left: the window, its bar bent out, the cracks, the rivet on the floor. His eyes are the enemy's
  pink burning to gold: the boss's own mark, seen nowhere else on the floor but over his gate.

## For the main chat, when he has said yes

- `src/art/floorkit.ts` and `tests/floor_checks.ts` as for floor 2; floor 2's moment helpers are
  imported from `src/art/floor2.ts`, not copied.
- The chains' moment needs a run of wall a tile and a half long (its own tile and the next along);
  the bars' moment plays in a `cell window`. The moments' frames are bigger than the pieces' own (line
  them up by the anchor), and each is cut down to what is painted in it.
- Painting all three moments takes about 2 s here, once; a phone several times that: worth painting
  ahead, or when the floor is first reached.

## Looks, and what was mended

The brief asks for two looks by a fresh pair of eyes. **This helper had no way to start one** (no
subagent tool here), so those two looks are still to be had: the art chat's to run, with the
pictures below. What the maker's own looks found and mended, piece by piece and frame by frame at the
game's size and close: a collar on a peg read as a basin (replaced by balls on a rack); his caged face
in the wall read as a barred window, then as a birdcage (now a head in relief, the iron over it,
eyes and a mouth's slit behind the bars); claw marks read as the letter M (now four slanting grooves
apart from each other); a snare's loop with its tail risked reading as a symbol (replaced by a trip
chain); a ring in the floor with its chain's end read as a Q (no tail now); the smashed flags read as
a spider (now broken pieces along fine cracks); a chain post's chains read as an octopus (one chain,
wound round its foot); the chains on the wall's plates read as skulls (dark plates, rings hanging
clear); the balls on the rack and the wall's carved face were too pale (now quieter); bars bowed
together read as a K (bowed the other way); a split ball read as two eyes (dropped); the quest's
cage, lying, read as an E (now tipped on its side and seen round, as a cage). In the moments: dust
sat like wool (now it bursts out fast and falls); the torn chain shot into the port in three frames
(the chain's way per small step was a frame's: mended), then flew so long it landed out of sight
(now it whips out and slams down within eight frames); the ball rolled on for two seconds (it now
stops hard); the hands on the bars read as a grey column (now on the outer bars, the eyes between);
the shaking read too small at the game's size (bigger heaves, smears, chips, cracks spreading).
Things still uncertain, for the fresh eyes: whether his face-cage marks (carved, in the floor, over
the gates, the quest) read as a muzzled face or as a helmet or mask; whether the ball and chain over
the gate reads at its size; whether the hands gripping the bars read as hands; the mantrap open read
as a toothed ring.

## The checks (`tests/floor3.test.ts`, 20)

Every check floor 2 went through, by `floorChecks` (Places 7; Pixels 1, crisp, no loose pixels;
Colour 3; Colour 4; Pixels 4; Pixels 7; his notes: every wall piece in three places, low to high and
across, within its tile, nothing in the fade, no band of the wall holding more than a third; the
moments crisp, 30 a second, nothing popping in or out at the start, the end or the middle, nothing
jumping, always moving, no speckle). Its own: the chains are snatched up fast and taut together, the
torn ring flies far and strikes hard and bounces, the other two drop and swing, chips born as it rips
and lying still, dust flying wide; the ball falls a long way faster every frame, strikes on a jolt,
bounces well above its path, rolls on toward the hero and stops, its chain dragged, chips born on the
blow, the pebble first; the bars jump three pixels and more at every heave and shake to and fro, the
hands come and go bit by bit, his eyes burn at every heave and go back into the dark over frames, the
bar bends out, the rivet pops on the last heave, flies far, bounces and lies still; and in both faces.

## Pictures (not in the repository)

`node tools/preview.mjs src/dev/preview_floor3.ts <out.png> 6000 6000 "sheet:3"` (every piece by
kind), `"spots:3"` (every wall piece at its three places), `"room:3"` (a room laid with them),
`"close:6:<n>"` (eight pieces close, n the eighth of the set), `"moment:3:<n>"` (n: 0 the chains, 3
the chains in the other face, 1 the ball, 2 the bars, 4 the bars in the other face; every frame in a
grid, the page logs the grid), `"strip:4:<n>"`. The page must be bigger than the picture.
