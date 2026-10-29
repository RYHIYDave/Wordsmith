# Floor 17, the Masque: its place (mock-ups; the art chat's helper, branch `mockup/masque`)

The branch is forked from `origin/mockup/swan-gardens` at 55945b3 (floor 16, the Swan Gardens, finished and approved: the model
for everything here). Nothing here is in the game until the main chat puts it there. Nothing of the game imports any of it.
This is the floor's PLACE, its ground and its pieces; its enemies and its boss are other helpers' work, after his briefs.

The measure is his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (his "Yes, go (Recommended)"), level 17:
"Level 17: The Masque. Into the palace, where the prince's masked ball has gone on for weeks." Its layout "indoors: a winding
suite of seven great rooms, each in its own colour (blue, purple, green, orange, white, violet, and a black one lit red through
its windows), with galleries, card rooms and servants' passages between."; its hazard "the great ebony clock in the black room.
Every so often it chimes: every dancer stops dead and turns to look at you, then the music starts again and they all come at
once."; its enemies "masked dancers who waltz until they notice you, footmen, and the Silent Order among the guests"; its story
"the prince opened the city to the Silent Order in return for his walls. He shut the poor out and kept dancing while the city
below went quiet (as in "The Masque of the Red Death")."; its boss "The Prince. His floor is the Black Room. A tall young man in
a long velvet coat and a smiling gilt mask, with a rapier, dancing the whole fight."; its palette "Seven rooms of seven colours,
candlelight, black velvet."; its story beat "The court dances while the city goes quiet." The set's event: some enemies carry a
royal's crest and drop royal playing cards (Princess, Prince, Queen, King).

Its story from Edgar Allan Poe, "The Masque of the Red Death" (1842), out of copyright, drawn only from the tale, never from
any film of it. What is taken from the tale: the seven chambers, each hung and lit in its colour, the seventh "closely shrouded
in black velvet tapestries that hung all over the ceiling and down the walls, falling in heavy folds upon a carpet of the same
material and hue", its panes "scarlet—a deep blood color"; "To the right and left, in the middle of each wall, a tall and narrow
Gothic window"; no lamp or candle in the seven, but "in the corridors that followed the suite, there stood, opposite to each
window, a heavy tripod, bearing a brazier of fire, that projected its rays through the tinted glass and so glaringly illumined
the room"; "a gigantic clock of ebony" against the western wall of the black room, its pendulum's "dull, heavy, monotonous
clang", "the brazen lungs of the clock"; "the profusion of golden ornaments that lay scattered to and fro or depended from the
roof"; "there were musicians, there was Beauty, there was wine"; "arabesque figures with unsuited limbs and appointments"; the
abbey's wall that "had gates of iron. The courtiers, having entered, brought furnaces and massy hammers and welded the bolts."

## What he has said of it

Nothing yet: none of this has been shown him. Every word of his quoted here is his doc's, as above.

## The first look (src/dev/masque_paint.ts, src/dev/preview_masque_paint.ts)

A painting of one corner of the palace, about a phone screen and a half, with the knight standing in it for scale: the violet
room (the sixth of the seven), the knight in it; through a doorway to the west the seventh, the black room, hung in black velvet,
its scarlet windows burning, a third window curtained between them, masks dropped where the dancers fled it, and the great ebony
clock against its western wall AT ITS CHIME (its hammer down on the bell, its note going out of the cupola); to the north-east
the white room (the fifth), the feast gone cold along its wall under a pier glass, a tapestry, the musicians' harpsichord and
viol; to the south-east a card room by candlelight, the royal cards on its table under a crystal chandelier, another table
overturned and its cards flung; to the south the long gallery, candelabra and a chandelier down it; and between it and the black
room the servants' passage, the "closed corridor", where two braziers stand on their tripods. The three rooms are in the tale's
order (white, violet, black), so the black room's doorway is where the tale puts it.

It is painted from the game-ready parts below, laid by hand (dev/masque_level.ts, dev/masque_lay.ts); what the painting adds is
THE LIGHT, as the tale lights it: each window's light thrown into its room in the room's own colour, the black room's a dark
red; the candles' and the braziers' an honest orange; the knight's own pool of light (his rulebook, Pixels 6); the dark between.
In crisp steps, a checker where one step gives onto the next, never a smear (Pixels 1); every colour of the place still under the
dullest word's (Colour 4); only honest fire left bright (Colour 3).

- `overview`: the corner (600 x 420 game pixels at two picture pixels each): `pictures/first_look.png`.
- `close`: twice as big, the knight at the black room's doorway, the clock and the windows beyond: `pictures/first_look_close.png`.

## Its ground, game-ready (src/art/masque.ts; painted by src/art/terrain.ts)

- `masqueLook(land)`: the look for a level from what only the level knows (`MasqueLand`): its floor, and what each walkable tile
  is (`MQ_ZONE`: the seven, `Blue` to `Black`, in the tale's order; `Gallery`, `Cards`, `Passage`; a passage where not said).
  Edges straight, as walls are. It paints as floor 14's does (render/outdoor.ts `landLook`): this in place of
  `houseOfQuietLook` for floor 17.
- `masqueWindows(land)`: where the ground puts its windows, for the game to give each its light over the dark if it will: one
  in the middle of every straight run of a far wall of the seven rooms (one more for every 4.5 tiles of it, spread evenly),
  only where the wall's face stands whole to the window's head (the game cuts away a wall that would stand over the floor, and
  with it what is on it). Each: the middle of its foot on the wall's line, its face (0 along x, turned to the screen's left; 1
  along y), its room, its glass, its light.
- THE SEVEN ROOMS' FLOORS: polished marble, half a tile to a slab, veined; the blue, green and white rooms' a checker of their
  two marbles; the purple, orange and violet rooms' pale octagons with a small square of the dark one where four meet; round
  each room's edge (its walls and its doorways) a border of the dark marble in long slabs inside a fillet of gilt.
- THE SEVEN ROOMS' WALLS (`MQ_RISE` 128 high, fading into the dark over `MQ_FADE` 104): a gilt skirting; a dado in the room's
  colour in gilt-framed panels to its rail (`MQ_DADO` 22); silk damask in the room's colour (a tone-on-tone ogee and a bud) in
  panels between gilt fillets; a gilt cornice (`MQ_CORNICE` 100); and THE WINDOWS (`WIN`): tall, narrow, pointed (two arcs to
  their point), a surround of stone, the glass leaded in diamonds in the room's colour, lit from behind by the brazier, its fire
  an orange heart low in the glass. Each window's light lies on the floor before it: the window's own shape thrown long out
  from the wall, wider as it goes, in steps.
- THE BLACK ROOM: black velvet in heavy folds from the dark above to the floor, deep hollows, narrow ridges, the red of its
  windows caught on the ridges near them; a carpet of black velvet, its nap brushed in long strokes; its windows scarlet (in the
  honest fire's own colours, `MQ_SCARLET`, left bright), their light on the carpet a dark red.
- A GALLERY: chevron parquet of oak, polished, worn paler down the middle; pale stone in courses, a fluted pilaster with a gilt
  capital at every bay, a tall round-headed recess between.
- A CARD ROOM: walnut parquet under a carpet of the court's own (a field of dull wine in a lattice of gilt along the floor's lines,
  a flower of indigo where they cross, a border of indigo with a running lozenge of gilt, a fringe), a tile in from its walls and
  doorways; walnut panelling to the cornice, its mouldings gilt.
- A SERVANTS' PASSAGE: cool grey flags, worn; cinders and ash from the braziers along the walls; limewash on plaster over a dark
  skirting, soot gone up the wall in plumes.
- What lies about where the ball goes on: spangles of gilt (the tale's scattered golden ornaments), a ribbon come loose, a
  feather off a mask, drops of wine (none in the black room, none in the passages).
- THE TOPS: the walls' thickness from above, a lit edge of gilt, then the dark over the rooms.

The palette, every colour under the dullest word's (0.46 of full colour; leech, the dullest, is at 0.50): `MQ_ROOMS` (each
room's silk, its two marbles, its glass, its light); the blue's hue 222 (well past the hero's cyan), the purple's 286 (short
of the enemy's pink), the violet's 260 between them, the green's 136, the orange's 24, the white an ivory, barely coloured, the
black's velvet a blue-black; `MQ_GILT`, `MQ_STONE`, `MQ_OAK`, `MQ_WALNUT`, `MQ_CARPET`, `MQ_FLAG`, `MQ_WASH`.

## Its 25 pieces, game-ready (src/art/floor17.ts `masquePieces()`, the Prince's)

His rule of 10 Oct, 14:54: “Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” These are
the Prince's; the High City's own 25 are not made yet. Built in the Act 2 kit (`src/art/act2_kit.ts`) as floor 16's are.

- `the great ebony clock` (obstacle): three times the knight's height: a stepped plinth; the long trunk, a glazed door in it
  and the pendulum swinging behind the glass, the weights beside; the hood, columns at its corners, the dial under its arch (a
  brass plate, a ring of ivory, the hours in ebony, the hands near the hour); the prince's smiling gilt mask in the arch; an open
  cupola over it and in it the bell, "the brazen lungs of the clock", its hammer. TWELVE FRAMES (`CLOCK_FRAMES`): for its front
  along +y, the pendulum's four (`CLOCK_SWING`: out one way, the middle, out the other, the middle; for the game to play at its
  slow beat), then its chime's two (the hammer drawn back; the bell struck, the hands at the hour, its note going out of the
  cupola in arcs either side), which the game plays when it chimes; then the same six for its front along +x (against a western
  wall, as the tale has it).
- `a brazier on its tripod` (obstacle; four frames of fire): the tale's light, three curved iron legs on paws tied by a ring, a
  deep bowl with a brass rim, coals glowing in their cracks, the fire licking up. An honest fire.
- `a gilt candelabrum` (obstacle; lit, half guttered out): man-high, three scrolled feet, a baluster stem, its arms spread across
  the eye's view in two pairs round a fifth candle.
- `a crystal chandelier` (obstacle that hangs, no shadow; lit, out): a gilt baluster and bowl, twelve S-scrolled arms to their
  candles in two tiers, festoons of crystal swagged from arm to arm, a long drop from each, a cascade under the bowl.
- `a gilt sconce` (on the wall; lit, out): a back plate of gilt under a fanned shell, two scrolled arms, a candle in each.
- `black velvet at a window lit red` (on the wall): a tall Gothic window of the black room, its scarlet panes and the fire
  behind, black velvet curtains hung from a scalloped pelmet, drawn back to gilt tie-backs, pooling on the floor, the red on
  the edges of their folds. Its light: the fire through the scarlet glass (`RED_WINDOW_LIGHT`).
- `a tapestry of the masque` (on the wall; whole, torn): the tale's "arabesque figures": three masked dancers hand to hand on an
  indigo field scrolled with leaves, a border of wine dotted with gilt, a fringe; torn, a rent up from its foot and a strip loose.
- `a pier glass, its glass gone` (on the wall): a tall carved gilt frame, a cresting of scrolls and a shell with the prince's
  mask, its glass gone, a shard or two left in the rebate, the dark backboards behind.
- `gilt ornaments hanging from the roof` (obstacle that hangs; two frames, turned): the tale's "golden ornaments that...
  depended from the roof": a sun with the prince's smiling face, a crescent, a star, each on its long chain.
- `a gilt chair` (breakable): a ballroom's, cabriole legs, a seat and an oval back of cream silk in gilt; smashed.
- `a fainting couch` (obstacle; along x, along y): dark wine velvet, buttoned, a scrolled end, a low back, gilt legs.
- `a card table with royal cards` (breakable): green baize in gilt on cabriole legs, the four royal cards fanned face up (the
  Princess violet, the Prince wine, the Queen indigo, the King gilt, each under its crown), the pack, counters, cold candle
  stubs; overturned, its cards flung over the floor (the set's event).
- `royal cards, scattered` (on the floor): the four royals face up among others face down.
- `a buffet of a feast gone cold` (obstacle; along x, along y): a white damask cloth falling in folds; a roast half carved on a
  silver charger, a tazza of fruit tipped and the fruit rolled out, a pie cut, a tiered cake slumped, a ewer and goblets (one
  knocked over, its wine soaked into the cloth), candlesticks burnt to the socket.
- `a harpsichord` (obstacle; along x, along y): its true shape (the straight spine, the bentside curving in to the tail), black
  lacquer banded in gilt, on six turned legs; its lid raised, painted inside with a garden under a pale sky; the soundboard and
  its rose; two keyboards, naturals black, sharps white; music on its desk.
- `a viol and its stand` (breakable): a gilt music stand with its sheet, a bass viol (sloped shoulders, C-holes) leaning on it,
  its bow; knocked over, the music scattered.
- `a folding screen of arabesques` (breakable): four leaves in a zig-zag, gilt frames round panels of gilt arabesques on wine,
  a masked dancer on the middle two; knocked flat.
- `a footman's tray` (breakable): a silver salver on its folding stand, a decanter of wine, goblets, a napkin; dropped, the glass
  broken, the wine run out.
- `masks dropped on the floor` (on the floor): half-masks of the ball, gilt with a plume, white trimmed in gilt, black velvet,
  violet; their eyes dark.
- `wine spilled` (on the floor): a silver goblet on its side, its wine run out in a dark pool (a red past the enemy's pink).
- `gilt ornaments, scattered` (on the floor): the tale's "golden ornaments that lay scattered to and fro": a star, a crescent,
  a length of chain, beads, a tassel.
- `the royal crest in the floor` (floor tile): an octagon of black marble in a band of gilt, the royal swan inlaid in white: the
  house's own crest, the same drawing the palace guard wears (art/palace_guard.ts).
- `the great doors` (door; shut, open; on both faces): a pair of tall white doors, their panels framed in gilt, under an
  architrave and an overdoor of gilt scrolls with the prince's smiling mask.
- `the iron gates, their bolts welded` (gate; shut and open, looking along +y and +x): two tall leaves of wrought iron between
  stone piers, a great bar across through staples and bolts into the piers, all fused in black burnt lumps where the hammers
  welded it; forced open, the bar sheared and hanging, the welds broken.
- `the prince's bargain with the Order` (the quest): on a little gilt table, a salver, and on it the bargain (his doc: "the
  prince opened the city to the Silent Order in return for his walls") written on parchment, sealed in the prince's gilt and
  in the Order's black wax, blank as their masks; a quill. Its own pale light.

WHAT GIVES LIGHT (Colour 3): only honest flames (the braziers; the candles of the candelabrum, the chandelier and the sconce,
an honest orange), that fire through the scarlet glass of the curtained window, and the quest's own pale light. Nothing cyan, no
pink.

THE PRINCE'S MARK: his doc's "smiling gilt mask" is set about the palace as his mark (the clock's arch, the great doors, the pier
glass, the hanging sun), small, a face of gilt with its eyes and mouth curved up.

## A corner laid from the game-ready parts (src/dev/masque_level.ts, masque_lay.ts, preview_masque.ts)

`dev/masque_level.ts` lays the first look's corner on the game's tiles: the violet room (8 by 8), the black room west of it, the
white room north-east, a card room south-east, the gallery south (irregular, four tiles across under the violet room, three
under the passage), the servants' passage between it and the black room; one tile of wall between; each doorway two tiles wide.
`dev/masque_lay.ts` sets the pieces on it as the game may (on the walls at their wall's foot line; on the floor; what stands,
far to near). THE SEVEN ROOMS ARE LIT THROUGH THEIR WINDOWS (the tale: no lamp or candle in them); the candles are the gallery's
and the card room's; the braziers stand in the passage.

- `phone`: one phone screen (507 x 234 game pixels), the camera on the knight, the dungeon's dark as the game lays it (render.ts:
  FAR_DARK over all, the hero's pool and each light's taken out of it, the vignette), the pieces' lights and the windows' over
  it: `pictures/game_phone.png`.
- `overview`: the whole corner as built, no dark: `pictures/game_overview.png`.
- `black`: a phone screen of the black room, its clock at its chime: `pictures/game_black.png`.
- also `phone-bare`, `ground`, `tiles`, `close:X:Y`.

## The pictures (docs/mockups/masque/pictures/)

PICTURES_LIST

## Bringing it in (the main chat's)

- The ground as floor 14's is hooked in (render/outdoor.ts `landLook`): `masqueLook({ floor, zone })` for floor 17, its map-maker
  giving each walkable tile its `MQ_ZONE`. The level's own rule from the tale: the seven rooms in their order, each a different
  turn of the suite ("a sharp turn at every twenty or thirty yards"), galleries, card rooms and passages between.
- The windows' lights: `masqueWindows(land)` lists where the ground painted each, its colour and its light, for the game to
  take the dark away round each as it does round a brazier (otherwise the dark covers the far walls' windows).
- The clock: `CLOCK_FRAMES` (its pendulum's four frames over and over; its chime's two when it chimes: his doc's hazard).
- The pieces: `masquePieces()`, each as floor 15's are laid (render/act1_pieces.ts): what hangs (`a crystal chandelier`, `gilt
  ornaments hanging from the roof`) as floor 15's chandelier, no shadow; wall pieces at a far wall's foot, `left` on a wall along x
  and `right` along y.

## The checks

TEST_COUNTS

## For him to decide (or the art chat to ask)

- CANDLES IN THE SEVEN ROOMS. The tale has none in them ("no light of any kind emanating from lamp or candle within the suite of
  chambers"): they are lit through their windows by the braziers in the corridors behind. His doc's palette has "candlelight".
  As made, the seven are lit by their windows, and the candles (the candelabra, the chandeliers, the sconces) are the galleries'
  and the card rooms'. If he wants candles in the seven too, the pieces are ready for it.
- THE ROOMS SHOWN. The first look shows the white, the violet and the black rooms (the tale's order, so the black room's doorway
  is where the tale puts it) rather than the blue and the purple; the ground has all seven, and the checks paint all seven side
  by side.
- THE BLACK ROOM'S RED. The scarlet panes burn bright (an honest fire through red glass, left bright as his Colour 3 lets fire
  be), in the honest fire's own colours, so they read fire-red more than a pure blood red. The light they throw on the velvet is
  a dark red: under his Colour 4 (a place's colours under the dullest word's) a brighter red on the floor turns a greyed pink.
- THE PRINCE'S MASK AS A MARK about the palace (the clock, the doors, the pier glass, the hanging sun): from his doc's "smiling
  gilt mask"; his look itself is the boss helper's, after his brief.
- THE ROYAL CREST: the house's own white swan, as the palace guard wears it, since the Prince is of the same royal house.
- THE QUEST: "the prince's bargain with the Order", made from his doc's story thread; whether it is the floor's quest is his.
- THE GATE: the iron gates with their bolts welded are the tale's (the abbey's outer wall); here they are the floor's gate.
