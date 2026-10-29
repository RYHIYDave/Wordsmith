# Floor 18, the Glass Gallery: the queen's guard (mock-up; branch `mockup/queens-guard`)

From `origin/mockup/swan-gardens` (55945b3). Nothing here is in the game until the main chat puts it there, on his yes.
Nothing of the game imports any of it (its test proves it); it is behind `QGUARD_ON`, off.

## The brief

The floor's plan, his yes: “Enemies: ladies-in-waiting, the queen's guard, and your own reflections”. His pick for how they
move: “Measured, then a sudden charge (Recommended)”, with the brief as offered: the queen's guard, floor 18's medium mob;
tall halberdiers in silvered armour, violet cloaks, helms crested with spikes of glass like the queen's crown, mirror-polished
round shields; a head taller than the knight, fewer; their mark the mirror shields and the glass-spiked helms; two attacks,
a long halberd chop down in front and a shield charge that flashes as it hits; their death, the shield cracks like glass, to
one knee, the Hush leaves them in a grey breath; never floor 16's palace guard (no tabard, no swan), never undead; their
sound steel and the ring of glass. From the Grimms' "Snow White" (1812): the queen's own guard, nothing more of the book.

Built to his rules from the first pass: Movement 9 (“Like the wind up and wind down are big but the actual punch is
lightning quick”; for the enemies, “Start from now on, but every enemy is going to need that change eventually.  And bigger
AOE to compensate for the extra time the player gets to evade”), and his words on speed and size of 28 Oct.

## The pictures (`pictures/`)

- `queens_guard_sheet.png`: standing, from in front and from behind, beside the knight, three times as big; three of them at
  the game's size marching on the knight.
- `queens_guard_moves.mp4`: every move at the scale of a boss arena (an ellipse 17 by 20 tiles) with the knight for size, and
  close up from in front and from behind; each strike again at half speed.

The floor in them is a stand-in (dark polished stone in tiles), not floor 18's own.

## Their look (src/art/queens_guard.ts)

A head taller than the knight (`QG_BODY`, 68 tall to his 58; the helm's top at about 70), long in the leg. Silvered plate,
cool grey-silver with lavender lights (`SILVER`): a ridged breastplate, a fauld of lames, tassets, great pauldrons in lames,
couters and poleyns, greaves, sabatons, gauntlets. A short pleated arming skirt and a cloak from the shoulders to the calves,
both dark royal violet (`VIOLET`), the cloak clasped at the pauldrons, edged silver, streaming in the charge. A closed helm,
its visor a beak with a bright brow over a dark slit, the dull pink eyes behind it, the Hush leaking out of it; round its
crown, on a violet circlet, EIGHT GLASS SPIKES (`QG_SPIKES`, the tallest, 16, at the brow), lavender and cold blue glass
(`GLASS`, hue 230 to 250: never the friend's cyan). THE HALBERD (`QG_HALBERD`, 100 long, two and a half tiles): a staff
lacquered near black-violet, bound in silver; a broad crescent axe (13 out from the staff), a hooked fluke, a long top spike, a
violet tassel. THE ROUND MIRROR SHIELD (`QG_SHIELD`, 20 across, domed), strapped to the left forearm: silver rim and studs,
its face a true mirror of the gallery round it from where the eye stands (the glasshouse's light, the vault, the bright line
of the far windows, the dark floor), its sheen sliding as it turns; leather straps behind.

## Their moves (src/art/queens_guard_moves.ts) and their numbers

Frames at 30 a second but the stand (10) and the two loops (20). Tiles are the floor's (`TILE3`).

- STAND (32 frames at 10, 3.2 s): on guard, the shield up before the chest, the halberd stood at the right side; breathing,
  the weight shifting, the helm turning slowly.
- THE MARCH (`walk`): `QG_MARCH` 1.0 tile a second (the knight walks 2.5): a loop of 24 frames at 20 (1.2 s), two long
  heavy steps, each knee brought up and each sabaton set down flat, the body sinking onto it; shield up, halberd upright.
- THE CHARGE: `QG_CHARGE` 6.0 tiles a second, six times the march: the same 24 frames, six bounding strides a round (it
  repeats every 0.4 s, `QG_CHARGE_EVERY`), low behind the shield, the halberd slanted back over the shoulder, the cloak
  streaming. INTO IT (`chargeIn`, 0.2 s): the game carries them at the full 6 tiles a second from its first frame (sudden:
  no run-up) while they drop behind the shield and drive off. OUT OF IT (`chargeOut`, 0.4 s): the right foot thrown down,
  a skid, up onto guard 24 figure lengths (0.6 tile) on (`QG_CHARGE_OUT.shift`).
- THE HALBERD CHOP (`attack`, `QG_CHOP`, 2.0 s): heaved up high over the right shoulder in the right fist, the body leaning
  back and wound round, a step in, the shield held out before them; HELD shaking 0.52 to 0.90 s, the axe glinting pink (the
  warning); hips first; THE STRIKE frames 27 to 29 (0.90 to 0.967 s, the blow landing on the second), the halberd swept
  over the top through more than 120 degrees, smeared (a fan of after-images and the arcs of its point, edge and horns);
  the axe bites the floor 2.0 tiles out; held bent over it to 1.36 s; heaved up and stood again. WHAT IT LEAVES
  (`chopPainted`, src/art/queens_guard_fx.ts, 1.5 s): the floor splits along a line from 1.2 to 6.5 tiles out, 1.6 wide, run
  out in two frames, both its edges flashing pale; glass leaps up all along it and falls ringing; it dulls to a scar.
- THE SHIELD CHARGE (`bash`, `QG_BASH`, 1.85 s): down into a crouch behind the shield, left shoulder forward, the halberd
  slanted back; HELD shaking 0.34 to 0.80 s, the mirror glinting pink; hips first; THE STRIKE frames 24 to 26 (0.80 to
  0.867 s): a burst off the floor, both feet up, the GAME CARRYING THEM 3 tiles in those two frames (`QG_BASH.carry`,
  `bashCarried`), speed-lines streaking back the whole way; the shield punched out as it lands: the mirror flashes white
  (0.3 s), a star of light and glass off it; held; up onto guard 18 figure lengths (0.46 tile) further on (`QG_BASH.end`).
  WHAT IT LEAVES (`bashPainted`, 0.9 s): a ring of silver-white light 3.2 tiles across before the shield, out in two frames;
  the lane they burst along, 1.6 tiles wide, scored with light.
- STRUCK (`reel`, 0.4 s): jolted back, the helm snapped back, the shield rocked, the Hush coughed out.
- THEIR DEATH (`dying`, `QG_DIES`, 3.4 s): the shield cracks across like a mirror (0.06 to 0.42 s), glass falling from it and
  lying glinting; the halberd drops (0.36 s); down onto the right knee, the left foot planted (by 1.0 s); the cracked shield
  slides off the arm and lies flat, mirror up (1.12 s); the gasp, head thrown back, the Hush pouring out of the slit in one
  great grey breath (1.0 to 2.5 s), the pink gone from the eyes; then the other knee gives and they sink down, sat back on
  their heels, bowed over, still (2.0 to 2.65 s): people again, alive.

## Bringing it in (the main chat's)

`makeQGuardArt3()` gives `{ front, back }` as the game holds a monster; the moves: `stand`, `walk` (the march), `attack`
(the chop), `reel`, `dying`, and `more.chargeIn`, `more.charge`, `more.chargeOut`, `more.bash`. The game's part:

- THE CHARGE: march, then `chargeIn` and `charge` carried at `QG_CHARGE` tiles a second; end the run at a stride's start
  (every `QG_CHARGE_EVERY`), play `chargeOut`, move them on `QG_CHARGE_OUT.shift`; then stand, chop or shield charge.
- THE SHIELD CHARGE: carry them `QG_BASH.carry` tiles through `QG_BASH.strike`; the blow lands on `QG_BASH.hit`; at its end
  move them on `QG_BASH.end`. Its areas (his “bigger AOE”): the lane it crosses (`QG_BASH.wide` wide) and the ring
  (`QG_BASH.ring` across); draw `bashPainted(t, view)` from the hit at their place as they land, turned their way.
- THE CHOP: the blow lands on `QG_CHOP.hit`; its area the line `QG_CHOP.from` to `QG_CHOP.reach` tiles before them,
  `QG_CHOP.wide` wide; draw `chopPainted(t, view)` from the hit at their place, turned their way.
- THE DEATH: the halberd and the shield fall as pieces (`fall`), clear of them.

## The checks

- `tests/queens_guard.test.ts` (11): nothing of the game imports them, the switch off; EVERY MOVE THROUGH EVERY BOSS CHECK
  (src/art/boss_checks.ts), every frame from in front and from behind, and every handover (the stand and every step of the
  march into the charge, into its loop, out of it at each stride, the skid into the stand and both blows); his lightning
  strikes (two frames each, landing on the second, smeared then and only then); nothing cyan, the pink edge while they live,
  every pixel whole or empty; nothing cut off; nothing in the floor; the Hush leaking, leaving, gone, the pink eyes; what
  falls lying clear; the brief (a head taller, the eight glass spikes, a mirror, no tabard or swan, the crack, to one knee,
  down); his speeds and sizes in tiles (the march and the charge each painted for its pace, the axe biting two tiles out,
  the line, the burst, the ring, each out in two frames); nothing folds flat.
- The import checks of `tests/bosses.test.ts`, `tests/crier.test.ts` and `tests/hushed.test.ts` are told of
  `art/queens_guard*.ts` (they take the Hush's colours and breath from art/crier.ts and art/hushed.ts, and the bosses' feet
  from art/bosses3.ts). Nothing else of the game is changed.
- Dev page: `src/dev/preview_queens_guard.ts` (`sheet`, `big:<move>:<t>`, `grid:<move>:<t>,<t>,...`, and the film's frames);
  the film: `node tools/queens_guard_film.mjs <out.mp4>`.

## For him to decide

- The chop is struck ONE-HANDED, the shield kept up: the shield is strapped to the left forearm, and with both hands on the
  staff it swung through his own body. Read as the brief; his to change.
- The numbers: the march 1 tile a second, the charge 6; the chop's line 6.5 tiles long and 1.6 wide; the shield charge's
  burst 3 tiles and its ring 3.2 across. His to change.
