#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.5 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds' and Colossus's
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). 
#   node tools/build.mjs && bash tools/wrap2535.sh
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
  timeout 1500 node tools/playtest.mjs "$@" --file "$PAGE" --serve --out shots/wrap/$name > shots/wrap/$name.log 2>&1
  local bad=$(grep -c '!!' shots/wrap/$name.log)
  local last=$(tail -n 1 shots/wrap/$name.log | cut -c1-60)
  if [ "$bad" != "0" ]; then echo "PROBLEMS: $bad line(s) marked !!   $name"
  elif [ "$last" != "finished clean" ]; then echo "DID NOT FINISH CLEAN ($last)   $name"
  else echo "finished clean   $name"; fi
}
two() { while [ "$(jobs -rp | wc -l)" -ge 2 ]; do sleep 0.7; done; }
(
# THE FLOORS' SCENE SOUNDS (sound batch 8): its own playtest; the world's sounds; the Colossus's (both batches are in now)
two; run scene_sounds $P --scenario $S/scene_sounds.mjs &
two; run world_sounds $P --scenario $S/world_sounds.mjs &
two; run colossus_sounds $C2 --scenario $S/colossus_sounds.mjs &
# floors that play them, as the regression plays floors: 3 (the furnace and the crank), 7, 10, 13 (the Hush's muffling)
two; DEPTH=3 run first5_floor3 $P --scenario $S/first5_floor.mjs &
two; DEPTH=7 FOES=1 run act1_floor7 --scenario $S/act1_floor.mjs &
two; DEPTH=10 FOES=1 run act1_floor10_phone $P --scenario $S/act1_floor.mjs &
two; DEPTH=13 FOES=1 run act2_floor13_upright $U --scenario $S/act1_floor.mjs &
# the game's main ways
two; run save --scenario $S/save.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
wait
# THE MEMORY SITTING, alone: floors 1 to 6 in one page (a floor's loop let go as it is left: what the page holds, written down)
FROM=1 TO=6 PLAY=30 SPEED=6 OUT=shots/wrap/mem_floors.json run mem_floors $P --init tools/mem_probe.js --scenario $S/mem_floors.mjs
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
