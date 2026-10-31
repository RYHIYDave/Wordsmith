# Floor 19, the Keep: the king's knights (mock-ups; the art chat's branch `mockup/kings-knights`)

From `origin/mockup/swan-gardens` at 55945b3 (floor 16, finished and approved: its mobs and its boss are the models these
are built on). Nothing here is in the game until the main chat puts it there, on his yes. Nothing of the game imports
any of it (its test proves it); the figure is behind `KNIGHTS_ON`, off.

The measure is his doc's floor 19, THE KEEP: the old castle at the hill's crown, where the king lies dying; its palette
cold stone, royal blue, old gold; from Andersen's "The Nightingale" (1843), only from the book. The floor's plan,
approved by him: "Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the
Silent Order's last."

## His pick now: “Huge and slow, one each” (30 Oct), in place of the first design

Asked how the king's knights should change so they are not just another armoured guard, HIS PICK: “Huge and slow, one
each”, offered as "Fewer and much bigger: one or two at a time, a head and a half taller than you, a huge two-handed
sword, slow, wide sweeping blows." It REPLACES his first pick, “Quick for their armour”, and the first design built on it
(a head taller than the knight, a longsword and kite shield, a run of 5 tiles a second, an overhead chop and a shield
rush), which he had passed (“Yes, that's them (Recommended)”, below). The same files were rebuilt; the first design is
in this branch's history (e691c48, 8780dbd).

As built (third pass, really big): TWICE AS TALL AS THE KNIGHT (116 tall to the knight's 58; the first pass was 74, the second 87)
and broader all over alike (massive pauldrons, a deep chest, thick legs, big gauntlets, a big helm), so he is massive,
not stretched; the same royal blue and old gold plate and surcoat, the royal swan on his breast AND A BIG ONE ON HIS
BACK; the crowned great helm (grey breath through the slits, the Hush's dull pink behind them; alive, not undead); NO
SHIELD; a greatsword half as long again as the knight is tall (91.7; the King's 77). Slow: a heavy walk of 1.5 tiles a second,
each step landing with weight. Two blows, both a big held wind-up and a two-frame smeared strike: THE WIDE SWEEP (hauled
round behind him, then across the half-circle before him, 4.6 tiles out) and THE OVERHEAD CLEAVE (raised
high in both hands, brought down, the floor cracking in a line eight tiles out). Kept clearly unlike the King himself
(floor 19's boss, `mockup/king`: 100 tall, the Hush riding his back to 116, an old gaunt bearded face, a crown and a
mantle): these are younger men, faceless in great helms, no mantle, no rider. AT HIS “Really big” THEY ARE AS TALL AS THE
KING WITH HIS RIDER (the knight's helm's top 117.3, the King's body 100, his rider to 116): whether the King grows to stay
the biggest is the owner's to say.

His rules for every new enemy, built in from the first pass: Movement 9, 24 Oct, “Like the wind up and wind down are
big but the actual punch is lightning quick” (for “All attacks, melee most (Recommended)”); 28 Oct, “Start from now on,
but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player
gets to evade”; and of speed and size, 28 Oct, “It’s all too slow and too narrow and too small.  I could dodge anything
you’ve put in these moves with my eyes closed” and “Everything is always so plodding when you first animate them.”

## History: the first design, as he first picked it

Offered to him as a pop-up, "THE KING'S KNIGHTS (medium, two attacks): still loyal, silent in their armour. How should
they move?"; HIS PICK (not the one recommended): “Quick for their armour”, offered as "Same brief, but surprisingly
quick for men in full plate." The brief as offered:

> THE KING'S KNIGHTS (floor 19, medium). Who: the old king's knights, still loyal, silent in full plate, surcoats of
> royal blue and old gold, a crowned great helm, a longsword and kite shield. They are alive, not undead: Hushed, grey
> breath through the helm's slits. Size: a head taller than the knight, fewer. Move: [his pick] surprisingly quick for
> men in full plate. Mark: the crowned great helms, blue and gold. Attacks (two): an overhead two-handed chop that cracks
> the floor; a shield rush that knocks back. Death: they kneel, plant the sword, bow the head; the Hush leaves them; then
> they topple. Never: not skeletons or zombies, not the palace guard. Sound: heavy plate, the scrape of steel.

(Of that brief, what still holds: who they are, the colours, the crowned great helm, alive and Hushed, the death, the
nevers, the sound. What his new pick changed: their size, their sword, no shield, their pace, their blows.)

## Who they are (src/art/kings_knights.ts; behind `KNIGHTS_ON`, off)

On the heroes' bones (`KNIGHT_BODY`: 116 tall, the knight 58), broad and massive in old heavy plate. `KINGS_KNIGHT`;
`makeKnightArt3()` gives `{ front, back }` (true from behind, as the guard). Nothing of the palace guard's.

BIGGER STILL, AND REALLY BIG, how: the first pass (74 tall, `KN_FIRST`) grown by `KN_GROW` (116/74, 1.57; `KN_TALL` sets it) in every length alike: his
bones and the padding of what he wears, every plate, the helm, the sword, every pose of every move (each move is drawn
in the first pass's lengths and grown as the game is given it: `grownPose`; each solid as it is painted: `grown`; the
checks' solids the same: `knightSolids`). So each pose is the first pass's pose, only bigger; his pace and his blows'
reach are in tiles, as the game has them.

- SIZE: the top of his helm 117.3 up, the knight's head 59.7: 1.96 times the knight; his shoulders 46.4 across (the
  knight's 19.0), his chest 14.0 deep (5.6), his thighs 9.1 thick (4.2). As tall as the King with his rider (the King
  100 tall, his rider to 116).
- THE MARK, A CROWNED GREAT HELM: a flat-topped barrel of cold steel; on its face a cross of old gold, the sight's two
  dark slits either side of its upright, the breaths pierced on his right cheek; the dull pink of the Hushed in the dark
  of the sight; round its top a small circlet of old gold, five points standing up off it (the book's “golden crown”).
- PLATE: MASSIVE PAULDRONS, a domed cap and three lames stepping down the arm, the last edged in gold; couters and
  poleyns with their side fans; vambraces; gauntlets with flared cuffs and fingers in lames; cuisses in lames; greaves;
  pointed sabatons in lames; mail at the armpits and the neck.
- THE SURCOAT, ROYAL BLUE (`BLUE`, hue 226 to 228 degrees: the friend's cyan is 160 to 205), to the knee, split before and
  behind, bordered in OLD GOLD (`GOLD`, dull, never a light); the royal swan in old gold on its breast (his pick for the
  King's mark, “Keep the royal swan”: the crest floor 16's palace guard wear, `swanIn`); a sword belt with a gold buckle.
- THE ROYAL SWAN ON HIS BACK (`backCharge`, `BACK_SWAN`): the same swan as on his breast, seen the same way round, in old
  gold, big (half its height 10.6 of the first pass's lengths, 12.5 of his; the one on his breast 6.4): from just above
  the belt over his back and up over the top of his shoulders. It is laid ON the surcoat itself point by point (as the
  helm's face is laid on the helm), each point on the cloth's own curve between its rings, as a stencil laid on from
  behind him a little round toward his right (22 degrees) and from above (30 degrees: the game's eye), so the game sees
  it whole and unsquashed from behind: about 22 by 22 of the game's pixels. It turns and sways with the cloth, lies on
  his back as he lies on his face, and is hidden wherever anything covers the cloth (his arms, his pauldrons, his sword,
  his belt).
- NO SHIELD.
- THE GREATSWORD (`SWORD`), two-handed, 91.7 from pommel to point (the knight is 58 tall, the King's own 77): a 54-long
  blade with a plain ricasso, a dark fuller and bright edges; a broad steel cross with gold ends; a long grip in leather
  with a steel ring between the hands; a pear pommel of old gold.
- THE HUSH: grey breath leaking out before the sight and seeping from its ends, harder in a warning; as he dies it
  leaves him in one great breath (`KN_EXHALE`), and the pink goes out of the sight.

## His moves (src/art/kings_knights_moves.ts), every number from the code

Frames are the game's: 30 a second for every move; his stand 10 a second; his death 20. Tiles are the game's
(`TILE3` of his own lengths). Every blow is his Movement 9: a big held wind-up, a strike of TWO frames smeared with its
after-images (`KN_STRIKES`, `smearedAt`), a big wind-down.

- STANDING (`stand`, 32 frames at 10, 3.2 s round): his greatsword planted point down before him (`SWORD_PLANTED`, its
  point 40 before him), both gauntlets on its grip; he breathes (his chest rising and falling, his hips swaying), his
  helm turning slowly.
- HUGE AND SLOW, his pick, in three moves the game plays as it plays the bosses' gaits (game/bosses.ts `GaitDef`):
  - SETTING OFF (`setOff`, 9 frames, 0.3 s; carried at his pace from its first frame): he plucks the greatsword from the
    floor and lets it swing down round his right side to trail behind him; his left foot rolls up, swings through and
    comes down before him.
  - THE WALK (`walk`, 36 frames at 30, 1.2 s a stride pair; `KN_PACE` 1.5 tiles a second, the first pass's 1.2
    quickened for his longer legs (still under a third of the hero's run); the hero runs 4.6): on bent knees, each foot flat on the floor 20 frames of the 36
    (going back under him with the floor, so it grips), rolled onto its toe 2, swung low through 14; both feet down four
    frames of each stride, never both off. HIS WEIGHT: each foot comes down flat and he drops onto it, his hips lowest
    three frames after (2.8 down), the helm nodding, the sword bouncing. The
    greatsword trails behind him in his right fist, its point low; his left arm swings slowly.
  - STOPPING (`halt`, 9 frames, 0.3 s; carried at his pace): his right foot comes through and down beside the left, the
    sword brought round his right side and planted before him again.
  The game hands his walk over to stopping at its first frame, as it does the bosses'.
- THE WIDE SWEEP (`attack`; `KN_SWEEP`: 2.7 s, the warning held 0.62 to 0.98 s, the strike 31 to 33 of 30, the blow at
  1.1 s): plucked up from the floor (0.14 s); hauled round to his right (0.25 to 0.38 s), his right foot stepping back;
  WOUND (0.62 s): his body turned right round to his right, the hands at his right shoulder, the blade out behind him
  over it, glinting pink, the Hush pouring harder; HELD shaking to 0.98 s (THE WARNING); his hips first (1.033 s); then in
  two frames the blade sweeps round from behind his right, through before him, to out at his left (1.1 s), smeared all
  round its way; carried on round (1.23 s), held low at his left (1.42 s), brought back round before him (1.84 s),
  planted (2.3 s), his stand (2.7 s).
  THE SWEEP (art/kings_knights_fx.ts `sweepPainted`, `SWEEP`): as the blade lands, its sweep torn across the floor over
  the whole half-circle before him (from his right round to his left, `SWEEP.arc` 90 degrees either side) out to
  `SWEEP.r` 4.6 tiles (its harm: from `SWEEP.inner` 1.4 tiles out to 4.6; the game's to use): a crescent of force, its
  newest end brightest, out in two frames; scored streaks behind its edge; sparks off the blade's end; dust thrown up
  all round it; gone by 0.45 s, the dust by 0.7 s.
- THE OVERHEAD CLEAVE (`more.cleave`; `KN_CLEAVE`: 2.3 s, the warning held 0.6 to 1.0 s, the strike 32 to 34 of 30, the
  blow at 1.133 s): plucked from the floor, swung up point first and stood upright (to 0.2 s); heaved up over his helm as
  he steps in with his left foot 17.6 forward (0.2 to 0.46 s); RAISED (0.6 s): both fists high over the crowned helm, the blade
  back and up behind him, arched back, glinting pink; HELD shaking to 1.0 s (THE WARNING); his hips first (1.067 s); then
  in two frames the blade comes over the top and down into the floor before him (its point at `CHOP_AT`, 82.4 of his
  lengths, 2.1 tiles), smeared; held in the floor, his body sinking on after it, to 1.38 s; wrenched out (1.62 s),
  stepped back, planted again (2.1 s), his stand (2.3 s).
  THE CRACK (`crackPainted`, `CRACK`): from where the blade bites, in two frames the floor splits on out before him in a
  jagged line to `CRACK.reach` 8 tiles from him (its harm `CRACK.wide` 2.1 tiles across), nine side cracks off it; stone
  chips and dust (0.45 s); sparks of pink and gold where the blade bit (0.32 s); held open, the Hush's grey breath
  seeping up out of it; gone by 2.1 s.
- STRUCK (`reel`, 0.4 s): jolted back on his planted sword, the helm rocked back, the Hush coughed out.
- HIS DEATH (`dying`, `KN_DIES`: 3.6 s): struck back (0.08 s); his sword lifted from the floor as he goes down onto his
  right knee (0.16 to 0.5 s); planted again further out before him, both hands on its grip (0.62 s); his head bowed over
  his hands (1.0 to 1.3 s); the Hush leaves him in one great grey breath out of the sight (0.9 to 2.5 s), the pink going
  out of it (by 1.8 s); his hands slip from the grip and the sword falls away to his right (2.5 s); he topples forward,
  the left knee down (2.8 s), slumps (3.0 s) and lies on his face, arms out (3.2 s): a man again, still.

FOR THE MAIN CHAT: his blows' areas (his “bigger AOE”, grown with him): the sweep, the half-circle before him from 1.4
to 4.6 tiles out; the cleave's line 8 tiles out before him, 2.1 across. His picture (`KN_CANVAS`) is 630 by 534; the
game cuts each frame to what is in it. One at a time (his pick): how many come at once is the game's to set.

## The pictures (docs/mockups/kings_knights/pictures/)

- `kings_knights_sheet.png` (1200 by 600): the king's knight standing, from in front and from behind (the swan on his
  back), beside the knight, three times as big; and at the game's size, two of them (one walking, one standing guard
  seen from behind, the swan on his back at the game's size) and the knight.
- `kings_knights_film.mp4` (1200 by 720, 30 a second, 42.4 s): every move from in front, then from behind, on cold
  stone flags with the knight in it for size (twice as big as the game; a tile 64 by 32 picture pixels): standing; set
  off, walk and stop; the wide sweep and its sweep across the floor, its strike again at half speed; the overhead cleave
  and its crack, its strike again at half speed; struck; his death; from behind it opens on THE ROYAL SWAN ON HIS BACK,
  close (four times as big as the game), standing and then setting off away; and last, walking beside the hero
  running, from one line. Each shot captioned. (The first design's sheet and film are in this branch's history, at
  8780dbd; this design's first pass's, at 134dab4.)

## How to bring him in

- The switch, `KNIGHTS_ON`; his art, `makeKnightArt3()` (stand, walk, attack (the sweep), `more.cleave`, `more.setOff`,
  `more.halt`, reel, death; `trueBack`).
- His gait as the bosses' (game/bosses.ts `GaitDef`): `{ pace: 1.5, cycle: 36 / 30, setOff: 0.3, halt: 0.3 }`, carried
  at his pace through setting off and stopping; his blows from his stand.
- The sweep: its blow at `KN_SWEEP.hit`; drawn from his floor point, facing his way (`sweepPainted(t - hit)`), its harm
  over the half-circle (`SWEEP`). The cleave: its blow at `KN_CLEAVE.hit`; the crack drawn from his floor point, facing
  his way (`crackPainted(t - hit)`), its harm along its line (`CRACK`).
- Its import checks: tests/bosses.test.ts, tests/hushed.test.ts and tests/crier.test.ts are told of these files (one word
  each in their lists of mock-ups; their comments say so). No shared engine file is changed.

## The dev page and the film

- `src/dev/preview_kings_knights.ts`: `sheet`, `big:<move>:<t>`, `grid:<move>:<t>,<t>,...`, on cold stone flags
  (`src/dev/kings_knights_floor.ts`: not the Keep's ground, which is not made yet).
  `PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_kings_knights.ts shots/knights/sheet.png 1200 600 "sheet"`
- `tools/kings_knights_film.ts`: the film, painted in node (no browser), captioned by ffmpeg.
  `tsx tools/kings_knights_film.ts docs/mockups/kings_knights/pictures/kings_knights_film.mp4`

## The checks (tests/kings_knights.test.ts)

`tsx --test tests/kings_knights.test.ts` (12): 1. the switch is off and nothing of the game imports them; 2. EVERY MOVE
THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): stand, walk, sweep, struck, death, cleave, setting off and stopping,
every frame from in front and from behind, and every handover (his stand into each and back; setting off into the walk
and into stopping; the walk into stopping at its first frame; stopping into his stand); 3. HIS LIGHTNING STRIKES: each
blow two frames, landing on the second, smeared then and in the frame after and never else; 4. every frame paints both
ways round: no cyan, the pink edge while he lives and none as he dies, every pixel whole or empty but the edge, no light
but the enemy's pink, the royal blue's hue 215 to 240 degrees, the old gold duller than any flame; 5. NOTHING CUT OFF;
6. NOTHING OF HIM IN THE FLOOR (but his sword's point resting on it where he plants it); 7. THE HUSH leaking while he
lives, its great breath as it leaves him, none after; the pink in the sight while he lives, gone by the end; lying low at
the end; 8. his sword falls clear of him; 9. NOTHING FOLDS FLAT; 10. HIS PICK AND HIS SIZES (BIGGER STILL): his helm's
top 1.42 to 1.58 times the knight's head, and no higher than 90 (the King 100); shoulders at least 1.75 times the
knight's, a chest at least 1.7 times as deep, legs 1.5 times as thick; no shield in any frame; a greatsword 66 to 71
long; walking 1 to 1.8 tiles a second (under a third of the hero's run), painted for that pace, never both feet off the
floor, his hips lowest a few frames after each foot comes down; the sweep wound behind him to his right in its warning,
and in its two frames from his right, before him, to his left, its sweep 4.5 tiles out or more over 180 degrees; the cleave's
fists high over his helm in the warning, its point on the floor as it lands where the crack begins, the crack 8 tiles
out; to his right knee behind his planted sword, his head bowed, then down (the first pass's measures grown with him);
11. what his blows leave: the crack out in two frames and gone, the sweep out in two frames and gone, nothing cyan;
12. THE ROYAL SWAN ON HIS BACK: in every frame of every move, both ways round, every pixel of it was his surcoat's blue
and is old gold (on the cloth and nowhere else: never off it, never over his arms, sword or belt); none of it from in
front as he stands; from behind, 220 pixels and more as he stands and in every frame of his walk; half its height at
least half as big again as the one on his breast. (Test 6 lets the blade's box, as it bites the floor, grow with him.)

The models' own checks run as before (tests/palace_guard.test.ts). Three shared import checks are told of these files
(tests/bosses.test.ts, tests/hushed.test.ts, tests/crier.test.ts: one word each). No shared engine file is changed.

## His word on the pictures

OF THE FIRST DESIGN. The sheet and the film (`kings_knights_sheet.png`, `kings_knights_film.mp4`), asked “Floor 19's knights
(kings_knights_sheet.png and the film): are these right? They carry the shield on their back for the two-handed chop and
swing it onto the arm to rush.”: “Yes, that's them (Recommended)”.

OF THIS DESIGN (“Huge and slow, one each”), first pass (134dab4; 74 tall against the hero's 58), shown 30 Oct by 20:15. Asked “Are these the king's knights now: huge and slow, with a wide sweep and an overhead cleave?”: “Bigger still” (offered as: even taller and broader, still well short of the King). Asked whether the royal swan, with the shield gone only on his chest and often hidden by the sword, should go anywhere else: “Also on his back” (offered as: a big swan on the back of his surcoat, so you see it from behind too). Second pass (this one; c657175 was its start): bigger still, every length of him grown alike from 74 tall to 87 (half as tall again as the knight; shoulders 34.8, a greatsword 68.8, a walk of 1.3 tiles a second; the sweep 3.5 tiles out, the crack 6), and the royal swan, big, on the back of his surcoat as well as his breast; a new sheet and film (42.4 s, with a close shot of the swan on his back).

OF THE SECOND PASS (176c6e3; 87 tall), shown 30 Oct in the evening. Asked “Are these the king's knights now: bigger still, with the royal swan on their backs?”: “Bigger”. Asked “Bigger, got it. How big should the king's knights be? The King himself is about 1.7 times the hero's height, or twice with the Hush riding on his back.” (offered: as tall as the King, about 1.7 times the hero; a little bigger, about 1.6; twice the hero, as tall as the King with the Hush on him): “Really big”, in his own words. Read as: the biggest offered, twice the hero's height. Third pass (this one): every length of him grown alike to 116 tall (1.96 times the knight to his helm's top; shoulders 46.4, a greatsword 91.7, a walk of 1.5 tiles a second, the sweep 4.6 tiles out, the crack 8); the blade's allowed bite into the floor where it lands grown with him (test 6, 1.2 of his growth); a new sheet and film (42.4 s).
