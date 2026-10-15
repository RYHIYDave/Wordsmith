# Floor 9, the Pinewood: the art chat's mock-ups (branch `mockup/act1-pinewood`)

His word, 15 Oct, by 10:28, to "Floor 8 is done. On to floor 9, the Pinewood?": "Yes, floor 9 go (Recommended)",
offered as: in the same order as before: its ground, its pieces, the Hollow Stag, then the Twisted Deer and Fog
Wolves, each shown to you first. This branch starts from `mockup/act1-canyon` at 5a7122a (floor 8, all of it with
his yes). Nothing here is in the game.

## Its ground (src/art/pinewood.ts, painted by src/art/terrain.ts; HIS YES)

The measure is the planning chat's Pinewood he said yes to (13 Oct, by 08:23, "Yes, this is it (Recommended)";
src/dev/preview_act1.ts, hash `pine`, on `mockup/act1-levels`), and his words: 13 Oct, 08:19, "I’d like the forest
to be very open.  Really big open areas that cross the river on little bridges"; 12 Oct, 18:56, "The forest and the
swamp don’t really have walls".

- THE MEADOWS (the walkable floor): grass in slow patches of tone, its blades lit at their tips with their shade
  under them, tufts of three to five blades; wildflowers (cream, dull gold, dull lilac) scattered, thick in drifts;
  bare earth worn through; the trails of packed earth with pebbles and a few blades through; toward the wood's edge
  the grass darker in its shade, strewn with fallen needles and cones.
- NO WALLS (his word): the forest floor goes on at the meadow's height (`rise` 0): a litter of brown needles lying
  flat, moss in patches, ferns, fallen twigs; darker the further under the trees; at the wood's edge a ragged fringe
  of long grass and ferns. The dark patches in the meadow, and the band along its far edge, are the forest floor
  where the groves and the wood stand: the trees come with the pieces.
- THE RIVER, out of the canyon: dark slate water (its hue clear of cyan), deepest along its middle, ripples streaming
  along its flow, glints, a line of light where it meets its banks; banks of wet mud with river stones; lush grass
  and reeds by the water. Under a footbridge (walkable tiles) the water runs on under where the bridge will be.
- THE SWAMP'S SICKNESS, creeping in from the east: the grass drained grey, veins of dull violet through the ground.

FOR THE MAIN CHAT: `pinewoodLook({ river, trail, sick })` makes the look for a level from what only the level knows,
each optional: how far a place is from its river's middle (tiles; the water `RIVER_HALF` 0.55 either side, its bank
0.2 more), from its nearest trail's middle, and how sick its ground is (0 to 1, toward the swamp). Give them cheap
(the dev page holds them as grids, eight cells to a tile: a 256 by 256 piece then costs 38 to 106 ms, under the
canyon's 66 to 142; computed afresh from curves each pixel it cost 434 to 686). The dev page lays the tiles by hand
in the mock-up's shape (`PINE_SHAPE`); how the real Pinewood is laid is the main chat's.

    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_ground.png 1014 468 shot
    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_close.png 1014 936 close
    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_tiles.png 1014 468 tiles
    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_cost.png 1014 200 cost

`tests/pinewood.test.ts` (8): nothing of the game imports it; every walkable tile's middle floor and no other's; no
walls (only floor and the forest floor painted, a pixel floor exactly where the ground is); the water where the
level puts it, under the bridge too; two pieces one picture, the same every time; opaque; no cyan, no pink, every
colour duller than the dullest word's (Colour 3 and 4); every blade and tuft lit at its top, its shade under it.

Shown `shots/pine_ground.png` and `shots/pine_close.png` and asked "Is this the Pinewood's ground?" (offered: "Yes, on
to its pieces (Recommended)", next: the pines, groves, footbridges, the hunter's cabin, the cult's camp, twisted trees
toward the swamp; "Not yet"), his answer, 15 Oct, by 11:04 (the clock read 11:04:15 just after): "Yes, on to its
pieces (Recommended)".

NEXT: its pieces (25, his rule of 10 Oct: “Going forward, let's do 25 that are the theme of the 5 levels, then 25
for each boss.”), themed after the Pinewood and the Hollow Stag.

## Its 25 pieces (src/art/floor9.ts, `pinewoodPieces()`; HIS YES)

The first 13, the wood's own, shown as `shots/pine_pieces.png` and asked "Are these the Pinewood's own pieces?"
(offered: "Yes, on to the rest (Recommended)"; "Not yet"), his answer, 15 Oct, by 11:13 (the clock read 11:13:17
just after): "Yes, on to the rest (Recommended)".

- THE WOOD'S OWN (13): old pine (3 sizes; flat-painted as floor 6's are, a trunk of red-brown plated bark, a crown
  in lopsided tiers lit at their upper left, a spire), young pine (2), pine snag (dead, grey, broken top, woodpecker
  holes), fallen pine (a trunk torn up by its roots, moss along it, its broken end splintered), stump (the hunter's,
  its rings, the axe's last step), mossy boulder (2), ferns (2), bilberries (blue-black, never red), toadstools (a
  ring, pale caps, never the fly agaric's red), a stag's skull and antlers, twisted pine (2; toward the swamp, bent,
  dead bark, drooping tufts, the sickness's dull violet in them), cattails, river stones. The tall ones (pines, snag,
  twisted pines) are seen through while someone stands behind them.
- THE HUNTER'S (6): the footbridge (a floor tile, along x and along y: planks nailed across two logs; the water runs
  on under it, painted by the ground), the hunter's cabin (round logs, a mossy shingle roof, a stone chimney, its door
  ajar, antlers over it, a bench), his woodpile and chopping block (a breakable: stacked, then knocked about), his
  drying rack (hides stretched on poles), his snare (THE TRAP: 4 frames, hidden under needles, its jaws seen, it
  springs, shut), his journal (THE QUEST PIECE: open in the grass, a stag drawn on its leaf).
- THE CULT'S CAMP IN THE WOOD (5): the cult's siege tent (a great violet bell tent, the mark on it), siege ladders
  (made from the wood's pines, on trestles, one half finished), a battering ram, half built (a pine trunk slung in a
  wheeled frame, its head iron-bound, the cult's violet on it), barrels of pitch (a breakable), felled pines, stacked.
  Read as, not asked: the siege of the town is fed from this wood; the cult fells its pines for ladders and a ram.
- THE STAG'S (1): the Stag's shrine: a post of dead pine, a stag's antlers lashed to its top with the cult's violet,
  the mark daubed on it, a ring of stones, bones, the sickness in the grass round it.

The cult's fire (art/act1_cult.ts `pinkBrazier`) and banner (`cultBanner`) are the cult's own, as on every floor.

    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_pieces.png 1014 2610 pieces
    node tools/preview.mjs src/dev/preview_pinewood.ts shots/pine_dressed.png 1014 468 dressed

`tests/floor9.test.ts` (7): nothing of the game imports them; each has pictures and its own name, none gives light;
crisp, no loose pixels; no cyan, no pink or red, duller than every word; what stands stands on its foot, a floor
tile's and the trap's inside the diamond; nothing cut off; 25 of them.

All 25, with the screen dressed with them (`shots/pine_dressed.png`, `shots/pine_pieces.png`), asked "Are these the rest
of the Pinewood's pieces?" (offered: "Yes, on to the Hollow Stag (Recommended)", next the boss's brief as a few quick
questions, then his look; "Not yet"), his answer, 15 Oct, by 11:24 (the clock read 11:24:10 just after): "Yes, on to
the Hollow Stag (Recommended)".

## The Hollow Stag, floor 9's boss

His design doc ("Wordsmith Act 1: The Descent (Levels 6–10)", the planning chat's, with his yes of 12 Oct, 18:07):
"A great stag hollowed out by the swamp's influence, with a blinking eye visible through its ribs. It foreshadows
the Drowned Eye." Its floor is the Hollow Wood. "Moves: an antler gore (its basic attack); a charge that splinters
trees; lines of roots bursting toward you; a bellow that wolves answer from the fog."

His brief, asked as his art rulebook's questions in two pop-ups, his picks as he tapped them, 15 Oct, the first
four by 11:26, the rest by 11:47:
- HOW BIG: "Huge: elk-sized, antlers towering (Recommended)", offered as: shoulder above the knight's head, antlers
  spreading wide over him.
- THE ONE THING TO KNOW IT BY: "The eye blinking in its open ribs (Recommended)", offered as: its chest hollowed,
  ribs bare, a great gold eye inside that blinks and looks at you, like the Drowned Eye to come.
- HOW HOLLOWED: "Half rotted: hide hanging, bone and roots showing (Recommended)", offered as: a dark hide in
  tatters over bone, roots knotted through where flesh was.
- HOW IT MOVES: "Restless, stamping, snorting", offered as: always shifting, pawing the ground. Not the recommended
  pick; his pick stands.
- HOW IT DIES: "Roots drag it down into the ground", offered as: the swamp takes it back: roots pull it under. Not the
  recommended pick; his pick stands.
- ITS EYE: "Gold, like the Drowned Eye's (Recommended)", offered as: a pale veined eyeball, its iris burning gold, a
  slit pupil: a small copy of the boss to come.
- WHAT IT MUST NOT LOOK LIKE: "Not a gory zombie", offered as: rotted, but no blood and guts. Not the recommended
  pick; his pick stands.
- ITS SOUND (sound rule 7): "A deep bellow, creaking wood, a wet blink (Recommended)", offered as: its bellow echoing
  through the trees, its bones and roots creaking, a soft wet sound when the eye blinks.

READ AS, NOT ASKED (the pictures will show whether it is right): an enemy, so its eye burns gold (his pick; pink and
gold glows are the enemy's) and its edge is pink while it lives, nothing cyan; rotted but clean: dark hide, pale
bone, roots and moss, never red flesh or blood; its stand restless (shifting its weight, tossing its head, pawing
and stamping a forefoot, snorting a breath of fog), its moves still to come: the antler gore, the charge that
splinters trees, the roots bursting toward you, the bellow the wolves answer.

NEXT: its standing sheet beside the knight, front and back, for his yes; then its moves.

## The Hollow Stag's look (src/art/hollow_stag.ts, behind `STAG_ON`, off; HIS YES)

Painted from its own solids, as the canyon scorpion is, in the same painter (four legs and antlers have no place on
the heroes' bones).
- HUGE, ELK-SIZED, ANTLERS TOWERING: its withers 68.6 up (the knight is 58), its antlers' tips 145.5 up, two and a
  half times his height, spreading 93 across; long legs, the elbow bent back and the stifle forward, as a deer's.
- THE EYE IN ITS OPEN RIBS: its ribs bare under its torn hide, three snapped on each side to open a window; in the
  dark of its hollow, behind the window of the side you see, a great eye in a nest of roots: pale, veined, its iris
  the enemy's pink burning to gold, a black slit pupil; it looks at you. (From in front you look in through its right
  side and from behind through its left, along your line of sight, so the two windows are not opposite each other.)
  Its light gold.
- HALF ROTTED, NOT A GORY ZOMBIE: a dark hide in tatters, torn along its back to the bare knobs of its spine; its
  shoulder blades and hip bones worn through to bone; a hole in its haunch, roots in the dark there; its left forearm
  bare bone with a root wound round it; tatters of hide and roots hanging from it; the skull of its face bare, dark
  sockets; moss on its back and hanging from its antlers; the swamp's dark violet roots through it. No red flesh, no
  blood. Its pink edge while it lives; nothing cyan.
- ITS STAND, RESTLESS (his pick; a 2.4 s loop, fifteen frames a second): its weight shifting side to side, its ribs
  heaving as it breathes; it tosses its head, 0.24 to 0.92 s; it lifts its right forefoot and strikes it down on the
  spot it left, twice (stamps at 1.22 and 1.54 s, clods flying, its body jolted); it lowers its head and snorts a
  breath of fog at 1.84 s; its tail flicks; its eye glances off and back, and blinks, 2.04 to 2.24 s; what hangs from
  it swings with its moving.

    node tools/preview.mjs src/dev/preview_hollow_stag.ts shots/stag_look.png 1014 820 look
    node tools/page_gif.mjs src/dev/preview_hollow_stag.ts "standfilm" shots/stag_stand.gif 6

THE REVIEW, AS A BOSS (How art is made 7): art/boss_checks.ts is made for figures on the heroes' bones, so its rules
are written out for the Stag in `tests/hollow_stag.test.ts` (11), every frame of its stand from in front and from
behind: the switch off and nothing of the game imports it; crisp, its pink edge; nothing cyan, every light the enemy's
fire, nothing cut off; its size; FLOOR, nothing below the floor; SLIDE, its hoofs stay where they stand, the pawing
foot down only on its own spot; THROUGH, no leg through another; JERK, nothing leaps (its striking hoof at most 10 a
thirtieth of a second, its antlers' far tips at most 9, the rest of it 3) and its loop closes; ALIVE, never still,
its ribs heaving, its hips swaying, its tatters swinging; its eye seen from either side, looking at you, and its
blink; what it throws off gone before its loop comes round.

| His rule | How the Stag keeps it |
| --- | --- |
| Pillars 3, Movement 1: weight | its stamps jolt its whole body down; its head drops before it snorts |
| Pillars 4, Monsters 6: enemy pink, gold | its eye pink burning to gold, its light gold; its pink edge; nothing cyan |
| Pixels 1, 4, 5 | crisp; lit from the upper left; ink seams, no black outline |
| Colour 5: neon on dark | a dark beast, its gold eye the brightest thing on it; never mud-brown all over: bone, moss, roots, gold |
| Monsters 1: true to what it is | a deer's legs: the elbow back, the stifle forward; hoofs; a deer's skull |
| Monsters 3: big ones menacing | half again the knight's height at the shoulder, antlers two and a half |
| Movement 4: loose things follow | its mane, tatters, roots and moss swing with its moving |
| Movement 6: alive when still | restless, his pick: breathing, shifting, tossing, pawing, snorting, blinking |
| Movement 8: feet grip | a hoof down stays put; the pawing hoof comes down on its own spot |
| Hits 2, his word: no gore | rotted but clean: no red flesh, no blood |
| Animations 4: warnings in sight | (for its moves, to come) |
| How art is made 7: every boss through every check | the review above, every frame, both sides |

Shown `shots/stag_look.png` and `shots/stag_stand.gif` and asked "Is this the Hollow Stag?" (offered: "Yes, animate
it (Recommended)", its look in the plan as shown, next its moves: the antler gore, the charge, the roots, the bellow,
its flinch and its death; "Not yet"), his answer, 15 Oct, by 12:13 (the clock read 12:13:56 just after): "Yes,
animate it (Recommended)".

NEXT: its moves, filmed, for his yes.

## The Hollow Stag's moves (src/art/hollow_stag.ts; FOR HIS YES; behind `STAG_ON`, off)

His design doc's four (an antler gore, its basic attack; a charge that splinters trees; lines of roots bursting toward
you; a bellow that wolves answer from the fog), its walk, struck, and the death he picked. Times in seconds from each
move's start.
- WALK (0.875 s round, 16 frames a second, painted for STAG_PACE 0.8 tiles a second): slow and heavy, a four-beat
  stalk, its hoofs down at 0.11 (right hind), 0.33 (right fore), 0.55 (left hind) and 0.77 s (left fore); its head
  nodding, its weight rolling; its eye on you. Its round begins where its hoofs are nearest where they stand, so it
  steps off its stand without a leap.
- ANTLER GORE, its basic blow (1.7 s): its head down low, its antlers aimed forward at a man's height, 0 to 0.38 s;
  HELD, TREMBLING, a huff of breath at 0.48 s (THE WARNING), to 0.6 s; driven in lower, its brow tines raking the
  earth (clods thrown forward from 0.7 s); hooked up through you, THE GORE at 0.9 s, held a tenth to 1.0 s, a pale
  arc trailing its antlers' tips; flung on up to 1.32 s, its forefeet lifted off the floor by the force (1.0 to
  1.44 s), moss torn off its antlers; settled by 1.7 s. Its antlers sweep through STAG_GORE.reach, 66 of its own
  lengths (about 1.7 tiles) before its feet.
- CHARGE THAT SPLINTERS TREES (2.7 s): its head down, antlers forward, crouched, by 0.3 s; it paws (stamps at 0.5
  and 0.68 s) and snorts (0.6 s) (THE WARNING); THE RUN from 0.84 to 1.74 s, a gallop, the game carrying it at
  STAG_CHARGE.pace, 6 tiles a second (5.4 tiles in all), its hind pair and fore pair landing by turns, earth kicked up
  behind it; THE CRASH at 1.74 s, its forefeet braced, held to 1.86 s; splinters of pine, bark and needles burst from
  before its antlers and fly to 2.66 s, a ring of dust round its forefeet; its head jolted up, then shaken (2.14 to
  2.54 s), splinters shaken off; it steps back onto its stand by 2.7 s. In the film it runs into a pine, which is a
  stump after the crash (the pine's breaking is the game's).
- LINES OF ROOTS (2.6 s): it gathers itself, 0 to 0.2 s; REARS UP on its hind legs, forefeet off the floor, by 0.55 s;
  HELD UP HIGH, its forelegs pawing the air (THE WARNING), to 0.8 s; comes down, THE SLAM at 1.0 s, its forefeet on
  the spots they left, held to 1.1 s, the earth bursting under them, a ring of dust; it glares after the roots,
  heaving, to 1.8 s; settled by 2.6 s. THE ROOTS: lines of bursts out from it toward you, `rootBurstPainted(t, view,
  seed)`, each a crack in the earth glowing pink burning to gold for 0.25 s before it (ITS WARNING), roots shooting up
  in 0.1 s, writhing to 0.45 s, sinking back by 0.8 s; a burst d tiles out comes at `stagRootTime(d)`, 1.1 s + d / 7
  (the film: three lines in a fan, a burst every 0.6 tiles from 1.2 to 6 tiles).
- BELLOW (2.6 s): it draws in its breath, its ribs swelling, to 0.4 s; throws its head up, its jaw opening, to
  0.69 s, held trembling to 0.75 s (THE WARNING); THE BELLOW from 0.75 to 1.75 s, its jaw wide, its whole body
  shaking, its eye blazing, rings of fog rolling from its mouth at 0.75, 1.0, 1.25 and 1.5 s, fog pouring out over the
  ground round it from 0.85 s; its jaw shuts and its head lowers, 1.75 to 1.98 s; the fog thinning, gone by 2.56 s;
  settled by 2.6 s. The wolves that answer from the fog are the game's.
- STRUCK (0.6 s): held to 0.06 s; its head thrown back, rocked back and up, its eye flinching shut (to about
  0.4 s), bone, moss and dark hide flying off it; back on its stand by 0.6 s.
- DEATH (3.2 s; his pick, "Roots drag it down into the ground"): held to 0.12 s; it throws up its head, jaw open,
  to 0.42 s; roots burst up out of the earth round its legs from 0.2 s and climb them; DRAGGED DOWN from 0.55 s, a
  sudden drop, then steadily, its legs folding, roots arching over its back, the earth heaving round it; it thrashes
  its head, 1.1 to 1.6 s; its eye shuts, 2.0 to 2.22 s, and is out by 2.3 s; under by 2.6 s, only its antlers standing
  up out of the heaved earth, roots coiled over it; still from 2.75 s. THE FLOOR SWALLOWS IT: nothing of it below the
  floor is painted (the painter takes it away pixel by pixel).

    node tools/page_gif.mjs src/dev/preview_hollow_stag.ts "walkfilm" shots/stag_walk.gif 8
    (and gorefilm, chargefilm, rootsfilm, bellowfilm, deathfilm)

FOR THE GAME, LATER: its canvas STAG_CANVAS 420 by 400, its feet at (190, 312) (was 300 by 300, feet at (140, 232):
its rearing antlers and the charge's splinters); makeStagArt(): stand 36 frames at 15 a second, walk 14 at 16, attack
= the gore (hit 0.9 s, a tenth's freeze), reel 0.6 s, dying 3.2 s, and in `clips.moves`: charge (hit = the crash,
1.74 s; the game carries it from 0.84 s to 1.74 s), roots (hit = the slam, 1.0 s), bellow (hit = the bellow's start,
0.75 s). The root bursts are a painter of their own (ROOT_CANVAS 140 by 130, feet at (70, 98)), laid by the game along
its lines.

THE REVIEW, AS A BOSS, for every move (tests/hollow_stag.test.ts, 22): crisp, its pink edge while it lives and none
as it dies; nothing cyan, every light the enemy's fire; nothing cut off; FLOOR (nothing below the floor, its death
aside, where the floor swallows it); SLIDE (walking and running, a hoof down stays on its spot as the floor goes by
at its pace; in every other move a hoof down stays put; every move ends with its hoofs on their spots); THROUGH (no leg
through another); JERK (by move, legs, head and antlers, the rest; its blows quick, on one continuous arc); JUMP (from
any frame of its stand into each move and back, into its walk and out: the mean of its points at most 3 game pixels;
worst 2.95, its stand into its walk); BLOW (each warning a pose, held; the gore, the crash and the slam each held a
tenth; follow-throughs); struck; its death (roots up round it, dragged under, nothing of it seen below the floor, its
eye out, its antlers left standing); what it throws off gone by each move's end; the root bursts (their crack before
them, crisp, their pink edge, nothing cut off, gone after); its pictures as the game holds them.

| His rule | How its moves keep it |
| --- | --- |
| Movement 1: weight | a slow, heavy stalk; the gore driven from its haunches; the slam comes down off its rearing |
| Movement 3: wind up, follow through | every blow wound up and carried on after: the hook flung on up, the crash recoiling, the slam's glare |
| Movement 5: slick, no jumps | the review's JERK and JUMP, every frame, both sides |
| Movement 7: heavy blows freeze | the gore, the crash and the slam, each a tenth |
| Movement 8: feet grip | walking and galloping, hoofs down stay on their spots; it steps back onto its stand |
| Monsters 3, 4: menacing; the warning is a pose | head down, antlers aimed, trembling; pawing before the charge; reared up high before the roots; head thrown up before the bellow |
| Hits 2, 4: no blood; what flies off is its own | bone, moss, dark hide; splinters from what it smashes; no blood |
| Hits 5: deaths true; big things die heavy | dragged down by roots into the earth, his pick |
| Animations 1: as big and wild as it will go | rearing twice its height, a gallop of 6 tiles a second, splinters, earth bursting, fog rolling, roots in lines to 6 tiles |
| Animations 4: warnings in sight | each root burst's glowing crack before it; its own warnings are poses in plain sight |
| Pillars 4: enemy colours | its eye pink to gold; the roots' cracks pink to gold; nothing cyan |

Shown the six films (`shots/stag_walk.gif`, `stag_gore.gif`, `stag_charge.gif`, `stag_roots.gif`, `stag_bellow.gif`,
`stag_death.gif`) and asked as one pop-up, three questions, his answers, 15 Oct, by 12:55 (the clock read 12:55:25 just
after): "Its walk and its antler gore: are they right?" "Not yet"; "Its charge and its lines of roots: are they right?"
"Not yet"; "Its bellow, its flinch and its death: are they right?" "Yes, as shown (Recommended)". So its bellow, its
flinch and its death have his yes as shown; its walk, gore, charge and roots wait on what he wants changed.

### Redone on his words (15 Oct, by 13:08)

Asked what to change (one pop-up, two questions, any picks and his own words), his answers, 15 Oct, by 12:58: for its
walk and gore, "The gore needs more punch (Recommended)" and, in his words, "The movement is like to be a thing that
deer do called Stotting where they kind of bounce on all four legs.  I’d like it to move fast and erratic bouncing or
stotting all over the arena."; for its charge and roots, "The roots look wrong" and, in his words, "I’d like the roots
to worm or snake through the ground more".

READ AS (told him so): its walk becomes stotting; the gore gets more punch; the roots worm through the ground; the
charge stays as filmed (his notes were on the roots).
- ITS WALK IS STOTTING (STAG_WALK 0.75 s round, 12 frames at 16 a second, STAG_PACE now 3 tiles a second): bounding on
  all four stiff legs, all four hoofs landing together (at 0 and 0.42 s, down 0.08 s, a puff of dust from each) and
  leaving together; a high bound (30 of its own lengths) and a low one (16) by turns, jinking one way then the other in
  the air, its tail up. Where it bounds to, erratic all over the arena, is the game's: it may change its way only as
  it lands, and stop only landed (STAG_BOUNDS).
- THE GORE, HARDER (1.6 s): drawn back further and lower; the hook quicker, THE GORE at 0.8 s, held 0.12 s to 0.92 s;
  a crescent of its gold burning along its antlers' way, the enemy's pink at its edge, flaring at the blow (its light),
  sparks of it thrown on; a bigger spray of earth from 0.66 s; a ring of dust round its forefeet; flung on up to
  1.22 s, its forefeet off the floor higher (0.92 to 1.4 s); settled by 1.6 s.
- THE ROOTS WORM THROUGH THE GROUND (ROOT_SNAKE): along each line one long root slithers through the earth toward you,
  5 tiles a second, from 0.6 tiles before it out to 6, arching up out of the ground and back down into it, hump after
  hump (a hump each tile, up to 13 of its own lengths high), the humps travelling with it, 2.2 tiles of it at a time; a
  crack glowing pink burning to gold runs 0.7 tiles ahead of its head (THE WARNING); behind it a furrow of torn earth,
  closing. `rootSnakePainted(t, view, along, seed)` paints one stretch of 0.6 tiles (ROOT_STRETCH), `t` from when its
  head passes the stretch's middle, `along` the line's way in degrees; laid end to end they are one root (each hump
  belongs to the stretch its middle is in); its head passes `d` tiles out at `stagRootTime(d)`, 1.1 s + (d - 0.6) / 5.

The review (tests/hollow_stag.test.ts) holds all of it, 22 of 22: stotting, all four hoofs down together or none, and
down they stay on their spot as the floor goes by; the hand-over from its stand into its stotting and out of it as it
lands (worst 2.95 game pixels); the harder hook's antlers' far tips at most 26 picture pixels a thirtieth of a second.
