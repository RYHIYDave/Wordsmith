# Draws tools/props_map.ts's plan: the floor's ground, its walls dark, every thing on it as a dot (solid ones bigger, the
# cult's camp red), off on the left and on on the right.   python3 tools/props_map.py in.json out.png
import json, sys
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1]))
S = 3
w, h = d[0]['w'], d[0]['h']
im = Image.new('RGB', (w * S * 2 + 30, h * S + 40), (24, 26, 48))
dr = ImageDraw.Draw(im)
for k, fl in enumerate(d):
    ox = k * (w * S + 30)
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if fl['tiles'][i] == 1:
                dr.rectangle([ox + x * S, 30 + y * S, ox + x * S + S - 1, 30 + y * S + S - 1], fill=(92, 96, 120))
    for p in fl['props']:
        name = p['name'] or ''
        camp = any(s in name for s in ["cult's tent", "watchfire", "cult's cauldron", 'weapon rack', 'stakes', 'skull standard', 'war drum', 'offering bowl', "captives' cage", 'lean-to', 'bedroll', 'a cold fire'])
        hold = 'brazier' in name or 'banner' in name or 'ring of magic' in name or 'obelisk' in name or 'altar' in name or 'gate' in name
        r = 3 if p['solid'] else 2
        col = (255, 96, 80) if camp else (200, 200, 120) if hold else (240, 240, 250) if p['solid'] else (150, 220, 160)
        x, y = ox + p['x'] * S, 30 + p['y'] * S
        dr.ellipse([x - r, y - r, x + r, y + r], fill=col)
    dr.text((ox + 6, 8), ('AFTER: fewer, toward the edges; the camp a ring' if fl['on'] else 'BEFORE: as the game is now') + f"  ({len(fl['props'])} things)", fill=(240, 240, 250))
im.save(sys.argv[2])
