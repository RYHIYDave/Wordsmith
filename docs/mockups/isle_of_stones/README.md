# THE ISLE OF STONES: one of the eight towns to unlock or buy, made closer for him to lock in (branch `art/isle-of-stones`)

From the queue's `draw-eight-other-towns` (his words, from his Endless town item: “I’d like maybe 5 different towns, they can be
themed after the current levels, or new designs, but I want one for the new town, then the rest will be unlockable or
purchasable.  I need mockups until they’re locked in, then drawn to the standard of the game”). Of the ten sketches he kept
eight more on 11 Nov 2026 (branch `art/endless-town`, docs/mockups/endless_town/README.md). Asked to start on them: “Yes, the
towns (Recommended)”; asked which first: **“7 The Isle of Stones”**. Made by the Queue chat of 12 Nov (session ...KKtBp).

The sketch's line: “A small isle in a still sea under the northern lights, all of it inside a ring of standing stones: the
wordsmith's own place.”

## Step 1: the closer mock-up (as the Shaft's Rim's step 2), 14 Nov 2026

Dev page `src/dev/preview_isle.ts` (commands in its header); nothing of the game imports it.

**The pictures** (`pictures/`): `isle_whole.png` (the whole town, every station marked by a small word); `isle_view_1.png` to
`isle_view_3.png` (one phone screen held sideways each, 507 x 234 game pixels at the game's own zoom, the camera on the knight):
1 at the wordsmith's bench, 2 at the way down into the sea, 3 at the gate and the record.

**At the game's own scale**: a tile 32 x 16 game pixels, every game pixel two picture pixels. The isle is a round about 16 tiles
across (its turf to radius 7.1 about tile 12, 12, its shore to about 8), the size of the Shaft's Rim; the coast worn ragged.

### The layout (the sketch's, at the game's scale; tiles, the isle's middle at 12, 12)

- **the wordsmith**: his ring at the very middle (12, 11), the bench with THE TABLET'S SOCKET before him (the Rim's slab, drawn
  at the game's standard), his six stones round him; a worn path round them.
- **portal's place**: a round of flat stones at the back of the isle, in a gap left in the ring of standing stones, kept clear.
- **record**: (8, 7) beside the portal's place; **trophies**: (4, 9) behind the bazaar; **gate**: (13, 5) at the back right.
- **smith**: the forge at (17, 9), the rack, trough, anvil and armourer laid round it as the game's town lays them.
- **bazaar**: the tent's back at (6, 13), the mystic and the table before it.
- **lexicon**: (9, 16) and **stash**: (13, 17) at the front.
- **stranger**: (18, 13), out on the right by the stones.
- **the way down**: the waypoint at (16, 16) at the front, at the head of STEPS CUT DOWN FROM THE SHORE INTO THE SEA, the water
  lit over the lowest.
- **THE RING OF STANDING STONES** round the whole isle at its shore, tall at the back against the sea and the sky, low at the
  front so that they hide no one; a gap at the back for the portal and one at the front for the way down. On each, a rune of
  the order cut faint in the friend's cyan (as in his sketch: it is the wordsmith's own place).
- Four of the game's braziers, five torches on posts (the Rim's).

### The look

Night. THE NORTHERN LIGHTS hang over the sea at the back in curtains, a yellower green at their foot, green, violet up into the
dark: never cyan (the friend's). Their light lies on the still black sea in long streaks. The isle is turf in the middle and a
shore of grey stones round it, its front edge a low face of dark rock down to the water, the sea lapping pale along its foot.
The honest orange of the fires on the isle; the friend's cyan only at the wordsmith's ring, the Lexicon, the stash, the waypoint
and the runes on the stones; no pink or gold anywhere (the enemy is not here).

### What is the game's own, and what is new

The game's own (as they are, in the isle's grey-blue stone through `makeTownProps(theme)`): the forge, rack, trough, anvil; the
tent, its table and rug; the wordsmith's ring and six stones; the Lexicon; the stash; the waypoint; the braziers; the armourer,
the mystic, the wordsmith and the stranger; the knight. The Shaft's Rim's, drawn at the game's standard (art/shaft_props.ts):
the gate, the record stone, the trophies wall, the torches, the slab with the socket.

New, painted here as a mock-up, still to be drawn at the game's standard: (1) the isle's turf and shore and its front face; (2)
the sea and the lights on it; (3) the sky and the northern lights; (4) the standing stones; (5) the steps down into the sea;
(6) the portal's round of flat stones and its low stones.

## Step 2: drawn at the game's standard (14 Nov 2026)

Shown the mock-up, his word: “Actually redraw it, don’t just leave these mock up drawings”. Read as: the layout stands; draw
the new parts properly. They are now in `src/art/isle_of_stones.ts`, painted as the Shaft's Rim's ground is (one line of sight
per picture pixel, flat tones, light in bands, a dither only where two bands meet, two picture pixels to a game pixel):

- THE GROUND, one picture (840 x 500 game pixels): the night sky and its stars; the black sea, its ripples thin dashes that are
  never on a grid, longer toward the eye; the turf in clumps with tufts, the worn paths of earth and grit (round the wordsmith's
  ring, out to the way down, the gate and the portal), small stones sunk in it; the shore of grey stones, each lit on its upper
  side; the isle's front face of dark rock in strata, lit where it faces left, foam broken along its foot; the portal's round of
  flat stones; THE STEPS: six square slabs set corner to the eye, each lower and further out, the first cut into the shore,
  the third just over the water, the last three under it, the sea over them, green where it washes them.
- THE NORTHERN LIGHTS, one picture added over the ground: two curtains, rays hanging each to its own length (so that their foot
  is ragged, never a hill's line), the yellower green at their foot, green, violet up into the dark; their light on the open
  water in broken dashes straight down from them, fading toward the eye. `auroraNow(t)`: their strength breathing, an 11 s round.
- THE STANDING STONES, four pieces: one slab each, narrowing as it rises and leaning a little, its lit face in bands, its shaded
  face, its pale top; grit, cracks, lichen in patches, moss at its foot; its edges bitten by the weather; the rune of the order
  cut in its lit face, faint, in the friend's cyan, with a small light.

Pictures: `pictures/isle2_whole.png`, `pictures/isle2_view_1..3.png` (the page: `src/dev/preview_isle.ts`, modes `whole2`,
`view2:1..3`; the first mock-up's are still `whole`, `view:1..3`). Painted in under 2 s, once.

## For the main chat

How the towns are won (unlocked or bought) is not settled: his “unlockable or purchasable”.
