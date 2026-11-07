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

So, as with the Warrior: his look and flavour kept, and where a loved piece of it reads old, that same piece made new. His face
and head must read at a glance at the game's size.

## The picture (`pictures/`)

- `ranger_look.png` (1200 by 1116): one still of him standing in a fight (a frame of his breathing stance, 0.6 s into it),
  from in front, before (the game's Ranger today) beside now, three times as big; the same two at the game's own size under
  them; and in plain words what is kept and what is new. His feather is the game's own (`engine/tails.ts`), hung and moved
  in the picture as the game moves it.

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

Not yet brought up (the next step): his moves (still the game's, so the still is the game's own pose), his lists at 30 a
second, the shot and volley by Movement 9, his fall, and his other sides. Seen from behind, his cloak is not yet right (it
reads as a block): it is the first thing to mend there.

## The checks (`tests/ranger_up.test.ts`, all passing)

1. The switch is off; nothing of the game imports `art/ranger_up.ts`. Every frame the game paints of the Ranger (166 lists,
   2,602 frames, every place, both ways) the same as before: each list's first, middle and last frame held to the hashes
   made from him as he is (`tests/ranger_up.hashes.json`, made from d31abc22 and checked against a clean copy of it;
   `RANGER_UP_ALL=1` for every frame).
2. His stance, sculpted, from in front, every frame of its loop at 30 a second: crisp (every pixel whole or empty but his
   edge), the friend's cyan edge round him, nothing of the enemy's rim, nothing cut off, the feather's quill in his cap.
3. His face at the game's size: two dark eyes on his lit face, the brown of his moustache under them.

tsc clean. The Warrior's file `src/art/warrior_up.ts` now exports four of its small helpers (`between`, `five`,
`turnedStage`, `frame`) so the Ranger can use them: nothing else of it changed.

Made with: `npx tsx tools/ranger_up_pics.ts look <dir>` and `python3 tools/ranger_up_pics.py look <dir> <out.png>`; the hashes
with `npx tsx tools/ranger_up_measure.ts hash tests/ranger_up.hashes.json`.
