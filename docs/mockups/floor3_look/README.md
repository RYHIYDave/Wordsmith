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
