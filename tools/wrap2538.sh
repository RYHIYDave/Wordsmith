#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.8 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds', Colossus's, townsfolk's AND MONSTERS'
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). 
#   node tools/build.mjs && bash tools/wrap2538.sh
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
# THE TEN NEW WORDS LIVE (the Ten words chat's playtest: every moment by the real rules, its look and its sound; the Lexicon's
# five pages and the book on the starting screen), and the words' other ways
two; run words10_live $C2 --scenario $S/words10_live.mjs &
two; run lexicon_phone $P --scenario $S/lexicon.mjs &
two; run words10_book_upright $U --scenario $S/words10_book.mjs &
two; CLS=warrior run words_warrior $P --scenario $S/words.mjs &
two; run look2_phone $P --scenario $S/look2.mjs &
# THE UNIQUE ITEMS, DARK (every switch of theirs off: the game as it was), and the Brawler's four ways with his eight sides off
two; PLAY=off run uniques_play_off $P --scenario $S/uniques_play_look.mjs &
two; run veteran_play $P --scenario $S/veteran_play.mjs &
two; OFF=1 run sides_more_fight_off $P --scenario $S/sides_more_fight.mjs &
# THE HEROES' NEW BAKE (the same pictures under a new mark: the words changed a file it reads): three of them taken in whole
two; CLS=mage run baked_mage $P --scenario $S/baked.mjs &
two; CLS=ranger run baked_ranger $P --scenario $S/baked.mjs &
two; CLS=tinkerer run baked_tinkerer $P --scenario $S/baked.mjs &
# 25.3.7's own, on this page: the townsfolk from their files, the Endless town
two; run townsfolk_baked $P --scenario $S/townsfolk_baked.mjs &
two; run rim_town_phone $C2 --scenario $S/rim_town.mjs &
# the game's main ways
two; run save --scenario $S/save.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
two; run towntap_phone $P --scenario $S/towntap.mjs &
wait
# THE FLOORS' MONSTERS FROM THEIR FILES, each alone (they time the game): every floor on a phone's screen, three on a desk's
FLOORS=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20 PLAY=8 run monsters_baked_phone $P --scenario $S/monsters_baked.mjs
FLOORS=6,13,17 PLAY=8 run monsters_baked_desk --size 960x540 --scenario $S/monsters_baked.mjs
# WHAT HAPPENS AT A NEW SCREEN NOW (his question of 11 Nov, 21:30), floors 6 and 11, alone
FLOORS=6,11 run new_screen $P --scenario $S/new_screen.mjs
# WHAT IS HELD FROM FLOOR TO FLOOR (memory is what froze his phone), floors 1 to 8 in one sitting, alone
FROM=1 TO=8 PLAY=30 SPEED=6 OUT=shots/wrap/mem_floors.json run mem_floors $P --init tools/mem_probe.js --scenario $S/mem_floors.mjs
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
