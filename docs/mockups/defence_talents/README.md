# Defence in every talent tree

His ask, 27 Nov 2026: “Can you look at the classes we have, find the ones that don’t have any defensive options in their
talent tree and put some in.  And then look at our new defenses and make the classes defensive options include these new
systems”. Plan picked: “Build it as written (Recommended)”.

His changes after the first pictures:
- “Can you use more gamified language in the descriptions?  1 in every two is 50%, that sort of thing”: every card
  reworded with numbers.
- “Within 3 tiles is hard to understand for a player.  “Inside it:” could be better.  “While inside the smoke cloud”, or
  something like that”: Bodyguard and Smoke Screen reworded.
- “Also Soul Ward seems very strong”; his pick: “Cut the free barrier”. Soul Ward works only on the barrier cloth gives.

Switched on: “Yes, switch them on (Recommended)”.

## What is in it

New talents, each a small node off its own path (godot/scripts/talents.gd DEFENCE):

| Class | Talent | Card | Defence it uses |
|---|---|---|---|
| Ranger | Evasive | After a roll: at least 50% dodge chance for 2 seconds. | Dodge |
| Ranger | Counter Shot | Dodge a hit: your next arrow is a 100% critical hit and knocks the enemy back. | Dodge |
| Mage | Ice Shell | +20% of your life as barrier. When your barrier breaks, nearby enemies are frozen for 2 seconds. | Barrier |
| Mage | Warding Warp | Each Warp restores 25% of your barrier. | Barrier |
| Warlock | Soul Ward | Each cursed enemy that dies restores 10% of your barrier, overcharging it up to 150%. | Barrier |
| Warlock | Hellhide | In demon form: +100% armour and immune to knockback. | Armour |
| Tinkerer | Bodyguard | While your Golem is close to you, it takes 50% of the damage meant for you. | (the Golem) |
| Tinkerer | Smoke Screen | Blast Jump leaves a smoke cloud for 3 seconds. While inside the smoke cloud: at least 50% dodge chance. | Dodge |

Reworded to use the three defences (DEFENCE_WORDS):

| Class | Talent | Card |
|---|---|---|
| Warrior | Thick Skin | Below 50% life: +100% armour. |
| Warrior | Bulwark | +20% armour for each enemy near you, up to +100%. |
| Warrior | Shieldwall | When your barrier breaks, it explodes: nearby enemies are knocked back and stunned for 1 second. |
| Brawler | Guard Up | Fists up between punches: 50% less damage from the front. Dodge a hit: your next punch deals +100% damage. |

The switch: `talents.gd DEFENCE_TALENTS` (on). `--deftal=0` turns it off for a run.

## Checked

`xvfb-run -a godot --path godot --rendering-driver opengl3 -- --only=deftal --shots=<dir>`: 27 of 27 (the trees and
cards, and each talent working: 300 blows for Evasive's 50%, the freeze, the refill, armour doubled, the Golem's share,
the smoke's dodge and its end). `--only=defence`: 11 of 11. `--only=talents`: two lines wrong, #22 Leaping Chop and #66
Minefield, both wrong the same way on the released game (origin/main) too.

Pictures: defence_talent_cards.png (all 12 cards), defence_talents_working.png (each card beside it working).
