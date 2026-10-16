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

SHOWN (the look above), asked "Is this the Drowned Eye?", his pick, before his 16:35 message: "Bigger and more
monstrous" (offered as: push his size, his arms and his menace further before anything moves). Read as (told him so):
bigger, a towering hood of flesh behind the eye; seven arms rearing instead of five, longer and thicker, bone hooks
along them; a heavy scowling brow coming down over the eye in a V, a narrower slit, spines along his back. His word,
16:35: "The ring should be bigger, outer ring and inner ring.  He looks squished in the middle and the warrior needs
room to maneuver". Read as (told him so): the pool half again as wide, the paved ring about three tiles wide, nearly
twice the room. REDONE: EYE_R 70; EYE_CANVAS 760 by 700, the pool's middle at (380, 500); a hood of flesh behind the eye
crowned with seven raked horns; seven arms rearing (270 to 340 of its own lengths long), bone hooks raked along their
outer edge; four more coiled sideways along the bottom; under the water, two breaking the surface in arcs; the brow a
scowl that lifts as the maw opens. THE ARENA: EYE_POOL 2.9 by 2.5 tiles (was the plan's 1.95 by 1.62), EYE_RING, the
paving, out to 6.0 by 5.2 (was 3.5 by 3.0).

Shown again (`shots/eye_close.png`, `shots/eye_look.png`), asked "Is this the Drowned Eye now, with the bigger
arena?" (offered: "Yes, animate him (Recommended)", next his stand under the water and risen, then his tentacle
moves, filmed; "Even bigger and more monstrous"; "Not yet"), his answer, 15 Oct, by 16:42 (the clock read 16:42:30
just after): "Yes, animate him (Recommended)".

NEXT: his stand (under the water, and risen), then his tentacle moves (the burst from glowing cracks, the sweep, the
slam), filmed for his yes.

HIS WORDS, 15 Oct, 16:43: "We want really wild and big for these animations.  Lots of motion". Read as (told him so):
nothing of him calm, even standing: his arms thrashing and writhing all through, his bulk heaving, water pouring off
him, his eye darting; every attack a huge wind-up, a whip-fast strike, stones and water flying.

### His stands (`eyePainted('stand' | 'lurk', t, view)`)

RISEN (phases 2 and 3), EYE_STAND, 45 frames at 15 a second, a 3 s round: heaving twice a round, swaying; every arm
writhing (rising and falling, bending, curling and uncurling, waving), each its own way; his eye roving, darting aside
1.05 to 1.7 s; a heavy lid, and a blink 2.2 to 2.52 s (shut at about 2.36 s); his pupil's slit and his iris's fire
pulsing; drops of water falling off his arms. UNDER THE WATER (phase 1), EYE_LURK, 45 frames at 15, a 3 s round: his
eye glowing up through the pool, pulsing, roving; the two arms that break the surface rolling, the rest coiling along
the bottom; rings spreading on the water over his eye. His eye now has real lids, the upper sliding down to shut it.

    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "standfilm" shots/eye_stand.gif 9
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "lurkfilm" shots/eye_lurk.gif 9

Asked "His two stands, risen and under the water: wild enough?" (offered: "Yes, on to his tentacle moves
(Recommended)"; "Wilder still"; "Not yet"), his answer, 15 Oct, by 16:51 (the clock read 16:50:59 just after): "Yes,
on to his tentacle moves (Recommended)".

NEXT: his tentacle moves: arms bursting up under you from glowing cracks, the sweep across the ring, the slam.

### His tentacle moves (`eyePainted(which, t, view, aim, clock)`; `burstPainted(t, view, seed)`)

Each from either stand: `slam`, `sweep` risen; `slamUnder`, `sweepUnder` from under the water. `aim`: the way the blow
goes, degrees round from his forward toward his left (the game aims it at you); `clock`: where his stand was when the
move began (the stand runs on under the move, so a move starts from the stand as it was and hands back to it as it
will be). EYE_CANVAS is now 760 by 790 (the pool's middle still at (380, 500)), for the slam's reach.

- THE SLAM (EYE_SLAM, 2.4 s): the greatest of his arms rears up out of the pool just inside its rim and out over you
  like a cobra, its tip hooked down at you, its veins burning brighter and brighter the enemy's fire, 0 to 0.7 s; HELD,
  trembling, its shadow falling along its line and darkening (THE WARNING), to 1.15 s; it falls like a tree, faster and
  faster, its tip lagging then cracking down; THE SLAM at 1.3 s, along its line, 250 of his lengths long from where it
  leaves the pool (about 6.4 tiles from his middle at the most); the stones cracked along it, rubble, dust and water
  flung; his bulk jolting down; bouncing, writhing on the stones; dragged back into the pool 1.62 to 2.2 s.
- THE SWEEP (EYE_SWEEP, 2.4 s): an arm rises out of the pool on the side before you and coils back high, cocked and
  trembling, burning (THE WARNING), 0 to 1.0 s; THE SWEEP 1.0 to 1.42 s: whipped round 170 degrees through its aim, low
  over the stones (knee-high to the knight), out to 6.2 tiles from his middle, its tip trailing, spray and rubble flung
  behind it; overshoots to 1.68 s; sinks back by 2.3 s.
- THE BURST (EYE_BURST, 2.0 s, on its own BURST_CANVAS 340 by 420, its middle on the floor at (170, 320), for the game
  to lay where you stand, several at once): the paving cracks, nine cracks spreading about a tile out, glowing the
  enemy's pink and brightening to gold, sparks rising (THE WARNING), 0 to 0.8 s; IT BURSTS at 0.8 s, an arm shooting up
  through it 200 of his lengths tall by 0.94 s, stones and dust flung; it thrashes; drawn back down 1.48 to 1.84 s; the
  hole and the cracks' glow dying. The film lays four, each 0.12 s after the last, round the knight.

    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "slamfilm" shots/eye_slam.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "sweepfilm" shots/eye_sweep.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "burstfilm" shots/eye_burst.gif 6

`tests/drowned_eye.test.ts` now 14: his look (8, as above) and THE REVIEW of his stands and tentacle moves: every frame
of his stands and every third of his moves (aimed four ways), from in front and from behind, and of the burst, crisp,
nothing cyan, every light the enemy's fire, nothing cut off; ALIVE, his stands never still, each round closing; JERK,
his arms' tips under 25 picture pixels a frame standing, under 60 in his moves but for the blow itself (under 200, the
fall and the whip, as fast as they will go), his eye and bulk under 6 a frame always; JUMP, a move begun at any moment of
his stand starts from it and hands back to it; THE WARNING, each held (the slam's arm trembling under 18 a frame, the
sweep's under 20), the slam's arm burning, the burst's cracks glowing with no arm yet; THE BLOWS LAND, the slam lying
along its aim. NOT IN THE REVIEW YET: nothing of him passing through his own body (his arms are many and wild; to come
with the rest of his moves).

Shown `shots/eye_slam.gif`, `shots/eye_sweep.gif` and `shots/eye_burst.gif`, asked in one pop-up "His slam: right?",
"His sweep: right?", "His bursts from glowing cracks: right?" (each offered: "Yes, as shown (Recommended)"; "Bigger and
wilder"; "Not yet"), his answers, 15 Oct, by 17:53 (the clock read 17:53:13 just after): each "Yes, as shown
(Recommended)".

### His spells (`eyePainted('gaze' | 'gazeBack' | 'call' | 'spit', t, view, aim, clock)`; `boltPainted`, `bilePainted`)

His picks: "His gaze: a gold beam sweeping the arena (Recommended)", "The siege's pink bolts raining down
(Recommended)", "Bile spat in arcs, leaving pools (Recommended)". As made (src/art/drowned_eye.ts at c1179b3):

- HIS GAZE (EYE_GAZE, 3.4 s; `gaze` sweeps toward his left, `gazeBack` toward his right): he rears, the arms by where
  it will start swung aside, his eye narrowing, sparks streaming into his slit, a dashed line of his light flickering on
  the stones where it will start, pink brightening to gold (THE WARNING), 0 to 1.0 s; it bursts on at 1.05 s with a
  flash at his eye: a fan of gold light from his eye down to a line on the floor from the pool's rim to the ring's edge,
  its heart a thick shaft of white gold, rays running outward, a star of light at his eye, the line burning, flames
  licking up off it, a flare at its far end, sparks and steam; it sweeps 120 degrees centred on its aim, 1.05 to
  2.45 s (`gazeAngle(t, aim, back)` says where it lies); the stones it passes glow, smoulder and are left scorched; it
  dies by 2.62 s; he blinks hard; the stones clean by 3.4 s.
- HIS CALL (EYE_CALL, 2.4 s): he rears, his arms lifted high and writhing, his eye rolled up to the dome, his veins
  catching the siege's fire, its sparks streaming up off him, 0 to 0.6 s; held to 1.8 s; he sinks back by 2.4 s.
- THE SIEGE'S BOLTS (EYE_BOLT, 1.9 s each, on their own BOLT_CANVAS 260 by 480, the middle on the floor at (130, 400),
  for the game to lay while he calls): a circle of the siege's runes opens where it will fall, an outer ring dashed and
  turning, an inner ring turning the other way, filling from its middle, pink brightening to gold, a tear opening in
  the dome high above (THE WARNING), 0 to 1.0 s; THE BOLT at 1.0 s, pink lightning re-forking every frame, a blast of
  fire 1.3 of its reach out, sparks and stones flung; the stones scorched and smouldering; clean by 1.9 s. It hurts
  within EYE_BOLT.reach, 0.9 tiles. The film lays six round the ring, one where the knight stands.
- HIS BILE (EYE_SPIT, 2.6 s): he rears back, his eye splitting open into his maw, bile drooling off its lips (THE
  WARNING), 0 to 0.7 s; three lurches forward, a glob spat from his maw at 0.85, 1.12 and 1.39 s, each flying 0.8 s
  high over the ring, a ring of the bile's colour on the stones where it will land, its shadow growing and darkening in
  it; each splashes down; his maw closes 1.6 to 2.2 s. Where each lands: `bileLanding(aim, i)`.
- HIS BILE'S POOLS (EYE_BILE, 6.0 s each, on their own BILE_CANVAS 260 by 190, the middle on the floor at (130, 120)):
  splashing out by 0.25 s, a ragged pool a tile across from its middle, blotched, bubbling and steaming, dull (no light);
  drying 5.0 to 6.0 s; gone by its end. It hurts within EYE_BILE.reach, 1.0 tile, from 0.25 s till 5.0 s.

    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "gazefilm" shots/eye_gaze.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "callfilm" shots/eye_bolts.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "spitfilm" shots/eye_spit.gif 6

`tests/drowned_eye.test.ts` now 21: THE REVIEW takes in his gaze both ways, his call, his spit (every third frame,
aimed four ways, from in front and behind), every other frame of a bolt and of a pool; then HIS GAZE (never leaping;
from his stand and back, the stones clean), HIS GAZE'S WARNING (its line burning where it will start, wherever he does
not hide it, before it burns; then burning on its aim halfway), HIS CALL (from his stand and back; his veins burning),
THE SIEGE'S BOLTS (runes, no bolt yet; the bolt; clean by the end; the runes as wide as where it hurts), HIS BILE (from
his stand and back; the ring round each landing before it lands), HIS BILE'S POOLS (no light; as wide as where they
hurt; gone by their end), and NOTHING THROUGH HIS EYE (his rulebook, How art 7): no arm goes into the face of his eye in
any move (it found his arms reaching back over his eye in the gaze and the call, and curling into it in the spit;
fixed before he saw them).

Shown `shots/eye_gaze.gif`, `shots/eye_bolts.gif` and `shots/eye_spit.gif`, asked in one pop-up "His gaze
(eye_gaze.gif): good?", "The siege's bolts (eye_bolts.gif): good?", "His bile (eye_spit.gif): good?" (each offered:
"Yes, as shown (Recommended)"; "Bigger and wilder"; "Not yet"), his answers, 15 Oct, by 19:43 (the clock read 19:43:31
just after): each "Yes, as shown (Recommended)".

### His maw moves (`eyePainted('bite' | 'spew' | 'splash', t, view, aim, clock)`; `spawnPainted`)

His picks: "Breathes in, pulling you close, then bites (Recommended)", "Spews eyespawn out of the muck (Recommended)", and
in his own words, "I like the water idea for the roar, but instead it picks its bulk up and splashes down". As made
(src/art/drowned_eye.ts at 15b6845). New for these: HIS FACE TURNS ON HIS PREY (EyePose.turn, degrees round toward his
left), his face, eye, rim, hood and horns turning with it; his arms stay where they rise from the pool.

- HIS BREATH AND BITE (EYE_BITE, 3.3 s): his face turns on you as his eye tears open into his maw, wide, by 0.45 s; HE
  BREATHES IN, rearing back and swelling, 0.45 to 1.95 s: water, stones and weed and the air itself streaming across
  the ring and into his maw in streaks, faster as they near it, water torn up off the pool's face (THE WARNING, and the
  pull: the game draws you in); he lunges at you along the aim, 58 of his lengths, 1.95 to 2.1 s; THE BITE at 2.1 s, his
  maw slammed shut, spray and spittle flung, held to 2.22 s; he draws back and turns back by 3.1 s.
- HIS EYESPAWN (EYE_SPEW, 3.0 s): his face turns on you; he heaves and retches, his maw tearing half open, the fen's
  muck welling up and bubbling at its lips, drooling off them (THE WARNING), 0 to 0.85 s; he spews a torrent of it out
  across the ring before him, 0.9 to 1.5 s, reaching further as he heaves, splashing where it comes down; three eggs
  tumble out in it at 0.98, 1.16 and 1.34 s, each flung 0.6 s in a high arc to land at `spawnLanding(aim, i)` on the
  ring; his maw shuts 1.65 to 2.3 s, his face turning back by about 2.85 s.
- HIS EYESPAWN'S EGGS, LANDED (EYE_SPAWN, 3.0 s each, on their own SPAWN_CANVAS 180 by 150, the middle on the floor at
  (90, 110)): it thuds into a splat of muck, squashing and bouncing; it sits rocking, the eye in it darting about; from
  2.0 s it shakes hard and bulges (THE WARNING: about to hatch); IT HATCHES at 2.5 s (the game brings out the eyespawn
  there), its shell flung, its slime splashing; the torn shell sinks and the muck goes by 3.0 s. Dull: no light.
- HIS SPLASH (EYE_SPLASH, 3.6 s): he sinks, gathering, to 0.25 s; HE HEAVES HIS WHOLE BULK UP out of the pool, 125 of
  his lengths, by 1.0 s, water pouring off him in sheets, his arms flung out and hanging, writhing; hangs there
  trembling (THE WARNING), 1.0 to 1.4 s; crashes down, 1.4 to 1.62 s; THE CRASH at 1.62 s, a crown of water bursting up
  round him, rings on the pool; THE WAVE rolls from the pool's rim across the ring to its edge, 1.62 to 2.55 s, a foaming
  wall of water about 34 of his lengths high, lower as it spreads, the water washing over the stones behind it (to
  jump or dash through: `waveAt(t)` says how far across it is); he bobs and settles by 3.6 s.

EYE_CANVAS is now 860 by 790, the pool's middle at the water at (430, 500): his arms, flung out as he heaves himself up,
reached past the old 760.

    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "bitefilm" shots/eye_bite.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "spewfilm" shots/eye_spew.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "splashfilm" shots/eye_splash.gif 6

`tests/drowned_eye.test.ts` now 25: THE REVIEW takes in the bite, the spew and the splash (every third frame, aimed four
ways, in front and behind) and every other frame of a landed egg; NOTHING THROUGH HIS EYE takes them in, his face
turned; HIS BREATH AND BITE (from his stand and back; never leaping but for the lunge itself; his face on you; lunging
along the aim; the draught streaming in while he breathes, none once he has bitten); HIS EYESPAWN (from his stand and
back, never leaping; his face on you; the torrent; each egg in the air and landing on the ring); HIS EYESPAWN'S EGGS (no
light; shaking harder before they hatch; clean by the end); HIS SPLASH (from his stand and back; still before he heaves,
held at the top, settling after; the heave and the crash his blow, as fast as they go; the wave from the rim to the edge,
painted where it says it is).

Shown `shots/eye_bite.gif`, `shots/eye_spew.gif` and `shots/eye_splash.gif`, asked in one pop-up "His breath and bite
(eye_bite.gif): good?", "His eyespawn (eye_spew.gif): good?", "His splash (eye_splash.gif): good?" (each offered: "Yes,
as shown (Recommended)"; "Bigger and wilder"; "Not yet"), his answers, 15 Oct, by 20:22 (the clock read 20:22:13 just
after): each "Yes, as shown (Recommended)".

### The ring wider again, on his word

His words, 15 Oct, 20:23: "Can the ring be wider?  I think the inner circle is a good size but it just needs to be wider
for more movement". Read as (told him so): his pool stays as it is; the paved ring round it gets wider. EYE_RING now
8.0 by 7.0 tiles from the pool's middle to its edge (was 6.0 by 5.2): about five tiles of paving round the pool (was
three). What reaches the ring's edge reaches the new one: his gaze, the landing of his bile and his eggs, the draught of
his breath, the wave (EYE_SPLASH.wave now 1.62 to 2.85 s, to roll the further way at about the same speed). His slam
and sweep keep their reach (about 6.4 and 6.2 tiles), so the outer stones are beyond them. Shown `ring_compare` (his
stand on the old ring above, on the new below), asked "The wider ring (bottom of ring_compare.png): right?" (offered:
"Yes, this wide (Recommended)"; "Wider still"; "A little less"), his answer, 15 Oct, by 20:25 (the clock read 20:25:12
just after): "Yes, this wide (Recommended)". The boss review, 25 of 25, on the wider ring.

### His phases, struck and death (`eyePainted('surface' | 'empower' | 'struck' | 'struckUnder' | 'death', t, view, aim, clock, phase3)`)

His picks: "Three, as your plan has, each harder (Recommended)"; when he surfaces, "The eye splits open into a maw"; in
phase 3, "The obelisks' pink lines bend into it; its veins blaze (Recommended)"; his death, "It sinks, its eye going
dark, as the dome shatters (Recommended)". As made (src/art/drowned_eye.ts at 2d87693):

- HE SURFACES (EYE_SURFACE, 4.2 s; phase 1 to 2, from his lurk to his stand): the pool boils, rings and bubbles all
  over it, spurts of water thrown up, his eye blazing brighter up through it, his arms drawn down under (THE WARNING),
  0 to 1.3 s; HE RISES out of it, 1.3 to 2.05 s, a crown of water bursting up, water pouring off him, his seven arms
  growing up out of the deep round him; his eye tears open into his maw and he roars, his arms flung high, 2.15 to
  3.45 s; it heals shut and he stands risen.
- THE SIEGE PULLED IN (EYE_EMPOWER, 4.0 s; phase 2 to 3, from his stand to his blazing stand): he rears and lifts his
  arms, his eye rolled up; from the top of each of the cult's three obelisks (EYE_OBELISKS: behind him, and to either
  side before him, just beyond the ring's edge; `obeliskTop(i)`) a line of the siege's pink fire reaches out over the
  ring and bends down into him, 0.6 to 1.5 s, crackling, pulses of gold running along it into him; his veins catch and
  blaze, 1.2 to 2.9 s; a burst of its fire off him at 2.95 s; he stands blazing. PHASE 3 is every move of his with
  `phase3` = 1: his veins blazing, the obelisks' lines bent into him, hidden where he is nearer.
- STRUCK (EYE_STRUCK, 0.6 s): risen, his eye flinching shut, his bulk recoiling from the blow (from `aim`), his arms
  jerked out and back, spray flung; under the water (`struckUnder`), his glow guttering, rings bursting. From his stand
  (or lurk) and back to it.
- HIS DEATH (EYE_DEATH, 5.4 s): struck, held; he convulses, his eye tearing open into his maw in a last roar, his arms
  thrashing, 0.25 to 1.5 s; cracks of the siege's fire run across the dome high above, 0.9 to 1.5 s; IT SHATTERS at
  1.5 s, a flash, its shards of pink fire falling over the ring and going out; the obelisks' lines snap; his arms go
  limp and slap down, 1.6 to 2.5 s; his eye's fire goes out, its heart last, 1.8 to 3.4 s; he sinks, rolling his eye
  up, his arms drawn down with him, 2.2 to 4.4 s; bubbles and rings until the pool is still; nothing of him left by 5.4 s.

    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "surfacefilm" shots/eye_surface.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "empowerfilm" shots/eye_empower.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "struckfilm" shots/eye_struck.gif 6
    node tools/page_gif.mjs src/dev/preview_drowned_eye.ts "deathfilm" shots/eye_death.gif 6

(The films with the obelisks draw floor 10's obelisk piece where EYE_OBELISKS has them.)

`tests/drowned_eye.test.ts` now 29: THE REVIEW takes in all of these (every third frame, aimed four ways, in front and
behind) and his stand and death in phase 3; NOTHING THROUGH HIS EYE takes them in (it found his arms going into his eye
as they came up out of the deep, as he called the siege, when struck and as he sank; fixed before he saw them); HE
SURFACES (from his lurk to his stand, pixel for pixel; boiling first; his maw open as he roars); HE PULLS THE SIEGE IN
(from his stand to his blazing stand; the lines reaching him; his veins catching; phase 3 burning more fire than phase
2); STRUCK (from his stand and lurk and back; his eye shut); HIS DEATH (from his blazing stand; the dome cracking, its
shards falling and gone; the lines snapped; his eye dark; nothing of him and no light left).

Shown `shots/eye_surface.gif`, `shots/eye_empower.gif`, `shots/eye_struck.gif` and `shots/eye_death.gif`, asked in one
pop-up "His surfacing (eye_surface.gif): good?", "The siege pulled into him, phase 3 (eye_empower.gif): good?",
"Struck, and his death (eye_struck.gif, eye_death.gif): good?" (each offered: "Yes, as shown (Recommended)"; "Bigger and
wilder"; "Not yet"), his answers, 15 Oct, by 21:41 (the clock read 21:41:12 just after): each "Yes, as shown
(Recommended)". ALL OF THE DROWNED EYE NOW HAS HIS YES.

## The Drowned, floor 10's small mob (src/art/drowned.ts, behind DROWNED_ON, off)

His brief, two pop-ups, 15 Oct, by 22:15 (the clock read 22:15:44 just after): "Drowned cultists in rotting robes"
(not the recommended pick); "The knight's height, hunched (Recommended)"; "Rising out of the water, then shambling
(Recommended)"; "Eyes glowing the Eye's gold (Recommended)"; its one attack, "A drowning grab: clutch, then drag down
(Recommended)"; how it dies, "Collapses into water and weed (Recommended)"; "Not a cartoon zombie (Recommended)"; its
sound, "Gurgling moans, wet footsteps (Recommended)".

### Its look

Of the cult's flock (art/act1_cultists.ts), drowned: the cult's violet robe gone sodden and dark, torn to rags and
slimed with the fen's mud at its hem; the stole's pink gone dull; weed draped over its shoulders and caught on its cowl,
hanging from its sleeves; swollen grey-green hands, the fingers hooked; in the cowl's dark a slack drowned face and two
eyes burning the Eye's gold (their light gold). Water runs off it, drips splashing round its feet. Its stand (2.6 s):
heaving wet breaths, swaying, its arms swinging, its head lolling and once jerking up and round as at a sound.

    node tools/preview.mjs src/dev/preview_drowned.ts shots/drowned_look.png 1014 640 look
    node tools/page_gif.mjs src/dev/preview_drowned.ts "standfilm" shots/drowned_stand.gif 6

`tests/drowned.test.ts` 6: the switch off and nothing of the game importing it; crisp, its pink edge; nothing cyan, every
light the enemy's fire; nothing cut off; the knight's height (0.85 to 1.15 of him); its eyes gold, their light gold.

Shown `shots/drowned_look.png` and `shots/drowned_stand.gif`, asked "Is this the Drowned?" (offered: "Yes, animate it
(Recommended)"; "More drowned, more gruesome"; "Not yet"), his answer, 15 Oct, by 22:46 (the clock read 22:46:58 just
after): "Yes, animate it (Recommended)".

NEXT: its moves (rising out of the water, its shamble, the drowning grab, struck, collapsing into water and weed), then
the Bog Leeches (tiny) and the Eyespawn (medium; they hatch from his eggs).
