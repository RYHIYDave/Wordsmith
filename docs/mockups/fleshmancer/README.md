# Mock-up: THE FLESHMANCER, the Crypt's lair boss on floor 5 (NOT IN THE GAME)

**What it is.** The lair boss of the first set of five floors, the Crypt, drawn as the other three bosses
were (`docs/mockups/bosses/README.md`): on the heroes' bones, every move through every boss check (his art
rulebook, How art is made 7), pictures to him first. Nothing of the game imports it. His fight's rules
(what each spell does, when he casts it, what he drops) are the main chat's.

**State of this branch (`mockup/fleshmancer`):** from `mockup/bosses` at 28f7368 (the Headsman, the
Chained One and the amalgamation with the bone beast, as they went to the main chat). Made by THE ART
CHAT, from 11 Oct 2026. His brief, and HIS LOOK (his standing loop), for his yes; his moves come after.
His look was drawn once (8d4b104) and REMADE after a fresh look at it (the second drawing, below): at a
phone's size the first read as a hooded torch-bearer, a monk with a lamp on a pole.

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
standing loop was a glow switching on. So the second drawing changes, point by point:

- **The skull** is the head of his staff and the second thing he is known by: 17 of the picture's pixels
  across (his hood is about 15), warm ivory, painted pixel by pixel so that it reads at a phone's size: a
  broad low cranium, a heavy brow coming down over two deep sockets that slant in toward the nose (a scowl,
  not round), the notch of the nose, a broken row of upper teeth, and the jaw hanging open below them on its
  hinges with a few teeth left in it. The fire burns OUT OF ITS SOCKETS (a tongue licking up out of each and
  back over the temple) and IN ITS OPEN MOUTH (pink, gold at the heart), and a lower flame burns up from
  behind its crown, never taller than the skull. It looks at you whichever way he faces. Its light is over
  its crown, so the bone stays ivory. (A hand of fused bone gripping it was tried in a first pass at this
  drawing; at this size its fingers muddled the skull's face, so the skull rests on the staff's head.)
- **The staff** is bone, not a pole: warm ivory (`STAFF_BONE`), nine bones of uneven lengths fused end to
  end, each thinner in its middle than at its knuckles, five spurs grown out of it, away from him and hooked
  upward, and a crook out near its head; 60 long, held 28 up it, out at his right side and leaning out, so
  that he is wide.
- **His hands** are the heart of him ("hands of power"). Both are painted pixel by pixel. His casting hand
  (his left) is a claw half as big again as a man's hand: a bony wrist out of a sleeve pushed back to the
  elbow (its pink lining showing), a narrow palm, four long bone-pale fingers and a thumb splayed wide, each
  of three bones, their last two pixels burning pink to gold; the fire held in the claw shows between the
  fingers (they are in front of it) and its flames rise between them. No sparkle. His staff hand is long
  fingers wrapped across the bone one above another, their tips lit on its far side.
- **The bead trim is gone.** In its place a broad band of his cult's pink edged with gold (a scapular) hangs
  from under his hood down his front to his hem, and down his back; and the edge of his mantle is banded pink
  and gold all round.
- **The hood** is deep and round (no point), and the face in it is painted pixel by pixel where it faces the
  way he looks: a hard rim round the opening, gold at its edge and pink lit brighter on its inside, the
  opening pitch black, and in it his eyes: two upright slits of fire, low and close together (the
  cultists', the Shade's and the Headsman's eyes are slanting slashes). When he flares only the rim and his
  eyes blaze; the dark of his face stays black.
- **Rank in his silhouette:** a broad, stiff mantle over his shoulders, tapering to a narrow hem; behind his
  hood a high collar stiffened with nine stays of bone that rise past it, uneven and jagged (a dark crown of
  bone), the collar's cloth ragged between them.
- **The colours:** a robe of near-black plum (`FM_ROBE`), his mantle the same raised to his cult's magenta
  (`FM_MANTLE`), the pink and gold bands, the pink lining in his sleeves and where his tails curl up, and his
  own pink light: the skull's, his hand's, and a pool of it on the floor under him.
- **The float:** no feet and no flat hem. His robe ends 19.5 off the floor at rest in tattered tails, short
  before him and longer behind, each hanging and then curling out and up, rippling (his train lifts behind
  him; it never drags); the lowest of them is 10 to 17 off the floor through his stand (five to eight of the
  game's pixels), with a pool of his pink light on the floor under him and embers dripping into it off the
  tails. He rises and sinks on nothing by 4.75 of the game's pixels.
- **His size.** Human sized (his words: "Hes human sized"): his body is 50.5 tall (the knight's 58) and he
  floats 5 off the floor (`FM_FLOAT`), so the top of his hood is 58 to 67.5 up through his stand: the
  knight's height at the bottom of his bob, never a head over it (the knight's head is 9.8). The staff and
  its skull rise above him (the skull's middle 77 to 85 up). His canvas is 320 by 300, the floor point at
  (160, 228) (`FM_CANVAS`): room for the staff and for the fire he flings out to his side.
- **Nothing gory** ("Nothing gory (Recommended)"). Bone, robe and pink fire only.
- **What glows on him is the enemy's**, and nothing else glows: his eyes, his fingertips and the fire in his
  hand, the skull's fire, the embers, the fire he flings (`FLAME`, pink burning to gold). Nothing on him is
  cyan.
- **Apart from the others hooded** (the sheet's second row): the cultists are bright violet with pointed
  cowls and candles; their high priest the same with an ivory mask; the Shade small and grey; the Headsman
  twice his size, red-hooded, dark. The fleshmancer alone has the ivory skull with fire in its eyes, the
  crown of bone, the gold-rimmed face, and the burning claw.

**His stand** (`stand`, 36 frames at 10 a second: 3.6 s round; the art rulebook, Movement 6, "Alive when
still", and Animations 1, "as big and wild and kinetic and weighty as possible"): he floats, rising and
sinking slowly on nothing, swaying, unnaturally smooth; his hem, his tails, his sleeves and his mantle's edge
ripple throughout; his hood turns as he looks about the hall; the skull's fire burns and the fire in his claw.
HIS HABIT, once round:

- ANTICIPATION (1.0 to 1.9 s): he rises, his hood tilting back and his staff leaning out, and draws the fire
  down out of the skull (its flames sink to embers, a stream of pink sparks running from it to his hand) into
  his claw, which he brings before his chest, where it is seen, the fire swelling in it.
- THE SNAP (1.9 to 2.35 s): his arm whips out to his left side, the claw thrown open; his body recoils down
  and back and his tails and sleeves kick out; A GOUT OF FIRE LEAVES HIS HAND (2.08 s), arcs out beside him
  trailing sparks, and bursts on the floor (2.5 s), standing up off it in a burst of flame and a ring of
  embers that die away by 3.1 s. The skull flares a beat after the snap, its jaw dropping, its fire roaring up
  over two or three frames; his eyes and his hood's rim blaze, his face stays black.
- Then he settles, and the fire in his claw kindles again. From behind, the gout arcs out and bursts beside
  him on the other side, and his claw shows over his shoulder.
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
  margins: his arms keep 0.4 clear of his body; his staff well clear; the fastest any point of him moves is
  5.2 of the game's pixels a frame (his hand, in the snap, eased in and out); the most the picture leaps from
  his stand into his rest pose is 2.5 (the limit is 3).
- **The review catches what it should on him:** a leap planted in his casting hand (one key moved 14) is found
  at once ("jerk handL turns straight back at speed").
- `tests/fleshmancer.test.ts` (9): 1, the switch is off and nothing of the game imports him; 2, his stand
  through every check, as above; 3, his stand paints in every frame both ways round: nothing cyan and no
  light that is not the enemy's, his pink edge round him, every pixel whole or empty but the edge; 4, human
  sized: the top of his hood above the knight's height less 4 and no more than a head over it, the skull
  above his hood, the staff's foot off the floor, in every frame; 5, he floats: the lowest of his tails more
  than 8 off the floor in every frame (four of the game's pixels), nothing of his body near the floor, and he
  rises and sinks by 4 to 6 of the game's pixels; 6, his staff in his right hand from in front and from
  behind, and outside his mantle; 7, the gout leaves his hand, arcs, passes through nothing of him and bursts
  on the floor beside him, more than 14 of the game's pixels across the picture from him from in front and
  from behind; 8, his light never grows by more than two fifths from one frame to the next, either way
  round; 9, the skull is wider than his hood. `tests/new_mobs3.test.ts` and `tests/bosses.test.ts` (12) let
  `art/fleshmancer.ts`, a mock-up of their kind, import the other mock-ups.
- The whole unit suite passes on the branch; `tsc` is clean.
- Painting a frame of his stand takes about 15 ms on this machine (the Headsman's, 20).

## The pictures (kept out of git; the art chat has them)

- `sheet.png` (`sheet:3`): standing, facing you and facing away, beside the knight standing and ready to
  fight; under them, at half the size, beside a cultist, the high priest, a Shade and the Headsman.
- `closeup.png` (`close:8`): him alone, big, both ways round.
- `stand.gif` (`stand:3`, `tools/page_gif.mjs`): his stand twice round, both ways round, at its own ten frames
  a second; `stand_contact_front.png` and `stand_contact_back.png`: one round of it, every frame;
  `stand_frames.png` (`poses:0,1.2,1.7,2,2.1,2.2,2.3,2.4,2.5,2.7,3:3`): eleven moments of it.
- `floor4_phone.png`, `floor4_phone_charge.png` and `floor4_phone_burst.png` (`floor:2.5:0`, `floor:2.5:1.8`,
  `floor:2.5:2.7`): him in a room of the Crypt's fourth floor (`CRYPT_FLOORS[3]`, its rocks and the miners'
  rusted gear lying about), the knight come in, at the game's own size and in the game's own dark as
  `render.ts` lays it (the far floor 0.88 dark, the pools round the hero and the boss, a hole for every light
  he gives off, the vignette, then what glows), as a phone of 844 by 390 points shows it at three device
  pixels to a point: at rest, gathering the fire, and as it bursts; `*_1x.png` the same at one pixel to a
  point; `floor4_phone_him.png`: the three of him cut out at the phone's own pixels, not enlarged. The floor
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
