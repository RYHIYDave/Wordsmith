#!/bin/bash
# The six films, small enough for a phone.
cd /home/claude/wt/skills
export WIDTH=480 COLOURS=96
python3 tools/wild_films.py shots/wild/whirlwind_off shots/wild/whirlwind_on previews/wild/wild_whirlwind.gif 8-24,50-64 2 whirlwind > shots/wild/films.log 2>&1
WIDTH=420 COLOURS=72 python3 tools/wild_films.py shots/wild/leap_off shots/wild/leap_on previews/wild/wild_leap.gif 12-28 2 leap >> shots/wild/films.log 2>&1
python3 tools/wild_films.py shots/wild/volley_off shots/wild/volley_on previews/wild/wild_volley.gif 10-30 2 volley >> shots/wild/films.log 2>&1
python3 tools/wild_films.py shots/wild/trap_off shots/wild/trap_on previews/wild/wild_trap.gif 8-26 2 trap >> shots/wild/films.log 2>&1
python3 tools/wild_films.py shots/wild/orb_off shots/wild/orb_on previews/wild/wild_orb.gif 12-26 2 orb >> shots/wild/films.log 2>&1
python3 tools/wild_films.py shots/wild/warp_off shots/wild/warp_on previews/wild/wild_warp.gif 7-16x3,45-56x3 2 warp >> shots/wild/films.log 2>&1
echo done >> shots/wild/films.log
