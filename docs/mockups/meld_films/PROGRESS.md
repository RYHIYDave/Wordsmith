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
| Vast (7) | | |
