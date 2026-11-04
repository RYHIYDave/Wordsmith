# Floors 8 and 9 from his phone: the bridges, the stronghold entrance, the canyon walls

Branch `art/f8f9-fixes`, from `origin/work-f4` (25.0.5, dcb229d5). Everything is behind one switch that is off:
`F8F9_FIX = { on: false }` in `src/game/f8f9.ts`. Nothing changes in the game until it is turned on.

The picture for him: `pictures/f8f9_fixes.png` (1200 wide). For each of the three: his phone picture beside the game with
the fix at his phone's size (852 by 393, three device pixels to a point, as his pictures are), and under them the same
place in the game before and a closer look after; then a wide view of floor 9's stream with three bridges, and of floor 8's
canyon. Every picture of the game is a real screenshot of a dev build (`tools/scenarios/f8f9_look.mjs`, playwright,
`#painter=off` so that the page's own switch paints the ground), put together by `tools/f8f9_sheet.py`.

## His words

The main chat's post of 4 Nov 2026: “FLOORS 8 AND 9 FROM HIS PHONE: THE BRIDGES, A STRONGHOLD ENTRANCE FLOATING, THE CANYON
WALLS NOT SEEN (yours to mend, his pick; pictures to him first). He was asked who mends them: “The art chat (Recommended)”.”

His words, 4 Nov 2026, with his three phone pictures (on `origin/v23`, `docs/reports/2026-11-04/`):

1. `floor9_bridges.png`, 08:17: “The bridges in level 9 are really bad”; 08:21: “The bridges don’t line up but they also
   just look bad.”
2. `floor8_stronghold_entrance.png`, 08:19: “This stronghold entrance is really weird looking, it’s like it’s floating.
   Overlapping the top plateau section.”
3. `floor8_canyon_walls.png`, 08:20: “The perspective of the side walls is still off.  I should be able to see the walls of
   the canyons when points of the plateau jut out”

And the main chat's note: “If you add a module that keeps a made copy for a floor, give it a forgetMade() too.”

## What was wrong, in plain words

1. **The bridges.** A bridge was five tiles by two, laid along x or along y, whichever was nearer square to the stream, and
   each of its tiles was painted on its own as a square patch of planks (`footbridge`, art/floor9.ts). The stream wanders
   across the grid at any angle, so the patches crossed it on a slant, stepped and broken, and stuck out a tile past each
   bank. There was no bridge, only a strip of plank tiles.
2. **The stronghold entrance.** Two things. (a) Where the canyon floor before the wall was narrower than the wall is tall,
   the plateau's top on the near side of the floor was painted over the wall's face behind the floor (the same fault as 3
   below), so behind the gate there was no wall, only plateau top: the gate stood in front of the plateau, and the
   plateau's trees, drawn up from the near side, stood in front of the gate. (b) The gate was a free-standing gate of logs
   with posts, set down on the floor at the foot of where the wall should be, its apron of flag tiles laid flat over
   whatever was painted there, so its back corner ran up under the plateau's edge. It read as floating.
3. **The canyon walls.** The ground painter (art/terrain.ts) cuts away a cliff that stands in front of the floor (toward the
   eye) so the hero is never hidden. But where such a near cliff was within one wall's height below the floor (a point of
   the plateau jutting toward the eye, a narrow canyon), its top was still painted over the FAR wall's face behind the
   floor. So at every jut the far wall vanished: the floor met plateau top on both sides, and the canyon read flat. His
   rule of 12 Oct only put a 20-pixel shadow strip there, where the wall's edge slanted the right way.

## The fixes

1. **A real footbridge for each crossing, square to the stream** (art/f8f9.ts `bridgeArt`; game/f8f9.ts `squareBridge`).
   The bridge's axis is turned at right angles to the stream's own line where it crosses (the stream's way taken over 1.5
   tiles either side, so a bend gives the way between its two runs), its middle on the stream's middle, its length the
   stream's width with its boulders and banks and a little more (2.84 tiles: the water reaches 0.55 from the middle, its
   boulders and bank to 0.99, the bridge's ends rest past that), 1.6 tiles wide. It is drawn whole along its own line: two
   round log stringers resting on both banks, planks across them (each a little crooked, its own tone, nailed over the
   stringers, a little moss), a post at each end and two between on each side with a pole rail along their tops and a rope
   rail under it, its ends set into the banks with wet river stones; the stream runs on under it (the ground's own
   flowing water). The deck lies under every figure; each side's rail is three spans that stand in depth, so a body on the
   deck is behind the near rail and in front of the far one, and one on the bank behind the bridge is behind both.
   **The walkable tiles:** the whole tiles whose middles lie within 0.62 tiles of the bridge's axis and 1.9 along it, the
   axis slid along the stream by up to half a tile to make that band as wide as it can be, side to side joined from bank to
   bank (the walk grid has cut tiles shut, so whole tiles must join by their sides). Over a stream that runs along the grid
   that is two rows of tiles; on the slant, a staircase two tiles thick. Every one of its tiles' middles is under the deck
   (within 0.8 of the axis), and a body's middle (0.3 across) stays within about 0.7. (If no band of 0.62 joins, it widens
   to 0.72, 0.85, 1.0; in the floors tested it never had to.)
2. **The door carved into the canyon wall** (art/f8f9.ts `carvedDoor`; art/terrain.ts `cutIn`; game/act1_dress.ts). The
   wall's foot is cut exactly straight along the yard's back line for the apron's width (6.6 tiles), so the cliff face there
   is one flat plane, and the apron's 6 by 3 tiles are floor as painted. In that face: a doorway sunk into the rock, its left
   reveal and its floor seen going in, framed in the cult's dressed stone (jambs in courses, a heavy lintel, a threshold step
   out onto the canyon floor), a steer's skull of the canyon's cattle on the lintel; shut, a door of iron-bound timber set
   back in it; open, its leaves swung in against the dark. It casts no shadow out on the floor. The braziers and banners
   stand against the wall either side of the door on the canyon floor (no longer out in the yard, where one stood in front of
   the door on the screen). With fix 3 the wall behind is always there.
3. **Every wall's face drawn down to the floor** (art/terrain.ts `downFaces`, on Echo Canyon's look). The near cliff is cut
   away over the far wall's face as it already was over the floor: wherever an edge of a top looks down the screen, its face
   is painted down to the floor below it, the whole of the wall's height or as far as the rock goes, in the canyon's banded
   rock, lit or in shade by which way it turns. These faces lie in the ground under every figure and are only ever painted
   on rock, never over the floor, so they never hide the hero (no fading is needed). Nothing of the tops (junipers, yucca,
   hoodoos) may stand on a face now: a top piece whose foot would be drawn over a wall's face (a jutting point's tree drawn
   up in front of the far wall: the tree in front of the gate in his picture) is not laid (`clearOfFloor`).

## What the main chat must do

1. Show him `pictures/f8f9_fixes.png`. On his yes, set `F8F9_FIX.on = true` in `src/game/f8f9.ts` (in the source: the
   painter's worker reads the same switch, so a page's own flip at run time does not reach the worker; the pictures were
   taken with `#painter=off`).
2. That changes how two floors are LAID (both only with the switch on):
   - Floor 9 (game/act1_layout.ts `bridgesOf`): each bridge's tiles are the band above in place of the 5 by 2 block, and the
     `Bridge` carries its middle, angle, length and width (`x`, `y`, `ang`, `len`, `wide`). Floors come out from the same
     attempt as before in every seed tested (the floor's seed is the same), only the tiles at the bridges differ.
     game/act1_dress.ts no longer lays `footbridge` tiles for such a bridge.
   - Floor 8 (game/act1_dress.ts): each stronghold's braziers stand at (gx ± 1.75, gy + 0.6) on tiles (gx - 2, gy) and
     (gx + 1, gy), its banners at (gx ± 2.8, gy + 0.45) on tiles (gx - 3, gy) and (gx + 2, gy) (before: out in the court at
     (gx ± 2.3, gy + 1.1) and (gx ± 2.6, gy + 2.7)). The door's tiles (gx - 1, gy), (gx, gy) stay walked; the altar and the
     guards are where they were.
3. The renderer: already wired, all behind the switch: render/act1_pieces.ts draws each bridge's deck in `floorTiles`, its
   rails in `standBridges` (called from render.ts, one line), and the carved door in place of the waystation's gate on floor
   8 (`sprite`, `shadowOf`); render/outdoor.ts gives Echo Canyon's look its `cutIn` walls.
4. **forgetMade:** art/f8f9.ts keeps each floor's bridges and the door as made copies; its `forgetMade()` is called from
   `Act1Pieces.begin` whenever another level is come into (render/act1_pieces.ts), so nothing is kept past its floor.
5. `__dbg.looks.F8F9_FIX` is the switch, for playtests (main.ts).

Worth his word, not done: the Quarry (floor 6) cuts its near cliffs the same way and could take `downFaces` too (a word in
its look); the Ledge Road (7) is left alone (its drop is drawn otherwise). Found on the way, before and after alike: on floor 9,
seed 3, a stronghold's court is laid whole across the stream (tiles 35, 59; 36, 59; 36, 60), so there is a patch of flag floor
in the water; not the bridges', not touched here.

## The tests

`tests/f8f9.test.ts` (7 tests, all pass): the switch off and nothing changed with it off; every crossing on eight seeds of
floor 9 one bridge, square to the stream (the cosine between its axis and the stream under 0.02), over the stream's middle,
reaching past the water, boulders and banks, its tiles whole floor, every one under the deck, joined side to side from bank to
bank, and no floor in the water but a bridge's; the bridge's pictures (six angles) and the door's, no cyan; on five seeds of
floor 8 every stronghold's apron tile, corners and all, on the floor as painted, its braziers, banners and altar on the canyon
floor and on floor tiles, the wall's foot straight along its back line (rock behind, floor before, its whole width), the
door's tiles walked; on three seeds of floor 8 round every point of the main way, every edge of a top that looks down the
screen with its face drawn down to it, the whole height (it finds hundreds lost with the switch off); no top piece laid on a
face; the floor's own pixels the same before and after. `npx tsc --noEmit -p tsconfig.json` clean. The floors' own and act 1's
tests (tests/act1_*.test.ts, floor6 to floor9, canyon, canyon_scorpions, pinewood, terrain, hold_altar, flowing and the rest
of act 1's: 224) all pass, and the grounds that share the painter (fen, gateward, undercity, millrace, housequiet, library,
low_stacks, hub2, floor4, floor6_mobs, new_mobs3, walls: 94) pass. The one change those asked: floor 7's and floor 9's import
checks let only their own floor's code import their pieces, so art/f8f9.ts holds its own copies of the four colours it shares
with them (PBARK, GRANITE, MOSS, BONE: the same values) rather than importing them.
