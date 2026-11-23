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

## Fixed (23 Nov 2026)

Every finding above is fixed, and all 98 were filmed again and checked again (every moment of the docs told, every film's
monster look shown; `peaks.py` takes each film's frames where the meld's own colours show most, to look at):

- The monster's look: the films' third step (check_melds52.gd) gives the carrier a monster's life (FOE_LIFE), brings it low or
  kills it for what each waits on (FOE_LOW, FOE_DIES), makes certain what each waits on (FOE_TUNE), and has him strike back.
  Real bugs fixed with it: Doubletap and Vendetta could never land a first critical as a monster (foe_melds46.gd: each Precise
  meld's own `foeCrit`), Quicksilver's monster look was never told, Duelist's and Needle's set up in the film.
- Shapes (fx_m52kit.gd `_shard`, `_stone`, `_disc`, `_curl`, `_front`, `_reticle`): Time Bomb an iron bomb with a fuse, Detonator
  a clinging charge, Bulwark's riveted stud on the shell's rim, Fortress's standing stones, Earthquake's heaved slabs, Onrush's
  tapering speed lines, Charge's and Aftermath's smoke curls, Vendetta's scored gashes, Fury's flame tongues, Doubletap's star
  glints, Momentum's coil, Cluster's round bomblets, the wisps as streaks; the rings as sound (Reverb), water (Ripple), shock
  fronts (Blastwave, Rampage, Juggernaut) and a target's sight (Bullseye). The storm clouds are the game's own Lightning look,
  left for his say.
- Big: Whipcrack's lash, Rapier's flurry, Juggernaut, Blur, Bedrock, Transfusion, Ambush.
- Off the hero: Staccato, Gale on a monster, Spree.
- The hold (fx_melds52.gd HOLDS): every Heavy and Volatile landing and blast, Cataclysm's star.
- Colours, at his “Yes”: Bloodbloom #bf1d1d, Mayhem #e61c26, Lamprey #ec7771, Transfusion #b25b55, Lifeline #f59f87, Spree
  #fa975a (stones redrawn, ../meld_runes2/design.py); the five icy ones in Frost's #2e6cc8 when a monster's (fx_m52kit.gd ICY).

The films, republished: https://claude.ai/artifact/QksZWmUCHKhmpZMbMwETKq (52) and https://claude.ai/artifact/8xKRFHAjeV9kVnwiBCiSKH (46).
Melds52.ON stays off until his yes.
