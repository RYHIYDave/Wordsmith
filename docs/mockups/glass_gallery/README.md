# Floor 18, the Glass Gallery: its place (mock-ups; branch `mockup/glass-gallery`)

A helper's branch for the art chat, from `origin/mockup/swan-gardens` at 55945b3 (floor 16, the Swan Gardens, finished and
approved: the model for all of this). Nothing here is in the game until the main chat puts it there. Nothing of the game
imports any of it (each part's test proves it). This is floor 18's PLACE: its ground and its pieces. Its enemies and its
boss, the Queen, are other helpers' work, after his briefs.

The measure is his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)", approved by him ("Yes, go
(Recommended)"), level 18, word for word:

> Level 18: The Glass Gallery. The queen's wing: long galleries of mirrors and a great glasshouse on the roof.
> - Layout: indoors and up: mirrored halls and dressing rooms, a chapel of stained glass, and the glasshouse of dead orchids
>   under a roof of panes.
> - Hazards: mirrors that crack and burst into shards when anything strikes near them; skylights to fall through to the
>   floor below.
> - Enemies: ladies-in-waiting, the queen's guard, and your own reflections, which step out of the mirrors and fight with
>   your class's moves.
> - Story thread: the queen gave the Hush every voice in her court in return for her mirror's. It is the last thing in the
>   palace that still speaks, and it says only what she wants to hear (her mirror, from "Snow White").
>
> Boss: The Queen. Her floor is the Mirror Hall. Tall and cold in silver and violet, a crown of glass spikes, and her
> poisoned comb in her hand. Her mirror hangs at the end of the hall and talks to her the whole fight.
> Palette: Silver, cold blue glass, dark violet. Story beat: The only voice left is her mirror's.

Its story from the Brothers Grimm, "Snow White" (1812), drawn only from the book (out of copyright), never from any film or
cartoon of it. What is taken from the book: the queen and her mirror; the queen sewing at a window framed in ebony, the
snow, three drops of blood ("red as blood, white as snow, black as ebony"); the apple she made, white with a red cheek, only
the red cheek poisoned; the coffin of glass.

## His words, in order

- The plan doc, level 18 as quoted above: “Yes, go (Recommended)”.
- The first look (`first_look.png`), asked “glass_first_look.png: is this the Glass Gallery (floor 18)?”: “Yes, that's the
  place (Recommended)”.
- Nothing yet on the game-ready ground, the 25 pieces or the corner: they go to him from the art chat.

## The first look (src/dev/gallery_paint.ts, src/dev/preview_gallery.ts)

A painting of one corner of the queen's wing by day, the candles lit, built in the Act 2 kit's own depth painter (floor
4's Scene, as the pieces are), the knight before the mirrors for scale:

- THE LONG GALLERY OF MIRRORS: its back wall in the light, hung bay by bay with tall mirrors in carved gilt frames (an inner
  bead, a carved flat, an outer bead, a leaf of acanthus curling out at each corner, a shell at the foot), each crested with
  a cartouche between two scrolls and on it a crown of glass spikes (the Queen's crown, her doc's "a crown of glass
  spikes"), between fluted pilasters of grey marble on a marble dado, violet silk woven in a damask between them. Each
  mirror gives back, faintly, the floor before it (the eye's way turned back off the glass: the marble's violet squares
  in it), the candles (a warm fleck in the glass) and whoever stands near it: THE KNIGHT'S LIKENESS is in the mirror before
  him, faint, cold, grey, only on that mirror's glass. One mirror CRACKED from a blow, its pieces each giving back the hall
  a little askew, pieces gone near the blow; one BURST, its frame empty but for teeth of glass, its shards on the floor
  under it (the hazard). Tall silver candelabra between the mirrors, their candles burning (the only light that is light).
  A floor of silver-grey marble in squares, a small square of dark violet at each corner, a violet border along the walls;
  a violet runner down its middle, its border a chain of gilt lozenges between silver lines. A console table under a mirror
  (a jewel box, a hand mirror on it), a velvet bench, a pedestal with an urn of dead orchids.
- A SKYLIGHT IN THE FLOOR (the hazard): an iron grid of frosted panes let into the marble, cracked; at its near corner a
  ragged hole, the glass's teeth lit round it, and through it, far down, the floor of the hall below, the day lying on it
  in a square, the grid's shadow across it.
- THE CHAPEL, through a pointed doorway in the gallery's left wall: its pale stone, its pews, two candelabra before its
  great window; its stained glass lit by the day (the book's first page: in the lancets the snow, a band of ebony, three
  red drops; in the great window the queen at her window, crowned, the snow round her); the colours the lancets throw
  lying across its floor (colour on the floor, never a glow).
- THE GLASSHOUSE ON THE ROOF, glimpsed up a stair through the gallery's back wall (the violet runner carried up its steps,
  under a moulded arch): a house of iron and glass on the roof's lead, its panes cold grey-blue with the sky in them, a
  sheen across, some broken; inside, on its staging, the dead orchids, brown and drooping, their spikes bowed, the last
  blooms shrivelled; baskets of them hung from its ridge, their dry roots trailing.
- The dark as the game lays it: the hero's pool of light, the dark coming in past it, the candles' warm pools, the chapel
  and the glasshouse lighter for the day in them; the walls fading into the dark at their tops.

## Its ground, game-ready (src/art/glassgallery.ts; painted by src/art/terrain.ts)

- `glassGalleryTerrain(land)`: the ground for a level from what only the level knows (`GlassLand`): `floor` (its tiles),
  `zone(tx, ty)` (what each walkable tile is, `GG_ZONE`: Gallery, MirrorHall, Dressing, Chapel, Glasshouse; a gallery
  where not said), `runner(x, y)` (how far in from a runner's nearer edge: above 0 on it), `skylight(tx, ty)` (a tile of a
  skylight broken through: not floor, the ground's drop). `glassGalleryLook(land)` is the look alone.
- `paintGlassGallery(T, x0, y0, w, h, skylight)`: a piece of it as `paintTerrain` paints it, the hall below painted into
  the skylights' holes: every pixel opaque, two pieces side by side one picture. (The game's hook is as floor 15's stacks
  and floor 16's gardens: this in place of `paintTerrain` for floor 18.)
- THE FLOORS, room by room: the galleries' silver-grey marble set with violet at its corners, its violet border, its
  shards of mirror glinting here and there along the walls' feet; the runners; THE MIRROR HALL's bold chequer of silver and
  violet marble a tile across, a fillet of old gilt between; the dressing rooms' violet carpet, a small lozenge in it, a
  border; the chapel's great pale flags, a ledger stone here and there; the glasshouse's small worn tiles, mildew in their
  joints, iron grates over the heating along its far walls, the dead orchids' leaves and petals fallen on it.
- ITS WALLS, by the room they look into (`GG_RISE` 132 high, so the tall mirrors hang under the cornice, fading into the dark from `GG_FADE` 116): the galleries' and
  the Mirror Hall's grey marble dado, violet silk woven in a damask, a cornice; the silk torn here and there and hanging in
  strips, or a paler ghost where a mirror once hung, or a crack through the plaster; the dressing rooms' painted dado and
  panels of silk in frames of thin gilt moulding, a rosette at each corner; the chapel's pale stone in courses, lancets of
  stained glass in it (the book's first page), their reveals splayed; the glasshouse's low stone wall and then iron and
  panes, the sky's cold grey-blue in them, a sheen across, some broken out, dead stems pressed against the inside.
- THE MIRRORS ARE PIECES, not the ground: they crack and burst (the hazard), so the ground has none of its own.
- A SKYLIGHT BROKEN THROUGH is the ground's drop (`GG_BELOW` 112 under the floor): its lip of marble lit; under it the
  floor's thickness (the marble's edge, then rubble and the ends of joists); far down the hall below, its own marble dim,
  the day through the hole lying on it in a square, the grid's shadow across it. A whole skylight, that cracks and gives
  way, is a piece.

## The Queen's 25 pieces, game-ready (src/art/floor18.ts `glassGalleryPieces()`)

His rule of 10 Oct, 14:54: “Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” These are
the Queen's; built in the Act 2 kit (`src/art/act2_kit.ts`) as floors 14's and 16's are. Wall pieces have their pictures on
the face turned to screen-left (`left`) and the one turned to screen-right (`right`), as floor 14's.

- THE MIRRORS: `a tall mirror` (THE HAZARD, on the wall: kind `trap`, its pictures on both faces: whole, giving back the
  floor before it; cracked from a blow; burst, its frame empty, its shards strewn on the floor before the wall; its glass
  the size the reflections' step-out is made for, branch `mockup/reflections`, `GALLERY_MIRROR`: 58 across on the picture,
  84 high to the arch, the arch 22 higher); `a
  mirror's shards` (on the floor); `a cheval mirror` (breakable: whole, burst).
- THE DRESSING ROOMS: `a dressing table` (skirted in violet silk, a looking-glass of three leaves, her combs, a jewel box,
  a powder jar, a hand mirror; its front along +y or +x); `a dressing screen` (whole, half there while someone is behind
  it); `a wardrobe of gowns` (stood open on her gowns; along +y or +x); `a velvet banquette` (along x or y); `a console
  table` (breakable: whole with its vase of dead lilies, knocked over).
- LIGHT, only candles: `a silver candelabrum` (five candles); `a sconce of candles` (on the wall: a girandole, its backplate
  of mirror glass, three candles, their likeness in the glass).
- THE GALLERIES: `a bust on a plinth` (a lady of the court; breakable: whole, toppled, her head broken off); `a tapestry in
  rags` (on the wall: the huntsman's wood of the book, a boar in it, torn in strips and burnt); `the queen's doors` (a
  door: violet lacquer, panels of mirror glass, a crown of glass spikes over them; shut, open); `a gate of wrought silver`
  (a gate: marble piers crowned with glass spikes, leaves of silvered iron; shut and open, across x or y).
- THE CHAPEL: `a stained-glass window` (a wall tile: two lancets and a quatrefoil, the book's first page, her crown); `a
  chapel pew` (along x or y); `a glass coffin` (the book's: on a bier draped in violet, empty, its lid ajar; its panes
  drawn as glass is in pixels, every other pixel, so the lining shows through); `the colours of the stained glass` (a
  floor tile: the day's colours lying on the floor, every other pixel, the floor between).
- THE GLASSHOUSE: `a bench of dead orchids` (staging, two tiers; along x or y); `an orchid in its pot, dead` (breakable:
  whole, the pot broken); `a pane fallen from the roof` (on the floor); `a skylight` (THE HAZARD: kind `trap`, a floor
  tile: whole, cracking, broken through and the hall below seen down the hole).
- HER THINGS: `a jewel box, spilled` (pearls, rings, a silver comb); `a hand mirror, dropped`.
- THE QUEST: `the apple on a silver dish` (the book's apple, white with a red cheek, on a footed dish of silver on a draped
  stand; its own pale light).

WHAT GLOWS (Colour 3): only the candles (an honest flame: EMBER) and the quest's own pale light. Every glass a cold
grey-blue, its hue well past the hero's cyan; no pink; every colour duller than the dullest word's.

NOT HERE: her mirror, the one that hangs at the end of the Mirror Hall and talks: it is the boss's, and goes with her.

## A corner laid from the game-ready parts (src/dev/glass_level.ts, src/dev/glass_lay.ts, src/dev/preview_glassgallery.ts)

`glass_level.ts` is a corner of the queen's wing laid by hand on the game's tiles: a long gallery along x, a runner down it
and on across the Mirror Hall at its far end (a gate of wrought silver stood open in the way between); off its back wall,
through doorways two tiles wide, the chapel, a dressing room and the glasshouse (on one level, as the game walks); a
skylight broken through in the gallery's floor (two tiles of the ground's drop). `glass_lay.ts` lays the 25 on it: tall
mirrors down the gallery's back wall (the one before the knight whole, the next cracked, one burst), sconces between,
candelabra before them, banquettes along its front, busts at its ends, a row of skylights (whole, cracking) by the holes;
the chapel's windows, pews, the glass coffin, the colours on its floor; the dressing room's table, wardrobe, screen, cheval
glass; the glasshouse's benches of dead orchids; the Mirror Hall's mirrors, the queen's doors, the apple on its dish.

## The dev pages

- `src/dev/preview_gallery.ts` (the painting): `overview`, `phone`, `close:X:Y:K`.
- `src/dev/preview_glassgallery.ts` (built from the game-ready parts): `overview`, `phone` (the dungeon's dark as the game
  lays it, the candles' light), `bare` (the ground alone), `tiles`, `whole`, `close:X:Y`.
- `src/dev/preview_floor18.ts` (the pieces, on the gallery's own ground and walls): `all`, `range=A-B@K`, `look=<name>@K`,
  `show`.

## The pictures (docs/mockups/glass_gallery/pictures)

- `first_look.png`: the painting, a corner of the queen's wing (1200 x 840).
- `first_look_close.png`: the same, twice as big round the knight and the mirrors (the cracked one, the stair up).
- `first_look_phone.png`: one phone screen of the painting, the camera on the knight.
- `ground.png`: the game-ready ground alone on the corner laid by hand, the knight in the gallery.
- `pieces.png`: the 25 pieces at the game's size, every picture of each, on the gallery's own ground and walls.
- `corner.png`: the corner laid from the game-ready ground and pieces, with the knight (1200 x 840).
- `corner_phone.png`: one phone screen of it, the camera on the knight, the dark and the candles as the game lays them.

## The checks

- `tests/glassgallery.test.ts` (7): nothing of the game imports it; walkable tiles floor, the skylight's the drop, every
  other wall; pieces side by side one picture, the same every time; every pixel opaque, the hall below in the hole, floor,
  walls, tops, the drop and the floor's thickness all there; no cyan, no pink, every colour under the dullest word's,
  silver the most of the gallery's floor and violet in it, not mud-brown; violet silk on the gallery's walls, cold grey-blue
  panes on the glasshouse's, stained glass in the chapel's, every room's walls fading into the dark at their tops; the
  hole's lit lip and the hall below's marble far down.
- `tests/floor18.test.ts` (10): nothing of the game imports them; 25, each its own name; pictures as many as each says;
  only the candles and the quest give light; crisp, no loose pixels; no cyan, no pink, under the dullest word's; each stands
  on its foot; nothing cut off; the tall mirror (a trap) whole, cracked and burst on both faces, its glass a cold grey-blue
  giving back the floor's violet, its shards before the wall when burst; the skylight (a trap) whole, cracking, broken
  through; the apple white with a red cheek.

## For the main chat, and for him to decide

- How the tall mirror bursts in play is the game's: the pieces are its three pictures (whole, cracked, burst) on each face.
  The game may play cracked when something strikes near it and burst at the next; the shards are in the burst picture.
- The skylight's three pictures likewise (whole; cracking under a step; broken through). A skylight already broken through
  is the ground's drop (`GlassLand.skylight`).
- The knight's likeness in the mirrors is painted only in the first look. In the game the mirrors (pieces) give back the
  floor; giving back the figures that stand before them would be the engine's (the doc's "your own reflections, which step
  out of the mirrors" are enemies, another helper's).
- For him: whether the glass coffin (it is in the 1812 text) belongs in the queen's chapel; whether the stained glass
  should keep to the book's first page (the snow, the ebony, the three drops) or show the mirror too.
