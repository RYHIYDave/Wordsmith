#!/bin/bash
# THE TINKERER AND THE BRAWLER FROM EIGHT SIDES, PLAYED ON THE BUILT, BAKED PAGE (the chat that brought them in, 11 Nov 2026; the
# queue's bring-in-tinkerer-brawler-eight-sides: "play him on the built, baked page: his blows the eight ways against enemies,
# his dodge, props broken by a blow thrown straight left or right"). As tools/wrap2535.sh: the build's dist/artifact.html
# wrapped as the site serves it, SERVED from dist/ with the heroes', sounds' and Colossus's files beside it, and the playtests
# of what this change is about played on it two at a time (his rule of 7 Nov 2026: test only what the change is about).
#   node tools/build.mjs && git checkout Play.html && bash tools/eight_sides_play.sh
# Each one's log is in shots/eight/<name>.log, the verdicts in shots/eight/summary.txt. Then, alone, what the page holds with
# each of the two played floor after floor (MEM=0: not those).
set -u
mkdir -p shots/eight
rm -f shots/eight/*.log shots/eight/summary.txt
PAGE=dist/wrapped.html
{
  printf '%s' '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>'
  printf '\n'
  cat dist/artifact.html
  printf '\n</body></html>'
} > $PAGE
P="--touch --size 844x390 --dpr 3"
L="--touch --size 1126x520 --dpr 3"
S=tools/scenarios
run() {
  local name=$1; shift
  timeout 1500 node tools/playtest.mjs "$@" --file "$PAGE" --serve --out shots/eight/$name > shots/eight/$name.log 2>&1
  local bad=$(grep -c '!!' shots/eight/$name.log)
  local last=$(tail -n 1 shots/eight/$name.log | cut -c1-60)
  if [ "$bad" != "0" ]; then echo "PROBLEMS: $bad line(s) marked !!   $name"
  elif [ "$last" != "finished clean" ]; then echo "DID NOT FINISH CLEAN ($last)   $name"
  else echo "finished clean   $name"; fi
}
two() { while [ "$(jobs -rp | wc -l)" -ge 2 ]; do sleep 0.7; done; }
(
# THE BRAWLER'S EIGHT WAYS IN A FIGHT, his pictures the bake's: its own playtest; and the regression's own of him with a thumb
two; BAKED=1 run sides_fight $P --scenario $S/sides_more_fight.mjs &
two; run veteran_play $P --scenario $S/veteran_play.mjs &
# EACH FROM ALL EIGHT SIDES ON FLOOR 11, from the bake (the Tinkerer chat's own pictures, made again on this page: to look at),
# and a move of each at its blow, thrown each of the eight ways (his cross; her vial tossed)
two; AT=40,57 WAIT=14000 MODE=sides CLS=tinkerer CLIP=70x78 UP=25 OUT=shots/eight/look_t run look_tinkerer_sides $L --scenario $S/sides_more_look.mjs &
two; AT=40,57 WAIT=14000 MODE=sides CLS=brawler CLIP=70x78 UP=25 OUT=shots/eight/look_b run look_brawler_sides $L --scenario $S/sides_more_look.mjs &
two; AT=40,57 WAIT=14000 MODE=moves CLS=tinkerer CLIP=130x104 UP=28 OUT=shots/eight/moves_t run look_tinkerer_moves $L --scenario $S/sides_more_look.mjs &
two; AT=40,57 WAIT=14000 MODE=moves CLS=brawler CLIP=130x104 UP=28 OUT=shots/eight/moves_b run look_brawler_moves $L --scenario $S/sides_more_look.mjs &
# the heroes' bake is a new one for every hero: a new player's first dungeon with the Warrior, and the game's touch ways
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
wait
if [ "${MEM:-1}" != "0" ]; then
# WHAT THE PAGE HOLDS, each alone: the Brawler and the Tinkerer played by the bot, floors 1 to 3 in one page
CLS=brawler FROM=1 TO=3 PLAY=40 SPEED=6 OUT=shots/eight/mem_brawler.json run mem_brawler $P --init tools/mem_probe.js --scenario $S/mem_floors.mjs
CLS=tinkerer FROM=1 TO=3 PLAY=40 SPEED=6 OUT=shots/eight/mem_tinkerer.json run mem_tinkerer $P --init tools/mem_probe.js --scenario $S/mem_floors.mjs
fi
) 2>&1 | tee shots/eight/summary.txt
total=$(grep -c . shots/eight/summary.txt)
clean=$(grep -c '^finished clean ' shots/eight/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/eight/summary.txt
exit 1
