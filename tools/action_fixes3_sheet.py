#!/usr/bin/env python3
"""THE THIRD ROUND OF FIXES' SHEET (docs/mockups/action_fixes/pictures/action_fixes3_sheet.png), for the owner's phone: each of the four,
its old beside its new and the key moments: the Chanter's lightning (the old jumping on to two stand-ins; now one bolt and a crackle
of static, and on to another player); the Physician's operation (the old field and its strike; now the dark, the spotlight, his
instruments round it and their close); the masked dancers' old spin kept (the game's own frames beside those in the new set); the king's
knight's banner's reach (3.5 tiles; now 7). The old pictures are made by the branch before these changes (f4e6a3d), the new by
tools/action_fixes3_film.ts (stills) and tools/action_fixes3_frames.ts.
   python3 tools/action_fixes3_sheet.py <old dir> <new stills dir> <dancer frames dir> <out.png>"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

old, new, frames, out = sys.argv[1:5]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (20, 18, 30)
CELL = (24, 22, 36)
PALE, GREY, PINK, GOLD = (240, 232, 214), (186, 180, 204), (255, 122, 168), (236, 196, 110)
big, mid, small = ImageFont.truetype(B, 30), ImageFont.truetype(B, 22), ImageFont.truetype(R, 17)
W = 1200
CW, CH = 585, 329


def still(d, name, box=None):
    im = Image.open(os.path.join(d, name)).convert('RGB')
    if box:
        im = im.crop(box)
    return im.resize((CW, CH), Image.LANCZOS if box is None else Image.LANCZOS)


def pair(left, right, lcap, rcap, ltag='BEFORE', rtag='NOW'):
    blk = Image.new('RGB', (W, CH + 64), BG)
    d = ImageDraw.Draw(blk)
    for j, (im, cap, tag) in enumerate([(left, lcap, ltag), (right, rcap, rtag)]):
        x = 10 + j * (CW + 10)
        if im is None:
            continue
        blk.paste(im, (x, 0))
        d.text((x + 2, CH + 6), tag + ': ', font=small, fill=PINK if tag == 'NOW' else GREY)
        w = d.textlength(tag + ': ', font=small)
        lines = cap.split('\n')
        for k, ln in enumerate(lines):
            d.text((x + 2 + (w if k == 0 else 0), CH + 6 + 22 * k), ln, font=small, fill=PALE if tag == 'NOW' else GREY)
    return blk


def title(text, line):
    blk = Image.new('RGB', (W, 74), BG)
    d = ImageDraw.Draw(blk)
    d.text((14, 8), text, font=mid, fill=PALE)
    d.text((14, 42), line, font=small, fill=GOLD)
    return blk


def figs(names, k=2.0):
    ims = []
    for n in names:
        # (the frames are written without their see-through: what is pure black is the canvas's empty)
        rgb = Image.open(os.path.join(frames, n)).convert('RGB')
        im = rgb.convert('RGBA')
        im.putalpha(Image.eval(rgb.convert('L'), lambda v: 255 if v > 0 else 0))
        bb = im.getchannel('A').getbbox()
        ims.append(im.crop(bb) if bb else im)
    k = min(k, 182 / max(im.width for im in ims), 236 / max(im.height for im in ims))
    return [im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.NEAREST) for im in ims]


blocks = []
head = Image.new('RGB', (W, 92), BG)
d = ImageDraw.Draw(head)
d.text((14, 10), 'FOUR CHANGES FROM YOUR LOOK AT THE FILMS', font=big, fill=PALE)
d.text((14, 56), 'Each one’s old beside its new, then its key moments.', font=small, fill=GREY)
blocks.append(head)

# 1. THE CHANTER
blocks.append(title('1. THE CHANTER’S LIGHTNING (floors 6–10)', 'It jumps only to other players: never to your animals or to monsters'))
zoom = Image.open(os.path.join(new, 'p0_1.32.png')).convert('RGB').crop((500, 170, 900, 395)).resize((CW, CH), Image.LANCZOS)
blocks.append(pair(still(old, 'old_chain_b.png'), still(new, 'p0_1.32.png'), 'it jumped on to anyone near you', 'alone: one bolt down onto you'))
blocks.append(pair(zoom, still(new, 'p3_1.40.png'), 'a crackle of static round you a moment', 'with another player near you, it jumps on to them', 'NOW', 'NOW'))

# 2. THE PHYSICIAN
A = (150, 20, 1050, 527)
blocks.append(title('2. THE PHYSICIAN’S OPERATION (floor 14)', 'The mark fills in 1.4 s (was 2.2) · get out of the light in 1.2 s, before his instruments close'))
blocks.append(pair(still(old, 'old_op_held.png', A), still(new, 'p4_6.43.png', A), 'the field marked, his lens flaring, held', 'the room goes dark, one spotlight on you,\nhis instruments round its edge, held'))
blocks.append(pair(still(old, 'old_op_strike.png', A), still(new, 'p4_6.94.png', A), 'the strike: the light burnt into the field', 'the strike: they close in from all round\nin 2 frames (here the knight got out)'))
blocks.append(pair(still(new, 'p7_1.55.png'), still(new, 'p7_1.79.png'), 'caught in the light: scalpels, saws,\nforceps, needles, knives ringing you', 'one huge strike; then stuck in the boards,\nand the light back', 'CLOSE', 'CLOSE'))

# 3. THE DANCERS
blocks.append(title('3. THE MASKED DANCERS (floor 17)', 'A dancer whose partner is gone just spins into you as before: the very same frames, kept with the new throw'))
both = figs(['game_spin_0.png', 'game_spin_1.png', 'game_spin_2.png', 'kept_spin_0.png', 'kept_spin_1.png', 'kept_spin_2.png'])
g, k_ = both[:3], both[3:]
fh = max(im.height for im in g + k_) + 12
blk = Image.new('RGB', (W, fh + 40), BG)
d = ImageDraw.Draw(blk)
for j, im in enumerate(g + k_):
    x = 10 + j * 196 + (8 if j >= 3 else 0)
    d.rectangle([x, 0, x + 188, fh], fill=CELL)
    blk.paste(im, (x + (188 - im.width) // 2, fh - im.height - 6), im)
d.line([(598, 0), (598, fh)], fill=PINK, width=2)
d.text((12, fh + 8), 'BEFORE: the spin, as the game has it', font=small, fill=GREY)
d.text((610, fh + 8), 'NOW: the same spin, kept for a dancer alone', font=small, fill=PALE)
blocks.append(blk)

# 4. THE BANNER
H4 = (180, 60, 980, 511)
blocks.append(title('4. THE KING’S KNIGHT’S BANNER (floor 19)', 'Its reach about twice as big: 7 tiles round · most of a fight inside it · you can still pull them out'))
blocks.append(pair(still(old, 'old_banner.png', H4), still(new, 'p9_4.60.png', H4), '3.5 tiles round', '7 tiles round: a wide gold ring at its edge, a faint\nglow within; one of them pulled out after you'))

Hs = sum(b.height + 8 for b in blocks)
sheet = Image.new('RGB', (W, Hs), BG)
y = 0
for b in blocks:
    sheet.paste(b, (0, y))
    y += b.height + 8
sheet.save(out, optimize=True)
print(out, sheet.size)
