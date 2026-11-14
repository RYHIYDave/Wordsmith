#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.17 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds', Colossus's, townsfolk's AND MONSTERS'
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). 
#   node tools/build.mjs && bash tools/wrap25317.sh
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
# 25.3.17: THE SHIP LIST. The Bells' loot at the last bell rung (fix/bells-loot-at-last-bell), on floors 11 and 14
two; DEPTH=11 run act2_bells11_phone $P --scenario $S/act2_bells.mjs &
two; DEPTH=14 run act2_bells14 --scenario $S/act2_bells.mjs &
# the Brawler from eight sides (build/brawler-on): his fight every way from his packs; the heroes baked again, his and the two
# whose moves are new (design/swap-moves-mage-ranger), every frame from its sheet
two; BAKED=1 run sides_fight $P --scenario $S/sides_more_fight.mjs &
two; CLS=brawler run sheet_frames_brawler $P --scenario $S/sheet_frames.mjs &
two; CLS=mage run sheet_frames_mage $P --scenario $S/sheet_frames.mjs &
two; CLS=ranger run sheet_frames_ranger $P --scenario $S/sheet_frames.mjs &
two; run veteran_play $P --scenario $S/veteran_play.mjs &
# the Mage's and the Ranger's moves to swap: her attacks page with CHANGE, and both at work in the practice room
two; run swap_moves_attacks $P --scenario $S/swap_moves_attacks.mjs &
two; CLS=mage ONLY=1,3,5 run swap_moves_mage $C2 --scenario $S/swap_moves_film.mjs &
two; CLS=ranger ONLY=1,3,5 run swap_moves_ranger $C2 --scenario $S/swap_moves_film.mjs &
# the eight new melds, each in play front and behind, its moments counted (now with their sounds)
for L in siphon cauterize forking shiver sunder fervor rimeward implode; do two; LOOK=$L FRAMES=0 run melds8_$L $C --scenario $S/melds8_play.mjs & done
two; run words10_pouch $C2 --scenario $S/words10_pouch.mjs &
# lightning's arcs keep jumping; melded words on monsters; Set 1 at work; the uniques in play
two; run arc_chain $C --scenario $S/arc_chain_look.mjs &
two; run foe_melds $C2 --scenario $S/foe_melds_look.mjs &
two; LOOK=star run set1_star $C --scenario $S/set1_look.mjs &
two; LOOK=knell run set1_knell $C --scenario $S/set1_look.mjs &
two; LOOK=tome run uniques_play_tome $C --scenario $S/uniques_play_look.mjs &
two; DEPTH=3 SECS=300 run bot_warrior --hash "bot=warrior&seed=11" --scenario $S/action_bot.mjs &
# the game's main ways
two; run save --scenario $S/save.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; run towntap_phone $P --scenario $S/towntap.mjs &
two; run townsfolk_baked $P --scenario $S/townsfolk_baked.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
wait
# THE FLOORS' MONSTERS FROM THEIR FILES (baked again: floor 18's glass Brawler from his eight sides), alone
FLOORS=1,6,11,18 PLAY=8 run monsters_baked_phone $P --scenario $S/monsters_baked.mjs
# WHAT IS HELD FROM FLOOR TO FLOOR as the Brawler, from his packs (memory is what froze his phone), alone
CLS=brawler FROM=1 TO=3 PLAY=40 SPEED=6 OUT=shots/wrap/mem_brawler.json run mem_brawler $P --init tools/mem_probe.js --scenario $S/mem_floors.mjs
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
