#!/bin/bash
# THE PUBLISHED PAGE ITSELF, Version 25.3.3 (section 8 of the design notes, step 7): the release's dist/artifact.html wrapped as
# the site serves it (the site's <head> and reset, then the fragment), SERVED from dist/ with the heroes', sounds' and Colossus's
# files beside it as they are beside the published page, and the playtests of what this update changes played on it two at a time
# (his rule of 7 Nov 2026: test only what the change is about). The town's cost is measured alone, after.
#   node tools/build.mjs && bash tools/wrap2533.sh
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
# THE TOWN drawn in its still pictures: the same picture (41 places), the town played, tapped, its quest, and its sounds
two; run town_same $P --scenario $S/town_same.mjs &
# (town.mjs is NOT in this list: it is out of date, flagged the same 18 lines on 25.3.1's and 25.3.2's pages as on this one:
# the armourer has a task to give at the first E ("Armourer: a task (E)"), and the playtest expects his wares at once)
two; run towntap_phone $P --scenario $S/towntap.mjs &
two; run quest_town $P --scenario $S/quest_town.mjs &
# THE SMALL ART NOTES: the royal shadows and the masks in their fights (floor 20), the Moth's pulled-back picture, the rune
# marker, the packs; a new game's "Speak to the wordsmith" (act1_floor.mjs is for floors 6 to 15: not for 17 and 20)
two; run small_notes_fight $P --scenario $S/small_notes_fight.mjs &
two; run small_notes_packs $P --scenario $S/small_notes_packs.mjs &
two; run small_notes_moth $P --scenario $S/small_notes_moth.mjs &
two; run small_notes_rune $P --scenario $S/small_notes_rune.mjs &
two; run quest_marks_look $P --scenario $S/quest_marks_look.mjs &
# the game's main ways
two; run save --scenario $S/save.mjs &
two; run touch_wide $P --scenario $S/touch.mjs &
two; CLS=warrior run guide_phone_warrior $P --scenario $S/guide.mjs &
wait
# THE TOWN'S COST, alone: 30 s of the town at his phone's shape
run town_lag $P --scenario $S/town_lag.mjs
) 2>&1 | tee shots/wrap/summary.txt
total=$(grep -c . shots/wrap/summary.txt)
clean=$(grep -c '^finished clean ' shots/wrap/summary.txt)
if [ "$total" = "$clean" ]; then echo "ALL $total FINISHED CLEAN"; exit 0; fi
echo "$((total - clean)) OF $total DID NOT FINISH CLEAN:"
grep -v '^finished clean ' shots/wrap/summary.txt
exit 1
