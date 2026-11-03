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

`pictures/veteran.png` (1200 by 4548): him three times the game's size beside the knight, bouncing on his toes (down and
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
