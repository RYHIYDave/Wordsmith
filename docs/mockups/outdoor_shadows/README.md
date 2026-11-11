# Every floor's near shadow with no teeth; the Quarry and the Ledge Road repainted as Echo Canyon was

The chat working from his queue, on the branch `art/outdoor-shadows` (from `art/canyon-repaint` at b082b85c, which the main chat
has been asked to bring in: this branch carries it). MOCK-UPS BEHIND THREE SWITCHES, ALL OFF. Pictures to him first; the main chat
puts them in.

## What began it

His words, Wed 11 Nov 2026, by 08:15 (Eastern), with Echo Canyon's repaint handed to the main chat
(docs/mockups/canyon_repaint/README.md):

- Told "The same spiky shadow edge you circled in Echo Canyon is also on the Quarry, the Ledge Road and the city floors" and asked
  whether to add a queue item to smooth those too: "Just fix them now".
- Asked whether to start the queue's next item for this chat (the Mage and the Warlock's eight true sides): "Work on the other
  canyon levels". Read as: the other floors of the descent that have cliffs get what Echo Canyon got. Those are floor 6, the
  Quarry, and floor 7, the Ledge Road (floors 9 and 10, the Pinewood and the Sunken Fen, are flat: their looks' `rise` is 0).

## The three switches

1. `SHADOW_EVEN` (src/art/terrain.ts): EVERY FLOOR'S NEAR SHADOW REACHES EVENLY. The near shadow's reach wandered from three
   quarters to five quarters of its length, a column at a time, which gave its edge teeth where the wall's own edge is smooth (in
   the city, a straight eave with a wavy shadow). On, every look painted by `paintTerrain` has its near shadow reach the same
   distance in every column, so its edge is the wall's own line moved up the picture. How deep and how dark each floor's shadow
   is, is kept. The looks with a near shadow: the Quarry, the Ledge Road, Echo Canyon, and the city's (gateward, undercity,
   library, housequiet, swangardens, masque, glassgallery, keep, quiettower).
2. `QUARRY_RIM` (src/art/quarry.ts): THE QUARRY AS ECHO CANYON. The pale caprock rim along the near edges too, where a near
   cliff is cut away (`cutRim` 1.7); the walls whose faces are in shade throw their shadow across the quarry's floor (`shade`:
   1.7 tiles, as long for a wall of 110 picture pixels as the canyon's 2.3 for its 150; 0.26 dark on the pale stone); its near
   shadow even. Its depth and dark kept (1.3 tiles; 0.36, 0.22).
3. `LEDGE_RIM` (src/art/ledge.ts): THE LEDGE ROAD AS ECHO CANYON. The same three things (`cutRim` 1.7; `shade` 1.7 tiles, 0.26
   dark; its near shadow even). The road has the drop on its near side, not a cliff, so what shows is the back wall's shadow
   across the road. THE DROP IS AIR AND THROWS NO SHADOW (art/terrain.ts: the cast shadow is worked out when first asked for, once
   the look's drop is known).

Nothing painted stands over the walkable floor: every pixel shows the kind of ground it did (tests/outdoor_shadows.test.ts). No
texture is repainted.

## Pictures (pictures/)

- quarry_near.png: a near cliff of the Quarry, now beside repainted (the rim, the shadow's even edge).
- quarry_wall.png: a wall of the Quarry, now beside repainted (its cast shadow).
- ledge.png: the Ledge Road under its back wall, now beside repainted (the wall's cast shadow).
- gateward_shadow.png: a near roof's shadow on a street of the Gate Ward, now beside repainted (`SHADOW_EVEN` alone).
- quarry_phone.png, ledge_phone.png: the game at his phone's size (852 by 393, three to a point), repainted.

His answer: not yet given (shown 11 Nov 2026).

## How to see it

Flip the switches in the files for the build (the ground is painted in the painter's worker too), build, flip them back:

    sed -i 's/export const QUARRY_RIM = { on: false,/export const QUARRY_RIM = { on: true,/' src/art/quarry.ts
    sed -i 's/export const LEDGE_RIM = { on: false,/export const LEDGE_RIM = { on: true,/' src/art/ledge.ts
    sed -i 's/export const SHADOW_EVEN = { on: false };/export const SHADOW_EVEN = { on: true };/' src/art/terrain.ts
    node tools/build_to.mjs dist/outdoor_on.html
    (and back)
    DEPTH=6 node tools/playtest.mjs --file dist/outdoor_on.html --touch --size 852x393 --dpr 3 --scenario tools/scenarios/canyon_repaint.mjs --out shots/outdoor/f6

(tools/scenarios/canyon_repaint.mjs takes DEPTH: 6, 7, 8, or a city floor.)

## What it costs

`SHADOW_EVEN` costs nothing (one noise fewer a floor pixel in a near shadow). The Quarry's and the Ledge Road's cost is Echo
Canyon's: five pieces of 256 by 256 picture pixels there, the best of three, 360 and 342 ms off, 369 and 377 ms on (two runs each
way, on this machine, after the cast shadow was made to be worked out only when first asked for).

## Checked

`tsc --noEmit` clean. tests/outdoor_shadows.test.ts 5 of 5 (off, each look the game's; SHADOW_EVEN: 41 picture pixels up from the
cliff's edge in every column of the Quarry, nothing else changed; QUARRY_RIM: every pixel the kind it was, the rim along the near
edges, the shaded wall's shadow 0.26 dark, the lit wall's none, the open floor as it was; LEDGE_RIM: the same, and the drop throws
none). tests/terrain.test.ts 10 of 10, ledge 14 of 14, canyon 9 of 9, canyon_rim 6 of 6, f8f9 7 of 7. Floors 6, 7, 11, 14 and 19
played to several places with all the switches on: no errors.

## For the main chat

- Merge `art/outdoor-shadows` (it carries `art/canyon-repaint`). With his yes, set the switches he said yes to.
- `SHADOW_EVEN` on makes `nearShadow.even` moot; the three `_RIM` switches each make their own floor's near shadow even
  whatever `SHADOW_EVEN` says.
- The city's floors were looked at on floors 11, 14 and 19 only.
