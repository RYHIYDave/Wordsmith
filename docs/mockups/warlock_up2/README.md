# THE WARLOCK BROUGHT UP, AND HIS DEMON REDONE (IN HAND; NOTHING HERE IS IN THE GAME)

**WHERE IT STANDS (11 Nov 2026, 22:45 Eastern): THE DEMON'S NEW LOOK HAS HIS YES: THE LIVING SHADOW, on a werewolf's frame, up on
two legs to fight and down on all fours to run, wings of smoke, no smoke off it (`src/dev/demon_ideas.ts` shadowInto;
`pictures/living_shadow.png`). ITS STAND, ITS WIDE SLASHES, DROPPING DOWN TO RUN, REARING UP TO STOP, AND ITS SLASHES MADE
WALKING ON TWO LEGS HAVE HIS WORD (two films; the sections “The Living Shadow's moves” and “Its slashes made walking on two
legs” below). ITS OTHER MOVES ARE NOW MADE, ALL UP ON TWO LEGS (his “Yes, all on two legs (Recommended)”), AND SHOWN HIM AS A
THIRD FILM (`src/dev/shadow_moves.ts` shadowOthers; `pictures/living_shadow_other_moves.mp4`; the section “Its other moves,
all up on two legs” below): Damning, the smoke step's two ends, its roar as the change into it ends, its burning out, and
struck hard and from behind. HIS WORD ON THEM, by 22:08: “The roar is so bad.  His face doesn’t even move?  No animations
out of the mouth?  No spittle or action lines or screen shake on the roar?”; the smoke step's own smoke, “Keep it as is
(Recommended)”. SO THE ROAR IS MADE AGAIN (its jaws thrown open with his fire in its throat, its head shaking, rings of
force and action lines out of its mouth, spittle, the screen shaking) AND SHOWN HIM AS A FOURTH FILM, HIS WORD ON IT AWAITED
(`pictures/living_shadow_roar.mp4`; the section “Its roar, made again” below); the rest are taken to stand. NEXT after
that: its eight sides, its hide carried by its bones, and the change into it; then into the game's shape behind a switch
that is off; then the man. Read from “The Living
Shadow, drawn properly” down for what is left; the sections before it are how he got there, in his words.**

Branch `art/warlock-up2`, from `main` at 9d3501b (25.3.3). The Warlock chat, 11 Nov 2026, a new chat of his, working the
queue's `finish-mage-and-warlock-eight-sides` (the Mage's half is done: `art/mage-up2`). It takes up the art chat's helper's
stage 1 of 7 Nov (branch `art/warlock-up`, 87bc4dd: one still, `docs/mockups/warlock_up/` there), which is left where it is.

## His words, 11 Nov 2026 (to this chat, 15:05 to 15:16 Eastern)

Asked how far to go with the Warlock (shown him today beside the 7 Nov still; offered: eight sides and taller boots, that and
the new coat too, eight sides only):

- **“I need the demon redone.  I like okay but I think it can be much better”**
- 15:11: **“I want the longer cloak as well”**

Read as, and told him so: the demon gets a new look, not eight sides of the old one, pictures of new demons first; the man
gets the heavier, longer coat of the 7 Nov still, the boots to the knee, all eight sides truly painted and 30 a second; his
stance, run and spells stay the game's.

Shown the demon as it is beside the Brawler and the Warlock (`pictures/demon_today_beside_the_brawler.png`), asked two things:

- What should be much better (tick all that fit). His picks, all four: **“His body is a dark lump (Recommended),His head and
  face,His wings,Not scary enough”**.
- How far the new demon can go from the one in the game (offered: same demon drawn much better; a new design, same moves;
  start over, new moves too). His pick: **“A new design, same moves”**.
- 15:16: **“New designs, not older designs that I’ve already passed over”**

## What that means for the work

THE MAN (not begun on this branch yet):
- From the 7 Nov still, KEPT: his eight sides, each truly painted (`paintWarlockUp`); his coat hung as a heavy coat, longer,
  in folds, ragged at the hem, split up the back (`heavyCoat`); his boots real boots to the knee (`realBoots`).
- From the 7 Nov still, OUT (his rule of 7 Nov, the Ranger's README and the queue's item: only the look, the legs by the
  length of the bones, and the eight true sides change; how a hero stands and runs stays the game's): his feet set wider
  (`WL_FEET`, `WL_STAND`) and his run re-posed (`WL_RUN`). A check that fails on the game's own motion is reported with its
  numbers and the motion left alone (his run's quick foot: its thigh to 54 degrees).
- Every list at 30 a second (his stand and the demon's are at 10, the change at 13.7, the burning out at 7.8).
- As the Mage: carried onto today's `main`, behind a switch that is off, shown him as a film and pictures in the game on
  floor 11 beside the Brawler (`docs/mockups/mage_up/README.md` on `art/mage-up2` says how).

THE DEMON: A NEW DESIGN ON THE SAME MOVES.
- The moves he passed stay: its bones (`dev/sculpt_demon_rig.ts` DEMON_B), its stand on all fours, its run, the rakes,
  Damning, the smoke step, the change, the burning out (`dev/demon_moves.ts`, `dev/warlock_change.ts`). Only what is sculpted
  on the bones is new.
- NOT TO BE SHOWN HIM AGAIN (what he has passed over; `docs/mockups/classes/BRIEF.md`, 26 and 27 Oct): the ten of 26 Oct (one
  carved body with parts to choose: a brute's, a bare skull's, a long goat's, a great maw's and a hound's head; ram, swept,
  one great, antler, crown and bull horns; bat, ragged, two pairs of, and bare-bone wings), the redo's brute with wings,
  wraith, serpent and burning bones, and the bare-bone, brute's and bat's faces; nor the demon in the game.
- What he asked of the demon before is kept on every new one: on all fours, a gorilla's long arms, its claws flat on the
  floor burning with cyan flame (27 Oct: “Give me an all fours stance, gorilla like arms, claws flat on the floor burning
  with cyan flame and black smoke”); its fire the friend's cyan.

## The three new demons shown him (`src/dev/demon_new.ts`; FIRST SCULPTS, FROM IN FRONT ONLY, TO CHOOSE A DIRECTION)

Each on the game's demon's bones, none winged. Drawn against what he ticked: a few big forms a body where the game's demon
is some 150 small solids; each stuff its own colour, light enough to read on a dark floor; the far limbs a tone darker; a
bigger head, its face a few bold marks, lifted toward the eye so it is seen from above.

- **A. THE PACT MADE FLESH**: his demon arm grown over all of him. Old-blood hide (his arm's red, duller); black horn grown
  as armour down its back and over its shoulders, blades of bone off it; two great crescent horns (his hood's two, grown); a
  brow of black horn in a V over burning eyes; its jaws wide, long teeth; the pact's cracks of cyan light.
- **B. THE PALE CRAWLER**: bone-white, all elbows and backbone; its arms from the elbow down and its shanks black
  as if dipped in soot; no eyes; a mouth cut back from ear to ear full of needles; a crown of black thorns; a long bony tail.
- **C. THE BURNING MANE**: between a lion and an ape, the dusk violet of his coat, barred darker; four eyes in a dark mask;
  two sabre fangs; short horns swept back; a mane of his cyan hellfire round its neck, down its back and at the tip of its
  tail.

SHOWN FIRST STANDING ON ALL FOURS (the game's stand), asked which to take forward (our pick B) and whether to keep it without
wings. HIS WORDS INSTEAD, 11 Nov:

- **“I like that he’s on all fours, but really only when he’s running around.  Like he’s up on two legs to do really wide
  slashes with his claws, then when running he drops down to all fours like a feral beast”**
- Of wings: **“Maybe, we’ll see what you come up with”**

Read as, and told him so: standing and fighting it is UP ON TWO LEGS, so its claws can swing in really wide slashes; running
it drops to all fours, its run as it is. So its stand and its claw rakes are to be made again upright (this is HIS change to
“same moves”: the run stays; what else stands up, Damning, the smoke step's ends, how the change and the burning out end, is
to be settled with him as each is made, the run's start and stop dropping it down and rearing it up). Wings: tried on the one
he picks, shown only if they earn their place.

SO EACH WAS DRAWN BOTH WAYS: up on two legs (`DEMON_UP`, a new stance on the same bones, its claws open with his fire in
each), and running on all fours (the game's run, 0.6 s into its 0.7 s round, stretched longest in its leap). Shown him so,
asked which. HIS WORDS INSTEAD, 11 Nov:

- **“Nah man picture a werewolf frame, not a werewolf, but frame.  Big upper body, long arms big head, smaller torso”**

Read as, and told him so: the three were built too evenly, thick all the way down. THE BODY BUILT AGAIN AS A WEREWOLF'S
(`WOLF_B`: the game's demon's bones with the shoulders wider and the ribs bigger, the waist and hips smaller, the arms a
little longer, the head a size bigger and further forward; `wolfFrame`: a barrel of ribs and slabs of breast, a hump of
shoulder, its flanks drawn in steeply to a narrow waist and small hips, long arms, lean bent legs; `openClaw`: a hand of long
hooked talons held open; every head 1.2 times as big). Its stance up on two legs a werewolf's: hunched high, its head thrust
out, its long arms hanging forward, its claws open at its knees, burning. The same joints, so the game's run still fits it
(the pictures). SHOWN HIM WEARING THE THREE LOOKS, to judge the build first and the look second. (B on this frame is no
longer starved: bone-white, its limbs thin and its belly sunk in under great ribs.)

SHOWN HIM ON THE FRAME (the three pictures below), asked whether the frame was the one he pictured and which look it should
wear. HIS WORDS, 11 Nov:

- Of the frame: **“Sure but I don’t like these options so why do you keep giving them to me”**
- Of the look: **“None of these looks”**

Told him: my mistake; his “Nah man” had been to the looks too, and I had shown them twice more; they are gone. SETTLED: THE
FRAME (a werewolf's; up on two legs to fight, down on all fours to run). THE THREE LOOKS ARE PASSED OVER, not to be shown
again: the red one in black horn armour with crescent horns, the bone-white one with no eyes and a crown of thorns, the
violet one with four eyes and a mane of fire (`src/dev/demon_new.ts` keeps them for the record, and the frame they stand on).

Asked what the demon should look like on the frame (offered: today's demon on this frame, our pick; “I'll describe him”; ten
quick ideas). **His pick: “Ten quick ideas”** (offered as: ten small, different heads and hides on the frame to react to,
before any is drawn properly).

## Ten quick ideas (`src/dev/demon_ideas.ts`; SMALL AND QUICK, FOR HIM TO SAY WHICH WAY TO GO)

All on the one frame in the one stance (`DEMON_UP`), their claws open and burning; each a different creature in its head,
its hide and the one thing it is known by; none a look he has passed over.

1. YOURS, REBUILT: the demon he has (“I like okay”), on the frame, to measure the rest by: an ash-dark hide lifted so the body
   reads, two great horns swept back, the beast's face he picked on 27 Oct, spines, and wings folded round it like a cloak.
2. THE HORNED OWL: feathered slate-blue, a pale face in two discs, great round eyes, a hooked black beak, horns of feather.
3. THE SCALED: marsh-green scales, a long flat snout with teeth meeting down both sides, plates down its back, a heavy tail.
4. THE MANY-EYED: a spider's face: eight eyes, two heavy fangs and no jaw, a bristled umber hide.
5. THE ONE EYE: one great eye standing out of its socket, a jaw thrust out with two tusks, horns hooked down beside it.
6. THE LIVING SHADOW: black all through; only its eyes, a grin of teeth of light and its claws burn; smoke off it.
7. THE SPLIT FACE: its mouth a gash straight up its face, teeth meeting across it; three eyes a side; locks of flesh.
8. THE GARGOYLE: pitted, cracked grey stone; a block of a head, a square jaw, short horns; stone wings folded like a cloak.
9. THE ANGLER: a deep-water blue-black hide, long needles up out of a great underjaw, a fin of spines, his fire as its lure.
10. THE OBSIDIAN: black glass cut in facets, a crown of long shards, slits and a crack of his light for a face.

WINGS (his “Maybe, we’ll see what you come up with”): tried on 1 and 8 (`cloakWings`: an arm to a wrist high over the
shoulder, three fingers hanging down and back, the skin between bellied and scalloped; never one flat sheet).

QUICK MEANS: their hides' patterns are laid by where a point is in the figure's own space, not carried by each bone (they
would crawl if it moved); from in front only. The one he picks is drawn properly.

Pictures: `ten_ideas_1_to_5.png`, `ten_ideas_6_to_10.png` (each 2409 x 742, three times as big). Made with:
`npx tsx tools/demon_new_pics.ts <dir> ideas` then `python3 tools/demon_new_pics.py <dir> docs/mockups/warlock_up2/pictures ideas`.

HIS PICK OF THE TEN, 11 Nov (asked group by group; his answers: “6”, “6. The Living Shadow (Recommended)”, “None of these
three”, “No, not 10”): **6, THE LIVING SHADOW.**

## The Living Shadow, drawn properly (`src/dev/demon_ideas.ts` shadowInto; SHOWN HIM, HIS WORD ON IT AT THE FOOT)

On the werewolf's frame. Black all through, hardly a form on it (five tones from near black to a dark blue, so its shoulders
and back still turn): only what burns is seen. Two slanted eyes, both seen from in front; a grin of teeth of light from ear
to ear, an upper row and a lower on a jaw hung a little open; every talon of its claws and feet his cyan, his fire in each
open claw (and under each when it runs). Two horns curled like smoke; a tail that thins away; smoke rising off its horn tips
and the end of its tail (THE SMOKE IS GONE SINCE HIS WORD OF 11 Nov, by 20:26: “get rid of the smoke and just leave the
wings”; the foot of “Its slashes made walking on two legs”). FROM BEHIND it has no face, so his fire shows down its backbone: an ember across each knuckle of it,
laid on its skin (found by going out from the backbone until nothing of the body is left). No wings.

Pictures: `living_shadow.png` (up on two legs and running on all fours, each from in front and from behind, four times as
big, 2920 x 998 as it is now with its wings), `living_shadow_at_game_size.png` (beside the Brawler, the Warlock and his demon today, 2300 x 900). Made
with: `npx tsx tools/demon_new_pics.ts <dir> shadow` then
`python3 tools/demon_new_pics.py <dir> docs/mockups/warlock_up2/pictures shadow`.

SHOWN HIM SO (without wings, its claws turned up with a fire in each), asked whether it was the Living Shadow he wanted
(offered: yes, build its moves; close, change something; add wings). HIS WORDS, 11 Nov:

- His pick: **“Add wings”** (offered as: wings of smoke tried on it, shown him before its moves).
- 18:39: **“I dont like the palms up double fire hands”**

Read as, and told him so: no upturned palms and no flame in each hand; its claws hang ready to slash, only their talons
burning. DONE (`dev/demon_new.ts` claws, openClaw: up on two legs each hand hangs as a claw hangs, its palm turned back and
in, its fingers hooked; no fire in it. Running, his fire is still under each claw on the floor, his own word of 27 Oct).
WINGS OF SMOKE TRIED (`SHADOW_WINGS`, `cloakWings`): of its own black, half open and raised over its shoulders, each finger
bowed, the skin between bellied and deeply scalloped, a talon of his light at each wrist, their outer tips trailing away
into smoke. The pictures above are made again with both.

SHOWN HIM WITH BOTH, asked of each. **HIS YES TO THE LOOK, 11 Nov:** of its hands, **“Yes, the hands are right
(Recommended)”**; of its wings, **“I like the Smokey wings”**. SO THE DEMON'S LOOK IS SETTLED: THE LIVING SHADOW on the
werewolf's frame, its claws hung with only their talons burning, wings of smoke (`SHADOW_WINGS` on). Its moves are next.

TO THINK ON (his own tick of 11 Nov, “His body is a dark lump”): this one is dark on purpose, and is known by its outline (the
friend's cyan edge), its horns and what burns. To be looked at on the game's own floors beside the Brawler before it is
called done: if its body is lost on a dark floor, the answer is more of his light on it (its embers, an edge of light on its
shoulders), not a lighter hide.

STILL TO DO, in this order (his yes to the look is given): its stand up on two legs and its wide claw slashes (new moves), dropping to
all fours to run (the game's run) and rearing up to stop; what else stands up (Damning, the smoke step's ends, how the change
and the burning out end), asked as each is made; all eight sides; the change into it; behind a switch that is off, with a
film and pictures in the game on floor 11 beside the Brawler. Then THE MAN (above).

## The Living Shadow's moves (`src/dev/shadow_moves.ts`, `src/dev/shadow_fx.ts`; SHOWN HIM AS A FILM, HIS WORD ON IT AT THE FOOT)

The Warlock chat of the evening of 11 Nov 2026 (a new session, the queue's item pulled at his word at 19:11 Eastern: “Work on
this task from the Wordsmith Queue”). What his words change of “A new design, same moves”, and nothing else:

- **STANDING, UP ON TWO LEGS** (`shadowStand`; new, the game's demon stands on all fours). `DEMON_UP`, alive when still: a round
  of 3.2 s (96 pictures at thirty a second): two heavy breaths, its shoulders and back heaving; its weight rolled from leg to
  leg; its head swung slowly to its left and its right; its habit, its claws flexed open wide and hooked shut, its right's in
  the first breath, its left's in the second. Its wings of smoke breathe a beat behind it; its tail swishes.
- **TAP: A REALLY WIDE SLASH, its left claw, then its right** (`slashMove`; new, in place of the game's rakes on all fours;
  alternating as his pick of 27 Oct). TO THE GAME'S RAKE'S OWN FRAMES (`dev/demon_moves.ts` RK: 31 frames, the blow on frame 14),
  so the rules need no change. Wound up by frame 9 and held to 11: reared up tall onto its back leg, its chest turned right
  round, the claw far out to its side and behind its shoulder, opened wide, its wings lifted and spread. The swing, three
  frames (11 to 14): the claw ALL THE WAY ROUND at the length of its arm, across before it and past its other side, its hips
  and shoulders thrown round, its weight forward and down onto its front leg. A freeze, frames 14 to 16. Follow-through, the
  claw drawn back the way it went (never on round: his “Now they do a full 360, what is that?” of 27 Oct), and into its
  stance by frame 28. MEASURED: its talons sweep 5.5 tiles from side to side (its right's 5.4) and reach 3.6 tiles ahead of
  it (its right's 3.7), 16 to 122 of its own measure off the floor. (THE RULES' REACH IS NOT CHANGED BY THIS: the game's rake
  stands its foe 2.0 tiles ahead, `dev/demon_fx.ts` RAKE_REACH. Whether a slash this wide should hit this wide is his and the
  main chat's.)
- **WHAT A SLASH LEAVES** (`shadow_fx.ts` slashLight; as the game's rake's light, `dev/demon_fx.ts`, his “The cyan streaks
  should follow the claws”): four streaks of his cyan, one off each talon, along the way it truly went; the air between them
  lit for the frames of the swing; burning out from their tails over 0.3 s. On a picture of its own, wider than the demon's
  (`SLASH_SCENE`, 520 x 420): they go wider than its canvas. What it does to the one it hits is the game's rake's own, not
  drawn again.
- **DROPPING DOWN ONTO ALL FOURS INTO THE RUN** (`shadowDrop`; new). The game's own way of setting off (`AnimSet.start`): 18
  pictures, sixty to a second of the run (0.3 s), chosen by how far it has gone, leading into the run's seventh picture of
  forty-two (`DROP_INTO`: both claws just down). It pitches forward off its back leg, its claws flung out ahead and down, its
  rear hoof leaving the floor at picture 4 and its front at 7 (each where it stood until then, the floor going back under it
  as fast as the game carries it), and is in the run's own leap; its left claw lands, then its right, its fire bursting up
  under each. Its last seven pictures (12 to 18) are the run's own.
- **RUNNING: THE GAME'S RUN, AS IT IS** (`shadowRun`: `dev/demon_moves.ts` demonRun, bone for bone; only its elbows found again
  for this frame's longer arms). Its wings of smoke swept back, beating once a stride; its smoke dragged in its wake (left
  less far behind than the game's demon's: it rises from four places, and left far behind each was a row of dots). (NO
  SMOKE OFF IT AT ALL since his word of 11 Nov by 20:26, below.)
- **REARING UP OUT OF THE RUN** (`shadowRear`; new). The game's own way of coming to a stand (`AnimSet.stops`): EIGHT, one
  for each eighth of the run's round, each 14 frames (0.47 s) from the run as it is then into the stand's first picture. Its
  claws come up off the floor, it throws its weight back and up past its stance (its wings thrown wide to brake) and sinks
  into it. A hoof on the floor stays where it is until it is lifted straight up and set straight down where it stands.

HOW IT IS BUILT ON WHAT HE PASSED: `dev/demon_new.ts` and `dev/demon_ideas.ts` take, for a moving one only (`Moving`): a
claw's palm turned its own way and its fingers spread or hooked (`Kit.palm`, `grip`: a slashing claw's talons lead the
sweep), its wings held as the moment has them and turned with its chest (`Kit.wings`, `WingsHeld`), its fires' size, its
smoke's wake. A STILL IS AS IT WAS, TO THE PIXEL: the four pictures of `living_shadow.png` painted before and after are the
same files.

THE FILM: `pictures/living_shadow_moves.mp4` (1440 x 702, sixty frames a second, 39.5 s, 7.3 MB as made again without its smoke; MP4, his word on GIFs),
from in front and from behind side by side, two film pixels a picture pixel, on a plain floor of the game's tiles that goes
by under it as it is carried; the Brawler beside it at the start for its size. Its parts: standing (two rounds); the
slashes, left, right, left, right; the same at half speed; dropping down, running, rearing up; the same at half speed; all
of it together. Its stand, slashes and rearing up thirty pictures a second, its run and dropping down sixty, as the game
shows them. `pictures/living_shadow_moves_sheet.png`: a picture of it every third of a second, for whoever checks it.

Made with: `npx tsx tools/shadow_moves_pics.ts <dir> stand,run,slashL,slashR,drop,rear5 front,back` (about a minute and a half) then
`python3 tools/shadow_moves_film.py <dir> docs/mockups/warlock_up2/pictures/living_shadow_moves.mp4` (about a minute).
All eight rear-ups: `npx tsx tools/shadow_moves_pics.ts <dir> rear0,rear1,rear2,rear3,rear4,rear5,rear6,rear7`.

CHECKED (`tests/shadow_moves.test.ts`, its bones only, under a second: `npx tsx --test tests/shadow_moves.test.ts`, 6 of 6):
its stand comes round with no jump; its run is the game's, key for key; each slash to the game's frames, from its stance
and back to it, its hooves planted, held through the freeze, the swing more than four times as fast as anything else in
it, really wide, its talons clear of the floor; its dropping down from its stance into the run with nothing on the floor
sliding; each of the eight rear-ups from the run into its stance, a hoof on the floor staying until it is lifted. LOOKED
AT ON SHEETS: every frame of both slashes, of its dropping down and of one rear-up, from in front and from behind; its run
(every picture from behind, every other from in front); its stand every sixth picture from in front; all eight rear-ups
every other frame from in front: nothing cut off, no limb through its body, no head turned round. NOT YET (it is a mock-up awaiting his word): the picture's own checks frame by frame as the game's demon's have
(`tests/demon_moves.test.ts`).

KNOWN, AND LEFT FOR HIS WORD FIRST: a slash's streaks are laid over it from behind too, where the claw passes on its far
side (as the game's rake's light is laid over the game's demon); as its claws leave the floor rearing up, and reach it
dropping down, they change in one picture from claws spread on the floor to claws hung open (under 24 off the floor they
are its feet, `PAW_BELOW`); the stand is 96 pictures a view where the game's demon's is 48 (his rule of 8 Nov: everything
that moves at thirty a second), which the main chat should weigh against his phone's memory when it is baked for eight
sides.

SHOWN HIM SO, 11 Nov, after 19:45 Eastern (the film sent; asked by pop-up whether it moves as he pictured, whether the rest of its
moves should all begin and end up on two legs, and whether to save the work to GitHub, which that session was not let do
without his word). **HIS WORDS, 11 Nov, by 19:59:**

- Of how it moves (offered: “Yes, keep going (Recommended)”; close, change something; no, not this), his own words instead:
  **“This but I want him to be able to move around on two legs as he’s swiping”**
- Of Damning, the smoke step, the change into it and burning out (offered as: up on two legs for everything but running):
  **“Yes, all on two legs (Recommended)”**
- Of saving the work to the Warlock's branch on GitHub: **“Yes, save it (Recommended)”**

Read as, and told him so: THESE MOVES ARE THE ONES (“This”): its stand, its wide slashes, dropping down to run and rearing
up to stop stay as the film has them. AND ONE MORE, HIS: IT CAN MOVE AROUND ON TWO LEGS WHILE IT SLASHES: it stays up and
walks as it swipes, it does not have to stand still to slash nor drop to all fours to follow what it is fighting. In the
game's terms: its slashes made walking (`AnimSet.clips.attackWalk`, as the heroes' attacks are made over the run's legs,
`art/moves3.ts` walkingOf), on a walk of its own up on two legs, which is to be made (its legs striding under the slash, its
hooves gripping the floor as the game carries it). All fours stays for running with no slash. AND EVERY OTHER MOVE OF ITS
BEGINS AND ENDS UP ON TWO LEGS: Damning, the smoke step's two ends, the end of the change into it, the start of its burning
out; none needs asking of him again one by one.

## Its slashes made walking on two legs (`src/dev/shadow_moves.ts` walkingSlashMove; SHOWN HIM AS A SECOND FILM, HIS WORD ON IT AT THE FOOT)

His word above, “This but I want him to be able to move around on two legs as he’s swiping”. THE GAME'S OWN WAY OF AN ATTACK
MADE WALKING (`art/moves3.ts` walkingMotion, WALKS; `render/figure.ts`, `clips.attackWalk`): the game lets a hero walk through
an attack, slowed for its first moment (`TUNE.attackSlow` 0.4 for `attackSlowTime` 0.18 s) and at its own pace after, and
shows the attack again for whichever of four ways the hero is going as it faces its mark: ahead, to its left, back, to its
right. So EIGHT MOVES: each slash (its left claw's, its right's) each of the four ways (`SLASH_WAYS`), each to the slash's own
31 frames (the blow on frame 14), in which the game carries it 166.8 of its own measure, 4.26 tiles (`slashAlong`).

- ITS CHEST, ARMS, HEAD, WINGS AND CLAWS ARE THE SLASH'S, as it is made standing (its claws from its shoulders the same, to
  the frame). Its hips keep seven tenths of the slash's own throw back and forward and six tenths of its rise and drop, ride
  a little lower, and lean the way it goes.
- UNDER THEM, TWO GREAT STRIDES, TO THE SLASH'S OWN BEAT (weight first: “A blow plants the feet, turns the hips and carries
  through”). The hoof further on the way it is going STAYS where it stands through the wind-up (going ahead or to its left,
  its front hoof, its left; backing away or going to its right, its rear), the floor going back under it; the other STEPS
  at once, swinging through as it winds up. It springs off the staying hoof at frame 9.4 (8.2 backing away) and is off the
  floor as the claw swings. THE STEPPING HOOF COMES DOWN AT FRAME 13.3, AS THE BLOW LANDS (frame 14), 38 on from where it
  stood the way it goes (28 backing away or going across), and carries it through the freeze and the follow-through. It
  lifts at 23.3; the staying hoof lands at 27.2; the stepping hoof gathers in at 29.5; and at frame 31 it is IN ITS STANCE
  AGAIN, LEGS AND ALL: the next slash, its stand or its dropping down takes it up with no jump.
- A hoof on the floor stays where it is on the floor, as far as the game has carried it and the way it goes (never more
  than 0.2 of its own measure off in a frame); lifted straight up before it goes anywhere, set straight down.
- NOT A WALK OF ITS OWN: it has no walk on two legs with no slash (his: all fours “when he’s running around”). Its legs are
  made for the slash they are under, not a round taken up wherever it happens to be: a round at the game's pace did not come
  back to its stance as a slash ended, and one slash after another its legs jumped.

THE FILM: `pictures/living_shadow_slashing_on_the_move.mp4` (1440 x 702, sixty frames a second, 18.1 s, 4.3 MB as made again without its smoke), from in
front and from behind, the floor going by the way it goes and as fast as the game carries it (slowed for each slash's first
moment): going ahead, left, right, left, right; the same at half speed; then going to its left, backing away, going to its
right, and ahead again, a slash each; and it stands. `pictures/living_shadow_slashing_on_the_move_sheet.png`.

Made with: `npx tsx tools/shadow_moves_pics.ts <dir> stand,slashLw0,slashLw1,slashLw2,slashLw3,slashRw0,slashRw1,slashRw2,slashRw3 front,back`
then `python3 tools/shadow_moves_film.py <dir> docs/mockups/warlock_up2/pictures/living_shadow_slashing_on_the_move.mp4 walking`.

CHECKED (`tests/shadow_moves.test.ts`, now 7 of 7): all eight from its stance and back to it legs and all; its claws from
its shoulders as in the slash made standing; no hoof on the floor sliding; a hoof down as the blow lands and through the
freeze. LOOKED AT ON SHEETS: going ahead, every frame of its left claw's from behind and of its right's from in front; picked frames
of the other ways from in front and behind; six frames of the film itself.

FOR THE MAIN CHAT, WHEN IT COMES INTO THE GAME: (1) the game has walking clips for the tap's first swing and the heavy
(`clips.attackWalk`, `heavyWalk`), none for the combo's second swing (`clips.attack2`): its right claw's four want one
(`render/figure.ts`, the line that picks `walkers`). (2) After a slash made walking, if it is still going and no slash
follows, it should drop onto all fours as it does setting off (`AnimSet.start`), not be shown in the run at once. (3) A slash
begun while it is running on all fours begins from its stance up on two legs: the picture jumps up in one frame, as any
hero's attack begun running does; a rear-up cannot be played first without the blow coming later than the rules have it.

SHOWN HIM SO, 11 Nov, by 20:20 Eastern (the second film sent; asked by pop-up whether this was the moving around while
swiping he wanted: “Yes, that's it (Recommended)”; close, change something; no). **HIS WORDS, 11 Nov, by 20:26, his own:**

- **“Yeah it’s good but get rid of the smoke and just leave the wings”**

Read as, and told him so: ITS SLASHES MADE WALKING ARE RIGHT (“Yeah it’s good”). AND NO SMOKE OFF IT: the black smoke that
rose off its horns' tips and its wings' tips, and streamed behind it as it went, is gone, everywhere, standing as well as
moving; ITS WINGS STAY AS THEY ARE. DONE (`dev/demon_ideas.ts` SHADOW_SMOKE, off). Both films and the two stills
(`living_shadow.png`, `living_shadow_at_game_size.png`) are made again without it; nothing else in them is changed (the
frames' bones are the same: `tests/shadow_moves.test.ts`, 7 of 7). The second film sent him again so, by 20:30. NOT TAKEN
FROM IT: the smoke step (its swipe, the move in which it goes into smoke and comes out of it six tiles on) is a move, not
smoke off it, and stays the game's until he says otherwise; to be said to him plainly when that move is shown him up on two
legs.

STILL TO DO, IN THIS ORDER (11 Nov, 20:26): (a) Damning, the smoke step's two ends, the change's end and the burning out's
start, up on two legs, shown him (his “Yes, all on two legs (Recommended)”); then, as before: its eight sides, its hide
carried by its bones, the change into it; behind a switch that is off, a film and pictures in the game on floor 11 beside
the Brawler; then THE MAN.

(a) IS MADE AND SHOWN HIM: the next section.

## Its other moves, all up on two legs (`src/dev/shadow_moves.ts` shadowOthers; `src/dev/shadow_fx.ts`; SHOWN HIM AS A THIRD FILM, HIS WORD ON IT AWAITED)

The Warlock chat of the night of 11 Nov 2026 (a new session, the queue's item pulled at his word at 20:33 Eastern: “Work on
this task from the Wordsmith Queue”). His word for all of these, 11 Nov by 19:59, asked of Damning, the smoke step, the
change into it and burning out, offered as up on two legs for everything but running: **“Yes, all on two legs
(Recommended)”**. EACH IS THE GAME'S OWN MOVE (his “A new design, same moves”), TO THE GAME'S OWN FRAMES, so the rules need no
change; what is new is only that each begins and ends in its stance up on two legs, and what a body up on two legs must do
differently to make the same move.

- **TAP AND HOLD: DAMNING, TORN UP** (`shadowDamningMove`; the game's `dev/demon_moves.ts` damningMove, its frames DM: 48
  frames, 1.6 s, the blow on frame 24). His words of Damning, 27 Oct, kept: its move, “Tear it up (Recommended)”; what was
  worst of the first, “The rear-up and slam (Recommended),The effects”: SO NO REAR-UP AND SLAM HERE EITHER. From its stance it
  gathers a moment, its claws drawn up a little and opened (never as high as its shoulders: 53 off the floor at the most,
  its shoulders at 87); by frame 8 it has DROPPED INTO A CROUCH, both claws driven into the floor before it (`DAMN_DIG`: 44
  ahead of where it stands, 20 to each side), its hips sunk from 50 to 33; to frame 22 it heaves back against them,
  straining, its back arched up, its head down between its shoulders, shaking, its wings mantled up and forward over it,
  his fire building under its palms; in two frames (22 to 24) it TEARS THEM UP OUT OF THE FLOOR AND IS UP ON TWO LEGS AGAIN,
  its claws flung up and out in a V over its head (124 off the floor, its head at 101), its chest thrown open, its head
  flung back, its wings snapped open; a freeze, frames 24 to 26; it lets its arms down and is in its stance by frame 46.
  Its hooves stay where they stand all through.
- **WHAT DAMNING DOES TO THE FLOOR** is the game's own, laid where this body's claws are (`dev/shadow_fx.ts` clawsLight,
  damningScene: the claws' part of the game's demon's `dev/demon_fx.ts` damningLight, number for number, of that file's own
  pieces; for the demon's own claws it is the same picture, pixel for pixel, checked below; THAT FILE, WHICH THE GAME TAKES
  PIECES FROM, IS NOT TOUCHED): the flagstones cracked round its claws as they bite, the cracks running further and glowing hotter as it heaves; the floor torn up with them, stone flung
  up, his fire bursting out of the holes, which cool to pits with a little smoke out of them (the floor's smoke, the game's:
  not smoke off it). WHAT IT DOES TO THE ONES IT DAMNS (the ground bursting under every one cursed or burning) is the
  game's own as it is now and is not drawn again.
- **SWIPE: THE SMOKE STEP'S TWO ENDS** (`shadowStepMove`; the game's smokeStepMove, its frames SS: 46 frames, six tiles the
  way he swipes, its blow on frame 22; as far along and as far gone into smoke at every frame as the game's). WHERE IT SETS
  OFF, frames 0 to 9: it hunkers down on its haunches (its hips from 50 to 37), its shoulders rolling, its claws drawn back
  beside its haunches and clenched (NOT on the floor: no cracks under them here), its wings wrapped in round it; and
  springs forward into smoke, its claws flung out ahead, gone in two frames (frames 10 to 12; it breaks up pixel by pixel
  as the man does, `dev/warlock_fx.ts` dissolve). BETWEEN ITS ENDS, frames 12 to 20, it is the game's own storm of black
  smoke and his fire tearing along the floor, with its gouges and its river of smoke left behind
  (`dev/demon_swipe_fx.ts` smokeStepLight, given `own`): not made again. WHERE IT COMES OUT: it bursts out of the smoke
  coming down, its claws raised, and SLAMS THEM INTO THE FLOOR before it on frame 22 (its right claw half a frame after its
  left; `STEP_SLAM`), crouched low over them (its hips at 32), its wings snapped open, the floor breaking under them; held
  to frame 27; it rises off them ONTO TWO LEGS, roaring, its claws flung out wide (frame 32), and is in its stance by
  frame 44.
- **THE SMOKE IN THE SMOKE STEP**: his word of 11 Nov by 20:26 was “get rid of the smoke and just leave the wings”, of the
  smoke off its body. NO SMOKE COMES OFF IT HERE EITHER: the game's demon's smoke boiling up off its back as it coils is left
  out (`StepOwn.noBoil`). The storm it turns into, the smoke blasted out where it sets off and where it comes out, and the
  river left on the floor ARE the move, and are the game's as they are now. TOLD HIM SO PLAINLY, in the film's own words
  (“This smoke is the move itself, as it is in the game now. No smoke comes off its body.”) and asked.
- **THE END OF THE CHANGE INTO IT: ITS ROAR** (AS IT WAS FIRST MADE AND SHOWN HIM; HE TURNED IT DOWN, AND IT IS MADE AGAIN: the
  section “Its roar, made again” below. `shadowRoarMove`; the game's `dev/warlock_change.ts`: the 1.4 s, 42 frames, after he
  has become it, in which the game's demon heaves up off its claws and roars). As first made: it has come up onto two legs
  in its stance; it gathers three frames; by frame 7 it is REARED UP TALL, its chest thrown open, its arms flung out wide and
  back (its claws 128 apart, 3.3 tiles), its claws spread, its head thrust up; held to frame 17, shaking with it, its
  wings thrown back and up and beaten forward and down hard, back, and forward again (the game's own strokes at its roar,
  `wingsAt`); and it sinks into its stance by frame 37. THE CHANGE ITSELF (him becoming it: his bones grown into this
  frame's, its hide spreading over him, his coat torn away as its parts grow out of him) IS NOT MADE YET: it comes with its
  eight sides, and will end on this.
- **THE METER RUNS DRY: IT BURNS OUT** (`shadowBurnOutMove`; the game's burnOutMove, as long: 52 frames, 1.73 s; his picks of
  27 Oct, “Burns out (Recommended)”, “Meter runs dry (Recommended)”). A last heavy breath; WHAT BURNS ON IT GUTTERS, FLARING
  ONCE AND DYING (its eyes, its grin, its talons, the embers down its backbone: up on two legs it has no other fire;
  `ShadowMove.glow`, `dev/demon_new.ts` burning: through his cyan's own tones, white-hot and cyan to the darkest cyan, no
  new colour; a flare at frame 14); and it SAGS DOWN OFF ITS LEGS ONTO ONE KNEE: its rear knee, its right, brought down
  onto the floor before the hoof that stays where it stands, its front knee left up, its hips from 50 down to 19, its head
  dropped from 87 to 33, its shoulders slumped, its claws let down to lie on the floor by its knees, its wings drooped and
  folded. Still from frame 40. THEN, THE GAME'S OWN AS THEY ARE: it crumbles from its edges in over 0.9 s
  (`dev/demon_return.ts` crumble), and where it crumbles away there he is, on one knee where it sank down, and gets up
  (`dev/warlock_spells.ts` comeBack, 3 s): `dev/shadow_fx.ts` burnOutScene, laid as `art/warlock_art.ts` lays the game's.
  (The man in it is the game's man of today: his longer coat and his eight sides are still to come.)
- **STRUCK HARD, AND STRUCK FROM BEHIND** (`shadowStruckMove`; the game's `dev/warlock_hits.ts` demonStruck: 13 frames each).
  NOT ON THE LIST HE WAS ASKED OF, but the game shows them (`art/warlock_art.ts`, its `reel` and `lurch`) and on all fours they
  would drop it down for a moment every time it is hit: so made too, under his “all on two legs”, and said to him. STRUCK
  HARD: rocked back on its legs, its head snapped up and round, its arms thrown wide, its wings snapping open, its tail
  lashing; back into its stance. STRUCK FROM BEHIND: driven forward over its front leg, its wings flung wide, its head
  whipped up; it snaps its head round to glare back over its shoulder. Its hooves stay where they stand.

HOW IT IS BUILT ON WHAT HE PASSED. A move may now say (`ShadowMove`): which way both palms face (`palms`); that its claws go
down onto the floor (`digs`: a claw lower than 24 off the floor is drawn as a claw on the floor, spread flat, as when it
runs; hung open that low its talons would be down through the floor and off the foot of its picture); how far it is gone
into smoke and when it is off the floor (`gone`, `air`); how bright what burns on it is (`glow`). The game's demon's
smoke step's effect (`dev/demon_swipe_fx.ts` smokeStepLight: a mock-up file, nothing of the game takes from it) takes one
more thing, `own` (`StepOwn`), which tells it where another body's claws are and to leave out the smoke boiling off its
back; NOT GIVEN, IT IS AS IT ALWAYS WAS, TO THE PIXEL (checked below). A STILL IS AS IT WAS, TO THE PIXEL, and so are the
moves made before (checked below). Its other moves come after the rest in `shadowMoves()`, so each of those is where it
was in the list.

THE FILM: `pictures/living_shadow_other_moves.mp4` (1440 x 702, sixty frames a second, 50.2 s; 6.9 MB as it was shown him, 7.6 MB
as made again with its roar made again and its jaws opening, which is the file here; MP4), from in front
and from behind side by side, two film pixels a picture pixel, on the plain floor of the game's tiles; in the smoke step
the eye goes with it and the floor goes by under it. Its parts: Damning, it standing on over what it tore up; the same at
half speed; the smoke step; the same at half speed; its roar, twice; its burning out, its crumbling, him getting up;
struck hard twice and from behind twice; the same at half speed; and all of it in a fight (slash, slash, struck, the
smoke step, slash, slash, Damning). After Damning and after the smoke step the film goes on a moment, it standing, so that
what they left on the floor is seen to cool where it lies (`dev/shadow_fx.ts` mineAt). `pictures/living_shadow_other_moves_sheet.png`:
a picture of it every third of a second (2160 x 4550).

Made with: `npx tsx tools/shadow_moves_pics.ts <dir> stand,slashL,slashR,damning,step,roar,burnout,reel,lurch front,back`
(about four minutes) then `python3 tools/shadow_moves_film.py <dir> docs/mockups/warlock_up2/pictures/living_shadow_other_moves.mp4 others`
(about a minute). A few frames only, to look at: a sixth word, their numbers (`... damning front,back 0 8,22,24`).

CHECKED:
- `npx tsx --test tests/shadow_moves.test.ts`, about two seconds: 15 of 15 (the 7 there were, and 8 new; its bones only, but
  the last, which lays Damning's light): its other moves after the rest in its list; Damning to the game's frames, from its stance and back to it, its hooves where they
  stand, NO REAR-UP AND SLAM (before its claws go down it never rises more than 2.5 and they are never within 15 of as high
  as its shoulders), its claws in the floor from where they bite until it tears them up, the tearing up more than two and
  a half times as fast as anything else in it, held through the freeze, risen with its claws over its head as the blow
  lands; the smoke step to the game's frames, as far and as gone as the game's at every half frame, from its stance and back
  to it, its hooves where they stand while it is on the floor, its claws slammed down staying until it lifts them; its
  roar as long as the game's change gives it, from its stance and back to it, its hooves still; its burning out as long as
  the game's, from its stance, never rising (but for its last breath), its front hoof and its rear hoof's toes where they
  stand, no knee through the floor, on one knee at the end, still as it ends (the same picture crumbles), what burns on
  it as ever at its start and all but out at its end, flaring once, and only in his cyan's own tones; struck hard and from
  behind 13 frames each, from its stance and back to it, its hooves still; and Damning's light at its claws the game's
  demon's own: laid for the demon's own claws, at seven moments from in front and from behind, the same picture as the
  game's demon's, pixel for pixel (what is at its claws at every one of them; what is on the floor at every one before
  the blow, after which the game's has the ground broken under the ones it damns as well).
- A STILL IS AS IT WAS: `living_shadow.png` and `living_shadow_at_game_size.png` made again (the commands above them) and
  compared with the files here: the same pixels. THE MOVES MADE BEFORE ARE AS THEY WERE: all 64 pictures of its left claw's
  slash (32 from in front, 32 from behind), painted before this session's work and after it: the same files, byte for
  byte; the first film made again by its tool: 2372 frames, 39.5 s, as it was.
- THE GAME'S DEMON'S SMOKE STEP'S EFFECT IS AS IT WAS WHERE NOTHING NEW IS ASKED OF IT: `smokeStepLight` for the game's own
  demon, every layer of it, at seven moments from in front and from behind, before this session's work and after it: the
  same, to the pixel (and `damningLight`'s with it, whose file is not touched).
- NOTHING CUT OFF: counted, not only looked at: in no frame of Damning, its roar, its burning out, struck hard, struck
  from behind or its stand, from in front or behind, is there a painted pixel on the edge of its own canvas (the game's
  demon's, 360 x 320). (Found so and put right: its near claw off the foot of its picture as it knelt, as it was driven
  down in Damning, and as it was thrown forward struck from behind.)
- LOOKED AT ON SHEETS: every frame of Damning and of the smoke step, from in front and from behind; every frame of both
  struck moves from in front; its roar and its burning out every other frame from in front and from behind; its
  crumbling every other frame; and frames of the film itself at full size.
- `tsc --noEmit -p tsconfig.json`: nothing from this branch (the one line from `tests/relief.test.ts`, as before).
- Nothing of the game imports `dev/shadow_moves.ts`, `shadow_fx.ts`, `demon_new.ts`, `demon_ideas.ts` or
  `demon_swipe_fx.ts`: the five files of the art's this session changed. No file the game is made of is changed
  (`dev/demon_fx.ts`, which `render/warlock_fx.ts`, `render/tinkerer_fx.ts`, `art/warlock_icons.ts` and
  `art/tinkerer_icons.ts` take pieces from, is as it was).

KNOWN, AND LEFT FOR HIS WORD OR THE MAIN CHAT:
- From in front, the smoke blasted out where it comes out of the smoke step (the game's own, laid before it) hides its
  legs and its claws for about ten frames as it lands; from behind it is laid beyond it, where it is, and its back is clear.
- Up on two legs it has no fire under its claws to gutter as it burns out, as the game's demon has: what burns on it
  dims instead. Its claws lying on the floor at the end have no fire under them.
- From in front its near arm (its right) is between the eye and its chest: flung up in Damning it is beside its head, not
  high over it as its far arm is.
- FOR THE MAIN CHAT, when it comes into the game: where the game lays Damning's cracks and the smoke step's broken floor
  under the demon's claws (`render/warlock_fx.ts`) wants looking at against where THIS body's claws go down (`DAMN_DIG`,
  `STEP_SLAM`: 44 ahead and 20 to each side; the game's demon's are 28 and 26 ahead, 21 and 22 to the sides). And how
  many pictures a side these are: Damning 49, the smoke step 47 (the game shows its frames 10 to 20 as ten laid over the
  step), its roar 43, its burning out 53 before it crumbles, struck 14 each.

SHOWN HIM SO, 11 Nov, by 21:30 Eastern (the third film sent; asked by pop-up three things: whether its other moves look
right, all up on two legs; whether the smoke step's own smoke should stay; whether to save the night's work to GitHub).
**HIS WORDS, 11 Nov, by 22:08:**

- Of the moves (offered: “Yes, keep going (Recommended)”; close, change something; no, not this), his own words instead:
  **“The roar is so bad.  His face doesn’t even move?  No animations out of the mouth?  No spittle or action lines or screen
  shake on the roar?”**
- Of the smoke step's smoke (offered as: the smoke is the move itself; less smoke; no smoke at all): **“Keep it as is
  (Recommended)”**
- Of saving the work to the Warlock's branch on GitHub: **“Yes, save it (Recommended)”**

Read as, and told him so: THE ROAR IS TO BE MADE AGAIN, PROPERLY: its face moving (its jaws thrown wide open), the roar seen
coming out of its mouth, spittle flying, action lines, and the screen shaking with it. He named nothing else: Damning, the
smoke step, its burning out and being struck are taken to stand unless he says otherwise; and wherever else it roars (as
it tears its claws up in Damning, as it rises out of the smoke step) its jaws are to open too. THE SMOKE STEP'S OWN SMOKE
STAYS AS IT IS. SAVED: this section's work as it was shown him (the next section, when it is written, is the roar made again).

## Its roar, made again (`src/dev/shadow_moves.ts` shadowRoarMove; `src/dev/shadow_fx.ts` roarLight; `src/dev/demon_ideas.ts`, its jaws; SHOWN HIM AS A FOURTH FILM, HIS WORD ON IT AWAITED)

His words of the first roar, 11 Nov by 22:08: **“The roar is so bad.  His face doesn’t even move?  No animations out of the
mouth?  No spittle or action lines or screen shake on the roar?”** Each thing he named, and where it is now:

- **“His face doesn’t even move?”** ITS JAWS OPEN (`dev/demon_ideas.ts` shadowInto, `Kit.jaw`, 0 shut in its grin to 1 as wide as
  they go): its lower jaw and the teeth that stand on it swung down and back 40 degrees about a hinge behind its grin; HIS
  FIRE SEEN BURNING IN ITS THROAT between the two rows of its teeth (white-hot where it faces out of its mouth, cyan round
  that, his darkest cyan at its rim: his cyan's own tones, a friend's glow); its eyes narrowed to slits. A STILL IS AS IT
  WAS, TO THE PIXEL (its jaws shut: every number as it was; checked). AND ITS HEAD MOVES: ducked as it draws its breath,
  thrown up and out as it roars, SHAKING FROM SIDE TO SIDE with the roar (11 degrees each way, six times across), its jaws
  quivering while they are held open.
- **THE ROAR ITSELF, AS A MOVE** (to the game's 42 frames, 1.4 s; big wind-up, lightning strike, his rulebook's Movement 9):
  frames 0 to 5 IT DRAWS ITS BREATH, coiling down and in (its hips from 50 to 44, its head from 87 down to 69), its claws
  clenched in before its chest, its wings folded tight; frames 5 to 8 IT THROWS ITSELF OPEN: reared up tall (its head to
  104), its chest flung out, its arms flung wide and back level with its shoulders (its claws 132 apart, 3.4 tiles), its
  claws spread, its jaws wide by frame 8, its wings snapped wide; frames 8 to 24, HELD, half a second: its head shaking, its
  whole body trembling and leaning into it as its breath runs out, its wings beating; frames 24 to 35 its jaws close, with
  a last snap; in its stance by frame 38.
- **“No animations out of the mouth?”** RINGS OF FORCE roll out of its jaws (`roarLight`): five, one every three and a half
  frames from the frame the roar bursts out (6.5), each the way its face points as it leaves (its head shakes: no two go
  quite the same way; ahead of it and 29 degrees up), swelling as it goes, whole as it leaves and breaking up as it thins,
  11 frames each, out to 2.6 tiles (as far as the game's rules have its roar throw back what is near, `game/warlock.ts`
  change.roar). A flash at its jaws as it bursts out. ON THE FLOOR, the game's own ring thrown out as the demon roars
  (`dev/warlock_fx.ts` morphLight), as it is.
- **“No spittle”** SPITTLE: thirty flecks flung from its jaws in the roar's first eight frames, falling as a thing thrown
  falls, a speck where each lands, gone before the roar is over.
- **“or action lines”** ACTION LINES: fifty-four streaks flung out from its mouth round the rings (wider than the rings
  swell: never across one), fourteen of them at once as it bursts out and the rest one after another while it roars,
  four frames each.
- **“or screen shake on the roar?”** THE SCREEN SHAKES AS THE GAME SHAKES IT (`ShadowMove.shake`: what the move asks of the
  game's own shake, `render/fx.ts`: 5.5 as the roar bursts out, frames 6 to 7.5 (the shakes the game names in that file
  run from 0.8 to 6); kept at 3 while it is held, to frame 23; the game lets it die away at 22 a second). In the film the picture is shaken
  so, a film pixel and a half for a screen pixel. IN THE GAME THIS IS THE MAIN CHAT'S TO WIRE: a note for it below.
- **WHEREVER ELSE IT ROARS ITS JAWS OPEN TOO**: as it tears its claws up in Damning (wide from the blow through the freeze;
  bared as it strains); as it rises out of the smoke step (bared as it slams down); and a snarl as it is struck. Shut as
  each begins and ends.

All of what leaves its mouth is in his cyan. From in front it is nearer the eye than it is and is laid over it; from behind
it is beyond it and is laid under it.

THE FILM: `pictures/living_shadow_roar.mp4` (1440 x 702, sixty frames a second, 24.0 s, 4.2 MB; MP4). Its parts: the roar,
twice; the same at half speed; ITS FACE CLOSE UP at a quarter speed, five times as big, shown without the rings and lines
so that its face is seen (a window that does not move, so its head is seen to move); and where else it roars (Damning, the
smoke step, a snarl as it is struck). `pictures/living_shadow_roar_sheet.png`: a picture every third of a second (2160 x
2275). THE THIRD FILM IS MADE AGAIN with the roar made again and its jaws opening (`pictures/living_shadow_other_moves.mp4`,
50.2 s, 7.6 MB).

Made with: `npx tsx tools/shadow_moves_pics.ts <dir> stand,slashL,slashR,damning,step,roar,roarface,burnout,reel,lurch front,back`
(about five minutes; `roarface` is the roar with nothing leaving its mouth, for the close-up) then
`python3 tools/shadow_moves_film.py <dir> docs/mockups/warlock_up2/pictures/living_shadow_roar.mp4 roar` and
`... living_shadow_other_moves.mp4 others`.

CHECKED:
- `npx tsx --test tests/shadow_moves.test.ts`, about two seconds: 17 of 17 (the 15 there were, and 2 new): its roar: its jaws
  shut as it begins, as it draws its breath and as it ends, wider than nine tenths from frame 8 to frame 24, never still
  two frames running while held, shut from frame 35; its head ducked more than 8 degrees and then thrown up more than 18,
  shaken more than 6 degrees each way and across at least three times; the screen not shaken before the roar bursts out
  nor after its breath runs out, 5 or more as it bursts out, 3 or more at every frame it is held; nothing in the air as
  it draws its breath, the roar seen (more than 150 lit pixels) at five moments of it from in front and from behind,
  nothing left as it ends; it roars ahead and up, out of its mouth; laid over it from in front and under it from behind.
  And wherever else it roars: its jaws shut as Damning, the smoke step and both struck moves begin and end, wide as it
  tears its claws up and through the freeze, wide as it rises out of the smoke, more than half open as a blow snaps it,
  and never less than shut nor more than wide.
- A STILL IS AS IT WAS: `living_shadow.png` and `living_shadow_at_game_size.png` made again with the jaw in its sculpture:
  the same pixels. THE MOVES MADE BEFORE ARE AS THEY WERE: the 64 pictures of its left claw's slash, painted before this
  session's work and after all of it: the same files, byte for byte.
- NOTHING OF IT CUT OFF: counted: no painted pixel of it on the edge of its own canvas in any frame of its roar painted
  alone (`roarface`), Damning, its burning out, either struck move or its stand, from in front or behind. (The game's
  ring on the floor runs out past the foot of its canvas, as it does in the game: it is laid on the floor, not on its
  picture.)
- LOOKED AT: every frame of the roar from in front and from behind; its face at four openings, close; Damning's and the
  smoke step's frames where its jaws open; and frames of the film itself at full size, the close-up among them. (Found so
  and put right: a first ring with a single streak beside it was taken for a thing with a handle, and a streak across a
  ring for a sign for “no”: the streaks now burst out together and go round the rings; its arms flung wide at its hips
  were taken for an arm it leaned on: they are level with its shoulders.)
- `tsc --noEmit -p tsconfig.json`: nothing from this branch. No file the game is made of is changed.

FOR THE MAIN CHAT, when it comes into the game: (1) THE SCREEN SHAKE on its roar is the game's to do (`render/fx.ts` `shake`):
5.5 as the roar bursts out (0.22 s after the change's own roar moment, `ROAR_AT`), kept at 3 for the half second it is held.
(2) WHAT LEAVES ITS MOUTH is not on its picture: it wants laying in the game as the game lays the roar's ring
(`render/warlock_fx.ts`, 'roar'), from its mouth (`dev/shadow_fx.ts` mouthAt) the way it faces, over it or under it by
which way it faces the eye. (3) Its jaws opening is in its pictures: nothing to wire.

SHOWN HIM SO, 11 Nov, by 22:45 Eastern (the fourth film sent; asked by pop-up). **HIS WORDS: AWAITED.**

STILL TO DO, IN THIS ORDER (11 Nov, 22:45): his word on the roar made again; then its eight sides, its hide carried by its
bones, the change into it (ending on its roar); behind a switch that is off, a film and pictures in the game on floor 11
beside the Brawler; then THE MAN.

THE FIRST THREE'S PICTURES (kept for the record):

Pictures (`pictures/`, each wider than tall for his phone held sideways):
- `new_demons_on_two_legs.png`: the three on the werewolf's frame, up on two legs, four times as big (2044 x 950).
- `new_demons_running.png`: the three running on all fours, four times as big (2044 x 854).
- `new_demons_at_game_size.png`: the Brawler, the Warlock, his demon today and the three up on two legs, on one floor line,
  three screen pixels a picture pixel (2480 x 880).
- `demon_today_beside_the_brawler.png`: the demon as it is, from in front and from behind, beside the Brawler and the Warlock.

Made with: `npx tsx tools/demon_new_pics.ts <dir>` then `python3 tools/demon_new_pics.py <dir> docs/mockups/warlock_up2/pictures`.

NOT YET, FOR THE ONE HE PICKS: finished detail; from behind and its eight sides; its new stand and wide slashes up on two
legs, and dropping to all fours to run; its other moves looked at one by one; the change into it; beside the Gate Ward's
ground in the game.

## The checks so far

- `tsc --noEmit -p tsconfig.json`: nothing from this branch. (One line from `tests/relief.test.ts`, line 378, under the
  workspace's own TypeScript 7.0.2, the same before this branch's work as after it: not this branch's.)
- Nothing of the game imports `src/dev/demon_new.ts`, `demon_ideas.ts`, `shadow_moves.ts`, `shadow_fx.ts` or
  `demon_swipe_fx.ts`; no file of the game is changed.
- `npx tsx --test tests/shadow_moves.test.ts`: 17 of 17 (above). No other test was run: none imports these files.
