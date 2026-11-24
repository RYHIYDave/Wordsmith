# The 45 meld runes of Floor 11-15 Melds (his doc, https://claude.ai/artifact/CMMUpdDX2f9DwDPe8avGqQ; his word, 24 Nov 2026:
# "Good"): each its own glyph ('X' its colour, 'o' its glow), its colour, its two runes (for the foot), and what the symbol shows.
# Drawn by ../meld_runes/render.py's stone(). By his Art Rulebook (his reminder, 24 Nov 2026: “Remember to follow the rules
# for art and animations”): nothing on his side in the enemy's pink (Maw blood red, Splinter salmon red, as Bloodbloom and
# Lamprey were made), and no plain box (Icebound two chain links, not nested squares).
R3 = {}
SHOWS3 = {}
def rune(id, name, a, b, color, shows, glyph):
    n = len(glyph)
    assert all(len(r) == n for r in glyph), (id, [len(r) for r in glyph])
    assert id not in R3, id
    R3[id] = {"name": name, "of": [a, b], "color": color, "glyph": glyph}
    SHOWS3[id] = shows

# --- PULLING ---
rune("maw", "Maw", "pulling", "power", "#c42c3c", "Four points driven into one",
     ["X.....X", ".X...X.", "..XoX..", "...o...", "..XoX..", ".X...X.", "X.....X"])
rune("sump", "Sump", "pulling", "poison", "#6e8c4a", "Venom draining down a funnel",
     [".XXXXX.", "X.ooo.X", ".X.o.X.", "..XoX..", "...X...", "..o.o..", "...o..."])
rune("drift", "Drift", "pulling", "frost", "#94a8f4", "Ice swept in to a point",
     ["XX.....", "..XX...", "....XX.", "......o", "....XX.", "..XX...", "XX....."])
rune("firewhirl", "Firewhirl", "pulling", "fire", "#f08860", "A whirl of fire",
     ["...o...", "..XXX..", ".X...X.", "X..XX.X", "X.X.o.X", ".X..XX.", "..XX..."])
rune("lodestone", "Lodestone", "pulling", "lightning", "#b8b0f8", "A horseshoe magnet, sparking",
     ["oo...oo", "XX...XX", "XX...XX", "XX...XX", ".XX.XX.", "..XXX..", "......."])
rune("riptide", "Riptide", "pulling", "swift", "#6aa0c8", "A wave curling back on itself",
     ["..XXX..", ".X...X.", "X..XX.X", "X.Xo...", "X..XXXX", ".X.....", "..XXXXX"])
rune("gravity", "Gravity", "pulling", "heavy", "#8a6ab0", "A weight sinking into a hollow",
     ["..XXX..", "..XXX..", "...X...", "X..o..X", ".X...X.", "..XXX..", "......."])
# --- SPLITTING ---
rune("splinter", "Splinter", "splitting", "power", "#e8705a", "One blow forking into three",
     ["X..X..X", "X..X..X", ".X.X.X.", "..XXX..", "...X...", "...o...", "...o..."])
rune("spore", "Spore", "splitting", "poison", "#c0c870", "A puffball scattering spores",
     ["o..o..o", ".o...o.", "..XXX..", ".XXXXX.", ".XXXXX.", "..XXX..", "...X..."])
rune("sleet", "Sleet", "splitting", "frost", "#a8c0f8", "Pieces of ice falling slant",
     ["X..X..X", ".......", ".X..X..", "o...o..", "...X..X", "..o...o", "X......"])
rune("embers", "Embers", "splitting", "fire", "#f8b080", "Sparks flying up from a flame",
     ["o.....o", "...o...", ".o...o.", "...X...", "..XXX..", ".XXoXX.", "..XXX.."])
rune("fractal", "Fractal", "splitting", "lightning", "#f0e8a0", "A bolt branching and branching",
     ["...X...", "...X...", "..X.X..", ".X...X.", "X.X.X.X", "o..o..o", "......."])
rune("scatter", "Scatter", "splitting", "swift", "#b8d090", "Three darts flying apart",
     ["......X", "....XX.", "XXXo...", "XXXXXXX", "XXXo...", "....XX.", "......X"])
rune("rubble", "Rubble", "splitting", "heavy", "#b09080", "A boulder broken in pieces",
     ["..XX...", ".XXX.X.", "XXX.XXX", "XX.o.XX", ".XX.XX.", "XX...XX", "......."])
# --- HEXING ---
rune("doom", "Doom", "hexing", "power", "#a03850", "A heavy eye, closing on you",
     ["XXXXXXX", ".X...X.", "X..o..X", "X.ooo.X", "X..o..X", ".XXXXX.", "......."])
rune("plague", "Plague", "hexing", "poison", "#8a9a60", "An eye weeping venom",
     ["..XXX..", ".X...X.", "X..o..X", ".X...X.", "..XXX..", "...o...", "..ooo.."])
rune("hoarfrost", "Hoarfrost", "hexing", "frost", "#b8c8e8", "An eye at the heart of a frost star",
     ["X..X..X", ".X.X.X.", "..XXX..", "XXXoXXX", "..XXX..", ".X.X.X.", "X..X..X"])
rune("brimstone", "Brimstone", "hexing", "fire", "#d06040", "A burning eye",
     [".o.o.o.", "o.o.o.o", "..XXX..", ".X.o.X.", "X.ooo.X", ".X.o.X.", "..XXX.."])
rune("jinx", "Jinx", "hexing", "lightning", "#d8d090", "A bolt through an eye",
     ["....X..", "..XX...", ".X.X.X.", "X.oXo.X", ".X.X.X.", "...XX..", "..X...."])
rune("whisper", "Whisper", "hexing", "swift", "#c0d0b0", "A curse carried on the wind",
     [".......", "XXXX...", "....X..", ".XXX.o.", "X....oo", ".XXXX..", "......."])
rune("burden", "Burden", "hexing", "heavy", "#c8a8d0", "A weight with an eye on it",
     ["...X...", "..X.X..", ".XXXXX.", "XXXoXXX", "XXoooXX", "XXXoXXX", "XXXXXXX"])
# --- STILLING ---
rune("stasis", "Stasis", "stilling", "power", "#b4a070", "A fist held still between two bars",
     ["X.....X", "X.XXX.X", "X.XoX.X", "X.XXX.X", "X..X..X", "X.....X", "X.....X"])
rune("stagnation", "Stagnation", "stilling", "poison", "#9ed46a", "Bubbles hanging over still water",
     [".o...o.", "...o...", ".o...o.", ".......", "XXXXXXX", ".......", "XXXXXXX"])
rune("frostlock", "Frostlock", "stilling", "frost", "#90d8e0", "An icicle hanging in a bubble",
     ["..XXX..", ".X...X.", "X.XXX.X", "X..X..X", "X..o..X", ".X...X.", "..XXX.."])
rune("slowburn", "Slow Burn", "stilling", "fire", "#d8b060", "A candle burning down slowly",
     ["...o...", "..ooo..", "...o...", "..XXX..", "..XXX..", "..XXX..", ".XXXXX."])
rune("stormglass", "Stormglass", "stilling", "lightning", "#c8f0c0", "A bolt caught in a glass",
     ["XXXXXXX", "X...X.X", "X..X..X", "X.XoX.X", "X..X..X", "X.X...X", "XXXXXXX"])
rune("timeslip", "Timeslip", "stilling", "swift", "#a8e090", "A clock, its hand racing",
     ["..XXX..", ".X...X.", "X.....X", "XXXo..X", "X.....X", ".X...X.", "..XXX.."])
rune("standstill", "Standstill", "stilling", "heavy", "#a8b880", "A hammer stopped mid-swing",
     ["XXXXX..", "XXXXX..", "..X....", "..X..o.", "..X.o.o", "..X..o.", "..X...."])
# --- BINDING ---
rune("shackle", "Shackle", "binding", "power", "#c06050", "A padlock, shut",
     ["..XXX..", ".X...X.", ".X...X.", "XXXXXXX", "XX.o.XX", "XXXXXXX", "......."])
rune("strangler", "Strangler", "binding", "poison", "#9aa848", "A thorned vine winding",
     ["X.X....", ".X.X...", "X.X.o..", "...X.X.", "..o.X.X", "....X.X", ".....X."])
rune("icebound", "Icebound", "binding", "frost", "#a0c0d8", "Two chain links, frosted",
     ["XXXX..o", "X..X.o.", "X.XXXX.", "XXXX..X", "..X...X", "o.XXXXX", ".o....."])
rune("firetrap", "Firetrap", "binding", "fire", "#e86a3a", "A snare's jaws, flames above",
     [".o.o.o.", "o.o.o.o", "X.....X", "XX...XX", "X.X.X.X", "XXXXXXX", "......."])
rune("tether", "Tether", "binding", "lightning", "#e8d888", "Two rings, a spark between them",
     [".......", ".XX.XX.", "X..X..X", "X..o..X", "X..X..X", ".XX.XX.", "......."])
rune("lasso", "Lasso", "binding", "swift", "#b8c070", "A lasso thrown",
     [".XXX...", "X...X..", "X...X..", ".XXX...", "...X...", "....X..", ".....oo"])
rune("anchor", "Anchor", "binding", "heavy", "#9a8060", "An anchor",
     ["...X...", "..XoX..", "...X...", "XXXXXXX", "...X...", "X..X..X", ".XXXXX."])
# --- THE CITY'S RUNES WITH EACH OTHER ---
rune("confluence", "Confluence", "pulling", "splitting", "#a890f0", "Three streams running into one pool",
     ["X.....X", ".X.X.X.", "..X.X..", "...X...", "..ooo..", ".ooooo.", "......."])
rune("beckon", "Beckon", "pulling", "hexing", "#9894d8", "An eye at the heart of a vortex",
     [".XXXXX.", "X.....X", "X.XXX.X", "X.XoX.X", "X.X...X", "X.XXXXX", "X......"])
rune("horizon", "Horizon", "pulling", "stilling", "#80b0d0", "A dark heart, light bent round its edge",
     ["..ooo..", ".o...o.", "o.XXX.o", "o.X.X.o", "o.XXX.o", ".o...o.", "..ooo.."])
rune("reel", "Reel", "pulling", "binding", "#c4b4e8", "A hook on a line",
     ["....X..", "....X..", "....X..", "....X..", "X...X..", "X..XX..", ".XXo..."])
rune("coven", "Coven", "splitting", "hexing", "#c8b0e0", "Three eyes",
     [".......", "XXX.XXX", "XoX.XoX", "XXX.XXX", ".......", "..XXX..", "..XoX.."])
rune("constellation", "Constellation", "splitting", "stilling", "#b0e0d8", "Stars hanging still, joined by lines",
     ["o......", ".X.....", "..X..o.", "...o.X.", "....X..", "...X...", "..o...."])
rune("web", "Web", "splitting", "binding", "#d0c0b0", "A web",
     ["X..X..X", ".X.X.X.", "XXXXXXX", ".XXoXX.", "XXXXXXX", ".X.X.X.", "X..X..X"])
rune("torpor", "Torpor", "hexing", "stilling", "#98c8b0", "A heavy eyelid, shut",
     [".......", ".......", "XXXXXXX", ".X.X.X.", ".......", ".o.o.o.", "..o.o.."])
rune("witchknot", "Witchknot", "hexing", "binding", "#b0a0a8", "A knot with an eye in it",
     [".XX.XX.", "X..X..X", "X.XoX.X", ".X.X.X.", "X.X.X.X", "X..X..X", ".XX.XX."])
rune("amber", "Amber", "stilling", "binding", "#e0a040", "A fly caught in amber",
     ["..XXX..", ".XXXXX.", "XXoXoXX", "XXXoXXX", "XXoXoXX", ".XXXXX.", "..XXX.."])
assert len(R3) == 45, len(R3)
