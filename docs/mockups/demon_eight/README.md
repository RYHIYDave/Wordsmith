# THE WARLOCK'S DEMON, THE LIVING SHADOW, FROM ALL EIGHT SIDES

The queue's `draw-the-demon-from-eight-sides` (added by the Godot cloud chat): the Warlock's demon form drawn from all eight
sides, for every move, his look kept the same; pictures first; handed back as a branch on the ship list, for the Godot chat to
bake into `godot/assets/heroes/warlock-demon*` (the demon has two sides there today; the other heroes eight). The Skins chat of
13 Nov, at his word, 22 Nov 2026, 08:57 (Eastern): “Can you take care of the art chat request for the demon?”. Branch
`art/demon-eight-sides`, from `main` 41f47ac1 (25.3.22).

HIS WORD ON IT, 22 Nov 2026, 09:01: **“He can flip since he doesn’t have a weapon or anything in one hand so it should be exactly
8.”** Read as, and told him so: mirroring is fine, so exactly eight sides, five truly turned and the three facing left their
mirrors.

## What it is

The demon in the game is the Living Shadow (`src/art/shadow_art.ts`, LIVING_SHADOW on since 25.3.14), from two sides: from in
front, and from behind (truly turned 90). ITS EIGHT SIDES WERE ALREADY SETTLED WITH HIM, as a film of eight panels each truly
turned (docs/mockups/warlock_up2/README.md, “Its eight sides”: his “Yes, all eight are right (Recommended)”, 12 Nov 2026, by
13:30); they were never put into the game's lists. Now they are, behind a switch that is off: `src/art/sides_more.ts`
EIGHT_MORE.demon.

- **FIVE TRULY TURNED**, before the game's own camera 45 degrees apart (`MORE_TURN`), every move painted from each with nothing
  new to it (its painter and everything its moves leave in the air and on the floor already took a turn): `front` (0), `toward`
  (-45, straight down the screen), `side` (45), `back` (90), `away` (135, straight up the screen).
- **THREE THEIR MIRRORS** (`SHADOW_MIRRORS`): `frontL` is `front` mirrored, `sideL` is `side`, `backL` is `back`. Every picture
  mirrored with its anchor as the game's own flipSprite mirrors one, and its glow; its slashes made walking to its left and to
  its right swap.
- **BUT ITS BURNING OUT, NEVER MIRRORED**: the man getting up at its end holds his demon arm on one side, and the game goes
  straight on from it to his own pictures, truly turned from all eight. So on the three mirrored sides its burning out is
  painted truly turned (`ownTurn`), the man's arm where it is on him.
- **ITS TWO OF BEFORE, THE VERY SAME PICTURES** (from in front, turned 0; from behind, turned 90: the same to the pixel), but for
  one thing: **MORE ROOM UNDER ITS FEET** (`src/dev/demon_new.ts` SHADOW_BELOW, with the switch on). Its picture had room for 22 of
  the game's pixels below its feet; running on all fours straight down the screen the tips of its forepaws' claws reached past
  that and were cut off flat (15 of the run's 42 pictures, by up to 3 pixels; 10 of dropping down's 19, by up to 7), and from in
  front, as the game has it today, a claw's tip twice (dropping down by 2, landing from the smoke step by 4). Now 20 more, at the
  foot only: every pixel it had is where it was, only what was cut is new. Measured over every picture of every list of the
  five truly turned sides and of what the film shows of the three mirrors: nothing of it now on its picture's edge (the nearest,
  13 pixels off, straight down the screen; `tools/shadow_eight_pics.ts`).
- **EVERY LIST THE SAME** on every side as on its two: as long, as fast, its blows at the same moments (its stand, run,
  dropping down, eight rear-ups, both slashes, both made walking each of four ways, Damning, the smoke step, struck hard and
  from behind, burning out).
- THE GAME SHOWS IT as it shows the man from eight sides (`src/render/figure.ts`, eight-sided art, the side for the way it
  faces, never mirrored by the game); its packs from eight sides as from two, its right claw's four walking slashes a pack each
  too (`src/render/baked.ts` warlockPacksOf), and asked for ahead from the man's own side (`src/render/warlock_packs.ts`).

## For the Godot chat, when it bakes it

`warlock-demon` from eight sides, in the game's order (`EIGHT_ORDER`: front, back, toward, frontL, sideL, backL, away, side).
Baked whole, the mirrors included, it is eight sides' worth of pictures. TO SAVE THREE EIGHTHS OF THEM, the three mirrored sides may instead be drawn as their sources flipped at draw time (`SHADOW_MIRRORS`, anchor as
flipSprite: `ax' = w - 1/density - ax`; walking slashes to its left and right swapped), ALL BUT THEIR BURNING OUT
(`clips.change`), which must be baked from those three sides as they are (truly turned).

## The pictures (SHOWN HIM; HIS WORD AT THE FOOT)

- `pictures/demon_eight_sides.mp4` (24.3 s, 18.5 MB, his phone's own size held sideways, 2556 x 1178, sixty film frames a
  second): eight panels at once, each side labelled with the way it faces and, for the three mirrors, “mirror of” the side it
  is; every list of the game's as the game holds it, each at its own speed: its stand; dropping down onto all fours, running and
  rearing up (the floor going by under each the way that one runs); its two slashes; the two made walking ahead (carried as the
  game carries it); Damning; the smoke step; struck hard, then from behind; burning out to the man up again (dressed as the game
  dresses him, brought up). Two film pixels a picture pixel; the far tips of the slashes' widest streaks are cut at a panel's
  edge (eight panels at that size), it itself never. `pictures/demon_eight_sides_sheet.jpg`: a picture every half second.
  Made with `npx tsx tools/shadow_eight_pics.ts <dir> front,toward,side,frontL` and `... back,away,sideL,backL` side by side
  (about ten minutes), then `python3 tools/shadow_eight_film.py <dir> <out.mp4> [sheet]`.

LOOKED AT: the three mirrors beside the same sides truly turned (its stand: the same creature, its pose's handedness
swapped, its light the same); the run straight down the screen close, with the old foot of its picture marked (the claws' tips
past it, now whole); frames of the film itself at full size from every part (its stand, the run, both slashes, the walking
slashes mid-swing, Damning, the smoke step, struck, burning out and the man up again from all eight).

CHECKED: `tests/shadow_eight.test.ts` (new): 1. off, its two sides; on, all eight, in the game's order, each mirror's turn the
side it stands for; 2. every side the same lists as its two of before (as long, as fast, its blows at the same moments); 3. its
two of before the very same pictures on or off, and with the room under its feet every pixel it had where it was, what was cut
now there; 4. the three mirrors their sources mirrored to the pixel, anchor and all, walking to its left and right swapped;
5. its burning out truly turned on the mirrored sides; 6. the bake: all eight sides packed as its two are (its right claw's
walking slashes a pack each), and asked for ahead from the man's side whichever of eight it faces. The game's own tests of the
Shadow, its packs and the sides (`--only`, below). `tsc --noEmit -p tsconfig.json`: clean but for `tests/relief.test.ts`
line 378, which is on `main` as it is (not this branch's).

WAITING FOR HIS WORD.
