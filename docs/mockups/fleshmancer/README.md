# Mock-up: THE FLESHMANCER, the Crypt's lair boss on floor 5 (NOT IN THE GAME)

**What it is.** The lair boss of the first set of five floors, the Crypt, drawn as the other three bosses
were (`docs/mockups/bosses/README.md`): on the heroes' bones, every move through every boss check (his art
rulebook, How art is made 7), pictures to him first. Nothing of the game imports it. His fight's rules
(what each spell does, when he casts it, what he drops) are the main chat's.

**State of this branch (`mockup/fleshmancer`):** from `mockup/bosses` at 28f7368 (the Headsman, the
Chained One and the amalgamation with the bone beast, as they went to the main chat). Made by THE ART
CHAT, from 11 Oct 2026. His brief, and HIS LOOK (his standing loop), for his yes; his moves come after.

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

## What he is (his look; the art chat, 11 Oct)

Nothing of the game makes him: `src/art/fleshmancer.ts` (`FLESHMANCER`, his switch `FLESHMANCER_SWITCH`,
off), `src/dev/preview_fleshmancer.ts` and `src/dev/fm_floor.ts` (the dev page and the floor it puts him
on) are imported by nothing of the game. He is a `Mob` as the other bosses are (`src/art/new_mobs3.ts`):
posed on the heroes' bones, dressed in the heroes' solids, lit from the upper left, the enemy's pink edge
round him while he lives; a canvas of his own; seen from behind as the camera truly sees him (`trueBack`,
as the Headsman: his staff stays in his right hand).

- **His size.** Human sized (his words: "Hes human sized"): his body is 50.5 tall (the knight's 58) and he
  floats 8 off the floor (`FM_FLOAT`), so the top of his hood is 64.8 up at rest (62.8 to 66.2 through his
  stand): about the knight's height, a little over it, never a head over it (the knight's head is 9.8). The
  staff and its skull rise well above him: the skull's middle 82 up, its fire to about 100. His canvas is
  300 by 300, the floor point at (150, 228) (`FM_CANVAS`): room for the staff raised high over him and
  swung round him, for the moves to come.
- **A hooded priest** ("Hooded priest, hands of power"). A long robe of a black so dark it is nearly plum
  (`FM_ROBE`: #110b19, #2c1f37, #4a3757), and over his shoulders a mantle of it that rises into A DEEP,
  ROUNDED HOOD: no point to it, its brow drawn forward, the dark inside it deep, and in that dark two slits of
  pink, slanting down toward each other, his eyes, and nothing else. Along the mantle's rounded edge, round
  the front of him, the small bones of the dead strung as a trim (a curve of little bones: no straight bar
  anywhere on him to cross another).
- **Hands of power.** His arms come out of wide bell sleeves as bare, pallid forearms, and his LONG BONY
  FINGERS GLOW: pallid at the root, the glow coming up through the bone, hot pink burning to gold at their
  tips. His right hand holds the staff, its knuckles smouldering pink. His left is his casting hand, held out
  before him palm up, its five fingers cupped like a claw round a flame of the enemy's fire in his palm, a
  lick of it off each fingertip. Its light is big enough for the game to let it light the floor round him
  through the dark (`render.ts`, `MONSTER_LIGHT_MIN`).
- **A staff topped with a skull** ("A staff topped with a skull"). Taller than he is (74 to the top of the
  shaft, held 36.5 up it): two long bones grown together and twisted, knuckled along their length like a
  spine (each knuckle its own size and turned its own way), a knob of bone at its foot; at its head three
  curved prongs of bone, at the skull's sides and behind it so that its face is seen, curl in over a SKULL
  WITH THE PINK FIRE BURNING IN ITS SOCKETS AND UP OFF ITS CROWN, pink burning to gold. The skull looks
  where he looks. Its bone (`SKULL_BONE`) is a step darker than the heroes' bone, so that its fire is the
  brightest thing about him.
- **He glides, feet just off the floor** ("Glides, feet just off the floor (Recommended)"). His bare, bony,
  pallid feet hang below his hem, toes down, 5.5 to 6.5 off the floor (under three of the game's pixels).
  The front and sides of his robe hang level, 12.5 off the floor (`FM_HEM_UP`), so that the floor and his
  shadow show under him; only its back falls to the floor and trails behind him in a train. The staff floats
  with him, its foot off the floor.
- **Nothing gory** ("Nothing gory (Recommended)"). Bone, robe and pink fire only: no blood, no open flesh.
- **The colours.** What glows on him is the enemy's, and nothing else glows: his eyes (#ff4f8a), his fingers
  and the flame in his hand, the skull's fire (the enemy's fire, `FLAME`, pink burning to gold). Nothing on
  him is cyan. His robe and mantle are a step quieter, so that on a dark floor his fire and his eyes are
  what is seen first.
- **Apart from the others hooded** (the sheet's second row): the cultists are bright violet, pointed cowls,
  a pink stole; their high priest the same with an ivory mask and a censer on a dark staff; the Shade is
  small, grey-violet, ragged, with claws; the Headsman twice his size, his hood red and pointed and empty.
  The fleshmancer alone is near-black, round-hooded, bone-handed and carries the burning skull.
- **What reads as what, and what is still to be seen to by fresh eyes:** at the game's size his feet are a
  couple of pale pixels under his hem (the float reads by the floor showing under the front of his robe more
  than by the feet); his casting hand is a pink-gold glow with spikes of finger (the fingers read as fingers
  in the close-up); the trim reads as a string of beads; from behind, his casting hand is hidden in front of
  him, and when it bursts its fire shows beside the staff, by his staff hand.

**His stand** (`stand`, 30 frames at 10 a second: 3 s round; the art rulebook, Movement 6, "Alive when
still", and Animations 1, "as big and wild and kinetic and weighty as possible"): he floats, rising and
sinking slowly on nothing (3.6 up and down), swaying from side to side, unnaturally smooth; his robe's hem
ripples, its train creeps and sways on the floor, his mantle's edge and his sleeves stir; his hood turns
slowly as he looks about the hall; the skull's fire flickers and the flame in his palm with it, his fingers
kneading the air over it. HIS HABIT, once round: from 0.8 s he draws his casting hand in and up to his chest,
hunching over it, his fingers closing over the flame, which swells between them; at 1.6 s he flings it out
and down before him, the fingers springing open; the fire bursts up out of his palm and off his fingertips,
the skull's fire roars up, his eyes flare, his body is jolted up and back and his robe and sleeves blown out
(the brief's "sudden lurch when he casts", in small); by 2.75 s it has died down and he settles. The
numbers his painter reads besides the bones: `draw` (his casting fingers curled, 0 to 1), `pt` (the power in
his hands flaring), `gale` (his robe blown out), `out` (the light going out of him).

**His other moves are not made yet.** His walk (the glide), his blow, struck and his death are held
placeholders, his rest pose still (`FM_REST`), so that the game's shape for a monster is whole; they are not
reviewed, and they are not to be put in. `FM_MADE` lists the moves made: his stand.

## The checks (`src/art/boss_checks.ts`; the art rulebook, How art is made 7)

`FM_SHAPE` says what he is to the review: his outside as painted (his legs inside his robe, his sleeves,
his hood exactly as painted round his head, his trunk in the barrel of his robe, its skirt to his knees and
its hem below them, as wide as the hem flares); what he carries (his staff from its foot to the top of its
shaft, the skull at its head; his right forearm may lie on the staff where his fist is round it); the end he
strikes with (the skull, which will spit his bone shards). His mantle is worn over his arms, as the
Headsman's cape is, so it is not among the solids his arms keep out of; his staff passes outside it (tested
on its own).

- **His stand through every check** (`checkBoss(FLESHMANCER, FM_SHAPE, FM_MADE)`): all 31 frames (the loop and
  its first again, to close it), from in front and from behind as the camera truly sees him: nothing found.
  SLIDE (his feet never touch the floor: nothing to slide), FLOOR, ARM, THROUGH, JERK (the loop closing too),
  ALIVE, and JUMP: from every frame of his stand into his rest pose, where each of his moves to come will
  begin. The margins: his arms keep 1.1 clear of his body; his staff 1.3 clear of his robe's hem, and its
  middle 1.5 outside his mantle; the fastest any point of him moves is 2.8 of the game's pixels a frame; the
  most the picture leaps from his stand into his rest pose is 1.0 (the limit is 3).
- **The review catches what it should on him:** a leap planted in his casting hand (one key moved 14) is found
  at once ("jerk handL turns straight back at speed").
- `tests/fleshmancer.test.ts` (6): 1, the switch is off and nothing of the game imports him; 2, his stand
  through every check, as above; 3, his stand paints in every frame both ways round: nothing cyan and no
  light that is not the enemy's, his pink edge round him, every pixel whole or empty but the edge; 4, human
  sized: the top of his hood above the knight's height less 4 and no more than a head over it, the skull
  above his hood, the staff's foot off the floor, in every frame; 5, he floats: his toes off the floor by no
  more than a hand, hanging toes down, the front of his hem above them, in every frame; 6, his staff in his
  right hand from in front and from behind, and outside his mantle. `tests/new_mobs3.test.ts` and
  `tests/bosses.test.ts` (12) now let `art/fleshmancer.ts`, a mock-up of their kind, import the other mock-ups.
- The whole unit suite passes on the branch; `tsc` is clean.
- Painting a frame of his stand takes about 11 ms on this machine (the Headsman's, 20).

## The pictures (`previews/fleshmancer/`, kept out of git; the art chat has them)

- `sheet.png` (`sheet:3`): standing, facing you and facing away, beside the knight standing and ready to
  fight; under them, at half the size, beside a cultist, the high priest, a Shade and the Headsman.
- `closeup.png` (`close:8`): him alone, big, both ways round.
- `stand.gif` (`stand:4`, `tools/page_gif.mjs`): his stand twice round, both ways round, at its own ten frames
  a second; `stand_contact.png`: one round of it, every frame, each facing you and facing away;
  `stand_frames.png` (`poses:...`): seven moments of it.
- `floor4_phone.png` and `floor4_phone_burst.png` (`floor:2.5:0`, `floor:2.5:1.9`): him in a room of the
  Crypt's fourth floor (`CRYPT_FLOORS[3]`, its rocks and the miners' rusted gear lying about), the knight
  come in, at the game's own size and in the game's own dark as `render.ts` lays it (the far floor 0.88
  dark, the pools round the hero and the boss, a hole for every light he gives off, the vignette, then what
  glows), as a phone of 844 by 390 points shows it at three device pixels to a point; at rest, and at his
  burst. `*_crop.png`: the two of them cut out of those, not enlarged. The floor is on the floors' branches
  and not on this one: these two were made on a copy of this branch with `mockup/floor3-4`'s (8ca2ec0)
  `src/art/ground.ts`, `crypt.ts` and `crypt_ways.ts` laid in and `src/dev/fm_floor.ts` made to name
  `CRYPT_FLOORS[3]` (its comment says how). On this branch alone the page puts him on the vault's floor.

## For the main chat

- Nothing to put in yet: this is his look, for his yes. When his moves are made, each will begin and end in
  his rest pose (`FM_REST`), or hand over from any frame of his stand, as the checks hold them.
- His canvas, his pool of light (`aura`, pink, 78 round) and his shadow (17) are on `FLESHMANCER`.

## Next

His look to him first (the sheet, the close-up, his stand, him on the Crypt's floor). Then his glide, his
attacks and his death as films; every move through the boss checks; pictures to him first.
