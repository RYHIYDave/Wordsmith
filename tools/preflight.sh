#!/bin/bash
# THE PRE-FLIGHT before a version is frozen: a chosen few of the regression's playtests, run as
# tools/regress.sh runs them (the same flags, the same verdict on each), on a page of the working
# tree, so that a playtest still holding a rule the version changes is mended before the copy is
# frozen. Not the regression: that still runs whole on the frozen copy.
#   node tools/build_to.mjs dist/pre.html
#   PAGE=dist/pre.html JOBS=2 bash tools/preflight.sh name name ...   (names as in tools/regress.sh)
# The logs go to shots/preflight/<name>.log; one line each, then a count.
cd "$(dirname "$0")/.."
PAGE=${PAGE:-dist/pre.html}
JOBS=${JOBS:-2}
mkdir -p shots/preflight
P="--touch --size 844x390 --dpr 3"
U="--touch --size 390x844 --dpr 3"
N="window.__dbg.screen.setTurnMode('upright')"
S=tools/scenarios
# (each name's line, taken from tools/regress.sh as it stands: its environment and its arguments)
line_of() { grep -E "run $1( |$)" tools/regress.sh | head -n 1 | sed -e 's/&[[:space:]]*$//' -e 's/^[[:space:]]*//'; }
one() {
  local name=$1
  local l; l=$(line_of "$name")
  if [ -z "$l" ]; then echo "NOT IN THE REGRESSION   $name"; return; fi
  # the environment before "run", the arguments after the name
  local envs=${l%%run *}
  local args=${l#*run $name}
  eval "env $envs timeout 900 node tools/playtest.mjs $args --file \"$PAGE\" --out shots/preflight/$name" > shots/preflight/$name.log 2>&1
  local bad; bad=$(grep -c '!!' shots/preflight/$name.log)
  local last; last=$(tail -n 1 shots/preflight/$name.log | cut -c1-60)
  if [ "$bad" != "0" ]; then echo "PROBLEMS: $bad line(s) marked !!   $name"
  elif [ "$last" != "finished clean" ]; then echo "DID NOT FINISH CLEAN ($last)   $name"
  else echo "finished clean   $name"; fi
}
export -f one line_of
export PAGE P U N S
printf '%s\n' "$@" | xargs -P "$JOBS" -I{} bash -c 'one {}' | tee shots/preflight/summary.txt
echo "$(grep -c '^finished clean' shots/preflight/summary.txt) of $(wc -l < shots/preflight/summary.txt) finished clean"
