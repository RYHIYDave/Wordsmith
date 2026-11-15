#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.20 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds', Colossus's, townsfolk's AND MONSTERS'
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). 
#   node tools/build.mjs && bash tools/wrap25320.sh
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
# 25.3.20: ENDLESS MODE'S TABLET SHARDS AND FINAL BOSS, on at his word (build/endless-final-boss): the key in the Rim, his fight in
# the saddle, on foot, his death and drops
two; run endless_key $C2 --scenario $S/endless_key_look.mjs &
two; run final_fight $C2 --scenario $S/final_fight_look.mjs &
two; run final_foot $C2 --scenario $S/final_foot_look.mjs &
two; run final_death $C2 --scenario $S/final_death_look.mjs &
# FLOOR 9'S SIDE BOSSES (design/f9-side-bosses) and THE CENSOR MADE AGAIN (design/censor-redo)
two; BOSS=warchief SECS=30 run f9_warchief $P --scenario $S/f9_bosses_fight.mjs &
two; BOSS=mistwolf SECS=30 run f9_mistwolf $P --scenario $S/f9_bosses_fight.mjs &
two; run f9_hunt $P --scenario $S/f9_hunt_shot.mjs &
two; SECS=30 run censor2 $P --scenario $S/censor2_fight.mjs &
# THE HEROES BAKED AGAIN: the cards facing down-right, the Warrior's bascinet, the Mage's four staves
two; run hero_cards_baked $P --scenario $S/hero_cards_baked.mjs &
two; CLS=warrior run baked_warrior $P --scenario $S/baked.mjs &
two; CLS=mage run baked_mage $P --scenario $S/baked.mjs &
two; run staff_swap --scenario $S/staff_swap_baked.mjs &
# ENDLESS WITHOUT THE STORY; the save's Normal death (fix/save-normal-death); the game's main ways
two; run save --scenario $S/save.mjs &
two; run level_music --scenario $S/level_music.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; run towntap_phone $P --scenario $S/towntap.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
wait
# THE FLOORS' MONSTERS FROM THEIR FILES (baked again: floor 9's two side bosses, the Censor), alone
FLOORS=1,9,15 PLAY=8 run monsters_baked_phone $P --scenario $S/monsters_baked.mjs
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
