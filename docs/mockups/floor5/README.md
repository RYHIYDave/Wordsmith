# Mock-up: the Fleshmancer's Lair, the Crypt's fifth floor (NOT IN THE GAME)

**What it is.** Floor 5's own look, its pieces (his art rulebook, Places 7: each Crypt floor themed
after its boss, between 40 and 50 pieces made for it alone), three moments that play around the hero
(Places 8), and the mine shaft at its end in place of the stairs: the cage that comes crashing down
it as the fleshmancer dies, and the ride up it to town. Nothing of the game imports any of it; where
each piece stands, what it does (what breaks, blocks or hurts, what a quest asks, when a moment plays)
are the main chat's.

**State of this branch (`mockup/floor5-lair`):** from `mockup/floor3-4` at 8ca2ec0 (floors 3 and 4
as he said yes to them). Made by THE ART CHAT, 11 Oct 2026. **He has said yes to it, as shown** (by
16:42; his words below): the main chat's to build in.

## His words

- His outline of the first five floors, 9 Oct: “By floor 4 it’s about half dirt and rocks with
  discarded and rusted mining equipment around.  There is a cult here that has found an ancient evil
  power residing under the crypt.  Floor 5 will have the Lair boss, which will be a very powerful
  cultist fleshmancer.  He is the one creating the ossuary guys and the giant amalgamation.”
- 10 Oct, 07:47 (Animations 1): “Put in the ruleset that I want animations as big and wild and
  kinetic and weighty as possible.  I’d rather it be a notch too high than a notch too low.” 07:53:
  “And I want all animations checked against this statement before I see them.”
- 11 Oct, 13:00: “floor 5 is mostly dirt as you’re completely under the prison.  Full of cult
  iconography and abandoned mining equipment.  Instead of stairs at the end I’d like a mine shaft you
  ride up.” Read back to him as: almost all bare dirt and rock, the cult's own signs everywhere (made
  up new), old mining gear left lying about, and at the end a mine shaft with a lift cage instead of
  the stairs.
- Asked which way the cage takes you, by 13:05: “Up, out to town”, offered as: the Crypt is done, the
  cage hauls you up to the surface, and the next five floors start from town.
- 15:57, of the review page "Fleshmancer's Lair Review" (its ground and three rooms): “Looks awesome”.
- Asked as a pop-up on the same page, “Floor 5's three moments, the cage crashing down, and the ride
  up are now at the top of the Fleshmancer's Lair Review page. Are they good as shown?”, by 16:42:
  “Yes, on to the cultists (Recommended)”, offered as: Floor 5 goes to the main chat to build in, and
  I start the dagger cultist and the mini fleshmancer.

## The look (`src/art/lair.ts`: `LAIR`, `lairGround()`, `lairProps()`, `lairWaypoint()`)

A fifth look beside the Crypt's four (`id` 'crypt5'): you are under the prison now, in the miners'
deep workings and the cult's lair. Nine in ten of its flagstones are gone to bare earth (`gone` 0.9);
nine in ten of its walls' stones are gone, and where they are gone the walls are DUG EARTH
(`Earth.dug`, new in `art/ground.ts`): packed earth in layers, stones set in it, the scores of the
picks, the dressed stone only in the foot course here and there. What stone is left is the cult's,
darker and older than the prison's (`LAIR_ROCK`). The four floors above are unchanged.

## What is in it (`lairPieces()`, 47 pieces; `lairGates()`; `lairMoments()`, 3; the shaft)

- Wall tiles (7): the lagged wall (the wall's height: the miners' dark boards holding the earth back,
  gaps between them), the cave-in (the wall's height, one place: the face fallen in, a ragged hollow;
  its heap of earth, flat stones and the snapped post is its `frames[0]`, drawn on the floor tile
  before it, before the wall), the drilled face (drill holes at every slant, fuse hanging from two, one
  blown), the priest in the stone (the wall's height: a slab of the cult's stone, a robed figure cut in
  it), the shrine (a niche with a skull on its sill and a black candle either side, burning,
  with its light), the boarded adit (the wall's height: an old side tunnel, boarded over with wide planks), black
  glass (the wall's height: where the power came up and fused the rock; angular, near black).
- On the walls (8): the cult's banner (their mark, the shrieking skull), a cultist's robe on a peg,
  the candle ledge (burning, with its light), the daubed mark (pale chalk strokes), bones on cords (cords
  splayed from a spike, no skull), a miner's candle on its spike (burning, with its light), rope and pulley,
  the hung kibble (the miners' iron bucket on a chain from a hook; the wall's height).
- Floor tiles (6): the trodden way, the rails' bend (a quarter turn), the plank walk, the cult's ring
  (burned into the earth, bones set round it), the cult's slab (their mark cut in it), spoil.
- Traps (3): the grasping earth (cracked humps; `ready`, the warning: bony hands thrust up out of the
  cracks, his rings of hands waiting), the charge (a tamped hole and its fuse; `ready`: the fuse lit,
  spitting sparks, creeping to the hole), the shrieking skull (a wall trap, the dart slot here: a great
  skull in the earth, its mouth open and bristling with his bone shards; one place).
- Breakables (4), each whole and then broken (`frames[1]`): a keg of powder, a box of the cult's
  candles, an offering jar, a basket of ore.
- On the floor (5): the cart on its side (floor 4's cart, its ore spilled), a miner's bones, a dropped
  lantern, a spilled kibble, skulls given to him (black candles on three skulls; 4 frames).
- Obstacles (10): the winding drum (the winch over a winze, its kibble hanging; `WINCH`, `paintWinch`;
  the second moment's own), the sump pump, the effigy (the cult's idol of him, of bones and a robe),
  the skull standard, the great bone heap and the long bone heap (his bone heaps, the dead he raises:
  `GREAT_HEAP`, `LONG_HEAP`, `paintHeap`, every bone of them movable for his spell), the rift (the third
  moment's own; two tiles long along x, its light the deep end of the enemy's pink only), the pile of
  props, the cult's coffer (the game's chest; shut and open, no gold), the mine shaft (`frames[0]`
  empty, `frames[1]` with the cage down; below).
- Doors and gates (3): the door (lashed logs), the gate (the shrieking skull carved in its roundel), the
  boss's gate (the skull with his pink fire burning in its mouth and sockets). As `Piece.gates`, made by
  `makeGateArt(theme, look)` (`lairGates()`).
- Quest (1): his book (bound in plates of bone, the cult's mark on it; no glow, no words).

Anchors, shadows (`Piece.shadow`), lights (`Sprite.lights`) and wall pieces' places (`Piece.spots`,
three each, low to high and across; never the same piece on two neighbouring tiles of a wall) are as on
floors 1 to 4. Pink is only his: the boss's gate, the rift's light, his fire. No cyan anywhere.

## The moments (each at 30 frames a second; `before`, the frames, `after`)

`before` is what is there before it plays, its first frame the moment's first; `after` what is left,
the moment's last frame. Swap the one for the other. `jolts` are the frames for the screen's kick and
the sound (the films show the same kick as floors 3 and 4's).

- **The roof comes in** (170 frames, 5.67 s; frames 210 x 160 in the game's pixels, the anchor, the
  middle of the prop's tile, at (105, 110)). A pit prop stands holding up the roof, up into the dark.
  It creaks, grit trickling, and bows. It SNAPS at 44 (1.47 s, the first jolt): its foot kicks out, its
  upper half drops out of the dark, earth pours down in a torrent and 22 rocks crash out of the dark,
  bouncing and rolling away; a great slab strikes at 69 (2.30 s, the second); the earth heaps up and
  slides; a last rock drops at 122 (4.07 s, the third) and rolls. What is left: the heap, the prop's
  halves, rocks across the floor.
- **The winch runs wild** (129 frames, 4.30 s; frames 150 x 160, the anchor, the middle of the drum's
  tile, at (75, 115)). It creaks; THE BRAKE SLIPS at 26 (0.87 s): the lever kicks up, sparks spray off
  the brake band, the kibble drops away down the winze (out of sight by 31, 1.03 s) and the drum spins
  up, faster and faster. At 58 (1.93 s, the first jolt) the kibble strikes the bottom far below: a
  column of dust shoots up out of the winze, about twice the hero's height, billowing wider as it
  climbs; 12 stones are flung up out of it high and wide and land up to about four tiles off; the cable whips up out
  of the hole; the lever slams back down at 66 (2.20 s, the second). The drum rocks to rest and the dust
  sinks onto the floor and is gone.
- **The rift breathes** (150 frames, 5.00 s; frames 150 x 150, the anchor, the rift's middle, at (75,
  95)). Its light swells and sinks; the ground HEAVES at 36 (1.20 s, the first jolt): the rift tears
  wider, chunks of its lips break off and fall in, gone; his pink fire bursts up out of it about as tall
  as a hero, sparks flying higher, and roars on; a second heave at 70 (2.33 s, the second) bursts it up
  again. It roars to 104 (3.47 s) and sinks back to its dim glow by 134 (4.47 s), a little wider than
  before. Its frames carry their light (`Sprite.lights`), bigger at each burst.

## The mine shaft (`src/art/shaft.ts`)

The miners' shaft at the back of his hall, up into the dark: four posts, guides, beams, the
onsetter's candle on its post, the catches the cage lands on. `shaftStill()` gives it standing:
`empty` (the cage up out of sight, while he lives) and `down` (the cage at the landing, its gate open).
Its pictures are 98 x 98 in the game's pixels, the anchor (the shaft's middle on the floor) at (49, 73).

- **The cage comes down** (`cageDown()`; 129 frames, 4.30 s), as he dies, IN PLACE OF THE STAIRWELL
  OPENING on the floors above: play it at the shaft's middle. The empty shaft; a rumble, grit and then
  stones raining down out of the dark; the cage plunges into sight at 32 (1.07 s), its shoes streaming
  sparks; it SLAMS onto the catches at 50 (1.67 s, the first jolt), dust bursting out across the floor;
  bounces and comes down again at 60 (2.00 s, the second); rocks on its chains; its gate slides open
  over its last 17 frames. `after` is `shaftStill().down`.
- **The ride up** (`cageUp()`; 101 frames, 3.37 s), when the hero steps in: its gate SLAMS shut at 10
  (0.33 s, the first jolt); the cable snaps taut and it LURCHES at 30 (1.00 s, the second); it is hauled
  up, slow, then faster and faster, swaying, grit falling past it; gone into the dark by 64 (2.13 s).
  `after` is `shaftStill().empty`.

## For the main chat

- **Floor 5's look**: `CRYPT_FLOORS` and `cryptFloor` (art/crypt.ts) want floor 5's theme, `LAIR`
  (art/lair.ts); today floors past 4 look as floor 4. Its ground is `lairGround()`, its props
  `lairProps()`, its waypoint `lairWaypoint()`.
- **`art/ground.ts`** gains `Earth.dug`: the dug-earth walls and a little more earth in the floor where
  it is set. Only floor 5 sets it; the four floors above are as before (their tests unchanged).
- **`art/floor4.ts`**: only `export` added to its helpers (the depth painter, the loose things, the dust,
  the cart), for floor 5 to use. Nothing in it changed.
- **The shaft and the hero.** Both films come as two layers frame by frame (`layers.back`, `layers.front`):
  draw the hero between them. In the ride, `layers.lift[f]` is how far the cage's floor is over the
  landing, in picture pixels (half that in the game's): draw the hero lifted by `round(lift / 2) + 1`
  game pixels (he stands on its floor, a pixel over the landing), and take him into the dark as the cage
  is taken, with `riderDark(lift, h)`: for a pixel of him at `h` of his height (0 his feet, 1 the top of
  his head), how far to mix it toward floorkit's `BEYOND` (1: not drawn). Standing at the landing he is
  untouched. The review page's film does exactly this (src/dev/preview_floor5.ts, `rider`).
- **What comes after the ride**: up to town, his pick of 13:05; how the next set of five is reached from
  town is yours (with him).
- **Painting**, here: all 47 pieces about 0.9 s; the roof 2.6 s, the winch 1.3 s, the rift 1.5 s, the
  cage coming down 2.4 s, the ride 1.6 s. Paint them ahead, or when the floor is first reached.
- The grit and stones down the shaft are not followed in the films' tracks (they fall into the hole and
  are gone, untracked); everything else that moves is.

## Checks

`tests/floor5.test.ts`, 23: every check floors 1 to 4 go through (tests/floor_checks.ts: 40 to 50
pieces, crisp, no cyan, colour, light from the upper left, the wall pieces' places, shadows, the moments
smooth, nothing popping or jumping, nothing moving through another), the look its own, and what each
moment is for, followed through its tracks: the roof's prop stands until it snaps and its rocks land
and lie still; the winch's kibble is gone down the winze before it strikes and its stones are flung
high and land well away; the rift tears wider and its chunks are gone into it; the cage strikes the
landing on its jolt and rests there; the ride waits, lurches, is hauled up and never back, and is gone
into the dark, the hero with it. The unit suite 1090 of 1090 on the branch; tsc clean.

## Looked at, and what was mended

Looked at frame by frame by the art chat, against Animations 1 (no second pair of eyes this time).
What read wrong, and how it was mended:

- The lagged boards read as a wardrobe (darker boards, gaps between them); the cave-in's rocks as
  bubbles (flat stones); the adit as a ladder (wide planks); black glass as vines (angular).
- The shrine's skull over a bone read as crossbones (the bone is gone); the banner's mark as an "S" or
  "Z" (a new mark, bigger, the cloth in broad folds).
- Robes read as ghosts, then curtains (one robe on a peg, with shoulders and sleeves); the bones on cords
  as a hanging skeleton (no skull, the cords splayed); the lamp as a teapot (a candle on a spike).
- A barrow read as a chair (now the cart on its side); a miner's boots came out a slab (remade); his
  hat could not be read (now a dropped lantern); the kibble's marks as a label (gone).
- The candle box read as a toaster (candles over its rim); the broken candles as an "X" (uncrossed); a
  pit prop alone as a T or a lamp post (now the pile of props).
- Bone looked gold (desaturated, darker in the shrine, the ring and the grasping earth); specks in the
  rift (clamped).
- The moments were too small and weak at first, by Animations 1: the roof's heap grows out over the
  floor and the rocks come in a torrent; the winch's dust is a high column and its stones (bigger,
  flung higher) are seen landing; the rift's fire bursts up three times as tall at each heave.
- A stone of the winch's fell back down the winze and popped up again (they knocked one another as they
  were flung): each is now stepped on its own.
- In the ride's film the hero stood out bright while the cage went into the dark around him: he is now
  taken by the dark with it (`riderDark`).
