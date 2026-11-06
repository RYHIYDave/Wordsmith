# The Warrior brought up to the Brawler's level (the art chat's helper, 6 Nov 2026)

Branch `art/warrior-up`, from `origin/work-f4` (55e91f22). A mock-up behind a switch that is off, `WARRIOR_UP` (in
`src/art/warrior_up.ts`). With it off, the game's Warrior is exactly as he is: every frame the same picture, by hash.
The Warrior (the knight) only; the Ranger and the Mage come after, the same way.

## His words

- 6 Nov 2026, asked whether to bring the other heroes up to the Brawler's smoothness: “Like is yes I’d like everything
  brought up to the same 30 drawings a second for all the character models, but I’d also like the first three Warrior Ranger
  and mage updated to the level of the brawler in terms of the rules that we have set for the rest of the drawings I don’t
  want them to lose the aesthetic or the flavor that they currently have but I think like the shapes rule the action rule we
  kind of want all that updated to a certain level certain benchmark as the rest of the characters so that they’re all at
  the same level.”
- 6 Nov 2026, 16:32, to the main chat: “...this is not a browser game.  It will be a game in an app.  So not everything
  needs to be done and coded in Java.  We can have files and create things that go into the game like music and art”
- 6 Nov 2026, 15:18: “Everything drawn should not just look like shapes.  That’s the rule”
- 6 Nov 2026, of deaths: “too many death animations are fall to knees, then fall forward, elbows out”

So: his look and flavour kept (his pointed helm, his red tabard and its pointed skirt, his dark red scarf whose two ends fly,
his steel and mail, his plum gloves and belt with its cyan buckle, his glowing great sword, his broad build and his rear
guard: a player knows him at a glance); how well he is drawn and how he moves brought up to the Brawler in his Veteran look.

## The pictures (`pictures/`)

- `warrior_up_sheet.png` (1200 wide): before beside now, three times as big, from in front and from behind: his stance, his
  run, his class card's ready, the key moments of each attack (the held wind-up, the smeared strike, the wind-down), his fall;
  and at the game's own size.
- `warrior_up.mp4` (30 frames a second, H.264): every list before and now side by side, both ways round, three times as big
  and at the game's own size; each strike again at half speed; his class card's standing loop before and now, side by side.

His scarf's two ends are not in his frames: the game hangs them from where each frame fixes them and moves them itself
(`engine/tails.ts`), so they follow everything he does, in the world. In the pictures they are moved the same way.

## The audit: where he fell short (before)

Held against each rule and the Veteran, list by list. The numbers are the bosses' review (`src/art/boss_checks.ts`
`checkBoss`) run on his moves as they are in the game, with his outline (`warrior_up_review.ts`), from in front and from
behind; slides in game pixels.

| List | As it was | Where it fell short |
|---|---|---|
| Standing in his guard (rear) | 20 pictures at 10 a second (2 s) | Not 30 a second. Barely alive: his chest rose 0.4 of a game pixel (the review asks 0.6), no shift of his weight, no habit. |
| In town and on his class card (ktown) | 12 at 10 a second (1.2 s) | Not 30 a second; breathing only. |
| Looking about him (klook) | 73 at 20 a second | Not 30 a second (its keys were eased: kept). |
| His card's ready (kdraw) | 41 at 30 | His feet slid as he stepped into his guard (up to 5.5 game pixels); the blade passed through his right arm once. |
| Running (krun, ktownrun) | 15 at 30 (a half-second turn) | HIS FEET SLID: the game carries him 4.6 tiles a second and his feet went back slower (up to 3.3 game pixels a step). The gripping run the art chat made on 8 Oct was never switched on for him (`GRIP` off). No coming to a stand or setting off (the Ranger and the Mage have them). |
| Strike, the first swing | blow at 4 frames (0.13 s) | No held wind-up (a two-frame coil, then the blow): Movement 9 not met. The blade passed through his left arm once. |
| Strike, the second swing | blow at 4 | No wind-up at all from the sword held up; its strike not a flash (its slowest step 6.6 against a wind-down step of 17). |
| Slam | lands at 7 frames | No held warning at the top; its blade turned straight back at speed on the way up; his left arm in his helm at the top; his front foot slid back after it (4.8). |
| Whirlwind | 8 frames a turn | Both feet carried round in a ring on the floor: slid up to 13.7 game pixels. |
| Lunge (the diving thrust) | 0.5 s dive, 0.5 s landing | Its first picture leapt from his stance (the sword 22 pixels at once); the point never drawn back before it punched out; his feet slid as he set off and as he rose (3.0). |
| Struck, in front and behind | 7 frames | The foot that caught him came down and slid back to its place (2.3 to 2.5). |
| His fall | 46 frames | His feet slid as he gave ground and knelt (up to 4.0). He kneels behind his sword and stays kneeling (not the “fall to knees, then fall forward, elbows out” he named), but it is a fall to the knees and nothing more. |
| Every list: his shapes | balls and rods, each on a sheet of its own, ringed in ink | His helm a ball, his pauldrons balls, his arms and legs tubes, his tabard a stack of balls: “circles and squares slapped together” (his rule of 24 Oct, How art is made 9) and “Everything drawn should not just look like shapes”. |
| Loose things | his scarf's ends (the game's: they follow); his skirt left behind by one frame | The skirt hung from a ring and swung little; nothing else hangs. |

## What changed, and why

### How he is drawn: SCULPTED, as the Veteran is

`src/art/warrior_up.ts` `paintWarriorUp`: the same man on the same bones (moves3.ts `KNIGHT_BODY`), sculpted with the
classes' sculptor (`src/dev/sculpt.ts`): each solid melted into the next of its stuff, one body with a real outline, inked
only where one stuff meets another or one part passes in front of another. Why sculpted and not his old painter improved:
the old painter can only lay balls and rods each on its own sheet, ringed in ink, which is exactly what the shapes rule
forbids; the sculptor is what made the Veteran read as one body. His frames cost more to paint (below), which, now that the
heroes are baked into picture files when the game is built, is no longer a reason to hold him back.

- THE HELM: a round skull of steel with a ridge along its crown and a brow band, the visor grown out of it to its point (his
  pointed helm), the two slots he sees through with a point of light in each, the holes he breathes through.
- THE MAIL: a coif at his neck; his thighs and upper arms in mail, rows of rings drawn on it.
- THE TABARD: one body of red over the mail, a deep broad chest drawn in to a thick waist; the belt over it with its cyan
  buckle.
- THE SKIRT: closed round his hips, split below into eight panels each cut into a point (his skirt was always cut into
  points). Each hangs plumb from the belt and is pushed out only where a thigh comes against it, so it reads as a split skirt,
  never as trousers; it is left behind by how far his hips have come over the last three frames (it follows), swings with the
  wind, and lies along his thighs when his hips tip far over (the dive).
- THE SCARF: wound thick round his neck, its folds over the top of his chest; its two ends the game's own, as before.
- THE ARMOUR: each pauldron a dome over the point of the shoulder with a lame under its rim; couters, vambraces, plum gloves
  with flared cuffs round the grip; knee cops with their fans; greaves over shin and calf; pointed steel shoes standing on
  the floor.
- HIS COLOURS: his own three tones of each (STEEL, MAIL, PLUM, his red, his wine scarf), with a tone between each two so the
  sculpted surfaces turn in the light; his darkest and lightest exactly his. The great sword is his: the same blade, its glow
  and its lights. His edge of light the friend's cyan; his pool of cyan light behind him as every hero's.
- Far limbs a tone darker, as the Veteran's.

### How he moves (`src/art/warrior_up_moves.ts`)

Every list at 30 pictures a second (his run, which grips the floor, at 60 as the Ranger's and the Mage's are: a picture for
each of the game's steps). Keys eased in and out. Every move through every boss check (below).

- STANDING, ALIVE (2 s, 60 pictures): two breaths, his weight going over onto his front foot and back, the point stirring
  behind him; once a round, a habit of his: his chin comes up, his eyes go to his right, his hands roll on the grip. His feet
  never move.
- IN TOWN AND ON HIS CARD, ALIVE (2.4 s, 72): two breaths, his weight settling onto his left leg, a roll of his shoulders, a
  look along the street.
- RUNNING: his own run made to grip (a turn of it in 27 sixtieths of a second, each foot on the floor going back exactly as
  fast as the game carries him), driving lower and harder; in town the same. And now, as the Ranger and the Mage have: eight
  ways of COMING TO A STAND out of it (each foot set down where his stance has it, lifted to get there), and SETTING OFF
  into it.
- STRIKE, THE FIRST SWING (a rising cut), BY MOVEMENT 9: a skip-step in as the game's step carries him (both feet off the
  floor); the WIND-UP, big: sunk deep on his back leg, wound right round away, the hilt drawn back past his hip and the blade
  swung back and up behind him, its point high over his right shoulder; HELD (frames 6 to 8); THE STRIKE in two frames,
  smeared with after-images (9: the blade dropped low behind him, the hips whipped round; 10: the blow, level across his
  chest, his weight driven onto his front foot); the blow lands with a freeze (his rulebook's Movement 7); the WIND-DOWN, big:
  on up over his left shoulder, all of him turned after it, the sword held up there (to 21: the second swing begins from
  here), then lowered round behind him into his guard (36).
- STRIKE, THE SECOND SWING (a downward slash): a skip-step in; the WIND-UP: the blade laid right back over his left shoulder,
  the hilt up by his head, HELD (6 to 8); THE STRIKE in two frames (9, 10: down the way it went up and through the front of
  him); a freeze; the WIND-DOWN round and down behind his right side and up into his guard (27).
- SLAM: the WIND-UP, the hilt up before his face and on over his head, up onto his toes, back arched, the blade far back
  behind him; HELD (11 to 13); THE STRIKE in two frames: his hips tip him forward off his toes, the front foot stamping a
  stride on (14), the blade over and buried in the floor ahead (15); the WIND-DOWN: the weight of him on down after it, drawn
  out and round his right side, and a step back into his guard (34).
- WHIRLWIND (once round in 8 frames, as before): lower, leaning harder out against the blade's pull, the blade at full
  stretch and smeared all round; HE PIVOTS ON THE BALL OF HIS LEFT FOOT, which stays on its spot, his right foot swung round
  off the floor (both feet slid round a ring before).
- LUNGE (the diving thrust, his leap since 17 Oct; the game carries him through the dive as before): its first picture now
  his stance's sword (nothing leaps as the game begins it), the blade swung forward as he drives off; coming down, THE POINT
  DRAWN BACK and HELD as his front foot reaches for the floor, and PUNCHED OUT as he lands (the blow, at 0.5 s as before);
  the landing deeper and held; his front foot lifted and brought home as he rises.
- STRUCK, from in front and from behind (7 frames, as before): rocked harder, his head snapping after his chest, the foot
  that catches him swung out and back off the floor (it slid before).
- HIS FALL (46 frames, as before), A HERO'S: not to his knees and then forward. Thrown back, he gives ground two steps, each
  foot lifted and set down; the great sword comes round and he drives it point down into the floor before him and holds
  himself up on it, head up; his knees go and he comes down hard on one knee behind it; ONCE MORE HE PUSHES UP on the hilt,
  half rising, his head coming up to whatever killed him; it fails, he sinks back, and his head bows over his hands on the
  hilt as the light goes out of the blade. He is left kneeling behind his sword, upright.
- HIS CARD'S READY (drawing his sword when picked) and LOOKING ABOUT HIM: as they were, their keys already eased, now at 30
  a second; the draw's feet mended (his right foot steps back as the blade comes off his back; his left steps out into his
  guard as it falls behind him), then his guard, alive.

## His numbers (FOR THE MAIN CHAT)

What changes in the game's numbers, only with the switch on:

| | Before | Now |
|---|---|---|
| Strike's blow (both swings) | 4 frames, 0.133 s (the rules' `strike.windup` 0.12) | 10 frames, 0.333 s: set `SKILLS.strike.windup` to 0.333 with the switch |
| The first swing waits, sword up (`poise`) | 15 frames, 0.5 s | 21 frames, 0.7 s |
| The first swing's length | 28 frames (0.93 s) | 36 frames (1.2 s) |
| The second swing's length | 14 frames (0.47 s) | 27 frames (0.9 s) |
| Slam's blow (its `heavy`) | 7 frames, 0.233 s (`slam.windup` 0.22) | 15 frames, 0.5 s: set `slam.windup` to 0.5 |
| Slam's length | 18 frames | 34 frames (1.13 s) |
| The game's step on each swing | 0.33 tiles over 0.12 s | the same: he skips in on it (both feet off the floor) before his wind-up |
| Lunge, Whirlwind, struck, his fall | | the same times and lengths: the dive 0.5 s (16 pictures by how far through), the point out at 0.5, the landing 15 frames; once round in 8; 7; 46 |
| His card's ready | ready at 31 frames | the same (31); the card shows 41 frames, as before |
| His run | 15 at 30 a second, by the clock | 27 at 60, by how far he has gone (`walkStride` 2.07 tiles), as the Ranger's |

Strike at 0.333 s in place of 0.12 is his Movement 9 (“Like the wind up and wind down are big but the actual punch is
lightning quick”) for his quick attack; the Veteran's jab lands at 0.4 s. It makes the Warrior's basic attack slower to
land: the owner's to weigh (below).

## The measures

Every frame the game holds of him, in a dungeon, in town and on his class card, both ways round (`tools/warrior_up_measure.ts`;
this machine: 2 cores, shared and busy):

MEASURES_TABLE

## How the main chat brings him in

1. Merge `art/warrior-up`. Nothing changes while `WARRIOR_UP.on` is false (tests/warrior_up.test.ts holds every frame to its
   hash).
2. On the owner's yes to the pictures: set `WARRIOR_UP.on = true` in `src/art/warrior_up.ts`, and with it the rules' numbers
   above (`SKILLS.strike.windup` 0.333, `SKILLS.slam.windup` 0.5 in `src/game/defs.ts`; `TUNE.comboWindow` as the main
   chat sees fit, the first swing now waiting to 0.7 s). `art/heroes3.ts` `makeHeroArt3` then gives his new lists in the very
   shape it gave the old (`makeWarriorUpArt`), so the renderer, the class cards and the side painter (`HERO_PICKS`,
   `heroLists`) need nothing new.
3. THE SIDE PAINTER'S WORKER (`render/painter.ts`) makes its own `makeHeroArt3`: it must know the switch, as it is told
   `vet` for the Veteran (the worker has no switch of its own), or the lists it paints are the old knight's.
4. BAKING (25.0.9): bake him from `makeHeroArt3().of('warrior', lookOfPlace(place))` with the switch on, every list of
   `heroLists(set)` for each place and both views. A list the same in two places is the same array (his attacks, his
   Lunge, struck, his fall in every place; his town lists on his card): bake it once.
5. The tests: `tests/warrior_up.test.ts`; when the switch goes on, its first test (the switch off) and the hash test change
   with it, and `tests/heroes3.test.ts` and `tests/warrior_thrust.test.ts` ask of the old knight's moves (moves3.ts), which
   are not changed.

## The checks (`tests/warrior_up.test.ts`, all passing)

1. The switch is off; of the game only `art/heroes3.ts` imports the new files, and only to go through the switch; nothing of
   the game imports his review. With the switch off, every list the game holds of him (88 lists, 1,450 frames, every place,
   both ways) the same as before: each list's first, middle and last frame held to the hashes made before any of this
   (`tests/warrior_up.hashes.json`; `WARRIOR_UP_ALL=1` for every frame).
2. With it on: every list at 30 pictures a second (his run at 60, gripping, its stride), his stops and his setting off; a list
   the same in two places one list.
3. EVERY FRAME OF EVERY MOVE THROUGH EVERY BOSS CHECK (`checkBoss`: feet that grip, nothing in the floor, arms clear of his
   body and helm, his sword through nothing of him, nothing jerks or jumps, every blow drawn back, held and carried through
   with the hips first, each strike a two-frame smeared flash, alive when still), his fourteen moves from in front and from
   behind, with the game's handovers between them (his stance into each and back, the first swing's poise into the second).
4. Nothing of him through what he wears: no pixel of his mail seen from inside his tabard, its skirt, a pauldron or his scarf
   (`wuCoverFindings`), every frame of every move, both ways; and the check sees mail that is put through (a test).
5. His feet grip in the run: each foot on the floor goes back as fast as the game carries him (under a game pixel).
6. Crisp (every pixel whole or empty but his edge); the friend's cyan edge round him (out with his light as he falls, as
   every hero's); his pool of cyan light; his lights cyan; nothing of the enemy's pink or gold (his own wine scarf and plum
   are his colours since 6 Oct, not the enemy's: the test knows them); nothing cut off.
7. His hits and lengths as above; each blow by Movement 9: held, two frames, smeared only then, wound up far.

tsc clean; the heroes' tests pass (`tests/heroes3.test.ts`, `tests/warrior_thrust.test.ts`, `tests/wild.test.ts`,
`tests/grip_runs.test.ts`, `tests/heroes.test.ts`, `tests/cheap_heroes.test.ts`, `tests/bosses.test.ts`).
`tests/bosses.test.ts`'s check that nothing of the game imports the bosses' checks now skips `art/warrior_up_review.ts`
(his review), the one change to an existing test.

## For the owner or the main chat to decide

- STRIKE LANDS LATER: 0.333 s in place of 0.12 (Movement 9's held wind-up). The Warrior's quick attack becomes slower to land;
  the main chat may want to look at its damage or attack speed with it.
- THE WHIRLWIND'S START AND END: the game cuts straight from his stance into the spin and back (it has no picture of either),
  so the picture jumps there, now as before. A wind-up into it and a wind-down out of it would need a place for them in the
  game's lists.
- His skirt is now eight panels split below the hips (it was one cloth with a ragged hem): it reads as a split skirt and
  never as trousers, and lets his legs move; his look otherwise as it was.
- Made with: `npx tsx tools/warrior_up_pics.ts sheet <dir>` and `python3 tools/warrior_up_pics.py sheet <dir> <out.png>`;
  the same with `film` for the film. Measured with `npx tsx tools/warrior_up_measure.ts count [up]`.
