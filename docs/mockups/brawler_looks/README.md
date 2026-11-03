# The Brawler reworked: twenty rough looks (the art chat, 2 Nov 2026)

Branch `art/brawler-looks`, from `origin/high-city` (f6688d9). Pictures only: dev files, nothing of the game touched.

## His words

- 2 Nov 2026, 19:59: “Or we might have to do a rework of the brawler.  He’s not really what I’m looking for”
- Asked what isn't right: “I think it can go two ways.  More of an old timey boxer.  Longer wind ups for hits so you have
  time for inputting combos.  Or an actual fighter, tap for punch, hold for kick, and swipe for jump to insert the swipe
  into the combo for jump kicks or flying uppercuts”
- Asked how to decide: “Give me some possible looks, 10 for each”
- By 21:06: “Just some rough ideas, don’t need some fully animated sprites or whatever”

So: rough concept figures, standing, one view each (the game's three-quarter view from in front), three times the game's
size, each beside the knight for size. Sculpted as the classes are (one body of flesh, not circles and squares), fists
big (his “His hands are tiny compared to his body”), original designs. No polish, no game-size versions, no moves.

## The pictures (`pictures/`)

- `boxers_sheet.png`: the ten old-timey boxers, numbered 1 to 10, each with its line; the Brawler as he is today at the
  top for comparison.
- `fighters_sheet.png`: the ten real fighters, numbered 1 to 10, each with its line.

## The ten old-timey boxers (in the old ring's upright stance, fists up)

1. The Champion: waxed handlebar moustache, black hair parted down the middle, the broad brass champion's belt over
   high-waisted black tights, laced boots; bare knuckles.
2. The Iron Squire: grey mutton chops, a bald pate fringed in grey, a striped sleeveless vest, plain grey tights, a sash.
3. The Bruiser: flat-top crop, a broken nose, cauliflower ears, stubble; grey long johns rolled down and tied at the waist,
   braces let down; bare knuckles.
4. The Tattooed Tar: shaven head, drooping moustache, sailor's tattoos up his arms and chest; cream tights, red sash.
5. The Young Contender: lean and long, clean-shaven, black curls; high-waisted maroon trunks, old ox-blood leather gloves,
   tall laced boots.
6. The Old Lion: a heavyweight gone grey, a walrus moustache and full grey whiskers, a big belly; red flannel long johns
   buttoned down the front, a belt; fists wrapped.
7. The Georgian Gentleman: the oldest ring; tied-back hair, a pencil moustache, cream knee breeches, white stockings,
   buckled shoes, a green sash.
8. The Dock Fighter: a short dark beard, braces over his bare chest, rolled work trousers, hobnailed boots, leather straps
   over his knuckles, his flat cap set down on the floor.
9. The Bearded Giant: bald and huge, a black forked beard, black tights, a green sash, wrapped fists. NEAREST TO TODAY'S
   Brawler (the bald head and the big beard).
10. The Copper Kid: short and wiry, a shock of red hair, freckles, a curled red moustache, green striped tights to the knee
    and wool socks, wrapped fists.

## The ten real fighters (light on their feet, legs and feet free to kick; three with a knee up ready to kick)

1. The Wandering Monk: shaven, a short grey beard; an ochre sleeveless wrap, wooden beads, loose grey trousers bound at the
   shins, bare feet; knee up.
2. The Pit Kicker: a crest of black hair, a goatee, cords round his arms, short green trunks, shins and feet bound.
3. The Savate Man: old French boxing that kicks; a curled moustache, slicked hair, a navy sleeveless top and long tights,
   laced pointed shoes, up on his toes.
4. The Wrestler: low and wide; shaved head, cauliflower ears, broken nose; a maroon singlet, leather knee pads, laced boots.
5. The Temple Fighter: a topknot, a teal tunic crossed at the chest, a cream sash, loose trousers wrapped from the shin.
6. The Sailor: a knitted cap, a striped sleeveless shirt, a red neckerchief, wide trousers rolled up, bare feet, tattoos.
7. The Veteran: grey and scarred, a patch over one eye, a short grey beard; trousers cut off at the knee, one shin bound and
   the other bare and scarred, leather straps on his fists; knee up.
8. The Tumbler: a fairground acrobat, lean and springy; a sandy ponytail, a short leather vest, two-tone tights, soft shoes.
9. The Caravan Guard: a cloth wound round his head, a black beard, a strap across his bare chest, loose ochre trousers,
   sandals and shin wraps.
10. The Hill Runner: long red hair tied back, a red beard, bare-chested, a green checked kilt, wool socks and brogues;
    knee up.

## How the pictures are made

- `src/dev/sculpt_brawler_looks.ts`: the twenty (`OLD_BOXERS`, `REAL_FIGHTERS`), each a build, a head (hair, whiskers,
  ears, nose, marks), fists (bare, wrapped, strapped, taped or gloved), a stance and clothes, sculpted on the heroes'
  bones with the classes' sculptor (`src/dev/sculpt.ts`, `src/dev/sculpt_classes.ts` manBody, manHead, tailorFor).
- `src/dev/preview_brawler_looks.ts`: the sheet. Made with
  `node tools/preview.mjs src/dev/preview_brawler_looks.ts docs/mockups/brawler_looks/pictures/boxers_sheet.png 1200 100 boxers`
  (and `fighters` for the other).
- `tests/brawler_looks.test.ts`: nothing of the game imports them; ten of each numbered 1 to 10; each painted about the
  knight's height. Rough, at his word: the full character checks (every pixel, eight turns) are for the one he picks.

## The better three (his pick of the fighters)

His words, 2 Nov 2026: “Show me a better 7, 2, and 1 of the fighters”. So the rework goes the real-fighter way. Each of
the three worked close: a face with character, whiskers and hair that read, clothes that hang and fold, wraps on shins,
feet and fists, the muscles drawn on the bare chests, fists bigger. Each is shown three times the game's size beside the
knight: standing in his fighting stance from in front (the game's three-quarter view), from behind (truly, turned, as the
classes' films are), and one still of him mid-kick; then all of it again at the game's own size. Still pictures only.

- `pictures/fighters_better.png`: the three, numbered 7, 2 and 1 as he named them, a line each.

7. The Veteran: a black leather patch over one eye, a pale scar down the other cheek, grey hair cropped, a grey walrus
   moustache and short beard, heavy brows; an old olive-drab vest hanging open on his chest; grey trousers hacked off at the
   knee, their hem ragged and their cloth creased; his right shin bound, his left bare and scarred; leather bracers, his
   knuckles strapped; his feet wrapped round the arch, toes and heels bare. His kick: a jumping knee driven up into
   whoever he has by the head, his hands reaching out to grab.
2. The Pit Kicker: his head shaved to a shadow at the sides under a tall crest of black spikes swept back; a goatee, a
   brass ring in his ear; bare chest with the belly's muscles drawn; short green trunks with an ochre stripe and a wide
   ochre waistband; cords round both arms; his shins and feet bound in grey; fists taped. His kick: a high kick out to the
   side, his rear arm flung back.
1. The Wandering Monk: shaven, a long drooping grey moustache and a short grey beard, heavy grey brows; an ochre wrap
   crossed over his chest, folded, tied with a maroon sash whose ends hang; big wooden beads; baggy grey trousers in folds,
   bunched where cream wraps bind them at the shins; his feet wrapped; his fists wrapped in cream. His kick: a flying
   kick, off the ground, his rear leg tucked under him.

Made by `src/dev/sculpt_brawler_looks.ts` (`BETTER_FIGHTERS`; each look's `kick` is its still, `close` its close pass) and
`node tools/preview.mjs src/dev/preview_brawler_looks.ts docs/mockups/brawler_looks/pictures/fighters_better.png 1200 100 better`.

## The Veteran (his pick, built new; pictures first)

### His words, in order (2 Nov 2026)

- 19:59: “Or we might have to do a rework of the brawler.  He’s not really what I’m looking for”; then “I think it can go
  two ways.  More of an old timey boxer.  Longer wind ups for hits so you have time for inputting combos.  Or an actual
  fighter, tap for punch, hold for kick, and swipe for jump to insert the swipe into the combo for jump kicks or flying
  uppercuts”; “Give me some possible looks, 10 for each”; “Just some rough ideas, don’t need some fully animated sprites
  or whatever”; “Show me a better 7, 2, and 1 of the fighters”; of the three: “7, the Veteran”.
- 21:41: “I’d like a headband that flows out behind him”. Told that with the eye patch and grey beard a flowing headband
  would make him look like a famous game character, his pick to keep him original: “Blind scarred eye (Recommended)”,
  offered as: no patch: a milky blind eye with the scar running through it, a long faded red headband streaming behind,
  his grey moustache and beard, a worn leather vest.
- How he fights: “If there’s going to be skins, then we want to just keep it clean” (punches and kicks only; other looks
  may become skins sharing his moves).
- How he moves: “So what I want is three empty globes above him.  Cyan is punch, pink is kick, and yellow is jump.  As you
  tap or hold, the globes fill and it locks in your combo.  And early swipe just does a jump, like inputting a dodge.  A
  swipe then an input puts the globe in either pink or cyan fire, and that’s the uppercut or jump kick.  I don’t want
  anything reused from the original brawler, we need a totally new look.  Going to have to be heavy and weighty so you
  have time to react and input to the situation.  As your attack speed goes up, hopefully you’ve learned the character
  and will be able to input the combos faster”
- Told that pink and gold glows are the enemy's by his rulebook, his pick: “Keep the rule (Recommended)”, offered as: cyan
  punch, hot orange kick, white jump; the fires cyan and orange.
- 22:06: “I gotta say it, follow all the rules.  I want him to look and play like an action movie hero.  Muscly, Bouncing
  on his toes”
- 22:09: “Here’s a gif of a jab cross uppercut hook.  Hook for regular punch, uppercut for jump punch.  Obviously we want
  it more exaggerated than this, but you get the basic idea before it gets all actioned up” (his reference: two men at pad
  work; used only for how the body turns and the fist travels, no one traced).
- 22:18: “Basic kick form”, with a picture of a switch kick (eyes on the target, the near fist guarding the face, the hips
  turned right over, striking with the shin, the support foot pivoted on its ball, heel toward the target; used only for
  the form, no one traced).
- 22:18: “No the jump kick will be different”; asked which (a flying side kick, a spinning jump kick, a flying knee, a drop
  kick): “Spinning jump probably, with a flying knee if it comes after two punches”.

### The picture

`pictures/veteran.png` (1200 by 4536; made again with his moves, for the two small changes to his figure below): him three times the game's size beside the knight, bouncing on his toes (down and
up), from behind and from the side, and all of it at the game's size; his six key poses, each its big held wind-up and its
strike, from the side as he fights toward the right of the screen, a pale streak showing the path of each blow, a shadow
under him when he is in the air, each pair again at the game's size; the combo globes over his head, three times the
game's size beside the knight (locked: punch, punch, kick) and in each of their eight states with him under them at the
game's size. Still pictures only: nothing is animated, nothing is in the game.

### What is new (nothing of the old Brawler)

He is built fresh in his own file: not the old Brawler's body, head, beard, fists, stance, clothes or any of his files
(nothing of `src/dev/sculpt_classes.ts`, the twenty looks or any brawler file, by a test that follows every import of his
files to the end). Only the shared tools every sculpted figure is drawn with: the sculptor (`src/dev/sculpt.ts`), the
heroes' bones (`src/art/skeleton.ts`) and the colours' kit. His own:

- AN ACTION-MOVIE HERO'S BUILD (his own; no actor's likeness, no known hero's): 58 tall, shoulders 1.4 and chest 1.36 times
  a usual man's over a waist of 0.84, limbs 1.3 times as thick; a head 1.72 times life so his face reads. Each muscle a
  shape of its own, melted only a little into the next so the cuts read: square breast muscles, the groove between them,
  six blocks down his belly, the obliques, the lats flaring, round shoulders, a peaked biceps, a horseshoe of triceps,
  forearms thick and veined (a dark line that wanders, a lit pixel on its crest), quads and flexed calves; the front of his
  chest and belly lifted a tone (as his face is) so the muscles read though he is turned from the light.
- HIS FACE: a big square skull, a block of a jaw, a jutting brow, a nose broken flat, one thickened ear; a short grey crop,
  heavy grey brows, a grey walrus moustache hanging past the corners of his mouth and a short grey beard, lifted light so
  they read on his tan; his right eye dark under its brow; HIS LEFT EYE MILKY AND BLIND, a dull grey-white (no glow), the
  scar running down through it from his brow (a notch of scar in the brow) to his cheek, a pale line with a dark edge.
  No eye patch.
- THE HEADBAND: long, faded red (a red gone dull, never pink), round his brow and knotted at the back; its two tails (about
  20 and 26 long) are ribbons of real shape that twist as they go, rippling more toward their frayed ends, streaming the way
  the air pushes them against how his head moves: back in his stance, swinging out as he winds up, flung straight back in a
  hook, whipping round with his hips in the kicks, trailing below him as he rises, spiralling up in the spinning kick.
  Kept clear of his body (a test).
- HIS CLOTHES: a worn brown leather vest open down his front over his scarred chest (two old pale scars with their
  shadows), its edges rolled and stitched, scuffed, a patch sewn on its back; slate trousers hacked off below the knee,
  the hem cut flat with tatters hanging; a broad black-brown belt, a dull iron buckle; his right shin bound in grey linen,
  his left bare and scarred across; linen round the arch of each foot and the ankle, toes and heel bare; leather bracers
  laced up the inside; BIG FISTS (7.4 across, four fifths of his head's 9.4), the fingers rolled under, the knuckles a ridge,
  the thumb locked over, a black-brown strap round the knuckles, across the back of the hand and round the wrist.
- HIS STANCE, BOUNCING ON HIS TOES: side-on, up on the balls of both feet, the toes flat on the floor and the heels up off
  it, knees soft, fists up, chest out. Two moments of the bounce: down (his hips 23.4 over the floor, heels 3.3 up) and up
  (hips 29.6, heels 6.0 up).

### His six key poses (each a big held wind-up, then the strike)

1. THE PUNCH, A HOOK (tap): wound right round away from them, weight back, the right elbow drawn back and up; then the hips
   and shoulders whip round through, the elbow high and bent, the fist swung round flat, the back heel spun up.
2. THE KICK, A ROUND KICK WITH THE SHIN (hold): a switch kick, his form picture's: the front knee hauled up and cocked on
   the ball of the back foot; then the hips turned right over, the leg whipped round flat at rib height landing with the
   shin, the support foot pivoted on its ball, heel toward them, the kicking arm swung down and back, the other fist up at
   his face.
3. THE JUMP, HIS DODGE (a swipe on its own): sunk deep, arms swung back; then up off the floor (his lowest 16 over it),
   knees tucked, fists up.
4. THE FLYING UPPERCUT, HIS JUMP PUNCH (swipe, then tap): dropped right down low, the right shoulder dipped, the fist by his
   knee; then driven up off the floor (13 over it), the fist rising past his face and over his head, the knee up.
5. THE JUMP KICK, A SPINNING JUMP KICK (swipe, then hold): sunk low, shoulders wound the other way; then off the floor (21
   over it) into a full turn, his back come round to them, the leg whipped round flat at head height, the other tucked; the
   streak an arc right round him.
6. THE FLYING KNEE (the jump kick when it comes after two punches): a low lunge in, both hands reaching; then leaping in
   (10 over the floor), the knee driven up into the chest or face, both hands out to grab.

### The combo globes (`src/dev/veteran_globes.ts`)

Three glass globes over his head, painted pixel by pixel at the game's size (each 11 across, 3 apart, room for fire over
them): EMPTY (dark glass, a pale rim, a glint); CYAN a punch (a tap; the friend's own cyan, `#22d0e0`); HOT ORANGE a kick
(a hold; a red-orange kept well off gold, `#e8561a`); WHITE the jump (a swipe on its own). Each fills from the bottom with
a bright top to it. Three in and the combo LOCKS: the rims go white and a white bar joins them. A swipe then a tap puts the
globe in CYAN FIRE (the flying uppercut); a swipe then a hold in ORANGE FIRE (the jump kick; after two punches, the flying
knee): three tongues of flame licking up round it, dark at their tips, hottest at the globe, inked round. Never pink, never
gold (a test).

### How it is made, and its checks

- `src/dev/sculpt_veteran.ts`: him (`VET_BUILD`, `VET_STANCE`, `VET_STANCE_UP`, `VET_MOVES`, `sculptVeteran`,
  `paintVeteran`); `src/dev/veteran_globes.ts`: the globes; `src/dev/preview_veteran.ts`: the sheet, made with
  `node tools/preview.mjs src/dev/preview_veteran.ts docs/mockups/brawler_looks/pictures/veteran.png 1200 100`.
- `tests/veteran.test.ts`: nothing of the game imports them; nothing of the old Brawler is in him or his globes (their
  whole import closure) or imported by his sheet; every pose from in front, from behind and from the side crisp, edged in
  the friend's cyan, no pink, nothing cut off, nothing in the floor, his arms clear of his trunk and his legs of each other;
  up on his toes at both moments of the bounce, the bounce more than 4 high; his leaps off the floor, his other poses on
  it; the tails two, each 18 long or more, never through him, their ends behind his face, moving with him from wind-up to
  strike; big fists; no patch, the milky eye; the six moves; the globes crisp, cyan and hot orange, never pink or gold.
- Not in the game: no switch, no moves in the game's moves, no animation. That comes after his yes.

### His moves (pictures first: a film and a sheet; nothing in the game, no switch yet)

His word on him as drawn, 2 Nov 2026: “Pretty good.  Those action lines will probably need to be bigger.  Remember, I’d
rather have to pull back from a 10 then build up from a 1.  In terms of awesome looking animations”. His rulebook's
Animations 1 (10 Oct): “Put in the ruleset that I want animations as big and wild and kinetic and weighty as possible.  I’d
rather it be a notch too high than a notch too low.” At 22:06: “I gotta say it, follow all the rules.  I want him to look
and play like an action movie hero.  Muscly, Bouncing on his toes”; and of his combos at 22:27: “Give me kick, spinning
elbow, kick for hold, tap, hold”. At 22:43: “Make sure his limbs all face the correct way, don’t make mistakes”; at
22:44: “It can be over the top, I just don’t want his foot facing backwards or something”.

So every move is his own, keyed on his own bones at 30 frames a second, each as his Movement 9 has it: a BIG HELD WIND-UP
you can read, the STRIKE IN ONE OR TWO FRAMES, a stop on the blow (its weight), a BIG WIND-DOWN, back up on his toes. His
feet grip the floor (a foot down stays where its ball is; a pivot turns on the ball). His headband's tails are blown by how
his head moves (whipping on a strike, trailing a leap, spiralling round a spin). And THE ACTION LINES ARE MUCH BIGGER than
the stills' streak: a great sweeping smear along every blow (13 pixels wide at the game's size on the heavy blows, 9 on the
jab, white-hot at its head; cyan for a punch, hot orange for a kick, as his globes are), after-images of him along the
strike, an impact burst where it lands (a jagged star, its spikes up to 26 pixels long on a heavy blow, a ring flung out round it), a
shockwave ring along the floor under every heavy blow, the whole picture shaken on the heavy hits, dust thrown off the floor
on every take-off and landing, speed lines behind every leap, stars round a stunned foe.

The moves, frame by frame (30 a second; the wind-up's last frame is held, the strike lands one or two frames later):

| Move | Put in | Frames (seconds) | The wind-up, held | The strike lands | What it does |
|---|---|---|---|---|---|
| Standing, bouncing on his toes | — | a 60-frame round (2.0 s) | | | four bounces, up high on his toes and sunk into his knees; fists circling; a roll of his shoulders and a tip of his head on the third; feet never leave where their balls are |
| Running | — | a 12-frame round (0.4 s), at the game's hero pace (4.6 tiles a second) | | | low and driving, knees high, heels flicked up, fists pumping hard by his sides, both feet off the floor for 7 of the 12 frames |
| The dodge jump | swipe | 40 (1.33 s) | 0–11, sunk deep, arms swung back | off the floor at 13 | a spring up and away a tile, his feet 27 over the floor (half his height), knees tucked, fists up; down at 25 deep in the dust; up on his toes by 40 |
| The jab | tap | 28 (0.93 s) | 0–11, coiled back, the fist cocked by his cheek | 12 (one frame) | a stamping step in and the lead fist shot straight out, palm down; stepped back out by 28 |
| The cross | tap | 28 (0.93 s) | 0–12, wound right back, the rear fist past his ear | 14 (two frames) | hips, shoulders and rear heel thrown round, the fist driven straight through, palm down; reels them |
| The hook | tap | 32 (1.07 s) | 0–13, his weight on his lead leg, wound left, the elbow drawn up | 15, and 16 on the second | everything whipped round, the lead foot pivoting on its ball, the elbow level, the fist flat across, palm down, through two of them side by side; carried on round |
| The round kick | hold | 36 (1.2 s) | 0–14: the switch (the lead foot hops back, down at 5), the knee hauled up and cocked | 16 (two frames) | the hips turned right over, the support foot pivoting on its ball till its heel points at them, the shin whipped round flat into the ribs; knocks them back; landed back in his stance by 36 |
| The push kick (new, 3 Nov) | hold, the first of the three kicks | 44 (1.47 s) | 0–15: the rear knee chambered high, the foot cocked, the toes back (held 10–15) | 17 (two frames) | the foot driven straight out heel first, his support foot flat, his body leaning back, fists guarding; a blast of force fans out from his heel along the floor and shoves back EVERYONE IN A CONE in front of him (60 degrees wide, 2.5 tiles long), the near ones first (a frame for each tile out); re-chambered; set down by 36 |
| The spinning elbow (made again, 3 Nov) | tap | 50 (1.67 s) | 0–18: a big coil, his hips turned round till his back is nearly to them, his chest wound hard against it (50 degrees), the rear arm folded tight across his chest, eyes on them over his shoulder (held 12–18) | 20 (two frames) | a whole turn on the ball of his lead foot (his weight right over it), his chest whipped round past his hips, the ELBOW leading at head height and pointing straight at them as it lands; the turn drawn as a great arc of light round him at head height (18–34, dying away by 39); the burst at the elbow; knocks them aside; round, and plainly back in his guard by 42, held to 50 |
| The flying uppercut | swipe, then tap | 46 (1.53 s) | 0–13, dropped right down low, the fist by his knee | 15 (two frames), as he leaves the floor | driven up through the chin and on over his head, his feet 27 over the floor, launching them into the air, stunned (stars); hangs at the top; down at 31 |
| The spinning jump kick | swipe, then hold | 50 (1.67 s) | 0–14, sunk low on his toes, wound the other way | the leg out by 16; the four round him caught at 16, 18, 20 and 22 | off the floor (15–29, his feet up to 31 over it) into TWO WHOLE TURNS, the leg whipping round flat at head height through everyone round him, each in his turn; flung away; down in a ring of dust |
| The spinning jump kick, closing in | swipe, then hold, first | 52 (1.73 s) | 0–14 | the leg out by 16, caught at 24 | the same, leaping 1.8 tiles in at them as he turns |
| The flying knee (made again, 3 Nov) | tap, tap, swipe and hold | 58 (1.93 s) | 0–19: a long step in onto his lead foot, sunk low (his hips 14.5 down) and leaning hard over it, his rear leg stretched back on its toes, both hands reaching up for their head (held 12–19) | 21 (two frames) | the leap (a tile in) and the KNEE DRIVEN UP into their chest and face, 43 over the floor: his thigh level, his shin tucked under it, the knee the leading point, both hands pulling their head down onto it, the other leg trailing; the burst at the knee; they are snapped back and flung to their knees; a HEAVY landing at 34 (deep, dust, a ring of force along the floor round his feet); up by 58 |
| Struck | — | 16 (0.53 s) | | the blow lands at 2 | his head snapped round and back, his weight driven onto his back foot; shaken off by 16 |
| His fall | — | 96 (3.2 s) | | the last blow at 2 | snapped round; two staggering steps back; down on one knee at 30, a fist on the floor; he pushes up and lifts that fist once more (58–66); it sinks, his head drops, the light goes out (66–92). He never lies down |

His six combos, each in the film in a row with the globes filling over him (cyan a tap, hot orange a hold, white a swipe;
locked when three are in; a swipe and then a tap or a hold sets that globe in cyan or orange fire):

1. tap, tap, tap: the jab, the cross, the hook. Steady damage; the hook catches two side by side.
2. tap, tap, swipe and hold: the jab, the cross, the FLYING KNEE. The strongest single blow.
3. tap, tap, swipe and tap: the jab, the cross, the FLYING UPPERCUT. Launches one into the air, stunned.
4. hold, hold, swipe and hold: the PUSH KICK, the round kick, the SPINNING JUMP KICK (his pick of 3 Nov, “Push kick, then
   round”). The push kick shoves back everyone in a cone in front of him; the spinning jump kick hits all round, for when
   he is surrounded.
5. hold, tap, hold: the round kick, the SPINNING ELBOW, the round kick (his 22:27). Knocks them back to make room.
6. A swipe first: the dodging jump; a swipe and hold first: a spinning jump kick that closes the distance.

Pictures: `pictures/veteran_moves.mp4` (the film: every move from in front and from behind side by side, at the arena's
scale with a stand-in foe; his six combos in a row with the globes over him; the biggest blows again at half speed);
`pictures/veteran_moves_sheet.png` (the key moments of every move, wind-up, strike and wind-down, and each combo's globes).

The stand-in foe (`src/dev/veteran_foe.ts`) is only something for his blows to land on: a plain hooded brute in sackcloth
with the enemy's pink rim, not a design for the game. He swings a haymaker, and is hit: his head snapped back (the jab),
reeling (the cross, the hook), knocked back sliding (the round kick), knocked aside (the spinning elbow), shoved back
doubled over (the push kick), launched up and down stunned (the uppercut), flung away to his knees (the spinning kick),
snapped back off his feet onto his knees (the flying knee).

How it is made: `src/dev/veteran_moves.ts` (every move: its keys, its strikes, its foes; his six combos), `veteran_fx.ts`
(the action lines), `veteran_foe.ts` (the stand-in), `veteran_scene.ts` (a picture of the arena at a frame),
`veteran_plays.ts` (the film's parts and captions); `tools/veteran_film.ts` makes the film
(`npx tsx tools/veteran_film.ts docs/mockups/brawler_looks/pictures/veteran_moves.mp4`), `tools/veteran_sheet.ts` and
`tools/veteran_sheet.py` the sheet. Two small changes to his figure (`sculpt_veteran.ts`): a palm way of its own for each
fist (a hook's palm down, an uppercut's toward him), and the muscles on his upper arm kept square to each other (pointed
straight out to his side, they had flattened into a slab).

Its checks (`tests/veteran.test.ts`), every frame of every move, from in front and from behind: crisp, the friend's cyan
edge, no pink, nothing cut off, nothing in the floor, his arms clear of his trunk and his legs of each other, no solid
flattened; slick (nothing leaps, stalls or turns straight back at speed but the strike itself, a landing's jolt and a
whirl faster than 40 degrees a frame); a foot down on the floor never sliding. EVERY JOINT INSIDE WHAT A BODY CAN DO (his
22:43): every knee folded no tighter than a knee folds and never past straight, bending toward where its toes point; every
ankle within what an ankle does; no standing foot turned more than 110 degrees from his hips (never backwards); every elbow
folded no tighter than an arm and never past straight, never pointing into his own body; every fist turned as a forearm
turns it (palm toward the biceps, in, or away, never past); the spine never twisted past 62 degrees or bent past what a
back bends; the head never turned more than 95 degrees from his chest; his left shoulder and hip always on his left, and
each hand and foot nearer where it was a frame before than where its fellow was (never swapped). Each strike one or two
frames from the held wind-up, its smear at least 150 pixels; the wind-up held (its last two frames barely move); the
globes in every frame of the film never pink or gold; nothing of the game imports any of it, and nothing of the old
Brawler is in any of it.

Choices made for the film that he may want to call:

- The hook in the moves is thrown with his LEAD (left) fist, so that jab (lead), cross (rear), hook (lead) flows as one
  combo; the still of the hook showed the rear fist.
- A punch's lines are cyan and a kick's hot orange, as his globes are (tap cyan, hold hot orange); the enemy's blow on him
  bursts white and red. Never gold.
- The foe stands a little to his left (about 15 degrees off straight ahead) so that, from in front, the foe does not hide
  him; from behind is the same scene turned a quarter, truly (no mirror).

### His word on the moves, and the fixes (3 Nov 2026)

His words, 3 Nov 2026, 00:34: “I’m digging it.  I think his elbows are out a little too much in his stance.  And the knee and
elbow need a little work.  But it looks great and I think we’re on the right track.” Asked what is off with the flying knee
and the spinning elbow, his pick: “Read better (Recommended)”, offered as: the knee driven up clearly into them and the
elbow's swing plain to see, with bigger wind-ups and hits. At 00:36: “And the 3 kick combo seemed like two of the same
kicks”; asked what the second kick should be, his pick: “Push kick, then round”, offered as: first a straight push kick that
shoves them back, then the round kick, then the spin. At 00:37: “Push kick hits in a cone in front of”.

What changed:

- HIS STANCE: a fighter's guard. His elbows IN, tucked down in front of his ribs (each pointed down and a little forward,
  `GUARD_ELBOW` in `sculpt_veteran.ts`); his forearms up guarding his face; his fists by his cheeks (the lead one a little
  further out); still up on his toes, bouncing, muscled. In the old stance his elbows stood out 7 to 9 beyond his
  shoulders; now they are inside them (about 7 out from his middle, his shoulders 10.3). Every move that starts or ends in
  his stance follows, and every guarding fist inside a move (the jab's, the cross's and the hook's rear guard, the round
  kick's, the push kick's, the spinning jump kick's) has its elbow tucked the same way (the hook's rear fist rides up by
  his temple, out of the way of the lead fist swung across).
- THE FLYING KNEE, made again to read at a glance (in the table above): a longer, lower lunge held 7 frames; the leap; the
  knee driven up into their chest and face (thigh level, shin tucked under, the knee leading, both hands pulling their head
  down onto it); its smear 22 wide at the game's size (13 before), painted under him so that the knee is seen leading it;
  the burst at the knee the frame after it lands; they are snapped back off their feet; a heavy landing with a ring of
  force along the floor.
- THE SPINNING ELBOW, made again so that the swing is plain to see (in the table above): a bigger coil; a whole turn whose
  path is drawn as a great arc of light round him at head height (10 wide at the game's size, just beyond the point of his elbow), the elbow
  its leading point, the forearm folded tight across his chest; the strike's smear 18 wide, under him; the burst at the
  elbow the frame after it lands; they are knocked aside (sent off 40 degrees to the side of straight back); a clear return
  to his guard, held.
- THE PUSH KICK, new, the first of the three kicks of combo 4 (in the table above). FOR THE MAIN CHAT: it hits everyone in
  a CONE in front of him: 60 degrees wide (30 either side of straight ahead) and 2.5 tiles long (98 of his measure; a tile
  is 39.2), measured from his heel at full stretch along the way he faces; each foe in it is shoved back (up to 38 of his
  measure, a little under a tile) and comes back in; the near ones are hit first, a frame later for each tile out
  (`PUSH_CONE` in `veteran_moves.ts`). Drawn as a blast of force along the floor from his heel: a hot orange glow over the
  whole wedge, its two edges, eleven streaks racing out to its front, a fan of dust rolled up along the front; out to its
  full length in 7 frames, gone by 14. The film shows it with three foes in the cone and one outside it (not hit).
- COMBO 4 is now push kick, round kick, spinning jump kick (in the film with three round him and two more in the cone in
  front). A single hold on its own is still the round kick.
- The film and the sheet made again: the push kick in the moves; the knee and the elbow made again; the half-speed parts
  now the push kick, the spinning elbow, the flying knee and the spinning jump kick (58.8 s in all).

Pictures: `pictures/veteran_fixes.png` (1200 wide): his stance before and now, from in front (down and up in the bounce)
and from behind; the flying knee and the spinning elbow before and now at their key moments (the wind-up held, the blow,
just after, the end); combo 4 before (two round kicks the same) and now (push kick, round kick, spinning jump kick), at each
kick. `pictures/veteran_moves.mp4` and `pictures/veteran_moves_sheet.png` made again (the same parts as before, the push
kick added). `pictures/veteran.png` made again for the new guard. Made with `tools/veteran_fixes.ts` (run once in the old
version's files and once in these) and `tools/veteran_fixes.py`.

Checks (`tests/veteran.test.ts`, every frame of every move from in front and from behind, his joint rule now in
`tests/veteran_checks.ts` so that tools can use it too): all as before, with the push kick among the moves; and new: his
stance's elbows tucked inside his shoulders and below his fists, the fists by his cheeks; the push kick's cone 60 degrees and
2.5 tiles, every foe in it hit and none outside it; the knee at the blow level with his hip and leading (the furthest
forward of him), the elbow at the blow at head height and pointing at the foe; combo 4 three different kicks.

One thing for the owner or the main chat: a first hold is the push kick in combo 4 (hold, hold, swipe and hold) but the
round kick in combo 5 (hold, tap, hold), and on its own. The game cannot know which combo is coming at the first hold, so
in the game the first hold must be one of the two: either the push kick starts every kick combo (combo 5 would become push
kick, spinning elbow, round kick), or the round kick does and the push kick is the second hold. Pictures only so far; his
call.
