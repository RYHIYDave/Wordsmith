#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.2 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds' and Colossus's
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). The memory sitting runs alone, after, since it measures.
#   node tools/build.mjs && bash tools/wrap2532.sh
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
# the endless splash behind the town's loading screen; the loading screen's ring; the loading screen between floors
two; run endless_opens $P --scenario $S/endless_opens.mjs &
two; run endless_splash_look $P --scenario $S/endless_splash_look.mjs &
two; run loading_ring_look $P --scenario $S/loading_ring_look.mjs &
two; run floor_loading $P --scenario $S/floor_loading.mjs &
# the Quarry, the Ledge Road, Echo Canyon and a city floor repainted (their switches on in the page itself)
two; DEPTH=6 run repaint_floor6 $C --scenario $S/canyon_repaint.mjs &
two; DEPTH=7 run repaint_floor7 $C --scenario $S/canyon_repaint.mjs &
two; DEPTH=8 run repaint_floor8 $C --scenario $S/canyon_repaint.mjs &
two; DEPTH=11 run repaint_floor11 $C --scenario $S/canyon_repaint.mjs &
# the floors the art review's tweaks touch, played as the regression plays them: 3 (the stone lifted), 6 (the hewn blocks), 13
# (the corn), the HUD (the globes), and the outdoor floors with their foes
two; DEPTH=3 run first5_floor3 $P --scenario $S/first5_floor.mjs &
two; DEPTH=6 FOES=1 run act1_floor6_phone $P --scenario $S/act1_floor.mjs &
two; DEPTH=7 FOES=1 run act1_floor7 --scenario $S/act1_floor.mjs &
two; DEPTH=8 FOES=1 run act1_floor8_upright $U --scenario $S/act1_floor.mjs &
two; DEPTH=11 FOES=1 run act2_floor11_phone $P --scenario $S/act1_floor.mjs &
two; DEPTH=13 FOES=1 run act2_floor13_upright $U --scenario $S/act1_floor.mjs &
two; CLS=warrior run hud_phone $P --scenario $S/hud.mjs &
# the sounds (the attack shouts' file, and the sounds let go from floor to floor) and the game's main ways
two; run world_sounds $P --scenario $S/world_sounds.mjs &
two; run colossus_sounds $P --scenario $S/colossus_sounds.mjs &
two; run save --scenario $S/save.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
wait
# THE MEMORY SITTING, alone: floors 1 to 6 in one page, the bot playing each; what the page holds written down
FROM=1 TO=6 PLAY=30 SPEED=6 OUT=shots/wrap/mem_floors.json run mem_floors $P --init tools/mem_probe.js --scenario $S/mem_floors.mjs
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
