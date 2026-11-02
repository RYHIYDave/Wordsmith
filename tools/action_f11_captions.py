#!/usr/bin/env python3
"""THE FLOORS 11 TO 15 ACTION SHEET, put together with its captions for the owner's phone (the panels are tools/action_f11_sheet.ts's).
   python3 tools/action_f11_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('chop.png', 'THE HUSHED WATCHMAN’S HALBERD CHOP (FLOOR 11)', 'Heaved up · HELD over his head · over the top · BITES THE FLOOR (2 frames, smeared) · stuck · stood again'),
    ('chop_scene.png', '', 'Its reach marked while he holds it · the bite and the floor split on before him (from behind)'),
    ('chop_old_new.png', 'THE OLD SWEEP · THE NEW CHOP · SAME SCALE', 'Old: raised, then swept round low · New: held over the head, then down into the floor in two frames'),
    ('lob.png', 'THE LANTERN THROW', 'Off his belt · swung back high, HELD, flaring · over · LOBBED (2 frames, smeared) · after it · another from his belt'),
    ('lob_scene.png', '', 'Lobbed high, its shadow under it, where it lands marked · a pool of burning oil, 1.9 tiles round, 6 s'),
    ('lob_old_new.png', 'THE OLD ROUND SWEEP · THE NEW THROW · SAME SCALE', 'Old: hauled back low, then spun all the way round · New: the lantern held high, then lobbed'),
    ('harvest.png', 'THE REAPER’S HARVEST (FLOOR 13)', 'HELD · cut, stepping in · a beat · backhand, stepping in · crouched, HELD · the leap: HOOKED INTO THE GROUND'),
    ('harvest_scene.png', '', 'The knight backs off from each cut · the hook bursts the chaff 1.5 tiles round (from behind)'),
    ('harvest_old_new.png', 'THE OLD SLASH · THE NEW HARVEST · SAME SCALE', 'Old: one slash · New: three strikes, each two frames, the last a leap and a hook'),
    ('blow.png', 'THE ORDERLY’S MALLET BLOW, BY MOVEMENT 9 (FLOOR 14)', 'Lifted · HELD high, its hoops glinting · over the top · IN THE FLOOR (2 frames, smeared) · bent over it · heaved up'),
    ('blow_old_new.png', 'THE OLD BLOW · THE NEW · SAME SCALE', 'Old: held a moment, five frames down · New: held twice as long, two frames down, 1.5 tiles round (was 0.75)'),
    ('gurney.png', 'THE GURNEY CHARGE', 'Swinging it back · HELD, wound round · down past his hip · SLAMMED INTO THE GURNEY (2 frames) · after it · heaving up'),
    ('gurney_scene_a.png', '', 'The lane marked from the gurney, 1.6 tiles wide · the gurney careering down it, 9 tiles a second'),
    ('gurney_scene_b.png', '', 'It crashes on whatever it hits · or, out of its way, at the lane’s end (from behind)'),
    ('gurney_old_new.png', 'THE OLD QUAKE · THE NEW CHARGE · SAME SCALE', 'Old: a leap and the mallet in the floor · New: the mallet swung back, then slammed into the gurney'),
    ('slam.png', 'THE BOOKWARDEN’S TOME SLAM, BY MOVEMENT 9 (FLOOR 15)', 'Heaved up · whirling, the body HELD · over the top · FLAT ON THE FLOOR (2 frames, smeared) · held · dragged up'),
    ('slam_old_new.png', 'THE OLD SLAM · THE NEW · SAME SCALE', 'Old: five frames over the top · New: two, its dust 1.7 tiles round (was 1.2)'),
    ('barrage.png', 'THE BOOK BARRAGE', 'His hand thrown up · the books rising, HELD · the thrust (2 frames, smeared) · flung · his hand out · lowered'),
    ('barrage_scene.png', '', 'The books torn up off the floor, wheeling round him at head height, held · flung at you one after another'),
    ('barrage_scene_b.png', '', 'Each straight at where you are as it goes, 11 tiles a second, a little fanned · run across the stream (from behind)'),
    ('barrage_old_new.png', 'THE OLD PAGE STORM · THE NEW BARRAGE · SAME SCALE', 'Old: the tome thrown open, a storm of pages · New: his hand raised, then thrust at you (the books are in the scene above)'),
]
W = 1200
parts = []
for name, title, line in ROWS:
    im = Image.open(os.path.join(src, name)).convert('RGB')
    if im.width > W:
        im = im.resize((W, round(im.height * W / im.width)), Image.NEAREST)
    band = 70 if title else (36 if line else 4)
    card = Image.new('RGB', (W, im.height + band), BG)
    d = ImageDraw.Draw(card)
    if title:
        d.text((16, 8), title, font=big, fill=TITLE)
    if line:
        d.text((16, 42 if title else 8), line, font=small, fill=LINE)
    card.paste(im, ((W - im.width) // 2, band))
    parts.append(card)
H = sum(p.height for p in parts)
sheet = Image.new('RGB', (W, H), BG)
y = 0
for p in parts:
    sheet.paste(p, (0, y))
    y += p.height
sheet.save(out, optimize=True)
print(out, sheet.size)
