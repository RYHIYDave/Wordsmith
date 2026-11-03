# Floor 19, the Keep: its place (mock-ups; branch `mockup/keep`)

A helper of the art chat's, from `origin/mockup/swan-gardens` at 55945b3 (floor 16, the Swan Gardens, the model for all of
it). Nothing here is in the game until the main chat puts it there. Nothing of the game imports any of it. This is the
Keep's PLACE only, its ground and its pieces; its enemies and its boss are other helpers' work, after his briefs.

The measure is his doc "Wordsmith Act 2, Part Two: The High City (Levels 16–20)" (planned with him in the main chat, his
"Yes, go (Recommended)"), level 19, word for word:

> Level 19: The Keep. The old castle at the hill's crown, where the king lies dying.
> - Layout: walls and towers: battlements, a gatehouse, the barracks and the armoury, the throne hall, and the king's
>   bedchamber at the top of the keep.
> - Hazards: murder holes that drop pitch, and portcullises that slam down to cut a hall in two.
> - Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the Silent Order's
>   last.
> - Story thread: the king is dying. The Hush sits on his chest wearing his crown, holding his sword, and the faces of
>   everything he ever did look out at him from the bed curtains (as Death does in "The Nightingale"). His clockwork
>   songbird lies broken on the floor.
>
> Boss: The King. His floor is the Throne Hall. The old king in his armour, raised from his deathbed with the Hush riding
> on his back, its fog in his crown, his great sword dragging on the stones.
>
> Palette: Cold stone, royal blue, old gold. Story beat: The Hush sits on the dying king's chest.

Its story is Hans Christian Andersen's "The Nightingale" (1843), drawn only from the book (out of copyright), never from
any adaptation. What is taken from it: the emperor's bed and its velvet curtains with their heavy golden tassels; the
strange heads peeping out from among the folds of the curtains, some very ugly and some lovely and gentle, his good and
his evil deeds; the artificial bird, of gold covered with diamonds, rubies and sapphires, its tail glittering silver and
gold, that sat on a silken cushion close to the emperor's bed, and broke when something in it snapped and its wheels ran
down; the moon shining in at the window. (The crown and the sword the Hush holds are the King's own, the boss's, not the
place's.)

## His words, in order

- The first look (`01_first_look.png`, shown him as keep_first_look.png), asked “keep_first_look.png: is this the Keep
  (floor 19)?”: “Yes, that's the place (Recommended)”.

## The pictures (docs/mockups/keep/pictures)

- `01_first_look.png`: the first look, painted: the throne hall at night, the gatehouse cut open, battlements and towers
  against the sky, the knight on the runner (1200 x 840). HIS YES.
- `02_first_look_throne_2x.png`: the same, twice as big: the throne, the cloth of estate, banners, braziers, the knight.
- `03_first_look_gatehouse_2x.png`: the same, twice as big: the murder holes from above, the cauldron of pitch, the
  passage, the raised portcullis at its mouth, the great doors.
- `04_first_look_phone.png`: the first look as one phone screen (1014 x 468).
- `05_ground_rooms.png`: the ground, game-ready, alone, each room close and twice as big: the throne hall, the wall walk,
  the bailey, the gate passage, the barracks, the armoury, the bedchamber, the gallery.
- `06_pieces_hazards_2x.png`: the hazards and their kin, every frame, twice as big: the brazier, the arrow slit, the
  battlements, the portcullis (along x and along y: up, warning, falling, slammed, down), its winch, the murder hole
  (still, warning, pouring, pool). (An earlier pass of the murder hole: its stream and pool were made bigger since.)
- `07_pieces_kings_25.png`: the King's 25 pieces, each once, twice as big, on the Keep's ground (wall pieces on a wall).
- `08_corner_phone.png`: the corner laid from the game-ready parts, one phone screen with the game's dark and the fires'
  light: the knight in the throne hall before the throne.
- `09_corner_overview.png`: the corner's middle, no dark: the throne hall, the armoury (its portcullis raised in its
  door), the gallery cut in two by a portcullis down, its winch, the bailey, its well and the great doors.
- `10_corner_whole.png`: the whole corner (2400 x 1500), no dark: the wall walk and its battlements and the cauldron,
  every room, the gate passage's murder holes pouring, the bedchamber's bed and the songbird.

## The first look (src/dev/keep_paint.ts, shown by src/dev/preview_keep_paint.ts)

A painting of one corner of the Keep, at night, the moon over the battlements, true to its heights (the walls 140 high,
the gatehouse 170, the towers 200), painted with floor 4's depth painter so that everything sorts by depth:

- THE THRONE HALL, its roof and near walls cut away as the game cuts them: great flags in a chequer of cold grey and slate;
  the royal runner, royal blue bordered in old gold, worn and torn, from the dais down the hall; at its head THE THRONE on
  a dais of three steps, empty, under its cloth of estate (royal blue, the royal crest in old gold, a powdering of small
  stars) and a narrow tester with its scalloped valance; TALL BANNERS down the walls, the crest on each, one torn and burnt
  at its foot and one fallen on the flags, its pole snapped; a tall lancet window with the moon in its panes; torches in
  iron sconces, soot over each; two braziers either side of the dais; two suits of armour standing empty; the walls'
  ashlar dark up high under the cut-away roof. HONEST FIRE ONLY: the fires' light is painted onto the stone in steps,
  warmed, never a glow on anything that does not burn.
- THE GATEHOUSE on the left, its passage cut open along its length: setts worn into ruts; its far wall and the far half of
  its vault, THE MURDER HOLES in the vault, pitch pouring from one in a black stream into a pool smoking on the setts, old
  pitch splashed under the others; the great doors shut at its far end (oak, iron bands, studs, a wicket); and on its top,
  the murder holes seen from above (square shafts, an iron grate over one) and THE CAULDRON OF PITCH heating on its fire
  beside them, a ladle in it. At its mouth into the hall, A RAISED PORTCULLIS: its spiked foot under the arch.
- THE BATTLEMENTS along every wall top, the gatehouse's and two square towers' (one with a door onto the walk), merlons
  against the night sky; the moon, three-quarters full, a few stars, long thin clouds.
- The knight on the runner, for scale (`preview_keep_paint.ts` stands him there).

Every colour goes through `art/act2_quiet.ts` at the end (Colour 4), the fires' own colours aside. The royal blue is held
to a true blue, hue 220 and more, never the friend's cyan; the old gold is gilt and thread, dull; nothing pink.

## Its ground, game-ready (src/art/keep.ts; painted by src/art/terrain.ts)

- `keepLook(land)`: the look for a level from what only the level knows (`KeepLand`): its floor, and what each walkable
  tile is (`KP_ZONE`: Bailey, Walk, Gate, Hall, Throne, Barracks, Armoury, Chamber; a hall where not said).
  `keepTerrain(floor, land)` makes the ground; `paintKeepGround(T, x0, y0, w, h)` paints a piece of it as `paintTerrain`
  does: every pixel opaque, no drop; two pieces side by side one picture. (The game's hook is as floor 14's and 15's: this
  look in place of the dungeon's for floor 19.)
- THE FLOOR, room by room: the bailey's setts, puddles holding the moon, a wisp of straw; the wall walk's flags, wet,
  lichen in their joints; the gate passage's setts; the halls' great flags of the cold stone, worn paler down the middle;
  THE THRONE HALL's flags in a chequer of grey stone and slate, a border of slate round its walls; the barracks' flags
  strewn with rushes; the armoury's flags stained with oil, iron filings and a rivet or two about; the king's bedchamber's
  dark oak boards, a polish along them.
- THE WALLS, `KP_RISE` (96) high: ashlar of the cold stone in courses, lit as each face is turned. Indoors (the halls, the
  gate passage, the armoury) a plinth course and a string course, and bay by bay a tall slit window, an iron ring, a crack,
  damp, soot; THE THRONE HALL's a stone dado with a gilt band and over it plaster painted royal blue, powdered with old
  gold stars, a painted border of gold lozenges, flaking to the stone; THE BARRACKS' rubble limewashed and grimed, a row of
  pegs, a soldier's tallies scratched in fives; THE BEDCHAMBER's an oak wainscot of sunk panels and over it hangings of
  royal blue in folds, a gold fringe at their foot and a border at their head. Indoors the wall's top fades into the dark
  from `KP_FADE` (66).
- OPEN TO THE SKY: the bailey's walls are the curtain's inner face, arrow slits in it, merlons along its top against the
  night sky; past a wall walk the ground is the night sky (`keepSky`: its dark, a faint long cloud, stars). THE WALL
  WALK'S BATTLEMENTS ARE A PIECE (`battlements`, below), laid along its outer row: the ground cannot show a far parapet
  across a walk two tiles wide (the wall in front of it is cut away over the floor, as every near wall is), so the
  parapet stands as a piece and the ground behind it is sky.

## Its 25 pieces, game-ready (src/art/floor19.ts `keepPieces()`, the King's)

His rule of 10 Oct, 14:54: “Going forward, let’s do 25 that are the theme of the 5 levels, then 25 for each boss.” These
are the King's; the High City's own 25 (for floors 16 to 20) are not made yet. Built in the Act 2 kit
(`src/art/act2_kit.ts`) as floors 11 to 16's are.

1. **the throne on its dais** (obstacle): three stone steps, the runner up them; the throne of carved oak gilt along its
   edges, a high back of royal blue framed in gilt with the royal crest at its head, a pointed gable with a trefoil and a
   gilt finial, posts up to gilt pinnacles, arms ending in gilt scrolls; its cushion dented, empty (he is raised from his
   deathbed). Three tiles by two, facing +y.
2. **the cloth of estate** (on the wall, behind the throne): royal blue in folds, the crest twice as big, small gold stars,
   a gold border and fringe, a tester and its scalloped valance with tassels.
3. **the royal runner** (on the floor): a tile of it, laid end to end down a way; whole or torn; along x or y (4 frames).
4. **a royal banner** (on the wall): on an iron pole and brackets, royal blue, the crest in old gold, a gold band and
   lozenge, a swallow tail; four spots.
5. **a torch in its sconce** (on the wall): iron bracket and cup, a torch of wood, its head burning (honest fire, three
   frames), soot over it; three spots; its light.
6. **a brazier** (obstacle): an iron bowl on three curled legs, coals, fire (three frames); its light.
7. **an arrow slit** (on the wall): a cross-shaped loop for the crossbowmen in a dressed surround, its embrasure splayed,
   the night through it; three spots.
8. **battlements** (obstacle): a tile of parapet with its coping and one merlon, laid along a wall walk's outer row, its
   parapet on the tile's far edge; along x or y.
9. **a portcullis** (trap): a tile of it under its lintel (laid one to a tile across a hall or a doorway, they join into
   one): oak bars shod with iron, iron bands, a spike on each bar's foot. Frames, along x then along y: up (only its spikes
   under the lintel), the warning (dropped a hand, shaking, grit falling from the slot), falling (half way, smeared),
   slammed (its spikes in the floor, dust bursting out either side, chips), down (still, dust settling).
10. **the portcullis's winch** (obstacle): a windlass on two A-frames, its drum wound with chain, the chain up into the
    dark, a ratchet and its pawl, capstan bars.
11. **a murder hole** (trap), as the passage's floor under it shows it: still (old pitch splashed and scorched), the
    warning (a dribble of pitch from the dark above, a wisp of smoke), pouring (a heavy black stream, a crown thrown up,
    smoke), its pool (black, its sheen cold, bubbles, smoking). Laid on a floor tile, anchored at its middle.
12. **a cauldron of pitch** (obstacle): a round iron pot on short legs over logs and fire, the pitch black in it, a ladle,
    steam (three frames); its light.
13. **a suit of armour on its stand** (breakable): plate, dark, its seams dark, a great helm with its sights and breaths;
    knocked down, its plates strewn and its helm rolled away.
14. **a weapon rack** (obstacle): spears and halberds stood in it, two swords hung point down; along x or y.
15. **a crossbow rack** (obstacle): crossbows hung by their stirrups, a barrel of quarrels; along x or y.
16. **an armourer's anvil** (obstacle): on a banded stump, a hammer on it, tongs, a dented helm, a quenching bucket.
17. **barracks bunks** (obstacle): two tiers, two tiles long, straw pallets, grey wool blankets (one thrown back), a
    helmet hung on a post; along x or y.
18. **barrels** (breakable): two and a little one, hooped; burst, staves splayed, hoops loose, ale spilled.
19. **a long table** (obstacle): on trestles, benches either side, pewter left on it, a candlestick out; along x or y.
20. **the war table, its map** (obstacle): the realm on parchment (the river, the hills, the city and the keep), carved
    markers (one gilt), a dagger driven through it.
21. **the castle well** (obstacle): a round well-head, posts and a windlass, its rope down into the dark, a bucket.
22. **the king's great bed** (obstacle; from the book): four carved posts, a tester with a valance fringed in gold, heavy
    royal blue velvet curtains closed along its head and far side and drawn back and tied at its foot with heavy golden
    tassels; FACES LOOKING OUT FROM AMONG THE FOLDS, pale grey (the Hush's grey, no glow), some gentle and some ugly; the
    bed empty, the linen thrown back where he rose, the crest carved on its headboard.
23. **the songbird's silk cushion** (obstacle; from the book): a little gilt stand, a cushion of royal blue silk, gold
    tassels, its middle pressed hollow; empty.
24. **the clockwork songbird, broken** (quest; from the book): gold, set with rubies, sapphires and diamonds (glints, never
    lights), its tail fanned silver and gold, lying on its side; the little door in its back sprung, its spring uncoiled
    out of it, its wheels spilled across the floor, its key by it. Offered as the floor's quest piece, as each floor has
    had one; what the quest is, is his and the main chat's.
25. **the keep's great doors** (door, on the wall): two leaves of oak in an arch of voussoirs, iron bands and strap
    hinges, studs, ring pulls, a wicket; shut, open.

WHAT GLOWS (Colour 3): only honest fire, the torch, the brazier and the fire under the pitch, in the fire's own colours
(`EMBER`), each with its light. The old gold is dull metal and thread; the songbird's gems are glints of colour; the faces
in the curtains are pale grey, not a light; nothing cyan, no pink.

HOW THEY GO IN (the main chat's): the battlements along a wall walk's outer row (their parapet on the tiles' far edge),
with one along y at a walk's end; a portcullis one tile of it on each tile of a row across a hall or a doorway, played up,
warning, falling, slammed, down (the trap's timing is the game's); a murder hole on a floor tile, played still, warning,
pouring, and its pool left; the runner tile by tile down a way; what hangs on a wall at its foot on the face (`left` for a
wall along x, `right` for a wall along y), at one of its spots. `src/dev/keep_lay.ts` lays a corner so.

## A corner laid from the game-ready parts (src/dev/keep_level.ts, keep_lay.ts, preview_keep.ts)

`keep_level.ts` lays a corner of the Keep by hand on the game's tiles: the wall walk along the top (a stair down from it
into the armoury); the throne hall in the middle with the armoury and the barracks either side of it through doorways; a
long gallery across the front; below it the bailey, the gate passage out of it to the right with its murder holes, and
the king's bedchamber to the left. `keep_lay.ts` sets the pieces on it: the throne on its dais at the hall's head under the
cloth of estate, banners and torches down the walls, braziers either side of the dais, the runner down the hall (torn in
one place), armour in its far corners, a portcullis raised over its door into the gallery; weapon and crossbow racks, the
anvil and armour (one knocked down) in the armoury; bunks, a long table and barrels in the barracks; a portcullis down
across the gallery, cutting it in two, its winch by it; the war table; the great doors on the bailey's far wall, the well,
a crossbow rack; three murder holes in the gate passage (still, pouring, its pool); the great bed, the songbird's cushion
and the broken songbird in the bedchamber; battlements along the walk, a cauldron of pitch on it. `preview_keep.ts` paints
it with the game's painter and the game's dark, the fires' light taken out of it, the knight in the throne hall.

## The dev pages

- `src/dev/preview_keep_paint.ts` (the painting): `overview`, `phone`, `close:X:Y:K`.
- `src/dev/preview_keep.ts` (the corner from the game-ready parts): `phone`, `overview`, `whole`, `bare`, `tiles`,
  `rooms`, `nodark`, `at:X:Y`.
- `src/dev/preview_floor19.ts` (the pieces): `all`, `range=A-B@K`, `look=<name>@K`, `show`.

## The checks

- `tests/keep.test.ts` (7): nothing of the game imports it; walkable tiles floor, the rest wall, no drop; pieces side by
  side one picture, the same every time; every pixel opaque; no cyan, no pink, every colour under the dullest word's,
  cold stone the most of what is walked on, royal blue on the throne hall's walls and old gold in their band and stars;
  the sky (with stars) over the wall walk and between the bailey's merlons, the dark at the top of the throne hall's
  walls; each room its own floor (the chequer, the rushes, the oil, the oak, the puddles).
- `tests/floor19.test.ts` (12): nothing of the game imports them; 25, each its own name; pictures as many as each says,
  only honest fire gives light (the torch, the brazier, the cauldron); crisp; no cyan, no pink, under the dullest word's;
  each stands on its foot; nothing cut off; the portcullis lower frame by frame, on the floor when slammed, a tile wide;
  the murder hole's pitch falling and its pool wider than its stains; every wall piece's spots, no two the same; the
  battlements' merlon over its parapet; from the book, the bed's gold and the faces in its curtains, the songbird's gold
  and its rubies and sapphires, and it is the quest.
- The models' checks pass unchanged: `tests/floor16.test.ts` (9), `tests/swangardens.test.ts` (7).

## For him to decide (the art chat's to ask)

- THE KING'S MARK. The banners, the cloth of estate, the throne and the bed carry the royal crest the palace guard wears
  (a white swan, its wings raised), in old gold. Is that the King's own, or should he have a mark of his own (a songbird,
  for the book)?
- THE QUEST. The clockwork songbird is laid as the floor's quest piece, as each floor has had one; what the quest is (to
  find it, mend it, wind it) is his.
- THE WALL WALK. Its battlements are a piece laid along the walk's outer row, the ground behind them the night sky; the
  main chat may prefer it otherwise.
- THE PORTCULLIS. Laid a tile at a time under a lintel, it hangs from nothing when the wall it is in is a near wall cut
  away; laid in a far wall's doorway or across a hall it reads (09_corner_overview.png). The trap's timing is the game's.

## His word on the game-ready Keep

The laid corner and the King's 25 pieces (`08_corner_phone.png`, `07_pieces_kings_25.png`), asked “The Keep made
game-ready (08_corner_phone.png and the King's 25 pieces): is this right?”: “Yes, that's the Keep (Recommended)”. Asked
whether the King should have a mark of his own (a gold songbird) or keep the royal swan crest of floor 16's guard on his
banners, throne and bed: “Keep the royal swan”.
