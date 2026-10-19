#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 23.0 (section 8 of the design notes, step 7): the release's
# dist/artifact.html wrapped as the site serves it (the site's <head> and reset, then the fragment),
# with a selection of the regression's playtests played on it two at a time.
#   cd <the frozen copy> && bash tools/wrap230.sh
# The playtests are taken from tools/regress.sh as they stand there (their settings and screen sizes),
# by name; each one's log is in shots/wrap/<name>.log, the verdicts in shots/wrap/summary.txt.
set -u
mkdir -p shots/wrap
rm -f shots/wrap/*.log shots/wrap/summary.txt
PAGE=shots/wrap/page.html
{
  printf '%s' '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>'
  printf '\n'
  cat dist/artifact.html
} > $PAGE
P="--touch --size 844x390 --dpr 3"
U="--touch --size 390x844 --dpr 3"
N="window.__dbg.screen.setTurnMode('upright')"
F="window.__dbg.setAim('face')"
S=tools/scenarios
run() {
  local name=$1; shift
  timeout 900 node tools/playtest.mjs "$@" --file "$PAGE" --out shots/wrap/$name > shots/wrap/$name.log 2>&1
  local bad=$(grep -c '!!' shots/wrap/$name.log)
  local last=$(tail -n 1 shots/wrap/$name.log | cut -c1-60)
  if [ "$bad" != "0" ]; then echo "PROBLEMS: $bad line(s) marked !!   $name"
  elif [ "$last" != "finished clean" ]; then echo "DID NOT FINISH CLEAN ($last)   $name"
  else echo "finished clean   $name"; fi
}
NAMES="input touch_wide touch_tall town town_phone save towntap_phone enter_pc enter_phone enter_upright
practice words_warrior words_ranger words_mage boss look_pc look_phone pages_pc pages_phone plates_phone
slots3_phone monsters_pc monsters_phone dungeon_pc dungeon_phone guide_pc_warrior guide_phone_mage
guide_upright_ranger guide_narrow_warrior half_phone hud_pc hud_phone spells_pc spells_phone spells_upright
depths_pc walls_pc doors_pc combo_pc combo_phone mix_pc traps_pc modes_pc talents_pc talents2_ranger gamepad_pc
packs_wild_pc monster_attacks_pc new_monsters_pc
first5_painter2 first5_painter3_phone first5_painter5_fight first5_painter_off first5_floor1 first5_floor2
first5_floor3 first5_floor4 first5_floor5 first5_boss2 first5_boss3 first5_boss4 first5_boss5 first5_cult4
first5_cult5 first5_stair1 first5_stair3_phone first5_shaft first5_shaft_upright first5_titles
first5_titles_phone title_smith3_phone floorcard_phone floorcard_pc
act1_floor6_phone act1_floor7 act1_floor8_upright act1_floor9 act1_floor10_phone act1_boss6_phone act1_boss7
act1_boss8 act1_boss9_phone act1_eye_phone act1_eye_risen act1_eye_blazing act1_hold6_phone act1_hold8
act1_hold10_upright act1_eyrie act1_ways5 act1_ways6 act1_ways7 act1_ways8 act1_ways9 act1_ways10
act1_hand_in_phone act1_meld_phone act1_meld_drops_fall act1_meld_drops_give
speed_tops_same_warrior speed_tops_same_mage
act2_floor11_phone act2_floor12 act2_floor13_upright act2_floor14 act2_floor15_phone act2_boss11_phone act2_boss12
act2_boss13 act2_boss14_phone act2_boss15 act2_boss15_half act2_bells11_phone act2_bells14 act2_ways11 act2_ways12
act2_ways13 act2_ways14 act2_ways15
monkey_1 monkey_2 soak"
(
for name in $NAMES; do
  line=$(grep -E "(^|[[:space:]])run[[:space:]]+$name[[:space:]]" tools/regress.sh | head -1 | sed -E 's/[[:space:]]*&[[:space:]]*$//; s/#.*$//')
  if [ -z "$line" ]; then echo "NOT FOUND IN regress.sh   $name"; continue; fi
  while [ "$(jobs -rp | wc -l)" -ge 2 ]; do sleep 0.7; done
  eval "$line" &
  sleep 1
done
wait
# the frame rate alone
run perf --scenario $S/perf.mjs
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
grep -h "frame rate\|longest single frame" shots/wrap/perf.log
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
