# Floor 18, the Glass Gallery: the queen's guard, THE MIRROR DUELLISTS (mock-up; branch `mockup/queens-guard`)

From `origin/mockup/swan-gardens` (55945b3). Nothing here is in the game until the main chat puts it there, on his yes.
Nothing of the game imports any of it (its test proves it); it is behind `QGUARD_ON`, off.

## The brief

The floor's plan, his yes: “Enemies: ladies-in-waiting, the queen's guard, and your own reflections”.

HIS PICK, 30 Oct (asked how the queen's guard should change so it is nothing like the king's knights): “Mirror duellists
(Recommended)”, offered as: "Look: tall and thin, elegant; mirrored plate like liquid silver, a faceless polished helm (you
see yourself in it), violet cape. No shield, no halberd: a long glass blade in each hand. Move: they don't charge. They step
into a mirror and step out of another beside you (the Queen's trick, smaller). Attacks: a fast double slash with the glass
blades; a thrown fan of glass shards (ranged). Death: they shatter like a mirror. Silhouette: the tallest, thinnest guard of
Act 2."

This REPLACES THE FIRST DESIGN (the halberdiers with round mirror shields and crowns of glass spikes, who marched and then
charged). The history of that design stays as it was: his pick for how they moved, “Measured, then a sudden charge
(Recommended)”, and his word on its sheet and film, asked “The Queen's guard (queens_guard_sheet.png and the film): are these
right?”: “Yes, that's them (Recommended)” (commit 64b8f03). From the Grimms' "Snow White" (1812): the queen's own guard,
nothing more of the book.

Built to his rules from the first pass: Movement 9 (“Like the wind up and wind down are big but the actual punch is
lightning quick”; for the enemies, “Start from now on, but every enemy is going to need that change eventually.  And bigger
AOE to compensate for the extra time the player gets to evade”); his rule 9, a sculpted body with a real outline.

## The pictures (`pictures/`)

- `queens_guard_sheet.png`: on guard, from in front and from behind, beside the knight, three times as big; four of them at
  the game's size beside the knight (on guard, gliding, drawn back to slash, crossed for the fan).
- `queens_guard_moves.mp4` (31 s): every move at the scale of a boss arena (an ellipse 17 by 20 tiles) with the knight for
  size, and close up from in front and from behind; the mirror step, the double slash and the shard fan again at half speed.

The floor in them is a stand-in (dark polished stone in tiles), not floor 18's own.

## Their look (src/art/queens_guard.ts)

THE TALLEST, THINNEST GUARD OF ACT 2: `QG_BODY` 72 tall, the helm's top at 74.9 (the knight's at 59.7, his head 9.8 tall: a
head and a half over him; floor 16's palace guard's at 67.9); narrow in the shoulder (8.8 to the palace guard's 9.7), the
chest and the waist, long in the leg and the arm, the limbs slim. MIRRORED PLATE like liquid silver: the round plates (the
breastplate, small pauldrons, couters, poleyns, pointed sabatons, the helm) show the gallery by the way they reflect from
where the eye stands (`MIRROR`: the dark floor, the walls, the bright line of the far windows, the vault, the glasshouse's
light), the rest polished silver with lavender lights (`SILVER`); long narrow tassets. THE FACELESS HELM: a smooth egg of
mirror with a faint sheen across it, the Hush's dull pink deep behind its face (two smudges where eyes would be), the Hush
seeping out under its rim. THE VIOLET CAPE (`VIOLET`) from the shoulders to the ankles, clasped at the pauldrons. A LONG GLASS
BLADE IN EACH HAND (`QG_BLADE`: 46 long, 1.17 tiles), lavender and cold blue glass (`GLASS`, hue 230 to 250), edges ground
bright, on silver hilts. Nothing cyan anywhere. No shield, no halberd.

## Their moves (src/art/queens_guard_moves.ts) and their numbers

Frames at 30 a second but the stand (10) and the glide (20). Tiles are the floor's (`TILE3`, 39.19 of their lengths).

- ON GUARD (`stand`, 32 frames at 10, 3.2 s): the duellist's guard, the blades crossed low before them, points near the
  floor; breathing, the weight shifting, the helm turning slowly.
- THE GLIDE (`walk`): `QG_GLIDE` 1.2 tiles a second (the knight walks 2.5), a loop of 20 frames at 20 (1 s): long level steps,
  each foot set down toe first, hardly a bob; the blades kept crossed low. They don't charge.
- THE MIRROR STEP, two moves of 0.6 s each (the game moves them between): INTO THE GLASS (`more.stepIn`): a mirror-ripple
  opens out of the air at their left (`QG_RIPPLE`: 40 across, 96 tall, 0 to 0.2 s); they gather; THE STRIKE frames 10 to 12
  (0.333 to 0.4 s): gone into it, smeared (streaks from every point of them into the glass); it ripples hard and closes
  (0.42 to 0.6 s), throwing off glints. OUT OF THE GLASS (`more.stepOut`): a ripple opens beside where they will stand (0 to
  0.18 s), something stirs in it; THE STRIKE frames 8 to 10 (0.267 to 0.333 s): out of it in a crouch, smeared; it closes
  behind them (0.36 to 0.56 s) and they rise on guard.
- THE DOUBLE SLASH (`attack`, `QG_SLASH`, 1.7 s): both blades drawn back high over the shoulders, a step in; HELD shaking 0.48
  to 0.9 s, the glass glinting pink (the warning); hips first; THE FIRST SLASH frames 27 to 29 (0.9 to 0.967 s, landing on
  the second), the right blade down across from high right to low left; THE SECOND at once, frames 30 to 32 (1.0 to 1.067 s),
  the left blade from high left to low right; each smeared; an X of glass light hangs in the air; held crossed to 1.36 s,
  back on guard. WHAT IT LEAVES (`xPainted`, src/art/queens_guard_fx.ts, 1 s): an X of glass light over the floor from 0.4 to
  2 tiles before them, 1.8 across, its first stroke whole as the first slash lands, its second run out with the second.
- THE SHARD FAN (`more.fan`, `QG_FAN`, 1.75 s): the blades crossed high before the helm, five shards of glass gathering at the
  cross; HELD shaking 0.36 to 0.8 s, glinting pink; hips first; THE STRIKE frames 24 to 26 (0.8 to 0.867 s): the blades flung
  apart and the shards thrown, smeared; held wide, back on guard. WHAT IT LEAVES (`fanPainted`, 0.74 s): FIVE SHARDS in a fan
  SIXTY DEGREES wide (`QG_FAN_WAYS`), each flying from 0.9 tiles out to EIGHT TILES (`QG_FAN.range`) at 16 tiles a second,
  a streak behind each and its shadow under it; each bursts into glints at the end.
- STRUCK (`reel`, 0.4 s): jolted back, the helm snapped back, the blades flung out, the Hush coughed out.
- THEIR DEATH (`dying`, `QG_DIES`, 2.8 s): jolted rigid; CRACKS RACE over every plate of them (0.06 to 0.66 s); the head goes
  back and the Hush leaves them in one grey breath (0.42 to 1.36 s), the pink going out behind the helm; the cracks blaze
  white (1.3 to 1.5 s); at 1.5 s THEY SHATTER into mirror shards (64) that fall, lie glinting on the floor, and fade one by
  one (2.2 to 2.75 s). Nothing gory; nothing left.

## Bringing it in (the main chat's)

`makeQGuardArt3()` gives `{ front, back }` as the game holds a monster; the moves: `stand`, `walk` (the glide), `attack` (the
double slash), `reel`, `dying`, and `more.stepIn`, `more.stepOut`, `more.fan`. The game's part:

- THE MIRROR STEP: play `stepIn` where they stand; then put them where they come out (beside the hero) and play `stepOut`;
  then the stand or a blow. Between the two they are not there (`awayAt`); the ripple is painted in their own frames.
- THE DOUBLE SLASH: the first blow lands on `QG_SLASH.hit`, the second on `QG_SLASH.second[1]`; its area the X from
  `QG_SLASH.from` to `QG_SLASH.reach` tiles before them, `QG_SLASH.wide` across; draw `xPainted(t, view)` from the first hit at
  their place, turned their way.
- THE SHARD FAN: thrown on `QG_FAN.hit`: five projectiles along `QG_FAN_WAYS`, from `QG_FAN.from` tiles out at
  `QG_FAN.speed` tiles a second to `QG_FAN.range` tiles (`fanShardAt`); `fanPainted(t, view)` draws them.
- THE DEATH: nothing falls as a piece; the shards are in their own frames.

## The checks

- `tests/queens_guard.test.ts` (11): nothing of the game imports them, the switch off; EVERY MOVE THROUGH EVERY BOSS CHECK
  (src/art/boss_checks.ts), every frame from in front and from behind, and every handover (the stand into the glass, out of
  it, back on guard; into the glide and out of it at every step; each blow and back); his lightning strikes (two frames each,
  the second slash two more at once after the first, smeared then and only then); nothing cyan, the pink edge while they
  are here, every pixel whole or empty; nothing cut off; nothing in the floor; the Hush seeping, leaving, gone, the pink
  behind the helm; the shatter (cracked all over first, then only shards, lying on the floor, gone at the end); his pick's
  look (the tallest and thinnest guard of Act 2, mirrored plate, the faceless helm, the violet cape, a glass blade in each
  hand, no shield, no halberd); his pick's moves in tiles (no charge, the mirror step of 0.6 s each way with a ripple at
  each end, the X out to two tiles, the fan's five shards, sixty degrees, eight tiles); nothing folds flat.
- The import checks of `tests/bosses.test.ts`, `tests/crier.test.ts` and `tests/hushed.test.ts` are told of
  `art/queens_guard*.ts` (they take the Hush's colours and breath from art/crier.ts and art/hushed.ts, and the bosses' feet
  from art/bosses3.ts). Nothing else of the game is changed.
- Dev page: `src/dev/preview_queens_guard.ts` (`sheet`, `big:<move>:<t>`, `grid:<move>:<t>,<t>,...`, and the film's frames);
  the film: `node tools/queens_guard_film.mjs <out.mp4>`.

## For him to decide

- The numbers: the glide 1.2 tiles a second; the X 0.4 to 2 tiles out and 1.8 across; the shards 16 tiles a second. His to
  change.
- The mirror step comes out of a ripple at their left, not of the gallery's wall mirrors (it can be anywhere, as he asked:
  "beside you"). If he would rather they used the wall mirrors, the game must place them by one.

## His word on the pictures

The first design's sheet and film, asked “The Queen's guard (queens_guard_sheet.png and the film): are these right?”: “Yes,
that's them (Recommended)”. The mirror duellists' sheet and film: not yet shown.
