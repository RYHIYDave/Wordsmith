# THE TINKERER AND THE BRAWLER FROM ALL EIGHT SIDES (NOT IN THE GAME UNTIL THE MAIN CHAT PUTS THEM THERE)

Branch `art/tinkerer-brawler-eight`, from `main` at 9d3501b (25.3.3). The Tinkerer chat, 11 Nov 2026, a new chat of his. The
queue's `draw-tinkerer-and-brawler-eight-sides` (the art chat's item of 9 Nov). Everything is behind one switch,
`EIGHT_MORE` (`src/art/sides_more.ts`: `tinkerer` and `brawler`, each its own), OFF: with it off the game is exactly as it is.

**HIS YES IS NOT YET GIVEN.** He has the two pictures and the two films (below), sent 11 Nov by 16:35 Eastern. What he says
goes at the foot of this file.

## His words

- **11 Nov 2026, 15:05, to this chat:**
  “Work on this task from the Wordsmith Queue: “Draw the Tinkerer and the Brawler's eight true sides” (queue item draw-tinkerer-and-brawler-eight-sides).”
  The item's note said to ask him first whether this is still wanted; his naming it is read as that it is.
- 4 Nov 2026, 19:22: “Also, we talked a long time ago about 8 drawings per class.  I think I still want that.”
- 6 Nov 2026, of the first heroes: “Are you actually painting 8 drawings or flipping some?”; his pick: “Paint all 8
  (Recommended)”.
- 28 Oct 2026, of the new classes from behind:
  “It seems like every time we get drawings from behind the arms switch sides.  I don't understand why that happens”;
  his pick: “Draw them true (Recommended)”.
- 7 Nov 2026, the rule since the Ranger: only the look, the legs and the eight true sides change; how a hero stands, runs and
  holds the weapon stays the game's.
- 9 Nov 2026:
  “I don’t want to keep redoing everything so I want to find a good level of quality and have the little things be better instead of just improved paintings”;
  and the Gate Ward and the Brawler made his measure for new art.

## What this is: THE SIX MISSING SIDES, AND NOTHING REPAINTED

Both heroes are sculpted already, at the level he measures by (the Brawler IS the measure: he is the Veteran, his look of
2 Nov, `game/veteran.ts`). The game has each from two sides: from in front (facing down the screen and to the right) and truly
from behind (up and to the right). Facing left it MIRRORS those two; straight down, up, left and right of the screen it has
no picture at all and shows the nearest of the four.

The six missing sides are THE SAME FIGURE, IN THE SAME POSE, AT THE SAME MOMENT OF THE SAME MOVE, TRULY TURNED before the
game's camera, 45 degrees apart: the eight sides the Warrior, the Ranger and the Mage are painted from (`art/warrior_up.ts`
WuSide, the same turns: a test holds them to it). No mirror anywhere: her wrench is on her right shoulder and his blind eye is
his left whichever way they face.

- Nothing is sculpted anew, nothing re-posed, nothing re-timed. Every move is the art chat's own, each shown to him then.
- **THE TWO SIDES THE GAME HAS ARE THE VERY SAME PICTURES, TO THE PIXEL.** Every frame of both heroes' two sides, in a dungeon
  and on their cards, the Brawler's action lines with them (160 lists, 6,668 frames), hashed on `main` at 9d3501b and on this
  branch with the switch off and with it on: the same (`npx tsx tools/sides_more_same.ts`, run on both). The Brawler's 5,386
  frames are now pinned (`tests/sides_more.hashes.json`; the Tinkerer's were already: `tests/cheap_heroes.hashes.json`).
- Her Golem and her Contraption keep their two views. They are not heroes and were not asked for.
- A class card keeps its two sides: a card shows a hero from in front.

## The one thing mended: A CONE OF FORCE SEEN EXACTLY SIDE-ON

The Brawler's straight blows (his jab, his cross, his flying knee) throw a cone of force with a bright ring at its front. Thrown
straight to the left or right of the screen, sides the game never drew, that ring lies exactly edge-on to the game's eye: a
hard bar with a strip of noise behind it, where from every other side it is the ring he knows. So ON THOSE NEW SIDES ONLY the
ring is leaned up to 30 degrees toward the blow's line, the side nearer the eye trailing, and shows as a narrow ring
(`art/veteran_fx_art.ts` coneLean; `dev/veteran_fx.ts` shockCone's `lean`, 0 as it always was). Never from in front or from
behind: those are the pictures he has. His uppercut's cone, which goes up, shows its ring from every side and is left alone.

## What the game does with the switch on

- `art/tinkerer_art.ts` makeTinkererArt and `art/veteran_art.ts` makeVeteranArt give eight sets where they gave two, in the
  game's own shape (`art/sides.ts`: the two it has always had first, the six after). The game already shows a hero painted
  from eight the side for the way he faces, never mirrored (`render/figure.ts`, wired for the Warrior and the Ranger); so do
  the side painter's worker and the bake (`heroSides`). No file of theirs is touched.
- **THE BRAWLER'S MOVES GO EIGHT WAYS.** His rules turn him to the way his picture faces as each move begins, and carry him as
  it is drawn (`game/veteran.ts` vetFacing: the nearest of his FOUR ways; of 25.0, his words:
  “the auto aim is really bad, I spend most of the time attacking the wrong direction”). With eight sides it is the nearest of EIGHT: his picture is never more than
  22.5 degrees off what he aimed at (it was 45), and his dodging jump goes eight ways. Three small functions read the switch
  (vetFacing, vetLeft, vetBlowLeft: his left is his left now, no picture of his a mirror), and `render/veteran_fx.ts` vetView
  lays his frame, his action lines and his after-images by the side, unflipped. How hard he hits, how far he reaches and how
  far he is carried are as they were (a test throws the same jab both ways). THIS IS A CHANGE TO HOW HE PLAYS, small and for
  the better: the main chat's to weigh and to play.
- The Tinkerer's rules need nothing: her vial, her jump and her whistle go where they are aimed, as ever.

Game files touched, all read only behind the switch: `src/game/veteran.ts` (3 functions), `src/render/veteran_fx.ts` (vetView,
and which set a frame is read from), `src/art/tinkerer_art.ts`, `src/art/veteran_art.ts`, `src/art/veteran_fx_art.ts`,
`src/dev/veteran_fx.ts` (shockCone's `lean`). New: `src/art/sides_more.ts`.

## REPORTED, NOT MENDED (the rule of 7 Nov): how the Tinkerer stands

Standing, she holds her head turned to her right and her body a little with it (the art chat's stance: her face turned to the
eye from in front, his “Polish faces up close” of 24 Oct: 24 degrees of her head, 16 of her body). Truly turned, that goes
with her: facing down and to the left she looks to the left; facing left you see the back of her head and her pack; facing
right you see her face. The mirrored pictures the game shows today turn her face to the eye on both hands. It is the game's
own stance seen truly; squaring it is a re-pose, and would change the two sides he has. ASKED OF HIM WITH THE PICTURES. Her
run, her throw, her jump and her whistle face where they go.

## THE COUNT, and what it costs (`npx tsx tools/sides_more_measure.ts <hero>`; every frame painted here)

| | lists | frames | memory decoded, at the game's grain | packed as picture files |
|---|---|---|---|---|
| the Tinkerer, two sides (today) | 24 | 722 | 6.6 MB | 0.26 MB (the bake's own figure, 6 Nov) |
| the Tinkerer, eight sides | 96 | 2,888 | 26.3 MB | about 1.0 MB |
| the Brawler, two sides (today) | 124 | 5,386 | 36.3 MB | 1.35 MB (the bake's own figure) |
| the Brawler, eight sides | 496 | 21,544 | 144.1 MB | about 5.3 MB |

(Packed, eight sides: this tool's deflate of each frame, 2.58 and 9.03 MB, scaled by what the bake's palette sheets made of
the two sides: an estimate; the bake will say.) A frame of hers takes about 56 ms to paint here, the Brawler's eight sides
816 s in all on this two-core machine: FAR TOO HEAVY TO PAINT IN PLAY, as they already are; they come in with the bake.

**THE BRAWLER'S MEMORY IS THE THING TO WEIGH.** Every punch, kick and jump of his, its half-frames and its action lines in
three layers, is painted from each side, and the bake loads a hero's group whole (`render/baked.ts`): about 144 MB of pictures
held while he is played, against 36 MB today (the Mage from eight sides is 68 MB). More than half of it is his action lines:
from in front, 9.3 MB of his 17.3 are their three layers, 8.0 his own frames (his moves 5.1, his fall and being struck 1.3,
his stance and run 0.9, the half-frames of his after-images 0.7). His phone froze for memory this month (25.3.2's fix). For
the main chat: measure it on a phone before his switch goes on (`tools/scenarios/mem_floors.mjs`), or load the bake a side at
a time, the sides nearest the way he faces first, and let go of those not shown for a while. The Tinkerer's 26 MB is less
than any hero brought up so far.

NO FRAME IS CUT OFF: not one of the 24,432 frames of the eight sides of either touches the edge of the canvas it is painted
on, his action lines' canvas too (the same tool, "at an edge": 0 on every side), so no canvas or anchor needed changing.

## The pictures (`docs/mockups/eight_sides/pictures/`), all IN THE GAME, on floor 11's Gate Ward

Each wider than tall, six screen pixels to a game pixel (his word of a tall sheet, 9 Nov; no GIFs: films are MP4).

- `tinkerer_eight_sides.png`, `brawler_eight_sides.png`: standing, facing each of the eight ways; the two the game has
  today marked, the six marked NEW (1704 x 1092).
- `tinkerer_now_and_eight_sides.mp4` (19.5 s), `brawler_now_and_eight_sides.mp4` (21.1 s): as the game has them now beside
  from all eight sides, the same presses at the same moments: standing, turned through the eight ways, run right, down, left
  and up, then their moves thrown the ways the game mirrored or never drew (his jab, cross and hook straight down the screen,
  a kick straight to the right, a punch down-left and one straight up, his jump to the left; her vial tossed down, right and
  down-left, her blast jump straight up, her Golem whistled on to the left). 1572 x 740, 30 a second, the frames the game's
  own, a picture every thirtieth of a second of the game's time. On the left of the Brawler's film, aimed straight down the
  screen, his jab goes down-right and his cross down-left: the four ways as they are today.

Made with:

```
node tools/sides_more_page.mjs dist/eight_on.html on      # a page of the game with EIGHT_MORE on, in the page and its worker alike
node tools/sides_more_page.mjs dist/eight_off.html off
export AT=40,57 WAIT=14000
MODE=sides CLS=tinkerer CLIP=70x78 UP=25 OUT=shots/sides_more/tn node tools/playtest.mjs --file dist/eight_on.html --touch --size 1126x520 --dpr 3 --scenario tools/scenarios/sides_more_look.mjs
   (the same with CLS=brawler OUT=shots/sides_more/bn)
python3 tools/eight_sides_sheet.py game_sides shots/sides_more/tn docs/mockups/eight_sides/pictures/tinkerer_eight_sides.png "THE TINKERER FROM ALL EIGHT SIDES: EACH TRULY PAINTED, NONE FLIPPED"
MODE=film CLS=tinkerer CLIP=130x104 UP=28 OUT=shots/sides_more/film_t_on node tools/playtest.mjs --file dist/eight_on.html --touch --size 1126x520 --dpr 3 --scenario tools/scenarios/sides_more_look.mjs
   (the same on dist/eight_off.html, OUT=shots/sides_more/film_t_off; and CLS=brawler, film_b_on and film_b_off)
python3 tools/eight_sides_sheet.py film shots/sides_more/film_t_off_frames shots/sides_more/film_t_on_frames docs/mockups/eight_sides/pictures/tinkerer_now_and_eight_sides.mp4 tinkerer 585
python3 tools/eight_sides_sheet.py film shots/sides_more/film_b_off_frames shots/sides_more/film_b_on_frames docs/mockups/eight_sides/pictures/brawler_now_and_eight_sides.mp4 brawler
```

Looked over, not for him (raw, outside the game): every move of each from every side, the Brawler's with his action lines laid
as the game lays them: `npx tsx tools/eight_sides_moves.ts brawler|tinkerer <dir>`, `python3 tools/eight_sides_sheet.py grid`.
Nothing found on a new side but the cone above. (Her bare forearm in her landing from behind is her shirt's sleeves, rolled to
the elbow: the art chat's.)

## Checked

- `tsc --noEmit`: clean but `tests/relief.test.ts(378,16)`, main's own.
- THE ART CHAT'S OWN PICTURE CHECKS, ON EVERY FRAME OF EVERY MOVE FROM EACH OF THE SIX NEW SIDES
  (`npx tsx tools/sides_more_checks.ts brawler|tinkerer`; `tests/veteran.test.ts` and `tests/tinkerer_moves.test.ts` run them
  from in front and from behind): crisp, the friend's edge, no pixel alone, nothing pink, nothing cut off, and for the Brawler
  nothing of him through what he wears. The Brawler, 3,990 pictures: nothing found. The Tinkerer, 2,916: nothing found. (The
  checks of their solids, bodies clean, nothing in the floor, every joint as a body bends, are of the figure and not of a
  side: those tests hold them for any.)
- `tests/sides_more.test.ts` (9): the sides, turns and ways the Warrior's own; off, two sides and his four ways; on, each
  from eight, the two the same pictures, the six truly turned (a frame of each side is the art's figure turned for it; no two
  sides the same picture; down-left not down-right mirrored); the Brawler's moves the nearest of eight ways, his left his
  left, his lines laid where the art lays them, on every side; eight sides in a dungeon and in town, two on a card; NOTHING
  OF THE BRAWLER REPAINTED (the pinned frames, switch off and on; `SIDES_MORE=all` every frame); the cone; a jab thrown in a
  fight straight down the screen (lands as hard, carried as far, straight along it).
- `tests/veteran.test.ts` FAILED ON THE FIRST RUN AND IS MENDED: it holds that the Brawler's pictures bring in nothing of the
  old Brawler, by any file they import (his “I don’t want anything reused from the original brawler”), and the sides' type
  was first taken from the Warrior's file, which reaches the old sculpts. The sides are named in `art/sides_more.ts` itself
  now, which imports nothing.
- The unit run on the commit: the foot of this file.
- In the game (the pictures and films above): each hero shown from the side he faces, standing, running and in every move
  filmed; the Brawler's blows and their lines going out the eight ways; both pages finished clean.
- NOT CHECKED: a fight against enemies in the browser with the switch on; the bake itself with eight sides of these two; a
  phone.

## For the main chat, once he has said yes

1. Bring the branch in. Set `EIGHT_MORE.tinkerer` and `EIGHT_MORE.brawler` true (each its own: the Tinkerer can go first).
   `tests/sides_more.test.ts` test 2 asserts them off: change it then.
2. BAKE (`tools/bake_heroes.mjs`: the heroes' mark changes, with the switch off too, since their art files changed; the bake
   already takes eight sides). The Brawler adds about 16,000 frames and the Tinkerer about 2,200.
3. Weigh the Brawler's memory (above) before his switch goes on.
4. Play him: his blows the eight ways against enemies, his dodge, props broken by a blow thrown straight left or right.
   `tests/veteran_art.test.ts` and `tests/veteran_rules.test.ts` are written for his four ways and pass with the switch off;
   with it on, the checks of his four ways (vetView's `left` and `away`) are the ones to put right.
5. Floor 18's reflections of these two (`make-floor-18-reflections`) are made from two sides, like the rest.

## His answers

(none yet)
