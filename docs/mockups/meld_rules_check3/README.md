# 20 more weak melds against his Art Rulebook, brought up (27 Nov 2026)

His ask, in the Godot cloud chat, 27 Nov 2026: “I’d like you to do another 20 weak meld checks”. Done in the same chat with Godot
4.7.2, on branch `art/meld-rules-check-20` (from `claude/sharp-lamport-ey7q0l` at 1edd9a79). Read: his living doc “Wordsmith Art
Rulebook” and docs/art/RULEBOOK.md (Animations 1, 4, 5, 7, 8; How art is made 9; Movement 7; Pillar 4).

The page for his yes: https://claude.ai/artifact/3efuV7xnu7FWuvGSR2jV79 (built by `page.py` from `report.json`, `page.html` and the
films). NOTHING HERE IS LIVE WITHOUT HIS YES (pictures first).

## Which 20

The 20 smallest in ../meld_rules_check2/ranking_pass2.json not already worked on 26 Nov (not among the 30 weakest, the second pass's
12, or the 26 monster moments): Lifeline, Second Wind, Juggernaut, Marrow, Hornet, Aftermath, Staccato, Whipcrack, Pressure Point,
Conduit, Rampage, Parry, Haunting, Gravewarden, Feeding Frenzy, Quickdraw, Riptide, Eddy, Seeker, Lancet.

## What was changed (report.json `weakest`: why each was weak and what was done)

- Moments that never played, now told by the rules and drawn: Juggernaut's slam on each blow and its ground tearing at a full frenzy
  (melds52_rules.gd `struck`, `wake`), Pressure Point's mark on the staggered one (melds52_rules.gd `_grounds`), Rampage's splash
  (melds46_rules.gd). The film sets a full frenzy behind for Juggernaut (check_melds52.gd).
- Drawn bigger, in their own colours and shapes, kicks and freezes where heavy: fx_m52p_precise.gd (Seeker, Juggernaut, Pressure Point,
  Quickdraw), fx_m52p_last110.gd (Lifeline, Hornet, Aftermath, Staccato, Whipcrack, Rampage, Parry, Feeding Frenzy, Lancet; the helper
  `_heartbeat`; Parry's guard a ring of standing blades, not a plain ring), fx_m52p_leech.gd (Second Wind, Marrow, Conduit: Conduit
  drew nothing of its own under OWN), fx_m52p_high.gd (Haunting's and Gravewarden's ghost reshaped in `_shade_figure`; his shade circles
  above his head; on a risen monster round it), fx_m52p_city.gd and fx_m52p_city2.gd (Riptide's and Eddy's swirl on the floor, not in
  the air over his feet; currents to the monster).

## Checks

- `--cases=m52:<the 20>`: 9 checks, 0 wrong; 40 cases (each in front and behind), twist seen in all 40.
- Filmed (`film20.sh`, `--cases=m52film:<ids>`), no script errors, each one's monster moment seen in all 20. Sheets: `sheet3.py`.
- `measure2.py` against the second pass's films (numbers.json): none covers the hero for a run of frames (cover_run 0 in all);
  at most a quarter of him for a blink. The whole-film sums move little either way: the Strike's own look fills most of each film, and
  this pass's changes are in the meld's own moment. The films are the evidence; the numbers only check cover.

## Found, not changed (report.json `found`)

- GAMEPLAY: with a barrier, Guarding in front tops up the barrier instead of giving a shield (hero.gd, words.gd DEFENCE_WORDS);
  Parry, Sanctuary, Aegis and Shieldwall wait on a fresh shield (melds46_rules.gd `step`), so with any barrier they do nothing.
  Asked him.
- Seven other shells (Redoubt, Sanctuary, Aegis, Minefield, Riposte, Shieldwall, Carapace) still lay a plain ring under their marks.

## Correction told to him

Mid-way he was told Gravewarden, Quickdraw and Hornet covered the hero. The measure says none of the 20 did for more than a blink;
what was wrong was Gravewarden's shade passing across him and Hornet's barbs floating off him on a monster (both fixed).
