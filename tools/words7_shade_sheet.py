#!/usr/bin/env python3
"""REAPING'S SPIRIT, AT HIS WORD: the picture (docs/mockups/words7/pictures/reaping_shade.png), from the pictures of
tools/scenarios/words7_film.mjs with SET=shade (the game's own screen in the practice room, two screen pixels a game pixel):
the early floors' Shade as the game shows it beside the little grey Shade Reaping raises, at the game's size and at twice;
and a key picture of its claw rake, at the game's size and at twice. Captioned.
   python3 tools/words7_shade_sheet.py <the pair's still> <the rake's picture> <out.png>"""
import sys
from PIL import Image, ImageDraw, ImageFont

pair_png, rake_png, out = sys.argv[1:4]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
big, mid, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 20), ImageFont.truetype(R, 17)
BG = (16, 14, 26)
PALE, GREY, MOSS = (240, 232, 214), (186, 180, 204), (207, 230, 212)
W = 1200

# where each is on the screen (screen pixels): the pair round the two Shades, the rake round the little Shade and what it rakes
pair = Image.open(pair_png).convert('RGB').crop((672, 222, 872, 330))
rake = Image.open(rake_png).convert('RGB').crop((770, 206, 920, 314))
twice = lambda im: im.resize((im.width * 2, im.height * 2), Image.NEAREST)

H = 960
o = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(o)
d.text((30, 22), 'REAPING, BEHIND: THE LITTLE GREY SHADE', font=big, fill=MOSS)
d.text((30, 64), 'The spirit a kill rises as is always a little Shade, like the early floors’ Shade: in greys,', font=small, fill=PALE)
d.text((30, 86), '0.7 its size, a thin edge of his cyan to show it is his. It rakes with its claws.', font=small, fill=PALE)


def row(y, title, im, notes):
    d.text((30, y), title, font=mid, fill=PALE)
    y += 34
    o.paste(im, (30, y))
    d.text((30, y + im.height + 8), 'at the game’s size', font=small, fill=GREY)
    x2 = 30 + im.width + 40
    t = twice(im)
    o.paste(t, (x2, y))
    d.text((x2, y + t.height + 8), 'at twice', font=small, fill=GREY)
    xt = x2 + t.width + 36
    for j, line in enumerate(notes):
        d.text((xt, y + 10 + 26 * j), line, font=small, fill=PALE if j == 0 else GREY)
    return y + t.height + 48


y = 130
y = row(y, 'The early floors’ Shade (left), and the little grey Shade Reaping raises (right)', pair, [
    'Left: the Shade as the game shows it,', 'an enemy, its rim the enemy’s pink.', '',
    'Right: the spirit his kill rose as: the', 'same Shade in greys, its light and', 'shade kept, 0.7 its size, edged in', 'his cyan. It glides as the Shade does.'])
y = row(y, 'Its claw rake, at the instant it lands', rake, [
    'Its claws drawn back and held, then', 'one fast rake: four curved claw gashes', 'torn across what it strikes, grey-white,', 'his cyan at their points; they close up', 'and fade in a quarter of a second.'])
o = o.crop((0, 0, W, y + 6))
o.save(out)
print(out, o.size)
