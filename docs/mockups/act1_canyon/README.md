# Floor 8, Echo Canyon

The art chat for floors 6 to 10, on the branch `mockup/act1-canyon` (from `mockup/act1-ledge`, 1524242: floor 7
whole, each part with his yes). NOTHING OF THE GAME IMPORTS ANY OF THIS. Pictures to him first; the main chat
puts it in.

## What began it

His word, 14 Oct, 21:21: "Okay floor 8 go", after the Carrion Queen's moves had his yes.

What floor 8 is, from his design doc ("Wordsmith Act 1: The Descent (Levels 6–10)") and his picks with the
planning chat (the project's `claude/act1_descent.md`):
- ECHO CANYON: "After the open cliff, the walls close in. The canyon is the cult's supply road down the
  mountain." Red-rock switchbacks along a dry riverbed; the level ends where the river comes back. Its palette:
  red rock. Wagons haul the quarry's obelisks downhill, and the cult's chanting echoes off the walls.
- ITS LOOK, his pick by 20:35 on 12 Oct, to the planning chat's in-game mock-up (previews/canyon_in_game.png;
  src/dev/preview_act1.ts, hash `shot`), asked "Is this how Echo Canyon should look?": "Yes, this is it
  (Recommended)", offered as: the canyon runs up the screen mostly, with the near wall's shadow and see-through
  pillars where it turns. Its tops dressed, by 20:42: "Yes, like this (Recommended)" (junipers, sage, yucca,
  dead trees, boulders, small hoodoos, a cairn and a skull, a rim of pale caprock, the cult's lookout with a
  hoist letting crates down to the road).
- ITS BOSS, the Cantor (his yes of 12 Oct, 18:07, to the planning chat's bosses): the cult's choirmaster;
  everything he does echoes off the canyon walls a beat later. His floor: The Cantor's Gorge.
- ITS MOBS: Canyon Scorpions (medium) and Dust Devils (small), with the cult's own.

The order, as for floor 7: the ground first, then its pieces, then the boss, then the mobs; each shown to him.

## Its ground (src/art/canyon.ts, `CANYON_LOOK`)

Painted by the game-ready painter of the Quarry and the Ledge Road (src/art/terrain.ts) from the level's own
tiles, with no change to the painter.
- THE FLOOR, the dry riverbed: fine sand the walls' own colour, in slow patches giving way softly (a two-by-two
  ordered dither where one tone meets the next, still crisp); drifted pale against the walls' feet; the wind's
  ripples across it in long broken lines, a lit crest over a line of shade, a pixel each; bars of river-worn
  stones, grey and cream among the red, each lit at its upper left with its shadow on the sand; flats of dried
  mud split into plates; grit and pebbles.
- THE WALLS, sheer sandstone in beds (rise 150 picture pixels, the planning chat's: about three heroes high, the
  walls closing in): low down the red beds, soft and deep red, with hard ledges standing out between them (lit
  along their tops, a shadow under them); higher up the paler beds of old dunes, swept with fine slanting lines;
  some beds split into blocks by short cracks; pits weathered into the soft beds; a few joints splitting down
  through several beds; the desert varnish streaked down from the rim, broad at the top and narrowing; the
  shadow under the caprock's lip.
- THE TOPS, the mesa: rust-red earth in soft patches; a rim of pale caprock along every cliff's edge, cracked;
  slabs of the caprock out across the top, standing a little proud (lit along their upper left, a shadow beyond
  their lower right); cracks; olive scrub in clumps; pebbles. What stands on the tops (the junipers, the yucca,
  the hoodoos, the cult's lookout) are pieces, next.
- HIS RULES: the near wall cut away where the canyon turns across the screen, its shadow on the sand (1.6 tiles,
  the mock-up's), and the near cliff's face in shadow where the ridge slants back (his rule of 12 Oct).
- COLOURS: every colour under the dullest word's saturation (leech, 0.498 in HSV; the ground's most saturated
  is 0.488), so the rock is a step duller than the planning chat's sketch, which was rough paint. The walls'
  deepest dark is warm (`WALL_DEEP`), so that the red rock never turns pink as it falls into shadow.
- WHAT IT COSTS (src/dev/preview_canyon.ts, `cost`, on this machine): the field 9 ms; a piece of 256 by 256
  picture pixels 66 to 142 ms. About the Ledge Road's.

      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_ground.png 1014 468 shot
      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_tiles.png 1014 468 tiles
      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_kinds.png 1014 468 kinds
      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_close.png 1014 936 close
      node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_cost.png 1014 200 cost

The tiles are laid by hand in the shape of the mock-up he said yes to (the road's line 3.7 tiles wide and the bay
at the turn); how the real Echo Canyon is laid is the main chat's.

`tests/canyon.test.ts` (9): nothing of the game imports it; every walkable tile's middle is floor, no rock
tile's; nothing painted over the floor; the near face on the cliff's side, within its height; pieces seamless,
the same every time; opaque, every kind of ground painted; no cyan or pink, duller than every word; light from
the upper left; three tones or so a material.

Shown `shots/canyon_ground.png` and `shots/canyon_close.png`, with a word that the rock is a step duller than the
sketch by his rule that places stay duller than the words, and asked "Is this Echo Canyon's ground?" (offered:
"Yes, on to its pieces (Recommended)"; "Brighter rock", closer to the sketch's orange, past the "duller than the
words" rule; "Not yet"), his answer, 14 Oct, by 22:13: "Yes, on to its pieces (Recommended)".

## Its 25 pieces (src/art/floor8.ts, `canyonPieces()`)

Themed after the floor's boss, the Cantor, the cult's choirmaster, and the canyon as the cult's supply road (his
rule for a set of floors from the second on: 25 for the set's theme, 25 for each boss). Nothing of them glows;
nothing cyan, pink or red (the canyon's rock is red-orange, its hue kept off the pinks); the cult's violet only on
what is the cult's, its mark in bone-pale paint.
- THE CANYON'S OWN: hoodoos (three sizes; banded red rock bulging and necking, a cap of pale caprock; tall: seen
  through while someone is behind one, as in the sketch he said yes to); red boulders (three); junipers (three;
  tall, seen through); a dead juniper; yucca (one in flower); sagebrush (two); a steer's skull.
- THE CULT'S SUPPLY ROAD: its wagon, hooped and covered in its violet, the mark on its side; the same broken down
  (a front wheel off and lying, its nose in the sand, its cover torn, its stores spilt); a crate of stores and
  sacks of meal (breakables: whole, and broken); wheel ruts (a floor tile, along x or y); its hoist on the wall
  (a crate slung on a rope let down the face); its lookout tent for the tops.
- THE CANTOR'S: his lectern, the great book of the chant open on it; a frame of the cult's bells; the cult's great
  horn; singing stones, pierced for the wind; the chant carved in the wall; a torn page of the chant (the quest
  piece: the ritual's pages hidden through the descent, his design doc's word hook).
- THE REST: an obelisk on its dray (the siege's thread: the quarry's obelisks hauled downhill); rockfall from the
  rim (the trap, a floor tile: 0 grit fallen, the sign; 1 its warning, the shadow of what will fall; 2 the rock
  come down in a burst of dust; 3 the rubble); the waystation's gate (the canyon's cult stronghold; along x or y,
  shut or dragged open); a seep in the wall (the old river still running in the rock); driftwood.

The dressed screen sets them where the sketch has things: the hoodoos where the canyon turns (the one in front of
the knight seen through), the broken-down wagon by the knight and its stores, the Cantor's lectern and bells by
the cult's banner, the chant and the seep in the far wall, the lookout on the far top with the set's brazier and
banner and its hoist down the wall; the tops dressed by the rule he said yes to (junipers in groves with bare
ground between, sage, yucca, boulders, a dead tree, small hoodoos, never over the road).

    node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_dressed.png 1014 468 dressed
    node tools/preview.mjs src/dev/preview_canyon.ts shots/canyon_pieces.png 1014 2530 pieces

`tests/floor8.test.ts` (7): nothing of the game imports them; their pictures, names, no light; crisp, no loose
pixels; no cyan, pink or red, duller than every word; what stands on its foot, a floor tile or the trap inside its
diamond; nothing cut off at a picture's edge; 25 of them.

Shown the first 14 (`canyon_dressed.png`, `canyon_pieces.png`) and asked "Are these Echo Canyon's first pieces?"
(offered: "Yes, on to the rest (Recommended)"; "Change some"): "Yes, on to the rest (Recommended)". Shown all 25 and
asked "Are these Echo Canyon's 25 pieces?" (offered: "Yes, on to the Cantor (Recommended)"; "Change some"), his
answer, 14 Oct, by 22:34: "Yes, on to the Cantor (Recommended)".

## The Cantor, floor 8's boss (src/art/cantor.ts, behind `CANTOR_ON`, off)

The planning chat's, with his yes (12 Oct, 18:07): the cult's choirmaster, leading the chant down the supply
road; everything he does echoes off the canyon walls a beat later. A staff strike (his basic attack); a shout
whose shockwave comes back off the wall behind you, so you dodge twice; sound-copies of him that repeat his last
move; rockfall shaken loose by his voice.

His brief, asked as his art rulebook's questions in two pop-ups (14 Oct, by 22:40), his picks as he tapped them:
- How big: "Tall and gaunt, menacing (Recommended)", offered as: half again your height, robed, looming over you
  like a preacher over his flock.
- The one thing to know him by: "Bone pipes rising from his back (Recommended)", offered as: a fan of bone organ
  pipes grows from his shoulders; they blast pink when he shouts.
- How he moves: "Stately, then sudden (Recommended)", offered as: slow and grand, conducting with sweeping arms;
  then he lunges fast.
- What he carries: "A long staff topped with a bell (Recommended)", offered as: he strikes with the staff, and the
  bell rings with every blow.
- How he dies: "His last note tears him apart (Recommended)", offered as: he screams one last note; his pipes
  crack, he shatters, and his echoes ring on and fade after him.
- Never: "Not a wizard in a pointy hat (Recommended)", offered as: magic is the mage's; he's a singer and a
  preacher, not a spellcaster.
- His sound: "A choir of voices, echoing (Recommended)", offered as: his voice is many voices at once, and each
  comes back off the walls.

STANDING: a Mob on the heroes' bones, 86 tall (half again the knight's 58), gaunt (narrow chest and waist, long
arms); bare-headed (no hat, no hood: the flock wear cowls), his long hairless head pale and grey, a hard brow, a
hooked nose, his eyes the cult's pink, his mouth a dark slot that burns when he sings; a mantle over his shoulders
edged in pink, a robe to the floor, the cult's pink stole; long bony hands, the left raised before him as if to
lead a choir; his staff in his right hand planted beside him, a crook at its head and a bronze bell hung in it;
NINE PIPES OF BONE rising from between his shoulder blades side by side behind his head, the middle tallest, each
open at its top, a slot cut in its back near its foot as an organ pipe's mouth, their tops and slots glowing the
cult's pink with his breath. His canvas 420 by 460, his feet at (210, 360). His stand (3.2 s round): he breathes
deep and slow, his weight going over from foot to foot, his raised hand beating a slow time, his head turning to
look over his flock, his pipes glowing and dimming with his breath.

    node tools/preview.mjs src/dev/preview_cantor.ts shots/cantor_look.png 1014 1000 look
    node tools/page_gif.mjs src/dev/preview_cantor.ts "standfilm" shots/cantor_stand.gif 4

`tests/cantor.test.ts` (5): the switch off and nothing of the game imports him; crisp, his pink edge; nothing
cyan, every light the cult's fire, nothing cut off; his size (1.48 times the knight); the boss review of his stand
(tests/cantor_shape.ts: his solids, his staff through nothing but his right hand).

Asked "Is this the Cantor?" (offered: "Yes, animate him (Recommended)"; "Not yet"), his answer, 14 Oct, by 22:48:
"Yes, animate him (Recommended)".

## The Cantor's moves (15 Oct; for his yes; behind `CANTOR_ON`, off)

A plan for all eight moves went to him as a message, and the pop-up "Build the Cantor's moves this way?" came
back "Yes, build these (Recommended)". The plan's own words: "His style is "stately, then sudden": slow and grand,
then a snap of violence, and every blow comes back as an echo a beat later."

**His moves** (src/art/cantor.ts; each a smooth curve through its key poses, a key every frame; the times are
seconds into the move; his staff is held where each move says, his hands on it wherever his body goes):
- **Stand** (`cantorStand`, 3.2 s round, ten frames a second): as approved with his look.
- **Walk, a procession** (`cantorWalk`, a round of 24 frames at 16 a second, 1.5 s, for a pace of 0.8 tiles a
  second): slow, grand strides, his weight going over onto each foot, his robe swaying; his left hand raised,
  beating time; his head held high and level. Once a round he swings the staff forward and plants it ahead of him
  as his left foot comes down (1.05 s), and walks on past it; the bell tolls a ring of pink sound across the floor
  from its foot, and its echo a beat after (1.23 s), both gone before the round comes round. Each foot, and the
  staff's foot, is carried back with the floor while down.
- **Staff strike** (`cantorStrike`, 2.2 s; his basic blow): takes the staff up in both hands (to 0.12 s), steps
  forward and heaves it overhead, the staff thrust up through his hands until its bell is 179 over the floor, twice
  his height (to 0.45 s); holds it there, trembling, the bell shaking (THE WARNING, 0.45 to 0.85 s); brings it down
  in one sudden, huge arc, hips first, then his back, then the staff, fastest as it lands (0.85 to 1.0 s), a streak
  of pink sound behind its head; the bell clangs on the rock 103 ahead of him, about two and a half tiles (1.0 s),
  held a tenth (to 1.1 s): rings of pink sound, the rock cracked, dust and chips of red rock; it skids on a little
  (to 1.25 s); he holds there bent over it, and a ghostly pink echo of the staff swings down and strikes the same
  spot again (1.45 s), the floor ringing weaker; he heaves it upright (1.5 to 1.85 s), lets it slide down through
  his hand to the floor, planted (to 2.2 s), and steps back (1.62 to 1.84 s).
- **Shout** (`cantorShout`, 2.2 s): rears back and swells, his arms spread wide, his head back, his mouth shut,
  while his pipes draw in light, the cult's fire streaming into their mouths (from 0.1 s; held trembling, THE
  WARNING, 0.6 to 0.86 s); lunges a stride forward, his arms flung back, his jaw dropping wide (0.86 to 1.0 s); all
  nine pipes and his mouth blast pink at you (1.0 s, for 0.3 s), rings of sound flung out of his mouth; a
  shockwave rolls out across the floor before him to about four and a half tiles (1.0 to 1.5 s), and comes back
  from beyond you, off the far wall (1.45 to 1.95 s). His staff stays planted, braced.
- **Sound-copies** (`cantorCopies`, 2.2 s): spreads his arms and raises the staff high over his head in his one
  hand (to 0.45 s); rings the bell, shaking it (rings of sound out of it at 0.55, 0.78 and 1.0 s); two see-through
  pink copies of him tear away from him, the first to his left (0.62 s), the second to his right (0.86 s), 46 out
  to each side, each a beat behind the last in all it does (0.18 and 0.36 s behind him); he lowers the staff and
  plants it, and they do the same a beat after him. Painted as he is, then laid under him in the cult's pink every
  other game pixel, their seams whole. `cantorEchoPainted(move, t, view)` paints one as a figure of its own, for
  the game's copies once they are torn away (they repeat his last move: the game's).
- **Rockfall** (`cantorRockfall`, 2.6 s): lifts the staff and drives it down, planted (0.4 s), the bell tolling;
  throws his head back, his left hand raised high, and sings straight up at the rim, his mouth wide and burning,
  his pipes and his mouth blasting pink skyward, rings of sound rising (0.75 to 1.9 s); dust pours down in streams
  and grit sifts down all round (from 0.8 s); six rocks of the rim's red rock come down round him (1.3, 1.42, 1.54,
  1.66, 1.78 and 1.9 s), each turning as it falls for half a second, its shadow darkening on the floor before it
  (the warning), each smashing in a burst of dust and chips; he lowers his head (to 2.6 s). Where the rocks fall in
  the game is the game's (floor 8's rockfall trap).
- **Flinch** (`cantorReel`, 0.7 s): his head snaps back and his pipes clatter in their roots, spitting a burst of
  pink and the cult's fire (to 0.12 s; their clatter dies away by about 0.45 s); he staggers half a step back (his
  right foot, 0.05 to 0.2 s), then straightens slowly to glare, stepping in again (0.36 to 0.56 s).
- **Death, his pick: his last note tears him apart** (`cantorDie`, 2.6 s): struck, he throws his head back, his
  arms flung wide, and screams one last note, trembling, rings of sound out of his mouth, his mouth and pipes
  blazing; his pipes burst one after another, from the outside in, in shards of bone (0.36 to 1.04 s); pink light
  splits through him (0.95 to 1.35 s); he shatters (1.35 s), shards of him flung out in a flash of pink; his robe,
  mantle and stole collapse empty to the floor (1.35 to about 1.8 s), his staff topples and the bell clangs a last
  time (1.85 s); his echoes ring out across the floor, each weaker (1.35, 1.65, 1.95, 2.2 s), gone by 2.6 s. What is
  left: the empty robe in a heap, the staff and its bell, the shards.

**His effects** (Animations 3, his own way of being wild: his sound, the cult's pink rings and blasts, and the
canyon's dust and rock; each a crisp mote of whole pixels): rings of pink sound across the floor and in the air;
the strike's streak, its cracks in the rock, its ghostly echo; the cult's fire drawn into his pipes and blasted out;
the shockwave and its return; the copies; the rockfall's dust, rocks and shadows; shards of bone and of him.

**Elsewhere:**
- His canvas `CANTOR_CANVAS` is now 600 by 660, his feet at (300, 470) (was 420 by 460, feet at (210, 360)): his
  shout's shockwave, his rockfall's rocks and his strike's staff reach that far.
- src/dev/preview_cantor.ts: films (walkfilm, strikefilm, shoutfilm, copiesfilm, rockfallfilm, deathfilm), `frame:`
  and `phone:` (one moment as a phone shows it).

**The check, rule by rule** (docs/art/RULEBOOK.md; How art is made 7, every boss through every check; made before
he sees him):

| Rule | The Cantor | Result |
| --- | --- | --- |
| Animations 1: as far as it will go | The staff heaved to twice his height and brought down 103 ahead of him; the shout's shockwave rolls out four and a half tiles and back; two copies of him tear away 46 each side; six rocks come down; his death bursts nine pipes and shatters him | Pass by the numbers; his eye decides the notch |
| Animations 3: wild in his own way | Sound: rings and blasts of the cult's pink, and the canyon's dust and rock; nothing borrowed | Pass by eye |
| Animations 4: warnings in sight | The strike's overhead hold, the shout's swell and the rocks' shadows are in sight; nothing covers them | Pass by eye |
| Monsters 4: the warning is a pose | The strike held overhead 0.45 to 0.85 s; the shout swelled 0.6 to 0.86 s, trembling | Pass (review: BLOW) |
| Monsters 5: weapons rest low | His staff planted beside him standing and walking; up only to strike or ring | Pass |
| Movement 1: weight first | The strike's lunge over his front foot, hips first; the stagger | Pass (review: HIPS) |
| Movement 3: wind-up and follow-through | The strike and the shout drawn back, held, carried on (the staff skids, the shout lunges on) | Pass (review: BLOW) |
| Movement 4: loose things follow | His hem left behind as he goes; the bell swings and rings; his robe falls empty | Pass by eye |
| Movement 5: slick | No frame leaps, stalls, turns back at speed, or starts or stops at its fastest; no jump from his stand into any move and back | Pass (review: JERK, JUMP) |
| Movement 6: alive when still | His stand as approved | Pass (review: ALIVE) |
| Movement 7: heavy blows freeze | The strike held a tenth as the bell lands (1.0 to 1.1 s) | Pass |
| Movement 8: feet grip | No foot slides while down; the planted staff's foot does not slide either | Pass (review: SLIDE; by construction for the staff) |
| Heroes 6: clean bodies | No arm through his body; his staff through nothing of him but his hands | Pass (review: ARM, THROUGH) |
| Hits 5: deaths true to what died | His last note tears him apart; his robe crumples empty | Pass by eye |
| Monsters 6 and Colour 3: pink is theirs | Every light the cult's pink and gold; nothing cyan | Pass (test) |
| Pixels 1 and 5: crisp; the pink edge | Every pixel crisp; his pink edge while he lives, none as he dies | Pass (test) |
| Nothing cut off | No frame of any move, his death or a copy touches his canvas's edge | Pass (test) |
| How art is made 6: checked at phone size | Six moments at the game's size on a phone's 844 by 390 | Looked at |

**Checks:** tests/cantor.test.ts 5 of 5 (the whole boss review of every move, from in front and from behind;
crisp; nothing cyan; nothing cut off, his copies too; his size); `tsc --noEmit` clean.

**The pictures** (in `shots/`): films `cantor_walk.gif` (sixteen frames a second), `cantor_strike.gif` (the strike,
then struck), `cantor_shout.gif`, `cantor_copies.gif`, `cantor_rockfall.gif`, `cantor_death.gif` (thirty a second),
each with a contact sheet (`.sheet.png`).
