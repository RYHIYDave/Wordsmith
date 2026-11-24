# The five meld runes of Reaping with the damage runes (his "Yes and work on reaping", 24 Nov 2026): each its own glyph ('X' its
# colour, 'o' its glow), its colour, its two runes, and what the symbol shows. Drawn by ../meld_runes/render.py's stone(). By his
# Art Rulebook: nothing on his side in the enemy's pink or gold, and no plain box or ring.
#   python3 docs/mockups/meld_runes5/design.py   (writes runes.json beside it)
import json, os
R5 = {}
SHOWS5 = {}
def rune(id, name, a, b, color, shows, glyph):
    assert len(glyph) == 7 and all(len(r) == 7 for r in glyph), id
    R5[id] = {"name": name, "of": [a, b], "color": color, "glyph": glyph}
    SHOWS5[id] = shows

rune("cinderbrood", "Cinderbrood", "reaping", "fire", "#d0582a", "A horned head rising out of a flame",
     ["X.....X", "XX...XX", ".XXXXX.", ".XoXoX.", "..XXX..", ".X.X.X.", "XX.X.XX"])
rune("wintergrave", "Wintergrave", "reaping", "frost", "#6aa0d8", "A hooded head over a fringe of icicles",
     ["...X...", "..XXX..", ".XX.XX.", ".XoXoX.", ".XXXXX.", "X.X.X.X", "X.X.X.."])
rune("stormwake", "Stormwake", "reaping", "lightning", "#d8c860", "A ball of storm-light, bolts crackling off it",
     ["..X....", "...X.X.", "..XXX..", ".XXoXX.", "..XXX..", ".X.X...", "....X.."])
rune("bogborn", "Bogborn", "reaping", "poison", "#8aa83a", "A squatting toad, its eyes on top",
     [".......", ".oX.Xo.", "XXXXXXX", "X.XXX.X", "XXXXXXX", ".X...X.", "XX...XX"])
rune("charnel", "Charnel", "reaping", "power", "#b8b098", "A skull over two great fists",
     ["..XXX..", ".XoXoX.", ".XXXXX.", "..X.X..", "XX...XX", "XX...XX", "......."])

json.dump(R5, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'runes.json'), 'w'), indent=1)
print(len(R5), 'runes')
