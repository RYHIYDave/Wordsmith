**WHERE IT STANDS (12 Nov 2026, by 15:xx Eastern): THE LIVING SHADOW IS DONE AND HANDED TO THE MAIN CHAT, WITH HIS YES: its look,
every move, its eight sides, its hide carried by its bones, the change into it, in the game's shape behind LIVING_SHADOW (off),
and seen in play on floor 11 beside the Brawler (his “Yes, hand it to main (Recommended)”; the change's time in play kept at
the game's 2.4 s, his “Keep the game's 2.4 s (Recommended)”). On the queue's ship list as `warlock-living-shadow`. WHAT THE MAIN
CHAT MUST DO: the sections “In the game's shape, behind a switch that is off” and “In play on floor 11”. THE MAN, his eight sides,
his longer heavy coat and boots to the knee, every list at 30 a second, IS MADE on the branch `art/warlock-man8` (cut from this
one), behind WARLOCK_UP (off), and shown him in play: the section “The man” at the foot (his word on the pictures awaited; then, at his words “Why don’t you pack him away?”, packed and the bolt mended on `build/warlock-packed`: the section “The Warlock kept in packs” at the foot).**

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

THE MAN (made on `art/warlock-man8`: the section “The man” at the foot):
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

## Its other moves, all up on two legs (`src/dev/shadow_moves.ts` shadowOthers; `src/dev/shadow_fx.ts`; SHOWN HIM AS A THIRD FILM, HIS WORD ON IT AT THE FOOT)

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

## Its roar, made again (`src/dev/shadow_moves.ts` shadowRoarMove; `src/dev/shadow_fx.ts` roarLight; `src/dev/demon_ideas.ts`, its jaws; SHOWN HIM AS A FOURTH FILM; HIS YES AT THE FOOT)

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

SHOWN HIM SO, 11 Nov, by 22:45 Eastern (the fourth film sent; asked by pop-up whether that was the roar he wanted: “Yes,
that's it (Recommended)”; close, change something; still not it). **HIS WORD, by 12 Nov, 05:33 Eastern: “Yes, that's it
(Recommended)”.**

SO ALL OF THE LIVING SHADOW'S MOVES ARE SETTLED WITH HIM: its stand, its wide slashes, dropping down to run, rearing up to
stop, its slashes made walking on two legs, Damning, the smoke step's two ends (its own smoke kept), its roar, its burning
out, and struck hard and from behind (those last four and Damning taken to stand: he was shown them and named only the
roar).

STILL TO DO, IN THIS ORDER (12 Nov, 05:35): its eight sides, its hide carried by its bones, the change into it (ending on
its roar); behind a switch that is off, a film and pictures in the game on floor 11 beside the Brawler; then THE MAN.

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

## Its eight sides, its hide carried by its bones, and the change into it (SHOWN HIM AS TWO FILMS; HIS YES AT THE FOOT)

The queue chat of 12 Nov (midday), a new chat of his working the queue at his word (“Work on the next queue item”, 12:55
Eastern), from `art/warlock-up2` at fa8dd52.

**ITS EIGHT SIDES.** Each truly turned before the game's own camera, 45 degrees apart, none a mirror, as the Warrior's are
(`art/warrior_up.ts` WU_SPIN: `front` 0, `toward` -45, `frontL` -90, `sideL` -135, `backL` 180, `away` 135, `back` 90, `side`
45, every one from in front). Its painter took a turn already (`dev/demon_new.ts` paintDemon, `Sculpt.spin`), and so does all
that its moves leave (`dev/shadow_fx.ts`: a slash's streaks, its roar's rings, lines and spittle, Damning's and the smoke step's
scenes): every move of its is painted from every side with nothing new to it. LOOKED AT: its stand, both slashes, its roar,
dropping down, running and rearing up from all eight; from in front its grin, from behind the embers down its backbone, from
each side side-on; the roar's rings out of its mouth whichever way it faces, beyond it from behind.

**ITS HIDE CARRIED BY ITS BONES** (`dev/demon_new.ts` carry, carriedRot, limbRot, footTurn, hipsTurn; HIDE_CARRIED on). What the
still laid along the world, not along a bone: the hump over its shoulders and where it sits, the swell of its flanks, its
shoulders and the swell of its upper arms, its forearms and thighs, its feet and their talons and spurs, where the top of its
back and its neck run from, the way its embers face, and the sweep of its tail. Each is now laid in any pose as it lies to ITS
BONE in the still (DEMON_UP): its chest, its hips, the limb it is on, its foot on the floor; as the game's demon's parts are
carried (`dev/sculpt_demon_rig.ts`). IN THE STILL'S OWN POSE NOTHING IS TURNED: `living_shadow.png`'s two up on two legs painted
before and after are the same files, byte for byte. In its moves: with its chest wound right round in a slash, its embers now
run straight down its turned backbone where they sat off to one side of it; on all fours its hump sits at its withers. Of the
frames painted before and after (its stand, slashes, roar, dropping down, run, rearing up, from in front and behind): 41 the
same, 518 changed by it. TOLD HIM: running toward the eye, the embers on the top of its back now face up out of it, so a few
show behind its head from in front (they did a little before); left so, as its body truly turns.

**THE CHANGE INTO IT** (`dev/shadow_change.ts`; `tests/shadow_change.test.ts`). THE GAME'S OWN CHANGE KEPT, its every time
(`dev/warlock_change.ts`: tapped, he jolts and the pain doubles him over, 18 frames; he becomes it over 1.5 s; his coat, hood
and boots torn away a piece at a time in puffs of smoke; the embers whirling up round him): until he begins to become it, the
picture is the game's own change to the pixel (checked). What he becomes is the Living Shadow: his bones grown into its
werewolf's frame and his pose into ITS STANCE UP ON TWO LEGS (his “Yes, all on two legs (Recommended)”), heaving as he
changes; ITS BLACK spreading over him from his demon arm, a ragged edge of his cyan before it; its parts grown out of him in one
sculpture with him, each at its moment already a little grown (`SHADOW_GROWTH`): its claws out of his hands first, its body
swelling out of his, its horns through his hood, its head as his hood tears, the embers down its back, its tail, and last its
wings unfolding out of his back. A horn, a talon, a finger or its tail grows out as one from its root (grown a piece at a
time from each piece's own root, they hung in a broken arc over his head: seen and put right). Whole, it is in its stance
exactly, and ITS ROAR, the one he said yes to, begins from that very stance: 3.5 s from his being tapped to the end of its roar
(`SHADOW_CHANGE_ALL`). The game's change file is not changed but four of its helpers exported as they were
(handsFromShoulders, poseBetween, tearsAt, untilK); the game's own Warlock art imports that file, and its change is as it was.

THE FILMS (MP4, both at his phone's own size held sideways, 2556 x 1178; sixty film frames a second):
- `pictures/living_shadow_eight_sides.mp4` (16.6 s, 14.3 MB): eight panels at once, each side labelled and with an arrow the way
  it faces, two film pixels a picture pixel: its stand, its slashes, its roar, dropping down to run (the floor going by under
  each the way that one runs) and rearing up, its slashes at half speed. `..._sheet.png`, a picture every half second. Made with
  `npx tsx tools/shadow_moves_pics.ts <dir>/t<turn> stand,slashL,slashR,roar,drop,run,rear5 front <turn>` for each of the eight
  turns (under a minute each), then `python3 tools/shadow_sides_film.py <dir> <out.mp4> [sheet.png]`. The far tips of its
  widest slash's streaks and the tops of its roar's rings are cut at a panel's edge (eight panels at that size); it itself
  never.
- `pictures/living_shadow_change.mp4` (16.8 s, 6.2 MB): the change from in front and from behind side by side, four film pixels
  a picture pixel, at its own speed and at half speed; then from all eight sides at once. `..._sheet.png`. Made with
  `npx tsx tools/shadow_moves_pics.ts <dir>/t0 change front,back 0` and `... <dir>/t<turn> change front <turn>` for the other
  seven, then `python3 tools/shadow_change_film.py <dir> <out.mp4> [sheet.png]`.

CHECKED: `tests/shadow_change.test.ts` (new), 4 of 4: its hide carried (nothing turned in the still's pose, the very numbers;
turned with its chest otherwise; nothing turned without a still to carry from); the change the game's own before it begins (the
same pixels, from in front and behind), its stance exactly at its end, a picture before within 4 of it, its roar's first
picture its stance; its parts' times in order; nothing on the scene's edge from in front, behind and turned at four moments.
`tests/shadow_moves.test.ts` 17 of 17 after the hide's carrying. `tsc --noEmit -p tsconfig.json` clean. LOOKED AT: the stand
from all eight; the slash wound up, the blow and the run from four sides; before and after its hide carried, close; the change's
frames from in front and behind every few; frames of both films themselves at full size. NOT YET: the picture's own checks
frame by frame as the game's demon's have; its eight sides of Damning, the smoke step, its burning out and struck (painted the
same way, not looked at one by one); the main chat's to weigh, its pictures from eight sides held on his phone (its stand alone
is 96 pictures a side).

SHOWN HIM SO, 12 Nov, by 13:27 Eastern (both films sent; asked by pop-up of each). **HIS WORDS, 12 Nov, by 13:30:** of its eight sides
(asked whether it looks right from all eight, its hump, embers and tail moving with its bones), **“Yes, all eight are right
(Recommended)”**; of the change (asked whether that is the change he wants: the game's own, the Living Shadow growing out of him
and ending on its roar), **“Yes, that's the change (Recommended)”**. SO ITS EIGHT SIDES, ITS HIDE CARRIED BY ITS BONES AND THE
CHANGE INTO IT ARE SETTLED WITH HIM: none to be shown him again. NEXT: into the game's shape behind a switch that is off, a film
and pictures in the game on floor 11 beside the Brawler, his yes, then the ship list; then THE MAN.

## In the game's shape, behind a switch that is off (`src/art/shadow_art.ts`; LIVING_SHADOW, off)

The queue chat of 12 Nov (midday), at his word “Work on the next queue item” (13:30 Eastern). Step 3's first half: THE LIVING
SHADOW'S LISTS IN THE GAME'S OWN SHAPE (art/actor_types.ts AnimSet), as `art/warlock_art.ts` lays out the game's demon today,
and the switch that puts them in its place. OFF: the game's Warlock and his demon are exactly as they were (`art/warlock_art.ts`
takes these lists only with it on: `makeWarlockArt` for `form` 'demon', and the man's `clips.change`).

| list | the Living Shadow | the game's demon today |
|---|---|---|
| idle | its stand up on two legs, 96 pictures at 30 | 48 at 10, on all fours |
| walk | the game's run on all fours, 42 at 60, its feet gripping | the same run |
| start (setting off) | dropping onto all fours into the run, 19 at 60, into the run's 6/42 (`startAt`) | none: the run at once |
| stops (8) | rearing up out of the run, one for each eighth of its round, 15 each at 30 | none: its stand at once |
| attack, attack2 | its really wide slashes, left claw then right, 32 each at 30, the blow at frame 14 (the rake's) | its rakes |
| attackWalk (4) | its left claw's slash made walking on two legs, ahead, to its left, back, to its right | none |
| heavy | Damning, up on two legs, 49 at 30 (the game's own frames) | its Damning, 49 pictures |
| leap, land | the smoke step's two ends, up on two legs | the smoke step |
| reel, lurch | struck hard and from behind | the same, on all fours |
| change (burning out) | its burning out, crumbling, him on one knee getting up, 170 at 30 | the same, 44 pictures |
| the man's change | the change into it, then its roar: 106 pictures at 30, the game's own length (3.5 s) | 48 pictures |

Two sides (`front`, `back`), as the man has; its eight (each with his yes) come with the man's eight, step 4.

WHAT THE GAME MUST DO ITSELF, for the main chat when it is switched on (none of it is on its pictures; the earlier sections'
notes): (1) a slash's streaks of his cyan (`dev/shadow_fx.ts` slashLight), laid as `render/warlock_fx.ts` lays the rake's;
(2) its roar's rings, lines and spittle from its mouth (`roarLight`, `mouthAt`) and the screen's shake (`ShadowMove.shake`,
`render/fx.ts`); (3) Damning's and the smoke step's light on the floor (`clawsLight`, `damningScene`, `stepScene`); (4) the
combo's second swing has no walking clip in the game: its right claw's four are made (`dev/shadow_moves.ts`) and wait for one
(`render/figure.ts`, the line that picks `walkers`); (5) after a slash made walking, if it is still going and no slash follows,
its dropping onto all fours (`start`), not the run at once; (6) the puffs of smoke where the man's pieces tear away, if the game
lays them from the change's own list of them (`render/warlock_fx.ts`): the Living Shadow's change tears the same pieces at the
same moments, from his bones grown into its frame, not the old demon's. THE HEROES' BAKE: `art/warlock_art.ts` now takes in
`art/shadow_art.ts` and what it is made of, so the heroes' bake's mark is new even with the switch off (the same pictures):
the bake is made again with the next version as ever.

CHECKED: `tests/shadow_art.test.ts` (new), 2 of 2: the switch off, the game's demon (its stand at ten, no setting off, stopping
or slashes made walking) and the game's change (48 pictures) as they were; the switch on, every list above as counted there, its
blows where its moves land them, and a frame of its stand, run, a slash at its blow, setting off, a rear-up, the man as the
change begins and it roaring at its end, each painted. tsc clean. `node tools/unit.mjs --only shadow_art,shadow_change,shadow_moves,warlock,warlock_moves,heroes3,cheap_heroes` and the core on
b21e9bd162: 29 files, 362 tests, all passed (the game's Warlock, his heroes' shape and his frames by hash with the switch off).

NEXT, STEP 3's SECOND HALF: a page of the game with the switch on, in the page and its side painter alike (as the Mage's,
`tools/mage_up_page.mjs` on `art/mage-up2`: the side painter's worker is the page's own script and has no switch of its own),
cut from today's `main`; a film and pictures of it IN PLAY on floor 11 beside the Brawler, MP4 (as `tools/scenarios/mage_up_look.mjs`
and `tools/mage_up_film.py` on `art/mage-up2` made hers): the Warlock changing into it, standing, running and stopping, slashing
standing and walking, Damning, the smoke step, struck, burning out; his yes; then the ship list. Its frames are heavy to paint
(about a fifth of a second each here): in play they want the bake, as the Mage's did.

## In play on floor 11, beside the Brawler (a test page with the switch on; SHOWN HIM AS A FILM AND A PICTURE)

The same queue chat, at his word “Work on the next queue item” (13:47 Eastern). Step 3's second half.

A page of the game with LIVING_SHADOW on, in the page and its side painter alike (`tools/shadow_page.mjs`, as the Mage's: the
switch turned as the file is read for that one bundle; the source not touched; no bake beside it: every frame painted in play
by the side painter). On it, the Warlock on floor 11's ground (the Gate Ward, the Crier's Square: the Mage's spot, 40, 57),
by the game's own rules, his controls put in as a player's would be (`tools/scenarios/shadow_look.mjs`): as a man; tapped,
changing into it; standing; running on all fours one way and another and rearing up to stop; tap, tap (its slashes, left claw
then right); tap while moving (its slash made walking); tap and hold (Damning); swipe (the smoke step); its pact let run dry:
burning out, and he gets up. The clock slowed while each frame is taken, so that every frame is painted before it is shot.

- `pictures/living_shadow_in_play.mp4`: 24.9 s at 30 a second, the game's own speed, 1380 x 1074, what each part is written
  over it; a picture every thirtieth of a second of the game's time, cut round him (six screen pixels a game pixel).
- `pictures/living_shadow_in_play_measure.png`: THE MEASURE. The Brawler, the Warlock and the Living Shadow, each on the same
  spot of the Gate Ward's ground, at the game's size (4180 x 1020).

Made with:
```
node tools/shadow_page.mjs dist/shadow_on.html on
MODE=film OUT=shots/shadow/film node tools/playtest.mjs --file dist/shadow_on.html --touch --size 1126x520 --dpr 3 --scenario tools/scenarios/shadow_look.mjs
CLS=brawler MODE=still NAME=brawler OUT=shots/shadow/m node tools/playtest.mjs ... (the same page)
CLS=warlock MODE=still NAME=warlock OUT=shots/shadow/m node tools/playtest.mjs ...
python3 tools/shadow_play_film.py measure shots/shadow/m_brawler.png shots/shadow/m_warlock.png shots/shadow/film_frames/f0200.png <out.png>
python3 tools/shadow_play_film.py shots/shadow/film_frames <out.mp4>
```
The playtest finished clean (no errors); the form as each fifteenth frame was taken: a man to frame 105, the demon from 120
to 600, a man again from 615.

SEEN IN IT, AND TOLD HIM:
- THE GAME LAYS THE CHANGE OVER ITS RULES' TIME (game/warlock.ts WARLOCK_TUNE.change.secs, 2.4 s), as it does the old demon's:
  the change he said yes to (3.5 s with its roar) is played about one and a half times as fast in play. Likewise burning out
  over the rules' 2.0 s. The rules' times are his and the main chat's to change, not this branch's.
- The white arcs on its slashes are the game's own swing marks for any blow; its own cyan streaks are among what the main chat
  lays (the section above).
- After its slash made walking it shows its run at once, as the section above's note (5) says the game does for now.
- The cyan bar over it is the game's own pact bar, at a man's height: up on two legs it is taller, and the bar crosses its
  horns, and in some frames of the change its face. For the main chat: raise it for the Living Shadow.

SHOWN HIM SO (the film and the measure sent; asked by pop-up). **HIS WORDS, 12 Nov, by 14:10 Eastern:** asked whether it is
right in play, **“Yes, hand it to main (Recommended)”**; asked whether the change in play should stay the game's 2.4 s or
take its own 3.5 s, **“Keep the game's 2.4 s (Recommended)”**. SO THE LIVING SHADOW IS HANDED TO THE MAIN CHAT: on the queue's
ship list (`warlock-living-shadow`), this branch at the commit there. The rules' change time stays 2.4 s. What is left of the
queue's item is THE MAN: his eight sides (step 4, above).

HIS IDEA FOR ITS SIDES, 12 Nov, 14:28: **“If he’s symmetrical then we don’t need all 8, we can get away with 6 or whatever
right?  Not for the warlock but for the daemon?”** Told him: five painted and three mirrored (facing you and facing away are each
their own mirror; down-left, left and up-left the mirrors of down-right, right and up-right), about three eighths fewer of its
pictures; it is not quite symmetrical (its left foot forward, its first slash its left claw: they swap in the mirrored three; its
slashes alternate anyway); the light flips on those three, barely seen on its black; the change into it and its burning out show
the Warlock, who is not symmetrical (his demon arm), so they keep all eight; the game mixes no painted and mirrored sides today.
Asked whether to give it five painted and three mirrored for all its own moves, keeping eight for the change and the burning
out, **his pick, by 14:32: “Yes, mirror the three (Recommended)”**. FOR THE MAIN CHAT, when the man has eight: let a figure's
eight sides be some painted and some mirrors (`art/sides.ts`, `render/figure.ts`), and `art/shadow_art.ts` paint five.

## The man: his eight sides, his longer heavy coat, boots to the knee (`src/art/warlock_up.ts`, `src/art/warlock_up_art.ts`; WARLOCK_UP, off)

The queue chat of 12 Nov (14:39 Eastern), at his word **“Work on the queued items”**: step 4, the last of the queue's item.
BRANCH `art/warlock-man8`, cut from this branch at 14cc698 (so it holds the Living Shadow exactly as handed to main, and this on
top). Behind one switch, `WARLOCK_UP` (`src/art/warlock_up.ts`), OFF: off, the game's Warlock is exactly as he is.

WHAT HE ASKED (above, 11 Nov): **“I want the longer cloak as well”**; and of every hero, 6 Nov, **“Paint all 8 (Recommended)”**.
THE RULE OF 7 NOV (only the look, the legs by the length of the bones and the eight true sides change; how he stands, runs and
casts stays the game's) is kept: every move of his is the game's own keys.

FROM THE 7 NOV STILL (`art/warlock-up` 87bc4dd), KEPT: his eight sides truly painted (his own sculpture turned under the
game's camera, `art/warrior_up.ts` WU_SPIN: his demon arm, its pauldron and fire on his left and his book at his right hip from
every side; the three sides that face left laid with his floor point 98 across his canvas); his coat, standing, hung as a heavy
coat (one sheet of his black wool in folds, ragged at the hem, its red lining, piped in red down the front opening, split up the
back; `heavyCoat`); his boots real boots to the knee in the game's own brown hide worn dark, a turned cuff, a heel
(`realBoots`). Running, his coat flies open in panels, the game's own. OUT: its wider stance (WL_FEET, WL_STAND) and its re-posed
run (WL_RUN).

MADE NEW HERE:
- HIS LEGS IN HIS BONES (`WL_UP_BODY`), as the Ranger's and the Mage's: his knee joint raised 0.85 of a unit (four tenths of a game
  pixel), the thigh shorter and the shin longer by as much, the whole leg as long; standing straight his shin 1.3 times his
  thigh (the game's 1.16). His hips,
  feet, hands and head are where the game has them at every thirtieth of a second of every move (a test holds them to a
  millionth of a unit); only where his knees bend moves (1.6 units at most).
- THE OPENING DOWN HIS FRONT AND THE VENT UP HIS BACK before and behind him, each drawn round toward the leg that comes through it
  by a third of the way, 25 degrees at most. The 7 Nov way put them where his ankles were, over its long stance; on the game's own
  stance his feet are side by side, and that put the opening at his left side and the vent at his right.
- THE VENT UP HIS BACK HANGS CLOSED, a seam piped in red from a third of the way down to the hem: on the game's own stance his
  legs are close together, and the 7 Nov vent hung open (21 degrees either side of his back leg) showed as a dark gap down the
  middle of his back between two halves of his coat: from behind it read as a pair of trousers. A leg that comes back through it
  pushes the cloth out (below). (His boots show at the opening down his front, and wherever his coat flies open as he runs.)
- NO LEG THROUGH HIS COAT BETWEEN ITS ROWS: the cloth is laid straight from one row to the next, and a knee or a heel between two
  rows now pushes both out (the 7 Nov way looked only 2.6 either side of a row: getting up off one knee, his raised heel came
  through the vent's edge by nearly a game pixel).
- THE ONE MAN EVERYWHERE HE IS PAINTED: his sculptor (`dev/sculpt_warlock.ts` warlockSculpt) dresses him through
  `WARLOCK_DRESS` while the switch is on, on whatever bones he is drawn on, so THE CHANGE INTO HIS DEMON (`dev/shadow_change.ts`,
  `dev/warlock_change.ts`: the man's build is `warlockBody()`) and ITS BURNING OUT (him on one knee getting up,
  `dev/shadow_fx.ts`) show him brought up too. His boots are made in the game's boots' own place among his materials, so the
  change tears them away when and as it tore his boots (`dev/warlock_change.ts` tearsAt goes by a material's place); his coat's
  cloth is his coat's material, torn away as his coat was.
- EVERY LIST AT 30 A SECOND (`art/warlock_up_art.ts` makeWarlockUpArt, the game's shape, from all eight sides):

| list | brought up | the game's man today |
|---|---|---|
| idle | his stand, 198 pictures at 30 (6.6 s); blazing with his pact full, the same | 66 at 10 |
| walk | his run, gripping, 26 at 60; blazing, the same | the same, two sides |
| attack, heavy | the Hellfire Bolt and the Curse, the game's own at 30, their blows where the game's land | the same, two sides |
| leap, land | the smoke step, the game's own | the same, two sides |
| reel, lurch, fall | struck, struck from behind, his fall, at 30 | the same, two sides |
| ready (his card, from in front) | his arm blazing up, at 30 | the same |
| change (a dungeon) | into the Living Shadow while LIVING_SHADOW is on, from his side, 106 at 30 (`art/shadow_art.ts` shadowChangeClipOf); into the game's demon while it is off, from his side, 106 at 30 | 48 pictures over its 3.5 s, two sides |

  THE COUNT (`npx tsx tools/warlock_up_numbers.ts count`, every place and blazing or not, a list the same in two places once):
  as he is now, 2 sides, 24 lists, 1,006 frames; brought up, 8 sides, 96 lists, 6,136 frames, about 142.5 MB decoded at the game's grain
  (as he is now about 27.9 MB; `count paint` paints a frame in every eight). OF IT, THE CHANGE FROM EIGHT SIDES IS 66.3 MB (848 frames,
  the Living Shadow roaring at the end of it, wings out), his stand and his stand blazing 22.9 MB each, the rest 30 MB. Each frame takes about
  a tenth of a second to paint here: TOO HEAVY TO PAINT IN PLAY, so he comes in with the bake, as the Mage did.

### His legs (knee to floor over hip to knee on the screen, the least of either leg whose shin is seen, every frame at 30 a second)

`npx tsx tools/warlock_up_numbers.ts legs`:

| | front | toward | frontL | sideL | backL | away | back | side |
| his breathing (0 to 1.6 s), the game's bones | 0.92 | 0.82 | 0.94 | 1.09 | 1.29 | 1.43 | 1.26 | 1.10 |
| his whole stand (the spasm and the fold among it), the game's bones | 0.80 | 0.58 | 0.86 | 1.05 | 1.29 | 1.28 | 1.21 | 1.10 |
| his breathing (0 to 1.6 s), his bones now | 1.04 | 0.92 | 1.05 | 1.22 | 1.45 | 1.61 | 1.42 | 1.23 |
| his whole stand (the spasm and the fold among it), his bones now | 0.91 | 0.67 | 0.95 | 1.18 | 1.45 | 1.43 | 1.36 | 1.23 |

REPORTED, NOT MENDED (the rule of 7 Nov): from toward the camera and from in front his shins still read shorter than his thighs
in his stand (0.92 and 1.04 breathing; 0.67 and 0.91 as the pain folds him over): the game's own crouch, his knees bent toward
the camera, each shin seen end on, as the Mage's (0.69) and the Ranger's (0.51). Standing, his coat hides his legs from there
but for the opening down its front. Changing it is a re-pose, his to ask for.

REPORTED, NOT MENDED: in his run, the thigh of his quick foot comes to 56.5 degrees from hanging at the most
(`npx tsx tools/warlock_up_numbers.ts run`): the game's own run on the game's bones comes to 53.8, and his shorter thigh, its
knee raised, comes up a little more. The prance check fails past 50 on both. The run is the game's (the rule of 7 Nov).

### In play on floor 11, beside the Brawler (a test page with WARLOCK_UP and LIVING_SHADOW on; SHOWN HIM AS A FILM AND PICTURES)

A page of the game with both switches on, in the page and its side painter alike (`tools/warlock_up_page.mjs`, as
`tools/shadow_page.mjs`; the source not touched; no bake beside it), and the same page with WARLOCK_UP off for the before. On
it the Warlock on floor 11's ground (the Gate Ward, the Crier's Square, 40, 57), by the game's own rules, his controls put in as a
player's would be (`tools/scenarios/warlock_up_look.mjs`): standing; turned through his eight sides; running down, left and up
and stopping; his bolt down-left and up; his curse; the smoke step; changing into the Living Shadow facing straight down.

- `pictures/warlock_man_now_and_brought_up.mp4`: THE FILM. As he is now beside brought up, the same moments, on floor 11's Crier's Square:
  he stands; turns through his eight sides; runs straight down, left and up and stops; his bolt down-left and up; his curse; the
  smoke step; and, facing straight down, changes into the Living Shadow. 23.9 s at 30 a second, 1440 x 684; the frames are the
  game's own, a picture every thirtieth of a second of the game's time, closer on him while he is a man (a share 0.65 of the
  picture round him), the whole picture for the change.
- `pictures/warlock_man_measure.png`: THE MEASURE. The Brawler, the Warlock now and brought up, each on the same spot of the
  Gate Ward's ground at the game's size, eight screen pixels to a game pixel (1720 x 748).
- `pictures/warlock_man_eight_sides.png`: brought up, standing in the game facing each of the eight ways (2190 x 1050).

Made with:
```
node tools/warlock_up_page.mjs dist/warlock_up_on.html on
node tools/warlock_up_page.mjs dist/warlock_up_off.html off
MODE=film CLIP=170x130 UP=40 OUT=shots/wup/film_up node tools/playtest.mjs --file dist/warlock_up_on.html --touch --size 1126x520 --dpr 3 --scenario tools/scenarios/warlock_up_look.mjs
   (the same with OUT=shots/wup/film_now on dist/warlock_up_off.html)
python3 tools/warlock_man_film.py film shots/wup/film_now_frames shots/wup/film_up_frames <out.mp4>
CLS=brawler|warlock MODE=still NAME=... OUT=shots/wup/m CLIP=70x86 UP=26 node tools/playtest.mjs --file ... --dpr 4 ...   (then: film.py measure)
MODE=sides NAME=on OUT=shots/wup/s CLIP=90x80 UP=26 node tools/playtest.mjs --file dist/warlock_up_on.html ... --dpr 3 ...  (then: film.py sides)
```
Every move was also looked at from every side outside the game, as sheets: `npx tsx tools/warlock_man_pics.ts <dir> <moves> <moments>`
and `python3 tools/warlock_man_film.py sheet <dir> <out.png>`.

SEEN IN IT, AND TOLD HIM:
- THE DEMON STILL HAS ITS TWO SIDES (the Living Shadow as handed to main: from in front and from behind, mirrored for the other two
  ways). So when he changes facing one of his four new ways (straight down, up, left or right), the change into it is from his own
  side, and at its end the demon is shown from the nearest of its four ways: it snaps an eighth of a turn. The same the other way,
  as it burns out and he gets up. It goes when the demon has its sides: his pick of 12 Nov, five painted and three mirrored (the
  section above), the main chat's.

### For the main chat: how he comes in (once he says yes)

1. Bring in this branch (it holds `art/warlock-up2` at 14cc698, the Living Shadow, whole: bring that in first or this in its
   place). Of the game's files: `src/art/warlock_art.ts` (two imports, one line in makeWarlockArt), `src/dev/sculpt_warlock.ts`
   (WARLOCK_DRESS, warlockBody: off, nothing changes), `src/dev/shadow_change.ts` and `src/dev/warlock_change.ts` (the man's build
   is warlockBody()), `src/art/shadow_art.ts` (the change's clip from a turn).
2. `src/art/warlock_up.ts`: `WARLOCK_UP = { on: true }`. `tests/warlock_up.test.ts` test 1 asserts it off: change it then.
3. THE BAKE: the heroes' mark changes (he adds some 5,100 frames, about 115 MB decoded more than today, half of it the change); his frames take about a tenth of a second each to
   paint. Nothing new is asked of the game, the side painter or the bake: a hero from eight sides is one they know. With his
   moves he may want the Brawler's packing (`build/brawler-packed`): 142.5 MB decoded is as much as the Brawler from eight sides
   held before his moves were packed (`docs/mockups/eight_sides/PACKED.md`), and the change, played once each time he changes,
   is the first thing to keep packed. Weigh it there before the switch goes on; he was told so.
4. THE DEMON'S SIDES (his pick, 12 Nov: five painted, three mirrored): until then the snap above.
5. FLOOR 18'S REFLECTION of him (`wire-floor-18-new-reflections`) is made from his painter: with WARLOCK_DRESS on it shows his new
   coat and boots too; from eight sides it follows his painter, as that item says.
6. Play him on the built, baked page: all eight ways, the bolt, the curse, the step, struck, his fall, the change and burning out,
   town and his card. Nothing in the rules changed, so no timing, sound or spell start needs touching.

### The checks of the man

- `tsc --noEmit -p tsconfig.json`: clean.
- `tests/warlock_up.test.ts` (new), 5 of 5: (1) the switch off; only `art/warlock_art.ts` takes the new files in; off, the man as
  the game has him (two sides, his stand at ten, the change's 48), his sculptor dressing nothing; (2) his moves the game's own, at
  every frame of every move (his hips, feet, hands, head where the game's are; only his knees move, 1.6 units at most); (3) his
  lists from eight sides at thirty a second, his spells' blows where the game's land, the change from his side into the Living
  Shadow or the game's demon as LIVING_SHADOW says, his card's making ready, one list where blazing changes nothing; (4) a moment
  of every move from every side crisp, his cyan edge, nothing cut off; his boots in the game's boots' place; (5) no leg through
  his coat where it hangs, every move he stands in, every sixth of a second.
- `node tools/unit.mjs --only warlock_up,cheap_heroes,warlock,warlock_moves,shadow_art,shadow_change,heroes3` and the core on 67f61ff3b4 (art/warlock-man8): 29 files, 350 tests, all passed (the Warlock's frames by hash with the switch off among them: `cheap_heroes`).
- The film's playtest and the stills' finished clean (no errors).

## The checks so far

- `tsc --noEmit -p tsconfig.json`: nothing from this branch. (One line from `tests/relief.test.ts`, line 378, under the
  workspace's own TypeScript 7.0.2, the same before this branch's work as after it: not this branch's.)
- Nothing of the game imports `src/dev/demon_new.ts`, `demon_ideas.ts`, `shadow_moves.ts`, `shadow_fx.ts` or
  `demon_swipe_fx.ts`; no file of the game is changed.
- `npx tsx --test tests/shadow_moves.test.ts`: 17 of 17 (above). No other test was run: none imports these files.

## The Warlock kept in packs, and the bolt's tail (branch `build/warlock-packed`; his words of 12 Nov)

Shown the film of the man brought up and told he would want packing for his phone (about 140 MB of pictures where he was 28),
**HIS WORDS, 12 Nov 2026** (asked by pop-up whether the Warlock brought up was right): **“Why don’t you pack him away?
And fix the hellfire projectile so it’s tail doesn’t only face one way as well”**. Read as, and told him so: this chat packs him
itself, as the Brawler's moves are packed, rather than leave it to the main chat; and the bolt in flight trails its tail behind
it whichever way it flies.

BRANCH `build/warlock-packed`, CUT FROM TODAY'S `main` (d39dcde8, 25.3.13), with:
- `art/warlock-man8` merged (the man brought up, and `art/warlock-up2` whole under it: the Living Shadow). No conflicts.
- `build/brawler-packed` (73c77f9) merged, for its packs of a hero's moves (`render/baked.ts` PACKS: a pack is one move from one
  side on a sheet of its own, kept packed as its file's bytes, opened as it is shown or a moment ahead, the least lately shown let
  go past the budget). Three conflicts, each of `main`'s since that branch was cut: `src/dev/bake_heroes_page.ts` (main's
  `bakeLists` and every hero's card pictures first, `bakedFirst`, kept; the packs' plan laid over them), `src/main.ts` (both
  kept), `src/render/baked.ts` (main's hand-in measures kept beside the packs' own); `packsOf` now reads `bakeLists`. THE
  BRAWLER'S SWITCH IS LEFT OFF HERE, as `main` has it, its three test lines as `main` has them: his yes to the packed Brawler is
  still his to give from his phone (`build/brawler-packed`'s PACKED.md). When he gives it, `main` turns his switch on; nothing of
  his needs merging again.

THE BOLT (`render/warlock_fx.ts` drawBolt): the game drew his fire in flight standing upright, leaning only left or right, so
flying up or down the screen its tail still pointed up. Now it draws the art's own bolt (`dev/warlock_fx.ts` bolt, exported: his
fire laid on its side along the way it flies, as the bolt leaving his claws is drawn in the art's films), its nose at the
projectile, the nearest of 16 ways round the screen, at the game's size. AND NO BALL OF LIGHT AT ITS NOSE: the game drew every
projectile that is not an arrow (nor a wave, a dart, a spear, a great arrow) as a ball of light, the purple of its element, and so
under his bolt too (`render/render.ts`, the projectiles' pass); a purple glow is the enemy's. The hellfire bolt is now left out of
it: his fire alone. (A word set into his bolt tinted that ball; with no ball, his bolt shows no word's colour in flight.)
`pictures/warlock_bolt_now_and_fixed.png` (2090 x 526): thrown each of six ways, now above and fixed below, in the game on floor
11 (`BOLTS=1` with the scenario below, on the page as he is now and on the packed page).

WHAT IS PACKED (`render/baked.ts` warlockPacksOf; `tests/warlock_packs.test.ts`, 4 of 4):
- THE MAN BROUGHT UP (eight sides), where the game is played (never his card): HELD, his run (and blazing); PACKED, from each
  side, his stand (blazing, its own), his bolt, his curse, the smoke step, struck, his fall, the change.
- THE LIVING SHADOW (two sides; the game's own demon is not packed): HELD, its run; PACKED, from each side, its stand, dropping
  down, each of its eight rear-ups, each slash standing and made walking, Damning, its smoke step, struck, its burning out. (A pack
  is one sheet, 2048 square: its dropping down with its rear-ups, tried as one pack, did not go on one.)
- Every list's first frame is held, so a move not open yet shows it for the few hundredths of a second its sheet takes to read.
- ASKED FOR A MOMENT AHEAD (`render/warlock_packs.ts`): his stand from the side he faces and his bolt (a tap); with his pact
  full, the change from his side once he has faced it 0.4 s (its sheet is his biggest, up to 0.4 s to read here); the demon's
  stand and its first slash; while he changes, the change and then the demon's stand; as it burns out, that and then his stand.
  First tried with the change asked for at once while his pact was full, and the demon's other slash and Damning too: as he turned
  in a fight each side's were asked in turn, and a pack asked for in the last 1.5 s is never let go, so 90 MB were open at the most
  where the budget is 32. As it is now, 64.4 MB at the most (below).

HIS BAKE (`tools/warlock_packed_page.mjs`: his group only, the bake's page with both switches on; mark a0c436de425a): 7,368
frames for 13,690 places, 106 sheets, 6.88 MB as files; 104 packs; 15.9 MB always held, 254.9 MB of frames in packs (327.5 MB of
sheets with every pack open).

WEIGHED IN PLAY (Chrome on a cloud machine at a phone's size, 844 x 390 at 3; NOT A PHONE): the test bot as the Warlock, floors 1
and 2, 30 s of play each at six times the game's speed (`tools/scenarios/mem_floors.mjs`, CLS=warlock; PACKS=0 every pack open):

| as it is come into | pictures held, kept packed | every pack open | the page's process, packed | every pack open |
|---|---|---|---|---|
| town | 21.7 MB | 346.0 MB | 659 MB | 974 MB |
| floor 1 | 39.5 | 359.9 | 825 | 1,178 |
| floor 1, played | 131.6 | 428.7 | 633 | 979 |
| floor 2 | 88.1 | 383.4 | 827 | 1,146 |
| floor 2, played | 133.1 | 428.6 | 987 | 1,247 |

(“pictures held”: the page's own pictures, the floors' among them; the same in both but for his.) His packs: open at the most
64.4 MB, 29.1 at the end; opened 99 times and let go 94; EVERY ONE ASKED FOR AHEAD, NONE SHOWN BEFORE IT WAS IN HAND; opening them
3.3 s in all, the browser reading the sheets beside the game, 72 ms of it on the game's own thread, 5.8 ms at worst in one go. A
frame's work while the bot fought, floor 2: 7.1 ms in the middle packed, 7.2 every pack open. (Every pack open is about what he
would hold unpacked: his sheets whole, 327.5 MB.)

THE FILM'S SCENARIO ON THE PACKED PAGE (served, the clock slowed for each frame; `tools/scenarios/warlock_up_look.mjs` now says how
his packs went): standing, his eight sides, running, his bolt and curse, the smoke step, the change into the Living Shadow, all from
his packs: 25 opened, 21 let go, 46.6 MB open at the most; finished clean but for the one file it could not find (another hero's
group: only his is baked).

NOT CHECKED: his phone; a release build with every hero's bake (only his group is baked here: the other heroes are painted in
play on this page); the published page's playtests.

CHECKED ON THIS BRANCH: tsc clean; `node tools/unit.mjs --only warlock_packs,warlock_up,baked_packs,veteran_packs,baked,shadow_art,cheap_heroes,warlock,sides_more,veteran_art,veteran_rules`
and the core on cd88fde7f9: 33 files, all passed (the Brawler's packs' own tests among them, his switch off); the two playtests above
on the packed page, served (the bot's two floors, and the film's scenario), finished clean but for the one file not baked.

**HIS ANSWER, 12 Nov 2026**, sent the bolt's picture (`warlock_bolt_now_and_fixed.png`) and told of the packs, asked by pop-up
whether to hand the Warlock to the main chat now (his eight sides, longer coat, knee boots and longer shins from the film, the
packing, the fixed bolt; with the Living Shadow): **“Yes, hand him to main (Recommended)”**. SO HE IS HANDED TO THE MAIN CHAT: the
queue's ship list, `finish-mage-and-warlock-eight-sides`, this branch at the commit there.

FOR THE MAIN CHAT: bring in `build/warlock-packed` in place of `art/warlock-man8` and `art/warlock-up2` (it holds both, and
`build/brawler-packed` with the Brawler's switch off); then, at his yes, switch WARLOCK_UP and LIVING_SHADOW on and bake. The
budget, `PACKS.budget`, is the Brawler's and his alike: one number.
