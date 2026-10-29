# The High City's own 25, for floors 16 to 20: its art (mock-ups; the art chat's branch `mockup/high-city-set`)

A helper's branch for the art chat, from `origin/mockup/swan-gardens` (55945b3; its later hand-back commits merged in at
e723ada). Nothing here is in the game until the main chat puts it there. Nothing of the game imports any of it (its test
proves it). NOT YET SHOWN TO HIM: these are the pictures the art chat brings him for his yes. (Per the art chat: he has since said
yes to all five floors' places and every character, and picked the royal swan for the royals' mark.)

## The measure

His rule for a set of floors, 10 Oct: “Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each
boss.” Floors 11 to 15 have theirs (the Hush's, `src/art/act2_set.ts`), the model for this one; each boss's own 25 are other
helpers' (floor 16's, the Princess's, are in `src/art/floor16.ts`). These are the ones any of the five floors can use.

His plan doc, "Wordsmith Act 2, Part Two: The High City (Levels 16–20)", his pick “Yes, go (Recommended)”:

- "Levels 16 to 20 finish Act 2 in the High City on the hill: four royal bosses, then the Moth, the horror that makes the
  Hush."
- "The Censor is dead and the Lower City speaks again, but the Hush did not begin with him. The book's last chapter was torn
  out and carried up the hill, and the High City's gates swung shut behind it. The royal family has locked itself in with
  that chapter. While the city below lost its voice, the court went on as if nothing were wrong: gardens, a masked ball, a
  hall of mirrors, a dying king in a silent palace. Each royal made a bargain with the Hush, and each paid for it in a
  different way."
- "The thread: in the Lower City the words were stolen; up here they are given away. Every royal traded words for
  something, and the horror grew fat on them."
- The five: 16 the Swan Gardens (the Princess; dawn rose, swan white, deep hedge green), 17 the Masque (the Prince; seven
  rooms of seven colours, candlelight, black velvet), 18 the Glass Gallery (the Queen; silver, cold blue glass, dark
  violet), 19 the Keep (the King; cold stone, royal blue, old gold), 20 the Quiet Tower (the Moth; grey fog, bone white, no
  colour at all).
- The set's event, his own idea, the Royal Cards, as the doc reads it: "on these levels some enemies are touched by one of
  the four royals, the Princess, the Prince, the Queen or the King, and show it (that royal's crest over them). They drop
  cards: each drops its royal's playing card." His picks: “Just the four royals” (Princess, Prince, Queen and King cards)
  and “Any of 16-20, mixed” (on every floor some packs carry a royal's crest).

## What the set is

The court shut in on the hill with the Hush, left as it was when the gates closed: the royal house's things out on the hill
(its railings and gate, its lamps, a sentry box with no sentry, a king's statue, the fountain of the four royals, the state
coach abandoned in the forecourt), the palace's rooms (its doors, sconces, a portrait, gilt chairs, a card table, a
candelabrum, a grand vase, a carpet down the hall), the party it went on having as if nothing were wrong (the tea left out,
cloaks never collected, invitations never sent, a fan dropped), what has gone silent (the heralds' trumpets stopped, the
court's notice gone blank, the songbird's cage empty), and the Silent Order's mark on it all (its blank mask nailed over the
royal crest, tied to the railings, over a sealed door, and a black band across the stone king's mouth). And his event: the
four royals' banners and the cards their touched enemies drop, each with the royal swan in that royal's colours.

Built in the Act 2 kit (`src/art/act2_kit.ts`) as floors 11 to 16's pieces are: in depth in floor 4's Scene, lit from the
upper left, seams of ink where one thing ends before another, every colour a step quieter than any word
(`src/art/act2_quiet.ts`).

## Its 25 pieces (src/art/high_city_set.ts `highCitySetPieces()`)

ON THE WALLS (each on both faces, at three spots: see "Hung on a wall"):

1. `a royal's banner` (on the wall; four: the Princess's, the Prince's, the Queen's, the King's): hung from a gilt rod on
   two brackets, the cloth in that royal's field and trim, its foot cut in a swallowtail and fringed in gold, the royal
   swan on it.
2. `a court portrait, faces painted out` (on the wall): the King and the Queen half-length in a heavy gilt frame with a
   crown on its crest, he crowned in ermine and royal blue, she in violet with a coronet; over both their faces a smear of
   the Hush's grey, brushed on thick and run down.
3. `a gilt sconce` (on the wall; lit, two frames; out): a carved back-plate, two scrolled arms, a candle in each with an
   honest flame.
4. `a court notice, gone blank` (on the wall): a board in a gilt frame under a crown, its sheet with nothing left on it but
   the ruled lines the words stood on, the royal seal in wine wax on its ribbons.
5. `the Order's mask over the crest` (on the wall): the royal crest carved in the palace's pale stone (a shield, the royal
   swan on it, a carved crown over it), and nailed over it the Silent Order's blank white mask with no mouth, two streamers of
   black crape.
6. `a palace door` (a door; shut, open, sealed): tall double doors painted ivory, panels moulded in gilt, the crown over
   them, between pilasters of the palace's stone; open on the dark; or sealed by the Order, a chain through its handles, a
   lock, the blank mask nailed over the meeting of its leaves.

OUT ON THE HILL:

7. `a gilt lamp post` (an obstacle; two frames): a stepped stone foot, a fluted post painted black-green with gilt collars,
   a lantern of four tapering panes under a roof with a small crown, its honest flame within.
8. `palace railings` (an obstacle; along x, along y; and the same with the Order's mask on them): a tile of them, a stone
   plinth, iron bars to gilt spear-heads, the royal swan on a gilt medallion; the Order's mask tied on with black ribbon,
   a black rag knotted by it.
9. `a sentry box` (an obstacle; its opening to +y, to +x): its guard gone, boards in broad stripes of the royal wine and
   ivory running up it, its front open on the dark, the royal swan painted over the opening, a slate pyramid roof with a gilt
   finial, a halberd left leaning by it.
10. `a marble statue of a royal` (an obstacle): a king of the house larger than life on a plinth whose plaque is blank,
    crowned and bearded, robed and belted, in an ermine cape with a cloak behind, his sceptre raised high, his left hand on
    a sword grounded before him; and tied across his mouth by the Order, a band of black cloth.
11. `the fountain of the four royals` (an obstacle; two tiles across; seen from before and from behind): a basin of four
    lobes in white marble, its water still; a pedestal with the royal swan inlaid on each face in a royal's colours (the
    Princess's and the Prince's toward the eye in the first frame, the Queen's and the King's in the second); a bowl, the
    crown on its cushion over all.
12. `a royal coach, abandoned` (an obstacle; its pole to +y, to +x): the state coach left in the forecourt when the gates
    shut: the royal wine moulded in gilt, its upper half boxed with great windows, its lower half bowed under like a
    boat's hull with the royal swan on it, hung on its springs between great wheels; its right-hand door hanging open on the
    dark; a gilt rail round its roof and the crown on it; the coachman's seat, its lamps, its pole down on the ground.
    Built half as big again as it is measured (a state coach stands well over a man's head; beside the knight it did not).

IN THE PALACE'S ROOMS:

13. `a velvet rope barrier` (an obstacle; along x, along y): three brass posts, a rope of the royal wine sagging between.
14. `a gilt chair` (breakable; whole, broken): a fauteuil on four cabriole legs, its seat and oval back in the royal wine,
    its frame carved and gilt; broken, knocked over on its side, a leg snapped off and lying by it.
15. `a royal card table` (an obstacle): gilt, on cabriole legs, its top of green baize; the four royals' cards fanned on it,
    the deck, gilt counters, a pair of silver candlesticks long out.
16. `a silver tea service, left out` (breakable; whole, broken): a round tea table on a tripod; a silver teapot, the sugar,
    cups and saucers of white porcelain banded in blue and gold, a stand of cakes gone stale; broken, the table over, the
    teapot on its side, the cups smashed, the cakes across the floor.
17. `a grand vase` (breakable; whole, broken): a baluster vase of royal blue porcelain, a white reserve on its belly with the
    royal swan in gilt, gilt bands, its lid knobbed, on a marble pedestal; broken, smashed across the floor, the pedestal bare.
18. `a hat stand, cloaks left on it` (an obstacle): a turned walnut stand, a velvet cloak of the royal wine, a broad hat
    with a swan-white plume, a gilt mask for the masque hung by its ribbon: the guests never came back for them.
19. `the heralds' trumpets, stopped` (an obstacle): a walnut rack with two long brass trumpets, their bells flaring toward
    the eye, a banner of the royal wine with the royal swan hanging from the nearer; both bells stopped by the Order with black
    wax, the blank mask pressed in it.
20. `a standing candelabrum` (an obstacle; lit, two frames; out): a girandole as tall as a man, three scrolled feet, a
    turned stem, five branches, five candles with honest flames.
21. `a songbird's cage, silent` (an obstacle): a gilt stand, a domed cage of gilt wire hung from its arm, its door open, its
    perch empty, a feather on its floor.

ON THE FLOOR:

22. `a royal carpet` (a floor tile; along x, along y): a tile of a runner of the royal wine bordered in gold, a chain of
    lozenges down its middle, worn pale where the court walked; laid tile after tile it runs on seamlessly.
23. `a heap of invitations` (on the floor): a dropped silver salver, the invitations to the masque spilled from it,
    gilt-edged cards and letters sealed in wine wax, a ribbon.
24. `a dropped fan and a rose` (on the floor): a lady's folding fan lying open, its pleats light and shade by turns, a band
    of roses painted near its edge, its guards gilt; a rose dropped by it.
25. `a royal card` (a quest; four: the Princess's, the Prince's, the Queen's, the King's): THE CARD A TOUCHED ENEMY DROPS,
    lying face up and square to the eye: a white border, the royal's field, the royal swan large in the middle and small in
    two corners.

## The royal swan (his Royal Cards): HIS PICK, “Keep the royal swan”

"(that royal's crest over them)", "each drops its royal's playing card": asked what the royals' mark should be, his pick
was “Keep the royal swan”: one crest for the whole family, the white swan with its wings raised (the palace guard's of floor
16). It is drawn once (`swanTone`, a real shape with its own lit and shaded edges and its row of feathers, readable from 14
pixels across) and set on each royal's banner, card and face of the fountain of the four royals in that royal's own colours
(`ROYAL_LOOK`), which is how the four tell apart: the Princess's deep hedge green trimmed in dusty rose, the Prince's black
velvet trimmed in gold, the Queen's dark violet trimmed in silver, the King's royal blue trimmed in gold. The same swan is the
crest on all the court shares: the railings' medallion, the coach's sides, over the sentry box's opening, the vase's
reserve, the trumpets' banner, and carved on the stone shield the Order's mask is nailed over. The crest the game draws over
a touched enemy can be the same swan, in that royal's colours (the main chat's).

On a banner and on the fountain's pedestal the swan is drawn square to the eye (the wall's slant taken out of it), and on a
card upright (not shortened as the card lying flat is), so that it reads.

## What glows (Colour 3)

Only honest flame, in orange: the gilt lamp post's, the sconce's and the candelabrum's (each also put out, giving no light).
Nothing cyan, no pink: the royal wine is a deep claret leaning to red, every hue of it past 350 degrees even on a wall's face
in shade (where the kit takes colours toward the dark: at first it slid to 348 there, and was moved); the Queen's violet and
the King's blue lie well short of the pinks and the cyans.

## Hung on a wall

As the Hush's set's are (`frontPiece`, both faces), each at three spots (`Piece.spots`, as Act 1's floors give them, so that
no two hang in the same place): the first on a room's wall (the game's walls of 80 picture pixels: what hangs is between 20
and 84 up), the second along it, the third 34 higher, for a tall hall or a palace front (150). The door has its one place.
The floors 17 to 20's walls are not drawn yet: these are measured to the game's own and to the Gate Ward's house fronts.

## The pictures (docs/mockups/high_city_set/pictures/)

- `sheet_1_walls.png`: the six that hang on a wall, every frame, on a wall of the palace's stone, three times the game's size.
- `sheet_2_outside.png`: the six that stand out on the hill, every frame, on floor 16's own lawn and gravel, twice the size.
- `sheet_3_rooms_and_floor.png`: the thirteen of the palace's rooms and the floor, every frame, on a marble floor, twice.
- `royals.png`: the four royals' banners and cards side by side, three times the game's size.
- `gardens.png`: the set laid where floor 16's gardens meet the palace (its own ground, `src/art/swangardens.ts`, its own
  yews and roses): the railings and the gate between two sentry boxes, the heralds' trumpets, the fountain, the coach on the
  drive, the carpet laid from its door across the lawn to a garden party left out (the card table, the chairs, the tea, a
  candelabrum still burning, the songbird's cage, the cloaks, the invitations, a fan), a royal card dropped on the drive, a
  king's statue by a bed of roses; the knight on the drive. At the game's size.
- `gardens_close.png`: its middle, twice as big.
- `palace_room.png`: a stand-in room of the palace (a marble floor; walls of a walnut dado under a gilt rail and panels of a
  dark damask framed in gilt; the rooms of floors 17 to 20 are not drawn yet): its walls hung with the four banners, the
  portrait, the sconces, the notice, the mask over the crest, the door standing open; the carpet down from the door, the
  ropes either side, the candelabra, the vases, the card table and chairs, the tea broken, the hat stand, the trumpets, the
  cage, the floor's things; the knight. At the game's size.
- `palace_room_close.png`: its middle, twice as big.

## The dev page (src/dev/preview_high_city_set.ts)

`sheet:1`, `sheet:2`, `sheet:3` (the sheets), `look=<name>@K` (every picture of one piece, K times as big: a wall piece's
both faces at every spot), `marks` (the swan alone, in each royal's colours, at 14, 20, 28 and 56 pixels across), `royals`, `garden`,
`garden:2`, `room`, `room:2`. For example:
`PREVIEW_TIMEOUT=300000 node tools/preview.mjs src/dev/preview_high_city_set.ts shots/hc/sheet1.png 1200 2400 "sheet:1"`
(the sheets are taller than the window: the pictures here were cut to what is drawn).

## The checks

- `tests/high_city_set.test.ts` (9): nothing of the game imports it; 25, each its own name, and none of floor 16's own;
  every piece as many pictures as it says (a wall piece on both faces at each of its spots, its first spot its own); only
  honest flame gives light, in orange, the lit frames and not the ones put out; crisp (no soft pixels, no loose ones); no
  cyan, no pink, every colour under the dullest word's; each stands on its foot, the carpet inside its tile's diamond;
  nothing cut off at its picture's edge; his Royal Cards: each royal's card and banner in that royal's colours and none of
  another's.
- `tests/floor11.test.ts`: its import check (nothing else imports Act 2's kit) told of this mock-up, as the swan gardens'
  branch told it of floor 16. Nothing else in it changed.
