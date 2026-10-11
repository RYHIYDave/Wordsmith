# Mock-up: the stairwell opens, on every floor of the Crypt as its boss dies (NOT IN THE GAME)

**What it is.** The moment the way down opens: one moment, played on every floor of the Crypt as the
floor's boss dies, in that floor's own stone and earth, either way down. It breaks the game's own floor
where the stairwell will be and ends on the stairwell as he said yes to it (`makeStairwell`,
art/crypt_ways.ts, unchanged), to the pixel. It replaces the main chat's placeholder (the game's slam
burst and a shake). Nothing of the game imports `src/art/stairwell_open.ts`; when it plays, where, and
what the game does round it are the main chat's, once he has said yes.

**State of this branch (`mockup/floor3-4`):** the third cut, after the second fresh look (a real step up;
the dust tower read as a figure, the dust as clay, the stones popped), on top of the second cut (after the
first fresh look: at least a notch too low, with a hard pop), on top of 774da64 (floors 3 and 4 brought in; their files
are untouched here). Made for THE ART CHAT, 10 Oct 2026. **Not yet seen by him.**

## His words

- His outline, 9 Oct 2026, 22:47 (in the main chat), the part that is this: "kill the warden and find
  a stairwell leading down.  At the bottom of the stairs is Crypt floor 2."
- 10 Oct, by 07:29, asked "The stairwell, the waypoint and the town's gate: good to build as shown?":
  "Yes, as shown (Recommended)".
- 07:47: "Put in the ruleset that I want animations as big and wild and kinetic and weighty as
  possible.  I’d rather it be a notch too high than a notch too low." 07:53: "And I want all
  animations checked against this statement before I see them." (Animations 1.)
- His note on floor 1's first pictures, kept here because it is this moment's rule too: "And the rats
  just kind of disappear.  Animations need run the checks."
- (Not his: the main chat to the art chat, 10 Oct, 11:20, of its placeholder: "the stairwell's
  opening is the game's 'slam' burst (stone and dust) and a shake. He was told its real moment would
  be yours, big and wild by his rule.")

## The last look before he sees it, and what was mended

- **A round puff like an eye** (frames 13 to 21, the far end): the puffs before the great burst were
  being drawn as sheets (a smooth disc with a see-through ring, a bullseye). Only the dust after the
  great burst is drawn as sheets now; before it every puff is lumpy and thins away broken.
- **A thin upright stick beside the column:** the streamers (runs of small billows) are gone; the jet's
  torn top flings its pieces out instead.
- **A possible figure at the column's top:** the jet's highest billows are now at very different
  heights and sizes, flung further, so the top is ragged and lopsided.
- **The burst frame's dark splinters:** the new sheet was being hidden by the fissure's pixels (lying
  at the floor's own height); a sheet is now hidden only by what stands above the floor.
- **The stones (mended in the round after):** all twelve kept. None darkens, goes see-through or
  thins away: each is drawn whole in its own tones, and only cut off by the floor's plane. Each comes
  up out of the hole through that plane (the first frame its top third, then more each frame), and
  goes back down into the hole the same way: about a fifth of it a frame through the plane (a whole
  stone, then three quarters, a half, a third), and is gone when a third of it or less is left. A stone
  thrown out over the floor strikes it once (a bounce and a puff) and is sent back into the hole. They
  are thrown harder and fall faster than before, so all of them have gone into the hole by about 30
  frames after the burst, while the heap of dust still stands over the hole; the code counts any frame
  a stone goes down with no dust standing over it there, and the tests want none, so the kerb and the
  steps never come in front of a stone. Left to judge by eye: a stone's last frame is its top third
  or so, a flat cap; on the small dark clods of floor 4 that last cap is only a few game pixels.
- **The faint dotted line along the joints on frames 1 and 2:** the top row of each flagstone's side
  peeked over the floor beside it; its sides now start a hair lower.

## The art chat's own look at the third cut, and what was mended

- **The ground dust broke into worms** as its sheets thinned: the holes left long grey squiggles, "S"
  and "2" shapes and rings. Now the dust low on the floor (each pixel's dust whose billow lies under 26
  picture pixels up) is drawn as broad sheets: its thickness is smoothed wide (so no gap between two
  billows opens into a slit or a ring), it is flat, lit along its far rim and shaded along its near
  one, and it thins by going see-through: where it is thin it is drawn a step of the way toward the
  floor's own colour under it, and its edge draws in evenly, as smooth lobes, from the outside in. Any
  gap of fewer than 260 pixels inside a sheet is closed, so the only openings are a few big round ones
  well inside. A sheet lies on the floor and only what stands on it hides it. The plume and the rest
  are as they were. Only the dust that is not see-through counts as hiding what is under it (for the
  fissure going and the pit becoming the stairwell).
- (The dev page now lays the floor out over the whole of each cell, so that the see-through sheets far
  out are seen over the floor, as in the game.)

## The second fresh look, and what the third cut does about it

(The art chat's rulings on what the second fresh look found, in brief; not his words.)

- **A. The dust tower formed a figure** (a hooded head on shoulders on way x, a snowman on way y), and
  the same one on every floor. (No streamers since the last look: see above.) The burst now opens with a jet that shoots up about five heroes high in
  three or four frames, leans (a different way on each floor and each way down), and tears apart at the
  top, its highest billows flung apart and thinning where they hang. Every billow of the burst is placed
  by the floor's own seed, so no two floors, nor the two ways, make the same shape. The flat cap is gone.
- **B. The dust read as solid clay.** Each billow now has a thickness. Where the dust is thin its edge
  breaks up and holes open in it, in blocks of two pixels and more (clumped, drifting slowly, stretched
  along the floor), and as it thins away the holes grow until it is gone. Scraps under eight pixels are
  never left, so there is no speck and no checkerboard. Floor 4's lit and dark dust tones are browner
  (108, 98, 95 and 70, 60, 66), its body still the plum (91, 77, 103).
- **C. The stones popped.** There are now twelve, of mixed sizes (11 to 18 picture pixels), thrown a
  frame or more apart at different speeds: some high, well over a hero's head; some in arcs out over
  the kerb; some skipping low across the floor past the kerb, each strike on the floor a bounce and a
  small puff. Over earth they are clods and rock. (How each comes up out of the hole and goes back
  into it was redone after the last look: see "The stones" above.)
- **D. The fissure's jets stood as pillars.** They now lean out from the opening, and each one's
  billows spray apart as they rise and thin.
- **E. The early fissure puffs read as pebbles.** They are now wisps: thin, low and long, curling off
  along the floor, broken where they are thin.
- **F. Blink-outs.** Nothing shrinks to a dab and vanishes now: everything thins away (the plume with holes opening; the sheets on the floor see-through, as above).
- **G. The dotted outline on frame 1.** The flagstones now cover a hair past their edges, so lying in
  place they cover every pixel of the floor over the pit; nothing outlines the opening before the
  fissure runs round it.
- **H. Floor 4's ghost tile grid.** An earth slab's clods now meet on ragged lines across the slab, with
  a lit lip on the far side and dark in the crack, not on straight lines along the tiles' joints. The
  slabs themselves still break loose on the floor's joints (a lift of the earth along a joint shows as
  a straight gap; see "Left" below).
- **Raises.** The jet (above). An aftershock half a second after the burst: a jolt (kick 4) and a
  second puff up out of the hole.
- **How the fissure and the pit go, now that the dust has holes.** Pixel by pixel: each pixel of the
  fissure goes at the first frame the dust is over it, and each pixel of the pit becomes the stairwell
  at the first frame the dust is over it (painted either way) with no stone there. The code refuses to
  make the moment if any pixel is never covered.
- **Left:** lit lips on the tipping stone slabs and grit trickling from the plume were not done (still not, after the art chat's look); the
  earth still breaks loose on the tiles' joints between slabs (only the clods inside a slab are
  ragged); painting a moment now takes 7 to 10 s here.

## The first fresh look's ten points, and what the second cut does about each

(The art chat's rulings on what the fresh look found, in brief; not his words.)

1. **The hard swap at frames 8 to 9.** The floor over the opening is now the game's own floor, painted
   from the theme's ground tiles at the tile the moment is told (`at`), earth where the floor is earth.
   Before anything moves it is the floor to the pixel (a test holds it: at least 85% of the first
   frame's pixels are the floor's; the rest are the fissure and its first dust). Its flagstones break
   loose on the floor's own joints. The kerb is not there until the pit becomes the stairwell, and that
   happens under the great burst's dust: the code finds the first frame at which every pixel that
   changes is under the dust that frame and the next, and refuses to make the moment otherwise. The
   fissure goes the same way, under the skirt.
2. **Slabs the size of floor tiles, drawn as the floor.** Each flagstone is one of the floor's own (1.6
   to a tile; slivers under 0.22 of a tile kept with their neighbours). Its top is the floor's own
   pixels, lit as it turns to the light, and its broken sides and underside are drawn, 7 picture pixels
   thick, dark. Each tips on its uphill edge over 5 frames (an earth one's clods over 3), as far as 1.3 radians (its top swinging
   toward the eye; less far for one that would otherwise go under its downhill neighbour too fast to be
   seen), then drops and darkens into the hole. It is a ripple down the steps: one tips every 2 or 3
   frames, closer together where the joints cut more of them, so the ripple never lasts more than 18
   frames. Each strikes the bottom out of sight, with its own jolt and a spurt of dust up out of the
   pit. The first tips 2 frames after the heave, so there is no wait.
3. **Cracks.** One fissure bursts open at the middle of the opening's near side on the shock and races
   round the outline both ways. It is jagged, opens narrow and gapes wider a frame after its front has
   passed, and its far lip is lit. Four forks run out from it into the floor. Where the floor is earth it
   crumbles: wider, ragged, with dirt spilling into it. No mesh.
4. **Order.** As each flagstone drops, dust wells up through the gap it leaves and hangs there, so the
   pit is never seen standing open. The last flagstone striking the bottom is the great burst, on the
   same frame.
5. **Dust.** All the billows are painted together as one mass:
   - where billows meet they join;
   - the surface is lit from the upper left as it turns: tops lit, bellies and the creases between
     lobes dark, the higher parts lighter;
   - whatever is nearer the eye hides it (the floor in front of the pit hides dust still down in it);
   - no speckle: rims are smooth lobes, and a lone pixel is never left.

   The great burst has four parts:
   - a heap over the whole opening;
   - a skirt rushing out low over the floor from all round the kerb, fast and slow billows together, so
     that it covers the floor from the kerb out to its front, two to three tiles past where one stands
     beside the opening (from the anchor, 240 picture pixels to the left and 260 to the right);
   - a plume of billows of every size up out of the hole, 160 picture pixels (80 of the game's) above
     the opening's corner at its height;
   - five streamers, each a run of billows thrown together that draws out behind its head.

   It hangs, spreads and drifts. Then the plume slumps, never faster than it rose, and everything low
   spreads into sheets on the floor and thins: the outer edge of the skirt first, the heap over the
   stairwell last, so the stairwell comes out of it. Floor 4's dust has the plum-mauve (91, 77, 103) as
   its body, with darker and browner tones round it and no pink (tested).
6. **Chips.** Seven real stones, 12 to 16 picture pixels across (6 to 8 of the game's). Each is rounded,
   with a lit face, its body, its shade and a dark edge, in the floor's own stone (clods and rock where
   the floor is earth). They are thrown up out of the hole in arcs onto the floor beyond the far kerb or
   the top of the steps, bounce back over the rim and drop into the hole, seen going down into the dark
   over three frames or more. No rain, no tadpoles.
7. **Shake.** A jolt at the shock, at the heave, at every flagstone striking the bottom (8 to 15 of them,
   as the joints cut them; two striking on one frame share a jolt) and at the great burst, each with its
   own kick (listed below).
8. **Floor 4's earth breaks.** Earth slabs crumble into four clods each, their crumbling edges lit and
   the cracks between them dark, tumbling as they fall. The fissure crumbles, four of the seven stones
   are clods and rock, and the dust is the floor's earth-plum.
9. **Length.** 3.33 to 3.47 seconds (100 to 104 frames), depending on how the joints fall (checked at
   128 places on the four floors, both ways; after the third cut, 3.27 to 3.47 s at the 41 places checked).
10. **makeStairwell is unchanged**, and the last frame is its picture to the pixel. **For later:** way y
   (down to the lower left) reads weakly as steps in makeStairwell's own picture; it is not touched here.

## The moment (`stairwellOpens(theme, way, at)`; 30 a second)

The arguments and what it gives back:

- `theme`: one of `CRYPT_FLOORS` (any floor theme works).
- `way`: `'x'` (down toward +x, the lower right) or `'y'` (+y, the lower left).
- `at`: the tile the stairwell's anchor (the corner of the opening up the screen) is on, in whole tiles.
  The floor's pattern repeats every ten tiles, so the moment is made once for each place in ten and
  then kept.
- `before`: none. Nothing of it is drawn before it plays: the floor is the game's own, and its first
  frame is empty.
- `after`: `[makeStairwell(theme, way)]`, which its last frame matches to the pixel.
- `holds`: none.
- `tracks`: each flagstone (`a flagstone` or `a slab of earth`, with the order it goes in) and each stone
  (`a stone thrown`).
- `stairwellNotes(m)`: its frames (the great burst, when the fissure goes, when the pit becomes the
  stairwell, when each flagstone tips and strikes) and the kick for each jolt. `stairwellKicks(m)`: the
  kicks alone.

As an example, floor 1, way x, at (0, 0) runs as below. The frames move by a frame or two with the
joints.

- **The shock** (frame 1, a jolt): the fissure bursts open and races round the opening (frames 1 to 7),
  dust puffing up at its fronts; the forks run out behind it. **The floor shudders** on its joints from
  frame 4, each stone its own way (the smaller the stone, the less).
- **The heave** (frame 10, 0.33 s, a jolt): the floor inside the fissure is thrown up 3 to 4 picture
  pixels, drops back loose and rattles. Six jets of dust burst up through its joints, and puffs spill
  out of the fissure.
- **The floor goes** (frames 12 to 37): the ripple described in point 2. The flagstones tip at 12, 14,
  17, 19, 22, 24, 27 and 29, and strike at 21, 22, 25, 28, 31, 32, 35 and 37.
- **The great burst** (frame 37, 1.23 s, the biggest jolt): the jet shoots up and tears apart at the
  top (A above), with the heap, skirt, plume and streamers of point 5.
  - The stones come up out of the pit from this frame to frame 41, and all have gone back into it by
    frame 64 or so (floor 1, way x).
  - The last of the fissure goes under the dust by frame 40.
  - The aftershock: frame 52 (a jolt, kick 4, and a second puff from the hole).
  - The pit starts to become the stairwell, pixel by pixel under the dust, at frame 55.
- **It settles** over the last second: the skirt's sheets thin away first, then the slumped plume's,
  then the heap over the stairwell. The last frame, frame 98 of 99 (3.30 s), is the stairwell.

## For the main chat, when he has said yes

- **Line it up by the anchor.** Every frame is anchored at makeStairwell's anchor, and each is cut to
  what is painted in it (the biggest is 488 x 384 picture pixels). Draw each frame by its anchor, as a
  sprite is drawn.
- **Tell it the tile.** The floor it breaks is the game's floor at `at`, so `at` must be the tile the
  stairwell's anchor is on, or its first frames will not match the floor round them.
- **Swap at the ends.** Draw nothing of it before it plays. Play its frames from the boss's death, with
  whatever stood on the opening put to one side of it. After its last frame, draw the stairwell as now.
- **Draw it in depth while it plays,** at the opening's middle, as standing things are drawn: a hero in
  front of it is drawn over it, a hero behind it under it. Do not draw it flat under everything, as the
  stairwell is drawn. The skirt runs out past a hero standing by the opening, so drawn this way it goes
  over a hero behind the opening's middle and under one in front. Drawing the skirt separately from the
  rest would let it lie under everyone; that is for the main chat to judge in the game.
- **The screen's kick at each jolt**, in the game's pixels, down and back (the dev page draws them so):
  - the shock: 4, dying away in 4 frames, then a tremor of a pixel every frame until the heave;
  - the heave: 6, dying away in 4 frames;
  - each flagstone striking the bottom: 3 for the first, rising to 6 for the last but one, each dying
    away in 4 frames;
  - the great burst: 10, dying away over 15 frames (half a second);
  - the aftershock, 15 frames after the burst: 4, dying away in 4 frames.

  The jolts are also the frames to hang a sound on.
- **Paint it ahead of time.** It takes 7 to 10 s to paint each moment here (tsx), and a phone takes
  several times that. Paint the floor's one (its way, its tile) when the floor is first reached, or
  while the boss fight goes on, never at the death.
- **What it shares with makeStairwell.** It holds a copy of makeStairwell's painter that takes the
  kerb's height and whether the steps are there. For each pixel, the copy keeps how high in the world
  the thing it shows is, so that what falls into the hole is hidden by what is nearer the eye. The tests
  hold the copy to makeStairwell's picture, to the pixel.

## The checks (`tests/stairwell_open.test.ts`, 102)

Nine moments are checked:

- floors 1 to 3, both ways, at (0, 0);
- floor 4, both ways, where the floor under the opening is mostly earth;
- floor 1 where the joints cut fifteen flagstones, slivers among them.

One test checks how long the nine take to paint, and that each is kept. For each moment the tests check:

- **Its ends:** nothing before it; its first frame empty; its last frame makeStairwell's picture, to
  the pixel. Before anything moves, the floor over the opening is the game's floor at its tile.
- **How it is made:** crisp; 30 a second; 3 to 3.5 s long; no cyan and no pink; two picture pixels to a
  game pixel.
- **The moments' checks** that every floor's moments go through (as tests/floor_checks.ts has them):
  nothing jumps; nothing pops in or out except on a jolt; the painted pixels change by at most 45% a
  frame except on a jolt; at least 4 pixels change every frame; never more than 4 loose pixels in a
  frame.
- **The jolts and kicks:** the shock 4; the heave 6; each flagstone 3 to 6, on the frame it strikes;
  the great burst 10, the biggest, on the frame the last flagstone strikes; the aftershock 4, 15 frames
  after it.
- **The ripple:** on average one flagstone strikes every 1 to 3 frames, never more than 4 apart; the
  first strikes by frame 24; one is already on its way within 8 frames of the heave.
- **Each flagstone:** it tips for 3 frames or more, is seen as it starts, and goes from sight on the
  frame it strikes; they go in their order.
- **The burst:** the dust is 150 picture pixels high or more within 20 frames of the burst; the skirt
  is out 150 to each side within 15 frames, half of that within 5.
- **The settling:** measured at the top of the dust's body (the row above which lie 6% of its pixels,
  not a torn scrap thinning away above it): it hangs 3 frames or more; it never comes down faster than
  it went up; it is under half its height within 40 frames; it thins over the last second; and over
  the last six frames no more than 3200 pixels change in a frame, the last frame the stairwell.
- **The swaps:** the last of the fissure goes after the burst; the stairwell starts to come 18 frames
  or more after it (each pixel under the dust: the code refuses otherwise).
- **The stones:** twelve of them, 10 to 18 picture pixels across, thrown within 4 frames of the burst,
  none there whole at first (each comes up out of the pit); two or more go up 50 pixels or more (over a hero's head); each
  goes into the hole over 3 frames or more, its last frame showing between 15% and 35% of it, and is
  gone before the end; and no stone goes down into the hole on a frame with no dust standing over it
  there.
- **Floor 4 only:** the earth breaks into clods; there is earth among the stones; the dust's plum body
  is there in quantity, and nothing is pinkish.

## Pictures (not in the repository)

The dev page makes them:

`node tools/preview.mjs src/dev/preview_stairwell_open.ts <out.png> 5800 6720 "moment:2:<n>"`

Here n is (floor - 1) x 2, plus 1 for the way to the lower left. This mode draws every frame in a grid
on a patch of that floor, with the warrior beside it and the screen's kick drawn. The page logs the grid
for the film maker. Floor 4's anchor is put where the floor under the opening is mostly earth.

The other modes, in place of `"moment:2:<n>"`:

- `"strip:2:<n>"`: sixteen frames and every jolt.
- `"tall:2:<n>:<a>-<b>"`: frames a to b, or a list "a,b,c".
- `"close:6:<n>:<a>-<b>"`: frames a to b, close up.
- `"still:8:<n>:<f>"`: one frame.

The page must be bigger than the picture.
