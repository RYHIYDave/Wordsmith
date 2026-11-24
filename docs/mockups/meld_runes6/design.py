# The 110 meld runes of the High City's five runes (Piercing, Bleeding, Reaping, Culling, Surging) with the runes before them and
# with each other (his doc "High City Melds", https://claude.ai/artifact/9BqzAMcqTjGwiARFPBdLEk). His words, 24 Nov 2026: “We talked
# about the runes and just trying to make them half of each base rune.  We haven't done that, we will never do that”; and 23 Nov:
# “Create the melds, name them, figure out what they do front, back, crafting, and on enemies, then design the rune, then the
# animations”. So each is its own glyph ('X' its colour, 'o' its glow) showing what the meld does, its own colour, its two runes
# (for the foot), and what it shows; no glyph the same as one of the 192 before (render6.py checks). Drawn by ../meld_runes/
# render.py's stone(). By his Art Rulebook: nothing on his side in the enemy's pink or gold (Leech's and Bleeding's in blood red
# and salmon, Fleeting's in pale lilac), and no plain box or ring.
R6 = {}
SHOWS6 = {}
def rune(id, name, a, b, color, shows, glyph):
    assert len(glyph) == 7 and all(len(r) == 7 for r in glyph), (id, [len(r) for r in glyph])
    assert id not in R6, id
    R6[id] = {"name": name, "of": [a, b], "color": color, "glyph": glyph}
    SHOWS6[id] = shows

# --- PIERCING ---
rune("impaler", "Impaler", "piercing", "power", "#d05a4c", "A spear run through three bodies",
     [".......", ".X.X.X.", ".X.X.XX", "XXXXXXo", ".X.X.XX", ".X.X.X.", "......."])
rune("stinger", "Stinger", "piercing", "poison", "#b8c840", "A wasp's striped body and its sting",
     ["..XXX..", ".X...X.", ".XXXXX.", ".X...X.", "..XXX..", "...X...", "...o..."])
rune("icelance", "Icelance", "piercing", "frost", "#78b8f0", "A lance with a frost crystal at its heart",
     ["......o", ".....X.", "..X.X..", "...X...", "..X.X..", ".X.....", "X......"])
rune("sunspear", "Sunspear", "piercing", "fire", "#ff9a3a", "An upright spear, its point a blazing sun",
     ["X..X..X", ".X.o.X.", "..XXX..", "...X...", "...X...", "...X...", "..XXX.."])
rune("stormlance", "Stormlance", "piercing", "lightning", "#f0e868", "A crooked rod of lightning, forked at its end",
     ["X..X..X", ".X.X.X.", "..XoX..", "...X...", "..X....", "...X...", "..X...."])
rune("dart", "Dart", "piercing", "swift", "#90d070", "A thin dart with speed lines behind it",
     [".......", "XX.....", "...XXX.", "XXXXXXo", "...XXX.", "XX.....", "......."])
rune("batteringram", "Battering Ram", "piercing", "heavy", "#b08850", "A horned ram's head on its beam",
     ["...XX..", "..X..XX", "....XXX", "XXXXXoX", "....XXX", "..X..XX", "...XX.."])
rune("pitchfork", "Pitchfork", "piercing", "twin", "#60c0b0", "A fork of two prongs",
     [".X...X.", ".X...X.", ".X...X.", ".XXXXX.", "...X...", "...X...", "...o..."])
rune("bloodlance", "Bloodlance", "piercing", "leech", "#c84a48", "A drop of blood run through",
     ["...X...", "..XXX..", ".XXoXX.", ".XXXXX.", "..XXX..", "...X...", "...X..."])
rune("fuse", "Fuse", "piercing", "volatile", "#9a62d0", "A line with its charges going off along it",
     ["X......", ".X..o..", "..X....", "...X.o.", "....X..", ".o...X.", "......o"])
rune("bodkin", "Bodkin", "piercing", "precise", "#e8ecf4", "A narrow point through a gap in plate",
     ["...o...", "...X...", "..XXX..", "...X...", "X..X..X", "XX.X.XX", "XX.X.XX"])
rune("barrage", "Barrage", "piercing", "frenzied", "#f07048", "Arrows loosed one after another",
     ["XXX.o..", ".......", "XXXXX.o", ".......", "XXX.o..", ".......", "XXXXX.o"])
rune("spearwall", "Spearwall", "piercing", "guarding", "#48a870", "A shield with spears rising behind it",
     [".X.X.X.", ".X.X.X.", "XXXXXXX", "X.XoX.X", ".X...X.", "..X.X..", "...X..."])
rune("longspear", "Longspear", "piercing", "lasting", "#a89088", "A long spear, its line lingering under it",
     [".......", ".....X.", "XXXXXXo", ".....X.", ".......", "X.X.X.X", "......."])
rune("flicker", "Flicker", "piercing", "fleeting", "#ece0f4", "A broken line ending in a flash",
     [".....X.", "....XoX", ".....X.", "...X...", "..X....", ".......", "X......"])
rune("broadspear", "Broadspear", "piercing", "vast", "#b08a58", "A broad, leaf-shaped spearhead",
     ["...X...", "..XXX..", ".XXXXX.", "XXXoXXX", ".XXXXX.", "...X...", "...X..."])
rune("gaff", "Gaff", "piercing", "pulling", "#7c78d8", "A head hauled back along its line",
     ["......X", "XX..XX.", "XXXX...", "oXXXXXX", "XXXX...", "XX..XX.", "......X"])
rune("trident", "Trident", "piercing", "splitting", "#d8b0f0", "One shaft, three points",
     ["X..X..X", "X..X..X", "XXXXXXX", "...X...", "...X...", "...o...", "...X..."])
rune("witchpin", "Witchpin", "piercing", "hexing", "#b0a8d0", "A pin through a cursed eye",
     ["...X...", "..XXX..", ".X.X.X.", "XX.o.XX", ".X.X.X.", "..XXX..", "...X..."])
rune("sundial", "Sundial", "piercing", "stilling", "#80e0a8", "The shadow of a needle on a dial",
     ["...X...", "...X...", "...X...", "..XoX..", ".X...X.", "X.....X", "XXXXXXX"])
rune("skewer", "Skewer", "piercing", "binding", "#c0ac84", "A stake driven through a bound cord",
     ["...o...", "...X...", "X..X..X", ".XXXXX.", "X..X..X", "...X...", "..XXX.."])
# --- BLEEDING ---
rune("gore", "Gore", "bleeding", "power", "#d0383c", "A horn with blood running off it",
     ["X......", "XX.....", ".XX....", "..XXX..", "...XXX.", "....XoX", ".....o."])
rune("gangrene", "Gangrene", "bleeding", "poison", "#8a9a28", "A wound festering, spreading",
     ["X.....X", ".X.X.X.", "..XoX..", ".XXXXX.", "..XoX..", ".X.X.X.", "X.....X"])
rune("rimeblood", "Rimeblood", "bleeding", "frost", "#c83c50", "A drop of blood frozen into spikes",
     ["...X...", "X.XXX.X", ".XXoXX.", "XXXXXXX", ".XXXXX.", "X.XXX.X", "...X..."])
rune("bloodboil", "Bloodboil", "bleeding", "fire", "#d0482c", "A cauldron of blood bubbling",
     [".o...o.", "...o...", "X.....X", "XXXXXXX", ".XXXXX.", ".X...X.", "XX...XX"])
rune("galvanic", "Galvanic", "bleeding", "lightning", "#c85040", "A bolt splitting a drop of blood",
     ["....X..", "...X...", "..XXX..", ".XXoXX.", ".XXX.X.", "..X.X..", ".X....."])
rune("lacerate", "Lacerate", "bleeding", "swift", "#e04848", "Three quick slashes",
     ["X..X..X", ".X..X..", "..X..X.", "o..X..X", ".o..X..", "..o..X.", "......."])
rune("mangle", "Mangle", "bleeding", "heavy", "#cc5238", "A jaw of teeth closing",
     ["XXXXXXX", "X.X.X.X", ".X.X.X.", "...o...", ".X.X.X.", "X.X.X.X", "XXXXXXX"])
rune("fangs", "Fangs", "bleeding", "twin", "#dc5450", "Two fangs, two drops",
     ["XXXXXXX", ".X...X.", ".X...X.", "..X.X..", ".......", "..o.o..", "..o.o.."])
rune("bloodfeast", "Bloodfeast", "bleeding", "leech", "#d8584c", "A goblet brimming with blood",
     ["XXXXXXX", "X.ooo.X", ".XXXXX.", "..XXX..", "...X...", "...X...", ".XXXXX."])
rune("bloodburst", "Bloodburst", "bleeding", "volatile", "#e04c34", "A drop bursting apart",
     ["X..X..X", ".X...X.", "...X...", "X.XoX.X", "..XXX..", ".X...X.", "X..X..X"])
rune("artery", "Artery", "bleeding", "precise", "#e0605c", "A vein forking, one point struck",
     ["...X...", "...X...", "..X.X..", ".X...X.", ".X...o.", "X.....X", "X.....X"])
rune("bloodrage", "Bloodrage", "bleeding", "frenzied", "#e04a34", "A drop with flames rising off it",
     ["X.X.X.X", ".X.X.X.", "...X...", "..XXX..", ".XXoXX.", ".XXXXX.", "..XXX.."])
rune("thornshield", "Thornshield", "bleeding", "guarding", "#7a8a48", "A shield bristling with thorns",
     ["X.X.X.X", "XXXXXXX", "XX.o.XX", "XX...XX", ".XX.XX.", "X.XXX.X", "...X..."])
rune("hemorrhage", "Hemorrhage", "bleeding", "lasting", "#d43a48", "Drops falling one after another",
     ["..X....", ".XXX...", ".XoX...", "..X..X.", "....XXX", "....XXX", ".....X."])
rune("papercut", "Papercut", "bleeding", "fleeting", "#e6d8f2", "A thin cut, a bead of blood at its end",
     ["......X", ".....X.", "....X..", "...X...", "..X....", ".o.....", "o.o...."])
rune("bramble", "Bramble", "bleeding", "vast", "#9a6c3c", "A spreading thorny bramble",
     ["X..X..X", ".XX.XX.", "X.XoX.X", ".X.X.X.", "XX.X.XX", "...X...", "..XXX.."])
rune("fishhook", "Fishhook", "bleeding", "pulling", "#d4583e", "A barbed hook with a drop on it",
     ["...X...", "...X...", "...X...", "X..X...", "XX.X...", ".XXo...", "..XX..."])
rune("thornspray", "Thornspray", "bleeding", "splitting", "#c05a4a", "Thorns flung out to take root",
     ["X.....X", ".X.X.X.", "..XXX..", "XXXoXXX", "..XXX..", ".X...X.", "X.....X"])
rune("bloodhex", "Bloodhex", "bleeding", "hexing", "#c6503a", "A lashed, cursed eye weeping blood",
     ["X.X.X.X", "..XXX..", ".X...X.", "X..o..X", ".X...X.", "..XXX..", "...X..."])
rune("clot", "Clot", "bleeding", "stilling", "#d85058", "A drop held still in a bubble",
     ["..XXX..", ".X...X.", "X..X..X", "X.XoX.X", "X.XXX.X", ".X...X.", "..XXX.."])
rune("briar", "Briar", "bleeding", "binding", "#b86a48", "A thorned briar wound into a knot",
     ["X.XXX.X", ".X...X.", "X..X..X", ".X.o.X.", "X..X..X", ".X...X.", "X.XXX.X"])
# --- REAPING ---
rune("wraithstep", "Wraithstep", "reaping", "swift", "#7cb898", "A wraith running, its trail behind",
     ["....XX.", "...XXoX", "XX.XXX.", "...XXX.", "XX.X.X.", "...X..X", "......."])
rune("tombstone", "Tombstone", "reaping", "heavy", "#8a8478", "A headstone, settled heavy",
     [".XXXXX.", "XX...XX", "XX.o.XX", "XXX.XXX", "XX...XX", "XXXXXXX", "X.X.X.X"])
rune("revenants", "Revenants", "reaping", "twin", "#70b8a8", "Two spirits side by side",
     [".XX.XX.", "XoXXoX.", "XXXXXX.", "XXXXXX.", "X.XX.X.", ".......", "......."])
rune("ghoul", "Ghoul", "reaping", "leech", "#b06a5c", "A skull drinking a drop",
     [".XXXXX.", "X..X..X", "X..X..X", ".XXXXX.", "..X.X..", "...o...", "..XXX.."])
rune("soulburst", "Soulburst", "reaping", "volatile", "#8a74c8", "A soul flying out of a burst",
     ["X..o..X", ".X.X.X.", "..XXX..", "XXX.XXX", "..XXX..", ".X.X.X.", "X..X..X"])
rune("deadeye", "Deadeye", "reaping", "precise", "#d8e4e0", "A skull's eye in a sight",
     ["...X...", ".XXXXX.", ".X.X.X.", "XXXoXXX", ".X.X.X.", ".XXXXX.", "...X..."])
rune("macabre", "Macabre", "reaping", "frenzied", "#e0805c", "A skull in dancing flames",
     ["X.X.X.X", ".X.X.X.", ".XXXXX.", "X..X..X", ".XXXXX.", "..XoX..", "......."])
rune("gravewarden", "Gravewarden", "reaping", "guarding", "#58a07c", "A shield with a spirit's eyes",
     ["XXXXXXX", "X.XXX.X", "XXXXXXX", "XXXoXXX", ".XXXXX.", "..XXX..", "...X..."])
rune("undying", "Undying", "reaping", "lasting", "#9c8c88", "A spirit rising again from its own end",
     ["...X...", "..XoX..", "..XXX..", ".X...X.", "..XXX..", "..XXX..", ".X.X.X."])
rune("fetch", "Fetch", "reaping", "fleeting", "#e8e0f0", "A soul darting home",
     ["...XX..", "..XoXX.", "...XX..", "..X....", ".X.....", "X......", "......."])
rune("legion", "Legion", "reaping", "vast", "#90a880", "A crowd of spirits",
     ["X.X.X.X", "o.o.o.o", "X.X.X.X", ".......", "X.X.X.X", "o.o.o.o", "X.X.X.X"])
rune("gravewell", "Gravewell", "reaping", "pulling", "#6c74b8", "Spirits falling into a well",
     ["X..X..X", ".X.X.X.", "..XXX..", "XXXoXXX", "X.....X", "X.....X", "XXXXXXX"])
rune("poltergeist", "Poltergeist", "reaping", "splitting", "#c8a8e0", "A spirit flinging things",
     ["X...X..", "..o...X", ".XXX...", "XXoXX..", "XXXXX.X", "X.X.X..", "......."])
rune("haunting", "Haunting", "reaping", "hexing", "#a8a0c8", "A spirit with a curse's eye",
     [".XXXXX.", "XX...XX", "X..o..X", "XX...XX", "XXXXXXX", "XXXXXXX", "X.X.X.X"])
rune("limbo", "Limbo", "reaping", "stilling", "#84d8ac", "A spirit held still between two lines",
     ["XXXXXXX", ".......", "...X...", "..XoX..", "..XXX..", "..X.X..", "XXXXXXX"])
rune("gravebind", "Gravebind", "reaping", "binding", "#a8a07c", "A skull bound in a chain",
     [".XXXXX.", "XX.X.XX", "XXXXXXX", "X.X.X.X", "XXXoXXX", "..X.X..", "XX...XX"])
# --- CULLING ---
rune("guillotine", "Guillotine", "culling", "power", "#c86060", "A guillotine's slanted blade between its posts",
     ["XXXXXXX", "X.....X", "X...XXX", "X.XXXXX", "X.....X", "X..o..X", "XX.X.XX"])
rune("nightshade", "Nightshade", "culling", "poison", "#8a7ab8", "A nightshade flower, berries hanging",
     ["X.X.X..", ".XoX...", "X.X.X..", "...X...", "....X..", "...o.o.", "....o.."])
rune("coldcut", "Coldcut", "culling", "frost", "#88b8e0", "A scythe of ice",
     ["XXXXX..", ".....X.", "......X", "...X..X", "..X.X..", ".X..o..", "X......"])
rune("cremate", "Cremate", "culling", "fire", "#e87838", "A column of flame over ashes",
     ["...X...", "..X.X..", "..XoX..", ".XXXXX.", "..XXX..", ".......", "X.X.X.X"])
rune("smite", "Smite", "culling", "lightning", "#e8e070", "A bolt striking down on one below",
     ["XXXXXXX", "...X...", "..X....", "...X...", "....X..", "...o...", "..XXX.."])
rune("coup", "Coup", "culling", "swift", "#a0c878", "One quick stroke, and the blade back at once",
     ["..XXXX.", ".X....X", "X......", "X..X...", "X.XXX..", ".X.o...", "..X...."])
rune("crusher", "Crusher", "culling", "heavy", "#9c8060", "A hammer falling, cracks spreading",
     [".XXXXX.", ".XXXXX.", "...X...", "...X...", "...o...", "X.X.X.X", ".X...X."])
rune("scissors", "Scissors", "culling", "twin", "#78b8b0", "Two blades crossing",
     ["X.....X", ".X...X.", "..X.X..", "...o...", "..X.X..", "XX...XX", "XX...XX"])
rune("bloodprice", "Bloodprice", "culling", "leech", "#c0605c", "Scales weighing a drop",
     ["...X...", "XXXXXXX", "X..X..X", "X..X.oX", "XX.X.XX", "...X...", "..XXX.."])
rune("deathburst", "Deathburst", "culling", "volatile", "#9068c0", "A skull bursting apart",
     ["X.....X", ".XXXXX.", ".X.X.X.", ".XXoXX.", "..XXX..", ".X...X.", "X.....X"])
rune("mercy", "Mercy", "culling", "precise", "#e0e4ec", "A narrow mercy blade, point down",
     ["..XXX..", "...X...", ".XXXXX.", "...X...", "...X...", "...X...", "...o..."])
rune("massacre", "Massacre", "culling", "frenzied", "#e86040", "Four blades whirling",
     ["XX...X.", ".X..XX.", "..XX...", "...o...", "...XX..", ".XX..X.", ".X...XX"])
rune("lastrites", "Last Rites", "culling", "guarding", "#58a090", "A candle burning on a shield",
     ["...o...", "...X...", ".XXXXX.", ".XXXXX.", "XX.X.XX", ".X...X.", "..XXX.."])
rune("deathwatch", "Deathwatch", "culling", "lasting", "#9c8890", "An open eye that waits",
     [".......", "..XXX..", ".X...X.", "X..o..X", ".X...X.", "..XXX..", "X.X.X.X"])
rune("quietus", "Quietus", "culling", "fleeting", "#e4dcf0", "A feather falling",
     ["....X..", "...XX..", "..XoX..", ".XXX...", ".XX....", "X......", "......."])
rune("purge", "Purge", "culling", "vast", "#a8885c", "A wide scythe's sweep",
     ["XXXXXXX", "......X", ".....X.", "...XX..", ".XX....", "X......", "o......"])
rune("gallows", "Gallows", "culling", "pulling", "#7a7ac8", "A rope hanging from a beam",
     ["XXXXXXX", "X....X.", "X....X.", "X...XoX", "X....X.", "X......", "XXX...."])
rune("decimate", "Decimate", "culling", "splitting", "#c8a0e8", "One mark splitting into ten",
     ["X.X.X.X", ".X.X.X.", "X.X.X.X", "...X...", "...X...", "..XoX..", "...X..."])
rune("condemn", "Condemn", "culling", "hexing", "#a8a4c0", "A pointing hand, condemning",
     [".XXXX..", "XX..X..", "XXXXXXX", "XX.....", "XXXo...", ".XX....", "......."])
rune("finalhour", "Final Hour", "culling", "stilling", "#88d8b0", "An hourglass with its last grain falling",
     ["XXXXXXX", ".X...X.", "..X.X..", "...X...", "..XoX..", ".XXXXX.", "XXXXXXX"])
rune("noose", "Noose", "culling", "binding", "#b8a480", "A hangman's noose",
     ["...X...", "...X...", "..XXX..", "..XXX..", ".X...X.", ".X.o.X.", "..XXX.."])
# --- SURGING ---
rune("upheaval", "Upheaval", "surging", "power", "#c85a50", "Ground heaving up into a peak",
     ["...o...", "..XXX..", ".X.X.X.", "X..X..X", "..XXX..", ".XXXXX.", "XXXXXXX"])
rune("pestilence", "Pestilence", "surging", "poison", "#a8c038", "A sick cloud, its rot raining in waves",
     [".XX.XX.", "XXXXXXX", "XXXoXXX", ".XXXXX.", ".......", "X.X.X.X", ".X.X.X."])
rune("blizzard", "Blizzard", "surging", "frost", "#70a8e0", "Hail falling slantwise",
     ["X..X..X", ".X..X..", "..X..X.", "o..X..X", ".o..X..", "..o..X.", "...o..o"])
rune("nova", "Nova", "surging", "fire", "#ff8838", "A star of fire",
     ["...X...", ".X.X.X.", "..XXX..", "XXXoXXX", "..XXX..", ".X.X.X.", "...X..."])
rune("thunderclap", "Thunderclap", "surging", "lightning", "#e8e060", "Bolts cracking out from one point",
     ["X..X...", ".X..X.X", "..X.X..", "XX.o.XX", "..X.X..", "X.X..X.", "...X..X"])
rune("rush", "Rush", "surging", "swift", "#88c868", "Surging forward over the ground",
     ["X..X...", ".X..X..", "..X..Xo", ".X..X..", "X..X...", ".......", "XXXXXXX"])
rune("seismic", "Seismic", "surging", "heavy", "#a08048", "A blow on the ground, cracks splitting under it",
     ["...o...", "..XXX..", "XXXXXXX", "...X...", "..X.X..", ".X...X.", "X..X..X"])
rune("tremor", "Tremor", "surging", "twin", "#60b0a8", "Two waves, one after the other",
     [".......", "..X..X.", ".X.XX.X", "X...X..", ".......", "..X..o.", ".X.XX.X"])
rune("heartbeat", "Heartbeat", "surging", "leech", "#d0605c", "A heartbeat's line",
     [".......", "...X...", "..X.X..", "XX...X.", ".....Xo", "......X", "......."])
rune("overload", "Overload", "surging", "volatile", "#a868f0", "A rune crackling past its edge",
     ["X..X..X", "..XXX..", ".XX.XX.", "XX.o.XX", ".XX.XX.", "..XXX..", "X..X..X"])
rune("lens", "Lens", "surging", "precise", "#e0e8f4", "A wave focused through a lens into a beam",
     ["X.....X", ".X...X.", "..XXX..", "..XoXXX", "..XXX..", ".X...X.", "X.....X"])
rune("crescendo", "Crescendo", "surging", "frenzied", "#e86a40", "Waves rising louder",
     [".....XX", "....X..", "..XX...", ".X..XXo", "X..X...", "..X....", ".X....."])
rune("bastion", "Bastion", "surging", "guarding", "#40a070", "A tower wall with a wave breaking on it",
     ["X.X.X.X", "XXXXXXX", "XX.o.XX", "XXXXXXX", "XX.X.XX", ".......", "X.X.X.X"])
rune("resonance", "Resonance", "surging", "lasting", "#9cc4d8", "A note ringing out both ways",
     ["X.....X", ".X...X.", "X.X.X.X", "X..o..X", "X.X.X.X", ".X...X.", "X.....X"])
rune("spark", "Spark", "surging", "fleeting", "#f0e4f8", "A small spark, flicking",
     [".......", "...X...", ".X.X.X.", "..XoX..", ".X.X.X.", "...X...", "......."])
rune("tsunami", "Tsunami", "surging", "vast", "#7aa0d0", "A great wave curling over",
     ["..XXXX.", ".X....X", "X..XX.X", "X.X..oX", "X......", "XX.....", "XXXXXXX"])
rune("undertow", "Undertow", "surging", "pulling", "#6c70d0", "A wave going out and drawing back",
     ["XXXXX..", ".....X.", "......X", "o.....X", ".X...X.", "XXXXX..", ".X....."])
rune("ricochet", "Ricochet", "surging", "splitting", "#d0a8ec", "A blow glancing off three ways",
     ["X.....X", ".X...X.", "..X.X..", "..XoX..", ".X...X.", "X.....X", "..XXX.."])
rune("hexwave", "Hexwave", "surging", "hexing", "#a49cc8", "An eye at the heart of a wave",
     ["XX...XX", "..X.X..", ".XXXXX.", "X.XoX.X", ".XXXXX.", "..X.X..", "XX...XX"])
rune("lull", "Lull", "surging", "stilling", "#78d8a4", "A wave flattened still",
     [".......", "..XXX..", ".X...X.", "XXXXXXX", ".......", "XX.o.XX", "......."])
rune("tangle", "Tangle", "surging", "binding", "#b0a078", "Snares strung round in a ring of knots",
     ["XX.X.XX", "X..X..X", ".XXXXX.", "XX.o.XX", ".XXXXX.", "X..X..X", "XX.X.XX"])
# --- THE HIGH CITY'S RUNES WITH EACH OTHER ---
rune("harrow", "Harrow", "piercing", "bleeding", "#c86454", "A spiked bar dragged through",
     [".......", "X.X.X.X", ".......", "XXXXXXo", ".......", "X.X.X.X", "o.o.o.."])
rune("wraithspear", "Wraithspear", "piercing", "reaping", "#90b0a4", "A spirit flying on a spear",
     ["XX.....", "XoX....", ".XX....", "...X...", "....X..", ".....X.", "......X"])
rune("deathblow", "Deathblow", "piercing", "culling", "#9898b0", "A spear through a skull",
     ["...X...", ".XXXXX.", "XX.X.XX", "XXXXXXX", ".X.o.X.", "...X...", "...X..."])
rune("breakthrough", "Breakthrough", "piercing", "surging", "#5a7ab8", "A spear bursting through a wall",
     ["XX.X...", "XX..X..", "XXXXXXo", "XX..X..", "XX.X...", "XX.....", "XX....."])
rune("bloodharvest", "Bloodharvest", "bleeding", "reaping", "#c8484c", "A sickle dripping blood",
     ["..XXXX.", ".X....X", "......X", ".....X.", "...XX..", "..X..o.", ".X...o."])
rune("butcher", "Butcher", "bleeding", "culling", "#cc4444", "A cleaver, dripping",
     ["XXXXX..", "XoXXXXX", "XXXXX..", "XXXXX..", "XXXX...", ".......", ".X.X.X."])
rune("bloodwave", "Bloodwave", "bleeding", "surging", "#d84040", "A wave of blood",
     ["...XXX.", "..X...X", ".X..XoX", "X..X...", "XXX....", ".......", "X.X.X.X"])
rune("harvest", "Harvest", "reaping", "culling", "#788a78", "A scythe over a bound sheaf",
     ["XXXXXX.", ".....X.", "....X..", ".X.X.X.", "..XoX..", "...X...", "..X.X.."])
rune("soulstorm", "Soulstorm", "reaping", "surging", "#5a8aa8", "Souls caught in a broken whirl",
     ["o..X...", "..X.XX.", ".X....X", "X..o..X", "X....X.", ".XX.X..", "...X..o"])
rune("deathknell", "Deathknell", "culling", "surging", "#7c8cd0", "A bell tolling",
     ["...X...", "..XXX..", ".X...X.", ".X...X.", "XXXXXXX", "...o...", ".X.X.X."])
assert len(R6) == 110, len(R6)
