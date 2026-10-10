# Mock-up: the Warden's floor, the Crypt's first floor themed after its boss (NOT IN THE GAME)

**What it is.** Floor 1's own set of pieces, by his rule of 10 Oct (his art rulebook, Places 7: each
floor themed after its boss, between 40 and 50 pieces made for it alone), and three moments that
play around the hero there (his idea of 07:52; his rulebook's Places 8). Pictures for him first.
Nothing of the game imports `src/art/floor1.ts`; where each piece stands, when it is laid and what it
does (what breaks, what blocks, what hurts, what a quest asks, when a moment plays) are the main
chat's, once he has said yes.

**State of this branch (`mockup/floor1-warden`):** from `mockup/crypt` (the Crypt as he said yes to
it). Made by THE ART CHAT, 10 Oct 2026. First sent to him at 402d01f; his notes on it mended since.

## His words

- 07:29, asked whether the Crypt's four floors were good to build as shown: "Yes.  I’d also like
  each floor to be themed after the boss.  Add this to the ruleset.  We need somewhere between 40-50
  unique assets on each floor for each boss.  That can include wall tiles, floor tiles, breakables,
  stuff on the walls, on the floor, obstacles, the looks of doors and gates, traps, and quests."
- By 07:41, offered four themes (floor 1, the Warden: the dead king's tomb and its jailer; floor 2,
  the Headsman: the place of execution; floor 3, the Chained One: the prison; floor 4, the
  Amalgamation: the ossuary the miners broke into): "Yes, start floor 1 (Recommended)".
- 07:47: "Put in the ruleset that I want animations as big and wild and kinetic and weighty as
  possible.  I’d rather it be a notch too high than a notch too low." 07:53: "And I want all
  animations checked against this statement before I see them." (Animations 1.)
- 07:52: "I’d also like a couple environmental things happening around you for immersion unique
  for each floor.  Something shifts above you and dust comes down, you spook a pack of birds and
  they fly off,  a root shrivels as you walk by.  That sort of stuff"
- His notes on the first pictures: "Walls and floor tiles,The moments,I like a lot of these
  things.  But I don’t like the wall panels all being in the exact same spot.  I’m assuming a wall
  is three blocks high?  Some assets could be the full height like a large crack down the wall.  Or
  a floor tile and wall combo that’s shows a crumbled wall and the debris piled on the floor.   And
  the rats just kind of disappear.  Animations need run the checks."

## How his notes were read, and what changed

- **The wall pieces all in the same spot:** every wall piece now has three places (`Piece.spots`),
  low, middle and high on the wall and well across it, each within its own tile's face. The game
  picks one each time it lays one. **Never set the same piece on two neighbouring tiles of a wall.**
- **A wall's height:** a wall's face shows five rows of blocks, each 16 picture pixels (8 of the
  game's) high: the bottom three and a half lit, the rest fading into the dark above (onFace: solid
  to 56 up, faded to 80). Nothing is set in the fade, but the crack, which runs up into it, and fire.
- **Pieces the full height:** the great crack (from the floor up into the dark), the crumbled wall
  (a breach in the face with its heap of fallen stone on the floor before it: its `frames[0]`, to be
  drawn on the floor tile in front, before the wall), fallen-in stones (blocks missing from a course).
- **The rats just disappear:** they now go into a rat hole at the wall's foot, each in after the one
  before, bit by bit, their tails last; never through one another.
- **Animations need run the checks:** every moment is held frame by frame to the checks below, and
  had four looks by a second pair of eyes (one who had not made them) before he sees them.

## What is in it (`wardenPieces()`, 50 pieces; `wardenMoments()`, 3)

The theme is drawn from the Warden as he is painted (art/monster_warden.ts): "A dead king's jailer"
with a horned helm, a cape "the colour of blood" and a maul. So: the king's tomb (sarcophagi, his
effigy, his throne, his crown cut in the stone) and the jailer's iron (bars, keys, shackles, mauls,
horned helms, his red cloth as a dull wine).

- Wall tiles (9): burial niche, sealed niche, barred window, horned skull, the king's head, fallen-in stones, great crack, crumbled wall (with its heap), rat hole.
- On the walls (8): banner, banner in rags, shield, keys on a hook, shackles, torch (4 frames, with its light), crossed mauls, horned helm on a peg.
- Floor tiles (6): ledger stone, grave slab and ring, the king's runner (6: along x and along y, two plain and its end each), drain, the crown in the floor, sunken grave slab.
- Traps (3): spike grate (and its glint), skull plate (and pressed), dart skull (its mouth the slot; a wall piece).
- Breakables (4), each whole and then broken (`frames[1]`, what it leaves): funeral urn, squat urn, bone box, skull jar.
- On the floor (7): fallen guard, dropped keys, fallen banner, the statue's head, horned helm, candles (4 frames, with their light), chain.
- Obstacles (9): sarcophagus, open sarcophagus, the king's tomb, horned knight, pillar, cresset (4 frames, with its light), rack of mauls, the king's throne, the king's coffer (the chest; closed and open).
- Doors and gates (3): the door (old timber bound in iron), the gate (the horned skull carved over it), the boss's gate (the king's crown in the Warden's embers). As `Piece.gates`, made by `makeGateArt(theme, look)`.
- Quest (1): the Warden's horn, his trophy for the armourer.

**Anchors.** Wall pieces are flat pictures in a wall's face, on the one turned to screen-left
(`left`) and the one in shade (`right`), anchored at the foot of the face under the middle of its
tile. Floor tiles are a tile's picture (anchored at its top corner, as the floor's own). Traps as the
game's (anchored at the middle). What stands or lies, at the middle of its tile, on the grid.

**Shadows (`Piece.shadow`).** Everything that stands has the game's soft shadow under it, as the
figures do (render.ts, `shadow`): its reach in tiles. The game draws it; the pictures have none of
their own.

**Light (`Sprite.lights`).** Torches, cressets and candles give light as the game's props do; the
candles' falls as each goes out in their moment. Add them as render.ts adds a prop's (`propLit`).

## The moments (each at 30 frames a second; `before`, the frames, `after`)

`before` is what is there before it plays (a loop for the rats and the candles), its first frame
the moment's first; `after` what is left, the moment's last frame. Swap the one for the other.

- **Dust and a falling stone** (83 frames, 2.8 s; a wall piece, both faces, `right` for the face to
  screen-right). A stone of the wall's upper course works loose: the crack round it opens, grit pours
  out, it shudders, tips out and falls, turning, and strikes the floor at frame 27 (0.9 s): the first
  **jolt**. It breaks, chips fly and bounce, dust bursts out; a lump of the wall's core drops; the
  stone above it slips down into the gap and hangs there in the light, shivers, gives way and strikes
  the floor at frame 51 (1.7 s), the second jolt; grit pours down the face for most of a second and
  heaps at the wall's foot. `jolts` are the frames for the screen's kick (the films show one: down 3
  of the game's pixels and back, 2 for the second).
- **Rats bolt** (56 frames, 1.9 s; at a rat hole, both faces). Three rats feed on bones (`before`, 4
  frames); they freeze together, heads up, sniffing (from frame 3); they bolt at once (frame 10),
  kicking up dust, and pile in at the hole one after another, the last tail whipping in.
- **A candle gutters out** (61 frames, 2 s; the candles on the floor). A gust tears every flame over;
  sparks fly, ash skates in past the hero; the tallest is beaten down and goes out at frame 12, then
  two more (17 and 22), each with a plume of smoke dragged off and rising; the light falls. Its frames
  are wider than the candles' own, out to the left (the anchor is the candles' own: line them up by it).

## For the main chat, when he has said yes

- `src/art/gates.ts`: `makeGateArt(theme, look)` takes a `GateLook` (`gateMark`, `bossMark`, `leaf`);
  with none given every picture is as before (`Mark` and `Stone` now exported).
- New sizes and kinds: breakables beyond barrel and urn; obstacles of new sizes (the tomb and the
  throne a tile, the rack of mauls long); the horn for the armourer's quest; wall pieces with their
  spots; the moments and their jolts.

## The checks (`tests/floor1.test.ts`, 17; `tests/crypt.test.ts`, 13)

Places 7 (40 to 50 pieces, every kind he named); Pixels 1 (crisp; no loose pixels); Colour 3 (no
cyan; pink only on the boss's gate); Colour 4 (walls and floors darker than the darkest word; what
stands no brighter than the game's own); Pixels 4 (lit from the upper left); Pixels 7 (a shadow
under all that stands, as wide as its foot). His notes: every wall piece in three places, low to
high and across, within its tile, nothing in the fade; no 12-pixel band of the wall holding more
than a third of the pieces; the crack the wall's height; the crumbled wall's breach and heap. The
moments (Animations): crisp; 30 a second; nothing pops in or out at the start, the end or the
middle; nothing jumps; always moving. The rats: feeding, frozen together, setting off together,
flat out, never through one another, turning no more than 26 degrees a frame, into the hole bit by
bit, lighter than the floor as painted. The stone: shudders 3 of the game's pixels, falls faster
every frame, breaks at the first jolt, the stone above slips, hangs and falls to the second, the
lump drops, its dust a tile and a half wide. The candle: the gust leans every flame hard over, the
tallest flares and is snuffed, more go out, its smoke rises high.

## Pictures (not in the repository)

`node tools/preview.mjs src/dev/preview_floor1.ts <out.png> 6000 6000 "sheet:4"` (every piece by
kind), `"spots:4"` (every wall piece at its three places), `"room:2:<frame>"` (a room laid with
them), `"moment:2:<n>"` (n: 0 the stone, 4 the stone in the other face, 1 the rats, 3 the rats in the
other face, 2 the candles; every frame in a grid, the page logs the grid). The page must be bigger
than the picture. The dev page draws the lights and the screen's kick as the game would.
