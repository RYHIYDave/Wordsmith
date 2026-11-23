# The 46 meld runes of The Last Floor 1-10 Melds (his word, 23 Nov 2026: "Good"): each its own glyph ('X' its colour, 'o' its
# glow), its colour, its two runes (for the foot), and what the symbol shows. Drawn by ../meld_runes/render.py's stone().
R2 = {}
SHOWS2 = {}
def rune(id, name, a, b, color, shows, glyph):
    n = len(glyph)
    assert all(len(r) == n for r in glyph), (id, [len(r) for r in glyph])
    assert id not in R2, id
    R2[id] = {"name": name, "of": [a, b], "color": color, "glyph": glyph}
    SHOWS2[id] = shows

# --- SWIFT ---
rune("onrush", "Onrush", "swift", "power", "#f07850", "A double chevron, charging",
     ["X..X...", ".X..X..", "..X..X.", "...o..o", "..X..X.", ".X..X..", "X..X..."])
rune("hornet", "Hornet", "swift", "poison", "#e0c030", "A hornet, stinger down",
     ["oo...oo", "ooXXXoo", "..ooo..", "..XXX..", "..ooo..", "...X...", "...X..."])
rune("glide", "Glide", "swift", "frost", "#70e6d0", "A sweep across the ice",
     [".......", "....XX.", "..XX...", "XX.....", ".......", "XXXXXXX", ".o.o.o."])
rune("firewalk", "Firewalk", "swift", "fire", "#f4c050", "Burning footprints",
     [".o.....", "XXX....", "XXX..o.", ".X..XXX", "....XXX", ".o...X.", "XXX...."])
rune("quicksilver", "Quicksilver", "swift", "lightning", "#c8f0f0", "A drop of quicksilver, a spark in it",
     ["...X...", "..XXX..", ".XX.XX.", "XX.o.XX", "X..oo.X", ".X.o.X.", "..XXX.."])
rune("charge", "Charge", "swift", "heavy", "#d8a040", "A battering ram",
     [".......", "X..XXXX", "..XXXXX", "X.XXooX", "..XXXXX", "X..XXXX", "......."])
# --- HEAVY ---
rune("mire", "Mire", "heavy", "poison", "#7a8a30", "Bubbles rising from cracked mud",
     ["..o....", ".o..o..", ".....o.", "XXX.XXX", ".X.X.X.", "XX.X.XX", "XXXXXXX"])
rune("icebreaker", "Icebreaker", "heavy", "frost", "#b4c8e0", "A block of ice split by a blow",
     ["XXXXXXX", "XXX.XXX", "XXo.XXX", "XX.oXXX", "XXX.oXX", "XXo.XXX", "XXXXXXX"])
rune("anvil", "Anvil", "heavy", "fire", "#e07a32", "An anvil throwing sparks",
     ["o.o.o..", ".......", "XXXXXXX", ".XXXXX.", "..XXX..", ".XXXXX.", "XXXXXXX"])
rune("fulgurite", "Fulgurite", "heavy", "lightning", "#d4b860", "A bolt driven into the ground",
     ["...XX..", "..XX...", ".XXXX..", "...XX..", "..XX...", "XoXoXoX", "X.X.X.X"])
# --- TWIN ---
rune("lamprey", "Lamprey", "twin", "leech", "#ff7096", "A lamprey's ringed mouth",
     ["..XXX..", ".X.o.X.", "X.o.o.X", "X..o..X", "X.o.o.X", ".X.o.X.", "..XXX.."])
rune("cluster", "Cluster", "twin", "volatile", "#7a6ad8", "Bomblets scattering",
     ["...o...", "..XX...", "..XX.o.", "o....XX", "XX...XX", "XX.....", "......."])
rune("doubletap", "Doubletap", "twin", "precise", "#a0e8e0", "Two holes through one sight",
     ["...X...", "..XXX..", ".X...X.", "XXo.oXX", ".X...X.", "..XXX..", "...X..."])
rune("tempo", "Tempo", "twin", "frenzied", "#ff7a58", "Two beats in a row",
     ["..X..X.", "..XX.XX", "..X..X.", "..X..X.", "oXX.oXX", "XXX.XXX", "......."])
rune("redoubt", "Redoubt", "twin", "guarding", "#3cb890", "A shield within a shield",
     ["XXXXXXX", "X.....X", "X.XXX.X", "X.XoX.X", ".X.X.X.", "..X.X..", "...X..."])
rune("reverb", "Reverb", "twin", "lasting", "#8cb0a8", "A sound ringing on",
     ["..X..X.", ".X..X..", "X..X..o", "X..X.oo", "X..X..o", ".X..X..", "..X..X."])
rune("staccato", "Staccato", "twin", "fleeting", "#f0b8e0", "Two quick strokes",
     [".......", "X...X..", "XX..XX.", "XoX.XoX", "XX..XX.", "X...X..", "......."])
rune("ripple", "Ripple", "twin", "vast", "#4a9a8a", "A ripple spreading",
     ["..XXX..", ".X...X.", "X..o..X", "X.ooo.X", "X..o..X", ".X...X.", "..XXX.."])
# --- LEECH ---
rune("bloodbloom", "Bloodbloom", "leech", "volatile", "#d4507c", "A flower of blood",
     ["..X.X..", ".XXoXX.", "X.ooo.X", ".XXoXX.", "..X.X..", "...X...", "...X..."])
rune("lancet", "Lancet", "leech", "precise", "#ffc0c8", "A fine blade, a drop at its edge",
     ["......X", ".....X.", "....X..", "...X...", ".oX....", "ooo....", ".o....."])
rune("feedingfrenzy", "Feeding Frenzy", "leech", "frenzied", "#f25a5a", "Snapping jaws",
     ["X.X.X.X", "XXXXXXX", "...o...", "..ooo..", "...o...", "XXXXXXX", "X.X.X.X"])
rune("carapace", "Carapace", "leech", "guarding", "#b86a74", "A hard shell",
     ["..XXX..", ".XX.XX.", "XXX.XXX", "XoX.XoX", "XXX.XXX", ".XX.XX.", "..X.X.."])
rune("transfusion", "Transfusion", "leech", "lasting", "#cc8494", "A drip of life",
     [".XXXX..", ".XooX..", ".XooX..", "..XX...", "...X...", "...X.o.", "....XX."])
rune("lifeline", "Lifeline", "leech", "fleeting", "#ff9ec0", "A heartbeat",
     [".......", "..X....", "..XX...", "XXX.X.X", "....XX.", ".....X.", "......."])
rune("bloodtide", "Bloodtide", "leech", "vast", "#d84454", "A tide of blood",
     [".......", ".XX..XX", "X..XX..", ".......", ".oo..oo", "o..oo..", "......."])
# --- VOLATILE ---
rune("detonator", "Detonator", "volatile", "precise", "#c090f0", "A detonator, primed",
     ["...X...", ".XXXXX.", "...X...", ".XXXXX.", ".X.o.X.", ".XoooX.", ".XXXXX."])
rune("mayhem", "Mayhem", "volatile", "frenzied", "#c8489c", "Blasts going off everywhere",
     ["X..X..X", ".X.X.X.", "..ooo..", "XXoooXX", "..ooo..", ".X.X.X.", "X..X..X"])
rune("minefield", "Minefield", "volatile", "guarding", "#6878c8", "Mines laid in a ring",
     ["..XXX..", ".X...X.", "X.o.o.X", "X.....X", "X..o..X", ".X...X.", "..XXX.."])
rune("timebomb", "Timebomb", "volatile", "lasting", "#a070c0", "A bomb with a clock face",
     ["....XX.", "...X...", ".XXXX..", "XX.oXX.", "X..o.X.", "XX...X.", ".XXXX.."])
rune("hairtrigger", "Hair Trigger", "volatile", "fleeting", "#e4a0f4", "A grenade, its pin half out",
     ["..oo...", ".o..o..", "..XX...", ".XXXX..", "XX.XXX.", "XXXX.X.", ".XXXX.."])
rune("blastwave", "Blastwave", "volatile", "vast", "#7c4ca0", "A blast pushing outward",
     ["X.....X", "X..o..X", "X.ooo.X", "X..o..X", "X.....X", ".......", "XXXXXXX"])
# --- PRECISE ---
rune("rapier", "Rapier", "precise", "frenzied", "#ffb8a0", "A thin blade, quick",
     ["......X", ".....X.", "....X..", "...X...", "o.X....", ".X.....", "X.o...."])
rune("riposte", "Riposte", "precise", "guarding", "#b0e0c0", "A shield with a sight in it",
     ["XXXXXXX", "X..X..X", "X.XoX.X", "X..X..X", ".X...X.", "..X.X..", "...X..."])
rune("vendetta", "Vendetta", "precise", "lasting", "#d8b4a8", "Tally marks, struck through",
     [".......", "X.X.X.X", "XoX.X.X", "X.XoX.X", "X.X.XoX", "X.X.X.X", "......."])
rune("ambush", "Ambush", "precise", "fleeting", "#f4ecd8", "Eyes in the grass",
     [".......", ".......", ".XX.XX.", ".Xo.Xo.", ".......", "X.X.X.X", "XXXXXXX"])
rune("bullseye", "Bullseye", "precise", "vast", "#c8a088", "A target, its heart lit",
     ["..XXX..", ".X...X.", "X.XXX.X", "X.XoX.X", "X.XXX.X", ".X...X.", "..XXX.."])
# --- FRENZIED ---
rune("shieldwall", "Shieldwall", "frenzied", "guarding", "#a8b040", "A shield, layer on layer",
     ["XXXXXXX", "XoooooX", "X.....X", "XoooooX", ".X...X.", "..XoX..", "...X..."])
rune("fury", "Fury", "frenzied", "lasting", "#d84030", "A scowl that doesn't fade",
     ["X.....X", "XX...XX", ".XX.XX.", "..o.o..", ".XXXXX.", "X.X.X.X", "......."])
rune("spree", "Spree", "frenzied", "fleeting", "#ff8aa0", "A sudden zigzag rush",
     ["X......", ".X.X...", "..X.X..", "...X.X.", "....X.o", ".....oo", "......o"])
rune("rampage", "Rampage", "frenzied", "vast", "#b85030", "A charging bull's head",
     ["X.....X", "X.....X", ".X...X.", "..XXX..", ".XoXoX.", ".XXXXX.", "..XXX.."])
# --- GUARDING ---
rune("sanctuary", "Sanctuary", "guarding", "lasting", "#5aa080", "A lit doorway",
     ["..XXX..", ".X...X.", "X.....X", "X..o..X", "X.ooo.X", "X.ooo.X", "XXXXXXX"])
rune("parry", "Parry", "guarding", "fleeting", "#98ecc0", "A small shield, flashing",
     ["o.....o", ".o...o.", "..XXX..", ".XXXXX.", ".XXXXX.", "..XXX..", "...X..."])
rune("aegis", "Aegis", "guarding", "vast", "#3a8058", "A dome over everyone",
     ["..XXX..", ".X...X.", "X.....X", "X.....X", "Xo.o.oX", "Xo.o.oX", "XXXXXXX"])
# --- LASTING AND FLEETING ---
rune("hourglass", "Hourglass", "lasting", "fleeting", "#d0a8c0", "An hourglass",
     ["XXXXXXX", ".X.o.X.", "..XoX..", "...X...", "..X.X..", ".Xo.oX.", "XXXXXXX"])
rune("aftermath", "Aftermath", "lasting", "vast", "#8c6c58", "Smoke over broken ground",
     [".o.o.o.", "o.o.o.o", ".......", "X.XX.XX", ".X..X..", "XX.X.XX", "XXXXXXX"])
rune("whipcrack", "Whipcrack", "fleeting", "vast", "#e4b890", "A whip cracking",
     ["X......", "X......", ".X.....", "..XXX..", ".....X.", "....o.X", "...ooo."])
assert len(R2) == 46, len(R2)
