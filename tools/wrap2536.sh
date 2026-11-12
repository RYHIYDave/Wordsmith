#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.6 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds' and Colossus's
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). 
#   node tools/build.mjs && bash tools/wrap2536.sh
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
# THE TINKERER FROM EIGHT SIDES, baked: her baked pictures fetched and none failed; her seen the eight ways; her played
two; CLS=tinkerer run baked_tinkerer $P --scenario $S/baked.mjs &
two; run heroes_eight --size 844x390 --dpr 2 --scenario $S/heroes_eight.mjs &
two; CLS=tinkerer run dungeon_upright $U --scenario $S/dungeon.mjs &
two; CLS=tinkerer run look2_phone $P --scenario $S/look2.mjs &
two; CLS=tinkerer run guide_pc_tinkerer --scenario $S/guide.mjs &
# THE BRAWLER, his switch off: as he was (his baked pictures, his play); THE WARRIOR with the weapons' art merged, unseen
two; CLS=brawler run baked_brawler $P --scenario $S/baked.mjs &
two; run veteran_play $P --scenario $S/veteran_play.mjs &
two; CLS=warrior run baked_warrior $P --scenario $S/baked.mjs &
# THE UNIQUE ITEMS, dark: their own look page still runs (it sets its switch itself); THE TOWN with the townsfolk's art merged, unseen
two; run uniques_look --size 960x540 --scenario $S/uniques_look.mjs &
two; run town_same $P --scenario $S/town_same.mjs &
two; run towntap_phone $P --scenario $S/towntap.mjs &
two; run quest_town $P --scenario $S/quest_town.mjs &
# the sounds and the game's main ways
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
