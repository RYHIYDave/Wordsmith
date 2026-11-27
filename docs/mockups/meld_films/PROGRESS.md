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
(`python3 page.py <films> <out> 46`). Switched on at his yes, below.

## On (23 Nov 2026)

His words, after the rules check and the films of all 98: “Get those melds in”. melds52.gd `ON` is true: the wordsmith makes all
98 and the 11 level 2 runes. Checked with it on: `--only=words --cases=m52` 6 of 6, `--only=meld` (the meld page) 15 of 15 (two of
its lines now expect the page to take every rune of the sixteen, Leech among them, and Volatile twice into its level 2 rune),
`--only=doorrunes` 8 of 8.

## The city's 45 (24 Nov 2026)

The 45 city melds of his doc Floor 11–15 Melds (his “Good”), with the stones (his “Yep good”) and the animations doc (his “Good to
go”), painted by godot/scripts/fx_m52p_city.gd, rules meldscity_rules.gd, on monsters foe_meldscity.gd. Filmed with
`--cases=m52film:city` (`--fixed-fps 30`): each in front, behind, and on a monster; behind, the film waits for each vortex to
collapse and walks a skeleton onto each snare; carriers of Splitting die so their split is seen. Looked at and made bolder where
faint (flashes, sprays, thicker swirls, bigger thorns); Tether now links any held enemy near a marked one; Stagnation now keeps the
poison from wearing off while the slow holds. Rules check `--cases=m52:<the 50>` 100 of 100. On one page for his yes:
https://claude.ai/artifact/C6a3KHBrT98YMvi4YpKAD9 (`python3 page.py <films> <out> city`). Off (`Melds52.CITY_ON`) until he says yes.

## The city's runes with the floor 6–10 runes, 44 (24 Nov 2026)

His “Then finish the melds”, while he slept: the next group his Floor 11–15 doc named. Designed (tools/meldscity/docs_city2.txt),
their stones (docs/mockups/meld_runes4), rules meldscity2_rules.gd, on monsters foe_meldscity2.gd, painted by fx_m52p_city2.gd.
Checked in front and behind (`--cases=m52:<the 44>`, 88 of 88; Backwash's stagger made to land on those the first strike dragged,
and Hydra's second strike made to split again). Filmed with `--cases=m52film:city2`: all 44, each one's moment on a monster shown.
On one page for his yes, each card its stone, its idea, what it does and its film: https://claude.ai/artifact/9u1bUEVM4YdrjRZq5SHHeG
(`python3 page.py <films> <out> city2`). Off (`Melds52.CITY2_ON`) until he says yes. Still to come: the High City's seven runes with
every other rune (168 melds and their 7 level 2 runes).

## Every meld not yet checked, against his Art Rulebook (26 Nov 2026)

His “find which are weakest compared to our art and animation ruleset.  Then bring them up to our standard”: all 263 not checked on
23 Nov filmed and measured against a plain Strike's film, the painters read for the rest of the rulebook, the 30 weakest (the city's
melds that slow, curse or hold) brought up and fixes made for whole groups (the High City's and the redone melds' kicks, holds, marks
and things; the city's marks and grounds; cyan on monsters; Bedrock's, Pin's and Amber's monster moments). How, what it found and what
was done: ../meld_rules_check2/README.md. The page of before and after for his yes: https://claude.ai/artifact/Btyxz18G72p7ZHf1kVU6rp
(`python3 ../meld_rules_check2/page.py <before films> <after films> <out>`). The check-melds52 films now write `<id>.json` beside each.
