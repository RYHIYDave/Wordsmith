# Painting the 52 melds to the game's standard (his word, 23 Nov 2026: “Do the rest, but check your work”)

The first animations (fx_melds52.gd's rings and sparks) fell short of the game's own melds (side by side:
https://claude.ai/artifact/WXGxciiNxtTFwtHMc7VUbP). Each is now painted beat by beat as fx_melds8.gd paints its own:
godot/scripts/fx_m52kit.gd (the brushes), one painter per rune group (fx_m52paint.gd Twin's; fx_m52p_<group>.gd the rest),
handed the rules' `m52` tellings by fx_melds52.gd.

How each group is checked: `--only=words --cases=m52film:<ids>` (--fixed-fps 30) films it; the run prints the moments each
film's rules told (`MELDS52 TOLD`), every moment of the animation doc must be there; close-up frames of each moment are
looked at beside Forking, Siphon, Eruption and Shatter; what falls short is fixed and filmed again.

| Group | Painted | Filmed and looked at |
|---|---|---|
| Twin (6) | yes | yes (his "Do the rest") |
| Leech (5) | yes (fx_m52p_leech.gd) | yes: every moment told in its film; Coldblood, Conduit, Second Wind, Marrow made bolder after the first look; wisps dark-edged |
| Volatile (2) | yes (fx_m52p_leech.gd) | yes |
| Precise (6) | yes (fx_m52p_precise.gd) | yes: every moment told; Brand's symbol, Quickdraw's glint, Pressure Point's needles enlarged after the first look |
| Frenzied (6) | yes (fx_m52p_precise.gd) | yes: every moment told; Blur's streaks doubled |
| Guarding (6) | yes (fx_m52p_guard.gd) | yes: every moment told (the films raise his shield as the monster comes); the shield's dressing sized to the game's own shell and made bolder after two looks |
| Lasting (7) | yes (fx_m52p_last.gd) | yes: every moment told; Momentum's band, Canker's and Permafrost's marks, Bedrock's ring and the dunes made bolder after the first look |
| Fleeting (7) | yes (fx_m52p_last.gd) | yes: every moment told (the films walk him aside for Blink and Tailwind, seen only as he moves); Blink's after-images drawn as his own picture, pixel for pixel, in its pale light; Tailwind a ribbon along where he went; Haymaker's arc and Flashfire's flare made bigger |
| Vast (7) | yes (fx_m52p_vast.gd) | yes: every moment told; the storm cloud remade after the first look (it drew as a black band); Stormfront's threads showed nothing until its rule linked the whole crowd within the blow's reach, as its doc says (“One hit links the whole crowd”); Miasma's haze, Gale's gusts, Cataclysm's star and the Earthquake round him made bolder |

All 52 filmed together once every group was done (`--cases=m52film`, every moment told, no script errors; the rules check
`--cases=m52` 6 checks, 0 wrong) and put on one page for his yes: https://claude.ai/artifact/QksZWmUCHKhmpZMbMwETKq
(made by page.py from the films). Melds52.ON stays off until he says yes.

## The last 46 of floors 1 to 10 (The Last Floor 1–10 Melds)

Painted by godot/scripts/fx_m52p_last110.gd from the animations doc he passed (“Good”, 23 Nov 2026); rules melds46_rules.gd,
on monsters foe_melds46.gd. Checked as the 52 were: each group filmed, every moment its rules told looked at in close-up, what
fell short made bolder and filmed again (Onrush, Hornet, Quicksilver, Mire, Charge; Lamprey's wisps, Reverb's rings,
Staccato's ticks, Double Tap's flash, Time Bomb, Detonator's charge, Vendetta's tally, the Hourglass, Aftermath's smoke).
Fury's frenzy now fades a step at a time as embers over his head. REDOUBT'S SECOND SHELL NEVER FORMED in play (it looked at a
memory of his shield that Melds 52 had already brought up to now): it keeps its own, and forms. The films set up what some
twists need (check_melds52.gd: a pack left nearly dead for Hair Trigger, his shell and frenzy cut short once the blow lands for
Redoubt and Fury, Guarding beside Hourglass behind so the blow leaves a ward to slow).

All 46 filmed together (`--cases=m52film:<the 46>`, 46 films, every moment of the doc told, no script errors; the rules check
`--cases=m52` 6 checks, 0 wrong, 218 cases) and put on one page for his yes: https://claude.ai/artifact/8xKRFHAjeV9kVnwiBCiSKH
(`python3 page.py <films> <out> 46`). Melds52.ON stays off until he says yes.
