# FLOOR 3, THE CHAINED ONE'S FLOOR: THE BLACK IRON PRISON (PICTURES FIRST; NOT IN THE GAME)

Branch `art/floor3-look`, from `high-city` at 6008680. The three looks for him to pick from: `src/dev/floor3_look_paint.ts`
(the painting) and `src/dev/preview_floor3_look.ts` (the page that lays the pictures out), checked by
`tests/floor3_look.test.ts`. Nothing of the game imports any of it, and nothing of the game is changed: no switch is needed
until his pick is made game-ready.

## His words

- 1 Nov 2026, 10:29: “I think we need to redo the art for a couple of the other early levels as well.  Floor 1 and 2 are
  probably fine.  But I think we’ve outgrown the 1-5 “just make it more dirt as you get lower” plan”. Read (and he was told
  so) as: floors 3, 4 and 5 each get a place of their own (floor, walls, colours, light) built round its boss, and the pieces
  he already said yes to come along.
- His pick for floor 3: “Black iron prison (Recommended)”, offered as: dark stone and black iron, grated floors with
  firelight glowing up from below, chains hung from the dark; rust, soot and ember orange.
- Later, of the bosses' gates: “Its own arch, and we’ll need new ones for the other new levels as well”.

## What is drawn

Floor 3 laid as the main chat lays it, LINEAR (game/dungeon.ts, `CRYPT_KINDS`), the run of it from the near end to the
boss: a corridor in (bottom left, running on off the picture); THE CELL BLOCK, a long hall with three cells along its back
wall, each behind a barred iron front with its door, straw kicked out before them; a corridor on; the boss's doorway with
HIS GATE in it; and beyond, THE CHAINED ONE'S PIT, sunk 40 below the run's floor, iron steps down into it from the gate, a
ledge round its far sides under its walls, and a great grate in the middle of its floor over the fire, where he stands (as
the game has him today: `makeChainedArt3`; his new look is not yet his yes).

- **The walls**: the prison's dark stone in courses, ribbed every two tiles with riveted straps of black iron and footed with
  a riveted iron plate; rust bled down from the rivets, soot toward the tops; 80 high, the top fading into the dark as the
  game's walls do. Along x lit, along y in shade. The walls toward the eye cut low, as the game leaves them, their cut tops a
  coping of blocks. The pit's walls carry great rings with chains slung slack between them.
- **The floors**: big flags of the dark stone, worn on their edges toward the light, grime and soot in drifts; GRATES of black
  iron let into them, rust bled round their rims; and down the middle of the cell block a FIRE CHANNEL, grated over at both
  ends, open between with iron railings along it and a grated bridge over it.
- **Chains hung from the dark**: three great ones down to rings in the pit's floor; in the cell block and the corridor in, to
  a hook, a shackle, a hanging cage.
- **The floor's own pieces** (art/floor3.ts, his yes already), brought into each look's light, their colours and not their
  shapes: the great winch and chain posts on the pit's ledge, a heap of chains and a ball and chain in the pit; in the cell
  block the straw bale, meal sack, feed trough, the jailers' kettle (its fire), anvil, stone bench, the jailers' chest, box of
  irons, water jug, a heap of chains; a snapped chain, a bowl kicked over, a burst cuff on the corridors' floors; on the walls
  rings and chains, balls on a rack, goad and catch-pole, the wall winch, empty bowls, rags on a nail, the fire basket and the
  jailers' lamp (in B).
- **HIS GATE**, an original design, built as the game's boss gates are: the three tiles of the way between two pillars 12
  wide (art/gates.ts, `SPAN`, `PILLAR`). Square pillars clad in riveted black iron, a plinth and a capital, up to the spring
  at 64; an arch of iron voussoirs over the way (its crown 112), a rivet in each; the face over it plated in riveted iron up to
  a cornice at 150 with a row of iron spikes along it, taller over the middle; on a tall keystone HIS MARK, the iron face-cage
  he wore, cast in the plate, the enemy's embers behind its eye-slits (dull: the gate has not fallen); two great rings on the
  face's upper corners with a chain slung between them over the arch; THE PORTCULLIS at the back of the arch, drawn up, its
  spikes hanging at 90 under the crown. The gate stands whole in a wall cut low (the pit lies behind it), so the pit and he
  are seen over the wall and through the arch. Its inner side shows through the way, as the yard's gate's does.

## The three looks

Each a different take within his pick, each its own light:

- **A, THE FURNACE BELOW** (`a_furnace.png`, `a_phone.png`): a warm black-brown stone; every grate glowing ember, the open
  channel a bed of live coals, the cells' floors glowing through their bars; the light thrown up the walls from below; sparks
  going up and thin wisps of smoke rising into the dark.
- **B, TORCHLIT DARK** (`b_torchlit.png`, `b_phone.png`): a cool charcoal stone gone near black away from the fire; fire
  baskets on the walls in pools of light; only two grates and the channel's near end glowing, the channel burnt low to dark
  coal with fire in its cracks; deep shadow between.
- **C, COLD IRON** (`c_cold_iron.png`, `c_phone.png`): a cold slate-grey stone, soot black at the tops, rust everywhere on
  the iron; a flat cold light; the grates dark, the channel full of grey ash, the kettle gone out; THE ONLY FIRE IS IN THE PIT,
  under his grate, where he is.

In all three: fire an honest orange; nothing cyan but the knight's own; nothing pink but the Chained One's own and his mark on
the gate. `floor3_look_sheet.png` has the three, each with its phone screen, labelled A, B, C with a line each, and the gate
close beside the knight in each, twice as big.

The art chat's lean: **B, torchlit dark**. It keeps the prison's dark (the cool stone, deep shadow) while the fire baskets and
the few glowing grates show where to go and what is dangerous, and the pit's fire stands out as the goal. A is the boldest but
the most orange all over (the hero and the words have less dark to stand out on); C is the most readable at a glance but the
coldest and least fiery for a floor whose theme is fire under iron.

## How the pictures are made

```
node tools/preview.mjs src/dev/preview_floor3_look.ts docs/mockups/floor3_look/pictures/a_furnace.png 1200 840 "overview:furnace"
node tools/preview.mjs src/dev/preview_floor3_look.ts docs/mockups/floor3_look/pictures/a_phone.png 1014 468 "phone:furnace"
  (and "overview:torch" b_torchlit.png, "phone:torch" b_phone.png, "overview:cold" c_cold_iron.png, "phone:cold" c_phone.png)
node tools/preview.mjs src/dev/preview_floor3_look.ts docs/mockups/floor3_look/pictures/floor3_look_sheet.png 1200 4992 "sheet"
  (PREVIEW_TIMEOUT=60000 for the sheet; "gate:<look>" at 400 x 540 shows the gate close on its own)
```

The whole run is 600 x 420 game pixels at two picture pixels each (the game's own size); a phone screen is 507 x 234 game
pixels with the camera on the knight in the corridor before the gate. The place is painted in picture pixels, turned to the
grid (art/isokit.ts); the pieces and figures are the game's own sprites, drawn at their size and sorted as the game sorts
them (the pit, then the gate and the pit's near walls, then the run, then the walls toward the eye). THE LIGHT IS PAINTED IN
here, in three bands round each fire and each glowing grate, their edges a checker of two-pixel squares (no soft gradient);
the light from below climbs the walls near a glow.

## What making his pick game-ready will need

As the yard was made game-ready (src/art/yard.ts, `makeYardArt`) and its gate (src/art/yard_gate.ts, `makeYardGateArt`), in a
file of its own behind a switch that is off (`FLOOR3_LOOK = { on: false }`), nothing of the game importing it until the main
chat puts it in:

- **The floor**: `floor(tx, ty)`, the dark flags laid on the world so the stones run on across tiles, anchored at a tile's top
  corner; the floor's own theme in place of `CRYPT_FLOORS[2]` (art/crypt.ts) for floor 3.
- **Tiles**: the grates (glowing, dim, cold, as the look has them; a grate's fire in a few frames so it flickers), the fire
  channel (its sides, its bed of coals, its grated ends, the bridge, the railings: a run of tiles the main chat lays down the
  middle of the cell block), straw before the cells, rust round a grate.
- **Faces**: `faceLeft` / `faceRight`, the wall a tile at a time, 80 high, its iron rib on every other tile, the foot plate,
  rust and soot, the top fading into the dark as the game's walls do; the cell's barred front as a face of its own (three
  tiles, with its door), to stand where the main chat lays the cells; the cut low walls' coping.
- **The pit**: its floor tile, the great grate (a 4 x 4 tile set), the rings in its floor, the ledge and its drop faces, the
  iron steps down from the gate (the game's renderer already draws sunken floor and its faces: render.ts), the chains hung
  from the dark to the rings (pictures that hang from above the screen).
- **The gate**: a `GateArt` (art/gates.ts) as the yard's: its pillar, its arch's strips in both directions (lit and alight:
  his mark burning the enemy's fire once it has fallen), its portcullis at every raise, its slam and its drop (Movement 9, as
  `YARD_GATE_DROP`); everything but the boss's gate floor 3's own doors and gates (`chainedGates()`).
- **The light**: the dark and the light are the renderer's (render.ts: its darkness with a hole where each light burns). Each
  glowing grate, the channel and the pit's grate would give a light of their own (low, warm, the up-light on the walls coming
  from them), the fire baskets theirs; the floor's dark set to match the picture he picks. The light painted into these
  pictures is the guide, not the game's.
- **The pieces**: floor 3's own, recoloured into the look he picks (their colours, not their shapes), as here (`graded` in
  the page).

## Checks

`tests/floor3_look.test.ts`, 3 of 3: nothing of the game imports the dev pages; every picture there at the size asked for
(1200 x 840, 1014 x 468, the sheet 1200 wide and 4992 high); in each picture nothing cyan but round the knight and nothing
pink but on the Chained One, on his mark on the gate, or the knight's own deep red, and in the sheet the cyan in no more
patches than it has knights. `tsc` is clean.

## Made game-ready (his “B, torchlit dark (Recommended)”)

His pick, 2 Nov 2026, by 07:52: “B, torchlit dark (Recommended)”, offered as: fire baskets on the walls, grates glowing here and
there, deep shadow between; the hero and words stand out best; the gate the same in all three. Made ready for the game as the
Headsman's yard was (docs/mockups/headsman_yard/README.md), in files of their own behind switches that are off; nothing of the
game imports them (a test proves it) and no game file is changed:

- `src/art/prison.ts`, `makePrisonArt()`, behind `PRISON = { on: false }`;
- `src/art/prison_gate.ts`, `makePrisonGateArt()` (a GateArt), behind `PRISON_GATE = { on: false }`;
- checked by `tests/prison.test.ts`; laid and lit the game's way by `src/dev/preview_prison_game.ts`.

Every picture is in the game's measures (picture pixels, two to a game pixel, `density` 2), anchored as the game's own are.

### The pieces and their anchors

- `floor(tx, ty)`: THE DARK FLAGS, laid on the world so the stones run on across tiles (sixteen pictures, repeating every four
  tiles each way), in place of `CRYPT_FLOORS[2]`'s floor. 64 x 32, anchored at the tile's top corner, as the game's floor tiles.
- `tiles` (floor tiles, laid over the flags; each 64 x 32 at its top corner):
  - `a grate` (dark: embers dying under it), `a grate, glowing` (the fire under it, four frames: it flickers), `soot`,
    `rust stains`, `a drain`, `straw before a cell`;
  - THE FIRE CHANNEL, two tiles wide (each piece a `…, its far half` and a `…, its near half`, the far half the one with the
    lower x along y, the lower y along x), `along y` and `along x`: `the channel's grate …` (dark), `the channel's grate …,
    glowing` (four frames), `the open channel …` (its bed of coals burnt low, 20 below the floor, fire in its cracks; its far
    side going down), `the open channel …, where it begins` (its far end going down too: the first open tile after the grates),
    `the bridge …` (a grate across it, the bed seen through it).
- `faceLeft` / `faceRight`: THE PRISON'S WALL a tile at a time, as the game lays walls (along x its face turned to screen-left
  and lit, along y to screen-right in shade). 80 high, as floor 3's walls are now (`WALL_LOOK.tall` 40 game pixels), its top 24
  fading out in the game's own four steps (art/ground.ts `put`); the columns at the tile's two ends left empty as the game's.
  64 x 112, anchored at the floor point of the tile's top corner, the face hanging to the floor line of its near edge. Dark
  stone in courses, footed with a riveted iron plate, rust and soot; [0] and [2] carry an iron rib, [1] and [3] none:
  `face(alongX, tx, ty)` picks them so the ribs fall every two tiles along a wall.
- `cellLeft[0..2]` / `cellRight[0..2]`: A CELL'S FRONT, three tiles of the cell block's back wall (bars of black iron, a door with
  its hinges and lock in the middle, the cell seen through them: straw, its floor going back into the dark, a chain on its
  back wall). [k] is the tile at the front's start + k along the wall (along x in x order, along y in y order). As the faces.
- `hall` (THE BOSS HALL, FLAT, as the game's boss hall is):
  - `hall.floor(tx, ty, dx, dy)`: the hall's floor tile at world tile (tx, ty), (dx, dy) tiles from the great grate's far
    corner: frames (the grate's four, else one), or null beyond `HALL_REACH` (-3 to 7 each way: the plain flags there). THE
    GREAT GRATE is four tiles each way (`GREAT`), glowing; round it THE IRON RING let into the floor (radius 3 tiles from its
    middle, riveted) and the two grooves his ball has worn (3.35, 3.9); rings let into the floor for the great chains at
    `HALL_RINGS` (from the grate's far corner). He stands on its middle.
  - `hall.faceLeft[0..3]` / `hall.faceRight[0..3]`: the hall's walls, the tile at (tile's place along the wall) mod 4: a great
    ring on a plate every four tiles, a chain slung slack between, the ribs. As the faces.
- `pieces`:
  - the prison's own (`PRISON_OWN`): `railing along y`, `railing along x` (a tile's length of rail, its post at its far end;
    56 x 96 anchored at the floor point under its middle, on the rim line), `railing post` (to close a run, at the rim point
    where the run ends); `a chain from the dark, a hook` and `…, a shackle` (wall pieces, three spots, 48 x 120 at the foot of
    the face under its tile's middle, as every wall piece: art/floorkit.ts); `a chain from the dark, hanging to a hook` (its
    hook 50 up) and `…, hanging to a cage` (70 up), and `a great chain from the dark` (down to a ring in the floor), each
    anchored at the floor point under it, the chain fading into the dark above the screen;
  - and every one of FLOOR 3'S OWN PIECES (art/floor3.ts, his yes already), under the same names and kinds, at the same sizes
    and anchors and with the same lights, in look B's colours (`gradedB`: their colours drawn toward the stone's charcoal, a
    third of their colour kept, a shade darker; fire as it was). Its fire basket and the jailers' lamp are the burning ones.

### The gate (`src/art/prison_gate.ts`)

A GateArt, as the yard's: everything but the boss's pillar, arch and portcullis is floor 3's own (`chainedGates()`).

- `pillar(true)`: square, each face 12 (`PILLAR`), clad in riveted black iron, a plinth and a capital, up to the spring at 64
  (`PG_SPRING`). One picture for a gate either way, anchored at its front corner on the floor.
- `arch(alongX, true, lit)`: strips (art/gates.ts `Flat`) from the outer edge of one pillar to the other: iron voussoirs over
  the three tiles of the way (its crown 112), a rivet in each; the face plated in riveted iron to the cornice at 150
  (`PG_FACE`), its top a pillar's thickness back, iron spikes along it (taller over the middle, up to 176); HIS MARK on the
  tall keystone, the iron face-cage he wore, the enemy's embers dull in its eye-slits, or `lit` (the gate fallen) the cage alight
  pink to gold, and then it gives the enemy's light (FLAME[2], 24, 0.32); two great rings on the face's upper corners, a chain
  slung between them across the arch (its lowest point 96 over the floor); through the way, the arch's iron underside. Its
  iron is the prison's a tone lifted: it is the way on, seen from across the dark.
- `portcullis(alongX, true, raise)`: at the back of the arch, bars five wide every twelve (`PG_BARS`), each to a spike, a heavy
  rail over the spikes; the game's raise 0 to `GATE_UP` drawn up 0 to 90 (`prisonLift`; `PG_LIFT` 90: its spikes under the
  crown, a hero 56).
- THE DROP, Movement 9 (`PRISON_GATE_DROP`, at 30 a second from the moment the fight begins): 60 60 56 60 60 54 60 58 52 60
  (held, juddering), 24 (the drop), 0 (the landing, frame 11, `PRISON_SLAM_AT`: the slam begins, the mark lights), 0 6 8 2 0 0
  (a bounce, then down). `prisonGateDropAt(frame)` gives `{ raise, slam, lit }`.
- THE SLAM, `prisonGateSlam(alongX, f)`, f 0 to 15: soot thrown off the flags both ways and rolling out low, thinning; sparks
  struck off the spikes (an honest orange). 280 x 180, anchored at the middle of the gate's foot.

### The light, for the main chat to place

Nothing of the light is painted in: as everywhere in the game the renderer lays its dark and cuts a hole where each light burns
(render.ts `light`, `spot(x, y, r, strength)`), and what gives light is drawn over it (`drawLights`, `drawGlow`, colour added).
`PRISON_LIGHTS` (art/prison.ts) holds these numbers; `src/dev/preview_prison_game.ts` lays them exactly so, with the game's own
pools round the hero (380 at 0.36, 165 at 1), the boss's own light (56 at 0.7) and its vignette (0.62). In game pixels:

- THE DARK on floor 3: `rgba(6, 4, 14, 0.8)` in place of `FAR_DARK` 0.88 (look B's deep shadow between the fires; at 0.88 the
  unlit walls are lost).
- A FIRE BASKET (the floor's own `fire basket`, a wall piece stood at render/pieces.ts's `px ∓ 8, py + 12`): a hole at that
  point 22 up the wall, radius 56, strength 0.85; and a glow there, radius 28, `#ff8a2a` (EMBER[2]), 0.34, besides its own
  lights. The same for the jailers' lamp. (Today floor 3's burning wall pieces give only their own little glow and cut no hole.)
  Look B has them every few tiles: in the pictures on the cell block's back wall between the cells, either side of the
  corridors, and on his hall's walls (two on its far wall, one on its side wall).
- A GLOWING GRATE (a tile, and each tile of the channel's glowing grate): a hole at the tile's middle (8 below its top corner),
  radius 44, strength 0.75; and a glow there, radius 30, `#ff8a2a`, 0.34 (the glowing tiles carry it as their `lights`).
- THE OPEN CHANNEL, burnt low: a hole on its middle line every second tile of the open run, radius 38, strength 0.55; a glow
  there, radius 26, `#d0501a` (EMBER[1]), 0.28.
- THE GREAT GRATE in his hall: one hole at its middle, radius 130, strength 0.95; one glow there, radius 84, `#ff8a2a`, 0.44.
- The jailers' kettle is the floor's fire and is lit as a brazier already (62, 0.9). Dark grates and the dark channel's grates
  give none.

### How to bring it in (the main chat; not done here)

1. THE SWITCH: on with his yes to it in play, as the yard's was (game/yard.ts and render/yard.ts are the pattern): floor 3 (look
   3) is the prison while `PRISON` is on.
2. THE FLOOR: every floor tile of floor 3 drawn with `floor(tx, ty)` in place of the Crypt's; the prison's tiles laid where the
   level lays them (grates, a few glowing, soot under the fire baskets, rust by the iron, drains, straw before the cells), and
   floor 3's own tiles (in look B's colours) where they are laid now.
3. THE WALLS: every wall face of floor 3 `face(alongX, tx, ty)` in place of `art.ground.faceLeft/Right`; on each cell block's
   back wall (art: the long side its cells hang off, dungeon.ts `blockBack`) a cell's front, three tiles, where no real cell's
   doorway is (the real cells keep their doors: floor 3's own cell door); his hall's ring of wall `hall.faceLeft[tx mod 4]` /
   `hall.faceRight[ty mod 4]`.
4. THE FIRE CHANNEL down the middle of each cell block, along its length, two tiles wide: two or three tiles of the channel's
   grate at its far end, the open run (its first tile `where it begins`) with a bridge tile in its middle, two tiles of the
   glowing grate at its near end. The open tiles are not walked on (as a pit's: the bridge and the grates are); a railing on
   both rims of every open tile but the bridge's (stood at the rim, at the tile's middle, depth x + y), a post closing each run.
5. HIS HALL, FLAT: its floor `hall.floor(tx, ty, tx - gx, ty - gy)` with the great grate's far corner (gx, gy) two tiles before
   where he stands each way, its grate tiles' four frames by time (as a fire's, about 6 a second); `a great chain from the dark`
   stood at each of `HALL_RINGS`; floor 3's own winch, chain posts and heaps about it. (If the game can take the sunk pit of
   the pictures, the sunk version follows from the art chat.)
6. THE PIECES: with `PRISON` on, floor 3's pieces (`lookPieces(3)`, art/floors.ts) are `pieces` (the same names, look B's
   colours); the prison's chains from the dark set in the walls among floor 3's wall pieces; the free-hanging chains stood in the
   cell block like a thing (nobody blocked).
7. HIS GATE: with `PRISON_GATE` on, floor 3's gates are `makePrisonGateArt()` (wherever `lookGates(3)` / main.ts choose them),
   stood by render.ts `standDoors` as any boss gate (no change there). For its drop, as the yard's: drive the boss gate's raise
   from `prisonGateDropAt((game.time - d.fell) * 30)` in place of `d.open * GATE_UP` while it falls, light the mark from
   `PRISON_SLAM_AT`, stand `prisonGateSlam(s.alongX, f)` at `at(1.5, PILLAR / 32)` (depth x + y + 0.3) for its 16 frames, a
   small shake of 2 for 4 frames. Its face rises to 150 (its spikes to 176) over walls 80 high that fade: it stands whole over
   the dark, as in the pictures.
8. THE LIGHT, as above.

### What differs from B as he saw it (so he is not surprised)

- The light is the game's: its dark with holes and soft glows, not the painted bands of the pictures; a little darker away from
  the fires and the hero.
- The walls toward the eye are not drawn (the game's look since Version 18.4: the floor's edge against the dark); the pictures
  had them cut low.
- The fire channel is two whole tiles wide and its bed a little below the floor (the pictures' was 1.6 wide and deep).
- His hall is flat (the brief): the great grate, its iron ring and his ball's grooves on the hall's own floor, no sunk pit, no
  steps down.

### Pictures

- `pictures/game_ready.png` (1200 x 1624): floor 3's run built from these pieces the game's way, the knight in it, beside B as he
  picked it; one phone screen (1014 x 468) at the game's own size, the knight in the corridor before the gate; and the gate
  close with the knight, twice as big, its portcullis up and then down behind him with his mark alight.
- `pictures/game_run.png` (1200 x 840): the run alone at full size.

```
node tools/preview.mjs src/dev/preview_prison_game.ts docs/mockups/floor3_look/pictures/game_ready.png 1200 1624 "sheet"
node tools/preview.mjs src/dev/preview_prison_game.ts docs/mockups/floor3_look/pictures/game_run.png 1200 840 "run"
  (PREVIEW_TIMEOUT=120000; "phone" at 1014 x 468 and "gate" at 1120 x 540 give those alone)
```

### Checks

`tests/prison.test.ts`, 15 of 15: off, and nothing of the game imports either file; every piece the brief asks for painted;
every picture at its size and anchored where the game lays it (the walls as high as `WALL_LOOK.tall` and fading as far down as
its `fade`, every column of a face 80 high, the ends empty, the foot on the tile's near edge); crisp (every pixel whole or empty
but a wall's fading top, in the game's own four steps; a floor tile covering its whole diamond; no pixel alone); nothing cyan,
nothing pink (floor 3's own pieces: the enemy's fire only where it was); the floor and walls darker than the darkest word; light
from the upper left and the ribs every two tiles; the grates (dark: nothing bright; glowing: four frames that differ, fire in
each, its light), the channel burnt low with its far side going down; floor 3's own pieces with their shapes, anchors, lights
and fire as they were and their colours greyer; the hall's great grate (sixteen tiles, four frames, fire in each), its iron ring,
its reach; and the gate: floor 3's own for all but the boss's, crisp, nothing cyan, the way exactly three tiles with its middle
clear to 88, the same shape both ways and lit along x, the mark dull and alight on the keystone giving the enemy's light only
alight, the portcullis from up (its spikes at 90) down step by step to the floor on its points, the drop's timing and the slam's
soot and sparks. With them `tests/yard.test.ts`, `tests/yard_gate.test.ts`, `tests/gates.test.ts`, `tests/floor3.test.ts` and
`tests/floor3_look.test.ts` pass, and `tsc` is clean.

### The door out the back of his hall (`src/art/prison_exit.ts`), in place of a stairwell

His words, shown floor 3 built for the game, 2 Nov 2026: “Love it, but let’s not have stairs down from his arena cause if under it
is fire, going down to something else is gonna be weird”. Asked how to leave floor 3 instead, his pick: “Door out the back
(Recommended)”, offered as: when he falls, a heavy iron door in his hall's back wall grinds open onto a passage leading away from
the fire, down to floor 4.

Behind `PRISON_EXIT = { on: false }`; nothing of the game imports it (a test proves it). `exitArt(alongX)` gives, for a wall along x
(its face turned to screen-left, lit) or along y (to screen-right, in shade):

- `frames` (90, at 30 a second from the moment he falls; `shut` the first, `open` the last): THE DOOR in the wall, two tiles of it.
  A doorcase of black riveted iron (jambs, lintel, a head plate with five short spikes, standing whole over the wall's fading top as
  his gate does), the way through 40 across and 70 high (`EXIT_DOOR`; a hero is 56); in it one leaf of riveted plate, set back in
  the frame, on two strap hinges; TWO BARS across it in staples on both jambs; THE GREAT LOCK, a hasp over a staple on the jamb
  with a padlock in it; HIS MARK, the iron face-cage he wore, cast in the leaf's head, the enemy's embers dull in its eye-slits.
  220 x 190, anchored at the foot of the wall's face under the middle of the door (the joint of its two tiles), its face on the
  wall's line exactly as the two wall tiles it takes the place of.
- `under` (4 frames: its baskets flicker, about 6 a second): THE PASSAGE behind it. Through the doorway the iron sill, the flags
  and the doorway's dark reveal, the passage's firelight low on them; beyond the wall the passage two tiles wide going straight
  back, away from the hall and its grate, its left wall the prison's (80 high, fading as the game's), two of floor 3's own fire
  baskets on it; level for three tiles past the wall's row, then seven steps going DOWN (each half a tile deep and 8 picture pixels down), on
  into the dark
  (`EXIT_PASSAGE`). Laid as the game shows a corridor beyond a back wall: the hall's back wall hides its first tiles, and it shows
  over the wall from there on. 370 x 230, anchored at the same point. Its baskets carry their own `lights`.

THE OPENING (Movement 9: the build-up held, the release quick), frames at 30 a second from his fall (`EXIT_JOLTS` for a kick and a
sound each, `EXIT_KICKS` how hard):

- 0 to 8: his mark goes out (`MARK_OUT`); 6 to 11: the door shudders;
- 12 to 16: the upper bar judders and slides back into the hinge jamb, home with a clank at 16; 18 to 22: the lower bar, clank at 22;
- 26: the padlock's shackle springs (a clank), it drops to the floor and lies there, the hasp falls to hang;
- 27 to 43: HELD, half a second, grit sifting off the lintel;
- 44: the lurch, grinding, sparks off the hinge; 45 to 47: it catches; 48 to 52: it swings in, fast (smeared), the leaf going away
  behind the hinge jamb; 53: it hits the passage wall (the stop: soot burst out of the doorway and pouring off the lintel, sparks),
  rebounds, settles square by 57; the soot rolls out over the hall's floor and is gone by frame 84.
- OPEN TO WALK INTO: `EXIT_OPEN_SECS` = 3.0 s after his fall (the film's end, as floor 4's cave's `CAVE_OPEN_SECS`).

### Bringing the door in (the main chat; not done here)

1. NO STAIRWELL on floor 3: with `PRISON_EXIT` on, floor 3's boss hall gets no `stairSpots` / stairwell; this door is its way to
   floor 4.
2. WHERE IT STANDS: a back wall of his hall, the one farthest from his gate (so the passage leads away from the hall and its
   grate), two of its tiles side by side near the middle of its run, as `placeInBackWall` (game/ways.ts) chooses floor 4's cave's
   three: the dark behind them (the passage picture fills about 9 tiles back and 2 across: nothing of the level should be drawn
   there), nothing standing on the two rows of floor before them. In the pictures: the far wall (along x), its tiles x 4 and 5,
   his gate in the opposite wall. Set one of floor 3's fire baskets on the wall tile either side of it: lit, the door reads in the fight.
3. DRAWING IT: those two wall tiles' faces not drawn; `frames[f]` stood at the wall's face (its anchor: along x the floor point
   (x0 + 1, row + 1), along y (row + 1, y0 + 1)), sorted at the face's line, so that whoever stands in the hall is drawn after it
   and whoever has gone into its doorway's row before it (as the gates' arch strips are); `under[k]` drawn with the floor, after
   the floor tiles and under everything that stands, all the while (shut, the leaf hides its doorway part).
4. ITS FILM: frame 0 while he lives; from his fall `frames[min(89, floor((game.time - fell) * 30))]`; a kick and a sound at each
   of `EXIT_JOLTS`.
5. WHAT TAKES HIM ON (`EXIT_TAKES`): the doorway's two tiles in the wall's row, solid while it is shut, cut to floor once open
   (as `openGate` cuts a gate's three); walking onto either, `EXIT_OPEN_SECS` after his fall, takes him down to floor 4 (the
   curtain, as the stairwell's).
6. THE LIGHT (`EXIT_LIGHTS`, game pixels from the door's anchor along x; along y mirror x): a hole and a glow at each of the
   passage's baskets (as `PRISON_LIGHTS.basket`), and holes down the passage's floor (`path`), all the while; from the lurch the
   doorway's light (`spill`, its strength times `exitSpill(f)`); the door's frames carry the doorway's glow and the sparks' flashes
   as their own `lights`.

### Pictures of the door (for him)

- `pictures/exit_door.png` (1200 x 2230): his hall built the game's way, the door shut during the fight with the Chained One in
  it; the door opening at three moments, three times the game's size (bars drawn back; swinging in, sparks off the hinge; hitting
  the wall, soot and grit); open, the knight walking into the passage; a phone screen of it open.
- `pictures/exit_door.mp4` (about 13 s, 30 a second, captioned): the fight with the door shut; he falls and the door opens; the
  knight walks into the doorway and the screen goes dark (on to floor 4); the opening again close up at half speed.

```
node tools/preview.mjs src/dev/preview_prison_exit.ts docs/mockups/floor3_look/pictures/exit_door.png 1200 2230 "sheet"
node tools/film_frames.mjs src/dev/preview_prison_exit.ts "film" <dir>
ffmpeg -framerate 30 -i <dir>/f%04d.png -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart docs/mockups/floor3_look/pictures/exit_door.mp4
```

### Checks of the door

`tests/prison.test.ts`, now 20 of 20: off and imported by nothing of the game; every frame (90, both ways) and the passage
painted, at their sizes and anchors, the face's foot on the wall's line column by column as the two wall tiles it replaces;
crisp (every pixel whole but the wall's fading top, the game's steps), nothing cyan, nothing cut off; shut the leaf fills the
doorway and his mark's embers burn, out from frame 8 and no enemy's fire on it after; open the doorway clear and the passage
painted through it, its baskets burning with their light; the timing (open at 3.0 s; the bars home at their clanks; held half a
second; a quick swing; the stop, the rebound, square at rest; the light from the lurch; something moving at every jolt; the
shudder; the soot gone); the passage going back and on beyond the wall and down its steps, lit, dimmer as it goes down; the two
tiles that take him on. `tsc` is clean; `tests/bosses.test.ts`, `tests/floor3.test.ts`, `tests/floor3_look.test.ts` and
`tests/gates.test.ts` pass. (`floorAt` and `stoneFace` in art/prison.ts are now exported for it; nothing else there changed.)
