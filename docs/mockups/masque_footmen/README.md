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
Sound: the tray's clang, the candles' hiss.

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
- THE HUSH: grey breath from his mouth always, harder as he winds up; one great breath of it as it leaves him
  (`FOOTMAN_EXHALE`, 0.32 to 1.9 s into his death).

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
- HIS DEATH (`FM_DIES`, 2.9 s): jolted; THE GASP (0.4 s), his chest arched and his head thrown back, the Hush pouring out of
  him; THE TRAY slides off his palm (0.46 s) and clatters down flat to his left, bouncing (`fall`: hop 2.6, spun 150
  degrees); THE CANDELABRUM drops (0.6 s) to his right and its candles go out in a breath of smoke; his knees give and he
  drops onto them (1.04 s), his feet turned up onto their toes where they stood; he sways there, the last of the Hush leaving
  him; he sinks back toward his heels (to 2.4 s), his head bowed, his hands loose on his thighs, the pink gone from his eyes:
  a man again, alive, still. Not lying, not a corpse.

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
- Sound (the brief): the tray's clang as it leaves him and as he catches it, and as it clatters down when he dies; the
  candles' hiss as the candelabrum comes down and the fire bursts out; no voices, a gasp as the Hush leaves him.

## The dev page and the tools

- `src/dev/preview_masque_footmen.ts`: `sheet` (front and behind beside the knight, three times as big; three of them at the
  game's size), `big:<move>:<t>` (four times as big), `grid:<move>:<t>,<t>,...[:<k>]` (a move at several moments, both ways
  round), `film` (the film's frames). On a plain floor of the Masque's first room, blue marble set in diamonds: a mock-up's
  floor, not floor 17's own ground.
  `PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_masque_footmen.ts shots/fm/sheet.png 1200 900 "sheet"`
- `tools/footmen_film.mjs`: draws the film's frames in a headless browser and makes the MP4 with ffmpeg.
  `node tools/footmen_film.mjs docs/mockups/masque_footmen/pictures/footmen_film.mp4 1200 720`

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
8. THE HUSH leaking while he lives, a great breath as it leaves him, none once he is still;
9. HIS MARKS: wig (its rolls and queue) and tray in every living frame (the tray off his hand only while it flies), white
   gloves, no armour; pink eyes while he lives, gone once he is down;
10. THE CANDLES: an honest flame in every living frame, their light orange, out once fallen; the warning's pink glint on the
    tray and on the candelabrum;
11. HIS SIZE AND SPEED: a little taller than the knight; marching faster than the knight walks, painted for that pace;
12. THE TRAY FLUNG: six tiles out, a loop two tiles and more across, spinning, back into his hand inside 1.2 s; in the air the
    enemy's edge, nothing cyan, every pixel whole, both ways round;
13. THE FIRE: out in two frames, three tiles and 120 degrees; honest fire, no pink, nothing cyan; gone at its end;
14. HIS DEATH: on his knees at the end, his head well up; the tray and the candelabrum lie clear of him, both ways round;
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
