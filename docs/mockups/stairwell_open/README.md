# Mock-up: the stairwell opens, on every floor of the Crypt as its boss dies (NOT IN THE GAME)

**What it is.** The moment the way down opens: one moment, played on every floor of the Crypt as the
floor's boss dies, in that floor's own stone and earth, either way down. It ends on the stairwell as
he said yes to it (`makeStairwell`, art/crypt_ways.ts), to the pixel. It replaces the main chat's
placeholder (the game's slam burst and a shake). Nothing of the game imports
`src/art/stairwell_open.ts`; when it plays, where, and what the game does round it are the main
chat's, once he has said yes.

**State of this branch (`mockup/floor3-4`):** from 590af58 (floor 2 as he said yes to it, its moment
helpers exported). Made for THE ART CHAT, 10 Oct 2026. **Not yet seen by him.**

## His words

- His outline, 9 Oct 2026, 22:47 (in the main chat), the part that is this: "kill the warden and find
  a stairwell leading down.  At the bottom of the stairs is Crypt floor 2."
- 10 Oct, by 07:29, asked "The stairwell, the waypoint and the town's gate: good to build as shown?":
  "Yes, as shown (Recommended)".
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
- (Not his: the main chat to the art chat, 10 Oct, 11:20, of its placeholder: "the stairwell's
  opening is the game's 'slam' burst (stone and dust) and a shake. He was told its real moment would
  be yours, big and wild by his rule.")

## What it is, read from that

The floor over the stairwell is a lid of flagstones, and the boss's death breaks it: the floor
shudders, cracks race out from the middle along the lines of the slabs to the opening's outline and
round the kerb's, the kerb shoves up out of the floor round three sides, and the slabs go one after
another down the line of the steps, each tipping, falling and slamming onto the steps below and
shooting on down them into the dark under the floor; with the last and deepest slam a column of dust
blows up out of the hole, three heroes high, chips and stones flung up out of it; the dust falls fast
and thins away, the chips rain back into the hole, and the stairwell is there, the steps going down
into the dark, the kerb round it. On the deeper floors some of the lid is earth, as the floor round it
is (none on floor 1, one slab in eight on floor 2, two on floor 3, four on floor 4): it falls as a
mass of earth that sheds clods and stones as it goes, and the dust is a plum-grey, more so the more
earth.

Colours: the floor's own stone (`theme.slab`, `lit`, `shade`, `mortar`), its earth and rock
(`theme.earth`), and floor 2's dust (`FLOOR_DUST`) tinted toward the earth on the deeper floors. No
glow; no cyan and no pink (checked).

## The moment (`stairwellOpens(theme, way)`: one for each of `CRYPT_FLOORS` and each way; 30 a second)

74 frames, 2.47 s, on every floor and either way. `before`: none (nothing of it is drawn before it
plays: the floor is the game's own, and its first frame is empty); `after`: `[makeStairwell(theme,
way)]`, which its last frame is to the pixel. `jolts`: 1, 9, 25, 30, 36, the frames for the screen's
kick and a sound. `holds`: none. `tracks`: the eight slabs of the lid (`a slab` / `a slab of earth`,
with their row) and `the kerb`.

- **The shock** (frame 1, 0.03 s, a jolt): the first crack bursts open in the middle, dust and grit
  spurting out of it. Frames 1 to 8: the cracks race out from there along the lines between the
  slabs, branch off across them, and run round the opening's outline and the kerb's, dust spurting
  and grit hopping where they run. **The floor shudders: that is the screen's** (the films shake it a
  game pixel every frame from the shock to the heave; nothing of the floor is painted before the heave,
  so that the game's own floor lies as it is under its cracks).
- **The heave** (frame 9, 0.3 s, a jolt): the kerb shoves up out of the floor, 5, 7 and 8 picture
  pixels high, and settles at its own 6 by frame 13; the slabs of the lid are thrown up 5 or 6 and fall
  back loose behind it, rattling; dust is blown out low from under the kerb all round, and jets of it
  burst up out of the lid's cracks.
- **The slabs go** (frames 13 to 29, 0.43 to 0.97 s), row by row down the way the steps go, the two of
  a row a frame apart, a row every 4 frames (rows tip at 13, 17, 21 and 25): each tips, its far end
  dropping (never steeper than the eye looks down, or it would hang hidden under the next), slips and
  falls forward, faster every frame, slams onto the steps and shoots on down them out of sight under
  the floor, darker the deeper it goes in the stairwell's own five steps of dark. The second and third
  rows slam on frames 25 and 30 (0.83 and 1.0 s), jolts; each slam blows dust up out of the hole and flings chips, each deeper slam a bigger column, building to the great burst. Every slab is out of sight by frame 29.
- **The great burst** (frame 36, 1.2 s, a jolt: the last row slams, deep under the near kerb, which
  jumps 2 pixels and settles): a column of dust blows up out of the whole hole, highest at frame 45 or 46 (1.5 s), 190
  picture pixels (95 of the game's) above the opening's corner, spreading out as it goes; a skirt of
  it rolls out over the kerb across the floor; chips and stones are flung up out of it over 6 frames,
  across the hole and back down into it. The dust falls fast and thins away as clouds (never as a
  speckle): back down to the stairwell by frame 67 (2.23 s); the last chips and grit go down into the
  hole to frame 73 (2.43 s), the stairwell as it lies.

## For the main chat, when he has said yes

- **Lined up by the anchor:** every frame is anchored at makeStairwell's anchor, the corner of the
  opening up the screen; each is cut to what is painted in it (the biggest 232 x 268 picture pixels,
  the stairwell's 143 x 82): draw each by its anchor, as a sprite is drawn.
- **Swap at the ends:** draw nothing of it before it plays; play its frames from the boss's death
  (whatever stood on the opening put to one side of it, as you have it); after its last frame, draw the
  stairwell as you do now. The first frame is empty, the last is the stairwell.
- **Where in the order of drawing:** the dust stands up high over the hole, so while it plays it is
  best drawn as what stands is, in depth at the opening's middle (a hero in front of it over it, one
  behind it under it), and not flat under everything as the stairwell is.
- **The jolts** (1, 9, 25, 30, 36) are for the screen's kick and a sound: the films kick it 3 game
  pixels down and back at each; and a tremor of a game pixel every frame from the shock to the heave,
  the floor shuddering. Both the main chat's to do in the game, at his rule's size.
- **Painting it:** about 1 s each here (tsx; all eight 8.6 to 10.5 s, run to run), a phone several times that: paint the
  floor's one (its way) when the floor is first reached, or while the boss fight goes on.
- **Shared:** it holds a copy of makeStairwell's painter that takes the kerb's height and keeps, for
  each pixel, how high in the world what it shows is (for what falls into the hole to be hidden by what
  is nearer the eye); the tests hold it to makeStairwell's picture to the pixel. If makeStairwell took
  those two, the copy could go.

## The looks, and what was mended

The brief asked for two looks by a fresh pair of eyes (a subagent that had not seen the code); this
session had no way to start one, so the looks were the maker's own, frame by frame and at a phone's
size, asked the brief's questions; **the art chat's own two fresh looks are still to come.** Found and
mended: the lid read darker than the floor round it (its tones brought to the floor's, and a slab
sagging a pixel no longer darkened as deep things are); the dust read as scattered spots and as a ring
of them (now billows in clusters, a crescent of light on the upper left and of shade on the lower
right, rims ragged in lumps, never a lone speck); its light read as diagonal stripes (crescents); the
column hung at the top like wool (it now goes up in a quarter second and comes down fast); the chips
were lost in the dust and then read as a comb of sticks (now fewer, chunkier, in the stone's own tones,
over the dust, spread over six frames, with short trails); the cracks made a regular grid, a window or
a net (they now branch from the middle, jagged); the heave's dust was popcorn (now a skirt and five
jets); slabs tipped too steep hung hidden under the next; a slab struck the steps a frame before its
jolt; the slabs by the near kerb vanished behind it on the heave (the kerb now leads them up); the slabs' stretch was the quietest part, against his rule (each deeper slam now throws a bigger column, building to the great burst).

## The checks (`tests/stairwell_open.test.ts`, 57, each floor and way)

How long all eight take to paint. For each of the eight: nothing before it, its first frame empty,
its last frame makeStairwell's picture to the pixel. Crisp; 30 a second; between 1.5 and 2.5 s; no
cyan and no pink; two picture pixels to a game pixel. The moments' checks every floor's moments go
through (as tests/floor_checks.ts has them): nothing jumps; nothing pops in or out but on a jolt; the
painted pixels change at most 45% a frame but on a jolt; at least 4 pixels change every frame; never
more than 4 loose pixels in a frame. And its own: the kerb shoves up on the heave, past its height and
back to it; the slabs go row by row down the steps, each falling at least 40 picture pixels, going out
of sight bit by bit over three frames or more and gone 20 frames before the end; at each jolt after the
heave a slab that was falling faster every frame stops short; the dust goes up more than three heroes'
height (174 picture pixels) within 12 frames of the great burst and is down to half that within a
second; it ends still, the last six frames changing at most 300 pixels each, the last the stairwell.

## Pictures (not in the repository)

`node tools/preview.mjs src/dev/preview_stairwell_open.ts <out.png> 4700 5200 "moment:2:<n>"` (n =
(floor - 1) x 2, + 1 for the way to the lower left: every frame in a grid on a patch of that floor, the
warrior by it, the screen's kick drawn; the page logs the grid for the film's maker),
`"strip:2:<n>"` (sixteen frames and every jolt), `"tall:2:<n>:<a>-<b>"` (frames a to b),
`"close:6:<n>:<a>-<b>"` (frames a to b, close), `"still:8:<n>:<f>"` (one frame). The page must be
bigger than the picture.
