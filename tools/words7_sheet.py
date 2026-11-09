#!/usr/bin/env python3
"""THE SEVEN NEW WORDS' LOOKS, STEP 1 (docs/mockups/words7/pictures/words7_looks.png), for the owner's phone: a row for each word:
its rune stone as the game cuts it (big, and at the game's size), its name in its colour, its six tones; then a still of each of its
three sides at work in the practice room (in front, behind, on a monster), at the game's size and again at twice. The stills are the
game's own pictures (tools/scenarios/words7_looks.mjs, render/words7.ts switched on for its page), four screen pixels to a game pixel;
at the game's size here a game pixel is two of the sheet's (as the knight and the monsters are on his other sheets), at twice four.
   python3 tools/words7_sheet.py <stills dir and prefix, e.g. /dev/shm/w7/s> <out.png>"""
import base64
import io
import json
import sys
from PIL import Image, ImageDraw, ImageFont

pre, out = sys.argv[1:3]
B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
R = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG = (20, 18, 30)
BAND = (30, 27, 44)
PALE, GREY, PINK, CYAN = (240, 232, 214), (176, 170, 196), (255, 122, 168), (92, 232, 248)
huge, big, mid, small, tiny = (ImageFont.truetype(B, 34), ImageFont.truetype(B, 30), ImageFont.truetype(B, 19), ImageFont.truetype(R, 17), ImageFont.truetype(R, 14))
W = 1200
CW, CH = 392, 216
GAP = 6

WORDS = {
    'piercing': ('PIERCING', 'Dex', '#b4b4ae', ['#14161a', '#3a3e44', '#767a7c', '#b4b4ae', '#eef0f2', '#ffffff'], 'polished steel and white light', 'a needle through a ring'),
    'bleeding': ('BLEEDING', 'Str', '#800818', ['#140105', '#300309', '#56060f', '#800818', '#d0182c', '#ff8a7a'], 'deep arterial red, bright where it runs fresh', 'a drop split by a cut'),
    'reaping': ('REAPING', 'Int', '#6c8a78', ['#0c1410', '#1e3026', '#3e5a4a', '#6c8a78', '#cfe6d4', '#f4fff6'], 'the grey-green of grave moss, pale soul-light', 'a sickle'),
    'culling': ('CULLING', 'Str', '#787890', ['#100c18', '#262036', '#4a4462', '#787890', '#e6dcc8', '#fffaf0'], 'dusk violet, and bone', 'an executioner’s axe over a line'),
    'surging': ('SURGING', 'Int', '#2a4a9a', ['#060c22', '#0e1c4a', '#1a3070', '#2a4a9a', '#a8c4ff', '#ffffff'], 'a storm’s deep blue, and its white', 'three arcs rising'),
    'plundering': ('PLUNDERING', 'Dex', '#907806', ['#1a1404', '#3a2e08', '#5e4c06', '#907806', '#c8c47a', '#f4f0d0'], 'old coin and dark brass (kept clear of the enemy’s gold)', 'a coin in a grasping hand'),
    'mirroring': ('MIRRORING', 'Int', '#b4d2c6', ['#0e1614', '#2a3a36', '#647c74', '#b4d2c6', '#e8f6f0', '#ffffff'], 'silver glass, the cool green of a mirror’s edge', 'two facing halves'),
}
CAPS = {
    'piercing': ['IN FRONT: his blow goes on through the first, a streak of white light punching through each behind it',
                 'BEHIND: half a second after, a lance of light slams down along the line, and leaves a crack',
                 'ON A MONSTER: its shot comes through the wall at him, the stone lit pink where it passes'],
    'bleeding': ['IN FRONT: what he struck bleeds: the wound, the spurt, drops left where it walks (twice as many walking)',
                 'BEHIND: dark red briars burst up out of the floor and cut whatever walks in them',
                 'ON A MONSTER: its blow cuts him, in the enemy’s pink and gold, and he bleeds'],
    'reaping': ['IN FRONT: the kill’s soul is torn out of it and flies to him (a second off his cooldowns)',
                'BEHIND: the kill rises as a spirit and fights for him for 6 s: pale soul-light, its edge his cyan',
                'ON A MONSTER: dead, it lurches up again once, the enemy’s fire licking round it'],
    'culling': ['IN FRONT: one left under 15% is cut down at once: a scything slash, split along the cut',
                'BEHIND: the reaper’s mark, a hooded blade, takes the first weak one to cross it: a blade rises through it',
                'ON A MONSTER: while he is low its blows flare: it burns pink, and its blow bursts on him'],
    'surging': ['IN FRONT: every third use, a ring of force bursts out round him, the dust shoved before it',
                'BEHIND: his dodge lets out a surge where he left the floor, wind streaming along his roll',
                'ON A MONSTER: a pink ring warns where it will reach; then its shockwave'],
    'plundering': ['IN FRONT: coins spray from the kill, and sometimes an extra piece (here a ring)',
                   'BEHIND: gold bursts from the kill and streams into his purse',
                   'ON A MONSTER: its blow snatches his coins on hooks of pink light; they clink in it till it dies'],
    'mirroring': ['IN FRONT: his reflection in glass beside him makes the same swing, weaker; its edge his cyan',
                  'BEHIND: a pane of mirror stands where he stood; in it he swings again (then it shatters)',
                  'ON A MONSTER: struck, it cracks like a mirror and shards of pink glass fly back into him'],
}
SIDES = ['front', 'behind', 'monster']


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def crop(word, side, mode):
    name = f'{pre}_{word}_{side}'
    im = Image.open(name + '.png').convert('RGB')
    note = json.load(open(name + '.json'))
    s = im.width / note['w']
    gw, gh, k = (CW / 2, CH / 2, 2) if mode == 'focus' else (CW / 4, CH / 4, 4)
    fx, fy = note[mode]['x'], note[mode]['y']
    box = (round((fx - gw / 2) * s), round((fy - gh / 2) * s), round((fx + gw / 2) * s), round((fy + gh / 2) * s))
    c = im.crop(box)
    # four screen pixels a game pixel: halved (game size) with a box filter, or kept (twice)
    return c.resize((CW, CH), Image.BOX if k == 2 else Image.NEAREST)


def rune(word):
    note = json.load(open(f'{pre}_rune_{word}.json'))
    data = note['png'].split(',', 1)[1]
    return Image.open(io.BytesIO(base64.b64decode(data))).convert('RGBA')


def wrap(d, text, font, width):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


blocks = []
head = Image.new('RGB', (W, 118), BG)
d = ImageDraw.Draw(head)
d.text((14, 10), 'THE SEVEN NEW WORDS: THEIR LOOKS', font=huge, fill=PALE)
d.text((14, 56), 'Each word’s rune stone and colours, then a still of each of its three sides at work in the practice room:', font=small, fill=GREY)
d.text((14, 80), 'first at the game’s size, then twice as big. Stills only: the films come next.', font=small, fill=GREY)
blocks.append(head)

for word, (name, stat, col, ramp, colour_is, rune_is) in WORDS.items():
    # its band: the stone big and at the game's size, its name in its colour, its tones
    band = Image.new('RGB', (W, 120), BAND)
    d = ImageDraw.Draw(band)
    st = rune(word)
    bigst = st.resize((st.width * 8, st.height * 8), Image.NEAREST)
    band.paste(bigst, (10, 12), bigst)
    small_st = st.resize((st.width * 2, st.height * 2), Image.NEAREST)
    band.paste(small_st, (112, 74), small_st)
    d.text((112, 52), 'game size', font=tiny, fill=GREY)
    d.text((200, 10), name, font=big, fill=hexrgb(col) if sum(hexrgb(col)) > 200 else hexrgb(ramp[4]))
    nw = d.textlength(name, font=big)
    d.text((200 + nw + 14, 22), f'({stat})  its rune: {rune_is}', font=small, fill=PALE)
    d.text((200, 50), 'its colour: ' + colour_is, font=small, fill=GREY)
    for j, c in enumerate(ramp):
        x = 200 + j * 62
        d.rectangle((x, 78, x + 56, 104), fill=(10, 8, 14))
        d.rectangle((x + 2, 80, x + 54, 102), fill=hexrgb(c))
    d.text((200 + 3 * 62 + 6, 104), 'colour', font=tiny, fill=PALE)
    d.text((200 + 4 * 62 + 12, 104), 'glow', font=tiny, fill=PALE)
    d.text((200 + 6 * 62 + 14, 80), col, font=small, fill=PALE)
    blocks.append(band)
    # the three captions
    capb = Image.new('RGB', (W, 72), BG)
    d = ImageDraw.Draw(capb)
    for j, cap in enumerate(CAPS[word]):
        x = 6 + j * (CW + GAP)
        tag, rest = cap.split(': ', 1)
        d.text((x + 2, 6), tag, font=mid, fill=PINK if tag == 'ON A MONSTER' else PALE)
        for k, ln in enumerate(wrap(d, rest, tiny, CW - 6)[:3]):
            d.text((x + 2, 30 + 16 * k), ln, font=tiny, fill=GREY)
    blocks.append(capb)
    for mode, label in (('focus', 'game size'), ('close', 'twice')):
        row = Image.new('RGB', (W, CH + GAP), BG)
        for j, side in enumerate(SIDES):
            im = crop(word, side, mode)
            dd = ImageDraw.Draw(im)
            tw = dd.textlength(label, font=tiny)
            dd.rectangle((CW - tw - 10, CH - 20, CW, CH), fill=(12, 10, 18))
            dd.text((CW - tw - 5, CH - 19), label, font=tiny, fill=GREY)
            row.paste(im, (6 + j * (CW + GAP), 0))
        blocks.append(row)
    blocks.append(Image.new('RGB', (W, 10), BG))

foot = Image.new('RGB', (W, 66), BG)
d = ImageDraw.Draw(foot)
d.text((14, 8), 'What fights for him shows it by his cyan (the spirit, the reflection, the mirror). Every monster’s side is in the', font=tiny, fill=GREY)
d.text((14, 26), 'enemy’s pink and gold. Each colour is at least 12 from every other word’s, the melds’, his cyan and the enemy’s pink', font=tiny, fill=GREY)
d.text((14, 44), 'and gold, as the eye sees colour.', font=tiny, fill=GREY)
blocks.append(foot)

H = sum(b.height for b in blocks)
sheet = Image.new('RGB', (W, H), BG)
y = 0
for b in blocks:
    sheet.paste(b, (0, y))
    y += b.height
sheet.save(out, optimize=True)
print(out, sheet.size)
