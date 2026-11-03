# Floor 17, the Masque: its boss, the Prince (mock-ups; branch `mockup/prince`)

A helper of the art chat made this, from `origin/mockup/swan-gardens` (55945b3). Nothing here is in the game until the main
chat puts it there, on his yes. Nothing of the game imports any of it, and it is behind a switch that is off (`PRINCE_ON`,
`src/art/prince.ts`).

His floor, THE MASQUE: the prince's masked ball, gone on for weeks, in a suite of seven rooms each in its own colour (blue,
purple, green, orange, white, violet, and a black one lit red through its windows), from Poe's "The Masque of the Red Death"
(1842), drawn only from the book. His story: the prince opened the city to the Silent Order in return for his walls, shut
the poor out and kept dancing while the city below went quiet. The Princess's last words when she falls (floor 16): “Stop
the dancing.”

## His brief, as he picked it

Offered to him as a pop-up ("You said “like the prince with a rapier, dancing is going to need to be fast and constantly
moving”. Is this his brief?"), his pick: “Yes, this brief (Recommended)”. The brief as offered:

> THE PRINCE (floor 17 boss, the Black Room). Look: a tall young man in a long velvet coat and a smiling gilt mask, with a
> rapier. Size: a head taller than the knight. Move: fast and never still. He dances the whole fight, darting, spinning,
> lunging across the room. Mark: the smiling gilt mask. Moves: a rapier thrust (basic); the Dance, a ring of masked partners
> closing round you as he waltzes past; Masks, smiling masks flung spinning across the room; Midnight, the great clock
> striking twelve, each chime a ring rolling out to dodge. Each phase the clock strikes faster. Death: his mask cracks;
> under it, only the Hush's grey fog, which drains away up the stairs. Never: not a jester or clown, not gory. Sound: the
> clock, the music, his boots; no voice.

His words that shaped him from the first pass (28 Oct, of the Princess's first moves): “It’s all too slow and too narrow and
too small.  I could dodge anything you’ve put in these moves with my eyes closed”; “Everything is always so plodding when you
first animate them.  I could tell you I want a cheetah boss and it would walk around like an old dog.”; “There are big bosses
that can be slow.  But like the prince with a rapier, dancing is going to need to be fast and constantly moving”. His rule
for every attack (Movement 9, 24 Oct): “Like the wind up and wind down are big but the actual punch is lightning quick”, and
of the enemies (28 Oct): “Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to
compensate for the extra time the player gets to evade”. And his rule 7: “I need all bosses ran through all checks from now
on.  These boss fights are important”.

## His look (`src/art/prince.ts`)

On the heroes' bones (`PRINCE_BODY`: 66 tall, the head 1.42 of life so the mask reads; broad in the shoulder, narrow in the
waist, long in the leg). His crown stands 71.3 high, the knight's 59.7: 11.6 taller, the knight's head 9.8 tall: a head
taller. The bonnet and plume add to it.

- A long coat of BLACK VELVET (`VELVET`, its sheen a deep violet, hue about 266), fitted to the waist and open down the front
  over a SCARLET waistcoat buttoned in gilt; its skirts to below the knee, SPLIT before and behind so that a stride or a
  lunge parts them, open at the front, lined scarlet, braided in gilt down their front edges; they swing after him and fly
  out round him as he turns. A scarlet sash knotted at his left hip, its two tails swinging. Deep turned-back scarlet cuffs
  edged in gilt; pale grey kid gloves. Scarlet breeches; tall black boots, their tops turned down. The scarlet is the black
  room's red light through its windows (`SCARLET`, hue 3 to 9: a red, never the enemy's pink). A lace jabot at his throat.
- HIS HEAD: a snug coif of black velvet, a soft velvet bonnet tilted over his right brow with a gilt band and a long scarlet
  plume curling back off it.
- HIS FACE IS THE MASK: a smiling gilt mask over the whole face (`maskSkin`), its smile fixed, too wide, its corners turned up
  hard into the cheeks; almond eye holes, and through them the dull pink of the Hush (the Hushed's own, `FLAME[1]`); the
  cheeks raised by the smile, a lit ridge down the nose, the brows arched. Drawn turned toward whoever looks, as the heroes'
  faces are, so both eyes and the whole smile show. Under it: nothing but the Hush's grey fog, which curls out of his collar
  a little all the while he lives.
- THE RAPIER (`rapierOf`): a long thin blade (46), its edge catching the light; a swept hilt of gilt, quillons, a knuckle
  bow and rings, a pommel.
- Nothing cyan anywhere; nothing of his own in the pinks (hues 300 to 350): only the enemy's edge and the Hush's eyes and
  glints. No jester's motley, no clown's face, nothing gory.

## His moves (`src/art/prince_moves.ts`) and their numbers

Sizes in tiles (`TILE3`); a boss arena is about 17 by 20. Frames at 30 a second unless said.

- HIS STAND, NEVER STILL (`stand`, 24 frames at 10 a second, 2.4 s round): up on the balls of his feet, his weight from foot
  to foot twice round, rising onto his toes at each step (2 high), four light steps to a round (each foot lifts 4.5, steps a
  little out or back, and comes down again); his body turning with it; the rapier's point going round before him with a
  flick; his left hand turning in the air as a dancer's; his mask turning to watch you.
- THE DANCE-STEP (his walk, `walk`, 12 frames at 30 a second, 0.4 s round, painted for `PC_PACE` 4.5 tiles a second; the
  Princess glides at 4; the knight runs at 4.6, `TUNE.heroSpeed`, so the game may show these frames faster, `walkFpsAt`, to
  have him outpace the knight): quick gliding steps on the balls of his feet, each foot down only 0.3 of the
  round and in the air between (a step every 0.2 s, almost a tile each), its heel flicked up behind; leaning hard into his
  way (11 and 5 degrees), chin up, his left arm swept back as a dancer's, the rapier low before him, its point leading; his
  coat and plume streaming back. Into it and out of it as the other bosses go: SETTING OFF (`setOff`, 0.2 s: a dip and a
  spring onto his right foot, into the walk's first frame) and CHECKING (`halt`, 0.3 s: from the walk's first frame, leaning
  back off his planted right foot, and light on his feet again). The game leaves the walk at the end of a round (its first
  frame), into `halt`.
- THE DART (`dart`, 0.8 s, a burst): a quick gather, then a turning leap, a whole turn in the air (13 high), his coat flung
  out round him, down onto the ball of his right foot and up. THE GAME CARRIES HIM `DART.carry` 4 tiles while he is in the air
  (`DART.air`, 0.17 to 0.6 s): 9.3 tiles a second.
- THE THRUST (his attack, `attack`, 2.0 s, `PC_THRUST`): a step into en garde (side-on, his right foot forward, his left hand
  raised behind him); COILED (0.45 to 0.77 s, held, trembling: the warning), sunk back onto his back leg and leaning away, the
  rapier drawn back past his right ear, its point straight at you, the light running down the blade to its point, pink; his
  left hand thrust out at you; his hips come round first (0.77 to 0.8 s); THE LUNGE in two frames (0.8 to 0.87 s, landing on
  the second, smeared: the blade's after-images and streaks along the way his head, shoulders, hips and knees came): he flies
  forward 2.35 tiles, his back leg flung out behind; the point flung 3.5 tiles in those two frames, 4.5 tiles out from where
  he stood; carried on to 4.6; held a breath; then back: a step and two skips with a flourish of the blade over his head, and
  his feet set as they were (2.0 s).
- THE DANCE (`dance`, 1.5 s, `PC_DANCE`): a deep courtly bow, his right foot drawn back, his left hand held out to you, the
  rapier swept out behind (held 0.45 to 0.77 s, the point glinting: the warning); his hips first; then up in two frames (0.8 to
  0.87 s, smeared) with the rapier whipped up over his head: THE RING OF PARTNERS RISES ROUND YOU (below). Then THE WALTZ
  (`waltz`, 1.6 s): away round the arena, turning and turning (two whole turns, eight steps), his arms held round nobody; the
  game carries him round his arc at `WALTZ.pace` 4 tiles a second.
- MASKS (`masks`, 1.85 s, `PC_MASKS`): his left hand into his coat at his breast draws out a fan of five smiling gilt masks;
  COILED (held 0.45 to 0.77 s): turned away to his left and leaning back, his left arm swept back and up behind him, the fan
  held high, the masks' eye holes glinting pink; the rapier out before him at you; his hips first; FLUNG in two frames (0.8 to
  0.87 s, smeared): the arm whipped forward and across him, the masks gone from his hand (they fly: below); carried through;
  then on round to his right a whole turn on the ball of his right foot to face you again.
- MIDNIGHT (`midnight`, 2.6 s, `PC_MIDNIGHT`): up onto his toes, back arched, the rapier raised over his head and drawn back,
  his left arm flung wide and high (held 0.5 to 0.87 s, the point glinting: the warning); his hips first; thrust straight up
  at the ceiling in two frames (0.9 to 0.97 s, smeared): THE CLOCK STRIKES (below); he holds it up, turns once round on his
  toes with it high, and brings it down in a great arc. The twelve chimes go on rolling while he fights on.
- STRUCK (`reel`, 0.5 s): knocked back, his arms flung out, his coat flying; his left foot steps back to catch him; up again.
- HIS DEATH (`dying`, 3.6 s, `PC_DIES`): struck back; his head thrown up, THE MASK CRACKS ACROSS (0.16 to 0.48 s), a jagged dark
  line from the brow over his left eye to the jaw, fog seeping out of it; he puts his hand up to it; the rapier slips from
  his hand (0.36 s) and falls; the crack opens; THE HALVES FALL AWAY (0.72 s) and under the mask there is nothing but the
  Hush's grey fog, which bursts out where his face was; he sinks to his knees (1.0 to 1.6 s) as the fog pours out of him and
  streams away up and back (up the stairs); his head goes to fog and is gone into his collar (1.25 to 2.0 s), his bonnet
  falling (1.45 s); and his coat, empty, falls in on itself to the floor (1.75 to 2.8 s); the last of the fog drains away
  (3.3 s). NO BODY IS LEFT: only his clothes lying flat and empty, the mask's two halves face up on the floor before him, his
  bonnet and the rapier. No blood, nothing gory.

Every blow of his is his Movement 9: a big held wind-up, a strike of two frames smeared with its after-images, a big
wind-down. `PC_STRIKES` says where each strikes; `smearedAt` which frames carry the smear (the strike's, and the one after it).

## What his moves leave on the floor (`src/art/prince_fx.ts`)

Each begins as his blow lands (its `hit`), where the game puts it.

- THE DANCE (`dancePainted`, `DANCE_FX`, 2.35 s from his blow): eight masked partners, grey fog figures, a lady in a ball
  gown and a gentleman in a coat by turns, each in the smiling gilt mask, rise out of the floor round you (0 to 0.4 s) 9 tiles
  across, the fog boiling up where each will stand; they waltz round you, turning as they go, trailing wisps, closing in (to
  1.45 s: the warning, their masks turned on you, their eye holes glinting pink); at 5 tiles across they hold a beat, their
  arms lifted to snatch at you (1.45 to 1.67 s); THE RING SNAPS SHUT in two frames (1.67 to 1.73 s, smeared): every one of
  them flung in at you, to 1.4 tiles across; they burst into grey breath and are gone (by 2.35 s). The enemy's pink edge on
  them while they stand. The game's: who is caught (inside the ring as it snaps).
- MASKS (`flungMask`, `maskPainted`, `maskSmear`, `maskBurst`, `MASKS_FX`): five masks in a fan 72 degrees wide (36 either side
  of his front), each flung from his hand at 15 tiles a second, 12 tiles (the length of the arena, 0.8 s), spinning 3.5 turns
  a second, about waist high, smeared behind; a mask a little bigger than a face, its back plain gilt, a gilt ribbon off it;
  at the end of its flight it bursts into gilt shards and a puff of grey breath.
- MIDNIGHT (`chimePainted`, `chimeRing`, `CHIME`): the clock itself is a piece of the floor (another helper's); each chime is a
  ring rolling out across the floor from the clock's place, a dark crimson wave (the black room's red, never pink) with a
  crest of gilt light, the floor's dust thrown up behind it, 0.75 tiles deep, out to 20 tiles (the whole arena from its edge),
  thinning at the end of its reach. Twelve chimes; faster each phase: a chime every 1.0 s rolling at 5 tiles a second in the
  first phase, every 0.75 s at 6.5 in the second, every 0.5 s at 8 in the third. EACH RING HAS A GAP 2.4 tiles across to slip
  through (`gapAt`: the game's to place; the film has it wander round from chime to chime). Without a gap a ring rolling over
  the whole arena could only be dodged by a roll through it, and the game has none (his gameplay rulebook: dodging is moving);
  pass `null` for a ring without one.

## How to bring him in (the main chat's)

- `makePrinceArt3(PRINCE)` gives `{ front, back }` as the game holds a monster's pictures (`mobSet`); his other moves are
  `clips.moves.setOff`, `halt`, `dart`, `dance`, `waltz`, `masks`, `midnight`. His picture (`PC_CANVAS`) is 420 by 330 with his
  floor point at (130, 220), for his lunge's whole reach; the game cuts each frame to what is in it.
- Where the game moves him: his walk at `PC_PACE` (out of it only at a round's end, into `halt`); his dart carried `DART.carry`
  tiles during `DART.air`; his waltz carried round its arc at `WALTZ.pace` for `WALTZ.long`; his thrust's lunge is drawn in his
  own picture (he springs back to where he stood by its end: the game does not move him for it).
- When each blow lands: `PC_THRUST.hit`, `PC_DANCE.hit` (the ring starts), `PC_MASKS.hit` (the masks leave his left hand, from
  where `handAt(PRINCE, 'masks', PC_MASKS.hit, 'L')` says), `PC_MIDNIGHT.hit` (the first chime). The areas: the lunge's line 4.5
  tiles long; the ring 5 tiles across as it snaps; each mask's path 12 tiles; each chime's ring across the arena but its gap.
  These are bigger than the old enemies' (his “bigger AOE”), and the game's hit areas should be drawn from them.
- Phases (his brief: “Each phase the clock strikes faster”): `CHIME.every` and `CHIME.speed` by phase. How often he does what in
  each phase is the main chat's.
- His sounds (the brief: “the clock, the music, his boots; no voice”) are the main chat's.

## The checks

- `tests/prince.test.ts` (9): (1) his switch is off, and nothing of the game imports him; (2) EVERY MOVE THROUGH EVERY BOSS
  CHECK (`checkBoss`, `src/art/boss_checks.ts`): every frame of all twelve moves, from in front and from behind (SLIDE, FLOOR,
  ARM, THROUGH, JERK, BLOW, HIPS, ALIVE, STRIKE), and every handover (his stand from every frame of it into every move and back;
  into his walk through `setOff` and out of it through `halt`; the Dance into the waltz and the waltz into his stand); (3) HIS
  LIGHTNING STRIKES: each of the four blows strikes in two frames and lands on the second, smeared then and the frame after, and
  no other frame is; (4) every frame both ways round: nothing cyan, no pink of his own, the enemy's pink edge while he lives and
  none as he dies, every pixel whole or empty but the edge; (5) nothing cut off; (6) nothing of him in the floor, his death too;
  (7) his brief: the smiling gilt mask on his face in every living frame with the Hush's pink in its eyes, its smile and eye
  holes carved; never still (both feet step, he sways and rises, the point goes round); the mask cracks and its halves lie on
  the floor; fog where his face was, pouring out of him, gone by the end; at the end nothing of him stands; (8) what his moves
  leave: the ring snaps in two frames, no cyan in it, the masks or the chimes; the masks spin and are smeared; the chime's gap;
  (9) his sizes and speeds in tiles: a head taller than the knight; 4.5 tiles a second; his dart 9.3; the lunge's point flung
  3.5 tiles in two frames and 4.5 out; the ring 9 across closing to 5; the masks 12 tiles; the chimes across the arena, faster
  each phase.
- Shared files touched: none of the engine (`boss_checks.ts`, `new_mobs3.ts`, `skin.ts`, `skeleton.ts` unchanged). The import
  checks of `tests/bosses.test.ts` (two), `tests/crier.test.ts`, `tests/hushed.test.ts` and `tests/new_mobs3.test.ts` are told
  of his files, as they were of the Princess's.

## The pictures and the film (`docs/mockups/prince/pictures/`)

- `prince_sheet_big.png` (1200 by 556): the Prince standing, from in front and from behind, three times as big, between the
  knight from in front and the knight from behind, for size.
- `prince_sheet_game.png` (1200 by 766): at the game's size, as a phone shows it (each picture pixel two screen pixels): the
  knight from behind, the Prince from in front and from behind, a few tiles apart on a dark floor.
- `prince_film.mp4` (1080 by 898, 30 frames a second, about 83 s): every move from in front and from behind beside the
  knight, then in the arena (a dark floor; the ring drawn on it is about 20 by 17 tiles) with the knight in it: his stand,
  his dance-step (with setting off and checking), the dart, the thrust, the Dance and its ring of partners, Masks and the
  flung masks, Midnight and the chimes (the first five of the first phase, then the first eight of the last), struck, and his death. Captioned; each strike again
  at half speed. The floor and the clock's place are stand-ins: the black room is another helper's.

## The dev page

`src/dev/preview_prince.ts`: `sheet` (front and back beside the knight, three times as big), `grid:<move>:<t>,<t>,...` (a move
at several moments, both ways round), `big:<move>:<t>`, `fx:<dance|mask|chime>:<t>`.

## His word on the pictures

The sheet and the film (`prince_sheet_big.png`, `prince_film.mp4`), asked “The Prince (prince_sheet_big.png and the film):
is this him?”: “Yes, that's the Prince (Recommended)”. Asked whether his everyday dance-step (about as fast as the
knight's run; his darts twice that) should be faster than the knight: “Keep it as it is”.
