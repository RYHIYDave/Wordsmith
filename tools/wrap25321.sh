#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.21 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
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
# 25.3.21: THE WARRIOR'S MOVES, every one, each weapon and each change (his words: “make sure all the animations for the warrior
# are correct”); his swipes and Twin Axes each their own, filmed; his group from the bake
two; OUT_DIR=shots/wrap/wmoves run warrior_moves --size 844x390 --dpr 2 --scenario $S/warrior_moves_look.mjs &
two; OUT_DIR=shots/wrap/swipes run swipes_film --size 844x390 --dpr 2 --scenario $S/swipes_film.mjs &
two; CLS=warrior run baked_warrior $P --scenario $S/baked.mjs &
# 25.3.21: NO CONSTANT SOUND BUT THE MUSIC (the sound chat's fifteenth batch): the sounds' index and packs, the town, the floors
two; run world_sounds --scenario $S/world_sounds.mjs &
two; run sounds_town --scenario $S/sounds_town.mjs &
two; run level_music --scenario $S/level_music.mjs &
# 25.3.21: A BOSS THE PAINTER PAINTS SHOWN BY HIS NEAREST PAINTED FRAME (render/render.ts PAINTER_STANDS_IN): the floors' monsters
two; FLOORS=1,3,9 PLAY=8 run monsters_baked_phone $P --scenario $S/monsters_baked.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; run towntap_phone $P --scenario $S/towntap.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
wait
# (THE CHAINED ONE'S FIGHT, alone, its frames timed: his words, “Also got a big lag spike in the chained one’s fight”)
SECS=30 run chained_lag $P --scenario $S/chained_lag.mjs
) | tee shots/wrap/summary.txt
n=$(grep -c . shots/wrap/summary.txt); bad=$(grep -vc '^finished clean' shots/wrap/summary.txt)
if [ "$bad" = "0" ]; then echo "ALL $n FINISHED CLEAN"; else echo "$bad OF $n DID NOT FINISH CLEAN:"; grep -v '^finished clean' shots/wrap/summary.txt; fi
