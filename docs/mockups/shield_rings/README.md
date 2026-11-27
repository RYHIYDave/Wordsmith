# The seven shields, each with its own ring (27 Nov 2026)

His pick, in the Godot cloud chat, 27 Nov 2026, asked whether to start a new task after the 20 weak melds: “Give the 7 shields their
own rings (Recommended)”. Branch `art/shield-rings`, from `art/meld-rules-check-20` at 5e234ccf (which is on the ship list; this one
builds on it: Parry's ring of blades and the same painter).

The page for his yes: https://claude.ai/artifact/1eQ6j6gft1UinPKybQY7qY (`page.py`, then `poster.py` for stills that show the ring;
`report.json`, `page.html`). NOTHING HERE IS LIVE WITHOUT HIS YES (pictures first).

## What

The ward circle each of Redoubt, Sanctuary, Aegis, Minefield, Riposte, Shieldwall and Carapace leaves rose as a plain ring (How art is
made 9). Now each is its own edge (fx_m52p_last110.gd `_shell_edge`), as it is laid (with a front going out under it) and as it stands:

- Redoubt: a wall of battlements, merlons and gaps lit on top; the inner wall brighter.
- Sanctuary: a ring of candles, lit one after another, flickering (its slow pulse gentled so they do not fade out).
- Aegis: interlocking hex plates, a shimmer running round.
- Minefield: a fuse, a spark racing along it throwing sparks, burnt black behind it.
- Riposte: crossed blades, hilts in the floor, glinting in turn (its little ticks on a ring gone).
- Shieldwall: heater shields standing rim to rim, a band down each, rims lit.
- Carapace: arched shell plates lapping over each other, lit along their backs.

The game's own Guarding ward (dotted ring, shield marks) is still drawn under each: the rune's own look.

## Checks

- `--cases=m52:redoubt,sanctuary,aegis,minefield,riposte,shieldwall,carapace,parry`: 9 checks, 0 wrong (16 cases, twist seen in all).
- Filmed after (`films/shells`) and before (the painter as at 5e234ccf, `films/shells_before`), no script errors.
- measure2.py: nothing covers the hero for a run of frames (cover_run 0 in all 21 sides).

## Also

- The film tool took any list beginning with Redoubt for its `redo` mode and filmed nothing (check_melds52.gd: now only `redo` or
  `redo:...`). Test tool only.
- Note for whoever reads the painters: the ground of every painter is redrawn only while some effect is alive (fx.gd `_alive`), so a
  standing ward animates while the fight goes on and holds its last frame when all is still. Unchanged.
