# Floor 19, the Keep: the king's knights (mock-ups; the art chat's branch `mockup/kings-knights`)

From `origin/mockup/swan-gardens` at 55945b3 (floor 16, finished and approved: its mobs and its boss are the models these
are built on). Nothing here is in the game until the main chat puts it there, on his yes. Nothing of the game imports
any of it (its test proves it); the figure is behind `KNIGHTS_ON`, off.

The measure is his doc's floor 19, THE KEEP: the old castle at the hill's crown, where the king lies dying; its palette
cold stone, royal blue, old gold; from Andersen's "The Nightingale" (1843), only from the book. The floor's plan,
approved by him: "Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the
Silent Order's last."

## His brief, as he picked it

Offered to him as a pop-up, "THE KING'S KNIGHTS (medium, two attacks): still loyal, silent in their armour. How should
they move?"; HIS PICK (not the one recommended): “Quick for their armour”, offered as "Same brief, but surprisingly
quick for men in full plate." The brief as offered:

> THE KING'S KNIGHTS (floor 19, medium). Who: the old king's knights, still loyal, silent in full plate, surcoats of
> royal blue and old gold, a crowned great helm, a longsword and kite shield. They are alive, not undead: Hushed, grey
> breath through the helm's slits. Size: a head taller than the knight, fewer. Move: [his pick] surprisingly quick for
> men in full plate. Mark: the crowned great helms, blue and gold. Attacks (two): an overhead two-handed chop that cracks
> the floor; a shield rush that knocks back. Death: they kneel, plant the sword, bow the head; the Hush leaves them; then
> they topple. Never: not skeletons or zombies, not the palace guard. Sound: heavy plate, the scrape of steel.

And his rules for every new enemy, built in from the first pass: Movement 9, 24 Oct, “Like the wind up and wind down are
big but the actual punch is lightning quick” (for “All attacks, melee most (Recommended)”); 28 Oct, “Start from now on,
but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player
gets to evade”; and of speed and size, 28 Oct, “It’s all too slow and too narrow and too small.  I could dodge anything
you’ve put in these moves with my eyes closed” and “Everything is always so plodding when you first animate them.”

## Who they are (src/art/kings_knights.ts; behind `KNIGHTS_ON`, off)

On the heroes' bones (`KNIGHT_BODY`: 67 tall, the knight 58, the palace guard 66), broader and heavier than the palace
guard, in older, heavier plate. `KINGS_KNIGHT`; `makeKnightArt3()` gives `{ front, back }` (true from behind, as the
guard). Nothing of the palace guard's (no wine tabard, no swan, no plume, no partisan, no polish).

- THE MARK, A CROWNED GREAT HELM: a flat-topped barrel of cold steel; on its face a cross of old gold (its upright down the
  middle, its brow band across over the sight), the sight's two dark slits either side of the upright, the breaths
  pierced on his right cheek; the dull pink of the Hushed in the dark of the sight; round its top a small circlet of
  old gold, five points standing up off it (the book's “golden crown”).
- PLATE: great pauldrons, a domed cap and three lames stepping down the arm, the last edged in gold; couters and poleyns
  with their side fans; vambraces; gauntlets with flared cuffs and fingers in lames; cuisses in lames; greaves; pointed
  sabatons in lames; mail at the armpits and the neck.
- THE SURCOAT, ROYAL BLUE (`BLUE`, hue 226 to 228 degrees: the friend's cyan is 160 to 205), to the knee, split before and
  behind (for the saddle), its skirts flying back as he runs, bordered in OLD GOLD (`GOLD`, dull, never a light); the
  royal swan in old gold on its breast (his pick for the King's mark, “Keep the royal swan”: the crest floor 16's palace
  guard wear, `swanIn`, in old gold on the king's blue); a sword belt with a gold buckle.
- THE KITE SHIELD (`KITE`, 17 across, 32 tall): royal blue, rimmed in old gold, the royal swan on it in old gold; its back
  plain boards and two straps. Hung on its strap across his back (the strap over his right
  shoulder and across his breast) while he stands, runs and chops; swung round onto his left arm to rush you.
- THE LONGSWORD (`SWORD`), a hand and a half: a 35-long blade with a dark fuller and bright edges, a steel cross with
  gold ends, a leather grip, a wheel pommel of old gold.
- THE HUSH: grey breath leaking out before the sight and seeping from its ends, harder in a warning; as he dies it
  leaves him in one great breath (`KN_EXHALE`), and the pink goes out of the sight.

## His moves (src/art/kings_knights_moves.ts), every number from the code

Frames are the game's: 30 a second for every move; his stand 10 a second; his death 20. Tiles are the game's
(`TILE3` of his own lengths). Every blow is his Movement 9: a big held wind-up, a strike of TWO frames smeared with its
after-images (`KN_STRIKES`, `smearedAt`), a big wind-down.

- STANDING (`stand`, 32 frames at 10, 3.2 s round): his sword planted point down before him (`SWORD_PLANTED`, its point
  18 before him), both gauntlets on its hilt, the left over the pommel; the shield on his back. He breathes (his chest
  rising and falling, his hips swaying), his helm turning slowly.
- QUICK FOR HIS ARMOUR, his pick, in three moves the game plays as it plays the bosses' gaits (game/bosses.ts `GaitDef`):
  - SETTING OFF (`setOff`, 9 frames, 0.3 s; the game carries him at his full pace from its first frame): he plucks up his
    sword and drives off, the right foot striding out at once, the left pushing off, a flight before the run.
  - THE RUN (`walk`, 16 frames at 30, 0.53 s a stride pair; `KN_PACE` 5.0 tiles a second, the hero runs 4.6): leaning
    hard into it, each foot down five frames going back under him with the floor and off it eleven, a flight between
    the strides (both feet off the floor in six frames of the sixteen); the sword trailing low in his right fist, his
    left arm pumping; the surcoat's skirts flying back; the shield on his back. His feet grip the floor at that pace.
  - STOPPING (`halt`, 12 frames, 0.4 s; the game carries him at `KN_HALT_PACE` 2.0 tiles a second while he stops): three
    hard steps, left, right, left, the sword brought round and planted before him again. (The bosses' gait carries
    them at full pace through their stopping; at five tiles a second no legs can stop in that, so his own is slower.)
  The game hands his run over to stopping at its first frame, as it does the bosses'.
- THE OVERHEAD CHOP (`attack`; `KN_CHOP`: 2.0 s, the warning held 0.48 to 0.82 s, the strike 26 to 28 of 30, the blow at
  0.933 s): plucked from the floor, swung up point first and stood upright, the left hand down onto the grip (to 0.14
  s); heaved up over his helm as he steps in with his left foot 12.5 forward (to 0.3 s); RAISED (0.48 s): both fists
  high over the crowned helm, the blade back and up behind him, arched back, the blade glinting pink, the Hush pouring
  harder; HELD shaking to 0.82 s (THE WARNING); his hips first (0.867 s); then in two frames the blade comes over the top
  and down into the floor before him (its point down at `CHOP_AT`, about 51 of his lengths, 1.3 tiles), smeared from
  its wind-up's end to where it lands; held in the floor, his body sinking on after it (the freeze) to 1.12 s; wrenched
  out (1.36 s), stepped back, planted again (1.84 s), his stand (2.0 s).
  THE CRACK (art/kings_knights_fx.ts `crackPainted`, `CRACK`): from where the blade bites, in two frames the floor splits
  on out before him in a jagged line to `CRACK.reach` 6 tiles from him (its harm `CRACK.wide` 1.2 tiles across: the
  game's), nine side cracks off it; stone chips flung up all along it and dust rolling out to either side (0.45 s);
  sparks of pink and gold where the blade bit (0.32 s); held open, the Hush's grey breath seeping up out of it; gone by
  2.1 s.
- THE SHIELD RUSH (`more.rush`; `KN_RUSH`: 2.36 s, the warning held 0.55 to 0.92 s, the strike 29 to 31 of 30, the blow at
  1.033 s, `carry` 3.5 tiles): the sword plucked up in his right fist; his left hand to the shield, and the shield
  swung round his left side off his back onto his left arm (0.08 to 0.36 s; `shieldOf`, `pt`: it goes round him, never
  through him); down into a deep crouch behind it, the right foot back, the sword drawn back low, its rim glinting pink
  (THE WARNING), held shaking to 0.92 s; his hips first (0.967 s); then in two frames the BURST: the game carries him
  `KN_RUSH.carry` 3.5 tiles (`rushCarried(t)`) while he flies flat out behind the shield, and he lands with the shield
  slammed out at arm's length, his left foot stamped down, the right leg out behind; the smear (streaks back the way he
  came, from his helm, shoulders, knees and the shield's rim, and the shield's outline left behind him) never lies over
  him; held a moment, the shield driving on; gathered up (1.58 s); the shield slung back round onto his back (to 1.92 s);
  the sword planted again (2.14 s), his stand (2.36 s).
  THE KNOCKBACK (`knockPainted`, `KNOCK`): a flash of white and pink at the shield's face (two frames); a crescent of
  force bursting out across the floor before him to `KNOCK.r` 1.8 tiles (a 140 degree arc), gone by 0.42 s; sparks
  flung forward; and behind him the dust of his burst along the 3.5 tiles he came, settling by 0.75 s.
- STRUCK (`reel`, 0.4 s): jolted back on his planted sword, the helm rocked back, the Hush coughed out.
- HIS DEATH (`dying`, `KN_DIES`: 3.6 s): struck back (0.08 s); his sword lifted from the floor as he goes down onto his
  right knee, his right foot back (0.16 to 0.5 s); planted again further out before him, both hands on its hilt (0.62
  s); his head bowed over his hands (1.0 to 1.3 s); the Hush leaves him in one great grey breath out of the sight (0.9
  to 2.5 s), the pink going out of it (by 1.8 s); his hands slip from the hilt and the sword falls away to his right
  (2.5 s); he topples forward, the left knee down (2.82 s), slumps (3.0 s) and lies on his face, arms out (3.2 s): a man
  again, still, the shield on his back.

FOR THE MAIN CHAT: his blows' areas (his “bigger AOE”): the chop's line 6 tiles out before him, 1.2 across; the rush's
path 3.5 tiles (the game carries him in two frames) and its knockback 1.8 tiles before him where he lands. His picture
(`KN_CANVAS`) is 400 by 340 with room behind him for the rush's smear; the game cuts each frame to what is in it.

## The pictures (docs/mockups/kings_knights/pictures/)

- `kings_knights_sheet.png` (1200 by 600): the king's knight standing, from in front and from behind, beside the knight,
  three times as big; and at the game's size, three of them running at the knight and one standing guard.
- `kings_knights_film.mp4` (1200 by 720, 30 a second, 39.7 s): every move from in front, then from behind, on cold
  stone flags with the knight in it for size (twice as big as the game; a tile 64 by 32 picture pixels): standing; set
  off, run and stop; the chop and its crack, its strike again at half speed; the shield rush and its knockback, its
  strike again at half speed; struck; his death; and last, running beside the hero from one line. Each shot captioned.

## How to bring him in

- The switch, `KNIGHTS_ON`; his art, `makeKnightArt3()` (stand, walk, attack, `more.rush`, `more.setOff`, `more.halt`,
  reel, death; `trueBack`).
- His gait as the bosses' (game/bosses.ts `GaitDef`): `{ pace: 5.0, cycle: 16 / 30, setOff: 0.3, halt: 0.4 }`, but carried
  at `KN_HALT_PACE` (2 tiles a second) while he stops; his blows from his stand, or as he stops.
- The chop: its blow at `KN_CHOP.hit`; the crack drawn from his floor point, facing his way (`crackPainted(t - hit)`), its
  harm along its line (`CRACK`). The rush: the game carries him `KN_RUSH.carry` tiles along his way through its two
  strike frames (`rushCarried`), the blow as he lands; the knockback drawn at his landing point (`knockPainted`), its
  knock `KNOCK.r` tiles before him.
- Its import checks: tests/bosses.test.ts, tests/hushed.test.ts and tests/crier.test.ts are told of these files (one word
  each in their lists of mock-ups; their comments say so). No shared engine file is changed.

## The dev page and the film

- `src/dev/preview_kings_knights.ts`: `sheet`, `big:<move>:<t>`, `grid:<move>:<t>,<t>,...`, on cold stone flags
  (`src/dev/kings_knights_floor.ts`: not the Keep's ground, which is not made yet).
  `PREVIEW_TIMEOUT=200000 node tools/preview.mjs src/dev/preview_kings_knights.ts shots/knights/sheet.png 1200 600 "sheet"`
- `tools/kings_knights_film.ts`: the film, painted in node (no browser), captioned by ffmpeg.
  `tsx tools/kings_knights_film.ts docs/mockups/kings_knights/pictures/kings_knights_film.mp4`

## The checks (tests/kings_knights.test.ts)

`tsx --test tests/kings_knights.test.ts` (11): 1. the switch is off and nothing of the game imports them; 2. EVERY MOVE
THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts): stand, run, chop, struck, death, rush, setting off and stopping, every
frame from in front and from behind, and every handover (his stand into each and back; setting off into the run and into
stopping; the run into stopping at its first frame; stopping into his stand); 3. HIS LIGHTNING STRIKES: each blow two
frames, landing on the second, smeared then and in the frame after and never else; 4. every frame paints both ways round:
no cyan, the pink edge while he lives and none as he dies, every pixel whole or empty but the edge, no light but the
enemy's pink, the royal blue's hue 215 to 240 degrees, the old gold duller than any flame; 5. NOTHING CUT OFF; 6. NOTHING
OF HIM IN THE FLOOR (but his sword's point resting on it where he plants it); 7. THE HUSH leaking while he lives, its great
breath as it leaves him, none after; the pink in the sight while he lives, gone by the end; lying low at the end; 8. his
sword falls clear of him; 9. NOTHING FOLDS FLAT; 10. HIS PICK AND HIS SIZES: taller than the knight; running at 5 tiles a
second (the hero 4.6) with a flight in his stride; the chop's fists high over his helm in the warning, its point on the
floor as it lands where the crack begins, the crack 6 tiles out; the rush crouched behind the shield in the warning,
carried 3.5 tiles in two frames, the knockback 1.8 tiles; the shield on his back as he stands and runs; to his right knee
behind his planted sword, his head bowed, then down; 11. what his blows leave: the crack out in two frames and gone, the
knockback's flash and gone, nothing cyan.

The models' own checks run as before (tests/palace_guard.test.ts). Three shared import checks are told of these files
(tests/bosses.test.ts, tests/hushed.test.ts, tests/crier.test.ts: one word each). No shared engine file is changed.
