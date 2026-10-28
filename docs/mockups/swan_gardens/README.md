# Floor 16, the Swan Gardens: its art (mock-ups; the art chat's branch `mockup/swan-gardens`)

The art chat's branch, from `origin/v23` at 457661b. Nothing here is in the game until the main chat puts it there. Nothing of the
game imports any of it.

The measure is his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat, 28 Oct
2026), level 16, THE SWAN GARDENS: "Through the shut gates and up the hill through the palace's terraced gardens."; its layout
"open, like the Millrace: terraces stepping up the hill joined by stairs, clipped hedges and a hedge maze, rose arbours, still
fountains, and a long lake with a pavilion on an island"; its hazards "nettle beds that sting and slow whoever walks through
them; the lake's deep water"; its enemies "the Hushed gardeners and grooms, the palace guard, and the swans"; its palette "Dawn
rose, swan white, deep hedge green"; its boss the Princess, on the Swan Pavilion. Its story from Andersen's "The Wild Swans"
(1838), drawn only from the book.

## His words, in order

- 28 Oct, to the art chat, asked where to start the High City: “Level 16 in full”.
- The first look, painted (`src/dev/garden_paint.ts`, `src/dev/preview_garden.ts`), asked "is this the place?": “Yes, go on
  (Recommended)”, offered as: next, make the ground and its pieces game-ready, then the swans as enemies.
- The ground and its 25 pieces, game-ready, built into a corner of the gardens (`src/dev/preview_swangardens.ts`): “Good, on
  to the swans (Recommended)”.
- The swans' brief (his art rulebook, "A new character", and sound rule 7), his answers: what they are, “Plain swans gone
  wild”; their size, “Knee-high, in flocks”; how they move, “Waddle and charge”; the one thing to know them by, “Wings raised
  in threat”; their attack, “Hissing lunge, a bite”; their death, “Bursts into feathers (Recommended)”; what they must never
  look like, “Not a goose or duck”; their sound, “Hiss and honk”. Read as: plain wild swans, the court's own, no crowns and
  nothing of the story (so the eleven on the lake lose their crowns too); knee-high, in flocks, fun to smash; on foot,
  waddling, charging heavily, the neck forward, the wings always arched over the back; small, so one attack.
- The swans' sheet and film, asked "are these your swans?": “Close, change something”; then, asked what: “The wings are weird
  looking, like they’re in two separate pieces?”. Read as: each wing looked broken into chunks (three lumps and a bar of
  flight feathers under them); so each wing is now one curved sail of feathers from its root on the body up over the back,
  its rows of feathers running unbroken along it, and the pair raised higher.
- The new wings (before and now, the sheet, the film), asked "are these your swans now?": “Yes, they're the swans
  (Recommended)”, offered as: next, the Hushed gardeners and grooms.

## The first look (src/dev/garden_paint.ts)

A painting of one corner of the gardens, the terraces true to their heights: three terraces up the hill to the upper right,
each faced in pale dressed stone with a balustrade and a stair up the middle between piers with urns; the hedge maze on the
top one; on the middle one a parterre (four beds of roses edged in box, the near right gone over to nettles), the still
fountain with its stone swan, rose arbours over the cross walk, yew cones; on the lowest the lake walk, a rose arbour, a bed
of nettles, the long lake at dawn with mist on it, the Swan Pavilion on its island, eleven swans with golden crowns (her
brothers, the book's). Dawn light from the upper left, long shadows.

## Its ground, game-ready (src/art/swangardens.ts; painted by src/art/terrain.ts)

- `swanGardensTerrain(floor, land)`: the ground for a floor, from what only the level knows (`SwanLand`, each optional):
  `lake(tx, ty)` (its tiles, not floor), `walk(x, y)` (gravel), `paved(x, y)` (flags: a terrace wall's row, a fountain's
  apron), `bed(x, y)` (bare earth), `nettles(x, y)` (how far into a bed of nettles; the painter rags its edge). The hedges
  throw their shadows across the floor away from the low sun. (`swanGardensLook(land)` is the look alone, without the
  shadows.)
- `paintSwanGardens(T, x0, y0, w, h)`: a piece of it as `paintTerrain` paints it, the lake's water painted into the drop:
  every pixel opaque, two pieces side by side one picture. (The game's hook is as floor 15's stacks: this in place of
  `paintTerrain` for floor 16.)
- THE FLOOR: clipped lawn mown in broad stripes; gravel; flags; earth; the nettles (dark, toothed, wine-stemmed, their
  stinging hairs pale); a kerb of stone along the lake, its lit lip over the water.
- ITS WALLS ARE YEW: every tile neither floor nor lake is clipped yew `HEDGE_H` (60) high, its faces close and dark, lit to
  the lower left; its top clipped flat; a tile and more back from the floor, the woods. Near hedges cut away as the game cuts
  them (his rule for every outdoor floor). A hedge maze is laid as tiles of it.
- THE LAKE is the ground's drop: the lawn ends at the kerb, its face standing out of the still water (`LAKE_DOWN`, 10, under
  the lawn); the water the dawn's one colour, faint stirs, lines of light, the kerb's likeness, wisps of mist.

## Its 25 pieces, game-ready (src/art/floor16.ts `swanGardensPieces()`, the Princess's)

His rule of 10 Oct, 14:54: “Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” These are
the Princess's; the High City's own 25 (the set for floors 16 to 20) are not made yet. Built in the Act 2 kit
(`src/art/act2_kit.ts`) as floors 11 to 15's are.

a terrace wall (along x or y), a stair's pier (along x or y), the terrace stair (along x or y; laid as what lies on the floor),
a yew cone, box edging (along x or y), a rose bush (breakable: whole, trampled), a bay tree in its tub, a topiary swan, the
still fountain (three tiles across), a stone swan on its plinth, a sundial, a stone bench (along x or y), an urn of roses
(breakable), a rose arbour (along x or y; whole, and half there while someone is under it), the Swan Pavilion on its island
(it stands in the lake; the island is its own; its likeness in the water before it), nettles (the trap: still, stirred),
trodden nettles, for their flax (on the floor), a nettle shirt, half woven (the quest; on the floor), a garden gate (shut and
open, across x or y), a lantern on a post, a boat at the landing, a swan's nest, a gardener's barrow (breakable), clippings and
shears (on the floor), swan feathers (on the floor).

WHAT GLOWS (Colour 3): only the lantern's candle (an honest flame, burning on into the dawn) and the quest's own pale light.

HOW THE TERRACES GO IN (the game walks on one level): a terrace's wall is a row of tiles that are floor, `a terrace wall` on
each, its face on the tile's near edge filling the row (32 high), its coping and balustrade over the row behind. The stair
is built true: laid with its feet on tiles (tx, R + 1) and (tx + 1, R + 1) of a wall's row R, it climbs one tile and a man's
waist, and on the picture its head lands one tile toward -x (a climb in this camera goes straight up the screen). So the
wall's row is open from tx - 1 to tx + 1, `a stair's pier` on (tx - 2, R) and (tx + 2, R), and the walk off it on (tx - 1,
R - 1) and (tx, R - 1). `src/dev/swan_lay.ts` lays it so; `src/dev/swan_level.ts` is a corner of the gardens laid by hand.

## The swans, floor 16's small mob (src/art/garden_swans.ts; behind `SWAN_ON`, off)

Built on the creature rig as the fog wolves are: its own pose and solids, painted from in front and from behind
(`makeSwanArt()` gives `{ front, back }`: idle, walk, attack, clips attack, die, reel). `SWAN_SIZE` 1.15 of its own measures;
on the floor about knee-high to the knight with its neck up.

- STANDING: its neck up in its S, its wings arched over its back; it breathes, its wings ruffle, it glances aside, now and
  then it hisses, the bill open.
- THE CHARGE (`SWAN_PACE` tiles a second): a heavy waddle, rocking foot to foot, its neck forward and its wings up; its
  feet carried back under it at its pace, so on the floor they grip.
- ITS BITE (`SWAN_BITE`): the warning (to `lunge`, 0.36 s) a crouch, the neck drawn back, the bill open, a hiss; the lunge,
  the neck thrown out and the bill shut at `hit` (0.5 s), its near foot stepping in; back on its stand by its end (1.05 s).
- STRUCK (`SWAN_REEL`): knocked back on its heels, its wings flung up, a few feathers torn off.
- ITS DEATH (`SWAN_DIE`): struck, then knocked over onto its side, the wing under it laid flat, its neck along the floor;
  its feathers burst from it and drift down to the floor.
- ITS WINGS: each one sail, laid as eleven slices side by side from the shoulder back to the tail, each from the wing's
  root on the body up to its arched top edge; its two rows of feathers' ends scalloped and unbroken along it; the inside,
  turned to the back, a step into shade.
- NO GLOW: white plumage greyed to the dawn, an orange bill with its black knob, black legs; the enemy's rim.

## The dev pages

- `src/dev/preview_garden.ts` (the painting): `overview`, `phone`, `close:X:Y`.
- `src/dev/preview_swangardens.ts` (built from the game-ready ground and pieces, the knight on the lake walk; the swans the
  painting's, not yet enemies): `overview`, `phone`, `tiles`, `close:X:Y`.
- `src/dev/preview_floor16.ts` (the pieces): `all`, `range=A-B@K`, `look=<name>@K`, `show`.
- `src/dev/preview_swans.ts` (the swans): `sheet` (from in front and behind beside the knight, three times as big; a flock at
  the game's size), `big:<move>:<t>`, `strip:<move>:<view>:<n>`.

## The checks

- `tests/swangardens.test.ts` (7): nothing of the game imports it; walkable tiles floor, the lake's the drop, every other
  yew; pieces side by side one picture; every pixel opaque; no cyan, no pink, every colour under the dullest word's; green
  the most of what is walked on, the dawn's lavender in the lake; the yew's shadow falls away from the sun; the nettles show,
  the kerb's stone.
- `tests/floor16.test.ts` (8): nothing of the game imports them; 25, each its own name; pictures as many as each says; only
  the lantern and the quest give light; crisp; no cyan, no pink, under the dullest word's; each stands on its foot; nothing
  cut off; a terrace wall's face fills its row.
- `tests/garden_swans.test.ts` (13): nothing of the game imports it, its switch off; crisp, the enemy's rim; no cyan, no
  pink, no light, nothing cut off; its size; FLOOR (nothing under it in any frame); FEET GRIP; nothing THROUGH its body;
  JERK and JUMP; ALIVE; its bite; its death; its pictures.
