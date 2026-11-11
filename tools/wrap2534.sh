#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.4 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds' and Colossus's
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). 
#   node tools/build.mjs && bash tools/wrap2534.sh
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
# THE MAGE, redrawn and baked: the baked pictures fetched and none failed; her class card; her played in the dungeon, upright
# and wide, with her words, her pages; the three guides' first steps as her
two; CLS=mage run baked_mage $P --scenario $S/baked.mjs &
two; run heroes_eight --size 844x390 --dpr 2 --scenario $S/heroes_eight.mjs &
two; CLS=mage run dungeon_upright $U --scenario $S/dungeon.mjs &
two; CLS=mage run words_mage --scenario $S/words.mjs &
two; CLS=mage run look_upright $U --scenario $S/look.mjs &
two; CLS=mage run look2_phone $P --scenario $S/look2.mjs &
two; CLS=mage run guide_pc_mage --scenario $S/guide.mjs &
# THE COLOSSUS'S FIGHT SOUNDS (sound batch 7): every file fetched and heard; his waking, his slams, his gaze, phase 3, his death
two; run colossus_sounds $C2 --scenario $S/colossus_sounds.mjs &
two; run colossus_wake $C2 --scenario $S/colossus_wake.mjs &
two; run colossus_slams $C2 --scenario $S/colossus_slams.mjs &
two; run colossus_gaze $C2 --scenario $S/colossus_gaze.mjs &
two; run colossus_phase3 $C2 --scenario $S/colossus_phase3.mjs &
two; run colossus_death $C2 --scenario $S/colossus_death.mjs &
# the sounds of the world (the sounds' mark and packs changed) and the game's main ways (save begins as a mage)
two; run world_sounds $P --scenario $S/world_sounds.mjs &
two; run save --scenario $S/save.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
wait
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
