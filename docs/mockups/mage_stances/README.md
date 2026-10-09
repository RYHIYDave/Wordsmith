# Mock-up: the mage's battle stance and town stance (NOT IN THE GAME until the main chat puts it there)

**What it is.** The mage given a battle stance of her own, as the owner asked of every hero, behind a
switch that is off: `MAGE_STANCES.on` in `src/art/moves3.ts` (`useMageStances(on)`). With it off, the
game is today's exactly (tests check it).

**State of this branch (`art/mage-stances`), 8 Oct 2026:** from `art/ranger-stances` at `cf9f09f`
(the ranger's stances, which the main chat brings in as Version 19.4, and main at 19.2), because
the mage's stops and setting off are made by the same means as his. **WORK IN PROGRESS: her stance
and her runs have his yes (19:01), and her casts from it (19:19). Her hits, fall and habits from it
are in the code too (switch off) but have NOT his yes: he saw them and asked for everything to be
big and wild first (below). None of what is here is wild yet.**

## His words

- 15:38, of the ranger: "Each character should have a battle stance and a town stance." The warrior
  has both; the ranger's are on `art/ranger-stances`; the mage had one figure for both, her staff her
  walking stick.
- 19:01, to `mage_stances.png` and `mage_stances.gif`: "Yes, this stance (Recommended)" (her guard,
  the one she comes to when she is picked on her class card); and of her run in a fight, "Yes, low
  (Recommended)".
- 19:19, of `mage_casts.gif` (her Wave, Orb and Beam from her guard): "Yes looks right".
- Sent to him just after 19:33: `mage_hits_fall.gif` (struck, and her fall, from her guard) and
  `mage_habits.gif` (her light from the guard; and in a fight, in place of reading, the power
  getting away from her). His answer, by 20:14: "if the "power getting away" animations is what you
  meant by wild and barely controlling her power, then we are not on the same page.  there's not even
  a glow on the staff, it just gets lighter.  there should be energy crackling and bolts shooting
  out, barely able to contain it.  this goes for all the animations we've created.  i think we need
  to amend the rules for effects and animations change it to big and wild.  why dont you redo the
  WAVE animation as big and wild as you think is appropriate and ill tell you if it needs to go more
  or less wild". (Asked whether to keep the power getting away in a fight and reading in town, the
  pop-up came back without a choice.)
- 20:17, told that she had been made to move wild: "move wild?  she just lowered her staff.  is that
  wild?" He is right: her guard is the staff lowered and level, and nothing she does is wild yet.

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
- **Her casts start and end in her guard, her feet where it has them** (`waveFromGuard`,
  `orbFromGuard`; the Beam's rest is her guard, and `beamLetGoToGuard`): a foot moves at most 0.5 in
  the Wave (today 3.6), 0.2 in the Orb (today 3.0), 0.7 in the Beam (today 7.4). The Wave swings up
  from the guard, over and down, and back; the Orb lifts the staff high and drives it down deep in her
  wide stance; for the Beam her back foot steps back (lifted) to brace against the push, and steps up
  again when it is let go.
- **The Beam no longer jumps in from a piece of the Wave** (today 5.8 px, the staff's end 47): while
  the rules wind it up she brings the staff level at her mark (`beamStartsFromGuard`, `BEAM_START3`,
  `beamstart`), shown by the figure in place of the Wave's picture (`clips.holdStart`, made by
  `holdStartOf`; `FigureState.holdSoon`, from the renderer: the attack wound up is one that is held).
  He saw `mage_casts.gif` (the pop-up came back without a choice) and wrote at 19:19: "Yes looks
  right".
- **Struck, and her fall, from her guard** (`mageReelLow`, `mageLurchLow`, `mageFallFromGuard`): the
  foot that steps is lifted and the staff stays level in her hands; a foot on the floor moves 0.0 game
  px when she is rocked or thrown standing (today 2.3 and 2.5). In her fall the staff swings up out
  of her guard and she goes down it to her knees as before. No yes yet (above).
- **Her habits in a fight, from her guard** (`mageLightInGuard`, `powerGetsAway`; in town she keeps
  today's two, now moves of their own, `tmlight` and `treading`): her light with one hand off the
  staff; and in place of reading, the power getting away from her. No yes yet: he wants the power
  getting away big and wild, "energy crackling and bolts shooting out, barely able to contain it".
- Not yet: her casts made walking, and everything made big and wild (the Wave first).

## Tests

`tests/mage_stances.test.ts` (5): the switch off and her moves today's (her town habits too); on and
off again, today's exactly (her hits, fall and habits too, and in town her habits never change); her
runs grip and the others' do not; her guard is the one she makes ready into, low, and alight; her
stops and setting off only with the switch on.
