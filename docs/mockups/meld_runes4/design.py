# The 44 meld runes of the city's runes with the floor 6-10 runes (his "Then finish the melds", 24 Nov 2026, the next group his
# Floor 11-15 doc named: "The city's runes with the floor 6-10 runes are the next group"; Implode, Pulling and Volatile, the game
# has already): each its own glyph ('X' its colour, 'o' its glow), its colour, its two runes, and what the symbol shows. Drawn by
# ../meld_runes/render.py's stone(). By his Art Rulebook: nothing on his side in the enemy's pink or gold (Leech's melds in blood
# red and salmon red, as Maw, Bloodbloom and Lamprey were made; Fleeting's in pale lilac), and no plain box or ring.
R4 = {}
SHOWS4 = {}
def rune(id, name, a, b, color, shows, glyph):
    n = len(glyph)
    assert n == 7 and all(len(r) == 7 for r in glyph), (id, [len(r) for r in glyph])
    assert id not in R4, id
    R4[id] = {"name": name, "of": [a, b], "color": color, "glyph": glyph}
    SHOWS4[id] = shows

# --- PULLING ---
rune("backwash", "Backwash", "pulling", "twin", "#6a98d0", "Two waves drawing back",
     ["XXX....", "...X...", "XX..X..", "..X.Xo.", "XX..X..", "...X...", "XXX...."])
rune("gullet", "Gullet", "pulling", "leech", "#b83a48", "A mouth drawing in a drop of blood",
     ["X.....X", ".X...X.", "..X.X..", "...o...", "..XoX..", ".XXXXX.", "......."])
rune("harpoon", "Harpoon", "pulling", "precise", "#b0b4f0", "A barbed point on a line",
     ["...X...", "..XXX..", ".X.X.X.", "...X...", "...X...", "...o...", "..o.o.."])
rune("whirlpool", "Whirlpool", "pulling", "frenzied", "#c87048", "A spiral spinning faster to its middle",
     ["XXXXXX.", "X......", "X.XXXX.", "X.X.oX.", "X.X..X.", "X.XXXX.", "X......"])
rune("haven", "Haven", "pulling", "guarding", "#58a0a0", "A shield with a whirl at its heart",
     ["XXXXXXX", "X.....X", "X.XXX.X", "X.Xo..X", ".X.XX.X", "..X..X.", "...XX.."])
rune("eddy", "Eddy", "pulling", "lasting", "#8a84c0", "A slow whirl that keeps turning",
     ["..XXX..", ".X...X.", "X..X..X", "X.X.o.X", "X..XX.X", ".X...X.", "..XXX.."])
rune("whiplash", "Whiplash", "pulling", "fleeting", "#c8b8f0", "A cord snapping back",
     ["X......", ".X.....", "..X....", "...XXXo", "..X....", ".X.....", "X......"])
rune("maelstrom", "Maelstrom", "pulling", "vast", "#6a5cb0", "A wide whirl swallowing all",
     ["XXXXXXX", "X.....X", "X.XXX.X", "X.XoX.X", "X.X.X.X", "X...X.X", "XXXXX.X"])
# --- SPLITTING ---
rune("hydra", "Hydra", "splitting", "twin", "#88c0c8", "Two heads, each forking again",
     ["X.X.X.X", ".X...X.", "..X.X..", "..X.X..", "...X...", "...o...", "...o..."])
rune("swarm", "Swarm", "splitting", "leech", "#c8604c", "A cloud of biting specks",
     ["o..X..o", ".X...X.", "X..X..X", ".X.o.X.", "X..X..X", ".X...X.", "o..X..o"])
rune("shellburst", "Shellburst", "splitting", "volatile", "#a070d8", "A shell bursting into three",
     ["X..X..X", ".X.X.X.", "..ooo..", "..XXX..", ".XXXXX.", ".XXXXX.", "..XXX.."])
rune("pinpoint", "Pinpoint", "splitting", "precise", "#e0d8f8", "Three points meeting on one",
     ["X.....X", ".X...X.", "..X.X..", "...o...", "...X...", "...X...", "...X..."])
rune("riot", "Riot", "splitting", "frenzied", "#f08060", "Shards flying in a frenzy",
     ["X.X.X.X", ".XXXXX.", "XX.o.XX", ".XXXXX.", "X.X.X.X", "...X...", "..X.X.."])
rune("phalanx", "Phalanx", "splitting", "guarding", "#60b088", "Three shields in a row",
     ["XX.X.XX", "XX.X.XX", "XX.X.XX", "oX.X.Xo", ".X.o.X.", ".......", "......."])
rune("rebound", "Rebound", "splitting", "lasting", "#b8a0c0", "A piece flying on from wall to wall",
     ["X.....X", ".X...X.", "..X.X..", "...o...", "..X.X..", ".X...X.", "X.....X"])
rune("flechette", "Flechette", "splitting", "fleeting", "#e8d0f0", "Three darts in flight",
     ["XX..XX.", ".XX..XX", "..XXo..", ".XX..XX", "XX..XX.", ".......", "......."])
rune("starburst", "Starburst", "splitting", "vast", "#c0a0d8", "Pieces flying out far in every way",
     ["X..X..X", ".X.X.X.", "..XXX..", "XXXoXXX", "..XXX..", ".X.X.X.", "X..X..X"])
# --- HEXING ---
rune("refrain", "Refrain", "hexing", "twin", "#88b0b8", "Two eyes, one behind the other",
     ["XXXX...", "X..X...", "X.oXXX.", "XXXX..X", "...X.oX", "...XXXX", "......."])
rune("bloodcurse", "Bloodcurse", "hexing", "leech", "#a83440", "An eye weeping blood",
     ["..XXX..", ".X...X.", "X..o..X", ".X...X.", "..XXX..", "...X...", "..XXX.."])
rune("hexblast", "Hexblast", "hexing", "volatile", "#8858b8", "An eye at the heart of a blast",
     ["X..X..X", ".X...X.", "..XXX..", "XX.o.XX", "..XXX..", ".X...X.", "X..X..X"])
rune("evileye", "Evil Eye", "hexing", "precise", "#d8d0e8", "A narrowed eye with a point beneath",
     [".......", "XXXXXXX", "X..o..X", "XXXXXXX", "...X...", "...X...", "...o..."])
rune("delirium", "Delirium", "hexing", "frenzied", "#d87060", "A wild eye, rolling",
     ["X.XXX.X", ".X...X.", "X.o...X", "X...X.X", ".X...X.", "X.XXX.X", "......."])
rune("talisman", "Talisman", "hexing", "guarding", "#68a890", "A charm with an eye on it",
     ["...X...", "..X.X..", ".XXXXX.", ".X.o.X.", ".XXXXX.", "..X.X..", "...X..."])
rune("grudge", "Grudge", "hexing", "lasting", "#9c90a8", "An eye that never closes, lashes wide",
     [".X.X.X.", "..XXX..", ".X...X.", "X..o..X", ".X...X.", "..XXX..", "......."])
rune("omen", "Omen", "hexing", "fleeting", "#d8c8e8", "A falling star with an eye",
     ["X......", ".X.....", "..X....", "...XXX.", "..X.o.X", "...XXX.", "......."])
rune("pall", "Pall", "hexing", "vast", "#7c6c90", "A veil spread over many eyes",
     ["XXXXXXX", "X.X.X.X", ".......", "o.o.o.o", ".......", "X.X.X.X", "......."])
# --- STILLING ---
rune("rewind", "Rewind", "stilling", "twin", "#78d0b8", "Two hourglasses, one turned back",
     ["XXX.XXX", ".X...X.", "..o.o..", ".X...X.", "XXX.XXX", ".......", "......."])
rune("sap", "Sap", "stilling", "leech", "#b85a58", "A slow drop falling",
     ["...X...", "..XXX..", "..XoX..", ".XXXXX.", "..XXX..", ".......", "...o..."])
rune("slowfuse", "Slow Fuse", "stilling", "volatile", "#90a0d8", "A bomb whose fuse burns slow",
     ["....o.o", ".....X.", "....X..", "..XXX..", ".XXXXX.", ".XXXXX.", "..XXX.."])
rune("stillpoint", "Stillpoint", "stilling", "precise", "#c8f0e0", "A sight with time stopped at its middle",
     ["...X...", ".XX.XX.", ".X...X.", "XX.o.XX", ".X...X.", ".XX.XX.", "...X..."])
rune("quickening", "Quickening", "stilling", "frenzied", "#d8a070", "A clock whose hand runs fast",
     ["..XXX..", ".X...X.", "X..X..X", "X..oXXX", "X.....X", ".X...X.", "..XXX.."])
rune("respite", "Respite", "stilling", "guarding", "#60c890", "A shield with an hourglass on it",
     ["XXXXXXX", "X.XXX.X", "X..o..X", "X.XXX.X", ".X...X.", "..X.X..", "...X..."])
rune("eternity", "Eternity", "stilling", "lasting", "#90c8a8", "A loop with no end",
     [".......", ".XX.XX.", "X..X..X", "X.oXo.X", "X..X..X", ".XX.XX.", "......."])
rune("stutter", "Stutter", "stilling", "fleeting", "#d0f0e8", "A clock hand caught mid-step",
     ["..XXX..", ".X...X.", "X..X..X", "X..o..X", "X.X.X.X", ".X...X.", "..XXX.."])
rune("doldrums", "Doldrums", "stilling", "vast", "#6a9c80", "Still water spreading wide",
     [".......", "XXXXXXX", ".......", ".XoXoX.", ".......", "XXXXXXX", "......."])
# --- BINDING ---
rune("fetters", "Fetters", "binding", "twin", "#a8b898", "Two cuffs on one chain",
     ["XXX.XXX", "X.X.X.X", "XXX.XXX", ".X...X.", "..XoX..", ".......", "......."])
rune("thrall", "Thrall", "binding", "leech", "#a84a44", "A bound heart, drained",
     [".XX.XX.", "XXXXXXX", "X.XoX.X", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."])
rune("tripwire", "Tripwire", "binding", "volatile", "#9878c8", "A cord strung to a charge",
     ["X.....X", "XXXXXXX", "X.....X", "...X...", "..XXX..", "..XoX..", "..XXX.."])
rune("pin", "Pin", "binding", "precise", "#e0dcc8", "A spike driven through a knot",
     ["...X...", "...X...", "XXXXXXX", "X..X..X", "XXXoXXX", "...X...", "...o..."])
rune("mauler", "Mauler", "binding", "frenzied", "#e07850", "Claws closing on a chain",
     ["X.X.X.X", "X.X.X.X", ".X.X.X.", "..XXX..", "..XoX..", "..XXX..", "......."])
rune("stockade", "Stockade", "binding", "guarding", "#70a070", "A wall of stakes, lashed",
     ["X.X.X.X", "XXXXXXX", "X.X.X.X", "X.XoX.X", "XXXXXXX", "X.X.X.X", "......."])
rune("manacle", "Manacle", "binding", "lasting", "#a89c88", "A heavy cuff, locked",
     ["..XXX..", ".X...X.", "X.....X", "X..o..X", "XXXXXXX", "XX.X.XX", "XXXXXXX"])
rune("snag", "Snag", "binding", "fleeting", "#e0d0e0", "A hook catching in passing",
     ["..XX...", ".X..X..", ".X..X..", "....X..", "...X...", "..X..o.", "..XXX.."])
rune("dragnet", "Dragnet", "binding", "vast", "#8a7a58", "A wide net cast",
     ["X.X.X.X", ".X.X.X.", "X.XoX.X", ".X.X.X.", "X.X.X.X", ".X.X.X.", "X.X.X.X"])
assert len(R4) == 44, len(R4)
