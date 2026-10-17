#!/bin/bash
# PLAYTESTS OF THE REGRESSION RUN AGAIN BY NAME (section 8 of the design notes, step 4: "run it alone twice as it stood,
# on the same page"). Each named playtest is taken from tools/regress.sh as it stands (its settings and screen size)
# and played on PAGE, JOBS at a time (1: alone), ROUNDS times; each run's log in shots/rerun/<name>_<round>.log, the
# verdicts in shots/rerun/summary.txt.
#   cd <the frozen copy> && PAGE=dist/copy.html JOBS=1 ROUNDS=2 bash tools/rerun.sh town dungeon_pc ...
set -u
PAGE=${PAGE:-dist/copy.html}
JOBS=${JOBS:-1}
ROUNDS=${ROUNDS:-2}
mkdir -p shots/rerun
P="--touch --size 844x390 --dpr 3"
U="--touch --size 390x844 --dpr 3"
N="window.__dbg.screen.setTurnMode('upright')"
F="window.__dbg.setAim('face')"
S=tools/scenarios
ROUND=1
run() {
  local name=$1; shift
  timeout 900 node tools/playtest.mjs "$@" --file "$PAGE" --out shots/rerun/${name}_$ROUND > shots/rerun/${name}_$ROUND.log 2>&1
  local bad=$(grep -c '!!' shots/rerun/${name}_$ROUND.log)
  local last=$(tail -n 1 shots/rerun/${name}_$ROUND.log | cut -c1-60)
  if [ "$bad" != "0" ]; then echo "PROBLEMS: $bad line(s) marked !!   ${name} (round $ROUND)"
  elif [ "$last" != "finished clean" ]; then echo "DID NOT FINISH CLEAN ($last)   ${name} (round $ROUND)"
  else echo "finished clean   ${name} (round $ROUND)"; fi
}
(
for ROUND in $(seq 1 "$ROUNDS"); do
  for name in "$@"; do
    line=$(grep -E "(^|[[:space:]])run[[:space:]]+$name[[:space:]]" tools/regress.sh | head -1 | sed -E 's/[[:space:]]*&[[:space:]]*$//; s/#.*$//')
    if [ -z "$line" ]; then echo "NOT FOUND IN regress.sh   $name"; continue; fi
    while [ "$(jobs -rp | wc -l)" -ge "$JOBS" ]; do sleep 0.7; done
    eval "$line" &
    sleep 1
  done
  wait
done
) 2>&1 | tee -a shots/rerun/summary.txt
