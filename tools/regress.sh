#!/bin/bash
# Every browser playtest, four at a time. Prints one line for each: how it ended, and
# its name. The full output of each is kept in shots/regress/<name>.log, the results together in
# shots/regress/summary.txt. The last line says whether everything finished clean (and the exit
# status is 0 only then).
#   bash tools/regress.sh          (after node tools/build.mjs --dev)
#   STEPS=600 bash tools/regress.sh   (longer random-input runs; COUNT likewise for combos.mjs)
#   PAGE=dist/copy.html bash tools/regress.sh   (test a copy of the page, so that Play.html can be
#                                                rebuilt while the quarter of an hour goes by)
cd "$(dirname "$0")/.."
PAGE=${PAGE:-Play.html}
mkdir -p shots/regress
rm -f shots/regress/*.log shots/regress/summary.txt
# JOBS=2 bash tools/regress.sh   no more than two playtests at once (the default is the four of
#   each group below). The machine these run on has two processors; with four browsers on it a
#   playtest is now and then starved for half a second, and a check that counts on the clock (a
#   hold that must last, a bar read "just after" a blow) is then flagged though nothing is wrong:
#   6 Oct 2026, two full runs flagged three and two such, different ones each time, every one
#   clean when run again by itself. Two at a time takes about twice as long.
JOBS=${JOBS:-4}
run() { # name, then the arguments for playtest.mjs (environment is passed through)
  local name=$1; shift
  # (Wait for a free place, one at a time: whoever holds the gate counts the playtests that are
  # running, starts its own when there is room, and lets go of the gate once that one can be
  # counted by the next.)
  exec 9> shots/regress/.gate
  flock 9
  while [ "$(pgrep -fc '^node tools/[p]laytest.mjs')" -ge "$JOBS" ]; do sleep 0.7; done
  timeout 900 node tools/playtest.mjs "$@" --file "$PAGE" --out shots/regress/$name > shots/regress/$name.log 2>&1 &
  local pid=$!
  sleep 1
  flock -u 9
  wait $pid
  # (a scenario says "!!" when something is not as it should be, or when something it meant to
  # press was not there: that is a failure too, even though the page itself reported no error)
  local bad=$(grep -c '!!' shots/regress/$name.log)
  local last=$(tail -n 1 shots/regress/$name.log | cut -c1-60)
  if [ "$bad" != "0" ]; then echo "PROBLEMS: $bad line(s) marked !!   $name"
  elif [ "$last" != "finished clean" ]; then echo "DID NOT FINISH CLEAN ($last)   $name"
  else echo "finished clean   $name"; fi
}
P="--touch --size 844x390 --dpr 3"   # a phone held sideways
U="--touch --size 390x844 --dpr 3"   # a phone held upright
N="window.__dbg.screen.setTurnMode('upright')"   # (with $U and --eval) upright, in the narrow layout
S=tools/scenarios
(
# real input: mouse and keyboard, fingers; the town's services
run input        --scenario $S/input.mjs &
run touch_wide   $P --scenario $S/touch.mjs &
run touch_tall   $U --scenario $S/touch.mjs &
run town         --scenario $S/town.mjs &
wait
run town_phone   $U --scenario $S/town.mjs &
run save         --scenario $S/save.mjs &
run towntap      --scenario $S/towntap.mjs &
run towntap_phone $P --scenario $S/towntap.mjs &
wait
# (the town's services each have half the screen beside the inventory since Version 14.3: they are
# used in the other two ways of holding a phone as well)
run town_wide    $P --scenario $S/town.mjs &
run town_narrow  $U --eval "$N" --scenario $S/town.mjs &
# (the town's new look, Version 14.4: every place photographed, its pictures counted, its services offered)
run townlook     --scenario $S/townlook.mjs &
run townlook_phone $P --scenario $S/townlook.mjs &
wait
# picking a hero (Version 16: the three heroes painted over the bones). The one picked makes ready
# on their card before the run begins; Escape calls it off; a second press lets them go at once;
# left alone they go, the run begins in the first dungeon and they say a line of their own. And
# with the first heroes (#heroes=old), whose art has no picture of making ready, a card pressed
# begins the run at once, as it did up to Version 15.
run enter_pc     --scenario $S/enter.mjs &
run enter_phone  $P --scenario $S/enter.mjs &
run enter_upright $U --scenario $S/enter.mjs &
run enter_old    --hash "heroes=old" --scenario $S/enter.mjs &
wait
run branches     --scenario $S/branches.mjs &
run practice     --scenario $S/practice.mjs &
run scarce       --scenario $S/scarce.mjs &
run quip         --scenario $S/quip.mjs &
wait
CLS=warrior run words_warrior --scenario $S/words.mjs &
CLS=ranger  run words_ranger  --scenario $S/words.mjs &
CLS=mage    run words_mage    --scenario $S/words.mjs &
run boss         --hash "bot=warrior&seed=7" --scenario $S/boss.mjs &
wait
# the screens, looked at in each way of holding the game: the starting screen, the first dungeon and
# the inventory with its coach (look), then the inventory with words and gear, the Lexicon, the gate,
# the pause menu, CONTINUE (look2)
CLS=ranger  run look_pc      --scenario $S/look.mjs &
CLS=warrior run look_phone   $P --scenario $S/look.mjs &
CLS=mage    run look_upright $U --scenario $S/look.mjs &
CLS=ranger  run look_narrow  $U --eval "$N" --scenario $S/look.mjs &
wait
CLS=ranger  run look2_pc      --scenario $S/look2.mjs &
CLS=mage    run look2_phone   $P --scenario $S/look2.mjs &
CLS=warrior run look2_upright $U --scenario $S/look2.mjs &
CLS=ranger  run look2_narrow  $U --eval "$N" --scenario $S/look2.mjs &
wait
# the inventory in three pages (Version 13.1): GEAR opens first, an attack opens ATTACKS, the bag and
# the words stay at the bottom; gear dragged onto the hero and back, with a mouse and with fingers
CLS=ranger  run pages_pc      --scenario $S/pages.mjs &
CLS=warrior run pages_phone   $P --scenario $S/pages.mjs &
CLS=mage    run pages_upright $U --scenario $S/pages.mjs &
CLS=ranger  run pages_narrow  $U --eval "$N" --scenario $S/pages.mjs &
wait
# room for four properties on every piece (Version 13.2): words added to gear until it is full, the
# colour following the count, a game saved before this version carried on (mods.mjs); and the
# attacks written along the bottom of the game screen, which are not buttons while a fight is on
# (plates.mjs: with a mouse, with fingers each way of holding a phone, and with auto aim)
CLS=warrior run mods_pc      --scenario $S/mods.mjs &
CLS=ranger  run mods_phone   $P --scenario $S/mods.mjs &
CLS=ranger  run plates_pc    --scenario $S/plates.mjs &
CLS=mage    run plates_phone $P --scenario $S/plates.mjs &
wait
CLS=warrior run plates_upright $U --scenario $S/plates.mjs &
CLS=ranger  run plates_narrow  $U --eval "$N" --scenario $S/plates.mjs &
AIM=default CLS=ranger run plates_auto $P --scenario $S/plates.mjs &
# (a third word slot a side is NOT in the game: this keeps the menus and the game screen able to hold one)
CLS=mage    run slots3_phone  $P --scenario $S/slots3.mjs &
wait
# the monsters, repainted and animated like the heroes (Version 14): every figure stood in the
# practice room; its attack's picture held to the rules' clock from the front and from behind; the
# Warden's two attacks; what ails them, their fire in the dark, the bars and names over their heads
run monsters_pc      --scenario $S/monsters.mjs &
run monsters_phone   $P --scenario $S/monsters.mjs &
run monsters_upright $U --scenario $S/monsters.mjs &
run monsters_narrow  $U --eval "$N" --scenario $S/monsters.mjs &
wait
# the dungeon itself, repainted (Version 14.1): the town, then a dungeon with everything revealed,
# the hero beside one of each thing that stands or lies in it, before and after it is opened or
# broken; every picture at the heroes' grain; how long a frame takes
run dungeon_pc       --scenario $S/dungeon.mjs &
run dungeon_phone    $P --scenario $S/dungeon.mjs &
CLS=mage   run dungeon_upright $U --scenario $S/dungeon.mjs &
CLS=ranger run dungeon_narrow  $U --eval "$N" --scenario $S/dungeon.mjs &
wait
# a new player's first dungeon, played from the starting screen with real input: each class, each
# way of holding the game
CLS=warrior run guide_pc_warrior --scenario $S/guide.mjs &
CLS=ranger  run guide_pc_ranger  --scenario $S/guide.mjs &
CLS=mage    run guide_pc_mage    --scenario $S/guide.mjs &
CLS=mage    run guide_phone_mage $P --scenario $S/guide.mjs &
wait
CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
CLS=ranger  run guide_phone_ranger  $P --scenario $S/guide.mjs &
CLS=ranger  run guide_upright_ranger $U --scenario $S/guide.mjs &
CLS=mage    run guide_upright_mage   $U --scenario $S/guide.mjs &
wait
CLS=warrior run guide_upright_warrior $U --scenario $S/guide.mjs &
CLS=warrior run guide_narrow_warrior $U --eval "$N" --scenario $S/guide.mjs &
CLS=ranger  run guide_narrow_ranger  $U --eval "$N" --scenario $S/guide.mjs &
CLS=mage    run guide_narrow_mage    $U --eval "$N" --scenario $S/guide.mjs &
wait
# the same, when a monster gives up a word before the fallen wordsmith is reached
CLS=warrior EARLY=swift run guide_early_word --scenario $S/guide.mjs &
CLS=ranger  EARLY=frost run guide_early_word_phone $P --scenario $S/guide.mjs &
# and when one more word is found as the dead rise: the game offers it a place at the first quiet
# moment, by opening the inventory itself, and the playtest must not call that a press gone astray
# (Version 14.4's regression did, by chance: this run was added after it, for 14.5 on)
CLS=ranger  EARLY=frost LATE=twin run guide_late_word_phone $P --scenario $S/guide.mjs &
# and when a pack is upon the hero as the first word is found: the inventory waits for the quiet
# moment, the playtest fights as a player would, and it must open when that fight is over
# (Version 18.4's regression met this by chance, and flagged it: this run was added after it)
CLS=ranger  AMBUSH=1 run guide_ambush_phone $P --scenario $S/guide.mjs &
CLS=ranger  run slots3_narrow $U --eval "$N" --scenario $S/slots3.mjs &
wait
# the inventory on half the screen (Version 14.2): the game stood still in the other half with the
# hero in the middle of it and none of its buttons; what is read on a card over the game's side;
# a press on the game's side closing it, and that press not an attack
CLS=warrior run half_pc      --scenario $S/half.mjs &
CLS=ranger  run half_phone   $P --scenario $S/half.mjs &
CLS=mage    run half_upright $U --scenario $S/half.mjs &
CLS=warrior run half_narrow  $U --eval "$N" --scenario $S/half.mjs &
wait
# the controls on a phone. The sword finds its enemy as the orb does (melee.mjs: the default
# controls). And the experiment the owner asked to try, which is built and switched off (attacks go
# the way the hero faces, with a lock on an enemy in a fight): tested for itself, each way of
# holding a phone (facing.mjs switches it on), and the ordinary touch playtests run with it on.
F="window.__dbg.setAim('face')"
run melee_phone   $P --scenario $S/melee.mjs &
run melee_upright $U --scenario $S/melee.mjs &
CLS=ranger  run facing_phone   $P --scenario $S/facing.mjs &
CLS=warrior run facing_upright $U --scenario $S/facing.mjs &
wait
CLS=mage    run facing_narrow  $U --eval "$N" --scenario $S/facing.mjs &
run touch_facing $P --eval "$F" --scenario $S/touch.mjs &
CLS=ranger  run guide_phone_facing $P --eval "$F" --scenario $S/guide.mjs &
CLS=warrior run guide_narrow_facing $U --eval "$N; $F" --scenario $S/guide.mjs &
wait
# where the hero's life is shown (Version 11.2: with fingers the globe is in the top left corner, out
# from under the left thumb; everywhere a bar of life hangs over the hero's head when it matters)
CLS=warrior run hud_phone   $P --scenario $S/hud.mjs &
CLS=mage    run hud_pc      --scenario $S/hud.mjs &
CLS=ranger  run hud_narrow  $U --eval "$N" --scenario $S/hud.mjs &
CLS=mage    run hud_upright $U --scenario $S/hud.mjs &
wait
# any weapon on anyone, and the staff's and the wand's attacks (Version 12): Wave, Orb, Familiar, Beam
run spells_pc      --scenario $S/spells.mjs &
run spells_phone   $P --scenario $S/spells.mjs &
run spells_upright $U --scenario $S/spells.mjs &
run spells_narrow  $U --eval "$N" --scenario $S/spells.mjs &
wait
# AUTO AIM (Version 12.1.1): a tap and a hold on open floor go for the enemy the game picks, whatever is in hand
CLS=ranger  run autoaim_ranger  $P --scenario $S/autoaim.mjs &
CLS=warrior run autoaim_warrior $P --scenario $S/autoaim.mjs &
CLS=mage    run autoaim_mage    $U --eval "$N" --scenario $S/autoaim.mjs &
CLS=mage WEAPON=wand run autoaim_wand $U --scenario $S/autoaim.mjs &
wait
# AUTO AIM is where a phone starts out (Version 12.2.1). Every touch playtest above is started in
# the way it was written for, where the thumb aims (AIM, in tools/playtest.mjs); these four are
# left as a new player finds the game: the default itself, and the first dungeon on each layout.
AIM=default run aim_default $P --scenario $S/aimdefault.mjs &
AIM=default CLS=ranger  run guide_auto_phone   $P --scenario $S/guide.mjs &
AIM=default CLS=mage    run guide_auto_upright $U --scenario $S/guide.mjs &
AIM=default CLS=warrior run guide_auto_narrow  $U --eval "$N" --scenario $S/guide.mjs &
wait
# ledges and stairs (Version 18.0): in the hall built for them, with real input, the hero stays
# below a ledge, walks up one flight of stairs and down another, and is carried up a ledge and down
# it by the swipe move (a leap with the keyboard and with a finger, a roll, a warp); skeletons come
# round by the stairs; nobody walks across a ledge. Then a real dungeon's rooms with terraces: their
# pictures, how long a frame takes, and the playtests' own player walking up to what waits on one.
CLS=warrior run heights_pc      --scenario $S/heights.mjs &
CLS=ranger  run heights_phone   $P --scenario $S/heights.mjs &
CLS=mage    run heights_upright $U --scenario $S/heights.mjs &
CLS=warrior run heights_narrow  $U --eval "$N" --scenario $S/heights.mjs &
wait
# stairs that go down (in the game since Version 18.1; the playtest reaches the hall by its own
# door and sets the map-maker's switch for itself, whichever way it stands): in the hall built
# for sunken floor, with real input, the hero stays at the rim, walks
# down one flight and up another, and is carried over the rim both ways by the swipe move; a
# skeleton comes up by the stairs; nobody walks across a ledge. Then a real dungeon laid with
# sunken floor: pictures, how long a frame takes, and the bot down to what waits in one.
CLS=warrior run depths_pc      --scenario $S/depths.mjs &
CLS=ranger  run depths_phone   $P --scenario $S/depths.mjs &
CLS=mage    run depths_upright $U --scenario $S/depths.mjs &
CLS=warrior run depths_narrow  $U --eval "$N" --scenario $S/depths.mjs &
wait
# triangles: walls that slant (in the game since Version 18.2; the playtest reaches its room by
# its own door and sets the map-maker's switch for itself, so it tests them whichever way the
# switch stands): in the room with its four corners cut clean, with real input,
# the hero is stopped at each slanting wall at half their width from it and stands on a half
# tile, slides along one, does not land in one with the swipe move, and a skeleton comes at
# them there; nobody's middle is ever in the wall half of a tile. Then a real dungeon laid with
# triangles: an eight-sided hall, a flat back wall and a vault photographed, how long a frame
# takes, and the bot across a room to what waits against a flat back wall.
CLS=warrior run slants_pc      --scenario $S/slants.mjs &
CLS=ranger  run slants_phone   $P --scenario $S/slants.mjs &
CLS=mage    run slants_upright $U --scenario $S/slants.mjs &
CLS=warrior run slants_narrow  $U --eval "$N" --scenario $S/slants.mjs &
wait
# a corridor straight across the screen (in the game since Version 18.3; the playtest sets the
# map-maker's switches for itself): with real input the hero walks one from end to end, is
# stopped by its far wall and its near wall at half their width and stands on a half tile there,
# slides along the far wall, does not land in it with the swipe move, and a skeleton comes
# through it to them; nobody's middle is ever in the wall half of a tile; a frame is timed.
CLS=warrior run across_pc      --scenario $S/across.mjs &
CLS=ranger  run across_phone   $P --scenario $S/across.mjs &
CLS=mage    run across_upright $U --scenario $S/across.mjs &
CLS=warrior run across_narrow  $U --eval "$N" --scenario $S/across.mjs &
wait
# the walls (in the game since Version 18.4: taller, fading into the dark at the top, none toward
# the eye, and none where one would hide floor): read off the canvas of the page itself in the
# town and in a dungeon: a back wall is stone for 28 pixels, fainter above, and from 40 up there
# is the dark and no top of a wall; behind raised floor it ends on the same top line; on a side
# toward the eye nothing stands; beside a back doorway the two blocks that would hide the
# corridor are left out. With real input the hero walks out through a doorway on a side toward
# the eye and back, seen whole all the way; a frame is timed. Pictures of the town, a room with
# raised floor, a corridor across the screen and an eight-sided hall.
CLS=warrior run walls_pc      --scenario $S/walls.mjs &
CLS=ranger  run walls_phone   $P --scenario $S/walls.mjs &
CLS=mage    run walls_upright $U --scenario $S/walls.mjs &
CLS=warrior run walls_narrow  $U --eval "$N" --scenario $S/walls.mjs &
wait
# DOORS AND THE BOSS'S GATE (Version 18.5): in a dungeon laid with doors, every door is shut and
# the gate up; a door in a back wall and one on a side toward the eye are read off the canvas
# (bars across the opening, the lintel's stone over it), walked out through and back in with real
# input (open before the hero reaches it, he is seen all the way) and read again open; a brute
# comes through a door; the boss's gate is up with its mark in embers, falls when the hero is
# well inside (bars across the doorway, the mark alight), holds him, rises when the boss dies,
# and he walks out under it; a frame is timed.
CLS=warrior run doors_pc      --scenario $S/doors.mjs &
CLS=ranger  run doors_phone   $P --scenario $S/doors.mjs &
CLS=mage    run doors_upright $U --scenario $S/doors.mjs &
CLS=warrior run doors_narrow  $U --eval "$N" --scenario $S/doors.mjs &
wait
# TWO SMALL THINGS (Version 18.6): a ranged monster holds its ground (an archer and a cultist with
# the hero two tiles off stand and shoot; the hero walks up to an archer with real input, and it
# is where it was), and things on the floor are picked up from a little further (a piece of gear
# from a full tile off; gold comes from three tiles).
CLS=warrior run small_pc    --scenario $S/small.mjs &
CLS=ranger  run small_phone $P --scenario $S/small.mjs &
CLS=mage    run small_upright $U --scenario $S/small.mjs &
CLS=warrior run small_narrow  $U --eval "$N" --scenario $S/small.mjs &
wait
# STRIKE'S COMBO (Version 18.9; the playtest sets the switch for itself and puts it back): two
# quick taps (clicks, on a PC) are Strike and then the downward slash; a tap long after is Strike
# again; every swing steps the knight forward until a monster stops him; with the switch off every
# swing is Strike, as it was, and he does not step.
run combo_pc     --scenario $S/combo.mjs &
run combo_phone  $P --scenario $S/combo.mjs &
wait
# THE MIX (Version 18.9), in the hall laid for it, with real input: a lever's gate holds the hero
# and is told of; he walks to the nook and up to the lever, and the gate rises; through it and into
# the room that locks, whose gates fall behind him, hold him, and rise when its pack is dead.
CLS=warrior run mix_pc    --scenario $S/mix.mjs &
CLS=ranger  run mix_phone $P --scenario $S/mix.mjs &
wait
# THE TRAPS, in the hall laid for them: a spike floor's beat and what it does to monsters on it; a
# dart wall's plate and its darts; a sealed door that says what it wants and opens to a Strike that
# carries its word (and the vault behind it unseen until then).
run traps_pc     --scenario $S/traps_look.mjs &
run traps_phone  $P --scenario $S/traps_look.mjs &
wait
# NORMAL MODE (Version 19.1): the class cards' mode, Normal and then Hardcore; a Normal warrior
# falls in dungeon 4 with what he found there (YOU FELL, what it cost, Back to town); he wakes in
# town without it, a quarter of his gold gone, the same dungeon waiting.
run modes_pc     --scenario $S/modes_look.mjs &
run modes_phone  $P --scenario $S/modes_look.mjs &
wait
# THE RANGER'S NEW STANCES (Version 19.4): the bot fights with him in the practice room (running and
# stopping, shooting on the move, Volley, the roll, being hit), then he is run and stopped by hand;
# switched off and on again, he is drawn as before and as the game has him.
run ranger_stances_pc    --scenario $S/ranger_stances.mjs &
run ranger_stances_phone $P --scenario $S/ranger_stances.mjs &
wait
# THE SKILL TREES (behind TALENTS; the playtest sets the switch for itself and puts it back): for each
# class, NEW TALENT on the HUD opens the inventory's TALENTS page; a talent read and taken, one whose
# way is not open read, and the one taken undone in town, for gold.
run talents_pc     --scenario $S/talents_look.mjs &
run talents_phone  $P --scenario $S/talents_look.mjs &
wait
# A GAME CONTROLLER (behind GAMEPAD; the playtest sets the switch for itself, hands the page a pad of
# its own, and puts both back): walking, aiming with the right stick and attacking, the slow attack,
# the evasive move, a flask, the inventory and the menus' pointer, pause, and the map.
run gamepad_pc     --scenario $S/gamepad.mjs &
run gamepad_phone  $P --scenario $S/gamepad.mjs &
wait
# a long bot run; random input in town and dungeon, and (GUIDE=1) in a new player's first dungeon
run soak         --hash "bot=ranger&seed=3" --scenario $S/soak.mjs &
STEPS=${STEPS:-400} SEED=1 run monkey_1 --scenario $S/monkey.mjs &
STEPS=${STEPS:-400} SEED=2 run monkey_2 $P --scenario $S/monkey.mjs &
STEPS=${STEPS:-400} SEED=6 run monkey_upright $U --scenario $S/monkey.mjs &
wait
STEPS=${STEPS:-400} SEED=3 GUIDE=1 run monkey_guide --scenario $S/monkey.mjs &
STEPS=${STEPS:-400} SEED=4 GUIDE=1 run monkey_guide_phone $P --scenario $S/monkey.mjs &
STEPS=${STEPS:-400} SEED=5 GUIDE=1 run monkey_guide_narrow $U --eval "$N" --scenario $S/monkey.mjs &
# (pictures of words at work: a short selection here; the scenario's own default takes several minutes)
CLS=ranger SETS="poison|;|fire;power+twin|leech" TIMES="0.07,0.3,0.84" run wordfx --scenario $S/wordfx.mjs &
wait
# the ones that measure the frame rate (or where the time goes) run alone
run perf         --scenario $S/perf.mjs
CLS=warrior COUNT=${COUNT:-8} run combos_warrior --scenario $S/combos.mjs
CLS=ranger  COUNT=${COUNT:-8} run combos_ranger  --scenario $S/combos.mjs
CLS=mage    COUNT=${COUNT:-8} run combos_mage    --scenario $S/combos.mjs
CLS=mage    COUNT=4 run combos_phone $P --scenario $S/combos.mjs
run powerfx      --scenario $S/powerfx.mjs
run profile      --scenario $S/profile.mjs
) 2>&1 | tee shots/regress/summary.txt
grep -h "frame rate\|slowest frame rate\|longest single frame\|most particles" shots/regress/perf.log shots/regress/combos_*.log
total=$(grep -c . shots/regress/summary.txt)
clean=$(grep -c '^finished clean ' shots/regress/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/regress/summary.txt
exit 1
