# Floor 10, the Sunken Fen: its art (mock-ups, for his yes)

The art chat's branch `mockup/act1-fen` (from `mockup/act1-pinewood`). Nothing here is in the game until the main chat
puts it there, on his yes. Begun on his word, 15 Oct 2026, by 15:06 (the clock read 15:06:35 just after), to "Floor 9
is done. Move on to floor 10, the Sunken Fen and the Drowned Eye?": "Yes, floor 10 go (Recommended)", offered as: the
same order as before: the ground, its pieces, the Drowned Eye, then its mobs, each shown to him first.

The measure is the planning chat's Sunken Fen he said yes to on 13 Oct (asked "Is this the Sunken Fen?", his pick "More
of the Eye"; then "Is this the Sunken Fen and the Drowned Eye now?", by 07:40: "Yes, this is it (Recommended)";
src/dev/preview_act1.ts, hash `fen`, on mockup/act1-levels), and his word of 12 Oct, 18:56: "The forest and the swamp
don't really have walls".

## Its ground (src/art/fen.ts, painted by src/art/terrain.ts; FOR HIS YES)

`fenLook(land)`, a look for the game-ready painter, which is unchanged: rise 0 (his word, no walls: the fen's water at
the islands' height), near 0.
- THE FLOOR: islands of sodden peat, black-brown mud in slow patches, sodden moss over it, puddles of dark water lying
  in it (the murky sky's light along their far edge), sedge in clumps, dead roots twisting through it; wetter and
  darker toward its edge, where it slips into the water. The swamp's sickness in it: dull violet veins (the
  Pinewood's), and the grey it drains things to.
- THE RUIN (where the level says): old paving, flagstones along the world's lines, each its own tone, sunk and tilted
  (lit along its upper left edge, shaded along its lower right), cracked, moss and slime in the joints and over them,
  the sickness's veins running up through the cracks.
- NO WALLS: past the islands the fen's water: murky green-black, a brown murk in the shallows by the mud with
  cattails standing in it, a line of light where it meets the mud, darker further out; drifts of duckweed, lily pads,
  slow lines of scum; the mist lying low over it in thin pale streaks. Under the boardwalks (walkable tiles over the
  water) the water runs on, painted under the planks; the boardwalks themselves are pieces, next.
- THE EYE'S POOL (where the level says): deep, near-black water, slow rings rippling out over it from its middle, a
  lip of old stone and slime at its rim. The Eye itself is the boss, to come.

What only the level knows comes in as four optional fields, each a function of world (x, y) in tiles: where its
boardwalks are laid over the water, where its ruin is paved, how far from the Eye's pool's middle (its rim at 1), and
how sick the ground is (0.45 where the level does not say). src/dev/preview_fen.ts lays the tiles by hand in the
planning mock-up's shape: four mud islands, the ruin's ring round the pool, its boardwalks; how the real fen is laid
is the main chat's. COST here: a piece of 256 by 256 picture pixels 42 to 102 ms.

    node tools/preview.mjs src/dev/preview_fen.ts shots/fen_ground.png 1014 468 shot
    node tools/preview.mjs src/dev/preview_fen.ts shots/fen_close.png 1014 936 close
    node tools/preview.mjs src/dev/preview_fen.ts shots/fen_tiles.png 1014 468 tiles

`tests/fen.test.ts` (7): nothing of the game imports it; every walkable tile's middle is floor, and no other tile's;
no walls (only floor and the fen's water, a pixel floor exactly where the ground is); the islands peat, the ruin
paved, water under the boardwalk and the pool dark, where the level says; two pieces side by side are one picture,
the same every time; every pixel opaque; no cyan or pink, and duller than every word's colour.

| His rule | How the ground keeps it |
| --- | --- |
| His word: no walls in the swamp | the fen's water at the islands' height; nothing stands over the floor |
| Rounded edges (12 Oct) | the painter rounds and rags the tiles' edge, as on every Act 1 floor |
| Places 2: a step quieter | dark, dull water and peat; the figures stand out on it |
| Places 3: each place its own | black-green water, peat browns, the ruin's cold grey stone: no other floor's |
| Places 6: old, broken | the ruin's flagstones sunk, tilted and cracked, slime in their joints |
| Colour 3, 4: no cyan, no pink, duller than any word | the water's green held clear of cyan; the sickness's violet dull; tested |
| Light from the upper left | tilted stones lit along their upper left edge; puddles lit along their far edge |

Shown `shots/fen_ground.png` and `shots/fen_close.png` and asked "Is this the Sunken Fen's ground?" (offered: "Yes, on to
its pieces (Recommended)", next its 25 pieces: boardwalks, dead trees, the obelisks and the rest; "Not yet"), his answer,
15 Oct, by 15:22 (the clock read 15:22:34 just after): "Yes, on to its pieces (Recommended)".

## Its 25 pieces (src/art/floor10.ts, `fenPieces()`)

After his yes to the ground, its pieces, by his rule of 10 Oct (25 that are the theme of the 5 levels, then 25 for each
boss): the old fen's, the drowned ruin's, the cult's at its work here, and the Eye's. What they are follows the planning
chat's Sunken Fen he said yes to on 13 Oct: dark water, mud islands with reeds and dead trees, boardwalks between, the
arena a sunken ruin, a ring of old paving round a deep pool, three of the quarry's obelisks on it, their runes burning
pink, cultists chanting at them.

| | Piece | Kind | Pictures |
| --- | --- | --- | --- |
| 1 | dead swamp tree (grey, cracked, moss hanging in strands, on roots like knees in the water) | obstacle | 2 |
| 2 | drowned stump (splintered, slime at the water, its roots arching into it) | obstacle | 1 |
| 3 | arching roots | obstacle | 1 |
| 4 | sunken log (moss, slime, a row of toadstools) | obstacle | 1 |
| 5 | cattails (reeds and their brown heads in the shallows) | on the floor | 2 |
| 6 | sedge tussock | on the floor | 2 |
| 7 | lily pads (one dull cream flower) | on the floor | 1 |
| 8 | pale toadstools | on the floor | 1 |
| 9 | a drowned beast's ribs (half in the mud, its long skull) | obstacle | 1 |
| 10 | a sunken rowboat (an oar in it) | obstacle | 1 |
| 11 | mossy stones (in the water) | on the floor | 1 |
| 12 | the boardwalk | floor tile | 6 |
| 13 | a marker post (rope, an old lantern, dark) | obstacle | 1 |
| 14 | a broken column (leaning on its plinth, fluted, broken jagged) | obstacle | 1 |
| 15 | fallen column drums | obstacle | 1 |
| 16 | a sunken statue's head (of the people before the cult; original) | obstacle | 1 |
| 17 | a broken stair (down into the water) | obstacle | 1 |
| 18 | the cult's obelisk (three of its skulls and the channel between, burning pink to gold, pulsing; it lights what is round it) | obstacle | 4 |
| 19 | the cult's raft (its stores under a violet cloth) | obstacle | 1 |
| 20 | the cult's supply crates (its mark on them) | breakable | 2 |
| 21 | a cage of offerings (wicker on a stake, a skull and beads in it) | breakable | 2 |
| 22 | eyespawn eggs (pale, veined with the swamp's violet, an eye's shadow in each) | breakable | 2 |
| 23 | the sucking bog (still, bubbling, whirling, swallowing) | trap | 4 |
| 24 | the drowned pilgrim's tablet (an eye over waves carved on it, an old script) | quest | 1 |
| 25 | the Eye's reach (pale cords of its flesh broken up through the mud, violet veins) | obstacle | 1 |

FOR THE MAIN CHAT: the boardwalk is a floor tile in six pictures, in this order: whole along x, whole along y, and the
four halves the map-maker keeps where the way runs straight across the screen or up and down it (as the fen's are
laid): the upper half (the tile cut `CUT_NEAR`), the lower (`CUT_FAR`), the left (`CUT_RIGHT`) and the right
(`CUT_LEFT`), `WALK_FORMS` in floor10.ts. The halves' planks run across the way and go on from one half into the
next, so halves laid together are one walk (tested). The ground paints water under the boardwalk; the pieces lie over
it. Things standing in the water have its rings round their foot, painted under them. Only the obelisk gives light
(the cult's pink).

    node tools/preview.mjs src/dev/preview_fen.ts shots/fen_pieces.png 1014 2870 pieces
    node tools/preview.mjs src/dev/preview_fen.ts shots/fen_dressed.png 1014 468 dressed

`tests/floor10.test.ts` (8): nothing of the game imports them; each its pictures and its own name, only the cult's
obelisk gives light and its light is the cult's fire; crisp, no loose pixels; no cyan, no pink or red but the cult's
fire on the obelisk, duller than every word; standing on its foot, floor tiles inside their diamond; nothing cut off;
the boardwalk's halves one walk; twenty-five.

| His rule | How the pieces keep it |
| --- | --- |
| Places 2: a step quieter | dusk colours: grey dead wood, weathered planks, dark slime; the quarry's stone gone grey in the fen |
| Colour 3: nothing of a place glows; pink is the enemy's | only the cult's obelisk burns, its runes and its light in the cult's own fire |
| Colour 4: duller than any word | tested |
| The sickness a dull violet | the eggs' and the Eye's reach's veins |
| Original designs only | the statue's head, the tablet's eye and script, all made here |
| Tall things seen through (12 Oct) | the game's own; the dressed picture does it as the game does, for the dead trees, the column, the obelisks |
| Light from the upper left | every piece lit from there; the water's rings lit on that side |

Shown `shots/fen_dressed.png` (the phone screen dressed with them) and `shots/fen_pieces.png` (each one by one) and
asked "Are these the Sunken Fen's 25 pieces?" (offered: "Yes, on to the Drowned Eye (Recommended)", next the boss: a few
quick pop-ups on its look, then its picture, then its moves from his design doc; "Not yet"), his answer, 15 Oct, by
16:01 (the clock read 16:01:21 just after): "Yes, on to the Drowned Eye (Recommended)".

NEXT: the Drowned Eye, floor 10's boss: its brief by pop-ups, its look, then its moves from his design doc.

## The Drowned Eye, floor 10's boss and the act's

HIS DESIGN DOC (the planning chat's "Wordsmith Act 1: The Descent (Levels 6–10)", Level 10, read 15 Oct): the Act 1
finale; the look of his pick of 13 Oct ("a pale, veined eyeball with a burning gold iris and a slit pupil", risen close
under the pool's surface, its arms coiling out under the water past the ruin, two curling up out of it); three phases:
1, it stays under the water, tentacles bursting up round the player while chanters shield it; 2, it surfaces, "a huge
eye and maw rising out of the ruins", and spawns smaller horrors from the muck; 3, it pulls the siege magic back into
itself, the dome fades and the whole arena turns hostile; the obelisks are its anchors; the collected pages let the
player speak the chant backwards to stun the Eye or break a phase.

HIS BRIEF, his art rulebook's questions in two pop-ups (15 Oct, by 16:04, each his pick, the labels as he tapped them):
how big, "Huge: its eye as wide as the pool (Recommended)"; what rises when it surfaces, "The eye splits open into a
maw" (not the recommended pick); its arms, "Pale veined tentacles, as in the plan's picture (Recommended)"; what you
see of it under the water, "Its eye glowing gold under the water (Recommended)"; in phase 3, "The obelisks' pink lines
bend into it; its veins blaze (Recommended)"; how it dies, "It sinks, its eye going dark, as the dome shatters
(Recommended)"; what it must never look like, "Not a cartoon googly eye (Recommended)"; its sound (sound rule 7), "A
deep drowned groan, wet slaps, the chant (Recommended)".

HIS WORDS, in this chat, 15 Oct: 16:02, "Remember the drowned eye is the Act Boss.  I’d like him to have a couple of
different phases, and a significant moveset"; 16:04, "And I want the fight to be engaging and long and exciting a very
cool.  Lots of tentacle dodging and spells". Read as (told him so): the act's boss, a long fight and a big moveset;
three phases as his doc has them, each adding moves; every move with a warning to read and dodge; how long the fight
runs and when its phases change is the main chat's to build, and his doc's.

HIS MOVES, his picks in one pop-up (15 Oct, by 16:12): its tentacles, "Burst up under you from glowing cracks
(Recommended)", "Sweep across the whole ring (Recommended)", "Rear up high and slam down in a line (Recommended)"; its
spells, "His gaze: a gold beam sweeping the arena (Recommended)", "The siege's pink bolts raining down (Recommended)",
"Bile spat in arcs, leaving pools (Recommended)"; its maw, "Breathes in, pulling you close, then bites (Recommended)",
"Spews eyespawn out of the muck (Recommended)", and in his own words, "I like the water idea for the roar, but instead
it picks its bulk up and splashes down"; its phases, "Three, as your plan has, each harder (Recommended)". Read as
(told him so): the splash, it heaves its whole bulk up out of the pool and crashes down, a wave rolling out over the
arena to jump or dash through. Shared out as offered to him (the main chat's to time): phase 1, under the water, the
burst, the sweep and the slam; phase 2, surfaced, those and the gaze, the bile, the breath and bite, the eyespawn and
the splash; phase 3, the siege magic pulled in, all of them and the siege's bolts raining down.

NEXT: its look (risen, front and back, beside the knight; under the water; torn open into its maw; blazing), then its
moves a group at a time, each filmed for his yes.

HIS WORDS, 15 Oct, 16:14: "Above all I need it to look epic and cool as hell". Read as (told him so): above everything
else, spectacle: a huge burning eye glaring up out of the black water, arms rearing over the ruin, every move pushed as
far as it will go (his rulebook, Animations 1).

### Its look (src/art/drowned_eye.ts, behind EYE_ON, off)

Its own solids, in the same painter as the Hollow Stag. EYE_CANVAS 600 by 560, the pool's middle at the water at
(300, 400). Its eye EYE_R 58 of its own lengths across from its middle (his pick, as wide as the pool), set in a ring of
knotted flesh (its brow and lids), a fringe of feelers on it, weed hanging from its brow, a great drowned bulk behind
it, barnacled; its iris the enemy's pink burning to gold, a black slit; its white veined with the swamp's violet. A
crown of five pale veined arms rearing out of the water round it, suckers along them, their tips curling; four more
coiled out under the water. WHAT OF IT IS UNDER THE WATER is seen through it, darker the deeper, the water's ripples
over it, none of it deeper than 40 of its own lengths and none beyond the pool's rim (EYE_POOL, the planning chat's
pool, 1.95 by 1.62 tiles; beyond it is the ruin's paving), and no edge round it; its iris shows through brighter.
Under the water (phase 1) its eye lies 70 under, turned up, staring up through the pool. Torn open (his pick): its eye
splits down its slit, each half swung back on a hinge at its outer edge, teeth along the tear, baring a maw of rings on
rings of hooked teeth going down to its gullet, burning. Blazing (phase 3): cracks of the siege's pink fire through
its flesh, its veins burning.

    node tools/preview.mjs src/dev/preview_drowned_eye.ts shots/eye_look.png 1014 900 look

`tests/drowned_eye.test.ts` (8, its look only; the whole boss review comes with its moves): nothing of the game imports
it; crisp, its pink edge, nothing cyan, every light the enemy's fire; nothing cut off; huge; its eye burning and
looking at you, its back its flesh; under the water, its iris burning through, nothing beyond the pool, no edge round
what is under; its maw, teeth and gullet; blazing.
