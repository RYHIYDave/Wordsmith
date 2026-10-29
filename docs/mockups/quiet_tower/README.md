# Floor 20, the Quiet Tower: its place (mock-ups; the art chat's branch `mockup/quiet-tower`)

A helper's branch for the art chat, from `origin/mockup/swan-gardens` at 55945b3 (floor 16, finished and approved, the model
for all of it). Nothing here is in the game until the main chat puts it there. Nothing of the game imports any of it. This
is the floor's PLACE only (its ground and its pieces); its enemies and its boss are other helpers', after his briefs.

The measure is his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (approved by him: “Yes, go (Recommended)”),
level 20, THE QUIET TOWER, in its own words:

> "Level 20: The Quiet Tower. The lair floor that ends Act 2: the highest tower of the High City, where the last chapter was
> taken.
> - Layout: a climb up the tower's spiralling floors (a scriptorium, a bell-less belfry, rooms the fog has filled) to the
>   open top under the sky.
> - Enemies: the Hush in its own shapes, the Silent Order's last masks, and shadows of the four royals.
> - Story thread: the torn-out last chapter lies open on the tower's top. It does not tell how the story ends. It is a name,
>   and the thing it names is the Hush itself.
>
> Boss: The Moth (his pick). Its floor is the Tower Top. A vast grey moth, its wings wider than the room is long, an eye on
> each wing that opens and follows you. The dust off its wings is the Hush itself: where it falls, words go dark and sound
> dies. It never lands for long. Not gory, as you set for the Hushed, but frightening. [...] in the last [phase] it settles
> on the last chapter and its wings beat the whole top.
> The payoff: it dies screaming, the first sound it ever makes, and every word it ever swallowed pours out of it and flies
> home.
> Palette: Grey fog, bone white, no colour at all. Story beat: The last chapter, and what it names."

## His words, in order

None yet on this floor's place: these pictures have not been shown to him. The art chat brings them to him.

## The first look (src/dev/tower_paint.ts, src/dev/preview_tower.ts)

Two paintings, each built true in depth (floor 4's Scene), the floor's own pieces (art/floor20.ts) built into them by their
own builders, so the pieces in the paintings are the game-ready pieces:

- THE TOWER TOP (the Moth's floor, without the Moth): a round platform of pale flags laid in rings, 15 tiles across, a
  crenellated parapet round it standing on a corbel table, the tower's outer wall falling away under it into the fog. In the
  middle, on a dais of two octagonal steps, the last chapter lying open on its lectern. The trapdoor the stair comes up by,
  thrown open, the knight just up through it; the cold beacon; a merlon fallen inward from a gap in the parapet; torn pages,
  a fallen mask, a wing the Moth shed, the Moth's grey dust drifted on the flags and drifting in the air; fog lying on the
  flags against the parapet and pouring out through the near embrasures and down the wall. Round and below it the fog sea,
  the High City's lesser spires and the palace's dome standing out of it, the grey sky over the horizon.
- THE SCRIPTORIUM (a floor inside the tower): a round room, its far wall standing (the near wall cut away, as the game cuts
  near walls), three lancet windows with the fog's grey day in them, pigeonholes of blank scrolls, the Moth's cocoon split
  and empty on the wall, a moth-eaten tapestry, the Order's banner gone grey; the tower's stair winding up into the dark;
  copyists' desks in rows, their stools, a press of blank books, a chest of blank quires; guttering candles, the one warm
  light; torn pages, the copyists' ink gone dry, the Hush's dust; fog seeping in along the wall's foot. Shown bare, and as one
  phone screen with the dungeon's dark as the game lays it (the candles' light and the hero's pool out of it).

A liberty of the painting, for him to know: the Tower Top's painting shows the horizon and the sky, as an establishing
picture. In the game's own camera there is no horizon: past the parapet the ground's drop shows the fog sea from above (as
in the corner laid from the game-ready parts).

## Its ground, game-ready (src/art/quiettower.ts; painted by src/art/terrain.ts)

Two looks, because the tower's walls inside stand 120 picture pixels and the top's parapet 44 (one look has one height):

- `quietTowerTerrain(floor, land)`: THE INSIDE, room by room (`QT_ZONE`, what only the level knows, `QuietLand`): the stair's
  landings and the ways between rooms, flags in courses; the SCRIPTORIUM, flags spattered with the copyists' dry ink, blank
  pages dropped about; the BELL-LESS BELFRY, heavy boards of weathered grey oak; a ROOM THE FOG HAS FILLED, flags drowned
  under lying fog (`land.fog` adds fog where the level says, at a door). Over all of it the Hush's grey dust, drifted at the
  walls' feet. ITS WALLS: ashlar of the tower's stone on a plinth, bay by bay a tall lancet window with the fog's grey day in
  it, an arrow slit, an empty niche, a crack hung with moth silk; the scriptorium's pigeonholes of blank scrolls; the
  belfry's tall louvred openings, the grey sky between the slats; the top fading into the dark (in a fogged room, into the
  fog). Near walls cut away as the game cuts them.
- `towerTopTerrain(floor, land)`: THE TOWER TOP (`TopLand`: the platform's middle; which tiles fall away, by default every
  tile with no floor beside it): flags laid in rings round its middle, a round stone at the middle; fog lying toward the
  parapet; THE PARAPET is the ring of tiles round the floor, crenellated (`embrasure(px)`: merlons and embrasures along it,
  the fog sea seen through each embrasure, the sill's lit top in it), the near parapet cut down to its coping; past it THE
  DROP, and under the near parapet the tower's outer wall hanging (a corbel table under its lip, its stone lost in the fog
  as it goes down, `OUTER_H`).
- `paintQuietTower(T, x0, y0, w, h)`: a piece of either as `paintTerrain` paints it, the fog sea (`fogSea`: heaps of fog
  seen from above, drawn out along the picture, lit on their slopes to the upper left) painted into the drop and through
  the embrasures: every pixel opaque, two pieces side by side one picture. (The game's hook is as floor 16's: this in place
  of `paintTerrain` for floor 20.) The painting's spires and dome out of the fog are the painting's alone: in the game's drop
  they stood under the tower like stilts, so they are left out of it.

## Its 25 pieces, game-ready (src/art/floor20.ts `quietTowerPieces()`, the Moth's)

His rule of 10 Oct, 14:54: “Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” These are
the Moth's, themed after it and the last chapter. Built in the Act 2 kit (`src/art/act2_kit.ts`) as floor 16's are.

- THE QUEST: the last chapter on its lectern (a lectern of the tower's stone, an octagonal foot, a shaft clustered with four
  colonnettes; on its sloping rest the torn-out chapter lying open, its sewing threads hanging from the gutter; on the left
  page its lines, faint; on the right one line alone, darker: the name; a page slipping off it; its own pale light).
- THE SCRIPTORIUM'S: a copyist's desk (along x or y), a copyist's stool (breakable), a press of blank books (along x or y),
  a chest of blank quires (breakable), a heap of torn pages (breakable: heaped, scattered).
- THE BELL-LESS BELFRY'S: the empty bell frame (two trestles, the headstock, the rope's wheel, the bell's straps hanging
  empty), a bell rope hanging, the bell's clapper fallen (on the floor), the boards broken through (a floor tile).
- THE TOWER'S OWN: the tower's stair (a newel stair winding up into the dark), a door of the tower (on the wall: shut,
  open), the trapdoor to the top (a gate: shut, open on the stair down), guttering candles (two frames, the flame up and
  down).
- THE MOTH'S: a cocoon on the wall (split and empty), a moth-eaten tapestry (on the wall), a shed wing (on the floor, its
  tip curling up, its eye shut), moth silk strung from a fallen beam (breakable: whole, torn through), grey dust drifted (on
  the floor), the Hush's dust (the trap: lying, stirring, sprung in a grey cloud to a man's waist).
- THE SILENT ORDER'S LAST: the Order's banner gone grey (on the wall), a fallen mask of the Order (on the floor).
- THE TOP'S: a fallen merlon, the cold beacon.

WHAT GLOWS (Colour 3): only the guttering candles (an honest flame) and the last chapter's own pale light (the quest's, as
floor 16's shirt's). The windows' grey is daylight in an opening, never a glow. NO COLOUR AT ALL (the doc's palette): the
tower's iron is the city's iron with its blue taken out (`GIRON`); the only colour on the floor is the candles' flame.

HOW THE TOP GOES IN: the platform is floor tiles, the parapet the ring of tiles round it (not floor), the drop past that; the
ground draws the parapet and its crenels. The trapdoor to the top stands on a floor tile of the platform, where the stair
comes up. On a far wall a wall piece hangs with its foot on the face's foot ('left' on a wall along x, 'right' on one along y).

## A corner of it laid from the game-ready parts (src/dev/tower_level.ts, tower_lay.ts, preview_quiettower.ts)

Two stretches laid by hand on the game's tiles: the Tower Top (a round platform 16 tiles across, the parapet round it, the
drop past it) and four rooms of the inside (the scriptorium, the belfry, a room the fog has filled, the stair's landing,
joined by doorways); each dressed with the pieces as the game may lay them, with the knight.

## The dev pages

- `src/dev/preview_tower.ts` (the paintings): `top`, `top-phone`, `top-close:X:Y`, `inside`, `inside-phone`,
  `inside-close:X:Y`.
- `src/dev/preview_quiettower.ts` (built from the game-ready ground and pieces): `top`, `top-phone`, `top-tiles`,
  `top-close:X:Y`, `inside` (the four rooms), `inside-phone` (the scriptorium, the dark as the game lays it),
  `inside-belfry`, `inside-fog`, `inside-stair`, `inside-tiles`, `inside-close:X:Y`.
- `src/dev/preview_floor20.ts` (the pieces): `all`, `show`, `range=A-B@K`, `look=<name>@K`.

## The checks

- `tests/quiettower.test.ts` (8): nothing of the game imports it; inside, walkable tiles floor and every other tile wall; on the
  top, the parapet the ring round the floor and the drop past it; two pieces side by side one picture, both looks; every
  pixel opaque, the fog sea in the drop; no cyan, no pink, every colour under the dullest word's; no colour at all, and yet
  strong values on the floor (it reads, never mud); the walls fade into the dark at their tops (into the fog in a fogged
  room); each room shows what it is (the scriptorium's ink, the belfry's boards, the fog); the parapet crenellated (the fog
  sea through each embrasure, the coping over each merlon) and the outer wall under the near parapet.
- `tests/floor20.test.ts` (9): nothing of the game imports them; 25, each its own name, the quest the last chapter; pictures as
  many as each says; only the candles and the quest give light; crisp; no cyan, no pink, under the dullest word's, all but
  colourless; each stands on its foot; nothing cut off; real shapes (no piece a plain block or a plain ball); the last
  chapter open, its pages the palest, its name a darker line.
- Run with `tests/floor16.test.ts` (9) and `tests/swangardens.test.ts` (7), unchanged: all 33 pass; `tsc --noEmit` clean.

## The pictures (docs/mockups/quiet_tower/pictures/)

Every picture at two picture pixels to a game pixel, as the game shows it; phone pictures are one phone screen (507 x 234
game pixels), the camera on the knight.

The first look, painted (`src/dev/preview_tower.ts`):
- `first_look_top.png`: the Tower Top, the Moth's floor without the Moth, the knight just up through the trapdoor; the fog
  sea, the spires and the palace's dome round it.
- `first_look_top_phone.png`: one phone screen of the Tower Top.
- `first_look_top_close.png`: twice as big: the last chapter on its lectern on its dais, the knight, the trapdoor, a shed
  wing.
- `first_look_scriptorium.png`: the scriptorium, a floor inside the tower, bare (no dark).
- `first_look_scriptorium_phone.png`: one phone screen of it with the dungeon's dark as the game lays it, the candles' light.
- `first_look_scriptorium_close.png`: twice as big: the lancets, the pigeonholes, the chest, the desks, the cocoon, the stair.

The 25 pieces (`src/dev/preview_floor20.ts`):
- `pieces_all.png`: every picture of every piece at the game's size on the tower's own ground (wall pieces on a far wall,
  both faces).
- `pieces_1.png`, `pieces_2.png`: the same, twice as big, pieces 1 to 13 and 14 to 25.

A corner of it laid from the game-ready parts, with the knight (`src/dev/preview_quiettower.ts`):
- `corner_top.png`: the Tower Top as the game would paint it: the flags in rings, the crenellated parapet, the outer wall
  falling into the fog, the fog sea in the drop, the pieces laid.
- `corner_top_phone.png`: one phone screen of it.
- `corner_top_close.png`: four times as big: the far parapet's merlons and embrasures, the fog through them.
- `corner_inside.png`: four rooms of a floor of the tower (the scriptorium, the belfry, a room the fog has filled, the
  stair's landing), the dark left off.
- `corner_scriptorium_phone.png`, `corner_belfry_phone.png`, `corner_fog_phone.png`, `corner_stair_phone.png`: one phone
  screen in each room, the dungeon's dark as the game lays it.

## For the owner (through the art chat)

- THE HORIZON: the Tower Top's painting shows the horizon and the grey sky beyond the fog sea; the game's camera shows no
  horizon (the fog sea from above, as in `corner_top.png`). Read as a picture to set the mood; the game-ready ground is the
  one he will play.
- THE FOG POURING OVER THE EDGE: in the painting the fog falls out through the near embrasures and down the tower's wall.
  In the game it would be one of the floor's moments around the hero, or the ground's (it is not in the game-ready ground):
  his to say whether he wants it.
- THE TOP'S SIZE: the platform is 15 to 16 tiles across, about a boss arena's size (the Princess's, floor 16's README
  says, about 17 by 20 tiles); the Moth's "wings wider than the room is long" are then very wide indeed. The size is the
  main chat's to set with the boss.
- THE PARAPET: the ground draws it on the ring of tiles round the floor. A breach (the fallen merlon's gap) is the painting's;
  the game-ready parapet is whole, the merlon fallen inward as a piece.
- NOT MADE HERE: the floor's enemies (the Hush in its own shapes, the Silent Order's last masks, the shadows of the four
  royals), the Moth, and the floor's moments around the hero: other helpers', after his briefs.
