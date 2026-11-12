#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.10 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds', Colossus's, townsfolk's AND MONSTERS'
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). 
#   node tools/build.mjs && bash tools/wrap25310.sh
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
# THE CAMP'S TOUCHES (main.ts spotAt: a name touched at the camp's own height; its GATE opens nothing), a desk and a phone
two; run camp_tap_desk --size 960x540 --scenario $S/camp_tap.mjs &
two; run camp_tap_phone $P --scenario $S/camp_tap.mjs &
# the first town's services and touches as before (town.mjs brought up to date on the branch), and the Shaft's Rim's gate as before
two; run town_desk --scenario $S/town.mjs &
two; run town_phone $U --scenario $S/town.mjs &
two; run towntap_phone $P --scenario $S/towntap.mjs &
two; run rim_town_phone $C2 --scenario $S/rim_town.mjs &
two; run rim_town_desk --size 960x540 --scenario $S/rim_town.mjs &
two; run endless_look_desk --scenario $S/endless_look.mjs &
two; run endless_look_phone $P --scenario $S/endless_look.mjs &
# THE BRAWLER'S HELD KICK UNDER AUTO AIM (game.ts vetAimOf): his taps, holds and swipes with a thumb; auto aim's tap and hold far
# from every monster; his fight as the eight-sides chat plays it (his eight sides off, as in the game)
two; run veteran_play $P --scenario $S/veteran_play.mjs &
two; CLS=brawler run autoaim_brawler $P --scenario $S/autoaim.mjs &
two; OFF=1 run sides_more_fight_off $P --scenario $S/sides_more_fight.mjs &
# the game's main ways
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
