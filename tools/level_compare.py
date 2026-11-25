"""A floor as it was and as remade, side by side, from above (the five weakest floors, LEVELS2): its ground (where the
hero can walk), each monster a dot (red; gold for a pack's leader), chests gold squares, the start cyan, the boss a large
red mark, the remade floor's new side areas outlined (treasure gold, guardian orange, any other new area white).
  python3 tools/level_compare.py <N> <out.png> [title] [new room ids, comma separated]"""
import json, sys
from PIL import Image, ImageDraw, ImageFont

N = int(sys.argv[1]); OUT = sys.argv[2]; TITLE = sys.argv[3] if len(sys.argv) > 3 else "Floor %d" % N
A = "godot/assets/"

def load(d):
    L = json.load(open(A + d + "/layout.json")); M = json.load(open(A + d + "/monsters.json"))
    return L, M["monsters"]

def font(s):
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"]:
        try: return ImageFont.truetype(f, s)
        except Exception: pass
    return ImageFont.load_default()

was, now = load("floor%d" % N), load("floor%dv2" % N)
W = max(was[0]["w"], now[0]["w"]); H = max(was[0]["h"], now[0]["h"])
S = max(2, min(6, 900 // max(W, H)))
PAD, TOP = 30, 110
img = Image.new("RGB", (PAD * 3 + W * S * 2, TOP + H * S + 120), (18, 16, 30))
d = ImageDraw.Draw(img)
d.text((PAD, 20), TITLE, fill=(235, 230, 255), font=font(34))
old_kinds = {r["kind"] for r in was[0]["rooms"]}
## (rooms of a kind the floor did not have, or named on the command line by id: the new side areas)
NEW_IDS = {int(a) for a in sys.argv[4].split(",")} if len(sys.argv) > 4 and sys.argv[4] else set()

def draw(L, mons, ox, label):
    w = L["w"]
    for i, v in enumerate(L["walk"]):
        if v:
            x, y = i % w, i // w
            d.rectangle([ox + x * S, TOP + y * S, ox + x * S + S - 1, TOP + y * S + S - 1], fill=(92, 88, 120))
    if L is now[0]:
        for r in L["rooms"]:
            if r["kind"] in old_kinds and r["id"] not in NEW_IDS:
                continue
            c = {"treasure": (255, 200, 60), "guardian": (255, 140, 40)}.get(r["kind"], (240, 240, 240))
            d.rectangle([ox + r["x"] * S - 3, TOP + r["y"] * S - 3, ox + (r["x"] + r["w"]) * S + 3, TOP + (r["y"] + r["h"]) * S + 3], outline=c, width=3)
    for m in mons:
        if m.get("boss"): continue
        x, y = ox + m["x"] * S, TOP + m["y"] * S
        c = (255, 200, 60) if m.get("rarity") in ("leader", "champion") or m.get("champion") else (230, 60, 70)
        d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=c)
    for p in L["props"]:
        if p["kind"] == "chest":
            x, y = ox + p["x"] * S, TOP + p["y"] * S
            d.rectangle([x - 5, y - 5, x + 5, y + 5], fill=(255, 210, 70), outline=(40, 30, 0))
    s = L["start"]; x, y = ox + s["x"] * S, TOP + s["y"] * S
    d.ellipse([x - 7, y - 7, x + 7, y + 7], outline=(80, 230, 255), width=3)
    if L.get("boss"):
        b = L["boss"]; x, y = ox + b["x"] * S, TOP + b["y"] * S
        d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=(200, 30, 40), outline=(255, 255, 255), width=2)
    packs = len({m.get("packId") for m in mons if not m.get("boss")})
    chests = sum(1 for p in L["props"] if p["kind"] == "chest")
    d.text((ox, TOP - 42), "%s:  %d monsters, %d packs, %d chests" % (label, sum(1 for m in mons if not m.get("boss")), packs, chests), fill=(235, 230, 255), font=font(24))

draw(*was, PAD, "AS IT IS")
draw(*now, PAD * 2 + W * S, "REMADE")
y = TOP + H * S + 30
items = [((230, 60, 70), "monster"), ((255, 200, 60), "pack leader"), ((255, 210, 70), "chest"), ((80, 230, 255), "start"), ((200, 30, 40), "boss"), ((255, 200, 60), "new treasure area"), ((255, 140, 40), "new guardian area"), ((240, 240, 240), "other new area")]
x = PAD
for c, t in items:
    d.rectangle([x, y + 6, x + 16, y + 22], fill=c); d.text((x + 24, y), t, fill=(220, 215, 240), font=font(22)); x += 50 + int(d.textlength(t, font=font(22)))
img.save(OUT)
print(OUT, img.size)
