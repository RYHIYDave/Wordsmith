#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.18 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds', Colossus's, townsfolk's AND MONSTERS'
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). 
#   node tools/build.mjs && bash tools/wrap25318.sh
# Each one's log is in shots/wrap/<name>.log, the verdicts in shots/wrap/summary.txt.
set -u
mkdir -p shots/wrap
rm -f shots/wrap/*.log shots/wrap/summary.txt
PAGE=dist/wrapped.html
{
  printf '%s' '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>'
  printf '\n'
  cat dist/artifact.html
  # (the page's close, as the live page has it: this very file is what is published as index.html)
  printf '\n</body></html>'
} > $PAGE
P="--touch --size 844x390 --dpr 3"
U="--touch --size 390x844 --dpr 3"
C="--touch --size 852x393 --dpr 3"
C2="--touch --size 844x390 --dpr 2"
S=tools/scenarios
run() {
  local name=$1; shift
  timeout 3000 node tools/playtest.mjs "$@" --file "$PAGE" --serve --out shots/wrap/$name > shots/wrap/$name.log 2>&1
  local bad=$(grep -c '!!' shots/wrap/$name.log)
  local last=$(tail -n 1 shots/wrap/$name.log | cut -c1-60)
  if [ "$bad" != "0" ]; then echo "PROBLEMS: $bad line(s) marked !!   $name"
  elif [ "$last" != "finished clean" ]; then echo "DID NOT FINISH CLEAN ($last)   $name"
  else echo "finished clean   $name"; fi
}
two() { while [ "$(jobs -rp | wc -l)" -ge 2 ]; do sleep 0.7; done; }
(
# 25.3.18: FLOOR 5'S TEMPLE DOOR (design/f5-temple-door): the door barred and opened; the two key-bearers' blows and keys; the
# whole event in play; floor 5 laid with its threshold and the bearers' rooms; its boss as before
two; run temple_door_look $C2 --scenario $S/temple_door_look.mjs &
two; ONLY=stab,throw,leap run key_bearers $C2 --scenario $S/key_bearers_film.mjs &
two; run temple_event $C2 --scenario $S/temple_event_film.mjs &
two; DEPTH=5 MOMENTS=0 run first5_floor5 $P --scenario $S/first5_floor.mjs &
two; DEPTH=5 run first5_boss5 --scenario $S/first5_boss.mjs &
# THE QUESTS OF 11 TO 15 AND THE MUSTER ROLL (build/quests1115): the Bells (the clapper with the loot); a stronghold of 6 to 10
# won (its roll page); the camp's touches (its bell by the forge)
two; DEPTH=11 run act2_bells11_phone $P --scenario $S/act2_bells.mjs &
two; DEPTH=7 WORDS=1 run act1_hold7 $P --scenario $S/act1_hold.mjs &
two; run camp_tap_phone $P --scenario $S/camp_tap.mjs &
# the game's main ways
two; run save --scenario $S/save.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; run towntap_phone $P --scenario $S/towntap.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
wait
# THE FLOORS' MONSTERS FROM THEIR FILES (baked again: the two key-bearers new), alone
FLOORS=1,5,11 PLAY=8 run monsters_baked_phone $P --scenario $S/monsters_baked.mjs
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
