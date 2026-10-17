# Mock-up: THE FLESHMANCER, the Crypt's lair boss on floor 5 (NOT IN THE GAME)

**What it is.** The lair boss of the first set of five floors, the Crypt, drawn as the other three bosses
were (`docs/mockups/bosses/README.md`): on the heroes' bones, every move through every boss check (his art
rulebook, How art is made 7), pictures to him first. Nothing of the game imports it. His fight's rules
(what each spell does, when he casts it, what he drops) are the main chat's.

**State of this branch (`mockup/fleshmancer`):** from `mockup/bosses` at 28f7368 (the Headsman, the
Chained One and the amalgamation with the bone beast, as they went to the main chat). Made by THE ART
CHAT, from 11 Oct 2026. His brief, and HIS LOOK (his standing loop), WITH HIS YES (by 12:28, below); then
HIS FOUR ATTACKS (the shards, the rings of hands, raising the dead, the sweeping fire) and what he sends out,
made and filmed for him, WITH HIS YES (by 14:03, below); and HIS GLIDE, SETTING OFF AND STOPPING, STRUCK
AND HIS DEATH, WITH HIS YES (by 14:21, below). Every move of his is made: he is whole.
His look was drawn once (8d4b104), REMADE after a fresh look at it (a4a885d: at a phone's size the first
read as a hooded torch-bearer, a monk with a lamp on a pole), and remade again after a second fresh look
(the third drawing, below: the second had accidental shapes in it, and a small, crouched body).

## His words

- 9 Oct, 22:47, his outline of the Crypt (in the main chat): "There is a cult here that has found an
  ancient evil power residing under the crypt.  Floor 5 will have the Lair boss, which will be a very
  powerful cultist fleshmancer.  He is the one creating the ossuary guys and the giant amalgamation.
  This guy is tough.  Hes human sized, but He has crazy spells that fill the room and you have to dodge
  around to avoid them.  He drops something, maybe the key to allow wordmelding.  I don’t really know."
- 9 Oct, 16:48: "I’d like the same principals for animations used for characters on the bosses"; 23:35:
  "I need all bosses ran through all checks from now on.  These boss fights are important"; 23:56: "And
  every boss gets the same treatment as characters".
- 10 Oct, 07:47: "Put in the ruleset that I want animations as big and wild and kinetic and weighty as
  possible.  I’d rather it be a notch too high than a notch too low." 07:53: "And I want all animations
  checked against this statement before I see them."
- HIS BRIEF (his art rulebook's "A new character"), asked as pop-ups on 11 Oct, answered by 08:36, each
  in his words (the options as offered in brackets):
  - His look: "Hooded priest, hands of power" (robe and deep hood, face hidden in the dark but for pink
    eyes; long bony fingers that glow; the magic is all in his hands).
  - The one thing he is known by: "A staff topped with a skull" (a tall staff of fused bone with a
    burning skull at its head).
  - How he moves: "Glides, feet just off the floor (Recommended)" (unnaturally smooth, robes trailing on
    the floor, then a sudden lurch when he casts).
  - His death: "His own dead drag him down (Recommended)" (arms of bone burst from the floor around him
    and drag him under, still casting).
  - His basic attack: "Bone shards from the skull (Recommended)" (the skull on his staff spits a fan of
    bone shards).
  - His big spells, three of four offered: "Rings of hands (Recommended)" (rings of arms burst from the
    floor, spreading out from him in waves with gaps to slip through), "Raise the dead (Recommended)" (he
    lifts his staff and the dead climb out of the bone heaps round the room to fight for him), "Sweeping
    fire" (the skull pours a stream of his pink fire that sweeps round the room like a clock hand). Not
    taken: "Bone rain (Recommended)".
  - Never: "Nothing gory (Recommended)" (grim like the rest of the Crypt: bone, robe and pink fire,
    never blood or open flesh).
  - His sound, for the sound chat: "An echoing voice and a shrieking skull" (his voice booms through the
    hall, and the skull on his staff shrieks when he casts).
- HIS LOOK, asked as a pop-up on the page "Fleshmancer Look Review" (11 Oct, by 12:28), "The
  fleshmancer's look and how he stands, as on the Fleshmancer Look Review page: good to animate as
  shown?": "Yes, animate him (Recommended)", offered as: his glide, his attacks, his three spells and
  his death made as films, every move through the boss checks, for him to see.
- 11 Oct, after that, in the art chat: "I don’t need the whole mock up sheet, just show me what he looks
  like and what the attacks look like". Read as (and told him so): no big sheet; one picture of him and a
  film of each attack, him casting it in a room as it would look in a fight; his walk, flinch and death
  after, shown the same way.

- HIS ATTACKS, asked as a pop-up on the page "Fleshmancer Attacks" (11 Oct, by 14:03), "The fleshmancer and
  his four attacks, on the Fleshmancer Attacks page: good as shown?": "Yes, on to his walk and death
  (Recommended)", offered as: these go to the main chat to build his fight; his glide, flinch and death
  next, shown the same way.

- HIS GLIDE, STRUCK AND HIS DEATH, asked as a pop-up on the same page (11 Oct, by 14:21), "His glide, how he
  flinches when hit, and his death, now at the top of the Fleshmancer Attacks page: good as shown?": "Yes, on
  to floor 5 (Recommended)", offered as: he's done and goes to the main chat whole; the art chat starts floor 5
  as he described it, with the mine shaft up to town.

## His glide, setting off and stopping, struck, and his death (the art chat, 11 Oct; with his yes by 14:21)

- **HIS GLIDE** (`walk`, "Glides, feet just off the floor (Recommended)"; 8 frames at 8 a second, once round in
  1 s, painted for 1 tile a second, `FLESHMANCER_PACE`): no step, no stride: he leans into his way and is borne
  along over the floor, rising and sinking once a second, his staff trailing at his side, his claw held out
  with its fire, his robe, tails and sleeves streaming back.
- **SETTING OFF** (`more.setOff`, 0.5 s, `FM_SET_OFF`) from his rest pose to the first frame of his glide: he
  coils a moment and surges into it, his robe snapping back. **STOPPING** (`more.halt`, 0.6 s, `FM_HALT`) from
  the first frame of his glide to his rest pose: borne on a little past where he stops, he rocks back upright,
  his robe swinging on past him, and settles.
- **STRUCK** (`reel`, 0.5 s, `FM_REEL`; `reelTime`): the blow throws him back and up at once, hood snapping
  back, robes flung, his light knocked half out of him (the skull's fire gutters), held a beat, and he rights
  himself.
- **HIS DEATH** ("His own dead drag him down (Recommended)"; `dying`, 3.0 s, `FM_DEATH`, at the game's 20 frames
  a second, no edge of light round him as he dies). Struck (0 to 0.1 s), thrown back. The floor under him
  splits open into a pit (from 0.15, `fmPitAt`), his fire deep in it, its stone heaved up round its mouth, and
  seven arms of his own dead burst up out of it round him, bent at the elbow, and seize his robe from its hem
  up to his chest (0.16 to 0.4); they YANK him down (0.34). Dragged under, still casting: his claw thrown up
  high and blazing, the staff held up over his head, the skull roaring, twisting against them as they haul him
  down, slowly and then faster; his hood goes under at 1.8, his claw at 2.0, and last the skull, from 2.32 to
  2.44, its fire bursting up out of the pit a last time in sparks. The pit closes over him (2.75 to 3.0): by
  the last frame nothing of him is left. What goes under the floor is cut away as it goes (his painter cuts
  every part of him at the floor: `floorCut`), so the game draws him where he died, nothing more. For the
  checks he is `FM_SHAPE_UNDER` as he dies: dragged down through the floor, nothing of him is held out of it.

## His attacks (the art chat, 11 Oct; with his yes by 14:03)

Each is a move on his bones (`FLESHMANCER.attack`, and `FLESHMANCER.more`'s `rings`, `raise` and `fire`), at
30 frames a second, beginning and ending in his rest pose (`FM_REST`); `prop` in each pose says which it is to
his painter (`FM_ATTACKS`). What he sends out is drawn by `src/art/fm_spells.ts` in the game's own pixels,
where the game puts it, as `art/boss_shots.ts` draws the other bosses'; the hands of his rings are pictures
(`makeRingHandArt`). Every one checked against Animations 1 (each first cut was made bigger: the staff
cocked right back and swung over in a smear of fire, the hands made taller and of his staff's bone, the fire
a solid rope and a river of flames).

- **THE BONE SHARDS** ("Bone shards from the skull (Recommended)"; his basic attack, `attack`, 1.4 s, the
  blow at 0.8 s, `FM_SHARDS`). 0 to 0.4 s: he swells up off the floor, rears back, hips and chest turned
  away, and cocks the staff back over his right shoulder, the skull behind his head, its jaws dropping
  open; his casting hand thrust out at you. 0.4 to 0.6: held, trembling (the warning). 0.6 to 0.8: his hips
  swing round, then his chest, and the staff comes over his head and down like a hammer, the skull's fire
  smeared behind it, until the skull points at you, and at 0.8 it SPITS: a blast of fire out of its jaws,
  sparks sprayed. He lunges through it, the staff dipping on past (to 0.87) and kicked back up; settled by
  1.4. What it spits (`fm_spells.ts`, `FM_SHARD`): 7 shards in a fan, 12 degrees apart, at 9 tiles a second,
  each a splinter of bone with his fire streaming off it, its shadow under it (`drawBoneShard`,
  `drawShardShadow`); where one strikes (or at 6.5 tiles, the floor) it bursts into burning splinters,
  0.4 s (`drawShardBreak`). They leave the skull's jaws: `fmMouthAt('attack', 0.8)`.
- **THE RINGS OF HANDS** ("Rings of hands (Recommended)"; `rings`, 2.2 s, the slam at 0.86 s, `FM_RINGS`).
  0 to 0.46 s: he rises high, arching back, hood thrown back, the staff hauled up overhead and his claw
  raised high, its fire swelling. 0.46 to 0.76: held, trembling, the skull roaring. 0.76 to 0.86: he drops,
  folding forward, slams his claw down at the floor and drives the staff's foot into it (0.86: a flash at
  each). He holds low, his claw lifting as if pulling them up, to 1.6, and rises back by 2.2. What it calls
  up (`fm_spells.ts`): from the slam the floor cracks out from him and a WAVE of his light runs out over it
  at 3.6 tiles a second (`drawSlamWave`, 1.6 s); where it passes, RINGS OF HANDS burst up: as the films lay
  them (`FM_RINGS_LAID`), 8 hands at 1.5 tiles, 14 at 2.9, 20 at 4.3, each ring with a gap of 2, 3 and 4
  hands to slip through, bursting up 0.42, 0.81 and 1.19 s after the slam. EACH HAND (`paintRingHand`,
  `makeRingHandArt`, three kinds, 24 frames at 20 a second, 1.2 s, the hole on the anchor): the floor bursts
  open and a bony forearm of his staff's bone thrusts up out of the dark (up by 0.1 s), a claw like his own at
  its end, its fingertips burning; it grabs at the air, snapping shut and open (to 0.72), and is dragged
  back down into the dark, closing (under by 0.98); the broken stone falls back over the hole by 1.2. Its
  crack glows 0.4 s before it comes (the warning) and is left 0.6 s after (`drawHandCrack`).
- **RAISING THE DEAD** ("Raise the dead (Recommended)"; `raise`, 2.6 s, the shriek at 0.72 s, `FM_RAISE`).
  0 to 0.55 s: he sinks, folding over, staff and claw drawn down to the floor, hood bowed. 0.55 to 0.8: he
  flings both arms up, the staff high overhead and his claw spread, and rises, arching back, hood thrown
  back; the skull's jaws drop and it SHRIEKS (0.72), a ring of sparks bursting out of it, and his light is
  pulled up out of the floor into his hands. He holds, shaking, to 1.9, and comes down by 2.6. THE DEAD: on
  a heap of bones, his fire licks up among them (0.3 s, `FM_RAISE_STIR`); then one of the dead is snatched
  back up out of it: the game's own skeleton's death (art/monster_bones3.ts `deathOf3`, the game's die clip)
  PLAYED BACKWARDS over its 1.0 s, its bones yanked up off the heap and slammed together, a flash as they
  meet (`drawRaiseGlow`); it ends standing as the skeleton stands, ready to be handed over to it. In the
  film three heaps go, 0, 0.14 and 0.27 s after the shriek. Whom he raises is the main chat's.
- **THE SWEEPING FIRE** ("Sweeping fire"; `fire`, 4.6 s, `FM_FIRE`). 0 to 0.5 s: he rises and hauls the staff
  up high over his head, the skull's jaws dropping, his claw thrown out before him. 0.56: the stream BURSTS
  out of the skull's jaws, kicking it back. 0.62 to 3.9: it pours from over his head in a rope of fire,
  arcing down onto the floor 1 tile out, and rushes on along it as a river of flames to 4.8 tiles, splashing
  up where it ends (`drawFireStream`); it goes round the room once like a clock hand, setting off a little to
  his right of where he faces and turning to his left (`fmFireTurn`), his body heaving after it, his robes
  thrashing; the floor it has swept burns on 0.6 s, its flames sinking, and is left scorched (`drawScorch`).
  At 3.9 it stops (what is left of it is flung on out), and he lowers the staff by 4.6.

## What he is (his look; the art chat, 11 Oct, as remade)

Nothing of the game makes him: `src/art/fleshmancer.ts` (`FLESHMANCER`, his switch `FLESHMANCER_SWITCH`,
off), `src/dev/preview_fleshmancer.ts` and `src/dev/fm_floor.ts` (the dev page and the floor it puts him
on) are imported by nothing of the game. He is a `Mob` as the other bosses are (`src/art/new_mobs3.ts`):
posed on the heroes' bones, dressed in the heroes' solids, lit from the upper left, the enemy's pink edge
round him while he lives; a canvas of his own; seen from behind as the camera truly sees him (`trueBack`,
as the Headsman: his staff stays in his right hand).

THE FIRST DRAWING, AND WHY IT WAS REMADE. A fresh look at the first drawing (8d4b104), which the art chat
agreed with: at a phone's size he read as a hooded torch-bearer, weaker than the Headsman and drabber than
his own cultists; the skull read as a torch, the hands did not read, the float did not read, and his
standing loop was a glow switching on. The second drawing (a4a885d) mended those: a skull you read as a
skull, a bony claw holding fire, a bone staff, a magenta mantle, a float, a loop that gathers and flings.

THE SECOND DRAWING, AND WHY IT WAS REMADE AGAIN. A second fresh look found accidental shapes in it, which
must go before he sees him, and his body small and crouched: the gold-rimmed face, the band hanging from it
and the mantle's edge across it made a loop on a stem with a crossbar (the female sign, an ankh, a
keyhole); the band broken below the mantle's edge left a pink capsule at his crotch; the face in the hood
was a wall socket (two matched pink bars in a gold frame); the skull drifted to a jack-o'-lantern (light
through its eyes and mouth, pink marks like eyebrows, a three-pointed crown of flame) and was too big, a
second head; every ember was a "+" (a lone pixel inside his pink edge), two of them above the staff a cross
on it; the staff hands read as the numbers 3 and 6; from behind he was a purple lump with sticks on it and
loose pink patches like sores; the fire he drew from the skull was a dotted line, a bead chain again; the
burst's sparks went out in one frame; he was shorter than the knight and hunched, his robe bulging forward as
if he sat on a stool; the collar of straight stays read as a witch-doctor's headdress; and the fling was a
coal dropped at his side by an arm like a rod. So the third drawing, point by point:

- **The front makes no symbol.** No gold round the opening of his hood: its edge is dark, lit a little pink
  from inside; his cult's pink and gold are on the hood's OUTER brim, an arch over his brow, open below.
  Nothing hangs from his face. The mantle's edge dips to a soft point at his breast (never a straight bar
  across him); a little under it, to either side of the dip, the two edges of his robe where it parts run
  down to the hem unbroken, flaring apart as they go (an A, never a crossbar on two legs: a third look found
  the straight bar and two parallel edges made a "Π"); the edge the light falls on is pink edged with gold,
  the other sunk in shadow (no band, no capsule).
- **His face** is the dark of the hood and two hot points of fire for eyes, each with a dimmer one beside
  it, the two not alike (one below, one slanting): no frame, no bars.
- **The skull** is smaller: 14 across (it was 17; his hood is about 14), pale bone, not tan. Its sockets are
  dark pits, the fire deep in each low at its outer side, licking up and out over the temple (no marks over
  the brow, nothing lit in the middle of a socket); a broken row of upper teeth; the mouth dark, at most a
  dim glow; the jaw hanging open with a few teeth in it; off its crown a ragged flame, one tongue taller than
  the others, from behind it. It still looks at you from in front and from behind alike (it is the same
  picture both ways, so it never mirrors or snaps as he turns), and it sits well above his hood.
- **No embers are crosses.** Every ember, spark and fleck of his is a slanting streak of three pixels,
  dimming along it, never one pixel alone (a test looks for a lone pixel in every frame both ways round);
  nothing floats above the skull on the staff's line.
- **The staff hands** are three fingers each slanting down across the bone, each its own length, pointed and
  lit at the tip beyond the bone, their knuckles standing out of the back of the hand one by one, a thumb
  hooked over above: no closed loop, no letter or number.
- **From behind**: the hood a step darker than the mantle, so that its round shape reads against his
  shoulders, and the face is never painted on its back; the mantle's edge one clean band all round (no
  notches, no crease down its back); no band down his back; the lining of his tails a darker pink and only at
  their tips (no loose pink patches).
- **The fire he draws from the skull** runs to his claw in a few short streaks, unevenly spaced, never a
  dotted line.
- **The burst's embers** fly out, fall back to the floor and go out one by one over its last four frames;
  the burst lasts 0.9 s (it was 0.6). Each is a single streak slanting the way it flies, so that two never
  meet in a corner (a "V", "L" or "Z") as they fade; its broken ring of fire is gone before they are.
- **His body** is a man's a head taller than the knight: 55 tall (it was 50.5), upright (no hunch), the top of
  his hood 66.4 up at rest (the knight is 58, his head 9.8), and his robe hangs plumb from his hips to its
  hem (it no longer goes round his drawn-up legs, so it never bulges forward; nothing of his legs is
  painted). He is now the bigger thing; the skull is his emblem.
- **The collar** is two ribs of bone rising from his collar at the sides of his hood and curving in over
  it, a ribcage closing over his head, each tapering its own way with a knuckle where it bends, never higher
  than a few pixels over his hood; bone, never gold. (Two more, behind his hood, made a straight bar over it
  from in front, and were taken out.)
- **The fling** is a throw: he winds his shoulders back across him with the fire in his claw before his
  chest, then lunges into it, his shoulders twisting round (18 degrees), his chest bending forward, his
  elbow leading with the claw raised behind it, his arm whipping out straight past where the fire leaves his
  hand (2.14 s) and on (the overshoot), and back. The gout flies out before him and down toward you, a
  comet with a long tail and a trail of flecks, 2.2 tiles out (56 of the figure's lengths from where it
  left his hand, about two of his widths across the picture), and strikes the floor (2.54 s) in a flash as
  wide as he is, fire standing up across it, a broken ring of it spreading out, embers thrown out.

What stays from the second drawing: the staff of warm-ivory bone (nine uneven fused bones, spurs hooked
upward, a crook near its head), held out at his right side; the casting claw, half as big again as a man's
hand, four long bone-pale fingers and a thumb splayed, their tips burning pink to gold, the fire held between
them; a robe of near-black plum and a mantle of it raised to magenta; his pink light, and a pool of it on the
floor under him with embers dripping into it; his float (the lowest of his tails 9 to 17 off the floor through
his stand, four to eight of the game's pixels, and he rises and sinks on nothing by 4.75 of them). Nothing
gory: bone, robe and pink fire only. What glows on him is the enemy's and nothing else glows (`FLAME`, pink
burning to gold); nothing on him is cyan. The skull, his hands and the face in his hood are painted pixel by
pixel (little pictures held square to the eye, each as near it as the thing it is), so that they read at a
phone's size.

**His stand** (`stand`, 36 frames at 10 a second: 3.6 s round; the art rulebook, Movement 6, "Alive when
still", and Animations 1, "as big and wild and kinetic and weighty as possible"): he floats, rising and
sinking slowly on nothing, swaying, unnaturally smooth; his hem, his tails, his sleeves and his mantle's edge
ripple throughout; his hood turns as he looks about the hall; the skull's fire burns and the fire in his claw.
HIS HABIT, once round:

- ANTICIPATION (1.0 to 1.95 s): he rises, his hood tilting back and his staff leaning out, and draws the
  fire down out of the skull (its flames sink, a few uneven streaks of it running down to his hand) into his
  claw, which he brings before his chest, where it is seen, the fire swelling in it; his shoulders wind back
  across him.
- THE THROW (1.95 to 2.35 s): he lunges into it, his shoulders twisting round and his chest bending forward,
  his elbow leading with the claw raised behind it, then his arm whipping out straight past where the fire
  leaves his hand (2.14 s) and on, and back; A GOUT OF FIRE flies out before him and down toward you, a comet
  trailing flecks, and strikes the floor (2.54 s) two of his widths away in a flash as wide as he is: fire
  standing up across it, a broken ring of it spreading, embers thrown out that fall and go out one by one over
  its last four frames (gone by 3.4 s). The skull flares a beat after the throw, its jaw dropping, its fire
  roaring up over two or three frames; his eyes and the edge of his hood's opening blaze, his face stays
  black; his tails and sleeves kick out.
- Then he settles, and the fire in his claw kindles again. From behind, his claw shows over his shoulder,
  and the gout flies out past him and bursts beyond his staff.
- No light of his grows by more than two fifths from one frame to the next (the first drawing's flare washed
  pink over the whole of him in one frame).

The numbers his painter reads besides the bones: `draw` (his claw closed, 0 to 1), `pAz` (the fire in his
claw: 0 gone, 1 burning, 2 charged), `pEl` (the gout: 0 to 1 in flight, 1 to 2 bursting on the floor), `pt`
(the skull's fire roaring), `gale` (his tails and sleeves kicked out), `out` (the light going out of him).

**His other moves are not made yet.** His walk (the glide), his blow, struck and his death are held
placeholders, his rest pose still (`FM_REST`), so that the game's shape for a monster is whole; they are not
reviewed, and they are not to be put in. `FM_MADE` lists the moves made: his stand. (The skull and his hands
are pictures held square to the eye: when his death is made, they fall as whole pieces.)

## The checks (`src/art/boss_checks.ts`; the art rulebook, How art is made 7)

`FM_SHAPE` says what he is to the review: his outside as painted (his legs drawn up inside his robe, his
sleeves, his hood as painted round his head, his trunk in the barrel of his robe, its skirt down to its
hem); what he carries (his staff from its foot to its head, the skull at its head; his right forearm may lie
on the staff where his fist is round it); the end he strikes with (the skull, which will spit his bone
shards). His mantle is worn over his arms, as the Headsman's cape is, so it is not among the solids his arms
keep out of; his staff passes outside it (tested on its own).

- **Every move of his through every check** (tests/fleshmancer.test.ts 2): his glide (the loop closing too),
  into it by setting off and out of it by stopping, struck, and his death as FM_SHAPE_UNDER has it; nothing
  found.
- **His four attacks through every check**, as his stand below: every frame of each at 30 a second, from in
  front and from behind, from every frame of his stand into each and from each back into his stand: nothing
  found. The end he strikes with is the skull (the shards; the BLOW review: drawn right back, held, carried
  through; his hips first, then his chest, then the skull), and for the rings his casting hand, slammed down
  at the floor. His staff is swung in a plane at his right side, its head leaning in over him and its foot
  out, clear of his arm, when it is raised (`swungStaff`).
- **His stand through every check** (`checkBoss(FLESHMANCER, FM_SHAPE, FM_MADE)`): all 37 frames (the loop and
  its first again, to close it), from in front and from behind as the camera truly sees him: nothing found.
  SLIDE (nothing of him touches the floor), FLOOR, ARM, THROUGH, JERK (the loop closing too), ALIVE, and
  JUMP: from every frame of his stand into his rest pose, where each of his moves to come will begin. The
  margins: his arms keep 0.3 clear of his body; his staff well clear; the fastest any point of him moves is
  5.5 of the game's pixels a frame (his hand, in the throw, eased in and out); the most the picture leaps
  from his stand into his rest pose is 2.4 (the limit is 3), and what he carries no more than the limit for
  it (his staff is held from his shoulder along his body, not his chest, so that his twist into the throw does
  not swing it).
- **The review catches what it should on him:** a leap planted in his casting hand (one key moved 14) is found
  at once ("jerk handL turns straight back at speed").
- `tests/fleshmancer.test.ts` (10): 1, the switch is off and nothing of the game imports him; 2, his stand
  through every check, as above; 3, his stand paints in every frame both ways round: nothing cyan and no
  light that is not the enemy's, his pink edge round him, every pixel whole or empty but the edge; 4, human
  sized: a man a head taller than the knight, the top of his hood 66 to 68 up at rest, and his own height
  (less what his float lifts him) never more than the knight's and a head in any frame; the skull above his
  hood; the staff's foot off the floor; 5, he floats: the lowest of his tails more than 8 off the floor in
  every frame (four of the game's pixels), nothing of his body near the floor, and he rises and sinks by 4 to
  6 of the game's pixels; 6, his staff in his right hand from in front and from behind, and outside his
  mantle; 7, the gout leaves his hand, is thrown more than 40 out across the floor, comes down in front of him
  (toward you, from in front), passes through nothing of him and bursts more than 14 of the game's pixels
  across the picture from him from in front and from behind; 8, his light never grows by more than two fifths
  from one frame to the next, either way round; 9, the skull about his hood's width; 10, no lone pixel in any
  frame either way round (with his pink edge round it, a pixel alone is a cross); and for his attacks (15 in
  all now): 11, every frame of all four paints both ways round, nothing cyan, his edge round him, no lone
  pixel; 12, the shards: the skull more than 15 behind him held back, more than 30 before him as it spits, its
  jaws wide, its jaws further on and lower in the picture; 13, the rings: his claw comes down more than 40,
  the staff's foot within 9 of the floor as it strikes, and each kind of hand paints, stands up high and has
  less than a third of itself left in its last frame; 14, raising the dead: both hands over his hood while
  they come up, the skull's jaws open; 15, the fire: the skull more than 25 over his hood while it pours, its
  jaws open, and the stream round once; 16, his glide: no foot near the floor, his tails more than 4 off it, and
  he leans into his way in every frame; 17, his death: the pit opens and closes, his hood is under while the
  skull is still up, then the skull goes under, no lone pixel in any frame, and fewer than 60 pixels of him in
  the last (17 in all). `tests/new_mobs3.test.ts` and `tests/bosses.test.ts` (12) let
  `art/fleshmancer.ts`, a mock-up of their kind, import the other mock-ups.
- The whole unit suite passes on the branch, 878 of 878 with every move of his (`tests/new_mobs3.test.ts` and
  `tests/bosses.test.ts` now know `art/fm_spells.ts` for a mock-up too); `tsc` is clean.
- Painting a frame of his stand takes about 14 ms on this machine (the Headsman's, 22).

## The pictures (kept out of git; the art chat has them)

- `sheet.png` (`sheet:3`): standing, facing you and facing away, beside the knight standing and ready to
  fight; under them, at half the size, beside a cultist, the high priest, a Shade and the Headsman.
- `closeup.png` (`close:8`): him alone, big, both ways round.
- `stand.gif` (`stand:3`, `tools/page_gif.mjs`): his stand twice round, both ways round, at its own ten frames
  a second; `stand_contact_front.png` and `stand_contact_back.png`: one round of it, every frame;
  `stand_frames.png` (`poses:0,1.2,1.7,1.95,2.05,2.15,2.25,2.35,2.5,2.7,3,3.3:3`): twelve moments of it.
- `floor4_phone.png`, `floor4_phone_charge.png` and `floor4_phone_burst.png` (`floor:2.5:0`, `floor:2.5:1.9`,
  `floor:2.5:2.8`): him in a room of the Crypt's fourth floor (`CRYPT_FLOORS[3]`, its rocks and the miners'
  rusted gear lying about), the knight come in, at the game's own size and in the game's own dark as
  `render.ts` lays it (the far floor 0.88 dark, the pools round the hero and the boss, a hole for every light
  he gives off, the vignette, then what glows), as a phone of 844 by 390 points shows it at three device
  pixels to a point: at rest, gathering the fire, and as it bursts; `*_1x.png` the same at one pixel to a
  point; `floor4_phone_him.png`: the three of him cut out at the phone's own pixels, not enlarged;
  `floor4_phone_1x_him_x2.png`: the three of him at one pixel to a point, doubled. The floor
  is on the floors' branches and not on this one: these were made on a copy of this branch with
  `mockup/floor3-4`'s (8ca2ec0) `src/art/ground.ts`, `crypt.ts` and `crypt_ways.ts` laid in and
  `src/dev/fm_floor.ts` made to name `CRYPT_FLOORS[3]` (its comment says how). On this branch alone the page
  puts him on the vault's floor.

- THE ATTACKS' PICTURES, for him (`scratchpad/flesh/atk/`): `him.png` (`floor:2:0.3`, him in a room of the
  Crypt's fourth floor at the game's size, doubled) and `him_x2.png` (him and the knight, doubled again);
  `shards.gif`, `rings.gif`, `raise.gif`, `fire.gif` (`film:<attack>:4`, `tools/page_gif.mjs`: him standing a
  moment, the attack, and standing again, what he sends out where the game would put it, the knight come in,
  at four screen pixels to a game pixel, 30 frames a second), made on the same copy with floor 4's floor; and
  `glide.gif` (`film:glide:4`: setting off, gliding 2 s, stopping), `reel.gif` (`film:reel:4`: struck twice),
  `death.gif` (`film:death:4`). The page "Fleshmancer Attacks" has them all as films.

## For the main chat

- HIS GLIDE AND HIS DEATH, with his yes: `FLESHMANCER.walk` (at `walkFpsAt` for another pace), into it by
  `more.setOff` and out of it by `more.halt` (both carried along at his pace, as the other bosses' are), struck
  (`reel`), his death (`dying`: the die clip of `makeFleshmancerArt3()`); `FM_SHAPE.handovers` say which move
  hands over to which. His death leaves nothing where he fell: floor 5 ends in the mine shaft, not a stairwell.
- HIS ATTACKS, with his yes: `FLESHMANCER.attack` (the shards) and `FLESHMANCER.more` (`rings`, `raise`,
  `fire`), each from his rest pose and back, handing over from any frame of his stand (the checks hold them);
  `makeFleshmancerArt3()` has them as clips (`clips.attack`, `clips.moves`). Their moments are `FM_SHARDS`,
  `FM_RINGS`, `FM_RAISE`, `FM_FIRE`; where the skull's jaws are (where the shards leave and the fire pours
  from) is `fmMouthAt(move, t, view)`, and the skull itself `fmSkullAt(move, t)`; the fire's way round is
  `fmFireTurn(t)`. What he sends out is `src/art/fm_spells.ts` (its head says what each is), drawn in the
  game's own pixels given `FloorAt`; the hands are `makeRingHandArt(view, kind)` (three kinds). The numbers
  in `FM_SHARD`, `FM_RINGS_LAID`, `FM_WAVE_SPEED`, `FM_FIRE_REACH` are the films', for the pictures: how many,
  how far and how fast in the fight are yours. Raising the dead is the game's skeleton's own die clip played
  backwards (its frames reversed), with `drawRaiseGlow` on its heap; it ends on the skeleton's stand. The
  screen's kick: the spit, the slam and the shriek are the attacks' blows (Animations 1).
- His canvas, his pool of light (`aura`, pink, 80 round) and the shadow the dev page gives him (8) are on
  `FLESHMANCER`. In the game a monster's shadow is the engine's soft oval sized by its radius
  (`render.ts`, `shadow`): for him the smaller and darker it is, the better his float reads. The pictures
  draw it as the engine does, small.
- The gout of fire in his stand is his look only (it does no harm): his spells and what they do are the
  main chat's.

## Next

Nothing more of him unless the owner asks: he goes to the main chat whole. Next in the art chat: floor 5.

## His teleport (17 Oct)

His words to the main chat, 17 Oct, 11:37 (Eastern), after playing Version 22.0, sent to the art chat at his word:
"The fleshmancer needs a teleport to move around the arena." Asked in the art chat how he should go and come back,
his pick by 15:55 (Eastern): "Dragged down, pushed up (Recommended)", offered as: his own dead pull him down into a
pit of his fire and push him up out of another across the arena, as in his death but quick.

Two moves on `FLESHMANCER.more` (`src/art/fleshmancer.ts`), as the game holds his moves (`clips.moves.sink`,
`clips.moves.rise`, 30 frames a second): he GOES where he stands, and COMES BACK where the game has moved him;
between them he is nowhere (draw nothing of him, no shadow and no pool of light).

- `sink`, his going, `FM_SINK.long` 1.0 s: he rears, flinging his claw up blazing and his staff over his head, the
  skull roaring (the warning, to `FM_SINK.grab` 0.24); the floor bursts open under him into a pit of his fire (from
  0.08) and the hands of his dead burst up out of it, seize his robe and YANK him down (0.24); hauled under fast,
  glaring at you, his hood under by 0.52, the skull last (0.62 to 0.7) with its fire bursting up in sparks; nothing
  of him above the floor from `FM_SINK.gone` 0.72; the pit closes (0.78 to 0.96). Its last frame has nothing of him.
- `rise`, his coming back, `FM_RISE.long` 1.2 s: the pit bursts open where he comes up, the skull's fire spurting up
  first (0 to `FM_RISE.up` 0.2: nothing of him yet, the warning); the hands thrust up out of it holding him and PUSH
  him up, skull first, then his hood, his claw blazing (up by `FM_RISE.out` 0.58, a little higher than he floats);
  they let go and sink back (from 0.62); he settles, his staff swung down before him, and ends as his stand begins
  (1.2); the pit closes (0.8 to 0.95).
- `fmTeleportPitAt(sink, t)`: how wide the pit is (his own lengths); `FM_SINKING`, `FM_RISING`: their `prop`s.
- His painter: the pit and hands of his death are now `pitBits`, shared by his death and his teleport (his death
  paints exactly as before: every frame of it and of his other moves checked the same to the pixel against main);
  for the teleport only, motes of a part going under are cleared just over the floor, so that none is left alone.
- Film: `node tools/page_gif.mjs src/dev/preview_fleshmancer.ts "film:teleport:3" shots/fm_teleport.gif`.
- Asked as a pop-up, "The Fleshmancer's teleport (fm_teleport.gif): dragged down by his dead, pushed back up across
  the arena. Is it right?", his answer by 16:23 (Eastern; 13:23 where he is): "Yes, send it to main
  (Recommended)", offered as: it goes to the main chat, which decides when and where he teleports in his fight.
- Checks: tests/fleshmancer.test.ts 18 of 18: both through every boss check (as his death, dragged through the
  floor: `FM_SHAPE_UNDER`), his stand into `sink` and `rise` into his stand (`FM_SHAPE.handovers`); test 18: the
  pit opens and closes, he rears before he is pulled, his hood under before the skull, nothing of him at the end of
  going or the start of coming back, the skull up before his hood, he ends floating as he stands, no lone pixel in
  any frame of either, both as the game holds them.
