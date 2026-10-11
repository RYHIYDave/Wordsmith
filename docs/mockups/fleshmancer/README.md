# Mock-up: THE FLESHMANCER, the Crypt's lair boss on floor 5 (NOT IN THE GAME)

**What it is.** The lair boss of the first set of five floors, the Crypt, drawn as the other three bosses
were (`docs/mockups/bosses/README.md`): on the heroes' bones, every move through every boss check (his art
rulebook, How art is made 7), pictures to him first. Nothing of the game imports it. His fight's rules
(what each spell does, when he casts it, what he drops) are the main chat's.

**State of this branch (`mockup/fleshmancer`):** from `mockup/bosses` at 28f7368 (the Headsman, the
Chained One and the amalgamation with the bone beast, as they went to the main chat). Made by THE ART
CHAT, from 11 Oct 2026. His brief, and HIS LOOK (his standing loop), WITH HIS YES (by 12:28, below); his moves come next.
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
  frame either way round (with his pink edge round it, a pixel alone is a cross). `tests/new_mobs3.test.ts` and `tests/bosses.test.ts` (12) let
  `art/fleshmancer.ts`, a mock-up of their kind, import the other mock-ups.
- The whole unit suite passes on the branch; `tsc` is clean.
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

## For the main chat

- Nothing to put in yet: this is his look, for his yes. When his moves are made, each will begin and end in
  his rest pose (`FM_REST`), or hand over from any frame of his stand, as the checks hold them.
- His canvas, his pool of light (`aura`, pink, 80 round) and the shadow the dev page gives him (8) are on
  `FLESHMANCER`. In the game a monster's shadow is the engine's soft oval sized by its radius
  (`render.ts`, `shadow`): for him the smaller and darker it is, the better his float reads. The pictures
  draw it as the engine does, small.
- The gout of fire in his stand is his look only (it does no harm): his spells and what they do are the
  main chat's.

## Next

His look to him first (the sheet, the close-up, his stand, him on the Crypt's floor). Then his glide, his
attacks and his death as films; every move through the boss checks; pictures to him first.
