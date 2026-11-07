# The Ranger brought up to the Brawler's level (the art chat's helper, 6-7 Nov 2026)

Branch `art/ranger-up`, from `origin/art/warrior-up` (d31abc22), with the Warrior's newest (9057f94b: his legs true, his eight
truly painted sides, his sword in sight, his grounded run) merged in. A mock-up behind a switch that is off, `RANGER_UP` (in
`src/art/ranger_up.ts`). With it off the game's Ranger is exactly as he is: every frame the same picture, by hash
(`tests/ranger_up.test.ts`). With it on, `art/heroes3.ts` gives his new lists in the very shape it gave the old.

THE WHOLE JOB (stage 2, on his yes): his look sculpted, his cloak from behind made cloth, all eight sides painted (none
mirrored), his legs' lengths mended IN HIS BONES (his knee joint raised a little; 7 Nov, at his word, his stances' legs exactly
the game's again, never re-posed, never bow-legged), his bow seen from every side, his run a hunter's and never a high-step,
every list at 30 a second, the Shot and the Volley by Movement 9, the measures, the pictures, the film, the tests.

## His words

- 6 Nov 2026, asked whether to bring the other heroes up to the Brawler's smoothness: “Like is yes I’d like everything
  brought up to the same 30 drawings a second for all the character models, but I’d also like the first three Warrior Ranger
  and mage updated to the level of the brawler in terms of the rules that we have set for the rest of the drawings I don’t
  want them to lose the aesthetic or the flavor that they currently have but I think like the shapes rule the action rule we
  kind of want all that updated to a certain level certain benchmark as the rest of the characters so that they’re all at
  the same level.”
- 6 Nov 2026, 15:18: “Everything drawn should not just look like shapes.  That’s the rule”
- 6 Nov 2026, of the Warrior's swing landing later by his wind-up rule: “Yes, the held wind-up (Recommended)”.
- 6 Nov 2026, of the Warrior brought up: “All of it is good, I just wish the helmet looked a little better.  I really like
  the look of his old pig helmet but it looks old.  And the visor slit never really pops.  And is it worth it to do the 8
  sides during this process in tandem”; then “Yes, 8 sides now (Recommended)”, and “Yes, hand him over (Recommended)”.
- 6 Nov 2026, 19:21: “Can you show me the ranger redone before you go too crazy with the drawings?”; and “Just a still of
  him”.
- Having seen the still: “Can you make sure his leg ratio is correct cause it seems like all these guys have long upper legs
  and short legs below the knee”.
- 6 Nov 2026, of the Ranger's mended still: “Yes, go ahead (Recommended)”; of mending every hero's legs: “Yes, every hero
  (Recommended)”. He asked, “Are you actually painting 8 drawings or flipping some?”; told five were painted and three
  mirrored, he picked “Paint all 8 (Recommended)”. At 23:35: “k im going to bed so keep going with the 8 characters and ill
  check back in the morning”.
- 7 Nov 2026, of the Warrior's re-posed run: “all that time and you screwed up his run.  why is he high stepping with his
  knees up?”
- 7 Nov 2026, 07:10, having seen him brought up: “You just need to fix the rangers wide leg stance, that’s all that’s weird”.
- 7 Nov 2026, having seen his stance at the game's width (a7e24935, his back foot turned right out and its knee over it) beside
  the game's and the wide one: “Cmon.  He’s not a gunfighter why is he so bow legged.  Just please do it right, I don’t want to
  have to correct every single one of these because we made a minuscule change to the leg length”. Done (below, "His legs"): his
  stances' legs exactly the game's, every re-posing taken out; what he asked of the legs made a small change to his bones.
- Kept from before: 7 Oct, of his face, “10 for ranger but a brown mustache”; 6 Oct, of the Volley, “The rogue drops to a
  knee when he fires Volley”; 6 Oct, of his run, “i like where the bow is at tho”.

So, as with the Warrior: his look and flavour kept, and where a loved piece of it reads old, that same piece made new. His face
and head read at a glance at the game's size.

## The pictures (`pictures/`)

- `ranger_up_sheet.png` (1200 by 6770) and `ranger_up_sheet_2.png` (1200 by 7182, its continuation; one sheet would be 13,950
  tall): at the top, HIS GUARD, the game's and now side by side, from in front and from behind, three times as big and at the
  game's own size; on each leg a thin line from his hip to his foot and his knee marked, so the eye can see it is not bowed; under
  each how far each knee lies outside its line, and under them all, through his guard, from each of his eight sides, the game's
  and now; his bones before and after. Then HIS RUN SIDE-ON, eight frames of a stride before and now, the swinging thigh's angle
  from hanging under each. Then BEFORE beside NOW for every list, three
  times as big, from in front and from behind: his guard, his run, the Shot (the held draw, the release with its after-image,
  the follow-through), the Volley (the same, on his knee), his roll (over in a ball; down on his feet), struck from in front and
  from behind, his fall, the
  squirrel, the sighting, his town stance and run, his card's ready. At the foot, each again at the game's own size.
- `ranger_up_sheet2.png` (1440 by 3126): HIS HEAD six times as big in his guard, before (in front, behind) and now from each of
  his eight sides; then HIS EIGHT FACINGS, twice as big, each laid where he faces: his guard, a stride of his run, and the
  Shot's release with its after-image.
- `ranger_up.mp4` (39.9 s, 1100 by 1060, 30 a second): running a circle through all eight facings; shooting each of the
  eight ways; then before and now for every list, in front and behind (his guard, his kneel, everything he does, on his bones as
  they are now and in the game's own stances); the Shot and the Volley again at half speed.
- `ranger_look.png`: the stage-1 still (before, his first sculpt, and the first re-posing of his legs, since taken out), kept as it
  was.

LOOKED AT CLOSE, at the game's size: his face (two dark eyes on his lit face, the brown moustache under them, from every side
that shows it; a test holds it); his cloak from behind (cloth from the shoulders, folds that break at the hem, the hood);
his bow from every side (below); his guard beside the game's (7 Nov): the same low hunter's crouch, his front foot ahead and
its knee over it, his back leg under him and its knee in, not a gunfighter's; his Volley's kneel as the game's.

## The audit: where he fell short (before)

- DRAWN AS SHAPES: balls and rods each ringed in ink (`hero3_ranger.ts`); from behind, his cloak a striped block and his
  hood a lump; his face hidden under his cap's brim at the game's size.
- TWO SIDES, MIRRORED: the game draws him from in front or from behind and flips him for the left, his bow changing hands.
- LEGS SHORT BELOW THE KNEE: standing straight, knee to floor 1.16 times hip to knee; in his crouch, on the screen, from in front
  0.65 of the thigh, from toward the camera 0.43 (table below).
- HIS RUN A HIGH-STEP: the swinging thigh up to 71 degrees from hanging (62 in town).
- HIS BOW: held nearly upright before him (canted 18 degrees); from straight behind him (a side the game did not draw) his
  body hid it.
- HIS SHOT A SNAP: the arrow away at 5 frames (0.167 s), no held draw, no follow-through to speak of; the Volley the same
  (6 frames).
- His stance at 10 a second, the squirrel and the sighting at 20.

## What changed, and why

### How he is drawn (`src/art/ranger_up.ts` `paintRangerUp`)

SCULPTED as the Warrior brought up and the Veteran are (`src/dev/sculpt.ts`): one body with a real outline, each solid melted
into the next of its stuff, inked only where one stuff meets another or a part passes in front. His look kept: his wide soft
teal cap and its long glowing feather (the game's own feather, `engine/tails.ts`); his bare face and brown moustache; his pink
neckerchief; green jerkin with a skirt cut into leaf points; leather bracers and gloves; dark hose and tall soft boots; his
teal cloak; his quiver of glowing fletchings; his long indigo bow, its string the friend's cyan.

- HIS FACE POPS: head 1.1 times the build's and set a little up his neck; cap pushed back off his brow (16 degrees) and cocked
  (12), so its brim no longer hides his eyes; two dark eyes, each two pixels tall under a dark brow, on lit skin; the
  moustache full and broad, its ends drooping past his mouth.
- HIS CLOAK, REAL CLOTH: one sheet hung from his shoulders (its top rows follow his chest as he turns), twelve columns of folds
  that run down it, alternately standing out and falling in, each fold shaded as cloth is (dark in the hollows, lit on the
  ridges), breaking at the hem into points; left behind by his hips over the last frames and stirred by the wind.
- HIS HOOD, A HOOD: a soft cowl lying on his shoulders under his cap, its point hanging down his back, lighter on its point;
  its mouth dark where it opens round his neck. His cap cut clean at the nape, its back edge dark, so cap and hood read as two
  things from behind.
- HIS QUIVER: on his back outside the cloak, its mouth flared over his right shoulder, stitched bands round it, five arrows in
  it, their cyan vanes standing out of it.
- HIS BOW: two limbs of indigo wood curving back from a leather grip, the tips curled forward (a recurve) with light nocks.
  Held canted 70 degrees in his guard (it was 18), as a hunter holds one, so that from straight behind him its upper limb
  stands out past his side.
- HIS ARROW ON THE STRING: the game's light shaft and pale steel head, two cyan vanes at its nock.
- HIS BOW IN HIS RUN: carried level at his left side as the game has it (the owner: “i like where the bow is at tho”), 6
  units further out from his side, so that from behind him his cloak no longer hides it.
- HIS BOW IN TOWN: slung across his back as the game slings it, between his shoulder blades outside his cloak and quiver, but
  lying further over, its upper limb toward his left shoulder 80 degrees from plumb where the game's leans 30 (nearly level):
  its two ends stand out past him on either side, so that it is seen from in front of him too.

### How he moves (`src/art/ranger_up_moves.ts`, `src/art/ranger_up_art.ts`)

- EVERY LIST AT 30 A SECOND (his gripping runs at 60, a picture for each of the game's steps): his guard 72 frames (2.4 s, it
  was 24 at 10 a second), the squirrel and the sighting 109 (3.6 s, they were 73 at 20).
- HIS GUARD, ALIVE: two breaths a round (out, his hips sinking 0.6 and his back bending over 5 degrees; in, as his weight goes
  over onto his front foot, his hips rising 0.55 and his back straightening), his weight going over and back, and once a
  round a hunter's habit: his head coming round to look along the way he is not facing, then settling on his mark.
- HIS LEGS: the game's own in every stance; what the owner asked of their lengths made in his bones (below, "His legs").
- HIS RUN A HUNTER'S (below).
- THE SHOT BY MOVEMENT 9: a big held draw (the string drawn to his cheek by frame 7, held still three frames, 7 to 9, his bow
  arm braced, his body leaning into it); the release in ONE frame (frame 10): the string snaps back, the bow arm kicks, and the
  release frame carries its after-image, ghosts of the real thing (the string where it was, dithered in the friend's cyan, and
  the arrow in fading tones along its flight), never bars; then a big follow-through, his string hand flying back past his ear
  (more than 8 across), and a slow wind-down to his guard (26 frames in all).
- THE VOLLEY THE SAME, BIGGER, ON HIS KNEE: down onto his back knee WHERE THE GAME'S KNEEL HAS HIM as he draws up at the sky
  (his front foot stepped out before him, lifted clear, frames 1 to 3; then his back foot stepped back, lifted clear, and turning
  up onto its toes there, 3 to 5: the game's kneel slid them), the string to his cheek and held (9 to 11), his string hand a little out from his face so its forearm clears his head; loosed at frame 12 with its
  after-image, his string hand flung straight down past his ear to his chest (a fall seen as far from every side; flying back
  along the arrow it was end-on from some), on down a little after, held; then his arms back into his guard, the string hand
  round his side, and up off his knee, his back foot lifted in (27 to 29), then his front foot (29 to 31), its knee coming round
  over it as his weight comes onto it (32 frames in all).
- HIS ROLL, MADE AGAIN (0.68 s, as the game's; the game carries him its first 0.4): off both feet at once, a dive; over in a
  ball (the game's own ball, a little higher so his head never goes into the floor), his bow held out at his left side, its
  limbs along his way and clear of him, his other hand on his right shin, his elbows out; down on his feet in a squat the
  moment the game stops carrying him; up into his guard, his front foot lifted and set down, then his back foot. Every frame
  worked out from smooth curves, so nothing of him leaps.
- STRUCK, MADE AGAIN (7 frames each, as the game's): rocked back, his back foot lifted clear, set down a step behind him and
  lifted back; struck from behind, thrown forward over a step of his front foot, settling into his guard. His other foot never
  moves, his hips kept within its reach.
- HIS FALL, MADE AGAIN (46 frames, as the game's; not to his knees and then forward): thrown back, his back foot lifted and
  set down a step behind him to keep his feet; then down onto that knee on his own feet, his bow upright at his left side
  outside his leg, let down till its lower limb rests on the floor; his head bowing as the light goes out of him.
- The squirrel and the sighting, in a fight and in town: on his guard and town stance; the sighting is the game's own motion.
- His card's ready: from his town stance he takes his bow off his back where it lies, brings it round outside his left side (it
  went through him), two steps into his guard as the game moves his feet (his front foot, frames 14 to 19; then his back foot, 19
  to 24), each lifted clear where the game slid it, an arrow on the string, the bow canted as his guard holds it.
- His stops (eight settles out of the run) and his setting off, from his guard and from his town stance; his run's other ways
  (across, both ways, and backing away: his run turned back on itself, his body upright).

### His eight sides, each truly painted

Every list from all eight (front, toward, frontL, sideL, backL, away, back, side), as the Warrior's, none mirrored. One-sided
things stay on their own side from every one: the bow in his LEFT hand, the string drawn with his right; the quiver over his
right shoulder; the knot of his neckerchief; the cock of his cap.

## His eight facings (FOR THE MAIN CHAT)

Exactly the Warrior's (`docs/mockups/warrior_up/README.md`, "His eight facings"): `const side = wuFacing(fx, fy)`, drawn as it is,
never mirrored. The Ranger needs nothing different but these:

- HIS FEATHER (`engine/tails.ts`): the frame's roots as the frame gives them; `facing` by `wuTailsFacing(side)` (-1 for frontL,
  sideL, backL; +1 for the rest).
- HIS ANCHOR: the three left sides are painted with the floor point 98 across his canvas (84 for the rest), as the Warrior's;
  each picture carries its own anchor.
- HIS SHOT AND VOLLEY AIM: the game turns him to the aim; `wuFacing(aim)` chooses the side of the attack's list, so he can
  shoot each of the eight ways (the film shows them).
- His card: from in front, as today (its ready and the squirrel and sighting are painted from in front only).

## His numbers (FOR THE MAIN CHAT)

What changes in the game's numbers, only with the switch on:

| | Before | Now |
|---|---|---|
| The Shot's arrow away | 5 frames, 0.167 s (`SKILLS.shot.windup` 0.16) | 10 frames, 0.333 s: set `SKILLS.shot.windup` to 0.333 with the switch |
| The Shot's length | 15 frames (0.5 s) | 26 frames (0.867 s) |
| The Volley's arrows away | 6 frames, 0.2 s (`volley.windup` 0.2) | 12 frames, 0.4 s: set `volley.windup` to 0.4 |
| The Volley's length | 17 frames (0.567 s) | 32 frames (1.067 s) |
| His guard | 24 frames at 10 a second (2.4 s) | 72 at 30 (2.4 s) |
| The squirrel, the sighting | 73 at 20 a second | 109 at 30 |
| His run | 25 at 60, by how far he has gone (1.92 tiles a stride) | the same stride and speed, gripping |
| Roll, struck, his fall | | the same lengths, at 30 a second |

- RATE OF FIRE: the game keeps him busy for `windup + follow`: the Shot 0.16 + 0.32 = 0.48 s (about 2.1 shots a second) before;
  with `windup` 0.333 and `follow` unchanged, 0.653 s (about 1.5 a second). To keep his rate, `follow` could come down to
  0.147, and his next shot would cut the follow-through short. The Volley (5 s cooldown) goes from 0.56 s to 0.76 s busy.
- HIS FOLLOW-THROUGH is 16 frames after the release (0.533 s) for the Shot and 20 (0.667 s) for the Volley, longer than
  `follow` (0.32, 0.36): if he moves or shoots again before, the game goes to that list and the end of the follow-through is not
  seen, as with any list.
- `RANGER_ARROW` (`src/game/defs.ts`: where the flying arrow first shows, `from` 0.796 and `height` 22.5; `volleyFrom`,
  `volleyHeight`): his draw now leans into the shot and his string hand sits a little further across (about 1.8 units
  sideways at the release), so the arrow's starting point should be measured again from the new release frame when he comes in.

## His legs (the owner's “long upper legs and short legs below the knee”, and “He’s not a gunfighter”)

WHAT HE ASKED, 6 Nov: “Can you make sure his leg ratio is correct cause it seems like all these guys have long upper legs and
short legs below the knee”. Twice it was mended by re-posing him: last night his feet set wide; this morning his feet back at the
game's width but his back foot turned right out (75 degrees) and its knee over it. His answer, 7 Nov: “Cmon.  He’s not a
gunfighter why is he so bow legged.  Just please do it right, I don’t want to have to correct every single one of these because
we made a minuscule change to the leg length”. So now it is A SMALL CHANGE TO THE LENGTHS OF HIS BONES, in his body, and never a
re-pose: it shows in every pose at once.

HIS BONES (`RU_BODY`, `src/art/ranger_up_moves.ts`; the game's `RANGER_BODY`): his knee joint raised 0.90 units (0.45 of a game
pixel), his hip where it was (31.33 above the floor), every other bone the same:

| | hip to knee (thigh) | knee to floor (shin, and the ankle under it) | standing straight, shin ÷ thigh |
|---|---|---|---|
| the game's | 14.52 | 16.81 (14.58 + 2.22) | 1.16 |
| now | 13.62 | 17.71 (15.49 + 2.22) | **1.30** |

Every list of his is on these bones, his run too: he is one body throughout. His hips and his feet are where they were in every
pose; only where his knees bend moves.

HIS STANCES' LEGS: THE GAME'S OWN. His guard (moves3.ts CROUCH), his town stance (RANGER_TOWN), the squirrel and the sighting in a
fight and in town, the Shot: the same feet, the same knee directions, the same depth of crouch, frame for frame (a test holds
every frame against the game's). Taken out: last night's wide guard; this morning's turned-out back leg; his town stance's
re-posing; the Volley's front foot stepped in for the leg measure; the Volley's kneel placed on the wide guard's feet.
- THE VOLLEY kneels where the game's kneel has him (moves3.ts KNEEL, as the game's Volley holds it at full draw): his front foot
  16.4 ahead, its knee 3 degrees out; his back foot up on its toes (40 degrees) 15.3 behind, its knee straight; his hips 2.5
  forward and 14.5 down; held so through his draw and release (a test holds it). Where the game's kneel hops into place, both feet
  sliding, he steps: his front foot out (frames 1 to 3), then his back foot (3 to 5), each lifted clear; rising, his back foot in
  (27 to 29), then his front (29 to 31), its knee coming round over it as his weight comes onto it. On his bones the knee he kneels
  on comes down to 2.9 units above the floor (its round just clear of it, under half a game pixel); the game's came down to 1.2
  (its round a little into the floor).
- HIS CARD'S READY: from the game's town stance into the game's guard, his feet stepping where the game's slide: his front foot as
  the game moves it (frames 14 to 19), then his back foot (19 to 24), each lifted clear.
- HIS BREATH in his guard is as it was (a7e24935): his hips go a little lower and higher than the game's breath takes them, at
  most 0.82 units (0.41 of a game pixel) from the game's at any frame. It is what makes his chest rise and his weight shift enough
  for the bosses' check that a stance is alive, which the game's own guard fails (0.26 and 0.49, where 0.6 is asked).
- What starts or ends in his guard follows it: his stops, his setting off, struck, his roll's rise. His fall is as it was (its
  step back lands where it did).

NEVER BOW-LEGGED (`ruBowLegs`, `src/art/ranger_up_review.ts`; tests/ranger_up.test.ts 4): how far each knee lies out to the side
of the straight line from its hip to its foot (the ankle joint), along the line through his two hips, away from the other leg,
as each of his eight sides shows it, in game pixels (below 0, inside it). In every frame of every list he stands in, from all eight
sides, each knee at most 1 game pixel outside its line, or no worse than the game's own. His back knee (his right) lies INSIDE its
line in every frame of every one of them, from every side (at most -0.01; this morning's guard had it 3.6 outside).

THE GAME'S OWN BOWS A LITTLE, AND IS NO WORSE NOW: in the game's crouch his front knee (his left) is turned out over its foot (12
degrees to the left of where he faces, his hips turned 28 to the right, as an archer stands), and it lies outside its line, as
it always has; most in the Shot and the Volley's kneel, where his hips turn further. The most through each list, his left knee,
the game's → **now** (game pixels):

| His left (front) knee | front | toward | frontL | sideL | backL | away | back | side |
|---|---|---|---|---|---|---|---|---|
| his guard | 2.9 → **2.9** | 2.8 → **2.8** | 1.9 → **1.9** | 2.1 → **2.1** | 2.9 → **3.0** | 2.7 → **2.7** | 1.5 → **1.5** | 1.8 → **1.8** |
| his town stance | 1.9 → **1.8** | 2.1 → **2.1** | 1.6 → **1.5** | 1.3 → **1.3** | 2.0 → **1.9** | 2.1 → **2.0** | 1.3 → **1.3** | 1.0 → **1.0** |
| the squirrel | 2.7 → **2.7** | 2.7 → **2.7** | 1.8 → **1.8** | 2.0 → **2.0** | 2.8 → **2.8** | 2.6 → **2.6** | 1.4 → **1.4** | 1.7 → **1.7** |
| sighting along an arrow | 2.7 → **2.7** | 2.7 → **2.7** | 1.8 → **1.8** | 2.0 → **2.0** | 2.8 → **2.8** | 2.6 → **2.6** | 1.4 → **1.4** | 1.7 → **1.7** |
| the squirrel, in town | 1.8 → **1.8** | 2.0 → **2.0** | 1.4 → **1.4** | 1.2 → **1.2** | 1.9 → **1.8** | 1.9 → **1.9** | 1.3 → **1.2** | 1.0 → **1.0** |
| sighting, in town | 1.8 → **1.8** | 2.0 → **2.0** | 1.4 → **1.4** | 1.2 → **1.2** | 1.9 → **1.8** | 1.9 → **1.9** | 1.3 → **1.2** | 1.0 → **1.0** |
| his card's ready | 2.7 → **2.7** | 2.7 → **2.7** | 1.8 → **1.8** | 2.0 → **2.0** | 2.8 → **2.8** | 2.6 → **2.6** | 1.4 → **1.4** | 1.7 → **1.7** |
| the Shot | 4.0 → **4.0** | 3.3 → **3.3** | 2.3 → **2.3** | 3.3 → **3.3** | 4.0 → **4.0** | 3.0 → **3.0** | 1.7 → **1.7** | 3.1 → **3.1** |
| the Volley | 4.4 → **4.4** | 3.2 → **3.1** | 2.0 → **1.9** | 3.4 → **3.4** | 4.4 → **4.4** | 3.6 → **3.6** | 2.8 → **2.8** | 3.9 → **3.9** |

(Each within 0.05 of the game's or under it: his guard up and to the left 2.95, the game's 2.93.)

HIS LEG RATIO ON THE SCREEN (no longer a test that moves him; `npx tsx tools/legs_measure.ts sides`): knee to floor ÷ hip to knee
on the screen, on the bones, the least of his two legs, from each of his eight sides; standing straight, and the least through
every frame of his guard and of his town stance. The game's → **now**:

| | front | toward | frontL | sideL | backL | away | back | side |
|---|---|---|---|---|---|---|---|---|
| standing straight | 1.13 → **1.27** | 1.13 → **1.26** | 1.13 → **1.27** | 1.15 → **1.29** | 1.18 → **1.32** | 1.19 → **1.34** | 1.18 → **1.32** | 1.15 → **1.29** |
| his guard | 0.65 → **0.76** | 0.43 → **0.51** | 0.84 → **0.97** | 1.00 → **1.12** | 1.47 → **1.63** | 1.76 → **2.00** | 1.30 → **1.45** | 1.03 → **1.15** |
| his town stance | 0.93 → **1.04** | 0.85 → **0.98** | 0.91 → **1.06** | 1.01 → **1.14** | 1.22 → **1.33** | 1.26 → **1.35** | 1.23 → **1.34** | 1.12 → **1.26** |

Every side better than the game's. In the game's crouch his knees bend, and from toward the camera his front shin is seen nearly
end-on: there it still reads short (0.51), as it does in the game (0.43); only re-posing him would change that, and he asked for
that not to be done.

## His bow, seen from every side

`ruBowSeen` counts, at the game's size, the game pixels of the bow's wood and of its string and the arrow on it. HELD IN EVERY
LIST HE STANDS, RUNS OR HOLDS IN, every frame, from all eight sides (those painted from in front only, from there): his guard,
his town stance, his run and his town run and their other ways, his stops and setting off, the Shot's and the Volley's held
draws, the squirrel and the sighting in a fight and in town, his card's ready. Enough of it is seen when at least 5 of its wood
and 4 of its string and arrow are, or, where the string is end-on (as it is from most sides when he carries the bow level in his
run, or slung across his back), at least 7 of its wood alone (the whole bow, side-on, is 20 to 30). The least from each side:

| | front | toward | frontL | sideL | backL | away | back | side |
|---|---|---|---|---|---|---|---|---|
| his guard, his stops in a fight, the held draws, his habits, his card (wood / string and arrow) | 6 / 1 | 8 / 1 | 22 / 3 | 21 / 7 | 13 / 0 | 8 / 1 | 7 / 0 | 6 / 5 |
| carried: his runs and their other ways, his town stance, town run and habits, his town stops and setting off | 8 / 0 | 8 / 1 | 9 / 1 | 9 / 0 | 18 / 2 | 6 / 0 | 7 / 0 | 8 / 0 |

(The least of each column through all its frames, the wood and the string apart: every frame has enough of one or the other.)

Before (stage 2's first hand-over), in his runs and town: 3 / 0 from in front, 5 / 0 toward the camera, 3 / 0 from straight
behind, 5 / 0 from up and to the right.

- THE CANT: held nearly upright before him (18 degrees), his body hid the bow from behind (`away` 5 to 7 of wood); canted 70,
  its upper limb stands out past his side. The cost: from his right (`side`) its limbs point nearly at the eye, so the wood is
  seen end-on, 6 pixels, its string and arrow 5 or more. No one cant shows it both from behind and from there (a flat thing is
  edge-on from somewhere); the sheet2 turnaround shows how it reads.
- IN HIS RUN: where he carries it (above), its string end-on from most sides; its wood at least 7 from every side.
- ONE FRAME SHORT, REPORTED AND LEFT AS IT IS (the rule of 7 Nov: never move a weapon, a pose or a gait to pass a check): one
  frame of his setting off from his guard (frame 4 of 60 a second), seen from behind, shows 6 of the bow's wood and 1 of its
  string (7 of the wood wanted), the bow passing behind his back on its way from his guard to where he carries it. `RU_BOW_SHORT`
  in his review holds it to what it shows.
- IN TOWN: slung nearly level across his back (above), its ends past him on either side; its wood at least 7 from every side.

## His run, a hunter's (the owner's “why is he high stepping with his knees up?”)

Low over his feet, leaning in; each foot comes down a little before him and goes back under him exactly as fast as the game
carries him (it grips), leaves the floor off its toes with the leg straightening behind him, its heel flicked up a little,
and comes through LOW, its knee lifting only a little. His body, arms and bow as the game's run has them, moment for moment
(the bow carried a little further out from his side: above).

The swinging thigh, degrees from hanging straight down, the most in any frame (the Warrior's check: past 50 fails):

| | Before | Now |
|---|---|---|
| his run | 71 | 33 |
| his run in town | 62 | 32 |
| his run's other ways | | going across 41 either way; backing away 36 (his run turned back on itself) |
| his stops (eight settles each) and setting off, in a fight | | 49; 32 |
| the same in town | | 31; 32 |

(His thigh a little shorter now, his knee joint raised, each comes up 1.5 to 2.3 degrees more than on the game's bones: his stops
in a fight 49.0, on the game's bones 46.7.) The sheet's stride strip shows eight frames of each side-on: before 14, 43, 70, 65
degrees; now 12, 20, 32, 31, 26.

## The bosses' checks (`checkBoss`, from each of his eight sides)

EVERY LIST, EVERY FRAME, FROM ALL EIGHT SIDES, NO FINDING (`rangerReview(side)` through `checkBoss`, held by the test): his feet
grip, nothing of him or his gear goes through him (his bow and his arms go round him), nothing in the floor, nothing jerks or
jumps, every blow drawn back, held, a one-frame flash and carried through, alive when still, with the game's handovers between
his lists (his guard into each and back). Findings summed over the eight sides:

| List | Before | Now | What there was |
|---|---|---|---|
| his fall | 1,136 | **0** | his feet sliding as he went down (1,088), the bow through his left leg (40), a knee in the floor (8) |
| his roll | 1,207 | **0** | his feet sliding (448), his left arm in his ribs (328), the bow through his belly (224), joints jerking (143), the floor (64) |
| the Volley | 688 | **0** | his right foot sliding as he knelt (480), his right forearm in his head as he drew (144), joints jerking (40), the release not a flash (16), a toe in the floor (8) |
| his card's ready | 131 | **0** | his feet sliding as he stepped into his guard (128), the bow through him (3) |
| struck (`rlurch`; `rreel`) | 48; 32 | **0; 0** | starting at full speed (48); a toe sliding (32) |
| his guard, run, Shot, town stance and run, the squirrel (in a fight and in town), the sighting in town | 0 | **0** | |
| the sighting, in a fight | 0 | **49, reported** | the bow let down by his side into his front thigh: the game's own motion on the game's own legs, as deep (below) |

(His roll is reviewed as the game shows it: the game carries him along the floor through its first 0.4 s, so a foot down then
goes back with the floor: `carried` in his review.)

REPORTED, NOT MENDED (the rule of 7 Nov: “If a check fails on the game's own motion, REPORT it with the numbers and leave the
motion alone”; `RU_REPORTED` in his review). THE SIGHTING is the game's own motion (moves3.ts `sightingOnString`), and his legs are
the game's own again: as he holds the arrow before his eye, the bow let down by his left side (its `lowBow`) passes into his front
thigh, in 49 frames seen from in front (where it is painted), by 0.94 of a game pixel at the deepest past the thigh's skin. The
game's own Ranger, reviewed the same way (`rangerReview(side, true)`), does the same in the same 49 frames, by 0.91. This
morning's guard, its front foot set elsewhere, hid it; before that (46584c7c) the bow was moved out from his leg, which the rule
of 7 Nov forbids. The test holds it to no deeper than the game's own (plus 0.05), and only there.

TWO OF HIS MOVES' INSIDES FOLLOWED HIS BONES (no motion changed for a check): in his roll, his bow hand goes to his knee as it is
on his bones (beside it, as before), and his other hand to his shin where it went (on the game's knee): so neither arm jerks and
the bow clears his shin; in the Volley, rising, his front knee comes round over its foot as his weight comes onto it (above).

## The measures

Every frame the game holds of him (`tools/ranger_up_measure.ts`: `count`, `count up` and `count up eight`; this machine: 2
cores, shared and busy):

| | Before (the game's Ranger) | Now, two sides | Now, eight sides, every place |
|---|---|---|---|
| Lists | 166 | 166 | 640 (a dungeon 314, town 163, his card 163) |
| Frames in them | 2,602 (a dungeon 1,210, town 696, his card 696) | 3,470 (a dungeon 1,638, town 916, his card 916) | 11,702 (a dungeon 5,898, town 2,902, his card 2,902) |
| Pictures held (each painted once) | 2,566 | 2,236 | 7,528 |
| Different pictures among them | 1,545 | 2,173 | 7,289 |
| Memory, decoded at the game's grain | 27.25 MB | 28.11 MB | 96.7 MB |
| Packed as picture files would be | 2.25 MB | 2.43 MB | 8.1 MB |
| Time to paint a frame (this machine) | 3.2 thousandths of a second | 67.6 | 83.4 |
| Time to paint every picture of him | 8.3 s | 151 s | 628 s |

(The two-sides count was made before the last pose changes, which do not change how many frames there are.) Eight sides hold
3.4 times the pictures of two. In play only the place he is in need be held. A frame costs twenty to twenty-six times the old painter's
(the sculptor's march, as the Warrior's and the Veteran's): his pictures want baking into files when the game is built, as
the main chat is doing for the heroes; once baked, painting costs nothing on the phone.

## How the main chat brings him in

1. Merge `art/ranger-up` (it carries `art/warrior-up` at 9057f94b). Nothing changes while `RANGER_UP.on` is false (the hash
   test holds every frame).
2. On the owner's yes to the pictures: set `RANGER_UP.on = true` in `src/art/ranger_up.ts`, and with it `SKILLS.shot.windup`
   0.333 and `SKILLS.volley.windup` 0.4 in `src/game/defs.ts` (and `follow` as the owner decides, above). `art/heroes3.ts`
   then gives his new lists (`makeRangerUpArt`) in the very shape it gave the old.
3. EIGHT FACINGS: as the Warrior's (above). His `RuActorArt` has all eight sides, each made when first asked for.
4. THE SIDE PAINTER'S WORKER (`render/painter.ts`) makes its own `makeHeroArt3`: it must know the switch, as for the Warrior.
5. BAKING: from `makeHeroArt3().of('ranger', lookOfPlace(place))` with the switch on, every list of each place for each of his
   eight sides. A list the same in two places is the same array: bake it once.
6. `RANGER_ARROW`: measure the arrow's start again from the new release (above).
7. The tests: `tests/ranger_up.test.ts`; when the switch goes on, its first test and the hash test change with it.

## The checks (`tests/ranger_up.test.ts`, all 12 passing)

1. The switch is off; of the game only `art/heroes3.ts` reaches the new files, and only through the switch; nothing imports
   his review. With it off every frame the game paints of him (166 lists, 2,602 frames) the same picture, by hash
   (`tests/ranger_up.hashes.json`, made from d31abc22; `RANGER_UP_ALL=1` for every frame).
2. With it on: every list at 30 a second (his gripping runs at 60), from all eight sides, in every place.
3. Every frame of every list of his through every boss check, from all eight sides (85 reviews of his moves), with the game's
   handovers between them: no finding, but the sighting's reported one (above), held to the game's own.
4. His legs: HIS BONES (the shin 1.3 times the thigh standing straight, the thigh and shin together as long as the game's, every
   other bone the same; standing straight his hips, feet and hands exactly where the game's are, his knees 0.90 higher; every
   list on his bones); HIS STANCES' LEGS THE GAME'S, frame for frame (his guard and town stance the game's but for the bow's cant;
   every frame of his guard, town stance, the squirrel and the sighting in a fight and in town, and the Shot, its feet and knees
   the game's; his guard's hips within 0.82 of the game's through his breath; the Volley's kneel the game's, feet, knees and
   hips, frames 7 to 22; his card's ready from the game's town stance to the game's guard); NEVER BOW-LEGGED (each knee at most
   a game pixel outside its line from hip to foot, or no worse than the game's own, every frame of every list he stands in, from
   all eight sides; this morning's guard, which the check catches, 3.6).
5. His bow seen from every side, in every list he stands, runs or holds in (above; one frame of his setting off reported, not
   mended, below).
6. No prancing: every frame of his runs, their other ways, his stops and setting off: no swinging thigh past 50 (the most 49.0);
   the game's run, as it was, past 60.
7. Every picture from every side: crisp, the friend's cyan edge, nothing of the enemy's rim, nothing cut off, the feather
   fixed in his cap.
8. The Shot and the Volley by Movement 9: hits 10 and 12, lengths 26 and 32; at full draw and still through the held frames;
   loosed in one frame; the after-image only on the release, and there; the string hand flying back past 8.
9. His face at the game's size: two dark eyes on his lit face, the brown of his moustache under them, through his breathing.

tsc clean (the whole project). With the heroes' tests, the Warrior's and the models', 95 of 95 pass (`tests/heroes3.test.ts`,
`tests/bosses.test.ts`, `tests/cheap_heroes.test.ts`, `tests/grip_runs.test.ts`, `tests/heroes.test.ts`, `tests/warrior_up.test.ts`,
`tests/palace_hands.test.ts`, `tests/princess.test.ts`). Changes to existing tests, each the smallest: `tests/bosses.test.ts`'s
check that nothing of the game imports the bosses' checks skips `art/ranger_up_review.ts` (his review); and `tests/warrior_up.test.ts`'s
first check, which had failed since the Ranger's mock-up was built on the Warrior's pieces (it failed at a7e24935 too): the Ranger's
mock-up files are among what imports the Warrior's, `art/heroes3.ts` reaches the Ranger's only through his own switch, and his
review may use the Warrior's (the Ranger's test holds all three). The Warrior's source files are exactly as on `art/warrior-up`
(9057f94b); of the game, only `src/art/heroes3.ts` changed (16 lines: the switch).

Made with: `npx tsx tools/ranger_up_pics.ts sheet|sheet2|film <dir>` and `python3 tools/ranger_up_pics.py sheet|sheet2|film
<dir> <out>`; the measures with `npx tsx tools/ranger_up_measure.ts count [up] [eight]`; the legs with
`npx tsx tools/legs_measure.ts table` and `npx tsx tools/legs_measure.ts sides` (his, per side, the game's and now).

## For the owner or the main chat to decide

- THE SHOT LANDS LATER: 0.333 s in place of 0.16 (Movement 9's held draw), the Volley 0.4 in place of 0.2. As with the
  Warrior's swing, his call. The question to ask him: “The Ranger's Shot now has a held draw: the arrow goes at a third of a
  second, not a sixth. Keep his rate of fire as it is (his follow-through cut short when he shoots again)? (Recommended) / Let
  him fire a little slower (about 1.5 shots a second, not 2)”.
- HIS BOW CANTED 70 DEGREES in his guard (it was 18), so it shows from behind; seen from his right it is end-on.
- HIS LEGS (7 Nov, at his word): the game's own in every stance; his knee joint raised 0.90 (shin 1.30 times the thigh standing
  straight, the game's 1.16). The game's own crouch turns his FRONT knee out over its foot: it lies outside its line from hip to
  foot by up to 2.9 game pixels in his guard, 4.0 in the Shot and 4.4 in the Volley's kneel, now as in the game (his back knee
  is inside its line everywhere). From toward the camera, in his crouch, his front shin still reads short on the screen (0.51,
  the game's 0.43). Both are the game's own stance; changing either is a re-pose, the owner's to ask for.
- THE SIGHTING'S BOW goes into his front thigh, as the game's own does (above): the owner's call whether to move the bow.
- THE VOLLEY'S KNEEL: where the game's is, stepped where the game's slid; on his bones the knee he kneels on stops just clear of
  the floor (under half a game pixel).
- HIS RUN IS NEW: the owner should see the stride strip and the film's run before it goes in. His bow in it is carried 6 units
  further out from his side than the game's, so that it is seen from behind.
- HIS BOW IN TOWN lies nearly level across his back (80 degrees from plumb; the game's 30), so that it shows from in front.
- HIS ROLL, STRUCK AND HIS FALL ARE NEW (above): the roll ends in a squat and steps out into his guard; his fall is down on one
  knee, his bow upright at his side. The owner should see them in the film before they go in.
