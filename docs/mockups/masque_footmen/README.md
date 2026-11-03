# Floor 17, the Masque: the footmen (mock-ups; the branch `mockup/masque-footmen`)

Made for the art chat, from `origin/mockup/swan-gardens` (floor 16, its mobs and its boss, the models). Nothing here is in the
game until the main chat puts it there, on his yes. Nothing of the game imports any of it; its switch, `FOOTMEN_ON`, is off.

## The brief

Floor 17, THE MASQUE: the prince's masked ball, gone on for weeks, in a suite of seven rooms each in its own colour (blue,
purple, green, orange, white, violet, and a black one lit red through its windows), from Poe's "The Masque of the Red
Death" (1842), drawn only from the book. The floor's plan, approved by him: "Enemies: masked dancers who waltz until they
notice you, footmen, and the Silent Order among the guests."

The footmen's brief was offered to him as a pop-up; his pick for how they move: “Brisk and stiff (Recommended)”. The brief
as offered: FOOTMEN (floor 17, medium). Who: the palace's liveried footmen: powdered wig, braided coat, white gloves, a
silver tray. Size: a little taller than the knight, fewer. Move: a brisk, stiff, upright march. Mark: the powdered wig and
the silver tray. Attacks (two): the tray flung spinning like a disc; a lit candelabrum swung overhead. Death: the tray
clatters down, they drop to their knees, the Hush leaves them. Never: not the palace guard (no armour), not comic butlers.
Sound: the tray's clang, the candles' hiss. (Their death was made new on 30 Oct, on his pick: see "His death" below.)

His rules built in from the first pass (floor 16's notes have them in full, `docs/mockups/swan_gardens/README.md`):

- His Movement 9, 24 Oct: “Like the wind up and wind down are big but the actual punch is lightning quick”, for “All
  attacks, melee most (Recommended)”; for the enemies, 28 Oct: “Start from now on, but every enemy is going to need that
  change eventually.  And bigger AOE to compensate for the extra time the player gets to evade”. So both blows: a big wind-up,
  held (the warning); a strike of two frames, smeared with its after-images; a big wind-down; and areas that reach far.
- Speed and size, 28 Oct: “It’s all too slow and too narrow and too small.  I could dodge anything you’ve put in these moves
  with my eyes closed”; “Everything is always so plodding when you first animate them.  I could tell you I want a cheetah
  boss and it would walk around like an old dog.” So he marches faster than the knight walks, the tray flies six tiles, the
  fire spreads three; all measured in tiles.
- His art rules: real shapes (a sculpted body, a coat that hangs and flares, a gadrooned tray, a branched candelabrum, never
  balls and boxes); original designs; the friend's cyan never on him; the enemy's pink edge, the Hushed's dull pink eyes and
  grey breath; every pixel crisp; nothing cut off, in the floor or through the body; feet grip; loose things follow (the
  queue, the coat's skirts, the flames); he breathes when still; and every move through every boss check, from in front and
  behind.

## How it was read (for him to say yes or no to)

- WHO: one kind, the prince's footman, Hushed as the city's people are (their drained skin, the dull pink in the eyes, the
  mouth working, grey breath curling out). A little taller than the knight: 63 to his 58, slender and upright.
- THE MASQUE'S LIVERY, nothing like floor 16's (no armour, no wine and white, no madder and buff): a long black coat, its
  skirts to the knee, laced with gold braid down its fronts, round its hem, its collar, its pocket flaps, its back vent and
  its great turned-back cuffs; a waistcoat and breeches of deep crimson with gold buttons; white silk stockings, black shoes
  with silver buckles; a white cravat and a fall of lace; WHITE GLOVES; A POWDERED WIG, white, rolled twice over each ear,
  its queue tied at the nape with a black bow. Every colour of it clear of the enemy's pink (hues 300 to 350) and the
  friend's cyan (160 to 205).
- HIS MARKS, seen from in front and from behind: the white wig, and THE SILVER TRAY (a round salver, its rim gadrooned)
  carried high and level on the flat of his left hand beside his head. And, to be the second blow, A LIT CANDELABRUM of gilt
  bronze, three candles, carried before him in his right hand, low (his rulebook: weapons rest low). Its flames are an
  honest orange, as floor 16's lantern, never the enemy's glow.
- THE TRAY COMES BACK: flung, it loops out and back into his hand (the brief offered "then he draws another tray or catches
  it back"; catching it keeps his mark on him and makes the throw dangerous twice, out and back). His to change.
- THE CANDELABRUM'S AREA: swung over his head and down, its flames are flung out across the floor before him in a fan of
  fire three tiles out and a third of a turn across (his “bigger AOE”). His to change.
- BRISK AND STIFF: 2.8 tiles a second (the knight walks 2.5), upright, stiff-legged, quick short steps (4.3 a second), no arm
  swing, the tray and the candles steady. The step is as long as the boss checks let a march be (a longer one jumps when he
  stops: the JUMP check), so the speed comes from quick steps.

## His look (src/art/masque_footmen.ts)

`FOOTMAN_BODY` (63 tall, head 1.24 of life); `FOOTMAN_CANVAS` 300 by 260, his floor point at (138, 196). `footmanPainter(say)`
paints him; what a moment says beyond the bones (`FootmanSay`): whether the tray is on his hand, whether the candelabrum is,
how much its flames burn, the air past them, the strike's smear, and the glints and smoke.

- THE TRAY (`TRAY`, radius 6.6; `trayOf`, `trayBits`): its bed polished, a band of light across it; a boss at its middle
  with three lobes (they go round as it spins); the gadrooned rim, lobes bright and dark by turns, rolled up proud of the
  bed. On the palm, the fingers lie flat under it; gripped, it is held by its rim.
- THE CANDELABRUM (`CANDELABRUM`, `candelabrumOf`): a domed foot, a turned stem with knops, two branches curling out and up to
  their cups, the middle cup on the stem, drip pans, three ivory candles. THE FLAMES (`flamesOf`) are laid after his edge so
  they keep their colour: red at the root, orange, yellow, a white heart; blown back by the air past them (marching, they
  stream back; swung, they streak); their light `CANDLE_LIGHT`, orange.
- THE HUSH: grey breath from his mouth always, harder as he winds up; one great breath of it rising out of him as it leaves
  him, once he is down on his back (`FM_DIES.breath`; the moves file says when, `FootmanSay.dies`).
- THE TRAY LOOSE OF HIM as he dies (`FootmanSay.loose`, painted with `trayBits(..., deep)`): seen full face as it rolls and
  lies, its bed a step darker so that its gadrooned rim, its well, its boss and the band of light across it stand out (a
  salver, not one white disc); its underside dark, so that it flashes face and back as it goes round on its rim.

## His moves (src/art/masque_footmen_moves.ts), every number from the code

`FOOTMAN` (the Mob); `makeFootmanArt3()` gives `{ front, back }` as the game holds a monster; his second blow is
`more.candelabrum`. Built as the Princess's moves are: every field through its key poses smoothly, straight through the
strike; his feet laid over the keys by `footwork` (each foot down where it lands).

- STANDING (`FM_STAND_LONG` 3.0 s, 30 frames at 10): upright, chin up, heels together and toes out; breathing, his weight
  shifting, his head turning slowly left and right as he looks the room over, now and then a small lift of the tray as he
  settles it.
- THE MARCH (`FM_PACE` 2.8 tiles a second; `FM_MARCH` 12 frames at 26, a round of 0.46 s: a step every 0.23 s, each 0.65 of a
  tile): upright and stiff, the hips as high as straight legs let them be, so he vaults over each leg; struck on the heel,
  rolled flat, up onto the toe, each end of the foot on its spot of the floor while it is down; the tray steady beside his
  head, the candelabrum steady before him, its flames streaming back.
- THE TRAY FLUNG (his first blow; `FM_THROW`, 2.3 s): lifted forward off his shoulder; taken by its rim and brought down
  before him; swung out wide and round to COILED (0.44 s): the tray back past his right hip, his whole body wound round after
  it (his chest turned 64 degrees away), crouched, his weight on his right foot, his eyes on you over his left shoulder, the
  candelabrum thrown out before him to balance; HELD to 0.74 s, shaking, points of pink and gold running round the tray's rim
  and a pink glint on it (THE WARNING); his hips come round first (0.74 to 0.80); THE STRIKE, frames 24 to 26 (0.80 to
  0.87 s), uncoiled in two frames, his left foot stepped forward, his arm whipped out before him to his left, smeared; the
  tray leaves his hand on frame 26 (`FM_THROW.hit`). He follows through and watches it go, his hand open, waiting; it comes
  back and he catches it at `FM_THROW.catch` (1.84 s), the hand driven back by it; it goes up onto his shoulder again.
- THE CANDELABRUM (his second blow; `FM_SWING`, 2.1 s): the tray taken forward off his shoulder, turned on edge and let down
  to hang at his left side by its rim; the candelabrum raised high over his right shoulder and back (his hand 72 high, over
  his crown), his back arched; HELD 0.48 to 0.80 s, shaking, points of pink and gold along its arms and a pink glint on it
  (THE WARNING); hips first (0.80 to 0.87); THE STRIKE, frames 26 to 28 (0.87 to 0.93 s), over his head and down before him
  to his left in two frames, round an arc, smeared, the flames a streak of fire; the left foot stepped long; it lands on
  frame 28 (`FM_SWING.hit`), his hand 24 high and 19 before him, bent over it, and the fire fan bursts out. He holds, bent
  over, the flames guttering and catching again; straightens; the tray goes back up.
- STRUCK (`FM_REEL` 0.4 s): jolted back, his head snapped back, the tray tipping on his palm, the flames blown about.
- HIS DEATH (`FM_DIES`, 2.9 s): made new on 30 Oct: rigid a moment, then over backwards like a plank; the tray spinning to a
  stop on its rim. Its own section below, "His death".

## His death (made new, 30 Oct)

To make Act 2's enemies die differently (nearly every Hushed kind went to one knee, then down), offered to him as a pop-up:
"THE FOOTMEN stand rigid a moment, then topple straight over backwards like a plank, the tray spinning and rattling to a
stop ... the Hush leaving them in a grey breath, alive." His pick: “Yes, these (Recommended)”. Only the death changed: every
other move of his is as it was, pixel for pixel (every frame of them, and the flung tray and the fire, painted before and
after and found the same).

What it is (`deathPose` and `trayLooseAt` in `src/art/masque_footmen_moves.ts`; seconds, and frames at the game's 20 a
second for a death):

- STRUCK (0 to 0.08 s, frame 0 to 2): jolted back, his head snapped back, as his death has always begun.
- SEIZED RIGID (to 0.30 s, frame 6): his arms snap straight down to his sides; the candelabrum is let go from his right hand
  (0.13 s) and drops to the floor before him, its candles going out in a breath of smoke (it lies there along his forward
  line, so that it reads as lying from in front and from behind); THE TRAY FLIES FROM HIS LEFT HAND (0.15 s, frame 3), flung
  up and out to his left, tumbling over once. He comes bolt upright, legs locked, chin up, his weight back on his heels.
- HELD RIGID (0.30 to 0.60 s, frames 6 to 12), and A LAST STIFF SHIVER through him (0.32 to 0.56 s): all of him trembling in
  one piece, back on his heels, his head and hands trembling. The held beat, by his Movement 9.
- OVER LIKE A PLANK (0.60 to 1.16 s, frames 12 to 23): hinged at his heels (they stay on their spots), stiff from heels to
  head, his arms at his sides. As a body on its end falls: slow to start, then faster and faster (he is 4 degrees over at
  0.80 s, 22 at 1.00 s, 51 at 1.10 s, 80 at 1.15 s): the quick fall, by Movement 9. In the last of it his trunk comes on a
  few degrees past his legs, as a body lying flat is a little bent at the hips.
- DOWN FLAT ON HIS BACK (1.16 s, frame 23), with a little bounce (to 1.37 s, frame 27): his hips, then his shoulders, the
  back of his head rocked back onto the floor; his arms slap down beside him. Heavy: up off the floor no more than a breath.
- THE HUSH LEAVES HIM (1.19 to 2.41 s, frames 24 to 48): it has leaked from him hard all the while he stood rigid and went
  over; down, it rises out of him in one great grey breath, and thins away.
- THE RIGIDITY GOES OUT OF HIM (1.60 to 2.30 s, frames 32 to 46): his head rolls over toward his left (his white wig to the
  eye, his queue on the floor), his hands ease. The pink gone from his eyes (by the time he is down). Then still (2.30 to
  2.90 s): a man again, alive, lying on his back. Not a corpse, nothing gory.

THE TRAY (`TRAY_LIES`; `trayLooseAt(t)` gives its middle, its face's way and a way across it at any moment):

- In the air 0.15 to 0.80 s (frames 3 to 16): up off his palm (from 50 to 55 high) and out to his left, tumbling over once
  (292 degrees, so that it comes down tipped back toward him), turning a little as it goes.
- DOWN ON ITS RIM at 0.80 s (frame 16), tipped 68 degrees, 11 forward and 27 to his left of his floor point (clear of where he
  will lie, from in front and from behind), with a little hop off its rim (the clatter).
- ROUND AND ROUND ON IT (0.80 to 2.36 s, frames 16 to 47), a coin settling: rolling on its rim, not sliding, tipped less and
  less (slowly at first, then all at once), going round faster and faster (from 2.3 turns a second to 6), four times round
  and more; its face and its dark underside flash by turns as it goes. Its middle stays where it came down; the lowest of its
  rolled rim on the floor, never in it.
- STILL from 2.36 s (frame 47): flat on its back, face up, beside him.

The pictures lay a soft shadow under the tray as it rolls, as the film always laid one under the flung tray, and along him as
he goes over (the game's own shadow under him is one, at his feet). For the main chat: his shadow should go with him as he
goes over, and the tray should have one.

## What his blows do once they leave him (src/art/masque_footmen_fx.ts), for the main chat

Each begins as his blow lands, at his place on the floor, turned the way he faces.

- THE TRAY IN FLIGHT (`trayFlight(t)` in the moves file, `t` seconds after `FM_THROW.hit`, for `TRAY_FLIGHT.long`, 0.97 s;
  `trayLoop`, `TRAY_FX`): from where it left his hand, out along the left of a long loop to 6.0 tiles from him, round its far
  end at about waist height (21), back along the right into his hand: the loop 2.3 tiles across, 12.6 tiles of path, about 13
  tiles a second (19 as it leaves his hand), spinning 4.4 times. `trayShotPainted(at, view, was)` paints it on a picture
  anchored at his floor point (`TRAY_SHOT_CANVAS`): spun, tipped into its turn, the enemy's edge round it, its after-images
  and a tail along the way it came (`was`: where it was a few frames before), two whooshes round its rim. Where it passes is
  the blow; the game decides whether it stops on you or flies on (here it flies on and comes back).
- THE FIRE FAN (`firePainted(t, view)`, `FIRE_FX`, `FIRE_CANVAS`): `t` seconds after `FM_SWING.hit`. In two frames a wave of
  fire runs out over a wedge before him from 0.55 to 3.0 tiles out, a third of a turn across (120 degrees), smeared; burning
  wax splashed over the floor where it has been; a hundred and fifty tongues of honest flame standing up across it, sparks
  flying off them (burning to 0.62 s); sinking to embers and a breath of smoke (0.62 to 1.15 s); gone at 1.3 s. Its light the
  candles' orange.

## How to bring it in (the main chat's, on his yes)

- `FOOTMAN` and `makeFootmanArt3()` (`src/art/masque_footmen_moves.ts`) as the other mobs on the bones; his blows `attack`
  (the tray, `hit` 0.87 s) and `more.candelabrum` (`hit` 0.93 s); his walk painted for 2.8 tiles a second (`walkFpsAt`
  re-times it for another pace). Behind `FOOTMEN_ON`.
- The tray's flight: draw `trayShotPainted(trayFlight(t), view, ...)` at his floor point from `hit` for `TRAY_FLIGHT.long`;
  his own frames leave the tray off his hand for just that long. The fire: `firePainted(t, view)` at his floor point from the
  candelabrum's `hit` for `FIRE_FX.long`.
- His death: `dying` as before (`dieTime` 2.9 s); the tray as it flies and rolls is in his death's own frames (nothing to
  draw beside them). Its shadow, and his own as he goes over: see "His death".
- Sound (the brief): the tray's clang as it leaves him and as he catches it; the candles' hiss as the candelabrum comes down
  and the fire bursts out; no voices. As he dies: the candelabrum's clatter (about 0.55 s); the tray's clang as it comes
  down on its rim (0.8 s) and its rattle, quicker and quicker, to a last ring as it lies flat (2.36 s); the thud as he
  comes down (1.16 s); a grey breath as the Hush leaves him.

## The dev page and the tools

- `src/dev/preview_masque_footmen.ts`: `sheet` (front and behind beside the knight, three times as big; three of them at the
  game's size), `big:<move>:<t>` (four times as big), `grid:<move>:<t>,<t>,...[:<k>]` (a move at several moments, both ways
  round), `film` (the film's frames). On a plain floor of the Masque's first room, blue marble set in diamonds: a mock-up's
  floor, not floor 17's own ground.
  `PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_masque_footmen.ts shots/fm/sheet.png 1200 900 "sheet"`;
  and `deathsheet` (his death in eight key frames, from in front, twice as big) and `deathfilm` (the death film's frames).
  `PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_masque_footmen.ts docs/mockups/masque_footmen/pictures/footmen_death_sheet.png 1200 820 "deathsheet"`
- `tools/footmen_film.mjs`: draws the film's frames in a headless browser and makes the MP4 with ffmpeg (its last argument
  the page's mode: `film`, the default, or `deathfilm`).
  `node tools/footmen_film.mjs docs/mockups/masque_footmen/pictures/footmen_film.mp4 1200 720`
  `node tools/footmen_film.mjs docs/mockups/masque_footmen/pictures/footmen_death.mp4 1200 720 "" deathfilm`

## The checks: `tests/masque_footmen.test.ts` (15)

1. the switch is off, and nothing of the game imports them;
2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (`checkBoss`): stand, walk, both blows, struck, death, every frame, from in
   front and from behind, and every handover (no findings);
3. HIS LIGHTNING STRIKES: each blow two frames, landing on the second; the strike and the frame after it smeared, no other;
4. every frame both ways round: nothing cyan, the pink edge while he lives and none as he dies, every pixel whole or empty
   but the edge;
5. NOTHING CUT OFF (six pixels of room at least);
6. NOTHING OF HIM IN THE FLOOR;
7. THE LIVERY: every colour clear of pink and cyan; no pink on him but his eyes;
8. THE HUSH leaking while he lives, a great breath as it leaves him once he is down, none once he is still;
9. HIS MARKS: wig (its rolls and queue) and tray in every living frame (the tray off his hand only while it flies), white
   gloves, no armour; pink eyes while he lives, gone once he is down on his back;
10. THE CANDLES: an honest flame in every living frame, their light orange, out once fallen; the warning's pink glint on the
    tray and on the candelabrum;
11. HIS SIZE AND SPEED: a little taller than the knight; marching faster than the knight walks, painted for that pace;
12. THE TRAY FLUNG: six tiles out, a loop two tiles and more across, spinning, back into his hand inside 1.2 s; in the air the
    enemy's edge, nothing cyan, every pixel whole, both ways round;
13. THE FIRE: out in two frames, three tiles and 120 degrees; honest fire, no pink, nothing cyan; gone at its end;
14. HIS DEATH: held rigid (his arms at his sides, the shiver seen) from 0.30 to 0.60 s; over like a plank, hinged at his
    heels (each within 0.8 of its spot), nothing of him (hips, knees, chest, neck) 3.5 off his line from ankle to head
    as he falls, over 75 degrees in under 0.7 s; flat on his back at the end (his chest's front to the sky), a little bounce,
    then still; his handover into it from every frame of his stand and his march, and from struck as it starts and ends; the
    tray flung up off his hand, down on its rim (over 55 degrees), round on it four times and more, tipped less and less,
    flat and face up and still at the end, never in the floor; the tray and the candelabrum lie clear of him, both ways
    round;
15. NOTHING FOLDS FLAT.

Other tests told of these files, as they are of floor 16's (the smallest change: the footmen's files added to each check's
list of the art chat's mock-ups): `tests/bosses.test.ts` (two checks), `tests/crier.test.ts`, `tests/hushed.test.ts`,
`tests/new_mobs3.test.ts`.

## The pictures (`pictures/`)

- `footmen_sheet.png`: him standing from in front and from behind beside the knight, three times as big; three of them at the
  game's size marching on the knight.
- `footmen_closeup.png`: from in front and from behind, four times as big (the livery, the wig, the tray, the candles).
- `footmen_reach.png`: how far his blows reach, the knight for size: the tray's whole loop (six tiles out and back) and the
  fire fan burning (three tiles, a third of a turn).
- `footmen_film.mp4` (30 s): standing; the march; the tray flung; the candelabrum; struck; his death; each from in front and
  from behind, at room scale with the knight (stand, struck and death closer), captioned; each strike again at half speed.
  (Made again on 30 Oct for the new death; every other shot as before.)
- `footmen_death.mp4` (18 s): his death on its own: at the game's size beside the knight, from in front and from behind;
  each again three times as big; then at half speed, from in front and from behind; captioned.
- `footmen_death_sheet.png`: his death in eight key frames from in front, twice the game's size: the tray flies; rigid, a
  shiver; tipping; falling, a plank; down, a bounce; the tray spins; rattling flatter; still, alive.

## His word on the pictures

The sheet and the film (`footmen_sheet.png`, `footmen_film.mp4`), asked “Floor 17's footmen (footmen_sheet.png and the
film): are these right? The tray flies out and comes back to his hand like a boomerang.”: “Yes, that's them
(Recommended)”.

OF THE NEW DEATH (eb30951; his pick for it, 30 Oct, “Yes, these (Recommended)”): shown the sheet and the film (`footmen_death_sheet.png`, `footmen_death.mp4`), asked “The footmen's new death: struck, they freeze rigid with a shiver, then fall straight back like a plank. The tray flies off, rolls round on its rim and settles flat. The Hush leaves them, alive. Is that it?”: “Yes, that's it (Recommended)”.
