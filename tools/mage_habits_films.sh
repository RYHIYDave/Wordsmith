#!/bin/bash
# The mage's habits in a fight from her guard, as he saw them and big and wild (tools/scenarios/mage_habits_wild.mjs).
cd /home/claude/wt/skills
OFF=1 node tools/playtest.mjs --file dist/wild.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/mage_habits_wild.mjs --out shots/wild/habits_off > shots/wild/habits_off.log 2>&1
node tools/playtest.mjs --file dist/wild.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/mage_habits_wild.mjs --out shots/wild/habits_on > shots/wild/habits_on.log 2>&1
echo done > shots/wild/habits_done
WIDTH=480 COLOURS=96 python3 tools/wild_films.py shots/wild/habits_off shots/wild/habits_on previews/wild/wild_habits.gif 72-100 2 habits
