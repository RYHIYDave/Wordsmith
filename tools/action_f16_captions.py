#!/usr/bin/env python3
"""THE FLOORS 16 TO 19 ACTION SHEET, put together with its captions for the owner's phone (the panels are tools/action_f16_sheet.ts's).
   python3 tools/action_f16_captions.py <raw dir> <out.png>"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, small = ImageFont.truetype(B, 26), ImageFont.truetype(R, 19)
BG, TITLE, LINE = (12, 10, 20), (240, 232, 208), (200, 194, 220)
ROWS = [
    ('hedge.png', 'THE HUSHED GARDENER’S HEDGE CUT (FLOOR 16)', 'Shears up, open, HELD · SNIP, stepping in · open again · SNIP · crouched, HELD · the leap: SCISSORED INTO THE LAWN'),
    ('hedge_scene.png', '', 'The knight backs off from each snip · the leap’s burst of cut grass 1.6 tiles round (from behind)'),
    ('hedge_old_new.png', 'THE OLD SNAP · THE NEW HEDGE CUT · SAME SCALE', 'Old: one snap · New: three strikes, each two frames, the last a scissoring leap'),
    ('whistle.png', 'THE HUSHED GROOM LOOSES THE HORSE', 'Fingers to his mouth · the WHISTLE, HELD · his arm flung out down the line (2 frames, smeared) · held · lowered'),
    ('whistle_scene.png', '', 'The line marked across the garden while he whistles · the horse out of the mist behind him, down it, through you'),
    ('horse.png', 'THE HORSE: THE PRINCESS’S STEED’S LITTLE COUSIN', 'A palace cart-horse of the Hush’s fog: smaller, heavier, its harness collar, its eyes pink · from in front, from behind'),
    ('whistle_old_new.png', 'THE OLD FORK JAB · THE NEW WHISTLE · SAME SCALE', 'Old: the fork drawn back and jabbed · New: the whistle held, then the arm flung out to loose the horse'),
    ('thrust.png', 'THE PALACE GUARD’S LONG THRUST, BY MOVEMENT 9', 'Brought down · drawn far back, HELD · hips first · THRUST OUT (2 frames, smeared) · carried on · drawn back'),
    ('thrust_old_new.png', 'THE OLD THRUST · THE NEW · SAME SCALE', 'Old: held a moment, three frames out · New: held longer, two frames out, a longer and wider line'),
    ('drill.png', 'THE DRILL (THE PARTISAN GUARD)', 'Over his head, HELD · THE CHOP · wound round, HELD · THE SPIN, a whole turn · raised, HELD · DRIVEN INTO THE GROUND'),
    ('drill_scene.png', '', 'The spin’s ring marked all round him as he winds up · the sword guard’s shockwave where the point goes in (from behind)'),
    ('drill_old_new.png', 'THE OLD SWEEP · THE NEW DRILL · SAME SCALE', 'Old: heaved up, swept round low · New: the spin and the drive (the chop before them)'),
    ('throw_scene_a.png', 'THE MASKED DANCERS’ PARTNER THROW (FLOOR 17)', 'The pair whirl round, HELD at full speed, the lane marked from her place · his arms thrown open: she is flung'),
    ('throw_scene_b.png', '', 'She spins down the lane like a top, 9 tiles, into you · or, off the lane, past you (from behind)'),
    ('throw_lady.png', 'HER PART', 'Her hands in his · swung round him · FLUNG (2 frames) · on the point of her foot, spinning · slowing · posed'),
    ('throw_old_new.png', 'THE OLD SPIN · THE NEW THROW (HIS PART) · SAME SCALE', 'Old: a whirling spin into you · New: he whirls her round, then flings her'),
    ('banner.png', 'THE KING’S KNIGHT’S RALLYING BANNER (FLOOR 19)', 'His hand to the banner on his back · raised high, HELD · DRIVEN INTO THE FLOOR (2 frames) · his sword again'),
    ('banner_back.png', '', 'Carried on his back, furled (in front, behind, walking; his cleave): a change to all his frames while he has it'),
    ('banner_standing.png', 'THE BANNER STANDING · STRUCK · CUT DOWN', 'The King’s colours: blue, old gold, the royal swan · it shudders when struck · cut, its staff splinters and it falls'),
    ('banner_scene.png', '', 'The shockwave as it is planted, its gold reach 3.5 tiles round on the floor · cut down by the knight'),
    ('banner_old_new.png', 'THE OLD SWEEP · THE NEW BANNER · SAME SCALE', 'Old: the greatsword hauled round behind him · New: the banner held aloft, then driven down (his cleave kept)'),
]
W = 1200
parts = []
for name, title, line in ROWS:
    im = Image.open(os.path.join(src, name)).convert('RGB')
    if im.width > W:
        im = im.resize((W, round(im.height * W / im.width)), Image.NEAREST)
    band = 64 if title else (34 if line else 4)
    card = Image.new('RGB', (W, im.height + band), BG)
    d = ImageDraw.Draw(card)
    if title:
        d.text((16, 6), title, font=big, fill=TITLE)
    if line:
        d.text((16, 38 if title else 7), line, font=small, fill=LINE)
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
