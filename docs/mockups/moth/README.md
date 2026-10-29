# Floor 20's boss, the Moth (mock-ups; branch `mockup/moth`)

A helper of the art chat made this branch, from `origin/mockup/swan-gardens` at 55945b3 (the Princess and her steed, the swans:
its models). Nothing here is in the game until the main chat puts it there, on his yes. Nothing of the game imports any of it;
its switch, `MOTH_ON` (src/art/moth.ts), is off.

## The brief

FLOOR 20, THE QUIET TOWER: the highest tower of the High City; its top is the Moth's floor, an open platform under the sky.
Its palette: "Grey fog, bone white, no colour at all". Its story, from the plan he said yes to: "the torn-out last chapter lies
open on the tower's top. It does not tell how the story ends. It is a name, and the thing it names is the Hush itself." The
Moth was his pick for the horror that makes the Hush.

The brief was offered to him as a pop-up. HIS PICK for how it moves, which was not the recommended one: “Slow, heavy wingbeats”
(offered as "Same brief, but slow, looming wingbeats."). The rest is the brief as offered: a vast grey moth, its wings wider
than the room is long, an eye on each wing that opens and follows you. The dust off its wings is the Hush itself: where it
falls, words go dark and sound dies. Its size: vast, the biggest thing in the game. Its mark: the eyes on its wings. Its moves:
a buffet of its wings (basic); Dust, a cloud of its scales drifting down over part of the top; the Eyes, beams fired along the
lines they stare; the Swarm, a cloud of little grey moths pouring off it. Each phase it flies faster and sheds more dust. In the
last phase it settles on the last chapter, and its wings beat the whole top. Its death: it dies screaming, the first sound it
ever makes, and every word it swallowed pours out of it and flies home. Never gory, never a pretty butterfly, never cute. Its
sound: silence, wing-beats, then the scream.

His rules it is built to from its first pass: Movement 9 (24 Oct), “Like the wind up and wind down are big but the actual punch
is lightning quick”, for every enemy from the Princess on (28 Oct, “Start from now on, but every enemy is going to need that
change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”); his 28 Oct “It’s all too slow
and too narrow and too small.  I could dodge anything you’ve put in these moves with my eyes closed” and “There are big bosses
that can be slow.”; real shapes, never circles and squares (How art is made 9); the enemy's pink edge, nothing cyan; every
boss through every check (How art is made 7).

## Its look (src/art/moth.ts)

A real moth's body, sculpted: a thorax thick with ash-grey fur, its collar a shaggy mane round its neck, its back humped, a
furred cape over each wing's root; a head set low with two great compound eyes of black glass, faceted, a scatter of the Hush's
dull pink shining deep in them (no pupil, not a lamp); two great feathered antennae, combed on both sides; shaggy palps; a
coiled tongue; an abdomen of eight segments, each ringed by its pale fringe, grey tufts along its sides, a tuft at its tip; six
jointed legs (a furred femur with a fringe of hair, a spurred tibia, a tarsus of five joints, a hooked claw), folded under it
in flight.

FOUR WINGS. Each wing is a sail of scales cut to its own outline: the forewing long, its apex hooked; the hindwing a broad fan,
its edge scalloped and torn. Each is CUPPED along a vein, its trailing part bent up off the rest, and bent further as it lags
behind each stroke (loose things follow), so that a wing seen edge-on is never a flat board. Each has veins running out from
its root, cross-lines in bone white wavering across it and worn through in places, a band of darker scales between them, a
chequered fringe along its edge, hair thick at its root, and dust all over. The undersides are paler.

AN EYE ON EACH WING (his mark): a great one on each hindwing (44 across its radius), a lesser one on each forewing (30), each
set in an eyespot's rings (dark, bone, dark). Each is A REAL EYE: heavy furred lids, folded; the white yellowed and veined;
the iris the Hush's dull pink (`FLAME[1]`, deeper at its rim, `FLAME[0]`; burning, `FLAME[2]` about a pinprick pupil); a
catchlight. They open and shut: half-lidded as it hovers, shut once a beat as they blink, wide in the Eyes, burning as they
fire, rolling up as it dies. They FOLLOW YOU: each pupil is aimed at a point five tiles before it, at the knight's chest, so
as the wings beat the pupils turn in the eyes to keep to you.

Its colours are grey, ash and bone white, with no colour else but the dull pink in its eyes and the enemy's pink edge (the
tests hold 93% and more of every hovering frame grey). The dust off it is the Hush's own grey-violet (art/crier.ts `HUSH`,
art/hushed.ts `BREATH_PALE`).

ITS SIZE. Its forewing is 372 picture pixels from root to apex (9.5 tiles). Its wings spread are 19 to 20 tiles from tip to
tip (on the book, 16.7 to 19.4 as they fan; hovering, 11.5 to 20.4 through the beat): as wide as a boss arena (about 17 by 20
tiles) is long. Its body is 8.4 tiles from head to tail, five and a half knights long. Hovering, its thorax is 236 up, four
knights' height. It is far bigger than the Carrion Queen (the test holds it 1.2 times her width and more). Its picture
(`MOTH_CANVAS`) is 1040 by 1000; the game cuts each frame to what is in it.

HOW IT IS BUILT: on the heroes' bones, as the Carrion Queen is, so that every check the bosses have can be run on it. The
bones' pelvis, spine, chest and neck are its body's line. Everything else is its own: four wings, six legs, abdomen, head,
antennae and mouthparts, put on that line by the numbers of each pose (its beat, sweep, twist, spread, its eyes, its abdomen's
curl, its scream, its legs' reach). Each key of each move also carries what of it is its own: its hindwings a frame behind its
forewings, its abdomen and antennae swinging behind its way, its feet put down, where its eyes look, how far it has crumbled
(`MothExtra`). That way the painter and the review see the same Moth. The bones' own arms and legs are never painted.

## Its moves (src/art/moth_moves.ts; 30 frames a second, its stand, drift and perch at 15)

Every blow of it strikes as his Movement 9 asks: a big wind-up, held (the warning), the strike itself in two frames smeared with
its after-images (the wings' edges along the way they came, `MOTH_SMEAR`), a big wind-down. `MOTH_STRIKES` says where.

- HOVERING (its stand, `MOTH_BEAT`: 2.4 s, 36 frames at 15, one beat; his “Slow, heavy wingbeats”): its wings hang at the top of
  the beat (56 degrees over level, drifting up to 58 in 0.36 s), come down heavily to −32 by 1.2 s and −34 by 1.38 s, and climb
  slowly back to the top by 2.4 s. Its body heaves up nine on the downstroke and sinks on the climb; its abdomen pumps; dust
  sifts off its wings; its eyes are half-lidded (0.35 of wide) and blink once a beat.
- THE DRIFT (its walk, the same beat frame for frame): `MOTH_PACE` 3 tiles a second, its dust trailing. His brief says faster
  each phase: the game plays the same frames faster.
- THE BUFFET (its attack, `MOTH_BUFFET`, 2.1 s): it rears back, its wings raised to 86 degrees till they nearly meet over its
  back, its abdomen curled under it; HELD 0.45 to 0.93 s, trembling, dust shaking off. THE STRIKE comes in two frames (0.93 to
  1.0 s, landing at 1.0): its wings come down to −46. Its wings carry on to −53 while it heaves up 19 on the stroke, then climb
  back. THE GUST (art/moth_fx.ts `gustPainted`) is wind and dust rolling out over a cone before it, 140 degrees wide and 9 tiles
  long (`BUFFET_CONE`), its front out in 0.65 s, gone by 1.25 s.
- DUST (`MOTH_DUST`, 2.3 s): its wings half raised and swept forward over the top before it, shaking hard, HELD 0.42 to 0.9 s;
  then one violent shake down in two frames (0.9 to 0.97 s). THE CLOUD (`cloudPainted`) is a cloud of its scales drifting down
  over the top before it, 7 tiles across, its middle 4.5 tiles out (`DUST_CLOUD`). The scales fall for 1.4 s and settle into a
  haze of the Hush; your words go dark in it (the game's). The haze is shown held 4 s and fading in 1.2 (`CLOUD_FX`; how long it
  lasts is the game's).
- THE EYES (`MOTH_EYES`, 2.5 s): it rears upright, its wings spread wide and flat to you, its four eyes opening wide, HELD 0.5
  to 1.1 s. Then in two frames (1.1 to 1.17 s) its wings snap forward to you and its eyes flash wide, burning, and fire. THE
  BEAMS (`beamsPainted`): from each eye, down to the top two tiles out and along the line it stares, the top's whole length
  (20 tiles), 1.2 tiles wide (`EYE_BEAMS`). The four lines fan out before it: from its forewings 30 degrees either side of its
  way, from its hindwings 11. They are bone white about the dull pink, never cyan, out in two frames (half then whole), held
  0.45 s, flickering, then thinning in 0.3.
- THE SWARM (`MOTH_SWARM`, 2.5 s): it wraps its wings forward round itself and little grey moths crawl out over them, HELD 0.5
  to 1.1 s. Its wings are flung open in two frames (1.1 to 1.17 s) and THE SWARM (`swarmPainted`, `SWARM`) pours off it. That
  is 150 little moths, each a real one (a body and four wings, flapping), in a winding stream that widens to 5 tiles across the
  top for 18 tiles, over 3.2 s, each at 5.4 to 7.4 tiles a second.
- THE LANDING (its last phase only, `MOTH_LAND`, 2.2 s): it comes down onto the last chapter with a braking downbeat at 0.9 s,
  its legs reaching. Its six feet are down round the book by 1.25 s, and stay where they are put. Its body sinks onto the book
  (a landing sinks) and its wings spread their whole width.
- ON THE BOOK (its stand there, `perch`, 2.4 s, 36 at 15): its wings fanning slowly between 18 and 36 degrees over the whole
  top, its feet gripping the stones, its eyes half-lidded and blinking.
- THE BEAT (its blow there, `MOTH_BEAT_BLOW`, 2.3 s): it rears on its legs, its wings raised to 84 degrees, HELD 0.5 to 1.0 s.
  They are slammed down to the stones in two frames (1.0 to 1.07 s), and THE WIND (`wavePainted`) rolls out round it over the
  whole top, 11 tiles out (`BEAT_RING`) in 0.75 s, gone by 1.25.
- STRUCK (`MOTH_REEL`, 0.45 s; in the air, and on the book): jolted back, its wings flung up, its abdomen arched.
- ITS DEATH (`MOTH_DIES`, 4.8 s, at 20 frames a second): struck. It rears and SCREAMS (0.45 to 1.75 s): its head thrown back,
  its palps spread wide, its face split open between them dark with the Hush's dull pink deep in it, its tongue uncoiled and
  lashing, its wings flung up trembling, its eyes wide and then rolling up. Its forelegs come up off the stones. It is not gory.
  EVERY WORD IT SWALLOWED POURS OUT OF IT (0.7 to 3.4 s): the game's own glyphs (art/icons.ts `GLYPH`) in their own colours
  (`WORD_COLOR`, their cores `WORD_GLOW`, as the game's words are), rising out of its mouth and its body. Far off they fly
  home over the top in every way (`wordsPainted`). The words are power, swift, fire, lightning, leech, volatile, poison, heavy,
  frenzied, guarding and binding (`MOTH_WORDS`). Twin and frost are left out: their teal and sky blue would read as the hero's
  cyan on an enemy. IT FALLS onto the book, its wings down on the stones (1.75 to 2.9 s), its light going out. IT CRUMBLES TO
  DUST (2.3 to 4.5 s): its wings eaten from their edges inward in flakes, its body falling apart, its dust drifting down to lie
  in a heap of grey and bone on the top. The test holds less than an eighth of it left at the end.

THE LAST CHAPTER (`chapterPainted`): torn out of its book and lying open on the stones where the Moth comes down, a few loose
leaves beside it, its pages lifting in the wind of the wings. No word on it can be read.

## For the main chat: how to bring it in

- `MOTH` (art/moth_moves.ts) is a monster as the game holds one; `makeMothArt3()` gives `{ front, back }` (its stand, drift,
  buffet, and in `more`: `dust`, `eyes`, `swarm`, `land`, `perch`, `beat`, `perchReel`; struck; its death).
- ITS MOVES BEGIN IN STEP WITH ITS BEAT. Its stand is one great slow beat, so a move begun from the middle of a beat would make
  its wings jump. The game begins each of its moves (struck too) as its stand comes round to its first frame, the top of the
  beat, at most 2.4 s, and each ends there. Its drift and its stand beat in step, frame for frame, so going from one to the
  other the game keeps the frame number. On the book the same, from `perch`'s first frame. The review checks exactly these
  handovers (tests/moth_shape.ts `mothHandovers`), through one new optional flag on the bosses' review, `Handover.phase`
  (src/art/boss_checks.ts: a handover from the stand at the moment it says, not from every frame). Nothing else of that file
  changed; every boss reviewed before is reviewed as before.
- Its last phase: play `land` once, then `perch` as its stand, `beat` as its blow, `perchReel` when struck. Its death begins
  from `perch` (it dies on the book). The chapter lies under it, `BOOK.at` from its floor point (art/moth_moves.ts).
- Its feet are down only on the book (`FEET_DOWN`, round it). In the air it never touches the top.
- What its blows cover is drawn to the sizes above, big as his “bigger AOE” asks. The game draws its own warnings and hit
  areas; `gustPainted`, `cloudPainted`, `beamsPainted`, `swarmPainted`, `wavePainted`, `wordsPainted` and `chapterPainted` are each
  a painting on a canvas of their own (`FX_CANVAS`, `CHAPTER_CANVAS`), anchored on the Moth's floor point, to lay as the game
  likes.
- Its shadow: `MOTH.shadow` is 150 (half-width, picture pixels): hovering, a wide soft shadow under its wings.
- Its frames are big (its picture 1040 by 1000, cut to what is in it) and there are many of them; a speed check on his phone
  comes before it goes in.
- Its sound (his rulebook's sound): silence; the wing-beats, heavy, on each downstroke; then the scream as it dies, the first
  sound it makes.

## What is his, or the main chat's, to decide

- THE LECTERN. Floor 20's place, approved since this was made (branch `mockup/quiet-tower`), puts the last chapter on a
  lectern on a dais in the middle of the top. Here the Moth comes down on the chapter lying open on the stones, its body low
  over it and its six feet round it. To settle on the lectern instead, its perch must stand higher (its feet on the dais,
  its body over the lectern's top). That is a change of its landing and its last phase's poses, and of the checks' numbers.
  Not done here.
- ITS MOVES BEGIN IN STEP WITH ITS BEAT (see above): the game waits for the top of the beat, at most 2.4 s.
- Two words are left out of those that pour out of it: twin (teal) and frost (sky blue), because they would read as the
  hero's cyan on an enemy.
- The little moths of the swarm have a dark seam round each but no pink edge, because a pink edge on a hundred and fifty of
  them would read as pink confetti. They are part of its blow, as the Princess's diving swans are of hers.
- From in front, the iso camera looks along its body, so in the middle of each beat one wing is seen near edge-on, cupped
  but thin. From behind it shows all four eyes at once. The sheet shows both.

## Its pictures and film (docs/mockups/moth/pictures/)

Made by `tools/moth_pictures.ts` (no browser; `tools/moth_film.py` captions them and makes the film with ffmpeg) on a stand-in
tower top (src/dev/moth_top.ts): a round top paved in grey flags, a ring of bone white stones in the middle, a low parapet of
bone white stone with its merlons, the grey fog below. It is not floor 20's own ground, which is the art chat's to make.

- `moth_sheet.png`: the Moth from in front and from behind, beside the knight, both at the game's own size, mid-beat.
- `moth_top_front.png`, `moth_top_behind.png`: at the game's size hovering over the top, the knight before it.
- `moth_close.png`: its mark close up: a hindwing's great eye shut, half-lidded, wide, burning; its head, and its head as it
  screams.
- `moth_moves.png`: a moment of each move at a glance, from in front.
- `moth_film.mp4`: every move from in front and from behind at the scale of the arena with the knight in it, captioned, then
  each strike again at half speed (73 s, 1200 by 1172, 30 frames a second).

The dev page `src/dev/preview_moth.ts` shows the same in a browser: `top:<move>:<t>:<front|back>`, `big:<move>:<t>`,
`grid:<move>:<t>,<t>,...:<front|back>` (`node tools/preview.mjs src/dev/preview_moth.ts <out.png> 1200 1080 "<mode>"`).

## The checks

- `tests/moth.test.ts` (9):
  1. The switch is off and nothing of the game imports it.
  2. Every move through every boss check (src/art/boss_checks.ts, with its shape `tests/moth_shape.ts`): every frame, from in
     front and from behind, every handover. It is a flier: its feet are its six claws, checked to grip only where down. Its
     arms are its six legs, held out of its body. Its four wings and two antennae are what it must never pass through itself.
     The points followed are its head, thorax and tail, its wings' tips, its antennae's tips and its forefeet.
  3. His lightning strikes: each of its five blows is held a while, strikes in two frames, lands on the second, and is smeared
     then and only then.
  4. Nothing cyan, the pink edge while it lives and none as it dies, every pixel whole or empty but the edge.
  5. Nothing cut off: it, or what its moves leave.
  6. Nothing of it in the floor, the whole outline of each wing too.
  7. His brief: a real moth (four cupped wings, six legs with their claws, feathered antennae, compound eyes, palps, tongue,
     eight segments); grey, ash and bone, no blood; its eyes the dull pink, half-lidded, blinking, wide in the Eyes, following
     you as the wings beat; a slow full beat; feet down only in its last phase; its scream; the words pouring out; crumbled to
     dust.
  8. What its moves leave: never cyan; the beams out in two frames, bone white about the dull pink; the swarm many; its dust
     the Hush.
  9. Its sizes: wings spread 18.5 tiles and more; hovering 15 and more; bigger than the Carrion Queen; the cone, the cloud,
     the beams, the swarm, the beat's wind; its drift.
- Its review: 0 findings, every move, both ways round, every handover.
