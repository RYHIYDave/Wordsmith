# THE FROZEN MERE: one of the towns to unlock or buy

His pick of which town next, 14 Nov 2026: “10 The Frozen Mere (Recommended)”. The sketch he kept (docs/mockups/endless_town,
10): “Stalls and tents out on a frozen lake in falling snow round one fire; the way down is a hole cut in the ice.”

Drawn straight to the game's standard, as he asked of the isle's mock-up (“Actually redraw it, don’t just leave these mock up
drawings”); the stations where the sketch had them, the back laid out again so that nothing stands in front of another. And,
by his rule of the same day, its OWN VENDORS: his words, “We want different looking vendors for different towns”; his pick,
the armourer, the mystic and the stranger given new looks that fit the town, on their same moves, their stalls to match, the
wordsmith the same in every town.

## What is in it

- THE GROUND (`src/art/frozen_mere.ts`), painted as the Shaft's Rim's and the isle's are, every picture pixel a line of sight
  (here the ground has height: the bank of snow stands up, the hole goes down): the night sky; the far shore, low white hills
  black with pines; the mere, dark ice to the horizon, pale cracks, snow blown across it in streaks; THE CAMP in the middle,
  its snow trodden flat, paths worn through it, the snow melted round the fire to wet black ice; a drifted BANK of snow round
  it all; THE HOLE cut in the ice for the way down, black water in it; the portal's round, swept to the clear ice.
  `MERE_LAYOUT` (every station's tile), `inCamp(x, y)` (where a body may stand), `snowAt(t)` (the falling snow: where each
  flake is at time t).
- THE THINGS (`src/art/mere_stalls.ts`): the one fire, logs in a cone in a ring of stones, sparks going up; the smith's forge
  on a sledge (an iron firebox, a hood and a pipe, snow on the hood); the anvil on a stump; a rack of dark wood (ice-axe,
  spear, sword, a red and cream shield); the quench, a hole in the ice with a blade cooling in it; the seller's booth (a back
  of planks, a red canvas roof with snow on it, icicles, a string of little lanterns); his counter (a blue cloth; candles
  alight, charms of glass, jars, mittens, an ice crystal, cyan); a round braided rug; the ice-fisher's hut on runners the
  stranger leans on; the ladder in the hole; six blocks of ice round the portal's round.
- THE PEOPLE (`src/dev/sculpt_mere_folk.ts`), on the town's builds and moves: THE SMITH (a quilted oxblood coat, sleeves
  shoved up, a fur hat with its flaps tied up, a brown scarf, a black beard with frost in it, a leather apron, felt boots,
  his hammer and sparks); THE SELLER (a long quilted blue coat with a white stitched hem, a white fur collar, a grey fur hat,
  a long grey moustache; over his palm an ice crystal of six points, cyan, which lifts and blazes as the mystic's did); THE
  STRANGER (a dark parka, its hood up and ringed with fur, his face a shadow with two pale points, never gold; fur boots;
  his coin).
- The rest is the game's own (the wordsmith, his ring and stones, the Lexicon, the stash, the waypoint) in a cold grey stone,
  and the Shaft's Rim's gate, record, trophies and lamps (`src/art/shaft_props.ts`).

## Pictures

`pictures/mere_whole.png` (the whole camp); `pictures/mere_view_1..3.png` (one phone screen each, the camera on the knight);
`pictures/mere_people.png` (each of the three beside the town's own). Pages: `src/dev/preview_mere.ts` (modes `whole`,
`view:1..3`), `src/dev/preview_isle_folk.ts` (hash `4:mere`).

## For the main chat

Nothing of the game imports it. Built on the branch art/isle-of-stones (it uses the sculpting helpers that branch exported
from `dev/sculpt_townsfolk.ts`): bring that in first. When the towns come into the game: how each is won is yours; the Mere's
three people need their frames baked as the town's are (`tools/bake_townsfolk.mjs`, `art/townsfolk3.ts`) from
`sculptMereSmith`, `sculptMereSeller` and `sculptMereStranger` on the town's own moves; the falling snow is `snowAt(t)` drawn
over everything, as the preview does.
