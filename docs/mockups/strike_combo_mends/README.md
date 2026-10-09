# Mock-up: Strike's combo, mended (NOT IN THE GAME until the main chat puts it there)

**What it is.** The mends of the five faults that the art chat's review of Strike's combo found
against the art rulebook (`docs/requests/strike_combo_review_answer.md`, brought here from
`art/strike-combo-review`), made in the two swings themselves, behind a switch that is off
(`COMBO_MENDS.on` in `src/art/moves3.ts`). With it off, the game's swings are today's exactly (a
test checks it).

**State of this branch (`art/strike-combo-mends`), 8 Oct 2026:** on `main` at Version 19.0
(`54f6aec`). **HE HAS SAID YES: AT 14:05, TO THE MENDED COMBO AND TO ITS SHORTER STANCE AT THE
BLOW.** It is now the main chat's to bring in.

## His words

- 08:35, to the main chat: "Send the strike combo to the art agent and have them review it to the
  rules". The review went back on `art/strike-combo-review`; it said the art chat would make the
  mends on a branch of its own and send him a moving picture first.
- 14:02 he was sent one moving picture, `strike_combo_mended.gif`: the combo, two taps, today's on
  the left and the mended on the right, at the game's own speed and again at a third of it. With it,
  a pop-up of two questions: which of the two goes into the game, and whether the shorter stance at
  the blow is all right. His answers, 14:05: **"Yes, the mended one (Recommended)"** and **"Yes,
  shorter is fine (Recommended)"**.

## The mends he said yes to

Measured on the bones, and as the game plays the combo (two taps) at 60 steps a second, its own step
included (`tools/combo_mends_check.ts`; `mend` for the mended).

- **A. FEET THAT GRIP THE FLOOR** (Movement 8, "Feet grip the floor. A foot stays where it lands";
  Movement 1, "A blow plants the feet"). Today the game's step (`TUNE.swingStep`, a third of a tile
  in 0.12 s) carries him while the picture keeps both feet down, so they slide: up to 8.7 game px
  seen from in front, 8.6 from behind. Mended: both feet leave the floor while the step carries him
  (the front foot lifting, the back foot pushing off its ball) and land at the blow, frame 4, in
  his stance's places, the front foot flat and the back foot on its ball. The lunge is his hips over
  the front foot (`px` 4; today 10.5 in the strike and 9 in the slash, with the front foot out at
  `lfx` 19.5 and 18.5, now 10.5): **THE SHORTER STANCE HE SAID YES TO.** In the recovery nothing
  moves on the floor but the back heel coming down about the ball. Now the most a foot on the floor
  moves is 0.8 game px, and that only at each swing's first frame, as the step begins; the legs
  reach their feet in every frame.
- **B. NO ARM THROUGH HIS HEAD** (Heroes 6, "Clean bodies"). Today, at the top of the slash, his
  left forearm goes into his head (deepest at frame 2: 0.65, where 1 is the two skins touching), and
  from in front the helm is gone at frames 2 and 3. Mended: the hilt further forward and lower at
  the top, his head laid toward his left shoulder. The nearest an arm now comes is 1.24 (the
  strike's, 1.39; today 1.36).
- **C. HIPS FIRST** (`moves3.ts`'s own rule for a swing: "hips first, then the trunk, then the arms,
  then the blade, each part later and faster than the one before"). Today the slash's blade turns
  48 degrees from frame 2 to 3 with the hips and the chest still, then all three go together.
  Mended, degrees from frame 2 to 3: the hips 20, the chest 0, the blade 23; then the chest 50 and
  the blade 83.
- **D. NOTHING JERKY** (Movement 5). Today the slash's raise starts at its fastest (77, then 26
  degrees a frame), and its way back hitches (frames 8 to 13: 33, 32, 21, 39, 20). Mended: the
  raise 51, 51; the way back 17, 48, 45, 26, 9.
- **E. A BLADE THAT STAYS A BLADE** (Effects 3, "a bright crescent"). Today the streak is drawn on
  every frame the blade moves, and on the way back it bends the blade like a scythe or puts an axe's
  head on it. Mended: the streak is drawn only through the cut, the third to fifth frames of each
  swing; the way up and the way back show a clean blade.

`tools/audit_moves3.ts` on the mended swings: "nothing to look at"; the arms keep further out of
the trunk than today's (deepest 0.86 in the strike and 0.90 in the slash; today 0.79 and 0.77).

## In the code

- `src/art/moves3.ts`, after `SLASH3`: `COMBO_MENDS = { on: false }`; `backFoot()` (where the back
  foot stands from the blow on); `mendFeet()` (A, for both swings); `strikeMended()` and
  `slashMended()` (A; and B, C, D in the slash); `useComboMends(on)`, which puts the mended
  motions into `STRIKE3` and `SLASH3`, or today's back.
- `src/art/heroes3.ts`: `streakShown(move, t)` (E), used by `paintMove3` for the knight's streak.
- `src/main.ts`: `__dbg.comboMends(on)`, the playtest's switch; it paints the heroes again.
- From `art/strike-combo-review`: the review (`docs/requests/strike_combo_review_answer.md`) and
  the scripts that measured it (`tools/review_combo/`).

## How to see it

```
node tools/build_to.mjs dist/mends.html
node tools/playtest.mjs --file dist/mends.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/combo_mends.mjs --out shots/mends/today
MENDS=1 node tools/playtest.mjs --file dist/mends.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/combo_mends.mjs --out shots/mends/mended
python3 tools/combo_mends_film.py shots/mends/today shots/mends/mended previews/strike_combo_mended.gif   (the moving picture he saw)
node node_modules/tsx/dist/cli.mjs tools/combo_mends_check.ts          (today's numbers; add mend for the mended, detail for where)
```

The playtest stands the knight with the great sword in the practice room, facing right across the
screen (`AWAY=1`: away, up it), a skeleton that cannot die in front of him, and taps twice (Strike,
then the slash), a frame every thirtieth of a second of the game's time. Film one at a time.

## FOR THE MAIN CHAT: bringing it in

1. Make the mended swings the game's own: in `src/art/moves3.ts`, `STRIKE3` and `SLASH3` take
   `strikeMended()` and `slashMended()` (or fold `mendFeet` and the slash's keys into `strike()` and
   `slash()`); in `src/art/heroes3.ts`, `streakShown` without the switch. Then drop `COMBO_MENDS`,
   `useComboMends`, `__dbg.comboMends`, and `MENDS` in the scenario.
2. `tests/combo_mends.test.ts`: the first test (the switch) goes; the other four then hold the
   game's own swings (drop their `useComboMends`, and the lines that check today's faults).
3. The feet are timed to the game's step as it is (`TUNE.swingStep` 0.33 of a tile over
   `swingStepTime` 0.12 s; the front foot lands at frame 4, the blow). If those change, run
   `tools/combo_mends_check.ts mend` again: A must stay under a game pixel.
4. Still open from the review, outside this branch: `tools/audit_moves3.ts` has no test of arms
   against the head; the slam's top and the leap put an arm in the head the same way (deepest 0.48);
   `src/dev/preview_skin.ts` titles every still "not in the game", live moves too; and `main`'s
   art rulebook is older than `art/rulebook`'s.

## Tested

`tests/combo_mends.test.ts` (5): the switch is off, and switching it back gives today's swings
exactly; A, as the game plays the combo at 60 steps a second, no foot on the floor moves a whole
game pixel, from in front or behind, and the legs reach (and today's slide is over 5); B, no arm in
his head in either swing (and today's slash has one); C and D, the slash turns hips first, its raise
is even and its way back has no hitch; E, the streak only through frames 3 to 5, and other moves and
today's as before. `tools/audit_moves3.ts`, as above. `tsc --noEmit` clean; the whole unit suite (see
the commit).
