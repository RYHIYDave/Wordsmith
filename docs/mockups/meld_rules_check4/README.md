# The third 20 weak melds against his Art Rulebook (27 Nov 2026)

His pick, in the Godot cloud chat, 27 Nov 2026, asked whether to start a new task after the seven shields: “Check 20 more weak melds
(Recommended)”. Branch `art/meld-rules-check-20b`, from `art/shield-rings` at f977e59f (on the ship list; this builds on it).

The page for his yes: https://claude.ai/artifact/YHujE9qdEGeNP2fFa19ccD (`page.py`, `page.html`, `report.json`). HIS YES TO THE PAGE,
27 Nov 2026: “Yes, bring them in (Recommended)”.

## Which 20

The next 20 smallest in ../meld_rules_check2/ranking_pass2.json not worked before (not the 30 weakest, the second pass's 12, the 26
monster moments, the second 20, or the seven shields): Noose, Ambush, Manacle, Longspear, Detonator, Pin, Ghoul, Tombstone, Horizon,
Strangler, Gravity, Dragnet, Deadeye, Earthquake, Mire, Sundial, Refrain, Swarm, Timeslip, Skewer.

## Changed (seven; report.json `weakest`)

- Detonator: behind, its mark and its twice-as-big blast never played: the film killed the pack on the first blow. The film
  (check_melds52.gd) now lets the mark land and the marked one fall to the second blow. Nothing in the game changed for it.
- Gravity: its longer stun on what it drags in never played: the film's pack was never stunned (now in STUNNED). Its crater now caves
  the floor: cracks, a dark sunk middle, a glow (fx_m52p_city.gd).
- Horizon: an event horizon where it holds them, a dark disc, burning rim, light dragged in (fx_m52p_city.gd).
- Sundial: its own dial over each one it slows, the shadow sweeping round and slowing to a stop (fx_m52p_high.gd `_dial`, sign "dial").
- Tombstone: the gravestone half again as big, more dust (fx_m52p_high.gd `_tomb`).
- Noose: thicker twisted rope, bigger knot, two-strand loop, a pulse as it bites (fx_m52p_high.gd `_noose`).
- Swarm: red shards at the heads of thicker streaks; its drink a thicker stream with a glow (fx_m52p_city2.gd).

## Left as they are (thirteen; report.json `left`)

Each already has its own look, big enough, and breaks no rule. His word of 26 Nov: “Don’t create changes if they don’t need them”.
The plain rings in some films are the runes' own (Heavy's stun ring, Binding's root ring, Stilling's dotted ring), as decided before.

Found and not changed: the city painter has a look for “timeslip:quick”, but Timeslip's rules never tell such a moment (its twist is
its hands); nothing to show.

## Checks

- `--cases=m52:<the 20>`: 9 checks, 0 wrong; 40 cases, twist seen in all 40.
- Filmed before (`films/w20c_before`) and after (`films/w20c_after`), no script errors; every moment each has told in its film.
- measure2.py on the seven changed: nothing covers the hero for a run of frames (cover_run 0).
