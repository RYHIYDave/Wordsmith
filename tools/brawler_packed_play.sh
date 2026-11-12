#!/bin/bash
# THE BRAWLER'S MOVES KEPT PACKED, PLAYED AND WEIGHED ON THE BUILT, BAKED PAGE (the Brawler memory chat, 11 Nov 2026; the queue's
# make-brawlers-eight-sides-fit-in-memory; render/baked.ts PACKS). As tools/eight_sides_play.sh: the build's dist/artifact.html
# wrapped as the site serves it, SERVED from dist/ with the heroes', sounds', Colossus's and townsfolk's files beside it.
#   node tools/build.mjs && git checkout Play.html && bash tools/brawler_packed_play.sh
# PLAYED (two at a time): his eight ways in a fight with a thumb, his pictures the bake's and his moves from his packs
# (sides_more_fight.mjs, BAKED=1); the regression's own of him (veteran_play.mjs).
# WEIGHED (each alone on the machine; MEM=0: not these): the same sitting as docs/mockups/eight_sides/BRING_IN.md, the Brawler in
# town and on floors 1 to 3 played by the bot: with his moves kept packed (the game as it is); and with every pack unpacked and
# none let go (PACKS=0: what he holds from eight sides without this).
# Each one's log is in shots/packed/<name>.log, the verdicts in shots/packed/summary.txt.
set -u
mkdir -p shots/packed
rm -f shots/packed/*.log shots/packed/summary.txt
PAGE=dist/wrapped.html
{
  printf '%s' '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>'
  printf '\n'
  cat dist/artifact.html
  printf '\n</body></html>'
} > $PAGE
P="--touch --size 844x390 --dpr 3"
S=tools/scenarios
run() {
  local name=$1; shift
  timeout 1500 node tools/playtest.mjs "$@" --file "$PAGE" --serve --out shots/packed/$name > shots/packed/$name.log 2>&1
  local bad=$(grep -c '!!' shots/packed/$name.log)
  local last=$(tail -n 1 shots/packed/$name.log | cut -c1-60)
  if [ "$bad" != "0" ]; then echo "PROBLEMS: $bad line(s) marked !!   $name"
  elif [ "$last" != "finished clean" ]; then echo "DID NOT FINISH CLEAN ($last)   $name"
  else echo "finished clean   $name"; fi
}
two() { while [ "$(jobs -rp | wc -l)" -ge 2 ]; do sleep 0.7; done; }
(
if [ "${PLAY:-1}" != "0" ]; then
two; BAKED=1 run sides_fight $P --scenario $S/sides_more_fight.mjs &
two; run veteran_play $P --scenario $S/veteran_play.mjs &
wait
fi
if [ "${MEM:-1}" != "0" ]; then
CLS=brawler FROM=1 TO=3 PLAY=40 SPEED=6 OUT=shots/packed/mem_packed.json run mem_packed $P --init tools/mem_probe.js --scenario $S/mem_floors.mjs
PACKS=0 CLS=brawler FROM=1 TO=3 PLAY=40 SPEED=6 OUT=shots/packed/mem_unpacked.json run mem_unpacked $P --init tools/mem_probe.js --scenario $S/mem_floors.mjs
fi
) 2>&1 | tee shots/packed/summary.txt
total=$(grep -c . shots/packed/summary.txt)
clean=$(grep -c '^finished clean ' shots/packed/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/packed/summary.txt
exit 1
