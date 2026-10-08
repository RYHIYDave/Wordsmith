# Mock-up: two films of weight (NOT IN THE GAME)

**Made by the art chat, 8 Oct 2026, on the branch `mockup/weight-films` (on top of Version 18.8).**
Two short films for the owner, each comparing the game today with one change: a heavy blow that
holds for a moment as it lands, and a run whose feet stay where they land. The research's
"Fifth, film two tests of weight" (`/home/claude/reports/3D art in 2D isometric games.md`). BOTH
CHANGES ARE IN THE CODE BEHIND SWITCHES THAT ARE OFF; with them off the game is, picture for
picture, what it was (checked: below). Nothing goes in until he has seen the films and said yes.

## His words they answer

- 4 Oct 2026, 12:40 (after seeing the heroes' moving pictures; `docs/NEXT_VERSION.md`, "Slick
  animation"): "I like the art style and the look but I want the animations to be really slick. The
  scarves and feathers waving, robes and cloaks billowing, attacks swinging, bows drawing a firing,
  spells have a cast time even if they are really short"
- 6 Oct 2026, 00:32 (`docs/NEXT_VERSION.md`, "HIS ART DIRECTION, IN HIS WORDS"): "Like the mage fires
  his beam and it blows his cloak back. I want things to have weight. That's very important"
- And of the Strike, on his page of notes: "0 weight". What was done for weight then is in
  `docs/NEXT_VERSION.md`, "ANIMATIONS WITH WEIGHT" (the moves made again, the knock-back of a struck
  monster, the landing of the Leap) and "A heavy blow rocks a hero" (`hero_struck.gif`).
- The art chat's brief says that on 8 Oct at 00:53 he told the art chat to carry on down its list,
  which has these films on it. (Not quoted: the brief does not give his words.)

## What the game does today (read in the code)

- **A blow with the Power word** holds THE WHOLE GAME, rules and all: the frame loop runs the game at
  6 hundredths of its speed while `fx.freeze` lasts (`src/main.ts`, `gdt = fx.freeze > 0 && !bot ?
  dt * 0.06 : dt`), which a Power hit sets to 0.045 of a second and a Power blow over an area to
  0.07 (`src/render/fx.ts`, `hold`, at most once in 0.2 s), and the screen kicks.
- **Every other hit** flashes the struck monster white for 0.12 s (`m.flash`, the rules) and pushes
  its picture back 3 game pixels from the hero, coming back as the flash runs out (`FLINCH`,
  `FLINCH_TIME` in `src/render/render.ts`; the Warden 1 pixel; a skeleton also rattles a pixel each
  way). Nothing holds.
- **Slam** is the one-handed sword's slow attack (`WEAPON_SKILLS.sword` in `src/game/defs.ts`): a
  wind-up of 0.22 s, a follow-through of 0.38. The warrior starts with the great sword (Strike and
  Whirlwind); the knight is drawn with the great sword whatever he holds, so a Slam plays `SLAM3`.
- **A hero's run is played by the clock**: thirty pictures a second (`RUN_FPS3`), a turn of two steps
  every half second (`run` in `src/art/moves3.ts`), however fast the hero goes
  (`src/render/figure.ts`: `set.walk[Math.floor(st.animT * fps) % n]`). The rules move every hero
  4.6 tiles a second (`TUNE.heroSpeed`), more with gear. While a foot is down it goes back under the
  body, in a turn's first 36 hundredths, from `reach` ahead of the hips to `push` behind them: 2.98
  tiles a second for the knight, 3.61 for the ranger, 2.41 for the mage (the project's own rough
  reckoning, `docs/NEXT_VERSION.md` near "none of the new runs has been set against the game's
  speed": "about 3.0" and "about 3.6"). So a foot that is down slides forward over the floor.

## The two films (not in the repository: `previews/` is not kept)

1. **`previews/weight_heavy_blow.gif`** (786 x 416, 6.4 s, 0.9 MB): the warrior's Slam, WITHOUT the
   Power word, landing on a skeleton in the practice room. Left as today; right with the hold of
   the picture. Played as it plays (thirty pictures a second), then four times slower. The still
   `previews/weight_heavy_blow_frames.png`: the same, a picture every 2 sixtieths, round the blow.
2. **`previews/weight_planted_feet.gif`** (690 x 958, 5.5 s, 2.5 MB): each hero running straight down
   the screen and to the right, along the floor's lines, over floor that stands still in the
   picture (the film is cut round a fixed spot of floor while the game's camera follows the hero).
   Left as today; right with the run played by the ground covered. Played as it plays, then five
   times slower; in the slowed part a short white line on the floor marks where each toe came down,
   for as long as it stays down (drawn by the film tool, not by the game). The still
   `previews/weight_planted_feet_frames.png`: the feet of all three, a picture every 2 sixtieths,
   with the marks.

(The art chat's copies are in `/home/claude/wordsmith/previews/`.)

## What is in the code, and behind which switch

| Where | What |
| --- | --- |
| `src/render/weight.ts` (new) | The two switches, both `on: false`: **`HITSTOP`** `{ on, hold: 0.1, shake: 2, catchUp: 0.2, back: 0.12 }` and **`STRIDE`** `{ on }`. The hold's arithmetic (`lagAt`, `shakeAt`, `pushAt`), the hold itself (`PictureHold`: `look`, `heroAge`, `heroStill`, `victim`, `keep`), and `strideFrame`. |
| `src/render/render.ts` | Only when `HITSTOP.on`: before the monsters are drawn the hold is told how the hero and the monsters stand (`this.hold.look`). The hold begins when the hero's slow attack is a `burst` (the Slam), its wind-up has just run out, and a monster has just been struck (its flash has just begun). Then each monster it struck is drawn with the picture it had when the blow landed, white, knocked back its 3 pixels and shaken from side to side; and the hero is drawn by the attack clock less what the picture waits (`heroAge`), his cloth still while held. The renderer passes the hero's place (`x`, `y`) to the figure. |
| `src/render/figure.ts` | `FigureState.x`, `y`. `runFrame`: by the clock as before, or, only when `STRIDE.on` and the art says how much floor a turn of its run covers, by the ground covered since the run began (the nearest picture; a jump of a tile or more in one frame does not count; a new run starts from its first picture). |
| `src/art/actor_types.ts` | `AnimSet.walkGround`: tiles of floor a turn of the walk covers. |
| `src/art/heroes3.ts` | `UNITS_PER_TILE` (32 / GRID: a tile in the figure's own units), `groundPerTurn` (measured on the bones), `walkGround` set on every hero's run. |
| `src/main.ts` | `__dbg.weight = { hitstop: HITSTOP, stride: STRIDE }`, for the films. |
| `tests/weight.test.ts` (new, 9) | Both switches off; with STRIDE off a run is played by the clock exactly as before wherever the hero goes; with HITSTOP off the renderer does not look at the hold (read off its source: every use stands behind the switch); switched on inside the test and put back: the run by the ground covered, each hero's ground per turn, the planted toe staying put (and sliding today), the hold's numbers, a Slam that lands held and one that strikes nothing not held. |
| `tools/scenarios/weight_clock.mjs` (new) | Takes the game's clock and dice in hand from the page's first frame: every frame a sixtieth of the game's time, Math.random the same each time. So a film is the same frame for frame each time it is made, and today's and the change's differ only by the change. |
| `tools/scenarios/film_heavy_blow.mjs`, `film_run_feet.mjs` (new) | The two films' scenarios. |
| `tools/feet_marks.ts`, `tools/measure_slide.ts` (new) | Where the feet are in a film of a run, and the slide measured on it; the slide of each hero's run measured on the bones at any speed and angle. |
| `tools/weight_film.py` (new) | Films side by side for a phone: panes that can stand still on the floor, game speed then slowed, marks, the smaller file (`FUZZ`). |

## How to see it

```
mkdir -p node_modules && for p in esbuild @esbuild typescript tsx playwright playwright-core; do ln -sfn /opt/npm-tools/node_modules/$p node_modules/$p; done
node tools/build_to.mjs dist/weight.html
# film 1: today, and the hold
HOLD=0   node tools/playtest.mjs --file dist/weight.html --scenario tools/scenarios/film_heavy_blow.mjs --out shots/weight/blow_today
HOLD=0.1 node tools/playtest.mjs --file dist/weight.html --scenario tools/scenarios/film_heavy_blow.mjs --out shots/weight/blow_hold
W=96 H=88 UP=0.5 S=4 COLS=2 FROM=0 TO=50 SLOW=4 FUZZ=2 python3 tools/weight_film.py previews/weight_heavy_blow.gif "Slam: today, and with a short hold as it lands" "Today@shots/weight/blow_today@256,132" "With the hold (a tenth of a second)@shots/weight/blow_hold@256,132"
# film 2: each hero, today (STRIDE=0) and by the ground covered (STRIDE=1); then where the feet are
for c in warrior ranger mage; do for s in 0 1; do CLS=$c STRIDE=$s FRAMES=48 node tools/playtest.mjs --file dist/weight.html --scenario tools/scenarios/film_run_feet.mjs --out shots/weight/run_${c}_$s; node node_modules/tsx/dist/cli.mjs tools/feet_marks.ts shots/weight/run_${c}_$s $c; done; done
MARKS=1 W=84 H=68 UP=0.74 S=4 FROM=6 TO=41 SLOW=5 PAUSE=80 FUZZ=2 FOOT="Slowed: the white line marks where each toe came down." python3 tools/weight_film.py previews/weight_planted_feet.gif "Running: today, and with each foot kept where it lands" "Knight, today@shots/weight/run_warrior_0@mid" "Knight, feet kept planted@shots/weight/run_warrior_1@mid" "Ranger, today@shots/weight/run_ranger_0@mid" "Ranger, feet kept planted@shots/weight/run_ranger_1@mid" "Mage, today@shots/weight/run_mage_0@mid" "Mage, feet kept planted@shots/weight/run_mage_1@mid"
# the stills (no film: REAL=0 SLOW=0, a sheet)
W=96 H=88 UP=0.5 S=2 REAL=0 SLOW=0 SHEET=2 SHEET_FROM=16 SHEET_TO=32 python3 tools/weight_film.py previews/weight_heavy_blow_frames.gif "Slam, as the film plays it: today, and with the hold" "Today@shots/weight/blow_today@256,132" "With the hold@shots/weight/blow_hold@256,132"
MARKS=1 OFF=-9,-4 W=40 H=26 UP=0.6 S=4 REAL=0 SLOW=0 SHEET=2 SHEET_FROM=10 SHEET_TO=24 python3 tools/weight_film.py previews/weight_planted_feet_frames.gif "Feet over the floor (white: where the toe came down)" "Knight, today@shots/weight/run_warrior_0@mid" "Knight, kept planted@shots/weight/run_warrior_1@mid" "Ranger, today@shots/weight/run_ranger_0@mid" "Ranger, kept planted@shots/weight/run_ranger_1@mid" "Mage, today@shots/weight/run_mage_0@mid" "Mage, kept planted@shots/weight/run_mage_1@mid"
# the slide on the bones (speed in tiles a second, degrees off the grid)
node node_modules/tsx/dist/cli.mjs tools/measure_slide.ts 4.6 0
node node_modules/tsx/dist/cli.mjs tools/measure_slide.ts 4.6 45
```

In a page of your own, `__dbg.weight.hitstop.on = true` and `__dbg.weight.stride.on = true` switch
them on (and the hold's length is `__dbg.weight.hitstop.hold`).

## The measurements

**How far a planted foot slides today.** Measured two ways that agree.

On the bones, with the game's own figure choosing the pictures (`tools/measure_slide.ts`), for a
hero running at the rules' 4.6 tiles a second along the grid: while a foot is down, its TOE slides
forward over the floor by **3.9 game pixels each step for the knight, 2.4 for the ranger, 5.1 for
the mage** (the heel 3.1, 2.4, 5.0), each time a foot is put down (twice in each turn of two steps);
the hero meanwhile goes 14.9, 13.7 and 16.5 pixels. A knight's foot is about 4 game pixels long, so
his slides about its own length every step; the mage's more than that. (Distances are game pixels
on the screen, along the line he runs on: a tile along the grid is 16 across and 8 down, 17.9 along
it.) Played by the ground covered: the toe goes 0.6, 0.4 and 0.8 pixels over its step and is never
more than 1.8, 1.6 and 1.4 from where it came down (what is left is the fifteen pictures a turn
has: a picture's worth of ground is a tenth of a tile).

On the films themselves (`tools/feet_marks.ts`: the picture the game showed, where it drew him,
the bones of that picture; the practice room's knight and mage run at 4.78 tiles a second, their
boots giving 4 in a hundred, the ranger at 4.6): today the knight's toe slid 5.5 and 4.4 pixels in
the two whole steps filmed, the ranger's 2.7 and 2.5, the mage's 6.8 and 5.4; by the ground covered
the knight's -0.5, 1.0, -0.5, -0.6, the ranger's -0.2, 0.7, 1.3, 0.7, the mage's -0.4, -1.3, -0.4,
-0.9, -1.4, 1.0.

**The run by the ground covered goes faster on its feet.** A turn of the run covers 1.49 tiles for
the knight, 1.81 for the ranger, 1.20 for the mage (`groundPerTurn`), so at 4.6 tiles a second the
knight takes 6.2 steps a second where he takes 4.0 today, the ranger 5.1, the mage 7.6: one and a
half, one and a third, and nearly twice as quick. That is the price of the fix as it stands; the
other half of a fix would be longer strides in the gaits (moves3.ts), which changes how they run.

**Running at 45 degrees to the grid** (one key: straight across or up the screen, while the figure
faces the nearest of the grid's four ways), a foot that is down slides sideways too: today 8.1, 6.5
and 8.9 pixels a step; by the ground covered 3.8, 4.2 and 2.9. Only more facings would take the
rest away (the research's "turning question").

**The hold.** 0.1 of a second, six sixtieths, of the game's time. Tried, and filmed beside today:
0.06 (in a film at thirty pictures a second, the moment of the blow stands for two pictures where it
stands for one today: hardly to be seen, and about what a Power blow already gets), 0.10 (three
pictures; the hero makes the time up over the next 0.2 s at one and a half times the speed, which
does not show) and 0.15 (four or five pictures; he has to make it up one and three quarters times
as fast, and his sword visibly whips back up). The struck one is shaken 2 pixels each way, thirty
times a second, down to 1 by the end. For comparison, the only figures the research found are a
fighting game's 8, 12 and 16 sixtieths for light, medium and heavy hits, for duels.

## What was looked at

- Every film, frame by frame: contact sheets of each, crops enlarged (the blow from 0.1 s before to
  the end of the attack; the knight's feet against the floor).
- THE THREE LENGTHS OF HOLD side by side with today, every picture the film shows; the catch-up
  after the hold (0.3 s after the blow, the held hero is in today's pose again: the blow lands 0.23
  s into the attack, which is over at 0.6).
- The feet: the planted foot tracked on the film's own pixels (the figure is what is not the bare
  floor; the floor is the median of the film), then the white marks from the bones, checked to sit
  under the toes in the pictures.
- WITH THE SWITCHES OFF, NOTHING CHANGES: the Slam film (60 pictures) and the mage's run (48) made
  with this branch's build and with a build of `origin/main` from before any of it
  (`dist/weight_base.html`), the clock and the dice taken in hand: identical, pixel for pixel, every
  picture.
- Checks, with both switches off as they are in the game: `tsc --noEmit` clean; the whole unit
  suite, 622 of 622 (Version 18.8's 613 and the 9 of `tests/weight.test.ts`).

## What the main chat would need to do to build it for real

Nothing of this goes in before his yes to its film. Then, for each:

**The hold (`HITSTOP`).**
1. Say which blows hold. The mock-up holds the Slam only (an attack of kind `burst`, on hitting
   something). The Leap's landing is the other heavy blow the game marks (`burst` style `land`) and
   would want the same; a quick Strike perhaps a shorter one, or none; nothing for arrows, spells
   that fly, or a Whirlwind's many cuts (the research: shorter for hits that come many to a second).
2. A Power blow then gets both: the game's own slowing of everything, and this. The hold is counted
   in the game's time, so it stretches inside the slowing (about 0.07 s of the screen's time and
   then the 0.1). Keep both, or drop one for Power.
3. A monster the blow kills is not held: its fall begins at once. Holding its first picture of the
   fall for the same moment would match.
4. The hero's place is not held, only his picture: if the player walks during the follow-through,
   the held figure slides with him (as the follow-through's picture does today).
5. Switch it on (the first test of `tests/weight.test.ts` then says so, and must be changed), and
   the whole of section 8 of the design notes before a release.

**The run by the ground covered (`STRIDE`).**
1. Show him the cadence it gives at the game's speed (the films' first pass): the mage at 7.6 steps
   a second. If it is too busy, longer strides in `KNIGHT_GAIT`, `RANGER_GAIT`, `MAGE_GAIT` (moves3.ts,
   `reach` and `push`) bring it down, and change how the runs look: pictures first. (The mage's and
   the warrior's look are, in the handoff's words, right as they are.)
2. Pushing against a wall, a hero who does not move stops mid-stride with STRIDE on (no ground is
   covered); today the legs run on the spot. Decide: the standing picture, or the clock, when the
   hero is not getting anywhere.
3. It applies to the town runs too (`walkGround` is set on every hero figure).
4. The monsters' walks are not touched (their own pictures, by the clock).
5. Switch it on (the first test changes), and the release procedure.

**Both:** `tools/scenarios/weight_clock.mjs` is worth keeping for any film that compares two
versions: it makes them differ only by the change.

## Sent to the owner (8 Oct 2026, 02:55, by the art chat)

previews/weight_heavy_blow.gif and previews/weight_planted_feet.gif (in the art chat's main clone), with these words: "4 of 4: weight. First film: the Slam as today, and with a tenth of a second's freeze as it lands. Second: each hero running, as today (the feet slide) and with each foot kept where it lands, which makes their legs move quicker. Want both in?" **HIS ANSWER: NOT YET IN.**  Before these went, at 00:53 on 8 Oct he wrote "If I’m not around to test phone speed continue on.  Keep going down the list", read as: leave the phone test until he is around and carry on down the art chat's list (decorations, the skeleton on the heroes' bones, true left-facing heroes, the two films of weight). He was told so at 00:54. Nothing of this is in the game; the main chat builds whatever he says yes to.
