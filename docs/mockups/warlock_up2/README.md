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
