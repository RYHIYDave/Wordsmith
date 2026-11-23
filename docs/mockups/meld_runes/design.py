# The 52 new meld runes: each its own glyph ('X' its colour, 'o' its glow), its colour, its two runes (for the foot).
R = {}
def rune(id, name, a, b, color, glyph):
    n = len(glyph)
    assert all(len(r) == n for r in glyph), (id, [len(r) for r in glyph])
    R[id] = {"name": name, "of": [a, b], "color": color, "glyph": glyph}

# --- TWIN ---
rune("onslaught", "Onslaught", "twin", "power", "#e0604c", ["...o...", "..X.X..", ".X...X.", "...o...", "..XXX..", ".XX.XX.", "XX...XX"])
rune("viper", "Viper", "twin", "poison", "#86c838", ["XXXXXX", "XX..XX", ".X..X.", ".X..X.", "......", ".o..o."])
rune("flashfreeze", "Flash Freeze", "twin", "frost", "#8ad0fa", [".X...X.", ".X...X.", "XoX.XoX", "XoX.XoX", "XoX.XoX", ".X...X.", ".X...X."])
rune("rekindle", "Rekindle", "twin", "fire", "#ff9e3c", [".X....", ".XX...", "XXX..X", "XoX.XX", "XoXXoX", ".XX.X."])
rune("flurry", "Flurry", "twin", "swift", "#8ed868", ["X...X..", ".X...X.", "..o...o", ".......", "X...X..", ".X...X.", "..o...o"])
rune("aftershock", "Aftershock", "twin", "heavy", "#b89a62", ["..XX..", ".XooX.", ".XXXX.", "......", "X.XX.X", ".X..X."])
# --- LEECH ---
rune("bloodlust", "Bloodlust", "leech", "power", "#e8464c", ["..XX..", ".XXXX.", "XXooXX", ".XXXX.", ".X..X.", "X....X"])
rune("coldblood", "Coldblood", "leech", "frost", "#a8b8f8", ["...X...", "..X.X..", ".X.o.X.", "X.ooo.X", "X..o..X", ".X...X.", "..XXX.."])
rune("conduit", "Conduit", "leech", "lightning", "#ffcc78", ["...X..", "..XXX.", ".XXoXX", ".XoXXX", ".XXoXX", "..XXX."])
rune("secondwind", "Second Wind", "leech", "swift", "#b0e08c", ["....X.", "...XXX", "XX.XoX", "...XoX", "XX.XXX", "....X."])
rune("marrow", "Marrow", "leech", "heavy", "#ead6bc", ["X.X...", ".X....", ".X..X.", ".X.XoX", ".X..X.", "X.X..."])
# --- VOLATILE ---
rune("quickfuse", "Quickfuse", "volatile", "swift", "#b476ea", ["....oX", "...X..", ".XXX..", "XXooX.", "XXooX.", ".XXX.."])
rune("concussion", "Concussion", "volatile", "heavy", "#a888b8", ["X..X..X", ".X.X.X.", "..XoX..", "XXoooXX", "..XoX..", ".......", "XXX.XXX"])
# --- PRECISE ---
rune("duelist", "Duelist", "precise", "power", "#f2c8c0", ["X.....X", ".X...X.", "..X.X..", "...o...", "..X.X..", ".X...X.", "X.....X"])
rune("needle", "Needle", "precise", "poison", "#d2ee72", [".....X", "....XX", "...XX.", "..XX..", ".o....", "oo...."])
rune("brand", "Brand", "precise", "fire", "#ffae6a", [".XXXXX.", "X.....X", "X..X..X", "X.XoX.X", "X.XoX.X", "X.....X", ".XXXXX."])
rune("seeker", "Seeker", "precise", "lightning", "#fff6a8", [".......", "..XXX..", ".X..oX.", "X..oo.X", ".Xo..X.", "..XXX..", "......."])
rune("quickdraw", "Quickdraw", "precise", "swift", "#eaf8d0", [".......", "....X..", ".....X.", "XX.XXoX", ".....X.", "....X..", "......."])
rune("pressurepoint", "Pressure Point", "precise", "heavy", "#e2d0ae", ["...X...", ".......", "..XXX..", "X.XoX.X", "..XXX..", ".......", "...X..."])
# --- FRENZIED ---
rune("berserk", "Berserk", "frenzied", "power", "#ff4238", ["X.X.X.", "X.X.X.", ".X.X.X", "......", "..oo..", "XX..XX"])
rune("fever", "Fever", "frenzied", "poison", "#d4e044", ["..X...", ".X.X..", ".XoX..", ".XoX..", "XoooX.", ".XXX.."])
rune("whiteout", "Whiteout", "frenzied", "frost", "#dceeff", [".......", "XXXX.o.", ".......", ".o.XXXX", ".......", "XXXX.o.", "......."])
rune("overcharge", "Overcharge", "frenzied", "lightning", "#ffb63c", ["..XX..", ".XXXX.", ".X.oX.", ".XooX.", ".Xo.X.", ".XXXX."])
rune("blur", "Blur", "frenzied", "swift", "#c2ee7c", [".......", "o..X...", ".o..X..", "..o..X.", ".o..X..", "o..X...", "......."])
rune("juggernaut", "Juggernaut", "frenzied", "heavy", "#cc7a4c", ["..XX..", ".X..X.", ".XXXX.", "XoXoXX", "XXoXoX", "XXXXXX"])
# --- GUARDING ---
rune("bulwark", "Bulwark", "guarding", "power", "#7aa84a", ["XXXXXX", "X.oo.X", "X.XX.X", "XX..XX", ".X..X.", "..XX.."])
rune("hemlock", "Hemlock", "guarding", "poison", "#8cc432", ["o.o.o.", ".XXX..", "..X...", "..X...", "..X.X.", "..XX.."])
rune("cinderward", "Cinderward", "guarding", "fire", "#ec8c3e", ["XXXXXX", "X.X..X", "X.XX.X", "XXooXX", ".XooX.", "..XX.."])
rune("static", "Static", "guarding", "lightning", "#e2ee44", ["XXXXXXX", "X...o.X", "X..o..X", "X.ooo.X", ".X.o.X.", "..X.X..", "...X..."])
rune("windward", "Windward", "guarding", "swift", "#6ed88e", ["XXXXXXX", "X.....X", "Xoooo.X", "X....oX", ".Xoo.X.", "..X.X..", "...X..."])
rune("fortress", "Fortress", "guarding", "heavy", "#8e9868", ["X.XX.X", "XXXXXX", "XXooXX", "XXooXX", "XX..XX", "XX..XX"])
# --- LASTING ---
rune("momentum", "Momentum", "lasting", "power", "#d66a62", [".....o", "....XX", "...XXX", "..XXXX", ".XXXXX", "......"])
rune("canker", "Canker", "lasting", "poison", "#9cb24e", ["XXXXXX", ".XooX.", "..XX..", "..XX..", ".X..X.", "XXXXXX"])
rune("permafrost", "Permafrost", "lasting", "frost", "#a6d6fe", ["XXXXXXX", "X..X..X", "X.XoX.X", "XXoooXX", "X.XoX.X", "X..X..X", "XXXXXXX"])
rune("smoulder", "Smoulder", "lasting", "fire", "#c27a46", ["..o....", "...o...", "..o....", "...XX..", ".XXooX.", "XooXXoX", "XXXXXXX"])
rune("tempest", "Tempest", "lasting", "lightning", "#e6dea0", [".XXXX.", "XXXXXX", "XXooXX", ".XXXX.", ".X..X.", "X..X.."])
rune("tailwind", "Tailwind", "lasting", "swift", "#a2d878", ["XXXX..", "....X.", "XXXX.o", "......", "XXX...", "...Xo."])
rune("bedrock", "Bedrock", "lasting", "heavy", "#9a8060", ["XXXXXX", "......", "XXoXXX", "......", "XXXXoX", "XXXXXX"])
# --- FLEETING ---
rune("haymaker", "Haymaker", "fleeting", "power", "#f2a0a0", [".......", ".X.X.X.", "XXXXXXX", "XoXoXoX", "XXXXXXX", ".XXXXX.", "..XXX.."])
rune("bloat", "Bloat", "fleeting", "poison", "#c2e27e", ["...o..", ".XXXX.", "XXooXX", "XooooX", "XXooXX", ".XXXX."])
rune("coldsnap", "Cold Snap", "fleeting", "frost", "#c6e6ff", ["XXXXXX", ".X.XX.", ".X..X.", ".o..X.", "....o.", "......"])
rune("flashfire", "Flashfire", "fleeting", "fire", "#ffcc8a", ["X..X..X", ".......", "...X...", "..XoX..", "X.XoX.X", "..XXX..", "......."])
rune("jolt", "Jolt", "fleeting", "lightning", "#fff07a", ["....XX", "...XX.", ".XXoXX", "XXoXX.", ".XX...", "XX...."])
rune("blink", "Blink", "fleeting", "swift", "#e2f6e2", [".o.....", "o.o....", ".o.....", "...o...", ".....X.", "....XXX", ".....X."])
rune("daze", "Daze", "fleeting", "heavy", "#e0c6e8", [".X...X.", "XoX.XoX", ".X...X.", ".......", "...X...", "..XoX..", "...X..."])
# --- VAST ---
rune("cataclysm", "Cataclysm", "vast", "power", "#c4583a", ["......o", ".....o.", "...XX..", "..XXX..", "..XX...", "X.....X", "XXoooXX"])
rune("miasma", "Miasma", "vast", "poison", "#8e9c42", [".......", ".oo..oo", "o..oo..", ".......", ".XX..XX", "X..XX..", "......."])
rune("glacier", "Glacier", "vast", "frost", "#9ccaea", [".......", "...X...", "..XoX..", ".XoooX.", "XXoooXX", "XXXXXXX", "......."])
rune("inferno", "Inferno", "vast", "fire", "#ea6c30", ["...X...", ".X.X.X.", ".XXXXX.", "XXoXoXX", "XooooXX", ".XXXXX.", "......."])
rune("stormfront", "Stormfront", "vast", "lightning", "#cccc84", [".XXXXX.", "XXXXXXX", ".......", ".XX.XX.", "..X..X.", ".XX.XX.", "..o..o."])
rune("gale", "Gale", "vast", "swift", "#b2d8a0", ["XXXXX..", ".....X.", "XXXXXXo", ".....X.", "XXXX...", ".......", "......."])
rune("earthquake", "Earthquake", "vast", "heavy", "#a27a50", ["...X...", "...XX..", "..XX...", "..X.X..", ".XX..X.", ".X...XX", "XX....."])
