# THE WARLOCK BROUGHT UP, AND HIS DEMON REDONE (IN HAND; NOTHING HERE IS IN THE GAME)

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
and the end of its tail. FROM BEHIND it has no face, so his fire shows down its backbone: an ember across each knuckle of it,
laid on its skin (found by going out from the backbone until nothing of the body is left). No wings.

Pictures: `living_shadow.png` (up on two legs and running on all fours, each from in front and from behind, four times as
big, 2856 x 1170), `living_shadow_at_game_size.png` (beside the Brawler, the Warlock and his demon today, 2300 x 900). Made
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

TO THINK ON (his own tick of 11 Nov, “His body is a dark lump”): this one is dark on purpose, and is known by its outline (the
friend's cyan edge), its horns and what burns. To be looked at on the game's own floors beside the Brawler before it is
called done: if its body is lost on a dark floor, the answer is more of his light on it (its embers, an edge of light on its
shoulders), not a lighter hide.

STILL TO DO, in this order: his yes to the look; its stand up on two legs and its wide claw slashes (new moves), dropping to
all fours to run (the game's run) and rearing up to stop; what else stands up (Damning, the smoke step's ends, how the change
and the burning out end), asked as each is made; all eight sides; the change into it; behind a switch that is off, with a
film and pictures in the game on floor 11 beside the Brawler. Then THE MAN (above).

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

- `tsc --noEmit -p tsconfig.json`: nothing from this branch.
- Nothing of the game imports `src/dev/demon_new.ts`; no file of the game is changed.
