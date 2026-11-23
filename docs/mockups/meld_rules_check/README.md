# The 98 new melds against his Art Rulebook (23 Nov 2026)

His ask: “I need you to read the art and animations ruleset I've built for this game and run all the new melds against those
rules.” Read: his living doc “Wordsmith Art Rulebook” (https://claude.ai/artifact/Dq343Th9FFbpt9EiKfNyYe, rev 88; it has
rules the repo copy docs/art/RULEBOOK.md lacks, such as Monsters' “Action, like a movie”).

How: every meld film (the 52's and the 46's) at five moments (in front 0.62 s and 1.3 s, behind 3.4 s and 4.2 s, on a monster
6.2 s), at the game's own size (`rulesheet.py`), and a read of the painters (fx_m52paint.gd, fx_m52p_*.gd): their colours
against the friend's cyan and the enemy's pink, their shapes, their screen kicks and holds, and which moments each film told.

The report for him: https://claude.ai/artifact/QNsqwTYmHsxKbx4E9GHBzY (melds_rules_check.html). 47 of 98 break no rule; 51 break
at least one:

- Animations 7: the monster's look never played in 17 of the 46's films (Hornet, Quicksilver, Cluster, Double Tap, Redoubt,
  Bloodbloom, Lifeline, Detonator, Hair Trigger, Blastwave, Rapier, Riposte, Vendetta, Shieldwall, Rampage, Sanctuary, Aegis).
- How art is made 9 (no plain ball, box or ring): Time Bomb, Detonator, Bulwark, Fortress, Onrush, Charge, Earthquake, Vendetta,
  Lamprey, Fury, Aftermath, Double Tap; the storm clouds (Overcharge, Conduit, Seeker, Static, Jolt, Tempest, Fulgurite,
  Quicksilver on a monster); rings (Reverb, Ripple, Bullseye, Quickfuse, Momentum).
- Animations 1 (too small): Whipcrack, Rapier, Rampage, Reverb and Aftermath in front; Ambush, Blur, Juggernaut, Daze, Bedrock,
  Transfusion behind.
- Animations 4 (covering the hero): Staccato behind, Gale on a monster, Spree.
- Movement 7 (the hold on a heavy blow): none of the 98 holds; the game's own words do (fx.hold).
- Pillar 4, HIS CALL: six colours on the enemy's pink (Bloodbloom, Lamprey, Lifeline, Spree, Mayhem, Transfusion); five icy
  ones near the friend's cyan on a monster (Glide, Flash Freeze, Double Tap, Ripple, Quicksilver).
