# The Ranger brought up to the Brawler's level (the art chat's helper, 6 Nov 2026)

Branch `art/ranger-up`, from `origin/art/warrior-up` (d31abc22), so it builds on the Warrior's work. A mock-up behind a
switch that is off, `RANGER_UP` (in `src/art/ranger_up.ts`). Nothing of the game imports it: the game's Ranger is exactly as
he is (every frame the same picture, by hash: `tests/ranger_up.test.ts`).

THIS IS THE FIRST STEP ONLY: his look, sculpted, shown in one still of his stance. His moves (every list at 30 a second, the
shot and the volley by Movement 9, his five sides and eight facings, the film, the measures) come after, on his yes.

## His words

- 6 Nov 2026, asked whether to bring the other heroes up to the Brawler's smoothness: “Like is yes I’d like everything
  brought up to the same 30 drawings a second for all the character models, but I’d also like the first three Warrior Ranger
  and mage updated to the level of the brawler in terms of the rules that we have set for the rest of the drawings I don’t
  want them to lose the aesthetic or the flavor that they currently have but I think like the shapes rule the action rule we
  kind of want all that updated to a certain level certain benchmark as the rest of the characters so that they’re all at
  the same level.”
- 6 Nov 2026, 15:18: “Everything drawn should not just look like shapes.  That’s the rule”
- 6 Nov 2026, of the Warrior brought up: “All of it is good, I just wish the helmet looked a little better.  I really like
  the look of his old pig helmet but it looks old.  And the visor slit never really pops.  And is it worth it to do the 8
  sides during this process in tandem”; then “Yes, 8 sides now (Recommended)”, and “Yes, hand him over (Recommended)”.
- 6 Nov 2026, 19:21: “Can you show me the ranger redone before you go too crazy with the drawings?”; and “Just a still of
  him”.
- Having seen the still (not yet a yes to the look): “Can you make sure his leg ratio is correct cause it seems like all these
  guys have long upper legs and short legs below the knee”.

So, as with the Warrior: his look and flavour kept, and where a loved piece of it reads old, that same piece made new. His face
and head must read at a glance at the game's size.

## The picture (`pictures/`)

- `ranger_look.png` (1200 by 746): one still of him standing in a fight (a frame of his breathing stance, 0.6 s into it), from
  in front, three times as big and at the game's own size: BEFORE (the game's Ranger today), his FIRST SCULPT (the still the
  owner saw, the same pixels), and NOW with his legs true. Beside each, a line marking the hip, the knee and the floor of the
  leg nearer the eye, as the screen shows it, with the two lengths along the leg in game pixels and their ratio. His feather is
  the game's own (`engine/tails.ts`), hung and moved in the picture as the game moves it. (The first still, before beside his
  first sculpt with what is kept and new, is this file at 30c7c068.)

## His legs (the owner's “long upper legs and short legs below the knee”)

Measured by `tools/legs_measure.ts` for every hero painted on the bones, from in front: standing straight, in the stance
(the moment the stills show), and through the run (the median of eight strides). Game pixels (two picture pixels to one).
BONES: on the screen, from the hip joint to the knee joint, and from the knee joint to the floor (the shin, and the ankle's own
height). EYE: what the eye reads: from where the thigh shows below what hangs over it (skirt, tabard, coat) to where the lower
leg's covering begins (a boot top, a cuff, a greave, a trouser hem: the knee as it is SEEN), and from there to the sole; and
how far below the knee joint that seen knee is. Each on the leg nearer the eye.

| Hero | Pose | Bones: hip to knee | knee to floor | lower ÷ upper | Eye: thigh shown | seen knee to sole | seen knee below the joint |
|---|---|---|---|---|---|---|---|
| Ranger, before | straight | 7.4 | 8.4 | 1.14 | 4.1 | 8.4 | 1.7 |
| | stance | 8.4 | 5.5 | 0.65 | 7.3 | 5.8 | 1.6 |
| | run | 8.2 | 7.2 | 0.88 | 6.7 | 7.6 | 1.6 |
| Ranger, first sculpt | stance | 8.4 | 5.5 | 0.65 | 5.3 | 6.3 | 1.6 |
| RANGER, LEGS TRUE | stance | 8.3 | 9.1 | 1.10 | 5.6 | 8.5 | 1.6 |
| Warrior (brought up) | straight | 7.3 | 8.3 | 1.14 | 3.2 | 9.3 | 1.0 |
| | stance | 8.2 | 7.3 | 0.89 | 1.1 | 8.0 | 1.1 |
| | run | 7.9 | 7.3 | 0.92 | 5.0 | 9.9 | -0.9 |
| Mage | straight | 6.8 | 7.8 | 1.15 | 0.5 | 9.4 | 0.5 |
| | stance | 7.7 | 6.9 | 0.90 | 2.2 | 9.6 | -0.9 |
| | run | 7.5 | 6.8 | 0.91 | 1.4 | 9.9 | -0.9 |
| Warlock | straight | 7.3 | 8.3 | 1.14 | hidden by his coat | | |
| | stance | 7.9 | 7.7 | 0.97 | hidden by his coat | | |
| | run (coat open) | 8.1 | 7.8 | 0.96 | 13.8 | 4.0 | 6.3 |
| Tinkerer | straight | 7.2 | 8.1 | 1.13 | 12.1 | 5.3 | 4.9 |
| | stance | 8.0 | 6.8 | 0.85 | 12.2 | 4.5 | 4.2 |
| | run | 8.0 | 7.8 | 0.97 | 12.4 | 5.4 | 4.7 |
| Brawler (Veteran) | straight | 6.8 | 7.8 | 1.15 | 14.6 | 3.4 | 7.7 |
| | stance | 7.7 | 5.2 | 0.68 | 12.7 | 4.3 | 5.0 |
| | run | 7.5 | 6.8 | 0.91 | 10.3 | 7.7 | 2.7 |

(The Ranger's run is still the game's: the same 0.88 in all three of him. Each ratio is of the two lengths as shown.)

WHY THEY READ THAT WAY. Not the bones: every hero is built by `art/skeleton.ts` `buildOf`, which puts the knee at 0.285 of the
height and the hip at 0.53 (a `legs` factor, where a build has one, lengthens thigh and shin alike), and standing straight
every one of them reads 1.13 to 1.15 below the knee to 1 above it on the screen, a real person's ratio. Two things make them
read the other way:

1. THE CROUCH AGAINST THE CAMERA (every hero's stance, and the bent legs of the runs). The game's camera looks down on a hero
   from in front. In a crouch the knees are bent forward, toward it: each thigh then lies square to the eye and is seen at its
   whole length (a length square to the eye is even drawn 1.15 times as long as an upright one, `art/skin.ts` SEEN), while each
   shin slants back from the knee along the eye's own line and is seen end-on, foreshortened. So in the stances the lower leg
   reads 0.65 (the Ranger) and 0.68 (the Veteran, crouched in his bounce) of the thigh; 0.85 (the Tinkerer), 0.89 (the
   Warrior), 0.90 (the Mage), 0.97 (the Warlock, whose knees bend least).
2. WHAT COVERS THE LEG, where the eye's knee falls below the real one. Short boots, or trousers cut low, under cloth of one
   colour from the hip: the eye takes the boot top or the hem for the knee. The Veteran's trousers end 5 to 7.7 game pixels
   below his knee (they are drawn longer than his description, “hacked off below the knee”), so his eye-read leg is 12.7 above
   that line and 4.3 below it; the Tinkerer's boots are ankle boots under navy trousers (her seen knee 4.2 to 4.9 below the
   joint: 12.2 above, 4.5 below); the Warlock's the same when his coat flies open in the run (6.3 below: 13.8 above, 4.0
   below). The Ranger's cuffs sit 1.6 below his knee (a little). The Warrior (tabard to the knee, a knee cop at the joint, a
   greave to the shoe) and the Mage (robe to the knee, boots to the knee with a cuff at it) are the other way about: what covers
   their legs makes the lower leg read long (8.0 and 9.6 below their seen knee in the stance).

Not causes, measured: a knee drawn below the joint (the Warrior's cop is at it; the Mage's cuff at it; only the Ranger's cuff
1.6 below); thick thighs on thin shins (every build has the same leg thickness, a radius of 0.056 of the height at the hip,
0.042 at the knee, 0.032 at the ankle, as a person's tapers).

THE RANGER'S LEGS MADE TRUE (`src/art/ranger_up_moves.ts` `RU_STAND3`, his stance on the mended crouch `RU_BATTLE`). The
same low crouch: his hips as low, his body, arms, bow and aim exactly as they were (a test holds them), the breathing as the
game's. Only his legs are posed anew: his front foot 11 forward (it was 6.8), its knee bent out over it to his left
(40 degrees from where he faces; it was 12); his back foot 12 back (it was 5.2), its leg longer, its knee turned a little to
his left (20; it was -20, toward the camera); each foot turned with its knee (24 and -20; they were 10 and -30). Now neither
shin slants along the eye's line: his near leg reads 8.3 to the knee and 9.1 below it (1.10), his far leg never less than 1.07,
through every frame of his breathing; a test holds both legs at 1.05 or more, standing straight at a real person's ratio, and
the game's crouch at under 0.75 (so that if the game's ever changes, the test says so). His stance is wider (his feet 23 apart
front to back, where they were 12): a wide, low archer's stance. His boots are as they were (the eye now reads 5.6 of thigh
below his skirt and 8.5 from his cuff to the sole).

FOR THE MAIN CHAT, WHEN THE RANGER IS BROUGHT IN: his stance in a fight is `RU_STAND3` (2.4 s round, as the game's). His
settles out of the run and his setting off, his shot and volley from the stance, and the run itself (0.88 now) come with
his moves, the next step; they will be held to the same check.

WHAT THE SAME FIX WOULD TAKE FOR THE OTHERS:

- THE WARRIOR (handed to the main chat at d31abc22, `art/warrior-up`): his guard reads 0.89, his run 0.92; his tabard, knee
  cop and greaves already make the lower leg read long by the eye, so only his poses need it. In `src/art/warrior_up_moves.ts`:
  his guard (`rear`) and town stance re-keyed with the front knee out over the foot and the back leg longer, as the Ranger's;
  then every held crouch of his moves the same (Strike's held wind-ups, the Slam's landing, the Lunge's landing, his fall's
  kneel) and the run's bent strides; and, because he is drawn from five sides, each checked from all five (from `toward` a knee
  bent forward points straight at the camera, the worst case). His checks and pictures made again. A day's work or so, on his
  branch or a new one; his look unchanged. The owner should see it before it goes in (it changes how he stands).
- THE MAGE (0.90 in her stance): her boots already read; her stance's knees re-posed the same way. Small.
- THE WARLOCK (0.97 standing; his coat hides his legs): nothing standing. In his run, when the coat flies open, his ankle boots
  under trousers of the coat's cloth put his seen knee 6.3 below the joint: taller boots, or a break at the knee, would mend it.
- THE TINKERER (0.85 in her stance; by the eye 12.2 above her boot tops and 4.5 below): her stance re-posed; and boots to just
  below the knee (or a knee patch or crease her trousers show), so the eye finds her knee.
- THE BRAWLER, VETERAN (0.68 in his stance, the most; by the eye 12.7 and 4.3): his trousers cut off just below the knee, as his
  description has it, so his bound shin and bare shin read their length; and his bounce re-posed so his knees go out, not
  toward the camera. He is the benchmark and in the game: pictures first.
- A CHECK FOR ALL: the same measure as a test for every hero's stance and run (lower leg at least the thigh on the screen, from
  every side drawn), so a new pose cannot bring it back.

## What is kept

His wide soft teal cap with its long glowing feather; his bare face and brown moustache (his pick of 7 Oct, “10 for ranger but
a brown mustache”); his pink neckerchief; his green jerkin and its skirt cut into points; green sleeves, leather bracers and
gloves; dark hose and tall soft boots with turned cuffs; his short teal cloak; his quiver of glowing fletchings; his long
indigo bow, its string the friend's cyan, the arrow on it as the game draws the one that flies (a shaft of light wood, a pale
steel head); his colours (his own three tones of each, a tone between each two); his lean archer's build and his low crouch
(the game's own pose, unchanged).

## What is new in his look (`src/art/ranger_up.ts` `paintRangerUp`)

- SCULPTED as the Warrior brought up and the Veteran are (`src/dev/sculpt.ts`): one body with a real outline, each solid
  melted into the next of its stuff, inked only where one stuff meets another or a part passes in front; not the old painter's
  balls and rods each on a sheet of its own, ringed in ink (`src/art/hero3_ranger.ts`).
- HIS FACE MADE TO POP at the game's size: his head drawn a touch bigger (1.1 times the build's) and set a little up his neck,
  as a hero's is drawn; his face lit a tone; his cap worn pushed back off his brow (16 degrees) and cocked a little to his left
  (12), so its brim no longer hides his eyes; two dark eyes, each two pixels tall with a dark brow over it, set on the lit
  skin either side of his nose; his moustache full and broad, lit along its top, its ends drooping past his mouth. A test
  holds that both eyes sit on his face and the brown of his moustache under them, through his breathing.
- HIS CAP: his own soft puff of teal cloth, wider than his head every way, its top slumped back, a darker band round its
  foot; brighter where the light is on it, as it always was. The feather's quill is in it, as before.
- HIS JERKIN: an archer's chest drawn in to a lean waist, laced up the front (the laces seen when his arm is not across them),
  the strap of his quiver across it; its top kept below his chin; brighter where lit, so its lime reads as it always did. A
  dark belt with its cyan buckle. The skirt in ten leaf-cut panels, a tone darker than the chest, each hanging plumb from the
  hips, pushed out only where a thigh comes against it and riding up over a raised thigh (so his legs are seen), left behind
  by how far his hips have come over the last three frames (it follows) and stirred by the wind.
- HIS LEGS AND BOOTS: lean thighs in dark hose; soft leather boots with a turned cuff below the knee, round-toed, flat on the
  floor and never in it.
- HIS NECKERCHIEF: wound round his neck, its point hanging on his chest and a knot at its side; brighter, the warm thing
  under his face.
- HIS CLOAK: short, from his shoulders round his back to his hips, cloth hanging in folds (panels melted into one sheet, every
  other one standing out), its lining a tone darker where it turns from him, left behind by his hips and stirred by the wind;
  it goes round an elbow drawn back close behind him, as the old one did.
- HIS QUIVER on his back outside the cloak, its mouth above his right shoulder, three glowing fletchings out of it.
- HIS BOW: two limbs of indigo wood curving back from a leather grip, each tip curled forward (a recurve) with a light nock;
  the string from nock to nock, to his fingers when drawn. The arrow on it: the game's shaft and pale steel head, the head
  now drawn to a point, two small cyan vanes at its nock as the fletchings in his quiver have.

Not yet brought up (the next step): his moves (still the game's, but for his stance in a fight, its legs made true: above),
his lists at 30 a second, the shot and volley by Movement 9, his fall, and his other sides. Seen from behind, his cloak is not yet right (it
reads as a block): it is the first thing to mend there.

## The checks (`tests/ranger_up.test.ts`, all passing)

1. The switch is off; nothing of the game imports `art/ranger_up.ts` or `art/ranger_up_moves.ts`. Every frame the game paints of the Ranger (166 lists,
   2,602 frames, every place, both ways) the same as before: each list's first, middle and last frame held to the hashes
   made from him as he is (`tests/ranger_up.hashes.json`, made from d31abc22 and checked against a clean copy of it;
   `RANGER_UP_ALL=1` for every frame).
2. His stance, sculpted, from in front, every frame of its loop at 30 a second, in the game's crouch and in his mended stance: crisp (every pixel whole or empty but his
   edge), the friend's cyan edge round him, nothing of the enemy's rim, nothing cut off, the feather's quill in his cap.
3. His face at the game's size, in both: two dark eyes on his lit face, the brown of his moustache under them.
4. His legs in his mended stance: on the screen, each leg from knee to floor at least 1.05 times hip to knee, every frame of
   his breathing; standing straight, a real person's ratio (1.1 to 1.2); the game's crouch under 0.75; his body, arms and aim
   as they were.

tsc clean. The Warrior's file `src/art/warrior_up.ts` now exports four of its small helpers (`between`, `five`,
`turnedStage`, `frame`) so the Ranger can use them: nothing else of it changed.

Made with: `npx tsx tools/ranger_up_pics.ts look <dir>` and `python3 tools/ranger_up_pics.py look <dir> <out.png>`; the hashes
with `npx tsx tools/ranger_up_measure.ts hash tests/ranger_up.hashes.json`; the legs' table with
`npx tsx tools/legs_measure.ts table` (or `table ranger-before,ranger-legs` for some; `sheet <dir>` for pictures of each).
