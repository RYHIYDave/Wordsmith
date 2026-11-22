# THE STILT TOWN: one of the towns to unlock or buy

His pick of which town next, 14 Nov 2026: “3 The Stilt Town”. The sketch he kept (docs/mockups/endless_town, 3, floor 10, the
Sunken Fen): “Each station on its own platform over black water, lanterns doubled in it: a town that should have sunk long ago.”

Drawn straight to the game's standard, as the Frozen Mere was, the stations on their platforms where the sketch had them, in the
fen's own colours (art/fen.ts: its black-green water, its sedge, its mist). And its OWN VENDORS, by his rule of 14 Nov 2026:
“We want different looking vendors for different towns” (new looks on the same moves, stalls to match, the wordsmith the same).

## What is in it

- THE GROUND (`src/art/stilt_town.ts`), every picture pixel a line of sight: a low night sky, the fen's dead trees grey in the
  mist on the horizon; the black water everywhere, scum and duckweed, the mist in pale streaks; EIGHT PLATFORMS, decks of planks
  on stilts over the water, some leaning, a plank gone here and there, and the WALKS between them; the posts under their edges
  and their doubles in the water; THE LANTERNS' LIGHT doubled in the water under each; THE HATCH cut in a deck for the way
  down, a ladder going down through it. `DECKS`, `STILT_LAYOUT`, `onDeck(x, y)` (where a body may stand), `standZ(x, y)` (how
  high a deck stands there: what stands on it is lifted so).
- THE THINGS (`src/art/stilt_stalls.ts`): the smith's forge of daubed clay on a bed of stones, its clay chimney, peat beside
  it; the anvil on a barrel; a rack of lashed poles (eel-fork, billhook, club, wicker shield); a barrel of water for the
  trough; the herbalist's hut (wattle, a reed-thatched roof, herbs hung from its eave, a lantern); his table on trestles (jars,
  one with leeches, herbs, toadstools, bottles, a caged wisp, cyan); a reed mat; the stranger's wattle shack; reeds and
  cattails standing in the water; six mooring posts round the portal's round; the fen's lanterns on poles.
- THE PEOPLE (`src/dev/sculpt_fen_folk.ts`), on the town's builds and moves: THE SMITH (a broad rush hat, a dark moustache,
  a laced jerkin of green leather, bare arms, a bracer, a muddy apron, a rope belt, waders to the thigh; his hammer and
  sparks); THE HERBALIST (a tall dark felt hat, its point flopped over, a sprig in its band; round spectacles; a thin grey
  beard; a long patched moss-green coat, a satchel; over his palm a WISP, a ball of cyan with its tail curling round it,
  which lifts and blazes as the mystic's crystal did); THE STRANGER (a ragged cowl and cloak of sacking, a mask woven of
  reeds with two pale points in its slits, never gold; wrapped legs; his coin).
- The rest is the game's own (the wordsmith, his ring and stones, the Lexicon, the stash, the waypoint) in a fen stone, and
  the Shaft's Rim's gate, record and trophies (`src/art/shaft_props.ts`).

## Pictures

`pictures/stilt_whole.png`; `pictures/stilt_view_1..3.png` (one phone screen each, the camera on the knight);
`pictures/stilt_people.png` (each of the three beside the town's own). Pages: `src/dev/preview_stilt.ts` (modes `whole`,
`view:1..3`), `src/dev/preview_isle_folk.ts` (hash `4:fen`).

## For the main chat

Nothing of the game imports it. Built on art/frozen-mere (and that on art/isle-of-stones): bring those in first. When the towns
come into the game: how each is won is yours; what stands on a deck stands `standZ` over the water; the Stilt Town's three
people need their frames baked as the town's are (`tools/bake_townsfolk.mjs`) from `sculptFenSmith`, `sculptFenHerbalist` and
`sculptFenStranger` on the town's own moves.
