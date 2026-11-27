# The Brawler's builds

His question, 27 Nov 2026, 11:42: “I’d like you to look at build diversity and classes combined with talents and uniques.
Which class would you say is the weakest in these regards?” The answer was the Brawler: his three paths all feed the one combo,
no talent changed how he fights, his elements were scattered, and The Last Round did nothing since his remake. Plan: “Yes, plan
it (Recommended)”.

His changes to the plan:
- “How can you hold to punch as it is a tap ability?”: Flurry became a tap, the Cannon Kick his push kick.
- “Shadow double is too close to the warlock”: Stepping Stones in its place.
- Then “Build it as written (Recommended)”, and after the film and the cards “Yes, switch them on (Recommended)” (by 12:32).
- “So using a jump swipe move now just makes him jump two more times?  Kind of a seriously long animation chain to locked
  into”: Stepping Stones made to chain on a swipe again; “Nah I don’t like it.  Something else”; his pick: “Momentum”; then
  “Yes, ship it all (Recommended)” (by 12:50).

## What is in it (godot/scripts/heroes/brawler3.gd, on)

New stones, one under each globe's first stone:

| Path | Talent | Card |
|---|---|---|
| Punch | Flurry | Every tap throws 3 quick punches instead of 1, each for 60% damage. |
| Jump | Momentum | Every flying blow that lands lights a new globe of its kind, so you can fly again: each one still costs a jump. |
| Kick | Cannon Kick | Your push kick (the second kick in a row) sends the enemy flying like a cannonball: everything it hits on the way takes 60% damage and is knocked aside. |

A stance in the middle of each globe, only one of the three:

| Globe | Stance | Card |
|---|---|---|
| Jump | Fire Stance | Your flying blows leave the ground burning where you land for 3 seconds. |
| Kick | Lightning Stance | Every kick that lands arcs lightning to the 2 nearest enemies for 50% damage. |
| Punch | Poison Stance | Every punch poisons what it hits. |

Building on a stance: Viper Jab (with Poison Stance, a poisoned enemy knocked into another spreads its poison to it), Thunder Knee
(with Lightning Stance, an enemy the lightning kills arcs it on to the next). The Last Round: “Swipe with 3 globes lit: your
flying blow costs no jump.”

## Checked

`xvfb-run -a godot --path godot --rendering-driver opengl3 -- --only=bbuilds --shots=<dir>`: 23 of 23 (the tree and its cards,
one stance only; Flurry's three punches, quicker, and with Quick Hands three globes; the Cannon Kick's flight through two, with
Wall Slam held; Momentum's globe back, none without it or on a miss; Fire Stance's burning floor, none without it; Poison Stance,
and Viper Jab's poison passed on; Lightning Stance's two arcs, and Thunder Knee passing on a kill; The Last Round's free swipe and
its card). `--only=brawler2`: 13 of 13.

Pictures: brawler_builds_cards.png (the tree and every card), brawler_builds.mp4 (each in the game, 19 s).
