# Mock-up: the mage's battle stance and town stance (NOT IN THE GAME until the main chat puts it there)

**What it is.** The mage given a battle stance of her own, as the owner asked of every hero, behind a
switch that is off: `MAGE_STANCES.on` in `src/art/moves3.ts` (`useMageStances(on)`). With it off, the
game is today's exactly (tests check it).

**State of this branch (`art/mage-stances`), 8 Oct 2026:** from `art/ranger-stances` at `cf9f09f`
(the ranger's stances, which the main chat brings in as Version 19.4, and main at 19.2), because
the mage's stops and setting off are made by the same means as his. **WORK IN PROGRESS: her stance
and her runs have his yes (19:01); her casts, hits and fall from the stance come next, pictures
first.**

## His words

- 15:38, of the ranger: "Each character should have a battle stance and a town stance." The warrior
  has both; the ranger's are on `art/ranger-stances`; the mage had one figure for both, her staff her
  walking stick.
- 19:01, to `mage_stances.png` and `mage_stances.gif`: "Yes, this stance (Recommended)" (her guard,
  the one she comes to when she is picked on her class card); and of her run in a fight, "Yes, low
  (Recommended)".

## What changes, with the switch on

- **In a fight she stands in her guard** (`MAGE_GUARD`, from `MAGE_GUARD_POSE`, which her making
  ready on the class card, `mageReadies`, shares): low and side-on, the staff level in both hands
  and pointed at what is ahead, its crystal alight. It is alive (`mageAlive`, 2.4 s round): two
  breaths, her weight going over and back, and twice in the round the power in the crystal surges
  and is held down again (the art rulebook's mage, "only just in control of the power"). Her head:
  47.8 picture px off the floor, on the mean through the round (in town, as today, 50.9).
- **She runs low with the staff ready** (`MAGE_BATTLE_GAIT`), as low as her guard (her head 46.5 on
  the mean), and her runs grip the floor: running the drawn ways, a foot on the floor moves at most
  1.6 game px (today 7.0 to 7.1); across the screen 4.3 (today 10.8); up or down 6.4 (today 6.5 to 6.6).
- **She comes to a stand in her guard, and sets off from it**, by the ranger's means (`settlesOf`,
  `startsOf`, now for any hero with stances of their own: `stanced()`): the picture changes there by
  at most 1.1 px, the staff's end 0.7 (today 2.9 px, the staff's end 4); a foot moves at most 2.9 as
  she sets off or stops (today 9.1).
- **In town she stands and runs as today** (her own moves now, `mtown`, `mtownrun`, the same
  pictures as today's with the switch off), and as she stands her weight shifts.
- Not yet: her casts (Wave, Orb, Beam), being hit and her fall, her habits in a fight, her casts
  made walking. Until they are made from her guard they begin and end upright: the picture jumps
  3.3 to 3.5 px there, the staff's end 23 to 25.

## Tests

`tests/mage_stances.test.ts` (5): the switch off and her moves today's; on and off again, today's
exactly; her runs grip and the others' do not; her guard is the one she makes ready into, low, and
alight; her stops and setting off only with the switch on.
