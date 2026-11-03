# The Veteran's icons picture for the owner (docs/mockups/veteran_icons/pictures/veteran_icons.png): the dev page
# (src/dev/preview_veteran_icons.ts) with the game's own buttons on a phone laid into its middle, from a screenshot of the
# game (tools/scenarios/veteran_icons_hud.mjs, on a page built by tools/veteran_icons_page.mjs).
#   python3 tools/veteran_icons_picture.py <page.png> <phone_shot.png> <out.png>
import sys
from PIL import Image

page_png, shot_png, out_png = sys.argv[1:4]
STRIP_Y, STRIP_H = 616, 196  # (the page says where: its console line "strip 616 196")
page = Image.open(page_png).convert('RGB')
shot = Image.open(shot_png).convert('RGB')
# (the phone held sideways, 844 by 390 points at three pixels to a point: its tap and hold plates, and its swipe button)
assert shot.size == (2532, 1170), shot.size
plates = shot.crop((780, 990, 1910, 1170))
swipe = shot.crop((2370, 990, 2532, 1170))
gap = 40
w = plates.width + gap + swipe.width
k = min(1152 / w, (STRIP_H - 12) / plates.height)
row = Image.new('RGB', (w, plates.height), (0, 0, 0))
row.paste(plates, (0, 0))
row.paste(Image.new('RGB', (gap, plates.height), (23, 20, 46)), (plates.width, 0))
row.paste(swipe, (plates.width + gap, 0))
row = row.resize((round(w * k), round(plates.height * k)), Image.LANCZOS)
page.paste(row, (24, STRIP_Y + 4))
page.save(out_png)
print('saved', out_png, page.size)
